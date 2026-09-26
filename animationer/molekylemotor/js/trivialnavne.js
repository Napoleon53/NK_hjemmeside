/* =====================================================================
   trivialnavne.js - trivialnavne paa organiske stoffer

   To lister (brugerens oenske 25. sept. 2026):

   VIS: de allermest almindelige trivialnavne. De staar i parentes efter
        det systematiske navn paa tegnebraettet: ethansyre (eddikesyre).
        Noeglen er navnet, som navngivning.js giver det.
   LAES: de fleste trivialnavne, der er i brug i gymnasiet, som eleven kan
        skrive i feltet Skriv et navn. Hvert navn peger paa en lille
        SMILES-streng (smiles.js); stereo "cis" tegner den foerste
        dobbeltbinding som cis, "alleCis" dem alle. Flere stavemaader og de
        engelske navne peger paa den samme post.

   Selvtesten tjekker, at hver post i VIS er navnet paa sit stof, og at
   alle trivialnavne i LAES kan tegnes og navngives.

   Stoffer med to ringe (naphthalen), S (cystein) eller N i en ring
   (histamin, nikotin) er ikke med: dem kan tegnebraettet ikke navngive.
   Carboxylat-ionerne (acetat, citrat, stearat ...) er med som ioner:
   SMILES med [O-].

     NK.Trivialnavne.vis(res)     trivialnavnet til et analyseret molekyle, eller null
     NK.Trivialnavne.laes(tekst)  { smiles, stereo, navn } eller null
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- Vises i parentes ---------------------------------------------------- */
    var VIS = {
        "methanal": "formaldehyd",
        "ethanal": "acetaldehyd",
        "propanon": "acetone",
        "methansyre": "myresyre",
        "ethansyre": "eddikesyre",
        "butansyre": "smørsyre",
        "hexadecansyre": "palmitinsyre",
        "octadecansyre": "stearinsyre",
        "cis-octadec-9-ensyre": "oliesyre",
        "ethandisyre": "oxalsyre",
        "2-hydroxypropansyre": "mælkesyre",
        "2,3-dihydroxybutandisyre": "vinsyre",
        "2-hydroxypropan-1,2,3-tricarboxylsyre": "citronsyre",
        "2-hydroxybenzoesyre": "salicylsyre",
        "2-(acetyloxy)benzoesyre": "acetylsalicylsyre",
        "propan-1,2,3-triol": "glycerol",
        "ethylethanoat": "ethylacetat",
        "ethanamid": "acetamid",
        "N-(4-hydroxyphenyl)ethanamid": "paracetamol",
        "4-hydroxy-3-methoxybenzaldehyd": "vanillin",
        "phenylamin": "anilin",
        "methylbenzen": "toluen",
        "trichlormethan": "chloroform",
        "aminoethansyre": "glycin",
        "2-aminopropansyre": "alanin",
        "2-amino-3-methylbutansyre": "valin",
        "2-amino-4-methylpentansyre": "leucin",
        "2-amino-3-methylpentansyre": "isoleucin",
        "2-amino-3-hydroxypropansyre": "serin",
        "2-amino-3-hydroxybutansyre": "threonin",
        "2-aminobutandisyre": "asparaginsyre",
        "2-aminopentandisyre": "glutaminsyre",
        "2,6-diaminohexansyre": "lysin",
        "2-amino-3-phenylpropansyre": "phenylalanin",
        "2-amino-3-(4-hydroxyphenyl)propansyre": "tyrosin",
        /* carboxylat-ionerne (den korresponderende base) */
        "methanoat": "formiat",
        "ethanoat": "acetat",
        "hexadecanoat": "palmitat",
        "octadecanoat": "stearat",
        "ethandioat": "oxalat",
        "2-hydroxypropanoat": "lactat",
        "2-hydroxypropan-1,2,3-tricarboxylat": "citrat"
    };

    /* ----- Kan skrives i feltet --------------------------------------------------- */
    function p(smiles, navne, stereo) { return { smiles: smiles, navne: navne, stereo: stereo || null }; }
    var POSTER = [
        /* alkoholer */
        p("CO", ["træsprit", "methylalkohol", "methylalcohol"]),
        p("CCO", ["sprit", "ethylalkohol", "ethylalcohol", "husholdningssprit"]),
        p("CC(O)C", ["isopropanol", "isopropylalkohol", "isopropylalcohol"]),
        p("CC(C)(C)O", ["tert-butanol", "tert-butylalkohol", "t-butanol"]),
        p("CC(C)CCO", ["isoamylalkohol", "isopentanol", "isopentylalkohol"]),
        p("C=CCO", ["allylalkohol"]),
        p("OCC(O)CO", ["glycerol", "glycerin", "glycerine"]),
        p("OCCO", ["glycol", "glykol", "ethylenglycol", "ethylenglykol", "ethyleneglycol"]),
        p("CC(O)CO", ["propylenglycol", "propylenglykol"]),
        p("OCC(O)C(O)C(O)C(O)CO", ["sorbitol"]),
        p("OCc1ccccc1", ["benzylalkohol", "benzylalcohol"]),
        p("Oc1ccccc1", ["phenol", "fenol", "carbolsyre"]),
        p("CC(C)C1CCC(C)CC1O", ["menthol"]),
        /* aldehyder og ketoner */
        p("C=O", ["formaldehyd", "formaldehyde", "formalin"]),
        p("CC=O", ["acetaldehyd", "acetaldehyde"]),
        p("C=CC=O", ["acrolein", "akrolein"]),
        p("COc1cc(C=O)ccc1O", ["vanillin", "vanilin"]),
        p("O=CC=Cc1ccccc1", ["kanelaldehyd", "cinnamaldehyd", "cinnamaldehyde"]),
        p("OCC(O)C=O", ["glyceraldehyd"]),
        p("OCC(O)C(O)C(O)C(O)C=O", ["glucose", "druesukker"]),
        p("OCC(O)C(O)C(O)C=O", ["ribose"]),
        p("OCC(O)C(O)C(O)C(=O)CO", ["fructose", "frugtsukker"]),
        p("CC(C)=O", ["acetone", "aceton", "dimethylketon"]),
        p("CCC(C)=O", ["methylethylketon", "mek", "ethylmethylketon"]),
        p("CC(=O)C(C)=O", ["diacetyl"]),
        p("CC(=O)CC(C)=O", ["acetylaceton"]),
        p("OCC(=O)CO", ["dihydroxyaceton"]),
        p("CC(=O)c1ccccc1", ["acetophenon", "acetofenon"]),
        /* carboxylsyrer */
        p("OC=O", ["myresyre", "formicacid"]),
        p("CC(=O)O", ["eddikesyre", "aceticacid", "iseddike"]),
        p("CCC(=O)O", ["propionsyre", "propionicacid"]),
        p("CCCC(=O)O", ["smørsyre", "smoersyre", "butyricacid"]),
        p("CCCCC(=O)O", ["valeriansyre"]),
        p("CCCCCC(=O)O", ["capronsyre", "kapronsyre"]),
        p("CCCCCCCC(=O)O", ["caprylsyre", "kaprylsyre"]),
        p("CCCCCCCCCC(=O)O", ["caprinsyre", "kaprinsyre"]),
        p("CCCCCCCCCCCC(=O)O", ["laurinsyre"]),
        p("CCCCCCCCCCCCCC(=O)O", ["myristinsyre"]),
        p("CCCCCCCCCCCCCCCC(=O)O", ["palmitinsyre", "palmiticacid"]),
        p("CCCCCCCCCCCCCCCCCC(=O)O", ["stearinsyre", "stearicacid"]),
        p("CCCCCCCCC=CCCCCCCCC(=O)O", ["oliesyre", "oleinsyre", "oleicacid"], "cis"),
        p("CCCCCC=CCC=CCCCCCCCC(=O)O", ["linolsyre", "linoleicacid"], "alleCis"),
        p("CCC=CCC=CCC=CCCCCCCCC(=O)O", ["linolensyre"], "alleCis"),
        p("C=CC(=O)O", ["acrylsyre", "akrylsyre"]),
        p("CC=CC=CC(=O)O", ["sorbinsyre"]),
        p("OC(=O)C=CC(=O)O", ["maleinsyre"], "cis"),
        p("OC(=O)C=CC(=O)O", ["fumarsyre"]),
        p("OC(=O)C=Cc1ccccc1", ["kanelsyre"]),
        p("OC(=O)C(=O)O", ["oxalsyre", "oxalicacid"]),
        p("OC(=O)CC(=O)O", ["malonsyre"]),
        p("OC(=O)CCC(=O)O", ["ravsyre", "succinicacid"]),
        p("OC(=O)CCCCC(=O)O", ["adipinsyre"]),
        p("CC(O)C(=O)O", ["mælkesyre", "maelkesyre", "lacticacid"]),
        p("OCC(=O)O", ["glycolsyre", "glykolsyre"]),
        p("CC(=O)C(=O)O", ["pyrodruesyre", "pyruvinsyre"]),
        p("OC(=O)CC(O)C(=O)O", ["æblesyre", "aeblesyre"]),
        p("OC(=O)C(O)C(O)C(=O)O", ["vinsyre"]),
        p("OC(=O)CC(O)(CC(=O)O)C(=O)O", ["citronsyre", "citricacid"]),
        p("OC(=O)c1ccccc1O", ["salicylsyre"]),
        p("CC(=O)Oc1ccccc1C(=O)O", ["acetylsalicylsyre", "aspirin", "acetylsalicylicacid"]),
        p("OC(=O)c1ccccc1C(=O)O", ["phthalsyre", "ftalsyre"]),
        p("OC(=O)c1ccc(cc1)C(=O)O", ["terephthalsyre", "tereftalsyre"]),
        p("OC(=O)c1cc(O)c(O)c(O)c1", ["gallussyre"]),
        p("CC(C)Cc1ccc(cc1)C(C)C(=O)O", ["ibuprofen"]),
        /* carboxylat-ionerne ("ion" bagefter skaeres af: acetation) */
        p("[O-]C=O", ["formiat", "formate"]),
        p("CC(=O)[O-]", ["acetat", "acetate"]),
        p("CCC(=O)[O-]", ["propionat", "propionate"]),
        p("CCCC(=O)[O-]", ["butyrat", "butyrate"]),
        p("CCCCCCCCCCCCCCCC(=O)[O-]", ["palmitat", "palmitate"]),
        p("CCCCCCCCCCCCCCCCCC(=O)[O-]", ["stearat", "stearate"]),
        p("CCCCCCCCC=CCCCCCCCC(=O)[O-]", ["oleat", "oleate"], "cis"),
        p("[O-]C(=O)C(=O)[O-]", ["oxalat", "oxalate"]),
        p("CC(O)C(=O)[O-]", ["lactat", "laktat", "lactate"]),
        p("[O-]C(=O)CC(O)(CC(=O)[O-])C(=O)[O-]", ["citrat", "citrate"]),
        p("[O-]C(=O)c1ccccc1O", ["salicylat", "salicylate"]),
        p("CC(=O)Oc1ccccc1C(=O)[O-]", ["acetylsalicylat"]),
        /* estre */
        p("CCOC(C)=O", ["ethylacetat", "ethylacetate", "eddikesyreethylester"]),
        p("COC(C)=O", ["methylacetat", "methylacetate"]),
        p("CCCCOC(C)=O", ["butylacetat"]),
        p("CCCCCOC(C)=O", ["pentylacetat", "amylacetat"]),
        p("CC(C)CCOC(C)=O", ["isoamylacetat", "isopentylacetat", "banansmag"]),
        p("CCCCCCCCOC(C)=O", ["octylacetat"]),
        p("CC(=O)OCc1ccccc1", ["benzylacetat"]),
        p("CCOC=O", ["ethylformiat"]),
        p("CCCC(=O)OCC", ["ethylbutyrat", "ananasolie"]),
        p("CCCC(=O)OC", ["methylbutyrat"]),
        p("COC(=O)c1ccccc1O", ["methylsalicylat", "vintergrøntolie"]),
        /* aminer, amider og aminosyrer */
        p("Nc1ccccc1", ["anilin", "aniline"]),
        p("NCCO", ["ethanolamin"]),
        p("NCCCCN", ["putrescin"]),
        p("NCCCCCN", ["cadaverin", "kadaverin"]),
        p("NCCc1ccc(O)c(O)c1", ["dopamin"]),
        p("CNCC(O)c1ccc(O)c(O)c1", ["adrenalin", "epinephrin"]),
        p("CC(N)Cc1ccccc1", ["amfetamin", "amphetamin"]),
        p("CC(N)=O", ["acetamid"]),
        p("NC=O", ["formamid"]),
        p("CN(C)C=O", ["dmf", "dimethylformamid"]),
        p("NC(N)=O", ["urinstof", "urea", "carbamid", "karbamid"]),
        p("CC(=O)Nc1ccc(O)cc1", ["paracetamol", "acetaminophen"]),
        p("CC(=O)Nc1ccccc1", ["acetanilid"]),
        p("CCN(CC)CC(=O)Nc1c(C)cccc1C", ["lidocain", "lidokain"]),
        p("NCC(=O)O", ["glycin", "glycine"]),
        p("CC(N)C(=O)O", ["alanin", "alanine"]),
        p("CC(C)C(N)C(=O)O", ["valin", "valine"]),
        p("CC(C)CC(N)C(=O)O", ["leucin", "leucine"]),
        p("CCC(C)C(N)C(=O)O", ["isoleucin", "isoleucine"]),
        p("OCC(N)C(=O)O", ["serin", "serine"]),
        p("CC(O)C(N)C(=O)O", ["threonin", "threonine"]),
        p("OC(=O)CC(N)C(=O)O", ["asparaginsyre", "aspartat", "asparticacid"]),
        p("OC(=O)CCC(N)C(=O)O", ["glutaminsyre", "glutamat", "glutamicacid"]),
        p("NC(=O)CC(N)C(=O)O", ["asparagin", "asparagine"]),
        p("NC(=O)CCC(N)C(=O)O", ["glutamin", "glutamine"]),
        p("NCCCCC(N)C(=O)O", ["lysin", "lysine"]),
        p("NC(Cc1ccccc1)C(=O)O", ["phenylalanin", "fenylalanin", "phenylalanine"]),
        p("NC(Cc1ccc(O)cc1)C(=O)O", ["tyrosin", "tyrosine"]),
        /* ethere */
        p("CCOCC", ["ether", "æter", "aether"]),
        p("COc1ccccc1", ["anisol"]),
        p("COC(C)(C)C", ["mtbe"]),
        /* carbonhydrider og halogenforbindelser */
        p("Cc1ccccc1", ["toluen", "toluene"]),
        p("Cc1ccccc1C", ["o-xylen", "ortho-xylen"]),
        p("Cc1cccc(C)c1", ["m-xylen", "meta-xylen"]),
        p("Cc1ccc(C)cc1", ["p-xylen", "para-xylen"]),
        p("C=Cc1ccccc1", ["styren", "styrene"]),
        p("C=C", ["ethylen", "ethylene"]),
        p("C=CC", ["propylen", "propylene"]),
        p("C#C", ["acetylen", "acetylene"]),
        p("C=C(C)C", ["isobutylen"]),
        p("C=CC=C", ["butadien"]),
        p("C=CC(C)=C", ["isopren"]),
        p("CC1=CCC(CC1)C(C)=C", ["limonen"]),
        p("CC(C)C", ["isobutan"]),
        p("CCC(C)C", ["isopentan"]),
        p("CC(C)(C)C", ["neopentan"]),
        p("CC(C)CC(C)(C)C", ["isooctan", "isooktan"]),
        p("ClC(Cl)Cl", ["chloroform", "kloroform"]),
        p("ClCCl", ["methylenchlorid"]),
        p("ClC(Cl)(Cl)Cl", ["tetrachlorkulstof", "carbontetrachlorid"]),
        p("C=CCl", ["vinylchlorid"]),
        p("FC(F)(F)C(Cl)Br", ["halothan"])
    ];

    var LAES = {};
    POSTER.forEach(function (x) {
        x.navne.forEach(function (n) { LAES[n] = x; });
    });

    function noegle(t) {
        return String(t || "").toLowerCase().replace(/[\s\-‐-―−]/g, "").replace(/\.$/, "");
    }
    var NOEGLER = {};
    Object.keys(LAES).forEach(function (n) { NOEGLER[noegle(n)] = n; });

    NK.Trivialnavne = {
        VIS: VIS,
        POSTER: POSTER,
        vis: function (res) {
            if (!res || !res.navn) return null;
            return VIS[res.navn] || null;
        },
        laes: function (tekst) {
            var n = NOEGLER[noegle(tekst)];
            if (!n) return null;
            var x = LAES[n];
            return { smiles: x.smiles, stereo: x.stereo, navn: n };
        }
    };
}());
