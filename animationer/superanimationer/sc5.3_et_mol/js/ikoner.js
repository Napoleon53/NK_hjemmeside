/* =====================================================================
   ikoner.js - de smaa tegninger paa stigen og i fane 2

   NK.Ikon.tegn(ctx, navn, x, y, s) tegner ikonet med midten i (x, y) og
   stoerrelsen s px. Hvert ikon er tegnet i en kasse fra -50 til 50, saa
   koden ikke skal regne med s. Stilen er brugerens (feedback om figurer,
   der ikke maa ligne Paint): lys fra oven til venstre, blod skygge,
   en tynd moerk kant.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- Smaa byggesten -------------------------------------------------- */
    function kugle(c, x, y, r, lys, mork, kant) {
        var g = c.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
        g.addColorStop(0, lys);
        g.addColorStop(1, mork);
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fillStyle = g;
        c.fill();
        if (kant !== false) {
            c.lineWidth = 1.6;
            c.strokeStyle = kant || "rgba(0, 0, 0, 0.45)";
            c.stroke();
        }
    }

    function glans(c, x, y, r) {
        var g = c.createRadialGradient(x - r * 0.4, y - r * 0.45, 0, x - r * 0.4, y - r * 0.45, r * 0.55);
        g.addColorStop(0, "rgba(255, 255, 255, 0.75)");
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
    }

    function skygge(c, x, y, rx, ry) {
        c.save();
        c.fillStyle = "rgba(0, 0, 0, 0.28)";
        c.beginPath();
        c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }

    function rekt(c, x, y, b, h, r) { NK.rundtRekt(c, x, y, b, h, r); }

    function lodret(c, y0, y1, a, b) {
        var g = c.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, a);
        g.addColorStop(1, b);
        return g;
    }

    function vandret(c, x0, x1, a, b) {
        var g = c.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, a);
        g.addColorStop(1, b);
        return g;
    }

    function kantlinje(c, b) {
        c.lineWidth = b || 2;
        c.strokeStyle = "rgba(0, 0, 0, 0.5)";
        c.stroke();
    }

    /* ----- Ikonerne ---------------------------------------------------------- */
    var T = {};

    T.atom = function (c) {
        var g = c.createRadialGradient(0, 0, 4, 0, 0, 44);
        g.addColorStop(0, "rgba(150, 200, 255, 0.55)");
        g.addColorStop(1, "rgba(150, 200, 255, 0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, 44, 0, Math.PI * 2); c.fill();
        kugle(c, 0, 0, 26, "#9aa3ad", "#3a4048");
        glans(c, 0, 0, 26);
        NK.tekst(c, "C", 0, 2, { font: "800 26px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
    };

    T.virus = function (c) {
        c.strokeStyle = "#4f8a3a";
        c.lineWidth = 4;
        for (var i = 0; i < 12; i++) {
            var a = i / 12 * Math.PI * 2;
            c.beginPath();
            c.moveTo(Math.cos(a) * 26, Math.sin(a) * 26);
            c.lineTo(Math.cos(a) * 40, Math.sin(a) * 40);
            c.stroke();
            kugle(c, Math.cos(a) * 42, Math.sin(a) * 42, 5, "#c9f0a0", "#4f8a3a", false);
        }
        kugle(c, 0, 0, 28, "#bde88f", "#3f7a2c");
        glans(c, 0, 0, 28);
    };

    T.bakterie = function (c) {
        c.save();
        c.rotate(-0.4);
        c.strokeStyle = "#7a9b3b";
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(34, 0);
        c.bezierCurveTo(44, -10, 50, 10, 48, 18);
        c.stroke();
        rekt(c, -38, -16, 72, 32, 16);
        c.fillStyle = lodret(c, -16, 16, "#d6ee8a", "#7a9b3b");
        c.fill();
        kantlinje(c, 1.8);
        c.fillStyle = "rgba(60, 90, 20, 0.35)";
        c.beginPath(); c.ellipse(-8, 2, 12, 6, 0, 0, Math.PI * 2); c.fill();
        c.restore();
    };

    T.sandkorn = function (c) {
        skygge(c, 4, 30, 28, 7);
        c.beginPath();
        c.moveTo(-30, -6); c.lineTo(-14, -28); c.lineTo(12, -30); c.lineTo(32, -10);
        c.lineTo(28, 18); c.lineTo(4, 30); c.lineTo(-24, 22);
        c.closePath();
        var g = c.createLinearGradient(-30, -30, 30, 30);
        g.addColorStop(0, "#f6e2b0");
        g.addColorStop(1, "#b98a4a");
        c.fillStyle = g;
        c.fill();
        kantlinje(c, 1.8);
        c.fillStyle = "rgba(255, 255, 255, 0.5)";
        c.beginPath(); c.moveTo(-14, -22); c.lineTo(8, -24); c.lineTo(-4, -12); c.closePath(); c.fill();
    };

    T.ark = function (c) {
        skygge(c, 4, 40, 34, 6);
        c.save();
        c.rotate(-0.12);
        c.beginPath();
        c.moveTo(-28, -38); c.lineTo(16, -38); c.lineTo(28, -26); c.lineTo(28, 38); c.lineTo(-28, 38);
        c.closePath();
        c.fillStyle = lodret(c, -38, 38, "#ffffff", "#e3e0d6");
        c.fill();
        kantlinje(c, 1.6);
        c.beginPath();
        c.moveTo(16, -38); c.lineTo(16, -26); c.lineTo(28, -26);
        c.fillStyle = "#d4cfc1";
        c.fill();
        c.stroke();
        c.strokeStyle = "#9db3c9";
        c.lineWidth = 2;
        for (var i = 0; i < 6; i++) {
            c.beginPath();
            c.moveTo(-20, -18 + i * 10);
            c.lineTo(i === 5 ? 4 : 20, -18 + i * 10);
            c.stroke();
        }
        c.restore();
    };

    T.menneske = function (c) {
        skygge(c, 0, 44, 22, 5);
        kugle(c, 0, -30, 12, "#ffd9b8", "#c48c62");
        rekt(c, -16, -16, 32, 34, 12);
        c.fillStyle = lodret(c, -16, 18, "#5fb0ef", "#2a6fa8");
        c.fill();
        kantlinje(c, 1.6);
        rekt(c, -14, 14, 12, 30, 5);
        c.fillStyle = "#34405a"; c.fill(); kantlinje(c, 1.4);
        rekt(c, 2, 14, 12, 30, 5);
        c.fillStyle = "#34405a"; c.fill(); kantlinje(c, 1.4);
    };

    T.taarn = function (c) {
        skygge(c, 0, 46, 30, 5);
        rekt(c, -24, -30, 48, 76, 4);
        c.fillStyle = vandret(c, -24, 24, "#c46a4a", "#7a3422");
        c.fill();
        kantlinje(c, 1.6);
        c.strokeStyle = "rgba(60, 20, 10, 0.35)";
        c.lineWidth = 1;
        for (var y = -22; y < 44; y += 8) { c.beginPath(); c.moveTo(-24, y); c.lineTo(24, y); c.stroke(); }
        rekt(c, -28, -38, 56, 9, 2);
        c.fillStyle = "#e8e2d4"; c.fill(); kantlinje(c, 1.4);
        c.fillStyle = "#3c4b5c";
        rekt(c, -6, -18, 12, 16, 6); c.fill();
        rekt(c, -6, 8, 12, 16, 6); c.fill();
        c.strokeStyle = "#e8e2d4";
        c.lineWidth = 2;
        for (var x = -24; x <= 24; x += 8) { c.beginPath(); c.moveTo(x, -38); c.lineTo(x, -46); c.stroke(); }
        c.beginPath(); c.moveTo(-26, -46); c.lineTo(26, -46); c.stroke();
    };

    T.bjerg = function (c) {
        c.beginPath();
        c.moveTo(-48, 40); c.lineTo(-8, -38); c.lineTo(10, -14); c.lineTo(20, -26); c.lineTo(48, 40);
        c.closePath();
        c.fillStyle = vandret(c, -48, 48, "#8f9aa6", "#4a535e");
        c.fill();
        kantlinje(c, 1.6);
        c.beginPath();
        c.moveTo(-8, -38); c.lineTo(-22, -12); c.lineTo(-12, -16); c.lineTo(-4, -8); c.lineTo(4, -20); c.lineTo(10, -14);
        c.closePath();
        c.fillStyle = "#ffffff";
        c.fill();
        c.beginPath();
        c.moveTo(20, -26); c.lineTo(13, -14); c.lineTo(20, -17); c.lineTo(28, -12);
        c.closePath();
        c.fill();
    };

    T.iss = function (c) {
        function panel(x) {
            rekt(c, x, -30, 26, 60, 2);
            c.fillStyle = lodret(c, -30, 30, "#4f74c9", "#1d3a7a");
            c.fill();
            kantlinje(c, 1.2);
            c.strokeStyle = "rgba(200, 220, 255, 0.4)";
            c.lineWidth = 1;
            for (var y = -20; y < 30; y += 10) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 26, y); c.stroke(); }
        }
        panel(-48);
        panel(22);
        c.fillStyle = "#c8ccd2";
        c.fillRect(-22, -3, 44, 6);
        rekt(c, -12, -12, 24, 24, 6);
        c.fillStyle = vandret(c, -12, 12, "#f2f4f6", "#9aa2ab");
        c.fill();
        kantlinje(c, 1.4);
    };

    T.maane = function (c) {
        kugle(c, 0, 0, 40, "#f1f1ec", "#7d7d78");
        c.fillStyle = "rgba(90, 90, 86, 0.35)";
        [[-12, -10, 9], [14, 8, 7], [-4, 20, 6], [16, -16, 5], [-22, 10, 4]].forEach(function (k) {
            c.beginPath(); c.arc(k[0], k[1], k[2], 0, Math.PI * 2); c.fill();
        });
        glans(c, 0, 0, 40);
    };

    T.sol = function (c) {
        var g = c.createRadialGradient(0, 0, 20, 0, 0, 50);
        g.addColorStop(0, "rgba(255, 200, 60, 0.7)");
        g.addColorStop(1, "rgba(255, 140, 0, 0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, 50, 0, Math.PI * 2); c.fill();
        kugle(c, 0, 0, 34, "#fff6b0", "#f08a10", "rgba(160, 60, 0, 0.4)");
    };

    T.pluto = function (c) {
        kugle(c, 0, 0, 30, "#e8d2b8", "#7a5a40");
        c.fillStyle = "rgba(255, 245, 230, 0.75)";
        c.beginPath();
        c.moveTo(4, 18);
        c.bezierCurveTo(-14, 6, -6, -8, 4, 0);
        c.bezierCurveTo(12, -8, 22, 6, 4, 18);
        c.fill();
    };

    T.stjerne = function (c) {
        var g = c.createRadialGradient(0, 0, 2, 0, 0, 40);
        g.addColorStop(0, "rgba(255, 255, 255, 1)");
        g.addColorStop(0.25, "rgba(190, 220, 255, 0.8)");
        g.addColorStop(1, "rgba(120, 170, 255, 0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#ffffff";
        c.beginPath();
        for (var i = 0; i < 8; i++) {
            var a = i / 8 * Math.PI * 2, r = i % 2 === 0 ? 46 : 7;
            c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.closePath();
        c.fill();
    };

    T.galakse = function (c) {
        var g = c.createRadialGradient(0, 0, 0, 0, 0, 46);
        g.addColorStop(0, "rgba(255, 240, 210, 0.95)");
        g.addColorStop(0.3, "rgba(190, 150, 255, 0.45)");
        g.addColorStop(1, "rgba(80, 60, 160, 0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, 46, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(235, 225, 255, 0.85)";
        for (var arm = 0; arm < 2; arm++) {
            for (var i = 0; i < 26; i++) {
                var t = i / 26, a = arm * Math.PI + t * 4.2, r = 6 + t * 40;
                c.beginPath();
                c.arc(Math.cos(a) * r, Math.sin(a) * r * 0.8, 2.6 - t * 1.5, 0, Math.PI * 2);
                c.fill();
            }
        }
    };

    T.andromeda = function (c) {
        c.save();
        c.rotate(-0.6);
        var g = c.createRadialGradient(0, 0, 0, 0, 0, 48);
        g.addColorStop(0, "rgba(255, 245, 225, 1)");
        g.addColorStop(0.25, "rgba(210, 190, 255, 0.6)");
        g.addColorStop(1, "rgba(90, 80, 170, 0)");
        c.fillStyle = g;
        c.scale(1, 0.38);
        c.beginPath(); c.arc(0, 0, 48, 0, Math.PI * 2); c.fill();
        c.restore();
    };

    T.h2o = function (c) {
        kugle(c, -24, 18, 15, "#ffffff", "#b9c0c8");
        kugle(c, 24, 18, 15, "#ffffff", "#b9c0c8");
        kugle(c, 0, -6, 26, "#ff8a7a", "#b3261a");
        glans(c, 0, -6, 26);
        NK.tekst(c, "O", 0, -5, { font: "800 22px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
        NK.tekst(c, "H", -24, 19, { font: "800 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#333a44" });
        NK.tekst(c, "H", 24, 19, { font: "800 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#333a44" });
    };

    T.draabe = function (c) {
        c.beginPath();
        c.moveTo(0, -44);
        c.bezierCurveTo(10, -24, 32, -2, 32, 16);
        c.bezierCurveTo(32, 34, 18, 44, 0, 44);
        c.bezierCurveTo(-18, 44, -32, 34, -32, 16);
        c.bezierCurveTo(-32, -2, -10, -24, 0, -44);
        c.closePath();
        var g = c.createRadialGradient(-10, 4, 4, 0, 14, 42);
        g.addColorStop(0, "#bfe6ff");
        g.addColorStop(1, "#1f6fbf");
        c.fillStyle = g;
        c.fill();
        kantlinje(c, 1.6);
        c.fillStyle = "rgba(255, 255, 255, 0.75)";
        c.beginPath(); c.ellipse(-12, 14, 5, 10, 0.3, 0, Math.PI * 2); c.fill();
    };

    T.terning = function (c) {
        skygge(c, 0, 40, 34, 7);
        /* top, venstre og hoejre side i isometri */
        c.beginPath(); c.moveTo(0, -38); c.lineTo(32, -22); c.lineTo(0, -6); c.lineTo(-32, -22); c.closePath();
        c.fillStyle = "#ffffff"; c.fill(); kantlinje(c, 1.6);
        c.beginPath(); c.moveTo(-32, -22); c.lineTo(0, -6); c.lineTo(0, 36); c.lineTo(-32, 20); c.closePath();
        c.fillStyle = "#dfe2e6"; c.fill(); kantlinje(c, 1.6);
        c.beginPath(); c.moveTo(32, -22); c.lineTo(0, -6); c.lineTo(0, 36); c.lineTo(32, 20); c.closePath();
        c.fillStyle = "#bfc4ca"; c.fill(); kantlinje(c, 1.6);
        c.fillStyle = "#c62828";
        c.beginPath(); c.ellipse(0, -22, 5, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#222831";
        [[-24, -8], [-8, 22], [-16, 7]].forEach(function (p) { c.beginPath(); c.ellipse(p[0], p[1], 3, 4, 0, 0, Math.PI * 2); c.fill(); });
        [[8, -4], [24, 4], [8, 22], [24, 30]].forEach(function (p) { c.beginPath(); c.ellipse(p[0], p[1] - 6, 3, 4, 0, 0, Math.PI * 2); c.fill(); });
    };

    T.ske = function (c) {
        c.save();
        c.rotate(-0.5);
        rekt(c, -4, 8, 8, 44, 4);
        c.fillStyle = vandret(c, -4, 4, "#eef1f4", "#8d96a0");
        c.fill(); kantlinje(c, 1.4);
        c.beginPath(); c.ellipse(0, -14, 20, 28, 0, 0, Math.PI * 2);
        c.fillStyle = vandret(c, -20, 20, "#f4f6f8", "#8d96a0");
        c.fill(); kantlinje(c, 1.6);
        c.beginPath(); c.ellipse(0, -14, 14, 21, 0, 0, Math.PI * 2);
        c.fillStyle = lodret(c, -35, 7, "#9fd6ff", "#2d7fd0");
        c.fill();
        c.fillStyle = "rgba(255, 255, 255, 0.7)";
        c.beginPath(); c.ellipse(-5, -22, 3, 7, 0.2, 0, Math.PI * 2); c.fill();
        c.restore();
    };

    T.fodbold = function (c) {
        kugle(c, 0, 0, 40, "#ffffff", "#b5bbc2");
        c.fillStyle = "#1e232a";
        function femkant(x, y, r, v) {
            c.beginPath();
            for (var i = 0; i < 5; i++) {
                var a = v + i / 5 * Math.PI * 2;
                c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
            }
            c.closePath();
            c.fill();
        }
        femkant(0, 0, 12, -Math.PI / 2);
        for (var i = 0; i < 5; i++) {
            var a = -Math.PI / 2 + i / 5 * Math.PI * 2 + Math.PI / 5;
            femkant(Math.cos(a) * 32, Math.sin(a) * 32, 9, a + Math.PI);
        }
        c.strokeStyle = "rgba(30, 35, 42, 0.5)";
        c.lineWidth = 1.4;
        for (i = 0; i < 5; i++) {
            var b = -Math.PI / 2 + i / 5 * Math.PI * 2;
            c.beginPath();
            c.moveTo(Math.cos(b) * 12, Math.sin(b) * 12);
            c.lineTo(Math.cos(b) * 26, Math.sin(b) * 26);
            c.stroke();
        }
        glans(c, 0, 0, 40);
        c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); kantlinje(c, 1.6);
    };

    T.spand = function (c) {
        skygge(c, 0, 42, 28, 5);
        c.strokeStyle = "#5d6670";
        c.lineWidth = 3;
        c.beginPath(); c.arc(0, -18, 30, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
        c.beginPath();
        c.moveTo(-32, -22); c.lineTo(32, -22); c.lineTo(24, 40); c.lineTo(-24, 40);
        c.closePath();
        c.fillStyle = vandret(c, -32, 32, "#d7dde3", "#6f7983");
        c.fill(); kantlinje(c, 1.6);
        c.beginPath(); c.ellipse(0, -22, 32, 7, 0, 0, Math.PI * 2);
        c.fillStyle = "#3a8ad6"; c.fill(); kantlinje(c, 1.4);
    };

    T.badebold = function (c) {
        var farver = ["#e53935", "#ffffff", "#fdd835", "#ffffff", "#1e88e5", "#ffffff"];
        for (var i = 0; i < 6; i++) {
            c.beginPath();
            c.moveTo(0, 0);
            c.arc(0, 0, 40, i / 6 * Math.PI * 2 - Math.PI / 2, (i + 1) / 6 * Math.PI * 2 - Math.PI / 2);
            c.closePath();
            c.fillStyle = farver[i];
            c.fill();
        }
        var g = c.createRadialGradient(-14, -16, 4, 0, 0, 40);
        g.addColorStop(0, "rgba(255, 255, 255, 0.5)");
        g.addColorStop(1, "rgba(0, 0, 0, 0.35)");
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); c.fill();
        kantlinje(c, 1.6);
        kugle(c, 0, 0, 7, "#ffffff", "#c9ced4");
    };

    T.badekar = function (c) {
        c.fillStyle = "#a0a8b2";
        [-30, 30].forEach(function (x) { c.beginPath(); c.arc(x, 34, 6, 0, Math.PI * 2); c.fill(); });
        c.beginPath();
        c.moveTo(-46, -8); c.lineTo(46, -8); c.lineTo(40, 22);
        c.quadraticCurveTo(38, 32, 26, 32); c.lineTo(-26, 32);
        c.quadraticCurveTo(-38, 32, -40, 22);
        c.closePath();
        c.fillStyle = lodret(c, -8, 32, "#ffffff", "#c6ccd3");
        c.fill(); kantlinje(c, 1.6);
        c.fillStyle = "#e8f6ff";
        [[-20, -14, 9], [-6, -18, 11], [10, -14, 8], [22, -16, 7]].forEach(function (b) {
            c.beginPath(); c.arc(b[0], b[1], b[2], 0, Math.PI * 2); c.fill();
            c.strokeStyle = "rgba(120, 170, 210, 0.6)"; c.lineWidth = 1; c.stroke();
        });
        c.strokeStyle = "#8d96a0";
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(38, -8); c.lineTo(38, -30); c.lineTo(28, -30); c.stroke();
    };

    T.klasse = function (c) {
        skygge(c, 0, 44, 46, 5);
        rekt(c, -44, -32, 88, 74, 4);
        c.fillStyle = lodret(c, -32, 42, "#f3e7cf", "#cdb791");
        c.fill(); kantlinje(c, 1.6);
        rekt(c, -32, -22, 64, 30, 3);
        c.fillStyle = "#2f5d46"; c.fill();
        c.lineWidth = 3; c.strokeStyle = "#8a6a3e"; c.stroke();
        NK.tekst(c, "n = m / M", 0, -5, { font: "700 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#e8f2ea" });
        c.fillStyle = "#9b7348";
        [-28, -6, 16].forEach(function (x) { rekt(c, x, 20, 14, 8, 2); c.fill(); });
        c.fillRect(-27, 28, 2, 10); c.fillRect(-5, 28, 2, 10); c.fillRect(17, 28, 2, 10);
    };

    T.bassin = function (c) {
        c.beginPath();
        c.moveTo(-36, -24); c.lineTo(36, -24); c.lineTo(48, 30); c.lineTo(-48, 30);
        c.closePath();
        c.fillStyle = "#dfe4ea"; c.fill(); kantlinje(c, 1.6);
        c.beginPath();
        c.moveTo(-30, -18); c.lineTo(30, -18); c.lineTo(40, 24); c.lineTo(-40, 24);
        c.closePath();
        c.fillStyle = lodret(c, -18, 24, "#6fd0f2", "#1c86c4");
        c.fill();
        c.strokeStyle = "rgba(255, 255, 255, 0.85)";
        c.lineWidth = 1.6;
        for (var i = 1; i < 4; i++) {
            var t = i / 4;
            c.beginPath(); c.moveTo(-30 - 10 * t, -18 + 42 * t); c.lineTo(30 + 10 * t, -18 + 42 * t); c.stroke();
        }
    };

    T.stadion = function (c) {
        c.beginPath(); c.ellipse(0, 6, 48, 30, 0, 0, Math.PI * 2);
        c.fillStyle = lodret(c, -24, 36, "#c7ccd3", "#6f7882");
        c.fill(); kantlinje(c, 1.6);
        c.beginPath(); c.ellipse(0, 8, 32, 17, 0, 0, Math.PI * 2);
        c.fillStyle = "#3f9a4a"; c.fill();
        c.strokeStyle = "rgba(255, 255, 255, 0.85)";
        c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 25); c.stroke();
        c.beginPath(); c.ellipse(0, 8, 7, 4, 0, 0, Math.PI * 2); c.stroke();
    };

    T.zeppeliner = function (c) {
        c.fillStyle = "#8a939d";
        c.beginPath(); c.moveTo(32, -4); c.lineTo(48, -20); c.lineTo(46, 0); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(32, 4); c.lineTo(48, 20); c.lineTo(46, 0); c.closePath(); c.fill();
        c.beginPath(); c.ellipse(-4, 0, 44, 18, 0, 0, Math.PI * 2);
        c.fillStyle = lodret(c, -18, 18, "#f2f4f6", "#8a939d");
        c.fill(); kantlinje(c, 1.6);
        rekt(c, -16, 16, 24, 8, 3);
        c.fillStyle = "#5c4a3a"; c.fill();
    };

    T.soe = function (c) {
        c.beginPath();
        c.moveTo(-44, 6);
        c.bezierCurveTo(-46, -20, -10, -26, 10, -18);
        c.bezierCurveTo(36, -26, 50, -4, 40, 14);
        c.bezierCurveTo(30, 32, -30, 34, -44, 6);
        c.closePath();
        c.fillStyle = lodret(c, -26, 30, "#7cc4ef", "#1f6aa8");
        c.fill(); kantlinje(c, 1.6);
        c.strokeStyle = "#5c8f3a";
        c.lineWidth = 2.5;
        for (var i = 0; i < 4; i++) {
            c.beginPath(); c.moveTo(30 + i * 4, 24); c.lineTo(28 + i * 5, 4 - i * 3); c.stroke();
        }
        c.strokeStyle = "rgba(255, 255, 255, 0.6)";
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(-26, -2); c.quadraticCurveTo(-18, -6, -10, -2); c.stroke();
    };

    T.hav = function (c) {
        rekt(c, -46, -30, 92, 66, 10);
        c.fillStyle = lodret(c, -30, 36, "#4aa6e8", "#0c3f7a");
        c.fill(); kantlinje(c, 1.6);
        c.strokeStyle = "rgba(255, 255, 255, 0.8)";
        c.lineWidth = 2.5;
        for (var r = 0; r < 3; r++) {
            c.beginPath();
            for (var x = -40; x <= 40; x += 2) {
                var y = -14 + r * 18 + Math.sin(x / 8 + r) * 4;
                if (x === -40) c.moveTo(x, y); else c.lineTo(x, y);
            }
            c.stroke();
        }
    };

    T.jord = function (c) {
        kugle(c, 0, 0, 40, "#7cc4ff", "#13457e");
        c.fillStyle = "#4f9a3c";
        c.beginPath();
        c.moveTo(-26, -20); c.bezierCurveTo(-10, -32, 6, -20, -2, -8);
        c.bezierCurveTo(-8, 2, -18, 0, -22, 10); c.bezierCurveTo(-34, 4, -36, -10, -26, -20);
        c.fill();
        c.beginPath();
        c.moveTo(8, 4); c.bezierCurveTo(22, -2, 34, 10, 26, 24);
        c.bezierCurveTo(20, 34, 8, 30, 10, 20); c.bezierCurveTo(2, 16, 2, 8, 8, 4);
        c.fill();
        c.fillStyle = "rgba(255, 255, 255, 0.7)";
        c.beginPath(); c.ellipse(10, -24, 14, 4, -0.2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(-14, 24, 12, 3, 0.2, 0, Math.PI * 2); c.fill();
        glans(c, 0, 0, 40);
        c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); kantlinje(c, 1.6);
    };

    T.verdenshav = function (c) {
        kugle(c, 0, 0, 40, "#7cc4ff", "#0f3f7a");
        c.fillStyle = "rgba(79, 154, 60, 0.85)";
        c.beginPath(); c.ellipse(-18, -12, 10, 8, 0.4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(16, 16, 8, 6, -0.3, 0, Math.PI * 2); c.fill();
        glans(c, 0, 0, 40);
        c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); kantlinje(c, 1.6);
    };

    function urskive(c, r) {
        c.beginPath(); c.arc(0, 6, r, 0, Math.PI * 2);
        c.fillStyle = lodret(c, 6 - r, 6 + r, "#ffffff", "#d7dce2");
        c.fill(); kantlinje(c, 2.4);
        c.strokeStyle = "#5d6670";
        c.lineWidth = 2;
        for (var i = 0; i < 12; i++) {
            var a = i / 12 * Math.PI * 2;
            c.beginPath();
            c.moveTo(Math.cos(a) * (r - 4), 6 + Math.sin(a) * (r - 4));
            c.lineTo(Math.cos(a) * (r - 9), 6 + Math.sin(a) * (r - 9));
            c.stroke();
        }
    }

    T.stopur = function (c) {
        rekt(c, -7, -46, 14, 10, 3);
        c.fillStyle = "#9aa3ad"; c.fill(); kantlinje(c, 1.4);
        urskive(c, 36);
        c.strokeStyle = "#d32f2f";
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, 6); c.lineTo(18, -16); c.stroke();
        kugle(c, 0, 6, 4, "#ff6b6b", "#a01818", false);
    };

    T.ur = function (c) {
        urskive(c, 38);
        c.strokeStyle = "#222831";
        c.lineCap = "round";
        c.lineWidth = 4;
        c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -18); c.stroke();
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, 6); c.lineTo(20, 14); c.stroke();
        c.lineCap = "butt";
    };

    T.doegn = function (c) {
        c.save();
        c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); c.clip();
        c.fillStyle = lodret(c, -40, 40, "#8fd0ff", "#3a8ad6");
        c.fillRect(-40, -40, 40, 80);
        c.fillStyle = lodret(c, -40, 40, "#2a2f6a", "#0d1030");
        c.fillRect(0, -40, 40, 80);
        c.restore();
        kugle(c, -18, -4, 11, "#fff6b0", "#f0a010", false);
        c.fillStyle = "#f4f1d0";
        c.beginPath(); c.arc(18, -4, 11, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#1a1e4a";
        c.beginPath(); c.arc(23, -8, 10, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); kantlinje(c, 1.8);
    };

    T.kalender = function (c) {
        skygge(c, 0, 44, 36, 5);
        rekt(c, -36, -34, 72, 76, 7);
        c.fillStyle = "#ffffff"; c.fill(); kantlinje(c, 1.6);
        rekt(c, -36, -34, 72, 22, 7);
        c.fillStyle = "#d32f2f"; c.fill();
        c.fillRect(-36, -20, 72, 8);
        NK.tekst(c, "365", 0, 18, { font: "800 30px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#222831" });
        c.fillStyle = "#5d6670";
        rekt(c, -22, -42, 6, 14, 3); c.fill();
        rekt(c, 16, -42, 6, 14, 3); c.fill();
    };

    T.vikingeskib = function (c) {
        c.strokeStyle = "#6b4a2b";
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, 14); c.lineTo(0, -40); c.stroke();
        var striber = ["#c62828", "#ffffff", "#c62828", "#ffffff", "#c62828"];
        for (var i = 0; i < 5; i++) {
            c.fillStyle = striber[i];
            c.fillRect(-24 + i * 9.6, -36, 9.6, 40);
        }
        c.strokeStyle = "rgba(0, 0, 0, 0.45)"; c.lineWidth = 1.4;
        c.strokeRect(-24, -36, 48, 40);
        c.beginPath();
        c.moveTo(-46, 6); c.quadraticCurveTo(-44, 30, -10, 32); c.lineTo(10, 32);
        c.quadraticCurveTo(44, 30, 46, 6); c.lineTo(40, 14); c.quadraticCurveTo(0, 22, -40, 14);
        c.closePath();
        c.fillStyle = lodret(c, 6, 32, "#a8743f", "#5c3a1c");
        c.fill(); kantlinje(c, 1.6);
        c.strokeStyle = "#5c3a1c";
        c.lineWidth = 4;
        c.beginPath(); c.moveTo(-44, 8); c.quadraticCurveTo(-52, -6, -42, -14); c.stroke();
        c.beginPath(); c.moveTo(44, 8); c.quadraticCurveTo(52, -6, 44, -12); c.stroke();
        c.fillStyle = "#e0b04a";
        for (i = 0; i < 5; i++) { c.beginPath(); c.arc(-24 + i * 12, 18, 4, 0, Math.PI * 2); c.fill(); }
    };

    T.pyramide = function (c) {
        skygge(c, 0, 38, 48, 5);
        c.beginPath(); c.moveTo(0, -40); c.lineTo(-48, 36); c.lineTo(8, 36); c.closePath();
        c.fillStyle = lodret(c, -40, 36, "#f2d48a", "#c99a46"); c.fill(); kantlinje(c, 1.4);
        c.beginPath(); c.moveTo(0, -40); c.lineTo(8, 36); c.lineTo(46, 30); c.closePath();
        c.fillStyle = lodret(c, -40, 36, "#c99a46", "#8a6428"); c.fill(); kantlinje(c, 1.4);
    };

    T.dino = function (c) {
        skygge(c, 0, 40, 40, 5);
        c.beginPath();
        c.moveTo(-46, 10);
        c.quadraticCurveTo(-30, 2, -18, 4);
        c.quadraticCurveTo(-4, -8, 14, 0);
        c.quadraticCurveTo(22, -30, 30, -40);
        c.quadraticCurveTo(40, -46, 44, -38);
        c.quadraticCurveTo(46, -32, 36, -32);
        c.quadraticCurveTo(30, -12, 28, 8);
        c.quadraticCurveTo(28, 22, 16, 24);
        c.lineTo(16, 38); c.lineTo(8, 38); c.lineTo(8, 26);
        c.lineTo(-10, 26); c.lineTo(-10, 38); c.lineTo(-18, 38); c.lineTo(-18, 22);
        c.quadraticCurveTo(-30, 18, -46, 10);
        c.closePath();
        c.fillStyle = lodret(c, -40, 38, "#8fcf6a", "#3f7a2c");
        c.fill(); kantlinje(c, 1.6);
        c.fillStyle = "#1e232a";
        c.beginPath(); c.arc(38, -37, 2, 0, Math.PI * 2); c.fill();
    };

    T.bigbang = function (c) {
        var farver = ["#fff59d", "#ffb74d", "#f06292", "#ba68c8", "#4fc3f7"];
        for (var i = 0; i < 16; i++) {
            var a = i / 16 * Math.PI * 2, r = i % 2 ? 30 : 46;
            c.strokeStyle = farver[i % 5];
            c.lineWidth = 3;
            c.beginPath(); c.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); c.stroke();
        }
        var g = c.createRadialGradient(0, 0, 0, 0, 0, 22);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "rgba(255, 200, 120, 0)");
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, 22, 0, Math.PI * 2); c.fill();
    };

    T.timeglas = function (c) {
        rekt(c, -30, -44, 60, 8, 3); c.fillStyle = "#8a6a3e"; c.fill(); kantlinje(c, 1.2);
        rekt(c, -30, 36, 60, 8, 3); c.fillStyle = "#8a6a3e"; c.fill(); kantlinje(c, 1.2);
        c.beginPath();
        c.moveTo(-24, -36); c.lineTo(24, -36); c.lineTo(4, 0); c.lineTo(24, 36); c.lineTo(-24, 36); c.lineTo(-4, 0);
        c.closePath();
        c.fillStyle = "rgba(220, 240, 255, 0.35)"; c.fill(); kantlinje(c, 1.4);
        c.fillStyle = "#e8b84a";
        c.beginPath(); c.moveTo(-14, -18); c.lineTo(14, -18); c.lineTo(3, 0); c.lineTo(-3, 0); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-20, 34); c.lineTo(20, 34); c.lineTo(0, 16); c.closePath(); c.fill();
        c.fillRect(-1, 0, 2, 18);
    };

    /* Aeggebakken: pap med fordybninger, aeggene sidder i hullerne, og
       laaget staar aabent bagved. Bredden er 100, hoejden ca. 56. */
    T.aeggebakke = function (c) {
        var xs = [], k;
        for (k = 0; k < 6; k++) xs.push(-38.5 + k * 15.4);
        /* Laaget bagved */
        c.beginPath();
        c.moveTo(-47, -14); c.lineTo(47, -14); c.lineTo(43, -30); c.lineTo(-43, -30);
        c.closePath();
        c.fillStyle = lodret(c, -30, -14, "#b9b09c", "#d8cfbb");
        c.fill(); kantlinje(c, 1.2);
        c.strokeStyle = "rgba(90, 80, 60, 0.25)";
        c.lineWidth = 1;
        for (k = 1; k < 6; k++) { c.beginPath(); c.moveTo(-43 + k * 14.3, -29); c.lineTo(-47 + k * 15.7, -15); c.stroke(); }
        /* Bakkens overside */
        c.beginPath();
        c.moveTo(-46, -18); c.lineTo(46, -18); c.lineTo(49, -3); c.lineTo(-49, -3);
        c.closePath();
        c.fillStyle = lodret(c, -18, -3, "#e6dfcf", "#d3cab6");
        c.fill(); kantlinje(c, 1.2);
        /* Hullerne og aeggene: bagerste raekke foerst */
        [{ y: -15, rx: 5.6, ry: 2.2, ey: -21.5, erx: 5.2, ery: 7, sk: 0.96 },
         { y: -7.5, rx: 6.4, ry: 2.6, ey: -13, erx: 5.9, ery: 7.8, sk: 1.05 }].forEach(function (r) {
            xs.forEach(function (x0, i) {
                var x = x0 * r.sk;
                c.beginPath(); c.ellipse(x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
                c.fillStyle = "#8f866f"; c.fill();
                /* Aegget kan kun ses over hullets midte og inde i hullet */
                c.save();
                c.beginPath();
                c.rect(x - 10, r.ey - 12, 20, r.y - (r.ey - 12));
                c.ellipse(x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
                c.clip();
                var v = (i % 3 - 1) * 0.06;
                c.beginPath(); c.ellipse(x, r.ey, r.erx, r.ery, v, 0, Math.PI * 2);
                var g = c.createRadialGradient(x - r.erx * 0.4, r.ey - r.ery * 0.45, 0.5, x, r.ey, r.ery * 1.1);
                g.addColorStop(0, "#fff4e4");
                g.addColorStop(0.55, "#efcfa6");
                g.addColorStop(1, "#bf8f5e");
                c.fillStyle = g;
                c.fill();
                c.lineWidth = 0.8; c.strokeStyle = "rgba(90, 55, 25, 0.45)"; c.stroke();
                c.restore();
                /* Hullets forkant over aeggets bund */
                c.beginPath(); c.ellipse(x, r.y, r.rx, r.ry, 0, 0.05 * Math.PI, 0.95 * Math.PI);
                c.lineWidth = 1.4; c.strokeStyle = "#f0e9da"; c.stroke();
            });
        });
        /* Forsiden med en bule under hver fordybning */
        c.beginPath();
        c.moveTo(-49, -3); c.lineTo(49, -3); c.lineTo(48, 12);
        for (k = 5; k >= 0; k--) {
            var bx = xs[k] * 1.05;
            c.quadraticCurveTo(bx + 7.7, 24, bx, 24);
            c.quadraticCurveTo(bx - 7.7, 24, bx - 7.7, 12);
        }
        c.lineTo(-49, 12);
        c.closePath();
        c.fillStyle = lodret(c, -3, 24, "#ddd5c3", "#a69c86");
        c.fill(); kantlinje(c, 1.2);
        c.strokeStyle = "rgba(255, 255, 255, 0.55)";
        c.lineWidth = 1;
        c.beginPath(); c.moveTo(-48, -1.5); c.lineTo(48, -1.5); c.stroke();
        c.strokeStyle = "rgba(90, 80, 60, 0.3)";
        for (k = 0; k < 5; k++) {
            var sx = (xs[k] + 7.7) * 1.05;
            c.beginPath(); c.moveTo(sx, 1); c.lineTo(sx, 14); c.stroke();
        }
    };

    /* En roed vingummibamse, gennemsigtig med glans */
    T.bamse = function (c) {
        function form() {
            c.beginPath();
            c.arc(-13, -30, 7, 0, Math.PI * 2);
            c.arc(13, -30, 7, 0, Math.PI * 2);
            c.moveTo(18, -22); c.arc(0, -22, 18, 0, Math.PI * 2);
            c.moveTo(-15, 2); c.ellipse(-21, 0, 8, 6, -0.5, 0, Math.PI * 2);
            c.moveTo(29, 0); c.ellipse(21, 0, 8, 6, 0.5, 0, Math.PI * 2);
            c.moveTo(20, 14); c.ellipse(0, 14, 20, 22, 0, 0, Math.PI * 2);
            c.moveTo(-5, 38); c.ellipse(-12, 37, 9, 7, 0, 0, Math.PI * 2);
            c.moveTo(19, 38); c.ellipse(12, 37, 9, 7, 0, 0, Math.PI * 2);
        }
        form();
        var g = c.createRadialGradient(-8, -14, 3, 0, 6, 48);
        g.addColorStop(0, "rgba(255, 150, 140, 0.95)");
        g.addColorStop(0.6, "rgba(225, 40, 50, 0.92)");
        g.addColorStop(1, "rgba(140, 10, 25, 0.95)");
        c.fillStyle = g;
        c.fill("nonzero");
        c.lineWidth = 1.6;
        c.strokeStyle = "rgba(90, 0, 10, 0.55)";
        form();
        c.stroke();
        c.fillStyle = "rgba(255, 255, 255, 0.6)";
        c.beginPath(); c.ellipse(-7, -28, 4, 6, -0.4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(-8, 6, 3, 8, -0.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(90, 0, 10, 0.55)";
        c.beginPath(); c.arc(-6, -24, 2, 0, Math.PI * 2); c.arc(6, -24, 2, 0, Math.PI * 2); c.fill();
    };

    T.sandkasse = function (c) {
        skygge(c, 0, 34, 48, 6);
        /* Sandet med en lille bunke */
        c.beginPath();
        c.moveTo(-42, 0); c.quadraticCurveTo(-10, -20, 6, -6); c.quadraticCurveTo(24, -14, 42, 0);
        c.lineTo(42, 10); c.lineTo(-42, 10);
        c.closePath();
        c.fillStyle = lodret(c, -16, 10, "#f6dfa4", "#d6b46a");
        c.fill();
        /* Kassen af braedder */
        c.beginPath();
        c.moveTo(-46, 0); c.lineTo(46, 0); c.lineTo(46, 30); c.lineTo(-46, 30);
        c.closePath();
        c.fillStyle = lodret(c, 0, 30, "#c98a4e", "#8a5528");
        c.fill(); kantlinje(c, 1.6);
        c.strokeStyle = "rgba(70, 35, 10, 0.5)";
        c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(-46, 15); c.lineTo(46, 15); c.stroke();
        /* Skovlen */
        c.save();
        c.translate(26, -10);
        c.rotate(0.5);
        c.fillStyle = "#e53935";
        rekt(c, -2, -24, 4, 20, 2); c.fill();
        c.beginPath(); c.moveTo(-7, -4); c.lineTo(7, -4); c.lineTo(5, 8); c.lineTo(-5, 8); c.closePath();
        c.fill(); kantlinje(c, 1.2);
        c.restore();
    };

    T.dannebrog = function (c) {
        c.strokeStyle = "#8a939d";
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(-40, 44); c.lineTo(-40, -42); c.stroke();
        c.save();
        c.beginPath();
        c.moveTo(-38, -38);
        c.bezierCurveTo(-10, -46, 14, -30, 44, -38);
        c.lineTo(44, 4);
        c.bezierCurveTo(14, 12, -10, -4, -38, 4);
        c.closePath();
        c.fillStyle = "#c8102e";
        c.fill();
        c.clip();
        c.fillStyle = "#ffffff";
        c.fillRect(-26, -50, 9, 70);
        c.fillRect(-40, -22, 90, 9);
        var g = c.createLinearGradient(-38, 0, 44, 0);
        g.addColorStop(0, "rgba(0, 0, 0, 0)");
        g.addColorStop(0.5, "rgba(255, 255, 255, 0.18)");
        g.addColorStop(1, "rgba(0, 0, 0, 0.2)");
        c.fillStyle = g;
        c.fillRect(-40, -50, 90, 70);
        c.restore();
        c.beginPath();
        c.moveTo(-38, -38);
        c.bezierCurveTo(-10, -46, 14, -30, 44, -38);
        c.lineTo(44, 4);
        c.bezierCurveTo(14, 12, -10, -4, -38, 4);
        c.closePath();
        kantlinje(c, 1.2);
    };

    T.muldvarp = function (c) {
        skygge(c, 0, 38, 36, 6);
        /* poterne */
        c.fillStyle = "#f2a8b4";
        c.beginPath(); c.ellipse(-30, 22, 11, 8, -0.5, 0, Math.PI * 2); c.fill(); kantlinje(c, 1.2);
        c.beginPath(); c.ellipse(30, 22, 11, 8, 0.5, 0, Math.PI * 2); c.fill(); kantlinje(c, 1.2);
        /* kroppen */
        c.beginPath(); c.ellipse(0, 4, 34, 32, 0, 0, Math.PI * 2);
        var g = c.createRadialGradient(-10, -14, 4, 0, 4, 38);
        g.addColorStop(0, "#7b6a5c");
        g.addColorStop(1, "#2f2621");
        c.fillStyle = g;
        c.fill(); kantlinje(c, 1.6);
        /* oejnene og snuden */
        c.fillStyle = "#0d0d0f";
        c.beginPath(); c.arc(-11, -6, 3, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(11, -6, 3, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#ffffff";
        c.beginPath(); c.arc(-10, -7, 1, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(12, -7, 1, 0, Math.PI * 2); c.fill();
        kugle(c, 0, 6, 9, "#ffd0d8", "#d9707e");
        c.strokeStyle = "rgba(230, 220, 210, 0.6)";
        c.lineWidth = 1;
        [-1, 1].forEach(function (s) {
            for (var i = -1; i <= 1; i++) {
                c.beginPath(); c.moveTo(s * 9, 7 + i * 3); c.lineTo(s * 24, 4 + i * 6); c.stroke();
            }
        });
    };

    T.aeg = function (c) {
        c.beginPath();
        c.ellipse(0, 4, 26, 34, 0, 0, Math.PI * 2);
        var g = c.createRadialGradient(-8, -10, 4, 0, 4, 36);
        g.addColorStop(0, "#fffaf0");
        g.addColorStop(1, "#d9b98a");
        c.fillStyle = g;
        c.fill(); kantlinje(c, 1.6);
    };

    T.saek = function (c) {
        skygge(c, 0, 44, 40, 6);
        c.beginPath();
        c.moveTo(-14, -34);
        c.quadraticCurveTo(-42, -10, -40, 18);
        c.quadraticCurveTo(-38, 42, 0, 42);
        c.quadraticCurveTo(38, 42, 40, 18);
        c.quadraticCurveTo(42, -10, 14, -34);
        c.closePath();
        c.fillStyle = lodret(c, -34, 42, "#e2c98f", "#9c7a3e");
        c.fill(); kantlinje(c, 1.8);
        c.strokeStyle = "#7a5a28";
        c.lineWidth = 4;
        c.beginPath(); c.moveTo(-16, -34); c.lineTo(16, -34); c.stroke();
        c.beginPath();
        c.moveTo(-10, -36); c.quadraticCurveTo(-18, -48, -6, -46);
        c.moveTo(10, -36); c.quadraticCurveTo(18, -48, 6, -46);
        c.lineWidth = 2.5; c.stroke();
    };

    T.mennesker = function (c) {
        function figur(x, y, s, farve) {
            c.save(); c.translate(x, y); c.scale(s, s);
            kugle(c, 0, -22, 9, "#ffd9b8", "#c48c62");
            rekt(c, -11, -12, 22, 30, 9);
            c.fillStyle = farve; c.fill(); kantlinje(c, 1.4);
            c.restore();
        }
        figur(-24, 10, 0.9, "#e57373");
        figur(24, 10, 0.9, "#81c784");
        figur(0, 4, 1.1, "#64b5f6");
    };

    /* ----- Tegn et ikon ------------------------------------------------------ */
    NK.Ikon = {
        findes: function (navn) { return !!T[navn]; },
        navne: function () { return Object.keys(T); },
        tegn: function (ctx, navn, x, y, s) {
            var f = T[navn];
            if (!f || s < 2) return;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(s / 100, s / 100);
            ctx.lineJoin = "round";
            f(ctx);
            ctx.restore();
        }
    };
}());
