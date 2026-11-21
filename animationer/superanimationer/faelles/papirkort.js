/* =====================================================================
   faelles/papirkort.js - teksten paa papirkortet (se papirkort.css)

   NK.Papir.tekst(html): spoergsmaalet (en saetning, der ender med ?)
   bliver halvfedt, resten af teksten staar i almindelig skrift i samme
   stoerrelse, saa indledningen ikke bliver sprunget over (brugerens valg
   3. nov. 2026). Staar der en indledning foer spoergsmaalet, staar
   spoergsmaalet paa sin egen linje (.sk-linje), saa det kan laeses alene
   og ikke begynder midt i en linje (brugeren 21. nov. 2026, som i sb2.6).
   Det, der staar efter spoergsmaalet, begynder paa en ny linje. Ord med bindestreg (propan-2-ol, OH-gruppen) deles ikke
   over to linjer (det gaelder ogsaa forklaringen i bliv). Giv teksten,
   efter den er lavet til HTML med NK.html.

   NK.Papir.bliv(tekst, maerke, knap, svar): kortets nederste raekke, naar
   kortet bliver paa spoergsmaalet efter et rigtigt svar: forklaringen i en
   groen boks (gul, naar svaret blev vist) og knappen, der foerer videre,
   dér hvor Indsend svar stod. Knappen har data-videre.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK = window.NK || {};

    function slutterSaetning(s, i) {
        var c = s.charAt(i);
        if (c !== "." && c !== "?" && c !== "!") return false;
        var n = s.charAt(i + 1), m = s.charAt(i + 2);
        return /\s/.test(n) && /[A-ZÆØÅ0-9"„(]/.test(m);
    }

    /* Ord med bindestreg samles, men kun i teksten, aldrig inde i et HTML-maerke */
    function samlOrd(html) {
        return String(html || "").replace(/(<[^>]*>)|([^<]+)/g, function (m, maerke, txt) {
            if (maerke) return maerke;
            return txt.replace(/([A-Za-zÆØÅæøå0-9]+(?:-[A-Za-zÆØÅæøå0-9]+)+)/g, '<span class="nw">$1</span>');
        });
    }

    function tekst(html) {
        var s = String(html || ""), dele = [], start = 0;
        for (var i = 0; i < s.length; i++) {
            if (slutterSaetning(s, i)) { dele.push(s.slice(start, i + 1)); start = i + 2; }
        }
        dele.push(s.slice(start));
        /* Spoergsmaal, der staar lige efter hinanden, samles i én halvfed del */
        var grupper = [];
        dele.forEach(function (d) {
            var spm = /\?\s*$/.test(d), sidst = grupper[grupper.length - 1];
            if (sidst && sidst.spm === spm) sidst.d.push(d);
            else grupper.push({ spm: spm, d: [d] });
        });
        var foer = false;
        return grupper.map(function (g) {
            var d = samlOrd(g.d.join(" "));
            var ud = g.spm ? '<span class="sk-spm' + (foer ? " sk-linje" : "") + '">' + d + "</span>" : d;
            if (d.replace(/<[^>]*>/g, "").trim()) foer = true;
            return ud;
        }).join(" ");
    }

    function bliv(tekstHtml, maerke, knap, svar) {
        return '<div class="sk-bund bliv ' + (svar ? "svar" : "god") + '"><p class="st-tekst">' +
            (maerke ? '<span class="b-maerke">' + maerke + "</span> " : "") + samlOrd(tekstHtml) + "</p>" +
            '<button type="button" class="sk-videre" data-videre="1">' + knap + "</button></div>";
    }

    NK.Papir = { tekst: tekst, bliv: bliv };
}());
