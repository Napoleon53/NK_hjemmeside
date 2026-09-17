/* =====================================================================
   forsoeg.js - selve forsoeget: tilstand, trin og handlinger

   Forsoeget foelger vejledningen "Indgreb i en kemisk ligevaegt" og har
   to dele, som eleven skifter imellem:

   Del 1, de syv glas. Stamoploesningen staar faerdig i en kolbe. Den
   haeldes i et baegerglas og derfra i glas 1 til 7. Glas 1 faar
   Fe(NO3)3 (s), glas 2 ascorbinsyre (s), glas 3 KSCN (s), glas 4 AgNO3,
   glas 5 staar i varmt vandbad, glas 6 i isbad og glas 7 ved
   stuetemperatur som reference. Glas 8 bruges til forundersoegelsen med
   KSCN og AgNO3. Temperaturen maales, og glassene fotograferes.

   Del 2, fortynding. To baegerglas paa hvidt papir: foerst frugtfarve,
   derefter ligevaegtsblanding. Det ene fortyndes til dobbelt volumen, og
   glassene sammenlignes ovenfra.

   Alt udstyr kan gribes med musen. Slippes det over en beholder, bruges
   det paa den: kolben og flaskerne haelder, baegerglasset haelder, draabe-
   flasken drypper, pulverglassene giver en spatelspids med spatlen,
   glasstaven roerer, og termometeret maaler. Et klik bruger udstyret paa
   den valgte beholder. Genstandene flyttes af smaa koreografier (koer):
   en liste af trin, der enten flytter en genstand, venter og goer noget
   undervejs, eller kalder en funktion.

   Forkerte handlinger afvises ikke, men giver et uheld eller en
   bemaerkning fra laereren (laerer.js):
     rystes et glas, et baegerglas, kolben eller et bad voldsomt, skvulper
     det ud, og laereren toerrer op
     loeber en beholder over, bliver der en pyt
     haeldes stamoploesningen i affaldsdunken, henter laereren mere
     faar glas 7 et indgreb, er der ingen urørt reference
     faar et glas to slags indgreb, siger laereren det
     kommer frugtfarve og ligevaegtsblanding i samme glas, siger han det

   Tegningen og musen staar i bord.js, laereren i laerer.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var r = NK.r;
    var A = S.ANKER;

    var GLAS = ["glas1", "glas2", "glas3", "glas4", "glas5", "glas6", "glas7", "glas8"];
    NK.GLAS = GLAS;

    /* Det udstyr, der bliver haengende over glasset, naar det er brugt */
    var SVAEVER = ["spatel", "ag", "flaske_scn", "flaske_farve", "vand", "kolbe1", "kolbe2", "baegerA"];

    function kopi(p) { return { x: p.x, y: p.y, v: p.v }; }

    var STOF = {
        fe:   { navn: "Fe(NO₃)₃ (s)" },
        vitc: { navn: "ascorbinsyre" },
        scn:  { navn: "KSCN (s)" }
    };
    NK.STOF = STOF;

    var TRIN1 = [
        { id: "stam", tekst: "Hæld stamopløsning i bægerglasset", mark: "kolbe1",
          hint: "Tag fat i kolben med stamopløsning, og slip den over bægerglasset." },
        { id: "fordel", tekst: "Hæld et par mL i glas 1 til 7", mark: "baegerA",
          hint: "Tag fat i bægerglasset, og slip det over glas 1. Gør det samme med glas 2 til 7." },
        { id: "g1", tekst: "Glas 1: Fe(NO₃)₃ (s), og rør rundt", mark: "pulver_fe", glas: 1, stof: "fe",
          hint: "Tag fat i pulverglasset med Fe(NO₃)₃, og slip det over glas 1. Rør så rundt med glasstaven." },
        { id: "g2", tekst: "Glas 2: ascorbinsyre (s), og rør rundt", mark: "pulver_vitc", glas: 2, stof: "vitc",
          hint: "Tag fat i ascorbinsyren, og slip den over glas 2. Rør så rundt." },
        { id: "g3", tekst: "Glas 3: KSCN (s), og rør rundt", mark: "pulver_scn", glas: 3, stof: "scn",
          hint: "Tag fat i pulverglasset med KSCN, og slip det over glas 3. Rør så rundt." },
        { id: "g8", tekst: "Glas 8: KSCN og et par dråber AgNO₃", mark: "flaske_scn", glas: 8,
          hint: "Forundersøgelsen: hæld KSCN 0,1 M i det tomme glas 8, og dryp AgNO₃ i. Hold øje med glasset." },
        { id: "g4", tekst: "Glas 4: et par dråber AgNO₃", mark: "ag", glas: 4,
          hint: "Tag fat i dråbeflasken med AgNO₃, og slip den over glas 4. Flasken bliver hængende, og et klik på den gule pil giver en dråbe mere." },
        { id: "g5", tekst: "Glas 5: i det varme vandbad", mark: "vandbad", glas: 5,
          hint: "Tag fat i glas 5, og stil det i vandbadet." },
        { id: "g6", tekst: "Glas 6: i isbadet", mark: "isbad", glas: 6,
          hint: "Tag fat i glas 6, og stil det i isbadet." },
        { id: "temp", tekst: "Mål temperaturen i glas 5, 6 og 7", mark: "termometer",
          hint: "Tag fat i termometeret, og slip det over glasset. Vent med glas 5 og 6, til de har stået lidt i badene." },
        { id: "billede", tekst: "Tag et billede af glas 1 til 7", mark: "kort",
          hint: "Klik på Tag billede eller på det hvide kort. Notér for hvert glas, om det er mørkere eller lysere end glas 7." },
        { id: "affald", tekst: "Hæld resterne i affaldsdunken", mark: "dunk",
          hint: "Tag fat i hvert glas og i bægerglasset, og slip dem over affaldsdunken." }
    ];

    var TRIN2 = [
        { id: "farve", tekst: "Hæld frugtfarve i de to glas i par 1", mark: "flaske_farve",
          hint: "Tag fat i flasken med frugtfarve, og slip den over hvert af de to venstre bægerglas. Hver hældning giver 20 mL, og den gule pil hælder mere i det samme glas." },
        { id: "lv", tekst: "Hæld ligevægtsblanding i de to glas i par 2", mark: "kolbe2",
          hint: "Tag fat i kolben med stamopløsning, og slip den over hvert af de to højre bægerglas. Begge glas skal have lige meget." },
        { id: "vand", tekst: "Fordobl volumen i ét glas i hvert par", mark: "vand",
          hint: "Tag fat i sprøjteflasken, og slip den over det ene glas i hvert par. Hver gang giver 10 mL. Læs volumen på glasset." },
        { id: "sml", tekst: "Sammenlign de fire glas ovenfra", mark: "papir",
          hint: "Klik på Se ovenfra eller på det hvide papir, og notér for hvert par, hvordan det fortyndede glas ser ud." }
    ];
    NK.TRIN = { 1: TRIN1, 2: TRIN2 };

    /* De fire baegerglas i del 2, to og to i par */
    var BAEGERE = ["baeger1", "baeger2", "baeger3", "baeger4"];
    NK.BAEGERE = BAEGERE;

    var SVAR_FOTO = ["mørkere", "lysere", "som glas 7"];
    var SVAR_OVENFRA = ["som det andet glas", "lysere", "mørkere"];
    NK.SVAR = { foto: SVAR_FOTO, ovenfra: SVAR_OVENFRA };

    var INDGREB_TEKST = {
        fe: "+ Fe(NO₃)₃ (s)", vitc: "+ ascorbinsyre", scn: "+ KSCN (s)", kscn: "+ KSCN (aq)",
        ag: "+ AgNO₃", vand: "+ vand", varme: "vandbad", kulde: "isbad"
    };
    NK.INDGREB_TEKST = INDGREB_TEKST;

    NK.Forsoeg = function (canvas) {
        this.canvas = canvas;
        this.laerred = canvas ? new NK.Laerred(canvas) : null;
        this.tid = 0;
        this.koppenVaek = false;
        this.vedAendring = null;
        this.vedBesked = null;
        if (this.laererStart) this.laererStart();
        this.nulstil();
        if (canvas && this.bindMus) this.bindMus();
    };

    var P = NK.Forsoeg.prototype;

    function genstand(navn, sprite, station, greb) {
        var hjem = S.HJEM[navn];
        return { navn: navn, sprite: sprite, anker: A[sprite], station: station, greb: greb, hjem: hjem, p: kopi(hjem) };
    }

    function beholderGenstand(navn, station, titel) {
        var c = genstand(navn, "baeger", station, "baeger");
        c.erBeholder = true;
        c.titel = titel;
        c.b = M.beholder(M.MAENGDE.LAG_BAEGER);
        c.mikro = new NK.Mikro();
        c.niveau = null;
        return c;
    }

    function nulstilGlasData(gl) {
        M.toem(gl.b);
        gl.mikro.toem();
        gl.fyldt = false;
        gl.indgreb = { fe: 0, vitc: 0, scn: 0, kscn: 0, ag: 0, vand: 0, maksT: M.TEMP.stue, minT: M.TEMP.stue };
        gl.vurdering = null;
        gl.maaltT = null;
        gl.afkoelet = false;
        gl.slut = null;
    }

    function nytGlas(navn, nr) {
        var gl = genstand(navn, "reagensglas", 1, "glas");
        gl.nr = nr;
        gl.erGlas = true;
        gl.erBeholder = true;
        gl.titel = "Glas " + nr;
        gl.b = M.beholder(M.MAENGDE.LAG_GLAS);
        gl.mikro = new NK.Mikro();
        gl.sted = "stativ";
        gl.fraSted = "stativ";
        gl.niveau = null;
        nulstilGlasData(gl);
        return gl;
    }

    /* ----- Nulstilling ------------------------------------------------ */
    P.nulstil = function () {
        this.gjort = {};
        this.haendt = {};
        this.trinStart = this.tid;
        this.sidsteTrin = "";
        this.urMinutter = 10 * 60 + 5;
        this.station = 1;

        var g = this.g = {
            kolbe1:       genstand("kolbe1", "kolbe", 1, "kolbe"),
            baegerA:      beholderGenstand("baegerA", 1, "Bægerglasset"),
            pulver_fe:    genstand("pulver_fe", "pulver_fe", 1, "pulver"),
            pulver_vitc:  genstand("pulver_vitc", "pulver_vitc", 1, "pulver"),
            pulver_scn:   genstand("pulver_scn", "pulver_scn", 1, "pulver"),
            spatel:       genstand("spatel", "spatel", 1, "spatel"),
            flaske_scn:   genstand("flaske_scn", "flaske_scn", 1, "flaske"),
            ag:           genstand("ag", "ag", 1, "draabe"),
            glasstav:     { navn: "glasstav", station: 1, greb: "stav", hjem: S.HJEM.glasstav, p: kopi(S.HJEM.glasstav) },
            termometer:   { navn: "termometer", station: 1, greb: "termometer", hjem: S.HJEM.termometer, p: kopi(S.HJEM.termometer), T: M.TEMP.stue },
            vandbad:      { navn: "vandbad", station: 1, greb: "bad" },
            isbad:        { navn: "isbad", station: 1, greb: "bad" },
            kolbe2:       genstand("kolbe2", "kolbe", 2, "kolbe"),
            flaske_farve: genstand("flaske_farve", "flaske_farve", 2, "flaske"),
            vand:         genstand("vand", "vand", 2, "flaske"),
            kaffekop:     genstand("kaffekop", "kaffekop", 0, null)
        };
        BAEGERE.forEach(function (n, i) {
            g[n] = beholderGenstand(n, 2, "Bægerglas " + (i + 1));
            g[n].par = i < 2 ? 0 : 1;
        });
        g.pulver_fe.stof = "fe";
        g.pulver_vitc.stof = "vitc";
        g.pulver_scn.stof = "scn";
        g.flaske_scn.stof = "kscn";
        g.flaske_farve.stof = "farve";
        g.vand.stof = "vand";
        g.spatel.last = null;
        /* Alt kan vaelges, saa alt har et navn */
        var titler = {
            kolbe1: "Kolben med stamopløsning", kolbe2: "Kolben med stamopløsning",
            pulver_fe: "Pulverglasset med Fe(NO₃)₃", pulver_vitc: "Pulverglasset med ascorbinsyre",
            pulver_scn: "Pulverglasset med KSCN", spatel: "Spatlen",
            flaske_scn: "Flasken med KSCN 0,1 M", ag: "Dråbeflasken med AgNO₃ 0,1 M",
            glasstav: "Glasstaven", termometer: "Termometeret", vandbad: "Vandbadet", isbad: "Isbadet",
            flaske_farve: "Flasken med frugtfarve", vand: "Sprøjteflasken med vand"
        };
        Object.keys(titler).forEach(function (n) { g[n].titel = titler[n]; });
        SVAEVER.forEach(function (n) { if (g[n]) g[n].svaev = null; });
        GLAS.forEach(function (n, i) { g[n] = nytGlas(n, i + 1); });
        g.kaffekop.skjult = this.koppenVaek;

        this.valgtPr = { 1: "baegerA", 2: "baeger1" };
        this.valgt = "baegerA";
        this.resultat = null;
        this.del2 = { vurdering: {}, resultat: {} };

        this.handling = null;
        this.holdt = null;
        this.hover = null;
        this.baerer = null;
        this.slipMaal = null;
        this.rystKilde = null;
        this.rystGlas = null;
        this.ryst = 0;
        this.spildTid = 0;
        this.vold = 0;
        this.uro = 0;
        this.musVx = 0;
        this.musFart = 0;
        this.skvulpUr = 0;
        this.haandAlfa = 0;
        this.roerer = null;
        this.maaler = null;
        this.mark = null;
        this.ryk = 0;

        this.straale = null;
        this.draaber = [];
        this.dampe = [];
        this.dampUr = 0;
        this.pyt = null;
        this.antalUheld = 0;
        this.rystUheld = 0;

        this.bobleAlfa = 0;
        this.bobleBeholder = null;
        this.visning = null;
        this.sidsteVisning = null;
        this.visAlfa = 0;
        this.visData = null;
        this.badOff = { vandbad: { x: 0, y: 0 }, isbad: { x: 0, y: 0 } };
        if (this.laererNyt) this.laererNyt();
        this.aendret("nulstil");
    };

    /* ----- Beholderne --------------------------------------------------- */
    P.synlig = function (gg) {
        return !!gg && (!gg.station || gg.station === this.station);
    };

    P.glasListe = function () {
        var g = this.g;
        return GLAS.map(function (n) { return g[n]; });
    };

    P.baegerListe = function () {
        var g = this.g;
        return BAEGERE.map(function (n) { return g[n]; });
    };

    /* De to par: glas 1 og 2, og glas 3 og 4 */
    P.parListe = function () {
        var b = this.baegerListe();
        return [[b[0], b[1]], [b[2], b[3]]];
    };

    P.beholderListe = function (station) {
        var st = station || this.station, g = this.g;
        return st === 1 ? [g.baegerA].concat(this.glasListe()) : this.baegerListe();
    };

    P.alleBeholdere = function () {
        return this.beholderListe(1).concat(this.beholderListe(2));
    };

    P.valgtBeholder = function () {
        var c = this.valgt ? this.g[this.valgt] : null;
        return c && c.erBeholder && this.synlig(c) ? c : null;
    };

    /* Den valgte genstand, uanset om den rummer noget */
    P.valgtGenstand = function () {
        var gg = this.valgt ? this.g[this.valgt] : null;
        return gg && this.synlig(gg) ? gg : null;
    };

    /* ----- Det, der svaever over et glas ---------------------------------- */
    /* Det, der lige er brugt, bliver haengende over glasset med en gul ring
       ved siden af. Et klik paa ringen eller paa genstanden gentager
       handlingen, og traekkes den vaek, gaar den hjem. */
    P.svaevende = function () {
        for (var i = 0; i < SVAEVER.length; i++) {
            var gg = this.g[SVAEVER[i]];
            if (gg && gg.svaev && this.synlig(gg)) return gg;
        }
        return null;
    };

    P.svaevRing = function () {
        var sv = this.svaevende();
        if (!sv || this.optaget() || this.holdt || this.visning) return null;
        var rekt = S.rekt(sv.sprite, sv.p, sv.anker, 0);
        return { x: rekt.x + rekt.b + 18, y: rekt.y + rekt.h * 0.45, r: 14, navn: sv.navn };
    };

    /* Koreografitrin: gg lander svaevende over c og bliver der. pose(gg, c)
       giver posituren; uden pose bliver gg i haeldepositur. */
    P.svaevVed = function (gg, c, pose, slags) {
        var mig = this;
        return [
            { flyt: gg, til: function () { return pose ? pose.call(mig, gg, c) : mig.poseOver(gg, c); }, tid: 0.45, loeft: 14 },
            { kald: function () { gg.svaev = { c: c, slags: slags || "brug" }; this.aendret("svaev"); } }
        ];
    };

    P.svaevHjem = function (gg) {
        if (!gg || !gg.svaev) return;
        gg.svaev = null;
        this.koer([hjemTil(gg, 0.6, 40)], "hjem");
    };

    /* Et klik paa det svaevende eller paa ringen gentager handlingen */
    P.gentagSvaev = function (sv) {
        var maal = sv.svaev.c;
        if (!maal || !this.synlig(maal)) { this.svaevHjem(sv); return false; }
        if (sv.svaev.slags === "fyld") { this.fyldSpatel(maal.stof); return true; }
        return this.brug(sv, maal);
    };

    P.vaelg = function (navn) {
        if (this.valgt === navn) return;
        this.valgt = navn;
        this.valgtPr[this.station] = navn;
        this.aendret("valg");
    };

    P.navn = function (c) {
        return c.titel;
    };

    P.aabning = function (c) {
        if (c.erGlas || !c.erBeholder) return { x: c.p.x, y: c.p.y };
        return NK.tilVerden(c.p, c.anker, 36, 4);
    };

    P.hjemFor = function (gl) {
        if (gl.sted === "vandbad" || gl.sted === "isbad") return S.BAD[gl.sted].glas;
        return gl.hjem;
    };

    P.glasI = function (bad) {
        var liste = this.glasListe();
        for (var i = 0; i < liste.length; i++) if (liste[i].sted === bad) return liste[i];
        return null;
    };

    /* Bundfaldet til tegningen: hoejden af det bundfaeldede og hvor uklar
       vaesken er af det, der svaever */
    P.bundfald = function (c) {
        var b = c.b;
        var agscn = b.sol.agscn + (b.lag ? b.lag.agscn : 0);
        var V = M.volumen(b);
        return {
            bund: b.bund * (c.erGlas ? 0.09 : 0.02),
            uklar: V > 0.05 ? NK.klamp((agscn - b.bund) / V * 0.9, 0, 0.8) : 0
        };
    };

    /* ----- Indgreb og reference ------------------------------------------ */
    P.indgrebListe = function (gl) {
        var i = gl.indgreb, ud = [];
        ["fe", "vitc", "scn", "kscn", "ag", "vand"].forEach(function (k) { if (i[k] > 0) ud.push(k); });
        if (i.maksT >= M.TEMP.varm) ud.push("varme");
        if (i.minT <= M.TEMP.kold) ud.push("kulde");
        return ud;
    };

    P.indgrebTekst = function (gl) {
        var l = this.indgrebListe(gl);
        return l.length ? l.map(function (k) { return INDGREB_TEKST[k]; }).join(", ") : "urørt";
    };

    P.uroert = function (gl) {
        return !!(gl.fyldt && M.volumen(gl.b) > 0.5 && this.indgrebListe(gl).length === 0 && gl.indgreb.maksT < 30 && gl.indgreb.minT > 12);
    };

    P.efterIndgreb = function (gl, slags, foer) {
        gl.vurdering = null;
        if (gl.nr === 7 && gl.fyldt) {
            if (!this.gjort.glas7Sagt) {
                this.gjort.glas7Sagt = true;
                this.haendt.glas7 = true;
                this.laererKo("laererGlas7");
            }
        } else if (gl.nr !== 8 && gl.fyldt && foer.length && foer.indexOf(slags) < 0) {
            this.haendt["blandet" + gl.nr] = true;
            if (!this.gjort.blandetSagt) {
                this.gjort.blandetSagt = true;
                this.laererKo("laererBlandet", gl);
            }
        }
        this.aendret("indgreb");
    };

    /* ----- Del 2: hvad der er i baegerglassene --------------------------- */
    P.indholdType = function (c) {
        var o = M.samlet(c.b);
        if (o.V < 0.3) return "tom";
        var farve = o.farvestof > 0, lv = o.fe + o.fe2 > 0;
        if (farve && lv) return "blanding";
        if (farve) return "frugtfarve";
        if (lv) return "ligevægtsblanding";
        return "vand";
    };

    P.indholdTekst = function (c) {
        var t = this.indholdType(c);
        if (t === "tom") return "tomt";
        if (t === "blanding") return "frugtfarve og ligevægtsblanding";
        return t;
    };

    /* Et par hoerer til den oploesning, begge glas har i sig. Det er
       indholdet, der afgoer det, ikke pladsen paa papiret, saa det virker
       ogsaa, hvis eleven bytter om paa parrene. */
    P.parType = function (par, minV) {
        var mig = this;
        var t = this.indholdType(par[0]);
        if (t === "tom" || t === "vand" || t === "blanding") return null;
        return par.every(function (c) {
            return mig.indholdType(c) === t && M.volumen(c.b) >= (minV === undefined ? 10 : minV);
        }) ? (t === "frugtfarve" ? "farve" : "lv") : null;
    };

    /* Er det ene glas i parret fortyndet til dobbelt volumen? */
    P.parFordoblet = function (par) {
        var a = M.volumen(par[0].b), b = M.volumen(par[1].b);
        var lo = Math.min(a, b), hi = Math.max(a, b);
        return lo >= 10 && hi / lo >= M.FORDOBLING.min && hi / lo <= M.FORDOBLING.maks;
    };

    /* Parret med den oploesning, eller null */
    P.parMed = function (type, minV) {
        var mig = this, fundet = null;
        this.parListe().forEach(function (par) {
            if (!fundet && mig.parType(par, minV) === type) fundet = par;
        });
        return fundet;
    };

    P.beggeParFordoblet = function () {
        var f = this.parMed("farve", 10), l = this.parMed("lv", 10);
        return !!(f && l && this.parFordoblet(f) && this.parFordoblet(l));
    };

    P.tjekBlanding = function (c) {
        if (c.station === 2 && this.indholdType(c) === "blanding" && !this.gjort.kunstSagt) {
            this.gjort.kunstSagt = true;
            this.haendt.kunst = true;
            this.laererKo("laererKunst");
        }
    };

    /* ----- Til panelet ------------------------------------------------ */
    function oploestOgBlandet(gl) {
        return M.fastIalt(gl.b) <= 0 && !gl.b.lag;
    }

    P.trin = function () {
        return NK.TRIN[this.station];
    };

    P.trinGjort = function (id) {
        var gj = this.gjort, g = this.g;
        switch (id) {
            case "stam": return !!(gj.affald || gj.fordelt || this.alleFyldte() || M.volumen(g.baegerA.b) >= 10);
            case "fordel": return !!(gj.affald || gj.fordelt || this.alleFyldte());
            case "g1": return !!gj.affald || (g.glas1.indgreb.fe > 0 && oploestOgBlandet(g.glas1));
            case "g2": return !!gj.affald || (g.glas2.indgreb.vitc > 0 && oploestOgBlandet(g.glas2));
            case "g3": return !!gj.affald || (g.glas3.indgreb.scn > 0 && oploestOgBlandet(g.glas3));
            case "g8": return !!gj.affald || (g.glas8.indgreb.kscn > 0 && g.glas8.indgreb.ag > 0);
            case "g4": return !!gj.affald || g.glas4.indgreb.ag > 0;
            case "g5": return !!gj.affald || g.glas5.indgreb.maksT >= M.TEMP.varm;
            case "g6": return !!gj.affald || g.glas6.indgreb.minT <= M.TEMP.kold;
            case "temp":
                return !!gj.affald || (g.glas5.maaltT !== null && g.glas5.maaltT >= 50 &&
                    g.glas6.maaltT !== null && g.glas6.maaltT <= 10 && g.glas7.maaltT !== null);
            case "farve": return !!(gj.sml || this.parMed("farve", 10));
            case "lv": return !!(gj.sml || this.parMed("lv", 10));
            case "vand": return !!(gj.sml || this.beggeParFordoblet());
            default: return !!gj[id];
        }
    };

    P.aktueltTrin = function () {
        var liste = this.trin();
        for (var i = 0; i < liste.length; i++) if (!this.trinGjort(liste[i].id)) return liste[i];
        return null;
    };

    P.alleFaerdige = function () {
        return !!(this.gjort.affald && this.gjort.sml);
    };

    P.travl = function () {
        return !!(this.handling || this.holdt || this.rystKilde || this.baerer || (this.laererOptaget && this.laererOptaget()));
    };

    P.markérGlas = function () {
        this.markér(this.station === 1 ? "stativ" : "baeger1", 3);
    };

    /* Hint til det aktuelle trin. Genstanden, det handler om, faar en
       pulserende ramme i fem sekunder. */
    P.hint = function () {
        var t = this.aktueltTrin();
        if (!t) return null;
        var mark = t.mark;
        if (t.stof) {
            var gl = this.g["glas" + t.glas];
            if (gl.indgreb[t.stof] > 0 && !oploestOgBlandet(gl)) mark = "glasstav";
        }
        if (t.id === "g8" && this.g.glas8.indgreb.kscn > 0) mark = "ag";
        this.markér(mark, 5);
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

    /* Laereren kommer, naar han ikke er optaget af noget andet */
    P.laererKo = function (fn, arg) {
        this.laererVent = this.laererVent || [];
        for (var i = 0; i < this.laererVent.length; i++) if (this.laererVent[i].fn === fn) return;
        this.laererVent.push({ fn: fn, arg: arg });
    };

    /* ----- Koreografier ------------------------------------------------ */
    /* En genstand paa vej hjem blokerer ikke: den nye koreografi koerer
       efter den, og genstanden fortsaetter fra der, hvor den er. */
    P.koer = function (liste, navn) {
        var h = this.handling;
        if (h && h.navn === "hjem") {
            var rest = h.liste.slice(h.i).map(function (tr, k) {
                if (k > 0) return tr;
                var ny = {};
                for (var n in tr) if (Object.prototype.hasOwnProperty.call(tr, n) && n !== "fra") ny[n] = tr[n];
                return ny;
            });
            liste = rest.concat(liste);
        }
        this.handling = { liste: liste, i: 0, t: 0, navn: navn || "" };
        this.aendret("handling");
    };

    /* Er der en koreografi i gang, som scenen skal vente paa? */
    P.optaget = function () {
        return !!(this.handling && this.handling.navn !== "hjem");
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
        if (this.visning) return this.klikVisning(navn);
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (this.optaget() || this.holdt || this.rystKilde) return false;
        if (navn === "kaffekop") return this.klikKop ? this.klikKop() : false;
        if (navn === "kort" || navn === "papir") return this.aabnVisning();

        /* Det, der svaever over et glas, gentager sin handling ved et klik.
           Klikkes der et andet sted, gaar det hjem. */
        var sv = this.svaevende();
        if (sv && navn === sv.navn) return this.gentagSvaev(sv);
        if (sv) this.svaevHjem(sv);

        /* Klik viser, traek goer: et klik vaelger kun genstanden, saa den
           kan laeses og ses i zoomboblen. Handlinger sker ved at traekke. */
        var gg = this.g[navn];
        if (!gg || !this.synlig(gg)) return this.klikSted(navn);
        this.vaelg(navn);
        this.besked(this.valgBesked(gg));
        return true;
    };

    /* Stativet og dunken er steder paa bordet, ikke genstande */
    P.klikSted = function (navn) {
        if (navn === "dunk") this.besked("Affaldsdunken til surt uorganisk affald. Træk et glas herover for at tømme det.");
        else if (navn === "stativ") this.besked("Stativet. Træk et glas herover for at sætte det tilbage.");
        else return false;
        this.markér(navn, 2);
        return true;
    };

    P.valgBesked = function (gg) {
        var t = gg.titel || "Genstanden";
        if (gg.erBeholder) return t + " er valgt.";
        if (gg.greb === "bad") return t + " er valgt. Træk et reagensglas ned i det.";
        if (gg.greb === "pulver") return t + " er valgt. Træk det hen over et glas, så tager spatlen en spatelspids.";
        if (gg.greb === "spatel") return t + (gg.last ? " har " + STOF[gg.last].navn + " på. Træk den hen over et glas." : " er valgt. Træk den ned i et pulverglas.");
        return t + " er valgt. Træk den hen over et glas for at bruge den.";
    };

    /* Er der stamoploesning i glas 1 til 7? Trinnet er gjort, uanset om der
       blev fordelt med et klik paa baegerglasset, haeldt i ét glas ad gangen
       eller haeldt direkte fra kolben. */
    P.alleFyldte = function () {
        return this.glasListe().every(function (gl) { return gl.nr > 7 || gl.fyldt; });
    };

    P.tjekFordelt = function () {
        if (this.gjort.fordelt || !this.alleFyldte()) return false;
        this.gjort.fordelt = true;
        this.valgt = null;
        this.valgtPr[1] = null;
        this.besked("Der er stamopløsning i glas 1 til 7.", "god");
        if (NK.Lyd) NK.Lyd.succes();
        return true;
    };

    /* Udstyret gg bruges paa beholderen c. Det sker, naar udstyret slippes
       over den, eller naar der klikkes paa det, der svaever over den. */
    P.brug = function (gg, c) {
        if (!c || !c.erBeholder) {
            this.besked("Slip udstyret over et glas for at bruge det.");
            this.markérGlas();
            return false;
        }
        if (c.erGlas && c.sted === "flytter") return false;
        switch (gg.greb) {
            case "kolbe":
                if (gg.tom) { this.besked("Kolben er tom."); return false; }
                this.haeld(gg, c, c.erGlas ? M.MAENGDE.KOLBE_GLAS : (this.station === 1 ? M.MAENGDE.KOLBE_BAEGER : M.MAENGDE.KOLBE_BAEGER2));
                return true;
            case "baeger":
                return this.haeldFraBaeger(gg, c);
            case "flaske":
                var mL;
                if (gg.stof === "kscn") mL = M.MAENGDE.KSCN_FLASKE;
                else if (gg.stof === "farve") mL = c.erGlas ? M.MAENGDE.BAEGER_GLAS : M.MAENGDE.FARVE;
                else mL = c.erGlas ? M.MAENGDE.VAND_GLAS : M.MAENGDE.VAND_BAEGER;
                this.haeld(gg, c, mL);
                return true;
            case "draabe":
                this.draabe(c);
                return true;
            case "pulver":
                this.spatelspids(gg, c);
                return true;
            case "spatel":
                return this.toemSpatel(c);
            case "stav":
                if (M.volumen(c.b) < 0.3) { this.besked(this.navn(c) + " er tomt."); return false; }
                this.roer(c);
                return true;
            case "termometer":
                if (M.volumen(c.b) < 0.3) { this.besked(this.navn(c) + " er tomt."); return false; }
                this.maal(c);
                return true;
        }
        return false;
    };

    /* ----- Haeldning fra kolben og flaskerne --------------------------------- */
    P.indholdFra = function (gg, mL) {
        if (gg.greb === "kolbe") return M.stamOpl(mL);
        if (gg.greb === "draabe") return M.agOpl(mL);
        if (gg.stof === "kscn") return M.kscnOpl(mL);
        if (gg.stof === "farve") return M.farveOpl(mL);
        return M.vandOpl(mL);
    };

    /* Det, zoomboblen viser: den valgte beholder, eller indholdet i den
       valgte flaske, saa eleven kan se, hvad der staar i den */
    P.bobleMaal = function () {
        var gg = this.valgtGenstand();
        if (!gg) return null;
        if (gg.erBeholder) return gg;
        if (gg.greb !== "kolbe" && gg.greb !== "flaske" && gg.greb !== "draabe" && gg.greb !== "pulver") return null;
        if (gg.greb === "kolbe" && gg.tom) return null;
        if (!gg.vis) {
            var f = NK.Sprites.FILER[gg.sprite];
            var fast = gg.greb === "pulver" ? M.FAST_MIKRO[gg.stof] : null;
            gg.vis = {
                navn: gg.navn, titel: fast ? fast.titel : gg.titel, anker: gg.anker, erBeholder: true, erFlaske: true,
                lup: { x: f.b / 2, y: f.h * 0.55 }, mikro: new NK.Mikro(), b: M.beholder(1)
            };
            if (fast) gg.vis.mikro.visFast(fast);
            else M.haeldI(gg.vis.b, this.indholdFra(gg, 20));
        }
        gg.vis.p = gg.p;
        return gg.vis;
    };

    P.straaleFarve = function (gg) {
        if (gg.greb === "kolbe") return M.baegerFarve(M.stamOpl(10));
        if (gg.stof === "farve") return M.baegerFarve(M.farveOpl(10));
        return { r: 200, g: 228, b: 245, a: 0.6 };
    };

    P.poseOver = function (gg, c) {
        var o = this.aabning(c);
        if (gg.greb === "kolbe") return { x: o.x + 8, y: o.y - 14, v: -1.95 };
        if (gg.stof === "vand") return { x: o.x - 8, y: o.y - 34, v: 0.55 };
        return { x: o.x + 6, y: o.y - 12, v: -1.9 };
    };

    P.haeld = function (gg, c, mL) {
        var mig = this, givet = 0, loebOver = false;
        var tid = Math.min(1.6, 0.5 + mL * 0.03);
        var foer = c.erGlas ? this.indgrebListe(c) : null;
        var farve = this.straaleFarve(gg);
        var slags = gg.greb === "kolbe" ? "stam" : gg.stof;
        this.vaelg(c.navn);
        gg.svaev = null;
        this.koer([
            { flyt: gg, til: function () { return mig.poseOver(gg, c); }, tid: 0.75, loeft: 40 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(tid); } },
            { tid: tid, hver: function (t) {
                var nu = mL * t;
                if (!loebOver && nu > givet) {
                    M.haeldI(c.b, mig.indholdFra(gg, nu - givet));
                    if (mig.tjekOverloeb(c)) loebOver = true;
                }
                givet = nu;
                var o = mig.aabning(c);
                this.straale = { fra: { x: gg.p.x, y: gg.p.y }, til: { x: o.x, y: c.niveau === null ? o.y + 100 : c.niveau }, farve: farve, bredde: gg.greb === "kolbe" ? 3 : 2 };
            } },
            { kald: function () {
                this.straale = null;
                this.efterHaeldning(c, slags, mL, foer);
            } }
        ].concat(this.svaevVed(gg, c)), "haeld");
    };

    P.efterHaeldning = function (c, slags, mL, foer) {
        if (c.erGlas) {
            if (slags === "stam") {
                if (!c.fyldt && M.volumen(c.b) > 1) { c.fyldt = true; c.vurdering = null; this.tjekFordelt(); }
            } else if (slags === "kscn") {
                c.indgreb.kscn += mL;
                this.efterIndgreb(c, "kscn", foer);
            } else {
                c.indgreb.vand += mL;
                this.efterIndgreb(c, "vand", foer);
            }
        }
        this.tjekBlanding(c);
        this.aendret("haeld");
    };

    /* Er der mere i beholderen, end der er plads til, loeber resten ud */
    P.tjekOverloeb = function (c) {
        var maks = c.erGlas ? M.MAENGDE.GLAS_MAKS : M.MAENGDE.BAEGER_MAKS;
        var V = M.volumen(c.b);
        if (V <= maks) return false;
        var ud = M.udtag(c.b, V - maks + (c.erGlas ? 1.5 : 6));
        var o = this.aabning(c);
        var fo = (c.erGlas ? M.glasFarve(ud) : M.baegerFarve(ud)) || M.FARVE.vand;
        var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.8 };
        for (var i = 0; i < 18; i++) {
            this.draaber.push({ x: o.x + r(-8, 8), y: o.y + 2, vx: r(-120, 120), vy: -r(40, 160), r: r(1.4, 2.6), liv: 1, farve: farve, fysik: true });
        }
        this.pyt = { x: NK.klamp(o.x, 120, 980), rx: 8, rxMaal: c.erGlas ? 44 : 70, farve: farve, vaad: 1 };
        this.antalUheld++;
        this.haendt["overloeb_" + c.navn] = true;
        this.ryk = 3;
        if (NK.Lyd) NK.Lyd.plask();
        this.besked(this.navn(c) + " løber over.", "advarsel");
        if (this.laererSpild) this.laererSpild(c, "overloeb");
        this.aendret("overloeb");
        return true;
    };

    /* ----- Haeldning fra et baegerglas ------------------------------------ */
    /* Positur for baegerglasset, naar det haelder fra tuden ned i c */
    P.haeldPositur = function (c) {
        var o = this.aabning(c);
        var v = -1.15, co = Math.cos(v), si = Math.sin(v);
        var dx = 1 - 36, dy = 3.5 - 4;
        return { x: o.x + 3 - (dx * co - dy * si), y: o.y - 12 - (dx * si + dy * co), v: v };
    };

    P.haeldFraBaeger = function (bg, c) {
        if (c === bg) return false;
        if (M.volumen(bg.b) < 0.2) { this.besked(this.navn(bg) + " er tomt."); return false; }
        var mL = c.erGlas ? M.MAENGDE.BAEGER_GLAS : M.volumen(bg.b);
        bg.svaev = null;
        this.vaelg(c.navn);
        this.koer(this.haeldBaegerListe(bg, c, mL).concat(this.svaevVed(bg, c, this.haeldPositurFor)), "haeld");
        return true;
    };

    /* Baegerglasset svaever i haeldepositur over c */
    P.haeldPositurFor = function (bg, c) {
        return this.haeldPositur(c);
    };

    P.haeldBaegerListe = function (bg, c, mL) {
        var mig = this, givet = 0, loebOver = false;
        return [
            { flyt: bg, til: function () { return mig.haeldPositur(c); }, tid: 0.55, loeft: 30 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(0.7); } },
            { tid: 0.75, hver: function (t) {
                var maal = mL * NK.blod(t);
                var dV = Math.min(maal - givet, M.volumen(bg.b));
                if (dV > 0.001 && !loebOver) {
                    M.haeldI(c.b, M.udtag(bg.b, dV));
                    if (mig.tjekOverloeb(c)) loebOver = true;
                }
                givet = maal;
                var tud = NK.tilVerden(bg.p, bg.anker, 1, 3.5);
                var o = mig.aabning(c);
                var farve = M.baegerFarve(M.samlet(bg.b));
                this.straale = M.volumen(bg.b) > 0.01 ? { fra: tud, til: { x: o.x, y: c.niveau === null ? o.y + 120 : c.niveau }, farve: farve || M.FARVE.vand, bredde: 2.6 } : null;
            } },
            { kald: function () {
                this.straale = null;
                var o = M.samlet(c.b);
                if (c.erGlas && !c.fyldt && o.fe + o.fe2 > 0 && M.volumen(c.b) > 1) { c.fyldt = true; c.vurdering = null; this.tjekFordelt(); }
                this.tjekBlanding(c);
                this.aendret("haeldt");
            } }
        ];
    };

    /* ----- Draaber AgNO3 ----------------------------------------------------- */
    P.draabe = function (c) {
        var fl = this.g.ag, mig = this;
        var liste = [];
        this.vaelg(c.navn);
        if (!(fl.svaev && fl.svaev.c === c)) {
            liste.push({ flyt: fl, til: function () { var o = mig.aabning(c); return { x: o.x, y: o.y - 16, v: Math.PI }; }, tid: 0.6, loeft: 50 });
            liste.push({ tid: 0.12 });
        }
        liste.push({ kald: function () {
            this.draaber.push({ x: fl.p.x, y: fl.p.y + 4, vx: 0, vy: 40, r: 3.4, liv: 1, farveloes: true, c: c });
            fl.svaev = { c: c, slags: "brug" };
            this.aendret("draabe");
        } });
        this.koer(liste, "draabe");
    };

    P.draabeLander = function (dr) {
        var c = dr.c;
        if (dr.korn) return;
        var foer = c.erGlas ? this.indgrebListe(c) : null;
        M.draabe(c.b);
        if (NK.Lyd) NK.Lyd.plip();
        if (c.erGlas) {
            c.indgreb.ag++;
            this.efterIndgreb(c, "ag", foer);
        }
        this.aendret("draabe");
    };

    /* ----- Spatlen og det faste stof ----------------------------------------- */
    P.spatelVedGlas = function (pulver) {
        var o = NK.tilVerden(pulver.hjem, pulver.anker, 19, 4);
        return { x: o.x - 12, y: o.y + 16, v: 0.35 };
    };

    P.spatelOver = function (c) {
        var o = this.aabning(c);
        return { x: o.x - 2, y: o.y - 14, v: -0.5 };
    };

    P.spatelHaeld = function (c) {
        var o = this.aabning(c);
        return { x: o.x + 1, y: o.y - 5, v: -1.15 };
    };

    P.fyldListe = function (stof) {
        var sp = this.g.spatel, mig = this, pulver = this.g["pulver_" + stof];
        return [
            { flyt: sp, til: function () { return mig.spatelVedGlas(pulver); }, tid: 0.6, loeft: 40 },
            { tid: 0.25 },
            { kald: function () { sp.last = stof; if (NK.Lyd) NK.Lyd.papir(); } },
            { flyt: sp, til: function () { var q = mig.spatelVedGlas(pulver); return { x: q.x, y: q.y - 34, v: 0 }; }, tid: 0.3, loeft: 0 }
        ];
    };

    P.spatelHaeldListe = function (c) {
        var sp = this.g.spatel, mig = this;
        return [
            { flyt: sp, til: function () { return mig.spatelOver(c); }, tid: 0.6, loeft: 40 },
            { flyt: sp, til: function () { return mig.spatelHaeld(c); }, tid: 0.3, loeft: 0 },
            { kald: function () {
                var stof = sp.last;
                sp.last = null;
                if (!stof) { this.besked("Der var ikke noget på spatlen."); return; }
                var foer = c.erGlas ? this.indgrebListe(c) : null;
                var o = mig.aabning(c);
                for (var i = 0; i < 8; i++) {
                    this.draaber.push({ x: o.x + r(-4, 4), y: o.y - 2 + r(-3, 3), vx: r(-10, 10), vy: r(10, 60), liv: 1, korn: true, farve: M.FARVE.fast[stof], c: c });
                }
                M.spatelspids(c.b, stof);
                if (c.erGlas) {
                    c.indgreb[stof]++;
                    this.efterIndgreb(c, stof, foer);
                }
                if (NK.Lyd) NK.Lyd.papir();
                this.aendret("fast");
            } },
            { tid: 0.2 }
        ];
    };

    /* Et pulverglas bruges: spatlen tager en spatelspids og kommer den i c */
    P.spatelspids = function (pulver, c) {
        var sp = this.g.spatel, liste = [];
        this.vaelg(c.navn);
        sp.svaev = null;
        if (Math.abs(pulver.p.x - pulver.hjem.x) + Math.abs(pulver.p.y - pulver.hjem.y) > 1.5) liste.push(hjemTil(pulver, 0.4, 20));
        liste = liste.concat(this.fyldListe(pulver.stof), this.spatelHaeldListe(c), this.svaevVed(sp, c, this.spatelSvaev));
        this.koer(liste, "spatel");
    };

    /* Spatlen bliver haengende over glasset eller over pulverglasset */
    P.spatelSvaev = function (sp, c) {
        var q = this.spatelOver(c);
        return { x: q.x, y: q.y - 6, v: q.v };
    };

    P.spatelVedPulver = function (sp, pulver) {
        var q = this.spatelVedGlas(pulver);
        return { x: q.x, y: q.y - 34, v: 0 };
    };

    P.fyldSpatel = function (stof) {
        var sp = this.g.spatel, pulver = this.g["pulver_" + stof];
        sp.svaev = null;
        this.koer(this.fyldListe(stof).concat(this.svaevVed(sp, pulver, this.spatelVedPulver, "fyld")), "spatel");
        this.besked("Der ligger " + STOF[stof].navn + " på spatlen. Træk den hen over et glas.");
    };

    P.toemSpatel = function (c) {
        var sp = this.g.spatel;
        if (!sp.last) {
            this.besked("Spatlen er tom. Tag fat i den, og før den ned i et pulverglas.");
            return false;
        }
        this.vaelg(c.navn);
        sp.svaev = null;
        this.koer(this.spatelHaeldListe(c).concat(this.svaevVed(sp, c, this.spatelSvaev)), "spatel");
        return true;
    };

    /* ----- Omroering ----------------------------------------------------- */
    P.roer = function (c) {
        var st = this.g.glasstav, mig = this;
        function pose(w) {
            var o = mig.aabning(c);
            if (c.erGlas) return { x: o.x + Math.sin(w) * 2.5, y: o.y - 30, v: Math.sin(w * 0.5) * 0.02 };
            return { x: o.x + Math.sin(w) * 15, y: o.y - 70, v: Math.sin(w) * 0.12 };
        }
        this.vaelg(c.navn);
        this.koer([
            { flyt: st, til: function () { return pose(0); }, tid: 0.7, loeft: 60 },
            { kald: function () { this.roerer = c; if (NK.Lyd) NK.Lyd.skvulp(0.5); } },
            { tid: 2.2, hver: function (t, sek) {
                var p = pose(sek * 11);
                st.p.x = p.x; st.p.y = p.y; st.p.v = p.v;
                if (Math.random() < 0.06 && NK.Lyd) NK.Lyd.skvulp(0.35);
            } },
            { kald: function () { this.roerer = null; this.aendret("roer"); } },
            hjemTil(st, 0.8, 60)
        ], "roer");
    };

    /* ----- Termometeret --------------------------------------------------- */
    P.termPose = function (c) {
        var o = this.aabning(c);
        return c.erGlas ? { x: o.x + 1.5, y: o.y - 8, v: 0 } : { x: o.x + 14, y: o.y - 60, v: 0.08 };
    };

    P.maal = function (c) {
        var tm = this.g.termometer, mig = this;
        this.vaelg(c.navn);
        this.koer([
            { flyt: tm, til: function () { return mig.termPose(c); }, tid: 0.8, loeft: 50 },
            { kald: function () { this.maaler = c; } },
            { tid: 2.4, hver: function () { var p = mig.termPose(c); tm.p.x = p.x; tm.p.y = p.y; tm.p.v = p.v; } },
            { kald: function () {
                var T = Math.round(tm.T * 2) / 2;
                if (c.erGlas) c.maaltT = T;
                this.besked(this.navn(c) + ": " + S.temperaturTekst(T) + ".", "god");
                if (NK.Lyd) NK.Lyd.klik();
                this.aendret("maalt");
            } },
            { tid: 1.2 },
            { kald: function () { this.maaler = null; } },
            hjemTil(tm, 0.8, 50)
        ], "maal");
    };

    /* ----- Badene ----------------------------------------------------------- */

    P.tilBad = function (gl, bad) {
        gl.sted = "flytter";
        this.vaelg(gl.navn);
        this.koer([
            { flyt: gl, til: S.BAD[bad].glas, tid: 1.0, loeft: 60 },
            { kald: function () {
                gl.sted = bad;
                gl.fraSted = bad;
                if (NK.Lyd) NK.Lyd.skvulp(0.4);
                this.aendret(bad);
            } }
        ], "bad");
    };

    P.tilStativ = function (gl) {
        gl.sted = "flytter";
        this.koer([
            { flyt: gl, til: gl.hjem, tid: 1.0, loeft: 60 },
            { kald: function () { gl.sted = "stativ"; gl.fraSted = "stativ"; this.aendret("stativ"); } }
        ], "stativ");
    };

    P.badHjem = function (navn) {
        var off = this.badOff[navn], fra = { x: off.x, y: off.y };
        this.koer([{ tid: 0.4, hver: function (t) {
            var e = NK.blod(t);
            off.x = fra.x * (1 - e);
            off.y = fra.y * (1 - e);
        } }], "hjem");
    };

    /* ----- Affald ----------------------------------------------------------- */
    P.toemListe = function (c) {
        var d = S.DUNK.aabning, mig = this;
        var liste = [];
        var startV = 0;
        if (c.erGlas) liste.push({ kald: function () { c.sted = "flytter"; } });
        liste.push({ flyt: c, til: c.erGlas ? { x: d.x - 4, y: d.y - 34, v: 2.3 } : { x: d.x + 34, y: d.y - 58, v: -1.6 }, tid: 0.9, loeft: 60 });
        liste.push({ kald: function () { startV = M.volumen(c.b); if (NK.Lyd) NK.Lyd.haeld(0.9); } });
        liste.push({ tid: 0.9, hver: function (t) {
            var o = M.samlet(c.b);
            var nu = M.volumen(c.b), maal = startV * (1 - t);
            if (nu > maal) M.udtag(c.b, nu - maal);
            var fra = c.erGlas ? { x: c.p.x, y: c.p.y } : NK.tilVerden(c.p, c.anker, 1, 3.5);
            this.straale = nu > 0.02 ? { fra: fra, til: { x: d.x - 2, y: d.y + 6 }, farve: (c.erGlas ? M.glasFarve(o) : M.baegerFarve(o)) || M.FARVE.vand, bredde: 2.5 } : null;
        } });
        liste.push({ kald: function () {
            this.straale = null;
            if (c.erGlas) {
                /* Resultatet til tegneserien skal overleve toemningen */
                var slut = c.slut;
                nulstilGlasData(c);
                c.slut = slut;
            } else {
                M.toem(c.b);
                c.mikro.toem();
            }
            mig.aendret("toemt");
        } });
        liste.push({ flyt: c, til: c.hjem, tid: 0.9, loeft: 60 });
        if (c.erGlas) liste.push({ kald: function () { c.sted = "stativ"; c.fraSted = "stativ"; } });
        return liste;
    };

    P.toemI = function (c) {
        this.vaelg(c.navn);
        if (c.erGlas) {
            /* Resultatet gemmes, som glasset saa ud, lige foer det blev toemt */
            c.slut = this.slutBillede(c);
            if (c.sted === "vandbad" || c.sted === "isbad") c.sted = "stativ";
        }
        this.koer(this.toemListe(c).concat([{ kald: function () {
            this.besked(this.navn(c) + " er tømt.");
        } }]), "toem");
    };

    /* Glasset, som tegneserien skal huske det */
    P.slutBillede = function (gl) {
        return {
            opl: M.samlet(gl.b), tegning: this.beholderTegning(gl), indgreb: this.indgrebTekst(gl), liste: this.indgrebListe(gl),
            vurdering: gl.vurdering, maaltT: gl.maaltT, afkoelet: gl.afkoelet, uroert: this.uroert(gl)
        };
    };

    /* Resterne er afleveret, naar glassene og baegerglasset er tomme.
       Trinnet afgoeres af bordets tilstand, ikke af et klik paa dunken. */
    P.tjekAffald = function () {
        if (this.station !== 1 || this.gjort.affald || !this.gjort.fordelt || this.optaget()) return;
        var mig = this;
        var tomt = this.glasListe().every(function (gl) { return M.volumen(gl.b) + M.fastIalt(gl.b) < 0.05; });
        if (!tomt || M.volumen(this.g.baegerA.b) > 0.05) return;
        this.glasListe().forEach(function (gl) { if (!gl.slut) gl.slut = mig.slutBillede(gl); });
        this.gjort.affald = true;
        this.valgt = null;
        this.valgtPr[1] = null;
        this.besked("Resterne er afleveret. Del 1 er slut.", "god");
        if (NK.Lyd) NK.Lyd.succes();
        this.aendret("affald");
    };

    /* Stamoploesningen haeldes i affaldet. Laereren henter mere. */
    P.kolbeIDunk = function (k) {
        var d = S.DUNK.aabning;
        this.koer([
            { flyt: k, til: { x: d.x + 6, y: d.y - 16, v: -1.95 }, tid: 0.7, loeft: 40 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(1.4); } },
            { tid: 1.4, hver: function () {
                this.straale = { fra: { x: k.p.x, y: k.p.y }, til: { x: d.x, y: d.y + 6 }, farve: M.baegerFarve(M.stamOpl(10)), bredde: 3 };
            } },
            { kald: function () {
                this.straale = null;
                k.tom = true;
                this.antalUheld++;
                this.haendt.kolbeDunk = true;
                this.besked("Stamopløsningen er hældt i affaldet.", "advarsel");
                if (this.laererKolbeDunk) this.laererKolbeDunk(k);
            } },
            hjemTil(k, 0.8, 40)
        ], "kolbeDunk");
    };

    /* ----- Visningerne: billedet i del 1 og glassene ovenfra i del 2 ------- */
    P.aabnVisning = function () {
        if (this.optaget() || this.holdt || this.rystKilde) return false;
        if (this.station === 1) {
            if (!this.glasListe().some(function (gl) { return gl.nr <= 7 && M.volumen(gl.b) > 0.3; })) {
                this.besked("Hæld stamopløsning i glassene først.");
                this.markér("baegerA");
                return false;
            }
            this.visning = "foto";
        } else {
            if (!this.baegerListe().some(function (c) { return M.volumen(c.b) > 0.3; })) {
                this.besked("Hæld noget i bægerglassene først.");
                this.markér("flaske_farve");
                return false;
            }
            this.visning = "ovenfra";
        }
        this.sidsteVisning = this.visning;
        this.visData = this.visningData();
        if (NK.Lyd) NK.Lyd.papir();
        this.aendret("visning");
        return true;
    };

    /* tjek: false, naar visningen lukkes uden at elevens noter skal vurderes */
    P.lukVisning = function (tjek) {
        if (!this.visning) return false;
        var v = this.visning;
        this.visning = null;
        if (tjek !== false) {
            if (v === "foto") this.tjekBillede();
            else this.tjekOvenfra();
        }
        this.aendret("visning");
        return true;
    };

    P.skiftVisning = function () {
        return this.visning ? this.lukVisning() : this.aabnVisning();
    };

    P.klikVisning = function (navn) {
        if (navn === "visLuk" || navn === "visUd") return this.lukVisning();
        if (/^vurder\d$/.test(navn)) return this.vurderFoto(Number(navn.slice(6)));
        if (/^ovenfra\d$/.test(navn)) return this.vurderOvenfra(Number(navn.slice(7)) - 1);
        return false;
    };

    P.visningData = function () {
        return this.sidsteVisning === "ovenfra" ? this.ovenfraData() : this.fotoData();
    };

    P.fotoData = function () {
        var mig = this, g7 = this.g.glas7;
        var ref = M.volumen(g7.b) >= 0.3;
        var tekst = !ref ? "Glas 7 er tomt, så der er ingen reference." :
            (this.uroert(g7) ? "Glas 7 står ved stuetemperatur og er referencen." : "Glas 7 skulle være urørt. Det er stadig referencen.");
        return {
            tekst: tekst,
            glas: this.glasListe().filter(function (gl) { return gl.nr <= 7; }).map(function (gl) {
                var V = M.volumen(gl.b);
                return {
                    nr: gl.nr, tegning: mig.beholderTegning(gl),
                    etiket: V < 0.3 ? "tomt" : (gl.nr === 7 && mig.uroert(gl) ? "stuetemperatur" : mig.indgrebTekst(gl)),
                    T: gl.maaltT, ref: gl.nr === 7 && ref,
                    kanVurderes: gl.nr < 7 && V >= 0.3 && ref,
                    svar: gl.vurdering ? gl.vurdering.svar : null
                };
            })
        };
    };

    /* Et klik paa knappen under et glas skifter mellem de tre svar */
    P.vurderFoto = function (nr) {
        var gl = this.g["glas" + nr], g7 = this.g.glas7;
        if (!gl || nr >= 7 || M.volumen(gl.b) < 0.3 || M.volumen(g7.b) < 0.3) return false;
        var nu = gl.vurdering ? SVAR_FOTO.indexOf(gl.vurdering.svar) : -1;
        var svar = SVAR_FOTO[(nu + 1) % SVAR_FOTO.length];
        var o = M.samlet(gl.b);
        var faktisk = M.sammenlign(o, M.samlet(g7.b));
        if (faktisk === "som referencen") faktisk = "som glas 7";
        gl.vurdering = {
            svar: svar, faktisk: faktisk, opl: o, tegning: this.beholderTegning(gl),
            indgreb: this.indgrebTekst(gl), liste: this.indgrebListe(gl), maaltT: gl.maaltT,
            ref: { opl: M.samlet(g7.b), tegning: this.beholderTegning(g7) }
        };
        if (NK.Lyd) NK.Lyd.klik();
        this.visData = this.visningData();
        this.aendret("vurder");
        return true;
    };

    P.tjekBillede = function () {
        if (this.gjort.billede) return;
        var mig = this;
        var glas = this.glasListe().filter(function (gl) { return gl.nr <= 6; });
        var vurderet = glas.filter(function (gl) { return !!gl.vurdering; });
        if (!vurderet.length) return;
        if (vurderet.length < 6 || M.volumen(this.g.glas7.b) < 0.3) {
            this.besked("Notér farveændringen for alle glas fra 1 til 6.");
            return;
        }
        if (!["g1", "g2", "g3", "g4", "g5", "g6"].every(function (id) { return mig.trinGjort(id); })) {
            this.besked("Gør indgrebene i glas 1 til 6 færdige, og tag billedet igen.");
            return;
        }
        var forkerte = glas.filter(function (gl) { return gl.vurdering.svar !== gl.vurdering.faktisk; });
        this.gjort.billede = true;
        this.resultat = { forkerte: forkerte.map(function (gl) { return gl.nr; }) };
        this.besked("Billedet er taget.", "god");
        if (NK.Lyd) NK.Lyd.succes();
        this.laererKo("laererRos", forkerte.length ? forkerte[0] : null);
        this.markér("dunk", 6);
        this.aendret("billede");
    };

    /* Del 2: de fire baegerglas ovenfra, to og to i par. Et par, hvor
       begge glas har den samme oploesning, kan sammenlignes, saa snart
       det ene glas er fortyndet. */
    var PAR_TITEL = { farve: "Frugtfarve", lv: "Ligevægtsblanding" };

    P.parData = function (par) {
        var type = this.parType(par, 10);
        var V = par.map(function (c) { return M.volumen(c.b); });
        var lo = Math.min(V[0], V[1]), hi = Math.max(V[0], V[1]);
        var fortyndet = type && lo >= 5 && hi / lo >= 1.3 ? (V[0] > V[1] ? 0 : 1) : -1;
        return { type: type, V: V, fortyndet: fortyndet };
    };

    P.ovenfraData = function () {
        var mig = this;
        var parListe = this.parListe();
        var par = [], glas = [], mangler = 0, klar = 0;
        parListe.forEach(function (p) {
            var d = mig.parData(p);
            var vurd = d.type ? mig.del2.vurdering[d.type] : null;
            var note;
            if (!d.type) { note = "Hæld den samme opløsning i begge glas."; mangler++; }
            else if (d.fortyndet < 0) { note = "Fordobl volumen i det ene glas med vand."; mangler++; }
            else { note = Math.round(Math.min(d.V[0], d.V[1])) + " mL og " + Math.round(Math.max(d.V[0], d.V[1])) + " mL"; klar++; }
            par.push({ titel: d.type ? PAR_TITEL[d.type] : mig.parOverskrift(p), note: note });
            p.forEach(function (c, i) {
                var o = M.samlet(c.b), bf = mig.bundfald(c), V = M.volumen(c.b);
                glas.push({
                    V: V, tom: V < 0.3,
                    maerke: V < 0.3 ? "" : (i === d.fortyndet ? "fortyndet" : mig.indholdTekst(c)),
                    farve: M.baegerOppefraFarve(o), bund: bf.bund, uklar: bf.uklar,
                    kanVurderes: i === d.fortyndet,
                    svar: vurd && vurd.idx === i ? vurd.svar : null
                });
            });
        });
        var noteret = this.del2.vurdering.farve && this.del2.vurdering.lv;
        return {
            tekst: "Begge par fik lige meget i de to glas. Kun det ene glas i hvert par er fortyndet.",
            hjaelp: mangler ? "Gør begge par færdige, og se igen." :
                (noteret ? "Luk visningen, når begge par er noteret." :
                 "Klik på knappen under det fortyndede glas i hvert par for at notere, hvad du ser."),
            par: par, glas: glas
        };
    };

    /* Overskriften over et par, der endnu ikke kan sammenlignes */
    P.parOverskrift = function (par) {
        var a = this.indholdTekst(par[0]), b = this.indholdTekst(par[1]);
        if (a === "tomt" && b === "tomt") return "Tomme glas";
        return a === b ? a.charAt(0).toUpperCase() + a.slice(1) : "Forskelligt indhold";
    };

    /* Et klik paa knappen under et glas skifter mellem de tre svar */
    P.vurderOvenfra = function (n) {
        var par = this.parListe()[n < 2 ? 0 : 1];
        var i = n % 2;
        var d = this.parData(par);
        if (!d.type || i !== d.fortyndet) return false;
        var gammel = this.del2.vurdering[d.type];
        var nu = gammel && gammel.idx === i ? SVAR_OVENFRA.indexOf(gammel.svar) : -1;
        var svar = SVAR_OVENFRA[(nu + 1) % SVAR_OVENFRA.length];
        var a = M.samlet(par[i].b), b = M.samlet(par[1 - i].b);
        this.del2.vurdering[d.type] = {
            idx: i, svar: svar, faktisk: M.sammenlignOvenfra(a, b),
            V: [a.V, b.V], farver: [M.baegerOppefraFarve(a), M.baegerOppefraFarve(b)]
        };
        if (NK.Lyd) NK.Lyd.klik();
        this.visData = this.visningData();
        this.aendret("vurder");
        return true;
    };

    P.tjekOvenfra = function () {
        var v = this.del2.vurdering;
        if (this.gjort.sml || (!v.farve && !v.lv)) return;
        if (!v.farve || !v.lv) {
            this.besked("Notér det fortyndede glas i begge par.");
            return;
        }
        this.gjort.sml = true;
        this.del2.resultat = {
            farve: { svar: v.farve.svar, faktisk: v.farve.faktisk, V: v.farve.V, farver: v.farve.farver },
            lv: { svar: v.lv.svar, faktisk: v.lv.faktisk, V: v.lv.V, farver: v.lv.farver }
        };
        this.besked("De fire glas er sammenlignet ovenfra.", "god");
        if (NK.Lyd) NK.Lyd.succes();
        this.aendret("ovenfra");
    };

    /* ----- Del 1 og del 2 --------------------------------------------------- */
    P.skiftStation = function (n) {
        if (n === this.station) return true;
        if (this.optaget() || this.holdt || this.rystKilde || this.baerer) {
            this.besked("Vent, til det, der er i gang, er færdigt.");
            return false;
        }
        this.lukVisning(false);
        this.station = n;
        this.valgt = this.valgtPr[n];
        this.mark = null;
        this.bobleAlfa = 0;
        this.pyt = null;
        this.aendret("station");
        return true;
    };

    /* ----- Rystning og baering ----------------------------------------------- */
    P.kanTageFat = function (gl) {
        return !!(gl && gl.erGlas && gl.sted !== "flytter" && !this.optaget() && !this.visning && !(this.laererOptaget && this.laererOptaget()));
    };

    P.kanRyste = function (gl) {
        return this.kanTageFat(gl) && M.volumen(gl.b) > 0.1;
    };

    P.kanRysteNu = function () {
        var v = this.valgtBeholder();
        return !!(v && v.erGlas && this.kanRyste(v));
    };

    P.proevRyst = function (gl) {
        return this.kanTageFat(gl);
    };

    P.startRyst = function (kilde, gl) {
        this.rystKilde = kilde;
        this.rystGlas = gl;
        this.spildTid = 0;
        this.vaelg(gl.navn);
        if (kilde === "mus") {
            gl.fraSted = gl.sted;
            gl.sted = "baaret";
        }
        this.aendret("ryst");
    };

    /* pt: hvor musen slap glasset */
    P.stopRyst = function (pt) {
        if (!this.rystKilde) return;
        var gl = this.rystGlas, kilde = this.rystKilde;
        this.rystKilde = null;
        this.rystGlas = null;
        this.musFart = 0;
        this.vold = 0;
        this.uro = 0;
        this.spildTid = 0;
        if (gl && !this.optaget()) {
            if (kilde === "mus") this.slipGlas(gl, pt);
            else this.koer([{ flyt: gl, til: this.hjemFor(gl), tid: 0.3, loeft: 0 }], "hjem");
        }
        this.aendret("ryst");
    };

    P.startBaer = function (gg) {
        this.baerer = gg;
        this.spildTid = 0;
        if (gg.svaev) gg.svaev = null;
        this.aendret("baer");
    };

    P.stopBaer = function (pt) {
        var gg = this.baerer;
        this.baerer = null;
        this.musFart = 0;
        this.vold = 0;
        this.uro = 0;
        this.spildTid = 0;
        if (gg) this.slip(gg, pt);
        this.aendret("baer");
    };

    /* Hvor et reagensglas slippes */
    P.stedVed = function (pt) {
        if (!pt) return null;
        var vb = S.BAD.vandbad, ib = S.BAD.isbad;
        if (pt.x > vb.x - 8 && pt.x < vb.x + vb.b + 8 && pt.y > vb.y - 90 && pt.y < S.BORD) return "vandbad";
        if (pt.x > ib.x - 8 && pt.x < ib.x + ib.b + 8 && pt.y > ib.y - 90 && pt.y < S.BORD) return "isbad";
        if (pt.x > S.DUNK.x && pt.x < S.DUNK.x + 90 && pt.y > S.DUNK.y - 60 && pt.y < S.BORD) return "dunk";
        if (pt.x > S.STATIV.x && pt.x < S.STATIV.x + S.STATIV.b && pt.y > 280 && pt.y < S.BORD) return "stativ";
        return null;
    };

    P.slipGlas = function (gl, pt) {
        var over = this.stedVed(pt);
        var fra = gl.fraSted;
        gl.sted = fra;
        if (over === "vandbad" || over === "isbad") {
            var i = this.glasI(over);
            if (!i || i === gl) { this.tilBad(gl, over); return; }
            this.besked("Der er allerede et glas i " + (over === "vandbad" ? "vandbadet" : "isbadet") + ".");
        } else if (over === "stativ" && fra !== "stativ") {
            this.tilStativ(gl);
            return;
        } else if (over === "dunk" && M.volumen(gl.b) + M.fastIalt(gl.b) > 0.05) {
            this.toemI(gl);
            return;
        }
        if ((fra === "vandbad" || fra === "isbad") && this.glasI(fra) && this.glasI(fra) !== gl) gl.sted = "stativ";
        this.koer([{ flyt: gl, til: this.hjemFor(gl), tid: 0.35, loeft: 0 }], "hjem");
    };

    /* Hvad ligger under musen, naar udstyret gg baeres? */
    P.maalVed = function (gg, pt) {
        if (!pt || !gg) return null;
        var i, g = this.g;
        if (gg.erGlas) return this.stedVed(pt);
        if (gg.greb === "bad") return null;
        if (gg.greb === "spatel") {
            var krukker = ["pulver_fe", "pulver_vitc", "pulver_scn"];
            for (i = 0; i < krukker.length; i++) {
                var j = g[krukker[i]];
                if (S.iRekt(S.rekt(j.sprite, j.p, j.anker, 8), pt)) return j.navn;
            }
        }
        var liste = this.beholderListe();
        for (i = liste.length - 1; i >= 0; i--) {
            var c = liste[i];
            if (c === gg) continue;
            var rekt = c.erGlas ? S.rekt("reagensglas", c.p, c.anker, 6) : S.rekt("baeger", c.p, c.anker, 10);
            if (S.iRekt(rekt, pt)) return c.navn;
        }
        if ((gg.greb === "baeger" || gg.greb === "kolbe") && pt.x > S.DUNK.x - 10 && pt.x < S.DUNK.x + 100 && pt.y > S.DUNK.y - 70 && pt.y < S.BORD) return "dunk";
        return null;
    };

    /* Udstyret gg slippes med musen i pt */
    P.slip = function (gg, pt) {
        var maal = this.maalVed(gg, pt);
        this.slipMaal = null;
        if (gg.greb === "bad") { this.badHjem(gg.navn); return; }
        var c = maal ? this.g[maal] : null;
        if (maal === "dunk") {
            if (gg.greb === "baeger" && M.volumen(gg.b) > 0.05) { this.toemI(gg); return; }
            if (gg.greb === "kolbe" && !gg.tom) { this.kolbeIDunk(gg); return; }
        }
        if (gg.greb === "spatel" && c && c.greb === "pulver") { this.fyldSpatel(c.stof); return; }
        if (c && c.erBeholder && this.brug(gg, c)) return;
        this.koer([hjemTil(gg, 0.5, 20)], "hjem");
    };

    /* Knappen Ryst glasset (og tasten R): til = trykket ned */
    P.rystKnap = function (til) {
        if (til) {
            if (this.rystKilde || this.optaget() || this.holdt) return false;
            var v = this.valgtBeholder();
            if (!v || !v.erGlas) {
                if (this.station === 1) {
                    this.besked("Klik på et glas for at vælge det.");
                    this.markérGlas();
                }
                return false;
            }
            if (!this.kanRyste(v)) return false;
            this.startRyst("knap", v);
            return true;
        }
        if (this.rystKilde === "knap") this.stopRyst();
        return false;
    };

    P.opdaterRyst = function (dt) {
        var gl = this.rystGlas;
        var maal = 0;
        this.uro = 0;
        if (gl && this.rystKilde === "knap") {
            var hj = this.hjemFor(gl);
            var w = this.tid * 17;
            gl.p.x = hj.x + Math.sin(w) * 10;
            gl.p.y = hj.y - 18 + Math.abs(Math.cos(w)) * 4;
            gl.p.v = Math.cos(w) * 0.16;
            maal = 1;
        } else if (gl || this.baerer) {
            var bb = gl || this.baerer;
            this.musFart *= Math.exp(-4 * dt);
            this.musVx *= Math.exp(-5 * dt);
            this.vold = NK.mod(this.vold, this.musFart, 4, dt);
            maal = NK.klamp(this.musFart / M.RYST.FULD, 0, 1);
            var harVaeske = bb.greb === "kolbe" ? !bb.tom : (bb.greb === "bad" || (bb.erBeholder && M.volumen(bb.b) > 0.1));
            if (harVaeske) {
                if (this.vold > M.RYST.SPILD_FART) this.spildTid += dt;
                else this.spildTid = Math.max(0, this.spildTid - dt);
                this.uro = NK.klamp(this.spildTid / M.RYST.SPILD_TID, 0, 1);
            }
            if (bb.greb !== "bad") {
                bb.p.v = NK.mod(bb.p.v, (bb.hjem ? bb.hjem.v : 0) + NK.klamp(-this.musVx * 0.0004, -0.4, 0.4), 12, dt) + (Math.random() - 0.5) * 0.14 * this.uro;
            }
            if (harVaeske && this.spildTid > 0.08 && Math.random() < dt * 14 && bb.greb !== "bad") {
                var o = bb.erBeholder ? M.samlet(bb.b) : M.stamOpl(10);
                var fo = (bb.erGlas ? M.glasFarve(o) : M.baegerFarve(o)) || M.FARVE.vand;
                var a = this.aabning(bb);
                this.draaber.push({ x: a.x + r(-3, 3), y: a.y, vx: r(-90, 90), vy: -r(60, 160), r: r(1.4, 2.4), liv: 1, farve: { r: fo.r, g: fo.g, b: fo.b, a: 0.8 }, fysik: true });
            }
            if (harVaeske && this.spildTid >= M.RYST.SPILD_TID) {
                if (gl) this.spild(gl);
                else this.spildBaeret(bb);
                return;
            }
        }
        this.ryst = NK.mod(this.ryst, maal, maal > this.ryst ? 6 : 3, dt);
        this.skvulpUr -= dt;
        if (this.ryst > 0.35 && this.skvulpUr <= 0 && NK.Lyd) {
            NK.Lyd.skvulp(this.ryst);
            this.skvulpUr = 0.24 - 0.1 * this.ryst;
        }
    };

    function nulstilRyst(f) {
        f.rystKilde = null;
        f.rystGlas = null;
        f.baerer = null;
        f.holdt = null;
        f.slipMaal = null;
        f.spildTid = 0;
        f.uro = 0;
        f.ryst = 0;
        f.musFart = 0;
        f.vold = 0;
    }

    function sproejt(f, x, y, farve, n) {
        for (var i = 0; i < n; i++) {
            f.draaber.push({ x: x + r(-4, 4), y: y, vx: r(-240, 240), vy: -r(120, 360), r: r(1.6, 3), liv: 1, farve: farve, fysik: true });
        }
    }

    /* Et reagensglas blev rystet saa voldsomt, at indholdet sproejtede ud */
    P.spild = function (gl) {
        nulstilRyst(this);
        this.antalUheld++;
        this.rystUheld++;
        var fo = M.glasFarve(M.samlet(gl.b)) || M.FARVE.vand;
        var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.85 };
        sproejt(this, gl.p.x, gl.p.y, farve, 26);
        this.pyt = { x: NK.klamp(gl.p.x, 140, 980), rx: 8, rxMaal: 56, farve: farve, vaad: 1 };
        this.haendt["spild_" + gl.navn] = true;
        nulstilGlasData(gl);
        gl.sted = "stativ";
        gl.fraSted = "stativ";
        this.ryk = 5;
        if (NK.Lyd) NK.Lyd.plask();
        this.besked("Glasset blev rystet for voldsomt. Indholdet er tabt.", "advarsel");
        this.koer([{ flyt: gl, til: gl.hjem, tid: 0.6, loeft: 20 }], "hjem");
        if (this.laererSpild) this.laererSpild(gl, "rystet");
        this.aendret("uheld");
    };

    /* Et baegerglas, kolben eller et bad blev rystet, mens det blev baaret */
    P.spildBaeret = function (bb) {
        nulstilRyst(this);
        this.antalUheld++;
        this.rystUheld++;
        var fo, pos;
        if (bb.greb === "kolbe") {
            fo = M.baegerFarve(M.stamOpl(10));
            pos = { x: bb.p.x, y: bb.p.y };
        } else if (bb.greb === "bad") {
            fo = { r: 190, g: 215, b: 235, a: 0.6 };
            var B = S.BAD[bb.navn], off = this.badOff[bb.navn];
            pos = { x: B.cx + off.x, y: B.y + off.y };
        } else {
            fo = M.baegerFarve(M.samlet(bb.b)) || M.FARVE.vand;
            pos = this.aabning(bb);
            M.toem(bb.b);
            bb.mikro.toem();
        }
        var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.85 };
        sproejt(this, pos.x, pos.y, farve, 30);
        this.pyt = { x: NK.klamp(pos.x, 140, 980), rx: 8, rxMaal: 66, farve: farve, vaad: 1 };
        this.haendt["spild_" + bb.navn] = true;
        this.ryk = 5;
        if (NK.Lyd) NK.Lyd.plask();
        this.besked(bb.greb === "bad" ? "Vandet skvulpede ud af badet." : "Det skvulpede ud. Indholdet er tabt.", "advarsel");
        if (bb.greb === "bad") this.badHjem(bb.navn);
        else this.koer([hjemTil(bb, 0.6, 20)], "hjem");
        if (this.laererSpild) this.laererSpild(bb, bb.greb === "kolbe" ? "kolbe" : (bb.greb === "bad" ? "bad" : "rystet"));
        this.aendret("uheld");
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdaterGlas = function (gl) {
        if (!gl.fyldt || M.volumen(gl.b) < 0.1) return;
        var T = gl.b.sol.T, foer;
        if (T > gl.indgreb.maksT) {
            foer = this.indgrebListe(gl);
            gl.indgreb.maksT = T;
            if (T >= M.TEMP.varm && foer.indexOf("varme") < 0) this.efterIndgreb(gl, "varme", foer);
        }
        if (T < gl.indgreb.minT) {
            foer = this.indgrebListe(gl);
            gl.indgreb.minT = T;
            if (T <= M.TEMP.kold && foer.indexOf("kulde") < 0) this.efterIndgreb(gl, "kulde", foer);
        }
        if (gl.indgreb.maksT >= M.TEMP.varm && gl.sted !== "vandbad" && T < 30 && !gl.afkoelet) {
            gl.afkoelet = true;
            this.haendt["afkoelet" + gl.nr] = true;
        }
    };

    P.opdater = function (dt) {
        var mig = this, g = this.g;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        this.urMinutter += dt * 0.5;

        this.opdaterHandling(dt);
        this.opdaterRyst(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);

        if (this.mark) { this.mark.ur -= dt; if (this.mark.ur <= 0) this.mark = null; }
        this.ryk = this.ryk > 0.2 ? this.ryk * (1 - dt * 7) : 0;

        this.alleBeholdere().forEach(function (c) {
            var ryst = mig.rystGlas === c || mig.baerer === c ? mig.ryst : 0;
            var roerer = mig.roerer === c;
            var s = {
                T: M.TEMP.stue, tau: M.TEMP.tauLuft,
                bland: M.BLAND.diffusion + ryst * M.BLAND.ryst + (roerer ? M.BLAND.roer : 0),
                roer: roerer || ryst > 0.2,
                ryst: Math.max(ryst, roerer ? 0.6 : 0)
            };
            if (c.sted === "vandbad") { s.T = M.TEMP.vandbad; s.tau = M.TEMP.tauBad; }
            else if (c.sted === "isbad") { s.T = M.TEMP.isbad; s.tau = M.TEMP.tauIs; }
            M.skridt(c.b, dt, s);
            if (c.erGlas) mig.opdaterGlas(c);
            c.mikro.opdater(dt, M.mikroMaal(c.b), { ryst: s.ryst, farve: (c.erGlas ? M.glasFarve : M.baegerFarve)(M.samlet(c.b)) });
        });

        var tm = g.termometer;
        if (this.maaler && M.volumen(this.maaler.b) > 0.1) tm.T = NK.mod(tm.T, this.maaler.b.sol.T, 1.6, dt);
        else tm.T = NK.mod(tm.T, M.TEMP.stue, 0.25, dt);

        /* Det, der svaever over et glas, bliver haengende, til glasset
           flyttes, eller til det selv traekkes vaek */
        var sv = this.svaevende();
        if (sv && !this.handling) {
            var sc = sv.svaev.c;
            var vaek = !this.synlig(sc) || this.baerer === sv ||
                (sc.erGlas && ((this.holdt && this.holdt.navn === sc.navn) || this.rystGlas === sc || sc.sted === "flytter"));
            if (vaek) this.svaevHjem(sv);
        }

        this.tjekAffald();

        /* Zoomboblen viser det valgte: en beholder eller en flaske */
        var v = this.bobleMaal();
        var hn = this.handling ? this.handling.navn : "";
        var vis = !!v && (M.volumen(v.b) > 0.05 || v.mikro.partikler.length > 0 || !!v.mikro.fast) && hn !== "affald" && hn !== "toem";
        if (vis) this.bobleBeholder = v;
        if (v && v.erFlaske) v.mikro.opdater(dt, M.mikroMaal(v.b), { ryst: 0, farve: M.baegerFarve(M.samlet(v.b)) });
        this.bobleAlfa = NK.mod(this.bobleAlfa, vis ? 1 : 0, 5, dt);

        this.haandAlfa = NK.mod(this.haandAlfa, this.rystKilde || (this.holdt && this.g[this.holdt.navn].erGlas) ? 1 : 0, 10, dt);
        this.visAlfa = NK.mod(this.visAlfa, this.visning ? 1 : 0, 9, dt);
        if (this.visning) this.visData = this.visningData();

        this.opdaterEffekter(dt);

        var t = this.aktueltTrin();
        var id = this.station + (t ? t.id : "slut");
        if (id !== this.sidsteTrin) { this.sidsteTrin = id; this.trinStart = this.tid; }
    };

    P.opdaterEffekter = function (dt) {
        var i;
        for (i = this.draaber.length - 1; i >= 0; i--) {
            var dr = this.draaber[i];
            dr.vy += 900 * dt;
            dr.y += dr.vy * dt;
            dr.x += (dr.vx || 0) * dt;
            if (dr.fysik) {
                if (dr.y > S.BORD - 1) this.draaber.splice(i, 1);
                continue;
            }
            var c = dr.c;
            var flade = c.niveau !== null && c.niveau !== undefined ? c.niveau :
                (c.erGlas ? NK.tilVerden(c.p, c.anker, 15, 150).y : NK.tilVerden(c.p, c.anker, 36, 102).y);
            if (dr.y >= flade) {
                this.draaber.splice(i, 1);
                this.draabeLander(dr);
            }
        }

        if (this.pyt) this.pyt.rx = NK.mod(this.pyt.rx, this.pyt.rxMaal, 3, dt);

        /* Damp fra vandbadet */
        var B = S.BAD.vandbad;
        this.dampUr -= dt;
        if (this.dampUr <= 0) {
            this.dampUr = 0.22;
            this.dampe.push({ x: B.cx + r(-32, 32), y: B.niveau - 2, vx: r(-6, 6), vy: r(-20, -10), r: r(5, 9), liv: 0.9 });
            if (this.dampe.length > 50) this.dampe.shift();
        }
        for (i = this.dampe.length - 1; i >= 0; i--) {
            var p = this.dampe[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += dt * 8;
            p.liv -= dt * 0.35;
            if (p.liv <= 0) this.dampe.splice(i, 1);
        }
    };
}());
