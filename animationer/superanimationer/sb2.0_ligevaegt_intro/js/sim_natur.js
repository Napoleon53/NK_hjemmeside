/* =====================================================================
   sim_natur.js - rensdyr og foede i balance

   Her staar tallene ogsaa stille, men af en anden grund end paa broen:
   der fodes lige saa mange rensdyr, som der dor. Det kaldes en
   stationaer tilstand (flydende ligevaegt), og den er dynamisk paa
   praecis samme maade som en kemisk ligevaegt: to modsatrettede
   processer koerer lige hurtigt.

       fodselsrate = b_maks * R * m
       dodsrate    = d      * R * (1 + 1,5 * (1 - m))
       m           = F / (F + F_halv)          (maetning: hvor nem
                                                foeden er at finde)

   Bemaerk: det er IKKE en ligevaegtskonstant. Der findes ingen K her -
   balancen flytter sig, hvis baereevnen aendres. Det er netop pointen
   med at sammenligne med broen bagefter.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    NK.SimNatur = function () {
        this.l = new NK.Laerred(NK.el("nat-laerred"));

        this.graf = new NK.Graf(NK.el("nat-graf"), [
            { navn: "Rensdyr", farve: "#e6892a", gruppe: "antal" },
            { navn: "Føde", farve: "#3fae72", gruppe: "antal" },
            { navn: "Fødsler", farve: "#3fae72", gruppe: "fart" },
            { navn: "Dødsfald", farve: "#e05446", gruppe: "fart" }
        ], {
            enheder: { antal: "individer / enheder føde", fart: "dyr pr. tidsenhed" },
            minTop: { fart: 20 }
        });

        /* Modellens konstanter.
           De er valgt, saa balancen naas roligt og uden svingninger:
           foeden skal staa OVER halvdelen af baereevnen i balancepunktet,
           ellers bliver systemet en ustabil spiral, der kredser i stedet
           for at falde til ro. Derfor er baereevnen ogsaa loftet ved
           2200 - over det begynder bestanden at svinge. */
        this.bMaks = 0.18;    // hoejeste fodselsrate pr. rensdyr
        this.dBasis = 0.06;   // dodsrate pr. rensdyr, naar der er rigeligt foede
        this.fHalv = 720;     // foedemaengde hvor halvdelen af maksimum naas
        this.rF = 0.90;       // foedens vaekstrate
        this.graes = 0.87;    // foede spist pr. rensdyr pr. tidsenhed
        this.fart = 1.4;      // gor simulationen lidt hurtigere at se paa

        this.tid = 0;
        this.grafUr = 0;
        this.dyr = [];
        this.fnug = [];
        for (var i = 0; i < 70; i++) {
            this.fnug.push({
                x: Math.random(),
                y: Math.random(),
                v: 0.05 + Math.random() * 0.12,
                s: 0.6 + Math.random() * 0.9,
                d: Math.random() * 6.28
            });
        }

        this.nulstil();
        this.koblKnapper();
    };

    NK.SimNatur.prototype.nulstil = function () {
        this.rensdyr = 200;
        this.foede = 600;
        this.baereevne = 1400;
        this.vFoedsel = 0;
        this.vDoed = 0;
        this.dyr.length = 0;
        this.graf.nulstil();
    };

    NK.SimNatur.prototype.koblKnapper = function () {
        var mig = this;
        NK.el("nat-tilfoej-rensdyr").addEventListener("click", function () { mig.rensdyr += 1000; });
        NK.el("nat-vinter").addEventListener("click", function () { mig.foede *= 0.3; });
        NK.el("nat-mos").addEventListener("click", function () {
            mig.baereevne = Math.min(2200, mig.baereevne + 400);
        });
        NK.el("nat-nulstil").addEventListener("click", function () { mig.nulstil(); });
        NK.grafSkift("nat", this.graf);
    };

    NK.SimNatur.prototype.tilpas = function () {
        this.l.tilpas();
        this.graf.tilpas();
    };

    /* Balancepunktet kan regnes ud i hovedet - vis det, saa eleverne
       kan se, at systemet rammer det tal helt af sig selv. */
    NK.SimNatur.prototype.balance = function () {
        var mStjerne = 2.5 * this.dBasis / (this.bMaks + 1.5 * this.dBasis);
        var fStjerne = this.fHalv * mStjerne / (1 - mStjerne);
        if (fStjerne >= this.baereevne) return { F: fStjerne, R: 0 };
        var rStjerne = this.rF * fStjerne * (1 - fStjerne / this.baereevne) / (this.graes * mStjerne);
        return { F: fStjerne, R: rStjerne };
    };

    /* --------------------------------------------------------------- */
    NK.SimNatur.prototype.opdater = function (dt) {
        var s = dt * this.fart;
        this.tid += dt;

        var m = this.foede / (this.foede + this.fHalv);
        var foedsler = this.bMaks * this.rensdyr * m;
        var doedsfald = this.dBasis * this.rensdyr * (1 + 1.5 * (1 - m));
        var vaekst = this.rF * this.foede * (1 - this.foede / this.baereevne);
        var spist = this.graes * this.rensdyr * m;

        this.rensdyr = Math.max(0, this.rensdyr + (foedsler - doedsfald) * s);
        this.foede = NK.klamp(this.foede + (vaekst - spist) * s, 0, this.baereevne);

        this.vFoedsel = NK.mod(this.vFoedsel, foedsler, 5, dt);
        this.vDoed = NK.mod(this.vDoed, doedsfald, 5, dt);

        /* --- figurer paa skaermen ----------------------------------- */
        var maal = Math.min(90, Math.round(this.rensdyr / 8));
        while (this.dyr.length < maal) {
            this.dyr.push({
                x: 0.05 + Math.random() * 0.9,
                y: Math.random(),
                fart: 0.008 + Math.random() * 0.016,
                retning: Math.random() > 0.5 ? 1 : -1,
                fase: Math.random() * 6.28
            });
        }
        while (this.dyr.length > maal) this.dyr.pop();

        for (var i = 0; i < this.dyr.length; i++) {
            var d = this.dyr[i];
            d.x += d.retning * d.fart * dt;
            if (d.x < 0.04) { d.x = 0.04; d.retning = 1; }
            if (d.x > 0.96) { d.x = 0.96; d.retning = -1; }
            if (Math.random() < 0.0025) d.retning *= -1;
        }

        for (var j = 0; j < this.fnug.length; j++) {
            var f = this.fnug[j];
            f.y += f.v * dt;
            f.x += Math.sin(this.tid * 0.8 + f.d) * 0.0006;
            if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        }

        /* --- panel -------------------------------------------------- */
        var maks = Math.max(20, this.vFoedsel, this.vDoed);
        NK.saetMaaler("nat-vfoedsel-fyld", "nat-vfoedsel-val", this.vFoedsel, maks, 1, "");
        NK.saetMaaler("nat-vdoed-fyld", "nat-vdoed-val", this.vDoed, maks, 1, "");
        NK.saetBadge("nat-badge", this.vFoedsel, this.vDoed, 0.03);

        var bal = this.balance();
        NK.saetTekst("nat-rensdyr", NK.tal(this.rensdyr));
        NK.saetTekst("nat-foede", NK.tal(this.foede));
        NK.saetTekst("nat-maetning", NK.tal(m * 100, 0) + " %");
        NK.saetTekst("nat-baereevne", NK.tal(this.baereevne));
        NK.saetTekst("nat-balance", NK.tal(bal.R) + " rensdyr");

        this.grafUr += dt;
        if (this.grafUr >= 0.18) {
            this.grafUr = 0;
            this.graf.tilfoej([this.rensdyr, this.foede, foedsler, doedsfald]);
        }
    };

    /* --------------------------------------------------------------- */
    NK.SimNatur.prototype.tegn = function () {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var i;
        var jordY = h * 0.60;

        ctx.clearRect(0, 0, b, h);

        /* --- himmel ------------------------------------------------- */
        var himmel = ctx.createLinearGradient(0, 0, 0, jordY);
        himmel.addColorStop(0, "#1b3450");
        himmel.addColorStop(0.6, "#365a7d");
        himmel.addColorStop(1, "#7f9cb5");
        ctx.fillStyle = himmel;
        ctx.fillRect(0, 0, b, jordY);

        /* --- fjelde i baggrunden ------------------------------------ */
        var r = NK.froe(4711);
        ctx.fillStyle = "#2b4763";
        ctx.beginPath();
        ctx.moveTo(0, jordY);
        for (i = 0; i <= 10; i++) {
            var mx = (i / 10) * b;
            var my = jordY - (0.10 + r() * 0.16) * h;
            ctx.lineTo(mx, my);
        }
        ctx.lineTo(b, jordY);
        ctx.closePath();
        ctx.fill();

        /* --- sne paa jorden ----------------------------------------- */
        var jord = ctx.createLinearGradient(0, jordY, 0, h);
        jord.addColorStop(0, "#e7eef4");
        jord.addColorStop(1, "#b9c8d6");
        ctx.fillStyle = jord;
        ctx.beginPath();
        ctx.moveTo(0, jordY + 6);
        ctx.quadraticCurveTo(b * 0.3, jordY - 8, b * 0.62, jordY + 4);
        ctx.quadraticCurveTo(b * 0.85, jordY + 12, b, jordY - 2);
        ctx.lineTo(b, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        /* --- graner ------------------------------------------------- */
        var rt = NK.froe(2024);
        var antalTraeer = Math.max(5, Math.floor(b / 95));
        for (i = 0; i < antalTraeer; i++) {
            var tx = 20 + (i + rt() * 0.7) * ((b - 40) / antalTraeer);
            var st = 44 + rt() * 30;
            NK.Sprites.tegnStaaende(ctx, "gran", tx, jordY + 12 + rt() * 6, st, 1, "#1f7a4f");
        }

        /* --- mos: taettere jo mere foede ---------------------------- */
        var andel = this.foede / this.baereevne;
        var rm = NK.froe(99);
        var pladser = 46;
        for (i = 0; i < pladser; i++) {
            var mxp = 0.02 + rm() * 0.96;
            var myp = rm();
            var traerskel = i / pladser;
            if (andel <= traerskel) { rm(); continue; }
            var styrke = NK.klamp((andel - traerskel) * 4, 0, 1);
            var my2 = jordY + 26 + myp * (h - jordY - 80);
            NK.Sprites.tegnStaaende(ctx, "mos", mxp * b, my2, 20 + rm() * 12, 0.35 + styrke * 0.65, "#5f9e52");
        }

        /* --- rensdyr ------------------------------------------------ */
        for (i = 0; i < this.dyr.length; i++) {
            var d = this.dyr[i];
            var dx = d.x * b;
            var dy = jordY + 30 + d.y * (h - jordY - 86) + Math.sin(this.tid * 5 + d.fase) * 1.2;
            var dbred = 30 + d.y * 14;
            var dhoej = NK.Sprites.hoejde("rensdyr", dbred);
            ctx.save();
            ctx.translate(dx, dy - dhoej / 2);
            if (d.retning < 0) ctx.scale(-1, 1);
            NK.Sprites.tegn(ctx, "rensdyr", 0, 0, dbred, 0, 1, "#9c6739");
            ctx.restore();
        }

        /* --- snefnug ------------------------------------------------ */
        for (i = 0; i < this.fnug.length; i++) {
            var f = this.fnug[i];
            NK.Sprites.tegn(ctx, "snefnug", f.x * b, f.y * h, 6 * f.s, 0, 0.55 + f.s * 0.25, "#ffffff");
        }

        /* --- overskrifter ------------------------------------------- */
        NK.tekst(ctx, "Rensdyr: " + NK.tal(this.rensdyr), 18, 30, {
            farve: "#ffd79a", font: "700 18px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "Føde: " + NK.tal(this.foede) + " af " + NK.tal(this.baereevne), 18, 52, {
            farve: "#a8e6bd", font: "600 14px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "1 figur ≈ 8 rensdyr", 18, h - 46, {
            farve: "#5c6b7a", font: "11px 'Segoe UI', sans-serif"
        });

        this.graf.tegn();
    };
}());
