/* =====================================================================
   en_opgaver.js - opgaverne paa fane 1 (Elektronegativitet)

   Runde T8 (22. nov. 2026, Niels' ja til forslagene efter REGELSAET):
     * Seks opgaver i fast raekkefoelge i raekken oeverst i scenen.
       Titlerne laases op i takt (REGELSAET 3, 17, 18). Panelet er vaek.
     * Hver opgave er en raekke trin, ét ad gangen (REGELSAET 11-16).
       Trinene staar i NK.SimEN.OPGAVER (js/sim_en.js). Fire slags trin:
         valg      spoergsmaalet med tre (eller fire) svar i kortet. Et
                   svar vaelger kun; Indsend svar sender. Et forkert svar
                   faar sin egen forklaring.
         felt      eleven skriver selv tallet i et felt i kortet.
         handling  "Klik på C i det periodiske system ...". Kun det felt,
                   der skal bruges, kan klikkes, og det har gul ramme og
                   boble. Kortet gaar selv videre ca. 1 s efter, at scenen
                   staar paa maalet (REGELSAET 33, 39).
         byg       eleven saetter selv atomerne sammen og trykker Indsend
                   svar. Hele tabellen kan bruges.
     * Det, et trin spoerger om, er skjult i scenen, til det er besvaret
       (trin.skjul: skift, delta, dEN, type, skala, tavle, tabel;
       REGELSAET 13, 38).
     * Hinttrappe: Giv et hint › Næste hint (2 af 3) › Næste hint (3 af 3)
       › Vis svaret.
     * Loeste opgaver gemmes i browseren. En loest opgave har alt fremme
       fra start (REGELSAET 16); Start forfra giver trinene igen.
     * Naar alle seks er loest: fri leg med hele tabellen, og kortet
       foerer videre til fane 2.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var GEM = "nk-sc3.3-en";
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

    /* "0,4", "0.4", ",4", " 0,40 " og "−0,4" bliver til tal */
    function tolk(s) {
        var t = String(s || "").replace(/\s+/g, "").replace(/[−–]/g, "-").replace(",", ".");
        if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
        return parseFloat(t);
    }

    function tekstAf(v, sim) { return typeof v === "function" ? v(sim) : v; }

    NK.EnOpgaver = function (sim, opgaver) {
        this.p = "en";
        this.sim = sim;
        this.opg = opgaver;
        this.status = laes();
        this.nr = -1;
        this.trinNr = 0;
        this.tilstand = "trin";
        this.felt = "";
        this.fri = false;
        this.pauseNr = -1;

        var mig = this;
        this.el = {
            kort: NK.el("en-skort"), ind: NK.el("en-ind"), bund: NK.el("en-status"),
            besked: NK.el("en-besked"), knap: NK.el("en-hjknap"), indsend: NK.el("en-indsend"),
            liste: NK.el("en-liste"), forfra: NK.el("en-forfra"), fri: NK.el("en-frileg")
        };
        this.el.fri.addEventListener("click", function () { if (mig.fri) mig.tilbage(); else mig.friLeg(); });
        this.el.knap.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        this.el.forfra.addEventListener("click", function () { mig.forfra(); });
        this.el.ind.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || b.disabled) return;
            if (b.hasAttribute("data-videre")) { mig.videre(); return; }
            if (b.hasAttribute("data-tilbage")) { mig.tilbage(); return; }
            if (b.hasAttribute("data-luk")) { mig.lukket = true; mig.visKort(); return; }
            if (b.hasAttribute("data-nr")) mig.vaelg(parseInt(b.getAttribute("data-nr"), 10));
        });
        /* Feltet: det, eleven skriver, huskes; Enter sender ind */
        this.el.ind.addEventListener("input", function (e) {
            if (!e.target.hasAttribute("data-felt")) return;
            mig.felt = e.target.value;
            e.target.classList.remove("fejl");
            if (mig.besked && mig.besked.klasse === "skidt") mig.saetBesked("", "");
            mig.visIndsend();
        });
        this.el.ind.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" || !e.target.hasAttribute("data-felt")) return;
            e.preventDefault();
            mig.indsendKlik();
        });

        this.bygRaekke();
        if (this.alleLoest()) this.visResultat();
        else this.aabn(this.foersteUloeste());
    };

    var P = NK.EnOpgaver.prototype;

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
    /* Er en del af scenen skjult lige nu? Kun mens trinet staar uloest,
       og aldrig i en opgave, der er loest foer (REGELSAET 16, 38). */
    P.skjult = function (del) {
        var t = this.trin();
        if (!t || this.fremme) return false;
        /* Efter et rigtigt svar er det skjult, som det naeste trin spoerger
           om, saa svaret paa det naeste spoergsmaal ikke staar fremme */
        if (this.tilstand === "bliv") {
            var o = this.opgave();
            t = o.trin[this.trinNr + 1];
            if (!t) return false;
        } else if (this.tilstand !== "trin") {
            return false;
        }
        return !!t.skjul && t.skjul.indexOf(del) >= 0;
    };

    /* Den linje paa tavlen, kortet spoerger om (gul ramme og "?") */
    P.spoergerOm = function () {
        var t = this.trin();
        return this.tilstand === "trin" && t ? (t.spoerger || null) : null;
    };

    /* Maa feltet med grundstoffet klikkes nu? Kun det, kortet beder om
       (REGELSAET 19a). I byg-trin og i den fri leg kan hele tabellen bruges. */
    P.tillad = function (el) {
        if (this.tilstand === "resultat") return true;
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return false;
        if (t.type === "byg") return true;
        if (t.type === "handling") return t.el === el && !t.maal(this.sim);
        return false;
    };

    /* Er tabellen i brug (ikke bare en figur at aflaese)? */
    P.tabelAktiv = function () {
        if (this.tilstand === "resultat") return true;
        var t = this.trin();
        return this.tilstand === "trin" && !!t && (t.type === "byg" || t.type === "handling");
    };

    /* Maa eleven flytte ringen ved at klikke paa et atom i scenen? */
    P.ringFri = function () {
        if (this.tilstand === "resultat") return true;
        var t = this.trin();
        return this.tilstand === "trin" && !!t && t.type === "byg";
    };

    /* Det, der har gul ramme og boble, til eleven har brugt det */
    P.opfordring = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t || this.harKlikket) return null;
        if (t.type === "handling" && !t.maal(this.sim)) return t.el;
        if (t.type === "byg") return "tabel";
        return null;
    };

    P.klikket = function () {
        this.harKlikket = true;
        if (this.besked && this.besked.klasse === "skidt") this.saetBesked("", "");
        this.visIndsend();
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
        /* Fri leg-knappen: skjult, naar alle opgaver er loest (saa er alt fri) */
        var fk = this.el.fri;
        fk.hidden = this.tilstand === "resultat" && !this.fri;
        var ft = this.fri ? "Tilbage til opgaverne" : "Fri leg";
        if (fk.textContent !== ft) fk.textContent = ft;
        fk.classList.toggle("valgt", !!this.fri);
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
        this.fri = false;
        this.nr = NK.klamp(nr, 0, this.opg.length - 1);
        var o = this.opgave();
        this.tilstand = "trin";
        this.trinNr = 0;
        this.vist = false;
        this.fremme = !forfra && !!this.status[o.id];
        this.sim.saetPar(o.par[0], o.par[1]);
        this.nytTrin();
    };

    P.nytTrin = function () {
        this.valgt = -1;
        this.forkert = {};
        this.hjaelp = 0;
        this.felt = "";
        this.feltFejl = false;
        this.besked = { html: "", klasse: "" };
        this.maalUr = 0;
        this.harKlikket = false;
        var t = this.trin();
        if (t) {
            if (t.slot !== undefined) this.sim.slot = t.slot;
            if (t.type === "byg") this.bygStart = this.sim.aendringer;
            if (t.opsaet) t.opsaet(this.sim);
        }
        this.sim.opdaterTabel();
        this.visRaekke();
        this.visKort();
        /* Feltet faar fokus, saa eleven kan skrive med det samme */
        if (t && t.type === "felt") {
            var f = this.el.ind.querySelector("[data-felt]");
            if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
        }
    };

    /* Start forfra: den aabne opgave med trinene igen */
    P.forfra = function () {
        this.fri = false;
        this.aabn(this.tilstand === "resultat" ? (this.pauseNr >= 0 ? this.pauseNr : 0) : this.nr, true);
    };

    /* Fri leg (Niels 22. nov. 2026, REGELSAET 57): alle knapper kan bruges,
       og knappen bringer eleven tilbage til den opgave, der var i gang. */
    P.friLeg = function () {
        if (this.tilstand === "resultat") return;
        this.pauseNr = this.nr;
        this.fri = true;
        this.lukket = false;
        this.visResultat();
    };

    P.tilbage = function () {
        if (!this.fri) return;
        this.fri = false;
        this.aabn(this.pauseNr >= 0 ? this.pauseNr : this.foersteUloeste());
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
        this.sim.opdaterTabel();
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
            this.fri = false;
            this.visResultat();
            return;
        }
        if (this.tilstand === "resultat" && NK.visFane) NK.visFane("fane-polaritet");
    };

    /* Alle seks er loest: fri leg med hele tabellen */
    P.visResultat = function () {
        this.tilstand = "resultat";
        this.besked = { html: "", klasse: "" };
        this.nr = -1;
        this.fremme = true;
        this.sim.opdaterTabel();
        this.visRaekke();
        this.visKort();
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
        if (t.type === "felt") return /\d/.test(this.felt);
        if (t.type === "byg") return this.sim.aendringer !== this.bygStart;
        return !!t.maal(this.sim);
    };

    P.indsendKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        if (!this.kanSendes()) { this.blink(); return; }
        var s = this.sim;
        if (t.type === "valg") {
            if (this.valgt === this.rigtigNr(t)) { this.trinLoest(); return; }
            var nej = t.svar[this.valgt].nej || "Det svar passer ikke.";
            this.forkert[this.valgt] = true;
            this.valgt = -1;
            this.fejl(nej);
            this.visKort();
            return;
        }
        if (t.type === "felt") {
            var v = tolk(this.felt);
            if (Math.abs(v - t.facit) < 1e-6) { this.trinLoest(); return; }
            this.feltFejl = true;
            this.fejl(isNaN(v) ? "Skriv et tal, fx 1,2." : t.fejl(v));
            var f = this.el.ind.querySelector("[data-felt]");
            if (f) f.classList.add("fejl");
            return;
        }
        if (t.type === "byg") {
            if (t.ok(s.par[0], s.par[1])) { this.trinLoest(); return; }
            this.fejl(t.fejl(s.par[0], s.par[1]));
            return;
        }
        if (t.maal(s)) { this.trinLoest(); return; }
        this.fejl("Klik på " + t.el + " i det periodiske system.");
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
        else if (t.type === "felt") this.felt = NK.tal(t.facit, 1);
        else if (t.visSvar) t.visSvar(this.sim);
        this.trinLoest();
    };

    P.saetBesked = function (h, klasse) {
        this.besked = { html: h || "", klasse: klasse || "" };
        this.visBund();
        if (this.tilstand === "resultat") this.el.kort.hidden = !!this.lukket && !h;
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

    /* Et klik i scenen, der ikke er bedt om: kortet blinker */
    P.spaer = function () { this.blink(); };

    /* ----- Kortet ----------------------------------------------------------------------- */
    P.chip = function () {
        var o = this.opgave();
        return o.trin.length > 1 ? "Trin " + (this.trinNr + 1) + " af " + o.trin.length : "Opgave " + (this.nr + 1);
    };

    P.visKort = function () {
        var t = this.trin(), h = "", kl, s = this.sim;
        if (this.tilstand === "resultat" && this.fri) {
            kl = "scenekort loest";
            h = '<button type="button" class="sk-luk" data-luk="1" title="Luk kortet" aria-label="Luk kortet">✕</button>' + '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Fri leg</span>' +
                html("Sæt selv to atomer sammen i det periodiske system. Opgaven venter, til du går tilbage.") + "</p>" +
                '<button type="button" class="sk-videre" data-tilbage="1">Tilbage til opgaverne →</button></div>';
        } else if (this.tilstand === "resultat") {
            kl = "scenekort loest";
            var n = this.opg.length, stjerner = 0, mig = this;
            this.opg.forEach(function (o) { if (mig.status[o.id] === "stjerne") stjerner++; });
            h = '<button type="button" class="sk-luk" data-luk="1" title="Luk kortet" aria-label="Luk kortet">✕</button>' + '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Fanen er gennemført</span>' +
                html("Du løste " + stjerner + " af " + n + " opgaver uden at se svaret. Sæt selv to atomer sammen i det periodiske system.") + "</p>" +
                '<button type="button" class="sk-videre" data-videre="1">Videre til Polær eller upolær? →</button></div>';
        } else if (t) {
            var bliv = this.tilstand === "bliv";
            kl = "scenekort " + (bliv ? "loest bliv" + (this.trinVist ? " svar" : "") : (t.type === "valg" ? "spm" : "opgave"));
            var indl = tekstAf(t.tekst, s), spm = tekstAf(t.spm, s), tekst;
            if (t.type === "valg" || t.type === "felt") {
                tekst = NK.Papir.tekst(html((indl ? indl + " " : "") + spm));
            } else {
                /* Handlingen staar halvfed paa sin egen linje (REGELSAET 6) */
                tekst = (indl ? html(indl) + " " : "") +
                    '<span class="sk-spm' + (indl ? " sk-linje" : "") + '">' + html(spm) + "</span>";
            }
            h = '<p class="sk-tekst"><span class="sk-chip">' + html(this.chip()) + "</span>" + tekst + "</p>";
            if (t.type === "valg") h += this.svarHTML(t);
            if (t.type === "felt") h += this.feltHTML(t, bliv);
            if (bliv) {
                var o = this.opgave(), sidste = this.trinNr >= o.trin.length - 1;
                var knap = !sidste ? "Næste spørgsmål →" : (this.nr < this.opg.length - 1 ? "Næste opgave →" : "Se resultatet →");
                h += NK.Papir.bliv(html(tekstAf(t.slut, s) || ""), this.trinVist ? "Svaret" : "Rigtigt", knap, !!this.trinVist);
            }
        }
        if (kl && this.el.kort.className.replace(" blink", "") !== kl) this.el.kort.className = kl;
        if (this._sidstInd !== h) {
            /* Feltet bygges ikke om, mens eleven skriver i det */
            var f = this.el.ind.querySelector("[data-felt]");
            var fokus = f && document.activeElement === f;
            this.el.ind.innerHTML = h;
            this._sidstInd = h;
            if (fokus) {
                var ny = this.el.ind.querySelector("[data-felt]");
                if (ny && !ny.disabled) { ny.focus(); try { ny.setSelectionRange(ny.value.length, ny.value.length); } catch (e) { /* ok */ } }
            }
        }
        if (this.tilstand !== "bliv") this.trinVist = false;
        if (this.tilstand !== "resultat") this.lukket = false;
        this.visBund();
        /* Det roede kryds lukker kortet i fri leg; en besked aabner det igen */
        this.el.kort.hidden = this.tilstand === "resultat" && !!this.lukket && !(this.besked && this.besked.html);
    };

    P.feltHTML = function (t, bliv) {
        return '<div class="sk-felt"><span class="sk-felt-pre">' + html(t.pre || "") + '</span><input type="text" class="sk-felt-in' +
            (this.feltFejl && !bliv ? " fejl" : "") + '" data-felt="1" autocomplete="off" spellcheck="false" inputmode="decimal" aria-label="' +
            html(t.navn || "Svaret") + '" value="' + html(this.felt) + '"' + (bliv ? " disabled" : "") + "></div>";
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
        var b = this.besked || { html: "", klasse: "" };
        /* I den fri leg staar kun en kort besked (fx om metallerne) */
        var fri = this.tilstand === "resultat" && !!b.html;
        var aktiv = this.tilstand === "trin" || fri;
        this.el.bund.hidden = !aktiv;
        this.el.knap.hidden = fri;
        this.el.indsend.hidden = fri;
        if (!aktiv) return;
        if (this.el.besked.innerHTML !== b.html) this.el.besked.innerHTML = b.html;
        this.el.besked.hidden = !b.html;
        var ryster = this.el.bund.classList.contains("ryster");
        this.el.bund.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom") + (ryster ? " ryster" : "");
        var t = this.trin(), n = t && t.hint ? t.hint.length : 0;
        if (fri) return;
        var k = this.el.knap;
        var kt = this.hjaelp === 0 && n ? "Giv et hint" : (this.hjaelp < n ? "Næste hint (" + (this.hjaelp + 1) + " af " + n + ")" : "Vis svaret");
        if (k.textContent !== kt) k.textContent = kt;
        k.className = "knap hjaelp" + (this.hjaelp >= n ? " svar" : "") + (this.peger ? " peg" : "");
        this.visIndsend();
    };

    P.visIndsend = function () {
        var e = this.el.indsend;
        if (this.tilstand !== "trin") return;
        e.hidden = false;
        if (e.textContent !== "Indsend svar") e.textContent = "Indsend svar";
        var kan = this.kanSendes();
        e.className = "knap indsend " + (kan ? "klar" : "ikke-klar");
        e.setAttribute("aria-disabled", kan ? "false" : "true");
    };

    /* ----- Hvert billede ------------------------------------------------------------------ */
    /* Et handlings-trin gaar selv videre, naar scenen har staaet paa maalet
       i ca. 1 s (REGELSAET 33, 39). Indsend svar bliver klar, naar eleven
       har bygget noget. */
    P.opdater = function (dt) {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        if (t.type === "handling") {
            if (t.maal(this.sim)) {
                this.maalUr += dt;
                if (this.maalUr >= VENT) this.trinLoest();
            } else {
                this.maalUr = 0;
            }
        }
        var kan = this.kanSendes();
        if (kan !== this._kan) { this._kan = kan; this.visIndsend(); }
    };

    /* Enter: Indsend svar, eller videre, naar kortet er groent */
    P.enter = function () {
        if (this.tilstand === "trin") this.indsendKlik();
        else if (this.fri) this.tilbage();
        else this.videre();
    };
}());
