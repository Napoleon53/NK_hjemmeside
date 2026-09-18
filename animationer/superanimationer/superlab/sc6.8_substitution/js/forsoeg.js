/* =====================================================================
   forsoeg.js - selve forsoeget: tilstand, trin og handlinger

   To reagensglas i et stativ. Eleven vaelger et glas ved at klikke paa
   det (det valgte har gult nummer), og flaskerne, propperne, lampen,
   folien, pH-papiret og draabeflasken virker paa det valgte glas. Kan
   det valgte glas ikke bruges, men det andet kan, bruges det andet, og
   det bliver valgt.

   Trinene (TRIN) er de ni ting, eleven skal naa. Et trin er gjort, naar
   tilstanden siger det, ikke naar en knap er trykket. Genstandene
   flyttes af smaa koreografier (koer): en liste af trin, der enten
   flytter en genstand, venter og goer noget undervejs, eller kalder en
   funktion. Mens en koreografi koerer, reagerer scenen ikke paa klik.

   Rystning: eleven tager fat i et glas og bevaeger musen, eller holder
   knappen Ryst glasset nede. Rystningen (0-1) flytter Br2 op i hexanen.

   Paaskeaeg: rystes der meget voldsomt med musen, springer proppen af,
   og indholdet sprøjter ud (graenserne staar i M.RYST). Laereren kommer
   og toerrer op (laerer.js). Glasset skal fyldes igen.

   Forkerte handlinger afvises ikke, men giver et uheld, som laereren
   rydder op efter:
     rystes et glas uden prop, sproejter indholdet ud (spild)
     er brom fremme uden udsugning, kommer dampene ud i lokalet, og
     laereren taender udsugningen (opdater)

   Tegningen og musen staar i bord.js, laereren i laerer.js.
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
        { id: "brom", tekst: "Hæld bromvand i begge glas", mark: "bromflaske",
          hint: "Klik på den brune flaske. Udsugningen skal køre, før den åbnes. Klik på et glas for at vælge det." },
        { id: "hexan", tekst: "Hæld hexan i begge glas", mark: "hexan",
          hint: "Klik på flasken med hexan. Hexan lægger sig oven på bromvandet." },
        { id: "ryst", tekst: "Sæt prop i, og ryst begge glas", mark: "prop1",
          hint: "Klik på en prop. Tag så fat i glasset, og ryst det, eller hold knappen Ryst glasset nede. Følg med i farven." },
        { id: "lys", tekst: "Stil det ene glas under lampen", mark: "lampe",
          hint: "Klik på lampen. Glasset skal have prop i og være rystet." },
        { id: "moerke", tekst: "Pak det andet glas ind i alufolie", mark: "folie",
          hint: "Klik på rullen med alufolie. Glasset i folien er kontrolforsøget." },
        { id: "reageret", tekst: "Vent, til farven i lyset er væk", mark: "lampe",
          hint: "Lampen skal være tændt. Følg med i luppen, mens uret går." },
        { id: "ph", tekst: "Test vandfasen i begge glas med pH-papir", mark: "phpapir",
          hint: "Klik på æsken med pH-papir. Strimlen dyppes i vandfasen, og folien tages af, når glasset i mørke testes." },
        { id: "agno3", tekst: "Dryp AgNO₃ i begge glas", mark: "agno3",
          hint: "Klik på dråbeflasken tre gange for hvert glas. Hold øje med vandfasen." },
        { id: "affald", tekst: "Hæld resterne i affaldsdunken", mark: "dunk",
          hint: "Klik på den brune dunk til højre. Bromhexan er halogenholdigt organisk affald." }
    ];
    NK.TRIN = TRIN;

    var IAGTTAGELSER = {
        brom:        { tekst: "Bromvandet er orange.", farve: M.FARVE.bromvand },
        hexan:       { tekst: "Hexan er farveløst og lægger sig oven på vandet.", farve: null },
        fordelt:     { tekst: "Efter rystning er hexanlaget orange, og vandlaget er farveløst.", farve: M.FARVE.bromHexan },
        lys_start:   { tekst: "I lyset bliver den orange farve svagere.", farve: { r: 240, g: 170, b: 110, a: 1 } },
        lys_faerdig: { tekst: "Glas {n} i lyset er blevet farveløst.", farve: null },
        rum:         { tekst: "I stativet blegner farven langsomt i lyset fra lokalet.", farve: { r: 240, g: 170, b: 110, a: 1 } },
        moerke:      { tekst: "Glas {n} i mørke er stadig orange.", farve: M.FARVE.bromHexan },
        ph_sur:      { tekst: "Glas {n}: pH-papiret bliver rødt. Vandfasen er sur.", farve: null },
        ph_svag:     { tekst: "Glas {n}: pH-papiret bliver orange. Vandfasen er svagt sur.", farve: null },
        ph_neutral:  { tekst: "Glas {n}: pH-papiret er gult. Vandfasen er næsten neutral.", farve: null },
        draabe:      { tekst: "Dråberne af AgNO₃(aq) er farveløse, selv om flasken er brun.", farve: null },
        ag_bundfald: { tekst: "Glas {n}: der dannes et lysegult bundfald i vandfasen med AgNO₃.", farve: M.FARVE.bundfald },
        ag_intet:    { tekst: "Glas {n}: ingen forandring med AgNO₃.", farve: null },
        uheld:       { tekst: "Proppen sprang af glas {n}, og indholdet er tabt.", farve: M.FARVE.bromvand },
        spildt:      { tekst: "Glas {n} blev rystet uden prop, og indholdet er tabt.", farve: M.FARVE.bromvand },
        udsugning:   { tekst: "Bromvandet var åbent uden udsugning, og dampene kom ud i lokalet.", farve: M.FARVE.bromvand },
        affald:      { tekst: "Resterne er afleveret som halogenholdigt organisk affald.", farve: null }
    };
    NK.IAGTTAGELSER = IAGTTAGELSER;

    NK.Forsoeg = function (canvas) {
        this.canvas = canvas;
        this.laerred = canvas ? new NK.Laerred(canvas) : null;
        this.tid = 0;
        this.antalUheld = 0;
        this.koppenVaek = false;
        this.vedAendring = null;
        this.vedBesked = null;
        this.vedIagttagelse = null;
        if (this.laererStart) this.laererStart();
        this.nulstil();
        if (canvas && this.bindMus) this.bindMus();
    };

    var P = NK.Forsoeg.prototype;

    function genstand(navn, sprite, hjem) {
        return { navn: navn, sprite: sprite, anker: A[sprite], hjem: hjem, p: kopi(hjem) };
    }

    function nytGlas(navn, nr) {
        var gl = genstand(navn, "reagensglas", S.HJEM[navn]);
        gl.nr = nr;
        gl.brom = false;
        gl.hexan = false;
        gl.brHex = 0;
        gl.brVand = 0;
        gl.reageret = 0;
        gl.alken = false;
        gl.addition = 0;
        gl.slutFarve = null;
        gl.slutFarveVaerdi = null;
        gl.erRystet = false;
        gl.prop = null;
        gl.sted = "stativ";
        gl.folie = false;
        gl.folieVis = 0;
        gl.ph = null;
        gl.phFarve = null;
        gl.agDraaber = 0;
        gl.agTest = false;
        gl.agNoteret = false;
        gl.agTestTid = 0;
        gl.visBund = 0;
        gl.uklar = 0;
        gl.vandAreal = 0;
        gl.hexAreal = 0;
        gl.lysTid = 0;
        gl.moerkeTid = 0;
        gl.strimmel = null;
        gl.papir = null;
        gl.niveau = null;
        gl.niveauTop = null;
        gl.mikro = new NK.Mikro(navn);
        return gl;
    }

    /* ----- Nulstilling ------------------------------------------------ */
    P.nulstil = function () {
        this.udsugning = false;
        this.vinge = 0;
        this.vingeFart = 0;
        this.luft = 0;
        this.gjort = {};
        this.iagttaget = {};
        this.trinStart = this.tid;
        this.sidsteTrin = "";
        this.urMinutter = M.UR.start;

        var g = this.g = {
            bromflaske: genstand("bromflaske", "bromflaske", S.HJEM.bromflaske),
            hexan:      genstand("hexan", "hexan", S.HJEM.hexan),
            hexen:      genstand("hexen", "hexen", S.HJEM.hexen),
            agno3:      genstand("agno3", "agno3", S.HJEM.agno3),
            phpapir:    genstand("phpapir", "phpapir", S.HJEM.phpapir),
            folie:      genstand("folie", "folie", S.HJEM.folie),
            glas1:      nytGlas("glas1", 1),
            glas2:      nytGlas("glas2", 2),
            prop1:      genstand("prop1", "prop", S.HJEM.prop1),
            prop2:      genstand("prop2", "prop", S.HJEM.prop2),
            kaffekop:   genstand("kaffekop", "kaffekop", S.HJEM.kaffekop)
        };
        g.prop1.iGlas = null;
        g.prop2.iGlas = null;
        g.kaffekop.skjult = this.koppenVaek;
        g.agno3.svaev = null;

        this.valgt = "glas1";
        this.lampeTaendt = false;
        this.lampeVis = 0;
        this.laagT = 0;
        this.hexLaagT = 0;
        this.hexenLaagT = 0;

        this.handling = null;
        this.holdt = null;
        this.hover = null;
        this.rystKilde = null;
        this.rystGlas = null;
        this.ryst = 0;
        this.farligTid = 0;
        this.vold = 0;
        this.uro = 0;
        this.musVx = 0;
        this.musFart = 0;
        this.skvulpUr = 0;
        this.haandAlfa = 0;
        this.mark = null;
        this.ryk = 0;

        this.straale = null;
        this.draaber = [];
        this.dampe = [];
        this.dampUr = 0;
        this.flyvende = [];
        this.strimler = [];
        this.pyt = null;
        this.spildTid = 0;
        this.udenUdsugning = 0;
        this.taage = 0;
        this.andreUheld = 0;

        this.bobleAlfa = 0;
        this.bobleGlas = null;
        this.stor = null;
        this.storAlfa = 0;
        this.tidFart = 1;
        this.tidFartUr = 0;
        this.lampeTomUr = 0;
        this.lampeSlukTid = 0;
        this.kontrolFoer = false;
        if (this.laererNyt) this.laererNyt();
        if (NK.Lyd) NK.Lyd.udsugning(false);
        this.aendret("nulstil");
    };

    /* ----- Glassene ----------------------------------------------------- */
    P.valgtGlas = function () {
        return this.g[this.valgt];
    };

    P.andetGlas = function (gl) {
        return gl === this.g.glas1 ? this.g.glas2 : this.g.glas1;
    };

    P.vaelg = function (navn) {
        if (this.valgt === navn) return;
        this.valgt = navn;
        this.aendret("valg");
    };

    /* Det valgte glas, hvis det opfylder kravet, ellers det andet. */
    P.maalGlas = function (krav) {
        var v = this.valgtGlas();
        if (krav(v)) return v;
        var a = this.andetGlas(v);
        if (krav(a)) { this.vaelg(a.navn); return a; }
        return null;
    };

    P.glasVed = function (sted) {
        if (this.g.glas1.sted === sted) return this.g.glas1;
        if (this.g.glas2.sted === sted) return this.g.glas2;
        return null;
    };

    P.hjemFor = function (gl) {
        return gl.sted === "lampe" ? S.UNDER_LAMPE : gl.hjem;
    };

    /* Er Br2 rystet op i hexanen? Bliver staaende, ogsaa naar Br2 senere
       er brugt op i lyset. */
    P.rystet = function (gl) {
        return !!(gl.brom && gl.hexan && (gl.erRystet || M.fordelt(gl) >= M.FORDELING.faerdig));
    };

    P.lysStyrke = function (gl) {
        if (gl.sted === "lampe") return this.lampeTaendt ? M.LYS.lampe : 0;
        if (gl.folie) return M.LYS.folie;
        return M.LYS.rum;
    };

    P.propIGlas = function (gl) {
        var i = NK.tilVerden(gl.p, gl.anker, 15, 20);
        return { x: i.x, y: i.y, v: gl.p.v };
    };

    /* ----- Til panelet ------------------------------------------------ */
    P.trinGjort = function (id) {
        var gj = this.gjort, g1 = this.g.glas1, g2 = this.g.glas2;
        switch (id) {
            case "brom": return !!gj.affald || (g1.brom && g2.brom);
            case "hexan": return !!gj.affald || (g1.hexan && g2.hexan);
            case "ryst": return !!gj.affald || (this.rystet(g1) && this.rystet(g2));
            case "ph": return g1.ph !== null && g2.ph !== null;
            case "agno3": return g1.agTest && g2.agTest;
            default: return !!gj[id];
        }
    };

    P.aktueltTrin = function () {
        for (var i = 0; i < TRIN.length; i++) if (!this.trinGjort(TRIN[i].id)) return TRIN[i];
        return null;
    };

    /* Et saerlig godt forsoeg: ingen uheld af nogen slags, kontrolglasset
       pakket ind i tide, og lampen hoejst slukket kort undervejs. */
    P.flotUdfoert = function () {
        return this.antalUheld === 0 && this.andreUheld === 0 && this.kontrolFoer && this.lampeSlukTid < M.FLOT.slukTid;
    };

    P.testsFaerdige = function () {
        return this.trinGjort("ph") && this.trinGjort("agno3");
    };

    P.travl = function () {
        return !!(this.handling || this.holdt || this.rystKilde || (this.laererOptaget && this.laererOptaget()));
    };

    /* Hint til det aktuelle trin. Genstanden, det handler om, faar en
       pulserende ramme i fem sekunder. */
    P.hint = function () {
        var t = this.aktueltTrin();
        if (!t) return null;
        var mark = t.mark;
        var v = this.valgtGlas();
        if (t.id === "brom" && !this.udsugning) mark = "kontakt";
        if (t.id === "ryst") {
            var gl = this.rystet(v) ? this.andetGlas(v) : v;
            if (gl.prop) mark = gl.navn;
            else mark = this.g.prop1.iGlas ? "prop2" : "prop1";
        }
        if ((t.id === "lys" || t.id === "moerke") && !v.prop && !this.andetGlas(v).prop) mark = "prop1";
        if (t.id === "reageret" && !this.lampeTaendt) mark = "lampe";
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

    P.iagttag = function (noegle, glas, farve) {
        var id = noegle + (glas ? glas.nr : "");
        if (this.iagttaget[id]) return;
        this.iagttaget[id] = true;
        var i = IAGTTAGELSER[noegle];
        var tekst = i.tekst.replace("{n}", glas ? glas.nr : "");
        if (this.vedIagttagelse) this.vedIagttagelse({ noegle: noegle, tekst: tekst, farve: farve === undefined ? i.farve : farve, glas: glas ? glas.nr : 0 });
    };

    /* ----- Koreografier ------------------------------------------------ */
    P.koer = function (liste, navn) {
        this.handling = { liste: liste, i: 0, t: 0, navn: navn || "" };
        this.aendret("handling");
    };

    /* Som koer, men venter paa en igangvaerende koreografi. */
    P.koerEfter = function (liste, navn) {
        if (this.handling) this.handling.liste = this.handling.liste.concat(liste);
        else this.koer(liste, navn);
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
        if (navn === "kontakt") return this.skiftUdsugning();
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (this.handling || this.holdt || this.rystKilde) return false;
        switch (navn) {
            case "kaffekop": return this.klikKop ? this.klikKop() : false;
            case "glas1": case "glas2":
                if (this.g[navn].folie) return this.klik("glasfolie");
                this.vaelg(navn);
                this.besked("Glas " + this.g[navn].nr + " er valgt.");
                return true;
            case "bromflaske": return this.proevBrom();
            case "hexan": return this.proevHexan();
            case "hexen": return this.proevHexen();
            case "prop1": case "prop2": return this.proevProp(navn);
            case "lampe": case "holder": return this.proevLampe();
            case "lampekontakt": return this.skiftLampe();
            case "ur": return this.skiftTid();
            case "boble": return this.skiftStor();
            case "glasfolie":
                this.besked(this.gjort.reageret ? "Glasset er pakket ind. Klik på pH-papiret eller AgNO₃, så tages folien af." : "Glasset er pakket ind. Vent, til farven i lyset er væk.");
                if (this.gjort.reageret) this.markér(this.andetGlas(this.valgtGlas()).ph === null && this.valgtGlas().ph === null ? "phpapir" : "agno3", 4);
                return false;
            case "folie": return this.proevFolie();
            case "phpapir": return this.proevPH();
            case "agno3": return this.proevAgNO3();
            case "dunk": return this.proevAffald();
            case "stativ": return this.proevStativ();
        }
        return false;
    };

    /* Udsugningen kan slukkes naar som helst. Er der brom fremme uden
       udsugning, kommer dampene ud i lokalet, og laereren kommer og
       taender den (se opdater og laerer.js). */
    P.skiftUdsugning = function () {
        this.udsugning = !this.udsugning;
        if (NK.Lyd) { NK.Lyd.klik(); NK.Lyd.udsugning(this.udsugning); }
        this.aendret("udsugning");
        return true;
    };

    P.bromFremme = function () {
        if (this.laagT > 0.01) return true;
        if (this.pyt && this.pyt.brom && this.pyt.vaad > 0.05) return true;
        var g = this.g;
        return [g.glas1, g.glas2].some(function (gl) { return gl.brom && !gl.prop && M.br2Tilbage(gl) > 0.05; });
    };

    P.proevBrom = function () {
        var g = this.maalGlas(function (gl) { return !gl.brom && !gl.prop && gl.sted === "stativ" && !gl.folie; });
        if (!g) {
            var v = this.valgtGlas();
            if (v.brom && this.andetGlas(v).brom) this.besked("Der er bromvand i begge glas.");
            else if (v.prop) { this.besked("Tag proppen af først.", "advarsel"); this.markér(v.prop.navn); }
            else this.besked("Glasset skal stå i stativet.");
            return false;
        }
        this.haeldBrom(g);
        return true;
    };

    P.proevHexan = function () {
        var g = this.maalGlas(function (gl) { return gl.brom && !gl.hexan && !gl.alken && !gl.prop && gl.sted === "stativ" && !gl.folie; });
        if (!g) {
            var v = this.valgtGlas(), a = this.andetGlas(v);
            if (!v.brom && !a.brom) { this.besked("Hæld bromvand i først."); this.markér("bromflaske"); }
            else if (v.alken) this.besked("Der er hexen i glasset. Tøm det i affaldsdunken, hvis det skal bruges i forsøget.");
            else if (v.hexan && a.hexan) this.besked("Der er hexan i begge glas.");
            else if (v.prop) { this.besked("Tag proppen af først.", "advarsel"); this.markér(v.prop.navn); }
            else { this.besked("Hæld bromvand i glas " + (v.brom ? a.nr : v.nr) + " først."); this.markér("bromflaske"); }
            return false;
        }
        this.haeldHexan(g);
        return true;
    };

    /* Hex-1-en er ikke en del af forsoeget, men kan proeves */
    P.proevHexen = function () {
        var g = this.maalGlas(function (gl) { return gl.brom && !gl.hexan && !gl.alken && !gl.prop && gl.sted === "stativ" && !gl.folie; });
        if (!g) {
            var v = this.valgtGlas(), a = this.andetGlas(v);
            if (!v.brom && !a.brom) { this.besked("Hæld bromvand i først."); this.markér("bromflaske"); }
            else if (v.alken) this.besked("Der er allerede hexen i glasset.");
            else if (v.hexan) this.besked("Der er hexan i glasset. Hexen kan kun komme i et glas med bromvand alene.");
            else if (v.prop) { this.besked("Tag proppen af først.", "advarsel"); this.markér(v.prop.navn); }
            else this.besked("Glasset skal stå i stativet.");
            return false;
        }
        this.haeldHexen(g);
        return true;
    };

    P.proevProp = function (navn) {
        var pr = this.g[navn];
        if (pr.flyver) return false;
        if (pr.iGlas) { this.propAf(pr); return true; }
        var g = this.maalGlas(function (gl) { return gl.brom && !gl.prop && !gl.folie && gl.sted !== "flytter"; });
        if (!g) {
            var v = this.valgtGlas();
            if (!v.brom) this.besked("Glasset er tomt.");
            else if (v.folie) this.besked("Tag folien af først.");
            else this.besked("Begge glas har prop i.");
            return false;
        }
        this.propI(pr, g);
        return true;
    };

    P.klarTilLys = function (gl) {
        return !!(gl.hexan && gl.prop && gl.sted === "stativ" && !gl.folie && this.rystet(gl));
    };

    /* Hvorfor kan glasset ikke stilles i lys eller moerke? */
    P.forklarIkkeKlar = function (v) {
        if (v.alken) { this.besked("Det er hexen i glasset. Det hører ikke til forsøget. Tøm glasset i affaldsdunken."); this.markér("dunk", 4); }
        else if (!v.brom || !v.hexan) { this.besked("Glasset skal have bromvand og hexan først."); this.markér(v.brom ? "hexan" : "bromflaske"); }
        else if (v.folie) this.besked("Tag folien af først.");
        else if (v.sted === "lampe") this.besked("Glasset står allerede under lampen.");
        else if (!v.prop) { this.besked("Sæt proppen i først.", "advarsel"); this.markér(this.g.prop1.iGlas ? "prop2" : "prop1"); }
        else if (!this.rystet(v)) { this.besked("Ryst glasset først, så Br₂ kommer op i hexanlaget.", "advarsel"); this.markér(v.navn); }
        else this.besked("Glasset kan ikke bruges nu.");
    };

    P.proevLampe = function () {
        var under = this.glasVed("lampe");
        var mig = this;
        if (under) {
            var v = this.valgtGlas();
            if (v !== under && v.hexan) {
                this.besked("Der er kun plads til ét glas under lampen. Det andet glas er kontrolforsøget.");
                return false;
            }
            this.lampeTaendt = !this.lampeTaendt;
            if (NK.Lyd) NK.Lyd.kontakt();
            if (this.lampeTaendt) this.gjort.lys = true;
            this.besked(this.lampeTaendt ? "Lampen er tændt." : "Lampen er slukket. Reaktionen går i stå.");
            this.aendret("lampe");
            return true;
        }
        var g = this.maalGlas(function (gl) { return mig.klarTilLys(gl); });
        if (!g) { this.forklarIkkeKlar(this.valgtGlas()); return false; }
        this.tilLampe(g);
        return true;
    };

    /* Kontakten paa lampens fod taender og slukker, uanset hvad der staar
       under den. */
    P.skiftLampe = function () {
        this.lampeTaendt = !this.lampeTaendt;
        if (NK.Lyd) NK.Lyd.kontakt();
        var under = this.glasVed("lampe");
        if (this.lampeTaendt && under) this.gjort.lys = true;
        this.besked(this.lampeTaendt ? (under ? "Lampen er tændt." : "Lampen er tændt, men der står ikke noget under den.") : "Lampen er slukket.");
        this.aendret("lampe");
        return true;
    };

    /* Uret: et klik faar tiden til at gaa hurtigere et stykke tid */
    P.skiftTid = function () {
        if (this.tidFart > 1) {
            this.tidFart = 1;
            this.tidFartUr = 0;
            this.besked("Tiden går normalt igen.");
        } else {
            this.tidFart = M.UR.hurtig;
            this.tidFartUr = M.UR.hurtigTid;
            this.besked("Tiden går hurtigere.");
        }
        if (NK.Lyd) NK.Lyd.klik();
        this.aendret("tid");
        return true;
    };

    /* Den store visning af det valgte glas */
    P.aabnStor = function (gl) {
        if (!gl || !gl.brom) return false;
        this.stor = gl;
        this.vaelg(gl.navn);
        this.besked("Klik hvor som helst for at lukke den store visning.");
        this.aendret("stor");
        return true;
    };

    P.lukStor = function () {
        if (!this.stor) return false;
        this.stor = null;
        this.aendret("stor");
        return true;
    };

    P.skiftStor = function () {
        if (this.stor) return this.lukStor();
        return this.aabnStor(this.valgtGlas());
    };

    P.proevFolie = function () {
        var v = this.valgtGlas(), mig = this;
        var g = this.maalGlas(function (gl) { return mig.klarTilLys(gl); });
        if (!g) {
            var a = this.andetGlas(v);
            if (v.folie || a.folie) this.besked("Det ene glas er i folie. Folien tages af, når glasset testes.");
            else if (v.sted === "lampe") this.besked("Glasset under lampen skal ikke pakkes ind.");
            else this.forklarIkkeKlar(v);
            return false;
        }
        this.folieOm(g);
        return true;
    };

    P.klarTilTest = function () {
        if (!this.gjort.reageret) {
            if (this.gjort.lys) { this.besked("Vent, til farven i lyset er væk, før du tester."); this.markér("lampe"); }
            else { this.besked("Stil først et glas i lys."); this.markér("lampe"); }
            return false;
        }
        return true;
    };

    P.proevPH = function () {
        var alk = this.maalGlas(function (gl) { return gl.alken && gl.brom && gl.ph === null && gl.sted !== "flytter"; });
        if (alk) { this.phTest(alk); return true; }
        if (!this.klarTilTest()) return false;
        var g = this.maalGlas(function (gl) { return gl.brom && gl.hexan && gl.ph === null && gl.sted !== "flytter"; });
        if (!g) {
            var v = this.valgtGlas();
            if (!v.brom || !v.hexan) this.besked("Glasset skal have bromvand og hexan.");
            else this.besked("Begge glas er testet med pH-papir.");
            return false;
        }
        this.phTest(g);
        return true;
    };

    P.proevAgNO3 = function () {
        var alk = this.maalGlas(function (gl) { return gl.alken && gl.brom && !gl.agTest && gl.sted !== "flytter"; });
        if (alk) { this.draabe(alk); return true; }
        if (!this.klarTilTest()) return false;
        var g = this.maalGlas(function (gl) { return gl.brom && gl.hexan && !gl.agTest && gl.sted !== "flytter"; });
        if (!g) {
            var v = this.valgtGlas();
            if (!v.brom || !v.hexan) this.besked("Glasset skal have bromvand og hexan.");
            else this.besked("Der er dryppet AgNO₃ i begge glas.");
            return false;
        }
        this.draabe(g);
        return true;
    };

    P.proevAffald = function () {
        var alk = this.maalGlas(function (gl) { return gl.alken && gl.sted !== "flytter"; });
        if (alk) { this.toemGlas(alk); return true; }
        if (this.gjort.affald) { this.besked("Resterne er afleveret."); return false; }
        if (!this.testsFaerdige()) { this.besked("Gør begge tests færdige i begge glas først."); return false; }
        this.aflever();
        return true;
    };

    P.proevStativ = function () {
        var v = this.valgtGlas();
        if (v.sted === "lampe") { this.tilStativ(v); return true; }
        this.besked("Stativet holder glassene. Klik på et glas for at vælge det.");
        return false;
    };

    /* ----- Bromvand og hexan ----------------------------------------------- */
    P.laagPositur = function () {
        var b = this.g.bromflaske;
        var paa = NK.tilVerden(b.p, b.anker, 40, 24);
        var t = NK.blod(this.laagT);
        var bord = S.LAAG_PAA_BORD;
        return {
            x: NK.lerp(paa.x, bord.x, t),
            y: NK.lerp(paa.y, bord.y, t) - Math.sin(Math.PI * t) * 40,
            v: NK.lerp(b.p.v, 0, t)
        };
    };

    P.haeldBrom = function (gl) {
        var b = this.g.bromflaske;
        var pose = { x: gl.p.x - 6, y: gl.p.y - 36, v: 2.0 };
        this.vaelg(gl.navn);
        this.koer([
            { tid: 0.4, hver: function (t) { this.laagT = t; } },
            { flyt: b, til: pose, tid: 0.9, loeft: 50 },
            { kald: function () { gl.mikro.tilfoejBrom(); if (NK.Lyd) NK.Lyd.haeld(1.4); } },
            { tid: 1.4, hver: function (t) {
                gl.vandAreal = S.VAND_AREAL * NK.blod(t);
                var bund = NK.tilVerden(gl.p, gl.anker, 15, 150).y;
                this.straale = { fra: { x: b.p.x, y: b.p.y }, til: { x: gl.p.x, y: gl.niveau === null ? bund : gl.niveau }, farve: M.FARVE.bromvand, bredde: 3 };
            } },
            { kald: function () {
                this.straale = null;
                gl.brom = true;
                gl.brVand = 1;
                gl.brHex = 0;
                gl.reageret = 0;
                this.iagttag("brom");
                this.aendret("brom");
            } },
            hjemTil(b, 0.9, 50),
            { tid: 0.4, hver: function (t) { this.laagT = 1 - t; } }
        ], "brom");
    };

    P.haeldHexan = function (gl) {
        var fl = this.g.hexan;
        var pose = { x: gl.p.x - 4, y: gl.p.y - 34, v: 2.05 };
        this.vaelg(gl.navn);
        this.koer([
            { tid: 0.3, hver: function (t) { this.hexLaagT = t; } },
            { flyt: fl, til: pose, tid: 0.9, loeft: 50 },
            { kald: function () { gl.mikro.tilfoejHexan(); if (NK.Lyd) NK.Lyd.haeld(1.2); } },
            { tid: 1.2, hver: function (t) {
                gl.hexAreal = S.HEX_AREAL * NK.blod(t);
                var top = gl.niveauTop === null || gl.niveauTop === undefined ? gl.niveau : gl.niveauTop;
                this.straale = { fra: { x: fl.p.x, y: fl.p.y }, til: { x: gl.p.x, y: top === null ? gl.p.y + 100 : top }, farve: M.FARVE.hexan, bredde: 2.5 };
            } },
            { kald: function () {
                this.straale = null;
                gl.hexan = true;
                this.iagttag("hexan");
                this.aendret("hexan");
            } },
            hjemTil(fl, 0.9, 50),
            { tid: 0.3, hver: function (t) { this.hexLaagT = 1 - t; } }
        ], "hexan");
    };

    P.haeldHexen = function (gl) {
        var fl = this.g.hexen;
        var pose = { x: gl.p.x - 4, y: gl.p.y - 34, v: 2.05 };
        this.vaelg(gl.navn);
        this.koer([
            { tid: 0.3, hver: function (t) { this.hexenLaagT = t; } },
            { flyt: fl, til: pose, tid: 0.9, loeft: 50 },
            { kald: function () { gl.mikro.tilfoejHexen(); if (NK.Lyd) NK.Lyd.haeld(1.2); } },
            { tid: 1.2, hver: function (t) {
                gl.hexAreal = S.HEX_AREAL * NK.blod(t);
                var top = gl.niveauTop === null || gl.niveauTop === undefined ? gl.niveau : gl.niveauTop;
                this.straale = { fra: { x: fl.p.x, y: fl.p.y }, til: { x: gl.p.x, y: top === null ? gl.p.y + 100 : top }, farve: M.FARVE.hexan, bredde: 2.5 };
            } },
            { kald: function () {
                this.straale = null;
                gl.alken = true;
                gl.addition = 0;
                this.besked("Hexen er ikke en del af forsøget. Sæt prop i, og ryst, hvis du vil se, hvad der sker.");
                if (!this.gjort.hexenPaatalt && this.laererHexen) { this.gjort.hexenPaatalt = true; this.laererHexen(); }
                this.aendret("hexen");
            } },
            hjemTil(fl, 0.9, 50),
            { tid: 0.3, hver: function (t) { this.hexenLaagT = 1 - t; } }
        ], "hexen");
    };

    /* Et glas med hexen toemmes i dunken, saa det kan bruges igen */
    P.toemGlas = function (gl) {
        var d = S.DUNK.aabning;
        var liste = [];
        var startV = 0, startH = 0;
        this.vaelg(gl.navn);
        if (gl.prop) liste = liste.concat(this.propAfListe(gl.prop));
        if (gl.folie) liste = liste.concat(this.folieAfListe(gl));
        liste.push({ kald: function () { gl.sted = "flytter"; } });
        liste.push({ flyt: gl, til: { x: d.x - 4, y: d.y - 34, v: 2.3 }, tid: 0.9, loeft: 60 });
        liste.push({ kald: function () { startV = gl.vandAreal; startH = gl.hexAreal; if (NK.Lyd) NK.Lyd.haeld(0.9); } });
        liste.push({ tid: 0.9, hver: function (t) {
            gl.hexAreal = startH * Math.max(0, 1 - t * 2);
            gl.vandAreal = startV * Math.max(0, 1 - Math.max(0, t - 0.4) / 0.6);
            gl.visBund *= 1 - t;
            this.straale = { fra: { x: gl.p.x, y: gl.p.y }, til: { x: d.x - 2, y: d.y + 6 }, farve: t < 0.5 ? M.hexanFarve(gl) : M.vandFarve(gl), bredde: 2.5 };
        } });
        liste.push({ kald: function () {
            this.straale = null;
            this.nulstilGlas(gl);
            this.besked("Glas " + gl.nr + " er tømt og kan bruges igen.");
        } });
        liste.push({ flyt: gl, til: gl.hjem, tid: 0.9, loeft: 60 });
        liste.push({ kald: function () { gl.sted = "stativ"; this.aendret("toemt"); } });
        this.koer(liste, "toem");
    };

    P.nulstilGlas = function (gl) {
        gl.brom = false; gl.hexan = false; gl.alken = false;
        gl.slutFarve = null; gl.slutFarveVaerdi = null;
        gl.brHex = 0; gl.brVand = 0; gl.reageret = 0; gl.addition = 0; gl.erRystet = false;
        gl.vandAreal = 0; gl.hexAreal = 0; gl.visBund = 0; gl.uklar = 0;
        gl.ph = null; gl.phFarve = null; gl.papir = null;
        gl.agDraaber = 0; gl.agTest = false; gl.agNoteret = false;
        gl.lysTid = 0; gl.moerkeTid = 0;
        gl.mikro.toem();
    };

    /* ----- Propper ------------------------------------------------------------ */
    P.propI = function (pr, gl) {
        var mig = this;
        this.vaelg(gl.navn);
        this.koer([
            { flyt: pr, til: { x: gl.p.x, y: gl.p.y - 40, v: 0 }, tid: 0.6, loeft: 40 },
            { flyt: pr, til: function () { return mig.propIGlas(gl); }, tid: 0.22, loeft: 0 },
            { kald: function () {
                pr.iGlas = gl;
                gl.prop = pr;
                if (NK.Lyd) NK.Lyd.prop();
                this.aendret("prop");
            } }
        ], "prop");
    };

    P.propAfListe = function (pr) {
        var mig = this;
        return [
            { kald: function () {
                var gl = pr.iGlas;
                if (!gl) return;
                pr.p = mig.propIGlas(gl);
                pr.iGlas = null;
                gl.prop = null;
                if (NK.Lyd) NK.Lyd.klik();
                mig.aendret("prop");
            } },
            { flyt: pr, til: function () { return { x: pr.p.x + 12, y: pr.p.y - 44, v: 0.4 }; }, tid: 0.3, loeft: 0 },
            hjemTil(pr, 0.6, 30)
        ];
    };

    P.propAf = function (pr) {
        this.koer(this.propAfListe(pr), "prop");
    };

    /* ----- Lys og moerke --------------------------------------------------------- */
    P.tilLampe = function (gl) {
        gl.sted = "flytter";
        this.vaelg(gl.navn);
        this.koer([
            { flyt: gl, til: S.UNDER_LAMPE, tid: 1.0, loeft: 60 },
            { kald: function () {
                gl.sted = "lampe";
                this.lampeTaendt = true;
                this.gjort.lys = true;
                if (NK.Lyd) NK.Lyd.kontakt();
                this.besked("Lampen er tændt. Følg med i farven.");
                this.aendret("lys");
                if (!this.gjort.storVist) { this.gjort.storVist = true; this.aabnStor(gl); }
            } }
        ], "lampe");
    };

    P.tilStativ = function (gl) {
        gl.sted = "flytter";
        this.lampeTaendt = false;
        this.koer([
            { flyt: gl, til: gl.hjem, tid: 1.0, loeft: 60 },
            { kald: function () { gl.sted = "stativ"; this.aendret("stativ"); } }
        ], "stativ");
    };

    P.folieOm = function (gl) {
        var fo = this.g.folie;
        this.vaelg(gl.navn);
        this.koer([
            { flyt: fo, til: { x: gl.p.x + 34, y: gl.p.y + 46, v: -0.35 }, tid: 0.8, loeft: 50 },
            { kald: function () { if (NK.Lyd) NK.Lyd.papir(); } },
            { tid: 0.7, hver: function (t) { gl.folieVis = t; } },
            { kald: function () {
                gl.folie = true;
                gl.folieVis = 1;
                this.gjort.moerke = true;
                if (!this.gjort.reageret) this.kontrolFoer = true;
                this.besked("Glasset er pakket ind. Der kommer ikke lys til.");
                var andet = this.andetGlas(gl);
                if (andet.brom) this.vaelg(andet.navn);
                this.aendret("moerke");
            } },
            hjemTil(fo, 0.8, 50)
        ], "folie");
    };

    P.folieAfListe = function (gl) {
        return [
            { kald: function () { if (gl.folie && NK.Lyd) NK.Lyd.papir(); } },
            { tid: 0.5, hver: function (t) { if (gl.folie) gl.folieVis = 1 - t; } },
            { kald: function () {
                if (!gl.folie) return;
                gl.folie = false;
                gl.folieVis = 0;
                if (M.br2Tilbage(gl) > 0.5) this.iagttag("moerke", gl);
                this.aendret("folie");
            } }
        ];
    };

    P.folieAf = function (gl) {
        this.koer(this.folieAfListe(gl), "folie");
    };

    /* ----- pH-papir ------------------------------------------------------------- */
    P.phTest = function (gl) {
        var mig = this;
        var boks = this.g.phpapir;
        var start = NK.tilVerden(boks.p, boks.anker, 60, 20);
        var s = { p: { x: start.x, y: start.y - 8, v: 0 }, farve: null, dyp: 0, alfa: 1 };
        var liste = [];
        this.vaelg(gl.navn);
        if (gl.prop) liste = liste.concat(this.propAfListe(gl.prop));
        if (gl.folie) liste = liste.concat(this.folieAfListe(gl));
        liste.push({ kald: function () { this.strimler.push(s); if (NK.Lyd) NK.Lyd.papir(); } });
        liste.push({ flyt: s, til: function () { return { x: gl.p.x, y: gl.p.y - 62, v: 0 }; }, tid: 0.7, loeft: 30 });
        liste.push({ flyt: s, til: function () { var w = NK.tilVerden(gl.p, gl.anker, 15, 72); return { x: w.x, y: w.y, v: gl.p.v }; }, tid: 0.6, loeft: 0 });
        liste.push({ kald: function () {
            var i = this.strimler.indexOf(s);
            if (i >= 0) this.strimler.splice(i, 1);
            gl.strimmel = s;
        } });
        liste.push({ tid: 1.0, hver: function (t) {
            s.farve = M.pHFarve(M.pH(gl.reageret));
            s.dyp = 0.5 * Math.min(1, t * 1.6);
        } });
        liste.push({ kald: function () {
            gl.strimmel = null;
            this.strimler.push(s);
            gl.ph = M.pH(gl.reageret);
            gl.phFarve = s.farve;
            var noegle = gl.ph <= 2.5 ? "ph_sur" : (gl.ph <= 4.5 ? "ph_svag" : "ph_neutral");
            this.iagttag(noegle, gl, s.farve);
            if (NK.Lyd) NK.Lyd.succes();
            this.aendret("ph");
        } });
        liste.push({ flyt: s, til: function () { return { x: gl.p.x, y: gl.p.y - 62, v: 0 }; }, tid: 0.5, loeft: 0 });
        liste.push({ flyt: s, til: { x: gl.hjem.x - 22, y: S.BORD - 6, v: -Math.PI / 2 + 0.1 }, tid: 0.8, loeft: 40 });
        liste.push({ kald: function () {
            var i = mig.strimler.indexOf(s);
            if (i >= 0) mig.strimler.splice(i, 1);
            gl.papir = s;
        } });
        this.koer(liste, "ph");
    };

    /* ----- AgNO3 ------------------------------------------------------------------ */
    P.draabe = function (gl) {
        var d = this.g.agno3;
        var liste = [];
        this.vaelg(gl.navn);
        if (gl.prop) liste = liste.concat(this.propAfListe(gl.prop));
        if (gl.folie) liste = liste.concat(this.folieAfListe(gl));
        if (!(d.svaev && d.svaev.glas === gl)) {
            liste.push({ flyt: d, til: { x: gl.p.x, y: gl.p.y - 16, v: Math.PI }, tid: 0.7, loeft: 50 });
        }
        liste.push({ tid: 0.15 });
        liste.push({ kald: function () {
            this.draaber.push({ x: d.p.x, y: d.p.y + 4, vx: 0, vy: 40, r: 3.4, liv: 1, farveloes: true, glas: gl });
            d.svaev = { glas: gl, ur: 2.6 };
            this.aendret("draabe");
        } });
        this.koer(liste, "draabe");
    };

    P.draabeLander = function (dr) {
        var gl = dr.glas;
        this.iagttag("draabe");
        gl.agDraaber++;
        gl.vandAreal += 10;
        gl.mikro.tilfoejAgNO3();
        if (NK.Lyd) NK.Lyd.plip();
        if (gl.agDraaber >= M.MAENGDE.DRAABER && !gl.agTest) {
            gl.agTest = true;
            gl.agTestTid = this.tid;
        }
        this.aendret("draabe");
    };

    /* ----- Affald ---------------------------------------------------------------- */
    P.aflever = function () {
        var d = S.DUNK.aabning;
        var liste = [];
        var mig = this;
        [this.g.glas1, this.g.glas2].forEach(function (gl) {
            if (!gl.brom && !gl.hexan) return;
            var startV = 0, startH = 0;
            if (gl.prop) liste = liste.concat(mig.propAfListe(gl.prop));
            if (gl.folie) liste = liste.concat(mig.folieAfListe(gl));
            liste.push({ kald: function () {
                gl.sted = "flytter";
                /* Farven huskes til tegneserien, foer glasset toemmes */
                gl.slutFarve = M.farveTekst(gl);
                gl.slutFarveVaerdi = gl.brHex > gl.brVand ? M.hexanFarve(gl) : M.vandFarve(gl);
            } });
            liste.push({ flyt: gl, til: { x: d.x - 4, y: d.y - 34, v: 2.3 }, tid: 0.9, loeft: 60 });
            liste.push({ kald: function () { startV = gl.vandAreal; startH = gl.hexAreal; if (NK.Lyd) NK.Lyd.haeld(0.9); } });
            liste.push({ tid: 0.9, hver: function (t) {
                gl.hexAreal = startH * Math.max(0, 1 - t * 2);
                gl.vandAreal = startV * Math.max(0, 1 - Math.max(0, t - 0.4) / 0.6);
                gl.visBund *= 1 - t;
                this.straale = { fra: { x: gl.p.x, y: gl.p.y }, til: { x: d.x - 2, y: d.y + 6 }, farve: t < 0.5 ? M.hexanFarve(gl) : M.vandFarve(gl), bredde: 2.5 };
            } });
            liste.push({ kald: function () {
                this.straale = null;
                gl.vandAreal = 0;
                gl.hexAreal = 0;
                gl.visBund = 0;
                gl.uklar = 0;
                gl.brom = false;
                gl.hexan = false;
                gl.brHex = 0;
                gl.brVand = 0;
                gl.mikro.toem();
            } });
            liste.push({ flyt: gl, til: gl.hjem, tid: 0.9, loeft: 60 });
            liste.push({ kald: function () { gl.sted = "stativ"; } });
        });
        liste.push({ kald: function () {
            this.lampeTaendt = false;
            this.gjort.affald = true;
            this.iagttag("affald");
            this.besked("Resterne er afleveret. Forsøget er slut.", "god");
            if (NK.Lyd) NK.Lyd.succes();
            this.aendret("affald");
        } });
        this.koer(liste, "affald");
    };

    /* ----- Rystning -------------------------------------------------------- */
    P.kanRyste = function (gl) {
        return !!(gl && gl.brom && gl.prop && !gl.folie && gl.sted !== "flytter" && !this.handling && !(this.laererOptaget && this.laererOptaget()));
    };

    /* Et glas uden prop kan ogsaa tages fat i. Rystes det, sproejter
       indholdet ud (se opdaterRyst). */
    P.kanTageFat = function (gl) {
        return !!(gl && gl.brom && !gl.folie && gl.sted !== "flytter" && !this.handling && !(this.laererOptaget && this.laererOptaget()));
    };

    P.kanRysteNu = function () {
        return this.kanRyste(this.g.glas1) || this.kanRyste(this.g.glas2);
    };

    /* Som kanTageFat, men med besked om hvorfor ikke */
    P.proevRyst = function (gl) {
        if (this.kanTageFat(gl)) return true;
        if (this.handling) return false;
        if (!gl.brom) this.besked("Glasset er tomt.");
        else if (gl.folie) this.besked("Tag folien af, før du ryster.");
        return false;
    };

    P.startRyst = function (kilde, gl) {
        this.rystKilde = kilde;
        this.rystGlas = gl;
        this.farligTid = 0;
        this.spildTid = 0;
        this.vaelg(gl.navn);
        this.aendret("ryst");
    };

    /* pt: hvor musen slap glasset. Slippes det over lampen eller stativet,
       flyttes det derhen; ellers gaar det tilbage, hvor det kom fra. */
    P.stopRyst = function (pt) {
        if (!this.rystKilde) return;
        var gl = this.rystGlas;
        this.rystKilde = null;
        this.rystGlas = null;
        this.farligTid = 0;
        this.musFart = 0;
        this.vold = 0;
        this.uro = 0;
        if (gl && !this.handling) this.slipGlas(gl, pt);
        this.aendret("ryst");
    };

    P.slipGlas = function (gl, pt) {
        var overLampe = pt && pt.x > 630 && pt.x < 850 && pt.y > 262;
        var overStativ = pt && pt.x > S.STATIV.x && pt.x < S.STATIV.x + 150 && pt.y > 300;
        if (overLampe && gl.sted !== "lampe") {
            if (this.glasVed("lampe")) this.besked("Der er kun plads til ét glas under lampen.");
            else if (this.klarTilLys(gl)) { this.tilLampe(gl); return; }
            else this.forklarIkkeKlar(gl);
        } else if (overStativ && gl.sted === "lampe") {
            this.tilStativ(gl);
            return;
        }
        this.koer([{ flyt: gl, til: this.hjemFor(gl), tid: 0.35, loeft: 0 }], "hjem");
    };

    /* Knappen Ryst glasset (og tasten R): til = trykket ned. Et glas med
       prop vaelges foerst. Har intet glas prop, rystes det valgte alligevel,
       og indholdet sproejter ud. */
    P.rystKnap = function (til) {
        if (til) {
            if (this.rystKilde || this.handling || this.holdt) return false;
            var mig = this;
            var gl = this.maalGlas(function (g) { return mig.kanRyste(g); });
            if (!gl && this.proevRyst(this.valgtGlas())) gl = this.valgtGlas();
            if (!gl) return false;
            this.startRyst("knap", gl);
            return true;
        }
        if (this.rystKilde === "knap") this.stopRyst();
        return false;
    };

    /* Hvor voldsomt skal der rystes, foer proppen springer? null, naar
       det ikke kan ske mere. */
    P.knusGraense = function () {
        var n = this.antalUheld;
        if (n >= M.RYST.MAKS_UHELD) return null;
        return { fart: M.RYST.KNUS_FART[n], tid: M.RYST.KNUS_TID[n] };
    };

    P.opdaterRyst = function (dt) {
        var gl = this.rystGlas;
        var maal = 0;
        this.uro = 0;
        if (gl && this.rystKilde === "knap") {
            var hj = this.hjemFor(gl);
            var w = this.tid * 17;
            gl.p.x = hj.x + Math.sin(w) * 28;
            gl.p.y = hj.y - 30 + Math.abs(Math.cos(w)) * 6;
            gl.p.v = Math.cos(w) * 0.22;
            maal = 1;
            if (!gl.prop) this.spildTid += dt;
        } else if (gl && this.rystKilde === "mus") {
            this.musFart *= Math.exp(-4 * dt);
            this.musVx *= Math.exp(-5 * dt);
            this.vold = NK.mod(this.vold, this.musFart, 4, dt);
            maal = NK.klamp(this.musFart / M.RYST.FULD, 0, 1);

            var g = this.knusGraense();
            if (!gl.prop) {
                /* Uden prop skvulper det over kanten, naar der rystes */
                if (this.vold > M.RYST.SPILD_FART) this.spildTid += dt;
                else this.spildTid = Math.max(0, this.spildTid - dt);
                this.uro = NK.klamp(this.spildTid / M.RYST.SPILD_TID, 0, 1);
            } else if (g) {
                if (this.vold > g.fart) this.farligTid += dt;
                else this.farligTid = Math.max(0, this.farligTid - dt);
                this.uro = NK.klamp((this.vold / g.fart - 0.7) / 0.3, 0, 1);
                if (this.farligTid >= g.tid) {
                    this.farligTid = 0;
                    this.propSpringer();
                    return;
                }
            }
            gl.p.v = NK.mod(gl.p.v, NK.klamp(-this.musVx * 0.0004, -0.4, 0.4), 12, dt) + (Math.random() - 0.5) * 0.14 * this.uro;
        }
        if (gl && !gl.prop && this.spildTid > 0.05) {
            if (Math.random() < dt * 14) {
                var fs = M.br2Tilbage(gl) > 0.05 ? M.FARVE.bromvand : { r: 190, g: 215, b: 235, a: 0.6 };
                this.draaber.push({ x: gl.p.x + r(-3, 3), y: gl.p.y, vx: r(-90, 90), vy: -r(60, 160), r: r(1.4, 2.4), liv: 1, farve: fs, fysik: true });
            }
            if (this.spildTid >= M.RYST.SPILD_TID) {
                this.spildTid = 0;
                this.spild(gl, "udenProp");
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

    /* Paaskeaegget: proppen springer af, og indholdet sproejter ud */
    P.propSpringer = function () {
        this.antalUheld++;
        this.spild(this.rystGlas, "prop");
    };

    /* Indholdet sproejter ud af glasset, fordi proppen sprang af (slags
       "prop"), eller fordi der blev rystet uden prop ("udenProp").
       Laereren kommer og toerrer op (laerer.js). */
    P.spild = function (gl, slags) {
        var pr = gl.prop;
        var i;
        if (slags !== "prop") this.andreUheld++;
        this.rystKilde = null;
        this.rystGlas = null;
        this.holdt = null;
        this.farligTid = 0;
        this.spildTid = 0;
        this.uro = 0;
        this.ryst = 0;
        this.musFart = 0;
        this.vold = 0;

        if (pr) {
            pr.p = this.propIGlas(gl);
            pr.iGlas = null;
            gl.prop = null;
            pr.flyver = { vx: r(-70, 70), vy: -r(280, 380), va: r(-12, 12) };
        }
        var brom = M.br2Tilbage(gl) > 0.05;
        var farve = brom ? M.FARVE.bromvand : { r: 190, g: 215, b: 235, a: 0.6 };
        for (i = 0; i < 26; i++) {
            this.draaber.push({ x: gl.p.x + r(-4, 4), y: gl.p.y, vx: r(-240, 240), vy: -r(120, 360), r: r(1.6, 3), liv: 1, farve: farve, fysik: true });
        }
        this.pyt = { x: NK.klamp(gl.p.x, 340, 460), rx: 8, rxMaal: 62, farve: farve, vaad: 1, brom: brom };

        this.nulstilGlas(gl);
        this.ryk = 5;
        if (NK.Lyd) { if (pr) NK.Lyd.pop(); NK.Lyd.plask(); }
        this.iagttag(slags === "prop" ? "uheld" : "spildt", gl);
        this.besked(slags === "prop" ? "Proppen sprang af! Indholdet er tabt." : "Der var ingen prop i. Indholdet er tabt.", "advarsel");
        this.koer([{ flyt: gl, til: this.hjemFor(gl), tid: 0.5, loeft: 0 }], "hjem");
        if (this.laererUheld) this.laererUheld(gl, slags);
        this.aendret("uheld");
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.mikroTilstand = function (gl, ryst, lys) {
        /* Foerst naar en tydelig del er omdannet, viser boblen det */
        var nReageret = gl.reageret < M.LYS.synlig ? 0 : NK.klamp(Math.round(M.MAENGDE.BR2 * gl.reageret), 0, M.MAENGDE.BR2);
        var nAddition = gl.addition < M.LYS.synlig ? 0 : NK.klamp(Math.round(M.MAENGDE.BR2 * gl.addition), 0, M.MAENGDE.BR2 - nReageret);
        var nHex = NK.klamp(Math.round(M.MAENGDE.BR2 * gl.brHex), 0, M.MAENGDE.BR2 - nReageret - nAddition);
        var nVand = M.MAENGDE.BR2 - nReageret - nAddition - nHex;
        return {
            ryst: ryst, lys: lys, moerke: gl.folie, stor: this.stor === gl, alken: gl.alken,
            brHex: gl.brHex, brVand: gl.brVand,
            nHex: nHex, nVand: nVand, nReageret: nReageret, nAddition: nAddition
        };
    };

    P.opdater = function (dt) {
        var i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        var dtM = dt * this.tidFart;
        this.urMinutter += dtM * M.UR.minPerSek;
        var g = this.g;

        this.opdaterHandling(dt);
        this.opdaterRyst(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);

        this.vingeFart = NK.mod(this.vingeFart, this.udsugning ? 20 : 0, 1.4, dt);
        this.vinge += this.vingeFart * dt;
        this.luft = NK.mod(this.luft, this.udsugning ? 1 : 0, 1.2, dt);
        this.lampeVis = NK.mod(this.lampeVis, this.lampeTaendt && this.glasVed("lampe") ? 1 : 0, 8, dt);
        if (this.mark) { this.mark.ur -= dt; if (this.mark.ur <= 0) this.mark = null; }
        this.ryk = this.ryk > 0.2 ? this.ryk * (1 - dt * 7) : 0;

        var mig = this;
        [g.glas1, g.glas2].forEach(function (gl) {
            var lys = mig.lysStyrke(gl);
            var ryst = mig.rystGlas === gl ? mig.ryst : 0;
            var foerReag = gl.reageret, foerAdd = gl.addition, harHexBrom = gl.brom && gl.hexan;
            M.skridt(gl, dtM, ryst, lys);
            if (harHexBrom) {
                if (gl.sted === "lampe" && mig.lampeTaendt) gl.lysTid += dtM * M.UR.minPerSek;
                if (gl.folie) gl.moerkeTid += dtM * M.UR.minPerSek;
                if (!gl.erRystet && M.fordelt(gl) >= M.FORDELING.faerdig) {
                    gl.erRystet = true;
                    mig.besked("Farven er flyttet op i hexanlaget.", "god");
                    if (NK.Lyd) NK.Lyd.succes();
                    mig.iagttag("fordelt");
                    mig.aendret("fordelt");
                }
                if (foerReag < M.LYS.begyndt && gl.reageret >= M.LYS.begyndt) {
                    if (gl.sted === "lampe") mig.iagttag("lys_start");
                    else if (!gl.folie) mig.iagttag("rum");
                }
                if (foerReag < M.LYS.faerdig && gl.reageret >= M.LYS.faerdig) {
                    mig.iagttag("lys_faerdig", gl);
                    mig.besked("Farven i glas " + gl.nr + " er væk.", "god");
                    if (NK.Lyd) NK.Lyd.succes();
                    mig.gjort.reageret = true;
                    mig.aendret("reageret");
                }
            }
            if (gl.alken && foerAdd < M.LYS.faerdig && gl.addition >= M.LYS.faerdig) {
                mig.besked("Farven forsvandt uden lys. Br₂ er lagt til dobbeltbindingen: en addition.", "god");
                if (NK.Lyd) NK.Lyd.succes();
                mig.aendret("addition");
            }
            gl.mikro.opdater(dt, mig.mikroTilstand(gl, ryst, lys));
            var bund = gl.mikro.agbrAndel();
            gl.visBund = NK.mod(gl.visBund, bund, 0.7, dt);
            gl.uklar = NK.mod(gl.uklar, NK.klamp((bund - gl.visBund) * 3 + (bund > 0 ? 0.12 : 0), 0, 1), 3, dt);
            if (gl.agTest && !gl.agNoteret && mig.tid - gl.agTestTid > 2.5 && !gl.mikro.travl()) {
                gl.agNoteret = true;
                if (gl.reageret > 0.5) mig.iagttag("ag_bundfald", gl); else mig.iagttag("ag_intet", gl);
                if (NK.Lyd) NK.Lyd.succes();
                mig.aendret("agno3");
            }
        });

        if (this.testsFaerdige() && !this.gjort.rost) {
            this.gjort.rost = true;
            if (this.flotUdfoert() && this.laererDab) this.laererDab();
            else if (this.laererRos) this.laererRos();
            this.markér("dunk", 6);
        }

        /* Lampen taendt uden glas: efter et stykke tid kommer laereren */
        if (this.lampeTaendt && !this.glasVed("lampe")) {
            this.lampeTomUr += dt;
            if (this.lampeTomUr > 20 && this.laererSlukLampe && this.laerer && !this.laerer.scene) { this.lampeTomUr = -60; this.laererSlukLampe(); }
        } else {
            this.lampeTomUr = Math.min(this.lampeTomUr, 0);
        }
        var under = this.glasVed("lampe");
        if (under && !this.lampeTaendt && under.reageret > 0.03 && under.reageret < M.LYS.faerdig) this.lampeSlukTid += dt;

        /* Brom fremme uden udsugning: dampene kommer ud i lokalet, og
           efter 1,6 sekunder kommer laereren og taender udsugningen */
        var udenUdsugning = !this.udsugning && this.bromFremme();
        this.taage = NK.mod(this.taage, udenUdsugning ? 1 : 0, udenUdsugning ? 0.25 : 0.8, dt);
        if (udenUdsugning) {
            this.udenUdsugning += dt;
            if (this.udenUdsugning > 1.6 && this.laererUdsugning && this.laerer && !this.laerer.scene) {
                this.andreUheld++;
                this.iagttag("udsugning");
                this.besked("Bromdampene kommer ud i lokalet!", "advarsel");
                this.laererUdsugning();
            }
        } else {
            this.udenUdsugning = 0;
        }

        if (this.tidFart > 1) {
            this.tidFartUr -= dt;
            if (this.tidFartUr <= 0) { this.tidFart = 1; this.aendret("tid"); }
        }
        if (this.stor && (!this.stor.brom || this.stor.sted === "flytter")) this.stor = null;
        this.storAlfa = NK.mod(this.storAlfa, this.stor ? 1 : 0, 7, dt);


        /* Draabeflasken svaever over glasset lidt tid og gaar saa hjem */
        var d = g.agno3;
        if (d.svaev) {
            d.svaev.ur -= dt;
            if (d.svaev.ur <= 0 && !this.handling) {
                d.svaev = null;
                this.koer([hjemTil(d, 0.7, 40)], "hjem");
            }
        }

        /* Zoomboblen viser det valgte glas */
        var v = this.valgtGlas();
        var hn = this.handling ? this.handling.navn : "";
        var vis = (v.brom || v.hexan || v.alken) && hn !== "affald" && hn !== "toem";
        if (vis) this.bobleGlas = v;
        this.bobleAlfa = NK.mod(this.bobleAlfa, vis ? 1 : 0, 5, dt);

        this.haandAlfa = NK.mod(this.haandAlfa, this.rystKilde || this.holdt ? 1 : 0, 10, dt);

        this.opdaterEffekter(dt);

        var t = this.aktueltTrin();
        var id = t ? t.id : "slut";
        if (id !== this.sidsteTrin) { this.sidsteTrin = id; this.trinStart = this.tid; }
    };

    P.opdaterEffekter = function (dt) {
        var i, g = this.g;

        for (i = this.draaber.length - 1; i >= 0; i--) {
            var dr = this.draaber[i];
            dr.vy += 900 * dt;
            dr.y += dr.vy * dt;
            dr.x += (dr.vx || 0) * dt;
            if (dr.fysik) {
                if (dr.y > S.BORD - 1) this.draaber.splice(i, 1);
                continue;
            }
            var gl = dr.glas;
            var flade = gl.niveau !== null && gl.niveau !== undefined ? gl.niveau : NK.tilVerden(gl.p, gl.anker, 15, 150).y;
            if (dr.y >= flade) {
                this.draaber.splice(i, 1);
                this.draabeLander(dr);
            }
        }

        /* Proppen, der er sprunget af */
        ["prop1", "prop2"].forEach(function (navn) {
            var pr = g[navn];
            var f = pr.flyver;
            if (!f) return;
            f.vy += 900 * dt;
            pr.p.x += f.vx * dt;
            pr.p.y += f.vy * dt;
            pr.p.v += f.va * dt;
            if (pr.p.y >= S.BORD && f.vy > 0) {
                pr.p.y = S.BORD;
                f.vy = -f.vy * 0.3;
                f.vx *= 0.5;
                f.va *= 0.4;
                if (Math.abs(f.vy) < 40) {
                    pr.flyver = null;
                    pr.p.v = 0;
                    this.koerEfter([hjemTil(pr, 0.7, 40)], "hjem");
                }
            }
        }, this);

        if (this.pyt) {
            this.pyt.rx = NK.mod(this.pyt.rx, this.pyt.rxMaal, 3, dt);
        }

        /* Bromdampe fra aabne glas, den aabne flaske og pytten. Udsugningen
           suger dem opad. */
        var kilder = [];
        if (this.laagT > 0.5) kilder.push({ x: g.bromflaske.p.x, y: g.bromflaske.p.y - 2 });
        [g.glas1, g.glas2].forEach(function (gl) {
            if (gl.brom && !gl.prop && M.br2Tilbage(gl) > 0.05 && gl.sted !== "flytter") kilder.push({ x: gl.p.x, y: gl.p.y - 2 });
        });
        if (this.pyt && this.pyt.brom && this.pyt.vaad > 0.05) kilder.push({ x: this.pyt.x + r(-30, 30), y: S.BORD - 2 });
        /* Uden udsugning kommer der flere dampe, og de breder sig ud */
        this.dampUr -= dt;
        if (kilder.length && this.dampUr <= 0) {
            var spred = this.udsugning ? 1 : 4;
            this.dampUr = (this.udsugning ? 0.32 : 0.16) / kilder.length;
            var k = kilder[Math.floor(Math.random() * kilder.length)];
            this.dampe.push({ x: k.x + r(-6, 6), y: k.y, vx: r(-8, 8) * spred, vy: r(-22, -10), r: r(4, 8), liv: 0.9 });
            if (this.dampe.length > 120) this.dampe.shift();
        }
        for (i = this.dampe.length - 1; i >= 0; i--) {
            var p = this.dampe[i];
            if (this.udsugning) p.vy -= 40 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += dt * (this.udsugning ? 6 : 12);
            p.liv -= dt * (this.udsugning ? 0.45 : 0.18);
            if (p.liv <= 0 || p.y < 100) this.dampe.splice(i, 1);
        }
    };
}());
