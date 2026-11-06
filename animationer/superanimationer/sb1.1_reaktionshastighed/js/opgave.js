/* =====================================================================
   opgave.js - opgavekortet paa fane 1 og 2

   Papirkortet (6. nov. 2026, brugerens regler 24. okt. og 3.-4. nov.):
   opgaven staar paa ét lyst kort oeverst i midten af scenen
   (../faelles/papirkort.css og .js). Al tekst staar dér: opgaven,
   svarmulighederne, hintet, forklaringen til et forkert svar og
   forklaringen til det rigtige. Svarknapperne vaelger kun; Indsend svar
   sender ind (graa, til der er valgt noget). Giv et hint er en stille
   knap: Giv et hint -> Vis svaret. Efter et rigtigt svar bliver kortet
   paa spoergsmaalet: svaret bliver groent, forklaringen staar under
   svarene, og Naeste opgave staar, hvor Indsend svar stod.

   Foer den foerste opgave staar der en kort tekst og knappen Start
   opgave paa kortet. Panelet har kun taelleren og knappen Afslut, der
   foerer tilbage til frit spil.

   Kortet kalder fanen:
     sim.opsaetOpgave(o)   stil scenen op til opgaven
     sim.slutOpgave()      frit spil igen
     sim.visSvar(o)        (kun opgaver uden svarknapper) vis svaret
     sim.kanIndsende(o)    (kun opgaver uden svarknapper) er der noget at sende?
     sim.tjekOpgave(o)     (kun opgaver uden svarknapper) Indsend svar:
                           { ok: true } eller { ok: false, tekst: "..." }
   Fanen kalder kortet.blink(), naar et greb i scenen er spaerret af
   opgaven, og kortet.vis(), naar kanIndsende kan have skiftet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* p: forstavelsen paa elementernes id, fx "kurve" */
    function Opgavekort(p, liste, sim) {
        this.p = p;
        this.liste = liste;
        this.sim = sim;
        this.opgave = null;
        this.slut = null;           /* { tekst, maade: "rigtig" | "svar" } naar opgaven er klaret */
        this.antalLoest = 0;
        this.naesteNr = 0;          /* foerste gang i listens raekkefoelge */
        this.nr = 0;                /* opgavens nummer, siden kortet blev startet */
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
            else if (k.hasAttribute("data-videre")) mig.ny();
        });
        this.el.hjaelp.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        NK.el(p + "-afslut").addEventListener("click", function () { mig.afslut(); });
        this.vis();
    }

    var P = Opgavekort.prototype;

    P.valgNaeste = function () {
        var liste = this.liste, def;
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
        this.opgave = def.lav();
        this.opgave.id = def.id;
        this.opgave.vist = false;
        this.opgave.loest = false;
        this.opgave.forkert = {};
        /* Svarmulighederne i tilfaeldig raekkefoelge */
        if (this.opgave.valg) this.opgave.valg = NK.bland(this.opgave.valg);
        this.nr++;
        this.slut = null;
        this.valgt = -1;
        this.hjaelp = 0;
        this.fast = { html: "", klasse: "" };
        this.sim.opsaetOpgave(this.opgave);
        this.vis();
    };

    /* En svarknap vaelger kun */
    P.vaelg = function (j) {
        var o = this.opgave;
        if (!o || o.loest || o.vist || !o.valg || o.forkert[j]) return;
        this.valgt = j;
        if (this.fast.klasse === "skidt") this.fast = { html: "", klasse: "" };
        this.vis();
    };

    P.kanSendes = function () {
        var o = this.opgave;
        if (!o || o.loest || o.vist) return false;
        if (o.valg) return this.valgt >= 0;
        return this.sim.kanIndsende ? !!this.sim.kanIndsende(o) : true;
    };

    /* Indsend svar (og Start opgave, foer den foerste opgave) */
    P.indsendKlik = function () {
        var o = this.opgave;
        if (!o) { this.ny(); return; }
        if (o.loest || o.vist) return;
        if (!this.kanSendes()) { this.blink(); return; }
        if (o.valg) {
            var v = o.valg[this.valgt];
            if (v.rigtig) { this.klaret(v.forklaring); return; }
            o.forkert[this.valgt] = true;
            this.valgt = -1;
            this.fejl(v.forklaring);
            return;
        }
        var r = this.sim.tjekOpgave(o);
        if (r.ok) this.klaret(o.rigtigTekst);
        else this.fejl(r.tekst);
    };

    /* Forklaringen til et forkert svar i kortets nederste raekke */
    P.fejl = function (tekst) {
        this.fast = { html: '<span class="b-maerke">Ikke endnu</span>' + NK.html(tekst), klasse: "skidt", ny: true };
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
        var tekst;
        if (o.valg) {
            var r = o.valg.filter(function (v) { return v.rigtig; })[0];
            tekst = "Svaret er " + r.tekst + ". " + r.forklaring;
        } else {
            this.sim.visSvar(o);
            tekst = o.rigtigTekst;
        }
        this.slut = { tekst: tekst, maade: "svar" };
        this.vis();
    };

    /* Opgaven er loest: af et rigtigt svar eller af fanen selv */
    P.klaret = function (tekst) {
        var o = this.opgave;
        if (!o || o.loest) return;
        o.loest = true;
        if (!o.vist) this.antalLoest++;
        this.slut = { tekst: tekst || o.rigtigTekst || "", maade: "rigtig" };
        this.vis();
    };

    P.afslut = function () {
        this.opgave = null;
        this.slut = null;
        this.valgt = -1;
        this.hjaelp = 0;
        this.nr = 0;
        this.fast = { html: "", klasse: "" };
        this.sim.slutOpgave();
        this.vis();
    };

    P.aktiv = function () {
        return !!this.opgave;
    };

    /* Kortet blinker blødt: eleven greb ud efter noget, opgaven har spaerret */
    P.blink = function () {
        var e = this.el.skort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* ----- Kortet ------------------------------------------------------------ */
    P.chip = function () {
        var n = this.liste.length;
        return this.nr <= n ? "Opgave " + this.nr + " af " + n : "Ekstra opgave";
    };

    P.svarHTML = function (bliv) {
        var o = this.opgave, mig = this;
        if (!o.valg) return "";
        var lang = o.valg.some(function (v) { return v.tekst.length > 24; });
        var h = '<div class="sk-svar n' + o.valg.length + (lang ? " lang" : "") + '">';
        o.valg.forEach(function (v, j) {
            var kl = "sk-knap", laast = bliv || !!o.forkert[j];
            if (bliv) kl += v.rigtig ? (mig.slut.maade === "svar" ? " svar-vist" : " rigtig") : (o.forkert[j] ? " forkert" : " dim");
            else if (o.forkert[j]) kl += " forkert";
            else if (mig.valgt === j) kl += " valgt";
            h += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span><span>" + NK.html(v.tekst) + "</span></button>";
        });
        return h + "</div>";
    };

    P.vis = function () {
        var o = this.opgave, e = this.el, html;
        var bliv = !!(o && this.slut);
        var kl = "scenekort " + (!o ? "opgave start" : (bliv ? "loest bliv" + (this.slut.maade === "svar" ? " svar" : "") : (o.valg ? "spm" : "opgave")));
        if (e.skort.className.replace(" blink", "") !== kl) e.skort.className = kl;

        if (!o) {
            html = '<p class="sk-tekst"><span class="sk-chip">Opgaver</span>' + NK.html(e.skort.getAttribute("data-start") || "") + "</p>";
        } else {
            html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(this.chip()) + "</span>" + NK.Papir.tekst(NK.html(o.tekst)) + "</p>" +
                this.svarHTML(bliv);
            if (bliv) {
                var svar = this.slut.maade === "svar";
                html += NK.Papir.bliv(NK.html(this.slut.tekst), svar ? "Svaret" : "Rigtigt", "Næste opgave", svar);
            }
        }
        NK.saetHTML(this.p + "-ind", html);

        /* Kortets nederste raekke: beskeden, Giv et hint og Indsend svar */
        e.status.hidden = bliv;
        var f = this.fast;
        e.besked.innerHTML = o ? f.html : "";
        e.besked.hidden = !(o && f.html);
        e.status.className = "sk-bund" + (o && f.klasse ? " " + f.klasse : "") + (o && f.html ? "" : " tom") + (f.ny ? " ryster" : "");
        f.ny = false;
        e.hjaelp.hidden = !o || bliv;
        e.hjaelp.textContent = this.hjaelp === 0 ? "Giv et hint" : "Vis svaret";
        e.hjaelp.className = "knap hjaelp" + (this.hjaelp === 0 ? "" : " svar") + (f.klasse === "skidt" ? " peg" : "");
        var kan = !o || this.kanSendes();
        e.indsend.textContent = o ? "Indsend svar" : "Start opgave";
        e.indsend.classList.toggle("klar", kan);
        e.indsend.classList.toggle("ikke-klar", !kan);
        e.indsend.setAttribute("aria-disabled", kan ? "false" : "true");

        /* Panelet: taelleren og Afslut */
        NK.saetTekst(this.p + "-loest", String(this.antalLoest));
        NK.el(this.p + "-afslut").hidden = !o;
    };

    NK.Opgavekort = Opgavekort;
}());
