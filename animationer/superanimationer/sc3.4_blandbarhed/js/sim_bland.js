/* =====================================================================
   sim_bland.js - fane 1: bliver det ét lag eller to?

   Paa bordet staar fem flasker, et stativ med tre reagensglas og et
   affaldsglas. Alt kan gribes med musen: traekkes en flaske hen over et
   glas og slippes, haeldes der en portion i. Traekkes et glas hen over
   et andet, haeldes indholdet over. Et klik er genvejen: flasken haelder
   i det valgte glas.

   Det, der lige er brugt, bliver haengende i haeldepositur over glasset
   med en gul ring ved siden af. Et klik gentager; traekkes den vaek,
   gaar den hjem.

   Naar der er to vaesker i et glas, slaar modellen op i D.par():
   blandbare vaesker bliver til ét lag, resten til to, med den letteste
   oeverst. En rystning giver en maelket emulsion, som skiller sig ad
   igen, fordi polariteten er den samme bagefter.

   Zoomboblen til hoejre er det samme glas set inde fra. Molekylerne
   soeger deres egen slags, naar vaeskerne ikke er blandbare, og ligger
   imellem hinanden, naar de er.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegn;
    var M = NK.Mol;

    /* ----- Maalene paa tegnebordet -------------------------------------- */
    var FLASKE_X = [56, 126, 196, 266, 336];
    var STATIV = { x0: 378, x1: 626, ribbe: 404, huller: [420, 502, 584] };
    var GLAS_TOP = 312;
    var AFFALD = { x0: 660, x1: 760, top: 400, bund: T.BORD };
    var BOBLE = { x: 850, y: 205, r: 140 };

    var PORTION = 2.4;              /* mL pr. klik: en femtedel af glasset */
    var SKILLETID = 6.5;            /* sekunder fra rystning til rene lag */
    var BOBLE_SKALA = 11;           /* zoomboblens maalestok: enheder pr. binding */

    /* ------------------------------------------------------------------
       LAGENE

       Et glas indeholder en liste af portioner. Lagene udledes hver gang:
       stoffer, der kan blandes indbyrdes, samles i ét lag, og lagene
       stilles op efter taethed med det letteste oeverst.
       ------------------------------------------------------------------ */
    function lagAf(stoffer) {
        var grupper = [], i, j, g;

        for (i = 0; i < stoffer.length; i++) {
            var id = stoffer[i].id, placeret = false;
            for (j = 0; j < grupper.length; j++) {
                g = grupper[j];
                var passer = true;
                for (var k = 0; k < g.ids.length; k++) {
                    if (!D.par(id, g.ids[k]).blandbar) { passer = false; break; }
                }
                if (passer) {
                    if (g.ids.indexOf(id) < 0) g.ids.push(id);
                    g.mL += stoffer[i].mL;
                    g.dele.push(stoffer[i]);
                    placeret = true;
                    break;
                }
            }
            if (!placeret) grupper.push({ ids: [id], mL: stoffer[i].mL, dele: [stoffer[i]] });
        }

        for (i = 0; i < grupper.length; i++) {
            g = grupper[i];
            var vaegt = 0, sum = 0, farve = null;
            for (j = 0; j < g.dele.length; j++) {
                var v = D.vaeske(g.dele[j].id);
                vaegt += v.taethed * g.dele[j].mL;
                sum += g.dele[j].mL;
                farve = farve === null ? v.farve : T.blandFarve(farve, v.farve, g.dele[j].mL / sum);
            }
            g.taethed = sum > 0 ? vaegt / sum : 1;
            g.farve = farve || "#888888";
        }

        /* Tungest nederst: listen gaar nedefra og op. */
        grupper.sort(function (a, b) { return b.taethed - a.taethed; });
        return grupper;
    }

    function samletMl(stoffer) {
        var s = 0;
        for (var i = 0; i < stoffer.length; i++) s += stoffer[i].mL;
        return s;
    }

    /* ------------------------------------------------------------------
       ET GLAS
       ------------------------------------------------------------------ */
    function Glas(nr) {
        this.nr = nr;
        this.stoffer = [];
        this.uklar = 0;             /* 0 = klart, 1 = maelket emulsion */
        this.skilleUr = 0;          /* sekunder tilbage af adskillelsen */
        this.rystet = 0;            /* hvor mange gange glasset er rystet */
        this.svaj = 0;              /* vaesken skvulper efter en rystning */
    }

    Glas.prototype.mL = function () { return samletMl(this.stoffer); };

    Glas.prototype.lag = function () { return lagAf(this.stoffer); };

    /* De forskellige stoffer i glasset, i den raekkefoelge de kom i. */
    Glas.prototype.ids = function () {
        var ud = [];
        for (var i = 0; i < this.stoffer.length; i++) {
            if (ud.indexOf(this.stoffer[i].id) < 0) ud.push(this.stoffer[i].id);
        }
        return ud;
    };

    Glas.prototype.tilsaet = function (id, mL) {
        for (var i = 0; i < this.stoffer.length; i++) {
            if (this.stoffer[i].id === id) { this.stoffer[i].mL += mL; return; }
        }
        this.stoffer.push({ id: id, mL: mL });
    };

    Glas.prototype.toem = function () {
        this.stoffer = [];
        this.uklar = 0;
        this.skilleUr = 0;
        this.rystet = 0;
    };

    Glas.prototype.ryst = function () {
        if (this.mL() < 0.1) return false;
        if (NK.Lyd) NK.Lyd.skvulp(1);
        this.rystet++;
        this.svaj = 1;
        if (this.lag().length > 1) {
            this.uklar = 1;
            this.skilleUr = SKILLETID;
        }
        return true;
    };

    /* ------------------------------------------------------------------
       SIMULATIONEN
       ------------------------------------------------------------------ */
    NK.SimBland = function () {
        this.L = new NK.Laerred(NK.el("bland-laerred"));
        this.br = NK.Brat(this.L);
        this.tid = 0;

        this.glas = [new Glas(1), new Glas(2), new Glas(3)];
        this.valgt = 0;
        this.visDelta = true;

        this.baaret = null;         /* { slags, nr, dx, dy } */
        this.svaev = null;          /* { slags, nr, maal } - det, der haenger over et glas */
        this.mus = { x: 0, y: 0, inde: false, nede: false, flyttet: 0 };
        this.ryste = { sum: 0, sidste: 0, skift: 0, ur: 0 };
        this.uheld = null;
        this.straale = null;
        this.besked = "";
        this.beskedUr = 0;

        /* Skemaet: hvilke par eleven selv har set. */
        this.skema = {};

        this.bobleMol = [];
        this.bobleId = "";

        this.koblPanel();
        this.koblMus();
        this.tilpas();
        if (this.laererStart) this.laererStart();
        this.opgaver = new NK.Opgaver("bland", OPGAVER, this, "Blandbarhed");
        this.opdaterPanel();
    };

    var P = NK.SimBland.prototype;

    P.tilpas = function () {
        this.L.tilpas();
        this.br = NK.Brat(this.L);
    };

    P.nulstil = function () {
        for (var i = 0; i < this.glas.length; i++) this.glas[i].toem();
        this.baaret = null;
        this.svaev = null;
        this.straale = null;
        this.uheld = null;
        this.bobleMol = [];
        this.bobleId = "";
        this.sig("");
        if (this.laererNyt) this.laererNyt();
        this.opdaterPanel();
    };

    P.sig = function (tekst) {
        this.besked = tekst;
        this.beskedUr = tekst ? 7 : 0;
    };

    /* ----- Panelet ------------------------------------------------------- */
    P.koblPanel = function () {
        var mig = this;

        NK.el("bland-ryst").addEventListener("click", function () { mig.rystValgte(); });
        NK.el("bland-toem").addEventListener("click", function () {
            mig.glas[mig.valgt].toem();
            mig.opdaterPanel();
        });
        NK.el("bland-delta").addEventListener("change", function () {
            mig.visDelta = this.checked;
        });

        var skema = NK.el("bland-skema");
        skema.addEventListener("click", function (e) {
            var c = e.target.closest ? e.target.closest("[data-par]") : null;
            if (!c) return;
            var dele = c.getAttribute("data-par").split("+");
            mig.visPar(dele[0], dele[1]);
        });
    };

    P.rystValgte = function () {
        var g = this.glas[this.valgt];
        if (g.mL() < 0.1) { this.sig("Glasset er tomt. Hæld to væsker i først."); return; }
        if (g.ids().length < 2) { this.sig("Der er kun ét stof i glasset. Hæld en væske mere i."); return; }
        g.ryst();
        this.noterPar(g);
        this.opdaterPanel();
    };

    /* Et par er set, naar de to vaesker har vaeret i glas sammen. */
    P.noterPar = function (g) {
        var ids = g.ids();
        for (var i = 0; i < ids.length; i++) {
            for (var j = i + 1; j < ids.length; j++) {
                var a = D.nr(ids[i]) <= D.nr(ids[j]) ? ids[i] : ids[j];
                var b = a === ids[i] ? ids[j] : ids[i];
                this.skema[a + "+" + b] = true;
            }
        }
    };

    /* Klik i skemaet: hvad er der sket med det par? */
    P.visPar = function (a, b) {
        if (!this.skema[a + "+" + b]) {
            this.sig("Prøv de to væsker i et glas først.");
            return;
        }
        var p = D.par(a, b);
        var va = D.vaeske(a), vb = D.vaeske(b);
        var svar = p.blandbar
            ? va.navn + " og " + vb.navn + " blandes til ét lag."
            : va.navn + " og " + vb.navn + " giver to lag med " + D.oeverst(a, b).navn + " øverst.";
        this.sig(svar + " " + p.hvorfor);
    };

    /* ----- Musen ---------------------------------------------------------- */
    P.koblMus = function () {
        var mig = this;
        var c = this.L.canvas;

        function pos(e) {
            var r = c.getBoundingClientRect();
            return NK.tilBord(mig.br, e.clientX - r.left, e.clientY - r.top);
        }

        c.addEventListener("mousemove", function (e) {
            var p = pos(e);
            if (mig.mus.nede) mig.mus.flyttet += Math.hypot(p.x - mig.mus.x, p.y - mig.mus.y);
            mig.registrerRyst(p);
            mig.mus.x = p.x;
            mig.mus.y = p.y;
            mig.mus.inde = true;
        });

        c.addEventListener("mouseleave", function () {
            mig.mus.inde = false;
            mig.slip();
        });

        c.addEventListener("mousedown", function (e) {
            var p = pos(e);
            mig.mus.x = p.x; mig.mus.y = p.y;
            mig.mus.inde = true;
            mig.mus.nede = true;
            mig.mus.flyttet = 0;
            mig.ryste = { sum: 0, sidste: 0, skift: 0, ur: 0 };

            var r = c.getBoundingClientRect();
            if (mig.laererKlik && mig.laererKlik(e.clientX - r.left, e.clientY - r.top)) return;
            if (mig.laererOptaget && mig.laererOptaget()) return;

            mig.tag(p);
        });

        window.addEventListener("mouseup", function () {
            if (!mig.mus.nede) return;
            mig.mus.nede = false;
            mig.slip();
        });

        /* Beroering: samme greb som musen. */
        c.addEventListener("touchstart", function (e) {
            if (!e.touches.length) return;
            e.preventDefault();
            var r = c.getBoundingClientRect();
            var p = NK.tilBord(mig.br, e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
            mig.mus.x = p.x; mig.mus.y = p.y; mig.mus.nede = true; mig.mus.flyttet = 0;
            mig.tag(p);
        }, { passive: false });

        c.addEventListener("touchmove", function (e) {
            if (!e.touches.length) return;
            e.preventDefault();
            var r = c.getBoundingClientRect();
            var p = NK.tilBord(mig.br, e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
            mig.mus.flyttet += Math.hypot(p.x - mig.mus.x, p.y - mig.mus.y);
            mig.registrerRyst(p);
            mig.mus.x = p.x; mig.mus.y = p.y;
        }, { passive: false });

        c.addEventListener("touchend", function () {
            mig.mus.nede = false;
            mig.slip();
        });
    };

    /* Rystes et baaret glas frem og tilbage, taelles retningsskiftene. */
    P.registrerRyst = function (p) {
        if (!this.baaret || this.baaret.slags !== "glas") return;
        var dx = p.x - this.mus.x;
        if (Math.abs(dx) < 3) return;
        var retning = dx > 0 ? 1 : -1;
        if (this.ryste.sidste && retning !== this.ryste.sidste) this.ryste.skift++;
        this.ryste.sidste = retning;
        this.ryste.sum += Math.abs(dx);
        this.ryste.ur = 0.8;
        if (this.ryste.skift >= 4 && this.ryste.sum > 260) {
            var g = this.glas[this.baaret.nr];
            if (g.ryst()) {
                this.noterPar(g);
                this.opdaterPanel();
            }
            this.ryste.skift = 0;
            this.ryste.sum = 0;
        }
    };

    /* ----- Hvad ligger hvor ------------------------------------------------ */
    P.flaskeHjem = function (i) {
        return { x: FLASKE_X[i], y: T.BORD, v: 0 };
    };

    /* Haeldepositur: flasken haenger over glasset med tuden lige over
       aabningen. Stillingen regnes ud af tuden, saa straalen rammer. */
    P.haeldePositur = function (glasNr) {
        var v = 1.0;
        var c = Math.cos(v), s = Math.sin(v);
        var lx = T.FL.hals / 2, ly = -T.FL.h;
        var maalX = STATIV.huller[glasNr], maalY = GLAS_TOP - 30;
        return {
            x: maalX - (lx * c - ly * s),
            y: maalY - (lx * s + ly * c),
            v: v
        };
    };

    P.flaskePositur = function (i) {
        if (this.baaret && this.baaret.slags === "flaske" && this.baaret.nr === i) {
            return { x: this.mus.x + this.baaret.dx, y: this.mus.y + this.baaret.dy, v: 0 };
        }
        if (this.svaev && this.svaev.slags === "flaske" && this.svaev.nr === i) {
            return this.haeldePositur(this.svaev.maal);
        }
        return this.flaskeHjem(i);
    };

    P.glasTop = function (i) {
        if (this.baaret && this.baaret.slags === "glas" && this.baaret.nr === i) {
            var ryster = this.ryste.ur > 0 ? Math.sin(this.tid * 44) * 7 : 0;
            return {
                x: this.mus.x + this.baaret.dx + ryster,
                y: this.mus.y + this.baaret.dy,
                loest: true
            };
        }
        return { x: STATIV.huller[i], y: GLAS_TOP, loest: false };
    };

    /* Hvad er under punktet? */
    P.underMus = function (p) {
        var i;
        /* Det, der svaever, har foerste prioritet. */
        if (this.svaev && this.svaev.slags === "flaske") {
            /* Feltet gaar laengere ud til hoejre end til venstre, saa
               den gule ring med pilen ogsaa kan klikkes. */
            var sp = this.haeldePositur(this.svaev.maal);
            if (p.x > sp.x - 54 && p.x < sp.x + 84 &&
                Math.abs(p.y - (sp.y - T.FL.h / 2)) < 78) {
                return { slags: "flaske", nr: this.svaev.nr };
            }
        }
        for (i = 0; i < this.glas.length; i++) {
            var g = this.glasTop(i);
            if (Math.abs(p.x - g.x) < T.RG.b / 2 + 6 && p.y > g.y - 10 && p.y < g.y + T.RG.h + 6) {
                return { slags: "glas", nr: i };
            }
        }
        for (i = 0; i < FLASKE_X.length; i++) {
            var f = this.flaskePositur(i);
            if (Math.abs(p.x - f.x) < T.FL.b / 2 + 4 && p.y > f.y - T.FL.h - 14 && p.y < f.y + 4) {
                return { slags: "flaske", nr: i };
            }
        }
        if (p.x > AFFALD.x0 - 8 && p.x < AFFALD.x1 + 8 && p.y > AFFALD.top - 12 && p.y < AFFALD.bund) {
            return { slags: "affald" };
        }
        return null;
    };

    P.tag = function (p) {
        var t = this.underMus(p);
        if (!t) return;

        if (t.slags === "flaske") {
            var f = this.flaskePositur(t.nr);
            this.baaret = { slags: "flaske", nr: t.nr, dx: f.x - p.x, dy: f.y - p.y };
        } else if (t.slags === "glas") {
            var g = this.glasTop(t.nr);
            this.valgt = t.nr;
            this.baaret = { slags: "glas", nr: t.nr, dx: g.x - p.x, dy: g.y - p.y };
            this.opdaterPanel();
        }
    };

    P.slip = function () {
        var b = this.baaret;
        this.baaret = null;
        this.ryste.sidste = 0;
        if (!b) return;

        var p = { x: this.mus.x, y: this.mus.y };
        var klik = this.mus.flyttet < 9;

        /* Et klik paa noget, der allerede svaever: gentag handlingen. */
        if (klik && b.slags === "flaske" && this.svaev &&
            this.svaev.slags === "flaske" && this.svaev.nr === b.nr) {
            this.haeldFlaske(b.nr, this.svaev.maal);
            return;
        }
        if (klik && b.slags === "flaske") {
            this.haeldFlaske(b.nr, this.valgt);
            return;
        }
        if (klik && b.slags === "glas") return;   /* klik vaelger kun */

        /* Slippes det foran bordkanten, falder det paa gulvet. */
        if (p.y > T.GULV) { this.tabt(b); return; }

        var maal = this.underMus(p);
        if (b.slags === "flaske") {
            if (maal && maal.slags === "glas") this.haeldFlaske(b.nr, maal.nr);
            else if (maal && maal.slags === "affald") this.sig("Flasken hører ikke i affaldsglasset.");
        } else if (b.slags === "glas") {
            if (maal && maal.slags === "glas" && maal.nr !== b.nr) this.haeldGlas(b.nr, maal.nr);
            else if (maal && maal.slags === "affald") this.toemIAffald(b.nr);
        }
    };

    /* ----- Handlingerne ---------------------------------------------------- */
    P.haeldFlaske = function (flaskeNr, glasNr) {
        var v = D.VAESKER[flaskeNr];
        var g = this.glas[glasNr];
        this.valgt = glasNr;
        this.svaev = { slags: "flaske", nr: flaskeNr, maal: glasNr,
                       fra: { x: this.mus.x, y: this.mus.y } };

        var plads = T.RG.maks - g.mL();
        if (plads <= 0.05) {
            this.overloeb(glasNr, v);
            return;
        }
        var mL = Math.min(PORTION, plads);
        g.tilsaet(v.id, mL);
        g.uklar = Math.max(g.uklar, 0);
        this.noterPar(g);

        var fp = this.haeldePositur(glasNr);
        var tud = T.flaskeTud(fp);
        this.straale = { x0: tud.x, y0: tud.y, x1: STATIV.huller[glasNr], y1: GLAS_TOP + 16, farve: v.farve, ur: 0.55 };
        if (NK.Lyd) NK.Lyd.haeld();
        this.opdaterPanel();
    };

    P.overloeb = function (glasNr, v) {
        var g = this.glas[glasNr];
        this.sig("Glasset er fuldt. Det løber over.");
        this.uheld = { slags: "pyt", x: STATIV.huller[glasNr], farve: v.farve, ur: 0 };
        g.uklar = Math.max(g.uklar, 0.2);
        if (this.laererUheld) this.laererUheld("overloeb");
    };

    P.haeldGlas = function (fra, til) {
        var a = this.glas[fra], b = this.glas[til];
        if (a.mL() < 0.05) { this.sig("Glasset er tomt."); return; }
        var plads = T.RG.maks - b.mL();
        var i;
        for (i = 0; i < a.stoffer.length && plads > 0.05; i++) {
            var mL = Math.min(a.stoffer[i].mL, plads);
            b.tilsaet(a.stoffer[i].id, mL);
            a.stoffer[i].mL -= mL;
            plads -= mL;
        }
        a.stoffer = a.stoffer.filter(function (s) { return s.mL > 0.02; });
        if (!a.stoffer.length) a.toem();
        b.uklar = Math.max(b.uklar, 0.35);
        b.skilleUr = Math.max(b.skilleUr, 2.5);
        this.valgt = til;
        this.noterPar(b);
        if (NK.Lyd) NK.Lyd.haeld();
        this.opdaterPanel();
    };

    P.toemIAffald = function (nr) {
        if (this.glas[nr].mL() < 0.05) return;
        this.glas[nr].toem();
        if (NK.Lyd) NK.Lyd.haeld();
        this.sig("Glasset er tømt i affaldsglasset.");
        this.opdaterPanel();
    };

    /* Noget er tabt paa gulvet. Glas gaar i stykker. */
    P.tabt = function (b) {
        if (b.slags === "glas") {
            var g = this.glas[b.nr];
            var farve = g.lag().length ? g.lag()[0].farve : "#8fa2b6";
            g.toem();
            this.uheld = { slags: "knust", nr: b.nr, x: NK.klamp(this.mus.x, 40, 960), farve: farve, ur: 0 };
            this.sig("Reagensglasset gik i gulvet.");
            if (NK.Lyd) NK.Lyd.knus();
            if (this.laererUheld) this.laererUheld("knust");
        } else {
            this.uheld = { slags: "spild", x: NK.klamp(this.mus.x, 40, 960), farve: D.VAESKER[b.nr].farve, ur: 0 };
            this.sig("Flasken væltede på gulvet.");
            if (this.laererUheld) this.laererUheld("spild");
        }
    };

    /* Kaldes af laereren, naar han har ryddet op. */
    P.ryddet = function () {
        this.uheld = null;
    };

    /* ----- Tiden ----------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var i;

        if (this.beskedUr > 0) {
            this.beskedUr -= dt;
            if (this.beskedUr <= 0) this.besked = "";
        }
        if (this.ryste.ur > 0) this.ryste.ur -= dt;
        if (this.straale) {
            this.straale.ur -= dt;
            /* Straalen hoerer til flasken i haeldepositur. Gaar flasken
               hjem, stopper den med det samme. */
            if (this.straale.ur <= 0 || !this.svaev) this.straale = null;
        }
        if (this.uheld) this.uheld.ur += dt;

        for (i = 0; i < this.glas.length; i++) {
            var g = this.glas[i];
            if (g.skilleUr > 0) {
                g.skilleUr -= dt;
                /* Det sidste stykke af adskillelsen er den, der ses:
                   uklarheden falder blodt til nul. */
                g.uklar = NK.klamp(g.skilleUr / SKILLETID, 0, 1);
                if (g.skilleUr <= 0) { g.skilleUr = 0; g.uklar = 0; this.opdaterPanel(); }
            }
            if (g.svaj > 0) g.svaj = Math.max(0, g.svaj - dt * 0.8);
        }

        /* Flyttes musen vaek fra glasset, gaar flasken hjem igen. Den
           skal foerst have flyttet sig fra det sted, hvor flasken blev
           sat i haeldepositur: ellers ville et klik paa en flaske langt
           fra glasset sende den hjem med det samme. */
        if (this.svaev && !this.baaret) {
            var sp = this.haeldePositur(this.svaev.maal);
            var langt = Math.hypot(this.mus.x - sp.x, this.mus.y - (sp.y - T.FL.h / 2));
            var flyttet = Math.hypot(this.mus.x - this.svaev.fra.x, this.mus.y - this.svaev.fra.y);
            if (!this.mus.inde || (flyttet > 30 && langt > 190)) this.svaev = null;
        }

        this.opdaterBoble(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        if (this.opgaver) this.opgaver.opdater();
    };

    /* ------------------------------------------------------------------
       ZOOMBOBLEN

       Molekylerne ligger i en cirkel. To krafter afgoer billedet:
       naboer af samme slags og blandbare naboer traekker i hinanden,
       mens ublandbare skubber fra. Taetheden giver et lille traek nedad,
       saa det tunge lag ogsaa ligger nederst i boblen.
       ------------------------------------------------------------------ */
    P.opdaterBoble = function (dt) {
        var g = this.glas[this.valgt];
        var ids = g.ids();
        var noegle = ids.join(",") + ":" + Math.round(g.mL() * 4);

        if (noegle !== this.bobleId) {
            this.byggBoble(g, ids);
            this.bobleId = noegle;
        }
        if (!this.bobleMol.length) return;

        var mol = this.bobleMol;
        var R = BOBLE.r - 12;
        var i, j;
        var skridt = Math.min(dt, 0.04);

        /* Rystes glasset, kastes molekylerne rundt. */
        if (g.uklar > 0.55) {
            for (i = 0; i < mol.length; i++) {
                mol[i].vx += (Math.random() - 0.5) * 900 * skridt;
                mol[i].vy += (Math.random() - 0.5) * 900 * skridt;
            }
        }

        for (i = 0; i < mol.length; i++) {
            var a = mol[i];
            for (j = i + 1; j < mol.length; j++) {
                var b = mol[j];
                var dx = b.x - a.x, dy = b.y - a.y;
                var d2 = dx * dx + dy * dy;
                var mind = a.r + b.r;
                if (d2 > (mind * 2.4) * (mind * 2.4) || d2 < 1e-6) continue;
                var d = Math.sqrt(d2);
                var nx = dx / d, ny = dy / d;

                /* Haard kerne: to molekyler kan ikke ligge oven i hinanden */
                if (d < mind) {
                    var skub = (mind - d) * 26;
                    a.vx -= nx * skub * skridt; a.vy -= ny * skub * skridt;
                    b.vx += nx * skub * skridt; b.vy += ny * skub * skridt;
                }

                /* Tiltraekning eller frastoedning efter blandbarheden */
                var kraft = a.id === b.id ? 34 : (D.par(a.id, b.id).blandbar ? 30 : -46);
                var raekke = NK.klamp(1 - (d - mind) / (mind * 1.4), 0, 1);
                var f = kraft * raekke;
                a.vx += nx * f * skridt; a.vy += ny * f * skridt;
                b.vx -= nx * f * skridt; b.vy -= ny * f * skridt;
            }
        }

        /* Lagdelingen i boblen skal vise det samme som glasset. Den
           taender kun, naar glasset faktisk har to lag: vand og ethanol
           har meget forskellig taethed og skal alligevel blive liggende
           mellem hinanden. Skubbet er lige kraftigt op og ned, uanset
           hvor lille taethedsforskellen er, saa billedet bliver til at
           laese ogsaa for vand og olie (1,00 mod 0,92 g/mL). */
        var adskilt = g.lag().length > 1 && g.uklar < 0.5;
        var lav = Infinity, hoej = -Infinity;
        for (i = 0; i < mol.length; i++) {
            lav = Math.min(lav, mol[i].taethed);
            hoej = Math.max(hoej, mol[i].taethed);
        }
        var midtT = (lav + hoej) / 2;

        for (i = 0; i < mol.length; i++) {
            var m = mol[i];
            if (adskilt) m.vy += Math.sign(m.taethed - midtT) * 130 * skridt;
            m.vx *= Math.pow(0.05, skridt);                    /* kraftig daempning */
            m.vy *= Math.pow(0.05, skridt);
            m.x += m.vx * skridt;
            m.y += m.vy * skridt;
            m.vinkel += m.dv * skridt;

            var l = Math.hypot(m.x, m.y);
            if (l > R - m.r) {
                var k = (R - m.r) / l;
                m.x *= k; m.y *= k;
                m.vx *= 0.3; m.vy *= 0.3;
            }
        }
    };

    P.byggBoble = function (g, ids) {
        this.bobleMol = [];
        if (!ids.length) return;

        var samlet = g.mL();
        var R = BOBLE.r - 14;
        var areal = Math.PI * R * R;

        for (var k = 0; k < ids.length; k++) {
            var v = D.vaeske(ids[k]);
            var del = 0;
            for (var s = 0; s < g.stoffer.length; s++) {
                if (g.stoffer[s].id === v.id) del += g.stoffer[s].mL;
            }

            /* Molekylerne skal fylde boblen ud, ellers kan der hverken
               blive ét lag eller to at se paa. Hvert stof faar sin andel
               af arealet; store molekyler faar faerre, men stoerre
               kugler, saa forskellen i stoerrelse bliver ved at kunne
               ses. */
            var form = M.form(v);
            var A = areal * (del / samlet) * 0.88;
            var antal = NK.klamp(Math.round(A / (Math.PI * Math.pow(form.yder * BOBLE_SKALA, 2))), 4, 34);
            var r = Math.sqrt(A / (Math.PI * antal));

            for (var i = 0; i < antal; i++) {
                var vinkel = Math.random() * Math.PI * 2;
                var l = Math.sqrt(Math.random()) * (R - r);
                this.bobleMol.push({
                    id: v.id,
                    form: form,
                    taethed: v.taethed,
                    skala: r / form.yder,
                    r: r,
                    x: Math.cos(vinkel) * l,
                    y: Math.sin(vinkel) * l,
                    vx: 0, vy: 0,
                    vinkel: Math.random() * Math.PI * 2,
                    dv: NK.r(-0.5, 0.5)
                });
            }
        }
    };

    /* ----- Panelet --------------------------------------------------------- */
    P.opdaterPanel = function () {
        var g = this.glas[this.valgt];
        var lag = g.lag();
        var ids = g.ids();

        NK.saetTekst("bland-glasnr", String(this.valgt + 1));

        /* Indholdet */
        var raekker = "";
        if (!g.stoffer.length) {
            raekker = '<div class="talraekke"><span>Tomt glas</span><span class="tal">0 mL</span></div>';
        } else {
            for (var i = 0; i < g.stoffer.length; i++) {
                var v = D.vaeske(g.stoffer[i].id);
                raekker += '<div class="talraekke"><span><i class="prik" style="background:' + v.farve +
                           '"></i>' + v.navn + "</span><span class=\"tal\">" +
                           NK.tal(g.stoffer[i].mL, 1) + " mL</span></div>";
            }
        }
        NK.saetHTML("bland-indhold", raekker);

        /* Resultatet */
        var maerke = "", tekst = "";
        if (ids.length < 2) {
            maerke = '<span class="maerke">ikke blandet endnu</span>';
            tekst = ids.length ? "Hæld en væske mere i glasset." : "Træk en flaske hen over glasset, eller klik på den.";
        } else if (g.uklar > 0.25) {
            maerke = '<span class="maerke orange">emulsion</span>';
            tekst = "Dråberne er revet fra hinanden. Se, hvad der sker, når glasset får lov at stå.";
        } else if (lag.length === 1) {
            maerke = '<span class="maerke groen">ét lag</span>';
            tekst = this.parTekst(ids);
        } else {
            maerke = '<span class="maerke orange">' + (lag.length === 2 ? "to lag" : lag.length + " lag") + "</span>";
            tekst = this.parTekst(ids) + " Øverst ligger " +
                    D.vaeske(lag[lag.length - 1].ids[0]).navn + ", fordi det er det letteste.";
        }
        NK.saetHTML("bland-maerke", maerke);
        NK.saetTekst("bland-resultat", tekst);

        NK.saetTekst("bland-status", this.statusTekst());
        this.tegnSkema();
    };

    P.parTekst = function (ids) {
        if (ids.length !== 2) return "";
        return D.par(ids[0], ids[1]).hvorfor;
    };

    /* Skemaet fyldes ud, efterhaanden som eleven proever parrene. */
    P.tegnSkema = function () {
        var V = D.VAESKER, i, j;
        var h = '<table class="skema"><tr><th></th>';
        for (j = 0; j < V.length; j++) h += "<th>" + V[j].kort + "</th>";
        h += "</tr>";
        for (i = 0; i < V.length; i++) {
            h += "<tr><th>" + V[i].kort + "</th>";
            for (j = 0; j < V.length; j++) {
                if (i === j) { h += '<td class="selv">-</td>'; continue; }
                var a = i < j ? V[i].id : V[j].id;
                var b = i < j ? V[j].id : V[i].id;
                if (!this.skema[a + "+" + b]) { h += '<td class="ukendt">?</td>'; continue; }
                var p = D.par(a, b);
                h += '<td class="' + (p.blandbar ? "ja" : "nej") + '" data-par="' + a + "+" + b + '" title="' +
                     V[i].navn + " og " + V[j].navn + '">' + (p.blandbar ? "1" : "2") + "</td>";
            }
            h += "</tr>";
        }
        h += "</table>";
        NK.saetHTML("bland-skema", h);
    };

    /* ----- Tegningen -------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx;
        var br = this.br;
        var i;

        this.L.ryd("#0f1217");
        ctx.save();
        ctx.translate(br.dx, br.dy);
        ctx.scale(br.s, br.s);

        T.rum(ctx, T.BREDDE, T.HOEJDE);
        T.bord(ctx, T.BREDDE);

        /* Pyt paa gulvet efter et uheld */
        if (this.uheld) this.tegnUheld(ctx);

        /* Affaldsglasset */
        var overAffald = this.baaret && this.baaret.slags === "glas" &&
                         this.mus.x > AFFALD.x0 - 8 && this.mus.x < AFFALD.x1 + 8 &&
                         this.mus.y > AFFALD.top - 12 && this.mus.y < AFFALD.bund;
        T.skygge(ctx, (AFFALD.x0 + AFFALD.x1) / 2, T.BORD + 3, 58);
        T.baegerglas(ctx, AFFALD.x0, AFFALD.x1, AFFALD.top, AFFALD.bund, null,
                     { etiket: "affald", fremhaev: overAffald });

        /* Stativet og glassene */
        T.skygge(ctx, (STATIV.x0 + STATIV.x1) / 2, T.BORD + 3, 132);
        T.stativ(ctx, STATIV);
        T.stativNumre(ctx, STATIV);

        for (i = 0; i < this.glas.length; i++) this.tegnGlas(ctx, i);

        /* Flaskerne */
        for (i = 0; i < D.VAESKER.length; i++) this.tegnFlaske(ctx, i);

        /* Straalen, mens der haeldes */
        if (this.straale) {
            var s = this.straale;
            T.straale(ctx, s.x0, s.y0, s.x1, s.y1, s.farve, 5);
        }

        this.tegnBoble(ctx);

        if (this.laererTegnOver) this.laererTegnOver(ctx);
        ctx.restore();

        NK.saetTekst("bland-status", this.statusTekst());
    };

    P.statusTekst = function () {
        if (this.besked) return this.besked;
        var g = this.glas[this.valgt];
        if (!g.mL()) return "Træk en flaske hen over et reagensglas, eller klik på flasken.";
        if (g.ids().length < 2) return "Der er ét stof i glas " + (this.valgt + 1) + ". Hæld en væske mere i.";
        if (g.uklar > 0.25) return "Emulsionen står og skiller sig ad. Vent, og se hvad der bliver tilbage.";
        return "Glas " + (this.valgt + 1) + ": " + (g.lag().length === 1 ? "ét lag." : "to lag.");
    };

    P.tegnGlas = function (ctx, i) {
        var g = this.glas[i];
        var pos = this.glasTop(i);
        var lag = g.lag();
        var liste = [];

        /* Rystes glasset, er alt ét maelket lag. */
        if (g.uklar > 0.55 && lag.length > 1) {
            var samlet = 0, farve = lag[0].farve;
            for (var k = 0; k < lag.length; k++) {
                samlet += lag[k].mL;
                if (k) farve = T.blandFarve(farve, lag[k].farve, lag[k].mL / samlet);
            }
            liste.push({ farve: farve, mL: samlet, uklar: g.uklar });
        } else {
            for (var j = 0; j < lag.length; j++) {
                liste.push({ farve: lag[j].farve, mL: lag[j].mL, uklar: g.uklar * 0.7 });
            }
        }

        if (pos.loest) T.skygge(ctx, pos.x, T.BORD + 3, 40);
        T.reagensglas(ctx, pos.x, pos.y, liste, { valgt: i === this.valgt });
    };

    P.tegnFlaske = function (ctx, i) {
        var v = D.VAESKER[i];
        var p = this.flaskePositur(i);
        var baaret = this.baaret && this.baaret.slags === "flaske" && this.baaret.nr === i;
        var svaever = this.svaev && this.svaev.slags === "flaske" && this.svaev.nr === i;
        var over = !this.baaret && this.mus.inde && !svaever &&
                   Math.abs(this.mus.x - p.x) < T.FL.b / 2 + 4 &&
                   this.mus.y > p.y - T.FL.h - 14 && this.mus.y < p.y + 4;

        if (!baaret && !svaever) T.skygge(ctx, p.x, T.BORD + 2, 38);
        T.flaske(ctx, p, v, { fremhaev: over || baaret });

        /* Den gule ring: et klik gentager. */
        if (svaever) {
            var rx = p.x + 62, ry = p.y - T.FL.h * 0.55;
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(rx, ry, 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(242, 197, 61, 0.9)";
            ctx.beginPath();
            ctx.moveTo(rx - 4, ry - 6);
            ctx.lineTo(rx + 6, ry);
            ctx.lineTo(rx - 4, ry + 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    };

    P.tegnUheld = function (ctx) {
        var u = this.uheld;
        var y = (T.GULV + T.HOEJDE) / 2;
        var b = NK.klamp(u.ur * 40, 10, 70);
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = T.medAlfa(u.farve, 0.7);
        ctx.beginPath();
        ctx.ellipse(u.x, y, b, b * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();
        if (u.slags === "knust") {
            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = "rgba(210, 228, 244, 0.7)";
            ctx.lineWidth = 2;
            for (var i = 0; i < 7; i++) {
                var a = (i / 7) * Math.PI * 2 + 0.4;
                var l = 12 + (i % 3) * 9;
                ctx.beginPath();
                ctx.moveTo(u.x + Math.cos(a) * 8, y + Math.sin(a) * 3);
                ctx.lineTo(u.x + Math.cos(a) * (8 + l), y + Math.sin(a) * (3 + l * 0.3));
                ctx.stroke();
            }
        }
        ctx.restore();
    };

    /* ----- Zoomboblen -------------------------------------------------------- */
    P.tegnBoble = function (ctx) {
        var g = this.glas[this.valgt];
        var pos = this.glasTop(this.valgt);
        T.boble(ctx, BOBLE.x, BOBLE.y, BOBLE.r, { x: pos.x + 20, y: pos.y + 60 });

        ctx.save();
        ctx.beginPath();
        ctx.arc(BOBLE.x, BOBLE.y, BOBLE.r - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(BOBLE.x, BOBLE.y);

        if (!this.bobleMol.length) {
            ctx.fillStyle = "rgba(160, 176, 196, 0.6)";
            ctx.font = "600 15px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Vælg et glas med væske i", 0, 0);
        } else {
            for (var i = 0; i < this.bobleMol.length; i++) {
                var m = this.bobleMol[i];
                M.tegn(ctx, m.form, m.x, m.y, m.vinkel, m.skala, { delta: this.visDelta });
            }
        }
        ctx.restore();

        T.bobleKant(ctx, BOBLE.x, BOBLE.y, BOBLE.r);

        /* Overskrift over boblen */
        ctx.save();
        ctx.fillStyle = "rgba(200, 214, 230, 0.88)";
        ctx.font = "700 14px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        var overskrift = "Glas " + (this.valgt + 1) + " set inde fra";
        if (g.uklar > 0.25) overskrift += " (rystet)";
        ctx.fillText(overskrift, BOBLE.x, BOBLE.y - BOBLE.r - 14);
        ctx.restore();

        if (this.bobleMol.length) this.tegnTegnforklaring(ctx);
    };

    /* Tegnforklaringen under boblen: hvad kuglerne betyder. Den staar her
       og ikke i panelet, fordi den hoerer til billedet. */
    P.tegnTegnforklaring = function (ctx) {
        var punkter = [
            { farve: M.OXYGEN, tekst: "oxygen, δ−" },
            { farve: M.HYDROGEN, tekst: "hydrogen, δ+" },
            { farve: M.CARBON, tekst: "carbon" }
        ];
        var y = BOBLE.y + BOBLE.r + 24;

        ctx.save();
        ctx.font = "600 13px 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";

        var mellemrum = 16, bredde = 0, i;
        for (i = 0; i < punkter.length; i++) {
            punkter[i].b = 15 + ctx.measureText(punkter[i].tekst).width;
            bredde += punkter[i].b + (i ? mellemrum : 0);
        }

        var x = BOBLE.x - bredde / 2;
        for (i = 0; i < punkter.length; i++) {
            ctx.fillStyle = punkter[i].farve;
            ctx.beginPath();
            ctx.arc(x + 5, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(180, 194, 210, 0.85)";
            ctx.fillText(punkter[i].tekst, x + 15, y);
            x += punkter[i].b + mellemrum;
        }

        if (this.visDelta) {
            ctx.fillStyle = "rgba(255, 214, 120, 0.85)";
            ctx.textAlign = "center";
            ctx.fillText("Det gule skær er molekylets polære ende.", BOBLE.x, y + 20);
        }
        ctx.restore();
    };

    /* Laereren stiller sig ved stativet. */
    P.laererPladsBord = function () {
        return STATIV.huller[1];
    };

    /* ------------------------------------------------------------------
       OPGAVERNE

       Formatet staar i js/opgave.js. Hver funktion giver én opgave.
       ------------------------------------------------------------------ */
    function tomtGlas(sim) {
        for (var i = 0; i < sim.glas.length; i++) {
            if (sim.glas[i].mL() < 0.05) return i;
        }
        sim.glas[0].toem();
        return 0;
    }

    /* Fyld et glas med to vaesker, saa svaret kan ses. */
    function fyld(sim, a, b) {
        var nr = tomtGlas(sim);
        var g = sim.glas[nr];
        g.toem();
        g.tilsaet(a, 4.8);
        g.tilsaet(b, 4.8);
        sim.valgt = nr;
        sim.noterPar(g);
        sim.opdaterPanel();
        return nr;
    }

    /* 1. Forudsig resultatet af et par. */
    function opgForudsig(sim) {
        var par = NK.tilfaeldig([
            ["vand", "heptan"], ["vand", "olie"], ["vand", "ethanol"],
            ["vand", "hexanol"], ["ethanol", "heptan"], ["ethanol", "olie"],
            ["hexanol", "heptan"]
        ]);
        var va = D.vaeske(par[0]), vb = D.vaeske(par[1]);
        var p = D.par(par[0], par[1]);
        return {
            tekst: "Du hælder " + va.navn + " og " + vb.navn + " i samme glas. Bliver det ét lag eller to?",
            valg: ["Ét lag", "To lag"],
            rigtig: p.blandbar ? 0 : 1,
            hint: "Se på molekylerne. Hvor stor en del af hvert molekyle er polær?",
            svar: p.hvorfor,
            start: function (s) { s.glas[s.valgt].toem(); s.opdaterPanel(); },
            visSvar: function (s) { fyld(s, par[0], par[1]); }
        };
    }

    /* 2. Find selv en vaeske, der opfylder en betingelse. */
    function opgFindPartner(sim) {
        var m = NK.tilfaeldig([
            { id: "vand", blandbar: true,  svar: "Kun ethanol kan blandes med vand. De andre har for meget upolært på sig." },
            { id: "vand", blandbar: false, svar: "Hexan-1-ol, heptan og madolie giver alle to lag med vand." },
            { id: "olie", blandbar: true,  svar: "Heptan og hexan-1-ol kan blandes med madolie. Begge er lange og upolære." },
            { id: "heptan", blandbar: false, svar: "Kun vand giver to lag med heptan. Resten har nok upolært på sig." }
        ]);
        var v = D.vaeske(m.id);
        return {
            tekst: "Bland " + v.navn + " med en anden væske, så der bliver " +
                   (m.blandbar ? "ét lag" : "to lag") + ".",
            hint: m.blandbar
                ? "Find den væske, der ligner " + v.navn + " mest."
                : "Find den væske, der ligner " + v.navn + " mindst.",
            svar: m.svar,
            start: function (s) {
                var nr = tomtGlas(s);
                s.valgt = nr;
                s.opdaterPanel();
            },
            tjek: function (s) {
                for (var i = 0; i < s.glas.length; i++) {
                    var g = s.glas[i];
                    var ids = g.ids();
                    if (ids.length !== 2 || ids.indexOf(m.id) < 0) continue;
                    if (g.uklar > 0.25) continue;
                    var andet = ids[0] === m.id ? ids[1] : ids[0];
                    if (D.par(m.id, andet).blandbar === m.blandbar) { s.valgt = i; return true; }
                }
                return false;
            },
            visSvar: function (s) {
                var alle = D.VAESKER.filter(function (x) {
                    return x.id !== m.id && D.par(m.id, x.id).blandbar === m.blandbar;
                });
                fyld(s, m.id, NK.tilfaeldig(alle).id);
            }
        };
    }

    /* 3. Hvilket lag ligger oeverst? */
    function opgOeverst(sim) {
        var par = NK.tilfaeldig([
            ["vand", "heptan"], ["vand", "olie"], ["vand", "hexanol"], ["ethanol", "olie"]
        ]);
        var va = D.vaeske(par[0]), vb = D.vaeske(par[1]);
        var oe = D.oeverst(par[0], par[1]);
        return {
            tekst: va.navn + " og " + vb.navn + " giver to lag. Hvilket lag ligger øverst?",
            valg: [va.navn, vb.navn],
            rigtig: oe.id === par[0] ? 0 : 1,
            hint: "Se tætheden i kortet med væskerne. Den letteste væske lægger sig øverst.",
            svar: oe.navn + " har tætheden " + NK.tal(oe.taethed, 2) + " g/mL og er den letteste af de to.",
            start: function (s) { s.glas[s.valgt].toem(); s.opdaterPanel(); },
            visSvar: function (s) { fyld(s, par[0], par[1]); }
        };
    }

    /* 4. Ryst en emulsion, og se hvad der sker. */
    function opgRyst(sim) {
        var par = NK.tilfaeldig([["vand", "olie"], ["vand", "heptan"], ["vand", "hexanol"]]);
        var va = D.vaeske(par[0]), vb = D.vaeske(par[1]);
        return {
            tekst: "Glasset er fyldt med " + va.navn + " og " + vb.navn + ". Ryst det, og lad det stå.",
            hint: "Grib glasset med musen, og ryst det frem og tilbage. Knappen i panelet gør det samme.",
            svar: "Rystningen river væskerne i små dråber, men den ændrer ikke polariteten. Dråberne finder sammen igen, og lagene kommer tilbage.",
            start: function (s) {
                var nr = fyld(s, par[0], par[1]);
                s.glas[nr].rystet = 0;
            },
            tjek: function (s) {
                var g = s.glas[s.valgt];
                var ids = g.ids();
                if (ids.length !== 2 || ids.indexOf(par[0]) < 0 || ids.indexOf(par[1]) < 0) return false;
                if (!g.rystet) return false;
                if (g.uklar > 0.02) return "Emulsionen er der stadig. Lad glasset stå.";
                return true;
            },
            visSvar: function (s) {
                /* Spring frem til det, der sker til sidst: glasset er
                   rystet, og emulsionen er skilt ad igen. */
                var nr = fyld(s, par[0], par[1]);
                var g = s.glas[nr];
                g.rystet = 1;
                g.uklar = 0;
                g.skilleUr = 0;
                s.opdaterPanel();
            }
        };
    }

    /* 5. Hvorfor blandes ethanol med vand, naar hexan-1-ol ikke goer? */
    function opgHalen() {
        return {
            tekst: "Ethanol og hexan-1-ol har begge en OH-gruppe. Hvorfor blandes kun ethanol med vand?",
            valg: [
                "Hexan-1-ol har en meget længere upolær hale",
                "Hexan-1-ol er tungere end vand",
                "Hexan-1-ol har ingen hydrogenbindinger",
                "Hexan-1-ol koger ved en højere temperatur"
            ],
            rigtig: 0,
            hint: "Tæl carbonatomerne i de to molekyler i zoomboblen.",
            svar: "Ethanol har to carbonatomer, hexan-1-ol har seks. Jo større en del af molekylet der er upolær, jo mindre ligner det vand.",
            start: function (s) { fyld(s, "vand", "hexanol"); },
            visSvar: function (s) { fyld(s, "vand", "ethanol"); }
        };
    }

    var OPGAVER = [opgForudsig, opgFindPartner, opgOeverst, opgRyst, opgHalen];
}());
