/* =====================================================================
   pertabel.js - en lille model af det periodiske system

   Kun grundstof 1-20, for saa langt raekker resten af animationen.
   Tabellen saettes som et gitter med 18 soejler, saa grupperne staar,
   hvor de skal: hydrogen alene yderst til venstre, helium helt ude i
   gruppe 18, og et tomt spring fra gruppe 2 til gruppe 13. Det er
   netop springet, der goer det til et periodisk system.

   Farven foelger grundstoftypen og er den samme som maerkaterne paa
   ionfanen, saa metal er roedt begge steder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* boks:     elementet, tabellen fyldes ind i
       vedKlik:  kaldes med grundstoffets z, hvis cellerne skal kunne
                 trykkes paa. Udelades den, er tabellen ren visning. */
    NK.PeriodiskSystem = function (boks, vedKlik) {
        this.celler = {};
        this.markeret = 0;

        boks.innerHTML = "";
        boks.classList.add("pertabel");

        for (var z = 1; z <= D.MAKS_Z; z++) {
            var g = D.grundstof(z);
            var plads = D.PLADS[z];
            var celle = document.createElement(vedKlik ? "button" : "div");

            celle.className = "pcelle " + g.type;
            celle.style.gridRow = String(plads[0]);
            celle.style.gridColumn = String(plads[1]);
            celle.textContent = g.symbol;
            celle.title = g.navn + " · " + NK.talform(z, "proton", "protoner");

            if (vedKlik) {
                celle.type = "button";
                celle.setAttribute("data-z", String(z));
                celle.addEventListener("click", function () {
                    vedKlik(parseInt(this.getAttribute("data-z"), 10));
                });
            }

            boks.appendChild(celle);
            this.celler[z] = celle;
        }
    };

    /* Fremhaev ét grundstof. z = 0 rydder markeringen. */
    NK.PeriodiskSystem.prototype.marker = function (z) {
        if (z === this.markeret) return;
        if (this.celler[this.markeret]) this.celler[this.markeret].classList.remove("valgt");
        if (this.celler[z]) this.celler[z].classList.add("valgt");
        this.markeret = z;
    };
}());
