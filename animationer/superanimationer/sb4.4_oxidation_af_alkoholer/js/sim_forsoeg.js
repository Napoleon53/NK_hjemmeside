/* =====================================================================
   sim_forsoeg.js - fane 3: Ukendte alkoholer

   Bygget paa Basiskemi B, Xperiment 24: tre glas A, B og C med
   propan-1-ol, propan-2-ol og 2-methylpropan-2-ol i tilfaeldig
   raekkefoelge. Permanganat tilsaettes, glassene varmes i vandbad, og pH
   maales. Eleven haelder og varmer ikke selv (en stilladseret opgave).

   Tredje udgave 3. nov. 2026, "fra molekyle til glas" (brugerens valg):
     * glassene staar oeverst hele tiden med farven, bundfaldet og pH. MnO₂
       falder til bunds, og den primaere giver mest bundfald (skemaet: 4
       MnO₄⁻ for 3 propan-1-ol mod 2 for 3 propan-2-ol)
     * under glassene arbejdes der med én alkohol ad gangen: den tertiaere,
       saa den sekundaere, saa den primaere. Den, der arbejdes med, staar som
       overskrift; de andre venter som smaa kort til hoejre
     * hver alkohol gaar gennem tre felter fra venstre mod hoejre:
       1 Molekylet (hvor mange H paa carbonatomet med OH?), 2 Reaktionen
       (hvad dannes, og afstemningen i bogens trin) og 3 Forventet (farve og
       pH). Saa vaelges det glas, der passer, og kortet glider op i glasset
     * pH er som i et rigtigt forsoeg (D.FORSOEG_PH): primaer 6-8,
       sekundaer 8-10, tertiaer 7

   Trinene (this.liste, ét spoergsmaal pr. trin). Bogstavet er alkoholen
   (t tertiaer, s sekundaer, p primaer):
     forsoeg                 knappen Udfoer forsoeget
     t-H  t-reak  t-forvent  t-glas
     s-H  s-reak  s-oxC  s-oxMn  s-koef  s-ladning  s-brint  s-forvent  s-glas
     p-H  p-reak  p-oxC  p-koef  p-ladning  p-brint  p-forvent
   Det sidste glas er givet: efter p-forvent glider propan-1-ol selv op i
   det. Naar teorien er klaret én gang, har de naeste runder kun forsoeget,
   forventningerne og glassene. Det, der er klaret, huskes i browseren
   (nk-sb4.3-forsoeg).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var NOEGLE = "nk-sb4.3-forsoeg";

    var GUL = "#d69e0c", GUL_FYLD = "rgba(242, 197, 61, 0.3)";
    var TEAL = "#0f8a8a";
    var FA = D.AFSTEM_FARVE;
    var FF = D.FORSOEG_FARVE;
    var VARIGHED = 6.8;
    var BOGSTAVER = ["A", "B", "C"];
    var GLASNAVNE = ["Glas A", "Glas B", "Glas C"];
    var FULD = ["forsoeg", "t-H", "t-reak", "t-forvent", "t-glas",
        "s-H", "s-reak", "s-oxC", "s-oxMn", "s-koef", "s-ladning", "s-brint", "s-forvent", "s-glas",
        "p-H", "p-reak", "p-oxC", "p-koef", "p-ladning", "p-brint", "p-forvent"];
    var KORT = ["forsoeg", "t-forvent", "t-glas", "s-forvent", "s-glas", "p-forvent"];
    var DELE = ["oxC", "oxMn", "koef", "ladning", "brint"];
    var TYPE = { t: "tertiaer", s: "sekundaer", p: "primaer" };
    var NR = { primaer: 0, sekundaer: 1, tertiaer: 2 };       /* nummeret i D.FORSOEG.alkoholer */
    var ORDEN = ["tertiaer", "sekundaer", "primaer"];          /* den raekkefoelge, de gennemgaas i */
    var FELTER = ["Molekylet", "Reaktionen", "Forventet"];
    var FONT = "'Segoe UI', sans-serif";

    var TOM = new Image();
    TOM.src = "sprites/reagensglas_tom.svg";

    function hex(f) { return [parseInt(f.slice(1, 3), 16), parseInt(f.slice(3, 5), 16), parseInt(f.slice(5, 7), 16)]; }
    function bland(a, b, t) {
        var x = hex(a), y = hex(b);
        return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(x[i] + (y[i] - x[i]) * t); }).join(", ") + ")";
    }
    function blandHex(a, b, t) {
        var x = hex(a), y = hex(b);
        return "#" + [0, 1, 2].map(function (i) { var v = Math.round(x[i] + (y[i] - x[i]) * t).toString(16); return v.length < 2 ? "0" + v : v; }).join("");
    }

    function SimForsoeg() {
        var mig = this;
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { afstemt: !!g.a, runder: g.r || 0, stjerne: !!g.s };
        this.alk = D.FORSOEG.alkoholer.map(function (a) { return K.alkohol(a.navn); });
        this.fuld = {};
        D.FORSOEG.alkoholer.forEach(function (a) { mig.fuld[a.type] = K.fuldStruktur(a.navn); });
        this.afstem = { sekundaer: K.afstem("sekundaer"), primaer: K.afstem("primaer") };
        this.kortPos = [null, null, null];
        this.startFane();
        this.el.skort.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-handling]") : null;
            if (k && k.getAttribute("data-handling") === "forsoeg") mig.udfoer();
        });
        NK.el("u-forfra").addEventListener("click", function () { mig.forfra(); });
        /* Koefficienterne foran alkoholen og MnO₄⁻ skrives direkte i skemaet
           (brugerens oenske): to felter oven paa tavlen */
        var scene = NK.el("fane-u").querySelector(".scene");
        this.koefFelt = [0, 1].map(function (j) {
            var e = document.createElement("input");
            e.type = "text";
            e.className = "koef-felt";
            e.setAttribute("inputmode", "numeric");
            e.setAttribute("autocomplete", "off");
            e.maxLength = 2;
            e.setAttribute("aria-label", j ? "Koefficienten foran MnO₄⁻" : "Koefficienten foran alkoholen");
            e.hidden = true;
            e.addEventListener("input", function () { e.value = e.value.replace(/[^0-9]/g, ""); mig.visKort(); });
            e.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); mig.indsendKlik(); } });
            scene.appendChild(e);
            return e;
        });
    }

    /* De to tal, eleven har skrevet (eller null) */
    SimForsoeg.prototype.koefV = function () {
        if (!this.koefFelt) return [null, null];
        return this.koefFelt.map(function (e) { var n = parseInt(e.value, 10); return n >= 1 && n <= 30 ? n : null; });
    };

    var P = SimForsoeg.prototype;
    F.paa(P, "u");

    P.gem = function () {
        NK.gem(NOEGLE, { a: this.status.afstemt ? 1 : 0, r: this.status.runder, s: this.status.stjerne ? 1 : 0 });
    };

    /* Fanen har ingen liste af opgaver: app.js kalder vaelg ved start */
    P.naesteUloeste = function () { return 0; };
    P.vaelg = function () { this.nyRunde(); };

    /* En ny runde: glassene blandes, og pH trækkes som i et rigtigt forsoeg */
    P.nyRunde = function () {
        var mig = this, r = [0, 1, 2];
        for (var i = 2; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = r[i]; r[i] = r[j]; r[j] = x; }
        this.glas = r;                    /* glas nummer i indeholder alkohol nummer r[i] */
        this.phV = { tertiaer: D.FORSOEG_PH.tertiaer, primaer: D.FORSOEG_PH.primaer, sekundaer: D.FORSOEG_PH.sekundaer };
        this.boble = null;
        if (this.koefFelt) this.koefFelt.forEach(function (e) { e.value = ""; e.hidden = true; });
        /* Kornene af MnO₂, der falder til bunds: flest i glasset med mest bundfald */
        this.korn = [0, 1, 2].map(function (i) {
            var ud = [], antal = Math.round(130 * K.bundfald(mig.indhold(i).type));
            for (var k = 0; k < antal; k++) ud.push({ x: Math.random(), y0: Math.random() * 0.85, v: 0.3 + Math.random() * 0.35 });
            return ud;
        });
        this.liste = this.status.afstemt ? KORT : FULD;
        this.ti = 0;
        this.kendt = [null, null, null];  /* den alkohol, eleven har fundet i hvert glas */
        this.valgt = null;
        this.forkert = {};
        this.forsoegT = null;
        this.udfoert = false;
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.forfra = function () {
        this.status.afstemt = false;
        this.gem();
        this.nyRunde();
    };

    P.nulstil = function () { if (!this.groen) this.forfra(); };

    P.trin = function () { return this.liste ? this.liste[this.ti] || "" : ""; };
    /* Den alkohol, der arbejdes med lige nu ("tertiaer" ...), eller null */
    P.fokus = function () { var id = this.trin(); return id.charAt(1) === "-" && !this.groen ? TYPE[id.charAt(0)] : null; };
    P.del = function () { return this.trin().slice(2); };
    /* Feltet, trinnet hoerer til: 1 Molekylet, 2 Reaktionen, 3 Forventet, 4 glasset */
    P.felt = function () {
        var d = this.del();
        if (d === "H") return 1;
        if (d === "forvent") return 3;
        if (d === "glas") return 4;
        return 2;
    };

    /* Glassene: indholdet og resultatet */
    P.indhold = function (i) { return D.FORSOEG.alkoholer[this.glas[i]]; };
    P.reagerer = function (i) { return this.indhold(i).type !== "tertiaer"; };
    P.papir = function (i) { return this.phV[this.indhold(i).type]; };
    P.glasMed = function (type) {
        for (var i = 0; i < 3; i++) if (this.indhold(i).type === type) return i;
        return -1;
    };

    /* ----- Panelet: trinene ------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, id = this.trin(), nu = this.groen ? 4 : (id === "forsoeg" ? 0 : { t: 1, s: 2, p: 3 }[id.charAt(0)]), html = "";
        D.FORSOEG_TRIN.forEach(function (t, i) {
            var klaret = i < nu;
            html += '<div class="opg-chip trin' + (i === nu ? " valgt" : "") + (klaret ? " loest" : "") + '">' +
                '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" + NK.html(t.navn) + '</span><i class="oc-m">' + (klaret ? "✓" : "") + "</i></div>";
        });
        NK.saetHTML("u-trinliste", html);
        NK.saetTekst("u-runder", String(this.status.runder));
    };

    /* ----- Spoergsmaalene: ét pr. trin ---------------------------------------------- */
    P.spm = function () {
        var id = this.trin(), mig = this, type = TYPE[id.charAt(0)], del = id.slice(2);
        var navn = type ? D.FORSOEG.alkoholer[NR[type]].navn : "";
        if (del === "H") {
            var f = this.fuld[type], nb = f.mol.naboer(f.c), nC = 0, nH = f.h.length;
            nb.forEach(function (n) { if (f.mol.atom(n).el === "C") nC++; });
            return {
                chip: "1 Molekylet", felt: 1,
                tekst: "Se på carbonatomet med OH-gruppen i " + navn + ". Hvor mange hydrogenatomer sidder der på det?",
                svar: ["0", "1", "2", "3"], rigtig: nH,
                fejl: function () { return "Tæl kun de hydrogenatomer, der sidder direkte på det markerede carbonatom, ikke dem på oxygenatomet eller på de andre carbonatomer."; },
                hint: ["Det markerede carbonatom har fire bindinger. Hvad går de til?",
                    "Bindingerne går til " + (nC === 1 ? "ét carbonatom" : D.TAL[nC] + " carbonatomer") + ", ét oxygenatom og resten til hydrogen."],
                god: { tertiaer: "Ingen. Oxidationsmidlet kan ikke tage et hydrogenatom fra det carbonatom.",
                    sekundaer: "Ét. Oxidationsmidlet kan tage det, så propan-2-ol kan oxideres én gang.",
                    primaer: "To. Propan-1-ol kan oxideres to gange." }[type]
            };
        }
        if (del === "reak") {
            var R = { tertiaer: 0, sekundaer: 1, primaer: 2 }[type];
            return {
                chip: "2 Reaktionen", felt: 2,
                tekst: "Hvad sker der, når permanganat møder " + navn + "?",
                svar: ["Ingen reaktion", "Den bliver til en keton", "Den bliver til en carboxylsyre"], rigtig: R,
                fejl: function (j) {
                    if (type === "tertiaer") return "Både en keton og en carboxylsyre kræver, at carbonatomet med OH-gruppen mister et hydrogenatom. Det har ingen.";
                    if (j === 0) return "Carbonatomet med OH-gruppen har hydrogenatomer, som permanganat kan tage. Der sker en reaktion.";
                    if (type === "sekundaer") return "En carboxylsyre kræver to oxidationer. Carbonatomet har kun ét hydrogenatom.";
                    return "OH-gruppen sidder for enden af kæden, så C=O kommer også til at sidde for enden. Med permanganat i overskud oxideres den to gange.";
                },
                hint: ["Hvor mange gange kan alkoholen oxideres? Se på tallet fra Molekylet.",
                    { tertiaer: "Ingen hydrogenatomer på carbonatomet: ingen oxidation.", sekundaer: "Én oxidation af en sekundær alkohol giver en keton.",
                        primaer: "To oxidationer af en primær alkohol giver en carboxylsyre." }[type]],
                god: { tertiaer: "Ingen reaktion. Permanganatet bliver ikke brugt.",
                    sekundaer: "Propan-2-ol bliver til propanon, en keton. Nu afstemmes reaktionen.",
                    primaer: "Propan-1-ol bliver til propansyre. Opløsningen ender basisk, så syren har afgivet en hydron og er propanoat. Nu afstemmes reaktionen." }[type]
            };
        }
        if (del === "forvent") {
            var V = {
                tertiaer: { svar: ["Violet · pH 7", "Brunsten · pH stiger", "Farveløs · pH falder"],
                    tekst: "Hvad forventer du at se i glasset med 2-methylpropan-2-ol efter opvarmningen?",
                    fejl: { 1: "Brunsten (MnO₂) dannes kun, når permanganatet oxiderer noget. Her sker der ingen reaktion.",
                        2: "Permanganatet bliver ikke brugt, så det er stadig violet." },
                    hint: ["Der sker ingen reaktion. Hvad sker der så med permanganatet?", "Permanganat er violet, og uden reaktion dannes der hverken MnO₂ eller OH⁻."],
                    god: "Violet, og pH er 7. Find glasset." },
                sekundaer: { svar: ["Brunsten · pH stiger tydeligt", "Brunsten · pH stiger kun lidt", "Violet · pH 7"],
                    tekst: "3 propan-2-ol og 2 MnO₄⁻ giver 2 MnO₂ (brunsten) og 2 OH⁻. Hvad forventer du at se i glasset med propan-2-ol?",
                    fejl: { 1: "Der dannes 2 OH⁻, og der er ingen syre til at tage dem. Så stiger pH tydeligt.",
                        2: "Permanganatet bliver brugt og bliver til brunsten, MnO₂, et brunsort bundfald." },
                    hint: ["Hvad bliver MnO₄⁻ til, og hvad gør OH⁻ ved pH?", "Brunsten (MnO₂) er et brunsort fast stof. OH⁻ gør opløsningen basisk."],
                    god: "Brunsten falder til bunds, og pH stiger tydeligt. Find glasset." },
                primaer: { svar: ["Mere brunsten · pH stiger kun lidt", "Mindre brunsten · pH stiger tydeligt", "Violet · pH 7"],
                    tekst: "3 propan-1-ol og 4 MnO₄⁻ giver 4 MnO₂ og kun 1 OH⁻. Hvad forventer du at se i glasset med propan-1-ol, sammenlignet med propan-2-ol?",
                    fejl: { 1: "3 propan-1-ol giver 4 MnO₂, men 3 propan-2-ol kun 2. Og 3 propan-1-ol giver kun 1 OH⁻, fordi propansyren har afgivet en hydron til resten.",
                        2: "Propan-1-ol kan oxideres, så permanganatet bliver til brunsten, MnO₂." },
                    hint: ["Sammenlign med propan-2-ol: 3 molekyler og 2 MnO₄⁻ giver 2 MnO₂ og 2 OH⁻.",
                        "Mere MnO₂ giver mere brunsten. Færre OH⁻ giver en lavere pH."],
                    god: "" }
            }[type];
            return { chip: "3 Forventet", felt: 3, tekst: V.tekst, svar: V.svar, rigtig: 0,
                fejl: function (j) { return V.fejl[j]; }, hint: V.hint, god: V.god };
        }
        if (del === "glas") {
            var ig = this.glasMed(type), laast = {};
            this.kendt.forEach(function (k, i) { if (k !== null) laast[i] = true; });
            var ip = this.glasMed("primaer");
            return {
                chip: "Glasset", felt: 4, kort: NR[type],
                tekst: type === "tertiaer" ? "Hvilket glas passer? Du forventer violet, og pH er 7. Vælg glasset, og tryk Indsend svar."
                    : "Hvilket glas passer? Du forventer brunsten i bunden, og at pH er steget tydeligt.",
                svar: GLASNAVNE, rigtig: ig, laast: laast,
                fejl: function (j) {
                    if (type === "tertiaer") return "Glas " + BOGSTAVER[j] + " er brunsort. Der er sket en oxidation, så det kan ikke være 2-methylpropan-2-ol.";
                    return "Glas " + BOGSTAVER[j] + " har pH " + mig.papir(j) + ". Sammenlign med det andet brunsorte glas: hvor er pH steget mest?";
                },
                hint: type === "tertiaer" ? ["Kig efter det glas, der stadig er violet.", "Kun ét glas har ikke skiftet farve."]
                    : ["To glas er brunsorte. Se på pH ved dem begge.", "Glasset med den højeste pH har fået flest OH⁻."],
                god: type === "tertiaer" ? "Glas " + BOGSTAVER[ig] + " er 2-methylpropan-2-ol. Nu den sekundære alkohol, propan-2-ol."
                    : "Glas " + BOGSTAVER[ig] + " er propan-2-ol. Nu den primære alkohol, propan-1-ol.",
                efter: function () { mig.kendt[ig] = NR[type]; }
            };
        }
        var a = this.afstem[type];
        if (del === "oxC") {
            var VX = [-1, 0, 1, 2, 3];
            return {
                chip: "Trin 1", felt: 2,
                tekst: "Oxidationstal. Carbonatomet med OH-gruppen har " + D.rom(a.cFra) + " i " + a.alkohol + ". Hvad har det i " + a.produkt + "?",
                svar: VX.map(D.rom), rigtig: VX.indexOf(a.cTil),
                fejl: function () {
                    return "Tæl bindingerne fra carbonatomet som på fane 1: til H −1, til O +1 og en dobbeltbinding til O +2." +
                        (a.qProd ? " O⁻ er også en binding til O." : "");
                },
                hint: ["Tegn " + a.produkt + " for dig selv med alle H. Hvilke bindinger har carbonatomet?",
                    a.qProd ? "Carbonatomet har en dobbeltbinding til O (+2), en binding til O⁻ (+1) og en binding til C (0)."
                        : "Carbonatomet har en dobbeltbinding til O (+2) og to bindinger til C (0)."],
                god: "Carbonatomet stiger fra " + D.rom(a.cFra) + " til " + D.rom(a.cTil) + ", altså " + a.stigning + ".",
                boble: D.rom(a.cFra) + " til " + D.rom(a.cTil) + ": carbonatomet stiger " + a.stigning + "."
            };
        }
        if (del === "oxMn") {
            var M = [2, 3, 4, 6];
            return {
                chip: "Trin 1", felt: 2,
                tekst: "Oxidationstal. Mangan har +VII i MnO₄⁻. Hvad har mangan i MnO₂?",
                svar: M.map(D.rom), rigtig: M.indexOf(a.mnTil),
                fejl: function () { return "Oxygen har −II, og MnO₂ har ingen ladning. Mangan skal opveje de to oxygenatomer."; },
                hint: ["Oxygen har −II, og summen af oxidationstallene er ladningen.", "To oxygenatomer giver 2 · (−II) = −IV."],
                god: "Mangan falder fra +VII til +IV, altså 3.",
                boble: "+VII til +IV: mangan falder 3."
            };
        }
        if (del === "koef") {
            return {
                chip: "Trin 2", felt: 2, indtast: true,
                tekst: "Stigning og fald. Carbonatomet stiger " + a.stigning + ", og mangan falder 3. Skriv koefficienterne foran " + a.alkohol +
                    " og MnO₄⁻ i skemaet, så den samlede stigning bliver lige så stor som det samlede fald.",
                svar: [], rigtig: null,
                fejlTal: function (x, y) {
                    if (x * a.stigning === y * 3) return "Stigning og fald er lige store med " + x + " og " + y + ", men tallene skal være så små som muligt.";
                    return "Med " + x + " og " + y + " er den samlede stigning " + x + " · " + a.stigning + " = " + x * a.stigning +
                        ", og det samlede fald " + y + " · 3 = " + y * 3 + ". De skal være lige store.";
                },
                hint: ["Den samlede stigning skal være lige så stor som det samlede fald. Tallene i pilene under skemaet regner med, mens du skriver.",
                    "Find det mindste tal, som både " + a.stigning + " og 3 går op i. Det er " + a.samlet + "."],
                boble: a.kAlk + " · " + a.stigning + " = " + a.samlet + " og " + a.kMn + " · 3 = " + a.samlet + ": stigning og fald er lige store.",
                god: ""
            };
        }
        if (del === "ladning") {
            return {
                chip: "Trin 3", felt: 2,
                tekst: "Ladning. Opløsningen ender basisk, så ladningen afstemmes med OH⁻. Hvor mange OH⁻ skal der stå til højre?",
                svar: ["1", "2", "3", "4"], rigtig: a.oh - 1,
                fejl: function () {
                    return "Ladningen til venstre er " + D.fortegn(a.ladV) + ", og til højre er den " + D.fortegn(a.ladH) +
                        (a.qProd ? " fra " + a.kAlk + " " + a.produkt : "") + ". OH⁻ skal udligne forskellen.";
                },
                hint: ["Ladningen til venstre: " + a.kMn + " · (−1) = " + D.fortegn(a.ladV) + ".",
                    "Ladningen til højre: " + (a.qProd ? a.kAlk + " " + a.produkt + " giver " + D.fortegn(a.ladH) : "0") + ". Der mangler " + a.oh +
                    " negative ladning" + (a.oh === 1 ? "" : "er") + " til højre."],
                god: "Med " + a.oh + " OH⁻ er ladningen " + D.fortegn(a.ladV) + " på begge sider.",
                boble: a.oh + " OH⁻: ladningen er " + D.fortegn(a.ladV) + " på begge sider."
            };
        }
        return {
            chip: "Trin 4", felt: 2,
            tekst: "Hydrogen. Hvor mange H₂O skal der stå til højre, for at hydrogen passer?",
            svar: ["1", "2", "3", "4"], rigtig: a.h2o - 1,
            fejl: function () { return "Tæl hydrogenatomerne på begge sider. Til venstre er der " + a.kAlk + " · " + a.hAlk + " = " + a.hV + "."; },
            hint: ["Til venstre: " + a.kAlk + " · " + a.hAlk + " = " + a.hV + " hydrogenatomer.",
                "Til højre: " + a.kAlk + " · " + a.hProd + " + " + a.oh + " = " + a.hH + ". Der mangler " + (a.hV - a.hH) + ", og hvert H₂O har 2."],
            god: "",
            boble: a.h2o + " H₂O: " + a.hV + " H og " + a.oV + " O på begge sider. Afstemt: " + a.kAlk + " " + a.alkohol + " og " + a.kMn +
                " MnO₄⁻ giver " + a.oh + " OH⁻."
        };
    };

    /* ----- Kortet ------------------------------------------------------------------ */
    P.kortData = function () {
        var mig = this, id = this.trin();
        if (id === "forsoeg") {
            if (this.forsoegT !== null) return { slags: "opgave", chip: "Forsøget", tekst: "Permanganat tilsættes, glassene varmes i vandbadet, og bundfaldet får lov at falde til bunds. Bagefter måles pH med indikatorpapir." };
            return {
                slags: "opgave", chip: "Forsøget",
                tekst: "Glas A, B og C indeholder de tre alkoholer nederst på tavlen i tilfældig rækkefølge. Tilsæt permanganat, varm glassene, og mål pH.",
                ekstra: '<div class="sk-handling"><button type="button" class="knap blaa" data-handling="forsoeg">Udfør forsøget</button></div>'
            };
        }
        var s = this.spm();
        return {
            slags: "spm", chip: s.chip, tekst: s.tekst,
            svar: s.svar.map(function (t, j) { return { t: t, valgt: mig.valgt === j, forkert: !!mig.forkert[j] || !!(s.laast && s.laast[j]) }; })
        };
    };

    P.skjulIndsend = function () { return this.trin() === "forsoeg"; };

    P.svarValg = function (j) {
        if (this.trin() === "forsoeg") return;
        var s = this.spm();
        if (this.forkert[j] || (s.laast && s.laast[j])) return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.trin() === "forsoeg") return false;
        if (this.spm().indtast) { var v = this.koefV(); return v[0] !== null && v[1] !== null; }
        return this.valgt !== null;
    };

    P.indsendTekst = function () {
        if (this.trin() !== "forsoeg" && this.spm().indtast) {
            var v = this.koefV();
            return v[0] !== null && v[1] !== null ? "Indsend svar: " + v[0] + " og " + v[1] : "Indsend svar";
        }
        if (this.valgt === null || this.trin() === "forsoeg") return "Indsend svar";
        var t = this.spm().svar[this.valgt];
        return t.length > 18 ? "Indsend svar" : "Indsend svar: " + t;
    };

    P.ingentingTekst = function () {
        if (this.trin() !== "forsoeg" && this.spm().indtast) return "Skriv et tal i begge felter i skemaet først.";
        return this.del() === "glas" ? "Vælg et glas på kortet eller på tavlen først." : "Vælg et svar på kortet først.";
    };

    /* ----- Indsend svar ------------------------------------------------------------ */
    P.indsend = function () { if (this.trin() !== "forsoeg") this.indsendSpm(false); };

    P.indsendSpm = function (vist) {
        var s = this.spm();
        this.boble = null;
        if (s.indtast) {
            var v = this.koefV(), a = this.afstem[TYPE[this.trin().charAt(0)]];
            if (v[0] !== a.kAlk || v[1] !== a.kMn) {
                this.fejl = true;
                this.fejlLinje(s.fejlTal(v[0], v[1]));
                return;
            }
        } else if (this.valgt !== s.rigtig) {
            this.forkert[this.valgt] = true;
            this.fejl = true;
            var t = s.fejl(this.valgt);
            this.valgt = null;
            this.visKort();
            this.fejlLinje(t);
            return;
        }
        if (s.efter) s.efter();
        var id = this.trin();
        if (id === "p-brint") { this.status.afstemt = true; this.gem(); }
        if (id === "p-forvent") { this.slut(vist); return; }
        /* Papirkortet (brugerens valg 3. nov. 2026, ogsaa paa denne fane): kortet
           bliver paa spoergsmaalet med svaret groent og forklaringen under det.
           Foerst naar eleven trykker Naeste spoergsmaal, kommer svaret ind paa
           tavlen og lyser groent, og det naeste spoergsmaal kommer. */
        var nr = this.valgt;
        this.koefFelt.forEach(function (e) { e.disabled = true; });
        this.groen = {
            spm: true, svarNr: s.indtast ? undefined : nr, maade: vist ? "svar" : "selv",
            tekst: s.god || s.boble || "", knap: "Næste spørgsmål →",
            naeste: function () { this.naesteSpm(id, s, vist); }
        };
        this.besked("", "");
        this.visKort();
    };

    /* Naeste spoergsmaal efter et rigtigt svar: svaret saettes ind paa tavlen og
       lyser groent et oejeblik. Forklaringen er laest paa kortet, saa boblen
       er uden tekst (stille). */
    P.naesteSpm = function (id, s, vist) {
        this.koefFelt.forEach(function (e) { e.disabled = false; });
        this.ti++;
        this.valgt = null;
        this.forkert = {};
        this.sejrT = 0;
        this.boble = { tekst: s.boble || s.god, id: id, t: 0, vist: vist, stille: true };
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
        if (this.spm && this.trin() !== "forsoeg" && this.spm().indtast) {
            var f0 = this.koefFelt[0];
            window.setTimeout(function () { try { f0.focus({ preventScroll: true }); } catch (x) { /* ingen fokus */ } }, 50);
        }
    };

    /* Det sidste glas er givet: propan-1-ol glider op i det */
    P.slut = function (vist) {
        var foerste = this.status.runder === 0, it = this.glasMed("tertiaer"), is = this.glasMed("sekundaer"), ip = this.glasMed("primaer");
        this.kendt[ip] = NR.primaer;
        this.status.runder++;
        this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
        this.gem();
        /* Hvilken alkohol der er i hvert glas, staar ved glassene; kortet siger kun det nye */
        var tekst = "Det passer med glas " + BOGSTAVER[ip] + ": mest brunsten, og pH er " + this.papir(ip) + "." +
            " 3 propan-1-ol og 4 MnO₄⁻ giver kun 1 OH⁻, så pH stiger kun lidt.";
        if (foerste) tekst += " " + D.FAERDIG.u;
        this.valgt = null;
        this.groen = { maade: vist || this.sv ? "svar" : "selv", tekst: tekst, knap: "Ny runde med nye glas →", chip: vist ? "Svaret" : "Rigtigt ✓" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        this.layout();
        NK.konfetti(this.el.skort, foerste ? 70 : 36);
    };

    P.videre = function () { this.nyRunde(); };

    /* Udfoer forsoeget: violet, vandbad, brunsort, bundfaldet falder, pH-papiret */
    P.udfoer = function () {
        if (this.trin() !== "forsoeg" || this.forsoegT !== null) return;
        this.forsoegT = 0;
        this.besked("", "");
        this.visKort();
    };

    P.efterForsoeg = function () {
        this.forsoegT = null;
        this.udfoert = true;
        this.ti++;
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
        this.besked("", "");
        this.boble = { tekst: "Farven, bundfaldet og pH står nu ved hvert glas.", id: "forsoeg", t: 0 };
    };

    /* ----- Hjaelpen ------------------------------------------------------------------ */
    P.hintNu = function () {
        if (this.groen) return [];
        if (this.trin() === "forsoeg") return this.forsoegT === null ? ["Tryk på den blå knap Udfør forsøget på kortet."] : ["Vent, til forsøget er færdigt."];
        return this.spm().hint;
    };

    P.visSvar = function () {
        /* Forsoeget er ikke et svar: knappen udfoerer det bare og koster intet */
        if (this.trin() === "forsoeg") { this.udfoer(); return; }
        this.sv = true;
        if (this.spm().indtast) {
            var a = this.afstem[TYPE[this.trin().charAt(0)]];
            this.koefFelt[0].value = a.kAlk;
            this.koefFelt[1].value = a.kMn;
        }
        this.valgt = this.spm().rigtig;
        this.indsendSpm(true);
    };

    /* ----- Klik paa tavlen: et glas kan vaelges, naar kortet spoerger om et glas ------- */
    P.glasVed = function (pt) {
        if (!this.kol || !this.baand) return -1;
        if (pt.y < this.baand.y || pt.y > this.baand.y + this.baand.h) return -1;
        for (var i = 0; i < 3; i++) if (pt.x >= this.kol[i].x && pt.x < this.kol[i].x + this.kol[i].b) return i;
        return -1;
    };

    P.overScene = function (pt) {
        if (!pt || this.groen || this.del() !== "glas") return null;
        var i = this.glasVed(pt), s = this.spm();
        return i >= 0 && !this.forkert[i] && !(s.laast && s.laast[i]) ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.del() === "glas") {
            var i = this.glasVed(pt);
            if (i >= 0) { this.svarValg(i); return; }
        }
        if (this.trin() !== "forsoeg") this.kortBlink();
    };

    /* ----- Layout ---------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
        /* Glassene oeverst, altid synlige. Arbejdsfeltet under dem */
        var bh = t.h < 470 ? 116 : Math.round(NK.klamp(t.h * 0.4, 132, 210));
        this.baand = { x: t.x + 16, y: t.y + 8, b: t.b - 32, h: bh };
        this.arb = { x: t.x + 16, y: t.y + bh + 22, b: t.b - 32, h: t.h - bh - 30 };
        var o = this.baand, cw = o.b / 3, th = NK.klamp(o.h - 30, 84, 150);
        this.kol = [0, 1, 2].map(function (i) {
            var x = o.x + i * cw, tw = th * 0.3;
            return { x: x, b: cw, tube: { x: x + cw * 0.07, y: o.y + 22, b: tw, h: th } };
        });
        this.saetAnker("glas", o.x, o.y, o.b, o.h);
        this.saetAnker("skema", this.arb.x, this.arb.y, this.arb.b, this.arb.h);
        var str = t.b + "x" + t.h;
        if (str !== this.str) { this.str = str; this.kortPos = [null, null, null]; }
    };

    /* Pladsen ved glasset til alkoholens kort */
    P.plads = function (i) {
        var kol = this.kol[i], tb = kol.tube, px = tb.x + tb.b + 16;
        return { x: px, y: tb.y + Math.min(72, tb.h - 26), b: kol.x + kol.b - 12 - px, h: 26 };
    };

    /* ----- Alkoholkortene: hvor staar de, og hvordan ser de ud? ----------------------- */
    P.kortMaal = function (n) {
        var iGlas = this.kendt.indexOf(n), a = this.arb, type = D.FORSOEG.alkoholer[n].type;
        if (iGlas >= 0) { var pl = this.plads(iGlas); pl.slags = "glas"; pl.alfa = 1; return pl; }
        var fok = this.fokus();
        if (!fok) {
            /* Forsoeget: de tre i en raekke under glassene, i den raekkefoelge de gennemgaas */
            var b = a.b / 3, j = ORDEN.indexOf(type);
            return { x: a.x + j * b + 8, y: a.y + 2, b: b - 16, h: a.h - 6, slags: "raekke", alfa: 1 };
        }
        if (type === fok) return { x: a.x, y: a.y, b: Math.min(420, a.b * 0.55), h: 30, slags: "fokus", alfa: 1 };
        /* De ventende: smaa kort til hoejre i overskriften */
        var vent = ORDEN.filter(function (t) { return t !== fok && this.kendt.indexOf(NR[t]) < 0; }, this);
        var k = vent.indexOf(type), kb = Math.min(170, a.b * 0.17);
        return { x: a.x + a.b - (vent.length - k) * (kb + 8) + 8, y: a.y, b: kb, h: 30, slags: "venter", alfa: 0.7 };
    };

    P.opdaterScene = function (dt) {
        if (this.boble) this.boble.t += dt;
        if (this.forsoegT !== null) {
            this.forsoegT += dt;
            if (this.forsoegT >= VARIGHED) this.efterForsoeg();
        }
        var f = 1 - Math.exp(-dt * 6);
        for (var n = 0; n < 3; n++) {
            var m = this.kol ? this.kortMaal(n) : null, p = this.kortPos[n];
            if (!m) continue;
            if (!p) { this.kortPos[n] = { x: m.x, y: m.y, b: m.b, h: m.h, alfa: m.alfa }; continue; }
            ["x", "y", "b", "h", "alfa"].forEach(function (e) { p[e] += (m[e] - p[e]) * f; });
        }
    };

    /* ----- Tegningen -------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle, mig = this;
        NK.Tavle.tegn(ctx, lay);
        if (!this.kol) return;
        [0, 1, 2].forEach(function (i) { mig.tegnGlas(ctx, i); });
        ctx.save();
        ctx.strokeStyle = "#dfe3e8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tv.x + 16, this.arb.y - 10);
        ctx.lineTo(tv.x + tv.b - 16, this.arb.y - 10);
        ctx.stroke();
        ctx.restore();
        if (this.fokus()) this.tegnArbejde(ctx);
        else if (this.groen) this.tegnSkemaer(ctx, this.arb);
        if (this.fokus() && this.kortPos.some(function (p, n) { return p && mig.kortMaal(n).slags === "venter"; })) {
            var forste = null;
            for (var n = 0; n < 3; n++) if (this.kortPos[n] && this.kortMaal(n).slags === "venter") { var m = this.kortMaal(n); if (!forste || m.x < forste.x) forste = m; }
            if (forste) NK.tekst(ctx, "VENTER", forste.x - 10, forste.y + 15, { font: "800 12px " + FONT, farve: "#8a93a0", justering: "right", linje: "middle" });
        }
        [0, 1, 2].forEach(function (n) { mig.tegnAlkKort(ctx, n); });
        this.placerFelter();
        this.tegnSejr(ctx, tv);
        this.visFelter = false;
    };

    /* Felterne til koefficienterne ligger oven paa de gule kasser i skemaet */
    P.placerFelter = function () {
        var mig = this, vis = this.visFelter && !this.groen && this.trin().slice(2) === "koef";
        this.koefFelt.forEach(function (e, j) {
            var r = mig.feltR && mig.feltR[j];
            if (!vis || !r) { if (!e.hidden) e.hidden = true; return; }
            if (e.hidden) e.hidden = false;
            var st = e.style, l = Math.round(r.x) + "px", t = Math.round(r.y) + "px";
            if (st.left !== l) st.left = l;
            if (st.top !== t) st.top = t;
            st.width = Math.round(r.b) + "px";
            st.height = Math.round(r.h) + "px";
            st.fontSize = Math.round(r.fs) + "px";
        });
    };

    /* Hvor boblen med det rigtige svar skal pege hen */
    P.bobleSted = function (id) {
        var d = id.slice(2), fr = this.feltRekt || [];
        if (id === "forsoeg") return { x: this.baand.x + this.baand.b / 2, y: this.baand.y + this.baand.h - 6 };
        if (d === "H" && fr[0]) return { x: fr[0].x + fr[0].b / 2, y: fr[0].y + 20 };
        if (d === "reak" && fr[1]) return { x: fr[1].x + fr[1].b / 2, y: fr[1].y + 20 };
        if (d === "forvent" && fr[2]) return { x: fr[2].x + fr[2].b / 2, y: fr[2].y + 20 };
        if (d === "glas") {
            var t = TYPE[id.charAt(0)], i = this.glasMed(t), pl = this.plads(i);
            return { x: pl.x + pl.b / 2, y: pl.y + pl.h };
        }
        var an = this.ankre || {};
        if (d === "koef") return an.pil;
        return an[d] || an.pil;
    };

    /* Boblen: det rigtige svar ved det, der lige er sat ind. Den falmer efter 7 s */
    P.tegnBoble = function (ctx) {
        var b = this.boble;
        if (!b || b.stille || b.t > 7 || this.groen || this.erSkemaBoble()) return;
        var sted = this.bobleSted(b.id);
        if (!sted) return;
        var alfa = Math.min(1, 7 - b.t, b.t / 0.25);
        var font = "700 14px " + FONT, maks = 320, ord = ("✓ " + b.tekst).split(" "), linjer = [], nu = "";
        ctx.save();
        ctx.font = font;
        ord.forEach(function (w) {
            var prov = nu ? nu + " " + w : w;
            if (ctx.measureText(prov).width > maks && nu) { linjer.push(nu); nu = w; } else nu = prov;
        });
        if (nu) linjer.push(nu);
        var bb = 0;
        linjer.forEach(function (l) { bb = Math.max(bb, ctx.measureText(l).width); });
        ctx.restore();
        var pad = 9, lh = 19, bw = bb + 2 * pad, bh = linjer.length * lh + 2 * pad - 4, tv = this.lay.tavle;
        var x = NK.klamp(sted.x - bw / 2, tv.x + 6, tv.x + tv.b - bw - 6);
        var over = sted.y - bh - 12 > tv.y + 4, y = over ? sted.y - bh - 12 : sted.y + 12;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.fillStyle = "#e6f5ec";
        ctx.strokeStyle = "#2b9a5e";
        ctx.lineWidth = 2;
        NK.rundtRekt(ctx, x, y, bw, bh, 9);
        ctx.fill();
        ctx.stroke();
        var px = NK.klamp(sted.x, x + 14, x + bw - 14);
        ctx.beginPath();
        if (over) { ctx.moveTo(px - 7, y + bh - 1); ctx.lineTo(px, y + bh + 8); ctx.lineTo(px + 7, y + bh - 1); }
        else { ctx.moveTo(px - 7, y + 1); ctx.lineTo(px, y - 8); ctx.lineTo(px + 7, y + 1); }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alfa;
        linjer.forEach(function (l, j) {
            NK.tekst(ctx, l, x + pad, y + pad + 7 + j * lh, { font: font, farve: "#1d4d33", justering: "left", linje: "middle" });
        });
        ctx.restore();
    };

    /* ----- Glassene ----------------------------------------------------------------- */

    /* Tilstanden i glas i paa tidspunktet t efter Udfoer forsoeget */
    P.glasTilstand = function (i) {
        var type = this.indhold(i).type, reag = type !== "tertiaer";
        var t = this.udfoert ? VARIGHED : (this.forsoegT === null ? -1 : this.forsoegT);
        var ud = { farve: FF.alkohol, bundfald: 0, korn: null, bad: 0, papir: 0 };
        if (t < 0) return ud;
        var a = NK.klamp(t / 0.8, 0, 1);
        ud.farve = blandHex(FF.alkohol, FF.violet, a);
        ud.bad = t > 0.8 && t < 3.0 ? Math.min(1, (t - 0.8) / 0.3, (3.0 - t) / 0.3) : 0;
        if (reag) {
            var b = NK.klamp((t - 0.8) / 2.0, 0, 1), c = NK.klamp((t - 2.8) / 3.0, 0, 1);
            ud.farve = blandHex(ud.farve, FF.brun[type], b);
            ud.farve = blandHex(ud.farve, FF.klar[type], c);
            ud.bundfald = K.bundfald(type) * c;
            if (c > 0 && c < 1) ud.korn = { tid: t - 2.8 };
        }
        ud.papir = NK.klamp((t - 5.8) / 0.6, 0, 1);
        return ud;
    };

    /* Et reagensglas med vaeske og bundfald. r er rammen om hele glasset (sprite 60 x 200) */
    P.tegnRor = function (ctx, r, til, korn) {
        var sx = r.b / 60, sy = r.h / 200;
        if (!(r.b > 6) || !(r.h > 20)) return;
        var x0 = r.x + 13 * sx + 1, x1 = r.x + 47 * sx - 1, cx = r.x + 30 * sx, cy = r.y + 172 * sy, rad = Math.max(1, 17 * sx - 1);
        var top = r.y + 92 * sy, bund = cy + rad, hoejde = bund - top;
        function vaeske() {
            ctx.beginPath();
            ctx.moveTo(x0, top);
            ctx.lineTo(x1, top);
            ctx.lineTo(x1, cy);
            ctx.arc(cx, cy, rad, 0, Math.PI);
            ctx.closePath();
        }
        ctx.save();
        vaeske();
        var g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, bland(til.farve, "#000000", 0.12));
        g.addColorStop(0.45, til.farve);
        g.addColorStop(1, bland(til.farve, "#000000", 0.12));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.clip();
        if (til.bundfald > 0) {
            var yb = bund - hoejde * til.bundfald;
            ctx.fillStyle = FF.bundfald;
            ctx.beginPath();
            ctx.moveTo(x0, yb + 2);
            ctx.quadraticCurveTo(cx, yb - 3, x1, yb + 2);
            ctx.lineTo(x1, bund + 2);
            ctx.lineTo(x0, bund + 2);
            ctx.closePath();
            ctx.fill();
        }
        if (korn && til.korn) {
            var grense = 1 - til.bundfald;
            ctx.fillStyle = FF.bundfald;
            korn.forEach(function (k) {
                var y = k.y0 + k.v * til.korn.tid;
                if (y > grense) return;
                ctx.beginPath();
                ctx.arc(x0 + 2 + k.x * (x1 - x0 - 4), top + y * hoejde, Math.max(1.2, sx * 1.6), 0, Math.PI * 2);
                ctx.fill();
            });
        }
        ctx.restore();
        if (TOM.complete && TOM.naturalWidth) ctx.drawImage(TOM, r.x, r.y, r.b, r.h);
    };

    /* Et glas: bogstavet, reagensglasset, pH-papiret, farverne og pladsen til
       alkoholens kort. Er glasset valgt paa kortet, har det en gul ramme */
    P.tegnGlas = function (ctx, i) {
        var kol = this.kol[i], tb = kol.tube, til = this.glasTilstand(i), reag = this.reagerer(i);
        if (this.del() === "glas" && this.valgt === i && !this.groen) {
            ctx.save();
            NK.rundtRekt(ctx, kol.x + 4, this.baand.y - 2, kol.b - 8, this.baand.h + 4, 12);
            ctx.fillStyle = "rgba(242, 197, 61, 0.12)";
            ctx.fill();
            ctx.strokeStyle = GUL;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }
        NK.tekst(ctx, "Glas " + BOGSTAVER[i], tb.x + tb.b / 2, tb.y - 11, { font: "800 16px " + FONT, farve: "#1d2433", justering: "center", linje: "middle" });
        if (til.bad > 0) {
            ctx.save();
            ctx.globalAlpha = til.bad * 0.5;
            ctx.fillStyle = "#9fd0f0";
            NK.rundtRekt(ctx, tb.x - 8, tb.y + tb.h * 0.48, tb.b + 16, tb.h * 0.56, 6);
            ctx.fill();
            ctx.restore();
        }
        this.tegnRor(ctx, tb, til, this.korn[i]);
        var px = tb.x + tb.b + 16, py = tb.y + 2;
        if (til.papir > 0) {
            var ph = this.papir(i);
            ctx.save();
            ctx.globalAlpha = til.papir;
            ctx.fillStyle = "#f4efe2";
            ctx.strokeStyle = "#b9c0ca";
            ctx.lineWidth = 1;
            ctx.fillRect(px, py, 16, 48);
            ctx.strokeRect(px, py, 16, 48);
            ctx.fillStyle = D.PH_FARVE[ph];
            ctx.fillRect(px + 2, py + 2, 12, 20);
            NK.tekst(ctx, "pH " + ph, px + 24, py + 12, { font: "800 18px " + FONT, farve: "#1d2433", justering: "left", linje: "middle" });
            NK.tekst(ctx, "før: violet", px + 24, py + 33, { font: "600 13px " + FONT, farve: "#5d6878", justering: "left", linje: "middle" });
            NK.tekst(ctx, "efter: " + (reag ? "brunsort bundfald" : "violet"), px + 24, py + 50, { font: "700 13px " + FONT, farve: "#1d2433", justering: "left", linje: "middle" });
            ctx.restore();
        }
        if (this.udfoert && this.kendt[i] === null) {
            var pl = this.plads(i);
            ctx.save();
            NK.rundtRekt(ctx, pl.x, pl.y, pl.b, pl.h, 13);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.strokeStyle = "#cfd5dd";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "?", pl.x + pl.b / 2, pl.y + pl.h / 2 + 0.5, { font: "700 15px " + FONT, farve: "#a3abb6", justering: "center", linje: "middle" });
        }
    };

    /* ----- Arbejdsfeltet: tre felter for den alkohol, der arbejdes med ------------------ */
    P.tegnArbejde = function (ctx) {
        var a = this.arb, type = this.fokus(), felt = this.felt(), mig = this;
        var y = a.y + 40, h = a.h - 44, gab = 26, b = a.b;
        var kort = this.liste === KORT;
        /* Bredderne: det aktive felt er bredt, de klarede smalle, de kommende smallest */
        /* Under afstemningen skal skemaet have pladsen: de andre felter bliver smalle.
           Bagefter bliver skemaet staaende ved siden af Forventet (brugerens oenske:
           man vil se paa skemaet, naar man svarer paa det naeste) */
        var afst = felt === 2 && type !== "tertiaer" && this.del() !== "reak";
        var behold = felt >= 3 && type !== "tertiaer";
        this.behold = behold;
        var bredder = [0, 1, 2].map(function (k) {
            var nr = k + 1;
            if (behold) return nr === 1 ? Math.min(150, b * 0.16) : (nr === 2 ? (b - Math.min(150, b * 0.16) - 2 * gab) * 0.62 : null);
            if (felt === 4) return null;
            if (nr < felt) return afst ? Math.min(150, b * 0.16) : Math.min(210, b * 0.24);
            if (nr > felt) return afst ? Math.min(70, b * 0.08) : Math.min(130, b * 0.15);
            return null;
        });
        var fast = bredder.reduce(function (s, x) { return s + (x || 0); }, 0), fri = bredder.filter(function (x) { return x === null; }).length;
        var rest = (b - fast - 2 * gab) / fri;
        var x = a.x, felter = [];
        bredder.forEach(function (w, k) {
            var r = { x: x, y: y, b: w === null ? rest : w, h: h };
            felter.push(r);
            x += r.b + gab;
        });
        this.feltRekt = felter;
        felter.forEach(function (r, k) {
            var nr = k + 1, tilst = felt === 4 || nr < felt || (kort && nr < 3) ? "klar" : (nr === felt ? "aktiv" : "senere");
            mig.tegnFelt(ctx, r, nr, tilst, type);
            if (k < 2) NK.tekst(ctx, "→", r.x + r.b + gab / 2, r.y + r.h / 2, { font: "800 20px " + FONT, farve: "#9aa3b0", justering: "center", linje: "middle" });
        });
        /* Glasset: glassene faar en gul stiplet ramme, og Forventet en gul kant */
        if (felt === 4) {
            var bd = this.baand, f3 = felter[2];
            ctx.save();
            ctx.strokeStyle = GUL;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            NK.rundtRekt(ctx, bd.x - 4, bd.y - 4, bd.b + 8, bd.h + 8, 14);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, f3.x, f3.y, f3.b, f3.h, 12);
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "Hvilket glas passer med det, du forventer?", bd.x + bd.b / 2, bd.y + bd.h + 2, { font: "800 13px " + FONT, farve: "#8a6200", justering: "center", linje: "middle",
                kant: true, kantFarve: "rgba(255, 255, 255, 0.95)", kantBredde: 6 });
        }
    };

    /* Et af de tre felter. tilst: "klar" (kort opsummering), "aktiv" eller "senere" */
    P.tegnFelt = function (ctx, r, nr, tilst, type) {
        var ramme = tilst === "aktiv" ? TEAL : "#cfd5dd";
        /* Det felt, der lige er udfyldt, lyser groent de foerste sekunder (i stedet
           for en linje paa kortet, hvor det naeste spoergsmaal allerede staar) */
        var lys = this.feltLyser(nr, type);
        ctx.save();
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 12);
        ctx.fillStyle = lys ? "#e9f6ee" : (tilst === "aktiv" ? "#ffffff" : (tilst === "klar" ? "#f6f8fa" : "rgba(255, 255, 255, 0.4)"));
        ctx.fill();
        if (tilst === "senere") ctx.setLineDash([6, 5]);
        ctx.strokeStyle = lys ? "#2b9a5e" : ramme;
        ctx.lineWidth = lys ? 3 : (tilst === "aktiv" ? 2.5 : 1.5);
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, r.b < 110 ? String(nr) : nr + "  " + FELTER[nr - 1].toUpperCase() + (tilst === "klar" ? "  ✓" : ""), r.x + 12, r.y + 15, {
            font: "800 12px " + FONT, farve: tilst === "aktiv" ? TEAL : (tilst === "klar" ? "#2b9a5e" : "#a3abb6"), justering: "left", linje: "middle" });
        if (tilst === "senere") return;
        var ind = { x: r.x + 8, y: r.y + 26, b: r.b - 16, h: r.h - 32 };
        /* I reaktionsfeltet for de to, der afstemmes, er den nederste linje
           pladsen til det rigtige svar, saa det staar ved skemaet og ikke paa kortet */
        var skema = nr === 2 && type !== "tertiaer" && (this.behold || (this.del() !== "reak" && this.felt() === 2));
        if (skema) {
            ind.h -= 24;
            this.tegnSvarlinje(ctx, { x: r.x + 10, y: r.y + r.h - 20, b: r.b - 20 }, type);
        }
        if (nr === 1) this.tegnMolekyle(ctx, ind, type, tilst === "aktiv");
        else if (nr === 2 && this.behold) this.tegnSkemaFaerdigt(ctx, ind, type);
        else if (nr === 2) this.tegnReaktion(ctx, ind, type, tilst === "aktiv");
        else this.tegnForventet(ctx, ind, type, tilst === "aktiv");
    };

    /* 1 Molekylet: strukturformlen med alle H. Carbonatomet med OH-gruppen har en
       ring (gul, mens kortet spoerger), og naar svaret er fundet, er dets H groenblaa */
    P.tegnMolekyle = function (ctx, k, type, aktiv) {
        var f = this.fuld[type], spurgt = aktiv && this.del() === "H";
        var tekstH = aktiv ? 0 : 20, box = { x: k.x, y: k.y, b: k.b, h: k.h - tekstH };
        var hs = {};
        if (!spurgt) f.h.forEach(function (h) { hs[h] = true; });
        function med(s, ox, oy) {
            return NK.Struktur.geometri(f.mol, { skala: s, ox: ox, oy: oy, stil: "alle", farve: "#1d2433",
                skrift: NK.klamp(s * 0.36, 10, 20), linje: NK.klamp(s * 0.05, 1.2, 2.4),
                atomFarve: function (id) { return hs[id] ? TEAL : (id === f.c && !spurgt ? TEAL : null); } });
        }
        var g0 = med(40, 0, 0), bw = (g0.x1 - g0.x0) || 1, bh = (g0.y1 - g0.y0) || 1;
        var s = Math.min(40 * (box.b - 10) / bw, 40 * (box.h - 8) / bh, 62);
        /* Er feltet for lavt til formlen (en lav skaerm), staar kun teksten */
        if (s < 9) s = 0;
        if (s > 0) {
            var g1 = med(s, 0, 0);
            var g = med(s, box.x + box.b / 2 - (g1.x0 + g1.x1) / 2, box.y + box.h / 2 - (g1.y0 + g1.y1) / 2);
            var puls = 0.5 + 0.5 * Math.sin(this.tid * 4);
            F.ring(ctx, g.P[f.c], s * (spurgt ? 0.32 + 0.03 * puls : 0.3), spurgt ? GUL : TEAL, spurgt ? GUL_FYLD : "rgba(15, 138, 138, 0.1)", spurgt ? 3.5 : 2);
            NK.Struktur.tegnGeo(ctx, g);
        }
        if (!aktiv) {
            var n = f.h.length;
            NK.tekst(ctx, { 0: "0 H: kan ikke oxideres", 1: "1 H: oxideres én gang", 2: "2 H: oxideres to gange" }[n], k.x + k.b / 2, k.y + k.h - 7, { font: "700 13px " + FONT, farve: TEAL, justering: "center", linje: "middle" });
        }
    };

    /* 2 Reaktionen: hvad dannes, og (for de to, der oxideres) afstemningen */
    P.tegnReaktion = function (ctx, k, type, aktiv) {
        var navn = D.FORSOEG.alkoholer[NR[type]].navn, del = this.del();
        if (!aktiv) {
            var linjer = type === "tertiaer" ? ["ingen reaktion", "permanganatet bruges ikke"] : ["→ " + this.afstem[type].produkt,
                this.afstem[type].oh + " OH⁻ fra " + this.afstem[type].kAlk + " molekyler"];
            linjer.forEach(function (l, j) {
                NK.tekst(ctx, l, k.x + k.b / 2, k.y + k.h / 2 + (j - (linjer.length - 1) / 2) * 22, {
                    font: (j === 0 ? "800 15px " : "700 13px ") + FONT, farve: j === 0 ? "#1d2433" : FA.koef, justering: "center", linje: "middle" });
            });
            return;
        }
        if (del === "reak" || type === "tertiaer") {
            /* Alkoholen + MnO₄⁻ → ? (eller "ingen reaktion") */
            var fs = NK.klamp(k.b / 22, 15, 24), y = k.y + k.h / 2;
            var venstre = navn + " + MnO₄⁻", spurgt = del === "reak";
            ctx.save();
            ctx.font = "700 " + fs + "px " + FONT;
            var wv = ctx.measureText(venstre).width;
            ctx.restore();
            var hoejre = spurgt ? "" : "ingen reaktion", pil = fs * 2.6;
            ctx.save();
            ctx.font = "700 " + fs + "px " + FONT;
            var wh = spurgt ? fs * 1.2 : ctx.measureText(hoejre).width;
            ctx.restore();
            var x = k.x + (k.b - (wv + pil + wh + fs)) / 2;
            NK.tekst(ctx, venstre, x, y, { font: "700 " + fs + "px " + FONT, farve: "#1d2433", justering: "left", linje: "middle" });
            var ax = x + wv + fs * 0.5;
            ctx.save();
            ctx.strokeStyle = ctx.fillStyle = "#1d2433";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(ax, y);
            ctx.lineTo(ax + pil - 10, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ax + pil, y);
            ctx.lineTo(ax + pil - 12, y - 6);
            ctx.lineTo(ax + pil - 12, y + 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            if (spurgt) this.spoergsmaal(ctx, ax + pil + fs * 0.5 + wh / 2, y, fs);
            else NK.tekst(ctx, hoejre, ax + pil + fs * 0.5, y, { font: "800 " + fs + "px " + FONT, farve: "#c8402f", justering: "left", linje: "middle" });
            return;
        }
        this.tegnAfstem(ctx, type, k);
    };

    /* Er boblen fra et trin i afstemningen? Saa staar den som en linje i skemaets felt */
    P.erSkemaBoble = function () {
        var b = this.boble;
        return !!b && b.t < 7 && DELE.indexOf(b.id.slice(2)) >= 0;
    };

    /* Den groenne linje nederst i reaktionsfeltet med det rigtige svar */
    P.tegnSvarlinje = function (ctx, r, type) {
        var b = this.boble;
        if (!this.erSkemaBoble() || b.stille || TYPE[b.id.charAt(0)] !== type) return;
        var alfa = Math.min(1, 7 - b.t, b.t / 0.25), tekst = "✓ " + b.tekst;
        ctx.save();
        ctx.globalAlpha = alfa;
        var fsz = NK.passendeSkrift(ctx, tekst, r.b - 16, 14, 10.5, 700);
        ctx.font = "700 " + fsz + "px " + FONT;
        var w = Math.min(r.b, ctx.measureText(tekst).width + 18);
        ctx.fillStyle = "#e6f5ec";
        ctx.strokeStyle = "#2b9a5e";
        ctx.lineWidth = 1.5;
        NK.rundtRekt(ctx, r.x + (r.b - w) / 2, r.y - 11, w, 22, 11);
        ctx.fill();
        ctx.stroke();
        NK.tekst(ctx, tekst, r.x + r.b / 2, r.y, { font: "700 " + fsz + "px " + FONT, farve: "#1d4d33", justering: "center", linje: "middle" });
        ctx.restore();
    };

    /* Lyser feltet nr (1 Molekylet, 2 Reaktionen, 3 Forventet), fordi det lige er udfyldt? */
    P.feltLyser = function (nr, type) {
        var b = this.boble;
        if (!b || b.t > 4 || TYPE[b.id.charAt(0)] !== type) return false;
        var d = b.id.slice(2);
        return (nr === 1 && d === "H") || (nr === 2 && d === "reak") || (nr === 3 && d === "forvent");
    };

    /* Det, der lige er sat ind i skemaet, lyser groent de foerste sekunder */
    P.lyser = function () { return this.erSkemaBoble() && this.boble.t < 4; };

    /* Det afstemte skema, mens eleven forventer og finder glasset. For den
       primaere staar propan-2-ol nedenunder til sammenligning */
    P.tegnSkemaFaerdigt = function (ctx, k, type) {
        var boks = k;
        if (type === "primaer") {
            boks = { x: k.x, y: k.y, b: k.b, h: k.h - 30 };
            var s2 = this.afstem.sekundaer;
            NK.tekst(ctx, "Til sammenligning: " + s2.kAlk + " propan-2-ol og " + s2.kMn + " MnO₄⁻ giver " + s2.kMn + " MnO₂ og " + s2.oh + " OH⁻",
                k.x + k.b / 2, k.y + k.h - 10, { font: "700 13px " + FONT, farve: "#5d6878", justering: "center", linje: "middle" });
        }
        this.tegnAfstem(ctx, type, boks);
    };

    /* 3 Forventet: et lille glas, som det skulle se ud, og pH */
    P.tegnForventet = function (ctx, k, type, aktiv) {
        var spurgt = aktiv && this.del() === "forvent";
        var th = Math.min(k.h - 10, 110), tw = th * 0.3, rx = k.x + Math.max(10, k.b * 0.12), ry = k.y + (k.h - th) / 2;
        if (spurgt) {
            this.tegnRor(ctx, { x: rx, y: ry, b: tw, h: th }, { farve: "#f4f6f8", bundfald: 0 }, null);
            this.spoergsmaal(ctx, rx + tw + Math.min(60, (k.b - tw) / 2), k.y + k.h / 2, 26);
            return;
        }
        var til = type === "tertiaer" ? { farve: FF.violet, bundfald: 0 } : { farve: FF.klar[type], bundfald: K.bundfald(type) };
        this.tegnRor(ctx, { x: rx, y: ry, b: tw, h: th }, til, null);
        var linjer = { tertiaer: ["violet", "pH 7"], sekundaer: ["brunsten", "pH stiger tydeligt"], primaer: ["mere brunsten", "pH stiger kun lidt"] }[type];
        var tx = rx + tw + 12;
        linjer.forEach(function (l, j) {
            NK.tekst(ctx, l, tx, k.y + k.h / 2 + (j - 0.5) * 20, { font: (j === 0 ? "800 14px " : "700 13px ") + FONT, farve: "#1d2433", justering: "left", linje: "middle" });
        });
    };

    /* Et alkoholkort. Stort (forsoeget): formel, navn og type. Overskrift:
       "Den tertiaere alkohol: ...". Venter: nedtonet navn. Ved glasset: navnet */
    P.tegnAlkKort = function (ctx, n) {
        var p = this.kortPos[n];
        if (!p) return;
        var m = this.kortMaal(n), a = D.FORSOEG.alkoholer[n];
        var spurgt = !this.groen && this.del() === "glas" && this.spm().kort === n;
        var ramme = "#cfd5dd", fyld = "#ffffff", bredde = 1.5, streg = false;
        if (m.slags === "fokus") { ramme = TEAL; fyld = "rgba(15, 138, 138, 0.1)"; bredde = 2; }
        else if (m.slags === "venter") { streg = true; }
        else if (m.slags === "glas") { ramme = TEAL; fyld = "#e3f1f1"; bredde = 2; }
        if (spurgt) { ramme = GUL; fyld = "#fbf1d2"; bredde = 3; }
        var bo = this.boble;
        if (m.slags === "glas" && bo && bo.t < 4 && bo.id.slice(2) === "glas" && NR[TYPE[bo.id.charAt(0)]] === n) { ramme = "#2b9a5e"; fyld = "#d6f0df"; bredde = 3.5; }
        ctx.save();
        ctx.globalAlpha = p.alfa;
        NK.rundtRekt(ctx, p.x, p.y, p.b, p.h, Math.min(12, p.h / 2));
        ctx.fillStyle = fyld;
        ctx.fill();
        if (streg) ctx.setLineDash([6, 4]);
        ctx.strokeStyle = ramme;
        ctx.lineWidth = bredde;
        ctx.stroke();
        ctx.setLineDash([]);
        if (p.h >= 90) {
            var kasse = { x: p.x + 8, y: p.y + 6, b: p.b - 16, h: p.h - 50 };
            var r = F.iKasse(this.alk[n].mol, kasse, { maks: 42 });
            NK.Struktur.tegnGeo(ctx, r.geo);
            NK.tekst(ctx, a.navn, p.x + p.b / 2, p.y + p.h - 32, { font: "700 15px " + FONT, farve: "#1d2433", justering: "center", linje: "middle" });
            NK.tekst(ctx, D.TYPER[a.type].navn + " alkohol", p.x + p.b / 2, p.y + p.h - 13, { font: "700 13px " + FONT, farve: TEAL, justering: "center", linje: "middle" });
        } else if (m.slags === "fokus") {
            var tekst = "Den " + D.TYPER[a.type].navn.replace("ær", "ære") + " alkohol: " + a.navn;
            NK.tekst(ctx, tekst, p.x + 14, p.y + p.h / 2, { font: "800 15px " + FONT, farve: "#0b5f5f", justering: "left", linje: "middle" });
        } else {
            var fsz = NK.passendeSkrift(ctx, a.navn, p.b - 14, 14, 10, 700);
            NK.tekst(ctx, a.navn, p.x + p.b / 2, p.y + p.h / 2 + 0.5, { font: "700 " + fsz + "px " + FONT, farve: m.slags === "venter" ? "#5d6878" : "#0b5f5f", justering: "center", linje: "middle" });
        }
        ctx.restore();
    };

    /* Hvor langt er afstemningen for type kommet med del? "kendt", "spurgt" eller "skjult" */
    P.status3 = function (type, del) {
        var idx = this.liste.indexOf(type.charAt(0) + "-" + del);
        if (idx < 0 || this.liste === KORT) return "kendt";
        if (idx < this.ti) return "kendt";
        return idx === this.ti ? "spurgt" : "skjult";
    };

    /* Afstemningen paa tavlen som i C-bogens figurer: oxidationstallene over
       atomerne, koefficienterne foran stofferne, og to pile under skemaet med
       stigningen (orange) og faldet (blaat). Det, kortet spoerger om, er et
       gult "?". Det, der lige er fundet, har en groenblaa ramme. */
    P.tegnAfstem = function (ctx, type, k) {
        var mig = this, a = this.afstem[type], st = {};
        DELE.forEach(function (d) { st[d] = mig.status3(type, d); });
        var nyt = this.liste[this.ti - 1] || "";
        function erNyt(d) { return nyt === type.charAt(0) + "-" + d; }

        /* Stofferne i skemaet */
        var koef = st.koef === "skjult" ? null : (st.koef === "spurgt" ? "?" : "tal");
        var tv = this.koefV();
        function spejl(j) { return tv[j] !== null ? { spejl: tv[j] } : "spejl"; }
        var dele = [
            { mol: a.alk.mol, c: a.cA, k: koef === "tal" ? a.kAlk : (koef === "?" ? "felt0" : koef), nyK: erNyt("koef") },
            { t: "+" },
            { tekst: "MnO₄⁻", mn: true, k: koef === "tal" ? a.kMn : (koef === "?" ? "felt1" : koef), nyK: erNyt("koef") },
            { pil: true },
            { mol: a.prod.mol, c: a.cP, k: koef === "tal" ? a.kAlk : (koef === "?" ? spejl(0) : koef), nyK: erNyt("koef") },
            { t: "+" },
            { tekst: "MnO₂", mn: true, k: koef === "tal" ? a.kMn : (koef === "?" ? spejl(1) : koef), nyK: erNyt("koef") }
        ];
        this.feltR = this.feltR || [null, null];
        this.visFelter = koef === "?";
        if (st.ladning !== "skjult") dele.push({ t: "+" }, { tekst: "OH⁻", k: st.ladning === "spurgt" ? "?" : a.oh, nyK: erNyt("ladning"), ny: erNyt("ladning") || st.ladning === "spurgt" });
        if (st.brint !== "skjult") dele.push({ t: "+" }, { tekst: "H₂O", k: st.brint === "spurgt" ? "?" : a.h2o, nyK: erNyt("brint"), ny: erNyt("brint") || st.brint === "spurgt" });

        /* Skriften og zigzaggen saa store, at skemaet passer i bredden og hoejden */
        /* Alle afstande foelger skriften, saa skemaet kan skaleres helt ned */
        var visLad = st.ladning !== "skjult";
        var fs = NK.klamp(k.b / 34, 12, 26), maal, ekstra = (st.brint === "kendt" ? 1.4 : 0) + (visLad ? 1.4 : 0);
        for (var n = 0; n < 10; n++) {
            maal = this.maalSkema(ctx, dele, fs);
            var hoejde = maal.h + fs * (1.3 + 0.4 + 3.0 + 1.1 + ekstra);
            if (maal.b <= k.b - 12 && hoejde <= k.h) break;
            fs *= Math.min(0.95, (k.b - 12) / maal.b, k.h / hoejde);
        }
        var x = k.x + (k.b - maal.b) / 2, yOx = k.y + fs * 0.55, yF = k.y + fs * 1.3 + maal.h / 2;
        var pos = this.tegnSkemaDele(ctx, dele, x, yF, fs, maal);

        /* Oxidationstallene over atomerne */
        var fsOx = Math.round(fs * 0.8);
        function ox(px, tekst, farve, spurgt) {
            if (spurgt) mig.spoergsmaal(ctx, px, yOx, fsOx);
            else NK.tekst(ctx, tekst, px, yOx, { font: "800 " + fsOx + "px " + FONT, farve: farve, justering: "center", linje: "middle" });
        }
        ox(pos[0].cx, D.rom(a.cFra), FA.ox, false);
        ox(pos[4].cx, D.rom(a.cTil), FA.ox, st.oxC === "spurgt");
        if (this.lyser() && erNyt("oxC")) F.ring(ctx, { x: pos[4].cx, y: yOx }, fsOx * 1.1, "#2b9a5e", "rgba(43, 154, 94, 0.12)", 2.5);
        if (st.oxMn !== "skjult") {
            ox(pos[2].cx, D.rom(a.mnFra), FA.red, false);
            ox(pos[6].cx, D.rom(a.mnTil), FA.red, st.oxMn === "spurgt");
            if (this.lyser() && erNyt("oxMn")) F.ring(ctx, { x: pos[6].cx, y: yOx }, fsOx * 1.1, "#2b9a5e", "rgba(43, 154, 94, 0.12)", 2.5);
        }

        /* Pilene under skemaet: stigning og fald */
        var yB = yF + maal.h / 2 + fs * 0.4, kendtK = st.koef === "kendt";
        /* Mens koefficienterne skrives, regner pilene med paa det, der staar i felterne */
        var kv = st.koef === "spurgt" ? this.koefV() : [kendtK ? a.kAlk : null, kendtK ? a.kMn : null];
        this.ankre = { pil: { x: pos[3].cx, y: yB + fs * 1.0 }, oxC: { x: pos[4].cx, y: yOx }, oxMn: { x: pos[6].cx, y: yOx } };
        if (pos[8]) this.ankre.ladning = { x: pos[8].cx, y: yF - fs * 0.8 };
        if (pos[10]) this.ankre.brint = { x: pos[10].cx, y: yF - fs * 0.8 };
        if (st.oxC === "kendt") {
            /* Etiketten staar mellem den blaa lodrette streg fra MnO₄⁻ og pilen op mod produktet */
            /* Stigning og fald staar lige under reaktionspilen, som i C-bogens figurer */
            this.klamme(ctx, pos[0], pos[4], yB + fs * 1.0, FA.ox, (kv[0] ? kv[0] + " " : "") + "↑ " + a.stigning + (kv[0] ? " = " + kv[0] * a.stigning : ""), "oxidation", fs,
                pos[3].cx);
        }
        if (st.oxMn === "kendt") {
            this.klamme(ctx, pos[2], pos[6], yB + fs * 3.0, FA.red, (kv[1] ? kv[1] + " " : "") + "↓ 3" + (kv[1] ? " = " + kv[1] * 3 : ""), "reduktion", fs, pos[3].cx);
        }
        /* Trin 3: ladningen paa hver side, foer der afstemmes med OH⁻ (som i
           brugerens journal); naar OH⁻ er fundet, er den ens */
        var yNy = yB + fs * 4.6;
        if (visLad) {
            var midtV = (pos[0].cx + pos[2].cx) / 2, midtH = (pos[4].cx + pos[pos.length - 1].cx) / 2;
            var hoejreLad = st.ladning === "kendt" ? a.ladV : a.ladH;
            var fl = { font: "800 " + Math.round(fs * 0.72) + "px " + FONT, farve: "#5d6878", justering: "center", linje: "middle" };
            NK.tekst(ctx, "ladning " + D.fortegn(a.ladV), midtV, yNy, fl);
            NK.tekst(ctx, "ladning " + D.fortegn(hoejreLad) + (st.ladning === "kendt" ? "" : " før OH⁻"), midtH, yNy, fl);
            yNy += fs * 1.4;
        }
        /* Trin 5: oxygen som tjek */
        if (st.brint === "kendt") {
            NK.tekst(ctx, "Tjek: " + a.oV + " oxygenatomer til venstre og " + a.oH + " til højre ✓", k.x + k.b / 2, yNy, {
                font: "700 " + Math.round(fs * 0.72) + "px " + FONT, farve: FA.koef, justering: "center", linje: "middle" });
        }
    };

    /* Bredden af hver del af skemaet og hoejden af formlerne */
    P.maalSkema = function (ctx, dele, fs) {
        var b = 0, h = fs * 1.4, sz = fs * 1.75;
        ctx.save();
        dele.forEach(function (d) {
            var w = 0;
            if (d.mol) {
                d.geo = NK.Struktur.geometri(d.mol, { skala: sz, ox: 0, oy: 0, stil: "zigzag", farve: "#1d2433", skrift: fs * 0.82, linje: NK.klamp(fs * 0.11, 1.6, 2.8) });
                w = d.geo.x1 - d.geo.x0;
                h = Math.max(h, d.geo.y1 - d.geo.y0);
            } else if (d.pil) w = fs * 2.4;
            else {
                ctx.font = "700 " + fs + "px " + FONT;
                w = ctx.measureText(d.tekst || d.t).width;
                if (d.t) w += fs * 0.5;
            }
            d.kb = d.k !== null && d.k !== undefined && !d.t && !d.pil ? (d.k === 1 && !d.nyK ? 0 : fs * 1.4) : 0;
            d.w = w + d.kb;
            b += d.w + fs * 0.3;
        });
        ctx.restore();
        return { b: b, h: h, sz: sz };
    };

    /* Tegner delene fra x og giver for hver del x for atomet, der skifter
       oxidationstal, og bunden af formlen (hvor pilen under skemaet begynder) */
    P.tegnSkemaDele = function (ctx, dele, x, yF, fs, maal) {
        var mig = this, pos = [];
        dele.forEach(function (d) {
            var p = { cx: x + d.kb + (d.w - d.kb) / 2, bund: yF + fs * 0.6 };
            /* Koefficienten */
            if (d.kb) {
                var kx = x + d.kb / 2 - fs * 0.08;
                if (d.k === "?") mig.spoergsmaal(ctx, kx, yF, fs);
                else if (d.k === "felt0" || d.k === "felt1") {
                    /* Et gult felt, som eleven skriver i (input-feltet ligger oven paa) */
                    var fb = fs * 1.25, fh = fs * 1.45, j = d.k === "felt0" ? 0 : 1;
                    ctx.save();
                    NK.rundtRekt(ctx, kx - fb / 2, yF - fh / 2, fb, fh, 6);
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();
                    ctx.strokeStyle = GUL;
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                    ctx.restore();
                    mig.feltR[j] = { x: kx - fb / 2, y: yF - fh / 2, b: fb, h: fh, fs: fs };
                } else if (d.k === "spejl" || (d.k && d.k.spejl)) {
                    /* Produktets koefficient foelger udgangsstoffets: samme atomer paa begge sider */
                    NK.tekst(ctx, d.k.spejl ? String(d.k.spejl) : "·", kx, yF, { font: "800 " + fs + "px " + FONT, farve: d.k.spejl ? FA.koef : "#b9c0ca", justering: "center", linje: "middle" });
                } else {
                    if (d.nyK) {
                        var lys = mig.lyser();
                        ctx.save();
                        NK.rundtRekt(ctx, kx - fs * 0.45, yF - fs * 0.72, fs * 0.9, fs * 1.44, 6);
                        ctx.fillStyle = lys ? "rgba(43, 154, 94, 0.2)" : "rgba(15, 118, 110, 0.12)";
                        ctx.fill();
                        ctx.strokeStyle = lys ? "#2b9a5e" : FA.koef;
                        ctx.lineWidth = lys ? 2.8 : 1.8;
                        ctx.stroke();
                        ctx.restore();
                    }
                    NK.tekst(ctx, String(d.k), kx, yF, { font: "800 " + fs + "px " + FONT, farve: FA.koef, justering: "center", linje: "middle" });
                }
            }
            var x0 = x + d.kb;
            if (d.mol) {
                var g = NK.Struktur.geometri(d.mol, {
                    skala: maal.sz, ox: x0 - d.geo.x0, oy: yF - (d.geo.y0 + d.geo.y1) / 2, stil: "zigzag", farve: "#1d2433",
                    skrift: fs * 0.82, linje: NK.klamp(fs * 0.11, 1.6, 2.8)
                });
                var pc = g.P[d.c];
                F.ring(ctx, pc, maal.sz * 0.24, TEAL, "rgba(15, 138, 138, 0.12)", 2);
                NK.Struktur.tegnGeo(ctx, g);
                p.cx = pc.x;
                p.bund = yF + (d.geo.y1 - d.geo.y0) / 2;
            } else if (d.pil) {
                ctx.save();
                ctx.strokeStyle = ctx.fillStyle = "#1d2433";
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(x0 + fs * 0.3, yF);
                ctx.lineTo(x0 + d.w - fs * 0.6, yF);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x0 + d.w - fs * 0.25, yF);
                ctx.lineTo(x0 + d.w - fs * 0.75, yF - fs * 0.3);
                ctx.lineTo(x0 + d.w - fs * 0.75, yF + fs * 0.3);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else if (d.t) {
                NK.tekst(ctx, d.t, x0 + d.w / 2, yF, { font: "600 " + fs + "px " + FONT, farve: "#5d6878", justering: "center", linje: "middle" });
            } else {
                ctx.save();
                ctx.font = "700 " + fs + "px " + FONT;
                var tw = ctx.measureText(d.tekst).width, mnB = ctx.measureText("Mn").width;
                ctx.restore();
                if (d.ny) {
                    ctx.save();
                    NK.rundtRekt(ctx, x0 - 4, yF - fs * 0.78, tw + 8, fs * 1.56, 6);
                    ctx.strokeStyle = FA.koef;
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([4, 3]);
                    ctx.stroke();
                    ctx.restore();
                }
                NK.tekst(ctx, d.tekst, x0, yF, { font: "700 " + fs + "px " + FONT, farve: "#1d2433", justering: "left", linje: "middle" });
                if (d.mn) p.cx = x0 + mnB / 2;
            }
            pos.push(p);
            x += d.w + fs * 0.3;
        });
        return pos;
    };

    /* Et gult spoergsmaalstegn: det, kortet spoerger om */
    P.spoergsmaal = function (ctx, x, y, fs) {
        var b = fs * 1.1, h = fs * 1.35;
        ctx.save();
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 6);
        ctx.fillStyle = GUL_FYLD;
        ctx.fill();
        ctx.strokeStyle = GUL;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "?", x, y, { font: "800 " + fs + "px " + FONT, farve: "#8a6200", justering: "center", linje: "middle" });
    };

    /* En pil under skemaet fra atomet i et udgangsstof til samme atom i produktet */
    P.klamme = function (ctx, fra, til, y, farve, tekst, navn, fs, etiketX) {
        var x1 = fra.cx, x2 = til.cx;
        ctx.save();
        ctx.strokeStyle = ctx.fillStyle = farve;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x1, fra.bund + 4);
        ctx.lineTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.lineTo(x2, til.bund + 13);
        ctx.stroke();
        var sp = Math.min(6, fs * 0.35);
        ctx.beginPath();
        ctx.moveTo(x2, til.bund + 3);
        ctx.lineTo(x2 - sp, til.bund + 3 + sp * 1.8);
        ctx.lineTo(x2 + sp, til.bund + 3 + sp * 1.8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        var mx = etiketX !== undefined ? etiketX : (x1 + x2) / 2, fl = Math.round(fs * 0.8);
        /* En hvid plade bag tallet, saa stregen ikke skinner igennem */
        ctx.save();
        ctx.font = "800 " + fl + "px " + FONT;
        var tb = ctx.measureText(tekst).width + fl * 0.8;
        ctx.fillStyle = "#ffffff";
        NK.rundtRekt(ctx, mx - tb / 2, y - fl * 0.7, tb, fl * 1.4, 5);
        ctx.fill();
        ctx.restore();
        NK.tekst(ctx, tekst, mx, y, { font: "800 " + fl + "px " + FONT, farve: farve, justering: "center", linje: "middle" });
        NK.tekst(ctx, navn, mx, y + fl * 1.0, { font: "700 " + Math.round(fl * 0.72) + "px " + FONT, farve: farve, justering: "center", linje: "middle" });
    };

    /* De to afstemte skemaer, naar alle tre glas er fundet */
    P.tegnSkemaer = function (ctx, k) {
        var mig = this, fs = Math.round(NK.klamp((k.b - 180) / 46, 12, 19)), rh = Math.min(70, (k.h - 10) / 2);
        var y0 = k.y + k.h / 2 - rh / 2;
        ["sekundaer", "primaer"].forEach(function (type, n) {
            var a = mig.afstem[type], y = y0 + n * rh;
            NK.tekst(ctx, D.TYPER[type].Navn + " alkohol", k.x + 8, y, { font: "700 15px " + FONT, farve: TEAL, justering: "left", linje: "middle" });
            var tekst = a.kAlk + " " + a.alkohol + " + " + a.kMn + " MnO₄⁻  →  " + a.kAlk + " " + a.produkt + " + " + a.kMn + " MnO₂ + ";
            var oh = (a.oh === 1 ? "" : a.oh + " ") + "OH⁻", rest = " + " + a.h2o + " H₂O";
            ctx.save();
            ctx.font = "600 " + fs + "px " + FONT;
            var w1 = ctx.measureText(tekst).width, w2 = ctx.measureText(oh).width, w3 = ctx.measureText(rest).width;
            ctx.restore();
            var x = k.x + 170 + Math.max(0, (k.b - 170 - (w1 + w2 + w3)) / 2);
            NK.tekst(ctx, tekst, x, y, { font: "600 " + fs + "px " + FONT, farve: "#1d2433", justering: "left", linje: "middle" });
            NK.tekst(ctx, oh, x + w1, y, { font: "800 " + fs + "px " + FONT, farve: FA.koef, justering: "left", linje: "middle" });
            NK.tekst(ctx, rest, x + w1 + w2, y, { font: "600 " + fs + "px " + FONT, farve: "#1d2433", justering: "left", linje: "middle" });
            NK.tekst(ctx, a.kAlk + " " + a.alkohol + " og " + a.kMn + " MnO₄⁻ giver " + a.oh + " OH⁻", x + w1 + w2 / 2, y + fs * 1.15, {
                font: "800 " + Math.round(fs * 0.78) + "px " + FONT, farve: FA.koef, justering: "center", linje: "middle" });
        });
    };

    NK.SimForsoeg = SimForsoeg;
}());
