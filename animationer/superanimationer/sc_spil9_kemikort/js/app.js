/* =====================================================================
   app.js - binder det hele sammen

   Vaelger saettet, skifter fane og fordeler tastetrykkene. Den fane, man
   staar paa, faar foerst lov at bruge tasten; er den ikke brugt der,
   virker den som genvej i hele spillet.

   Linket kan pege paa et indbygget saet og en fane: index.html#ioner
   eller index.html#ioner&parring. Et link med #kort=... har hele saettet
   i sig (se js/bibliotek.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var el = NK.el;
    var B = NK.Bibliotek;

    var FANER = ["traen", "vendespil", "parring"];
    var MODUL = { traen: "Traen", vendespil: "Vendespil", parring: "Parring" };
    var aktiv = "traen";
    var valgt = null;

    function modul(id) { return NK[MODUL[id]]; }

    /* ----- Saettet -------------------------------------------------------- */
    function byggVaelger() {
        var s = el("saetvaelger");
        var liste = B.liste();
        var indbygget = liste.filter(function (x) { return x.indbygget; });
        var egne = liste.filter(function (x) { return !x.indbygget; });
        function gruppe(navn, dele) {
            if (!dele.length) return "";
            return '<optgroup label="' + NK.html(navn) + '">' + dele.map(function (x) {
                return '<option value="' + NK.html(x.noegle) + '">' + NK.html(x.navn) + "</option>";
            }).join("") + "</optgroup>";
        }
        s.innerHTML = gruppe("Indbyggede sæt", indbygget) + gruppe("Mine sæt", egne);
        s.value = valgt || B.valgt();
    }

    function vaelgSaet(noegle) {
        if (!noegle || !B.saet(noegle)) noegle = B.valgt();
        valgt = noegle;
        B.vaelg(noegle);
        var saet = B.saet(noegle);
        byggVaelger();
        el("saetvaelger").value = noegle;
        NK.saetTekst("saet-info", saet.kort.length + " kort · " + saet.sider[0] + " og " + saet.sider[1]);
        NK.Traen.saetSaet(saet);
        NK.Vendespil.saetSaet(saet, noegle);
        NK.Parring.saetSaet(saet, noegle);
        modul(aktiv).aktiver();
    }

    /* ----- Fanerne -------------------------------------------------------- */
    function visFane(id) {
        if (FANER.indexOf(id) < 0) id = "traen";
        aktiv = id;
        FANER.forEach(function (f) {
            el("fane-" + f).hidden = f !== id;
        });
        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            var f = knapper[i].getAttribute("data-fane");
            knapper[i].classList.toggle("aktiv", f === id);
            knapper[i].setAttribute("aria-selected", f === id ? "true" : "false");
        }
        modul(id).aktiver();
    }

    /* ----- Pop op --------------------------------------------------------- */
    function aabnRegler() { el("regler").classList.add("vis"); }
    function lukRegler() { el("regler").classList.remove("vis"); }

    /* ----- Tastatur ------------------------------------------------------- */
    function skriverIFelt(e) {
        var t = e.target;
        if (!t) return false;
        if (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT") return true;
        /* Staar man paa en knap, skal Enter og mellemrum trykke paa den,
           ikke vende kortet. */
        return t.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ");
    }

    function tast(e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (skriverIFelt(e)) return;

        if (e.key === "Escape") {
            if (NK.Editor.aaben()) { NK.Editor.luk(); e.preventDefault(); return; }
            if (el("regler").classList.contains("vis")) { lukRegler(); e.preventDefault(); return; }
            if (NK.Rundvisning.aktiv()) { NK.Rundvisning.luk(); e.preventDefault(); return; }
            return;
        }
        if (NK.Editor.aaben() || el("regler").classList.contains("vis") || NK.Rundvisning.aktiv()) return;

        if (modul(aktiv).tast(e)) { e.preventDefault(); return; }

        if (e.key === "t" || e.key === "T") { visFane("traen"); e.preventDefault(); return; }
        if (e.key === "v" || e.key === "V") { visFane("vendespil"); e.preventDefault(); return; }
        if (e.key === "p" || e.key === "P") { visFane("parring"); e.preventDefault(); return; }
        if (e.key === "h" || e.key === "H") { NK.Rundvisning.start(aktiv); e.preventDefault(); return; }
        if (e.key === "s" || e.key === "S") { NK.Editor.aabn(valgt, vaelgSaet); e.preventDefault(); return; }
    }

    /* ----- Start ---------------------------------------------------------- */
    function laesHash() {
        var h = String(window.location.hash || "").replace(/^#/, "");
        var dele = h.split("&");
        var fane = null;
        dele.forEach(function (d) {
            var n = d.toLowerCase();
            if (n === "traen" || n === "træn") fane = "traen";
            if (n === "vendespil" || n === "vend") fane = "vendespil";
            if (n === "parring" || n === "par") fane = "parring";
        });
        return { saet: B.fraHash(h), fane: fane };
    }

    function init() {
        document.querySelectorAll(".faneknap").forEach(function (k) {
            k.addEventListener("click", function () { visFane(k.getAttribute("data-fane")); });
        });
        el("saetvaelger").addEventListener("change", function () { vaelgSaet(el("saetvaelger").value); });
        el("egneknap").addEventListener("click", function () { NK.Editor.aabn(valgt, vaelgSaet); });
        el("regelknap").addEventListener("click", aabnRegler);
        el("regler-luk").addEventListener("click", lukRegler);
        el("regler").addEventListener("click", function (e) { if (e.target === el("regler")) lukRegler(); });
        el("hjaelpknap").addEventListener("click", function () { NK.Rundvisning.start(aktiv); });
        /* Naar bunken er tom, gaar knappen videre til testen, ikke forfra */
        el("tr-tilspil").addEventListener("click", function () { visFane("vendespil"); });
        document.addEventListener("keydown", tast);

        var h = laesHash();
        vaelgSaet(h.saet || B.valgt());
        visFane(h.fane || "traen");
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
