/* =====================================================================
   fane.js - det, de to faner har til faelles

   Der er ingen laerer i denne animation (brugerens valg 30. sept. 2026:
   Kemichaels hint var det svageste led).

   Papirkortet (6. nov. 2026, brugerens valg 3.-4. nov.): al tekst staar
   paa ét lyst kort oeverst midt i scenen (scenekortet, ../faelles/
   papirkort.css og papirkort.js). Kortet har opgaven med etiketten
   "Reaktion 3 af 10", beskeden (hint, fejl, et svar paa et klik i
   scenen), den stille knap Giv et hint og hovedknappen Indsend svar.
   Indsend svar er graa, til der er noget at sende, og det er den, der
   bedoemmer: paa fane 1 laver den reaktionen, paa fane 2 tjekker den
   tallene i felterne (Enter goer det samme). Et rigtigt svar laegger
   ikke kortet om. Opgaven bliver staaende, forklaringen kommer under
   den i en groen boks (gul, naar svaret blev vist), og Naeste opgave
   staar, hvor Indsend svar stod. Start forfra ligger i panelet under
   listen, aldrig paa kortet. Der er ingen statuslinje nederst.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: reaktionerne i grupper, med loest og stjerne
       (huskes i browseren)
     * kortet: opgaven, beskeden med farve efter hvad der skete, og et
       ryst ved en fejl
     * hintknappen: Giv et hint > Naeste hint > Vis svaret. Den lyser
       stille op, naar eleven lige har svaret forkert.
     * musen i scenen: hold, traek og klik

   Fanen selv har: lavOpgave(nr), kortTekst(), hintTrin(), visSvar(),
   kanSendes(), indsend(), ikkeKlarTekst(), slutLinje(), opgaveFaerdig(),
   layout(), tegn(), opdaterScene(dt), fokusFelt() og musen i scenen:
   overScene, nedScene, flytScene, opScene, klikScene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc1.4-" + navn;

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
            this.hintE = null;        /* det atom, hintet handler om */
            this.pegKnap = false;     /* knappen lyser stille efter en fejl */
            this.el = { knap: el("knap"), liste: el("liste"), skort: el("skort"), ind: el("ind"),
                besked: el("besked"), status: el("status"), forfra: el("forfra"), indsend: el("indsend") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.slut = null;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            /* Naeste opgave staar paa kortet, naar opgaven er loest */
            this.el.skort.addEventListener("click", function (e) {
                var t = e.target;
                if (t && t.closest && t.closest("[data-videre]")) mig.knap();
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
                    knap.innerHTML = '<span class="oc-f">' + mig.chipTekst(o) + '</span><i class="oc-m"></i>';
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
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.hjaelp = 0;
            this.hintE = null;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.slut = null;
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.lavOpgave(i);
            this.visKort();
            this.layout();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        /* ----- Papirkortet ---------------------------------------------------------
           Etiketten og opgaven. Er opgaven loest, bliver den staaende, og
           forklaringen og Naeste opgave kommer under den (NK.Papir.bliv). */
        P.promptHTML = function () { return NK.html(this.kortTekst()); };

        P.kortHTML = function () {
            var html = '<p class="sk-tekst"><span class="sk-chip">Reaktion ' + (this.nr + 1) + " af " + this.opgaver.length + "</span>" +
                NK.Papir.tekst(this.promptHTML()) + "</p>";
            if (this.slut) html += NK.Papir.bliv(this.slut.html, this.slut.vist ? "Svaret" : "Afstemt", NK.html(this.videreTekst()), this.slut.vist);
            return html;
        };

        P.visKort = function () {
            var e = this.el.skort;
            var kl = "scenekort " + (this.slut ? "loest bliv" + (this.slut.vist ? " svar" : "") : "opgave");
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            var html = this.kortHTML();
            if (this.el.ind._html !== html) { this.el.ind.innerHTML = html; this.el.ind._html = html; }
            this.visKnap();
        };

        /* Teksten paa knappen, der foerer videre */
        P.videreTekst = function () {
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            if (valg.naesteFane) return "Videre til " + valg.naesteNavn + " →";
            return "Næste reaktion →";
        };

        /* Kortet blinker bloedt: eleven greb ud efter scenen, men skal foerst
           goere det, kortet siger */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Den hoejde, der er sat af til kortet oeverst i scenen. Det, eleven
           arbejder med, begynder under top(). Bliver kortet hoejere (en lang
           besked paa en smal skaerm), faar det den plads, det fylder. */
        P.kortZone = function () {
            var basis = window.innerHeight <= 720 ? valg.zone[1] : valg.zone[0];
            return Math.max(basis, this.el.skort.offsetHeight || 0);
        };

        P.top = function () { return 10 + this.kortZone() + 12; };

        P.tjekZone = function () {
            if (this.lay && this.lay.zone !== undefined && this.kortZone() > this.lay.zone) this.layout();
        };

        /* ----- Indsend svar (brugeren 24. okt. 2026) ---------------------------------
           Knapperne + og − og felterne vaelger kun. Bedoemmelsen sker, naar
           eleven trykker Indsend svar (eller Enter). */
        P.indsendKlik = function () {
            if (this.auto || this.faerdig) return;
            if (!this.kanSendes()) {
                this.kortBlink();
                var t = this.ikkeKlarTekst ? this.ikkeKlarTekst() : "";
                if (t) this.kortBesked(t, 4);
                return;
            }
            this.indsend();
            this.fokus();
        };

        P.enter = function () {
            if (this.faerdig) this.knap();
            else this.indsendKlik();
        };

        P.visIndsend = function () {
            var e = this.el.indsend;
            e.hidden = !!this.faerdig;
            var kan = !this.faerdig && !this.auto && this.kanSendes();
            if (e._kan === kan) return;
            e._kan = kan;
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        /* Kortets nederste raekke: beskeden og knapperne. Naar opgaven er
           loest, er raekken vaek (forklaringen og Naeste staar i bliv). */
        P.visBund = function () {
            var b = this.kortT > 0 ? this.nuB : this.fast;
            var har = !!(b && b.html);
            this.el.besked.hidden = !har;
            this.el.knap.hidden = !!this.faerdig;
            this.el.status.hidden = !!this.faerdig && !har;
        };

        /* Hinttrappen for den tilstand, eleven staar i lige nu */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.trin && h.trin.length ? h : { e: null, trin: ["Tæl atomerne på hver side af pilen."] };
        };

        P.visKnap = function () {
            var h = this.hintNu(), tekst, klasse = "knap hjaelp";
            if (this.hjaelp === 0) tekst = "Giv et hint";
            else if (this.hjaelp < h.trin.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.trin.length + ")";
            else { tekst = "Vis svaret"; klasse += " svar"; }
            if (this.pegKnap) klasse += " peg";
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
            this.visIndsend();
            this.visBund();
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
            if (this.auto) return;
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg(this.nr);
                return;
            }
            var h = this.hintNu();
            this.pegKnap = false;
            if (this.hjaelp < h.trin.length) {
                this.hjaelp++;
                this.hintE = h.e;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.trin.length + "</span> " +
                    NK.html(h.trin[this.hjaelp - 1]), "hint");
                if (this.visRegnskab) this.visRegnskab();   /* det atom, hintet handler om, lyser op */
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
            if (this.hjaelp === 0 && !this.hintE) return;
            this.hjaelp = 0;
            this.hintE = null;
            this.visKnap();
        };

        /* ----- Opgaven er loest --------------------------------------------------- */
        P.loest = function (maade, ekstraHTML) {
            var s = this.status[this.nr];
            this.faerdig = true;
            this.hjaelp = 0;
            this.hintE = null;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            this.gem();
            var alle = this.antalLoest() === this.opgaver.length;
            var linje = this.slutLinje ? this.slutLinje() : "";
            var html;
            if (maade === "svar") html = NK.html(ekstraHTML || linje);
            else html = NK.html(linje) + " " + NK.html(NK.tilfaeldig(D.ROS_OPGAVE));
            if (alle) html += " " + NK.html(D.FAERDIG[navn]);
            /* Kortet bliver paa opgaven: forklaringen og Naeste kommer under den */
            this.slut = { html: html, vist: maade === "svar" };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.visBesked(this.fast);
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Beskeden paa kortet ----------------------------------------------------
           besked: den faste besked. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (html, sek) {
            this.kortT = sek || 4;
            this.nuB = { html: NK.html(html), klasse: "peger" };
            this.visBesked(this.nuB);
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom") + (ryster ? " ryster" : "");
            this.visBund();
            this.tjekZone();
        };

        /* Beskeden paa kortet, og naar opgaven er loest, forklaringen under den */
        P.beskedTekst = function () {
            if (this.faerdig) {
                var f = this.el.ind.querySelector(".bliv .st-tekst");
                return f ? f.textContent : "";
            }
            return this.el.besked ? this.el.besked.textContent : "";
        };


        /* Kortet siger selv, hvad der skal goeres: beskeden er tom fra start */
        P.naesteLinje = function (foer, slags) {
            this.besked(foer || "", slags || "");
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

        /* ----- Fokus og taster ---------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.faerdig) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* R og Start forfra: samme opgave fra begyndelsen */
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

        /* Bunden af det, scenen kan bruge (der er ingen statuslinje nederst) */
        P.baand = function () {
            return { y: this.L.h - 10, h: 10 };
        };

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            if (this.opdaterScene) this.opdaterScene(dt);
            this.visIndsend();
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
