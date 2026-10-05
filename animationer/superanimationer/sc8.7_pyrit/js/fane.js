/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sc1.4 og sc8.6)

   Der er ingen laerer i denne animation. Al hjaelp staar i
   statuslinjen nederst i scenen, lige under det, eleven arbejder med,
   og knapperne sidder i samme linje.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: opgaverne med loest og stjerne (huskes i
       browseren). En opgave kan vaere laast, til den foer er loest.
     * statuslinjen: naeste skridt, fejl, hint og ros, med farve efter
       hvad der skete, og et ryst ved en fejl
     * den ene knap: Giv et hint > Naeste hint > Vis svaret > Naeste
       opgave. Den lyser stille op, naar eleven lige har svaret forkert.

   Fanen selv har: lavOpgave(i), trinLinje(), hintNu(), visSvar(),
   enter() og evt. laast(i), visKortEkstra(), fokusFelt(), tilpas().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc8.7-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver) {
            var mig = this;
            this.navn = navn;
            this.opgaver = opgaver;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.hjaelp = 0;
            this.pegKnap = false;
            this.faerdig = false;
            this.mellem = null;
            this.el = { knap: el("knap"), tjek: el("tjek"), liste: el("liste"), kort: el("kort"),
                besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortTimer = null;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            if (this.el.tjek) this.el.tjek.addEventListener("click", function () { mig.enter(); mig.fokus(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.forfra(); });
            this.bygListe();
        };

        /* Den foerste opgave, eleven ikke har loest (og som ikke er laast) */
        P.startOpgave = function () {
            for (var i = 0; i < this.opgaver.length; i++) {
                if (!this.status[i].loest) return i;
            }
            return 0;
        };

        P.idx = function (id) {
            for (var i = 0; i < this.opgaver.length; i++) if (this.opgaver[i].id === id) return i;
            return -1;
        };

        P.erLoest = function (id) { var i = this.idx(id); return i >= 0 && this.status[i].loest; };
        P.laast = function () { return false; };

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
            var raekke = document.createElement("div");
            raekke.className = "opg-chips lodret";
            this.opgaver.forEach(function (o, i) {
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "opg-chip";
                knap.innerHTML = '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" + NK.html(o.navn) +
                    (o.formel ? ' <span class="oc-formel">' + NK.html(o.formel) + "</span>" : "") + '</span><i class="oc-m"></i>';
                knap.addEventListener("click", function () {
                    if (mig.laast(i)) { mig.kortBesked("Den åbner, når opgaven før den er løst.", 4); return; }
                    mig.vaelg(i);
                });
                raekke.appendChild(knap);
                mig.chips[i] = knap;
            });
            this.el.liste.appendChild(raekke);
        };

        P.visListe = function () {
            var mig = this;
            this.status.forEach(function (s, i) {
                var c = mig.chips[i];
                if (!c) return;
                var laast = mig.laast(i);
                c.classList.toggle("valgt", i === mig.nr);
                c.classList.toggle("loest", s.loest);
                c.classList.toggle("stjerne", s.stjerne);
                c.classList.toggle("laast", laast);
                c.querySelector(".oc-m").textContent = laast ? "🔒" : (s.stjerne ? "★" : (s.loest ? "✓" : ""));
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
            if (this.efterListe) this.efterListe();
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.mellem = null;
            this.lavOpgave(i);
            this.visKort();
            this.visListe();
            this.naesteLinje("", "");
            if (this.tilpas) this.tilpas();
            this.fokus();
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            NK.saetTekst(navn + "-titel", o.navn);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            if (this.visKortEkstra) this.visKortEkstra();
            if (this.el.kort) this.el.kort.classList.toggle("sejr", this.faerdig);
            this.visKnap();
        };

        /* Hinttrappen for det, eleven staar i lige nu */
        P.hintTrin = function () {
            var h = this.hintNu ? this.hintNu() : null;
            return h && h.length ? h : ["Læs linjen her igen, og prøv dig frem."];
        };

        P.visKnap = function () {
            var tekst, klasse;
            if (this.faerdig) {
                klasse = "knap videre banker";
                var naeste = this.naesteUloeste();
                if (naeste >= 0) tekst = "Næste opgave →";
                else if (valg.naesteFane) tekst = "Videre til " + valg.naesteNavn + " →";
                else tekst = "Start forfra ↺";
            } else if (this.mellem) {
                klasse = "knap videre";
                tekst = this.mellem.tekst;
            } else {
                var h = this.hintTrin();
                klasse = "knap hjaelp";
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
                else tekst = "Vis svaret";
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            if (this.el.tjek) this.el.tjek.hidden = this.faerdig || !!this.mellem || !(this.harFelter && this.harFelter());
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest && !this.laast(i)) return i;
            }
            return -1;
        };

        /* ----- Knappen: ét skridt hjaelp ad gangen ------------------------------- */
        P.knap = function () {
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg(0);
                return;
            }
            if (this.mellem) {
                var f = this.mellem.gaa;
                this.mellem = null;
                f.call(this);
                this.visKnap();
                this.fokus();
                return;
            }
            var h = this.hintTrin();
            this.pegKnap = false;
            if (this.hjaelp < h.length) {
                this.hjaelp++;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " +
                    NK.html(h[this.hjaelp - 1]), "hint");
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            this.hjaelp = 0;
            this.visSvar();
            this.visKnap();
            this.fokus();
        };

        /* Eleven er kommet et skridt videre: hinttrappen begynder forfra */
        P.nulstilHjaelp = function () {
            this.hjaelp = 0;
            this.pegKnap = false;
            this.visKnap();
        };

        /* ----- Opgaven er loest --------------------------------------------------- */
        P.loest = function (maade, linje) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            this.faerdig = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.mellem = null;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            this.gem();
            var alle = this.antalLoest() === this.opgaver.length;
            var html = maade === "svar" ? '<span class="b-maerke">Svaret</span> ' + NK.html(linje || "") :
                '<span class="b-maerke stor">Rigtigt ✓</span> ' + NK.html(linje || "");
            if (alle && foerste) html += " " + NK.html(D.FAERDIG[navn]);
            this.besked(html, maade === "svar" ? "gul" : "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Statuslinjen nederst i scenen ---------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik, der
           forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            if (this.kortTimer) { clearTimeout(this.kortTimer); this.kortTimer = null; }
            this.visBesked(this.fast);
        };

        P.kortBesked = function (tekst, sek, klasse) {
            var mig = this;
            if (this.kortTimer) clearTimeout(this.kortTimer);
            this.visBesked({ html: NK.html(tekst), klasse: klasse || "peger" });
            this.kortTimer = setTimeout(function () {
                mig.kortTimer = null;
                mig.visBesked(mig.fast);
            }, (sek || 4) * 1000);
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            if (this.el.status) this.el.status.className = "statuslinje" + (b.klasse ? " " + b.klasse : "");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + NK.html(t), slags || "");
        };

        /* En god delbesked: groen linje med ét skridt videre */
        P.godLinje = function (tekst) {
            this.besked('<span class="b-maerke">Rigtigt</span> ' + NK.html(tekst), "god");
        };

        /* Svaret er vist: gul linje */
        P.svarLinje = function (tekst) {
            this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(tekst), "gul");
        };

        /* Et forkert svar: beskeden, et ryst og en knap, der lyser stille */
        P.fejlLinje = function (tekst) {
            this.besked('<span class="b-maerke">Ikke endnu</span> ' + NK.html(tekst), "skidt");
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

        /* ----- Fokus og forfra --------------------------------------------------- */
        P.erAktiv = function () {
            return NK.el("fane-" + navn).classList.contains("aktiv");
        };

        P.fokus = function () {
            if (!this.erAktiv() || document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* Knappen Start forfra og tasten R: den samme opgave fra begyndelsen */
        P.forfra = function () {
            this.vaelg(this.nr);
        };
    }

    NK.Fane = { paa: paa };
}());
