/* =====================================================================
   sim_salt.js - fane 4: Fra to atomer til et salt

   Den gamle animation tvang metal og ikke-metal til at passe sammen
   én til én. Her maa man kombinere frit, og saa er det MODELLEN, der
   regner ud, hvor mange atomer der skal til, foer regnskabet gaar op:

       Mg afgiver 2 elektroner, men Cl kan kun tage 1 hver
       -> der skal to chloratomer til, og formlen bliver MgCl₂

   Det er praecis den optaelling, eleven selv skal kunne lave.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    NK.SimSalt = function () {
        this.l = new NK.Laerred(NK.el("salt-laerred"));
        this.metal = D.findSymbol("Na");
        this.ikkemetal = D.findSymbol("Cl");
        this.fase = "atomer";        /* atomer | overfoert | samlet */
        this.brikker = [];           /* {atom, g, rolle, x, y, mx, my} */
        this.ur = 0;
        this.ventende = null;

        this.fyldVaelgere();
        this.koblKnapper();
        this.nyOpstilling();
    };

    NK.SimSalt.prototype.fyldVaelgere = function () {
        function fyld(id, symboler, valgt) {
            var v = NK.el(id);
            v.innerHTML = "";
            for (var i = 0; i < symboler.length; i++) {
                var g = D.findSymbol(symboler[i]);
                var o = document.createElement("option");
                o.value = g.symbol;
                o.textContent = g.navn + " (" + g.symbol + ") · " + NK.ladningstekst(g.ion);
                v.appendChild(o);
            }
            v.value = valgt;
        }
        fyld("salt-metal", D.SALT_METALLER, this.metal.symbol);
        fyld("salt-ikkemetal", D.SALT_IKKEMETALLER, this.ikkemetal.symbol);
    };

    NK.SimSalt.prototype.koblKnapper = function () {
        var mig = this;
        NK.el("salt-metal").addEventListener("change", function () {
            mig.metal = D.findSymbol(this.value);
            mig.nyOpstilling();
        });
        NK.el("salt-ikkemetal").addEventListener("change", function () {
            mig.ikkemetal = D.findSymbol(this.value);
            mig.nyOpstilling();
        });
        NK.el("salt-overfoer").addEventListener("click", function () { mig.overfoer(); });
        NK.el("salt-saml").addEventListener("click", function () { mig.saml(); });
        NK.el("salt-nulstil").addEventListener("click", function () { mig.nyOpstilling(); });
    };

    /* ----- Opstillingen ------------------------------------------------------ */
    NK.SimSalt.prototype.nyOpstilling = function () {
        var f = D.formelforhold(this.metal.ion, this.ikkemetal.ion);
        var i;
        this.forhold = f;
        this.fase = "atomer";
        this.ventende = null;
        this.brikker = [];

        for (i = 0; i < f.antalPositive; i++) this.brikker.push(nyBrik(this.metal, "metal"));
        for (i = 0; i < f.antalNegative; i++) this.brikker.push(nyBrik(this.ikkemetal, "ikkemetal"));

        this.opdaterPanel();
        this.visStatus("Til venstre står " + ordTal(f.antalPositive) + " " + this.metal.navn.toLowerCase()
            + "atom" + (f.antalPositive > 1 ? "er" : "") + ", til højre " + ordTal(f.antalNegative) + " "
            + this.ikkemetal.navn.toLowerCase() + "atom" + (f.antalNegative > 1 ? "er" : "")
            + ". Begge dele er neutrale endnu.");
    };

    function nyBrik(g, rolle) {
        var a = new NK.Atom();
        var n = D.hyppigsteIsotop(g.z).a - g.z;
        a.saetStraks(g.z, n, g.z);
        return { atom: a, g: g, rolle: rolle, x: 0, y: 0, mx: 0, my: 0, foerste: true };
    }

    function ordTal(n) {
        var ord = ["nul", "ét", "to", "tre", "fire", "fem", "seks"];
        return ord[n] || String(n);
    }

    /* ----- De tre trin -------------------------------------------------------- */
    NK.SimSalt.prototype.overfoer = function () {
        if (this.fase !== "atomer") return;
        var i;
        /* Metallerne slipper deres yderelektroner mod hoejre. */
        for (i = 0; i < this.brikker.length; i++) {
            var b = this.brikker[i];
            if (b.rolle !== "metal") continue;
            b.atom.retning = { x: 1, y: 0 };
            b.atom.saet(b.g.z, b.atom.n, b.g.z - b.g.ion);
        }
        /* Ikke-metallerne griber dem et oejeblik senere. */
        this.ventende = 0.42;
        this.fase = "overfoert";
        this.opdaterPanel();

        var ialt = this.forhold.ladningIAlt;
        this.visStatus(ialt + " elektron" + (ialt === 1 ? "" : "er") + " skifter ejer. "
            + this.metal.navn + " slipper dem, fordi det så har en fuld skal indenunder — "
            + this.ikkemetal.navn.toLowerCase() + " tager imod, fordi det så selv får fuld yderste skal.");
    };

    NK.SimSalt.prototype.grib = function () {
        for (var i = 0; i < this.brikker.length; i++) {
            var b = this.brikker[i];
            if (b.rolle !== "ikkemetal") continue;
            b.atom.retning = { x: 1, y: 0 };
            b.atom.saet(b.g.z, b.atom.n, b.g.z - b.g.ion);
        }
    };

    NK.SimSalt.prototype.saml = function () {
        if (this.fase !== "overfoert") return;
        this.fase = "samlet";
        this.opdaterPanel();
        this.visStatus("Nu er alle ioner ladede, og modsatte ladninger trækker i hinanden. "
            + "De sætter sig i et fast mønster — et iongitter. " + D.saltformel(this.metal, this.ikkemetal)
            + " er ikke ét molekyle, men det mindste forhold, gitteret er bygget af.");
    };

    /* ----- Panelet ------------------------------------------------------------ */
    NK.SimSalt.prototype.opdaterPanel = function () {
        var m = this.metal, ik = this.ikkemetal, f = this.forhold;
        var mValens = D.valenselektroner(m.z);
        var ikValens = D.valenselektroner(ik.z);
        var mAedel = D.aedelgasStruktur(m.z - m.ion);
        var ikAedel = D.aedelgasStruktur(ik.z - ik.ion);

        NK.saetTekst("salt-metal-info", m.navn + " har " + mValens + " elektron" + (mValens === 1 ? "" : "er")
            + " i yderste skal og afgiver " + (mValens === 1 ? "den" : "dem") + " → " + m.symbol + NK.ladningHaevet(m.ion)
            + (mAedel ? ", som ligner " + mAedel.navn.toLowerCase() : ""));

        NK.saetTekst("salt-ikkemetal-info", ik.navn + " har " + ikValens + " elektroner i yderste skal og mangler "
            + Math.abs(ik.ion) + " → " + ik.symbol + NK.ladningHaevet(ik.ion)
            + (ikAedel ? ", som ligner " + ikAedel.navn.toLowerCase() : ""));

        NK.saetTekst("salt-forhold", (f.antalPositive === 1 && f.antalNegative === 1)
            ? "Ét " + m.navn.toLowerCase() + "atom afgiver præcis så mange elektroner, som ét "
              + ik.navn.toLowerCase() + "atom kan tage imod. Derfor er forholdet 1 : 1."
            : "Hvert " + m.navn.toLowerCase() + "atom afgiver " + Math.abs(m.ion) + ", og hvert "
              + ik.navn.toLowerCase() + "atom kan kun tage imod " + Math.abs(ik.ion)
              + ". Det mindste antal elektroner, der passer til begge, er " + f.ladningIAlt
              + " — så der skal " + f.antalPositive + " " + m.symbol + " og "
              + f.antalNegative + " " + ik.symbol + " til.");

        NK.saetTekst("salt-formel", D.saltformel(m, ik));
        NK.saetTekst("salt-navn", D.saltnavn(m, ik));
        NK.saetTekst("salt-balance", f.antalPositive + " · (" + NK.ladningstekst(m.ion) + ")   +   "
            + f.antalNegative + " · (" + NK.ladningstekst(ik.ion) + ")   =   0");

        NK.el("salt-overfoer").disabled = this.fase !== "atomer";
        NK.el("salt-saml").disabled = this.fase !== "overfoert";
    };

    NK.SimSalt.prototype.visStatus = function (tekst) {
        NK.saetTekst("salt-status", tekst);
    };

    /* ----- Hvor skal brikkerne staa? ------------------------------------------- */
    NK.SimSalt.prototype.laegUd = function () {
        var l = this.l;
        var baand = l.h - 74;
        var oeverst = 18;
        var i, b;

        if (this.fase === "samlet") {
            /* Et lille udsnit af iongitteret: plus og minus skiftevis. */
            var ialt = this.brikker.length;
            var soejler = Math.ceil(Math.sqrt(ialt));
            var raekker = Math.ceil(ialt / soejler);
            var tilbage = { metal: this.forhold.antalPositive, ikkemetal: this.forhold.antalNegative };
            var orden = [];
            for (var r = 0; r < raekker; r++) {
                for (var s = 0; s < soejler && orden.length < ialt; s++) {
                    var oensket = ((r + s) % 2 === 0) ? "metal" : "ikkemetal";
                    if (!tilbage[oensket]) oensket = (oensket === "metal") ? "ikkemetal" : "metal";
                    tilbage[oensket]--;
                    orden.push({ rolle: oensket, r: r, s: s });
                }
            }
            var trin = Math.min((l.b * 0.62) / soejler, baand / raekker);
            this.plads = trin * 0.44;
            var x0 = l.b / 2 - (soejler - 1) * trin / 2;
            var y0 = oeverst + baand / 2 - (raekker - 1) * trin / 2;
            var brugt = {};
            for (i = 0; i < orden.length; i++) {
                b = this.findBrik(orden[i].rolle, brugt);
                if (!b) continue;
                b.mx = x0 + orden[i].s * trin;
                b.my = y0 + orden[i].r * trin;
            }
            return;
        }

        /* To soejler: metallerne til venstre, ikke-metallerne til hoejre. */
        var mAntal = this.forhold.antalPositive, ikAntal = this.forhold.antalNegative;
        var flest = Math.max(mAntal, ikAntal);
        this.plads = Math.min(baand / flest * 0.44, l.b * 0.19, 140);
        var mNr = 0, ikNr = 0;
        for (i = 0; i < this.brikker.length; i++) {
            b = this.brikker[i];
            var erMetal = b.rolle === "metal";
            var antal = erMetal ? mAntal : ikAntal;
            var nr = erMetal ? mNr++ : ikNr++;
            b.mx = l.b * (erMetal ? 0.27 : 0.73);
            b.my = oeverst + baand * (nr + 0.5) / antal;
        }
    };

    NK.SimSalt.prototype.findBrik = function (rolle, brugt) {
        for (var i = 0; i < this.brikker.length; i++) {
            if (this.brikker[i].rolle === rolle && !brugt[i]) { brugt[i] = true; return this.brikker[i]; }
        }
        return null;
    };

    /* ----- Tegning -------------------------------------------------------------- */
    NK.SimSalt.prototype.tilpas = function () { this.l.tilpas(); };

    NK.SimSalt.prototype.nulstil = function () { this.nyOpstilling(); };

    NK.SimSalt.prototype.opdater = function (dt) {
        this.ur += dt;
        if (this.ventende !== null) {
            this.ventende -= dt;
            if (this.ventende <= 0) { this.grib(); this.ventende = null; }
        }
        this.laegUd();
        for (var i = 0; i < this.brikker.length; i++) {
            var b = this.brikker[i];
            if (b.foerste) { b.x = b.mx; b.y = b.my; b.foerste = false; }
            else {
                b.x = NK.mod(b.x, b.mx, 4.5, dt);
                b.y = NK.mod(b.y, b.my, 4.5, dt);
            }
            b.atom.opdater(dt);
        }
    };

    NK.SimSalt.prototype.tegn = function () {
        var l = this.l, c = l.ctx;
        var i, b;
        l.ryd("#14141a");

        /* Pilen mellem soejlerne: elektronerne gaar kun én vej. */
        if (this.fase !== "samlet") {
            var y = 18 + (l.h - 74) / 2;
            var x1 = l.b * 0.42, x2 = l.b * 0.58;
            var staerk = this.fase === "overfoert";
            c.save();
            c.strokeStyle = staerk ? "rgba(242, 197, 61, 0.85)" : "rgba(169, 176, 186, 0.3)";
            c.lineWidth = staerk ? 3 : 2;
            c.beginPath();
            c.moveTo(x1, y);
            c.lineTo(x2 - 9, y);
            c.stroke();
            c.beginPath();
            c.moveTo(x2, y);
            c.lineTo(x2 - 12, y - 7);
            c.lineTo(x2 - 12, y + 7);
            c.closePath();
            c.fillStyle = staerk ? "rgba(242, 197, 61, 0.85)" : "rgba(169, 176, 186, 0.3)";
            c.fill();
            c.restore();
            NK.tekst(c, this.forhold.ladningIAlt + " e⁻", (x1 + x2) / 2, y - 15, {
                font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: staerk ? "#f2c53d" : "#7e8590", kant: true
            });
        }

        var visLadning = this.fase !== "atomer";
        for (i = 0; i < this.brikker.length; i++) {
            b = this.brikker[i];
            var q = visLadning ? b.g.ion : 0;
            b.atom.tegn(c, b.x, b.y, this.plads, {
                fremhaevValens: this.fase === "atomer",
                ladning: q,
                maerkat: b.g.symbol + NK.ladningHaevet(q)
            });
        }

        if (this.fase === "samlet") {
            var formel = D.saltformel(this.metal, this.ikkemetal);
            NK.tekst(c, formel, l.b / 2, 26, {
                font: "700 30px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: "#f2f3f5", kant: true, kantBredde: 5
            });
            NK.tekst(c, D.saltnavn(this.metal, this.ikkemetal), l.b / 2, 50, {
                font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: "#a9b0ba", kant: true
            });
        }
    };
}());
