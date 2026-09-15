/* =====================================================================
   forsoeg.js - selve forsoeget: tilstand, trin og handlinger

   100 mL vand i et baegerglas paa en varmeplade med magnetomroerer.
   Eleven afvejer ca. 0,100 g Pb(NO3)2 med spatlen paa vaegten og
   haelder det i, afvejer samme masse KI og haelder det i. Der dannes
   gult PbI2. Ved opvarmning forsvinder bundfaldet. Ved afkoeling kommer
   krystallerne igen (gyldne regn), og eleven noterer temperaturen, naar
   de foerste krystaller kommer. Med ca. 0,050 g mere af hvert stof
   maales igen, til der er tre punkter paa opløselighedskurven.

   En tilsaetning (this.tils) er Pb(NO3)2 og derefter KI. En maaling
   kan noteres, naar opløsningen har vaeret helt klar efter
   tilsaetningen, og der igen er kommet krystaller.

   Alle iagttagelser gemmes i logbogen med glassets tilstand, saa
   tegneserien kan tegne dem til sidst.

   Trinene (TRIN) er de syv ting, eleven skal naa. Et trin er gjort,
   naar tilstanden siger det, ikke naar en knap er trykket. Genstandene
   flyttes af smaa koreografier (koer): en liste af trin, der enten
   flytter en genstand, venter og goer noget undervejs, eller kalder en
   funktion. Mens en koreografi koerer, reagerer scenen ikke paa klik.

   Paaskeaeg: klikkes der hektisk paa et stofglas, mens spatlen er i
   gang, bliver pulveret spildt (graenserne staar i M.SPILD). Laereren
   kommer og toerrer op (laerer.js).

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
        { id: "vand", tekst: "Hæld 100 mL vand i bægerglasset", mark: "maaleglas",
          hint: "Klik på måleglasset. Det indeholder 100 mL vand." },
        { id: "pb", tekst: "Afvej ca. 0,100 g Pb(NO₃)₂, og hæld det i vandet", mark: "pbGlas",
          hint: "Klik på glasset med Pb(NO₃)₂. En spatelspids er 0,04 til 0,06 g. Vægten skal vise mellem 0,090 og 0,110 g. For meget tages af med spatlen. Klik så på vejebåden." },
        { id: "ki", tekst: "Afvej samme masse KI, og hæld det i", mark: "kiGlas",
          hint: "Klik på glasset med KI, til vægten viser samme masse som Pb(NO₃)₂, højst 0,010 g fra. For meget tages af med spatlen. Klik så på vejebåden." },
        { id: "klar", tekst: "Varm op under omrøring, til bundfaldet er væk", mark: "varme",
          hint: "Tænd for varmen og omrøringen med knapperne på varmepladen. Hold øje med glasset og luppen." },
        { id: "maal1", tekst: "Sluk varmen, og notér temperaturen, når der kommer krystaller", mark: "varme",
          hint: "Sluk for varmen og omrøringen. Klik på termometret, så snart de første krystaller kommer." },
        { id: "maal3", tekst: "Tilsæt ca. 0,050 g af hvert stof, og mål igen, til der er tre målinger", mark: "pbGlas",
          hint: "Afvej ca. 0,050 g Pb(NO₃)₂ og samme masse KI, og hæld dem i. Varm op, til bundfaldet er væk, sluk varmen, og notér temperaturen, når der kommer krystaller." },
        { id: "affald", tekst: "Aflever resterne", mark: "dunk",
          hint: "Resterne indeholder bly. Klik på dunken til tungmetalaffald." }
    ];
    NK.TRIN = TRIN;

    var IAGTTAGELSER = {
        vand:        { tekst: "Vandet er klart og farveløst.", farve: null },
        pulver:      { tekst: "Pb(NO₃)₂ og KI er hvide, faste stoffer.", farve: { r: 244, g: 243, b: 238, a: 1 } },
        pb_oploest:  { tekst: "Pb(NO₃)₂ opløses i vandet. Opløsningen er klar og farveløs.", farve: null },
        bundfald:    { tekst: "Når KI kommer i, dannes der straks et gult bundfald.", farve: M.FARVE.pbi2 },
        intet:       { tekst: "Der dannes intet bundfald, når KI kommer i. Opløsningen er klar.", farve: null },
        klar:        { tekst: "Ved opvarmning forsvinder bundfaldet, og opløsningen bliver klar og farveløs.", farve: null },
        regn:        { tekst: "Ved afkøling kommer der glinsende, gule krystaller, der daler ned gennem væsken.", farve: M.FARVE.pbi2 },
        koger:       { tekst: "Vandet koger, men der er stadig bundfald.", farve: M.FARVE.pbi2 },
        maaling:     { tekst: "Måling {n}: de første krystaller kom ved {T} °C.", farve: null },
        kurve:       { tekst: "De tre punkter ligger på opløselighedskurven for PbI₂.", farve: null },
        kurve_afvig: { tekst: "Nogle punkter ligger langt fra kurven. Temperaturen skal noteres, lige når de første krystaller kommer.", farve: null },
        spild:       { tekst: "Der blev spildt {stof} på bordet.", farve: { r: 244, g: 243, b: 238, a: 1 } },
        varmt:       { tekst: "Bægerglasset blev taget op over 50 °C, og der skvulpede lidt ud.", farve: { r: 240, g: 206, b: 90, a: 1 } },
        affald:      { tekst: "Resterne er afleveret som tungmetalaffald.", farve: null }
    };
    NK.IAGTTAGELSER = IAGTTAGELSER;

    var STOFNAVN = { pb: "Pb(NO₃)₂", ki: "KI" };

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

    /* ----- Nulstilling ------------------------------------------------ */
    P.nulstil = function () {
        this.gjort = {};
        this.iagttaget = {};
        this.logbog = [];
        this.trinStart = this.tid;
        this.sidsteTrin = "";
        this.urMinutter = M.UR.start;

        var g = this.g = {
            pbGlas:     genstand("pbGlas", "pbGlas", S.HJEM.pbGlas),
            kiGlas:     genstand("kiGlas", "kiGlas", S.HJEM.kiGlas),
            vejebaad:   genstand("vejebaad", "vejebaad", S.HJEM.vejebaad),
            spatel:     genstand("spatel", "spatel", S.HJEM.spatel),
            maaleglas:  genstand("maaleglas", "maaleglas", S.HJEM.maaleglas),
            baegerglas: genstand("baegerglas", "baegerglas", S.HJEM.baegerglas),
            kaffekop:   genstand("kaffekop", "kaffekop", S.HJEM.kaffekop)
        };
        g.pbGlas.laagT = 0;
        g.kiGlas.laagT = 0;
        g.vejebaad.masse = 0;
        g.vejebaad.stof = null;
        g.spatel.last = false;
        g.spatel.svaev = null;
        g.maaleglas.vandAreal = M.VAND.mL * S.MAALE_PR_ML;
        g.kaffekop.skjult = this.koppenVaek;

        this.b = {
            vand: false, vandAreal: 0, niveau: null,
            pb: 0, ki: 0, fast: 0, T: M.VAND.stue, koger: false, blanding: 0,
            uklar: 0, bundlag: 0, flager: [], bobler: [], harVaeretKlar: false
        };
        this.tils = null;
        this.maalinger = [];
        this.tilsaetninger = [];
        this.mikro = new NK.Mikro();
        this.mikroPb = 0;
        this.mikroKI = 0;

        this.varme = false;
        this.omroer = false;
        this.effekt = 0;
        this.omroerFart = 0;
        this.spin = 0;
        this.vinkelVarme = -2.3;
        this.vinkelOmroer = -2.3;
        this.foelerLoeft = 0;
        this.kogeTid = 0;
        this.kogeSagt = false;

        this.handling = null;
        this.hover = null;
        this.mark = null;
        this.hast = [];
        this.straale = null;
        this.korn = [];
        this.dampe = [];
        this.dampUr = 0;
        this.bobleUr = 0;
        this.spild = null;
        this.skvulp = null;
        this.bobleAlfa = 0;
        if (this.laererNyt) this.laererNyt();
        if (NK.Lyd) NK.Lyd.omroering(false);
        this.aendret("nulstil");
    };

    /* ----- Til panelet ------------------------------------------------ */
    P.trinGjort = function (id) {
        var gj = this.gjort, n = this.maalinger.length, t = this.tils;
        switch (id) {
            case "vand": return !!gj.vand;
            case "pb": return n > 0 || !!(t && t.pb !== null) || !!gj.affald;
            case "ki": return n > 0 || !!(t && t.ki !== null) || !!gj.affald;
            case "klar": return n > 0 || !!(t && t.klarSet) || !!gj.affald;
            case "maal1": return n >= 1;
            case "maal3": return n >= 3;
            default: return !!gj[id];
        }
    };

    P.aktueltTrin = function () {
        for (var i = 0; i < TRIN.length; i++) if (!this.trinGjort(TRIN[i].id)) return TRIN[i];
        return null;
    };

    P.maalingerFaerdige = function () {
        return this.maalinger.length >= 3;
    };

    P.travl = function () {
        return !!(this.handling || (this.laererOptaget && this.laererOptaget()));
    };

    /* Kan temperaturen noteres nu? */
    P.kanNotere = function () {
        var t = this.tils;
        return !!(t && t.ki !== null && !t.noteret && t.klarSet && this.b.fast > 1e-6 && !this.handling);
    };

    /* Den masse Pb(NO3)2, der skal afvejes nu */
    P.maalMasse = function () {
        return this.b.pb < 0.001 ? M.SPATEL.foerste : M.SPATEL.senere;
    };

    function tre(x) {
        return Math.round(x * 1000) / 1000;
    }

    /* Hint til det aktuelle trin. Genstanden, det handler om, faar en
       pulserende ramme i fem sekunder. */
    P.hint = function () {
        var trin = this.aktueltTrin();
        if (!trin) return null;
        var mark = trin.mark, tekst = trin.hint;
        var baad = this.g.vejebaad, t = this.tils, b = this.b;
        switch (trin.id) {
            case "pb":
                if (baad.stof === "pb") mark = this.baadMark(this.maalMasse(), M.SPATEL.tolerance, "pbGlas");
                break;
            case "ki":
                if (baad.stof === "ki") mark = this.baadMark(t.pb, M.SPATEL.forskel, "kiGlas");
                break;
            case "klar":
                mark = this.varme ? (this.omroer ? "baegerglas" : "omroer") : "varme";
                break;
            case "maal1":
            case "maal3":
                if (b.koger && b.fast > 1e-6) {
                    tekst = "Der er for meget stof til 100 mL vand. Start forfra, og brug mindre.";
                    mark = null;
                } else if (!t || t.ki === null || t.noteret) {
                    if (baad.stof === "pb") mark = this.baadMark(this.maalMasse(), M.SPATEL.tolerance, "pbGlas");
                    else if (baad.stof === "ki") mark = this.baadMark(t.pb, M.SPATEL.forskel, "kiGlas");
                    else mark = t && t.pb !== null && t.ki === null ? "kiGlas" : "pbGlas";
                } else if (!t.klarSet) {
                    tekst = "Varm op under omrøring, til bundfaldet er væk.";
                    mark = this.varme ? "baegerglas" : "varme";
                } else if (this.varme) {
                    tekst = "Sluk for varmen. Klik på termometret, så snart de første krystaller kommer.";
                    mark = "varme";
                } else {
                    tekst = "Hold øje med glasset og luppen. Klik på termometret, så snart de første krystaller kommer.";
                    mark = "termometer";
                }
                break;
            case "affald":
                if (b.T > 50) {
                    tekst = "Bægerglasset skal køle af til under 50 °C, før det kan tømmes. Sluk varmen.";
                    mark = this.varme ? "varme" : "termometer";
                }
                break;
        }
        if (mark) this.markér(mark, 5);
        return tekst;
    };

    /* Hvad skal markeres, naar der ligger stof paa vejebaaden? */
    P.baadMark = function (maal, tol, glas) {
        var m = tre(this.g.vejebaad.masse);
        if (m > maal + tol + 1e-9) return "spatel";
        if (m < maal - tol - 1e-9) return glas;
        return "vejebaad";
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

    /* erstat: { n, T, stof } saettes ind i teksten */
    P.iagttag = function (noegle, erstat) {
        var id = noegle + (erstat && erstat.n ? erstat.n : "");
        if (this.iagttaget[id]) return;
        this.iagttaget[id] = true;
        var i = IAGTTAGELSER[noegle];
        var tekst = i.tekst;
        if (erstat) {
            tekst = tekst.replace("{n}", erstat.n).replace("{T}", erstat.T).replace("{stof}", erstat.stof);
        }
        var b = this.b;
        this.logbog.push({
            noegle: noegle, tekst: tekst, n: erstat ? erstat.n : null, stof: erstat ? erstat.stof : null,
            T: b.T, pb: b.pb, ki: b.ki, fast: b.fast, varme: this.varme, omroer: this.omroer
        });
        if (this.vedIagttagelse) this.vedIagttagelse({ noegle: noegle, tekst: tekst, farve: i.farve });
    };

    /* ----- Koreografier ------------------------------------------------ */
    P.koer = function (liste, navn) {
        this.handling = { liste: liste, i: 0, t: 0, navn: navn || "" };
        this.aendret("handling");
    };

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
        if (this.laererOptaget && this.laererOptaget()) return false;
        if ((navn === "pbGlas" || navn === "kiGlas") && this.handling && this.handling.navn === "doser") {
            this.registrerHast(navn);
            return false;
        }
        if (this.handling) return false;
        switch (navn) {
            case "kaffekop": return this.klikKop ? this.klikKop() : false;
            case "maaleglas": return this.proevVand();
            case "pbGlas": return this.proevDoser("pb");
            case "kiGlas": return this.proevDoser("ki");
            case "vejebaad": case "vaegt": return this.proevVejebaad();
            case "spatel": return this.proevSpatel();
            case "varme": return this.skiftVarme();
            case "omroer": return this.skiftOmroer();
            case "termometer": return this.noter();
            case "dunk": return this.proevAffald();
            case "baegerglas":
                this.besked(this.b.vand ? "Bægerglasset står på varmepladen. Brug knapperne på varmepladen." : "Bægerglasset er tomt. Klik på måleglasset.");
                if (!this.b.vand) this.markér("maaleglas");
                return false;
            case "varmeplade":
                this.besked("Brug knapperne: varme til venstre, omrøring til højre.");
                return false;
        }
        return false;
    };

    /* ----- Vand ------------------------------------------------------- */
    P.proevVand = function () {
        if (this.b.vand) { this.besked("Der er allerede vand i bægerglasset."); return false; }
        if (this.gjort.affald) { this.besked("Forsøget er slut. Start forfra for at prøve igen."); return false; }
        this.haeldVand();
        return true;
    };

    P.haeldVand = function () {
        var mg = this.g.maaleglas, b = this.b;
        var fuld = mg.vandAreal;
        this.koer([
            { flyt: mg, til: S.HAELD_VAND, tid: 1.0, loeft: 50 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(1.6); } },
            { tid: 1.6, hver: function (t) {
                var e = NK.blod(t);
                mg.vandAreal = fuld * (1 - e);
                b.vandAreal = M.VAND.mL * S.BAEGER_PR_ML * e;
                var fra = NK.tilVerden(mg.p, mg.anker, 31, 5);
                this.straale = { fra: fra, til: { x: fra.x + 10, y: b.niveau === null ? 418 : b.niveau }, farve: { r: 200, g: 228, b: 245, a: 0.6 }, bredde: 3 };
            } },
            { kald: function () {
                this.straale = null;
                mg.vandAreal = 0;
                b.vand = true;
                b.vandAreal = M.VAND.mL * S.BAEGER_PR_ML;
                this.gjort.vand = true;
                this.iagttag("vand");
                this.aendret("vand");
            } },
            hjemTil(mg, 1.0, 50)
        ], "vand");
    };

    /* ----- Afvejning --------------------------------------------------- */
    P.proevDoser = function (stof) {
        var baad = this.g.vejebaad, t = this.tils, b = this.b;
        if (this.gjort.affald) { this.besked("Forsøget er slut. Start forfra for at prøve igen."); return false; }
        if (!b.vand) { this.besked("Hæld vand i bægerglasset først."); this.markér("maaleglas"); return false; }
        if (stof === "pb") {
            if (t && t.pb !== null && t.ki === null) { this.besked("Afvej nu samme masse KI."); this.markér("kiGlas"); return false; }
            if (baad.stof === "ki") { this.besked("Hæld først KI fra vejebåden i bægerglasset."); this.markér("vejebaad"); return false; }
            if (baad.masse > this.maalMasse() + 0.03) {
                this.besked("Der er allerede for meget på vejebåden. Klik på spatlen for at tage lidt af.", "advarsel");
                this.markér("spatel");
                return false;
            }
            if (b.pb + baad.masse + M.SPATEL.gram > M.SPATEL.maksPb + 0.01) {
                this.besked("Der kan ikke opløses mere Pb(NO₃)₂ i 100 mL vand, selv når det koger.", "advarsel");
                return false;
            }
        } else {
            if (!t || t.pb === null || t.ki !== null) {
                this.besked(baad.stof === "pb" ? "Hæld først Pb(NO₃)₂ fra vejebåden i bægerglasset." : "Afvej Pb(NO₃)₂ først.");
                this.markér(baad.stof === "pb" ? "vejebaad" : "pbGlas");
                return false;
            }
            if (baad.masse > t.pb + 0.03) {
                this.besked("Der er allerede for meget på vejebåden. Klik på spatlen for at tage lidt af.", "advarsel");
                this.markér("spatel");
                return false;
            }
        }
        this.doser(stof);
        return true;
    };

    P.doser = function (stof) {
        var glas = this.g[stof === "pb" ? "pbGlas" : "kiGlas"];
        var andet = this.g[stof === "pb" ? "kiGlas" : "pbGlas"];
        var sp = this.g.spatel, baad = this.g.vejebaad;
        var liste = [];
        sp.svaev = null;
        if (andet.laagT > 0) {
            liste.push({ tid: 0.3, hver: function (t) { andet.laagT = Math.min(andet.laagT, 1 - t); } });
        }
        if (glas.laagT < 1) {
            liste.push({ tid: 0.35, hver: function (t) { glas.laagT = Math.max(glas.laagT, t); } });
        }
        liste.push({ flyt: sp, til: { x: glas.p.x + 6, y: glas.p.y - 30, v: -0.7 }, tid: 0.45, loeft: 30 });
        liste.push({ flyt: sp, til: { x: glas.p.x + 2, y: glas.p.y + 16, v: -0.95 }, tid: 0.2, loeft: 0 });
        liste.push({ kald: function () { sp.last = true; if (NK.Lyd) NK.Lyd.drys(0.12); } });
        liste.push({ flyt: sp, til: S.OVER_BAAD, tid: 0.5, loeft: 36 });
        liste.push({ kald: function () {
            sp.last = false;
            for (var i = 0; i < 14; i++) this.korn.push({ x: sp.p.x + r(-5, 5), y: sp.p.y + r(-2, 2), vx: r(-12, 12), vy: r(0, 30), liv: 1, til: "baad" });
            if (NK.Lyd) NK.Lyd.drys(0.3);
        } });
        liste.push({ tid: 0.3, hver: function (t) { sp.p.v = S.OVER_BAAD.v + Math.sin(t * Math.PI * 4) * 0.12; } });
        liste.push({ kald: function () {
            baad.masse += r(M.SPATEL.min, M.SPATEL.maks);
            baad.stof = stof;
            sp.svaev = { stof: stof, ur: 1.8 };
            if (NK.Lyd) NK.Lyd.bip();
            this.iagttag("pulver");
            this.aendret("doser");
        } });
        this.koer(liste, "doser");
    };

    /* Spatlen gaar hjem, og laagene kommer paa */
    P.spatelHjemListe = function () {
        var sp = this.g.spatel, g = this.g;
        sp.svaev = null;
        var pbT = g.pbGlas.laagT, kiT = g.kiGlas.laagT;
        return [
            { flyt: sp, til: sp.hjem, tid: 0.6, loeft: 30, hver: function (t) {
                g.pbGlas.laagT = Math.min(g.pbGlas.laagT, pbT * (1 - t));
                g.kiGlas.laagT = Math.min(g.kiGlas.laagT, kiT * (1 - t));
            } }
        ];
    };

    P.registrerHast = function (navn) {
        var n = this.antalUheld;
        if (n >= M.SPILD.MAKS_UHELD) return;
        var nu = this.tid;
        this.hast.push(nu);
        this.hast = this.hast.filter(function (t) { return nu - t <= M.SPILD.TID; });
        if (this.hast.length >= M.SPILD.KLIK[n]) this.spildPulver(navn === "pbGlas" ? "pb" : "ki");
    };

    /* Paaskeaegget: pulveret ryger ud over bordet */
    P.spildPulver = function (stof) {
        var sp = this.g.spatel;
        var i;
        this.antalUheld++;
        this.hast = [];
        this.handling = null;
        sp.last = false;
        for (i = 0; i < 40; i++) {
            this.korn.push({ x: sp.p.x + r(-6, 6), y: sp.p.y, vx: r(-120, 120), vy: -r(40, 220), liv: 1, til: "bord" });
        }
        this.spild = { x: NK.klamp(sp.p.x, 90, 330), rx: 4, rxMaal: 30, alfa: 1, stof: stof };
        if (NK.Lyd) NK.Lyd.plask();
        this.iagttag("spild", { stof: STOFNAVN[stof], n: this.antalUheld });
        this.besked("Pulveret blev spildt ud over bordet.", "advarsel");
        this.koer(this.spatelHjemListe(), "hjem");
        if (this.laererSpild) this.laererSpild(stof);
        this.aendret("spild");
    };

    /* ----- Vejebaaden ---------------------------------------------------- */
    P.proevVejebaad = function () {
        var baad = this.g.vejebaad, t = this.tils;
        if (baad.masse < 0.004) {
            this.besked("Vejebåden er tom. Klik på et glas med stof.");
            this.markér(t && t.pb !== null && t.ki === null ? "kiGlas" : "pbGlas");
            return false;
        }
        var m = tre(baad.masse);
        if (baad.stof === "pb") {
            var maal = this.maalMasse(), tol = M.SPATEL.tolerance;
            if (Math.abs(m - maal) > tol + 1e-9) {
                this.besked("Afvej ca. " + M.komma(maal, 3) + " g Pb(NO₃)₂, mellem " + M.komma(maal - tol, 3) + " og " + M.komma(maal + tol, 3) + " g.", "advarsel");
                this.markér(m > maal ? "spatel" : "pbGlas");
                return false;
            }
        } else if (Math.abs(m - t.pb) > M.SPATEL.forskel + 1e-9) {
            this.besked("KI skal have samme masse som Pb(NO₃)₂: " + M.komma(t.pb, 3) + " g, højst " + M.komma(M.SPATEL.forskel, 3) + " g fra.", "advarsel");
            this.markér(m > t.pb ? "spatel" : "kiGlas");
            return false;
        }
        this.haeldBaad();
        return true;
    };

    P.haeldBaad = function () {
        var baad = this.g.vejebaad, b = this.b;
        var start = tre(baad.masse), stof = baad.stof;
        var liste = this.g.spatel.svaev || this.g.pbGlas.laagT > 0 || this.g.kiGlas.laagT > 0 ? this.spatelHjemListe() : [];
        liste.push({ flyt: baad, til: S.HAELD_BAAD, tid: 0.8, loeft: 40 });
        liste.push({ kald: function () { if (NK.Lyd) NK.Lyd.drys(0.8); } });
        liste.push({ tid: 0.8, hver: function (t) {
            baad.masse = start * (1 - NK.blod(t));
            if (Math.random() < 0.9) {
                var laebe = NK.tilVerden(baad.p, baad.anker, 57, 4);
                for (var i = 0; i < 3; i++) this.korn.push({ x: laebe.x + r(-2, 2), y: laebe.y + r(-1, 1), vx: r(-8, 8), vy: r(10, 40), liv: 1, til: "glas" });
            }
        } });
        liste.push({ kald: function () {
            baad.masse = 0;
            baad.stof = null;
            if (stof === "pb") {
                b.pb += start;
                this.tils = { pb: start, ki: null, bundfaldSet: false, klarSet: false, forsvundet: false, noteret: false };
                var nPb = Math.round(b.pb / M.MIKRO.gramPrEnhed) - this.mikroPb;
                if (nPb > 0) { this.mikro.tilfoejPb(nPb); this.mikroPb += nPb; }
                this.iagttag("pb_oploest");
            } else {
                b.ki += start;
                this.tils.ki = start;
                this.tilsaetninger.push({ pb: this.tils.pb, ki: start });
                b.blanding = 1.5;
                var nKI = Math.round(b.ki / M.MIKRO.gramPrEnhed) - this.mikroKI;
                if (nKI > 0) { this.mikro.tilfoejKI(nKI); this.mikroKI += nKI; }
            }
            this.aendret("haeldt");
        } });
        liste.push(hjemTil(baad, 0.8, 40));
        liste.push({ kald: function () { if (NK.Lyd) NK.Lyd.bip(); } });
        this.koer(liste, "baad");
    };

    /* ----- Spatlen tager en portion af igen ------------------------------ */
    P.proevSpatel = function () {
        var baad = this.g.vejebaad;
        if (baad.masse < 0.004) {
            this.besked("Klik på et glas med stof for at bruge spatlen.");
            return false;
        }
        var sp = this.g.spatel;
        var liste = [];
        liste.push({ flyt: sp, til: { x: baad.p.x - 4, y: baad.p.y - 12, v: -0.3 }, tid: 0.55, loeft: 30 });
        liste.push({ kald: function () {
            sp.last = true;
            baad.masse = Math.max(0, baad.masse - r(M.SPATEL.fjernMin, M.SPATEL.fjernMaks));
            if (baad.masse < 0.002) { baad.masse = 0; baad.stof = null; }
            if (NK.Lyd) NK.Lyd.bip();
            this.aendret("fjern");
        } });
        liste.push({ flyt: sp, til: S.SPATEL_DUNK, tid: 1.0, loeft: 70 });
        liste.push({ kald: function () {
            sp.last = false;
            for (var i = 0; i < 10; i++) this.korn.push({ x: sp.p.x + r(-4, 4), y: sp.p.y, vx: r(-8, 8), vy: r(10, 30), liv: 1, til: "dunk" });
            if (NK.Lyd) NK.Lyd.drys(0.25);
        } });
        liste = liste.concat(this.spatelHjemListe());
        this.koer(liste, "fjern");
        return true;
    };

    /* ----- Varmepladen ---------------------------------------------------- */
    P.skiftVarme = function () {
        if (!this.varme && !this.b.vand) {
            this.besked("Bægerglasset er tomt. Hæld vand i først.");
            this.markér("maaleglas");
            return false;
        }
        this.varme = !this.varme;
        if (NK.Lyd) NK.Lyd.kontakt();
        if (this.varme && this.omroer) this.gjort.varm = true;
        if (this.varme && !this.omroer) this.besked("Varmen er tændt. Tænd også omrøringen.");
        else this.besked(this.varme ? "Varmen er tændt." : "Varmen er slukket.");
        this.aendret("varme");
        return true;
    };

    P.skiftOmroer = function () {
        if (!this.omroer && !this.b.vand) {
            this.besked("Bægerglasset er tomt. Hæld vand i først.");
            this.markér("maaleglas");
            return false;
        }
        this.omroer = !this.omroer;
        if (NK.Lyd) { NK.Lyd.kontakt(); NK.Lyd.omroering(this.omroer); }
        if (this.varme && this.omroer) this.gjort.varm = true;
        this.besked(this.omroer ? "Omrøringen er tændt." : "Omrøringen er slukket.");
        this.aendret("omroer");
        return true;
    };

    /* ----- Notér temperaturen --------------------------------------------- */
    P.noter = function () {
        var t = this.tils, b = this.b;
        if (this.handling) return false;
        if (!b.vand) { this.besked("Bægerglasset er tomt."); return false; }
        if (!t || t.ki === null) {
            this.besked(t && t.pb !== null ? "Afvej og hæld KI i først." : "Hæld Pb(NO₃)₂ og KI i vandet først.");
            this.markér(t && t.pb !== null ? "kiGlas" : "pbGlas");
            return false;
        }
        if (t.noteret) { this.besked("Temperaturen er noteret. Tilsæt mere stof for en ny måling."); return false; }
        if (!t.klarSet) {
            this.besked("Varm først op under omrøring, til bundfaldet er væk.");
            this.markér(this.varme ? "omroer" : "varme");
            return false;
        }
        if (b.fast <= 1e-6) {
            this.besked(this.varme ? "Der er ingen krystaller. Sluk for varmen, og lad glasset køle af." : "Der er ingen krystaller endnu.");
            if (this.varme) this.markér("varme");
            return false;
        }
        var T = Math.round(b.T * 10) / 10;
        var m = { nr: this.maalinger.length + 1, pb: b.pb, ki: b.ki, pbi2: M.pbi2Masse(b.pb, b.ki), T: T };
        this.maalinger.push(m);
        t.noteret = true;
        if (NK.Lyd) NK.Lyd.succes();
        this.besked("Temperaturen er noteret: " + M.komma(T, 1) + " °C.", "god");
        this.iagttag("maaling", { n: m.nr, T: M.komma(T, 1) });
        if (this.maalinger.length === 3) {
            var mig = this;
            var afvig = this.maalinger.some(function (x) { return mig.afvigelse(x) > 6; });
            this.iagttag(afvig ? "kurve_afvig" : "kurve");
            if (this.laererRos) this.laererRos(!afvig);
        }
        this.aendret("maaling");
        return true;
    };

    /* Hvor mange grader maalingen ligger fra kurven */
    P.afvigelse = function (m) {
        return Math.abs(m.T - M.maetningsTemp(m.pbi2));
    };

    /* ----- Affald --------------------------------------------------------- */
    P.proevAffald = function () {
        var b = this.b;
        if (this.gjort.affald) { this.besked("Resterne er afleveret."); return false; }
        if (!this.maalingerFaerdige()) { this.besked("Lav tre målinger først."); return false; }
        if (b.T > 50) {
            this.varmtGlas();
            return true;
        }
        this.aflever();
        return true;
    };

    /* Uheld: glasset er over 50 °C, da eleven tager fat i det. Haanden
       rykker til, der skvulper lidt ud paa bordet, og glasset lander paa
       varmepladen igen. Laereren toerrer op (laerer.js). */
    P.varmtGlas = function () {
        var bg = this.g.baegerglas, b = this.b;
        var start = b.vandAreal;
        var farve = b.fast > 0.002 ? { r: 240, g: 206, b: 90, a: 0.8 } : { r: 200, g: 228, b: 245, a: 0.7 };
        this.koer([
            { flyt: bg, til: { x: bg.hjem.x + 8, y: bg.hjem.y - 24, v: 0.14 }, tid: 0.25, loeft: 0 },
            { kald: function () {
                b.vandAreal = start * 0.92;
                this.skvulp = { x: 590, rx: 6, rxMaal: 32, alfa: 1, farve: farve };
                for (var i = 0; i < 8; i++) this.dampe.push({ x: bg.p.x + r(-30, 30), y: bg.p.y - 4, vx: r(-20, 20), vy: -r(30, 60), r: r(6, 11), liv: 1 });
                if (NK.Lyd) NK.Lyd.plask();
                this.iagttag("varmt");
                this.besked("Av! Glasset er over 50 °C.", "advarsel");
                if (this.laererVarmt) this.laererVarmt();
                this.aendret("varmt");
            } },
            { tid: 0.3, hver: function (t) { bg.p.v = (1 - t) * (0.14 + Math.sin(t * 20) * 0.05); } },
            { flyt: bg, til: bg.hjem, tid: 0.3, loeft: 0 }
        ], "varmt");
    };

    P.aflever = function () {
        var bg = this.g.baegerglas, b = this.b;
        var d = S.DUNK.aabning;
        var startAreal = b.vandAreal, farve;
        this.koer([
            { kald: function () {
                if (this.varme) { this.varme = false; if (NK.Lyd) NK.Lyd.kontakt(); }
                if (this.omroer) { this.omroer = false; if (NK.Lyd) NK.Lyd.omroering(false); }
            } },
            { tid: 0.7, hver: function (t) { this.foelerLoeft = NK.blod(t); } },
            { kald: function () { b.flytter = true; b.flager = []; b.bobler = []; b.bundlag = 0; } },
            { flyt: bg, til: S.HAELD_DUNK, tid: 1.1, loeft: 70 },
            { kald: function () {
                farve = b.fast > 0.002 ? { r: 240, g: 206, b: 90, a: 0.8 } : { r: 200, g: 228, b: 245, a: 0.6 };
                if (NK.Lyd) NK.Lyd.haeld(1.2);
            } },
            { tid: 1.2, hver: function (t) {
                b.vandAreal = startAreal * (1 - NK.blod(t));
                this.straale = { fra: NK.tilVerden(bg.p, bg.anker, 106, 6), til: { x: d.x, y: d.y + 6 }, farve: farve, bredde: 3.5 };
            } },
            { kald: function () {
                this.straale = null;
                b.vand = false;
                b.vandAreal = 0;
                b.pb = 0; b.ki = 0; b.fast = 0; b.uklar = 0;
                this.tils = null;
                this.mikro.toem();
                this.mikroPb = 0;
                this.mikroKI = 0;
                if (NK.Lyd) NK.Lyd.dunk();
            } },
            hjemTil(bg, 1.1, 70),
            { kald: function () { b.flytter = false; } },
            { tid: 0.7, hver: function (t) { this.foelerLoeft = 1 - NK.blod(t); } },
            { kald: function () {
                this.gjort.affald = true;
                this.iagttag("affald");
                this.besked("Resterne er afleveret. Forsøget er slut.", "god");
                if (NK.Lyd) NK.Lyd.succes();
                this.aendret("affald");
            } }
        ], "affald");
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdater = function (dt) {
        var i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        this.urMinutter += dt * M.UR.minPerSek;
        var b = this.b, t = this.tils;

        this.opdaterHandling(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);

        /* Varmepladen og omroeringen */
        this.effekt = NK.mod(this.effekt, this.varme ? 1 : 0, 1 / M.VARME.tau, dt);
        this.omroerFart = NK.mod(this.omroerFart, this.omroer && b.vand ? 1 : 0, 3, dt);
        this.spin += this.omroerFart * 26 * dt;
        this.vinkelVarme = NK.mod(this.vinkelVarme, this.varme ? 0.9 : -2.3, 10, dt);
        this.vinkelOmroer = NK.mod(this.vinkelOmroer, this.omroer ? 0.9 : -2.3, 10, dt);
        if (this.mark) { this.mark.ur -= dt; if (this.mark.ur <= 0) this.mark = null; }

        /* Temperaturen og bundfaldet */
        var foerFast = b.fast;
        M.skridtTemp(b, dt, b.vand && !b.flytter ? this.effekt : 0);
        if (b.vand) M.skridtBundfald(b, dt, this.omroer);
        if (b.blanding > 0) b.blanding -= dt;

        if (t && t.ki !== null) {
            if (b.fast > 1e-6) {
                if (!t.bundfaldSet && b.blanding > 0) this.iagttag("bundfald");
                t.bundfaldSet = true;
            }
            /* Klar: bundfaldet er opløst igen, eller der kom aldrig noget,
               fordi glasset var varmt, da KI kom i */
            var klar = b.fast <= 1e-6 && (t.bundfaldSet || b.blanding <= 0);
            if (klar && !t.klarSet) {
                t.klarSet = true;
                if (t.bundfaldSet) this.iagttag("klar");
                this.aendret("klar");
            }
            if (klar !== t.forsvundet) {
                t.forsvundet = klar;
                this.aendret("klar");
            }
            if (b.blanding <= 0 && b.blanding > -dt * 1.5 && !t.bundfaldSet) this.iagttag("intet");
        }

        /* Gyldne regn: krystaller kommer igen ved afkoeling */
        if (foerFast <= 1e-6 && b.fast > 1e-6 && b.blanding <= 0 && t && t.klarSet) {
            if (!this.gjort.regn) {
                this.gjort.regn = true;
                this.iagttag("regn");
                this.aendret("regn");
            }
            if (NK.Lyd) NK.Lyd.glimt();
        }

        /* Kogning */
        if (b.koger) {
            this.kogeTid += dt;
            if (b.fast > 1e-6 && this.kogeTid > 2) {
                if (!this.iagttaget.koger) this.besked("Vandet koger, men bundfaldet forsvinder ikke. Der er for meget stof i 100 mL vand.", "advarsel");
                this.iagttag("koger");
            }
            if (this.kogeTid > 6 && !this.kogeSagt) {
                this.kogeSagt = true;
                if (this.laererKoger) this.laererKoger();
            }
        } else {
            this.kogeTid = 0;
            if (b.T < 95) this.kogeSagt = false;
        }

        /* Partikelmodellen */
        var mulige = this.mikro.muligeEnheder();
        var pbi2 = M.pbi2Masse(b.pb, b.ki);
        var maal = b.fast <= 1e-6 || pbi2 <= 0 ? 0 : Math.max(1, Math.min(mulige, Math.round(mulige * b.fast / pbi2)));
        this.mikro.opdater(dt, { T: b.T, maal: maal, omroer: this.omroer });

        /* Spatlen svaever lidt tid over vejebaaden og gaar saa hjem */
        var sp = this.g.spatel;
        if (sp.svaev) {
            sp.svaev.ur -= dt;
            if (sp.svaev.ur <= 0 && !this.handling) this.koer(this.spatelHjemListe(), "hjem");
        }

        /* Zoomboblen */
        var hn = this.handling ? this.handling.navn : "";
        var vis = b.vand && hn !== "affald";
        this.bobleAlfa = NK.mod(this.bobleAlfa, vis ? 1 : 0, 5, dt);

        this.opdaterGlas(dt);
        this.opdaterEffekter(dt);

        var trin = this.aktueltTrin();
        var id = trin ? trin.id : "slut";
        if (id !== this.sidsteTrin) { this.sidsteTrin = id; this.trinStart = this.tid; }
        void i;
    };

    /* Uklarhed, bundlag, krystaller og kogebobler i baegerglasset (lokale
       koordinater i spritet) */
    P.opdaterGlas = function (dt) {
        var b = this.b, i, f;
        var omroer = this.omroerFart;
        var top = 126 - M.VAND.mL * 0.46 + 3;
        var fastAndel = NK.klamp(b.fast / 0.08, 0, 1);

        var uklarMaal = b.fast > 1e-6 ? Math.min(0.9, 0.2 + 0.7 * fastAndel) * (0.35 + 0.65 * omroer) + (b.blanding > 0 ? 0.3 : 0) : 0;
        b.uklar = NK.mod(b.uklar, uklarMaal, b.fast > 1e-6 ? 1.5 : 4, dt);
        var bundMaal = b.fast > 1e-6 ? (1 - omroer) * (2.5 + NK.klamp(b.fast / 0.2, 0, 1) * 10) : 0;
        b.bundlag = NK.mod(b.bundlag, bundMaal, b.fast > 1e-6 ? 1.2 : 3, dt);

        /* Krystallerne */
        var antal = b.fast > 1e-6 && b.vand && !b.flytter ? Math.min(80, 5 + Math.round(b.fast * 400)) : 0;
        var levende = 0;
        for (i = 0; i < b.flager.length; i++) if (!b.flager[i].doed) levende++;
        while (levende < antal) {
            var nyBlanding = b.blanding > 0;
            b.flager.push({
                x: r(14, 98), y: nyBlanding ? r(top, top + 16) : r(top + 6, 116),
                a: r(0, 6.28), s: r(1.8, 3.6), alfa: 0, fart: r(1.5, 4.5), fase: r(0, 6.28),
                vy: r(5, 11), rx: r(8, 42), theta: r(0, 6.28), ymaal: r(top + 8, 118)
            });
            levende++;
        }
        for (i = b.flager.length - 1; i >= 0 && levende > antal; i--) {
            if (!b.flager[i].doed) { b.flager[i].doed = true; levende--; }
        }
        for (i = b.flager.length - 1; i >= 0; i--) {
            f = b.flager[i];
            if (f.doed) {
                f.alfa -= dt * 2.5;
                if (f.alfa <= 0.02) { b.flager.splice(i, 1); continue; }
            } else {
                f.alfa = Math.min(1, f.alfa + dt * 2);
            }
            if (omroer > 0.3) {
                f.theta += dt * 4 * omroer;
                f.x = NK.mod(f.x, 56 + f.rx * Math.sin(f.theta), 6, dt);
                if (Math.random() < dt * 0.5) f.ymaal = r(top + 8, 118);
                f.y = NK.mod(f.y, f.ymaal, 1.5, dt);
                f.a += dt * 3;
            } else {
                var bund = 124 - b.bundlag;
                if (f.y < bund) {
                    f.y = Math.min(bund, f.y + f.vy * dt);
                    f.x += Math.sin(this.tid * 1.3 + f.fase) * 5 * dt;
                    f.a += dt * 0.8;
                }
            }
        }

        /* Kogebobler */
        if (b.koger && b.vand && !b.flytter) {
            this.bobleUr -= dt;
            if (this.bobleUr <= 0) {
                this.bobleUr = r(0.03, 0.09);
                b.bobler.push({ x: r(16, 96), y: 122, r: r(1, 2.6), vy: -r(40, 70) });
                if (NK.Lyd && Math.random() < 0.25) NK.Lyd.boble();
            }
        }
        for (i = b.bobler.length - 1; i >= 0; i--) {
            var bo = b.bobler[i];
            bo.y += bo.vy * dt;
            bo.x += Math.sin(this.tid * 9 + i) * 8 * dt;
            bo.r += dt * 1.2;
            if (bo.y < top - 2 || !b.vand) b.bobler.splice(i, 1);
        }
    };

    P.opdaterEffekter = function (dt) {
        var i, b = this.b;

        /* Pulverkorn */
        for (i = this.korn.length - 1; i >= 0; i--) {
            var k = this.korn[i];
            k.vy += 600 * dt;
            k.x += k.vx * dt;
            k.y += k.vy * dt;
            var bund = S.BORD;
            if (k.til === "baad") bund = this.g.vejebaad.p.y - 3;
            else if (k.til === "glas") bund = b.niveau === null ? 420 : b.niveau;
            else if (k.til === "dunk") bund = S.DUNK.aabning.y + 4;
            if (k.y >= bund) this.korn.splice(i, 1);
        }

        if (this.spild) this.spild.rx = NK.mod(this.spild.rx, this.spild.rxMaal, 4, dt);
        if (this.skvulp) this.skvulp.rx = NK.mod(this.skvulp.rx, this.skvulp.rxMaal, 4, dt);

        /* Vanddamp over det varme glas */
        if (b.vand && !b.flytter && b.T > 55) {
            this.dampUr -= dt * (b.T - 55) / 45;
            if (this.dampUr <= 0) {
                this.dampUr = 0.12;
                var bg = this.g.baegerglas;
                this.dampe.push({ x: bg.p.x + r(-36, 36), y: bg.p.y - 2, vx: r(-6, 6), vy: -r(14, 26), r: r(5, 9), liv: 1 });
            }
        }
        for (i = this.dampe.length - 1; i >= 0; i--) {
            var d = this.dampe[i];
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.r += dt * 8;
            d.liv -= dt * 0.5;
            if (d.liv <= 0) this.dampe.splice(i, 1);
        }
    };
}());
