/* =====================================================================
   fane.js - det, de tre faner har til faelles (fra sb4.4, som byggede
   videre paa sc7.5)

   Al tekst staar paa ét kort oeverst midt i scenen, og der staar intet
   nederst (brugerens oensker 9. og 24. okt. 2026: "teksten skal i
   stedet staa meget tydeligt oeverst i midten, og man skal sjaeldent
   kunne loese opgaver ved tilfaeldigt at klikke paa slidere og knapper.
   Der skal som minimum vaere et indsend svar").

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype.
   valg: navn (forstavelsen paa fanens id'er), naesteFane og naesteNavn.

   Nyt i sb8.6: en opgave er en liste af dele (o.dele i js/data.js), og
   rammen foerer eleven igennem dem:
     gaet     stort og gult kort; svarene virker med det samme (gratis).
              Dommen ("Dit gæt holdt") kommer efter det naeste forsoeg.
     forsoeg  eleven goer noget i scenen. Fanen melder delKlaret(), naar
              det er sket. Indsend svar er vaek imens.
     opgave   eleven goer noget i scenen og sender det ind (fanen har
              kanIndsende, indsendTekst og indsend).
     felt     tal i felter paa kortet (fanen har feltHTML og indsend).
     spm      svarene vaelges og sendes ind; multi = vaelg alle, der
              passer. Et svar kan vaere en broek (sv.broek).
   En del med stille: true gaar videre uden det groenne kort; rosen staar
   i kortets nederste raekke ("Rigtigt. ..."), som paa et roligt ark.

     * listen i panelet: opgaverne med loest og stjerne (huskes i
       browseren). En stjerne kraever, at opgaven er loest uden et forkert
       svar, der er sendt ind, og uden Vis svaret.
     * kortets nederste raekke (x-status): det, fanen har at tilfoeje
       (sceneLinje), hint, forklaringen til et forkert svar og svaret paa
       et klik i scenen, hjaelpeknappen (Giv et hint > Naeste hint > Vis
       svaret) og Indsend svar (graa, til der er noget at sende ind).
     * laasen (spaer): kun under et forsoeg og en opgave kan noget saettes
       i gang i scenen; ellers blinker kortet (eller dets groenne knap).
       At se naermere paa det, der er fremme, er altid i orden.

   Fanen SKAL have: nyOpgave(o), layout(), tegn(), opdaterScene(dt).
   Fanen KAN have: forsoegSvar(del), opgaveSvar(del), kanIndsende(del),
     indsendTekst(del), indsend(del), feltHTML(del), nyDelScene(del),
     sceneLinje(), efterOpgave(), fokusFelt().
   Fanen KALDER: delKlaret(maade, tekst), fejlLinje(tekst),
     kortBesked(tekst, sek), omNu() i tegn() og spaer() foerst i alt, der
     saetter noget i gang.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Tekst til kortet: Rf skrives med kursiv R og saenket f, som i bogen */
    NK.rfHTML = function (s) {
        return NK.html(s).replace(/\bRf\b/g, '<i>R</i><sub>f</sub>');
    };

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sb8.6-" + navn;

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
            this.el = { knap: el("knap"), indsend: el("indsend"), liste: el("liste"), skort: el("skort"),
                besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.valgte = {};
            this.feltV = {};
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.nulstil(); mig.fokus(); });
            this.el.skort.addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest("[data-videre]")) { mig.knap(); return; }
                var k = e.target.closest ? e.target.closest("[data-valg]") : null;
                if (!k || k.disabled) return;
                mig.valgKlik(parseInt(k.getAttribute("data-valg"), 10));
            });
            /* Felterne paa kortet: det skrevne huskes, og Enter sender ind */
            this.el.skort.addEventListener("input", function (e) {
                var f = e.target && e.target.getAttribute && e.target.getAttribute("data-felt");
                if (!f) return;
                mig.feltV[f] = e.target.value;
                e.target.classList.remove("forkert");
                mig.nulstilHjaelp();
                mig.visIndsend();
            });
            this.el.skort.addEventListener("keydown", function (e) {
                if (e.key !== "Enter" || !e.target || e.target.tagName !== "INPUT") return;
                e.preventDefault();
                mig.indsendKlik();
            });
            this.bygListe();
            this.koblMus();
        };

        /* Den foerste opgave, eleven ikke har loest */
        P.startFoerste = function () {
            this.nr = this.opgaver.length - 1;
            var start = this.naesteUloeste();
            this.vaelg(start >= 0 ? start : 0);
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

        /* ----- Opgaven og dens dele ------------------------------------------------ */
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
            this.feltV = {};
            var o = this.opgaver[i];
            this.opg = { o: o, di: 0, gaet: -1, gaetDel: -1, forkert: {} };
            if (this.nyOpgave) this.nyOpgave(o);
            if (this.nyDelScene) this.nyDelScene(this.delData());
            this.visKort();
            this.layout();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        /* Delen, eleven staar i (data fra js/data.js) */
        P.delData = function () {
            var g = this.opg;
            return g ? g.o.dele[g.di] : null;
        };

        /* Delen, som kortet viser den */
        P.delNu = function () {
            var del = this.delData();
            if (!del) return null;
            if (del.slags === "gaet") return { slags: "gaet", intro: del.intro, tekst: del.tekst, svar: del.svar };
            if (del.slags === "spm") return { slags: "spm", tekst: del.tekst, svar: del.svar, multi: !!del.multi, forkert: this.opg.forkert };
            var chip = del.slags === "forsoeg" ? "Forsøg" : "Opgave";
            var ekstra = "";
            if (this.opg.gaet >= 0 && this.opg.gaetDel === this.opg.di - 1) {
                var gd = this.opg.o.dele[this.opg.gaetDel];
                ekstra += '<p class="sk-gaet">Dit gæt: <b>' + NK.html(gd.svar[this.opg.gaet].t) + "</b></p>";
            }
            if (del.slags === "felt" && this.feltHTML) ekstra += this.feltHTML(del);
            return { slags: "opgave", del: del.slags, chip: chip, tekst: del.tekst, ekstra: ekstra };
        };

        /* En ny del: valgene, felterne, hinttrappen og linjen begynder forfra */
        P.nyDel = function () {
            this.valgte = {};
            this.feltV = {};
            this.opg.forkert = {};
            this.hjaelp = 0;
            this.pegKnap = false;
            this.venter = false;
            this.mellem = null;
            if (this.nyDelScene) this.nyDelScene(this.delData());
            this.visKort();
            this.layout();
            this.naesteLinje("", "");
            this.fokus();
        };

        P.naesteDel = function () {
            this.opg.di++;
            this.nyDel();
        };

        P.sidsteDel = function () {
            return this.opg.di >= this.opg.o.dele.length - 1;
        };

        /* Det, eleven gaettede paa, holdt eller holdt ikke (efter forsoeget lige efter gaettet) */
        P.gaetDom = function () {
            var g = this.opg;
            if (g.gaet < 0 || g.gaetDel !== g.di - 1) return "";
            var gd = g.o.dele[g.gaetDel];
            return gd.svar[g.gaet].ok ? "Dit gæt holdt. " : "Dit gæt holdt ikke. ";
        };

        /* Delen er klaret. maade: "selv" eller "svar" (Vis svaret). tekst: det,
           kortet skal sige (rosen eller det, eleven saa). svaret: et rigtigt svar,
           der staar med fed skrift. */
        P.delKlaret = function (maade, tekst, svaret) {
            var del = this.delData();
            maade = maade || "selv";
            var dom = del.slags === "forsoeg" ? this.gaetDom() : "";
            if (this.sidsteDel()) {
                this.loest(maade, dom + this.opg.o.loest, svaret);
                return;
            }
            var t = (dom + (tekst || "")).trim();
            if (del.stille || !t) {
                this.naesteDel();
                if (t) {
                    if (maade === "svar") this.besked('<span class="b-maerke">Svaret</span> ' + NK.rfHTML(t), "gul");
                    else this.besked('<span class="b-maerke">Rigtigt</span> ' + NK.rfHTML(t), "god");
                }
                return;
            }
            var forkertGaet = dom.indexOf("ikke") >= 0;
            var maerke = maade === "svar" ? "Svaret" : (del.slags === "forsoeg" ? (forkertGaet ? "Forsøget ✓" : "Godt ✓") : "Rigtigt ✓");
            this.mellemsvar(maade, t, maerke, this.naesteKnap(), svaret);
        };

        /* Teksten paa den groenne knap, der foerer til naeste del */
        P.naesteKnap = function () {
            var n = this.opg.o.dele[this.opg.di + 1];
            if (n && n.slags === "spm") return "Næste spørgsmål →";
            return "Videre →";
        };

        P.gaetNu = function () {
            if (this.faerdig || this.venter) return false;
            var d = this.delData();
            return !!d && d.slags === "gaet";
        };

        /* Det, delen handler om (om i js/data.js), faar en gul ring i scenen */
        P.omNu = function () {
            if (this.faerdig || this.venter || !this.opg) return [];
            var d = this.delData();
            return (d && d.om) || [];
        };

        P.erOm = function (navnet) {
            return this.omNu().indexOf(navnet) >= 0;
        };

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
           maaler kortet i alle dele af alle opgaver. */
        P.kortZone = function () {
            return window.innerHeight <= 720 ? 196 : 210;
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

        function broekHTML(over, under) {
            return '<span class="sv-broek"><span class="rf"><i>R</i><sub>f</sub></span><span>=</span><span class="brk"><span>' + NK.html(over) +
                "</span><span>" + NK.html(under) + "</span></span></span>";
        }

        P.kortHTML = function (slut, d) {
            var mig = this, html;
            if (slut) {
                var maerke = slut.maade === "svar" ? "Svaret" : (slut.maerke || (this.faerdig ? "Løst ✓" : "Godt ✓"));
                var svaret = slut.svaret ? '<b class="sk-svaret">' + NK.rfHTML(slut.svaret) + "</b> " : "";
                return '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">' + maerke + "</span>" + svaret + NK.rfHTML(slut.tekst || "") + "</p>" +
                    '<button type="button" class="sk-videre" data-videre="1">' + NK.html(this.videreTekst()) + "</button></div>";
            }
            if (d.slags === "gaet") {
                html = '<span class="gk-maerke">Gæt først</span>';
                if (d.intro) html += '<p class="gk-intro">' + NK.rfHTML(d.intro) + "</p>";
                html += '<p class="gk-tekst">' + NK.rfHTML(d.tekst) + '</p><div class="gk-svar n' + d.svar.length + '">';
                d.svar.forEach(function (sv, j) {
                    html += '<button type="button" class="gk-knap" data-valg="' + j + '"><span class="v-bogstav">' + "ABCD".charAt(j) + "</span><span>" + NK.rfHTML(sv.t) + "</span></button>";
                });
                return html + "</div>";
            }
            var chip = d.chip || (d.slags === "spm" ? "Spørgsmål" : "Opgave");
            html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(chip) + "</span>" + NK.rfHTML(d.tekst) + "</p>";
            if (d.ekstra) html += d.ekstra;
            if (d.slags === "spm") {
                var formler = d.svar.some(function (sv) { return !!sv.broek; });
                html += '<div class="sk-svar n' + d.svar.length + (d.multi ? " multi" : "") + (formler ? " formler" : "") + '">';
                d.svar.forEach(function (sv, j) {
                    var kl = "sk-knap", laast = false;
                    if (mig.valgte[j]) kl += " valgt";
                    if (d.forkert && d.forkert[j]) { kl += " forkert"; laast = true; }
                    var tegn = d.multi ? '<span class="v-boks" aria-hidden="true">' + (mig.valgte[j] ? "✓" : "") + "</span>" :
                        '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span>";
                    var indhold = sv.broek ? broekHTML(sv.broek[0], sv.broek[1]) :
                        (formler ? '<span class="sv-broek"><span class="rf"><i>R</i><sub>f</sub></span><span>= ' + NK.html(sv.t) + "</span></span>" : NK.rfHTML(sv.t));
                    html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") +
                        (d.multi ? ' aria-pressed="' + (mig.valgte[j] ? "true" : "false") + '"' : "") + ">" +
                        tegn + "<span>" + indhold + "</span></button>";
                });
                html += "</div>";
            }
            return html;
        };

        /* Kortet blinker: eleven greb ud efter forsoeget, men skal foerst goere
           det, kortet siger (gaette, svare eller trykke Naeste) */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: kun under et forsoeg og en opgave kan noget saettes i gang i
           scenen. Fanen begynder alt, der saetter noget i gang, med
           if (this.spaer()) return; */
        P.iForsoeg = function () {
            if (this.faerdig || this.venter) return false;
            var d = this.delData();
            return !!d && (d.slags === "forsoeg" || d.slags === "opgave");
        };

        P.spaer = function () {
            if (this.iForsoeg()) return false;
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
            if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.naesteLinje("", "");
            this.visKort();
        };

        /* Et gaet er gratis og gaar videre med det samme */
        P.gaetValg = function (j) {
            this.opg.gaet = j;
            this.opg.gaetDel = this.opg.di;
            this.naesteDel();
            if (this.efterGaet) this.efterGaet();
        };

        /* Et spoergsmaal: det, der er valgt, holdt op mod svarene. Giver null,
           naar det er rigtigt, ellers forklaringen til den foerste fejl. */
        P.spmFejl = function (d) {
            var mig = this, fejl = null;
            d.svar.forEach(function (sv, j) {
                if (!fejl && mig.valgte[j] && !sv.ok) fejl = sv.f || "Det passer ikke.";
            });
            if (fejl) return fejl;
            var del = this.delData();
            d.svar.forEach(function (sv, j) {
                if (!fejl && sv.ok && !mig.valgte[j]) fejl = del.mangler || "Der mangler noget.";
            });
            return fejl;
        };

        P.harValgt = function () { return Object.keys(this.valgte).length > 0; };

        P.kanSendes = function () {
            if (this.faerdig || this.venter) return false;
            var del = this.delData();
            if (!del || del.slags === "gaet" || del.slags === "forsoeg") return false;
            if (del.slags === "spm") return this.harValgt();
            if (del.slags === "felt") {
                var mig = this;
                return (del.felter || []).every(function (f) { return String(mig.feltV[f.id] || "").trim() !== ""; });
            }
            return this.kanIndsende ? !!this.kanIndsende(del) : true;
        };

        /* Indsend svar */
        P.indsendKlik = function () {
            if (this.faerdig || this.venter) return;
            var del = this.delData();
            if (!del || del.slags === "gaet" || del.slags === "forsoeg") return;
            if (!this.kanSendes()) { this.kortBlink(); return; }
            if (del.slags === "spm") {
                var d = this.delNu();
                var fejl = this.spmFejl(d);
                if (fejl) {
                    if (!d.multi) {
                        /* Et forkert enkeltsvar bliver roedt og kan ikke vaelges igen */
                        for (var k in this.valgte) this.opg.forkert[k] = true;
                        this.valgte = {};
                    }
                    this.visKort();
                    this.fejlLinje(fejl);
                    return;
                }
                this.delKlaret("selv", del.godt, this.svarTekst(del));
                this.fokus();
                return;
            }
            this.indsend(del);
            this.fokus();
        };

        /* Det rigtige svar paa et enkeltsvar staar fremhaevet paa det groenne kort */
        P.svarTekst = function (del) {
            if (del.multi) return "";
            var t = "";
            del.svar.forEach(function (sv) { if (sv.ok && !t) t = sv.broek ? "Rf = " + sv.broek[0] + " / " + sv.broek[1] : sv.t.replace(/\s+/g, " "); });
            return t + (/[.?!]$/.test(t) ? "" : ".");
        };

        /* Vis svaret: delen bliver klaret for eleven */
        P.visSvar = function () {
            var del = this.delData();
            if (!del) return;
            if (del.slags === "gaet") { this.naesteDel(); return; }
            if (del.slags === "spm") {
                var mig = this;
                this.valgte = {};
                del.svar.forEach(function (sv, j) { if (sv.ok) mig.valgte[j] = true; });
                this.visKort();
                this.delKlaret("svar", del.godt, this.svarTekst(del));
                return;
            }
            if (del.slags === "forsoeg") {
                /* Fanen goer forsoeget faerdigt og melder selv delKlaret */
                if (this.forsoegSvar) this.forsoegSvar(del);
                if (this.delData() === del && !this.faerdig && !this.venter) this.delKlaret("svar", del.set || "");
                return;
            }
            var t = this.opgaveSvar ? this.opgaveSvar(del) : "";
            this.delKlaret("svar", t || del.godt || "");
        };

        /* ----- Knapperne i kortets nederste raekke ---------------------------------------- */
        P.hintTrin = function () {
            var d = this.delData();
            return (d && d.hint) || [];
        };

        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.length ? h : ["Læs opgaven på kortet igen, og se på TLC-pladen."];
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
            var del = this.delData();
            var vaek = this.faerdig || this.venter || this.gaetNu() || !del || del.slags === "forsoeg";
            e.hidden = vaek;
            if (vaek) return;
            var kan = this.kanSendes();
            var t = (this.indsendTekst && this.indsendTekst(del)) || "Indsend svar";
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
                this.naesteDel();
                return;
            }
            if (this.gaetNu()) return;
            var h = this.hintNu();
            this.pegKnap = false;
            if (this.hjaelp < h.length) {
                this.hjaelp++;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " +
                    NK.rfHTML(h[this.hjaelp - 1]), "hint");
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

        /* ----- Loest ------------------------------------------------------------------- */
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
            this.slut = { maade: maade, svaret: svaret || "", tekst: (tekst || "") + (alle && foerste && D.FAERDIG[navn] ? " " + D.FAERDIG[navn] : "") };
            this.besked("", "");
            this.visKort();
            this.visListe();
            /* Alle opgaver paa fanen er loest: naeste fane kalder i toplinjen */
            if (alle && foerste) {
                if (valg.naesteFane && NK.kaldFane) NK.kaldFane(valg.naesteFane);
                if (NK.konfetti) NK.konfetti(this.el.skort, 60);
            }
            if (this.efterOpgave) this.efterOpgave();
        };

        /* Et rigtigt svar, og opgaven har en del mere: forklaringen staar alene
           paa det groenne kort, og eleven gaar selv videre med knappen */
        P.mellemsvar = function (maade, tekst, maerke, knap, svaret) {
            this.venter = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.mellem = { maade: maade, tekst: tekst || "", maerke: maerke, knap: knap, svaret: svaret || "" };
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
            this.visBesked({ html: NK.rfHTML(tekst), klasse: klasse || "peger" });
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
            this.besked((foer ? foer + " " : "") + NK.rfHTML(t), slags || "");
        };

        /* Et forkert svar: beskeden, et ryst og en knap, der lyser stille.
           Svaret koster stjernen. */
        P.fejlLinje = function (tekst) {
            this.fejlet = true;
            this.besked('<span class="b-maerke">Ikke rigtigt</span> ' + NK.rfHTML(tekst), "skidt");
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

        /* Enter: send svaret ind, eller gaa videre, naar kortet er groent */
        P.enter = function () {
            if (this.faerdig || this.venter) this.knap(); else this.indsendKlik();
        };
    }

    /* ----- Konfetti (som sb1.4 og sb4.4) ------------------------------------------
       NK.konfetti(el, antal): et pust ud fra elementets top, naar alle
       opgaverne paa en fane er klaret. */
    var KONFETTI = ["#f2c53d", "#3d9ee0", "#e05446", "#3fae72", "#9b6bd6", "#ffffff"];

    NK.konfetti = function (el, antal) {
        if (!el) return;
        var r = el.getBoundingClientRect();
        var boks = document.createElement("div");
        boks.className = "konfetti";
        boks.setAttribute("aria-hidden", "true");
        boks.style.left = (r.left + r.width / 2) + "px";
        boks.style.top = (r.top + 18) + "px";
        document.body.appendChild(boks);
        window.setTimeout(function () { if (boks.parentNode) boks.parentNode.removeChild(boks); }, 4200);
        for (var i = 0; i < (antal || 46); i++) {
            var v = NK.r(-Math.PI * 0.95, -Math.PI * 0.05), fart = NK.r(80, 240);
            var b = document.createElement("i");
            b.style.backgroundColor = KONFETTI[i % KONFETTI.length];
            b.style.setProperty("--dx", (Math.cos(v) * fart * 1.6).toFixed(0) + "px");
            b.style.setProperty("--op", (Math.sin(v) * fart).toFixed(0) + "px");
            b.style.setProperty("--ned", NK.r(180, 380).toFixed(0) + "px");
            b.style.setProperty("--rot", NK.r(-720, 720).toFixed(0) + "deg");
            b.style.animationDelay = NK.r(0, 0.18).toFixed(2) + "s";
            if (i % 3 === 0) b.style.borderRadius = "50%";
            boks.appendChild(b);
        }
    };

    NK.Fane = { paa: paa };
}());
