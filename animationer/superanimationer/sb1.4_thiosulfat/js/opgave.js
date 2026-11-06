/* =====================================================================
   opgave.js - opgavekortet paa alle tre faner (samme moenster som sb1.1)

   Papirkortet (6. nov. 2026, brugerens regler 24. okt. og 3.-4. nov.):
   opgaven staar paa ét lyst kort oeverst i midten af scenen
   (../faelles/papirkort.css og .js). Al tekst staar dér: opgaven,
   svarmulighederne, hintet, forklaringen til et forkert svar og
   forklaringen til det rigtige. Svarknapperne vaelger kun; Indsend svar
   sender ind (graa, til der er valgt noget). Giv et hint er en stille
   knap: Giv et hint -> Vis svaret. Efter et svar bliver kortet paa
   spoergsmaalet: svaret bliver groent, forklaringen staar under svarene,
   og Naeste staar, hvor Indsend svar stod.

   Kortets nederste raekke viser ogsaa forsoegets beskeder (melding):
   "Kig paa krydset oppefra ...", svaret paa et tal i tabellen osv. Der er
   derfor ingen statuslinje nederst i scenen.

   Foer den foerste opgave staar der en kort tekst og knappen Start
   opgave (Start quizzen) paa kortet. Panelet har kun taelleren
   (prikkerne i quizzen) og knappen Afslut / Tag quizzen igen.

   Kortet kalder fanen:
     sim.opsaetOpgave(o)   stil scenen op til opgaven
     sim.slutOpgave()      frit spil igen
     sim.afvisTilbud()     den foerste loeste opgave fjerner tilbuddet om
                           Kemichaels praesentation

   QUIZ (fane 1): new NK.Opgavekort(p, liste, sim, { videreTekst, videre })
   Listens spoergsmaal stilles ét ad gangen, og hvert faar ét svar. Et
   forkert svar (eller Vis svaret) viser det rigtige, og spoergsmaalet
   kommer igen til sidst, med nye tal, hvis det har flere saet. Naar alle
   er besvaret rigtigt, fejres det, og knappen paa kortet foerer videre
   (quiz.videre). Prikkerne i panelet viser, hvor mange der er rigtige.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var KONFETTI = ["#f2c53d", "#57d18c", "#5fb6f0", "#c9a6ff", "#ff8a80", "#f0a830"];

    /* p: forstavelsen paa elementernes id, fx "konc". quiz: se oeverst */
    function Opgavekort(p, liste, sim, quiz) {
        this.p = p;
        this.liste = liste;
        this.sim = sim;
        this.quiz = quiz || null;
        this.koe = [];              /* quiz: de spoergsmaal, der mangler et rigtigt svar */
        this.def = null;
        this.rigtige = 0;
        this.opgave = null;
        this.slut = null;           /* { tekst, maade: "rigtig" | "svar" | "forkert" } */
        this.quizSlut = false;
        this.antalLoest = 0;
        this.naesteNr = 0;          /* foerste gang i listens raekkefoelge */
        this.nr = 0;
        this.sidste = null;
        this.valgt = -1;
        this.hjaelp = 0;            /* 0: Giv et hint, 1: Vis svaret */
        this.fast = { html: "", klasse: "" };
        this.el = {
            skort: NK.el(p + "-skort"), ind: NK.el(p + "-ind"), status: NK.el(p + "-status"),
            besked: NK.el(p + "-besked"), hjaelp: NK.el(p + "-hjaelp"), indsend: NK.el(p + "-indsend")
        };
        var mig = this;
        this.el.skort.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("button") : null;
            if (!k || k.disabled) return;
            if (k.hasAttribute("data-valg")) mig.vaelg(parseInt(k.getAttribute("data-valg"), 10));
            else if (k.hasAttribute("data-videre")) mig.videre();
        });
        this.el.hjaelp.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        NK.el(p + "-afslut").addEventListener("click", function () { mig.lilleKnap(); });
        this.vis();
    }

    var P = Opgavekort.prototype;

    P.valgNaeste = function () {
        var liste = this.liste, def;
        if (this.quiz) {
            if (!this.opgave) { this.koe = liste.slice(); this.rigtige = 0; }
            return this.koe.shift();
        }
        if (this.naesteNr < liste.length) {
            def = liste[this.naesteNr++];
        } else {
            var mig = this;
            var andre = liste.filter(function (d) { return d !== mig.sidste; });
            def = NK.tilfaeldig(andre.length ? andre : liste);
        }
        this.sidste = def;
        return def;
    };

    P.ny = function () {
        var def = this.valgNaeste();
        this.def = def;
        this.opgave = def.lav();
        this.opgave.id = def.id;
        this.opgave.vist = false;
        this.opgave.loest = false;
        this.opgave.forkert = {};
        /* Svarmulighederne i tilfaeldig raekkefoelge */
        if (this.opgave.valg) this.opgave.valg = NK.bland(this.opgave.valg);
        this.nr++;
        this.slut = null;
        this.quizSlut = false;
        this.valgt = -1;
        this.hjaelp = 0;
        this.fast = { html: "", klasse: "" };
        this.sim.opsaetOpgave(this.opgave);
        this.vis();
    };

    /* Den groenne knap paa kortet foerer altid fremad */
    P.videre = function () {
        if (this.quizSlut) { if (this.quiz.videre) this.quiz.videre(); return; }
        this.ny();
    };

    /* En svarknap vaelger kun */
    P.vaelg = function (j) {
        var o = this.opgave;
        if (!o || o.loest || o.vist || !o.valg || o.forkert[j]) return;
        this.valgt = j;
        if (this.fast.klasse === "skidt" && !this.fast.sim) this.fast = { html: "", klasse: "" };
        this.vis();
    };

    P.kanSendes = function () {
        var o = this.opgave;
        if (!o || o.loest || o.vist) return false;
        return this.valgt >= 0;
    };

    /* Indsend svar (og Start opgave, foer den foerste opgave) */
    P.indsendKlik = function () {
        var o = this.opgave;
        if (!o) { this.ny(); return; }
        if (o.loest || o.vist) return;
        if (!this.kanSendes()) { this.blink(); return; }
        var v = o.valg[this.valgt];
        if (v.rigtig) { this.klaret(v.forklaring); return; }
        o.forkert[this.valgt] = true;
        if (this.quiz) {
            /* Ét svar pr. spoergsmaal: det rigtige vises, og spoergsmaalet kommer igen */
            o.vist = true;
            this.koe.push(this.def);
            this.slut = { tekst: v.forklaring, maade: "forkert" };
            this.vis();
            return;
        }
        this.valgt = -1;
        this.fast = { html: '<span class="b-maerke">Ikke endnu</span>' + NK.html(v.forklaring), klasse: "skidt", ny: true };
        this.vis();
    };

    P.hjaelpKlik = function () {
        var o = this.opgave;
        if (!o || o.loest || o.vist) return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.fast = { html: '<span class="b-maerke">Hint</span>' + NK.html(o.hint), klasse: "hint", ny: true };
            this.vis();
            return;
        }
        o.vist = true;
        var r = o.valg.filter(function (v) { return v.rigtig; })[0];
        if (this.quiz) this.koe.push(this.def);
        this.slut = { tekst: "Svaret er " + r.tekst + ". " + r.forklaring, maade: "svar" };
        this.vis();
    };

    /* Opgaven er loest */
    P.klaret = function (tekst) {
        var o = this.opgave;
        if (!o || o.loest) return;
        o.loest = true;
        if (!o.vist) { this.antalLoest++; this.rigtige++; }
        this.quizSlut = !!(this.quiz && !this.koe.length);
        if (this.quizSlut) tekst = "Alle " + this.liste.length + " rigtige. " + tekst;
        this.slut = { tekst: tekst || "", maade: "rigtig" };
        this.vis();
        if (this.quizSlut) this.fejr();
        if (this.sim.afvisTilbud) this.sim.afvisTilbud();
    };

    /* Forsoegets egne beskeder i kortets nederste raekke. art: "", gul, god, skidt */
    P.melding = function (tekst, art) {
        if (!tekst) {
            if (this.fast.sim) { this.fast = { html: "", klasse: "" }; this.vis(); }
            return;
        }
        /* Kommer beskeden, mens kortet bliver paa et besvaret spoergsmaal, staar
           den i stedet for forklaringen, saa kortet ikke vokser */
        this.fast = { html: NK.html(tekst), klasse: art || "peger", ny: true, sim: true, efter: !!(this.opgave && this.slut) };
        this.vis();
    };

    /* Quizzen er klaret: konfetti ud fra kortet */
    P.fejr = function () {
        var r = this.el.skort.getBoundingClientRect();
        var boks = document.createElement("div");
        boks.className = "konfetti";
        boks.setAttribute("aria-hidden", "true");
        boks.style.left = (r.left + r.width / 2) + "px";
        boks.style.top = (r.bottom - 20) + "px";
        for (var i = 0; i < 46; i++) {
            var b = document.createElement("i"), v = NK.r(-Math.PI * 0.95, -Math.PI * 0.05), fart = NK.r(70, 210);
            b.style.backgroundColor = KONFETTI[i % KONFETTI.length];
            b.style.setProperty("--dx", (Math.cos(v) * fart * 1.15).toFixed(0) + "px");
            b.style.setProperty("--op", (Math.sin(v) * fart).toFixed(0) + "px");
            b.style.setProperty("--ned", NK.r(160, 340).toFixed(0) + "px");
            b.style.setProperty("--rot", NK.r(-720, 720).toFixed(0) + "deg");
            b.style.animationDelay = NK.r(0, 0.18).toFixed(2) + "s";
            if (i % 3 === 0) b.style.borderRadius = "50%";
            boks.appendChild(b);
        }
        document.body.appendChild(boks);
        window.setTimeout(function () { if (boks.parentNode) boks.parentNode.removeChild(boks); }, 2600);
    };

    /* Knappen i panelet: Afslut, eller quizzen forfra, naar den er klaret */
    P.lilleKnap = function () {
        var igen = this.quizSlut;
        this.afslut();
        if (igen) this.ny();
    };

    P.afslut = function () {
        this.opgave = null;
        this.def = null;
        this.koe = [];
        this.rigtige = 0;
        this.slut = null;
        this.quizSlut = false;
        this.valgt = -1;
        this.hjaelp = 0;
        this.nr = 0;
        if (!this.fast.sim) this.fast = { html: "", klasse: "" };
        this.sim.slutOpgave();
        this.vis();
    };

    P.aktiv = function () {
        return !!this.opgave;
    };

    /* Kortet blinker blødt: eleven greb ud efter noget, der ikke gaar lige nu */
    P.blink = function () {
        var e = this.el.skort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* ----- Kortet ------------------------------------------------------------ */
    P.chip = function () {
        var n = this.liste.length;
        if (this.quiz) return "Spørgsmål " + Math.min(n, this.rigtige + (this.opgave.loest && !this.opgave.vist ? 0 : 1)) + " af " + n;
        return this.nr <= n ? "Opgave " + this.nr + " af " + n : "Ekstra opgave";
    };

    P.svarHTML = function (bliv) {
        var o = this.opgave, mig = this;
        var lang = o.valg.some(function (v) { return v.tekst.length > 24; });
        var h = '<div class="sk-svar n' + o.valg.length + (lang ? " lang" : "") + '">';
        o.valg.forEach(function (v, j) {
            var kl = "sk-knap", laast = bliv || !!o.forkert[j];
            if (bliv) kl += v.rigtig ? (mig.slut.maade === "rigtig" ? " rigtig" : " svar-vist") : (o.forkert[j] ? " forkert" : " dim");
            else if (o.forkert[j]) kl += " forkert";
            else if (mig.valgt === j) kl += " valgt";
            h += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span><span>" + NK.html(v.tekst) + "</span></button>";
        });
        return h + "</div>";
    };

    P.vis = function () {
        var o = this.opgave, e = this.el, html;
        var bliv = !!(o && this.slut), gul = bliv && this.slut.maade !== "rigtig";
        var kl = "scenekort " + (!o ? "opgave start" : (bliv ? "loest bliv" + (gul ? " svar" : "") : "spm"));
        if (e.skort.className.replace(" blink", "") !== kl) e.skort.className = kl;

        if (!o) {
            html = '<p class="sk-tekst"><span class="sk-chip">' + (this.quiz ? "Quiz" : "Opgaver") + "</span>" +
                NK.html(e.skort.getAttribute("data-start") || "") + "</p>";
        } else {
            html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(this.chip()) + "</span>" + NK.Papir.tekst(NK.html(o.tekst)) + "</p>" +
                this.svarHTML(bliv);
            if (bliv) {
                var maerke = { rigtig: "Rigtigt", svar: "Svaret", forkert: "Ikke rigtigt" }[this.slut.maade];
                var knap = this.quizSlut ? this.quiz.videreTekst : (this.quiz ? "Næste spørgsmål" : "Næste opgave");
                if (this.fast.sim && this.fast.efter) html += NK.Papir.bliv(this.fast.html, "", NK.html(knap), this.fast.klasse !== "god");
                else html += NK.Papir.bliv(NK.html(this.slut.tekst), maerke, NK.html(knap), gul);
            }
        }
        NK.saetHTML(this.p + "-ind", html);

        /* Kortets nederste raekke: beskeden, Giv et hint og Indsend svar.
           Naar kortet bliver paa et besvaret spoergsmaal, er raekken vaek. */
        var f = this.fast;
        e.status.hidden = bliv;
        e.besked.innerHTML = f.html;
        e.besked.hidden = !f.html;
        e.status.className = "sk-bund" + (f.klasse ? " " + f.klasse : "") + (f.html ? "" : " tom") + (f.ny ? " ryster" : "");
        f.ny = false;
        e.hjaelp.hidden = !o || bliv;
        e.hjaelp.textContent = this.hjaelp === 0 ? "Giv et hint" : "Vis svaret";
        e.hjaelp.className = "knap hjaelp" + (this.hjaelp === 0 ? "" : " svar") + (f.klasse === "skidt" && !f.sim ? " peg" : "");
        var kan = !o || this.kanSendes();
        e.indsend.hidden = bliv;
        e.indsend.textContent = o ? "Indsend svar" : (this.quiz ? "Start quizzen" : "Start opgave");
        e.indsend.classList.toggle("klar", kan);
        e.indsend.classList.toggle("ikke-klar", !kan);
        e.indsend.setAttribute("aria-disabled", kan ? "false" : "true");

        /* Panelet: taelleren (prikkerne) og Afslut */
        NK.saetTekst(this.p + "-loest", String(this.antalLoest));
        var afslut = NK.el(this.p + "-afslut");
        afslut.hidden = !o;
        if (this.quiz) this.visPrikker();
    };

    P.visPrikker = function () {
        var n = this.liste.length, h = "";
        for (var i = 0; i < n; i++) h += i < this.rigtige ? '<i class="rigtig"></i>' : "<i></i>";
        NK.saetHTML(this.p + "-prikker", h);
        var prikker = NK.el(this.p + "-prikker");
        if (prikker) {
            prikker.setAttribute("aria-label", this.rigtige + " af " + n + " rigtige");
            prikker.classList.toggle("alle", this.quizSlut);
        }
        NK.saetTekst(this.p + "-afslut", this.quizSlut ? "Tag quizzen igen" : "Afslut");
        var kort = NK.el(this.p + "-opgavekort");
        if (kort) kort.classList.toggle("klaret", this.quizSlut);
    };

    NK.Opgavekort = Opgavekort;
}());
