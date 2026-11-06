/* =====================================================================
   sim_afvej.js - fane 3: afvejning

   En ordre siger en stofmaengde af et grundstof, fx 0,250 mol kobber.
   Krukken med stoffet staar paa bordet, og molarmassen staar paa dens
   etiket. Eleven skriver massen (m = n · M), og saa haelder krukken
   stoffet i vejebaaden, og vaegten taeller op til massen. Plakaten paa
   vaeggen er formlen med enhederne.

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

    var NOEGLE = "nk-sc5.2-afvej";
    /* Haeldningen: krukken loeftes hen over vejebaaden, haelder og saettes tilbage */
    var LOEFT = 0.45, HAELD = 1.0, TILBAGE = 0.5;
    var HAELD_TID = LOEFT + HAELD + TILBAGE;
    var VINKEL = 1.95;

    function SimAfvej() {
        this.L = new NK.Laerred(NK.el("afvej-laerred"));
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = D.ORDRER.map(function (o) {
            var s = gemt[o.nr];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rost = false;
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
        /* Plakaten begynder under papirkortet */
        lay.zone = this.kortZone();
        lay.plakat = { x: kant, y: lay.zone, b: pb, h: Math.round(pb * 0.4) };
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
        else this.tjekZone();
    };

    /* ----- Panelet ---------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            raekker: NK.el("afvej-raekker"),
            niveauer: NK.el("afvej-niveauer"),
            nulstil: NK.el("afvej-nulstil"),
            igen: NK.el("afvej-igen")
        };
        this.kort = new NK.SceneKort("afvej", {
            hint: function () { mig.hint(); },
            indsend: function () { mig.indsend(); },
            videre: function () { mig.videre(); }
        });
        this.el.besked = this.kort.beskedEl;
        this.el.knap = this.kort.hintEl;
        this.el.indsend = this.kort.indsendEl;
        this.el.igen.addEventListener("click", function () { mig.nyOpgave(false); });

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
        var felter = [{ slags: "m" }];
        felter.forEach(function (f, i) { f.i = i; f.status = "laast"; f.forsoeg = 0; });
        this.opg = { o: o, felter: felter, k: 0, hjaelp: 0, brugtSvar: false, faerdig: false, gennemsyn: !!gennemsyn };
        this.fremhaev = null;
        this.haeldT = -1;
        this.fast = null;
        this.note = "";
        if (gennemsyn) {
            felter.forEach(function (f) { f.status = "ok"; });
            this.opg.k = felter.length;
            this.opg.faerdig = true;
            this.haeldT = 99;
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
    P.facitTekst = function () {
        var o = this.opg.o;
        return D.regnMasse(o.st, o.n, o.nTekst, "<b>" + o.mTekst + "</b>");
    };

    P.bygRaekker = function () {
        var mig = this, o = this.opg;
        var vaert = this.el.raekker;
        vaert.innerHTML = "";
        o.felter.forEach(function (f) {
            var rk = document.createElement("div");
            rk.className = "raekke";
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">Massen</span>' +
                '<span class="raekke-del">m</span></div><div class="felter"></div>';
            var fe = document.createElement("div");
            f.feltEl = fe;
            f.input = null;
            if (f.status === "ok" || f.status === "svar") {
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-svar">' + mig.facitTekst(f) + '</span><span class="felt-maerke">' +
                    (f.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                var aktiv = f.status === "aktiv";
                var fra = aktiv ? "" : " disabled";
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-pre">m =</span>' +
                    '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Massen i gram" placeholder="massen"' + fra + '>' +
                    '<span class="felt-efter">g</span>';
                var inputs = fe.querySelectorAll("input");
                /* Enter i feltet er det samme som Indsend svar paa kortet */
                Array.prototype.forEach.call(inputs, function (inp) {
                    inp.addEventListener("keydown", function (e) {
                        if (e.key === "Enter") { e.preventDefault(); mig.indsend(); }
                    });
                    inp.addEventListener("input", function () { mig.visKnap(); });
                });
                f.input = inputs[0];
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

    /* ----- Papirkortet ----------------------------------------------------------
       Ordren, linjen med naeste skridt, fejl og hint, Giv hint og Indsend
       svar staar paa kortet oeverst i scenen. Feltet, eleven skriver i,
       staar i regnestykket i panelet; Enter i feltet er Indsend svar.
       Naar massen er rigtig, bliver kortet staaende med beregningen og
       knappen Naeste ordre (6. nov. 2026). */
    P.visKort = function () {
        var o = this.opg, ordre = o.o;
        var nv = D.ORDRE_NIVEAUER[ordre.niveau];
        NK.saetTekst("afvej-ordre", ordre.nTekst + " mol " + ordre.st.s);
        this.el.igen.hidden = !o.gennemsyn;
        this.kort.vis({
            kl: o.faerdig ? "loest" + (o.brugtSvar && !o.gennemsyn ? " svar" : "") : "opgave",
            chip: "Ordre " + (ordre.plads + 1) + " af " + this.iNiveau(ordre.niveau) + " · " + nv.navn,
            tekst: NK.html("Afvej " + ordre.nTekst + " mol " + ordre.st.navn + ". Molarmassen står på krukken. Hvad skal vægten vise?")
        });
        if (o.faerdig) {
            var forkl = "<b>" + NK.html(ordre.nTekst + " mol " + ordre.st.navn + " vejer " + ordre.mTekst + " g.") + "</b> " +
                this.facitTekst() + "." + (this.note ? " " + this.note : "");
            var naeste = this.naesteUloesteEllerIngen();
            if (naeste < 0) forkl += " Alle tolv ordrer er afvejet.";
            var maerke = o.gennemsyn ? (this.status[this.valgt].stjerne ? "Afvejet uden hjælp ★" : "Afvejet") :
                (o.brugtSvar ? "Svaret" : "Rigtigt");
            this.kort.bliv(forkl, maerke, naeste >= 0 ? "Næste ordre →" : null, o.brugtSvar && !o.gennemsyn ? "svar" : "god");
        } else {
            this.kort.bliv(null);
            var f = this.fast;
            if (f && f.klasse === "skidt") this.kort.besked('<span class="b-maerke">Ikke endnu</span> ' + f.html, "skidt");
            else if (f && f.html) this.kort.besked(f.html, f.klasse);
            else this.kort.besked("Skriv massen i regnestykket i panelet, og tryk Indsend svar.", "peger");
        }
        this.visKnap();
        this.opdaterFremskridt();
        this.tjekZone();
    };

    P.visKnap = function () {
        var o = this.opg;
        if (!o) return;
        if (o.faerdig) { this.kort.knapper({}); return; }
        var f = this.aktivtFelt();
        var vaerdi = f && f.input ? f.input.value.trim() : "";
        this.kort.knapper({
            hint: o.hjaelp === 0 ? "Giv hint" : "Vis svaret",
            peg: !!(this.fast && this.fast.klasse === "skidt") && o.hjaelp === 0,
            indsend: true, klar: !!vaerdi,
            indsendTekst: vaerdi ? "Indsend svar: " + vaerdi + " g" : "Indsend svar"
        });
    };

    /* besked: linjen paa kortet. Tom: naeste skridt. */
    P.besked = function (html, klasse) {
        this.fast = html ? { html: html, klasse: klasse || "" } : null;
        if (this.opg) this.visKort();
    };

    /* Statuslinjen er vaek: alt staar paa kortet */
    P.visStatus = function () {};

    P.naesteUloesteEllerIngen = function () {
        var n = D.ORDRER.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.valgt + d) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* Kortets plads oeverst i scenen: [almindelig skaerm, lav skaerm] */
    var ZONE = [104, 94];
    P.kortZone = function () { return this.kort.zone(ZONE); };
    P.tjekZone = function () {
        if (this.lay && this.kortZone() !== this.lay.zone) this.layout();
    };

    P.hjaelp = function () {
        var o = this.opg.o;
        return {
            hint: "m = n · M = " + NK.html(D.regnMasse(o.st, o.n, o.nTekst).replace(/^m = /, "")) + ". Molarmassen står på krukken.",
            svar: this.facitTekst() + ".",
            fremhaev: "krukke"
        };
    };

    /* Giv hint, saa Vis svaret */
    P.hint = function () {
        var o = this.opg;
        if (!o || o.faerdig) return;
        var f = this.aktivtFelt();
        var h = this.hjaelp();
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.fremhaev = h.fremhaev;
            this.besked("<b>Hint:</b> " + h.hint, "gul");
            this.fokus();
        } else {
            o.brugtSvar = true;
            this.feltRigtigt(f, "svar");
        }
    };

    /* Knappen, der foerer videre: Naeste ordre */
    P.videre = function () {
        var o = this.opg;
        if (!o || !o.faerdig) return;
        var i = this.naesteUloesteEllerIngen();
        if (i >= 0) this.vaelg(i);
    };

    /* Indsend svar: tjekker feltet i regnestykket */
    P.indsend = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!o || o.faerdig || !f) { this.kort.blink(); return; }
        if (!f.input || !f.input.value.trim()) {
            this.kort.blink();
            this.besked("Skriv først massen i regnestykket i panelet.", "peger");
            this.fokus();
            return;
        }
        this.tjek();
    };

    /* Den gamle knap (selvtesten): videre eller afvej igen, ellers hint */
    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) {
            if (o.gennemsyn) this.nyOpgave(false);
            else this.vaelg(this.naesteUloeste(this.valgt));
            return;
        }
        this.hint();
    };

    P.tjek = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!f) return;
        var res = Tj.masse(f.input ? f.input.value : "", o.o);
        if (res.tom) { this.besked(res.besked, "peger"); this.fokus(); return; }
        if (res.ok) {
            this.note = res.note || "";
            this.feltRigtigt(f, "ok");
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
        if (maade !== "ok") this.note = "";
        this.fast = null;
        if (this.afvisTilbud) this.afvisTilbud();
        this.haeldT = 0;
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
        /* Alle tolv ordrer er afvejet: Kemichael kommer én gang */
        if (!foer && this.antalLoest() === D.ORDRER.length && !this.rost) {
            this.rost = true;
            this.ventRos = 2.2;
        }
    };

    P.nulstil = function () {
        if (!this.opg) return;
        if (this.opg.faerdig && !this.opg.gennemsyn) return;
        this.nyOpgave(false);
    };

    P.nulstilAlt = function () {
        this.status.forEach(function (s) { s.loest = false; s.stjerne = false; });
        this.rost = false;
        this.ventRos = 0;
        this.gem();
        this.valgt = -1;
        this.opg = null;
        this.vaelg(0);
    };

    /* Enter uden for feltet: videre, naar ordren er afvejet */
    P.enter = function () {
        if (this.opg && this.opg.faerdig) this.videre();
        else this.indsend();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }
        if (this.haeldT >= 0 && this.haeldT < 99) this.haeldT = Math.min(99, this.haeldT + dt);
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
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
        var h = this.haeldt();
        return { t: Tg.gram(Math.round(o.vaegt * h)), lys: h > 0 && h < 1 ? 1 : 0 };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.opg) return;
        var o = this.opg.o;
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 7);
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.formelPlakat(ctx, lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h, {});
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.4);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        var d = this.display();
        Tg.vaegt(ctx, lay.vaegt.x, lay.vaegt.y, lay.vaegtB, d.t, { lys: d.lys });
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
                mig.besked("Plakaten: m = n · M. Massen er stofmængden gange molarmassen, og mol · g/mol giver g.", "");
            } else if (u.slags === "krukke") {
                mig.besked("Krukken: " + NK.html(o.o.st.navn) + ", M = " + NK.komma(o.o.st.M) + " g/mol.", "");
            } else if (u.slags === "vaegt") {
                if (f) mig.besked("Vægten afvejer, når massen i regnestykket er rigtig.", "");
            }
            mig.fokus();
        });
    };

    /* ----- Kemichaels praesentation ---------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc5.2-intro-afvej", tilbud: "afvej-tilbud" });

    NK.SimAfvej = SimAfvej;
}());
