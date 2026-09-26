/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sc4.5)

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * knappen i opgavekortet: Giv hint, Vis svaret, Naeste opgave
     * linjen i opgavekortet: hvor man er, naeste skridt, fejl og ros
     * Kemichael ved katederet, der kun siger noget, naar eleven beder om
       et hint eller svaret, og tier igen, naar trinnet er loest. Er han
       sendt ud, staar hintet i opgavekortet i stedet.
     * musen i scenen: hold, traek og klik

   Fanen selv har: lavOpgave(nr, nyeTal), promptHTML(), trinInfo()
   ({ hint, svar }), trinLinje(), layout(), tegn(), opdaterScene(dt) og
   musen i scenen: overScene, nedScene, flytScene, opScene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc4.11-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver) {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.k = new NK.RoligLaerer({ boble: navn + "-boble", knap: navn + "-kknap" });
            this.opgaver = opgaver;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.rostAlt = !!gemt._rost;
            this.hjaelp = 0;
            this.el = { knap: el("knap"), liste: el("liste"), nye: el("nye"), kort: el("kort"), besked: el("besked"),
                forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            if (this.el.nye) this.el.nye.addEventListener("click", function () { mig.nyeTal(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.forfra(); mig.fokus(); });
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
                NK.saetTekst(navn + "-stj-" + i, s.stjerne ? "★" : (s.loest ? "✓" : ""));
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i, nyeTal) {
            this.nr = i;
            this.hjaelp = 0;
            this.brugtSvar = false;
            this.faerdig = false;
            this.lavOpgave(i, nyeTal);
            this.layout();
            this.visKort();
            this.visListe();
            this.k.tie();
            this.naesteLinje(this.introNu ? D.INTRO[navn] : "", "");
            this.introNu = false;
            this.fokus();
        };

        P.nyeTal = function () { this.vaelg(this.nr, true); };

        /* Et element fra listen, helst et andet end sidst */
        P.traek = function (liste, sidst) {
            var andre = liste.filter(function (x) { return x !== sidst; });
            return NK.tilfaeldig(andre.length ? andre : liste);
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            NK.saetTekst(navn + "-titel", o.titel);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", this.promptHTML());
            this.el.kort.classList.toggle("sejr", this.faerdig);
            if (this.el.nye) this.el.nye.hidden = !(this.harNyeTal && this.harNyeTal());
            if (this.el.forfra) this.el.forfra.hidden = !(this.harForfra && this.harForfra());
            if (this.visKortEkstra) this.visKortEkstra();
            this.visKnap();
        };

        P.visKnap = function () {
            var tekst, klasse = "knap";
            if (this.faerdig) {
                klasse = "knap blaa banker";
                var naeste = this.naesteUloeste();
                if (naeste >= 0) tekst = "Næste opgave →";
                else if (valg.naesteFane) tekst = "Videre til " + valg.naesteNavn + " →";
                else tekst = "Forfra med nye tal ↺";
            } else {
                tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
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
            if (this.hjaelp === 0) {
                this.hjaelp = 1;
                this.hjaelpVis("<b>Hint:</b> " + info.hint, "hint");
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            info.svar();
            this.visKnap();
            this.fokus();
        };

        /* Et trin er loest: Kemichael tier (eller viser det svar, han blev bedt
           om), og linjen siger det naeste skridt */
        P.trinLoest = function (maade, svarHTML) {
            this.hjaelp = 0;
            if (maade === "svar") this.brugtSvar = true;
            if (this.opgaveFaerdig()) {
                if (maade === "svar" && svarHTML) this.k.sig(svarHTML, "svar", { lukVedSkriv: true });
                else this.k.tie();
                this.opgaveLoest(maade);
            } else {
                if (maade === "svar" && svarHTML) this.svarVis(svarHTML);
                else { this.k.tie(); this.naesteLinje(NK.tilfaeldig(D.ROS), "god"); }
            }
            this.visKnap();
            this.fokus();
        };

        P.opgaveLoest = function (maade) {
            var s = this.status[this.nr];
            this.faerdig = true;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            var alle = this.antalLoest() === this.opgaver.length;
            var linje = this.slutLinje ? this.slutLinje() : "";
            var ros = NK.tilfaeldig(D.ROS_OPGAVE);
            if (alle && !this.rostAlt) { this.rostAlt = true; ros = D.FAERDIG[navn]; }
            this.gem();
            this.besked((linje ? linje + " " : "") + ros, maade === "svar" ? "gul" : "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Linjen i opgavekortet ---------------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (html, sek) {
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: "" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            e.className = "besked" + (b.klasse ? " " + b.klasse : "");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        /* ----- Kemichael: kun naar eleven beder om det --------------------------- */
        P.hjaelpVis = function (html, slags) {
            if (!this.k.sig(html, slags)) this.besked(html, "gul");
        };

        P.svarVis = function (html) {
            var trin = this.faerdig ? "" : this.trinLinje();
            if (this.k.sig(html, "svar", { lukVedSkriv: true })) this.besked(trin, "");
            else this.besked(html + (trin ? " " + trin : ""), "gul");
        };

        /* K: han siger, hvor man er, og hvad man skal (henter ham, hvis han er ude) */
        P.startIntro = function (tving) {
            if (!tving) return;
            if (!this.k.inde()) { this.k.hentInd(); return; }
            var t = this.faerdig ? "" : this.trinLinje();
            this.k.sig(D.INTRO[navn] + (t ? " " + t : ""), "", { lukVedSkriv: true });
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

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            this.k.opdater(dt);
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* ----- Musen ------------------------------------------------------------
           Et tryk i scenen gaar foerst til Kemichael, saa til fanen (nedScene).
           Holder fanen tag i noget (en hane, spatlen), faar den ogsaa
           flytningerne og slippet, ogsaa uden for laerredet. */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            this.greb = false;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.greb && mig.flytScene) { mig.flytScene(pt); return; }
                var u = mig.k.hover(pt) || (mig.overScene ? mig.overScene(pt) : null);
                c.style.cursor = u ? "pointer" : "default";
            });
            c.addEventListener("pointerleave", function () {
                if (!mig.greb) { mig.k.hover(null); if (mig.overScene) mig.overScene(null); c.style.cursor = "default"; }
            });
            c.addEventListener("pointerdown", function (e) {
                if (e.button !== undefined && e.button !== 0) return;
                var pt = mig.L.punkt(e);
                if (mig.k.under(pt)) return;
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
            c.addEventListener("click", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.k.klik(pt)) return;
                mig.fokus();
            });
        };
    }

    NK.Fane = { paa: paa };
}());
