/* =====================================================================
   graf.js - grafen: journalens maalinger tegnet op (M9)

   Journalen kan notere en maaling; grafen viser den. K1 fandt to former i
   de gamle forsoeg, og grafen kan netop dem:

     * en kurve med nummererede maalepunkter oven paa (sc2.7:
       oploeseligheden 0-100 °C, elevens tre maalinger paa tabelkurven)
     * soejler, én pr. kategori (sc1.3: de syv blandinger mod knaldets
       styrke)

       NK.Graf.tegn(laerred, {
           x: { navn: "Temperatur", enhed: "°C", min: 0, max: 100 },
           y: { navn: "Opløselighed", enhed: "g PbI₂ pr. 100 mL", min: 0 },
           serier: [
               { type: "kurve", f: function (T) { return ...; }, navn: "Tabelværdier" },
               { type: "punkter", punkter: [{ x: 52, y: 0.146, tekst: "1" }], navn: "Dine målinger" }
           ]
       });

   Serierne:
     { type: "kurve", f: fn(x) | punkter: [{ x, y }], farve, navn, stiplet }
     { type: "punkter", punkter: [{ x, y, tekst, forkert }], farve, navn }
     { type: "soejler", punkter: [{ x: "1:2", y, tekst }], farve, navn }
   En soejle-graf har kategorier paa x-aksen (x er en tekst), og de staar i
   den raekkefoelge, de kommer.

   Akserne: min og max kan staa i definitionen; det, der ikke staar, regnes
   af data, saa akserne skalerer efter maalingerne (runde trin: 1, 2 eller
   5 gange en tierpotens). trin kan ogsaa staa. Tal skrives med dansk
   komma og rigtigt minus.

   Der tegnes i laerredets CSS-stoerrelse og i skaermens oploesning, saa
   grafen er skarp. tegn returnerer grafens maal (tilX, tilY, felt og de
   tegnede punkter i pixel), saa en selvtest kan holde punkterne op mod
   akserne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var FARVER = {
        baggrund: "#1a1e26", gitter: "rgba(255, 255, 255, 0.07)", akse: "rgba(255, 255, 255, 0.4)",
        tal: "#9fa6af", navn: "#d3d9e1", kurve: "#3d9ee0", punkt: "#f2c53d", forkert: "#e8744f",
        soejle: "#3d9ee0", kant: "#1a1e26"
    };
    var SKRIFT = "'Segoe UI', Arial, sans-serif";

    /* Et tal med dansk komma og rigtigt minus. dec decimaler; kort: uden
       nuller til sidst (0,10 bliver 0,1) */
    function komma(x, dec, kort) {
        dec = dec || 0;
        if (Math.abs(x) < 0.5 * Math.pow(10, -dec)) x = 0;
        var s = x.toFixed(dec);
        if (kort && dec > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
        return s.replace(".", ",").replace("-", "\u2212");
    }

    /* Hvor mange decimaler t skal have for at staa praecist (hoejst 4) */
    function decimaler(t) {
        for (var d = 0; d < 4; d++) {
            var v = Math.abs(t) * Math.pow(10, d);
            if (Math.abs(v - Math.round(v)) < 1e-6 * Math.max(1, v)) return d;
        }
        return 4;
    }

    /* Et rundt trin (1, 2 eller 5 gange en tierpotens), saa der bliver
       omkring n inddelinger paa spaendet: det runde trin, der ligger
       naermest spaend/n (regnet i tierpotenser) */
    function rundtTrin(spaend, n) {
        if (!(spaend > 0)) return 1;
        var raa = spaend / Math.max(1, n || 5);
        var p = Math.pow(10, Math.floor(Math.log(raa) / Math.LN10));
        var bedst = p, afst = Infinity;
        [1, 2, 5, 10].forEach(function (r) {
            var a = Math.abs(Math.log(r * p / raa));
            if (a < afst - 1e-12) { afst = a; bedst = r * p; }
        });
        return bedst;
    }

    /* Aksens graenser og trin. givet: { min, max, trin }; data: tallene.
       Det, der ikke er givet, regnes af data og rundes ud til et trin. */
    function akse(givet, data, n) {
        givet = givet || {};
        var lo = Infinity, hi = -Infinity;
        (data || []).forEach(function (v) { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
        if (lo === Infinity) { lo = 0; hi = 1; }
        var min = givet.min !== undefined ? givet.min : (lo >= 0 ? 0 : lo);
        var max = givet.max !== undefined ? givet.max : hi;
        if (!(max > min)) max = min + (Math.abs(min) || 1);
        var trin = givet.trin || rundtTrin(max - min, n);
        if (givet.min === undefined) min = Math.floor(min / trin + 1e-9) * trin;
        if (givet.max === undefined) {
            max = Math.ceil(max / trin - 1e-9) * trin;
            /* Luft over det hoejeste punkt, saa det ikke rammer kanten */
            if (hi > -Infinity && max - hi < 0.1 * (max - min)) max += trin;
        }
        if (!(max > min)) max = min + trin;
        var dec = Math.max(decimaler(trin), decimaler(min));
        var antal = Math.round((max - min) / trin);
        return { min: min, max: max, trin: trin, dec: dec, antal: antal,
                 streger: function () { var a = []; for (var k = 0; k <= antal; k++) a.push(min + k * trin); return a; } };
    }

    function tekst(ctx, t, x, y, str, vaegt, farve, just, linje) {
        ctx.font = (vaegt || 600) + " " + str + "px " + SKRIFT;
        ctx.fillStyle = farve;
        ctx.textAlign = just || "left";
        ctx.textBaseline = linje || "middle";
        ctx.fillText(t, x, y);
    }

    function proevF(f, x) {
        try { var y = f(x); return isFinite(y) ? y : null; } catch (e) { return null; }
    }

    function tegn(laerred, def) {
        var dpr = window.devicePixelRatio || 1;
        var B = laerred.clientWidth || parseFloat(laerred.getAttribute("width")) || 360;
        var H = laerred.clientHeight || parseFloat(laerred.getAttribute("height")) || 200;
        laerred.width = Math.round(B * dpr);
        laerred.height = Math.round(H * dpr);
        var ctx = laerred.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return tegnPaa(ctx, B, H, def);
    }

    /* Tegner grafen i (0, 0, B, H) paa en given ctx (ogsaa en tegneseries
       rude) */
    function tegnPaa(ctx, B, H, def) {
        def = def || {};
        var F = {}, n;
        for (n in FARVER) if (Object.prototype.hasOwnProperty.call(FARVER, n)) F[n] = (def.farver && def.farver[n]) || FARVER[n];
        var serier = def.serier || [];
        var soejler = serier.filter(function (s) { return s.type === "soejler"; })[0] || null;
        var kategorier = [];
        if (soejler) soejler.punkter.forEach(function (p) { if (kategorier.indexOf(String(p.x)) < 0) kategorier.push(String(p.x)); });

        /* Data til akserne */
        var xs = [], ys = [];
        serier.forEach(function (s) {
            (s.punkter || []).forEach(function (p) { if (!soejler) xs.push(+p.x); ys.push(+p.y); });
        });
        var ax = soejler ? null : akse(def.x, xs, 5);
        if (ax) {
            serier.forEach(function (s) {
                if (s.type === "kurve" && s.f) for (var i = 0; i <= 40; i++) { var yv = proevF(s.f, ax.min + (ax.max - ax.min) * i / 40); if (yv !== null) ys.push(yv); }
            });
        }
        var ay = akse(def.y, ys, 4);

        /* Aksernes navne og forklaringen (de serier, der har et navn) */
        var str = def.str || 11;
        function navn(a) { return a ? (a.navn || "") + (a.enhed ? (a.navn ? " (" + a.enhed + ")" : a.enhed) : "") : ""; }
        var xNavn = navn(def.x), yNavn = navn(def.y);
        var navne = serier.filter(function (s) { return s.navn && (s.type !== "punkter" || (s.punkter && s.punkter.length)); });
        ctx.save();
        ctx.font = "600 " + str + "px " + SKRIFT;
        function bredde(t) { return t ? ctx.measureText(t).width : 0; }
        var forklB = 0;
        navne.forEach(function (s) { forklB += bredde(s.navn) + 26; });
        /* Forklaringen staar oeverst til hoejre, hvis der er plads ved y-aksens
           navn, ellers i sin egen raekke nederst */
        var forklOeverst = bredde(yNavn) + 4 + forklB + 12 <= B;
        var raekke = str + 6;
        var ytalB = 0;
        ay.streger().forEach(function (v) { ytalB = Math.max(ytalB, bredde(komma(v, ay.dec))); });
        /* Til hoejre: plads til halvdelen af det sidste tal paa x-aksen */
        var xHoejre = ax ? bredde(komma(ax.max, ax.dec)) / 2 + 4 : 0;
        var o = { x0: Math.ceil(ytalB + 10), x1: B - Math.max(10, Math.ceil(xHoejre)), y0: str + 14,
                  y1: H - (str * 2 + 12) - (forklOeverst || !navne.length ? 0 : raekke) };
        function tilX(x) { return o.x0 + (o.x1 - o.x0) * (x - ax.min) / (ax.max - ax.min); }
        function tilY(y) { return o.y1 - (o.y1 - o.y0) * (y - ay.min) / (ay.max - ay.min); }
        function katX(i) { return o.x0 + (o.x1 - o.x0) * (i + 0.5) / kategorier.length; }

        ctx.fillStyle = F.baggrund;
        ctx.fillRect(0, 0, B, H);

        /* Gitter og akser */
        ctx.lineWidth = 1;
        ctx.strokeStyle = F.gitter;
        ctx.beginPath();
        ay.streger().forEach(function (v) { var gy = Math.round(tilY(v)) + 0.5; ctx.moveTo(o.x0, gy); ctx.lineTo(o.x1, gy); });
        if (ax) ax.streger().forEach(function (v) { var gx = Math.round(tilX(v)) + 0.5; ctx.moveTo(gx, o.y0); ctx.lineTo(gx, o.y1); });
        ctx.stroke();
        ctx.strokeStyle = F.akse;
        ctx.beginPath();
        ctx.moveTo(o.x0 + 0.5, o.y0 - 6);
        ctx.lineTo(o.x0 + 0.5, o.y1 + 0.5);
        ctx.lineTo(o.x1 + 3, o.y1 + 0.5);
        ctx.stroke();

        /* Tal paa akserne */
        function aksetal(v, a) { return Math.abs(v) < a.trin * 1e-6 ? "0" : komma(v, a.dec); }
        ay.streger().forEach(function (v) { tekst(ctx, aksetal(v, ay), o.x0 - 5, tilY(v), str, 600, F.tal, "right"); });
        if (ax) ax.streger().forEach(function (v) { tekst(ctx, aksetal(v, ax), tilX(v), o.y1 + str * 0.5 + 6, str, 600, F.tal, "center"); });
        else kategorier.forEach(function (k, i) { tekst(ctx, k, katX(i), o.y1 + str * 0.5 + 6, str, 600, F.tal, "center"); });

        /* Aksernes navne: x under tallene til hoejre, y oeverst til venstre */
        var xNavnY = o.y1 + str * 1.5 + 9;
        if (xNavn) tekst(ctx, xNavn, o.x1, xNavnY, str, 600, F.navn, "right");
        if (yNavn) tekst(ctx, yNavn, 4, str * 0.5 + 3, str, 600, F.navn, "left");

        var tegnet = [];
        ctx.save();
        ctx.beginPath();
        ctx.rect(o.x0, o.y0 - 8, o.x1 - o.x0 + 8, o.y1 - o.y0 + 8);
        ctx.clip();
        /* Soejler */
        if (soejler) {
            var bb = (o.x1 - o.x0) / Math.max(1, kategorier.length) * 0.62;
            soejler.punkter.forEach(function (p) {
                var i = kategorier.indexOf(String(p.x)), cx = katX(i), top = tilY(+p.y), bund = tilY(Math.max(ay.min, 0));
                ctx.fillStyle = p.farve || soejler.farve || F.soejle;
                ctx.fillRect(cx - bb / 2, Math.min(top, bund), bb, Math.abs(bund - top));
                tegnet.push({ serie: soejler.navn || "", x: p.x, y: +p.y, px: cx, py: top });
            });
        }
        /* Kurver */
        serier.forEach(function (s) {
            if (s.type !== "kurve" || !ax) return;
            var pts = [];
            if (s.f) for (var i = 0; i <= 120; i++) { var xv = ax.min + (ax.max - ax.min) * i / 120, yv = proevF(s.f, xv); if (yv !== null) pts.push([tilX(xv), tilY(yv)]); }
            else (s.punkter || []).slice().sort(function (a, b) { return a.x - b.x; }).forEach(function (p) { pts.push([tilX(+p.x), tilY(+p.y)]); });
            if (pts.length < 2) return;
            ctx.strokeStyle = s.farve || F.kurve;
            ctx.lineWidth = s.bredde || 2.2;
            ctx.setLineDash(s.stiplet ? [6, 4] : []);
            ctx.beginPath();
            pts.forEach(function (q, k) { if (k) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
            ctx.stroke();
            ctx.setLineDash([]);
        });
        ctx.restore();
        /* Punkter: oven paa det hele, med nummer */
        serier.forEach(function (s) {
            if (s.type !== "punkter" || !ax) return;
            (s.punkter || []).forEach(function (p) {
                var px = tilX(+p.x), py = tilY(+p.y), r = s.radius || 7.5;
                ctx.fillStyle = p.forkert ? F.forkert : (s.farve || F.punkt);
                ctx.strokeStyle = F.kant;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                if (p.tekst !== undefined) tekst(ctx, String(p.tekst), px, py + 0.5, r * 1.2, 800, "#221a05", "center");
                tegnet.push({ serie: s.navn || "", x: +p.x, y: +p.y, px: px, py: py, tekst: p.tekst });
            });
        });

        /* Forklaringen */
        var fx = o.x1, fy = forklOeverst ? str * 0.5 + 3 : xNavnY + raekke;
        if (!forklOeverst) { fx = o.x0 + forklB; }
        navne.slice().reverse().forEach(function (s) {
            ctx.font = "600 " + str + "px " + SKRIFT;
            var w = bredde(s.navn);
            tekst(ctx, s.navn, fx, fy, str, 600, F.navn, "right");
            var mx = fx - w - 10, my = fy;
            if (s.type === "punkter") {
                ctx.fillStyle = s.farve || F.punkt;
                ctx.beginPath(); ctx.arc(mx, my, 4.5, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.strokeStyle = s.farve || (s.type === "soejler" ? F.soejle : F.kurve);
                ctx.lineWidth = s.type === "soejler" ? 7 : 2.2;
                ctx.setLineDash(s.stiplet ? [4, 3] : []);
                ctx.beginPath(); ctx.moveTo(mx - 7, my); ctx.lineTo(mx + 5, my); ctx.stroke();
                ctx.setLineDash([]);
            }
            fx = mx - 16;
        });
        ctx.restore();

        return { felt: o, x: ax, y: ay, tilX: ax ? tilX : null, tilY: tilY, kategorier: kategorier, punkter: tegnet,
                 forklaring: navne.length ? (forklOeverst ? "oeverst" : "nederst") : null, bredde: B, hoejde: H };
    }

    NK.Graf = { tegn: tegn, tegnPaa: tegnPaa, akse: akse, rundtTrin: rundtTrin, komma: komma, FARVER: FARVER };
}());
