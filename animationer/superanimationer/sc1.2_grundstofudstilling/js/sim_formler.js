/* =====================================================================
   sim_formler.js - fane 2: formlerne

   Tolv flasker med stoffer, der er bygget af grundstofferne i montren.
   Man tager en flaske op og taeller atomerne i formlen: én raekke pr.
   grundstof og én til sidst for det samlede antal. Hver gang et
   grundstof er talt rigtigt, flyver dets atomer ud af montren og op paa
   tavlen, hvor de laegger sig i formlens raekkefoelge. En parentes
   bliver til det antal kopier, tallet efter den siger, med en ramme om
   hver kopi. Saa kan man se, hvorfor der er 12 O i Al2(SO4)3.

   Knappen giver foerst et hint (og formlen lyser op dér, hvor
   grundstoffet staar) og saa svaret. Et forkert tal giver en besked,
   der passer til fejlen (js/tjek.js). Fremskridtet huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc1.2-formler";
    var FLYV_TID = 0.55;
    var KUGLE_TID = 0.7;
    var KUGLE_MELLEM = 0.06;

    function SimFormler() {
        this.L = new NK.Laerred(NK.el("formler-laerred"));
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, {});
        this.status = D.FORMLER.map(function (fo) {
            var s = gemt[fo.id];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rost = {};
        this.over = null;
        this.flyv = null;
        this.kugler = [];
        this.fremhaev = null;
        this.fokuseret = false;
        this.lay = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.valgt = -1;
        this.opg = null;
        this.montreInde = null;

        this.bygPanel();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.vaelg(this.naesteUloeste(-1), true);
    }

    var P = SimFormler.prototype;

    /* ----- Hukommelse ------------------------------------------------------ */
    P.gem = function () {
        var ud = {}, mig = this;
        D.FORMLER.forEach(function (fo, i) {
            var s = mig.status[i];
            if (s.loest) ud[fo.id] = { l: 1, s: s.stjerne ? 1 : 0 };
        });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function (niveau) {
        var n = 0, mig = this;
        D.FORMLER.forEach(function (fo, i) {
            if ((niveau === undefined || fo.niveau === niveau) && mig.status[i].loest) n++;
        });
        return n;
    };

    P.antalStjerner = function (niveau) {
        var n = 0, mig = this;
        D.FORMLER.forEach(function (fo, i) {
            if ((niveau === undefined || fo.niveau === niveau) && mig.status[i].stjerne) n++;
        });
        return n;
    };

    P.iNiveau = function (niveau) {
        return D.FORMLER.filter(function (fo) { return fo.niveau === niveau; }).length;
    };

    P.naesteUloeste = function (fra) {
        var n = D.FORMLER.length;
        for (var d = 1; d <= n; d++) {
            var i = (fra + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return (fra + 1 + n) % n;
    };

    /* Montren paa fane 1: hvilke proever staar der? Den laeses fra fanens
       hukommelse, saa de to faner viser den samme montre. */
    P.proeveInde = function (z) {
        var m = NK.sims && NK.sims["fane-montre"];
        return m ? m.inde(z) : false;
    };

    /* ----- Layout --------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H * 0.9);
        lay.m = Tg.montreLay(kant, kant, W - 2 * kant, H * 0.42);
        var zoneTop = lay.m.y + lay.m.h + NK.klamp(H * 0.025, 8, 20);
        lay.kop = { x: kant + 24, y: lay.bordY };
        lay.storH = NK.klamp(Math.min(lay.bordY - zoneTop - 16, W * 0.22), 80, 230);
        var sb = Tg.flaskeBredde(lay.storH);
        lay.flaske = { x: Math.max(kant + 62 + sb / 2, W * 0.15), y: lay.bordY };
        var tx = lay.flaske.x + sb / 2 + NK.klamp(W * 0.03, 12, 30);
        lay.tavle = { x: tx, y: zoneTop, b: W - kant - tx, h: Math.max(110, lay.bordY - 62 - zoneTop) };

        /* De smaa flasker paa bordet foran tavlen */
        var n = D.FORMLER.length;
        var lilleH = NK.klamp((lay.bordY - lay.tavle.y - lay.tavle.h) * 0.9, 30, 60);
        var slot = Math.min((lay.tavle.b - 20) / n, Tg.flaskeBredde(lilleH) * 1.35);
        lay.lilleH = Math.min(lilleH, slot / 0.72);
        var x0 = lay.tavle.x + (lay.tavle.b - slot * n) / 2;
        lay.pladser = D.FORMLER.map(function (fo, i) {
            return { x: x0 + slot * (i + 0.5), y: lay.bordY, h: lay.lilleH };
        });
        this.lay = lay;
        if (this.opg) this.placerKugler(true);

        this.saetAnker("formler-anker-flaske", lay.flaske.x - sb / 2 - 6, lay.bordY - lay.storH - 6, sb + 12, lay.storH + 8);
        this.saetAnker("formler-anker-tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("formler-anker-raekke", x0, lay.bordY - lay.lilleH - 4, slot * n, lay.lilleH + 6);
        this.saetAnker("formler-anker-montre", lay.m.x, lay.m.y, lay.m.b, lay.m.h);
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

    /* Det indre af tavlen, formlens hoejde og kuglernes omraade */
    P.tavleMaal = function () {
        var t = this.lay.tavle, r = 7;
        var ind = { x: t.x + r, y: t.y + r, b: t.b - 2 * r, h: t.h - 2 * r };
        var px = NK.klamp(Math.min(ind.h * 0.2, ind.b * 0.1), 20, 52);
        var omr = { x: ind.x + 14, y: ind.y + px * 1.55, b: ind.b - 28, h: ind.h - px * 1.55 - 12 };
        return { ind: ind, px: px, omr: omr };
    };

    /* ----- Kuglerne -----------------------------------------------------------
       Blokkene: et atom med sit tal er én blok, en parentes er lige saa
       mange blokke med ramme, som tallet efter den siger. */
    P.blokke = function (fo) {
        var ud = [];
        fo.struktur.forEach(function (l) {
            if (l.gruppe) {
                var inde = [];
                (function gaa(liste, gange) {
                    liste.forEach(function (x) {
                        if (x.gruppe) { for (var k = 0; k < x.n; k++) gaa(x.gruppe, 1); return; }
                        for (var j = 0; j < x.n; j++) inde.push(x.s);
                    });
                }(l.gruppe, 1));
                for (var c = 0; c < l.n; c++) ud.push({ atomer: inde.slice(), ramme: true });
            } else {
                var a = [];
                for (var i = 0; i < l.n; i++) a.push(l.s);
                ud.push({ atomer: a, ramme: false });
            }
        });
        return ud;
    };

    /* Regner kuglernes plads ud. Radius vaelges, saa det hele kan vaere
       paa hoejst tre linjer. */
    P.placerKugler = function (straks) {
        var o = this.opg, tm = this.tavleMaal(), omr = tm.omr;
        var blokke = this.blokke(o.fo);
        var r = NK.klamp(omr.h * 0.2, 7, 22), linjer, mig = this;
        function proev(rr) {
            var ind = rr * 0.35, luft = rr * 0.9, ram = rr * 0.45;
            var ls = [[]], x = 0;
            blokke.forEach(function (bl) {
                var b = bl.atomer.length * 2 * rr + (bl.atomer.length - 1) * ind + (bl.ramme ? 2 * ram : 0);
                if (x > 0 && x + b > omr.b) { ls.push([]); x = 0; }
                ls[ls.length - 1].push({ bl: bl, b: b });
                x += b + luft;
            });
            return { ls: ls, ind: ind, luft: luft, ram: ram };
        }
        while (r > 6) {
            linjer = proev(r);
            var hoejde = linjer.ls.length * (2 * r + linjer.ram * 2 + r * 0.6);
            var bredest = Math.max.apply(null, linjer.ls.map(function (l) {
                return l.reduce(function (a, x) { return a + x.b; }, 0) + (l.length - 1) * linjer.luft;
            }));
            if (linjer.ls.length <= 3 && hoejde <= omr.h && bredest <= omr.b) break;
            r -= 0.5;
        }
        linjer = proev(r);
        var lh = 2 * r + linjer.ram * 2 + r * 0.6;
        var y0 = omr.y + (omr.h - linjer.ls.length * lh) / 2 + lh / 2;
        var pos = [], rammer = [];
        linjer.ls.forEach(function (l, li) {
            var bredde = l.reduce(function (a, x) { return a + x.b; }, 0) + (l.length - 1) * linjer.luft;
            var x = omr.x + (omr.b - bredde) / 2, y = y0 + li * lh;
            l.forEach(function (e) {
                var bx = x + (e.bl.ramme ? linjer.ram : 0);
                if (e.bl.ramme) rammer.push({ x: x, y: y - r - linjer.ram, b: e.b, h: 2 * r + 2 * linjer.ram });
                e.bl.atomer.forEach(function (s, i) {
                    pos.push({ s: s, x: bx + r + i * (2 * r + linjer.ind), y: y });
                });
                x += e.b + linjer.luft;
            });
        });
        this.kugleR = r;
        this.rammer = rammer;
        if (straks || !this.kugler.length) {
            this.kugler = pos.map(function (p) {
                return { s: p.s, x: p.x, y: p.y, t: 0, fra: null, synlig: false, forsinket: 0 };
            });
            /* Er grundstoffet allerede talt, staar kuglerne der fra start */
            o.felter.forEach(function (f) {
                if (f.slags === "antal" && (f.status === "ok" || f.status === "svar")) mig.visKugler(f.s, true);
            });
        } else {
            this.kugler.forEach(function (k, i) { k.x = pos[i].x; k.y = pos[i].y; });
        }
    };

    /* Kuglerne for grundstoffet s flyver ud af montren og op paa tavlen */
    P.visKugler = function (s, straks) {
        var g = D.grundstof(s), rum = g ? this.lay.m.rum[g.z] : null;
        var n = 0;
        this.kugler.forEach(function (k) {
            if (k.s !== s || k.synlig) return;
            k.synlig = true;
            if (straks || !rum) { k.t = 1; return; }
            k.fra = { x: rum.x + rum.b / 2, y: rum.y + rum.h * 0.4 };
            k.t = 0;
            k.forsinket = n * KUGLE_MELLEM;
            n++;
        });
    };

    /* ----- Panelet ------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            raekker: NK.el("formler-raekker"),
            besked: NK.el("formler-besked"),
            knap: NK.el("formler-knap"),
            kort: NK.el("formler-kort"),
            niveauer: NK.el("formler-niveauer"),
            nulstil: NK.el("formler-nulstil")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("formler-spring").addEventListener("click", function () { mig.springIntro(); mig.fokus(); });
        this.bygTilbud();

        D.NIVEAUER.forEach(function (nv, nr) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje";
            knap.innerHTML = '<span class="hl-farve" style="background:' + nv.farve + '"></span>' +
                '<span class="hl-navn">' + nv.navn + '<em>' + nv.kort + '</em></span>' +
                '<span class="hl-tal" id="formler-n-tal-' + nr + '"></span>' +
                '<span class="hl-stjerner" id="formler-n-stj-' + nr + '"></span>';
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
        NK.saetHTML("formler-nulstil", this.nulstilSikker > 0
            ? "<span>Sikker? Klik igen</span><span class=\"tegn\">↺</span>"
            : "<span>Stil flaskerne tilbage</span><span class=\"tegn\">↺</span>");
    };

    P.vaelgNiveau = function (nr) {
        var mig = this, foerste = -1;
        for (var i = 0; i < D.FORMLER.length; i++) {
            if (D.FORMLER[i].niveau !== nr) continue;
            if (foerste < 0) foerste = i;
            if (!mig.status[i].loest) { this.vaelg(i); return; }
        }
        this.vaelg(foerste);
    };

    P.opdaterFremskridt = function () {
        for (var n = 0; n < D.NIVEAUER.length; n++) {
            NK.saetTekst("formler-n-tal-" + n, this.antalLoest(n) + "/" + this.iNiveau(n));
            var s = this.antalStjerner(n);
            NK.saetTekst("formler-n-stj-" + n, s ? "★ " + s : "");
        }
        NK.saetTekst("formler-loest", String(this.antalLoest()));
    };

    /* ----- Opgaven --------------------------------------------------------- */
    P.vaelg = function (i, straks) {
        if (i === this.valgt && this.opg) return;
        var lay = this.lay;
        if (this.valgt >= 0 && lay) {
            this.retur = { i: this.valgt, fra: this.flaskePos(), t: 0 };
        }
        this.valgt = i;
        this.flyv = (straks || !lay) ? null : { fra: { x: lay.pladser[i].x, y: lay.pladser[i].y, h: lay.pladser[i].h }, t: 0 };
        this.nyOpgave(this.status[i].loest);
        this.visStatus();
    };

    P.nyOpgave = function (gennemsyn) {
        var fo = D.FORMLER[this.valgt];
        var felter = fo.orden.map(function (s) { return { slags: "antal", s: s }; });
        felter.push({ slags: "ialt" });
        felter.forEach(function (f, i) { f.i = i; f.status = "laast"; f.forsoeg = 0; });
        this.opg = { fo: fo, felter: felter, k: 0, hjaelp: 0, brugtSvar: false, faerdig: false, gennemsyn: !!gennemsyn };
        this.fremhaev = null;
        this.besked("", "");
        this.kugler = [];
        if (gennemsyn) {
            var mig = this;
            felter.forEach(function (f) { f.status = "ok"; f.vaerdi = mig.korrekt(f); });
            this.opg.k = felter.length;
            this.opg.faerdig = true;
            this.besked(this.status[this.valgt].stjerne ? "Løst uden hjælp. ★" : "Løst.", "god");
        } else {
            felter[0].status = "aktiv";
        }
        if (this.lay) this.placerKugler(true);
        this.bygRaekker();
        this.visKort();
        if (!gennemsyn) this.fokus();
    };

    P.korrekt = function (f) {
        var fo = this.opg.fo;
        return String(f.slags === "ialt" ? fo.ialt : fo.antal[f.s]);
    };

    P.aktivtFelt = function () {
        var o = this.opg;
        return o && !o.faerdig ? o.felter[o.k] : null;
    };

    P.bygRaekker = function () {
        var mig = this, o = this.opg;
        var vaert = this.el.raekker;
        vaert.innerHTML = "";
        o.felter.forEach(function (f) {
            var rk = document.createElement("div");
            rk.className = "raekke vandret" + (f.slags === "ialt" ? " slut" : "");
            var etiket = f.slags === "ialt" ? "Atomer i alt" : f.s + "-atomer";
            var navn = f.slags === "ialt" ? "" : (D.grundstof(f.s) ? D.grundstof(f.s).navn : "");
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + etiket + "</span>" +
                (navn ? '<span class="raekke-del">' + navn + "</span>" : "") + "</div>" +
                '<div class="felter"></div>';
            var felterEl = rk.querySelector(".felter");
            var fe = document.createElement("div");
            fe.className = "felt smalt " + f.status;
            if (f.status === "ok" || f.status === "svar") {
                fe.innerHTML = '<span class="felt-svar">' + NK.html(f.vaerdi) + '</span><span class="felt-maerke">' +
                    (f.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                fe.innerHTML = '<input type="text" inputmode="numeric" autocomplete="off" spellcheck="false"' +
                    ' aria-label="' + etiket + '" placeholder="antal"' + (f.status === "aktiv" ? "" : " disabled") + '>' +
                    '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' +
                    (f.status === "aktiv" ? "" : " disabled") + '>↵</button>';
                var inp = fe.querySelector("input");
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                });
                inp.addEventListener("focus", function () { mig.fokuseret = true; });
                inp.addEventListener("blur", function () { mig.fokuseret = false; });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                f.input = inp;
            }
            f.feltEl = fe;
            felterEl.appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    P.fokus = function () {
        var f = this.aktivtFelt();
        if (f && f.input && NK.el("fane-formler").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    P.visKort = function () {
        var o = this.opg, fo = o.fo;
        var nv = D.NIVEAUER[fo.niveau];
        NK.saetHTML("formler-niveau", '<span class="hyldeprik" style="background:' + nv.farve + '"></span>' + nv.navn);
        NK.saetTekst("formler-nr", String(fo.pladsINiveau + 1));
        NK.saetTekst("formler-antal-i-niveau", String(this.iNiveau(fo.niveau)));
        NK.saetTekst("formler-prompt", fo.formelTekst);
        NK.saetTekst("formler-spm", fo.Navn + ". Tæl atomerne.");
        this.el.kort.classList.toggle("sejr", o.faerdig && !o.gennemsyn);
        this.visKnap();
        this.opdaterFremskridt();
    };

    P.visKnap = function () {
        var o = this.opg, tekst, klasse = "knap blaa";
        if (o.faerdig) {
            if (o.gennemsyn) tekst = "Tæl flasken igen";
            else { tekst = "Næste flaske →"; klasse += " banker"; }
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

    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) {
            if (o.gennemsyn) this.nyOpgave(false);
            else this.vaelg(this.naesteUloeste(this.valgt));
            return;
        }
        var f = this.aktivtFelt();
        var h = D.hjaelpFormel(o.fo, f.slags === "ialt" ? "ialt" : f.s);
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.besked("<b>Hint:</b> " + h.hint, "gul");
            this.fremhaev = h.fremhaev || null;
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
        var raa = f.input ? f.input.value : "";
        var res = Tj.antal(raa, o.fo, f.slags === "ialt" ? "ialt" : f.s);
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
        f.vaerdi = this.korrekt(f);
        o.hjaelp = 0;
        this.fremhaev = null;
        this.besked("", "");
        if (f.slags === "antal") this.visKugler(f.s, false);
        if (o.k >= o.felter.length - 1) {
            o.k = o.felter.length;
            this.loes();
        } else {
            o.k++;
            o.felter[o.k].status = "aktiv";
        }
        this.bygRaekker();
        this.visKort();
        this.fokus();
    };

    P.loes = function () {
        var o = this.opg, i = this.valgt;
        o.faerdig = true;
        this.ialtTid = 0;
        var s = this.status[i];
        var foer = s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || !o.brugtSvar;
        this.gem();
        this.visStatus();
        if (this.afvisTilbud) this.afvisTilbud();
        var nv = o.fo.niveau;
        if (!foer && this.antalLoest(nv) === this.iNiveau(nv) && !this.rost[nv]) {
            this.rost[nv] = true;
            this.ventRos = { t: 2.0, niveau: nv, alt: this.antalLoest() === D.FORMLER.length };
        }
    };

    P.visStatus = function () {
        var o = this.opg;
        if (o && o.faerdig) {
            NK.saetHTML("formler-status", "<b>" + NK.html(o.fo.formelTekst + " " + o.fo.navn) + "</b> · " + NK.html(o.fo.fakta));
        } else {
            NK.saetHTML("formler-status", "Tæl atomerne i formlen, og skriv tallene i felterne til højre.");
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
        this.retur = null;
        this.vaelg(0, true);
    };

    /* ----- Kemichaels praesentation ----------------------------------------
       Tilbuddet med Start praesentation og Nej tak: js/praesentation.js */
    NK.Praesentation.kobl(P, { noegle: "nk-sc1.2-intro-formler", tilbud: "formler-tilbud", spring: "formler-spring" });

    P.pegPaaFelt = function (til) {
        var f = this.aktivtFelt();
        if (f && f.feltEl) f.feltEl.classList.toggle("peg", til);
    };

    P.enter = function () {
        if (this.opg && this.opg.faerdig && !this.opg.gennemsyn) this.knap();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.flaskePos = function () {
        var lay = this.lay;
        var til = { x: lay.flaske.x, y: lay.flaske.y, h: lay.storH };
        if (!this.flyv) return til;
        var t = NK.blod(this.flyv.t / FLYV_TID);
        return {
            x: NK.lerp(this.flyv.fra.x, til.x, t),
            y: NK.lerp(this.flyv.fra.y, til.y, t) - Math.sin(t * Math.PI) * 40,
            h: NK.lerp(this.flyv.fra.h, til.h, t)
        };
    };

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.flyv) {
            this.flyv.t += dt;
            if (this.flyv.t >= FLYV_TID) this.flyv = null;
        }
        if (this.retur) {
            this.retur.t += dt;
            if (this.retur.t >= FLYV_TID) this.retur = null;
        }
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }
        if (this.ialtTid !== undefined) this.ialtTid += dt;
        this.kugler.forEach(function (k) {
            if (!k.synlig || k.t >= 1) return;
            if (k.forsinket > 0) { k.forsinket -= dt; return; }
            k.t = Math.min(1, k.t + dt / KUGLE_TID);
        });
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

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, o = this.opg;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);

        /* Montren: grundstofferne i formlen lyser svagt */
        var markering = {};
        if (o) {
            o.fo.orden.forEach(function (s) {
                var g = D.grundstof(s);
                if (g) markering[g.z] = { farve: mig.fremhaev === s ? "242, 197, 61" : "238, 242, 234", a: mig.fremhaev === s ? 0.6 + 0.4 * Math.sin(mig.tid * 7) : 0.35 };
            });
        }
        var overRum = this.over && this.over.slags === "rum" ? this.over.z : 0;
        Tg.montre(ctx, lay.m, {
            tid: this.tid,
            inde: function (z) { return mig.proeveInde(z); },
            lys: overRum,
            blink: markering,
            tavleLys: this.over && this.over.slags === "navne" ? 1 : 0
        });

        /* Tavlen med formlen og atomerne */
        this.tegnTavle(ctx);

        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.4);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
            if (this.over && this.over.slags === "kop") {
                ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, lay.kop.x - 22 * kk, lay.kop.y - 44 * kk, 50 * kk, 46 * kk, 6);
                ctx.stroke();
            }
        }

        /* De smaa flasker */
        D.FORMLER.forEach(function (fo, i) {
            if (i === mig.valgt) return;
            if (mig.retur && mig.retur.i === i) return;
            var p = lay.pladser[i];
            var lys = mig.over && mig.over.slags === "flaske" && mig.over.i === i ? 1 : 0;
            mig.lilleFlaske(ctx, fo, p.x, p.y, p.h, lys, mig.status[i]);
        });
        if (this.retur) {
            var rt = NK.blod(this.retur.t / FLYV_TID), rp = lay.pladser[this.retur.i];
            var rfo = D.FORMLER[this.retur.i];
            Tg.flaske(ctx, NK.lerp(this.retur.fra.x, rp.x, rt), NK.lerp(this.retur.fra.y, rp.y, rt) - Math.sin(rt * Math.PI) * 40,
                NK.lerp(this.retur.fra.h, rp.h, rt), rfo, { udenTekst: NK.lerp(this.retur.fra.h, rp.h, rt) < 90 });
        }
        /* Den store flaske */
        if (o) {
            var fp = this.flaskePos();
            Tg.flaske(ctx, fp.x, fp.y, fp.h, o.fo, { stjerne: o.faerdig && this.status[this.valgt].stjerne ? 1 : 0 });
        }

        this.tegnKuglerFlyv(ctx);
        this.tegnBobler(ctx);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* En lille flaske paa bordet: uden etiketskrift, med en stjerne eller
       et flueben, naar den er loest */
    P.lilleFlaske = function (ctx, fo, x, y, h, lys, s) {
        var r = Tg.flaske(ctx, x, y, h, fo, { stjerne: s.stjerne ? 1 : 0, udenTekst: h < 90 });
        if (lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, r.x - 3, r.y - 3, r.b + 6, r.h + 6, 6);
            ctx.stroke();
        }
        if (s.loest && !s.stjerne) {
            ctx.fillStyle = "#7ee0a8";
            ctx.font = Tg.font("800", 13);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("✓", x + r.b * 0.36, r.y + 10);
        }
    };

    P.tegnTavle = function (ctx) {
        var lay = this.lay, o = this.opg;
        var t = lay.tavle;
        Tg.tavle(ctx, t.x, t.y, t.b, t.h);
        if (!o) return;
        var tm = this.tavleMaal(), mig = this;
        var farver = {};
        o.felter.forEach(function (f) { if (f.slags === "antal" && (f.status === "ok" || f.status === "svar")) farver[f.s] = true; });
        Tg.formel(ctx, o.fo, tm.ind.x + tm.ind.b / 2, tm.ind.y + tm.px * 1.12, tm.px, { fremhaev: this.fremhaev, farver: farver });

        /* Rammerne om parenteserne: stiplet kridt, saa man kan se kopierne */
        var vis = o.felter.some(function (f) { return f.slags === "antal" && (f.status === "ok" || f.status === "svar"); });
        var gulGruppe = this.fremhaev && D.forekomster(o.fo, this.fremhaev).some(function (x) { return x.gange > 1; });
        if (vis || gulGruppe) {
            ctx.save();
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = gulGruppe ? "rgba(242, 197, 61, 0.85)" : "rgba(238, 242, 234, 0.45)";
            this.rammer.forEach(function (rm) {
                NK.rundtRekt(ctx, rm.x, rm.y, rm.b, rm.h, mig.kugleR * 0.8);
                ctx.stroke();
            });
            ctx.restore();
        }

        /* Kuglerne, der er landet */
        var r = this.kugleR;
        this.kugler.forEach(function (k) {
            if (!k.synlig || k.t < 1) return;
            Tg.atom(ctx, k.x, k.y, r, k.s);
        });

        /* I alt, naar det hele er talt */
        if (o.faerdig) {
            var a = o.gennemsyn ? 1 : NK.klamp((this.ialtTid || 0) / 0.4, 0, 1);
            ctx.save();
            ctx.globalAlpha = a;
            ctx.fillStyle = "#b8f0cf";
            ctx.font = Tg.font("700", NK.klamp(tm.px * 0.5, 13, 20));
            ctx.textAlign = "right";
            ctx.textBaseline = "alphabetic";
            ctx.fillText("i alt " + o.fo.ialt + " atomer ✓", tm.ind.x + tm.ind.b - 10, tm.ind.y + tm.ind.h - 6);
            ctx.restore();
        }
    };

    /* Kuglerne i luften tegnes oven paa alt andet */
    P.tegnKuglerFlyv = function (ctx) {
        var r = this.kugleR;
        this.kugler.forEach(function (k) {
            if (!k.synlig || k.t >= 1 || k.forsinket > 0 || !k.fra) return;
            var t = NK.blod(k.t);
            var x = NK.lerp(k.fra.x, k.x, t);
            var y = NK.lerp(k.fra.y, k.y, t) - Math.sin(t * Math.PI) * 60;
            Tg.atom(ctx, x, y, r * (0.5 + 0.5 * t), k.s);
        });
    };

    P.tegnBobler = function (ctx) {
        var u = this.over, lay = this.lay;
        if (!u) return;
        if (u.slags === "flaske") {
            var fo = D.FORMLER[u.i], p = lay.pladser[u.i], s = this.status[u.i];
            Tg.boble(ctx, p.x, p.y - p.h - 4, [
                { t: fo.formelTekst + "  " + fo.navn, px: 15 },
                { t: s.loest ? (s.stjerne ? "Løst uden hjælp ★" : "Løst") : D.NIVEAUER[fo.niveau].navn, px: 12, vaegt: "400", farve: s.loest ? "#7ee0a8" : "#a9b0ba" }
            ], lay.W, p.y);
        } else if (u.slags === "rum") {
            var g = D.efterZ(u.z), r = lay.m.rum[u.z];
            Tg.boble(ctx, r.x + r.b / 2, r.y - 2, [{ t: g.s + "  " + g.navn, px: 15 }], lay.W, r.y + r.h);
        }
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
        if (Tg.overTavle(lay.m, pt.x, pt.y)) return { slags: "navne" };
        var z = Tg.montreRum(lay.m, pt.x, pt.y);
        if (z && this.proeveInde(z)) return { slags: "rum", z: z };
        for (var i = 0; i < D.FORMLER.length; i++) {
            if (i === this.valgt) continue;
            var p = lay.pladser[i], b = Tg.flaskeBredde(p.h);
            if (pt.x >= p.x - b / 2 && pt.x <= p.x + b / 2 && pt.y >= p.y - p.h - 4 && pt.y <= p.y + 4) return { slags: "flaske", i: i };
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            mig.over = mig.hvadErUnder(pt);
            c.style.cursor = mig.over && mig.over.slags !== "rum" ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "kop" && mig.klikKop) { mig.klikKop(); return; }
            if (u.slags === "navne") { NK.Opslag.aabn(null); return; }
            if (u.slags === "flaske") mig.vaelg(u.i);
        });
    };

    NK.SimFormler = SimFormler;
}());
