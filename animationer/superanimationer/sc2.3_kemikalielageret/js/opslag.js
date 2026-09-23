/* =====================================================================
   opslag.js - de to plakater i stort format

   Det periodiske system (periode 1-6, uden lanthaniderne) med
   hovedgruppenumrene foroven og de sammensatte ioner. Begge aabnes fra
   plakaterne paa vaeggen, fra knapperne i panelet og fra hintene. Har
   hintet peget paa et grundstof eller en ion, lyser det op.

   Tabellen viser ikke ionernes ladninger. Dem skal eleven selv finde
   ud af hovedgruppen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var bygget = false;

    function infoTekst(s) {
        var g = D.grundstof(s);
        if (!g) return "";
        var hg = D.hovedgruppe(s);
        var t = "<b>" + s + "</b> " + NK.html(g.navn) + " · " + (hg ? "hovedgruppe " + hg : "overgangsmetal");
        if (D.FLERE_LADNINGER.indexOf(s) >= 0) t += " · flere mulige ladninger";
        return t;
    }

    function byg() {
        if (bygget) return;
        bygget = true;

        var gitter = NK.el("pt-gitter");
        for (var s = 1; s <= 18; s++) {
            var hg = s <= 2 ? s : (s >= 13 ? s - 10 : null);
            if (!hg) continue;
            var h = document.createElement("div");
            h.className = "pt-hoved";
            h.style.gridColumn = String(s);
            h.style.gridRow = "1";
            h.textContent = String(hg);
            gitter.appendChild(h);
        }
        var ov = document.createElement("div");
        ov.className = "pt-overgang";
        ov.style.gridColumn = "3 / 13";
        ov.style.gridRow = "4";
        ov.textContent = "overgangsmetaller";
        gitter.appendChild(ov);

        D.GRUNDSTOFFER.forEach(function (e) {
            var c = document.createElement("button");
            c.type = "button";
            var flere = D.FLERE_LADNINGER.indexOf(e.s) >= 0;
            c.className = "pt-celle " + e.slags + (D.hovedgruppe(e.s) ? "" : " ovg") + (flere ? " flere" : "");
            c.style.gridColumn = String(e.soejle);
            c.style.gridRow = String(e.periode + 1);
            c.setAttribute("data-s", e.s);
            c.title = e.navn;
            c.textContent = e.s;
            function vis() { NK.saetHTML("pt-info", infoTekst(e.s)); }
            c.addEventListener("mouseenter", vis);
            c.addEventListener("focus", vis);
            c.addEventListener("click", vis);
            gitter.appendChild(c);
        });

        bygIoner();
    }

    /* Ionplakaten bygges forfra hver gang, for HCO3- er kun med, naar
       Sværere ioner er slaaet til */
    function bygIoner() {
        var tabel = NK.el("ion-tabel");
        tabel.innerHTML = "";
        D.plakatIoner(NK.indstil.svaer).forEach(function (id) {
            var ion = D.ion(id);
            var r = document.createElement("div");
            r.className = "ionraekke";
            r.setAttribute("data-id", id);
            r.innerHTML = '<span class="ion-f ' + (ion.q > 0 ? "plus" : "minus") + '">' + ion.tekst + "</span>" +
                '<span class="ion-n">' + ion.navn + "</span>";
            tabel.appendChild(r);
        });
    }

    function aabn(slags, fremhaev) {
        byg();
        if (slags !== "pt") bygIoner();
        var id = slags === "pt" ? "opslag-pt" : "opslag-ioner";
        var celler = document.querySelectorAll(".pt-celle.fremhaev, .ionraekke.fremhaev");
        for (var i = 0; i < celler.length; i++) celler[i].classList.remove("fremhaev");
        if (slags === "pt") {
            if (fremhaev) {
                var c = document.querySelector('.pt-celle[data-s="' + fremhaev + '"]');
                if (c) c.classList.add("fremhaev");
                NK.saetHTML("pt-info", infoTekst(fremhaev));
            } else {
                NK.saetHTML("pt-info", "Hold musen over et grundstof for at se navnet.");
            }
        } else if (fremhaev) {
            var r = document.querySelector('.ionraekke[data-id="' + fremhaev + '"]');
            if (r) r.classList.add("fremhaev");
        }
        NK.el(id).classList.add("vis");
    }

    NK.Opslag = { aabn: aabn, byg: byg };
}());
