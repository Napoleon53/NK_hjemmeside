/* =====================================================================
   kemi.js - selve kemien i titreringssimulatoren

   Ingen DOM, ingen tegning: filen kan koeres i node (_selvtest) og i
   browseren. Den regner pH ud for en vilkaarlig blanding af syrer,
   baser og salte ved at loese ladningsbalancen - samme idé som i
   CurTiPot (Gutz, USP), bare uden aktivitetskoefficienter.

   Et stof beskrives ved:
       pKa    : syrestyrkekonstanterne pKs1 < pKs2 < ... for HnB
       z      : ladningen af den helt deprotoniserede form B
       k      : hvor mange protoner formen har, NAAR den tilsaettes
                (H3PO4: k = 3, NaH2PO4: k = 2, Na3PO4: k = 0)
       modion : ladning fra modioner pr. formelenhed (Na+ giver +1);
                udregnes som -(z + k), hvis den ikke er angivet
       oh     : antal OH- pr. formelenhed for staerke baser (NaOH: 1)

   Staerke baser har ingen pKa-liste: de bidrager kun med modionen
   (Na+), og OH- kommer automatisk ind gennem vandets Kw. Staerke syrer
   faar en meget lav pKs (HCl: -7), saa alt falder ud af samme formel.

   pH findes ved bisektion paa ladningsbalancen
       [H+] - Kw/[H+] + sum_i c_i * (q_i(pH) + modion_i) = 0
   hvor q_i er stoffets gennemsnitlige ladning ved den pH. Venstresiden
   falder monotont med pH, saa bisektion rammer altid.
   ===================================================================== */
var NK = (typeof window !== "undefined") ? (window.NK = window.NK || {}) : {};

