/* =====================================================================
   fane.js - det, de to faner har til faelles

   Der er ingen laerer i denne animation (som sc1.4_afstemning og
   sc_spil9_kemikort). Al hjaelp staar i statuslinjen nederst i scenen,
   lige under kolben og tavlen, og hjaelpeknappen sidder i samme linje.

   NK.Fane.paa(P, navn) laegger de faelles metoder paa fanens prototype:

     * statuslinjen: naeste skridt, fejl, hint og ros, med farve efter
       hvad der skete, og et ryst ved en fejl
     * den ene knap: Giv et hint > Naeste hint > Vis svaret > Naeste ordre.
       Den lyser stille op, naar eleven lige har lavet noget forkert.
     * hintTekster(maal): trappen paa tre trin til et stof, ud fra den
       vej, NK.Kemi.rute finder (syre og alkohol, og om syren skal laves
       ved oxidation)

   Fanen selv har: maalNu(), trinLinje(), visSvar(), knapVidere(),
   faerdigNu().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;

    /* Hinttrappen til et stof. koeb: fanen med penge (stofferne skal koebes) */
    function hintTekster(maalNavn, harStof, koeb) {
        var r = K.rute(maalNavn);
        var maal = K.stofEfterNavn(maalNavn);
        var vis = maal ? maal.navn : maalNavn;
        var lg = koeb ? "Køb " : "Læg ";
        var lgEfter = koeb ? " (+ på kortene), og læg dem i kolben." : " i kolben.";
        if (!r) return { trin: ["Prøv dig frem med to stoffer."], svar: null };
        if (r.type === "ox") {
            if (r.keton) {
                return {
                    trin: [
                        cap(vis) + " er en keton. En keton laves ved at oxidere en alkohol.",
                        "I " + vis + " sidder O på det midterste C. Så skal alkoholens OH også sidde der: " + r.alk.navn + ".",
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
                    cap(syreDel) + " kommer fra " + syreNavn + ". Den står ikke på hylden, men den kan laves ved at oxidere en alkohol med lige så mange C.",
                    lg + r.syreFra.navn + " og kaliumpermanganat" + lgEfter + " Tænd for varmen, og tryk Start. Brug så " + syreNavn + " og " + r.alk.navn + " til esteren."
                ],
                svar: [r.syreFra.id, "permanganat"], hplus: false, varme: true, foerst: true
            };
        }
        return {
            trin: [
                "En ester laves af en carboxylsyre og en alkohol. Navnet har to dele: …yl kommer fra alkoholen, og …oat kommer fra syren.",
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
            this.el.knap = el("knap");
            this.el.besked = el("besked");
            this.el.status = el("status");
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
        };

        /* ----- Knappen: ét skridt hjaelp ad gangen --------------------------- */
        P.hintNu = function () {
            var maal = this.maalNu();
            if (!maal) return { trin: [], svar: null };
            var mig = this;
            return hintTekster(maal, function (id) { return mig.antal(id) > 0; }, !!this.koeb);
        };

        P.visKnap = function () {
            var tekst, klasse;
            if (this.faerdigNu()) {
                klasse = "knap videre banker";
                tekst = this.knapVidere();
            } else {
                var h = this.hintNu();
                klasse = "knap hjaelp";
                if (this.svarVist) tekst = "Svaret er vist";
                else if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.trin.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.trin.length + ")";
                else tekst = "Vis svaret";
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!(this.svarVist && !this.faerdigNu()) || !!(this.R && this.R.auto);
        };

        P.knap = function () {
            if (this.R && this.R.auto) return;
            if (this.faerdigNu()) { this.videre(); return; }
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

        /* ----- Statuslinjen ---------------------------------------------------- */
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
            this.el.status.className = "statuslinje" + (b.klasse ? " " + b.klasse : "");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        P.naesteLinje = function () {
            this.besked(this.trinLinje(), "");
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
            if (this.R.iKolben) return "Blandingen står i kolben. Ret det, der mangler, og tryk Start igen.";
            if (n === 0) return foerste ? "Klik på et stof på hylden, eller træk det op i kolben." : "Find de to stoffer, og læg dem i kolben.";
            if (n === 1) return "Læg et stof mere i kolben.";
            if (foerste && !(this.R.bet.hplus && this.R.bet.varme)) return "Tænd for svovlsyre og varme under kolben, og tryk Start.";
            return "Tryk Start.";
        };
    }

    NK.Fane = { paa: paa, hintTekster: hintTekster };
}());
