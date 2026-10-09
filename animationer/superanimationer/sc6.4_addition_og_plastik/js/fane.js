/* =====================================================================
   fane.js - det, de tre faner har til faelles (fra sc7.5, som bygger
   paa sc8.6 og sc1.4). Aendres moensteret i sc7.5, hentes filen derfra
   igen; det, der er rettet her, er NOEGLE og tegningen paa gaetkortet (figur).

   Der er ingen laerer i denne animation, og der staar ingen tekst nederst
   i scenen: AL tekst staar paa ét kort oeverst midt i scenen (brugerens
   oensker 9. okt. 2026), og hjaelpeknappen sidder paa kortet.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype.
   valg: navn (forstavelsen paa fanens id'er), naesteFane og naesteNavn
   (knappen efter den sidste opgave).

     * listen i panelet: opgaverne med loest og stjerne (huskes i browseren)
     * maalets dele i raekkefoelge: gaet > forsoeg > felter > spm > spm2
       (se js/data.js)
     * scenekortet (visKort, kortHTML): gaettet, det, eleven skal goere, og
       spoergsmaalene med deres svar staar samme sted hele vejen, fordi
       eleverne klikker, foer de laeser. Et gaet er stort og gult, pulserer
       stille og blinker, hvis eleven klikker paa forsoeget foerst
       (gaetBlink). Naar svaret er rigtigt, bliver kortet groent med
       svaret, forklaringen og knappen Naeste opgave eller Naeste
       spoergsmaal (slutNu, videreTekst). Efter et forsoeg med et gaet
       eller et set staar det, eleven saa, alene paa det groenne kort,
       foer spoergsmaalet kommer. Panelet har intet opgavekort.
     * kortets nederste raekke (x-status: besked, kortBesked, fejlLinje,
       visBund): hint, forklaringen til et forkert svar, det, fanen har at
       tilfoeje til opgaveteksten (sceneLinje, spmLinje), og svaret paa et
       klik i scenen. Raekken ryster ved en fejl. Det var statuslinjen
       nederst i scenen, indtil brugeren bad om at faa al tekst samlet
       over animationen.
     * hjaelpeknappen i samme raekke: Giv et hint > Naeste hint > Vis
       svaret. Den er gul (Vis svaret kun et gult omrids) og lyser stille
       op, naar eleven lige har svaret forkert. Under et gaet er den et
       lille omrids, Spring gaettet over. Naar maalet er loest, er den
       vaek: kortets groenne knap foerer videre.
     * musen i scenen

   Fanen selv SKAL have:
     nyOpgave(o)        stil scenen op til maalet
     layout()           regn pladserne ud. this.baand().y er scenens bund
                        (der er intet baand nederst), og this.kortZone() er
                        den plads, kortet har faaet sat af oeverst (218 px,
                        200 px paa lave skaerme): det, eleven skal se paa,
                        begynder under 10 + kortZone() + 8, saa kortet
                        aldrig daekker det, heller ikke med et hint i
     tegn(), opdaterScene(dt)
     sceneLinje()       det, der er at sige ud over kortets opgavetekst,
                        som en hel saetning, der selv naevner tingen (intet
                        indforstaaet). Giv "", naar opgaveteksten er nok
     forsoegSvar(o)     goer forsoeget for eleven (Vis svaret)
     musen: overScene, nedScene, flytScene, opScene, klikScene. Under et
                        gaet (this.gaetNu()) udfoeres handlinger i forsoeget
                        ikke: kald this.gaetBlink() i stedet, og skjul det,
                        der foerst skal bruges bagefter

   Fanen KAN have: nyFase(fase), efterDel(), efterOpgave(), efterGaet(),
   spmLinje(), nulstilScene(), fokusFelt(), enter(), felterSvar(o) (kraeves,
   hvis et maal har felter) og kortEkstra() (HTML paa kortet mellem
   spoergsmaalet og svarene, fx et reaktionsskema).

   Fanen KALDER: forsoegKlaret(set, slutTekst), naar eleven har gjort det,
   maalet beder om; loest(maade, tekst) og fejlLinje(tekst) for felter;
   kortBesked(tekst, sek) som svar paa et klik; og omNu() i tegn(): det,
   den aktuelle del handler om (om i js/data.js), som skal have en rolig
   gul ring.

   I index.html har hver fane i scenen: canvas x-laerred og kortet
   <div class="scenekort" id="x-skort"> med <div id="x-ind"> (kortets
   indhold) og raekken <div class="sk-bund" id="x-status"> med x-besked og
   x-knap. I panelet: x-liste og x-loest. En knap x-forfra er valgfri og
   staar ved det, den nulstiller.

   Teksterne i js/data.js skal passe paa kortet: gaettets tekst hoejst 60
   tegn, et spoergsmaal hoejst 118, et svar hoejst 46 og et forsoeg hoejst
   150. Selvtesten taeller og maaler kortets hoejde i alle dele af alle
   maal paa fire skaermstoerrelser. D.GAET_LINJE og D.FAERDIG[navn] skal
   findes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc6.4-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver) {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.opgaver = opgaver;
            this.grupper = [{ id: "alle", titel: "", lodret: true }];
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.hjaelp = 0;
            this.pegKnap = false;
            this.el = { knap: el("knap"), liste: el("liste"),
                besked: el("besked"), status: el("status"), forfra: el("forfra"), skort: el("skort") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.forfra(); mig.fokus(); });
            function valgKlik(e) {
                if (e.target.closest && e.target.closest("[data-videre]")) { mig.knap(); return; }
                var k = e.target.closest ? e.target.closest("[data-valg]") : null;
                if (!k || k.disabled) return;
                mig.svarValg(parseInt(k.getAttribute("data-valg"), 10));
            }
            if (this.el.skort) this.el.skort.addEventListener("click", valgKlik);
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
            this.lavOpgave(i);
            this.visKort();
            this.layout();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        /* Maalets dele i den raekkefoelge, de kommer */
        P.lavOpgave = function (i) {
            var o = this.opgaver[i], faser = [];
            ["gaet", "forsoeg", "felter", "spm", "spm2"].forEach(function (f) { if (o[f]) faser.push(f); });
            this.opg = { o: o, faser: faser, fi: 0, fase: faser[0], gaet: -1, forkert: {}, rigtig: undefined };
            if (this.nyOpgave) this.nyOpgave(o);
        };

        /* ----- Scenekortet ------------------------------------------------------------
           Opgaven staar paa ét kort oeverst midt i scenen, samme sted hele vejen:
           gaettet (stort og gult), det, eleven skal goere, og spoergsmaalene med
           deres svar. Panelet har intet opgavekort. */
        P.visKort = function () {
            var e = this.el.skort;
            if (e) {
                var g = this.opg, spm = g.fase === "spm" || g.fase === "spm2";
                var slut = this.slutNu();
                var kl = "scenekort " + (this.gaetNu() ? "gaet" : (slut ? "loest" + (slut.maade === "svar" ? " svar" : "") : (spm ? "spm" : "opgave")));
                if (e.className.replace(" blink", "") !== kl) e.className = kl;
                NK.saetHTML(navn + "-ind", this.kortHTML());
            }
            this.visKnap();
        };

        P.gaetNu = function () {
            return !this.faerdig && !!this.opg && this.opg.fase === "gaet";
        };

        /* De glas, den del af maalet, eleven staar i, handler om (om i js/data.js).
           De faar en gul ring i scenen, saa teksten ikke skal gaettes. */
        P.omNu = function () {
            if (this.faerdig || this.venter || !this.opg) return [];
            var del = this.opg.o[this.opg.fase];
            return (del && del.om) || [];
        };

        /* Det, kortet viser, naar maalet er loest (slut), eller naar et rigtigt svar
           venter paa, at eleven gaar videre til naeste spoergsmaal (mellem) */
        P.slutNu = function () {
            if (this.faerdig) return this.slut || { maade: "selv", tekst: "" };
            if (this.venter) return this.mellem || { maade: "selv", tekst: "" };
            return null;
        };

        /* Teksten paa kortets groenne knap, der foerer videre */
        P.videreTekst = function () {
            if (!this.faerdig) return "Næste spørgsmål →";
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            return valg.naesteFane ? "Videre til " + valg.naesteNavn + " →" : "Start forfra ↺";
        };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen, naar det ikke er et
           gaet. Lupperne begynder under den, saa intet flytter sig, naar et
           spoergsmaal kommer. Lave skaerme har et mindre kort (se stilarket). */
        P.kortZone = function () {
            return window.innerHeight <= 720 ? 200 : 218;
        };

        P.kortHTML = function () {
            var g = this.opg, o = g.o, del = o[g.fase], html;
            if (this.gaetNu()) {
                html = '<span class="gk-maerke">Gæt først</span>';
                /* sc6.4: en ring fra fane 2, som indledningen taler om */
                if (del.figur) html = '<span class="gk-figurramme">' + NK.Tegn.skeletSVG(del.figur) + "</span>" + html;
                if (del.intro) html += '<p class="gk-intro">' + NK.html(del.intro) + "</p>";
                html += '<p class="gk-tekst">' + NK.html(del.tekst) + '</p><div class="gk-svar">';
                del.svar.forEach(function (sv, j) {
                    html += '<button type="button" class="gk-knap" data-valg="' + j + '"><span class="v-bogstav">' + "ABC".charAt(j) + "</span>" + NK.html(sv.t) + "</button>";
                });
                return html + "</div>";
            }
            var spm = g.fase === "spm" || g.fase === "spm2";
            /* Loest, eller et rigtigt svar med et spoergsmaal til: forklaringen staar
               paa kortet, og knappen paa kortet foerer videre (brugerens oenske 9. okt.
               2026: forklaringen blev overset nede i statuslinjen) */
            var slut = this.slutNu();
            if (slut) {
                var maerke = slut.maade === "svar" ? "Svaret" : (slut.maerke || (spm ? "Rigtigt ✓" : (this.faerdig ? "Løst ✓" : "Godt ✓")));
                var svaret = "";
                if (spm && g.rigtig !== undefined) {
                    var st = del.svar[g.rigtig].t.replace(/\s+/g, " ");
                    svaret = '<b class="sk-svaret">' + NK.html(st + (/[.?!]$/.test(st) ? "" : ".")) + "</b> ";
                }
                return '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">' + maerke + "</span>" + svaret + NK.html(slut.tekst || "") + "</p>" +
                    '<button type="button" class="sk-videre" data-videre="1">' + NK.html(this.videreTekst()) + "</button></div>";
            }
            var chip = spm ? "Spørgsmål" : "Opgave " + (this.nr + 1);
            html = '<p class="sk-tekst"><span class="sk-chip">' + chip + "</span>" + NK.html(del.tekst) + "</p>";
            if (g.gaet >= 0 && g.fase === "forsoeg") {
                html += '<p class="sk-gaet">Dit gæt: <b>' + NK.html(o.gaet.svar[g.gaet].t) + "</b></p>";
            }
            if (this.kortEkstra) html += this.kortEkstra();
            if (del.svar) {
                html += '<div class="sk-svar n' + del.svar.length + '">';
                del.svar.forEach(function (sv, j) {
                    var kl = "sk-knap", laast = false;
                    if (g.forkert[j]) { kl += " forkert"; laast = true; }
                    if (g.rigtig === j) kl += " rigtig";
                    if (g.rigtig !== undefined) laast = true;
                    html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                        '<span class="v-bogstav">' + "ABC".charAt(j) + "</span><span>" + NK.html(sv.t) + "</span></button>";
                });
                html += "</div>";
            }
            return html;
        };

        /* Eleven klikkede paa forsoeget, foer der var gaettet: kortet blinker */
        P.gaetBlink = function (ekstra) {
            var e = this.el.skort;
            if (e) {
                e.classList.remove("blink");
                void e.offsetWidth;
                e.classList.add("blink");
            }
            this.kortBesked(D.GAET_LINJE + (ekstra ? " " + ekstra : ""), 5, "gul");
        };

        /* Videre til maalets naeste del. Giver true, hvis der ikke er flere. */
        P.naesteFase = function () {
            var g = this.opg;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.venter = false;
            if (g.fi >= g.faser.length - 1) return true;
            g.fi++;
            g.fase = g.faser[g.fi];
            g.forkert = {};
            g.rigtig = undefined;
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

        /* ----- Svarknapperne i opgavekortet -------------------------------------------- */
        P.svarValg = function (j) {
            var g = this.opg, o = g.o;
            if (this.faerdig) return;
            if (g.fase === "gaet") {
                g.gaet = j;
                this.naesteFase();
                this.naesteLinje("", "");
                if (this.efterGaet) this.efterGaet();
                return;
            }
            if (g.fase !== "spm" && g.fase !== "spm2") return;
            if (this.venter || g.rigtig !== undefined) return;
            var del = o[g.fase];
            if (del.svar[j].ok) {
                g.rigtig = j;
                if (g.fi < g.faser.length - 1) { this.mellemsvar("selv", del.godt); return; }
                this.loest("selv", o.loest);
                return;
            }
            g.forkert[j] = true;
            this.visKort();
            this.fejlLinje(del.svar[j].f);
        };

        /* Et rigtigt svar, og der kommer et spoergsmaal til: forklaringen staar
           alene, og eleven gaar selv videre med knappen */
        P.mellemsvar = function (maade, tekst, maerke) {
            this.venter = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.mellem = { maade: maade, tekst: tekst || "", maerke: maerke };
            this.besked("", "");
            this.sidsteTrin = "";
            this.visKort();
            if (this.efterDel) this.efterDel();
        };

        /* Fanen melder, at eleven har gjort det, forsoeget beder om */
        P.forsoegKlaret = function (set, slutTekst) {
            var g = this.opg;
            if (this.faerdig || this.venter || g.fase !== "forsoeg") return;
            if (g.fi >= g.faser.length - 1) { this.loest("selv", this.gaetDom() + (slutTekst || g.o.loest)); return; }
            /* Er der noget at sige (gaettets dom eller det, eleven lige saa), staar det
               alene paa det groenne kort, og eleven gaar selv videre til spoergsmaalet.
               Ellers kommer spoergsmaalet med det samme. */
            var tekst = (this.gaetDom() + (set || "")).trim();
            var forkertGaet = g.gaet >= 0 && !g.o.gaet.svar[g.gaet].ok;
            if (tekst) { this.mellemsvar("selv", tekst, forkertGaet ? "Forsøget ✓" : "Godt ✓"); return; }
            this.naesteFase();
            this.naesteLinje("", "");
        };

        /* Hinttrappen for den del af maalet, eleven staar i lige nu */
        P.hintTrin = function () {
            var g = this.opg;
            return g.fase === "gaet" ? [] : g.o[g.fase].hint;
        };

        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.length ? h : ["Læs opgaven på kortet igen, og prøv dig frem i scenen."];
        };

        P.visSvar = function () {
            var g = this.opg, o = g.o;
            if (g.fase === "gaet") {
                this.naesteFase();
                this.naesteLinje("", "");
                return;
            }
            if (g.fase === "spm" || g.fase === "spm2") {
                o[g.fase].svar.forEach(function (sv, j) { if (sv.ok) g.rigtig = j; });
                if (g.fi < g.faser.length - 1) { this.mellemsvar("svar", o[g.fase].godt); return; }
                this.loest("svar", o.loest);
                return;
            }
            if (g.fase === "felter") { this.felterSvar(o); return; }
            var slutTekst = this.forsoegSvar(o);
            if (g.fi >= g.faser.length - 1) { this.loest("svar", slutTekst || o.loest); return; }
            if (o.forsoeg.set) { this.mellemsvar("svar", o.forsoeg.set); return; }
            this.naesteFase();
            this.naesteLinje("", "");
        };

        P.visKnap = function () {
            var tekst, klasse = "knap hjaelp";
            if (this.faerdig || this.venter) {
                /* Kortets groenne knap foerer videre; hjaelpeknappen er vaek imens */
                tekst = this.videreTekst();
            } else if (this.opg.fase === "gaet") {
                /* Under et gaet er kortet det eneste fyldte gule: kun et lille omrids */
                tekst = "Spring gættet over";
                klasse += " svar lille";
            } else {
                var h = this.hintNu();
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
                else { tekst = "Vis svaret"; klasse += " svar"; }
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.visBund();
        };

        /* Kortets nederste raekke: beskeden og hjaelpeknappen. Naar maalet er loest,
           er raekken vaek, medmindre et klik i scenen lige har faaet et svar. */
        P.visBund = function () {
            var slut = this.faerdig || this.venter;
            var b = this.nuB || this.fast || { html: "", klasse: "" };
            var harTekst = !!b.html;
            if (this.el.besked) this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = slut;
            if (this.el.status) {
                var ryster = this.el.status.classList.contains("ryster");
                this.el.status.hidden = slut && !harTekst;
                this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom") + (ryster ? " ryster" : "");
            }
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
            if (this.venter) {
                this.naesteFase();
                this.naesteLinje("", "");
                this.fokus();
                return;
            }
            var h = this.opg.fase === "gaet" ? [] : this.hintNu();
            this.pegKnap = false;
            if (this.hjaelp < h.length) {
                this.hjaelp++;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " +
                    NK.html(h[this.hjaelp - 1]), "hint");
                this.visKnap();
                this.fokus();
                return;
            }
            if (this.opg.fase !== "gaet") this.brugtSvar = true;
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

        /* ----- Opgaven er loest --------------------------------------------------- */
        P.loest = function (maade, linje) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            this.faerdig = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            this.gem();
            this.sejrT = 0;
            var alle = this.antalLoest() === this.opgaver.length;
            /* Forklaringen staar paa det groenne kort */
            this.slut = { maade: maade, tekst: (linje || "") + (alle && foerste ? " " + D.FAERDIG[navn] : "") };
            this.besked("", "");
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

        P.kortBesked = function (tekst, sek, klasse) {
            this.kortT = sek || 4;
            this.visBesked({ html: NK.html(tekst), klasse: klasse || "peger" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            this.nuB = b;
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        /* Det naeste skridt, som det staar i linjen */
        /* Det, der er at sige ud over kortets egen tekst: under et gaet og et
           spoergsmaal intet (kortet siger det), i et forsoeg kun det, fanen har
           at tilfoeje (sceneLinje giver "", naar opgaveteksten er nok) */
        P.trinLinje = function () {
            var g = this.opg;
            if (g.fase === "gaet") return "";
            if (g.fase === "spm" || g.fase === "spm2") return (this.spmLinje && this.spmLinje()) || "";
            return (this.sceneLinje && this.sceneLinje()) || "";
        };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.sidsteTrin = t;
            this.besked((foer ? foer + " " : "") + NK.html(t), slags || "");
        };

        /* En god delbesked: groen linje med ét skridt videre */
        P.godLinje = function (tekst) {
            this.besked('<span class="b-maerke">Godt</span> ' + NK.html(tekst), "god");
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

        /* ----- Fokus, forfra og maal ------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* Knappen Forfra og tasten R: fanen nulstiller scenen, maalet bliver */
        P.forfra = function () {
            if (this.nulstilScene) this.nulstilScene();
            this.nulstilHjaelp();
            if (!this.faerdig && !this.venter) this.naesteLinje("", "");
        };

        P.nulstil = function () { this.forfra(); };

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

        /* Der er intet baand nederst i scenen: al tekst staar paa kortet oeverst
           (brugerens oenske 9. okt. 2026). Fanernes layout bruger stadig baand(). */
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
        };

        /* Det groenne glimt over scenen, naar et maal er loest */
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

    NK.Fane = { paa: paa };
}());
