/* =====================================================================
   tegning.js - det, flere faner tegner ens (rammen fra sb2.2)

   Farver og skrift, de smaa maerkater og skilte, kugler med lys og
   skygge, molekylerne NO2 og N2O4 (fane 1), ionerne Co2+, Cl- og
   CoCl4 2- med navn (fane 2, samme farver som figur B2.10 i Kemibogen),
   tallinjen med Y og K (som i Kemibogens afsnit B2.4), reaktionsbroeken
   med rigtig broekstreg, knapper paa laerredet, cylinderen med stempel,
   maaleglasset og danserne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    T.GUL = "#f2c53d";
    /* Tallinjens farver: K er bogens groenne, Y < K orange og Y > K lilla
       (som figur 1 i B2.4, lysere, fordi scenen er moerk) */
    T.K_FARVE = "#3cc2b2";
    T.HOEJRE = "#f0a04b";
    T.VENSTRE = "#b496f0";
    T.TEKST = "#e9eef4";
    T.MAT = "#8d95a3";

    /* ----- Fra sc7.5: maerkat, ringe og skilt -------------------------------- */
    T.maerkat = function (ctx, tekst, x, y, valg) {
        valg = valg || {};
        ctx.save();
        ctx.font = font("700", valg.px || 13);
        var b = ctx.measureText(tekst).width + 16, h = (valg.px || 13) + 10;
        var vx = valg.justering === "left" ? x : (valg.justering === "right" ? x - b : x - b / 2);
        NK.rundtRekt(ctx, vx, y - h / 2, b, h, h / 2);
        ctx.fillStyle = valg.bund || "rgba(14, 15, 21, 0.82)";
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = valg.farve || "#cfd6de";
        ctx.fillText(tekst, vx + b / 2, y + 0.5);
        ctx.restore();
        return { x: vx, y: y - h / 2, b: b, h: h };
    };

    /* En rolig gul ring om det, teksten paa kortet handler om */
    T.omRing = function (ctx, x, y, b, h, r) {
        ctx.save();
        NK.rundtRekt(ctx, x - 9, y - 9, b + 18, h + 18, (r || 14) + 2);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.stroke();
        NK.rundtRekt(ctx, x - 6, y - 6, b + 12, h + 12, r || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#f2c53d";
        ctx.stroke();
        ctx.restore();
    };

    /* En gul ring, der pulserer, om det, der skal klikkes paa */
    T.ring = function (ctx, x, y, b, h, tid, r) {
        var puls = 0.5 + 0.5 * Math.sin(tid * 4.2);
        ctx.save();
        NK.rundtRekt(ctx, x - 4 - puls * 3, y - 4 - puls * 3, b + 8 + puls * 6, h + 8 + puls * 6, r || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.4 * puls) + ")";
        ctx.stroke();
        ctx.restore();
    };

    /* Et lille gult skilt med en spids nedad: hvad et klik goer */
    T.skilt = function (ctx, tekst, x, y, minX, maxX) {
        ctx.save();
        ctx.font = font("700", 14);
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var vx = x - b / 2;
        if (minX !== undefined) vx = NK.klamp(vx, minX, Math.max(minX, maxX - b));
        NK.rundtRekt(ctx, vx, y - h, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 1);
        ctx.lineTo(x + 7, y - 1);
        ctx.lineTo(x, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, vx + b / 2, y - h / 2 + 0.5);
        ctx.restore();
    };

    /* ----- Kugler med lys og skygge ---------------------------------------------
       Farverne: lys, mellem, moerk og kant. Atomernes farver er Kemibogens
       (H hvid, O roed, C graa). */
    var KUGLE = {
        H: ["#ffffff", "#e9eef0", "#a9b6b8", "#7f8c8e"],
        O: ["#ff9a86", "#e5533d", "#a93226", "#7c2219"],
        C: ["#9aa3ae", "#4b5563", "#262d38", "#151a22"],
        N: ["#a9bdff", "#4468d8", "#203b92", "#152a66"]
    };
    T.KUGLE = KUGLE;

    T.kugle = function (ctx, x, y, r, slags, alfa) {
        var f = KUGLE[slags] || KUGLE.C;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha = alfa;
        var g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
        g.addColorStop(0, f[0]);
        g.addColorStop(0.45, f[1]);
        g.addColorStop(1, f[2]);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = Math.max(0.8, r * 0.09);
        ctx.strokeStyle = f[3];
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Molekylerne -------------------------------------------------------------
       Kalottemodeller: atomerne sidder delvist ind i hinanden. v er vinklen,
       k skalaen. Lyset kommer altid fra oeverst til venstre, saa atomernes
       pladser drejes, ikke tegningen. */
    var R = { O: 7.4, N: 7.8 };
    /* NO2 er boejet; N2O4 er to NO2, der sidder sammen ved N */
    var FORM = {
        NO2: [["N", 0, 2.6], ["O", -9.2, -3.2], ["O", 9.2, -3.2]],
        N2O4: [["N", -5.6, 0], ["N", 5.6, 0], ["O", -12.4, -7.6], ["O", -12.4, 7.6], ["O", 12.4, -7.6], ["O", 12.4, 7.6]]
    };
    T.FORM = FORM;

    /* NO2 er en brun gas, saa molekylet har en svag brun glorie; N2O4 er farveloest */
    T.molekyle = function (ctx, slags, x, y, v, k, alfa) {
        k = k || 1;
        v = v || 0;
        var dele = FORM[slags];
        if (!dele) return;
        if (slags === "NO2") {
            ctx.save();
            if (alfa !== undefined) ctx.globalAlpha = alfa;
            var g = ctx.createRadialGradient(x, y, 2 * k, x, y, 19 * k);
            g.addColorStop(0, "rgba(176, 98, 38, 0.55)");
            g.addColorStop(1, "rgba(176, 98, 38, 0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(x, y, 19 * k, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        var c = Math.cos(v), s = Math.sin(v);
        var punkter = dele.map(function (d) {
            return { a: d[0], x: x + (d[1] * c - d[2] * s) * k, y: y + (d[1] * s + d[2] * c) * k };
        });
        /* Atomerne bagerst foerst: dem laengst oppe */
        punkter.sort(function (p, q) { return p.y - q.y; });
        punkter.forEach(function (p) { T.kugle(ctx, p.x, p.y, R[p.a] * k, p.a, alfa); });
    };

    /* Ikonets bredde i signaturen */
    T.ikonBredde = function (slags, k) {
        k = k || 1;
        return ({ NO2: 30, N2O4: 42, Co: 26, Cl: 21, CoCl4: 34 }[slags] || 24) * k;
    };

    /* ----- Signaturen: stofferne som maerker med ikon og formel ------------------
       punkter: [{ slags, tekst }]. Midten staar i x. Giver maerkernes felter
       tilbage, saa et klik kan forklare stoffet. */
    T.signatur = function (ctx, x, y, punkter, maxB) {
        var trin = [{ px: 15, k: 0.9, luft: 10, mellem: 8 }, { px: 14, k: 0.8, luft: 8, mellem: 6 }, { px: 13, k: 0.72, luft: 6, mellem: 4 }];
        var m, b, i, felter = [];
        ctx.save();
        for (i = 0; i < trin.length; i++) {
            m = trin[i];
            ctx.font = font("700", m.px);
            b = m.mellem * (punkter.length - 1);
            punkter.forEach(function (p) { b += m.luft * 2 + T.ikonBredde(p.slags, m.k) + 7 + ctx.measureText(p.tekst).width; });
            if (!maxB || b <= maxB) break;
        }
        var h = Math.max(m.px + 15, 30 * m.k + 6), cx = x - b / 2;
        punkter.forEach(function (p) {
            ctx.font = font("700", m.px);
            var ib = T.ikonBredde(p.slags, m.k), tb = ctx.measureText(p.tekst).width;
            var fb = m.luft * 2 + ib + 7 + tb;
            NK.rundtRekt(ctx, cx, y - h / 2, fb, h, h / 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "#4d5364";
            ctx.stroke();
            T.ikon(ctx, p.slags, cx + m.luft + ib / 2, y, m.k);
            ctx.font = font("700", m.px);
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(p.tekst, cx + m.luft + ib + 7, y + 0.5);
            felter.push({ slags: p.slags, x: cx, y: y - h / 2, b: fb, h: h });
            cx += fb + m.mellem;
        });
        ctx.restore();
        return felter;
    };

    T.feltVed = function (felter, pt) {
        for (var i = 0; felter && i < felter.length; i++) {
            var f = felter[i];
            if (pt.x >= f.x && pt.x <= f.x + f.b && pt.y >= f.y && pt.y <= f.y + f.h) return f;
        }
        return null;
    };

    /* ----- Tal med dansk komma ------------------------------------------------- */
    /* Koncentration med to decimaler: 0,20 M */
    T.konc = function (c) {
        return (Math.round(c * 100) / 100).toFixed(2).replace(".", ",") + " M";
    };

    /* Y med to betydende cifre: 9,0 · 0,50 · 0 · ∞ */
    T.yTal = function (y) {
        if (y === Infinity) return "∞";
        if (!isFinite(y)) return "–";
        if (y < 1e-9) return "0";
        return NK.betydende(y, 2);
    };

    /* ----- Tallinjen ---------------------------------------------------------------
       Som figur 1 i B2.4: K i midten, Y < K til venstre (reaktionen gaar mod
       hoejre), Y > K til hoejre (mod venstre). Skalaen er logaritmisk med en
       tierpotens til hver side, saa Y = K/2 og Y = 2K ligger lige langt fra K.
       opt: K (tal), Ktekst, Y (tal eller null = skjult), yTekst (tekst over
       punktet), foer (et Y foer indgrebet, tegnes som en tom, stiplet ring), maal
       (pil fra Y mod K, mens reaktionen gaar), skjulOmraader. Giver
       pladserne tilbage. */
    T.YPOS = function (Y, K) {
        if (Y === Infinity) return 1;
        if (!(Y > 0)) return 0;
        var p = 0.5 + Math.log(Y / K) / Math.LN10 / 2.4;
        return NK.klamp(p, 0, 1);
    };

    T.tallinje = function (ctx, x, y, w, opt) {
        var xK = x + w / 2;
        function px(Y) { return x + 12 + T.YPOS(Y, opt.K) * (w - 24); }
        ctx.save();
        /* Linjen med de to ender */
        ctx.lineCap = "round";
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "#6f7787";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
        NK.tekst(ctx, "← lille Y", x, y - 33, { font: font("600", 12.5), farve: T.MAT });
        NK.tekst(ctx, "stor Y →", x + w, y - 33, { font: font("600", 12.5), farve: T.MAT, justering: "right" });

        /* Omraaderne under linjen med retningen */
        if (!opt.skjulOmraader) {
            var a1 = x + w * 0.1, a2 = xK - w * 0.1;
            ctx.strokeStyle = T.HOEJRE;
            ctx.fillStyle = T.HOEJRE;
            ctx.lineWidth = 2.4;
            ctx.beginPath(); ctx.moveTo(a1, y + 17); ctx.lineTo(a2 - 8, y + 17); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(a2, y + 17); ctx.lineTo(a2 - 10, y + 12); ctx.lineTo(a2 - 10, y + 22); ctx.closePath(); ctx.fill();
            var kort = w < 640;
            NK.tekst(ctx, kort ? "Y < K: mod højre" : "Y < K: reaktionen forløber mod højre", (a1 + a2) / 2, y + 38, { font: font("700", 13), farve: T.HOEJRE, justering: "center" });
            var b1 = xK + w * 0.1, b2 = x + w * 0.9;
            ctx.strokeStyle = T.VENSTRE;
            ctx.fillStyle = T.VENSTRE;
            ctx.beginPath(); ctx.moveTo(b1 + 8, y + 17); ctx.lineTo(b2, y + 17); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(b1, y + 17); ctx.lineTo(b1 + 10, y + 12); ctx.lineTo(b1 + 10, y + 22); ctx.closePath(); ctx.fill();
            NK.tekst(ctx, kort ? "Y > K: mod venstre" : "Y > K: reaktionen forløber mod venstre", (b1 + b2) / 2, y + 38, { font: font("700", 13), farve: T.VENSTRE, justering: "center" });
        }

        /* K: maerket staar i en raekke over Y's, saa de aldrig skriver oven i hinanden */
        ctx.strokeStyle = T.K_FARVE;
        ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(xK, y - 27); ctx.lineTo(xK, y + 11); ctx.stroke();
        NK.tekst(ctx, opt.Ktekst ? "K = " + opt.Ktekst : "K", xK, y - 33, { font: font("800", 15), farve: T.K_FARVE, justering: "center" });

        /* Y foer indgrebet: en tom ring */
        if (opt.foer !== undefined && opt.foer !== null) {
            var xf = px(opt.foer);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(233, 238, 244, 0.55)";
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.arc(xf, y, 8, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
        }

        var ud = { x: x, y: y, w: w, xK: xK, yY: null };
        if (opt.Y !== undefined && opt.Y !== null && !isNaN(opt.Y)) {
            var xY = px(opt.Y);
            ud.yY = xY;
            /* Pilen fra Y mod K, mens reaktionen gaar */
            if (opt.maal && Math.abs(xY - xK) > 16) {
                var mod = xK > xY ? 1 : -1;
                ctx.strokeStyle = mod > 0 ? T.HOEJRE : T.VENSTRE;
                ctx.fillStyle = ctx.strokeStyle;
                ctx.lineWidth = 3;
                ctx.setLineDash([6, 5]);
                ctx.beginPath(); ctx.moveTo(xY + mod * 11, y); ctx.lineTo(xK - mod * 14, y); ctx.stroke();
                ctx.setLineDash([]);
                ctx.beginPath(); ctx.moveTo(xK - mod * 5, y); ctx.lineTo(xK - mod * 15, y - 6); ctx.lineTo(xK - mod * 15, y + 6); ctx.closePath(); ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(xY, y, 8.5, 0, Math.PI * 2);
            ctx.fillStyle = "#f4f6f8";
            ctx.fill();
            ctx.lineWidth = 2.4;
            ctx.strokeStyle = "#14141a";
            ctx.stroke();
            var yt = opt.yTekst || "Y";
            var jus = xY < x + 40 ? "left" : (xY > x + w - 40 ? "right" : "center");
            /* Y's maerke staar lige over punktet. Er Y naer K, flyttes det lidt
               til siden, saa K's lodrette streg ikke gaar igennem teksten. */
            var tx = xY;
            /* Gaar maerket hen over K's streg, flyttes det til den side, der vender
               vaek fra K (ogsaa for et langt maerke som "Y lige efter = 2 · K") */
            ctx.font = font("800", 15);
            var tb = ctx.measureText(yt).width;
            if (jus === "center" && Math.abs(xY - xK) < tb / 2 + 8) {
                jus = xY < xK ? "right" : "left";
                tx = xY < xK ? Math.min(xY + 4, xK - 7) : Math.max(xY - 4, xK + 7);
                if (jus === "left" && tx + tb > x + w + 30) { jus = "right"; tx = x + w + 30; }
            }
            NK.tekst(ctx, yt, tx, y - 14, { font: font("800", 15), farve: "#ffffff", justering: jus });
        }
        ctx.restore();
        return ud;
    };

    /* ----- Reaktionsbroeken paa laerredet --------------------------------------------
       venstre: "Y =", over og under som tekst. Giver bredden tilbage. */
    T.broek = function (ctx, x, y, venstre, over, under, opt) {
        opt = opt || {};
        var px = opt.px || 16;
        ctx.save();
        ctx.font = font("700", px);
        var bv = ctx.measureText(venstre + " ").width;
        var bo = ctx.measureText(over).width, bu = under ? ctx.measureText(under).width : 0;
        var bb = Math.max(bo, bu) + 8;
        var bredde = bv + bb;
        var x0 = opt.midt ? x - bredde / 2 : x;
        ctx.fillStyle = opt.farve || T.TEKST;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(venstre, x0, y);
        var mx = x0 + bv + bb / 2;
        ctx.textAlign = "center";
        if (under) {
            ctx.fillText(over, mx, y - px * 0.72);
            ctx.fillText(under, mx, y + px * 0.78);
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = opt.farve || T.TEKST;
            ctx.beginPath(); ctx.moveTo(x0 + bv, y); ctx.lineTo(x0 + bv + bb, y); ctx.stroke();
        } else {
            ctx.fillText(over, mx, y);
        }
        ctx.restore();
        return { x: x0, b: bredde, h: under ? px * 3 : px * 1.4 };
    };

    /* ----- Knapper paa laerredet ---------------------------------------------------- */
    T.knap = function (ctx, f, tekst, opt) {
        opt = opt || {};
        ctx.save();
        NK.rundtRekt(ctx, f.x, f.y, f.b, f.h, opt.r || 9);
        var g = ctx.createLinearGradient(0, f.y, 0, f.y + f.h);
        var farve = opt.farve || "groen";
        var F = {
            groen: ["#4cc184", "#2b8a59", "#1d5f3d", "#ffffff"],
            graa: ["#4a4e5c", "#363945", "#262833", "#e9eef4"],
            gul: ["#ffe58a", "#f2c53d", "#c99a1c", "#33290a"]
        }[farve];
        g.addColorStop(0, opt.over ? F[0] : F[1]);
        g.addColorStop(1, F[2]);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.stroke();
        ctx.font = font("800", opt.px || 15);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = F[3];
        ctx.fillText(tekst, f.x + f.b / 2, f.y + f.h / 2 + 0.5);
        ctx.restore();
    };

    T.i = function (f, pt) {
        return !!f && pt.x >= f.x && pt.x <= f.x + f.b && pt.y >= f.y && pt.y <= f.y + f.h;
    };

    /* ----- Ionerne paa fane 2 ------------------------------------------------------------
       Samme farver som figur B2.10 i Kemibogen: CoCl4 2- blaa, Co2+ lyseroed og
       Cl- graa, fordi chloridionen er farveloes. En sammensat ion er én kugle med
       formlen paa (hjemmesidens regel). */
    var ION = {
        CoCl4: { r: 17, navn: "CoCl₄²⁻", px: 9.5, f: ["#f0f4ff", "#a3bdf3", "#4a72d0", "#2f55b0"], kant: "#1f3f8f", skrift: "#0b1f55" },
        Co: { r: 12.5, navn: "Co²⁺", px: 10, f: ["#fff4f9", "#f7bad6", "#e0709f", "#c4547f"], kant: "#a8406f", skrift: "#5c1236" },
        Cl: { r: 9.5, navn: "Cl⁻", px: 9.5, f: ["#ffffff", "#f1f3f5", "#c9d0d5", "#a9b3b9"], kant: "#7b878e", skrift: "#2a343a" }
    };
    T.ION = ION;

    T.ion = function (ctx, slags, x, y, k, alfa) {
        var I = ION[slags];
        if (!I) return;
        k = k || 1;
        var r = I.r * k;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha = alfa;
        var g = ctx.createRadialGradient(x - r * 0.36, y - r * 0.4, r * 0.06, x, y, r);
        g.addColorStop(0, I.f[0]);
        g.addColorStop(0.35, I.f[1]);
        g.addColorStop(0.85, I.f[2]);
        g.addColorStop(1, I.f[3]);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = I.kant;
        ctx.stroke();
        ctx.font = font("800", I.px * k);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = I.skrift;
        ctx.fillText(I.navn, x, y + 0.5);
        ctx.restore();
    };

    /* Et ikon til signaturen: et molekyle eller en ion */
    T.ikon = function (ctx, slags, x, y, k, alfa) {
        if (ION[slags]) T.ion(ctx, slags, x, y, k, alfa);
        else T.molekyle(ctx, slags, x, y, 0, k, alfa);
    };

    /* ----- Cylinderen med stempel (fane 1) ----------------------------------------------
       C: { x, b (indvendig bredde), top (glassets kant), bund }. sY er stemplets
       underside. Gassen under stemplet er brun med styrken brun (0 til 1), som
       foelger [NO2]. Stangen er lige lang hele tiden, saa haandtaget foelger
       stemplet (som figuren i Kemibogen). */
    T.STANG = 46;
    T.cylinder = function (ctx, C, sY, brun, indhold) {
        var x0 = C.x, x1 = C.x + C.b;
        ctx.save();
        /* Skygge paa bordet */
        var sk = ctx.createRadialGradient(x0 + C.b / 2, C.bund + 6, 4, x0 + C.b / 2, C.bund + 6, C.b * 0.7);
        sk.addColorStop(0, "rgba(0, 0, 0, 0.45)");
        sk.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = sk;
        ctx.fillRect(x0 - C.b * 0.3, C.bund - 6, C.b * 1.6, 24);
        /* Gassen */
        NK.rundtRekt(ctx, x0, sY, C.b, C.bund - sY, 6);
        ctx.fillStyle = "#eef2f5";
        ctx.fill();
        if (brun > 0) {
            ctx.fillStyle = "rgba(122, 62, 18, " + NK.klamp(brun, 0, 1).toFixed(3) + ")";
            ctx.fill();
        }
        ctx.restore();
        if (indhold) {
            ctx.save();
            NK.rundtRekt(ctx, x0, sY, C.b, C.bund - sY, 6);
            ctx.clip();
            indhold();
            ctx.restore();
        }
        ctx.save();
        /* Glasset: to vaegge og en rund bund */
        ctx.lineWidth = 3.4;
        ctx.strokeStyle = "rgba(196, 214, 228, 0.9)";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0 - 2, C.top);
        ctx.lineTo(x0 - 2, C.bund - 8);
        ctx.quadraticCurveTo(x0 - 2, C.bund + 2, x0 + 8, C.bund + 2);
        ctx.lineTo(x1 - 8, C.bund + 2);
        ctx.quadraticCurveTo(x1 + 2, C.bund + 2, x1 + 2, C.bund - 8);
        ctx.lineTo(x1 + 2, C.top);
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0 - 9, C.top); ctx.lineTo(x0 - 2, C.top); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1 + 2, C.top); ctx.lineTo(x1 + 9, C.top); ctx.stroke();
        /* Glans */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x0 + 7, C.top + 12); ctx.lineTo(x0 + 7, C.bund - 14); ctx.stroke();
        /* Stemplet af staal med en gummiring */
        var sh = 15, st = sY - sh;
        var gs = ctx.createLinearGradient(0, st, 0, sY);
        gs.addColorStop(0, "#d9dee3"); gs.addColorStop(0.5, "#9aa3ab"); gs.addColorStop(1, "#5d666e");
        NK.rundtRekt(ctx, x0 + 1, st, C.b - 2, sh, 3);
        ctx.fillStyle = gs; ctx.fill();
        ctx.fillStyle = "#262b30";
        ctx.fillRect(x0 + 1, st + 5, C.b - 2, 4);
        /* Stangen og haandtaget */
        var cx = x0 + C.b / 2, gr = ctx.createLinearGradient(cx - 6, 0, cx + 6, 0);
        gr.addColorStop(0, "#7d868e"); gr.addColorStop(0.45, "#e6eaee"); gr.addColorStop(1, "#6b747c");
        ctx.fillStyle = gr;
        ctx.fillRect(cx - 5, st - T.STANG, 10, T.STANG);
        var gh = ctx.createLinearGradient(0, st - T.STANG - 12, 0, st - T.STANG);
        gh.addColorStop(0, "#e6eaee"); gh.addColorStop(1, "#7d868e");
        NK.rundtRekt(ctx, cx - 44, st - T.STANG - 12, 88, 12, 5);
        ctx.fillStyle = gh; ctx.fill();
        ctx.restore();
        return { haandtag: { x: cx - 50, y: st - T.STANG - 18, b: 100, h: T.STANG + 24 } };
    };

    /* ----- Maaleglasset (fane 2) --------------------------------------------------------
       G: { x, b, top, bund }. vY er vaeskens overflade. farve er vaeskens
       farve som [r, g, b, alfa]. Stregerne staar for hver 25 mL (mlPx). */
    T.glas = function (ctx, G, vY, farve, mlPx, indhold) {
        var x0 = G.x, x1 = G.x + G.b;
        ctx.save();
        var sk = ctx.createRadialGradient(x0 + G.b / 2, G.bund + 6, 4, x0 + G.b / 2, G.bund + 6, G.b * 0.7);
        sk.addColorStop(0, "rgba(0, 0, 0, 0.45)");
        sk.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = sk;
        ctx.fillRect(x0 - G.b * 0.3, G.bund - 6, G.b * 1.6, 24);
        /* Vaesken */
        if (vY < G.bund - 1) {
            NK.rundtRekt(ctx, x0, vY, G.b, G.bund - vY, 6);
            function blandet(a) {
                return "rgb(" + [0, 1, 2].map(function (k) { return Math.round(NK.lerp([242, 246, 250][k], farve[k], a)); }).join(",") + ")";
            }
            var gv = ctx.createLinearGradient(0, vY, 0, G.bund);
            gv.addColorStop(0, blandet(farve[3] * 0.85));
            gv.addColorStop(1, blandet(farve[3]));
            ctx.fillStyle = gv;
            ctx.fill();
            /* Overfladen */
            ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x0 + 2, vY + 1); ctx.lineTo(x1 - 2, vY + 1); ctx.stroke();
        }
        ctx.restore();
        if (indhold && vY < G.bund - 1) {
            ctx.save();
            NK.rundtRekt(ctx, x0, vY, G.b, G.bund - vY, 6);
            ctx.clip();
            indhold();
            ctx.restore();
        }
        ctx.save();
        ctx.lineWidth = 3.4;
        ctx.strokeStyle = "rgba(196, 214, 228, 0.9)";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0 - 2, G.top);
        ctx.lineTo(x0 - 2, G.bund - 8);
        ctx.quadraticCurveTo(x0 - 2, G.bund + 2, x0 + 8, G.bund + 2);
        ctx.lineTo(x1 - 8, G.bund + 2);
        ctx.quadraticCurveTo(x1 + 2, G.bund + 2, x1 + 2, G.bund - 8);
        ctx.lineTo(x1 + 2, G.top);
        ctx.stroke();
        /* Tud og glans */
        ctx.beginPath(); ctx.moveTo(x0 - 2, G.top); ctx.quadraticCurveTo(x0 - 4, G.top - 6, x0 - 11, G.top - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1 + 2, G.top); ctx.lineTo(x1 + 8, G.top); ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x0 + 7, G.top + 12); ctx.lineTo(x0 + 7, G.bund - 14); ctx.stroke();
        /* Stregerne for hver 25 mL med tal */
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "rgba(220, 230, 240, 0.75)";
        ctx.fillStyle = "rgba(220, 230, 240, 0.9)";
        ctx.font = font("600", 12);
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        for (var ml = 25; ml <= 100; ml += 25) {
            var y = G.bund - ml * mlPx / 25;
            if (y < G.top + 4) break;
            ctx.beginPath(); ctx.moveTo(x1 + 2, y); ctx.lineTo(x1 + 12, y); ctx.stroke();
            ctx.fillText(ml + " mL", x1 + 16, y);
        }
        ctx.restore();
    };

    /* Vandstraalen fra en sproejteflaske over glasset, mens der haeldes vand i */
    T.straale = function (ctx, x, y0, y1, tid, alfa) {
        ctx.save();
        ctx.globalAlpha = alfa;
        var g = ctx.createLinearGradient(x - 4, 0, x + 4, 0);
        g.addColorStop(0, "rgba(170, 210, 245, 0.35)");
        g.addColorStop(0.5, "rgba(225, 242, 255, 0.95)");
        g.addColorStop(1, "rgba(170, 210, 245, 0.35)");
        ctx.fillStyle = g;
        ctx.fillRect(x - 3.5, y0, 7, y1 - y0);
        for (var i = 0; i < 4; i++) {
            var yy = y0 + ((tid * 260 + i * 37) % Math.max(1, y1 - y0));
            ctx.fillStyle = "rgba(240, 250, 255, 0.9)";
            ctx.beginPath(); ctx.arc(x, yy, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    };

    /* ----- Danserne (fane 1, den anden visning) -------------------------------------------
       Et par (N2O4) holder hinanden i haanden; en single (NO2) danser alene og
       er brun som gassen. v er en lille svingning. */
    T.danser = function (ctx, x, y, k, farve, v, arm) {
        var hoved = 5.4 * k;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        /* Krop */
        ctx.fillStyle = farve[0];
        ctx.beginPath();
        ctx.moveTo(x - 5.5 * k, y + 13 * k);
        ctx.lineTo(x - 3 * k, y - 1 * k);
        ctx.lineTo(x + 3 * k, y - 1 * k);
        ctx.lineTo(x + 5.5 * k, y + 13 * k);
        ctx.closePath();
        ctx.fill();
        /* Ben */
        ctx.strokeStyle = farve[1];
        ctx.lineWidth = 2.2 * k;
        ctx.beginPath();
        ctx.moveTo(x - 2.5 * k, y + 13 * k); ctx.lineTo(x - 3.5 * k + Math.sin(v) * 1.5 * k, y + 20 * k);
        ctx.moveTo(x + 2.5 * k, y + 13 * k); ctx.lineTo(x + 3.5 * k - Math.sin(v) * 1.5 * k, y + 20 * k);
        ctx.stroke();
        /* Arme: arm = -1 eller 1 rakt ud mod en partner, ellers op i luften */
        ctx.beginPath();
        if (arm) {
            ctx.moveTo(x, y + 2 * k); ctx.lineTo(x + arm * 8 * k, y + 4 * k);
            ctx.moveTo(x, y + 2 * k); ctx.lineTo(x - arm * 6 * k, y - 5 * k + Math.sin(v) * 2 * k);
        } else {
            ctx.moveTo(x, y + 2 * k); ctx.lineTo(x - 7 * k, y - 6 * k + Math.sin(v) * 2.5 * k);
            ctx.moveTo(x, y + 2 * k); ctx.lineTo(x + 7 * k, y - 6 * k - Math.sin(v) * 2.5 * k);
        }
        ctx.stroke();
        /* Hoved */
        ctx.beginPath();
        ctx.arc(x, y - 5.5 * k, hoved, 0, Math.PI * 2);
        ctx.fillStyle = farve[2];
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = farve[1];
        ctx.stroke();
        ctx.restore();
    };

    T.DANS_PAR = ["#e7ecf2", "#9aa6b2", "#f4f6f8"];      /* N2O4: farveloes */
    T.DANS_SINGLE = ["#c47a3d", "#7a4214", "#e0a06a"];   /* NO2: brun */

    T.dansere = function (ctx, slags, x, y, v, k) {
        k = k || 1;
        if (slags === "N2O4") {
            T.danser(ctx, x - 6 * k, y, k, T.DANS_PAR, v, 1);
            T.danser(ctx, x + 6 * k, y, k, T.DANS_PAR, v + 1.3, -1);
        } else {
            T.danser(ctx, x, y, k, T.DANS_SINGLE, v, 0);
        }
    };

    /* ----- Reaktionsbroeken med faktoren paa hver koncentration ----------------------
       over og under er lister af [koncentration, potens]. f er faktoren ("½",
       "2") eller null. Faktoren staar lilla, ogsaa inde i en potens:
       (½ · [Cl⁻])⁴. Som regnefiguren B2.11 i Kemibogen. */
    T.LILLA = "#c3a6ff";
    var POT = { 1: "", 2: "²", 3: "³", 4: "⁴" };
    T.ledDele = function (l, f) {
        if (!f) return [[l[0] + POT[l[1]], T.TEKST]];
        if (l[1] === 1) return [[f + " · ", T.LILLA], [l[0], T.TEKST]];
        return [["(", T.TEKST], [f + " · ", T.LILLA], [l[0] + ")" + POT[l[1]], T.TEKST]];
    };

    T.broekLed = function (ctx, cx, y, over, under, f, px) {
        px = px || 17;
        ctx.save();
        ctx.font = font("700", px);
        var prik = ctx.measureText(" · ").width;
        function raekke(liste) {
            var dele = [], b = 0;
            liste.forEach(function (l, j) {
                var d = T.ledDele(l, f), w = 0;
                d.forEach(function (x) { w += ctx.measureText(x[0]).width; });
                dele.push({ d: d, w: w });
                b += w + (j ? prik : 0);
            });
            return { dele: dele, b: b };
        }
        var ro = raekke(over), ru = raekke(under);
        var yb = ctx.measureText("Y = ").width, bb = Math.max(ro.b, ru.b) + 12;
        var x0 = cx - (yb + bb) / 2, mx = x0 + yb + bb / 2;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = T.TEKST;
        ctx.fillText("Y =", x0, y);
        ctx.strokeStyle = T.TEKST;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x0 + yb, y); ctx.lineTo(x0 + yb + bb, y); ctx.stroke();
        function tegnRaekke(r, yy) {
            var x = mx - r.b / 2;
            r.dele.forEach(function (d, k) {
                if (k) { ctx.fillStyle = T.TEKST; ctx.fillText(" · ", x, yy); x += prik; }
                d.d.forEach(function (del) { ctx.fillStyle = del[1]; ctx.fillText(del[0], x, yy); x += ctx.measureText(del[0]).width; });
            });
        }
        tegnRaekke(ro, y - px * 0.74);
        tegnRaekke(ru, y + px * 0.8);
        ctx.restore();
        return { x: x0, b: yb + bb, hoejre: x0 + yb + bb, overY: y - px * 0.74, underY: y + px * 0.8 };
    };

    /* En stiplet plads til det, der dukker op, naar eleven har svaret */
    T.plads = function (ctx, x, y, b, h, tekst) {
        ctx.save();
        NK.rundtRekt(ctx, x, y, b, h, 10);
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "rgba(160, 170, 185, 0.45)";
        ctx.stroke();
        ctx.setLineDash([]);
        NK.tekst(ctx, tekst, x + b / 2, y + h / 2 + 5, { font: font("600", 13.5), farve: "rgba(160, 170, 185, 0.7)", justering: "center" });
        ctx.restore();
    };

    /* Et maerke med retningen under reaktionsskemaet */
    T.retning = function (ctx, x, y, tekst, mod) {
        ctx.save();
        ctx.font = font("800", 15);
        var b = ctx.measureText(tekst).width + 44, h = 28;
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, h / 2);
        ctx.fillStyle = "rgba(180, 150, 240, 0.16)";
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = mod < 0 ? T.VENSTRE : T.HOEJRE;
        ctx.stroke();
        ctx.fillStyle = mod < 0 ? T.VENSTRE : T.HOEJRE;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((mod < 0 ? "⟵ " : "") + tekst + (mod > 0 ? " ⟶" : ""), x, y + 0.5);
        ctx.restore();
    };

    /* ----- Talebobler over danserne (fra den gamle b2.6) ----------------------------- */
    T.boble = function (ctx, x, top, tekst, alfa, minX, maxX) {
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.font = font("600", 14);
        var bw = ctx.measureText(tekst).width + 24, bh = 30;
        var bx = NK.klamp(x - bw / 2, minX, Math.max(minX, maxX - bw)), by = top - bh - 12;
        var sx = NK.klamp(x, bx + 14, bx + bw - 14);
        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#ffffff";
        NK.rundtRekt(ctx, bx, by, bw, bh, 13);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx + 7, by + bh - 1); ctx.lineTo(sx + 1, by + bh + 10); ctx.lineTo(sx - 7, by + bh - 1);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#1e1e24";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, bx + bw / 2, by + bh / 2 + 1);
        ctx.restore();
    };

    /* En plads i rektanglet R, der ligger laengst fra de andre partikler
       (bedst af 40 forsoeg). andre: [{ x, y, r }] */
    T.friPlads = function (R, r, andre) {
        var bedst = null, bd = -Infinity;
        for (var k = 0; k < 40; k++) {
            var x = R.x0 + r + 6 + Math.random() * Math.max(1, R.x1 - R.x0 - 2 * r - 12);
            var y = R.y0 + r + 6 + Math.random() * Math.max(1, R.y1 - R.y0 - 2 * r - 12);
            var d = 1e9;
            andre.forEach(function (a) { d = Math.min(d, Math.hypot(a.x - x, a.y - y) - a.r - r); });
            if (d > bd) { bd = d; bedst = { x: x, y: y }; }
            if (d > 8) break;
        }
        return bedst;
    };

    NK.Tegn = T;
}());
