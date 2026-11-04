/* =====================================================================
   opgave.js - opgaverne paa papirkortet oeverst midt i scenen

   Brugerens valg 4. nov. 2026: alle aktive animationer har papirkortet
   (se "Faelles krav" i ../README.md). Opgaven, svarene, hint, beskeden
   ved et forkert svar, forklaringen og knapperne staar paa ét lyst kort
   oeverst i midten af scenen. Panelet har kun opgavetaelleren og Start
   forfra. Der er ingen tekstlinje nederst i scenen.

   Kortet har fire tilstande:
     intro     foer foerste opgave: hvad fanens opgaver handler om og
               knappen Start opgave. Scenen kan bruges frit imens.
     opgave    spoergsmaalet med svarene. Et svar vaelger kun; Indsend
               svar sender ind (graa, til der er noget at sende). En
               opgave i scenen (uret, temperaturen, et vandmolekyle)
               sendes ogsaa ind med Indsend svar. Giv et hint > Vis
               svaret er en stille knap med gul kant, der lyser stille op
               efter et forkert svar.
     bliv      rigtigt (eller svaret vist): kortet bliver paa opgaven.
               Det valgte svar er groent, forklaringen staar under, og
               Naeste opgave staar, hvor Indsend svar stod.
     resultat  alle opgaver er gennemfoert. Ingen knap til at begynde
               forfra paa kortet (brugeren 3. nov. 2026); Start forfra
               ligger i panelet.

   En runde er hver opgavetype én gang i tilfaeldig raekkefoelge.

   En opgave er et objekt, som fanen selv bygger:
     tekst            spoergsmaalet
     valg, rigtig     svarmuligheder og nummeret paa det rigtige (valgfrit)
     hint, svar       hintet og forklaringen
     start(sim)       stiller scenen op
     tjek(sim)        en opgave i scenen: false = intet at sende ind endnu,
                      true = rigtigt, en tekst = forklaringen til et
                      forkert svar. Kaldes, naar eleven trykker Indsend.
     indsendTekst(sim) det, der sendes ind (fx "Indsend svar: 47 °C")
     peg(sim, x, y)   et klik i billedet vaelger noget (true = ramt)
     visSvar(sim)     viser svaret i selve billedet
     slut(sim)        rydder op, naar opgaven er afsluttet
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TALORD = ["nul", "én", "to", "tre", "fire", "fem", "seks"];

    function html(s) {
        return String(s === undefined || s === null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function papirTekst(h) { return NK.Papir ? NK.Papir.tekst(h) : h; }

    /* Den hoejde, kortet har faaet sat af oeverst i scenen. Det, eleven
       arbejder med, begynder under NK.kortTop(). Selvtesten maaler kortet
       med det laengste svar, hint og forklaring i en hoej og en lav skaerm. */
    NK.kortZone = function () {
        return window.innerHeight <= 720 ? 178 : 206;
    };
    NK.kortTop = function () { return 10 + NK.kortZone() + 10; };

    NK.Opgaver = function (prefix, typer, sim, fanenavn, emne) {
        this.p = prefix;
        this.typer = typer;
        this.sim = sim;
        this.fanenavn = fanenavn || "";
        this.emne = emne || "";
        this.opgave = null;
        this.koe = [];
        this.gennemfoert = 0;
        this.loeste = 0;
        this.faerdig = false;
        this.tilstand = "intro";
        this.valgt = -1;
        this.hjaelp = 0;
        this.peger = false;
        NK.Opgaver.alle.push(this);

        var mig = this;
        this.el = {
            kort: NK.el(prefix + "-skort"), ind: NK.el(this.id("ind")), bund: NK.el(this.id("status")),
            besked: NK.el(this.id("besked")), knap: NK.el(this.id("knap")), indsend: NK.el(this.id("indsend")),
            forfra: NK.el(this.id("forfra"))
        };
        this.el.knap.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        this.el.forfra.addEventListener("click", function () { mig.forfra(); });
        this.el.ind.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || b.disabled) return;
            if (b.hasAttribute("data-videre")) { mig.videre(); return; }
            if (b.hasAttribute("data-nr")) mig.vaelg(parseInt(b.getAttribute("data-nr"), 10));
        });
        this.visStatus();
        this.visKort();
    };

    NK.Opgaver.alle = [];

    var P = NK.Opgaver.prototype;

    P.id = function (navn) { return this.p + "-opg-" + navn; };

    P.visStatus = function () {
        NK.saetTekst(this.id("nr"), String(this.gennemfoert));
        NK.saetTekst(this.id("antal"), String(this.typer.length));
        this.el.forfra.hidden = this.tilstand === "intro" && this.gennemfoert === 0;
    };

    /* Er der en opgave i gang, som endnu ikke er loest eller afsloeret? */
    P.igang = function () {
        return !!(this.opgave && !this.opgave.afsluttet);
    };

    /* ----- Kortet ------------------------------------------------------------ */
    P.visKort = function () {
        var t = this.tilstand, o = this.opgave, h = "";
        var kl = "scenekort " + (t === "opgave" ? (o && o.valg ? "spm" : "opgave") :
            (t === "bliv" ? "loest bliv" + (o && o.vist ? " svar" : "") : (t === "resultat" ? "loest" : "opgave")));
        if (this.el.kort.className.replace(" blink", "") !== kl) this.el.kort.className = kl;

        if (t === "intro") {
            h = '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Opgaver</span>' +
                html("Fanen har " + (TALORD[this.typer.length] || this.typer.length) + " opgaver " + this.emne +
                     ". Du kan også prøve dig frem først.") + "</p>" +
                '<button type="button" class="sk-videre" data-videre="1">Start opgave</button></div>';
        } else if (t === "resultat") {
            var n = this.typer.length;
            var mangler = this.andenFane();
            h = '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Fanen er gennemført</span>' +
                html("Du løste " + this.loeste + " af " + n + " opgaver uden at se svaret." +
                     (mangler ? " Fanen " + mangler.fanenavn + " har også opgaver." : "")) + "</p>" +
                (mangler ? '<button type="button" class="sk-videre" data-videre="1">' + html("Videre til " + mangler.fanenavn + " →") + "</button>" : "") +
                "</div>";
        } else if (o) {
            h = '<p class="sk-tekst"><span class="sk-chip">' + html(this.chip()) + "</span>" + papirTekst(html(o.tekst)) + "</p>";
            if (o.valg) h += this.svarHTML();
            if (t === "bliv") {
                var svaret = o.svaretTekst ? '<b class="sk-svaret">' + html(o.svaretTekst) + "</b> " : "";
                var knap = this.koe.length ? "Næste opgave" : "Se resultatet";
                h += NK.Papir.bliv(svaret + html(o.svar), o.vist ? "Svaret" : "Rigtigt", knap, !!o.vist);
            }
        }
        this.el.ind.innerHTML = h;
        this.visBund();
    };

    P.chip = function () {
        return "Opgave " + (this.gennemfoert + (this.tilstand === "bliv" ? 0 : 1)) + " af " + this.typer.length;
    };

    P.svarHTML = function () {
        var o = this.opgave, mig = this, bliv = this.tilstand === "bliv";
        /* Korte svar (tal) staar fire paa en raekke, ligninger to og to */
        var kort = o.valg.every(function (t) { return t.length <= 12; });
        var kl = "sk-svar n" + o.valg.length + (kort ? " kort" : "");
        var h = '<div class="' + kl + '">';
        o.valg.forEach(function (tekst, i) {
            var k = "sk-knap", laast = bliv;
            if (bliv) {
                if (i === o.rigtig) k += o.vist ? " svar-vist" : " rigtig";
                else if (o.forkert && o.forkert[i]) k += " forkert";
                else k += " dim";
            } else {
                if (o.forkert && o.forkert[i]) { k += " forkert"; laast = true; }
                else if (i === mig.valgt) k += " valgt";
            }
            h += '<button type="button" class="' + k + '" data-nr="' + i + '"' + (laast ? " disabled" : "") +
                '><span class="v-bogstav">' + "ABCD".charAt(i) + "</span><span>" + html(tekst) + "</span></button>";
        });
        return h + "</div>";
    };

    /* Kortets nederste raekke: beskeden, hintknappen og Indsend svar. Den
       er der kun, mens en opgave er i gang. */
    P.visBund = function () {
        var aktiv = this.tilstand === "opgave";
        this.el.bund.hidden = !aktiv;
        if (!aktiv) return;
        var b = this.besked || { html: "", klasse: "" };
        if (this.el.besked.innerHTML !== b.html) this.el.besked.innerHTML = b.html;
        var ryster = this.el.bund.classList.contains("ryster");
        this.el.bund.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom") + (ryster ? " ryster" : "");
        var k = this.el.knap;
        k.textContent = this.hjaelp === 0 ? "Giv et hint" : "Vis svaret";
        k.className = "knap hjaelp" + (this.hjaelp > 0 ? " svar" : "") + (this.peger ? " peg" : "");
        this.visIndsend();
    };

    P.kanSendes = function () {
        var o = this.opgave;
        if (this.tilstand !== "opgave" || !o) return false;
        if (o.valg) return this.valgt >= 0;
        return o.tjek ? o.tjek(this.sim) !== false : false;
    };

    P.visIndsend = function () {
        var e = this.el.indsend, o = this.opgave;
        if (this.tilstand !== "opgave" || !o) return;
        var kan = this.kanSendes();
        var t = (!o.valg && o.indsendTekst && o.indsendTekst(this.sim)) || "Indsend svar";
        if (e.textContent !== t) e.textContent = t;
        e.classList.toggle("klar", kan);
        e.classList.toggle("ikke-klar", !kan);
        e.setAttribute("aria-disabled", kan ? "false" : "true");
    };

    P.saetBesked = function (h, klasse) {
        this.besked = { html: h || "", klasse: klasse || "" };
        this.visBund();
    };

    P.ryst = function () {
        var e = this.el.bund;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    P.blink = function () {
        var e = this.el.kort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    P.andenFane = function () {
        var mig = this;
        return NK.Opgaver.alle.filter(function (a) { return a !== mig && !a.faerdig; })[0] || null;
    };

    /* ----- Knapperne ------------------------------------------------------------ */
    /* Den groenne knap paa kortet gaar altid fremad (brugeren 3. nov. 2026) */
    P.videre = function () {
        if (this.tilstand === "intro") { this.ny(); return; }
        if (this.tilstand === "bliv") {
            if (this.koe.length) this.ny(); else this.visResultat();
            return;
        }
        if (this.tilstand === "resultat") {
            var a = this.andenFane();
            if (a && NK.visFane) NK.visFane("fane-" + (a.p === "maet" ? "maetning" : "oploes"));
        }
    };

    /* Start forfra i panelet: en ny runde med alle opgaverne */
    P.forfra = function () {
        this.kaldSlut(this.opgave);
        this.opgave = null;
        this.nyRunde();
        this.ny();
    };

    P.nyRunde = function () {
        this.koe = [];
        this.gennemfoert = 0;
        this.loeste = 0;
        this.faerdig = false;
        this.visStatus();
    };

    P.ny = function () {
        this.kaldSlut(this.opgave);
        if (!this.koe.length) {
            if (this.gennemfoert >= this.typer.length) this.nyRunde();
            this.koe = NK.bland(this.typer.map(function (_, i) { return i; }));
        }
        var nr = this.koe.shift();

        var o = this.typer[nr](this.sim);
        o.afsluttet = false;
        o.forkert = {};
        this.opgave = o;
        this.tilstand = "opgave";
        this.valgt = -1;
        this.hjaelp = 0;
        this.peger = false;
        this.besked = { html: "", klasse: "" };
        if (o.start) o.start(this.sim);
        this.visStatus();
        this.visKort();
    };

    P.kaldSlut = function (o) {
        if (!o || o.sluttet) return;
        o.sluttet = true;
        if (o.slut) o.slut(this.sim);
    };

    /* Et svar paa kortet vaelger kun */
    P.vaelg = function (i) {
        var o = this.opgave;
        if (this.tilstand !== "opgave" || !o || !o.valg || o.forkert[i]) return;
        this.valgt = i;
        if (this.besked && this.besked.klasse === "skidt") this.besked = { html: "", klasse: "" };
        this.visKort();
    };

    /* Indsend svar */
    P.indsendKlik = function () {
        var o = this.opgave;
        if (this.tilstand !== "opgave" || !o) return;
        if (!this.kanSendes()) { this.blink(); return; }
        if (o.valg) {
            if (this.valgt === o.rigtig) { this.loest(); return; }
            o.forkert[this.valgt] = true;
            this.valgt = -1;
            this.fejl(o.forkertTekst || "Det svar passer ikke. Prøv et andet, eller tryk på Giv et hint.");
            this.visKort();
            return;
        }
        var r = o.tjek(this.sim);
        if (r === true) { this.loest(); return; }
        if (typeof r === "string") this.fejl(r);
    };

    P.fejl = function (tekst) {
        this.peger = true;
        this.saetBesked('<span class="b-maerke">Ikke rigtigt</span> ' + html(tekst), "skidt");
        this.ryst();
    };

    /* Giv et hint > Vis svaret */
    P.hjaelpKlik = function () {
        var o = this.opgave;
        if (this.tilstand !== "opgave" || !o) return;
        this.peger = false;
        if (this.hjaelp === 0 && o.hint) {
            this.hjaelp = 1;
            this.saetBesked('<span class="b-maerke">Hint</span> ' + html(o.hint), "hint");
            return;
        }
        this.visSvar();
    };

    P.visSvar = function () {
        var o = this.opgave;
        if (!o || o.afsluttet) return;
        if (o.visSvar) o.visSvar(this.sim);
        o.vist = true;
        this.afslut(o);
    };

    P.loest = function () {
        var o = this.opgave;
        if (!o || o.afsluttet) return;
        this.loeste++;
        /* Ved et valgspoergsmaal vises svaret ogsaa i billedet bagefter,
           saa eleven kan se, at det passer. */
        if (o.valg && o.visSvar) o.visSvar(this.sim);
        this.afslut(o);
    };

    P.afslut = function (o) {
        o.afsluttet = true;
        this.kaldSlut(o);
        this.gennemfoert++;
        this.tilstand = "bliv";
        this.peger = false;
        this.besked = { html: "", klasse: "" };
        this.visStatus();
        this.visKort();
    };

    /* Runden er slut: resultatet paa kortet og en kort ros fra laereren. */
    P.visResultat = function () {
        this.faerdig = true;
        this.opgave = null;
        this.tilstand = "resultat";
        this.visStatus();
        this.visKort();
        if (this.sim.laererRos) this.sim.laererRos();
    };

    /* Kaldes af fanen hvert billede: Indsend svar foelger med scenen
       (fx "Indsend svar: 47 °C"). */
    P.opdater = function () {
        if (this.tilstand === "opgave") this.visIndsend();
    };

    /* Et klik i billedet. Returnerer true, hvis opgaven tog imod det. */
    P.klik = function (x, y) {
        var o = this.opgave;
        if (this.tilstand !== "opgave" || !o || !o.peg) return false;
        if (!o.peg(this.sim, x, y)) return false;
        if (this.besked && this.besked.klasse === "skidt") this.saetBesked("", "");
        this.visIndsend();
        return true;
    };

    /* Enter: Indsend svar, eller Naeste, naar kortet er groent */
    P.enter = function () {
        if (this.tilstand === "opgave") this.indsendKlik();
        else if (this.tilstand === "bliv") this.videre();
    };
}());
