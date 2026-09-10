/* =====================================================================
   sim_lab.js - fane 1: Laboratoriet

   Her staar opstillingen. Man aabner hanen og ser pH aendre sig, mens
   ens egen kurve tegnes nedenunder, punkt for punkt.

   Den beregnede kurve og aekvivalenspunkterne regnes kun ud, naar
   opstillingen aendres - ikke i hvert billede.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Kemi = NK.Kemi;

    /* Et halvtitrerpunkt er kun vaerd at vise, hvis pKs ligger dér,
       hvor man faktisk kan aflaese det paa kurven. */
    var PKS_LAVEST = 1.5;
    var PKS_HOEJEST = 12.5;

    NK.SimLab = function () {
        this.l = new NK.Laerred(NK.el("lab-laerred"));
        this.graf = new NK.Kurve(NK.el("lab-graf"), {});
        this.bord = new NK.Bord();
        this.teori = null;
        this.aekv = [];
        this.halv = [];
        this.markoer = null;
        this.visFacit = false;

        this.koblKnapper();
        this.nyOpstilling("opstilling");
    };

    /* ----- Opstillingen aendret ------------------------------------- */
    NK.SimLab.prototype.nyOpstilling = function (aarsag) {
        if (aarsag === "opstilling") {
            var ops = NK.Ops.beregning();
            this.bord.saetOps(ops);
            this.teori = Kemi.kurve(ops, 400);
            this.aekv = Kemi.aekvivalenspunkter(ops);
            this.halv = [];
            for (var i = 0; i < this.aekv.length; i++) {
                var p = this.aekv[i];
                if (p.pseudo || p.pKa < PKS_LAVEST || p.pKa > PKS_HOEJEST) continue;
                this.halv.push({ V: p.Vhalv, pH: Kemi.pHVed(ops, p.Vhalv), pKa: p.pKa });
            }
            this.markoer = null;
        }
        this.opdaterIndikator();
    };

    /* ----- Knapper --------------------------------------------------- */
    NK.SimLab.prototype.koblKnapper = function () {
        var mig = this;

        NK.el("lab-hane").addEventListener("click", function () { mig.skiftHane(); });
        NK.el("lab-draabe").addEventListener("click", function () { mig.bord.draabe(); });
        NK.el("lab-plus01").addEventListener("click", function () { mig.bord.tilfoej(0.1); });
        NK.el("lab-plus1").addEventListener("click", function () { mig.bord.tilfoej(1); });
        NK.el("lab-minus1").addEventListener("click", function () { mig.bord.tilfoej(-1); });
        NK.el("lab-nulstil").addEventListener("click", function () { mig.bord.nulstil(); });

        NK.el("lab-aekv").addEventListener("click", function () {
            var maal = mig.naesteAekv();
            mig.bord.koerTil(maal ? maal.V : mig.bord.maksV());
        });

        var flow = NK.el("lab-flow");
        flow.addEventListener("input", function () {
            mig.bord.flow = parseFloat(flow.value);
            NK.saetTekst("lab-flow-vis", NK.tal(mig.bord.flow, 2) + " mL/s");
        });
        mig.bord.flow = parseFloat(flow.value);
        NK.saetTekst("lab-flow-vis", NK.tal(mig.bord.flow, 2) + " mL/s");

        var facit = NK.el("lab-vis-facit");
        facit.addEventListener("change", function () { mig.visFacit = facit.checked; });

        var laerred = NK.el("lab-graf");
        laerred.addEventListener("mousemove", function (e) {
            var r = laerred.getBoundingClientRect();
            var p = mig.graf.fraSkaerm(e.clientX - r.left, e.clientY - r.top);
            mig.markoer = p ? { V: NK.klamp(p.V, 0, mig.bord.maksV()) } : null;
        });
        laerred.addEventListener("mouseleave", function () { mig.markoer = null; });
    };

    NK.SimLab.prototype.skiftHane = function () {
        this.bord.saetHane(!this.bord.aaben);
    };

    NK.SimLab.prototype.naesteAekv = function () {
        for (var i = 0; i < this.aekv.length; i++) {
            if (this.aekv[i].V > this.bord.V + 1e-6) return this.aekv[i];
        }
        return null;
    };

    /* ----- Indikatorens bjaelke -------------------------------------- */
    NK.SimLab.prototype.opdaterIndikator = function () {
        var ind = NK.Ops.indikator();
        var vindue = NK.el("lab-ind-vindue");
        if (ind.omraade) {
            vindue.style.display = "block";
            vindue.style.left = (ind.omraade[0] / 14 * 100).toFixed(2) + "%";
            vindue.style.width = ((ind.omraade[1] - ind.omraade[0]) / 14 * 100).toFixed(2) + "%";
        } else {
            vindue.style.display = "none";
        }
        var tekst;
        if (ind.id === "ingen") {
            tekst = "Uden indikator ser man kun pH-metret.";
        } else if (ind.skala) {
            tekst = "Universalindikator skifter farve hele vejen — god til at følge pH, men upræcis til at finde ækvivalenspunktet.";
        } else {
            tekst = ind.navn + " slår om ved pH " + ind.omslag + ". Den er brugbar, hvis springet går tværs igennem det interval.";
        }
        NK.saetTekst("lab-ind-note", tekst);
    };

    /* ----- Tid og tegning -------------------------------------------- */
    NK.SimLab.prototype.tilpas = function () {
        this.l.tilpas();
        this.graf.tilpas();
    };

    NK.SimLab.prototype.opdater = function (dt) {
        this.bord.opdater(dt);
    };

    NK.SimLab.prototype.nulstil = function () {
        this.bord.nulstil();
    };

    /* Hvor stejlt gaar det lige nu?  pH pr. mL. */
    NK.SimLab.prototype.haeldning = function () {
        var h = this.bord.maksV() / 400;
        var V = this.bord.V;
        var a = Kemi.pHVed(this.bord.ops, Math.max(0, V - h));
        var b = Kemi.pHVed(this.bord.ops, V + h);
        return (b - a) / (Math.min(V + h, this.bord.maksV()) - Math.max(0, V - h));
    };

    NK.SimLab.prototype.status = function () {
        var b = this.bord;
        if (!this.aekv.length) {
            return "Der er ikke noget i glasset, som titratoren kan omsætte. Prøv en anden opstilling.";
        }
        if (b.V >= b.maksV() - 1e-6) {
            return "Buretten er tom. Nulstil, eller gør den større i venstre spalte.";
        }
        var naeste = this.naesteAekv();
        if (naeste && Math.abs(naeste.V - b.V) < b.maksV() * 0.015) {
            return "Nu er du lige ved ækvivalenspunktet. Luk hanen, og giv én dråbe ad gangen.";
        }
        var hld = this.haeldning();
        if (hld > 3) {
            return "pH løber! Her betyder én dråbe flere hele pH-enheder.";
        }
        if (naeste && hld < 0.25 && b.V > 0) {
            return "Bufferområde: der er både syre og korresponderende base i glasset, så pH flytter sig kun langsomt.";
        }
        if (!naeste) {
            return "Du er forbi det sidste ækvivalenspunkt. Nu fortynder du bare titratoren.";
        }
        if (b.V === 0) {
            return "Åbn hanen, og hold øje med pH-metret.";
        }
        return "Følg med på kurven nedenunder — hvor stejlt går det?";
    };

    NK.SimLab.prototype.tegn = function () {
        var b = this.bord;
        var ind = NK.Ops.indikator();
        var i;

        /* --- Apparatet --- */
        NK.Apparat.tegn(this.l.ctx, this.l.b, this.l.h, b.tilstand({
            titratorNavn: NK.Ops.titratorTekst(),
            proeveNavn: NK.tal(b.ops.V0, 1) + " mL " + NK.Ops.proeveTekst()
        }));

        /* --- Kurven --- */
        var kurver = [];
        if (this.visFacit && this.teori) {
            kurver.push({ V: this.teori.V, pH: this.teori.pH, farve: "#7e8590", stiplet: true, svag: true, navn: "beregnet" });
        }
        var egenV = [], egenPH = [];
        for (i = 0; i < b.punkter.length; i++) {
            egenV.push(b.punkter[i].V);
            egenPH.push(b.punkter[i].pH);
        }
        kurver.push({ V: egenV, pH: egenPH, farve: "#3d9ee0", navn: "din måling" });

        var markoer = null;
        if (this.markoer && this.teori) {
            markoer = { V: this.markoer.V, pH: Kemi.pHVed(b.ops, this.markoer.V) };
            NK.saetTekst("lab-hover", "V = " + NK.tal(markoer.V, 2) + " mL · pH = " + NK.tal(markoer.pH, 2));
        } else {
            NK.saetTekst("lab-hover", "");
        }

        this.graf.tegn({
            Vmaks: b.maksV(),
            kurver: kurver,
            aekv: this.aekv,
            visAekv: true,
            indikator: ind.omraade ? {
                navn: ind.navn, lav: ind.omraade[0], hoej: ind.omraade[1],
                farve: NK.Kemi.rgba(Kemi.indikatorFarve(ind, ind.omraade[1] + 1.5), 0.22)
            } : null,
            visIndikator: !!ind.omraade,
            nu: { V: b.V, pH: b.pH },
            markoer: markoer
        });

        /* --- Tallene i panelet --- */
        NK.saetTekst("lab-ph", NK.tal(NK.klamp(b.pHVist, -1.99, 15.99), 2));
        NK.saetTekst("lab-v", NK.tal(b.V, 2) + " mL");
        NK.saetTekst("lab-rumfang", NK.tal(b.rumfang(), 1) + " mL");
        NK.saetTekst("lab-n", NK.tal(b.ops.titrator.c * b.V, 3) + " mmol");

        var naeste = this.naesteAekv();
        NK.saetTekst("lab-naeste", naeste ? NK.tal(naeste.V, 2) + " mL" : "–");
        var reference = naeste ? naeste.V : (this.aekv.length ? this.aekv[this.aekv.length - 1].V : 0);
        NK.saetTekst("lab-omsat", reference > 0 ? NK.tal(b.V / reference * 100, 0) + " %" : "–");
        NK.saetTekst("lab-status", this.status());

        /* Indikatorens farve og naal */
        var f = Kemi.indikatorFarve(ind, b.pH);
        var prik = NK.el("lab-farveprik");
        prik.style.backgroundColor = "rgb(" +
            Math.round(255 * (1 - f[3]) + f[0] * f[3]) + "," +
            Math.round(255 * (1 - f[3]) + f[1] * f[3]) + "," +
            Math.round(255 * (1 - f[3]) + f[2] * f[3]) + ")";
        NK.el("lab-ind-naal").style.left = (NK.klamp(b.pH, 0, 14) / 14 * 100).toFixed(2) + "%";

        /* Hanens knap */
        var knap = NK.el("lab-hane");
        NK.saetTekst("lab-hane-tekst", b.aaben ? "Luk hanen" : "Åbn hanen");
        knap.classList.toggle("groen", !b.aaben);
        knap.classList.toggle("roed", b.aaben);
    };
}());
