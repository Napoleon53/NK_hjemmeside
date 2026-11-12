/* =====================================================================
   fane.js - papirkortet og hinttrappen

   Der er ingen laerer i denne animation (som sc1.4_afstemning og
   sc_spil9_kemikort). Al tekst staar paa ét lyst papirkort oeverst i
   midten af scenen (papirkortet, 4. nov. 2026; foer stod ordren over
   kolben og beskederne i en statuslinje nederst).

   NK.Fane.paa(P, navn) laegger metoderne paa spillets prototype:

     * kortet: ordren og naeste skridt, og i nederste raekke fejl, hint
       og ros med farve efter hvad der skete, og et ryst ved en fejl.
       Efter en levering bliver kortet paa den leverede ordre med
       forklaringen og knappen Naeste ordre (blivPaa, naesteOrdre), og
       reaktoren er laast, til eleven trykker videre (spaer).
     * den stille hintknap: Giv et hint > Naeste hint > Vis svaret.
       Den lyser stille op, naar eleven lige har lavet noget forkert.
     * hintTekster(maal): trappen paa tre trin til et stof, ud fra den
       vej, NK.Kemi.rute finder (syre og alkohol, og om syren skal laves
       ved oxidation)

   Spillet selv har: maalNu(), ordreHTML(), trinLinje() og visSvar().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;

    /* Hinttrappen til et stof */
    function hintTekster(maalNavn, harStof) {
        var r = K.rute(maalNavn);
        var maal = K.stofEfterNavn(maalNavn);
        var vis = maal ? maal.navn : maalNavn;
        var lg = "Køb ";
        var lgEfter = " i butikken, og læg dem i kolben.";
        if (!r) return { trin: ["Prøv dig frem med to stoffer."], svar: null };
        if (r.type === "ox") {
            if (r.keton) {
                return {
                    trin: [
                        cap(vis) + " er en keton. En keton laves ved at oxidere en alkohol.",
                        "I " + vis + " sidder O på det midterste C. Derfor skal alkoholens OH også sidde der: " + r.alk.navn + ".",
                        lg + r.alk.navn + " og kaliumpermanganat" + lgEfter + " Tænd for varmen, og tryk Start."
                    ],
                    svar: [r.alk.id, "permanganat"], hplus: false, varme: true
                };
            }
            return {
                trin: [
                    cap(vis) + " er en carboxylsyre. Den laves ved at oxidere en primær alkohol.",
                    "Alkoholen skal have lige så mange C som syren: " + r.alk.navn + ".",
                    lg + r.alk.navn + " og kaliumpermanganat" + lgEfter + " Tænd for varmen, og tryk Start."
                ],
                svar: [r.alk.id, "permanganat"], hplus: false, varme: true
            };
        }
        var syreNavn = r.syre.navn;
        var syreFuld = r.syre.motornavn !== r.syre.navn ? r.syre.motornavn + " (" + r.syre.navn + ")" : r.syre.navn;
        if (r.phenol) {
            return {
                trin: [
                    cap(maal && maal.trivial ? maal.trivial : vis) + " er en ester. Salicylsyren har både en COOH-gruppe og en OH-gruppe på ringen.",
                    "Her er det ringens OH, der reagerer ligesom en alkohol. Acetyl kommer fra " + syreNavn + ".",
                    lg + r.alk.navn + " og " + syreNavn + lgEfter + " Tænd for svovlsyre og varme, og tryk Start."
                ],
                svar: [r.alk.id, r.syre.id], hplus: true, varme: true
            };
        }
        var dele = maal ? K.navneDele(maal, r.syre) : null;
        var alkDel = dele && dele[0] ? dele[0].t.replace(/-$/, "") : "";
        var syreDel = dele && dele[1] ? dele[1].t : "";
        var syreMangler = !r.syre.hylde && !harStof(r.syre.id);
        if (syreMangler && r.syreFra) {
            return {
                trin: [
                    "En ester laves af en carboxylsyre og en alkohol. " + cap(alkDel) + " kommer fra alkoholen, og " + syreDel + " kommer fra syren.",
                    cap(syreDel) + " kommer fra " + syreNavn + ". Butikken har den ikke, men den kan laves ved at oxidere en alkohol med lige så mange C.",
                    lg + r.syreFra.navn + " og kaliumpermanganat" + lgEfter + " Tænd for varmen, og tryk Start. Brug så " + syreNavn + " og " + r.alk.navn + " til esteren."
                ],
                svar: [r.syreFra.id, "permanganat"], hplus: false, varme: true, foerst: true
            };
        }
        return {
            trin: [
                "En ester laves af en carboxylsyre og en alkohol. Navnet har to dele, hvor …yl kommer fra alkoholen, og …oat kommer fra syren.",
                cap(alkDel) + " kommer fra " + r.alk.navn + ", og " + syreDel + " kommer fra " + syreFuld + ".",
                lg + r.alk.navn + " og " + syreNavn + lgEfter + " Tænd for svovlsyre og varme, og tryk Start."
            ],
            svar: [r.alk.id, r.syre.id], hplus: true, varme: true
        };
    }

    function cap(s) { return K.cap(s); }

    function paa(P, navn) {
        function el(id) { return NK.el(navn + "-" + id); }

        P.startStatus = function () {
            var mig = this;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.svarVist = false;
            this.el = this.el || {};
            this.el.skort = el("skort");
            this.el.opgave = el("opgave");
            this.el.knap = el("knap");
            this.el.besked = el("besked");
            this.el.status = el("status");
            this.el.bliv = el("bliv");
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.bliv = null;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.skort.addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest("[data-videre]")) mig.naesteOrdre();
            });
        };

        /* ----- Knappen: ét skridt hjaelp ad gangen --------------------------- */
        P.hintNu = function () {
            var maal = this.maalNu();
            if (!maal) return { trin: [], svar: null };
            var mig = this;
            return hintTekster(maal, function (id) { return mig.antal(id) > 0; });
        };

        P.visKnap = function () {
            var h = this.hintNu(), tekst, klasse = "knap hjaelp";
            if (this.svarVist) tekst = "Svaret er vist";
            else if (this.hjaelp === 0) tekst = "Giv et hint";
            else if (this.hjaelp < h.trin.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.trin.length + ")";
            else tekst = "Vis svaret";
            if (this.pegKnap) klasse += " peg";
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = this.svarVist || !!(this.R && this.R.auto);
        };

        P.knap = function () {
            if (this.R && this.R.auto) return;
            if (this.bliv) { this.naesteOrdre(); return; }
            var h = this.hintNu();
            this.pegKnap = false;
            if (this.hjaelp < h.trin.length) {
                this.hjaelp++;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.trin.length + "</span> " +
                    NK.html(h.trin[this.hjaelp - 1]), "hint");
                this.visKnap();
                return;
            }
            this.brugtSvar = true;
            this.svarVist = true;
            this.visSvar(h);
            this.visKnap();
        };

        P.nulstilHjaelp = function () {
            this.hjaelp = 0;
            this.svarVist = false;
            this.pegKnap = false;
        };

        /* ----- Kortet ------------------------------------------------------------
           Kortet viser den valgte ordre og naeste skridt. Beskeden (hint, fejl,
           ros og svaret paa et klik) staar i kortets nederste raekke ved
           hintknappen. Efter en levering bliver kortet paa den leverede ordre
           (papirkortet, brugerens valg 3. nov. 2026): forklaringen staar i en
           groen boks, og knappen Naeste ordre staar, hvor hintknappen stod. Saa
           staar rosen aldrig under den naeste ordre. */
        P.visOpgave = function () {
            var html;
            if (this.bliv) html = '<span class="sk-chip">Ordre</span>' + this.bliv.ordre;
            else {
                var o = this.ordreHTML ? this.ordreHTML() : "";
                html = '<span class="sk-chip">Ordre</span>' + o + (this.trinLinje ? ' <span class="sk-trin">' + NK.html(this.trinLinje()) + "</span>" : "");
            }
            this.el.opgave.innerHTML = html;
            this.el.status.hidden = !!this.bliv;
            this.el.bliv.hidden = !this.bliv;
            this.el.bliv.innerHTML = this.bliv ? NK.Papir.bliv(this.bliv.tekst, "Leveret", "Næste ordre →", false) : "";
            this.el.skort.classList.toggle("loest", !!this.bliv);
        };

        /* Kortet bliver paa ordren, eleven lige har leveret */
        P.blivPaa = function (ordreHtml, tekstHtml) {
            this.bliv = { ordre: ordreHtml, tekst: tekstHtml };
            this.kortT = 0;
            this.fast = { html: "", klasse: "" };
            this.visBesked(this.fast);
            this.visOpgave();
        };

        /* Naeste ordre: kortet viser den ordre, der nu er valgt */
        P.naesteOrdre = function () {
            if (!this.bliv) return;
            this.bliv = null;
            this.naesteLinje();
            this.visKnap();
        };

        /* Kortet blinker: eleven greb ud efter reaktoren, men skal foerst
           trykke Naeste ordre (saa blinker den groenne knap) */
        P.kortBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Laasen: mens kortet bliver paa en leveret ordre, saetter et klik paa
           reaktoren eller lageret intet i gang. Kortet blinker i stedet. */
        P.spaer = function () {
            if (!this.bliv) return false;
            this.kortBlink();
            return true;
        };

        P.besked = function (html, klasse) {
            if (klasse === "kort") { this.kortBesked(html, 4); return; }
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        /* Et svar paa et klik, der forsvinder igen efter sek sekunder */
        P.kortBesked = function (tekst, sek) {
            this.kortT = sek || 4;
            this.visBesked({ html: NK.html(tekst), klasse: "peger" });
        };

        P.visBesked = function (b) {
            if (!this.el.besked) return;
            this.el.besked.innerHTML = b.html;
            this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "");
            /* Skridtet foelger med, saa det altid passer til kolben */
            if (this.el.opgave && this.R) this.visOpgave();
        };

        /* Teksten paa kortet: ordren, skridtet og beskeden (eller forklaringen) */
        P.beskedTekst = function () {
            if (!this.el.opgave) return "";
            var bund = this.bliv ? this.el.bliv.querySelector(".st-tekst") : this.el.besked;
            return this.el.opgave.textContent + " " + (bund ? bund.textContent : "");
        };

        /* Naeste skridt staar paa kortet efter ordren; beskeden toemmes */
        P.naesteLinje = function () {
            this.besked("", "");
            this.visOpgave();
        };

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

        P.opdaterStatus = function (dt) {
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
        };

        /* Den naeste linje, naar pladserne er tomme, et stof eller to */
        P.standardTrin = function (foerste) {
            var p = this.R.plads, n = (p[0] ? 1 : 0) + (p[1] ? 1 : 0);
            if (this.R.auto) return "";
            if (this.R.iKolben) return "Blandingen står i kolben. Ret det, der mangler, og tryk Start igen.";
            if (n === 0) return "Find de to stoffer, og læg dem i kolben.";
            if (n === 1) return "Læg et stof mere i kolben.";
            if (foerste && !(this.R.bet.hplus && this.R.bet.varme)) return "Tænd for svovlsyre og varme, og tryk Start.";
            return "Tryk Start.";
        };
    }

    NK.Fane = { paa: paa, hintTekster: hintTekster };
}());
