/* =====================================================================
   taster.js - tasterne lige under felterne

   En række taster på tavlen, så alle felter kan udfyldes med musen
   eller en finger: oxidationstallene som romertal, tal til
   koefficienter og elektroner, og tal med fortegn til ladningen.
   Rækken står under arket, flytter sig hen under det felt, der er
   valgt, og en lille hale peger op mod det. Tastaturet virker som før.
   I et trin uden felter er rækken usynlig, men beholder sin plads.

   Det valgte felt er det, der sidst blev klikket i. Det huskes, selv
   om feltet mister markøren, og glemmes, når trinnet skifter. Det
   første ciffer efter et klik i feltet eller et Tjek afløser det, der
   stod der; de næste sættes bagefter.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var OX = ["−IV", "−III", "−II", "−I", "0", "+I", "+II", "+III", "+IV", "+V", "+VI", "+VII"];
    var CIFRE = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    var SLET = "⌫";
    var FORTEGN = /^[+\-−]/;

    var slags = null;      /* "ox", "tal", "ladning" eller null (ingen felter) */
    var tegnet = null;     /* den slags, der står i rækken nu */
    var valgt = null;      /* data-felt på det felt, tasterne skriver i */
    var frisk = true;      /* næste ciffer afløser det, der står i feltet */
    var maerke = "";       /* opgave og trin: skifter det, glemmes det valgte felt */

    function felter() {
        return Array.prototype.slice.call(NK.el("tavle").querySelectorAll("input[data-felt]"));
    }

    function feltEl(key) {
        var alle = felter();
        for (var i = 0; i < alle.length; i++) if (alle[i].getAttribute("data-felt") === key) return alle[i];
        return null;
    }

    function tast(t, klasse) {
        return '<button type="button" class="tast' + (klasse ? " " + klasse : "") + '" data-tast="' + t + '" tabindex="-1"'
            + (t === SLET ? ' aria-label="Slet"' : "") + ">" + t + "</button>";
    }

    function raekkeHTML(sl) {
        if (sl === "ox") {
            return OX.map(function (t) { return tast(t, t[0] === "−" ? "minus" : (t === "0" ? "nul" : "plus")); }).join("");
        }
        var h = "";
        if (sl === "ladning") h += tast("+", "fortegn") + tast("−", "fortegn") + '<span class="tast-skel"></span>';
        return h + CIFRE.map(function (t) { return tast(t); }).join("") + tast(SLET, "slet");
    }

    function maerkValgt() {
        felter().forEach(function (el) { el.classList.toggle("valgt", el.getAttribute("data-felt") === valgt); });
    }

    /* Rækken står under det valgte felt, og halen peger på det. Er der
       intet valgt, står den midt under skemaet uden hale. */
    function placer() {
        var boks = NK.el("taster");
        if (!boks || !slags) return;
        var el = valgt ? feltEl(valgt) : null, b = boks.offsetWidth;
        if (!el || !b) {
            boks.style.transform = "";
            boks.classList.add("uden-hale");
            return;
        }
        /* Uden flytning står rækken midt i rammen (align-self: center) */
        var ramme = boks.parentNode.getBoundingClientRect(), venstre = ramme.left + (ramme.width - b) / 2;
        var f = el.getBoundingClientRect(), midt = f.left + f.width / 2;
        var plads = 10, lav = ramme.left + plads - venstre, hoej = ramme.right - plads - (venstre + b);
        var flyt = lav > hoej ? 0 : NK.klamp(midt - (venstre + b / 2), lav, hoej);      /* lav > hoej: rækken fylder hele bredden */
        boks.style.transform = "translateX(" + Math.round(flyt) + "px)";
        boks.style.setProperty("--hale", Math.round(NK.klamp(midt - (venstre + flyt), 16, b - 16)) + "px");
        boks.classList.remove("uden-hale");
    }

    function vaelg(key) {
        if (key !== valgt) frisk = true;
        valgt = key;
        maerkValgt();
        placer();
    }

    /* Kaldes, hver gang tavlen er tegnet: hvilke taster trinnet skal have */
    function opdater(nySlags, nytMaerke) {
        var boks = NK.el("taster");
        if (nytMaerke !== maerke) {
            maerke = nytMaerke;
            valgt = null;
            frisk = true;
        }
        slags = nySlags;
        frisk = true;
        if (valgt && !feltEl(valgt)) valgt = null;
        /* Bruges tasterne ikke i trinnet (trin 2, færdig), bliver rækken
           stående usynlig, så arket ikke flytter sig. */
        var vis = slags || tegnet || "tal";
        if (vis !== tegnet) {
            boks.innerHTML = raekkeHTML(vis);
            tegnet = vis;
        }
        boks.className = "taster " + vis + (slags ? "" : " tom");
        maerkValgt();
        placer();
    }

    function naesteTomme(efter) {
        var alle = felter(), i = alle.indexOf(efter);
        for (var k = 1; k <= alle.length; k++) {
            var el = alle[(i + k) % alle.length];
            if (el !== efter && !el.value) return el;
        }
        return null;
    }

    function fokuser(el) {
        if (document.activeElement === el) return;
        try { el.focus({ preventScroll: true }); } catch (e) { /* ældre browsere */ }
    }

    /* Felterne blinker, når der tastes uden et valgt felt */
    function vink() {
        felter().forEach(function (el) {
            el.classList.remove("vink");
            void el.offsetWidth;
            el.classList.add("vink");
        });
        var b = NK.el("besked");
        b.textContent = "Klik først på det felt, tallet skal stå i.";
        b.className = "besked gul";
    }

    function tryk(t) {
        var el = valgt ? feltEl(valgt) : null;
        if (!el) { vink(); return; }
        var v = el.value;
        if (slags === "ox") {
            v = t;
        } else if (t === SLET) {
            v = v.slice(0, -1);
            frisk = false;
        } else if (t === "+" || t === "−") {
            v = t + v.replace(FORTEGN, "");
        } else {
            var fortegn = FORTEGN.test(v) ? v.charAt(0) : "";
            var cifre = frisk ? "" : v.replace(FORTEGN, "");
            if (cifre === "0") cifre = "";
            if (cifre.length < 2) cifre += t;
            v = fortegn + cifre;
            frisk = false;
        }
        el.value = v;
        var h = document.createEvent("Event");
        h.initEvent("input", true, true);
        h.fraTaster = true;
        el.dispatchEvent(h);
        var videre = slags === "ox" ? naesteTomme(el) : null;
        if (videre) { vaelg(videre.getAttribute("data-felt")); fokuser(videre); }
        else fokuser(el);
    }

    function init() {
        var boks = NK.el("taster"), bord = NK.el("arbejdsbord");

        /* Et tryk på en tast må ikke tage markøren fra feltet */
        function behold(e) { if (e.target.closest && e.target.closest(".tast")) e.preventDefault(); }
        boks.addEventListener("mousedown", behold);
        boks.addEventListener("pointerdown", behold);
        boks.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest(".tast") : null;
            if (b) tryk(b.getAttribute("data-tast"));
        });

        bord.addEventListener("focusin", function (e) {
            var key = e.target.getAttribute && e.target.getAttribute("data-felt");
            if (key) vaelg(key);
        });
        /* Et klik i et felt: det næste ciffer afløser det, der står */
        bord.addEventListener("pointerdown", function (e) {
            if (e.target.getAttribute && e.target.getAttribute("data-felt")) frisk = true;
        });
        /* Skrevet på tastaturet: tasterne sætter bagefter */
        bord.addEventListener("input", function (e) { if (!e.fraTaster) frisk = false; });

        window.addEventListener("resize", placer);
    }

    NK.Taster = {
        init: init,
        opdater: opdater,
        placer: placer,
        vaelg: vaelg,
        tryk: tryk,
        valgt: function () { return valgt; },
        OX: OX
    };
}());
