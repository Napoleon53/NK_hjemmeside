/* =====================================================================
   sim_kar.js - fane 1: karret

   Et glaskar med kobber(II)sulfat. Eleven traekker en skefuld fra
   krukken ned i karret (et klik paa krukken virker ogsaa), holder musen
   nede paa vandhanen for at haelde vand i og paa den roede hane
   forneden for at tappe ud. Luppen viser altid lige meget vaeske, saa
   antallet af ioner i den foelger koncentrationen. Panelet viser n, V
   og c = n / V.

   Fem opgaver. To af dem starter med et gaet (valget kommer foer
   forklaringen). En opgave er loest, naar karret viser maalet; saa
   forklarer det groenne kort, hvad der skete.

   Eleverne klikker, foer de laeser, og de kigger ikke ud i siden
   (brugeren 9. okt. 2026, og en elevs oenske om pile 6. okt.): hele
   opgaven staar paa kortet oeverst i scenen (kortData; js/fane.js),
   gaettet stort og gult, og det, der skal bruges nu, har et gult skilt
   med, hvad et klik goer, og en ring, til karret viser maalet (mangler,
   skilteNu). Panelet har kun karrets tal og opgavelisten.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;
    var ST = D.stof("CuSO4");
    /* Pladsen til kortet oeverst i scenen: almindelig skaerm og lav skaerm */
    var ZONE = [138, 124];

    function SimKar() {
        this.part = new NK.Partikler(7);
        this.kar = new K.Kar(0, 0);
        this.visV = 0;
        this.visC = 0;
        this.skyer = [];
        this.fald = [];
        this.spatel = null;
        this.flyv = null;
        this.hold = null;
        this.straale = { vand: 0, tap: 0 };
        this.over = null;
        this.auto = null;
        this.skiltFelt = [];
        this.startFane(D.KAR);
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimKar.prototype;
    NK.Fane.paa(P, { navn: "kar", naesteFane: "fane-glas", naesteNavn: "c eller n?", zone: ZONE });

    /* ----- Opgaven ------------------------------------------------------------ */
    P.lavOpgave = function (i) {
        var o = D.KAR[i];
        this.opg = o;
        this.kar = new K.Kar(o.start.n, o.start.V);
        this.visV = this.kar.V / 1000;
        this.visC = this.kar.c();
        this.fase = o.valg ? "valg" : "goer";
        this.valgt = null;
        this.gaetVist = false;
        this.orden = o.valg ? NK.bland(o.valg.svar.map(function (s, j) { return j; })) : [];
        this.skyer = [];
        this.fald = [];
        this.spatel = null;
        this.flyv = null;
        this.hold = null;
        this.auto = null;
        this.maade = "ok";
        this.handlet = false;
        this.forklaring = "";
        this.part = new NK.Partikler(7 + i);
        var n = Tg.prikker(this.kar.c());
        this.part.saet([n, n]);
        this.part.p.forEach(function (q) { q.a = 1; });
        this.visPanel();
    };

    P.harForfra = function () { return true; };
    P.harNyeTal = function () { return false; };

    /* Start forfra: karret som ved opgavens start (gaettet bliver) */
    P.forfra = function () {
        if (this.auto) return;
        var o = this.opg;
        this.kar = new K.Kar(o.start.n, o.start.V);
        this.hold = null;
        this.spatel = null;
        this.fald = [];
        this.handlet = false;
        this.visPanel();
        if (!this.faerdig) this.besked("Karret er som ved start. " + this.trinLinje(), "");
    };

    P.gaetNu = function () { return !this.faerdig && this.fase === "valg"; };

    /* Gaettet som en saetning, der selv naevner koncentrationen (intet er
       indforstaaet): "koncentrationen bliver halvt saa stor" */
    P.gaetTekst = function (j) {
        var v = this.opg.valg;
        return v.svar[j].t.replace(/^Den /, v.den + " ");
    };

    /* Det, kortet oeverst i scenen viser: gaettet (stort og gult), det, der
       skal goeres, eller forklaringen, naar karret viser maalet */
    P.kortData = function () {
        var o = this.opg, k;
        if (this.fase === "valg" && !this.faerdig) {
            return { slags: "gaet", intro: o.tekst, tekst: o.valg.spm,
                     svar: this.orden.map(function (j) { return { j: j, t: o.valg.svar[j].t }; }) };
        }
        if (this.faerdig) {
            /* Har karret selv vist svaret, staar regnestykket foran forklaringen
               (ikke i opgaverne med et gaet: dér er svaret kun, hvad hanen gjorde) */
            var gul = this.maade === "svar";
            k = { slags: "loest", gul: gul, chip: gul ? "Svaret" : "Løst ✓", videre: this.videreTekst(),
                  html: (gul && !o.valg ? NK.html(o.svar) + " " : "") + this.forklaring + (this.slutEkstra ? " " + NK.html(this.slutEkstra) : "") };
        } else {
            /* Efter et gaet er opgaven at proeve det i karret */
            k = { slags: "opgave", chip: "Opgave " + (this.nr + 1), tekst: o.valg ? o.linje : o.tekst };
        }
        if (o.valg && this.valgt !== null) {
            var sv = o.valg.svar[this.valgt];
            k.gaet = (this.gaetVist ? "Svaret" : "Dit gæt") + ": <b>" + NK.html(this.gaetTekst(this.valgt)) + "</b>";
            if (this.faerdig && !this.gaetVist) {
                k.gaet += sv.ok ? " ✓" : " ✗";
                k.gaetKl = sv.ok ? "rigtig" : "forkert";
            }
        }
        return k;
    };

    P.kortValg = function (j) { this.vaelgSvar(j, "gaet"); };

    P.vaelgSvar = function (j, maade) {
        if (this.valgt !== null || this.auto) return;
        this.valgt = j;
        this.fase = "goer";
        this.hjaelp = 0;
        if (maade === "svar") {
            this.brugtSvar = true;
            this.gaetVist = true;
        }
        /* Det, der nu skal goeres, og gaettet (eller svaret) staar paa kortet */
        this.besked("", "");
        this.visKort();
    };

    /* ----- Knappen: hint og svar ------------------------------------------------ */
    P.trinInfo = function () {
        var o = this.opg, mig = this;
        if (this.faerdig) return null;
        if (this.fase === "valg") {
            var ret = o.valg.svar.map(function (s) { return !!s.ok; }).indexOf(true);
            return { hint: NK.html(o.valg.hint), svar: function () { mig.vaelgSvar(ret, "svar"); } };
        }
        return { hint: NK.html(o.hint), svar: function () { mig.visGoer(); } };
    };

    P.opgaveFaerdig = function () { return this.fase === "faerdig"; };

    /* Linjen under opgaven paa kortet. Gaettet og det, der skal goeres efter
       et gaet, staar som kortets egen tekst. */
    P.trinLinje = function () {
        if (this.fase === "valg") return "";
        if (!this.handlet) return this.opg.valg ? "" : this.opg.linje;
        return this.statusLinje();
    };

    /* Linjen efter en handling: hvor karret er, og hvad der mangler */
    P.statusLinje = function () {
        var o = this.opg, m = o.maal, kar = this.kar, c = kar.c(), V = kar.V;
        if (V <= 0) return kar.nTot > 0 ? "Pulveret ligger tørt. Hæld vand i." : "Karret er tomt.";
        var man = this.mangler();
        if (kar.nFast() > 0) {
            return "Der kan ikke opløses mere i så lidt vand. Resten ligger på bunden. " +
                (man.forfra ? "Tryk på Start forfra." : "Hæld vand i.");
        }
        var dele = [];
        dele.push("c = " + K.to(c) + " M" + (m.c !== undefined && !o.valg ? ", målet er " + K.to(m.c) + " M." : "."));
        if (m.V !== undefined) dele.push("V = " + K.to(V / 1000) + " L, målet er " + K.to(m.V / 1000) + " L.");
        if (m.c !== undefined && c > m.c + 0.005 && !(m.V !== undefined && V < m.V)) {
            dele.push(man.forfra ? "Koncentrationen er for høj. Tryk på Start forfra." :
                "Koncentrationen er for høj. Hæld vand i, eller tryk på Start forfra.");
        } else if (man.forfra) {
            dele.push(m.V !== undefined && V > m.V ? "Der er for meget i karret. Tryk på Start forfra." :
                "Der er for meget stof i karret. Tryk på Start forfra.");
        }
        return dele.join(" ");
    };

    /* Det, der mangler, foer karret viser maalet: en skefuld (krukke), vand,
       at der tappes ud (tap), eller at intet af det kan redde karret
       (forfra). Skiltene i scenen og linjen i kortet bruger det. En skefuld,
       der er paa vej ned, taeller med, saa skiltet ikke lokker til en for
       meget. */
    P.mangler = function () {
        var m = this.opg.maal, kar = this.kar, V = kar.V, MAKS = K.Kar.MAKS;
        var ud = { krukke: false, vand: false, tap: false, forfra: false };
        var n = kar.nTot + ((this.flyv ? 1 : 0) + this.fald.length) * D.SKEFULD;
        var maalN = m.V !== undefined ? m.c * m.V / 1000 : null;
        if (V <= 0) {
            ud.vand = true;
            ud.krukke = maalN === null ? n < 1e-9 : n < maalN - 1e-9;
            return ud;
        }
        var opl = Math.min(n, D.C_MAKS * V / 1000), c = opl / (V / 1000);
        var lav = c < m.c - 0.005, hoej = c > m.c + 0.005 || n - opl > 1e-9;
        if (hoej) {
            /* Vand kan kun redde det, hvis karret kan rumme det */
            ud.vand = n / m.c * 1000 <= MAKS + 1e-6 && V < MAKS;
            ud.forfra = !ud.vand;
        } else if (m.V === undefined) {
            ud.krukke = lav;
        } else if (V > m.V) {
            ud.tap = !lav;
            ud.forfra = lav;
        } else if (V < m.V || lav) {
            ud.vand = V < m.V;
            ud.krukke = lav || n < maalN - 1e-9;
        }
        return ud;
    };

    /* De skilte, scenen viser nu: ingen, mens der gaettes, mens karret selv
       viser svaret, og naar opgaven er loest */
    P.skilteNu = function () {
        if (this.faerdig || this.fase !== "goer" || this.auto) return {};
        return this.mangler();
    };

    P.slutLinje = function () { return this.forklaring; };

    /* Er maalet naaet? */
    P.tjekMaal = function () {
        var o = this.opg;
        if (this.fase !== "goer" || !K.vedMaal(this.kar, o.maal)) return false;
        this.fase = "faerdig";
        this.hold = null;
        var pre = "";
        /* Gaettet staar paa kortet lige over forklaringen, saa det gentages ikke her */
        if (o.valg && this.valgt !== null && !this.gaetVist) {
            var s = o.valg.svar[this.valgt];
            pre = s.ok ? "Dit gæt holdt." : "Dit gæt holdt ikke. " + s.forkl;
        }
        this.forklaring = NK.html((pre ? pre + " " : "") + o.efter);
        this.trinLoest(this.maade, this.maade === "svar" ? NK.html(o.svar) : null);
        return true;
    };

    /* Efter hver handling i karret */
    P.efterHandling = function () {
        this.handlet = true;
        this.visPanel();
        if (this.fase === "goer" && this.tjekMaal()) return;
        if (this.fase === "goer" && !this.auto) this.besked(this.statusLinje(), "");
    };

    /* ----- Vis svaret: karret goer det selv fra start ---------------------------- */
    P.visGoer = function () {
        var o = this.opg;
        this.kar = new K.Kar(o.start.n, o.start.V);
        this.hold = null;
        this.spatel = null;
        this.fald = [];
        this.maade = "svar";
        this.brugtSvar = true;
        var koe = [];
        o.goer.forEach(function (g) {
            if (g[0] === "stof") for (var i = 0; i < g[1]; i++) koe.push(["stof"]);
            else koe.push([g[0], g[1]]);
        });
        this.auto = { koe: koe, aktiv: null, t: 0 };
        this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(o.svar), "gul");
        this.visPanel();
        this.visKnap();
    };

    P.koerAuto = function (dt) {
        var a = this.auto;
        if (!a) return;
        if (!a.aktiv) {
            if (this.flyv || this.fald.length) return;
            if (!a.koe.length || this.faerdig) { this.auto = null; this.visKnap(); return; }
            var g = a.koe.shift();
            if (g[0] === "stof") { this.startFlyv(); return; }
            a.aktiv = { slags: g[0], rest: g[1], t: 0 };
        }
        var ak = a.aktiv;
        ak.t += dt;
        if (ak.t >= 0.12) {
            ak.t = 0;
            if (ak.slags === "vand") this.trykVand(); else this.trykTap();
            ak.rest -= D.TRYK;
            if (ak.rest <= 0) a.aktiv = null;
        }
    };

    /* ----- Handlingerne ------------------------------------------------------------ */
    P.trykVand = function () {
        if (this.kar.V >= K.Kar.MAKS) {
            this.kortBesked("Karret er fuldt. Der er 1,00 L.");
            this.hold = null;
            return;
        }
        this.kar.haeld(D.TRYK);
        this.straale.vand = 0.4;
        this.stopVedMaal();
        this.efterHandling();
    };

    P.trykTap = function () {
        if (this.kar.V <= 0) {
            this.kortBesked("Karret er tomt.");
            this.hold = null;
            return;
        }
        this.kar.tap(D.TRYK);
        this.straale.tap = 0.4;
        this.stopVedMaal();
        this.efterHandling();
    };

    /* Hanen stopper, naar karret viser det rumfang, opgaven beder om */
    P.stopVedMaal = function () {
        var m = this.opg.maal;
        if (this.hold && m.V !== undefined && this.kar.V === m.V && this.fase === "goer") this.hold = null;
    };

    P.landet = function (x) {
        this.kar.tilsaet(D.SKEFULD);
        var g = this.lay.kar;
        if (this.kar.V > 0) {
            var y = g.yV(this.kar.V / 1000);
            this.skyer.push({ x: x, y: y + 14 * g.k, r: 8 * g.k, a: 1 });
        }
        this.efterHandling();
    };

    /* Spatlen flyver selv fra krukken til karret (et klik paa krukken) */
    P.startFlyv = function () {
        var kr = this.lay.krukke, g = this.lay.kar;
        this.flyv = { t: 0, x0: kr.x + kr.b / 2, y0: kr.y - 10, x1: (g.ind.x0 + g.ind.x1) / 2, y1: g.ind.top - 34 * g.k };
    };

    P.slipPulver = function (x, y) {
        var g = this.lay.kar;
        x = NK.klamp(x, g.ind.x0 + 16 * g.k, g.ind.x1 - 16 * g.k);
        this.fald.push({ x: x, y: y, vy: 0 });
    };

    /* ----- Musen ------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var kr = lay.krukke, g = lay.kar, h = lay.hane, z = lay.zoom;
        /* Et klik paa et skilt taeller som et klik paa det, skiltet peger paa */
        for (var i = 0; i < this.skiltFelt.length; i++) {
            var f = this.skiltFelt[i];
            if (pt.x >= f.x && pt.x <= f.x + f.b && pt.y >= f.y && pt.y <= f.y + f.h) return f.id;
        }
        if (pt.x >= kr.x - 6 && pt.x <= kr.x + kr.b + 6 && pt.y >= kr.y - 10 && pt.y <= kr.y + kr.h) return "krukke";
        if (pt.x >= h.x0 + 40 * h.k && pt.x <= h.x0 + h.b && pt.y >= Math.max(0, h.y0 + 96 * h.k) && pt.y <= h.y0 + h.h) return "vand";
        if (Math.hypot(pt.x - g.han.x, pt.y - g.han.y) < g.han.r * 1.3 ||
            (pt.x >= g.x + 226 * g.k && pt.x <= g.x + 296 * g.k && pt.y >= g.y0 + 230 * g.k && pt.y <= g.y0 + 305 * g.k)) return "tap";
        if (Math.hypot(pt.x - z.x, pt.y - z.y) < z.r) return "zoom";
        if (pt.x >= g.ind.x0 && pt.x <= g.ind.x1 && pt.y >= g.ind.top - 20 * g.k && pt.y <= g.ind.bund) return "kar";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over && this.over !== "kar" && this.over !== "zoom" ? this.over : null;
    };

    P.nedScene = function (pt) {
        if (this.auto) { this.kortBesked("Vent. Karret viser svaret."); return false; }
        /* Foer gaettet goer et klik i scenen ikke andet end at faa kortet til at blinke */
        if (this.fase === "valg") { this.gaetBlink(); return false; }
        var u = this.hvad(pt);
        if (u === "krukke" || u === "vand" || u === "tap") {
            if (u === "krukke") {
                if (this.flyv) return false;
                this.spatel = { x: pt.x, y: pt.y, sx: pt.x, sy: pt.y, trukket: false };
                return true;
            }
            this.hold = { slags: u, t: 0 };
            if (u === "vand") this.trykVand(); else this.trykTap();
            return true;
        }
        if (u === "kar") this.kortBesked("Træk en skefuld fra krukken hertil, eller brug hanerne.");
        if (u === "zoom") this.kortBesked("Luppen viser altid lige meget væske. Flere prikker er en højere koncentration.");
        return false;
    };

    P.flytScene = function (pt) {
        var s = this.spatel;
        if (!s) return;
        s.x = pt.x;
        s.y = pt.y;
        if (Math.hypot(pt.x - s.sx, pt.y - s.sy) > 6) s.trukket = true;
    };

    P.opScene = function (pt) {
        this.hold = null;
        var s = this.spatel;
        if (!s) return;
        this.spatel = null;
        var g = this.lay.kar;
        if (!s.trukket) { this.startFlyv(); return; }
        if (pt.x >= g.ind.x0 - 10 && pt.x <= g.ind.x1 + 10 && pt.y < g.ind.bund - 10 * g.k) {
            this.slipPulver(pt.x, Math.min(pt.y, g.ind.top - 6));
            return;
        }
        this.kortBesked("Slip skefulden over karret.");
    };

    /* ----- Panelet ------------------------------------------------------------------- */
    P.visPanel = function () {
        var kar = this.kar, n = kar.nOpl(), V = kar.V, c = kar.c();
        NK.saetTekst("kar-n", K.to(n) + " mol");
        NK.saetTekst("kar-V", K.to(V / 1000) + " L");
        NK.saetTekst("kar-c", V > 0 ? K.to(c) + " M" : "–");
        NK.saetHTML("kar-regn", V > 0 ? "c = n / V = " + K.to(n) + " mol / " + K.to(V / 1000) + " L = <b>" + K.to(c) + " M</b>" :
            "Karret er tomt. c kan ikke regnes, når V = 0.");
        NK.saetTekst("kar-note", kar.nFast() > 0 ? "På bunden ligger " + K.to(kar.nFast()) + " mol, der ikke er opløst." : "");
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var Hs = H;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.07, 16, 44));
        /* Kortet med opgaven har pladsen oeverst; hanen, karret og luppen begynder under det */
        lay.zone = this.kortZone();
        var top = 10 + lay.zone + 4;
        lay.top = top;
        var fri = lay.bordY - top;
        var zr = Math.round(NK.klamp(Math.min(W * 0.14, Hs * 0.22, (fri - 104) / 2), 40, 125));
        var kh = Math.min((fri - 6) / 1.2, (W - 130 - 2 * zr) / 1.1, 540);
        kh = Math.max(150, kh);
        var krH = kh * 0.4, krB = Tg.krukkeBredde(krH);
        var ekstra = Math.max(0, (W - 130 - 2 * zr - kh * 1.1) * 0.35);
        var krX = 18 + ekstra * 0.5 + krB / 2;
        var karX = krX + krB / 2 + 26 + ekstra * 0.3;
        var g = Tg.karGeo(karX, lay.bordY, kh);
        lay.kar = g;
        lay.krukke = { x: krX - krB / 2, y: lay.bordY - krH, b: krB, h: krH, cx: krX };
        var vh = kh * 0.55;
        lay.hane = Tg.vandhaneGeo(g.ind.x0 + (g.ind.x1 - g.ind.x0) * 0.2, g.ind.top - 12 * g.k, vh);
        lay.vask = { x0: g.tud.x - 30 * g.k, x1: g.tud.x + 34 * g.k, y: lay.bordY, d: NK.klamp(28 * g.k, 14, 34) };
        var zx = Math.max(g.x + g.b + zr + 34, W - zr - NK.klamp(W * 0.04, 18, 50));
        lay.zoom = { x: Math.min(zx, W - zr - 12), y: NK.klamp(lay.bordY - kh * 0.6, top + zr + 30, lay.bordY - zr - 74), r: zr };
        lay.lup = { x: (g.ind.x0 + g.ind.x1) / 2 + 20 * g.k, y: g.ind.bund - 70 * g.k };
        this.lay = lay;
        this.saetAnker("kar", g.x, g.y0, g.b, g.h - (360 - 300) * g.k);
        this.saetAnker("krukke", lay.krukke.x, lay.krukke.y, lay.krukke.b, lay.krukke.h);
        var h = lay.hane;
        this.saetAnker("haner", Math.min(h.x0, g.x + 226 * g.k), Math.max(0, h.y0 + 96 * h.k), g.x + 300 * g.k - Math.min(h.x0, g.x + 226 * g.k),
            g.y0 + 305 * g.k - Math.max(0, h.y0 + 96 * h.k));
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 30, 2 * zr, 2 * zr + 100);
    };

    /* ----- Opdater ----------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var lay = this.lay;
        if (!lay) return;
        var g = lay.kar, mig = this;
        /* Hold paa en hane: et tryk hvert 0,28 s */
        if (this.hold) {
            this.hold.t += dt;
            if (this.hold.t >= 0.28) {
                this.hold.t = 0;
                if (this.hold.slags === "vand") this.trykVand(); else this.trykTap();
            }
        }
        this.koerAuto(dt);
        /* Spatlen, der flyver selv */
        if (this.flyv) {
            var f = this.flyv;
            f.t += dt / 0.7;
            if (f.t >= 1) {
                this.flyv = null;
                this.slipPulver(f.x1, f.y1 + 6);
            }
        }
        /* Pulveret, der falder */
        var nyt = [];
        this.fald.forEach(function (p) {
            p.vy += 1400 * dt;
            p.y += p.vy * dt;
            var bund = mig.kar.V > 0 ? g.yV(mig.visV) : g.ind.bund - 4;
            if (p.y >= bund) mig.landet(p.x);
            else nyt.push(p);
        });
        this.fald = nyt;
        this.skyer.forEach(function (s) { s.r += 70 * g.k * dt; s.a -= 0.55 * dt; });
        this.skyer = this.skyer.filter(function (s) { return s.a > 0; });
        this.visV = NK.mod(this.visV, this.kar.V / 1000, 8, dt);
        this.visC = NK.mod(this.visC, this.kar.c(), 3, dt);
        var n = this.kar.V > 0 ? Tg.prikker(this.kar.c()) : 0;
        this.part.saet([n, n]);
        this.part.opdater(dt);
        this.straale.vand = Math.max(0, this.straale.vand - dt);
        this.straale.tap = Math.max(0, this.straale.tap - dt);
        if (this.el.forfra) this.el.forfra.classList.toggle("peg", !!this.skilteNu().forfra);
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var g = lay.kar, t = this.tid, sk = this.skilteNu(), mig = this;
        this.skiltFelt = [];
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        Tg.vask(ctx, lay.vask.x0, lay.vask.x1, lay.vask.y, lay.vask.d);

        /* Straalen fra tappehanen ned i vasken */
        var farve = Tg.vaeske(ST, this.visC);
        if (this.straale.tap > 0) Tg.straale(ctx, g.tud.x, g.tud.y, lay.bordY + lay.vask.d - 4, 6 * g.k, farve, t);

        Tg.kar(ctx, g, { V: this.visV, farve: farve, fast: this.kar.nFast(), st: ST, skyer: this.skyer,
            lysHan: this.over === "tap" ? 1 : 0 });
        if (sk.tap) Tg.pulsring(ctx, g.han.x, g.han.y, g.han.r, t);

        /* Vandhanen og dens straale */
        var h = lay.hane;
        if (this.straale.vand > 0) {
            var bund = this.kar.V > 0 ? g.yV(this.visV) : g.ind.bund;
            Tg.straale(ctx, h.tud.x, h.tud.y, bund, 7 * g.k, null, t);
        }
        Tg.vandhane(ctx, h, this.over === "vand" ? 1 : 0);
        if (sk.vand) Tg.pulsring(ctx, h.knap.x, h.knap.y, h.knap.r, t);

        /* Krukken med kobber(II)sulfat */
        var kr = lay.krukke;
        Tg.krukke(ctx, kr.cx, lay.bordY, kr.h, ST, { linje3: "",
            lys: this.over === "krukke" ? 1 : (sk.krukke ? 0.5 + 0.5 * Math.sin(t * 4.5) : 0) });
        NK.tekst(ctx, "1 skefuld = 0,10 mol", kr.cx, lay.bordY + 26, { font: Tg.font("700", NK.klamp(g.k * 15, 13, 16)),
            justering: "center", linje: "middle", farve: "#9fcdf3" });

        /* Pulveret, der falder, og spatlen */
        var pb = 26 * g.k;
        this.fald.forEach(function (p) { Tg.pulver(ctx, p.x, p.y, pb, 10 * g.k, ST, 2); });
        var sb = NK.klamp(kh(g) * 0.3, 70, 150);
        if (this.spatel) Tg.spatel(ctx, this.spatel.x, this.spatel.y, sb, -0.08, ST, 1);
        if (this.flyv) {
            var f = this.flyv, u = NK.blod(f.t);
            var x = NK.lerp(f.x0, f.x1, u), y = NK.lerp(f.y0, f.y1, u) - Math.sin(u * Math.PI) * 50 * g.k;
            Tg.spatel(ctx, x, y, sb, -0.08 + u * 0.3, ST, 1);
        }

        /* Luppen og zoomvinduet */
        var z = lay.zoom;
        Tg.zoomLinje(ctx, lay.lup.x, lay.lup.y, z.x - z.r, z.y);
        var ant = this.part.antal(0);
        Tg.zoom(ctx, z.x, z.y, z.r, { part: this.part, st: ST, farve: farve, titel: "Luppen: altid lige meget væske",
            tekst: this.kar.V > 0 ? ant + " Cu²⁺ i luppen" : "Karret er tomt" });
        var lk = NK.klamp(g.k * 0.45, 0.25, 0.6);
        NK.Sprites.tegn(ctx, "lup", lay.lup.x - 52 * lk, lay.lup.y - 52 * lk, 140 * lk, 140 * lk);

        /* Skiltene ved det, der mangler: hvad et klik goer. De staar oeverst,
           og et klik paa et skilt taeller som et klik paa tingen (hvad). */
        function skilt(id, x, y, side) {
            var f = Tg.skilt(ctx, D.SKILT[id], x, y, side, lay.W, t);
            f.id = id;
            mig.skiltFelt.push(f);
        }
        if (sk.krukke) skilt("krukke", kr.cx, kr.y - 8, "over");
        if (sk.vand) skilt("vand", h.knap.x + h.knap.r + 4, h.knap.y, "hoejre");
        if (sk.tap) skilt("tap", g.han.x, g.han.y - g.han.r - 6, "over");

        /* Mens der gaettes, er scenen daempet: kun gaettekortet lyser */
        if (this.fase === "valg") {
            ctx.fillStyle = "rgba(14, 14, 20, 0.4)";
            ctx.fillRect(0, 0, lay.W, lay.H);
        }
    };

    function kh(g) { return g.h; }

    SimKar.ZONE = ZONE;
    NK.SimKar = SimKar;
}());
