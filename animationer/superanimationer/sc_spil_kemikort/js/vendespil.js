/* =====================================================================
   vendespil.js - fane 2: Vendespil

   Hvert kort bliver til to brikker: forsiden og bagsiden. Alle brikker
   blandes og ligger med bagsiden op. To brikker, der kommer fra det
   samme kort, er et par. Tiden loeber, til alle par er fundet, og de
   gange, to brikker ikke passede sammen, taelles som fejl.

   Brikkerne er knapper, saa spillet ogsaa kan spilles med tastaturet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var el = NK.el;

    var V = NK.Vendespil = {};

    var saet = null;
    var noegle = null;
    var parAntal = 8;
    var brikker = [];
    var aabne = [];
    var venter = 0;
    var fejl = 0;
    var fundet = 0;
    var start = 0;
    var ur = 0;
    var koerer = false;
    var slut = false;

    V.saetSaet = function (nyt, nyNoegle) {
        saet = nyt;
        noegle = nyNoegle;
        if (saet) parAntal = Math.min(parAntal, Math.max(4, saet.kort.length));
        V.nyt();
    };

    V.saetStoerrelse = function (n) {
        parAntal = n;
        V.nyt();
    };

    V.stoerrelse = function () { return parAntal; };

    V.nyt = function () {
        stopUr();
        brikker = [];
        aabne = [];
        clearTimeout(venter);
        venter = 0;
        fejl = 0;
        fundet = 0;
        koerer = false;
        slut = false;
        start = 0;
        if (!saet) return;
        var antal = Math.min(parAntal, saet.kort.length);
        var valgte = NK.bland(saet.kort).slice(0, antal);
        var liste = [];
        valgte.forEach(function (k, i) {
            liste.push({ par: i, side: 0, tekst: k.forside, makker: k.bagside });
            liste.push({ par: i, side: 1, tekst: k.bagside, makker: k.forside });
        });
        brikker = NK.bland(liste);
        byg();
        tegn();
        status("Find de " + antal + " par. Klik på to brikker.");
    };

    function byg() {
        var g = el("ve-gitter");
        var kolonner = brikker.length <= 12 ? 4 : (brikker.length <= 16 ? 4 : 5);
        g.style.setProperty("--kolonner", kolonner);
        g.innerHTML = brikker.map(function (b, i) {
            return '<button class="brik" type="button" data-nr="' + i + '" aria-label="Brik ' + (i + 1) + '">'
                + '<span class="brik-bag">?</span>'
                + '<span class="' + NK.tekstklasse(b.tekst, "brik-for ") + '">' + NK.html(b.tekst) + "</span>"
                + "</button>";
        }).join("");
    }

    function brikEl(i) {
        return el("ve-gitter").querySelector('[data-nr="' + i + '"]');
    }

    function tegn() {
        NK.saetTekst("ve-tid", NK.tid(koerer ? Date.now() - start : (start ? slutTid() : 0)));
        NK.saetTekst("ve-fejl", String(fejl));
        NK.saetTekst("ve-fundet", fundet + " af " + (brikker.length / 2));
        var r = noegle ? NK.Bibliotek.rekord(noegle, "vend" + parAntal) : null;
        NK.saetTekst("ve-rekord", r === null ? "ingen" : NK.tid(r));
        var knapper = el("ve-stoerrelse").querySelectorAll("button");
        for (var i = 0; i < knapper.length; i++) {
            var n = +knapper[i].getAttribute("data-par");
            knapper[i].classList.toggle("valgt", n === parAntal);
            knapper[i].disabled = !!(saet && n > saet.kort.length);
        }
        el("ve-slut").hidden = !slut;
    }

    var sluttid = 0;
    function slutTid() { return sluttid; }

    function startUr() {
        if (koerer) return;
        koerer = true;
        start = Date.now();
        ur = setInterval(function () { NK.saetTekst("ve-tid", NK.tid(Date.now() - start)); }, 200);
    }

    function stopUr() {
        clearInterval(ur);
        ur = 0;
        if (koerer) sluttid = Date.now() - start;
        koerer = false;
    }

    function status(tekst) { NK.saetTekst("ve-status", tekst); }

    function luk() {
        aabne.forEach(function (i) {
            var e = brikEl(i);
            if (e) e.classList.remove("aaben", "gal");
        });
        aabne = [];
    }

    V.klik = function (nr) {
        if (slut || !brikker[nr]) return;
        if (venter) { clearTimeout(venter); venter = 0; luk(); }
        var e = brikEl(nr);
        if (!e || e.classList.contains("fundet") || aabne.indexOf(nr) >= 0) return;
        startUr();
        e.classList.add("aaben");
        aabne.push(nr);
        if (aabne.length < 2) {
            status("Find brikken, der hører sammen med den.");
            return;
        }
        var a = brikker[aabne[0]], b = brikker[aabne[1]];
        if (a.par === b.par && a.side !== b.side) {
            var forside = a.side === 0 ? a.tekst : b.tekst;
            var bagside = a.side === 0 ? b.tekst : a.tekst;
            aabne.forEach(function (i) {
                var t = brikEl(i);
                t.classList.remove("aaben");
                t.classList.add("fundet");
                t.disabled = true;
            });
            aabne = [];
            fundet++;
            status(forside + ": " + bagside);
            if (fundet === brikker.length / 2) vundet();
            tegn();
        } else {
            fejl++;
            aabne.forEach(function (i) { brikEl(i).classList.add("gal"); });
            status("De to hører ikke sammen.");
            tegn();
            venter = setTimeout(function () { venter = 0; luk(); }, 900);
        }
    };

    function vundet() {
        stopUr();
        slut = true;
        var ms = slutTid();
        var ny = noegle ? NK.Bibliotek.nyRekord(noegle, "vend" + parAntal, ms) : false;
        NK.saetTekst("ve-slut-titel", ny ? "Ny rekord" : "Alle par fundet");
        NK.saetTekst("ve-slut-tekst",
            (brikker.length / 2) + " par på " + NK.tid(ms) + " med "
            + (fejl === 0 ? "ingen fejl" : fejl === 1 ? "1 fejl" : fejl + " fejl") + ".");
        status(ny ? "Ny rekord på " + NK.tid(ms) + "." : "Alle par fundet på " + NK.tid(ms) + ".");
    }

    V.tast = function (e) {
        if (e.key === "Enter" && slut) { V.nyt(); return true; }
        return false;
    };

    V.aktiver = function () { tegn(); };
    V.deaktiver = function () { };

    function init() {
        el("ve-gitter").addEventListener("click", function (e) {
            var b = e.target.closest("[data-nr]");
            if (b) V.klik(+b.getAttribute("data-nr"));
        });
        el("ve-stoerrelse").addEventListener("click", function (e) {
            var b = e.target.closest("button[data-par]");
            if (b && !b.disabled) V.saetStoerrelse(+b.getAttribute("data-par"));
        });
        el("ve-nyt").addEventListener("click", V.nyt);
        el("ve-igen").addEventListener("click", V.nyt);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
