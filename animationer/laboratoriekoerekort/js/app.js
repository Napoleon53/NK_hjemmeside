/* =====================================================================
   Laboratoriekoerekort - forside, proeve og resultat

   Proeven tager grund-spoergsmaalene fra puljen i spoergsmaal.js (dem
   uden ekstra: true) i samme raekkefoelge som filen, saa numrene er
   faste. Svarene blandes stadig (medmindre blandSvar er false). Eleven
   faar at vide, hvor mange svar der skal vaelges: ét svar giver runde
   valgknapper, flere svar giver afkrydsning med en taeller. Et
   spoergsmaal er rigtigt, naar praecis de rigtige svar er valgt.
   Hoejst ANDEL_FEJL af spoergsmaalene maa vaere forkerte.

   Spoergsmaal markeret ekstra: true er inaktive fra start. Efter
   afleveringen kan eleven valgfrit trykke "5 situationer mere", som
   foejer dem til proeven og fortsaetter den.
   ===================================================================== */
(function () {
    "use strict";

    var PULJE = window.SPOERGSMAAL || [];
    var GRUND = PULJE.filter(function (sp) { return !sp.ekstra; });
    var EKSTRA = PULJE.filter(function (sp) { return sp.ekstra; });
    var ANTAL = Infinity;      /* alle grund-spoergsmaal; saet fx 10 for et tilfaeldigt udvalg */
    var ANDEL_FEJL = 0.2;

    var antal = Math.min(ANTAL, GRUND.length);
    var ekstraTilfoejet = false;

    var proeve = [];   /* { sp, svar, krav (antal rigtige), valgt: [bool] } */
    var nr = 0;

    var HOEJTTALER = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    function el(id) { return document.getElementById(id); }

    function bland(liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function lav(tag, klasse, tekst) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (tekst !== undefined) e.textContent = tekst;
        return e;
    }

    function antalValgt(p) { return p.valgt.filter(Boolean).length; }

    function vejledningstekst(p) { return p.krav === 1 ? "Vælg ét svar" : "Vælg " + p.krav + " svar"; }

    /* ------------------------------------------------------ Oplaesning */
    var kanTale = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

    function sig(tekst) {
        if (!kanTale) return;
        window.speechSynthesis.cancel();
        var ytring = new SpeechSynthesisUtterance(tekst);
        ytring.lang = "da-DK";
        var dansk = window.speechSynthesis.getVoices().filter(function (v) { return /^da/i.test(v.lang); })[0];
        if (dansk) ytring.voice = dansk;
        ytring.rate = 0.95;
        window.speechSynthesis.speak(ytring);
    }

    function laesSpoergsmaal() {
        var p = proeve[nr];
        var dele = [p.sp.spoergsmaal, vejledningstekst(p) + "."];
        p.svar.forEach(function (s, i) { dele.push((i + 1) + ". " + s.tekst); });
        sig(dele.join(" "));
    }

    /* ---------------------------------------------------------- Sider */
    function visSide(id) {
        ["forside", "proeve", "resultat"].forEach(function (s) { el(s).hidden = s !== id; });
        window.scrollTo({ top: 0, behavior: "instant" });   /* sitets style.css ruller ellers blødt */
    }

    function lavProever(liste) {
        return liste.map(function (sp) {
            var svar = sp.blandSvar === false ? sp.svar.slice() : bland(sp.svar);
            return {
                sp: sp,
                svar: svar,
                krav: svar.filter(function (s) { return s.rigtig; }).length,
                valgt: svar.map(function () { return false; })
            };
        });
    }

    function start() {
        ekstraTilfoejet = false;
        proeve = lavProever(GRUND.slice(0, antal));
        antal = proeve.length;
        nr = 0;
        byggPrikker();
        visSide("proeve");
        visSpoergsmaal();
    }

    function flereSpoergsmaal() {
        ekstraTilfoejet = true;
        var foerste = proeve.length;
        proeve = proeve.concat(lavProever(EKSTRA));
        antal = proeve.length;
        nr = foerste;
        byggPrikker();
        visSide("proeve");
        visSpoergsmaal();
    }

    /* --------------------------------------------------------- Proeven */
    function visSpoergsmaal() {
        var p = proeve[nr];
        var billede = el("billede");
        billede.src = p.sp.billede;
        billede.alt = p.sp.alt;
        el("billede-slor").style.backgroundImage = 'url("' + p.sp.billede + '")';

        el("spoergsmaal").textContent = p.sp.spoergsmaal;
        el("status").textContent = "Spørgsmål " + (nr + 1) + " af " + antal;

        var vejledning = el("vejledning");
        vejledning.textContent = vejledningstekst(p);
        vejledning.classList.toggle("flere", p.krav > 1);
        if (p.krav > 1) {
            var taeller = lav("span", "lk-taeller");
            taeller.id = "taeller";
            vejledning.appendChild(taeller);
            opdaterTaeller(p);
        }

        var boks = el("svar");
        boks.innerHTML = "";
        p.svar.forEach(function (s, i) {
            var raekke = lav("div", "lk-valg");
            var label = lav("label", "lk-valg-label");
            var afkryds = document.createElement("input");
            afkryds.type = p.krav > 1 ? "checkbox" : "radio";
            afkryds.name = "svar";
            afkryds.checked = p.valgt[i];
            afkryds.addEventListener("change", function () { vaelg(p, i, afkryds); });
            label.appendChild(afkryds);
            label.appendChild(lav("span", "", s.tekst));
            raekke.appendChild(label);

            if (kanTale) {
                var knap = lav("button", "lk-laes-svar");
                knap.type = "button";
                knap.setAttribute("aria-label", "Læs svaret højt");
                knap.innerHTML = HOEJTTALER;
                knap.addEventListener("click", function () { sig(s.tekst); });
                raekke.appendChild(knap);
            }
            boks.appendChild(raekke);
        });

        el("forrige").disabled = nr === 0;
        el("naeste").textContent = nr === antal - 1 ? "Aflever" : "Næste";
        opdaterPrikker();

        if (kanTale) {
            window.speechSynthesis.cancel();
            if (el("auto").checked) laesSpoergsmaal();
        }
    }

    function vaelg(p, i, afkryds) {
        if (p.krav === 1) {
            p.valgt = p.valgt.map(function (v, j) { return j === i; });
        } else if (afkryds.checked && antalValgt(p) >= p.krav) {
            /* Der er allerede valgt det antal svar, der skal vaelges */
            afkryds.checked = false;
            var taeller = el("taeller");
            taeller.classList.remove("ryst");
            void taeller.offsetWidth;
            taeller.classList.add("ryst");
        } else {
            p.valgt[i] = afkryds.checked;
        }
        opdaterTaeller(p);
        opdaterPrikker();
    }

    function opdaterTaeller(p) {
        var taeller = el("taeller");
        if (!taeller) return;
        taeller.textContent = antalValgt(p) + " af " + p.krav + " valgt";
        taeller.classList.toggle("fuld", antalValgt(p) === p.krav);
    }

    function gaaTil(i) {
        nr = Math.max(0, Math.min(antal - 1, i));
        visSpoergsmaal();
        el("spoergsmaal").focus();
    }

    function byggPrikker() {
        var liste = el("prikker");
        liste.innerHTML = "";
        proeve.forEach(function (p, i) {
            var li = document.createElement("li");
            var knap = lav("button", "", String(i + 1));
            knap.type = "button";
            knap.setAttribute("aria-label", "Spørgsmål " + (i + 1));
            knap.addEventListener("click", function () { gaaTil(i); });
            li.appendChild(knap);
            liste.appendChild(li);
        });
    }

    function opdaterPrikker() {
        var knapper = el("prikker").querySelectorAll("button");
        proeve.forEach(function (p, i) {
            knapper[i].classList.toggle("aktiv", i === nr);
            knapper[i].classList.toggle("besvaret", antalValgt(p) >= p.krav);
            if (i === nr) knapper[i].setAttribute("aria-current", "step");
            else knapper[i].removeAttribute("aria-current");
        });
    }

    /* -------------------------------------------------------- Resultat */
    function erRigtig(p) {
        return p.svar.every(function (s, i) { return s.rigtig === p.valgt[i]; });
    }

    function aflever() {
        var mangler = proeve.filter(function (p) { return antalValgt(p) < p.krav; }).length;
        if (mangler > 0) {
            var tekst = mangler === 1 ? "1 spørgsmål mangler svar." : mangler + " spørgsmål mangler svar.";
            if (!window.confirm(tekst + " Vil du aflevere alligevel?")) return;
        }
        if (kanTale) window.speechSynthesis.cancel();

        var fejl = proeve.filter(function (p) { return !erRigtig(p); }).length;
        var maksFejl = Math.floor(antal * ANDEL_FEJL);
        var bestaaet = fejl <= maksFejl;

        var titel = el("res-titel");
        titel.textContent = bestaaet ? "Bestået" : "Ikke bestået";
        titel.className = bestaaet ? "bestaaet" : "ikke-bestaaet";
        el("res-tekst").textContent = (antal - fejl) + " af " + antal + " rigtige. " +
            (bestaaet ? "Kørekortet er udstedt." : "Brænderen forbliver slukket. Du må højst have " + maksFejl + " fejl.");
        el("status").textContent = "Resultat";

        udfyldKort(bestaaet);
        el("udskriv").hidden = !bestaaet;
        el("flere-spoergsmaal").hidden = ekstraTilfoejet || EKSTRA.length === 0;
        byggGennemgang();
        visSide("resultat");
    }

    function udfyldKort(bestaaet) {
        var navn = el("navn").value.trim();
        el("kort-navn").textContent = navn || "Uden navn";
        el("kort-dato").textContent = bestaaet ? new Date().toLocaleDateString("da-DK") : "Ikke udstedt";
        var stempel = el("kort-stempel");
        stempel.textContent = bestaaet ? "Bestået" : "Ikke bestået";
        stempel.classList.toggle("bestaaet", bestaaet);
        el("kort-plads-resultat").appendChild(el("kort"));
    }

    function byggGennemgang() {
        var liste = el("gennemgang");
        liste.innerHTML = "";
        proeve.forEach(function (p, i) {
            var rigtig = erRigtig(p);
            var li = document.createElement("li");

            var billede = document.createElement("img");
            billede.src = p.sp.billede;
            billede.alt = "";
            li.appendChild(billede);

            var indhold = document.createElement("div");
            indhold.appendChild(lav("span", "lk-gg-maerke " + (rigtig ? "rigtigt" : "forkert"), rigtig ? "Rigtigt" : "Forkert"));
            indhold.appendChild(lav("h3", "", (i + 1) + ". " + p.sp.spoergsmaal));

            var svar = lav("ul", "lk-gg-svar");
            p.svar.forEach(function (s, j) {
                var punkt = lav("li", (s.rigtig ? "korrekt" : "") + (p.valgt[j] ? " valgt" : ""));
                punkt.appendChild(lav("span", "visuelt-skjult", s.rigtig ? "Korrekt svar: " : "Forkert svar: "));
                punkt.appendChild(lav("span", "", s.tekst));
                if (p.valgt[j]) punkt.appendChild(lav("span", "lk-gg-valg", "Dit valg"));
                svar.appendChild(punkt);
            });
            indhold.appendChild(svar);
            indhold.appendChild(lav("p", "lk-gg-kommentar", p.sp.kommentar));

            li.appendChild(indhold);
            liste.appendChild(li);
        });
    }

    /* ----------------------------------------------------------- Start */
    el("regel-antal").textContent = antal;
    el("regel-fejl").textContent = Math.floor(antal * ANDEL_FEJL);
    el("spoergsmaal").setAttribute("tabindex", "-1");

    if (kanTale) {
        el("vaerktoej").hidden = false;
        try { el("auto").checked = localStorage.getItem("lk-auto") === "1"; } catch (e) { /* privat tilstand */ }
        el("auto").addEventListener("change", function () {
            try { localStorage.setItem("lk-auto", el("auto").checked ? "1" : "0"); } catch (e) { /* privat tilstand */ }
            if (el("auto").checked) laesSpoergsmaal();
            else window.speechSynthesis.cancel();
        });
        el("laes").addEventListener("click", laesSpoergsmaal);
    }

    el("start").addEventListener("click", start);
    el("navn").addEventListener("keydown", function (e) { if (e.key === "Enter") start(); });
    el("forrige").addEventListener("click", function () { gaaTil(nr - 1); });
    el("naeste").addEventListener("click", function () {
        if (nr === antal - 1) aflever();
        else gaaTil(nr + 1);
    });
    el("igen").addEventListener("click", start);
    el("udskriv").addEventListener("click", function () { window.print(); });
    el("flere-spoergsmaal").addEventListener("click", flereSpoergsmaal);
})();
