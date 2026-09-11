/* =====================================================================
   sim_isotop.js - fane 2: Isotoper og atommasse

   Hvorfor staar der 35,45 ved chlor i det periodiske system, naar
   ingen enkelt chlorkerne vejer 35,45 u?

   Svaret tegnes som en vippe. Hver isotop haenger som et lod paa en
   massestok, og loddets stoerrelse er dens andel i naturen. Den
   gennemsnitlige atommasse er praecis det sted, hvor vippen balancerer
   - og eleven kan flytte lodderne og se balancepunktet foelge med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var FARVER = ["#3d9ee0", "#e6892a", "#3fae72", "#9b6bd6", "#f2c53d", "#e05446"];

    NK.SimIsotop = function () {
        this.l = new NK.Laerred(NK.el("iso-laerred"));
        this.z = 17;                 /* chlor: skolebogens eksempel */
        this.andele = [];
        this.kerner = [];            /* ét NK.Atom pr. isotop, kun kernen tegnes */
        this.vippe = 0;              /* den tegnede position, glider efter maalet */

        this.byg();
        this.koblKnapper();
    };

    /* ----- Opstilling ------------------------------------------------------ */
    NK.SimIsotop.prototype.grundstof = function () { return D.grundstof(this.z); };

    NK.SimIsotop.prototype.byg = function () {
        var g = this.grundstof();
        var i;

        this.andele = [];
        this.kerner = [];
        for (i = 0; i < g.isotoper.length; i++) {
            this.andele.push(g.isotoper[i].andel);
            var a = new NK.Atom();
            a.saetStraks(g.z, g.isotoper[i].a - g.z, 0);
            this.kerner.push(a);
        }
        this.vippe = D.gennemsnitsmasse(g.isotoper, this.andele);
        this.bygListe();
        this.opdaterTal();
    };

    /* Én raekke pr. isotop med en skyder for andelen. */
    NK.SimIsotop.prototype.bygListe = function () {
        var g = this.grundstof();
        var boks = NK.el("iso-liste");
        var mig = this;
        boks.innerHTML = "";

        for (var i = 0; i < g.isotoper.length; i++) {
            var iso = g.isotoper[i];
            var rad = document.createElement("div");
            rad.className = "isorad";

            var hoved = document.createElement("label");
            var chip = document.createElement("span");
            chip.className = "chip";
            chip.style.backgroundColor = FARVER[i % FARVER.length];
            var navn = document.createElement("span");
            navn.className = "navn";
            navn.textContent = NK.haevet(iso.a) + g.symbol + "  ·  " + (iso.a - g.z) + " neutroner";
            var pct = document.createElement("b");
            pct.className = "pct";
            hoved.appendChild(chip);
            hoved.appendChild(navn);
            hoved.appendChild(pct);

            var skyder = document.createElement("input");
            skyder.type = "range";
            skyder.min = "0";
            skyder.max = "100";
            skyder.step = "0.1";
            skyder.value = String(Math.min(100, iso.andel));
            skyder.setAttribute("aria-label", "Andel af " + g.symbol + "-" + iso.a);

            (function (nr, felt) {
                skyder.addEventListener("input", function () {
                    mig.andele[nr] = parseFloat(this.value);
                    mig.opdaterTal();
                });
            }(i, pct));

            rad.appendChild(hoved);
            rad.appendChild(skyder);
            boks.appendChild(rad);
        }
        this.pctFelter = boks.querySelectorAll(".pct");
        this.skydere = boks.querySelectorAll("input[type=range]");
    };

    NK.SimIsotop.prototype.koblKnapper = function () {
        var mig = this;
        var vaelger = NK.el("iso-grundstof");
        vaelger.innerHTML = "";
        for (var i = 0; i < D.GRUNDSTOFFER.length; i++) {
            var g = D.GRUNDSTOFFER[i];
            var o = document.createElement("option");
            o.value = String(g.z);
            o.textContent = g.navn + " (" + g.symbol + ") — "
                + (g.isotoper.length === 1 ? "1 isotop" : g.isotoper.length + " isotoper");
            vaelger.appendChild(o);
        }
        vaelger.value = String(this.z);
        vaelger.addEventListener("change", function () {
            mig.z = parseInt(this.value, 10);
            mig.byg();
        });

        NK.el("iso-natur").addEventListener("click", function () { mig.tilNaturen(); });
    };

    NK.SimIsotop.prototype.tilNaturen = function () {
        var g = this.grundstof();
        for (var i = 0; i < g.isotoper.length; i++) {
            this.andele[i] = g.isotoper[i].andel;
            if (this.skydere[i]) this.skydere[i].value = String(Math.min(100, g.isotoper[i].andel));
        }
        this.opdaterTal();
    };

    /* ----- Tallene --------------------------------------------------------- */
    NK.SimIsotop.prototype.normaliseret = function () {
        var sum = 0, i;
        for (i = 0; i < this.andele.length; i++) sum += this.andele[i];
        var ud = [];
        for (i = 0; i < this.andele.length; i++) {
            ud.push(sum > 0 ? this.andele[i] / sum * 100 : 0);
        }
        return ud;
    };

    NK.SimIsotop.prototype.opdaterTal = function () {
        var g = this.grundstof();
        var pct = this.normaliseret();
        var masse = D.gennemsnitsmasse(g.isotoper, pct);
        var i;

        for (i = 0; i < this.pctFelter.length; i++) {
            this.pctFelter[i].textContent = NK.tal(pct[i], pct[i] > 0 && pct[i] < 0.1 ? 3 : 1) + " %";
        }

        NK.saetTekst("iso-masse", masse > 0 ? NK.tal(masse, 3) + " u" : "–");
        NK.saetTekst("iso-tabelmasse", NK.tal(g.masse, 3) + " u");

        /* Regnestykket skrevet ud, som man ville goere det i haanden. */
        var led = [], udeladt = 0;
        for (i = 0; i < g.isotoper.length; i++) {
            if (pct[i] < 0.05) { if (pct[i] > 0) udeladt++; continue; }
            led.push(NK.tal(pct[i] / 100, 4) + " · " + NK.tal(g.isotoper[i].masse, 3));
        }
        NK.saetTekst("iso-regnestykke", led.length
            ? led.join("  +  ") + "  =  " + NK.tal(masse, 3) + " u" + (udeladt ? "   (de mindste andele er udeladt)" : "")
            : "Skru op for mindst én isotop.");

        var forskel = Math.abs(masse - g.masse);
        var naturlig = forskel < 0.015;
        NK.saetTekst("iso-afvig", naturlig
            ? "Din blanding er naturens blanding — derfor rammer du præcis den atommasse, der står i det periodiske system."
            : "Din blanding er ikke naturens. Derfor ligger gennemsnittet " + NK.tal(forskel, 3)
              + " u fra den atommasse, der står i det periodiske system.");
        NK.saetKlasse("iso-afvig", naturlig ? "besked god" : "besked gul");

        /* Den korte pointe skifter med, hvad eleven har valgt. */
        var flest = 0;
        for (i = 1; i < pct.length; i++) if (pct[i] > pct[flest]) flest = i;
        NK.saetTekst("iso-forklaring", g.isotoper.length === 1
            ? g.navn + " har kun én isotop i naturen. Derfor ligger atommassen helt tæt på et helt tal — der er ikke noget at tage gennemsnit af."
            : "Gennemsnittet trækkes altid tættest mod den isotop, der er mest af: her "
              + NK.haevet(g.isotoper[flest].a) + g.symbol + " med " + NK.tal(pct[flest], 1) + " %.");

        this.maalVippe = masse;
    };

    /* ----- Tegning ---------------------------------------------------------- */
    NK.SimIsotop.prototype.tilpas = function () { this.l.tilpas(); };

    NK.SimIsotop.prototype.opdater = function (dt) {
        for (var i = 0; i < this.kerner.length; i++) this.kerner[i].opdater(dt);
        if (this.maalVippe) this.vippe = NK.mod(this.vippe, this.maalVippe, 7, dt);
    };

    NK.SimIsotop.prototype.nulstil = function () { this.tilNaturen(); };

    NK.SimIsotop.prototype.tegn = function () {
        var l = this.l, c = l.ctx;
        var g = this.grundstof();
        var pct = this.normaliseret();
        var i;
        l.ryd("#14141a");

        var kerneHoejde = Math.min(190, l.h * 0.42);
        this.tegnKerner(c, l.b, kerneHoejde, pct);

        /* ----- Vippen ----- */
        var margen = Math.max(56, l.b * 0.09);
        var m0 = g.isotoper[0].masse, m1 = m0;
        for (i = 1; i < g.isotoper.length; i++) {
            m0 = Math.min(m0, g.isotoper[i].masse);
            m1 = Math.max(m1, g.isotoper[i].masse);
        }
        var luft = Math.max(0.55, (m1 - m0) * 0.22);
        m0 -= luft; m1 += luft;
        var bredde = l.b - margen * 2;
        function xFor(m) { return margen + (m - m0) / (m1 - m0) * bredde; }

        var yBom = kerneHoejde + (l.h - kerneHoejde) * 0.34;

        /* Massestokken med hakkene */
        c.save();
        NK.rundtRekt(c, margen - 10, yBom - 5, bredde + 20, 10, 5);
        c.fillStyle = "#3d3d4b";
        c.fill();
        c.strokeStyle = "rgba(255, 255, 255, 0.14)";
        c.lineWidth = 1;
        c.stroke();
        c.restore();

        for (var m = Math.ceil(m0); m <= Math.floor(m1); m++) {
            var xm = xFor(m);
            c.beginPath();
            c.moveTo(xm, yBom - 5);
            c.lineTo(xm, yBom - 12);
            c.strokeStyle = "rgba(255, 255, 255, 0.2)";
            c.lineWidth = 1;
            c.stroke();
            NK.tekst(c, String(m), xm, yBom - 17, {
                font: "600 10px 'Segoe UI', sans-serif", justering: "center", linje: "alphabetic", farve: "#7e8590"
            });
        }
        NK.tekst(c, "masse i u", l.b - margen + 16, yBom + 1, {
            font: "600 11px 'Segoe UI', sans-serif", justering: "left", linje: "middle", farve: "#7e8590"
        });

        /* Lodderne: ét pr. isotop, stoerrelsen er andelen */
        for (i = 0; i < g.isotoper.length; i++) {
            if (pct[i] <= 0) continue;
            var x = xFor(g.isotoper[i].masse);
            var r = 9 + 26 * Math.sqrt(pct[i] / 100);
            var y = yBom + 22 + r;

            c.beginPath();
            c.moveTo(x, yBom + 5);
            c.lineTo(x, y - r);
            c.strokeStyle = "rgba(255, 255, 255, 0.28)";
            c.lineWidth = 2;
            c.stroke();

            NK.tegnKugle(c, x, y, r, lysere(FARVER[i % FARVER.length]), FARVER[i % FARVER.length], 1);
            if (r > 15) {
                NK.tekst(c, NK.tal(pct[i], pct[i] < 10 ? 1 : 0) + " %", x, y, {
                    font: "700 " + Math.round(NK.klamp(r * 0.52, 9, 15)) + "px 'Segoe UI', sans-serif",
                    justering: "center", linje: "middle", farve: "rgba(255, 255, 255, 0.95)"
                });
            }
            NK.tekst(c, NK.haevet(g.isotoper[i].a) + g.symbol, x, y + r + 15, {
                font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: "#e9eef4", kant: true
            });
        }

        this.tegnBalance(c, xFor, yBom, l);
    };

    function lysere(hex) {
        var r = parseInt(hex.substr(1, 2), 16), gg = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16);
        return "rgb(" + Math.min(255, r + 70) + "," + Math.min(255, gg + 70) + "," + Math.min(255, b + 70) + ")";
    }

    /* Kernerne foroven: samme antal protoner, forskelligt antal neutroner. */
    NK.SimIsotop.prototype.tegnKerner = function (c, bredde, hoejde, pct) {
        var g = this.grundstof();
        var antal = this.kerner.length;
        var celle = bredde / antal;
        var i;

        NK.tekst(c, "Alle kerner har " + g.z + " protoner — det er dét, der gør dem til " + g.navn.toLowerCase()
            + ". Kun neutronerne er forskellige.", bredde / 2, 22, {
            font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#a9b0ba"
        });

        /* Samme skala til alle, saa den tungeste kerne SER tungest ud. */
        var stoerst = 0;
        for (i = 0; i < antal; i++) stoerst = Math.max(stoerst, this.kerner[i].geometri().rKerne);
        var s = Math.min(1.7, (celle * 0.34) / stoerst, (hoejde * 0.30) / stoerst);

        for (i = 0; i < antal; i++) {
            var x = celle * (i + 0.5);
            var y = hoejde * 0.5;
            var med = pct[i] > 0;
            this.kerner[i].tegn(c, x, y, s * 176, { daempet: med ? 0 : 0.72 });

            var iso = g.isotoper[i];
            var naevn = NK.haevet(iso.a) + g.symbol;
            NK.tekst(c, naevn, x, hoejde - 30, {
                font: "700 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: med ? "#f2f3f5" : "#5f656e", kant: true
            });
            NK.tekst(c, (iso.a - g.z) + " neutroner · " + NK.tal(pct[i], pct[i] > 0 && pct[i] < 0.1 ? 3 : 1) + " %",
                x, hoejde - 13, {
                font: "600 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: med ? FARVER[i % FARVER.length] : "#4d525a"
            });
        }
    };

    /* Balancepunktet: dér hvor vippen staar stille. */
    NK.SimIsotop.prototype.tegnBalance = function (c, xFor, yBom, l) {
        var g = this.grundstof();
        var x = xFor(this.vippe);
        var tekst = "gennemsnit: " + NK.tal(this.vippe, 3) + " u";

        /* Naturens vaerdi som stiplet streg, naar eleven har flyttet paa den. */
        if (Math.abs(this.vippe - g.masse) > 0.012) {
            var xt = xFor(g.masse);
            c.save();
            c.setLineDash([5, 5]);
            c.strokeStyle = "rgba(169, 176, 186, 0.65)";
            c.lineWidth = 1.5;
            c.beginPath();
            c.moveTo(xt, yBom - 34);
            c.lineTo(xt, yBom + 12);
            c.stroke();
            c.restore();

            c.save();
            c.setLineDash([5, 5]);
            c.strokeStyle = "rgba(169, 176, 186, 0.65)";
            c.lineWidth = 1.5;
            c.beginPath();
            c.moveTo(14, l.h - 16);
            c.lineTo(38, l.h - 16);
            c.stroke();
            c.restore();
            NK.tekst(c, "det periodiske system: " + NK.tal(g.masse, 3) + " u", 44, l.h - 16, {
                font: "600 11px 'Segoe UI', sans-serif", justering: "left", linje: "middle", farve: "#a9b0ba"
            });
        }

        /* Viseren */
        c.save();
        c.beginPath();
        c.moveTo(x, yBom - 26);
        c.lineTo(x - 8, yBom - 41);
        c.lineTo(x + 8, yBom - 41);
        c.closePath();
        c.fillStyle = "#f2c53d";
        c.fill();
        c.restore();

        c.save();
        c.font = "700 13px 'Segoe UI', sans-serif";
        var b = c.measureText(tekst).width + 20;
        var px = NK.klamp(x - b / 2, 8, l.b - b - 8);
        NK.rundtRekt(c, px, yBom - 66, b, 22, 11);
        c.fillStyle = "rgba(242, 197, 61, 0.16)";
        c.fill();
        c.strokeStyle = "rgba(242, 197, 61, 0.7)";
        c.lineWidth = 1;
        c.stroke();
        c.restore();
        NK.tekst(c, tekst, px + b / 2, yBom - 54, {
            font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2c53d"
        });
    };
}());
