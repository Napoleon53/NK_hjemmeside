/* =====================================================================
   sim_kemi.js - den rigtige vare:  N2O4(g)  ⇌  2 NO2(g)

   Samme regnestykke som paa broen, bare med molekyler:

       v(frem)    = k_frem    * [N2O4]
       v(tilbage) = k_tilbage * [NO2]^2

   Kvadratet kommer af, at TO NO2-molekyler skal finde hinanden, for at
   der kan dannes et N2O4. Saettes hastighederne lig hinanden:

       [NO2]^2 / [N2O4] = k_frem / k_tilbage = K

   Temperatur: reaktionen frem er endoterm (dH = +57 kJ/mol), saa
   k_frem vokser mest, naar der varmes op. K stiger, og gassen bliver
   brunere - praecis som i det rigtige demonstrationsforsog med de to
   kolber i isbad og varmt vand.

   Volumen: K aendrer sig IKKE, men koncentrationerne gor. Derfor
   forskydes ligevaegten mod faerre molekyler (mod N2O4), naar
   gassen presses sammen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var R_GAS = 8.314;
    var T0 = 298;
    var EA_FREM = 70000;      // J/mol
    var EA_TILBAGE = 13000;   // J/mol  -> dH = EA_FREM - EA_TILBAGE = 57 kJ/mol
    var KF0 = 0.5;
    var KB0 = 0.35;
    var SKALA = 100;          // partikler pr. koncentrationsenhed ved V = 1
    var MAKS_PARTIKLER = 420;
    var HASTIGHED_CAP = 4;    // holder animationen se-bar ved hoej temperatur

    NK.SimKemi = function () {
        this.l = new NK.Laerred(NK.el("kem-laerred"));

        this.graf = new NK.Graf(NK.el("kem-graf"), [
            { navn: "[N₂O₄]", farve: "#3d9ee0", gruppe: "antal" },
            { navn: "[NO₂]", farve: "#e6892a", gruppe: "antal" },
            { navn: "v frem", farve: "#3d9ee0", gruppe: "fart" },
            { navn: "v tilbage", farve: "#e6892a", gruppe: "fart" }
        ], {
            enheder: { antal: "koncentration", fart: "koncentration pr. s" },
            minTop: { antal: 1, fart: 0.5 }
        });

        this.temperatur = 298;
        this.volumen = 1.0;
        this.tid = 0;
        this.grafUr = 0;
        this.partikler = [];
        this.glimt = [];
        this.rest = { frem: 0, tilbage: 0 };
        this.vVist = { frem: 0, tilbage: 0 };

        this.nulstil();
        this.koblKnapper();
    };

    NK.SimKemi.prototype.nyPartikel = function (type, x, y) {
        var v = Math.random() * Math.PI * 2;
        return {
            type: type,                       // 0 = N2O4, 1 = NO2
            x: x === undefined ? 0.05 + Math.random() * 0.9 : NK.klamp(x, 0.04, 0.96),
            y: y === undefined ? 0.05 + Math.random() * 0.9 : NK.klamp(y, 0.04, 0.96),
            ux: Math.cos(v),
            uy: Math.sin(v),
            vinkel: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 1.6
        };
    };

    NK.SimKemi.prototype.nulstil = function () {
        this.partikler.length = 0;
        this.glimt.length = 0;
        for (var i = 0; i < 120; i++) this.partikler.push(this.nyPartikel(0));
        this.rest.frem = 0;
        this.rest.tilbage = 0;
        this.vVist.frem = 0;
        this.vVist.tilbage = 0;
        this.graf.nulstil();
    };

    NK.SimKemi.prototype.koblKnapper = function () {
        var mig = this;

        NK.el("kem-tilfoej-n2o4").addEventListener("click", function () { mig.tilfoej(0, 20); });
        NK.el("kem-tilfoej-no2").addEventListener("click", function () { mig.tilfoej(1, 20); });
        NK.el("kem-nulstil").addEventListener("click", function () { mig.nulstil(); });

        function skyder(id, saet) {
            var s = NK.el(id);
            s.addEventListener("input", function () { saet(parseFloat(s.value)); });
            saet(parseFloat(s.value));
        }
        skyder("kem-temp", function (v) { mig.temperatur = v; });
        skyder("kem-vol", function (v) { mig.volumen = v; });

        NK.grafSkift("kem", this.graf);
    };

    NK.SimKemi.prototype.tilfoej = function (type, antal) {
        for (var i = 0; i < antal && this.partikler.length < MAKS_PARTIKLER; i++) {
            this.partikler.push(this.nyPartikel(type));
        }
    };

    NK.SimKemi.prototype.tilpas = function () {
        this.l.tilpas();
        this.graf.tilpas();
    };

    /* Hastighedskonstanter efter Arrhenius. Forholdet mellem dem - og
       dermed K - er altid korrekt; kun den absolutte fart begraenses,
       saa man kan naa at se, hvad der sker. */
    NK.SimKemi.prototype.konstanter = function () {
        var faktor = 1 / this.temperatur - 1 / T0;
        var kf = KF0 * Math.exp(-EA_FREM / R_GAS * faktor);
        var kb = KB0 * Math.exp(-EA_TILBAGE / R_GAS * faktor);
        var stoerst = Math.max(kf, kb);
        if (stoerst > HASTIGHED_CAP) {
            var d = HASTIGHED_CAP / stoerst;
            kf *= d;
            kb *= d;
        }
        return { kf: kf, kb: kb, K: KF0 / KB0 * Math.exp(-(EA_FREM - EA_TILBAGE) / R_GAS * faktor) };
    };

    NK.SimKemi.prototype.taeller = function () {
        var n1 = 0, n2 = 0;
        for (var i = 0; i < this.partikler.length; i++) {
            if (this.partikler[i].type === 0) n1++; else n2++;
        }
        return { n1: n1, n2: n2 };
    };

    /* --------------------------------------------------------------- */
    NK.SimKemi.prototype.opdater = function (dt) {
        this.tid += dt;

        var k = this.konstanter();
        var t = this.taeller();
        var effektiv = SKALA * this.volumen;
        var c1 = t.n1 / effektiv;
        var c2 = t.n2 / effektiv;

        var vFrem = k.kf * c1;
        var vTilbage = k.kb * c2 * c2;

        /* --- N2O4 spaltes -> 2 NO2 ---------------------------------- */
        this.rest.frem += k.kf * t.n1 * dt;
        var antal = Math.min(Math.floor(this.rest.frem), t.n1);
        this.rest.frem -= Math.floor(this.rest.frem);
        for (var i = 0; i < antal; i++) this.spalt();

        /* --- 2 NO2 -> N2O4 ------------------------------------------ */
        this.rest.tilbage += k.kb * t.n2 * t.n2 / effektiv * dt;
        var antal2 = Math.min(Math.floor(this.rest.tilbage), Math.floor(t.n2 / 2));
        this.rest.tilbage -= Math.floor(this.rest.tilbage);
        for (var j = 0; j < antal2; j++) this.slaaSammen();

        /* --- bevaegelse --------------------------------------------- */
        var fart = 78 * Math.sqrt(this.temperatur / T0);
        var boksB = Math.max(80, this.l.b * 0.60 * (this.volumen / 1.4));
        var boksH = Math.max(80, this.l.h * 0.70);
        for (var p = 0; p < this.partikler.length; p++) {
            var pa = this.partikler[p];
            pa.x += pa.ux * fart * dt / boksB;
            pa.y += pa.uy * fart * dt / boksH;
            pa.vinkel += pa.spin * dt;
            if (pa.x < 0.035) { pa.x = 0.035; pa.ux = Math.abs(pa.ux); }
            if (pa.x > 0.965) { pa.x = 0.965; pa.ux = -Math.abs(pa.ux); }
            if (pa.y < 0.05) { pa.y = 0.05; pa.uy = Math.abs(pa.uy); }
            if (pa.y > 0.95) { pa.y = 0.95; pa.uy = -Math.abs(pa.uy); }
        }

        for (var g = this.glimt.length - 1; g >= 0; g--) {
            this.glimt[g].t += dt;
            if (this.glimt[g].t > 0.45) this.glimt.splice(g, 1);
        }

        /* --- panel -------------------------------------------------- */
        this.vVist.frem = NK.mod(this.vVist.frem, vFrem, 5, dt);
        this.vVist.tilbage = NK.mod(this.vVist.tilbage, vTilbage, 5, dt);

        var Y = c1 > 0 ? (c2 * c2) / c1 : Infinity;
        var maks = Math.max(0.4, this.vVist.frem, this.vVist.tilbage);
        NK.saetMaaler("kem-vfrem-fyld", "kem-vfrem-val", this.vVist.frem, maks, 2, "");
        NK.saetMaaler("kem-vtilbage-fyld", "kem-vtilbage-val", this.vVist.tilbage, maks, 2, "");
        NK.saetBadge("kem-badge", this.vVist.frem, this.vVist.tilbage, 0.06);
        NK.saetYK("kem-yk-maerke", "kem-y", "kem-kref", Y, k.K, k.K < 1 ? 3 : 2);

        NK.saetTekst("kem-c1", NK.tal(c1, 2));
        NK.saetTekst("kem-c2", NK.tal(c2, 2));
        NK.saetTekst("kem-n1", NK.tal(t.n1) + " stk.");
        NK.saetTekst("kem-n2", NK.tal(t.n2) + " stk.");
        NK.saetTekst("kem-k", NK.tal(k.K, k.K < 1 ? 3 : 2));
        NK.saetTekst("kem-temp-vis", NK.tal(this.temperatur) + " K");
        NK.saetTekst("kem-temp-c", NK.tal(this.temperatur - 273, 0) + " °C");
        NK.saetTekst("kem-vol-vis", NK.tal(this.volumen, 2) + " L");

        this.graf.saetReference(this.graf.gruppe === "fart" ? null : null);

        this.grafUr += dt;
        if (this.grafUr >= 0.18) {
            this.grafUr = 0;
            this.graf.tilfoej([c1, c2, vFrem, vTilbage]);
        }
    };

    NK.SimKemi.prototype.spalt = function () {
        var kandidater = [];
        for (var i = 0; i < this.partikler.length; i++) {
            if (this.partikler[i].type === 0) kandidater.push(i);
        }
        if (!kandidater.length) return;
        var idx = kandidater[(Math.random() * kandidater.length) | 0];
        var p = this.partikler[idx];

        this.glimt.push({ x: p.x, y: p.y, t: 0, farve: "#e6892a" });

        var a = this.nyPartikel(1, p.x - 0.012, p.y);
        var b = this.nyPartikel(1, p.x + 0.012, p.y);
        a.ux = -Math.abs(p.ux) || -1; a.uy = p.uy;
        b.ux = Math.abs(p.ux) || 1; b.uy = -p.uy;

        this.partikler.splice(idx, 1);
        if (this.partikler.length + 2 <= MAKS_PARTIKLER) {
            this.partikler.push(a, b);
        } else {
            this.partikler.push(a);
        }
    };

    NK.SimKemi.prototype.slaaSammen = function () {
        var idx = [];
        for (var i = 0; i < this.partikler.length; i++) {
            if (this.partikler[i].type === 1) idx.push(i);
        }
        if (idx.length < 2) return;

        /* Vaelg et NO2 og dets naermeste nabo - saa ligner det en
           rigtig sammenstod frem for teleportering. */
        var a = idx[(Math.random() * idx.length) | 0];
        var pa = this.partikler[a];
        var bedst = -1, bedstAfstand = Infinity;
        for (var j = 0; j < idx.length; j++) {
            if (idx[j] === a) continue;
            var pb = this.partikler[idx[j]];
            var dx = pb.x - pa.x, dy = pb.y - pa.y;
            var d = dx * dx + dy * dy;
            if (d < bedstAfstand) { bedstAfstand = d; bedst = idx[j]; }
        }
        if (bedst < 0) return;
        var pbb = this.partikler[bedst];

        var ny = this.nyPartikel(0, (pa.x + pbb.x) / 2, (pa.y + pbb.y) / 2);
        this.glimt.push({ x: ny.x, y: ny.y, t: 0, farve: "#3d9ee0" });

        var hoej = Math.max(a, bedst), lav = Math.min(a, bedst);
        this.partikler.splice(hoej, 1);
        this.partikler.splice(lav, 1);
        this.partikler.push(ny);
    };

    /* --------------------------------------------------------------- */
    NK.SimKemi.prototype.tegn = function () {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var i;

        ctx.clearRect(0, 0, b, h);

        /* --- baggrund ----------------------------------------------- */
        var bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, "#23222c");
        bg.addColorStop(1, "#16151c");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, b, h);

        /* --- beholder ----------------------------------------------- */
        var maksB = b * 0.60;
        var boksB = maksB * (this.volumen / 1.4);
        var bx0 = b * 0.23;
        var bx1 = bx0 + boksB;
        var by0 = h * 0.15;
        var by1 = by0 + h * 0.70;
        var boksH = by1 - by0;

        var t = this.taeller();
        var c2 = t.n2 / (SKALA * this.volumen);

        /* Gassen: Lambert-Beer - brunere jo hojere [NO2] og jo laengere
           lysvejen gennem beholderen er. */
        var vejlaengde = boksB / maksB;
        var brunhed = 1 - Math.exp(-1.15 * c2 * vejlaengde);

        ctx.save();
        NK.rundtRekt(ctx, bx0, by0, boksB, boksH, 12);
        ctx.clip();

        /* Ren gas ses som en klar kolbe. Jo mere NO2, jo brunere - det
           er den vej rundt, eleverne kender fra demonstrationsforsoget. */
        var klar = ctx.createLinearGradient(0, by0, 0, by1);
        klar.addColorStop(0, "#f4f7fa");
        klar.addColorStop(1, "#dde5ed");
        ctx.fillStyle = klar;
        ctx.fillRect(bx0, by0, boksB, boksH);
        ctx.fillStyle = "rgba(122, 52, 10, " + (brunhed * 0.95).toFixed(3) + ")";
        ctx.fillRect(bx0, by0, boksB, boksH);

        /* Molekyler */
        for (i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            var px = bx0 + p.x * boksB;
            var py = by0 + p.y * boksH;
            if (p.type === 0) {
                NK.Sprites.tegn(ctx, "n2o4", px, py, 36, p.vinkel, 0.95, "#3f6ecf");
            } else {
                NK.Sprites.tegn(ctx, "no2", px, py, 26, p.vinkel, 0.95, "#e0432f");
            }
        }

        /* Glimt ved hver reaktion */
        for (i = 0; i < this.glimt.length; i++) {
            var gl = this.glimt[i];
            var f = gl.t / 0.45;
            ctx.strokeStyle = gl.farve;
            ctx.globalAlpha = (1 - f) * 0.8;
            ctx.lineWidth = 2.5 * (1 - f) + 0.5;
            ctx.beginPath();
            ctx.arc(bx0 + gl.x * boksB, by0 + gl.y * boksH, 6 + f * 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.restore();

        /* Glasset */
        ctx.save();
        NK.rundtRekt(ctx, bx0, by0, boksB, boksH, 12);
        ctx.strokeStyle = "rgba(220, 234, 245, 0.55)";
        ctx.lineWidth = 3;
        ctx.stroke();
        var glans = ctx.createLinearGradient(bx0, 0, bx0 + boksB * 0.3, 0);
        glans.addColorStop(0, "rgba(255, 255, 255, 0.16)");
        glans.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = glans;
        ctx.fill();
        ctx.restore();

        /* --- stemplet ----------------------------------------------- */
        ctx.fillStyle = "#7b8592";
        NK.rundtRekt(ctx, bx1 - 2, by0 + 4, 16, boksH - 8, 4);
        ctx.fill();
        ctx.fillStyle = "#5d6773";
        ctx.fillRect(bx1 + 14, (by0 + by1) / 2 - 6, Math.max(8, bx0 + maksB + 26 - bx1), 12);
        ctx.fillStyle = "#8c96a3";
        NK.rundtRekt(ctx, bx0 + maksB + 20, (by0 + by1) / 2 - 20, 14, 40, 5);
        ctx.fill();

        NK.tekst(ctx, "V = " + NK.tal(this.volumen, 2) + " L", bx1 + 22, by0 + 18, {
            farve: "#aeb7c2", font: "600 12px 'Segoe UI', sans-serif"
        });

        /* --- termometer --------------------------------------------- */
        this.tegnTermometer(ctx, b * 0.10, by0, by1);

        /* --- tekst -------------------------------------------------- */
        NK.tekst(ctx, "N₂O₄(g)  ⇌  2 NO₂(g)", bx0, by0 - 16, {
            farve: "#e8edf2", font: "700 19px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "farveløs", bx0 + 6, by0 - 34, {
            farve: "#8fb8e0", font: "600 11px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "rødbrun", bx0 + 148, by0 - 34, {
            farve: "#d98a4a", font: "600 11px 'Segoe UI', sans-serif"
        });

        NK.tekst(ctx,
            "Gassen bliver brunere, når [NO₂] stiger — samme princip som Lambert-Beers lov.",
            bx0, by1 + 22, { farve: "#8d95a1", font: "12px 'Segoe UI', sans-serif" });

        NK.tekst(ctx, NK.tal(t.n1) + " × N₂O₄", bx0, by1 + 42, {
            farve: "#6fb2e6", font: "700 13px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, NK.tal(t.n2) + " × NO₂", bx0 + 110, by1 + 42, {
            farve: "#e6a25e", font: "700 13px 'Segoe UI', sans-serif"
        });

        this.graf.tegn();
    };

    NK.SimKemi.prototype.tegnTermometer = function (ctx, x, y0, y1) {
        var bredde = 16;
        var bulb = 15;
        var toppen = y0 + 10;
        var bunden = y1 - 26;
        var andel = NK.klamp((this.temperatur - 240) / 120, 0, 1);

        var kold = [74, 163, 224];
        var varm = [224, 84, 70];
        var farve = "rgb(" +
            Math.round(NK.lerp(kold[0], varm[0], andel)) + "," +
            Math.round(NK.lerp(kold[1], varm[1], andel)) + "," +
            Math.round(NK.lerp(kold[2], varm[2], andel)) + ")";

        /* Vandbad bag termometeret */
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = farve;
        NK.rundtRekt(ctx, x - 30, toppen - 8, 60, bunden - toppen + 46, 12);
        ctx.fill();
        ctx.restore();

        /* Glasrør */
        ctx.fillStyle = "#20232b";
        NK.rundtRekt(ctx, x - bredde / 2, toppen, bredde, bunden - toppen, bredde / 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(220, 234, 245, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* Væske - altid rod, som i et rigtigt sprittermometer. Det er
           vandbadet bagved, der skifter fra blaat til rodt. */
        var vaeskeTop = NK.lerp(bunden - 6, toppen + 6, andel);
        ctx.fillStyle = "#d94a3d";
        NK.rundtRekt(ctx, x - bredde / 2 + 4, vaeskeTop, bredde - 8, bunden - vaeskeTop, (bredde - 8) / 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, bunden + bulb - 4, bulb, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(220, 234, 245, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* Skala */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        for (var i = 0; i <= 4; i++) {
            var sy = NK.lerp(bunden - 6, toppen + 6, i / 4);
            ctx.beginPath();
            ctx.moveTo(x + bredde / 2 + 2, sy);
            ctx.lineTo(x + bredde / 2 + 8, sy);
            ctx.stroke();
            NK.tekst(ctx, NK.tal(240 + i * 30) + " K", x + bredde / 2 + 11, sy + 3, {
                farve: "#8d95a1", kant: false, font: "10px 'Segoe UI', sans-serif"
            });
        }

        NK.tekst(ctx, NK.tal(this.temperatur) + " K", x, toppen - 30, {
            justering: "center", farve: "#eef2f6", font: "700 15px 'Segoe UI', sans-serif"
        });
        var ord = this.temperatur < 283 ? "isbad" : (this.temperatur > 313 ? "varmt vandbad" : "stuetemperatur");
        NK.tekst(ctx, ord, x, toppen - 14, {
            justering: "center", farve: farve, font: "600 11px 'Segoe UI', sans-serif"
        });
    };
}());
