/* =====================================================================
   sim_bro.js - vejvalg over Lillebaelt som dynamisk balance

   Trafikken mellem Fyn og Jylland kan tage to veje: den nye bro
   (motorvej, tre spor hver vej, 110 km/t) eller den gamle bro (et spor
   hver vej, 70 km/t).

   Hver ny bilist ser paa rejsetidstavlen og vaelger oftest den bro, der
   er hurtigst lige nu. Rejsetiden paa en rute skoennes med

       rejsetid = (biler paa ruten + biler i koe) / gennemstroemning

   Naar trafikken glider, er den nye bro klart hurtigst, og naesten alle
   tager den. I myldretiden fyldes den nye bro, rejsetiden stiger, og en
   del af bilisterne flytter over paa den gamle. Fordelingen indstiller
   sig, saa rejsetiderne bliver omtrent lige lange. Bilerne koerer hele
   tiden, men fordelingen staar stille: en dynamisk balance.

   Trafikmaengden foelger doegnet. Storm saetter farten paa den nye bro
   ned til 50 km/t, vejarbejde lukker et spor, og et uheld spaerrer et
   spor et stykke tid.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var NY = 0;
    var GAMMEL = 1;

    /* spor = antal vejbaner i HVER retning */
    var BROER = [
        { navn: "Den nye Lillebæltsbro", kort: "Ny bro", spor: 3 },
        { navn: "Den gamle Lillebæltsbro", kort: "Gl. bro", spor: 1 }
    ];

    var FULD_KMT = 110;       // fartfaktor 1
    var FART_BILER = 2.8;     // billaengder pr. sekund ved 110 km/t
    var TIDSLUGE = 0.8;       // afstand til bilen foran, i sekunder
    var MIN_GAB = 5;          // mindste afstand mellem kofangere (px)
    var MAKS_BILER = 320;
    var LANGSOM_ANDEL = 0.18; // lastbiler og campingvogne, hoejst 80 km/t
    var LANGSOM_KMT = 80;
    var STORM_LUGE = 1.6;     // laengere afstand paa den nye bro i storm
    var ULYKKE_TID = 24;
    var ARBEJDE_FRA = 0.42;   // vejarbejdet som broek af vejen
    var ARBEJDE_TIL = 0.58;

    var TIME_SEK = 12;        // sekunder pr. time paa uret ved 1x
    var START_KLOKKE = 6;
    var LOKAL = 0.06;         // lokaltrafik, der altid tager den gamle bro
    var VANE = 1.0;           // motorvejen foretraekkes med ca. 1 minut
    var SPREDNING = 1.5;      // hvor forskelligt bilisterne skoenner tiden
    var MAKS_MOERKE = 0.5;

    /* Trafik i hver retning over doegnet: [klokken, biler pr. sekund] */
    var DOEGN = [
        [0, 0.08], [4.5, 0.08], [5.5, 0.4], [6.5, 1.7], [7.3, 2.5],
        [8.6, 2.5], [9.5, 1.4], [11, 1.2], [14, 1.3], [15, 1.8],
        [15.8, 2.5], [17.2, 2.5], [18.2, 1.4], [20, 0.6], [22, 0.3],
        [23.5, 0.1], [24, 0.08]
    ];
    var MAKS_TRAFIK = 2.5;

    var FASER = [
        { navn: "Nat", fra: 0, til: 5.5, farve: "rgba(80, 110, 200, 0.20)" },
        { navn: "Morgentrafik", fra: 5.5, til: 9.5, farve: "rgba(224, 84, 70, 0.20)" },
        { navn: "Middag", fra: 9.5, til: 14.5, farve: "rgba(242, 197, 61, 0.12)" },
        { navn: "Eftermiddagstrafik", fra: 14.5, til: 18.5, farve: "rgba(224, 84, 70, 0.20)" },
        { navn: "Aften", fra: 18.5, til: 22.5, farve: "rgba(155, 107, 214, 0.18)" },
        { navn: "Nat", fra: 22.5, til: 24, farve: "rgba(80, 110, 200, 0.20)" }
    ];

    var BILER = ["bilBlaa", "bilHvid", "bilRoed", "bilGroen", "bilOrange"];

    var BOBLE_GAMMEL = ["Den nye er fuld", "Så tager vi den gamle", "Kø på motorvejen"];
    var BOBLE_KOE = ["Kø …", "Vi holder stille", "Kom nu!"];
    var BOBLE_FRI = ["Fri bane", "Det glider"];
    var BOBLE_NAT = ["Helt stille i nat", "Ingen andre her"];
    var BOBLE_LANGSOM = ["Jeg har tid", "Rolig nu"];
    var BOBLE_STORM = ["Kun 50 i den blæst", "Hold godt fast"];

    function vilkaarlig(liste) {
        return liste[(Math.random() * liste.length) | 0];
    }

    function trafikVed(h) {
        for (var i = 1; i < DOEGN.length; i++) {
            if (h <= DOEGN[i][0]) {
                var a = DOEGN[i - 1];
                var b = DOEGN[i];
                return NK.lerp(a[1], b[1], (h - a[0]) / (b[0] - a[0]));
            }
        }
        return DOEGN[DOEGN.length - 1][1];
    }

    function faseVed(h) {
        for (var i = 0; i < FASER.length; i++) {
            if (h >= FASER[i].fra && h < FASER[i].til) return FASER[i].navn;
        }
        return "Nat";
    }

    function moerkeVed(h) {
        if (h >= 8 && h <= 17) return 0;
        if (h >= 21 || h <= 5) return MAKS_MOERKE;
        if (h < 8) return MAKS_MOERKE * (8 - h) / 3;
        return MAKS_MOERKE * (h - 17) / 4;
    }

    function klokketekst(h) {
        var min = Math.floor(h * 60) % 1440;
        var t = Math.floor(min / 60);
        var m = min % 60;
        return (t < 10 ? "0" : "") + t + ":" + (m < 10 ? "0" : "") + m;
    }

    /* Rute = bro og retning. Retning +1 er mod Jylland (mod hoejre). */
    function rute(bro, retning) {
        return bro * 2 + (retning > 0 ? 0 : 1);
    }

    NK.SimBro = function () {
        this.l = new NK.Laerred(NK.el("bro-laerred"));
        this.doegn = new NK.Laerred(NK.el("bro-doegn"));

        this.graf = new NK.Graf(NK.el("bro-graf"), [
            { navn: "Ny bro", farve: "#3d9ee0", gruppe: "andel" },
            { navn: "Gammel bro", farve: "#e6892a", gruppe: "andel" },
            { navn: "Ny bro", farve: "#3d9ee0", gruppe: "tid" },
            { navn: "Gammel bro", farve: "#e6892a", gruppe: "tid" }
        ], {
            enheder: { andel: "% af bilisterne", tid: "rejsetid i min" },
            minTop: { andel: 100, tid: 20 }
        });

        /* Vejbaner. Raekkefoelgen i bane.biler foelger koereretningen:
           index 0 er forrest. Inden for samme bane overhales der aldrig. */
        this.baner = [];
        for (var bro = 0; bro < BROER.length; bro++) {
            for (var r = 0; r < 2; r++) {
                for (var nr = 0; nr < BROER[bro].spor; nr++) {
                    this.baner.push({
                        bro: bro, retning: r === 0 ? 1 : -1, nr: nr,
                        y: 0, biler: [], blokke: []
                    });
                }
            }
        }

        this.g = {};
        this.sek = 0;
        this.grafUr = 0;
        this.paaVej = [];

        this.nulstil();
        this.koblKnapper();
        this.geometri();
    };

    NK.SimBro.prototype.nulstil = function () {
        this.klokke = START_KLOKKE;
        this.urStop = false;
        this.paaVej.length = 0;
        for (var i = 0; i < this.baner.length; i++) {
            this.baner[i].biler.length = 0;
            this.baner[i].blokke.length = 0;
        }
        this.rest = [0, 0];
        this.koe = [0, 0, 0, 0];
        this.antal = [0, 0, 0, 0];
        this.indSum = [0, 0, 0, 0];
        this.rejsetid = [0, 0, 0, 0];
        this.rejsetidKlar = false;
        this.andelNy = 1 - LOKAL;
        this.vejarbejde = false;
        this.storm = false;
        this.ulykke = null;
        this.bobleUr = 2;
        this.graf.nulstil();
        this.opdaterKnapper();
    };

    NK.SimBro.prototype.koblKnapper = function () {
        var mig = this;

        NK.el("bro-nulstil").addEventListener("click", function () { mig.nulstil(); });
        NK.el("bro-vejarbejde").addEventListener("click", function () { mig.saetVejarbejde(!mig.vejarbejde); });
        NK.el("bro-storm").addEventListener("click", function () { mig.saetStorm(!mig.storm); });
        NK.el("bro-ulykke").addEventListener("click", function () { mig.startUlykke(); });
        NK.el("bro-urstop").addEventListener("click", function () {
            mig.urStop = !mig.urStop;
            mig.opdaterKnapper();
        });

        var faser = document.querySelectorAll("#fane-bro .faseknapper button");
        function bindFase(knap) {
            knap.addEventListener("click", function () {
                mig.saetKlokke(parseFloat(knap.getAttribute("data-klokke")));
            });
        }
        for (var i = 0; i < faser.length; i++) bindFase(faser[i]);

        /* Klik paa doegnkurven stiller uret */
        NK.el("bro-doegn").addEventListener("click", function (e) {
            var r = this.getBoundingClientRect();
            mig.saetKlokke(NK.klamp((e.clientX - r.left) / Math.max(1, r.width), 0, 0.999) * 24);
        });

        NK.grafSkift("bro", this.graf);
    };

    NK.SimBro.prototype.saetKlokke = function (h) {
        this.klokke = ((h % 24) + 24) % 24;
    };

    NK.SimBro.prototype.opdaterKnapper = function () {
        var v = NK.el("bro-vejarbejde");
        var s = NK.el("bro-storm");
        var u = NK.el("bro-ulykke");
        var k = NK.el("bro-urstop");
        if (v) v.classList.toggle("slaaet-til", !!this.vejarbejde);
        if (s) s.classList.toggle("slaaet-til", !!this.storm);
        if (u) u.classList.toggle("slaaet-til", !!this.ulykke);
        if (k) {
            k.classList.toggle("slaaet-til", !!this.urStop);
            k.textContent = this.urStop ? "▶ Start uret" : "❚❚ Stop uret";
        }
    };

    NK.SimBro.prototype.tilpas = function () {
        if (this.l.tilpas()) this.geometri();
        this.doegn.tilpas();
        this.graf.tilpas();
    };

    /* --------------------------------------------------------------- */
    /* Alle maal udregnes fra laerredets stoerrelse. Vejene gaar fra kant
       til kant. Farten maales i billaengder, saa trafikken opfoerer sig
       ens paa store og smaa skaerme.                                     */
    NK.SimBro.prototype.geometri = function () {
        var b = this.l.b;
        var h = this.l.h;
        var g = this.g;
        var i;

        g.xVand0 = b * 0.30;
        g.xVand1 = b * 0.70;

        g.yNy = h * 0.33;
        g.yGl = h * 0.76;
        g.tykNy = NK.klamp(h * 0.2, 66, 132);
        g.tykGl = NK.klamp(h * 0.09, 36, 60);
        g.midte = 4;

        function saetY(bane, y0, tyk, spor) {
            var halv = (tyk - g.midte) / 2;
            var raekkeH = halv / spor;
            /* Mod Fyn (venstre) koeres i den oeverste halvdel, mod
               Jylland i den nederste. Spor 0 er det yderste. */
            if (bane.retning < 0) {
                bane.y = y0 + (bane.nr + 0.5) * raekkeH;
            } else {
                bane.y = y0 + halv + g.midte + (spor - 1 - bane.nr + 0.5) * raekkeH;
            }
            return raekkeH;
        }

        var hNy = 1;
        var hGl = 1;
        for (i = 0; i < this.baner.length; i++) {
            var bane = this.baner[i];
            if (bane.bro === NY) hNy = saetY(bane, g.yNy - g.tykNy / 2, g.tykNy, BROER[NY].spor);
            else hGl = saetY(bane, g.yGl - g.tykGl / 2, g.tykGl, BROER[GAMMEL].spor);
        }

        g.bilB = NK.klamp(Math.min(hNy, hGl) * 1.75, 20, 40);
        g.bilH = g.bilB * 24 / 44;
        g.x0 = -g.bilB * 1.4;
        g.vejLaengde = b + g.bilB * 2.8;
        g.fartEnhed = g.bilB * FART_BILER;
        g.pBro0 = (g.xVand0 - 10 - g.x0) / g.vejLaengde;
        g.pBro1 = (g.xVand1 + 10 - g.x0) / g.vejLaengde;

        for (i = 0; i < this.paaVej.length; i++) {
            var bil = this.paaVej[i];
            bil.visY = bil.bane.y + bil.forskyd * g.bilH;
        }
    };

    /* p er bilens fremdrift langs vejen (0 = kanten den kom fra, 1 =
       den modsatte kant). x paa laerredet afhaenger af retningen. */
    NK.SimBro.prototype.xFraP = function (p, retning) {
        return this.g.x0 + (retning > 0 ? p : 1 - p) * this.g.vejLaengde;
    };

    /* ----- Fartgraenser og forstyrrelser --------------------------- */
    NK.SimBro.prototype.kmtBro = function (bro) {
        if (bro === NY) return this.storm ? 50 : (this.vejarbejde ? 80 : 110);
        return 70;
    };

    NK.SimBro.prototype.kmtLand = function (bro) {
        return bro === NY ? 110 : 70;
    };

    function fjernBlok(bane, type) {
        for (var i = bane.blokke.length - 1; i >= 0; i--) {
            if (bane.blokke[i].type === type) bane.blokke.splice(i, 1);
        }
    }

    /* Vejarbejde lukker det yderste spor i begge retninger midt paa den
       nye bro og saetter farten ned. */
    NK.SimBro.prototype.saetVejarbejde = function (til) {
        this.vejarbejde = til;
        for (var i = 0; i < this.baner.length; i++) {
            var bane = this.baner[i];
            if (bane.bro !== NY || bane.nr !== 0) continue;
            fjernBlok(bane, "arbejde");
            if (til) {
                bane.blokke.push({
                    type: "arbejde",
                    p: bane.retning > 0 ? ARBEJDE_FRA : 1 - ARBEJDE_TIL
                });
            }
        }
        this.opdaterKnapper();
    };

    NK.SimBro.prototype.saetStorm = function (til) {
        this.storm = til;
        this.opdaterKnapper();
    };

    /* Et uheld spaerrer et tilfaeldigt spor paa en af broerne. */
    NK.SimBro.prototype.startUlykke = function () {
        if (this.ulykke) return;
        var kandidater = [];
        for (var i = 0; i < this.baner.length; i++) {
            if (this.baner[i].blokke.length === 0) kandidater.push(this.baner[i]);
        }
        if (!kandidater.length) return;
        var bane = kandidater[(Math.random() * kandidater.length) | 0];
        var p = 0.38 + Math.random() * 0.24;
        bane.blokke.push({ type: "ulykke", p: p });
        this.ulykke = { bane: bane, p: p, tid: ULYKKE_TID, vinkel: Math.random() };
        this.opdaterKnapper();
    };

    /* ----- Bilernes udstraekning og fart --------------------------- */
    NK.SimBro.prototype.front = function (bil) {
        return bil.p * this.g.vejLaengde + this.g.bilB * 0.5;
    };

    NK.SimBro.prototype.bag = function (bil) {
        return bil.p * this.g.vejLaengde - this.g.bilB * (bil.lang ? 1.35 : 0.5);
    };

    NK.SimBro.prototype.paaBroen = function (p) {
        return p > this.g.pBro0 && p < this.g.pBro1;
    };

    /* Oensket fart: graensen hvor bilen er, eller lidt foran den, saa
       bilerne bremser inden en langsommere strækning. */
    NK.SimBro.prototype.oenskFart = function (bil) {
        var g = this.g;
        var bro = bil.bane.bro;
        var kmt = this.kmtLand(bro);
        var frem = bil.p + g.bilB * 3 / g.vejLaengde;
        if (this.paaBroen(bil.p) || this.paaBroen(frem)) kmt = Math.min(kmt, this.kmtBro(bro));
        if (bil.lang) kmt = Math.min(kmt, LANGSOM_KMT);
        return g.fartEnhed * (kmt / FULD_KMT) * bil.egen;
    };

    /* Rejsetid ved fri bane, i sekunder (vises som minutter). */
    NK.SimBro.prototype.friTid = function (bro) {
        var g = this.g;
        var broDel = g.pBro1 - g.pBro0;
        var egen = 0.97;
        var vLand = g.fartEnhed * this.kmtLand(bro) / FULD_KMT * egen;
        var vBro = g.fartEnhed * this.kmtBro(bro) / FULD_KMT * egen;
        return (1 - broDel) * g.vejLaengde / vLand + broDel * g.vejLaengde / vBro;
    };

    /* Afstand fra bilens front til naermeste forhindring foran den. */
    NK.SimBro.prototype.gabForan = function (bane, bil, index) {
        var gab = Infinity;
        if (index > 0) gab = this.bag(bane.biler[index - 1]) - this.front(bil);
        for (var i = 0; i < bane.blokke.length; i++) {
            var bp = bane.blokke[i].p * this.g.vejLaengde;
            if (bp > bil.p * this.g.vejLaengde) gab = Math.min(gab, bp - this.front(bil));
        }
        return gab;
    };

    /* ----- Indkoersel ---------------------------------------------- */
    NK.SimBro.prototype.bedsteSpor = function (bro, retning) {
        var bedst = null;
        var bedstGab = -Infinity;
        for (var i = 0; i < this.baner.length; i++) {
            var b = this.baner[i];
            if (b.bro !== bro || b.retning !== retning || b.blokke.length) continue;
            var sidste = b.biler[b.biler.length - 1];
            var gab = sidste ? this.bag(sidste) - this.g.bilB * 0.5 : Infinity;
            if (gab > bedstGab + (Math.random() - 0.5) * 2) {
                bedst = b;
                bedstGab = gab;
            }
        }
        return { bane: bedst, gab: bedstGab };
    };

    NK.SimBro.prototype.sendBil = function (bane, grund, gab) {
        var lang = Math.random() < LANGSOM_ANDEL;
        var bil = {
            retning: bane.retning,
            bane: bane,
            rute: rute(bane.bro, bane.retning),
            grund: grund,
            p: 0,
            v: 0,
            lang: lang,
            egen: lang ? 0.95 + Math.random() * 0.07 : 0.92 + Math.random() * 0.16,
            sprite: BILER[(Math.random() * BILER.length) | 0],
            forskyd: (Math.random() - 0.5) * 0.14,
            visY: 0,
            skiftUr: 0.8,
            stopTid: 0,
            hindretTid: 0,
            koe: false,
            boble: null,
            bobleTid: 0
        };
        bil.visY = bane.y + bil.forskyd * this.g.bilH;
        bil.v = Math.min(this.oenskFart(bil), Math.max(0, gab - MIN_GAB) / TIDSLUGE);
        bane.biler.push(bil);
        this.paaVej.push(bil);
        this.antal[bil.rute]++;
        this.indSum[bil.rute] += 1;
    };

    /* ----- Koersel i et spor --------------------------------------- */
    NK.SimBro.prototype.koerSpor = function (bane, dt) {
        var L = this.g.vejLaengde;
        var biler = bane.biler;
        var stormBro = this.storm && bane.bro === NY;
        var frem = this.g.bilB * 3 / L;
        for (var i = 0; i < biler.length; i++) {
            var bil = biler[i];
            var oensk = this.oenskFart(bil);
            var maal = oensk;
            var luge = stormBro && (this.paaBroen(bil.p) || this.paaBroen(bil.p + frem)) ? TIDSLUGE * STORM_LUGE : TIDSLUGE;
            var gab = this.gabForan(bane, bil, i);
            if (gab < Infinity) maal = Math.min(maal, Math.max(0, gab - MIN_GAB) / luge);

            /* Bremser hurtigt, accelererer roligt */
            bil.v = NK.mod(bil.v, maal, maal < bil.v ? 8 : 2.4, dt);
            var nyP = bil.p + bil.v * dt / L;

            /* Aldrig ind i bilen foran */
            if (i > 0) {
                var loft = (this.bag(biler[i - 1]) - MIN_GAB * 0.4 - this.g.bilB * 0.5) / L;
                if (nyP > loft) {
                    nyP = Math.max(bil.p, loft);
                    bil.v = Math.min(bil.v, biler[i - 1].v);
                }
            }
            bil.p = nyP;
            bil.koe = bil.v < oensk * 0.4;
            bil.stopTid = bil.koe ? bil.stopTid + dt : 0;
            bil.hindretTid = bil.v < oensk * 0.85 ? bil.hindretTid + dt : 0;
        }

        while (biler.length && biler[0].p >= 1) {
            var fremme = biler.shift();
            var k = this.paaVej.indexOf(fremme);
            if (k >= 0) this.paaVej.splice(k, 1);
            this.antal[fremme.rute]--;
        }
    };

    function indsaet(bane, bil) {
        var i = 0;
        while (i < bane.biler.length && bane.biler[i].p > bil.p) i++;
        bane.biler.splice(i, 0, bil);
    }

    /* Biler bag en langsommere bil, i koe eller foran en spaerring
       proever et nabospor. */
    NK.SimBro.prototype.skiftSpor = function (dt) {
        var skift = 0;
        var B = this.g.bilB;
        for (var n = 0; n < this.paaVej.length && skift < 4; n++) {
            var bil = this.paaVej[n];
            bil.skiftUr -= dt;
            var bane = bil.bane;
            if (bil.skiftUr > 0 || BROER[bane.bro].spor < 2 || bil.p > 0.96) continue;

            var idx = bane.biler.indexOf(bil);
            var egetGab = this.gabForan(bane, bil, idx);
            var spaerret = false;
            for (var s = 0; s < bane.blokke.length; s++) {
                var d = (bane.blokke[s].p - bil.p) * this.g.vejLaengde;
                if (d > 0 && d < B * 6) spaerret = true;
            }
            var hindret = bil.hindretTid > 0.8 && egetGab < B * 3;
            if (!spaerret && !hindret) continue;

            var tvunget = spaerret && bil.stopTid > 2;
            var bedst = null;
            var bedstGab = spaerret ? -Infinity : egetGab + B;
            for (var t = 0; t < this.baner.length; t++) {
                var nabo = this.baner[t];
                if (nabo.bro !== bane.bro || nabo.retning !== bane.retning ||
                    Math.abs(nabo.nr - bane.nr) !== 1 || nabo.blokke.length) continue;

                var foran = null;
                var bagved = null;
                for (var m = 0; m < nabo.biler.length; m++) {
                    if (nabo.biler[m].p > bil.p) foran = nabo.biler[m];
                    else { bagved = nabo.biler[m]; break; }
                }
                var gabF = foran ? this.bag(foran) - this.front(bil) : Infinity;
                var gabB = bagved ? this.bag(bil) - this.front(bagved) : Infinity;
                var kravB = (tvunget ? B * 0.3 : B * 0.8) + (bagved ? bagved.v * (tvunget ? 0.1 : 0.35) : 0);
                if (gabF < B * 0.4 || gabB < kravB) continue;
                if (gabF > bedstGab) {
                    bedst = nabo;
                    bedstGab = gabF;
                }
            }
            if (bedst) {
                bane.biler.splice(idx, 1);
                bil.bane = bedst;
                indsaet(bedst, bil);
                bil.skiftUr = 1.4;
                bil.hindretTid = 0;
                skift++;
            } else {
                bil.skiftUr = 0.3;
            }
        }
    };

    /* ----- Talebobler ---------------------------------------------- */
    NK.SimBro.prototype.opdaterBobler = function (dt) {
        var aktive = 0;
        var optaget = [];
        var i, bil;
        for (i = 0; i < this.paaVej.length; i++) {
            bil = this.paaVej[i];
            if (!bil.boble) continue;
            bil.bobleTid -= dt;
            if (bil.bobleTid <= 0) {
                bil.boble = null;
            } else {
                aktive++;
                optaget.push({ x: this.xFraP(bil.p, bil.retning), y: bil.visY });
            }
        }
        this.bobleUr -= dt;
        if (this.bobleUr > 0 || aktive >= 3 || !this.paaVej.length) return;

        var nat = faseVed(this.klokke) === "Nat";
        var valgt = null;
        var tekst = "";
        var bud = { gammel: null, koe: null, storm: null, langsom: null, fri: null };
        var start = (Math.random() * this.paaVej.length) | 0;
        for (var k = 0; k < this.paaVej.length; k++) {
            bil = this.paaVej[(start + k) % this.paaVej.length];
            if (bil.boble || bil.p < 0.12 || bil.p > 0.85) continue;
            var bx = this.xFraP(bil.p, bil.retning);
            var fri = true;
            for (var o = 0; o < optaget.length; o++) {
                if (Math.abs(optaget[o].x - bx) < 180 && Math.abs(optaget[o].y - bil.visY) < 70) fri = false;
            }
            if (!fri) continue;
            if (bil.grund === "fuld" && bil.bane.bro === GAMMEL && !bud.gammel) bud.gammel = bil;
            if (bil.stopTid > 1.2 && !bud.koe) bud.koe = bil;
            if (this.storm && bil.bane.bro === NY && this.paaBroen(bil.p) && !bud.storm) bud.storm = bil;
            if (bil.lang && !bil.koe && !bud.langsom) bud.langsom = bil;
            if (bil.bane.bro === NY && !bil.koe && !bil.lang && !bud.fri) bud.fri = bil;
        }
        if (bud.gammel) { valgt = bud.gammel; tekst = vilkaarlig(BOBLE_GAMMEL); }
        else if (bud.koe) { valgt = bud.koe; tekst = vilkaarlig(BOBLE_KOE); }
        else if (bud.storm) { valgt = bud.storm; tekst = vilkaarlig(BOBLE_STORM); }
        else if (bud.fri && nat) { valgt = bud.fri; tekst = vilkaarlig(BOBLE_NAT); }
        else if (bud.langsom && Math.random() < 0.3) { valgt = bud.langsom; tekst = vilkaarlig(BOBLE_LANGSOM); }
        else if (bud.fri && Math.random() < 0.4) { valgt = bud.fri; tekst = vilkaarlig(BOBLE_FRI); }

        if (valgt) {
            valgt.boble = tekst;
            valgt.bobleTid = 2.6;
            valgt.grund = "";
        }
        this.bobleUr = 1.3 + Math.random() * 1.3;
    };

    /* ----- Vejvalg -------------------------------------------------- */
    /* Andel af bilisterne i en retning, der vaelger den nye bro. */
    NK.SimBro.prototype.valgNy = function (retning) {
        var d = this.rejsetid[rute(GAMMEL, retning)] - this.rejsetid[rute(NY, retning)] + VANE;
        return (1 - LOKAL) / (1 + Math.exp(-d / SPREDNING));
    };

    NK.SimBro.prototype.skoenRejsetider = function (dt) {
        var tau = 6;
        var henfald = Math.exp(-dt / tau);
        for (var bro = 0; bro < 2; bro++) {
            var fri = this.friTid(bro);
            for (var r = -1; r <= 1; r += 2) {
                var i = rute(bro, r);
                this.indSum[i] *= henfald;
                var q = Math.max(this.indSum[i] / tau, 0.12);
                var skoen = Math.max(fri, (this.antal[i] + this.koe[i]) / q);
                this.rejsetid[i] = this.rejsetidKlar ? NK.mod(this.rejsetid[i], skoen, 0.6, dt) : skoen;
            }
        }
        this.rejsetidKlar = true;
    };

    /* Samlet rejsetid for en bro: gennemsnit af de to retninger. */
    NK.SimBro.prototype.tidFor = function (bro) {
        return (this.rejsetid[rute(bro, 1)] + this.rejsetid[rute(bro, -1)]) / 2;
    };

    NK.SimBro.prototype.koeIalt = function () {
        return this.koe[0] + this.koe[1] + this.koe[2] + this.koe[3];
    };

    NK.SimBro.prototype.trafik = function () {
        return trafikVed(this.klokke);
    };

    /* --------------------------------------------------------------- */
    NK.SimBro.prototype.opdater = function (dt) {
        var i, r, bro;
        this.sek += dt;
        if (!this.urStop) this.saetKlokke(this.klokke + dt / TIME_SEK);

        if (this.ulykke) {
            this.ulykke.tid -= dt;
            if (this.ulykke.tid <= 0) {
                fjernBlok(this.ulykke.bane, "ulykke");
                this.ulykke = null;
                this.opdaterKnapper();
            }
        }

        this.skoenRejsetider(dt);

        /* --- nye bilister vaelger bro ------------------------------- */
        var trafik = trafikVed(this.klokke);
        for (var d = 0; d < 2; d++) {
            r = d === 0 ? 1 : -1;
            this.rest[d] += trafik * dt;
            var pNy = this.valgNy(r);
            while (this.rest[d] >= 1) {
                this.rest[d] -= 1;
                bro = Math.random() < pNy ? NY : GAMMEL;
                this.koe[rute(bro, r)]++;
                if (bro === GAMMEL && pNy < 0.75) this.sidsteFuld = true;
            }
        }

        /* --- indkoersel fra koeen ----------------------------------- */
        for (bro = 0; bro < 2; bro++) {
            for (r = -1; r <= 1; r += 2) {
                var ri = rute(bro, r);
                /* Der skal vaere plads til at koere ud med naesten fuld fart */
                var vInd = this.g.fartEnhed * this.kmtLand(bro) / FULD_KMT * 0.9;
                var kravGab = MIN_GAB + vInd * TIDSLUGE * 0.7;
                while (this.koe[ri] > 0 && this.paaVej.length < MAKS_BILER) {
                    var valg = this.bedsteSpor(bro, r);
                    if (!valg.bane || valg.gab < kravGab) break;
                    this.koe[ri]--;
                    var grund = bro === GAMMEL && this.valgNy(r) < 0.75 ? "fuld" : "";
                    this.sendBil(valg.bane, grund, valg.gab);
                }
            }
        }

        /* --- biler undervejs ---------------------------------------- */
        if (dt > 0) {
            for (i = 0; i < this.baner.length; i++) this.koerSpor(this.baner[i], dt);
            this.skiftSpor(dt);
            for (i = 0; i < this.paaVej.length; i++) {
                var bil = this.paaVej[i];
                bil.visY = NK.mod(bil.visY, bil.bane.y + bil.forskyd * this.g.bilH, 3.5, dt);
            }
            this.opdaterBobler(dt);
        }

        /* --- panelet ------------------------------------------------ */
        var maalAndel = (this.valgNy(1) + this.valgNy(-1)) / 2;
        this.andelNy = NK.mod(this.andelNy, maalAndel, 0.5, dt);
        var tNy = this.tidFor(NY);
        var tGl = this.tidFor(GAMMEL);

        NK.saetMaaler("bro-andel-ny-fyld", "bro-andel-ny", this.andelNy * 100, 100, 0, "%");
        NK.saetMaaler("bro-andel-gl-fyld", "bro-andel-gl", (1 - this.andelNy) * 100, 100, 0, "%");
        NK.saetTekst("bro-tid-ny", NK.tal(tNy) + " min");
        NK.saetTekst("bro-tid-gl", NK.tal(tGl) + " min");
        NK.saetTekst("bro-koe", NK.tal(this.koeIalt()));
        NK.saetTekst("bro-klokke", klokketekst(this.klokke));
        NK.saetTekst("bro-fase", faseVed(this.klokke));

        var begge = (1 - this.andelNy) > LOKAL + 0.12;
        var lige = Math.abs(tNy - tGl) <= Math.max(1.2, 0.1 * tGl);
        var badge = NK.el("bro-badge");
        if (badge) badge.classList.toggle("aktiv", begge && lige);

        this.grafUr += dt;
        if (this.grafUr >= 0.25) {
            this.grafUr = 0;
            this.graf.tilfoej([this.andelNy * 100, (1 - this.andelNy) * 100, tNy, tGl]);
        }
    };

    /* =============================================================== */
    /* TEGNING                                                          */
    /* =============================================================== */
    var FONT = "'Segoe UI', sans-serif";

    function tegnMaerkat(ctx, tekst, x, y, bund, kant, farve) {
        ctx.save();
        ctx.font = "800 11px " + FONT;
        var b = ctx.measureText(tekst).width + 12;
        NK.rundtRekt(ctx, x - b / 2, y - 9, b, 18, 5);
        ctx.fillStyle = bund;
        ctx.fill();
        ctx.strokeStyle = kant;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = farve;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 0.5);
        ctx.restore();
    }

    function tegnKoeMaerkat(ctx, tekst, x, y) {
        tegnMaerkat(ctx, tekst, x, y, "#e05446", "#ffd9d4", "#ffffff");
    }

    function tegnBoble(ctx, tekst, x, y) {
        ctx.save();
        ctx.font = "600 12px " + FONT;
        var b = ctx.measureText(tekst).width + 14;
        var h = 21;
        var bx = NK.klamp(x - b / 2, 4, ctx.canvas.clientWidth - b - 4);
        var by = y - h - 8;
        ctx.fillStyle = "rgba(250, 250, 246, 0.96)";
        ctx.strokeStyle = "rgba(20, 22, 30, 0.55)";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, bx, by, b, h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 5, by + h - 0.5);
        ctx.lineTo(x, by + h + 7);
        ctx.lineTo(x + 5, by + h - 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#1d2230";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, bx + b / 2, by + h / 2 + 0.5);
        ctx.restore();
    }

    function tegnSkilt(ctx, x, y, kmt, advarsel) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = advarsel ? "#f2c53d" : "#d23a2c";
        ctx.stroke();
        ctx.fillStyle = "#111111";
        ctx.font = "800 " + (kmt >= 100 ? 9 : 10) + "px " + FONT;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(kmt), x, y + 0.5);
        ctx.restore();
    }

    /* Vej fra kant til kant: asfalt, midterrabat og striber. */
    NK.SimBro.prototype.tegnVej = function (ctx, bro, y, tyk) {
        var g = this.g;
        var b = this.l.b;
        var top = y - tyk / 2;
        var spor = BROER[bro].spor;
        var halv = (tyk - g.midte) / 2;
        var r, x;

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, top + 4, b, tyk);
        ctx.fillStyle = "#4a525c";
        ctx.fillRect(0, top, b, tyk);
        ctx.fillStyle = "#98a3ad";
        ctx.fillRect(0, top - 2, b, 2.5);
        ctx.fillRect(0, top + tyk - 0.5, b, 2.5);

        ctx.fillStyle = bro === NY ? "#c9d1d8" : "#e8d27a";
        ctx.fillRect(0, top + halv + 0.5, b, g.midte - 1);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([10, 9]);
        for (r = 1; r < spor; r++) {
            var y1 = top + r * (halv / spor);
            var y2 = top + halv + g.midte + r * (halv / spor);
            ctx.beginPath();
            ctx.moveTo(0, y1); ctx.lineTo(b, y1);
            ctx.moveTo(0, y2); ctx.lineTo(b, y2);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, top + 2.5); ctx.lineTo(b, top + 2.5);
        ctx.moveTo(0, top + tyk - 2.5); ctx.lineTo(b, top + tyk - 2.5);
        ctx.stroke();

        ctx.fillStyle = "#6c7884";
        for (x = g.xVand0; x < g.xVand1; x += 16) {
            ctx.fillRect(x, top - 4, 2, 3);
            ctx.fillRect(x, top + tyk + 1, 2, 3);
        }
    };

    /* Den nye bro: haengebro med to hoeje pyloner. */
    NK.SimBro.prototype.tegnHaengebro = function (ctx) {
        var g = this.g;
        var spaend = g.xVand1 - g.xVand0;
        var top = g.yNy - g.tykNy / 2;
        var px1 = g.xVand0 + spaend * 0.24;
        var px2 = g.xVand0 + spaend * 0.76;
        var pylonTop = top - g.tykNy * 0.8;
        var bred = Math.max(6, g.tykNy * 0.08);

        ctx.fillStyle = "#9aa6b0";
        ctx.fillRect(px1 - bred / 2, pylonTop, bred, g.tykNy * 1.8);
        ctx.fillRect(px2 - bred / 2, pylonTop, bred, g.tykNy * 1.8);

        var ky = top - g.tykNy * 0.05;
        ctx.strokeStyle = "rgba(200, 210, 218, 0.7)";
        ctx.lineWidth = 1;
        for (var t = 0.05; t < 1; t += 0.05) {
            var u = 1 - t;
            var kx = u * u * px1 + 2 * u * t * (px1 + px2) / 2 + t * t * px2;
            var kyy = u * u * pylonTop + 2 * u * t * ky + t * t * pylonTop;
            ctx.beginPath();
            ctx.moveTo(kx, kyy);
            ctx.lineTo(kx, top);
            ctx.stroke();
        }

        ctx.strokeStyle = "#cfd8df";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(g.xVand0 - 6, top);
        ctx.lineTo(px1, pylonTop);
        ctx.quadraticCurveTo((px1 + px2) / 2, ky, px2, pylonTop);
        ctx.lineTo(g.xVand1 + 6, top);
        ctx.stroke();
    };

    /* Den gamle bro: gitterbro med buede overdragere. */
    NK.SimBro.prototype.tegnGitterbro = function (ctx) {
        var g = this.g;
        var top = g.yGl - g.tykGl / 2;
        var buer = 5;
        var spaend = (g.xVand1 - g.xVand0 + 24) / buer;
        var hoej = g.tykGl * 0.75;
        var i, j;

        ctx.strokeStyle = "#8c9ba7";
        ctx.lineWidth = 1.4;
        for (i = 0; i < buer; i++) {
            var a = g.xVand0 - 12 + i * spaend;
            ctx.beginPath();
            ctx.moveTo(a, top);
            ctx.quadraticCurveTo(a + spaend / 2, top - hoej * 1.6, a + spaend, top);
            ctx.stroke();
            for (j = 1; j < 6; j++) {
                var fx = a + spaend * j / 6;
                var tt = j / 6;
                var by = top - hoej * 1.6 * 2 * tt * (1 - tt);
                ctx.beginPath();
                ctx.moveTo(fx, top);
                ctx.lineTo(fx, by);
                ctx.lineTo(a + spaend * (j + 1) / 6, top);
                ctx.stroke();
            }
        }
        ctx.fillStyle = "#7b858e";
        for (i = 0; i <= buer; i++) {
            ctx.fillRect(g.xVand0 - 12 + i * spaend - 4, top + g.tykGl - 2, 8, 10);
        }
    };

    NK.SimBro.prototype.tegnVand = function (ctx) {
        var g = this.g;
        var h = this.l.h;
        var vand = ctx.createLinearGradient(0, 0, 0, h);
        vand.addColorStop(0, this.storm ? "#1b4563" : "#1f5f8f");
        vand.addColorStop(1, this.storm ? "#10324b" : "#15476c");
        ctx.fillStyle = vand;
        ctx.fillRect(g.xVand0, 0, g.xVand1 - g.xVand0, h);

        var bredde = g.xVand1 - g.xVand0;
        var antal = this.storm ? 30 : 14;
        var fart = this.storm ? 46 : 12;
        ctx.strokeStyle = this.storm ? "rgba(255, 255, 255, 0.28)" : "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = this.storm ? 1.8 : 1.4;
        for (var i = 0; i < antal; i++) {
            var by = (i / antal) * h + Math.sin(this.sek * 0.9 + i) * (this.storm ? 6 : 3);
            var bx = g.xVand0 + ((this.sek * fart + i * 57) % Math.max(1, bredde - 40));
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.quadraticCurveTo(bx + 14, by - (this.storm ? 6 : 3), bx + 30, by);
            ctx.stroke();
        }
    };

    /* Land med huse og graner. */
    NK.SimBro.prototype.tegnLand = function (ctx, x0, x1, h, froeTal) {
        var g = this.g;
        var gr = ctx.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, "#4d8f57");
        gr.addColorStop(1, "#3f7a4a");
        ctx.fillStyle = gr;
        ctx.fillRect(x0, 0, x1 - x0, h);

        var r = NK.froe(froeTal);
        var antal = Math.max(3, Math.floor((x1 - x0) / 54));
        var i;
        for (i = 0; i < antal; i++) {
            var hx = x0 + 22 + (i + r() * 0.5) * ((x1 - x0 - 40) / antal);
            NK.Sprites.tegnStaaende(ctx, r() > 0.5 ? "husRoed" : "husGul", hx, h * (0.13 + r() * 0.03), 26, 1, "#c0392b");
        }
        /* Graner i rabatten mellem vejene */
        var yTop = g.yNy + g.tykNy / 2 + 26;
        var yBund = g.yGl - g.tykGl / 2 - 8;
        for (i = 0; i < antal + 2; i++) {
            var tx = x0 + 14 + r() * (x1 - x0 - 28);
            var ty = yTop + r() * (yBund - yTop);
            NK.Sprites.tegnStaaende(ctx, "gran", tx, ty, 16 + r() * 8, 0.9, "#2f6b3a");
        }
        for (i = 0; i < antal; i++) {
            NK.Sprites.tegnStaaende(ctx, r() > 0.5 ? "husRoed" : "husGul",
                x0 + 20 + r() * (x1 - x0 - 40), g.yGl + g.tykGl / 2 + 34 + r() * 20, 24, 1, "#c0392b");
        }
    };

    /* Roede baand under strækninger, hvor bilerne holder i koe. */
    NK.SimBro.prototype.tegnKoeZoner = function (ctx) {
        var g = this.g;
        var maerkater = [];
        for (var bro = 0; bro < 2; bro++) {
            for (var r = -1; r <= 1; r += 2) {
                var xs = [];
                for (var i = 0; i < this.paaVej.length; i++) {
                    var bil = this.paaVej[i];
                    if (bil.bane.bro === bro && bil.retning === r && bil.stopTid > 0.3) {
                        xs.push(this.xFraP(bil.p, r));
                    }
                }
                if (xs.length < 3) continue;
                xs.sort(function (a, b2) { return a - b2; });
                var y = bro === NY ? g.yNy : g.yGl;
                var tyk = bro === NY ? g.tykNy : g.tykGl;
                var halv = (tyk - g.midte) / 2;
                var yTop = r < 0 ? y - tyk / 2 : y + g.midte / 2;
                var start = 0;
                for (var k = 1; k <= xs.length; k++) {
                    if (k === xs.length || xs[k] - xs[k - 1] > g.bilB * 2.2) {
                        if (k - start >= 3) {
                            var a = xs[start] - g.bilB * 0.7;
                            var e = xs[k - 1] + g.bilB * 0.7;
                            ctx.fillStyle = "rgba(224, 84, 70, 0.32)";
                            ctx.fillRect(a, yTop, e - a, halv);
                            maerkater.push({
                                x: NK.klamp((a + e) / 2, 24, this.l.b - 24),
                                y: r < 0 ? y - tyk / 2 - 12 : y + tyk / 2 + 12
                            });
                        }
                        start = k;
                    }
                }
            }
        }
        return maerkater;
    };

    NK.SimBro.prototype.tegnBil = function (ctx, bil) {
        var g = this.g;
        var x = this.xFraP(bil.p, bil.retning);
        var y = bil.visY;
        var maalY = bil.bane.y + bil.forskyd * g.bilH;
        var haeld = NK.klamp((maalY - y) * 0.04, -0.3, 0.3);
        var r = bil.retning;
        var vinkel = (r > 0 ? 0 : Math.PI) + r * haeld;

        if (bil.lang) {
            var cx = x - r * g.bilB * 0.95;
            ctx.fillStyle = "#3a3f46";
            ctx.fillRect(Math.min(x, cx) + g.bilB * 0.2, y - 1, g.bilB * 0.5, 2);
            ctx.fillStyle = "#ece6d6";
            NK.rundtRekt(ctx, cx - g.bilB * 0.4, y - g.bilH * 0.5, g.bilB * 0.8, g.bilH, 3);
            ctx.fill();
            ctx.fillStyle = "#c98b3a";
            ctx.fillRect(cx - g.bilB * 0.4, y - 1.5, g.bilB * 0.8, 3);
        }

        NK.Sprites.tegn(ctx, bil.sprite, x, y, g.bilB, vinkel, 1, "#dfe7ee");

        if (bil.koe) {
            var bagX = x - r * (bil.lang ? g.bilB * 1.36 : g.bilB * 0.5);
            ctx.fillStyle = "rgba(255, 60, 40, 0.95)";
            ctx.beginPath();
            ctx.arc(bagX, y - g.bilH * 0.32, 2.4, 0, Math.PI * 2);
            ctx.arc(bagX, y + g.bilH * 0.32, 2.4, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    /* Forlygter, naar det er moerkt. Tegnes oven paa moerket. */
    NK.SimBro.prototype.tegnLys = function (ctx, styrke) {
        var g = this.g;
        ctx.save();
        ctx.fillStyle = "rgba(255, 236, 160, " + (0.55 * styrke).toFixed(3) + ")";
        for (var i = 0; i < this.paaVej.length; i++) {
            var bil = this.paaVej[i];
            var r = bil.retning;
            var x = this.xFraP(bil.p, r) + r * g.bilB * 0.5;
            var y = bil.visY;
            ctx.beginPath();
            ctx.moveTo(x, y - g.bilH * 0.3);
            ctx.lineTo(x + r * g.bilB * 1.3, y - g.bilH * 0.75);
            ctx.lineTo(x + r * g.bilB * 1.3, y + g.bilH * 0.75);
            ctx.lineTo(x, y + g.bilH * 0.3);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    };

    NK.SimBro.prototype.tegnVejarbejde = function (ctx) {
        var g = this.g;
        for (var i = 0; i < this.baner.length; i++) {
            var bane = this.baner[i];
            if (bane.bro !== NY || bane.nr !== 0) continue;
            var a = this.xFraP(ARBEJDE_FRA, 1);
            var e = this.xFraP(ARBEJDE_TIL, 1);
            var hh = (g.tykNy - g.midte) / 2 / BROER[NY].spor;
            ctx.fillStyle = "rgba(242, 197, 61, 0.22)";
            ctx.fillRect(a, bane.y - hh / 2, e - a, hh);
            for (var x = a + 4; x < e; x += 13) {
                ctx.fillStyle = "#ff8a1f";
                ctx.beginPath();
                ctx.moveTo(x, bane.y - 5);
                ctx.lineTo(x + 4.5, bane.y + 5);
                ctx.lineTo(x - 4.5, bane.y + 5);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(x - 2, bane.y, 4, 1.6);
            }
            var bx = bane.retning > 0 ? a - 6 : e + 2;
            for (var s = 0; s < 4; s++) {
                ctx.fillStyle = s % 2 ? "#ffffff" : "#e0392b";
                ctx.fillRect(bx, bane.y - hh / 2 + s * hh / 4, 4, hh / 4);
            }
        }
    };

    NK.SimBro.prototype.tegnUlykke = function (ctx) {
        var u = this.ulykke;
        if (!u) return;
        var g = this.g;
        var x = this.xFraP(u.p, u.bane.retning);
        var y = u.bane.y;
        var blink = (Math.sin(this.sek * 9) + 1) / 2;

        ctx.save();
        ctx.globalAlpha = 0.25 + blink * 0.35;
        ctx.fillStyle = "#ff5a1f";
        ctx.beginPath();
        ctx.arc(x, y, g.bilB * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        NK.Sprites.tegn(ctx, "bilRoed", x - g.bilB * 0.25, y - 2, g.bilB, 0.5 + u.vinkel * 0.4, 1, "#e05446");
        NK.Sprites.tegn(ctx, "bilHvid", x + g.bilB * 0.35, y + 3, g.bilB, -2.4 + u.vinkel * 0.4, 1, "#dfe7ee");
    };

    NK.SimBro.prototype.tegnUlykkeMaerkat = function (ctx) {
        var u = this.ulykke;
        if (!u) return;
        var g = this.g;
        var x = this.xFraP(u.p, u.bane.retning);
        var top = u.bane.bro === NY ? g.yNy - g.tykNy / 2 : g.yGl - g.tykGl / 2;
        var bund = u.bane.bro === NY ? g.yNy + g.tykNy / 2 : g.yGl + g.tykGl / 2;
        var ty = u.bane.retning < 0 ? top - 34 : bund + 34;
        tegnMaerkat(ctx, "UHELD  " + Math.ceil(u.tid) + " s", x, ty, "#2a1512", "#ff8a6b", "#ffb39e");
    };

    NK.SimBro.prototype.tegnRegn = function (ctx) {
        var b = this.l.b;
        var h = this.l.h;
        ctx.fillStyle = "rgba(20, 30, 45, 0.18)";
        ctx.fillRect(0, 0, b, h);
        ctx.strokeStyle = "rgba(210, 225, 240, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        var r = NK.froe(5);
        for (var i = 0; i < 140; i++) {
            var x = (r() * b + this.sek * 260) % (b + 40) - 20;
            var y = (r() * h + this.sek * 520 * (0.8 + r() * 0.4)) % (h + 30) - 15;
            ctx.moveTo(x, y);
            ctx.lineTo(x - 7, y - 14);
        }
        ctx.stroke();
    };

    /* Rejsetidstavle paa land for trafikken i en retning. */
    NK.SimBro.prototype.tegnTavle = function (ctx, x, y, retning) {
        var tNy = Math.round(this.rejsetid[rute(NY, retning)]);
        var tGl = Math.round(this.rejsetid[rute(GAMMEL, retning)]);
        var bred = NK.klamp(this.g.xVand0 * 0.8, 116, 150);
        var hoej = 50;
        ctx.save();
        ctx.fillStyle = "#6f7a84";
        ctx.fillRect(x - bred / 2 + 8, y + hoej / 2, 3, 16);
        ctx.fillRect(x + bred / 2 - 11, y + hoej / 2, 3, 16);
        NK.rundtRekt(ctx, x - bred / 2, y - hoej / 2, bred, hoej, 5);
        ctx.fillStyle = "#0e1014";
        ctx.fill();
        ctx.strokeStyle = "#5b636c";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = "700 12px Consolas, 'Cascadia Mono', monospace";
        ctx.textBaseline = "middle";
        var linjer = [
            { pil: "↑", navn: BROER[NY].kort, tid: tNy, hurtig: tNy <= tGl },
            { pil: "↓", navn: BROER[GAMMEL].kort, tid: tGl, hurtig: tGl < tNy }
        ];
        for (var i = 0; i < 2; i++) {
            var ly = y - 11 + i * 22;
            ctx.fillStyle = linjer[i].hurtig ? "#7dffa0" : "#f5c04a";
            ctx.textAlign = "left";
            ctx.fillText(linjer[i].pil + " " + linjer[i].navn, x - bred / 2 + 9, ly);
            ctx.textAlign = "right";
            ctx.fillText(linjer[i].tid + " min", x + bred / 2 - 9, ly);
        }
        ctx.restore();
        NK.tekst(ctx, retning > 0 ? "MOD JYLLAND" : "MOD FYN", x, y - hoej / 2 - 7, {
            justering: "center", farve: "#e8f0e8", font: "700 10px " + FONT
        });
    };

    /* Uret midt paa vandet. */
    NK.SimBro.prototype.tegnUr = function (ctx, cx, cy) {
        var R = NK.klamp(this.l.h * 0.05, 22, 34);
        var fase = faseVed(this.klokke);
        ctx.save();
        ctx.font = "700 15px " + FONT;
        var tekstB = Math.max(ctx.measureText(fase).width, 60);
        var bred = R * 2 + 12 + tekstB;
        var x = cx - bred / 2 + R;

        ctx.beginPath();
        ctx.arc(x, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = "#f6f4ee";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#2c313a";
        ctx.stroke();
        ctx.strokeStyle = "#2c313a";
        for (var i = 0; i < 12; i++) {
            var v = i / 12 * Math.PI * 2;
            ctx.lineWidth = i % 3 === 0 ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(v) * R * 0.78, cy + Math.sin(v) * R * 0.78);
            ctx.lineTo(x + Math.cos(v) * R * 0.92, cy + Math.sin(v) * R * 0.92);
            ctx.stroke();
        }
        var timer = this.klokke % 12;
        var minut = (this.klokke % 1) * 60;
        var vT = timer / 12 * Math.PI * 2 - Math.PI / 2;
        var vM = minut / 60 * Math.PI * 2 - Math.PI / 2;
        ctx.lineCap = "round";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x + Math.cos(vT) * R * 0.5, cy + Math.sin(vT) * R * 0.5);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#d23a2c";
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x + Math.cos(vM) * R * 0.78, cy + Math.sin(vM) * R * 0.78);
        ctx.stroke();
        ctx.restore();

        var tx = x + R + 12;
        NK.tekst(ctx, klokketekst(this.klokke), tx, cy - 3, {
            farve: "#ffffff", font: "700 20px " + FONT
        });
        NK.tekst(ctx, fase + (this.urStop ? "  (uret står)" : ""), tx, cy + 16, {
            farve: "#f2c53d", font: "700 13px " + FONT
        });
    };

    /* Doegnkurven i panelet. */
    NK.SimBro.prototype.tegnDoegn = function () {
        var ctx = this.doegn.ctx;
        var b = this.doegn.b;
        var h = this.doegn.h;
        var bund = h - 13;
        var top = 4;
        var i;
        ctx.clearRect(0, 0, b, h);

        for (i = 0; i < FASER.length; i++) {
            ctx.fillStyle = FASER[i].farve;
            ctx.fillRect(FASER[i].fra / 24 * b, top, (FASER[i].til - FASER[i].fra) / 24 * b, bund - top);
        }

        ctx.beginPath();
        ctx.moveTo(0, bund);
        for (i = 0; i <= 96; i++) {
            var tt = i / 96 * 24;
            ctx.lineTo(tt / 24 * b, bund - trafikVed(tt) / MAKS_TRAFIK * (bund - top - 4));
        }
        ctx.lineTo(b, bund);
        ctx.closePath();
        ctx.fillStyle = "rgba(242, 197, 61, 0.35)";
        ctx.fill();
        ctx.strokeStyle = "#f2c53d";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = "9px 'Segoe UI', sans-serif";
        ctx.fillStyle = "#8d95a1";
        ctx.textBaseline = "alphabetic";
        for (i = 0; i <= 24; i += 6) {
            ctx.textAlign = i === 0 ? "left" : (i === 24 ? "right" : "center");
            ctx.fillText(String(i), i / 24 * b, h - 2);
        }

        var mx = this.klokke / 24 * b;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(mx - 1, top - 2, 2, bund - top + 2);
        ctx.beginPath();
        ctx.moveTo(mx - 5, top - 3);
        ctx.lineTo(mx + 5, top - 3);
        ctx.lineTo(mx, top + 4);
        ctx.closePath();
        ctx.fill();
    };

    NK.SimBro.prototype.tegn = function () {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var g = this.g;
        var i, r;

        ctx.clearRect(0, 0, b, h);

        this.tegnVand(ctx);
        this.tegnLand(ctx, 0, g.xVand0, h, 11);
        this.tegnLand(ctx, g.xVand1, b, h, 77);

        this.tegnGitterbro(ctx);
        this.tegnVej(ctx, GAMMEL, g.yGl, g.tykGl);
        this.tegnHaengebro(ctx);
        this.tegnVej(ctx, NY, g.yNy, g.tykNy);

        if (this.vejarbejde) this.tegnVejarbejde(ctx);
        var koeMaerkater = this.tegnKoeZoner(ctx);

        for (i = 0; i < this.paaVej.length; i++) this.tegnBil(ctx, this.paaVej[i]);
        this.tegnUlykke(ctx);

        /* --- doegnets lys ------------------------------------------- */
        var moerke = moerkeVed(this.klokke);
        if (moerke > 0.01) {
            ctx.fillStyle = "rgba(6, 10, 32, " + moerke.toFixed(3) + ")";
            ctx.fillRect(0, 0, b, h);
            this.tegnLys(ctx, moerke / MAKS_MOERKE);
        }
        if (this.storm) this.tegnRegn(ctx);

        /* --- koe ---------------------------------------------------- */
        for (i = 0; i < koeMaerkater.length; i++) {
            tegnKoeMaerkat(ctx, "KØ", koeMaerkater[i].x, koeMaerkater[i].y);
        }
        for (var bro = 0; bro < 2; bro++) {
            for (r = -1; r <= 1; r += 2) {
                var n = this.koe[rute(bro, r)];
                if (n < 2) continue;
                var y = bro === NY ? g.yNy : g.yGl;
                var tyk = bro === NY ? g.tykNy : g.tykGl;
                tegnKoeMaerkat(ctx, "+" + n + " i kø", r > 0 ? 38 : b - 38,
                    r < 0 ? y - tyk / 2 - 12 : y + tyk / 2 + 12);
            }
        }
        this.tegnUlykkeMaerkat(ctx);

        /* --- skilte, tavler og navne -------------------------------- */
        var kNy = this.kmtBro(NY);
        var kGl = this.kmtBro(GAMMEL);
        tegnSkilt(ctx, g.xVand0 - 22, g.yNy + g.tykNy / 2 + 17, kNy, kNy < 110);
        tegnSkilt(ctx, g.xVand1 + 22, g.yNy - g.tykNy / 2 - 17, kNy, kNy < 110);
        tegnSkilt(ctx, g.xVand0 - 22, g.yGl + g.tykGl / 2 + 17, kGl, false);
        tegnSkilt(ctx, g.xVand1 + 22, g.yGl - g.tykGl / 2 - 17, kGl, false);

        var yMidt = (g.yNy + g.tykNy / 2 + g.yGl - g.tykGl / 2 - g.tykGl * 1.2) / 2;
        this.tegnTavle(ctx, g.xVand0 * 0.5, yMidt + 10, 1);
        this.tegnTavle(ctx, b - g.xVand0 * 0.5, yMidt + 10, -1);

        var midtX = (g.xVand0 + g.xVand1) / 2;
        var pct = Math.round(this.andelNy * 100);
        NK.tekst(ctx, BROER[NY].navn + "  ·  " + pct + " %" +
            (this.storm ? "  ·  storm" : (this.vejarbejde ? "  ·  vejarbejde" : "")),
            midtX, g.yNy - g.tykNy * 1.3 - 8,
            { justering: "center", farve: "#dfe7ee", font: "600 12px " + FONT });
        NK.tekst(ctx, BROER[GAMMEL].navn + "  ·  " + (100 - pct) + " %",
            midtX, g.yGl + g.tykGl / 2 + 22,
            { justering: "center", farve: "#dfe7ee", font: "600 12px " + FONT });

        this.tegnUr(ctx, midtX, yMidt);

        NK.tekst(ctx, "FYN", g.xVand0 * 0.5, 30, { justering: "center", farve: "#ffffff", font: "700 20px " + FONT });
        NK.tekst(ctx, "Middelfart", g.xVand0 * 0.5, 48, { justering: "center", farve: "#d5e6d8", font: "13px " + FONT });
        NK.tekst(ctx, "JYLLAND", b - g.xVand0 * 0.5, 30, { justering: "center", farve: "#ffffff", font: "700 20px " + FONT });
        NK.tekst(ctx, "Fredericia", b - g.xVand0 * 0.5, 48, { justering: "center", farve: "#d5e6d8", font: "13px " + FONT });

        for (i = 0; i < this.paaVej.length; i++) {
            var bil = this.paaVej[i];
            if (bil.boble) tegnBoble(ctx, bil.boble, this.xFraP(bil.p, bil.retning), bil.visY - g.bilH * 0.55);
        }

        this.tegnDoegn();
        this.graf.tegn();
    };
}());
