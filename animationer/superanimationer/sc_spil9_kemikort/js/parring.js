/* =====================================================================
   parring.js - fane 3: Parring

   Forsiderne staar i venstre spalte med en tom plads ved siden af.
   Bagsiderne ligger blandet i hoejre spalte, og eleven traekker hver
   bagside over paa den forside, den hoerer til. Et klik paa en bagside og
   derefter paa en plads goer det samme, saa spillet ogsaa kan bruges paa
   en tavle eller en telefon.

   Saettet deles i runder. Tiden loeber fra det foerste traek til den
   sidste runde er faerdig, og fejlene taelles med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var el = NK.el;

    var P = NK.Parring = {};

    var saet = null;
    var noegle = null;
    var prRunde = 6;
    var runder = [];
    var rundeNr = 0;
    var tilbage = 0;
    var fejl = 0;
    var start = 0;
    var ur = 0;
    var koerer = false;
    var slut = false;
    var valgt = null;      /* nummeret paa den bagside, der er klikket */
    var traek = null;      /* { nr, flyver, x0, y0, aktiv } */

    P.saetSaet = function (nyt, nyNoegle) {
        saet = nyt;
        noegle = nyNoegle;
        P.nyt();
    };

    P.saetStoerrelse = function (n) {
        prRunde = n;
        P.nyt();
    };

    P.stoerrelse = function () { return prRunde; };

    P.nyt = function () {
        stopUr();
        runder = [];
        rundeNr = 0;
        fejl = 0;
        koerer = false;
        slut = false;
        start = 0;
        valgt = null;
        if (!saet) return;
        var blandet = NK.bland(saet.kort);
        for (var i = 0; i < blandet.length; i += prRunde) {
            var del = blandet.slice(i, i + prRunde);
            /* En runde med ét kort er ikke en opgave; den lægges til den
               forrige i stedet. */
            if (del.length < 2 && runder.length) runder[runder.length - 1] = runder[runder.length - 1].concat(del);
            else runder.push(del);
        }
        byg();
    };

    function runde() { return runder[rundeNr] || []; }

    function byg() {
        var r = runde();
        tilbage = r.length;
        valgt = null;
        var v = el("pa-venstre"), h = el("pa-hoejre");
        v.innerHTML = r.map(function (k, i) {
            return '<div class="p-plads" data-nr="' + i + '">'
                + '<span class="' + NK.tekstklasse(k.forside, "p-for ") + '">' + NK.html(k.forside) + "</span>"
                + '<span class="p-slot"><i>?</i></span></div>';
        }).join("");
        h.innerHTML = NK.bland(r.map(function (k, i) { return { k: k, i: i }; })).map(function (x) {
            return '<button class="' + NK.tekstklasse(x.k.bagside, "p-brik ") + '" type="button" data-nr="' + x.i + '">'
                + NK.html(x.k.bagside) + "</button>";
        }).join("");
        el("pa-slut").hidden = true;
        el("pa-naeste").hidden = true;
        tegn();
        status("Træk svaret hen på det, det hører sammen med.");
    }

    function tegn() {
        NK.saetTekst("pa-tid", NK.tid(koerer ? Date.now() - start : sluttid));
        NK.saetTekst("pa-fejl", String(fejl));
        NK.saetTekst("pa-runde", (rundeNr + 1) + " af " + runder.length);
        var rek = noegle ? NK.Bibliotek.rekord(noegle, "par" + prRunde) : null;
        NK.saetTekst("pa-rekord", rek === null ? "ingen" : NK.tid(rek));
        var knapper = el("pa-stoerrelse").querySelectorAll("button");
        for (var i = 0; i < knapper.length; i++) {
            var n = +knapper[i].getAttribute("data-antal");
            knapper[i].classList.toggle("valgt", n === prRunde);
        }
    }

    var sluttid = 0;

    function startUr() {
        if (koerer || slut) return;
        koerer = true;
        if (!start) start = Date.now();
        ur = setInterval(function () { NK.saetTekst("pa-tid", NK.tid(Date.now() - start)); }, 200);
    }

    function stopUr() {
        clearInterval(ur);
        ur = 0;
        if (koerer) sluttid = Date.now() - start;
        koerer = false;
    }

    function status(tekst) { NK.saetTekst("pa-status", tekst); }

    /* ----- Forsoeget ----------------------------------------------------- */
    function forsoeg(brikNr, pladsNr) {
        var r = runde();
        var plads = el("pa-venstre").querySelector('.p-plads[data-nr="' + pladsNr + '"]');
        var brik = el("pa-hoejre").querySelector('.p-brik[data-nr="' + brikNr + '"]');
        if (!plads || !brik || plads.classList.contains("rigtig")) return;
        startUr();
        if (brikNr === pladsNr) {
            plads.classList.add("rigtig");
            plads.querySelector(".p-slot").innerHTML = '<span class="' + NK.tekstklasse(r[pladsNr].bagside, "p-svar ") + '">'
                + NK.html(r[pladsNr].bagside) + "</span>";
            brik.remove();
            valgt = null;
            tilbage--;
            status(r[pladsNr].forside + ": " + r[pladsNr].bagside);
            if (!tilbage) rundeFaerdig();
        } else {
            fejl++;
            ryst(plads);
            ryst(brik);
            status("Det passer ikke sammen. Prøv en anden.");
            tegn();
        }
    }

    function ryst(e) {
        e.classList.remove("gal");
        void e.offsetWidth;
        e.classList.add("gal");
        setTimeout(function () { e.classList.remove("gal"); }, 500);
    }

    function rundeFaerdig() {
        if (rundeNr < runder.length - 1) {
            el("pa-naeste").hidden = false;
            status("Runden er klaret. Tiden løber videre.");
        } else {
            stopUr();
            slut = true;
            var ny = noegle ? NK.Bibliotek.nyRekord(noegle, "par" + prRunde, sluttid) : false;
            NK.saetTekst("pa-slut-titel", ny ? "Ny rekord" : "Hele sættet er parret");
            NK.saetTekst("pa-slut-tekst", saet.kort.length + " kort på " + NK.tid(sluttid)
                + " med " + (fejl === 0 ? "ingen fejl" : fejl === 1 ? "1 fejl" : fejl + " fejl") + ".");
            el("pa-slut").hidden = false;
            status(ny ? "Ny rekord på " + NK.tid(sluttid) + "." : "Hele sættet er parret på " + NK.tid(sluttid) + ".");
        }
        tegn();
    }

    P.naeste = function () {
        if (rundeNr >= runder.length - 1) return;
        rundeNr++;
        byg();
    };

    /* ----- Traek med musen eller fingeren --------------------------------- */
    function pladsUnder(x, y) {
        var e = document.elementFromPoint(x, y);
        return e ? e.closest(".p-plads") : null;
    }

    function markerMaal(plads) {
        var alle = el("pa-venstre").querySelectorAll(".p-plads");
        for (var i = 0; i < alle.length; i++) alle[i].classList.toggle("maal", alle[i] === plads);
    }

    function nedPaaBrik(e) {
        var brik = e.target.closest(".p-brik");
        if (!brik || e.button > 0) return;
        traek = {
            nr: +brik.getAttribute("data-nr"),
            brik: brik,
            x0: e.clientX,
            y0: e.clientY,
            aktiv: false,
            flyver: null
        };
        try { brik.setPointerCapture(e.pointerId); } catch (ignore) { /* uden capture virker klik stadig */ }
    }

    function flyt(e) {
        if (!traek) return;
        var dx = e.clientX - traek.x0, dy = e.clientY - traek.y0;
        if (!traek.aktiv && dx * dx + dy * dy < 36) return;
        if (!traek.aktiv) {
            traek.aktiv = true;
            var r = traek.brik.getBoundingClientRect();
            var f = document.createElement("div");
            f.className = traek.brik.className.replace("p-brik", "p-brik p-flyver");
            f.textContent = traek.brik.textContent;
            f.style.width = r.width + "px";
            f.style.height = r.height + "px";
            document.body.appendChild(f);
            traek.flyver = f;
            traek.gribX = traek.x0 - r.left;
            traek.gribY = traek.y0 - r.top;
            traek.brik.classList.add("loeftet");
            el("pa-hoejre").classList.add("traekker");
            startUr();
        }
        traek.flyver.style.left = (e.clientX - traek.gribX) + "px";
        traek.flyver.style.top = (e.clientY - traek.gribY) + "px";
        markerMaal(pladsUnder(e.clientX, e.clientY));
        e.preventDefault();
    }

    function slip(e) {
        if (!traek) return;
        var t = traek;
        traek = null;
        el("pa-hoejre").classList.remove("traekker");
        if (t.flyver) t.flyver.remove();
        t.brik.classList.remove("loeftet");
        markerMaal(null);
        if (!t.aktiv) { vaelgBrik(t.nr); return; }
        var plads = pladsUnder(e.clientX, e.clientY);
        if (plads) forsoeg(t.nr, +plads.getAttribute("data-nr"));
        else status("Slip bagsiden oven på en forside.");
    }

    function vaelgBrik(nr) {
        valgt = valgt === nr ? null : nr;
        var alle = el("pa-hoejre").querySelectorAll(".p-brik");
        for (var i = 0; i < alle.length; i++) {
            alle[i].classList.toggle("valgt", +alle[i].getAttribute("data-nr") === valgt);
        }
        status(valgt === null ? "Træk svaret hen på det, det hører sammen med."
            : "Klik nu på den forside, den hører til.");
    }

    P.tast = function (e) {
        if (e.key === "Enter") {
            if (slut) { P.nyt(); return true; }
            if (!el("pa-naeste").hidden) { P.naeste(); return true; }
        }
        return false;
    };

    P.aktiver = function () { tegn(); };

    function init() {
        var h = el("pa-hoejre");
        h.addEventListener("pointerdown", nedPaaBrik);
        /* Med mus og finger vaelges brikken i slip(). Et klik fra
           tastaturet har detail 0 og har ikke vaeret igennem slip(). */
        h.addEventListener("click", function (e) {
            var b = e.target.closest(".p-brik");
            if (b && e.detail === 0) vaelgBrik(+b.getAttribute("data-nr"));
        });
        h.addEventListener("pointermove", flyt);
        h.addEventListener("pointerup", slip);
        h.addEventListener("pointercancel", function (e) {
            if (!traek) return;
            if (traek.flyver) traek.flyver.remove();
            traek.brik.classList.remove("loeftet");
            traek = null;
            h.classList.remove("traekker");
            markerMaal(null);
        });
        el("pa-venstre").addEventListener("click", function (e) {
            var p = e.target.closest(".p-plads");
            if (!p) return;
            if (valgt === null) { status("Vælg først en bagside til højre."); return; }
            forsoeg(valgt, +p.getAttribute("data-nr"));
        });
        el("pa-stoerrelse").addEventListener("click", function (e) {
            var b = e.target.closest("button[data-antal]");
            if (b) P.saetStoerrelse(+b.getAttribute("data-antal"));
        });
        el("pa-naeste").addEventListener("click", P.naeste);
        el("pa-nyt").addEventListener("click", P.nyt);
        el("pa-igen").addEventListener("click", P.nyt);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
