/* =====================================================================
   app.js - binder forsoeget, skemaet, opgaverne og panelet sammen

   Der er kun én fane, saa her er ingen faneskift. Kun knapper,
   tastatur, beskeder, pop op-vinduer og tegneloekken. Naar skemaet er
   udfoert, kan folien skiftes mellem "Skema" og "Frit forsøg".
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var forsoeg, opgave, fritOpgave;
    var sidsteTid = 0;
    var sidsteSignatur = "";
    var beskedUr = null;
    var harVaeretIFrit = false;

    /* ----- Skemaet i panelet ------------------------------------------- */
    function bygSkema() {
        var t = NK.el("skema-tabel");
        var html = "<thead><tr><th></th>";
        D.SOEJLER.forEach(function (id, c) { html += "<th scope=\"col\" id=\"skema-soejle-" + c + "\"></th>"; });
        html += "</tr></thead><tbody>";
        D.RAEKKER.forEach(function (rid, r) {
            html += "<tr><th scope=\"row\" id=\"skema-raekke-" + r + "\"></th>";
            D.SOEJLER.forEach(function (sid, c) {
                var nr = r * D.SOEJLER.length + c;
                html += "<td><button type=\"button\" class=\"skemafelt tom\" data-nr=\"" + nr + "\"></button></td>";
            });
            html += "</tr>";
        });
        t.innerHTML = html + "</tbody>";

        var knapper = t.querySelectorAll(".skemafelt");
        for (var i = 0; i < knapper.length; i++) {
            knapper[i].addEventListener("click", function () {
                var nr = Number(this.dataset.nr);
                forsoeg.markoer = nr;
                if (forsoeg.haand >= 0) forsoeg.drypI(nr);
                else if (forsoeg.felter[nr].antal > 0) forsoeg.vaelgFelt(nr);
                else besked("Feltet er tomt. Tag en flaske, og dryp i det.", "info");
            });
        }
    }

    var STATUS_TEKST = {
        tom: "tomt", delvis: "mangler en dråbe", forurenet: "forkert opløsning",
        enkelt: "én opløsning", intet: "intet bundfald", bundfald: "bundfald"
    };

    function opdaterHoveder(frit) {
        D.SOEJLER.forEach(function (id, c) { NK.saetTekst("skema-soejle-" + c, frit ? "" : D.opl(id).formel); });
        D.RAEKKER.forEach(function (id, r) { NK.saetTekst("skema-raekke-" + r, frit ? (r < 2 ? "Sort" : "Hvid") : D.opl(id).formel); });
    }

    function opdaterSkema() {
        var frit = forsoeg.side === "frit";
        var knapper = NK.el("skema-tabel").querySelectorAll(".skemafelt");
        for (var i = 0; i < knapper.length; i++) {
            var nr = Number(knapper[i].dataset.nr);
            var s = forsoeg.status(nr);
            var f = forsoeg.felter[nr];
            var k = knapper[i];
            var loest = !frit && f.loest;
            k.className = "skemafelt " + s + (forsoeg.valgt === nr ? " valgt" : "") + (loest ? " loest" : "") + (frit && nr >= 6 ? " hvid" : "");
            var navn = frit ? "Frit felt " + (nr + 1) + (f.antal ? ", " + D.indholdNavn(f.draaber) : "") : D.feltNavn(D.FELTER[nr]);
            k.setAttribute("aria-label", navn + ": " + STATUS_TEKST[s] + (loest ? ", reaktionen er opskrevet" : ""));
            k.title = k.getAttribute("aria-label");
            if (s === "bundfald") {
                var b = f.analyse.bundfald[0].info;
                k.innerHTML = "<i style=\"background-color:" + NK.rgba(b.farve, 1) + "\"></i>" + (loest ? "<b>✓</b>" : "");
            } else {
                k.textContent = { intet: "intet", delvis: "½", enkelt: "·", forurenet: "!" }[s] || "";
            }
        }
    }

    /* ----- Panelet ------------------------------------------------------ */
    function opdaterPanel() {
        var f = forsoeg;
        var frit = f.side === "frit";
        NK.saetTekst("skema-titel", frit ? "Frit forsøg" : "Skema");
        NK.saetTekst("skema-taeller", frit ? "" : f.antalUdfoert() + " af " + D.FELTER.length + " felter");
        opdaterHoveder(frit);
        opdaterSkema();

        NK.el("sidevalg").hidden = !f.bonus;
        var sideknapper = NK.el("sidevalg").querySelectorAll(".sideknap");
        for (var i = 0; i < sideknapper.length; i++) {
            var aktiv = sideknapper[i].dataset.side === f.side;
            sideknapper[i].classList.toggle("aktiv", aktiv);
            sideknapper[i].setAttribute("aria-pressed", aktiv ? "true" : "false");
            sideknapper[i].classList.toggle("banker", sideknapper[i].dataset.side === "frit" && f.bonus && !harVaeretIFrit);
        }

        var noget = f.felter.some(function (x) { return x.antal > 0; });
        NK.el("knap-toer").disabled = f.valgt < 0;
        NK.el("knap-toer-alt").disabled = !noget;

        var trin = f.trin();
        for (var t = 1; t <= 3; t++) {
            var el = NK.el("trin-" + t);
            el.classList.toggle("aktiv", t === trin);
            el.classList.toggle("gjort", t < trin);
        }

        NK.el("opgave-kort").hidden = frit;
        NK.el("frit-kort").hidden = !frit;
        opgave.vis(false);
        sidsteSignatur = signatur();
    }

    /* Panelet opdateres kun, naar noget af det, det viser, har aendret sig. */
    function signatur() {
        var f = forsoeg;
        var dele = [f.side, f.bonus, f.valgt, f.haand, f.trin(), fritOpgave.loest];
        for (var i = 0; i < f.felter.length; i++) dele.push(f.status(i) + (f.felter[i].loest ? "L" : "") + f.felter[i].antal);
        return dele.join("|");
    }

    function skiftSide(side) {
        if (side === "frit") harVaeretIFrit = true;
        forsoeg.skiftSide(side);
        opdaterPanel();
    }

    /* ----- Beskeden paa scenen ------------------------------------------ */
    function besked(tekst, slags) {
        var el = NK.el("scenebesked");
        el.className = "scenebesked";
        void el.offsetWidth;
        el.textContent = tekst;
        el.className = "scenebesked vis " + (slags || "info");
        window.clearTimeout(beskedUr);
        beskedUr = window.setTimeout(function () { el.classList.remove("vis"); }, 3500);
    }

    /* ----- Pop op-vinduer ------------------------------------------------ */
    function aabnTeori() {
        NK.Rundvisning.luk();
        NK.el("teori").classList.add("vis");
    }

    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
        return aabne.length > 0;
    }

    /* ----- Tastatur ----------------------------------------------------- */
    function flytMarkoer(dc, dr) {
        var n = D.SOEJLER.length;
        var nr = forsoeg.markoer < 0 ? 0 : forsoeg.markoer;
        var c = NK.klamp(nr % n + dc, 0, n - 1);
        var r = NK.klamp(Math.floor(nr / n) + dr, 0, D.RAEKKER.length - 1);
        forsoeg.markoer = r * n + c;
    }

    function tastatur(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "Escape") {
            if (lukOverlay()) return;
            if (NK.Rundvisning.aktiv()) { NK.Rundvisning.luk(); return; }
            if (forsoeg.laerer.luk()) return;
            if (!forsoeg.saetTilbage()) forsoeg.vaelgFelt(-1);
            return;
        }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start(); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;

        var tal = Number(e.key);
        if (tal >= 1 && tal <= D.OPLOESNINGER.length) {
            if (forsoeg.haand === tal - 1) forsoeg.saetTilbage();
            else forsoeg.tagFlaske(tal - 1);
            return;
        }
        var pile = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (pile[e.key]) {
            e.preventDefault();
            flytMarkoer(pile[e.key][0], pile[e.key][1]);
            return;
        }
        if (e.key === " " || e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            if (forsoeg.markoer < 0) { flytMarkoer(0, 0); return; }
            if (forsoeg.haand >= 0) forsoeg.drypI(forsoeg.markoer);
            else forsoeg.vaelgFelt(forsoeg.markoer);
            return;
        }
        if (e.key === "Delete" || e.key === "Backspace") {
            /* Tastaturets markoer vinder over luppen: det er det felt, der er peget paa. */
            var nr = forsoeg.markoer >= 0 ? forsoeg.markoer : forsoeg.valgt;
            if (nr >= 0) forsoeg.toerAf(nr);
            return;
        }
        if (e.key === "r" || e.key === "R") forsoeg.toerAlt();
        else if (e.key === "t" || e.key === "T") aabnTeori();
        else if ((e.key === "f" || e.key === "F") && forsoeg.bonus) skiftSide(forsoeg.side === "frit" ? "skema" : "frit");
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
        window.requestAnimationFrame(loekke);
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        forsoeg = new NK.Forsoeg(NK.el("scene-laerred"));
        opgave = new NK.Opgave(forsoeg);
        fritOpgave = new NK.FritOpgave(forsoeg);

        /* Saa modellen kan pilles ved fra konsollen og fra _selvtest.html */
        NK.forsoeg = forsoeg;
        NK.opgave = opgave;
        NK.fritOpgave = fritOpgave;
        NK.opdaterPanel = opdaterPanel;
        NK.skiftSide = skiftSide;

        forsoeg.vedAendring = opdaterPanel;
        forsoeg.vedBesked = besked;

        bygSkema();

        var sideknapper = NK.el("sidevalg").querySelectorAll(".sideknap");
        for (var i = 0; i < sideknapper.length; i++) {
            sideknapper[i].addEventListener("click", function () { skiftSide(this.dataset.side); });
        }
        NK.el("knap-toer").addEventListener("click", function () { if (forsoeg.valgt >= 0) forsoeg.toerAf(forsoeg.valgt); });
        NK.el("knap-toer-alt").addEventListener("click", function () { forsoeg.toerAlt(); });
        NK.el("teoriknap").addEventListener("click", aabnTeori);
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });

        document.addEventListener("keydown", tastatur);

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
