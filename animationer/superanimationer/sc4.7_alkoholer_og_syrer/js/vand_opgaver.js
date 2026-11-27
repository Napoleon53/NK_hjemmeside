/* =====================================================================
   vand_opgaver.js - opgaverne paa fane 3 (I vand)

   Runde T11 (27. nov. 2026, efter REGELSAET; Niels: "Du må nu gerne gå
   direkte i gang med T11 og lave første udkast"). Kopi af sc4.5's
   koele_opgaver.js (T10), som er en kopi af sc4.1's varm_opgaver.js (T9),
   med fanens egne id'er og tekster og fire tilfoejelser:
     * trinet "indsend": eleven bygger et molekyle og trykker Indsend svar;
       trin.tjek(stof) giver forklaringen til et forkert molekyle
     * trin.skjul og trin.tekst/spm/slut kan vaere funktioner af scenen
     * trin.vent: sekunder paa maalet, foer kortet gaar videre (ellers VENT)
     * stjernen faas kun uden forkerte svar og uden Vis svaret (CLAUDE.md:
       "Stjerne kun for første forsøg")
     * maalZone(kopi): det hoejeste, kortet kan blive, maalt i en usynlig
       kopi af kortet, saa scenen aldrig hopper (REGELSAET 4)

     * Opgaverne i fast raekkefoelge i raekken oeverst i scenen. Titlerne
       laases op i takt (REGELSAET 3, 17, 18). Panelet er vaek.
     * Hver opgave er en raekke trin, ét ad gangen (REGELSAET 11-16).
       Trinene staar i D.OPG_VAND (js/data.js).
     * Det, et trin ikke bruger endnu, er en stiplet plads
       (trin.skjul: lup, regel, glas; REGELSAET 13, 38).
     * Hinttrappe: Giv et hint › Næste hint (2 af 3) › Næste hint (3 af 3)
       › Vis svaret.
     * Loeste opgaver gemmes i browseren. En loest opgave har alt fremme
       fra start (REGELSAET 16); Start forfra giver trinene igen.
     * Fri leg (REGELSAET 57) under Start forfra: alt paa pladen kan
       bruges, og knappen bringer eleven tilbage til opgaven. Naar alle er
       loest, er fri leg slaaet til, og kortet har ingen groen knap.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var GEM = "nk-sc4.7-vand-opg";
    var VENT = 1.2;                 /* sekunder paa maalet, foer kortet gaar videre */

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

    function tekstAf(v, sim) { return typeof v === "function" ? v(sim) : v; }

    NK.VandOpgaver = function (sim, opgaver) {
        this.sim = sim;
        this.opg = opgaver;
        this.status = laes();
        this.nr = -1;
        this.trinNr = 0;
        this.tilstand = "trin";
        this.fri = false;
        this.pauseNr = -1;

        var mig = this;
        this.el = {
            kort: NK.el("vand-skort"), ind: NK.el("vand-ind"), bund: NK.el("vand-bund"),
            besked: NK.el("vand-besked"), knap: NK.el("vand-hjknap"), indsend: NK.el("vand-indsend"),
            liste: NK.el("vand-liste"), forfra: NK.el("vand-forfra"), fri: NK.el("vand-frileg")
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

        this.bygRaekke();
    };

    var P = NK.VandOpgaver.prototype;

    /* Kaldes af fanen, naar den er klar (pladen og glasset findes) */
    P.start = function () {
        if (this.alleLoest()) this.visResultat();
        else this.aabn(this.foersteUloeste());
    };

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

    /* Fri: alt i scenen kan bruges (fri leg og efter alle opgaverne) */
    P.erFri = function () { return this.tilstand === "resultat"; };

    /* ----- Det, scenen viser ------------------------------------------------------ */
    /* Er en del af scenen skjult lige nu? Kun mens trinet staar uloest,
       og aldrig i en opgave, der er loest foer (REGELSAET 16, 38). Efter et
       rigtigt svar er det skjult, som det naeste trin skjuler. */
    P.skjult = function (del) {
        if (this.tilstand === "resultat" || this.fremme) return false;
        var o = this.opgave(), t = this.trin();
        if (!t) return false;
        var liste = tekstAf(t.skjul, this.sim) || [];
        if (this.tilstand === "bliv") {
            /* Efter et rigtigt svar kommer glasset frem; luppen og
               tommelfingerreglen bliver stiplede pladser, til et trin bruger
               dem, saa intet dukker op og forsvinder igen */
            var naeste = o.trin[this.trinNr + 1];
            if (naeste) return (tekstAf(naeste.skjul, this.sim) || []).indexOf(del) >= 0;
            return del !== "glas" && liste.indexOf(del) >= 0;
        }
        return liste.indexOf(del) >= 0;
    };

    /* Maa tingen bruges nu? hvad: "laengde", "tile:COOH", "glas".
       Under et spoergsmaal kan intet bruges (REGELSAET 19a). */
    P.tillad = function (hvad) {
        if (this.erFri()) return true;
        var t = this.trin();
        if (this.tilstand !== "trin" || !t || t.type === "valg") return false;
        var liste = tekstAf(t.tillad, this.sim) || [];
        return liste.indexOf(hvad) >= 0;
    };

    /* Det, der har gul ramme og boble, til eleven har brugt det */
    P.opfordring = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t || t.type === "valg") return null;
        if (t.type === "handling" && t.maal(this.sim)) return null;
        var el = tekstAf(t.el, this.sim);
        if (!el || this.brugt[el]) return null;
        return { el: el, tekst: tekstAf(t.boble, this.sim) || "" };
    };

    /* Eleven har taget fat i tingen: boblen forsvinder */
    P.brug = function (hvad) {
        this.brugt[hvad] = true;
        if (this.besked && this.besked.klasse === "skidt") this.saetBesked("", "");
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
        /* Er der ikke plads til alle titlerne, staar kun den aabne opgave
           med titel; de andre har nummeret (og titlen ved musen) */
        var l = this.el.liste;
        l.classList.remove("kompakt");
        if (l.scrollWidth > l.clientWidth + 1) l.classList.add("kompakt");
    };

    /* ----- Opgaver og trin ----------------------------------------------------------- */
    P.aabn = function (nr, forfra) {
        this.fri = false;
        this.nr = NK.klamp(nr, 0, this.opg.length - 1);
        var o = this.opgave();
        this.tilstand = "trin";
        this.trinNr = 0;
        this.vist = false;
        this.fejlet = false;
        this.fremme = !forfra && !!this.status[o.id];
        if (this.sim.nyOpgave) this.sim.nyOpgave(o, this.fremme);
        this.nytTrin();
    };

    P.nytTrin = function () {
        this.valgt = -1;
        this.forkert = {};
        this.hjaelp = 0;
        this.besked = { html: "", klasse: "" };
        this.maalUr = 0;
        this.brugt = {};
        this.peger = false;
        var t = this.trin();
        if (t && t.opsaet) t.opsaet(this.sim);
        this.visRaekke();
        this.visKort();
    };

    /* Start forfra: den aabne opgave med trinene igen */
    P.forfra = function () {
        this.fri = false;
        this.aabn(this.tilstand === "resultat" ? (this.pauseNr >= 0 ? this.pauseNr : 0) : this.nr, true);
    };

    /* Fri leg: alt i scenen kan bruges, og knappen bringer eleven tilbage
       til den opgave, der var i gang (som i sc3.3) */
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
        if (!sidste && (t.type === "handling" || t.type === "indsend")) {
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
        this.status[o.id] = ((!this.vist && !this.fejlet) || foer === "stjerne") ? "stjerne" : "loest";
        this.gem();
        if (this.alleLoest() && this.sim.alleLoest) this.sim.alleLoest();
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
        /* Efter sidste opgave er der ingen knap videre: kortet lægger op til
           fri leg (Niels 22. nov. 2026: "fjerne den groenne boks naar man er
           faerdig, og der maa gerne laegges op til fri leg") */
    };

    /* Alle er loest (eller fri leg): alt i scenen kan bruges */
    P.visResultat = function () {
        this.tilstand = "resultat";
        this.besked = { html: "", klasse: "" };
        this.nr = -1;
        this.fremme = true;
        this.brugt = {};
        if (this.sim.friStart) this.sim.friStart();
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
        if (t.type === "indsend") return !this.sim.traek && (!t.klar || !!t.klar(this.sim));
        return !!t.maal(this.sim);
    };

    P.indsendKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        if (!this.kanSendes()) {
            this.blink();
            if (t.type === "handling" && t.ikkeEndnu) this.fejl(tekstAf(t.ikkeEndnu, this.sim));
            return;
        }
        if (t.type === "valg") {
            if (this.valgt === this.rigtigNr(t)) { this.trinLoest(); return; }
            var nej = t.svar[this.valgt].nej || "Det svar passer ikke.";
            this.forkert[this.valgt] = true;
            this.valgt = -1;
            this.fejl(nej);
            this.visKort();
            return;
        }
        if (t.type === "indsend" && t.tjek) {
            var f = t.tjek(this.sim.stofNu());
            if (f) { this.fejl(f); return; }
        }
        this.trinLoest();
    };

    P.fejl = function (tekst) {
        this.peger = true;
        this.fejlet = true;
        this.saetBesked('<span class="b-maerke">Ikke rigtigt</span>' + html(tekst), "skidt");
        this.ryst();
    };

    P.hjaelpKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        this.peger = false;
        var hint = tekstAf(t.hint, this.sim) || [];
        if (this.hjaelp < hint.length) {
            this.hjaelp++;
            this.saetBesked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + hint.length + "</span>" +
                html(hint[this.hjaelp - 1]), "hint");
            return;
        }
        this.visSvar();
    };

    /* Vis svaret: et spoergsmaal faar det rigtige svar; en handling
       goeres af scenen selv, og kortet gaar videre, naar maalet er naaet */
    P.visSvar = function () {
        var t = this.trin();
        if (!t) return;
        this.vist = true;
        if (t.type === "valg") {
            this.trinVist = true;
            this.valgt = this.rigtigNr(t);
            this.trinLoest();
            return;
        }
        if (t.visSvar) t.visSvar(this.sim);
        this.brugt[tekstAf(t.el, this.sim)] = true;
        if (t.type === "indsend") {
            this.trinVist = true;
            this.trinLoest();
            return;
        }
        this.trinVist = true;
        this.saetBesked('<span class="b-maerke">Svaret</span>' + html(tekstAf(t.svarTekst, this.sim) || "Scenen viser det."), "gul");
    };

    P.saetBesked = function (h, klasse) {
        this.besked = { html: h || "", klasse: klasse || "" };
        this.visBund();
        if (this.tilstand === "resultat") this.el.kort.hidden = !!this.lukket && !h;
    };

    /* En kort besked i den fri leg (fx paaskeaegget H−OH er vand) */
    P.friBesked = function (tekst) {
        if (this.tilstand !== "resultat") return;
        this.lukket = false;
        this.saetBesked(html(tekst), "peger");
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

    /* Et greb i scenen, der ikke er bedt om: kortet blinker */
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
            h = '<button type="button" class="sk-luk" data-luk="1" title="Luk kortet" aria-label="Luk kortet">✕</button>' +
                '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Fri leg</span>' +
                html(NK.Data.VAND_FRI.pause) + "</p>" +
                '<button type="button" class="sk-videre" data-tilbage="1">Tilbage til opgaverne →</button></div>';
        } else if (this.tilstand === "resultat") {
            kl = "scenekort loest";
            /* REGELSAET 57: efter sidste opgave er fri leg slaaet til */
            h = '<button type="button" class="sk-luk" data-luk="1" title="Luk kortet" aria-label="Luk kortet">✕</button>' +
                '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Fri leg</span>' +
                html(NK.Data.VAND_FRI.alle) +
                '<span class="sk-spm sk-linje">' + html(NK.Data.VAND_FRI.alleSpm) +
                "</span></p></div>";
        } else if (t) {
            var bliv = this.tilstand === "bliv";
            kl = "scenekort " + (bliv ? "loest bliv" + (this.trinVist ? " svar" : "") : (t.type === "valg" ? "spm" : "opgave"));
            var indl = tekstAf(t.tekst, s), spm = tekstAf(t.spm, s), tekst;
            if (t.type === "valg") {
                tekst = NK.Papir.tekst(html((indl ? indl + " " : "") + spm));
            } else {
                /* Handlingen staar halvfed paa sin egen linje (REGELSAET 6) */
                tekst = (indl ? html(indl) + " " : "") +
                    '<span class="sk-spm' + (indl ? " sk-linje" : "") + '">' + html(spm) + "</span>";
            }
            h = '<p class="sk-tekst"><span class="sk-chip">' + html(this.chip()) + "</span>" + tekst + "</p>";
            if (t.type === "valg") h += this.svarHTML(t);
            if (bliv) {
                var o = this.opgave(), sidste = this.trinNr >= o.trin.length - 1;
                var knap = !sidste ? "Næste spørgsmål →" : (this.nr < this.opg.length - 1 ? "Næste opgave →" : "Videre til fri leg →");
                h += NK.Papir.bliv(html(tekstAf(t.slut, s) || ""), this.trinVist ? "Svaret" : "Rigtigt", knap, !!this.trinVist);
            }
        }
        if (kl && this.el.kort.className.replace(" blink", "") !== kl) this.el.kort.className = kl;
        if (this._sidstInd !== h) {
            this.el.ind.innerHTML = h;
            this._sidstInd = h;
        }
        if (this.tilstand !== "bliv" && !(this.tilstand === "trin" && this.besked && this.besked.klasse === "gul")) this.trinVist = false;
        if (this.tilstand !== "resultat") this.lukket = false;
        this.visBund();
        this.el.kort.hidden = this.tilstand === "resultat" && !!this.lukket && !(this.besked && this.besked.html);
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
        if (fri) return;
        var t = this.trin(), hint = t ? (tekstAf(t.hint, this.sim) || []) : [], n = hint.length;
        var k = this.el.knap;
        /* Mens scenen viser svaret, er hintknappen vaek */
        k.hidden = !!this.trinVist;
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
       i ca. 1 s (REGELSAET 33, 39). Indsend svar er reserven. */
    P.opdater = function (dt) {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        if (t.type === "handling") {
            if (t.maal(this.sim)) {
                this.maalUr += dt;
                if (this.maalUr >= (t.vent || VENT)) this.trinLoest();
            } else {
                this.maalUr = 0;
            }
        }
        var kan = this.kanSendes();
        if (kan !== this._kan) { this._kan = kan; this.visIndsend(); }
    };

    /* ----- Kortets plads ----------------------------------------------------------------
       Det hoejeste, kortet kan blive: hvert trin i hver opgave med hvert hint,
       hver forklaring til et forkert svar og det groenne kort, maalt i en
       usynlig kopi af kortet i samme bredde (som maaltKortZone i js/sim.js).
       Tekster, der afhaenger af molekylet, maales med flere molekyler. */
    P.maalZone = function (kopi) {
        var mig = this, D = NK.Data;
        var gemt = {};
        ["el", "sim", "nr", "trinNr", "tilstand", "fri", "besked", "valgt", "forkert", "hjaelp",
            "trinVist", "_sidstInd", "fremme", "lukket", "vist", "peger", "brugt", "_kan"].forEach(function (k) { gemt[k] = mig[k]; });
        /* Kopien har kortets to boern: sk-ind og sk-bund (med beskeden og knapperne) */
        var ind = kopi.children[0], bund = kopi.children[1];
        ind.innerHTML = "";
        this.el = { kort: kopi, ind: ind, bund: bund, besked: bund.querySelector(".st-tekst"),
            knap: bund.querySelector(".knap.hjaelp"), indsend: bund.querySelector(".knap.indsend"),
            liste: gemt.el.liste, forfra: gemt.el.forfra, fri: gemt.el.fri };
        var aegte = gemt.sim;
        var proever = [["OH", 4], ["OH", 8], ["COOH", 0], ["COOH", 3], ["COOH", 4], ["COOH", 7], ["H", 8], ["OH", 0], ["glycerol", 3]];
        var hoejst = 0;
        function maal() { mig._sidstInd = null; mig.visKort(); hoejst = Math.max(hoejst, kopi.offsetHeight); }
        function medStof(p, f) {
            mig.sim = Object.create(aegte);
            mig.sim.stofNu = function () { return D.stof(p[0], p[1]); };
            mig.sim.n = p[1];
            f();
        }
        this.fri = false;
        this.fremme = false;
        this.opg.forEach(function (o, i) {
            o.trin.forEach(function (t, j) {
                proever.forEach(function (p) {
                    medStof(p, function () {
                        mig.nr = i; mig.trinNr = j; mig.valgt = -1; mig.forkert = {}; mig.hjaelp = 0; mig.peger = false; mig.brugt = {};
                        mig.tilstand = "trin"; mig.trinVist = false;
                        var beskeder = [""];
                        (tekstAf(t.hint, mig.sim) || []).forEach(function (h, k) { beskeder.push('<span class="b-maerke">Hint ' + (k + 1) + " af 3</span>" + html(h)); });
                        (t.svar || []).forEach(function (sv) { if (sv.nej) beskeder.push('<span class="b-maerke">Ikke rigtigt</span>' + html(sv.nej)); });
                        if (t.tjek) proever.forEach(function (p2) { var f = t.tjek(D.stof(p2[0], p2[1])); if (f) beskeder.push('<span class="b-maerke">Ikke rigtigt</span>' + html(f)); });
                        if (t.svarTekst) beskeder.push('<span class="b-maerke">Svaret</span>' + html(tekstAf(t.svarTekst, mig.sim)));
                        if (t.ikkeEndnu) beskeder.push('<span class="b-maerke">Ikke rigtigt</span>' + html(tekstAf(t.ikkeEndnu, mig.sim)));
                        if (t.beskedVed) beskeder.push(html(t.beskedVed(D.stof("OH", 4))));
                        [D.kortest, D.laengst, D.trakForbi, D.PAASKE.vand, D.PAASKE.dihydrogen].forEach(function (k) { beskeder.push(html(k)); });
                        beskeder.forEach(function (b) { mig.besked = { html: b, klasse: b ? "hint" : "" }; maal(); });
                        if (t.type === "valg" || t.slut) {
                            mig.besked = { html: "", klasse: "" };
                            mig.tilstand = "bliv";
                            [false, true].forEach(function (v) { mig.trinVist = v; maal(); });
                        }
                    });
                });
            });
        });
        this.sim = aegte;
        this.tilstand = "resultat";
        this.nr = -1;
        this.besked = { html: "", klasse: "" };
        [true, false].forEach(function (f) { mig.fri = f; mig.lukket = false; maal(); });
        [D.PAASKE.vand, D.PAASKE.dihydrogen].forEach(function (t) { mig.fri = true; mig.besked = { html: html(t), klasse: "peger" }; maal(); });
        for (var k in gemt) if (Object.prototype.hasOwnProperty.call(gemt, k)) this[k] = gemt[k];
        this._sidstInd = null;
        return hoejst;
    };

    /* Enter: Indsend svar, eller videre, naar kortet er groent */
    P.enter = function () {
        if (this.tilstand === "bliv") this.videre();
        else if (this.tilstand === "trin") this.indsendKlik();
    };
}());
