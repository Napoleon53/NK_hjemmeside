/* =====================================================================
   fane.js - det, de tre faner har til faelles

   Al tekst staar paa ét kort oeverst midt i scenen, og der staar intet
   nederst (brugerens oensker 9. okt. 2026, og 24. okt. 2026 om denne
   animation: "teksten skal i stedet staa meget tydeligt oeverst i
   midten, og man skal sjaeldent kunne loese opgaver ved tilfaeldigt at
   klikke paa slidere og knapper. Der skal som minimum vaere et indsend
   svar"). Moenstret er scenekortet i sc7.5_staerke_og_svage_syrer.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype.
   valg: navn (forstavelsen paa fanens id'er), naesteFane og naesteNavn.

     * listen i panelet: opgaverne med loest og stjerne (huskes i
       browseren). En stjerne kraever, at opgaven er loest i foerste
       forsoeg uden Vis svaret: et forkert svar, der er sendt ind,
       koster stjernen, saa det ikke betaler sig at gaette loes.
     * scenekortet (visKort): fanens del lige nu (delNu) er et gaet
       (stort og gult, svarene virker med det samme, for et gaet er
       gratis), en opgave i scenen eller et spoergsmaal med svarene som
       knapper. Svarene paa et spoergsmaal vaelges og sendes foerst ind
       med Indsend svar; er spoergsmaalet multi, kan flere vaelges.
       Loest: kortet er groent med forklaringen og knappen Naeste
       opgave. Et rigtigt svar, der har en del mere, faar et groent
       kort med knappen Naeste (mellemsvar).
     * kortets nederste raekke (x-status): det, fanen har at tilfoeje
       (sceneLinje), hint, forklaringen til et forkert svar og svaret
       paa et klik i scenen, hjaelpeknappen (Giv et hint > Naeste hint >
       Vis svaret) og Indsend svar. Indsend er graa, til der er noget at
       sende ind, og banker stille, naar der er.
     * laasen (spaer): under et gaet og naar kortet er groent, saetter et
       greb i termometeret eller kontakten intet i gang; kortet blinker
       i stedet (eller dets groenne knap). At se naermere paa
       molekylerne er altid i orden.

   Fanen SKAL have:
     lavOpgave(i), delNu() -> { slags: "gaet" | "opgave" | "spm", tekst,
       intro, svar: [{ t, ok, f, prik }], multi, chip, ekstra },
     layout(), tegn(), opdaterScene(dt), hintTrin(), visSvar(),
     indsend() (opgave), kanIndsende() (opgave), gaetValg(j) (gaet),
     videre() (naar eleven trykker Naeste paa et mellemsvar)
   Fanen KAN have: sceneLinje(), indsendTekst(), spmLoest(), efterOpgave(),
     nulstilScene(), fokusFelt(), enter().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sb4.4-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver, grupper) {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.opgaver = opgaver;
            this.grupper = grupper;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.hjaelp = 0;
            this.pegKnap = false;
            this.el = { knap: el("knap"), indsend: el("indsend"), liste: el("liste"), skort: el("skort"),
                besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.valgte = {};
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.nulstil(); mig.fokus(); });
            this.el.skort.addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest("[data-videre]")) { mig.knap(); return; }
                var k = e.target.closest ? e.target.closest("[data-valg]") : null;
                if (!k || k.disabled) return;
                mig.valgKlik(parseInt(k.getAttribute("data-valg"), 10));
            });
            this.bygListe();
            this.koblMus();
        };

        P.idx = function (id) {
            for (var i = 0; i < this.opgaver.length; i++) if (this.opgaver[i].id === id) return i;
            return -1;
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

        P.antalStjerner = function () {
            return this.status.filter(function (s) { return s.stjerne; }).length;
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
                raekke.className = "opg-chips" + (g.lodret ? " lodret" : "");
                mig.opgaver.forEach(function (o, i) {
                    if ((o.gruppe || "alle") !== g.id) return;
                    var knap = document.createElement("button");
                    knap.type = "button";
                    knap.className = "opg-chip";
                    knap.title = o.navn;
                    knap.innerHTML = '<span class="oc-f">' + mig.chipTekst(o, i) + '</span><i class="oc-m"></i>';
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
            NK.saetTekst(navn + "-stjerner", String(this.antalStjerner()));
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
            this.valgte = {};
            this.lavOpgave(i);
            this.visKort();
            this.layout();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        /* En ny del af opgaven: valgene, hinttrappen og linjen begynder forfra */
        P.nyDel = function () {
            this.valgte = {};
            this.hjaelp = 0;
            this.pegKnap = false;
            this.venter = false;
            this.mellem = null;
            this.visKort();
            this.naesteLinje("", "");
        };

        P.gaetNu = function () {
            if (this.faerdig || this.venter) return false;
            var d = this.delNu();
            return !!d && d.slags === "gaet";
        };

        /* Det, kortet viser, naar opgaven er loest (slut), eller naar et rigtigt
           svar venter paa, at eleven gaar videre (mellem) */
        P.slutNu = function () {
            if (this.faerdig) return this.slut || { maade: "selv", tekst: "" };
            if (this.venter) return this.mellem || { maade: "selv", tekst: "" };
            return null;
        };

        P.videreTekst = function () {
            if (!this.faerdig) return (this.mellem && this.mellem.knap) || "Næste →";
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            return valg.naesteFane ? "Videre til " + valg.naesteNavn + " →" : "Start forfra ↺";
        };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen (uden for et gaet).
           Det, eleven arbejder med, begynder under top() i scenen. Selvtesten
           maaler kortet i alle dele af alle opgaver med det laengste hint og
           den laengste forklaring til et forkert svar. */
        P.kortZone = function () {
            return window.innerHeight <= 720 ? 196 : 206;
        };

        P.top = function () { return 10 + this.kortZone() + 10; };

        /* ----- Scenekortet ------------------------------------------------------------ */
        P.visKort = function () {
            var e = this.el.skort;
            var slut = this.slutNu(), d = slut ? null : this.delNu();
            var kl = "scenekort " + (slut ? "loest" + (slut.maade === "svar" ? " svar" : "") :
                (d.slags === "gaet" ? "gaet" : (d.slags === "spm" ? "spm" : "opgave")));
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            NK.saetHTML(navn + "-ind", this.kortHTML(slut, d));
            this.visKnap();
        };

        P.kortHTML = function (slut, d) {
            var mig = this, html;
            if (slut) {
                var maerke = slut.maade === "svar" ? "Svaret" : (slut.maerke || (this.faerdig ? "Rigtigt ✓" : "Godt ✓"));
                var svaret = slut.svaret ? '<b class="sk-svaret">' + NK.html(slut.svaret) + "</b> " : "";
                return '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">' + maerke + "</span>" + svaret + NK.html(slut.tekst || "") + "</p>" +
                    '<button type="button" class="sk-videre" data-videre="1">' + NK.html(this.videreTekst()) + "</button></div>";
            }
            if (d.slags === "gaet") {
                html = '<span class="gk-maerke">Gæt først</span>';
                if (d.intro) html += '<p class="gk-intro">' + NK.html(d.intro) + "</p>";
                html += '<p class="gk-tekst">' + NK.html(d.tekst) + '</p><div class="gk-svar n' + d.svar.length + '">';
                d.svar.forEach(function (sv, j) {
                    var tegn = sv.prik ? '<span class="v-prik" style="background:' + sv.prik + '"></span>' :
                        '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span>";
                    html += '<button type="button" class="gk-knap" data-valg="' + j + '">' + tegn + "<span>" + NK.html(sv.t) + "</span></button>";
                });
                return html + "</div>";
            }
            var chip = d.chip || (d.slags === "spm" ? "Spørgsmål" : "Opgave");
            html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(chip) + "</span>" + NK.html(d.tekst) + "</p>";
            if (d.ekstra) html += d.ekstra;
            if (d.slags === "spm") {
                html += '<div class="sk-svar n' + d.svar.length + (d.multi ? " multi" : "") + '">';
                d.svar.forEach(function (sv, j) {
                    var kl = "sk-knap", laast = false;
                    if (mig.valgte[j]) kl += " valgt";
                    if (d.forkert && d.forkert[j]) { kl += " forkert"; laast = true; }
                    var tegn = d.multi ? '<span class="v-boks" aria-hidden="true">' + (mig.valgte[j] ? "✓" : "") + "</span>" :
                        '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span>";
                    html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") +
                        (d.multi ? ' aria-pressed="' + (mig.valgte[j] ? "true" : "false") + '"' : "") + ">" +
                        tegn + "<span>" + NK.html(sv.t) + "</span></button>";
                });
                html += "</div>";
            }
            return html;
        };

        /* Kortet blinker: eleven greb ud efter forsoeget, men skal foerst goere
           det, kortet siger (gaette eller trykke Naeste) */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: under et gaet og naar kortet er groent, saetter et greb i
           forsoeget intet i gang. Fanen begynder alt, der saetter noget i gang,
           med  if (this.spaer()) return; */
        P.spaer = function () {
            if (!this.gaetNu() && !this.faerdig && !this.venter) return false;
            this.kortBlink();
            return true;
        };

        /* ----- Svarknapperne paa kortet ------------------------------------------------- */
        P.valgKlik = function (j) {
            if (this.faerdig || this.venter) return;
            var d = this.delNu();
            if (d.slags === "gaet") { this.gaetValg(j); return; }
            if (d.slags !== "spm") return;
            if (d.multi) {
                if (this.valgte[j]) delete this.valgte[j]; else this.valgte[j] = true;
            } else {
                this.valgte = {};
                this.valgte[j] = true;
            }
            this.nulstilHjaelp();
            /* En forklaring til et forkert svar bliver staaende, til der er valgt nyt */
            if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.naesteLinje("", "");
            this.visKort();
        };

        /* Et spoergsmaal: det, der er valgt, holdt op mod svarene. Giver null,
           naar det er rigtigt, ellers forklaringen til den foerste fejl. */
        P.spmFejl = function (d) {
            var mig = this, fejl = null;
            d.svar.forEach(function (sv, j) {
                if (!fejl && mig.valgte[j] && !sv.ok) fejl = sv.f || "Det passer ikke.";
            });
            if (fejl) return fejl;
            d.svar.forEach(function (sv, j) {
                if (!fejl && sv.ok && !mig.valgte[j]) fejl = sv.mangler || "Der mangler noget.";
            });
            return fejl;
        };

        P.harValgt = function () { return Object.keys(this.valgte).length > 0; };

        P.kanSendes = function () {
            if (this.faerdig || this.venter) return false;
            var d = this.delNu();
            if (d.slags === "gaet") return false;
            if (d.slags === "spm") return this.harValgt();
            return this.kanIndsende ? !!this.kanIndsende() : true;
        };

        /* Indsend svar */
        P.indsendKlik = function () {
            if (this.faerdig || this.venter) return;
            var d = this.delNu();
            if (!d || d.slags === "gaet") return;
            if (!this.kanSendes()) { this.kortBlink(); return; }
            if (d.slags === "spm") {
                var fejl = this.spmFejl(d);
                if (fejl) {
                    if (!d.multi) {
                        /* Et forkert enkeltsvar bliver roedt og kan ikke vaelges igen */
                        if (!d.forkert) d.forkert = {};
                        for (var k in this.valgte) d.forkert[k] = true;
                        this.valgte = {};
                    }
                    this.visKort();
                    this.fejlLinje(fejl);
                    return;
                }
                this.spmLoest(d);
                this.fokus();
                return;
            }
            this.indsend();
            this.fokus();
        };

        /* Det rigtige svar paa et enkeltsvar staar fremhaevet paa det groenne kort */
        P.svarTekst = function (d) {
            var t = "";
            d.svar.forEach(function (sv) { if (sv.ok && !t) t = sv.t.replace(/\s+/g, " "); });
            if (d.multi) return "";
            return t + (/[.?!]$/.test(t) ? "" : ".");
        };

        /* ----- Knapperne i kortets nederste raekke ---------------------------------------- */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.length ? h : ["Læs opgaven på kortet igen, og prøv dig frem i scenen."];
        };

        P.visKnap = function () {
            var tekst = "Giv et hint", klasse = "knap hjaelp";
            if (!this.faerdig && !this.venter && !this.gaetNu()) {
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

        P.visIndsend = function () {
            var e = this.el.indsend;
            var slut = this.faerdig || this.venter || this.gaetNu();
            e.hidden = slut;
            if (slut) return;
            var kan = this.kanSendes();
            var t = (this.indsendTekst && this.indsendTekst()) || "Indsend svar";
            if (e.textContent !== t) e.textContent = t;
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        /* Kortets nederste raekke: beskeden og knapperne. Under et gaet og naar
           opgaven er loest, er raekken vaek, medmindre et klik i scenen lige har
           faaet et svar. */
        P.visBund = function () {
            var slut = this.faerdig || this.venter || this.gaetNu();
            var b = this.nuB || this.fast || { html: "", klasse: "" };
            var harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = slut;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.hidden = slut && !harTekst;
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

        /* ----- Hjaelpeknappen (og den groenne knap paa kortet) ---------------------------- */
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
                this.videre();
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
        P.loest = function (maade, tekst, svaret) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            this.faerdig = true;
            this.venter = false;
            this.hjaelp = 0;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || (maade !== "svar" && !this.brugtSvar && !this.fejlet);
            this.gem();
            this.sejrT = 0;
            var alle = this.antalLoest() === this.opgaver.length;
            this.slut = { maade: maade, svaret: svaret || "", tekst: (tekst || "") + (alle && foerste ? " " + D.FAERDIG[navn] : "") };
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* Et rigtigt svar, og opgaven har en del mere: forklaringen staar alene
           paa det groenne kort, og eleven gaar selv videre med knappen */
        P.mellemsvar = function (maade, tekst, maerke, knap) {
            this.venter = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.mellem = { maade: maade, tekst: tekst || "", maerke: maerke, knap: knap };
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
            this.el.besked.innerHTML = b.html;
            this.nuB = b;
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };
        P.kortTekst = function () { return this.el.skort.textContent; };

        /* Det, der er at sige ud over kortets egen tekst: kun det, fanen har at
           tilfoeje (sceneLinje giver "", naar kortet er nok) */
        P.trinLinje = function () {
            if (this.faerdig || this.venter || this.gaetNu()) return "";
            return (this.sceneLinje && this.sceneLinje()) || "";
        };

        P.naesteLinje = function (foer, slags) {
            var t = this.trinLinje();
            this.sidsteTrin = t;
            this.besked((foer ? foer + " " : "") + NK.html(t), slags || "");
        };

        /* En god delbesked: groen linje med ét skridt videre */
        P.godLinje = function (tekst) {
            this.besked('<span class="b-maerke">Rigtigt</span> ' + NK.html(tekst), "god");
        };

        /* Et forkert svar: beskeden, et ryst og en knap, der lyser stille.
           Svaret koster stjernen. */
        P.fejlLinje = function (tekst) {
            this.fejlet = true;
            this.besked('<span class="b-maerke">Ikke rigtigt</span> ' + NK.html(tekst), "skidt");
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

        /* ----- Fokus, nulstil og maal ------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        P.nulstil = function () { this.vaelg(this.nr); };

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
            /* Indsend-knappen viser det, der bliver sendt ind (fx temperaturen) */
            this.visIndsend();
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

        /* ----- Termometeret (fane 1 og 2) --------------------------------------------
           Fanen har this.termo (NK.Termostat) og this.lay.termo (maalene). */
        P.paaTermo = function (pt) {
            var TM = this.lay && this.lay.termo;
            if (!TM || !this.termo) return false;
            if (Math.hypot(pt.x - TM.kugle.x, pt.y - TM.kugle.y) <= TM.kugle.r + 4) return false;
            return this.termo.rammer(pt, TM);
        };

        P.termoNed = function (pt) {
            var TM = this.lay && this.lay.termo;
            if (!this.paaTermo(pt)) return false;
            if (this.spaer()) return false;
            if (this.termo.start(pt, TM)) { this.nulstilHjaelp(); this.roertTermo = true; return true; }
            return false;
        };

        P.termoOver = function (pt) {
            var TM = this.lay && this.lay.termo;
            if (!TM || !this.termo || !pt) { this.haandtagLys = false; return null; }
            this.haandtagLys = this.termo.rammerHaandtag(pt, TM);
            if (this.haandtagLys) return "greb";
            if (Math.hypot(pt.x - TM.kugle.x, pt.y - TM.kugle.y) <= TM.kugle.r + 4) return "pointer";
            return this.termo.rammer(pt, TM) ? "pointer" : null;
        };

        /* Paaskeaegget: et klik paa termometerets kugle */
        P.termoKugle = function (pt) {
            var TM = this.lay && this.lay.termo;
            if (!TM || Math.hypot(pt.x - TM.kugle.x, pt.y - TM.kugle.y) > TM.kugle.r + 4) return false;
            var varm = this.termo.T > D.STOF.ethanol.kp;
            this.kortBesked(varm ? D.PAASKE.varm : D.PAASKE.kold, 8, "gul");
            NK.paaskeaeg = (NK.paaskeaeg || 0) + 1;
            return true;
        };

        P.tast = function (e) {
            if (!this.termo) return false;
            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return false;
            if (this.spaer()) return true;
            if (this.termo.tast(e.key, e.shiftKey)) { this.nulstilHjaelp(); this.roertTermo = true; return true; }
            return false;
        };

        /* Enter: send svaret ind, eller gaa videre, naar kortet er groent */
        P.enter = function () {
            if (this.faerdig || this.venter) this.knap(); else this.indsendKlik();
        };

        /* Temperaturen som eleven sender den ind: hele grader */
        P.Tnu = function () { return Math.round(this.termo.T); };

        P.indsendTemp = function () {
            return "Indsend svar: " + D.grader(this.Tnu()) + " °C";
        };
    }

    NK.Fane = { paa: paa };
}());
