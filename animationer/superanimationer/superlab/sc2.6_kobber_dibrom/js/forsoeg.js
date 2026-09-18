/* =====================================================================
   forsoeg.js - selve forsoeget i stinkskabet

   Trinene (TRIN) er de ni ting, eleven skal naa. Et trin er gjort, naar
   tilstanden siger det, ikke naar en knap er trykket. Genstandene flyttes
   af smaa koreografier (koer): en liste af trin, der enten flytter en
   genstand, venter og goer noget undervejs, eller kalder en funktion.
   Mens en koreografi koerer, reagerer scenen ikke paa nye klik.

   Rystning: eleven tager fat i kolben og bevaeger musen frem og tilbage,
   eller holder knappen Ryst kolben nede. Rystningen (0-1) styrer
   partikelmodellen i mikro.js, og den styrer farven.

   Paaskeaeg: rystes der meget voldsomt med musen, glider kolben ud af
   haanden (graenserne staar i M.RYST). Anden gang skal der rystes endnu
   voldsommere, og efter to uheld kan kolben ikke gaa i stykker. Knappen
   Ryst kolben taber aldrig kolben. Uheldet og oprydningen staar i uheld.js.

   Forkerte handlinger afvises ikke, men giver et uheld, som laereren
   Kemichael (laerer.js) rydder op efter:
     rystes kolben uden prop, skvulper bromvandet ud
     er brom fremme uden udsugning, kommer dampene ud i lokalet
     haeldes resterne i vasken, loeber laereren ind og stopper det
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
        { id: "udsugning", tekst: "Tænd udsugningen", mark: "kontakt",
          hint: "Kontakten sidder på stinkskabets kontrolpanel øverst til højre." },
        { id: "kobber", tekst: "Kom kobberspåner i kolben", mark: "urglas",
          hint: "Klik på urglasset med kobberspånerne." },
        { id: "brom", tekst: "Hæld bromvand i kolben", mark: "bromflaske",
          hint: "Klik på den brune flaske. Udsugningen skal køre, før den åbnes." },
        { id: "prop", tekst: "Sæt prop i kolben", mark: "prop",
          hint: "Proppen står til højre for kolben." },
        { id: "reageret", tekst: "Ryst kolben", mark: "kolbe",
          hint: "Tag fat i kolben, og ryst den frem og tilbage, eller hold knappen Ryst kolben nede. Hold øje med farven." },
        { id: "fordelt", tekst: "Hæld væsken over i reagensglassene", mark: "kolbe",
          hint: "Klik på proppen for at tage den af, og klik så på kolben. Kobberet bliver i kolben." },
        { id: "nh3", tekst: "Dryp NH₃ i det ene glas", mark: "nh3",
          hint: "Klik på den hvide dråbeflaske flere gange. Stop, når farven ikke ændrer sig mere." },
        { id: "agno3", tekst: "Dryp AgNO₃ i det andet glas", mark: "agno3",
          hint: "Klik på den brune dråbeflaske flere gange, til der ikke dannes mere bundfald." },
        { id: "affald", tekst: "Aflever resterne", mark: "dunk",
          hint: "Resterne indeholder tungmetalioner. Klik på den beholder, de skal i." }
    ];

    NK.TRIN = TRIN;

    NK.Forsoeg = function (canvas) {
        this.canvas = canvas;
        this.laerred = new NK.Laerred(canvas);
        this.tid = 0;
        this.antalUheld = 0;
        this.koppenVaek = false;
        this.vedAendring = null;
        this.vedBesked = null;
        this.vedIagttagelse = null;
        if (this.laererStart) this.laererStart();
        this.nulstil();
        if (canvas) this.bindMus();
    };

    var P = NK.Forsoeg.prototype;

    function genstand(navn, sprite, hjem) {
        return { navn: navn, sprite: sprite, anker: A[sprite], hjem: hjem, p: kopi(hjem) };
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

        var g = this.g = {
            urglas:     genstand("urglas", "urglas", S.HJEM.urglas),
            bromflaske: genstand("bromflaske", "bromflaske", S.HJEM.bromflaske),
            kolbe:      genstand("kolbe", "kolbe", S.HJEM.kolbe),
            prop:       genstand("prop", "prop", S.HJEM.prop),
            nh3:        genstand("nh3", "nh3", S.HJEM.nh3),
            agno3:      genstand("agno3", "agno3", S.HJEM.agno3),
            glas1:      genstand("glas1", "reagensglas", S.HJEM.glas1),
            glas2:      genstand("glas2", "reagensglas", S.HJEM.glas2),
            kaffekop:   genstand("kaffekop", "kaffekop", S.HJEM.kaffekop)
        };
        g.kaffekop.skjult = this.koppenVaek;
        g.urglas.kobberVis = 1;
        g.urglas.kobber = true;
        g.kolbe.areal = 0;
        g.kolbe.kobber = 0;
        g.kolbe.prop = false;
        g.prop.iKolbe = false;
        g.glas1.nr = 1;
        g.glas2.nr = 2;
        [g.glas1, g.glas2].forEach(function (gl) {
            gl.areal = 0; gl.reagens = null; gl.draaber = 0;
            gl.visKompleks = 0; gl.visBund = 0; gl.uklar = 0;
        });
        this.laagT = 0;

        this.mikro = { kolbe: new NK.Mikro("kolbe"), glas1: new NK.Mikro("glas1"), glas2: new NK.Mikro("glas2") };
        this.bobleAlfa = { kolbe: 0, glas1: 0, glas2: 0 };
        this.visBr = 1;

        this.handling = null;
        this.holdt = null;
        this.hover = null;
        this.rystKilde = null;
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
        this.faldende = [];
        this.draaber = [];
        this.dampe = [];
        this.dampUr = 0;
        this.uheld = null;
        this.spildPyt = null;
        this.spildTid = 0;
        this.udenUdsugning = 0;
        this.taage = 0;
        if (this.laererNyt) this.laererNyt();
        if (NK.Lyd) NK.Lyd.udsugning(false);
    };

    /* ----- Til panelet ------------------------------------------------ */
    P.trinGjort = function (id) {
        var gj = this.gjort;
        switch (id) {
            case "udsugning": return this.udsugning || !!gj.affald;
            case "prop": return this.g.kolbe.prop || !!gj.reageret;
            default: return !!gj[id];
        }
    };

    P.aktueltTrin = function () {
        if (this.uheld && this.uheldTrin) return this.uheldTrin();
        for (var i = 0; i < TRIN.length; i++) if (!this.trinGjort(TRIN[i].id)) return TRIN[i];
        return null;
    };

    P.testsFaerdige = function () {
        return !!(this.gjort.nh3 && this.gjort.agno3);
    };

    P.kanRysteNu = function () {
        return !this.uheld && !this.handling && !this.gjort.fordelt && this.g.kolbe.prop;
    };

    P.travl = function () {
        return !!(this.handling || this.holdt || this.rystKilde || (this.uheld && this.uheld.falder) || (this.laererOptaget && this.laererOptaget()));
    };

    /* Hint til det aktuelle trin. Genstanden, det handler om, faar en
       pulserende ramme i fem sekunder. */
    P.hint = function () {
        var t = this.aktueltTrin();
        if (!t) return null;
        var mark = t.mark;
        if (t.id === "brom" && !this.udsugning) mark = "kontakt";
        if (t.id === "fordelt" && this.g.kolbe.prop) mark = "prop";
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

    var IAGTTAGELSER = {
        kobber:   { tekst: "Kobberspånerne er rødbrune og metalliske.", farve: { r: 184, g: 101, b: 46, a: 1 } },
        brom:     { tekst: "Bromvandet er orange.", farve: M.FARVE.bromvand },
        reageret: { tekst: "Den orange farve forsvinder. Opløsningen bliver svagt blågrøn, og der er kobber tilbage.", farve: M.FARVE.kobberbromid },
        nh3:      { tekst: "Glas {n} med NH₃: opløsningen bliver mørkeblå.", farve: M.FARVE.kompleks },
        agno3:    { tekst: "Glas {n} med AgNO₃: der dannes et lysegult bundfald.", farve: M.FARVE.bundfald },
        draabe_nh3:   { tekst: "Dråberne af NH₃(aq) er farveløse.", farve: null },
        draabe_agno3: { tekst: "Dråberne af AgNO₃(aq) er farveløse, selv om flasken er brun.", farve: null },
        uheld:    { tekst: "Kolben blev tabt og knust. Der er ryddet op.", farve: { r: 150, g: 160, b: 172, a: 1 } },
        spildt:   { tekst: "Kolben blev rystet uden prop, og bromvandet skvulpede ud. Pytten blev uskadeliggjort og tørret op.", farve: M.FARVE.bromvand },
        udsugning: { tekst: "Bromvandet var åbent uden udsugning, og dampene kom ud i lokalet.", farve: M.FARVE.bromvand },
        vask:     { tekst: "Rester med tungmetalioner var på vej ned i vasken. De skal i affaldsdunken.", farve: { r: 150, g: 160, b: 172, a: 1 } }
    };
    NK.IAGTTAGELSER = IAGTTAGELSER;

    P.iagttag = function (noegle, glas) {
        if (this.iagttaget[noegle] && noegle !== "uheld") return;
        this.iagttaget[noegle] = true;
        var i = IAGTTAGELSER[noegle];
        var tekst = i.tekst.replace("{n}", glas ? glas.nr : "");
        if (this.vedIagttagelse) this.vedIagttagelse({ noegle: noegle, tekst: tekst, farve: i.farve });
    };

    P.kolbeFarve = function () {
        return this.gjort.brom ? M.kolbeFarve(this.visBr) : null;
    };

    P.glasFarve = function (gl) {
        return gl.reagens === "nh3" ? M.nh3Farve(gl.visKompleks) : M.FARVE.kobberbromid;
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
        if (navn === "kontakt") return this.skiftUdsugning();
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (this.uheld) return this.klikUheld ? this.klikUheld(navn) : false;
        if (this.handling || this.holdt || this.rystKilde) return false;
        switch (navn) {
            case "kaffekop": return this.klikKop ? this.klikKop() : false;
            case "urglas": return this.proevKobber();
            case "bromflaske": return this.proevBrom();
            case "prop": return this.proevProp();
            case "kolbe": return this.proevKolbe();
            case "nh3": case "agno3": return this.brugDraabe(navn);
            case "glas1": case "glas2":
                this.besked(this.gjort.fordelt ? "Brug dråbeflaskerne til at teste indholdet." : "Reagensglassene skal bruges senere.");
                return false;
            case "dunk": return this.proevAffald();
            case "vask": return this.proevVask();
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
        if (this.laagT > 0) return true;
        if (this.spildPyt && this.spildPyt.brom && this.spildPyt.vaad > 0.05) return true;
        if (this.uheld) return !!(this.uheld.pyt && this.uheld.pyt.brom && this.uheld.pyt.neutral < 0.99);
        return !!(this.gjort.brom && !this.gjort.reageret && !this.g.kolbe.prop);
    };

    P.proevKobber = function () {
        if (!this.g.urglas.kobber) { this.besked("Kobberet er allerede i kolben."); return false; }
        if (this.g.kolbe.prop) { this.besked("Tag proppen af først.", "advarsel"); this.markér("prop"); return false; }
        this.brugKobber();
        return true;
    };

    P.proevBrom = function () {
        if (this.gjort.brom) { this.besked("Der er allerede bromvand i kolben."); return false; }
        if (this.g.kolbe.prop) { this.besked("Tag proppen af først.", "advarsel"); this.markér("prop"); return false; }
        this.brugBrom();
        return true;
    };

    P.proevProp = function () {
        var pr = this.g.prop;
        if (!pr.iKolbe && this.gjort.fordelt) { this.besked("Proppen skal ikke bruges mere."); return false; }
        if (!pr.iKolbe && !this.gjort.kobber && !this.gjort.brom) { this.besked("Kolben er tom."); return false; }
        this.brugProp();
        return true;
    };

    P.proevKolbe = function () {
        var k = this.g.kolbe;
        if (this.gjort.fordelt) { this.besked("Væsken er hældt over. Kobberet bliver i kolben."); return false; }
        if (!this.gjort.brom) { this.besked(this.gjort.kobber ? "Der mangler bromvand i kolben." : "Kolben er tom."); return false; }
        if (!this.gjort.reageret) {
            if (k.prop) this.besked("Tag fat i kolben, og ryst den.");
            else { this.besked("Sæt proppen i, før du ryster.", "advarsel"); this.markér("prop"); }
            return false;
        }
        if (k.prop) { this.besked("Tag proppen af, før du hælder.", "advarsel"); this.markér("prop"); return false; }
        this.fordel();
        return true;
    };

    P.proevAffald = function () {
        if (this.gjort.affald) { this.besked("Affaldet er afleveret."); return false; }
        if (!this.testsFaerdige()) { this.besked("Gør begge tests færdige først."); return false; }
        this.aflever();
        return true;
    };

    P.proevVask = function () {
        if (this.gjort.fordelt && !this.gjort.affald) {
            this.haeldIVask();
            return true;
        }
        this.besked("Vasken skal ikke bruges i forsøget.");
        return false;
    };

    /* Uheld: resterne med tungmetalioner haeldes mod vasken. Glas 1 naar
       at haelde lidt, saa loeber laereren ind og stopper det, og glasset
       kommer tilbage i stativet. */
    P.haeldIVask = function () {
        var gl = this.g.glas1, start = gl.areal;
        var bund = { x: S.VASK.midt.x, y: S.VASK.midt.y - 4 };
        this.koer([
            { flyt: gl, til: { x: bund.x - 6, y: bund.y - 110, v: 2.3 }, tid: 0.9, loeft: 60 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(1.2); if (this.laererVask) this.laererVask(); } },
            { tid: 1.2, hver: function (t) {
                gl.areal = start * (1 - 0.2 * t);
                this.straale = { fra: { x: gl.p.x, y: gl.p.y }, til: bund, farve: this.glasFarve(gl), bredde: 2.5 };
            } },
            { kald: function () { this.straale = null; } },
            hjemTil(gl, 0.9, 60),
            { kald: function () {
                this.iagttag("vask");
                this.besked(M.formel("Cu2+") + " og " + M.formel("Ag+") + " må ikke i vasken.", "advarsel");
                this.aendret("vask");
            } }
        ], "vask");
    };

    /* ----- Kobber, bromvand og prop --------------------------------------- */
    P.brugKobber = function () {
        var u = this.g.urglas, k = this.g.kolbe;
        var over = { x: k.p.x - 22, y: k.p.y - 30, v: 0.95 };
        var drysset = 0;
        this.koer([
            { flyt: u, til: over, tid: 0.8, loeft: 60 },
            { tid: 0.9, hver: function (t) {
                u.kobberVis = 1 - t;
                while (drysset < t * 16) {
                    drysset++;
                    var kant = NK.tilVerden(u.p, u.anker, 110, 8);
                    this.faldende.push({ x: kant.x + r(-3, 3), y: kant.y, vx: r(-8, 8), vy: r(0, 30), a: r(0, 6), va: r(-8, 8), r: r(2, 3.4), maal: "kolbe", alfa: 1 });
                }
            } },
            { kald: function () {
                u.kobber = false;
                u.kobberVis = 0;
                this.mikro.kolbe.tilfoejKobber();
                this.gjort.kobber = true;
                this.iagttag("kobber");
                this.aendret("kobber");
            } },
            hjemTil(u, 0.8, 40)
        ], "kobber");
    };

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

    P.brugBrom = function () {
        var b = this.g.bromflaske, k = this.g.kolbe;
        var pose = { x: k.p.x - 6, y: k.p.y - 36, v: 2.0 };
        this.koer([
            { tid: 0.4, hver: function (t) { this.laagT = t; } },
            { flyt: b, til: pose, tid: 0.9, loeft: 50 },
            { kald: function () { this.mikro.kolbe.tilfoejBrom(); if (NK.Lyd) NK.Lyd.haeld(1.6); } },
            { tid: 1.6, hver: function (t) {
                k.areal = S.KOLBE_FULD * NK.blod(t);
                var bund = NK.tilVerden(k.p, k.anker, 75, 190).y;
                this.straale = { fra: { x: b.p.x, y: b.p.y }, til: { x: k.p.x, y: k.niveau === null || k.niveau === undefined ? bund : k.niveau }, farve: M.FARVE.bromvand, bredde: 4 };
            } },
            { kald: function () {
                this.straale = null;
                this.gjort.brom = true;
                this.iagttag("brom");
                this.aendret("brom");
            } },
            hjemTil(b, 0.9, 50),
            { tid: 0.4, hver: function (t) { this.laagT = 1 - t; } }
        ], "brom");
    };

    P.propIKolbe = function () {
        var k = this.g.kolbe;
        var i = NK.tilVerden(k.p, k.anker, 75, 24);
        return { x: i.x, y: i.y, v: k.p.v };
    };

    P.brugProp = function () {
        var pr = this.g.prop, k = this.g.kolbe;
        if (pr.iKolbe) {
            pr.p = this.propIKolbe();
            pr.iKolbe = false;
            k.prop = false;
            if (NK.Lyd) NK.Lyd.klik();
            this.koer([
                { flyt: pr, til: { x: pr.p.x + 12, y: pr.p.y - 44, v: 0.4 }, tid: 0.3, loeft: 0 },
                hjemTil(pr, 0.6, 30),
                { kald: function () { this.aendret("prop"); } }
            ], "prop");
        } else {
            this.koer([
                { flyt: pr, til: { x: k.p.x, y: k.p.y - 56, v: 0 }, tid: 0.6, loeft: 40 },
                { flyt: pr, til: this.propIKolbe, tid: 0.22, loeft: 0 },
                { kald: function () {
                    pr.iKolbe = true;
                    k.prop = true;
                    if (NK.Lyd) NK.Lyd.klik();
                    this.aendret("prop");
                } }
            ], "prop");
        }
    };

    /* ----- Rystning -------------------------------------------------------- */
    /* Kolben kan ogsaa rystes uden prop, men saa skvulper bromvandet ud
       (se opdaterRyst og spildKolbe). */
    P.kanRyste = function () {
        if (this.uheld || this.gjort.fordelt) return false;
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (!this.gjort.brom && !this.gjort.kobber) { this.besked("Kolben er tom."); return false; }
        return true;
    };

    P.startRyst = function (kilde) {
        this.rystKilde = kilde;
        this.farligTid = 0;
        this.spildTid = 0;
        this.aendret("ryst");
    };

    P.stopRyst = function () {
        if (!this.rystKilde) return;
        this.rystKilde = null;
        this.farligTid = 0;
        this.musFart = 0;
        this.vold = 0;
        this.uro = 0;
        if (!this.uheld) {
            var k = this.g.kolbe;
            this.koer([hjemTil(k, 0.35, 0)], "hjem");
        }
        this.aendret("ryst");
    };

    /* Knappen Ryst kolben (og tasten R): til = trykket ned */
    P.rystKnap = function (til) {
        if (til) {
            if (this.rystKilde || this.handling || this.holdt) return false;
            if (!this.kanRyste()) return false;
            this.startRyst("knap");
            return true;
        }
        if (this.rystKilde === "knap") this.stopRyst();
        return false;
    };

    /* Hvor voldsomt skal der rystes, foer kolben tabes? null, naar den
       ikke kan gaa i stykker mere. */
    P.knusGraense = function () {
        var n = this.antalUheld;
        if (n >= M.RYST.MAKS_UHELD) return null;
        return { fart: M.RYST.KNUS_FART[n], tid: M.RYST.KNUS_TID[n] };
    };

    P.opdaterRyst = function (dt) {
        var k = this.g.kolbe;
        var maal = 0;
        this.uro = 0;
        var aaben = !k.prop && this.gjort.brom && k.areal > 5;
        if (this.rystKilde === "knap") {
            var w = this.tid * 17;
            k.p.x = k.hjem.x + Math.sin(w) * 34;
            k.p.y = k.hjem.y - 34 + Math.abs(Math.cos(w)) * 6;
            k.p.v = Math.cos(w) * 0.2;
            maal = 1;
            if (aaben) this.spildTid += dt;
        } else if (this.rystKilde === "mus") {
            /* musFart er musens vej pr. sekund. Den falder, naar musen
               staar stille, og vold er den samme fart udjaevnet lidt mere. */
            this.musFart *= Math.exp(-4 * dt);
            this.musVx *= Math.exp(-5 * dt);
            this.vold = NK.mod(this.vold, this.musFart, 4, dt);
            maal = NK.klamp(this.musFart / M.RYST.FULD, 0, 1);

            /* Paaskeaegget: kun meget voldsom rystning taber kolben. Lige
               foer graensen begynder kolben at vakle i haanden. Uden prop
               skvulper bromvandet i stedet over kanten. */
            var g = this.knusGraense();
            if (aaben) {
                if (this.vold > M.RYST.SPILD_FART) this.spildTid += dt;
                else this.spildTid = Math.max(0, this.spildTid - dt);
                this.uro = NK.klamp(this.spildTid / M.RYST.SPILD_TID, 0, 1);
            } else if (g) {
                if (this.vold > g.fart) this.farligTid += dt;
                else this.farligTid = Math.max(0, this.farligTid - dt);
                this.uro = NK.klamp((this.vold / g.fart - 0.7) / 0.3, 0, 1);
                if (this.farligTid >= g.tid && this.tab) {
                    this.farligTid = 0;
                    this.tab();
                    return;
                }
            }
            k.p.v = NK.mod(k.p.v, NK.klamp(-this.musVx * 0.0004, -0.4, 0.4), 12, dt) + (Math.random() - 0.5) * 0.14 * this.uro;
        }
        if (this.rystKilde && aaben && this.spildTid > 0.05) {
            if (Math.random() < dt * 14) {
                var ab = NK.tilVerden(k.p, k.anker, 75, 4);
                this.draaber.push({ x: ab.x + r(-4, 4), y: ab.y, vx: r(-90, 90), vy: -r(60, 160), r: r(1.6, 2.6), liv: 1, farve: this.kolbeFarve() || M.FARVE.bromvand, fysik: true });
            }
            if (this.spildTid >= M.RYST.SPILD_TID) {
                this.spildKolbe();
                return;
            }
        }
        this.ryst = NK.mod(this.ryst, maal, maal > this.ryst ? 6 : 3, dt);
        this.skvulpUr -= dt;
        if (this.ryst > 0.35 && this.skvulpUr <= 0 && this.gjort.brom && NK.Lyd) {
            NK.Lyd.skvulp(this.ryst);
            this.skvulpUr = 0.24 - 0.1 * this.ryst;
        }
    };

    /* Uheld: kolben blev rystet uden prop, og bromvandet skvulpede ud.
       Kobberet bliver i kolben. Laereren uskadeliggoer pytten og toerrer
       den op (laerer.js), og eleven haelder bromvand i igen. */
    P.spildKolbe = function () {
        var k = this.g.kolbe;
        var farve = this.kolbeFarve() || M.FARVE.bromvand;
        var brom = this.visBr > 0.05 && !this.gjort.reageret;
        var ab = NK.tilVerden(k.p, k.anker, 75, 4);
        var i;
        this.rystKilde = null;
        this.holdt = null;
        this.farligTid = 0;
        this.spildTid = 0;
        this.uro = 0;
        this.ryst = 0;
        this.musFart = 0;
        this.vold = 0;
        for (i = 0; i < 26; i++) {
            this.draaber.push({ x: ab.x + r(-5, 5), y: ab.y, vx: r(-240, 240), vy: -r(120, 340), r: r(1.6, 3), liv: 1, farve: farve, fysik: true });
        }
        this.spildPyt = { x: NK.klamp(k.p.x, 280, 420), rx: 10, rxMaal: 70, farve: farve, vaad: 1, neutral: 0, brom: brom };
        k.areal = 0;
        this.mikro.kolbe.nulstil();
        if (this.gjort.kobber) this.mikro.kolbe.tilfoejKobber();
        this.gjort.brom = false;
        this.gjort.reageret = false;
        this.visBr = 1;
        this.ryk = 5;
        if (NK.Lyd) NK.Lyd.plask();
        this.iagttag("spildt");
        this.besked("Der var ingen prop i. Bromvandet skvulpede ud.", "advarsel");
        this.koer([hjemTil(k, 0.4, 0)], "hjem");
        if (this.laererSpild) this.laererSpild();
        this.aendret("spild");
    };

    /* ----- Fordeling i reagensglassene ------------------------------------ */
    P.fordel = function () {
        var k = this.g.kolbe, g1 = this.g.glas1, g2 = this.g.glas2;
        var halv = k.areal / 2;
        var start = 0;
        function over(gl) { return { x: gl.p.x - 5, y: gl.p.y - 24, v: 1.78 }; }
        function haeld(gl, nr) {
            return [
                { kald: function () {
                    this.mikro["glas" + nr].fyldFra(this.mikro.kolbe, nr - 1);
                    if (NK.Lyd) NK.Lyd.haeld(1.1);
                    start = k.areal;
                } },
                { tid: 1.1, hver: function (t) {
                    var e = NK.blod(t);
                    k.areal = start - halv * e;
                    gl.areal = S.GLAS_FULD * e;
                    var bund = NK.tilVerden(gl.p, gl.anker, 15, 150).y;
                    this.straale = { fra: { x: k.p.x - 3, y: k.p.y + 2 }, til: { x: gl.p.x, y: gl.niveau ? gl.niveau : bund }, farve: this.kolbeFarve(), bredde: 3 };
                } },
                { kald: function () { this.straale = null; } }
            ];
        }
        this.koer([{ flyt: k, til: over(g1), tid: 1.0, loeft: 60 }]
            .concat(haeld(g1, 1))
            .concat([{ flyt: k, til: over(g2), tid: 0.5, loeft: 14 }])
            .concat(haeld(g2, 2))
            .concat([
                { kald: function () {
                    k.areal = 0;
                    this.mikro.kolbe.fjernIoner();
                    this.gjort.fordelt = true;
                    this.aendret("fordelt");
                } },
                hjemTil(k, 1.0, 50)
            ]), "fordel");
    };

    /* ----- Draaber ---------------------------------------------------------- */
    P.findGlas = function (navn) {
        var g1 = this.g.glas1, g2 = this.g.glas2;
        if (g1.reagens === navn) return g1;
        if (g2.reagens === navn) return g2;
        if (!g1.reagens) return g1;
        if (!g2.reagens) return g2;
        return null;
    };

    P.brugDraabe = function (navn) {
        if (!this.gjort.fordelt) { this.besked("Hæld først væsken over i reagensglassene."); return false; }
        if (this.gjort.affald) { this.besked("Forsøget er slut."); return false; }
        var d = this.g[navn];
        var glas = this.findGlas(navn);
        if (!glas) { this.besked("Begge glas er brugt."); return false; }
        if (glas.draaber >= M.MAENGDE.MAKS_DRAABER) { this.besked("Der sker ikke mere i glasset."); return false; }
        glas.reagens = navn;

        var liste = [];
        var anden = this.g[navn === "nh3" ? "agno3" : "nh3"];
        if (anden.svaev) { anden.svaev = null; liste.push(hjemTil(anden, 0.6, 30)); }
        if (!(d.svaev && d.svaev.glas === glas)) {
            liste.push({ flyt: d, til: { x: glas.p.x, y: glas.p.y - 18, v: Math.PI }, tid: 0.7, loeft: 50 });
        }
        liste.push({ tid: 0.15 });
        liste.push({ kald: function () {
            this.draaber.push({
                x: d.p.x, y: d.p.y + 4, vy: 40, r: 3.6, liv: 1, farveloes: true,
                glas: glas, reagens: navn
            });
            d.svaev = { glas: glas, ur: 2.6 };
            this.aendret("draabe");
        } });
        this.koer(liste, "draabe");
        return true;
    };

    P.draabeLander = function (dr) {
        var gl = dr.glas;
        this.iagttag("draabe_" + dr.reagens);
        gl.draaber++;
        gl.areal += 14;
        var m = this.mikro[gl.navn];
        if (dr.reagens === "nh3") m.tilfoejNH3(); else m.tilfoejAgNO3();
        if (NK.Lyd) NK.Lyd.plip();
        this.aendret("draabe");
    };

    /* ----- Affald ------------------------------------------------------------ */
    P.aflever = function () {
        var d = S.DUNK.aabning;
        var k = this.g.kolbe;
        var liste = [];
        [this.g.glas1, this.g.glas2].forEach(function (gl) {
            var start = 0;
            liste.push({ flyt: gl, til: { x: d.x - 4, y: d.y - 34, v: 2.3 }, tid: 0.9, loeft: 60 });
            liste.push({ kald: function () { start = gl.areal; if (NK.Lyd) NK.Lyd.haeld(0.8); } });
            liste.push({ tid: 0.8, hver: function (t) {
                gl.areal = start * (1 - t);
                gl.visBund *= 1 - t;
                this.straale = { fra: { x: gl.p.x, y: gl.p.y }, til: { x: d.x - 2, y: d.y + 6 }, farve: this.glasFarve(gl), bredde: 2.5 };
            } });
            liste.push({ kald: function () { this.straale = null; gl.areal = 0; gl.visBund = 0; gl.uklar = 0; this.mikro[gl.navn].nulstil(); } });
            liste.push(hjemTil(gl, 0.9, 60));
        });
        var drysset = 0;
        liste.push({ flyt: k, til: { x: d.x - 8, y: d.y - 46, v: 2.2 }, tid: 1.0, loeft: 60 });
        liste.push({ tid: 0.7, hver: function (t) {
            k.kobber = Math.max(0, 1 - t) * this.mikro.kolbe.kobberAndel();
            while (drysset < t * 10) {
                drysset++;
                this.faldende.push({ x: k.p.x + r(-4, 4), y: k.p.y + 2, vx: r(-10, 10), vy: r(0, 30), a: r(0, 6), va: r(-8, 8), r: r(2, 3.4), maal: "dunk", alfa: 1 });
            }
        } });
        liste.push({ kald: function () { k.kobber = 0; this.mikro.kolbe.nulstil(); } });
        liste.push(hjemTil(k, 1.0, 50));
        liste.push({ kald: function () {
            this.gjort.affald = true;
            this.besked("Affaldet er afleveret. Forsøget er slut.", "god");
            if (NK.Lyd) NK.Lyd.succes();
            this.aendret("affald");
        } });
        this.koer(liste, "affald");
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = S.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    var RAEKKEFOELGE = ["prop", "nh3", "agno3", "bromflaske", "urglas", "kolbe", "glas1", "glas2"];

    P.hvad = function (pt) {
        if (this.overLaerer) {
            var l = this.overLaerer(pt);
            if (l) return l;
        }
        if (this.uheld && this.overUheld) {
            var u = this.overUheld(pt);
            if (u) return u;
        }
        var K = S.KONTAKT;
        if (pt.x > K.x0 && pt.x < K.x1 && pt.y > K.y0 && pt.y < K.y1) return "kontakt";
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && S.inden("kaffekop", kop.p, kop.anker, pt.x, pt.y, 6)) return "kaffekop";
        /* Proppen sidder i kolbens hals. Den skal vinde over kolben, ellers
           tager man fat i kolben, naar man vil tage proppen af. */
        var k = this.g.kolbe;
        if (k.prop && !k.skjult && S.inden("prop", this.propIKolbe(), S.ANKER.prop, pt.x, pt.y, 12)) return "prop";
        for (var i = 0; i < RAEKKEFOELGE.length; i++) {
            var gg = this.g[RAEKKEFOELGE[i]];
            if (gg.skjult || (gg.navn === "prop" && gg.iKolbe)) continue;
            if (S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, 6)) return gg.navn;
        }
        if (pt.x > S.DUNK.x && pt.x < S.DUNK.x + 90 && pt.y > S.DUNK.y - 4 && pt.y < S.BORD) return "dunk";
        if (pt.x > S.VASK.x + 5 && pt.x < S.VASK.x + 105 && pt.y > S.VASK.y + 10 && pt.y < S.BORD + 12) return "vask";
        return null;
    };

    P.kolbeHjemme = function () {
        var k = this.g.kolbe;
        return Math.abs(k.p.x - k.hjem.x) < 2 && Math.abs(k.p.y - k.hjem.y) < 2;
    };

    P.ned = function (pt) {
        if (NK.Lyd) NK.Lyd.laasOp();
        if (this.uheld && this.nedUheld && this.nedUheld(pt)) return true;
        var navn = this.hvad(pt);
        if (!navn) return false;
        var optaget = this.laererOptaget && this.laererOptaget();
        if (navn === "kolbe" && !optaget && !this.uheld && !this.handling && !this.rystKilde && this.kolbeHjemme()) {
            var k = this.g.kolbe;
            this.holdt = { start: pt, dx: pt.x - k.p.x, dy: pt.y - k.p.y, flyttet: false, sidst: pt, t: Date.now() };
            return true;
        }
        this.klik(navn);
        return false;
    };

    /* nu: tidspunktet for musebevaegelsen i ms (ev.timeStamp) */
    P.flyt = function (pt, nu) {
        if (this.uheld && this.flytUheld && this.flytUheld(pt)) return;
        var h = this.holdt;
        if (!h) {
            this.hover = this.hvad(pt);
            return;
        }
        if (this.uheld) { this.holdt = null; return; }
        var k = this.g.kolbe;
        if (nu === undefined) nu = Date.now();
        if (!h.flyttet) {
            if (Math.abs(pt.x - h.start.x) + Math.abs(pt.y - h.start.y) < 8) return;
            if (!this.kanRyste()) { this.holdt = null; return; }
            h.flyttet = true;
            h.sidst = pt;
            h.t = nu;
            this.startRyst("mus");
        }
        var dts = Math.max(4, nu - h.t) / 1000;
        var dx = pt.x - h.sidst.x, dy = pt.y - h.sidst.y;
        this.musVx = NK.lerp(this.musVx, dx / dts, 0.5);
        this.musFart = NK.lerp(this.musFart, Math.sqrt(dx * dx + dy * dy) / dts, 0.35);
        h.sidst = pt;
        h.t = nu;
        k.p.x = NK.klamp(pt.x - h.dx, k.hjem.x - 90, k.hjem.x + 90);
        k.p.y = NK.klamp(pt.y - h.dy, k.hjem.y - 80, k.hjem.y);
    };

    P.op = function () {
        if (this.uheld && this.opUheld && this.opUheld()) return;
        var h = this.holdt;
        if (!h) return;
        this.holdt = null;
        if (!h.flyttet) { this.klik("kolbe"); return; }
        this.stopRyst();
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
            mig.flyt(mig.tilBord(ev), ev.timeStamp || Date.now());
            c.style.cursor = mig.holdt || (mig.uheld && mig.uheld.traek) ? "grabbing" : (mig.hover ? (mig.hover === "kolbe" && mig.kanRysteNu() ? "grab" : "pointer") : "default");
        });
        c.addEventListener("pointerup", function () { mig.op(); });
        c.addEventListener("pointercancel", function () { mig.op(); });
        c.addEventListener("pointerleave", function () { if (!mig.holdt) mig.hover = null; });
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdater = function (dt) {
        var i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        var g = this.g, k = g.kolbe;

        this.opdaterHandling(dt);
        this.opdaterRyst(dt);
        if (this.opdaterUheld) this.opdaterUheld(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);

        /* Brom fremme uden udsugning: dampene kommer ud i lokalet, og
           efter 1,6 sekunder kommer laereren og taender udsugningen */
        var udenUdsugning = !this.udsugning && this.bromFremme();
        this.taage = NK.mod(this.taage, udenUdsugning ? 1 : 0, udenUdsugning ? 0.25 : 0.8, dt);
        if (udenUdsugning) {
            this.udenUdsugning += dt;
            if (this.udenUdsugning > 1.6 && this.laererUdsugning && this.laerer && !this.laerer.scene) {
                this.iagttag("udsugning");
                this.besked("Bromdampene kommer ud i lokalet!", "advarsel");
                this.laererUdsugning();
            }
        } else {
            this.udenUdsugning = 0;
        }

        this.vingeFart = NK.mod(this.vingeFart, this.udsugning ? 20 : 0, 1.4, dt);
        this.vinge += this.vingeFart * dt;
        this.luft = NK.mod(this.luft, this.udsugning ? 1 : 0, 1.2, dt);
        if (this.mark) { this.mark.ur -= dt; if (this.mark.ur <= 0) this.mark = null; }
        this.ryk = this.ryk > 0.2 ? this.ryk * (1 - dt * 7) : 0;

        /* Partikelmodellerne og farverne */
        this.mikro.kolbe.opdater(dt, k.prop && this.rystKilde ? Math.min(1, this.ryst * 1.4) : 0);
        if (this.gjort.brom && !this.uheld) this.visBr = NK.mod(this.visBr, this.mikro.kolbe.brAndel(), 1.4, dt);

        if (this.gjort.brom && !this.gjort.reageret && !this.uheld && this.mikro.kolbe.brAndel() === 0 && !this.mikro.kolbe.travl()) {
            this.gjort.reageret = true;
            this.iagttag("reageret");
            this.besked("Farven ændrer sig ikke mere.", "god");
            if (NK.Lyd) NK.Lyd.succes();
            this.aendret("reageret");
        }
        if (!this.uheld && this.gjort.kobber && k.areal > 0) k.kobber = NK.mod(k.kobber, 0.55 + 0.45 * this.mikro.kolbe.kobberAndel(), 2, dt);

        var mig = this;
        [g.glas1, g.glas2].forEach(function (gl) {
            var m = mig.mikro[gl.navn];
            if (!mig.gjort.fordelt) return;
            m.opdater(dt, 0);
            m.farve = mig.glasFarve(gl);
            gl.visKompleks = NK.mod(gl.visKompleks, m.kompleksAndel(), 1.2, dt);
            var bund = m.bundfaldAndel();
            gl.visBund = NK.mod(gl.visBund, bund, 0.7, dt);
            gl.uklar = NK.mod(gl.uklar, NK.klamp((bund - gl.visBund) * 3 + (bund > 0 ? 0.12 : 0), 0, 1), 3, dt);
            if (gl.reagens === "nh3" && !mig.gjort.nh3 && gl.draaber > 0 && m.kompleksAndel() >= 0.999) {
                mig.gjort.nh3 = true;
                mig.iagttag("nh3", gl);
                if (NK.Lyd) NK.Lyd.succes();
                mig.aendret("nh3");
            }
            if (gl.reagens === "agno3" && !mig.gjort.agno3 && bund >= 0.999) {
                mig.gjort.agno3 = true;
                mig.iagttag("agno3", gl);
                if (NK.Lyd) NK.Lyd.succes();
                mig.aendret("agno3");
            }
        });

        /* Draabeflasker, der svaever over et glas, gaar hjem efter lidt tid */
        ["nh3", "agno3"].forEach(function (navn) {
            var d = g[navn];
            if (!d.svaev) return;
            d.svaev.ur -= dt;
            if (d.svaev.ur <= 0 && !mig.handling) {
                d.svaev = null;
                mig.koer([hjemTil(d, 0.7, 40)], "hjem");
            }
        });

        /* Zoomboblerne */
        var hn = this.handling ? this.handling.navn : "";
        var visKolbe = (this.gjort.kobber || this.gjort.brom) && !this.gjort.fordelt && !this.uheld && hn !== "fordel";
        var visGlas = this.gjort.fordelt && !this.gjort.affald && hn !== "affald";
        this.bobleAlfa.kolbe = NK.mod(this.bobleAlfa.kolbe, visKolbe ? 1 : 0, 5, dt);
        this.bobleAlfa.glas1 = NK.mod(this.bobleAlfa.glas1, visGlas ? 1 : 0, 4, dt);
        this.bobleAlfa.glas2 = this.bobleAlfa.glas1;

        this.haandAlfa = NK.mod(this.haandAlfa, this.rystKilde || this.holdt ? 1 : 0, 10, dt);

        this.opdaterEffekter(dt);

        var t = this.aktueltTrin();
        var id = t ? t.id : "slut";
        if (id !== this.sidsteTrin) { this.sidsteTrin = id; this.trinStart = this.tid; }
    };

    P.opdaterEffekter = function (dt) {
        var i, k = this.g.kolbe;
        for (i = this.faldende.length - 1; i >= 0; i--) {
            var f = this.faldende[i];
            f.vy += 700 * dt;
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            f.a += f.va * dt;
            var bund = f.maal === "kolbe" ? NK.tilVerden(k.p, k.anker, 75, 180).y : S.DUNK.aabning.y + 10;
            if (f.y > bund) this.faldende.splice(i, 1);
        }
        for (i = this.draaber.length - 1; i >= 0; i--) {
            var d = this.draaber[i];
            d.vy += 900 * dt;
            d.y += d.vy * dt;
            d.x += (d.vx || 0) * dt;
            if (d.fysik) {
                if (d.y > S.BORD - 1) this.draaber.splice(i, 1);
                continue;
            }
            var gl = d.glas;
            var flade = gl.niveau ? gl.niveau : NK.tilVerden(gl.p, gl.anker, 15, 150).y;
            if (d.y >= flade) {
                this.draaber.splice(i, 1);
                this.draabeLander(d);
            }
        }

        if (this.spildPyt) this.spildPyt.rx = NK.mod(this.spildPyt.rx, this.spildPyt.rxMaal, 3, dt);

        /* Brom-dampe fra aaben kolbe og fra pytten efter spild: udsugningen
           suger dem opad. Uden udsugning kommer der flere, og de breder sig. */
        var aaben = this.gjort.brom && !k.prop && this.visBr > 0.05 && !this.uheld && !this.gjort.fordelt;
        var sp = this.spildPyt;
        var pyt = !!(sp && sp.brom && sp.neutral < 0.9 && sp.vaad > 0.1);
        var spred = this.udsugning ? 1 : 4;
        this.dampUr -= dt;
        if ((aaben || pyt) && this.dampUr <= 0) {
            this.dampUr = this.udsugning ? 0.3 : 0.15;
            if (aaben) this.dampe.push({ x: k.p.x + r(-8, 8), y: k.p.y - 4, vx: r(-8, 8) * spred, vy: r(-22, -10), r: r(5, 9), liv: 0.9 * this.visBr });
            if (pyt) this.dampe.push({ x: sp.x + r(-0.8, 0.8) * sp.rx, y: S.BORD - 2, vx: r(-6, 6) * spred, vy: r(-30, -14), r: r(6, 11), liv: 0.9 * (1 - sp.neutral) });
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

    /* ----- Tegning -------------------------------------------------------- */
    P.tilpas = function () {
        return this.laerred.tilpas();
    };

    P.oppe = function (gg) {
        if (gg.navn === "kolbe" && (this.holdt || this.rystKilde)) return true;
        return Math.abs(gg.p.x - gg.hjem.x) + Math.abs(gg.p.y - gg.hjem.y) > 1.5 || Math.abs(gg.p.v) > 0.01;
    };

    P.tegnGenstand = function (ctx, gg, tid, hjemme) {
        var mark = this.markeret(gg.navn);
        switch (gg.navn) {
            case "urglas":
                if (hjemme) S.skygge(ctx, S.HJEM.urglas.x, 50, 0.25);
                if (gg.kobberVis > 0.01) {
                    ctx.save();
                    ctx.translate(gg.p.x, gg.p.y);
                    ctx.rotate(gg.p.v);
                    var s = 0.4 + 0.6 * gg.kobberVis;
                    NK.Sprites.tegn(ctx, "kobber", -45 * s, 15 - 34 * s, 90 * s, 34 * s);
                    ctx.restore();
                }
                NK.Sprites.tegnPositur(ctx, "urglas", gg.p, gg.anker);
                break;
            case "bromflaske":
                if (hjemme) S.skygge(ctx, 190, 40);
                NK.Sprites.tegnPositur(ctx, "bromflaske", gg.p, gg.anker);
                NK.Sprites.tegnPositur(ctx, "skruelaag", this.laagPositur(), S.ANKER.skruelaag);
                break;
            case "glas1":
            case "glas2":
                gg.niveau = S.tegnReagensglas(ctx, {
                    p: gg.p, areal: gg.areal, farve: this.glasFarve(gg),
                    bundfald: gg.visBund, uklar: gg.uklar, fremhaev: mark
                }, tid);
                mark = false;
                break;
            case "prop":
                if (gg.iKolbe) return;
                NK.Sprites.tegnPositur(ctx, "prop", gg.p, gg.anker);
                break;
            case "kolbe":
                if (gg.skjult) return;
                if (hjemme) S.skygge(ctx, 345, 70);
                gg.niveau = S.tegnKolbe(ctx, {
                    p: gg.p, areal: gg.areal, farve: this.kolbeFarve(), kobber: gg.kobber, prop: gg.prop,
                    boelge: this.ryst * 3.5 + (this.handling && this.handling.navn === "fordel" ? 1.2 : 0),
                    dampe: this.gjort.brom && !gg.prop ? this.visBr : 0, fremhaev: mark
                }, tid);
                mark = false;
                break;
            default:
                if (hjemme) S.skygge(ctx, gg.hjem.x, 22, 0.3);
                NK.Sprites.tegnPositur(ctx, gg.sprite, gg.p, gg.anker);
        }
        if (mark) S.tegnMarkering(ctx, S.rekt(gg.sprite, gg.p, gg.anker, 0), tid);
    };

    P.tegnBobler = function (ctx, tid) {
        var k = this.g.kolbe;
        if (this.bobleAlfa.kolbe > 0.01 && !k.skjult) {
            var lp = NK.tilVerden(k.p, k.anker, S.LUP.kolbe.x, S.LUP.kolbe.y);
            S.tegnForbindelse(ctx, lp, S.BOBLE.kolbe, this.bobleAlfa.kolbe);
            this.mikro.kolbe.farve = this.kolbeFarve();
            this.mikro.kolbe.tegn(ctx, S.BOBLE.kolbe, this.bobleAlfa.kolbe, "Kolben", tid);
        }
        var mig = this;
        ["glas1", "glas2"].forEach(function (navn) {
            var a = mig.bobleAlfa[navn];
            if (a < 0.01) return;
            var gl = mig.g[navn];
            var lp = NK.tilVerden(gl.p, gl.anker, S.LUP.glas.x, S.LUP.glas.y);
            S.tegnForbindelse(ctx, lp, S.BOBLE[navn], a);
            var titel = "Glas " + gl.nr + (gl.reagens === "nh3" ? " + NH₃" : (gl.reagens === "agno3" ? " + AgNO₃" : ""));
            mig.mikro[navn].tegn(ctx, S.BOBLE[navn], a, titel, tid);
        });
    };

    P.tegn = function () {
        var L = this.laerred;
        var ctx = L.ctx;
        ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        var tid = this.tid, g = this.g, i;

        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);
        if (this.ryk > 0) ctx.translate((Math.random() - 0.5) * this.ryk, (Math.random() - 0.5) * this.ryk);

        S.tegnBaggrund(ctx);
        S.tegnLuft(ctx, this.luft, tid);
        S.tegnKontrolpanel(ctx, this.udsugning, this.vinge, this.markeret("kontakt"), tid);
        var kop = g.kaffekop;
        if (!kop.skjult && !kop.iHaand) NK.Sprites.tegnPositur(ctx, "kaffekop", kop.p, kop.anker);
        S.tegnVask(ctx);
        S.tegnDunk(ctx);
        if (this.markeret("dunk")) S.tegnMarkering(ctx, { x: S.DUNK.x, y: S.DUNK.y, b: 90, h: 130 }, tid);
        if (this.tegnUheld) this.tegnUheld(ctx, "bord", tid);
        S.tegnPyt(ctx, this.spildPyt);

        var aktive = [];
        var orden = ["urglas", "bromflaske", "glas1", "glas2", "STATIV", "nh3", "agno3", "prop", "kolbe"];
        for (i = 0; i < orden.length; i++) {
            if (orden[i] === "STATIV") { S.tegnStativ(ctx); continue; }
            var gg = g[orden[i]];
            if (this.oppe(gg)) aktive.push(gg);
            else this.tegnGenstand(ctx, gg, tid, true);
        }
        if (this.tegnUheld) this.tegnUheld(ctx, "redskaber", tid);

        this.tegnBobler(ctx, tid);

        for (i = 0; i < aktive.length; i++) this.tegnGenstand(ctx, aktive[i], tid, false);

        if (this.haandAlfa > 0.01 && !g.kolbe.skjult) {
            var hp = NK.tilVerden(g.kolbe.p, g.kolbe.anker, 75, 38);
            NK.Sprites.tegnPositur(ctx, "haand", { x: hp.x, y: hp.y, v: g.kolbe.p.v }, S.ANKER.haand, this.haandAlfa);
        }

        if (this.straale) S.tegnStraale(ctx, this.straale.fra, this.straale.til, this.straale.farve, this.straale.bredde, tid);
        for (i = 0; i < this.faldende.length; i++) {
            var f = this.faldende[i];
            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.a);
            ctx.strokeStyle = "#d98a4a";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(0, 0, f.r, 0.4, 4.4);
            ctx.stroke();
            ctx.restore();
        }
        S.tegnDraaber(ctx, this.draaber);
        S.tegnDampe(ctx, this.dampe);
        if (this.tegnUheld) this.tegnUheld(ctx, "top", tid);
        S.tegnTaage(ctx, this.taage);
        if (this.tegnLaerer) this.tegnLaerer(ctx, tid);
        ctx.restore();
    };
}());
