/* =====================================================================
   model.js - molekylerne i bassinet

   Bassinet er et fast gitter paa 32 x 27 pladser i taet pakning (hver
   anden raekke forskudt en halv plads). En kugle er et molekyle, og
   vaesken er altid taet: alle raekker under overfladen er fulde. Derfor
   fylder ni portioner bassinet helt, uanset hvor stort billedet er.

   Fire ting flytter kuglerne:

   1. Diffusion. To naboer bytter plads med en sandsynlighed, der
      afhaenger af, hvor godt de holder fast i deres naboer foer og
      efter (NK.Data.BINDING) og af temperaturen (Metropolis). Kan to
      stoffer blandes, blander de sig af sig selv. Kan de ikke, samler de
      sig i klumper, og graensen mellem dem bliver skarp.
   2. Opdrift. Tyngden virker kun mellem to faser, ikke mellem molekyler i
      samme fase: vand og ethanol lagdeler sig ikke, selv om ethanol er
      lettere. En fases taethed er taetheden af hele blandingen i den
      (NK.Data.faseTaethed). Smaa draaber flyttes som én klump op eller
      ned, hurtigere jo stoerre de er; det, de skubber til side, glider
      uden om dem.
   3. Overfladen. Kugler falder ned i huller, og overfladen jaevner sig.
      Et stof fordamper fra overfladen efter sit damptryk og koger, naar
      damptrykket naar 1 atm: saa dannes der bobler inde i vaesken. Dampen
      stiger op, bliver til draaber i den kolde zone foroven og drypper ned.
   4. Eleven. Det, der haeldes i, falder ned i en straale og trykkes et
      stykke ned i vaesken. En rystning bytter tilfaeldige kugler rundt.

   Koordinater: x mod hoejre og y OPAD fra bunden, i kuglediametre.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var H = Math.sqrt(3) / 2;

    function klamp(v, lav, hoej) { return v < lav ? lav : (v > hoej ? hoej : v); }

    /* Kuglernes tilstande */
    var VAESKE = 0, DAMP = 1, DRAABE = 2, FALD = 3, SPILD = 4, AFLOEB = 5, BOBLE = 6;

    /* Modellens tal. Kan pilles ved fra konsollen: NK.Model.PARAM */
    var PARAM = {
        kT20: 0.22,          /* kT ved 20 °C i BINDING's enheder */
        byt20: 10,           /* byttefoersoeg pr. kugle pr. sekund ved 20 °C */
        byttEa: 1800,        /* hvor meget hurtigere det gaar, naar det er varmt (K) */
        G: 4,                /* tyngdens vaegt i byttet mellem to faser */
        cMaks: 8,            /* hvor meget en stor fase vejer i byttet */
        kv: 2.2,             /* draabers fart i raekker/s: kv · (forskel i g/mL)^0,6 · kvadratrod af kugler */
        svaeve: 0.008,       /* under denne forskel i taethed (g/mL) staar en draabe stille */
        vMaks: 4,            /* draabers stoerste fart, raekker/s */
        brown: 6,            /* draabers tilfaeldige skridt pr. s (deles med kvadratroden af kugler) */
        draabeMaks: 150,     /* stoerre klumper flyttes ikke som én */
        udjaevnHver: 0.15,   /* sekunder mellem to bytninger, der flader et lag ud */
        fordamp: 0.04,       /* fordampning fra overfladen pr. sekund ved 1 atm */
        kog: 0.05,           /* bobler pr. kugle pr. sekund pr. atm over 1 atm */
        bobleTrin: 0.045,    /* sekunder pr. raekke, en boble stiger */
        haeldFart: 130,      /* kugler pr. sekund i straalen */
        dybde: 11,           /* hvor mange raekker straalen hoejst trykker ned */
        rystFart: 7,         /* bytninger pr. kugle pr. sekund under rystning */
        faseByt: 0.35,       /* to faser bytter sjaeldnere: draaber skal presse sig sammen */
        glid: 11             /* hvor hurtigt en kugle glider paa plads (1/s) */
    };

    function Model(D, valg) {
        valg = valg || {};
        this.D = D;
        this.C = valg.kolonner || 32;
        this.R = valg.raekker || 27;
        this.bredde = this.C + 0.5;
        this.fyldHoejde = (this.R - 1) * H + 1;
        this.hoejde = this.fyldHoejde + (valg.hoved || 5.2);
        this.koelFra = this.hoejde - 1.7;          /* den kolde zone foroven */
        this.tilf = valg.tilfaeldig || Math.random;

        var n = D.STOFFER.length, a, b;
        this.nStof = n;
        this.B = D.BINDING;
        /* Faserne: stoffer, der kan blandes, er i samme fase */
        this.fase = [];
        for (a = 0; a < n; a++) this.fase[a] = a;
        for (a = 0; a < n; a++) {
            for (b = a + 1; b < n; b++) {
                if (D.blandbar(a, b)) {
                    var fra = this.fase[b], til = this.fase[a];
                    for (var i = 0; i < n; i++) if (this.fase[i] === fra) this.fase[i] = til;
                }
            }
        }

        var S = this.C * this.R;
        this.plads = new Int32Array(S);
        this.boble = new Uint8Array(S);
        this.kompId = new Int32Array(S);
        this.raekkeAntal = new Int32Array(this.R);
        this.NB = new Int32Array(S * 6);
        this.bygNaboer();

        this.T = 20;
        this.tid = 0;
        this.rystTid = 0;
        this.rystStyrke = 0;
        this.nulstil();
    }

    Model.PARAM = PARAM;
    Model.TILSTAND = { VAESKE: VAESKE, DAMP: DAMP, DRAABE: DRAABE, FALD: FALD, SPILD: SPILD, AFLOEB: AFLOEB, BOBLE: BOBLE };

    var P = Model.prototype;

    /* ----- Gitteret --------------------------------------------------- */

    /* Naboerne i raekkefoelgen venstre, hoejre, op-venstre, op-hoejre,
       ned-venstre, ned-hoejre. Ulige raekker er forskudt en halv plads
       mod hoejre. -1 er vaeggen, bunden eller over kanten. */
    P.bygNaboer = function () {
        var C = this.C, R = this.R, NB = this.NB;
        for (var r = 0; r < R; r++) {
            for (var c = 0; c < C; c++) {
                var k = r * C + c, o = k * 6, u = r % 2;
                var cv = u ? c : c - 1, ch = u ? c + 1 : c;
                NB[o] = c > 0 ? k - 1 : -1;
                NB[o + 1] = c < C - 1 ? k + 1 : -1;
                NB[o + 2] = r < R - 1 && cv >= 0 ? (r + 1) * C + cv : -1;
                NB[o + 3] = r < R - 1 && ch < C ? (r + 1) * C + ch : -1;
                NB[o + 4] = r > 0 && cv >= 0 ? (r - 1) * C + cv : -1;
                NB[o + 5] = r > 0 && ch < C ? (r - 1) * C + ch : -1;
            }
        }
    };

    P.px = function (k) {
        var r = (k / this.C) | 0, c = k - r * this.C;
        return 0.5 + c + (r % 2 ? 0.5 : 0);
    };

    P.py = function (k) {
        return 0.5 + ((k / this.C) | 0) * H;
    };

    P.raekke = function (k) { return (k / this.C) | 0; };

    /* Den oeverste raekke med vaeske i, -1 naar bassinet er tomt */
    P.top = function () {
        for (var r = this.R - 1; r >= 0; r--) if (this.raekkeAntal[r] > 0) return r;
        return -1;
    };

    /* Hoejden af vaeskens overflade over bunden */
    P.overflade = function () {
        var t = this.top();
        if (t < 0) return 0;
        var fuld = this.raekkeAntal[t] / this.C;
        return (t - 1 + fuld) * H + 1;
    };

    P.saet = function (b, k) {
        var kugle = this.kugler[b];
        this.plads[k] = b;
        kugle.k = k;
        this.raekkeAntal[this.raekke(k)]++;
    };

    P.fjern = function (k) {
        var b = this.plads[k];
        if (b < 0) return -1;
        this.plads[k] = -1;
        this.kugler[b].k = -1;
        this.raekkeAntal[this.raekke(k)]--;
        return b;
    };

    P.nyKugle = function (art, tilst, x, y) {
        var kugle = {
            art: art, tilst: tilst, k: -1, x: x, y: y, vx: 0, vy: 0,
            vej: null, f1: this.tilf() * 6.283, f2: this.tilf() * 6.283,
            drift: 0, alfa: 1, ur: 0
        };
        this.kugler.push(kugle);
        return this.kugler.length - 1;
    };

    /* ----- Tilstanden ------------------------------------------------- */

    P.nulstil = function () {
        this.plads.fill(-1);
        this.boble.fill(0);
        this.raekkeAntal.fill(0);
        this.kugler = [];
        this.bobler = [];
        this.haeld = [];
        this.komps = [];
        this.kompUr = 0;
        this.udjaevnUr = 0;
        this.spildt = 0;
        this.rystTid = 0;
        this.rystStyrke = 0;
        this.maerk();
    };

    /* Fylder straks op nedefra, fx [0, 0, 0] = tre portioner vand.
       Laegges i lag i den raekkefoelge, de staar, eller rystet sammen,
       naar blandet er sand. */
    P.fyldStraks = function (arter, blandet) {
        var liste = [], i;
        for (i = 0; i < arter.length; i++) {
            for (var j = 0; j < this.D.PORTION; j++) liste.push(arter[i]);
        }
        if (blandet) {
            for (i = liste.length - 1; i > 0; i--) {
                var t = (this.tilf() * (i + 1)) | 0, x = liste[i];
                liste[i] = liste[t];
                liste[t] = x;
            }
        }
        for (i = 0; i < liste.length; i++) {
            var k = this.foersteLedige();
            if (k < 0) { this.spildt++; continue; }
            var b = this.nyKugle(liste[i], VAESKE, this.px(k), this.py(k));
            this.saet(b, k);
        }
        this.maerk();
    };

    P.foersteLedige = function () {
        for (var k = 0; k < this.plads.length; k++) if (this.plads[k] < 0 && !this.boble[k]) return k;
        return -1;
    };

    P.saetT = function (T) { this.T = T; };

    P.kT = function () { return PARAM.kT20 * (this.T + 273.15) / 293.15; };

    P.byttefart = function () {
        return PARAM.byt20 * Math.exp(PARAM.byttEa * (1 / 293.15 - 1 / (this.T + 273.15)));
    };

    /* ----- Det, eleven goer ------------------------------------------- */

    P.haeldI = function (art, portioner) {
        this.haeld.push({ art: art, rest: this.D.PORTION * (portioner || 1), ur: 0 });
    };

    P.haelder = function () { return this.haeld.length > 0; };

    P.ryst = function (sek, styrke) {
        this.rystTid = Math.max(this.rystTid, sek);
        this.rystStyrke = Math.max(this.rystStyrke, styrke === undefined ? 1 : styrke);
    };

    /* Tøm: alt loeber ud i bunden */
    P.toem = function () {
        var mig = this;
        this.kugler.forEach(function (k) {
            if (k.tilst === SPILD || k.tilst === AFLOEB) return;
            if (k.k >= 0) mig.fjern(k.k);
            if (k.tilst === BOBLE && k.k >= 0) mig.boble[k.k] = 0;
            k.tilst = AFLOEB;
            k.vx = 0;
            k.vy = -1 - mig.tilf() * 2;
            k.vej = null;
        });
        this.boble.fill(0);
        this.bobler = [];
        this.haeld = [];
        this.rystTid = 0;
        this.maerk();
    };

    /* ----- Tidsskridtet ----------------------------------------------- */

    P.opdater = function (dt) {
        if (dt <= 0) return;
        this.tid += dt;
        this.haeldStraale(dt);
        this.fri(dt);
        if (this.rystTid > 0) {
            this.rystTid -= dt;
            this.rystBytte(dt);
            if (this.rystTid <= 0) { this.rystTid = 0; this.rystStyrke = 0; }
        }
        this.diffunder(dt);
        this.jaevn();
        this.kompUr -= dt;
        if (this.kompUr <= 0) {
            this.kompUr = 0.05;
            this.maerk();
            this.draaber(0.05);
            this.udjaevnUr -= 0.05;
            if (this.udjaevnUr <= 0) { this.udjaevnUr = PARAM.udjaevnHver; this.udjaevn(); }
            this.jaevn();
        }
        this.fordamp(dt);
        this.stigBobler(dt);
        this.glid(dt);
        this.ryd();
    };

    /* Fjerner kugler, der er loebet ud eller spildt, naar de er ude af syne */
    P.ryd = function () {
        var faer = false, i;
        for (i = 0; i < this.kugler.length; i++) {
            var k = this.kugler[i];
            if ((k.tilst === AFLOEB || k.tilst === SPILD) && k.alfa <= 0) { faer = true; break; }
        }
        if (!faer) return;
        var gammel = this.kugler, ny = [], om = new Int32Array(gammel.length);
        for (i = 0; i < gammel.length; i++) {
            var g = gammel[i];
            if ((g.tilst === AFLOEB || g.tilst === SPILD) && g.alfa <= 0) { om[i] = -1; continue; }
            om[i] = ny.length;
            ny.push(g);
        }
        for (i = 0; i < this.plads.length; i++) if (this.plads[i] >= 0) this.plads[i] = om[this.plads[i]];
        this.bobler.forEach(function (bo) { bo.b = om[bo.b]; });
        this.kugler = ny;
    };

    /* ----- 1. Diffusion ----------------------------------------------- */

    /* Hvor godt kuglen af art a paa plads k holder fast i sine naboer,
       naar naboen paa plads 'uden' ikke tælles med */
    P.bundet = function (k, a, uden) {
        var o = k * 6, s = 0, Ba = this.B[a];
        for (var d = 0; d < 6; d++) {
            var m = this.NB[o + d];
            if (m < 0 || m === uden) continue;
            var b = this.plads[m];
            if (b >= 0) s += Ba[this.kugler[b].art];
        }
        return s;
    };

    P.kompVaegt = function (k) {
        var id = this.kompId[k];
        if (id < 0 || !this.komps[id]) return 1;
        return Math.min(PARAM.cMaks, Math.sqrt(this.komps[id].n));
    };

    P.kompRho = function (k, art) {
        var id = this.kompId[k];
        if (id < 0 || !this.komps[id]) return this.D.STOFFER[art].taethed;
        return this.komps[id].rho;
    };

    P.diffunder = function (dt) {
        var liste = [], i;
        for (i = 0; i < this.plads.length; i++) if (this.plads[i] >= 0) liste.push(i);
        if (!liste.length) return;
        var forsoeg = liste.length * this.byttefart() * dt;
        var hele = Math.floor(forsoeg);
        if (this.tilf() < forsoeg - hele) hele++;
        var kT = this.kT(), NB = this.NB, pl = this.plads, kg = this.kugler;

        for (i = 0; i < hele; i++) {
            var k = liste[(this.tilf() * liste.length) | 0];
            var bi = pl[k];
            if (bi < 0) continue;
            var d = (this.tilf() * 6) | 0;
            var j = NB[k * 6 + d];
            if (j < 0 || this.boble[j]) continue;
            var bj = pl[j];
            var a = kg[bi].art;

            if (bj < 0) {
                /* Et tomt naboplads: kun sidelaens i overfladen eller ned */
                if (d >= 4) { this.flyt(k, j); liste.push(j); continue; }
                if (d >= 2) continue;
                if (!this.baaret(j) || this.baerer(k)) continue;
                var dE0 = -(this.bundet(j, a, k) - this.bundet(k, a, j));
                if (dE0 <= 0 || this.tilf() < Math.exp(-dE0 / kT)) { this.flyt(k, j); liste.push(j); }
                continue;
            }

            var b = kg[bj].art;
            if (a === b) continue;
            var dE = -(this.bundet(k, b, j) + this.bundet(j, a, k) - this.bundet(k, a, j) - this.bundet(j, b, k));
            if (this.fase[a] !== this.fase[b] && d >= 2) {
                var op = d < 4 ? 1 : -1;          /* a flytter op (1) eller ned (-1) */
                var c = (this.kompVaegt(k) + this.kompVaegt(j)) / 2;
                dE += PARAM.G * H * op * (this.kompRho(k, a) - this.kompRho(j, b)) * c;
            }
            if (this.fase[a] !== this.fase[b] && this.tilf() > PARAM.faseByt) continue;
            if (dE <= 0 || this.tilf() < Math.exp(-dE / kT)) this.byt(k, j);
        }
    };

    /* Har pladsen noget at staa paa? */
    P.baaret = function (k) {
        if (k < this.C) return true;
        var o = k * 6;
        for (var d = 4; d < 6; d++) {
            var m = this.NB[o + d];
            if (m >= 0 && this.plads[m] < 0 && !this.boble[m]) return false;
        }
        return true;
    };

    /* Staar der en kugle ovenpaa pladsen? */
    P.baerer = function (k) {
        var o = k * 6;
        for (var d = 2; d < 4; d++) {
            var m = this.NB[o + d];
            if (m >= 0 && this.plads[m] >= 0) return true;
        }
        return false;
    };

    P.byt = function (k, j) {
        var bi = this.plads[k], bj = this.plads[j];
        this.plads[k] = bj;
        this.plads[j] = bi;
        this.kugler[bi].k = j;
        this.kugler[bj].k = k;
        var id = this.kompId[k];
        this.kompId[k] = this.kompId[j];
        this.kompId[j] = id;
    };

    P.flyt = function (k, j) {
        var b = this.fjern(k);
        this.saet(b, j);
        this.kompId[j] = this.kompId[k];
        this.kompId[k] = -1;
    };

    /* ----- 2. Opdrift: klumperne ---------------------------------------- */

    /* Deler vaesken i klumper af samme fase, der haenger sammen */
    P.maerk = function () {
        var S = this.plads.length, id = this.kompId, pl = this.plads, kg = this.kugler;
        id.fill(-1);
        var komps = [], koe = new Int32Array(S);
        for (var s = 0; s < S; s++) {
            if (pl[s] < 0 || id[s] >= 0) continue;
            var f = this.fase[kg[pl[s]].art];
            var komp = { n: 0, antal: [], fase: f, overflade: false, sider: {}, sumX: 0, minR: 1e9, maxR: -1, drift: 0 };
            for (var a = 0; a < this.nStof; a++) komp.antal[a] = 0;
            var nr = komps.length, hoved = 0, hale = 0;
            koe[hale++] = s;
            id[s] = nr;
            while (hoved < hale) {
                var k = koe[hoved++], kugle = kg[pl[k]];
                komp.n++;
                komp.antal[kugle.art]++;
                komp.drift += kugle.drift;
                komp.sumX += this.px(k);
                var r = this.raekke(k);
                if (r < komp.minR) komp.minR = r;
                if (r > komp.maxR) komp.maxR = r;
                for (var d = 0; d < 6; d++) {
                    var m = this.NB[k * 6 + d];
                    if (m < 0) continue;
                    if (pl[m] < 0) { if (!this.boble[m]) komp.overflade = true; continue; }
                    if (id[m] >= 0) continue;
                    if (this.fase[kg[pl[m]].art] !== f) continue;
                    id[m] = nr;
                    koe[hale++] = m;
                }
            }
            komp.rho = this.D.faseTaethed(komp.antal);
            komp.drift /= komp.n;
            komps.push(komp);
        }
        this.komps = komps;
    };

    /* Smaa klumper, der er omgivet af en anden fase, stiger eller synker
       som én, efter forskellen i taethed */
    P.draaber = function (dt) {
        var mig = this, S = this.plads.length, pl = this.plads, id = this.kompId;
        var medlemmer = this.komps.map(function () { return []; });
        for (var s = 0; s < S; s++) if (pl[s] >= 0 && id[s] >= 0) medlemmer[id[s]].push(s);

        this.komps.forEach(function (komp, nr) {
            if (komp.n > PARAM.draabeMaks) return;
            /* Omgivelsernes taethed, vaegtet efter beroering */
            var sum = 0, vaegt = 0;
            medlemmer[nr].forEach(function (k) {
                for (var d = 0; d < 6; d++) {
                    var m = mig.NB[k * 6 + d];
                    if (m < 0 || pl[m] < 0 || id[m] < 0 || id[m] === nr) continue;
                    sum += mig.komps[id[m]].rho;
                    vaegt++;
                }
            });
            if (!vaegt) return;
            var drho = sum / vaegt - komp.rho;
            /* Smaa forskelle giver lidt hurtigere draaber end Stokes, saa
               man ikke skal vente et halvt minut; under svaeve staar de stille */
            var adr = Math.abs(drho);
            var v = adr < PARAM.svaeve ? 0 : (drho > 0 ? 1 : -1) * PARAM.kv * Math.pow(adr, 0.6) * Math.sqrt(komp.n);
            v = klamp(v, -PARAM.vMaks, PARAM.vMaks);
            /* I overfladen kan en draabe kun synke; den vandrer ikke */
            if (komp.overflade && v >= 0) return;
            var drift = komp.drift + v * dt;
            if (Math.abs(drift) >= 1) {
                var ok = mig.flytKlump(medlemmer[nr], mig.blandet(drift > 0 ? [2, 3] : [4, 5]), nr);
                drift = ok ? drift - (drift > 0 ? 1 : -1) : 0;
            } else if (mig.tilf() < PARAM.brown * dt / Math.sqrt(komp.n)) {
                /* Draaberne vandrer tilfaeldigt og kan saa moedes og flyde sammen */
                mig.flytKlump(medlemmer[nr], [(mig.tilf() * 6) | 0], nr);
            }
            medlemmer[nr].forEach(function (k) {
                var b = pl[k];
                if (b >= 0) mig.kugler[b].drift = drift;
            });
        });
    };

    /* Lagene flader ud. Ligger det lette lag rigtigt, altsaa overvejende
       oven paa det tunge, men stikker det ned i det tunge et sted (en
       tragt, en linse i overfladen), bytter det laveste lette molekyle
       plads med det hoejeste tunge. I virkeligheden er det trykket, der
       skubber laget fladt; i et bassin paa 30 molekyler ville
       overfladespaendingen ellers vinde over tyngden. */
    P.udjaevn = function () {
        var mig = this, pl = this.plads, id = this.kompId, S = pl.length;
        var store = [], faseN = {}, smaa = {};
        this.komps.forEach(function (k, nr) {
            faseN[k.fase] = (faseN[k.fase] || 0) + k.n;
            if (k.n > PARAM.draabeMaks || ((k.overflade || k.minR === 0) && k.n >= 8)) store.push(nr);
            else smaa[k.fase] = (smaa[k.fase] || 0) + k.n;
        });
        if (store.length < 2) return;
        /* Mens det er en emulsion, er det draaberne, der stiger */
        for (var fs in smaa) if (smaa[fs] > 0.15 * faseN[fs]) return;
        var info = {};
        store.forEach(function (nr) { info[nr] = { lav: -1, hoej: -1, sumY: 0, n: 0, naboer: {} }; });
        for (var s = 0; s < S; s++) {
            if (pl[s] < 0) continue;
            var f = info[id[s]];
            if (!f) continue;
            var y = this.py(s);
            f.sumY += y;
            f.n++;
            if (f.lav < 0 || y < this.py(f.lav)) f.lav = s;
            if (f.hoej < 0 || y > this.py(f.hoej)) f.hoej = s;
            for (var d = 0; d < 6; d++) {
                var m = this.NB[s * 6 + d];
                if (m >= 0 && pl[m] >= 0 && id[m] !== id[s] && info[id[m]]) f.naboer[id[m]] = true;
            }
        }
        store.forEach(function (a) {
            Object.keys(info[a].naboer).forEach(function (bs) {
                var b = Number(bs), A = mig.komps[a], B = mig.komps[b];
                if (A.fase === B.fase || A.rho >= B.rho) return;
                var fa = info[a], fb = info[b];
                if (fa.sumY / fa.n <= fb.sumY / fb.n) return;          /* vendt: klares af draaberne */
                if (mig.py(fa.lav) >= mig.py(fb.hoej) - 0.1) return;   /* allerede fladt */
                mig.bytLangt(fa.lav, fb.hoej, b, a);
            });
        });
    };

    /* To kugler bytter plads over en afstand og glider hen i jaevn fart */
    P.bytLangt = function (k, j, idK, idJ) {
        this.byt(k, j);
        this.kompId[k] = idK;
        this.kompId[j] = idJ;
        var a = this.kugler[this.plads[k]], b = this.kugler[this.plads[j]];
        a.vej = [{ x: this.px(k), y: this.py(k) }];
        b.vej = [{ x: this.px(j), y: this.py(j) }];
    };

    /* Flytter en klump én raekke op (1) eller ned (-1), skraat mod venstre
       eller hoejre. Det, der er i vejen, glider uden om og ind paa de
       pladser, klumpen forlader. */
    P.blandet = function (liste) {
        return this.tilf() < 0.5 ? liste : liste.slice().reverse();
    };

    P.flytKlump = function (liste, dirs, nr) {
        var mig = this, pl = this.plads, NB = this.NB;
        for (var v = 0; v < dirs.length; v++) {
            var d = dirs[v], maal = [], ok = true, i;
            var iKlump = {};
            for (i = 0; i < liste.length; i++) iKlump[liste[i]] = true;
            for (i = 0; i < liste.length; i++) {
                var t = NB[liste[i] * 6 + d];
                if (t < 0 || this.boble[t] || (!iKlump[t] && pl[t] < 0)) { ok = false; break; }
                maal.push(t);
            }
            if (!ok) continue;
            var iMaal = {};
            maal.forEach(function (t) { iMaal[t] = true; });
            var fortrengt = maal.filter(function (t) { return !iKlump[t]; });
            var forladt = liste.filter(function (k) { return !iMaal[k]; });
            if (fortrengt.length !== forladt.length) continue;
            /* Sidelaens parres efter hoejde, ellers efter x */
            var vandret = d < 2;
            var noegle = vandret ? function (k) { return mig.py(k); } : function (k) { return mig.px(k); };
            fortrengt.sort(function (a, b) { return noegle(a) - noegle(b); });
            forladt.sort(function (a, b) { return noegle(a) - noegle(b); });

            var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
            liste.forEach(function (k) {
                var x = mig.px(k), y = mig.py(k);
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            });
            var kugleK = liste.map(function (k) { return pl[k]; });
            var kugleF = fortrengt.map(function (k) { return pl[k]; });
            liste.forEach(function (k) { mig.fjern(k); });
            fortrengt.forEach(function (k) { mig.fjern(k); });
            for (i = 0; i < liste.length; i++) { this.saet(kugleK[i], maal[i]); this.kompId[maal[i]] = nr; }
            for (i = 0; i < fortrengt.length; i++) {
                var b = kugleF[i], til = forladt[i], kugle = this.kugler[b];
                this.saet(b, til);
                this.kompId[til] = -1;
                /* Uden om klumpen, paa den side der er naermest */
                if (vandret) {
                    var sy = kugle.y - minY < maxY - kugle.y ? minY - 0.8 : maxY + 0.8;
                    sy = Math.max(0.5, sy);
                    kugle.vej = [{ x: kugle.x, y: sy }, { x: this.px(til), y: sy }];
                } else {
                    var sx = kugle.x - minX < maxX - kugle.x ? minX - 0.9 : maxX + 0.9;
                    sx = klamp(sx, 0.5, this.bredde - 0.5);
                    kugle.vej = [{ x: sx, y: kugle.y }, { x: sx, y: this.py(til) }];
                }
            }
            return true;
        }
        return false;
    };

    /* ----- 3. Overfladen ------------------------------------------------ */

    /* Huller under overfladen fyldes med kugler fra den oeverste raekke */
    P.jaevn = function () {
        var top = this.top(), C = this.C;
        for (var r = 0; r < top; r++) {
            var bobler = 0, c;
            for (c = 0; c < C; c++) if (this.boble[r * C + c]) bobler++;
            if (this.raekkeAntal[r] + bobler >= C) continue;
            for (c = 0; c < C && r < top; c++) {
                var e = r * C + c;
                if (this.plads[e] >= 0 || this.boble[e]) continue;
                var k = this.tilfaeldigIRaekke(top);
                if (k < 0) break;
                this.flyt(k, e);
                top = this.top();
            }
        }
    };

    P.tilfaeldigIRaekke = function (r) {
        var C = this.C, start = (this.tilf() * C) | 0;
        for (var i = 0; i < C; i++) {
            var k = r * C + (start + i) % C;
            if (this.plads[k] >= 0) return k;
        }
        return -1;
    };

    P.fordamp = function (dt) {
        var D = this.D, mig = this, pl = this.plads;
        var p = D.STOFFER.map(function (s) { return D.damptryk(s, mig.T); });
        if (!p.some(function (x) { return x > 0.004; })) return;
        for (var k = 0; k < pl.length; k++) {
            var b = pl[k];
            if (b < 0) continue;
            var kugle = this.kugler[b], pa = p[kugle.art];
            if (!pa) continue;
            if (this.frit(k)) {
                if (this.tilf() < PARAM.fordamp * pa * dt) {
                    this.fjern(k);
                    kugle.tilst = DAMP;
                    kugle.vx = (this.tilf() - 0.5) * 2;
                    kugle.vy = 2 + this.tilf() * 2;
                }
            } else if (pa > 1 && this.tilf() < PARAM.kog * (pa - 1) * dt) {
                /* En boble: kuglen bliver til damp inde i vaesken */
                this.fjern(k);
                this.boble[k] = 1;
                kugle.k = k;
                kugle.tilst = BOBLE;
                this.bobler.push({ b: b, ur: PARAM.bobleTrin });
            }
        }
    };

    /* Er der fri luft over pladsen? */
    P.frit = function (k) {
        if (this.raekke(k) === this.R - 1) return true;
        var o = k * 6;
        for (var d = 2; d < 4; d++) {
            var m = this.NB[o + d];
            if (m >= 0 && this.plads[m] < 0 && !this.boble[m]) return true;
        }
        return false;
    };

    P.stigBobler = function (dt) {
        var mig = this, NB = this.NB;
        this.bobler = this.bobler.filter(function (bo) {
            var kugle = mig.kugler[bo.b];
            if (!kugle || kugle.tilst !== BOBLE) return false;
            bo.ur -= dt;
            while (bo.ur <= 0) {
                bo.ur += PARAM.bobleTrin;
                var k = kugle.k, over = [];
                for (var d = 2; d < 4; d++) {
                    var m = NB[k * 6 + d];
                    if (m >= 0 && mig.plads[m] >= 0) over.push(m);
                }
                if (!over.length) {
                    /* Boblen naar overfladen og brister */
                    mig.boble[k] = 0;
                    kugle.k = -1;
                    kugle.tilst = DAMP;
                    kugle.vx = (mig.tilf() - 0.5) * 3;
                    kugle.vy = 4 + mig.tilf() * 2;
                    return false;
                }
                var u = over[(mig.tilf() * over.length) | 0];
                var b = mig.fjern(u);
                mig.saet(b, k);
                mig.kompId[k] = mig.kompId[u];
                mig.kompId[u] = -1;
                mig.boble[k] = 0;
                mig.boble[u] = 1;
                kugle.k = u;
            }
            return true;
        });
    };

    /* Straalen: kuglerne falder ned oppefra, midt i bassinet */
    P.haeldStraale = function (dt) {
        var h = this.haeld[0];
        if (!h) return;
        h.ur += dt * PARAM.haeldFart;
        while (h.ur >= 1 && h.rest > 0) {
            h.ur -= 1;
            h.rest--;
            var x = this.bredde / 2 + (this.tilf() - 0.5) * 0.8;
            var b = this.nyKugle(h.art, FALD, x, this.hoejde + 1 + this.tilf() * 0.6);
            this.kugler[b].vy = -9;
        }
        if (h.rest <= 0) this.haeld.shift();
    };

    /* Frie kugler: straalen, damp, draaber, spild og det, der loeber ud */
    P.fri = function (dt) {
        var i, n = this.kugler.length;
        for (i = 0; i < n; i++) {
            var k = this.kugler[i];
            if (k.tilst === FALD) {
                k.vy -= 30 * dt;
                k.y += k.vy * dt;
                k.x += k.vx * dt;
                if (k.y <= this.overflade() + 0.3) this.lodNed(i, true);
            } else if (k.tilst === DRAABE) {
                k.vy -= 18 * dt;
                k.y += k.vy * dt;
                if (k.y <= this.overflade() + 0.3) this.lodNed(i, false);
            } else if (k.tilst === DAMP) {
                k.vx += (this.tilf() - 0.5) * 30 * dt;
                k.vy += (2.5 - k.vy) * 1.5 * dt + (this.tilf() - 0.5) * 20 * dt;
                k.vx *= Math.exp(-1.2 * dt);
                k.x += k.vx * dt;
                k.y += k.vy * dt;
                if (k.x < 0.5) { k.x = 0.5; k.vx = Math.abs(k.vx); }
                if (k.x > this.bredde - 0.5) { k.x = this.bredde - 0.5; k.vx = -Math.abs(k.vx); }
                var loft = this.hoejde - 0.5;
                if (k.y > loft) { k.y = loft; k.vy = -Math.abs(k.vy) * 0.3; }
                var bund = this.overflade() + 0.2;
                if (k.y < bund) { k.y = bund; k.vy = Math.abs(k.vy); }
                /* I den kolde zone bliver dampen til draaber, og under
                   kogepunktet ogsaa undervejs */
                var kold = k.y > this.koelFra ? 3 : 0;
                var under = Math.max(0, 1 - this.D.damptryk(this.D.STOFFER[k.art], this.T));
                if (this.tilf() < (kold + 1.5 * under) * dt) {
                    k.tilst = DRAABE;
                    k.vy = 0;
                    k.vx = 0;
                }
            } else if (k.tilst === SPILD) {
                k.vy -= 20 * dt;
                k.x += k.vx * dt;
                k.y += k.vy * dt;
                k.alfa -= dt * 0.9;
            } else if (k.tilst === AFLOEB) {
                k.vy -= 25 * dt;
                k.y += k.vy * dt;
                if (k.y < 0) k.alfa -= dt * 4;
            }
        }
    };

    /* En kugle rammer overfladen. Straalen trykker den et stykke ned i
       vaesken; en draabe lander bare i overfladen. */
    P.lodNed = function (b, dybt) {
        var kugle = this.kugler[b], top = this.top(), C = this.C;
        kugle.tilst = VAESKE;
        kugle.vx = 0;
        kugle.vy = 0;
        var r, c;
        if (top < 0) {
            r = 0;
        } else if (dybt) {
            var d = Math.floor(Math.pow(this.tilf(), 1.4) * Math.min(top + 1, PARAM.dybde));
            r = Math.max(0, top - d);
        } else {
            r = this.raekkeAntal[top] >= C ? top + 1 : top;
        }
        var spred = dybt ? 1 + 0.45 * (top - r) : 3;
        var gauss = (this.tilf() + this.tilf() + this.tilf() - 1.5) * 1.4;
        c = klamp(Math.round(kugle.x - 0.5 - (r % 2 ? 0.5 : 0) + gauss * spred), 0, C - 1);
        if (r >= this.R) { this.spild(b); return; }
        this.skubInd(b, r * C + c);
    };

    /* Saetter kuglen paa pladsen og skubber det, der stod der, en raekke
       op, indtil der er en tom plads. Naar bassinet er fuldt, loeber det,
       der skubbes over kanten, ud. */
    P.skubInd = function (b, k) {
        var cur = b, s = k, vej = 0;
        while (cur >= 0 && vej < 60) {
            vej++;
            if (this.boble[s]) {
                var alt = this.NB[s * 6 + (this.tilf() < 0.5 ? 2 : 3)];
                if (alt < 0) break;
                s = alt;
                continue;
            }
            var foer = this.plads[s];
            if (foer >= 0) this.fjern(s);
            this.saet(cur, s);
            this.kompId[s] = -1;
            cur = foer;
            if (cur < 0) return;
            var op = [], o = s * 6;
            for (var d = 2; d < 4; d++) { var m = this.NB[o + d]; if (m >= 0) op.push(m); }
            if (!op.length) break;
            var tomme = op.filter(function (m) { return this.plads[m] < 0 && !this.boble[m]; }, this);
            s = tomme.length ? tomme[(this.tilf() * tomme.length) | 0] : op[(this.tilf() * op.length) | 0];
        }
        /* Oeverst i bassinet: er der stadig en tom plads, glider kuglen
           derhen. Ellers loeber den over. */
        var ledig = this.naermesteLedige(cur);
        if (ledig >= 0) { this.saet(cur, ledig); this.kompId[ledig] = -1; }
        else this.spild(cur);
    };

    /* Den tomme plads (ikke en boble), der ligger naermest kuglen */
    P.naermesteLedige = function (b) {
        var kugle = this.kugler[b], bedst = -1, afst = 1e9;
        for (var k = 0; k < this.plads.length; k++) {
            if (this.plads[k] >= 0 || this.boble[k] || !this.baaret(k)) continue;
            var dx = this.px(k) - kugle.x, dy = this.py(k) - kugle.y, a2 = dx * dx + dy * dy;
            if (a2 < afst) { afst = a2; bedst = k; }
        }
        return bedst;
    };

    P.spild = function (b) {
        var kugle = this.kugler[b];
        if (kugle.k >= 0) this.fjern(kugle.k);
        kugle.tilst = SPILD;
        kugle.vx = (kugle.x < this.bredde / 2 ? -1 : 1) * (3 + this.tilf() * 3);
        kugle.vy = 3 + this.tilf() * 2;
        kugle.y = Math.max(kugle.y, this.fyldHoejde - 0.5);
        kugle.vej = null;
        this.spildt++;
    };

    /* ----- 4. Rystningen ------------------------------------------------ */

    P.rystBytte = function (dt) {
        var liste = [], i;
        for (i = 0; i < this.plads.length; i++) if (this.plads[i] >= 0) liste.push(i);
        if (liste.length < 2) return;
        var n = Math.round(liste.length * PARAM.rystFart * this.rystStyrke * dt);
        var C = this.C, R = this.R;
        for (i = 0; i < n; i++) {
            var k = liste[(this.tilf() * liste.length) | 0];
            var r = this.raekke(k), c = k - r * C;
            var r2 = r + Math.round((this.tilf() - 0.5) * 14), c2 = c + Math.round((this.tilf() - 0.5) * 16);
            if (r2 < 0 || r2 >= R || c2 < 0 || c2 >= C) continue;
            var j = r2 * C + c2;
            if (j === k || this.plads[j] < 0 || this.plads[k] < 0) continue;
            this.byt(k, j);
        }
    };

    /* ----- Kuglerne glider paa plads ------------------------------------ */

    P.glid = function (dt) {
        var f = 1 - Math.exp(-PARAM.glid * dt);
        for (var i = 0; i < this.kugler.length; i++) {
            var k = this.kugler[i];
            if (k.tilst !== VAESKE && k.tilst !== BOBLE) continue;
            if (k.k < 0) continue;
            var tx = this.px(k.k), ty = this.py(k.k);
            if (k.vej && k.vej.length) {
                var w = k.vej[0], dx = w.x - k.x, dy = w.y - k.y, l = Math.sqrt(dx * dx + dy * dy);
                var trin = 16 * dt;
                if (l <= trin) { k.x = w.x; k.y = w.y; k.vej.shift(); if (!k.vej.length) k.vej = null; }
                else { k.x += dx / l * trin; k.y += dy / l * trin; }
                continue;
            }
            k.x += (tx - k.x) * f;
            k.y += (ty - k.y) * f;
        }
    };

    /* ----- Til opgaverne og det lille glas -------------------------------- */

    /* Hvad ser oejet? Lagene nedefra og op, og om det er uklart.
         lag       [{ fase, stoffer: [art...], fra, til, n }] nedefra
         faser     antal faser med vaeske i
         uklart    en del af den mindste fase er spredt ud i smaa draaber
         svaever   en stor klump ligger midt i en anden fase uden at roere
                   bunden, overfladen eller sit eget lag */
    P.analyse = function () {
        this.maerk();
        var mig = this, komps = this.komps, i;
        var faseN = {}, total = 0;
        komps.forEach(function (k) { faseN[k.fase] = (faseN[k.fase] || 0) + k.n; total += k.n; });
        var faser = Object.keys(faseN).map(Number);
        var ud = { faser: faser.length, lag: [], uklart: false, svaever: false, n: total, antal: [] };
        for (i = 0; i < this.nStof; i++) ud.antal[i] = 0;
        komps.forEach(function (k) { for (var a = 0; a < mig.nStof; a++) ud.antal[a] += k.antal[a]; });
        if (!total) return ud;

        /* Store klumper er lag; smaa er draaber */
        var store = komps.filter(function (k) { return k.n >= Math.max(24, faseN[k.fase] * 0.25); });
        var smaa = {};
        komps.forEach(function (k) { if (store.indexOf(k) < 0) smaa[k.fase] = (smaa[k.fase] || 0) + k.n; });
        faser.forEach(function (f) {
            if (faseN[f] >= 12 && (smaa[f] || 0) > 0.2 * faseN[f]) ud.uklart = true;
        });

        store.sort(function (a, b) { return (a.minR + a.maxR) - (b.minR + b.maxR); });
        store.forEach(function (k) {
            var stoffer = [];
            for (var a = 0; a < mig.nStof; a++) if (k.antal[a] >= 3) stoffer.push(a);
            var bred = k.maxR - k.minR + 1;
            var midt = k.minR > 0 && !k.overflade && k.n < mig.C * bred * 0.6;
            if (midt) ud.svaever = true;
            ud.lag.push({ fase: k.fase, stoffer: stoffer, fra: k.minR, til: k.maxR, n: k.n, rho: k.rho, svaever: midt });
        });
        return ud;
    };

    /* Antal kugler af hvert stof i vaesken, dampen og straalen */
    P.opgoer = function () {
        var ud = { vaeske: [], damp: [], alt: [] }, i;
        for (i = 0; i < this.nStof; i++) { ud.vaeske[i] = 0; ud.damp[i] = 0; ud.alt[i] = 0; }
        this.kugler.forEach(function (k) {
            if (k.tilst === SPILD || k.tilst === AFLOEB) return;
            if (k.tilst === VAESKE) ud.vaeske[k.art]++;
            else if (k.tilst === DAMP || k.tilst === DRAABE || k.tilst === BOBLE) ud.damp[k.art]++;
            ud.alt[k.art]++;
        });
        return ud;
    };

    /* Andelen af naboer i en anden fase: 0 inde i et lag, hoej i en emulsion */
    P.uklarhed = function (k) {
        var b = this.plads[k];
        if (b < 0) return 0;
        var f = this.fase[this.kugler[b].art], fremmed = 0, alle = 0;
        for (var d = 0; d < 6; d++) {
            var m = this.NB[k * 6 + d];
            if (m < 0 || this.plads[m] < 0) continue;
            alle++;
            if (this.fase[this.kugler[this.plads[m]].art] !== f) fremmed++;
        }
        return alle ? fremmed / alle : 0;
    };

    NK.Model = Model;
}());
