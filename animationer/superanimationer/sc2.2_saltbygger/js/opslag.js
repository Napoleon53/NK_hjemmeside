/* =====================================================================
   opslag.js - de to plakater i stort format (samme som i sc2.3)

   Det periodiske system (periode 1-6, uden lanthaniderne) med
   hovedgruppenumrene 1-8 foroven og de sammensatte ioner. Begge aabnes
   fra plakaterne paa vaeggen paa fane 3 og fra hintene. Har hintet peget
   paa et grundstof eller en ion, lyser det op.

   Tabellen viser ikke ionernes ladninger. Dem skal eleven selv finde ud
   af hovedgruppen.
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
        var t = "<b>" + s + "</b> " + g.navn + " · " + (hg ? "hovedgruppe " + hg : "overgangsmetal");
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

        var tabel = NK.el("ion-tabel");
        D.PLAKAT_IONER.forEach(function (id) {
            var ion = D.ion(id);
            var r = document.createElement("div");
            r.className = "ionraekke";
            r.setAttribute("data-id", id);
            r.innerHTML = '<span class="ion-f ' + (ion.q > 0 ? "plus" : "minus") + '">' + D.ionTekst(ion) + "</span>"
                + '<span class="ion-n">' + D.ionNavn(ion) + "</span>";
            tabel.appendChild(r);
        });

        var luk = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < luk.length; i++) luk[i].addEventListener("click", lukAlle);
        ["opslag-pt", "opslag-ioner"].forEach(function (id) {
            NK.el(id).addEventListener("click", function (e) { if (e.target.id === id) lukAlle(); });
        });
    }

    /* slags: "pt" eller "ioner". fremhaev: et grundstofsymbol eller en
       ions id, der skal lyse op. */
    function aabn(slags, fremhaev) {
        byg();
        lukAlle();
        var celler = document.querySelectorAll(".pt-celle.fremhaev, .ionraekke.fremhaev");
        for (var i = 0; i < celler.length; i++) celler[i].classList.remove("fremhaev");
        if (slags === "pt") {
            if (fremhaev) {
                var c = document.querySelector('.pt-celle[data-s="' + fremhaev + '"]');
                if (c) c.classList.add("fremhaev");
                NK.saetHTML("pt-info", infoTekst(fremhaev));
            } else {
                NK.saetHTML("pt-info", "Hold musen over et grundstof for at se navnet og hovedgruppen.");
            }
        } else if (fremhaev) {
            var r = document.querySelector('.ionraekke[data-id="' + fremhaev + '"]');
            if (r) r.classList.add("fremhaev");
        }
        NK.el(slags === "pt" ? "opslag-pt" : "opslag-ioner").classList.add("vis");
    }

    function lukAlle() {
        NK.el("opslag-pt").classList.remove("vis");
        NK.el("opslag-ioner").classList.remove("vis");
    }

    function aaben() {
        return NK.el("opslag-pt").classList.contains("vis") || NK.el("opslag-ioner").classList.contains("vis");
    }

    NK.Opslag = { aabn: aabn, luk: lukAlle, aaben: aaben, byg: byg };
}());
