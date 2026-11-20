/* =====================================================================
   sim_regn.js - fane 3: Regn paa Y

   En tavle i scenen med reaktionsskemaet, indgrebet og reaktionsbroeken.
   Trinene er som regnefiguren B2.11 i Kemibogen:

     1 (brok)    eleven vaelger det tal, hver koncentration ganges med
     2 (forsoeg) eleven klikker paa hver koncentration i broeken, saa den
                 faar faktoren paa (lilla, ogsaa inde i en potens)
     3 (spm)     hvad Y bliver lige efter indgrebet (de forkerte svar er
                 den glemte potens og den vendte broek)
     4 (spm2)    hvilken vej ligevaegten forskydes

   Naar Y er fundet, staar Y paa tallinjen under tavlen, og naar retningen
   er fundet, gaar Y hen til K.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var LILLA = "#c3a6ff";
    var POT = { 1: "", 2: "²", 3: "³", 4: "⁴" };

    function SimRegn() {
        this.startFane(D.R_MAAL);
    }

    var P = SimRegn.prototype;
    NK.Fane.paa(P, { navn: "r" });

    P.nyOpgave = function (o) {
        this.maerket = { over: o.over.map(function () { return false; }), under: o.under.map(function () { return false; }) };
        this.yVis = null;
        this.hover = null;
        this.visTrin();
    };

    P.nyFase = function () { this.visTrin(); };
    P.efterDel = function () { this.visTrin(); };
    P.efterOpgave = function () { this.visTrin(); };

    P.nulstilScene = function () {
        var o = this.opg.o;
        if (this.opg.fase === "forsoeg") this.maerket = { over: o.over.map(function () { return false; }), under: o.under.map(function () { return false; }) };
    };

    P.alleMaerket = function () {
        return this.maerket.over.every(function (m) { return m; }) && this.maerket.under.every(function (m) { return m; });
    };

    P.forsoegSvar = function () {
        this.maerket.over = this.maerket.over.map(function () { return true; });
        this.maerket.under = this.maerket.under.map(function () { return true; });
    };

    /* Er faktoren paa broeken? Fra trin 2 og frem, og naar maalet er loest */
    P.vises = function (side, j) {
        var f = this.opg.fase;
        if (this.faerdig || f === "spm" || f === "spm2") return true;
        return f === "forsoeg" && this.maerket[side][j];
    };

    /* Y er fundet: fra et rigtigt svar paa trin 3 */
    P.yFundet = function () {
        var g = this.opg;
        return this.faerdig || g.fase === "spm2" || (g.fase === "spm" && g.rigtig !== undefined);
    };

    /* ----- Panelet: trinene ------------------------------------------------------------- */
    P.visTrin = function () {
        if (!this.opg) return;
        var g = this.opg, mig = this, html = "";
        [["brok", "Hvad ganges koncentrationerne med?"], ["forsoeg", "Sæt faktoren på i brøken"],
         ["spm", "Y lige efter indgrebet"], ["spm2", "Hvilken vej forskydes ligevægten?"]].forEach(function (t, i) {
            var idx = g.faser.indexOf(t[0]);
            var klar = mig.faerdig || idx < g.fi || (idx === g.fi && mig.venter);
            var nu = !klar && idx === g.fi;
            html += '<div class="trin-raekke' + (klar ? " klar" : "") + (nu ? " nu" : "") + '"><span class="tr-nr">' + (klar ? "✓" : i + 1) + "</span>" + t[1] + "</div>";
        });
        NK.saetHTML("r-trin", html);
    };

    /* ----- Scenen -------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, Hs = this.baand().y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.y0 = 10 + this.kortZone() + 8;
        lay.tavle = { x: Math.max(24, (W - 760) / 2), y: lay.y0 + 4, b: Math.min(760, W - 48), h: 222 };
        lay.tlW = Math.min(W - 80, 680);
        lay.tlX = (W - lay.tlW) / 2;
        lay.tlY = Math.min(Hs - 50, lay.tavle.y + lay.tavle.h + 76);
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("tallinje", lay.tlX - 10, lay.tlY - 44, lay.tlW + 20, 92);
        this.visTrin();
    };

    P.opdaterScene = function (dt) {
        var o = this.opg.o;
        this.visTrin();
        if (this.yFundet()) {
            if (this.yVis === null) this.yVis = o.Y;
            if (this.faerdig) this.yVis = Math.exp(NK.lerp(Math.log(this.yVis), 0, 1 - Math.exp(-2.2 * dt)));
        } else {
            this.yVis = null;
        }
    };

    /* Ét led i broeken: [stof] med potens og evt. faktoren foran. Giver dets dele
       som (tekst, farve). */
    P.led = function (side, j) {
        var o = this.opg.o, l = o[side][j], p = l[1];
        if (!this.vises(side, j)) return [[l[0] + POT[p], Tg.TEKST]];
        if (p === 1) return [[o.f + " · ", LILLA], [l[0], Tg.TEKST]];
        return [["(", Tg.TEKST], [o.f + " · ", LILLA], [l[0] + ")" + POT[p], Tg.TEKST]];
    };

    /* Tegner en raekke led med · imellem, midt om cx. Giver felterne. */
    P.raekke = function (ctx, side, cx, y) {
        var mig = this, o = this.opg.o, dele = [], b = 0, px = 21;
        ctx.font = Tg.font("700", px);
        var prik = ctx.measureText(" · ").width;
        o[side].forEach(function (l, j) {
            var led = mig.led(side, j), w = 0;
            led.forEach(function (d) { w += ctx.measureText(d[0]).width; });
            dele.push({ j: j, led: led, w: w });
            b += w + (j ? prik : 0);
        });
        var x = cx - b / 2, felter = [];
        dele.forEach(function (d, k) {
            if (k) { NK.tekst(ctx, " · ", x, y, { font: Tg.font("700", px), farve: Tg.TEKST }); x += prik; }
            var f = { side: side, j: d.j, x: x - 4, y: y - px - 2, b: d.w + 8, h: px + 12 };
            var kan = mig.iForsoeg() && !mig.maerket[side][d.j];
            if (kan) {
                NK.rundtRekt(ctx, f.x, f.y, f.b, f.h, 7);
                ctx.fillStyle = mig.hover && mig.hover.side === side && mig.hover.j === d.j ? "rgba(242, 197, 61, 0.28)" : "rgba(242, 197, 61, 0.12)";
                ctx.fill();
                ctx.lineWidth = 1.6;
                ctx.strokeStyle = "rgba(242, 197, 61, 0.75)";
                ctx.stroke();
            }
            d.led.forEach(function (del) {
                NK.tekst(ctx, del[0], x, y, { font: Tg.font("700", px), farve: del[1] });
                x += ctx.measureText(del[0]).width;
            });
            felter.push(f);
        });
        return { felter: felter, b: b };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg.o;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var om = this.omNu(), T = lay.tavle, cx = T.x + T.b / 2;

        /* Tavlen */
        NK.rundtRekt(ctx, T.x, T.y, T.b, T.h, 14);
        ctx.fillStyle = "#1d2a26";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#3d5a50";
        ctx.stroke();
        NK.tekst(ctx, o.skema, cx, T.y + 34, { font: Tg.font("700", 19), farve: "#ffffff", justering: "center" });
        NK.tekst(ctx, o.indgreb, cx, T.y + 58, { font: Tg.font("600", 15), farve: Tg.GUL, justering: "center" });

        /* Reaktionsbroeken med faktorerne. Den dukker op, naar faktoren er valgt
           (brugeren 20. nov. 2026: delene skal ikke komme alle paa én gang). */
        var by = T.y + 138;
        var g = this.opg;
        var broekFremme = this.faerdig || g.fase !== "brok" || this.venter;
        this.felter = [];
        if (broekFremme) {
            ctx.font = Tg.font("700", 21);
            var yb = ctx.measureText("Y = ").width;
            /* Maal foerst, saa broekstregen er lige saa bred som det bredeste led */
            var mig = this;
            var bredde = function (side) {
                var b = 0, prik = ctx.measureText(" · ").width;
                o[side].forEach(function (l, j) {
                    mig.led(side, j).forEach(function (d) { b += ctx.measureText(d[0]).width; });
                    if (j) b += prik;
                });
                return b;
            };
            var bb = Math.max(bredde("over"), bredde("under")) + 16;
            var x0 = cx - (yb + bb) / 2, mx = x0 + yb + bb / 2;
            NK.tekst(ctx, "Y =", x0, by + 7, { font: Tg.font("700", 21), farve: Tg.TEKST });
            ctx.strokeStyle = Tg.TEKST;
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(x0 + yb, by); ctx.lineTo(x0 + yb + bb, by); ctx.stroke();
            var r1 = this.raekke(ctx, "over", mx, by - 10);
            var r2 = this.raekke(ctx, "under", mx, by + 30);
            this.felter = r1.felter.concat(r2.felter);
            if (this.iForsoeg()) {
                Tg.skilt(ctx, "Klik på hver koncentration", mx, by - 42, T.x + 8, T.x + T.b - 8);
            }
            /* Taellingen, naar faktoren er sat paa alle koncentrationer */
            if (this.faerdig || g.fase === "spm" || g.fase === "spm2") {
                var ORD = { 1: "én gang", 2: "to gange", 3: "tre gange", 4: "fire gange", 5: "fem gange" };
                var nO = 0, nU = 0;
                o.over.forEach(function (l) { nO += l[1]; });
                o.under.forEach(function (l) { nU += l[1]; });
                NK.tekst(ctx, o.f + " " + ORD[nO] + " over og " + ORD[nU] + " under brøkstregen", mx, by + 66,
                    { font: Tg.font("700", 15), farve: LILLA, justering: "center" });
            }
            if (this.yFundet()) {
                NK.tekst(ctx, "= " + D.relTekst(o.Y).replace("Y = ", ""), x0 + yb + bb + 12, by + 7, { font: Tg.font("800", 21), farve: LILLA });
            }
        } else {
            Tg.plads(ctx, cx - 130, by - 34, 260, 76, "reaktionsbrøken");
        }
        if (om.indexOf("tavle") >= 0) Tg.omRing(ctx, T.x, T.y, T.b, T.h, 14);

        /* Tallinjen dukker op, naar Y er fundet, og Y gaar hen til K, naar retningen er fundet */
        var vis = this.yVis !== null;
        if (vis) {
            this.tl = Tg.tallinje(ctx, lay.tlX, lay.tlY, lay.tlW, {
                K: 1, Ktekst: "",
                Y: this.yVis,
                yTekst: D.relTekst(this.yVis),
                foer: 1,
                maal: this.faerdig && Math.abs(Math.log(this.yVis)) > 0.03
            });
            if (om.indexOf("tallinje") >= 0) Tg.omRing(ctx, lay.tlX - 8, lay.tlY - 44, lay.tlW + 16, 92, 12);
        } else {
            Tg.plads(ctx, lay.tlX, lay.tlY - 30, lay.tlW, 70, "tallinjen med Y og K");
        }

        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.feltVed = function (pt) {
        var f = Tg.feltVed(this.felter, pt);
        return f && !this.maerket[f.side][f.j] ? f : null;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) { this.hover = null; return null; }
        this.hover = this.iForsoeg() ? this.feltVed(pt) : null;
        return this.hover ? "klik" : null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var f = Tg.feltVed(this.felter, pt);
        if (f) {
            if (this.spaer()) return;
            if (this.maerket[f.side][f.j]) return;
            this.maerket[f.side][f.j] = true;
            this.nulstilHjaelp();
            if (this.alleMaerket()) this.forsoegKlaret("");
            return;
        }
        if (Tg.i(this.lay.tavle, pt) && !this.iForsoeg()) this.kortBlink();
    };

    NK.SimRegn = SimRegn;
}());
