/* =====================================================================
   data.js - grundstofferne, formlerne, hjaelpen og Kemichaels replikker

   Alt, der kan staa som data, staar her: de 36 grundstoffer med navn,
   plads, proeve og en linje om, hvor man moeder dem, de 12 formler og
   det, Kemichael siger. Elektronstrukturen og atomtallene i formlerne
   regnes ud (D.skaller og D.taelling), saa de aldrig kan komme til at
   sige noget andet end resten af animationen.

   Skalmodellen er C-niveauets: 1. skal hoejst 2, 2. skal hoejst 8, den
   yderste skal hoejst 8. Fra scandium (21) fyldes 3. skal op til 18.
   Overgangsmetallernes elektronstruktur spoerges der ikke om.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Grundstofferne ------------------------------------------------
       z, symbol, navn, andre navne, der godkendes, periode, soejle (1-18),
       slags (m metal, i ikke-metal, h halvmetal, a aedelgas), den halvdel
       af etiketten, der mangler, proeven og linjen om stoffet.

       Proeven: beholder ampul (gas eller vaeske i en lukket ampul; en
       farveloes gas er klar), olie (metal i olie) eller kube (fast stof i en
       akrylkube med formen klump, blok, krystal, pulver, baand eller
       draabe) og farven. */
    var G = [
        [1, "H", "hydrogen", ["brint"], 1, 1, "i", "navn", { b: "ampul", fyld: "klar", farve: "#ffffff" },
            "Solen består mest af hydrogen."],
        [2, "He", "helium", [], 1, 18, "a", "navn", { b: "ampul", fyld: "klar", farve: "#ffffff" },
            "I balloner. Lettere end luft, og den brænder ikke."],
        [3, "Li", "lithium", ["litium"], 2, 1, "m", "navn", { b: "olie", farve: "#c9ccd1" },
            "I batterierne i telefoner og elbiler."],
        [4, "Be", "beryllium", [], 2, 2, "m", "navn", { b: "kube", form: "blok", farve: "#a2a7ae" },
            "Let og stift. Spejlene i James Webb-teleskopet er af beryllium."],
        [5, "B", "bor", [], 2, 13, "h", "navn", { b: "kube", form: "krystal", farve: "#4a3d35" },
            "I ildfast glas til ovnen og i borax."],
        [6, "C", "carbon", ["kulstof"], 2, 14, "i", "navn", { b: "kube", form: "klump", farve: "#26272b" },
            "Grafit i blyanter. Diamant er også carbon."],
        [7, "N", "nitrogen", ["kvælstof"], 2, 15, "i", "navn", { b: "ampul", fyld: "klar", farve: "#ffffff" },
            "78 % af luften er dinitrogen."],
        [8, "O", "oxygen", ["ilt"], 2, 16, "i", "symbol", { b: "ampul", fyld: "klar", farve: "#ffffff" },
            "21 % af luften er dioxygen. Det er den del, vi ånder for."],
        [9, "F", "fluor", [], 2, 17, "i", "navn", { b: "ampul", fyld: "gas", farve: "#efe39a" },
            "Fluorid i tandpasta beskytter tænderne."],
        [10, "Ne", "neon", [], 2, 18, "a", "navn", { b: "ampul", fyld: "klar", farve: "#ffffff" },
            "Lyser rødorange i neonskilte."],
        [11, "Na", "natrium", [], 3, 1, "m", "symbol", { b: "olie", farve: "#d9dbde" },
            "I køkkensalt. Metallet ligger i olie, for det reagerer med vand."],
        [12, "Mg", "magnesium", [], 3, 2, "m", "symbol", { b: "kube", form: "baand", farve: "#b9bdc3" },
            "Brænder med skarpt hvidt lys. I fyrværkeri."],
        [13, "Al", "aluminium", [], 3, 13, "m", "symbol", { b: "kube", form: "blok", farve: "#cdd2d8" },
            "Sodavandsdåser og køkkenfolie."],
        [14, "Si", "silicium", [], 3, 14, "h", "navn", { b: "kube", form: "krystal", farve: "#6d7d93" },
            "I sand, glas og computerchips."],
        [15, "P", "phosphor", ["fosfor"], 3, 15, "i", "navn", { b: "kube", form: "pulver", farve: "#9e3527" },
            "Rødt phosphor sidder på siden af tændstikæsken."],
        [16, "S", "svovl", [], 3, 16, "i", "symbol", { b: "kube", form: "krystal", farve: "#e6cf35" },
            "Gult og lugtfrit. Rådne æg lugter af hydrogensulfid."],
        [17, "Cl", "chlor", ["klor"], 3, 17, "i", "symbol", { b: "ampul", fyld: "gas", farve: "#c6de58" },
            "Giftig gulgrøn gas. Holder vandet i svømmehaller rent."],
        [18, "Ar", "argon", [], 3, 18, "a", "navn", { b: "ampul", fyld: "klar", farve: "#ffffff" },
            "Knap 1 % af luften er argon."],
        [19, "K", "kalium", [], 4, 1, "m", "symbol", { b: "olie", farve: "#c7cbd1" },
            "I bananer og gødning. Metallet reagerer voldsomt med vand."],
        [20, "Ca", "calcium", [], 4, 2, "m", "symbol", { b: "kube", form: "klump", farve: "#d3cfc2" },
            "I knogler, tænder og kridt."],
        [21, "Sc", "scandium", [], 4, 3, "m", "symbol", { b: "kube", form: "klump", farve: "#c5c8cb" },
            "Gør aluminium stærkere, fx i cykelstel."],
        [22, "Ti", "titan", ["titanium"], 4, 4, "m", "navn", { b: "kube", form: "blok", farve: "#8e959d" },
            "Stærkt og let. I hofteproteser."],
        [23, "V", "vanadium", [], 4, 5, "m", "symbol", { b: "kube", form: "klump", farve: "#a2a7ad" },
            "Står der Cr-V på en skruenøgle, er der chrom og vanadium i stålet."],
        [24, "Cr", "chrom", ["krom"], 4, 6, "m", "navn", { b: "kube", form: "blok", farve: "#dfe4ea" },
            "Det blanke lag på forkromede vandhaner."],
        [25, "Mn", "mangan", [], 4, 7, "m", "symbol", { b: "kube", form: "klump", farve: "#a8a399" },
            "Gør stål hårdt. Der er også mangan i almindelige batterier."],
        [26, "Fe", "jern", [], 4, 8, "m", "symbol", { b: "kube", form: "klump", farve: "#7a7e85" },
            "Det mest brugte metal. I stål og i blodet."],
        [27, "Co", "cobalt", ["kobolt"], 4, 9, "m", "symbol", { b: "kube", form: "klump", farve: "#8c95a4" },
            "Giver den dybe koboltblå farve i glas."],
        [28, "Ni", "nikkel", [], 4, 10, "m", "navn", { b: "kube", form: "klump", farve: "#bdb7ab" },
            "I mønter og rustfrit stål. Mange får allergi af nikkel i øreringe."],
        [29, "Cu", "kobber", [], 4, 11, "m", "symbol", { b: "kube", form: "klump", farve: "#c86f3e" },
            "I elledninger. Frihedsgudinden er grøn, fordi hun er af kobber."],
        [30, "Zn", "zink", [], 4, 12, "m", "symbol", { b: "kube", form: "klump", farve: "#a8b2bc" },
            "Et lag zink beskytter stål mod rust."],
        [31, "Ga", "gallium", [], 4, 13, "m", "navn", { b: "kube", form: "draabe", farve: "#c4c9d0" },
            "Smelter ved 30 °C, altså i hånden."],
        [32, "Ge", "germanium", [], 4, 14, "h", "symbol", { b: "kube", form: "krystal", farve: "#8b8f97" },
            "De første transistorer var af germanium."],
        [33, "As", "arsen", [], 4, 15, "h", "symbol", { b: "kube", form: "klump", farve: "#7c7f86" },
            "Giftigt. Derfor står det bag glas."],
        [34, "Se", "selen", [], 4, 16, "i", "navn", { b: "kube", form: "klump", farve: "#53565c" },
            "Kroppen skal bruge lidt. Der er meget i paranødder."],
        [35, "Br", "brom", [], 4, 17, "i", "navn", { b: "ampul", fyld: "vaeske", farve: "#7a1e0e" },
            "Et af kun to grundstoffer, der er flydende ved stuetemperatur."],
        [36, "Kr", "krypton", [], 4, 18, "a", "navn", { b: "ampul", fyld: "klar", farve: "#ffffff" },
            "I fotoblitz. Kryptonit findes kun hos Superman."]
    ];

    /* Hovedgruppen efter soejlen: 1, 2 og 13-18 bliver til 1-8.
       Overgangsmetallerne (soejle 3-12) har ingen hovedgruppe. */
    function hovedgruppe(soejle) {
        if (soejle <= 2) return soejle;
        if (soejle >= 13) return soejle - 10;
        return 0;
    }

    /* Elektronstrukturen efter skalmodellen.
       Overgangsmetallerne faar deres rigtige struktur (Cr og Cu har én i
       yderste skal), men den spoerges der ikke om. */
    D.skaller = function (z) {
        if (z <= 2) return [z];
        if (z <= 10) return [2, z - 2];
        if (z <= 18) return [2, 8, z - 10];
        if (z <= 20) return [2, 8, 8, z - 18];
        if (z === 24) return [2, 8, 13, 1];
        if (z === 29) return [2, 8, 18, 1];
        if (z <= 30) return [2, 8, z - 12, 2];
        return [2, 8, 18, z - 28];
    };

    D.GRUNDSTOFFER = G.map(function (r) {
        var g = {
            z: r[0], s: r[1], navn: r[2], alt: r[3],
            periode: r[4], soejle: r[5], slags: r[6], mangler: r[7],
            proeve: r[8], fakta: r[9]
        };
        g.hg = hovedgruppe(g.soejle);
        g.ovg = g.hg === 0;
        g.skaller = D.skaller(g.z);
        g.struktur = g.skaller.join(",");
        g.Navn = g.navn.charAt(0).toUpperCase() + g.navn.slice(1);
        return g;
    });

    var efterSymbol = {};
    D.GRUNDSTOFFER.forEach(function (g) { efterSymbol[g.s] = g; });

    /* ----- Hvem er jeg? (opraabet) ----------------------------------------
       20 gaader om grundstoffer, eleverne kan forholde sig til. Hver gaade
       bygger paa linjen om stoffet, som staar paa skiltet paa fane 1, men
       siger hverken navnet eller symbolet. Hoejst ca. 70 tegn. */
    var GAADER = {
        H: "Solen består mest af mig.",
        He: "Jeg får balloner til at svæve, og jeg kan ikke brænde.",
        Li: "Jeg er i batteriet i din telefon.",
        C: "Jeg er både grafit i blyanter og diamant.",
        N: "Jeg er 78 % af luften.",
        O: "Du trækker vejret for at få mig.",
        F: "Jeg er i tandpasta og beskytter dine tænder.",
        Ne: "Jeg lyser rødorange i gamle reklameskilte.",
        Na: "Jeg er metallet i køkkensalt.",
        Al: "Sodavandsdåser og køkkenfolie er lavet af mig.",
        Si: "Computerchips er lavet af mig. Sand og glas er fulde af mig.",
        P: "Jeg sidder på siden af tændstikæsken.",
        S: "Jeg er et gult stof. Folk tror, at jeg lugter af rådne æg.",
        Cl: "Jeg er en giftig, gulgrøn gas. Jeg holder svømmehallens vand rent.",
        K: "Bananer er fulde af mig.",
        Ca: "Knogler, tænder og kridt er fulde af mig.",
        Fe: "Jeg ruster, og jeg er i dit blod.",
        Cu: "Frihedsgudinden er lavet af mig. Derfor er hun grøn.",
        Ga: "Jeg er et metal, der smelter i din hånd.",
        Kr: "Supermans hjemplanet hedder det samme som mig."
    };
    D.GRUNDSTOFFER.forEach(function (g) { g.gaade = GAADER[g.s] || ""; });
    D.HVEM = D.GRUNDSTOFFER.filter(function (g) { return g.gaade; });

    D.grundstof = function (s) { return efterSymbol[s] || null; };
    D.efterZ = function (z) { return D.GRUNDSTOFFER[z - 1] || null; };

    /* Kendte grundstoffer uden for montren. Bruges kun i beskeder, naar
       eleven skriver et af dem. */
    D.UDENFOR = [
        { s: "Ag", navn: "sølv" }, { s: "Au", navn: "guld" }, { s: "Sn", navn: "tin" },
        { s: "Pb", navn: "bly" }, { s: "Hg", navn: "kviksølv" }, { s: "I", navn: "iod" },
        { s: "Pt", navn: "platin" }, { s: "U", navn: "uran" }, { s: "Ba", navn: "barium" },
        { s: "Sr", navn: "strontium" }, { s: "Rb", navn: "rubidium" }, { s: "Cs", navn: "cæsium" },
        { s: "Xe", navn: "xenon" }, { s: "Rn", navn: "radon" }, { s: "W", navn: "wolfram" },
        { s: "Ra", navn: "radium" }, { s: "Pu", navn: "plutonium" }, { s: "Cd", navn: "cadmium" },
        { s: "Sb", navn: "antimon" }, { s: "Bi", navn: "bismuth" }, { s: "Mo", navn: "molybdæn" },
        { s: "Zr", navn: "zirconium" }, { s: "Li", navn: "lithium" }
    ].filter(function (u) { return !efterSymbol[u.s]; });

    /* Perioderne er fremskridtets grupper paa fane 1 */
    D.PERIODER = [1, 2, 3, 4].map(function (p) {
        return {
            nr: p,
            navn: p + ". periode",
            antal: D.GRUNDSTOFFER.filter(function (g) { return g.periode === p; }).length
        };
    });

    /* Den raekkefoelge, proeverne tages i: efter atomnummer, saa skallerne
       fyldes op i samme takt som montren. */
    D.ORDEN = D.GRUNDSTOFFER.map(function (g) { return g.z; });

    D.SLAGS_NAVN = { m: "metal", i: "ikke-metal", h: "halvmetal", a: "ædelgas" };

    /* Latinske navne bag de symboler, der ikke ligner det danske navn */
    D.LATIN = { Fe: "ferrum", Cu: "cuprum", S: "sulfur" };

    /* Skallernes plads efter C-niveauets model: 1. skal 2, 2. skal 8,
       3. skal 8 frem til calcium og 18 derefter. Den yderste hoejst 8. */
    D.skalLoft = function (nr, z) {
        if (nr === 0) return 2;
        if (nr === 1) return 8;
        if (nr === 2) return z > 20 ? 18 : 8;
        return 8;
    };

    /* ----- Opraabet: svarmuligheder til symbol -> navn ------------------
       De forkerte svar er de forvekslinger, elever laver: K som kulstof,
       Na som nitrogen, Ti som tin, Fe som fluor. */
    D.FORVEKSLING = {
        H: ["helium", "kalium", "nitrogen"],
        He: ["hydrogen", "neon", "argon"],
        Li: ["natrium", "kalium", "beryllium"],
        Be: ["bor", "brom", "magnesium"],
        B: ["brom", "beryllium", "carbon"],
        C: ["calcium", "chlor", "cobalt"],
        N: ["natrium", "neon", "nikkel"],
        O: ["nitrogen", "svovl", "fluor"],
        F: ["jern", "phosphor", "chlor"],
        Ne: ["nitrogen", "nikkel", "natrium"],
        Na: ["nitrogen", "neon", "nikkel"],
        Mg: ["mangan", "calcium", "aluminium"],
        Al: ["argon", "arsen", "magnesium"],
        Si: ["svovl", "scandium", "selen"],
        P: ["kalium", "svovl", "fluor"],
        S: ["silicium", "scandium", "selen"],
        Cl: ["carbon", "calcium", "chrom"],
        Ar: ["arsen", "aluminium", "neon"],
        K: ["kulstof", "kobber", "krypton"],
        Ca: ["carbon", "kalium", "chlor"],
        Sc: ["svovl", "silicium", "selen"],
        Ti: ["tin", "vanadium", "scandium"],
        V: ["titan", "chrom", "fluor"],
        Cr: ["kobber", "krypton", "cobalt"],
        Mn: ["magnesium", "jern", "nikkel"],
        Fe: ["fluor", "phosphor", "cobalt"],
        Co: ["kobber", "carbon", "chrom"],
        Ni: ["nitrogen", "neon", "natrium"],
        Cu: ["cobalt", "chrom", "calcium"],
        Zn: ["tin", "jern", "nikkel"],
        Ga: ["germanium", "guld", "aluminium"],
        Ge: ["gallium", "guld", "selen"],
        As: ["argon", "sølv", "aluminium"],
        Se: ["svovl", "silicium", "scandium"],
        Br: ["bor", "beryllium", "chlor"],
        Kr: ["kalium", "chrom", "kobber"]
    };

    /* ----- Formlerne ---------------------------------------------------------
       Formlen staar med almindelige tal, ladningen for sig. Niveauerne er
       fremskridtets grupper paa fane 2. Farven er stoffets farve i flasken
       (vaeske eller pulver). */
    D.NIVEAUER = [
        { navn: "Tal efter symbolet", kort: "ét tal pr. symbol", farve: "#3d9ee0" },
        { navn: "Samme symbol flere steder", kort: "læg sammen", farve: "#e6892a" },
        { navn: "Parenteser og ladning", kort: "gang ud, tæl ikke ladningen", farve: "#3fae72" }
    ];

    var F = [
        ["H2O", 0, "vand", 0, "vaeske", "#9fd3f5", "Dækker 71 % af Jordens overflade."],
        ["HNO3", 0, "salpetersyre", 0, "vaeske", "#f3eed2", "Bruges til gødning og sprængstof."],
        ["H2SO4", 0, "svovlsyre", 0, "vaeske", "#eef1f4", "Syren i bilbatterier."],
        ["C6H12O6", 0, "glucose", 0, "pulver", "#f7f5ee", "Druesukker. Planterne laver det af CO₂ og vand."],
        ["C2H5OH", 0, "ethanol", 1, "vaeske", "#eaf4fb", "Alkoholen i øl og vin og i håndsprit."],
        ["CH3COOH", 0, "eddikesyre", 1, "vaeske", "#f4ecd8", "Syren i eddike."],
        ["HCOOH", 0, "myresyre", 1, "vaeske", "#eef0f2", "Det, der svier, når en myre bider."],
        ["NH4NO3", 0, "ammoniumnitrat", 1, "pulver", "#f6f6f2", "Almindelig gødning i landbruget."],
        ["Ca(OH)2", 0, "calciumhydroxid", 2, "pulver", "#f3f3ee", "Opløst i vand er det kalkvand."],
        ["Al2(SO4)3", 0, "aluminiumsulfat", 2, "pulver", "#f1f1ec", "Bruges til at rense drikkevand."],
        ["(NH4)2SO4", 0, "ammoniumsulfat", 2, "pulver", "#ecebe4", "Gødning, der også giver planterne svovl."],
        ["NO2", -1, "nitrition", 2, "pulver", "#f6f1dc", "Nitrit konserverer spegepølse."]
    ];

    /* ----- Formlen laest som struktur -------------------------------------
       "Al2(SO4)3" -> [ {s:"Al", n:2}, {gruppe:[{s:"S",n:1},{s:"O",n:4}], n:3} ].
       Hvert led husker, hvor i teksten det staar, saa hintet kan pege paa
       det i den store formel. */
    D.laes = function (f) {
        var i = 0;
        function led() {
            var ud = [];
            while (i < f.length) {
                var c = f.charAt(i);
                if (c === "(") {
                    var start = i;
                    i++;
                    var indhold = led();
                    i++;                                   /* ")" */
                    var n = tal();
                    ud.push({ gruppe: indhold, n: n.n, harTal: n.har, fra: start, til: i });
                } else if (c === ")") {
                    return ud;
                } else if (/[A-Z]/.test(c)) {
                    var fra = i, s = c;
                    i++;
                    while (i < f.length && /[a-z]/.test(f.charAt(i))) { s += f.charAt(i); i++; }
                    var t = tal();
                    ud.push({ s: s, n: t.n, harTal: t.har, fra: fra, til: i });
                } else {
                    i++;
                }
            }
            return ud;
        }
        function tal() {
            var st = "";
            while (i < f.length && /[0-9]/.test(f.charAt(i))) { st += f.charAt(i); i++; }
            return { n: st ? parseInt(st, 10) : 1, har: !!st };
        }
        return led();
    };

    /* Antallet af hvert grundstof i den raekkefoelge, de optraeder */
    D.taelling = function (struktur) {
        var antal = {}, orden = [];
        (function gaa(liste, gange) {
            liste.forEach(function (l) {
                if (l.gruppe) { gaa(l.gruppe, gange * l.n); return; }
                if (antal[l.s] === undefined) { antal[l.s] = 0; orden.push(l.s); }
                antal[l.s] += l.n * gange;
            });
        }(struktur, 1));
        var ialt = 0;
        orden.forEach(function (s) { ialt += antal[s]; });
        return { antal: antal, orden: orden, ialt: ialt };
    };

    D.FORMLER = F.map(function (r, nr) {
        var fo = {
            nr: nr, id: r[0], f: r[0], q: r[1], navn: r[2], niveau: r[3],
            form: r[4], farve: r[5], fakta: r[6]
        };
        fo.formelTekst = NK.formel(fo.f) + NK.ladningHaevet(fo.q);
        fo.Navn = fo.navn.charAt(0).toUpperCase() + fo.navn.slice(1);
        fo.struktur = D.laes(fo.f);
        var t = D.taelling(fo.struktur);
        fo.antal = t.antal;
        fo.orden = t.orden;
        fo.ialt = t.ialt;
        fo.pladsINiveau = F.slice(0, nr).filter(function (x) { return x[3] === r[3]; }).length;
        return fo;
    });

    /* ----- Hjaelpen paa fane 1 -------------------------------------------
       Én gren pr. slags felt: hint foerst, svaret bagefter. plakat: saa
       lyser plakaten med det periodiske system op. */

    D.pladsTekst = function (g) {
        return g.periode + ". periode, " + (g.hg ? "hovedgruppe " + g.hg : "overgangsmetal");
    };

    D.hjaelp = function (g, slags) {
        if (slags === "navn") {
            return {
                hint: "Slå " + g.s + " op på navnetavlen midt i udstillingen. Navnet begynder med " +
                    g.navn.charAt(0).toUpperCase() + ".",
                svar: g.s + " er <b>" + g.navn + "</b>.",
                plakat: true
            };
        }
        if (slags === "symbol") {
            var hint;
            if (D.LATIN[g.s]) {
                hint = "Symbolet kommer af det latinske navn " + D.LATIN[g.s] + ".";
            } else if (g.s.length === 1) {
                hint = "Symbolet er ét stort bogstav.";
            } else {
                hint = "Symbolet har to bogstaver og begynder med " + g.s.charAt(0) + ".";
            }
            return { hint: hint, svar: g.Navn + " har symbolet <b>" + g.s + "</b>.", plakat: true };
        }
        if (slags === "plads") {
            return {
                hint: "Find skiltet med " + g.s + ". Det står i " + g.periode + ". række.",
                svar: g.s + " står i " + D.pladsTekst(g) + "."
            };
        }
        /* Elektronstrukturen */
        var yderst = g.skaller[g.skaller.length - 1];
        var hintS = g.Navn + " har " + g.z + (g.z === 1 ? " elektron" : " elektroner") + " og står i " + g.periode +
            ". periode, så atomet har " + (g.periode === 1 ? "én skal" : g.periode + " skaller") + ".";
        return {
            hint: hintS,
            svar: g.Navn + " har elektronstrukturen <b>" + g.struktur + "</b>. " +
                (g.z === 2 ? "Den ene skal er fuld med 2 elektroner." : "Der er " + (g.periode === 1 ? "1 skal" : g.periode + " skaller") + " med " + yderst + (yderst === 1 ? " elektron" : " elektroner") + " i den yderste, og " + g.navn + " står i hovedgruppe " + g.hg + "."),
            skaller: true
        };
    };

    /* ----- Hjaelpen paa fane 2 ------------------------------------------- */
    function forekomster(fo, s) {
        var ud = [];
        (function gaa(liste, gange, iGruppe) {
            liste.forEach(function (l) {
                if (l.gruppe) { gaa(l.gruppe, gange * l.n, l); return; }
                if (l.s === s) ud.push({ led: l, gange: gange, gruppe: iGruppe });
            });
        }(fo.struktur, 1, null));
        return ud;
    }
    D.forekomster = forekomster;

    function udregning(fo, s) {
        var dele = forekomster(fo, s).map(function (o) {
            return o.gange > 1 ? o.gange + " × " + o.led.n : String(o.led.n);
        });
        return dele.length > 1 ? dele.join(" + ") + " = " + fo.antal[s] : dele[0];
    }
    D.udregning = udregning;

    D.hjaelpFormel = function (fo, felt) {
        if (felt === "ialt") {
            return {
                hint: "Læg antallet af atomer sammen for alle grundstofferne." + (fo.q ? " Ladningen tæller ikke som et atom." : ""),
                svar: fo.orden.map(function (s) { return fo.antal[s]; }).join(" + ") + " = <b>" + fo.ialt + "</b> atomer."
            };
        }
        var fk = forekomster(fo, felt);
        var hint;
        if (fk.some(function (o) { return o.gange > 1; })) {
            hint = felt + " står inde i en parentes. Tallet efter parentesen ganger alt indeni.";
        } else if (fk.length > 1) {
            hint = felt + " står " + fk.length + " steder i formlen. Læg antallet af " + felt + "-atomer fra hvert sted sammen.";
        } else if (!fk[0].led.harTal) {
            hint = "Står der intet tal efter " + felt + ", er der ét " + felt + "-atom.";
        } else {
            hint = "Tallet lige efter " + felt + " gælder kun " + felt + ".";
        }
        var o0 = fk[0];
        var svar = felt + ": ";
        if (fk.length === 1 && o0.gange > 1) {
            svar += o0.led.n + " i hver parentes og " + o0.gange + " parenteser, så " + o0.gange + " × " + o0.led.n + " = <b>" + fo.antal[felt] + "</b>.";
        } else if (fk.length > 1) {
            svar += udregning(fo, felt).replace(/= (\d+)$/, "= <b>$1</b>") + ".";
        } else {
            svar += "<b>" + fo.antal[felt] + "</b>.";
        }
        return { hint: hint, svar: svar, fremhaev: felt };
    };

    /* ----- Kemichael -------------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (CSS-
       selectorer; tingene paa laerredet er de usynlige .anker fra
       rundvisningen). felt: proeven paa bordet (introFelt i js/laerer.js).
       Ingen vittigheder i praesentationen. */
    D.INTRO_MONTRE = [
        { tekst: "I denne fane sætter du grundstofferne 1 til 36 på plads i skolens grundstofudstilling. Udstillingen er formet som det periodiske system, og hvert rum har et skilt med atomnummer og symbol. Tallene foroven er hovedgrupperne, og tallene til venstre er perioderne.",
          sel: "#montre-anker-montre" },
        { tekst: "Prøven på bordet har et mærke, hvor enten navnet eller symbolet mangler. Du skriver navnet eller symbolet på kortet øverst i scenen og trækker prøven op i rummet med det rigtige symbol på skiltet.",
          felt: "proeve", sel: "#montre-skort" },
        { tekst: "Når prøven står på plads, skriver du elektronstrukturen, og tavlen tegner atommodellen imens. Knappen Giv et hint på kortet giver et hint og derefter svaret. Navnetavlen midt i udstillingen viser alle grundstoffernes navne.",
          sel: ["#montre-anker-tavle", "#montre-knap", "#montre-anker-navne"] }
    ];
    D.INTRO_FORMLER = [
        { tekst: "I denne fane tæller du atomerne i et stof. Tavlen viser stoffets formel, og på kortet øverst i scenen skriver du antallet af atomer af hvert grundstof og til sidst antallet i alt.",
          sel: ["#formler-anker-tavle", "#formler-skort"] },
        { tekst: "Når et grundstof er talt rigtigt, flyver dets atomer ud af udstillingen og op på tavlen. En parentes i formlen bliver til lige så mange kopier, som tallet efter parentesen siger.",
          sel: "#formler-anker-tavle" },
        { tekst: "Knappen Giv et hint på kortet giver et hint og derefter svaret. Du skifter stof ved at klikke på en af de små flasker på bordet, og listen i panelet viser flaskerne i de tre niveauer.",
          sel: ["#formler-knap", "#formler-anker-raekke", "#formler-fremskridt"] }
    ];
    D.INTRO_OPRAAB = [
        { tekst: "I denne fane finder du grundstofferne i udstillingen på tid. Du svarer ved at klikke på grundstoffet i udstillingen, og når et rum blinker, vælger du grundstoffets navn på tavlen.",
          sel: "#opraab-anker-montre" },
        { tekst: "Tavlen siger, hvilket grundstof du skal finde, og kridtstregen på tavlen viser, hvor lang tid du har. Et hurtigt svar giver flere point, og en stime af rigtige svar ganger pointene op. Du mister et liv, hvis du svarer forkert eller ikke når at svare, og efter tre mistede liv er spillet slut.",
          sel: ["#opraab-anker-tavle", "#opraab-kort"] },
        { tekst: "Du starter spillet med knappen Start opråbet. Knappen Hvem er jeg? starter en ekstra runde med 20 gåder om grundstoffer, som du kender fra hverdagen.",
          sel: ["#opraab-knap", "#opraab-hvem"] }
    ];

    /* Han kommer kun ind af sig selv, naar en hel fane er klaret (brugerens
       regel 4. nov. 2026): alle 36 proever, alle tolv flasker, eller et
       spil, der er gaaet godt (én gang pr. besoeg for hvert spil). */
    D.MONTRE_FULD = "Alle 36 prøver står i udstillingen. Nu tør jeg vise den til rektor.";
    D.FORMLER_FAERDIG = "Du har talt atomerne i alle tolv flasker. Jeg skriver det ind i regnskabet.";
    D.SLUT_REPLIK = {
        mange: "Du er hurtigere end kaffemaskinen, men det er heller ikke svært.",
        rekord: "Det er en ny rekord. Jeg skriver den ned et sted.",
        hvem: "Du har fundet alle tyve grundstoffer. Nu kender du dem bedre end rektor."
    };

    NK.Data = D;
}());
