/* =====================================================================
   app.js - binder forsoeget, resultaterne, quizzen og panelet sammen

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
        NK.el("hint-knap").disabled = !aktuelt;

        var rk = NK.el("ryst-knap");
        var viser = f.kanRysteNu() || f.rystKilde === "knap";
        rk.hidden = !viser;
        rk.disabled = !viser;
        rk.classList.toggle("aktiv", f.rystKilde === "knap");

        opdaterResultater();
        quiz.saetLaast(!f.testsFaerdige());
        sidsteSignatur = signatur();
    }

    function stedTekst(gl) {
        if (gl.sted === "lampe" || gl.lysTid > 0) return "Lys";
        if (gl.folie || gl.moerkeTid > 0) return "Mørke";
        return "";
    }

    function celle(id, tekst, farve, farveloes) {
        var td = NK.el(id);
        var noegle = tekst + "|" + (farve ? NK.css(farve) : (farveloes ? "-" : ""));
        if (td.getAttribute("data-noegle") === noegle) return;
        td.setAttribute("data-noegle", noegle);
        td.innerHTML = "";
        if (farve || farveloes) {
            var sp = document.createElement("span");
            sp.className = "farve" + (farve ? "" : " farveloes");
            if (farve) sp.style.backgroundColor = NK.css({ r: farve.r, g: farve.g, b: farve.b, a: 1 });
            td.appendChild(sp);
        }
        td.appendChild(document.createTextNode(tekst));
    }

    function opdaterResultater() {
        var f = forsoeg;
        [f.g.glas1, f.g.glas2].forEach(function (gl) {
            var p = "r" + gl.nr + "-";
            celle(p + "sted", stedTekst(gl), null, false);
            var farveTekst = M.farveTekst(gl);
            var farve = null, farveloes = false;
            if (farveTekst === "farveløs") farveloes = true;
            else if (farveTekst) farve = gl.brHex > gl.brVand ? M.hexanFarve(gl) : M.vandFarve(gl);
            celle(p + "farve", farveTekst, farve, farveloes);
            if (gl.ph !== null) celle(p + "ph", "pH ≈ " + Math.round(gl.ph) + ", " + M.pHTekst(gl.ph), gl.phFarve, false);
            else celle(p + "ph", "", null, false);
            if (gl.agNoteret) {
                if (gl.reageret > 0.5) celle(p + "ag", "bundfald", M.FARVE.bundfald, false);
                else celle(p + "ag", "ingen forandring", null, true);
            } else celle(p + "ag", gl.agDraaber ? gl.agDraaber + " dråbe" + (gl.agDraaber > 1 ? "r" : "") : "", null, false);
        });
    }

    function signatur() {
        var f = forsoeg;
        var t = f.aktueltTrin();
        var glas = [f.g.glas1, f.g.glas2].map(function (gl) {
            return [gl.brom, gl.hexan, !!gl.prop, gl.sted, gl.folie, gl.ph, gl.agDraaber, gl.agTest, gl.agNoteret, M.farveTekst(gl), gl.lysTid > 0, gl.moerkeTid > 0, Math.round(gl.brHex * 20)].join(",");
        }).join(";");
        return [
            t ? t.id : "", !!f.handling, f.rystKilde, f.kanRysteNu(), f.valgt, f.lampeTaendt, f.udsugning, glas,
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

    /* ----- Iagttagelser -------------------------------------------------- */
    function iagttagelse(i) {
        var ul = NK.el("iagttagelse-liste");
        var tom = ul.querySelector(".tom");
        if (tom) tom.remove();
        var li = document.createElement("li");
        if (i.noegle === "uheld") li.className = "uheld";
        var farve = document.createElement("span");
        farve.className = "farve" + (i.farve ? "" : " farveloes");
        if (i.farve) farve.style.backgroundColor = NK.css({ r: i.farve.r, g: i.farve.g, b: i.farve.b, a: 1 });
        li.appendChild(farve);
        var tekst = document.createElement("span");
        tekst.textContent = i.tekst;
        li.appendChild(tekst);
        ul.appendChild(li);
    }

    function rydIagttagelser() {
        var ul = NK.el("iagttagelse-liste");
        ul.innerHTML = "";
        var li = document.createElement("li");
        li.className = "tom";
        li.textContent = "Endnu ingen.";
        ul.appendChild(li);
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

    /* ----- Pop op-vinduer, lyd og start forfra ----------------------------- */
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
        if (NK.Lyd.erTil() && forsoeg.udsugning) NK.Lyd.udsugning(true);
    }

    function startForfra() {
        forsoeg.stopRyst();
        forsoeg.holdt = null;
        forsoeg.nulstil();
        rydIagttagelser();
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
        NK.startForfra = startForfra;

        forsoeg.vedAendring = function () { if (quiz) opdaterPanel(); };
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
        NK.el("forfraknap").addEventListener("click", startForfra);
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
