/* =====================================================================
   app.js - de fire faner, faneskift, links og tastatur

   Én fane pr. afsnit i kapitel 1. En fane uden figur (js/fig_*.js ikke
   indlaest) springes over. Man kan linke direkte til en fane med
   index.html#atomet (se hash i js/data.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var byggere = {};
    var faner = [];
    var aktiv = null;

    function visFane(id) {
        if (!byggere[id]) return;
        aktiv = id;
        faner.forEach(function (f) {
            var valgt = f.id === id;
            f.sektion.classList.toggle("aktiv", valgt);
            f.knap.classList.toggle("aktiv", valgt);
            f.knap.setAttribute("aria-selected", valgt ? "true" : "false");
            if (valgt) f.knap.classList.remove("kald");
        });
        byggere[id].skjulForkl();
    }
    NK.visFane = visFane;

    /* Svaer udgave: alle fagord paa én gang. Kontakten staar i panelet paa
       hver fane, men gaelder dem alle, og alle figurer begynder forfra,
       naar den slaas til eller fra (brugeren 2. nov. 2026). */
    NK.svaer = false;
    NK.saetSvaer = function (til) {
        NK.svaer = !!til;
        Object.keys(byggere).forEach(function (id) { byggere[id].saetAlt(NK.svaer); });
    };

    /* Naar figuren er faerdig: en stjerne paa fanen, og naeste fane kalder */
    NK.faneFaerdig = function (id, faerdig) {
        var f = faner.filter(function (x) { return x.id === id; })[0];
        if (!f) return;
        f.knap.querySelector(".faerdig").textContent = faerdig ? "★" : "";
        if (NK.fanerIRaekker) NK.fanerIRaekker();      /* stjernen goer fanen bredere */
        if (faerdig) {
            var i = faner.indexOf(f);
            if (i + 1 < faner.length) faner[i + 1].knap.classList.add("kald");
        }
    };

    /* Fanen efter den aktuelle. Efter den sidste fane: den foerste fane, der
       ikke er bygget endnu, eller ingen. Knappen paa kortet maa aldrig bygge
       forfra, for man trykker paa den i forventning om en ny opgave
       (brugeren 2. nov. 2026); forfra-knappen staar i panelet. */
    function naesteFaneEfter(id) {
        var i = faner.map(function (f) { return f.id; }).indexOf(id);
        if (i + 1 < faner.length) return faner[i + 1];
        return faner.filter(function (f) { return f.id !== id && !byggere[f.id].faerdig; })[0] || null;
    }

    NK.naesteFaneNavn = function (id) {
        var f = naesteFaneEfter(id);
        return f ? "Næste figur: " + f.nr + " →" : null;
    };

    NK.naesteFane = function (id) {
        var f = naesteFaneEfter(id);
        if (f) visFane(f.id);
    };

    function tastatur(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        var b = byggere[aktiv];
        var n = parseInt(e.key, 10);
        if (n >= 1 && n <= faner.length) { visFane(faner[n - 1].id); return; }
        if (e.key === "Enter" && b) {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            b.enter();
        }
        if (e.key === "Escape" && b) { b.skjulForkl(); if (b.valgt) b.vaelg(null); }
    }

    function start() {
        var hoved = document.getElementById("hoved");
        var knapper = document.getElementById("faneknapper");
        var skabelon = document.getElementById("skabelon");

        NK.FANER.forEach(function (f) {
            var def = NK.FIGURER[f.id];
            if (!def) return;
            def.id = f.id;
            def.nr = f.nr;
            def.titel = f.titel;

            var sektion = skabelon.content.firstElementChild.cloneNode(true);
            sektion.id = "fane-" + f.id;
            sektion.setAttribute("aria-label", f.nr + " " + f.titel);
            hoved.appendChild(sektion);

            var knap = document.createElement("button");
            knap.className = "faneknap";
            knap.type = "button";
            knap.setAttribute("role", "tab");
            knap.innerHTML = "<span class=\"nr\">" + f.nr + "</span>" + f.titel + "<span class=\"faerdig\"></span>";
            knap.addEventListener("click", function () { visFane(f.id); });
            knapper.appendChild(knap);

            faner.push({ id: f.id, nr: f.nr, sektion: sektion, knap: knap, hash: f.hash });
            /* Fanen skal vises, mens figuren bygges, saa tekst kan maales */
            sektion.classList.add("aktiv");
            byggere[f.id] = new NK.Bygger(sektion, def);
            sektion.classList.remove("aktiv");
        });
        NK.byggere = byggere;

        /* Kan fanerne ikke staa paa én raekke, gaar de over to lige lange
           raekker, saa alle navne kan ses (brugeren 10. nov. 2026, B7 med
           otte faner). Rullebjaelken er skjult, saa en fane uden for
           skaermen var usynlig. */
        var skel = document.createElement("span");
        skel.className = "faneskel";
        function fanerIRaekker() {
            knapper.classList.remove("to-raekker");
            if (skel.parentNode) skel.parentNode.removeChild(skel);
            if (knapper.scrollWidth <= knapper.clientWidth + 1) return;
            knapper.classList.add("to-raekker");
            var midt = faner[Math.ceil(faner.length / 2)];
            if (midt) knapper.insertBefore(skel, midt.knap);
        }
        NK.fanerIRaekker = fanerIRaekker;
        fanerIRaekker();
        window.addEventListener("resize", fanerIRaekker);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fanerIRaekker);

        document.addEventListener("keydown", tastatur);

        var oenske = "";
        try { oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase(); } catch (x) { oenske = ""; }
        var valgt = faner[0] ? faner[0].id : null;
        faner.forEach(function (f) { if (f.hash.indexOf(oenske) >= 0) valgt = f.id; });
        if (valgt) visFane(valgt);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());
