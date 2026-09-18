/* =====================================================================
   tegning.js - tegning af bordet, udstyret og vaeskerne

   Alt tegnes paa et fast tegnebord (NK.Scene.BREDDE x HOEJDE), som
   bordet skalerer ind i laerredet. Funktionerne her kender kun
   genstande af den form, bord.js laver: { type, p, anker, indhold, ... }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Stof = NK.Stof;
    var T = {};
    NK.Tegning = T;

    function S() { return NK.Scene; }

    /* ----- Baggrund: vaeg, loft, hylde, bordplade ------------------------ */
    T.tegnBaggrund = function (ctx, v) {
        var Sc = S(), BORD = Sc.BORD, BREDDE = Sc.BREDDE, HOEJDE = Sc.HOEJDE;
        var g = ctx.createLinearGradient(0, 0, 0, BORD);
        g.addColorStop(0, "#1b1f26");
        g.addColorStop(1, "#2b3039");
        ctx.fillStyle = g;
        ctx.fillRect(-2000, -2000, BREDDE + 4000, BORD + 2000);

        /* Fliser paa vaeggen bag bordet */
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        ctx.fillRect(-2000, 300, BREDDE + 4000, BORD - 300);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var y = 300; y < BORD; y += 40) { ctx.moveTo(-2000, y); ctx.lineTo(3200, y); }
        for (var x = -2000; x < 3200; x += 40) { ctx.moveTo(x, 300); ctx.lineTo(x, BORD); }
        ctx.stroke();
        ctx.restore();

        var lys = ctx.createRadialGradient(BREDDE / 2, 40, 20, BREDDE / 2, 40, 680);
        lys.addColorStop(0, "rgba(255, 244, 220, 0.09)");
        lys.addColorStop(1, "rgba(255, 244, 220, 0)");
        ctx.fillStyle = lys;
        ctx.fillRect(-2000, -2000, BREDDE + 4000, BORD + 2000);

        /* Loft med lysstofroer */
        ctx.fillStyle = "#2c3139";
        ctx.fillRect(-2000, -2000, BREDDE + 4000, 2030);
        ctx.fillStyle = "rgba(255, 248, 225, 0.6)";
        NK.rundtRekt(ctx, BREDDE / 2 - 400, 36, 800, 5, 2.5);
        ctx.fill();
        NK.skaer(ctx, BREDDE / 2, 42, 190, "rgba(255, 248, 225, 0.1)");

        /* Hylderne */
        (Sc.HYLDER || (Sc.HYLDE ? [Sc.HYLDE] : [])).forEach(function (H) {
            ctx.fillStyle = "#6b4a2c";
            ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 7);
            ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
            ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 1.5);
            ctx.fillStyle = "#4a3320";
            for (var hx = H.x0 + 10; hx < H.x1 - 12; hx += 180) ctx.fillRect(hx, H.y + 7, 5, 14);
            ctx.fillRect(H.x1 - 15, H.y + 7, 5, 14);
        });

        if (v && v.plakat) T.tegnPlakat(ctx, v.plakat);

        /* Bordplade og forkant. Med dybde (Sc.DYBDE) er pladen en flade fra
           bagkanten (BORD) ned til forkanten (Sc.FORKANT), som man ser lidt
           ovenfra; uden dybde er den en smal kant som foer. */
        var FORKANT = Sc.FORKANT === undefined ? BORD : Sc.FORKANT;
        if (FORKANT > BORD) {
            var pl = ctx.createLinearGradient(0, BORD, 0, FORKANT);
            pl.addColorStop(0, "#2f343e");
            pl.addColorStop(1, "#3a3f4a");
            ctx.fillStyle = pl;
            ctx.fillRect(-2000, BORD, BREDDE + 4000, FORKANT - BORD);
            /* Skygge, hvor vaeggen moeder pladen */
            var sk = ctx.createLinearGradient(0, BORD, 0, BORD + 10);
            sk.addColorStop(0, "rgba(0, 0, 0, 0.28)");
            sk.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = sk;
            ctx.fillRect(-2000, BORD, BREDDE + 4000, 10);
        }
        ctx.fillStyle = "#3b404b";
        ctx.fillRect(-2000, FORKANT, BREDDE + 4000, 9);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(-2000, FORKANT, BREDDE + 4000, 1.5);
        var f = ctx.createLinearGradient(0, FORKANT + 9, 0, HOEJDE);
        f.addColorStop(0, "#23262e");
        f.addColorStop(1, "#16181d");
        ctx.fillStyle = f;
        ctx.fillRect(-2000, FORKANT + 9, BREDDE + 4000, 2000);
    };

    /* Plakaten med sikkerhedsreglerne. p: { x, y, regel: 0-3 (fremhaevet) } */
    T.tegnPlakat = function (ctx, p) {
        var b = 132, h = 128;
        ctx.save();
        ctx.fillStyle = "#e8ecef";
        ctx.fillRect(p.x, p.y, b, h);
        ctx.fillStyle = "#2b7d51";
        ctx.fillRect(p.x, p.y, b, 22);
        NK.tekst(ctx, "SIKKERHED", p.x + b / 2, p.y + 15, { font: "800 11px 'Segoe UI', sans-serif", justering: "center", farve: "#ffffff" });
        var regler = ["Brug briller og kittel", "Der spises og drikkes ikke i laboratoriet", "Ingen åben ild nær brandfarlige stoffer"];
        var y = p.y + 38;
        regler.forEach(function (r, i) {
            var frem = p.regel === i + 1;
            ctx.fillStyle = frem ? "#a33529" : "#2f343b";
            ctx.beginPath();
            ctx.arc(p.x + 12, y - 4, 6, 0, Math.PI * 2);
            ctx.fill();
            NK.tekst(ctx, String(i + 1), p.x + 12, y - 0.5, { font: "800 8px 'Segoe UI', sans-serif", justering: "center", farve: "#ffffff" });
            var ord = r.split(" "), linje = "", ly = y;
            ctx.font = "600 8.5px 'Segoe UI', sans-serif";
            ord.forEach(function (o) {
                var proev = linje ? linje + " " + o : o;
                if (ctx.measureText(proev).width > b - 30) {
                    NK.tekst(ctx, linje, p.x + 24, ly, { font: "600 8.5px 'Segoe UI', sans-serif", farve: frem ? "#a33529" : "#2f343b" });
                    linje = o; ly += 11;
                } else linje = proev;
            });
            NK.tekst(ctx, linje, p.x + 24, ly, { font: "600 8.5px 'Segoe UI', sans-serif", farve: frem ? "#a33529" : "#2f343b" });
            y = ly + 20;
        });
        ctx.restore();
    };

    T.skygge = function (ctx, x, rx, alfa, y) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, " + (alfa === undefined ? 0.35 : alfa) + ")";
        ctx.beginPath();
        ctx.ellipse(x, (y === undefined ? S().BORD : y) + 3, rx, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Stiplet, pulserende ramme om det, eleven kan bruge nu. */
    T.tegnMarkering = function (ctx, r, tid, farve) {
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.35 * Math.sin(tid * 4);
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([7, 6]);
        ctx.lineDashOffset = -tid * 12;
        NK.rundtRekt(ctx, r.x - 6, r.y - 6, r.b + 12, r.h + 12, 9);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Vaesker ---------------------------------------------------------- */
    function boelgeLinje(ctx, x0, x1, niveau, boelge, tid, fase) {
        ctx.moveTo(x0, niveau);
        for (var x = x0; x <= x1; x += 4) {
            ctx.lineTo(x, niveau + Math.sin(x * 0.12 + tid * 10 + fase) * boelge + Math.sin(x * 0.05 - tid * 6.5) * boelge * 0.6);
        }
    }

    /* Ét vaeskelag i beholderen fra overfladen 'niveau' ned til 'bund'
       (eller polygonens bund). verden: indersiden paa tegnebordet. */
    T.tegnLag = function (ctx, verden, niveau, bund, farve, opt) {
        opt = opt || {};
        if (!farve) return;
        var x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        verden.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        var slut = bund === null || bund === undefined ? y1 + 6 : bund;
        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.beginPath();
        boelgeLinje(ctx, x0 - 4, x1 + 6, niveau, opt.boelge || 0, opt.tid || 0, 0);
        ctx.lineTo(x1 + 6, slut);
        ctx.lineTo(x0 - 4, slut);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, niveau, 0, slut);
        g.addColorStop(0, NK.css(farve, 0.9));
        g.addColorStop(1, NK.css(farve, 1.1));
        ctx.fillStyle = g;
        ctx.fill();
        if (opt.uklar > 0.01 && opt.uklarFarve) {
            ctx.fillStyle = NK.css(opt.uklarFarve, NK.klamp(opt.uklar, 0, 1) * 0.8);
            ctx.fill();
        }
        ctx.strokeStyle = "rgba(255, 255, 255, " + (opt.kant === undefined ? 0.3 : opt.kant) + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x0, niveau);
        ctx.lineTo(x1, niveau);
        ctx.stroke();
        ctx.restore();
    };

    /* Hele vaesken: den blandede oploesning og et ublandet lag i toppen
       (eller i bunden, opt.lagBund). Returnerer overfladen. */
    T.tegnVaeske = function (ctx, verden, arealTot, arealSol, solFarve, lagFarve, opt) {
        opt = opt || {};
        if (arealTot <= 2 || !solFarve) return null;
        var top = NK.vaeskeNiveau(verden, arealTot);
        T.tegnLag(ctx, verden, top, null, solFarve, { boelge: opt.boelge, tid: opt.tid, uklar: opt.uklar, uklarFarve: opt.uklarFarve, kant: 0.35 });
        if (lagFarve && arealTot - arealSol > 6) {
            var x0 = Infinity, x1 = -Infinity, yBund = -Infinity;
            verden.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); yBund = Math.max(yBund, p.y); });
            var fra, til;
            if (opt.lagBund) {
                var hLag = yBund - NK.vaeskeNiveau(verden, arealTot - arealSol);
                fra = yBund;
                til = Math.max(top, yBund - hLag - 14);
            } else {
                var solNiv = arealSol > 2 ? NK.vaeskeNiveau(verden, arealSol) : top + 40;
                fra = top;
                til = Math.max(solNiv + 10, top + 8);
            }
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            var g = ctx.createLinearGradient(0, fra, 0, til);
            g.addColorStop(0, NK.css(lagFarve, 1));
            g.addColorStop(0.5, NK.css(lagFarve, 0.8));
            g.addColorStop(1, NK.css(lagFarve, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(x0 - 4, Math.max(top, Math.min(fra, til)));
            ctx.lineTo(x1 + 4, Math.max(top, Math.min(fra, til)));
            ctx.lineTo(x1 + 4, Math.max(fra, til) + 2);
            ctx.lineTo(x0 - 4, Math.max(fra, til) + 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        return top;
    };

    /* Tegner i beholderens egne koordinater, klippet til indersiden */
    function iBeholder(ctx, p, anker, verden, tegn) {
        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.translate(-anker.x, -anker.y);
        tegn();
        ctx.restore();
    }

    /* Bundfald som en boelget bunke i bunden. h: hoejde i enheder */
    function tegnBundfald(ctx, gg, verden, farve, h) {
        var t = gg.type, x0 = Infinity, x1 = -Infinity, y = -Infinity;
        t.indre.forEach(function (q) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y = Math.max(y, q.y); });
        x0 += 1; x1 -= 1; y += 1;
        iBeholder(ctx, gg.p, gg.anker, verden, function () {
            ctx.beginPath();
            ctx.moveTo(x0, y + 1);
            ctx.lineTo(x0, y - h);
            for (var x = x0; x <= x1; x += 3) ctx.lineTo(x, y - h + Math.sin(x * 1.7) * 1.1);
            ctx.lineTo(x1, y + 1);
            ctx.closePath();
            ctx.fillStyle = NK.css(farve, 1);
            ctx.fill();
            ctx.strokeStyle = "rgba(120, 130, 140, 0.35)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
        });
    }

    /* Korn af fast stof, der endnu ikke er oploest */
    function tegnKorn(ctx, gg, verden, liste) {
        var t = gg.type, x0 = Infinity, x1 = -Infinity, y = -Infinity;
        t.indre.forEach(function (q) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y = Math.max(y, q.y); });
        x0 += 3; x1 -= 3;
        var n = 0;
        iBeholder(ctx, gg.p, gg.anker, verden, function () {
            liste.forEach(function (f) {
                var m = Math.min(16, Math.ceil(f.umol / 2.5));
                var fa = f.stof.farve || { r: 230, g: 230, b: 230 };
                for (var i = 0; i < m; i++) {
                    var k = n + i;
                    var gx = x0 + ((k * 7.3) % (x1 - x0));
                    var gy = y - 2.8 - ((k * 5) % 4) - (k > 10 ? 2.5 : 0);
                    ctx.save();
                    ctx.translate(gx, gy);
                    ctx.rotate(k * 0.9);
                    ctx.fillStyle = NK.css(fa, 1);
                    ctx.fillRect(-1.5, -1.5, 3, 3);
                    ctx.strokeStyle = "rgba(90, 90, 110, 0.5)";
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(-1.5, -1.5, 3, 3);
                    ctx.restore();
                }
                n += m;
            });
        });
    }

    function omrids(ctx, gg) {
        if (!gg.type.omrids) return;
        ctx.save();
        ctx.translate(gg.p.x, gg.p.y);
        ctx.rotate(gg.p.v);
        ctx.translate(-gg.anker.x, -gg.anker.y);
        ctx.strokeStyle = "rgba(55, 70, 85, 0.45)";
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        gg.type.omrids(ctx);
        ctx.stroke();
        ctx.restore();
    }

    /* Indersiden paa tegnebordet */
    T.indreVerden = function (gg) {
        return gg.type.indre.map(function (q) { return NK.tilVerden(gg.p, gg.anker, q.x, q.y); });
    };

    /* Etiketten paa en flaske eller et pulverglas: 1-2 linjer tekst i
       spritets etiketfelt. gg.etiket: streng eller [linje1, linje2] */
    T.tegnEtiket = function (ctx, gg) {
        var e = gg.type.etiket;
        if (!e || !gg.etiket) return;
        var linjer = Array.isArray(gg.etiket) ? gg.etiket : [gg.etiket];
        ctx.save();
        ctx.translate(gg.p.x, gg.p.y);
        ctx.rotate(gg.p.v);
        ctx.translate(-gg.anker.x, -gg.anker.y);
        var cx = e.x + e.b / 2;
        var str = linjer.length > 1 ? Math.min(9, e.h * 0.42) : Math.min(10, e.h * 0.5);
        var y0 = e.y + e.h / 2 + (linjer.length > 1 ? -str * 0.35 : str * 0.36);
        linjer.forEach(function (l, i) {
            NK.tekst(ctx, l, cx, y0 + i * (str + 1.5), { str: i === 0 ? str : str * 0.8, vaegt: i === 0 ? 700 : 600, justering: "center", farve: i === 0 ? "#1f2328" : "#4a4f57", maks: e.b - 3 });
        });
        /* Faremaerkerne i en raekke under etiketten */
        var maerker = gg.indhold ? Stof.faremaerker(gg.indhold) : [];
        if (maerker.length) {
            var s = Math.min(4.2, (e.b - 2) / (maerker.length * 2.4));
            var b = maerker.length * s * 2.4;
            var mx = cx - b / 2 + s * 1.2, my = e.y + e.h + s + 1.5;
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            NK.rundtRekt(ctx, cx - b / 2 - 1.5, my - s - 1.5, b + 3, s * 2 + 3, 1.5);
            ctx.fill();
            maerker.forEach(function (m, i) { T.tegnPiktogram(ctx, m, mx + i * s * 2.4, my, s); });
        }
        ctx.restore();
    };

    /* Et GHS-piktogram (forenklet): roed rombe med sort tegn. s: halv bredde */
    T.tegnPiktogram = function (ctx, id, cx, cy, s) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#c8102e";
        ctx.lineWidth = Math.max(0.7, s * 0.22);
        ctx.stroke();
        ctx.scale(s / 5, s / 5);
        ctx.fillStyle = "#111";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 0.9;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        function flamme(y) {
            ctx.beginPath();
            ctx.moveTo(0, y - 3.2);
            ctx.quadraticCurveTo(2.6, y - 1, 1.6, y + 1.2);
            ctx.quadraticCurveTo(1.2, y + 2, 0, y + 2.2);
            ctx.quadraticCurveTo(-1.4, y + 2, -1.7, y + 0.8);
            ctx.quadraticCurveTo(-2.2, y - 1, 0, y - 3.2);
            ctx.closePath();
            ctx.fill();
        }
        if (id === "brandfarlig") { flamme(0); ctx.beginPath(); ctx.moveTo(-2, 2.6); ctx.lineTo(2, 2.6); ctx.stroke(); }
        else if (id === "oxiderende") { flamme(-1.2); ctx.beginPath(); ctx.arc(0, 2.2, 1.4, 0, Math.PI * 2); ctx.stroke(); }
        else if (id === "aetsende") {
            /* to reagensglas, der drypper paa en haand og en stang */
            ctx.beginPath(); ctx.moveTo(-2.8, -2.6); ctx.lineTo(-1.2, -1.2); ctx.moveTo(2.8, -2.6); ctx.lineTo(1.2, -1.2); ctx.stroke();
            ctx.beginPath(); ctx.arc(-1.2, 0.2, 0.55, 0, Math.PI * 2); ctx.arc(1.3, 0.4, 0.55, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-3, 2.2); ctx.lineTo(-0.4, 2.2); ctx.moveTo(0.6, 1.6); ctx.lineTo(3, 2.6); ctx.stroke();
        }
        else if (id === "giftig") {
            ctx.beginPath(); ctx.arc(0, -0.8, 1.9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(-0.7, -1.1, 0.45, 0, Math.PI * 2); ctx.arc(0.7, -1.1, 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-2.4, 1.2); ctx.lineTo(2.4, 3); ctx.moveTo(2.4, 1.2); ctx.lineTo(-2.4, 3); ctx.stroke();
        }
        else if (id === "sundhedsfare") {
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, 0.8); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 2.6, 0.85, 0, Math.PI * 2); ctx.fill();
        }
        else if (id === "kronisk") {
            ctx.beginPath(); ctx.arc(-0.6, -2.4, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-2.2, 3); ctx.lineTo(-2.2, 0); ctx.quadraticCurveTo(-0.6, -1.4, 1, 0); ctx.lineTo(1, 3); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#fff";
            for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(-0.6, 1); ctx.lineTo(-0.6 + Math.cos(a) * 1.3, 1 + Math.sin(a) * 1.3); ctx.lineWidth = 0.5; ctx.strokeStyle = "#fff"; ctx.stroke(); }
        }
        else if (id === "miljoe") {
            ctx.beginPath(); ctx.moveTo(-2.6, 0.6); ctx.lineTo(-1.2, -3); ctx.lineTo(0.2, 0.6); ctx.closePath(); ctx.fill();
            ctx.fillRect(-1.6, 0.6, 0.8, 1.2);
            ctx.beginPath(); ctx.ellipse(1.6, 2.2, 1.5, 0.8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(3, 2.2); ctx.lineTo(3.6, 1.4); ctx.lineTo(3.6, 3); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    };

    /* Pulveret i et pulverglas i stoffets farve */
    T.tegnPulver = function (ctx, gg) {
        var f = gg.type.pulverfelt;
        if (!f) return;
        var liste = gg.indhold ? Stof.faste(gg.indhold) : [];
        var farve = gg.indhold ? Stof.fastFarve(gg.indhold) : null;
        if (!liste.length || !farve) return;
        var fyld = NK.klamp(Stof.fastIalt(gg.indhold) / (gg.pulverMaks || 400), 0.15, 1);
        ctx.save();
        ctx.translate(gg.p.x, gg.p.y);
        ctx.rotate(gg.p.v);
        ctx.translate(-gg.anker.x, -gg.anker.y);
        var top = f.y - (f.y - f.top) * fyld;
        ctx.fillStyle = NK.css(farve, 1);
        ctx.beginPath();
        ctx.moveTo(f.x0, f.y);
        ctx.lineTo(f.x0, top + 3);
        ctx.quadraticCurveTo((f.x0 + f.x1) / 2, top - 4, f.x1, top + 3);
        ctx.lineTo(f.x1, f.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();
    };

    /* En beholder: vaeske, bundfald, korn, omrids, sprite, etiket og
       valgmaerke. Returnerer vaeskens overflade paa tegnebordet. */
    T.tegnBeholder = function (ctx, gg, tid, opt) {
        opt = opt || {};
        var t = gg.type;
        var top = null;
        var verden = t.indre ? T.indreVerden(gg) : null;
        if (verden && gg.indhold && !t.skjulIndhold) {
            var o = gg.indhold;
            var V = o.V + (gg.lag ? gg.lag.V : 0);
            if (V > 0.02) {
                var solFarve = Stof.farve(o, t.vejlaengde) || Stof.VAND;
                var lagFarve = gg.lag && gg.lag.V > 0.05 ? Stof.farve(gg.lag, t.vejlaengde) : null;
                top = T.tegnVaeske(ctx, verden, V * t.mlPrAreal, o.V * t.mlPrAreal, solFarve, lagFarve, {
                    boelge: opt.boelge, tid: tid, uklar: Stof.uklar(o) * (1 - (gg.bund || 0)), uklarFarve: Stof.fastFarve(o), lagBund: gg.lagBund
                });
                var faste = Stof.faste(o).concat(gg.lag ? Stof.faste(gg.lag) : []);
                var korn = faste.filter(function (f) { return f.stof.korn; });
                var bundfald = faste.filter(function (f) { return !f.stof.korn; });
                if (bundfald.length && gg.bund > 0.01) {
                    var m = 0, sum = 0, fr = 0, fg = 0, fb = 0;
                    bundfald.forEach(function (f) {
                        var fa = f.stof.farve || { r: 230, g: 230, b: 230 };
                        m += f.umol; sum += f.umol; fr += fa.r * f.umol; fg += fa.g * f.umol; fb += fa.b * f.umol;
                    });
                    tegnBundfald(ctx, gg, verden, { r: fr / sum, g: fg / sum, b: fb / sum, a: 1 }, NK.klamp(m / (t.maks * 40), 0.15, 1.4) * (t.maks < 30 ? 14 : 6) * NK.klamp(gg.bund, 0, 1));
                }
                if (korn.length) tegnKorn(ctx, gg, verden, korn);
            }
        }
        omrids(ctx, gg);
        if (t.sprite) NK.Sprites.tegnPositur(ctx, t.sprite, gg.p, gg.anker, opt.alfa, gg.skala);
        if (t.streger) T.tegnStreger(ctx, gg, opt.alfa);
        if (t.pulverfelt) T.tegnPulver(ctx, gg);
        T.tegnEtiket(ctx, gg);
        if (gg.nr) {
            var m2 = NK.tilVerden(gg.p, gg.anker, -9, 14);
            ctx.save();
            ctx.fillStyle = gg.valgt ? "#f2c53d" : "rgba(45, 50, 58, 0.92)";
            ctx.strokeStyle = gg.valgt ? "#7a5a10" : "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(m2.x, m2.y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            NK.tekst(ctx, String(gg.nr), m2.x, m2.y + 0.5, { font: "800 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: gg.valgt ? "#2a1d04" : "#dfe5ec" });
            ctx.restore();
        }
        /* Det valgte glas har en tynd gul ramme */
        if (gg.valgt && t.sprite) {
            ctx.save();
            ctx.translate(gg.p.x, gg.p.y);
            ctx.rotate(gg.p.v);
            ctx.translate(-gg.anker.x, -gg.anker.y);
            ctx.strokeStyle = "rgba(242, 197, 61, 0.75)";
            ctx.lineWidth = 1.6;
            NK.rundtRekt(ctx, -3, -3, t.b + 6, t.h + 6, 6);
            ctx.stroke();
            ctx.restore();
        }
        return top;
    };

    /* Inddelingen paa glasset: stregerne og rumfanget, tegnet oven paa
       glasset, hvor NK.Udstyr.streger siger. De staar ikke i spriten, saa
       de kan ikke komme ud af trit med det, motoren regner. */
    T.tegnStreger = function (ctx, gg, alfa) {
        var t = gg.type, s = t.streger, k = t.skala || 1;
        var liste = NK.Udstyr.streger(t);
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.translate(gg.p.x, gg.p.y);
        ctx.rotate(gg.p.v);
        ctx.translate(-gg.anker.x, -gg.anker.y);
        ctx.strokeStyle = "rgba(238, 246, 252, 0.8)";
        ctx.lineWidth = (s.bred || 1) * k;
        ctx.lineCap = "round";
        ctx.beginPath();
        liste.forEach(function (st) { ctx.moveTo(st.x0, st.y); ctx.lineTo(st.x1, st.y); });
        ctx.stroke();
        ctx.fillStyle = "rgba(238, 246, 252, 0.8)";
        ctx.font = "600 " + (s.str * k).toFixed(2) + "px 'Segoe UI', Arial, sans-serif";
        ctx.textBaseline = "middle";
        var hoejre = s.tekst === "hoejre";
        ctx.textAlign = hoejre ? "left" : "right";
        liste.forEach(function (st) {
            if (st.tal) ctx.fillText(String(st.mL), hoejre ? st.x1 + 2.5 * k : st.x0 - 2 * k, st.y + 0.4 * k);
        });
        if (s.navn) {
            ctx.fillStyle = "rgba(238, 246, 252, 0.62)";
            ctx.font = "600 " + ((s.navn.str || s.str) * k).toFixed(2) + "px 'Segoe UI', Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText((s.nominel || t.maks) + " mL", s.navn.x * k, s.navn.y * k);
        }
        ctx.restore();
    };

    /* Bobler af gas paa vej op gennem vaesken, klippet til indersiden */
    T.tegnBobler = function (ctx, gg, bobler) {
        if (!bobler || !bobler.length || !gg.type.indre) return;
        var verden = T.indreVerden(gg);
        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        for (var i = 0; i < bobler.length; i++) {
            var b = bobler[i];
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(235, 245, 255, 0.35)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 0.9;
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Skaar af et knust glas. s: { x, y, a, pts, alfa } */
    T.tegnSkaar = function (ctx, liste) {
        if (!liste || !liste.length) return;
        ctx.save();
        for (var i = 0; i < liste.length; i++) {
            var s = liste[i];
            if (s.alfa <= 0.01) continue;
            ctx.save();
            ctx.globalAlpha = NK.klamp(s.alfa, 0, 1);
            ctx.translate(s.x, s.y);
            ctx.rotate(s.a);
            ctx.beginPath();
            for (var j = 0; j < s.pts.length; j++) {
                if (j === 0) ctx.moveTo(s.pts[j].x, s.pts[j].y);
                else ctx.lineTo(s.pts[j].x, s.pts[j].y);
            }
            ctx.closePath();
            ctx.fillStyle = "rgba(222, 236, 246, 0.6)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    };

    /* Spatlen med evt. en spatelspids paa */
    T.tegnSpatel = function (ctx, gg) {
        NK.Sprites.tegnPositur(ctx, "spatel", gg.p, gg.anker, undefined, gg.skala);
        if (gg.last && gg.last.farve) {
            var m = NK.tilVerden(gg.p, gg.anker, gg.type.ske.x, gg.type.ske.y);
            ctx.save();
            ctx.translate(m.x, m.y);
            ctx.rotate(gg.p.v);
            ctx.fillStyle = NK.css(gg.last.farve, 1);
            ctx.beginPath();
            ctx.ellipse(0, 0, 7, 3.4, 0, Math.PI, 0);
            ctx.fill();
            ctx.strokeStyle = "rgba(90, 90, 110, 0.5)";
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.restore();
        }
    };

    /* Glasstaven: en linje fra ankeret (0, 0) til (0, laengde) */
    T.stavEnde = function (gg) {
        return NK.tilVerden(gg.p, gg.anker, 0, gg.type.laengde);
    };

    T.tegnStav = function (ctx, gg) {
        var p = gg.p, e = T.stavEnde(gg), k = gg.skala || 1;
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(70, 90, 105, 0.55)";
        ctx.lineWidth = 5.6 * k;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.strokeStyle = "rgba(225, 238, 247, 0.9)";
        ctx.lineWidth = 3.6 * k;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = k;
        ctx.beginPath();
        ctx.moveTo(NK.lerp(p.x, e.x, 0.08), NK.lerp(p.y, e.y, 0.08) - 1);
        ctx.lineTo(NK.lerp(p.x, e.x, 0.9), NK.lerp(p.y, e.y, 0.9) - 1);
        ctx.stroke();
        ctx.restore();
    };

    /* Termometeret: toppen er ankeret (0, 0), kuglen sidder i (0, laengde) */
    function skalaY(L, t) {
        return L - 16 - (t + 10) / 120 * (L - 30);
    }

    T.temperaturTekst = function (Tc) {
        return String(Math.round(Tc * 2) / 2).replace(".", ",") + " °C";
    };

    T.tegnTermometer = function (ctx, gg, visTal) {
        var k = gg.skala || 1;
        var L = gg.type.laengde / k, p = gg.p, Tc = gg.T === undefined ? 20 : gg.T;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.scale(k, k);
        ctx.fillStyle = "rgba(225, 238, 247, 0.6)";
        NK.rundtRekt(ctx, -4, 0, 8, L - 5, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(60, 80, 95, 0.65)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "rgba(40, 50, 60, 0.7)";
        ctx.lineWidth = 0.7;
        for (var t = 0; t <= 100; t += 10) {
            var y = skalaY(L, t);
            ctx.beginPath();
            ctx.moveTo(1, y);
            ctx.lineTo(t % 50 === 0 ? 4 : 2.8, y);
            ctx.stroke();
        }
        var yT = skalaY(L, NK.klamp(Tc, -10, 110));
        ctx.fillStyle = "#d93a2b";
        ctx.fillRect(-1.3, yT, 2.6, L - 6 - yT);
        NK.kugle(ctx, 0, L - 3, 5.5, "#ff8a7a", "#a3231a");
        ctx.restore();
        if (visTal) {
            var w = NK.tilVerden(p, { x: 0, y: 0 }, 0, -18);
            var tekst = T.temperaturTekst(Tc);
            ctx.save();
            ctx.font = "700 14px 'Segoe UI', sans-serif";
            var b = ctx.measureText(tekst).width + 16;
            ctx.fillStyle = "rgba(20, 22, 28, 0.92)";
            NK.rundtRekt(ctx, w.x - b / 2, w.y - 12, b, 24, 12);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 1;
            ctx.stroke();
            NK.tekst(ctx, tekst, w.x, w.y + 0.5, { font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffd6c9" });
            ctx.restore();
        }
    };

    /* Varmepladen med lampe, naar den er taendt */
    T.tegnVarmeplade = function (ctx, gg, tid) {
        var t = gg.type, x = gg.p.x - gg.anker.x, y = gg.p.y - gg.anker.y;
        T.skygge(ctx, x + t.b / 2, t.b / 2, 0.3, y + t.h - 3);
        NK.Sprites.tegn(ctx, t.sprite, x, y);
        var kx = x + 52, ky = y + 46;
        ctx.save();
        ctx.strokeStyle = "#e9edf1";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(kx, ky);
        var v = gg.taendt ? -Math.PI / 2 + 1.5 : -Math.PI / 2 - 1.5;
        ctx.lineTo(kx + Math.cos(v) * 6, ky + Math.sin(v) * 6);
        ctx.stroke();
        ctx.restore();
        if (gg.taendt) {
            var lx = x + 82, ly = y + 38;
            NK.skaer(ctx, lx, ly, 9, "rgba(255, 90, 60, 0.9)", 0.6 + 0.2 * Math.sin(tid * 3));
            NK.kugle(ctx, lx, ly, 2.2, "#ffb3a8", "#c0392b");
            var gl = NK.klamp((gg.T - 20) / 200, 0, 1);
            if (gl > 0.02) {
                ctx.save();
                ctx.globalAlpha = gl * 0.5;
                ctx.fillStyle = "#ff5a3c";
                ctx.fillRect(x + t.plade.x0, y + t.plade.y, t.plade.x1 - t.plade.x0, 3);
                ctx.restore();
            }
        }
    };

    /* Vaegten med displayet. tekst: det, den viser */
    T.tegnVaegt = function (ctx, gg, tekst, stabil) {
        var t = gg.type, x = gg.p.x - gg.anker.x, y = gg.p.y - gg.anker.y, D = t.display;
        T.skygge(ctx, x + t.b / 2, t.b / 2, 0.3, y + t.h - 3);
        NK.Sprites.tegn(ctx, t.sprite, x, y);
        NK.tekst(ctx, tekst, x + D.x + D.b - 6, y + D.y + D.h / 2 + 1, { font: "700 13px Consolas, 'Courier New', monospace", justering: "right", linje: "middle", farve: "#7df0a8" });
        if (stabil) NK.tekst(ctx, "○", x + D.x + 5, y + D.y + 6, { font: "600 6px 'Segoe UI', sans-serif", linje: "middle", farve: "#4fbf7f" });
    };

    /* Flammen fra braenderen. farve: evt. flammeproevens farve, styrke 0-1 */
    T.tegnFlamme = function (ctx, x, y, h, tid, farve, styrke) {
        var f = 1 + 0.06 * Math.sin(tid * 23) + 0.04 * Math.sin(tid * 37 + 1.3);
        h *= f;
        var sving = 1.2 * Math.sin(tid * 11);
        var s = farve ? NK.klamp(styrke === undefined ? 1 : styrke, 0, 1) : 0;
        var ydre = farve ? { r: NK.lerp(120, farve.r, s), g: NK.lerp(180, farve.g, s), b: NK.lerp(255, farve.b, s) } : { r: 120, g: 180, b: 255 };
        NK.skaer(ctx, x, y - h * 0.45, 30 + 20 * s, NK.css({ r: ydre.r, g: ydre.g, b: ydre.b, a: 0.45 }), 0.5 + 0.3 * s);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x - 6, y);
        ctx.bezierCurveTo(x - 10, y - h * 0.4, x - 3 + sving, y - h * 0.8, x + sving, y - h);
        ctx.bezierCurveTo(x + 3 + sving, y - h * 0.8, x + 10, y - h * 0.4, x + 6, y);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, y, 0, y - h);
        g.addColorStop(0, NK.css({ r: ydre.r, g: ydre.g, b: ydre.b, a: 0.85 }));
        g.addColorStop(0.6, NK.css({ r: NK.lerp(140, ydre.r, s), g: NK.lerp(125, ydre.g, s), b: NK.lerp(255, ydre.b, s), a: 0.55 }));
        g.addColorStop(1, NK.css({ r: NK.lerp(255, ydre.r, s), g: NK.lerp(170, ydre.g, s), b: NK.lerp(90, ydre.b, s), a: 0 }));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.quadraticCurveTo(x + sving * 0.3, y - h * 0.85, x + 4, y);
        ctx.closePath();
        ctx.fillStyle = "rgba(175, 222, 255, 0.92)";
        ctx.fill();
        ctx.restore();
    };

    /* Braenderen med trefod. gg: { taendt, flammeFarve, flammeStyrke } */
    T.tegnBraender = function (ctx, gg, tid) {
        var t = gg.type, x = gg.p.x - gg.anker.x, y = gg.p.y - gg.anker.y;
        T.skygge(ctx, x + t.b / 2, 38, 0.3, y + t.h - 3);
        if (gg.taendt) T.tegnFlamme(ctx, x + t.flammePunkt.x, y + t.flammePunkt.y, 30 + 12 * (gg.flammeStyrke || 0), tid, gg.flammeFarve, gg.flammeStyrke);
        NK.Sprites.tegn(ctx, t.sprite, x, y);
        NK.Sprites.tegn(ctx, "trefod", x + t.b / 2 - 35, y + t.h - 100);
    };

    /* Podetraaden: en tynd traad fra ankeret (0, 0) til (0, laengde) med en
       oeje i enden. last: en draabe oploesning, der sidder i oejet */
    T.tegnPodetraad = function (ctx, gg) {
        var p = gg.p, e = NK.tilVerden(p, gg.anker, 0, gg.type.laengde);
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(210, 215, 222, 0.9)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.strokeStyle = "rgba(90, 60, 30, 0.9)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(NK.lerp(p.x, e.x, 0.3), NK.lerp(p.y, e.y, 0.3));
        ctx.stroke();
        ctx.strokeStyle = "rgba(210, 215, 222, 0.9)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 3.5, 0, Math.PI * 2);
        ctx.stroke();
        if (gg.last) {
            ctx.fillStyle = NK.css(gg.lastFarve || { r: 200, g: 228, b: 245 }, 0.85);
            ctx.beginPath();
            ctx.arc(e.x, e.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* pH-meteret: en sonde fra ankeret (0, 0) ned til spidsen (0, laengde),
       med et lille display oeverst */
    T.tegnPHmeter = function (ctx, gg, visTal) {
        var L = gg.type.laengde, p = gg.p;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.fillStyle = "#2d3239";
        NK.rundtRekt(ctx, -7, 0, 14, 34, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#101418";
        NK.rundtRekt(ctx, -5, 4, 10, 12, 2);
        ctx.fill();
        ctx.fillStyle = "rgba(225, 238, 247, 0.55)";
        NK.rundtRekt(ctx, -3, 34, 6, L - 40, 3);
        ctx.fill();
        ctx.strokeStyle = "rgba(60, 80, 95, 0.65)";
        ctx.stroke();
        NK.kugle(ctx, 0, L - 4, 4, "#dfe8f0", "#7a8894");
        ctx.restore();
        if (visTal) {
            var w = NK.tilVerden(p, { x: 0, y: 0 }, 0, -16);
            var tekst = gg.pH === undefined || gg.pH === null ? "pH –" : "pH " + (Math.round(gg.pH * 10) / 10).toFixed(1).replace(".", ",");
            ctx.save();
            ctx.font = "700 14px 'Segoe UI', sans-serif";
            var b = ctx.measureText(tekst).width + 16;
            ctx.fillStyle = "rgba(20, 22, 28, 0.92)";
            NK.rundtRekt(ctx, w.x - b / 2, w.y - 12, b, 24, 12);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 1;
            ctx.stroke();
            NK.tekst(ctx, tekst, w.x, w.y + 0.5, { font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#9fe3ff" });
            ctx.restore();
        }
    };

    /* En straale vaeske fra en aabning ned til en overflade. */
    T.tegnStraale = function (ctx, fra, til, farve, bredde, tid) {
        if (!farve) return;
        ctx.save();
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y);
        ctx.quadraticCurveTo(fra.x + (til.x - fra.x) * 0.85, fra.y + 2, til.x, til.y);
        ctx.strokeStyle = NK.css({ r: farve.r, g: farve.g, b: farve.b, a: Math.max(0.6, farve.a) });
        ctx.lineWidth = bredde;
        ctx.stroke();
        ctx.setLineDash([5, 9]);
        ctx.lineDashOffset = -tid * 90;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = Math.max(1, bredde * 0.35);
        ctx.stroke();
        ctx.restore();
    };

    T.tegnDraaber = function (ctx, draaber) {
        ctx.save();
        for (var i = 0; i < draaber.length; i++) {
            var d = draaber[i];
            ctx.globalAlpha = NK.klamp(d.liv === undefined ? 1 : d.liv, 0, 1);
            if (d.korn) {
                ctx.fillStyle = NK.css(d.farve, 1);
                ctx.fillRect(d.x - 1.4, d.y - 1.4, 2.8, 2.8);
                continue;
            }
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, d.r * 0.8, d.r, 0, 0, Math.PI * 2);
            if (!d.farve || d.farve.a < 0.6) {
                ctx.fillStyle = "rgba(210, 230, 245, 0.18)";
                ctx.fill();
                ctx.strokeStyle = "rgba(235, 245, 255, 0.85)";
                ctx.lineWidth = 1;
                ctx.stroke();
            } else {
                ctx.fillStyle = NK.css(d.farve, 1);
                ctx.fill();
            }
        }
        ctx.restore();
    };

    T.tegnDampe = function (ctx, dampe) {
        ctx.save();
        for (var i = 0; i < dampe.length; i++) {
            var d = dampe[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * (d.farve ? 0.32 : 0.16);
            ctx.fillStyle = d.farve ? NK.css(d.farve, 1) : "#eef3f8";
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* Pytten paa bordet efter et uheld */
    T.tegnPyt = function (ctx, pyt) {
        if (!pyt || pyt.vaad < 0.01) return;
        var BORD = pyt.y === undefined ? S().BORD : pyt.y;
        ctx.save();
        ctx.globalAlpha = NK.klamp(pyt.vaad, 0, 1);
        ctx.fillStyle = NK.css(pyt.farve, 1);
        ctx.beginPath();
        ctx.ellipse(pyt.x, BORD + 2.5, pyt.rx, 5.5, 0, 0, Math.PI * 2);
        ctx.ellipse(pyt.x + pyt.rx * 0.55, BORD + 3, pyt.rx * 0.45, 4.5, 0, 0, Math.PI * 2);
        ctx.ellipse(pyt.x - pyt.rx * 0.6, BORD + 2, pyt.rx * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.beginPath();
        ctx.ellipse(pyt.x - pyt.rx * 0.2, BORD + 1.5, pyt.rx * 0.4, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Den groenne ramme om det, en baaret genstand vil blive brugt paa */
    T.tegnSlipMaal = function (ctx, r, tid) {
        T.tegnMarkering(ctx, r, tid, "#7ee0a8");
    };

    /* Haanden, der holder om et glas, mens det rystes */
    T.tegnHaand = function (ctx, p, alfa) {
        if (alfa <= 0.01) return;
        NK.Sprites.tegnPositur(ctx, "haand", p, NK.Udstyr.HAAND_ANKER, alfa);
    };

    /* Den gule ring med pilen ved siden af det, der svaever. ring: { x, y,
       r, tekst } */
    T.tegnSvaevRing = function (ctx, ring, tid, hover) {
        var puls = 1 + 0.06 * Math.sin(tid * 4);
        ctx.save();
        NK.skaer(ctx, ring.x, ring.y, ring.r * 2.2 * puls, "rgba(242, 197, 61, 0.35)");
        ctx.fillStyle = hover ? "rgba(242, 197, 61, 0.35)" : "rgba(20, 20, 26, 0.55)";
        ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r * puls, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#f2c53d";
        ctx.lineWidth = 3.5;
        ctx.stroke();
        /* Pilen ned: "en portion til" */
        ctx.strokeStyle = "#f7f0c8";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(ring.x, ring.y - 6); ctx.lineTo(ring.x, ring.y + 6);
        ctx.moveTo(ring.x - 5, ring.y + 1); ctx.lineTo(ring.x, ring.y + 6); ctx.lineTo(ring.x + 5, ring.y + 1);
        ctx.stroke();
        /* Med musen over pilen: hvad den goer (ring.tekst), til hoejre for
           den, eller til venstre, hvis der ikke er plads */
        if (hover && ring.tekst) {
            ctx.font = "700 13px 'Segoe UI', sans-serif";
            var b = ctx.measureText(ring.tekst).width + 16, h = 24;
            var x = ring.x + ring.r + 10;
            if (x + b > NK.Scene.BREDDE - 4) x = ring.x - ring.r - 10 - b;
            ctx.fillStyle = "rgba(20, 22, 28, 0.92)";
            ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
            ctx.lineWidth = 1.5;
            NK.rundtRekt(ctx, x, ring.y - h / 2, b, h, 7);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#f7f0c8";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(ring.tekst, x + 8, ring.y + 0.5);
        }
        ctx.restore();
    };

    /* ----- Rum: lugen og stinkskabet ---------------------------------------- */

    /* Lugen (gennemraekningsskabet). tekst: skiltet, fx "TIL STINKSKABET"; lys:
       0-1 naar den lige har sendt */
    T.tegnLuge = function (ctx, gg, tekst, lys, tid) {
        var t = gg.type, x = gg.p.x - gg.anker.x, y = gg.p.y - gg.anker.y;
        T.skygge(ctx, x + t.b / 2, t.b / 2, 0.3, y + t.h - 3);
        NK.Sprites.tegn(ctx, t.sprite, x, y);
        if (tekst) NK.tekst(ctx, tekst, x + t.skilt.x + t.skilt.b / 2, y + t.skilt.y + t.skilt.h / 2 + 0.5, { font: "800 7.5px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#e9edf1" });
        var kx = x + t.knap.x, ky = y + t.knap.y;
        NK.kugle(ctx, kx, ky, 5, "#f7f0c8", "#b99a2a");
        NK.tekst(ctx, "SEND", kx, ky + 14, { font: "800 5px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#2f343b" });
        var lampe = lys > 0.01 ? lys : 0;
        if (lampe > 0.01) NK.skaer(ctx, kx, ky + 24, 7, "rgba(126, 224, 168, 0.9)", lampe * (0.7 + 0.3 * Math.sin(tid * 8)));
        NK.kugle(ctx, kx, ky + 24, 2.2, lampe > 0.3 ? "#c8ffd9" : "#3d4a42", lampe > 0.3 ? "#3fae72" : "#243029");
    };

    /* Stinkskabet: kabinettet bag udstyret. sk: { x0, x1, top, aabning } paa bordet */
    T.tegnStinkskabBag = function (ctx, sk, tid) {
        var Sc = S(), BORD = Sc.BORD, x0 = sk.x0, x1 = sk.x1, b = x1 - x0;
        var top = sk.top === undefined ? 92 : sk.top;
        ctx.save();
        /* Bagvaeg med udsugningsslidser */
        ctx.fillStyle = "#262b33";
        ctx.fillRect(x0, top, b, BORD - top);
        for (var y = top + 60; y < BORD - 30; y += 34) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
            ctx.fillRect(x0 + 24, y, b - 48, 4);
            ctx.fillStyle = "#1a1d23";
            ctx.fillRect(x0 + 24, y + 4, b - 48, 2);
        }
        /* Loftskassen med ventilator og lys */
        var g = ctx.createLinearGradient(0, top - 50, 0, top);
        g.addColorStop(0, "#8d96a2");
        g.addColorStop(1, "#5f6874");
        ctx.fillStyle = g;
        ctx.fillRect(x0 - 12, top - 50, b + 24, 52);
        ctx.fillStyle = "rgba(255, 248, 225, 0.75)";
        NK.rundtRekt(ctx, x0 + 30, top - 4, b - 60, 4, 2);
        ctx.fill();
        NK.skaer(ctx, x0 + b / 2, top + 20, 160, "rgba(255, 248, 225, 0.08)");
        /* Ventilatoren drejer, naar skabet suger */
        var vx = x0 + b / 2, vy = top - 25;
        ctx.fillStyle = "#3a4049";
        ctx.beginPath(); ctx.arc(vx, vy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#aab3bd";
        ctx.lineWidth = 2;
        for (var k = 0; k < 4; k++) {
            var v = tid * (sk.taendt === false ? 0 : 9) + k * Math.PI / 2;
            ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + Math.cos(v) * 13, vy + Math.sin(v) * 13); ctx.stroke();
        }
        ctx.strokeStyle = "#dfe5ea";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(vx, vy, 16, 0, Math.PI * 2); ctx.stroke();
        NK.tekst(ctx, "STINKSKAB", x0 + 22, top - 25, { font: "800 11px 'Segoe UI', sans-serif", linje: "middle", farve: "#e9edf1" });
        /* Hylder inde i skabet tegnes igen oven paa bagvaeggen */
        (Sc.HYLDER || []).forEach(function (H) {
            if (H.x0 < x0 || H.x1 > x1) return;
            ctx.fillStyle = "#8d96a2";
            ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 7);
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 1.5);
            ctx.fillStyle = "#5f6874";
            for (var hx = H.x0 + 10; hx < H.x1 - 12; hx += 180) ctx.fillRect(hx, H.y + 7, 5, 14);
            ctx.fillRect(H.x1 - 15, H.y + 7, 5, 14);
        });
        /* Sidestolper */
        ctx.fillStyle = "#6b747f";
        ctx.fillRect(x0 - 12, top - 50, 12, BORD - top + 50);
        ctx.fillRect(x1, top - 50, 12, BORD - top + 50);
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(x0 - 12, top - 50, 2, BORD - top + 50);
        ctx.fillRect(x1, top - 50, 2, BORD - top + 50);
        ctx.restore();
    };

    /* Stinkskabets glasrude foran udstyret. Ruden er skubbet op, saa der
       er en aabning nederst (sk.aabning, standard 150) at arbejde i */
    T.tegnStinkskabFor = function (ctx, sk) {
        var Sc = S(), BORD = Sc.BORD, x0 = sk.x0, x1 = sk.x1, b = x1 - x0;
        var top = sk.top === undefined ? 92 : sk.top;
        var bund = BORD - (sk.aabning === undefined ? 150 : sk.aabning);
        /* rude: false: ruden er skubbet helt op, saa den ikke daekker noget */
        if (sk.rude === false || bund <= top + 10) return;
        ctx.save();
        var g = ctx.createLinearGradient(x0, top, x1, bund);
        g.addColorStop(0, "rgba(200, 225, 245, 0.10)");
        g.addColorStop(0.45, "rgba(200, 225, 245, 0.03)");
        g.addColorStop(0.55, "rgba(255, 255, 255, 0.10)");
        g.addColorStop(1, "rgba(200, 225, 245, 0.05)");
        ctx.fillStyle = g;
        ctx.fillRect(x0, top, b, bund - top);
        /* Rudens ramme og haandtag */
        ctx.fillStyle = "#8d96a2";
        ctx.fillRect(x0, bund - 4, b, 10);
        ctx.fillStyle = "#dfe5ea";
        ctx.fillRect(x0, bund - 4, b, 1.5);
        ctx.fillStyle = "#5f6874";
        ctx.fillRect(x0 + b / 2 - 40, bund + 6, 80, 5);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x0 + 0.5, top + 0.5, b - 1, bund - top - 1);
        /* Refleks */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x0 + b * 0.15, bund - 10); ctx.lineTo(x0 + b * 0.35, top + 10); ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0 + b * 0.22, bund - 10); ctx.lineTo(x0 + b * 0.42, top + 10); ctx.stroke();
        ctx.restore();
    };

    /* Pilen til naborummet. side: "venstre" | "hoejre"; alfa 0-1 */
    T.tegnRumpil = function (ctx, side, y, titel, alfa, tid) {
        var Sc = S(), x = side === "venstre" ? 40 : Sc.BREDDE - 40;
        var puls = 1 + 0.04 * Math.sin(tid * 3);
        ctx.save();
        ctx.globalAlpha = alfa;
        NK.skaer(ctx, x, y, 34 * puls, "rgba(242, 197, 61, 0.35)");
        ctx.fillStyle = "rgba(20, 20, 26, 0.85)";
        ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#f2c53d";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = "#f7f0c8";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        var d = side === "venstre" ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(x - d * 8, y); ctx.lineTo(x + d * 8, y);
        ctx.moveTo(x + d * 1, y - 7); ctx.lineTo(x + d * 8, y); ctx.lineTo(x + d * 1, y + 7);
        ctx.stroke();
        if (titel) NK.tekst(ctx, titel, x, y + 40, { font: "700 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f7f0c8" });
        ctx.restore();
    };
}());
