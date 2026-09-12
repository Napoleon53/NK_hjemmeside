/* =====================================================================
   sim_maetning.js - fane 2: hvor meget kan der opløses?

   Venstre side: et baegerglas med 100 mL vand. Man haelder salt i, ske
   for ske. Det, der kan vaere der, bliver opløst; resten bliver liggende
   som bundfald.

   Hoejre side: saltets oploeselighedskurve. Den blaa kurve er graensen,
   den gule stiplede linje er det, man har haeldt i. Ligger den gule
   linje over kurven, er forskellen bundfald - det er hele pointen, og
   det er derfor de to ting staar i det samme koordinatsystem.

   Kurven kan bruges som betjening: klik eller traek i den for at skifte
   temperatur.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegn;

    var VAND_ML = 100;
    var MAX_PRIKKER = 34;        /* saa mange ionprikker svarer til 40 g opløst */
    var PRIK_GRAM = 40;

    /* Farverne er de samme som i resten af animationen. Kurven er blaa,
       det man har haeldt i er gult, og de to er ogsaa forskellige at se
       paa: den ene er fuldt optrukket, den anden stiplet, og begge har
       deres navn skrevet paa. */
    var FARVE_KURVE = "#3d9ee0";
    var FARVE_TILSAT = "#f2c53d";
    var FARVE_AKSE = "rgba(180, 192, 208, 0.34)";
    var FARVE_GITTER = "rgba(150, 165, 185, 0.13)";

    NK.SimMaetning = function () {
        this.L = new NK.Laerred(NK.el("maet-laerred"));
        this.temp = 20;
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
        this.autoSkala = false;   /* fast 0-100 g som udgangspunkt */

        this.koblPanel();
        this.koblMus();
        NK.Valg.paa(this.nulstil.bind(this));
        this.tilpas();
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
        this.varsel = "";
        this.varselUr = 0;
        this.sidsteBundfald = 0;
    };

    /* Et dryp salt ned i glasset. Kornene er kun til pynt - regnskabet
       ligger i this.tilsat. */
    P.haeldI = function (gram) {
        this.tilsat += gram;
        var antal = gram <= 5 ? 7 : 18;
        for (var i = 0; i < antal; i++) {
            this.korn.push({
                x: this.glasX + this.glasB * (0.35 + Math.random() * 0.30),
                y: this.glasY - 14 - Math.random() * 34,
                fart: 150 + Math.random() * 90,
                drej: Math.random() * Math.PI,
                str: 2.2 + Math.random() * 2.4
            });
        }
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

        var gb = Math.min(glasFelt.b * 0.62, 210);
        this.glasB = gb;
        this.glasX = glasFelt.x + (glasFelt.b - gb) / 2;
        this.glasY = glasFelt.y + Math.max(52, glasFelt.h * 0.13);  /* plads til knapraden ovenpaa */
        this.glasH = glasFelt.h - (this.glasY - glasFelt.y) - 30;
        this.overflade = this.glasY + Math.max(16, this.glasH * 0.12);
        this.bund = this.glasY + this.glasH;

        this.graf = {
            x: grafFelt.x + 58,
            y: grafFelt.y + 50,
            b: Math.max(60, grafFelt.b - 58 - 26),
            h: Math.max(60, grafFelt.h - 50 - 48)
        };

        this.positionerOverlays();
    };

    /* De to knapraeker (hæld salt i / skaler grafen) er rigtige HTML-
       knapper, der ligger ovenpaa canvas'et - de skal flyttes med, naar
       glasset eller grafen flytter sig. */
    P.positionerOverlays = function () {
        var knapper = NK.el("maet-glasknapper");
        if (knapper) {
            knapper.style.left = (this.glasX + this.glasB / 2) + "px";
            knapper.style.top = (this.glasY - 6) + "px";
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
            c.setPointerCapture(e.pointerId);
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

    /* ----- Opdatering -------------------------------------------------------- */
    P.opdater = function (dt) {
        var i;
        var oploest = this.oploest();
        var bundfald = this.bundfald();

        /* Faldende korn */
        for (i = this.korn.length - 1; i >= 0; i--) {
            var k = this.korn[i];
            k.y += k.fart * dt;
            k.drej += dt * 2;
            if (k.y > this.bund - 10 - this.bunke) this.korn.splice(i, 1);
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

        for (i = 0; i < this.prikker.length; i++) {
            var p = this.prikker[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x < this.glasX + 16) { p.x = this.glasX + 16; p.vx = Math.abs(p.vx); }
            if (p.x > this.glasX + this.glasB - 16) { p.x = this.glasX + this.glasB - 16; p.vx = -Math.abs(p.vx); }
            if (p.y < this.overflade + 12) { p.y = this.overflade + 12; p.vy = Math.abs(p.vy); }
            if (p.y > this.bund - 16 - this.bunke) { p.y = this.bund - 16 - this.bunke; p.vy = -Math.abs(p.vy); }
        }

        /* Bunken i bunden */
        var maalBunke = this.bunkeHoejde(bundfald);
        this.bunke = NK.mod(this.bunke, maalBunke, 4, dt);

        /* Faldt der noget ud, fordi vandet blev koldere? */
        if (bundfald > this.sidsteBundfald + 0.02 && this.korn.length === 0) {
            this.varsel = "Der falder salt ud igen — koldere vand kan ikke rumme lige så meget.";
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

        this.opdaterPanel();
    };

    P.nyPrik = function () {
        return {
            x: this.glasX + 18 + Math.random() * Math.max(10, this.glasB - 36),
            y: this.overflade + 14 + Math.random() * Math.max(10, this.bund - this.overflade - 32),
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

        NK.saetTekst("maet-skala-knap", this.autoSkala ? "Fast skala: 0–100 g" : "Skaler til stoffet");

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
        this.tegnGlas(ctx);
        this.tegnGraf(ctx);
    };

    P.tegnGlas = function (ctx) {
        var salt = NK.Valg.salt();
        var i;

        var toning = salt.vandfarve
            ? NK.klamp(this.oploest() / 60, 0, 1)
            : 0;
        T.glas(ctx, this.glasX, this.glasY, this.glasB, this.glasH,
               this.overflade, salt.vandfarve, toning, { graduering: true });

        /* Bundfaldet: en bunke smaa krystaller */
        if (this.bunke > 0.6) {
            var b = this.bunke;
            var venstre = this.glasX + 4, hoejre = this.glasX + this.glasB - 4;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(venstre, this.bund);
            ctx.quadraticCurveTo(this.glasX + this.glasB * 0.5, this.bund - b * 1.5, hoejre, this.bund);
            ctx.closePath();
            ctx.fillStyle = salt.vandfarve ? "#5b9fc9" : "#c9d3de";
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.clip();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "rgba(30, 40, 54, 0.7)";
            for (i = 0; i < 60; i++) {
                var kx = venstre + ((i * 37) % Math.max(1, hoejre - venstre));
                var ky = this.bund - ((i * 23) % Math.max(1, b * 1.4));
                ctx.fillRect(kx, ky, 2.4, 2.4);
            }
            ctx.restore();
        }

        /* De opløste ioner */
        for (i = 0; i < this.prikker.length; i++) {
            var p = this.prikker[i];
            NK.ladningsprik(ctx, p.x, p.y, 5.2, p.positiv, 0.92);
        }

        /* Kornene, der er paa vej ned */
        ctx.save();
        ctx.fillStyle = salt.vandfarve ? "#7fc0e6" : "#e8eef5";
        for (i = 0; i < this.korn.length; i++) {
            var k = this.korn[i];
            ctx.save();
            ctx.translate(k.x, k.y);
            ctx.rotate(k.drej);
            ctx.fillRect(-k.str / 2, -k.str / 2, k.str, k.str);
            ctx.restore();
        }
        ctx.restore();

        NK.tekst(ctx, VAND_ML + " mL vand", this.glasX + this.glasB / 2, this.bund + 19, {
            justering: "center", farve: "rgba(200, 212, 226, 0.62)",
            font: "600 12px 'Segoe UI', sans-serif"
        });
    };

    /* ----- Oploeselighedskurven ----------------------------------------------------- */
    P.tegnGraf = function (ctx) {
        var salt = NK.Valg.salt();
        var g = this.graf;
        var i;

        /* Som udgangspunkt staar aksen fast paa 0-100 g, saa saltene kan
           sammenlignes direkte. Skala-knappen kan zoome ind paa netop
           dette stof i stedet - noedvendigt for et salt som AgCl, hvor
           0-100 g ellers ville gøre kurven usynlig langs bunden. */
        var ymax = this.autoSkala ? D.stoersteOploeselighed(salt) * 1.16 : 100;
        var tilX = function (t) { return g.x + (t / 100) * g.b; };
        var tilY = function (v) { return g.y + g.h - NK.klamp(v / ymax, 0, 1) * g.h; };

        /* Overskrift og enhed. Kurven er den eneste kurve, saa den har
           ikke brug for en signaturforklaring - den staar i overskriften. */
        NK.tekst(ctx, salt.formel + " — hvor meget kan der opløses?", g.x - 46, g.y - 32, {
            farve: "#dde3ea", font: "600 13.5px 'Segoe UI', sans-serif"
        });
        NK.tekst(ctx, "gram pr. 100 mL vand", g.x - 46, g.y - 14, {
            farve: "rgba(126, 133, 144, 0.95)", font: "500 11.5px 'Segoe UI', sans-serif"
        });

        /* Gitter og y-akse */
        var trin = paentTrin(ymax, 4);
        ctx.save();
        ctx.lineWidth = 1;
        for (var v = 0; v <= ymax + trin * 0.001; v += trin) {
            var y = tilY(v);
            ctx.strokeStyle = FARVE_GITTER;
            ctx.beginPath();
            ctx.moveTo(g.x, y);
            ctx.lineTo(g.x + g.b, y);
            ctx.stroke();
            NK.tekst(ctx, NK.gram(v), g.x - 8, y, {
                justering: "right", linje: "middle",
                farve: "rgba(169, 176, 186, 0.85)", font: "500 11px 'Segoe UI', sans-serif"
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
                font: "500 11px 'Segoe UI', sans-serif"
            });
        }
        NK.tekst(ctx, "temperatur (°C)", g.x + g.b / 2, g.y + g.h + 34, {
            justering: "center", farve: "rgba(126, 133, 144, 0.95)",
            font: "500 11.5px 'Segoe UI', sans-serif"
        });

        /* Selve kurven, punkt for punkt */
        var punkter = [];
        for (i = 0; i <= 100; i += 2) {
            punkter.push([tilX(i), tilY(D.oploeselighed(salt, i))]);
        }

        /* Under kurven kan det hele opløses; over kurven bliver der bundfald. */
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(punkter[0][0], g.y + g.h);
        for (i = 0; i < punkter.length; i++) ctx.lineTo(punkter[i][0], punkter[i][1]);
        ctx.lineTo(punkter[punkter.length - 1][0], g.y + g.h);
        ctx.closePath();
        ctx.fillStyle = "rgba(61, 158, 224, 0.14)";
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = FARVE_KURVE;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (i = 0; i < punkter.length; i++) {
            if (i === 0) ctx.moveTo(punkter[i][0], punkter[i][1]);
            else ctx.lineTo(punkter[i][0], punkter[i][1]);
        }
        ctx.stroke();
        ctx.restore();

        /* Det, man har haeldt i. Ligger maengden over grafens kant, bliver
           linjen liggende lige under kanten med en pil paa. */
        if (this.tilsat > 0) {
            var overKanten = this.tilsat > ymax;
            var ty = overKanten ? g.y + 4 : tilY(this.tilsat);
            ctx.save();
            ctx.strokeStyle = FARVE_TILSAT;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(g.x, ty);
            ctx.lineTo(g.x + g.b, ty);
            ctx.stroke();
            ctx.restore();

            NK.tekst(ctx, "hældt i: " + NK.gram(this.tilsat) + " g" + (overKanten ? " ↑" : ""),
                g.x + 8, overKanten ? ty + 15 : ty - 8, {
                    farve: FARVE_TILSAT,
                    font: "600 11.5px 'Segoe UI', sans-serif", kant: true, kantBredde: 4
                });
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
        ctx.restore();

        ctx.save();
        ctx.fillStyle = FARVE_KURVE;
        ctx.strokeStyle = "#10131a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        /* Aflaesningen: enten der, hvor musen er, ellers ved den valgte
           temperatur. */
        var vis = this.svaev === null || this.svaev === undefined ? this.temp : this.svaev;
        var visV = D.oploeselighed(salt, vis);
        var vx = tilX(vis), vy = tilY(visV);
        if (this.svaev !== null && this.svaev !== undefined) {
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
        NK.tekst(ctx, aflaes, hoejreSide ? vx - 10 : vx + 10, Math.max(g.y + 12, vy - 14), {
            justering: hoejreSide ? "right" : "left",
            farve: "#ffffff", font: "600 12px 'Segoe UI', sans-serif", kant: true, kantBredde: 4.5
        });

        /* To ord, der siger, hvad de to omraader betyder */
        NK.tekst(ctx, "her bliver der bundfald", g.x + g.b - 8, g.y + 15, {
            justering: "right", farve: "rgba(240, 160, 74, 0.9)",
            font: "600 11.5px 'Segoe UI', sans-serif", kant: true, kantBredde: 4
        });
        NK.tekst(ctx, "her opløses det hele", g.x + g.b - 8, g.y + g.h - 9, {
            justering: "right", farve: "rgba(126, 224, 168, 0.85)",
            font: "600 11.5px 'Segoe UI', sans-serif", kant: true, kantBredde: 4
        });
    };

    /* Et pænt trin til y-aksen: 1, 2, 2,5 eller 5 gange en tierpotens.
       Skalaen skal kunne baade 0,0004 g og 250 g. */
    function paentTrin(omfang, antal) {
        var raat = omfang / Math.max(1, antal);
        if (!(raat > 0)) return 1;
        var tier = Math.pow(10, Math.floor(Math.log(raat) / Math.LN10));
        var n = raat / tier;
        var valgt = n <= 1 ? 1 : (n <= 2 ? 2 : (n <= 2.5 ? 2.5 : (n <= 5 ? 5 : 10)));
        return valgt * tier;
    }
}());