(function () {
    "use strict";

    var Kemi = {};
    NK.Kemi = Kemi;

    Kemi.pKw = 14.00;          /* 25 grader C */

    /* ----- Stofdatabase ---------------------------------------------
       pKs-vaerdier fra CurTiPot-databasen og Databogen (25 grader C,
       I = 0). 'former' gaar fra mest til mindst protoniseret. */
    function stof(o) {
        if (o.modion === undefined) o.modion = -(o.z + o.k);
        if (o.former === undefined) o.former = null;
        return o;
    }

    Kemi.STOFFER = [
        /* --- Staerke syrer --- */
        stof({ id: "hcl", navn: "Saltsyre", formel: "HCl", gruppe: "Stærke syrer", pKa: [-7], z: -1, k: 1, former: ["HCl", "Cl⁻"] }),
        stof({ id: "hno3", navn: "Salpetersyre", formel: "HNO₃", gruppe: "Stærke syrer", pKa: [-1.4], z: -1, k: 1, former: ["HNO₃", "NO₃⁻"] }),
        stof({ id: "h2so4", navn: "Svovlsyre", formel: "H₂SO₄", gruppe: "Stærke syrer", pKa: [-3, 1.99], z: -2, k: 2, former: ["H₂SO₄", "HSO₄⁻", "SO₄²⁻"] }),

        /* --- Svage syrer --- */
        stof({ id: "eddikesyre", navn: "Eddikesyre", formel: "CH₃COOH", gruppe: "Svage syrer", pKa: [4.76], z: -1, k: 1, former: ["CH₃COOH", "CH₃COO⁻"] }),
        stof({ id: "myresyre", navn: "Myresyre", formel: "HCOOH", gruppe: "Svage syrer", pKa: [3.75], z: -1, k: 1, former: ["HCOOH", "HCOO⁻"] }),
        stof({ id: "propansyre", navn: "Propansyre", formel: "C₂H₅COOH", gruppe: "Svage syrer", pKa: [4.87], z: -1, k: 1, former: ["C₂H₅COOH", "C₂H₅COO⁻"] }),
        stof({ id: "benzoesyre", navn: "Benzoesyre", formel: "C₆H₅COOH", gruppe: "Svage syrer", pKa: [4.20], z: -1, k: 1, former: ["C₆H₅COOH", "C₆H₅COO⁻"] }),
        stof({ id: "maelkesyre", navn: "Mælkesyre", formel: "CH₃CH(OH)COOH", gruppe: "Svage syrer", pKa: [3.86], z: -1, k: 1, former: ["HLac", "Lac⁻"] }),
        stof({ id: "chloreddikesyre", navn: "Chloreddikesyre", formel: "ClCH₂COOH", gruppe: "Svage syrer", pKa: [2.87], z: -1, k: 1, former: ["ClCH₂COOH", "ClCH₂COO⁻"] }),
        stof({ id: "acetylsalicylsyre", navn: "Acetylsalicylsyre (aspirin)", formel: "C₉H₈O₄", gruppe: "Svage syrer", pKa: [3.50], z: -1, k: 1, former: ["HAsp", "Asp⁻"] }),
        stof({ id: "hf", navn: "Hydrogenfluorid (flussyre)", formel: "HF", gruppe: "Svage syrer", pKa: [3.17], z: -1, k: 1, former: ["HF", "F⁻"] }),
        stof({ id: "hno2", navn: "Salpetersyrling", formel: "HNO₂", gruppe: "Svage syrer", pKa: [3.15], z: -1, k: 1, former: ["HNO₂", "NO₂⁻"] }),
        stof({ id: "hocl", navn: "Hypochlorsyrling", formel: "HOCl", gruppe: "Svage syrer", pKa: [7.53], z: -1, k: 1, former: ["HOCl", "OCl⁻"] }),
        stof({ id: "hcn", navn: "Hydrogencyanid", formel: "HCN", gruppe: "Svage syrer", pKa: [9.21], z: -1, k: 1, former: ["HCN", "CN⁻"] }),
        stof({ id: "borsyre", navn: "Borsyre", formel: "H₃BO₃", gruppe: "Svage syrer", pKa: [9.24], z: -1, k: 1, former: ["H₃BO₃", "B(OH)₄⁻"] }),
        stof({ id: "phenol", navn: "Phenol", formel: "C₆H₅OH", gruppe: "Svage syrer", pKa: [9.99], z: -1, k: 1, former: ["C₆H₅OH", "C₆H₅O⁻"] }),

        /* --- Flerprotonede syrer --- */
        stof({ id: "kulsyre", navn: "Kulsyre", formel: "H₂CO₃", gruppe: "Flerprotonede syrer", pKa: [6.35, 10.33], z: -2, k: 2, former: ["H₂CO₃", "HCO₃⁻", "CO₃²⁻"] }),
        stof({ id: "svovlsyrling", navn: "Svovlsyrling", formel: "H₂SO₃", gruppe: "Flerprotonede syrer", pKa: [1.85, 7.20], z: -2, k: 2, former: ["H₂SO₃", "HSO₃⁻", "SO₃²⁻"] }),
        stof({ id: "oxalsyre", navn: "Oxalsyre", formel: "H₂C₂O₄", gruppe: "Flerprotonede syrer", pKa: [1.25, 4.27], z: -2, k: 2, former: ["H₂C₂O₄", "HC₂O₄⁻", "C₂O₄²⁻"] }),
        stof({ id: "malonsyre", navn: "Malonsyre", formel: "CH₂(COOH)₂", gruppe: "Flerprotonede syrer", pKa: [2.85, 5.70], z: -2, k: 2, former: ["H₂Mal", "HMal⁻", "Mal²⁻"] }),
        stof({ id: "vinsyre", navn: "Vinsyre", formel: "C₄H₆O₆", gruppe: "Flerprotonede syrer", pKa: [2.98, 4.34], z: -2, k: 2, former: ["H₂Tar", "HTar⁻", "Tar²⁻"] }),
        stof({ id: "ascorbinsyre", navn: "Ascorbinsyre (C-vitamin)", formel: "C₆H₈O₆", gruppe: "Flerprotonede syrer", pKa: [4.10, 11.79], z: -2, k: 2, former: ["H₂Asc", "HAsc⁻", "Asc²⁻"] }),
        stof({ id: "h2s", navn: "Dihydrogensulfid", formel: "H₂S", gruppe: "Flerprotonede syrer", pKa: [7.02, 13.90], z: -2, k: 2, former: ["H₂S", "HS⁻", "S²⁻"] }),
        stof({ id: "phosphorsyre", navn: "Phosphorsyre", formel: "H₃PO₄", gruppe: "Flerprotonede syrer", pKa: [2.15, 7.20, 12.35], z: -3, k: 3, former: ["H₃PO₄", "H₂PO₄⁻", "HPO₄²⁻", "PO₄³⁻"] }),
        stof({ id: "citronsyre", navn: "Citronsyre", formel: "C₆H₈O₇", gruppe: "Flerprotonede syrer", pKa: [3.13, 4.76, 6.40], z: -3, k: 3, former: ["H₃Cit", "H₂Cit⁻", "HCit²⁻", "Cit³⁻"] }),
        stof({ id: "phthalsyre", navn: "Phthalsyre", formel: "C₆H₄(COOH)₂", gruppe: "Flerprotonede syrer", pKa: [2.95, 5.41], z: -2, k: 2, former: ["H₂Pht", "HPht⁻", "Pht²⁻"] }),

        /* --- Aminosyrer (tilsat som den neutrale zwitterion) --- */
        stof({ id: "glycin", navn: "Glycin", formel: "H₂NCH₂COOH", gruppe: "Aminosyrer", pKa: [2.35, 9.78], z: -1, k: 1, former: ["⁺H₃N‑CH₂‑COOH", "⁺H₃N‑CH₂‑COO⁻", "H₂N‑CH₂‑COO⁻"] }),
        stof({ id: "alanin", navn: "Alanin", formel: "C₃H₇NO₂", gruppe: "Aminosyrer", pKa: [2.35, 9.87], z: -1, k: 1, former: ["H₂Ala⁺", "HAla", "Ala⁻"] }),
        stof({ id: "histidin", navn: "Histidin", formel: "C₆H₉N₃O₂", gruppe: "Aminosyrer", pKa: [1.80, 6.02, 9.29], z: -1, k: 1, former: ["H₃His²⁺", "H₂His⁺", "HHis", "His⁻"] }),
        stof({ id: "glutaminsyre", navn: "Glutaminsyre", formel: "C₅H₉NO₄", gruppe: "Aminosyrer", pKa: [2.19, 4.25, 9.67], z: -2, k: 2, former: ["H₃Glu⁺", "H₂Glu", "HGlu⁻", "Glu²⁻"] }),
        stof({ id: "lysin", navn: "Lysin", formel: "C₆H₁₄N₂O₂", gruppe: "Aminosyrer", pKa: [2.18, 8.95, 10.53], z: -1, k: 1, former: ["H₃Lys²⁺", "H₂Lys⁺", "HLys", "Lys⁻"] }),

        /* --- Staerke baser --- */
        stof({ id: "naoh", navn: "Natriumhydroxid", formel: "NaOH", gruppe: "Stærke baser", pKa: [], z: 0, k: 0, modion: 1, oh: 1, former: ["OH⁻"] }),
        stof({ id: "koh", navn: "Kaliumhydroxid", formel: "KOH", gruppe: "Stærke baser", pKa: [], z: 0, k: 0, modion: 1, oh: 1, former: ["OH⁻"] }),
        stof({ id: "baoh2", navn: "Bariumhydroxid", formel: "Ba(OH)₂", gruppe: "Stærke baser", pKa: [], z: 0, k: 0, modion: 2, oh: 2, former: ["OH⁻"] }),
        stof({ id: "caoh2", navn: "Calciumhydroxid", formel: "Ca(OH)₂", gruppe: "Stærke baser", pKa: [], z: 0, k: 0, modion: 2, oh: 2, former: ["OH⁻"] }),

        /* --- Svage baser --- */
        stof({ id: "ammoniak", navn: "Ammoniak", formel: "NH₃", gruppe: "Svage baser", pKa: [9.24], z: 0, k: 0, former: ["NH₄⁺", "NH₃"] }),
        stof({ id: "methylamin", navn: "Methylamin", formel: "CH₃NH₂", gruppe: "Svage baser", pKa: [10.63], z: 0, k: 0, former: ["CH₃NH₃⁺", "CH₃NH₂"] }),
        stof({ id: "ethylamin", navn: "Ethylamin", formel: "C₂H₅NH₂", gruppe: "Svage baser", pKa: [10.64], z: 0, k: 0, former: ["C₂H₅NH₃⁺", "C₂H₅NH₂"] }),
        stof({ id: "dimethylamin", navn: "Dimethylamin", formel: "(CH₃)₂NH", gruppe: "Svage baser", pKa: [10.77], z: 0, k: 0, former: ["(CH₃)₂NH₂⁺", "(CH₃)₂NH"] }),
        stof({ id: "trimethylamin", navn: "Trimethylamin", formel: "(CH₃)₃N", gruppe: "Svage baser", pKa: [9.80], z: 0, k: 0, former: ["(CH₃)₃NH⁺", "(CH₃)₃N"] }),
        stof({ id: "ethanolamin", navn: "Ethanolamin", formel: "HOCH₂CH₂NH₂", gruppe: "Svage baser", pKa: [9.50], z: 0, k: 0, former: ["HOC₂H₄NH₃⁺", "HOC₂H₄NH₂"] }),
        stof({ id: "tris", navn: "Tris (tromethamin)", formel: "C₄H₁₁NO₃", gruppe: "Svage baser", pKa: [8.07], z: 0, k: 0, former: ["TrisH⁺", "Tris"] }),
        stof({ id: "imidazol", navn: "Imidazol", formel: "C₃H₄N₂", gruppe: "Svage baser", pKa: [6.95], z: 0, k: 0, former: ["ImH⁺", "Im"] }),
        stof({ id: "hydroxylamin", navn: "Hydroxylamin", formel: "NH₂OH", gruppe: "Svage baser", pKa: [5.96], z: 0, k: 0, former: ["NH₃OH⁺", "NH₂OH"] }),
        stof({ id: "pyridin", navn: "Pyridin", formel: "C₅H₅N", gruppe: "Svage baser", pKa: [5.23], z: 0, k: 0, former: ["C₅H₅NH⁺", "C₅H₅N"] }),
        stof({ id: "anilin", navn: "Anilin", formel: "C₆H₅NH₂", gruppe: "Svage baser", pKa: [4.60], z: 0, k: 0, former: ["C₆H₅NH₃⁺", "C₆H₅NH₂"] }),

        /* --- Salte: korresponderende baser og amfolytter --- */
        stof({ id: "natriumacetat", navn: "Natriumacetat", formel: "CH₃COONa", gruppe: "Salte", pKa: [4.76], z: -1, k: 0, former: ["CH₃COOH", "CH₃COO⁻"] }),
        stof({ id: "natriumformiat", navn: "Natriumformiat", formel: "HCOONa", gruppe: "Salte", pKa: [3.75], z: -1, k: 0, former: ["HCOOH", "HCOO⁻"] }),
        stof({ id: "natriumbenzoat", navn: "Natriumbenzoat", formel: "C₆H₅COONa", gruppe: "Salte", pKa: [4.20], z: -1, k: 0, former: ["C₆H₅COOH", "C₆H₅COO⁻"] }),
        stof({ id: "natriumfluorid", navn: "Natriumfluorid", formel: "NaF", gruppe: "Salte", pKa: [3.17], z: -1, k: 0, former: ["HF", "F⁻"] }),
        stof({ id: "natriumcyanid", navn: "Natriumcyanid", formel: "NaCN", gruppe: "Salte", pKa: [9.21], z: -1, k: 0, former: ["HCN", "CN⁻"] }),
        stof({ id: "natriumhypochlorit", navn: "Natriumhypochlorit", formel: "NaOCl", gruppe: "Salte", pKa: [7.53], z: -1, k: 0, former: ["HOCl", "OCl⁻"] }),
        stof({ id: "ammoniumchlorid", navn: "Ammoniumchlorid", formel: "NH₄Cl", gruppe: "Salte", pKa: [9.24], z: 0, k: 1, former: ["NH₄⁺", "NH₃"] }),
        stof({ id: "methylammoniumchlorid", navn: "Methylammoniumchlorid", formel: "CH₃NH₃Cl", gruppe: "Salte", pKa: [10.63], z: 0, k: 1, former: ["CH₃NH₃⁺", "CH₃NH₂"] }),
        stof({ id: "nahco3", navn: "Natriumhydrogencarbonat", formel: "NaHCO₃", gruppe: "Salte", pKa: [6.35, 10.33], z: -2, k: 1, former: ["H₂CO₃", "HCO₃⁻", "CO₃²⁻"] }),
        stof({ id: "na2co3", navn: "Natriumcarbonat", formel: "Na₂CO₃", gruppe: "Salte", pKa: [6.35, 10.33], z: -2, k: 0, former: ["H₂CO₃", "HCO₃⁻", "CO₃²⁻"] }),
        stof({ id: "nah2po4", navn: "Natriumdihydrogenphosphat", formel: "NaH₂PO₄", gruppe: "Salte", pKa: [2.15, 7.20, 12.35], z: -3, k: 2, former: ["H₃PO₄", "H₂PO₄⁻", "HPO₄²⁻", "PO₄³⁻"] }),
        stof({ id: "na2hpo4", navn: "Dinatriumhydrogenphosphat", formel: "Na₂HPO₄", gruppe: "Salte", pKa: [2.15, 7.20, 12.35], z: -3, k: 1, former: ["H₃PO₄", "H₂PO₄⁻", "HPO₄²⁻", "PO₄³⁻"] }),
        stof({ id: "na3po4", navn: "Natriumphosphat", formel: "Na₃PO₄", gruppe: "Salte", pKa: [2.15, 7.20, 12.35], z: -3, k: 0, former: ["H₃PO₄", "H₂PO₄⁻", "HPO₄²⁻", "PO₄³⁻"] }),
        stof({ id: "nahso4", navn: "Natriumhydrogensulfat", formel: "NaHSO₄", gruppe: "Salte", pKa: [-3, 1.99], z: -2, k: 1, former: ["H₂SO₄", "HSO₄⁻", "SO₄²⁻"] }),
        stof({ id: "khp", navn: "Kaliumhydrogenphthalat (KHP)", formel: "KHC₈H₄O₄", gruppe: "Salte", pKa: [2.95, 5.41], z: -2, k: 1, former: ["H₂Pht", "HPht⁻", "Pht²⁻"] }),
        stof({ id: "natriumoxalat", navn: "Natriumoxalat", formel: "Na₂C₂O₄", gruppe: "Salte", pKa: [1.25, 4.27], z: -2, k: 0, former: ["H₂C₂O₄", "HC₂O₄⁻", "C₂O₄²⁻"] }),
        stof({ id: "natriumcitrat", navn: "Natriumcitrat", formel: "Na₃C₆H₅O₇", gruppe: "Salte", pKa: [3.13, 4.76, 6.40], z: -3, k: 0, former: ["H₃Cit", "H₂Cit⁻", "HCit²⁻", "Cit³⁻"] }),

        /* --- Andet --- */
        stof({ id: "vand", navn: "Vand (intet stof)", formel: "H₂O", gruppe: "Andet", pKa: [], z: 0, k: 0, modion: 0, former: [] })
    ];

    Kemi.findStof = function (id) {
        for (var i = 0; i < Kemi.STOFFER.length; i++) {
            if (Kemi.STOFFER[i].id === id) return Kemi.STOFFER[i];
        }
        return null;
    };

    /* Bygger et "eget" stof ud fra brugerens pKs-vaerdier.
       type "syre": tilsat helt protoniseret (HnA), neutral, z = -n.
       type "base": tilsat helt deprotoniseret (B), neutral, z = 0.
       pKs gives altid for de korresponderende syrer. */
    Kemi.egetStof = function (type, pKaListe) {
        var pKa = pKaListe.slice().filter(function (v) { return isFinite(v); });
        pKa.sort(function (a, b) { return a - b; });
        var n = pKa.length;
        var navnA = ["A", "HA", "H₂A", "H₃A", "H₄A"];
        var navnB = ["B", "HB⁺", "H₂B²⁺", "H₃B³⁺", "H₄B⁴⁺"];
        var former = [];
        var j;
        if (type === "base") {
            for (j = n; j >= 0; j--) former.push(navnB[j]);
            return stof({ id: "egen_base", navn: "Egen base", formel: "B", gruppe: "Egen", pKa: pKa, z: 0, k: 0, former: former });
        }
        var lad = ["", "⁻", "²⁻", "³⁻", "⁴⁻"];
        for (j = n; j >= 0; j--) former.push(navnA[j] + lad[n - j]);
        return stof({ id: "egen_syre", navn: "Egen syre", formel: "HₙA", gruppe: "Egen", pKa: pKa, z: -n, k: n, former: former });
    };

    /* ----- Fordeling af former ------------------------------------
       Returnerer [alfa_0, ..., alfa_n], hvor alfa_j er broekdelen af
       stoffet med j protoner (alfa_0 er den helt deprotoniserede form).
       Regnes i log10-rum, saa store pKs-summer ikke giver overflow. */
    Kemi.fraktioner = function (pH, s) {
        var n = s.pKa.length;
        var t = new Array(n + 1);
        var sum = 0, maks = -Infinity, j;
        t[0] = 0;
        for (j = 1; j <= n; j++) {
            sum += s.pKa[n - j];          /* pKs for det j'te proton, der saettes paa B */
            t[j] = -j * pH + sum;
        }
        for (j = 0; j <= n; j++) if (t[j] > maks) maks = t[j];
        var w = new Array(n + 1);
        var tot = 0;
        for (j = 0; j <= n; j++) { w[j] = Math.pow(10, t[j] - maks); tot += w[j]; }
        for (j = 0; j <= n; j++) w[j] /= tot;
        return w;
    };

    /* Gennemsnitlig ladning af stoffets syre/base-former ved en pH. */
    Kemi.gennemsnitsladning = function (pH, s) {
        if (s.pKa.length === 0) return s.z;
        var a = Kemi.fraktioner(pH, s);
        var q = 0;
        for (var j = 0; j < a.length; j++) q += (s.z + j) * a[j];
        return q;
    };

    /* ----- pH-loeseren --------------------------------------------
       komponenter: [{ stof, c }]  med c i mol/L. */
    Kemi.ladningsbalance = function (pH, komponenter) {
        var h = Math.pow(10, -pH);
        var sum = h - Math.pow(10, pH - Kemi.pKw);
        for (var i = 0; i < komponenter.length; i++) {
            var k = komponenter[i];
            if (!(k.c > 0)) continue;
            sum += k.c * (Kemi.gennemsnitsladning(pH, k.stof) + k.stof.modion);
        }
        return sum;
    };

    Kemi.pH = function (komponenter) {
        var lav = -2, hoej = 16;
        for (var i = 0; i < 60; i++) {
            var m = 0.5 * (lav + hoej);
            if (Kemi.ladningsbalance(m, komponenter) > 0) lav = m; else hoej = m;
        }
        return 0.5 * (lav + hoej);
    };

    /* ----- Titreringen ---------------------------------------------
       ops = {
           proeve:   [{ stof, c }],   koncentrationer i proeven (mol/L)
           V0:       proevens rumfang i mL
           titrator: { stof, c },
           Vmaks:    stoerste titratorvolumen i mL
       } */
    Kemi.blanding = function (ops, V) {
        var Vt = ops.V0 + V;
        var liste = [];
        for (var i = 0; i < ops.proeve.length; i++) {
            var p = ops.proeve[i];
            if (p.stof && p.c > 0) liste.push({ stof: p.stof, c: p.c * ops.V0 / Vt });
        }
        if (ops.titrator.stof && ops.titrator.c > 0 && V > 0) {
            liste.push({ stof: ops.titrator.stof, c: ops.titrator.c * V / Vt });
        }
        return liste;
    };

    Kemi.pHVed = function (ops, V) {
        return Kemi.pH(Kemi.blanding(ops, V));
    };

    /* Hele den teoretiske kurve med N + 1 punkter. */
    Kemi.kurve = function (ops, N) {
        N = N || 600;
        var V = new Array(N + 1), pH = new Array(N + 1), i;
        for (i = 0; i <= N; i++) {
            V[i] = ops.Vmaks * i / N;
            pH[i] = Kemi.pHVed(ops, V[i]);
        }
        /* Numerisk 1. afledte, dpH/dV, med centrale differenser. */
        var d = new Array(N + 1);
        for (i = 0; i <= N; i++) {
            var a = Math.max(0, i - 1), b = Math.min(N, i + 1);
            d[i] = (pH[b] - pH[a]) / (V[b] - V[a]);
        }
        return { V: V, pH: pH, dpH: d };
    };

    /* ----- Titrerbare "pladser" ------------------------------------
       En plads er et trin, der kan titreres: { pKa, pseudo }.
       Et stof, der tilsaettes som HkB, kan AFGIVE k protoner (pKs'erne
       for de sidste k trin) og MODTAGE n - k protoner. Staerke baser
       har ingen pKs-liste; deres OH- taeller som en pseudo-plads ved
       pKs = pKw, for den proton lander i vandet i stedet. */
    Kemi.donorPladser = function (s) {
        var n = s.pKa.length;
        var ud = [];
        for (var i = n - s.k; i < n; i++) ud.push({ pKa: s.pKa[i], pseudo: false });
        ud.sort(function (a, b) { return a.pKa - b.pKa; });   /* lettest foerst */
        return ud;
    };

    Kemi.acceptorPladser = function (s) {
        var ud = [], i;
        for (i = 0; i < s.pKa.length - s.k; i++) ud.push({ pKa: s.pKa[i], pseudo: false });
        for (i = 0; i < (s.oh || 0); i++) ud.push({ pKa: Kemi.pKw, pseudo: true });
        ud.sort(function (a, b) { return b.pKa - a.pKa; });   /* lettest foerst */
        return ud;
    };

    /* Gennemsnitligt antal protoner paa stoffets syre/base-former. */
    Kemi.middelProtoner = function (pH, s) {
        if (s.pKa.length === 0) return 0;
        var a = Kemi.fraktioner(pH, s);
        var sum = 0;
        for (var j = 0; j < a.length; j++) sum += j * a[j];
        return sum;
    };

    /* Hvad er titratoren - en syre eller en base - og hvor mange
       protoner flytter den pr. formelenhed? */
    Kemi.titratorType = function (s) {
        if (!s) return { type: "ingen", kap: 0, pKa: NaN };
        var don = Kemi.donorPladser(s).filter(function (p) { return p.pKa < 11; });
        if (don.length > 0) return { type: "syre", kap: don.length, pKa: don[0].pKa };
        var acc = Kemi.acceptorPladser(s).filter(function (p) { return p.pKa > 3; });
        if (acc.length > 0) return { type: "base", kap: acc.length, pKa: acc[0].pKa };
        return { type: "ingen", kap: 0, pKa: NaN };
    };

    /* Hvor stor en del af et trin skal vaere omsat ved sit eget
       aekvivalenspunkt, foer det taeller med som et rigtigt punkt.
       Det er den her groense, der sorterer de utitrerbare trin fra -
       fx 3. trin i phosphorsyre (pKs 12,35), som NaOH ikke kan naa. */
    Kemi.MIN_OMSAETNING = 0.6;

    /* Aekvivalenspunkter: for hver titrerbar plads i proeven - sorteret
       efter hvor let den titreres - laegges stofmaengderne sammen, og
       V = n / (c_titrator * kapacitet).

       Hvert punkt proeves af: er trinnet i praksis omsat ved sit eget
       aekvivalenspunkt? Er det ikke, stopper listen der. Det er derfor
       H3PO4 giver to punkter med NaOH og ikke tre.

       Returnerer [{ V, pH, pKa, stof, nr, Vhalv }] sorteret efter V. */
    Kemi.aekvivalenspunkter = function (ops) {
        var t = Kemi.titratorType(ops.titrator.stof);
        var ct = ops.titrator.c;
        if (t.type === "ingen" || !(ct > 0)) return [];
        var medBase = (t.type === "base");

        var pladser = [];
        var maal = [];
        var i, j, liste;
        for (i = 0; i < ops.proeve.length; i++) {
            var p = ops.proeve[i];
            maal.push(p.stof ? p.stof.k : 0);
            if (!p.stof || !(p.c > 0)) continue;
            liste = medBase ? Kemi.donorPladser(p.stof) : Kemi.acceptorPladser(p.stof);
            for (j = 0; j < liste.length; j++) {
                pladser.push({
                    pKa: liste[j].pKa,
                    pseudo: liste[j].pseudo,
                    mol: p.c * ops.V0 / 1000,
                    stof: p.stof,
                    komp: i
                });
            }
        }
        if (medBase) pladser.sort(function (a, b) { return a.pKa - b.pKa; });
        else pladser.sort(function (a, b) { return b.pKa - a.pKa; });

        var ud = [];
        var sum = 0;
        for (i = 0; i < pladser.length; i++) {
            var pl = pladser[i];
            sum += pl.mol;
            var V = sum / (ct * t.kap) * 1000;
            if (V > ops.Vmaks + 1e-9) break;
            var pH = Kemi.pHVed(ops, V);

            /* Er trinnet reelt omsat her? OH- fra en staerk base sidder
               ikke i pKs-listen og slipper uden om proeven. */
            if (!pl.pseudo) {
                var faktisk = Kemi.middelProtoner(pH, pl.stof);
                var grad = medBase ? (maal[pl.komp] - faktisk) : (faktisk - maal[pl.komp]);
                if (grad < Kemi.MIN_OMSAETNING) break;
            }
            maal[pl.komp] += medBase ? -1 : 1;

            var forrige = ud.length ? ud[ud.length - 1].V : 0;
            ud.push({
                V: V,
                pH: pH,
                pKa: pl.pKa,
                pseudo: pl.pseudo,
                stof: pl.stof,
                nr: ud.length + 1,
                Vhalv: forrige + 0.5 * (V - forrige)
            });
        }
        return ud;
    };

    /* Paent maks-volumen: ca. dobbelt op paa sidste aekvivalenspunkt. */
    Kemi.forslaaVmaks = function (ops) {
        var kopi = { proeve: ops.proeve, V0: ops.V0, titrator: ops.titrator, Vmaks: 1e9 };
        var ae = Kemi.aekvivalenspunkter(kopi);
        if (ae.length === 0) return 50;
        var v = ae[ae.length - 1].V * 2;
        var trin = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 150, 200, 250, 300, 400, 500];
        for (var i = 0; i < trin.length; i++) if (trin[i] >= v - 1e-9) return trin[i];
        return 500;
    };

    /* ----- Indikatorer ---------------------------------------------
       farver gaar fra syreform til baseform som [r, g, b, a].
       'a' er farvens daekkraft i kolben - phenolphthaleins syreform er
       farveloes, saa den har a = 0. */
    Kemi.INDIKATORER = [
        { id: "ingen", navn: "Ingen indikator", pKa: [], farver: [[0, 0, 0, 0]], omslag: "–" },
        { id: "phenolphthalein", navn: "Phenolphthalein", pKa: [9.4], farver: [[0, 0, 0, 0], [232, 45, 140, 0.85]], omslag: "8,2 – 10,0" },
        { id: "bromthymolblaat", navn: "Bromthymolblåt", pKa: [7.1], farver: [[240, 205, 40, 0.8], [40, 90, 225, 0.85]], omslag: "6,0 – 7,6" },
        { id: "methylorange", navn: "Methylorange", pKa: [3.46], farver: [[225, 45, 40, 0.85], [245, 190, 40, 0.8]], omslag: "3,1 – 4,4" },
        { id: "methylroedt", navn: "Methylrødt", pKa: [5.0], farver: [[220, 40, 50, 0.85], [245, 210, 50, 0.8]], omslag: "4,4 – 6,2" },
        { id: "bromcresolgroent", navn: "Bromcresolgrønt", pKa: [4.7], farver: [[240, 205, 40, 0.8], [40, 100, 220, 0.85]], omslag: "3,8 – 5,4" },
        { id: "lakmus", navn: "Lakmus", pKa: [6.5], farver: [[220, 60, 70, 0.8], [70, 80, 210, 0.8]], omslag: "4,5 – 8,3" },
        { id: "phenolroedt", navn: "Phenolrødt", pKa: [7.9], farver: [[240, 200, 40, 0.8], [225, 50, 60, 0.85]], omslag: "6,8 – 8,4" },
        { id: "thymolblaat", navn: "Thymolblåt", pKa: [1.65, 8.9], farver: [[225, 45, 40, 0.85], [240, 205, 40, 0.8], [40, 90, 225, 0.85]], omslag: "1,2 – 2,8 og 8,0 – 9,6" },
        { id: "thymolphthalein", navn: "Thymolphthalein", pKa: [9.9], farver: [[0, 0, 0, 0], [40, 80, 210, 0.85]], omslag: "9,3 – 10,5" },
        { id: "alizaringult", navn: "Alizaringult R", pKa: [11.0], farver: [[245, 210, 60, 0.8], [215, 55, 45, 0.85]], omslag: "10,1 – 12,0" },
        { id: "universal", navn: "Universalindikator", pKa: [], skala: true, farver: [], omslag: "hele skalaen" }
    ];

    Kemi.findIndikator = function (id) {
        for (var i = 0; i < Kemi.INDIKATORER.length; i++) {
            if (Kemi.INDIKATORER[i].id === id) return Kemi.INDIKATORER[i];
        }
        return Kemi.INDIKATORER[0];
    };

    /* Universalindikatorens farveskala, stoppunkter i pH. */
    var UNIVERSAL = [
        [0, [200, 20, 40]], [2, [222, 55, 45]], [3, [240, 105, 35]], [4, [246, 160, 35]],
        [5, [242, 210, 50]], [6, [200, 220, 60]], [7, [60, 175, 80]], [8, [45, 160, 150]],
        [9, [45, 125, 195]], [10, [55, 90, 180]], [11, [85, 65, 165]], [12, [105, 45, 150]],
        [14, [75, 25, 110]]
    ];

    /* Indikatorens farve ved en pH: [r, g, b, a]. */
    Kemi.indikatorFarve = function (ind, pH) {
        var i, j;
        if (ind.skala) {
            var p = Math.max(0, Math.min(14, pH));
            for (i = 1; i < UNIVERSAL.length; i++) {
                if (p <= UNIVERSAL[i][0]) {
                    var t = (p - UNIVERSAL[i - 1][0]) / (UNIVERSAL[i][0] - UNIVERSAL[i - 1][0]);
                    var a = UNIVERSAL[i - 1][1], b = UNIVERSAL[i][1];
                    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 0.8];
                }
            }
            return UNIVERSAL[UNIVERSAL.length - 1][1].concat([0.8]);
        }
        var n = ind.pKa.length;
        if (n === 0) return [0, 0, 0, 0];
        var alfa = Kemi.fraktioner(pH, { pKa: ind.pKa });   /* alfa_j: j protoner */
        var aSum = 0, vaegt = 0, rgb = [0, 0, 0];
        for (j = 0; j <= n; j++) {
            var f = ind.farver[n - j];                        /* farver[0] = syreform (n protoner) */
            var w = alfa[j] * f[3];
            aSum += w;
            vaegt += w;
            for (i = 0; i < 3; i++) rgb[i] += w * f[i];
        }
        /* rgb vaegtes med daekkraften, saa den farveloese form ikke
           "udvander" farven mod sort. */
        if (vaegt > 1e-9) for (i = 0; i < 3; i++) rgb[i] /= vaegt;
        return [rgb[0], rgb[1], rgb[2], aSum];
    };

    Kemi.rgba = function (f, aSkala) {
        var a = f[3] * (aSkala === undefined ? 1 : aSkala);
        return "rgba(" + Math.round(f[0]) + "," + Math.round(f[1]) + "," + Math.round(f[2]) + "," + a.toFixed(3) + ")";
    };

    if (typeof module !== "undefined" && module.exports) module.exports = Kemi;
}());
