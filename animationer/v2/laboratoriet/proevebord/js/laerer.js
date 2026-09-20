/* =====================================================================
   laerer.js - Kemichael paa proevebordet

   Selve figuren (gang, arm, ansigt, tale, klik paa ham og kaffen) staar
   i ../../../kemichael/kemichael.js. Her staar de scener, der hoerer til
   bordet.

   Uheld (laereren toerrer op):
     spild      et aabent glas blev rystet, saa det skvulpede ud
     vaeltet    et reagensglas blev sat paa bordet og vaeltede
     overloeb   en beholder loeb over

   Bemaerkninger (bordet fortsaetter):
     affald     en hel flaske blev haeldt i affaldsdunken; han fylder
                den op igen, én gang

   Replikker fra forloebet (bordet fortsaetter):
     replik     forloebet (forloeb.js) har { sig } som konsekvens, eller et
                trin har sit eget sig, og side.js sender det herhen som
                laererReplik(tekst, valg, kilde). Han kommer ind, siger
                linjerne og gaar igen. valg kan have:
                  peg      navnet paa en genstand: han stiller sig ved den
                           og markerer den. Bag bordet (S8) standser han i
                           stedet dér, hvor der er plads, og peger paa den
                  glimt    id paa et glimt af hans baggrund, sagt til sidst
                  udtryk   "toer" (standard), "streng", "mild", "skeptisk"
                           eller et udtryk-objekt som i kemichael.js
                Replikker venter paa hinanden i stedet for at falde sammen
                til én, og han overhoerer dem aldrig: det er forloebet, der
                har besluttet, at han skal tale. Mens han taler om en
                genstand, holder boblen sig fri af den (L.undgaa), og et
                uheld, der afbryder ham, laegger resten af replikken
                forrest i koeen, saa den bliver sagt bagefter.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var P = NK.Bord.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    /* Kaffen staar ved sikkerhedsplakaten (F58, kaffeSted i bord.js) -
       eller paa den foerste hylde, hvis rummet ingen plakat har - saa han
       gaar derhen, hvor koppen er, og ikke til et fast sted. Han stiller
       sig til hoejre for koppen, som han altid har gjort, hvis der er
       plads til ham dér; ellers til venstre for den, og saa raekker han
       armen mod den (kaffeArm) i stedet for op mod venstre. */
    function kopMidte(b) {
        var kop = b.g && b.g.kaffekop;
        if (!kop || !kop.type) return null;
        var r = b.rekt(kop, 0);
        return { x: r.x + r.b / 2, y: r.y + r.h * 0.4 };
    }
    function kopTilHoejre(b, m) {
        var k = b.laererSkala ? b.laererSkala() : 1;
        return m.x + 110 > NK.Scene.BREDDE - 112 * k;
    }
    K.paa(P, {
        kaffeX: function () {
            var m = kopMidte(this), H = NK.Scene.HYLDE;
            if (!m) return H ? H.x0 + 154 : 170;
            var k = this.laererSkala ? this.laererSkala() : 1;
            return kopTilHoejre(this, m) ? m.x - 100 * k : m.x + 110;
        },
        kaffeArm: function () {
            var m = kopMidte(this);
            if (!m || !kopTilHoejre(this, m)) return -0.5;
            return NK.klamp(this.pegVinkel(m.x, m.y), -1.1, 1.1);
        },
        fredet: ["spild"]
    });

    P.laererNytEkstra = function () {
        this.laererVent = [];
        this.uheldTal = {};
        this.flaskerFyldt = {};
        this.advaret = {};
    };

    /* ----- Hvad han opdager --------------------------------------------------
       Han skal ikke tale hele tiden. Uheld med farlige kemikalier og knust
       glas ser han altid; alt andet lader han passere i 60 % af tilfaeldene.
       laererAltid = true (selvtesten) slaar tilfaeldet fra. */
    var ALVORLIG = ["aetsende", "giftig", "brandfarlig", "oxiderende", "kronisk"];

    function alvorlig(maerker) {
        return !!maerker && maerker.some(function (m) { return ALVORLIG.indexOf(m) >= 0; });
    }

    function farligt(o) {
        return !!o && alvorlig(NK.Stof.faremaerker(o));
    }

    P.laererOpdager = function (farlig) {
        if (this.laererAltid || farlig) return true;
        return Math.random() < 0.4;
    };

    /* ----- Farlige kemikalier: han advarer, naar de spildes (F51) ----------
       Foer advarede han, foerste gang en farlig flaske blev taget. Nu siger
       han kun noget, naar noget farligt faktisk er kommet ud paa bordet:
       stoffets egne advarselslinjer (fare i stoftabellen) kommer, naar han
       har toerret op (laererUheld). Det, der ikke er spildt, er ikke farligt
       for nogen. */
    function farligeLinjer(farer) {
        var f = (farer || []).filter(function (x) { return x.trin.sig && alvorlig(x.trin.maerker); })[0];
        if (!f) return [];
        return (Array.isArray(f.trin.sig) ? f.trin.sig : [f.trin.sig]).map(function (t) { return sig(t); });
    }

    /* Bemaerkninger, der ventede paa, at laereren blev ledig. Noeglen
       afgoer, hvad der taeller som "den samme": som regel scenen (fn), men
       to forskellige replikker fra forloebet skal begge med. */
    P.laererKo = function (fn, arg, noegle) {
        noegle = noegle || fn;
        this.laererVent = this.laererVent || [];
        for (var i = 0; i < this.laererVent.length; i++) if (this.laererVent[i].noegle === noegle) return;
        this.laererVent.push({ fn: fn, arg: arg, noegle: noegle });
    };

    P.laererVentende = function () {
        var L = this.laerer;
        if (!L || L.scene || !this.laererVent || !this.laererVent.length) return;
        var v = this.laererVent.shift();
        if (this[v.fn]) this[v.fn](v.arg);
    };

    function sig(tekst) {
        return { sig: tekst, vis: 1.4 + tekst.length * 0.05, tid: 1.5 + tekst.length * 0.05 };
    }

    /* En kort bemaerkning: han kommer ind, siger replikkerne og gaar igen.
       mod er det sted paa bordet, det handler om: bag bordet standser han,
       hvor der er plads, og peger derhen i stedet for at gaa hen til det.
       foran: kun oprydningen efter et uheld bringer ham om foran bordet
       (F30); alt andet, ogsaa det, der kraever hans haender, sker bagfra. */
    function bemaerkning(mig, navn, x, udtryk, replikker, ekstra, mod, foran) {
        var trin = [{ udtryk: udtryk }, { gaa: x, mod: mod, foran: foran }];
        replikker.forEach(function (rp, i) {
            if (i > 0) trin.push({ tid: 0.2 });
            trin.push(sig(rp));
        });
        trin = trin.concat(ekstra || [], [
            { udtryk: { skeptisk: 0, briller: 0 } },
            { gaa: UDE }
        ]);
        mig.laererKoer(navn, trin, false);
    }

    /* ----- Replikker fra forloebet -------------------------------------------
       Se hovedkommentaren. Ansigtet vaelges med et navn, saa forloebet ikke
       skal kende tallene i kemichael.js. */
    var UDTRYK = {
        toer:     { vrede: 0.3, humoer: -0.3, roed: 0, skeptisk: 0.4, briller: 0 },
        streng:   { vrede: 0.7, humoer: -0.6, roed: 0.2, skeptisk: 0.5, briller: 1 },
        mild:     { vrede: 0.1, humoer: 0.3, roed: 0, skeptisk: 0, briller: 0 },
        skeptisk: { vrede: 0.3, humoer: -0.4, roed: 0, skeptisk: 0.9, briller: 1 }
    };

    P.laererReplik = function (tekst, valg, kilde) {
        if (!this.laerer) return false;
        valg = valg || {};
        var linjer = (Array.isArray(tekst) ? tekst : [tekst]).filter(function (t) { return !!t; });
        if (!linjer.length) return false;
        /* Samme kilde (fx en udloeser) staar kun i koeen én gang; to
           forskellige kilder staar der begge */
        var noegle = "replik:" + ((kilde && kilde.id) || linjer[0]);
        this.laererKo("laererSigReplik", { linjer: linjer, valg: valg }, noegle);
        this.laererVentende();
        return true;
    };

    /* Det sted, en replik peger paa: genstandens midte, lidt under dens
       top, saa armen peger paa den og ikke ned bag den */
    function pegPunkt(mig, gg) {
        var rk = mig.rekt(gg, 0);
        return { x: gg.p.x, y: rk.y + Math.min(24, rk.h * 0.3), rekt: rk };
    }

    P.laererSigReplik = function (a) {
        var v = a.valg || {};
        var udtryk = typeof v.udtryk === "string" ? UDTRYK[v.udtryk] : v.udtryk;
        udtryk = udtryk || UDTRYK.toer;
        var gg = v.peg && this.g ? this.g[v.peg] : null;
        var x = gg ? NK.klamp(gg.p.x - 180, 60, NK.Scene.BREDDE - 260)
                   : NK.klamp(NK.Scene.BREDDE * 0.35, 60, NK.Scene.BREDDE - 260);
        var ekstra = v.glimt && K.glimtTrin ? K.glimtTrin(v.glimt) : [];
        var trin = [{ udtryk: udtryk }, { gaa: x, mod: gg ? pegPunkt(this, gg) : undefined }];
        if (gg) trin.push({ kald: function () { this.markér(v.peg, 4); this.laerer.undgaa = v.peg; } });
        a.linjer.forEach(function (rp, i) {
            if (i > 0) trin.push({ tid: 0.2 });
            var t = sig(rp);
            t.replikLinje = i;          /* saa en afbrudt replik ved, hvor langt den kom */
            trin.push(t);
        });
        trin = trin.concat(ekstra, [
            { kald: function () { this.laerer.undgaa = null; this.laerer.replikNu = null; } },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { gaa: UDE }
        ]);
        this.laerer.replikNu = a;
        this.laererKoer("replik", trin, false);
    };

    /* Et uheld afbryder den scene, der koerer. Var det en replik fra
       forloebet, skal resten af den ikke gaa tabt: de linjer, der ikke er
       sagt, laegges forrest i koeen og siges, naar han er faerdig med at
       toerre op. Reglen om ikke at afbryde boblen gaelder stadig - det er
       scenen, der afbrydes, ikke den linje, der staar. */
    P.laererAfbryd = function () {
        var L = this.laerer;
        if (!L) return;
        var sc = L.scene, a = L.replikNu;
        if (sc && sc.navn === "replik" && a && a.linjer) {
            var sagt = 0;
            for (var j = 0; j < sc.trin.length && j <= sc.i; j++) {
                var tr = sc.trin[j];
                if (tr.replikLinje !== undefined && (j < sc.i || tr.startet)) sagt = tr.replikLinje + 1;
            }
            var rest = a.linjer.slice(sagt);
            this.laererVent = this.laererVent || [];
            if (rest.length) this.laererVent.unshift({ fn: "laererSigReplik", arg: { linjer: rest, valg: a.valg }, noegle: "replik:afbrudt" });
        }
        L.replikNu = null;
        L.undgaa = null;
        L.scene = null;
    };

    /* ----- Uheld: han toerrer op ------------------------------------------ */
    var REPLIK = {
        spild:    ["Det skal blandes, ikke kastes.", "Glasudstyr er ikke en rangle.", "Tredje gang. Køkkenrullen slipper op."],
        rystet:   ["Det skal blandes, ikke kastes.", "Glasudstyr er ikke en rangle.", "Tredje gang. Køkkenrullen slipper op."],
        vaeltet:  ["Et reagensglas kan ikke stå. Derfor stativet.", "Stativet. Lige der.", "Igen. Stativet står stadig samme sted."],
        overloeb: ["Fuldt er fuldt.", "Der står et tal på glasset. Det er et loft.", "Man kan ikke hælde to liter i en halv."]
    };

    P.laererUheld = function (slags, gg) {
        var mig = this;
        var L = this.laerer;
        if (!L) return;
        if (slags === "knust") return this.laererKnust(gg);
        /* Det, der loeb ud: farligt indhold ser han altid */
        var maerker = gg.spildtMaerker || (gg.indhold ? NK.Stof.faremaerker(NK.Beholder.samlet(gg)) : []);
        var advarsel = farligeLinjer(gg.spildtFarer);
        gg.spildtMaerker = null;
        gg.spildtFarer = null;
        if (!this.laererOpdager(alvorlig(maerker))) return;
        /* F41: han greb ind, saa tegneserien maa sige, at han toerrede op */
        if (this.opryddet) this.opryddet[slags + "_" + gg.navn] = "laerer";
        this.laererAfbryd();
        this.uheldTal = this.uheldTal || {};
        this.uheldTal[slags] = (this.uheldTal[slags] || 0) + 1;
        var liste = REPLIK[slags] || REPLIK.spild;
        /* M18: foerste gang siger han det faelles. Sker det igen, tager han
           forsoegets egen vending, hvis animationen har en (tekst.js
           "kemichael") */
        var egen = this.uheldTal[slags] > 1 && K.katalogReplik ? K.katalogReplik(slags) : "";
        var replik = egen || liste[Math.min(this.uheldTal[slags], liste.length) - 1];
        var pyt = this.pytter[this.pytter.length - 1];
        this.laererKoer("spild", [
            { tid: 0.5 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3, skeptisk: slags === "overloeb" ? 0.8 : 0, briller: slags === "vaeltet" ? 1 : 0 } },
            { gaa: function () { return NK.klamp((pyt ? pyt.x : gg.p.x) - 130, 60, NK.Scene.BREDDE - 260); }, foran: true },
            K.suk(),
            { sig: replik, vis: 2.4, tid: 0.3 },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { arm: 1.8, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd && NK.Lyd.papir) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
                this.pytter.forEach(function (p) { p.vaad = Math.min(p.vaad, 1 - t); });
                if (t >= 0.99) this.pytter = [];
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd && NK.Lyd.brum) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(advarsel.length ? [{ udtryk: { skeptisk: 0.6, briller: 1 } }].concat(advarsel) : [], K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Uheld: et glas er knust, han fejer og henter et nyt ------------- */
    var KNUST = ["Det var et glas. Nu er det affald.", "Glas er skrøbeligt. Det står i navnet.", "Tredje glas. Jeg har en kasse til det."];

    P.laererKnust = function (gg) {
        var L = this.laerer;
        if (this.opryddet) this.opryddet["knust_" + gg.navn] = "laerer";
        var advarsel = farligeLinjer(gg.spildtFarer);
        gg.spildtFarer = null;
        this.laererAfbryd();
        this.uheldTal = this.uheldTal || {};
        this.uheldTal.knust = (this.uheldTal.knust || 0) + 1;
        var egenKnust = this.uheldTal.knust > 1 && K.katalogReplik ? K.katalogReplik("knust") : "";
        var replik = egenKnust || KNUST[Math.min(this.uheldTal.knust, KNUST.length) - 1];
        var sx = 0;
        this.skaar.forEach(function (s) { sx += s.x; });
        sx = this.skaar.length ? sx / this.skaar.length : gg.p.x;
        var x = NK.klamp(sx - 150, 60, NK.Scene.BREDDE - 260);
        this.laererKoer("spild", [
            { tid: 0.5 },
            { udtryk: { vrede: 0.9, humoer: -0.9, roed: 0.3, briller: 1 } },
            { gaa: x, foran: true },
            K.suk(1.2),
            { sig: replik, vis: 2.4, tid: 0.3 },
            { udtryk: { briller: 0 } },
            { kald: function () { this.laerer.baerer = "kost"; } },
            { arm: 2.0, tid: 0.5 },
            { tid: 2.4, hver: function (t) {
                this.laerer.arm = 2.0 + Math.sin(t * Math.PI * 6) * 0.25;
                var maalX = this.laerer.x + 70;
                this.skaar.forEach(function (s) {
                    s.hvile = true;
                    s.x = NK.lerp(s.x, maalX, 0.06);
                    s.alfa = Math.min(s.alfa, 1.3 - t * 1.3);
                });
                this.pytter.forEach(function (p) { p.vaad = Math.min(p.vaad, 1 - t); });
                if (t >= 0.99) { this.skaar = []; this.pytter = []; }
            } },
            { kald: function () { this.laerer.baerer = null; } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(advarsel, [
            sig("Jeg henter et nyt.")
        ].concat(K.glimtTrin("kunst"), K.uheld(), [
            { gaa: UDE },
            { kald: function () { this.genopstil(gg); if (NK.Lyd && NK.Lyd.dunk) NK.Lyd.dunk(); } }
        ])));
    };

    /* ----- Bemaerkninger --------------------------------------------------- */
    P.laererHaendelse = function (type, data) {
        /* En hel flaske i affaldet opdager han maaske; en kolbe, opstillingen
           har sagt skal fyldes igen (genopfyld), opdager han altid (S16) */
        var genopfyld = type === "affald" && data.fra && data.fra.spec && data.fra.spec.genopfyld;
        if (type === "affald" && data.fra && (data.fra.kan.flaske || genopfyld) && data.indhold && data.indhold.V > 20 && (genopfyld || this.laererOpdager(farligt(data.indhold)))) {
            this.laererKo("laererFlaskeAffald", data.fra);
            this.laererVentende();
        }
        /* F53: tungmetaller i vasken - det ser han altid */
        if (type === "vask" && data && data.indhold) {
            var metal = tungmetal(data.indhold);
            if (metal) {
                this.laererKo("laererVask", { fra: data.fra, til: data.til, metal: metal });
                this.laererVentende();
            }
        }
        /* F55: en brugt spatel i et andet stof - det ser han altid */
        if (type === "forurenet" && data && data.jar) {
            this.laererKo("laererForurenet", data);
            this.laererVentende();
        }
        if (type === "voldsom" && this.laererOpdager(farligt(data && data.indhold ? NK.Beholder.samlet(data) : null))) {
            this.laererKo("laererVoldsom", data);
            this.laererVentende();
        }
    };

    /* Det kogte over. Replikken afhaenger af, hvad der var i glasset. */
    P.laererVoldsom = function (c) {
        this.uheldTal = this.uheldTal || {};
        this.uheldTal.voldsom = (this.uheldTal.voldsom || 0) + 1;
        var k = this.uheldTal.voldsom;
        var St = NK.Stof, o = NK.Beholder.samlet(c);
        var replikker;
        if (c.sidsteGas === "NO2(g)") replikker = ["Brune dampe.", "Det er ikke en farve, man vil have i lungerne. Stinkskab."];
        else if (St.konc(o, "H+") > 2000 && !St.faste(o).length) replikker = ["Syre i vand. Ikke vand i syre.", "Og lidt ad gangen."];
        else replikker = ["Det kogte over.", "Mindre ad gangen. Metallet skal ikke have det hele på én gang."];
        if (k === 2) replikker = ["Igen. Det står på plakaten, hvis den var stor nok."];
        if (k >= 3) replikker = ["Jeg tæller ikke længere."];
        bemaerkning(this, "voldsom", NK.klamp(c.p.x - 180, 60, NK.Scene.BREDDE - 260), { vrede: 0.7, humoer: -0.6, roed: 0.2, briller: 1 },
            replikker, k === 1 ? K.glimtTrin("oejenbryn") : [], pegPunkt(this, c));
    };

    /* ----- Tungmetaller i vasken (F53) -------------------------------------
       Det, der ryger i kloakken, laeses af opskriften paa det, der blev
       haeldt ud: et stof, hvis atomer rummer et tungmetal, i en maengde,
       der kan ses (over et fnug). Jern er ikke med - det er et
       tungmetal paa papiret, men ikke det, man holder ude af afloebet. */
    var TUNG = { Ag: "sølv", Pb: "bly", Hg: "kviksølv", Cd: "cadmium", Cu: "kobber", Ni: "nikkel",
                 Cr: "krom", Co: "kobolt", Zn: "zink", Ba: "barium", Sn: "tin", Mn: "mangan" };
    function tungmetal(o) {
        var St = NK.Stof, ud = null, mest = 0;
        Object.keys(o.n || {}).forEach(function (navn) {
            var s = St.stof(navn), n = o.n[navn] || 0;
            if (!s || !s.atomer || n < 0.05) return;
            Object.keys(s.atomer).forEach(function (el) {
                if (TUNG[el] && n > mest) { mest = n; ud = TUNG[el]; }
            });
        });
        return ud;
    }

    P.laererVask = function (a) {
        this.uheldTal = this.uheldTal || {};
        this.uheldTal.vask = (this.uheldTal.vask || 0) + 1;
        var k = this.uheldTal.vask;
        var M = a.metal.charAt(0).toUpperCase() + a.metal.slice(1);
        var replikker = k === 1 ? [M + " i vasken.", "Tungmetaller skal i affaldsdunken, ikke i kloakken."]
            : (k === 2 ? ["Igen. " + M + " i vasken.", "Dunken står lige ved siden af."] : ["Rensningsanlægget takker."]);
        bemaerkning(this, "vask", NK.klamp(a.til.p.x - 120, 60, NK.Scene.BREDDE - 260), { vrede: 0.8, humoer: -0.7, roed: 0.2, skeptisk: 0.6, briller: 1 },
            replikker, k === 1 ? K.glimtTrin("oejenbryn") : [], pegPunkt(this, a.til), false);
    };

    /* ----- En brugt spatel i et andet stof (F55) -----------------------------
       Han skaelder ud: det, der var paa spatlen, er nu i bøtten, og det
       kan ikke goeres om. Bøtten husker det selv (bord.tjekForurening). */
    P.laererForurenet = function (a) {
        this.uheldTal = this.uheldTal || {};
        this.uheldTal.forurenet = (this.uheldTal.forurenet || 0) + 1;
        var k = this.uheldTal.forurenet;
        var s = a.med && a.med[0] ? NK.Stof.STOFFER[a.med[0].stof] : null;
        var fra = s ? (s.dansk || NK.Stof.formel(a.med[0].stof)) : "et andet stof";
        var replikker = k === 1 ? ["Stop! Den spatel har været i " + fra + ".", "Nu er " + a.jar.titel + " forurenet. Én ren spatel pr. stof."]
            : (k === 2 ? ["Igen en brugt spatel.", "Bøtten med rene spatler står lige der."] : ["Snart er der ikke en ren bøtte tilbage i laboratoriet."]);
        bemaerkning(this, "forurenet", NK.klamp(a.jar.p.x - 120, 60, NK.Scene.BREDDE - 260), { vrede: 0.95, humoer: -0.85, roed: 0.4, skeptisk: 0.3, briller: 1 },
            replikker, k === 1 ? K.glimtTrin("oejenbryn") : [], pegPunkt(this, a.jar), false);
    };

    /* En hel flaske i affaldsdunken: han fylder den op igen, én gang.
       Det samme for en kolbe med genopfyld i opstillingen (S16). */
    P.laererFlaskeAffald = function (fl) {
        var mig = this, ord = fl.kan.flaske ? "flaske" : "kolbe";
        this.flaskerFyldt = this.flaskerFyldt || {};
        var foer = this.flaskerFyldt[fl.navn];
        this.flaskerFyldt[fl.navn] = true;
        var ekstra = foer ? [sig("Ikke to gange.")] : [
            { arm: -0.4, tid: 0.5 },
            { tid: 0.8 },
            { kald: function () {
                fl.indhold = NK.Stof.lav(fl.spec.indhold);
                if (NK.Lyd && NK.Lyd.haeld) NK.Lyd.haeld(0.8);
                this.aendret("flaske");
            } },
            { arm: HAENGER, tid: 0.4 },
            sig("Der er mere i forberedelsen. Én gang.")
        ];
        bemaerkning(this, "affald", 150, { vrede: 1, humoer: -0.9, roed: 0.45, briller: 1 },
            ["En hel " + ord + " i affaldet.", foer ? "Det var den sidste." : "Den var til hele klassen."],
            ekstra, fl, false);
    };

    /* ----- Tegning ------------------------------------------------------------- */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "koekkenrulle", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, { x: 36, y: 22 });
        } else if (L.baerer === "kost") {
            NK.Sprites.tegnPositur(ctx, "kost", { x: hd.x, y: hd.y, v: -0.8 + (L.arm - 2.0) * 0.8 }, { x: 120, y: 17 });
        }
    };
}());
