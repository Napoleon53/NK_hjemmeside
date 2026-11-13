/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sb2.1 og sc1.4)

   Der er ingen laerer i denne animation. Opgaven, beskeden, hintet og
   Indsend svar staar paa det lyse papirkort oeverst i midten af scenen
   (Niels 4. nov. 2026, ../faelles/papirkort.css og .js). Panelet har
   listen og forfra.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: opgaverne i grupper, med loest og stjerne
       (huskes i browseren)
     * papirkortet: opgaven, beskeden (naeste skridt, fejl, hint) og
       Indsend svar; efter et rigtigt svar forklaringen og Naeste
     * hintknappen: Giv et hint > Naeste hint > Vis svaret. Den lyser
       stille op, naar eleven lige har svaret forkert.

   NK.Tavle.reaktion tegner reaktionsskemaet (som sb2.1). Et stof, hintet
   handler om, lyser gult alle steder i fanen, hvor det har data-s.

   Fanen selv har: lavOpgave(nr), kortData(), kanIndsende(), tjek(),
   hintTrin(), visSvar(), trinLinje(), enter(), nulstil() og fokusFelt().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;

    /* Kc med det lille c: teksterne skrives "Kc" og vises som K<sub>c</sub> */
    NK.kc = function (html) { return String(html).replace(/\bKc\b/g, "K"); };

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
            this.el = { knap: el("knap"), indsend: el("indsend"), liste: el("liste"), kort: el("kort"), skort: el("skort"),
                ind: el("ind"), besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.nuB = null;
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            this.el.skort.addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest("[data-videre]")) mig.knap();
            });
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

        /* Den hoejde, kortet har faaet sat af oeverst i scenen (CSS: --kz).
           Arbejdet begynder under den, saa kortet aldrig daekker det.
           Selvtesten maaler kortet med det laengste hint og forklaringen. */
        P.kortZone = function () {
            var v = parseFloat(window.getComputedStyle(this.el.skort.parentNode).getPropertyValue("--kz"));
            return isFinite(v) ? v : 190;
        };

        /* ----- Papirkortet ------------------------------------------------------------
           Kortet har etiketten (Opgave 2 af 8), opgaven og nederst beskeden,
           Giv et hint og Indsend svar. Efter et rigtigt svar bliver kortet
           paa opgaven med forklaringen, og Naeste staar, hvor Indsend svar
           stod. Fanen giver kortData(): { tekst, spm } som HTML. */
        P.visKort = function () {
            var e = this.el.skort;
            var kl = "scenekort " + (this.faerdig ? "loest bliv" + (this.slut && this.slut.maade === "svar" ? " svar" : "") : "opgave");
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            NK.saetHTML(navn + "-ind", NK.kc(this.kortHTML()));
            if (this.el.kort && this.panelHTML) {
                var ph = this.panelHTML();
                this.el.kort.hidden = !ph;
                NK.saetHTML(navn + "-prompt", NK.kc(ph));
            }
            this.visKnap();
        };

        P.kortHTML = function () {
            var d = this.kortData();
            var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(valg.chip + " " + (this.nr + 1) + " af " + this.opgaver.length) + "</span>" +
                (d.tekst ? NK.Papir.tekst(d.tekst) + " " : "") + (d.spm ? '<span class="sk-spm">' + d.spm + "</span>" : "") + "</p>";
            if (this.faerdig) html += this.blivHTML();
            return html;
        };

        P.blivHTML = function () {
            var slut = this.slut || { maade: "ok", tekst: "" }, vist = slut.maade === "svar";
            var knap = this.videreTekst();
            var maerke = vist ? "Svaret" : (slut.maerke || "Rigtigt");
            var h = NK.Papir.bliv(slut.tekst || "", NK.html(maerke), NK.html(knap), vist);
            /* Ingen knap efter den sidste opgave paa den sidste fane (forfra ligger i panelet) */
            return knap ? h : h.replace(/<button[^>]*data-videre[^>]*><\/button>/, "");
        };

        /* Kortets knap gaar altid fremad (brugeren 3. nov. 2026) */
        P.videreTekst = function () {
            if (this.naesteUloeste() >= 0) return valg.videreTekst || "Næste opgave →";
            if (valg.naesteFane) return "Videre til " + valg.naesteNavn + " →";
            if (this.nr < this.opgaver.length - 1) return valg.videreTekst || "Næste opgave →";
            return "";
        };

        P.kortTekst = function () { return this.el.skort.textContent; };

        /* Kortet blinker: eleven greb ud efter scenen, men skal foerst goere
           det, kortet siger */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: naar opgaven er loest, saetter et klik i scenen intet i gang */
        P.spaer = function () {
            if (!this.faerdig) return false;
            this.kortBlink();
            return true;
        };

        /* Hinttrappen for den tilstand, eleven staar i lige nu */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.trin && h.trin.length ? h : { s: null, trin: ["Læs opgaven på kortet igen, og prøv det, den siger."] };
        };

        P.visKnap = function () {
            if (!this.faerdig) {
                var h = this.hintNu(), tekst, klasse = "knap hjaelp";
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.trin.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.trin.length + ")";
                else { tekst = "Vis svaret"; klasse += " svar"; }
                if (this.pegKnap) klasse += " peg";
                this.el.knap.textContent = tekst;
                this.el.knap.className = klasse;
            }
            this.visIndsend();
            this.visBund();
        };

        P.kanSendes = function () {
            return !this.faerdig && !!(this.kanIndsende && this.kanIndsende());
        };

        /* Indsend svar: graa, til der er noget at sende ind */
        P.visIndsend = function () {
            var e = this.el.indsend;
            e.hidden = !!this.faerdig;
            if (this.faerdig) return;
            var kan = this.kanSendes();
            var t = (kan && this.indsendTekst && this.indsendTekst()) || "Indsend svar";
            if (e.textContent !== t) e.textContent = t;
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        P.indsendKlik = function () {
            if (this.faerdig) return;
            if (!this.kanSendes()) { this.kortBlink(); return; }
            this.tjek();
            this.visKnap();
            this.fokus();
        };

        /* Kortets nederste raekke er vaek, naar opgaven er loest */
        P.visBund = function () {
            var b = this.nuB || this.fast || { html: "", klasse: "" };
            var harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = !!this.faerdig;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.hidden = !!this.faerdig;
            this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom") + (ryster ? " ryster" : "");
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Hintknappen og kortets groenne knap --------------------------------- */
        P.knap = function () {
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else if (this.nr < this.opgaver.length - 1) this.vaelg(this.nr + 1);
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
            if (this.hjaelp === 0 && !this.hintS) { this.visIndsend(); return; }
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

        /* ----- Opgaven er loest ---------------------------------------------------
           maade: "ok" eller "svar" (Vis svaret). tekst er HTML. Kortet bliver
           paa opgaven med forklaringen og knappen, der foerer videre. */
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
            this.slut = { maade: maade, maerke: (maerke || "Rigtigt").replace(/\s*✓$/, ""),
                tekst: (tekst || "") + (alle && foerste ? " " + NK.html(D.FAERDIG[navn]) : "") };
            this.besked("", "");
            this.visLys();
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Beskeden i kortets nederste raekke --------------------------------------
           besked: den faste tekst. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. Efter et rigtigt svar
           blinker kortet i stedet. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (tekst, sek) {
            if (this.spaer()) return;
            this.kortT = sek || 4;
            this.visBesked({ html: NK.html(tekst), klasse: "peger" });
        };

        P.visBesked = function (b) {
            this.el.besked.innerHTML = NK.kc(b.html);
            this.nuB = b;
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + NK.html(t), slags || "");
        };

        /* Et forkert svar: beskeden, et ryst og en hintknap, der lyser stille */
        P.fejlLinje = function (tekst, maerke) {
            this.besked('<span class="b-maerke">' + NK.html(maerke || "Ikke endnu") + "</span> " + NK.html(tekst), "skidt");
            this.pegKnap = true;
            this.visKnap();
            this.ryst();
        };

        P.ryst = function () {
            var e = this.el.status;
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
