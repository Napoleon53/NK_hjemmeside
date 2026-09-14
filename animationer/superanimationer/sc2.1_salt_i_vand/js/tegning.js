/* =====================================================================
   tegning.js - de tre ting, begge faner tegner: en ion, et vandmolekyle
   og et baegerglas.

   Farvesproget er det samme hele vejen igennem:
     positiv ion  = violet         negativ ion = blaa
     oxygen (δ−)  = roed           hydrogen (δ+) = lys graa
   Ionerne har med vilje ingen af de to farver, vandmolekylet selv har -
   ellers ville en positiv ion ligne oxygen for meget. */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    NK.Tegn = T;

    T.OXYGEN   = "#e05446";
    T.HYDROGEN = "#e6ebf0";

    /* ----- Ionen ------------------------------------------------------- */
    /* r er radius i pixels. Teksten krymper selv, til den kan vaere inde
       i cirklen - SO₄²⁻ fylder mere end Na⁺. */
    T.ion = function (ctx, x, y, ion, r, opt) {
        opt = opt || {};
        var positiv = ion.q > 0;
        var alpha = opt.alpha === undefined ? 1 : opt.alpha;

        ctx.save();
        ctx.globalAlpha = alpha;

        var g = ctx.createRadialGradient(x - r * 0.36, y - r * 0.4, r * 0.1, x, y, r);
        if (positiv) { g.addColorStop(0, "#caa0f2"); g.addColorStop(1, "#7a3fc0"); }
        else         { g.addColorStop(0, "#8ed0ff"); g.addColorStop(1, "#1a6099"); }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = Math.max(1, r * 0.09);
        ctx.strokeStyle = opt.fremhaev
            ? "#f2c53d"
            : (positiv ? "rgba(214, 180, 245, 0.55)" : "rgba(170, 215, 250, 0.55)");
        ctx.stroke();

        if (r >= 8) {
            var tekst = ion.formel + NK.ladningHaevet(ion.q);
            var stoerrelse = r * 0.80;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            do {
                ctx.font = "600 " + stoerrelse.toFixed(1) + "px 'Segoe UI', sans-serif";
                if (ctx.measureText(tekst).width <= r * 1.72) break;
                stoerrelse -= 0.8;
            } while (stoerrelse > 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(tekst, x, y + r * 0.03);
        }
        ctx.restore();
    };

    /* Ét vandmolekyle i vandskallen om en ion, vendt rigtigt: oxygen
       naermest en positiv ion, hydrogen naermest en negativ. T.vendMod
       vender den rigtige ende ind, og spidsH flytter ankerpunktet, saa
       den ende ogsaa ligger naermest. De to skal foelges ad.
       opt.forkert vender molekylet om (opgaven "find fejlen").
       Med ctx = null tegnes intet; funktionen giver bare molekylets midte
       tilbage, saa et klik kan rammes. */
    T.skalVand = function (ctx, ionX, ionY, ionR, vinkel, skala, positivIon, opt) {
        opt = opt || {};
        var p = opt.forkert ? !positivIon : positivIon;
        var afstand = ionR + (p ? 12 : 7) * skala * 1.08;
        var sx = ionX + Math.cos(vinkel) * afstand;
        var sy = ionY + Math.sin(vinkel) * afstand;
        if (ctx) {
            T.vand(ctx, sx, sy, T.vendMod(sx, sy, ionX, ionY, p), skala, {
                alpha: opt.alpha, delta: opt.delta, spidsH: !p, ring: opt.ring
            });
        }
        var midt = afstand + 8.1 * skala;
        return { x: ionX + Math.cos(vinkel) * midt, y: ionY + Math.sin(vinkel) * midt, r: 17 * skala };
    };

    /* En hel vandskal med et svagt skaer bag. Bruges af selvtesten. */
    T.vandskal = function (ctx, x, y, r, fase, antal, positiv) {
        ctx.save();
        var g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.05);
        g.addColorStop(0, "rgba(150, 200, 240, 0.20)");
        g.addColorStop(1, "rgba(150, 200, 240, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        for (var i = 0; i < antal; i++) {
            T.skalVand(ctx, x, y, r, fase + i * (Math.PI * 2 / antal), r / 22, positiv, { alpha: 0.9 });
        }
    };

    /* ----- Vandmolekylet ------------------------------------------------ */
    /* Tegnes om (0,0) med oxygen i midten og de to hydrogener nedad.
       δ−-enden peger altsaa "opad" i molekylets eget koordinatsystem, og
       vinklen i T.vand drejer hele molekylet.
       T.vendMod giver den vinkel, der vender den rigtige ende ind mod en
       ion - det er hele pointen med polariteten. */
    T.vendMod = function (fraX, fraY, ionX, ionY, positivIon) {
        var v = Math.atan2(ionY - fraY, ionX - fraX);
        return positivIon ? v + Math.PI / 2 : v - Math.PI / 2;
    };

    /* opt.spidsH: naar sand, er det hydrogenerne (ikke oxygen), der
       sidder naermest ankerpunktet (x,y). Det er dét, der goer, at
       hydrogen-enden - og ikke oxygen - kan pege ind mod en negativ ion:
       oxygen (δ−) hoerer hjemme ved en positiv ion, hydrogen (δ+) ved en
       negativ. Uden denne omvending ville oxygen altid ligge naermest
       ionen, uanset ladning, fordi oxygen er tegnet i (0,0). */
    T.vand = function (ctx, x, y, vinkel, skala, opt) {
        opt = opt || {};
        var oR = 12 * skala;
        var hR = 7 * skala;
        var hx = 12.4 * skala;      /* ~104° mellem bindingerne */
        var hy = 16.2 * skala;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vinkel);
        if (opt.spidsH) ctx.translate(0, -hy);
        ctx.globalAlpha = opt.alpha === undefined ? 1 : opt.alpha;

        ctx.strokeStyle = "rgba(226, 234, 242, 0.55)";
        ctx.lineWidth = Math.max(1, 2.6 * skala);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-hx, hy);
        ctx.moveTo(0, 0); ctx.lineTo(hx, hy);
        ctx.stroke();

        ctx.fillStyle = T.HYDROGEN;
        ctx.beginPath();
        ctx.arc(-hx, hy, hR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx, hy, hR, 0, Math.PI * 2);
        ctx.fill();

        /* De smaa molekyler faar en flad farve: der er mange af dem paa
           skaermen, og en farveovergang pr. stk. koster for meget. */
        if (skala >= 0.6) {
            var g = ctx.createRadialGradient(-oR * 0.3, -oR * 0.35, oR * 0.1, 0, 0, oR);
            g.addColorStop(0, "#f08b80");
            g.addColorStop(1, "#bf3628");
            ctx.fillStyle = g;
        } else {
            ctx.fillStyle = T.OXYGEN;
        }
        ctx.beginPath();
        ctx.arc(0, 0, oR, 0, Math.PI * 2);
        ctx.fill();

        /* En ring om hele molekylet, fx naar opgaven peger paa det. */
        if (opt.ring) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = opt.ring;
            ctx.lineWidth = Math.max(2, 2.2 * skala);
            ctx.beginPath();
            ctx.arc(0, hy * 0.5, hy * 1.35, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        /* δ-maerkerne staar kun paa de store molekyler - ellers bliver
           billedet til stoej. De skrives UDEN for det drejede
           koordinatsystem, saa de altid staar paa ret køl og kan laeses,
           uanset hvilken vej molekylet vender. */
        if (opt.delta && skala >= 0.85) {
            var cos = Math.cos(vinkel), sin = Math.sin(vinkel);
            var forskud = opt.spidsH ? -hy : 0;
            var til = function (lx, ly) {
                ly += forskud;
                return [x + lx * cos - ly * sin, y + lx * sin + ly * cos];
            };
            var pO = til(0, 0), pH1 = til(-hx, hy), pH2 = til(hx, hy);
            ctx.save();
            ctx.globalAlpha = opt.alpha === undefined ? 1 : opt.alpha;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "600 " + (10 * skala).toFixed(1) + "px 'Segoe UI', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("δ−", pO[0], pO[1]);
            ctx.fillStyle = "#3a3a47";
            ctx.font = "600 " + (8 * skala).toFixed(1) + "px 'Segoe UI', sans-serif";
            ctx.fillText("δ+", pH1[0], pH1[1]);
            ctx.fillText("δ+", pH2[0], pH2[1]);
            ctx.restore();
        }
    };

    /* ----- Tingene paa bordet -------------------------------------------- */
    /* Vandets form i et baegerglas: lige sider og afrundede hjoerner i
       bunden. Kun stien - kalderen fylder og klipper selv. */
    T.vandSti = function (ctx, x0, x1, top, bund, r) {
        ctx.beginPath();
        ctx.moveTo(x0, top);
        ctx.lineTo(x1, top);
        ctx.lineTo(x1, bund - r);
        ctx.quadraticCurveTo(x1, bund, x1 - r, bund);
        ctx.lineTo(x0 + r, bund);
        ctx.quadraticCurveTo(x0, bund, x0, bund - r);
        ctx.closePath();
    };

    /* Varmepladen (sprites/varmeplade.svg). gloed 0-1 farver pladen roed;
       roer taender den blaa lampe for omroereren. */
    T.varmeplade = function (ctx, x, y, b, gloed, roer) {
        var S = NK.Sprites, MP = S.MAAL.varmeplade, s = b / MP.b;
        S.tegn(ctx, "varmeplade", x, y, b);
        ctx.save();
        if (gloed > 0) {
            ctx.globalAlpha = gloed;
            var g = ctx.createLinearGradient(0, y, 0, y + MP.pladeBund * s);
            g.addColorStop(0, "rgba(255, 120, 60, 0.95)");
            g.addColorStop(1, "rgba(200, 50, 30, 0.75)");
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, x + MP.pladeV * s, y + 1, (MP.pladeH - MP.pladeV) * s, (MP.pladeBund - 1) * s, 2 * s);
            ctx.fill();
            ctx.fillStyle = "#ff6a3d";
            ctx.beginPath();
            ctx.arc(x + MP.lampeVarme[0] * s, y + MP.lampeVarme[1] * s, MP.lampeR * s, 0, Math.PI * 2);
            ctx.fill();
        }
        if (roer) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#5cc0ff";
            ctx.beginPath();
            ctx.arc(x + MP.lampeRoer[0] * s, y + MP.lampeRoer[1] * s, MP.lampeR * s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* Termometeret (sprites/termometer.svg) med den roede soejle. */
    T.termometer = function (ctx, x, y, b, temp) {
        var S = NK.Sprites, MT = S.MAAL.termometer;
        if (!S.tegn(ctx, "termometer", x, y, b)) return false;
        var s = b / MT.b;
        var yT = y + (MT.nul - (MT.nul - MT.hundrede) * NK.klamp(temp, 0, 100) / 100) * s;
        ctx.save();
        ctx.fillStyle = "#d9453a";
        ctx.fillRect(x + MT.soejleV * s, yT, (MT.soejleH - MT.soejleV) * s, y + MT.soejleBund * s - yT);
        ctx.restore();
        return true;
    };

    /* ----- Baegerglasset ------------------------------------------------- */
    /* x, y, b, h er glassets indvendige maal. vandTop er y-vaerdien for
       vandoverfladen. farve toner vandet, saa fx CuSO₄ kan farve det blaat.
       opt.graduering: true tegner mL-streger op ad hoejre side - kun
       relevant, naar hoejden rent faktisk svarer til 100 mL (fane 2). */
    T.glas = function (ctx, x, y, b, h, vandTop, farve, klarhed, opt) {
        opt = opt || {};
        var bund = y + h;
        var top = y - 14;

        ctx.save();

        /* Vandet */
        var v = ctx.createLinearGradient(0, vandTop, 0, bund);
        v.addColorStop(0, "rgba(58, 110, 150, 0.30)");
        v.addColorStop(1, "rgba(30, 66, 96, 0.46)");
        ctx.fillStyle = v;
        ctx.fillRect(x, vandTop, b, bund - vandTop);

        if (farve && klarhed > 0.01) {
            ctx.globalAlpha = NK.klamp(klarhed, 0, 1) * 0.55;
            ctx.fillStyle = farve;
            ctx.fillRect(x, vandTop, b, bund - vandTop);
            ctx.globalAlpha = 1;
        }

        /* Overfladen */
        ctx.strokeStyle = "rgba(180, 220, 250, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, vandTop);
        ctx.lineTo(x + b, vandTop);
        ctx.stroke();

        /* Selve glasset: to sider og en bund, med en lille hældetud i
           toppen til hoejre - det er dét, der goer det til et baegerglas
           og ikke bare et rektangel. */
        ctx.strokeStyle = "rgba(200, 220, 240, 0.42)";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bund - 10);
        ctx.quadraticCurveTo(x, bund, x + 10, bund);
        ctx.lineTo(x + b - 10, bund);
        ctx.quadraticCurveTo(x + b, bund, x + b, bund - 10);
        ctx.lineTo(x + b, top + 9);
        ctx.quadraticCurveTo(x + b, top - 1, x + b + 8, top - 8);
        ctx.stroke();

        /* Randen foroven - en flad ellipsebue antyder glassets tykkelse
           og runder aabningen af, i stedet for at den bare stopper brat. */
        ctx.beginPath();
        ctx.ellipse(x + b / 2, top, b / 2, 4.5, 0, 0, Math.PI, true);
        ctx.stroke();

        /* mL-graduering: fire streger med tal, ligesom paa et rigtigt
           maalebaegerglas. Kun paa den fane, hvor hoejden er 100 mL. */
        if (opt.graduering) {
            var maerker = [25, 50, 75, 100];
            ctx.save();
            ctx.strokeStyle = "rgba(214, 226, 238, 0.5)";
            ctx.fillStyle = "rgba(202, 214, 228, 0.78)";
            ctx.lineWidth = 1.3;
            ctx.font = "500 10.5px 'Segoe UI', sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            maerker.forEach(function (ml) {
                var yy = bund - (ml / 100) * (bund - vandTop);
                var laengde = ml === 100 ? 12 : 7;
                ctx.beginPath();
                ctx.moveTo(x + b - laengde, yy);
                ctx.lineTo(x + b, yy);
                ctx.stroke();
                ctx.fillText(String(ml), x + b + 4, yy);
            });
            ctx.restore();
        }

        /* Et enkelt lysglimt ned ad venstre side */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x + 12, vandTop + 22);
        ctx.lineTo(x + 12, bund - 26);
        ctx.stroke();

        ctx.restore();
    };
}());
