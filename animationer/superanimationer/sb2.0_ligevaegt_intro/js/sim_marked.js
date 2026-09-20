/* =====================================================================
   sim_marked.js - udbud og eftersporgsel finder en ligevaegtspris

   Prisen er systemets "reaktionsbrok": den flytter sig, indtil de to
   modsatrettede stromme er lige store.

       eftersporgsel  D(p) = D0 * (p0/p)^1,6     (falder med prisen)
       udbud          S(p) = S0 * (p/p0)^1,2     (stiger med prisen)

   Ligevaegtsprisen kan regnes ud direkte:

       p* = p0 * (D0/S0)^(1 / (1,2 + 1,6))

   En god host svarer til et indgreb i en kemisk ligevaegt: udbuddet
   forskydes, og systemet finder en NY ligevaegt - ikke den gamle.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var VARER = ["tomat", "aert", "jordbaer"];
    var VARE_FARVER = ["#e0472f", "#6fbc54", "#d9382f"];

    NK.SimMarked = function () {
        this.l = new NK.Laerred(NK.el("mrk-laerred"));

        this.graf = new NK.Graf(NK.el("mrk-graf"), [
            { navn: "Pris", farve: "#f2c53d", gruppe: "pris" },
            { navn: "Udbud", farve: "#3d9ee0", gruppe: "fart" },
            { navn: "Efterspørgsel", farve: "#e6892a", gruppe: "fart" }
        ], {
            enheder: { pris: "kr. pr. bakke", fart: "bakker pr. dag" },
            minTop: { pris: 20, fart: 40 },
            startGruppe: "pris"
        });

        this.p0 = 15;      // udgangspris
        this.eD = 1.6;     // hvor kraftigt eftersporgslen falder med prisen
        this.eS = 1.2;     // hvor kraftigt udbuddet stiger med prisen
        this.kappa = 0.28; // hvor hurtigt prisen reagerer

        this.tid = 0;
        this.grafUr = 0;
        this.kundeRest = 0;
        this.kunder = [];

        this.nulstil();
        this.koblKnapper();
    };

    NK.SimMarked.prototype.nulstil = function () {
        this.D0 = 30;
        this.S0 = 30;
        this.pris = 26;        // starter for hojt, saa prisfaldet kan ses
        this.lager = 40;
        this.omsaetning = 0;
        this.vUdbud = 0;
        this.vEfter = 0;
        this.kunder.length = 0;
        this.graf.nulstil();
    };

    NK.SimMarked.prototype.koblKnapper = function () {
        var mig = this;
        NK.el("mrk-hoest").addEventListener("click", function () {
            mig.S0 = Math.min(150, mig.S0 * 2);
        });
        NK.el("mrk-kunder").addEventListener("click", function () {
            mig.D0 = Math.min(200, mig.D0 * 1.6);
        });
        NK.el("mrk-nulstil").addEventListener("click", function () { mig.nulstil(); });
        NK.grafSkift("mrk", this.graf);
    };

    NK.SimMarked.prototype.tilpas = function () {
        this.l.tilpas();
        this.graf.tilpas();
    };

    NK.SimMarked.prototype.udbud = function (p) {
        return this.S0 * Math.pow(p / this.p0, this.eS);
    };

    NK.SimMarked.prototype.efterspoergsel = function (p) {
        return this.D0 * Math.pow(this.p0 / p, this.eD);
    };

    NK.SimMarked.prototype.ligevaegtspris = function () {
        return this.p0 * Math.pow(this.D0 / this.S0, 1 / (this.eS + this.eD));
    };

    /* --------------------------------------------------------------- */
    NK.SimMarked.prototype.opdater = function (dt) {
        this.tid += dt;

        var S = this.udbud(this.pris);
        var D = this.efterspoergsel(this.pris);

        /* Prisen skubbes af forskellen mellem de to stromme. */
        this.pris = NK.klamp(this.pris + this.kappa * this.pris * (D - S) / Math.max(1, this.S0) * dt, 1, 120);

        /* Varestrom gennem boden */
        this.lager += S * dt;
        var salg = Math.min(D * dt, this.lager);
        this.lager -= salg;
        this.omsaetning += salg * this.pris;
        var salgsrate = dt > 0 ? salg / dt : 0;

        this.vUdbud = NK.mod(this.vUdbud, S, 5, dt);
        this.vEfter = NK.mod(this.vEfter, D, 5, dt);

        /* --- kunder paa pladsen ------------------------------------- */
        this.kundeRest += salgsrate * dt / 5;
        while (this.kundeRest >= 1) {
            this.kundeRest -= 1;
            if (this.kunder.length < 14) {
                this.kunder.push({
                    x: 1.06 + Math.random() * 0.08,
                    spor: Math.random(),
                    baerer: false,
                    fart: 0.10 + Math.random() * 0.05,
                    vare: (Math.random() * VARER.length) | 0
                });
            }
        }
        for (var i = this.kunder.length - 1; i >= 0; i--) {
            var k = this.kunder[i];
            k.x -= k.fart * dt;
            if (k.x < 0.46) k.baerer = true;
            if (k.x < -0.08) this.kunder.splice(i, 1);
        }

        /* --- panel -------------------------------------------------- */
        var pStjerne = this.ligevaegtspris();
        var maks = Math.max(40, this.vUdbud, this.vEfter);
        NK.saetMaaler("mrk-vudbud-fyld", "mrk-vudbud-val", this.vUdbud, maks, 0, "");
        NK.saetMaaler("mrk-vefter-fyld", "mrk-vefter-val", this.vEfter, maks, 0, "");
        NK.saetBadge("mrk-badge", this.vUdbud, this.vEfter, 0.03);

        NK.saetTekst("mrk-pris", NK.tal(this.pris, 2) + " kr.");
        NK.saetTekst("mrk-ligepris", NK.tal(pStjerne, 2) + " kr.");
        NK.saetTekst("mrk-lager", NK.tal(this.lager) + " bakker");
        NK.saetTekst("mrk-omsaetning", NK.tal(this.omsaetning) + " kr.");

        this.graf.saetReference(
            this.graf.gruppe === "pris" ? pStjerne : null, "#f2c53d", "ligevægtspris");

        this.grafUr += dt;
        if (this.grafUr >= 0.18) {
            this.grafUr = 0;
            this.graf.tilfoej([this.pris, S, D]);
        }
    };

    /* --------------------------------------------------------------- */
    NK.SimMarked.prototype.tegn = function () {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var i;
        var jordY = h * 0.56;

        ctx.clearRect(0, 0, b, h);

        /* --- aftenhimmel over torvet -------------------------------- */
        var himmel = ctx.createLinearGradient(0, 0, 0, jordY);
        himmel.addColorStop(0, "#3b2a52");
        himmel.addColorStop(0.55, "#7c4a63");
        himmel.addColorStop(1, "#d68f5e");
        ctx.fillStyle = himmel;
        ctx.fillRect(0, 0, b, jordY);

        /* Bygninger i silhuet */
        var r = NK.froe(808);
        ctx.fillStyle = "#3a2b45";
        var x = -10;
        while (x < b) {
            var bb = 40 + r() * 60;
            var bh = (0.10 + r() * 0.16) * h;
            ctx.fillRect(x, jordY - bh, bb, bh);
            ctx.fillStyle = "rgba(255, 214, 150, 0.5)";
            for (var vi = 0; vi < 3; vi++) {
                if (r() > 0.45) ctx.fillRect(x + 8 + vi * 14, jordY - bh + 12 + (r() * bh * 0.5), 7, 9);
            }
            ctx.fillStyle = "#3a2b45";
            x += bb + 6;
        }

        /* --- brosten ------------------------------------------------ */
        var jord = ctx.createLinearGradient(0, jordY, 0, h);
        jord.addColorStop(0, "#5c5049");
        jord.addColorStop(1, "#3d352f");
        ctx.fillStyle = jord;
        ctx.fillRect(0, jordY, b, h - jordY);
        /* Brosten: raekker af smaa buer, der bliver stoerre nedad. */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        var raekker = 9;
        for (i = 0; i < raekker; i++) {
            var brok = i / raekker;
            var sy = jordY + brok * (h - jordY);
            var sten = 16 + brok * 26;
            for (var sx = (i % 2) * sten / 2; sx < b; sx += sten) {
                ctx.beginPath();
                ctx.arc(sx + sten / 2, sy + sten * 0.5, sten * 0.5, Math.PI, 0);
                ctx.stroke();
            }
        }

        /* --- boden -------------------------------------------------- */
        var bodB = NK.klamp(b * 0.26, 150, 260);
        var bodX = b * 0.32;
        NK.Sprites.tegnStaaende(ctx, "bod", bodX, jordY + (h - jordY) * 0.42, bodB, 1, "#b8563f");

        /* Prisskilt */
        this.tegnPrisskilt(ctx, bodX + bodB * 0.46, jordY - 6);

        /* --- hojbede med varer -------------------------------------- */
        var bedB = NK.klamp(b * 0.17, 100, 170);
        var bedY = h - 46;
        var bedX = [b * 0.14, b * 0.58, b * 0.84];
        var vist = Math.min(Math.floor(this.lager), 72);
        var pr = Math.ceil(vist / bedX.length);

        for (var bi = 0; bi < bedX.length; bi++) {
            NK.Sprites.tegnStaaende(ctx, "hoejbed", bedX[bi], bedY, bedB, 1, "#a87a4e");
            var bedH = NK.Sprites.hoejde("hoejbed", bedB);
            var toppen = bedY - bedH + bedH * 0.30;
            var antal = NK.klamp(vist - bi * pr, 0, pr);
            for (i = 0; i < antal; i++) {
                var kol = i % 6;
                var raek = Math.floor(i / 6);
                var vx = bedX[bi] - bedB * 0.36 + kol * (bedB * 0.145);
                var vy = toppen - raek * 16 - 4;
                var t = (i + bi) % VARER.length;
                NK.Sprites.tegn(ctx, VARER[t], vx, vy, 17, 0, 1, VARE_FARVER[t]);
            }
        }

        /* --- kunder ------------------------------------------------- */
        for (i = 0; i < this.kunder.length; i++) {
            var k = this.kunder[i];
            var kx = k.x * b;
            var ky = jordY + (h - jordY) * (0.42 + k.spor * 0.5);
            var kb = 20 + k.spor * 8;
            var kh = NK.Sprites.hoejde("kunde", kb);
            var hop = Math.abs(Math.sin(this.tid * 5 + k.spor * 6)) * 1.6;
            ctx.save();
            ctx.translate(kx, ky - kh / 2 - hop);
            NK.Sprites.tegn(ctx, "kunde", 0, 0, kb, 0, 1, "#4e79a8");
            ctx.restore();
            if (k.baerer) {
                NK.Sprites.tegn(ctx, VARER[k.vare], kx - kb * 0.42, ky - kh * 0.55 - hop, 12, 0, 1, VARE_FARVER[k.vare]);
            }
        }

        /* --- kurvediagram ------------------------------------------- */
        this.tegnKrydsDiagram(ctx, b, h);

        NK.tekst(ctx, "Torvedag: tomater, ærter og jordbær", 18, 30, {
            farve: "#ffe0b8", font: "700 17px 'Segoe UI', sans-serif"
        });

        this.graf.tegn();
    };

    NK.SimMarked.prototype.tegnPrisskilt = function (ctx, x, y) {
        var b = 92, h = 42;
        ctx.save();
        ctx.fillStyle = "#6b4a2f";
        ctx.fillRect(x - 3, y, 6, 34);
        ctx.fillStyle = "#f4ecd8";
        NK.rundtRekt(ctx, x - b / 2, y - h, b, h, 5);
        ctx.fill();
        ctx.strokeStyle = "#8a6440";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "PRIS", x, y - h + 14, {
            justering: "center", farve: "#8a6440", kant: false, font: "700 10px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, NK.tal(this.pris, 2) + " kr.", x, y - 12, {
            justering: "center", farve: "#3d352f", kant: false, font: "700 17px 'Segoe UI', sans-serif"
        });
    };

    /* Klassisk udbud/eftersporgsels-diagram i hjornet af scenen. */
    NK.SimMarked.prototype.tegnKrydsDiagram = function (ctx, b, h) {
        var db = NK.klamp(b * 0.24, 170, 230);
        var dh = db * 0.78;
        var x0 = b - db - 16;
        var y0 = 16;

        ctx.save();
        ctx.fillStyle = "rgba(16, 14, 22, 0.72)";
        NK.rundtRekt(ctx, x0, y0, db, dh, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        var mv = 34, mh = 12, mo = 26, mb = 22;
        var px0 = x0 + mv;
        var px1 = x0 + db - mh;
        var py0 = y0 + mo;
        var py1 = y0 + dh - mb;

        var pStjerne = this.ligevaegtspris();
        var pMin = Math.max(0.5, pStjerne / 2.4);
        var pMaks = pStjerne * 2.4;
        var qMaks = Math.max(this.efterspoergsel(pMin), this.udbud(pMaks)) * 1.05;

        function tilX(q) { return px0 + NK.klamp(q / qMaks, 0, 1) * (px1 - px0); }
        function tilY(p) { return py1 - NK.klamp((p - pMin) / (pMaks - pMin), 0, 1) * (py1 - py0); }

        /* Akser */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px0, py0 - 4);
        ctx.lineTo(px0, py1);
        ctx.lineTo(px1, py1);
        ctx.stroke();

        NK.tekst(ctx, "pris", px0 - 4, py0 - 8, {
            justering: "right", farve: "#9aa3ad", kant: false, font: "10px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "mængde", px1, py1 + 13, {
            justering: "right", farve: "#9aa3ad", kant: false, font: "10px 'Segoe UI', sans-serif"
        });

        /* Kurver */
        var trin = 24, i, p, q;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#e6892a";
        ctx.beginPath();
        for (i = 0; i <= trin; i++) {
            p = pMin + (pMaks - pMin) * i / trin;
            q = this.efterspoergsel(p);
            if (i === 0) ctx.moveTo(tilX(q), tilY(p)); else ctx.lineTo(tilX(q), tilY(p));
        }
        ctx.stroke();

        ctx.strokeStyle = "#3d9ee0";
        ctx.beginPath();
        for (i = 0; i <= trin; i++) {
            p = pMin + (pMaks - pMin) * i / trin;
            q = this.udbud(p);
            if (i === 0) ctx.moveTo(tilX(q), tilY(p)); else ctx.lineTo(tilX(q), tilY(p));
        }
        ctx.stroke();

        /* Nuvaerende pris */
        var yNu = tilY(this.pris);
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = "#f2c53d";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px0, yNu);
        ctx.lineTo(px1, yNu);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#e6892a";
        ctx.beginPath();
        ctx.arc(tilX(this.efterspoergsel(this.pris)), yNu, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3d9ee0";
        ctx.beginPath();
        ctx.arc(tilX(this.udbud(this.pris)), yNu, 3.4, 0, Math.PI * 2);
        ctx.fill();

        /* Krydset = ligevaegten */
        var qStjerne = this.udbud(pStjerne);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(tilX(qStjerne), tilY(pStjerne), 4.2, 0, Math.PI * 2);
        ctx.fill();

        NK.tekst(ctx, "Udbud", px1 - 4, py0 + 4, {
            justering: "right", farve: "#3d9ee0", kant: false, font: "700 10px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "Efterspørgsel", px1 - 4, py0 + 17, {
            justering: "right", farve: "#e6892a", kant: false, font: "700 10px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "Ligevægt: " + NK.tal(pStjerne, 2) + " kr.", x0 + db / 2, y0 + dh - 6, {
            justering: "center", farve: "#e8edf2", kant: false, font: "600 11px 'Segoe UI', sans-serif"
        });
    };
}());
