/* =====================================================================
   sim_forudsig.js - fane 3: forudsig

   Spaendingsraekken (K.RAEKKE) haenger foroven. En metalstang haenger i
   et stativ over et glas med en oploesning, fx jern over kobber(II)-
   sulfat. Eleven svarer foerst, om der sker noget. Saa kommer stangen
   ned, og glasset og luppen viser svaret. Sker der noget, vaelger eleven
   de to stoffer, der dannes, og afstemmer til sidst skemaet, saa der
   afgives lige saa mange elektroner, som der optages.

   De foerste tolv opgaver staar i D.OPGAVER, fra det lette til det
   svaere. Bagefter kommer tilfaeldige par af stang og oploesning.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE_ROS = "nk-sc8.1-ros-forudsig";
    var NED = 0.8;               /* sekunder om at saenke stangen */
    var SE = 2.2;                /* sekunder i glasset, foer svaret vises */

    function SimForudsig() {
        this.L = new NK.Laerred(NK.el("fu-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.lup = new NK.Lup();
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.nr = -1;
        this.rigtige = 0;
        this.besvarede = 0;
        this.log = [];
        this.brugt = {};
        this.tilfaeldige = [];
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyOpgave();
    }

    var P = SimForudsig.prototype;

    /* ----- Opgaverne ------------------------------------------------------------------ */
    P.naestePar = function () {
        if (this.nr < D.OPGAVER.length) return D.OPGAVER[this.nr];
        var mig = this;
        if (!this.tilfaeldige.length) {
            this.tilfaeldige = NK.bland(K.alleOpgaver().filter(function (p) { return !mig.brugt[p.join("/")]; }));
            if (!this.tilfaeldige.length) {
                this.brugt = {};
                this.tilfaeldige = NK.bland(K.alleOpgaver());
            }
        }
        return this.tilfaeldige.shift();
    };

    P.nyOpgave = function () {
        this.nr++;
        this.par = this.naestePar();
        this.brugt[this.par.join("/")] = true;
        var m = this.par[0], i = this.par[1];
        this.reag = K.reagerer(m, i);
        this.r = this.reag ? K.reaktion(m, i) : null;
        this.fase = "gaet";
        this.hjaelp = 0;
        this.valgt = -1;
        this.forste = -1;
        this.markeret = false;
        this.ned = 0;            /* 0: stangen oppe, 1: nede i glasset */
        this.gTid = 0;
        this.gx = 0;
        this.bobler = [];
        this.boble = 0;
        this.produkter = [null, null];
        this.forkerteChips = {};
        this.chipValg = {};
        this.svarVist = false;
        this.skemaNoegle = null;
        this.chips = this.reag ? this.lavChips() : [];
        this.koef = ["", "", "", ""];
        this.lup.saet(null, i);
        this.besked("", "");
        this.visKort();
    };

    /* Stofferne, eleven kan vaelge imellem: de to rigtige, stangen og
       ionen, som de var, og H som atomer, naar der dannes H₂ */
    P.lavChips = function () {
        var r = this.r;
        var liste = [
            { tekst: r.stoffer[2], rigtig: 0 },
            { tekst: r.stoffer[3], rigtig: 1 },
            { tekst: r.m + "(s)", slags: "m" },
            { tekst: K.ion(r.i) + "(aq)", slags: "i" }
        ];
        if (r.gas) liste.push({ tekst: "H(g)", slags: "h" });
        return NK.bland(liste);
    };

    /* ----- Forudsigelsen ------------------------------------------------------------------
       Ja og nej paa kortet vaelger kun (vaelg); Indsend svar sender gaettet (gaet). */
    P.vaelg = function (n) {
        if (this.fase === "gaet") {
            if (this.afvisTilbud) this.afvisTilbud();
            this.valgt = n;
            if (this.bKl === "peger") this.bH = "";
            this.visKort();
            return;
        }
        if (this.fase === "produkt") this.vaelgChip(n);
    };

    P.gaet = function (n) {
        if (this.fase !== "gaet") return;
        if (this.afvisTilbud) this.afvisTilbud();
        this.valgt = n;
        if (this.forste === -1) this.forste = n;
        this.fase = "koerer";
        this.gTid = 0;
        this.visKort();
    };

    P.vurder = function () {
        var rigtigSvar = this.reag ? 0 : 1;
        var rigtigt = this.valgt === rigtigSvar;
        this.besvarede++;
        if (this.forste === rigtigSvar) this.rigtige++;
        this.markeret = true;
        /* Kortet bliver paa spoergsmaalet med svaret: Naeste spoergsmaal
           (stofferne), eller Naeste opgave, naar intet sker */
        this.svarTekst = NK.html(D.fuSvar(this.par[0], this.par[1], rigtigt && this.forste !== -2));
        this.svarRigtigt = rigtigt;
        this.hjaelp = 0;
        this.pegHint = false;
        if (this.reag) {
            this.fase = "vurderet";
        } else {
            this.fase = "faerdig";
            this.tilLog("intet sker", rigtigt);
            this.tjekRos();
        }
        this.visKort();
    };

    /* ----- Produkterne --------------------------------------------------------------------
       Et klik paa et stof vaelger det (eller fravaelger det). Indsend svar
       sender de valgte: de rigtige saettes i skemaet, de forkerte bliver
       roede og faar en besked. */
    P.vaelgChip = function (n) {
        if (this.fase !== "produkt") return;
        var c = this.chips[n];
        if (!c || c.placeret || this.forkerteChips[n]) return;
        if (this.chipValg[n]) delete this.chipValg[n];
        else if (this.antalChipValg() + this.antalPlaceret() < 2) this.chipValg[n] = true;
        else return;
        if (this.bKl === "peger") this.bH = "";
        this.visKort();
    };

    P.antalChipValg = function () { return Object.keys(this.chipValg).length; };
    P.antalPlaceret = function () { return this.chips.filter(function (c) { return c.placeret; }).length; };

    P.sendChips = function () {
        var mig = this, forkert = null;
        Object.keys(this.chipValg).map(Number).forEach(function (n) {
            var c = mig.chips[n];
            if (c.rigtig === undefined) {
                mig.forkerteChips[n] = true;
                if (!forkert) forkert = c;
            } else {
                c.placeret = true;
                mig.produkter[c.rigtig] = c.tekst;
            }
        });
        this.chipValg = {};
        if (forkert) {
            if (this.hjaelp === 0) this.pegHint = true;
            this.besked(NK.html(D.produktForkert(this.r, forkert.slags)), "skidt");
        } else this.besked("", "");
        if (this.produkter[0] && this.produkter[1]) {
            /* Ingen ros under det naeste spoergsmaal: stofferne staar nu i skemaet */
            this.fase = "koef";
            this.hjaelp = 0;
            this.pegHint = false;
            this.besked("", "");
        }
        this.visKort();
        if (this.fase === "koef") this.fokus();
    };

    /* ----- Koefficienterne ------------------------------------------------------------------ */
    P.laesKoef = function () {
        var felter = this.el.skema.querySelectorAll("input");
        var mig = this;
        for (var n = 0; n < felter.length; n++) mig.koef[n] = felter[n].value;
        return this.koef.map(function (v) {
            var s = String(v).trim();
            return /^\d+$/.test(s) ? parseInt(s, 10) : NaN;
        });
    };

    P.tjekKoef = function () {
        if (this.fase !== "koef") return;
        var t = this.laesKoef();
        var svar = K.tjekKoef(this.r, t);
        if (svar.ok) {
            /* Kortet bliver paa opgaven: skemaet groent, forklaringen og Naeste opgave */
            this.fase = "faerdig";
            this.svarVist = this.hjaelp >= 2;
            this.svarTekst = NK.html(D.koefBesked(this.r, svar));
            this.svarRigtigt = true;
            this.besked("", "");
            this.tilLog(K.skemaTekst(this.r, null, true), this.forste === 0);
            this.tjekRos();
            this.visKort();
            return;
        }
        if (this.hjaelp === 0) this.pegHint = true;
        this.besked(NK.html(D.koefBesked(this.r, svar)), "skidt");
        var s = this.el.skema.querySelector(".skemalinje");
        if (s) {
            s.classList.remove("ryst");
            void s.offsetWidth;
            s.classList.add("ryst");
        }
    };

    P.tilLog = function (tekst, rigtigt) {
        this.log.unshift({ par: this.par[0] + " i " + K.ion(this.par[1]), tekst: tekst, rigtigt: rigtigt });
        if (this.log.length > 6) this.log.pop();
        this.visLog();
    };

    P.tjekRos = function () {
        if (this.nr === D.OPGAVER.length - 1 && !NK.hent(NOEGLE_ROS, false)) {
            NK.gem(NOEGLE_ROS, true);
            this.ventRos = 1.4;
        }
    };

    /* ----- Kortets knapper: Giv hint -> Vis svaret, Indsend svar og videre ------------------------
       knap() er Enter og den gamle ene knap. */
    P.knap = function () {
        if (this.fase === "faerdig" || this.fase === "vurderet") { this.videre(); return; }
        this.hjaelpKnap();
    };

    P.videre = function () {
        if (this.fase === "faerdig") { this.nyOpgave(); return; }
        if (this.fase === "vurderet") {
            this.fase = "produkt";
            this.hjaelp = 0;
            this.besked("", "");
            this.visKort();
        }
    };

    P.kanSende = function () {
        if (this.fase === "gaet") return this.valgt >= 0;
        if (this.fase === "produkt") return this.antalChipValg() > 0 && this.antalChipValg() + this.antalPlaceret() === 2;
        if (this.fase === "koef") {
            var felter = this.el.skema.querySelectorAll("input");
            return felter.length === 4 && Array.prototype.every.call(felter, function (f) { return f.value.trim() !== ""; });
        }
        return false;
    };

    P.indsend = function () {
        if (this.fase === "gaet") {
            if (this.valgt < 0) { this.besked("Vælg ja eller nej først.", "peger"); return; }
            this.gaet(this.valgt);
            return;
        }
        if (this.fase === "produkt") {
            if (this.antalChipValg() + this.antalPlaceret() < 2) { this.besked("Vælg to stoffer, der dannes.", "peger"); return; }
            this.sendChips();
            return;
        }
        if (this.fase === "koef") this.tjekKoef();
    };

    P.hjaelpKnap = function () {
        if (this.fase === "faerdig" || this.fase === "vurderet" || this.fase === "koerer") return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.pegHint = false;
            var t;
            if (this.fase === "gaet") { t = D.fuHint(this.par[0], this.par[1]); this.markeret = true; }
            else if (this.fase === "produkt") t = D.produktHint(this.r);
            else t = D.koefHint(this.r);
            this.besked("<b>Hint:</b> " + NK.html(t), "gul");
            this.visKort();
            return;
        }
        this.hjaelp = 2;
        if (this.fase === "gaet") {
            if (this.forste === -1) this.forste = -2;
            this.gaet(this.reag ? 0 : 1);
            return;
        }
        if (this.fase === "produkt") {
            var mig = this;
            this.chips.forEach(function (c) {
                if (c.rigtig !== undefined) { c.placeret = true; mig.produkter[c.rigtig] = c.tekst; }
            });
            this.chipValg = {};
            this.fase = "koef";
            this.hjaelp = 0;
            this.besked("", "");
            this.visKort();
            this.fokus();
            return;
        }
        this.koef = this.r.koef.map(String);
        this.skemaNoegle = null;   /* felterne bygges om med svaret i */
        this.visKort();
        this.tjekKoef();
    };

    P.nulstil = function () {
        this.nr = -1;
        this.rigtige = 0;
        this.besvarede = 0;
        this.log = [];
        this.brugt = {};
        this.tilfaeldige = [];
        this.visLog();
        this.nyOpgave();
    };

    /* ----- Panelet ---------------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = { skema: NK.el("fu-skema") };
        this.kort = new NK.SceneKort("fu", {
            valg: function (j) { mig.vaelg(parseInt(j, 10)); },
            hint: function () { mig.hjaelpKnap(); },
            indsend: function () { mig.indsend(); },
            videre: function () { mig.videre(); }
        });
        this.el.besked = this.kort.beskedEl;
        this.bH = "";
        this.bKl = "";
        this.trinTekst = "";
        NK.el("fu-nulstil").addEventListener("click", function () { mig.nulstil(); });
        this.visLog();
    };

    /* Beskeden paa papirkortet (hint, fejl). Uden besked staar det, man ser, dér. */
    P.besked = function (html, klasse) {
        this.bH = html || "";
        this.bKl = klasse || "";
        if (this.bKl === "skidt") this.kortBesked = null;
        this.visKnap();
    };

    P.visKort = function () {
        var mig = this, fase = this.fase, m = this.par[0], i = this.par[1];
        if (!this.kort) return;
        var chip = this.nr < D.OPGAVER.length ? "Opgave " + (this.nr + 1) + " af " + D.OPGAVER.length : "Ekstra opgave";
        var spm = D.FU_SPM;
        if (fase === "produkt") spm = D.PRODUKT_SPM;
        else if (fase === "koef" || (fase === "faerdig" && this.reag)) spm = D.KOEF_SPM;
        var d = { kl: "spm", chip: chip, tekst: NK.html(D.opgaveTekst(m, i) + " " + spm) };
        if (fase === "gaet" || fase === "koerer" || fase === "vurderet" || (fase === "faerdig" && !this.reag)) {
            /* Ja og nej: vaelger kun. Bagefter er svaret groent, et forkert gaet roedt. */
            var rigtigSvar = this.reag ? 0 : 1, vist = fase === "vurderet" || fase === "faerdig";
            d.laast = fase !== "gaet";
            d.svar = D.FU_VALG.map(function (t, n) {
                return { j: n, t: NK.html(t), valgt: !vist && n === mig.valgt,
                    rigtig: vist && n === rigtigSvar && mig.forste !== -2, svarVist: vist && n === rigtigSvar && mig.forste === -2,
                    forkert: vist && n !== rigtigSvar && (n === mig.valgt || n === mig.forste) };
            });
        } else if (fase === "produkt") {
            /* Stofferne at vaelge imellem */
            d.svar = this.chips.map(function (c, n) {
                return { j: n, t: NK.html(c.tekst), valgt: !!mig.chipValg[n], rigtig: !!c.placeret, forkert: !!mig.forkerteChips[n] };
            });
        }
        this.kort.vis(d);
        if (fase === "produkt") {
            this.chips.forEach(function (c, n) {
                var b = mig.kort.ind.querySelector('[data-valg="' + n + '"]');
                if (b) b.disabled = !!(c.placeret || mig.forkerteChips[n]);
            });
        }
        /* Skemaet, der bygges op */
        this.bygSkema();
        this.visKnap();
    };

    /* Beskeden, Giv hint og Indsend svar, eller forklaringen og knappen videre */
    P.visKnap = function () {
        var k = this.kort, fase = this.fase;
        if (!k) return;
        var bh = this.bH || this.trinTekst || "", bkl = this.bH ? this.bKl : "";
        var noegle = bh + "|" + bkl;
        if (noegle !== this.kortBesked) { this.kortBesked = noegle; k.besked(bh, bkl); }
        if (fase === "vurderet" || fase === "faerdig") {
            var vist = fase === "faerdig" && this.reag ? this.svarVist : this.forste === -2;
            k.bliv(this.svarTekst || "", vist && this.reag && fase === "faerdig" ? "Svaret" : null,
                fase === "vurderet" ? "Næste spørgsmål" : "Næste opgave",
                vist ? "svar" : (this.svarRigtigt ? "god" : "nej"));
            return;
        }
        k.bliv(null);
        k.knapper({ hint: fase === "koerer" ? null : (this.hjaelp === 0 ? "Giv hint" : "Vis svaret"), peg: this.pegHint,
            indsend: true, klar: this.kanSende() });
    };

    /* Skemaet paa kortet: foerst reaktanterne og to tomme pladser, saa
       felter til koefficienterne, til sidst det faerdige skema. Det bygges
       kun om, naar noget i det skifter, saa felterne beholder fokus. */
    P.bygSkema = function () {
        var vaert = this.el.skema, fase = this.fase, r = this.r, mig = this;
        var noegle = this.nr + "|" + fase + "|" + this.produkter.join("/");
        if (noegle === this.skemaNoegle) return;
        this.skemaNoegle = noegle;
        vaert.innerHTML = "";
        if (!r || fase === "gaet" || fase === "koerer" || fase === "vurderet") return;
        var linje = document.createElement("div");
        linje.className = "skemalinje";
        function led(tekst, n) {
            var s = document.createElement("span");
            s.className = "led";
            if (fase === "koef") {
                var inp = document.createElement("input");
                inp.type = "text";
                inp.inputMode = "numeric";
                inp.maxLength = 2;
                inp.className = "koeffelt";
                inp.value = mig.koef[n];
                inp.setAttribute("aria-label", "Koefficient foran " + tekst);
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); mig.indsend(); }
                });
                inp.addEventListener("input", function () { mig.koef[n] = inp.value; mig.visKnap(); });
                s.appendChild(inp);
            } else if (fase === "faerdig" && r.koef[n] !== 1) {
                var k = document.createElement("b");
                k.className = "koef";
                k.textContent = r.koef[n] + " ";
                s.appendChild(k);
            }
            var t = document.createElement("span");
            if (tekst === null) {
                t.className = "tomplads";
                t.textContent = "?";
            } else t.textContent = tekst;
            s.appendChild(t);
            linje.appendChild(s);
        }
        function tegn(t) {
            var s = document.createElement("span");
            s.className = "tegn";
            s.textContent = t;
            linje.appendChild(s);
        }
        led(r.stoffer[0], 0);
        tegn("+");
        led(r.stoffer[1], 1);
        tegn("⟶");
        led(fase === "produkt" ? this.produkter[0] : r.stoffer[2], 2);
        tegn("+");
        led(fase === "produkt" ? this.produkter[1] : r.stoffer[3], 3);
        if (fase === "faerdig") linje.classList.add("faerdig");
        vaert.appendChild(linje);
    };

    P.visLog = function () {
        var h = "";
        this.log.forEach(function (l) {
            h += '<div class="logrk"><span class="logpar">' + NK.html(l.par) + '</span><span class="logtekst">' + NK.html(l.tekst) +
                "</span><span class=\"logmrk " + (l.rigtigt ? "ja" : "nej") + "\">" + (l.rigtigt ? "✓" : "✗") + "</span></div>";
        });
        NK.saetHTML("fu-log", h || '<p class="note">Her kommer dine svar.</p>');
        NK.saetTekst("fu-rigtige", this.rigtige + " af " + this.besvarede);
    };

    P.fokus = function () {
        if (this.fase !== "koef") return;
        var felter = this.el.skema.querySelectorAll("input");
        for (var n = 0; n < felter.length; n++) {
            if (!felter[n].value) { felter[n].focus(); return; }
        }
        if (felter.length) felter[0].focus();
    };

    /* Det, man ser, i kortets linje, naar der ikke staar en besked */
    P.visStatus = function () {
        var m = this.par[0], i = this.par[1], t;
        if (this.info) t = this.info.tekst;
        else if (this.fase === "gaet") t = "Stangen med " + m + " venter over glasset med " + K.ion(i) + ".";
        else if (this.ned < 1 || this.gTid < 0.8) t = "Stangen går ned i glasset.";
        else if (this.fase === "koef") t = "Skriv et tal i hvert af de fire felter i skemaet, også 1.";
        else t = "<b>" + m + " i " + K.ion(i) + ":</b> " + D.iagttagelse(m, i) + ".";
        if (t !== this.trinTekst) { this.trinTekst = t; this.visKnap(); }
    };

    /* ----- Layout ----------------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.12, 44, 80));
        lay.kop = { x: kant + 22, y: lay.bordY };
        var rk = kant + Tg.RAEKKE_KANT;
        /* Raekken (med maerkerne over den) begynder under papirkortets plads */
        lay.zone = this.kortZone();
        lay.raekke = { x: rk, y: lay.zone + 40, b: W - 2 * rk, h: NK.klamp(H * 0.058, 28, 40) };
        var under = lay.raekke.y + lay.raekke.h + 52;
        var R = NK.klamp(Math.min(W * 0.2, (lay.bordY - under - 40) / 2), 70, 185);
        lay.lup = { cx: W - kant - R - 8, cy: under + 6 + R, R: R };
        var venstre = kant + 90, hoejre = lay.lup.cx - R - 24;
        var gb = NK.klamp(Math.min((hoejre - venstre) * 0.55, (lay.bordY - under) / (1.2 * 2.25)), 70, 200);
        var gcx = (venstre + hoejre) / 2 + gb * 0.2;
        /* Glasset rykker mod luppen, saa Kemichael kan staa til venstre
           for det uden at daekke stangen og glasset */
        var ls = this.laererLaerredSkala ? this.laererLaerredSkala() : 0;
        var laererB = ls ? Math.max(150 * ls, 90, lay.kop.x + 70) + 112 * ls : 0;
        gcx = Math.max(gcx, Math.min(laererB + gb / 2 + 8, hoejre - gb / 2));
        lay.glas = Tg.glasMaal(gcx, lay.bordY, gb);
        lay.stang = { b: Math.max(10, gb * 0.13), l: gb * 1.2 * 1.3 };
        lay.topOppe = lay.glas.top - lay.stang.l - 14;
        lay.topNede = lay.glas.bundY - gb * 1.2 * 0.07 - lay.stang.l;
        lay.stativ = { x: gcx - gb * 0.95, top: lay.topOppe - 20, bund: lay.bordY, tilX: gcx };
        lay.skiltPx = NK.klamp(Math.round((H - lay.bordY - 20) / 2.4), 11, 15);
        lay.px = NK.klamp(W * 0.014, 12, 15);
        this.lay = lay;
        var g = lay.glas;
        this.saetAnker("fu-anker-raekke", lay.raekke.x - 60, lay.raekke.y - 34, lay.raekke.b + 120, lay.raekke.h + 40);
        /* Stangen og glasset (uden stativets stang, som Kemichael staar foran) */
        this.saetAnker("fu-anker-glas", g.x - 8, lay.topOppe - 30, g.b + 16, lay.H - lay.topOppe + 30);
        this.saetAnker("fu-anker-lup", lay.lup.cx - R - 4, lay.lup.cy - R - 4, 2 * R + 8, 2 * R + 8);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
        else if (this.kortZone() !== this.lay.zone) this.layout();
    };

    /* Pladsen oeverst i scenen til papirkortet: [almindelig skaerm, lav skaerm] */
    var ZONE = [206, 192];
    P.kortZone = function () { return this.kort ? this.kort.zone(ZONE) : 10 + ZONE[0] + 8; };

    /* ----- Opdater og tegn ----------------------------------------------------------------------------- */
    P.opdater = function (dt) {
        var m = this.par[0], i = this.par[1], lay = this.lay;
        this.tid += dt;
        if (this.fase !== "gaet") {
            var foer = this.ned;
            this.ned = Math.min(1, this.ned + dt / NED);
            if (this.ned >= 1) {
                if (foer < 1) this.lup.saet(m, i);
                this.gTid += dt;
                if (this.reag) this.gx = 0.75 * (1 - Math.exp(-this.gTid / K.tau(m, i)));
                if (this.fase === "koerer" && this.gTid >= SE) this.vurder();
                if (this.reag && this.r.gas && lay) {
                    this.boble += dt * 60 / K.tau(m, i);
                    var y0 = lay.glas.overflade + 8, y1 = lay.topNede + lay.stang.l - 4, k = lay.glas.k;
                    while (this.boble >= 1) {
                        this.boble -= 1;
                        var side = Math.random() < 0.5 ? -1 : 1;
                        this.bobler.push({
                            x: lay.glas.cx + side * (lay.stang.b / 2 - Tg.taeretInd(lay.stang.b, this.gx / 0.75) + 1.5), y: NK.r(y0, y1),
                            r: NK.r(2, 4.4) * k * 2, vy: -NK.r(40, 75) * k * 2, a: 1
                        });
                    }
                }
            }
        }
        if (lay) {
            var ov = lay.glas.overflade;
            this.bobler.forEach(function (b) {
                b.y += b.vy * dt;
                b.x += Math.sin((b.y + b.x) * 0.2) * 6 * dt;
                if (b.y < ov + 2) b.a -= dt * 6;
            });
            this.bobler = this.bobler.filter(function (b) { return b.a > 0; });
        }
        this.lup.opdater(dt);
        if (this.info) {
            this.info.tid -= dt;
            if (this.info.tid <= 0 || this.fase !== "gaet") this.info = null;
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererReplik) this.laererReplik(D.ROS_FORUDSIG, true);
        }
        this.visStatus();
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var m = this.par[0], i = this.par[1];
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Raekken foroven. Maerkerne kommer med hintet eller svaret. */
        var v = {};
        if (this.markeret) {
            v.lys = {};
            v.lys[m] = true;
            v.lys[i] = true;
            v.maerker = [
                { sym: m, tekst: "stangen", farve: "#9fd0f5" },
                { sym: i, tekst: "ionerne", farve: "#f5c28a" }
            ];
            if (this.reag && this.fase !== "gaet" && this.fase !== "koerer") v.pil = { fra: m, til: i, tekst: "e⁻" };
        }
        Tg.raekke(ctx, lay.raekke, K.RAEKKE, v);

        /* Keglen til luppen */
        var g = lay.glas;
        Tg.zoomKegle(ctx, g.cx - lay.stang.b / 2 - 2, (g.overflade + g.bundY) / 2, lay.lup.cx, lay.lup.cy, lay.lup.R);

        /* Stativet, glasset og stangen */
        var t = NK.blod(this.ned);
        var top = NK.lerp(lay.topOppe, lay.topNede, t);
        var st = lay.stativ;
        var stang = { x: g.cx, top: top, b: lay.stang.b, l: lay.stang.l, metal: m, px: NK.klamp(lay.px, 12, 14) };
        if (this.reag && this.ned >= 1) {
            /* I syren bliver stangen tyndere; ellers saetter der sig et lag */
            if (this.r.gas) stang.taeret = { x: this.gx / 0.75, fra: g.overflade };
            else stang.belaeg = { metal: i, x: this.gx / 0.75, fra: g.overflade, frø: Tg.frø(m + i) };
        }
        var lag = Tg.oplLag(i, this.reag ? m : null, this.gx, this.r ? this.r.koef[0] / this.r.koef[1] : 0);
        var iGlasset = top + lay.stang.l > g.top;
        if (!iGlasset) Tg.stang(ctx, stang);
        Tg.glas(ctx, g, lag, {
            inde: function (c) {
                if (iGlasset) Tg.stang(c, stang);
                if (mig.bobler.length) Tg.bobler(c, mig.bobler);
            }
        });
        Tg.stativ(ctx, { x: st.x, top: st.top, bund: st.bund, armY: top + 12, tilX: st.tilX });
        Tg.glasSkilt(ctx, g.cx, lay.bordY + 16, K.ion(i), K.saltFormel(i), { px: lay.skiltPx });

        /* Luppen */
        var titel = this.ned >= 1 ? m + "-stangen i " + K.ion(i) : "Glasset med " + K.ion(i);
        this.lup.tegn(ctx, lay.lup.cx, lay.lup.cy, lay.lup.R, { titel: titel });

        if (this.laererTegnOver) this.laererTegnOver(ctx);
        if (this.laererTegnBoble) this.laererTegnBoble(ctx);
    };

    /* ----- Musen ------------------------------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        var r = lay.raekke;
        if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return { slags: "raekke" };
        var g = lay.glas;
        if (pt.x >= lay.stativ.x - 20 && pt.x <= g.x + g.b && pt.y >= lay.topOppe - 24 && pt.y <= lay.H) return { slags: "glas" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            var s = mig.over && mig.over.slags;
            c.style.cursor = s === "kop" || s === "laerer" || (s === "glas" && mig.fase === "gaet") ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; });
        c.addEventListener("pointerup", function (e) { mig.klik(mig.L.punkt(e)); });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "glas" && this.fase === "gaet") {
            /* Stangen kommer foerst ned, naar gaettet er sendt: kortet blinker */
            this.info = { tekst: "Svar først på kortet, om der sker en reaktion. Derefter kommer stangen ned i glasset.", tid: 3 };
            this.kort.blink();
        } else if (u.slags === "raekke") {
            this.info = { tekst: "Spændingsrækken: uædel til venstre, ædel til højre.", tid: 3 };
        }
    };

    /* J og N svarer ja og nej */
    P.tast = function (e) {
        if (this.fase !== "gaet") return false;
        if (e.key === "j" || e.key === "J") { this.vaelg(0); return true; }
        if (e.key === "n" || e.key === "N") { this.vaelg(1); return true; }
        return false;
    };

    P.enter = function () {
        if (this.fase === "faerdig" || this.fase === "vurderet") this.videre();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc8.1-intro-forudsig", tilbud: "fu-tilbud" });

    NK.SimForudsig = SimForudsig;
}());
