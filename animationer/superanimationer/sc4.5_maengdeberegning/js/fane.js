/* =====================================================================
   fane.js - det, de tre faner har til faelles

   Hver fane er et skema paa en tavle, en scene omkring det og Kemichael
   ved katederet. Denne fil laegger de faelles metoder paa fanens
   prototype med NK.Fane.paa(P, valg):

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * knappen i opgavekortet: Giv hint, Vis svaret, Naeste opgave
     * tjekket af felterne i skemaet og afstemningen
     * beregningerne i panelet, som de skal skrives
     * linjen i opgavekortet: hvor man er, naeste skridt, fejl og ros
     * Kemichael, der kun siger noget, naar eleven beder om et hint, og
       tier igen, naar delopgaven er loest. Er han sendt ud, staar hintet
       i opgavekortet i stedet.

   Fanen selv har: lavSpec(nr, nyeTal) (opgaven til NK.Skema.lavOpgave),
   layout(), tegn(), opdaterScene(dt) og kroge som efterLoest(id, maade).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc4.5-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function () {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.k = new NK.RoligLaerer({ boble: navn + "-boble", knap: navn + "-kknap" });
            this.skema = new NK.Skema({
                vaert: el("felter"), navn: navn,
                kald: {
                    tjek: function (id) { mig.tjekCelle(id); },
                    afstem: function () { mig.tjekAfstem(); },
                    klik: function (id) { mig.klikLaast(id); },
                    skriver: function () { mig.k.skriver(); }
                }
            });
            this.opgaver = valg.opgaver;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = this.opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.rostAlt = !!gemt._rost;
            this.ekstra = [];
            this.hjaelp = 0;
            this.el = {
                knap: el("knap"), liste: el("liste"), nye: el("nye"), linjer: el("linjer"), kort: el("kort"), besked: el("besked")
            };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.nye.addEventListener("click", function () { mig.nyeTal(); });
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
                var r = D.reaktion(o.r);
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "hyldelinje";
                knap.innerHTML = '<span class="hl-nr">' + (i + 1) + '</span><span class="hl-navn">' + NK.html(r.navn) +
                    '<em>' + NK.html(D.skema(r)) + '</em></span><span class="hl-stjerner" id="' + navn + '-stj-' + i + '"></span>';
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
            var spec = this.lavSpec(i, nyeTal);
            this.spec = spec;
            this.opg = NK.Skema.lavOpgave(spec);
            this.skema.trinvis = this.trinvis !== false;
            this.skema.saet(this.opg);
            this.hjaelp = 0;
            this.brugtSvar = false;
            this.faerdig = false;
            this.ekstra = [];
            if (this.nyOpgave) this.nyOpgave();
            this.layout();
            this.visKort();
            this.visLinjer();
            this.visListe();
            this.k.tie();
            this.naesteLinje(this.introNu ? D.INTRO[navn] : "", "");
            this.introNu = false;
            this.fokus();
        };

        P.nyeTal = function () { this.vaelg(this.nr, true); };

        /* Et tal fra listen, helst et andet end sidst */
        P.traek = function (liste, sidst) {
            var andre = liste.filter(function (x) { return x !== sidst; });
            return NK.tilfaeldig(andre.length ? andre : liste);
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr], r = D.reaktion(o.r);
            NK.saetTekst(navn + "-titel", r.navn);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", this.promptHTML());
            this.el.kort.classList.toggle("sejr", this.faerdig);
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
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Det trin, hint og svar gaelder ---------------------------------- */
        P.trin = function () {
            var s = this.skema, nx = s.naeste();
            if (!nx || nx === "afstem" || nx === "valg" || s.trinvis) return nx;
            var a = s.aktiv && s.celle(s.aktiv);
            if (a && s.erAaben(a.id)) return a.id;
            if (s.erAaben(nx)) return nx;
            var o = this.opg, fundet = null;
            o.trin.forEach(function (t) { if (!fundet && o.celler[t] && s.erAaben(t)) fundet = t; });
            return fundet || nx;
        };

        /* ----- Knappen: Giv hint, Vis svaret, Naeste opgave --------------------- */
        P.knap = function () {
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste, false);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg(0, true);
                return;
            }
            var t = this.trin();
            if (!t) return;
            if (this.hjaelp === 0) {
                this.hjaelp = 1;
                if (t === "valg") this.hjaelpVis("<b>Hint:</b> " + this.valgHint(), "hint");
                else {
                    this.skema.fremhaev = t === "afstem" ? null : t;
                    this.hjaelpVis("<b>Hint:</b> " + this.skema.hintHTML(t), "hint");
                }
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            if (t === "afstem") {
                this.skema.visKoefSvar();
                this.afstemt("svar");
            } else if (t === "valg") {
                this.vaelgBegr(this.opg.kilde, "svar");
            } else {
                this.celleLoest(t, "svar");
            }
        };

        /* ----- Tjek ------------------------------------------------------------ */
        P.tjekCelle = function (id) {
            var s = this.skema;
            if (!s.erAaben(id)) return;
            s.aktiv = id;
            var res = s.tjek(id, s.skrevet(id));
            if (res.tom) { this.besked(NK.html(res.besked), ""); this.fokus(); return; }
            if (res.ok) { this.celleLoest(id, "ok"); return; }
            s.markerForkert(id);
            this.besked(NK.html(res.besked), "skidt");
            this.fokus();
        };

        P.tjekAfstem = function () {
            var res = this.skema.tjekKoef();
            if (res.tom) { this.besked(NK.html(res.besked), ""); return; }
            if (res.ok) { this.afstemt("ok"); return; }
            this.skema.rystKoef();
            this.besked(NK.html(res.besked), "skidt");
        };

        P.afstemt = function (maade) {
            this.skema.afstem(maade);
            this.hjaelp = 0;
            this.ekstra.push({ trin: "afstem", html: "Afstemt: " + NK.html(D.skema(this.opg.r)), svar: maade === "svar" });
            this.visLinjer();
            if (this.efterAfstem) this.efterAfstem(maade);
            /* Delopgaven er loest: Kemichael tier, eller viser det svar, han blev bedt om */
            if (maade === "svar") this.svarVis("Afstemt: " + NK.html(D.skema(this.opg.r)) + ".");
            else { this.k.tie(); this.naesteLinje(NK.tilfaeldig(D.ROS), "god"); }
            this.visKnap();
            this.fokus();
        };

        P.celleLoest = function (id, maade) {
            this.skema.loes(id, maade);
            this.hjaelp = 0;
            if (maade === "svar") this.brugtSvar = true;
            this.visLinjer();
            if (this.efterLoest) this.efterLoest(id, maade);
            if (maade === "svar") this.svarVis(this.skema.regnHTML(id) + ".");
            else this.k.tie();
            if (this.skema.faerdig()) this.opgaveLoest();
            else if (maade !== "svar") this.naesteLinje(NK.tilfaeldig(D.ROS), "god");
            this.visKnap();
            this.fokus();
        };

        /* Klik paa et felt, der ikke er aabent endnu */
        P.klikLaast = function () {
            var s = this.skema;
            if (!this.opg.afstemt) { this.besked("Afstem skemaet først. Koefficienterne skal bruges senere.", ""); this.fokus(); return; }
            var t = this.trin();
            var foer = t === "valg" ? "Først: hvem slipper op først?" : "Det felt kommer senere. " + s.trinTekst(t);
            this.besked(foer, "");
            this.fokus();
        };

        P.opgaveLoest = function () {
            var s = this.status[this.nr];
            this.faerdig = true;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            var alle = this.antalLoest() === this.opgaver.length;
            var linje = this.slutLinje ? this.slutLinje() : "";
            var ros = NK.tilfaeldig(D.ROS_OPGAVE);
            if (alle && !this.rostAlt) { this.rostAlt = true; ros = D.FAERDIG[navn]; }
            this.gem();
            this.besked((linje ? linje + " " : "") + ros, "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Linjen i opgavekortet ---------------------------------------------
           besked: den faste linje (naeste skridt, fejl, ros). kortBesked: et
           svar paa et klik i scenen, der forsvinder igen efter sek sekunder. */
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

        P.trinLinje = function () {
            var t = this.trin();
            if (!t) return "";
            if (t === "valg") return this.valgTekst();
            if (!this.skema.trinvis && t !== "afstem") return "Udfyld felterne i den rækkefølge, du vil.";
            return this.skema.trinTekst(t);
        };

        P.naesteLinje = function (foer, slags) {
            var t = this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        /* ----- Kemichael: kun naar eleven beder om det ---------------------------
           hjaelpVis: et hint. Han siger det, eller, hvis han er sendt ud, staar
           det i opgavekortet. svarVis: svaret efter Vis svaret; det lukker,
           naar eleven begynder at skrive igen. */
        P.hjaelpVis = function (html, slags) {
            if (!this.k.sig(html, slags)) this.besked(html, "gul");
        };

        P.svarVis = function (html) {
            var trin = this.skema.faerdig() ? "" : this.trinLinje();
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
        P.springIntro = function () { };

        /* ----- Beregningerne i panelet ----------------------------------------- */
        P.visLinjer = function () {
            var o = this.opg, s = this.skema, html = "", ekstra = this.ekstra;
            /* I den raekkefoelge, trinene er loest i skemaet */
            o.trin.forEach(function (t) {
                ekstra.forEach(function (e) {
                    if (e.trin === t) html += '<div class="regn-linje' + (e.svar ? " svar" : "") + '">' + e.html + "</div>";
                });
                var c = o.celler[t];
                if (!c || (c.status !== "ok" && c.status !== "svar")) return;
                html += '<div class="regn-linje' + (c.status === "svar" ? " svar" : "") + '">' + s.regnHTML(t) + "</div>";
            });
            if (this.slutHTML) html += this.slutHTML();
            if (!html) html = '<p class="note">Beregningerne kommer her, når svarene er rigtige.</p>';
            NK.saetHTML(navn + "-linjer", html);
        };

        /* ----- Fokus og taster ---------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.faerdig) return;
            this.skema.fokus();
        };

        P.enter = function () { if (this.faerdig) this.knap(); };
        P.nulstil = function () { this.nyeTal(); };

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
            this.skema.opdater(dt);
            this.k.opdater(dt);
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* ----- Musen ------------------------------------------------------------ */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                var u = mig.k.hover(pt) || (mig.overScene ? mig.overScene(pt) : null);
                c.style.cursor = u ? "pointer" : "default";
            });
            c.addEventListener("pointerleave", function () { mig.k.hover(null); if (mig.overScene) mig.overScene(null); c.style.cursor = "default"; });
            c.addEventListener("click", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.k.klik(pt)) return;
                if (mig.klikScene && mig.klikScene(pt)) return;
                mig.fokus();
            });
        };
    }

    NK.Fane = { paa: paa };
}());
