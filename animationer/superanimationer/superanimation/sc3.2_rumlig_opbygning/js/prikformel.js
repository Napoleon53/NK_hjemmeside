/* =====================================================================
   prikformel.js - elektronprikformlen i hjoernet af fane 2 og 3

   Samme tegnemaade som sc3.1: grundstofsymbolet med de frie
   elektronpar paa de sider, der ikke har en binding, og bindingernes
   elektronpar som prikker mellem symbolerne, uden streg.

   Placeringen i planen staar i data.js (atom.prik). Et atom med frie
   elektronpar skal have sine bindinger vandret eller lodret, saa parrene
   kan sidde paa de fire sider.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var FONT = 26;
    var PRIK_R = 2.9;
    var PAR = 4.3;           /* halv afstand mellem de to prikker i et par */
    var KOLONNE = 9;         /* afstand mellem prikparrene i en dobbelt- eller tripelbinding */
    var AFSTAND = 7;         /* fra symbolets kant ud til et frit par */
    var ENHED = 58;          /* pixels pr. enhed i atom.prik */
    var SIDER = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    function halvdel(symbol, k) {
        return { b: FONT * k * (symbol.length > 1 ? 0.55 : 0.38), h: FONT * k * 0.37 };
    }

    function kombinationer(liste, k) {
        var ud = [];
        (function byg(start, valgt) {
            if (valgt.length === k) { ud.push(valgt.slice()); return; }
            for (var i = start; i < liste.length; i++) {
                valgt.push(liste[i]);
                byg(i + 1, valgt);
                valgt.pop();
            }
        }(0, []));
        return ud;
    }

    /* Vaelg de sider, de frie par skal sidde paa: saa jaevnt fordelt om
       atomet som muligt, og helst to par over for hinanden. */
    NK.prikSider = function (bindingsretninger, antalPar) {
        var frie = [0, 1, 2, 3].filter(function (i) {
            return !bindingsretninger.some(function (b) { return SIDER[i][0] * b[0] + SIDER[i][1] * b[1] > 0.7; });
        });
        var k = Math.min(antalPar, frie.length);
        var bedst = null;
        kombinationer(frie, k).forEach(function (valg) {
            var sx = 0, sy = 0, modsat = 0;
            bindingsretninger.forEach(function (b) { sx += b[0]; sy += b[1]; });
            valg.forEach(function (i, n) {
                sx += SIDER[i][0];
                sy += SIDER[i][1];
                for (var m = n + 1; m < valg.length; m++) if ((valg[m] - i + 4) % 4 === 2) modsat++;
            });
            var score = Math.hypot(sx, sy) * 10 - modsat;
            if (!bedst || score < bedst.score - 1e-9) bedst = { score: score, valg: valg };
        });
        return bedst ? bedst.valg : [];
    };

    NK.Prikformel = {
        tegn: function (ctx, b, h, mol) {
            ctx.clearRect(0, 0, b, h);
            var pos = mol.atomer.map(function (a) { return a.prik; });
            var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            pos.forEach(function (p) {
                minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
                minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
            });
            var kant = 34;
            var enhed = ENHED;
            if (maxX > minX) enhed = Math.min(enhed, (b - 2 * kant) / (maxX - minX));
            if (maxY > minY) enhed = Math.min(enhed, (h - 2 * kant) / (maxY - minY));
            var k = enhed / ENHED;
            var cx = b / 2 - (minX + maxX) / 2 * enhed;
            var cy = h / 2 - (minY + maxY) / 2 * enhed;
            var P = pos.map(function (p) { return { x: cx + p[0] * enhed, y: cy + p[1] * enhed }; });
            var r = Math.max(2, PRIK_R * k);

            function prik(x, y) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = "#f2c53d";
            mol.bindinger.forEach(function (bd) {
                var A = P[bd[0]], B = P[bd[1]];
                var dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy) || 1;
                var ux = dx / l, uy = dy / l;
                var mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
                var kolonner = bd[2] === 1 ? [0] : bd[2] === 2 ? [-KOLONNE / 2, KOLONNE / 2] : [-KOLONNE, 0, KOLONNE];
                kolonner.forEach(function (lk) {
                    var x = mx + ux * lk * k, y = my + uy * lk * k;
                    prik(x - uy * PAR * k, y + ux * PAR * k);
                    prik(x + uy * PAR * k, y - ux * PAR * k);
                });
            });

            mol.atomer.forEach(function (a, i) {
                var retninger = [];
                mol.bindinger.forEach(function (bd) {
                    var anden = bd[0] === i ? bd[1] : bd[1] === i ? bd[0] : -1;
                    if (anden < 0) return;
                    var dx = P[anden].x - P[i].x, dy = P[anden].y - P[i].y, l = Math.hypot(dx, dy) || 1;
                    retninger.push([dx / l, dy / l]);
                });
                var hv = halvdel(a.el, k);
                ctx.fillStyle = "#f2c53d";
                NK.prikSider(retninger, mol.frieAntal[i]).forEach(function (si) {
                    var s = SIDER[si];
                    var x = P[i].x + s[0] * (hv.b + AFSTAND * k);
                    var y = P[i].y + s[1] * (hv.h + AFSTAND * k);
                    prik(x - s[1] * PAR * k, y + s[0] * PAR * k);
                    prik(x + s[1] * PAR * k, y - s[0] * PAR * k);
                });
                ctx.font = "700 " + Math.round(FONT * k) + "px 'Segoe UI', sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#f2f3f5";
                ctx.fillText(a.el, P[i].x, P[i].y + 1);
            });
        }
    };
}());
