/* =====================================================================
   motor.js - opgaverne paa en fane: kortet, hinttrappen, raekken
   oeverst, Start forfra, Fri leg og det, der huskes i browseren

   Faelles for de to faner. Fanen (sim) giver opgaverne (D.OPGAVER_...) og
   tegner scenen ud fra, hvor langt eleven er (naaet()). Reglerne:
   REGELSAET.md 1-4 (to steder at kigge, kortet har fast plads), 11-17
   (trin, hinttrappe, Vis svaret, laaste titler), 19a (scenen er laast
   under et spoergsmaal), 33 (en handling gaar selv videre ca. 1 s efter,
   at scenen staar paa maalet) og 57 (mission foerst, Fri leg ved siden af).

   new NK.Motor(navn, opgaver, sim, { videreTekst, videreFane, friTekst })
     sim.scene(motor)      kaldes, naar trinnet skifter
     sim.paaMaal(trin)     handling: staar scenen paa maalet?
     sim.maalFejl(trin)    handling: beskeden, naar Indsend svar trykkes for tidligt
     sim.goerHandling(trin) handling: Vis svaret goer det for eleven
     sim.friLeg(til)       Fri leg slaas til eller fra
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function Motor(navn, opgaver, sim, opt) {
        var mig = this;
        this.navn = navn;
        this.opgaver = opgaver;
        this.sim = sim;
        this.opt = opt || {};
        this.noegle = NK.D.NOEGLE + "-" + navn;
        var gemt = NK.hent(this.noegle, null) || {};
        this.loest = opgaver.map(function (o, i) { return !!(gemt.loest && gemt.loest[i]); });
        this.naaetMaks = Math.min(opgaver.length - 1, gemt.naaet || 0);
        this.fri = false;
        this.friLukket = false;
        this.paaMaalTid = 0;

        this.kort = new NK.SceneKort(navn, {
            valg: function (j) { mig.valg(+j); },
            hint: function () { mig.hint(); },
            indsend: function () { mig.indsend(); },
            videre: function () { mig.videre(); }
        });
        this.raekke = NK.el(navn + "-prikker");
        this.raekke.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k && !k.disabled) mig.gaaTil(+k.getAttribute("data-opg"));
        });
        NK.el(navn + "-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el(navn + "-fri").addEventListener("click", function () { mig.friLeg(!mig.fri); });
        NK.el(navn + "-skort").addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-luk-kort]")) { mig.friLukket = true; mig.vis(); }
        });

        /* Første opgave, der ikke er løst (alle løst: den første, løst) */
        var start = 0;
        while (start < opgaver.length - 1 && this.loest[start]) start++;
        this.saetOpgave(start);
    }

    var P = Motor.prototype;

    P.gem = function () {
        NK.gem(this.noegle, { loest: this.loest, naaet: this.naaetMaks });
    };

    P.trin = function () {
        var o = this.opgaver[this.o];
        return o ? o.trin[this.t] : null;
    };

    /* Fasen: "spm", "handling", "bliv" (svaret staar paa kortet), "loest"
       (opgaven var loest foer), "faerdig" (alle opgaver er loest) */
    P.fase = function () { return this.tilstand; };

    /* Hvor langt eleven er, til scenen: { o, t, loestNu, alt } */
    P.naaet = function () {
        return {
            o: this.o,
            t: this.t,
            loestNu: this.tilstand === "bliv",
            alt: this.tilstand === "loest" || this.tilstand === "faerdig" || this.fri
        };
    };

    /* Er trin k i opgave o loest (og maa vises i scenen)? */
    P.trinLoest = function (o, k) {
        if (this.fri) return true;
        if (o < this.o) return true;
        if (o > this.o) return false;
        var n = this.naaet();
        if (n.alt) return true;
        return k < this.t || (k === this.t && n.loestNu);
    };

    /* Scenen er laast, mens kortet stiller et spoergsmaal eller viser svaret */
    P.laast = function () {
        return !this.fri && (this.tilstand === "spm" || this.tilstand === "bliv" || this.tilstand === "loest");
    };

    P.saetOpgave = function (o) {
        this.o = o;
        this.t = 0;
        this.fri = false;
        this.naaetMaks = Math.max(this.naaetMaks, o);
        this.gem();
        if (this.loest[o]) {
            this.tilstand = "loest";
        } else {
            this.nytTrin();
            return;
        }
        this.skift();
    };

    P.nytTrin = function () {
        var tr = this.trin();
        this.valgt = null;
        this.forkert = [];
        this.hintNr = 0;
        this.besked = "";
        this.beskedKl = "";
        this.vist = false;
        this.paaMaalTid = 0;
        this.tilstand = tr.handling ? "handling" : "spm";
        this.skift();
    };

    /* Fri leg i scenen foelger kortet: slaaet til i Fri leg og efter sidste opgave */
    P.skift = function () {
        var fri = this.fri || this.tilstand === "faerdig";
        if (this.sim.friLeg && this.simFri !== fri) { this.simFri = fri; this.sim.friLeg(fri); }
        if (this.sim.scene) this.sim.scene(this);
        this.vis();
    };

    /* ----- Kortet ------------------------------------------------------------ */
    P.chip = function () {
        var o = this.opgaver[this.o];
        if (o.trin.length > 1) return "Trin " + (this.t + 1) + " af " + o.trin.length;
        return "Opgave " + (this.o + 1);
    };

    P.svarListe = function (tr, slut) {
        var mig = this;
        return tr.svar.map(function (s, j) {
            var rigtigVist = slut && s.rigtig;
            return {
                j: j,
                t: NK.html(s.t),
                valgt: !slut && mig.valgt === j,
                rigtig: rigtigVist && !mig.vist,
                svarVist: rigtigVist && mig.vist,
                forkert: mig.forkert.indexOf(j) >= 0,
                dim: slut && !s.rigtig,
                laast: mig.forkert.indexOf(j) >= 0
            };
        });
    };

    P.knapTekst = function () {
        var o = this.opgaver[this.o];
        if (this.t < o.trin.length - 1) return "Næste";
        return this.o < this.opgaver.length - 1 ? "Næste opgave" : "Næste";
    };

    P.vis = function () {
        var k = this.kort, tr = this.trin(), n = this.opgaver.length;
        this.visRaekke();
        NK.el(this.navn + "-skort").hidden = this.fri && this.friLukket;
        if (this.fri || this.tilstand === "faerdig") {
            var luk = this.fri ? ' <button type="button" class="sk-luk" data-luk-kort="1" title="Luk" aria-label="Luk">✕</button>' : "";
            k.vis({
                kl: "loest",
                chip: this.fri ? "Fri leg" : "Færdig",
                tekst: (this.fri ? "" : this.klaretTekst()) + this.opt.friTekst,
                efter: luk
            });
            k.besked("", "");
            k.knapper({ hint: null, indsend: false });
            if (!this.fri && this.opt.videreTekst) k.bliv("Fri leg er slået til.", "", this.opt.videreTekst, "god");
            else k.bliv(null);
            return;
        }
        if (this.tilstand === "loest") {
            k.vis({ kl: "loest", chip: "Opgave " + (this.o + 1), tekst: "Opgaven " + NK.html(this.opgaver[this.o].navn.toLowerCase()) + " er løst. Start forfra giver trinene igen." });
            k.besked("", "");
            k.knapper({ hint: null, indsend: false });
            k.bliv("Alt er fremme i scenen.", "", this.o < n - 1 ? "Næste opgave" : "Næste", "god");
            return;
        }
        if (this.tilstand === "handling") {
            k.vis({ kl: "opgave", chip: this.chip(), tekst: NK.html(tr.tekst) });
            k.besked(this.besked, this.beskedKl);
            k.knapper({ hint: this.hintTekst(tr), peg: this.beskedKl === "skidt", indsend: true, klar: !!this.sim.paaMaal(tr) });
            k.bliv(null);
            return;
        }
        var slut = this.tilstand === "bliv";
        k.vis({
            kl: slut ? "loest" : "spm",
            chip: this.chip(),
            tekst: NK.html(tr.tekst),
            svar: this.svarListe(tr, slut),
            lange: !!tr.lange,
            laast: slut
        });
        if (slut) {
            k.bliv(NK.html(tr.godt), this.vist ? "Svaret" : "Rigtigt", this.knapTekst(), this.vist ? "svar" : "god");
        } else {
            k.bliv(null);
            k.besked(this.besked, this.beskedKl);
            k.knapper({ hint: this.hintTekst(tr), peg: this.beskedKl === "skidt", indsend: true, klar: this.valgt !== null });
        }
    };

    P.klaretTekst = function () {
        var n = this.opgaver.length;
        return n === 2 ? "Du har klaret begge opgaver. " : "Du har klaret alle " + n + " opgaver. ";
    };

    P.hintTekst = function (tr) {
        if (this.hintNr === 0) return "Giv hint";
        if (this.hintNr < tr.hints.length) return "Næste hint";
        return "Vis svaret";
    };

    /* Raekken oeverst: loeste og den aktuelle med navn, de kommende som et laast nummer */
    P.visRaekke = function () {
        var mig = this, html = "";
        this.opgaver.forEach(function (o, i) {
            var aaben = i <= mig.naaetMaks || mig.loest[i];
            if (!aaben) {
                html += '<button type="button" class="or-knap laast" disabled title="Kommer senere"><span class="or-nr">' + (i + 1) + "</span></button>";
                return;
            }
            var kl = "or-knap" + (i === mig.o && !mig.fri ? " valgt" : "") + (mig.loest[i] ? " loest" : "");
            html += '<button type="button" class="' + kl + '" data-opg="' + i + '" title="' + NK.html(o.navn + ": " + o.under) + '">' +
                '<span class="or-nr">' + (mig.loest[i] ? "✓" : (i + 1)) + '</span><span class="or-navn">' + NK.html(o.navn) + "</span></button>";
        });
        NK.saetHTML(this.navn + "-prikker", html);
        var fk = NK.el(this.navn + "-fri");
        var ft = this.fri ? "Tilbage til opgaverne" : "Fri leg";
        if (fk.textContent !== ft) fk.textContent = ft;
        fk.classList.toggle("aktiv", this.fri);
    };

    /* ----- Elevens handlinger ---------------------------------------------- */
    P.valg = function (j) {
        if (this.tilstand !== "spm" || this.forkert.indexOf(j) >= 0) return;
        this.valgt = j;
        if (this.beskedKl === "skidt") { this.besked = ""; this.beskedKl = ""; }
        this.vis();
    };

    P.indsend = function () {
        var tr = this.trin();
        if (this.tilstand === "handling") {
            if (this.sim.paaMaal(tr)) { this.naesteTrin(); return; }
            this.besked = this.sim.maalFejl(tr);
            this.beskedKl = "skidt";
            this.vis();
            return;
        }
        if (this.tilstand !== "spm") return;
        if (this.valgt === null) { this.kort.blink(); return; }
        var s = tr.svar[this.valgt];
        if (s.rigtig) {
            this.tilstand = "bliv";
            this.skift();
            return;
        }
        this.forkert.push(this.valgt);
        this.valgt = null;
        this.besked = NK.html(s.fejl);
        this.beskedKl = "skidt";
        this.vis();
    };

    P.hint = function () {
        var tr = this.trin();
        if (this.tilstand !== "spm" && this.tilstand !== "handling") return;
        if (this.hintNr < tr.hints.length) {
            this.besked = NK.html(tr.hints[this.hintNr]);
            this.beskedKl = "gul";
            this.hintNr++;
            this.vis();
            return;
        }
        /* Vis svaret */
        if (this.tilstand === "handling") {
            this.sim.goerHandling(tr);
            this.naesteTrin();
            return;
        }
        this.vist = true;
        this.tilstand = "bliv";
        this.skift();
    };

    /* Knappen paa det groenne kort */
    P.videre = function () {
        if (this.tilstand === "faerdig") {
            if (this.opt.videreFane) NK.visFane(this.opt.videreFane);
            return;
        }
        if (this.tilstand === "loest") {
            if (this.o < this.opgaver.length - 1) this.saetOpgave(this.o + 1);
            else this.faerdig();
            return;
        }
        if (this.tilstand === "bliv") this.naesteTrin();
    };

    P.naesteTrin = function () {
        var o = this.opgaver[this.o];
        if (this.t < o.trin.length - 1) {
            this.t++;
            this.nytTrin();
            return;
        }
        this.loest[this.o] = true;
        this.gem();
        if (this.o < this.opgaver.length - 1) this.saetOpgave(this.o + 1);
        else this.faerdig();
    };

    /* Alle opgaver er klaret: Fri leg er slaaet til, og knappen fører videre */
    P.faerdig = function () {
        this.tilstand = "faerdig";
        this.fri = false;
        this.friLukket = false;
        this.skift();
    };

    P.gaaTil = function (o) {
        if (this.fri) this.friLeg(false, true);
        this.saetOpgave(o);
    };

    /* Start forfra: trinene i den aktuelle opgave igen */
    P.forfra = function () {
        if (this.fri) this.friLeg(false, true);
        if (this.tilstand === "faerdig") this.o = this.opgaver.length - 1;
        this.t = 0;
        this.nytTrin();
    };

    P.friLeg = function (til, stille) {
        this.fri = !!til;
        this.friLukket = false;
        if (!stille) this.skift();
    };

    /* Kaldes hvert billede: en handling gaar selv videre ca. 1 s efter, at
       scenen staar paa maalet (regel 33). Indsend svar bliver som reserve. */
    P.opdater = function (dt) {
        if (this.tilstand !== "handling" || this.fri) return;
        var tr = this.trin(), paa = !!this.sim.paaMaal(tr);
        this.paaMaalTid = paa ? this.paaMaalTid + dt : 0;
        var klar = this.kort.indsendEl.classList.contains("klar");
        if (klar !== paa) this.vis();
        if (this.paaMaalTid > 1.0) this.naesteTrin();
    };

    /* Et klik i scenen, mens kortet stiller et spoergsmaal: kortet blinker */
    P.sceneKlik = function () {
        if (this.laast()) this.kort.blink();
    };

    /* Den hoejde, det hoejeste kort paa fanen faar (kortet har fast plads, regel 4) */
    P.maalKort = function () {
        var mig = this, tilst = [];
        this.opgaver.forEach(function (o) {
            o.trin.forEach(function (tr, t) {
                var chip = o.trin.length > 1 ? "Trin " + (t + 1) + " af " + o.trin.length : "Opgave 1";
                if (tr.handling) {
                    tr.hints.forEach(function (h) {
                        tilst.push({ d: { kl: "opgave", chip: chip, tekst: NK.html(tr.tekst) }, besked: NK.html(h), klasse: "gul", hint: "Næste hint", indsend: true });
                    });
                    return;
                }
                var svar = tr.svar.map(function (s, j) { return { j: j, t: NK.html(s.t) }; });
                var d = { kl: "spm", chip: chip, tekst: NK.html(tr.tekst), svar: svar, lange: !!tr.lange };
                tr.svar.forEach(function (s) {
                    if (s.fejl) tilst.push({ d: d, besked: NK.html(s.fejl), klasse: "skidt", hint: "Næste hint", indsend: true });
                });
                tr.hints.forEach(function (h) { tilst.push({ d: d, besked: NK.html(h), klasse: "gul", hint: "Vis svaret", indsend: true }); });
                tilst.push({ d: { kl: "loest", chip: chip, tekst: d.tekst, svar: svar, lange: d.lange, laast: true },
                    bliv: { tekst: NK.html(tr.godt), maerke: "Rigtigt", knap: "Næste opgave", slags: "god" } });
            });
        });
        tilst.push({ d: { kl: "loest", chip: "Færdig", tekst: this.klaretTekst() + this.opt.friTekst },
            bliv: { tekst: "Fri leg er slået til.", maerke: "", knap: this.opt.videreTekst || "Næste", slags: "god" } });
        return this.kort.maal(tilst);
    };

    NK.Motor = Motor;
}());
