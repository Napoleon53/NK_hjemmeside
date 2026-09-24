/* =====================================================================
   quiz.js - fem spoergsmaal i et vindue

   Svarmulighederne blandes hver gang. Et forkert svar giver den
   forklaring, der passer til netop den fejl; forklaringen kommer ogsaa
   ved et rigtigt svar. Spoergsmaalene staar i D.QUIZ (js/tekster.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function Quiz() {
        this.nr = 0;
        this.point = 0;
        this.besvaret = false;
        this.slut = false;
        var mig = this;
        NK.el("quiz-naeste").addEventListener("click", function () { mig.naeste(); });
        NK.el("quiz-svar").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("button") : null;
            if (k && k.hasAttribute("data-nr")) mig.svar(parseInt(k.getAttribute("data-nr"), 10));
        });
    }

    var P = Quiz.prototype;

    P.aabn = function () {
        if (this.slut || (this.nr === 0 && !this.besvaret)) this.forfra();
        NK.el("quiz").classList.add("vis");
    };

    P.forfra = function () {
        this.nr = 0;
        this.point = 0;
        this.slut = false;
        this.vis();
    };

    P.vis = function () {
        var q = D.QUIZ[this.nr];
        this.besvaret = false;
        this.raekke = NK.bland(q.svar.map(function (_, i) { return i; }));
        NK.saetTekst("quiz-tal", "Spørgsmål " + (this.nr + 1) + "/" + D.QUIZ.length);
        NK.saetTekst("quiz-spm", q.spm);
        var vaert = NK.el("quiz-svar");
        vaert.innerHTML = "";
        this.raekke.forEach(function (i) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap";
            k.textContent = q.svar[i].tekst;
            k.setAttribute("data-nr", String(i));
            vaert.appendChild(k);
        });
        var f = NK.el("quiz-forklaring");
        f.textContent = "";
        f.className = "besked quiz-forklaring";
        NK.el("quiz-naeste").hidden = true;
    };

    P.svar = function (i) {
        if (this.besvaret || this.slut) return;
        this.besvaret = true;
        var q = D.QUIZ[this.nr], valgt = q.svar[i];
        var knapper = NK.el("quiz-svar").querySelectorAll("button");
        for (var j = 0; j < knapper.length; j++) {
            var nr = parseInt(knapper[j].getAttribute("data-nr"), 10);
            knapper[j].disabled = true;
            if (q.svar[nr].rigtig) knapper[j].classList.add("rigtig");
            else if (nr === i) knapper[j].classList.add("forkert");
            else knapper[j].classList.add("mat");
        }
        var f = NK.el("quiz-forklaring");
        if (valgt.rigtig) {
            this.point++;
            f.textContent = "Rigtigt. " + q.forklaring;
            f.className = "besked quiz-forklaring god";
        } else {
            f.textContent = valgt.fejl + " " + q.forklaring;
            f.className = "besked quiz-forklaring skidt";
        }
        var n = NK.el("quiz-naeste");
        n.textContent = this.nr < D.QUIZ.length - 1 ? "Næste" : "Se resultatet";
        n.hidden = false;
        n.focus();
    };

    P.naeste = function () {
        if (this.slut) { this.forfra(); return; }
        if (!this.besvaret) return;
        if (this.nr < D.QUIZ.length - 1) { this.nr++; this.vis(); return; }
        this.slut = true;
        NK.saetTekst("quiz-tal", "Quizzen er slut");
        NK.saetTekst("quiz-spm", "Du fik " + this.point + " ud af " + D.QUIZ.length + " rigtige.");
        NK.el("quiz-svar").innerHTML = "";
        var f = NK.el("quiz-forklaring");
        f.textContent = this.point === D.QUIZ.length ? "Alle rigtige." : "Prøv de opgaver i bassinet, der drillede, og tag quizzen igen.";
        f.className = "besked quiz-forklaring" + (this.point === D.QUIZ.length ? " god" : "");
        NK.el("quiz-naeste").textContent = "Prøv igen";
    };

    NK.Quiz = Quiz;
}());
