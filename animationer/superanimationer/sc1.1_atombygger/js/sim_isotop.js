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
        for (var i = 0; i < D.ISOTOP_UDVALG.length; i++) {
            var g = D.grundstof(D.ISOTOP_UDVALG[i]);
            var o = document.createElement("option");
            o.value = String(g.z);
            o.textContent = g.navn + " (" + g.symbol + ") — " + g.isotoper.length + " isotoper";
            vaelger.appendChild(o);
        }
        vaelger.value = String(this.z);
        vaelger.addEventListener("change", function () {
            mig.z = parseInt(this.value, 10);
            mig.byg();
        });

        NK.el("iso-natur").addEventListener("click", function () { mig.tilNaturen(); });

        NK.el("iso-vis-beregning").addEventListener("click", function () {
            NK.el("iso-beregning").classList.add("vis");
        });
        NK.el("iso-beregning-luk").addEventListener("click", function () {
            NK.el("iso-beregning").classList.remove("vis");
        });
        NK.el("iso-beregning").addEventListener("click", function (e) {
            if (e.target.id === "iso-beregning") this.classList.remove("vis");
        });
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

        NK.saetTekst("iso-regnestykke", this.beregning(pct, masse));
        this.maalVippe = masse;
    };

    /* Regnestykket, som man ville skrive det i haanden: ét led pr.
       isotop under hinanden, og facit til sidst. Lighedstegnene flugter,
       fordi linjerne saettes med fast bredde i pop op-vinduet. */
    NK.SimIsotop.prototype.beregning = function (pct, masse) {
        var g = this.grundstof();
        var linjer = [];
        for (var i = 0; i < g.isotoper.length; i++) {
            if (pct[i] <= 0) continue;
            var led = NK.tal(pct[i] / 100, 4) + " · " + NK.tal(g.isotoper[i].masse, 3) + " u"
                + "      (" + NK.haevet(g.isotoper[i].a) + g.symbol + ")";
            linjer.push((linjer.length === 0 ? "m(gns) = " : "       + ") + led);
        }
        if (!linjer.length) return "Skru op for mindst én isotop.";
        linjer.push("       = " + NK.tal(masse, 3) + " u");
        return linjer.join("\n");
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

        var kerneHoejde = Math.min(250, l.h * 0.36);
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

        var yBom = kerneHoejde + (l.h - kerneHoejde) * 0.46;

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
                font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "alphabetic", farve: "#8f97a2"
            });
        }
        NK.tekst(c, "masse i u", l.b - margen + 16, yBom + 1, {
            font: "600 13px 'Segoe UI', sans-serif", justering: "left", linje: "middle", farve: "#8f97a2"
        });

        /* Lodderne: ét pr. isotop, stoerrelsen er andelen */
        for (i = 0; i < g.isotoper.length; i++) {
            if (pct[i] <= 0) continue;
            var x = xFor(g.isotoper[i].masse);
            var maksR = NK.klamp((l.h - yBom - 62) / 2.3, 15, 58);
            var r = 11 + (maksR - 11) * Math.sqrt(pct[i] / 100);
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
                    font: "700 " + Math.round(NK.klamp(r * 0.55, 12, 21)) + "px 'Segoe UI', sans-serif",
                    justering: "center", linje: "middle", farve: "rgba(255, 255, 255, 0.95)"
                });
            }
            NK.tekst(c, NK.haevet(g.isotoper[i].a) + g.symbol, x, y + r + 18, {
                font: "700 17px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
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
        var raekkebredde = Math.min(bredde, antal * 260);
        var venstre = (bredde - raekkebredde) / 2;
        var celle = raekkebredde / antal;
        var i;

        /* Samme skala til alle, saa den tungeste kerne SER tungest ud. */
        var stoerst = 0;
        for (i = 0; i < antal; i++) stoerst = Math.max(stoerst, this.kerner[i].geometri().rKerne);
        var s = Math.min(2.8, (celle * 0.42) / stoerst, (hoejde * 0.40) / stoerst);

        for (i = 0; i < antal; i++) {
            var x = venstre + celle * (i + 0.5);
            var y = hoejde * 0.46;
            var med = pct[i] > 0;
            this.kerner[i].tegn(c, x, y, s * 176, { daempet: med ? 0 : 0.72 });

            var iso = g.isotoper[i];
            var naevn = NK.haevet(iso.a) + g.symbol;
            NK.tekst(c, naevn, x, hoejde - 34, {
                font: "700 22px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: med ? "#f2f3f5" : "#5f656e", kant: true
            });
            NK.tekst(c, (iso.a - g.z) + " neutroner · " + NK.tal(pct[i], pct[i] > 0 && pct[i] < 0.1 ? 3 : 1) + " %",
                x, hoejde - 13, {
                font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: med ? FARVER[i % FARVER.length] : "#4d525a"
            });
        }
    };

    /* Balancepunktet: dér hvor vippen staar stille. */
    NK.SimIsotop.prototype.tegnBalance = function (c, xFor, yBom, l) {
        var g = this.grundstof();
        var x = xFor(this.vippe);
        var vaerdi = NK.tal(this.vippe, 3) + " u";
        var mrk = "GENNEMSNITLIG ATOMMASSE";

        /* Naturens vaerdi som stiplet streg, naar eleven har flyttet paa
           den - med tallet skrevet ved selve stregen. */
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

            NK.tekst(c, "periodiske system: " + NK.tal(g.masse, 3) + " u", xt, yBom - 44, {
                font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: "#a9b0ba", kant: true
            });
        }

        /* Viseren */
        c.save();
        c.beginPath();
        c.moveTo(x, yBom - 26);
        c.lineTo(x - 9, yBom - 43);
        c.lineTo(x + 9, yBom - 43);
        c.closePath();
        c.fillStyle = "#f2c53d";
        c.fill();
        c.restore();

        /* Selve tallet - det er hele pointen med fanen, saa det fylder. */
        var stor = "800 34px 'Segoe UI', sans-serif";
        var lille = "700 12px 'Segoe UI', sans-serif";
        c.save();
        c.font = stor;
        var b = c.measureText(vaerdi).width;
        c.font = lille;
        b = Math.max(b, c.measureText(mrk).width) + 36;
        var h = 72;
        var py = yBom - 60 - h;
        var px = NK.klamp(x - b / 2, 8, Math.max(8, l.b - b - 8));
        NK.rundtRekt(c, px, py, b, h, 14);
        c.fillStyle = "rgba(242, 197, 61, 0.14)";
        c.fill();
        c.strokeStyle = "rgba(242, 197, 61, 0.7)";
        c.lineWidth = 1.5;
        c.stroke();
        c.restore();

        NK.tekst(c, mrk, px + b / 2, py + 19, {
            font: lille, justering: "center", linje: "middle", farve: "rgba(242, 197, 61, 0.75)"
        });
        NK.tekst(c, vaerdi, px + b / 2, py + 47, {
            font: stor, justering: "center", linje: "middle", farve: "#f2c53d"
        });
    };
}());
