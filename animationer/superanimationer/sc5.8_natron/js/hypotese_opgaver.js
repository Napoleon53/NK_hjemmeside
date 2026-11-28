/* =====================================================================
   hypotese_opgaver.js - opgaverne paa fane 2 (Hypoteserne)

   Runde T13d (28. nov. 2026, Niels: "Jeg synes du bare lige skal prøve
   dit forslag som i t12"). Bygget paa motoren fra fane 1
   (forsoeg_opgaver.js, T13) og sc5.6 (vej_opgaver.js, T12). Fire slags
   trin (D.OPG_HYP i js/data.js):
     regn    tallet skrives i et felt i kortet ("n(NaHCO₃) = [ ] mol").
             Med formler vaelges formlen foerst blandt tre knapper, og
             feltet kommer frem i samme kort, naar formlen er rigtig.
     valg    tre svar, hvor de forkerte er typiske fejl (REGELSAET 14)
     afstem  de smaa felter foran stofferne i reaktionsskemaet staar i kortet
     dom     hypotese A, B eller C. Er massen ikke konstant endnu, siger
             kortet, at eleven skal varme videre paa fane 1.

     * Opgaverne i fast raekkefoelge i raekken oeverst i scenen. Titlerne
       laases op i takt (REGELSAET 3, 17). Panelet er vaek.
     * Svarknapperne vaelger kun; Indsend svar sender (REGELSAET 15).
     * Efter et rigtigt svar bliver kortet groent med et stort "✓ Rigtigt",
       til eleven trykker Næste (REGELSAET 66).
     * Hinttrappe: Giv et hint › Næste hint › Vis svaret.
     * Loeste opgaver gemmes i browseren. En loest opgave har alt fremme
       (REGELSAET 16); Start forfra giver trinene igen.
     * Fri leg (REGELSAET 57) under Start forfra: hypoteserne og Nye tal i
       raekken, og Tilbage til opgaverne bringer eleven tilbage til samme
       sted. Efter sidste opgave er fri leg slaaet til (som T12).
     * maalZone(kopi): det hoejeste, kortet kan blive, maalt i en usynlig
       kopi, saa scenen aldrig hopper (REGELSAET 4).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var GEM = "nk-sc5.8-hyp-opg";

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

    /* Det groenne kort (REGELSAET 66): "✓ Rigtigt" stort med Næste ved siden
       af og forklaringen i hele kortets bredde under (som fane 1) */
    function blivHTML(tekstHtml, maerke, knap, slags) {
        return '<div class="sk-bund vbliv ' + slags + '"><div class="vb-top">' +
            '<span class="b-maerke">' + maerke + "</span>" +
            (knap ? '<button type="button" class="sk-videre" data-videre="1">' + knap + "</button>" : "") + "</div>" +
            (tekstHtml ? '<p class="st-tekst">' + tekstHtml + "</p>" : "") + "</div>";
    }

    NK.HypOpgaver = function (sim) {
        this.sim = sim;
        this.opg = D.OPG_HYP;
        this.status = laes();
        this.nr = -1;
        this.trinNr = 0;
        this.tilstand = "trin";
        this.fri = false;
        this.alle = false;
        this.pause = null;
        this.friHyp = "B";
        this.nulTrin();

        var mig = this;
        this.el = {
            kort: NK.el("hyp-skort"), ind: NK.el("hyp-ind"), bund: NK.el("hyp-bund"),
            besked: NK.el("hyp-besked"), knap: NK.el("hyp-hjknap"), indsend: NK.el("hyp-indsend"),
            liste: NK.el("hyp-liste"), reak: NK.el("hyp-reak"), forfra: NK.el("hyp-forfra"), fri: NK.el("hyp-frileg")
        };
        this.el.fri.addEventListener("click", function () { if (mig.fri) mig.tilbage(); else mig.friLeg(); });
        this.el.knap.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        this.el.forfra.addEventListener("click", function () { mig.forfra(); });
        this.el.ind.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || b.disabled) return;
            if (b.hasAttribute("data-videre")) { mig.videre(); return; }
            if (b.hasAttribute("data-luk")) { mig.lukket = true; mig.visKort(); return; }
            if (b.hasAttribute("data-nr")) mig.vaelg(parseInt(b.getAttribute("data-nr"), 10));
        });
        /* Felterne i kortet: Enter sender ind (eller gaar videre, naar kortet er groent) */
        this.el.ind.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" || !e.target || e.target.tagName !== "INPUT") return;
            e.preventDefault();
            e.stopPropagation();
            if (mig.tilstand === "bliv") mig.videre();
            else mig.indsendKlik();
        });
        this.el.ind.addEventListener("input", function (e) {
            if (!e.target || e.target.tagName !== "INPUT") return;
            var i = e.target.getAttribute("data-i");
            if (i !== null) mig.afUdkast[parseInt(i, 10)] = e.target.value;
            else mig.udkast = e.target.value;
            e.target.classList.remove("forkert");
            if (mig.besked && mig.besked.klasse === "skidt") mig.saetBesked("", "");
            mig.visIndsend();
        });

        this.bygRaekke();
    };

    var P = NK.HypOpgaver.prototype;

    /* Kaldes af fanen, naar scenen er klar */
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

    /* Er opgaven med id loest (gemt i browseren)? */
    P.loest = function (id) { return !!this.status[id]; };

    /* Opgaven, der er i gang: en af de fem, eller den fri legs opgave */
    P.opgave = function () {
        if (this.fri) return this.friOpg || null;
        return this.nr >= 0 ? this.opg[this.nr] : null;
    };

    P.trin = function () {
        var o = this.opgave();
        return o ? o.trin[this.trinNr] : null;
    };

    P.erFri = function () { return !!this.fri; };

    /* Det, kortet spoerger om lige nu: et felt, "afstem", "dom" eller null */
    P.felt = function () {
        var t = this.trin();
        if (!t || this.tilstand !== "trin") return null;
        if (t.type === "afstem" || t.type === "dom") return t.type;
        return t.felt || null;
    };

    /* Er formlen det, der vaelges lige nu? */
    P.formelFase = function () {
        var t = this.trin();
        return !!(t && t.type === "regn" && t.formler && !this.formelOk && this.tilstand === "trin");
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
        /* Den fri leg: de tre hypoteser og Nye tal */
        this.hknapper = D.HYP_IDS.map(function (h) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "or-knap or-reak";
            b.setAttribute("data-hyp", h);
            b.textContent = "Hypotese " + h + ": " + D.STOF[D.HYP[h].produkt].formel;
            b.addEventListener("click", function () { mig.nyFri(h); });
            mig.el.reak.appendChild(b);
            return b;
        });
        var nye = document.createElement("button");
        nye.type = "button";
        nye.className = "or-knap or-nye";
        nye.innerHTML = 'Nye tal <span class="or-tegn">⟳</span>';
        nye.addEventListener("click", function () { mig.nyFri(mig.friHyp); });
        this.el.reak.appendChild(nye);
        this.el.nye = nye;
    };

    P.visRaekke = function () {
        var mig = this, foerste = this.foersteUloeste(), alle = this.alleLoest();
        var fk = this.el.fri;
        var ft = this.fri ? "Tilbage til opgaverne" : "Fri leg";
        if (fk.textContent !== ft) fk.textContent = ft;
        fk.classList.toggle("valgt", !!this.fri);
        this.el.liste.hidden = !!this.fri;
        this.el.reak.hidden = !this.fri;
        this.opg.forEach(function (o, i) {
            var b = mig.knapper[i], s = mig.status[o.id];
            var aaben = !!s || i === mig.nr || (!alle && i === foerste);
            b.classList.toggle("laast", !aaben);
            b.disabled = !aaben;
            b.classList.toggle("valgt", i === mig.nr && !mig.fri);
            b.classList.toggle("loest", !!s);
            b.classList.toggle("stjerne", s === "stjerne");
            saetTekstEl(b.querySelector(".or-nr"), s === "stjerne" ? "★" : (s ? "✓" : String(i + 1)));
            saetTekstEl(b.querySelector(".or-navn"), aaben ? o.navn : "");
            b.title = aaben ? o.navn : "Låses op, når de forrige opgaver er løst";
        });
        this.hknapper.forEach(function (b) { b.classList.toggle("valgt", b.getAttribute("data-hyp") === mig.friHyp); });
        var l = this.fri ? this.el.reak : this.el.liste;
        l.classList.remove("kompakt");
        if (l.scrollWidth > l.clientWidth + 1) l.classList.add("kompakt");
    };

    /* ----- Opgaver og trin ----------------------------------------------------------- */
    P.aabn = function (nr, forfra) {
        this.fri = false;
        this.alle = false;
        this.pause = null;
        this.nr = NK.klamp(nr, 0, this.opg.length - 1);
        var o = this.opgave();
        this.vist = false;
        this.fejlet = false;
        this.fremme = !forfra && !!this.status[o.id];
        this.sim.nyOpgave(o, this.fremme);
        if (this.fremme) {
            /* En loest opgave har alt fremme: kortet staar groent paa sidste trin (REGELSAET 16) */
            this.trinNr = o.trin.length - 1;
            this.nulTrin();
            this.tilstand = "bliv";
            this.formelOk = true;
            var t = this.trin(), liste = this.liste(t);
            if (liste) this.valgt = this.rigtigNr(liste);
            this.slutTekst = this.sim.slutTekst(t);
            this.sim.spoerg(null);
            this.visRaekke();
            this.visKort();
            return;
        }
        this.trinNr = 0;
        this.nytTrin();
    };

    P.nulTrin = function () {
        this.valgt = -1;
        this.forkert = {};
        this.hjaelp = 0;
        this.besked = { html: "", klasse: "" };
        this.peger = false;
        this.formelOk = false;
        this.udkast = "";
        this.afUdkast = [];
        this.trinVist = false;
        this.slutTekst = "";
    };

    P.nytTrin = function () {
        this.nulTrin();
        this.tilstand = "trin";
        this.sim.spoerg(this.felt());
        this.visRaekke();
        this.visKort();
        this.fokus();
    };

    /* Start forfra: den aabne opgave med trinene igen */
    P.forfra = function () {
        var nr = this.fri ? (this.pause ? this.pause.nr : 0) : this.nr;
        this.aabn(nr, true);
    };

    /* Fri leg: hypoteserne og Nye tal i raekken. Tilbage til opgaverne bringer
       eleven tilbage til samme sted i opgaven (REGELSAET 57) */
    var PAUSE = ["nr", "trinNr", "tilstand", "formelOk", "valgt", "forkert", "slutTekst", "trinVist", "vist", "fejlet",
        "fremme", "hjaelp", "udkast", "afUdkast", "besked", "peger"];

    P.friLeg = function () {
        if (this.fri) return;
        var mig = this;
        this.pause = { scene: this.sim.gemTilstand() };
        PAUSE.forEach(function (k) { mig.pause[k] = mig[k]; });
        this.fri = true;
        this.lukket = false;
        this.nyFri(this.friHyp);
    };

    P.tilbage = function () {
        if (!this.fri) return;
        var p = this.pause, mig = this;
        this.fri = false;
        this.pause = null;
        /* Efter alle opgaverne: dommen med alt fremme */
        if (this.alle || !p || p.nr < 0) { this.aabn(this.alleLoest() ? this.opg.length - 1 : this.foersteUloeste()); return; }
        /* Er maalingen skiftet imens, begynder opgaven forfra med de nye tal */
        if (this.sim.gammelScene(p.scene)) { this.aabn(p.nr); return; }
        PAUSE.forEach(function (k) { mig[k] = p[k]; });
        this.sim.hentTilstand(p.scene);
        this.sim.spoerg(this.felt());
        this.visRaekke();
        this.visKort();
        this.fokus();
    };

    /* En ny opgave i den fri leg med hypotesen h og en ny masse natron */
    P.nyFri = function (h) {
        this.fri = true;
        this.lukket = false;
        this.friHyp = h;
        this.friOpg = { id: "fri", navn: "Hypotese " + h, hyp: h, mf: this.sim.nyFriMasse(), trin: D.HYP_FRI_TRIN };
        this.vist = false;
        this.fejlet = false;
        this.fremme = false;
        this.trinNr = 0;
        this.sim.nyOpgave(this.friOpg, false);
        this.nytTrin();
        if (this.alle) this.saetBesked(html(D.HYP_FRI.alle), "peger");
    };

    P.trinLoest = function () {
        var o = this.opgave(), t = this.trin();
        if (!t) return;
        this.slutTekst = this.sim.loes(t, this.trinVist ? "svar" : "ok", this.valgtSvar);
        this.valgtSvar = null;
        this.sim.spoerg(null);
        this.tilstand = "bliv";
        this.besked = { html: "", klasse: "" };
        if (this.trinNr >= o.trin.length - 1 && !this.fri) this.opgaveLoest();
        this.visRaekke();
        this.visKort();
    };

    P.opgaveLoest = function () {
        var o = this.opgave();
        var foer = this.status[o.id];
        this.status[o.id] = ((!this.vist && !this.fejlet) || foer === "stjerne") ? "stjerne" : "loest";
        this.gem();
        this.sim.opgaveLoest(o);
    };

    /* Kortets groenne knap gaar altid fremad */
    P.videre = function () {
        if (this.tilstand !== "bliv") return;
        var o = this.opgave();
        if (this.trinNr < o.trin.length - 1) {
            this.trinNr++;
            this.nytTrin();
            return;
        }
        if (this.fri) { this.nyFri(this.friHyp); return; }
        if (this.nr < this.opg.length - 1) { this.aabn(this.nr + 1); return; }
        /* Efter sidste opgave: fri leg er slaaet til, og eleven kommer videre til fane 3 */
        this.visResultat();
        this.sim.naesteFane();
    };

    /* Alle fem er loest: fri leg er slaaet til (REGELSAET 57) */
    P.visResultat = function () {
        this.alle = true;
        this.pause = null;
        this.nr = -1;
        this.fri = true;
        this.lukket = false;
        this.nyFri(this.friHyp);
    };

    /* ----- Svar, hint og Indsend svar ---------------------------------------------- */
    /* Svarknapperne til trinet t (eller null, naar trinet har felter) */
    P.liste = function (t) {
        if (!t) return null;
        if (t.type === "valg") return this.sim.valgSvar(t);
        if (t.type === "dom") return this.sim.domKlar() ? this.sim.domSvar() : null;
        if (t.type === "regn" && t.formler && !this.formelOk) return D.FORMLER[t.formler].svar;
        return null;
    };

    P.svarListe = function () {
        return this.tilstand === "trin" ? this.liste(this.trin()) : null;
    };

    P.vaelg = function (i) {
        var liste = this.svarListe();
        if (!liste || !liste[i] || this.forkert[i]) return;
        this.valgt = i;
        if (this.besked && this.besked.klasse === "skidt") this.besked = { html: "", klasse: "" };
        this.visKort();
    };

    P.rigtigNr = function (liste) {
        for (var i = 0; i < liste.length; i++) if (liste[i].ok) return i;
        return -1;
    };

    /* Kan der trykkes paa Indsend svar? */
    P.kanSendes = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return false;
        if (this.svarListe()) return this.valgt >= 0;
        if (t.type === "afstem") {
            var n = this.sim.antalStoffer(), a = this.afUdkast;
            for (var i = 0; i < n; i++) if (!String(a[i] || "").trim()) return false;
            return true;
        }
        if (t.type === "regn") return !!String(this.udkast || "").trim();
        return false;
    };

    P.indsendKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) { this.blink(); return; }
        if (!this.kanSendes()) {
            this.blink();
            if (t.type === "afstem") { this.saetBesked(html(D.AFSTEM.tom), "peger"); this.fokus(); }
            else if (t.type === "regn" && !this.svarListe()) { this.saetBesked("Skriv tallet i feltet først.", "peger"); this.fokus(); }
            return;
        }
        var liste = this.svarListe();
        if (liste) {
            var sv = liste[this.valgt];
            if (sv.ok) {
                if (t.type === "regn") {
                    /* Formlen er rigtig: feltet til tallet kommer frem i samme kort */
                    this.formelOk = true;
                    this.valgt = -1;
                    this.forkert = {};
                    this.saetBesked('<span class="b-maerke">Rigtigt</span>' + html(D.FORMLER[t.formler].godt), "god");
                    this.fokus();
                    return;
                }
                this.valgtSvar = sv;
                this.trinLoest();
                return;
            }
            this.forkert[this.valgt] = true;
            this.valgt = -1;
            this.fejl(sv.nej || "Det svar passer ikke.");
            this.visKort();
            return;
        }
        var res = t.type === "afstem" ? this.sim.tjekAfstem(this.afUdkast) : this.sim.tjekTal(t.felt, this.udkast);
        if (res.tom) { this.blink(); this.saetBesked(html(res.besked), "peger"); this.fokus(res.felt); return; }
        if (res.ok) { this.trinLoest(); return; }
        this.fejl(res.besked);
        var inp = t.type === "afstem" && res.felt !== undefined ? this.el.ind.querySelector('input[data-i="' + res.felt + '"]') :
            (t.type === "afstem" ? null : this.el.ind.querySelector("input"));
        if (inp) inp.classList.add("forkert");
        this.rystFelt();
        this.fokus(res.felt);
    };

    P.fejl = function (tekst) {
        this.peger = true;
        this.fejlet = true;
        this.sim.journalFejl();
        this.saetBesked('<span class="b-maerke">Ikke rigtigt</span>' + html(tekst), "skidt");
        this.ryst();
    };

    P.hints = function () {
        var t = this.trin();
        return t ? this.sim.tekster(t).hint || [] : [];
    };

    P.hjaelpKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        this.peger = false;
        var hint = this.hints();
        if (this.hjaelp < hint.length) {
            this.hjaelp++;
            this.saetBesked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + hint.length + "</span>" +
                html(hint[this.hjaelp - 1]), "hint");
            return;
        }
        this.visSvar();
    };

    /* Vis svaret: det rigtige svar eller tallet kommer ind, og kortet bliver gult.
       Venter dommen paa en konstant masse, aabner fane 1 i stedet. */
    P.visSvar = function () {
        var t = this.trin();
        if (!t) return;
        if (t.type === "dom" && !this.sim.domKlar()) { this.sim.tilFane1(); return; }
        this.vist = true;
        this.trinVist = true;
        var liste = this.liste(t);
        if (liste && (t.type === "valg" || t.type === "dom")) {
            this.valgt = this.rigtigNr(liste);
            this.valgtSvar = liste[this.valgt];
        }
        this.formelOk = true;
        this.sim.journalSvar();
        this.trinLoest();
    };

    P.saetBesked = function (h, klasse) {
        this.besked = { html: h || "", klasse: klasse || "" };
        if (this.fri && h) this.lukket = false;
        this.visKort();
    };

    P.ryst = function () {
        var e = this.el.bund;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    P.rystFelt = function () {
        var e = this.el.ind.querySelector(".kt-felt");
        if (!e) return;
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    P.blink = function () {
        var e = this.el.kort;
        if (this.fri && this.lukket) { this.lukket = false; this.visKort(); }
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Et klik i scenen, der ikke er bedt om: kortet blinker (REGELSAET 15) */
    P.spaer = function () { this.blink(); };

    /* ----- Kortet ----------------------------------------------------------------------- */
    P.chip = function () {
        if (this.fri) return "Fri leg";
        var o = this.opgave();
        return o.trin.length > 1 ? "Trin " + (this.trinNr + 1) + " af " + o.trin.length : "Opgave " + (this.nr + 1);
    };

    P.kortHTML = function () {
        var t = this.trin(), s = this.sim;
        if (!t) return "";
        var bliv = this.tilstand === "bliv";
        var tk = s.tekster(t, this.formelFase() ? "formel" : null), h = "";
        if (this.fri) h += '<button type="button" class="sk-luk" data-luk="1" title="Luk kortet" aria-label="Luk kortet">✕</button>';
        /* Indledningen falder vaek, naar kortet er groent: spoergsmaalet og
           svaret er det, der skal ses (som fane 1) */
        var indl = bliv ? "" : (tk.tekst || "");
        h += '<p class="sk-tekst' + (this.fri ? " sk-start" : "") + '"><span class="sk-chip">' + html(this.chip()) + "</span>" +
            (indl ? html(indl) + " " : "") + '<span class="sk-spm' + (indl ? " sk-linje" : "") + '">' + html(tk.spm) + "</span></p>";
        var liste = this.liste(t);
        if (liste) h += this.svarHTML(liste, bliv);
        else if (t.type === "afstem") h += this.afstemHTML(bliv);
        else if (t.type === "regn") h += this.feltHTML(t, bliv);
        if (bliv) {
            var o = this.opgave(), sidste = this.trinNr >= o.trin.length - 1;
            var knap = !sidste ? "Næste →" : (this.fri ? D.HYP_FRI.nye : (this.nr < this.opg.length - 1 ? "Næste opgave →" : "Videre til Fejlkilder →"));
            h += blivHTML(html(this.slutTekst), this.trinVist ? "Svaret" : "✓ Rigtigt", knap, this.trinVist ? "svar" : "god");
        }
        return h;
    };

    /* Feltet i kortet: "n(NaHCO₃) = [   ] mol". Med den valgte formel foran.
       Naar trinet er loest, staar svaret groent (gult, naar det blev vist). */
    P.feltHTML = function (t, bliv) {
        var s = this.sim, h = '<div class="kt-felt-plads">';
        if (t.formler) {
            var F = D.FORMLER[t.formler].svar;
            h += '<span class="kf-formel">' + F[this.rigtigNr(F)].h + "</span>";
        }
        if (bliv) {
            h += '<span class="kt-felt ' + (this.trinVist ? "svar" : "ok") + '"><span class="kf-svar">' + html(s.svarLinje(t.felt)) +
                '</span><span class="kf-maerke">' + (this.trinVist ? "↩" : "✓") + "</span></span>";
        } else {
            h += '<span class="kt-felt"><span class="kf-pre">' + html(s.venstre(t.felt)) + " =</span>" +
                '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="tallet" aria-label="' +
                html(s.venstre(t.felt)) + '"><span class="kf-enhed">' + html(s.enhed(t.felt)) + "</span></span>";
        }
        return h + "</div>";
    };

    /* Afstemningen i kortet: et lille felt foran hvert stof */
    P.afstemHTML = function (bliv) {
        var s = this.sim, h = '<div class="kt-felt-plads">';
        if (bliv) {
            return h + '<span class="kt-felt ' + (this.trinVist ? "svar" : "ok") + '"><span class="kf-svar">' + html(s.skemaTekst()) +
                '</span><span class="kf-maerke">' + (this.trinVist ? "↩" : "✓") + "</span></span></div>";
        }
        h += '<span class="kt-felt kt-afstem">';
        s.stoffer().forEach(function (st, i) {
            if (i === 1) h += '<span class="ka-tegn">→</span>';
            else if (i > 1) h += '<span class="ka-tegn">+</span>';
            h += '<input type="text" inputmode="numeric" autocomplete="off" spellcheck="false" maxlength="2" data-i="' + i +
                '" aria-label="Tallet foran ' + html(st) + '"><span class="ka-stof">' + html(st) + "</span>";
        });
        return h + "</span></div>";
    };

    P.svarHTML = function (liste, bliv) {
        var mig = this, rigtig = this.rigtigNr(liste);
        var h = '<div class="sk-svar n' + liste.length + '">';
        liste.forEach(function (sv, i) {
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
                "><span>" + (sv.h || html(sv.t)) + "</span></button>";
        });
        return h + "</div>";
    };

    P.visKort = function () {
        var t = this.trin(), bliv = this.tilstand === "bliv";
        var kl = "scenekort " + (bliv ? "loest bliv" + (this.trinVist ? " svar" : "") : (this.svarListe() ? "spm" : "opgave"));
        if (this.el.kort.className.replace(" blink", "") !== kl) this.el.kort.className = kl;
        var h = this.kortHTML();
        if (this._sidstInd !== h) {
            var gammel = document.activeElement && this.el.ind.contains(document.activeElement) ? document.activeElement : null;
            var fokusI = gammel ? gammel.getAttribute("data-i") : null;
            this.el.ind.innerHTML = h;
            this._sidstInd = h;
            var mig = this;
            Array.prototype.forEach.call(this.el.ind.querySelectorAll("input"), function (inp) {
                var i = inp.getAttribute("data-i");
                if (i !== null) { if (mig.afUdkast[i]) inp.value = mig.afUdkast[i]; }
                else if (mig.udkast) inp.value = mig.udkast;
            });
            if (gammel) {
                var ny = fokusI !== null ? this.el.ind.querySelector('input[data-i="' + fokusI + '"]') : this.el.ind.querySelector("input");
                if (ny) try { ny.focus({ preventScroll: true }); } catch (e) { ny.focus(); }
            }
        }
        this.visBund();
        this.el.kort.hidden = !!(this.fri && this.lukket);
        if (this.sim.kortSkiftet) this.sim.kortSkiftet();
        return t;
    };

    /* Kortets nederste raekke: beskeden, hintknappen og Indsend svar */
    P.visBund = function () {
        var b = this.besked || { html: "", klasse: "" };
        var aktiv = this.tilstand === "trin" && !!this.trin();
        this.el.bund.hidden = !aktiv;
        if (!aktiv) return;
        if (this.el.besked.innerHTML !== b.html) this.el.besked.innerHTML = b.html;
        this.el.besked.hidden = !b.html;
        var ryster = this.el.bund.classList.contains("ryster");
        this.el.bund.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom") + (ryster ? " ryster" : "");
        var n = this.hints().length;
        var k = this.el.knap;
        var kt = this.hjaelp === 0 && n ? "Giv et hint" : (this.hjaelp < n ? "Næste hint (" + (this.hjaelp + 1) + " af " + n + ")" : "Vis svaret");
        if (k.textContent !== kt) k.textContent = kt;
        k.className = "knap hjaelp" + (this.hjaelp >= n ? " svar" : "") + (this.peger ? " peg" : "");
        this.visIndsend();
    };

    P.visIndsend = function () {
        var e = this.el.indsend, t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        /* Venter dommen paa fane 1, er der intet at sende */
        e.hidden = t.type === "dom" && !this.sim.domKlar();
        var kan = this.kanSendes();
        e.className = "knap indsend " + (kan ? "klar" : "ikke-klar");
        e.setAttribute("aria-disabled", kan ? "false" : "true");
    };

    /* Feltet i kortet faar fokus, saa eleven kan skrive med det samme.
       i: afstemningens felt (ellers det foerste tomme) */
    P.fokus = function (i) {
        if (this.tilstand !== "trin" || (this.fri && this.lukket)) return;
        var fane = NK.el("fane-hypoteser");
        if (!fane || !fane.classList.contains("aktiv") || document.querySelector(".overlay.vis") ||
            (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        var inp = null;
        if (i !== undefined && i !== null) inp = this.el.ind.querySelector('input[data-i="' + i + '"]');
        if (!inp) {
            var alle = this.el.ind.querySelectorAll("input");
            for (var j = 0; j < alle.length && !inp; j++) if (!alle[j].value) inp = alle[j];
            if (!inp) inp = alle[0] || null;
        }
        if (!inp) return;
        try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
    };

    /* Enter: Indsend svar, eller videre, naar kortet er groent */
    P.enter = function () {
        if (this.tilstand === "bliv") this.videre();
        else if (this.tilstand === "trin") this.indsendKlik();
    };

    /* ----- Kortets plads ----------------------------------------------------------------
       Det hoejeste, kortet kan blive: hvert trin i hver opgave i hver fase med
       hvert hint, hver forklaring til et forkert svar, typiske fejlbeskeder og
       det groenne kort, og den fri leg med hver hypotese. Maalt i en usynlig
       kopi af kortet i samme bredde med de laengste tal (REGELSAET 4). */
    var GEMT = ["el", "nr", "trinNr", "tilstand", "fri", "alle", "friOpg", "friHyp", "besked", "valgt", "forkert", "hjaelp",
        "trinVist", "_sidstInd", "fremme", "lukket", "vist", "peger", "formelOk", "udkast", "afUdkast", "slutTekst", "pause"];

    P.maalZone = function (kopi) {
        var mig = this, s = this.sim;
        var gemt = {};
        GEMT.forEach(function (k) { gemt[k] = mig[k]; });
        var ind = kopi.children[0], bund = kopi.children[1];
        ind.innerHTML = "";
        this.el = { kort: kopi, ind: ind, bund: bund, besked: bund.querySelector(".st-tekst"),
            knap: bund.querySelector(".knap.hjaelp"), indsend: bund.querySelector(".knap.indsend"),
            liste: gemt.el.liste, reak: gemt.el.reak, forfra: gemt.el.forfra, fri: gemt.el.fri };
        var hoejst = 0;
        function maal() { mig._sidstInd = null; mig.kortHTMLmaal(); hoejst = Math.max(hoejst, kopi.offsetHeight); }
        function trinMaal(o) {
            s.medOpgave(o, function () {
                o.trin.forEach(function (t, j) {
                    mig.trinNr = j;
                    var faser = t.type === "regn" && t.formler ? [false, true] : [true];
                    faser.forEach(function (fok) {
                        mig.tilstand = "trin"; mig.formelOk = fok; mig.valgt = -1; mig.forkert = {}; mig.hjaelp = 0;
                        mig.trinVist = false; mig.peger = false;
                        var beskeder = [""];
                        mig.hints().forEach(function (h, k) { beskeder.push('<span class="b-maerke">Hint ' + (k + 1) + " af 3</span>" + html(h)); });
                        (mig.liste(t) || []).forEach(function (sv) { if (sv.nej) beskeder.push('<span class="b-maerke">Ikke rigtigt</span>' + html(sv.nej)); });
                        if (t.formler && fok) beskeder.push('<span class="b-maerke">Rigtigt</span>' + html(D.FORMLER[t.formler].godt));
                        s.fejlProever(t, fok).forEach(function (b) { beskeder.push('<span class="b-maerke">Ikke rigtigt</span>' + html(b)); });
                        if (mig.fri) beskeder.push(html(D.HYP_FRI.alle));
                        beskeder.forEach(function (b) { mig.besked = { html: b, klasse: b ? "hint" : "" }; maal(); });
                    });
                    mig.besked = { html: "", klasse: "" };
                    mig.tilstand = "bliv";
                    mig.formelOk = true;
                    var liste = mig.liste(t);
                    mig.valgt = liste ? mig.rigtigNr(liste) : -1;
                    s.slutProever(t).forEach(function (sl) {
                        mig.slutTekst = sl;
                        [false, true].forEach(function (v) { mig.trinVist = v; maal(); });
                    });
                });
            });
        }
        this.fri = false;
        this.alle = false;
        this.opg.forEach(function (o, i) { mig.nr = i; trinMaal(o); });
        this.fri = true;
        D.HYP_IDS.forEach(function (h) {
            mig.friOpg = { id: "fri", navn: "Hypotese " + h, hyp: h, mf: 5.45, trin: D.HYP_FRI_TRIN };
            trinMaal(mig.friOpg);
        });
        for (var k in gemt) if (Object.prototype.hasOwnProperty.call(gemt, k)) this[k] = gemt[k];
        this._sidstInd = null;
        return hoejst;
    };

    /* Kortet i kopien: indholdet og den nederste raekke, som visKort og visBund */
    P.kortHTMLmaal = function () {
        var bliv = this.tilstand === "bliv";
        this.el.kort.className = "scenekort " + (bliv ? "loest bliv" + (this.trinVist ? " svar" : "") : "opgave");
        this.el.ind.innerHTML = this.kortHTML();
        var b = this.besked || { html: "", klasse: "" };
        this.el.bund.hidden = bliv;
        if (!bliv) {
            this.el.besked.innerHTML = b.html;
            this.el.besked.hidden = !b.html;
            this.el.bund.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom");
            this.el.knap.textContent = "Næste hint (2 af 3)";
            this.el.indsend.hidden = false;
        }
    };
}());
