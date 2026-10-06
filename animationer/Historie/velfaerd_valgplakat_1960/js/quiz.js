/* =====================================================================
   quiz.js - forloebet og opstarten

   Ni spoergsmaal til plakaten, ét ad gangen. Et forkert svar faar en
   kort grund og bliver streget; eleven proever igen. Det rigtige svar
   laegger en saetning paa arket (Din kildeanalyse), og eleven gaar selv
   videre med knappen. Til sidst staar hele analysen paa arket.

   Den gule ramme paa plakaten kommer foerst, naar eleven har svaret:
   den viser, hvor svaret kan ses.

   Teksterne staar i js/data.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = D.TEKST;
    var BOGSTAVER = ["A", "B", "C", "D", "E"];

    function el(id) { return NK.el(id); }

    /* nr: spoergsmaalet. loest: det rigtige svar er valgt. proevet: de forkerte
       svar, der er valgt i dette spoergsmaal. foerste: rigtigt i foerste forsoeg,
       ét sandt eller falsk pr. loest spoergsmaal. orden: svarenes raekkefoelge. */
    var S = { nr: 0, loest: false, proevet: [], foerste: [], orden: [], slut: false };

    function spm() { return D.SPM[S.nr]; }

    function bland(antal) {
        var a = [], i, j, t;
        for (i = 0; i < antal; i++) a.push(i);
        for (i = antal - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function udfyld(tekst, v) {
        return tekst.replace(/\{(\w+)\}/g, function (hel, navn) {
            return v[navn] === undefined ? hel : String(v[navn]);
        });
    }

    /* ----- Statuslinjen og knappen ---------------------------------------- */
    function status(farve, maerke, tekst, ryst) {
        var linje = el("statuslinje");
        linje.className = "statuslinje" + (farve ? " " + farve : "");
        NK.saetHTML("besked", (maerke ? '<span class="b-maerke">' + NK.html(maerke) + "</span>" : "") + NK.html(tekst));
        if (ryst) NK.genstart(linje, "ryster");
    }

    function knap(tekst) {
        var k = el("knap");
        k.hidden = !tekst;
        if (tekst) k.textContent = tekst;
    }

    /* ----- Plakaten -------------------------------------------------------- */
    function visSted(navn) {
        var ring = el("ring"), sted = navn ? D.STEDER[navn] : null;
        el("henvisning").classList.toggle("lyser", navn === "henvisning");
        if (!sted) { ring.classList.remove("vis"); return; }
        ring.style.left = sted[0] + "%";
        ring.style.top = sted[1] + "%";
        ring.style.width = sted[2] + "%";
        ring.style.height = sted[3] + "%";
        NK.genstart(ring, "vis");
    }

    /* ----- Tegn ------------------------------------------------------------ */
    function tegnTrin() {
        var html = "";
        for (var i = 0; i < D.SPM.length; i++) {
            var loest = S.slut || i < S.nr || (i === S.nr && S.loest);
            html += '<li class="tr' + (loest ? " loest" : (i === S.nr ? " nu" : "")) + '">' + (i + 1) + "</li>";
        }
        NK.saetHTML("trin", html);
    }

    function tegnSvar() {
        var q = spm(), orden = S.orden[S.nr], html = "";
        for (var p = 0; p < orden.length; p++) {
            var i = orden[p], s = q.svar[i], klasse = "knap svar", laast = S.loest;
            if (S.loest && s.rigtig) klasse += " rigtig";
            if (S.proevet.indexOf(i) !== -1) { klasse += " forkert"; laast = true; }
            html += '<button class="' + klasse + '" type="button" data-svar="' + i + '"' + (laast ? " disabled" : "") + ">" +
                '<span class="bog">' + BOGSTAVER[p] + "</span><span>" + NK.html(s.t) + "</span></button>";
        }
        el("valg").innerHTML = html;
    }

    /* Arket: én saetning pr. loest spoergsmaal. Den nyeste er markeret. */
    function tegnAnalyse() {
        var antal = S.slut ? D.SPM.length : S.nr + (S.loest ? 1 : 0), html = "";
        for (var i = 0; i < antal; i++) {
            var ny = !S.slut && S.loest && i === S.nr;
            html += '<span class="saet' + (ny ? " ny" : "") + '">' + NK.html(D.SPM[i].saetning) + "</span> ";
        }
        var p = el("analyse-tekst");
        p.classList.toggle("tom", antal === 0);
        p.innerHTML = antal === 0 ? NK.html(T.tom) : html;
        var ark = el("analyse");
        ark.scrollTop = S.slut ? 0 : ark.scrollHeight;
    }

    function visSpm() {
        var q = spm();
        NK.saetTekst("spm-ord", q.ord);
        NK.saetTekst("spm", q.spm);
        tegnTrin();
        tegnSvar();
        tegnAnalyse();
        visSted(null);
        status("", "", T.start);
        knap("");
    }

    /* ----- Eleven svarer --------------------------------------------------- */
    function vaelg(i) {
        if (S.slut || S.loest) return;
        var q = spm(), s = q.svar[i];
        if (!s || S.proevet.indexOf(i) !== -1) return;

        if (!s.rigtig) {
            S.proevet.push(i);
            tegnSvar();
            visSted(q.sted);
            status("roed", "Ikke endnu", s.fejl, true);
            return;
        }

        S.loest = true;
        S.foerste[S.nr] = S.proevet.length === 0;
        tegnSvar();
        tegnTrin();
        tegnAnalyse();
        visSted(q.sted);
        status("groen", "Rigtigt", s.fordi);
        knap(S.nr === D.SPM.length - 1 ? T.sidste : T.naeste);
        el("knap").focus();
    }

    function vaelgPlads(plads) {
        var orden = S.orden[S.nr];
        if (orden && plads >= 0 && plads < orden.length) vaelg(orden[plads]);
    }

    function videre() {
        if (S.slut || !S.loest) return;
        if (S.nr >= D.SPM.length - 1) { slut(); return; }
        S.nr++;
        S.loest = false;
        S.proevet = [];
        visSpm();
    }

    /* ----- Slut -------------------------------------------------------------- */
    function fejring() {
        var boks = el("fejring"), html = "", farver = ["#f2c53d", "#e05446", "#3d9ee0", "#7ee0a8", "#f0d77a"];
        for (var i = 0; i < 28; i++) {
            html += '<i style="left:' + (4 + (i * 37) % 92) + "%;background:" + farver[i % farver.length] +
                ";animation-delay:" + ((i * 53) % 400) + "ms;animation-duration:" + (1300 + (i * 97) % 700) + 'ms"></i>';
        }
        boks.innerHTML = html;
        NK.genstart(boks, "i-gang");
        window.setTimeout(function () { boks.classList.remove("i-gang"); boks.innerHTML = ""; }, 2400);
    }

    function analyseTekst() {
        var dele = [];
        for (var i = 0; i < D.SPM.length; i++) dele.push(D.SPM[i].saetning);
        return dele.join(" ");
    }

    function slut() {
        S.slut = true;
        document.body.setAttribute("data-fase", "slut");
        NK.saetTekst("spm-ord", "Færdig");
        tegnTrin();
        tegnAnalyse();
        visSted(null);

        var liste = "", rigtige = 0;
        for (var i = 0; i < D.SPM.length; i++) {
            liste += "<li>" + NK.html(D.SPM[i].ord) + "</li>";
            if (S.foerste[i]) rigtige++;
        }
        NK.saetTekst("metode-tekst", T.metode);
        el("metode-liste").innerHTML = liste;
        el("metode").hidden = false;

        var v = { k: rigtige, n: D.SPM.length };
        status("groen", "Færdig", udfyld(rigtige === D.SPM.length ? T.alle : T.nogle, v));
        knap(T.kopier);
        el("forfra").hidden = false;
        fejring();
    }

    /* Analysen til udklipsholderen, saa den kan saettes ind i elevens noter. */
    function kopier() {
        var tekst = analyseTekst(), k = el("knap");
        function kvitter() {
            k.textContent = T.kopieret;
            window.setTimeout(function () { if (S.slut) k.textContent = T.kopier; }, 1600);
        }
        function gammelVej() {
            var omraade = document.createRange(), valg = window.getSelection();
            omraade.selectNodeContents(el("analyse-tekst"));
            valg.removeAllRanges();
            valg.addRange(omraade);
            try { if (document.execCommand("copy")) kvitter(); } catch (e) { /* teksten staar markeret */ }
        }
        try {
            navigator.clipboard.writeText(tekst).then(kvitter, gammelVej);
        } catch (e) {
            gammelVej();
        }
    }

    function start() {
        S.nr = 0;
        S.loest = false;
        S.proevet = [];
        S.foerste = [];
        S.slut = false;
        S.orden = [];
        for (var i = 0; i < D.SPM.length; i++) S.orden.push(bland(D.SPM[i].svar.length));
        document.body.setAttribute("data-fase", "spm");
        el("metode").hidden = true;
        el("forfra").hidden = true;
        visSpm();
    }

    /* ----- Pop op -------------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function aabn(id) {
        lukAlle();
        el(id).classList.add("vis");
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        if (e.key === "Escape") { lukAlle(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (document.querySelector(".overlay.vis")) return;
        if (e.key >= "1" && e.key <= "5") { vaelgPlads(parseInt(e.key, 10) - 1); return; }
        if (e.key === "t" || e.key === "T") { aabn("fagord"); return; }
        if (e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            if (!S.slut) videre();
        }
    }

    /* ----- Opstart ------------------------------------------------------- */
    function opstart() {
        var billede = el("plakat-billede");
        billede.src = D.PLAKAT.fil;
        billede.alt = D.PLAKAT.alt;
        el("stor-billede").src = D.PLAKAT.fil;
        el("stor-billede").alt = D.PLAKAT.alt;
        NK.saetTekst("henvisning", D.PLAKAT.henvisning);

        el("valg").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-svar]");
            if (b) vaelg(parseInt(b.getAttribute("data-svar"), 10));
        });
        el("knap").addEventListener("click", function () { if (S.slut) kopier(); else videre(); });
        el("forfra").addEventListener("click", start);
        el("plakat").addEventListener("click", function () { aabn("stor"); });
        el("stor").addEventListener("click", lukAlle);

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        el("fagord").addEventListener("click", function (e) { if (e.target === el("fagord")) lukAlle(); });
        el("fagordknap").addEventListener("click", function () { aabn("fagord"); });
        document.addEventListener("keydown", tastatur);

        start();
    }

    NK.Quiz = { start: start, vaelg: vaelg, videre: videre, tilstand: S, analyseTekst: analyseTekst };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", opstart);
    } else {
        opstart();
    }
}());
