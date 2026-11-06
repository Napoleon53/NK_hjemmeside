/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sc5.11 og sc5.5)

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * scenekortet oeverst midt i scenen (papirkortet, brugerens valg 3.
       og 4. nov. 2026): opgaven, gaettet, spoergsmaalet med svarene,
       linjen med hint, fejl og forklaringen, den gule hintknap og
       Indsend svar. Panelet har kun tal, skemaer og opgavelisten.
       Kortets tekst gaar gennem papirTekst().
     * knappen i kortets nederste raekke: Giv hint, Vis svaret, og naar
       opgaven er loest, den groenne knap videre dér, hvor Indsend svar
       stod. Kortet bliver paa opgaven: svaret, eleven valgte, bliver
       groent, og forklaringen staar i linjen. Efter den sidste opgave er
       der ingen knap; Start forfra og Koer igen staar i scenens hjoerne
       (brugeren 3. nov. 2026).
     * Indsend svar: et svarvalg og et felt i panelet bedoemmer aldrig af
       sig selv (brugeren 24. okt. 2026). Knappen er graa, til der er noget
       at sende. Fanen har harIndsend(), kanIndsende(), indsend() og evt.
       indsendTekst(). Enter i et felt er det samme som Indsend svar.
     * et gaet foer forsoeget (fanens gaetNu()) er gratis og virker med det
       samme; et klik paa forsoeget foer gaettet faar kortet til at blinke
       (gaetBlink). Pladsen til kortet er sat af oeverst i scenen
       (kortZone()); det, eleven skal se, begynder under den.
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
        var NOEGLE = "nk-sc5.7-" + navn;

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
                forfra: el("forfra"), indsend: el("indsend") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            if (this.el.indsend) this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
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

        /* ----- Opgavelisten ------------------------------------------------------
           Fane 1 har ingen liste: den har kun én opgave, og et klik paa den
           startede forfra (brugerens oenske 29. sept. 2026: fjernet). */
        P.bygListe = function () {
            var mig = this;
            if (!this.el.liste) return;
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
            if (!this.el.liste) return;
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
            this.sidsteMaade = "";
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

        /* Kortets hovedtekst (allerede HTML): paa papirkortet bliver et
           spoergsmaal halvfedt, og ord med bindestreg deles ikke */
        P.papirTekst = function (html) { return NK.Papir ? NK.Papir.tekst(html) : html; };

        /* Er eleven ved et gaet, foer forsoeget begynder */
        P.gaetAktivt = function () { return !!(!this.faerdig && this.gaetNu && this.gaetNu()); };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen. Det, eleven
           skal se paa, begynder under den, saa kortet aldrig daekker det, og
           intet flytter sig, naar kortet skifter. Lave skaerme har et mindre
           kort (se stilarket). Selvtesten maaler kortet. */
        P.kortZone = function () {
            var lav = window.innerHeight <= 720;
            if (valg.zone) return lav ? valg.zone[1] : valg.zone[0];
            return lav ? 170 : 196;
        };

        P.top = function () { return this.kortZone() + 10; };

        /* Kortet blinker: eleven greb ud efter forsoeget, men skal foerst goere
           det, kortet siger (gaette, svare eller trykke paa knappen videre) */
        P.kortBlink = function () {
            var e = this.el.kort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Eleven klikkede paa forsoeget, foer der var gaettet */
        P.gaetBlink = function () { this.kortBlink(); };

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            var gaet = this.gaetAktivt();
            var chip = this.chipTekst ? this.chipTekst() : o.titel;
            if (gaet) chip = "Gæt først";
            else if (this.faerdig) chip = this.brugtSvar ? "Svaret" : "Løst ✓";
            NK.saetTekst(navn + "-titel", chip);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", this.promptHTML());
            var e = this.el.kort;
            e.classList.toggle("sejr", this.faerdig);
            e.classList.toggle("gaet", gaet);
            e.classList.toggle("svar", this.faerdig && !!this.brugtSvar);
            if (!gaet && !this.faerdig) e.classList.remove("blink");
            if (this.el.nye) this.el.nye.hidden = !(this.harNyeTal && this.harNyeTal());
            if (this.el.forfra) this.el.forfra.hidden = !(this.harForfra && this.harForfra());
            if (this.visKortEkstra) this.visKortEkstra();
            this.visKnap();
        };

        /* Svarknapperne paa kortet (spoergsmaal, der bedoemmes): de vaelger
           kun, Indsend svar sender ind. svar: [{ t, ok, forkert }], valgt: j.
           Naar opgaven er loest, bliver det rigtige svar groent dér, hvor
           eleven klikkede, et forkert svar roedt, og resten tones ned. */
        P.svarKnapper = function (e, svar, valgtJ, vaelg) {
            var mig = this;
            e.innerHTML = "";
            e.hidden = false;
            e.className = "sk-valg sk-svar n" + svar.length;
            svar.forEach(function (sv, j) {
                var b = document.createElement("button");
                b.type = "button";
                var kl = "sk-knap";
                /* Groent, naar eleven selv valgte det rigtige svar her (ogsaa
                   efter en fejl tidligere i opgaven); gult, naar svaret blev vist */
                if (mig.faerdig) kl += sv.ok ? (j === valgtJ && mig.sidsteMaade !== "svar" ? " rigtig" : " svar-vist") : (sv.forkert ? " forkert" : " dim");
                else if (sv.forkert) kl += " forkert";
                else if (j === valgtJ) kl += " valgt";
                b.className = kl;
                b.disabled = !!(mig.faerdig || sv.forkert || mig.auto);
                b.innerHTML = '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span><span>" + NK.html(sv.t) + "</span>";
                b.addEventListener("click", function () {
                    if (mig.faerdig || mig.auto) return;
                    vaelg(j);
                    mig.nulstilHjaelp();
                    if (mig.fast.klasse === "skidt" || mig.fast.klasse === "gul") mig.naesteLinje("", "");
                    mig.visKort();
                });
                e.appendChild(b);
            });
        };

        /* Gaettets svar: de virker med det samme, for et gaet er gratis */
        P.gaetKnapper = function (e, svar, vaelg) {
            e.innerHTML = "";
            e.hidden = false;
            e.className = "sk-valg";
            svar.forEach(function (sv, j) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "gk-knap";
                b.innerHTML = '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span><span>" + NK.html(sv.t) + "</span>";
                b.addEventListener("click", function () { vaelg(j); });
                e.appendChild(b);
            });
        };

        /* Paa kortet er der intet at gaa videre til, naar alt paa den sidste
           fane er loest: saa er knappen vaek, for Start forfra staar aldrig,
           hvor Naeste staar (brugeren 3. nov. 2026). */
        P.intetVidere = function () {
            return this.faerdig && this.naesteUloeste() < 0 && !valg.naesteFane;
        };

        P.visKnap = function () {
            var tekst, klasse = "knap hjaelp";
            if (this.faerdig) {
                klasse = "knap blaa";
                var naeste = this.naesteUloeste();
                if (naeste >= 0) tekst = valg.naesteTekst || "Næste opgave →";
                else if (valg.naesteFane) tekst = "Videre til " + valg.naesteNavn + " →";
                else tekst = "";
            } else {
                tekst = this.hjaelp === 0 ? "Giv et hint" : "Vis svaret";
                if (this.hjaelp > 0) klasse += " svar";
                if (this.pegKnap && this.hjaelp === 0) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
            /* Paa kortet er knappen vaek, mens forsoeget koerer af sig selv, og under et gaet */
            this.el.knap.hidden = (!!this.auto && !this.faerdig) || this.intetVidere() || this.gaetAktivt();
            this.visIndsend();
        };

        /* ----- Indsend svar ------------------------------------------------------ */
        P.harIndsendNu = function () {
            return !this.faerdig && !this.auto && !this.gaetAktivt() && !!(this.harIndsend && this.harIndsend());
        };

        P.kanSendes = function () {
            return this.harIndsendNu() && !!(this.kanIndsende && this.kanIndsende());
        };

        P.visIndsend = function () {
            var e = this.el.indsend;
            if (!e) return;
            var vis = this.harIndsendNu();
            if (e.hidden !== !vis) e.hidden = !vis;
            if (!vis) return;
            var kan = this.kanSendes();
            var t = (this.indsendTekst && this.indsendTekst()) || "Indsend svar";
            if (e.textContent !== t) e.textContent = t;
            if (e.classList.contains("klar") !== kan || e.classList.contains("ikke-klar") === kan) {
                e.classList.toggle("klar", kan);
                e.classList.toggle("ikke-klar", !kan);
                e.setAttribute("aria-disabled", kan ? "false" : "true");
            }
        };

        P.indsendKlik = function () {
            if (!this.harIndsendNu()) return;
            if (!this.kanSendes()) { this.kortBlink(); return; }
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
                return;
            }
            var info = this.trinInfo();
            if (!info) return;
            this.pegKnap = false;
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

        /* Eleven har gjort noget nyt: hinttrappen begynder forfra */
        P.nulstilHjaelp = function () {
            if (this.hjaelp === 0) return;
            this.hjaelp = 0;
            this.visKnap();
        };

        /* Et trin er loest: linjen viser det svar, eleven bad om, og siger det
           naeste skridt */
        P.trinLoest = function (maade, svarHTML) {
            this.hjaelp = 0;
            this.sidsteMaade = maade;
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
            var alle = this.antalLoest() === this.opgaver.length;
            var linje = this.slutLinje ? this.slutLinje() : "";
            /* Paa kortet siger maerket Loest det; her kun rosen for hele fanen */
            var ros = "";
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
            this.pegKnap = klasse === "skidt" && !this.faerdig && this.hjaelp === 0;
            this.el.knap.classList.toggle("peg", this.pegKnap);
        };

        P.kortBesked = function (html, sek) {
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: "" });
        };

        /* En ny linje med ros blinker groent, ogsaa naar linjen foer var groen */
        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            if (b.klasse === "god" && e.innerHTML !== b.html) { e.className = "besked"; void e.offsetWidth; }
            e.innerHTML = b.html;
            e.className = "besked" + (b.klasse ? " " + b.klasse : "");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        /* Alt, der staar paa kortet lige nu (til selvtesten) */
        P.kortTekst = function () { return this.el.kort ? this.el.kort.textContent.replace(/\s+/g, " ").trim() : ""; };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        /* ----- Hint og svar: kun naar eleven beder om det -------------------------
           Begge staar i linjen i opgavekortet, lige over knappen. Efter svaret
           staar naeste skridt i samme linje. */
        P.hjaelpVis = function (html) { this.besked(html, "gul"); };

        P.svarVis = function (html) {
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

        /* Enter: send svaret ind, eller gaa videre, naar opgaven er loest */
        P.enter = function () {
            if (this.faerdig) { if (!this.intetVidere()) this.knap(); }
            else this.indsendKlik();
        };
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
            /* Indsend svar foelger feltet og valget (graa, til der er noget at sende) */
            this.visIndsend();
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
