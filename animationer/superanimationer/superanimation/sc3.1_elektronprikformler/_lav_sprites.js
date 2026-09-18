/* =====================================================================
   _lav_sprites.js - udviklerværktøj, indgår ikke i animationen

   Tegner sprites/molekyle_*.svg (vises i sejrsboksen) med de samme
   regler for elektronernes placering, som spillet selv bruger i
   js/tegning.js. Ret reglerne dér, og koer scriptet igen:

       node _lav_sprites.js
   ===================================================================== */
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var mappe = __dirname;
var kontekst = {};
kontekst.window = kontekst;
vm.createContext(kontekst);
["js/kerne.js", "js/data.js", "js/tegning.js"].forEach(function (fil) {
    vm.runInContext(fs.readFileSync(path.join(mappe, fil), "utf8"), kontekst, { filename: fil });
});
var NK = kontekst.NK;

/* Facit: [atomindeks, atomindeks, bindingsorden], indekseret som OPGAVER[].atomer */
var FACIT = {
    "molekyle_h2o.svg":  [[1, 0, 1], [1, 2, 1]],
    "molekyle_nh3.svg":  [[1, 0, 1], [1, 2, 1], [1, 3, 1]],
    "molekyle_br2.svg":  [[0, 1, 1]],
    "molekyle_co2.svg":  [[0, 1, 2], [1, 2, 2]],
    "molekyle_ch4.svg":  [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
    "molekyle_hcn.svg":  [[0, 1, 1], [1, 2, 3]],
    "molekyle_n2.svg":   [[0, 1, 3]],
    "molekyle_ch2o.svg": [[1, 0, 2], [1, 2, 1], [1, 3, 1]],
    "molekyle_c2h2.svg": [[0, 1, 1], [1, 2, 3], [2, 3, 1]]
};

var L = NK.BINDINGSLAENGDE;
var R = NK.PRIK_R;
var f = function (v) { return v.toFixed(1); };

NK.OPGAVER.forEach(function (opg, idx) {
    var bindinger = FACIT[opg.sprite];
    if (!bindinger) throw new Error("Intet facit for " + opg.sprite);
    var geo = NK.OPGAVE_GEOMETRI[idx];
    var n = opg.atomer.length;

    var pos = [];
    if (geo.type === "kaede") {
        for (var i = 0; i < n; i++) pos[i] = { x: (i - (n - 1) / 2) * L, y: 0 };
    } else {
        pos[geo.hub] = { x: 0, y: 0 };
        Object.keys(geo.vinkler).forEach(function (k) {
            var rad = geo.vinkler[k] * Math.PI / 180;
            pos[+k] = { x: Math.cos(rad) * L, y: Math.sin(rad) * L };
        });
    }

    var prikker = [];
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    function udvid(x, y, rx, ry) {
        minX = Math.min(minX, x - rx); maxX = Math.max(maxX, x + rx);
        minY = Math.min(minY, y - ry); maxY = Math.max(maxY, y + ry);
    }

    bindinger.forEach(function (b) {
        var p1 = pos[b[0]], p2 = pos[b[1]];
        var dx = p2.x - p1.x, dy = p2.y - p1.y;
        var len = Math.hypot(dx, dy);
        var ux = dx / len, uy = dy / len;
        var mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        NK.bindingsprikker(b[2]).forEach(function (p) {
            prikker.push({ x: mx + ux * p.l - uy * p.p, y: my + uy * p.l + ux * p.p });
        });
    });

    var symboler = opg.atomer.map(function (z, i) {
        var symbol = NK.ELEMENTER[z].s;
        var vinkler = [], sum = 0;
        bindinger.forEach(function (b) {
            if (b[0] === i) { vinkler.push(Math.atan2(pos[b[1]].y - pos[i].y, pos[b[1]].x - pos[i].x)); sum += b[2]; }
            if (b[1] === i) { vinkler.push(Math.atan2(pos[b[0]].y - pos[i].y, pos[b[0]].x - pos[i].x)); sum += b[2]; }
        });
        NK.prikkerOmAtom(symbol, NK.elektronDomaener(z, vinkler, sum)).forEach(function (p) {
            prikker.push({ x: pos[i].x + p.x, y: pos[i].y + p.y });
        });
        var halv = NK.symbolHalvdel(symbol);
        udvid(pos[i].x, pos[i].y, halv.b, halv.h);
        return '<text x="' + f(pos[i].x) + '" y="' + f(pos[i].y) + '">' + symbol + "</text>";
    });

    prikker.forEach(function (p) { udvid(p.x, p.y, R, R); });
    var pad = 6;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;

    var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [minX, minY, maxX - minX, maxY - minY].map(f).join(" ") + '">\n' +
        '  <g font-family="\'Segoe UI\', Arial, sans-serif" font-weight="700" font-size="' + NK.SYMBOL_FONT + '" fill="#f2f3f5" text-anchor="middle" dominant-baseline="central">\n    ' +
        symboler.join("\n    ") + "\n  </g>\n" +
        '  <g fill="#f2c53d">\n    ' +
        prikker.map(function (p) { return '<circle cx="' + f(p.x) + '" cy="' + f(p.y) + '" r="' + R + '"/>'; }).join("\n    ") +
        "\n  </g>\n</svg>\n";

    fs.writeFileSync(path.join(mappe, "sprites", opg.sprite), svg, "utf8");
    console.log("Skrev", opg.sprite);
});
