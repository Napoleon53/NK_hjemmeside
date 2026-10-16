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
    function trinListe() {
        var f = forsoeg;
        if (f.oprydning) return f.oprydningListe();
        if (f.uheld) {
            return [
                { id: "sluk", tekst: "Ilden slukkes", gjort: !!f.uheld.slukket },
                { id: "nyt", tekst: "Start et nyt forsøg", gjort: false }
            ];
        }
        return NK.TRIN.map(function (t) { return { id: t.id, tekst: t.tekst, gjort: f.trinGjort(t.id) }; });
    }

    function opdaterPanel() {
        var f = forsoeg;
        var liste = trinListe();
        var aktuelt = f.aktueltTrin();
        var aktivId = f.uheld ? (f.uheld.slukket ? "nyt" : "sluk") : (aktuelt ? aktuelt.id : "");
        var ol = NK.el("trin-liste");
        ol.innerHTML = "";
        var antalGjort = 0;
        liste.forEach(function (t, i) {
            var li = document.createElement("li");
            if (t.gjort) { li.className = "gjort"; antalGjort++; }
            else if (t.id === aktivId) li.className = "aktiv";
            var nr = document.createElement("span");
            nr.className = "nr";
            nr.textContent = t.gjort ? "✓" : String(i + 1);
            li.appendChild(nr);
            li.appendChild(document.createTextNode(t.tekst));
            ol.appendChild(li);
        });
        NK.saetTekst("forloeb-titel", f.uheld ? "Uheld" : (f.oprydning ? "Oprydning" : "Forløb"));
        NK.saetTekst("forloeb-taeller", f.uheld ? "" : antalGjort + "/" + liste.length);
        NK.el("forloeb-kort").classList.toggle("uheld", !!(f.uheld || f.oprydning));

        var id = aktuelt ? aktuelt.id : "";
        if (id !== hintTrin) {
            hintTrin = id;
            NK.el("hint-tekst").hidden = true;
        }
        NK.el("hint-knap").disabled = !aktuelt || id === "beregn";

        var type = f.arbejdsType();
        var ak = NK.el("arbejd-knap");
        var kilde = f.arbejdKilde;
        ak.hidden = !(type || (kilde && kilde.indexOf("knap") === 0)) || !!f.uheld || !!f.oprydning;
        ak.disabled = !((kilde && kilde.indexOf("knap") === 0) || (type === "knus" ? f.kanKnuse() : (type === "roer" && f.kanRoere())));
        ak.classList.toggle("aktiv", !!(kilde && kilde.indexOf("knap") === 0));
        NK.saetTekst("arbejd-tekst", type === "roer" ? "Rør rundt" : "Knus");

        NK.el("uheld-boks").hidden = !(f.uheld && f.uheld.faerdig);

        /* Maaleskemaet */
        NK.saetTekst("maal-nr", "Forsøg " + f.forsoegNr);
        NK.saetTekst("m-chips", f.mChips !== null ? M.komma(f.mChips) + " g" : "");
        NK.saetTekst("m-b", f.mB !== null ? M.komma(f.mB) + " g" : "");
        NK.saetTekst("m-bf", f.mBF !== null ? M.komma(f.mBF) + " g" : "");
        var kanBeregne = f.mBF !== null && !f.gjort.beregn;
        NK.el("hjaelp-beregn").hidden = !kanBeregne;
        var beregn = NK.el("beregn");
        if (kanBeregne && beregn.hidden) {
            beregn.hidden = false;
            NK.el("svar").value = "";
            NK.el("svar").classList.remove("forkert");
        } else if (!kanBeregne) {
            beregn.hidden = true;
        }
        if (f.mBF === null) NK.el("beregn-hint").hidden = true;
        visSammenligning();
        visTidligere();

        quiz.saetLaast(!f.harHeptanResultat());
        sidsteSignatur = signatur();
    }

    function signatur() {
        var f = forsoeg;
        var t = f.aktueltTrin();
        return [
            t ? t.id : "", !!f.handling, f.arbejdKilde, f.arbejdsType(), f.kanKnuse(), f.kanRoere(),
            f.uheld ? (f.uheld.slukket ? "s" : "b") + (f.uheld.faerdig ? "f" : "") : "",
            f.oprydning ? f.oprydning.trin : "", !!f.heptanSpild,
            f.mChips, f.mB, f.mBF, !!f.gjort.beregn, f.resultater.length, f.forsoegNr,
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
        tom: "Skriv fedtindholdet som et tal.",
        broek: "Tallet er en brøkdel. Fedtindholdet skal angives i procent.",
        gram: "Det er massen af fedtet. Hvor mange procent er det af chipsenes masse?",
        baeger: "Petriskålen vejer også noget. Træk massen af den tomme petriskål fra.",
        omvendt: "Du har divideret den forkerte vej. Fedtet er en del af chipsene."
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
                ? "Fedtindhold = m(fedt) / m(chips) · 100 %. Du kan også bruge Hjælp til beregningen."
                : "Find først massen af fedtet ud fra de to vejninger af petriskålen.";
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
        if (!sidste || sidste.procent === null) { boks.hidden = true; return; }
        boks.hidden = false;
        var dekl = M.CHIPS.deklaration;
        var skala = 40;
        NK.el("soejle-resultat").style.width = NK.klamp(sidste.procent / skala * 100, 0, 100) + "%";
        NK.el("soejle-dekl").style.width = (dekl / skala * 100) + "%";
        NK.saetTekst("tal-resultat", M.komma(sidste.procent, 1) + " %");
        NK.saetTekst("tal-dekl", dekl + " %");
        var tekst;
        if (sidste.midl === "vand") tekst = "Resultatet er langt fra varedeklarationen. Prøv et andet opløsningsmiddel.";
        else if (sidste.procent < dekl - 3) tekst = "Resultatet er lavere end varedeklarationen. Hvor kan resten af fedtet være blevet af?";
        else tekst = "Resultatet ligger tæt på varedeklarationen.";
        NK.saetTekst("sammenligning-tekst", tekst);
    }

    function visTidligere() {
        var ul = NK.el("tidligere");
        var f = forsoeg;
        var tekst = f.resultater.map(function (x) {
            return x.nr + "|" + (x.midl || "") + "|" + (x.procent === null ? "brand" : M.komma(x.procent, 1));
        }).join(";");
        if (ul.getAttribute("data-noegle") === tekst) return;
        ul.setAttribute("data-noegle", tekst);
        ul.innerHTML = "";
        f.resultater.forEach(function (x) {
            var li = document.createElement("li");
            var b = document.createElement("b");
            b.textContent = "Forsøg " + x.nr;
            li.appendChild(b);
            var midl = x.midl ? M.MIDLER[x.midl].navn : "";
            var del = x.brand ? "brand, intet resultat" : M.komma(x.procent, 1) + " %";
            li.appendChild(document.createTextNode(": " + midl + ", " + del));
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
    /* Kun iagttagelser, der kan forklare resultatet. De hoerer til det
       aktuelle forsoeg og ryddes ved nyt forsoeg. */
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

    /* ----- Guidet hjaelp til beregningen ------------------------------- */
    var guide = { trin: 1, andel: null, procent: null };

    function guideVis() {
        for (var n = 1; n <= 3; n++) {
            var li = NK.el("g" + n);
            li.className = n < guide.trin ? "gjort" : (n === guide.trin ? "aktiv" : "laast");
            NK.el("g" + n + "-svar").disabled = n !== guide.trin;
            NK.el("g" + n + "-tjek").disabled = n !== guide.trin;
        }
        NK.el("guide-brug").hidden = guide.trin < 4;
    }

    function aabnGuide() {
        var t = forsoeg.fedtTal();
        if (!t || forsoeg.gjort.beregn) return;
        guide = { trin: 1, andel: null, procent: null };
        NK.el("g1-tal").textContent = M.komma(t.mBF) + " g − " + M.komma(t.mB) + " g =";
        NK.el("g2-tal").textContent = "m(fedt) / " + M.komma(t.mChips) + " g =";
        NK.el("g3-tal").textContent = "andel · 100 % =";
        for (var n = 1; n <= 3; n++) {
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

    function guideTjek(n) {
        if (n !== guide.trin) return;
        var t = forsoeg.fedtTal();
        if (!t) return;
        var input = NK.el("g" + n + "-svar");
        var hint = NK.el("g" + n + "-hint");
        var v = M.tal(input.value);
        var fejltekst = null;
        if (isNaN(v)) {
            fejltekst = "Skriv et tal.";
        } else if (n === 1) {
            if (Math.abs(v - t.mF) > 0.006) {
                fejltekst = Math.abs(v + t.mF) <= 0.006 ? "Træk den mindste masse fra den største."
                    : "Træk massen af den tomme petriskål fra massen af petriskålen med rest.";
            }
        } else if (n === 2) {
            var tol = Math.max(0.0006, t.andel * 0.004);
            if (Math.abs(v - t.andel) > tol) {
                if (Math.abs(v - t.andel) <= 0.006) fejltekst = "Næsten. Brug mindst tre decimaler.";
                else if (t.mF > 0 && Math.abs(v - t.mChips / t.mF) <= Math.max(0.05, t.mChips / t.mF * 0.02)) fejltekst = "Du har divideret den forkerte vej. Andelen er mindre end 1.";
                else if (Math.abs(v - t.andel * 100) <= Math.max(0.3, t.andel)) fejltekst = "Det er allerede i procent. Skriv andelen som et decimaltal.";
                else fejltekst = "Divider massen af fedtet med massen af chipsene.";
            }
        } else {
            var fraAndel = guide.andel * 100;
            if (!(Math.abs(v - fraAndel) <= 0.06 || Math.abs(v - t.procent) <= Math.max(0.15, t.procent * 0.01))) {
                fejltekst = "Gang andelen med 100 for at få fedtindholdet i procent.";
            }
        }
        if (fejltekst) {
            hint.textContent = fejltekst;
            hint.hidden = false;
            input.classList.add("forkert");
            input.focus();
            input.select();
            return;
        }
        hint.hidden = true;
        input.classList.remove("forkert");
        if (n === 1) NK.el("g2-tal").textContent = M.komma(t.mF) + " g / " + M.komma(t.mChips) + " g =";
        if (n === 2) { guide.andel = v; NK.el("g3-tal").textContent = String(v).replace(".", ",") + " · 100 % ="; }
        if (n === 3) guide.procent = v;
        guide.trin = n + 1;
        guideVis();
        if (n < 3) NK.el("g" + (n + 1) + "-svar").focus();
        else NK.el("guide-brug").focus();
    }

    function guideBrug() {
        if (guide.trin < 4) return;
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

    /* Introen aabner af sig selv foerste gang i browseren. Knappen Om
       forsøget aabner den igen. */
    var INTRO_GEMT = "nk-sc69-intro";

    function aabnIntro() {
        NK.Rundvisning.luk();
        lukOverlay();
        NK.el("intro").classList.add("vis");
        NK.el("intro-start").focus({ preventScroll: true });
    }

    function introFoersteGang() {
        var set = false;
        try {
            set = !!window.localStorage.getItem(INTRO_GEMT);
            window.localStorage.setItem(INTRO_GEMT, "set");
        } catch (fejl) { /* file:// eller privat browsing */ }
        if (!set) aabnIntro();
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
                var gm = /^g([123])-svar$/.exec(e.target.id);
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
        if (e.key === "r" || e.key === "R") { if (!e.repeat) forsoeg.arbejdKnap(true); }
        else if (e.key === "i" || e.key === "I") visHint();
        else if (e.key === "m" || e.key === "M") skiftLyd();
        else if (e.key === "t" || e.key === "T") aabnTeori();
        else if (e.key === "n" || e.key === "N") nytForsoeg();
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

        NK.el("hint-knap").addEventListener("click", visHint);
        NK.el("tjek-knap").addEventListener("click", tjek);
        NK.el("hjaelp-beregn").addEventListener("click", aabnGuide);
        [1, 2, 3].forEach(function (n) {
            NK.el("g" + n + "-tjek").addEventListener("click", function () { guideTjek(n); });
        });
        NK.el("guide-brug").addEventListener("click", guideBrug);
        NK.el("guide-luk").addEventListener("click", lukOverlay);
        NK.el("guide").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.guide = { aabn: aabnGuide, tjek: guideTjek, brug: guideBrug, tilstand: function () { return guide; } };
        NK.el("nytknap").addEventListener("click", nytForsoeg);
        NK.el("uheld-nyt").addEventListener("click", nytForsoeg);
        NK.el("teoriknap").addEventListener("click", aabnTeori);
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.el("lydknap").addEventListener("click", skiftLyd);
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });
        NK.el("introknap").addEventListener("click", aabnIntro);
        NK.el("intro-start").addEventListener("click", lukOverlay);
        NK.el("intro-rundvisning").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });
        NK.el("intro").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.intro = { aabn: aabnIntro, luk: lukOverlay };

        document.addEventListener("keydown", tastNed);
        document.addEventListener("keyup", tastOp);
        window.addEventListener("blur", function () { forsoeg.arbejdKnap(false); });

        visLyd();
        forsoeg.tilpas();
        opdaterPanel();
        introFoersteGang();

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
