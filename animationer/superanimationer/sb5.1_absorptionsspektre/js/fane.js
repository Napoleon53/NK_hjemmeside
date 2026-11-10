/* =====================================================================
   fane.js - det, de tre faner har til faelles

   Papirkortet (brugerens beslutning 4. nov. 2026: alle aktive
   animationer faar det). Al tekst staar paa ét lyst kort oeverst midt
   i scenen: opgaven, svarene, hint, beskeden ved et forkert svar,
   forklaringen ved et rigtigt svar og knapperne. Der er ingen
   opgavelinje og ingen statuslinje nederst, og panelet har kun
   oplysninger, listen og Start forfra. Moenstrene er sb4.4
   (Indsend svar) og sb3.3/sc7.5 (kortet bliver paa spoergsmaalet).

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype.
   valg: navn (forstavelsen paa id'erne), naesteFane, naesteNavn.

     * listen i panelet: opgaverne i grupper, med loest og stjerne
       (huskes i browseren)
     * scenekortet (visKort): fanens del lige nu (kortData) er
         { gaet: true, tekst, svar: [{ t }] }  et gaet: svarene virker
             med det samme (det er gratis)
         { tekst, chip, ekstra, svar: [{ t, css, tom }], indsend: false }
             en opgave i scenen eller et spoergsmaal. Svarknapperne
             vaelger kun; Indsend svar sender ind (graa, til der er
             noget at sende). indsend: false = ingen Indsend (fx naar
             eleven blot skal se forsoeget koere).
       Et rigtigt svar laegger ikke kortet om: kortet bliver paa delen,
       svaret er groent dér, hvor eleven klikkede, forklaringen staar
       under, og Naeste staar, hvor Indsend svar stod (NK.Papir.bliv).
       Et rigtigt delskridt (mellem) faar det samme med knappen Naeste,
       der foerer til naeste del af opgaven.
     * kortets nederste raekke: hint, forklaringen til et forkert svar
       og et svar paa et klik i scenen, hjaelpeknappen (Giv et hint >
       Naeste hint > Vis svaret, lyser stille op efter en fejl) og
       Indsend svar.
     * laasen (spaer): under et gaet og naar kortet viser Naeste, saetter
       et klik i scenen intet i gang; kortet blinker i stedet. At holde
       musen over grafen er altid i orden.
     * musen i scenen: hold, traek og klik

   Fanen SKAL have: lavOpgave(nr), kortData(), promptHTML() (panelet),
   hintTrin(), visSvar(), layout(), tegn(), opdaterScene(dt).
   Fanen KAN have: kanIndsende(), indsendTekst(), indsend() (en opgave
   i scenen), svarValgt(j) (et svar paa kortet), gaetValg(j),
   efterHint(n), enter(), og musen: overScene, nedScene, flytScene,
   opScene, klikScene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function papir(html) { return NK.Papir ? NK.Papir.tekst(html) : html; }

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sb9.1-" + navn;

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
            this.hjaelp = 0;          /* hvor mange hint eleven har bedt om */
            this.pegKnap = false;     /* knappen lyser stille efter en fejl */
            this.el = { knap: el("knap"), indsend: el("indsend"), liste: el("liste"), kort: el("kort"),
                skort: el("skort"), ind: el("ind"), besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.valgt = null;
            this.forkertSvar = {};
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            /* Svarene, gaettet og den groenne knap ligger inde i kortet */
            this.el.ind.addEventListener("click", function (e) {
                var b = e.target.closest ? e.target.closest("button") : null;
                if (!b || b.disabled) return;
                if (b.hasAttribute("data-videre")) { mig.videreKlik(); return; }
                if (b.hasAttribute("data-gaet")) { mig.gaetKlik(+b.getAttribute("data-gaet")); return; }
                if (b.hasAttribute("data-valg")) mig.valgKlik(+b.getAttribute("data-valg"));
            });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.nulstil(); mig.fokus(); });
            this.bygListe();
            this.koblMus();
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
                var hoved = document.createElement("div");
                hoved.className = "opg-hoved";
                hoved.innerHTML = "<span>" + NK.html(g.titel) + '</span><span class="opg-tal" id="' + navn + "-gt-" + g.id + '"></span>';
                boks.appendChild(hoved);
                var raekke = document.createElement("div");
                raekke.className = "opg-chips";
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
            var alle = this.antalLoest() === this.opgaver.length;
            NK.saetTekst(navn + "-faerdig", alle ? D.FAERDIG[navn] : "");
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.brugtForkert = false;
            this.faerdig = false;
            this.venter = null;
            this.slut = null;
            this.valgt = null;
            this.forkertSvar = {};
            this.gaetForkert = undefined;
            this.vistDel = false;
            this.kortT = 0;
            this.nuB = null;
            this.fast = { html: "", klasse: "" };
            this.lavOpgave(i);
            this.layout();
            this.visKort();
            this.visListe();
            this.fokus();
        };

        /* En ny del af opgaven (fx trin 2): valget og de forkerte svar glemmes */
        P.nyDel = function () {
            this.valgt = null;
            this.vistDel = false;
            this.forkertSvar = {};
            this.hjaelp = 0;
            this.pegKnap = false;
            this.besked("", "");
        };

        P.slutNu = function () { return this.faerdig ? this.slut : this.venter; };

        P.gaetNu = function () {
            if (this.slutNu()) return false;
            var d = this.kortData();
            return !!(d && d.gaet);
        };

        /* Den hoejde, kortet har sat af oeverst i scenen. Tegningen begynder
           under top(). Selvtesten maaler kortet med det laengste hint og den
           laengste forklaring. */
        P.kortZone = function () {
            return window.innerHeight <= 720 ? (valg.zoneLav || 172) : (valg.zone || 192);
        };

        P.top = function () { return 10 + this.kortZone() + 10; };

        P.visKort = function () {
            var slut = this.slutNu(), d = slut ? slut.del : this.kortData();
            var kl = "scenekort " + (slut ? "loest bliv" + (slut.vist ? " svar" : "") : (d.gaet ? "gaet" : (d.svar ? "spm" : "opgave")));
            var e = this.el.skort;
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            this.el.ind.innerHTML = this.kortHTML(d, slut);
            /* Panelet: oplysningerne om stoffet og fremskridtet */
            var o = this.opgaver[this.nr];
            NK.saetTekst(navn + "-titel", o.navn);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", this.promptHTML());
            this.visKnap();
        };

        P.chipNu = function (d) {
            return d.chip || ("Opgave " + (this.nr + 1) + " af " + this.opgaver.length);
        };

        P.kortHTML = function (d, slut) {
            var mig = this, html;
            if (d.gaet && !slut) {
                html = '<span class="gk-maerke">Gæt først</span>';
                if (d.intro) html += '<p class="gk-intro">' + NK.html(d.intro) + "</p>";
                html += '<p class="gk-tekst">' + NK.html(d.tekst) + '</p><div class="gk-svar n' + d.svar.length + '">';
                d.svar.forEach(function (sv, j) {
                    html += '<button type="button" class="gk-knap" data-gaet="' + j + '"><span class="v-bogstav">' + "ABCD".charAt(j) +
                        "</span><span>" + NK.html(sv.t) + "</span></button>";
                });
                return html + "</div>";
            }
            html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(slut && slut.chip ? slut.chip : this.chipNu(d)) + "</span>" +
                papir(NK.html(d.tekst)) + "</p>";
            if (d.ekstra) html += d.ekstra;
            if (d.svar) {
                html += '<div class="sk-svar n' + d.svar.length + (d.farver ? " farver" : "") + '">';
                d.svar.forEach(function (sv, j) {
                    var kl = "sk-knap", laast = !!slut;
                    if (slut) {
                        if (j === slut.rigtig) kl += slut.vist ? " svar-vist" : " rigtig";
                        else if (j === slut.forkert) kl += " forkert";
                        else kl += " dim";
                    } else {
                        if (mig.valgt === j) kl += " valgt";
                        if (mig.forkertSvar[j]) { kl += " forkert"; laast = true; }
                    }
                    var tegn = d.farver ? '<span class="fk-proeve' + (sv.css ? "" : " tom") + '"' + (sv.css ? ' style="background:' + sv.css + '"' : "") + "></span>" :
                        '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span>";
                    html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                        tegn + "<span>" + NK.html(sv.t) + "</span></button>";
                });
                html += "</div>";
            }
            if (slut) html += this.blivRaekke(slut);
            return html;
        };

        /* Forklaringen under svarene og knappen, der foerer videre, dér hvor
           Indsend svar stod. Efter den sidste opgave er der ingen knap: at
           begynde forfra ligger i panelet. */
        P.blivRaekke = function (slut) {
            var maerke = slut.maerke || (slut.vist ? "Svaret" : "Rigtigt");
            var knap = slut.knap;
            if (knap && NK.Papir) return NK.Papir.bliv(NK.html(slut.tekst), NK.html(maerke), NK.html(knap), slut.vist);
            var kl = "sk-bund bliv " + (slut.vist ? "svar" : "god") + (knap ? "" : " uden-knap");
            return '<div class="' + kl + '"><p class="st-tekst"><span class="b-maerke">' + NK.html(maerke) + "</span> " + NK.html(slut.tekst) + "</p>" +
                (knap ? '<button type="button" class="sk-videre" data-videre="1">' + NK.html(knap) + "</button>" : "") + "</div>";
        };

        P.videreTekst = function () {
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            if (valg.naesteFane) return "Videre til " + valg.naesteNavn + " →";
            return null;
        };

        /* ----- Svarene paa kortet ------------------------------------------------- */
        P.valgKlik = function (j) {
            if (this.slutNu() || this.forkertSvar[j]) return;
            this.valgt = j;
            this.nulstilHjaelp();
            /* Beskeden til et forkert svar bliver staaende, til der er valgt nyt */
            if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.besked("", "");
            this.visKort();
            this.fokus();
        };

        P.gaetKlik = function (j) {
            if (this.slutNu() || !this.gaetValg) return;
            this.gaetValg(j);
            this.visKort();
            this.fokus();
        };

        P.kanSendes = function () {
            if (this.slutNu() || this.auto) return false;
            var d = this.kortData();
            if (d.gaet || d.indsend === false) return false;
            if (d.svar) return this.valgt !== null && !this.forkertSvar[this.valgt];
            return this.kanIndsende ? !!this.kanIndsende() : true;
        };

        P.indsendKlik = function () {
            if (this.slutNu() || this.auto) return;
            var d = this.kortData();
            if (d.gaet || d.indsend === false) return;
            if (!this.kanSendes()) { this.kortBlink(); return; }
            if (d.svar) {
                var j = this.valgt;
                this.svarValgt(j, d);
            } else {
                this.indsend();
            }
            this.fokus();
        };

        /* Et forkert svar paa kortet: det bliver roedt og kan ikke vaelges igen */
        P.forkertValg = function (j, tekst) {
            this.forkertSvar[j] = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(tekst);
        };

        P.svarIndeks = function (d, t) {
            for (var j = 0; j < (d.svar || []).length; j++) if (d.svar[j].t === t) return j;
            return -1;
        };

        /* ----- Knapperne i kortets nederste raekke --------------------------------- */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.length ? h : ["Læs opgaven på kortet igen."];
        };

        P.visKnap = function () {
            var slut = this.slutNu(), gaet = this.gaetNu();
            var tekst = "Giv et hint", klasse = "knap hjaelp";
            if (!slut && !gaet) {
                var h = this.hintNu();
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
                else { tekst = "Vis svaret"; klasse += " svar"; }
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
            this.visIndsend();
            this.visBund();
        };

        P.visIndsend = function () {
            var e = this.el.indsend;
            var d = this.slutNu() ? null : this.kortData();
            var skjul = !d || d.gaet || d.indsend === false;
            e.hidden = skjul;
            if (skjul) return;
            var kan = this.kanSendes();
            var t = (!d.svar && this.indsendTekst && this.indsendTekst()) || "Indsend svar";
            if (e.textContent !== t) e.textContent = t;
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        /* Raekken er vaek under et gaet og naar kortet viser Naeste, medmindre
           et klik i scenen lige har faaet et svar */
        P.visBund = function () {
            var slut = !!this.slutNu() || this.gaetNu();
            var b = this.kortT > 0 && this.nuB ? this.nuB : this.fast;
            var harTekst = !!(b && b.html);
            this.el.besked.innerHTML = b ? b.html : "";
            this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = slut;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.hidden = slut && !harTekst;
            this.el.status.className = "sk-bund" + (b && b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom") + (ryster ? " ryster" : "");
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Hjaelpeknappen: ét skridt ad gangen ---------------------------------- */
        P.knap = function () {
            if (this.auto) return;
            if (this.slutNu()) { this.videreKlik(); return; }
            if (this.gaetNu()) { this.kortBlink(); return; }
            var h = this.hintNu();
            this.pegKnap = false;
            if (this.hjaelp < h.length) {
                this.hjaelp++;
                if (this.efterHint) this.efterHint(this.hjaelp);
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " +
                    NK.html(h[this.hjaelp - 1]), "hint");
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            this.vistDel = true;
            this.hjaelp = 0;
            this.besked("", "");
            this.visSvar();
            this.visKort();
            this.fokus();
        };

        /* Den groenne knap: naeste del, naeste opgave eller naeste fane */
        P.videreKlik = function () {
            if (this.venter) {
                var fn = this.venter.fn;
                this.venter = null;
                this.nyDel();
                fn.call(this);
                this.visKort();
                this.fokus();
                return;
            }
            if (!this.faerdig) return;
            var naeste = this.naesteUloeste();
            if (naeste >= 0) this.vaelg(naeste);
            else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
        };

        /* Eleven har gjort noget: hinttrappen begynder forfra */
        P.nulstilHjaelp = function () {
            if (this.hjaelp === 0) return;
            this.hjaelp = 0;
            this.visKnap();
        };

        /* ----- Et rigtigt delskridt: kortet bliver paa delen med Naeste ------------- */
        P.mellem = function (tekst, fn, rigtig) {
            var d = this.kortData();
            this.venter = { del: d, tekst: tekst, fn: fn, knap: "Næste →", vist: !!this.vistDel,
                rigtig: rigtig === undefined ? (d.svar ? this.valgt : null) : rigtig };
            this.besked("", "");
            this.visKort();
        };

        /* ----- Opgaven er loest ---------------------------------------------------- */
        P.loest = function (tekst, maerke, rigtig) {
            var s = this.status[this.nr];
            /* Kortet bliver paa delen; fanen ved, at opgaven er loest */
            this.faerdig = true;
            var d = this.kortData();
            this.hjaelp = 0;
            this.pegKnap = false;
            s.loest = true;
            /* Stjerne kun for foerste forsoeg uden Vis svaret */
            s.stjerne = s.stjerne || (!this.brugtSvar && !this.brugtForkert);
            this.gem();
            /* vist: svaret kom med Vis svaret eller efter et forkert gaet (gult) */
            this.slut = { del: d, tekst: tekst, maerke: maerke, vist: !!this.vistDel,
                rigtig: rigtig === undefined ? (d.svar ? this.valgt : null) : rigtig,
                forkert: this.gaetForkert, knap: this.videreTekst() };
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Kortets nederste raekke ------------------------------------------------
           besked: den faste tekst. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBund();
        };

        P.kortBesked = function (html, sek) {
            this.kortT = sek || 4;
            this.nuB = { html: NK.html(html), klasse: "peger" };
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        /* Det, der skal goeres, staar i opgaven paa kortet; raekken er tom */
        P.naesteLinje = function () { this.besked("", ""); };

        /* Et forkert svar: beskeden, et ryst og en hintknap, der lyser stille */
        P.fejlLinje = function (tekst) {
            this.brugtForkert = true;
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

        /* Kortet blinker: eleven greb ud efter forsoeget, men skal foerst goere
           det, kortet siger (gaette eller trykke Naeste) */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: fanen begynder alt, der saetter noget i gang i scenen, med
           if (this.spaer()) return; */
        P.spaer = function () {
            if (!this.gaetNu() && !this.slutNu()) return false;
            this.kortBlink();
            return true;
        };

        /* ----- Fokus og taster ---------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* Enter: Naeste, naar kortet viser den, ellers Indsend svar */
        P.enter = function () {
            if (this.slutNu()) { this.videreKlik(); return; }
            this.indsendKlik();
        };

        /* R og Start forfra (i panelet): samme opgave fra begyndelsen */
        P.nulstil = function () { this.vaelg(this.nr); };

        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay || this._zone !== this.kortZone()) {
                this._zone = this.kortZone();
                this.layout();
            }
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el(navn + "-anker-" + id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(Math.max(1, b)) + "px";
            e.style.height = Math.round(Math.max(1, h)) + "px";
        };

        /* Bunden af scenen: der er ingen statuslinje mere */
        P.baand = function () {
            return { y: this.L.h, h: 0 };
        };

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.nuB = null; this.visBund(); }
            }
            if (this.opdaterScene) this.opdaterScene(dt);
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
                if (u && u !== "greb" && (mig.gaetNu() || mig.slutNu())) u = null;
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
