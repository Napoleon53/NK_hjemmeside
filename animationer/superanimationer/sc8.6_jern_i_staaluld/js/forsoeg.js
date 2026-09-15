/* =====================================================================
   forsoeg.js - selve forsoeget: tilstand, trin og handlinger

   Trinene (TRIN) er de ni ting, eleven skal naa. Et trin er gjort, naar
   tilstanden siger det, ikke naar en knap er trykket. Genstandene flyttes
   af smaa koreografier (koer): en liste af trin, der enten flytter en
   genstand, venter og goer noget undervejs, eller kalder en funktion.
   Mens en koreografi koerer, reagerer scenen ikke paa nye klik.

   Tegningen og musen staar i bord.js, laereren i laerer.js og kemien
   i model.js.

   Buretten: aflaesningen V er 0 foroven. Hanen aabnes og lukkes med et
   klik; knappen Draabe giver én draabe ad gangen. Det, der loeber ud,
   havner i kolben, hvis den staar under buretten, og ellers i
   affaldsbaegeret.

   Eleven maa gerne goere det forkerte. Traek og haeld udfoeres altid;
   kun det, der fysisk ikke kan lade sig goere, afvises. Et klik uden en
   bestemt betydning giver en kort vejledning. Fejlene noteres i
   this.iagttaget, laereren kommenterer dem (laerer.js), og tegneserien
   viser dem (tegneserie.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var r = NK.r;
    var A = S.ANKER;
    var B = S.BURET;

    function kopi(p) { return { x: p.x, y: p.y, v: p.v }; }

    var TRIN = [
        { id: "afvej", tekst: "Afvej ca. 0,1 g ståluld", mark: "staaluld",
          hint: "Klik på stålulden, til vægten viser ca. 0,1 g. Træk så vejebåden hen til kolben i stinkskabet." },
        { id: "syre", tekst: "Tilsæt syre", mark: "flasker",
          hint: "Træk en af de to syreflasker hen over kolben." },
        { id: "oploes", tekst: "Opløs stålulden", mark: "kolbe",
          hint: "Træk kolben hen på varmepladen. Vent, til der ikke er mere ståluld og ikke flere bobler." },
        { id: "fyld", tekst: "Fyld buretten med KMnO₄", mark: "kmno4",
          hint: "Træk flasken med kaliumpermanganat hen over tragten på buretten." },
        { id: "nul", tekst: "Tap af til 0 mL", mark: "hane",
          hint: "Klik på hanen. Klik igen, når menisken i zoomboblen står på 0." },
        { id: "start", tekst: "Aflæs V(start)", mark: "buret",
          hint: "Klik på knappen Aflæs eller på buretten. Aflæsningen skrives i skemaet." },
        { id: "under", tekst: "Stil kolben under buretten", mark: "kolbe",
          hint: "Træk kolben hen under buretten." },
        { id: "titrer", tekst: "Titrer til en svag, blivende lyserød farve", mark: "hane",
          hint: "Klik på hanen for at åbne og lukke den. Vælg Hane: Hurtig i starten. Tilsæt de sidste dråber én ad gangen med knappen Dråbe, og ryst kolben imellem ved at trække i den." },
        { id: "slut", tekst: "Aflæs V(slut)", mark: "buret",
          hint: "Luk hanen, når den lyserøde farve bliver, og klik på knappen Aflæs." },
        { id: "beregn", tekst: "Beregn jernindholdet", mark: null,
          hint: "Brug massen af stålulden, de to aflæsninger og koncentrationen i skemaet." }
    ];
    NK.TRIN = TRIN;

    /* Fejl og uheld, der noteres i this.iagttaget og vises i tegneserien:
       lidtStaal, megetStaal, toSyrer, kmno4Kolbe, ingenSyre, uoploest,
       glemtStart, ikkeNulstillet, affaldTaelt, genfyldt, ikkeLyserod,
       lilla, falmer, klor, skvulp, overloeb, vaegt og spild. */

    NK.Forsoeg = function (canvas) {
        this.canvas = canvas;
        this.laerred = canvas ? new NK.Laerred(canvas) : null;
        this.tid = 0;
        this.forsoegNr = 0;
        this.resultater = [];
        this.urMinutter = 5;
        this.koppenVaek = false;
        this.plet = null;
        this.vedAendring = null;
        this.vedBesked = null;
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

        this.stykker = [];
        this.iLuften = 0;
        this.iFlugt = 0;
        this.mStaal = null;
        this.vStart = null;
        this.vSlut = null;
        this.antalForkerte = 0;
        this.traekMaal = null;

        /* mL KMnO₄ fra buretten i kolben efter startaflaesningen, i
           affaldet efter den og paa flisen, og haeldt direkte i kolben.
           aflaestI: den lyserøde intensitet ved slutaflaesningen. */
        this.kolbeEfterStart = 0;
        this.affaldEfterStart = 0;
        this.spildMl = 0;
        this.kmno4Direkte = 0;
        this.aflaestI = 0;

        this.kem = M.nyKemi();
        this.temp = 22;
        this.pladeTemp = 22;
        this.pladeTaendt = false;
        this.buret = { V: 50, fyldt: false, aaben: false };
        this.haneFart = "langsom";
        this.affaldMl = 0;
        this.affaldFarve = null;
        this.laagT = { svovlsyre: 0, saltsyre: 0, kmno4: 0 };

        this.g = {
            staaluld:  genstand("staaluld", "staaluld", S.HJEM.staaluld),
            vejebaad:  genstand("vejebaad", "vejebaad", S.HJEM.vejebaad),
            kolbe:     genstand("kolbe", "kolbe", S.HJEM.kolbe),
            svovlsyre: genstand("svovlsyre", "svovlsyre", S.HJEM.svovlsyre),
            saltsyre:  genstand("saltsyre", "saltsyre", S.HJEM.saltsyre),
            kmno4:     genstand("kmno4", "kmno4", S.HJEM.kmno4),
            affald:    genstand("affald", "baegerglas", S.HJEM.affald),
            kaffekop:  genstand("kaffekop", "kaffekop", S.HJEM.kaffekop)
        };
        this.g.kaffekop.skjult = this.koppenVaek;
        this.g.kolbe.sted = "hjem";
        this.g.kolbe.niveau = null;
        this.g.affald.sted = "buret";
        this.g.affald.niveau = null;
        this.kolbeBobler = [];
        this.rystForskyd = { x: 0, y: 0, v: 0 };

        this.vaegtVisning = 0;
        this.handling = null;
        this.holdt = null;
        this.hover = null;
        this.arbejdKilde = null;
        this.musFart = 0;
        this.ryst = 0;
        this.amokTid = 0;
        this.amokPause = 0;
        this.mark = null;
        this.ryk = 0;

        this.straale = null;
        this.vaegtPyt = null;
        this.flyvende = [];
        this.draaber = [];
        this.dampe = [];
        this.draabeUr = 0;
        this.dampUr = 0;
        this.lydUr = 0;
        this.sidsteDraabe = -99;
        this.lokalX = B.x;
        this.lyserodTid = 0;
        this.aubergine = false;

        this.mikro = new NK.Mikro();
        this.bobleAlfa = 0;
        this.bobleSted = { x: S.BOBLE.ude.x, y: S.BOBLE.ude.y };
        this.bobleMaal = null;
        this.bobleTitel = "";
        if (this.laererNyt) this.laererNyt();
        this.aendret("nulstil");
    };

    /* ----- Til panelet ------------------------------------------------ */
    P.syreObj = function () {
        return this.kem.syre ? M.SYRER[this.kem.syre] : null;
    };

    P.trinGjort = function (id) {
        var gj = this.gjort;
        switch (id) {
            case "syre": return !!this.kem.syre;
            case "oploes": return this.kem.opl >= M.OPLOES.faerdig || this.g.kolbe.sted === "buret";
            case "fyld": return this.buret.fyldt;
            case "nul": return this.vStart !== null || (this.buret.fyldt && !this.buret.aaben && this.buret.V >= -M.BURET.fang);
            case "start": return this.vStart !== null;
            case "under": return this.g.kolbe.sted === "buret" || this.vSlut !== null;
            case "titrer": return !!gj.titrer || this.vSlut !== null;
            case "slut": return this.vSlut !== null;
            default: return !!gj[id];
        }
    };

    P.aktueltTrin = function () {
        for (var i = 0; i < TRIN.length; i++) if (!this.trinGjort(TRIN[i].id)) return TRIN[i];
        return null;
    };

    P.hint = function () {
        var t = this.aktueltTrin();
        if (!t) return null;
        var mark = t.mark;
        var tekst = t.hint;
        var b = this.buret, m = this.stykMasse();
        if (t.id === "afvej" && m >= M.AFVEJ.min && m <= M.AFVEJ.max) mark = "vejebaad";
        if (t.id === "nul" && b.aaben) tekst = "Klik på hanen igen, når menisken i zoomboblen står på 0.";
        if (t.id === "nul" && !b.aaben && b.V < -M.BURET.fang) tekst = "Menisken står stadig over 0. Klik på hanen, og tap lidt mere af.";
        if (t.id === "slut" && b.aaben) mark = "hane";
        if (mark) this.markér(mark, 5);
        return tekst;
    };

    P.markér = function (navn, sek) {
        this.mark = { navn: navn, ur: sek || 3 };
    };

    P.markeret = function (navn) {
        return !!(this.mark && this.mark.navn === navn && this.mark.ur > 0);
    };

    P.aendret = function (grund) {
        this.sidsteAendring = this.tid;
        if (this.vedAendring) this.vedAendring(grund);
    };

    P.besked = function (tekst, slags) {
        if (this.vedBesked) this.vedBesked(tekst, slags || "info");
    };

    /* Noterer en fejl til tegneserien. bemaerk: laereren kommenterer den. */
    P.iagttag = function (noegle, bemaerk) {
        if (this.iagttaget[noegle]) return;
        this.iagttaget[noegle] = true;
        if (bemaerk && this.laererBemaerk) this.laererBemaerk(noegle);
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
        /* En aaben hane kan altid lukkes, ogsaa mens noget andet koerer */
        if (navn === "hane" && this.buret.aaben) return this.lukHane();
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (this.handling || this.holdt || this.arbejdKilde) return false;
        switch (navn) {
            case "kaffekop": return this.klikKop ? this.klikKop() : false;
            case "staaluld": return this.klikStaaluld();
            case "vejebaad": return this.klikVejebaad();
            case "kolbe": return this.klikKolbe();
            case "svovlsyre": case "saltsyre":
                this.besked(this.kem.syre ? "Der er allerede syre i kolben." : "Træk flasken hen over kolben.");
                return false;
            case "kmno4":
                this.besked(this.vStart !== null ? "Buretten er fyldt." : "Træk flasken hen over tragten på buretten.");
                return false;
            case "hane": return this.klikHane();
            case "buret": return this.klikBuret();
            case "affald":
                this.besked("Træk affaldsbægeret derhen, hvor det skal stå, eller hæld kemikalier i det.");
                return false;
            case "varmeplade":
                if (this.g.kolbe.sted === "hjem" && this.kem.syre && this.kem.opl < M.OPLOES.faerdig) return this.tilPlade();
                this.besked("Varmepladen kan varme kolben op.");
                return false;
            case "vaegt":
                this.besked("Vægten viser massen af det, der ligger på den.");
                return false;
        }
        return false;
    };

    /* ----- Afvejning --------------------------------------------------- */
    P.stykMasse = function () {
        var m = 0;
        this.stykker.forEach(function (c) { m += c.m; });
        return m;
    };

    P.klikStaaluld = function () {
        if (this.gjort.afvej) { this.besked("Der er ståluld nok i kolben."); return false; }
        if (this.stykMasse() + this.iLuften > M.GRAENSE.vejebaad) {
            this.besked("Vejebåden er fuld.", "advarsel");
            return false;
        }
        var m = M.afrund(r(M.AFVEJ.stykMin, M.AFVEJ.stykMax), 3);
        var su = this.g.staaluld.p, baad = this.g.vejebaad.p;
        this.iLuften += m;
        this.iFlugt++;
        this.flyvende.push({
            tot: true, x: su.x, y: su.y - 30, a: r(0, 6), va: r(-6, 6), r: 6,
            fra: { x: su.x + r(-10, 10), y: su.y - 30 }, til: { x: baad.x + r(-14, 14), y: baad.y - 4 }, t: 0, varighed: 0.5,
            vedLanding: function () {
                this.iLuften -= m;
                this.iFlugt--;
                if (this.iFlugt <= 0) { this.iFlugt = 0; this.iLuften = 0; }
                this.stykker.push({ m: m, dx: r(-18, 18), dy: -2 - this.stykker.length * 1.2, a: r(-0.6, 0.6), s: r(0.8, 1.05) });
                if (NK.Lyd) NK.Lyd.tik();
                this.aendret("tot");
            }
        });
        if (NK.Lyd) NK.Lyd.klik();
        return true;
    };

    /* Klik: over 0,13 g laegges en tot tilbage, ellers haeldes stålulden i
       kolben. fraTraek: vejebaaden er trukket hen til kolben, og alt
       haeldes i, uanset massen. */
    P.klikVejebaad = function (fraTraek) {
        if (this.gjort.afvej) { this.besked("Vejebåden er tom."); return false; }
        if (this.iFlugt > 0) return false;
        var m = M.afrund(this.stykMasse(), 3);
        if (!this.stykker.length) {
            this.besked("Klik på stålulden for at lægge lidt i vejebåden.");
            this.markér("staaluld", 3);
            return false;
        }
        if (m > M.AFVEJ.max && !fraTraek) {
            var c = this.stykker.pop();
            var baad = this.g.vejebaad.p, su = this.g.staaluld.p;
            this.flyvende.push({ tot: true, x: baad.x, y: baad.y - 4, a: c.a, va: r(-6, 6), r: 6,
                fra: { x: baad.x, y: baad.y - 4 }, til: { x: su.x, y: su.y - 28 }, t: 0, varighed: 0.45 });
            this.besked("Lidt for meget. En tot er lagt tilbage.");
            this.aendret("tot");
            return true;
        }
        this.overfoerTilKolbe(m);
        return true;
    };

    P.overfoerTilKolbe = function (m) {
        var baad = this.g.vejebaad, k = this.g.kolbe;
        var stykker = this.stykker;
        var antal = stykker.length;
        this.mStaal = m;
        this.maal("staal", m);
        this.koer([
            { flyt: baad, til: function () { return { x: k.p.x - 34, y: k.p.y - 26, v: 1.1 }; }, tid: 1.1, loeft: 80 },
            { tid: 0.6, hver: function (t) {
                while (stykker.length && stykker.length > (1 - t) * antal) {
                    stykker.pop();
                    var w = NK.tilVerden(baad.p, baad.anker, 60, 2);
                    this.flyvende.push({ tot: true, x: w.x, y: w.y, a: r(0, 6), va: r(-6, 6), r: 5.5,
                        fra: { x: w.x, y: w.y }, til: { x: k.p.x + r(-14, 14), y: k.p.y + 112 }, t: 0, varighed: 0.35, bue: 8 });
                }
            } },
            { kald: function () {
                stykker.length = 0;
                this.gjort.afvej = true;
                this.kem.nFeTot = M.jernMol(m);
                if (m < M.GRAENSE.lidtStaal) this.iagttag("lidtStaal", true);
                else if (m > M.GRAENSE.megetStaal) this.iagttag("megetStaal", true);
                this.aendret("afvej");
            } },
            { flyt: baad, til: S.HJEM.parkeret, tid: 1.1, loeft: 80 }
        ], "afvej");
    };

    /* ----- Traek med musen -------------------------------------------------
       Vejebaaden, flaskerne og kolben kan traekkes hen til et maal. Zonerne
       er ellipser om maalets midte; det naermeste gyldige maal vinder. */
    P.maalZone = function (maal) {
        var k = this.g.kolbe;
        switch (maal) {
            case "kolbe": return { x: k.p.x, y: k.p.y + 60, rx: 62, ry: 95 };
            case "plade": return { x: S.PLADE.midt, y: 420, rx: 56, ry: 85 };
            case "buret": return { x: B.x, y: 430, rx: 62, ry: 85 };
            case "buretTop": return { x: B.x, y: 130, rx: 62, ry: 90 };
            case "vaegt": return { x: S.VAEGT.midt, y: S.VAEGT.y - 40, rx: 70, ry: 70 };
            case "affald": return { x: this.g.affald.p.x - 32, y: this.g.affald.p.y + 40, rx: 58, ry: 85 };
        }
        return null;
    };

    P.traekRekt = function (maal) {
        var k = this.g.kolbe;
        switch (maal) {
            case "kolbe": return S.rekt("kolbe", k.p, k.anker, 0);
            case "plade": return { x: S.PLADE.x, y: S.PLADE.y - 128, b: 90, h: 162 };
            case "buret": return { x: B.x - 50, y: B.spids, b: 100, h: S.FLISE.y - B.spids };
            case "buretTop": return { x: B.x - 20, y: 88, b: 40, h: 60 };
            case "affald": return S.rekt("baegerglas", this.g.affald.p, this.g.affald.anker, 4);
        }
        return null;
    };

    /* Syreflaskerne kan ogsaa slippes over vaegten: et uheld (syrePaaVaegt) */
    var MULIGE = {
        vejebaad: ["kolbe"],
        svovlsyre: ["kolbe", "vaegt", "affald"],
        saltsyre: ["kolbe", "vaegt", "affald"],
        kmno4: ["buretTop", "kolbe", "affald"],
        kolbe: ["plade", "buret", "affald"],
        affald: ["buret", "bord"]
    };

    P.kanTraekke = function (navn) {
        if (this.handling || this.arbejdKilde || (this.laererOptaget && this.laererOptaget())) return false;
        var baad = this.g.vejebaad, k = this.g.kolbe;
        switch (navn) {
            case "vejebaad":
                return !this.gjort.afvej && this.stykker.length > 0 && this.iFlugt === 0 &&
                    Math.abs(baad.p.x - baad.hjem.x) + Math.abs(baad.p.y - baad.hjem.y) < 2;
            case "svovlsyre": case "saltsyre": case "kmno4":
                return true;
            case "kolbe":
                /* Under buretten er et traek en rystning, saa laenge der titreres */
                return k.sted === "hjem" || k.sted === "plade" || (k.sted === "buret" && !this.kanRyste());
            case "affald":
                return this.g.affald.sted === "buret" || this.g.affald.sted === "bord";
        }
        return false;
    };

    P.findMaal = function (navn, pt) {
        var liste = MULIGE[navn] || [], bedst = null, afst = Infinity;
        var fra = this.holdt ? this.holdt.sted : null;
        /* Affaldsbaegeret: under buretten eller et vilkaarligt sted paa bordet */
        if (navn === "affald") {
            var zb = this.maalZone("buret");
            var bx = (pt.x - zb.x) / zb.rx, by = (pt.y - zb.y) / zb.ry;
            if (bx * bx + by * by <= 1) return "buret";
            return pt.y < S.BORD + 40 ? "bord" : null;
        }
        for (var i = 0; i < liste.length; i++) {
            if (navn === "kolbe" && liste[i] === fra) continue;
            if (navn === "kolbe" && liste[i] === "affald" && this.g.affald.sted === "buret") continue;
            var z = this.maalZone(liste[i]);
            var dx = (pt.x - z.x) / z.rx, dy = (pt.y - z.y) / z.ry;
            var d = dx * dx + dy * dy;
            if (d <= 1 && d < afst) { afst = d; bedst = liste[i]; }
        }
        return bedst;
    };

    P.slipTil = function (navn, maal) {
        switch (navn) {
            case "vejebaad": return maal === "kolbe" ? this.klikVejebaad(true) : false;
            case "svovlsyre": case "saltsyre":
                if (maal === "vaegt") return this.syrePaaVaegt(navn);
                if (maal === "affald") return this.haeldIAffald(navn);
                return maal === "kolbe" ? this.slipSyre(navn) : false;
            case "kmno4":
                if (maal === "buretTop") return this.fyldBuret();
                if (maal === "kolbe") return this.kmno4IKolbe();
                if (maal === "affald") return this.haeldIAffald(navn);
                return false;
            case "kolbe":
                if (maal === "plade") return this.tilPlade();
                if (maal === "buret") return this.tilBuret();
                if (maal === "affald") return this.toemKolbe();
                return false;
            case "affald":
                if (maal === "buret") return this.affaldTilBuret();
                if (maal === "bord") return this.affaldPaaBord();
                return false;
        }
        return false;
    };

    /* ----- Syren --------------------------------------------------------- */
    /* Syren haeldes altid i: ogsaa foer stålulden og ogsaa en syre mere.
       Kun en fuld kolbe siger fra. */
    P.slipSyre = function (navn) {
        if (this.kem.ml + M.SYRE_ML > M.GRAENSE.kolbe) { this.besked("Der er ikke plads til mere i kolben."); return false; }
        this.haeldSyre(navn);
        return true;
    };

    /* Uheld: KMnO₄ haeldes direkte i kolben. Det reagerer med jernet uden
       at blive maalt. */
    P.kmno4IKolbe = function () {
        var fl = this.g.kmno4, k = this.g.kolbe;
        var mig = this;
        var ml = M.GRAENSE.kmno4IKolbe, tilsat = 0;
        if (this.handling) return false;
        if (this.kem.ml + ml > M.GRAENSE.kolbe) { this.besked("Der er ikke plads til mere i kolben."); return false; }
        this.koer([
            { tid: 0.3, hver: function (t) { mig.laagT.kmno4 = t; } },
            { flyt: fl, til: function () { return { x: k.p.x - 26, y: k.p.y - 30, v: 2.05 }; }, tid: 1.0, loeft: 50 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(1.2); } },
            { tid: 1.2, hver: function (t) {
                var nu = ml * NK.blod(t);
                M.tilsaet(this.kem, nu - tilsat);
                this.kmno4Direkte += nu - tilsat;
                tilsat = nu;
                var spids = NK.tilVerden(fl.p, fl.anker, 23, 4);
                this.straale = { fra: spids, til: { x: k.p.x + 2, y: k.niveau ? k.niveau : k.p.y + 118 }, farve: M.FARVE.kmno4, bredde: 2.4 };
            } },
            { kald: function () { this.straale = null; this.iagttag("kmno4Kolbe", true); this.aendret("kmno4Kolbe"); } },
            hjemTil(fl, 1.0, 50),
            { tid: 0.3, hver: function (t) { mig.laagT.kmno4 = 1 - t; } }
        ], "kmno4Kolbe");
        return true;
    };

    /* ----- Affaldsbaegeret ------------------------------------------------ */
    P.tilAffald = function (ml, farve) {
        if (ml <= 0) return;
        var i = this.affaldMl + ml;
        this.affaldFarve = this.affaldFarve ? NK.blandFarve(this.affaldFarve, farve, ml / i) : farve;
        this.affaldMl = i;
    };

    P.affaldTilBuret = function () {
        var af = this.g.affald;
        if (this.handling) return false;
        if (this.g.kolbe.sted === "buret") { this.besked("Kolben står under buretten."); return false; }
        af.sted = "flytter";
        this.koer([
            { flyt: af, til: S.HJEM.affald, tid: 0.5, loeft: 20 },
            { kald: function () { af.sted = "buret"; if (NK.Lyd) NK.Lyd.klirr(); this.aendret("affald"); } }
        ], "affald");
        return true;
    };

    P.affaldPaaBord = function () {
        var af = this.g.affald;
        if (this.handling) return false;
        var til = S.staar("baegerglas", NK.klamp(af.p.x - 32, 50, S.BREDDE - 40));
        af.sted = "flytter";
        this.koer([
            { flyt: af, til: til, tid: 0.35, loeft: 0 },
            { kald: function () { af.sted = "bord"; if (NK.Lyd) NK.Lyd.klirr(); this.aendret("affald"); } }
        ], "affald");
        return true;
    };

    /* Syre eller KMnO₄ haeldes i affaldsbaegeret, hvor det staar */
    P.haeldIAffald = function (navn) {
        var fl = this.g[navn], af = this.g.affald;
        var mig = this;
        var ml = navn === "kmno4" ? 10 : 20, tilsat = 0;
        var farve = navn === "kmno4" ? M.FARVE.kmno4 : M.FARVE.syre;
        if (this.handling) return false;
        this.koer([
            { tid: 0.3, hver: function (t) { mig.laagT[navn] = t; } },
            { flyt: fl, til: function () { return { x: af.p.x - 58, y: af.p.y - 34, v: 2.05 }; }, tid: 0.9, loeft: 40 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(1.0); } },
            { tid: 1.0, hver: function (t) {
                var nu = ml * NK.blod(t);
                this.tilAffald(nu - tilsat, farve);
                tilsat = nu;
                var spids = NK.tilVerden(fl.p, fl.anker, 23, 4);
                this.straale = { fra: spids, til: { x: af.p.x - 32, y: af.niveau ? af.niveau : af.p.y + 80 }, farve: farve, bredde: 2.6 };
            } },
            { kald: function () {
                this.straale = null;
                if (!this.gjort.beregn && this.laererBemaerk) this.laererBemaerk(navn === "kmno4" ? "kmno4Affald" : "syreAffald");
                this.aendret("affald");
            } },
            hjemTil(fl, 0.9, 40),
            { tid: 0.3, hver: function (t) { mig.laagT[navn] = 1 - t; } }
        ], "affaldHaeld");
        return true;
    };

    /* Kolben toemmes i affaldsbaegeret og stilles tilbage i stinkskabet */
    P.toemKolbe = function () {
        var k = this.g.kolbe, af = this.g.affald;
        if (this.handling) return false;
        var ml0 = this.kem.ml;
        var farve = M.kolbeFarve(this.kem) || M.FARVE.syre;
        if (k.sted === "plade") this.pladeTaendt = false;
        k.sted = "flytter";
        this.koer([
            { flyt: k, til: function () { return { x: af.p.x - 62, y: af.p.y - 48, v: 2.1 }; }, tid: 0.9, loeft: 40 },
            { kald: function () { if (NK.Lyd && ml0 > 0) NK.Lyd.haeld(1.2); } },
            { tid: 1.2, hver: function (t) {
                var rest = ml0 * (1 - NK.blod(t));
                if (this.kem.ml > rest) { this.tilAffald(this.kem.ml - rest, farve); this.kem.ml = rest; }
                if (ml0 > 0 && t < 0.98) this.straale = { fra: NK.tilVerden(k.p, k.anker, 48, 2.5), til: { x: af.p.x - 32, y: af.niveau ? af.niveau : af.p.y + 80 }, farve: farve, bredde: 3 };
            } },
            { kald: function () { this.straale = null; this.kolbeToemt(); } },
            { flyt: k, til: S.HJEM.kolbe, tid: 1.0, loeft: 50 },
            { kald: function () { k.sted = "hjem"; this.aendret("toemt"); } }
        ], "toem");
        return true;
    };

    /* Kolben er tom. Foer beregningen starter kolben forfra med ny ståluld,
       mens buretten og startaflaesningen bliver. Efter beregningen er det
       oprydning, og forsoegets tal bliver staaende til tegneserien. */
    P.kolbeToemt = function () {
        var efter = !!this.gjort.beregn;
        this.kem = M.nyKemi();
        this.kolbeBobler = [];
        this.lyserodTid = 0;
        this.mikro = new NK.Mikro();
        if (!efter) {
            this.gjort.afvej = false;
            this.gjort.titrer = false;
            this.mStaal = null;
            this.vSlut = null;
            this.aflaestI = 0;
            this.kolbeEfterStart = 0;
            this.kmno4Direkte = 0;
            this.aubergine = false;
            ["lidtStaal", "megetStaal", "toSyrer", "kmno4Kolbe", "ingenSyre", "uoploest", "ikkeLyserod", "lilla", "falmer", "klor", "skvulp"].forEach(function (n) { delete this.iagttaget[n]; }, this);
            this.stykker = [];
            this.g.vejebaad.p = kopi(this.g.vejebaad.hjem);
            this.maal("staal", null);
        }
        if (this.laererBemaerk) this.laererBemaerk(efter ? "ryddetOp" : "toemt");
    };

    /* Uheld: syren haeldes ud over vaegten i stedet for i kolben. Den
       loeber ud over vejeskaalen, og laereren toerrer op (laerer.js). */
    P.syrePaaVaegt = function (navn) {
        var fl = this.g[navn];
        var sk = S.VAEGT.vejeskaal;
        var mig = this;
        this.koer([
            { tid: 0.3, hver: function (t) { mig.laagT[navn] = t; } },
            { flyt: fl, til: { x: sk.x - 30, y: sk.y - 64, v: 2.05 }, tid: 0.9, loeft: 50 },
            { kald: function () { if (NK.Lyd) NK.Lyd.haeld(0.9); } },
            { tid: 0.9, hver: function (t) {
                var spids = NK.tilVerden(fl.p, fl.anker, 23, 4);
                this.straale = { fra: spids, til: { x: sk.x - 8, y: sk.y - 2 }, farve: M.FARVE.syre, bredde: 3 };
                if (!this.vaegtPyt) this.vaegtPyt = { x: sk.x, rx: 6, alfa: 1 };
                this.vaegtPyt.rx = 6 + 44 * t;
            } },
            { kald: function () {
                this.straale = null;
                this.besked("Syren løb ud over vægten.", "advarsel");
                if (this.laererVaegt) this.laererVaegt();
                this.aendret("vaegt");
            } },
            hjemTil(fl, 0.9, 50),
            { tid: 0.3, hver: function (t) { mig.laagT[navn] = 1 - t; } }
        ], "vaegtSyre");
        return true;
    };

    P.haeldSyre = function (navn) {
        var fl = this.g[navn], k = this.g.kolbe;
        var mig = this;
        var start = 0;
        this.koer([
            { tid: 0.3, hver: function (t) { mig.laagT[navn] = t; } },
            { flyt: fl, til: function () { return { x: k.p.x - 26, y: k.p.y - 30, v: 2.05 }; }, tid: 0.9, loeft: 50 },
            { kald: function () {
                var kem = this.kem;
                start = kem.ml;
                if (!kem.syre) kem.syre = navn;
                kem.syrer[navn] = (kem.syrer[navn] || 0) + 1;
                if (M.SYRER[navn].klorid) kem.klorid = true;
                if (kem.syrer.svovlsyre && kem.syrer.saltsyre) this.iagttag("toSyrer", true);
                if (NK.Lyd) NK.Lyd.haeld(1.4);
                this.aendret("syre");
            } },
            { tid: 1.4, hver: function (t) {
                this.kem.ml = start + M.SYRE_ML * NK.blod(t);
                var spids = NK.tilVerden(fl.p, fl.anker, 23, 4);
                this.straale = { fra: spids, til: { x: k.p.x + 2, y: k.niveau ? k.niveau : k.p.y + 118 }, farve: M.FARVE.syre, bredde: 3 };
            } },
            { kald: function () { this.straale = null; } },
            hjemTil(fl, 0.9, 50),
            { tid: 0.3, hver: function (t) { mig.laagT[navn] = 1 - t; } }
        ], "syre");
    };

    /* ----- Kolben --------------------------------------------------------- */
    P.klikKolbe = function () {
        var k = this.g.kolbe;
        if (k.sted === "hjem" || k.sted === "plade") {
            if (!this.gjort.afvej) { this.besked("Kolben er tom. Afvej ståluld først."); this.markér("staaluld", 3); return false; }
            if (!this.kem.syre) { this.besked("Tilsæt syre."); this.markér("flasker", 3); return false; }
            if (this.kem.opl < M.OPLOES.faerdig) {
                if (k.sted === "hjem") return this.tilPlade();
                this.besked("Vent, til alt jernet er opløst.");
                return false;
            }
            if (this.vStart !== null) return this.tilBuret();
            this.besked("Stålulden er opløst. Tap buretten af til 0, og aflæs den, før kolben stilles under den.");
            this.markér(this.buret.fyldt ? "buret" : "kmno4", 3);
            return false;
        }
        if (k.sted === "buret") {
            if (this.vSlut !== null) this.besked("Beregn jernindholdet i skemaet.");
            else this.besked("Tag fat i kolben, og ryst den ved at trække i den.");
        }
        return false;
    };

    P.tilPlade = function () {
        var k = this.g.kolbe;
        if (this.handling) return false;
        if (k.sted === "plade") return false;
        k.sted = "flytter";
        this.koer([
            { flyt: k, til: S.PAA_PLADE, tid: 1.0, loeft: 50 },
            { kald: function () {
                k.sted = "plade";
                this.pladeTaendt = true;
                if (NK.Lyd) NK.Lyd.klik();
                this.aendret("plade");
            } }
        ], "plade");
        return true;
    };

    P.tilBuret = function () {
        var k = this.g.kolbe, af = this.g.affald;
        if (this.handling) return false;
        if (this.gjort.afvej && this.kem.syre && this.kem.opl < M.OPLOES.faerdig) this.iagttag("uoploest", true);
        var fra = k.sted;
        /* Staar affaldsbaegeret under buretten, flyttes det til side */
        var flytAffald = af.sted === "buret" ? [
            { kald: function () { af.sted = "flytter"; } },
            { flyt: af, til: S.AFFALD_PARKERET, tid: 0.7, loeft: 24 },
            { kald: function () { af.sted = "bord"; } }
        ] : [];
        k.sted = "flytter";
        this.koer([
            { kald: function () { this.pladeTaendt = false; } }
        ].concat(flytAffald, [
            { flyt: k, til: { x: S.UNDER_BURET.x - 76, y: S.UNDER_BURET.y, v: 0 }, tid: 1.1, loeft: fra === "plade" ? 90 : 70 },
            { flyt: k, til: S.UNDER_BURET, tid: 0.55, loeft: 0 },
            { kald: function () {
                k.sted = "buret";
                this.lyserodTid = 0;
                if (NK.Lyd) NK.Lyd.klirr();
                this.aendret("under");
            } }
        ]), "under");
        return true;
    };

    /* ----- Buretten -------------------------------------------------------- */
    P.fyldBuret = function () {
        var fl = this.g.kmno4, b = this.buret;
        var mig = this;
        if (this.handling) return false;
        if (this.vStart !== null && !this.gjort.beregn) this.iagttag("genfyldt", true);
        var overloeb = b.fyldt && b.V < 0.5;
        var fra = 0, til = M.afrund(r(M.BURET.fyldMin, M.BURET.fyldMax), 2);
        this.koer([
            { tid: 0.3, hver: function (t) { mig.laagT.kmno4 = t; } },
            { flyt: fl, til: { x: B.x - 7, y: 86, v: 2.05 }, tid: 1.0, loeft: 30 },
            { kald: function () {
                fra = b.fyldt ? b.V : 50;
                b.fyldt = true;
                if (NK.Lyd) NK.Lyd.haeld(1.6);
                this.aendret("fyld");
            } },
            { tid: 1.6, hver: function (t) {
                b.V = NK.lerp(fra, til, NK.blod(t));
                var spids = NK.tilVerden(fl.p, fl.anker, 23, 4);
                this.straale = { fra: spids, til: { x: B.x, y: 100 }, farve: M.FARVE.kmno4, bredde: 2.4 };
                if (overloeb && t > 0.3 && Math.random() < 0.3) {
                    this.flyvende.push({ x: B.x + r(-10, 10), y: 96, vx: r(-30, 30), vy: r(-20, 20), a: 0, va: 0, r: 1.8, fysik: true, draabe: true, farve: "rgba(120, 26, 138, 0.9)" });
                }
            } },
            { kald: function () {
                this.straale = null;
                if (overloeb) {
                    if (!this.plet) this.plet = { x: B.x + 18, y: S.STATIV.y - 1, styrke: 0 };
                    this.plet.maal = 1;
                    if (this.laererOverloeb) this.laererOverloeb();
                }
            } },
            hjemTil(fl, 1.0, 30),
            { tid: 0.3, hver: function (t) { mig.laagT.kmno4 = 1 - t; } }
        ], "fyld");
        return true;
    };

    P.destination = function () {
        if (this.g.kolbe.sted === "buret") return "kolbe";
        if (this.g.affald.sted === "buret") return "affald";
        return "bord";
    };

    /* Hanen aabnes, uanset hvad der staar under buretten */
    P.klikHane = function () {
        var b = this.buret;
        if (b.aaben) return this.lukHane();
        if (this.handling) return false;
        if (!b.fyldt) { this.besked("Buretten er tom. Fyld den med kaliumpermanganat."); this.markér("kmno4", 3); return false; }
        if (b.V >= 50) { this.besked("Buretten er tom."); return false; }
        b.aaben = true;
        this.buretFokusUr = 3;
        if (NK.Lyd) NK.Lyd.klik();
        this.aendret("hane");
        return true;
    };

    /* Foer startaflaesningen lægger menisken sig paa 0,00, hvis hanen
       lukkes mindre end BURET.fang mL fra nulstregen. */
    P.lukHane = function () {
        var b = this.buret;
        if (!b.aaben) return false;
        b.aaben = false;
        this.buretFokusUr = 3;
        if (this.vStart === null && Math.abs(b.V) <= M.BURET.fang) b.V = 0;
        if (this.vStart === null && b.fyldt) {
            if (b.V < -M.BURET.fang) this.besked("Menisken står stadig over 0.");
            else this.besked("Menisken står på " + M.komma(M.aflaes(b.V), 2) + " mL. Aflæs buretten.", "god");
        }
        if (NK.Lyd) NK.Lyd.klik();
        this.aendret("hane");
        return true;
    };

    /* Knappen Draabe (og tasten D) */
    P.draabe = function () {
        var b = this.buret;
        if (this.handling || (this.laererOptaget && this.laererOptaget())) return false;
        if (!b.fyldt) { this.besked("Buretten er tom. Fyld den med kaliumpermanganat."); return false; }
        if (b.aaben) return false;
        if (this.tid - (this.sidsteKnap || -99) < 0.12) return false;
        if (b.V + M.BURET.draabe > 50) { this.besked("Buretten er tom."); return false; }
        b.V += M.BURET.draabe;
        this.sidsteDraabe = this.tid;
        this.sidsteKnap = this.tid;
        this.draaber.push({ x: B.x, y: B.spids + 2, vy: 30, r: 2.2, ml: M.BURET.draabe, til: this.destination() });
        this.aendret("draabe");
        return true;
    };

    P.kanDraabe = function () {
        return !!(this.buret.fyldt && !this.buret.aaben && !this.handling && this.buret.V + M.BURET.draabe <= 50);
    };

    /* Knappen Aflaes: kan buretten aflaeses, og ventes der en aflaesning? */
    P.kanAflaese = function () {
        var b = this.buret;
        return !!(b.fyldt && !this.handling && !this.gjort.beregn && b.V >= -M.BURET.fang);
    };

    P.skalAflaese = function () {
        if (!this.kanAflaese() || this.buret.aaben) return false;
        if (this.vStart === null) return true;
        return !!this.gjort.titrer && this.vSlut === null;
    };

    /* Hanens fart: altid langsom under nulstillingen. Efter
       startaflaesningen kan den stilles paa langsom eller hurtig. */
    P.kanHurtig = function () {
        return this.vStart !== null && !this.gjort.beregn;
    };

    P.aktuelFlow = function () {
        if (this.vStart === null) return M.BURET.nulFlow;
        return this.haneFart === "hurtig" ? M.BURET.hurtigFlow : M.BURET.flow;
    };

    P.saetHaneFart = function (fart) {
        if (fart === "hurtig" && !this.kanHurtig()) return false;
        if (this.haneFart === fart) return false;
        this.haneFart = fart;
        if (NK.Lyd) NK.Lyd.klik();
        this.aendret("hanefart");
        return true;
    };

    /* Aflaesningen. Saa laenge der ikke er titreret i kolben, er det
       startaflaesningen, og den kan tages om. Derefter er det
       slutaflaesningen, som ogsaa kan tages om, indtil jernindholdet er
       beregnet. Kun en menisk over nulstregen kan ikke aflaeses. */
    P.klikBuret = function () {
        var b = this.buret;
        if (this.handling) return false;
        if (!b.fyldt) { this.besked("Buretten er tom. Fyld den med kaliumpermanganat."); this.markér("kmno4", 3); return false; }
        if (b.V < -M.BURET.fang) { this.besked("Menisken står over nulstregen. Tap lidt af."); this.markér("hane", 3); return false; }
        var V = M.aflaes(Math.max(0, b.V));
        var start = this.vStart === null || (this.vSlut === null && this.kolbeEfterStart < M.BURET.draabe);
        if (this.gjort.beregn || V === (start ? this.vStart : this.vSlut)) { this.besked("Buretten er aflæst."); return false; }
        if (start) {
            this.vStart = V;
            this.affaldEfterStart = 0;
            this.maal("start", V);
        } else {
            this.vSlut = V;
            this.aflaestI = M.intensitet(this.kem);
            this.iagttaget.ikkeLyserod = this.aflaestI < M.TITRER.synlig;
            this.iagttaget.lilla = M.overskudMl(this.kem) > M.TITRER.lilla;
            if (this.affaldEfterStart > 0.2) this.iagttag("affaldTaelt", true);
            this.maal("slut", V);
        }
        if (NK.Lyd) NK.Lyd.bip();
        this.aendret(start ? "start" : "slut");
        return true;
    };

    /* ----- Rystning ---------------------------------------------------------- */
    P.kanRyste = function () {
        return !!(this.g.kolbe.sted === "buret" && this.kem.ml > 0 && !this.gjort.beregn && !this.handling);
    };

    P.skvulp = function () {
        var kem = this.kem, tab = M.RYST.skvulp;
        ["nFe2", "nFe3", "nLokal", "nMnO4", "nMn2", "ml"].forEach(function (n) { kem[n] *= 1 - tab; });
        var k = this.g.kolbe;
        var farve = M.kolbeFarve(kem) || M.FARVE.syre;
        for (var i = 0; i < 10; i++) {
            var side = Math.random() < 0.5 ? -1 : 1;
            this.flyvende.push({ x: k.p.x + side * 6, y: k.p.y + 2, vx: side * r(40, 160), vy: -r(120, 260), a: 0, va: 0, r: r(1.6, 2.6), fysik: true, draabe: true, farve: NK.css(farve, 2.5) });
        }
        this.iagttag("skvulp");
        if (NK.Lyd) NK.Lyd.skvulp();
    };

    /* ----- Beregningen --------------------------------------------------- */
    P.jernTal = function () {
        if (this.vSlut === null) return null;
        return M.mellemregning(this.mStaal, this.vStart, this.vSlut);
    };

    P.tjekSvar = function (tekst) {
        if (this.vSlut === null || this.gjort.beregn) return null;
        var svar = M.tjek(tekst, this.mStaal, this.vStart, this.vSlut);
        if (svar.slags === "tom") return svar;
        if (svar.slags === "rigtig") {
            this.gjort.beregn = true;
            var procent = M.jernprocent(this.mStaal, this.vStart, this.vSlut);
            var syre = M.syreId(this.kem);
            this.resultater.push({ nr: this.forsoegNr, syre: syre, m: this.mStaal, vStart: this.vStart, vSlut: this.vSlut, procent: procent });
            if (NK.Lyd) NK.Lyd.succes();
            if (procent > 101 && this.laererOver100) this.laererOver100();
            else if (procent < 90 && this.laererBemaerk) this.laererBemaerk(procent < 0 ? "negativ" : (procent < 5 ? "nul" : "lavt"));
            else if (syre === "svovlsyre" && procent >= 96 && procent <= 100.5 && this.laererRos) this.laererRos();
            this.aendret("beregn");
        } else {
            this.antalForkerte++;
        }
        svar.forkerte = this.antalForkerte;
        return svar;
    };

    P.harSvovlsyreResultat = function () {
        return this.resultater.some(function (x) { return x.syre === "svovlsyre"; });
    };

    /* ----- Zoomboblen ---------------------------------------------------- */
    P.mikroTilstand = function () {
        var k = this.g.kolbe, kem = this.kem, b = this.buret;
        var hn = this.handling ? this.handling.navn : "";
        var t = this.aktueltTrin();
        var id = t ? t.id : "";
        var scene, maal, titel;
        var buretMaal = { x: B.x, y: S.buretY(NK.klamp(b.V, -3, 50)) };
        if (!this.gjort.afvej) {
            if (!this.stykker.length || hn === "afvej") return null;
            scene = "jern";
            maal = { x: this.g.vejebaad.p.x, y: this.g.vejebaad.p.y - 6 };
            titel = "Stålulden";
        } else if (hn === "fyld" || (this.vStart === null && b.fyldt && (b.aaben || this.buretFokusUr > 0)) || (k.sted !== "buret" && id === "start") ||(k.sted === "buret" && id === "slut" && !b.aaben && this.tid - this.sidsteDraabe > 1.2 && !this.draaber.length)) {
            if (!b.fyldt) return null;
            scene = "buret";
            maal = buretMaal;
            titel = "Buretten";
        } else if (k.sted === "flytter" || hn === "under") {
            return null;
        } else if (k.sted !== "buret") {
            scene = kem.syre ? "oploes" : "jern";
            maal = NK.tilVerden(k.p, k.anker, 48, 112);
            titel = "Kolben";
        } else {
            scene = "titrering";
            maal = NK.tilVerden(k.p, k.anker, 48, 108);
            titel = "Kolben";
        }
        var nMnTot = kem.nFeTot / 5;
        return {
            scene: scene, maal: maal, titel: titel, syre: kem.syre,
            opl: kem.opl, oploesFart: kem.syre ? M.oploesFart(this.temp) : 0,
            reageret: nMnTot > 0 ? kem.nMn2 / nMnTot : 0,
            overskud: nMnTot > 0 ? (kem.nMnO4 + kem.nLokal) / nMnTot : 0,
            synlig: M.intensitet(kem) >= M.TITRER.synlig,
            klor: nMnTot > 0 ? kem.nKlor / nMnTot : 0,
            V: b.V, ryst: this.ryst
        };
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdater = function (dt) {
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        var k = this.g.kolbe, kem = this.kem;

        this.opdaterHandling(dt);
        this.opdaterArbejde(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        if (this.mark) { this.mark.ur -= dt; if (this.mark.ur <= 0) this.mark = null; }
        if (this.buretFokusUr > 0) this.buretFokusUr -= dt;
        this.ryk = this.ryk > 0.2 ? this.ryk * (1 - dt * 7) : 0;

        /* Varme */
        this.pladeTemp = NK.mod(this.pladeTemp, this.pladeTaendt ? 80 : 22, this.pladeTaendt ? 0.9 : 0.5, dt);
        this.temp = NK.mod(this.temp, k.sted === "plade" ? this.pladeTemp : 22, k.sted === "plade" ? 1.2 : 0.35, dt);

        /* Kemien i kolben */
        if (kem.syre) {
            var oplFoer = kem.opl;
            M.reager(kem, dt, { temp: this.temp, ryst: this.ryst });
            var fart = (kem.opl - oplFoer) / dt;
            if (fart > 0) {
                this.draabeUr -= dt * NK.klamp(fart * 300, 0, 30);
                while (this.draabeUr <= 0) {
                    this.draabeUr += 1;
                    var s = Math.sqrt(1 - kem.opl);
                    this.kolbeBobler.push({ x: 48 + r(-24, 24) * Math.max(0.3, s), y: 116, vy: -r(30, 60), r: r(0.8, 2) });
                }
                this.lydUr -= dt;
                if (this.lydUr <= 0 && fart > 0.02) { this.lydUr = 0.35; if (NK.Lyd) NK.Lyd.boble(); }
                if (k.sted === "plade") this.urMinutter += dt * 2;
            }
            if (oplFoer < M.OPLOES.faerdig && kem.opl >= M.OPLOES.faerdig && this.gjort.afvej) {
                this.pladeTaendt = false;
                this.besked("Alt jernet er opløst.", "god");
                if (NK.Lyd) NK.Lyd.succes();
                this.aendret("oploes");
            }
        }
        var niveauLokal = k.niveau !== null && k.niveau !== undefined ? k.niveau - k.p.y + k.anker.y : 100;
        for (var i = this.kolbeBobler.length - 1; i >= 0; i--) {
            var bo = this.kolbeBobler[i];
            bo.y += bo.vy * dt;
            bo.x += Math.sin(this.tid * 9 + i) * 8 * dt;
            if (bo.y < niveauLokal) this.kolbeBobler.splice(i, 1);
        }
        if (this.temp > 50 && k.sted !== "flytter") {
            this.dampUr -= dt;
            if (this.dampUr <= 0) {
                this.dampUr = 0.18;
                this.dampe.push({ x: k.p.x + r(-4, 4), y: k.p.y - 4, vx: r(-6, 6), vy: r(-34, -20), r: r(3, 6), liv: 1 });
            }
        }

        this.opdaterBuret(dt);
        this.opdaterTitrering(dt);
        this.opdaterVaegt(dt);
        this.opdaterEffekter(dt);
        if (this.plet && this.plet.maal) this.plet.styrke = NK.mod(this.plet.styrke, this.plet.maal, 1.5, dt);

        /* Zoomboblen */
        var mt = this.mikroTilstand();
        if (mt) {
            this.mikro.opdater(dt, mt);
            var sted = mt.maal.x < S.SKAB.x0 ? S.BOBLE.ude : (mt.maal.x < S.SKAB.x3 ? S.BOBLE.skab : S.BOBLE.buret);
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

    P.opdaterBuret = function (dt) {
        var b = this.buret;
        if (b.aaben) {
            var flow = this.aktuelFlow();
            var dv = Math.min(flow * dt, 50 - b.V);
            b.V += dv;
            this.landet(this.destination(), dv);
            if (b.V >= 50) {
                b.aaben = false;
                this.besked("Buretten er tom.", "advarsel");
                this.aendret("hane");
            }
        }
        for (var i = this.draaber.length - 1; i >= 0; i--) {
            var d = this.draaber[i];
            d.vy += 900 * dt;
            d.y += d.vy * dt;
            if (d.y >= this.overflade(d.til)) {
                this.draaber.splice(i, 1);
                this.landet(d.til, d.ml);
                if (NK.Lyd) NK.Lyd.plip();
            }
        }
    };

    /* Hvor en draabe fra buretten rammer */
    P.overflade = function (til) {
        if (til === "kolbe") { var k = this.g.kolbe; return k.niveau ? k.niveau : k.p.y + 110; }
        if (til === "affald") { var af = this.g.affald; return af.niveau ? af.niveau : af.p.y + 80; }
        return S.BORD - 1;
    };

    /* Titreringen er begyndt uden startaflaesning: laereren skriver den op.
       Stod menisken over nulstregen, skrives 0,00 mL. */
    P.glemtStart = function (ml) {
        var foer = this.buret.V - ml;
        if (foer < -M.BURET.fang) {
            this.vStart = 0;
            this.iagttag("ikkeNulstillet", true);
        } else {
            this.vStart = M.aflaes(Math.max(0, foer));
            this.iagttag("glemtStart", true);
        }
        this.affaldEfterStart = 0;
        this.maal("start", this.vStart);
        this.aendret("start");
    };

    P.landet = function (til, ml) {
        if (til === "kolbe") {
            M.tilsaet(this.kem, ml);
            this.lokalX = B.x;
            this.sidsteDraabe = this.tid;
            if (this.vStart === null && this.buret.fyldt) this.glemtStart(ml);
            this.kolbeEfterStart += ml;
            if (!this.kem.syre && this.kolbeEfterStart > 1) this.iagttag("ingenSyre", true);
        } else if (til === "affald") {
            this.tilAffald(ml, M.FARVE.kmno4);
            if (this.vStart !== null && this.vSlut === null) this.affaldEfterStart += ml;
        } else {
            /* Uheld: intet under buretten. KMnO₄ loeber ud paa flisen. */
            this.spildMl += ml;
            if (!this.plet) this.plet = { x: B.x + 18, y: S.STATIV.y - 1, styrke: 0 };
            this.plet.maal = Math.max(this.plet.maal || 0, NK.klamp(this.spildMl / 1.5, 0.3, 1));
            if (this.spildMl > 0.3 && !this.iagttaget.spild) {
                this.iagttag("spild");
                if (this.laererSpild) this.laererSpild();
            }
        }
    };

    P.opdaterTitrering = function (dt) {
        var kem = this.kem;
        if (this.g.kolbe.sted !== "buret") return;
        var I = M.intensitet(kem);
        if (!this.gjort.beregn) {
            if (I >= M.TITRER.synlig && !this.buret.aaben) this.lyserodTid += dt;
            else if (I < M.TITRER.synlig) this.lyserodTid = 0;
            if (!this.gjort.titrer && this.lyserodTid >= M.TITRER.blivende) {
                this.gjort.titrer = true;
                this.besked("Den lyserøde farve bliver.", "god");
                if (NK.Lyd) NK.Lyd.succes();
                this.aendret("titrer");
            }
            if (this.gjort.titrer && I < 0.03) this.iagttag("falmer");
            if (kem.klorid && kem.nKlor > 2e-5) this.iagttag("klor");
            if (!this.aubergine && M.overskudMl(kem) > M.TITRER.aubergine && this.laererAubergine) {
                if (this.laererAubergine()) this.aubergine = true;
            }
        }
    };

    P.opdaterArbejde = function (dt) {
        var kl = this.arbejdKilde;
        this.musFart *= Math.exp(-4 * dt);
        this.amokTid = Math.max(0, this.amokTid - dt * 0.5);
        this.amokPause -= dt;
        var maal = 0;
        var f = this.rystForskyd;
        if (kl === "knap-ryst" && this.kanRyste()) {
            var w = this.tid * 9;
            f.x = Math.cos(w) * 6;
            f.y = Math.sin(w) * 1.5;
            f.v = Math.cos(w) * 0.05;
            maal = 1;
        } else if (kl === "mus-ryst" && this.kanRyste()) {
            maal = NK.klamp(this.musFart / M.RYST.fuld, 0, 1);
        } else {
            f.x = NK.mod(f.x, 0, 8, dt);
            f.y = NK.mod(f.y, 0, 8, dt);
            f.v = NK.mod(f.v, 0, 8, dt);
        }
        this.ryst = NK.mod(this.ryst, maal, maal > this.ryst ? 6 : 3, dt);
        var k = this.g.kolbe;
        if (k.sted === "buret" && !this.handling) {
            k.p.x = S.UNDER_BURET.x + f.x;
            k.p.y = S.UNDER_BURET.y + f.y;
            k.p.v = f.v;
        }
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

    /* Knappen Ryst (og tasten R): til = trykket ned */
    P.arbejdKnap = function (til) {
        if (til) {
            if (this.arbejdKilde || this.handling || this.holdt) return false;
            if (this.laererOptaget && this.laererOptaget()) return false;
            if (this.kanRyste()) { this.startArbejde("knap-ryst"); return true; }
            return false;
        }
        if (this.arbejdKilde === "knap-ryst") this.stopArbejde();
        return false;
    };

    P.arbejdsType = function () {
        return this.g.kolbe.sted === "buret" && !this.gjort.beregn ? "ryst" : null;
    };

    P.vaegtMaal = function () {
        var baad = this.g.vejebaad;
        if (Math.abs(baad.p.x - baad.hjem.x) < 2 && Math.abs(baad.p.y - baad.hjem.y) < 2) return this.stykMasse();
        return 0;
    };

    P.opdaterVaegt = function (dt) {
        var maal = this.vaegtMaal();
        this.vaegtVisning = NK.mod(this.vaegtVisning, maal, 7, dt);
        if (Math.abs(this.vaegtVisning - maal) < 0.0004) this.vaegtVisning = maal;
    };

    P.vaegtTekst = function () {
        return M.komma(this.vaegtVisning, 3) + " g";
    };

    P.opdaterEffekter = function (dt) {
        var i;
        for (i = this.flyvende.length - 1; i >= 0; i--) {
            var f = this.flyvende[i];
            f.a += (f.va || 0) * dt;
            if (f.fra) {
                f.t += dt / f.varighed;
                var e = Math.min(1, f.t);
                f.x = NK.lerp(f.fra.x, f.til.x, e);
                f.y = NK.lerp(f.fra.y, f.til.y, e) - Math.sin(Math.PI * e) * (f.bue === undefined ? 40 : f.bue);
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
                if (f.y > S.BORD - 1) {
                    if (f.draabe) { this.flyvende.splice(i, 1); continue; }
                    f.y = S.BORD - 1;
                    f.vx *= 0.5;
                    f.vy = -f.vy * 0.25;
                    if (Math.abs(f.vy) < 30) { f.vy = 0; f.vx = 0; f.va = 0; f.fysik = false; }
                }
            }
        }

        for (i = this.dampe.length - 1; i >= 0; i--) {
            var p = this.dampe[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += dt * 8;
            p.liv -= dt * 0.6;
            if (p.liv <= 0 || p.y < S.SKAB.glas + 20) this.dampe.splice(i, 1);
        }
    };
}());
