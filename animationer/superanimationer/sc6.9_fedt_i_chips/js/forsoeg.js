/* =====================================================================
   forsoeg.js - selve forsoeget: tilstand, trin og handlinger

   Trinene (TRIN) er de ti ting, eleven skal naa. Et trin er gjort, naar
   tilstanden siger det, ikke naar en knap er trykket. Genstandene flyttes
   af smaa koreografier (koer): en liste af trin, der enten flytter en
   genstand, venter og goer noget undervejs, eller kalder en funktion.
   Mens en koreografi koerer, reagerer scenen ikke paa nye klik.

   Tegningen og musen staar i bord.js, laereren og uheldene i laerer.js.

   Knusning og roering: eleven tager fat i pistillen eller glasstaven og
   bevaeger musen, eller holder knappen nede. Pistillens vej giver
   knusningen; roeringens styrke (0-1) giver roeretiden i model.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var r = NK.r;
    var A = S.ANKER;

    function kopi(p) { return { x: p.x, y: p.y, v: p.v }; }

    var TRIN = [
        { id: "afvej", tekst: "Afvej ca. 5 g chips", mark: "pose",
          hint: "Klik på chipsposen, til vægten viser mellem 4,5 og 5,5 g. Klik så på vejebåden." },
        { id: "knus", tekst: "Knus chipsene i morteren", mark: "pistil",
          hint: "Tag fat i pistillen, og bevæg den rundt i morteren, eller hold knappen Knus nede." },
        { id: "overfoer", tekst: "Kom chipsene i bægerglasset", mark: "morter",
          hint: "Klik på morteren." },
        { id: "midl", tekst: "Tilsæt et opløsningsmiddel", mark: "flasker",
          hint: "Vælg en af de to flasker i stinkskabet." },
        { id: "roer", tekst: "Rør rundt", mark: "stav",
          hint: "Tag fat i glasstaven, og rør rundt, eller hold knappen Rør rundt nede. Følg med i luppen." },
        { id: "vejB", tekst: "Vej det tomme bægerglas", mark: "baegerB",
          hint: "Klik på det tomme bægerglas ved siden af vægten." },
        { id: "filtrer", tekst: "Filtrer blandingen", mark: "baegerA",
          hint: "Klik på bægerglasset med blandingen." },
        { id: "inddamp", tekst: "Inddamp opløsningsmidlet", mark: "baegerB",
          hint: "Klik på bægerglasset under tragten. Det skal varmes op, til al væsken er fordampet." },
        { id: "vejF", tekst: "Vej bægerglasset igen", mark: "baegerB",
          hint: "Klik på bægerglasset, når al væsken er fordampet, og glasset er kølet af." },
        { id: "beregn", tekst: "Beregn fedtindholdet", mark: null,
          hint: "Brug de tre masser i måleskemaet." }
    ];
    NK.TRIN = TRIN;

    var IAGTTAGELSER = {
        roer_heptan:    { tekst: "Heptanen bliver svagt gul, og chipsresterne bliver lysere.", farve: { r: 246, g: 226, b: 140 } },
        roer_vand:      { tekst: "Vandet bliver uklart. Chipsresterne ser uændrede ud.", farve: { r: 214, g: 206, b: 180 } },
        filtrat_heptan: { tekst: "Filtratet er klart og svagt gult. Chipsresterne bliver i filteret.", farve: { r: 246, g: 226, b: 140 } },
        filtrat_vand:   { tekst: "Filtratet er let uklart. Chipsresterne bliver i filteret.", farve: { r: 214, g: 214, b: 200 } },
        vaad:           { tekst: "Chipsresterne i filteret er stadig våde.", farve: { r: 226, g: 205, b: 150 } },
        skyl:           { tekst: "Filteret er skyllet med lidt mere opløsningsmiddel.", farve: null },
        krummer:        { tekst: "Nogle krummer sprang ud af morteren.", farve: { r: 238, g: 193, b: 92 } },
        rest_heptan:    { tekst: "Efter inddampningen er der en gul, olieagtig væske i bunden.", farve: { r: 244, g: 200, b: 64 } },
        rest_vand:      { tekst: "Efter inddampningen er der kun en tynd, hvid belægning i bunden.", farve: { r: 245, g: 245, b: 238 } },
        brand:          { tekst: "Heptandampene blev antændt af brænderens flamme.", farve: { r: 255, g: 130, b: 40 } },
        halvknust:      { tekst: "Chipsene var kun delvist knust.", farve: { r: 238, g: 193, b: 92 } }
    };
    NK.IAGTTAGELSER = IAGTTAGELSER;

    NK.Forsoeg = function (canvas) {
        this.canvas = canvas;
        this.laerred = canvas ? new NK.Laerred(canvas) : null;
        this.tid = 0;
        this.forsoegNr = 0;
        this.resultater = [];
        this.sod = 0;
        this.urMinutter = 5;
        this.braenderVaek = false;
        this.koppenVaek = false;
        this.vedAendring = null;
        this.vedBesked = null;
        this.vedIagttagelse = null;
        this.vedMaaling = null;
        if (this.laererStart) this.laererStart();
        this.nulstil();
        if (canvas && this.bindMus) this.bindMus();
    };

    var P = NK.Forsoeg.prototype;

    function genstand(navn, sprite, hjem) {
        return { navn: navn, sprite: sprite, anker: A[sprite], hjem: hjem, p: kopi(hjem) };
    }

    /* ----- Nyt forsoeg ----------------------------------------------- */
    P.nulstil = function () {
        this.forsoegNr++;
        this.gjort = {};
        this.iagttaget = {};
        this.trinStart = this.tid;
        this.sidsteTrin = "";

        this.chips = [];
        this.iLuften = 0;
        this.mChips = null;
        this.mB = null;
        this.mBF = null;
        this.mTab = 0;
        this.krummerUd = 0;
        this.baegerMasse = M.afrund(r(M.BAEGER.min, M.BAEGER.max), 2);
        this.antalForkerte = 0;

        this.knust = 0;
        this.knusVej = 0;
        this.knasTrin = 0;
        this.stykker = [];
        this.midl = null;
        this.roerTid = 0;
        this.roer = 0;
        this.skyllet = false;
        this.filtreret = 0;
        this.fordampet = 0;
        this.rest = null;
        this.temp = 22;
        this.pladeTaendt = false;
        this.flammeTaendt = false;
        this.flamme = 0;
        this.brandUr = 0;
        this.b0 = 0;
        this.skylUr = undefined;
        this.filtratFarve = null;
        this.uheld = null;
        this.alarm = false;
        this.laagT = 0;
        this.haandAlfa = 0;

        var g = this.g = {
            pose:     genstand("pose", "pose", S.HJEM.pose),
            vejebaad: genstand("vejebaad", "vejebaad", S.HJEM.vejebaad),
            morter:   genstand("morter", "morter", S.HJEM.morter),
            pistil:   genstand("pistil", "pistil", S.HJEM.pistil),
            baegerA:  genstand("baegerA", "baegerglas", S.HJEM.baegerA),
            baegerB:  genstand("baegerB", "baegerglas", S.HJEM.baegerB),
            vand:     genstand("vand", "vand", S.HJEM.vand),
            heptan:   genstand("heptan", "heptan", S.HJEM.heptan),
            kaffekop: genstand("kaffekop", "kaffekop", S.HJEM.kaffekop)
        };
        g.kaffekop.skjult = this.koppenVaek;
        g.baegerA.areal = 0;
        g.baegerA.krummer = [];
        g.baegerA.farve = null;
        g.baegerB.areal = 0;
        g.baegerB.fedt = 0;
        g.baegerB.salt = 0;
        g.baegerB.sod = 0;
        g.baegerB.sted = "hjem";
        g.baegerB.farve = null;
        this.tragt = { areal: 0, kage: 0, vaad: 0, farve: null };
        this.stav = { bund: { x: 744, y: 492 }, vinkel: 0.36 };

        this.vaegtVisning = 0;
        this.handling = null;
        this.holdt = null;
        this.hover = null;
        this.arbejdKilde = null;
        this.musFart = 0;
        this.mark = null;
        this.ryk = 0;

        this.straale = null;
        this.flyvende = [];
        this.draaber = [];
        this.dampe = [];
        this.roeg = [];
        this.bobler = [];
        this.dampUr = 0;
        this.draabeUr = 0;
        this.skrabUr = 0;

        this.mikro = new NK.Mikro();
        this.bobleAlfa = 0;
        this.bobleSted = { x: S.BOBLE.ude.x, y: S.BOBLE.ude.y, r: S.BOBLE.ude.r };
        if (this.laererNyt) this.laererNyt();
        this.aendret("nulstil");
    };

    /* ----- Til panelet ------------------------------------------------ */
    P.roerGrad = function () {
        return M.roerGrad(this.knust, this.roerTid);
    };

    P.midlObj = function () {
        return this.midl ? M.MIDLER[this.midl] : null;
    };

    P.trinGjort = function (id) {
        var gj = this.gjort;
        switch (id) {
            case "knus": return this.knust >= 0.95 || !!gj.overfoer;
            case "midl": return !!this.midl;
            case "roer": return this.roerGrad() >= M.ROER.faerdig || !!gj.filtrer;
            case "vejB": return this.mB !== null;
            case "vejF": return this.mBF !== null;
            default: return !!gj[id];
        }
    };

    P.aktueltTrin = function () {
        if (this.uheld) return null;
        for (var i = 0; i < TRIN.length; i++) if (!this.trinGjort(TRIN[i].id)) return TRIN[i];
        return null;
    };

    P.travl = function () {
        return !!(this.handling || this.holdt || this.arbejdKilde || (this.laererOptaget && this.laererOptaget()));
    };

    P.hint = function () {
        var t = this.aktueltTrin();
        if (!t) return null;
        var mark = t.mark;
        if (t.id === "filtrer" && this.roerGrad() < M.ROER.min) mark = "stav";
        if (t.id === "filtrer" && this.mB === null) mark = "baegerB";
        if (mark) this.markér(mark, 5);
        return t.hint;
    };

    P.markér = function (navn, sek) {
        this.mark = { navn: navn, ur: sek || 3 };
    };

    P.markeret = function (navn) {
        return !!(this.mark && this.mark.navn === navn && this.mark.ur > 0);
    };

    P.aendret = function (grund) {
        if (this.vedAendring) this.vedAendring(grund);
    };

    P.besked = function (tekst, slags) {
        if (this.vedBesked) this.vedBesked(tekst, slags || "info");
    };

    P.iagttag = function (noegle) {
        if (this.iagttaget[noegle]) return;
        this.iagttaget[noegle] = true;
        var i = IAGTTAGELSER[noegle];
        if (this.vedIagttagelse) this.vedIagttagelse({ noegle: noegle, tekst: i.tekst, farve: i.farve, nr: this.forsoegNr });
    };

    P.maal = function (hvad, vaerdi) {
        if (this.vedMaaling) this.vedMaaling(hvad, vaerdi);
    };

    /* ----- Koreografier ------------------------------------------------ */
    P.koer = function (liste, navn) {
        this.handling = { liste: liste, i: 0, t: 0, navn: navn || "" };
        this.aendret("handling");
    };

    P.opdaterHandling = function (dt) {
        var sikkerhed = 0;
        while (this.handling && sikkerhed++ < 30) {
            var h = this.handling;
            var tr = h.liste[h.i];
            if (!tr) {
                this.handling = null;
                this.aendret("handling");
                return;
            }
            if (tr.kald) {
                tr.kald.call(this);
                if (this.handling === h) { h.i++; h.t = 0; }
                continue;
            }
            h.t += dt;
            dt = 0;
            var t = tr.tid > 0 ? Math.min(1, h.t / tr.tid) : 1;
            if (tr.flyt) {
                var gg = tr.flyt;
                if (!tr.fra) tr.fra = kopi(gg.p);
                var til = typeof tr.til === "function" ? tr.til.call(this) : tr.til;
                var e = NK.blod(t);
                gg.p.x = NK.lerp(tr.fra.x, til.x, e);
                gg.p.y = NK.lerp(tr.fra.y, til.y, e) - Math.sin(Math.PI * e) * (tr.loeft === undefined ? 40 : tr.loeft);
                gg.p.v = NK.lerp(tr.fra.v, til.v, e);
            }
            if (tr.hver) tr.hver.call(this, t, h.t);
            if (t < 1) return;
            h.i++;
            h.t = 0;
        }
    };

    function hjemTil(gg, tid, loeft) {
        return { flyt: gg, til: gg.hjem, tid: tid || 0.8, loeft: loeft === undefined ? 40 : loeft };
    }

    /* ----- Klik paa scenen ----------------------------------------------- */
    P.klik = function (navn) {
        if (NK.Lyd) NK.Lyd.laasOp();
        if (navn === "laerer") return this.klikLaerer ? this.klikLaerer() : false;
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (this.uheld) { this.besked("Start et nyt forsøg.", "advarsel"); return false; }
        if (this.handling || this.holdt || this.arbejdKilde) return false;
        switch (navn) {
            case "kaffekop": return this.klikKop ? this.klikKop() : false;
            case "pose": return this.klikPose();
            case "vejebaad": return this.klikVejebaad();
            case "pistil":
                if (!this.gjort.afvej) { this.besked("Morteren er tom."); return false; }
                if (this.gjort.overfoer) { this.besked("Chipsene er allerede knust."); return false; }
                this.besked("Tag fat i pistillen, og bevæg den rundt.");
                return false;
            case "morter": return this.klikMorter();
            case "stav":
                if (!this.midl) { this.besked(this.gjort.overfoer ? "Der mangler et opløsningsmiddel." : "Bægerglasset er tomt."); return false; }
                if (this.gjort.filtrer) { this.besked("Blandingen er filtreret."); return false; }
                this.besked("Tag fat i glasstaven, og rør rundt.");
                return false;
            case "baegerA": return this.klikBaegerA();
            case "baegerB": return this.klikBaegerB();
            case "heptan": case "vand": return this.klikFlaske(navn);
            case "braender": return this.klikBraender();
            case "varmeplade":
                if (this.g.baegerB.sted === "tragt" && this.gjort.filtrer) return this.tilVarme("plade");
                this.besked(this.gjort.inddamp ? "Varmepladen skal ikke bruges mere." : "Varmepladen skal bruges til at inddampe filtratet.");
                return false;
            case "tragt":
                this.besked(this.gjort.filtrer ? "Chipsresterne bliver i filteret." : "Klik på bægerglasset med blandingen for at filtrere.");
                return false;
            case "vaegt":
                this.besked("Vægten viser massen af det, der står på den.");
                return false;
        }
        return false;
    };

    /* ----- Afvejning --------------------------------------------------- */
    P.chipsMasse = function () {
        var m = 0;
        this.chips.forEach(function (c) { m += c.m; });
        return m;
    };

    P.klikPose = function () {
        if (this.gjort.afvej) return this.spis ? this.spis() : false;
        var iAlt = this.chipsMasse() + this.iLuften;
        if (iAlt > M.AFVEJ.max + 0.3) {
            this.besked("Der er for meget i vejebåden. Klik på vejebåden for at lægge en chip tilbage.", "advarsel");
            this.markér("vejebaad", 3);
            return false;
        }
        var m = M.afrund(r(M.AFVEJ.chipMin, M.AFVEJ.chipMax), 2);
        var pose = this.g.pose.p, baad = this.g.vejebaad.p;
        this.iLuften += m;
        this.flyvende.push({
            chip: true, x: pose.x + r(-8, 8), y: pose.y - 4, a: r(0, 6), va: r(-8, 8), s: 1,
            fra: { x: pose.x, y: pose.y - 4 }, til: { x: baad.x + r(-12, 12), y: baad.y - 8 }, t: 0, varighed: 0.5,
            vedLanding: function () {
                this.iLuften -= m;
                this.chips.push({ m: m, dx: r(-16, 16), dy: -4 - this.chips.length * 1.6, a: r(-0.6, 0.6), s: r(0.8, 1) });
                if (NK.Lyd) NK.Lyd.tik();
                this.aendret("chip");
            }
        });
        if (NK.Lyd) NK.Lyd.klik();
        return true;
    };

    P.klikVejebaad = function () {
        if (this.gjort.afvej) { this.besked("Vejebåden er tom."); return false; }
        if (this.iLuften > 0) return false;
        var m = M.afrund(this.chipsMasse(), 2);
        if (!this.chips.length) {
            this.besked("Klik på chipsposen for at lægge chips i vejebåden.");
            this.markér("pose", 3);
            return false;
        }
        if (m > M.AFVEJ.max) {
            var c = this.chips.pop();
            var baad = this.g.vejebaad.p, pose = this.g.pose.p;
            this.flyvende.push({ chip: true, x: baad.x, y: baad.y - 8, a: c.a, va: r(-8, 8), s: 1,
                fra: { x: baad.x, y: baad.y - 8 }, til: { x: pose.x, y: pose.y - 2 }, t: 0, varighed: 0.45, forsvind: true });
            this.besked("Lidt for meget. En chip er lagt tilbage i posen.");
            this.aendret("chip");
            return true;
        }
        if (m < M.AFVEJ.min) {
            this.besked("Vægten skal vise ca. 5 g. Læg flere chips i.");
            this.markér("pose", 3);
            return false;
        }
        this.overfoerTilMorter(m);
        return true;
    };

    P.overfoerTilMorter = function (m) {
        var baad = this.g.vejebaad, mor = this.g.morter, pi = this.g.pistil;
        this.mChips = m;
        this.maal("chips", m);
        var chips = this.chips;
        var over = { x: mor.p.x - 18, y: mor.p.y - 86, v: 1.25 };
        var hvilePistil = { x: 404, y: S.BORD - 1, v: -Math.PI / 2 };
        this.koer([
            { flyt: pi, til: { x: pi.p.x + 34, y: pi.p.y - 70, v: 0.7 }, tid: 0.4, loeft: 10 },
            { flyt: baad, til: over, tid: 0.8, loeft: 50 },
            { tid: 0.6, hver: function (t) {
                while (chips.length && chips.length > (1 - t) * this.antalStart) {
                    var c = chips.pop();
                    var w = NK.tilVerden(baad.p, baad.anker, 32 + c.dx, 4);
                    this.flyvende.push({ chip: true, x: w.x, y: w.y, a: r(0, 6), va: r(-6, 6), s: 0.9,
                        fra: { x: w.x, y: w.y }, til: { x: mor.p.x + r(-26, 26), y: mor.p.y - 50 }, t: 0, varighed: 0.35, forsvind: true });
                }
            } },
            { kald: function () {
                chips.length = 0;
                var st = [];
                for (var i = 0; i < Math.round(m / 0.5) + 2; i++) {
                    for (var n = 0; n < 6; n++) st.push({ dx: r(-34, 34), dy: r(-6, 3), a: r(0, 6), nr: n });
                }
                this.stykker = st;
                this.gjort.afvej = true;
                if (NK.Lyd) NK.Lyd.knas(0.5);
                this.aendret("afvej");
            } },
            { flyt: baad, til: S.HJEM.parkeret, tid: 0.8, loeft: 40 },
            { flyt: pi, til: pi.hjem, tid: 0.5, loeft: 10 }
        ], "afvej");
        this.antalStart = chips.length;
    };

    /* ----- Knusning ------------------------------------------------------ */
    P.kanKnuse = function () {
        return !!(this.gjort.afvej && !this.gjort.overfoer && !this.uheld && !this.handling);
    };

    /* vej: pistillens vej i tegneenheder, fart: musens fart */
    P.knus = function (vej, fart) {
        if (!this.kanKnuse()) return;
        var foer = this.knust;
        this.knusVej += vej;
        this.knust = Math.min(1, this.knusVej / M.KNUS.vej);
        while (this.knust >= (this.knasTrin + 1) * 0.08) {
            this.knasTrin++;
            if (NK.Lyd) NK.Lyd.knas(0.35 + 0.4 * (1 - this.knust));
        }
        this.skrabUr -= vej / 400;
        if (this.skrabUr <= 0 && NK.Lyd) { NK.Lyd.skrab(Math.min(1, fart / 1500)); this.skrabUr = 1; }

        /* Meget voldsom knusning: krummer springer ud af morteren */
        if (fart > M.KNUS.voldsom && this.knust > 0.15 && this.krummerUd < M.KNUS.maksKrummer && Math.random() < vej / 900) {
            this.krummerUd++;
            this.mTab += M.KNUS.krummeMasse;
            var mor = this.g.morter.p;
            var retning = Math.random() < 0.5 ? -1 : 1;
            this.flyvende.push({ x: mor.x + retning * 30, y: mor.y - 50, vx: retning * r(60, 200), vy: -r(150, 320), a: r(0, 6), va: r(-10, 10), r: r(2.2, 3.4), fysik: true, farve: "#eec15c" });
            if (this.krummerUd === 3) this.besked("Pas på. Krummerne springer ud af morteren.", "advarsel");
            this.iagttag("krummer");
        }
        if (foer < 0.95 && this.knust >= 0.95) {
            this.besked("Chipsene er knust til små krummer.", "god");
            if (NK.Lyd) NK.Lyd.succes();
        }
        if (Math.floor(foer * 20) !== Math.floor(this.knust * 20)) this.aendret("knus");
    };

    P.klikMorter = function () {
        if (!this.gjort.afvej) { this.besked("Morteren er tom. Afvej chips først."); this.markér("pose", 3); return false; }
        if (this.gjort.overfoer) { this.besked("Morteren er tom."); return false; }
        if (this.knust < M.KNUS.min) { this.besked("Knus chipsene mere først.", "advarsel"); this.markér("pistil", 3); return false; }
        var mor = this.g.morter, pi = this.g.pistil, a = this.g.baegerA;
        var over = { x: a.p.x - 24, y: a.p.y - 60, v: 1.9 };
        var mig = this;
        var n = 0;
        this.koer([
            { flyt: pi, til: { x: 404, y: S.BORD - 1, v: -Math.PI / 2 }, tid: 0.6, loeft: 40 },
            { flyt: mor, til: over, tid: 1.1, loeft: 70 },
            { tid: 0.9, hver: function (t) {
                while (n < t * 24) {
                    n++;
                    var kant = NK.tilVerden(mor.p, mor.anker, 94, 10);
                    this.flyvende.push({ x: kant.x + r(-4, 4), y: kant.y, vx: r(-20, 20), vy: r(0, 40), a: r(0, 6), va: r(-8, 8), r: r(2.2, 3.2), fysik: true, maal: "baegerA", farve: "#eec15c" });
                }
                mig.stykker = mig.stykker.slice(0, Math.floor(mig.stykker.length * (1 - t)));
            } },
            { kald: function () {
                this.stykker = [];
                this.gjort.overfoer = true;
                if (this.knust < 0.95) this.iagttag("halvknust");
                this.aendret("overfoer");
            } },
            hjemTil(mor, 1.0, 60)
        ], "overfoer");
        return true;
    };

    P.nyKrummeIA = function () {
        var a = this.g.baegerA;
        if (a.krummer.length >= 26) return;
        a.krummer.push({ x: r(14, 58), y: r(78, 84), r: r(2.2, 3.4), a: r(0, 6), fase: r(0, 6), farve: "#e3b04f" });
    };

    /* ----- Opløsningsmiddel og roering ------------------------------------ */
    P.klikFlaske = function (navn) {
        var a = this.g.baegerA;
        if (!this.gjort.overfoer) { this.besked("Kom chipsene i bægerglasset først."); return false; }
        if (this.midl && this.midl !== navn) {
            this.besked("Der er allerede " + M.MIDLER[this.midl].navn.toLowerCase() + " i bægerglasset.");
            return false;
        }
        if (this.midl && this.gjort.filtrer) {
            if (this.skyllet) { this.besked("Filteret er skyllet."); return false; }
            if (this.g.baegerB.sted !== "tragt") { this.besked("Filtratet er flyttet fra tragten."); return false; }
            if (this.tragt.areal > 20) return false;
            this.skyl();
            return true;
        }
        if (this.midl) { this.besked("Der er opløsningsmiddel nok i bægerglasset. Rør rundt."); this.markér("stav", 3); return false; }
        this.haeldMidl(navn, M.VOLUMEN);
        return true;
    };

    P.haeldMidl = function (navn, maengde, efter) {
        var fl = this.g[navn], a = this.g.baegerA;
        var erVand = navn === "vand";
        var pose = erVand ? { x: a.p.x - 38, y: a.p.y - 40, v: -0.9 } : { x: a.p.x - 30, y: a.p.y - 34, v: 2.05 };
        var start = a.areal;
        var liste = [];
        if (!erVand) liste.push({ tid: 0.3, hver: function (t) { this.laagT = t; } });
        liste.push({ flyt: fl, til: pose, tid: 0.9, loeft: 50 });
        liste.push({ kald: function () { if (NK.Lyd) NK.Lyd.haeld(1.3); } });
        liste.push({ tid: 1.3, hver: function (t) {
            a.areal = start + maengde * NK.blod(t);
            var spids = NK.tilVerden(fl.p, fl.anker, erVand ? 44 : 23, erVand ? 9 : 4);
            var bund = NK.tilVerden(a.p, a.anker, 36, 84).y;
            this.straale = { fra: spids, til: { x: a.p.x - 36 + (erVand ? 10 : 4), y: a.niveau ? a.niveau : bund }, farve: M.MIDLER[navn].farve, bredde: erVand ? 2 : 3.5 };
        } });
        liste.push({ kald: function () {
            this.straale = null;
            if (!this.midl) {
                this.midl = navn;
                a.farve = M.MIDLER[navn].farve;
                this.aendret("midl");
            }
            if (efter) efter.call(this);
        } });
        liste.push(hjemTil(fl, 0.9, 50));
        if (!erVand) liste.push({ tid: 0.3, hver: function (t) { this.laagT = 1 - t; } });
        this.koer(liste, "midl");
    };

    P.kanRoere = function () {
        return !!(this.midl && !this.gjort.filtrer && !this.uheld && !(this.handling && this.handling.navn !== "stav"));
    };

    /* ----- Filtrering --------------------------------------------------- */
    P.klikBaegerA = function () {
        if (!this.gjort.overfoer) { this.besked("Bægerglasset er tomt."); return false; }
        if (!this.midl) { this.besked("Tilsæt et opløsningsmiddel først."); this.markér("flasker", 3); return false; }
        if (this.gjort.filtrer) { this.besked("Bægerglasset er tomt."); return false; }
        if (this.roerGrad() < M.ROER.min) { this.besked("Rør rundt først.", "advarsel"); this.markér("stav", 3); return false; }
        if (this.mB === null) { this.besked("Vej først det tomme bægerglas. Det skal stå under tragten.", "advarsel"); this.markér("baegerB", 3); return false; }
        if (this.g.baegerB.sted !== "tragt") return false;
        this.filtrer();
        return true;
    };

    P.filtrer = function () {
        var a = this.g.baegerA;
        var over = { x: S.TRAGT.x - 10, y: 296, v: 1.25 };
        var start = 0, krumStart = 0;
        this.filtratFarve = this.baegerFarve();
        this.tragt.farve = this.filtratFarve;
        this.tragt.uklar = a.uklar || 0;
        this.koer([
            { flyt: a, til: over, tid: 1.0, loeft: 50 },
            { kald: function () { start = a.areal; krumStart = a.krummer.length; if (NK.Lyd) NK.Lyd.haeld(2.6); } },
            { tid: 2.6, hver: function (t) {
                var nyt = start * (1 - NK.blod(t));
                this.tragt.areal = Math.min(S.TRAGT_FULD, this.tragt.areal + (a.areal - nyt));
                a.areal = nyt;
                a.krummer.length = Math.round(krumStart * (1 - t));
                this.tragt.kage = Math.max(this.tragt.kage, t);
                this.tragt.vaad = 1;
                var spids = NK.tilVerden(a.p, a.anker, 68, 3);
                this.straale = { fra: spids, til: { x: S.TRAGT.x, y: 330 }, farve: this.filtratFarve, bredde: 3 };
                this.filtreret = NK.klamp(t * 0.6, 0, 1);
            } },
            { kald: function () { this.straale = null; a.areal = 0; a.krummer = []; } },
            hjemTil(a, 1.0, 50)
        ], "filtrer");
    };

    P.skyl = function () {
        var a = this.g.baegerA;
        var over = { x: S.TRAGT.x - 10, y: 296, v: 1.25 };
        var mig = this;
        this.haeldMidl(this.midl, 380, function () {
            var start = 0;
            mig.koerEfter([
                { flyt: a, til: over, tid: 0.9, loeft: 50 },
                { kald: function () { start = a.areal; if (NK.Lyd) NK.Lyd.haeld(1.2); } },
                { tid: 1.2, hver: function (t) {
                    var nyt = start * (1 - NK.blod(t));
                    this.tragt.areal = Math.min(S.TRAGT_FULD, this.tragt.areal + (a.areal - nyt));
                    a.areal = nyt;
                    var spids = NK.tilVerden(a.p, a.anker, 68, 3);
                    this.straale = { fra: spids, til: { x: S.TRAGT.x, y: 330 }, farve: M.MIDLER[this.midl].farve, bredde: 2.5 };
                } },
                { kald: function () {
                    this.straale = null;
                    a.areal = 0;
                    this.skyllet = true;
                    this.skylUr = 0;
                    this.iagttag("skyl");
                    this.aendret("skyl");
                } },
                hjemTil(a, 1.0, 50)
            ]);
        });
    };

    P.koerEfter = function (liste, navn) {
        if (this.handling) this.handling.liste = this.handling.liste.concat(liste);
        else this.koer(liste, navn);
    };

    /* ----- Inddampning ---------------------------------------------------- */
    P.klikBaegerB = function () {
        var b = this.g.baegerB;
        switch (b.sted) {
            case "hjem":
                if (!this.gjort.afvej) { this.besked("Vægten er optaget af vejebåden. Afvej chipsene først."); return false; }
                this.vejTomt();
                return true;
            case "tragt":
                if (!this.gjort.filtrer) {
                    this.besked(this.midl ? "Filtrer blandingen først." : "Bægerglasset skal bruges til filtratet.");
                    if (this.midl) this.markér("baegerA", 3);
                    return false;
                }
                return this.tilVarme("plade");
            case "plade":
            case "trefod":
                if (!this.gjort.inddamp) { this.besked("Vent, til al væsken er fordampet."); return false; }
                if (this.temp > 40) { this.besked("Glasset er stadig varmt. Vent, til det er kølet af."); return false; }
                this.vejIgen();
                return true;
            case "vaegt":
                if (this.mBF !== null) { this.besked("Beregn fedtindholdet i måleskemaet."); return false; }
                return false;
        }
        return false;
    };

    P.vejTomt = function () {
        var b = this.g.baegerB;
        this.koer([
            { flyt: b, til: S.PAA_VAEGT, tid: 0.8, loeft: 40 },
            { kald: function () { b.sted = "vaegt"; } },
            { tid: 1.0 },
            { kald: function () {
                this.mB = this.baegerMasse;
                this.maal("baeger", this.mB);
                if (NK.Lyd) NK.Lyd.bip();
                this.aendret("vejB");
            } },
            { tid: 0.5 },
            { kald: function () { b.sted = "flytter"; } },
            { flyt: b, til: S.UNDER_TRAGT, tid: 1.3, loeft: 90 },
            { kald: function () { b.sted = "tragt"; this.aendret("vejB"); } }
        ], "vejB");
    };

    P.tilVarme = function (hvor) {
        var b = this.g.baegerB;
        if (this.tragt.areal > 20 || this.handling) { this.besked("Vent, til filtreringen er færdig."); return false; }
        if (hvor === "trefod" && this.braenderVaek) return false;
        b.sted = "flytter";
        this.koer([
            { flyt: b, til: hvor === "plade" ? S.PAA_PLADE : S.PAA_TREFOD, tid: hvor === "plade" ? 0.9 : 1.4, loeft: hvor === "plade" ? 70 : 110 },
            { kald: function () {
                b.sted = hvor;
                this.b0 = b.areal;
                if (hvor === "plade") { this.pladeTaendt = true; if (NK.Lyd) NK.Lyd.klik(); }
                else {
                    this.flammeTaendt = true;
                    if (NK.Lyd) NK.Lyd.klik();
                    this.brandUr = 0;
                }
                this.aendret("varme");
            } }
        ], "varme");
        return true;
    };

    P.klikBraender = function () {
        if (this.braenderVaek) return false;
        var b = this.g.baegerB;
        if (b.sted === "tragt" && this.gjort.filtrer) return this.tilVarme("trefod");
        if (b.sted === "trefod") { this.besked(this.gjort.inddamp ? "Klik på bægerglasset for at veje det." : "Vent, til al væsken er fordampet."); return false; }
        this.besked("Brænderen skal ikke bruges nu.");
        return false;
    };

    P.vejIgen = function () {
        var b = this.g.baegerB;
        var rest = this.rest || { fedt: 0, salt: 0 };
        this.koer([
            { kald: function () { b.sted = "flytter"; } },
            { flyt: b, til: S.PAA_VAEGT, tid: 1.4, loeft: 120 },
            { kald: function () { b.sted = "vaegt"; } },
            { tid: 1.0 },
            { kald: function () {
                this.mBF = M.afrund(this.baegerMasse + rest.fedt + rest.salt, 2);
                this.maal("baegerFedt", this.mBF);
                if (NK.Lyd) NK.Lyd.bip();
                this.aendret("vejF");
            } }
        ], "vejF");
    };

    /* ----- Beregningen --------------------------------------------------- */
    P.tjekSvar = function (tekst) {
        if (this.mBF === null || this.gjort.beregn) return null;
        var svar = M.tjek(tekst, this.mChips, this.mB, this.mBF);
        if (svar.slags === "tom") return svar;
        if (svar.slags === "rigtig") {
            this.gjort.beregn = true;
            var procent = M.fedtprocent(this.mChips, this.mB, this.mBF);
            this.resultater.push({ nr: this.forsoegNr, midl: this.midl, procent: procent, knust: this.knust, skyllet: this.skyllet, tab: this.krummerUd > 0 });
            if (NK.Lyd) NK.Lyd.succes();
            if (this.laererRos && this.midl === "heptan" && procent >= M.CHIPS.deklaration - 3) this.laererRos();
            this.aendret("beregn");
        } else {
            this.antalForkerte++;
        }
        svar.forkerte = this.antalForkerte;
        return svar;
    };

    P.harHeptanResultat = function () {
        return this.resultater.some(function (x) { return x.midl === "heptan"; });
    };

    /* ----- Farver ------------------------------------------------------- */
    P.baegerFarve = function () {
        var m = this.midlObj();
        if (!m) return null;
        var e = M.ekstraktion(m, this.knust, this.roerTid);
        if (m.id === "heptan") return NK.blandFarve(m.farve, { r: 250, g: 228, b: 140, a: 0.42 }, NK.klamp(e.fedt / 0.97, 0, 1));
        return m.farve;
    };

    P.mikroTilstand = function () {
        var m = this.midlObj();
        var e = m ? M.ekstraktion(m, this.knust, this.roerTid) : { fedt: 0, salt: 0 };
        var b = this.g.baegerB;
        var hn = this.handling ? this.handling.navn : "";
        var scene = "chips", maal = null, titel = "";
        if (this.uheld) return null;
        if (!this.gjort.afvej) {
            if (!this.chips.length) return null;
            maal = { x: this.g.vejebaad.p.x, y: this.g.vejebaad.p.y - 10 };
            titel = "Chips i vejebåden";
        } else if (!this.gjort.overfoer) {
            if (hn === "overfoer") return null;
            maal = { x: this.g.morter.p.x, y: this.g.morter.p.y - 48 };
            titel = "Morteren";
        } else if (!this.gjort.filtrer && hn !== "filtrer") {
            scene = this.midl ? "ekstraktion" : "chips";
            maal = { x: this.g.baegerA.p.x - 36, y: this.g.baegerA.p.y + 66 };
            titel = "Bægerglasset";
        } else if (b.sted === "tragt" && (hn === "filtrer" || hn === "midl" || this.tragt.areal > 12 || (this.skylUr !== undefined && this.skylUr < 1.5))) {
            scene = "filter";
            maal = { x: S.TRAGT.x, y: 350 };
            titel = "Filteret";
        } else if (b.sted === "tragt") {
            scene = "filtrat";
            maal = { x: b.p.x - 36, y: b.p.y + 70 };
            titel = "Filtratet";
        } else if (b.sted === "plade" || b.sted === "trefod") {
            scene = this.gjort.inddamp ? "rest" : "inddamp";
            maal = { x: b.p.x - 36, y: b.p.y + 72 };
            titel = this.gjort.inddamp ? "Resten i glasset" : "Inddampning";
        } else if (b.sted === "vaegt" && this.mBF !== null) {
            scene = "rest";
            maal = { x: b.p.x - 36, y: b.p.y + 72 };
            titel = "Resten i glasset";
        } else {
            return null;
        }
        return {
            scene: scene, maal: maal, titel: titel, midl: this.gjort.overfoer ? this.midl : null,
            knust: this.gjort.afvej ? this.knust : 0,
            fedtOploest: e.fedt, saltOploest: e.salt,
            tilbage: this.skyllet ? M.FILTER.efterSkyl : M.FILTER.tilbage,
            filtreret: this.filtreret, skyllet: this.skyllet,
            fordampet: this.fordampet, roer: this.roer
        };
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdater = function (dt) {
        var i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        var g = this.g, a = g.baegerA, b = g.baegerB;

        this.opdaterHandling(dt);
        this.opdaterArbejde(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        if (this.mark) { this.mark.ur -= dt; if (this.mark.ur <= 0) this.mark = null; }
        this.ryk = this.ryk > 0.2 ? this.ryk * (1 - dt * 7) : 0;

        /* Ekstraktionen: lidt sker der ogsaa uden roering */
        if (this.midl && !this.gjort.filtrer) {
            var foer = this.roerGrad();
            this.roerTid += dt * (this.roer + M.ROER.diffusion);
            var nu = this.roerGrad();
            a.farve = this.baegerFarve();
            a.uklar = this.midl === "vand" ? 0.55 * NK.klamp(nu * 1.3, 0, 1) : 0;
            var e = M.ekstraktion(this.midlObj(), this.knust, this.roerTid);
            var lys = NK.blandFarve({ r: 227, g: 176, b: 79 }, { r: 236, g: 222, b: 186 }, NK.klamp(e.fedt / 0.97, 0, 1));
            var lysCss = NK.css({ r: lys.r, g: lys.g, b: lys.b, a: 1 });
            a.krummer.forEach(function (k) { k.farve = lysCss; });
            if (foer < M.ROER.faerdig && nu >= M.ROER.faerdig) {
                this.besked("Blandingen ændrer sig ikke mere.", "god");
                if (NK.Lyd) NK.Lyd.succes();
                this.iagttag("roer_" + this.midl);
                this.aendret("roer");
            }
            if (Math.floor(foer * 10) !== Math.floor(nu * 10)) this.aendret("roerTrin");
        }

        /* Filtreringen: tragten toemmes gennem stilken */
        if (this.tragt.areal > 0.5) {
            var dr = Math.min(this.tragt.areal, 330 * dt);
            this.tragt.areal -= dr;
            b.areal += dr * (this.skyllet ? 1 : 1 - M.FILTER.tilbage);
            this.draabeUr -= dt;
            if (this.draabeUr <= 0) {
                this.draabeUr = 0.09;
                this.draaber.push({ x: S.TRAGT.x, y: S.TRAGT.y, vy: 30, r: 2.4 });
            }
            if (this.gjort.filtrer === undefined || !this.gjort.filtrer) this.filtreret = Math.max(this.filtreret, 1 - (a.areal + this.tragt.areal) / 1450);
        } else if (this.tragt.areal > 0) {
            this.tragt.areal = 0;
        }
        if (!this.gjort.filtrer && this.handling === null && this.tragt.areal === 0 && this.tragt.kage > 0.9 && a.areal === 0) {
            this.gjort.filtrer = true;
            this.filtreret = 1;
            b.farve = this.filtratFarve;
            b.uklar = this.midl === "vand" ? 0.2 : 0;
            this.iagttag("filtrat_" + this.midl);
            this.iagttag("vaad");
            this.besked("Filtreringen er færdig. Chipsresterne i filteret er stadig våde.");
            this.aendret("filtrer");
        }
        if (this.skylUr !== undefined) this.skylUr += dt;
        if (this.gjort.filtrer && !this.gjort.inddamp) this.tragt.vaad = NK.klamp(this.tragt.vaad, 0, 1);

        this.opdaterVarme(dt);
        this.opdaterVaegt(dt);
        this.opdaterEffekter(dt);

        /* Zoomboblen */
        var mt = this.mikroTilstand();
        if (mt) {
            this.mikro.opdater(dt, mt);
            var sted = mt.maal.x < S.SKAB.x0 ? S.BOBLE.ude : S.BOBLE.inde;
            this.bobleSted.x = NK.mod(this.bobleSted.x, sted.x, 5, dt);
            this.bobleSted.y = NK.mod(this.bobleSted.y, sted.y, 5, dt);
            this.bobleMaal = mt.maal;
            this.bobleTitel = mt.titel;
        }
        this.bobleAlfa = NK.mod(this.bobleAlfa, mt ? 1 : 0, 5, dt);

        var t = this.aktueltTrin();
        var id = t ? t.id : "slut";
        if (id !== this.sidsteTrin) { this.sidsteTrin = id; this.trinStart = this.tid; }
    };

    P.opdaterArbejde = function (dt) {
        var k = this.arbejdKilde;
        this.musFart *= Math.exp(-4 * dt);
        var maal = 0;
        if (k === "knap-knus" && this.kanKnuse()) {
            var w = this.tid * 9;
            var pi = this.g.pistil;
            var nx = S.MORTER.midt + Math.cos(w) * 22, ny = 466 + Math.sin(w) * 6;
            var vej = Math.sqrt((nx - pi.p.x) * (nx - pi.p.x) + (ny - pi.p.y) * (ny - pi.p.y));
            pi.p.x = nx; pi.p.y = ny; pi.p.v = Math.cos(w) * 0.25;
            if (vej > 0) this.knus(900 * dt, 600);
        } else if (k === "knap-roer" && this.kanRoere()) {
            var w2 = this.tid * 8;
            this.stav.bund.x = 758 + Math.cos(w2) * 18;
            this.stav.bund.y = 486 + Math.sin(w2) * 3;
            maal = 1;
        } else if (k === "mus-roer" && this.kanRoere()) {
            maal = NK.klamp(this.musFart / M.ROER.fuld, 0, 1);
        }
        this.roer = NK.mod(this.roer, maal, maal > this.roer ? 6 : 3, dt);
        if (!k || (k.indexOf("roer") < 0)) {
            this.stav.bund.x = NK.mod(this.stav.bund.x, 744, 6, dt);
            this.stav.bund.y = NK.mod(this.stav.bund.y, 492, 6, dt);
        }
        if (!k && !this.handling && this.gjort.afvej && !this.gjort.overfoer) {
            var ph = this.g.pistil;
            ph.p.x = NK.mod(ph.p.x, ph.hjem.x, 8, dt);
            ph.p.y = NK.mod(ph.p.y, ph.hjem.y, 8, dt);
            ph.p.v = NK.mod(ph.p.v, ph.hjem.v, 8, dt);
        }
        this.klirrUr = (this.klirrUr || 0) - dt * this.roer;
        if (this.roer > 0.3 && this.klirrUr <= 0 && NK.Lyd) { NK.Lyd.klirr(); this.klirrUr = 0.35; }
    };

    P.startArbejde = function (kilde) {
        this.arbejdKilde = kilde;
        this.aendret("arbejde");
    };

    P.stopArbejde = function () {
        if (!this.arbejdKilde) return;
        this.arbejdKilde = null;
        this.musFart = 0;
        this.aendret("arbejde");
    };

    /* Knappen Knus / Roer rundt (og tasten R): til = trykket ned */
    P.arbejdKnap = function (til) {
        if (til) {
            if (this.arbejdKilde || this.handling || this.holdt || this.uheld) return false;
            if (this.laererOptaget && this.laererOptaget()) return false;
            if (this.kanKnuse()) { this.startArbejde("knap-knus"); return true; }
            if (this.kanRoere()) { this.startArbejde("knap-roer"); return true; }
            return false;
        }
        if (this.arbejdKilde === "knap-knus" || this.arbejdKilde === "knap-roer") this.stopArbejde();
        return false;
    };

    P.arbejdsType = function () {
        if (this.gjort.afvej && !this.gjort.overfoer) return "knus";
        if (this.midl && !this.gjort.filtrer) return "roer";
        return null;
    };

    P.opdaterVarme = function (dt) {
        var b = this.g.baegerB;
        var paaPlade = b.sted === "plade" && this.pladeTaendt;
        var paaTrefod = b.sted === "trefod" && this.flammeTaendt;
        this.flamme = NK.mod(this.flamme, this.flammeTaendt && !this.braenderVaek ? 1 : 0, 6, dt);
        var maalTemp = paaPlade ? 90 : (paaTrefod ? 100 : 22);
        this.temp = NK.mod(this.temp, maalTemp, paaPlade || paaTrefod ? 0.9 : 0.8, dt);

        var m = this.midlObj();
        if ((paaPlade || paaTrefod) && m && !this.gjort.inddamp && !this.uheld) {
            if (paaTrefod && m.braendbar) {
                this.brandUr = (this.brandUr || 0) + dt;
                if (this.brandUr >= M.BRAND.tid && this.startBrand) { this.startBrand(); return; }
            }
            var fart = NK.klamp((this.temp - 55) / 30, 0, 1) / m.inddampTid;
            this.fordampet = Math.min(1, this.fordampet + fart * dt);
            this.urMinutter += dt * (fart > 0 ? 45 / m.inddampTid : 0);
            if (!this.rest) this.rest = this.beregnRest();
            var fedtAreal = this.rest.fedt * 55;
            b.areal = (this.b0 || 0) * (1 - this.fordampet);
            b.fedt = fedtAreal * NK.klamp(this.fordampet * 1.2, 0, 1);
            b.salt = NK.klamp(this.rest.salt / 0.05, 0, 1) * NK.klamp((this.fordampet - 0.7) / 0.3, 0, 1);
            b.farve = NK.blandFarve(this.filtratFarve || m.farve, M.FARVE.fedt, m.id === "heptan" ? Math.pow(this.fordampet, 2) * 0.6 : 0);
            this.dampUr -= dt;
            if (fart > 0 && this.dampUr <= 0) {
                this.dampUr = 0.12;
                var top = NK.tilVerden(b.p, b.anker, 36, 30);
                this.dampe.push({ x: top.x + r(-20, 20), y: top.y, vx: r(-6, 6), vy: r(-40, -24), r: r(5, 9), liv: 1 });
                if (Math.random() < 0.5) {
                    this.bobler.push({ x: r(14, 58), y: 84, r: r(1, 2.2), vy: -r(30, 60) });
                    if (Math.random() < 0.3 && NK.Lyd) NK.Lyd.boble();
                }
            }
            if (this.fordampet >= 1) {
                this.gjort.inddamp = true;
                this.pladeTaendt = false;
                this.flammeTaendt = false;
                b.areal = 0;
                b.fedt = fedtAreal;
                this.iagttag("rest_" + m.id);
                this.besked("Al væsken er fordampet. Lad glasset køle af.", "god");
                if (NK.Lyd) { NK.Lyd.klik(); NK.Lyd.succes(); }
                this.aendret("inddamp");
            }
        }
    };

    P.beregnRest = function () {
        var m = this.midlObj();
        var rst = M.rest({ midl: m, knust: this.knust, tid: this.roerTid, mChips: this.mChips, mTab: this.mTab, skyllet: this.skyllet });
        return { fedt: M.afrund(rst.fedt, 2), salt: M.afrund(rst.salt, 2) };
    };

    P.vaegtMaal = function () {
        var b = this.g.baegerB;
        if (b.sted === "vaegt") {
            if (this.gjort.inddamp && this.rest) return this.baegerMasse + this.rest.fedt + this.rest.salt;
            return this.baegerMasse;
        }
        var baad = this.g.vejebaad;
        if (Math.abs(baad.p.x - baad.hjem.x) < 2 && Math.abs(baad.p.y - baad.hjem.y) < 2) return this.chipsMasse();
        return 0;
    };

    P.opdaterVaegt = function (dt) {
        var maal = this.vaegtMaal();
        this.vaegtVisning = NK.mod(this.vaegtVisning, maal, 7, dt);
        if (Math.abs(this.vaegtVisning - maal) < 0.004) this.vaegtVisning = maal;
    };

    P.vaegtTekst = function () {
        return M.komma(this.vaegtVisning, 2) + " g";
    };

    P.opdaterEffekter = function (dt) {
        var i, b = this.g.baegerB;
        for (i = this.flyvende.length - 1; i >= 0; i--) {
            var f = this.flyvende[i];
            f.a += (f.va || 0) * dt;
            if (f.fra) {
                f.t += dt / f.varighed;
                var e = Math.min(1, f.t);
                f.x = NK.lerp(f.fra.x, f.til.x, e);
                f.y = NK.lerp(f.fra.y, f.til.y, e) - Math.sin(Math.PI * e) * 50;
                if (f.t >= 1) {
                    this.flyvende.splice(i, 1);
                    if (f.vedLanding) f.vedLanding.call(this);
                }
                continue;
            }
            if (f.fysik) {
                f.vy += 900 * dt;
                f.x += f.vx * dt;
                f.y += f.vy * dt;
                if (f.maal === "baegerA") {
                    var bund = NK.tilVerden(this.g.baegerA.p, this.g.baegerA.anker, 36, 80).y;
                    if (f.y > bund) { this.flyvende.splice(i, 1); this.nyKrummeIA(); }
                } else if (f.y > S.BORD - 1) {
                    f.y = S.BORD - 1;
                    f.vx *= 0.5;
                    f.vy = -f.vy * 0.25;
                    if (Math.abs(f.vy) < 30) { f.vy = 0; f.vx = 0; f.va = 0; f.fysik = false; f.hvile = true; }
                }
            }
        }

        for (i = this.draaber.length - 1; i >= 0; i--) {
            var d = this.draaber[i];
            d.vy += 900 * dt;
            d.y += d.vy * dt;
            var flade = b.niveau ? b.niveau : NK.tilVerden(b.p, b.anker, 36, 84).y;
            if (d.y >= flade) {
                this.draaber.splice(i, 1);
                if (Math.random() < 0.25 && NK.Lyd) NK.Lyd.plip();
            }
        }

        for (i = this.bobler.length - 1; i >= 0; i--) {
            var bo = this.bobler[i];
            bo.y += bo.vy * dt;
            if (bo.y < 30) this.bobler.splice(i, 1);
        }

        for (i = this.dampe.length - 1; i >= 0; i--) {
            var p = this.dampe[i];
            if (p.x > S.SKAB.x0) p.vy -= 40 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += dt * 8;
            p.liv -= dt * 0.5;
            if (p.liv <= 0 || p.y < S.SKAB.glas + 20) this.dampe.splice(i, 1);
        }

        for (i = this.roeg.length - 1; i >= 0; i--) {
            var ro = this.roeg[i];
            ro.x += ro.vx * dt;
            ro.y += ro.vy * dt;
            ro.vy -= 10 * dt;
            ro.r += dt * (ro.vokser || 14);
            ro.liv -= dt * (ro.henfald || 0.35);
            if (ro.liv <= 0) this.roeg.splice(i, 1);
        }
    };
}());
