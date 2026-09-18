/* =====================================================================
   sim_fordeling.js - fane 3: Fordelingen

   Hvor stor en del af stoffet findes paa hver form ved en given pH?
   Kurverne for to nabo-former krydser hinanden praecis ved pKs - og
   det er den samme pH, man aflaeser i halvtitrerpunktet paa fane 2.

   Diagrammet kan foelge titreringen i laboratoriet, saa man ser
   fordelingen flytte sig, mens der tilsaettes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Kemi = NK.Kemi;

    var FARVER = ["#3d9ee0", "#e6892a", "#3fae72", "#9b6bd6", "#f2c53d", "#e05446", "#5fd0d6"];

    NK.SimFordeling = function () {
        this.graf = new NK.Fordeling(NK.el("for-laerred"));
        this.valgt = null;
        this.pH = 7;
        this.foelg = true;
        this.stablet = false;

        this.koblKnapper();
        this.nyOpstilling("opstilling");
    };

    /* Alle stoffer i opstillingen, som overhovedet har en pKs. */
    NK.SimFordeling.prototype.stoffer = function () {
        var ud = [];
        var set = {};
        function tilfoej(s) {
            if (!s || !s.pKa || !s.pKa.length || set[s.id]) return;
            set[s.id] = true;
            ud.push(s);
        }
        for (var i = 0; i < NK.Ops.t.proeve.length; i++) tilfoej(NK.Ops.stof(NK.Ops.t.proeve[i].id));
        tilfoej(NK.Ops.stof(NK.Ops.t.titrator.id));
        if (!ud.length) tilfoej(Kemi.findStof("eddikesyre"));
        return ud;
    };

    NK.SimFordeling.prototype.nyOpstilling = function () {
        var liste = this.stoffer();
        var vaelger = NK.el("for-stof");
        var gammel = this.valgt ? this.valgt.id : null;
        vaelger.innerHTML = "";
        for (var i = 0; i < liste.length; i++) {
            var o = document.createElement("option");
            o.value = liste[i].id;
            o.textContent = liste[i].navn + " (" + liste[i].formel + ")";
            vaelger.appendChild(o);
        }
        this.valgt = null;
        for (i = 0; i < liste.length; i++) if (liste[i].id === gammel) this.valgt = liste[i];
        if (!this.valgt) this.valgt = liste[0];
        vaelger.value = this.valgt.id;
        this.opdaterTekster();
    };

    NK.SimFordeling.prototype.koblKnapper = function () {
        var mig = this;

        NK.el("for-stof").addEventListener("change", function () {
            var liste = mig.stoffer();
            for (var i = 0; i < liste.length; i++) {
                if (liste[i].id === this.value) mig.valgt = liste[i];
            }
            mig.opdaterTekster();
        });

        var skyder = NK.el("for-ph");
        skyder.addEventListener("input", function () {
            mig.pH = parseFloat(skyder.value);
            mig.foelg = false;
            NK.el("for-foelg").checked = false;
        });

        var foelg = NK.el("for-foelg");
        foelg.addEventListener("change", function () { mig.foelg = foelg.checked; });
        this.foelg = foelg.checked;

        var stablet = NK.el("for-stablet");
        stablet.addEventListener("change", function () { mig.stablet = stablet.checked; });
    };

    /* Reaktionsskema og pKs-liste for det valgte stof. */
    NK.SimFordeling.prototype.opdaterTekster = function () {
        var s = this.valgt;
        if (!s) return;

        var navne = s.former && s.former.length === s.pKa.length + 1 ? s.former : null;
        NK.saetTekst("for-ligning", navne ? navne.join("  ⇌  ") : s.formel);

        var boks = NK.el("for-pks");
        boks.innerHTML = "";
        for (var i = 0; i < s.pKa.length; i++) {
            var rad = document.createElement("div");
            rad.className = "gemtrad";

            var chip = document.createElement("span");
            chip.className = "chip";
            chip.style.backgroundColor = FARVER[(s.pKa.length - i) % FARVER.length];

            var navn = document.createElement("span");
            navn.className = "navn";
            navn.textContent = navne
                ? navne[i] + " ⇌ " + navne[i + 1] + " + H⁺"
                : ("pKs" + (i + 1));

            var vaerdi = document.createElement("b");
            vaerdi.textContent = "pKs" + (s.pKa.length > 1 ? (i + 1) : "") + " = " + NK.tal(s.pKa[i], 2);

            rad.appendChild(chip);
            rad.appendChild(navn);
            rad.appendChild(vaerdi);
            boks.appendChild(rad);
        }
    };

    NK.SimFordeling.prototype.tilpas = function () {
        this.graf.tilpas();
    };

    NK.SimFordeling.prototype.opdater = function () {
        if (this.foelg) {
            var lab = NK.sims ? NK.sims["fane-lab"] : null;
            if (lab) this.pH = NK.klamp(lab.bord.pH, 0, 14);
        }
    };

    NK.SimFordeling.prototype.nulstil = function () {
        this.pH = 7;
        this.foelg = false;
        NK.el("for-foelg").checked = false;
    };

    NK.SimFordeling.prototype.tegn = function () {
        var s = this.valgt;
        if (!s) return;

        NK.el("for-ph").value = String(this.pH);
        NK.saetTekst("for-ph-vis", NK.tal(this.pH, 2));
        NK.saetTekst("for-ph-b", NK.tal(this.pH, 2));

        this.graf.tegn({
            stof: s,
            farver: FARVER,
            pHNu: this.pH,
            stablet: this.stablet
        });

        /* Tabellen med broekdelene lige nu */
        var f = Kemi.fraktioner(this.pH, s);
        var navne = s.former && s.former.length === s.pKa.length + 1 ? s.former : null;
        var boks = NK.el("for-tabel");
        var n = s.pKa.length;
        if (boks.children.length !== n + 1) {
            boks.innerHTML = "";
            for (var i = n; i >= 0; i--) {
                var rad = document.createElement("div");
                rad.className = "gemtrad";
                var chip = document.createElement("span");
                chip.className = "chip";
                chip.style.backgroundColor = FARVER[i % FARVER.length];
                var navn = document.createElement("span");
                navn.className = "navn";
                navn.textContent = navne ? navne[n - i] : "form " + i;
                var vaerdi = document.createElement("b");
                vaerdi.className = "procent";
                rad.appendChild(chip);
                rad.appendChild(navn);
                rad.appendChild(vaerdi);
                boks.appendChild(rad);
            }
        }
        var raekker = boks.querySelectorAll(".procent");
        for (var j = 0; j <= n; j++) {
            var v = f[n - j] * 100;
            raekker[j].textContent = (v < 0.05 && v > 0) ? "< 0,1 %" : NK.tal(v, 1) + " %";
        }
    };
}());
