/* =====================================================================
   sim_bro.js - Lillebaeltsbroerne som dynamisk ligevaegt

   Modellen er den samme foerste ordens kinetik som en kemisk ligevaegt:

       hastighed frem    = k_frem    * antal biler paa Fyn
       hastighed tilbage = k_tilbage * antal biler i Jylland

   Naar de to hastigheder er lige store, staar tallene stille, selvom
   bilerne stadig koerer. Saetter man dem lig hinanden, faas

       n(Jylland) / n(Fyn) = k_frem / k_tilbage = K

   Trafikken over broerne er en lille model oven paa kinetikken:
   - Begge broer har trafik begge veje. Den nye bro har tre spor i hver
     retning og hoejere fart, den gamle har et spor og lavere fart.
   - Bilerne vaelger den nye bro, indtil den er maettet.
   - Bilerne holder afstand til bilen foran og kan skifte spor, saa
     langsomme koeretoejer, vejarbejde og uheld giver synlig koe.
   - En afgang flytter bilen fra parkeringspladsen ud paa kystvejen. Er
     broerne fulde, holder den i koe dér. Biler i koe er undervejs ligesom
     biler paa broen og taeller ikke med i n(Fyn) eller n(Jylland). Derfor
     gaelder n(Jylland)/n(Fyn) = K ogsaa, naar broerne er maettede: koeen
     forsinker ligevaegten, men flytter den ikke.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var NY = 0;
    var GAMMEL = 1;

    /* spor = antal vejbaner i HVER retning */
    var BROER = [
        { navn: "Den nye Lillebæltsbro", spor: 3 },
        { navn: "Den gamle Lillebæltsbro", spor: 1 }
    ];

    var FULD_KMT = 110;       // fartfaktor 1
    var TRANSIT = 5.6;        // sekunder fra kyst til kyst ved 110 km/t
    var TIDSLUGE = 0.32;      // afstand til bilen foran, i sekunder
    var MIN_GAB = 5;          // mindste afstand mellem kofangere (px)
    var MAKS_BILER = 220;
    var LANGSOM_ANDEL = 0.16; // biler med campingvogn
    var ULYKKE_TID = 24;
    var START_FYN = 100;
    var START_JYL = 20;
    var TRIN = 30;            // biler pr. klik paa +/-
    var ARBEJDE_FRA = 0.39;   // vejarbejdet som broek af vejen fra Fyn
    var ARBEJDE_TIL = 0.61;
    var MAETTET = 0.6;        // taethed paa den nye bro, hvor bilerne viger

    var BILER_F = ["bilBlaa", "bilHvid", "bilRoed", "bilGroen"];
    var BILER_J = ["bilOrange", "bilHvid", "bilRoed", "bilGroen"];

    var BOBLE_KOE = ["Kø …", "Vi holder stille", "Kom nu!", "Puha"];
    var BOBLE_GAMMEL = ["Den nye er fuld", "Så tager vi den gamle"];
    var BOBLE_FRI = ["Fri bane", "Dejligt"];
    var BOBLE_LANGSOM = ["Jeg har tid", "Rolig nu"];
    var BOBLE_STORM = ["Sikke en blæst", "Hold godt fast"];

    function vilkaarlig(liste) {
        return liste[(Math.random() * liste.length) | 0];
    }

    NK.SimBro = function () {
        this.l = new NK.Laerred(NK.el("bro-laerred"));

        this.graf = new NK.Graf(NK.el("bro-graf"), [
            { navn: "Fyn", farve: "#3d9ee0", gruppe: "antal" },
            { navn: "Jylland", farve: "#e6892a", gruppe: "antal" },
            { navn: "v frem", farve: "#3d9ee0", gruppe: "fart" },
            { navn: "v tilbage", farve: "#e6892a", gruppe: "fart" }
        ], {
            enheder: { antal: "biler", fart: "biler/s" },
            minTop: { fart: 2 }
        });

        this.kFrem = 0.06;
        this.kTilbage = 0.02;

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
        this.tid = 0;
        this.grafUr = 0;
        this.rest = { frem: 0, tilbage: 0 };
        this.vVist = { frem: 0, tilbage: 0 };
        this.paaVej = [];

        this.nulstil();
        this.koblKnapper();
        this.geometri();
    };

    NK.SimBro.prototype.nulstil = function () {
        this.nFyn = START_FYN;
        this.nJyl = START_JYL;
        this.koeF = 0;
        this.koeJ = 0;
        this.paaVej.length = 0;
        for (var i = 0; i < this.baner.length; i++) {
            this.baner[i].biler.length = 0;
            this.baner[i].blokke.length = 0;
        }
        this.rest.frem = 0;
        this.rest.tilbage = 0;
        this.vVist.frem = 0;
        this.vVist.tilbage = 0;
        this.vejarbejde = false;
        this.storm = false;
        this.ulykke = null;
        this.bobleUr = 1.5;
        this.maettetTid = 0;
        this.graf.nulstil();
        this.opdaterKnapper();
    };

    NK.SimBro.prototype.koblKnapper = function () {
        var mig = this;

        NK.el("bro-tilfoej-fyn").addEventListener("click", function () { mig.nFyn += TRIN; });
        NK.el("bro-tilfoej-jyl").addEventListener("click", function () { mig.nJyl += TRIN; });
        NK.el("bro-fjern-fyn").addEventListener("click", function () { mig.nFyn = Math.max(0, mig.nFyn - TRIN); });
        NK.el("bro-fjern-jyl").addEventListener("click", function () { mig.nJyl = Math.max(0, mig.nJyl - TRIN); });
        NK.el("bro-nulstil").addEventListener("click", function () { mig.nulstil(); });

        NK.el("bro-vejarbejde").addEventListener("click", function () { mig.saetVejarbejde(!mig.vejarbejde); });
        NK.el("bro-storm").addEventListener("click", function () { mig.saetStorm(!mig.storm); });
        NK.el("bro-ulykke").addEventListener("click", function () { mig.startUlykke(); });

        function skyder(id, saet) {
            var s = NK.el(id);
            s.addEventListener("input", function () { saet(parseFloat(s.value)); });
            saet(parseFloat(s.value));
        }
        skyder("bro-kfrem", function (v) { mig.kFrem = v; });
        skyder("bro-ktilbage", function (v) { mig.kTilbage = v; });

        NK.grafSkift("bro", this.graf);
    };

    NK.SimBro.prototype.opdaterKnapper = function () {
        var v = NK.el("bro-vejarbejde");
        var s = NK.el("bro-storm");
        var u = NK.el("bro-ulykke");
        if (v) v.classList.toggle("slaaet-til", !!this.vejarbejde);
        if (s) s.classList.toggle("slaaet-til", !!this.storm);
        if (u) u.classList.toggle("slaaet-til", !!this.ulykke);
    };

    NK.SimBro.prototype.tilpas = function () {
        if (this.l.tilpas()) this.geometri();
        this.graf.tilpas();
    };

    /* --------------------------------------------------------------- */
    /* Alle maal udregnes fra laerredets stoerrelse. Bilernes placering
       gemmes som broek af vejen, saa de bliver paa vejen ved et
       vinduesskift.                                                     */
    NK.SimBro.prototype.geometri = function () {
        var b = this.l.b;
        var h = this.l.h;
        var g = this.g;
        var i;

        g.xPark0F = b * 0.02;
        g.xPark1F = b * 0.19;
        g.xVejF = b * 0.225;
        g.xVand0 = b * 0.30;
        g.xVand1 = b * 0.70;
        g.xVejJ = b * 0.775;
        g.xPark0J = b * 0.81;
        g.xPark1J = b * 0.98;

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
        g.vejLaengde = Math.max(1, g.xVejJ - g.xVejF);
        g.fartEnhed = g.vejLaengde / TRANSIT;

        for (i = 0; i < this.paaVej.length; i++) {
            var bil = this.paaVej[i];
            bil.visY = bil.bane.y + bil.forskyd * g.bilH;
        }
    };

    /* p er bilens fremdrift langs vejen (0 = startkysten, 1 = fremme).
       x paa laerredet afhaenger af retningen. */
    NK.SimBro.prototype.xFraP = function (p, retning) {
        return this.g.xVejF + (retning > 0 ? p : 1 - p) * this.g.vejLaengde;
    };

    /* ----- Forstyrrelser ------------------------------------------- */
    NK.SimBro.prototype.kmt = function (bro) {
        if (bro === NY) return this.vejarbejde ? 80 : 110;
        return this.storm ? 40 : 70;
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

    /* Et uheld spaerrer et tilfaeldigt spor et stykke tid. */
    NK.SimBro.prototype.startUlykke = function () {
        if (this.ulykke) return;
        /* Den nye bro har flest spor og faar derfor oftest uheldet */
        var kandidater = [];
        for (var i = 0; i < this.baner.length; i++) {
            if (this.baner[i].blokke.length === 0) kandidater.push(this.baner[i]);
        }
        if (!kandidater.length) return;
        var bane = kandidater[(Math.random() * kandidater.length) | 0];
        var p = 0.36 + Math.random() * 0.26;
        bane.blokke.push({ type: "ulykke", p: p });
        this.ulykke = { bane: bane, p: p, tid: ULYKKE_TID, vinkel: Math.random() };
        this.bobleUr = 0;
        this.opdaterKnapper();
    };

    /* ----- Bilernes udstraekning ------------------------------------ */
    NK.SimBro.prototype.front = function (bil) {
        return bil.p * this.g.vejLaengde + this.g.bilB * 0.5;
    };

    NK.SimBro.prototype.bag = function (bil) {
        return bil.p * this.g.vejLaengde - this.g.bilB * (bil.lang ? 1.35 : 0.5);
    };

    /* Afstand fra bilens front til den naermeste forhindring foran den i
       banen (bil eller spaerring). Infinity hvis vejen er fri. */
    NK.SimBro.prototype.gabForan = function (bane, bil, index) {
        var gab = Infinity;
        if (index > 0) gab = this.bag(bane.biler[index - 1]) - this.front(bil);
        for (var i = 0; i < bane.blokke.length; i++) {
            var bp = bane.blokke[i].p * this.g.vejLaengde;
            if (bp > bil.p * this.g.vejLaengde) gab = Math.min(gab, bp - this.front(bil));
        }
        return gab;
    };

    /* ----- Valg af bro og spor -------------------------------------- */
    NK.SimBro.prototype.taethed = function (bro, retning) {
        var biler = 0;
        var spor = 0;
        for (var i = 0; i < this.baner.length; i++) {
            var b = this.baner[i];
            if (b.bro !== bro || b.retning !== retning) continue;
            biler += b.biler.length;
            if (b.blokke.length === 0) spor++;
        }
        var plads = this.g.vejLaengde / (this.g.bilB * 2.4);
        return spor === 0 ? Infinity : biler / (spor * plads);
    };

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

    /* Den nye bro vaelges, indtil den er maettet. Saa den gamle. Er
       begge fulde ved tilkoerslen, maa bilen vente. */
    NK.SimBro.prototype.vaelgSpor = function (retning) {
        var krav = this.g.bilB * 0.7;
        var ny = this.bedsteSpor(NY, retning);
        var gl = this.bedsteSpor(GAMMEL, retning);
        var nyFri = ny.bane && ny.gab >= krav;
        if (nyFri && this.taethed(NY, retning) < MAETTET) return { bane: ny.bane, grund: "fri" };
        if (gl.bane && gl.gab >= krav) return { bane: gl.bane, grund: "fuld" };
        if (nyFri) return { bane: ny.bane, grund: "fri" };
        return null;
    };

    NK.SimBro.prototype.sendBil = function (retning, valg) {
        var lang = Math.random() < LANGSOM_ANDEL;
        var bil = {
            retning: retning,
            bane: valg.bane,
            grund: valg.grund,
            p: 0,
            v: 0,
            lang: lang,
            egen: lang ? 0.5 + Math.random() * 0.1 : 0.9 + Math.random() * 0.2,
            sprite: (retning > 0 ? BILER_F : BILER_J)[(Math.random() * 4) | 0],
            forskyd: (Math.random() - 0.5) * 0.14,
            visY: valg.bane.y,
            skiftUr: 0.8,
            stopTid: 0,
            koe: false,
            boble: null,
            bobleTid: 0
        };
        bil.visY = valg.bane.y + bil.forskyd * this.g.bilH;
        bil.v = this.oenskFart(bil) * 0.7;
        valg.bane.biler.push(bil);
        this.paaVej.push(bil);
    };

    NK.SimBro.prototype.oenskFart = function (bil) {
        return this.g.fartEnhed * (this.kmt(bil.bane.bro) / FULD_KMT) * bil.egen;
    };

    /* ----- Koersel i et spor ---------------------------------------- */
    NK.SimBro.prototype.koerSpor = function (bane, dt) {
        var L = this.g.vejLaengde;
        var biler = bane.biler;
        for (var i = 0; i < biler.length; i++) {
            var bil = biler[i];
            var oensk = this.oenskFart(bil);
            var maal = oensk;
            var gab = this.gabForan(bane, bil, i);
            if (gab < Infinity) maal = Math.min(maal, Math.max(0, gab - MIN_GAB) / TIDSLUGE);

            /* Bremser hurtigt, accelererer roligt */
            bil.v = NK.mod(bil.v, maal, maal < bil.v ? 8 : 1.8, dt);
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
        }

        /* Ankomst */
        while (biler.length && biler[0].p >= 1) {
            var fremme = biler.shift();
            var k = this.paaVej.indexOf(fremme);
            if (k >= 0) this.paaVej.splice(k, 1);
            if (fremme.retning > 0) this.nJyl++; else this.nFyn++;
        }
    };

    function indsaet(bane, bil) {
        var i = 0;
        while (i < bane.biler.length && bane.biler[i].p > bil.p) i++;
        bane.biler.splice(i, 0, bil);
    }

    /* Biler i koe eller foran en spaerring proever et nabospor. */
    NK.SimBro.prototype.skiftSpor = function (dt) {
        var skift = 0;
        var B = this.g.bilB;
        for (var n = 0; n < this.paaVej.length && skift < 3; n++) {
            var bil = this.paaVej[n];
            bil.skiftUr -= dt;
            var bane = bil.bane;
            if (bil.skiftUr > 0 || BROER[bane.bro].spor < 2 || bil.p > 0.95) continue;

            var idx = bane.biler.indexOf(bil);
            var egetGab = this.gabForan(bane, bil, idx);
            var spaerret = false;
            for (var s = 0; s < bane.blokke.length; s++) {
                var d = (bane.blokke[s].p - bil.p) * this.g.vejLaengde;
                if (d > 0 && d < B * 6) spaerret = true;
            }
            if (!spaerret && !(bil.stopTid > 0.7 && egetGab < B * 2.5)) continue;

            var tvunget = spaerret && bil.stopTid > 2;
            var bedst = null;
            var bedstGab = spaerret ? -Infinity : egetGab + B;
            for (var t = 0; t < this.baner.length; t++) {
                var nabo = this.baner[t];
                if (nabo.bro !== bane.bro || nabo.retning !== bane.retning ||
                    Math.abs(nabo.nr - bane.nr) !== 1 || nabo.blokke.length) continue;

                /* Find bilen foran og bagved i nabosporet */
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
                skift++;
            } else {
                bil.skiftUr = 0.25;
            }
        }
    };

    /* ----- Talebobler ---------------------------------------------- */
    NK.SimBro.prototype.opdaterBobler = function (dt) {
        var aktive = 0;
        var i, bil;
        for (i = 0; i < this.paaVej.length; i++) {
            bil = this.paaVej[i];
            if (!bil.boble) continue;
            bil.bobleTid -= dt;
            if (bil.bobleTid <= 0) bil.boble = null; else aktive++;
        }
        this.bobleUr -= dt;
        if (this.bobleUr > 0 || aktive >= 3 || !this.paaVej.length) return;

        var valgt = null;
        var tekst = "";
        var start = (Math.random() * this.paaVej.length) | 0;
        var stormBud = null;
        var koeBud = null;
        var langsomBud = null;
        var friBud = null;
        for (var k = 0; k < this.paaVej.length; k++) {
            bil = this.paaVej[(start + k) % this.paaVej.length];
            if (bil.boble || bil.p < 0.12 || bil.p > 0.85) continue;
            if (bil.grund === "fuld" && bil.p < 0.35 && !valgt) { valgt = bil; tekst = vilkaarlig(BOBLE_GAMMEL); }
            if (this.storm && bil.bane.bro === GAMMEL && !stormBud) stormBud = bil;
            if (bil.stopTid > 1.2 && !koeBud) koeBud = bil;
            if (bil.lang && !bil.koe && !langsomBud) langsomBud = bil;
            if (bil.bane.bro === NY && !bil.koe && !bil.lang && !friBud) friBud = bil;
        }
        if (!valgt && koeBud) { valgt = koeBud; tekst = vilkaarlig(BOBLE_KOE); }
        if (!valgt && stormBud) { valgt = stormBud; tekst = vilkaarlig(BOBLE_STORM); }
        if (!valgt && langsomBud && Math.random() < 0.3) { valgt = langsomBud; tekst = vilkaarlig(BOBLE_LANGSOM); }
        if (!valgt && friBud && Math.random() < 0.4) { valgt = friBud; tekst = vilkaarlig(BOBLE_FRI); }

        if (valgt) {
            valgt.boble = tekst;
            valgt.bobleTid = 2.6;
            valgt.grund = "";
        }
        this.bobleUr = 1.2 + Math.random() * 1.2;
    };

    /* --------------------------------------------------------------- */
    /* Afgange foelger kinetikken og flytter biler fra parkeringen ud i
       koeen paa kystvejen. Derfra koerer de ud paa broerne, naar der er
       plads. */
    NK.SimBro.prototype.afgange = function (retning) {
        var i;
        if (retning > 0) {
            while (this.rest.frem >= 1 && this.nFyn > 0) {
                this.rest.frem -= 1;
                this.nFyn--;
                this.koeF++;
            }
            if (this.nFyn <= 0) this.rest.frem = 0;
            for (i = 0; this.koeF > 0 && this.paaVej.length < MAKS_BILER; i++) {
                var valgF = this.vaelgSpor(1);
                if (!valgF) break;
                this.koeF--;
                this.sendBil(1, valgF);
            }
        } else {
            while (this.rest.tilbage >= 1 && this.nJyl > 0) {
                this.rest.tilbage -= 1;
                this.nJyl--;
                this.koeJ++;
            }
            if (this.nJyl <= 0) this.rest.tilbage = 0;
            for (i = 0; this.koeJ > 0 && this.paaVej.length < MAKS_BILER; i++) {
                var valgJ = this.vaelgSpor(-1);
                if (!valgJ) break;
                this.koeJ--;
                this.sendBil(-1, valgJ);
            }
        }
    };

    NK.SimBro.prototype.opdater = function (dt) {
        var i;
        this.tid += dt;

        /* --- uheld ryddes efter et stykke tid ----------------------- */
        if (this.ulykke) {
            this.ulykke.tid -= dt;
            if (this.ulykke.tid <= 0) {
                fjernBlok(this.ulykke.bane, "ulykke");
                this.ulykke = null;
                this.opdaterKnapper();
            }
        }

        /* --- afgange fra hver side ---------------------------------- */
        var vFrem = this.kFrem * this.nFyn;
        var vTilbage = this.kTilbage * this.nJyl;
        this.rest.frem += vFrem * dt;
        this.rest.tilbage += vTilbage * dt;
        this.afgange(1);
        this.afgange(-1);

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

        var koeIalt = this.koeF + this.koeJ;
        if (koeIalt >= 4) this.maettetTid += dt;
        else this.maettetTid = Math.max(0, this.maettetTid - dt * 2);

        /* --- tal til panelet ---------------------------------------- */
        this.vVist.frem = NK.mod(this.vVist.frem, vFrem, 5, dt);
        this.vVist.tilbage = NK.mod(this.vVist.tilbage, vTilbage, 5, dt);

        var K = this.kFrem / this.kTilbage;
        var Y = this.nFyn > 0 ? this.nJyl / this.nFyn : Infinity;
        var maks = Math.max(2, this.vVist.frem, this.vVist.tilbage);

        NK.saetMaaler("bro-vfrem-fyld", "bro-vfrem-val", this.vVist.frem, maks, 1, "biler/s");
        NK.saetMaaler("bro-vtilbage-fyld", "bro-vtilbage-val", this.vVist.tilbage, maks, 1, "biler/s");
        NK.saetBadge("bro-badge", this.vVist.frem, this.vVist.tilbage, 0.04);
        NK.saetYK("bro-yk-maerke", "bro-y", "bro-kref", Y, K, 2);

        NK.saetTekst("bro-n-fyn", NK.tal(this.nFyn));
        NK.saetTekst("bro-n-jyl", NK.tal(this.nJyl));
        NK.saetTekst("bro-n-bro", NK.tal(this.paaVej.length));
        NK.saetTekst("bro-n-koe", NK.tal(koeIalt));
        NK.saetTekst("bro-n-alt", NK.tal(this.nFyn + this.nJyl + koeIalt + this.paaVej.length));
        NK.saetTekst("bro-k", NK.tal(K, 2));
        NK.saetTekst("bro-kfrem-vis", NK.tal(this.kFrem, 3));
        NK.saetTekst("bro-ktilbage-vis", NK.tal(this.kTilbage, 3));

        /* --- graf --------------------------------------------------- */
        this.grafUr += dt;
        if (this.grafUr >= 0.18) {
            this.grafUr = 0;
            this.graf.tilfoej([this.nFyn, this.nJyl, vFrem, vTilbage]);
        }
    };

    /* =============================================================== */
    /* TEGNING                                                          */
    /* =============================================================== */
    var FONT = "'Segoe UI', sans-serif";

    /* Pil med hastighedstekst. */
    function tegnPil(ctx, x, y, laengde, mod, farve, tekst) {
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        var x0 = x - laengde / 2 * mod;
        var x1 = x + laengde / 2 * mod;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1 - 8 * mod, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x1 - 10 * mod, y - 6);
        ctx.lineTo(x1 - 10 * mod, y + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        NK.tekst(ctx, tekst, x, y - 10, { justering: "center", farve: farve, font: "700 12px " + FONT });
    }

    /* Lille maerkat med tekst, fx KØ. */
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

    /* Vejbane paa broen og tilkoerslerne: asfalt, midterrabat og striber. */
    NK.SimBro.prototype.tegnVej = function (ctx, bro, y, tyk) {
        var g = this.g;
        var x0 = g.xVejF - g.vejHalv;
        var x1 = g.xVejJ + g.vejHalv;
        var top = y - tyk / 2;
        var spor = BROER[bro].spor;
        var halv = (tyk - g.midte) / 2;
        var r, x;

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(x0, top + 4, x1 - x0, tyk);
        ctx.fillStyle = "#4a525c";
        ctx.fillRect(x0, top, x1 - x0, tyk);
        ctx.fillStyle = "#98a3ad";
        ctx.fillRect(x0, top - 2, x1 - x0, 2.5);
        ctx.fillRect(x0, top + tyk - 0.5, x1 - x0, 2.5);

        /* Midterrabat */
        ctx.fillStyle = bro === NY ? "#c9d1d8" : "#e8d27a";
        ctx.fillRect(x0, top + halv + 0.5, x1 - x0, g.midte - 1);

        /* Stiplede linjer mellem spor i samme retning */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([10, 9]);
        for (r = 1; r < spor; r++) {
            var y1 = top + r * (halv / spor);
            var y2 = top + halv + g.midte + r * (halv / spor);
            ctx.beginPath();
            ctx.moveTo(x0, y1); ctx.lineTo(x1, y1);
            ctx.moveTo(x0, y2); ctx.lineTo(x1, y2);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        /* Kantlinjer */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, top + 2.5); ctx.lineTo(x1, top + 2.5);
        ctx.moveTo(x0, top + tyk - 2.5); ctx.lineTo(x1, top + tyk - 2.5);
        ctx.stroke();

        /* Autovaern over vandet */
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
        var t;

        /* Pyloner */
        ctx.fillStyle = "#9aa6b0";
        ctx.fillRect(px1 - bred / 2, pylonTop, bred, g.tykNy * 1.8);
        ctx.fillRect(px2 - bred / 2, pylonTop, bred, g.tykNy * 1.8);

        function kabel(tt) {
            var u = 1 - tt;
            var ky = top - g.tykNy * 0.05;
            return {
                x: u * u * px1 + 2 * u * tt * (px1 + px2) / 2 + tt * tt * px2,
                y: u * u * pylonTop + 2 * u * tt * ky + tt * tt * pylonTop
            };
        }

        ctx.strokeStyle = "rgba(200, 210, 218, 0.7)";
        ctx.lineWidth = 1;
        for (t = 0.05; t < 1; t += 0.05) {
            var p = kabel(t);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, top);
            ctx.stroke();
        }

        ctx.strokeStyle = "#cfd8df";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(g.xVand0 - 6, top);
        ctx.lineTo(px1, pylonTop);
        ctx.quadraticCurveTo((px1 + px2) / 2, top - g.tykNy * 0.05, px2, pylonTop);
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
        /* Bropiller */
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
            var by = (i / antal) * h + Math.sin(this.tid * 0.9 + i) * (this.storm ? 6 : 3);
            var bx = g.xVand0 + ((this.tid * fart + i * 57) % Math.max(1, bredde - 40));
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.quadraticCurveTo(bx + 14, by - (this.storm ? 6 : 3), bx + 30, by);
            ctx.stroke();
        }
    };

    /* Kystvejen paa land, som foerer bilerne ud til begge broer. */
    NK.SimBro.prototype.tegnKystvej = function (ctx, x) {
        var g = this.g;
        var y0 = g.yNy - g.tykNy / 2;
        var y1 = g.yGl + g.tykGl / 2;
        ctx.fillStyle = "#4a525c";
        ctx.fillRect(x - g.vejHalv, y0, g.vejHalv * 2, y1 - y0);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
        ctx.setLineDash([]);
    };

    /* Biler, der venter paa at komme ud paa broerne. */
    NK.SimBro.prototype.tegnVenteKoe = function (ctx, x, antal, sprite, farve) {
        if (antal <= 0) return;
        var g = this.g;
        var y0 = g.yNy + g.tykNy / 2 + g.bilB * 0.6;
        var y1 = g.yGl - g.tykGl / 2 - g.bilB * 0.6;
        var trin = g.bilB * 1.08;
        var plads = Math.max(1, Math.floor((y1 - y0) / trin) + 1);
        var vist = Math.min(antal, plads);
        ctx.fillStyle = "rgba(224, 84, 70, 0.28)";
        ctx.fillRect(x - g.vejHalv, y0 - g.bilB * 0.6, g.vejHalv * 2, (vist - 1) * trin + g.bilB * 1.2);
        for (var i = 0; i < vist; i++) {
            NK.Sprites.tegn(ctx, sprite, x, y0 + i * trin, g.bilB * 0.92, -Math.PI / 2, 1, farve);
        }
        tegnMaerkat(ctx, "KØ " + antal, x, y0 - g.bilB * 0.95,
            "#e05446", "#ffd9d4", "#ffffff");
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
                                x: (a + e) / 2,
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
        var vinkel = (bil.retning > 0 ? 0 : Math.PI) + bil.retning * haeld;
        var r = bil.retning;

        if (bil.lang) {
            /* Campingvogn bag bilen */
            var cx = x - r * g.bilB * 0.95;
            ctx.fillStyle = "#3a3f46";
            ctx.fillRect(Math.min(x, cx) + g.bilB * 0.2, y - 1, g.bilB * 0.5, 2);
            ctx.fillStyle = "#ece6d6";
            NK.rundtRekt(ctx, cx - g.bilB * 0.4, y - g.bilH * 0.5, g.bilB * 0.8, g.bilH, 3);
            ctx.fill();
            ctx.fillStyle = "#c98b3a";
            ctx.fillRect(cx - g.bilB * 0.4, y - 1.5, g.bilB * 0.8, 3);
        }

        NK.Sprites.tegn(ctx, bil.sprite, x, y, g.bilB, vinkel, 1, r > 0 ? "#3d9ee0" : "#e6892a");

        if (bil.koe) {
            var bagX = x - r * (bil.lang ? g.bilB * 1.36 : g.bilB * 0.5);
            ctx.fillStyle = "rgba(255, 60, 40, 0.95)";
            ctx.beginPath();
            ctx.arc(bagX, y - g.bilH * 0.32, 2.4, 0, Math.PI * 2);
            ctx.arc(bagX, y + g.bilH * 0.32, 2.4, 0, Math.PI * 2);
            ctx.fill();
        }
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
            /* Afspaerring ved indkoersel til arbejdet */
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
        var blink = (Math.sin(this.tid * 9) + 1) / 2;

        ctx.save();
        ctx.globalAlpha = 0.25 + blink * 0.35;
        ctx.fillStyle = "#ff5a1f";
        ctx.beginPath();
        ctx.arc(x, y, g.bilB * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        NK.Sprites.tegn(ctx, "bilRoed", x - g.bilB * 0.25, y - 2, g.bilB, 0.5 + u.vinkel * 0.4, 1, "#e05446");
        NK.Sprites.tegn(ctx, "bilHvid", x + g.bilB * 0.35, y + 3, g.bilB, -2.4 + u.vinkel * 0.4, 1, "#dfe7ee");

        var top = u.bane.bro === NY ? g.yNy - g.tykNy / 2 : g.yGl - g.tykGl / 2;
        var bund = u.bane.bro === NY ? g.yNy + g.tykNy / 2 : g.yGl + g.tykGl / 2;
        var ty = u.bane.retning < 0 ? top - 14 : bund + 14;
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
            var x = (r() * b + this.tid * 260) % (b + 40) - 20;
            var y = (r() * h + this.tid * 520 * (0.8 + r() * 0.4)) % (h + 30) - 15;
            ctx.moveTo(x, y);
            ctx.lineTo(x - 7, y - 14);
        }
        ctx.stroke();
    };

    NK.SimBro.prototype.tegn = function () {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var g = this.g;
        var i;

        g.vejHalv = Math.min(g.bilB * 0.62, b * 0.028);
        ctx.clearRect(0, 0, b, h);

        /* --- land og vand ------------------------------------------- */
        this.tegnVand(ctx);
        this.tegnLand(ctx, 0, g.xVand0, h, "#3f7a4a", "#4d8f57", 11);
        this.tegnLand(ctx, g.xVand1, b, h, "#3f7a4a", "#4d8f57", 77);

        var koeF = this.koeF;
        var koeJ = this.koeJ;
        this.tegnParkering(ctx, g.xPark0F, g.xPark1F, h, this.nFyn, 0, "bilBlaa", "#3d9ee0");
        this.tegnParkering(ctx, g.xPark0J, g.xPark1J, h, this.nJyl, Math.PI, "bilOrange", "#e6892a");

        /* --- veje og broer ------------------------------------------ */
        this.tegnKystvej(ctx, g.xVejF);
        this.tegnKystvej(ctx, g.xVejJ);
        this.tegnGitterbro(ctx);
        this.tegnVej(ctx, GAMMEL, g.yGl, g.tykGl);
        this.tegnHaengebro(ctx);
        this.tegnVej(ctx, NY, g.yNy, g.tykNy);

        if (this.vejarbejde) this.tegnVejarbejde(ctx);
        var koeMaerkater = this.tegnKoeZoner(ctx);

        /* --- biler -------------------------------------------------- */
        for (i = 0; i < this.paaVej.length; i++) this.tegnBil(ctx, this.paaVej[i]);
        this.tegnUlykke(ctx);

        this.tegnVenteKoe(ctx, g.xVejF, koeF, "bilBlaa", "#3d9ee0");
        this.tegnVenteKoe(ctx, g.xVejJ, koeJ, "bilOrange", "#e6892a");

        if (this.storm) this.tegnRegn(ctx);

        for (i = 0; i < koeMaerkater.length; i++) {
            tegnMaerkat(ctx, "KØ", koeMaerkater[i].x, koeMaerkater[i].y, "#e05446", "#ffd9d4", "#ffffff");
        }

        /* --- skilte og navne ---------------------------------------- */
        var kmtNy = this.kmt(NY);
        var kmtGl = this.kmt(GAMMEL);
        /* Skiltene staar paa land ved hver tilkoersel */
        var sxF = (g.xVejF + g.vejHalv + g.xVand0) / 2;
        var sxJ = (g.xVejJ - g.vejHalv + g.xVand1) / 2;
        tegnSkilt(ctx, sxF, g.yNy + g.tykNy / 2 + 17, kmtNy, this.vejarbejde);
        tegnSkilt(ctx, sxJ, g.yNy - g.tykNy / 2 - 17, kmtNy, this.vejarbejde);
        tegnSkilt(ctx, sxF, g.yGl + g.tykGl / 2 + 17, kmtGl, this.storm);
        tegnSkilt(ctx, sxJ, g.yGl - g.tykGl / 2 - 17, kmtGl, this.storm);

        var midtX = (g.xVand0 + g.xVand1) / 2;
        NK.tekst(ctx, BROER[NY].navn + (this.vejarbejde ? "  ·  vejarbejde" : ""),
            midtX, g.yNy - g.tykNy * 1.3 - 8,
            { justering: "center", farve: "#dfe7ee", font: "600 12px " + FONT });
        NK.tekst(ctx, BROER[GAMMEL].navn + (this.storm ? "  ·  storm" : ""),
            midtX, g.yGl + g.tykGl / 2 + 22,
            { justering: "center", farve: "#dfe7ee", font: "600 12px " + FONT });

        /* --- hastighedspile mellem broerne -------------------------- */
        var yMidt = (g.yNy + g.tykNy / 2 + g.yGl - g.tykGl * 1.3) / 2 + 6;
        var maks = Math.max(2, this.vVist.frem, this.vVist.tilbage);
        var maksPil = (g.xVand1 - g.xVand0) * 0.5;
        tegnPil(ctx, midtX, yMidt - 16, 20 + maksPil * (this.vVist.frem / maks), 1, "#7ec8f5",
            "v(frem) = " + NK.tal(this.vVist.frem, 1) + " biler/s");
        tegnPil(ctx, midtX, yMidt + 24, 20 + maksPil * (this.vVist.tilbage / maks), -1, "#f5bd7e",
            "v(tilbage) = " + NK.tal(this.vVist.tilbage, 1) + " biler/s");

        /* --- stednavne ---------------------------------------------- */
        NK.tekst(ctx, "FYN", g.xVand0 * 0.45, 30, { justering: "center", farve: "#ffffff", font: "700 20px " + FONT });
        NK.tekst(ctx, "Middelfart", g.xVand0 * 0.45, 48, { justering: "center", farve: "#d5e6d8", font: "13px " + FONT });
        NK.tekst(ctx, "JYLLAND", b - (b - g.xVand1) * 0.45, 30, { justering: "center", farve: "#ffffff", font: "700 20px " + FONT });
        NK.tekst(ctx, "Fredericia", b - (b - g.xVand1) * 0.45, 48, { justering: "center", farve: "#d5e6d8", font: "13px " + FONT });

        if (this.maettetTid > 2) {
            tegnMaerkat(ctx, "Kø: ligevægten forsinkes, men flyttes ikke", midtX, yMidt + 58,
                "rgba(20, 20, 28, 0.85)", "#f2c53d", "#f7dc86");
        }

        /* --- talebobler oeverst ------------------------------------- */
        for (i = 0; i < this.paaVej.length; i++) {
            var bil = this.paaVej[i];
            if (bil.boble) tegnBoble(ctx, bil.boble, this.xFraP(bil.p, bil.retning), bil.visY - g.bilH * 0.55);
        }

        this.graf.tegn();
    };

    /* Landmasse med et par huse. */
    NK.SimBro.prototype.tegnLand = function (ctx, x0, x1, h, moerk, lys, froeTal) {
        var gr = ctx.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, lys);
        gr.addColorStop(1, moerk);
        ctx.fillStyle = gr;
        ctx.fillRect(x0, 0, x1 - x0, h);

        var r = NK.froe(froeTal);
        var antal = Math.max(3, Math.floor((x1 - x0) / 54));
        for (var i = 0; i < antal; i++) {
            var hx = x0 + 22 + (i + r() * 0.5) * ((x1 - x0 - 40) / antal);
            var hy = h * (0.13 + r() * 0.03);
            NK.Sprites.tegnStaaende(ctx, r() > 0.5 ? "husRoed" : "husGul", hx, hy, 26, 1, "#c0392b");
        }
    };

    /* Parkeringsplads: et gitter af biler, saa "koncentrationen" ses. */
    NK.SimBro.prototype.tegnParkering = function (ctx, x0, x1, h, antal, vinkel, sprite, farve) {
        var y0 = h * 0.17;
        var y1 = h * 0.92;
        var bredde = x1 - x0;

        ctx.fillStyle = "rgba(12, 16, 22, 0.42)";
        NK.rundtRekt(ctx, x0, y0, bredde, y1 - y0, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();

        var celle = NK.klamp(bredde / 8, 16, 28);
        var kolonner = Math.max(1, Math.floor((bredde - 8) / celle));
        var raekker = Math.max(1, Math.floor((y1 - y0 - 32) / celle));
        var plads = kolonner * raekker;
        var vist = Math.min(antal, plads);
        var venstre = x0 + (bredde - kolonner * celle) / 2;

        for (var i = 0; i < vist; i++) {
            var kx = venstre + (i % kolonner) * celle + celle / 2;
            var ky = y0 + 26 + Math.floor(i / kolonner) * celle + celle / 2;
            NK.Sprites.tegn(ctx, sprite, kx, ky, celle * 0.9, vinkel, 1, farve);
        }

        NK.tekst(ctx, NK.tal(antal) + " biler", (x0 + x1) / 2, y0 + 16, {
            justering: "center", farve: farve, font: "700 14px " + FONT
        });
        if (antal > plads) {
            NK.tekst(ctx, "(viser " + NK.tal(plads) + ")", (x0 + x1) / 2, y1 - 6, {
                justering: "center", farve: "#c9d2da", font: "11px " + FONT
            });
        }
    };
}());
