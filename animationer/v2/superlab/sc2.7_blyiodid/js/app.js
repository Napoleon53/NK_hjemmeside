/* =====================================================================
   app.js - binder forsoeget, beregningen, tegneserien, quizzen og
   panelet sammen

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
    var serieSet = false;
    var kortNr = 0;            /* den maaling, feltet i kortet Beregning hoerer til */

    /* ----- Forloebet ---------------------------------------------------- */
    function opdaterPanel() {
        var f = forsoeg;
        var aktuelt = f.aktueltTrin();
        var aktivId = aktuelt ? aktuelt.id : "";
        var ol = NK.el("trin-liste");
        ol.innerHTML = "";
        var antalGjort = 0, antal = 0, nummer = 0;
        NK.TRIN.forEach(function (t) {
            var gjort = f.trinGjort(t.id);
            var li = document.createElement("li");
            var klasser = [];
            if (t.valgfri) klasser.push("valgfri");
            else { antal++; nummer++; if (gjort) antalGjort++; }
            if (gjort) klasser.push("gjort");
            else if (t.id === aktivId) klasser.push("aktiv");
            li.className = klasser.join(" ");
            var nr = document.createElement("span");
            nr.className = "nr";
            nr.textContent = gjort ? "✓" : (t.valgfri ? "+" : String(nummer));
            li.appendChild(nr);
            li.appendChild(document.createTextNode(t.tekst));
            ol.appendChild(li);
        });
        NK.saetTekst("forloeb-taeller", antalGjort + "/" + antal);

        if (aktivId !== hintTrin) {
            hintTrin = aktivId;
            NK.el("hint-tekst").hidden = true;
        }
        NK.el("hint-knap").disabled = !aktuelt;

        var t = f.tils;
        NK.el("noter-knap").hidden = !(t && t.ki !== null && !t.noteret && t.klarSet);

        opdaterBeregning();

        var slut = f.erSlut();
        NK.el("serieknap").hidden = !slut;
        NK.saetTekst("serie-tekst", slut ? "Forsøget er slut."
            : (f.gjort.affald ? "Låses op, når Kₒ er beregnet." : "Låses op, når forsøget er slut."));
        NK.el("serieknap").classList.toggle("banker", slut && !serieSet);
        quiz.saetLaast(!f.erBeregnet());
        sidsteSignatur = signatur();
    }

    /* Kortet Beregning: maaleskemaet med elevens egne tal, feltet til Ko og
       knappen til den trinvise hjaelp. Mens en ny tilsaetning er i gang,
       viser skemaet det, der er i glasset nu. */
    function opdaterBeregning() {
        var f = forsoeg, b = f.b, t = f.tils;
        var m = f.aktuelMaaling();
        var iGang = !!(t && !t.noteret) && !f.gjort.affald;
        var pb = "", ki = "", temp = "", nr = 1;
        if (iGang || !m) {
            nr = m ? m.nr + 1 : 1;
            if (b.pb > 0) pb = M.komma(b.pb, 3) + " g";
            if (t && t.ki !== null && b.ki > 0) ki = M.komma(b.ki, 3) + " g";
        } else {
            nr = m.nr;
            pb = M.komma(m.pb, 3) + " g";
            ki = M.komma(m.ki, 3) + " g";
            temp = M.komma(m.T, 1) + " °C";
        }
        NK.saetTekst("maal-nr", "Måling " + nr);
        NK.saetTekst("m-pb", pb);
        NK.saetTekst("m-ki", ki);
        NK.saetTekst("t-krystal", temp);

        var kanBeregne = !!m && !iGang && !m.beregnet;
        var felt = NK.el("beregn");
        var input = NK.el("svar");
        if (kanBeregne && (felt.hidden || kortNr !== m.nr)) {
            kortNr = m.nr;
            input.value = "";
            input.classList.remove("forkert");
            NK.el("beregn-hint").hidden = true;
        }
        felt.hidden = !kanBeregne;
        NK.el("svar-note").hidden = !kanBeregne;
        NK.el("hjaelp-beregn").hidden = !kanBeregne;
        if (!kanBeregne) NK.el("beregn-hint").hidden = true;

        var faerdig = !!m && !iGang && m.beregnet;
        NK.el("beregn-svar").hidden = !faerdig;
        if (faerdig) {
            NK.saetTekst("beregn-svar", "Rigtigt beregnet: Kₒ = " + M.videnskabelig(m.Y, 2) + " M³ ved " + M.komma(m.T, 1) + " °C.");
        }
    }

    function signatur() {
        var f = forsoeg, t = f.tils, baad = f.g.vejebaad;
        var trin = f.aktueltTrin();
        return [
            trin ? trin.id : "", !!f.handling, f.varme, f.omroer, f.b.vand,
            t ? [t.pb, t.ki, t.bundfaldSet, t.klarSet, t.forsvundet, t.noteret].join(",") : "-",
            f.maalinger.length, f.maalinger.map(function (m) { return m.beregnet ? 1 : 0; }).join(""),
            baad.stof, !!f.gjort.affald,
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
        tom: "Skriv Kₒ som et tal.",
        ikketal: "Skriv et tal. 4,5 · 10⁻⁶ skrives 4,5·10^-6 eller 0,0000045.",
        udenAnden: "[I⁻] skal sættes i anden, fordi der er 2 I⁻ i reaktionsskemaet.",
        gangeTo: "Koefficienten 2 bliver til en eksponent. [I⁻] skal sættes i anden, ikke ganges med 2.",
        dobbeltI: "[I⁻] er koncentrationen af I⁻ i glasset. Den skal ikke ganges med 2, før den sættes i anden.",
        mol: "Du har regnet med stofmængder. Kₒ bruger koncentrationer: divider hver stofmængde med 0,100 L.",
        ml: "Regn volumen i liter: 100 mL = 0,100 L.",
        potens: "Cifrene passer, men titalspotensen er forkert. Tjek enhederne og kommaerne."
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
            blink("raekke-temp");
            return;
        }
        input.classList.add("forkert");
        var tekst = HINT[svar.slags];
        if (!tekst) {
            tekst = svar.forkerte >= 2
                ? "Kₒ = [Pb²⁺] · [I⁻]². [Pb²⁺] er m(Pb(NO₃)₂) divideret med 331,2 g/mol og med 0,100 L. [I⁻] er m(KI) divideret med 166,0 g/mol og med 0,100 L. Du kan også bruge Hjælp til beregningen."
                : "Find først [Pb²⁺] og [I⁻] ud fra masserne og de 100 mL vand.";
        }
        hint.textContent = tekst;
        hint.hidden = false;
        input.focus();
        input.select();
    }

    function blink(id) {
        var raekke = NK.el(id);
        if (!raekke) return;
        raekke.classList.remove("ny");
        void raekke.offsetWidth;
        raekke.classList.add("ny");
    }

    /* ----- Guidet hjaelp til beregningen -------------------------------
       Hvert trin tjekkes mod elevens eget svar i trinnet foer, saa en
       lille afrunding ikke giver fejl senere. Sidste trin tjekkes mod
       reaktionsbroeken i glasset.

       Et trin staar som et regnestykke: stoerrelsen til venstre, formlen,
       tallene sat ind og elevens resultat, fx
         [Pb²⁺] = n(Pb(NO₃)₂) / V
                = 3,02·10⁻⁴ mol / 0,100 L = [ ] M
       Linjen med tallene (guideTal) er tom, til de tal, trinnet bygger
       paa, er fundet i trinnet foer. */
    var ANTAL_G = 5;
    var guide = { trin: 1 };
    var M_PB = "331,2 g/mol", M_KI = "166,0 g/mol", VOL = "0,100 L";

    /* broek: [taeller, naevner] med rigtig broekstreg, og tekst efter */
    function guideTal(n, tekst, broek) {
        var el = NK.el("g" + n + "-tal");
        el.textContent = "";
        if (broek) {
            var b = document.createElement("span");
            b.className = "broek";
            broek.forEach(function (led) {
                var s = document.createElement("span");
                s.textContent = led;
                b.appendChild(s);
            });
            el.appendChild(b);
        }
        if (tekst) el.appendChild(document.createTextNode(tekst));
    }

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
        var m = forsoeg.aktuelMaaling();
        if (!m || m.beregnet) return;
        guide = { trin: 1, nr: m.nr };
        guideTal(1, " =", [M.komma(m.pb, 3) + " g", M_PB]);
        for (var k = 2; k <= ANTAL_G; k++) guideTal(k, "");
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

    function vid(x) { return M.videnskabelig(x, 2); }

    function guideTjek(n) {
        if (n !== guide.trin) return;
        var m = forsoeg.aktuelMaaling();
        if (!m || m.nr !== guide.nr) return;
        var input = NK.el("g" + n + "-svar");
        var hint = NK.el("g" + n + "-hint");
        var v = M.tal(input.value);
        var naer = M.naer;
        var fejl = null, sand;
        if (isNaN(v)) {
            fejl = "Skriv et tal. 4,5 · 10⁻⁶ skrives 4,5·10^-6 eller 0,0000045.";
        } else if (n === 1 || n === 3) {
            var masse = n === 1 ? m.pb : m.ki;
            var molar = n === 1 ? M.MOLMASSE["Pb(NO3)2"] : M.MOLMASSE.KI;
            sand = masse / molar;
            if (!naer(v, sand, 0.008)) {
                if (naer(v, masse * molar, 0.01)) fejl = "Du har ganget. Stofmængden er massen divideret med den molare masse.";
                else if (naer(v, sand * 1000, 0.01)) fejl = "Tallet er i mmol. Skriv stofmængden i mol.";
                else if (n === 3 && naer(v, masse / M.MOLMASSE["Pb(NO3)2"], 0.01)) fejl = "Brug den molare masse af KI, " + M_KI + ".";
                else if (n === 3 && naer(v, 2 * sand, 0.01)) fejl = "Der skal ikke ganges med 2. Hver formelenhed KI giver én I⁻.";
                else fejl = "Divider massen med den molare masse, " + (n === 1 ? M_PB : M_KI) + ".";
            }
        } else if (n === 2 || n === 4) {
            var stof = n === 2 ? guide.nPb : guide.nI;
            sand = stof / 0.1;
            if (!naer(v, sand, 0.008)) {
                if (naer(v, stof / 100, 0.01)) fejl = "Regn volumen i liter: 100 mL = 0,100 L.";
                else if (naer(v, stof * 0.1, 0.01)) fejl = "Du har ganget. Koncentrationen er stofmængden divideret med volumen.";
                else if (naer(v, stof, 0.008)) fejl = "Det er stofmængden. Divider den med 0,100 L.";
                else fejl = "Divider stofmængden med 0,100 L.";
            }
        } else {
            var egen = guide.cPb * guide.cI * guide.cI;
            if (!naer(v, m.Y, 0.03)) {
                if (naer(v, egen, 0.01)) fejl = "Næsten. Brug flere cifre i mellemregningerne.";
                else if (naer(v, guide.cPb * guide.cI, 0.02)) fejl = HINT.udenAnden;
                else if (naer(v, guide.cPb * 2 * guide.cI, 0.02)) fejl = HINT.gangeTo;
                else if (naer(v, guide.cPb * 4 * guide.cI * guide.cI, 0.02)) fejl = HINT.dobbeltI;
                else fejl = "Sæt [I⁻] i anden, og gang med [Pb²⁺].";
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
        if (n === 1) { guide.nPb = v; guideTal(2, " =", [vid(v) + " mol", VOL]); guideTal(3, " =", [M.komma(m.ki, 3) + " g", M_KI]); }
        if (n === 2) guide.cPb = v;
        if (n === 3) { guide.nI = v; guideTal(4, " =", [vid(v) + " mol", VOL]); }
        if (n === 4) { guide.cI = v; guideTal(5, vid(guide.cPb) + " M · (" + vid(v) + " M)² ="); }
        if (n === 5) guide.ko = v;
        guide.trin = n + 1;
        guideVis();
        if (n < ANTAL_G) NK.el("g" + (n + 1) + "-svar").focus();
        else NK.el("guide-brug").focus();
    }

    /* Elevens tal fra sidste trin skrevet, som feltet i panelet laeser det: 1,09·10^-7 */
    function skrivTal(x) {
        var e = Math.floor(Math.log(Math.abs(x)) / Math.LN10);
        return M.komma(x / Math.pow(10, e), 2) + "·10^" + e;
    }

    function guideBrug() {
        if (guide.trin <= ANTAL_G) return;
        NK.el("svar").value = skrivTal(guide.ko);
        lukOverlay();
        tjek();
    }

    /* ----- Tegneserien --------------------------------------------------- */
    function aabnSerie() {
        if (!forsoeg.erSlut()) return;
        serieSet = true;
        NK.Rundvisning.luk();
        NK.Tegneserie.byg(forsoeg, NK.el("serie-ruder"));
        NK.el("tegneserie").classList.add("vis");
        NK.el("serieknap").classList.remove("banker");
    }

    /* ----- Beskeden paa scenen ------------------------------------------ */
    function besked(tekst, slags) {
        var el = NK.el("scenebesked");
        el.className = "scenebesked";
        void el.offsetWidth;
        el.textContent = tekst;
        el.className = "scenebesked vis " + slags;
        window.clearTimeout(beskedUr);
        beskedUr = window.setTimeout(function () { el.classList.remove("vis"); }, 3200);
    }

    /* ----- Pop op-vinduer, lyd og start forfra ----------------------------- */
    function aabnTeori() {
        NK.Rundvisning.luk();
        NK.el("teori").classList.add("vis");
    }

    /* Introen aabner af sig selv foerste gang i browseren. Knappen Om
       forsøget aabner den igen. Noeglen er ny, fordi forsoeget har faaet
       nyt indhold (Ko, B-niveau), saa introen vises igen én gang. */
    var INTRO_GEMT = "nk-sc27-intro-ko";

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
        if (NK.Lyd.erTil() && forsoeg.omroer) NK.Lyd.omroering(true);
    }

    function startForfra() {
        forsoeg.nulstil();
        serieSet = false;
        kortNr = 0;
        NK.el("hint-tekst").hidden = true;
        NK.el("svar").value = "";
        NK.el("svar").classList.remove("forkert");
        opdaterPanel();
    }

    /* ----- Tastatur ----------------------------------------------------- */
    function tastNed(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "Escape") { lukOverlay(); NK.Rundvisning.luk(); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start(); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.repeat) return;

        NK.Lyd.laasOp();
        var k = e.key.toLowerCase();
        if (k === "n") forsoeg.klik("termometer");
        else if (k === "v") forsoeg.klik("varme");
        else if (k === "o") forsoeg.klik("omroer");
        else if (k === "i") visHint();
        else if (k === "s") aabnSerie();
        else if (k === "m") skiftLyd();
        else if (k === "t") aabnTeori();
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
        var f = forsoeg;
        var sidderFast = f.aktueltTrin() && f.tid - f.trinStart > 30 && NK.el("hint-tekst").hidden && !NK.el("hint-knap").disabled;
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
        NK.startForfra = startForfra;
        NK.aabnSerie = aabnSerie;
        NK.guide = { aabn: aabnGuide, tjek: guideTjek, brug: guideBrug, tilstand: function () { return guide; } };
        NK.tjekSvar = tjek;

        forsoeg.vedAendring = function () { if (quiz) opdaterPanel(); };
        forsoeg.vedBesked = besked;

        NK.el("noter-knap").addEventListener("click", function () { NK.Lyd.laasOp(); forsoeg.klik("termometer"); });
        NK.el("hint-knap").addEventListener("click", visHint);
        NK.el("forfraknap").addEventListener("click", startForfra);
        NK.el("teoriknap").addEventListener("click", aabnTeori);
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.el("serieknap").addEventListener("click", aabnSerie);
        NK.el("serie-luk").addEventListener("click", lukOverlay);
        NK.el("tegneserie").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.el("lydknap").addEventListener("click", skiftLyd);
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });
        NK.el("introknap").addEventListener("click", aabnIntro);
        NK.el("intro-start").addEventListener("click", lukOverlay);
        NK.el("intro-rundvisning").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });
        NK.el("intro").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.intro = { aabn: aabnIntro, luk: lukOverlay };

        NK.el("tjek-knap").addEventListener("click", tjek);
        NK.el("svar").addEventListener("keydown", function (e) { if (e.key === "Enter") tjek(); });
        NK.el("hjaelp-beregn").addEventListener("click", aabnGuide);
        NK.el("guide-luk").addEventListener("click", lukOverlay);
        NK.el("guide-brug").addEventListener("click", guideBrug);
        NK.el("guide").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        for (var n = 1; n <= ANTAL_G; n++) {
            (function (nr) {
                NK.el("g" + nr + "-tjek").addEventListener("click", function () { guideTjek(nr); });
                NK.el("g" + nr + "-svar").addEventListener("keydown", function (e) { if (e.key === "Enter") guideTjek(nr); });
            }(n));
        }

        document.addEventListener("keydown", tastNed);

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
