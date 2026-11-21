/* =====================================================================
   maet_opgaver.js - opgaverne paa fane 2 (Mættet opløsning)

   Runde T6 (21. nov. 2026, Niels' ja til forslagene efter REGELSAET):
     * Fire opgaver i fast raekkefoelge i raekken oeverst i scenen med
       titler, der laases op i takt (REGELSAET 3, 17, 18). Panelet er vaek.
     * Hver opgave er en raekke trin, ét ad gangen (REGELSAET 11-16).
       Trinene staar i NK.SimMaetning.OPGAVER (js/sim_maetning.js).
     * Et valg-trin: spoergsmaalet med tre svar i kortet. Et svar vaelger
       kun; Indsend svar sender. Et forkert svar faar sin egen forklaring.
       Scenen er laast imens, og intet kan klikkes (REGELSAET 15, 19a).
     * Et handlings-trin: kortet beder om noget i scenen. Kun det, der
       skal bruges, er fremme, og det foerste har gul ramme og boble. Kortet
       gaar selv videre ca. 1 s efter, at scenen staar paa maalet
       (REGELSAET 33, 39). Indsend svar er reserve.
     * Hinttrappe: Giv et hint › Næste hint (2 af 3) › Næste hint (3 af 3)
       › Vis svaret (REGELSAET 15).
     * Efter et rigtigt svar bliver kortet paa spoergsmaalet med den groenne
       forklaring, og knappen, der gaar videre, staar, hvor Indsend svar
       stod. Den gaar altid fremad.
     * Loeste opgaver gemmes i browseren. En loest opgave har alt fremme
       fra start (REGELSAET 16); Start forfra giver trinene igen.
     * Naar alle fire er loest: den fri leg med hylden med de seks salte,
       og Kemichael roser én gang pr. besoeg.

   Objektet staar ogsaa i NK.Opgaver.alle, saa fane 1 kan henvise hertil
   ("Videre til Mættet opløsning").
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var GEM = "nk-sc2.1-maettet";
    var VENT = 0.9;                 /* sekunder paa maalet, foer kortet gaar videre */

    function html(s) {
        return String(s === undefined || s === null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function saetTekstEl(e, t) { if (e && e.textContent !== t) e.textContent = t; }

    function laes() {
        try {
            var v = JSON.parse(window.localStorage.getItem(GEM) || "{}");
            return v && typeof v === "object" ? v : {};
        } catch (e) { return {}; }
    }

    NK.MaetOpgaver = function (sim, opgaver) {
        this.p = "maet";
        this.fanenavn = "Mættet opløsning";
        this.sim = sim;
        this.opg = opgaver;
        this.status = laes();
        this.nr = -1;
        this.trinNr = 0;
        this.tilstand = "trin";
        this.rost = false;
        if (NK.Opgaver && NK.Opgaver.alle) NK.Opgaver.alle.push(this);

        var mig = this;
        this.el = {
            kort: NK.el("maet-skort"), ind: NK.el("maet-opg-ind"), bund: NK.el("maet-opg-status"),
            besked: NK.el("maet-opg-besked"), knap: NK.el("maet-opg-knap"), indsend: NK.el("maet-opg-indsend"),
            liste: NK.el("maet-liste"), raekke: NK.el("maet-raekke"), forfra: NK.el("maet-forfra")
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

        this.bygRaekke();
        this.faerdig = this.alleLoest();
        if (this.faerdig) this.visResultat(true);
        else this.aabn(this.foersteUloeste());
    };

    var P = NK.MaetOpgaver.prototype;

    /* ----- Status og gemte fremskridt ------------------------------------------- */
    P.gem = function () {
        try { window.localStorage.setItem(GEM, JSON.stringify(this.status)); } catch (e) { /* privat vindue */ }
    };

    P.alleLoest = function () {
        var mig = this;
        return this.opg.every(function (o) { return !!mig.status[o.id]; });
    };

    P.foersteUloeste = function () {
        for (var i = 0; i < this.opg.length; i++) if (!this.status[this.opg[i].id]) return i;
        return 0;
    };

    P.opgave = function () { return this.nr >= 0 ? this.opg[this.nr] : null; };

    P.trin = function () {
        var o = this.opgave();
        return o && this.tilstand !== "resultat" ? o.trin[this.trinNr] : null;
    };

    /* ----- Det, scenen spoerger om ------------------------------------------------ */
    /* Kurven staar som en stiplet ramme, til den bruges (REGELSAET 13) */
    P.visGraf = function () {
        if (this.tilstand === "resultat") return true;
        var o = this.opgave();
        if (!o || o.grafFra === undefined || this.fremme) return true;
        return this.trinNr >= o.grafFra;
    };

    /* Et tal paa etiketten, kortet spoerger om, staar som "?" (REGELSAET 38) */
    P.skjulTal = function (felt) {
        var t = this.trin();
        return this.tilstand === "trin" && !!t && !!t.skjul && t.skjul.indexOf(felt) >= 0;
    };

    P.spoerger = function () {
        var t = this.trin();
        return this.tilstand === "trin" && !!t && t.type === "valg";
    };

    /* Aflaesningen ved punktet paa kurven er skjult, mens kortet spoerger */
    P.visAflaesning = function () { return !this.spoerger(); };

    /* Maa knappen bruges nu? Kun det, kortet beder om (REGELSAET 19a). I den
       fri leg kan alt bruges. */
    P.tillad = function (knap) {
        if (this.tilstand === "resultat") return true;
        var t = this.trin();
        if (this.tilstand !== "trin" || !t || t.type !== "handling") return false;
        if (!t.knapper || t.knapper.indexOf(knap) < 0) return false;
        if (t.laas && t.laas(this.sim)) return false;
        return true;
    };

    P.maalNaaet = function () {
        var t = this.trin();
        return this.tilstand === "trin" && !!t && t.type === "handling" && t.maal(this.sim);
    };

    /* Den knap, der har gul ramme og boble, til eleven har brugt den */
    P.opfordring = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t || t.type !== "handling" || this.harKlikket) return null;
        if (t.laas && t.laas(this.sim)) return null;
        return t.knapper[0];
    };

    P.klikket = function (knap) {
        var t = this.trin();
        if (t && t.knapper && t.knapper.indexOf(knap) >= 0) this.harKlikket = true;
        if (this.besked && this.besked.klasse === "skidt") this.saetBesked("", "");
        this.sim.opdaterScene();
    };

    /* ----- Raekken oeverst ----------------------------------------------------------- */
    P.bygRaekke = function () {
        var mig = this;
        this.knapper = this.opg.map(function (o, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "or-knap";
            b.setAttribute("data-opg", o.id);
            b.innerHTML = '<span class="or-nr"></span><span class="or-navn"></span>';
            b.addEventListener("click", function () {
                if (b.classList.contains("laast")) return;
                mig.aabn(i);
            });
            mig.el.liste.appendChild(b);
            return b;
        });
    };

    P.visRaekke = function () {
        var mig = this, foerste = this.foersteUloeste(), alle = this.alleLoest();
        this.opg.forEach(function (o, i) {
            var b = mig.knapper[i], s = mig.status[o.id];
            var aaben = !!s || i === mig.nr || (!alle && i === foerste);
            b.classList.toggle("laast", !aaben);
            b.disabled = !aaben;
            b.classList.toggle("valgt", i === mig.nr && mig.tilstand !== "resultat");
            b.classList.toggle("loest", !!s);
            b.classList.toggle("stjerne", s === "stjerne");
            saetTekstEl(b.querySelector(".or-nr"), s === "stjerne" ? "★" : (s ? "✓" : String(i + 1)));
            saetTekstEl(b.querySelector(".or-navn"), aaben ? o.navn : "");
            b.title = aaben ? o.navn : "Låses op, når de forrige opgaver er løst";
        });
    };

    /* ----- Opgaver og trin ----------------------------------------------------------- */
    P.aabn = function (nr, forfra) {
        this.nr = NK.klamp(nr, 0, this.opg.length - 1);
        var o = this.opgave();
        this.tilstand = "trin";
        this.trinNr = 0;
        this.vist = false;
        /* En loest opgave har alt fremme fra start; Start forfra giver trinene igen */
        this.fremme = !forfra && !!this.status[o.id];
        this.sim.gentag = null;
        o.opsaet(this.sim);
        this.nytTrin();
    };

    P.nytTrin = function () {
        this.valgt = -1;
        this.forkert = {};
        this.hjaelp = 0;
        this.besked = { html: "", klasse: "" };
        this.maalUr = 0;
        this.harKlikket = false;
        var t = this.trin();
        if (t && t.opsaet) t.opsaet(this.sim);
        this.visRaekke();
        this.visKort();
    };

    /* Start forfra: den aabne opgave med trinene igen */
    P.forfra = function () {
        this.aabn(this.tilstand === "resultat" ? 0 : this.nr, true);
    };

    P.trinLoest = function () {
        var o = this.opgave(), t = this.trin();
        if (!t) return;
        if (t.efter) t.efter(this.sim);
        var sidste = this.trinNr >= o.trin.length - 1;
        /* Et handlings-trin, der ikke er det sidste, gaar direkte videre */
        if (!sidste && t.type === "handling") {
            this.trinNr++;
            this.nytTrin();
            return;
        }
        this.tilstand = "bliv";
        this.besked = { html: "", klasse: "" };
        if (sidste) this.opgaveLoest();
        this.visRaekke();
        this.visKort();
    };

    P.opgaveLoest = function () {
        var o = this.opgave();
        var foer = this.status[o.id];
        this.status[o.id] = (!this.vist || foer === "stjerne") ? "stjerne" : "loest";
        this.gem();
    };

    /* Kortets groenne knap gaar altid fremad */
    P.videre = function () {
        if (this.tilstand === "bliv") {
            var o = this.opgave();
            if (this.trinNr < o.trin.length - 1) {
                this.trinNr++;
                this.tilstand = "trin";
                this.nytTrin();
                return;
            }
            if (this.nr < this.opg.length - 1) { this.aabn(this.nr + 1); return; }
            this.visResultat();
            return;
        }
        if (this.tilstand === "resultat") {
            var a = this.andenFane();
            if (a && NK.visFane) NK.visFane("fane-oploes");
        }
    };

    P.andenFane = function () {
        var mig = this;
        if (!NK.Opgaver || !NK.Opgaver.alle) return null;
        return NK.Opgaver.alle.filter(function (a) { return a !== mig && !a.faerdig; })[0] || null;
    };

    /* Alle fire er loest: den fri leg med hylden, og en kort ros én gang */
    P.visResultat = function (stille) {
        this.faerdig = this.alleLoest();
        this.tilstand = "resultat";
        this.nr = -1;
        this.sim.gentag = null;
        this.visRaekke();
        this.visKort();
        if (!stille && !this.rost && this.sim.laererRos) {
            this.rost = true;
            this.sim.laererRos();
        }
    };

    /* ----- Svar, hint og Indsend svar ---------------------------------------------- */
    P.vaelg = function (i) {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t || t.type !== "valg" || this.forkert[i]) return;
        this.valgt = i;
        if (this.besked && this.besked.klasse === "skidt") this.besked = { html: "", klasse: "" };
        this.visKort();
    };

    P.rigtigNr = function (t) {
        for (var i = 0; i < t.svar.length; i++) if (t.svar[i].ok) return i;
        return -1;
    };

    P.kanSendes = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return false;
        if (t.type === "valg") return this.valgt >= 0;
        return true;
    };

    P.indsendKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        if (!this.kanSendes()) { this.blink(); return; }
        if (t.type === "valg") {
            if (this.valgt === this.rigtigNr(t)) { this.trinLoest(); return; }
            var nej = t.svar[this.valgt].nej || "Det svar passer ikke.";
            this.forkert[this.valgt] = true;
            this.valgt = -1;
            this.fejl(nej);
            this.visKort();
            return;
        }
        if (t.maal(this.sim)) { this.trinLoest(); return; }
        this.fejl(t.tjek ? t.tjek(this.sim) : "Ikke endnu.");
    };

    P.fejl = function (tekst) {
        this.peger = true;
        this.saetBesked('<span class="b-maerke">Ikke rigtigt</span>' + html(tekst), "skidt");
        this.ryst();
    };

    P.hjaelpKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        this.peger = false;
        var hint = t.hint || [];
        if (this.hjaelp < hint.length) {
            this.hjaelp++;
            this.saetBesked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + hint.length + "</span>" +
                html(hint[this.hjaelp - 1]), "hint");
            return;
        }
        this.visSvar();
    };

    P.visSvar = function () {
        var t = this.trin();
        if (!t) return;
        this.vist = true;
        this.trinVist = true;
        if (t.type === "valg") this.valgt = this.rigtigNr(t);
        else if (t.visSvar) t.visSvar(this.sim);
        this.trinLoest();
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

    /* ----- Kortet ----------------------------------------------------------------------- */
    P.chip = function () {
        var o = this.opgave();
        return o.trin.length > 1 ? "Trin " + (this.trinNr + 1) + " af " + o.trin.length : "Opgave " + (this.nr + 1);
    };

    P.visKort = function () {
        var t = this.trin(), h = "", kl;
        if (this.tilstand === "resultat") {
            kl = "scenekort loest";
            var n = this.opg.length, stjerner = 0, mig = this;
            this.opg.forEach(function (o) { if (mig.status[o.id] === "stjerne") stjerner++; });
            var mangler = this.andenFane();
            h = '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Fanen er gennemført</span>' +
                html("Du løste " + stjerner + " af " + n + " opgaver uden at se svaret. Vælg et salt på hylden, og prøv dig frem.") + "</p>" +
                (mangler ? '<button type="button" class="sk-videre" data-videre="1">Videre til ' + html(mangler.fanenavn) + " →</button>" : "") +
                "</div>";
        } else if (t) {
            var bliv = this.tilstand === "bliv";
            kl = "scenekort " + (bliv ? "loest bliv" + (this.trinVist ? " svar" : "") : (t.type === "valg" ? "spm" : "opgave"));
            var tekst;
            if (t.type === "valg") {
                tekst = NK.Papir.tekst(html((t.tekst ? t.tekst + " " : "") + t.spm));
            } else {
                /* Handlingen staar halvfed paa sin egen linje (REGELSAET 6) */
                tekst = (t.tekst ? html(t.tekst) + " " : "") +
                    '<span class="sk-spm' + (t.tekst ? " sk-linje" : "") + '">' + html(t.spm) + "</span>";
            }
            h = '<p class="sk-tekst"><span class="sk-chip">' + html(this.chip()) + "</span>" + tekst + "</p>";
            if (t.type === "valg") h += this.svarHTML(t);
            if (bliv) {
                var o = this.opgave(), sidste = this.trinNr >= o.trin.length - 1;
                var knap = !sidste ? "Næste spørgsmål →" : (this.nr < this.opg.length - 1 ? "Næste opgave →" : "Se resultatet →");
                h += NK.Papir.bliv(html(t.slut || ""), this.trinVist ? "Svaret" : "Rigtigt", knap, !!this.trinVist);
            }
        }
        if (kl && this.el.kort.className.replace(" blink", "") !== kl) this.el.kort.className = kl;
        if (this.el.ind.innerHTML !== h) this.el.ind.innerHTML = h;
        if (this.tilstand !== "bliv") this.trinVist = false;
        this.visBund();
        /* Scenen foelger med med det samme (knapper, etiket, boble) */
        if (this.sim.opgaver === this) this.sim.opdaterScene();
    };

    P.svarHTML = function (t) {
        var mig = this, bliv = this.tilstand === "bliv", rigtig = this.rigtigNr(t);
        var h = '<div class="sk-svar n' + t.svar.length + '">';
        t.svar.forEach(function (sv, i) {
            var k = "sk-knap", laast = bliv;
            if (bliv) {
                if (i === rigtig) k += mig.trinVist ? " svar-vist" : " rigtig";
                else if (mig.forkert[i]) k += " forkert";
                else k += " dim";
            } else {
                if (mig.forkert[i]) { k += " forkert"; laast = true; }
                else if (i === mig.valgt) k += " valgt";
            }
            h += '<button type="button" class="' + k + '" data-nr="' + i + '"' + (laast ? " disabled" : "") +
                "><span>" + html(sv.t) + "</span></button>";
        });
        return h + "</div>";
    };

    /* Kortets nederste raekke: beskeden, hintknappen og Indsend svar */
    P.visBund = function () {
        var aktiv = this.tilstand === "trin";
        this.el.bund.hidden = !aktiv;
        if (!aktiv) return;
        var b = this.besked || { html: "", klasse: "" };
        if (this.el.besked.innerHTML !== b.html) this.el.besked.innerHTML = b.html;
        var ryster = this.el.bund.classList.contains("ryster");
        this.el.bund.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom") + (ryster ? " ryster" : "");
        var t = this.trin(), n = t && t.hint ? t.hint.length : 0;
        var k = this.el.knap;
        var kt = this.hjaelp === 0 ? "Giv et hint" : (this.hjaelp < n ? "Næste hint (" + (this.hjaelp + 1) + " af " + n + ")" : "Vis svaret");
        if (k.textContent !== kt) k.textContent = kt;
        k.className = "knap hjaelp" + (this.hjaelp >= n && n ? " svar" : "") + (this.peger ? " peg" : "");
        this.visIndsend();
    };

    P.visIndsend = function () {
        var e = this.el.indsend;
        if (this.tilstand !== "trin") return;
        var kan = this.kanSendes();
        e.classList.toggle("klar", kan);
        e.classList.toggle("ikke-klar", !kan);
        e.setAttribute("aria-disabled", kan ? "false" : "true");
    };

    /* ----- Hvert billede ------------------------------------------------------------------ */
    /* Et handlings-trin gaar selv videre, naar scenen har staaet paa maalet
       i ca. 1 s (REGELSAET 33, 39) */
    P.opdater = function (dt) {
        var t = this.trin();
        if (this.tilstand === "trin" && t && t.type === "handling") {
            if (t.maal(this.sim) && !this.sim.traekker) {
                this.maalUr += dt;
                if (this.maalUr >= VENT) this.trinLoest();
            } else {
                this.maalUr = 0;
            }
        }
    };

    /* Enter: Indsend svar, eller videre, naar kortet er groent */
    P.enter = function () {
        if (this.tilstand === "trin") this.indsendKlik();
        else this.videre();
    };

    /* Tasten R: Start forfra */
    P.tastR = function () { this.forfra(); };
}());
