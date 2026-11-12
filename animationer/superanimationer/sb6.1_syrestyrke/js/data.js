/* =====================================================================
   data.js - syrerne, trinnene, teksterne og tallene

   Alt, der kan staa som data, staar her. Ordene og tallene er Kemibogens
   (afsnit B6.3 Syrestyrke): syrestyrkekonstanten Kₛ = [B] · [H₃O⁺] / [S],
   pKₛ = −log Kₛ, inddelingen stærk (under 0), middelstærk (0 til 4), svag
   (4 til 10) og meget svag (over 10), formel og aktuel koncentration,
   omdannelsesgraden og vejen fra en maalt pH til Kₛ. Syrernes navne,
   formler, Kₛ og pKₛ er bogens tabel.

   Formler skrives som "CH_3COO^-": _ saenker et tal, ^ haever en ladning
   (^2- er 2−), og {} samler en laengere del: 10^{-4,76}. D.u giver samme
   formel med unicode (CH₃COO⁻) til tekst paa kortet, og D.sub laver
   unicode og ^{...} om til <sub> og <sup>.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Farverne ------------------------------------------------------------ */
    D.FARVE = {
        blaek: "#14201f",
        daempet: "#556766",
        par1: "#1f6fb2",       /* syren og dens korresponderende base (som den gamle b3.1 og c7.1) */
        par2: "#7d3c98",       /* vand og oxoniumionen */
        hydron: "#b45309",
        gul: "#d69e0c",
        groen: "#2f9a5f",
        roed: "#c0392b"
    };

    /* ----- Bogens inddeling (figuren b6-pks-skala) -------------------------------- */
    D.ZONER = [
        { navn: "stærk", titel: "stærke syrer", til: 0, farve: "#f4b9ae" },
        { navn: "middelstærk", titel: "middelstærke", til: 4, farve: "#f9d6ad" },
        { navn: "svag", titel: "svage", til: 10, farve: "#fbeaa6" },
        { navn: "meget svag", titel: "meget svage", til: Infinity, farve: "#d9e5ea" }
    ];
    D.SKALA_MIN = -8;
    D.SKALA_MAX = 14;

    D.zone = function (pks) {
        for (var i = 0; i < D.ZONER.length; i++) if (pks < D.ZONER[i].til) return i;
        return D.ZONER.length - 1;
    };

    /* =====================================================================
       Syrerne: bogens tabel i afsnit B6.3. q er syrens ladning. ks er
       tabellens Kₛ (to betydende cifre). form er partiklens form i luppen.
       fejl er de forkerte bud i fane 2, trin 1: hvert er en typisk fejl,
       som FEJLTEKST svarer paa.
       ===================================================================== */
    D.SYRER = {
        hcl: { id: "hcl", navn: "saltsyre", syre: "HCl", base: "Cl^-", q: 0, pks: -7, ks: 1e7, form: "kugle",
               fejl: [["Cl", "ladning"], ["H_2Cl^+", "optag"], ["OH^-", "oh"]] },
        hno3: { id: "hno3", navn: "salpetersyre", syre: "HNO_3", base: "NO_3^-", q: 0, pks: -1.4, ks: 25, form: "trekant",
                fejl: [["NO_3", "ladning"], ["H_2NO_3^+", "optag"], ["OH^-", "oh"]] },
        h3po4: { id: "h3po4", navn: "phosphorsyre", syre: "H_3PO_4", base: "H_2PO_4^-", q: 0, pks: 2.15, ks: 7.1e-3, form: "stor",
                 fejl: [["H_2PO_4", "ladning"], ["PO_4^3-", "flere"], ["H_4PO_4^+", "optag"]] },
        hf: { id: "hf", navn: "hydrogenfluorid", syre: "HF", base: "F^-", q: 0, pks: 3.17, ks: 6.8e-4, form: "kugle",
              fejl: [["F", "ladning"], ["H_2F^+", "optag"], ["OH^-", "oh"]] },
        hcooh: { id: "hcooh", navn: "methansyre", syre: "HCOOH", base: "HCOO^-", q: 0, pks: 3.75, ks: 1.8e-4, form: "kort",
                 fejl: [["HCOO", "ladning"], ["HCOOH_2^+", "optag"], ["OH^-", "oh"]] },
        maelk: { id: "maelk", navn: "mælkesyre", syre: "C_3H_6O_3", base: "C_3H_5O_3^-", q: 0, pks: 3.86, ks: 1.4e-4, form: "pille",
                 fejl: [["C_3H_5O_3", "ladning"], ["C_3H_7O_3^+", "optag"], ["C_3H_4O_3^2-", "flere"]] },
        ascorbin: { id: "ascorbin", navn: "ascorbinsyre", syre: "C_6H_8O_6", base: "C_6H_7O_6^-", q: 0, pks: 4.17, ks: 6.8e-5, form: "lang",
                    fejl: [["C_6H_7O_6", "ladning"], ["C_6H_9O_6^+", "optag"], ["OH^-", "oh"]] },
        eddike: { id: "eddike", navn: "ethansyre", syre: "CH_3COOH", base: "CH_3COO^-", q: 0, pks: 4.76, ks: 1.7e-5, form: "pille",
                  fejl: [["CH_3COO", "ladning"], ["CH_3COOH_2^+", "optag"], ["OH^-", "oh"]] },
        kulsyre: { id: "kulsyre", navn: "kulsyre", syre: "H_2CO_3", base: "HCO_3^-", q: 0, pks: 6.35, ks: 4.5e-7, form: "trekant",
                   fejl: [["HCO_3", "ladning"], ["CO_3^2-", "flere"], ["H_3CO_3^+", "optag"]] },
        nh4: { id: "nh4", navn: "ammonium", syre: "NH_4^+", base: "NH_3", q: 1, pks: 9.25, ks: 5.6e-10, form: "kugle",
               fejl: [["NH_3^-", "ladning"], ["NH_4", "brint"], ["NH_5^2+", "optag"]] },
        hco3: { id: "hco3", navn: "hydrogencarbonat", syre: "HCO_3^-", base: "CO_3^2-", q: -1, pks: 10.33, ks: 4.7e-11, form: "trekant",
                fejl: [["CO_3^-", "ladning"], ["H_2CO_3", "optag"], ["HCO_3", "brint"]] }
    };
    /* Raekkefoelgen i bogens tabel */
    D.TABEL = ["hcl", "hno3", "h3po4", "hf", "hcooh", "maelk", "ascorbin", "eddike", "kulsyre", "nh4", "hco3"];

    D.Navn = function (id) { var n = D.SYRER[id].navn; return n.charAt(0).toUpperCase() + n.slice(1); };

    /* =====================================================================
       Fane 1: Syreskalaen. Fem flasker med Kₛ paa etiketten; eleven
       traekker hver flaske op paa pKₛ-skalaen. Luppen viser 100 af syrens
       partikler i 0,10 M ved markoerens Kₛ. Til sidst et spoergsmaal om
       faktoren 10.
       ===================================================================== */
    D.LUP_C = 0.10;
    D.LUP_N = 100;
    D.SKALA_TOL = 0.3;          /* saa taet paa tabellens pKₛ skal flasken staa */
    D.SKALA_SKRIDT = 0.1;
    D.SKALA = [
        { id: "eddike", forkl: "Ethansyre har pKₛ = 4,76 og er en svag syre. I luppen har kun 1 af 100 molekyler afgivet sin hydron til vand." },
        { id: "hcl", forkl: "Saltsyre har pKₛ = −7 og er en stærk syre. I luppen har alle 100 molekyler afgivet deres hydron til vand." },
        { id: "hcooh", forkl: "Methansyre har pKₛ = 3,75 og er en middelstærk syre. I luppen har 4 af 100 molekyler afgivet deres hydron." },
        { id: "nh4", forkl: "Ammonium har pKₛ = 9,25 og er en svag syre. Under 0,01 af 100 ammoniumioner har afgivet en hydron, så luppen viser ingen." },
        { id: "hco3", forkl: "Hydrogencarbonat har pKₛ = 10,33 og er en meget svag syre. Jo længere mod højre på skalaen, jo svagere er syren." }
    ];
    D.SKALA_SPM = {
        tekst: "Methansyre har pKₛ = 3,75, og ethansyre har pKₛ = 4,76. Hvor mange gange større er Kₛ for methansyre?",
        svar: ["1 gang", "10 gange", "100 gange"], rigtig: 1,
        gule: ["hcooh", "eddike"],
        fejl: { 0: "Kₛ er forskellige, når pKₛ er forskellige. Se på Kₛ-skalaen over de to flasker.",
                2: "Forskellen i pKₛ er kun omkring 1. På Kₛ-skalaen er 10⁻⁴ og 10⁻⁵ ét hak fra hinanden." },
        hint: ["Find de to flasker på skalaen, og se på Kₛ-skalaen lige over dem.",
               "Methansyre har Kₛ = 1,8 · 10⁻⁴ M, og ethansyre har Kₛ = 1,7 · 10⁻⁵ M."],
        forkl: "pKₛ er én enhed lavere, så Kₛ er 10 gange større: 1,8 · 10⁻⁴ M mod 1,7 · 10⁻⁵ M. Én enhed i pKₛ svarer til en faktor 10 i Kₛ."
    };
    D.SKALA_FAERDIG = "Alle fem flasker står på skalaen.";

    D.skalaTekst = function (id) {
        var s = D.SYRER[id];
        return D.Navn(id) + " har Kₛ = " + D.ksTabel(id) + " M. Hvor på pKₛ-skalaen hører " + s.navn +
            " hjemme? Træk flasken derop, og tryk Indsend svar.";
    };

    /* Hint til en flaske: tierpotensen paa Kₛ-skalaen og intervallet */
    D.skalaHint = function (id) {
        var ks = D.SYRER[id].ks, e = D.eksp(ks), m = ks / Math.pow(10, e);
        var h1 = "Find 10" + NK.haevet(e) + " på Kₛ-skalaen øverst. Lige under den står pKₛ = " + D.tal(-e) + ".";
        var h2 = Math.abs(m - 1) < 0.05 ?
            D.ksTabel(id) + " M står præcis ved 10" + NK.haevet(e) + ", så pKₛ er " + D.tal(-e) + "." :
            D.ksTabel(id) + " M ligger mellem 10" + NK.haevet(e) + " og 10" + NK.haevet(e + 1) + ", så pKₛ ligger mellem " + D.tal(-e - 1) + " og " + D.tal(-e) + ".";
        return [h1, h2];
    };

    /* Beskeden til en flaske, der staar forkert. p er markoerens pKₛ. */
    D.skalaFejl = function (id, p) {
        var s = D.SYRER[id], kp = D.ksSkala(p);
        if (Math.abs(p + s.pks) < 0.7 && Math.abs(s.pks) > 1.5) {
            return s.ks < 1 ? "Kₛ er et lille tal, og pKₛ = −log Kₛ. Et lille Kₛ giver en stor pKₛ, så flyt flasken mod højre." :
                "Kₛ er et stort tal, og pKₛ = −log Kₛ. Et stort Kₛ giver en lav pKₛ, så flyt flasken mod venstre.";
        }
        if (p > s.pks) return "Ved markøren er Kₛ = " + kp + " M. Det er mindre end " + D.ksTabel(id) + " M, så flyt flasken mod venstre.";
        return "Ved markøren er Kₛ = " + kp + " M. Det er større end " + D.ksTabel(id) + " M, så flyt flasken mod højre.";
    };

    /* =====================================================================
       Fane 2: Regn paa syren. Den gamle b3.1 i fire trin for hver af
       bogens elleve syrer. Retningen skifter: fra Kₛ til pKₛ eller fra pKₛ
       til Kₛ. Formlen vaelges foerste gang hver vej.
       ===================================================================== */
    D.REGN_TRIN = [
        { id: "base", navn: "Reaktionen" },
        { id: "ks", navn: "Kₛ-udtrykket" },
        { id: "regn", navn: "Beregningen" },
        { id: "styrke", navn: "Styrken" }
    ];
    D.REGN_FOERST = "eddike";        /* bogens eksempel */

    D.FEJLTEKST = {
        ladning: function () { return "Tjek ladningen. Hydronen, H⁺, tager én positiv ladning med, så ladningen falder med 1."; },
        brint: function () { return "Tjek antallet af H. Syren afgiver ét H-atom."; },
        flere: function () { return "Syren afgiver kun én hydron ad gangen."; },
        optag: function (f) { return D.u(f) + " dannes, hvis syren optager en hydron. Her afgiver syren en hydron."; },
        oh: function () { return "OH⁻ dannes, når vand afgiver en hydron. Her optager vand en hydron."; }
    };

    D.REGN = {
        base: {
            tekst: function (s) { return D.Navn(s.id) + " reagerer med vand. Hvad dannes, når " + D.u(s.syre) + " afgiver en hydron til vand?"; },
            hint: function (s) { return ["En hydron, H⁺, består af ét H-atom og én positiv ladning.", "Fjern ét H fra " + D.u(s.syre) + ", og træk 1 fra ladningen."]; },
            forkl: function (s) { return D.u(s.syre) + " og " + D.u(s.base) + " er et korresponderende syre-basepar. Vand optager hydronen og bliver til H₃O⁺."; }
        },
        ks: {
            tekst: function (s) { return "Opstil Kₛ-udtrykket for " + s.navn + ". Træk stofferne fra bakken op i brøken, og tryk Indsend svar."; },
            hint: function (s) { return ["Kₛ er en ligevægtskonstant: produkterne står over brøkstregen og syren under.",
                                         "Tæller: " + D.u(s.base) + " og H₃O⁺. Nævner: " + D.u(s.syre) + ". Vand er ikke med."]; },
            vand: "Vand er opløsningsmidlet og indgår ikke i Kₛ-udtrykket.",
            plads: "Produkterne står i tælleren, og syren står i nævneren.",
            begge: "Begge produkter skal stå i tælleren.",
            intet: "Træk et stof op på hver af de tre pladser i brøken først.",
            forkl: "Produkterne står i tælleren, og syren står i nævneren. Vand er opløsningsmidlet og er ikke med."
        },
        formelPks: {
            tekst: function (s) { return "Kₛ for " + s.navn + " er " + D.ksTekst(s.pks) + " M. Hvilken formel giver pKₛ ud fra Kₛ?"; },
            svar: ["pKₛ = −log(Kₛ)", "pKₛ = log(Kₛ)", "pKₛ = −ln(Kₛ)"], rigtig: 0,
            fejl: { 1: "Med log alene bliver pKₛ negativ for en svag syre. Husk minus foran log.",
                    2: "pKₛ regnes med 10-talslogaritmen, log, ikke med ln." },
            hint: ["pKₛ defineres på samme måde som pH.", "pH = −log([H₃O⁺]), så pKₛ = −log(…)."],
            forkl: "pKₛ = −log(Kₛ), ligesom pH = −log([H₃O⁺])."
        },
        formelKs: {
            tekst: function (s) { return "Tabellen giver pKₛ = " + D.tal2(s.pks) + " for " + s.navn + ". Hvilken formel giver Kₛ ud fra pKₛ?"; },
            svar: ["Kₛ = 10^{−pKₛ} M", "Kₛ = 10^{pKₛ} M", "Kₛ = −log(pKₛ) M"], rigtig: 0,
            fejl: { 1: "Uden minus bliver Kₛ et stort tal for en svag syre. Eksponenten skal være −pKₛ.",
                    2: "−log bruges den anden vej, fra Kₛ til pKₛ. Her skal 10 opløftes i −pKₛ." },
            hint: ["Formlen skal gøre det modsatte af pKₛ = −log(Kₛ).", "Det modsatte af −log er 10 opløftet i minus tallet."],
            forkl: "Kₛ = 10^{−pKₛ} M er den modsatte vej af pKₛ = −log(Kₛ)."
        },
        tilPks: {
            tekst: function (s) { return "Beregn pKₛ for " + s.navn + ". Skriv tallet med to decimaler, og tryk Indsend svar."; },
            hint: function (s) { return ["pKₛ = −log(Kₛ). Brug log, ikke ln.", "Tast −log(" + D.ksTekst(s.pks) + ") på lommeregneren, og afrund til to decimaler."]; },
            fortegn: "Tjek fortegnet. Husk minus foran log.",
            ln: "Du har brugt ln. pKₛ beregnes med log.",
            eksponent: "Tag hele Kₛ med, ikke kun eksponenten.",
            afrund: "Det er tæt på. Tjek afrundingen, og skriv to decimaler.",
            andet: "Ikke rigtigt. Tjek beregningen på lommeregneren.",
            intet: "Skriv et tal, for eksempel 3,25.",
            forkl: function (s) { return s.pks > 0 ? "Kₛ er mindre end 1, så pKₛ er positiv." : "Kₛ er større end 1, så pKₛ er negativ. Det er en stærk syre."; }
        },
        tilKs: {
            tekst: function (s) { return "Beregn Kₛ for " + s.navn + ". Skriv tallet foran tierpotensen og eksponenten, og tryk Indsend svar."; },
            hint: function (s) { return ["Kₛ = 10^{−pKₛ} M.", "Tast 10^{" + D.tal2(-s.pks) + "} på lommeregneren. Skriv svaret som et tal gange en tierpotens."]; },
            fortegn: "Tjek fortegnet. Eksponenten er −pKₛ, så Kₛ = 10^{−pKₛ} M.",
            e: "Du har brugt e. Kₛ beregnes med 10 opløftet i −pKₛ.",
            eksponent: "Tag decimalerne i pKₛ med. 10^{−4,76} er ikke det samme som 10^{−5}.",
            tierpot: "Tallet foran er rigtigt. Tjek eksponenten.",
            andet: "Ikke rigtigt. Tjek beregningen på lommeregneren.",
            intet: "Skriv tallet foran tierpotensen og eksponenten, for eksempel 2,5 og −3.",
            forkl: function (s) { return s.pks > 0 ? "pKₛ er positiv, så Kₛ er mindre end 1." : "pKₛ er negativ, så Kₛ er større end 1. Det er en stærk syre."; }
        },
        styrke: {
            tekst: function (s) { return "Er " + s.navn + " en stærk, middelstærk, svag eller meget svag syre?"; },
            svar: ["Stærk", "Middelstærk", "Svag", "Meget svag"],
            hint: ["Jo lavere pKₛ, jo stærkere syre. Skalaen på tavlen viser grænserne.",
                   "Stærk: under 0. Middelstærk: 0 til 4. Svag: 4 til 10. Meget svag: over 10."],
            svagere: function (s) { return D.Navn(s.id) + " er svagere end det. Find pKₛ = " + D.tal2(s.pks) + " på skalaen."; },
            staerkere: function (s) { return D.Navn(s.id) + " er stærkere end det. Find pKₛ = " + D.tal2(s.pks) + " på skalaen."; },
            forkl: function (s) {
                var z = D.zone(s.pks);
                return D.Navn(s.id) + " har pKₛ = " + D.tal2(s.pks) + " og er en " + D.ZONER[z].navn + " syre." +
                    (z === 0 ? " En stærk syre reagerer fuldstændigt med vand, så pilen bliver →." : "");
            }
        }
    };
    D.REGN_FAERDIG = "Alle elleve syrer fra bogens tabel er regnet.";

    /* =====================================================================
       Fane 3: Den ukendte syre. Tre flasker med en kendt koncentration.
       Eleven maaler pH og regner Kₛ i bogens fire trin (figuren b6-ks-vej),
       saa pKₛ, og finder syren paa hylden. Flaske A har alle trin og til
       sidst omdannelsesgraden; i B og C udfyldes [B] af sig selv.
       ===================================================================== */
    D.HYLDE = ["h3po4", "hcooh", "maelk", "ascorbin", "eddike", "nh4"];
    D.UKENDTE = [
        { id: "A", rigtig: "hcooh", c: 0.100, ph: 2.38, fuld: true,
          slut: "Det er methansyre med pKₛ = 3,75. Målingen gav 3,74, og mælkesyre med 3,86 ligger længere væk." },
        { id: "B", rigtig: "ascorbin", c: 0.0500, ph: 2.74,
          slut: "Det er ascorbinsyre, C-vitamin, med pKₛ = 4,17. Koncentrationen var en anden, men Kₛ er den samme." },
        { id: "C", rigtig: "nh4", c: 0.100, ph: 5.13, kilde: "ammoniumchlorid",
          slut: "Det er ammonium, NH₄⁺, fra ammoniumchlorid med pKₛ = 9,25. En ion kan også være en syre." }
    ];

    D.UKENDT_TRIN = {
        maal: { navn: "Mål pH", titel: "pH",
                tekst: function (u) { return "Flasken indeholder en ukendt syre med cₛ = " + D.konc(u.c) + ". Hvilken syre er det? Begynd med at måle pH i opløsningen."; },
                hint: ["Tryk Mål pH, eller klik på pH-metret.", "pH-metrets elektrode sænkes ned i opløsningen."] },
        oxonium: { navn: "Oxonium", titel: "Oxonium: findes ud fra den målte pH",
                   tekst: function (u) { return "pH-metret viser " + D.tal2(u.ph) + ". Beregn [H₃O⁺] i opløsningen, og tryk Indsend svar."; },
                   hint: function (u) { return ["[H₃O⁺] findes ud fra pH: [H₃O⁺] = 10^{−pH} M.", "Tast 10^{" + D.tal2(-u.ph) + "} på lommeregneren, og skriv svaret med tre betydende cifre."]; },
                   fortegn: "Tjek fortegnet. [H₃O⁺] = 10^{−pH} M, så eksponenten er negativ.",
                   e: "Du har brugt e. Brug 10 opløftet i −pH.",
                   andet: function (u) { return "Ikke rigtigt. [H₃O⁺] = 10^{" + D.tal2(-u.ph) + "} M. Tjek tallet foran og eksponenten."; },
                   forkl: function (u, r) { return "[H₃O⁺] = " + D.potensU(r.h) + " M. Det er koncentrationen af oxoniumioner i flasken." +
                       (u.fuld ? "" : " Forholdet er 1 : 1, så [B] er lige så stor."); } },
        basen: { navn: "Basen", titel: "Basen: forholdet er 1 : 1",
                 tekst: function () { return "Syren har afgivet hydroner til vand. Hvor stor er [B], koncentrationen af syrens korresponderende base?"; },
                 svar: function (u, r) { return ["Som [H₃O⁺]: " + D.potensU(r.h) + " M", "Som cₛ: " + D.konc(u.c), "Den er 0 M"]; }, rigtig: 0,
                 fejl: { 1: "cₛ er den formelle koncentration af syren. Kun en lille del af syren er blevet til base.",
                         2: "Hver gang der dannes en oxoniumion, dannes der også en korresponderende base." },
                 hint: ["Se på reaktionsskemaet øverst på tavlen: S + H₂O ⇌ B + H₃O⁺.", "Der dannes én B for hver H₃O⁺."],
                 forkl: "Hver gang syren afgiver en hydron, dannes der én B og én H₃O⁺. Forholdet er 1 : 1, så [B] = [H₃O⁺]." },
        syren: { navn: "Syren", titel: "Syren: resten er stadig syre",
                 tekst: function () { return "Beregn den aktuelle koncentration af syren, [S], og tryk Indsend svar."; },
                 hint: function (u, r) { return ["Den del af syren, der har afgivet sin hydron, er blevet til base. Resten er stadig syre.",
                                                 "[S] = cₛ − [B] = " + D.konc(u.c) + " − " + D.lille(r.h) + " M"]; },
                 cs: "Det er den formelle koncentration, cₛ. Træk den del fra, der er blevet til base.",
                 plus: "Syren bliver mindre, når den afgiver hydroner. Træk [B] fra cₛ.",
                 b: "Det er [B]. [S] er resten af syren: [S] = cₛ − [B].",
                 andet: "Ikke rigtigt. [S] = cₛ − [B].",
                 forkl: function (u, r) { return r.s === u.c ? "Så lidt syre er blevet til base, at [S] er lig med cₛ med tre betydende cifre." :
                                                  "[S] = " + D.decimal(r.s) + " M. Næsten al syren er der stadig."; } },
        konstanten: { navn: "Konstanten", titel: "Konstanten: syrens styrke",
                      tekst: function () { return "Beregn Kₛ for den ukendte syre, og tryk Indsend svar."; },
                      hint: function (u, r) { return ["Kₛ = [B] · [H₃O⁺] / [S]. Brug den aktuelle koncentration, [S].",
                                                       "Kₛ = " + D.potensU(r.h) + " M · " + D.potensU(r.h) + " M / " + D.decimal(r.s) + " M"]; },
                      kvadrat: "Tælleren har både [B] og [H₃O⁺]. Gang dem med hinanden.",
                      cs: "Brug den aktuelle koncentration, [S], i nævneren, ikke cₛ.",
                      andet: "Ikke rigtigt. Tjek beregningen på lommeregneren.",
                      forkl: function (u, r) { return "Kₛ = " + D.potensU(r.k) + " M. Jo større Kₛ, jo stærkere syre."; } },
        pks: { navn: "pKₛ", titel: "pKₛ",
               tekst: function () { return "Beregn pKₛ for den ukendte syre, og tryk Indsend svar."; },
               hint: function (u, r) { return ["pKₛ = −log(Kₛ).", "Tast −log(" + D.potensU(r.k) + ") på lommeregneren, og afrund til to decimaler."]; },
               fortegn: "Tjek fortegnet. Husk minus foran log.",
               ln: "Du har brugt ln. pKₛ beregnes med log.",
               andet: "Ikke rigtigt. Tjek beregningen på lommeregneren.",
               forkl: function (u, r) { return "pKₛ = " + D.tal2(r.pks) + ". Nu kan du sammenligne med syrerne på hylden."; } },
        flaske: { navn: "Hvilken syre?", titel: "Hvilken syre?",
                  tekst: function () { return "Hvilken af syrerne på hylden er i flasken? Klik på en flaske, og tryk Indsend svar."; },
                  hint: function (u, r) {
                      var t = D.HYLDE.slice().sort(function (a, b) { return Math.abs(D.SYRER[a].pks - r.pks) - Math.abs(D.SYRER[b].pks - r.pks); });
                      return ["Find den flaske, hvis pKₛ ligger tættest på " + D.tal2(r.pks) + ".",
                              D.Navn(t[0]) + " har pKₛ = " + D.tal2(D.SYRER[t[0]].pks) + ", og " + D.SYRER[t[1]].navn + " har pKₛ = " + D.tal2(D.SYRER[t[1]].pks) + "."];
                  },
                  fejl: function (id, r) { return D.Navn(id) + " har pKₛ = " + D.tal2(D.SYRER[id].pks) + ". Din syre har pKₛ = " + D.tal2(r.pks) + ", så vælg en flaske tættere på."; },
                  intet: "Klik på en af flaskerne på hylden først." },
        alfa: { navn: "Omdannelsesgraden", titel: "Omdannelsesgraden",
                tekst: function (u) { return "Hvor mange procent af " + D.SYRER[u.rigtig].navn + "n har afgivet sin hydron? Beregn omdannelsesgraden, α."; },
                hint: function (u, r) { return ["Omdannelsesgraden er den del af syren, der er blevet til base: α = [B] / cₛ.",
                                                "α = " + D.lille(r.h) + " M / " + D.konc(u.c) + ". Gang med 100 for at få procent."]; },
                broek: "Det er brøkdelen. Gang med 100 for at få procent.",
                rest: "Det er den del, der stadig er syre. α er den del, der er blevet til base.",
                andet: "Ikke rigtigt. α = [B] / cₛ.",
                forkl: function (u, r) { return "α = " + D.tal1(r.alfa) + " %. Kun " + Math.round(r.alfa) + " af 100 molekyler har afgivet deres hydron, så " +
                                                 D.SYRER[u.rigtig].navn + " er ikke en stærk syre."; } }
    };
    D.UKENDT_FULD = ["maal", "oxonium", "basen", "syren", "konstanten", "pks", "flaske", "alfa"];
    D.UKENDT_KORT = ["maal", "oxonium", "syren", "konstanten", "pks", "flaske"];
    D.UKENDT_FAERDIG = "Alle tre flasker er opklaret.";

    /* Kaeden af tal for en ukendt flaske, regnet som i bogen med tre
       betydende cifre i hvert trin (det, tavlen viser) */
    D.kaede = function (u) {
        var h = D.rund3(Math.pow(10, -u.ph));
        var s = D.rund3(u.c - h);
        var k = D.rund3(h * h / s);
        var pks = Math.round(-Math.log(k) / Math.LN10 * 100) / 100;
        var alfa = Math.round(h / u.c * 1000) / 10;
        return { h: h, b: h, s: s, k: k, pks: pks, alfa: alfa };
    };

    /* =====================================================================
       Modellen: hvor stor en del af syren der har afgivet sin hydron
       HA + H₂O ⇌ A⁻ + H₃O⁺,  Kₛ = x² / (c − x)
       Skrevet som 2Kc / (K + √(K² + 4Kc)), saa det ogsaa er praecist for
       store Kₛ.
       ===================================================================== */
    D.oxonium = function (ks, c) {
        return 2 * ks * c / (ks + Math.sqrt(ks * ks + 4 * ks * c));
    };
    D.andel = function (ks, c) { return c > 0 ? D.oxonium(ks, c) / c : 0; };
    D.ksFraPks = function (pks) { return Math.pow(10, -pks); };

    /* ----- Tal og formler som tekst --------------------------------------------- */
    D.eksp = function (v) { return Math.floor(Math.log(Math.abs(v)) / Math.LN10 + 1e-9); };

    D.rund3 = function (v) {
        if (!v) return 0;
        var e = D.eksp(v), f = Math.pow(10, 2 - e);
        return Math.round(v * f) / f;
    };

    D.tal = function (v) { return String(v).replace("-", "−").replace(".", ","); };
    D.tal1 = function (v) { return (Math.round(v * 10) / 10).toFixed(1).replace(".", ",").replace("-", "−"); };
    D.tal2 = function (v) {
        var r = Math.round(v * 100) / 100;
        /* Tabellens hele tal og tal med én decimal skrives som i bogen: −7 og −1,4 */
        var s = Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) :
                (Math.abs(r * 10 - Math.round(r * 10)) < 1e-9 ? r.toFixed(1) : r.toFixed(2));
        return s.replace(".", ",").replace("-", "−");
    };

    /* En potens med unicode: 1,74 · 10⁻⁵ (cifre betydende cifre). Et tal
       med eksponenten 0 eller 1 skrives uden potens: 25,1 */
    D.potensU = function (v, cifre) {
        cifre = cifre || 3;
        var e = D.eksp(v), m = D.mantisse(v, cifre);
        if (m.e === 0 || m.e === 1) return NK.betydende(v, cifre);
        return m.t + " · 10" + NK.haevet(m.e);
    };
    /* Samme potens til laerredet: 1,74 · 10^{-5} */
    D.potensC = function (v, cifre) {
        cifre = cifre || 3;
        var m = D.mantisse(v, cifre);
        if (m.e === 0 || m.e === 1) return NK.betydende(v, cifre);
        return m.t + " · 10^{" + m.e + "}";
    };
    /* Tallet foran tierpotensen og eksponenten; nuller til sidst fjernes kun,
       naar alle decimaler er nul (1 · 10⁷, ikke 1,00 · 10⁷) */
    D.mantisse = function (v, cifre) {
        var e = D.eksp(v), f = Math.pow(10, cifre - 1);
        var m = Math.round(v / Math.pow(10, e) * f * (1 + 1e-12)) / f;
        if (m >= 10) { m /= 10; e++; }
        var t = m.toFixed(cifre - 1);
        if (/^\d+\.0+$/.test(t)) t = String(Math.round(m));
        return { m: m, e: e, t: t.replace(".", ",") };
    };

    /* Kₛ som i tabellen (to betydende cifre) og som tavlen regner med (tre) */
    D.ksTabel = function (id) { return D.potensU(D.SYRER[id].ks, 2); };
    D.ksTekst = function (pks) { return D.potensU(D.ksFraPks(pks), 3); };
    D.ksSkala = function (p) { return D.potensU(D.ksFraPks(p), 2); };

    /* Et lille tal som decimaltal: 0,00417 */
    D.decimal = function (v) { return NK.betydende(v, 3); };
    D.konc = function (c) { return NK.betydende(c, 3) + " M"; };
    /* Et lille tal: decimaltal ned til 0,0001, ellers en tierpotens
       (0,00417, men 7,41 · 10⁻⁶ i stedet for 0,00000741) */
    D.lille = function (v) { return v >= 1e-4 ? D.decimal(v) : D.potensC(v); };

    /* "CH_3COO^-" -> "CH₃COO⁻" */
    D.u = function (s) {
        return String(s).replace(/_\{([^}]*)\}|_([0-9a-z]+)/g, function (m, a, b) { return NK.saenket(a || b); })
            .replace(/\^\{([^}]*)\}|\^([0-9+\-]+)/g, function (m, a, b) { return NK.haevet(a || b); })
            .replace(/-/g, "−");
    };

    /* Saenkede og haevede tegn som HTML: unicode-saenkede (₀-₉, ₛ, ᵢ, ₒ),
       unicode-haevede (⁰-⁹, ⁺, ⁻) og ^{...} */
    var SAENKET = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
                    "ₙ": "n", "ₛ": "s", "ᵢ": "i", "ₒ": "o" };
    var HAEVET = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "−" };
    D.sub = function (html) {
        return String(html)
            .replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>")
            .replace(/[₀-₉ₙₛᵢₒ]+/g, function (m) { return "<sub>" + m.split("").map(function (c) { return SAENKET[c]; }).join("") + "</sub>"; })
            .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, function (m) { return "<sup>" + m.split("").map(function (c) { return HAEVET[c]; }).join("") + "</sup>"; })
            /* En potens og en enhed deles ikke over to linjer: 1,7 · 10⁻⁵ M */
            .replace(/(\d) · 10/g, "$1 · 10")
            .replace(/(\d|<\/sup>) (M|%)(?![A-Za-zÆØÅæøå])/g, "$1 $2");
    };

    /* ----- Elevens tal ------------------------------------------------------------
       tolk("4,17") -> 4.17. Godtager komma og punktum, − og -, mellemrum og
       et tal i potensform skrevet i et felt: 4,17·10^-3, 4,17e-3, 4,17*10⁻³. */
    D.tolk = function (tekst) {
        var t = NK.ascii(tekst || "").replace(/\s+/g, "").replace(/,/g, ".").replace(/[·×x*]/g, "*");
        if (!t) return NaN;
        var m = /^([-+]?\d*\.?\d+)\*?10\^?\(?([-+]?\d+)\)?$/.exec(t);
        if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2], 10));
        m = /^10\^?\(?([-+]?\d+)\)?$/.exec(t);
        if (m) return Math.pow(10, parseInt(m[1], 10));
        if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return NaN;
        return parseFloat(t);
    };

    /* Tallet foran og eksponenten fra to felter. Er eksponenten tom, kan
       hele tallet staa i det foerste felt. */
    D.tolkPotens = function (foran, eksponent) {
        var f = String(foran || "").trim(), e = String(eksponent || "").trim();
        if (!e) return D.tolk(f);
        var a = D.tolk(f || "1"), b = D.tolk(e);
        if (isNaN(a) || isNaN(b) || Math.round(b) !== b) return NaN;
        return a * Math.pow(10, b);
    };

    D.naer = function (a, b, rel) { return isFinite(a) && b !== 0 && Math.abs(a - b) <= Math.abs(b) * rel; };

    NK.Data = D;
}());
