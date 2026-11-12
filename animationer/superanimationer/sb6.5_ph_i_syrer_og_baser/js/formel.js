/* =====================================================================
   formel.js - formler og regnestykker paa laerredet

   Formlerne skrives som i data.js: "H_3O^+", "CO_3^2-", "10^{-4,76}",
   "K_s". _ saenker (tal og smaa bogstaver), ^ haever (tal, + og −), og {}
   samler en laengere del. Minus i en saenket eller haevet del bliver −.

   F.tekst(ctx, s, x, y, fs, farve, just, opt)   en formel; y er midten af
       bogstaverne. Giver kassen { x, y, w, h }.
   F.bredde(ctx, s, fs, vaegt)                   formlens bredde
   F.linje(ctx, dele, x, y, fs, farve, just)     et regnestykke paa én linje:
       dele er tekster og broeker { b: [taeller, naevner] }, fx
       ["K_s =", { b: ["[B] · [H_3O^+]", "[S]"] }, "= 1,82 · 10^{-4} M"].
       Broekerne faar en rigtig broekstreg. Giver kasserne for delene.
       Taeller, naevner og { t } maa vaere stykker med hver sin farve.
   F.linjeBredde(ctx, dele, fs)                  linjens bredde
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = {};
    var FONT = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    F.FONT = FONT;

    function skrift(fs, vaegt) { return (vaegt || 600) + " " + fs + "px " + FONT; }

    /* "^+H_3N" -> [{t:"+", sup}, {t:"H"}, {t:"3", sub}, {t:"N"}] */
    function dele(s) {
        var ud = [], i = 0, tekst = "";
        s = String(s);
        function slip() { if (tekst) { ud.push({ t: tekst }); tekst = ""; } }
        while (i < s.length) {
            var c = s.charAt(i);
            if ((c === "_" || c === "^") && i + 1 < s.length) {
                var j = i + 1, run = "";
                if (s.charAt(j) === "{") {
                    var k = s.indexOf("}", j);
                    if (k < 0) k = s.length;
                    run = s.slice(j + 1, k);
                    j = k + 1;
                } else if (c === "_") {
                    while (j < s.length && /[0-9a-z]/.test(s.charAt(j))) { run += s.charAt(j); j++; }
                } else {
                    while (j < s.length && /[0-9+\-]/.test(s.charAt(j))) { run += s.charAt(j); j++; }
                }
                if (!run) { tekst += c; i++; continue; }
                slip();
                /* En saenket del inde i en haevet del: 10^{-pK_s} */
                var inde = c === "^" ? run.indexOf("_") : -1;
                if (inde >= 0) {
                    ud.push({ t: run.slice(0, inde).replace(/-/g, "−"), sup: true });
                    ud.push({ t: run.slice(inde + 1), supsub: true });
                } else {
                    ud.push({ t: run.replace(/-/g, "−"), sub: c === "_", sup: c === "^" });
                }
                i = j;
            } else {
                tekst += c;
                i++;
            }
        }
        slip();
        return ud;
    }

    function maalDele(ctx, d, fs, vaegt) {
        var b = 0;
        d.forEach(function (x) {
            ctx.font = skrift(x.supsub ? fs * 0.5 : (x.sub || x.sup ? fs * 0.66 : fs), vaegt);
            x.w = ctx.measureText(x.t).width;
            x.x = b;
            b += x.w;
        });
        return b;
    }

    F.bredde = function (ctx, s, fs, vaegt) {
        ctx.save();
        var b = maalDele(ctx, dele(s), fs, vaegt);
        ctx.restore();
        return b;
    };

    F.tekst = function (ctx, s, x, y, fs, farve, just, opt) {
        opt = opt || {};
        var d = dele(s);
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        var b = maalDele(ctx, d, fs, opt.vaegt);
        var x0 = just === "right" ? x - b : (just === "center" ? x - b / 2 : x);
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        d.forEach(function (del) {
            ctx.font = skrift(del.supsub ? fs * 0.5 : (del.sub || del.sup ? fs * 0.66 : fs), opt.vaegt);
            var dy = del.sub ? fs * 0.3 : (del.sup ? -fs * 0.38 : (del.supsub ? -fs * 0.22 : 0));
            if (opt.kant) {
                ctx.lineWidth = opt.kantBredde || 4;
                ctx.strokeStyle = opt.kant;
                ctx.lineJoin = "round";
                ctx.strokeText(del.t, x0 + del.x, y + dy + fs * 0.04);
            }
            ctx.fillStyle = farve || "#14201f";
            ctx.fillText(del.t, x0 + del.x, y + dy + fs * 0.04);
        });
        ctx.restore();
        return { x: x0, y: y - fs * 0.66, w: b, h: fs * 1.32 };
    };

    /* ----- Stykker med hver sin farve ------------------------------------------
       En tekst kan vaere en liste af stykker: ["(", { t: "[B]", farve: blaa },
       " · ", { t: "[H_3O^+]", farve: lilla }]. Saa kan tallene i en broek
       have samme farve som stofferne i reaktionsskemaet. */
    function stykke(x) { return typeof x === "string" ? { t: x } : x; }
    F.stykBredde = function (ctx, s, fs, vaegt) {
        if (!Array.isArray(s)) return F.bredde(ctx, s, fs, vaegt);
        return s.reduce(function (a, x) { return a + F.bredde(ctx, stykke(x).t, fs, vaegt); }, 0);
    };
    F.stykTekst = function (ctx, s, x, y, fs, farve, just, opt) {
        if (!Array.isArray(s)) return F.tekst(ctx, s, x, y, fs, farve, just, opt);
        var b = F.stykBredde(ctx, s, fs, opt && opt.vaegt);
        var x0 = just === "right" ? x - b : (just === "center" ? x - b / 2 : x), xs = x0;
        s.forEach(function (x) {
            var d = stykke(x);
            xs += F.tekst(ctx, d.t, xs, y, fs, d.farve || farve, "left", opt).w;
        });
        return { x: x0, y: y - fs * 0.66, w: b, h: fs * 1.32 };
    };

    /* ----- Et regnestykke paa én linje ---------------------------------------- */
    var MELLEM = 0.32;      /* luft mellem delene (i fs) */

    function delBredde(ctx, del, fs, vaegt) {
        if (del && del.b) return Math.max(F.stykBredde(ctx, del.b[0], fs * 0.86, vaegt), F.stykBredde(ctx, del.b[1], fs * 0.86, vaegt)) + fs * 0.4;
        if (del && del.t !== undefined) return F.stykBredde(ctx, del.t, fs, del.vaegt || vaegt);
        return F.bredde(ctx, String(del), fs, vaegt);
    }

    F.linjeBredde = function (ctx, d, fs, vaegt) {
        var b = 0;
        d.forEach(function (del, i) { b += delBredde(ctx, del, fs, vaegt) + (i ? fs * MELLEM : 0); });
        return b;
    };

    F.linje = function (ctx, d, x, y, fs, farve, just, opt) {
        opt = opt || {};
        var b = F.linjeBredde(ctx, d, fs, opt.vaegt);
        var x0 = just === "right" ? x - b : (just === "center" ? x - b / 2 : x);
        var kasser = [];
        d.forEach(function (del, i) {
            if (i) x0 += fs * MELLEM;
            var w = delBredde(ctx, del, fs, opt.vaegt);
            if (del && del.b) {
                var f2 = fs * 0.86, mx = x0 + w / 2;
                F.stykTekst(ctx, del.b[0], mx, y - fs * 0.62, f2, del.farve || farve, "center", opt);
                F.stykTekst(ctx, del.b[1], mx, y + fs * 0.66, f2, del.farve || farve, "center", opt);
                ctx.save();
                ctx.strokeStyle = del.farve || farve || "#14201f";
                ctx.lineWidth = Math.max(1.4, fs * 0.075);
                ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(x0 + fs * 0.08, y + fs * 0.02); ctx.lineTo(x0 + w - fs * 0.08, y + fs * 0.02); ctx.stroke();
                ctx.restore();
                kasser.push({ x: x0, y: y - fs * 1.2, w: w, h: fs * 2.4 });
            } else if (del && del.t !== undefined) {
                kasser.push(F.stykTekst(ctx, del.t, x0, y, fs, del.farve || farve, "left", { vaegt: del.vaegt || opt.vaegt, alfa: opt.alfa }));
            } else {
                kasser.push(F.tekst(ctx, String(del), x0, y, fs, farve, "left", opt));
            }
            x0 += w;
        });
        return { b: b, kasser: kasser };
    };

    /* Har linjen en broek? Saa er den hoejere */
    F.harBroek = function (d) { return d.some(function (del) { return del && del.b; }); };

    NK.Formel = F;
}());
