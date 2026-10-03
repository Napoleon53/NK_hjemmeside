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

   NK.Tavle.reaktion tegner reaktionsskemaet (som sb2.1). Et stof, hintet
   handler om, lyser gult alle steder i fanen, hvor det har data-s.

   Fanen selv har: lavOpgave(nr), promptHTML(), hintTrin(), visSvar(),
   trinLinje(), enter(), nulstil() og fokusFelt().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;

    /* Kc med det lille c: teksterne skrives "Kc" og vises som K<sub>c</sub> */
    NK.kc = function (html) { return String(html).replace(/\bKc\b/g, "K<sub>c</sub>"); };

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sb2.3-" + navn;

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
            this.hintS = null;        /* det stof, hintet handler om */
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
                raekke.className = "opg-chips";
                mig.opgaver.forEach(function (o, i) {
                    if ((o.gruppe || "alle") !== g.id) return;
                    var knap = document.createElement("button");
                    knap.type = "button";
                    knap.className = "opg-chip";
                    knap.title = o.navn;
                    knap.innerHTML = '<span class="oc-f">' + (i + 1) + '</span><span class="oc-n">' + NK.html(o.navn) + '</span><i class="oc-m"></i>';
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
                c.classList.toggle("paabegyndt", !s.loest && !!(mig.paabegyndt && mig.paabegyndt(i)));
                c.querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
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
            this.hintS = null;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.slut = null;
            this.lavOpgave(i);
            this.visKort();
            this.visListe();
            this.naesteLinje("", "");
            this.tilpas();
            this.fokus();
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            NK.saetTekst(navn + "-titel", o.navn);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", NK.kc(this.promptHTML()));
            this.el.kort.classList.toggle("sejr", this.faerdig);
            this.visKnap();
        };

        /* Hinttrappen for den tilstand, eleven staar i lige nu */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.trin && h.trin.length ? h : { s: null, trin: ["Læs linjen her igen, og prøv det, den siger."] };
        };

        P.visKnap = function () {
            var tekst, klasse;
            if (this.faerdig) {
                klasse = "knap videre banker";
                var naeste = this.naesteUloeste();
                if (naeste >= 0) tekst = valg.videreTekst || "Næste opgave →";
                else if (valg.naesteFane) tekst = "Videre til " + valg.naesteNavn + " →";
                else tekst = valg.videreTekst || "Næste opgave →";
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
                this.hintS = h.s;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.trin.length + "</span> " +
                    NK.html(h.trin[this.hjaelp - 1]), "hint");
                this.visLys();
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            this.visSvar();
            this.visKnap();
            this.fokus();
        };

        /* Eleven har rettet noget: hinttrappen begynder forfra, for nu er
           naeste skridt et andet */
        P.nulstilHjaelp = function () {
            if (this.hjaelp === 0 && !this.hintS) return;
            this.hjaelp = 0;
            this.hintS = null;
            this.visLys();
            this.visKnap();
        };

        /* Det stof eller de stoffer, hintet handler om, lyser i fanen */
        P.visLys = function () {
            var lys = this.faerdig ? null : this.hintS;
            var rod = NK.el("fane-" + navn);
            var arter = rod ? rod.querySelectorAll("[data-s]") : [];
            var liste = !lys ? [] : (Array.isArray(lys) ? lys : [lys]);
            for (var i = 0; i < arter.length; i++) arter[i].classList.toggle("lys", liste.indexOf(arter[i].getAttribute("data-s")) >= 0);
        };

        /* ----- Opgaven er loest --------------------------------------------------- */
        P.loest = function (maade, tekst, maerke) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            this.faerdig = true;
            this.hjaelp = 0;
            this.hintS = null;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            this.gem();
            var alle = this.antalLoest() === this.opgaver.length;
            var html;
            if (maade === "svar") {
                html = '<span class="b-maerke">Svaret</span> ' + (tekst || "");
            } else {
                html = '<span class="b-maerke stor">' + NK.html(maerke || "Rigtigt ✓") + "</span> " + (tekst || "") +
                    (foerste ? " " + NK.html(NK.tilfaeldig(D.ROS_OPGAVE)) : "");
            }
            if (alle && foerste) html += " " + NK.html(D.FAERDIG[navn]);
            this.slut = { html: html, klasse: maade === "svar" ? "gul" : "god" };
            this.besked(html, this.slut.klasse);
            this.visLys();
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
            e.innerHTML = NK.kc(b.html);
            if (this.el.status) this.el.status.className = "statuslinje" + (b.klasse ? " " + b.klasse : "");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        P.naesteLinje = function (foer, slags) {
            if (this.faerdig && this.slut) { this.besked(this.slut.html, this.slut.klasse); return; }
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + NK.html(t), slags || "");
        };

        /* Et forkert svar: beskeden, et ryst og en knap, der lyser stille */
        P.fejlLinje = function (tekst, maerke) {
            this.besked('<span class="b-maerke">' + NK.html(maerke || "Ikke endnu") + "</span> " + NK.html(tekst), "skidt");
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

        /* ----- Fokus ---------------------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        P.tilpas = function () {};

        /* ----- Tegneloekken: kun de korte beskeder har et ur ------------------------ */
        P.opdaterBesked = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
        };

        P.opdater = function (dt) { this.opdaterBesked(dt); };
    }

    NK.Fane = { paa: paa };

    /* ===================================================================
       Reaktionsskemaet: hvert stof er en knap med koefficient, formel og
       tilstandsform, og ligevaegtspilen er tegnet som to halve pile.
       =================================================================== */
    var PIL_SVG = '<svg viewBox="0 0 34 22" aria-hidden="true">' +
        '<g class="halv-op"><path d="M3 8 H30 L23 2.5" /></g>' +
        '<g class="halv-ned"><path d="M31 14 H4 L11 19.5" /></g></svg>';

    function reaktion(el, opg, klik) {
        el.innerHTML = "";
        var arter = M.alle(opg);
        arter.forEach(function (a, i) {
            if (i === opg.r.length) {
                var pil = document.createElement("span");
                pil.className = "ligepil";
                pil.innerHTML = PIL_SVG;
                el.appendChild(pil);
            } else if (i > 0) {
                var plus = document.createElement("span");
                plus.className = "sk-plus";
                plus.textContent = "+";
                el.appendChild(plus);
            }
            var k = document.createElement("button");
            k.type = "button";
            k.className = "art";
            k.setAttribute("data-s", a.s);
            k.innerHTML = (a.k > 1 ? '<span class="koef">' + a.k + "</span>" : "") +
                '<span class="fo">' + NK.html(M.skriv(a.s)) + "</span>" +
                '<span class="ti">(' + a.t + ")</span>";
            k.addEventListener("click", function () { if (klik) klik(a); });
            el.appendChild(k);
        });
    }

    NK.Tavle = { reaktion: reaktion };
}());
