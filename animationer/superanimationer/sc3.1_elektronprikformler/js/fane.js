/* =====================================================================
   fane.js - det, de to faner har til faelles (fra sb4.4)

   Al tekst staar paa ét kort oeverst midt i scenen, og der staar intet
   nederst (brugerens oensker 9. og 24. okt. 2026: "teksten skal i
   stedet staa meget tydeligt oeverst i midten, og man skal sjaeldent
   kunne loese opgaver ved tilfaeldigt at klikke paa slidere og knapper.
   Der skal som minimum vaere et indsend svar"). Moenstret er
   scenekortet i sb4.4_intermolekylaere_bindinger.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype.
   valg: navn (forstavelsen paa fanens id'er), naesteFane og naesteNavn.

     * listen i panelet: opgaverne med loest og stjerne (huskes i
       browseren). En stjerne kraever, at opgaven er loest i foerste
       forsoeg uden Vis svaret: et forkert svar, der er sendt ind,
       koster stjernen, saa det ikke betaler sig at gaette loes.
     * scenekortet (visKort): fanens del lige nu (delNu) er en opgave i
       scenen, evt. med knapper paa kortet (ekstra). Intet bedoemmes,
       foer eleven trykker Indsend svar. Et rigtigt svar, der har en del
       mere, faar et groent kort med knappen videre (mellemsvar). Loest:
       kortet er groent med forklaringen og knappen Naeste.
     * kortets nederste raekke: hint, forklaringen til et forkert svar
       og svaret paa et klik i scenen, hjaelpeknappen (Giv et hint >
       Naeste hint > Vis svaret) og Indsend svar. Indsend er graa, til
       der er noget at sende ind, og banker stille, naar der er.
     * laasen (spaer): naar kortet er groent, saetter et klik i scenen
       intet i gang; knappen paa kortet blinker i stedet.

   Fanen SKAL have:
     lavOpgave(i), delNu() -> { tekst, chip, ekstra }, layout(), tegn(),
     opdaterScene(dt), hintTrin(), visSvar(), indsend(), kanIndsende(),
     videre() (naar eleven trykker videre paa et mellemsvar)
   Fanen KAN have: indsendTekst(), kortKlik(e), efterOpgave(), enter().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc3.1-" + navn;

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
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.nulstil(); });
            this.el.skort.addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest("[data-videre]")) { mig.knap(); return; }
                if (mig.kortKlik) mig.kortKlik(e);
            });
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

        P.antalStjerner = function () {
            return this.status.filter(function (s) { return s.stjerne; }).length;
        };

        /* ----- Listen i panelet -------------------------------------------------- */
        P.bygListe = function () {
            var mig = this;
            this.el.liste.innerHTML = "";
            this.chips = [];
            var raekke = document.createElement("div");
            raekke.className = "opg-chips";
            this.opgaver.forEach(function (o, i) {
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "opg-chip";
                knap.title = o.titel || "";
                knap.innerHTML = '<span class="oc-f">' + NK.html(o.chip) + '</span><i class="oc-m"></i>';
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
            this.lavOpgave(i);
            this.visKort();
            this.layout();
            this.visListe();
            this.besked("", "");
        };

        /* En ny del af opgaven: hinttrappen og linjen begynder forfra */
        P.nyDel = function () {
            this.hjaelp = 0;
            this.pegKnap = false;
            this.venter = false;
            this.mellem = null;
            this.visKort();
            this.besked("", "");
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
            if (this.naesteUloeste() >= 0) return valg.naesteTekst || "Næste opgave →";
            return valg.naesteFane ? "Videre til " + valg.naesteNavn + " →" : "Start forfra ↺";
        };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen. Det, eleven
           arbejder med, begynder under top(). Selvtesten maaler kortet i alle
           dele af alle opgaver med det laengste hint og den laengste
           forklaring til et forkert svar. */
        P.kortZone = function () {
            return window.innerHeight <= 720 ? 178 : 188;
        };

        P.top = function () { return 10 + this.kortZone() + 8; };

        /* ----- Scenekortet ------------------------------------------------------------ */
        P.visKort = function () {
            var e = this.el.skort;
            var slut = this.slutNu(), d = slut ? null : this.delNu();
            var kl = "scenekort " + (slut ? "loest" + (slut.maade === "svar" ? " svar" : "") : "opgave");
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            NK.saetHTML(navn + "-ind", this.kortHTML(slut, d));
            this.visKnap();
        };

        P.kortHTML = function (slut, d) {
            if (slut) {
                var maerke = slut.maade === "svar" ? "Svaret" : (slut.maerke || "Rigtigt ✓");
                var svaret = slut.svaret ? '<b class="sk-svaret">' + NK.html(slut.svaret) + "</b> " : "";
                return '<div class="sk-slut"><p class="sk-tekst"><span class="sk-chip">' + maerke + "</span>" + svaret + NK.html(slut.tekst || "") + "</p>" +
                    '<button type="button" class="sk-videre" data-videre="1">' + NK.html(this.videreTekst()) + "</button></div>";
            }
            var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(d.chip || "Opgave") + "</span>" + NK.html(d.tekst) + "</p>";
            if (d.ekstra) html += d.ekstra;
            return html;
        };

        /* Kortet blinker: eleven greb ud efter scenen, men skal foerst goere
           det, kortet siger (trykke videre) */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: naar kortet er groent, saetter et klik i scenen intet i gang.
           Fanen begynder alt, der saetter noget i gang, med
           if (this.spaer()) return; */
        P.spaer = function () {
            if (!this.faerdig && !this.venter) return false;
            this.kortBlink();
            return true;
        };

        P.kanSendes = function () {
            if (this.faerdig || this.venter) return false;
            return this.kanIndsende ? !!this.kanIndsende() : true;
        };

        /* Indsend svar */
        P.indsendKlik = function () {
            if (this.faerdig || this.venter) return;
            if (!this.kanSendes()) { this.kortBlink(); return; }
            this.indsend();
        };

        /* ----- Knapperne i kortets nederste raekke ---------------------------------------- */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.length ? h : ["Læs opgaven på kortet igen."];
        };

        P.visKnap = function () {
            var tekst = "Giv et hint", klasse = "knap hjaelp";
            if (!this.faerdig && !this.venter) {
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
            var slut = this.faerdig || this.venter;
            e.hidden = slut;
            if (slut) return;
            var kan = this.kanSendes();
            var t = (this.indsendTekst && this.indsendTekst()) || "Indsend svar";
            if (e.textContent !== t) e.textContent = t;
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        /* Kortets nederste raekke: beskeden og knapperne. Naar kortet er groent,
           er raekken vaek. */
        P.visBund = function () {
            var slut = this.faerdig || this.venter;
            var b = this.nuB || this.fast || { html: "", klasse: "" };
            var harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            this.el.knap.hidden = slut;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.hidden = slut;
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
                return;
            }
            var h = this.hintNu();
            this.pegKnap = false;
            if (this.hjaelp < h.length) {
                this.hjaelp++;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " +
                    NK.html(h[this.hjaelp - 1]), "hint");
                this.visKnap();
                return;
            }
            this.brugtSvar = true;
            this.visSvar();
            this.visKnap();
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
            this.slut = { maade: maade, svaret: svaret || "", tekst: (tekst || "") + (alle && foerste && D.FAERDIG[navn] ? " " + D.FAERDIG[navn] : "") };
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (maade !== "svar") NK.konfetti(this.el.skort, 40);
            /* Alle opgaver paa fanen er loest: naeste fane kalder i toplinjen */
            if (alle && valg.naesteFane && NK.kaldFane) NK.kaldFane(valg.naesteFane);
            if (this.efterOpgave) this.efterOpgave();
        };

        /* Et rigtigt svar, og opgaven har en del mere: forklaringen staar alene
           paa det groenne kort, og eleven gaar selv videre med knappen */
        P.mellemsvar = function (maade, tekst, knap) {
            this.venter = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.mellem = { maade: maade, tekst: tekst || "", knap: knap };
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
            this.kortT = sek || 5;
            this.visBesked({ html: NK.html(tekst), klasse: klasse || "peger" });
        };

        P.visBesked = function (b) {
            this.el.besked.innerHTML = b.html;
            this.nuB = b;
            this.visBund();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };
        P.kortTekst = function () { return this.el.skort.textContent; };

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

        /* ----- Nulstil og maal --------------------------------------------------- */
        /* Forfra paa samme opgave. Et forkert svar eller Vis svaret foelger
           med, saa Forfra ikke giver stjernen tilbage. */
        P.nulstil = function () {
            var fejlet = this.fejlet && !this.faerdig, brugt = this.brugtSvar && !this.faerdig;
            this.vaelg(this.nr);
            this.fejlet = fejlet;
            this.brugtSvar = brugt;
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

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            if (this.sejrT !== undefined && this.sejrT !== null) this.sejrT += dt;
            if (this.opdaterScene) this.opdaterScene(dt);
            this.visIndsend();
        };

        /* Det groenne glimt over scenen, naar en opgave er loest */
        P.tegnSejr = function (ctx, W, H) {
            if (!this.faerdig || this.slut.maade === "svar" || this.sejrT === undefined || this.sejrT > 0.9) return;
            ctx.save();
            ctx.globalAlpha = 0.12 * (1 - this.sejrT / 0.9);
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
            }
            c.addEventListener("pointerup", slip);
            c.addEventListener("pointercancel", slip);
        };

        /* Enter: send svaret ind, eller gaa videre, naar kortet er groent */
        P.enter = function () {
            if (this.faerdig || this.venter) this.knap(); else this.indsendKlik();
        };

        /* ----- Tallene paa kortet (optaellingen) ----------------------------------
           En raekke knapper fra 1 til 12. En knap vaelger kun; Indsend svar
           sender tallet ind. Et forkert tal, der er sendt ind, bliver roedt. */
        P.talHTML = function () {
            var html = '<div class="tal-raekke" role="group" aria-label="Vælg et tal">';
            for (var t = 1; t <= 12; t++) {
                var kl = "tal-knap";
                if (this.talValg === t) kl += " valgt";
                var forkert = this.talForkert && this.talForkert[t];
                if (forkert) kl += " forkert";
                html += '<button type="button" class="' + kl + '" data-tal="' + t + '"' + (forkert ? " disabled" : "") + ">" + t + "</button>";
            }
            return html + "</div>";
        };

        P.talKlik = function (e) {
            var k = e.target.closest ? e.target.closest("[data-tal]") : null;
            if (!k || k.disabled) return false;
            this.talValg = parseInt(k.getAttribute("data-tal"), 10);
            if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.besked("", "");
            this.nulstilHjaelp();
            this.visKort();
            return true;
        };
    }

    /* ----- Konfetti (fra sb4.4) ----------------------------------------------------
       NK.konfetti(el, antal): et pust ud fra elementets top, naar en opgave er
       loest. */
    var KONFETTI = ["#f2c53d", "#3d9ee0", "#e05446", "#3fae72", "#9b6bd6", "#ffffff"];

    NK.konfetti = function (el, antal) {
        if (!el || !el.getBoundingClientRect) return;
        var r = el.getBoundingClientRect();
        var boks = document.createElement("div");
        boks.className = "konfetti";
        boks.setAttribute("aria-hidden", "true");
        boks.style.left = (r.left + r.width / 2) + "px";
        boks.style.top = (r.top + r.height - 10) + "px";
        document.body.appendChild(boks);
        window.setTimeout(function () { if (boks.parentNode) boks.parentNode.removeChild(boks); }, 3200);
        for (var i = 0; i < (antal || 40); i++) {
            var v = NK.r(-Math.PI * 0.95, -Math.PI * 0.05), fart = NK.r(80, 220);
            var b = document.createElement("i");
            b.style.backgroundColor = KONFETTI[i % KONFETTI.length];
            b.style.setProperty("--dx", (Math.cos(v) * fart * 1.8).toFixed(0) + "px");
            b.style.setProperty("--op", (Math.sin(v) * fart * 0.6).toFixed(0) + "px");
            b.style.setProperty("--ned", NK.r(160, 340).toFixed(0) + "px");
            b.style.setProperty("--rot", NK.r(-720, 720).toFixed(0) + "deg");
            b.style.animationDelay = NK.r(0, 0.15).toFixed(2) + "s";
            if (i % 3 === 0) b.style.borderRadius = "50%";
            boks.appendChild(b);
        }
    };

    NK.Fane = { paa: paa };
}());
