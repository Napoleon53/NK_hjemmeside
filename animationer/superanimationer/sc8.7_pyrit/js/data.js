/* =====================================================================
   data.js - mineralerne, reaktionerne og teksterne

   En formel skrives med almindelige tal og ladningen efter et
   mellemrum: "FeS2", "SO4 2-", "Fe(OH)3". js/redox.js regner
   oxidationstallene ud (O er −II, H er +I, resten foelger af
   ladningen). Kun det, reglerne ikke kan afgoere, staar i D.OX.

   En reaktion er skrevet som stofferne foer og efter pilen, foer
   afstemningen. Leddene taelles fra 0, foerst dem foer pilen. En
   klamme gaar fra et atom foer pilen til det samme grundstof efter:
   { E: "S", fra: 0, til: 3 }. Med fri: true ender klammen i et stof,
   der ogsaa faar atomer andre steder fra (O fra O₂ ender i sulfat,
   hvor resten af O kommer fra vand), saa den giver intet tal foran
   produktet. Intet svar er skrevet i haanden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Oxidationstal, reglerne ikke kan afgoere ------------------------
       Pyrit: jernet er Fe²⁺, saa S bliver −I (svovlet sidder som S₂²⁻).
       Magnetit skrives FeO·Fe₂O₃ med jern nr. 1 som +II og nr. 2 som +III. */
    D.OX = {
        "FeS2": { Fe: 2 },
        "ZnS": { Zn: 2 },
        "HgS": { Hg: 2 },
        "CaSO4": { Ca: 2 },
        "Cu2(OH)2CO3": { C: 4 },
        "FeO·Fe2O3": { Fe: [2, 3] }
    };

    /* Reglen, eleven skal bruge for et bestemt atom i et bestemt stof */
    D.REGEL = {
        "FeS2": { S: "Fe er +II i pyrit. Summen af oxidationstallene i FeS₂ skal være 0." },
        "ZnS": { S: "ZnS er et sulfid. Sulfidionen er S²⁻, så S er −II.", Zn: "S er −II i et sulfid. Summen i ZnS skal være 0." },
        "HgS": { S: "HgS er et sulfid. Sulfidionen er S²⁻, så S er −II.", Hg: "S er −II i et sulfid. Summen i HgS skal være 0." },
        "CaSO4": { S: "Ca er +II og O er −II. Summen i CaSO₄ skal være 0." },
        "Cu2(OH)2CO3": { Cu: "OH⁻ har ladningen −1 og CO₃²⁻ har ladningen −2. Summen af det hele skal være 0." }
    };

    /* Svaret med ord, hvor det ikke er et regnestykke */
    D.SVAR = {
        "ZnS": { S: "Sulfidionen er S²⁻, så S er −II." },
        "HgS": { S: "Sulfidionen er S²⁻, så S er −II." }
    };

    /* Beskeden til et bestemt forkert tal: "formel|atom|tal" */
    D.FEJL = {
        "FeS2|S|-2": "Med S som −II skulle Fe være +IV. Jern er +II i pyrit, så regn baglæns: (+2) + 2 · S = 0.",
        "FeS2|S|-4": "Summen skal være 0. Fe er +II, og de to S skal tilsammen give −2.",
        "Fe2O3|Fe|6": "+6 er for de to Fe tilsammen. Del med 2.",
        "Fe2O3|Fe|2": "Tre O giver −6. To Fe skal tilsammen give +6.",
        "CaSO4|S|-2": "S er kun −II i et sulfid. Her sidder S sammen med O i sulfat, SO₄²⁻.",
        "CaSO4|S|8": "Fire O giver −8, men Ca giver +2. S skal kun give resten.",
        "Cu2(OH)2CO3|Cu|4": "+4 er for de to Cu tilsammen. Del med 2.",
        "Cu2(OH)2CO3|Cu|1": "De negative ioner giver −4 i alt: 2 · (−1) fra OH⁻ og −2 fra CO₃²⁻."
    };

    /* ----- Fane 1: mineralerne i udstillingen ---------------------------------
       hylde og plads siger, hvor stenen staar. spoerg er de atomer, eleven
       skriver oxidationstal for; givet staar med blyant fra start. */
    D.KLASSER = {
        grundstof: { navn: "Grundstoffer", ion: "" },
        sulfid: { navn: "Sulfider", ion: "S²⁻" },
        oxid: { navn: "Oxider", ion: "O²⁻" },
        sulfat: { navn: "Sulfater", ion: "SO₄²⁻" },
        carbonat: { navn: "Carbonater", ion: "CO₃²⁻" }
    };

    D.HYLDER = [
        [{ klasse: "grundstof", sten: ["svovl"] }, { klasse: "sulfid", sten: ["zinkblende", "cinnober", "pyrit"] }],
        [{ klasse: "oxid", sten: ["haematit", "magnetit"] }, { klasse: "sulfat", sten: ["gips"] }, { klasse: "carbonat", sten: ["malakit"] }]
    ];

    D.MINERALER = [
        { id: "svovl", navn: "Svovl", spansk: "azufre", klasse: "grundstof", f: "S", spoerg: ["S"], givet: [],
          linje: "Svovl er et grundstof. Skriv oxidationstallet over S.",
          hint: ["Svovl står alene. Der er kun én slags atom, og stoffet har ingen ladning.", "Et grundstof har altid oxidationstallet 0."],
          fakta: "Rent svovl er hverken oxideret eller reduceret. Det er nulpunktet på svovls trappe." },
        { id: "zinkblende", navn: "Zinkblende", spansk: "blenda", klasse: "sulfid", f: "ZnS", spoerg: ["Zn", "S"], givet: [],
          linje: "Zinkblende er et sulfid. Skriv oxidationstallet over Zn og S.",
          hint: ["Stenen står hos sulfiderne. Sulfidionen er S²⁻.", "S er −II. Summen i ZnS skal være 0.", "Zn + (−2) = 0. Hvad er Zn?"],
          fakta: "Zinkblende er den vigtigste zinkmalm. På fane 3 rister du den i luft." },
        { id: "cinnober", navn: "Cinnober", spansk: "cinabrio", klasse: "sulfid", f: "HgS", spoerg: ["Hg", "S"], givet: [],
          linje: "Cinnober er også et sulfid. Skriv oxidationstallet over Hg og S.",
          hint: ["Stenen står hos sulfiderne. Sulfidionen er S²⁻.", "S er −II. Summen i HgS skal være 0.", "Hg + (−2) = 0. Hvad er Hg?"],
          fakta: "Cinnober er kviksølvmalm. Minen i Almadén i Spanien var i drift i over 2000 år." },
        { id: "haematit", navn: "Hematit", spansk: "hematites", klasse: "oxid", f: "Fe2O3", spoerg: ["Fe"], givet: ["O"],
          linje: "Hematit er et oxid, så O er −II. Skriv oxidationstallet over Fe.",
          hint: ["O er −II. Summen i Fe₂O₃ skal være 0.", "2 · Fe + 3 · (−2) = 0.", "2 · Fe = +6. Hvad er ét Fe?"],
          fakta: "Jern(III)oxid er rødt som pulver. Det er den samme farve som i rust." },
        { id: "magnetit", navn: "Magnetit", spansk: "magnetita", klasse: "oxid", f: "FeO·Fe2O3", vis: "Fe₃O₄", spoerg: ["Fe"], givet: ["O"],
          linje: "Magnetit, Fe₃O₄, kan skrives FeO·Fe₂O₃. Skriv oxidationstallet over hvert Fe.",
          hint: ["Regn de to dele hver for sig. O er −II i dem begge.", "FeO: Fe + (−2) = 0. Fe₂O₃: 2 · Fe + 3 · (−2) = 0.", "Det første Fe skal give +2 alene. De to andre skal give +6 tilsammen."],
          fakta: "Magnetit har to slags jern: én Fe²⁺ for hver to Fe³⁺. Regnet under ét giver Fe₃O₄ ikke et helt tal." },
        { id: "gips", navn: "Gips", spansk: "yeso", klasse: "sulfat", f: "CaSO4", efter: "·2H₂O", spoerg: ["S"], givet: ["Ca", "O"],
          linje: "Gips er et sulfat. Ca er +II og O er −II. Skriv oxidationstallet over S.",
          hint: ["Summen i CaSO₄ skal være 0. Krystalvandet, 2 H₂O, tæller ikke med.", "(+2) + S + 4 · (−2) = 0.", "S + (−6) = 0. Hvad er S?"],
          fakta: "I sulfat er svovl oxideret helt til tops, +VI. Det er det samme svovl som i svovlsyre." },
        { id: "malakit", navn: "Malakit", spansk: "malaquita", klasse: "carbonat", f: "Cu2(OH)2CO3", spoerg: ["Cu"], givet: [],
          linje: "Malakit har to slags negative ioner: OH⁻ og CO₃²⁻. Skriv oxidationstallet over Cu.",
          hint: ["De to OH⁻ giver −2 i alt, og CO₃²⁻ giver −2. Summen af det hele skal være 0.", "2 · Cu + 2 · (−1) + (−2) = 0.", "2 · Cu = +4. Hvad er ét Cu?"],
          fakta: "Kobber(II) giver den grønne farve. Azurit er blå, men kobber er også +II der." },
        { id: "pyrit", navn: "Pyrit", spansk: "pirita", klasse: "sulfid", f: "FeS2", spoerg: ["S"], givet: ["Fe"],
          linje: "Pyrit står hos sulfiderne, men jern er +II i pyrit. Skriv oxidationstallet over S.",
          hint: ["Brug ikke reglen for sulfid her. Fe er +II, og summen i FeS₂ skal være 0.", "(+2) + 2 · S = 0.", "2 · S = −2. Hvad er ét S?"],
          fakta: "Svovlatomerne sidder to og to som S₂²⁻. Derfor er S −I i pyrit. På fane 2 møder pyritten luft og vand." }
    ];

    /* Tasterne under skiltet: de oxidationstal, mineralerne har brug for */
    D.TASTER = [-2, -1, 0, 1, 2, 3, 4, 6];

    /* Trappen i panelet: grundstofferne, der faar en raekke hver */
    D.TRAPPE = { fra: -2, til: 6, raekker: ["S", "Fe"] };

    D.PAASKEAEG = "Stadig ikke guld. Pyrit hedder narreguld af en grund.";

    /* ----- Fane 2 og 3: opgaverne i haeftet ------------------------------------
       type "afstem": et skema, der afstemmes i smaa bidder.
       type "sum":    de to skemaer laegges sammen.
       type "spm":    spoergsmaal til det samlede skema. */
    D.OPGAVER = {
        p: [
            { id: "svovl", type: "afstem", navn: "Svovlet oxideres", kort: "Svovlet",
              tekst: "Pyrit ligger i regn og luft. Svovlet bliver til sulfat, SO₄²⁻, og jernet går i opløsning som Fe²⁺.",
              v: ["FeS2", "O2"], h: ["Fe 2+", "SO4 2-"],
              klammer: [{ E: "S", fra: 0, til: 3 }, { E: "O", fra: 1, til: 3, fri: true }],
              givet: ["0:Fe"], ekstraOx: ["2:Fe"], med: [{ led: 2, E: "Fe" }], miljoe: "surt",
              efterOx: "Fe er +II før og efter. Jernet skifter ikke her.",
              slut: "Svovlet gik fra −I til +VI. Der blev dannet H⁺, så vandet bliver surt." },
            { id: "jern", type: "afstem", navn: "Jernet oxideres", kort: "Jernet",
              tekst: "Fe²⁺ i vandet møder mere oxygen. Jernet bliver til Fe(OH)₃, et rødbrunt stof, der ikke kan opløses i vand.",
              v: ["Fe 2+", "O2"], h: ["Fe(OH)3"],
              klammer: [{ E: "Fe", fra: 0, til: 2 }, { E: "O", fra: 1, til: 2, fri: true }],
              miljoe: "surt",
              slut: "Jernet gik fra +II til +III. Fe(OH)₃ farver vandet rødt, og der blev dannet mere H⁺." },
            { id: "sum", type: "sum", navn: "Læg de to sammen", kort: "Samlet",
              tekst: "De to skemaer sker efter hinanden. Lagt sammen giver de ét skema for hele forvitringen.",
              dele: ["svovl", "jern"], gaarUd: "Fe 2+",
              raekke: { v: ["FeS2", "O2", "H2O"], h: ["Fe(OH)3", "SO4 2-", "H +"] },
              syre: { f: "H2SO4", af: ["SO4 2-", "H +"] } },
            { id: "tinto", type: "spm", navn: "Río Tinto", kort: "Río Tinto",
              tekst: "Floden Río Tinto i Andalusien løber gennem et område med pyrit. Vandet er rustrødt og har en pH omkring 2." }
        ],
        r: [
            { id: "zink", type: "afstem", navn: "Zinkblende ristes", kort: "Zinkblende",
              tekst: "Zink udvindes ved at riste zinkblende i luft. Der dannes zinkoxid og svovldioxid.",
              v: ["ZnS", "O2"], h: ["ZnO", "SO2"],
              klammer: [{ E: "S", fra: 0, til: 3 }, { E: "O", fra: 1, til: 2, fri: true }],
              givet: ["0:Zn", "2:Zn"], ekstraOx: ["3:O"], med: [{ led: 2, E: "Zn" }], miljoe: null,
              efterOx: "Zn er +II før og efter. Zink skifter ikke.",
              slut: "Svovlet gik fra −II til +IV. Svovldioxid er en gas, der forsvinder op i luften." },
            { id: "cinnober", type: "afstem", navn: "Cinnober ristes", kort: "Cinnober",
              tekst: "Kviksølv udvindes ved at riste cinnober. Undersøg med oxidationstal, om skemaet er afstemt, som det står.",
              v: ["HgS", "O2"], h: ["Hg", "SO2"],
              klammer: [{ E: "S", fra: 0, til: 3 }, { E: "Hg", fra: 0, til: 2 }, { E: "O", fra: 1, til: 3, fri: true }],
              miljoe: null, tjek: true,
              slut: "Alle gangetal er 1, så skemaet var afstemt, som det stod. Her reduceres to grundstoffer: Hg og O." },
            { id: "regn", type: "afstem", navn: "Sur regn", kort: "Sur regn",
              tekst: "Svovldioxid fra ristningen opløses i regnvand og bliver til svovlsyrling, H₂SO₃.",
              v: ["SO2", "H2O"], h: ["H2SO3"],
              klammer: [], ekstraOx: ["0:S", "2:S"], miljoe: null, ikkeRedox: true,
              slut: "S er +IV før og efter pilen, O er −II og H er +I hele vejen. Intet atom skifter oxidationstal, så det er en syrereaktion og ikke en redoxreaktion." }
        ]
    };

    /* Spoergsmaalene til det samlede skema (fane 2, opgave 4). f er
       forklaringen til et forkert svar, og de forkerte svar er de fejl,
       elever laver. */
    D.SPM = [
        { tekst: "Hvilke atomer bliver oxideret, når pyrit forvitrer?",
          hint: "Sammenlign tallene over S og Fe før og efter pilen. Hvilke tal stiger?",
          svar: [
              { t: "S og Fe", ok: true },
              { t: "Kun S", f: "S går fra −I til +VI, men Fe går også op: fra +II i FeS₂ til +III i Fe(OH)₃." },
              { t: "S og O", f: "O går fra 0 i O₂ til −II. Tallet falder, så O reduceres." }
          ],
          rigtig: "S går fra −I til +VI, og Fe går fra +II til +III. Begge tal stiger." },
        { tekst: "Hvilket atom bliver reduceret?",
          hint: "Find det atom, hvis oxidationstal falder fra før pilen til efter pilen.",
          svar: [
              { t: "O", ok: true },
              { t: "Fe", f: "Fe går fra +II til +III. Tallet stiger, så Fe oxideres." },
              { t: "H", f: "H er +I i både H₂O, Fe(OH)₃ og H₂SO₄. Det skifter ikke." }
          ],
          rigtig: "O går fra 0 i O₂ til −II. Oxygen optager elektronerne fra både svovl og jern." },
        { tekst: "Hvad sker der med pH i vandet?",
          hint: "Se på de to produkter efter pilen. Er et af dem en syre?",
          svar: [
              { t: "pH falder, fordi der dannes H₂SO₄", ok: true },
              { t: "pH stiger, fordi der dannes Fe(OH)₃", f: "Fe(OH)₃ er et fast stof, der ikke opløses. Det giver ikke OH⁻ til vandet." },
              { t: "pH ændrer sig ikke", f: "Se på produkterne. Et af dem er en stærk syre." }
          ],
          rigtig: "Svovlsyre er en stærk syre. Hvert H₂SO₄ giver to H⁺ til vandet." },
        { tekst: "Hvad giver vandet den røde farve?",
          hint: "Rust er også rødbrun. Hvilket oxidationstal har jern i rust?",
          svar: [
              { t: "Jern(III), her Fe(OH)₃", ok: true },
              { t: "Pyrit, FeS₂", f: "Pyrit er gylden og kan ikke opløses i vand. Den røde farve kommer først, når jernet er oxideret." },
              { t: "Svovlsyre, H₂SO₄", f: "Svovlsyre er farveløs. Den gør vandet surt, ikke rødt." }
          ],
          rigtig: "Jern(III) er rødbrunt, som rust. Det er det, der har givet Río Tinto, den røde flod, sit navn." }
    ];

    /* Naar alt paa en fane er loest foerste gang */
    D.FAERDIG = {
        u: "Alle otte mineraler er på plads.",
        p: "Det var hele forvitringen af pyrit.",
        r: "Alle tre reaktioner er klaret."
    };

    D.TRIN_NAVN = {
        ox: "Oxidationstal", "for": "Lige mange atomer", klammer: "Stigning og fald", gange: "Gangetal",
        med: "Resten af atomerne", ladning: "Ladning", ion: "H⁺", brint: "H-atomer", vand: "Vand",
        redox: "Redox eller ej", gang: "Gang skemaerne", sum: "Læg sammen", syre: "Svovlsyre"
    };

    NK.Data = D;
}());
