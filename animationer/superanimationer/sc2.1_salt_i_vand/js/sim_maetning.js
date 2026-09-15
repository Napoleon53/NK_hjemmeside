/* =====================================================================
   sim_maetning.js - fane 2: hvor meget kan der opløses?

   Venstre side: et baegerglas med 100 mL vand paa en varmeplade, et
   termometer i glasset og en spatel ovenover. Man haelder salt i, ske
   for ske. Det, der kan vaere der, bliver opløst; resten bliver liggende
   som bundfald.

   Hoejre side: saltets oploeselighedskurve. Den blaa kurve er graensen,
   den gule stiplede linje er det, man har haeldt i. Ligger den gule
   linje over kurven, er forskellen bundfald.

   Kurven kan bruges som betjening: klik eller traek i den for at skifte
   temperatur.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegn;
    var S = NK.Sprites;

    var VAND_ML = 100;
    var MAX_PRIKKER = 34;        /* saa mange ionprikker svarer til 40 g opløst */
    var PRIK_GRAM = 40;

    var FARVE_KURVE = "#3d9ee0";
    var FARVE_TILSAT = "#f2c53d";
    var FARVE_AKSE = "rgba(180, 192, 208, 0.34)";
    var FARVE_GITTER = "rgba(150, 165, 185, 0.13)";

    /* Et rundt tal at slutte aksen ved: 1, 2, 2,5 eller 5 gange en
       tierpotens, rundet op. */
    function rundOp(v) {
        if (!(v > 0)) return 1;
        var tier = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
        var n = v / tier;
        var valgt = n <= 1 ? 1 : (n <= 2 ? 2 : (n <= 2.5 ? 2.5 : (n <= 5 ? 5 : 10)));
        return valgt * tier;
    }

    /* Den faelles akse daekker alle saltene, saa ingen kurve bliver klemt
       flad mod kanten, og saltene kan sammenlignes direkte: 0-250 g. */
    var FAELLES_MAKS = rundOp(Math.max.apply(null, D.SALTE.map(function (s) {
        return D.stoersteOploeselighed(s);
    })));

    NK.SimMaetning = function () {
        this.L = new NK.Laerred(NK.el("maet-laerred"));
        this.temp = 20;
        this.visTemp = 20;          /* termometerets soejle foelger blodt efter */
        this.tilsat = 0;
        this.prikker = [];
        this.korn = [];
        this.bunke = 0;
        this.prikUr = 0;
        this.svaev = null;          /* temperaturen under musen, naar den er over grafen */
        this.traekker = false;
        this.sidsteBundfald = 0;
        this.varsel = "";
        this.varselUr = 0;
        this.autoSkala = false;     /* faelles skala som udgangspunkt */
        this.haeld = null;          /* spatlens bevaegelse, mens der haeldes */

        this.koblPanel();
        this.koblMus();
        NK.Valg.paa(this.nulstil.bind(this));
        this.tilpas();
        this.opgaver = new NK.Opgaver("maet", OPGAVER, this);
        this.opdaterPanel();
    };

    var P = NK.SimMaetning.prototype;

    /* ----- Panelet -------------------------------------------------------- */
    P.koblPanel = function () {
        var mig = this;

        NK.Valg.byg(NK.el("maet-saltvalg"));

        var skyder = NK.el("maet-temp");
        skyder.addEventListener("input", function () {
            mig.saetTemp(parseFloat(skyder.value));
        });

        NK.el("maet-lidt").addEventListener("click", function () { mig.haeldI(5); });
        NK.el("maet-meget").addEventListener("click", function () { mig.haeldI(25); });
        NK.el("maet-toem").addEventListener("click", function () { mig.nulstil(); });

        NK.el("maet-skala-knap").addEventListener("click", function () {
            mig.autoSkala = !mig.autoSkala;
        });
    };

    P.saetTemp = function (t) {
        this.temp = NK.klamp(t, 0, 100);
        NK.el("maet-temp").value = String(Math.round(this.temp));
    };

    P.nulstil = function () {
        this.tilsat = 0;
        this.korn = [];
        this.haeld = null;
        this.varsel = "";
        this.varselUr = 0;
        this.sidsteBundfald = 0;
    };

    /* Et dryp salt ned i glasset. Kornene og spatlen er kun til pynt -
       regnskabet ligger i this.tilsat og er rigtigt med det samme. */
    P.haeldI = function (gram) {
        this.tilsat += gram;
        this.haeld = { tid: 0 };
        var antal = gram <= 5 ? 9 : 22;
        for (var i = 0; i < antal; i++) {
            this.korn.push({
                vent: 0.14 + (i / antal) * 0.36,
                x: 0, y: 0, vx: 0, fart: 0,
                spredning: Math.random() - 0.5,
                drej: Math.random() * Math.PI,
                str: 2.2 + Math.random() * 2.4
            });
        }
    };

    /* Opgaverne stiller glasset op uden spatel og korn. */
    P.saetTilsat = function (gram) {
        this.tilsat = gram;
        this.korn = [];
        this.haeld = null;
        this.sidsteBundfald = this.bundfald();
    };

    /* ----- Regnskabet ------------------------------------------------------ */
    P.graense = function () { return D.oploeselighed(NK.Valg.salt(), this.temp); };
    P.oploest = function () { return Math.min(this.tilsat, this.graense()); };
    P.bundfald = function () { return Math.max(0, this.tilsat - this.graense()); };

    /* ----- Maal ------------------------------------------------------------- */
    P.tilpas = function () {
        if (!this.L.tilpas() && this.lagt) return;
        this.lagt = true;

        var L = this.L;
        this.todelt = L.b >= 640;

        var glasFelt, grafFelt;
        if (this.todelt) {
            glasFelt = { x: 0, y: 0, b: L.b * 0.44, h: L.h };
            grafFelt = { x: L.b * 0.44, y: 0, b: L.b * 0.56, h: L.h };
        } else {
            glasFelt = { x: 0, y: 0, b: L.b, h: L.h * 0.50 };
            grafFelt = { x: 0, y: L.h * 0.50, b: L.b, h: L.h * 0.50 };
        }
        this.felt = glasFelt;

        /* Stakken oppefra: knapraekke og spatel, baegerglas, varmeplade
           og til sidst en linje tekst under bordet. */
        var MB = S.MAAL.baegerglas, MP = S.MAAL.varmeplade, MT = S.MAAL.termometer;
        var OVER = 108, UNDER = 30;
        var hoejdePrBredde = 231 / MB.b + 1.2 * MP.h / MP.b;
        var bw = Math.min(glasFelt.b * 0.56, (glasFelt.h - OVER - UNDER) / hoejdePrBredde, 320);
        bw = Math.max(bw, 80);
        var s = bw / MB.b;
        var stak = OVER + bw * hoejdePrBredde + UNDER;
        var y0 = glasFelt.y + Math.max(6, (glasFelt.h - stak) / 2);

        this.bgB = bw;
        this.bgS = s;
        this.bgX = glasFelt.x + glasFelt.b * 0.57 - bw / 2;
        this.bgY = y0 + OVER;

        this.pladeB = bw * 1.2;
        this.pladeX = this.bgX + bw / 2 - this.pladeB / 2;
        this.pladeY = this.bgY + 231 * s;
        this.bordY = this.pladeY + this.pladeB * MP.h / MP.b;

        /* Glassets inderside - her ligger vandet, bunken og ionerne */
        this.glasX = this.bgX + MB.indV * s;
        this.glasB = (MB.indH - MB.indV) * s;
        this.glasY = this.bgY + 10 * s;
        this.bund = this.bgY + MB.bund * s;
        this.overflade = this.bgY + MB.ml100 * s;
        this.hjoerne = 7 * s;

        /* Termometeret staar i glasset ude til hoejre */
        this.termoH = (MB.bund - 6 + 14) * s;
        this.termoB = this.termoH * MT.b / MT.h;
        this.termoX = this.glasX + this.glasB - 24 * s - this.termoB;
        this.termoY = this.bgY - 14 * s;

        /* Spatlen kommer fra venstre, fra pulverglasset, med bladet lidt
           til venstre for glassets midte - vaek fra termometeret. Den
           drejer om enden af skaftet (spatelPX, spatelPY), saa bladet
           dykker ned i glasset, naar der haeldes. */
        var MS = S.MAAL.spatel;
        this.spatelB = bw * 0.62;
        var ss = this.spatelB / MS.b;
        this.spatelX = this.glasX + this.glasB * 0.45;
        this.spatelY = this.bgY - 34;
        this.spatelPX = this.spatelX - (MS.skaftX - MS.bladX) * ss;
        this.spatelPY = this.spatelY;

        /* Pulverglasset staar paa bordet til venstre for varmepladen */
        var MG = S.MAAL.pulverglas;
        var plads = this.pladeX - glasFelt.x - 20;
        this.krukkeB = Math.min(bw * 0.36, plads);
        if (this.krukkeB < 40) this.krukkeB = 0;
        this.krukkeH = this.krukkeB * MG.h / MG.b;
        this.krukkeX = this.pladeX - this.krukkeB - 10;
        this.krukkeY = this.bordY - this.krukkeH;

        this.graf = {
            x: grafFelt.x + 58,
            y: grafFelt.y + 50,
            b: Math.max(60, grafFelt.b - 58 - 26),
            h: Math.max(60, grafFelt.h - 50 - 48)
        };

        this.positionerOverlays();
    };

    /* Knapraekken over spatlen og skala-knappen over grafen er rigtige
       HTML-knapper, der flyttes med, naar glasset eller grafen flytter sig. */
    P.positionerOverlays = function () {
        var knapper = NK.el("maet-glasknapper");
        if (knapper) {
            knapper.style.left = (this.glasX + this.glasB / 2) + "px";
            knapper.style.top = (this.spatelY - 36) + "px";
        }
        var skalaKnap = NK.el("maet-skala-knap");
        if (skalaKnap) {
            skalaKnap.style.left = (this.graf.x + this.graf.b) + "px";
            skalaKnap.style.top = (this.graf.y - 34) + "px";
        }
    };

    /* ----- Musen over grafen ------------------------------------------------ */
    P.koblMus = function () {
        var mig = this;
        var c = this.L.canvas;

        function temperaturVed(e) {
            var r = c.getBoundingClientRect();
            var x = e.clientX - r.left;
            var g = mig.graf;
            return NK.klamp(((x - g.x) / g.b) * 100, 0, 100);
        }

        function iGrafen(e) {
            var r = c.getBoundingClientRect();
            var x = e.clientX - r.left, y = e.clientY - r.top;
            var g = mig.graf;
            return x >= g.x - 14 && x <= g.x + g.b + 14 && y >= g.y - 14 && y <= g.y + g.h + 14;
        }

        c.addEventListener("pointerdown", function (e) {
            if (!iGrafen(e)) return;
            mig.traekker = true;
            if (c.setPointerCapture) {
                try { c.setPointerCapture(e.pointerId); } catch (fejl) { /* syntetisk haendelse */ }
            }
            mig.saetTemp(temperaturVed(e));
            mig.svaev = mig.temp;
            e.preventDefault();
        });

        c.addEventListener("pointermove", function (e) {
            if (mig.traekker) {
                mig.saetTemp(temperaturVed(e));
                mig.svaev = mig.temp;
            } else {
                mig.svaev = iGrafen(e) ? temperaturVed(e) : null;
            }
            c.style.cursor = (mig.traekker || iGrafen(e)) ? "crosshair" : "default";
        });

        function slip(e) {
            if (!mig.traekker) return;
            mig.traekker = false;
            if (c.releasePointerCapture) {
                try { c.releasePointerCapture(e.pointerId); } catch (fejl) { /* allerede sluppet */ }
            }
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
        c.addEventListener("pointerleave", function () { if (!mig.traekker) mig.svaev = null; });
    };

    /* ----- Spatlen ------------------------------------------------------------ */
    function blod(t) { return t * t * (3 - 2 * t); }

    /* Vinklen om enden af skaftet: let loeftet i hvile, dykket ned, mens
       der haeldes. Positiv vinkel = bladet nedad. */
    P.spatelVinkel = function () {
        var hvile = -0.06, maks = 0.4;
        if (!this.haeld) return hvile;
        var t = this.haeld.tid;
        if (t < 0.18) return hvile + (maks - hvile) * blod(t / 0.18);
        if (t < 0.58) return maks;
        if (t < 0.92) return maks - (maks - hvile) * blod((t - 0.58) / 0.34);
        return hvile;
    };

    /* Spidsen af bladet, hvor kornene falder fra */
    P.spatelSpids = function () {
        var MS = S.MAAL.spatel;
        var a = this.spatelVinkel();
        var laengde = (MS.skaftX - MS.spidsX) * this.spatelB / MS.b;
        return {
            x: this.spatelPX + laengde * Math.cos(a),
            y: this.spatelPY + laengde * Math.sin(a)
        };
    };

    /* ----- Opdatering -------------------------------------------------------- */
    P.opdater = function (dt) {
        var i;
        var oploest = this.oploest();
        var bundfald = this.bundfald();

        this.visTemp = NK.mod(this.visTemp, this.temp, 6, dt);

        if (this.haeld) {
            this.haeld.tid += dt;
            if (this.haeld.tid > 0.95) this.haeld = null;
        }

        /* Kornene: venter paa bladet, falder, og bremses i vandet */
        for (i = this.korn.length - 1; i >= 0; i--) {
            var k = this.korn[i];
            if (k.vent > 0) {
                k.vent -= dt;
                if (k.vent <= 0) {
                    var spids = this.spatelSpids();
                    k.x = spids.x + k.spredning * 8;
                    k.y = spids.y;
                    k.vx = k.spredning * 26;
                    k.fart = 20;
                }
                continue;
            }
            k.fart += 900 * dt;
            if (k.y > this.overflade) k.fart = Math.min(k.fart, 130);
            k.y += k.fart * dt;
            k.x += k.vx * dt;
            k.drej += dt * 3;
            if (k.y > this.bund - 6 - this.bunke) this.korn.splice(i, 1);
        }

        /* Ionprikkerne i vandet foelger den opløste maengde, men flytter sig
           kun én ad gangen, saa det ser ud som en oploesning, der sker. */
        var maal = Math.round(NK.klamp(oploest / PRIK_GRAM, 0, 1) * MAX_PRIKKER);
        this.prikUr += dt;
        if (this.prikUr > 0.05) {
            this.prikUr = 0;
            if (this.prikker.length < maal) this.prikker.push(this.nyPrik());
            else if (this.prikker.length > maal) this.prikker.pop();
        }

        var venstre = this.glasX + 12, hoejre = this.termoX - 10;
        for (i = 0; i < this.prikker.length; i++) {
            var p = this.prikker[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x < venstre) { p.x = venstre; p.vx = Math.abs(p.vx); }
            if (p.x > hoejre) { p.x = hoejre; p.vx = -Math.abs(p.vx); }
            if (p.y < this.overflade + 10) { p.y = this.overflade + 10; p.vy = Math.abs(p.vy); }
            if (p.y > this.bund - 12 - this.bunke) { p.y = this.bund - 12 - this.bunke; p.vy = -Math.abs(p.vy); }
        }

        /* Bunken i bunden */
        this.bunke = NK.mod(this.bunke, this.bunkeHoejde(bundfald), 4, dt);

        /* Faldt der noget ud, fordi vandet blev koldere? */
        var kornPaaVej = this.korn.length > 0;
        if (bundfald > this.sidsteBundfald + 0.02 && !kornPaaVej && !this.haeld) {
            this.varsel = "Der falder salt ud igen: koldere vand kan ikke rumme lige så meget.";
            this.varselUr = 3.2;
        } else if (bundfald < this.sidsteBundfald - 0.02 && bundfald <= 0.001 && this.tilsat > 0) {
            this.varsel = "Nu er alt saltet opløst.";
            this.varselUr = 2.6;
        }
        this.sidsteBundfald = bundfald;
        if (this.varselUr > 0) {
            this.varselUr -= dt;
            if (this.varselUr <= 0) this.varsel = "";
        }

        this.opgaver.opdater();
        this.opdaterPanel();
    };

    P.nyPrik = function () {
        var venstre = this.glasX + 14, hoejre = this.termoX - 12;
        return {
            x: venstre + Math.random() * Math.max(10, hoejre - venstre),
            y: this.overflade + 12 + Math.random() * Math.max(10, this.bund - this.overflade - 28),
            vx: (Math.random() - 0.5) * 24,
            vy: (Math.random() - 0.5) * 24,
            positiv: Math.random() < 0.5
        };
    };

    /* Kvadratroden, saa de smaa maengder ogsaa kan ses. Et par gram
       sølvchlorid skal vaere synligt, uden at 150 g vokser ud af glasset. */
    P.bunkeHoejde = function (gram) {
        var maks = (this.bund - this.overflade) * 0.42;
        return maks * Math.sqrt(NK.klamp(gram / 80, 0, 1));
    };

    /* ----- Panelteksten -------------------------------------------------------- */
    P.opdaterPanel = function () {
        var salt = NK.Valg.salt();
        var tung = D.erTung(salt);
        var graense = this.graense();
        var oploest = this.oploest();
        var bundfald = this.bundfald();
        var maettet = this.tilsat > 0 && bundfald > 0.0000005;

        NK.saetTekst("maet-temp-tal", Math.round(this.temp) + " °C");
        NK.saetTekst("maet-navn", salt.navn);
        NK.saetTekst("maet-hverdag", salt.hverdag);
        NK.saetTekst("maet-type", tung ? "tungtopløseligt" : "letopløseligt");
        NK.saetKlasse("maet-type", "maerke " + (tung ? "orange" : "groen"));

        NK.saetTekst("maet-tilsat", NK.gram(this.tilsat) + " g");
        NK.saetTekst("maet-oploest", NK.gram(oploest) + " g");
        NK.saetTekst("maet-bundfald", NK.gram(bundfald) + " g");
        NK.saetTekst("maet-graense", NK.gram(graense) + " g");

        NK.saetTekst("maet-maerke", maettet ? "mættet" : (this.tilsat > 0 ? "umættet" : "tomt glas"));
        NK.saetKlasse("maet-maerke", "maerke " + (maettet ? "orange" : "groen"));

        NK.saetTekst("maet-skala-knap", this.autoSkala ? "Fælles skala" : "Skaler til stoffet");

        var besked, klasse = "besked";
        if (this.tilsat === 0) {
            besked = "100 mL vand. Hæld salt i, og se, hvor meget der kan være.";
        } else if (!maettet) {
            besked = "Det hele er opløst. Der er plads til " + NK.gram(graense - this.tilsat) + " g mere.";
            klasse = "besked god";
        } else {
            besked = "Opløsningen er mættet. " + NK.gram(oploest) + " g er opløst, og " +
                     NK.gram(bundfald) + " g ligger som bundfald.";
            klasse = "besked gul";
        }
        NK.saetTekst("maet-besked", besked);
        NK.saetKlasse("maet-besked", klasse);

        NK.saetTekst("maet-status", this.varsel || this.statusTekst(salt, tung, maettet));
    };

    P.statusTekst = function (salt, tung, maettet) {
        if (this.tilsat === 0) {
            return tung
                ? "Der kan kun opløses " + NK.gram(this.graense()) + " g " + salt.formel + " i 100 mL vand."
                : "Der kan opløses " + NK.gram(this.graense()) + " g " + salt.formel + " i 100 mL vand ved " +
                  Math.round(this.temp) + " °C.";
        }
        if (maettet) return "Alt over kurven bliver liggende i bunden.";
        return "Under kurven: der er stadig plads til mere salt i vandet.";
    };

    /* ----- Tegning ---------------------------------------------------------------- */
    P.tegn = function () {
        var L = this.L, ctx = L.ctx;
        L.ryd("#10131a");
        this.tegnBord(ctx);
        this.tegnGraf(ctx);
    };

    P.tegnBord = function (ctx) {
        var salt = NK.Valg.salt();
        var f = this.felt;
        var i;

        /* Bordkanten */
        ctx.save();
        ctx.strokeStyle = "rgba(180, 192, 208, 0.16)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(f.x + 14, this.bordY + 1);
        ctx.lineTo(f.x + f.b - 14, this.bordY + 1);
        ctx.stroke();
        ctx.restore();

        T.varmeplade(ctx, this.pladeX, this.pladeY, this.pladeB, NK.klamp((this.visTemp - 25) / 75, 0, 1), false);
        this.tegnIndhold(ctx, salt);
        this.tegnTermometer(ctx);
        S.tegn(ctx, "baegerglas", this.bgX, this.bgY, this.bgB);

        /* Kornene, der er paa vej ned */
        ctx.save();
        ctx.fillStyle = D.pulverfarve(salt);
        for (i = 0; i < this.korn.length; i++) {
            var k = this.korn[i];
            if (k.vent > 0) continue;
            ctx.save();
            ctx.translate(k.x, k.y);
            ctx.rotate(k.drej);
            ctx.fillRect(-k.str / 2, -k.str / 2, k.str, k.str);
            ctx.restore();
        }
        ctx.restore();

        this.tegnSpatel(ctx, salt);
        this.tegnKrukke(ctx, salt);

        NK.tekst(ctx, VAND_ML + " mL vand", this.glasX + this.glasB / 2, this.bordY + 20, {
            justering: "center", farve: "rgba(200, 212, 226, 0.7)",
            font: "600 12.5px 'Segoe UI', sans-serif"
        });
    };

    /* Vandet, bundfaldet og ionerne - alt det, der ligger bag glasset. */
    P.tegnIndhold = function (ctx, salt) {
        var x0 = this.glasX, x1 = this.glasX + this.glasB;
        var top = this.overflade, bund = this.bund, r = this.hjoerne;
        var i;

        ctx.save();
        T.vandSti(ctx, x0, x1, top, bund, r);

        var v = ctx.createLinearGradient(0, top, 0, bund);
        v.addColorStop(0, "rgba(58, 110, 150, 0.34)");
        v.addColorStop(1, "rgba(30, 66, 96, 0.52)");
        ctx.fillStyle = v;
        ctx.fill();
        if (salt.vandfarve) {
            var toning = NK.klamp(this.oploest() / 60, 0, 1);
            if (toning > 0.01) {
                ctx.globalAlpha = toning * 0.55;
                ctx.fillStyle = salt.vandfarve;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
        ctx.clip();

        /* Bundfaldet: en bunke smaa krystaller */
        if (this.bunke > 0.6) {
            var b = this.bunke;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x0, bund);
            ctx.quadraticCurveTo((x0 + x1) / 2, bund - b * 1.5, x1, bund);
            ctx.closePath();
            ctx.fillStyle = salt.pulver ? "#5b9fc9" : "#c9d3de";
            ctx.globalAlpha = 0.88;
            ctx.fill();
            ctx.clip();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "rgba(30, 40, 54, 0.7)";
            var bredde = Math.max(1, x1 - x0);
            for (i = 0; i < 70; i++) {
                var kx = x0 + ((i * 37) % bredde);
                var ky = bund - ((i * 23) % Math.max(1, b * 1.4));
                ctx.fillRect(kx, ky, 2.4, 2.4);
            }
            ctx.restore();
        }

        for (i = 0; i < this.prikker.length; i++) {
            var p = this.prikker[i];
            NK.ladningsprik(ctx, p.x, p.y, 5.2, p.positiv, 0.92);
        }
        ctx.restore();

        /* Overfladen */
        ctx.save();
        ctx.strokeStyle = "rgba(180, 220, 250, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, top);
        ctx.lineTo(x1, top);
        ctx.stroke();
        ctx.restore();
    };

    P.tegnTermometer = function (ctx) {
        if (!T.termometer(ctx, this.termoX, this.termoY, this.termoB, this.visTemp)) return;
        NK.tekst(ctx, Math.round(this.temp) + " °C", this.termoX + this.termoB / 2, this.termoY - 8, {
            justering: "center", farve: "#f2c53d", font: "700 13px 'Segoe UI', sans-serif", kant: true
        });
    };

    P.tegnSpatel = function (ctx, salt) {
        var MS = S.MAAL.spatel;
        var ss = this.spatelB / MS.b;
        var a = this.spatelVinkel();
        var t = this.haeld ? this.haeld.tid : 1;
        var bunke = t < 0.22 ? 1 : (t < 0.8 ? 0 : NK.klamp((t - 0.8) / 0.12, 0, 1));

        /* Drejet om enden af skaftet og spejlvendt, saa skaftet peger mod
           venstre og bladet mod hoejre. Bladets midte ligger i bx. */
        var bx = -(MS.skaftX - MS.bladX) * ss;
        ctx.save();
        ctx.translate(this.spatelPX, this.spatelPY);
        ctx.rotate(a);
        ctx.scale(-1, 1);
        S.tegn(ctx, "spatel", -MS.skaftX * ss, -MS.bladY * ss, this.spatelB);
        if (bunke > 0) {
            ctx.globalAlpha = bunke;
            ctx.fillStyle = D.pulverfarve(salt);
            ctx.beginPath();
            ctx.moveTo(bx - 15 * ss, -2 * ss);
            ctx.quadraticCurveTo(bx - 8 * ss, -10 * ss, bx, -10 * ss);
            ctx.quadraticCurveTo(bx + 9 * ss, -10 * ss, bx + 14 * ss, -2 * ss);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    };

    P.tegnKrukke = function (ctx, salt) {
        if (!this.krukkeB) return;
        var MG = S.MAAL.pulverglas;
        var s = this.krukkeB / MG.b;
        var x = this.krukkeX, y = this.krukkeY;

        ctx.save();
        ctx.fillStyle = D.pulverfarve(salt);
        ctx.globalAlpha = 0.9;
        NK.rundtRekt(ctx, x + MG.pulverV * s, y + MG.pulverTop * s,
                     (MG.pulverH - MG.pulverV) * s, (MG.pulverBund - MG.pulverTop) * s, 6 * s);
        ctx.fill();
        ctx.restore();

        if (!S.tegn(ctx, "pulverglas", x, y, this.krukkeB)) return;

        var stoerrelse = 17 * s;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        do {
            ctx.font = "700 " + stoerrelse.toFixed(1) + "px 'Segoe UI', sans-serif";
            if (ctx.measureText(salt.formel).width <= 52 * s) break;
            stoerrelse -= 0.5;
        } while (stoerrelse > 8);
        ctx.fillStyle = "#1f2733";
        ctx.fillText(salt.formel, x + MG.etiketX * s, y + (MG.etiketY + 3) * s);
        ctx.restore();
    };

    /* ----- Oploeselighedskurven ----------------------------------------------------- */
    P.ymax = function () {
        var salt = NK.Valg.salt();
        if (this.autoSkala) return rundOp(D.stoersteOploeselighed(salt) * 1.1);
        return Math.max(FAELLES_MAKS, rundOp(this.tilsat * 1.04));
    };

    P.tegnGraf = function (ctx) {
        var salt = NK.Valg.salt();
        var g = this.graf;
        var i;

        var ymax = this.ymax();
        var tilX = function (t) { return g.x + (t / 100) * g.b; };
        var tilY = function (v) { return g.y + g.h - (v / ymax) * g.h; };

        NK.tekst(ctx, "Opløselighed af " + salt.formel, g.x - 46, g.y - 32, {
            farve: "#dde3ea", font: "600 13.5px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "gram pr. 100 mL vand", g.x - 46, g.y - 14, {
            farve: "rgba(150, 158, 170, 0.95)", font: "500 12px 'Segoe UI', sans-serif"
        });

        /* Gitter og y-akse */
        var trin = paentTrin(ymax, 5);
        var dec = decimaler(trin);
        ctx.save();
        ctx.lineWidth = 1;
        for (var n = 0; n * trin <= ymax + trin * 0.001; n++) {
            var v = n * trin;
            var y = tilY(v);
            ctx.strokeStyle = FARVE_GITTER;
            ctx.beginPath();
            ctx.moveTo(g.x, y);
            ctx.lineTo(g.x + g.b, y);
            ctx.stroke();
            NK.tekst(ctx, NK.tal(v, dec), g.x - 8, y, {
                justering: "right", linje: "middle",
                farve: "rgba(169, 176, 186, 0.85)", font: "500 12px 'Segoe UI', sans-serif"
            });
        }
        ctx.restore();

        /* x-akse */
        ctx.save();
        ctx.strokeStyle = FARVE_AKSE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(g.x, g.y + g.h);
        ctx.lineTo(g.x + g.b, g.y + g.h);
        ctx.stroke();
        ctx.restore();

        for (i = 0; i <= 100; i += 20) {
            NK.tekst(ctx, String(i), tilX(i), g.y + g.h + 16, {
                justering: "center", farve: "rgba(169, 176, 186, 0.85)",
                font: "500 12px 'Segoe UI', sans-serif"
            });
        }
        NK.tekst(ctx, "temperatur (°C)", g.x + g.b / 2, g.y + g.h + 35, {
            justering: "center", farve: "rgba(150, 158, 170, 0.95)",
            font: "500 12px 'Segoe UI', sans-serif"
        });

        /* Selve kurven. Den klippes ved grafens kant i stedet for at blive
           klemt fast langs kanten, saa en stigende kurve aldrig ser flad ud. */
        var punkter = [];
        for (i = 0; i <= 100; i += 1) {
            punkter.push([tilX(i), tilY(D.oploeselighed(salt, i))]);
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(g.x, g.y - 2, g.b, g.h + 2);
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(punkter[0][0], g.y + g.h);
        for (i = 0; i < punkter.length; i++) ctx.lineTo(punkter[i][0], punkter[i][1]);
        ctx.lineTo(punkter[punkter.length - 1][0], g.y + g.h);
        ctx.closePath();
        ctx.fillStyle = "rgba(61, 158, 224, 0.14)";
        ctx.fill();

        ctx.strokeStyle = FARVE_KURVE;
        ctx.lineWidth = 2.2;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (i = 0; i < punkter.length; i++) {
            if (i === 0) ctx.moveTo(punkter[i][0], punkter[i][1]);
            else ctx.lineTo(punkter[i][0], punkter[i][1]);
        }
        ctx.stroke();
        ctx.restore();

        /* To ord, der siger, hvad de to omraader betyder */
        NK.tekst(ctx, "her bliver der bundfald", g.x + 8, g.y + 15, {
            farve: "rgba(240, 160, 74, 0.9)",
            font: "600 12px 'Segoe UI', sans-serif", kant: true, kantBredde: 4
        });
        NK.tekst(ctx, "her opløses det hele", g.x + g.b - 8, g.y + g.h - 9, {
            justering: "right", farve: "rgba(126, 224, 168, 0.85)",
            font: "600 12px 'Segoe UI', sans-serif", kant: true, kantBredde: 4
        });

        /* Det, man har haeldt i. Ligger det over grafens kant (kun muligt,
           naar der er zoomet ind paa stoffet), staar det skrevet i toppen. */
        if (this.tilsat > 0) {
            if (this.tilsat <= ymax) {
                var ty = tilY(this.tilsat);
                ctx.save();
                ctx.strokeStyle = FARVE_TILSAT;
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 5]);
                ctx.beginPath();
                ctx.moveTo(g.x, ty);
                ctx.lineTo(g.x + g.b, ty);
                ctx.stroke();
                ctx.restore();
                /* Mærket staar i den side, hvor aflaesningen ved kurven ikke er. */
                var tilVenstre = tilX(this.temp) > g.x + g.b * 0.5;
                NK.tekst(ctx, "hældt i: " + NK.gram(this.tilsat) + " g", tilVenstre ? g.x + 8 : g.x + g.b - 8, ty - 8, {
                    justering: tilVenstre ? "left" : "right", farve: FARVE_TILSAT,
                    font: "600 12px 'Segoe UI', sans-serif", kant: true, kantBredde: 4
                });
            } else {
                NK.tekst(ctx, "hældt i: " + NK.gram(this.tilsat) + " g, over grafens top ↑", g.x + g.b * 0.5, g.y - 2, {
                    justering: "center", farve: FARVE_TILSAT,
                    font: "600 12px 'Segoe UI', sans-serif", kant: true, kantBredde: 4
                });
            }
        }

        /* Den temperatur, der er valgt */
        var cx = tilX(this.temp);
        var cy = tilY(D.oploeselighed(salt, this.temp));
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, g.y);
        ctx.lineTo(cx, g.y + g.h);
        ctx.stroke();

        ctx.fillStyle = FARVE_KURVE;
        ctx.strokeStyle = "#10131a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        /* Aflaesningen: enten der, hvor musen er, ellers ved den valgte
           temperatur. Ligger punktet helt oppe, skrives den under det. */
        var svaever = this.svaev !== null && this.svaev !== undefined;
        var vis = svaever ? this.svaev : this.temp;
        var visV = D.oploeselighed(salt, vis);
        var vx = tilX(vis), vy = tilY(visV);
        if (svaever) {
            ctx.save();
            ctx.strokeStyle = "rgba(226, 234, 242, 0.4)";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.moveTo(vx, g.y);
            ctx.lineTo(vx, g.y + g.h);
            ctx.moveTo(g.x, vy);
            ctx.lineTo(g.x + g.b, vy);
            ctx.stroke();
            ctx.restore();
        }

        var aflaes = Math.round(vis) + " °C:  " + NK.gram(visV) + " g pr. 100 mL";
        var hoejreSide = vx > g.x + g.b * 0.55;
        /* Under punktet, hvis der ikke er plads over det, eller hvis den
           gule linje ligger lige over punktet. */
        var linjeY = this.tilsat > 0 && this.tilsat <= ymax ? tilY(this.tilsat) : null;
        var linjeOver = linjeY !== null && linjeY <= vy + 4 && vy - linjeY < 30;
        var labelY = vy < g.y + 40 || linjeOver ? vy + 22 : vy - 14;
        NK.tekst(ctx, aflaes, hoejreSide ? vx - 10 : vx + 10, labelY, {
            justering: hoejreSide ? "right" : "left",
            farve: "#ffffff", font: "600 12.5px 'Segoe UI', sans-serif", kant: true, kantBredde: 4.5
        });
    };

    /* Et pænt trin til y-aksen: 1, 2, 2,5 eller 5 gange en tierpotens. */
    function paentTrin(omfang, antal) {
        var raat = omfang / Math.max(1, antal);
        if (!(raat > 0)) return 1;
        var tier = Math.pow(10, Math.floor(Math.log(raat) / Math.LN10));
        var n = raat / tier;
        var valgt = n <= 1 ? 1 : (n <= 2 ? 2 : (n <= 2.5 ? 2.5 : (n <= 5 ? 5 : 10)));
        return valgt * tier;
    }

    /* Saa mange decimaler, som trinnet kraever: 50 -> 0, 2,5 -> 1, 0,0005 -> 4 */
    function decimaler(trin) {
        for (var d = 0; d < 8; d++) {
            var v = trin * Math.pow(10, d);
            if (Math.abs(Math.round(v) - v) < 1e-6) return d;
        }
        return 8;
    }

    /* ----- Opgaverne ------------------------------------------------------------ */
    function gramTekst(v) {
        var r = Math.round(v * 10) / 10;
        return NK.tal(r, Math.abs(r - Math.round(r)) < 1e-9 ? 0 : 1) + " g";
    }

    /* Fire talsvar, sorteret stigende. Forkerte tal, der ligger for taet
       paa et andet, springes over. */
    function talValg(rigtig, forkerte) {
        var vaerdier = [rigtig];
        forkerte.forEach(function (v) {
            if (!(v >= 0) || vaerdier.length >= 4) return;
            var fri = vaerdier.every(function (w) {
                return Math.abs(w - v) > Math.max(1.5, 0.08 * Math.max(w, v));
            });
            if (fri) vaerdier.push(v);
        });
        vaerdier.sort(function (a, b) { return a - b; });
        return { valg: vaerdier.map(gramTekst), rigtig: vaerdier.indexOf(rigtig) };
    }

    function opgAflaes() {
        var salt = D.salt(NK.tilfaeldig(["KNO3", "CuSO4", "CaCl2", "NaCl"]));
        var t = NK.tilfaeldig([20, 40, 60, 80]);
        var s = Math.round(D.oploeselighed(salt, t));
        var vt = talValg(s, [
            Math.round(D.oploeselighed(salt, t + 20)),
            t,
            Math.round(D.oploeselighed(salt, t - 20)),
            Math.round(s / 2),
            Math.round(s * 1.5)
        ]);
        return {
            tekst: "Hvor meget " + salt.formel + " kan der højst opløses i 100 mL vand ved " + t + " °C?",
            valg: vt.valg, rigtig: vt.rigtig,
            hint: "Find " + t + " °C på den vandrette akse, gå lodret op til kurven, og aflæs på den lodrette akse.",
            svar: "Ved " + t + " °C kan der opløses ca. " + gramTekst(s) + " " + salt.formel + ".",
            start: function (sim) {
                NK.Valg.saet(salt.id);
                sim.nulstil();
                sim.autoSkala = false;
                sim.saetTemp(t === 20 ? 60 : 20);
            },
            visSvar: function (sim) { sim.saetTemp(t); }
        };
    }

    function opgBundfald() {
        var salt = D.salt(NK.tilfaeldig(["NaCl", "KNO3", "CuSO4"]));
        var t = NK.tilfaeldig([20, 40]);
        var s = D.oploeselighed(salt, t);
        var gram = Math.ceil((s + 6) / 5) * 5 + 5 * Math.floor(Math.random() * 3);
        var rest = Math.round((gram - s) * 10) / 10;
        var vt = talValg(rest, [s, gram, 0]);
        return {
            tekst: "Du hælder " + gram + " g " + salt.formel + " i 100 mL vand ved " + t +
                   " °C. Hvor meget bliver liggende som bundfald?",
            valg: vt.valg, rigtig: vt.rigtig,
            hint: "Aflæs, hvor meget vandet kan rumme ved " + t + " °C. Resten bliver liggende.",
            svar: "Vandet kan rumme " + gramTekst(s) + ", så " + gram + " g − " + gramTekst(s) +
                  " = " + gramTekst(rest) + " bliver liggende.",
            start: function (sim) {
                NK.Valg.saet(salt.id);
                sim.nulstil();
                sim.saetTemp(t);
            },
            visSvar: function (sim) {
                sim.nulstil();
                sim.saetTemp(t);
                sim.haeldI(gram);
            }
        };
    }

    function opgFindTemperatur() {
        var m = NK.tilfaeldig([
            { id: "KNO3",  gram: [40, 50, 60, 80, 100, 120] },
            { id: "CuSO4", gram: [40, 50, 60, 70, 80] },
            { id: "CaCl2", gram: [90, 100, 120, 130] }
        ]);
        var salt = D.salt(m.id);
        var gram = NK.tilfaeldig(m.gram);
        var graense = Math.ceil(D.temperaturFor(salt, gram));
        var startTemp = Math.max(0, graense - 25);
        return {
            tekst: "Der er hældt " + gram + " g " + salt.formel +
                   " i 100 mL vand. Find den laveste temperatur, hvor det hele er opløst.",
            hint: "Find " + gram + " g på den lodrette akse, og gå vandret hen til kurven.",
            svar: "Ved ca. " + graense + " °C kan vandet netop rumme " + gram + " g " + salt.formel +
                  ". Er det koldere, bliver noget liggende.",
            start: function (sim) {
                NK.Valg.saet(salt.id);
                sim.nulstil();
                sim.autoSkala = false;
                sim.saetTemp(startTemp);
                sim.saetTilsat(gram);
            },
            tjek: function (sim) {
                if (NK.Valg.saltId !== salt.id || Math.abs(sim.tilsat - gram) > 0.001) return false;
                if (sim.bundfald() > 0) return false;
                if (sim.temp <= graense + 2) return true;
                return "Alt er opløst, men det kan klares ved en lavere temperatur.";
            },
            visSvar: function (sim) { sim.saetTemp(graense); }
        };
    }

    function opgAfkoeling() {
        var m = NK.tilfaeldig([
            { id: "KNO3",  varm: 60, gram: 100 },
            { id: "KNO3",  varm: 80, gram: 150 },
            { id: "CuSO4", varm: 60, gram: 60 },
            { id: "CuSO4", varm: 80, gram: 80 },
            { id: "CaCl2", varm: 60, gram: 130 }
        ]);
        var salt = D.salt(m.id);
        var kold = 20;
        var s = D.oploeselighed(salt, kold);
        var ud = Math.round((m.gram - s) * 10) / 10;
        var vt = talValg(ud, [s, m.gram, 0]);
        return {
            tekst: m.gram + " g " + salt.formel + " er opløst i 100 mL vand ved " + m.varm +
                   " °C. Hvor meget falder ud, når opløsningen køles til " + kold + " °C?",
            valg: vt.valg, rigtig: vt.rigtig,
            hint: "Aflæs, hvor meget vandet kan rumme ved " + kold + " °C.",
            svar: "Ved " + kold + " °C kan vandet kun rumme " + gramTekst(s) + ". Resten, " + m.gram +
                  " g − " + gramTekst(s) + " = " + gramTekst(ud) + ", falder ud.",
            start: function (sim) {
                NK.Valg.saet(salt.id);
                sim.nulstil();
                sim.autoSkala = false;
                sim.saetTemp(m.varm);
                sim.saetTilsat(m.gram);
            },
            visSvar: function (sim) { sim.saetTemp(kold); }
        };
    }

    var OPGAVER = [opgAflaes, opgBundfald, opgFindTemperatur, opgAfkoeling];
}());
