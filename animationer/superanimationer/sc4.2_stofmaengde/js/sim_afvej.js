/* =====================================================================
   sim_afvej.js - fane 3: afvejning

   En ordre siger en stofmaengde af et grundstof, fx 0,250 mol kobber.
   Krukken med stoffet staar paa bordet, og molarmassen staar paa dens
   etiket. Eleven skriver massen (m = n · M), og saa haelder krukken
   stoffet i vejebaaden, og vaegten taeller op til massen. Til sidst
   skriver eleven antallet af atomer (N = n · N_A) som et tal gange en
   potens af 10, og displayet skifter til antallet.

   Knappen giver foerst et hint og saa svaret. Et forkert tal giver en
   besked, der passer til fejlen (js/tjek.js). En ordre, der er loest uden
   at se svaret, faar en stjerne. Fremskridtet huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc4.2-afvej";
    /* Haeldningen: krukken loeftes hen over vejebaaden, haelder og saettes tilbage */
    var LOEFT = 0.45, HAELD = 1.0, TILBAGE = 0.5;
    var HAELD_TID = LOEFT + HAELD + TILBAGE;
    var VINKEL = 1.95;
    var TAEL_TID = 0.9;

    function SimAfvej() {
        this.L = new NK.Laerred(NK.el("afvej-laerred"));
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = D.ORDRER.map(function (o) {
            var s = gemt[o.nr];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rost = {};
        this.over = null;
        this.lay = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.valgt = -1;
        this.opg = null;
        this.fremhaev = null;

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.vaelg(this.naesteUloeste(-1));
    }

    var P = SimAfvej.prototype;

    /* ----- Hukommelse ------------------------------------------------------ */
    P.gem = function () {
        var ud = {}, mig = this;
        D.ORDRER.forEach(function (o, i) {
            var s = mig.status[i];
            if (s.loest) ud[o.nr] = { l: 1, s: s.stjerne ? 1 : 0 };
        });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function (niveau) {
        var n = 0, mig = this;
        D.ORDRER.forEach(function (o, i) {
            if ((niveau === undefined || o.niveau === niveau) && mig.status[i].loest) n++;
        });
        return n;
    };

    P.antalStjerner = function (niveau) {
        var n = 0, mig = this;
        D.ORDRER.forEach(function (o, i) {
            if ((niveau === undefined || o.niveau === niveau) && mig.status[i].stjerne) n++;
        });
        return n;
    };

    P.iNiveau = function (niveau) {
        return D.ORDRER.filter(function (o) { return o.niveau === niveau; }).length;
    };

    P.naesteUloeste = function (fra) {
        var n = D.ORDRER.length;
        for (var d = 1; d <= n; d++) {
            var i = (fra + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return (fra + 1 + n) % n;
    };

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.88);
        var pb = NK.klamp(W * 0.3, 150, 300);
        lay.plakat = { x: kant, y: kant, b: pb, h: Math.round(pb * 0.4) };
        var fri = lay.bordY - lay.plakat.y - lay.plakat.h - 24;
        lay.krukkeH = NK.klamp(Math.min(H * 0.36, fri * 0.8, W * 0.28), 80, 230);
        lay.krukke = { x: Math.round(W * 0.3), y: lay.bordY };
        /* Vaegten maa ikke vaere saa stor, at krukken ikke kan haelde over den */
        var vb = NK.klamp(Math.min(W * 0.34, fri * 1.3, H * 0.5), 150, 320);
        lay.vaegtB = vb;
        lay.vaegt = { x: Math.round(NK.klamp(W * 0.68, lay.krukke.x + Tg.krukkeBredde(lay.krukkeH) / 2 + vb / 2 + 20, W - kant - vb / 2)), y: lay.bordY };
        lay.skaal = Tg.vaegtSkaal(lay.vaegt.x, lay.bordY, vb);
        lay.baadB = lay.skaal.b * 0.82;
        lay.kop = { x: Math.max(kant + 24, lay.krukke.x - Tg.krukkeBredde(lay.krukkeH) / 2 - 56), y: lay.bordY };
        this.lay = lay;

        var kb = Tg.krukkeBredde(lay.krukkeH), vh = Tg.vaegtHoejde(vb);
        this.saetAnker("afvej-anker-krukke", lay.krukke.x - kb / 2, lay.bordY - lay.krukkeH, kb, lay.krukkeH);
        this.saetAnker("afvej-anker-vaegt", lay.vaegt.x - vb / 2, lay.bordY - vh - vb * 0.25, vb, vh + vb * 0.25);
        this.saetAnker("afvej-anker-plakat", lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* ----- Panelet ---------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            raekker: NK.el("afvej-raekker"),
            besked: NK.el("afvej-besked"),
            knap: NK.el("afvej-knap"),
            kort: NK.el("afvej-kort"),
            niveauer: NK.el("afvej-niveauer"),
            nulstil: NK.el("afvej-nulstil")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("afvej-spring").addEventListener("click", function () { mig.springIntro(); mig.fokus(); });

        D.ORDRE_NIVEAUER.forEach(function (nv, nr) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje";
            knap.innerHTML = '<span class="hl-farve" style="background:' + nv.farve + '"></span>' +
                '<span class="hl-navn">' + nv.navn + '<em>' + nv.kort + '</em></span>' +
                '<span class="hl-tal" id="afvej-n-tal-' + nr + '"></span>' +
                '<span class="hl-stjerner" id="afvej-n-stj-' + nr + '"></span>';
            knap.addEventListener("click", function () { mig.vaelgNiveau(nr); });
            mig.el.niveauer.appendChild(knap);
        });

        this.nulstilSikker = 0;
        this.el.nulstil.addEventListener("click", function () {
            if (mig.nulstilSikker > 0) {
                mig.nulstilSikker = 0;
                mig.nulstilAlt();
            } else {
                mig.nulstilSikker = 3;
            }
            mig.visNulstil();
        });
    };

    P.visNulstil = function () {
        NK.saetHTML("afvej-nulstil", this.nulstilSikker > 0
            ? "<span>Sikker? Klik igen</span><span class=\"tegn\">↺</span>"
            : "<span>Start forfra</span><span class=\"tegn\">↺</span>");
    };

    P.vaelgNiveau = function (nr) {
        var foerste = -1;
        for (var i = 0; i < D.ORDRER.length; i++) {
            if (D.ORDRER[i].niveau !== nr) continue;
            if (foerste < 0) foerste = i;
            if (!this.status[i].loest) { this.vaelg(i); return; }
        }
        this.vaelg(foerste);
    };

    P.opdaterFremskridt = function () {
        for (var n = 0; n < D.ORDRE_NIVEAUER.length; n++) {
            NK.saetTekst("afvej-n-tal-" + n, this.antalLoest(n) + "/" + this.iNiveau(n));
            var s = this.antalStjerner(n);
            NK.saetTekst("afvej-n-stj-" + n, s ? "★ " + s : "");
        }
        NK.saetTekst("afvej-loest", String(this.antalLoest()));
    };

    /* ----- Opgaven ---------------------------------------------------------------- */
    P.vaelg = function (i) {
        if (i === this.valgt && this.opg) return;
        this.valgt = i;
        this.nyOpgave(this.status[i].loest);
    };

    P.nyOpgave = function (gennemsyn) {
        var o = D.ORDRER[this.valgt];
        var felter = [{ slags: "m" }, { slags: "N" }];
        felter.forEach(function (f, i) { f.i = i; f.status = "laast"; f.forsoeg = 0; });
        this.opg = { o: o, felter: felter, k: 0, hjaelp: 0, brugtSvar: false, faerdig: false, gennemsyn: !!gennemsyn };
        this.fremhaev = null;
        this.haeldT = -1;
        this.taelT = -1;
        this.besked("", "");
        if (gennemsyn) {
            felter.forEach(function (f) { f.status = "ok"; });
            this.opg.k = felter.length;
            this.opg.faerdig = true;
            this.haeldT = 99;
            this.taelT = 99;
            this.besked(this.status[this.valgt].stjerne ? "Afvejet uden hjælp. ★" : "Afvejet.", "god");
        } else {
            felter[0].status = "aktiv";
        }
        this.bygRaekker();
        this.visKort();
        this.visStatus();
        if (!gennemsyn) this.fokus();
    };

    P.aktivtFelt = function () {
        var o = this.opg;
        return o && !o.faerdig ? o.felter[o.k] : null;
    };

    /* Den faerdige beregning i en raekke */
    P.facitTekst = function (f) {
        var o = this.opg.o;
        if (f.slags === "m") return D.regnMasse(o.st, o.n, o.nTekst, "<b>" + o.mTekst + "</b>");
        return D.regnAntal(o.n, o.nTekst, "<b>" + o.NTekst + "</b>");
    };

    P.bygRaekker = function () {
        var mig = this, o = this.opg;
        var vaert = this.el.raekker;
        vaert.innerHTML = "";
        o.felter.forEach(function (f) {
            var rk = document.createElement("div");
            rk.className = "raekke";
            var etiket = f.slags === "m" ? "Massen" : "Antal atomer";
            var enhed = f.slags === "m" ? "m" : "N";
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + etiket + '</span>' +
                '<span class="raekke-del">' + enhed + '</span></div><div class="felter"></div>';
            var fe = document.createElement("div");
            f.feltEl = fe;
            f.input = null;
            f.eks = null;
            if (f.status === "ok" || f.status === "svar") {
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-svar">' + mig.facitTekst(f) + '</span><span class="felt-maerke">' +
                    (f.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                var aktiv = f.status === "aktiv";
                var fra = aktiv ? "" : " disabled";
                fe.className = "felt " + f.status + (f.slags === "N" ? " potensfelt" : "");
                if (f.slags === "m") {
                    fe.innerHTML = '<span class="felt-pre">m =</span>' +
                        '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Massen i gram" placeholder="massen"' + fra + '>' +
                        '<span class="felt-efter">g</span>';
                } else {
                    fe.innerHTML = '<span class="felt-pre">N =</span>' +
                        '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Tallet foran potensen" placeholder="tal" class="mant"' + fra + '>' +
                        '<span class="felt-gange">· 10</span>' +
                        '<input type="text" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="Potensen" class="eks"' + fra + '>';
                }
                fe.innerHTML += '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' + fra + '>↵</button>';
                var inputs = fe.querySelectorAll("input");
                Array.prototype.forEach.call(inputs, function (inp) {
                    inp.addEventListener("keydown", function (e) {
                        if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                    });
                });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                f.input = inputs[0];
                f.eks = inputs[1] || null;
            }
            rk.querySelector(".felter").appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    P.fokus = function () {
        var f = this.aktivtFelt();
        if (f && f.input && NK.el("fane-afvej").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    P.visKort = function () {
        var o = this.opg, ordre = o.o;
        var nv = D.ORDRE_NIVEAUER[ordre.niveau];
        NK.saetHTML("afvej-niveau", '<span class="hyldeprik" style="background:' + nv.farve + '"></span>' + nv.navn);
        NK.saetTekst("afvej-nr", String(ordre.plads + 1));
        NK.saetTekst("afvej-antal-i-niveau", String(this.iNiveau(ordre.niveau)));
        NK.saetTekst("afvej-prompt", ordre.nTekst + " mol " + ordre.st.navn);
        NK.saetTekst("afvej-spm", "Hvad skal vægten vise, og hvor mange atomer er det?");
        this.el.kort.classList.toggle("sejr", o.faerdig && !o.gennemsyn);
        this.visKnap();
        this.opdaterFremskridt();
    };

    P.visKnap = function () {
        var o = this.opg, tekst, klasse = "knap blaa";
        if (o.faerdig) {
            if (o.gennemsyn) tekst = "Afvej igen";
            else { tekst = "Næste ordre →"; klasse += " banker"; }
        } else {
            tekst = o.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            klasse = "knap";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visStatus = function () {
        var o = this.opg;
        if (!o) return;
        var ordre = o.o, f = this.aktivtFelt();
        if (o.faerdig) {
            NK.saetHTML("afvej-status", "<b>" + NK.html(ordre.nTekst + " mol " + ordre.st.navn) + "</b> vejer " +
                NK.html(ordre.mTekst) + " g og er " + NK.html(ordre.NTekst) + " atomer.");
        } else if (f && f.slags === "N") {
            NK.saetHTML("afvej-status", "Vægten afvejer " + NK.html(Tg.gram(ordre.vaegt)) + ". Skriv antallet af atomer til højre.");
        } else {
            NK.saetHTML("afvej-status", "Skriv massen til højre. Molarmassen står på krukken.");
        }
    };

    P.hjaelp = function (f) {
        var o = this.opg.o;
        if (f.slags === "m") {
            return {
                hint: "m = n · M = " + NK.html(D.regnMasse(o.st, o.n, o.nTekst).replace(/^m = /, "")) + ". Molarmassen står på krukken.",
                svar: this.facitTekst(f) + ".",
                fremhaev: "krukke"
            };
        }
        return {
            hint: "N = n · N<sub>A</sub> = " + NK.html(D.regnAntal(o.n, o.nTekst).replace(/^N = /, "")) + ". N<sub>A</sub> står på plakaten.",
            svar: this.facitTekst(f) + ".",
            fremhaev: "plakat"
        };
    };

    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) {
            if (o.gennemsyn) this.nyOpgave(false);
            else this.vaelg(this.naesteUloeste(this.valgt));
            return;
        }
        var f = this.aktivtFelt();
        var h = this.hjaelp(f);
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.besked("<b>Hint:</b> " + h.hint, "gul");
            this.fremhaev = h.fremhaev;
            this.visKnap();
            this.fokus();
        } else {
            o.brugtSvar = true;
            this.feltRigtigt(f, "svar");
            this.besked(h.svar, "gul");
        }
    };

    P.tjek = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!f) return;
        var res = f.slags === "m"
            ? Tj.masse(f.input ? f.input.value : "", o.o)
            : Tj.antal(f.input ? f.input.value : "", f.eks ? f.eks.value : "", o.o);
        if (res.tom) { this.besked(res.besked, ""); this.fokus(); return; }
        if (res.ok) {
            this.feltRigtigt(f, "ok");
            if (res.note) this.besked(res.note, "gul");
            return;
        }
        f.forsoeg++;
        this.besked(res.besked, "skidt");
        if (f.feltEl) {
            f.feltEl.classList.remove("ryst");
            void f.feltEl.offsetWidth;
            f.feltEl.classList.add("ryst");
        }
        this.fokus();
    };

    P.feltRigtigt = function (f, maade) {
        var o = this.opg;
        f.status = maade;
        o.hjaelp = 0;
        this.fremhaev = null;
        if (maade === "ok") this.besked("", "");
        if (this.afvisTilbud) this.afvisTilbud();
        if (f.slags === "m") this.haeldT = 0;
        if (f.slags === "N") this.taelT = 0;
        if (o.k >= o.felter.length - 1) {
            o.k = o.felter.length;
            this.loes();
        } else {
            o.k++;
            o.felter[o.k].status = "aktiv";
        }
        this.bygRaekker();
        this.visKort();
        this.visStatus();
        this.fokus();
    };

    P.loes = function () {
        var o = this.opg, i = this.valgt;
        o.faerdig = true;
        var s = this.status[i];
        var foer = s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || !o.brugtSvar;
        this.gem();
        var nv = D.ORDRER[i].niveau;
        if (!foer && this.antalLoest(nv) === this.iNiveau(nv) && !this.rost[nv]) {
            this.rost[nv] = true;
            this.ventRos = { t: 2.2, niveau: nv, alt: this.antalLoest() === D.ORDRER.length };
        }
    };

    P.nulstil = function () {
        if (!this.opg) return;
        if (this.opg.faerdig && !this.opg.gennemsyn) return;
        this.nyOpgave(false);
    };

    P.nulstilAlt = function () {
        this.status.forEach(function (s) { s.loest = false; s.stjerne = false; });
        this.rost = {};
        this.gem();
        this.valgt = -1;
        this.opg = null;
        this.vaelg(0);
    };

    P.enter = function () {
        if (this.opg && this.opg.faerdig && !this.opg.gennemsyn) this.knap();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }
        if (this.haeldT >= 0 && this.haeldT < 99) this.haeldT = Math.min(99, this.haeldT + dt);
        if (this.taelT >= 0 && this.taelT < 99) this.taelT = Math.min(99, this.taelT + dt);
        if (this.ventRos) {
            this.ventRos.t -= dt;
            if (this.ventRos.t <= 0 && this.laererNiveau) {
                var v = this.ventRos;
                this.ventRos = null;
                this.laererNiveau(v.niveau, v.alt);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Hvor meget der er haeldt i (0-1) */
    P.haeldt = function () {
        return this.haeldT < 0 ? 0 : NK.blod(NK.klamp((this.haeldT - LOEFT) / HAELD, 0, 1));
    };

    /* Krukkens midte og drejning lige nu, og hvor munden er. u: 0 staar
       paa bordet, 1 haelder over vejebaaden. */
    P.krukkePositur = function () {
        var lay = this.lay, h = lay.krukkeH, k = h / NK.Sprites.MAAL.pulverglas.h;
        var t = this.haeldT, u = 0;
        if (t >= 0 && t < HAELD_TID) {
            if (t < LOEFT) u = NK.blod(t / LOEFT);
            else if (t < LOEFT + HAELD) u = 1;
            else u = 1 - NK.blod((t - LOEFT - HAELD) / TILBAGE);
        }
        var d = h / 2 - 22 * k;
        var hvile = { x: lay.krukke.x, y: lay.bordY - h / 2 };
        /* Munden skal ende over vejebaaden, saa hoejt, at glassets kant
           (0,42 · h under munden) gaar fri af baaden */
        var mundMaal = { x: lay.skaal.x - lay.baadB * 0.12, y: lay.skaal.y - lay.baadB * 0.35 - 24 - 0.45 * h };
        var over = { x: mundMaal.x - d * Math.sin(VINKEL), y: mundMaal.y + d * Math.cos(VINKEL) };
        var v = VINKEL * u;
        var c = { x: NK.lerp(hvile.x, over.x, u), y: NK.lerp(hvile.y, over.y, u) - Math.sin(u * Math.PI) * h * 0.12 };
        return { x: c.x, y: c.y, v: v, u: u, i: t >= 0 && t < HAELD_TID,
            mund: { x: c.x + d * Math.sin(v), y: c.y - d * Math.cos(v) } };
    };

    P.display = function () {
        var o = this.opg.o;
        if (this.taelT >= 0.3) {
            var a = NK.klamp((this.taelT - 0.3) / TAEL_TID, 0, 1);
            return { t: Tg.displayAntal(o.N), etiket: "atomer", lys: a < 1 ? 1 : 0.4 };
        }
        var h = this.haeldt();
        return { t: Tg.gram(Math.round(o.vaegt * h)), lys: h > 0 && h < 1 ? 1 : 0 };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.opg) return;
        var o = this.opg.o;
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 7);
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.molPlakat(ctx, lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h, { lys: this.fremhaev === "plakat" ? puls : 0 });
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.4);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        var d = this.display();
        Tg.vaegt(ctx, lay.vaegt.x, lay.vaegt.y, lay.vaegtB, d.t, { lys: d.lys, etiket: d.etiket });
        var h = this.haeldt();
        var hoejde = Tg.bunkeHoejde(lay.baadB, D.rumfang(o.st, o.vaegt));
        var b = Tg.bunke(ctx, lay.skaal.x, lay.skaal.y + 1, lay.baadB, o.st, h, hoejde, o.nr);

        /* Krukken: paa bordet, eller loeftet og drejet over vejebaaden.
           Mens der haeldes, ligger laaget, hvor krukken stod. */
        var kp = this.krukkePositur();
        if (kp.i) Tg.laag(ctx, lay.krukke.x, lay.bordY, Tg.krukkeBredde(lay.krukkeH));
        ctx.save();
        ctx.translate(kp.x, kp.y);
        ctx.rotate(kp.v);
        Tg.krukke(ctx, 0, lay.krukkeH / 2, lay.krukkeH, o.st, {
            fremhaev: this.fremhaev === "krukke" ? puls : 0,
            lys: this.pegKrukke ? 1 : 0,
            udenLaag: kp.i,
            udenSkygge: kp.u > 0.02
        });
        ctx.restore();

        /* Kornene falder fra munden ned i vejebaaden */
        var th = this.haeldT - LOEFT;
        if (kp.i && th > 0 && th < HAELD) {
            var r = Tg.froe(o.nr + 3), FALD = 0.3;
            for (var i = 0; i < 40; i++) {
                var start = r() * (HAELD - FALD), spredt = r() - 0.5;
                var t = (th - start) / FALD;
                if (t < 0 || t > 1) continue;
                var x = kp.mund.x + spredt * 10 + (lay.skaal.x - kp.mund.x) * t * 0.6;
                var y = NK.lerp(kp.mund.y, b.top, t * t);
                ctx.fillStyle = Tg.nuance(o.st.farve, spredt > 0 ? 0.25 : -0.1);
                ctx.fillRect(x - 2, y - 2, 4, 4);
            }
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) {
            return { slags: "kop" };
        }
        var kb = Tg.krukkeBredde(lay.krukkeH), p = lay.plakat;
        if (pt.x >= p.x && pt.x <= p.x + p.b && pt.y >= p.y && pt.y <= p.y + p.h) return { slags: "plakat" };
        if (Math.abs(pt.x - lay.krukke.x) <= kb / 2 && pt.y <= lay.bordY && pt.y >= lay.bordY - lay.krukkeH) return { slags: "krukke" };
        if (Math.abs(pt.x - lay.vaegt.x) <= lay.vaegtB / 2 && pt.y <= lay.bordY && pt.y >= lay.bordY - Tg.vaegtHoejde(lay.vaegtB) - lay.vaegtB * 0.25) {
            return { slags: "vaegt" };
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            c.style.cursor = mig.over ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "kop" && mig.klikKop) { mig.klikKop(); return; }
            var o = mig.opg, f = mig.aktivtFelt();
            /* Krukken og vaegten svarer med det, de kan fortaelle */
            if (u.slags === "plakat") {
                mig.besked("Plakaten: 1 mol er 6,02 · 10²³ atomer. Det er Avogadros konstant, <i>N</i><sub>A</sub>.", "");
            } else if (u.slags === "krukke") {
                mig.besked("Krukken: " + NK.html(o.o.st.navn) + ", M = " + NK.komma(o.o.st.M) + " g/mol.", "");
            } else if (u.slags === "vaegt") {
                if (f && f.slags === "m") mig.besked("Vægten afvejer, når massen til højre er rigtig.", "");
                else if (f) mig.besked("Vægten tæller atomerne, når antallet til højre er rigtigt.", "");
            }
            mig.fokus();
        });
    };

    /* ----- Kemichaels praesentation ---------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc4.2-intro-afvej", tilbud: "afvej-tilbud", spring: "afvej-spring" });

    /* Mens han siger, at molarmassen staar paa krukken, lyser krukken */
    P.pegPaaFelt = function (til) { this.pegKrukke = til; };

    NK.SimAfvej = SimAfvej;
}());
