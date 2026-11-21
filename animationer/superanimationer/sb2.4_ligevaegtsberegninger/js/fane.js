/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sb2.1 og sc1.4)

   Der er ingen laerer i denne animation. Opgaven, beskeden, hintet og
   Indsend svar staar paa det lyse papirkort oeverst i midten af scenen
   (Niels 4. nov. 2026, ../faelles/papirkort.css og .js). Der er intet
   panel (Niels 21. nov. 2026, REGELSAET 3): opgaverne og Start forfra
   staar i en smal raekke oeverst i scenen.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * raekken oeverst i scenen: opgaverne med nummer og tema, loest og
       stjerne (huskes i browseren); de kommende er laaste numre
     * trin (fanen giver trinNu, kortData().svar, vaelgKortSvar og
       naesteTrin): et spoergsmaal med svarknapper paa kortet. Efter et
       rigtigt svar bliver kortet paa spoergsmaalet med forklaringen og
       Naeste spoergsmaal (this.trinBliv).
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
            this.el = { knap: el("knap"), indsend: el("indsend"), liste: el("liste"), skort: el("skort"),
                ind: el("ind"), besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.nuB = null;
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            this.el.skort.addEventListener("click", function (e) {
                if (!e.target.closest) return;
                if (e.target.closest("[data-videre]")) { mig.knap(); return; }
                var v = e.target.closest("[data-valg]");
                if (v && !v.disabled && mig.vaelgKortSvar) mig.vaelgKortSvar(parseInt(v.getAttribute("data-valg"), 10));
            });
            /* Et talfelt paa kortet (fane 2, runde 3): svaret skrives paa kortet */
            this.el.skort.addEventListener("input", function (e) {
                if (!e.target.hasAttribute || !e.target.hasAttribute("data-kfelt")) return;
                mig.feltV = e.target.value;
                e.target.classList.remove("fejl");
                mig.paab[mig.nr] = true;
                mig.visIndsend();
            });
            this.el.skort.addEventListener("keydown", function (e) {
                if (e.key !== "Enter" || !e.target.hasAttribute || !e.target.hasAttribute("data-kfelt")) return;
                e.preventDefault();
                if (mig.blivNu()) mig.knap(); else mig.indsendKlik();
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

        /* ----- Raekken af opgaver -------------------------------------------------
           Brugeren 21. nov. 2026 ("husk dette"): listen viser kun titlerne paa de
           loeste opgaver og den, eleven er ved. De kommende staar som et nummer
           med en graa streg og kan ikke klikkes, til de er naaet: alle foer dem
           er loest (Vis svaret taeller som loest), eller eleven har vaeret der.
           En opgave, der er loest foer (gemt i browseren), har sin titel.
           Med valg.niveauer (Let, Middel, Svaer paa Med x) kan hvert niveau
           vaelges frit: dets foerste opgave er aaben, og inden for niveauet
           laases titlerne op i raekkefoelge. */
        P.aabenOpgave = function (i) {
            var s = this.status[i], o = this.opgaver[i];
            if (!s) return false;
            if (s.loest || (this.naaetOpg && this.naaetOpg[i])) return true;
            for (var j = 0; j < i; j++) {
                if (valg.niveauer && (this.opgaver[j].gruppe || "alle") !== (o.gruppe || "alle")) continue;
                if (!this.status[j].loest) return false;
            }
            return true;
        };

        /* Raekken oeverst i scenen (Niels 21. nov. 2026, REGELSAET 3 og 17):
           én knap pr. opgave med nummer og tema. Paa Med x staar niveauet
           (Let, Middel, Svaer) foran sine opgaver. */
        P.bygListe = function () {
            var mig = this, forrige = null;
            this.el.liste.innerHTML = "";
            this.chips = [];
            this.opgaver.forEach(function (o, i) {
                var g = o.gruppe || "alle";
                if (g !== forrige && forrige !== null) {
                    var skel = document.createElement("span");
                    skel.className = "or-skel";
                    skel.setAttribute("aria-hidden", "true");
                    mig.el.liste.appendChild(skel);
                }
                if (g !== forrige && valg.niveauer) {
                    var gr = mig.grupper.filter(function (x) { return x.id === g; })[0];
                    var lab = document.createElement("span");
                    lab.className = "or-gruppe";
                    lab.textContent = gr ? gr.titel : "";
                    mig.el.liste.appendChild(lab);
                }
                forrige = g;
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "or-knap";
                knap.innerHTML = '<span class="or-nr"></span><span class="or-navn"></span>';
                knap.addEventListener("click", function () { if (mig.aabenOpgave(i)) mig.vaelg(i); });
                mig.el.liste.appendChild(knap);
                mig.chips[i] = knap;
            });
        };

        P.visListe = function () {
            var mig = this;
            this.status.forEach(function (s, i) {
                var c = mig.chips[i];
                if (!c) return;
                var aaben = mig.aabenOpgave(i), o = mig.opgaver[i];
                var nv = c.querySelector(".or-navn"), nr = c.querySelector(".or-nr");
                var navnHTML = aaben ? NK.html(o.navn) : "";
                if (nv.innerHTML !== navnHTML) nv.innerHTML = navnHTML;
                nr.textContent = s.stjerne ? "★" : (s.loest ? "✓" : String(i + 1));
                c.classList.toggle("laast", !aaben);
                c.disabled = !aaben;
                c.title = aaben ? (i + 1) + ". " + o.navn : "";
                c.setAttribute("aria-label", aaben ? "Opgave " + (i + 1) + ": " + o.navn : "Opgave " + (i + 1) + ", kommer senere");
                c.classList.toggle("valgt", i === mig.nr);
                c.classList.toggle("loest", s.loest);
                c.classList.toggle("stjerne", s.stjerne);
                c.classList.toggle("paabegyndt", !s.loest && !!(mig.paabegyndt && mig.paabegyndt(i)));
            });
            this.tilpasRaekke();
        };

        /* Er raekken for bred, staar kun temaet paa den valgte opgave; de
           andre er numre (temaet staar som vaerktoejstip) */
        P.tilpasRaekke = function () {
            var r = this.el.liste && this.el.liste.parentNode;
            if (!r || !r.offsetWidth) return;
            r.classList.remove("kompakt");
            if (r.scrollWidth > r.clientWidth + 1) r.classList.add("kompakt");
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.naaetOpg = this.naaetOpg || {};
            this.naaetOpg[i] = true;
            this.hjaelp = 0;
            this.hintS = null;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.slut = null;
            this.trinBliv = null;
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
            var tb = this.trinBliv;
            var kl = "scenekort " + (this.faerdig ? "loest bliv" + (this.slut && this.slut.maade === "svar" ? " svar" : "") :
                (tb ? "loest bliv" + (tb.maade === "svar" ? " svar" : "") : "opgave"));
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            NK.saetHTML(navn + "-ind", NK.kc(this.kortHTML()));
            this.visKnap();
        };

        /* Spoergsmaalet saettes med NK.Papir.tekst, saa det staar halvfedt paa
           sin egen linje under indledningen (REGELSAET 6). En ordre uden
           spoergsmaalstegn ("Bestem K med enhed.") staar ogsaa paa sin egen linje. */
        P.kortHTML = function () {
            var d = this.kortData();
            var chip = d.chip || (valg.chip + " " + (this.nr + 1) + " af " + this.opgaver.length);
            if (!d.chip && smal() && this.opgaver[this.nr]) chip += " · " + this.opgaver[this.nr].navn;
            var tekst;
            if (d.spm && /\?\s*$/.test(d.spm)) tekst = NK.Papir.tekst((d.tekst ? d.tekst + " " : "") + d.spm);
            else tekst = (d.tekst ? NK.Papir.tekst(d.tekst) + " " : "") + (d.spm ? '<span class="sk-spm' + (d.tekst ? " sk-linje" : "") + '">' + d.spm + "</span>" : "");
            var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(chip) + "</span>" + tekst + "</p>";
            /* Reaktionsskemaet med stort paa kortets foerste linje (runde 2 paa
               fane 1, Niels: "Kan du i stedet for første linje så ikke bare skrive
               reaktionsskemaet med stort") */
            if (d.rx) {
                html = '<p class="sk-rx"><span class="sk-rx-skema">' + NK.html(d.rx.skema).replace(/\((g|l|s|aq)\)/g, '<span class="sk-rx-ti">($1)</span>') +
                    '</span><span class="sk-rx-k">' + NK.html(d.rx.k) + "</span></p>" + html;
            }
            if (d.svar) {
                html += '<div class="sk-svar n' + d.svar.length + '">';
                d.svar.forEach(function (v) {
                    var c = (v.valgt ? " valgt" : "") + (v.rigtig ? " rigtig" : "") + (v.forkert ? " forkert" : "") +
                        (v.svarVist ? " svar-vist" : "") + (v.dim ? " dim" : "");
                    html += '<button type="button" class="sk-knap' + c + '" data-valg="' + v.j + '"' + (v.laast ? " disabled" : "") + ">" + v.t + "</button>";
                });
                html += "</div>";
            }
            if (d.felt) {
                var fv = d.felt;
                html += '<div class="sk-felt"><span class="sk-felt-pre">' + fv.pre + '</span><input type="text" class="sk-felt-in' + (fv.fejl ? " fejl" : "") +
                    '" data-kfelt="1" autocomplete="off" spellcheck="false" inputmode="decimal" aria-label="' + NK.html(fv.navn || "Svaret") + '" value="' +
                    NK.html(fv.v || "").replace(/"/g, "&quot;") + '"' + (fv.laast ? " disabled" : "") + '>' + (fv.enhed ? '<span class="sk-felt-enh">' + fv.enhed + "</span>" : "") + "</div>";
            }
            if (this.faerdig) html += this.blivHTML();
            else if (this.trinBliv) {
                var tb = this.trinBliv;
                html += NK.Papir.bliv(tb.tekst || "", NK.html(tb.maade === "svar" ? "Svaret" : "Rigtigt"), NK.html(tb.knap || "Næste spørgsmål →"), tb.maade === "svar");
            }
            return html;
        };

        /* Kortet staar i bliv: opgaven eller et trin er loest */
        P.blivNu = function () { return !!(this.faerdig || this.trinBliv); };

        P.blivHTML = function () {
            var slut = this.slut || { maade: "ok", tekst: "" }, vist = slut.maade === "svar";
            var knap = this.videreTekst();
            var maerke = vist ? "Svaret" : (slut.maerke || "Rigtigt");
            var h = NK.Papir.bliv(slut.tekst || "", NK.html(maerke), NK.html(knap), vist);
            /* Ingen knap efter den sidste opgave paa den sidste fane (forfra ligger i raekken) */
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
            if (!this.blivNu() && !(this.laastScene && this.laastScene())) return false;
            this.kortBlink();
            return true;
        };

        /* Hinttrappen for den tilstand, eleven staar i lige nu */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.trin && h.trin.length ? h : { s: null, trin: ["Læs opgaven på kortet igen, og prøv det, den siger."] };
        };

        P.visKnap = function () {
            if (!this.blivNu()) {
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
            return !this.blivNu() && !!(this.kanIndsende && this.kanIndsende());
        };

        /* Indsend svar: graa, til der er noget at sende ind */
        P.visIndsend = function () {
            var e = this.el.indsend;
            e.hidden = this.blivNu() || !!(this.udenIndsend && this.udenIndsend());
            if (e.hidden) return;
            var kan = this.kanSendes();
            var t = (kan && this.indsendTekst && this.indsendTekst()) || "Indsend svar";
            if (e.textContent !== t) e.textContent = t;
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        P.indsendKlik = function () {
            if (this.blivNu()) return;
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
            this.el.knap.hidden = this.blivNu();
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.hidden = this.blivNu();
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
            if (!this.faerdig && this.trinBliv) { this.naesteTrin(); return; }
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

    /* Under 1200 px staar kun numrene i raekken; saa staar temaet paa kortet */
    function smal() { return !!(window.matchMedia && window.matchMedia("(max-width: 1199px)").matches); }

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
