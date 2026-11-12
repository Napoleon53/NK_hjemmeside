/* =====================================================================
   fane.js - det, de to faner har til faelles

   Al tekst staar paa ét lyst papirkort oeverst midt i scenen, over
   tavlen (Niels' beslutning 4. nov. 2026: alle aktive animationer har
   papirkortet). Der er ingen statuslinje nederst og intet opgavekort i
   panelet. Moenstret er sb3.2_intermolekylaere_bindinger og
   faelles/papirkort.css og papirkort.js.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: opgaverne i grupper, med loest og stjerne
       (huskes i browseren). Start forfra ligger i panelet.
     * scenekortet (visKort): etiketten (Reaktion 2 af 12), opgaven og
       evt. svarknapper (kortData). Indsend svar er hovedknappen: det,
       eleven bygger eller klikker paa tavlen, bedoemmes foerst, naar
       eleven trykker Indsend svar. Knappen er graa, til der er noget at
       sende ind.
     * kortets nederste raekke: naeste skridt, fejl, hint og svaret paa
       et klik i skemaet, hjaelpeknappen (Giv et hint > Naeste hint >
       Vis svaret) og Indsend svar.
     * loest: kortet bliver paa opgaven (papirkortet). Forklaringen staar
       under opgaven, og knappen, der foerer videre, staar, hvor Indsend
       svar stod. Kortets knap gaar altid fremad; efter den sidste opgave
       paa den sidste fane er der ingen knap paa kortet.
     * laasen: naar opgaven er loest, sker der intet ved et klik paa
       brikkerne eller broeken; kortets groenne knap blinker i stedet.

   NK.Tavle.skema tegner reaktionsskemaet paa tavlen. Hvert stof kan
   klikkes, og et klik paa ligevaegtspilen er et paaskeaeg.

   Fanen selv har: lavOpgave(nr), kortData(), hintTrin(), visSvar(),
   trinLinje(), indsend(), kanIndsende(), indsendTekst(), enter(),
   nulstil() og fokusFelt(). Fanen kan have valgKlik(j) (svarknapper).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var B = NK.Broek;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sb2.1-" + navn;

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
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.nulstil(); mig.fokus(); });
            this.el.skort.addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest("[data-videre]")) { mig.knap(); return; }
                var k = e.target.closest ? e.target.closest("[data-valg]") : null;
                if (!k || k.disabled || !mig.valgKlik) return;
                mig.valgKlik(parseInt(k.getAttribute("data-valg"), 10));
            });
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
                    knap.innerHTML = '<span class="oc-f">' + (i + 1) + '</span><i class="oc-m"></i>';
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
            this.tilpas();
            this.visKort();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen (CSS: --kz).
           Tavlen begynder under den, saa kortet aldrig daekker den.
           Selvtesten maaler kortet med det laengste hint og den laengste
           forklaring. */
        P.kortZone = function () {
            var sc = this.el.skort.parentNode;
            var v = parseFloat(window.getComputedStyle(sc).getPropertyValue("--kz"));
            return isFinite(v) ? v : 190;
        };

        /* ----- Scenekortet ------------------------------------------------------------ */
        P.visKort = function () {
            var e = this.el.skort;
            var kl = "scenekort " + (this.faerdig ? "loest bliv" + (this.slut && this.slut.maade === "svar" ? " svar" : "") : "opgave");
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            NK.saetHTML(navn + "-ind", this.kortHTML());
            this.visKnap();
        };

        P.chipTekst = function () {
            return valg.chip + " " + (this.nr + 1) + " af " + this.opgaver.length;
        };

        P.kortHTML = function () {
            var d = this.kortData();
            var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(this.chipTekst()) + "</span>" +
                NK.Papir.tekst(NK.html(d.tekst)) + "</p>";
            if (d.svar && d.svar.length) {
                html += '<div class="sk-svar n' + d.svar.length + '">';
                d.svar.forEach(function (sv, j) {
                    html += '<button type="button" class="sk-knap' + (sv.klasse ? " " + sv.klasse : "") + '" data-valg="' + j + '"' +
                        (sv.laast ? " disabled" : "") + ">" + NK.html(sv.t) + "</button>";
                });
                html += "</div>";
            }
            if (this.faerdig) html += this.blivHTML();
            return html;
        };

        /* Papirkortet: kortet bliver paa opgaven efter et rigtigt svar.
           Forklaringen staar under opgaven, og knappen, der foerer videre,
           staar, hvor Indsend svar stod. */
        P.blivHTML = function () {
            var slut = this.slut || { maade: "selv", tekst: "" }, vist = slut.maade === "svar";
            var knap = this.videreTekst();
            var maerke = vist ? "Svaret" : (slut.maerke || "Rigtigt");
            if (knap) return NK.Papir.bliv(slut.tekst || "", maerke, NK.html(knap), vist);
            /* Ingen knap: den sidste opgave paa den sidste fane (forfra ligger i panelet) */
            return NK.Papir.bliv(slut.tekst || "", maerke, "", vist).replace(/<button[^>]*data-videre[^>]*><\/button>/, "");
        };

        /* Kortets knap gaar altid fremad (brugeren 3. nov. 2026): naeste
           uloeste opgave, naeste fane eller naeste opgave i listen. Efter den
           sidste opgave paa den sidste fane er der ingen knap. */
        P.videreTekst = function () {
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            if (valg.naesteFane) return "Videre til " + valg.naesteNavn + " →";
            if (this.nr < this.opgaver.length - 1) return "Næste opgave →";
            return "";
        };

        /* Kortet blinker: eleven greb ud efter tavlen, men skal foerst goere
           det, kortet siger (her: trykke Naeste) */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: naar opgaven er loest, saetter et klik paa tavlen intet i
           gang. Fanen begynder alt, der aendrer noget, med  if (this.spaer()) return; */
        P.spaer = function () {
            if (!this.faerdig) return false;
            this.kortBlink();
            return true;
        };

        /* Hinttrappen for den tilstand, eleven staar i lige nu */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.trin && h.trin.length ? h : { s: null, trin: ["Sammenlign brøken med skemaet."] };
        };

        /* ----- Knapperne i kortets nederste raekke ------------------------------------ */
        P.visKnap = function () {
            var tekst = "Giv et hint", klasse = "knap hjaelp";
            if (!this.faerdig) {
                var h = this.hintNu();
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.trin.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.trin.length + ")";
                else { tekst = "Vis svaret"; klasse += " svar"; }
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
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
            this.indsend();
            this.fokus();
        };

        /* Kortets nederste raekke: beskeden og knapperne. Naar opgaven er
           loest, er raekken vaek, medmindre et klik i skemaet lige har
           faaet et svar. */
        P.visBund = function () {
            var b = this.nuB || this.fast || { html: "", klasse: "" };
            var harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = !!this.faerdig;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.hidden = !!this.faerdig && !harTekst;
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

        /* ----- Hjaelpeknappen (og den groenne knap paa kortet) ----------------------- */
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
            if (this.hjaelp === 0 && !this.hintS) return;
            this.hjaelp = 0;
            this.hintS = null;
            this.visLys();
            this.visKnap();
        };

        /* Det stof eller de stoffer, hintet handler om, lyser i skemaet */
        P.visLys = function () {
            var lys = this.faerdig ? null : this.hintS;
            var arter = this.skemaEl ? this.skemaEl.querySelectorAll(".art") : [];
            var liste = !lys ? [] : (Array.isArray(lys) ? lys : [lys]);
            for (var i = 0; i < arter.length; i++) arter[i].classList.toggle("lys", liste.indexOf(arter[i].getAttribute("data-s")) >= 0);
        };

        /* ----- Opgaven er loest ------------------------------------------------------
           maade: "selv" eller "svar" (Vis svaret). tekst er HTML. Kortet
           bliver paa opgaven med forklaringen og knappen, der foerer videre. */
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
            this.slut = { maade: maade, maerke: maerke || "", tekst: (tekst || "") + (alle && foerste ? " " + NK.html(D.FAERDIG[navn]) : "") };
            this.besked("", "");
            this.visLys();
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Beskeden i kortets nederste raekke ------------------------------------
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
            this.el.besked.innerHTML = b.html;
            this.nuB = b;
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };
        P.kortTekst = function () { return this.el.skort.textContent; };

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

        /* ----- Fokus og taster ---------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* Skemaet skal kunne staa paa én linje: skriften goeres mindre,
           til det passer (CSS giver udgangspunktet efter scenens stoerrelse) */
        P.tilpas = function () {
            var e = this.skemaEl;
            if (!e || !e.offsetWidth) return;
            e.style.fontSize = "";
            var fs = parseFloat(window.getComputedStyle(e).fontSize);
            while (fs > 14 && e.scrollWidth > e.clientWidth + 1) {
                fs -= 1;
                e.style.fontSize = fs + "px";
            }
        };

        /* ----- Tegneloekken: kun de korte beskeder har et ur ------------------------ */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
        };

        P.tegn = function () {};

        /* ----- Skemaet paa tavlen ------------------------------------------------- */
        P.bygSkema = function (opg) {
            var mig = this;
            NK.Tavle.skema(this.skemaEl, opg, {
                art: function (a) { mig.klikArt(a); },
                pil: function () { mig.klikPil(); }
            });
        };

        /* Et klik paa et stof i skemaet siger, hvad der staar, ikke hvad man
           skal. Efter et rigtigt svar er tavlen laast: kortet blinker og
           peger paa Naeste, og forklaringen faar ingen ekstra linje. */
        P.klikArt = function (a) {
            if (this.spaer()) return;
            var t = B.skriv(a.s) + " står " + (a.side === "r" ? "før" : "efter") + " pilen. (" + a.t + ") betyder " +
                B.TILSTAND[a.t] + ".";
            if (a.k > 1) t += " Koefficienten er " + a.k + ".";
            this.kortBesked(t, 5);
        };

        /* Paaskeaegget: pilen gaar begge veje */
        P.klikPil = function () {
            var p = this.skemaEl.querySelector(".ligepil");
            if (p) {
                p.classList.remove("koerer");
                void p.offsetWidth;
                p.classList.add("koerer");
            }
            if (this.spaer()) return;
            this.kortBesked("Ved ligevægt forløber reaktionen begge veje på én gang og lige hurtigt. Derfor står der ⇌ og ikke →.", 6);
        };

        /* Efter loesningen: produkterne op, reaktanterne ned, og det, der
           ikke er med, streget ud. Koefficienterne lyser gult som eksponenterne. */
        P.visKobling = function (til) {
            var arter = this.skemaEl.querySelectorAll(".art");
            for (var i = 0; i < arter.length; i++) {
                var e = arter[i];
                var udel = e.getAttribute("data-ude") === "1";
                e.classList.toggle("op", !!til && !udel && e.getAttribute("data-side") === "p");
                e.classList.toggle("ned", !!til && !udel && e.getAttribute("data-side") === "r");
                e.classList.toggle("ude", !!til && udel);
            }
        };
    }

    NK.Fane = { paa: paa };

    /* ===================================================================
       Skemaet paa tavlen: hvert stof er en knap med koefficient, formel
       og tilstandsform, og ligevaegtspilen er tegnet som to halve pile.
       =================================================================== */
    var PIL_SVG = '<svg viewBox="0 0 34 22" aria-hidden="true">' +
        '<g class="halv-op"><path d="M3 8 H30 L23 2.5" /></g>' +
        '<g class="halv-ned"><path d="M31 14 H4 L11 19.5" /></g></svg>';

    function skema(el, opg, klik) {
        el.innerHTML = "";
        var arter = B.alle(opg);
        arter.forEach(function (a, i) {
            if (i === opg.r.length) {
                var pil = document.createElement("button");
                pil.type = "button";
                pil.className = "ligepil";
                pil.title = "Ligevægtspilen";
                pil.setAttribute("aria-label", "Ligevægtspilen");
                pil.innerHTML = PIL_SVG;
                pil.addEventListener("click", function () { if (klik && klik.pil) klik.pil(); });
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
            k.setAttribute("data-side", a.side);
            k.setAttribute("data-ude", B.udelades(a) ? "1" : "0");
            k.innerHTML = (a.k > 1 ? '<span class="koef">' + a.k + "</span>" : "") +
                '<span class="fo">' + NK.html(B.skriv(a.s)) + "</span>" +
                '<span class="ti">(' + a.t + ")</span>";
            k.addEventListener("click", function () { if (klik && klik.art) klik.art(a); });
            el.appendChild(k);
        });
    }

    NK.Tavle = { skema: skema };
}());
