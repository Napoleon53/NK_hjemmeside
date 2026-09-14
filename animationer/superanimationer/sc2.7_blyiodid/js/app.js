/* =====================================================================
   app.js - binder forsoeget, maalingerne, grafen, quizzen og panelet
   sammen

   Knapper, tastatur, pop op-vinduer og tegneloekken.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;

    var forsoeg, quiz, graf;
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
            var tekst = t.tekst;
            if (t.id === "maal3" && !gjort && f.maalinger.length) tekst += " (" + f.maalinger.length + "/3)";
            li.appendChild(document.createTextNode(tekst));
            ol.appendChild(li);
        });
        NK.saetTekst("forloeb-taeller", antalGjort + "/" + NK.TRIN.length);

        if (aktivId !== hintTrin) {
            hintTrin = aktivId;
            NK.el("hint-tekst").hidden = true;
        }
        NK.el("hint-knap").disabled = !aktuelt;

        var nk = NK.el("noter-knap");
        var t = f.tils;
        nk.hidden = !(t && t.ki !== null && !t.noteret);

        opdaterMaalinger();
        quiz.saetLaast(!f.maalingerFaerdige());
        sidsteSignatur = signatur();
    }

    function raekke(celler, klasse) {
        return "<tr" + (klasse ? ' class="' + klasse + '"' : "") + ">" + celler.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
    }

    function opdaterMaalinger() {
        var f = forsoeg, b = f.b, t = f.tils;
        var html = f.maalinger.map(function (m) {
            return raekke([m.nr, M.komma(m.pb) + " g", M.komma(m.ki) + " g", M.komma(m.pbi2) + " g", M.komma(m.T, 1) + " °C"]);
        }).join("");
        if (t && !t.noteret && !f.gjort.affald) {
            html += raekke([f.maalinger.length + 1, M.komma(b.pb) + " g", b.ki > 0 && t.ki !== null ? M.komma(b.ki) + " g" : "…",
                t.ki !== null ? M.komma(M.pbi2Masse(b.pb, b.ki)) + " g" : "…", "…"], "igang");
        }
        if (!html) html = '<tr class="tom"><td colspan="5">Endnu ingen.</td></tr>';
        var tb = NK.el("maaling-rader");
        if (tb.getAttribute("data-html") !== html) {
            tb.innerHTML = html;
            tb.setAttribute("data-html", html);
        }
        NK.saetTekst("maaling-taeller", f.maalinger.length ? f.maalinger.length + "/3" : "");
        NK.saetTekst("graf-note", f.maalinger.length >= 3
            ? "Den blå kurve er opløseligheden af PbI₂ fra tabeller."
            : "Masserne er i alt i 100 mL vand. Kurven med tabelværdier vises ved tre målinger.");
    }

    function signatur() {
        var f = forsoeg, t = f.tils, baad = f.g.vejebaad;
        var trin = f.aktueltTrin();
        return [
            trin ? trin.id : "", !!f.handling, f.varme, f.omroer, f.b.vand,
            t ? [t.pb, t.ki, t.bundfaldSet, t.forsvundet, t.noteret].join(",") : "-",
            f.maalinger.length, baad.stof, Math.round(baad.masse * 100),
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
        if (i.noegle === "spild") li.className = "uheld";
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
        beskedUr = window.setTimeout(function () { el.classList.remove("vis"); }, 3200);
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
        if (NK.Lyd.erTil() && forsoeg.omroer) NK.Lyd.omroering(true);
    }

    function startForfra() {
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
        if (e.repeat) return;

        NK.Lyd.laasOp();
        var k = e.key.toLowerCase();
        if (k === "n") forsoeg.klik("termometer");
        else if (k === "v") forsoeg.klik("varme");
        else if (k === "o") forsoeg.klik("omroer");
        else if (k === "i") visHint();
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

        var f = forsoeg, t = f.tils;
        graf.tegn({
            maalinger: f.maalinger,
            T: f.b.T,
            aktuel: t && t.ki !== null && !t.noteret ? M.pbi2Masse(f.b.pb, f.b.ki) : null,
            visKurve: f.maalingerFaerdige()
        }, dt);

        if (signatur() !== sidsteSignatur) opdaterPanel();
        var sidderFast = f.aktueltTrin() && f.tid - f.trinStart > 30 && NK.el("hint-tekst").hidden && !NK.el("hint-knap").disabled;
        NK.el("hint-knap").classList.toggle("banker", !!sidderFast);
        window.requestAnimationFrame(loekke);
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        quiz = new NK.Quiz();
        graf = new NK.Graf(NK.el("graf"));
        forsoeg = new NK.Forsoeg(NK.el("scene-laerred"));

        /* Saa modellen kan pilles ved fra konsollen og fra _selvtest.html */
        NK.forsoeg = forsoeg;
        NK.quiz = quiz;
        NK.graf = graf;
        NK.opdaterPanel = opdaterPanel;
        NK.startForfra = startForfra;

        forsoeg.vedAendring = function () { if (quiz) opdaterPanel(); };
        forsoeg.vedBesked = besked;
        forsoeg.vedIagttagelse = iagttagelse;

        NK.el("noter-knap").addEventListener("click", function () { NK.Lyd.laasOp(); forsoeg.klik("termometer"); });
        NK.el("hint-knap").addEventListener("click", visHint);
        NK.el("forfraknap").addEventListener("click", startForfra);
        NK.el("teoriknap").addEventListener("click", aabnTeori);
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.el("lydknap").addEventListener("click", skiftLyd);
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });

        document.addEventListener("keydown", tastNed);

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
