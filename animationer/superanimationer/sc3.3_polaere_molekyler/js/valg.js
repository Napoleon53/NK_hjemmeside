/* =====================================================================
   valg.js - det molekyle, man har valgt paa fane 2

   Mens en opgave er i gang, viser fanen opgavens molekyle, og knapperne
   er laast (se sim.molId() og sim.menuLaast()).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var V = {
        molId: "H2O",
        lyttere: [],
        _hylder: []
    };
    NK.Valg = V;

    V.mol = function () { return D.molekyle(V.molId); };

    V.saet = function (id) {
        if (id === V.molId || !D.molekyle(id)) return;
        V.molId = id;
        V.opdaterKnapper();
        for (var i = 0; i < V.lyttere.length; i++) V.lyttere[i](V.mol());
    };

    V.paa = function (fn) { V.lyttere.push(fn); };

    V.opdaterKnapper = function () {
        for (var i = 0; i < V._hylder.length; i++) V._hylder[i]();
    };

    /* Bygger knapperne ind i et element. sim bestemmer, hvilket molekyle
       der er markeret, og om knapperne er laast. */
    V.byg = function (vaert, sim) {
        var knapper = [];

        D.MOLEKYLER.forEach(function (mol) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "molknap";
            b.title = mol.navn;
            b.setAttribute("aria-label", mol.navn);
            b.innerHTML = '<span class="mformel"></span>';
            b.querySelector(".mformel").textContent = mol.formel;
            b.addEventListener("click", function () { if (!sim.menuLaast()) V.saet(mol.id); });
            vaert.appendChild(b);
            knapper.push({ el: b, id: mol.id });
        });

        function opdater() {
            var aktiv = sim.molId();
            var laast = sim.menuLaast();
            for (var i = 0; i < knapper.length; i++) {
                var valgt = knapper[i].id === aktiv;
                knapper[i].el.classList.toggle("valgt", valgt);
                knapper[i].el.setAttribute("aria-pressed", valgt ? "true" : "false");
                knapper[i].el.disabled = laast && !valgt;
            }
        }

        V._hylder.push(opdater);
        opdater();
        return opdater;
    };
}());
