/* =====================================================================
   fane.js - det, de to faner har til faelles

   Der er ingen laerer i animationen (brugerens valg 5. okt. 2026:
   Kemichael helt ud, men hintene skal blive). Al hjaelp staar i én
   linje med den ene knap ved siden af: paa fane 1 statuslinjen nederst
   i scenen, hvor eleven arbejder med vaegten og braenderen, og paa fane
   2 lige under det felt, eleven skriver i (moensteret er
   sc1.4_afstemning).

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * linjen: naeste skridt, fejl, hint og ros, med farve efter hvad
       der skete, og et ryst ved en fejl
     * den ene knap: Giv hint, Vis svaret, Naeste opgave. Den lyser
       stille op, naar eleven lige har svaret forkert.
     * musen i scenen: hold, traek og klik

   Fanen selv har: lavOpgave(nr, nyeTal), promptHTML(), trinInfo()
   ({ hint, svar }), trinLinje(), layout(), tegn(), opdaterScene(dt) og
   musen i scenen: overScene, nedScene, flytScene, opScene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Den plads, statuslinjen mindst fylder nederst i scenen (css: .statuslinje) */
    var BAAND = 76;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc4.8-" + navn;

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
            this.el = { knap: el("knap"), liste: el("liste"), kort: el("kort"), besked: el("besked"),
                status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
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

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            NK.saetTekst(navn + "-titel", o.titel);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", this.promptHTML());
            this.el.kort.classList.toggle("sejr", this.faerdig);
            if (this.el.forfra) this.el.forfra.hidden = !(this.harForfra && this.harForfra());
            if (this.visKortEkstra) this.visKortEkstra();
            this.visKnap();
        };

        P.visKnap = function () {
            var tekst, klasse;
            if (this.faerdig) {
                klasse = "knap videre banker";
                var naeste = this.naesteUloeste();
                if (naeste >= 0) tekst = valg.naesteTekst || "Næste opgave →";
                else if (valg.naesteFane) tekst = valg.slutTekst || "Videre til " + valg.naesteNavn + " →";
                else tekst = "Forfra ↺";
            } else {
                klasse = "knap hjaelp" + (this.pegKnap ? " peg" : "");
                tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
            /* Under det gratis gaet er der intet at hjaelpe med */
            this.el.knap.hidden = !!(this.knapSkjult && this.knapSkjult());
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
                else this.vaelg(0, true);
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
            var html = maade === "svar" ? '<span class="b-maerke">Svaret</span> ' + (svarHTML ? svarHTML + " " : "") :
                '<span class="b-maerke stor">Løst ✓</span> ';
            html += linje;
            if (alle && !this.rostAlt) { this.rostAlt = true; html += " " + NK.html(D.FAERDIG[navn]); }
            this.gem();
            this.besked(html, maade === "svar" ? "gul" : "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Linjen ---------------------------------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. En fejl (skidt) ryster
           linjen og faar knappen til at lyse stille. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
            if (klasse === "skidt") {
                this.pegKnap = true;
                this.visKnap();
                this.ryst();
            }
        };

        P.kortBesked = function (html, sek) {
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: "peger" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            if (this.el.status) this.el.status.className = "statuslinje" + (b.klasse ? " " + b.klasse : "");
            else e.className = "besked" + (b.klasse ? " " + b.klasse : "");
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
            var e = this.el.status || this.el.besked;
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

        P.enter = function () { if (this.faerdig) this.knap(); };
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

        /* Baandet, som statuslinjen fylder nederst i scenen. Paa en fane
           uden statuslinje er det tomt. En lang besked maa gerne vokse lidt
           op over bordets forkant, men aldrig flytte paa scenen. */
        P.baand = function () {
            var H = this.L.h;
            if (!this.el.status) return { y: H, h: 0 };
            return { y: H - BAAND, h: BAAND };
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
