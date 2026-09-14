/* =====================================================================
   app.js - binder forsoeget, quizzen og panelet sammen

   Knapper, tastatur, pop op-vinduer og tegneloekken.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var forsoeg, quiz;
    var sidsteTid = 0;
    var sidsteSignatur = "";
    var beskedUr = null;
    var hintTrin = "";

    /* ----- Panelet ------------------------------------------------------ */
    function trinListe() {
        var f = forsoeg;
        if (f.uheld) return f.uheldListe();
        return NK.TRIN.map(function (t) { return { id: t.id, tekst: t.tekst, gjort: f.trinGjort(t.id) }; });
    }

    function opdaterPanel() {
        var f = forsoeg;
        var liste = trinListe();
        var aktuelt = f.aktueltTrin();
        var ol = NK.el("trin-liste");
        ol.innerHTML = "";
        var antalGjort = 0;
        liste.forEach(function (t, i) {
            var li = document.createElement("li");
            if (t.gjort) { li.className = "gjort"; antalGjort++; }
            else if (aktuelt && aktuelt.id === t.id) li.className = "aktiv";
            var nr = document.createElement("span");
            nr.className = "nr";
            nr.textContent = t.gjort ? "✓" : String(i + 1);
            li.appendChild(nr);
            li.appendChild(document.createTextNode(t.tekst));
            ol.appendChild(li);
        });
        NK.saetTekst("forloeb-titel", f.uheld ? "Oprydning" : "Forløb");
        NK.saetTekst("forloeb-taeller", antalGjort + "/" + liste.length);
        NK.el("forloeb-kort").classList.toggle("uheld", !!f.uheld);

        var id = aktuelt ? aktuelt.id : "";
        if (id !== hintTrin) {
            hintTrin = id;
            NK.el("hint-tekst").hidden = true;
        }
        NK.el("hint-knap").disabled = !aktuelt;

        var rk = NK.el("ryst-knap");
        rk.hidden = !(f.rystKilde === "knap" || (!f.uheld && f.gjort.brom && !f.gjort.reageret));
        rk.disabled = !(f.rystKilde === "knap" || f.kanRysteNu());
        rk.classList.toggle("aktiv", f.rystKilde === "knap");

        quiz.saetLaast(!f.testsFaerdige());
        sidsteSignatur = signatur();
    }

    function signatur() {
        var f = forsoeg;
        var t = f.aktueltTrin();
        return [
            t ? t.id : "", f.udsugning, f.g.kolbe.prop, !!f.handling, f.rystKilde, f.testsFaerdige(),
            f.uheld ? f.uheld.trin : "", NK.TRIN.map(function (x) { return f.trinGjort(x.id) ? 1 : 0; }).join("")
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

    /* ----- Iagttagelser -------------------------------------------------- */
    function iagttagelse(i) {
        var ul = NK.el("iagttagelse-liste");
        var tom = ul.querySelector(".tom");
        if (tom) tom.remove();
        var li = document.createElement("li");
        if (i.noegle === "uheld") li.className = "uheld";
        var farve = document.createElement("span");
        farve.className = "farve";
        farve.style.backgroundColor = NK.css({ r: i.farve.r, g: i.farve.g, b: i.farve.b, a: 1 });
        li.appendChild(farve);
        var tekst = document.createElement("span");
        tekst.textContent = i.tekst;
        li.appendChild(tekst);
        ul.appendChild(li);
    }

    function rydIagttagelser() {
        var ul = NK.el("iagttagelse-liste");
        ul.innerHTML = '<li class="tom">Endnu ingen.</li>';
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

    /* ----- Pop op-vinduer og lyd ------------------------------------------ */
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
        if (NK.Lyd.erTil() && forsoeg.udsugning) NK.Lyd.udsugning(true);
        visLyd();
    }

    function forfra() {
        forsoeg.nulstil();
        rydIagttagelser();
        quiz.saetLaast(true);
        NK.el("hint-tekst").hidden = true;
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

        NK.Lyd.laasOp();
        if (e.key === "r" || e.key === "R") { if (!e.repeat) forsoeg.rystKnap(true); }
        else if (e.key === "u" || e.key === "U") forsoeg.klik("kontakt");
        else if (e.key === "i" || e.key === "I") visHint();
        else if (e.key === "m" || e.key === "M") skiftLyd();
        else if (e.key === "t" || e.key === "T") aabnTeori();
    }

    function tastOp(e) {
        if (e.key === "r" || e.key === "R") forsoeg.rystKnap(false);
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
        var sidderFast = forsoeg.aktueltTrin() && forsoeg.tid - forsoeg.trinStart > 25 && NK.el("hint-tekst").hidden;
        NK.el("hint-knap").classList.toggle("banker", !!sidderFast);
        window.requestAnimationFrame(loekke);
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        forsoeg = new NK.Forsoeg(NK.el("scene-laerred"));
        quiz = new NK.Quiz();

        /* Saa modellen kan pilles ved fra konsollen og fra _selvtest.html */
        NK.forsoeg = forsoeg;
        NK.quiz = quiz;
        NK.opdaterPanel = opdaterPanel;

        forsoeg.vedAendring = opdaterPanel;
        forsoeg.vedBesked = besked;
        forsoeg.vedIagttagelse = iagttagelse;

        var rk = NK.el("ryst-knap");
        rk.addEventListener("pointerdown", function (e) {
            NK.Lyd.laasOp();
            if (forsoeg.rystKnap(true)) { try { rk.setPointerCapture(e.pointerId); } catch (fejl) {} }
        });
        ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (type) {
            rk.addEventListener(type, function () { forsoeg.rystKnap(false); });
        });
        rk.addEventListener("contextmenu", function (e) { e.preventDefault(); });

        NK.el("hint-knap").addEventListener("click", visHint);
        NK.el("forfraknap").addEventListener("click", forfra);
        NK.el("teoriknap").addEventListener("click", aabnTeori);
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.el("lydknap").addEventListener("click", skiftLyd);
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });

        document.addEventListener("keydown", tastNed);
        document.addEventListener("keyup", tastOp);
        window.addEventListener("blur", function () { forsoeg.rystKnap(false); });

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
