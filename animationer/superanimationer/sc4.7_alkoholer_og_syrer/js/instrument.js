/* =====================================================================
   instrument.js - det, der viser stoffets egenskaber ved siden af pladen

     NK.Termometer   kogepunktet (fane 2). Soejlen glider hen til stoffets
                     kogepunkt, og en streg viser 20 °C, saa eleven kan se,
                     om stoffet er en gas eller en vaeske ved stuetemperatur.
     NK.Glas         et reagensglas med vand og stoffet, rystet (fane 3).
                     Glasset ryster, naar stoffet skifter, og lagene skilles
                     derefter: ét lag, to lag, to lag med et tyndere oeverste
                     lag (paa graensen) eller bobler (en gas).
     NK.Navnemaskine sadan dannes navnet (fane 1): antallet af
                     carbonatomer giver foerste del, gruppen giver endelsen.

   Alle tre kan skjule det, de viser (et spoergsmaalstegn), naar opgaven
   spoerger om netop det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var SKRIFT = "'Segoe UI', sans-serif";
    function font(v, px) { return v + " " + Math.round(px) + "px " + SKRIFT; }

    /* ----- Termometeret ------------------------------------------------------------------ */
    var T_MIN = -200, T_MAKS = 300;

    function Termometer() { this.vist = null; this.maal = null; this.stof = null; }

    Termometer.prototype.saet = function (stof, straks) {
        this.stof = stof;
        this.maal = Math.max(T_MIN - 12, stof.kp);
        if (straks || this.vist === null) this.vist = this.maal;
    };

    Termometer.prototype.opdater = function (dt) {
        if (this.vist === null) return;
        this.vist = NK.mod(this.vist, this.maal, 5, dt);
    };

    Termometer.prototype.yFor = function (g, t) {
        return g.yTop + (T_MAKS - t) / (T_MAKS - T_MIN) * (g.yBund - g.yTop);
    };

    /* R: hele feltet. Giver termometerets rektangel (til ringen) */
    Termometer.prototype.tegn = function (ctx, R, valg) {
        valg = valg || {};
        var M = NK.Sprites.MAAL.termometer;
        var titelH = 40, bundH = 46;
        var h = Math.max(120, Math.min(R.h - titelH - bundH, 520));
        var k = h / M.h;
        var b = M.b * k;
        var x = R.x + Math.round(R.b * 0.42 - b / 2), y = R.y + titelH;
        var g = { yTop: y + M.skalaTop * k, yBund: y + M.skalaBund * k, x0: x + M.soejleX0 * k, x1: x + M.soejleX1 * k };
        var stof = this.stof;

        NK.tekst(ctx, "Kogepunkt", R.x + R.b / 2, R.y + 16, { font: font("700", 15), justering: "center", farve: "#e6eaef" });

        /* Skalaen til venstre */
        ctx.save();
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (var t = T_MIN; t <= T_MAKS; t += 50) {
            var yy = this.yFor(g, t);
            var stor = t % 100 === 0;
            ctx.strokeStyle = stor ? "#aab3bf" : "#6b7280";
            ctx.lineWidth = stor ? 1.6 : 1;
            ctx.beginPath();
            ctx.moveTo(x - (stor ? 10 : 6), yy); ctx.lineTo(x - 1, yy);
            ctx.stroke();
            if (stor) {
                ctx.font = font("600", 12);
                ctx.fillStyle = "#aab3bf";
                ctx.fillText(t < 0 ? "−" + Math.abs(t) : String(t), x - 13, yy);
            }
        }
        ctx.restore();

        /* Soejlen (bag glasset i spritet) */
        var skjult = valg.skjult;
        if (this.vist !== null && !skjult) {
            var yS = Math.max(g.yTop, Math.min(g.yBund + 6, this.yFor(g, this.vist)));
            var kugleY = y + M.kugleY * k;
            var gr = ctx.createLinearGradient(g.x0, 0, g.x1, 0);
            gr.addColorStop(0, "#b8322a"); gr.addColorStop(0.5, "#ef5a4c"); gr.addColorStop(1, "#b8322a");
            ctx.fillStyle = gr;
            ctx.fillRect(g.x0, yS, g.x1 - g.x0, kugleY - yS);
        }
        NK.Sprites.tegn(ctx, "termometer", x, y, b, M.h * k);

        /* 20 °C: en stiplet streg tvaers over */
        var y20 = this.yFor(g, D.STUE);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 4, y20); ctx.lineTo(x + b + 34, y20);
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "20 °C", x + b + 36, y20 + 4, { font: font("700", 11.5), farve: "#e8c75a" });

        /* Tallet ved soejlens top */
        if (stof && !skjult) {
            var yT = Math.max(g.yTop, Math.min(g.yBund, this.yFor(g, this.maal)));
            var tekst = D.grader(stof.kp);
            ctx.font = font("700", 15);
            var tb = ctx.measureText(tekst).width + 14, th = 24;
            var bx = x + b + 8, by = yT - th / 2;
            /* Ikke oven i 20 °C-maerket */
            if (Math.abs(yT - y20) < 16) by = yT < y20 ? y20 - 16 - th : y20 + 10;
            bx = Math.min(bx, R.x + R.b - tb - 2);
            NK.rundtRekt(ctx, bx, by, tb, th, 7);
            ctx.fillStyle = "#2b2f3c";
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "#ef5a4c";
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(tekst, bx + tb / 2, by + th / 2 + 0.5);
            if (stof.kp < T_MIN) {
                ctx.font = font("600", 11);
                ctx.fillStyle = "#aab3bf";
                ctx.fillText("under skalaen", bx + tb / 2, by + th + 9);
            }
        } else if (skjult) {
            NK.tekst(ctx, "?", x + b + 14, (g.yTop + g.yBund) / 2, { font: font("700", 26), farve: "#f2c53d" });
        }

        /* Under termometeret: gas eller vaeske ved 20 °C */
        if (stof && !skjult) {
            var linje = "Ved 20 °C: " + stof.tilstand;
            NK.tekst(ctx, linje, R.x + R.b / 2, y + M.h * k + 26, { font: font("700", NK.Tegn.passer(ctx, linje, R.b - 4, "700", 14, 11)), justering: "center", farve: stof.tilstand === "gas" ? "#9fd0ff" : "#e6eaef" });
        }
        return { x: x - 40, y: y + 2, b: b + 84, h: M.h * k };
    };

    /* ----- Reagensglasset ---------------------------------------------------------------- */
    function Glas() { this.stof = null; this.t = 9; }

    Glas.prototype.saet = function (stof, straks) {
        if (this.stof && stof.id === this.stof.id) return;
        this.stof = stof;
        this.t = straks ? 9 : 0;
    };

    Glas.prototype.opdater = function (dt) { this.t += dt; };

    var VAND_FARVE = "#cfe6f6";
    var STOF_FARVE = "#f5ecc8";
    var BLANDET = "#dbeaf0";

    /* R: hele feltet. Giver glassets rektangel (til ringen) */
    Glas.prototype.tegn = function (ctx, R, valg) {
        valg = valg || {};
        var stof = this.stof;
        if (!stof) return null;
        var M = NK.Sprites.MAAL.reagensglas;
        var titelH = 30, bundH = 58;
        /* Den hvide plade bag glasset, saa lagene kan ses (som sc4.6) */
        var plade = { x: R.x + 6, y: R.y + titelH, b: R.b - 12, h: R.h - titelH - bundH };
        var titel = valg.skjult ? "Vand og stoffet" : "Vand og " + stof.navn;
        NK.tekst(ctx, titel, R.x + R.b / 2, R.y + 19, { font: font("700", NK.Tegn.passer(ctx, titel, R.b - 6, "700", 15, 11)), justering: "center", farve: "#e6eaef" });
        ctx.save();
        NK.rundtRekt(ctx, plade.x, plade.y, plade.b, plade.h, 10);
        ctx.fillStyle = "#f3f5f8";
        ctx.fill();
        ctx.restore();

        var h = Math.min(plade.h - 20, (plade.b - 20) * M.h / M.b, 300);
        var k = h / M.h, b = M.b * k;
        var x = plade.x + plade.b / 2 - b / 2, y = plade.y + (plade.h - h) / 2;

        if (valg.skjult) {
            NK.Sprites.tegn(ctx, "reagensglas", x, y, b, h);
            NK.tekst(ctx, "?", plade.x + plade.b / 2, plade.y + plade.h / 2 + 12, { font: font("700", 40), justering: "center", farve: "#b8860b" });
            var t2 = "Glasset vises, når du har indsendt";
            NK.tekst(ctx, t2, R.x + R.b / 2, plade.y + plade.h + 22, { font: font("600", NK.Tegn.passer(ctx, t2, R.b - 6, "600", 13, 10.5)), justering: "center", farve: "#aab3bf" });
            return { x: plade.x, y: plade.y, b: plade.b, h: plade.h };
        }

        /* Rystet: glasset vipper lidt, og lagene skilles bagefter */
        var ryst = this.t < 0.7 ? Math.sin(this.t * 38) * (0.7 - this.t) * 0.09 : 0;
        var skil = NK.blod((this.t - 0.55) / 1.1);
        var noegle = D.oplNoegle(stof);

        ctx.save();
        ctx.translate(x + b / 2, y + h);
        ctx.rotate(ryst);
        ctx.translate(-(x + b / 2), -(y + h));

        var ix0 = x + M.indV * k, ix1 = x + M.indH * k;
        var top = y + 92 * k, bund = y + (M.bundC + M.r) * k;
        var midtY = y + M.bundC * k;
        function form(y0) {
            ctx.beginPath();
            ctx.moveTo(ix0, y0);
            ctx.lineTo(ix0, midtY);
            ctx.arc((ix0 + ix1) / 2, midtY, (ix1 - ix0) / 2, Math.PI, 0, true);
            ctx.lineTo(ix1, y0);
            ctx.closePath();
        }
        var hoej = bund - top;
        if (noegle === "gas") {
            /* Kun vandet; gassen bobler op og forsvinder */
            var vTop = top + hoej * 0.35;
            form(vTop); ctx.fillStyle = VAND_FARVE; ctx.fill();
            ctx.save();
            form(vTop); ctx.clip();
            for (var i = 0; i < 9; i++) {
                var fase = (this.t * 0.55 + i * 0.37) % 1;
                var bx = ix0 + (ix1 - ix0) * (0.2 + 0.6 * ((i * 0.618) % 1));
                var by = bund - 6 - fase * (bund - vTop);
                ctx.beginPath();
                ctx.arc(bx, by, 2 + (i % 3), 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(90, 130, 170, 0.75)";
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
            ctx.restore();
        } else if (noegle === "ja" || noegle === "vand") {
            form(top); ctx.fillStyle = noegle === "vand" ? VAND_FARVE : BLANDET; ctx.fill();
        } else {
            /* To lag: stoffet oeverst. Paa graensen er det oeverste lag tyndere,
               og vandet har faaet lidt af stoffet. Mens glasset ryster, er det
               hele en uklar blanding. */
            var andel = noegle === "delvist" ? 0.3 : 0.5;
            var graense = top + hoej * andel;
            form(top); ctx.fillStyle = STOF_FARVE; ctx.fill();
            form(graense); ctx.fillStyle = noegle === "delvist" ? "#d6e8ec" : VAND_FARVE; ctx.fill();
            ctx.strokeStyle = "rgba(120, 110, 70, 0.8)";
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(ix0, graense); ctx.lineTo(ix1, graense); ctx.stroke();
            if (skil < 1) {
                ctx.save();
                ctx.globalAlpha = 1 - skil;
                form(top); ctx.fillStyle = "#e7ecea"; ctx.fill();
                ctx.save();
                form(top); ctx.clip();
                for (var d = 0; d < 26; d++) {
                    var dx = ix0 + (ix1 - ix0) * ((d * 0.618 + 0.1) % 1);
                    var dy = top + hoej * ((d * 0.377 + 0.05) % 1);
                    ctx.beginPath();
                    ctx.arc(dx, dy, 2.2 + (d % 3) * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(230, 205, 120, 0.85)";
                    ctx.fill();
                }
                ctx.restore();
                ctx.restore();
            }
        }
        /* Menisken oeverst */
        ctx.strokeStyle = "rgba(90, 120, 150, 0.55)";
        ctx.lineWidth = 1.2;
        var mTop = noegle === "gas" ? top + hoej * 0.35 : top;
        ctx.beginPath(); ctx.moveTo(ix0, mTop); ctx.lineTo(ix1, mTop); ctx.stroke();
        NK.Sprites.tegn(ctx, "reagensglas", x, y, b, h);
        ctx.restore();

        /* Teksten under pladen */
        if (this.t > 1.1 || noegle === "ja" || noegle === "vand" || noegle === "gas") {
            var linje = D.OPL_TEKST[noegle];
            var farve = noegle === "ja" || noegle === "vand" ? "#9be0b8" : (noegle === "delvist" ? "#ffd27a" : "#f4a39a");
            NK.tekst(ctx, linje[0], R.x + R.b / 2, plade.y + plade.h + 22, { font: font("700", NK.Tegn.passer(ctx, linje[0], R.b - 6, "700", 16, 12)), justering: "center", farve: farve });
            NK.tekst(ctx, linje[1], R.x + R.b / 2, plade.y + plade.h + 41, { font: font("600", NK.Tegn.passer(ctx, linje[1], R.b - 6, "600", 12.5, 10)), justering: "center", farve: "#c3c9d2" });
        }
        return { x: plade.x, y: plade.y, b: plade.b, h: plade.h };
    };

    /* ----- Navnemaskinen ------------------------------------------------------------------ */
    var BLAEK = "#1f2430", GROEN = "#0f766e", GRAA = "#6b7280";

    function tegnNavnemaskine(ctx, R, stof, valg) {
        valg = valg || {};
        NK.Tegn.tavle(ctx, R);
        var x = R.x + 18, b = R.b - 36;
        var ry = R.y + 16;
        var skjult = valg.skjult;
        var h = R.h - 32;
        var raekke = Math.min(76, h / 5.3);
        var lille = Math.max(12, Math.min(15, raekke * 0.21));
        var stor = Math.max(15, Math.min(24, raekke * 0.33));

        NK.tekst(ctx, "Sådan dannes navnet", x, ry + 14, { font: font("700", Math.min(18, stor * 0.85)), farve: BLAEK });
        ry += raekke * 0.55;

        function etiket(t, yy) { NK.tekst(ctx, t, x, yy, { font: font("600", lille), farve: GRAA }); }
        function spoerg(yy) { NK.tekst(ctx, "?", x, yy, { font: font("700", stor), farve: "#b8860b" }); }

        if (!skjult && !stof.organisk) {
            etiket(stof.id === "vand" ? "Ingen carbonatomer" : "Ingen carbonatomer", ry + 6);
            NK.tekst(ctx, stof.Navn, x, ry + raekke * 0.55, { font: font("700", stor * 1.2), farve: BLAEK });
            var note = D.PAASKE[stof.id];
            ordbryd(ctx, note, x, ry + raekke * 1.15, b, font("600", lille + 1), "#3b4252", lille * 1.45);
            return;
        }
        if (!skjult && stof.id === "glycerol") {
            etiket("Tre carbonatomer med hver sin OH-gruppe", ry + 6);
            NK.tekst(ctx, "glycerol", x, ry + raekke * 0.6, { font: font("700", stor * 1.2), farve: BLAEK });
            ordbryd(ctx, "Navnet glycerol er et gammelt navn, som bruges i stedet for det systematiske.", x, ry + raekke * 1.15, b, font("600", lille + 1), "#3b4252", lille * 1.45);
            return;
        }

        /* 1. Antallet af carbonatomer */
        etiket("Carbonatomer i alt", ry + 4);
        if (skjult) spoerg(ry + raekke * 0.5);
        else {
            var r = Math.min(10, (b - 60) / (2.6 * 8));
            var cx = x + r, cy = ry + raekke * 0.42;
            NK.tekst(ctx, String(stof.C), x, cy + stor * 0.35, { font: font("700", stor), farve: BLAEK });
            cx = x + ctx.measureText("8").width + 26;
            for (var i = 0; i < stof.C; i++) {
                var gr = stof.g === "COOH" && i === stof.C - 1;
                ctx.beginPath();
                ctx.arc(cx + i * r * 2.5, cy + 2, r, 0, Math.PI * 2);
                ctx.fillStyle = gr ? GROEN : "#4b515a";
                ctx.fill();
            }
            if (stof.g === "COOH") {
                var tx = cx + stof.C * r * 2.5 + 4, tc = "det sidste i COOH";
                ctx.font = font("600", lille - 1);
                if (tx + ctx.measureText(tc).width <= x + b + 10) NK.tekst(ctx, tc, tx, cy + 6, { font: font("600", lille - 1), farve: GROEN });
                else NK.tekst(ctx, tc, x, cy + r + lille + 4, { font: font("600", lille - 1), farve: GROEN });
            }
        }
        ry += raekke;

        /* 2. Gruppen */
        etiket("Gruppen for enden", ry + 4);
        if (skjult) spoerg(ry + raekke * 0.5);
        else {
            var gTekst = stof.g === "H" ? "ingen, kun −H" : (stof.g === "OH" ? "−OH, hydroxygruppe" : "−COOH, carboxylgruppe");
            NK.tekst(ctx, gTekst, x, ry + raekke * 0.5, { font: font("700", stor * 0.82), farve: stof.g === "H" ? BLAEK : GROEN });
        }
        ry += raekke;

        /* 3. Navnet i dele */
        etiket("Navnet", ry + 4);
        if (skjult) spoerg(ry + raekke * 0.55);
        else {
            /* Som i bogen: alkanens navn med samme antal carbonatomer og
               derefter endelsen for gruppen */
            var dele = [[stof.stamme + stof.del2, BLAEK, "alkanen med " + stof.C + " C"]];
            if (stof.endelse) dele.push([stof.endelse, GROEN, stof.g === "OH" ? "OH-gruppen" : "COOH-gruppen"]);
            var px = Math.min(stor * 1.35, 34);
            ctx.font = font("700", px);
            var samlet = dele.reduce(function (s, d) { return s + ctx.measureText(d[0]).width; }, 0);
            if (samlet > b * 0.8) { px = px * b * 0.8 / samlet; ctx.font = font("700", px); }
            var xx = x, yy = ry + raekke * 0.62, etiketX = x;
            ctx.textBaseline = "alphabetic";
            dele.forEach(function (d) {
                ctx.font = font("700", px);
                ctx.textAlign = "left";
                var w = ctx.measureText(d[0]).width;
                ctx.fillStyle = d[1];
                ctx.fillText(d[0], xx, yy);
                /* En streg under delen og forklaringen under stregen. Delene staar
                   samlet som ét ord; forklaringerne skubbes til siden, hvis de
                   ellers ville staa oven i hinanden. */
                var farve = d[1] === BLAEK ? GRAA : GROEN;
                ctx.fillStyle = farve;
                ctx.fillRect(xx + 1, yy + 5, w - 2, 2);
                ctx.font = font("600", lille - 1.5);
                var ex = Math.max(xx, etiketX);
                ctx.fillText(d[2], ex, yy + lille + 7);
                etiketX = ex + ctx.measureText(d[2]).width + 12;
                xx += w;
            });
        }
        ry += raekke * 1.4;

        /* 4. Stofklassen og et kendt navn */
        etiket("Stofklasse", ry + 4);
        if (skjult) spoerg(ry + raekke * 0.5);
        else {
            var kl = stof.klasse + (stof.kendt ? "  ·  " + stof.kendt : "");
            NK.tekst(ctx, kl, x, ry + raekke * 0.5, { font: font("700", NK.Tegn.passer(ctx, kl, b, "700", stor * 0.8, 11)), farve: BLAEK });
        }
    }

    /* Tekst, der brydes om i bredden b */
    function ordbryd(ctx, tekst, x, y, b, f, farve, lh) {
        ctx.save();
        ctx.font = f;
        ctx.fillStyle = farve;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        var ord = tekst.split(" "), linje = "";
        ord.forEach(function (o) {
            var proeve = linje ? linje + " " + o : o;
            if (ctx.measureText(proeve).width > b && linje) {
                ctx.fillText(linje, x, y);
                y += lh;
                linje = o;
            } else linje = proeve;
        });
        if (linje) ctx.fillText(linje, x, y);
        ctx.restore();
    }

    NK.Termometer = Termometer;
    NK.Glas = Glas;
    NK.tegnNavnemaskine = tegnNavnemaskine;
    NK.ordbryd = ordbryd;
}());
