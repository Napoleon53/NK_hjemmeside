/* =====================================================================
   sim_kurve.js - fane 2: Kurven

   Den beregnede titrerkurve i fuld stoerrelse, med ækvivalenspunkter,
   halvtitrerpunkter, den afledte og indikatorens omslagsinterval.

   Man kan gemme en kurve, skifte opstilling og laegge den nye oven i -
   det er den hurtigste maade at se, hvad koncentration og syrestyrke
   betyder for springet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Kemi = NK.Kemi;

    var GEMTE_FARVER = ["#e6892a", "#9b6bd6", "#3fae72", "#e05446", "#f2c53d", "#5fd0d6"];

    /* Springets stoerrelse maales som pH-aendringen over 0,1 mL til
       hver side - altsaa et par draaber, som er den usikkerhed, man
       reelt har paa et omslag. Groenserne er valgt, saa de rammer det,
       man ser i laboratoriet: eddikesyre med NaOH giver 3,3 (tydeligt),
       phosphorsyre 1,0 (svagt), og eddikesyre med ammoniak 0,4 (ingen). */
    var SPRING_VINDUE = 0.1;
    var SPRING_TYDELIGT = 2.0;
    var SPRING_SVAGT = 0.4;

    NK.SimKurve = function () {
        this.graf = new NK.Kurve(NK.el("kur-laerred"), {});
        this.teori = null;
        this.aekv = [];
        this.halv = [];
        this.gemte = [];
        this.markoer = null;
        this.ops = null;

        this.vis = {
            aekv: true, halv: true, afledt: false, ind: true, maalt: true
        };

        this.koblKnapper();
        this.nyOpstilling("opstilling");
    };

    NK.SimKurve.prototype.nyOpstilling = function (aarsag) {
        if (aarsag !== "opstilling") { this.tegnTabel(); return; }
        var ops = NK.Ops.beregning();
        this.ops = ops;
        this.teori = Kemi.kurve(ops, 500);
        this.aekv = Kemi.aekvivalenspunkter(ops);
        this.halv = [];
        for (var i = 0; i < this.aekv.length; i++) {
            var p = this.aekv[i];
            if (p.pseudo || p.pKa < 1.5 || p.pKa > 12.5) continue;
            this.halv.push({ V: p.Vhalv, pH: Kemi.pHVed(ops, p.Vhalv), pKa: p.pKa });
        }
        this.markoer = null;
        this.tegnTabel();
    };

    NK.SimKurve.prototype.koblKnapper = function () {
        var mig = this;

        function tjek(id, navn) {
            var e = NK.el(id);
            e.addEventListener("change", function () { mig.vis[navn] = e.checked; });
            mig.vis[navn] = e.checked;
        }
        tjek("kur-vis-aekv", "aekv");
        tjek("kur-vis-halv", "halv");
        tjek("kur-vis-afledt", "afledt");
        tjek("kur-vis-ind", "ind");
        tjek("kur-vis-maalt", "maalt");

        NK.el("kur-gem").addEventListener("click", function () { mig.gem(); });
        NK.el("kur-ryd").addEventListener("click", function () {
            mig.gemte.length = 0;
            mig.tegnListe();
        });

        var laerred = NK.el("kur-laerred");
        laerred.addEventListener("mousemove", function (e) {
            var r = laerred.getBoundingClientRect();
            var p = mig.graf.fraSkaerm(e.clientX - r.left, e.clientY - r.top);
            mig.markoer = p ? { V: NK.klamp(p.V, 0, mig.ops.Vmaks) } : null;
        });
        laerred.addEventListener("mouseleave", function () { mig.markoer = null; });
    };

    /* ----- Gemte kurver ---------------------------------------------- */
    NK.SimKurve.prototype.gem = function () {
        if (!this.teori) return;
        this.gemte.push({
            navn: NK.Ops.proeveTekst() + " → " + NK.Ops.titratorTekst(),
            farve: GEMTE_FARVER[this.gemte.length % GEMTE_FARVER.length],
            V: this.teori.V.slice(),
            pH: this.teori.pH.slice()
        });
        this.tegnListe();
    };

    NK.SimKurve.prototype.tegnListe = function () {
        var boks = NK.el("kur-liste");
        boks.innerHTML = "";
        if (!this.gemte.length) {
            var tom = document.createElement("div");
            tom.className = "tom";
            tom.textContent = "Ingen gemte kurver endnu.";
            boks.appendChild(tom);
            return;
        }
        var mig = this;
        for (var i = 0; i < this.gemte.length; i++) {
            (function (n) {
                var g = mig.gemte[n];
                var rad = document.createElement("div");
                rad.className = "gemtrad";

                var chip = document.createElement("span");
                chip.className = "chip";
                chip.style.backgroundColor = g.farve;

                var navn = document.createElement("span");
                navn.className = "navn";
                navn.textContent = g.navn;
                navn.title = g.navn;

                var fjern = document.createElement("button");
                fjern.className = "fjern";
                fjern.textContent = "×";
                fjern.title = "Fjern kurven";
                fjern.addEventListener("click", function () {
                    mig.gemte.splice(n, 1);
                    mig.tegnListe();
                });

                rad.appendChild(chip);
                rad.appendChild(navn);
                rad.appendChild(fjern);
                boks.appendChild(rad);
            }(i));
        }
    };

    /* ----- Tabellen over aekvivalenspunkter --------------------------- */
    function bedsteIndikator(pH) {
        var bedst = null, afstand = 1e9;
        for (var i = 0; i < Kemi.INDIKATORER.length; i++) {
            var ind = Kemi.INDIKATORER[i];
            if (!ind.omraade) continue;
            if (pH < ind.omraade[0] || pH > ind.omraade[1]) continue;
            var midt = (ind.omraade[0] + ind.omraade[1]) / 2;
            if (Math.abs(pH - midt) < afstand) { afstand = Math.abs(pH - midt); bedst = ind; }
        }
        return bedst;
    }

    NK.SimKurve.prototype.spring = function (V) {
        var a = Kemi.pHVed(this.ops, Math.max(0, V - SPRING_VINDUE));
        var b = Kemi.pHVed(this.ops, Math.min(this.ops.Vmaks, V + SPRING_VINDUE));
        return b - a;
    };

    NK.SimKurve.prototype.tegnTabel = function () {
        var boks = NK.el("kur-tabel");
        boks.innerHTML = "";
        if (!this.aekv.length) {
            var tom = document.createElement("div");
            tom.className = "tom";
            tom.textContent = "Denne titrator kan ikke omsætte noget i glasset.";
            boks.appendChild(tom);
            return;
        }
        for (var i = 0; i < this.aekv.length; i++) {
            var p = this.aekv[i];
            var spring = Math.abs(this.spring(p.V));
            var dom = "";
            if (spring >= SPRING_TYDELIGT) dom = "tydeligt spring";
            else if (spring >= SPRING_SVAGT) dom = "svagt spring";
            else dom = "intet brugbart spring";

            var ind = bedsteIndikator(p.pH);
            var rad = document.createElement("div");
            rad.className = "tabelrad";

            var mrke = document.createElement("span");
            mrke.className = "mrke";
            mrke.textContent = "Æ" + p.nr;

            var midt = document.createElement("span");
            var v = document.createElement("b");
            v.textContent = NK.tal(p.V, 2) + " mL";
            midt.appendChild(v);
            var under = document.createElement("span");
            under.className = "under";
            under.textContent = (p.pseudo ? "stærk base" : "pKs " + NK.tal(p.pKa, 2)) +
                " · halv ved " + NK.tal(p.Vhalv, 2) + " mL";
            midt.appendChild(under);

            var hoejre = document.createElement("span");
            hoejre.className = "vaerdi";
            hoejre.textContent = "pH " + NK.tal(p.pH, 2);
            var under2 = document.createElement("span");
            under2.className = "under";
            under2.textContent = dom + (ind ? " · " + ind.navn : "");
            hoejre.appendChild(under2);

            rad.appendChild(mrke);
            rad.appendChild(midt);
            rad.appendChild(hoejre);
            boks.appendChild(rad);
        }
    };

    /* ----- Tid og tegning -------------------------------------------- */
    NK.SimKurve.prototype.tilpas = function () {
        this.graf.tilpas();
    };

    NK.SimKurve.prototype.opdater = function () { };

    NK.SimKurve.prototype.nulstil = function () {
        this.gemte.length = 0;
        this.tegnListe();
    };

    NK.SimKurve.prototype.tegn = function () {
        if (!this.teori) return;
        var ind = NK.Ops.indikator();
        var lab = NK.sims ? NK.sims["fane-lab"] : null;
        var i;

        var kurver = [];
        for (i = 0; i < this.gemte.length; i++) {
            kurver.push({
                V: this.gemte[i].V, pH: this.gemte[i].pH,
                farve: this.gemte[i].farve, bredde: 1.8, svag: true
            });
        }
        kurver.push({ V: this.teori.V, pH: this.teori.pH, farve: "#3d9ee0", navn: "beregnet kurve" });

        var punkter = null;
        if (this.vis.maalt && lab && lab.bord.punkter.length > 1) punkter = lab.bord.punkter;

        var markoer = null;
        if (this.markoer) {
            markoer = { V: this.markoer.V, pH: Kemi.pHVed(this.ops, this.markoer.V) };
            NK.saetTekst("kur-v", NK.tal(markoer.V, 2) + " mL");
            NK.saetTekst("kur-ph", NK.tal(markoer.pH, 2));
        } else {
            NK.saetTekst("kur-v", "–");
            NK.saetTekst("kur-ph", "–");
        }

        this.graf.tegn({
            Vmaks: this.ops.Vmaks,
            kurver: kurver,
            dpH: this.vis.afledt ? { V: this.teori.V, v: this.teori.dpH } : null,
            aekv: this.aekv,
            visAekv: this.vis.aekv,
            halv: this.halv,
            visHalv: this.vis.halv,
            indikator: ind.omraade ? {
                navn: ind.navn, lav: ind.omraade[0], hoej: ind.omraade[1],
                farve: NK.Kemi.rgba(Kemi.indikatorFarve(ind, ind.omraade[1] + 1.5), 0.20)
            } : null,
            visIndikator: this.vis.ind && !!ind.omraade,
            punkter: punkter,
            punktFarve: "#7ee0a8",
            nu: (lab && lab.bord.V > 0) ? { V: lab.bord.V, pH: lab.bord.pH } : null,
            markoer: markoer
        });
    };
}());
