/* =====================================================================
   tegning.js - det, begge faner tegner

   Glassene med stoffet og etiketten, ionkuglerne, etiketmaskinen,
   reolen, plakaterne, arbejdsbordet, samlebaandet og kassen. Alle
   funktionerne tegner ét ting et bestemt sted og husker intet selv;
   fanerne bestemmer, hvor tingene staar, og hvordan de bevaeger sig.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }

    /* ----- Farver --------------------------------------------------------- */
    function rgb(hex) {
        var h = hex.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    /* t > 0 blander mod hvid, t < 0 mod sort */
    function nuance(hex, t) {
        var c = rgb(hex), maal = t > 0 ? 255 : 0, a = Math.abs(t);
        return "rgb(" + c.map(function (v) { return Math.round(v + (maal - v) * a); }).join(",") + ")";
    }
    T.nuance = nuance;

    /* Et fast pseudo-tilfaeldigt tal pr. glas, saa kornene ikke danser */
    function froe(n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }

    /* ----- Glasset -------------------------------------------------------- */
    function etiketRekt(x0, y0, k) {
        var M = MAAL.pulverglas;
        return { x: x0 + M.etiketV * k, y: y0 + M.etiketTop * k, b: (M.etiketH - M.etiketV) * k, h: (M.etiketBund - M.etiketTop) * k };
    }

    /* Etiketfeltet paa et glas med bundmidte (x, y) og hoejde h */
    T.etiketRekt = function (x, y, h, bred) {
        var k = h / MAAL.pulverglas.h;
        var x0 = x - MAAL.pulverglas.b * k / 2, y0 = y - h;
        return bred ? { x: x0 + 9 * k, y: y0 + 50 * k, b: 82 * k, h: 62 * k } : etiketRekt(x0, y0, k);
    };

    T.glasBredde = function (h) { return h * MAAL.pulverglas.b / MAAL.pulverglas.h; };

    function tegnStof(ctx, x0, y0, k, st, fyld, korn) {
        var M = MAAL.pulverglas;
        var iv = x0 + M.indV * k, ih = x0 + M.indH * k, it = y0 + M.indTop * k, ib = y0 + M.indBund * k;
        ctx.save();
        NK.rundtRekt(ctx, iv, it, ih - iv, ib - it, M.indR * k);
        ctx.clip();
        var top = ib - (ib - it) * fyld;
        var mx = (iv + ih) / 2;
        ctx.beginPath();
        ctx.moveTo(iv, ib + 2);
        ctx.lineTo(iv, top + 5 * k);
        ctx.quadraticCurveTo(mx, top - 8 * k, ih, top + 5 * k);
        ctx.lineTo(ih, ib + 2);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, top - 8 * k, 0, ib);
        g.addColorStop(0, nuance(st.farve, 0.1));
        g.addColorStop(1, nuance(st.farve, -0.2));
        ctx.fillStyle = g;
        ctx.fill();
        if (korn) {
            ctx.clip();
            var r = froe(st.nr + 3);
            var n = st.form === "piller" ? 30 : (st.form === "krystal" ? 46 : 80);
            for (var i = 0; i < n; i++) {
                var px = iv + r() * (ih - iv), py = top - 4 * k + r() * (ib - top + 6 * k);
                if (st.form === "piller") {
                    ctx.fillStyle = nuance(st.farve, -0.1);
                    ctx.beginPath();
                    ctx.ellipse(px, py, 4.4 * k, 3.1 * k, r() * 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
                    ctx.beginPath();
                    ctx.ellipse(px - 1.3 * k, py - 1 * k, 1.7 * k, 1 * k, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else if (st.form === "krystal") {
                    var s = (1.6 + r() * 2.4) * k;
                    ctx.fillStyle = r() < 0.5 ? nuance(st.farve, 0.35) : nuance(st.farve, -0.22);
                    ctx.save();
                    ctx.translate(px, py);
                    ctx.rotate(r() * 1.5);
                    ctx.fillRect(-s / 2, -s / 2, s, s);
                    ctx.restore();
                } else {
                    ctx.fillStyle = r() < 0.5 ? nuance(st.farve, 0.22) : nuance(st.farve, -0.18);
                    ctx.fillRect(px, py, 1.3 * k, 1.3 * k);
                }
            }
        }
        ctx.restore();
    }

    /* Et glas med bundmidte (x, y) og hoejden h.
       v.etiket   "gammel" (den revne), "ny" (den printede) eller "ingen"
       v.retning  hvilken halvdel der mangler paa den gamle etiket
       v.lys      0-1: en gul ramme, naar glasset kan klikkes
       v.stjerne  0-1: loest uden at se svaret
       v.vip      drejning i radianer om bunden
       v.alfa     gennemsigtighed */
    T.glas = function (ctx, x, y, h, st, v) {
        v = v || {};
        var M = MAAL.pulverglas, k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = y - h;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        if (v.vip) {
            ctx.translate(x, y);
            ctx.rotate(v.vip);
            ctx.translate(-x, -y);
        }

        if (!v.udenSkygge) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.beginPath();
            ctx.ellipse(x, y - 1, b * 0.46, Math.max(2, 4 * k), 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.9 * v.lys) + ")";
            ctx.lineWidth = Math.max(2, 3 * k);
            NK.rundtRekt(ctx, x0 + 2 * k, y0 - 3 * k, b - 4 * k, h + 5 * k, 14 * k);
            ctx.stroke();
            ctx.restore();
        }

        tegnStof(ctx, x0, y0, k, st, v.fyld === undefined ? 0.6 : v.fyld, h > 70);

        if (!NK.Sprites.tegn(ctx, "pulverglas", x0, y0, b, h)) {
            ctx.strokeStyle = "rgba(220, 236, 248, 0.7)";
            ctx.lineWidth = 1.4;
            NK.rundtRekt(ctx, x0 + 8 * k, y0 + 29 * k, 84 * k, 99 * k, 10 * k);
            ctx.stroke();
            ctx.fillStyle = "#2c313d";
            NK.rundtRekt(ctx, x0 + 15 * k, y0 + 2 * k, 70 * k, 20 * k, 3 * k);
            ctx.fill();
        }

        /* En bred etiket gaar lidt om paa siderne af glasset, saa navnet
           kan laeses paa et mindre glas (hylden paa samlebaandet) */
        var e = T.etiketRekt(x, y, h, v.bredEtiket);
        var medTekst = v.tekst !== undefined ? v.tekst : h >= 105;
        if (v.etiket === "ny") T.nyEtiket(ctx, e.x, e.y, e.b, e.h, st, { tekst: medTekst });
        else if (v.etiket !== "ingen") T.gammelEtiket(ctx, e.x, e.y, e.b, e.h, st, { tekst: medTekst, retning: v.retning || st.retning });

        if (v.stjerne) T.stjerne(ctx, x + b * 0.36, y0 + 3 * k, Math.max(6, 9 * k), v.stjerne);
        ctx.restore();
        return { x: x0, y: y0, b: b, h: h, etiket: e };
    };

    /* ----- Etiketterne ------------------------------------------------------ */

    /* Den stoerste skrift, hvor alle linjerne kan vaere i bredden b. Kan
       en linje ikke vaere der selv ved mindst, gaar skriften under mindst,
       saa den aldrig loeber ud over etiketten. */
    function faelles(ctx, linjer, b, stoerst, mindst, vaegt) {
        return Math.min.apply(null, linjer.map(function (l) {
            var px = NK.passendeSkrift(ctx, l, b, stoerst, mindst, vaegt);
            var bredde = ctx.measureText(l).width;
            return bredde > b ? px * b / bredde : px;
        }));
    }

    /* Navnet paa én linje, delt i positiv og negativ ion paa to eller med
       hydrogen- paa sin egen linje. Der vaelges den opdeling, der giver
       den stoerste skrift; flere linjer kun, hvis det giver tydeligt mere. */
    function navnLinjer(ctx, st, b, stoerst, mindst, vaegt) {
        var an = st.anIon.navn;
        var muligheder = [[st.navn], [st.katIon.saltdel, an]];
        if (an.indexOf("hydrogen") === 0 && an.length > 8) muligheder.push([st.katIon.saltdel, "hydrogen-", an.slice(8)]);
        var bedst = null;
        muligheder.forEach(function (linjer) {
            var px = faelles(ctx, linjer, b, stoerst, mindst, vaegt);
            if (!bedst || px > bedst.px + 1.5) bedst = { linjer: linjer, px: px };
        });
        return bedst;
    }

    /* Teksten paa en etiket: navnet foroven, formlen forneden.
       o.navn / o.formel: hvilke af delene der staar paa etiketten.
       Staar begge dele der, stables de og centreres, saa de aldrig
       overlapper; paa den revne etiket staar hver del i sin halvdel. */
    function etiketTekst(ctx, st, x, y, b, h, o) {
        var band = Math.max(2, h * 0.08);
        var bi = b * 0.9, cx = x + b / 2;
        var navnStr = NK.klamp(h * 0.2, 9, 16);
        var formelStr = NK.klamp(h * 0.32, 11, 28);
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = o.farve;
        var vaegt = o.navnVaegt || "600";
        if (o.navn && o.formel) {
            var nl2 = navnLinjer(ctx, st, bi, navnStr, 9, vaegt);
            var fpx = NK.passendeSkrift(ctx, st.formelTekst, bi, formelStr, 10, "700");
            var npx = nl2.px, lh = 1.12;
            var blok = nl2.linjer.length * npx * lh + npx * 0.25 + fpx * 1.05;
            var plads = (h - band) * 0.92;
            if (blok > plads) {
                var s = plads / blok;
                npx *= s;
                fpx *= s;
                blok = plads;
            }
            var top = y + band + (h - band - blok) / 2;
            ctx.font = font(vaegt, npx);
            nl2.linjer.forEach(function (l, i) { ctx.fillText(l, cx, top + npx * lh * (i + 0.5)); });
            ctx.font = font("700", fpx);
            ctx.fillText(st.formelTekst, cx, top + nl2.linjer.length * npx * lh + npx * 0.25 + fpx * 0.55);
            ctx.restore();
            return;
        }
        var midtNavn = y + band + (h - band) * 0.3;
        var midtFormel = y + band + (h - band) * 0.74;
        if (o.navn) {
            var nl = navnLinjer(ctx, st, bi, navnStr, 9, vaegt);
            ctx.font = font(vaegt, nl.px);
            nl.linjer.forEach(function (l, i) {
                ctx.fillText(l, cx, midtNavn + (i - (nl.linjer.length - 1) / 2) * nl.px * 1.1);
            });
        }
        if (o.formel) {
            NK.passendeSkrift(ctx, st.formelTekst, bi, formelStr, 10, "700");
            ctx.fillText(st.formelTekst, cx, midtFormel);
        }
        ctx.restore();
    }

    /* Den nye, printede etiket: hvidt papir, begge halvdele */
    T.nyEtiket = function (ctx, x, y, b, h, st, v) {
        v = v || {};
        ctx.save();
        ctx.fillStyle = "#fbfbf7";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, x, y, b, h, Math.min(4, h * 0.08));
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = D.HYLDER[st.hylde].farve;
        ctx.fillRect(x + 1, y + 1, b - 2, Math.max(2, h * 0.08));
        if (v.tekst !== false) etiketTekst(ctx, st, x, y, b, h, { navn: true, formel: true, farve: "#1c1f26" });
        ctx.restore();
    };

    /* Den gamle etiket: gulnet papir, hvor den ene halvdel er revet af */
    T.gammelEtiket = function (ctx, x, y, b, h, st, v) {
        v = v || {};
        var r = froe(st.nr + 11);
        var mangler = v.retning === "navn" ? "navn" : "formel";
        var revY = y + h * (mangler === "formel" ? 0.58 : 0.46);
        var tak = Math.max(2.5, h * 0.06);

        ctx.save();
        ctx.translate(x + b / 2, y + h / 2);
        ctx.rotate(-0.025 + (r() - 0.5) * 0.03);
        ctx.translate(-(x + b / 2), -(y + h / 2));

        /* Limen, der er tilbage, hvor papiret sad */
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
        NK.rundtRekt(ctx, x, y, b, h, 3);
        ctx.fill();

        /* Papiret med den revne kant */
        ctx.beginPath();
        var trin = 8, i, px;
        if (mangler === "formel") {
            ctx.moveTo(x, y);
            ctx.lineTo(x + b, y);
            ctx.lineTo(x + b, revY + (r() - 0.5) * tak);
            for (i = trin - 1; i >= 1; i--) {
                px = x + b * i / trin;
                ctx.lineTo(px, revY + (r() - 0.5) * tak * 2);
            }
            ctx.lineTo(x, revY + (r() - 0.5) * tak);
        } else {
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + b, y + h);
            ctx.lineTo(x + b, revY + (r() - 0.5) * tak);
            for (i = trin - 1; i >= 1; i--) {
                px = x + b * i / trin;
                ctx.lineTo(px, revY + (r() - 0.5) * tak * 2);
            }
            ctx.lineTo(x, revY + (r() - 0.5) * tak);
        }
        ctx.closePath();
        ctx.fillStyle = "#ece0bf";
        ctx.fill();
        ctx.strokeStyle = "rgba(90, 70, 30, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.save();
        ctx.clip();
        if (mangler === "formel") {
            ctx.fillStyle = nuance(D.HYLDER[st.hylde].farve, -0.15);
            ctx.globalAlpha *= 0.75;
            ctx.fillRect(x, y, b, Math.max(2, h * 0.08));
            ctx.globalAlpha /= 0.75;
        }
        /* Lidt plet og alder */
        ctx.fillStyle = "rgba(140, 100, 40, 0.12)";
        ctx.beginPath();
        ctx.ellipse(x + b * (0.2 + r() * 0.6), y + h * (0.3 + r() * 0.4), b * 0.18, h * 0.12, r(), 0, Math.PI * 2);
        ctx.fill();
        if (v.tekst !== false) {
            etiketTekst(ctx, st, x, y, b, h, {
                navn: mangler !== "navn", formel: mangler !== "formel",
                farve: "#3a3020", navnVaegt: "italic 600"
            });
        }
        ctx.restore();
        ctx.restore();
    };

    /* En etiket, der ikke sidder paa et glas: den, der kommer ud af
       etiketmaskinen. (x, y) er midten. */
    T.friEtiket = function (ctx, x, y, b, h, st, vinkel) {
        ctx.save();
        ctx.translate(x, y);
        if (vinkel) ctx.rotate(vinkel);
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#fbfbf7";
        NK.rundtRekt(ctx, -b / 2, -h / 2, b, h, Math.min(4, h * 0.08));
        ctx.fill();
        ctx.shadowColor = "transparent";
        T.nyEtiket(ctx, -b / 2, -h / 2, b, h, st, { tekst: h >= 26 });
        ctx.restore();
    };

    /* ----- Ionkuglerne ------------------------------------------------------ */
    T.ion = function (ctx, x, y, ion, r, v) {
        v = v || {};
        if (r <= 0.5) return;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        var pos = ion.q > 0;
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        if (pos) { g.addColorStop(0, "#ffb9ab"); g.addColorStop(1, "#b43f2e"); }
        else { g.addColorStop(0, "#acdcff"); g.addColorStop(1, "#246fae"); }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (r >= 11) {
            var t = v.tekst || ion.tekst;
            NK.passendeSkrift(ctx, t, r * 1.72, Math.max(11, r * 0.62), 9, "700");
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineJoin = "round";
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
            ctx.strokeText(t, x, y + 1);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(t, x, y + 1);
        }
        ctx.restore();
    };

    /* ----- Etiketmaskinen -------------------------------------------------- */

    /* Displayets, spraekkens og tasternes placering, naar maskinen staar
       med oeverste venstre hjoerne i (x, y) og er b bred */
    T.maskineMaal = function (x, y, b) {
        var M = MAAL.etiketmaskine, k = b / M.b;
        return {
            k: k, h: M.h * k,
            lcd: { x: x + M.lcdV * k, y: y + M.lcdTop * k, b: (M.lcdH - M.lcdV) * k, h: (M.lcdBund - M.lcdTop) * k },
            slids: { x: x + M.slidsX * k, y: y + (M.slidsTop + M.slidsBund) / 2 * k, h: (M.slidsBund - M.slidsTop) * k }
        };
    };

    /* v.tekst    det, der staar i displayet
       v.tom      graa tekst, naar der ikke er skrevet noget
       v.markoer  sand: blinkende markoer efter teksten
       v.taster   [{ i: 0-29, a: 0-1 }]: taster, der lyser op
       v.udenTekst  displayet tegnes, men teksten skrives af et HTML-felt */
    T.maskine = function (ctx, x, y, b, v) {
        v = v || {};
        var M = MAAL.etiketmaskine, m = T.maskineMaal(x, y, b), k = m.k;
        if (!NK.Sprites.tegn(ctx, "etiketmaskine", x, y, b, m.h)) {
            ctx.fillStyle = "#e0a526";
            NK.rundtRekt(ctx, x + 8 * k, y + 8 * k, 224 * k, 132 * k, 18 * k);
            ctx.fill();
            ctx.fillStyle = "#b9c9a3";
            ctx.fillRect(m.lcd.x, m.lcd.y, m.lcd.b, m.lcd.h);
        }
        (v.taster || []).forEach(function (t) {
            var raekke = Math.floor(t.i / M.tastSoejler), soejle = t.i % M.tastSoejler;
            var tx = x + (M.tastV + soejle * (M.tastB + M.tastMellem)) * k;
            var ty = y + (M.tastTop + raekke * (M.tastH + M.tastMellem)) * k;
            ctx.fillStyle = "rgba(255, 226, 120, " + (0.85 * NK.klamp(t.a, 0, 1)) + ")";
            NK.rundtRekt(ctx, tx, ty, M.tastB * k, M.tastH * k, 2 * k);
            ctx.fill();
        });
        if (!v.udenTekst) {
            var l = m.lcd, pad = 9 * k;
            ctx.save();
            ctx.beginPath();
            ctx.rect(l.x, l.y, l.b, l.h);
            ctx.clip();
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            var mx = l.x + pad;
            if (v.tekst) {
                NK.passendeSkrift(ctx, v.tekst, l.b - 2 * pad - 6, Math.min(l.h * 0.6, 30), 11, "600");
                ctx.fillStyle = "#1f2a14";
                ctx.fillText(v.tekst, l.x + pad, l.y + l.h / 2 + 1);
                mx = l.x + pad + ctx.measureText(v.tekst).width + 2;
            } else if (v.tom) {
                NK.passendeSkrift(ctx, v.tom, l.b - 2 * pad, Math.min(l.h * 0.42, 17), 10, "italic 600");
                ctx.fillStyle = "rgba(31, 42, 20, 0.5)";
                ctx.fillText(v.tom, l.x + pad + 6, l.y + l.h / 2 + 1);
            }
            if (v.markoer) {
                ctx.fillStyle = "#1f2a14";
                ctx.fillRect(mx, l.y + l.h * 0.22, Math.max(2, 2 * k), l.h * 0.56);
            }
            ctx.restore();
        }
        return m;
    };

    /* ----- Rummet ----------------------------------------------------------- */
    T.rum = function (ctx, W, H, gulvY) {
        var g = ctx.createLinearGradient(0, 0, 0, gulvY);
        g.addColorStop(0, "#262833");
        g.addColorStop(1, "#1b1d24");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, gulvY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        for (var x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, gulvY);
        ctx.fillStyle = "#121318";
        ctx.fillRect(0, gulvY, W, H - gulvY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(0, gulvY, W, 2);
    };

    /* Arbejdsbordet: bordpladen i hoejden y og skabe ned til gulvet */
    T.bord = function (ctx, x0, x1, y, gulv) {
        var plade = 12;
        ctx.fillStyle = "#2a2e37";
        ctx.fillRect(x0, y + plade, x1 - x0, gulv - y - plade);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 1;
        var doer = Math.max(120, (x1 - x0) / 6);
        for (var x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.beginPath();
            ctx.moveTo(Math.round(x) + 0.5, y + plade + 6);
            ctx.lineTo(Math.round(x) + 0.5, gulv);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        for (x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.fillRect(x - 14, y + plade + 18, 8, 3);
            ctx.fillRect(x + 6, y + plade + 18, 8, 3);
        }
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* Reolen: to stolper og en hylde i hver hoejde i hylder (oversiden) */
    T.reol = function (ctx, x, y, b, h, hylder, tyk) {
        var stolpe = Math.max(8, b * 0.012);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(x, y, b, h);
        ctx.fillStyle = "#5c3f27";
        ctx.fillRect(x, y, stolpe, h);
        ctx.fillRect(x + b - stolpe, y, stolpe, h);
        hylder.forEach(function (py) {
            ctx.fillStyle = "#8a6240";
            ctx.fillRect(x, py, b, tyk * 0.35);
            ctx.fillStyle = "#6b4a2e";
            ctx.fillRect(x, py + tyk * 0.35, b, tyk * 0.65);
            ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
            ctx.fillRect(x + stolpe, py + tyk, b - 2 * stolpe, 5);
        });
    };

    /* Skiltet under en hylde: hyldens navn og hvor mange der er loest */
    T.skilt = function (ctx, x, y, tekst, tal, farve) {
        ctx.save();
        ctx.font = font("600", 12);
        var b1 = ctx.measureText(tekst).width;
        ctx.font = font("700", 12);
        var b2 = tal ? ctx.measureText(tal).width + 10 : 0;
        var b = b1 + b2 + 20, h = 20;
        ctx.fillStyle = "#e8e2d2";
        NK.rundtRekt(ctx, x, y, b, h, 3);
        ctx.fill();
        ctx.fillStyle = farve;
        ctx.fillRect(x, y, 4, h);
        ctx.fillStyle = "#2b2f38";
        ctx.textBaseline = "middle";
        ctx.font = font("600", 12);
        ctx.fillText(tekst, x + 10, y + h / 2 + 0.5);
        if (tal) {
            ctx.font = font("700", 12);
            ctx.fillStyle = "#6a5a3a";
            ctx.fillText(tal, x + 10 + b1 + 10, y + h / 2 + 0.5);
        }
        ctx.restore();
        return { x: x, y: y, b: b, h: h };
    };

    /* ----- Plakaterne ------------------------------------------------------- */
    var PT_FARVE = { m: "#9fb8d8", i: "#9fd8a9", h: "#d8d39f", a: "#c7a9dd" };

    T.plakat = function (ctx, x, y, b, h, slags, v) {
        v = v || {};
        ctx.save();
        ctx.translate(x + b / 2, y);
        ctx.rotate(v.vinkel || 0);
        ctx.translate(-(x + b / 2), -y);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 4, y + 5, b, h);
        ctx.fillStyle = "#ece7da";
        ctx.fillRect(x, y, b, h);
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.lys, 0, 1) + ")";
            ctx.lineWidth = 3;
            ctx.strokeRect(x - 3, y - 3, b + 6, h + 6);
        }
        ctx.fillStyle = "#d94a3a";
        ctx.beginPath();
        ctx.arc(x + b / 2, y + 7, 4, 0, Math.PI * 2);
        ctx.fill();

        var titel = slags === "pt" ? "Det periodiske system" : "Sammensatte ioner";
        ctx.fillStyle = "#2b2f38";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, titel, b - 14, 13, 9, "700");
        ctx.fillText(titel, x + b / 2, y + 22);

        var ix = x + 8, iy = y + 34, ib = b - 16, ih = h - 42;
        if (slags === "pt") {
            var celle = Math.min(ib / 18, ih / 6);
            var ox = ix + (ib - celle * 18) / 2, oy = iy + (ih - celle * 6) / 2;
            D.GRUNDSTOFFER.forEach(function (g) {
                var cx = ox + (g.soejle - 1) * celle, cy = oy + (g.periode - 1) * celle;
                ctx.fillStyle = v.fremhaev === g.s ? "#f2c53d" : PT_FARVE[g.slags];
                ctx.fillRect(cx + 0.5, cy + 0.5, celle - 1, celle - 1);
            });
        } else {
            var linjer = D.plakatIoner(NK.indstil.svaer).map(function (id) { return D.ion(id); });
            var lh = ih / linjer.length;
            var px = NK.klamp(lh * 0.7, 7, 13);
            linjer.forEach(function (ion, i) {
                var ly = iy + lh * (i + 0.5);
                if (px >= 10) {
                    ctx.font = font("700", px);
                    ctx.textAlign = "left";
                    ctx.fillStyle = ion.q > 0 ? "#a8382a" : "#1f5f96";
                    ctx.fillText(ion.tekst, ix + 2, ly);
                    ctx.font = font("600", px);
                    ctx.fillStyle = "#4a4f5a";
                    ctx.textAlign = "right";
                    ctx.fillText(ion.navn, ix + ib - 2, ly);
                } else {
                    ctx.fillStyle = "rgba(43, 47, 56, 0.35)";
                    ctx.fillRect(ix + 2, ly - 1.5, ib * 0.3, 3);
                    ctx.fillRect(ix + ib * 0.45, ly - 1.5, ib * 0.5, 3);
                }
            });
        }
        ctx.restore();
    };

    /* ----- Samlebaandet og kassen ------------------------------------------- */
    T.baand = function (ctx, x0, x1, y, fase, gulv) {
        var th = 16;
        ctx.fillStyle = "#3b4049";
        for (var lx = x0 + 40; lx < x1 - 20; lx += 200) ctx.fillRect(lx, y + th, 10, gulv - y - th);
        ctx.fillStyle = "#565d69";
        NK.rundtRekt(ctx, x0 - 10, y - 2, x1 - x0 + 20, th + 8, 8);
        ctx.fill();
        ctx.fillStyle = "#23262c";
        NK.rundtRekt(ctx, x0, y, x1 - x0, th, th / 2);
        ctx.fill();
        ctx.save();
        NK.rundtRekt(ctx, x0, y, x1 - x0, th, th / 2);
        ctx.clip();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
        ctx.lineWidth = 2;
        var sp = 22, off = ((fase % sp) + sp) % sp;
        for (var xx = x0 - sp + off; xx < x1; xx += sp) {
            ctx.beginPath();
            ctx.moveTo(xx, y + 2);
            ctx.lineTo(xx, y + th - 2);
            ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = "#8a919c";
        [x0 + th / 2, x1 - th / 2].forEach(function (rx) {
            ctx.beginPath();
            ctx.arc(rx, y + th / 2, th * 0.34, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(x0 + 8, y + 1, x1 - x0 - 16, 2);
    };

    /* Kassen med oeverste venstre hjoerne i (x, y). Giver kanten tilbage,
       saa et glas, der falder ned i den, kan klippes dér. */
    T.kasse = function (ctx, x, y, b, tekst) {
        var M = MAAL.kasse, k = b / M.b;
        if (!NK.Sprites.tegn(ctx, "kasse", x, y, b, M.h * k)) {
            ctx.fillStyle = "#b8864f";
            ctx.fillRect(x + 10 * k, y + 34 * k, 150 * k, 92 * k);
        }
        if (tekst) {
            ctx.save();
            ctx.translate(x + M.maerkeX * k, y + M.maerkeY * k);
            ctx.rotate(-0.035);
            ctx.fillStyle = "#3a3020";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            NK.passendeSkrift(ctx, tekst[0], 84 * k, 15 * k, 9, "700");
            ctx.fillText(tekst[0], 0, tekst[1] ? -6 * k : 0);
            if (tekst[1]) {
                NK.passendeSkrift(ctx, tekst[1], 84 * k, 11 * k, 8, "italic 600");
                ctx.fillText(tekst[1], 0, 9 * k);
            }
            ctx.restore();
        }
        return { kant: y + M.kantY * k, v: x + M.aabningV * k, h: x + M.aabningH * k, bund: y + M.h * k };
    };

    /* ----- Smaating ----------------------------------------------------------- */
    T.stjerne = function (ctx, x, y, r, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === true ? 1 : NK.klamp(alfa, 0, 1);
        ctx.beginPath();
        for (var i = 0; i < 10; i++) {
            var v = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
            ctx.lineTo(x + Math.cos(v) * rr, y + Math.sin(v) * rr);
        }
        ctx.closePath();
        ctx.fillStyle = "#f2c53d";
        ctx.fill();
        ctx.strokeStyle = "#8a6510";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    };

    /* En lille pil, der peger ned paa (x, y) */
    T.pil = function (ctx, x, y, s, farve) {
        ctx.save();
        ctx.fillStyle = farve || "#f2c53d";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - s, y - s * 1.2);
        ctx.lineTo(x - s * 0.4, y - s * 1.2);
        ctx.lineTo(x - s * 0.4, y - s * 2.2);
        ctx.lineTo(x + s * 0.4, y - s * 2.2);
        ctx.lineTo(x + s * 0.4, y - s * 1.2);
        ctx.lineTo(x + s, y - s * 1.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* En taleboble-agtig forklaring over punktet (x, y).
       linjer: [{ t, px, vaegt, farve }] */
    T.boble = function (ctx, x, y, linjer, W) {
        ctx.save();
        var pad = 9, b = 0, h = 0;
        linjer.forEach(function (l) {
            ctx.font = font(l.vaegt || "600", l.px || 13);
            b = Math.max(b, ctx.measureText(l.t).width);
            h += (l.px || 13) * 1.35;
        });
        b += pad * 2;
        h += pad * 2 - 4;
        var bx = NK.klamp(x - b / 2, 4, W - b - 4), by = y - h - 10;
        ctx.fillStyle = "rgba(14, 14, 20, 0.94)";
        ctx.strokeStyle = "#4a4a58";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, bx, by, b, h, 7);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 6, by + h);
        ctx.lineTo(x, by + h + 7);
        ctx.lineTo(x + 6, by + h);
        ctx.closePath();
        ctx.fill();
        var ly = by + pad;
        ctx.textBaseline = "top";
        linjer.forEach(function (l) {
            ctx.font = font(l.vaegt || "600", l.px || 13);
            ctx.fillStyle = l.farve || "#f2f3f5";
            ctx.fillText(l.t, bx + pad, ly);
            ly += (l.px || 13) * 1.35;
        });
        ctx.restore();
    };

    NK.Tegn = T;
}());
