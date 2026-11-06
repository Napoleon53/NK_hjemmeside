/* =====================================================================
   fane.js - det, de to faner har til faelles (som sc8.2, sc5.5 og sc6.1)

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: stofferne som formler i grupper, med loest og
       stjerne (huskes i browseren)
     * papirkortet oeverst midt i scenen (6. nov. 2026, som sb4.4): det
       naeste skridt helt kort (kortLinje i js/sim.js), beskeden (fejl,
       hint og svar), Giv et hint og Indsend svar. Efter et rigtigt svar
       bliver kortet staaende paa bidden: forklaringen staar i en groen
       boks, og Naeste trin staar, hvor Indsend svar stod. Naar skemaet er
       afstemt, staar Naeste opgave samme sted. Start forfra ligger i
       panelet. Foer 6. nov. stod knappen paa papiret i haeftet, og teksten
       stod i opgavekortet i panelet (brugerens oensker 3. okt. 2026).
     * panelet: reaktionen, bidderne (trinlisten) og Start forfra
     * musen i scenen: hold, traek og klik

   Fanen selv har: lavOpgave(nr), kortTekst(), trinInfo()
   ({ hint, svar, svarNavn }), trinLinje(), medTrinLinje(), kanIndsende(),
   tjekTrin(), trinForklaring(t), opgaveFaerdig(), layout(), tegn(),
   opdaterScene(dt), fokusFelt(), startTrin() og musen i scenen:
   overScene, nedScene, flytScene, opScene, klikScene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc8.5-" + navn;

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
            this.rostAlt = !!gemt._rost;
            this.hjaelp = 0;
            this.venter = null;
            this.el = { knap: el("knap"), indsend: el("indsend"), liste: el("liste"), kort: el("kort"), besked: el("besked"),
                forfra: el("forfra"), skort: el("skort"), ind: el("ind"), status: el("status") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            /* Knappen, der foerer videre (Naeste trin, Naeste opgave), bygges med kortet */
            this.el.skort.addEventListener("click", function (e) {
                var v = e.target && e.target.closest ? e.target.closest("[data-videre]") : null;
                if (v) mig.videre();
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
            if (this.rostAlt) ud._rost = 1;
            NK.gem(NOEGLE, ud);
        };

        P.antalLoest = function () {
            return this.status.filter(function (s) { return s.loest; }).length;
        };

        /* ----- Listen: formlerne i grupper --------------------------------------- */
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
                /* En laast opgave (fane 1: den forrige er ikke afstemt) */
                var laast = !!(mig.laast && mig.laast(i));
                c.classList.toggle("laast", laast);
                c.title = laast ? "Afstem skemaet før, så åbner denne" : mig.opgaver[i].navn;
                c.querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : (laast ? "🔒" : ""));
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
            if (this.laast && this.laast(i) && this.opg) {
                this.kortBesked("Afstem skemaet, du er i gang med, først. Så åbner den næste.", 4);
                return;
            }
            this.nr = i;
            this.hjaelp = 0;
            this.peg = false;
            this.venter = null;
            this.brugtSvar = false;
            this.faerdig = false;
            this.lavOpgave(i);
            this.layout();
            if (this.introNu && D.INTRO[navn]) this.besked(D.INTRO[navn], "");
            else this.naesteLinje("", "");
            this.introNu = false;
            this.visKort();
            this.visListe();
            this.fokus();
        };

        /* Den hoejde, papirkortet har faaet sat af oeverst i scenen. Bordet og
           haeftet begynder under top(). Selvtesten maaler kortet med den
           laengste besked i alle bidder, i en almindelig og en lav skaerm. */
        P.kortZone = function () {
            var smal = this.L && this.L.b < 760;
            if (window.innerHeight <= 720) return smal ? 128 : 120;
            return smal ? 158 : 136;
        };

        P.top = function () { return 10 + this.kortZone() + 6; };

        /* ----- Papirkortet og panelet ------------------------------------------------ */
        P.visKort = function () {
            var o = this.opgaver[this.nr];
            NK.saetTekst(navn + "-titel", o.navn);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            this.el.kort.classList.toggle("sejr", this.faerdig);
            if (this.visKortEkstra) this.visKortEkstra();
            var e = this.el.skort, slut = this.faerdig || this.venter;
            var svar = this.faerdig ? this.slutSvar : (this.venter && this.venter.svar);
            var kl = "scenekort " + (slut ? "loest bliv" + (svar ? " svar" : "") : "opgave");
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            NK.saetHTML(navn + "-ind", this.kortHTML());
            this.visKnap();
        };

        /* Kortets tekst: reaktionens navn som indlejret overskrift og det
           naeste skridt helt kort. Efter et rigtigt svar bliver teksten
           staaende, og forklaringen og knappen, der foerer videre, staar
           under den (NK.Papir.bliv). */
        P.kortHTML = function () {
            var o = this.opgaver[this.nr];
            var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(o.navn) + "</span>" +
                NK.Papir.tekst(NK.html(this.kortTekst())) + "</p>";
            if (this.faerdig) return html + NK.Papir.bliv(this.slutHTML || "", this.slutSvar ? "Svaret" : "Rigtigt", NK.html(this.videreTekst()), this.slutSvar);
            if (this.venter) return html + NK.Papir.bliv(this.venter.tekst, this.venter.svar ? "Svaret" : "Rigtigt", "Næste trin →", this.venter.svar);
            return html;
        };

        /* Kortets knap gaar altid fremad (brugeren 3. nov. 2026); forfra ligger i panelet */
        P.videreTekst = function () {
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            if (valg.naesteFane) return "Videre til " + valg.naesteNavn + " →";
            return "Næste opgave →";
        };

        /* Kortet blinker blødt: eleven greb ud efter glasset, men skal foerst
           trykke paa knappen paa kortet */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Giv et hint og Vis svaret staar paa kortet ved siden af Indsend
           svar (foer 6. nov. 2026 i papirets nederste hoejre hjoerne) */
        P.visKnap = function () {
            var slut = this.faerdig || this.venter;
            var tekst = "Giv et hint", klasse = "knap hjaelp";
            if (!slut && this.hjaelp > 0) {
                var info = this.trinInfo();
                tekst = (info && info.svarNavn) || "Vis svaret";
                klasse += " svar";
            }
            if (this.peg && !slut && this.hjaelp === 0) klasse += " peg";
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
            this.el.knap.hidden = !!slut;
            this.visIndsend();
            this.visBund();
        };

        /* Indsend svar: graa, til der er noget at sende */
        P.kanSendes = function () {
            if (this.faerdig || this.venter || this.auto) return false;
            return this.kanIndsende ? !!this.kanIndsende() : true;
        };

        P.visIndsend = function () {
            var e = this.el.indsend;
            var slut = !!(this.faerdig || this.venter);
            e.hidden = slut;
            if (slut) return;
            var kan = this.kanSendes();
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        P.indsendKlik = function () {
            if (this.faerdig || this.venter || this.auto) return;
            if (!this.kanSendes()) { this.kortBlink(); this.fokus(); return; }
            this.tjekTrin();
        };

        /* Kortets nederste raekke: beskeden og knapperne. Naar kortet bliver
           paa bidden, er raekken vaek, medmindre et klik i scenen lige har
           faaet et svar. */
        P.visBund = function () {
            var slut = this.faerdig || this.venter;
            var b = this.nuB || this.fast || { html: "", klasse: "" };
            var harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            this.el.status.hidden = !!slut && !harTekst;
            this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom");
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Knappen paa kortet: Giv et hint og Vis svaret --------------------- */
        P.knap = function () {
            if (this.auto || this.faerdig || this.venter) return;
            var info = this.trinInfo();
            if (!info) return;
            this.peg = false;
            if (this.hjaelp === 0) {
                this.hjaelp = 1;
                this.hjaelpVis("<b>Hint:</b> " + info.hint);
                if (this.efterHint) this.efterHint();
                this.visKnap();
                this.fokus();
                return;
            }
            if (!info.gratis) this.brugtSvar = true;
            info.svar();
            this.visKnap();
            this.fokus();
        };

        /* Den groenne knap paa kortet: naeste trin, naeste opgave eller naeste fane */
        P.videre = function () {
            if (this.auto) return;
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg((this.nr + 1) % this.opgaver.length);
                return;
            }
            if (!this.venter) return;
            this.venter = null;
            this.hjaelp = 0;
            this.naesteLinje("", "");
            if (this.visHaefte) this.visHaefte();
            this.visKort();
            if (this.startTrin) this.startTrin();
            this.fokus();
        };

        /* En bid er loest. Er skemaet afstemt, bliver kortet paa opgaven med
           Naeste opgave. Ellers bliver kortet paa bidden med forklaringen og
           Naeste trin (papirkortet: rosen staar aldrig under det naeste skridt). */
        P.trinLoest = function (maade, svarHTML, ros) {
            this.hjaelp = 0;
            this.peg = false;
            if (maade === "svar") this.brugtSvar = true;
            if (this.opgaveFaerdig()) {
                this.opgaveLoest(maade, maade === "svar" ? svarHTML : null);
                return;
            }
            var tekst = maade === "svar" ? (svarHTML || "") :
                NK.html(String(ros || "").replace(/^Rigtigt\.\s*/, "")) || (this.trinForklaring ? this.trinForklaring(this.sidsteTrin) : "");
            this.venter = { t: this.sidsteTrin, svar: maade === "svar", tekst: tekst };
            this.besked("", "");
            this.visKort();
            this.fokus();
        };

        /* Et nyt trin uden ros (efter dryppet og naar glasset er fyldt): foer
           er linjen foer naeste skridt */
        P.nytTrin = function (foer, slags) {
            this.hjaelp = 0;
            this.peg = false;
            this.naesteLinje(foer || "", slags || "");
            this.visKnap();
            this.fokus();
        };

        P.opgaveLoest = function (maade, svarHTML) {
            var s = this.status[this.nr];
            this.faerdig = true;
            this.venter = null;
            s.loest = true;
            s.stjerne = s.stjerne || (this.stjerneNu ? this.stjerneNu() : !this.brugtSvar);
            var alle = this.antalLoest() === this.opgaver.length;
            var linje = this.slutLinje ? this.slutLinje() : "";
            var ros = NK.tilfaeldig(D.ROS_OPGAVE);
            if (alle && !this.rostAlt) { this.rostAlt = true; ros = D.FAERDIG[navn]; }
            this.gem();
            this.slutSvar = maade === "svar";
            this.slutHTML = (svarHTML ? svarHTML + " " : "") + (linje ? linje + " " : "") + NK.html(ros);
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Beskeden paa kortet ------------------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (html, sek) {
            /* Mens kortet staar paa Naeste trin eller Naeste opgave, blinker
               det i stedet: eleven skal trykke paa knappen paa kortet */
            if (this.faerdig || this.venter) { this.kortBlink(); return; }
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: "" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            this.nuB = b;
            e.innerHTML = b.html;
            e.className = "st-tekst";
            this.visBund();
        };

        /* Det, kortet siger lige nu (uden maerket Rigtigt eller Svaret): et
           klik i scenen, ellers forklaringen, naar kortet bliver paa bidden,
           ellers beskeden */
        P.beskedTekst = function () {
            if ((this.faerdig || this.venter) && !this.kortT) {
                var e = this.el.ind.querySelector(".bliv .st-tekst");
                if (!e) return "";
                var m = e.querySelector(".b-maerke");
                var t = e.textContent;
                return m ? t.slice(t.indexOf(m.textContent) + m.textContent.length).replace(/^\s+/, "") : t;
            }
            return this.el.besked ? this.el.besked.textContent : "";
        };

        /* Den faste linje: det, eleven skal vide foer naeste skridt (det,
           der skete i glasset), og ved bordet (fyld og dryp) hvordan */
        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig || this.venter || !(this.medTrinLinje && this.medTrinLinje()) ? "" : this.trinLinje();
            this.besked((foer ? foer + (t ? " " : "") : "") + t, slags || "");
        };

        /* Et forkert svar: beskeden, og hintknappen paa kortet lyser stille op,
           til den er brugt, eller trinnet er loest */
        P.fejlLinje = function (tekst) {
            if (this.hjaelp === 0 && !this.faerdig && !this.auto) this.peg = true;
            this.besked(NK.html(tekst), "skidt");
            this.visKnap();
        };

        /* ----- Hint: kun naar eleven beder om det. Svaret staar i den gule
           boks, naar kortet bliver paa bidden. */
        P.hjaelpVis = function (html) { this.besked(html, "gul"); };

        /* ----- Fokus og taster ---------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.faerdig || this.venter) {
                /* Intet felt har fokus, saa Enter trykker paa knappen paa kortet */
                var a = document.activeElement;
                if (a && a.tagName === "INPUT" && this.L.canvas.parentNode.contains(a)) a.blur();
                return;
            }
            if (this.fokusFelt) this.fokusFelt();
        };

        P.enter = function () { if (this.faerdig || this.venter) this.videre(); };

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

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* ----- Musen ------------------------------------------------------------
           Et tryk i scenen gaar til fanen (nedScene). Holder fanen tag i noget (et elektronpar), faar den ogsaa
           flytningerne og slippet, ogsaa uden for laerredet. */
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
