/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa fane 2. Samme kode som i
   sc1.1, sc5.2 og sc4.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet (glycerol, fliserne, glassene, skabet, vinduet og zoomvinduet)
   har et usynligt felt oven paa sig, som fanen selv flytter paa plads
   (saetAnker i sim_fabrik.js og sim_koele.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-fabrik": [
            { sel: "#fabrik-anker-fliser", titel: "Fedtsyrerne", tekst: "Fire fedtsyrer med 18 C-atomer. Træk en op på glycerol, eller klik på den." },
            { sel: "#fabrik-anker-glycerol", titel: "Glycerol", tekst: "Glycerol er en alkohol med tre OH-grupper, og hver OH-gruppe kan binde én fedtsyre. Der dannes ét vandmolekyle pr. binding." },
            { sel: "#fabrik-skort", titel: "Ordren", tekst: "Kunden siger, hvor fedtet skal være fast eller flydende. Tryk Indsend svar, når der sidder tre fedtsyrer på glycerol." },
            { sel: "#fabrik-ordrer", titel: "Ordrerne", tekst: "De fem ordrer. Et flueben viser, at ordren er leveret." },
            { sel: "#fabrik-fedt-kort", titel: "Dit fedtstof", tekst: "Kortet viser smeltepunktet og tilstanden fire steder i køkkenet. Grøn betyder, at fedtet er, som kunden vil have det." },
            { sel: "#fabrik-anker-glas", titel: "Glasset", tekst: "Dit fedtstof ved 20 °C. Det følger med over på fane 2." },
            { sel: "#fabrik-forfra", titel: "Start forfra", tekst: "Knappen starter forfra med ordre 1 og tager fedtsyrerne af glycerol." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Esterbindingen, mættet og umættet fedt og knækkene kort forklaret." },
            { sel: ".faneknapper", titel: "Køleskabet", tekst: "På fane 2 sætter du fedtstofferne i fryseren, i køleskabet, på bordet eller i solen." }
        ],
        "fane-koele": [
            { sel: "#koele-anker-bord", titel: "Glassene", tekst: "Fem fedtstoffer fra køkkenet og dit eget fra fane 1. Træk et glas et andet sted hen." },
            { sel: "#koele-anker-skab", titel: "Fryser og køleskab", tekst: "Fryseren er −18 °C og køleskabet 5 °C. Der er plads til to glas hvert sted." },
            { sel: "#koele-anker-vindue", titel: "I solen", tekst: "I vindueskarmen er det 35 °C." },
            { sel: "#koele-anker-zoom", titel: "Molekylerne", tekst: "Zoomvinduet viser molekylerne i det valgte glas helt tæt på. Hver kæde er en fedtsyre i sin farve, og molekylerne i fast fedt ligger i rækker." },
            { sel: "#koele-skort", titel: "Opgaven", tekst: "Gæt først, om fedtet er fast, delvist fast eller flydende. Når du trykker Indsend svar, flytter glasset hen til det sted, opgaven nævner." },
            { sel: "#koele-dekl-kort", titel: "Varedeklarationen", tekst: "Varedeklarationen viser, hvor mange af fedtsyrerne i det valgte glas der er mættede, monoumættede og polyumættede." },
            { sel: "#koele-forfra", titel: "Start forfra", tekst: "Knappen starter alle opgaver i køkkenet forfra, og glassene kommer tilbage på bordet." }
        ]
    };

    var trin = [];
    var trinNr = 0;
    var erAktiv = false;

    function synligeElementer(sel) {
        var liste = document.querySelectorAll(sel);
        var ud = [];
        for (var i = 0; i < liste.length; i++) {
            if (liste[i].offsetWidth || liste[i].offsetHeight) ud.push(liste[i]);
        }
        return ud;
    }

    /* Den samlede begraensningskasse for alle elementer, en selector
       matcher - saa ét trin kan fremhaeve flere ting paa én gang. */
    function samletRect(sel) {
        var liste = synligeElementer(sel);
        if (!liste.length) return null;
        var r = liste[0].getBoundingClientRect();
        var top = r.top, left = r.left, right = r.right, bottom = r.bottom;
        for (var i = 1; i < liste.length; i++) {
            var r2 = liste[i].getBoundingClientRect();
            top = Math.min(top, r2.top);
            left = Math.min(left, r2.left);
            right = Math.max(right, r2.right);
            bottom = Math.max(bottom, r2.bottom);
        }
        return { top: top, left: left, right: right, bottom: bottom, width: right - left, height: bottom - top };
    }

    /* Boksen laegges der, hvor der er plads: foerst under maalet, saa
       over det, saa til hoejre, saa til venstre, og til sidst midt paa
       skaermen, hvis intet af det passer. */
    function plasserBoks(rect) {
        var boks = NK.el("rv-boks");
        var margin = 16;
        var vb = window.innerWidth, vh = window.innerHeight;
        var bB = boks.offsetWidth, bH = boks.offsetHeight;
        var top, left;

        if (rect.bottom + margin + bH <= vh) {
            top = rect.bottom + margin;
            left = rect.left + rect.width / 2 - bB / 2;
        } else if (rect.top - margin - bH >= 0) {
            top = rect.top - margin - bH;
            left = rect.left + rect.width / 2 - bB / 2;
        } else if (rect.right + margin + bB <= vb) {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.right + margin;
        } else if (rect.left - margin - bB >= 0) {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.left - margin - bB;
        } else {
            top = (vh - bH) / 2;
            left = (vb - bB) / 2;
        }

        boks.style.left = NK.klamp(left, 10, vb - bB - 10) + "px";
        boks.style.top = NK.klamp(top, 10, vh - bH - 10) + "px";
    }

    function visTrin() {
        var t = trin[trinNr];
        if (!t) { luk(); return; }

        var maal = synligeElementer(t.sel)[0];
        if (maal) maal.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });

        var rect = samletRect(t.sel);
        if (!rect) { naeste(); return; }

        var pad = 6;
        var spot = NK.el("rv-spot");
        spot.style.top = (rect.top - pad) + "px";
        spot.style.left = (rect.left - pad) + "px";
        spot.style.width = (rect.width + pad * 2) + "px";
        spot.style.height = (rect.height + pad * 2) + "px";

        NK.saetTekst("rv-titel", t.titel);
        NK.saetTekst("rv-tekst", t.tekst);
        NK.saetTekst("rv-tal", (trinNr + 1) + "/" + trin.length);
        NK.el("rv-forrige").style.display = trinNr === 0 ? "none" : "";
        NK.saetTekst("rv-naeste", trinNr === trin.length - 1 ? "Afslut" : "Næste →");

        plasserBoks(rect);
    }

    function start(faneId) {
        var liste = TURE[faneId];
        if (!liste || !liste.length) return;
        trin = liste;
        trinNr = 0;
        erAktiv = true;
        NK.el("rundvisning").hidden = false;
        visTrin();
    }

    function luk() {
        erAktiv = false;
        NK.el("rundvisning").hidden = true;
    }

    function naeste() {
        if (trinNr >= trin.length - 1) { luk(); return; }
        trinNr++;
        visTrin();
    }

    function forrige() {
        if (trinNr <= 0) return;
        trinNr--;
        visTrin();
    }

    NK.Rundvisning = {
        start: start,
        luk: luk,
        aktiv: function () { return erAktiv; }
    };

    function init() {
        NK.el("rv-naeste").addEventListener("click", naeste);
        NK.el("rv-forrige").addEventListener("click", forrige);
        NK.el("rv-luk").addEventListener("click", luk);
        NK.el("rv-baggrund").addEventListener("click", luk);
        window.addEventListener("resize", function () { if (erAktiv) visTrin(); });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}());
