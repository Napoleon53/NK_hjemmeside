/* =====================================================================
   fane.js - det, de to faner har til faelles (fra sc4.6, som har det fra
   sc4.4, sc7.5, sc8.6 og sc1.4). Rettet her til sc4.3:

     * maalets dele staar i listen o.dele (type "forsoeg" eller "spm")
       i stedet for de faste noegler gaet > forsoeg > spm, saa et maal kan
       have tre eller fire trin (C, H, O og hele tal paa fane 2)
     * et spoergsmaal kan have flere rigtige svar (flere: true, "vaelg
       alle, der passer"): svarene vaelges og fravaelges, og Indsend svar
       bedoemmer dem samlet. Et forkert valg bliver roedt; mangler der et,
       siger kortet det (del.mangler)
     * Indsend svar i et forsoeg staar fremme, naar delen har indsend: true
     * efter et forsoeg bliver kortet ogsaa paa opgaven: teksten bliver
       staaende, forklaringen staar under den, og Naeste staar, hvor Indsend
       svar stod (som papirkortets "bliv" efter et spoergsmaal)
     * stjernen faas kun, naar opgaven er loest uden forkerte svar og uden
       Vis svaret (stjerne kun for foerste forsoeg)

   Der er ingen laerer i denne animation, og der staar ingen tekst nederst
   i scenen: AL tekst staar paa ét kort oeverst midt i scenen, og
   hjaelpeknappen sidder paa kortet.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype.
   valg: navn (forstavelsen paa fanens id'er), naesteFane og naesteNavn
   (knappen efter den sidste opgave).

   Fanen selv SKAL have:
     nyOpgave(o)        stil scenen op til maalet
     layout()           regn pladserne ud. this.kortZone() er den plads,
                        kortet har faaet sat af oeverst
     tegn(), opdaterScene(dt)
     forsoegSvar(o, del) goer forsoeget for eleven (Vis svaret) og giver
                        teksten til kortet
     musen: overScene, nedScene, flytScene, opScene, klikScene. LAASEN:
                        eleven maa kun saette noget i gang, mens kortet
                        viser et forsoeg. Begynd alt, der saetter noget i
                        gang, med if (this.spaer()) return;
   Har en del indsend: true, skal fanen ogsaa have forsoegIndsend(),
   kanIndsendes(), indsendTekst() og ikkeKlar().

   Fanen KAN have: nyFase(del), efterDel(), efterOpgave(), spmLinje(),
   sceneLinje(), nulstilScene(), kortEkstra().

   Fanen KALDER: forsoegKlaret(set), naar eleven har gjort det, delen
   beder om; fejlLinje(tekst) ved et forkert indsendt svar; kortBesked(tekst,
   sek) som svar paa et klik; og omNu() i tegn().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var BOGSTAV = "ABCDE";

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc4.3-" + navn;

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
            this.el = { knap: el("knap"), liste: el("liste"),
                besked: el("besked"), status: el("status"), forfra: el("forfra"), skort: el("skort"), indsend: el("indsend") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            if (this.el.indsend) this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); mig.fokus(); });
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

        P.erLoest = function (id) { var i = this.idx(id); return i >= 0 && this.status[i].loest; };

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
            this.fejlet = false;
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

        /* Maalets dele i den raekkefoelge, de kommer (o.dele) */
        P.lavOpgave = function (i) {
            var o = this.opgaver[i];
            this.opg = { o: o, fi: 0, del: o.dele[0], forkert: {}, rigtig: undefined, valgt: null, valgte: {} };
            if (this.nyOpgave) this.nyOpgave(o);
            if (this.nyFase) this.nyFase(this.opg.del);
        };

        /* Er delen, eleven staar i, et spoergsmaal eller et forsoeg? */
        P.erSpm = function () { return !!this.opg && this.opg.del.type === "spm"; };
        P.erForsoeg = function () { return !!this.opg && this.opg.del.type === "forsoeg"; };

        /* ----- Scenekortet ------------------------------------------------------------
           Opgaven staar paa ét kort oeverst midt i scenen, samme sted hele vejen:
           det, eleven skal goere, og spoergsmaalene med deres svar. Panelet har
           intet opgavekort. */
        P.visKort = function () {
            var e = this.el.skort;
            if (e) {
                var slut = this.slutNu(), spm = this.erSpm();
                var kl = "scenekort " + (slut ? "loest bliver" + (slut.maade === "svar" ? " svar" : "") : (spm ? "spm" : "opgave"));
                if (e.className.replace(" blink", "") !== kl) e.className = kl;
                NK.saetHTML(navn + "-ind", this.kortHTML());
            }
            this.visKnap();
        };

        /* Det, den del af maalet, eleven staar i, handler om (om i js/data.js).
           Det faar en gul ring i scenen, saa teksten ikke skal gaettes. */
        P.omNu = function () {
            if (this.faerdig || this.venter || !this.opg) return [];
            return this.opg.del.om || [];
        };

        /* Det, kortet viser, naar maalet er loest (slut), eller naar et rigtigt svar
           venter paa, at eleven gaar videre til naeste del (mellem) */
        P.slutNu = function () {
            if (this.faerdig) return this.slut || { maade: "selv", tekst: "" };
            if (this.venter) return this.mellem || { maade: "selv", tekst: "" };
            return null;
        };

        /* Teksten paa kortets knap, der foerer videre. Er der intet at gaa videre
           til (sidste fane, alt loest), er der ingen knap: Start forfra staar
           aldrig, hvor Naeste staar (brugeren 3. nov. 2026). */
        P.videreTekst = function () {
            if (!this.faerdig) {
                var naeste = this.opg.o.dele[this.opg.fi + 1];
                return naeste && naeste.type === "spm" ? "Næste spørgsmål →" : "Næste trin →";
            }
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            return valg.naesteFane ? "Videre til " + valg.naesteNavn + " →" : "";
        };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen (som sc4.6: et lavt
           kort, brugeren 12. nov. 2026). Er panelet bredt i forhold til scenen
           (under 1320 px), bryder teksten oftere om. */
        P.kortZone = function () {
            if (window.innerWidth < 1320) return 178;
            return window.innerHeight <= 720 ? 146 : 156;
        };

        P.chip = function () {
            var del = this.opg.del;
            return del.chip || (del.type === "spm" ? "Spørgsmål" : "Opgave " + (this.nr + 1));
        };

        P.svarKnapper = function (laastAlle, slutKlasse) {
            var g = this.opg, del = g.del, html = '<div class="sk-svar n' + del.svar.length + '">';
            del.svar.forEach(function (sv, j) {
                var kl = "sk-knap", laast = laastAlle;
                if (slutKlasse) kl += " " + slutKlasse(j);
                else {
                    if (g.forkert[j]) { kl += " forkert"; laast = true; }
                    if (del.flere ? g.valgte[j] : g.valgt === j) kl += " valgt";
                }
                html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") +
                    (del.flere ? ' aria-pressed="' + (g.valgte[j] ? "true" : "false") + '"' : "") + ">" +
                    '<span class="v-bogstav">' + BOGSTAV.charAt(j) + "</span><span>" + NK.html(sv.t) + "</span></button>";
            });
            return html + "</div>";
        };

        P.kortHTML = function () {
            var g = this.opg, del = g.del;
            var slut = this.slutNu();
            if (slut) return this.blivHTML(slut);
            var html = '<p class="sk-tekst"><span class="sk-chip">' + this.chip() + "</span>" + NK.Papir.tekst(NK.html(del.tekst)) + "</p>";
            if (this.kortEkstra) html += this.kortEkstra();
            if (del.svar) html += this.svarKnapper(false);
            return html;
        };

        /* Papirkortet (brugerens valg 3. nov. 2026): et rigtigt svar laegger ikke
           kortet om. Teksten og svarene bliver staaende, det rigtige svar er
           groent dér, hvor eleven klikkede, forklaringen staar under, og
           knappen, der foerer videre, staar dér, hvor Indsend svar stod. Det
           gaelder her ogsaa et forsoeg. */
        P.blivHTML = function (slut) {
            var g = this.opg, del = g.del, vist = slut.maade === "svar";
            var html = '<p class="sk-tekst"><span class="sk-chip">' + this.chip() + "</span>" + NK.Papir.tekst(NK.html(del.tekst)) + "</p>";
            if (this.kortEkstra) html += this.kortEkstra();
            if (del.svar) {
                html += this.svarKnapper(true, function (j) {
                    var ok = del.flere ? !!del.svar[j].ok : g.rigtig === j;
                    return ok ? (vist ? "svar-vist" : "rigtig") : (g.forkert[j] ? "forkert" : "dim");
                });
            }
            var maerke = vist ? "Svaret" : (slut.maerke || "Rigtigt");
            var vt = this.videreTekst();
            var bund = NK.Papir.bliv(NK.html(slut.tekst || ""), maerke, NK.html(vt), vist);
            /* Intet at gaa videre til: raekken uden knap (se videreTekst) */
            if (!vt) bund = bund.replace(/<button[^>]*data-videre[^>]*>[^<]*<\/button>/, "");
            return html + bund;
        };

        /* Kortet blinker: eleven klikkede paa forsoeget, men skal foerst goere det,
           kortet siger (svare, trykke Naeste, eller det, opgaven beder om) */
        P.kortBlink = function () {
            var e = this.el.skort;
            if (!e) return;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen (brugeren 9. okt. 2026: "nogle gange er det muligt at starte
           animationen inden man har faaet spoergsmaalet"). Eleven kan kun saette
           noget i gang i scenen, mens kortet viser et forsoeg. Under et
           spoergsmaal, og naar kortet venter paa Naeste, blinker kortet i stedet. */
        P.iForsoeg = function () {
            return !this.faerdig && !this.venter && this.erForsoeg();
        };

        P.spaer = function () {
            if (this.iForsoeg()) return false;
            this.kortBlink();
            return true;
        };

        /* Videre til maalets naeste del. Giver true, hvis der ikke er flere. */
        P.naesteFase = function () {
            var g = this.opg;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.venter = false;
            if (g.fi >= g.o.dele.length - 1) return true;
            g.fi++;
            g.del = g.o.dele[g.fi];
            g.forkert = {};
            g.rigtig = undefined;
            g.valgt = null;
            g.valgte = {};
            if (this.nyFase) this.nyFase(g.del);
            this.visKort();
            this.layout();
            return false;
        };

        P.sidsteDel = function () { return this.opg.fi >= this.opg.o.dele.length - 1; };

        /* ----- Svarknapperne paa kortet ------------------------------------------------ */
        P.svarValg = function (j) {
            var g = this.opg;
            if (this.faerdig || this.venter || !this.erSpm()) return;
            if (g.rigtig !== undefined || g.forkert[j]) return;
            /* Et svar vaelger kun; det bedoemmes, naar eleven trykker Indsend svar
               (brugeren 24. okt. 2026: "der skal som minimum vaere et indsend svar") */
            if (g.del.flere) {
                if (g.valgte[j]) delete g.valgte[j]; else g.valgte[j] = true;
            } else g.valgt = j;
            this.visKort();
        };

        P.valgteListe = function () {
            var g = this.opg;
            return Object.keys(g.valgte).map(function (k) { return parseInt(k, 10); }).sort();
        };

        /* Indsend svar: det valgte svar (eller de valgte svar) bedoemmes */
        P.indsendKlik = function () {
            var g = this.opg;
            if (this.faerdig || this.venter) { this.kortBlink(); return; }
            if (this.erForsoeg()) {
                if (!g.del.indsend) return;
                if (!this.kanIndsendes()) {
                    this.kortBlink();
                    this.kortBesked(this.ikkeKlar ? this.ikkeKlar() : "Gør først det, kortet beder om.", 4);
                    return;
                }
                this.forsoegIndsend();
                return;
            }
            var del = g.del, o = g.o;
            if (del.flere) {
                var valgte = this.valgteListe();
                if (!valgte.length) {
                    this.kortBlink();
                    this.kortBesked("Vælg de svar på kortet, der passer, først.", 3.5);
                    return;
                }
                var forkerte = valgte.filter(function (j) { return !del.svar[j].ok; });
                if (forkerte.length) {
                    forkerte.forEach(function (j) { g.forkert[j] = true; delete g.valgte[j]; });
                    this.fejlet = true;
                    this.visKort();
                    this.fejlLinje(del.svar[forkerte[0]].f);
                    return;
                }
                var mangler = del.svar.some(function (sv, j) { return sv.ok && !g.valgte[j]; });
                if (mangler) {
                    this.fejlet = true;
                    this.visKort();
                    this.fejlLinje(del.mangler);
                    return;
                }
                g.rigtig = valgte;
                if (!this.sidsteDel()) { this.mellemsvar("selv", del.godt); return; }
                this.loest("selv", o.loest);
                return;
            }
            if (g.valgt === null || g.valgt === undefined) {
                this.kortBlink();
                this.kortBesked("Vælg et af svarene på kortet først.", 3.5);
                return;
            }
            var j = g.valgt;
            g.valgt = null;
            if (del.svar[j].ok) {
                g.rigtig = j;
                if (!this.sidsteDel()) { this.mellemsvar("selv", del.godt); return; }
                this.loest("selv", o.loest);
                return;
            }
            g.forkert[j] = true;
            this.fejlet = true;
            this.visKort();
            this.fejlLinje(del.svar[j].f);
        };

        /* Indsend svar staar fremme under et spoergsmaal og i et forsoeg med
           indsend: true; graa, til der er noget at sende */
        P.visIndsend = function () {
            var e = this.el.indsend;
            if (!e) return;
            var g = this.opg, aaben = !!g && !this.venter && !this.faerdig;
            var spm = aaben && this.erSpm();
            var fors = aaben && this.erForsoeg() && !!g.del.indsend;
            e.hidden = !spm && !fors;
            var klar = fors ? !!this.kanIndsendes() :
                (spm && (g.del.flere ? this.valgteListe().length > 0 : (g.valgt !== null && g.valgt !== undefined)));
            var tekst = fors && this.indsendTekst ? this.indsendTekst() : "Indsend svar";
            if (e.textContent !== tekst) e.textContent = tekst;
            e.classList.toggle("klar", klar);
            e.classList.toggle("ikke-klar", !klar);
            e.setAttribute("aria-disabled", klar ? "false" : "true");
        };

        /* Et rigtigt svar, og der kommer en del til: forklaringen staar paa kortet,
           og eleven gaar selv videre med knappen */
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

        /* Fanen melder, at eleven har gjort det, forsoeget beder om. set er det,
           eleven saa eller regnede ud, og staar paa kortet under opgaven. */
        P.forsoegKlaret = function (set, maerke) {
            if (this.faerdig || this.venter || !this.erForsoeg()) return;
            var tekst = set || this.opg.del.set || "";
            if (this.sidsteDel()) { this.loest("selv", tekst, maerke); return; }
            this.mellemsvar("selv", tekst, maerke || "Godt");
        };

        /* Hinttrappen for den del af maalet, eleven staar i lige nu */
        P.hintNu = function () {
            var h = this.opg.del.hint;
            return h && h.length ? h : ["Læs opgaven på kortet igen, og prøv dig frem i scenen."];
        };

        P.visSvar = function () {
            var g = this.opg, o = g.o, del = g.del;
            this.brugtSvar = true;
            if (del.type === "spm") {
                if (del.flere) g.rigtig = del.svar.map(function (sv, j) { return sv.ok ? j : -1; }).filter(function (j) { return j >= 0; });
                else del.svar.forEach(function (sv, j) { if (sv.ok) g.rigtig = j; });
                if (!this.sidsteDel()) { this.mellemsvar("svar", del.godt); return; }
                this.loest("svar", o.loest);
                return;
            }
            var slutTekst = this.forsoegSvar(o, del) || del.set || "";
            if (this.sidsteDel()) { this.loest("svar", slutTekst); return; }
            this.mellemsvar("svar", slutTekst);
        };

        P.visKnap = function () {
            var tekst, klasse = "knap hjaelp";
            if (this.faerdig || this.venter) {
                /* Kortets knap foerer videre; hjaelpeknappen er vaek imens */
                tekst = this.videreTekst();
            } else {
                var h = this.hintNu();
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
                else { tekst = "Vis svaret"; klasse += " svar"; }
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.visIndsend();
            this.visBund();
        };

        /* Kortets nederste raekke: beskeden og hjaelpeknappen. Naar delen er loest,
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
                /* ellers intet: Start forfra staar aldrig, hvor Naeste staar */
                return;
            }
            if (this.venter) {
                this.naesteFase();
                this.naesteLinje("", "");
                this.fokus();
                return;
            }
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
        P.loest = function (maade, linje, maerke) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            this.faerdig = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || (!this.brugtSvar && !this.fejlet);
            this.gem();
            this.sejrT = 0;
            var alle = this.antalLoest() === this.opgaver.length;
            /* Forklaringen staar paa kortet under opgaven */
            this.slut = { maade: maade, maerke: maerke, tekst: (linje || "") + (alle && foerste ? " " + D.FAERDIG[navn] : "") };
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Kortets nederste raekke ------------------------------------------------
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

        /* Det, der er at sige ud over kortets egen tekst: under et spoergsmaal
           intet (kortet siger det), i et forsoeg kun det, fanen har at tilfoeje
           (sceneLinje giver "", naar opgaveteksten er nok) */
        P.trinLinje = function () {
            if (this.erSpm()) return (this.spmLinje && this.spmLinje()) || "";
            return (this.sceneLinje && this.sceneLinje()) || "";
        };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.sidsteTrin = t;
            this.besked((foer ? foer + " " : "") + NK.html(t), slags || "");
        };

        /* Et forkert svar: beskeden, et ryst og en knap, der lyser stille */
        P.fejlLinje = function (tekst) {
            this.fejlet = true;
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
            /* Har fanen ikke sin egen nulstilling, begynder opgaven forfra */
            if (!this.nulstilScene) { this.vaelg(this.nr); return; }
            this.nulstilScene();
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
