/* =====================================================================
   quiz.js - den korte selvtest

   Ligger i et overlay, saa den kan aabnes fra begge faner og lukkes
   igen uden at aendre noget i simulationen. Svarene blandes, saa det
   rigtige svar ikke altid staar oeverst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var Q = {
        nr: 0,
        rigtige: 0,
        valgt: -1,
        svaret: false,
        naevaerende: null
    };
    NK.Quiz = Q;

    Q.aabn = function () {
        Q.nr = 0;
        Q.rigtige = 0;
        Q.naeste(true);
        NK.el("quiz").classList.add("vis");
    };

    Q.luk = function () {
        NK.el("quiz").classList.remove("vis");
    };

    Q.naeste = function (foerste) {
        if (!foerste) Q.nr++;
        Q.valgt = -1;
        Q.svaret = false;
        if (Q.nr >= D.QUIZ.length) { Q.visResultat(); return; }

        var org = D.QUIZ[Q.nr];
        var orden = NK.bland(org.svar.map(function (_, i) { return i; }));
        Q.naevaerende = {
            q: org.q,
            hvorfor: org.hvorfor,
            svar: orden.map(function (i) { return org.svar[i]; }),
            rigtig: orden.indexOf(org.rigtig)
        };
        Q.tegn();
    };

    Q.vaelg = function (i) {
        if (Q.svaret) return;
        Q.valgt = i;
        Q.svaret = true;
        if (i === Q.naevaerende.rigtig) Q.rigtige++;
        Q.tegn();
    };

    Q.tegn = function () {
        var sp = Q.naevaerende;
        var sidste = Q.nr + 1 === D.QUIZ.length;

        var knapper = sp.svar.map(function (tekst, i) {
            var klasse = "valgknap";
            if (Q.svaret) {
                if (i === sp.rigtig) klasse += " rigtig";
                else if (i === Q.valgt) klasse += " forkert";
            }
            return '<button type="button" class="' + klasse + '" data-nr="' + i + '"' +
                   (Q.svaret ? " disabled" : "") + ">" + tekst + "</button>";
        }).join("");

        NK.el("quiz-indhold").innerHTML =
            '<div class="quiz-tal">Spørgsmål ' + (Q.nr + 1) + " af " + D.QUIZ.length + "</div>" +
            '<div class="quiz-spm">' + sp.q + "</div>" +
            '<div class="valg en-spalte">' + knapper + "</div>" +
            '<p class="quiz-forklar' + (Q.svaret ? (Q.valgt === sp.rigtig ? " god" : " skidt") : "") + '">' +
            (Q.svaret ? sp.hvorfor : "") + "</p>" +
            '<div class="quiz-bund">' +
            '<button type="button" class="knap" data-handling="luk">Luk</button>' +
            '<button type="button" class="knap blaa" data-handling="naeste"' + (Q.svaret ? "" : " disabled") + ">" +
            (sidste ? "Se resultatet" : "Næste spørgsmål") + "</button>" +
            "</div>";
    };

    Q.visResultat = function () {
        var pct = Math.round(100 * Q.rigtige / D.QUIZ.length);
        var ord = pct === 100 ? "Alt rigtigt — flot."
            : pct >= 60 ? "Godt gået. Kig teorien igennem for de sidste."
            : "Åbn teoriboksen, og prøv igen bagefter.";

        NK.el("quiz-indhold").innerHTML =
            '<div class="quiz-tal">Resultat</div>' +
            '<div class="quiz-score">' + Q.rigtige + " ud af " + D.QUIZ.length + "</div>" +
            '<p class="quiz-forklar">' + ord + "</p>" +
            '<div class="quiz-bund">' +
            '<button type="button" class="knap" data-handling="luk">Luk</button>' +
            '<button type="button" class="knap blaa" data-handling="igen">Prøv igen</button>' +
            "</div>";
    };

    /* Ét klik-lyt for hele boksen - indholdet skiftes jo ud hele tiden. */
    Q.kobl = function () {
        NK.el("quiz-indhold").addEventListener("click", function (e) {
            var knap = e.target.closest ? e.target.closest("button") : null;
            if (!knap) return;
            var handling = knap.getAttribute("data-handling");
            if (handling === "luk") Q.luk();
            else if (handling === "naeste") Q.naeste(false);
            else if (handling === "igen") Q.aabn();
            else if (knap.hasAttribute("data-nr")) Q.vaelg(parseInt(knap.getAttribute("data-nr"), 10));
        });

        NK.el("quiz").addEventListener("click", function (e) {
            if (e.target.id === "quiz") Q.luk();
        });
    };
}());
