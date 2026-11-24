/* =====================================================================
   sim_temp.js - fane 2: Temperaturen

   Thiosulfat og syre i et vandbad (Eₐ = 50 kJ/mol, som i sb1.4) og
   molekylernes bevaegelsesenergi som bogens energifordeling. Kurven er
   regnet af Maxwell-Boltzmann-fordelingen (D.f), saa den flytter sig kun
   lidt med temperaturen. Andelen over Eₐ er saa lille (1 ud af 155
   millioner ved 20 °C), at den ikke kan ses: aksen springer fra 20 til
   45 kJ/mol, og en lup forstoerrer hoejden omkring Eₐ ca. 1 million
   gange. Tallene under luppen er regnet af D.andel.

   − og + sidder paa vandbadet og er kun fremme, naar kortet beder om dem,
   eller i Fri leg (regel 19a). Under en handling er kun den knap, der
   skal bruges, fremme, og den kan ikke skyde forbi maalet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK, D = NK.D, T = NK.T, F = NK.T.F;

    var VENSTRE = [0, 20], HOEJRE = [45, 60];   /* aksens to stykker i kJ/mol */
    var Y_MAKS = 0.23;                          /* hoejeste vaerdi paa hovedgrafen (0 °C) */
    var Y_LUP = 1.2e-8;                         /* hoejeste vaerdi i luppen (ved 50 °C gaar kurven ud over kanten) */
    var LUP = [47, 58];                         /* luppens energier i kJ/mol */
    var MAAL_T = [D.T_START, 30, 10];           /* temperaturen, naar opgaven er loest */

    function SimTemp() {
        var mig = this;
        this.canvas = NK.el("temp-laerred");
        this.l = new NK.Laerred(this.canvas);
        this.T = D.T_START;
        this.Tv = D.T_START;
        this.fri = false;
        this.klikket = false;
        this.zoneH = 0;
        this.minus = NK.el("temp-minus");
        this.plus = NK.el("temp-plus");
        this.boble = NK.el("temp-boble");
        this.minus.addEventListener("click", function () { mig.skru(-1); });
        this.plus.addEventListener("click", function () { mig.skru(1); });
        this.canvas.addEventListener("pointerdown", function () { mig.m.sceneKlik(); });
        this.m = new NK.Motor("temp", D.OPGAVER_TEMP, this, {
            friTekst: "Klik på − og + ved vandbadet, og se kurven og luppen."
        });
    }

    var P = SimTemp.prototype;

    /* ----- Motoren kalder ------------------------------------------------------ */
    P.scene = function (m) {
        this.m = m;
        var f = m.fase();
        if (f === "handling" && m.t === 0) { this.T = D.T_START; this.klikket = false; }
        else if (f === "loest") this.T = MAAL_T[m.o];
        else if (f === "spm" && m.t > 0 && m.o > 0) this.T = MAAL_T[m.o];
        else if (f === "spm" && m.o === 0) this.T = D.T_START;
    };

    P.friLeg = function (til) { this.fri = til; };

    P.paaMaal = function (tr) {
        return this.T === tr.maalT && Math.abs(this.Tv - this.T) < 0.4;
    };

    P.maalFejl = function (tr) {
        var tegn = tr.maalT > this.T ? "+" : "−";
        return "Glasset er " + this.T + " °C. Klik på " + tegn + " ved vandbadet, til glasset er " + tr.maalT + " °C.";
    };

    P.goerHandling = function (tr) { this.T = tr.maalT; };

    /* Hvilke knapper er fremme, og kan de bruges? */
    P.knapTilstand = function () {
        var m = this.m, tr = m.trin();
        if (this.fri) return { minus: true, plus: true, minusOk: this.T > D.T_MIN, plusOk: this.T < D.T_MAX };
        if (m.fase() === "handling") {
            var op = tr.maalT > D.T_START;
            return { minus: !op, plus: op, minusOk: this.T > tr.maalT, plusOk: this.T < tr.maalT, opfordring: true };
        }
        return { minus: false, plus: false };
    };

    P.skru = function (retning) {
        var k = this.knapTilstand();
        if (retning > 0 ? !(k.plus && k.plusOk) : !(k.minus && k.minusOk)) { this.m.sceneKlik(); return; }
        this.T = NK.klamp(this.T + retning * D.T_TRIN, D.T_MIN, D.T_MAX);
        this.klikket = true;
    };

    /* ----- Hvad scenen viser ------------------------------------------------------- */
    P.vis = function () {
        var m = this.m, o = m.o;
        var tr = m.trin(), om = m.fase() === "spm" ? tr.om : null;
        if (this.fri) return { ea: true, lup: true, ghost: true, om: null };
        return {
            ea: o > 0 || m.trinLoest(0, 0),
            lup: o > 0 || m.trinLoest(0, 1),
            ghost: o > 0,
            om: om
        };
    };

    /* ----- Layout --------------------------------------------------------------------- */
    P.tilpas = function () {
        var ny = this.l.tilpas();
        if (ny || !this.zoneH) this.layout();
    };

    P.layout = function () {
        var maalt = this.m.maalKort();
        if (maalt) this.zoneH = maalt;
        var zone = this.m.kort.zone([150, 130], this.zoneH || undefined);
        var W = this.l.b, H = this.l.h;
        NK.el("temp-skema").style.top = (zone + 2) + "px";
        var top = zone + 44, ph = Math.max(260, H - top - 14);
        var vb = NK.klamp(W * 0.27, 240, 520), mellem = 22;
        var pg = Math.min(W - 28 - vb - mellem, 860);
        var x = Math.round((W - (vb + mellem + pg)) / 2);
        var g = this.g = { x: x + vb + mellem, y: top, b: pg, h: ph };
        g.x0 = g.x + 74;
        g.x1 = g.x + pg - 26;
        g.y1 = g.y + ph - 52;
        g.y0 = g.y + 36;
        var bredde = g.x1 - g.x0;
        g.vSlut = g.x0 + bredde * 0.6;
        g.hStart = g.x0 + bredde * 0.68;
        /* Luppen over stykket med Eₐ */
        g.lr = NK.klamp(Math.min((g.x1 - g.hStart) / 2 + 26, (g.y1 - g.y0) * 0.36), 70, 150);
        g.lx = Math.min((g.hStart + g.x1) / 2, g.x + pg - g.lr - 12);
        g.ly = g.y0 + g.lr + 22;

        /* Vandbadet: figurens koordinater (u, v) er vandbadets SVG-koordinater.
           Termometeret naar op til v = -36, soklen ned til v = 298, og
           ordet vandbad staar under soklen. */
        var k = Math.min(vb / 320, (ph - 30) / 336);
        var bad = this.bad = { x: x, b: vb, k: k };
        bad.ox = x + (vb - 320 * k) / 2;
        bad.oy = g.y + ph - 26 - 298 * k;
        this.placerKnapper();
        this.anker("temp-anker-bad", bad.ox, bad.oy - 36 * k, 320 * k, 334 * k);
        this.anker("temp-anker-graf", g.x, g.y, g.b, g.h);
        this.anker("temp-anker-lup", g.lx - g.lr, g.ly - g.lr - 20, g.lr * 2, g.lr * 2 + 20);
    };

    P.anker = function (id, x, y, b, h) {
        var a = NK.el(id);
        a.style.left = x + "px"; a.style.top = y + "px"; a.style.width = b + "px"; a.style.height = h + "px";
    };

    /* − og + sidder i knapbroendene paa vandbadets panel (54, 262) og (266, 262) */
    P.placerKnapper = function () {
        var b = this.bad, k = b.k, str = Math.round(NK.klamp(46 * k, 34, 50));
        [[this.minus, 54], [this.plus, 266]].forEach(function (kn) {
            kn[0].style.width = str + "px";
            kn[0].style.height = str + "px";
            kn[0].style.fontSize = Math.round(str * 0.6) + "px";
            kn[0].style.left = Math.round(b.ox + kn[1] * k - str / 2) + "px";
            kn[0].style.top = Math.round(b.oy + 262 * k - str / 2) + "px";
        });
    };

    /* x for en energi paa den knaekkede akse */
    P.xE = function (E) {
        var g = this.g;
        if (E <= VENSTRE[1]) return g.x0 + (E - VENSTRE[0]) / (VENSTRE[1] - VENSTRE[0]) * (g.vSlut - g.x0);
        return g.hStart + (E - HOEJRE[0]) / (HOEJRE[1] - HOEJRE[0]) * (g.x1 - g.hStart);
    };

    P.yF = function (f) {
        var g = this.g;
        return g.y1 - f / Y_MAKS * (g.y1 - g.y0 - 24);
    };

    /* ----- Tid ---------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.Tv = NK.mod(this.Tv, this.T, 7, dt);
        if (Math.abs(this.Tv - this.T) < 0.02) this.Tv = this.T;
        this.m.opdater(dt);
        var k = this.knapTilstand();
        this.minus.hidden = !k.minus;
        this.plus.hidden = !k.plus;
        this.minus.disabled = !k.minusOk;
        this.plus.disabled = !k.plusOk;
        var paa = this.m.fase() === "handling" && this.paaMaal(this.m.trin());
        this.minus.classList.toggle("opfordring", !!k.opfordring && k.minus && !paa);
        this.plus.classList.toggle("opfordring", !!k.opfordring && k.plus && !paa);
        /* Boblen staar, til eleven har klikket første gang (regel 19) */
        var vis = !!k.opfordring && !this.klikket && !this.fri;
        this.boble.hidden = !vis;
        if (vis) {
            var kn = k.plus ? this.plus : this.minus;
            this.boble.textContent = "Klik: " + (k.plus ? "+" : "−");
            this.boble.style.left = (parseFloat(kn.style.left) + parseFloat(kn.style.width) / 2) + "px";
            this.boble.style.top = (parseFloat(kn.style.top) - 10) + "px";
        }
    };

    /* ----- Tegning ------------------------------------------------------------------ */
    P.tegn = function () {
        var l = this.l, c = l.ctx, g = this.g;
        l.ryd("#14141a");
        if (!g) return;
        var v = this.vis();
        NK.saetHTML("temp-skema", "S₂O₃²⁻ + 2 H₃O⁺ → S + SO₂ + 3 H₂O" +
            (v.ea ? '<span class="skema-navn">Eₐ = ' + D.EA + " kJ/mol</span>" : ""));
        this.vandbad(c);
        T.papir(c, g.x, g.y, g.b, g.h);
        this.akser(c, v);
        if (v.ghost && Math.abs(this.Tv - D.T_START) > 0.5) this.kurve(c, D.T_START, true);
        this.kurve(c, this.Tv, false);
        if (v.ea) this.eaStreg(c, v);
        if (v.lup) this.lup(c, v);
        this.fokusRing(c, v);
    };

    /* Vandbadet med glaskar, varmelegeme og panel, baegerglasset med thiosulfat og
       syre og termometeret i vandet (sprites/). Displayet, lamperne, termometerets
       soejle og etiketten tegnes her, fordi de skifter. */
    var BAEGER = { u: 82, v: 4, s: 1.25 };       /* baegerglassets plads og stoerrelse i karret */
    var TERMO = { u: 58, v: 196, vinkel: -10 };  /* termometerets kugle og haeldning */

    P.vandbad = function (c) {
        var b = this.bad, k = b.k, S = NK.Sprites, t = this.Tv;
        function X(u) { return b.ox + u * k; }
        function Y(v) { return b.oy + v * k; }
        S.tegn(c, "vandbad_bag", X(0), Y(0), k);

        /* Termometeret i vandet: 0 °C ved y 200 og 50 °C ved y 40 i dets egen figur */
        c.save();
        c.translate(X(TERMO.u), Y(TERMO.v));
        c.rotate(TERMO.vinkel * Math.PI / 180);
        if (S.tegn(c, "termometer", -13 * k, -234 * k, k)) {
            var yT = 200 - 3.2 * NK.klamp(t, -5, 55);
            var gr = c.createLinearGradient(-1.6 * k, 0, 1.6 * k, 0);
            gr.addColorStop(0, "#f08a78");
            gr.addColorStop(0.5, "#d63a26");
            gr.addColorStop(1, "#9e2617");
            c.fillStyle = gr;
            c.fillRect(-1.5 * k, (yT - 234) * k, 3 * k, (229 - yT) * k);
        }
        c.restore();

        /* Baegerglasset */
        var bs = k * BAEGER.s;
        S.tegn(c, "baegerglas", X(BAEGER.u), Y(BAEGER.v), bs);
        S.tegn(c, "vandbad_for", X(0), Y(0), k);

        /* Etiketten (regel 22) staar under karrets kant og over vandet, oven paa glasset,
           saa den altid kan laeses */
        var ex = X(BAEGER.u) + 18 * bs, ey = Y(BAEGER.v) + 32 * bs, eb = 78 * bs, eh = 46 * bs;
        c.save();
        c.shadowColor = "rgba(0, 0, 0, 0.25)";
        c.shadowBlur = 4;
        c.shadowOffsetY = 1;
        NK.rundtRekt(c, ex, ey, eb, eh, 4 * bs);
        c.fillStyle = "#fdfcf8";
        c.fill();
        c.restore();
        NK.rundtRekt(c, ex, ey, eb, eh, 4 * bs);
        c.strokeStyle = "#d9d4c6";
        c.lineWidth = 1;
        c.stroke();
        var px = NK.passendeSkrift(c, "thiosulfat", eb - 10, Math.min(17, eh * 0.4), 10, "700");
        T.tekst(c, "thiosulfat", ex + eb / 2, ey + eh * 0.44, { px: px, just: "center", vaegt: 700 });
        T.tekst(c, "og syre", ex + eb / 2, ey + eh * 0.44 + px * 1.15, { px: px, just: "center", vaegt: 700 });


        /* Displayet: temperaturen i groenne cifre */
        var dpx = Math.round(NK.klamp(24 * k, 14, 30));
        T.tekst(c, Math.round(t) + " °C", X(160), Y(263) + dpx * 0.36,
            { font: "600 " + dpx + "px Consolas, 'Segoe UI', monospace", just: "center", farve: "#8ff5cf" });
        /* Lamperne: varme lyser, mens badet varmer, koel, mens det koeler */
        var varmer = this.T - t > 0.15, koeler = t - this.T > 0.15;
        [[96, varmer, "#ffb347"], [224, koeler, "#7cc4ff"]].forEach(function (l) {
            if (!l[1]) return;
            var x = X(l[0]), y = Y(262), r = 4.2 * k;
            c.save();
            var gl = c.createRadialGradient(x, y, 0, x, y, r * 3);
            gl.addColorStop(0, l[2]);
            gl.addColorStop(0.35, l[2]);
            gl.addColorStop(1, "rgba(0,0,0,0)");
            c.fillStyle = gl;
            c.beginPath();
            c.arc(x, y, r * 3, 0, Math.PI * 2);
            c.fill();
            c.restore();
        });
        T.tekst(c, "vandbad", X(160), Y(298) + 18, { px: 14, just: "center", farve: "#c8d2dc", vaegt: 600 });
    };

    P.akser = function (c, v) {
        var g = this.g, mig = this;
        T.pil(c, g.x0, g.y1, g.x0, g.y0 - 6, F.daempet, 2);
        /* x-aksen i to stykker med et knaek imellem */
        c.save();
        c.strokeStyle = F.daempet;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(g.x0, g.y1);
        c.lineTo(g.vSlut + 8, g.y1);
        c.stroke();
        var kx = (g.vSlut + g.hStart) / 2;
        [-7, 7].forEach(function (d) {
            c.beginPath();
            c.moveTo(kx + d - 5, g.y1 + 8);
            c.lineTo(kx + d + 5, g.y1 - 8);
            c.stroke();
        });
        c.restore();
        T.pil(c, g.hStart - 8, g.y1, g.x1 + 14, g.y1, F.daempet, 2);
        [0, 5, 10, 15, 20, 45, 50, 55, 60].forEach(function (E) {
            var x = mig.xE(E);
            T.stiplet(c, x, g.y1, x, g.y1 + 5, F.daempet, 1.4);
            T.tekst(c, String(E), x, g.y1 + 20, { px: 14, just: "center", farve: F.blaek, vaegt: 500 });
        });
        T.tekst(c, "antal molekyler", g.x0 + 10, g.y0 + 4, { px: 15, farve: F.blaek });
        T.tekst(c, "molekylernes bevægelsesenergi (kJ/mol)", g.x1 + 14, g.y1 + 42, { px: 15, just: "right", farve: F.blaek });
    };

    P.kurve = function (c, tc, ghost) {
        var g = this.g, mig = this, i, E, n = 160;
        c.save();
        c.beginPath();
        for (i = 0; i <= n; i++) {
            E = VENSTRE[1] * i / n;
            var x = mig.xE(E), y = mig.yF(D.f(E, tc));
            if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        if (!ghost) {
            c.lineTo(this.xE(VENSTRE[1]), g.y1);
            c.lineTo(g.x0, g.y1);
            c.closePath();
            c.fillStyle = F.flade;
            c.fill();
            c.beginPath();
            for (i = 0; i <= n; i++) {
                E = VENSTRE[1] * i / n;
                if (i === 0) c.moveTo(mig.xE(E), mig.yF(D.f(E, tc))); else c.lineTo(mig.xE(E), mig.yF(D.f(E, tc)));
            }
        }
        c.strokeStyle = ghost ? "#8a9799" : F.blaek;
        c.lineWidth = ghost ? 2 : 3;
        if (ghost) c.setLineDash([6, 5]);
        c.stroke();
        /* Det hoejre stykke: kurven ligger paa aksen */
        if (!ghost) {
            c.setLineDash([]);
            c.beginPath();
            c.moveTo(this.xE(HOEJRE[0]), g.y1 - 1.5);
            c.lineTo(this.xE(HOEJRE[1]), g.y1 - 1.5);
            c.stroke();
        }
        c.restore();
        /* Temperaturen ved toppen af kurven */
        var top = D.RT(this.Tv) / 2, xt = this.xE(top) + 14, yt = this.yF(D.f(top, this.Tv));
        T.tekst(c, Math.round(tc) + " °C" + (ghost ? " (stiplet)" : ""), xt + 8, yt + (ghost ? 18 : -4),
            { px: 15, farve: ghost ? "#6f7d80" : F.blaek, vaegt: 700 });
    };

    P.eaStreg = function (c, v) {
        var g = this.g, x = this.xE(D.EA);
        var top = v.lup ? g.ly + g.lr * 0.98 : g.y0 + 20;
        T.stiplet(c, x, g.y1, x, top, F.ea, 2);
        T.tekst(c, "Eₐ", x - 24, g.y1 - 12, { px: 16, just: "right", farve: F.ea, vaegt: 700 });
    };

    /* Luppen forstoerrer hoejden omkring Eₐ */
    P.lup = function (c, v) {
        var g = this.g, r = g.lr, cx = g.lx, cy = g.ly, mig = this;
        var lille = { x: this.xE(D.EA + 1), y: g.y1 - 8, r: 18 };
        /* Keglen fra det lille omraade paa aksen op til luppen */
        c.save();
        c.fillStyle = "rgba(242, 197, 61, 0.12)";
        c.beginPath();
        c.moveTo(lille.x - lille.r, lille.y);
        c.lineTo(cx - r * 0.92, cy + r * 0.4);
        c.lineTo(cx + r * 0.92, cy + r * 0.4);
        c.lineTo(lille.x + lille.r, lille.y);
        c.closePath();
        c.fill();
        c.beginPath();
        c.arc(lille.x, lille.y, lille.r, 0, Math.PI * 2);
        c.strokeStyle = "#8a9799";
        c.lineWidth = 2;
        c.stroke();
        /* Selve luppen */
        c.beginPath();
        c.arc(cx, cy, r, 0, Math.PI * 2);
        c.fillStyle = "#ffffff";
        c.fill();
        c.save();
        c.clip();
        var x0 = cx - r * 0.86, x1 = cx + r * 0.86, yb = cy + r * 0.5, yt = cy - r * 0.62;
        var xL = function (E) { return x0 + (E - LUP[0]) / (LUP[1] - LUP[0]) * (x1 - x0); };
        var yL = function (f) { return yb - f / Y_LUP * (yb - yt); };
        function kurve(tc, fyld, ghost) {
            var i, E, n = 80;
            if (fyld) {
                c.beginPath();
                c.moveTo(xL(D.EA), yb);
                for (i = 0; i <= n; i++) { E = D.EA + (LUP[1] - D.EA) * i / n; c.lineTo(xL(E), yL(D.f(E, tc))); }
                c.lineTo(xL(LUP[1]), yb);
                c.closePath();
                c.fillStyle = "rgba(214, 120, 40, 0.45)";
                c.fill();
            }
            c.beginPath();
            for (i = 0; i <= n; i++) {
                E = LUP[0] + (LUP[1] - LUP[0]) * i / n;
                if (i === 0) c.moveTo(xL(E), yL(D.f(E, tc))); else c.lineTo(xL(E), yL(D.f(E, tc)));
            }
            c.strokeStyle = ghost ? "#8a9799" : F.blaek;
            c.lineWidth = ghost ? 2 : 2.6;
            c.setLineDash(ghost ? [6, 5] : []);
            c.stroke();
            c.setLineDash([]);
        }
        if (v.ghost && Math.abs(this.Tv - D.T_START) > 0.5) kurve(D.T_START, false, true);
        kurve(this.Tv, true, false);
        c.strokeStyle = F.daempet;
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(x0, yb);
        c.lineTo(x1, yb);
        c.stroke();
        T.stiplet(c, xL(D.EA), yb, xL(D.EA), yt - 8, F.ea, 2);
        T.tekst(c, "Eₐ", xL(D.EA) - 6, yb + 20, { px: 15, just: "right", farve: F.ea, vaegt: 700 });
        /* Lyset i glasset */
        c.strokeStyle = "rgba(255, 255, 255, 0.6)";
        c.lineWidth = 4;
        c.lineCap = "round";
        c.beginPath();
        c.arc(cx, cy, r * 0.84, Math.PI * 1.08, Math.PI * 1.32);
        c.stroke();
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(cx, cy, r * 0.84, Math.PI * 1.38, Math.PI * 1.46);
        c.stroke();
        c.restore();
        /* Kanten: blankt metal med lys oppe til venstre */
        var mg = c.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        mg.addColorStop(0, "#f2f5f8");
        mg.addColorStop(0.45, "#a9b3bd");
        mg.addColorStop(1, "#4d5661");
        c.save();
        c.shadowColor = "rgba(0, 0, 0, 0.3)";
        c.shadowBlur = 8;
        c.shadowOffsetY = 2;
        c.beginPath();
        c.arc(cx, cy, r + 3, 0, Math.PI * 2);
        c.strokeStyle = mg;
        c.lineWidth = 9;
        c.stroke();
        c.restore();
        c.beginPath();
        c.arc(cx, cy, r - 1.5, 0, Math.PI * 2);
        c.strokeStyle = "rgba(0, 0, 0, 0.25)";
        c.lineWidth = 1;
        c.stroke();
        c.beginPath();
        c.arc(cx, cy, r + 7.5, 0, Math.PI * 2);
        c.strokeStyle = "rgba(40, 46, 54, 0.6)";
        c.lineWidth = 1;
        c.stroke();
        c.restore();
        /* Hvor meget luppen forstoerrer: hovedgrafens og luppens skala */
        var gange = (Y_MAKS / (g.y1 - g.y0 - 24)) / (Y_LUP / (yb - yt));
        var lt = "Forstørret " + this.gangeTekst(gange);
        c.font = T.font(13, 600);
        var lb = c.measureText(lt).width;
        T.tekst(c, lt, Math.min(cx, g.x + g.b - 10 - lb / 2), cy - r - 8,
            { px: 13, just: "center", farve: F.daempet, vaegt: 600 });
        this.taeller(c, v);
        void mig;
    };

    P.gangeTekst = function (g) {
        var e = Math.round(Math.log(g) / Math.LN10);
        var ord = { 5: "100.000", 6: "1 million", 7: "10 millioner", 8: "100 millioner" };
        return "ca. " + (ord[e] || NK.potens(Math.pow(10, e), 1)) + " gange";
    };

    /* Tallene under luppen: ved 20 °C (stiplet, naar temperaturen er en anden) og nu */
    P.taeller = function (c, v) {
        var g = this.g, x = (g.x0 + g.vSlut) / 2 + (g.vSlut - g.x0) * 0.22, y = g.y0 + 46;
        var t = Math.round(this.T);
        T.tekst(c, "Molekyler med energi nok", x, y, { px: 15, just: "center", farve: F.daempet, vaegt: 600 });
        var linjer = [];
        if (v.ghost && t !== D.T_START) linjer.push({ s: D.T_START + " °C: " + D.udAf(D.T_START), farve: "#6f7d80" });
        linjer.push({ s: t + " °C: " + D.udAf(t), farve: F.ea });
        linjer.forEach(function (ln, i) {
            T.tekst(c, ln.s, x, y + 26 + i * 24, { px: 16, just: "center", farve: ln.farve, vaegt: 700 });
        });
        this.taellerKasse = { x: x - 150, y: y - 18, b: 300, h: 36 + linjer.length * 24 };
    };

    /* Den gule ring om det, kortet spoerger om */
    P.fokusRing = function (c, v) {
        var g = this.g;
        if (v.om === "kurve" || v.om === "top") {
            var x1 = this.xE(v.om === "top" ? 6 : 12);
            T.gulRamme(c, g.x0 + 4, g.y0 + 10, x1 - g.x0, g.y1 - g.y0 - 8);
        } else if (v.om === "ea") {
            var x = this.xE(D.EA);
            T.gulRamme(c, x - 16, g.y0 + 12, 32, g.y1 - g.y0 + 2);
        } else if (v.om === "lup") {
            T.ring(c, g.lx, g.ly, g.lr + 7);
            var k = this.taellerKasse;
            if (k) T.gulRamme(c, k.x, k.y, k.b, k.h);
        }
    };

    /* ----- app.js kalder --------------------------------------------------------------- */
    P.fokus = function () {};
    P.nulstil = function () { this.m.forfra(); };
    P.enter = function () {
        var f = this.m.fase();
        if (f === "bliv" || f === "loest" || f === "faerdig") this.m.videre();
        else this.m.indsend();
    };

    NK.SimTemp = SimTemp;
}());
