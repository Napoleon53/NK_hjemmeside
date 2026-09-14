/* =====================================================================
   forsoeg.js - selve forsoeget: fyld glasset, antaend, maal knaldet

   Glasset gennemloeber disse tilstande:
     "klar"    staar i vandbadet og kan fyldes
     "traek"   eleven traekker det rundt
     "flyver"  glider af sig selv (hen til flammen eller hjem igen)
     "knald"   staar ved flammen efter reaktionen, indtil eleven trykker
               Genfyld glasset
     "fylder"  er kommet hjem og fyldes med vand igen

   Molekylerne i glasset er ikke pynt: hver streg gas er 2 molekyler,
   og efter knaldet dannes praecis det vand, som model.js regner ud.
   Varmen fordeles paa faa nanosekunder paa alle molekyler, saa vand og
   overskud faar samme temperatur, og ved samme temperatur bevaeger de
   lette molekyler sig hurtigst (se termisk()). Den varme gas udvider
   sig, og en del af ALLE molekyler stroemmer ud af aabningen. H2
   kommer hurtigst ud.

   Paaskeaeg: ved det helt rigtige forhold, 4 : 2, knaekker glasset i
   10 % af forsoegene (knaekChance). Saa bliver Genfyld glasset til
   Nyt glas.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var G = S.GLAS;

    var TYNGDE = 900;
    var FYLD_TID = 0.9;            /* sekunder om at fylde glasset med vand igen */
    var GENFYLD_VENT = 0.7;        /* sekunder efter knaldet, foer glasset kan genfyldes */

    /* Varmebevaegelse. Ved samme temperatur har molekylerne i gennemsnit
       samme kinetiske energi, saa farten er omvendt proportional med
       kvadratroden af molmassen: sqrt(18/2) = 3 for H2, 1 for H2O og
       sqrt(18/32) = 0,75 for O2. RUM_FART er middelfarten for H2O ved
       stuetemperatur, i tegneenheder pr. sekund. */
    var MASSEFAKTOR = { h2: Math.sqrt(18 / 2), h2o: 1, o2: Math.sqrt(18 / 32) };
    var RUM_FART = 30;
    var VARM_FAKTOR = 9;           /* ved det kraftigste knald stiger T ca. 10 gange */
    var UDSTROEM_TID = 0.5;        /* sekunder, den varme gas stroemmer ud af aabningen */

    function r(a, b) { return a + Math.random() * (b - a); }

    /* Tilfaeldig fart med middelvaerdi 1: Maxwell-Boltzmann-fordelingen
       i to dimensioner (Rayleigh-fordelingen), klippet ved 3. */
    function fordeling() {
        return Math.min(3, 0.798 * Math.sqrt(-2 * Math.log(1 - Math.random())));
    }

    NK.Forsoeg = function (canvas) {
        this.canvas = canvas;
        this.laerred = new NK.Laerred(canvas);
        this.tid = 0;
        this.resultater = {};
        this.senesteH = -1;
        this.senesteTid = -10;
        this.harFyldt = false;
        this.knaekChance = 0.1;
        this.vedAendring = null;
        this.vedBesked = null;
        this.hover = null;
        this.nulstil();
        if (canvas) this.bindMus();
    };

    var P = NK.Forsoeg.prototype;

    /* ----- Nulstilling ------------------------------------------------ */
    P.nulstil = function () {
        this.h = 0;
        this.o = 0;
        this.tilstand = "klar";
        this.glas = { x: S.HJEM.x, y: S.HJEM.y, vinkel: 0 };
        this.vinkelMaal = 0;
        this.bane = null;
        this.traek = null;
        this.skalFyldes = false;
        this.fyldUr = 0;
        this.knaldTid = -10;
        this.knaekUr = -1;
        this.knust = false;
        this.niveau = 0;
        this.vand = 1;
        this.molekyler = [];
        this.fri = [];
        this.skaar = [];
        this.dug = [];
        this.bobler = [];
        this.venter = { h2: 0, o2: 0 };
        this.spawnUr = 0;
        this.varme = 0;
        this.udstroem = 0;
        this.udstroemFart = 0;
        this.flow = { h2: 0, o2: 0 };
        this.front = -1;
        this.frontAlfa = 0;
        this.rekyl = 0;
        this.rekylFart = 0;
        this.ryst = 0;
        this.fyldtSidenKnald = true;
        this.sidsteReaktion = null;
        this.e = { x: 0, y: 0, styrke: 0, blink: 0, stik: 0, ringe: [], roeg: [], gnister: [], draaber: [] };
    };

    P.rydResultater = function () {
        this.resultater = {};
        this.senesteH = -1;
        this.aendret("ryd");
    };

    /* ----- Til panelet ------------------------------------------------ */
    P.antalTestet = function () {
        var n = 0;
        for (var k in this.resultater) if (Object.prototype.hasOwnProperty.call(this.resultater, k)) n++;
        return n;
    };

    P.fuld = function () { return this.h + this.o >= M.MAKS; };
    P.kanFylde = function () { return this.tilstand === "klar" && !this.fuld(); };
    P.kanAntaende = function () { return this.tilstand === "klar" && this.fuld(); };
    P.kanToemme = function () { return this.tilstand === "klar" && this.h + this.o > 0; };
    P.kanGenfylde = function () { return this.tilstand === "knald" && this.tid - this.knaldTid >= GENFYLD_VENT; };

    /* Hvilket af de tre trin paa scenen er eleven naaet til? */
    P.trin = function () {
        if (this.tilstand === "knald" || this.skalFyldes || !this.fyldtSidenKnald) return 3;
        if (this.fuld() || this.tilstand === "traek" || this.tilstand === "flyver") return 2;
        return 1;
    };

    P.aendret = function (grund) {
        if (this.vedAendring) this.vedAendring(grund);
    };

    P.besked = function (tekst, slags) {
        if (this.vedBesked) this.vedBesked(tekst, slags || "info");
    };

    /* ----- Indgreb ------------------------------------------------------ */
    P.tilfoej = function (gas) {
        if (this.tilstand === "knald") {
            this.besked("Tryk på Genfyld glasset først.", "info");
            return false;
        }
        if (this.tilstand !== "klar") return false;
        if (this.fuld()) {
            this.besked("Glasset er fuldt.", "info");
            return false;
        }
        if (gas === "h2") this.h++; else this.o++;
        this.harFyldt = true;
        this.fyldtSidenKnald = true;
        this.flow[gas] = 1;
        this.venter[gas] += M.PR_STREG;

        var ende = S.SLANGER[gas].ende;
        for (var i = 0; i < 9; i++) {
            this.bobler.push({ x0: ende.x + r(-2, 2), x: ende.x, y: ende.y, r: r(2, 4.5), v: r(70, 115), fase: r(0, 6), vent: i * 0.07 });
        }
        this.aendret("fyld");
        return true;
    };

    P.toem = function () {
        if (!this.kanToemme()) return false;
        this.h = 0;
        this.o = 0;
        this.venter.h2 = 0;
        this.venter.o2 = 0;
        for (var i = 0; i < this.molekyler.length; i++) this.molekyler[i].doer = true;
        this.aendret("toem");
        return true;
    };

    P.antaend = function () {
        if (NK.Lyd) NK.Lyd.laasOp();
        if (this.tilstand === "knald") {
            this.besked("Tryk på Genfyld glasset først.", "info");
            return false;
        }
        if (this.tilstand !== "klar") return false;
        if (!this.fuld()) {
            this.besked("Fyld glasset helt op (6 streger), før du antænder.", "advarsel");
            return false;
        }
        this.flyv(S.TAEND, 1.1, this.knald);
        this.aendret("antaend");
        return true;
    };

    /* Glasset tilbage i vandbadet - eller et nyt, hvis det gamle knak. */
    P.genfyld = function () {
        if (!this.kanGenfylde()) return false;
        if (this.knust) {
            this.knust = false;
            this.glas.x = S.HJEM.x;
            this.glas.y = S.HJEM.y - 360;
            this.glas.vinkel = 0;
            this.rekyl = 0;
            this.rekylFart = 0;
            this.vand = 0;
            this.niveau = M.MAKS;
            this.molekyler = [];
            this.dug = [];
            for (var i = 0; i < this.skaar.length; i++) this.skaar[i].doer = true;
            this.flyv(S.HJEM, 0.9, this.ankomHjem, 0);
        } else {
            this.flyv(S.HJEM, 1.0, this.ankomHjem);
        }
        this.aendret("genfyld");
        return true;
    };

    P.flyv = function (til, varighed, efter, loeft) {
        var dx = til.x - this.glas.x, dy = til.y - this.glas.y;
        var afstand = Math.sqrt(dx * dx + dy * dy);
        this.bane = {
            fra: { x: this.glas.x, y: this.glas.y },
            til: { x: til.x, y: til.y },
            t: 0,
            varighed: varighed,
            loeft: loeft === undefined ? Math.min(36, afstand * 0.2 + 8) : loeft,
            efter: efter
        };
        this.tilstand = "flyver";
    };

    P.knald = function () {
        var i;
        /* Molekyler, der stadig er paa vej op i glasset, kommer med nu. */
        while (this.venter.h2 > 0 || this.venter.o2 > 0) this.nytMolekyle();

        var rx = M.reaktion(this.h, this.o);
        var styrke = rx.styrke / 100;
        this.sidsteReaktion = rx;
        this.tilstand = "knald";
        this.knaldTid = this.tid;
        this.skalFyldes = true;
        this.fyldtSidenKnald = false;
        this.traek = null;
        this.bane = null;
        this.glas.x = S.TAEND.x;
        this.glas.y = S.TAEND.y;

        this.resultater[this.h] = rx.styrke;
        this.senesteH = this.h;
        this.senesteTid = this.tid;

        var e = this.e;
        e.x = this.glas.x;
        e.y = this.glas.y;
        e.styrke = styrke;
        if (styrke > 0) {
            e.blink = 1;
            e.stik = 1;
            e.ringe.push({ x: e.x, y: e.y, r: 12, liv: 1 });
            if (styrke > 0.6) e.ringe.push({ x: e.x, y: e.y, r: 2, liv: 1.15 });
            var antal = Math.round(12 + 90 * styrke);
            for (i = 0; i < antal; i++) {
                var v = r(0, Math.PI * 2), fart = r(60, 160 + 420 * styrke);
                e.gnister.push({
                    x: e.x, y: e.y + 6,
                    vx: Math.cos(v) * fart, vy: Math.sin(v) * fart * 0.8 + 60,
                    liv: r(0.5, 1), r: r(1.2, 3.2),
                    farve: "hsl(" + Math.round(r(25, 55)) + ", 100%, " + Math.round(r(55, 75)) + "%)"
                });
            }
            var puf = Math.round(5 + 10 * styrke);
            for (i = 0; i < puf; i++) {
                e.roeg.push({ x: e.x + r(-12, 12), y: e.y + r(0, 14), vx: r(-30, 30), vy: r(-40, -12), r: r(6, 12), liv: r(0.8, 1.2) });
            }
            this.front = 0;
            this.frontAlfa = 1;
            this.ryst = 16 * styrke;
            this.rekylFart = -320 * styrke;
            this.varme = styrke;
            /* Den varme gas udvider sig og skubber indholdet mod aabningen:
               i alt 90-180 enheder af glassets 240, mere jo varmere. */
            this.udstroem = UDSTROEM_TID;
            this.udstroemFart = 2 * 240 * (0.25 + 0.5 * styrke) / UDSTROEM_TID;
            this.omdan(rx);
        }

        if (rx.h === 4 && rx.o === 2 && Math.random() < this.knaekChance) this.knaekUr = 0.13;

        this.h = 0;
        this.o = 0;
        if (NK.Lyd) NK.Lyd.knald(rx.styrke);
        this.besked(M.ord(rx.styrke), styrke >= 0.95 ? "knald stor" : (styrke > 0 ? "knald" : "info"));
        this.aendret("knald");
    };

    /* Det, der har reageret, bliver til vand, og alle molekyler - nye
       som gamle - faar straks den nye temperatur. */
    P.omdan = function (rx) {
        var brugtH2 = rx.h2Brugt, brugtO2 = rx.o2Brugt;
        var pladser = [];
        var i, m;
        for (i = this.molekyler.length - 1; i >= 0; i--) {
            m = this.molekyler[i];
            if (m.doer) continue;
            if (m.type === "h2" && brugtH2 > 0) { brugtH2--; pladser.push(m); this.molekyler.splice(i, 1); }
            else if (m.type === "o2" && brugtO2 > 0) { brugtO2--; pladser.push(m); this.molekyler.splice(i, 1); }
        }
        for (i = 0; i < rx.h2o; i++) {
            var fra = pladser[i % Math.max(1, pladser.length)] || { x: G.MIDT, y: 150 };
            this.molekyler.push({
                type: "h2o", x: NK.klamp(fra.x + r(-6, 6), G.V + 12, G.HO - 12), y: fra.y + r(-6, 6),
                vx: 0, vy: 0, a: r(0, 6.28), va: r(-4, 4), alfa: 1, doer: false
            });
        }
        var grund = RUM_FART * Math.sqrt(1 + VARM_FAKTOR * this.varme);
        for (i = 0; i < this.molekyler.length; i++) {
            m = this.molekyler[i];
            m.fk = fordeling();
            var v = r(0, Math.PI * 2), fart = grund * MASSEFAKTOR[m.type] * m.fk;
            m.vx = Math.cos(v) * fart;
            m.vy = Math.sin(v) * fart;
        }
        for (i = 0; i < rx.h2o * 3; i++) {
            this.dug.push({ x: r(G.V + 4, G.HO - 4), y: r(G.TOP + 6, G.STREG6), r: r(1.1, 2.6), alfa: r(-1.2, -0.4), doer: false });
        }
    };

    /* Et molekyle forlader glasset og flyver videre ude i rummet.
       Farten er delt i to: varmebevaegelsen (vx, vy), som er molekylets
       egen, og stroemningen (dx, dy), som er ens for alle og bremses af
       luften. udFart gemmes, saa selvtesten kan se, hvem der kom
       hurtigst ud. */
    P.frigoer = function (m, g, drift, knust) {
        var p = S.glasTilBord(g, m.x, m.y);
        var c = Math.cos(g.vinkel), s = Math.sin(g.vinkel);
        var fm = {
            type: m.type, x: p.x, y: p.y,
            vx: m.vx * c - m.vy * s, vy: m.vx * s + m.vy * c,
            dx: knust ? r(-250, 250) : -drift * s + drift * r(-0.7, 0.7),
            dy: knust ? r(-300, 60) : drift * c * r(0.5, 0.9),
            fk: m.fk, varme: this.varme,
            a: m.a, va: m.va, alfa: m.alfa, liv: r(2.8, 4.2),
            udTid: this.tid - this.knaldTid
        };
        fm.udFart = Math.sqrt((fm.vx + fm.dx) * (fm.vx + fm.dx) + (fm.vy + fm.dy) * (fm.vy + fm.dy));
        this.fri.push(fm);
    };

    /* Paaskeaegget: glasset springer i stumper. */
    P.knaek = function () {
        var g = { x: this.glas.x, y: this.glas.y + this.rekyl, vinkel: this.glas.vinkel };
        var i, j;
        this.knust = true;
        for (i = 0; i < this.molekyler.length; i++) this.frigoer(this.molekyler[i], g, 0, true);
        this.molekyler = [];
        this.dug = [];

        /* Roeret deles i et skaevt gitter, og hver celle bliver ét
           eller to skaar. Foden knaekker i to. */
        var kol = 3, raek = 8, p = [];
        for (i = 0; i <= kol; i++) {
            p.push([]);
            for (j = 0; j <= raek; j++) {
                p[i].push({
                    x: 12 + i * (66 / kol) + (i > 0 && i < kol ? r(-6, 6) : 0),
                    y: 12 + j * (280 / raek) + (j > 0 && j < raek ? r(-9, 9) : 0)
                });
            }
        }
        var stykker = [];
        for (i = 0; i < kol; i++) {
            for (j = 0; j < raek; j++) {
                var a = p[i][j], b = p[i + 1][j], c = p[i + 1][j + 1], d = p[i][j + 1];
                var valg = Math.random();
                if (valg < 0.5) stykker.push([a, b, c, d]);
                else if (valg < 0.75) { stykker.push([a, b, c]); stykker.push([a, c, d]); }
                else { stykker.push([a, b, d]); stykker.push([b, c, d]); }
            }
        }
        var fodDel = r(30, 60);
        stykker.push([{ x: 2, y: 0 }, { x: fodDel, y: 0 }, { x: fodDel, y: 12 }, { x: 2, y: 12 }]);
        stykker.push([{ x: fodDel, y: 0 }, { x: 88, y: 0 }, { x: 88, y: 12 }, { x: fodDel, y: 12 }]);

        var cos = Math.cos(g.vinkel), sin = Math.sin(g.vinkel);
        for (i = 0; i < stykker.length; i++) {
            var poly = stykker[i];
            var cx = 0, cy = 0;
            for (j = 0; j < poly.length; j++) { cx += poly[j].x; cy += poly[j].y; }
            cx /= poly.length;
            cy /= poly.length;
            var midt = S.glasTilBord(g, cx, cy);
            var pts = [];
            for (j = 0; j < poly.length; j++) {
                var dx = poly[j].x - cx, dy = poly[j].y - cy;
                pts.push({ x: dx * cos - dy * sin, y: dx * sin + dy * cos });
            }
            var kraft = 0.45 + 0.55 * cy / G.MUND;
            this.skaar.push({
                x: midt.x, y: midt.y, a: 0, va: r(-11, 11),
                vx: (cx - G.MIDT) * r(4, 9) + r(-110, 110),
                vy: -r(140, 460) * kraft,
                pts: pts, alfa: 1, doer: false, hvile: false
            });
        }

        for (i = 0; i < 40; i++) {
            var vv = r(0, Math.PI * 2), fart = r(80, 380);
            this.e.gnister.push({
                x: g.x + r(-30, 30), y: g.y - r(0, 280),
                vx: Math.cos(vv) * fart, vy: Math.sin(vv) * fart - 120,
                liv: r(0.5, 1), r: r(0.8, 1.8), farve: "rgba(225, 242, 255, 0.95)"
            });
        }

        if (NK.Lyd) NK.Lyd.glas();
        this.besked("Glasset knækkede!", "knald");
        this.aendret("knaek");
    };

    P.nytMolekyle = function () {
        var type = this.venter.h2 >= this.venter.o2 ? "h2" : "o2";
        if (this.venter[type] <= 0) return;
        this.venter[type]--;
        var bund = G.TOP + this.niveau * G.STREG;
        var rad = S.MOLEKYLRADIUS[type];
        this.molekyler.push({
            type: type,
            x: G.MIDT + r(-14, 14),
            y: Math.max(G.TOP + rad, bund - rad),
            vx: r(-40, 40), vy: r(-70, -30),
            a: r(0, 6.28), va: r(-2, 2),
            alfa: 0, doer: false
        });
    };

    P.ankomHjem = function () {
        if (this.skalFyldes) {
            this.tilstand = "fylder";
            this.fyldUr = FYLD_TID;
            for (var i = 0; i < this.molekyler.length; i++) this.molekyler[i].doer = true;
            for (var d = 0; d < this.dug.length; d++) this.dug[d].doer = true;
        } else {
            this.tilstand = "klar";
        }
        this.aendret("hjem");
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = S.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    P.overGlas = function (p) {
        if (this.knust) return false;
        var l = S.bordTilGlas({ x: this.glas.x, y: this.glas.y + this.rekyl, vinkel: this.glas.vinkel }, p.x, p.y);
        return l.x > -14 && l.x < G.B + 14 && l.y > -12 && l.y < G.H + 8;
    };

    P.overFlaske = function (p) {
        for (var gas in S.FLASKER) {
            if (!Object.prototype.hasOwnProperty.call(S.FLASKER, gas)) continue;
            var f = S.FLASKER[gas].ramme;
            if (p.x > f.x0 && p.x < f.x1 && p.y > f.y0 && p.y < f.y1) return gas;
        }
        return null;
    };

    P.ned = function (p) {
        if (NK.Lyd) NK.Lyd.laasOp();
        if (this.overGlas(p)) {
            if (this.tilstand === "knald") {
                this.besked("Tryk på Genfyld glasset for at sætte det tilbage i karret.", "info");
                return false;
            }
            if (this.tilstand !== "klar") return false;
            if (!this.fuld()) {
                this.besked("Fyld glasset helt op (6 streger), før du tager det op.", "advarsel");
                return false;
            }
            this.tilstand = "traek";
            this.traek = { dx: p.x - this.glas.x, dy: p.y - this.glas.y };
            this.aendret("traek");
            return true;
        }
        var gas = this.overFlaske(p);
        if (gas) this.tilfoej(gas);
        return false;
    };

    P.flyt = function (p) {
        if (this.tilstand !== "traek" || !this.traek) {
            this.hover = this.overGlas(p) ? "glas" : this.overFlaske(p);
            return;
        }
        var nx = NK.klamp(p.x - this.traek.dx, 60, 960);
        var ny = NK.klamp(p.y - this.traek.dy, S.TAEND.y - 30, S.HJEM.y);
        this.vinkelMaal = NK.klamp((nx - this.glas.x) * 0.025, -0.3, 0.3);
        this.glas.x = nx;
        this.glas.y = ny;
        var dx = nx - S.TAEND.x, dy = ny - S.TAEND.y;
        if (dx * dx + dy * dy < 58 * 58) this.knald();
    };

    P.op = function () {
        if (this.tilstand !== "traek") return;
        this.traek = null;
        var dx = S.HJEM.x - this.glas.x, dy = S.HJEM.y - this.glas.y;
        var afstand = Math.sqrt(dx * dx + dy * dy);
        this.flyv(S.HJEM, 0.3 + afstand / 900, function () {
            this.tilstand = "klar";
            this.aendret("hjem");
        });
    };

    P.bindMus = function () {
        var mig = this;
        var c = this.canvas;
        c.addEventListener("pointerdown", function (ev) {
            if (mig.ned(mig.tilBord(ev))) {
                try { c.setPointerCapture(ev.pointerId); } catch (fejl) {}
                ev.preventDefault();
            }
        });
        c.addEventListener("pointermove", function (ev) {
            mig.flyt(mig.tilBord(ev));
            c.style.cursor = mig.tilstand === "traek" ? "grabbing"
                : (mig.hover === "glas" && mig.tilstand === "klar" ? (mig.fuld() ? "grab" : "not-allowed")
                : (mig.hover && mig.tilstand === "klar" ? "pointer" : "default"));
        });
        c.addEventListener("pointerup", function () { mig.op(); });
        c.addEventListener("pointercancel", function () { mig.op(); });
        c.addEventListener("pointerleave", function () { if (mig.tilstand !== "traek") mig.hover = null; });
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdater = function (dt) {
        var i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;

        /* Glasset glider */
        if (this.tilstand === "flyver" && this.bane) {
            var b = this.bane;
            b.t = Math.min(1, b.t + dt / b.varighed);
            var t = NK.blod(b.t);
            var top = Math.min(b.fra.y, b.til.y) - b.loeft;
            var u = 1 - t;
            var nx = u * u * u * b.fra.x + 3 * u * u * t * b.fra.x + 3 * u * t * t * b.til.x + t * t * t * b.til.x;
            var ny = u * u * u * b.fra.y + 3 * u * u * t * top + 3 * u * t * t * top + t * t * t * b.til.y;
            this.vinkelMaal = NK.klamp((nx - this.glas.x) / Math.max(dt, 0.001) * 0.0005, -0.2, 0.2);
            this.glas.x = nx;
            this.glas.y = ny;
            if (b.t >= 1) {
                this.bane = null;
                this.vinkelMaal = 0;
                b.efter.call(this);
            }
        } else if (this.tilstand !== "traek") {
            this.vinkelMaal = 0;
        }
        this.glas.vinkel = NK.mod(this.glas.vinkel, this.vinkelMaal, 10, dt);
        if (this.tilstand === "traek") this.vinkelMaal = NK.mod(this.vinkelMaal, 0, 6, dt);

        if (this.knaekUr >= 0) {
            this.knaekUr -= dt;
            if (this.knaekUr < 0) this.knaek();
        }

        if (this.tilstand === "fylder") {
            this.fyldUr -= dt;
            if (this.fyldUr <= 0) {
                this.tilstand = "klar";
                this.skalFyldes = false;
                this.aendret("klar");
            }
        }

        /* Gassens niveau og vandet i glasset */
        var maalNiveau = this.skalFyldes ? (this.tilstand === "fylder" ? 0 : M.MAKS) : this.h + this.o;
        this.niveau = NK.mod(this.niveau, maalNiveau, this.tilstand === "fylder" ? 7 : 5, dt);
        var underVand = this.glas.y + this.rekyl > S.BAD.overflade + 4 && this.glas.x > S.BAD.indreV && this.glas.x < S.BAD.indreH;
        /* Vandet under stregerne loeber ud af aabningen, naar glasset
           loeftes op af badet. */
        if (!this.knust && !underVand && this.vand > 0.7) {
            for (i = 0; i < 2; i++) {
                this.e.draaber.push({ x: this.glas.x + r(-24, 24), y: this.glas.y + this.rekyl + r(-2, 2), vy: r(20, 80), liv: 1 });
            }
        }
        this.vand = underVand ? NK.mod(this.vand, 1, 6, dt) : Math.max(0, this.vand - dt * 3);

        /* Nye molekyler kommer op gennem vandet */
        this.spawnUr -= dt;
        if (this.spawnUr <= 0 && (this.venter.h2 > 0 || this.venter.o2 > 0)) {
            this.nytMolekyle();
            this.spawnUr = 0.1;
        }

        this.opdaterMolekyler(dt);
        this.udstroem = Math.max(0, this.udstroem - dt);
        this.opdaterFri(dt);
        this.opdaterSkaar(dt);
        this.opdaterBobler(dt);
        this.opdaterEffekter(dt);

        this.flow.h2 = Math.max(0, this.flow.h2 - dt * 1.3);
        this.flow.o2 = Math.max(0, this.flow.o2 - dt * 1.3);
    };

    /* Varmebevaegelse for ét molekyle: retningen skifter tilfaeldigt, og
       farten soeger mod grund * massefaktor * molekylets egen tilfaeldige
       faktor fk. fk traekkes paa ny, naar molekylet "stoeder sammen" med
       andre, i gennemsnit fire gange i sekundet. */
    P.termisk = function (m, grund, dt, hast) {
        if (m.fk === undefined || Math.random() < dt * 4) m.fk = fordeling();
        var maal = grund * MASSEFAKTOR[m.type] * m.fk;
        var fart = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        var retning = fart > 0.001 ? Math.atan2(m.vy, m.vx) : r(0, Math.PI * 2);
        retning += (Math.random() - 0.5) * 14 * dt;
        var ny = NK.mod(fart, maal, hast, dt);
        m.vx = Math.cos(retning) * ny;
        m.vy = Math.sin(retning) * ny;
    };

    P.opdaterMolekyler = function (dt) {
        var bund = G.TOP + this.niveau * G.STREG;
        var varmeFart = Math.sqrt(1 + VARM_FAKTOR * this.varme);
        var aaben = this.udstroem > 0;
        var drift = aaben ? this.udstroemFart * this.udstroem / UDSTROEM_TID : 0;
        var glas = { x: this.glas.x, y: this.glas.y + this.rekyl, vinkel: this.glas.vinkel };
        this.varme = Math.max(0, this.varme - dt * 0.55);
        for (var i = this.molekyler.length - 1; i >= 0; i--) {
            var m = this.molekyler[i];
            var rad = S.MOLEKYLRADIUS[m.type];
            if (m.doer) {
                m.alfa -= dt * 2.4;
                if (m.alfa <= 0) { this.molekyler.splice(i, 1); continue; }
            } else {
                m.alfa = Math.min(1, m.alfa + dt * 4);
            }

            this.termisk(m, RUM_FART * varmeFart, dt, 5);
            m.x += m.vx * dt;
            m.y += (m.vy + drift) * dt;
            m.a += m.va * varmeFart * dt;

            var x0 = G.V + rad, x1 = G.HO - rad, y0 = G.TOP + rad;
            if (m.x < x0) { m.x = x0; m.vx = Math.abs(m.vx); }
            if (m.x > x1) { m.x = x1; m.vx = -Math.abs(m.vx); }
            if (m.y < y0) { m.y = y0; m.vy = Math.abs(m.vy); }

            /* Mens gassen stroemmer ud, er aabningen aaben for alle */
            if (aaben) {
                if (m.y > G.MUND + rad) {
                    this.frigoer(m, glas, drift, false);
                    this.molekyler.splice(i, 1);
                }
                continue;
            }
            var y1 = Math.max(y0, bund - rad);
            if (m.y > y1) { m.y = y1; m.vy = -Math.abs(m.vy); }
        }
        for (var d = this.dug.length - 1; d >= 0; d--) {
            var dr = this.dug[d];
            if (dr.doer) {
                dr.alfa = Math.min(dr.alfa, 1) - dt * 2;
                if (dr.alfa <= 0) this.dug.splice(d, 1);
            } else if (dr.alfa < 1) {
                dr.alfa += dt * 1.6;
            }
        }
    };

    /* Molekyler ude i rummet: stroemningen bremses af luften, den varme
       gas stiger, varmebevaegelsen falder, efterhaanden som de koeles af,
       og de forsvinder efter nogle sekunder. */
    P.opdaterFri = function (dt) {
        var brems = Math.max(0, 1 - 2.2 * dt);
        for (var i = this.fri.length - 1; i >= 0; i--) {
            var m = this.fri[i];
            var rad = S.MOLEKYLRADIUS[m.type];
            m.varme = Math.max(0, m.varme - dt * 0.45);
            var varmeFart = Math.sqrt(1 + VARM_FAKTOR * m.varme);
            this.termisk(m, RUM_FART * varmeFart, dt, 3);
            m.dx *= brems;
            m.dy = m.dy * brems - 80 * m.varme * dt;
            m.x += (m.vx + m.dx) * dt;
            m.y += (m.vy + m.dy) * dt;
            m.a += m.va * varmeFart * dt;
            var gulv = (m.x > S.BAD.indreV && m.x < S.BAD.indreH) ? S.BAD.overflade : S.BORD;
            if (m.y > gulv - rad) { m.y = gulv - rad; m.vy = -Math.abs(m.vy); m.dy = -Math.abs(m.dy) * 0.4; }
            m.liv -= dt;
            m.alfa = Math.min(1, m.liv);
            if (m.liv <= 0 || m.x < -500 || m.x > 1500 || m.y < -500) this.fri.splice(i, 1);
        }
    };

    P.opdaterSkaar = function (dt) {
        for (var i = this.skaar.length - 1; i >= 0; i--) {
            var s = this.skaar[i];
            if (s.doer) {
                s.alfa -= dt * 2.5;
                if (s.alfa <= 0) { this.skaar.splice(i, 1); continue; }
            }
            if (s.hvile) continue;

            var iBad = s.x > S.BAD.indreV && s.x < S.BAD.indreH && s.y > S.BAD.overflade;
            s.vy += TYNGDE * (iBad ? 0.25 : 1) * dt;
            if (iBad) {
                var vand = Math.max(0, 1 - 5 * dt);
                s.vx *= vand;
                s.vy *= vand;
                s.va *= vand;
            }
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.a += s.va * dt;

            /* Det laveste hjoerne rammer bordet (eller bunden af karret) */
            var c = Math.cos(s.a), si = Math.sin(s.a), lav = -1e9;
            for (var j = 0; j < s.pts.length; j++) lav = Math.max(lav, s.pts[j].x * si + s.pts[j].y * c);
            var gulv = (s.x > S.BAD.indreV && s.x < S.BAD.indreH) ? S.BAD.bund : S.BORD;
            if (s.y + lav > gulv) {
                s.y = gulv - lav;
                if (Math.abs(s.vy) < 70) {
                    s.vy = 0;
                    s.vx *= Math.max(0, 1 - 8 * dt);
                    s.va *= Math.max(0, 1 - 10 * dt);
                    if (Math.abs(s.vx) < 4 && Math.abs(s.va) < 0.3) s.hvile = true;
                } else {
                    s.vy = -s.vy * 0.3;
                    s.vx *= 0.7;
                    s.va *= 0.6;
                }
            }
            if (s.x < -300 || s.x > 1300) this.skaar.splice(i, 1);
        }
    };

    P.opdaterBobler = function (dt) {
        var hjemme = this.tilstand === "klar" || this.tilstand === "fylder";
        var graense = this.glas.y - (G.MUND - (G.TOP + this.niveau * G.STREG));
        for (var i = this.bobler.length - 1; i >= 0; i--) {
            var b = this.bobler[i];
            if (!hjemme) { this.bobler.splice(i, 1); continue; }
            if (b.vent > 0) { b.vent -= dt; continue; }
            b.y -= b.v * dt;
            b.x = b.x0 + (S.HJEM.x - b.x0) * NK.klamp((S.SLANGER.h2.ende.y - b.y) / 30, 0, 1) + Math.sin(this.tid * 9 + b.fase) * 1.6;
            if (b.y <= graense) this.bobler.splice(i, 1);
        }
    };

    P.opdaterEffekter = function (dt) {
        var e = this.e;
        var i;
        e.blink = Math.max(0, e.blink - dt * 3);
        e.stik = Math.max(0, e.stik - dt * 2.6);

        if (this.front >= 0) {
            this.front += dt / 0.16;
            if (this.front >= 1) {
                this.front = 1;
                this.frontAlfa -= dt * 4;
                if (this.frontAlfa <= 0) this.front = -1;
            }
        }

        for (i = e.ringe.length - 1; i >= 0; i--) {
            var ring = e.ringe[i];
            ring.r += dt * (260 + 520 * e.styrke);
            ring.liv -= dt * 2.2;
            if (ring.liv <= 0) e.ringe.splice(i, 1);
        }
        for (i = e.gnister.length - 1; i >= 0; i--) {
            var g = e.gnister[i];
            g.vx *= 1 - dt * 1.8;
            g.vy += TYNGDE * 0.35 * dt;
            g.x += g.vx * dt;
            g.y += g.vy * dt;
            g.liv -= dt * 1.4;
            if (g.liv <= 0) e.gnister.splice(i, 1);
        }
        for (i = e.roeg.length - 1; i >= 0; i--) {
            var p = e.roeg[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += dt * 18;
            p.liv -= dt * 0.6;
            if (p.liv <= 0) e.roeg.splice(i, 1);
        }
        for (i = e.draaber.length - 1; i >= 0; i--) {
            var d = e.draaber[i];
            d.vy += TYNGDE * dt;
            d.y += d.vy * dt;
            d.liv -= dt * 1.2;
            var iBad = d.x > S.BAD.indreV && d.x < S.BAD.indreH && d.y > S.BAD.overflade;
            if (d.liv <= 0 || d.y > S.BORD || iBad) e.draaber.splice(i, 1);
        }

        /* Glasset hopper op ved knaldet og falder til ro igen */
        this.rekylFart += (-this.rekyl * 90 - this.rekylFart * 9) * dt;
        this.rekyl += this.rekylFart * dt;
        this.ryst = this.ryst > 0.3 ? this.ryst * (1 - dt * 6) : 0;
    };

    /* ----- Tegning -------------------------------------------------------- */
    P.tilpas = function () {
        return this.laerred.tilpas();
    };

    P.tegn = function () {
        var L = this.laerred;
        var ctx = L.ctx;
        ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        var klar = this.tilstand === "klar";

        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);
        if (this.ryst > 0) ctx.translate((Math.random() - 0.5) * this.ryst, (Math.random() - 0.5) * this.ryst);

        S.tegnBaggrund(ctx);
        S.tegnFlaske(ctx, S.FLASKER.h2, klar && !this.fuld() && this.hover === "h2", this.flow.h2);
        S.tegnFlaske(ctx, S.FLASKER.o2, klar && !this.fuld() && this.hover === "o2", this.flow.o2);
        S.tegnSlange(ctx, "o2", this.flow.o2, this.tid);
        S.tegnSlange(ctx, "h2", this.flow.h2, this.tid);
        S.tegnBraender(ctx, this.tid);
        S.tegnSkaar(ctx, this.skaar, true);

        if (!this.knust) {
            S.tegnGlas(ctx, {
                x: this.glas.x, y: this.glas.y + this.rekyl, vinkel: this.glas.vinkel,
                niveau: this.niveau, vand: this.vand,
                molekyler: this.molekyler, dug: this.dug,
                front: this.front, frontAlfa: this.frontAlfa,
                fremhaev: klar && this.fuld() ? 1 : 0,
                s: sk.s
            }, this.tid);
        }
        S.tegnBad(ctx);
        S.tegnBobler(ctx, this.bobler);
        if (klar && this.fuld()) S.tegnPil(ctx, this.glas, this.tid);
        S.tegnKnald(ctx, this.e);
        S.tegnSkaar(ctx, this.skaar, false);
        for (var i = 0; i < this.fri.length; i++) S.tegnMolekyle(ctx, this.fri[i]);
        ctx.restore();
    };
}());
