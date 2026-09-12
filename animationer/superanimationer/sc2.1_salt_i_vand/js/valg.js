/* =====================================================================
   valg.js - det salt, man har valgt

   Begge faner viser den samme raekke saltknapper og det samme valg.
   Vaelger man kridt paa fane 1 og skifter fane, er det stadig kridt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var V = {
        saltId: "NaCl",
        lyttere: [],
        _hylder: []
    };
    NK.Valg = V;

    V.salt = function () { return D.salt(V.saltId); };

    V.saet = function (id) {
        if (id === V.saltId) return;
        V.saltId = id;
        var i;
        for (i = 0; i < V._hylder.length; i++) V._hylder[i]();
        for (i = 0; i < V.lyttere.length; i++) V.lyttere[i](V.salt());
    };

    V.paa = function (fn) { V.lyttere.push(fn); };

    /* Bygger de ni saltknapper ind i et element og holder dem opdaterede.
       Stregen foroven paa knappen siger let (groen) eller tung (orange). */
    V.byg = function (vaert) {
        var knapper = [];

        D.SALTE.forEach(function (salt) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "saltknap " + (D.erTung(salt) ? "tung" : "let");
            b.title = salt.navn + " — " + salt.hverdag;
            b.setAttribute("aria-label", salt.navn);
            b.innerHTML = '<span class="sformel"></span><span class="snavn"></span>';
            b.querySelector(".sformel").textContent = salt.formel;
            b.querySelector(".snavn").textContent = salt.navn.replace("(II)", "");
            b.addEventListener("click", function () { V.saet(salt.id); });
            vaert.appendChild(b);
            knapper.push({ el: b, id: salt.id });
        });

        function opdater() {
            for (var i = 0; i < knapper.length; i++) {
                var valgt = knapper[i].id === V.saltId;
                knapper[i].el.classList.toggle("valgt", valgt);
                knapper[i].el.setAttribute("aria-pressed", valgt ? "true" : "false");
            }
        }

        V._hylder.push(opdater);
        opdater();
        return opdater;
    };
}());
