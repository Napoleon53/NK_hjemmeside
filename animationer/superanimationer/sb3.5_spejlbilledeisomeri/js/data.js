/* =====================================================================
   data.js - grupperne, molekylerne og opgaverne

   En gruppe er det, der sidder paa det midterste C-atom. Den har:
     t        teksten paa kuglen
     atom     det atom, der sidder paa C-atomet
     naeste   de atomer, der sidder paa det atom (en C=O taeller som to O)
     kugle    farve og stoerrelse i kuglemodellen

   Prioriteten regnes af atomnumrene (js/kiral.js), aldrig skrevet i
   haanden. Fane 2 tegner molekylerne med molekylemotoren ud fra en
   SMILES-streng; de asymmetriske C-atomer regnes ogsaa der.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    D.Z = { H: 1, C: 6, N: 7, O: 8, F: 9, Cl: 17, Br: 35, I: 53 };

    D.G = {
        H:     { t: "H", atom: "H", naeste: [], kugle: { farve: "#eef1f4", r: 14, tekst: "#1d2433" } },
        F:     { t: "F", atom: "F", naeste: [], kugle: { farve: "#8fd3e8", r: 17, tekst: "#1d2433" } },
        Cl:    { t: "Cl", atom: "Cl", naeste: [], kugle: { farve: "#3fae72", r: 20, tekst: "#ffffff" } },
        Br:    { t: "Br", atom: "Br", naeste: [], kugle: { farve: "#a8402f", r: 22, tekst: "#ffffff" } },
        I:     { t: "I", atom: "I", naeste: [], kugle: { farve: "#7b4fb0", r: 24, tekst: "#ffffff" } },
        OH:    { t: "OH", atom: "O", naeste: ["H"], kugle: { farve: "#d0493c", r: 19, tekst: "#ffffff" } },
        NH2:   { t: "NH₂", atom: "N", naeste: ["H", "H"], kugle: { farve: "#3f6fd6", r: 20, tekst: "#ffffff" } },
        CH3:   { t: "CH₃", atom: "C", naeste: ["H", "H", "H"], kugle: { farve: "#6f7782", r: 21, tekst: "#ffffff" } },
        C2H5:  { t: "CH₂CH₃", atom: "C", naeste: ["C", "H", "H"], kugle: { farve: "#59616e", r: 25, tekst: "#ffffff" } },
        CH2OH: { t: "CH₂OH", atom: "C", naeste: ["O", "H", "H"], kugle: { farve: "#7a6f86", r: 24, tekst: "#ffffff" } },
        CHO:   { t: "CHO", atom: "C", naeste: ["O", "O", "H"], kugle: { farve: "#8a6a4a", r: 23, tekst: "#ffffff" } },
        COOH:  { t: "COOH", atom: "C", naeste: ["O", "O", "O"], kugle: { farve: "#8a5a5a", r: 24, tekst: "#ffffff" } }
    };

    D.tekst = function (id) { return D.G[id].t; };

    /* Molekyler med ét C-atom i midten og fire grupper */
    D.MOL = {
        ch2brcl:  { navn: "bromchlormethan", g: ["Br", "Cl", "H", "H"] },
        chbrclf:  { navn: "bromchlorfluormethan", g: ["Br", "Cl", "F", "H"] },
        chbrcli:  { navn: "bromchloriodmethan", g: ["I", "Br", "Cl", "H"] },
        prop2ol:  { navn: "propan-2-ol", g: ["OH", "CH3", "CH3", "H"] },
        but2ol:   { navn: "butan-2-ol", g: ["OH", "C2H5", "CH3", "H"] },
        clbut:    { navn: "2-chlorbutan", g: ["Cl", "C2H5", "CH3", "H"] },
        alanin:   { navn: "2-aminopropansyre", triv: "alanin", g: ["NH2", "COOH", "CH3", "H"] },
        maelk:    { navn: "2-hydroxypropansyre", triv: "mælkesyre", g: ["OH", "COOH", "CH3", "H"] },
        glycer:   { navn: "2,3-dihydroxypropanal", triv: "glyceraldehyd", g: ["OH", "CHO", "CH2OH", "H"] }
    };
    D.navn = function (m) { return m.navn + (m.triv ? " (" + m.triv + ")" : ""); };

    /* ----- Fane 1: Spejlbilledet --------------------------------------------------------
       kan: kan molekylet drejes, saa det passer med spejlbilledet?
       byt: eleven skal bytte to grupper foerst */
    D.SPEJL = [
        { id: "s1", mol: "ch2brcl", kan: true, gruppe: "spejl" },
        { id: "s2", mol: "chbrclf", kan: false, gruppe: "spejl" },
        { id: "s3", mol: "chbrclf", kan: true, byt: true, gruppe: "spejl" },
        { id: "s4", mol: "prop2ol", kan: true, gruppe: "rigtige" },
        { id: "s5", mol: "but2ol", kan: false, gruppe: "rigtige" },
        { id: "s6", mol: "alanin", kan: false, gruppe: "rigtige" }
    ];
    D.SPEJL_GRUPPER = [
        { id: "spejl", titel: "Halogenerne" },
        { id: "rigtige", titel: "Rigtige stoffer" }
    ];
    D.SPEJL.forEach(function (o) { o.navn = D.MOL[o.mol].navn.charAt(0).toUpperCase() + D.MOL[o.mol].navn.slice(1); });

    /* ----- Fane 2: Find C-atomet ---------------------------------------------------------
       smiles til molekylemotoren; antal: hvor mange asymmetriske C-atomer
       (selvtesten tjekker, at det passer med det, kiral.js regner ud) */
    D.FIND = [
        { id: "f1", gruppe: "let", navn: "butan-2-ol", smiles: "CC(O)CC", antal: 1 },
        { id: "f2", gruppe: "let", navn: "propan-2-ol", smiles: "CC(O)C", antal: 0 },
        { id: "f3", gruppe: "let", navn: "2-chlorbutan", smiles: "CC(Cl)CC", antal: 1 },
        { id: "f4", gruppe: "let", navn: "2-methylbutan", smiles: "CC(C)CC", antal: 0 },
        { id: "f5", gruppe: "middel", navn: "2-hydroxypropansyre", triv: "mælkesyre", smiles: "CC(O)C(=O)O", antal: 1 },
        { id: "f6", gruppe: "middel", navn: "2-aminopropansyre", triv: "alanin", smiles: "CC(N)C(=O)O", antal: 1 },
        { id: "f7", gruppe: "middel", navn: "butanon", smiles: "CCC(=O)C", antal: 0 },
        { id: "f8", gruppe: "middel", navn: "3-methylhexan", smiles: "CCC(C)CCC", antal: 1 },
        { id: "f9", gruppe: "middel", navn: "3-methylpentan", smiles: "CCC(C)CC", antal: 0 },
        { id: "f10", gruppe: "svaer", navn: "2,3-dihydroxypropanal", triv: "glyceraldehyd", smiles: "OCC(O)C=O", antal: 1 },
        { id: "f11", gruppe: "svaer", navn: "2,3-dihydroxybutandisyre", triv: "vinsyre", smiles: "OC(=O)C(O)C(O)C(=O)O", antal: 2 },
        { id: "f12", gruppe: "svaer", navn: "2-hydroxypropan-1,2,3-tricarboxylsyre", triv: "citronsyre", smiles: "OC(=O)CC(O)(CC(=O)O)C(=O)O", antal: 0 },
        { id: "f13", gruppe: "svaer", navn: "ibuprofen", smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O", antal: 1 }
    ];
    D.FIND_GRUPPER = [
        { id: "let", titel: "Let" },
        { id: "middel", titel: "Middel" },
        { id: "svaer", titel: "Svær" }
    ];
    D.FIND.forEach(function (o) { o.visNavn = o.navn + (o.triv ? " (" + o.triv + ")" : ""); });

    /* ----- Fane 3: R eller S --------------------------------------------------------- */
    D.RS = [
        { id: "r1", mol: "chbrclf", gruppe: "let" },
        { id: "r2", mol: "chbrcli", gruppe: "let" },
        { id: "r3", mol: "clbut", gruppe: "middel" },
        { id: "r4", mol: "but2ol", gruppe: "middel" },
        { id: "r5", mol: "maelk", gruppe: "svaer" },
        { id: "r6", mol: "alanin", gruppe: "svaer" },
        { id: "r7", mol: "glycer", gruppe: "svaer" }
    ];
    D.RS_GRUPPER = [
        { id: "let", titel: "Halogener" },
        { id: "middel", titel: "Med C-grupper" },
        { id: "svaer", titel: "Med C=O" }
    ];
    D.RS.forEach(function (o) { var m = D.MOL[o.mol]; o.navn = m.triv ? m.triv.charAt(0).toUpperCase() + m.triv.slice(1) : m.navn.charAt(0).toUpperCase() + m.navn.slice(1); });

    D.FAERDIG = {
        sb: "Alle seks. Et C-atom med fire forskellige grupper giver to molekyler, der er hinandens spejlbilleder.",
        fi: "Alle 13. Du kan finde de asymmetriske C-atomer.",
        rs: "Alle syv. Du kan bestemme R og S."
    };

    /* Paaskeaegget: mynte og kommen er de to former af carvon */
    D.CARVON = "Carvon findes i to spejlbilledformer: (R)-carvon dufter af grøn mynte, (S)-carvon af kommen.";

    NK.Data = D;
}());
