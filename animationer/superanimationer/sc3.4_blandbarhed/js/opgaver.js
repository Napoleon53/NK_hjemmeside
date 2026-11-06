/* =====================================================================
   opgaver.js - opgaverne paa papirkortet oeverst midt i scenen

   Papirkortet (6. nov. 2026, se "Faelles krav" i ../README.md):
   opgaven, svarene, hint, forklaringen og knapperne staar paa ét lyst
   kort oeverst midt i scenen, ikke i panelet og ikke i en linje nederst.
   Udseendet kommer fra ../faelles/papirkort.css og NK.Papir i
   ../faelles/papirkort.js. Panelet har kun tallet for loeste opgaver og
   Start forfra.

   Kortet har fire tilstande:
     start   en kort indledning og knappen Start opgave 1
     opgave  "Opgave 2 af 6": spoergsmaalet og svarknapperne. Et svar
             VAELGES kun; Indsend svar sender det ind og er graa, til der
             er noget at sende. Giv et hint er en stille knap med gul kant
             (Giv et hint > Vis svaret).
     loest   kortet bliver paa opgaven: det rigtige svar er groent (gult,
             naar svaret blev vist), forklaringen staar under, og Naeste
             opgave staar, hvor Indsend svar stod.
     slut    alle seks er gennemfoert; kortet peger paa quizzen.

   Opgaverne staar i D.OPGAVER (js/tekster.js) og koeres i raekkefoelge,
   fordi de bygger paa hinanden. En opgave med valg er en forudsigelse:
   bassinet er laast, til eleven har sendt et svar ind, og et klik i
   panelet eller bassinet faar kortet til at blinke. Ved det foerste
   Indsend svar sker det i bassinet, rigtigt eller ej. Et forkert svar
   giver den forklaring, der passer til netop den fejl, og eleven kan
   vaelge igen. En byg-opgave loeses ved at goere noget i bassinet og
   trykke Indsend svar. Opgaven taeller som loest, naar det foerste svar
   var rigtigt og uden hint.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Tjek til byg-opgaverne: sand, naar bassinet viser det, der skal til */
    var TJEK = {
        olieNederst: function (a, m) {
            var fo = m.fase[D.nr("olie")], fv = m.fase[D.nr("vand")], iv = D.nr("vand");
            if (a.uklart) return false;
            var olie = null, polaer = null;
            a.lag.forEach(function (l) {
                if (l.fase === fo && (!olie || l.n > olie.n)) olie = l;
                if (l.fase === fv && l.stoffer.indexOf(iv) >= 0 && (!polaer || l.n > polaer.n)) polaer = l;
            });
            if (!olie || !polaer || olie.n < 60) return false;
            return olie.fra === 0 && olie.fra + olie.til < polaer.fra + polaer.til;
        }
    };

    var INTRO = "Seks opgaver om det, der sker i bassinet. Opgaverne bygger på hinanden, så tag dem i rækkefølge.";
    var SLUT = "Alle seks opgaver er gennemført. Knappen Quiz øverst til højre giver fem spørgsmål om blandbarhed.";

    function html(s) {
        return String(s === undefined || s === null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    function papirTekst(s) { return NK.Papir ? NK.Papir.tekst(html(s)) : html(s); }

    /* Den hoejde, kortet har faaet sat af oeverst i scenen. Bassinet
       tegnes under NK.kortTop(). Selvtesten maaler kortet med det
       laengste spoergsmaal, den laengste fejl og den laengste forklaring. */
    NK.kortZone = function () { return window.innerHeight <= 720 ? 192 : 200; };
    NK.kortTop = function () { return 10 + NK.kortZone() + 10; };

    function Opgaver(bassin, temp) {
        this.b = bassin;
        this.temp = temp;              /* saetter temperaturen, ogsaa paa skyderen */
        this.nr = -1;
        this.loest = 0;
        this.o = null;
        this.fastB = { tekst: "", klasse: "", maerke: "" };
        var mig = this;
        this.e = {
            kort: NK.el("skort"), ind: NK.el("opg-ind"), status: NK.el("opg-status"),
            besked: NK.el("opg-besked"), hjaelp: NK.el("opg-hjknap"), indsend: NK.el("opg-indsend")
        };
        this.e.hjaelp.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.e.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        this.e.ind.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("button") : null;
            if (!k || k.disabled) return;
            if (k.hasAttribute("data-videre")) { mig.videre(); return; }
            if (k.hasAttribute("data-nr")) mig.vaelg(parseInt(k.getAttribute("data-nr"), 10));
        });
        NK.el("opg-forfra").addEventListener("click", function () { mig.forfra(); });
        this.vis();
    }

    var P = Opgaver.prototype;

    /* ----- Tilstanden ------------------------------------------------------ */
    P.tilstand = function () {
        if (this.nr >= D.OPGAVER.length) return "slut";
        if (!this.o) return "start";
        return this.o.afsluttet ? "loest" : "opgave";
    };

    /* Laasen: under en forudsigelse, til eleven har sendt et svar ind.
       Panelet og bassinet begynder med  if (opgaver.spaer()) return;
       Kortet blinker i stedet. */
    P.spaer = function () {
        var o = this.o;
        var laast = !!(o && !o.afsluttet && o.d.valg && !o.udfoert);
        if (laast) this.blink();
        return laast;
    };

    P.blink = function () {
        var e = this.e.kort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Eleven har gjort noget i bassinet (byg-opgaven kan sendes ind) */
    P.handlet = function () { if (this.o && !this.o.afsluttet) { this.o.handlet = true; this.vis(); } };

    /* ----- Forloebet --------------------------------------------------------- */
    P.start = function () {
        this.nr = 0;
        this.startOpgave();
    };

    P.startOpgave = function () {
        var d = D.OPGAVER[this.nr];
        this.o = { d: d, afsluttet: false, hjulpet: false, forkert: {}, valgt: null, udfoert: false, handlet: false, foersteSvar: true, maade: null };
        this.saetFast("", "");
        this.peg = false;
        this.rystSenere = 0;
        this.temp(20);
        this.b.saetKoeler("tilbagesvaler");
        this.b.nulstil(d.start.fyld, d.start.blandet);
        this.vis();
    };

    P.videre = function () {
        if (!this.o || !this.o.afsluttet) return;
        this.nr++;
        if (this.nr >= D.OPGAVER.length) {
            this.o = null;
            this.saetFast("", "");
            this.vis();
            if (this.vedSlut) this.vedSlut(this.loest);
            return;
        }
        this.startOpgave();
    };

    /* Start forfra (panelets knap): tilbage til indledningen */
    P.forfra = function () {
        this.nr = -1;
        this.loest = 0;
        this.o = null;
        this.rystSenere = 0;
        this.saetFast("", "");
        this.vis();
    };

    /* ----- Svarene ------------------------------------------------------------ */
    P.vaelg = function (i) {
        var o = this.o;
        if (!o || o.afsluttet || !o.d.valg || o.forkert[i]) return;
        o.valgt = i;
        if (this.fastB.klasse === "skidt") this.saetFast("", "");
        this.vis();
    };

    P.kanSendes = function () {
        var o = this.o;
        if (!o || o.afsluttet) return false;
        if (o.d.valg) return o.valgt !== null;
        return o.handlet;
    };

    /* Handlingen i bassinet, naar eleven har sendt et svar ind (eller svaret vises) */
    P.udfoer = function (h) {
        if (!h) return;
        var b = this.b;
        if (h.haeld) [].concat(h.haeld).forEach(function (s) { b.haeld(s); });
        if (h.T !== undefined) this.temp(h.T);
        if (h.ryst) {
            if (h.haeld) this.rystSenere = 0.9 * [].concat(h.haeld).length + 0.5;
            else b.ryst(h.ryst);
        }
    };

    P.indsendKlik = function () {
        var t = this.tilstand();
        if (t === "start") { this.start(); return; }
        if (t === "loest") { this.videre(); return; }
        if (t !== "opgave") return;
        var o = this.o;
        if (!this.kanSendes()) { this.blink(); return; }
        if (o.d.valg) {
            if (!o.udfoert) { o.udfoert = true; this.udfoer(o.d.handling); }
            var v = o.d.valg[o.valgt];
            if (v.rigtig) { this.loestNu(); return; }
            o.forkert[o.valgt] = true;
            o.valgt = null;
            o.foersteSvar = false;
            this.fejl(v.fejl);
            return;
        }
        /* Byg-opgaven: bassinet skal vise det, der skal til, og vaere faldet til ro */
        if (this.b.m.haelder()) { this.fejl("Der bliver stadig hældt i. Vent, til det er faldet til ro."); return; }
        var a = this.b.analyse();
        if (TJEK[o.d.byg](a, this.b.m)) { this.loestNu(); return; }
        o.foersteSvar = false;
        this.fejl(a.uklart ? "Bassinet er stadig uklart. Vent, til lagene har skilt sig." : "Olien ligger ikke nederst endnu. Se på glasset, og prøv igen.");
    };

    P.fejl = function (tekst) {
        this.saetFast(tekst, "skidt", "Ikke rigtigt");
        this.peg = true;
        this.vis();
        var st = this.e.status;
        st.classList.remove("ryster");
        void st.offsetWidth;
        st.classList.add("ryster");
    };

    P.loestNu = function () {
        var o = this.o;
        o.afsluttet = true;
        o.maade = "selv";
        if (o.foersteSvar && !o.hjulpet) this.loest++;
        this.saetFast("", "");
        this.vis();
    };

    /* Giv et hint > Vis svaret */
    P.hjaelpKlik = function () {
        var o = this.o;
        if (!o || o.afsluttet) return;
        this.peg = false;
        o.hjulpet = true;
        if (!o.hintVist) {
            o.hintVist = true;
            this.saetFast(o.d.hint, "hint", "Hint");
            this.vis();
            return;
        }
        this.visSvar();
    };

    P.visSvar = function () {
        var o = this.o;
        if (!o || o.afsluttet) return;
        o.afsluttet = true;
        o.maade = "svar";
        if (o.d.valg) {
            if (!o.udfoert) { o.udfoert = true; this.udfoer(o.d.handling); }
        } else {
            this.udfoer(o.d.visSvar);
        }
        this.saetFast("", "");
        this.vis();
    };

    /* ----- Kortet ------------------------------------------------------------- */
    P.saetFast = function (tekst, klasse, maerke) {
        this.fastB = { tekst: tekst || "", klasse: klasse || "", maerke: maerke || "" };
    };

    P.chip = function () {
        return this.o ? "Opgave " + (this.nr + 1) + " af " + D.OPGAVER.length : "Opgaver";
    };

    P.svarHTML = function (o, loest) {
        if (!o.d.valg) return "";
        var vist = o.maade === "svar";
        var lang = o.d.valg.some(function (v) { return v.tekst.length > 34; });
        var h = '<div class="sk-svar n' + o.d.valg.length + (lang ? " lang" : "") + '">';
        o.d.valg.forEach(function (v, i) {
            var k = "sk-knap", laast = false;
            if (loest) {
                laast = true;
                k += v.rigtig ? (vist ? " svar-vist" : " rigtig") : (o.forkert[i] ? " forkert" : " dim");
            } else {
                if (o.valgt === i) k += " valgt";
                if (o.forkert[i]) { k += " forkert"; laast = true; }
            }
            h += '<button type="button" class="' + k + '" data-nr="' + i + '"' + (laast ? " disabled" : "") + "><span>" + html(v.tekst) + "</span></button>";
        });
        return h + "</div>";
    };

    P.vis = function () {
        var o = this.o, t = this.tilstand();
        var kl = "scenekort " + (t === "loest" ? "loest" + (o.maade === "svar" ? " svar" : "") : t === "opgave" && o.d.valg ? "spm" : "opgave");
        if (this.e.kort.className.replace(" blink", "") !== kl) this.e.kort.className = kl;

        var tekst = t === "start" ? INTRO : t === "slut" ? SLUT : o.d.tekst;
        var h = '<p class="sk-tekst"><span class="sk-chip">' + html(this.chip()) + "</span>" + papirTekst(tekst) + "</p>";
        if (o) h += this.svarHTML(o, t === "loest");
        if (t === "loest") {
            var vist = o.maade === "svar";
            var knap = this.nr < D.OPGAVER.length - 1 ? "Næste opgave →" : "Afslut opgaverne →";
            h += NK.Papir.bliv(html(o.d.svar), vist ? "Svaret" : "Rigtigt", html(knap), vist);
        }
        if (h !== this._sidstInd) { this.e.ind.innerHTML = h; this._sidstInd = h; }

        /* Den nederste raekke: beskeden, hintknappen og Indsend svar */
        var b = this.fastB, harTekst = !!b.tekst;
        this.e.besked.innerHTML = harTekst ? (b.maerke ? '<span class="b-maerke">' + html(b.maerke) + "</span> " : "") + html(b.tekst) : "";
        this.e.besked.hidden = !harTekst;
        var ryster = this.e.status.classList.contains("ryster");
        this.e.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom") + (ryster ? " ryster" : "");
        this.e.status.hidden = t === "loest" || t === "slut";

        var hj = this.e.hjaelp;
        hj.hidden = t !== "opgave";
        if (t === "opgave") {
            var svar = !!o.hintVist;
            hj.textContent = svar ? "Vis svaret" : "Giv et hint";
            hj.className = "knap hjaelp" + (svar ? " svar" : "") + (this.peg ? " peg" : "");
        }

        var ind = this.e.indsend;
        ind.hidden = t === "loest" || t === "slut";
        if (t === "start") {
            ind.textContent = "Start opgave 1";
            ind.className = "knap indsend klar";
            ind.setAttribute("aria-disabled", "false");
        } else if (t === "opgave") {
            var kan = this.kanSendes();
            ind.textContent = "Indsend svar";
            ind.className = "knap indsend " + (kan ? "klar" : "ikke-klar");
            ind.setAttribute("aria-disabled", kan ? "false" : "true");
        }

        NK.saetTekst("opg-loest", String(this.loest));
        NK.saetTekst("opg-nr", t === "start" ? "ikke startet" : t === "slut" ? "alle gennemført" : (this.nr + 1) + " af " + D.OPGAVER.length);
    };

    /* Kaldes hvert billede: en rystning efter en haeldning venter, til der er haeldt */
    P.opdater = function (dt) {
        if (this.rystSenere > 0) {
            this.rystSenere -= dt;
            if (this.rystSenere <= 0 && !this.b.m.haelder()) this.b.ryst(1.2);
            else if (this.rystSenere <= 0) this.rystSenere = 0.2;
        }
    };

    /* Enter: Start opgave, Indsend svar eller Naeste */
    P.enter = function () { this.indsendKlik(); };

    Opgaver.TJEK = TJEK;
    NK.Opgaver = Opgaver;
}());
