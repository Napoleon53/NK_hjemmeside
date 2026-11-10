/* =====================================================================
   fane.js - det, de to faner har til faelles

   Der er ingen laerer i animationen (brugerens valg 5. okt. 2026:
   Kemichael helt ud, men hintene skal blive).

   Papirkortet (brugerens regler 24. okt. og 3.-4. nov. 2026, bygget 6.
   nov. 2026): al tekst staar paa ét lyst kort oeverst midt i scenen,
   ikke i panelet og ikke i en statuslinje nederst. Kortet har:
     * sk-ind: etiketten (Måling 1) som indlejret overskrift og opgaven,
       eller gaettet med de tre billeder, eller spoergsmaalet med svarene
       (fanens kortIndHTML())
     * sk-bund: linjen med naeste skridt, fejl, hint og ros, den gule
       knap Giv hint / Vis svaret og Indsend svar. Indsend svar er graa,
       til der er noget at sende (fanens harIndsend(), kanSendes() og
       indsend()); et klik paa et svar vaelger kun.
     * sk-blivplads: naar opgaven er loest, bliver kortet staaende med
       opgaven eller spoergsmaalet, forklaringen staar under i en groen
       boks (gul ved Vis svaret), og knappen videre staar, hvor Indsend
       svar stod (NK.Papir.bliv).
   Start forfra staar i panelet, aldrig paa kortet. Udseendet kommer fra
   ../faelles/papirkort.css og .js. Pladsen til kortet er kortZone(): det,
   eleven skal se paa, begynder under den.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * kortet: linjen med farve efter hvad der skete, og et ryst ved en
       fejl; den gule knap lyser stille op efter et forkert svar
     * musen i scenen: hold, traek og klik

   Fanen selv har: lavOpgave(nr, nyeTal), promptHTML(), trinInfo()
   ({ hint, svar }), trinLinje(), layout(), tegn(), opdaterScene(dt) og
   musen i scenen: overScene, nedScene, flytScene, opScene. Den KAN have
   kortIndHTML(), kortKlasse(), harIndsend(), kanSendes(), indsend(),
   tomBesked(), kortKlik(maal) og blivMaerke().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc5.8-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver) {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.opgaver = opgaver;
            this.gemt = NK.hent(NOEGLE, {}) || {};
            this.statusser = {};
            this.status = this.hentStatus("");
            this.rostAlt = !!this.gemt._rost;
            this.hjaelp = 0;
            this.pegKnap = false;        /* knappen lyser stille efter en fejl */
            this.el = { knap: el("knap"), indsend: el("indsend"), liste: el("liste"), kort: el("kort"), ind: el("ind"),
                bund: el("bund"), bliv: el("bliv"), besked: el("besked"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            /* Knapperne, kortet selv tegner: videre, et svar eller et gaet */
            this.el.kort.addEventListener("click", function (e) {
                var t = e.target.closest ? e.target.closest("[data-videre], [data-valg], [data-gaet]") : null;
                if (!t || t.disabled) return;
                if (t.hasAttribute("data-videre")) mig.knap();
                else if (mig.kortKlik) mig.kortKlik(t);
            });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.forfra(); mig.fokus(); });
            this.bygListe();
            this.koblMus();
        };

        /* ----- Hukommelse -------------------------------------------------------
           Loest og stjerne for hver opgave. Fane 2 har et saet pr.
           reaktionsskema: suffikset saettes efter opgavens id. */
        P.hentStatus = function (suffiks) {
            var gemt = this.gemt;
            var liste = this.opgaver.map(function (o) {
                var s = gemt[o.id + suffiks];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.statusser[suffiks] = liste;
            return liste;
        };

        P.gem = function () {
            var ud = {}, mig = this;
            Object.keys(this.statusser).forEach(function (suffiks) {
                mig.opgaver.forEach(function (o, i) {
                    var s = mig.statusser[suffiks][i];
                    if (s.loest) ud[o.id + suffiks] = { l: 1, s: s.stjerne ? 1 : 0 };
                });
            });
            if (this.rostAlt) ud._rost = 1;
            NK.gem(NOEGLE, ud);
        };

        P.antalLoest = function () {
            return this.status.filter(function (s) { return s.loest; }).length;
        };

        /* ----- Opgavelisten ---------------------------------------------------- */
        P.bygListe = function () {
            var mig = this;
            this.el.liste.innerHTML = "";
            this.opgaver.forEach(function (o, i) {
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "hyldelinje";
                knap.innerHTML = '<span class="hl-nr">' + (i + 1) + '</span><span class="hl-navn">' + NK.html(o.titel) +
                    '</span><span class="hl-stjerner" id="' + navn + '-stj-' + i + '"></span>';
                knap.addEventListener("click", function () { mig.vaelg(i, false); });
                mig.el.liste.appendChild(knap);
            });
        };

        P.visListe = function () {
            var mig = this;
            var knapper = this.el.liste.querySelectorAll(".hyldelinje");
            this.status.forEach(function (s, i) {
                knapper[i].classList.toggle("valgt", i === mig.nr);
                knapper[i].classList.toggle("loest", s.loest);
                NK.saetTekst(navn + "-stj-" + i, s.stjerne ? "★" : (s.loest ? "✓" : ""));
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i, nyeTal) {
            this.nr = i;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.lavOpgave(i, nyeTal);
            this.layout();
            this.visKort();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        P.nyeTal = function () { this.vaelg(this.nr, true); };

        /* Kortets hovedtekst (allerede HTML): paa papirkortet bliver et
           spoergsmaal halvfedt, og ord med bindestreg deles ikke */
        P.papirTekst = function (html) { return NK.Papir ? NK.Papir.tekst(html) : html; };

        /* Den hoejde (px fra scenens top), kortet har faaet sat af. Det, eleven
           skal se paa, begynder under den, saa kortet aldrig daekker det.
           Lave skaerme har et mindre kort (papirkort.css). Selvtesten maaler,
           at kortet holder sig inden for pladsen. */
        P.kortZone = function () {
            var z = valg.zone || [200, 176];
            return window.innerHeight <= 720 ? z[1] : z[0];
        };

        /* Kortet blinker blødt: eleven greb ud efter forsoeget, men skal
           foerst goere det, kortet siger (gaette eller trykke videre) */
        P.kortBlink = function () {
            var e = this.el.kort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Teksten paa knappen videre, naar opgaven er loest ("" = ingen knap) */
        P.videreTekst = function () {
            var naeste = this.naesteUloeste();
            if (naeste >= 0) return valg.naesteTekst || "Næste opgave →";
            if (valg.naesteFane) return valg.slutTekst || "Videre til " + valg.naesteNavn + " →";
            return "";
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr], e = this.el.kort;
            var ekstra = this.kortKlasse ? this.kortKlasse() : "";
            var kl = "scenekort" + (this.faerdig ? " loest" + (this.fast.klasse === "gul" ? " svar" : "") : " " + (ekstra || "opgave"));
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            this.el.ind.innerHTML = this.kortIndHTML ? this.kortIndHTML() :
                '<p class="sk-tekst"><span class="sk-chip">' + NK.html(o.titel) + "</span>" + this.papirTekst(this.promptHTML()) + "</p>";
            if (this.visKortEkstra) this.visKortEkstra();
            this.visBliv();
            this.visKnap();
        };

        /* Loest: raekken med linjen og knapperne er vaek, og forklaringen staar
           i en groen boks (gul, naar svaret blev vist) med knappen videre */
        P.visBliv = function () {
            var b = this.el.bliv;
            if (!this.faerdig) { if (b.innerHTML) b.innerHTML = ""; this.visBund(); return; }
            this.el.bund.hidden = true;
            var vist = this.fast.klasse === "gul", knap = this.videreTekst();
            var maerke = this.blivMaerke ? this.blivMaerke(vist) : (vist ? "Svaret" : "Rigtigt");
            var html = NK.Papir.bliv(this.fast.html, maerke, NK.html(knap || "x"), vist);
            if (!knap) html = html.replace(/<button[^>]*data-videre[^>]*>[\s\S]*?<\/button>/, "");
            b.innerHTML = html;
        };

        /* Kortets nederste raekke er vaek, naar der hverken er en linje eller en knap */
        P.visBund = function () {
            var e = this.el;
            if (this.faerdig) { e.bund.hidden = true; return; }
            e.bund.hidden = !this.fast.html && !this.kortT && e.knap.hidden && e.indsend.hidden;
        };

        P.visKnap = function () {
            var k = this.el.knap;
            k.textContent = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            k.className = "knap hjaelp" + (this.hjaelp > 0 ? " svar" : "") + (this.pegKnap ? " peg" : "");
            k.disabled = !!this.auto;
            k.hidden = !!this.faerdig || !this.trinInfo();
            this.visIndsend();
            this.visBund();
        };

        /* Indsend svar: graa, til der er noget at sende */
        P.visIndsend = function () {
            var e = this.el.indsend;
            var har = !this.faerdig && !!this.indsend && !!(this.harIndsend && this.harIndsend());
            e.hidden = !har;
            if (!har) return;
            var kan = !this.auto && !!(this.kanSendes && this.kanSendes());
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        P.indsendKlik = function () {
            if (this.faerdig || this.auto || !this.indsend || !(this.harIndsend && this.harIndsend())) return;
            if (!(this.kanSendes && this.kanSendes())) {
                this.kortBlink();
                if (this.tomBesked) this.besked(NK.html(this.tomBesked()), "gul");
                return;
            }
            this.indsend();
            this.visKnap();
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Knappen: Giv hint, Vis svaret, Naeste opgave --------------------- */
        P.knap = function () {
            if (this.auto) return;
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste, false);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                /* Ellers er der intet videre: Start forfra staar i panelet */
                return;
            }
            var info = this.trinInfo();
            if (!info) return;
            this.pegKnap = false;
            if (this.hjaelp === 0) {
                this.hjaelp = 1;
                this.besked('<span class="b-maerke">Hint</span> ' + info.hint, "hint");
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            info.svar();
            this.visKnap();
            this.fokus();
        };

        /* Et trin er loest: linjen viser det svar, eleven bad om, eller en
           kort ros, og saa det naeste skridt */
        P.trinLoest = function (maade, svarHTML) {
            this.hjaelp = 0;
            this.pegKnap = false;
            if (maade === "svar") this.brugtSvar = true;
            if (this.opgaveFaerdig()) this.opgaveLoest(maade, svarHTML);
            else if (maade === "svar" && svarHTML) this.svarVis(svarHTML);
            else this.naesteLinje(NK.tilfaeldig(D.ROS), "god");
            this.visKnap();
            this.fokus();
        };

        P.opgaveLoest = function (maade, svarHTML) {
            var s = this.status[this.nr];
            this.faerdig = true;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            var alle = this.antalLoest() === this.opgaver.length;
            var linje = this.slutLinje ? this.slutLinje() : "";
            /* Maerket (Rigtigt eller Svaret) saettes af NK.Papir.bliv */
            var html = (maade === "svar" && svarHTML ? svarHTML + " " : "") + linje;
            if (alle && !this.rostAlt) { this.rostAlt = true; html += " " + NK.html(D.FAERDIG[navn]); }
            this.gem();
            this.besked(html.trim(), maade === "svar" ? "gul" : "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Linjen paa kortet ------------------------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. En fejl (skidt) ryster
           linjen og faar den gule knap til at lyse stille op. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
            if (klasse === "skidt") {
                this.pegKnap = !this.faerdig;
                this.visKnap();
                this.ryst();
            }
            if (this.faerdig) this.visBliv();
            else this.visBund();
        };

        /* Paa det loeste kort er der ingen linje: et klik i scenen faar knappen
           videre til at blinke */
        P.kortBesked = function (html, sek) {
            if (this.faerdig) { this.kortBlink(); return; }
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: "peger" });
            this.visBund();
        };

        /* Linjen er en blød boks: groen (ros), roed (fejl), gul (hint og svar)
           eller graa (naeste skridt og svar paa et klik) */
        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            this.el.bund.className = "sk-bund " + (b.html ? (b.klasse || "peger") : "tom");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        P.svarVis = function (html) {
            var trin = this.faerdig ? "" : this.trinLinje();
            this.besked('<span class="b-maerke">Svaret</span> ' + html + (trin ? " " + trin : ""), "gul");
        };

        P.ryst = function () {
            var e = this.el.bund;
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
            if (this.regning) this.regning.fokus();
            else if (this.fokusFelt) this.fokusFelt();
        };

        P.enter = function () {
            if (this.faerdig) this.knap();
            else if (this.indsend && this.harIndsend && this.harIndsend()) this.indsendKlik();
        };

        /* Alt, der staar paa kortet lige nu (til selvtesten) */
        P.kortTekst = function () { return this.el.kort.textContent.replace(/\s+/g, " ").trim(); };
        P.nulstil = function () {
            if (this.harForfra && this.harForfra()) this.forfra();
            else this.nyeTal();
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

        /* Det, eleven skal se paa, begynder under kortet */
        P.top = function () { return this.kortZone() + 10; };

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); this.visBund(); }
            }
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* ----- Musen ------------------------------------------------------------
           Holder fanen tag i noget (braenderen), faar den ogsaa
           flytningerne og slippet, ogsaa uden for laerredet. */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            this.greb = false;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.greb && mig.flytScene) { mig.flytScene(pt); return; }
                var u = mig.overScene ? mig.overScene(pt) : null;
                c.style.cursor = u ? "pointer" : "default";
            });
            c.addEventListener("pointerleave", function () {
                if (!mig.greb) { if (mig.overScene) mig.overScene(null); c.style.cursor = "default"; }
            });
            c.addEventListener("pointerdown", function (e) {
                if (e.button !== undefined && e.button !== 0) return;
                var pt = mig.L.punkt(e);
                if (mig.nedScene && mig.nedScene(pt)) {
                    mig.greb = true;
                    try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                    e.preventDefault();
                }
            });
            function slip(e) {
                if (!mig.greb) return;
                mig.greb = false;
                if (mig.opScene) mig.opScene(mig.L.punkt(e));
            }
            c.addEventListener("pointerup", slip);
            c.addEventListener("pointercancel", slip);
            c.addEventListener("click", function () { mig.fokus(); });
        };
    }

    NK.Fane = { paa: paa };
}());
