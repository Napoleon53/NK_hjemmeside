/* =====================================================================
   sim_ukendt.js - fane 4: Ukendt prøve

   Eleven faar udleveret et rumfang af en ukendt syre eller base og en
   buret med kendt titrator. Opgaven er den samme som i laboratoriet:
   find ækvivalensvolumenet, regn koncentrationen ud - og aflaes pKs i
   halvtitrerpunktet, hvis stoffet er svagt.

   Proeven maales med pH-meter alene. Der er ingen indikator, saa man
   skal bruge kurven, ikke en farve.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Kemi = NK.Kemi;

    /* Puljen, der traekkes fra. 'svag' afgoer, om der ogsaa spoerges
       om pKs. */
    var SYRER = ["eddikesyre", "myresyre", "propansyre", "benzoesyre", "maelkesyre",
                 "chloreddikesyre", "hf", "hno2", "acetylsalicylsyre", "hocl"];
    var BASER = ["ammoniak", "methylamin", "pyridin", "ethanolamin", "tris", "hydroxylamin"];
    var STAERKE_SYRER = ["hcl", "hno3"];
    var STAERKE_BASER = ["naoh", "koh"];

    var C_TITRATOR = [0.0500, 0.1000, 0.2000];
    var V_PROEVE = [10, 20, 25];
    var VMAKS_TRIN = [20, 25, 30, 40, 50];

    /* Hvor taet skal svaret vaere for at kunne godkendes. */
    var TOL_V = 0.02;      /* relativt */
    var TOL_C = 0.03;      /* relativt */
    var TOL_PKS = 0.35;    /* absolut */

    function vaelg(liste) {
        return liste[Math.floor(Math.random() * liste.length)];
    }

    NK.SimUkendt = function () {
        this.l = new NK.Laerred(NK.el("ukendt-laerred"));
        this.graf = new NK.Kurve(NK.el("ukendt-graf"), { kompakt: true });
        this.bord = new NK.Bord();
        this.bord.ind = Kemi.findIndikator("ingen");
        this.bord.flow = 0.5;
        this.opgave = null;
        this.markoer = null;
        this.afsloeret = false;

        this.koblKnapper();
        this.nyOpgave();
    };

    /* ----- Ny opgave -------------------------------------------------- */
    NK.SimUkendt.prototype.nyOpgave = function () {
        var erSyre = Math.random() < 0.5;
        var svag = Math.random() < 0.72;
        var id;
        if (erSyre) id = svag ? vaelg(SYRER) : vaelg(STAERKE_SYRER);
        else id = svag ? vaelg(BASER) : vaelg(STAERKE_BASER);

        var stof = Kemi.findStof(id);
        var V0 = vaelg(V_PROEVE);
        var c = Math.round((0.02 + Math.random() * 0.13) * 1000) / 1000;
        var titrator = Kemi.findStof(erSyre ? "naoh" : "hcl");

        /* Vaelg en titratorkoncentration, saa aekvivalensvolumenet lander
           et sted, en buret kan naa. */
        var cT = null, Vae = 0;
        var blandet = C_TITRATOR.slice().sort(function () { return Math.random() - 0.5; });
        for (var i = 0; i < blandet.length; i++) {
            var forsoeg = c * V0 / blandet[i];
            if (forsoeg >= 8 && forsoeg <= 38) { cT = blandet[i]; Vae = forsoeg; break; }
        }
        if (cT === null) {
            cT = Math.round(c * V0 / 22 * 10000) / 10000;
            Vae = c * V0 / cT;
        }

        var Vmaks = VMAKS_TRIN[VMAKS_TRIN.length - 1];
        for (i = 0; i < VMAKS_TRIN.length; i++) {
            if (VMAKS_TRIN[i] >= Vae * 1.7) { Vmaks = VMAKS_TRIN[i]; break; }
        }

        var ops = {
            proeve: [{ stof: stof, c: c }],
            V0: V0,
            titrator: { stof: titrator, c: cT },
            Vmaks: Vmaks
        };

        this.opgave = {
            stof: stof,
            erSyre: erSyre,
            svag: svag,
            c: c,
            V0: V0,
            cT: cT,
            titrator: titrator,
            ops: ops,
            aekv: Kemi.aekvivalenspunkter(ops)
        };
        this.opgave.Vae = this.opgave.aekv.length ? this.opgave.aekv[0].V : Vae;
        this.opgave.pKs = stof.pKa.length ? stof.pKa[0] : NaN;

        this.afsloeret = false;
        this.bord.saetOps(ops);
        this.markoer = null;

        NK.saetTekst("ukendt-opgave",
            "Du har fået " + NK.tal(V0, 1) + " mL af en ukendt " +
            (svag ? "svag " : "stærk ") + (erSyre ? "syre" : "base") +
            ". I buretten står " + NK.tal(cT, 4) + " M " + titrator.formel +
            ". Bestem koncentrationen" + (svag ? " og pKs" : "") + ".");

        NK.saetTekst("ukendt-titrator", NK.tal(cT, 4) + " M " + titrator.formel);
        NK.el("ukendt-pks-felt").style.display = svag ? "grid" : "none";
        NK.el("ukendt-svar-v").value = "";
        NK.el("ukendt-svar-c").value = "";
        NK.el("ukendt-svar-pks").value = "";
        var f = NK.el("ukendt-feedback");
        f.textContent = "";
        f.className = "besked";
    };

    /* ----- Knapper ---------------------------------------------------- */
    NK.SimUkendt.prototype.koblKnapper = function () {
        var mig = this;

        NK.el("ukendt-ny").addEventListener("click", function () { mig.nyOpgave(); });
        NK.el("ukendt-hane").addEventListener("click", function () {
            mig.bord.saetHane(!mig.bord.aaben);
        });
        NK.el("ukendt-draabe").addEventListener("click", function () { mig.bord.draabe(); });
        NK.el("ukendt-plus01").addEventListener("click", function () { mig.bord.tilfoej(0.1); });
        NK.el("ukendt-plus1").addEventListener("click", function () { mig.bord.tilfoej(1); });
        NK.el("ukendt-nulstil").addEventListener("click", function () { mig.bord.nulstil(); });
        NK.el("ukendt-tjek").addEventListener("click", function () { mig.tjek(); });
        NK.el("ukendt-facit").addEventListener("click", function () { mig.facit(); });

        var laerred = NK.el("ukendt-graf");
        laerred.addEventListener("mousemove", function (e) {
            var r = laerred.getBoundingClientRect();
            var p = mig.graf.fraSkaerm(e.clientX - r.left, e.clientY - r.top);
            mig.markoer = p ? { V: NK.klamp(p.V, 0, mig.bord.maksV()) } : null;
        });
        laerred.addEventListener("mouseleave", function () { mig.markoer = null; });
    };

    /* ----- Rettelse ---------------------------------------------------- */
    NK.SimUkendt.prototype.tjek = function () {
        var o = this.opgave;
        var linjer = [];
        var rigtige = 0, stillede = 0;

        var svarV = NK.laesTal(NK.el("ukendt-svar-v").value);
        stillede++;
        if (!isFinite(svarV)) {
            linjer.push("Ækvivalensvolumen: skriv et tal.");
        } else if (Math.abs(svarV - o.Vae) <= Math.max(0.15, o.Vae * TOL_V)) {
            linjer.push("✓ Ækvivalensvolumen " + NK.tal(svarV, 2) + " mL passer.");
            rigtige++;
        } else {
            linjer.push("✗ Ækvivalensvolumen er ikke rigtigt. Find det, hvor kurven er stejlest.");
        }

        var svarC = NK.laesTal(NK.el("ukendt-svar-c").value);
        stillede++;
        if (!isFinite(svarC)) {
            linjer.push("Koncentration: skriv et tal.");
        } else if (Math.abs(svarC - o.c) <= o.c * TOL_C) {
            linjer.push("✓ Koncentrationen " + NK.tal(svarC, 4) + " M passer.");
            rigtige++;
        } else {
            linjer.push("✗ Koncentrationen passer ikke. n(titrator) = c · V, og der reagerer 1 mol titrator med 1 mol af prøven.");
        }

        if (o.svag) {
            var svarP = NK.laesTal(NK.el("ukendt-svar-pks").value);
            stillede++;
            if (!isFinite(svarP)) {
                linjer.push("pKs: skriv et tal.");
            } else if (Math.abs(svarP - o.pKs) <= TOL_PKS) {
                linjer.push("✓ pKs = " + NK.tal(svarP, 2) + " passer.");
                rigtige++;
            } else {
                linjer.push("✗ pKs passer ikke. Aflæs pH ved det halve ækvivalensvolumen.");
            }
        }

        var f = NK.el("ukendt-feedback");
        f.textContent = linjer.join("  ");
        f.className = "besked " + (rigtige === stillede ? "god" : "skidt");
        if (rigtige === stillede) {
            f.textContent = "Alt rigtigt. Prøven var " + o.stof.navn + " (" + o.stof.formel + ")" +
                (o.svag ? " med pKs " + NK.tal(o.pKs, 2) : "") + ", " + NK.tal(o.c, 4) + " M.";
            this.afsloeret = true;
        }
    };

    NK.SimUkendt.prototype.facit = function () {
        var o = this.opgave;
        this.afsloeret = true;
        var f = NK.el("ukendt-feedback");
        f.className = "besked";
        f.textContent = "Prøven er " + NK.tal(o.c, 4) + " M " + o.stof.navn +
            " (" + o.stof.formel + ")" +
            (o.svag ? ", pKs = " + NK.tal(o.pKs, 2) : "") +
            ". Ækvivalensvolumen er " + NK.tal(o.Vae, 2) + " mL.";
    };

    /* ----- Tid og tegning ---------------------------------------------- */
    NK.SimUkendt.prototype.tilpas = function () {
        this.l.tilpas();
        this.graf.tilpas();
    };

    NK.SimUkendt.prototype.opdater = function (dt) {
        this.bord.opdater(dt);
    };

    NK.SimUkendt.prototype.nulstil = function () {
        this.bord.nulstil();
    };

    NK.SimUkendt.prototype.tegn = function () {
        var b = this.bord;
        var o = this.opgave;

        NK.Apparat.tegn(this.l.ctx, this.l.b, this.l.h, b.tilstand({
            titratorNavn: NK.tal(o.cT, 4) + " M " + o.titrator.formel,
            proeveNavn: NK.tal(o.V0, 1) + " mL ukendt " + (o.erSyre ? "syre" : "base")
        }));

        var V = [], pH = [];
        for (var i = 0; i < b.punkter.length; i++) {
            V.push(b.punkter[i].V);
            pH.push(b.punkter[i].pH);
        }

        var markoer = null;
        if (this.markoer) {
            markoer = { V: this.markoer.V, pH: Kemi.pHVed(o.ops, this.markoer.V) };
            NK.saetTekst("ukendt-hover", "V = " + NK.tal(markoer.V, 2) + " mL · pH = " + NK.tal(markoer.pH, 2));
        } else {
            NK.saetTekst("ukendt-hover", "");
        }

        this.graf.tegn({
            Vmaks: b.maksV(),
            kurver: [{ V: V, pH: pH, farve: "#9b6bd6", navn: "din måling" }],
            aekv: this.afsloeret ? o.aekv : null,
            visAekv: this.afsloeret,
            nu: { V: b.V, pH: b.pH },
            markoer: markoer
        });

        NK.saetTekst("ukendt-ph", NK.tal(NK.klamp(b.pHVist, -1.99, 15.99), 2));
        NK.saetTekst("ukendt-v", NK.tal(b.V, 2) + " mL");
        NK.el("ukendt-farveprik").style.backgroundColor = "#eef3f7";

        var knap = NK.el("ukendt-hane");
        NK.saetTekst("ukendt-hane-tekst", b.aaben ? "Luk hanen" : "Åbn hanen");
        knap.classList.toggle("groen", !b.aaben);
        knap.classList.toggle("roed", b.aaben);
    };
}());
