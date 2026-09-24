/* =====================================================================
   opslag.js - navnetavlen i stort format

   Det periodiske system for grundstof 1-36 med hovedgruppenumrene
   foroven og navnene i alfabetisk orden nedenunder. Aabnes fra
   navnetavlen i montren og med P. Har hintet peget paa et grundstof,
   lyser det op begge steder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var bygget = false;

    function infoTekst(s) {
        var g = D.grundstof(s);
        if (!g) return "";
        return "<b>" + g.s + "</b> " + NK.html(g.navn) + " · atomnummer " + g.z + " · " +
            D.pladsTekst(g) + " · " + D.SLAGS_NAVN[g.slags];
    }

    function lysOp(s) {
        var alle = document.querySelectorAll(".pt-celle.over, .navn-knap.over");
        for (var i = 0; i < alle.length; i++) alle[i].classList.remove("over");
        if (!s) return;
        var c = document.querySelector('.pt-celle[data-s="' + s + '"]');
        var n = document.querySelector('.navn-knap[data-s="' + s + '"]');
        if (c) c.classList.add("over");
        if (n) n.classList.add("over");
        NK.saetHTML("pt-info", infoTekst(s));
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
            c.className = "pt-celle " + e.slags + (e.ovg ? " ovg" : "");
            c.style.gridColumn = String(e.soejle);
            c.style.gridRow = String(e.periode + 1);
            c.setAttribute("data-s", e.s);
            c.title = e.navn;
            c.innerHTML = '<span class="pt-z">' + e.z + "</span>" + e.s;
            function vis() { lysOp(e.s); }
            c.addEventListener("mouseenter", vis);
            c.addEventListener("focus", vis);
            c.addEventListener("click", vis);
            gitter.appendChild(c);
        });

        /* Navnene i alfabetisk orden */
        var liste = NK.el("navne-liste");
        D.GRUNDSTOFFER.slice().sort(function (a, b) { return a.navn.localeCompare(b.navn, "da"); }).forEach(function (e) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "navn-knap";
            k.setAttribute("data-s", e.s);
            k.innerHTML = '<span class="nk-navn">' + NK.html(e.navn) + '</span><span class="nk-s">' + e.s + "</span>";
            function vis() { lysOp(e.s); }
            k.addEventListener("mouseenter", vis);
            k.addEventListener("focus", vis);
            k.addEventListener("click", vis);
            liste.appendChild(k);
        });
    }

    function aabn(fremhaev) {
        byg();
        var celler = document.querySelectorAll(".fremhaev");
        for (var i = 0; i < celler.length; i++) celler[i].classList.remove("fremhaev");
        lysOp(null);
        if (fremhaev) {
            var c = document.querySelector('.pt-celle[data-s="' + fremhaev + '"]');
            var n = document.querySelector('.navn-knap[data-s="' + fremhaev + '"]');
            if (c) c.classList.add("fremhaev");
            if (n) n.classList.add("fremhaev");
            NK.saetHTML("pt-info", infoTekst(fremhaev));
        } else {
            NK.saetHTML("pt-info", "Hold musen over et grundstof eller et navn.");
        }
        NK.el("opslag-pt").classList.add("vis");
    }

    NK.Opslag = { aabn: aabn, byg: byg };
}());
