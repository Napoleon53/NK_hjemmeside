/* Ionregn: alt, der tegnes på de to lærreder (regnen bagved og banerne foran). */
var Tegning = (function () {
    "use strict";

    var FONT = "Consolas, 'Cascadia Mono', Menlo, 'DejaVu Sans Mono', 'Courier New', monospace";
    var FARVE = {
        groen: "#00ff66", dim: "rgba(0, 255, 102, 0.16)", tekst: "#d9ffe6",
        kation: "#5fd7ff", kationBund: "rgba(8, 36, 52, 0.94)",
        anion: "#ff8a70", anionBund: "rgba(56, 14, 10, 0.94)", fejl: "#ff4d4d"
    };
    var TEGN = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789+=NaClMgCaKOHSFeAlLiBrIPN";

    var regn, rc, rW = 0, rH = 0, rStr = 16, kolonner = [], sidsteSkridt = null, regnUr = 0;
    var spil, sc, W = 0, H = 0, dpr = 1;
    var L = {};                 /* layoutet: baner, fangelinje og ionstørrelse */
    var effekter = [], baneBlink = [0, 0, 0, 0];
    var visTaster = true;

    function init(regnCanvas, spilCanvas) {
        regn = regnCanvas; rc = regn.getContext("2d");
        spil = spilCanvas; sc = spil.getContext("2d");
        tilpas();
    }

    function tilpas() {
        rW = window.innerWidth; rH = window.innerHeight;
        regn.width = rW; regn.height = rH;
        rStr = Math.max(14, Math.min(22, Math.round(rW / 70)));
        var n = Math.ceil(rW / rStr);
        kolonner = [];
        for (var i = 0; i < n; i++) kolonner.push({ y: -Math.floor(Math.random() * rH / rStr), fart: Math.random() < 0.7 ? 1 : 2 });
        rc.fillStyle = "#000"; rc.fillRect(0, 0, rW, rH);

        var r = spil.parentNode.getBoundingClientRect();
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = Math.max(200, r.width); H = Math.max(200, r.height);
        spil.width = Math.round(W * dpr); spil.height = Math.round(H * dpr);
        spil.style.width = W + "px"; spil.style.height = H + "px";

        var bredde = Math.min(W - 24, 860, Math.max(300, H * 1.1));
        L.x0 = (W - bredde) / 2; L.bredde = bredde; L.bane = bredde / 4;
        L.chipH = Math.max(28, Math.min(L.bane * 0.44, 66, H * 0.1));
        L.chipW = L.bane * 0.86;
        L.fs = L.chipH * 0.5;
        L.fangY = H - Math.max(L.chipH * 1.05 + 14, 50);
        L.top = -L.chipH * 0.6;
    }

    /* ---- Regnen bag det hele ------------------------------------------ */
    function regnSkridt(styrke) {
        rc.fillStyle = "rgba(0, 0, 0, 0.11)";
        rc.fillRect(0, 0, rW, rH);
        rc.font = rStr + "px " + FONT;
        rc.textBaseline = "top";
        for (var i = 0; i < kolonner.length; i++) {
            var k = kolonner[i];
            if (k.y >= 0) {
                var ch = TEGN.charAt(Math.floor(Math.random() * TEGN.length));
                rc.globalAlpha = styrke;
                rc.fillStyle = "#b8ffd0";
                rc.fillText(ch, i * rStr, k.y * rStr);
                rc.globalAlpha = styrke * 0.55;
                rc.fillStyle = "#00c853";
                if (k.y > 0) rc.fillText(TEGN.charAt(Math.floor(Math.random() * TEGN.length)), i * rStr, (k.y - 1) * rStr);
            }
            k.y += k.fart;
            if (k.y * rStr > rH && Math.random() > 0.96) k.y = -Math.floor(Math.random() * 12);
        }
        rc.globalAlpha = 1;
    }
    /* takt: regnen går et skridt pr. sekstendedel; uden takt ca. 12 skridt pr. sekund */
    function tegnRegn(dt, slag, styrke) {
        if (slag !== null && slag !== undefined && isFinite(slag)) {
            var s = Math.floor(slag * 4);
            if (sidsteSkridt === null || s < sidsteSkridt || s - sidsteSkridt > 8) sidsteSkridt = s - 1;
            while (sidsteSkridt < s) { regnSkridt(styrke); sidsteSkridt++; }
        } else {
            sidsteSkridt = null;
            regnUr += dt;
            while (regnUr > 1 / 12) { regnSkridt(styrke); regnUr -= 1 / 12; }
        }
    }

    /* ---- Formler med sænket og hævet skrift ---------------------------- */
    function maalDele(dele, fs) {
        var b = 0;
        dele.forEach(function (d) {
            sc.font = "bold " + (d.sub || d.sup ? fs * 0.66 : fs) + "px " + FONT;
            b += sc.measureText(d.t).width;
        });
        return b;
    }
    function tegnDele(dele, x, y, fs, farve) {
        var b = maalDele(dele, fs), cx = x - b / 2;
        sc.fillStyle = farve;
        sc.textBaseline = "middle";
        sc.textAlign = "left";
        dele.forEach(function (d) {
            var lille = d.sub || d.sup;
            sc.font = "bold " + (lille ? fs * 0.66 : fs) + "px " + FONT;
            var dy = d.sub ? fs * 0.3 : d.sup ? -fs * 0.36 : 0;
            sc.fillText(d.t, cx, y + dy);
            cx += sc.measureText(d.t).width;
        });
    }

    function sti(x, y, w, h, r) {
        sc.beginPath();
        sc.moveTo(x + r, y);
        sc.lineTo(x + w - r, y); sc.arcTo(x + w, y, x + w, y + r, r);
        sc.lineTo(x + w, y + h - r); sc.arcTo(x + w, y + h, x + w - r, y + h, r);
        sc.lineTo(x + r, y + h); sc.arcTo(x, y + h, x, y + h - r, r);
        sc.lineTo(x, y + r); sc.arcTo(x, y, x + r, y, r);
        sc.closePath();
    }

    /* Kation: kantet kasse med dobbelt, fuld kant. Anion: rund kapsel med stiplet kant. */
    function tegnIon(id, x, y, alfa, skala, rodKant) {
        var I = Kemi.IONER[id], kat = I.q > 0;
        var w = L.chipW * skala, h = L.chipH * skala;
        sc.save();
        sc.globalAlpha = alfa;
        var farve = rodKant ? FARVE.fejl : kat ? FARVE.kation : FARVE.anion;
        if (kat) {
            sti(x - w / 2, y - h / 2, w, h, 3);
            sc.fillStyle = FARVE.kationBund; sc.fill();
            sc.lineWidth = 2.5; sc.strokeStyle = farve; sc.stroke();
            sti(x - w / 2 + 4, y - h / 2 + 4, w - 8, h - 8, 2);
            sc.lineWidth = 1; sc.stroke();
        } else {
            sti(x - w / 2, y - h / 2, w, h, h / 2);
            sc.fillStyle = FARVE.anionBund; sc.fill();
            sc.lineWidth = 2.5; sc.strokeStyle = farve;
            sc.setLineDash([Math.max(5, h * 0.16), Math.max(4, h * 0.11)]);
            sc.stroke();
            sc.setLineDash([]);
        }
        var dele = Kemi.ionDele(id), fs = L.fs * skala;
        var maks = w - (kat ? 14 : h * 0.55);
        var b = maalDele(dele, fs);
        if (b > maks) fs *= maks / b;
        tegnDele(dele, x, y + fs * 0.04, fs, FARVE.tekst);
        sc.restore();
    }

    /* ---- Effekter ------------------------------------------------------ */
    function effekt(e) { effekter.push(e); }
    function blink(bane, t) { baneBlink[bane] = t; }
    function baneMidte(b) { return L.x0 + L.bane * (b + 0.5); }

    /* ---- Hele spilbilledet --------------------------------------------- */
    /* s: Spil, sek og slag: den hørbare tid; info: { banner, nedtaelling } */
    function tegnSpil(s, sek, slag, info) {
        sc.setTransform(dpr, 0, 0, dpr, 0, 0);
        sc.clearRect(0, 0, W, H);
        var fald = s ? s.cfg.FALD_SLAG : 8;

        /* banerne */
        sc.fillStyle = "rgba(0, 0, 0, 0.62)";
        sc.fillRect(L.x0, 0, L.bredde, H);
        for (var b = 0; b <= 4; b++) {
            sc.fillStyle = b === 0 || b === 4 ? "rgba(0, 255, 102, 0.28)" : "rgba(0, 255, 102, 0.12)";
            sc.fillRect(Math.round(L.x0 + b * L.bane) - 0.5, 0, 1, H);
        }
        /* tryk på en bane */
        for (b = 0; b < 4; b++) {
            var alder = sek - baneBlink[b];
            if (alder >= 0 && alder < 0.2) {
                var g = sc.createLinearGradient(0, L.fangY - L.chipH * 4, 0, L.fangY + L.chipH);
                g.addColorStop(0, "rgba(0,255,102,0)");
                g.addColorStop(1, "rgba(0,255,102," + (0.22 * (1 - alder / 0.2)) + ")");
                sc.fillStyle = g;
                sc.fillRect(L.x0 + b * L.bane + 1, L.fangY - L.chipH * 4, L.bane - 2, L.chipH * 5);
            }
        }

        /* stor tekst bag ionerne: nedtælling og nyt niveau */
        if (info && info.stor) {
            sc.save();
            sc.textAlign = "center"; sc.textBaseline = "middle";
            sc.globalAlpha = info.storAlfa === undefined ? 0.85 : info.storAlfa;
            sc.fillStyle = FARVE.groen;
            var fsS = Math.min(L.bredde * 0.24, H * 0.2);
            sc.font = "bold " + fsS + "px " + FONT;
            sc.fillText(info.stor, W / 2, H * 0.36);
            if (info.lille) {
                sc.fillStyle = "#b8ffd0";
                var fsL = Math.max(16, Math.min(L.bredde * 0.06, 30));
                sc.font = fsL + "px " + FONT;
                var linjer = info.lille.split("\n");
                for (var li = 0; li < linjer.length; li++) sc.fillText(linjer[li], W / 2, H * 0.36 + fsS * 0.62 + li * fsL * 1.35);
            }
            sc.restore();
        }

        /* fangelinjen pulserer på hvert slag, mest på 1-slaget */
        var frac = slag - Math.floor(slag), nr = ((Math.floor(slag) % 4) + 4) % 4;
        var puls = s && isFinite(slag) ? Math.exp(-frac * 7) * (nr === 0 ? 1 : 0.5) : 0;
        sc.fillStyle = "rgba(0, 255, 102, " + (0.1 + 0.25 * puls) + ")";
        sc.fillRect(L.x0, L.fangY - 3 - 10 * puls, L.bredde, 6 + 20 * puls);
        sc.fillStyle = "rgba(0, 255, 102, " + (0.55 + 0.45 * puls) + ")";
        var lw = 2 + 3 * puls;
        sc.fillRect(L.x0, L.fangY - lw / 2, L.bredde, lw);
        /* målfelterne på linjen */
        sc.strokeStyle = "rgba(0, 255, 102, " + (0.22 + 0.3 * puls) + ")";
        sc.lineWidth = 1;
        for (b = 0; b < 4; b++) {
            sti(baneMidte(b) - L.chipW / 2 - 3, L.fangY - L.chipH / 2 - 3, L.chipW + 6, L.chipH + 6, 6);
            sc.stroke();
        }

        /* ionerne */
        if (s) {
            for (var i = 0; i < s.ioner.length; i++) {
                var ion = s.ioner[i], x = baneMidte(ion.bane);
                var p = 1 - (ion.slag - slag) / fald;
                var y = L.top + p * (L.fangY - L.top);
                if (ion.tilstand === "falder") {
                    if (y > -L.chipH) tegnIon(ion.id, x, y, 1, 1, false);
                } else if (ion.tilstand === "passeret") {
                    var efter = slag - ion.slag;
                    var a = Math.max(0, 0.75 - efter * 0.9);
                    if (a > 0) tegnIon(ion.id, x, y, a, 1, !!ion.brugMiss);
                } else if (ion.tilstand === "fanget") {
                    var t = (sek - (ion.tVis || sek)) / 0.22;
                    if (ion.tVis === undefined) ion.tVis = sek;
                    if (t < 1) tegnIon(ion.id, x, L.fangY + t * L.chipH * 0.8, 1 - t, 1 + 0.25 * t, false);
                }
            }
        }

        /* fangst-ringe og ord */
        effekter = effekter.filter(function (e) { return sek - e.t < e.varighed && sek >= e.t - 0.05; });
        effekter.forEach(function (e) {
            var u = (sek - e.t) / e.varighed, x = baneMidte(e.bane);
            sc.save();
            if (e.type === "ring") {
                sc.globalAlpha = 1 - u;
                sc.strokeStyle = e.farve; sc.lineWidth = 3;
                sti(x - L.chipW / 2 - 8 * u - 3, L.fangY - L.chipH / 2 - 8 * u - 3, L.chipW + 16 * u + 6, L.chipH + 16 * u + 6, 8);
                sc.stroke();
            } else {
                sc.globalAlpha = Math.min(1, 2.2 * (1 - u));
                sc.fillStyle = e.farve;
                sc.textAlign = "center"; sc.textBaseline = "middle";
                var fs = Math.max(14, Math.min(L.bane * 0.17, 26));
                sc.font = "bold " + fs + "px " + FONT;
                sc.fillText(e.tekst, x, L.fangY - L.chipH * 0.95 - u * 22);
            }
            sc.restore();
        });

        /* tasterne under banerne */
        if (visTaster && s) {
            sc.fillStyle = "rgba(0, 255, 102, 0.45)";
            sc.textAlign = "center"; sc.textBaseline = "middle";
            sc.font = "bold " + Math.max(14, Math.min(20, L.bane * 0.14)) + "px " + FONT;
            var taster = s.cfg.TASTER;
            for (b = 0; b < 4; b++) sc.fillText(taster[b].toUpperCase(), baneMidte(b), Math.min(H - 10, L.fangY + L.chipH * 0.5 + 18));
        }
    }

    /* Hvilken bane ligger x (CSS-pixel i lærredet) i? Lidt uden for banerne tæller med. */
    function baneVed(x) {
        var b = Math.floor((x - L.x0) / L.bane);
        if (x < L.x0 - L.bane * 0.6 || x > L.x0 + L.bredde + L.bane * 0.6) return -1;
        return Math.max(0, Math.min(3, b));
    }

    function nulstil() { effekter = []; baneBlink = [-9, -9, -9, -9]; }

    return {
        init: init, tilpas: tilpas, tegnRegn: tegnRegn, tegnSpil: tegnSpil, baneVed: baneVed,
        effekt: effekt, blink: blink, nulstil: nulstil, layout: function () { return L; },
        saetTaster: function (v) { visTaster = v; }, FARVE: FARVE
    };
})();
