/* =====================================================================
   sim_lys.js - fane 1: Lyset

   Lampen sender lys med én bølgelængde gennem kuvetten til detektoren.
   Fotonerne er prikker; hver foton, der naar vaesken, bliver absorberet
   med sandsynligheden 1 − T, og dybden traekkes efter I(x), saa de
   fleste absorberes tidligt (js/lb.js). Kurven over straalen viser,
   hvor meget lys der er tilbage gennem kuvetten, og tavlen under viser
   A = ε · l · c med tallene sat ind.

   Fanen har seks forudsigelser: eleven gaetter foerst, saa stilles
   kuvetten tilbage til start, og eleven proever det selv med − og + paa
   apparaterne eller ved at traekke i kuvettens hoejre side. Modellen er
   facit.

   Regelsaettet (21. nov. 2026):
     * Betjeningen sidder i scenen: − og + ved kuvettens etiket
       (koncentrationen) og ved kuvettebredden, Langsomt lys paa lampen og
       stofferne under detektoren, naar alle seks er proevet. Intet panel.
     * Den foerste forudsigelse er trinvis (som sc5.7): to rigtige
       spoergsmaal og saa gaettet. Kun lampen, straalen, kuvetten og
       detektoren er fremme fra start; kurven, T, A og tavlen har en
       stiplet plads og kommer frem, naar de bruges (fremme).
     * Klik-opfordringen (gul ramme og boble) staar kun, naar kortet beder
       om en handling, og kun ved det, der skal bruges (opfordring).
     * Rolige fotoner: 40 % af den gamle fart, ingen glimt.

   Faser: "trin" > "gaet" > "proev" > "slut".
   Paaskeaegget: klik paa detektoren, naar en forudsigelse er slut.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var LB = NK.LB;
    var Tg = NK.Tegn;

    var BRILLER_A = 0.30;

    function SimLys() {
        var mig = this;
        this.laerred = new NK.Laerred(NK.el("lys-laerred"));
        this.stof = D.STOFFER.mno4;
        this.c = 0.20;
        this.l = 1.00;
        this.fotoner = [];
        this.pust = [];
        this.spawnRest = 0;
        this.langsom = false;
        this.briller = false;
        this.auto = null;
        this.traek = null;
        this.trinvis = false;
        this.trinNr = 0;
        this.trinNaaet = 0;
        this.pool = [];
        for (var i = 0; i < 400; i++) this.pool.push({ u: Math.random(), v: Math.random() });

        this.startFane(D.FORUD, [{ id: "alle", titel: "" }]);

        NK.el("lys-c-ned").addEventListener("click", function () { mig.knapC(-1); });
        NK.el("lys-c-op").addEventListener("click", function () { mig.knapC(1); });
        NK.el("lys-l-ned").addEventListener("click", function () { mig.knapL(-1); });
        NK.el("lys-l-op").addEventListener("click", function () { mig.knapL(1); });

        var stofKnapper = document.querySelectorAll("#lys-stoffer .stof-knap");
        Array.prototype.forEach.call(stofKnapper, function (k) {
            k.addEventListener("click", function () { mig.vaelgStof(k.getAttribute("data-stof"), true); });
        });
        NK.el("lys-langsom").addEventListener("click", function () {
            mig.langsom = !mig.langsom;
            NK.el("lys-langsom").classList.toggle("til", mig.langsom);
            NK.el("lys-langsom").textContent = mig.langsom ? "Normal fart" : "Langsomt lys";
            mig.fotoner.forEach(function (p) { p.v = mig.fart(); });
        });

        var cv = this.laerred.canvas;
        cv.addEventListener("pointerdown", function (e) { mig.ned(e); });
        cv.addEventListener("pointermove", function (e) { mig.flyt(e); });
        cv.addEventListener("pointerup", function (e) { mig.op(e); });
        cv.addEventListener("pointercancel", function () { mig.traek = null; });

        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimLys.prototype;
    NK.Fane.paa(P, { navn: "lys", naesteFane: "fane-kurve", naesteNavn: "Standardkurven", naesteTekst: "Næste forudsigelse →",
        chipOrd: "Forudsigelse", gaetHint: true });

    /* ----- Modellen ----------------------------------------------------------------- */
    P.A = function () { return LB.A(this.stof.eps, this.l, this.c); };
    P.T = function () { return LB.T(this.A()); };
    P.Avis = function () { return this.A() + (this.briller ? BRILLER_A : 0); };
    P.forud = function () { return this.opgaver[this.nr]; };
    /* 40 % af den gamle fart (260-320 og 80-100 px/s), saa fotonerne er rolige */
    P.fart = function () { return this.langsom ? NK.r(32, 40) : NK.r(105, 128); };

    P.cTekst = function (c) { return NK.dk(c === undefined ? this.c : c, this.stof.cDec) + " mM"; };
    P.lTekst = function (l) { return NK.dk(l === undefined ? this.l : l, 2) + " cm"; };

    /* ----- Trinene og det, der er fremme --------------------------------------------- */
    /* Den foerste forudsigelse er trinvis, til den er loest. Start forfra
       giver trinene igen (regel 16). */
    P.faneVaelg = P.vaelg;
    P.vaelg = function (i) {
        this.trinvis = i === 0 && (!this.status[0].loest || !!this.forfraTrin);
        this.trinNr = 0;
        this.trinNaaet = 0;
        this.faneVaelg(i);
    };

    P.nulstil = function () {
        this.forfraTrin = true;
        this.vaelg(this.nr);
        this.forfraTrin = false;
    };

    /* Den hoejeste forudsigelse, eleven har naaet eller loest */
    P.hoejeste = function () {
        var h = this.nr, mig = this;
        this.status.forEach(function (s, i) { if (s.loest || (mig.naaet && mig.naaet[i])) h = Math.max(h, i); });
        return h;
    };

    /* Delene dukker op, naar de bruges (regel 13). Er forudsigelsen loest
       foer, er det, eleven har naaet, fremme fra start. */
    P.fremme = function (del) {
        var t = this.trinvis && this.nr === 0;
        if (del === "kurve") return !t || this.trinNaaet >= 1;
        if (del === "T") return !t || this.trinNaaet >= 2;
        if (del === "c") return !t || this.fase === "proev" || this.fase === "slut";
        if (del === "stof") return this.antalLoest() === this.opgaver.length;
        if (t) return false;
        var h = this.hoejeste();
        if (del === "A" || del === "tavle" || del === "langsom") return h >= 1;
        if (del === "l") return h >= 3;
        return true;
    };

    /* ----- Betjeningen paa apparaterne ----------------------------------------------- */
    P.saetC = function (v, afEleven) {
        var s = this.stof;
        /* Under gaettet og naar kortet viser Naeste, er kuvetten laast */
        if (afEleven && this.spaer()) return;
        this.c = NK.klamp(Math.round(v / s.cTrin) * s.cTrin, 0, s.cMax);
        if (afEleven) this.skruet();
    };

    P.saetL = function (v, afEleven) {
        if (afEleven && this.spaer()) return;
        this.l = NK.klamp(Math.round(v / D.L_TRIN) * D.L_TRIN, D.L_MIN, D.L_MAX);
        if (afEleven) this.skruet();
    };

    /* − og + ved kuvettens etiket: et klik er stoffets cKnap */
    P.knapC = function (retning) {
        if (this.auto || this.spaer()) return;
        var s = this.stof, ny = this.c + retning * s.cKnap;
        if (ny < -1e-9) { this.kortBesked("Koncentrationen kan ikke blive lavere end 0 mM.", 3); return; }
        if (ny > s.cMax + 1e-9) { this.kortBesked("Højere koncentration kan kuvetten ikke vise her: højst " + this.cTekst(s.cMax) + ".", 3); return; }
        this.saetC(ny, true);
    };

    /* − og + ved kuvettebredden: et klik er D.L_KNAP (0,50 cm) */
    P.knapL = function (retning) {
        if (this.auto || !this.styrVis("l") || this.spaer()) return;
        var ny = this.l + retning * D.L_KNAP;
        if (ny < D.L_MIN - 1e-9 || ny > D.L_MAX + 1e-9) {
            this.kortBesked("Kuvetten kan være fra " + this.lTekst(D.L_MIN) + " til " + this.lTekst(D.L_MAX) + " bred.", 3);
            return;
        }
        this.saetL(ny, true);
    };

    P.vaelgStof = function (id, afEleven) {
        var s = D.STOFFER[id];
        if (!s) return;
        var f = this.forud();
        if (afEleven && this.spaer()) return;
        if (afEleven && this.fase === "proev" && id !== f.start.stof) {
            this.kortBesked("Forudsigelsen handler om " + D.STOFFER[f.start.stof].navn + ". Vælg " + D.STOFFER[f.start.stof].formel + " igen for at prøve den.", 5);
        }
        this.stof = s;
        this.saetC(Math.min(this.c, s.cMax), false);
        var knapper = document.querySelectorAll("#lys-stoffer .stof-knap");
        Array.prototype.forEach.call(knapper, function (k) { k.classList.toggle("valgt", k.getAttribute("data-stof") === id); });
        this.fotoner = [];
        if (afEleven) this.skruet();
    };

    /* Eleven har skruet paa noget: Indsend svar bliver klar. Intet bliver
       bedoemt, foer eleven trykker Indsend svar. */
    P.skruet = function () {
        if (this.auto || this.fase !== "proev") return;
        this.proevet = true;
        this.nulstilHjaelp();
        if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.besked("", "");
        this.visIndsend();
    };

    P.sluppet = function () { this.visIndsend(); };

    /* Staar kuvetten, som forudsigelsen siger? */
    P.maalNaaet = function () {
        var f = this.forud(), m = f.maal, e = 1e-9;
        if (this.stof.id !== f.start.stof) return false;
        if (m.c && (this.c < m.c[0] - e || this.c > m.c[1] + e)) return false;
        if (m.l && (this.l < m.l[0] - e || this.l > m.l[1] + e)) return false;
        if (m.A) {
            var A = this.A();
            if (A < m.A[0] || A > m.A[1]) return false;
        }
        return true;
    };

    /* Klik-opfordringen (regel 19-21): kun naar kortet beder eleven proeve
       det, og kun ved den knap, der skal bruges nu. Boblen forsvinder, naar
       kuvetten staar, som forudsigelsen siger. */
    P.opfordring = function () {
        if (this.fase !== "proev" || this.auto || this.slutNu()) return null;
        var f = this.forud(), m = f.maal, e = 1e-9, s = this.stof;
        if (s.id !== f.start.stof) return { id: "lys-stoffer", tekst: "Klik: " + D.STOFFER[f.start.stof].formel, side: "venstre" };
        var mere = { id: "lys-c-op", tekst: "Klik: mere " + s.navn, side: "hoejre" };
        var mindre = { id: "lys-c-ned", tekst: "Klik: fortynd", side: "venstre" };
        if (m.c) {
            if (this.c > m.c[1] + e) return mindre;
            if (this.c < m.c[0] - e) return mere;
        }
        if (m.l) {
            if (this.l < m.l[0] - e) return { id: "lys-l-op", tekst: "Klik: bredere kuvette", side: "hoejre" };
            if (this.l > m.l[1] + e) return { id: "lys-l-ned", tekst: "Klik: smallere kuvette", side: "venstre" };
        }
        if (m.A) {
            var A = this.A();
            if (A < m.A[0]) return mere;
            if (A > m.A[1]) return mindre;
        }
        return null;
    };

    /* ----- Forudsigelsen ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        this.fase = this.trinvis && i === 0 ? "trin" : "gaet";
        this.valgt = null;
        this.auto = null;
        this.proevet = false;
        this.briller = false;
        this.tilStart();
    };

    P.tilStart = function () {
        var s = this.forud().start;
        this.vaelgStof(s.stof, false);
        this.saetL(s.l, false);
        this.saetC(s.c, false);
        this.fotoner = [];
        this.pust = [];
    };

    /* ----- Papirkortet ---------------------------------------------------------- */
    P.svarListe = function () {
        return this.forud().valg.map(function (v) { return { t: v.t, n: v.n }; });
    };

    P.trinNu = function () { return this.forud().trin[this.trinNr]; };

    function rigtigIndeks(liste) {
        for (var k = 0; k < liste.length; k++) if (liste[k].ok) return k;
        return 0;
    }

    P.kortData = function () {
        var f = this.forud(), n = f.trin ? f.trin.length + 1 : 0;
        if (this.fase === "trin") {
            var t = this.trinNu();
            return { tekst: t.tekst, svar: t.svar.map(function (v) { return { t: v.t }; }), trinTekst: "Trin " + (this.trinNr + 1) + " af " + n };
        }
        if (this.fase === "gaet") {
            return { gaet: true, tekst: f.spm, svar: this.svarListe(), trinTekst: this.trinvis ? "Trin " + n + " af " + n : "" };
        }
        if (this.fase === "slut") return { tekst: f.spm, svar: this.svarListe() };
        /* Gaettet staar i linjen nederst ("Dit gæt"); handlingen staar
           halvfedt paa sin egen linje (regel 5-6) */
        var goer = f.handling.replace(/^Prøv det: /, "");
        return { tekst: "Prøv det selv. <span class=\"sk-spm sk-linje\">" + NK.html(goer) + "</span>", html: true,
            trinTekst: this.trinvis ? "Trin " + n + " af " + n : "" };
    };

    /* Et svar paa et trin: rigtigt giver det naeste i scenen, forkert faar
       sin egen forklaring */
    P.svarValgt = function (j) {
        if (this.fase !== "trin") return;
        var t = this.trinNu();
        if (j === rigtigIndeks(t.svar)) { this.trinRigtigt(); return; }
        this.forkertValg(j, NK.html(t.svar[j].hvorfor));
    };

    P.trinRigtigt = function () {
        var mig = this, t = this.trinNu(), k = rigtigIndeks(t.svar);
        this.valgt = k;
        this.trinNaaet = this.trinNr + 1;
        this.mellem(NK.html(t.ros), function () {
            mig.trinNr++;
            if (mig.trinNr >= mig.forud().trin.length) mig.fase = "gaet";
        }, k);
    };

    P.gaetValg = function (j) { this.vaelgSvar(j); };

    P.kanIndsende = function () { return this.fase === "proev" && this.proevet && !this.auto; };

    /* Indsend svar: staar kuvetten, som forudsigelsen siger? */
    P.indsend = function () {
        if (this.fase !== "proev") return;
        if (this.maalNaaet()) { this.dom(false); return; }
        var f = this.forud();
        if (this.stof.id !== f.start.stof) {
            this.fejlLinje("Forudsigelsen handler om " + NK.html(D.STOFFER[f.start.stof].navn) + ". Vælg " + NK.html(D.STOFFER[f.start.stof].formel) + " under detektoren.");
            return;
        }
        var goer = f.handling.replace(/^Prøv det: /, "");
        goer = goer.charAt(0).toUpperCase() + goer.slice(1);
        this.fejlLinje(NK.html("Med c = " + this.cTekst() + " og l = " + this.lTekst() + " passer kuvetten ikke med opgaven. " + goer));
    };

    P.vaelgSvar = function (j) {
        if (this.fase !== "gaet") return;
        this.valgt = j;
        this.fase = "proev";
        this.proevet = false;
        this.tilStart();
        this.hjaelp = 0;
        this.hintLys = null;
        this.visHintLys();
        this.naesteLinje('<span class="b-maerke">Dit gæt</span> ' + NK.html(this.forud().valg[j].t), "");
    };

    /* Det, detektoren viser, som en saetning */
    P.resultatTekst = function () {
        var f = this.forud(), A = this.A();
        if (f.id === "vand") return "Detektoren viser T = 100 %.";
        if (f.facit.T !== undefined) return "Detektoren viser T = " + NK.procent(LB.T(A)) + " og A = " + NK.dk(A, 3) + ".";
        return "Detektoren viser A = " + NK.dk(A, 3) + ".";
    };

    /* Kortet bliver paa forudsigelsen: det rigtige svar groent, et forkert
       gaet roedt, og forklaringen under */
    P.dom = function (vist) {
        var f = this.forud(), v = f.valg[this.valgt], rigtig = rigtigIndeks(f.valg);
        this.fase = "slut";
        this.gaetForkert = !v.ok && !vist ? this.valgt : undefined;
        var tekst = this.resultatTekst() + " " + f.forklaring;
        this.loest(vist ? "svar" : (v.ok ? "ok" : "gaet"), NK.html(tekst), vist ? "Svaret" : (v.ok ? "Rigtigt" : "Prøvet"), rigtig);
    };

    /* Scenen er laast, mens kortet stiller et spoergsmaal (regel 15) */
    P.spaerFane = P.spaer;
    P.spaer = function () {
        if (this.fase === "trin" && !this.slutNu()) { this.kortBlink(); return true; }
        return this.spaerFane();
    };

    /* ----- Hint og svar ------------------------------------------------------------------- */
    P.hintTrin = function () {
        var f = this.forud();
        if (this.fase === "trin") return { trin: this.trinNu().hint.map(NK.html), lys: null };
        if (this.fase === "gaet") return { trin: f.hint.map(NK.html), lys: null };
        if (this.fase !== "proev") return null;
        var m = f.maal, trin, lys;
        if (this.stof.id !== f.start.stof) {
            return { trin: ["Forudsigelsen handler om " + D.STOFFER[f.start.stof].navn + ". Vælg " + D.STOFFER[f.start.stof].formel + " under detektoren."], lys: "stof" };
        }
        if (m.A) {
            trin = ["Se på A i displayet under detektoren, mens du ændrer koncentrationen.",
                "Klik på + ved kuvettens etiket. A vokser, når koncentrationen vokser.",
                "Ved l = " + this.lTekst() + " giver c = " + this.cTekst(this.maalC()) + " en absorbans tæt på 1,00."];
            lys = "c";
        } else if (m.c && m.l) {
            trin = [NK.html(f.handling),
                "Koncentrationen ændres med − og + ved kuvettens etiket og bredden med − og + ved l under kuvetten.",
                "c skal være " + this.cTekst(this.maalC()) + ", og l skal være " + this.lTekst(this.maalL()) + "."];
            lys = "begge";
        } else if (m.l) {
            trin = [NK.html(f.handling),
                "Klik på + ved l under kuvetten, eller træk i grebet på kuvettens højre side.",
                "l skal være " + this.lTekst(this.maalL()) + "."];
            lys = "l";
        } else {
            trin = [NK.html(f.handling),
                "− og + sidder ved kuvettens etiket.",
                "c skal være " + this.cTekst(this.maalC()) + "."];
            lys = "c";
        }
        return { trin: trin, lys: lys };
    };

    /* Den koncentration, Vis svaret og hintet stiller paa. For A = 1 er det
       et tal, knapperne kan naa. */
    P.maalC = function () {
        var f = this.forud(), m = f.maal, s = this.stof;
        if (m.c) return (m.c[0] + m.c[1]) / 2;
        if (m.A) {
            var raa = 1 / (s.eps * this.l), bedst = null;
            var kand = [Math.floor(raa / s.cKnap) * s.cKnap, Math.ceil(raa / s.cKnap) * s.cKnap, Math.round(raa / s.cTrin) * s.cTrin];
            for (var k = 0; k < kand.length; k++) {
                var c = Math.round(kand[k] / s.cTrin) * s.cTrin, A2 = LB.A(s.eps, this.l, c);
                if (c >= 0 && c <= s.cMax && A2 >= m.A[0] && A2 <= m.A[1]) { bedst = c; break; }
            }
            return bedst === null ? NK.klamp(Math.round(raa / s.cTrin) * s.cTrin, 0, s.cMax) : bedst;
        }
        return this.c;
    };

    P.maalL = function () {
        var m = this.forud().maal;
        return m.l ? (m.l[0] + m.l[1]) / 2 : this.l;
    };

    P.visHintLys = function () {};

    P.visSvar = function () {
        var f = this.forud();
        if (this.fase === "trin") { this.trinRigtigt(); return; }
        if (this.fase === "gaet") {
            this.valgt = rigtigIndeks(f.valg);
            this.fase = "proev";
            this.tilStart();
            this.visKort();
            this.svarVist = true;
        } else {
            this.svarVist = false;
        }
        if (this.stof.id !== f.start.stof) this.vaelgStof(f.start.stof, false);
        /* Kuvetten glider hen til maalet, og saa kommer svaret */
        this.auto = { t: 0, c0: this.c, l0: this.l, c1: this.maalC(), l1: this.maalL() };
        this.besked("Se detektoren …", "hint");
        this.visKnap();
    };

    /* ----- Geometrien paa laerredet ----------------------------------------------------- */
    P.tilpas = function () {
        this.laerred.tilpas();
    };

    /* Runde 2 (21. nov. 2026, regel 32): optikbaenken har en stoerste bredde
       og staar samlet i midten; alt staar taet under kortet, og den ekstra
       plads goer apparaterne stoerre. Regnestykket for A staar paa et lille
       lyst papir under detektorens display. */
    var BAENK_MAKS = 1160;

    P.geo = function () {
        var W = this.laerred.b, H = this.laerred.h, pad = 14;
        var g = { W: W, H: H, pad: pad };
        g.bw = Math.min(W - 2 * pad, BAENK_MAKS);
        g.bx0 = Math.round((W - g.bw) / 2);
        g.bx1 = g.bx0 + g.bw;
        g.px = NK.klamp(g.bw / 70, 13, 17);
        g.dpx = NK.klamp(g.px * 1.08, 14, 18);
        g.dispH = 2 * g.dpx * 1.45 + g.dpx * 0.7;
        g.formH = Math.round(g.px * 3.9);      /* Lambert-Beers lov oeverst (regel 37) */
        g.underH = g.px * 5.3;                 /* maalet, l og etiketten under kuvetten */
        g.formY = 6;
        g.kTop = g.formY + g.formH + 34;
        /* Kurven og kuvetten deler hoejden og vokser paa en stor skaerm, til
           de fylder den lodrette plads (runde 3); kuvetten bliver hoejst 1,9
           gange saa hoej som bred ved 1 cm, og den, der er tilbage, fordeles
           over og under baenken */
        var hoejre = function (cuvH) { return cuvH * 0.98 + 22 + g.dispH; };   /* fra kuvettens top til displayets bund */
        var bund0 = function () { return g.kTop + g.kH + 26 + Math.max(hoejre(g.cuvH), g.cuvH + g.underH); };
        var pxCm0 = NK.klamp((g.bw - NK.klamp(g.bw * 0.095, 64, 116) - NK.klamp(g.bw * 0.105, 100, 132) - 140) / 3.15, 40, 120);
        g.kH = NK.klamp(H * 0.3, 80, 260);
        g.cuvH = NK.klamp(Math.min(g.bw * 0.22, pxCm0 * 1.9), 76, 240);
        for (var n = 0; n < 300; n++) {
            if (bund0() <= H - 8) break;
            if (g.cuvH > 96 || (g.kH <= 80 && g.cuvH > 76)) g.cuvH -= 2;
            else if (g.kH > 80) g.kH = Math.max(80, g.kH - 2);
            else break;
        }
        /* Er der plads tilbage, bliver kurven og kuvetten stoerre (ikke
           afstandene) */
        for (n = 0; n < 400 && H - 8 - bund0() > 3; n++) {
            var vokset = false;
            if (g.kH < 300) { g.kH += 2; vokset = true; }
            if (H - 8 - bund0() > 3 && g.cuvH < Math.min(260, pxCm0 * 2.2)) { g.cuvH += 1; vokset = true; }
            if (!vokset) break;
        }
        /* Loven bliver staaende lige under kortet; det lille, der er tilbage,
           staar under baenken */
        g.kBund = g.kTop + g.kH;
        g.ct = g.kBund + 26;
        g.yc = Math.round(g.ct + g.cuvH * 0.58);
        g.lb = NK.klamp(g.bw * 0.095, 64, 116);
        g.lh = NK.klamp(g.cuvH * 0.7, 56, 170);
        g.detB = NK.klamp(g.bw * 0.105, 100, 132);
        g.detH = NK.klamp(g.cuvH * 0.72, 64, 170);
        g.lx = g.bx0;
        g.ly = g.yc - g.lh / 2;
        g.dx = g.bx1 - g.detB;
        g.dy = g.yc - g.detH / 2;
        g.x0 = g.lx + g.lb;
        g.x1 = g.dx;
        g.cx = (g.x0 + g.x1) / 2;
        g.pxCm = NK.klamp((g.x1 - g.x0 - 140) / 3.15, 40, 120);
        g.beamH = NK.klamp(g.cuvH * 0.3, 26, 52);
        g.cb = this.l * g.pxCm;
        g.cl = g.cx - g.cb / 2;
        g.cr = g.cx + g.cb / 2;
        g.cbund = g.ct + g.cuvH;
        g.vt = g.ct + g.cuvH * 0.12;          /* vaeskens overflade */
        g.dispY = g.dy + g.detH + 12;
        /* Maalpilen, l-linjen og etiketten under kuvetten */
        g.pilY = g.cbund + g.px * 0.85;
        g.lY = g.cbund + g.px * 2.15;
        g.tagY = g.cbund + g.px * 3.15;
        return g;
    };

    /* Betjeningen er kun fremme, naar kortet siger "Prøv det", og kun det,
       forudsigelsen skal bruge (regel 19a, runde 2). Under et spoergsmaal,
       et trin eller et gaet er scenen uden knapper. */
    P.styrVis = function (hvad) {
        if (this.fase !== "proev") return false;
        var m = this.forud().maal;
        if (hvad === "c") return this.fremme("c") && !!(m.c || m.A);
        if (hvad === "l") return this.fremme("l") && !!(m.l || m.A);
        if (hvad === "langsom") return this.fremme("langsom");
        if (hvad === "stof") return this.fremme("stof");
        return false;
    };

    /* ----- Musen: traek i kuvettens hoejre side, klik paa udstyret ----------------------- */
    P.hvad = function (p) {
        var g = this.geo();
        if (this.styrVis("l") && Math.abs(p.x - g.cr) <= 12 && p.y >= g.ct - 4 && p.y <= g.cbund + 18) return "vaeg";
        if (p.x >= g.dx - 14 && p.x <= g.dx + g.detB && p.y >= g.dy && p.y <= g.dispY + 80) return "detektor";
        if (p.x >= g.cl && p.x <= g.cr && p.y >= g.ct && p.y <= g.cbund) return "kuvette";
        if (p.x >= g.lx && p.x <= g.x0 + 6 && p.y >= g.ly && p.y <= g.ly + g.lh + 24) return "lampe";
        if (this.fremme("kurve") && p.y >= g.kTop - 18 && p.y <= g.kBund && p.x >= g.x0 && p.x <= g.x1) return "kurve";
        return null;
    };

    P.ned = function (e) {
        var p = this.laerred.punkt(e);
        var h = this.hvad(p);
        this.traek = { hvad: h, x: p.x, y: p.y, flyttet: false };
        if (h === "vaeg" && (this.gaetNu() || this.slutNu() || this.fase === "trin")) { this.spaer(); this.traek = null; return; }
        if (h === "vaeg") {
            try { this.laerred.canvas.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            e.preventDefault();
        }
    };

    P.flyt = function (e) {
        var p = this.laerred.punkt(e);
        var t = this.traek;
        if (t && t.hvad === "vaeg") {
            if (this.auto) return;
            var g = this.geo();
            t.flyttet = true;
            var l = 2 * (p.x - g.cx) / g.pxCm;
            if (Math.abs(l - this.l) >= D.L_TRIN / 2) this.saetL(l, true);
            this.laerred.canvas.style.cursor = "ew-resize";
            return;
        }
        var h = this.hvad(p);
        this.laerred.canvas.style.cursor = h === "vaeg" ? "ew-resize" : (h ? "pointer" : "default");
    };

    P.op = function (e) {
        var t = this.traek;
        this.traek = null;
        if (!t) return;
        if (t.hvad === "vaeg") {
            try { this.laerred.canvas.releasePointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            if (t.flyttet) { this.sluppet(); return; }
        }
        this.klik(t.hvad);
    };

    P.klik = function (h) {
        var s = this.stof;
        if (!h) return;
        /* Paaskeaegget: naar forudsigelsen er slut */
        if (h === "detektor" && this.fase === "slut") {
            this.briller = !this.briller;
            this.fotoner = [];
            if (this.briller) {
                this.kortBesked("Detektoren har fået solbriller på. Nu viser den en absorbans, der er 0,30 for høj ved alle målinger, også ved rent vand. " +
                    "Derfor nulstiller man altid spektrofotometret med en blindprøve. Klik igen for at tage solbrillerne af.", 9);
            } else {
                this.kortBesked("Solbrillerne er taget af. Displayet viser igen kun den absorbans, der skyldes opløsningen i kuvetten.", 4);
            }
            return;
        }
        /* Mens kortet stiller et spoergsmaal, blinker kortet i stedet */
        if (this.fase === "trin" || this.gaetNu()) { this.spaer(); return; }
        if (h === "detektor") {
            this.kortBesked("Detektoren måler det lys, der slipper gennem kuvetten. Tallene står i displayet under detektoren.", 5);
        } else if (h === "kuvette" || h === "vaeg") {
            this.kortBesked("Kuvetten indeholder " + s.navn + " med koncentrationen " + this.cTekst() + ". Lysvejen gennem opløsningen er " + this.lTekst() + "." +
                (this.styrVis("l") ? " Træk i grebet på højre side for at gøre kuvetten bredere." : ""), 6);
        } else if (h === "lampe") {
            this.kortBesked("Lampen sender kun lys med bølgelængden " + s.lambda + " nm, hvor " + s.navn + " absorberer mest.", 6);
        } else if (h === "kurve") {
            this.kortBesked("Kurven viser, hvor meget af lyset der er tilbage på vejen fra lampen til detektoren.", 5);
        }
    };

    /* ----- Fotonerne ---------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.opdaterBesked(dt);
        var g = this.geo();

        /* Vis svaret: kuvetten glider hen til maalet */
        if (this.auto) {
            var a = this.auto;
            a.t += dt / 0.9;
            var u = NK.blod(a.t);
            this.saetL(NK.lerp(a.l0, a.l1, u), false);
            this.saetC(NK.lerp(a.c0, a.c1, u), false);
            if (a.t >= 1) {
                this.saetL(a.l1, false);
                this.saetC(a.c1, false);
                this.auto = null;
                this.dom(!!this.svarVist);
                this.svarVist = false;
            }
        }

        /* "Prøv det" gaar selv videre 1 sekund efter, at kuvetten staar paa
           maalet (regel 33, runde 4). Gaar eleven vaek fra maalet, afbrydes det. */
        if (this.fase === "proev" && !this.auto && this.proevet && !this.slutNu() && this.maalNaaet()) {
            this.videreT = (this.videreT || 0) + dt;
            if (this.videreT >= 1) { this.videreT = 0; this.dom(false); }
        } else {
            this.videreT = 0;
        }

        /* Lige saa taet som foer, men langsommere */
        var rate = this.langsom ? 5 : 18;
        this.spawnRest += dt * rate;
        while (this.spawnRest >= 1) {
            this.spawnRest -= 1;
            this.fotoner.push({ x: g.x0 + 2, y: g.yc + (Math.random() - 0.5) * g.beamH * 0.7, v: this.fart(), afgjort: false, ved: null, briller: null });
        }
        var T = this.T();
        var eps = this.stof.eps, c = this.c, l = this.l;
        for (var i = this.fotoner.length - 1; i >= 0; i--) {
            var p = this.fotoner[i];
            p.x += p.v * dt;
            if (!p.afgjort && p.x >= g.cl) {
                p.afgjort = true;
                if (Math.random() > T) p.ved = g.cl + LB.absorbX(eps, c, l, Math.random()) * g.pxCm;
            }
            if (p.ved !== null && p.x >= p.ved) {
                this.pust.push({ x: p.ved, y: p.y, t: 0, rgb: this.stof.lys });
                this.fotoner.splice(i, 1);
                continue;
            }
            if (this.briller && p.briller === null && p.x >= g.x1 - 16) {
                p.briller = Math.random() < 1 - Math.pow(10, -BRILLER_A);
                if (p.briller) {
                    this.pust.push({ x: g.x1 - 16, y: p.y, t: 0, rgb: [60, 60, 60] });
                    this.fotoner.splice(i, 1);
                    continue;
                }
            }
            if (p.x >= g.x1) this.fotoner.splice(i, 1);
        }
        this.pust = this.pust.filter(function (q) { q.t += dt; return q.t < 0.6; });
        this.tegn();
    };

    /* ----- Tegningen ---------------------------------------------------------------------- */
    P.tegn = function () {
        var L = this.laerred, ctx = L.ctx, g = this.geo();
        if (L.b < 50 || L.h < 50) return;
        L.ryd();
        var s = this.stof, rgb = s.lys;
        var A = this.A(), T = LB.T(A), eps = s.eps, c = this.c, l = this.l;
        var px = g.px;

        if (this.fremme("kurve")) this.tegnKurve(ctx, g, T);
        else Tg.plads(ctx, g.x0, g.kTop - 14, g.x1 - g.x0, g.kBund - g.kTop + 14, "Lys tilbage", px);

        /* Straalen: fuld foer kuvetten, svagere og svagere inde i den, T efter */
        Tg.straale(ctx, g.x0, g.cl, g.yc, g.beamH, rgb, 1);
        Tg.straaleInde(ctx, g.cl, g.cr, g.yc, g.beamH, rgb, function (u) { return LB.lysEfter(eps, c, u * l); });
        Tg.straale(ctx, g.cr, g.x1, g.yc, g.beamH, rgb, T);

        /* Kuvetten og molekylerne i den */
        var farve = Tg.vaeskeFarve(s, c);
        Tg.kuvette(ctx, g.cl, g.ct, g.cb, g.cuvH, { rgb: farve });
        this.tegnMolekyler(ctx, g);
        /* Straalen igen ovenpaa vaesken, saa den kan ses gennem farven */
        Tg.straaleInde(ctx, g.cl, g.cr, g.yc, g.beamH * 0.6, rgb, function (u) { return 0.5 * LB.lysEfter(eps, c, u * l); });

        /* Fotonerne: bloede prikker uden glimt, og en stille ring, hvor en
           foton blev absorberet (regel 26) */
        ctx.save();
        ctx.fillStyle = Tg.rgba([Math.min(255, rgb[0] + 60), Math.min(255, rgb[1] + 10), Math.min(255, rgb[2] + 60)], 0.85);
        this.fotoner.forEach(function (p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        ctx.save();
        this.pust.forEach(function (q) {
            var u = q.t / 0.6;
            ctx.strokeStyle = Tg.rgba(q.rgb, 0.35 * (1 - u));
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 2 + 4 * u, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.restore();

        /* Grebet paa kuvettens hoejre side (kun naar bredden skal aendres) */
        if (this.styrVis("l")) this.tegnGreb(ctx, g);

        /* Lampe og detektor */
        Tg.lampe(ctx, g.lx, g.ly, g.lb, g.lh, rgb);
        Tg.detektor(ctx, g.dx, g.dy, g.detB, g.detH, g.beamH + 10);
        if (this.briller) Tg.solbriller(ctx, g.x1 - 16, g.yc, g.beamH * 0.7);

        /* Etiketter */
        NK.tekst(ctx, s.lambda + " nm", g.lx + g.lb / 2, g.ly + g.lh + px * 1.3, { font: Tg.font("500", px), justering: "center", farve: Tg.rgba(rgb, 1) });
        NK.tekst(ctx, "Lampe", g.lx + g.lb / 2, g.ly - 8, { font: Tg.font("500", px * 0.95), justering: "center", farve: "#b9c0ca" });
        NK.tekst(ctx, "Detektor", g.dx + g.detB / 2, g.dy - 8, { font: Tg.font("500", px * 0.95), justering: "center", farve: "#b9c0ca" });
        /* I₀ og I staar ikke ved straalen: de bruges ikke i forudsigelserne
           (regel 34, runde 4) */

        /* Under kuvetten: maalpilen, l og etiketten med stoffet og c */
        Tg.maalPil(ctx, g.cl, g.cr, g.pilY, "#cfd6de");
        /* l staar foerst som symbol, naar loven er kommet (regel 34) */
        var lTekst = (this.fremme("tavle") ? "l = " : "") + this.lTekst();
        ctx.save();
        ctx.font = Tg.font("500", px);
        var lB = ctx.measureText(lTekst).width;
        ctx.restore();
        NK.tekst(ctx, lTekst, g.cx, g.lY + px * 0.35, { font: Tg.font("500", px), justering: "center", farve: "#e9eef4" });
        this.lRaekke = { x0: g.cx - lB / 2, x1: g.cx + lB / 2, y: g.lY };
        this.tag = Tg.etiket(ctx, g.cx, g.tagY, [{ t: s.Navn + "   " + this.cTekst(), px: px * 1.05, vaegt: "500" }], { pad: 7 });

        /* Displayet under detektoren: T og A kommer frem, naar de bruges */
        var linjer = [], Av = this.Avis(), Tv = LB.T(Av);
        if (this.fremme("T")) linjer.push({ etiket: "T", tal: Av > 3 ? "< 0,1 %" : NK.procent(Tv) });
        if (this.fremme("A")) linjer.push({ etiket: "A", tal: Av > 3 ? "> 3" : NK.dk(Av, 3), farve: "#ffe28a" });
        var dispH = g.dispH;
        if (linjer.length) {
            this.dispBund = g.dispY + Tg.display(ctx, g.dx, g.dispY, g.detB, linjer, g.dpx);
        } else {
            Tg.plads(ctx, g.dx, g.dispY, g.detB, dispH * 0.6, "Display", px * 0.9);
            this.dispBund = g.dispY + dispH * 0.6;
        }
        this.dispBund = Math.max(this.dispBund, g.dispY + dispH);

        this.tegnFormel(ctx, g);

        this.placer(g);
    };

    /* Knapperne paa apparaterne og boblen foelger tegningen */
    function saet(id, x, y, vis) {
        var e = NK.el(id);
        if (!e) return null;
        if (e.hidden === vis) e.hidden = !vis;
        if (!vis) return e;
        var l = Math.round(x) + "px", t = Math.round(y) + "px";
        if (e.style.left !== l) e.style.left = l;
        if (e.style.top !== t) e.style.top = t;
        return e;
    }

    P.placer = function (g) {
        var tag = this.tag, lr = this.lRaekke, k = 26;
        var cVis = this.styrVis("c"), lVis = this.styrVis("l");
        var cm = tag.y + tag.h / 2 - k / 2;
        saet("lys-c-ned", tag.x - k - 6, cm, cVis);
        saet("lys-c-op", tag.x + tag.b + 6, cm, cVis);
        saet("lys-l-ned", lr.x0 - k - 8, lr.y - k / 2, lVis);
        saet("lys-l-op", lr.x1 + 8, lr.y - k / 2, lVis);
        var lang = NK.el("lys-langsom");
        var langY = g.ly + g.lh + g.px * 2.0;
        saet("lys-langsom", Math.max(g.bx0, g.lx + g.lb / 2 - (lang.offsetWidth || 96) / 2), langY, this.styrVis("langsom"));
        /* Stofferne i en raekke til hoejre for Langsomt lys (kun naar alle seks
           er proevet, og kortet siger "Prøv det") */
        var langH = lang.hidden ? g.bx0 : lang.offsetLeft + lang.offsetWidth + 10;
        saet("lys-stoffer", Math.max(g.bx0, langH), langY, this.styrVis("stof"));

        /* Boblen ved den knap, der skal bruges nu */
        var o = this.opfordring(), boble = NK.el("lys-boble");
        ["lys-c-ned", "lys-c-op", "lys-l-ned", "lys-l-op", "lys-stoffer"].forEach(function (id) {
            var e = NK.el(id), til = !!o && o.id === id;
            if (e.classList.contains("opfordring") !== til) e.classList.toggle("opfordring", til);
        });
        if (!o) { if (!boble.hidden) boble.hidden = true; return; }
        var e = NK.el(o.id);
        if (e.hidden) { boble.hidden = true; return; }
        var bx = o.side === "venstre" ? e.offsetLeft - 10 : e.offsetLeft + e.offsetWidth + 10;
        var by = e.offsetTop + Math.min(e.offsetHeight, 26) / 2;
        if (boble.textContent !== o.tekst) boble.textContent = o.tekst;
        var kl = "boble " + o.side;
        if (boble.className !== kl) boble.className = kl;
        saet("lys-boble", bx, by, true);
    };

    P.tegnMolekyler = function (ctx, g) {
        var s = this.stof;
        var n = Math.round(34 * this.c / s.cMax * this.l * (g.cuvH / 150));
        if (n <= 0) return;
        var mork = Tg.vaeskeFarve(s, s.cMax * 1.6);
        ctx.save();
        ctx.fillStyle = Tg.rgba(mork, 0.85);
        var h = g.cbund - g.vt - 8, b = g.cb - 8;
        for (var i = 0; i < n && i < this.pool.length; i++) {
            var q = this.pool[i];
            ctx.beginPath();
            ctx.arc(g.cl + 4 + q.u * b, g.vt + 4 + q.v * h, 2.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    P.tegnGreb = function (ctx, g) {
        var y = g.ct + g.cuvH * 0.84, h = 26, b = 16;
        ctx.save();
        var lys = this.hintLys === "l" || this.hintLys === "begge";
        ctx.fillStyle = lys ? "rgba(242, 197, 61, 0.95)" : "rgba(61, 158, 224, 0.95)";
        NK.rundtRekt(ctx, g.cr - b / 2, y - h / 2, b, h, 5);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(g.cr - 3, y - 6); ctx.lineTo(g.cr - 3, y + 6);
        ctx.moveTo(g.cr + 3, y - 6); ctx.lineTo(g.cr + 3, y + 6);
        ctx.stroke();
        ctx.restore();
    };

    /* Kurven "Lys tilbage" over straalen: 100 % foer kuvetten, faldende
       inde i den og T efter. Prikker ved hver hele centimeter. */
    P.tegnKurve = function (ctx, g, T) {
        var top = g.kTop, bund = g.kBund;
        if (bund - top < 50) return;
        var s = this.stof, eps = s.eps, c = this.c, l = this.l, px = g.px;
        function y(f) { return bund - f * (bund - top); }
        ctx.save();
        /* Akse og gitter */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
        ctx.lineWidth = 1;
        [0, 0.5, 1].forEach(function (f) {
            ctx.beginPath();
            ctx.moveTo(g.x0, y(f));
            ctx.lineTo(g.x1, y(f));
            ctx.stroke();
            NK.tekst(ctx, f === 1 ? "100 %" : (f === 0.5 ? "50 %" : "0 %"), g.x0 - 6, y(f) + 4,
                { font: Tg.font("500", px * 0.85), justering: "right", farve: "#8d93a3" });
        });
        NK.tekst(ctx, "Lys tilbage", g.x0, top - 8, { font: Tg.font("500", px * 0.95), farve: "#cfd6de" });
        /* Lodrette hjaelpelinjer fra kuvettens vaegge */
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(225, 235, 245, 0.22)";
        [g.cl, g.cr].forEach(function (x) {
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, g.ct);
            ctx.stroke();
        });
        ctx.setLineDash([]);
        /* Selve kurven */
        var farve = Tg.rgba(s.lys, 1);
        ctx.strokeStyle = farve;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(g.x0, y(1));
        ctx.lineTo(g.cl, y(1));
        var n = 40;
        for (var i = 1; i <= n; i++) {
            var u = i / n;
            ctx.lineTo(g.cl + u * g.cb, y(LB.lysEfter(eps, c, u * l)));
        }
        var xb = this.briller ? g.x1 - 16 : g.x1;
        ctx.lineTo(xb, y(T));
        if (this.briller) {
            var Tb = T * Math.pow(10, -BRILLER_A);
            ctx.lineTo(xb + 4, y(Tb));
            ctx.lineTo(g.x1, y(Tb));
        }
        ctx.stroke();
        /* Prikker med procent ved indgangen, hver hele centimeter og udgangen */
        var prikker = [{ x: g.cl, f: 1 }];
        for (var cm = 1; cm < l - 0.25; cm++) prikker.push({ x: g.cl + cm * g.pxCm, f: LB.lysEfter(eps, c, cm), cm: cm });
        prikker.push({ x: g.cr, f: T });
        prikker.forEach(function (q, j) {
            ctx.fillStyle = farve;
            ctx.beginPath();
            ctx.arc(q.x, y(q.f), 4.5, 0, Math.PI * 2);
            ctx.fill();
            var etiket = q.f >= 0.0995 ? Math.round(q.f * 100) + " %" : NK.procent(q.f);
            var ty = y(q.f) - 10;
            if (ty < top + 4) ty = y(q.f) + 20;
            NK.tekst(ctx, j === 0 ? "100 %" : etiket, q.x, ty, { font: Tg.font("500", px * 0.9), justering: "center", farve: "#e9eef4", kant: true });
        });
        ctx.restore();
    };

    P.tegnGreb = function (ctx, g) {
        var y = g.ct + g.cuvH * 0.84, h = 26, b = 16;
        ctx.save();
        ctx.fillStyle = "rgba(61, 158, 224, 0.95)";
        NK.rundtRekt(ctx, g.cr - b / 2, y - h / 2, b, h, 5);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(g.cr - 3, y - 6); ctx.lineTo(g.cr - 3, y + 6);
        ctx.moveTo(g.cr + 3, y - 6); ctx.lineTo(g.cr + 3, y + 6);
        ctx.stroke();
        ctx.restore();
    };

    /* Lambert-Beers lov med tallene paa et lyst papir centreret oeverst, lige
       under kortet (regel 37, runde 4): rolig skrift, lidt stoerre end foer,
       ingen fed. Foer forudsigelse 2 en stiplet plads med navnet. */
    P.tegnFormel = function (ctx, g) {
        var s = this.stof, A = this.A(), px = g.px;
        var f = NK.klamp(px * 1.18, 16, 21);
        var lilla = "#6b3fb0", guld = "#7a5a00", moerk = "#2d3443";
        var linje = [
            { t: "A = ε · l · c = ", farve: moerk, vaegt: "400" },
            { t: NK.dk(s.eps, s.eps >= 10 ? 1 : 2) + " mM⁻¹·cm⁻¹", farve: lilla, vaegt: "400" },
            { t: " · " + this.lTekst() + " · " + this.cTekst() + " = ", farve: moerk, vaegt: "400" },
            { t: NK.dk(A, 3), farve: guld, vaegt: "500" }
        ];
        ctx.save();
        var b = Math.max(Tg.dele(ctx, linje, 0, 0, f, false) + 36, 300);
        var x = Math.round(g.W / 2 - b / 2), y = g.formY, h = g.formH;
        this.formel = { x: x, y: y, b: b, h: h };
        if (!this.fremme("tavle")) {
            Tg.plads(ctx, x, y, b, h, "Lambert-Beers lov", px * 0.95);
            ctx.restore();
            return;
        }
        Tg.papir(ctx, x, y, b, h);
        ctx.textBaseline = "alphabetic";
        NK.tekst(ctx, "Lambert-Beers lov", g.W / 2, y + h * 0.36, { font: Tg.font("500", px * 0.85), justering: "center", farve: "#6b6558" });
        var lb = Tg.dele(ctx, linje, 0, 0, f, false);
        Tg.dele(ctx, linje, g.W / 2 - lb / 2, y + h * 0.8, f);
        ctx.restore();
    };

    NK.SimLys = SimLys;
}());
