/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sb2.1 og sc1.4)

   Der er ingen laerer i denne animation. Al hjaelp staar i statuslinjen
   nederst i scenen, og hjaelpeknappen sidder i samme linje.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: opgaverne i grupper, med loest og stjerne
       (huskes i browseren)
     * statuslinjen: naeste skridt, fejl, hint og ros, med farve efter
       hvad der skete, og et ryst ved en fejl
     * den ene knap: Giv et hint > Naeste hint > Vis svaret > Naeste opgave.
       Den lyser stille op, naar eleven lige har svaret forkert.

   Fanen selv har: lavOpgave(nr), promptHTML(), hintTrin(), visSvar(),
   trinLinje(), enter(), fokusFelt(), nulstil(), tilpas() og tegn().
   hintTrin() giver { trin: [tre tekster], lys: det, der skal lyse }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sb9.3-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver, grupper) {
            var mig = this;
            this.navn = navn;
            this.tid = 0;
            this.opgaver = opgaver;
            this.grupper = grupper;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.hjaelp = 0;          /* hvor mange hint eleven har bedt om */
            this.hintLys = null;      /* det, hintet handler om */
            this.pegKnap = false;     /* knappen lyser stille efter en fejl */
            this.el = { knap: el("knap"), liste: el("liste"), kort: el("kort"),
                besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.nulstil(); mig.fokus(); });
            this.bygListe();
        };

        /* ----- Hukommelse ------------------------------------------------------ */
        P.gem = function () {
            var ud = {}, mig = this;
            this.opgaver.forEach(function (o, i) {
                var s = mig.status[i];
                if (s.loest) ud[o.id] = { l: 1, s: s.stjerne ? 1 : 0 };
            });
            NK.gem(NOEGLE, ud);
        };

        P.antalLoest = function () {
            return this.status.filter(function (s) { return s.loest; }).length;
        };

        /* ----- Listen i panelet -------------------------------------------------- */
        P.bygListe = function () {
            var mig = this;
            this.el.liste.innerHTML = "";
            this.chips = [];
            this.grupper.forEach(function (g) {
                var boks = document.createElement("div");
                boks.className = "opg-gruppe";
                if (g.titel) {
                    var hoved = document.createElement("div");
                    hoved.className = "opg-hoved";
                    hoved.innerHTML = "<span>" + NK.html(g.titel) + '</span><span class="opg-tal" id="' + navn + "-gt-" + g.id + '"></span>';
                    boks.appendChild(hoved);
                }
                var raekke = document.createElement("div");
                raekke.className = "opg-raekker";
                mig.opgaver.forEach(function (o, i) {
                    if ((o.gruppe || "alle") !== g.id) return;
                    var knap = document.createElement("button");
                    knap.type = "button";
                    knap.className = "opg-raekke";
                    knap.innerHTML = '<span class="or-nr">' + (i + 1) + '</span><span class="or-navn">' + NK.html(o.navn) +
                        '</span><i class="or-m"></i>';
                    knap.addEventListener("click", function () { mig.vaelg(i); });
                    raekke.appendChild(knap);
                    mig.chips[i] = knap;
                });
                boks.appendChild(raekke);
                mig.el.liste.appendChild(boks);
            });
        };

        P.visListe = function () {
            var mig = this;
            this.status.forEach(function (s, i) {
                var c = mig.chips[i];
                if (!c) return;
                c.classList.toggle("valgt", i === mig.nr);
                c.classList.toggle("loest", s.loest);
                c.classList.toggle("stjerne", s.stjerne);
                c.querySelector(".or-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
            });
            this.grupper.forEach(function (g) {
                var ialt = 0, loest = 0;
                mig.opgaver.forEach(function (o, i) {
                    if ((o.gruppe || "alle") !== g.id) return;
                    ialt++;
                    if (mig.status[i].loest) loest++;
                });
                NK.saetTekst(navn + "-gt-" + g.id, loest + "/" + ialt);
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.hjaelp = 0;
            this.hintLys = null;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.slut = null;
            this.lavOpgave(i);
            this.tilpas();
            this.visKort();
            this.visListe();
            this.visHintLys();
            this.naesteLinje("", "");
            this.fokus();
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            NK.saetTekst(navn + "-titel", o.navn);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", this.promptHTML());
            this.el.kort.classList.toggle("sejr", this.faerdig);
            this.visKnap();
        };

        /* Hinttrappen for den tilstand, eleven staar i lige nu */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.trin && h.trin.length ? h : { lys: null, trin: [this.trinLinje()] };
        };

        P.visKnap = function () {
            var tekst, klasse;
            if (this.faerdig) {
                klasse = "knap videre banker";
                var naeste = this.naesteUloeste();
                if (naeste < 0 && valg.naesteFane) tekst = "Videre til " + valg.naesteNavn + " →";
                else tekst = valg.naesteTekst || "Næste opgave →";
            } else {
                var h = this.hintNu();
                klasse = "knap hjaelp";
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.trin.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.trin.length + ")";
                else tekst = "Vis svaret";
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Knappen: ét skridt hjaelp ad gangen ------------------------------- */
        P.knap = function () {
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg((this.nr + 1) % this.opgaver.length);
                return;
            }
            var h = this.hintNu();
            this.pegKnap = false;
            if (this.hjaelp < h.trin.length) {
                this.hjaelp++;
                this.hintLys = h.lys || null;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.trin.length + "</span> " +
                    h.trin[this.hjaelp - 1], "hint");
                this.visHintLys();
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            this.hintLys = null;
            this.visHintLys();
            this.visSvar();
            this.visKnap();
            this.fokus();
        };

        /* Eleven er kommet et skridt videre: hinttrappen begynder forfra,
           for nu er naeste skridt et andet */
        P.nulstilHjaelp = function () {
            if (this.hjaelp === 0 && !this.hintLys) return;
            this.hjaelp = 0;
            this.hintLys = null;
            this.visHintLys();
            this.visKnap();
        };

        P.visHintLys = P.visHintLys || function () {};

        /* ----- Opgaven er loest ---------------------------------------------------
           maade: "ok" (selv), "svar" (Vis svaret) eller "gaet" (fane 1: gaettet
           var forkert, men eleven proevede det selv) */
        P.loest = function (maade, tekst, maerke) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            this.faerdig = true;
            this.hjaelp = 0;
            this.hintLys = null;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || (maade === "ok" && !this.brugtSvar);
            this.gem();
            var alle = this.antalLoest() === this.opgaver.length;
            var html, klasse;
            if (maade === "svar") {
                html = '<span class="b-maerke">' + NK.html(maerke || "Svaret") + "</span> " + (tekst || "");
                klasse = "gul";
            } else if (maade === "gaet") {
                html = '<span class="b-maerke stor">' + NK.html(maerke || "Prøvet") + "</span> " + (tekst || "");
                klasse = "gul";
            } else {
                html = '<span class="b-maerke stor">' + NK.html(maerke || "Rigtigt ✓") + "</span> " + (tekst || "") +
                    (foerste ? " " + NK.html(NK.tilfaeldig(D.ROS_OPGAVE)) : "");
                klasse = "god";
            }
            if (alle && foerste) html += " " + NK.html(D.FAERDIG[navn]);
            this.slut = { html: html, klasse: klasse };
            this.besked(html, klasse);
            this.visHintLys();
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Statuslinjen nederst i scenen ---------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (tekst, sek) {
            this.kortT = sek || 4;
            this.visBesked({ html: NK.html(tekst), klasse: "peger" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            if (this.el.status) this.el.status.className = "statuslinje" + (b.klasse ? " " + b.klasse : "");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        /* Linjen siger naeste skridt (eller slutbeskeden, naar opgaven er loest) */
        P.naesteLinje = function (foer, slags) {
            if (this.faerdig && this.slut) { this.besked(this.slut.html, this.slut.klasse); return; }
            var t = this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        /* Et forkert svar: beskeden, et ryst og en knap, der lyser stille */
        P.fejlLinje = function (html, maerke) {
            this.besked('<span class="b-maerke">' + NK.html(maerke || "Ikke endnu") + "</span> " + html, "skidt");
            this.pegKnap = true;
            this.visKnap();
            this.ryst();
        };

        P.ryst = function () {
            var e = this.el.status;
            if (!e) return;
            e.classList.remove("ryster");
            void e.offsetWidth;
            e.classList.add("ryster");
        };

        /* ----- Fokus ------------------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* ----- Tegneloekken: de korte beskeder har et ur --------------------------- */
        P.opdaterBesked = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
        };
    }

    NK.Fane = { paa: paa };
}());
