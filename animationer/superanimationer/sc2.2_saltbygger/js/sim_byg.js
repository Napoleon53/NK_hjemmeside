/* =====================================================================
   sim_byg.js - fane 1: Byg et salt

   Frit byggeri paa bordet. Panelet viser regnskabet ved siden af
   billedet - hvor meget plus, hvor meget minus - og formlen og navnet,
   saa snart lynlaasen er lukket.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    NK.SimByg = function () {
        var mig = this;
        this.bord = new NK.Bord(NK.el("byg-scene"), {
            visFormel: true,
            lyt: function (hvad) { if (hvad === "aendret") mig.opdaterPanel(); }
        });
        NK.el("byg-afstem").addEventListener("click", function () { mig.bord.afstem(); });
        NK.el("byg-ryd").addEventListener("click", function () { mig.bord.ryd(); });
        /* Tag saltet med over i vandfanen - det er den samme forbindelse,
           bare set nedefra: hvad bliver der af ionerne, naar det opløses? */
        NK.el("byg-vand").addEventListener("click", function () {
            var b = mig.bord;
            if (!b.neutral()) return;
            NK.visFane("fane-vand");
            NK.sims["fane-vand"].haeldSalt(b.kat.id, b.an.id);
        });
        NK.el("byg-navne").addEventListener("change", function () { mig.bord.saetNavne(this.checked); });
        this.opdaterPanel();
    };

    NK.SimByg.prototype.opdaterPanel = function () {
        var b = this.bord;
        var p = b.plus(), m = b.minus(), sum = p - m;
        var begge = !!(b.kat && b.an);

        /* Regnskabet - det samme som lynlaasen viser, bare i tal. */
        NK.saetHTML("byg-l-kat", b.kat ? b.nKat + " × " + D.ionTekst(b.kat) : "Ingen positive ioner");
        NK.saetTekst("byg-q-kat", p ? p + "+" : "0");
        NK.saetHTML("byg-l-an", b.an ? b.nAn + " × " + D.ionTekst(b.an) : "Ingen negative ioner");
        NK.saetTekst("byg-q-an", m ? m + "−" : "0");
        NK.saetTekst("byg-q-sum", begge && sum === 0 ? "0  ✓" : NK.fortegn(sum));
        NK.saetKlasse("byg-q-sum", "tal " + (sum > 0 ? "roed" : (sum < 0 ? "blaa" : (begge ? "groen" : ""))));

        /* Formlen - kun naar ladningen gaar op. */
        var note = "";
        if (b.neutral()) {
            var g = NK.gcd(b.nKat, b.nAn), pp = b.nKat / g, nn = b.nAn / g;
            NK.saetHTML("byg-formel", D.formelHTML(b.kat, b.an, pp, nn));
            NK.saetTekst("byg-navn", D.saltnavn(b.kat, b.an));
            NK.saetTekst("byg-atomer", "Atomer: " + D.atomTekst(D.atomtal(b.kat, pp, b.an, nn)));
            if (g > 1) note = "På bordet ligger " + g + " formelenheder. Formlen viser kun én.";
            var findes = D.findesIkke(b.kat, b.an);
            if (findes) note = (note ? note + " " : "") + findes;
        } else {
            NK.saetHTML("byg-formel", '<span class="ukendt">?</span>');
            NK.saetTekst("byg-navn", begge ? "Ladningen går ikke op endnu" : "Vælg en positiv og en negativ ion");
            NK.saetTekst("byg-atomer", "");
        }
        NK.saetTekst("byg-note", note);
        NK.el("byg-note").style.display = note ? "" : "none";

        NK.el("byg-afstem").disabled = !begge || (b.neutral() && b.forkortet());
        NK.el("byg-vand").disabled = !b.neutral();

        /* Et lille glimt, naar lynlaasen lige er lukket. */
        var neutral = b.neutral();
        if (neutral && !this.varNeutral) {
            var e = NK.el("byg-formelvis");
            e.classList.remove("ny");
            void e.offsetWidth;
            e.classList.add("ny");
        }
        this.varNeutral = neutral;
    };

    NK.SimByg.prototype.tilpas = function () { this.bord.tilpas(); };

    NK.SimByg.prototype.opdater = function (dt) {
        this.bord.opdater(dt);
        NK.saetHTML("byg-status", this.bord.beskriv());
    };

    NK.SimByg.prototype.tegn = function () { this.bord.tegn(); };

    NK.SimByg.prototype.nulstil = function () { this.bord.ryd(); };
}());
