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
   forklarer linjen i kortet, hvad der skete.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;
    var ST = D.stof("CuSO4");

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
        this.pegT = 0;
        this.startFane(D.KAR);
        this.el.valg = NK.el("kar-valg");
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimKar.prototype;
    NK.Fane.paa(P, { navn: "kar", naesteFane: "fane-kolbe", naesteNavn: "Målekolben" });

    /* ----- Opgaven ------------------------------------------------------------ */
    P.lavOpgave = function (i) {
        var o = D.KAR[i];
        this.opg = o;
        this.kar = new K.Kar(o.start.n, o.start.V);
        this.visV = this.kar.V / 1000;
        this.visC = this.kar.c();
        this.fase = o.valg ? "valg" : "goer";
        this.valgt = null;
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

    P.promptHTML = function () {
        var o = this.opg;
        return '<p class="maal-tekst">' + NK.html(o.tekst) + "</p>" +
            (o.valg ? '<p class="opgave-spm">' + NK.html(o.valg.spm) + "</p>" : "");
    };

    /* Valgknapperne til gaettet */
    P.visKortEkstra = function () {
        var o = this.opg, mig = this, e = this.el.valg;
        if (!o.valg) { e.hidden = true; e.innerHTML = ""; return; }
        e.hidden = false;
        e.innerHTML = "";
        this.orden.forEach(function (j) {
            var s = o.valg.svar[j];
            var b = document.createElement("button");
            b.type = "button";
            b.className = "knap";
            b.textContent = s.t;
            if (mig.valgt !== null) {
                b.disabled = true;
                if (j === mig.valgt) b.classList.add("valgt");
                if (mig.faerdig && s.ok) b.classList.add("rigtig");
                if (mig.faerdig && j === mig.valgt && !s.ok) b.classList.add("forkert");
            }
            b.addEventListener("click", function () { mig.vaelgSvar(j, "gaet"); });
            e.appendChild(b);
        });
    };

    P.vaelgSvar = function (j, maade) {
        if (this.valgt !== null || this.auto) return;
        var o = this.opg, s = o.valg.svar[j];
        this.valgt = j;
        this.fase = "goer";
        this.hjaelp = 0;
        if (maade === "svar") {
            this.brugtSvar = true;
            this.svarVis(NK.html("Den rigtige: " + s.t.toLowerCase() + ". Prøv det."));
        } else {
            this.k.tie();
            this.besked(NK.html("Dit gæt: " + s.t.toLowerCase() + ". " + o.linje), "");
        }
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

    P.trinLinje = function () {
        if (this.fase === "valg") return "Gæt først: vælg et af svarene herunder.";
        if (!this.handlet) return this.opg.linje;
        return this.statusLinje();
    };

    /* Linjen efter en handling: hvor karret er, og hvad der mangler */
    P.statusLinje = function () {
        var o = this.opg, m = o.maal, kar = this.kar, c = kar.c(), V = kar.V;
        if (V <= 0) return kar.nTot > 0 ? "Pulveret ligger tørt. Hæld vand i." : "Karret er tomt.";
        if (kar.nFast() > 0) return "Der kan ikke opløses mere i så lidt vand. Resten ligger på bunden. Hæld vand i.";
        var dele = [];
        dele.push("c = " + K.to(c) + " M" + (m.c !== undefined && !o.valg ? ", målet er " + K.to(m.c) + " M." : "."));
        if (m.V !== undefined) dele.push("V = " + K.to(V / 1000) + " L, målet er " + K.to(m.V / 1000) + " L.");
        if (m.c !== undefined && c > m.c + 0.005 && !(m.V !== undefined && V < m.V)) {
            dele.push("Koncentrationen er for høj. Hæld vand i, eller tryk på Start forfra.");
        } else if (m.V !== undefined && V > m.V) {
            dele.push("Der er for meget i karret. Tryk på Start forfra.");
        }
        return dele.join(" ");
    };

    P.slutLinje = function () { return this.forklaring; };

    /* Er maalet naaet? */
    P.tjekMaal = function () {
        var o = this.opg;
        if (this.fase !== "goer" || !K.vedMaal(this.kar, o.maal)) return false;
        this.fase = "faerdig";
        this.hold = null;
        var pre = "";
        if (o.valg && this.valgt !== null) {
            var s = o.valg.svar[this.valgt];
            pre = s.ok ? "Dit gæt holdt." : "Du gættede: " + s.t.toLowerCase() + ". " + s.forkl;
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
        this.svarVis(NK.html(o.svar));
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

    P.blokValg = function () {
        this.kortBesked("Gæt først: vælg et af svarene i kortet.");
        this.pegT = 1.6;
    };

    /* ----- Musen ------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var kr = lay.krukke, g = lay.kar, h = lay.hane, z = lay.zoom;
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
        var u = this.hvad(pt);
        if (u === "krukke" || u === "vand" || u === "tap") {
            if (this.fase === "valg") { this.blokValg(); return false; }
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
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.07, 16, 44));
        var zr = Math.round(NK.klamp(Math.min(W * 0.14, Hs * 0.22), 54, 125));
        var kh = Math.min((lay.bordY - 24) / 1.2, (W - 130 - 2 * zr) / 1.1, 540);
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
        lay.zoom = { x: Math.min(zx, W - zr - 12), y: NK.klamp(lay.bordY - kh * 0.6, zr + 34, lay.bordY - zr - 74), r: zr };
        lay.lup = { x: (g.ind.x0 + g.ind.x1) / 2 + 20 * g.k, y: g.ind.bund - 70 * g.k };
        this.lay = lay;
        this.saetAnker("kar", g.x, g.y0, g.b, g.h - (360 - 300) * g.k);
        this.saetAnker("krukke", lay.krukke.x, lay.krukke.y, lay.krukke.b, lay.krukke.h);
        var h = lay.hane;
        this.saetAnker("haner", Math.min(h.x0, g.x + 226 * g.k), Math.max(0, h.y0 + 96 * h.k), g.x + 300 * g.k - Math.min(h.x0, g.x + 226 * g.k),
            g.y0 + 305 * g.k - Math.max(0, h.y0 + 96 * h.k));
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 30, 2 * zr, 2 * zr + 100);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
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
        if (this.pegT > 0) {
            this.pegT -= dt;
            this.el.valg.classList.toggle("peg", this.pegT > 0);
        }
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var g = lay.kar, t = this.tid, o = this.opg;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        Tg.vask(ctx, lay.vask.x0, lay.vask.x1, lay.vask.y, lay.vask.d);

        /* Straalen fra tappehanen ned i vasken */
        var farve = Tg.vaeske(ST, this.visC);
        if (this.straale.tap > 0) Tg.straale(ctx, g.tud.x, g.tud.y, lay.bordY + lay.vask.d - 4, 6 * g.k, farve, t);

        Tg.kar(ctx, g, { V: this.visV, farve: farve, fast: this.kar.nFast(), st: ST, skyer: this.skyer,
            lysHan: this.over === "tap" ? 1 : 0 });

        /* Vandhanen og dens straale */
        var h = lay.hane;
        if (this.straale.vand > 0) {
            var bund = this.kar.V > 0 ? g.yV(this.visV) : g.ind.bund;
            Tg.straale(ctx, h.tud.x, h.tud.y, bund, 7 * g.k, null, t);
        }
        Tg.vandhane(ctx, h, this.over === "vand" ? 1 : 0);

        /* Krukken med kobber(II)sulfat */
        var kr = lay.krukke;
        Tg.krukke(ctx, kr.cx, lay.bordY, kr.h, ST, { lys: this.over === "krukke" ? 1 : 0, linje3: "" });
        NK.tekst(ctx, "1 skefuld = 0,10 mol", kr.cx, lay.bordY + 26, { font: Tg.font("700", NK.klamp(g.k * 15, 13, 16)),
            justering: "center", linje: "middle", farve: "#9fcdf3" });

        /* En lille pil over det, der skal bruges foerst */
        var pil = this.pil();
        if (pil) {
            var hop = Math.sin(t * 5) * 5;
            ctx.save();
            ctx.fillStyle = "#f2c53d";
            ctx.beginPath();
            ctx.moveTo(pil.x, pil.y + hop);
            ctx.lineTo(pil.x - 9, pil.y - 14 + hop);
            ctx.lineTo(pil.x + 9, pil.y - 14 + hop);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

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

        this.k.tegn(ctx);
        void o;
    };

    function kh(g) { return g.h; }

    /* Pilen: over krukken i foerste opgave og over hanen, der skal bruges */
    P.pil = function () {
        if (this.handlet || this.faerdig || this.fase === "valg" || this.auto) return null;
        var id = this.opg.id, lay = this.lay;
        if (id === "stof") return { x: lay.krukke.cx, y: lay.krukke.y - 14 };
        if (id === "vand") return { x: lay.hane.knap.x, y: lay.hane.knap.y - lay.hane.knap.r - 8 };
        if (id === "tap") return { x: lay.kar.han.x, y: lay.kar.han.y - lay.kar.han.r - 4 };
        return null;
    };

    NK.SimKar = SimKar;
}());
