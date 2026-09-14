/* =====================================================================
   app.js - binder forsoeget, maaleskemaet, quizzen og panelet sammen

   Knapper, tastatur, pop op-vinduer og tegneloekken.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;

    var forsoeg, quiz;
    var sidsteTid = 0;
    var sidsteSignatur = "";
    var beskedUr = null;
    var hintTrin = "";

    /* ----- Forloebet ---------------------------------------------------- */
    function opdaterPanel() {
        var f = forsoeg;
        var aktuelt = f.aktueltTrin();
        var aktivId = aktuelt ? aktuelt.id : "";
        var ol = NK.el("trin-liste");
        ol.innerHTML = "";
        var antalGjort = 0;
        NK.TRIN.forEach(function (t, i) {
            var gjort = f.trinGjort(t.id);
            var li = document.createElement("li");
            if (gjort) { li.className = "gjort"; antalGjort++; }
            else if (t.id === aktivId) li.className = "aktiv";
            var nr = document.createElement("span");
            nr.className = "nr";
            nr.textContent = gjort ? "✓" : String(i + 1);
            li.appendChild(nr);
            li.appendChild(document.createTextNode(t.tekst));
            ol.appendChild(li);
        });
        NK.saetTekst("forloeb-taeller", antalGjort + "/" + NK.TRIN.length);

        if (aktivId !== hintTrin) {
            hintTrin = aktivId;
            NK.el("hint-tekst").hidden = true;
        }
        NK.el("hint-knap").disabled = !aktuelt || aktivId === "beregn";

        var ak = NK.el("arbejd-knap");
        var knapRyst = f.arbejdKilde === "knap-ryst";
        ak.hidden = f.arbejdsType() !== "ryst" && !knapRyst;
        ak.disabled = !(knapRyst || f.kanRyste());
        ak.classList.toggle("aktiv", knapRyst);

        var dk = NK.el("draabe-knap");
        dk.hidden = !(f.buret.fyldt && f.vSlut === null && (f.vStart === null || f.g.kolbe.sted === "buret"));
        dk.disabled = !f.kanDraabe();

        /* Maaleskemaet */
        NK.saetTekst("maal-nr", "Forsøg " + f.forsoegNr);
        NK.saetTekst("m-staal", f.mStaal !== null ? M.komma(f.mStaal, 3) + " g" : "");
        NK.saetTekst("v-start", f.vStart !== null ? M.komma(f.vStart, 2) + " mL" : "");
        NK.saetTekst("v-slut", f.vSlut !== null ? M.komma(f.vSlut, 2) + " mL" : "");
        var kanBeregne = f.vSlut !== null && !f.gjort.beregn;
        NK.el("hjaelp-beregn").hidden = !kanBeregne;
        var beregn = NK.el("beregn");
        if (kanBeregne && beregn.hidden) {
            beregn.hidden = false;
            NK.el("svar").value = "";
            NK.el("svar").classList.remove("forkert");
        } else if (!kanBeregne) {
            beregn.hidden = true;
        }
        if (f.vSlut === null) NK.el("beregn-hint").hidden = true;
        visSammenligning();
        visTidligere();

        quiz.saetLaast(!f.harSvovlsyreResultat());
        sidsteSignatur = signatur();
    }

    function signatur() {
        var f = forsoeg;
        var t = f.aktueltTrin();
        return [
            t ? t.id : "", !!f.handling, f.arbejdKilde, f.arbejdsType(), f.kanRyste(), f.kanDraabe(),
            f.buret.fyldt, f.buret.aaben, f.g.kolbe.sted, f.mStaal, f.vStart, f.vSlut,
            !!f.gjort.beregn, f.resultater.length, f.forsoegNr,
            NK.TRIN.map(function (x) { return f.trinGjort(x.id) ? 1 : 0; }).join("")
        ].join("|");
    }

    function visHint() {
        var tekst = forsoeg.hint();
        var el = NK.el("hint-tekst");
        if (!tekst) { el.hidden = true; return; }
        el.textContent = tekst;
        el.hidden = false;
        NK.el("hint-knap").classList.remove("banker");
    }

    /* ----- Beregningen -------------------------------------------------- */
    var HINT = {
        tom: "Skriv jernindholdet som et tal.",
        broek: "Tallet er en brøkdel. Jernindholdet skal angives i procent.",
        gram: "Det er massen af jernet. Hvor mange procent er det af stålulden?",
        slut: "Brug det forbrugte volumen: slutaflæsningen minus startaflæsningen.",
        fem: "Husk forholdet i reaktionsskemaet: hver MnO₄⁻ reagerer med 5 Fe²⁺.",
        femDiv: "Der er 5 Fe²⁺ for hver MnO₄⁻. Stofmængden af Fe²⁺ er derfor større end stofmængden af MnO₄⁻.",
        ml: "Volumen skal regnes i liter, når koncentrationen er i M (mol/L).",
        omvendt: "Du har divideret den forkerte vej. Jernet er en del af stålulden."
    };

    function tjek() {
        var input = NK.el("svar");
        var svar = forsoeg.tjekSvar(input.value);
        if (!svar) return;
        var hint = NK.el("beregn-hint");
        if (svar.slags === "rigtig") {
            hint.hidden = true;
            input.classList.remove("forkert");
            opdaterPanel();
            return;
        }
        input.classList.add("forkert");
        var tekst = HINT[svar.slags];
        if (!tekst) {
            tekst = svar.forkerte >= 2
                ? "Jernindhold = 5 · c · V · M(Fe) / m(ståluld) · 100 %. Du kan også bruge Hjælp til beregningen."
                : "Find først stofmængden af MnO₄⁻ ud fra koncentrationen og det forbrugte volumen.";
        }
        hint.textContent = tekst;
        hint.hidden = false;
        input.focus();
        input.select();
    }

    function visSammenligning() {
        var f = forsoeg;
        var boks = NK.el("sammenligning");
        var sidste = f.gjort.beregn ? f.resultater[f.resultater.length - 1] : null;
        if (!sidste) { boks.hidden = true; return; }
        boks.hidden = false;
        var typisk = M.STAALULD.typisk;
        var skala = 120;
        NK.el("soejle-resultat").style.width = NK.klamp(sidste.procent / skala * 100, 0, 100) + "%";
        NK.el("soejle-typisk").style.width = (typisk / skala * 100) + "%";
        NK.saetTekst("tal-resultat", M.komma(sidste.procent, 1) + " %");
        NK.saetTekst("tal-typisk", M.komma(typisk, 1) + " %");
        var tekst;
        if (sidste.procent > 101) tekst = "Resultatet er over 100 %. Der er brugt mere KMnO₄, end jernet kan forklare.";
        else if (sidste.procent < 95) tekst = "Resultatet er lavere end forventet. Hvor kan resten af jernet være blevet af?";
        else tekst = "Resultatet passer med, at ståluld næsten er rent jern.";
        NK.saetTekst("sammenligning-tekst", tekst);
    }

    function visTidligere() {
        var ul = NK.el("tidligere");
        var f = forsoeg;
        var noegle = f.resultater.map(function (x) { return x.nr + "|" + x.syre + "|" + M.komma(x.procent, 1); }).join(";");
        if (ul.getAttribute("data-noegle") === noegle) return;
        ul.setAttribute("data-noegle", noegle);
        ul.innerHTML = "";
        f.resultater.forEach(function (x) {
            var li = document.createElement("li");
            var b = document.createElement("b");
            b.textContent = "Forsøg " + x.nr;
            li.appendChild(b);
            li.appendChild(document.createTextNode(": " + M.SYRER[x.syre].navn + ", " + M.komma(x.procent, 1) + " %"));
            ul.appendChild(li);
        });
    }

    function maaling(hvad) {
        var raekke = NK.el("raekke-" + hvad);
        opdaterPanel();
        if (!raekke) return;
        raekke.classList.remove("ny");
        void raekke.offsetWidth;
        raekke.classList.add("ny");
    }

    /* ----- Iagttagelser -------------------------------------------------- */
    function iagttagelse(i) {
        var ul = NK.el("iagttagelse-liste");
        var tom = ul.querySelector(".tom");
        if (tom) tom.remove();
        var li = document.createElement("li");
        li.textContent = i.tekst;
        ul.appendChild(li);
    }

    function rydIagttagelser() {
        NK.el("iagttagelse-liste").innerHTML = '<li class="tom">Endnu ingen.</li>';
    }

    /* ----- Guidet hjaelp til beregningen -------------------------------
       Hvert trin tjekkes mod elevens eget svar i trinnet foer, saa en
       lille afrunding ikke giver fejl senere. Sidste trin tjekkes mod det
       rigtige resultat. */
    var ANTAL_G = 5;
    var guide = { trin: 1 };

    function guideVis() {
        for (var n = 1; n <= ANTAL_G; n++) {
            var li = NK.el("g" + n);
            li.className = n < guide.trin ? "gjort" : (n === guide.trin ? "aktiv" : "laast");
            NK.el("g" + n + "-svar").disabled = n !== guide.trin;
            NK.el("g" + n + "-tjek").disabled = n !== guide.trin;
        }
        NK.el("guide-brug").hidden = guide.trin <= ANTAL_G;
    }

    function aabnGuide() {
        var t = forsoeg.jernTal();
        if (!t || forsoeg.gjort.beregn) return;
        guide = { trin: 1 };
        NK.el("g1-tal").textContent = M.komma(t.vSlut, 2) + " mL − " + M.komma(t.vStart, 2) + " mL =";
        NK.el("g2-tal").textContent = "0,0200 M · V =";
        NK.el("g3-tal").textContent = "5 · n(MnO₄⁻) =";
        NK.el("g4-tal").textContent = "n(Fe²⁺) · 55,85 g/mol =";
        NK.el("g5-tal").textContent = "m(Fe) / " + M.komma(t.mStaal, 3) + " g · 100 % =";
        for (var n = 1; n <= ANTAL_G; n++) {
            var input = NK.el("g" + n + "-svar");
            input.value = "";
            input.classList.remove("forkert");
            NK.el("g" + n + "-hint").hidden = true;
        }
        guideVis();
        NK.Rundvisning.luk();
        NK.el("guide").classList.add("vis");
        NK.el("g1-svar").focus();
    }

    function naer(v, x, rel, abs) {
        return Math.abs(v - x) <= Math.max(abs || 0, Math.abs(x) * rel);
    }

    function guideTjek(n) {
        if (n !== guide.trin) return;
        var t = forsoeg.jernTal();
        if (!t) return;
        var input = NK.el("g" + n + "-svar");
        var hint = NK.el("g" + n + "-hint");
        var v = M.tal(input.value);
        var fejl = null;
        if (isNaN(v)) {
            fejl = "Skriv et tal.";
        } else if (n === 1) {
            if (!naer(v, t.V, 0, 0.006)) {
                if (naer(v, -t.V, 0, 0.006)) fejl = "Træk startaflæsningen fra slutaflæsningen.";
                else if (naer(v, t.vSlut, 0, 0.006)) fejl = "Det er slutaflæsningen. Træk startaflæsningen fra.";
                else fejl = "Træk V(start) fra V(slut).";
            }
        } else if (n === 2) {
            var nMn = M.KMNO4.c * guide.V / 1000;
            if (!naer(v, nMn, 0.008)) {
                if (naer(v, nMn * 1000, 0.01)) fejl = "Tallet er 1000 gange for stort. Regn volumen om til liter først.";
                else fejl = "Gang koncentrationen med volumen i liter.";
            }
        } else if (n === 3) {
            var nFe = 5 * guide.nMn;
            if (!naer(v, nFe, 0.008)) {
                if (naer(v, guide.nMn / 5, 0.01)) fejl = "Der er 5 Fe²⁺ for hver MnO₄⁻. Gang med 5.";
                else if (naer(v, guide.nMn, 0.01)) fejl = "Brug forholdet mellem Fe²⁺ og MnO₄⁻ i reaktionsskemaet.";
                else fejl = "Gang stofmængden af MnO₄⁻ med 5.";
            }
        } else if (n === 4) {
            var mFe = guide.nFe * M.M_FE;
            if (!naer(v, mFe, 0.008)) {
                if (naer(v, guide.nFe / M.M_FE, 0.01)) fejl = "Du har divideret. Massen er stofmængden gange den molare masse.";
                else fejl = "Gang stofmængden med den molare masse af jern.";
            }
        } else {
            var egen = guide.mFe / t.mStaal * 100;
            var ok = naer(v, t.procent, 0.01, 0.5);
            if (!ok) {
                if (naer(v, egen, 0.004, 0.3)) fejl = "Næsten. Brug flere decimaler i mellemregningerne.";
                else if (naer(v, egen / 100, 0.01)) fejl = "Gang med 100 for at få jernindholdet i procent.";
                else if (guide.mFe > 0 && naer(v, t.mStaal / guide.mFe * 100, 0.01)) fejl = "Du har divideret den forkerte vej.";
                else fejl = "Divider massen af jernet med massen af stålulden, og gang med 100.";
            }
        }
        if (fejl) {
            hint.textContent = fejl;
            hint.hidden = false;
            input.classList.add("forkert");
            input.focus();
            input.select();
            return;
        }
        hint.hidden = true;
        input.classList.remove("forkert");
        if (n === 1) { guide.V = v; NK.el("g2-tal").textContent = "0,0200 M · " + M.komma(v, 2) + " mL ="; }
        if (n === 2) { guide.nMn = v; NK.el("g3-tal").textContent = "5 · " + M.videnskabelig(v, 3) + " mol ="; }
        if (n === 3) { guide.nFe = v; NK.el("g4-tal").textContent = M.videnskabelig(v, 3) + " mol · 55,85 g/mol ="; }
        if (n === 4) { guide.mFe = v; NK.el("g5-tal").textContent = M.komma(v, 4) + " g / " + M.komma(t.mStaal, 3) + " g · 100 % ="; }
        if (n === 5) guide.procent = v;
        guide.trin = n + 1;
        guideVis();
        if (n < ANTAL_G) NK.el("g" + (n + 1) + "-svar").focus();
        else NK.el("guide-brug").focus();
    }

    function guideBrug() {
        if (guide.trin <= ANTAL_G) return;
        NK.el("svar").value = String(guide.procent).replace(".", ",");
        lukOverlay();
        tjek();
    }

    /* ----- Beskeden paa scenen ------------------------------------------ */
    function besked(tekst, slags) {
        var el = NK.el("scenebesked");
        el.className = "scenebesked";
        void el.offsetWidth;
        el.textContent = tekst;
        el.className = "scenebesked vis " + slags;
        window.clearTimeout(beskedUr);
        beskedUr = window.setTimeout(function () { el.classList.remove("vis"); }, 2800);
    }

    /* ----- Pop op-vinduer, lyd og nyt forsoeg ------------------------------ */
    function aabnTeori() {
        NK.Rundvisning.luk();
        NK.el("teori").classList.add("vis");
    }

    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function visLyd() {
        var til = NK.Lyd.erTil();
        var knap = NK.el("lydknap");
        knap.classList.toggle("fra", !til);
        knap.setAttribute("aria-pressed", til ? "true" : "false");
    }

    function skiftLyd() {
        NK.Lyd.saet(!NK.Lyd.erTil());
        NK.Lyd.laasOp();
        visLyd();
    }

    function nytForsoeg() {
        forsoeg.stopArbejde();
        forsoeg.holdt = null;
        forsoeg.nulstil();
        lukOverlay();
        rydIagttagelser();
        NK.el("hint-tekst").hidden = true;
        NK.el("beregn-hint").hidden = true;
        NK.el("beregn").hidden = true;
        opdaterPanel();
    }

    /* ----- Tastatur ----------------------------------------------------- */
    function tastNed(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) {
            if (e.key === "Enter") {
                var gm = /^g([1-5])-svar$/.exec(e.target.id);
                if (e.target.id === "svar") { e.preventDefault(); tjek(); }
                else if (gm) { e.preventDefault(); guideTjek(Number(gm[1])); }
            }
            if (e.key === "Escape") lukOverlay();
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "Escape") { lukOverlay(); NK.Rundvisning.luk(); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start(); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;

        NK.Lyd.laasOp();
        var tast = e.key.toLowerCase();
        if (tast === "r") { if (!e.repeat) forsoeg.arbejdKnap(true); }
        else if (tast === "d") { if (!e.repeat) forsoeg.draabe(); }
        else if (tast === "o") { if (!e.repeat) forsoeg.klik("hane"); }
        else if (tast === "i") visHint();
        else if (tast === "m") skiftLyd();
        else if (tast === "t") aabnTeori();
        else if (tast === "n") nytForsoeg();
    }

    function tastOp(e) {
        if (e.key === "r" || e.key === "R") forsoeg.arbejdKnap(false);
    }

    /* ----- Tegneloekken ------------------------------------------------ */
    function loekke(ts) {
        var dt = (ts - sidsteTid) / 1000;
        sidsteTid = ts;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;

        forsoeg.tilpas();
        forsoeg.opdater(dt);
        forsoeg.tegn();

        if (signatur() !== sidsteSignatur) opdaterPanel();
        var sidderFast = forsoeg.aktueltTrin() && forsoeg.tid - forsoeg.trinStart > 25 && NK.el("hint-tekst").hidden && !NK.el("hint-knap").disabled;
        NK.el("hint-knap").classList.toggle("banker", !!sidderFast);
        window.requestAnimationFrame(loekke);
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        quiz = new NK.Quiz();
        forsoeg = new NK.Forsoeg(NK.el("scene-laerred"));

        /* Saa modellen kan pilles ved fra konsollen og fra _selvtest.html */
        NK.forsoeg = forsoeg;
        NK.quiz = quiz;
        NK.opdaterPanel = opdaterPanel;
        NK.tjek = tjek;
        NK.nytForsoeg = nytForsoeg;

        forsoeg.vedAendring = function () { if (quiz) opdaterPanel(); };
        forsoeg.vedBesked = besked;
        forsoeg.vedIagttagelse = iagttagelse;
        forsoeg.vedMaaling = maaling;

        var ak = NK.el("arbejd-knap");
        ak.addEventListener("pointerdown", function (e) {
            NK.Lyd.laasOp();
            if (forsoeg.arbejdKnap(true)) { try { ak.setPointerCapture(e.pointerId); } catch (fejl) {} }
        });
        ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (type) {
            ak.addEventListener(type, function () { forsoeg.arbejdKnap(false); });
        });
        ak.addEventListener("contextmenu", function (e) { e.preventDefault(); });

        NK.el("draabe-knap").addEventListener("click", function () { NK.Lyd.laasOp(); forsoeg.draabe(); });
        NK.el("hint-knap").addEventListener("click", visHint);
        NK.el("tjek-knap").addEventListener("click", tjek);
        NK.el("hjaelp-beregn").addEventListener("click", aabnGuide);
        for (var n = 1; n <= ANTAL_G; n++) {
            (function (k) { NK.el("g" + k + "-tjek").addEventListener("click", function () { guideTjek(k); }); }(n));
        }
        NK.el("guide-brug").addEventListener("click", guideBrug);
        NK.el("guide-luk").addEventListener("click", lukOverlay);
        NK.el("guide").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.guide = { aabn: aabnGuide, tjek: guideTjek, brug: guideBrug, tilstand: function () { return guide; } };
        NK.el("nytknap").addEventListener("click", nytForsoeg);
        NK.el("teoriknap").addEventListener("click", aabnTeori);
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.el("lydknap").addEventListener("click", skiftLyd);
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });

        document.addEventListener("keydown", tastNed);
        document.addEventListener("keyup", tastOp);
        window.addEventListener("blur", function () { forsoeg.arbejdKnap(false); });

        visLyd();
        forsoeg.tilpas();
        opdaterPanel();

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());
