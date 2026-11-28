/* =====================================================================
   forsoeg_opgaver.js - opgaverne paa fane 1 (Varm og vej)

   Runde T13 (28. nov. 2026, Niels: "Ja byg det gerne med A"). Bygget paa
   motoren fra sc4.7 (vand_opgaver.js, T11) og sc5.6 (vej_opgaver.js,
   T12). Fire slags trin (D.OPG_FORSOEG i js/data.js):
     gaet      tre korte svar i kortet. Et gaet er gratis: et klik vaelger
               og gaar videre, og intet er rigtigt eller forkert.
     handling  "Sæt diglen på trefoden." Kun det, der skal bruges
               (trin.tillad), kan bruges, og det har gul ring og et skilt
               (trin.el, trin.boble). Kortet gaar selv videre ca. 1 s
               efter, at scenen staar paa maalet (REGELSAET 33, 39).
     felt      tallet fra vaegten skrives i et felt i kortet, og Indsend
               svar sender det (sim.tjekFelt).
     vej       opgave 3: varm og vej igen. Kortet siger det naeste skridt
               efter scenens fase (D.VEJ_FASE). Naar diglen staar paa
               vaegten, har kortet feltet. Efter hver vejning bliver kortet
               groent, og Næste giver det samme trin igen, til massen er
               konstant.

     * Opgaverne i fast raekkefoelge i raekken oeverst i scenen. Titlerne
       laases op i takt (REGELSAET 3, 17). Panelet er vaek.
     * Efter et rigtigt svar bliver kortet groent med et stort "✓ Rigtigt",
       til eleven trykker Næste (REGELSAET 66).
     * Hinttrappe: Giv et hint › Næste hint › Vis svaret. Vis svaret goer
       handlingen i scenen eller skriver tallet, naar vaegten staar stille.
     * Loeste opgaver gemmes i browseren. En loest opgave har alt fremme
       (REGELSAET 16); Start forfra giver trinene igen fra samme digel
       (opgave 1: en ny digel).
     * Fri leg (REGELSAET 57) under Start forfra: alt i scenen kan bruges,
       og Tilbage til opgaverne bringer eleven tilbage til samme sted.
       Efter sidste opgave er fri leg slaaet til.
     * maalZone(kopi): det hoejeste, kortet kan blive, maalt i en usynlig
       kopi, saa scenen aldrig hopper (REGELSAET 4).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var GEM = "nk-sc5.8-forsoeg-opg";
    var VENT = 1.0;                 /* sekunder paa maalet, foer kortet gaar videre */
    var FELT_FASER = { vaegtVent: true, vej: true };

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

    /* Det groenne kort (REGELSAET 66): "✓ Rigtigt" stort med Næste ved siden
       af og forklaringen i hele kortets bredde under */
    function blivHTML(tekstHtml, maerke, knap, slags) {
        return '<div class="sk-bund vbliv ' + slags + '"><div class="vb-top">' +
            '<span class="b-maerke">' + maerke + "</span>" +
            (knap ? '<button type="button" class="sk-videre" data-videre="1">' + knap + "</button>" : "") + "</div>" +
            (tekstHtml ? '<p class="st-tekst">' + tekstHtml + "</p>" : "") + "</div>";
    }

    NK.ForsoegOpgaver = function (sim, opgaver) {
        this.sim = sim;
        this.opg = opgaver;
        this.status = laes();
        this.nr = -1;
        this.trinNr = 0;
        this.tilstand = "trin";
        this.fri = false;
        this.pause = null;
        this.nulTrin();

        var mig = this;
        this.el = {
            kort: NK.el("forsoeg-skort"), ind: NK.el("forsoeg-ind"), bund: NK.el("forsoeg-bund"),
            besked: NK.el("forsoeg-besked"), knap: NK.el("forsoeg-hjknap"), indsend: NK.el("forsoeg-indsend"),
            liste: NK.el("forsoeg-liste"), forfra: NK.el("forsoeg-forfra"), fri: NK.el("forsoeg-frileg"), ny: NK.el("forsoeg-ny")
        };
        this.el.fri.addEventListener("click", function () { if (mig.fri) mig.tilbage(); else mig.friLeg(); });
        this.el.knap.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        this.el.forfra.addEventListener("click", function () { mig.forfra(); });
        this.el.ny.addEventListener("click", function () { mig.nyDigel(); });
        this.el.ind.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || b.disabled) return;
            if (b.hasAttribute("data-videre")) { mig.videre(); return; }
            if (b.hasAttribute("data-tilbage")) { mig.tilbage(); return; }
            if (b.hasAttribute("data-noter")) { mig.sim.friNoter(); return; }
            if (b.hasAttribute("data-luk")) { mig.lukket = true; mig.besked = { html: "", klasse: "" }; mig.visKort(); return; }
            if (b.hasAttribute("data-nr")) mig.vaelg(parseInt(b.getAttribute("data-nr"), 10));
        });
        /* Feltet i kortet: Enter sender ind (eller gaar videre, naar kortet er groent) */
        this.el.ind.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" || !e.target || e.target.tagName !== "INPUT") return;
            e.preventDefault();
            e.stopPropagation();
            if (mig.tilstand === "bliv") mig.videre();
            else mig.indsendKlik();
        });
        this.el.ind.addEventListener("input", function (e) {
            if (!e.target || e.target.tagName !== "INPUT") return;
            mig.udkast = e.target.value;
            e.target.classList.remove("forkert");
            if (mig.besked && mig.besked.klasse === "skidt") mig.saetBesked("", "");
            mig.visIndsend();
        });

        this.bygRaekke();
    };

    var P = NK.ForsoegOpgaver.prototype;

    /* Kaldes af fanen, naar scenen er klar */
    P.start = function () {
        if (this.alleLoest()) this.visResultat(true);
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

    /* Har kortet feltet til vaegtens tal lige nu? */
    P.feltNu = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return false;
        if (t.type === "felt") return true;
        if (t.type === "vej") return !!FELT_FASER[this.sim.fase()];
        return false;
    };

    /* Teksterne i trinet. Et "vej"-trin henter spoergsmaal, ring og hint
       fra fasen (D.VEJ_FASE). */
    P.del = function (t, navn) {
        if (t.type === "vej") {
            var f = NK.Data.VEJ_FASE[this.sim.fase()] || {};
            if (navn === "el") return this.sim.vejEl(f);
            if (f[navn] !== undefined) return f[navn];
        }
        return tekstAf(t[navn], this.sim);
    };

    P.hints = function () {
        var t = this.trin();
        if (!t || t.type === "gaet") return [];
        var mig = this;
        return (this.del(t, "hint") || []).map(function (h) { return tekstAf(h, mig.sim); });
    };

    /* ----- Det, scenen maa ------------------------------------------------------- */
    /* Maa tingen bruges nu? hvad: "digel" eller "knapper".
       Under et spoergsmaal kan intet bruges (REGELSAET 19a). */
    P.tillad = function (hvad) {
        if (this.erFri()) return true;
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return false;
        return (tekstAf(t.tillad, this.sim) || []).indexOf(hvad) >= 0;
    };

    /* Det, der har gul ring og skilt, til eleven har brugt det */
    P.opfordring = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t || t.type === "gaet" || t.type === "felt") return null;
        if (t.type === "handling" && t.maal(this.sim)) return null;
        var el = this.del(t, "el");
        if (!el || this.brugt[el]) return null;
        return { el: el, tekst: this.del(t, "boble") || "" };
    };

    /* Det, kortet handler om lige nu, faar en rolig gul ring (trin.om) */
    P.om = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return [];
        if (t.type === "vej") return this.feltNu() ? ["display"] : (this.sim.fase() === "varm" ? ["lup"] : []);
        return tekstAf(t.om, this.sim) || [];
    };

    /* Eleven har taget fat i tingen: skiltet forsvinder */
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
        fk.hidden = this.erFri() && !this.fri;
        var ft = this.fri ? "Tilbage til opgaverne" : "Fri leg";
        if (fk.textContent !== ft) fk.textContent = ft;
        fk.classList.toggle("valgt", !!this.fri);
        this.el.ny.hidden = !this.erFri();
        this.opg.forEach(function (o, i) {
            var b = mig.knapper[i], s = mig.status[o.id];
            var aaben = !!s || i === mig.nr || (!alle && i === foerste);
            b.classList.toggle("laast", !aaben);
            b.disabled = !aaben;
            b.classList.toggle("valgt", i === mig.nr && !mig.erFri());
            b.classList.toggle("loest", !!s);
            b.classList.toggle("stjerne", s === "stjerne");
            saetTekstEl(b.querySelector(".or-nr"), s === "stjerne" ? "★" : (s ? "✓" : String(i + 1)));
            saetTekstEl(b.querySelector(".or-navn"), aaben ? o.navn : "");
            b.title = aaben ? o.navn : "Låses op, når de forrige opgaver er løst";
        });
        var l = this.el.liste;
        l.classList.remove("kompakt");
        if (l.scrollWidth > l.clientWidth + 1) l.classList.add("kompakt");
    };

    /* ----- Opgaver og trin ----------------------------------------------------------- */
    P.aabn = function (nr, forfra) {
        this.fri = false;
        this.pause = null;
        this.nr = NK.klamp(nr, 0, this.opg.length - 1);
        var o = this.opgave();
        this.tilstand = "trin";
        this.trinNr = 0;
        this.vist = false;
        this.fejlet = false;
        this.fremme = !forfra && !!this.status[o.id];
        this.sim.nyOpgave(this.nr, this.fremme, !!forfra);
        if (this.fremme) {
            /* En loest opgave har alt fremme: kortet staar groent paa sidste trin (REGELSAET 16) */
            this.trinNr = o.trin.length - 1;
            this.nulTrin();
            var t = this.trin();
            if (t.type === "gaet") this.valgt = this.gaetNr(t);
            this.blivPaa(t, tekstAf(t.slut, this.sim) || this.sim.fremmeSlut(t), false);
            this.feltSvar = this.sim.sidsteMasseTekst();
            this.visRaekke();
            this.visKort();
            return;
        }
        this.nytTrin();
    };

    /* Det gaet, der er gemt for et gaet-trin (opgave 4: NK.gaet) */
    P.gaetNr = function (t) {
        var id = this.sim.gemtGaet(t);
        for (var i = 0; i < t.svar.length; i++) if (t.svar[i].id === id) return i;
        return -1;
    };

    P.nulTrin = function () {
        this.valgt = -1;
        this.forkert = {};
        this.hjaelp = 0;
        this.besked = { html: "", klasse: "" };
        this.peger = false;
        this.udkast = "";
        this.trinVist = false;
        this.brugt = {};
        this.maalUr = 0;
        this.venterSvar = false;
        this.gentag = false;
        this.frys = null;
        this.slutTekst = "";
        this.sidstFase = null;
    };

    P.nytTrin = function () {
        this.nulTrin();
        this.tilstand = "trin";
        this.sidstFase = this.sim.fase();
        this.visRaekke();
        this.visKort();
        this.fokus();
    };

    /* Start forfra: den aabne opgave med trinene igen */
    P.forfra = function () {
        var nr = this.erFri() ? (this.pause ? this.pause.nr : 0) : this.nr;
        this.aabn(nr, true);
    };

    /* Ny digel i fri leg */
    P.nyDigel = function () {
        if (!this.erFri()) return;
        this.sim.nyMaaling(null);
        this.lukket = false;
        this.besked = { html: "", klasse: "" };
        this.visKort();
    };

    /* Fri leg: alt i scenen kan bruges. Tilbage til opgaverne bringer eleven
       tilbage til samme sted i opgaven, med diglen, som den var (REGELSAET 57) */
    P.friLeg = function () {
        if (this.erFri()) return;
        var mig = this;
        this.pause = { nr: this.nr, trinNr: this.trinNr, tilstand: this.tilstand, scene: this.sim.gemTilstand() };
        ["valgt", "gentag", "slutTekst", "frys", "feltSvar", "trinVist", "vist", "fejlet", "fremme", "udkast"].forEach(function (k) { mig.pause[k] = mig[k]; });
        this.fri = true;
        this.visResultat(false);
    };

    P.tilbage = function () {
        if (!this.fri) return;
        var p = this.pause, mig = this;
        this.fri = false;
        this.pause = null;
        if (!p) { this.aabn(this.foersteUloeste()); return; }
        this.sim.hentTilstand(p.scene);
        this.nr = p.nr;
        this.trinNr = p.trinNr;
        this.nulTrin();
        this.tilstand = p.tilstand;
        ["valgt", "gentag", "slutTekst", "frys", "feltSvar", "trinVist", "vist", "fejlet", "fremme", "udkast"].forEach(function (k) { mig[k] = p[k]; });
        this.sidstFase = this.sim.fase();
        this.visRaekke();
        this.visKort();
        this.fokus();
    };

    /* Kortet bliver paa spoergsmaalet: teksten fryses, saa den ikke skifter
       med scenen, mens kortet er groent */
    P.blivPaa = function (t, slut, gentag) {
        /* Indledningen falder vaek, naar kortet er groent: spoergsmaalet og
           svaret er det, der skal ses, og kortet bliver lavere */
        this.frys = { tekst: "", spm: t.type === "vej" ? NK.Data.VEJ_FASE.vej.spm : this.del(t, "spm") };
        this.tilstand = "bliv";
        this.gentag = !!gentag;
        this.slutTekst = slut || "";
        this.besked = { html: "", klasse: "" };
    };

    P.trinLoest = function (slut) {
        var o = this.opgave(), t = this.trin();
        if (!t) return;
        var sidste = this.trinNr >= o.trin.length - 1;
        var tekst = slut !== undefined ? slut : tekstAf(t.slut, this.sim);
        /* En handling uden forklaring gaar direkte videre. Har trinet en
           forklaring, bliver kortet groent med "✓ Rigtigt", til eleven
           trykker Næste (REGELSAET 66) */
        if (!sidste && !tekst && t.type === "handling") {
            this.trinNr++;
            this.nytTrin();
            return;
        }
        this.blivPaa(t, tekst, false);
        if (sidste) this.opgaveLoest();
        this.visRaekke();
        this.visKort();
    };

    P.opgaveLoest = function () {
        var o = this.opgave();
        var foer = this.status[o.id];
        this.status[o.id] = ((!this.vist && !this.fejlet) || foer === "stjerne") ? "stjerne" : "loest";
        this.gem();
    };

    /* Kortets groenne knap gaar altid fremad */
    P.videre = function () {
        if (this.tilstand !== "bliv") return;
        var o = this.opgave();
        if (this.gentag) { this.nytTrin(); return; }
        if (this.trinNr < o.trin.length - 1) {
            this.trinNr++;
            this.nytTrin();
            return;
        }
        if (this.nr < this.opg.length - 1) { this.aabn(this.nr + 1); return; }
        /* Efter sidste opgave: fri leg er slaaet til, og eleven kommer videre til fane 2 */
        this.visResultat(true);
        this.sim.naesteFane();
    };

    /* Alle er loest (eller fri leg): alt i scenen kan bruges */
    P.visResultat = function (alle) {
        if (alle) { this.fri = false; this.pause = null; }
        this.tilstand = "resultat";
        this.nulTrin();
        this.lukket = false;
        this.fremme = true;
        this.sim.friStart(!!alle);
        this.visRaekke();
        this.visKort();
    };

    /* ----- Svar, hint og Indsend svar ---------------------------------------------- */
    /* Et gaet er gratis: et klik vaelger og gaar videre */
    P.vaelg = function (i) {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t || t.type !== "gaet" || !t.svar[i]) return;
        this.valgt = i;
        if (t.gaet) t.gaet(this.sim, t.svar[i]);
        var o = this.opgave();
        if (this.trinNr < o.trin.length - 1) {
            this.trinNr++;
            this.nytTrin();
            return;
        }
        this.blivPaa(t, tekstAf(t.slut, this.sim), false);
        this.opgaveLoest();
        this.visRaekke();
        this.visKort();
    };

    P.kanSendes = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return false;
        if (this.feltNu()) return !!String(this.udkast || "").trim();
        if (t.type === "handling") return !!t.maal(this.sim);
        return false;
    };

    P.indsendKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        if (!this.kanSendes()) {
            this.blink();
            if (this.feltNu()) { this.saetBesked("Skriv tallet fra vægten i feltet først.", "peger"); this.fokus(); }
            return;
        }
        if (this.feltNu()) {
            var res = this.sim.tjekFelt(this.udkast);
            if (res.tom) { this.blink(); return; }
            if (!res.ok) {
                this.fejl(res.besked);
                var inp = this.el.ind.querySelector("input");
                if (inp) inp.classList.add("forkert");
                this.rystFelt();
                this.fokus();
                return;
            }
            this.feltOk("ok");
            return;
        }
        if (t.type === "handling") this.trinLoest();
    };

    /* Tallet fra vaegten er rigtigt: det skrives i skemaet */
    P.feltOk = function (maade) {
        var t = this.trin();
        if (!t) return;
        if (maade === "svar") this.trinVist = true;
        this.feltSvar = this.sim.visningTekst();
        this.udkast = "";
        var r = this.sim.noter(maade) || {};
        if (t.type === "vej" && !r.konstant) {
            this.blivPaa(t, r.slut, true);
            this.visRaekke();
            this.visKort();
            return;
        }
        this.trinLoest(t.type === "vej" ? r.slut : undefined);
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
        /* Staar scenen allerede paa maalet, gaar kortet selv videre om lidt */
        if (t.type === "handling" && t.maal(this.sim)) return;
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

    /* Vis svaret: en handling goeres af scenen selv, og et tal skrives ind,
       naar vaegten staar stille (tiden gaar hurtigere imens) */
    P.visSvar = function () {
        var t = this.trin();
        if (!t || t.type === "gaet") return;
        this.vist = true;
        if (this.feltNu()) {
            if (this.sim.kanAflaese()) { this.feltOk("svar"); return; }
            this.trinVist = true;
            this.venterSvar = true;
            this.sim.hurtig = 8;
            this.saetBesked('<span class="b-maerke">Svaret</span>' + html("Tiden går hurtigere, til diglen er kølet af, og tallet står stille."), "gul");
            return;
        }
        var tekst;
        if (t.type === "vej") tekst = this.sim.faseSvar();
        else {
            if (t.visSvar) t.visSvar(this.sim);
            tekst = tekstAf(t.svarTekst, this.sim);
            this.trinVist = true;
        }
        this.brugt[this.del(t, "el")] = true;
        this.saetBesked('<span class="b-maerke">Svaret</span>' + html(tekst || "Scenen viser det."), "gul");
    };

    P.saetBesked = function (h, klasse) {
        this.besked = { html: h || "", klasse: klasse || "" };
        if (this.erFri() && h) this.lukket = false;
        this.visKort();
    };

    /* En kort besked i den fri leg (fx natronglasset) */
    P.friBesked = function (tekst) {
        if (!this.erFri()) return;
        this.saetBesked(html(tekst), "peger");
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
        if (this.erFri() && this.lukket) { this.lukket = false; this.visKort(); }
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Et greb i scenen, der ikke er bedt om: kortet blinker (REGELSAET 15) */
    P.spaer = function () { this.blink(); };

    /* ----- Kortet ----------------------------------------------------------------------- */
    P.chip = function () {
        var o = this.opgave(), t = this.trin();
        if (t && t.type === "gaet" && this.tilstand === "trin") return "Gæt";
        return o.trin.length > 1 ? "Trin " + (this.trinNr + 1) + " af " + o.trin.length : "Opgave " + (this.nr + 1);
    };

    P.kortHTML = function () {
        var t = this.trin(), s = this.sim, F = NK.Data.FORSOEG_FRI, h = "";
        if (this.erFri()) {
            h = '<button type="button" class="sk-luk" data-luk="1" title="Luk kortet" aria-label="Luk kortet">✕</button>' +
                '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Fri leg</span>' +
                html(this.fri ? F.pause : F.alle) + "</p>";
            var n = s.kanNoteres();
            if (n) h += '<div class="sk-fri-knapper"><button type="button" class="sk-videre sk-noter" data-noter="1">Skriv ' + html(n) + " g i skemaet</button></div>";
            return h + "</div>";
        }
        if (!t) return "";
        var bliv = this.tilstand === "bliv";
        var indl = bliv && this.frys ? this.frys.tekst : this.del(t, "tekst");
        var spm = bliv && this.frys ? this.frys.spm : this.del(t, "spm");
        var tekst;
        if (t.type === "gaet") tekst = NK.Papir.tekst(html((indl ? indl + " " : "") + spm));
        else tekst = (indl ? html(indl) + " " : "") + '<span class="sk-spm' + (indl ? " sk-linje" : "") + '">' + html(spm) + "</span>";
        h = '<p class="sk-tekst"><span class="sk-chip">' + html(this.chip()) + "</span>" + tekst + "</p>";
        if (t.type === "gaet") h += this.svarHTML(t, bliv);
        if (this.feltNu() || (bliv && (t.type === "felt" || t.type === "vej"))) h += this.feltHTML(t, bliv);
        if (bliv) {
            var o = this.opgave(), sidste = this.trinNr >= o.trin.length - 1;
            var knap = this.gentag || !sidste ? "Næste →" : (this.nr < this.opg.length - 1 ? "Næste opgave →" : "Videre til Hypoteserne →");
            if (t.type === "gaet") {
                var sv = t.svar[this.valgt];
                h += blivHTML(html(this.slutTekst), "Dit gæt: " + html(sv ? sv.t : ""), knap, "gaet");
            } else {
                h += blivHTML(html(this.slutTekst), this.trinVist ? "Svaret" : "✓ Rigtigt", knap, this.trinVist ? "svar" : "god");
            }
        }
        return h;
    };

    /* Feltet i kortet: "Vægten viser [   ] g". Naar trinet er loest, staar
       tallet groent (gult, naar det blev vist). */
    P.feltHTML = function (t, bliv) {
        var pre = this.del(t, "pre") || "Vægten viser";
        if (bliv) {
            return '<div class="kt-felt-plads"><span class="kt-felt ' + (this.trinVist ? "svar" : "ok") + '"><span class="kf-svar">' +
                html(pre + " " + (this.feltSvar || "") + " g") + '</span><span class="kf-maerke">' + (this.trinVist ? "↩" : "✓") + "</span></span></div>";
        }
        return '<div class="kt-felt-plads"><span class="kt-felt"><span class="kf-pre">' + html(pre) + "</span>" +
            '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="tallet" aria-label="' +
            html(pre) + '"><span class="kf-enhed">g</span></span></div>';
    };

    P.svarHTML = function (t, bliv) {
        var mig = this;
        var h = '<div class="sk-svar n' + t.svar.length + '">';
        t.svar.forEach(function (sv, i) {
            var k = "sk-knap";
            if (i === mig.valgt) k += " valgt";
            else if (bliv) k += " dim";
            h += '<button type="button" class="' + k + '" data-nr="' + i + '"' + (bliv ? " disabled" : "") +
                "><span>" + html(sv.t) + "</span></button>";
        });
        return h + "</div>";
    };

    P.visKort = function () {
        var t = this.trin(), kl;
        if (this.erFri()) kl = "scenekort loest";
        else if (t) {
            var bliv = this.tilstand === "bliv";
            kl = "scenekort " + (bliv ? "loest bliv" + (t.type === "gaet" ? " gaet" : (this.trinVist ? " svar" : "")) :
                (t.type === "gaet" ? "spm" : "opgave"));
        }
        if (kl && this.el.kort.className.replace(" blink", "") !== kl) this.el.kort.className = kl;
        var h = this.kortHTML();
        if (this._sidstInd !== h) {
            var gammel = this.el.ind.querySelector("input");
            var fokus = gammel && document.activeElement === gammel;
            this.el.ind.innerHTML = h;
            this._sidstInd = h;
            var inp = this.el.ind.querySelector("input");
            if (inp && this.udkast) inp.value = this.udkast;
            if (inp && fokus) try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
        }
        this.visBund();
        this.el.kort.hidden = this.erFri() && !!this.lukket && !(this.besked && this.besked.html);
    };

    /* Kortets nederste raekke: beskeden, hintknappen og Indsend svar */
    P.visBund = function () {
        var b = this.besked || { html: "", klasse: "" };
        var fri = this.erFri() && !!b.html;
        var t = this.trin();
        var aktiv = (this.tilstand === "trin" && t && t.type !== "gaet") || fri;
        this.el.bund.hidden = !aktiv;
        if (!aktiv) return;
        this.el.knap.hidden = fri;
        if (this.el.besked.innerHTML !== b.html) this.el.besked.innerHTML = b.html;
        this.el.besked.hidden = !b.html;
        var ryster = this.el.bund.classList.contains("ryster");
        this.el.bund.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom") + (ryster ? " ryster" : "");
        if (fri) { this.el.indsend.hidden = true; return; }
        var n = this.hints().length;
        var k = this.el.knap;
        /* Mens scenen viser svaret, er hintknappen vaek */
        k.hidden = !!this.venterSvar || (!!this.trinVist && t.type === "handling");
        var kt = this.hjaelp === 0 && n ? "Giv et hint" : (this.hjaelp < n ? "Næste hint (" + (this.hjaelp + 1) + " af " + n + ")" : "Vis svaret");
        if (k.textContent !== kt) k.textContent = kt;
        k.className = "knap hjaelp" + (this.hjaelp >= n ? " svar" : "") + (this.peger ? " peg" : "");
        this.visIndsend();
    };

    P.visIndsend = function () {
        var e = this.el.indsend, t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        /* Et vej-trin uden felt har ingen Indsend svar: scenen gaar selv videre */
        var vis = t.type === "felt" || t.type === "handling" || this.feltNu();
        e.hidden = !vis;
        if (!vis) return;
        if (e.textContent !== "Indsend svar") e.textContent = "Indsend svar";
        var kan = this.kanSendes();
        e.className = "knap indsend " + (kan ? "klar" : "ikke-klar");
        e.setAttribute("aria-disabled", kan ? "false" : "true");
    };

    /* Feltet i kortet faar fokus, saa eleven kan skrive med det samme */
    P.fokus = function () {
        if (this.tilstand !== "trin") return;
        var fane = NK.el("fane-forsoeg");
        if (!fane || !fane.classList.contains("aktiv") || document.querySelector(".overlay.vis") ||
            (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        var inp = this.el.ind.querySelector("input");
        if (!inp) return;
        try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
    };

    /* Enter: Indsend svar, eller videre, naar kortet er groent */
    P.enter = function () {
        if (this.tilstand === "bliv") this.videre();
        else if (this.tilstand === "trin") this.indsendKlik();
    };

    /* ----- Hvert billede ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        if (this.erFri()) {
            /* Knappen "Skriv ... g i skemaet" foelger vaegten */
            var n = this.sim.kanNoteres() || "";
            if (n !== this._noter) { this._noter = n; this.visKort(); }
            return;
        }
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        if (t.type === "vej") {
            var f = this.sim.fase();
            if (f !== this.sidstFase) {
                var varFelt = !!FELT_FASER[this.sidstFase];
                this.sidstFase = f;
                this.hjaelp = 0;
                this.brugt = {};
                this.peger = false;
                if (!this.venterSvar && this.besked.klasse !== "skidt") this.besked = { html: "", klasse: "" };
                if (!this.venterSvar) this.trinVist = false;
                this.visKort();
                if (FELT_FASER[f] && !varFelt) this.fokus();
            }
        }
        if (this.venterSvar && this.sim.kanAflaese()) { this.venterSvar = false; this.feltOk("svar"); return; }
        if (t.type === "handling") {
            if (t.maal(this.sim)) {
                this.maalUr += dt;
                if (this.maalUr >= (t.vent || VENT)) { this.trinLoest(); return; }
            } else {
                this.maalUr = 0;
            }
        }
        /* Teksterne kan foelge scenen (fx naar braenderen slukker) */
        this.visKort();
        var kan = this.kanSendes();
        if (kan !== this._kan) { this._kan = kan; this.visIndsend(); }
    };

    /* ----- Kortets plads ----------------------------------------------------------------
       Det hoejeste, kortet kan blive: hvert trin i hver opgave med hvert hint,
       hver fejlbesked, hver fase i opgave 3, det groenne kort og den fri leg,
       maalt i en usynlig kopi af kortet i samme bredde. Teksterne med tal
       maales med de laengste tal (sim.maaleSim). */
    P.maalZone = function (kopi) {
        var mig = this, D = NK.Data;
        var gemt = {};
        ["el", "sim", "nr", "trinNr", "tilstand", "fri", "besked", "valgt", "forkert", "hjaelp", "trinVist", "_sidstInd",
            "fremme", "lukket", "vist", "peger", "brugt", "_kan", "frys", "slutTekst", "gentag", "feltSvar", "udkast",
            "venterSvar", "sidstFase", "maalUr", "pause"].forEach(function (k) { gemt[k] = mig[k]; });
        var ind = kopi.children[0], bund = kopi.children[1];
        ind.innerHTML = "";
        this.el = { kort: kopi, ind: ind, bund: bund, besked: bund.querySelector(".st-tekst"),
            knap: bund.querySelector(".knap.hjaelp"), indsend: bund.querySelector(".knap.indsend"),
            liste: gemt.el.liste, forfra: gemt.el.forfra, fri: gemt.el.fri, ny: gemt.el.ny };
        var aegte = gemt.sim, hoejst = 0;
        function maal() { mig._sidstInd = null; mig.visKort(); hoejst = Math.max(hoejst, kopi.offsetHeight); }
        var fejlTekster = aegte.fejlTekster().concat(["Skriv tallet fra vægten i feltet først."]);
        var faser = Object.keys(D.VEJ_FASE);
        this.fri = false;
        this.fremme = false;
        this.opg.forEach(function (o, i) {
            o.trin.forEach(function (t, j) {
                (t.type === "vej" ? faser : [null]).forEach(function (f) {
                    mig.sim = aegte.maaleSim(f);
                    mig.nr = i; mig.trinNr = j; mig.valgt = -1; mig.hjaelp = 0; mig.peger = false; mig.brugt = {};
                    mig.tilstand = "trin"; mig.trinVist = false; mig.frys = null; mig.gentag = false; mig.venterSvar = false;
                    var beskeder = [""];
                    mig.hints().forEach(function (h, k) { beskeder.push('<span class="b-maerke">Hint ' + (k + 1) + " af 3</span>" + html(h)); });
                    if (t.svarTekst) beskeder.push('<span class="b-maerke">Svaret</span>' + html(tekstAf(t.svarTekst, mig.sim)));
                    if (mig.feltNu()) {
                        fejlTekster.forEach(function (b) { beskeder.push('<span class="b-maerke">Ikke rigtigt</span>' + html(b)); });
                        beskeder.push('<span class="b-maerke">Svaret</span>' + html("Tiden går hurtigere, til diglen er kølet af, og tallet står stille."));
                    }
                    if (t.type === "vej") beskeder.push('<span class="b-maerke">Svaret</span>' + html(mig.sim.faseSvarTekst(f)));
                    if (t.type !== "gaet") beskeder.push(html(D.FORSOEG_FRI.ikkeTrefod));
                    beskeder.forEach(function (b) { mig.besked = { html: b, klasse: b ? "hint" : "" }; maal(); });
                    /* Det groenne kort */
                    if (t.type === "handling" && !t.slut) return;
                    mig.besked = { html: "", klasse: "" };
                    var slutter = t.type === "vej" ? mig.sim.vejSlutTekster() : [tekstAf(t.slut, mig.sim) || ""];
                    if (t.type === "gaet") mig.valgt = 1;
                    slutter.forEach(function (sl) {
                        [false, true].forEach(function (v) {
                            mig.tilstand = "trin";
                            mig.trinVist = v;
                            mig.feltSvar = "5,45";
                            mig.blivPaa(t, sl, t.type === "vej");
                            maal();
                        });
                    });
                });
            });
        });
        this.sim = aegte.maaleSim(null);
        this.tilstand = "resultat";
        this.nr = -1;
        this.besked = { html: "", klasse: "" };
        [true, false].forEach(function (f) {
            mig.fri = f; mig.lukket = false;
            mig.besked = { html: "", klasse: "" }; maal();
            mig.besked = { html: html(D.FORSOEG_FRI.ingenStart), klasse: "peger" }; maal();
            mig.besked = { html: html(D.KRUKKE), klasse: "peger" }; maal();
        });
        for (var k in gemt) if (Object.prototype.hasOwnProperty.call(gemt, k)) this[k] = gemt[k];
        this._sidstInd = null;
        return hoejst;
    };
}());
