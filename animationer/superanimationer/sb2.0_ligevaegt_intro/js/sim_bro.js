/* =====================================================================
   sim_bro.js - Lillebaeltsbroerne som dynamisk ligevaegt

   Modellen er den samme foerste ordens kinetik som en kemisk ligevaegt:

       hastighed frem    = k_frem    * antal biler paa Fyn
       hastighed tilbage = k_tilbage * antal biler i Jylland

   Naar de to hastigheder er lige store, staar tallene stille, selvom
   bilerne stadig koerer. Saetter man dem lig hinanden, faas

       n(Jylland) / n(Fyn) = k_frem / k_tilbage = K

   Derfor vender systemet tilbage til det SAMME forhold - ikke de samme
   tal - naar man haelder flere biler i den ene ende.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var BILER = ["bilBlaa", "bilHvid", "bilRoed", "bilGroen"];
    var BILER_J = ["bilOrange", "bilHvid", "bilRoed", "bilGroen"];

    NK.SimBro = function () {
        this.l = new NK.Laerred(NK.el("bro-laerred"));

        this.graf = new NK.Graf(NK.el("bro-graf"), [
            { navn: "Fyn", farve: "#3d9ee0", gruppe: "antal" },
            { navn: "Jylland", farve: "#e6892a", gruppe: "antal" },
            { navn: "v frem", farve: "#3d9ee0", gruppe: "fart" },
            { navn: "v tilbage", farve: "#e6892a", gruppe: "fart" }
        ], {
            enheder: { antal: "biler", fart: "biler/s" },
            minTop: { fart: 2 }
        });

        this.kFrem = 0.06;
        this.kTilbage = 0.02;

        this.tid = 0;
        this.grafUr = 0;
        this.rest = { frem: 0, tilbage: 0 };
        this.vVist = { frem: 0, tilbage: 0 };
        this.paaVej = [];

        this.nulstil();
        this.koblKnapper();
    };

    NK.SimBro.prototype.nulstil = function () {
        this.nFyn = 180;
        this.nJyl = 20;
        this.paaVej.length = 0;
        this.rest.frem = 0;
        this.rest.tilbage = 0;
        this.vVist.frem = 0;
        this.vVist.tilbage = 0;
        this.graf.nulstil();
    };

    NK.SimBro.prototype.koblKnapper = function () {
        var mig = this;

        NK.el("bro-tilfoej-fyn").addEventListener("click", function () { mig.nFyn += 50; });
        NK.el("bro-tilfoej-jyl").addEventListener("click", function () { mig.nJyl += 50; });
        NK.el("bro-fjern-fyn").addEventListener("click", function () { mig.nFyn = Math.max(0, mig.nFyn - 50); });
        NK.el("bro-fjern-jyl").addEventListener("click", function () { mig.nJyl = Math.max(0, mig.nJyl - 50); });
        NK.el("bro-nulstil").addEventListener("click", function () { mig.nulstil(); });

        function skyder(id, saet) {
            var s = NK.el(id);
            s.addEventListener("input", function () { saet(parseFloat(s.value)); });
            saet(parseFloat(s.value));
        }
        skyder("bro-kfrem", function (v) { mig.kFrem = v; });
        skyder("bro-ktilbage", function (v) { mig.kTilbage = v; });

        NK.grafSkift("bro", this.graf);
    };

    NK.SimBro.prototype.tilpas = function () {
        this.l.tilpas();
        this.graf.tilpas();
    };

    /* --------------------------------------------------------------- */
    NK.SimBro.prototype.opdater = function (dt) {
        this.tid += dt;

        var b = this.l.b;
        var h = this.l.h;
        var xVand0 = b * 0.30;
        var xVand1 = b * 0.70;
        var yBroA = h * 0.34;
        var yBroB = h * 0.62;
        var fart = Math.max(60, (xVand1 - xVand0) / 2.4);

        /* --- afgange fra hver side ---------------------------------- */
        var vFrem = this.kFrem * this.nFyn;
        var vTilbage = this.kTilbage * this.nJyl;

        this.rest.frem += vFrem * dt;
        this.rest.tilbage += vTilbage * dt;

        var antal = Math.floor(this.rest.frem);
        this.rest.frem -= antal;
        antal = Math.min(antal, this.nFyn);
        for (var i = 0; i < antal && this.paaVej.length < 400; i++) {
            this.nFyn--;
            this.paaVej.push({
                x: xVand0 - 14,
                y: yBroA - h * 0.012 + Math.random() * h * 0.024,
                vx: fart * (0.85 + Math.random() * 0.3),
                maalX: xVand1 + 14,
                til: "jyl",
                sprite: BILER[(Math.random() * BILER.length) | 0]
            });
        }

        antal = Math.floor(this.rest.tilbage);
        this.rest.tilbage -= antal;
        antal = Math.min(antal, this.nJyl);
        for (var j = 0; j < antal && this.paaVej.length < 400; j++) {
            this.nJyl--;
            this.paaVej.push({
                x: xVand1 + 14,
                y: yBroB - h * 0.012 + Math.random() * h * 0.024,
                vx: -fart * (0.85 + Math.random() * 0.3),
                maalX: xVand0 - 14,
                til: "fyn",
                sprite: BILER_J[(Math.random() * BILER_J.length) | 0]
            });
        }

        /* --- biler undervejs ---------------------------------------- */
        for (var n = this.paaVej.length - 1; n >= 0; n--) {
            var bil = this.paaVej[n];
            bil.x += bil.vx * dt;
            var fremme = bil.vx > 0 ? (bil.x >= bil.maalX) : (bil.x <= bil.maalX);
            if (fremme) {
                if (bil.til === "jyl") this.nJyl++; else this.nFyn++;
                this.paaVej.splice(n, 1);
            }
        }

        /* --- tal til panelet ---------------------------------------- */
        this.vVist.frem = NK.mod(this.vVist.frem, vFrem, 5, dt);
        this.vVist.tilbage = NK.mod(this.vVist.tilbage, vTilbage, 5, dt);

        var K = this.kFrem / this.kTilbage;
        var Y = this.nFyn > 0 ? this.nJyl / this.nFyn : Infinity;
        var maks = Math.max(2, this.vVist.frem, this.vVist.tilbage);

        NK.saetMaaler("bro-vfrem-fyld", "bro-vfrem-val", this.vVist.frem, maks, 1, "biler/s");
        NK.saetMaaler("bro-vtilbage-fyld", "bro-vtilbage-val", this.vVist.tilbage, maks, 1, "biler/s");
        NK.saetBadge("bro-badge", this.vVist.frem, this.vVist.tilbage, 0.04);
        NK.saetYK("bro-yk-maerke", "bro-y", "bro-kref", Y, K, 2);

        NK.saetTekst("bro-n-fyn", NK.tal(this.nFyn));
        NK.saetTekst("bro-n-jyl", NK.tal(this.nJyl));
        NK.saetTekst("bro-n-bro", NK.tal(this.paaVej.length));
        NK.saetTekst("bro-n-alt", NK.tal(this.nFyn + this.nJyl + this.paaVej.length));
        NK.saetTekst("bro-k", NK.tal(K, 2));
        NK.saetTekst("bro-kfrem-vis", NK.tal(this.kFrem, 3));
        NK.saetTekst("bro-ktilbage-vis", NK.tal(this.kTilbage, 3));

        /* --- graf --------------------------------------------------- */
        this.grafUr += dt;
        if (this.grafUr >= 0.18) {
            this.grafUr = 0;
            this.graf.tilfoej([this.nFyn, this.nJyl, vFrem, vTilbage]);
        }
    };

    /* --------------------------------------------------------------- */
    /* Tegner en haengebro med pyloner, hovedkabel og haengestaenger.   */
    function tegnBro(ctx, x0, x1, y, tyk) {
        var spaend = x1 - x0;
        var px1 = x0 + spaend * 0.27;
        var px2 = x0 + spaend * 0.73;
        var pylonTop = y - tyk * 3.2;

        function kabel(ax, ay, kx, ky, bx, by, t) {
            var u = 1 - t;
            return {
                x: u * u * ax + 2 * u * t * kx + t * t * bx,
                y: u * u * ay + 2 * u * t * ky + t * t * by
            };
        }

        /* Pyloner bag daekket */
        ctx.fillStyle = "#8d99a3";
        ctx.fillRect(px1 - tyk * 0.16, pylonTop, tyk * 0.32, y - pylonTop + tyk);
        ctx.fillRect(px2 - tyk * 0.16, pylonTop, tyk * 0.32, y - pylonTop + tyk);

        /* Haengestaenger */
        ctx.strokeStyle = "rgba(190, 202, 212, 0.75)";
        ctx.lineWidth = 1;
        for (var t = 0.04; t < 1; t += 0.055) {
            var p = kabel(px1, pylonTop, (px1 + px2) / 2, y - tyk * 0.5, px2, pylonTop, t);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, y - tyk * 0.5);
            ctx.stroke();
        }

        /* Hovedkabel */
        ctx.strokeStyle = "#c3ced7";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x0, y - tyk * 0.4);
        ctx.lineTo(px1, pylonTop);
        ctx.quadraticCurveTo((px1 + px2) / 2, y - tyk * 0.5, px2, pylonTop);
        ctx.lineTo(x1, y - tyk * 0.4);
        ctx.stroke();

        /* Broklap */
        ctx.fillStyle = "#5c6570";
        ctx.fillRect(x0, y - tyk * 0.5, spaend, tyk);
        ctx.fillStyle = "#6f7a86";
        ctx.fillRect(x0, y - tyk * 0.5, spaend, tyk * 0.18);
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(x0, y + tyk * 0.36, spaend, tyk * 0.14);
    }

    /* Pil med hastighedstekst over en bro. */
    function tegnPil(ctx, x, y, laengde, mod, farve, tekst) {
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        var x0 = x - laengde / 2 * mod;
        var x1 = x + laengde / 2 * mod;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1 - 8 * mod, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x1 - 10 * mod, y - 6);
        ctx.lineTo(x1 - 10 * mod, y + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        NK.tekst(ctx, tekst, x, y - 12, {
            justering: "center",
            farve: farve,
            font: "700 12px 'Segoe UI', sans-serif"
        });
    }

    NK.SimBro.prototype.tegn = function () {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var i;

        var xVand0 = b * 0.30;
        var xVand1 = b * 0.70;
        var yBroA = h * 0.34;
        var yBroB = h * 0.62;
        var tyk = NK.klamp(h * 0.045, 14, 26);

        ctx.clearRect(0, 0, b, h);

        /* --- vand --------------------------------------------------- */
        var vand = ctx.createLinearGradient(0, 0, 0, h);
        vand.addColorStop(0, "#1f5f8f");
        vand.addColorStop(1, "#15476c");
        ctx.fillStyle = vand;
        ctx.fillRect(xVand0, 0, xVand1 - xVand0, h);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1.4;
        for (i = 0; i < 14; i++) {
            var by = (i / 14) * h + Math.sin(this.tid * 0.7 + i) * 3;
            var bx = xVand0 + ((this.tid * 12 + i * 57) % (xVand1 - xVand0 - 60));
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.quadraticCurveTo(bx + 14, by - 3, bx + 30, by);
            ctx.stroke();
        }

        /* --- land --------------------------------------------------- */
        this.tegnLand(ctx, 0, xVand0, h, "#3f7a4a", "#4d8f57", 11);
        this.tegnLand(ctx, xVand1, b, h, "#3f7a4a", "#4d8f57", 77);

        /* --- broer -------------------------------------------------- */
        tegnBro(ctx, xVand0 - 12, xVand1 + 12, yBroA, tyk);
        tegnBro(ctx, xVand0 - 12, xVand1 + 12, yBroB, tyk);

        NK.tekst(ctx, "Den gamle Lillebæltsbro  →", (xVand0 + xVand1) / 2, yBroA - tyk * 3.9, {
            justering: "center", farve: "#dfe7ee", font: "600 12px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "←  Den nye Lillebæltsbro", (xVand0 + xVand1) / 2, yBroB - tyk * 3.9, {
            justering: "center", farve: "#dfe7ee", font: "600 12px 'Segoe UI', sans-serif"
        });

        /* --- parkerede biler ---------------------------------------- */
        this.tegnParkering(ctx, 0.025 * b, xVand0 - 0.025 * b, h, this.nFyn, 0, "bilBlaa", "#3d9ee0");
        this.tegnParkering(ctx, xVand1 + 0.025 * b, b - 0.025 * b, h, this.nJyl, Math.PI, "bilOrange", "#e6892a");

        /* --- biler undervejs ---------------------------------------- */
        var bilB = NK.klamp(tyk * 1.15, 16, 30);
        for (i = 0; i < this.paaVej.length; i++) {
            var bil = this.paaVej[i];
            NK.Sprites.tegn(ctx, bil.sprite, bil.x, bil.y, bilB,
                bil.vx > 0 ? 0 : Math.PI, 1, "#dfe7ee");
        }

        /* --- hastighedspile ----------------------------------------- */
        var maks = Math.max(2, this.vVist.frem, this.vVist.tilbage);
        var maksPil = (xVand1 - xVand0) * 0.42;
        tegnPil(ctx, (xVand0 + xVand1) / 2, yBroA + tyk * 2.1,
            20 + maksPil * (this.vVist.frem / maks), 1, "#7ec8f5",
            "v(frem) = " + NK.tal(this.vVist.frem, 1) + " biler/s");
        tegnPil(ctx, (xVand0 + xVand1) / 2, yBroB + tyk * 2.1,
            20 + maksPil * (this.vVist.tilbage / maks), -1, "#f5bd7e",
            "v(tilbage) = " + NK.tal(this.vVist.tilbage, 1) + " biler/s");

        /* --- stednavne ---------------------------------------------- */
        NK.tekst(ctx, "FYN", xVand0 * 0.5, 30, {
            justering: "center", farve: "#ffffff", font: "700 20px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "Middelfart", xVand0 * 0.5, 48, {
            justering: "center", farve: "#d5e6d8", font: "13px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "JYLLAND", xVand1 + (b - xVand1) * 0.5, 30, {
            justering: "center", farve: "#ffffff", font: "700 20px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "Fredericia", xVand1 + (b - xVand1) * 0.5, 48, {
            justering: "center", farve: "#d5e6d8", font: "13px 'Segoe UI', sans-serif"
        });

        this.graf.tegn();
    };

    /* Landmasse med et par huse langs kysten. */
    NK.SimBro.prototype.tegnLand = function (ctx, x0, x1, h, moerk, lys, froeTal) {
        var g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, lys);
        g.addColorStop(1, moerk);
        ctx.fillStyle = g;
        ctx.fillRect(x0, 0, x1 - x0, h);

        var r = NK.froe(froeTal);
        var antal = Math.max(3, Math.floor((x1 - x0) / 54));
        for (var i = 0; i < antal; i++) {
            var hx = x0 + 22 + (i + r() * 0.5) * ((x1 - x0 - 40) / antal);
            var hy = h * (0.13 + r() * 0.03);
            NK.Sprites.tegnStaaende(ctx, r() > 0.5 ? "husRoed" : "husGul", hx, hy, 26, 1, "#c0392b");
        }
    };

    /* Parkeringsplads: et gitter af biler, saa "koncentrationen" ses. */
    NK.SimBro.prototype.tegnParkering = function (ctx, x0, x1, h, antal, vinkel, sprite, farve) {
        var y0 = h * 0.18;
        var y1 = h * 0.94;
        var bredde = x1 - x0;

        ctx.fillStyle = "rgba(12, 16, 22, 0.42)";
        NK.rundtRekt(ctx, x0, y0, bredde, y1 - y0, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();

        var celle = NK.klamp(bredde / 12, 12, 22);
        var kolonner = Math.max(1, Math.floor((bredde - 10) / celle));
        var raekker = Math.max(1, Math.floor((y1 - y0 - 26) / celle));
        var plads = kolonner * raekker;
        var vist = Math.min(antal, plads);

        for (var i = 0; i < vist; i++) {
            var kx = x0 + 5 + (i % kolonner) * celle + celle / 2;
            var ky = y0 + 20 + Math.floor(i / kolonner) * celle + celle / 2;
            NK.Sprites.tegn(ctx, sprite, kx, ky, celle * 0.92, vinkel, 1, farve);
        }

        NK.tekst(ctx, NK.tal(antal) + " biler", (x0 + x1) / 2, y0 + 15, {
            justering: "center", farve: farve, font: "700 13px 'Segoe UI', sans-serif"
        });
        if (antal > plads) {
            NK.tekst(ctx, "(viser " + NK.tal(plads) + ")", (x0 + x1) / 2, y1 - 6, {
                justering: "center", farve: "#c9d2da", font: "11px 'Segoe UI', sans-serif"
            });
        }
    };
}());
