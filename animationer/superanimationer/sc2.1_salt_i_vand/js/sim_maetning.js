/* =====================================================================
   sim_maetning.js - fane 2: Mættet opløsning

   Venstre side: et baegerglas med 100 mL vand paa en varmeplade, et
   termometer i glasset og en spatel ovenover. Man haelder salt i, ske
   for ske. Det, der kan vaere der, bliver opløst; resten bliver liggende
   som bundfald. En etiket paa glasset viser Haeldt i, Opløst og Bundfald
   (REGELSAET 22). Temperaturen styres med − og + paa varmepladen
   (REGELSAET 2).

   Hoejre side: saltets oploeselighedskurve paa et lyst papir. Den blaa
   kurve er graensen, den gule stiplede linje er det, man har haeldt i.
   Ligger den gule linje over kurven, er forskellen bundfald. Aksen passer
   til saltet (NaCl 0-60 g, KNO₃ 0-250 g).

   Runde T6 (21. nov. 2026, Niels' ja til forslagene efter REGELSAET):
   panelet er vaek, opgaverne staar i raekken oeverst i fast raekkefoelge
   (js/maet_opgaver.js), og fanen har sit eget salt. Saltet er bestemt af
   opgaven; hylden med de seks salte kommer frem, naar alle fire opgaver
   er loest. Det, der ikke bruges i et trin, er skjult (REGELSAET 19a), og
   det, kortet beder om, har en gul ramme og en boble (REGELSAET 19-20).
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

    var LEX = "'Lexend', 'Segoe UI', sans-serif";
    var PAPIR = "#fbfaf6", PAPIR_KANT = "#d9d4c6";
    var BLAEK = "#1d2433", BLAEK_SVAG = "#4a5160";
    var FARVE_KURVE = "#2a76ac";
    var FARVE_TILSAT = "#b87d00";
    var FARVE_GITTER = "#e7e3d8";
    var FARVE_AKSE = "#8f897b";

    /* Et paent tal at slutte aksen ved */
    var STIGE = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    function rundOp(v) {
        if (!(v > 0)) return 1;
        var tier = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
        var n = v / tier;
        for (var i = 0; i < STIGE.length; i++) if (n <= STIGE[i] + 1e-9) return STIGE[i] * tier;
        return 10 * tier;
    }

    /* Aksen passer til saltet (forslaget til T6): NaCl 0-60 g og KNO₃ 0-250 g,
       saa NaCl-kurven ikke ligger fladt i bunden. De andre efter kurven. */
    var AKSE = { NaCl: 60, KNO3: 250 };
    function saltAkse(salt) {
        return AKSE[salt.id] || rundOp(D.stoersteOploeselighed(salt) * 1.15);
    }

    /* Gram paa etiketten og i grafen: 36 g, 4 g, 68,4 g, 0,0015 g */
    function gramKort(v) {
        if (!isFinite(v)) return "-";
        if (Math.abs(v) < 1e-9) return "0 g";
        if (Math.abs(v) < 0.1) return NK.gram(v) + " g";
        var r = Math.round(v * 10) / 10;
        return NK.tal(r, Math.abs(r - Math.round(r)) < 1e-9 ? 0 : 1) + " g";
    }
    NK.gramKort = gramKort;

    NK.SimMaetning = function () {
        this.L = new NK.Laerred(NK.el("maet-laerred"));
        this.saltId = "NaCl";
        this.temp = 20;
        this.visTemp = 20;          /* termometerets soejle foelger blodt efter */
        this.tilsat = 0;
        this.prikker = [];
        this.korn = [];
        this.bunke = 0;
        this.prikUr = 0;
        this.svaev = null;          /* temperaturen under musen, naar den er over grafen */
        this.traekker = false;
        this.haeld = null;          /* spatlens bevaegelse, mens der haeldes */
        this.gentag = null;         /* − eller + holdes nede */

        this.koblKnapper();
        this.koblMus();
        this.tilpas();
        this.tid = 0;               /* et ur, der altid gaar (bruges af laereren) */
        if (this.laererStart) this.laererStart();
        this.opgaver = new NK.MaetOpgaver(this, NK.SimMaetning.OPGAVER);
        this.opdaterScene();
    };

    var P = NK.SimMaetning.prototype;

    P.salt = function () { return D.salt(this.saltId); };

    /* Et nyt salt giver et tomt glas */
    P.saetSalt = function (id) {
        if (id === this.saltId) return;
        this.saltId = D.salt(id).id;
        this.nulstil();
        this.prikker = [];
        this.bunke = 0;
        this.opdaterHylde();
    };

    /* ----- Knapperne i scenen --------------------------------------------- */
    P.koblKnapper = function () {
        var mig = this;

        NK.el("maet-lidt").addEventListener("click", function () {
            if (!mig.opgaver.tillad("lidt")) return;
            mig.haeldI(5);
            mig.opgaver.klikket("lidt");
        });
        NK.el("maet-meget").addEventListener("click", function () {
            if (!mig.opgaver.tillad("meget")) return;
            mig.haeldI(25);
            mig.opgaver.klikket("meget");
        });
        NK.el("maet-toem").addEventListener("click", function () {
            if (!mig.opgaver.tillad("toem")) return;
            mig.nulstil();
        });

        /* − og + paa varmepladen: et klik er 1 °C. Holdes knappen nede,
           gaar det hurtigt, og det stopper af sig selv, naar kortets maal
           er naaet (eleven kan trykke igen). */
        [["maet-koldere", -1, "minus"], ["maet-varmere", 1, "plus"]].forEach(function (k) {
            var b = NK.el(k[0]);
            b.addEventListener("pointerdown", function (e) {
                if (!mig.opgaver.tillad(k[2])) return;
                e.preventDefault();
                mig.trinTemp(k[1]);
                mig.opgaver.klikket(k[2]);
                mig.gentag = { retning: k[1], knap: k[2], ur: 0.42 };
            });
            ["pointerup", "pointerleave", "pointercancel"].forEach(function (h) {
                b.addEventListener(h, function () { mig.gentag = null; });
            });
            /* Tastaturet: Enter og mellemrum paa knappen */
            b.addEventListener("keydown", function (e) {
                if ((e.key === "Enter" || e.key === " ") && mig.opgaver.tillad(k[2])) {
                    e.preventDefault();
                    e.stopPropagation();
                    mig.trinTemp(k[1]);
                    mig.opgaver.klikket(k[2]);
                }
            });
        });

        this.bygHylde();
    };

    P.trinTemp = function (retning) {
        this.saetTemp(Math.round(this.temp) + retning);
    };

    P.saetTemp = function (t) {
        this.temp = NK.klamp(t, 0, 100);
    };

    P.nulstil = function () {
        this.tilsat = 0;
        this.korn = [];
        this.haeld = null;
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

    /* Er spatlen og kornene faerdige? */
    P.haelder = function () { return !!this.haeld || this.korn.length > 0; };

    /* Opgaverne stiller glasset op uden spatel og korn. */
    P.saetTilsat = function (gram) {
        this.tilsat = gram;
        this.korn = [];
        this.haeld = null;
    };

    /* ----- Regnskabet ------------------------------------------------------ */
    P.graense = function () { return D.oploeselighed(this.salt(), this.temp); };
    P.oploest = function () { return Math.min(this.tilsat, this.graense()); };
    P.bundfald = function () { return Math.max(0, this.tilsat - this.graense()); };

    /* ----- Maal ------------------------------------------------------------- */
    /* Kortet staar under opgaveraekken og har en fast plads (REGELSAET 4) */
    NK.kortTopMaet = function () {
        return (window.innerHeight <= 720 ? 42 : 46) + NK.kortZone() + 10;
    };

    P.tilpas = function () {
        if (!this.L.tilpas() && this.lagt) return;
        this.lagt = true;

        var L = this.L;
        var top = NK.kortTopMaet(), bundKant = L.h - 12, H = Math.max(120, bundKant - top);
        var MB = S.MAAL.baegerglas, MP = S.MAAL.varmeplade, MG = S.MAAL.pulverglas;

        /* Stakken oppefra: knapraekke og spatel (OVER), baegerglas,
           varmeplade og − og + under pladen (UNDER). */
        var OVER = 84, UNDER = 50;
        var hoejdePrBredde = 231 / MB.b + 1.2 * MP.h / MP.b;
        var maxB = Math.min(L.b - 32, 1260);
        this.todelt = maxB >= 700;

        var etiketB = L.b >= 1500 ? 172 : 160;
        var bw;
        if (this.todelt) {
            bw = Math.min(340, (H - OVER - UNDER) / hoejdePrBredde, (maxB - 380 - etiketB - 52) / 1.2);
        } else {
            bw = Math.min(240, (H * 0.55 - OVER - UNDER) / hoejdePrBredde, (maxB - etiketB - 12) / 1.2);
        }
        bw = Math.max(bw, 80);
        var s = bw / MB.b;
        var pladeB = bw * 1.2;
        var pladeH = pladeB * MP.h / MP.b;
        var stak = OVER + 231 * s + pladeH + UNDER;
        var gruppeB = etiketB + 12 + pladeB;

        var grafB, x0, y0;
        if (this.todelt) {
            grafB = Math.max(300, Math.min(720, maxB - gruppeB - 52));
            var samlet = gruppeB + 52 + grafB;
            x0 = (L.b - samlet) / 2;
            /* Samlet under kortet: hoejst 40 px luft over forsoeget (REGELSAET 32) */
            y0 = top + Math.min(40, Math.max(0, (H - stak) / 2));
        } else {
            x0 = (L.b - gruppeB) / 2;
            y0 = top;
            grafB = maxB;
        }

        this.etiketB = etiketB;
        this.pladeB = pladeB;
        this.pladeX = x0 + etiketB + 12;
        this.bgB = bw;
        this.bgS = s;
        this.bgX = this.pladeX + pladeB / 2 - bw / 2;
        this.bgY = y0 + OVER;
        this.pladeY = this.bgY + 231 * s;
        this.bordY = this.pladeY + pladeH;
        this.felt = { x: x0, y: y0, b: gruppeB, h: stak };

        /* Glassets inderside - her ligger vandet, bunken og ionerne */
        this.glasX = this.bgX + MB.indV * s;
        this.glasB = (MB.indH - MB.indV) * s;
        this.glasY = this.bgY + 10 * s;
        this.bund = this.bgY + MB.bund * s;
        this.overflade = this.bgY + MB.ml100 * s;
        this.hjoerne = 7 * s;

        /* Termometeret staar i glasset ude til hoejre */
        var MT = S.MAAL.termometer;
        this.termoH = (MB.bund - 6 + 14) * s;
        this.termoB = this.termoH * MT.b / MT.h;
        this.termoX = this.glasX + this.glasB - 24 * s - this.termoB;
        this.termoY = this.bgY - 14 * s;

        /* Spatlen kommer fra venstre med bladet lidt til venstre for
           glassets midte - vaek fra termometeret. */
        var MS = S.MAAL.spatel;
        this.spatelB = bw * 0.62;
        var ss = this.spatelB / MS.b;
        this.spatelX = this.glasX + this.glasB * 0.45;
        this.spatelY = this.bgY - 34;
        this.spatelPX = this.spatelX - (MS.skaftX - MS.bladX) * ss;
        this.spatelPY = this.spatelY;

        /* Etiketten sidder paa glassets venstre side, over vandet */
        this.etiketX = this.bgX + 16 * s - etiketB;
        this.etiketY = this.bgY + 26 * s;

        /* Pulverglasset staar paa bordet til venstre for varmepladen */
        this.krukkeB = Math.min(bw * 0.38, etiketB - 30);
        this.krukkeH = this.krukkeB * MG.h / MG.b;
        this.krukkeX = this.pladeX - this.krukkeB - 14;
        this.krukkeY = this.bordY - this.krukkeH;

        /* Grafens papir og selve plottet */
        if (this.todelt) {
            this.papir = { x: x0 + gruppeB + 52, y: y0 + 4, b: grafB, h: stak - 4 };
        } else {
            var gy = y0 + stak + 12;
            this.papir = { x: (L.b - maxB) / 2, y: gy, b: maxB, h: Math.max(160, bundKant - gy) };
        }
        var pp = this.papir;
        this.graf = { x: pp.x + 64, y: pp.y + 52, b: Math.max(60, pp.b - 64 - 26), h: Math.max(60, pp.h - 52 - 58) };

        this.positionerOverlays();
    };

    /* Laereren stiller sig foran kurven, hvor der ingen knapper er */
    P.laererPladsPx = function () {
        return this.todelt ? this.papir.x + this.papir.b * 0.3 : this.felt.x + this.felt.b * 0.32;
    };

    /* De rigtige HTML-knapper og etiketten flyttes med glasset */
    P.positionerOverlays = function () {
        var knapper = NK.el("maet-glasknapper");
        knapper.style.left = (this.glasX + this.glasB / 2) + "px";
        knapper.style.top = (this.spatelY - 36) + "px";

        var plade = NK.el("maet-plade");
        plade.style.left = (this.pladeX + this.pladeB / 2) + "px";
        plade.style.top = (this.bordY + 9) + "px";

        var et = NK.el("maet-etiket");
        et.style.left = this.etiketX + "px";
        et.style.top = this.etiketY + "px";
        et.style.width = this.etiketB + "px";

        var hylde = NK.el("maet-hylde");
        hylde.style.left = (this.etiketX - 4) + "px";
        hylde.style.width = (this.etiketB - 6) + "px";
        hylde.style.top = (this.etiketY + 132) + "px";
        hylde.style.height = Math.max(60, this.bordY - this.etiketY - 132) + "px";
    };

    /* ----- Hylden med de seks salte (fri leg, naar opgaverne er loest) ----- */
    P.bygHylde = function () {
        var mig = this, vaert = NK.el("maet-hylde");
        this.hyldeKnapper = [];
        D.SALTE.forEach(function (salt) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "hg-glas";
            b.title = salt.navn + ": " + salt.hverdag;
            b.setAttribute("aria-label", salt.navn);
            b.innerHTML = '<span class="hg-laag"></span><span class="hg-krop"><span class="hg-formel"></span></span>';
            b.querySelector(".hg-formel").textContent = salt.formel;
            b.addEventListener("click", function () {
                if (!mig.opgaver.tillad("hylde")) return;
                mig.saetSalt(salt.id);
            });
            vaert.appendChild(b);
            mig.hyldeKnapper.push({ el: b, id: salt.id });
        });
        this.opdaterHylde();
    };

    P.opdaterHylde = function () {
        if (!this.hyldeKnapper) return;
        for (var i = 0; i < this.hyldeKnapper.length; i++) {
            var valgt = this.hyldeKnapper[i].id === this.saltId;
            this.hyldeKnapper[i].el.classList.toggle("valgt", valgt);
            this.hyldeKnapper[i].el.setAttribute("aria-pressed", valgt ? "true" : "false");
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
            return Math.round(NK.klamp(((x - g.x) / g.b) * 100, 0, 100));
        }

        function iGrafen(e) {
            var r = c.getBoundingClientRect();
            var x = e.clientX - r.left, y = e.clientY - r.top;
            var g = mig.graf;
            return x >= g.x - 14 && x <= g.x + g.b + 14 && y >= g.y - 14 && y <= g.y + g.h + 14;
        }

        /* Grafen kan kun traekkes i, naar kortet beder om en handling med
           temperaturen, og i den fri leg (REGELSAET 19a) */
        function kanTraekke() { return mig.opgaver.tillad("graf"); }

        c.addEventListener("pointerdown", function (e) {
            var rk = c.getBoundingClientRect();
            if (mig.laererKlik && mig.laererKlik(e.clientX - rk.left, e.clientY - rk.top)) return;
            if (!iGrafen(e) || !kanTraekke()) {
                /* Scenen er laast, mens kortet spoerger: kortet blinker (REGELSAET 15) */
                if (mig.opgaver.spoerger()) mig.opgaver.blink();
                return;
            }
            mig.traekker = true;
            if (c.setPointerCapture) {
                try { c.setPointerCapture(e.pointerId); } catch (fejl) { /* syntetisk haendelse */ }
            }
            mig.saetTemp(temperaturVed(e));
            mig.svaev = mig.temp;
            mig.opgaver.klikket("graf");
            e.preventDefault();
        });

        c.addEventListener("pointermove", function (e) {
            if (mig.traekker && kanTraekke()) {
                mig.saetTemp(temperaturVed(e));
                mig.svaev = mig.temp;
            } else {
                mig.svaev = iGrafen(e) && kanTraekke() ? temperaturVed(e) : null;
            }
            c.style.cursor = (mig.traekker || (iGrafen(e) && kanTraekke())) ? "crosshair" : "default";
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
        this.tid += dt;
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        var oploest = this.oploest();
        var bundfald = this.bundfald();

        this.visTemp = NK.mod(this.visTemp, this.temp, 6, dt);

        /* − eller + holdes nede: én grad ad gangen, til kortets maal er naaet */
        if (this.gentag) {
            if (!this.opgaver.tillad(this.gentag.knap) || this.opgaver.maalNaaet()) {
                this.gentag = null;
            } else {
                this.gentag.ur -= dt;
                if (this.gentag.ur <= 0) {
                    this.gentag.ur = 0.07;
                    this.trinTemp(this.gentag.retning);
                }
            }
        }

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

        this.opgaver.opdater(dt);
        this.opdaterScene();
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

    /* ----- Etiketten, knapperne og boblen ------------------------------------- */
    function vis(el, ja) {
        if (!el) return;
        if (el.hidden === !ja) return;
        el.hidden = !ja;
    }

    P.opdaterScene = function () {
        var op = this.opgaver;
        if (!op) return;

        /* Mens Kemichael er paa scenen (ros efter fanen), traeder etiketten
           og knapperne et oejeblik tilbage, saa de ikke daekker ham */
        var Lr = this.laerer, UDE = NK.Kemichael ? NK.Kemichael.UDE : -300;
        var fremme = !!Lr && (!!Lr.scene || Lr.x > UDE + 40 || Lr.taleAlfa > 0.01);
        var scene = this.L.canvas.parentNode;
        if (scene.classList.contains("laerer-fremme") !== fremme) scene.classList.toggle("laerer-fremme", fremme);

        /* Etiketten: et tal, kortet spoerger om, staar som "?" (REGELSAET 38) */
        NK.saetTekst("maet-tilsat", op.skjulTal("tilsat") ? "?" : gramKort(this.tilsat));
        NK.saetTekst("maet-oploest", op.skjulTal("oploest") ? "?" : gramKort(this.oploest()));
        NK.saetTekst("maet-bundfald", op.skjulTal("bundfald") ? "?" : gramKort(this.bundfald()));
        NK.saetTekst("maet-temp-tal", Math.round(this.temp) + " °C");

        /* Kun det, kortet beder om, kan klikkes (REGELSAET 19a) */
        vis(NK.el("maet-lidt"), op.tillad("lidt"));
        vis(NK.el("maet-meget"), op.tillad("meget"));
        vis(NK.el("maet-toem"), op.tillad("toem"));
        var minus = NK.el("maet-koldere"), plus = NK.el("maet-varmere");
        minus.classList.toggle("skjult", !op.tillad("minus"));
        plus.classList.toggle("skjult", !op.tillad("plus"));
        minus.tabIndex = op.tillad("minus") ? 0 : -1;
        plus.tabIndex = op.tillad("plus") ? 0 : -1;
        vis(NK.el("maet-hylde"), op.tillad("hylde"));

        /* Klik-opfordringen: gul ramme og en boble ved knappen (REGELSAET 19-20) */
        var o = op.opfordring();
        var KNAP = { lidt: "maet-lidt", meget: "maet-meget", plus: "maet-varmere", minus: "maet-koldere" };
        var TEKST = { lidt: "Klik: +5 g", meget: "Klik: +25 g", plus: "Klik: +", minus: "Klik: −" };
        ["maet-lidt", "maet-meget", "maet-varmere", "maet-koldere"].forEach(function (id) {
            var e = NK.el(id);
            e.classList.toggle("opfordring", !!o && KNAP[o] === id);
        });
        var boble = NK.el("maet-boble");
        if (o && KNAP[o]) {
            var knap = NK.el(KNAP[o]);
            var sc = knap.closest(".scene").getBoundingClientRect();
            var r = knap.getBoundingClientRect();
            NK.saetTekst("maet-boble", TEKST[o]);
            /* Ved varmepladen staar boblen ved siden af knappen, ellers over den */
            var side = o === "plus" ? "hoejre" : (o === "minus" ? "venstre" : "over");
            var bx = side === "hoejre" ? r.right - sc.left + 14 : (side === "venstre" ? r.left - sc.left - 14 : (r.left + r.right) / 2 - sc.left);
            var by = side === "over" ? r.top - sc.top - 12 : (r.top + r.bottom) / 2 - sc.top;
            boble.className = "maet-boble " + side;
            boble.style.left = bx + "px";
            boble.style.top = by + "px";
            vis(boble, r.width > 0);
        } else {
            vis(boble, false);
        }
    };

    /* ----- Tegning ---------------------------------------------------------------- */
    P.tegn = function () {
        var L = this.L, ctx = L.ctx;
        L.ryd("#10131a");
        this.tegnBord(ctx);
        if (this.opgaver.visGraf()) this.tegnGraf(ctx);
        else this.tegnGrafPlads(ctx);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    P.tegnBord = function (ctx) {
        var salt = this.salt();
        var f = this.felt;
        var i;

        /* Bordkanten */
        ctx.save();
        ctx.strokeStyle = "rgba(180, 192, 208, 0.16)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(f.x - 6, this.bordY + 1);
        ctx.lineTo(f.x + f.b + 6, this.bordY + 1);
        ctx.stroke();
        ctx.restore();

        T.varmeplade(ctx, this.pladeX, this.pladeY, this.pladeB, NK.klamp((this.visTemp - 25) / 75, 0, 1), false, {
            varmeVinkel: -2.2 + 4.4 * NK.klamp((this.visTemp - 20) / 80, 0, 1)
        });
        this.tegnIndhold(ctx, salt);
        T.termometer(ctx, this.termoX, this.termoY, this.termoB, this.visTemp);
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
        /* I den fri leg staar hylden med de seks salte, hvor pulverglasset stod */
        if (!this.opgaver.tillad("hylde")) this.tegnKrukke(ctx, salt);
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

        var stoerrelse = 18 * s;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        do {
            ctx.font = "600 " + stoerrelse.toFixed(1) + "px " + LEX;
            if (ctx.measureText(salt.formel).width <= 54 * s) break;
            stoerrelse -= 0.5;
        } while (stoerrelse > 8);
        ctx.fillStyle = "#1f2733";
        ctx.fillText(salt.formel, x + MG.etiketX * s, y + (MG.etiketY + 3) * s);
        ctx.restore();
    };

    /* ----- Oploeselighedskurven paa et lyst papir ------------------------------------ */
    P.ymax = function () {
        var salt = this.salt();
        return this.tilsat > 0 ? Math.max(saltAkse(salt), rundOp(this.tilsat * 1.04)) : saltAkse(salt);
    };

    P.tegnPapir = function (ctx) {
        var pp = this.papir;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        NK.rundtRekt(ctx, pp.x, pp.y, pp.b, pp.h, 10);
        ctx.fillStyle = PAPIR;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = PAPIR_KANT;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    };

    /* Foer kurven bruges, staar den som en stiplet ramme med navnet (REGELSAET 13) */
    P.tegnGrafPlads = function (ctx) {
        var pp = this.papir;
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.strokeStyle = "rgba(180, 192, 208, 0.38)";
        ctx.lineWidth = 1.5;
        NK.rundtRekt(ctx, pp.x, pp.y, pp.b, pp.h, 10);
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "Opløselighedskurven", pp.x + pp.b / 2, pp.y + pp.h / 2, {
            justering: "center", linje: "middle", farve: "rgba(200, 210, 222, 0.6)",
            font: "400 17px " + LEX
        });
    };

    P.tegnGraf = function (ctx) {
        var salt = this.salt();
        var g = this.graf;
        var op = this.opgaver;
        var i;

        this.tegnPapir(ctx);

        var ymax = this.ymax();
        var tilX = function (t) { return g.x + (t / 100) * g.b; };
        var tilY = function (v) { return g.y + g.h - (v / ymax) * g.h; };

        /* Aksetitlerne: fede, sorte og med stort forbogstav. Y-titlen staar
           vandret over aksen (Niels' regel for grafer). */
        NK.tekst(ctx, "Opløselighed (g pr. 100 mL vand)", g.x - 44, g.y - 24, {
            farve: BLAEK, font: "600 15px " + LEX
        });

        /* Gitter og y-akse */
        var trin = paentTrin(ymax, 6);
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
            NK.tekst(ctx, NK.tal(v, dec), g.x - 9, y, {
                justering: "right", linje: "middle",
                farve: BLAEK_SVAG, font: "400 13.5px " + LEX
            });
        }
        for (i = 0; i <= 100; i += 20) {
            ctx.strokeStyle = FARVE_GITTER;
            ctx.beginPath();
            ctx.moveTo(tilX(i), g.y);
            ctx.lineTo(tilX(i), g.y + g.h);
            ctx.stroke();
        }
        ctx.restore();

        /* Akserne */
        ctx.save();
        ctx.strokeStyle = FARVE_AKSE;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x, g.y + g.h);
        ctx.lineTo(g.x + g.b, g.y + g.h);
        ctx.stroke();
        ctx.restore();

        for (i = 0; i <= 100; i += 20) {
            NK.tekst(ctx, String(i), tilX(i), g.y + g.h + 19, {
                justering: "center", farve: BLAEK_SVAG, font: "400 13.5px " + LEX
            });
        }
        NK.tekst(ctx, "Temperatur (°C)", g.x + g.b / 2, g.y + g.h + 43, {
            justering: "center", farve: BLAEK, font: "600 15px " + LEX
        });

        /* Selve kurven. Den klippes ved grafens kant. */
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
        ctx.fillStyle = "rgba(42, 118, 172, 0.09)";
        ctx.fill();

        ctx.strokeStyle = FARVE_KURVE;
        ctx.lineWidth = 2.8;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (i = 0; i < punkter.length; i++) {
            if (i === 0) ctx.moveTo(punkter[i][0], punkter[i][1]);
            else ctx.lineTo(punkter[i][0], punkter[i][1]);
        }
        ctx.stroke();
        ctx.restore();

        /* Saltets formel ved kurvens ende, saa man kan se, hvilket salt det er */
        var endeY = tilY(D.oploeselighed(salt, 100));
        var formelY = endeY < g.y + 26 ? endeY + 22 : endeY - 12;
        NK.tekst(ctx, salt.formel, g.x + g.b - 6, NK.klamp(formelY, g.y + 16, g.y + g.h - 8), {
            justering: "right", farve: FARVE_KURVE, font: "600 16px " + LEX,
            kant: true, kantFarve: PAPIR, kantBredde: 5
        });

        /* To ord, der siger, hvad de to omraader betyder (mindst 13,5 px) */
        NK.tekst(ctx, "her bliver der bundfald", g.x + 10, g.y + 20, {
            farve: "#a65a17", font: "500 14px " + LEX, kant: true, kantFarve: PAPIR, kantBredde: 5
        });
        NK.tekst(ctx, "her opløses det hele", g.x + g.b - 10, g.y + g.h - 12, {
            justering: "right", farve: "#2e7a4c",
            font: "500 14px " + LEX, kant: true, kantFarve: PAPIR, kantBredde: 5
        });

        /* Det, man har haeldt i */
        if (this.tilsat > 0) {
            var ty = tilY(this.tilsat);
            ctx.save();
            ctx.strokeStyle = FARVE_TILSAT;
            ctx.lineWidth = 2;
            ctx.setLineDash([7, 5]);
            ctx.beginPath();
            ctx.moveTo(g.x, ty);
            ctx.lineTo(g.x + g.b, ty);
            ctx.stroke();
            ctx.restore();
            /* Maerket staar i den side, hvor aflaesningen ved kurven ikke er. */
            var tilVenstre = tilX(this.temp) > g.x + g.b * 0.5;
            NK.tekst(ctx, "hældt i: " + gramKort(this.tilsat), tilVenstre ? g.x + 10 : g.x + g.b - 10, ty - 8, {
                justering: tilVenstre ? "left" : "right", farve: FARVE_TILSAT,
                font: "500 14px " + LEX, kant: true, kantFarve: PAPIR, kantBredde: 5
            });
        }

        /* Den temperatur, der er valgt */
        var cx = tilX(this.temp);
        var cy = tilY(D.oploeselighed(salt, this.temp));
        ctx.save();
        ctx.strokeStyle = "rgba(184, 125, 0, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, g.y);
        ctx.lineTo(cx, g.y + g.h);
        ctx.stroke();

        ctx.fillStyle = FARVE_KURVE;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, Math.max(g.y, cy), 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        /* Aflaesningen staar ikke fremme, mens kortet spoerger (REGELSAET 38) */
        if (!op.visAflaesning()) return;

        var svaever = this.svaev !== null && this.svaev !== undefined;
        var visT = svaever ? this.svaev : this.temp;
        var visV = D.oploeselighed(salt, visT);
        var vx = tilX(visT), vy = Math.max(g.y, tilY(visV));
        if (svaever) {
            ctx.save();
            ctx.strokeStyle = "rgba(29, 36, 51, 0.35)";
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

        var aflaes = Math.round(visT) + " °C: " + gramKort(visV) + " pr. 100 mL";
        var hoejreSide = vx > g.x + g.b * 0.55;
        var linjeY = this.tilsat > 0 ? tilY(this.tilsat) : null;
        var linjeOver = linjeY !== null && linjeY <= vy + 4 && vy - linjeY < 30;
        var labelY = vy < g.y + 40 || linjeOver ? vy + 24 : vy - 14;
        NK.tekst(ctx, aflaes, hoejreSide ? vx - 12 : vx + 12, labelY, {
            justering: hoejreSide ? "right" : "left",
            farve: BLAEK, font: "500 14px " + LEX, kant: true, kantFarve: PAPIR, kantBredde: 5
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

    NK.SimMaetning.saltAkse = saltAkse;

    /* =====================================================================
       Opgaverne (runde T6, 21. nov. 2026). Fast raekkefoelge, ét salt-
       skift: opgave 1 med NaCl, opgave 2-4 med KNO₃ (REGELSAET 51).
       Hver opgave er en raekke trin (js/maet_opgaver.js):
         valg      et spoergsmaal med tre svar i kortet. De forkerte er
                   fejl, elever laver, og har hver sin forklaring (nej).
         handling  kortet beder eleven om at goere noget med knapperne i
                   scenen (knapper: det, der kan bruges; det foerste faar
                   gul ramme og boble). Kortet gaar selv videre ca. 1 s
                   efter, at maal(sim) er naaet (REGELSAET 33, 39);
                   Indsend svar er reserve og bruger tjek(sim).
       tekst er en kort indledning i almindelig skrift, spm er det
       halvfede spoergsmaal eller den halvfede handling. skjul: tal paa
       etiketten, der staar som "?", mens trinnet spoerger. efter(sim):
       det, der vises i scenen, naar trinnet er loest. grafFra: kurven
       staar som en stiplet ramme indtil dette trin (REGELSAET 13).
       ===================================================================== */
    var KNO3_GRAENSE = Math.ceil(D.temperaturFor(D.salt("KNO3"), 80));   /* 48 °C */

    NK.SimMaetning.OPGAVER = [
        { id: "bundfald", navn: "Bundfald i glasset", grafFra: 2,
          opsaet: function (sim) { sim.saetSalt("NaCl"); sim.nulstil(); sim.saetTemp(20); },
          trin: [
              { type: "handling", knapper: ["lidt"],
                /* +5 g forsvinder, saa snart der ligger bundfald: glasset har 40 g */
                laas: function (sim) { return sim.bundfald() > 0; },
                spm: "Klik på +5 g, til der ligger salt på bunden af glasset.",
                maal: function (sim) { return sim.bundfald() > 0.0001 && !sim.haelder(); },
                tjek: function () { return "Der ligger ikke salt på bunden endnu. Klik på +5 g igen."; },
                hint: ["Knappen +5 g står over skeen ved glasset.",
                    "Hvert klik hælder 5 g NaCl i vandet. Etiketten på glasset viser, hvor meget der er hældt i.",
                    "Bliv ved med at klikke. Ved 40 g ligger der salt på bunden."],
                visSvar: function (sim) { sim.saetTilsat(40); } },
              { type: "valg",
                spm: "Hvor mange gram NaCl kan 100 mL vand højst opløse ved 20 °C?",
                svar: [
                    { t: "40 g", nej: "40 g er det, der er hældt i. De 4 g på bunden er ikke opløst." },
                    { t: "36 g", ok: true },
                    { t: "4 g", nej: "4 g er bundfaldet. Det er den del af saltet, vandet ikke kan opløse." }
                ],
                hint: ["Se på etiketten på glasset.",
                    "Saltet på bunden er ikke opløst. Hvor meget er opløst?",
                    "Der er opløst 36 g NaCl, og mere kan vandet ikke opløse ved 20 °C."],
                slut: "Ved 20 °C kan 100 mL vand højst opløse 36 g NaCl. Opløsningen er mættet, og resten bliver liggende som bundfald." },
              { type: "valg", skjul: ["oploest", "bundfald"],
                opsaet: function (sim) { sim.saetTilsat(50); },
                tekst: "Kurven viser, hvor meget NaCl 100 mL vand højst kan opløse ved hver temperatur.",
                spm: "Hvor mange gram bundfald giver 50 g NaCl i 100 mL vand ved 20 °C?",
                svar: [
                    { t: "14 g", ok: true },
                    { t: "50 g", nej: "50 g er det, der er hældt i. Vandet opløser 36 g af det." },
                    { t: "36 g", nej: "36 g er det, vandet kan opløse. Bundfaldet er resten af de 50 g." }
                ],
                hint: ["Aflæs kurven ved 20 °C.",
                    "Kurven viser 36 g ved 20 °C. Resten af de 50 g bliver liggende.",
                    "50 g − 36 g = 14 g."],
                slut: "Vandet kan opløse 36 g NaCl, så 50 g − 36 g = 14 g bliver liggende som bundfald." }
          ] },

        { id: "aflaes", navn: "Aflæs kurven",
          opsaet: function (sim) { sim.saetSalt("KNO3"); sim.nulstil(); sim.saetTemp(20); },
          trin: [
              /* Den rolige overgang til det nye salt (REGELSAET 42) */
              { type: "valg",
                tekst: "Glasset har nu kaliumnitrat, KNO₃, i stedet for NaCl.",
                spm: "Hvad sker der med opløseligheden af KNO₃, når vandet bliver varmere?",
                svar: [
                    { t: "Den er næsten den samme", nej: "Det gælder NaCl. Kurven for KNO₃ stiger stejlt." },
                    { t: "Den falder", nej: "Kurven for KNO₃ går opad mod højre. Jo varmere vand, jo mere KNO₃ kan opløses." },
                    { t: "Den stiger meget", ok: true }
                ],
                hint: ["Se på kurven for KNO₃.",
                    "Kurven går fra koldt vand til venstre til varmt vand til højre.",
                    "Kurven stiger meget, så opløseligheden stiger meget."],
                slut: "Kurven for KNO₃ stiger stejlt. I varmt vand kan der opløses meget mere KNO₃ end i koldt vand." },
              { type: "valg",
                spm: "Hvor mange gram KNO₃ kan 100 mL vand højst opløse ved 40 °C?",
                svar: [
                    { t: "40 g", nej: "40 er temperaturen. Gå lodret op fra 40 °C til kurven, og aflæs på den lodrette akse." },
                    { t: "64 g", ok: true },
                    { t: "110 g", nej: "110 g er opløseligheden ved 60 °C. Find 40 °C på den vandrette akse." }
                ],
                hint: ["Find 40 °C på den vandrette akse.",
                    "Gå lodret op til kurven og derfra vandret over til den lodrette akse.",
                    "Kurven går gennem ca. 64 g ved 40 °C."],
                efter: function (sim) { sim.saetTemp(40); },
                slut: "Ved 40 °C kan 100 mL vand opløse ca. 64 g KNO₃. Punktet på kurven viser det." }
          ] },

        { id: "varm", navn: "Varm, til alt er opløst",
          opsaet: function (sim) { sim.saetSalt("KNO3"); sim.nulstil(); sim.saetTemp(20); sim.saetTilsat(80); },
          trin: [
              { type: "valg",
                spm: "Hvad sker der med bundfaldet af KNO₃, når vandet i glasset varmes op?",
                svar: [
                    { t: "Det bliver opløst", ok: true },
                    { t: "Der kommer mere bundfald", nej: "Varmt vand kan opløse mere KNO₃ end koldt vand. Se på kurven." },
                    { t: "Bundfaldet er det samme", nej: "Det gælder næsten for NaCl. Kurven for KNO₃ stiger stejlt." }
                ],
                hint: ["Se på kurven for KNO₃.",
                    "Kurven stiger, når temperaturen stiger.",
                    "Varmt vand kan opløse mere KNO₃, så bundfaldet bliver opløst."],
                slut: "Varmt vand kan opløse mere KNO₃, så bundfaldet bliver opløst, når vandet varmes op." },
              { type: "handling", knapper: ["plus", "minus", "graf"],
                spm: "Klik på + på varmepladen, til alt KNO₃ i glasset er opløst.",
                maal: function (sim) { return sim.bundfald() <= 0 && sim.temp <= KNO3_GRAENSE + 2; },
                tjek: function (sim) {
                    var t = Math.round(sim.temp);
                    if (sim.bundfald() > 0) return "Ved " + t + " °C ligger der stadig bundfald i glasset. Klik på + igen.";
                    return "Ved " + t + " °C er alt opløst, men alt KNO₃ kan opløses ved en lavere temperatur. Klik på −.";
                },
                hint: ["Knappen + står under varmepladen. Du kan også holde den nede.",
                    "Se på bundfaldet i glasset og på etiketten.",
                    "Ved " + KNO3_GRAENSE + " °C er alle 80 g KNO₃ opløst."],
                visSvar: function (sim) { sim.saetTemp(KNO3_GRAENSE); },
                slut: "Ved ca. " + KNO3_GRAENSE + " °C kan 100 mL vand netop opløse 80 g KNO₃. Kurven går gennem 80 g ved den temperatur." }
          ] },

        { id: "afkoel", navn: "Afkøling giver bundfald",
          opsaet: function (sim) { sim.saetSalt("KNO3"); sim.nulstil(); sim.saetTemp(60); sim.saetTilsat(100); },
          trin: [
              { type: "valg",
                spm: "Hvor mange gram af de 100 g KNO₃ falder ud som bundfald, når opløsningen køles til 20 °C?",
                svar: [
                    { t: "31,6 g", nej: "31,6 g er det, der kan være opløst ved 20 °C. Bundfaldet er resten af de 100 g." },
                    { t: "68,4 g", ok: true },
                    { t: "100 g", nej: "Noget KNO₃ kan stadig være opløst ved 20 °C. Aflæs kurven ved 20 °C." }
                ],
                hint: ["Aflæs kurven ved 20 °C.",
                    "Ved 20 °C kan 100 mL vand kun opløse 31,6 g KNO₃.",
                    "100 g − 31,6 g = 68,4 g."],
                slut: "Ved 20 °C kan vandet kun opløse 31,6 g KNO₃. Resten, 100 g − 31,6 g = 68,4 g, falder ud." },
              { type: "handling", knapper: ["minus", "plus", "graf"],
                spm: "Klik på − på varmepladen, til vandet er 20 °C.",
                maal: function (sim) { return Math.abs(sim.temp - 20) < 0.5; },
                tjek: function (sim) {
                    return "Vandet er " + Math.round(sim.temp) + " °C. Klik på " + (sim.temp > 20 ? "−" : "+") + ", til der står 20 °C.";
                },
                hint: ["Knappen − står under varmepladen. Du kan også holde den nede.",
                    "Temperaturen står mellem − og +.",
                    "Bliv ved, til der står 20 °C."],
                visSvar: function (sim) { sim.saetTemp(20); },
                slut: "Ved 20 °C ligger 68,4 g KNO₃ som bundfald. Koldt vand kan opløse mindre KNO₃ end varmt vand." }
          ] }
    ];
}());
