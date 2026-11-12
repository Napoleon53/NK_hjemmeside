/* =====================================================================
   trin.js - forloebet, som alle tre faner deler

   En fane har en liste af emner (syrer eller baser). Hvert emne har en
   liste af trin, og hvert trin er beskrevet som data i fanens TRIN-tabel:

     navn            trinnets navn i panelet og rammens titel
     slags           "felter" (1 til 3 felter paa raekke), "broek" (taeller
                     og naevner), "valg" (svar paa kortet) eller "cas" (en
                     knap, der loeser ligningen, og saa et valg mellem
                     loesningerne)
     tekst(e, r)     kortets tekst (cas: tekstA foer CAS, tekst bagefter)
     felter(e, r)    [{ label, enhed, ph }]          (slags felter)
     broek(e, r)     { label, efter }                (slags broek)
     svar(e, r)      svarene paa kortet              (slags valg og cas)
     rigtig(e, r)    det rigtige svar                (slags valg og cas)
     fejlValg(e, r, j)  forklaringen til et forkert svar
     tjek(e, r, f)   elevens tekst i felterne: { ok } | { fejl, felt } | { tom }
     vis(e, r)       felternes tekst, naar eleven trykker Vis svaret
     hint(e, r)      hinttrappen (cas: hintA foer CAS)
     forkl(e, r)     forklaringen paa det groenne kort

   e er emnet, r er tallene (fanens tal(e)). Kortet, Indsend svar og den
   gule knap er fane.js; her er kun forloebet. Kortet bliver paa
   spoergsmaalet efter et rigtigt svar (papirkortet), og knappen dér
   foerer altid videre. Begynd forfra staar i panelet.

   Fanen giver: TRIN, emner, tal(e), trinFor(e), emneNavn(e) og
   startTrinFane({ noegle, liste, trinliste, titel, naeste, faerdig }).
   Den kan have nytEmne(), efterRigtigt(id, vist), efterFejl(res).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var CAS_TID = 0.8;

    function paa(P, navn) {
        NK.Fane.paa(P, navn);

        P.startTrinFane = function (opt) {
            var mig = this;
            this.opt = opt;
            this.f = ["", "", ""];
            this.startFane();
            this.hentStatus();
            NK.el(navn + "-forfra").addEventListener("click", function () { mig.forfra(); });
            this.el.skort.addEventListener("input", function (e) {
                var t = e.target, m = t && t.id ? new RegExp("^" + navn + "-f(\\d)$").exec(t.id) : null;
                if (!m) return;
                mig.f[parseInt(m[1], 10)] = t.value;
                t.classList.remove("ryst");
                mig.visIndsend();
            });
            this.el.skort.addEventListener("keydown", function (e) {
                if (e.target && e.target.tagName === "INPUT" && e.key === "Enter") { e.preventDefault(); mig.indsendKlik(); }
            });
            NK.el(opt.liste).addEventListener("click", function (e) {
                var li = e.target.closest && e.target.closest("li[data-nr]");
                if (li) mig.startEmne(parseInt(li.getAttribute("data-nr"), 10));
            });
        };

        /* ----- Hukommelsen: emnets id -> 1 (loest) eller 2 (uden fejl) ------------- */
        P.hentStatus = function () { this.status = (NK.hent(this.opt.noegle, {}) || {}).o || {}; };
        P.gem = function () { NK.gem(this.opt.noegle, { o: this.status }); };

        /* ----- Forloebet -------------------------------------------------------------- */
        P.vaelg = function (nr) { this.startEmne(nr || 0); };

        P.startEmne = function (nr) {
            this.nr = nr;
            this.e = this.emner[nr];
            this.r = this.tal(this.e);
            this.trinListe = this.trinFor(this.e);
            this.loestTrin = {};
            this.fejl = false;
            this.sv = false;
            this.faerdig = false;
            this.sejrT = null;
            this.nyT = {};
            this.spoegelse = null;
            if (this.nytEmne) this.nytEmne();
            this.startTrin(0);
        };

        P.startTrin = function (j) {
            this.trinNr = j;
            this.trin = this.trinListe[j];
            this.groen = null;
            this.valgt = null;
            this.forkerte = {};
            this.f = ["", "", ""];
            this.casT = null;
            this.casVist = false;
            this.besked("", "");
            this.nulstilHjaelp();
            this.visKort();
            this.visListe();
            this.layout();
            var f = NK.el(navn + "-f0");
            if (f) try { f.focus({ preventScroll: true }); } catch (x) { /* intet fokus */ }
        };

        P.td = function () { return this.TRIN[this.trin]; };
        P.erValg = function () { var s = this.td().slags; return s === "valg" || (s === "cas" && this.casVist); };

        /* ----- Kortet ---------------------------------------------------------------- */
        P.chip = function () {
            return this.emneNavn(this.e) + " · trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        };

        P.kortData = function () {
            var d = this.td(), e = this.e, r = this.r, mig = this;
            var foerCas = d.slags === "cas" && !this.casVist;
            var k = { slags: "spm", chip: this.chip(), tekst: foerCas ? d.tekstA(e, r) : d.tekst(e, r) };
            if (this.erValg()) {
                k.svar = d.svar(e, r).map(function (t, j) { return { t: t, valgt: mig.valgt === j, forkert: !!mig.forkerte[j] }; });
            }
            if (d.slags === "felter") k.ekstra = this.felterHTML(d.felter(e, r));
            if (d.slags === "broek") k.ekstra = this.broekHTML(d.broek(e, r));
            return k;
        };

        function input(id, ph, kl) {
            return '<input id="' + id + '"' + (kl ? ' class="' + kl + '"' : "") + ' type="text" autocomplete="off" spellcheck="false" placeholder="' + NK.html(ph || "") + '">';
        }

        P.felterHTML = function (liste) {
            var html = '<div class="sk-felter n' + liste.length + '">';
            liste.forEach(function (f, i) {
                html += '<div class="sk-felt"><label for="' + navn + "-f" + i + '">' + NK.html(f.label) + "</label>" + input(navn + "-f" + i, f.ph) +
                    (f.enhed ? '<span class="enhed">' + NK.html(f.enhed) + "</span>" : "") + "</div>";
            });
            return html + "</div>";
        };

        P.broekHTML = function (b) {
            return '<div class="sk-felt skbroek"><label for="' + navn + '-f0">' + NK.html(b.label) + '</label><span class="broekfelt">' +
                input(navn + "-f0", "tælleren") + '<span class="streg"></span>' + input(navn + "-f1", "nævneren") + "</span>" +
                '<span class="efter">' + NK.html(b.efter) + "</span></div>";
        };

        /* Felterne faar elevens tekst tilbage (ikke gennem HTML: x² maa ikke
           blive til <sup>) */
        P.efterKort = function () {
            for (var i = 0; i < 3; i++) {
                var inp = NK.el(navn + "-f" + i);
                if (inp) inp.value = this.f[i] || "";
            }
        };

        P.svarValg = function (j) {
            if (this.groen || !this.erValg()) return;
            this.valgt = j;
            this.visKort();
        };

        /* ----- Indsend svar ------------------------------------------------------------ */
        P.skjulIndsend = function () { return this.casT !== null; };
        P.skjulHint = function () { return this.casT !== null; };

        P.kanSendes = function () {
            var d = this.td();
            if (d.slags === "cas" && !this.casVist) return this.casT === null;
            if (this.erValg()) return this.valgt !== null;
            return this.f.some(function (t) { return String(t || "").trim() !== ""; });
        };
        P.indsendTekst = function () {
            var d = this.td();
            if (d.slags === "cas" && !this.casVist) return "Løs ligningen med CAS";
            return "Indsend svar";
        };
        P.ingentingTekst = function () {
            if (this.erValg()) return "Vælg et svar på kortet først.";
            return "Skriv svaret i feltet på kortet først.";
        };

        P.indsend = function () {
            var d = this.td(), e = this.e, r = this.r;
            if (d.slags === "cas" && !this.casVist) {
                this.casT = 0;
                this.besked("", "");
                this.visKort();
                return;
            }
            if (this.erValg()) {
                if (this.valgt === d.rigtig(e, r)) { this.rigtigt(false); return; }
                var vb = this.valgt;
                this.fejl = true;
                this.forkerte[vb] = true;
                this.valgt = null;
                this.visKort();
                this.fejlFelter = null;
                this.fejlLinje(d.fejlValg(e, r, vb));
                if (this.efterFejl) this.efterFejl({ valg: vb });
                return;
            }
            var res = d.tjek(e, r, this.f.slice()) || {};
            if (res.ok) { this.rigtigt(false); return; }
            if (res.tom) {
                this.kortBlink();
                this.kortBesked(res.tom, 3.5);
                return;
            }
            this.fejl = true;
            this.fejlFelter = res.felt === undefined ? null : [].concat(res.felt);
            this.fejlLinje(res.fejl || "Ikke rigtigt.");
            if (this.efterFejl) this.efterFejl(res);
        };

        /* Et forkert svar ryster kortets nederste raekke og de felter, der er galt */
        P.ryst = function () {
            var e = this.el.status, fl = this.fejlFelter;
            e.classList.remove("ryster"); void e.offsetWidth; e.classList.add("ryster");
            for (var i = 0; i < 3; i++) {
                var f = NK.el(navn + "-f" + i);
                if (!f || (fl && fl.indexOf(i) < 0)) continue;
                f.classList.remove("ryst"); void f.offsetWidth; f.classList.add("ryst");
            }
        };

        P.rigtigt = function (vist) {
            var d = this.td(), e = this.e, r = this.r, sidste = this.trinNr === this.trinListe.length - 1;
            if (vist) this.sv = true;
            this.loestTrin[this.trin] = true;
            this.nyT[this.trin] = 0;
            var tekst = d.forkl(e, r), knap = "Næste trin →";
            if (sidste) {
                this.faerdig = true;
                var id = this.emneId(e);
                this.status[id] = (!this.fejl && !this.sv) || this.status[id] === 2 ? 2 : 1;
                this.gem();
                knap = this.nr < this.emner.length - 1 ? this.opt.naeste : null;
                if (!knap) tekst += " " + this.opt.faerdig;
            }
            this.groen = { spm: true, maade: vist ? "svar" : "selv", tekst: tekst, knap: knap };
            if (this.erValg()) this.groen.svarNr = d.rigtig(e, r);
            this.sejrT = 0;
            this.spoegelse = null;
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (this.efterRigtigt) this.efterRigtigt(this.trin, vist);
            if (sidste) NK.konfetti(this.el.skort, 40);
        };

        P.videre = function () {
            if (this.faerdig) {
                if (this.nr < this.emner.length - 1) this.startEmne(this.nr + 1);
                return;
            }
            this.startTrin(this.trinNr + 1);
        };

        P.forfra = function () {
            this.status = {};
            this.gem();
            this.startEmne(0);
        };
        P.nulstil = function () { if (!this.groen && this.casT === null) this.startEmne(this.nr); };

        /* ----- Hjaelpen ------------------------------------------------------------------ */
        P.hintNu = function () {
            if (this.groen) return [];
            var d = this.td();
            if (d.slags === "cas" && !this.casVist) return d.hintA(this.e, this.r);
            return d.hint(this.e, this.r);
        };

        P.visSvar = function () {
            var d = this.td();
            this.sv = true;
            if (d.slags === "cas" && !this.casVist) { this.casVist = true; this.casT = null; this.nyT.cas = 0; }
            if (this.erValg()) this.valgt = d.rigtig(this.e, this.r);
            else this.f = d.vis(this.e, this.r).concat(["", "", ""]).slice(0, 3);
            this.rigtigt(true);
        };

        /* CAS tænker lidt, og saa staar loesningerne paa tavlen og svarene paa kortet */
        P.opdaterTrin = function (dt) {
            if (this.casT !== null) {
                this.casT += dt;
                if (this.casT >= CAS_TID) {
                    this.casT = null;
                    this.casVist = true;
                    this.nyT.cas = 0;
                    this.visKort();
                }
            }
            for (var id in this.nyT) if (this.nyT[id] < 1) this.nyT[id] = Math.min(1, this.nyT[id] + dt / 0.5);
        };
        P.ny = function (id) { return this.nyT[id] === undefined ? 1 : this.nyT[id]; };

        /* Et klik i scenen svarer ikke: kortet blinker og siger, hvor svaret gives */
        P.klikScene = function () {
            this.kortBlink();
            if (this.groen) return;
            if (this.casT !== null) return;
            var d = this.td();
            if (d.slags === "cas" && !this.casVist) this.kortBesked("Tryk Løs ligningen med CAS på kortet.", 3);
            else if (this.erValg()) this.kortBesked("Vælg et svar på kortet, og tryk Indsend svar.", 3);
            else this.kortBesked("Skriv svaret i feltet på kortet, og tryk Indsend svar.", 3);
        };

        /* ----- Panelet ---------------------------------------------------------------------- */
        P.visListe = function () {
            var mig = this, html = "";
            this.emner.forEach(function (e, j) {
                var o = mig.status[mig.emneId(e)];
                html += '<li data-nr="' + j + '" class="' + (j === mig.nr ? "nu" : (o ? "faerdig" : "")) + '"><span class="tr-nr">' + (j + 1) + "</span><span>" +
                    D.sub(NK.html(mig.listeNavn(e))) + (o === 2 ? " ★" : (o ? " ✓" : "")) + "</span></li>";
            });
            NK.saetHTML(this.opt.liste, html);
            var th = "";
            this.trinListe.forEach(function (id, j) {
                var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) ? "faerdig" : (j === mig.trinNr ? "nu" : "");
                th += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + D.sub(NK.html(mig.TRIN[id].navn)) + "</span></li>";
            });
            NK.saetHTML(this.opt.trinliste, th);
            NK.saetTekst(this.opt.titel, this.emneNavn(this.e));
        };

        /* ----- Rammerne paa tavlen ------------------------------------------------------------
           Tilstanden for et trin: "loest", "aktiv" (kortet spoerger), "groen"
           (lige loest, kortet venter paa Næste) eller null (kommende) */
        P.tilstand = function (id) {
            if (this.loestTrin[id]) return id === this.trin && this.groen ? "groen" : "loest";
            return id === this.trin ? "aktiv" : null;
        };
        P.nrAf = function (id) { return this.trinListe.indexOf(id) + 1; };
    }

    NK.Trin = { paa: paa };
}());
