/* =====================================================================
   forsoeg.js - selve forsoeget: tilstand, trin og handlinger

   Et baegerglas, fem reagensglas i et stativ, tre draabeflasker, en
   sproejteflaske med vand, en glasstav, et varmt vandbad og et isbad.

   Eleven vaelger en beholder ved at klikke paa den (det valgte glas har
   gult nummer), og sproejteflasken, draabeflaskerne og glasstaven virker
   paa den valgte beholder. Et klik paa baegerglasset haelder
   stamoploesningen i de glas, der ikke har faaet noget endnu.

   Trinene (TRIN) er det, eleven skal naa. Et trin er gjort, naar
   tilstanden siger det, ikke naar en knap er trykket. Genstandene
   flyttes af smaa koreografier (koer): en liste af trin, der enten
   flytter en genstand, venter og goer noget undervejs, eller kalder en
   funktion. Mens en koreografi koerer, reagerer scenen ikke paa klik.

   Referencen er det foerste glas, der har faaet stamoploesning og ellers
   er uroert. Er intet glas uroert, bruges resten i baegerglasset, og er
   det ogsaa aendret, sammenlignes der med stamoploesningen, som den var.

   Forkerte handlinger afvises ikke, men giver et uheld eller en
   bemaerkning fra laereren (laerer.js):
     rystes et glas meget voldsomt, sproejter indholdet ud
     loeber et glas eller baegerglasset over, bliver der en pyt
     er stamoploesningen farveloes, for moerk, for lys, ujaevn eller
     tilsat soelvnitrat, siger laereren det, naar den fordeles
     faar alle fem glas et indgreb, er der ingen reference
     faar et glas to slags indgreb, siger laereren det

   Tegningen og musen staar i bord.js, laereren i laerer.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var r = NK.r;
    var A = S.ANKER;

    var GLAS = ["glas1", "glas2", "glas3", "glas4", "glas5"];
    NK.GLAS = GLAS;

    function kopi(p) { return { x: p.x, y: p.y, v: p.v }; }

    var STOF = {
        fe:  { navn: "Fe(NO₃)₃", farve: { r: 238, g: 212, b: 140, a: 0.9 } },
        scn: { navn: "KSCN", farve: null },
        ag:  { navn: "AgNO₃", farve: null }
    };
    NK.STOF = STOF;

    var TRIN = [
        { id: "vand", tekst: "Hæld vand i bægerglasset", mark: "vand",
          hint: "Klik på sprøjteflasken med vand. Et klik giver ca. 30 mL i bægerglasset." },
        { id: "reagens", tekst: "Dryp Fe(NO₃)₃ og KSCN i vandet", mark: "fe",
          hint: "Klik på dråbeflaskerne. Hvert klik er én dråbe. Fire dråber af hver giver en tydelig farve." },
        { id: "roer", tekst: "Rør om med glasstaven", mark: "glasstav",
          hint: "Klik på glasstaven foran bægerglasset." },
        { id: "fordel", tekst: "Fordel opløsningen i de fem glas", mark: "baeger",
          hint: "Klik på bægerglasset. Det hælder lidt i hvert glas, der ikke har fået noget." },
        { id: "fe", tekst: "Dryp Fe(NO₃)₃ i ét glas, og ryst det", mark: "fe",
          hint: "Klik på et glas for at vælge det, og klik så på Fe(NO₃)₃. Ryst glasset, så dråben bliver blandet." },
        { id: "scn", tekst: "Dryp KSCN i et andet glas, og ryst det", mark: "scn",
          hint: "Vælg et nyt glas, klik på KSCN, og ryst glasset." },
        { id: "ag", tekst: "Dryp AgNO₃ i et tredje glas, og ryst det", mark: "ag",
          hint: "Vælg et nyt glas, klik på AgNO₃, og ryst glasset. Hold øje med bunden." },
        { id: "varme", tekst: "Stil et fjerde glas i det varme vandbad", mark: "vandbad",
          hint: "Træk glasset over i vandbadet, eller vælg det og klik på vandbadet. Vent, til farven ikke ændrer sig mere." },
        { id: "sammenlign", tekst: "Sammenlign glassene med referencen", mark: "kort",
          hint: "Klik på Sammenlign eller på det hvide kort. Notér for hvert glas, om det er mørkere eller lysere end det urørte glas." },
        { id: "affald", tekst: "Hæld resterne i affaldsdunken", mark: "dunk",
          hint: "Klik på den blå dunk. Resterne indeholder sølv og må ikke hældes i vasken." }
    ];
    NK.TRIN = TRIN;

    var SVAR = ["mørkere", "lysere", "som referencen"];
    NK.SVAR = SVAR;

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

    function genstand(navn, sprite, hjem) {
        return { navn: navn, sprite: sprite, anker: A[sprite], hjem: hjem, p: kopi(hjem) };
    }

    function nulstilGlasData(gl) {
        M.toem(gl.b);
        gl.mikro.toem();
        gl.fyldt = false;
        gl.indgreb = { fe: 0, scn: 0, ag: 0, vand: 0, maksT: M.TEMP.stue, minT: M.TEMP.stue };
        gl.vurdering = null;
        gl.afkoelet = false;
        gl.slut = null;
    }

    function nytGlas(navn, nr) {
        var gl = genstand(navn, "reagensglas", S.HJEM[navn]);
        gl.nr = nr;
        gl.erGlas = true;
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
        this.tjekUr = 0;

        var g = this.g = {
            vand:     genstand("vand", "vand", S.HJEM.vand),
            baeger:   genstand("baeger", "baeger", S.HJEM.baeger),
            fe:       genstand("fe", "fe", S.HJEM.fe),
            scn:      genstand("scn", "scn", S.HJEM.scn),
            ag:       genstand("ag", "ag", S.HJEM.ag),
            glasstav: { navn: "glasstav", hjem: S.HJEM.glasstav, p: kopi(S.HJEM.glasstav) },
            kaffekop: genstand("kaffekop", "kaffekop", S.HJEM.kaffekop)
        };
        g.baeger.b = M.beholder(M.MAENGDE.LAG_BAEGER);
        g.baeger.mikro = new NK.Mikro();
        g.baeger.draaber = { fe: 0, scn: 0, ag: 0 };
        g.baeger.vandMl = 0;
        g.baeger.niveau = null;
        GLAS.forEach(function (n, i) { g[n] = nytGlas(n, i + 1); });
        g.kaffekop.skjult = this.koppenVaek;
        ["fe", "scn", "ag"].forEach(function (n) { g[n].svaev = null; });

        this.valgt = "baeger";
        this.stam = null;
        this.resultat = null;

        this.handling = null;
        this.holdt = null;
        this.hover = null;
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
        this.saml = false;
        this.samlAlfa = 0;
        this.samlData = null;
        if (this.laererNyt) this.laererNyt();
        this.aendret("nulstil");
    };

    /* ----- Beholderne --------------------------------------------------- */
    P.glasListe = function () {
        var g = this.g;
        return GLAS.map(function (n) { return g[n]; });
    };

    P.valgtBeholder = function () {
        return this.valgt ? this.g[this.valgt] : null;
    };

    P.vaelg = function (navn) {
        if (this.valgt === navn) return;
        this.valgt = navn;
        this.aendret("valg");
    };

    P.navn = function (c) {
        return c.erGlas ? "Glas " + c.nr : "Bægerglasset";
    };

    P.aabning = function (c) {
        return c.erGlas ? { x: c.p.x, y: c.p.y } : NK.tilVerden(c.p, c.anker, 36, 4);
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

    P.fordelt = function () {
        return !!this.gjort.fordelt;
    };

    /* Bundfaldet til tegningen: hoejden af det bundfaeldede (0-1) og hvor
       uklar vaesken er af det, der svaever */
    P.bundfald = function (c) {
        var b = c.b;
        var agscn = b.sol.agscn + (b.lag ? b.lag.agscn : 0);
        var V = M.volumen(b);
        return {
            bund: b.bund * 0.09,
            uklar: V > 0.05 ? NK.klamp((agscn - b.bund) / V * 0.9, 0, 0.8) : 0
        };
    };

    /* ----- Indgreb og reference ------------------------------------------ */
    P.indgrebListe = function (gl) {
        var i = gl.indgreb, ud = [];
        if (i.fe > 0) ud.push("fe");
        if (i.scn > 0) ud.push("scn");
        if (i.ag > 0) ud.push("ag");
        if (i.vand > 0) ud.push("vand");
        if (i.maksT >= M.TEMP.varm) ud.push("varme");
        if (i.minT <= M.TEMP.kold) ud.push("kulde");
        return ud;
    };

    P.indgrebTekst = function (gl) {
        var dele = this.indgrebListe(gl).map(function (k) {
            if (k === "varme") return "vandbad";
            if (k === "kulde") return "isbad";
            if (k === "vand") return "+ vand";
            return "+ " + STOF[k].navn;
        });
        return dele.length ? dele.join(", ") : "urørt";
    };

    P.uroert = function (gl) {
        var i = gl.indgreb;
        return !!(gl.fyldt && M.volumen(gl.b) > 0.5 && i.fe === 0 && i.scn === 0 && i.ag === 0 && i.vand === 0 &&
            i.maksT < 30 && i.minT > 12);
    };

    /* Referenceglasset, baegerglasset eller null */
    P.reference = function () {
        var liste = this.glasListe();
        for (var i = 0; i < liste.length; i++) if (this.uroert(liste[i])) return liste[i];
        if (this.fordelt() && !this.haendt.baegerAendret && M.volumen(this.g.baeger.b) > 0.5) return this.g.baeger;
        return null;
    };

    /* Den oploesning, der sammenlignes med */
    P.refOpl = function () {
        var ref = this.reference();
        if (ref) return M.samlet(ref.b);
        return this.stam ? this.stam.opl : null;
    };

    P.efterIndgreb = function (gl, slags, foer) {
        gl.vurdering = null;
        if (foer.length && foer.indexOf(slags) < 0) {
            this.haendt["blandet" + gl.nr] = true;
            if (!this.gjort.blandetSagt && gl.fyldt) {
                this.gjort.blandetSagt = true;
                this.laererKo("laererBlandet", gl);
            }
        }
        this.aendret("indgreb");
    };

    /* ----- Til panelet ------------------------------------------------ */
    P.trinGjort = function (id) {
        var gj = this.gjort, b = this.g.baeger;
        var glas = this.glasListe();
        switch (id) {
            case "vand": return !!(gj.affald || gj.fordelt || b.vandMl >= 20);
            case "reagens":
                if (gj.affald) return true;
                if (gj.fordelt) return !!(this.stam && this.stam.draaber.fe > 0 && this.stam.draaber.scn > 0);
                return b.draaber.fe > 0 && b.draaber.scn > 0;
            case "roer": return !!(gj.affald || gj.fordelt || gj.roert);
            case "fordel": return !!(gj.affald || gj.fordelt);
            case "fe": case "scn": case "ag":
                return !!gj.affald || glas.some(function (gl) { return gl.indgreb[id] > 0 && !gl.b.lag; });
            case "varme":
                return !!gj.affald || glas.some(function (gl) { return gl.indgreb.maksT >= M.TEMP.varm; });
            default: return !!gj[id];
        }
    };

    P.aktueltTrin = function () {
        for (var i = 0; i < TRIN.length; i++) if (!this.trinGjort(TRIN[i].id)) return TRIN[i];
        return null;
    };

    P.indgrebFaerdige = function () {
        var mig = this;
        return ["fe", "scn", "ag", "varme"].every(function (id) { return mig.trinGjort(id); });
    };

    P.travl = function () {
        return !!(this.handling || this.holdt || this.rystKilde || (this.laererOptaget && this.laererOptaget()));
    };

    /* Et uroert glas, der kan bruges til et indgreb: det sidste af de
       uroerte, saa det foerste bliver referencen */
    P.fritGlas = function () {
        var mig = this;
        var ur = this.glasListe().filter(function (gl) { return mig.uroert(gl); });
        return ur.length > 1 ? ur[ur.length - 1] : null;
    };

    P.markérGlas = function () {
        var fg = this.fritGlas();
        this.markér(fg ? fg.navn : "stativ", 3);
    };

    /* Hint til det aktuelle trin. Genstanden, det handler om, faar en
       pulserende ramme i fem sekunder. */
    P.hint = function () {
        var t = this.aktueltTrin();
        if (!t) return null;
        var mark = t.mark;
        var v = this.valgtBeholder();
        if (t.id === "reagens" && this.g.baeger.draaber.fe > 0) mark = "scn";
        if (t.id === "fe" || t.id === "scn" || t.id === "ag" || t.id === "varme") {
            if (v && v.erGlas && v.indgreb[t.id] > 0 && v.b.lag) mark = v.navn;
            else if (!v || !v.erGlas || !this.uroert(v)) {
                var fg = this.fritGlas();
                if (fg) mark = fg.navn;
            }
        }
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
        if (this.saml) return this.klikSammenlign(navn);
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (this.optaget() || this.holdt || this.rystKilde) return false;
        switch (navn) {
            case "kaffekop": return this.klikKop ? this.klikKop() : false;
            case "glas1": case "glas2": case "glas3": case "glas4": case "glas5":
                this.vaelg(navn);
                this.besked("Glas " + this.g[navn].nr + " er valgt.");
                return true;
            case "baeger": return this.proevBaeger();
            case "vand": return this.proevVand();
            case "fe": case "scn": case "ag": return this.proevDraabe(navn);
            case "glasstav": return this.proevGlasstav();
            case "vandbad": case "isbad": return this.proevBad(navn);
            case "dunk": return this.proevDunk();
            case "kort": return this.aabnSammenlign();
            case "stativ": return this.proevStativ();
        }
        return false;
    };

    P.proevBaeger = function () {
        var bg = this.g.baeger;
        var tomme = this.glasListe().filter(function (gl) {
            return !gl.fyldt && gl.sted === "stativ" && M.volumen(gl.b) < M.MAENGDE.GLAS_MAKS - M.MAENGDE.FORDEL;
        });
        if (M.volumen(bg.b) >= 1 && tomme.length) {
            this.fordel(tomme);
            return true;
        }
        this.vaelg("baeger");
        if (M.volumen(bg.b) < 1 && tomme.length) {
            this.besked("Bægerglasset er tomt. Klik på sprøjteflasken.");
            this.markér("vand");
        } else {
            this.besked("Bægerglasset er valgt.");
        }
        return true;
    };

    P.proevVand = function () {
        var c = this.valgtBeholder();
        if (!c) { this.besked("Klik på et glas eller bægerglasset for at vælge det."); this.markérGlas(); return false; }
        if (c.erGlas && c.sted === "flytter") return false;
        this.sproejt(c);
        return true;
    };

    P.proevDraabe = function (stof) {
        var c = this.valgtBeholder();
        if (!c) { this.besked("Klik på et glas for at vælge det."); this.markérGlas(); return false; }
        if (c.erGlas && c.sted === "flytter") return false;
        this.draabe(stof, c);
        return true;
    };

    P.proevGlasstav = function () {
        var c = this.valgtBeholder();
        if (!c) { this.besked("Klik på et glas eller bægerglasset for at vælge det."); this.markérGlas(); return false; }
        if (M.volumen(c.b) < 0.3) { this.besked(this.navn(c) + " er tomt."); return false; }
        if (c.erGlas && c.sted === "flytter") return false;
        this.roer(c);
        return true;
    };

    P.proevBad = function (bad) {
        var i = this.glasI(bad);
        var v = this.valgtBeholder();
        var badNavn = bad === "vandbad" ? "vandbadet" : "isbadet";
        if (v && v.erGlas && v.sted !== bad) {
            if (i) { this.besked("Der er allerede et glas i " + badNavn + "."); return false; }
            this.tilBad(v, bad);
            return true;
        }
        if (i) { this.tilStativ(i); return true; }
        if (v && !v.erGlas) { this.besked("Bægerglasset kan ikke stå i " + badNavn + ". Vælg et reagensglas."); this.markérGlas(); return false; }
        this.besked("Klik på et glas for at vælge det.");
        this.markérGlas();
        return false;
    };

    P.proevStativ = function () {
        var v = this.valgtBeholder();
        if (v && v.erGlas && (v.sted === "vandbad" || v.sted === "isbad")) { this.tilStativ(v); return true; }
        this.besked("Klik på et glas for at vælge det.");
        return false;
    };

    P.proevDunk = function () {
        if (this.gjort.affald) { this.besked("Resterne er afleveret."); return false; }
        if (this.gjort.sammenlign) { this.aflever(); return true; }
        var v = this.valgtBeholder();
        if (!v || M.volumen(v.b) < 0.05) {
            this.besked("Sammenlign glassene, før resterne afleveres.");
            this.markér("kort", 3);
            return false;
        }
        this.toemI(v);
        return true;
    };

    /* ----- Vand ------------------------------------------------------------ */
    P.sproejt = function (c) {
        var fl = this.g.vand, mig = this;
        var mL = c.erGlas ? M.MAENGDE.VAND_GLAS : M.MAENGDE.VAND_BAEGER;
        var tid = c.erGlas ? 0.7 : 1.4;
        var givet = 0, loebOver = false;
        var foer = c.erGlas ? this.indgrebListe(c) : null;
        this.vaelg(c.navn);
        this.koer([
            { flyt: fl, til: function () { var o = mig.aabning(c); return { x: o.x - 8, y: o.y - 34, v: 0.55 }; }, tid: 0.8, loeft: 40 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(tid); } },
            { tid: tid, hver: function (t) {
                var nu = mL * t;
                if (!loebOver && nu > givet) {
                    M.vandI(c.b, nu - givet);
                    if (mig.tjekOverloeb(c)) loebOver = true;
                }
                givet = nu;
                var o = mig.aabning(c);
                var tud = { x: fl.p.x, y: fl.p.y };
                this.straale = { fra: tud, til: { x: o.x, y: c.niveau === null ? o.y + 100 : c.niveau }, farve: { r: 200, g: 228, b: 245, a: 0.6 }, bredde: 1.8 };
            } },
            { kald: function () {
                this.straale = null;
                if (c.erGlas) {
                    c.indgreb.vand += mL;
                    this.efterIndgreb(c, "vand", foer);
                } else {
                    c.vandMl += mL;
                    if (this.fordelt()) this.haendt.baegerAendret = true;
                }
                this.aendret("vand");
            } },
            hjemTil(fl, 0.8, 40)
        ], "vand");
    };

    /* Er der mere i beholderen, end der er plads til, loeber resten ud */
    P.tjekOverloeb = function (c) {
        var maks = c.erGlas ? M.MAENGDE.GLAS_MAKS : M.MAENGDE.BAEGER_MAKS;
        var V = M.volumen(c.b);
        if (V <= maks) return false;
        var ud = M.udtag(c.b, V - maks + (c.erGlas ? 1.5 : 6));
        var o = this.aabning(c);
        var farve = (c.erGlas ? M.glasFarve(ud) : M.baegerFarve(ud)) || M.FARVE.vand;
        for (var i = 0; i < 18; i++) {
            this.draaber.push({ x: o.x + r(-8, 8), y: o.y + 2, vx: r(-120, 120), vy: -r(40, 160), r: r(1.4, 2.6), liv: 1, farve: { r: farve.r, g: farve.g, b: farve.b, a: 0.8 }, fysik: true });
        }
        this.pyt = { x: NK.klamp(o.x, 120, 880), rx: 8, rxMaal: c.erGlas ? 44 : 70, farve: { r: farve.r, g: farve.g, b: farve.b, a: 0.8 }, vaad: 1 };
        this.antalUheld++;
        this.haendt["overloeb" + (c.erGlas ? c.nr : 0)] = true;
        this.ryk = 3;
        if (NK.Lyd) NK.Lyd.plask();
        this.besked(this.navn(c) + " løber over.", "advarsel");
        if (this.laererSpild) this.laererSpild(c, "overloeb");
        this.aendret("overloeb");
        return true;
    };

    /* ----- Draaber ------------------------------------------------------ */
    P.draabe = function (stof, c) {
        var fl = this.g[stof];
        var mig = this;
        var liste = [];
        ["fe", "scn", "ag"].forEach(function (n) {
            var anden = mig.g[n];
            if (n !== stof && anden.svaev) { anden.svaev = null; liste.push(hjemTil(anden, 0.45, 30)); }
        });
        this.vaelg(c.navn);
        if (!(fl.svaev && fl.svaev.c === c)) {
            liste.push({ flyt: fl, til: function () { var o = mig.aabning(c); return { x: o.x, y: o.y - 16, v: Math.PI }; }, tid: 0.6, loeft: 50 });
            liste.push({ tid: 0.12 });
        }
        liste.push({ kald: function () {
            var farve = STOF[stof].farve;
            this.draaber.push({ x: fl.p.x, y: fl.p.y + 4, vx: 0, vy: 40, r: 3.4, liv: 1, farveloes: !farve, farve: farve, stof: stof, c: c });
            fl.svaev = { c: c, ur: 2.4 };
            this.aendret("draabe");
        } });
        this.koer(liste, "draabe");
    };

    P.draabeLander = function (dr) {
        var c = dr.c, stof = dr.stof;
        var foer = c.erGlas ? this.indgrebListe(c) : null;
        M.draabe(c.b, stof);
        if (NK.Lyd) NK.Lyd.plip();
        if (c.erGlas) {
            c.indgreb[stof]++;
            this.efterIndgreb(c, stof, foer);
        } else {
            c.draaber[stof]++;
            if (this.fordelt()) this.haendt.baegerAendret = true;
        }
        this.aendret("draabe");
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
            { kald: function () {
                this.roerer = null;
                if (!c.erGlas && (c.draaber.fe > 0 || c.draaber.scn > 0)) this.gjort.roert = true;
                this.aendret("roer");
            } },
            { flyt: st, til: function () { return st.hjem; }, tid: 0.8, loeft: 60 }
        ], "roer");
    };

    /* ----- Fordeling ----------------------------------------------------- */
    /* Positur for baegerglasset, naar det haelder fra tuden ned i glasset */
    P.haeldPositur = function (gl) {
        var o = this.aabning(gl);
        var v = -1.15, c = Math.cos(v), s = Math.sin(v);
        var dx = 1 - 36, dy = 3.5 - 4;
        return { x: o.x + 3 - (dx * c - dy * s), y: o.y - 12 - (dx * s + dy * c), v: v };
    };

    P.fordel = function (tomme) {
        var bg = this.g.baeger, mig = this;
        var liste = [];
        var start = M.samlet(bg.b);
        var draaber = { fe: bg.draaber.fe, scn: bg.draaber.scn, ag: bg.draaber.ag };
        var vFoer = M.volumen(bg.b);
        this.vaelg("baeger");
        tomme.forEach(function (gl) {
            var givet = 0;
            liste.push({ flyt: bg, til: function () { return mig.haeldPositur(gl); }, tid: 0.55, loeft: 30 });
            liste.push({ kald: function () { if (NK.Lyd) NK.Lyd.haeld(0.7); } });
            liste.push({ tid: 0.75, hver: function (t) {
                var maal = M.MAENGDE.FORDEL * NK.blod(t);
                var dV = Math.min(maal - givet, M.volumen(bg.b));
                if (dV > 0.001) M.haeldI(gl.b, M.udtag(bg.b, dV));
                givet = maal;
                var tud = NK.tilVerden(bg.p, bg.anker, 1, 3.5);
                var o = mig.aabning(gl);
                var farve = M.baegerFarve(M.samlet(bg.b));
                this.straale = M.volumen(bg.b) > 0.01 ? { fra: tud, til: { x: o.x, y: gl.niveau === null ? o.y + 140 : gl.niveau }, farve: farve || M.FARVE.vand, bredde: 2.6 } : null;
            } });
            liste.push({ kald: function () {
                this.straale = null;
                if (M.volumen(gl.b) > 0.5) gl.fyldt = true;
                gl.vurdering = null;
                this.aendret("haeldt");
            } });
        });
        liste.push(hjemTil(bg, 0.7, 30));
        liste.push({ kald: function () {
            var alle = this.glasListe().every(function (gl) { return gl.fyldt; });
            if (alle && !this.gjort.fordelt) {
                this.gjort.fordelt = true;
                this.stam = { opl: start, draaber: draaber, V: vFoer, vand: bg.vandMl, roert: !!this.gjort.roert };
                this.valgt = null;
                this.efterFordeling();
                this.besked("Opløsningen er fordelt. Klik på et glas for at vælge det.", "god");
            }
            this.aendret("fordel");
        } });
        this.koer(liste, "fordel");
    };

    P.efterFordeling = function () {
        var st = this.stam;
        var v = M.stamVurdering(st.opl);
        var kx = this.glasListe().map(function (gl) { return M.koncX(M.samlet(gl.b)); });
        var maks = Math.max.apply(null, kx), min = Math.min.apply(null, kx);
        st.vurdering = v;
        st.ujaevn = (v === "ok" || v === "moerk") && maks / Math.max(min, 0.004) > M.STAM.ujaevn;
        if (v === "farveloes") { this.haendt.farveloes = true; this.laererKo("laererFarveloes"); }
        else if (v === "soelv") { this.haendt.soelv = true; this.laererKo("laererSoelv"); }
        else if (v === "moerk") { this.haendt.moerk = true; this.laererKo("laererMoerk"); }
        else if (v === "lys") { this.haendt.lys = true; this.laererKo("laererLys"); }
        else if (st.ujaevn) { this.haendt.ujaevn = true; this.laererKo("laererUjaevn"); }
        else if (NK.Lyd) NK.Lyd.succes();
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
                c.draaber = { fe: 0, scn: 0, ag: 0 };
                c.vandMl = 0;
                if (mig.fordelt()) mig.haendt.baegerAendret = true;
            }
        } });
        liste.push({ flyt: c, til: c.hjem, tid: 0.9, loeft: 60 });
        if (c.erGlas) liste.push({ kald: function () { c.sted = "stativ"; c.fraSted = "stativ"; } });
        return liste;
    };

    P.toemI = function (c) {
        var liste = [];
        this.vaelg(c.navn);
        if (c.erGlas && (c.sted === "vandbad" || c.sted === "isbad")) c.sted = "stativ";
        liste = liste.concat(this.toemListe(c));
        liste.push({ kald: function () {
            this.besked(this.navn(c) + " er tømt og kan bruges igen.");
            this.aendret("toemt");
        } });
        this.koer(liste, "toem");
    };

    P.aflever = function () {
        var mig = this;
        var liste = [];
        this.lukSammenlign();
        this.glasListe().forEach(function (gl) {
            gl.slut = {
                opl: M.samlet(gl.b), bundfald: mig.bundfald(gl), indgreb: mig.indgrebTekst(gl), liste: mig.indgrebListe(gl),
                vurdering: gl.vurdering, afkoelet: gl.afkoelet, uroert: mig.uroert(gl)
            };
            if (M.volumen(gl.b) < 0.05) return;
            liste = liste.concat(mig.toemListe(gl));
        });
        if (M.volumen(this.g.baeger.b) > 0.05) liste = liste.concat(this.toemListe(this.g.baeger));
        liste.push({ kald: function () {
            this.gjort.affald = true;
            this.valgt = null;
            this.besked("Resterne er afleveret. Forsøget er slut.", "god");
            if (NK.Lyd) NK.Lyd.succes();
            this.aendret("affald");
        } });
        this.koer(liste, "affald");
    };

    /* ----- Sammenligningen ------------------------------------------------- */
    P.aabnSammenlign = function () {
        if (!this.glasListe().some(function (gl) { return M.volumen(gl.b) > 0.3; })) {
            this.besked("Fordel opløsningen i glassene først.");
            this.markér("baeger");
            return false;
        }
        if (this.optaget() || this.holdt || this.rystKilde) return false;
        this.saml = true;
        this.samlData = this.sammenlignData();
        if (NK.Lyd) NK.Lyd.papir();
        this.aendret("saml");
        return true;
    };

    /* Naar visningen lukkes, og alle glas med et indgreb er vurderet, er
       sammenligningen gjort. Saa kan eleven klikke sig frem til sit svar. */
    P.lukSammenlign = function () {
        if (!this.saml) return false;
        this.saml = false;
        this.tjekSammenlign();
        this.aendret("saml");
        return true;
    };

    P.skiftSammenlign = function () {
        return this.saml ? this.lukSammenlign() : this.aabnSammenlign();
    };

    P.klikSammenlign = function (navn) {
        if (navn === "samlLuk" || navn === "samlUd") return this.lukSammenlign();
        if (/^vurder\d$/.test(navn)) return this.vurder(Number(navn.slice(6)));
        return false;
    };

    P.sammenlignData = function () {
        var ref = this.reference(), mig = this;
        var refOpl = this.refOpl();
        var tekst;
        if (ref && ref.erGlas) tekst = "Glas " + ref.nr + " er urørt og er referencen.";
        else if (ref) tekst = "Intet glas er urørt. Resten i bægerglasset er referencen.";
        else if (refOpl) tekst = "Intet er urørt. Sammenlign med, hvordan opløsningen så ud.";
        else tekst = "Der er ingen opløsning at sammenligne med.";
        return {
            tekst: tekst,
            glas: this.glasListe().map(function (gl) {
                var o = M.samlet(gl.b), V = M.volumen(gl.b);
                var bf = mig.bundfald(gl);
                return {
                    nr: gl.nr, farve: M.oppefraFarve(o), bund: bf.bund, uklar: bf.uklar, tom: V < 0.3,
                    etiket: V < 0.3 ? "tomt" : mig.indgrebTekst(gl),
                    ref: gl === ref,
                    kanVurderes: V >= 0.3 && gl !== ref && !!refOpl,
                    svar: gl.vurdering ? gl.vurdering.svar : null
                };
            })
        };
    };

    /* Et klik paa knappen under et glas skifter mellem de tre svar */
    P.vurder = function (nr) {
        var gl = this.g["glas" + nr];
        var d = this.sammenlignData();
        if (!gl || !d.glas[nr - 1].kanVurderes) return false;
        var nu = gl.vurdering ? SVAR.indexOf(gl.vurdering.svar) : -1;
        var svar = SVAR[(nu + 1) % SVAR.length];
        var o = M.samlet(gl.b);
        var ref = this.reference();
        gl.vurdering = {
            svar: svar,
            faktisk: M.sammenlign(o, this.refOpl()),
            indgreb: this.indgrebTekst(gl),
            sted: gl.sted,
            opl: o,
            bundfald: this.bundfald(gl),
            refNr: ref && ref.erGlas ? ref.nr : 0
        };
        if (NK.Lyd) NK.Lyd.klik();
        this.samlData = this.sammenlignData();
        this.aendret("vurder");
        return true;
    };

    P.tjekSammenlign = function () {
        if (this.gjort.sammenlign || !this.indgrebFaerdige()) return;
        var mig = this;
        var ref = this.reference();
        var glas = this.glasListe().filter(function (gl) {
            return M.volumen(gl.b) >= 0.3 && gl !== ref && mig.indgrebListe(gl).length > 0;
        });
        if (!glas.length || !glas.every(function (gl) { return !!gl.vurdering; })) return;
        var forkerte = glas.filter(function (gl) { return gl.vurdering.svar !== gl.vurdering.faktisk; });
        this.gjort.sammenlign = true;
        this.resultat = { refNr: ref && ref.erGlas ? ref.nr : 0, forkerte: forkerte.map(function (gl) { return gl.nr; }) };
        this.besked("Glassene er sammenlignet.", "god");
        if (NK.Lyd) NK.Lyd.succes();
        this.laererKo("laererRos", forkerte.length ? forkerte[0] : null);
        this.markér("dunk", 6);
        this.aendret("sammenlign");
    };

    /* ----- Rystning -------------------------------------------------------- */
    P.kanTageFat = function (gl) {
        return !!(gl && gl.erGlas && gl.sted !== "flytter" && !this.optaget() && !this.saml && !(this.laererOptaget && this.laererOptaget()));
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
        if (gl && !this.handling) {
            if (kilde === "mus") this.slipGlas(gl, pt);
            else this.koer([{ flyt: gl, til: this.hjemFor(gl), tid: 0.3, loeft: 0 }], "hjem");
        }
        this.aendret("ryst");
    };

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
        } else if (over === "dunk" && M.volumen(gl.b) > 0.05) {
            this.toemI(gl);
            return;
        }
        if ((fra === "vandbad" || fra === "isbad") && this.glasI(fra) && this.glasI(fra) !== gl) gl.sted = "stativ";
        this.koer([{ flyt: gl, til: this.hjemFor(gl), tid: 0.35, loeft: 0 }], "hjem");
    };

    /* Knappen Ryst glasset (og tasten R): til = trykket ned */
    P.rystKnap = function (til) {
        if (til) {
            if (this.rystKilde || this.optaget() || this.holdt) return false;
            var v = this.valgtBeholder();
            if (!v || !v.erGlas) {
                var mig = this;
                var fyldte = this.glasListe().filter(function (gl) { return mig.kanRyste(gl); });
                if (!fyldte.length) return false;
                this.besked("Klik på et glas for at vælge det.");
                this.markérGlas();
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
        } else if (gl && this.rystKilde === "mus") {
            this.musFart *= Math.exp(-4 * dt);
            this.musVx *= Math.exp(-5 * dt);
            this.vold = NK.mod(this.vold, this.musFart, 4, dt);
            maal = NK.klamp(this.musFart / M.RYST.FULD, 0, 1);
            if (M.volumen(gl.b) > 0.1) {
                if (this.vold > M.RYST.SPILD_FART) this.spildTid += dt;
                else this.spildTid = Math.max(0, this.spildTid - dt);
                this.uro = NK.klamp(this.spildTid / M.RYST.SPILD_TID, 0, 1);
            }
            gl.p.v = NK.mod(gl.p.v, NK.klamp(-this.musVx * 0.0004, -0.4, 0.4), 12, dt) + (Math.random() - 0.5) * 0.14 * this.uro;
            if (this.spildTid > 0.08 && Math.random() < dt * 14) {
                var fo = M.glasFarve(M.samlet(gl.b)) || M.FARVE.vand;
                this.draaber.push({ x: gl.p.x + r(-3, 3), y: gl.p.y, vx: r(-90, 90), vy: -r(60, 160), r: r(1.4, 2.4), liv: 1, farve: { r: fo.r, g: fo.g, b: fo.b, a: 0.8 }, fysik: true });
            }
            if (this.spildTid >= M.RYST.SPILD_TID) {
                this.spild(gl);
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

    /* Glasset blev rystet saa voldsomt, at indholdet sproejtede ud.
       Laereren kommer og toerrer op (laerer.js). */
    P.spild = function (gl) {
        var i;
        this.rystKilde = null;
        this.rystGlas = null;
        this.holdt = null;
        this.spildTid = 0;
        this.uro = 0;
        this.ryst = 0;
        this.musFart = 0;
        this.vold = 0;
        this.antalUheld++;
        this.rystUheld++;

        var o = M.samlet(gl.b);
        var fo = M.glasFarve(o) || M.FARVE.vand;
        var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.85 };
        for (i = 0; i < 26; i++) {
            this.draaber.push({ x: gl.p.x + r(-4, 4), y: gl.p.y, vx: r(-240, 240), vy: -r(120, 360), r: r(1.6, 3), liv: 1, farve: farve, fysik: true });
        }
        this.pyt = { x: NK.klamp(gl.p.x, 140, 860), rx: 8, rxMaal: 56, farve: farve, vaad: 1 };
        this.haendt["spild" + gl.nr] = true;
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
        var mig = this;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        this.urMinutter += dt * 0.5;
        var g = this.g;

        this.opdaterHandling(dt);
        this.opdaterRyst(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);

        if (this.mark) { this.mark.ur -= dt; if (this.mark.ur <= 0) this.mark = null; }
        this.ryk = this.ryk > 0.2 ? this.ryk * (1 - dt * 7) : 0;

        [g.baeger].concat(this.glasListe()).forEach(function (c) {
            var ryst = mig.rystGlas === c ? mig.ryst : 0;
            var roerer = mig.roerer === c;
            var s = {
                T: M.TEMP.stue, tau: M.TEMP.tauLuft,
                bland: M.BLAND.diffusion + ryst * M.BLAND.ryst + (roerer ? M.BLAND.roer : 0),
                ryst: Math.max(ryst, roerer ? 0.6 : 0)
            };
            if (c.sted === "vandbad") { s.T = M.TEMP.vandbad; s.tau = M.TEMP.tauBad; }
            else if (c.sted === "isbad") { s.T = M.TEMP.isbad; s.tau = M.TEMP.tauIs; }
            M.skridt(c.b, dt, s);
            if (c.erGlas) mig.opdaterGlas(c);
            c.mikro.opdater(dt, M.mikroMaal(c.b), { ryst: s.ryst, farve: M.glasFarve(M.samlet(c.b)) });
        });

        /* Faar alle fem glas et indgreb, er der ingen reference */
        if (this.fordelt() && !this.gjort.ingenRefSagt) {
            var glas = this.glasListe();
            if (glas.every(function (gl) { return gl.fyldt; }) && !glas.some(function (gl) { return mig.uroert(gl); })) {
                this.gjort.ingenRefSagt = true;
                this.haendt.ingenRef = true;
                this.laererKo("laererIngenReference");
            }
        }

        this.tjekUr -= dt;
        if (this.tjekUr <= 0 && !this.saml) {
            this.tjekUr = 0.4;
            this.tjekSammenlign();
        }

        /* Draabeflasken svaever over beholderen lidt tid og gaar saa hjem */
        ["fe", "scn", "ag"].forEach(function (n) {
            var fl = g[n];
            if (!fl.svaev) return;
            fl.svaev.ur -= dt;
            var c = fl.svaev.c;
            if (c.erGlas && ((mig.holdt && mig.holdt.navn === c.navn) || mig.rystGlas === c || c.sted === "flytter")) fl.svaev.ur = 0;
            if (fl.svaev.ur <= 0 && !mig.handling) {
                fl.svaev = null;
                mig.koer([hjemTil(fl, 0.6, 40)], "hjem");
            }
        });

        /* Zoomboblen viser den valgte beholder */
        var v = this.valgtBeholder();
        var hn = this.handling ? this.handling.navn : "";
        var vis = !!v && (M.volumen(v.b) > 0.05 || v.mikro.partikler.length > 0) && hn !== "affald" && hn !== "toem";
        if (vis) this.bobleBeholder = v;
        this.bobleAlfa = NK.mod(this.bobleAlfa, vis ? 1 : 0, 5, dt);

        this.haandAlfa = NK.mod(this.haandAlfa, this.rystKilde || this.holdt ? 1 : 0, 10, dt);
        this.samlAlfa = NK.mod(this.samlAlfa, this.saml ? 1 : 0, 9, dt);
        if (this.saml) this.samlData = this.sammenlignData();

        this.opdaterEffekter(dt);

        var t = this.aktueltTrin();
        var id = t ? t.id : "slut";
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
