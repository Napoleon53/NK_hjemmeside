/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sc1.4 og sb4.4)

   Der er ingen laerer i denne animation. Al tekst staar paa ét lyst
   papirkort oeverst midt i scenen (papirkortet, brugerens valg 3. og
   4. nov. 2026; indfoert her 6. nov. 2026): opgaven, gaettet,
   spoergsmaalet med svarene, hint, forklaringen til et forkert svar,
   forklaringen til det rigtige svar og knapperne. Der staar intet
   nederst i scenen. Moenstret er scenekortet i sb4.4 og sc6.1.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: opgaverne med loest og stjerne (huskes i
       browseren). Start forfra (fanens forfraknap) ligger i panelet.
     * opgavens dele i raekkefoelge: gaet > forsoeg > felter > spm
       (se js/data.js)
     * gaettet staar stort paa kortet og er gratis: et klik paa et svar
       gaar videre. Under gaettet er forsoeget laast (spaer), og et greb
       i det faar kortet til at blinke.
     * forsoeget: eleven goer det, kortet siger. Er det at goere noget
       (lad tiden gaa, sejl), melder fanen selv, naar det er sket
       (forsoegKlaret). Er det at finde noget (to rør, en klods, faerrest
       klodser: forsoeg.indsend i js/data.js), sender eleven sit svar
       ind med Indsend svar, og fanen bedoemmer det (indsend). Tiden
       loeser aldrig en opgave af sig selv.
     * spoergsmaalet: et svar vaelger kun; Indsend svar sender det ind.
       Et forkert svar bliver roedt og kan ikke vaelges igen.
     * felterne paa tavlen (fane 3): Indsend svar (eller Enter i et felt)
       tjekker skemaet.
     * bliv paa spoergsmaalet: efter et rigtigt svar bliver kortet
       staaende, svaret bliver groent, forklaringen staar under svarene
       (NK.Papir.bliv), og knappen Naeste staar, hvor Indsend svar stod.
       Har opgaven en del mere, er det et mellemsvar (venter), og Naeste
       gaar til den naeste del.
     * kortets nederste raekke (x-status): det naeste skridt i scenen,
       hint, forklaringen til et forkert svar og svaret paa et klik i
       scenen, hjaelpeknappen (Giv et hint > Naeste hint > Vis svaret) og
       Indsend svar (graa, til der er noget at sende).

   Fanen selv har: nyOpgave(o), sceneLinje(), forsoegSvar(o), layout(),
   tegn(), opdaterScene(dt) og musen i scenen: overScene, nedScene,
   flytScene, opScene, klikScene. Fanen kalder forsoegKlaret(tekst),
   naar eleven har gjort det, forsoeget beder om. Med Indsend svar paa et
   forsoeg eller felter har fanen indsend(), kanIndsende() og
   ikkeKlarTekst(). Fanens layout begynder under top().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Kortets hoejde (uden gaettet): almindelig skaerm, lav skaerm og lav, smal
       skaerm (scenen under 800 px bred, fx 1100 x 700). Selvtesten maaler alle
       dele af alle opgaver med det laengste hint og den laengste forklaring i
       1400 x 860, 1366 x 700 og 1100 x 700. */
    var ZONE = { hoej: 212, lav: 176, lavSmal: 200 };

    function papir(html) { return NK.Papir ? NK.Papir.tekst(html) : html; }

    /* Gaettets tekst: indledningen og selve gaettet (den sidste saetning) */
    function delGaet(t) {
        var m = String(t).match(/^(.*[.!?])\s+([A-ZÆØÅ][^.!?]*[.!?])$/);
        return m ? { intro: m[1], spm: m[2] } : { intro: "", spm: t };
    }

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc8.6-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver) {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.opgaver = opgaver;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.hjaelp = 0;
            this.pegKnap = false;
            this.valgt = null;
            this.el = { knap: el("knap"), indsend: el("indsend"), liste: el("liste"), skort: el("skort"), ind: el("ind"),
                besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.nuB = this.fast;
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.forfra(); mig.fokus(); });
            /* Svarene og den groenne knap paa kortet */
            this.el.skort.addEventListener("click", function (e) {
                var t = e.target;
                if (!t || !t.closest) return;
                if (t.closest("[data-videre]")) { mig.knap(); return; }
                var k = t.closest("[data-valg]");
                if (k && !k.disabled) mig.valgKlik(parseInt(k.getAttribute("data-valg"), 10));
            });
            this.bygListe();
            this.koblMus();
            /* Den foerste opgave, eleven ikke har loest */
            this.nr = this.opgaver.length - 1;
            var foerste = this.naesteUloeste();
            this.vaelg(foerste >= 0 ? foerste : 0);
        };

        P.idx = function (id) {
            for (var i = 0; i < this.opgaver.length; i++) if (this.opgaver[i].id === id) return i;
            return -1;
        };

        P.erLoest = function (id) { return this.status[this.idx(id)].loest; };

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
                knap.title = o.navn;
                knap.innerHTML = '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" + NK.html(o.navn) + '</span><i class="oc-m"></i>';
                knap.addEventListener("click", function () { mig.vaelg(i); });
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
                c.classList.toggle("valgt", i === mig.nr);
                c.classList.toggle("loest", s.loest);
                c.classList.toggle("stjerne", s.stjerne);
                c.querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.venter = false;
            this.slut = null;
            this.mellem = null;
            this.valgt = null;
            this.lavOpgave(i);
            this.visKort();
            this.layout();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        /* Opgavens dele i den raekkefoelge, de kommer */
        P.lavOpgave = function (i) {
            var o = this.opgaver[i], faser = [];
            ["gaet", "forsoeg", "felter", "spm"].forEach(function (f) { if (o[f]) faser.push(f); });
            this.opg = { o: o, faser: faser, fi: 0, fase: faser[0], gaet: -1, forkert: {}, rigtig: undefined };
            if (this.nyOpgave) this.nyOpgave(o);
        };

        P.gaetNu = function () { return !!this.opg && !this.faerdig && !this.venter && this.opg.fase === "gaet"; };

        /* Eleven er midt i forsoeget, og det er ikke klaret endnu */
        P.iForsoeg = function () { return !!this.opg && !this.faerdig && !this.venter && this.opg.fase === "forsoeg"; };

        /* Videre til opgavens naeste del. Giver true, hvis der ikke er flere. */
        P.naesteFase = function () {
            var g = this.opg;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.valgt = null;
            if (g.fi >= g.faser.length - 1) return true;
            g.fi++;
            g.fase = g.faser[g.fi];
            if (this.nyFase) this.nyFase(g.fase);
            this.visKort();
            this.layout();
            return false;
        };

        /* Det, eleven gaettede paa, holdt eller holdt ikke */
        P.gaetDom = function () {
            var g = this.opg;
            if (g.gaet < 0) return "";
            return g.o.gaet.svar[g.gaet].ok ? "Dit gæt holdt. " : "Dit gæt holdt ikke. ";
        };

        /* ----- Scenekortet ------------------------------------------------------------ */
        P.slutNu = function () {
            if (this.faerdig) return this.slut;
            if (this.venter) return this.mellem;
            return null;
        };

        P.visKort = function () {
            var e = this.el.skort, slut = this.slutNu();
            var kl = "scenekort " + (this.gaetNu() ? "gaet" : (slut ? "loest bliv" + (slut.maade === "svar" ? " svar" : "") :
                (this.opg.fase === "spm" ? "spm" : "opgave")));
            if (e.className.replace(" blink", "") !== kl) e.className = kl + (e.classList.contains("blink") ? " blink" : "");
            NK.saetHTML(navn + "-ind", this.kortHTML());
            this.visKnap();
        };

        P.kortHTML = function () {
            var g = this.opg, o = g.o, mig = this, html;
            if (this.gaetNu()) {
                var dele = delGaet(o.gaet.tekst);
                html = '<span class="gk-maerke">Gæt først</span>';
                if (dele.intro) html += '<p class="gk-intro">' + NK.html(dele.intro) + "</p>";
                html += '<p class="gk-tekst">' + NK.html(dele.spm) + '</p><div class="gk-svar n' + o.gaet.svar.length + '">';
                o.gaet.svar.forEach(function (sv, j) {
                    html += '<button type="button" class="gk-knap" data-valg="' + j + '"><span class="v-bogstav">' + "ABC".charAt(j) +
                        "</span><span>" + NK.html(sv.t) + "</span></button>";
                });
                return html + "</div>";
            }
            var slut = this.slutNu(), vist = !!slut && slut.maade === "svar";
            var del = o[g.fase];
            var chip = "Opgave " + (this.nr + 1) + " af " + this.opgaver.length;
            html = '<p class="sk-tekst"><span class="sk-chip">' + chip + "</span>" + papir(NK.html(del.tekst)) + "</p>";
            /* Gaettet staar under opgaven, mens det proeves */
            if (g.gaet >= 0 && g.fase === "forsoeg" && !slut) {
                html += '<p class="sk-gaet">Dit gæt: <b>' + NK.html(o.gaet.svar[g.gaet].t) + "</b></p>";
            }
            if (g.fase === "spm") {
                html += '<div class="sk-svar n' + del.svar.length + '">';
                del.svar.forEach(function (sv, j) {
                    var kl = "sk-knap", laast = false;
                    if (slut) {
                        kl += sv.ok ? (vist ? " svar-vist" : " rigtig") : (g.forkert[j] ? " forkert" : " dim");
                        laast = true;
                    } else if (g.forkert[j]) { kl += " forkert"; laast = true; }
                    else if (mig.valgt === j) kl += " valgt";
                    html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                        '<span class="v-bogstav">' + "ABC".charAt(j) + "</span><span>" + NK.html(sv.t) + "</span></button>";
                });
                html += "</div>";
            }
            if (slut) {
                html += NK.Papir.bliv(NK.html(slut.tekst || ""), vist ? "Svaret" : (slut.maerke || "Rigtigt"),
                    NK.html(this.videreTekst()), vist);
            }
            return html;
        };

        /* Teksten paa den knap, der foerer videre. Den gaar altid fremad;
           forfra ligger i panelet (brugeren 3. nov. 2026). */
        P.videreTekst = function () {
            if (!this.faerdig) return "Næste →";
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            return valg.naesteFane ? "Videre til " + valg.naesteNavn + " →" : "Næste opgave →";
        };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen. Scenen begynder
           under den, saa intet flytter sig, naar kortet skifter. Paa en smal
           skaerm knaekker teksten flere gange; saa faar kortet den plads, det
           fylder. Gaettet taeller ikke med: forsoeget er laast imens, og et
           svar paa et klik i scenen, der er vaek om lidt, flytter heller
           ikke noget. */
        P.kortZone = function () {
            var basis = this.zoneBasis();
            if (this.kortT > 0 && this.lay && this.lay.zone >= basis) return this.lay.zone;
            var h = this.gaetNu() ? 0 : this.el.skort.offsetHeight;
            return Math.max(basis, h);
        };

        P.zoneBasis = function () {
            if (window.innerHeight > 720) return ZONE.hoej;
            return this.L.b < 800 ? ZONE.lavSmal : ZONE.lav;
        };

        P.top = function () { return 10 + this.kortZone() + 10; };

        P.tjekZone = function () {
            if (!this.lay || this.lay.zone === undefined) return;
            if (this.kortZone() !== this.lay.zone) this.layout();
        };

        /* Kortet blinker bloedt: eleven greb ud efter forsoeget, men skal
           foerst gaette (eller trykke Naeste) */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: under et gaet saetter et greb i forsoeget intet i gang. Fanen
           begynder alt, der saetter noget i gang, med  if (this.spaer()) return; */
        P.spaer = function () {
            if (!this.gaetNu()) return false;
            this.kortBlink();
            this.kortBesked(D.GAET_LINJE, 4, "gul");
            return true;
        };

        /* ----- Svarknapperne paa kortet ------------------------------------------------- */
        P.valgKlik = function (j) {
            var g = this.opg;
            if (this.faerdig || this.venter) return;
            if (g.fase === "gaet") { this.gaetValg(j); return; }
            if (g.fase !== "spm" || g.forkert[j]) return;
            this.valgt = j;
            this.nulstilHjaelp();
            /* En forklaring til et forkert svar bliver staaende, til der er valgt nyt */
            if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.naesteLinje("", "");
            this.visKort();
        };

        /* Et gaet er gratis: det gaar videre med det samme */
        P.gaetValg = function (j) {
            this.opg.gaet = j;
            this.naesteFase();
            this.naesteLinje("", "");
            if (this.efterGaet) this.efterGaet();
            this.fokus();
        };

        /* Det, Indsend svar sender ind lige nu: "spm", "felter", "forsoeg" eller null */
        P.indsendSlags = function () {
            if (!this.opg || this.faerdig || this.venter) return null;
            var g = this.opg;
            if (g.fase === "spm" || g.fase === "felter") return g.fase;
            if (g.fase === "forsoeg" && g.o.forsoeg.indsend) return "forsoeg";
            return null;
        };

        P.kanSendes = function () {
            var s = this.indsendSlags();
            if (!s) return false;
            if (s === "spm") return this.valgt !== null && this.valgt !== undefined;
            return this.kanIndsende ? !!this.kanIndsende() : true;
        };

        P.indsendKlik = function () {
            var s = this.indsendSlags();
            if (!s) return;
            if (!this.kanSendes()) {
                this.kortBlink();
                var t = s === "spm" ? D.VAELG_SVAR : (this.ikkeKlarTekst && this.ikkeKlarTekst());
                if (t) this.kortBesked(t, 4);
                return;
            }
            if (s === "spm") this.sendSvar(this.valgt);
            else this.indsend();
            this.fokus();
        };

        /* Et svar paa spoergsmaalet bedoemmes. Spoergsmaalet er altid opgavens sidste del. */
        P.sendSvar = function (j) {
            var g = this.opg, o = g.o;
            this.valgt = null;
            if (o.spm.svar[j].ok) {
                g.rigtig = j;
                this.loest("selv", o.loest);
                return;
            }
            g.forkert[j] = true;
            this.visKort();
            this.fejlLinje(o.spm.svar[j].f);
        };

        /* Fanen melder, at eleven har gjort det, forsoeget beder om (eller har
           sendt det rigtige ind). Har opgaven en del mere, bliver kortet paa
           forsoeget med knappen Naeste. */
        P.forsoegKlaret = function (set, slutTekst) {
            if (!this.iForsoeg()) return;
            var g = this.opg, maerke = g.o.forsoeg.indsend ? "Rigtigt" : "Godt";
            if (g.fi >= g.faser.length - 1) { this.loest("selv", this.gaetDom() + (slutTekst || g.o.loest), maerke); return; }
            this.mellemsvar("selv", this.gaetDom() + (set || ""), maerke);
        };

        /* Hinttrappen for den del af opgaven, eleven staar i lige nu */
        P.hintTrin = function () {
            var g = this.opg;
            if (g.fase === "gaet") return D.GAET_HINT;
            return g.o[g.fase].hint;
        };

        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.length ? h : ["Læs opgaven på kortet igen, og prøv dig frem i scenen."];
        };

        P.visSvar = function () {
            var g = this.opg, o = g.o;
            if (g.fase === "gaet") { this.gaetValg(0); return; }
            if (g.fase === "spm") {
                o.spm.svar.forEach(function (sv, j) { if (sv.ok) g.rigtig = j; });
                this.valgt = null;
                this.loest("svar", o.loest);
                return;
            }
            if (g.fase === "felter") { this.felterSvar(o); return; }
            var slutTekst = this.forsoegSvar(o);
            if (g.fi >= g.faser.length - 1) { this.loest("svar", slutTekst || o.loest); return; }
            this.mellemsvar("svar", o.forsoeg.set || "");
        };

        /* ----- Knapperne i kortets nederste raekke ---------------------------------------- */
        P.visKnap = function () {
            var tekst = "Giv et hint", klasse = "knap hjaelp";
            if (!this.faerdig && !this.venter && !this.gaetNu()) {
                var h = this.hintNu();
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
                else { tekst = "Vis svaret"; klasse += " svar"; }
                if (this.pegKnap) klasse += " peg";
            }
            if (this.el.knap.textContent !== tekst) this.el.knap.textContent = tekst;
            if (this.el.knap.className !== klasse) this.el.knap.className = klasse;
            this.visIndsend();
            this.visBund();
        };

        /* Indsend svar staar kun fremme, naar der er noget at sende ind; graa,
           til der er valgt et svar, skrevet i felterne eller set nok i scenen */
        P.visIndsend = function () {
            var e = this.el.indsend, s = this.indsendSlags();
            e.hidden = !s;
            if (!s) return;
            var kan = this.kanSendes();
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        /* Kortets nederste raekke: beskeden og knapperne. Under et gaet og naar
           kortet bliver paa et rigtigt svar, er raekken vaek, medmindre et klik
           i scenen lige har faaet et svar. */
        P.visBund = function () {
            var slut = this.faerdig || this.venter || this.gaetNu();
            var b = this.nuB || this.fast, harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = slut;
            var st = this.el.status;
            st.hidden = slut && !harTekst;
            var kl = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom") +
                (st.classList.contains("ryster") ? " ryster" : "");
            if (st.className !== kl) st.className = kl;
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Knappen: ét skridt hjaelp ad gangen (og den groenne knap paa kortet) ------- */
        P.knap = function () {
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg((this.nr + 1) % this.opgaver.length);
                return;
            }
            if (this.venter) {
                this.venter = false;
                this.mellem = null;
                this.naesteFase();
                this.naesteLinje("", "");
                this.fokus();
                return;
            }
            if (this.gaetNu()) return;
            var h = this.hintNu();
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
            this.visSvar();
            this.visKnap();
            this.fokus();
        };

        /* Eleven har gjort noget nyt: hinttrappen begynder forfra */
        P.nulstilHjaelp = function () {
            if (this.hjaelp === 0) return;
            this.hjaelp = 0;
            this.visKnap();
        };

        /* ----- Rigtigt ------------------------------------------------------------------ */
        P.loest = function (maade, linje, maerke) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            this.faerdig = true;
            this.venter = false;
            this.mellem = null;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.valgt = null;
            if (maade === "svar") this.brugtSvar = true;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            this.gem();
            this.sejrT = 0;
            var alle = this.antalLoest() === this.opgaver.length;
            this.slut = { maade: maade, maerke: maerke || "Rigtigt",
                tekst: (linje || "") + (alle && foerste ? " " + D.FAERDIG[navn] : "") };
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* Et rigtigt svar, og opgaven har en del mere: kortet bliver paa delen,
           og eleven gaar selv videre med knappen Naeste */
        P.mellemsvar = function (maade, tekst, maerke) {
            if (maade === "svar") this.brugtSvar = true;
            this.venter = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.valgt = null;
            this.mellem = { maade: maade, tekst: tekst || "", maerke: maerke || "Godt" };
            this.besked("", "");
            this.visKort();
        };

        /* ----- Beskeden i kortets nederste raekke ----------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (tekst, sek, klasse) {
            this.kortT = sek || 4;
            this.visBesked({ html: NK.html(tekst), klasse: klasse || "peger" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (e.innerHTML !== b.html) e.innerHTML = b.html;
            this.nuB = b;
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        /* Alt, hvad kortet siger lige nu (selvtesten) */
        P.kortTekst = function () { return this.el.skort.innerText.replace(/\s+/g, " "); };

        /* Det naeste skridt i scenen, som det staar i kortets nederste raekke */
        P.trinLinje = function () {
            if (!this.opg || this.faerdig || this.venter || this.gaetNu()) return "";
            var g = this.opg;
            if (g.fase === "spm") return (this.spmLinje && this.spmLinje()) || "";
            return this.sceneLinje ? this.sceneLinje() : "";
        };

        P.naesteLinje = function (foer, slags) {
            var t = this.trinLinje();
            this.sidsteTrin = t;
            this.besked((foer ? foer + " " : "") + NK.html(t), slags || "");
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
            e.classList.remove("ryster");
            void e.offsetWidth;
            e.classList.add("ryster");
        };

        /* ----- Fokus, forfra og opgaver ------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* Knappen Forfra i panelet og tasten R: fanen nulstiller scenen, opgaven bliver */
        P.forfra = function () {
            if (this.nulstilScene) this.nulstilScene();
            if (this.lay) this.layout();
            this.nulstilHjaelp();
            if (!this.faerdig && !this.venter) this.naesteLinje("", "");
        };

        P.nulstil = function () { this.forfra(); };

        /* Enter: Indsend svar, Naeste, eller det, fanen selv goer (lad tiden gaa) */
        P.enterKort = function () {
            if (this.faerdig || this.venter) { this.knap(); return true; }
            if (this.gaetNu()) { this.kortBlink(); return true; }
            var s = this.indsendSlags();
            if (s === "felter" || ((s === "spm" || s === "forsoeg") && this.kanSendes())) { this.indsendKlik(); return true; }
            return false;
        };

        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay) this.layout();
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el(navn + "-anker-" + id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(Math.max(1, b)) + "px";
            e.style.height = Math.round(Math.max(1, h)) + "px";
        };

        /* Der er intet baand nederst i scenen: al tekst staar paa kortet oeverst */
        P.baand = function () {
            return { y: this.L.h, h: 0 };
        };

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            if (this.sejrT !== undefined && this.sejrT !== null) this.sejrT += dt;
            if (this.opdaterScene) this.opdaterScene(dt);
            /* Linjen foelger med, naar noget skifter (et hint eller en fejl bliver staaende) */
            if (!this.faerdig && !this.venter && !this.kortT && this.fast.klasse === "") {
                var t = this.trinLinje();
                if (t !== this.sidsteTrin) this.naesteLinje("", "");
            }
            this.visIndsend();
            this.tjekZone();
        };

        /* Det groenne glimt over scenen, naar en opgave er loest */
        P.tegnSejr = function (ctx, W, H) {
            if (!this.faerdig || this.sejrT === undefined || this.sejrT > 0.9) return;
            ctx.save();
            ctx.globalAlpha = 0.14 * (1 - this.sejrT / 0.9);
            ctx.fillStyle = "#3fae72";
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
        };

        /* ----- Musen -------------------------------------------------------------
           Holder fanen tag i noget, faar den ogsaa flytningerne og slippet,
           ogsaa uden for laerredet. */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            this.greb = false;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.greb && mig.flytScene) { mig.flytScene(pt); return; }
                var u = mig.overScene ? mig.overScene(pt) : null;
                c.style.cursor = u === "greb" ? "grab" : (u ? "pointer" : "default");
            });
            c.addEventListener("pointerleave", function () {
                if (!mig.greb) { if (mig.overScene) mig.overScene(null); c.style.cursor = "default"; }
            });
            c.addEventListener("pointerdown", function (e) {
                if (e.button !== undefined && e.button !== 0) return;
                mig.slapNetop = false;
                var pt = mig.L.punkt(e);
                if (mig.nedScene && mig.nedScene(pt)) {
                    mig.greb = true;
                    c.style.cursor = "grabbing";
                    try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                    e.preventDefault();
                }
            });
            function slip(e) {
                if (!mig.greb) return;
                mig.greb = false;
                c.style.cursor = "default";
                if (mig.opScene) mig.opScene(mig.L.punkt(e));
                mig.slapNetop = true;
            }
            c.addEventListener("pointerup", slip);
            c.addEventListener("pointercancel", slip);
            c.addEventListener("click", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.slapNetop) { mig.slapNetop = false; return; }
                if (mig.klikScene) mig.klikScene(pt);
                mig.fokus();
            });
        };
    }

    NK.Fane = { paa: paa, ZONE: ZONE };
}());
