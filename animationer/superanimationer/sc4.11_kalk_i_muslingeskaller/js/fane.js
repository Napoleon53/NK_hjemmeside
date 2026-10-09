/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sc4.5)

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * knappen i opgavekortet: Giv hint, Vis svaret, Naeste opgave
     * linjen i opgavekortet: hvor man er, naeste skridt, fejl og ros,
       og hintet eller svaret, naar eleven beder om det med den gule knap
       (ingen Kemichael: brugerens valg 9. okt. 2026)
     * musen i scenen: hold, traek og klik

   valg.scene: opgavekortet staar midt i scenen i stedet for i panelet
   (fane 1 og 3, brugerens oenske 9. okt. 2026: eleverne klikker, foer de
   laeser). Saa viser kortets store tekst det naeste skridt (promptHTML),
   og linjen under den har kun hint, fejl, ros og forklaringen. Er der et
   gaet (fanens gaetNu()), er kortet stort og gult, og gaetBlink() faar
   det til at blinke, hvis eleven klikker paa forsoeget foerst. Pladsen
   til kortet er sat af oeverst i scenen (kortZone()).

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
            this.scene = !!valg.scene;
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

        /* En opgave kan vaere skjult (fane 2: baglaens kun med mol) */
        P.erSkjult = function (i) { return !!(this.skjult && this.skjult(i)); };

        P.antalSynlige = function () {
            var mig = this;
            return this.opgaver.filter(function (o, i) { return !mig.erSkjult(i); }).length;
        };

        P.antalLoest = function () {
            var mig = this;
            return this.status.filter(function (s, i) { return s.loest && !mig.erSkjult(i); }).length;
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
                knapper[i].hidden = mig.erSkjult(i);
                NK.saetTekst(navn + "-stj-" + i, s.stjerne ? "★" : (s.loest ? "✓" : ""));
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
            NK.saetTekst(navn + "-ialt", String(this.antalSynlige()));
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

        /* Er eleven ved et gaet, foer forsoeget begynder (kun kort i scenen) */
        P.gaetAktivt = function () { return !!(this.scene && !this.faerdig && this.gaetNu && this.gaetNu()); };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen. Det, eleven
           skal se paa, begynder under den, saa kortet aldrig daekker det, og
           intet flytter sig, naar kortet skifter. Lave skaerme har et mindre
           kort (se stilarket). */
        P.kortZone = function () {
            var lav = window.innerHeight <= 720;
            if (valg.zone) return lav ? valg.zone[1] : valg.zone[0];
            return lav ? 210 : 248;
        };

        /* Eleven klikkede paa forsoeget, foer der var gaettet: kortet blinker */
        P.gaetBlink = function () {
            var e = this.el.kort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
            this.besked(NK.html(D.FOERST.gaet), "gul");
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            var gaet = this.gaetAktivt();
            var chip = o.titel;
            if (gaet) chip = "Gæt først";
            else if (this.scene && this.faerdig) chip = this.slutChip ? this.slutChip() : (this.brugtSvar ? "Svaret" : "Løst ✓");
            NK.saetTekst(navn + "-titel", chip);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", this.promptHTML());
            this.el.kort.classList.toggle("sejr", this.faerdig);
            if (this.scene) {
                this.el.kort.classList.toggle("gaet", gaet);
                this.el.kort.classList.toggle("svar", this.faerdig && !!this.brugtSvar);
                if (!gaet) this.el.kort.classList.remove("blink");
            }
            if (this.el.nye) this.el.nye.hidden = !(this.harNyeTal && this.harNyeTal());
            if (this.el.forfra) this.el.forfra.hidden = !(this.harForfra && this.harForfra());
            if (this.visKortEkstra) this.visKortEkstra();
            this.visKnap();
        };

        P.visKnap = function () {
            var tekst, klasse = "knap hjaelp";
            if (this.faerdig) {
                klasse = "knap blaa banker";
                var naeste = this.naesteUloeste();
                if (naeste >= 0) tekst = valg.naesteTekst || "Næste opgave →";
                else if (valg.naesteFane) tekst = "Videre til " + valg.naesteNavn + " →";
                else tekst = valg.forfraTekst || "Forfra med nye tal ↺";
            } else {
                tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
                if (this.hjaelp > 0) klasse += " svar";
                /* Under et gaet er det gule kort det eneste fyldte gule: knappen er kun et omrids */
                else if (this.gaetAktivt()) klasse += " svar";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
            /* Paa kortet i scenen er knappen vaek, mens forsoeget koerer af sig selv */
            this.el.knap.hidden = this.scene && !!this.auto && !this.faerdig;
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest && !this.erSkjult(i)) return i;
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
                this.hjaelpVis("<b>Hint:</b> " + info.hint);
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            info.svar();
            this.visKnap();
            this.fokus();
        };

        /* Et trin er loest: linjen viser det svar, eleven bad om, og siger det
           naeste skridt */
        P.trinLoest = function (maade, svarHTML) {
            this.hjaelp = 0;
            if (maade === "svar") this.brugtSvar = true;
            if (this.opgaveFaerdig()) {
                this.opgaveLoest(maade, maade === "svar" ? svarHTML : null);
            } else {
                if (maade === "svar" && svarHTML) this.svarVis(svarHTML);
                else this.naesteLinje(NK.tilfaeldig(D.ROS), "god");
            }
            this.visKnap();
            this.fokus();
        };

        P.opgaveLoest = function (maade, svarHTML) {
            var s = this.status[this.nr];
            this.faerdig = true;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            var alle = this.antalLoest() === this.antalSynlige();
            var linje = this.slutLinje ? this.slutLinje() : "";
            /* Paa kortet i scenen siger maerket Loest det; her kun rosen for hele fanen */
            var ros = this.scene ? "" : NK.tilfaeldig(D.ROS_OPGAVE);
            if (alle && !this.rostAlt) { this.rostAlt = true; ros = D.FAERDIG[navn]; }
            this.gem();
            this.besked(((svarHTML ? svarHTML + " " : "") + (linje ? linje + " " : "") + ros).trim(), maade === "svar" ? "gul" : "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Linjen i opgavekortet ---------------------------------------------
           besked: den faste linje (naeste skridt, fejl, ros, hint og svar).
           Efter et forkert svar lyser hintknappen stille op, til linjen
           skifter igen. kortBesked: et svar paa et klik i scenen, der
           forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
            this.el.knap.classList.toggle("peg", klasse === "skidt" && !this.faerdig && this.hjaelp === 0);
        };

        P.kortBesked = function (html, sek, klasse) {
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: klasse || "" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            e.className = "besked" + (b.klasse ? " " + b.klasse : "");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        /* Alt, der staar paa kortet lige nu (til selvtesten) */
        P.kortTekst = function () { return this.el.kort ? this.el.kort.textContent.replace(/\s+/g, " ").trim() : ""; };

        P.naesteLinje = function (foer, slags) {
            if (this.scene) {
                this.besked(foer || "", foer ? (slags || "") : "");
                this.visKort();
                return;
            }
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        /* ----- Hint og svar: kun naar eleven beder om det -------------------------
           Begge staar i linjen i opgavekortet, lige over knappen. Efter svaret
           staar naeste skridt i samme linje. */
        P.hjaelpVis = function (html) { this.besked(html, "gul"); };

        P.svarVis = function (html) {
            if (this.scene) { this.besked(html, "gul"); this.visKort(); return; }
            var trin = this.faerdig ? "" : this.trinLinje();
            this.besked(html + (trin ? " " + trin : ""), "gul");
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
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* ----- Musen ------------------------------------------------------------
           Et tryk i scenen gaar til fanen (nedScene). Holder fanen tag i noget (en hane, spatlen), faar den ogsaa
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
