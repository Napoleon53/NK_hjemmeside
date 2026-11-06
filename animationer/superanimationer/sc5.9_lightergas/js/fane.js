/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sc5.11, men uden
   Kemichael ved katederet)

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * papirkortet oeverst midt i scenen: opgaven, gaettet og svarene,
       linjen med naeste skridt, hint, fejl og ros, den gule knap Giv
       hint / Vis svaret og Indsend svar
     * musen i scenen: hold, traek og klik

   Kemichael praesenterer ikke her (brugerens valg 27. sept. 2026).
   Hint og svar staar i linjen paa kortet. Han kommer kun ind paa
   fane 1, naar forsoeget gaar helt galt (laerer.js).

   Papirkortet (brugerens regler 24. okt. og 3.-4. nov. 2026): kortet
   staar oeverst midt i scenen, ikke i panelet. Det er et lyst ark med
   skriften Lexend (../faelles/papirkort.css og .js). Indsend svar
   sender det, eleven har skrevet eller valgt (fanens kanSendes() og
   indsend()); et klik paa et svar eller paa Aflaes vaegten vaelger kun.
   Et gaet er gratis og virker med det samme (fane 1 og 3). Naar opgaven
   er loest, bliver kortet paa opgaven: svarene staar laast med det
   rigtige groent, forklaringen staar under dem (NK.Papir.bliv), og
   knappen videre staar, hvor Indsend svar stod. Start forfra staar i
   panelet, aldrig paa kortet. Pladsen til kortet er kortZone(): det,
   eleven skal se paa, begynder under den.

   Fanen selv har: lavOpgave(nr, nyeTal), promptHTML(), trinInfo()
   ({ hint, svar }), trinLinje(), layout(), tegn(), opdaterScene(dt) og
   musen i scenen: overScene, nedScene, flytScene, opScene (alle med
   punktet i laerredets pixels).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc5.9-" + navn;

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
                forfra: el("forfra"), indsend: el("indsend"), bund: el("bund"), bliv: el("bliv"), ind: el("ind") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            /* Knappen videre paa det loeste kort */
            this.el.kort.addEventListener("click", function (e) {
                var t = e.target.closest ? e.target.closest("[data-videre]") : null;
                if (t) mig.knap();
            });
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

        /* Den hoejde (px fra scenens top), kortet har faaet sat af. Det, eleven
           skal se paa, begynder under den, saa kortet aldrig daekker det.
           Lave skaerme har et mindre kort (papirkort.css). Selvtesten maaler,
           at kortet holder sig inden for pladsen. */
        P.kortZone = function () {
            var lav = window.innerHeight <= 720;
            var z = valg.zone || [196, 176];
            return lav ? z[1] : z[0];
        };

        /* Er eleven ved et gaet (forsoeget er laast imens) */
        P.gaetAktivt = function () { return !!(!this.faerdig && this.gaetNu && this.gaetNu()); };

        /* Kortet blinker blødt: eleven greb ud efter forsoeget, men skal
           foerst goere det, kortet siger */
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
            if (valg.naesteFane) return "Videre til " + valg.naesteNavn + " →";
            return "";
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr], e = this.el.kort;
            var gaet = this.gaetAktivt();
            var chip = gaet && valg.gaetChip ? valg.gaetChip : o.titel;
            var kl = "scenekort" + (this.faerdig ? " loest" + (this.fast.klasse === "gul" ? " svar" : "") : (gaet ? " spm" : " opgave"));
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            /* valg.blivKort: naar opgaven er loest, staar kun forklaringen med
               opgavens navn foran (fane 1, hvor der ikke er et spoergsmaal at blive paa) */
            var tekst = this.faerdig && valg.blivKort ? "" : '<p class="sk-tekst"><span class="sk-chip">' + NK.html(chip) + "</span>" +
                this.papirTekst(this.promptHTML()) + "</p>";
            this.el.ind.innerHTML = tekst + '<div class="sk-svar" id="' + navn + '-valg" hidden></div>';
            this.el.valg = el("valg");
            if (this.el.nye) this.el.nye.hidden = !(this.harNyeTal && this.harNyeTal());
            if (this.el.forfra) this.el.forfra.hidden = !(this.harForfra && this.harForfra());
            if (this.visKortEkstra) this.visKortEkstra();
            this.visBliv();
            this.visKnap();
        };

        /* Loest: raekken med linjen og knapperne er vaek, og forklaringen staar
           i en groen boks (gul, naar svaret blev vist) med knappen videre */
        P.visBliv = function () {
            var b = this.el.bliv;
            this.el.bund.hidden = !!this.faerdig;
            if (!this.faerdig) { if (b.innerHTML) b.innerHTML = ""; return; }
            var vist = this.fast.klasse === "gul", knap = this.videreTekst();
            var maerke = valg.blivKort ? NK.html(this.opgaver[this.nr].titel) : null;
            var html = NK.Papir.bliv(this.fast.html, maerke, NK.html(knap || "x"), vist);
            if (!knap) html = html.replace(/<button[^>]*data-videre[^>]*>[\s\S]*?<\/button>/, "");
            b.innerHTML = html;
        };

        P.visKnap = function () {
            var k = this.el.knap;
            k.textContent = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            k.className = "knap hjaelp" + (this.hjaelp > 0 ? " svar" : "") + (this.pegKnap ? " peg" : "");
            k.disabled = !!this.auto;
            k.hidden = !!this.faerdig || !this.trinInfo();
            this.visIndsend();
        };

        /* Indsend svar: graa, til der er noget at sende. Under et gaet er
           knappen vaek, for et gaet virker med det samme. */
        P.visIndsend = function () {
            var e = this.el.indsend;
            var har = !!this.indsend && !this.faerdig && !this.gaetAktivt();
            e.hidden = !har;
            if (!har) return;
            var kan = !this.auto && !!(this.kanSendes && this.kanSendes());
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        P.indsendKlik = function () {
            if (this.faerdig || this.auto || !this.indsend) return;
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

        /* Et trin er loest: linjen siger det naeste skridt (eller viser det
           svar, eleven bad om) */
        P.trinLoest = function (maade, svarHTML) {
            this.hjaelp = 0;
            if (maade === "svar") this.brugtSvar = true;
            if (this.opgaveFaerdig()) {
                this.opgaveLoest(maade, maade === "svar" ? svarHTML : "");
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
            /* Paa kortet siger forklaringen det; rosen kun for hele fanen */
            var ros = "";
            if (alle && !this.rostAlt) { this.rostAlt = true; ros = D.FAERDIG[navn]; }
            this.gem();
            this.besked(((svarHTML ? svarHTML + " " : "") + (linje ? linje + " " : "") + ros).trim(), maade === "svar" ? "gul" : "god");
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
            /* Efter et forkert svar lyser den gule knap stille op, til linjen skifter */
            this.pegKnap = klasse === "skidt" && !this.faerdig && this.hjaelp === 0;
            this.el.knap.classList.toggle("peg", this.pegKnap);
            this.visBesked(this.fast);
            if (this.faerdig) this.visBliv();
        };

        /* Paa det loeste kort er der ingen linje, saa et klik i scenen faar intet svar */
        P.kortBesked = function (html, sek) {
            if (this.faerdig) return;
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: "" });
        };

        /* Linjen er en blød boks: groen (ros), roed (fejl), gul (hint og svar)
           eller graa (naeste skridt) */
        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            var kl = b.html ? (b.klasse || "peger") : "tom";
            this.el.bund.className = "sk-bund " + kl;
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        /* Hint og svar staar i linjen */
        P.hjaelpVis = function (html) { this.besked(html, "gul"); };

        P.svarVis = function (html) {
            var trin = this.faerdig ? "" : this.trinLinje();
            this.besked(html + (trin ? " " + trin : ""), "gul");
        };

        /* K: linjen siger, hvor man er, og hvad man skal */
        P.startIntro = function (tving) {
            if (!tving) return;
            this.naesteLinje(D.INTRO[navn], "");
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
            else if (this.indsend && this.kanSendes && this.kanSendes()) this.indsendKlik();
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
           Holder fanen tag i noget (lighteren, haetten, pinden), faar den
           ogsaa flytningerne og slippet, ogsaa uden for laerredet. */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            this.greb = false;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.greb && mig.flytScene) { mig.flytScene(pt); return; }
                var u = mig.overScene ? mig.overScene(pt) : null;
                c.style.cursor = u ? (u === "greb" ? "grab" : "pointer") : "default";
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
