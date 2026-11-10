/* =====================================================================
   quiz.js - seks spoergsmaal: tre fra den gamle b9.1 og tre nye

   Aabnes med knappen Quiz i toplinjen (eller Q). Svarene blandes hver
   gang, et svar kan kun gives én gang, og forklaringen kommer baade ved
   et rigtigt og et forkert svar. Alle rigtige goer knappen groen, og det
   huskes i browseren.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var NOEGLE = "nk-sb9.1-quiz";

    var Q = { nr: 0, rigtige: 0, orden: [], svaret: -1 };

    function start() {
        Q.nr = 0;
        Q.rigtige = 0;
        Q.svaret = -1;
        Q.orden = D.QUIZ.map(function (q) { return NK.bland(q.svar.map(function (s, i) { return i; })); });
    }

    function knapTilstand() {
        var k = NK.el("quizknap");
        var loest = !!NK.hent(NOEGLE, false);
        k.classList.toggle("loest", loest);
        k.textContent = loest ? "Quiz ✓" : "Quiz";
    }

    function vis() {
        var boks = NK.el("quiz-indhold");
        var n = D.QUIZ.length;
        if (Q.nr >= n) { visResultat(boks); return; }
        var q = D.QUIZ[Q.nr];
        var h = '<div class="quiz-top"><span>Spørgsmål ' + (Q.nr + 1) + " af " + n + "</span><span>Rigtige: " + Q.rigtige + "</span></div>" +
            '<div class="quiz-bar"><span style="width:' + Math.round(Q.nr / n * 100) + '%"></span></div>' +
            '<p class="quiz-q">' + NK.html(q.q) + "</p>" +
            '<div class="quiz-svar">';
        Q.orden[Q.nr].forEach(function (i) {
            var kl = "knap quiz-valg";
            if (Q.svaret >= 0) {
                if (i === 0) kl += " rigtig";
                else if (i === Q.svaret) kl += " forkert";
            }
            h += '<button type="button" class="' + kl + '" data-i="' + i + '"' + (Q.svaret >= 0 ? " disabled" : "") + ">" +
                NK.html(q.svar[i]) + "</button>";
        });
        h += "</div>";
        if (Q.svaret >= 0) {
            var ok = Q.svaret === 0;
            h += '<div class="quiz-fb ' + (ok ? "ok" : "nej") + '">' +
                '<p class="quiz-dom">' + (ok ? "Rigtigt." : "Ikke rigtigt. " + NK.html(q.nej[Q.svaret] || "")) + "</p>" +
                '<p class="quiz-hvorfor">' + q.hvorfor + "</p></div>" +
                '<div class="quiz-knapper"><button type="button" class="knap blaa" id="quiz-videre">' +
                (Q.nr === n - 1 ? "Se resultatet →" : "Næste spørgsmål →") + "</button></div>";
        }
        boks.innerHTML = h;
        var valg = boks.querySelectorAll(".quiz-valg");
        for (var j = 0; j < valg.length; j++) {
            valg[j].addEventListener("click", function () { svar(parseInt(this.getAttribute("data-i"), 10)); });
        }
        var videre = NK.el("quiz-videre");
        if (videre) {
            videre.addEventListener("click", function () { Q.nr++; Q.svaret = -1; vis(); });
            videre.focus();
        }
    }

    function svar(i) {
        if (Q.svaret >= 0) return;
        Q.svaret = i;
        if (i === 0) Q.rigtige++;
        vis();
    }

    function visResultat(boks) {
        var n = D.QUIZ.length, alle = Q.rigtige === n;
        if (alle) NK.gem(NOEGLE, true);
        knapTilstand();
        boks.innerHTML = '<div class="quiz-resultat' + (alle ? " alle" : "") + '">' +
            '<div class="quiz-tal">' + Q.rigtige + " af " + n + "</div>" +
            "<p>" + (alle ? "Alle " + n + " rigtige." : "Tag quizzen igen, og prøv at få alle " + n + ".") + "</p></div>" +
            '<div class="quiz-knapper"><button type="button" class="knap blaa" id="quiz-igen">Tag quizzen igen</button>' +
            '<button type="button" class="knap" data-luk>Luk</button></div>';
        NK.el("quiz-igen").addEventListener("click", function () { start(); vis(); });
        boks.querySelector("[data-luk]").addEventListener("click", function () { NK.el("quiz").classList.remove("vis"); });
    }

    function aabn() {
        if (Q.nr >= D.QUIZ.length || !Q.orden.length) start();
        NK.el("quiz").classList.add("vis");
        vis();
    }

    NK.Quiz = { aabn: aabn, start: start, svar: svar, tilstand: function () { return Q; } };

    function init() {
        start();
        knapTilstand();
        NK.el("quizknap").addEventListener("click", aabn);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
