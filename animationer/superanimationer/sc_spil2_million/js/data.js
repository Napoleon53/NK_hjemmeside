/* =====================================================================
   data.js - spoergsmaal, beloeb, tekster og tal, der kan skrues paa

   Spoergsmaalene er fagordene fra "Fagordsquiz for Kemi C" (sidste fane
   i SelvrettendeKemiC.xlsx), de samme 70 som i den gamle
   c_spil2_million.html. Hvert spoergsmaal er en beskrivelse, og eleven
   skal finde fagordet.

     sp(id, kapitel, beskrivelse da, beskrivelse en, svar da, svar en)

   DET FOERSTE SVAR ER DET RIGTIGE. Svarene blandes, naar spoergsmaalet
   stilles. De to lister med svar skal staa i samme raekkefoelge.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data = {};

    /* ----- Stigen ------------------------------------------------------ */
    D.BELOEB = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000,
        64000, 125000, 250000, 500000, 1000000];

    /* Sikre beloeb: spoergsmaal 5 og 10 (talt fra 0) */
    D.SIKRE = [4, 9];

    /* Svaerhedsgraden foelger kapitlerne: de foerste fem spoergsmaal kommer
       fra kapitel 1 til 3, de naeste fem fra 4, 5 og 7 og de sidste fem fra
       5, 7 og 8. */
    D.TRIN = [
        { til: 4, kap: [1, 2, 3] },
        { til: 9, kap: [4, 5, 7] },
        { til: 14, kap: [5, 7, 8] }
    ];

    /* Titlen paa sejrsskaermen. Escaperoommets segl 1 spoerger efter den
       (c_spil8_escaperoom.html), saa den maa ikke aendres. */
    D.TITEL = "Superkemiker";

    /* ----- Tempo (millisekunder) --------------------------------------- */
    D.TEMPO = {
        foer: 650,                      /* spoergsmaalet staar alene */
        afsloer: 300,                   /* mellem A, B, C og D */
        spaending: [1500, 2300, 3200],  /* ventetid efter Laas svaret, pr. trin */
        taelOp: 900                     /* beloebet taeller op paa slutkortet */
    };

    /* ----- Musik ------------------------------------------------------- */
    /* Ligger filerne i spillets mappe, spilles de under spoergsmaalene i
       stedet for spillets egen baggrundslyd: musik1 til spoergsmaal 1-5,
       musik2 til 6-10 og musik3 til 11-15. Mangler en fil, bruges den
       naermeste med lavere nummer. Enden af filen toner over i starten
       (kryds, i sekunder), saa filen ikke behoever vaere klippet til. */
    D.MUSIK = {
        filer: ["musik1.mp3", "musik2.mp3", "musik3.mp3"],
        styrke: 0.55,
        kryds: 2.0
    };

    /* ----- Kapitlerne -------------------------------------------------- */
    D.KAPITLER = {
        da: {
            1: "Atomer og grundstoffer",
            2: "Ioner og ionforbindelser",
            3: "Molekyler og bindinger",
            4: "Mængdeberegning",
            5: "Koncentration og titrering",
            7: "Syrer og baser",
            8: "Redox"
        },
        en: {
            1: "Atoms and elements",
            2: "Ions and ionic compounds",
            3: "Molecules and bonds",
            4: "Mole calculations",
            5: "Concentration and titration",
            7: "Acids and bases",
            8: "Redox"
        }
    };

    /* ----- Spoergsmaalene ---------------------------------------------- */
    function sp(id, kap, da, en, svarDa, svarEn) {
        return { id: id, kap: kap, b: { da: da, en: en }, svar: { da: svarDa, en: svarEn } };
    }

    D.SPOERGSMAAL = [
        /* --- Kapitel 1: Atomer og grundstoffer --- */
        sp("c1_1", 1, "Kernepartikel med positiv ladning", "Nuclear particle with positive charge",
            ["Proton", "Neutron", "Elektron", "Isotop"], ["Proton", "Neutron", "Electron", "Isotope"]),
        sp("c1_2", 1, "Samme antal protoner, men forskelligt antal neutroner", "Same number of protons, but different number of neutrons",
            ["Isotop", "Ion", "Molekyle", "Isomer"], ["Isotope", "Ion", "Molecule", "Isomer"]),
        sp("c1_3", 1, "Måden, man opskriver en kemisk reaktion på med kemiske symboler og reaktionspil", "The way a chemical reaction is written using chemical symbols and a reaction arrow",
            ["Reaktionsskema", "Strukturformel", "Molekylformel", "Koefficient"], ["Reaction scheme", "Structural formula", "Molecular formula", "Coefficient"]),
        sp("c1_4", 1, "Den form, et kemisk stof har: (aq), (s), (g) eller (l)", "The physical state a chemical substance has: (aq), (s), (g) or (l)",
            ["Tilstandsform", "Oxidationstal", "Molarmasse", "Isotop"], ["State of matter", "Oxidation number", "Molar mass", "Isotope"]),
        sp("c1_5", 1, "Kernepartikel med neutral ladning", "Nuclear particle with neutral charge",
            ["Neutron", "Proton", "Elektron", "Atomnummer"], ["Neutron", "Proton", "Electron", "Atomic number"]),
        sp("c1_6", 1, "Antallet af protoner i et atom (symbol Z)", "The number of protons in an atom (symbol Z)",
            ["Atomnummer", "Massetal", "Molarmasse", "Oxidationstal"], ["Atomic number", "Mass number", "Molar mass", "Oxidation number"]),
        sp("c1_7", 1, "De lodrette søjler i det periodiske system", "The vertical columns in the periodic table",
            ["Gruppe", "Periode", "Blok", "Serie"], ["Group", "Period", "Block", "Series"]),
        sp("c1_8", 1, "Tilstandsformen, der skrives (l)", "The state written as (l)",
            ["Væske", "Gas", "Fast stof", "Opløst i vand"], ["Liquid", "Gas", "Solid", "Dissolved in water"]),
        sp("c1_9", 1, "Reglen om, at grundstoffer fra hovedgrupperne stræber efter 8 elektroner i yderste skal", "The rule that main-group elements strive for 8 electrons in their outer shell",
            ["Ædelgasreglen", "Elektronegativitetsreglen", "Ladningsreglen", "Bindingsreglen"], ["Octet rule", "Electronegativity rule", "Charge rule", "Bonding rule"]),
        sp("c1_10", 1, "De store tal foran stofferne, der bruges til at afstemme et reaktionsskema", "The large numbers in front of the substances, used to balance a reaction scheme",
            ["Koefficient", "Indeks", "Oxidationstal", "Molforhold"], ["Coefficient", "Subscript", "Oxidation number", "Mole ratio"]),

        /* --- Kapitel 2: Ioner og ionforbindelser --- */
        sp("c2_1", 2, "At der kan opløses over 1 g af et salt i 100 mL vand", "That more than 1 g of a salt can dissolve in 100 mL water",
            ["Letopløselig", "Tungtopløselig", "Krystalvand", "Bundfald"], ["Soluble", "Sparingly soluble", "Water of crystallization", "Precipitate"]),
        sp("c2_2", 2, "At der kan opløses under 1 g af et salt i 100 mL vand", "That less than 1 g of a salt can dissolve in 100 mL water",
            ["Tungtopløselig", "Letopløselig", "Fældningsreaktion", "Bundfald"], ["Sparingly soluble", "Soluble", "Precipitation reaction", "Precipitate"]),
        sp("c2_3", 2, "En ion, der består af flere atomer, som tilsammen har optaget eller afgivet elektroner, fx NO₃⁻", "An ion made up of several atoms that together have gained or lost electrons, e.g. NO₃⁻",
            ["Sammensat ion", "Tilskuerion", "Ionforbindelse", "Krystalvand"], ["Polyatomic ion", "Spectator ion", "Ionic compound", "Water of crystallization"]),
        sp("c2_4", 2, "Vandmolekyler, der sidder mellem ionerne i et iongitter", "Water molecules located between the ions in an ionic lattice",
            ["Krystalvand", "Bundfald", "Mikroskopisk", "Trivialnavn"], ["Water of crystallization", "Precipitate", "Microscopic", "Trivial name"]),
        sp("c2_5", 2, "Reaktionstypen, hvor der dannes et tungtopløseligt salt, når man blander to opløsninger af letopløselige salte", "The reaction type where a sparingly soluble salt forms when two solutions of soluble salts are mixed",
            ["Fældningsreaktion", "Ionforbindelse", "Sammensat ion", "Krystalvand"], ["Precipitation reaction", "Ionic compound", "Polyatomic ion", "Water of crystallization"]),
        sp("c2_6", 2, "Ladede partikler, der ikke indgår i en fældningsreaktion, men forbliver opløst i vandet", "Charged particles that do not take part in a precipitation reaction, but remain dissolved in the water",
            ["Tilskuerion", "Sammensat ion", "Letopløselig", "Trivialnavn"], ["Spectator ion", "Polyatomic ion", "Soluble", "Trivial name"]),
        sp("c2_7", 2, "Det uklare slør i en opløsning, når et tungtopløseligt stof lige er udfældet", "The cloudy haze in a solution just as a sparingly soluble substance has precipitated",
            ["Bundfald", "Krystalvand", "Tungtopløselig", "Mikroskopisk"], ["Precipitate", "Water of crystallization", "Sparingly soluble", "Microscopic"]),
        sp("c2_8", 2, "En forbindelse mellem negative og positive ioner", "A compound between negative and positive ions",
            ["Ionforbindelse", "Sammensat ion", "Fældningsreaktion", "Tilskuerion"], ["Ionic compound", "Polyatomic ion", "Precipitation reaction", "Spectator ion"]),
        sp("c2_9", 2, "Et usystematisk kælenavn for et stof, som bruges i dagligdagen, fx salmiak", "An unsystematic pet name for a substance, used in everyday language, e.g. sal ammoniac",
            ["Trivialnavn", "Mikroskopisk", "Ionforbindelse", "Bundfald"], ["Trivial name", "Microscopic", "Ionic compound", "Precipitate"]),
        sp("c2_10", 2, "En beskrivelse, der forholder sig til det molekylære niveau", "A description that relates to the molecular level",
            ["Mikroskopisk", "Trivialnavn", "Krystalvand", "Tilskuerion"], ["Microscopic", "Trivial name", "Water of crystallization", "Spectator ion"]),

        /* --- Kapitel 3: Molekyler og bindinger --- */
        sp("c3_1", 3, "Bindingstypen mellem to ikke-metaller, der danner et fælles elektronpar", "The bond type between two non-metals that forms a shared electron pair",
            ["Kovalent binding", "Ionbinding", "Hydrogenbinding", "Metalbinding"], ["Covalent bond", "Ionic bond", "Hydrogen bond", "Metallic bond"]),
        sp("c3_2", 3, "En kemisk formel, der viser, hvilke atomer og hvor mange af dem der indgår i molekylet, men ikke den rumlige opbygning", "A chemical formula showing which atoms and how many of them are in the molecule, but not the spatial structure",
            ["Molekylformel", "Strukturformel", "Elektronprikformel", "Tilstandsform"], ["Molecular formula", "Structural formula", "Lewis structure", "State of matter"]),
        sp("c3_3", 3, "Et ikke-bindende elektronpar, der sidder på et atom uden at indgå i en binding", "A non-bonding electron pair sitting on an atom without taking part in a bond",
            ["Ledigt elektronpar", "Dobbeltbinding", "Kovalent binding", "Elektronprikformel"], ["Lone pair", "Double bond", "Covalent bond", "Lewis structure"]),
        sp("c3_4", 3, "Et udtryk for et atoms evne til at tiltrække elektroner i en binding", "An expression of an atom's ability to attract electrons in a bond",
            ["Elektronegativitet", "Polaritet", "Oxidationstal", "Molarmasse"], ["Electronegativity", "Polarity", "Oxidation number", "Molar mass"]),
        sp("c3_5", 3, "Den rumlige struktur, man fx ser i CH₄, hvor bindingsvinklerne er 109,5°", "The spatial structure seen e.g. in CH₄, where the bond angles are 109.5°",
            ["Tetraeder", "Trigonal", "Lineær", "Vinklet"], ["Tetrahedral", "Trigonal", "Linear", "Bent"]),
        sp("c3_6", 3, "Betyder vandelskende og er et andet ord for en polær forbindelse", "Means water-loving and is another word for a polar compound",
            ["Hydrofil", "Hydrofob", "Kovalent", "Ionisk"], ["Hydrophilic", "Hydrophobic", "Covalent", "Ionic"]),
        sp("c3_7", 3, "En kemisk formel, der viser hele molekylets rumlige opbygning", "A chemical formula showing the whole molecule's spatial structure",
            ["Strukturformel", "Molekylformel", "Elektronprikformel", "Tetraeder"], ["Structural formula", "Molecular formula", "Lewis structure", "Tetrahedral"]),
        sp("c3_8", 3, "En binding, hvor to atomer deler 2 elektronpar", "A bond where two atoms share 2 electron pairs",
            ["Dobbeltbinding", "Enkeltbinding", "Kovalent binding", "Ionbinding"], ["Double bond", "Single bond", "Covalent bond", "Ionic bond"]),
        sp("c3_9", 3, "En kemisk formel, der viser alle elektronerne i yderste skal, ofte tegnet med prikker", "A chemical formula showing all the electrons in the outer shell, often drawn with dots",
            ["Elektronprikformel", "Strukturformel", "Molekylformel", "Ledigt elektronpar"], ["Lewis structure", "Structural formula", "Molecular formula", "Lone pair"]),
        sp("c3_10", 3, "En skæv fordeling af elektroner i en binding, som skyldes forskel i elektronegativitet", "An uneven distribution of electrons in a bond, caused by a difference in electronegativity",
            ["Polær", "Upolær", "Hydrofob", "Neutral"], ["Polar", "Non-polar", "Hydrophobic", "Neutral"]),

        /* --- Kapitel 4: Mængdeberegning --- */
        sp("c4_1", 4, "Størrelsen, der angiver, hvor meget noget fylder, i kemi typisk angivet i liter", "The quantity indicating how much space something takes up, in chemistry typically given in liters",
            ["Volumen", "Densitet", "Stofmængde", "Molarmasse"], ["Volume", "Density", "Amount of substance", "Molar mass"]),
        sp("c4_2", 4, "Størrelsen, der angiver forholdet mellem masse og volumen, angivet i g/mL", "The quantity indicating the ratio between mass and volume, given in g/mL",
            ["Densitet", "Volumen", "Molarmasse", "Stofmængde"], ["Density", "Volume", "Molar mass", "Amount of substance"]),
        sp("c4_3", 4, "Metaller med en densitet på over 7 g/mL", "Metals with a density over 7 g/mL",
            ["Tungmetal", "Ædelmetal", "Overgangsmetal", "Alkalimetal"], ["Heavy metal", "Noble metal", "Transition metal", "Alkali metal"]),
        sp("c4_4", 4, "Forholdet mellem to koefficienter i et reaktionsskema", "The ratio between two coefficients in a reaction scheme",
            ["Antalsforhold", "Stofmængde", "Molarmasse", "Ækvivalent"], ["Ratio of amounts", "Amount of substance", "Molar mass", "Equivalent"]),
        sp("c4_5", 4, "Størrelsen, der angiver antallet af stofenheder, angivet i enheden mol", "The quantity indicating the number of substance units, given in the unit mol",
            ["Stofmængde", "Molarmasse", "Volumen", "Densitet"], ["Amount of substance", "Molar mass", "Volume", "Density"]),
        sp("c4_6", 4, "Når forholdet mellem stofmængderne svarer til forholdet mellem koefficienterne i reaktionsskemaet", "When the ratio between the amounts of substance matches the ratio between the coefficients in the reaction scheme",
            ["Ækvivalent", "Antalsforhold", "Stofmængde", "Molarmasse"], ["Equivalent", "Ratio of amounts", "Amount of substance", "Molar mass"]),
        sp("c4_7", 4, "Størrelsen, der angiver massen af 1 mol af et stof, med enheden g/mol", "The quantity indicating the mass of 1 mol of a substance, with the unit g/mol",
            ["Molarmasse", "Densitet", "Stofmængde", "Antalsforhold"], ["Molar mass", "Density", "Amount of substance", "Ratio of amounts"]),
        sp("c4_8", 4, "Sammenhængen mellem tryk, volumen, stofmængde og temperatur", "The relationship between pressure, volume, amount of substance and temperature",
            ["Idealgasligningen", "Gaskonstanten", "Boyles lov", "Avogadros lov"], ["Ideal gas law", "Gas constant", "Boyle's law", "Avogadro's law"]),
        sp("c4_9", 4, "Temperaturen 0 K (−273,15 °C), den laveste temperatur, der findes", "The temperature 0 K (−273.15 °C), the lowest temperature that exists",
            ["Det absolutte nulpunkt", "Frysepunktet", "Kogepunktet", "Stuetemperatur"], ["Absolute zero", "Freezing point", "Boiling point", "Room temperature"]),
        sp("c4_10", 4, "Symbolet R, som indgår i idealgasligningen", "The symbol R, which appears in the ideal gas law",
            ["Gaskonstanten", "Avogadros konstant", "Molarmassen", "Antalsforholdet"], ["Gas constant", "Avogadro's constant", "Molar mass", "Ratio of amounts"]),

        /* --- Kapitel 5: Koncentration og titrering --- */
        sp("c5_1", 5, "Størrelsen, der angiver stofmængde pr. volumenenhed af en opløsning", "The quantity indicating amount of substance per unit volume of a solution",
            ["Stofmængdekoncentration", "Densitet", "Molarmasse", "Opløselighed"], ["Molar concentration", "Density", "Molar mass", "Solubility"]),
        sp("c5_2", 5, "Glasudstyret, man bruger til at fremstille og fortynde opløsninger med stor nøjagtighed", "The glassware used to prepare and dilute solutions with high accuracy",
            ["Målekolbe", "Pipette", "Burette", "Bægerglas"], ["Volumetric flask", "Pipette", "Burette", "Beaker"]),
        sp("c5_3", 5, "Glasudstyret, man bruger til at afmåle og overføre en bestemt mængde opløsning", "The glassware used to measure and transfer a specific amount of solution",
            ["Pipette", "Målekolbe", "Burette", "Bægerglas"], ["Pipette", "Volumetric flask", "Burette", "Beaker"]),
        sp("c5_4", 5, "Når man tilsætter vand til en opløsning, så koncentrationen bliver lavere", "When water is added to a solution so the concentration becomes lower",
            ["Fortynding", "Titrering", "Mætning", "Koncentrering"], ["Dilution", "Titration", "Saturation", "Concentrating"]),
        sp("c5_5", 5, "Når der ikke kan opløses mere stof i en opløsning, selvom man tilsætter mere af stoffet", "When no more substance can dissolve in a solution, even if more of the substance is added",
            ["Mættet", "Umættet", "Fortyndet", "Koncentreret"], ["Saturated", "Unsaturated", "Diluted", "Concentrated"]),
        sp("c5_6", 5, "Den type koncentration, der tager højde for kemiske reaktioner og fortæller, hvad opløsningen faktisk indeholder", "The type of concentration that accounts for chemical reactions and tells what the solution actually contains",
            ["Aktuel koncentration", "Formel koncentration", "Densitet", "Ækvivalenspunkt"], ["Actual concentration", "Formal concentration", "Density", "Equivalence point"]),
        sp("c5_7", 5, "Analysemetoden, hvor man bestemmer en ukendt koncentration ved at tildryppe en opløsning med kendt koncentration", "The analysis method where an unknown concentration is determined by adding drops of a solution with known concentration",
            ["Titrering", "Fortynding", "Filtrering", "Destillation"], ["Titration", "Dilution", "Filtration", "Distillation"]),
        sp("c5_8", 5, "Glasudstyret, man typisk bruger til selve tildrypningen under en titrering", "The glassware typically used for the dropwise addition during a titration",
            ["Burette", "Pipette", "Målekolbe", "Bægerglas"], ["Burette", "Pipette", "Volumetric flask", "Beaker"]),
        sp("c5_9", 5, "Et kemisk stof, der fx skifter farve for at vise, hvornår der er tilsat ækvivalente mængder", "A chemical substance that e.g. changes color to show when equivalent amounts have been added",
            ["Indikator", "Titrant", "Katalysator", "Reagens"], ["Indicator", "Titrant", "Catalyst", "Reagent"]),
        sp("c5_10", 5, "Det punkt i en titrering, hvor man netop har tilsat ækvivalente mængder", "The point in a titration where exactly equivalent amounts have just been added",
            ["Ækvivalenspunkt", "Omslagspunkt", "Startpunkt", "Slutpunkt"], ["Equivalence point", "Endpoint", "Starting point", "Final point"]),

        /* --- Kapitel 7: Syrer og baser --- */
        sp("c7_1", 7, "Et stof, der kan modtage en hydron (H⁺)", "A substance that can accept a hydron (H⁺)",
            ["Base", "Syre", "Salt", "Indikator"], ["Base", "Acid", "Salt", "Indicator"]),
        sp("c7_2", 7, "Navnet på den sammensatte ion H₃O⁺, som dannes, når en syre reagerer med vand", "The name of the polyatomic ion H₃O⁺, formed when an acid reacts with water",
            ["Oxonium", "Hydroxid", "Ammonium", "Sulfat"], ["Oxonium", "Hydroxide", "Ammonium", "Sulfate"]),
        sp("c7_3", 7, "Betegnelsen for en syre og dens basemodpart, når de hænger sammen som et par", "The term for an acid and its base counterpart, when they are linked as a pair",
            ["Korresponderende par", "Amfolyt", "Neutralisation", "Buffer"], ["Conjugate pair", "Ampholyte", "Neutralization", "Buffer"]),
        sp("c7_4", 7, "Betegnelsen for syrer, der ikke reagerer fuldstændigt med vand, fx ethansyre", "The term for acids that do not react completely with water, e.g. ethanoic acid",
            ["Svag syre", "Stærk syre", "Sur opløsning", "Basisk opløsning"], ["Weak acid", "Strong acid", "Acidic solution", "Basic solution"]),
        sp("c7_5", 7, "Trivialnavnet for ethansyre, CH₃COOH", "The trivial name for ethanoic acid, CH₃COOH",
            ["Eddikesyre", "Citronsyre", "Mælkesyre", "Myresyre"], ["Acetic acid", "Citric acid", "Lactic acid", "Formic acid"]),
        sp("c7_6", 7, "En opløsning, hvor [H₃O⁺] er større end [OH⁻]", "A solution where [H₃O⁺] is greater than [OH⁻]",
            ["Sur", "Basisk", "Neutral", "Amfoter"], ["Acidic", "Basic", "Neutral", "Amphoteric"]),
        sp("c7_7", 7, "Navnet for vands syre-basereaktion med sig selv", "The name for water's acid-base reaction with itself",
            ["Vands autohydronolyse", "Vands ionprodukt", "Neutralisation", "Hydrolyse"], ["Water's autoprotolysis", "Water's ion product", "Neutralization", "Hydrolysis"]),
        sp("c7_8", 7, "En logaritmisk beskrivelse af [H₃O⁺], nemlig −log[H₃O⁺]", "A logarithmic description of [H₃O⁺], namely −log[H₃O⁺]",
            ["pH", "pKs", "pOH", "Ks"], ["pH", "pKa", "pOH", "Ka"]),
        sp("c7_9", 7, "Navnet på sammenhængen [H₃O⁺] · [OH⁻] = 1,0 · 10⁻¹⁴", "The name for the relationship [H₃O⁺] · [OH⁻] = 1.0 · 10⁻¹⁴",
            ["Vands ionprodukt", "Vands autohydronolyse", "Syrekonstanten", "pH-værdien"], ["Water's ion product", "Water's autoprotolysis", "Acid constant", "pH value"]),
        sp("c7_10", 7, "Et fint ord for en titrering, hvor farveskiftet viser ækvivalenspunktet", "A fancy word for a titration where the color change shows the equivalence point",
            ["Kolorimetrisk", "Gravimetrisk", "Volumetrisk", "Potentiometrisk"], ["Colorimetric", "Gravimetric", "Volumetric", "Potentiometric"]),

        /* --- Kapitel 8: Redox --- */
        sp("c8_1", 8, "En delvis eller fuldstændig afgivelse af elektroner", "A partial or complete loss of electrons",
            ["Oxidation", "Reduktion", "Neutralisation", "Fældning"], ["Oxidation", "Reduction", "Neutralization", "Precipitation"]),
        sp("c8_2", 8, "En delvis eller fuldstændig optagelse af elektroner", "A partial or complete gain of electrons",
            ["Reduktion", "Oxidation", "Ionisering", "Hydronolyse"], ["Reduction", "Oxidation", "Ionization", "Protolysis"]),
        sp("c8_3", 8, "En delvis eller fuldstændig overførsel af elektroner fra ét atom til et andet", "A partial or complete transfer of electrons from one atom to another",
            ["Redoxreaktion", "Syre-basereaktion", "Fældningsreaktion", "Substitutionsreaktion"], ["Redox reaction", "Acid-base reaction", "Precipitation reaction", "Substitution reaction"]),
        sp("c8_4", 8, "Et mål for, hvor mange elektroner et atom har afgivet eller optaget, helt eller delvist", "A measure of how many electrons an atom has lost or gained, fully or partially",
            ["Oxidationstal", "Atomnummer", "Ladningstal", "Koefficient"], ["Oxidation number", "Atomic number", "Charge number", "Coefficient"]),
        sp("c8_5", 8, "En rækkefølge af grundstoffer, ordnet efter deres villighed til at afgive elektroner", "A ranking of elements ordered by their willingness to lose electrons",
            ["Spændingsrækken", "Det periodiske system", "Ædelgasreglen", "Elektronegativitetsskalaen"], ["Activity series", "The periodic table", "Octet rule", "Electronegativity scale"]),
        sp("c8_6", 8, "Metaller yderst til højre i spændingsrækken, som derfor er stabile i deres metalliske form", "Metals furthest to the right in the activity series, and therefore stable in their metallic form",
            ["Ædelmetal", "Tungmetal", "Letmetal", "Uædelt metal"], ["Noble metal", "Heavy metal", "Light metal", "Base metal"]),
        sp("c8_7", 8, "Grundstoffet med elektronegativitet 3,5, som ofte har oxidationstallet −II", "The element with electronegativity 3.5, which often has the oxidation number −II",
            ["Oxygen", "Nitrogen", "Chlor", "Svovl"], ["Oxygen", "Nitrogen", "Chlorine", "Sulfur"]),
        sp("c8_8", 8, "Det systematiske navn for den violette forbindelse KMnO₄, der ofte bruges som oxidationsmiddel", "The systematic name for the purple compound KMnO₄, often used as an oxidizing agent",
            ["Kaliumpermanganat", "Kaliumdichromat", "Natriumhypochlorit", "Kobber(II)sulfat"], ["Potassium permanganate", "Potassium dichromate", "Sodium hypochlorite", "Copper(II) sulfate"]),
        sp("c8_9", 8, "Navnet for forbindelsen H₂O₂, der ofte bruges i redoxreaktioner", "The name for the compound H₂O₂, often used in redox reactions",
            ["Hydrogenperoxid", "Hydrogenchlorid", "Dihydrogenoxid", "Carbondioxid"], ["Hydrogen peroxide", "Hydrogen chloride", "Dihydrogen monoxide", "Carbon dioxide"]),
        sp("c8_10", 8, "Navnet for gassen H₂, som indgår i spændingsrækken", "The name for the gas H₂, which appears in the activity series",
            ["Hydrogen", "Oxygen", "Nitrogen", "Helium"], ["Hydrogen", "Oxygen", "Nitrogen", "Helium"])
    ];

    /* ----- Rosen til den, der vinder ----------------------------------- */
    /* Samme nummer i de to lister er den samme ros. */
    D.ROS = {
        da: [
            "Din hjerne er hermed forsikret som værdifuldt laboratorieudstyr.",
            "Nationalbanken overvejer at trykke en seddel med dit ansigt på. Værdien er 1 kemi-millionær.",
            "Vi har målt din reaktionshastighed. Den er højere end en velkatalyseret eksplosions.",
            "Dit navn er foreslået som SI-enhed for kemisk snilde.",
            "Det periodiske system har rykket rundt på et par grundstoffer for at gøre plads til dig."
        ],
        en: [
            "Your brain is hereby insured as valuable laboratory equipment.",
            "The mint is considering printing a banknote with your face on it. Its value is 1 chemistry millionaire.",
            "We measured your reaction rate. It is higher than that of a well-catalyzed explosion.",
            "Your name has been proposed as the SI unit for chemical genius.",
            "The periodic table has moved a couple of elements to make room for you."
        ]
    };

    /* ----- Teksterne ---------------------------------------------------- */
    D.TEKST = {
        da: {
            titel: "Kemi-Millionær",
            forTitel: "Hvem vil være",
            storTitel: "Kemi-millionær?",
            undertitel: "15 fagord fra Kemi C. Spørgsmålene bliver sværere undervejs.",
            chips: ["15 spørgsmål", "Sikre beløb ved 5 og 10", "3 livliner"],
            start: "Start spillet",
            regler: "Regler",
            luk: "Luk",
            stige: "Gevinst",
            sikret: "Sikret",
            sikretTip: "Det beløb, du beholder ved et forkert svar",
            rekord: "Rekord",
            ingenRekord: "ingen",
            ledetekst: "Hvilket fagord passer?",
            spoergsmaalAf: function (n) { return "Spørgsmål " + n + " af 15"; },
            kapitel: function (k, navn) { return "Kapitel " + k + " · " + navn; },
            spillerOm: function (kr) { return "Spiller om " + kr; },
            laasSvaret: "Lås svaret",
            naeste: "Næste spørgsmål",
            seGevinst: "Se gevinsten",
            seResultat: "Se resultatet",
            stopOgTag: function (kr) { return "Stop og tag " + kr; },
            bekraeft: function (kr) { return "Vil du stoppe og gå hjem med " + kr + "?"; },
            ja: "Ja, stop",
            nej: "Nej, spil videre",
            nytSpil: "Nyt spil",
            nyRekord: "Ny rekord",
            livliner: {
                halv: { navn: "To væk", tip: "Fjerner to forkerte svar (5)" },
                fjern: { navn: "Én væk", tip: "Fjerner ét forkert svar (6)" },
                byt: { navn: "Nyt spørgsmål", tip: "Bytter spørgsmålet ud med et andet, der er lige så svært (7)" }
            },
            brugt: "Livlinen er brugt.",
            spaerret: "Kan ikke bruges, når der kun er ét forkert svar tilbage.",
            lydTil: "Lyden er til. Klik for at slå den fra (M)",
            lydFra: "Lyden er fra. Klik for at slå den til (M)",
            skiftSprog: "Switch to English",
            rundvisning: "Rundvisning (H)",
            lyde: "Lyde",
            musikEgen: "Baggrundslyden er spillets egen.",
            musikFil: "Baggrundsmusikken kommer fra lydfiler i spillets mappe.",

            /* Statuslinjen */
            sTitel: "Tryk Start spillet eller Enter.",
            sLaes: "Læs beskrivelsen.",
            sVaelg: "Vælg et svar, og lås det.",
            sValgt: function (b) { return "Du har valgt <b>" + b + "</b>. Lås svaret, eller vælg et andet."; },
            sLaast: "Svaret er låst.",
            sRigtigt: function (kr) { return "Rigtigt. Du har nu <b>" + kr + "</b>"; },
            sSikret: function (kr) { return "Rigtigt. <b>" + kr + "</b> er sikret."; },
            sForkert: function (svar) { return "Forkert. Det rigtige svar er <b>" + svar + "</b>."; },
            sPasserTil: function (ord, b) { return "<b>" + ord + "</b> passer til: “" + b + "”."; },
            sHalv: "To forkerte svar er fjernet.",
            sFjern: "Ét forkert svar er fjernet.",
            sByt: "Spørgsmålet er byttet ud.",
            sStop: function (kr) { return "Svarer du forkert, går du hjem med <b>" + kr + "</b>"; },

            /* Slutkortet */
            tabtTitel: "Spillet er slut",
            stoppetTitel: "Du stoppede i tide",
            gaarHjem: "Du går hjem med",
            svaretVar: function (n, svar) { return "Svaret på spørgsmål " + n + " var <b>" + svar + "</b>."; },
            vundetTitel: "Tillykke! Du er Kemi-millionær",
            vundetTekst: "Du har svaret rigtigt på alle 15 spørgsmål og vundet",
            kaaret: "Du er hermed officielt kåret til",

            reglerDele: [
                ["Målet", "Svar rigtigt på 15 spørgsmål om fagord fra Kemi C. Hvert spørgsmål er en beskrivelse, og du skal finde fagordet. De første er lettest."],
                ["Svaret", "Vælg et svar, og tryk <b>Lås svaret</b>. Først da gælder det, så du kan nå at vælge om."],
                ["Sikre beløb", "Ved spørgsmål 5 og 10 er beløbet sikret. Svarer du senere forkert, går du hjem med det sikrede beløb. Svarer du forkert før spørgsmål 6, går du hjem med 0 kr."],
                ["Stop", "Fra spørgsmål 2 kan du stoppe og tage det, du har vundet. Det skal ske, før du låser et svar."],
                ["Livliner", "Hver livline kan bruges én gang. <b>To væk</b> (50:50) fjerner to forkerte svar. <b>Én væk</b> fjerner ét forkert svar. <b>Nyt spørgsmål</b> bytter spørgsmålet ud med et andet, der er lige så svært."]
            ],
            genvejeTitel: "Genveje",
            genveje: "<kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> vælg svar &nbsp;·&nbsp; <kbd>Enter</kbd> lås og gå videre &nbsp;·&nbsp; <kbd>5</kbd> <kbd>6</kbd> <kbd>7</kbd> livliner &nbsp;·&nbsp; <kbd>S</kbd> stop &nbsp;·&nbsp; <kbd>M</kbd> lyd &nbsp;·&nbsp; <kbd>H</kbd> rundvisning &nbsp;·&nbsp; <kbd>Esc</kbd> luk",

            turForrige: "← Forrige",
            turNaeste: "Næste →",
            turAfslut: "Afslut",
            tur: [
                { sel: "#startknap", titel: "Start", tekst: "Spillet har 15 spørgsmål. Du får nye spørgsmål, hver gang du starter." },
                { sel: "#spoergsmaal", titel: "Beskrivelsen", tekst: "Her står en beskrivelse. Du skal finde det fagord, der passer til den." },
                { sel: "#svarnet", titel: "De fire svar", tekst: "Klik på et svar for at vælge det. Du kan vælge om, indtil du låser svaret." },
                { sel: "#hovedknap", titel: "Lås svaret", tekst: "Først når svaret er låst, gælder det. Den samme knap går videre til næste spørgsmål." },
                { sel: "#livliner", titel: "Livlinerne", tekst: "Tre slags hjælp, der hver kan bruges én gang. Gem dem til de svære spørgsmål." },
                { sel: "#stopknap", titel: "Stop", tekst: "Er du i tvivl, kan du stoppe og beholde det, du har vundet." },
                { sel: "#stige", titel: "Stigen", tekst: "Hvert rigtigt svar er et trin op. De hvide beløb er sikre: dem beholder du, selv om du senere svarer forkert." },
                { sel: "#talkort", titel: "Sikret og rekord", tekst: "Sikret er det, du går hjem med ved et forkert svar. Rekorden er din største gevinst i denne browser." }
            ]
        },

        en: {
            titel: "Chemistry Millionaire",
            forTitel: "Who wants to be a",
            storTitel: "Chemistry Millionaire?",
            undertitel: "15 terms from Chemistry C. The questions get harder along the way.",
            chips: ["15 questions", "Safe amounts at 5 and 10", "3 lifelines"],
            start: "Start the game",
            regler: "Rules",
            luk: "Close",
            stige: "Prize",
            sikret: "Safe",
            sikretTip: "The amount you keep after a wrong answer",
            rekord: "Record",
            ingenRekord: "none",
            ledetekst: "Which term fits?",
            spoergsmaalAf: function (n) { return "Question " + n + " of 15"; },
            kapitel: function (k, navn) { return "Chapter " + k + " · " + navn; },
            spillerOm: function (kr) { return "Playing for " + kr; },
            laasSvaret: "Lock the answer",
            naeste: "Next question",
            seGevinst: "See your prize",
            seResultat: "See the result",
            stopOgTag: function (kr) { return "Stop and take " + kr; },
            bekraeft: function (kr) { return "Do you want to stop and go home with " + kr + "?"; },
            ja: "Yes, stop",
            nej: "No, keep playing",
            nytSpil: "New game",
            nyRekord: "New record",
            livliner: {
                halv: { navn: "Two gone", tip: "Removes two wrong answers (5)" },
                fjern: { navn: "One gone", tip: "Removes one wrong answer (6)" },
                byt: { navn: "New question", tip: "Swaps the question for another that is just as hard (7)" }
            },
            brugt: "The lifeline has been used.",
            spaerret: "Cannot be used when only one wrong answer is left.",
            lydTil: "Sound is on. Click to turn it off (M)",
            lydFra: "Sound is off. Click to turn it on (M)",
            skiftSprog: "Skift til dansk",
            rundvisning: "Guided tour (H)",
            lyde: "Sound",
            musikEgen: "The background sound is the game's own.",
            musikFil: "The background music comes from sound files in the game's folder.",

            sTitel: "Press Start the game or Enter.",
            sLaes: "Read the description.",
            sVaelg: "Choose an answer and lock it.",
            sValgt: function (b) { return "You have chosen <b>" + b + "</b>. Lock the answer, or choose another."; },
            sLaast: "The answer is locked.",
            sRigtigt: function (kr) { return "Correct. You now have <b>" + kr + "</b>"; },
            sSikret: function (kr) { return "Correct. <b>" + kr + "</b> is safe."; },
            sForkert: function (svar) { return "Wrong. The correct answer is <b>" + svar + "</b>."; },
            sPasserTil: function (ord, b) { return "<b>" + ord + "</b> fits: “" + b + "”."; },
            sHalv: "Two wrong answers have been removed.",
            sFjern: "One wrong answer has been removed.",
            sByt: "The question has been swapped.",
            sStop: function (kr) { return "If you answer wrong, you go home with <b>" + kr + "</b>"; },

            tabtTitel: "Game over",
            stoppetTitel: "You stopped in time",
            gaarHjem: "You go home with",
            svaretVar: function (n, svar) { return "The answer to question " + n + " was <b>" + svar + "</b>."; },
            vundetTitel: "Congratulations! You are a Chemistry Millionaire",
            vundetTekst: "You have answered all 15 questions correctly and won",
            kaaret: "You are hereby officially crowned",

            reglerDele: [
                ["The goal", "Answer 15 questions about terms from Chemistry C correctly. Each question is a description, and you must find the term. The first ones are the easiest."],
                ["The answer", "Choose an answer and press <b>Lock the answer</b>. Only then does it count, so you can still change your mind."],
                ["Safe amounts", "At questions 5 and 10 the amount is safe. If you answer wrong later, you go home with the safe amount. If you answer wrong before question 6, you go home with 0 kr."],
                ["Stop", "From question 2 you can stop and take what you have won. It must happen before you lock an answer."],
                ["Lifelines", "Each lifeline can be used once. <b>Two gone</b> (50:50) removes two wrong answers. <b>One gone</b> removes one wrong answer. <b>New question</b> swaps the question for another that is just as hard."]
            ],
            genvejeTitel: "Shortcuts",
            genveje: "<kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> choose &nbsp;·&nbsp; <kbd>Enter</kbd> lock and continue &nbsp;·&nbsp; <kbd>5</kbd> <kbd>6</kbd> <kbd>7</kbd> lifelines &nbsp;·&nbsp; <kbd>S</kbd> stop &nbsp;·&nbsp; <kbd>M</kbd> sound &nbsp;·&nbsp; <kbd>H</kbd> tour &nbsp;·&nbsp; <kbd>Esc</kbd> close",

            turForrige: "← Back",
            turNaeste: "Next →",
            turAfslut: "Finish",
            tur: [
                { sel: "#startknap", titel: "Start", tekst: "The game has 15 questions. You get new questions every time you start." },
                { sel: "#spoergsmaal", titel: "The description", tekst: "Here is a description. You must find the term that fits it." },
                { sel: "#svarnet", titel: "The four answers", tekst: "Click an answer to choose it. You can change it until you lock the answer." },
                { sel: "#hovedknap", titel: "Lock the answer", tekst: "The answer only counts once it is locked. The same button moves on to the next question." },
                { sel: "#livliner", titel: "The lifelines", tekst: "Three kinds of help, each usable once. Save them for the hard questions." },
                { sel: "#stopknap", titel: "Stop", tekst: "If you are in doubt, you can stop and keep what you have won." },
                { sel: "#stige", titel: "The ladder", tekst: "Each correct answer is a step up. The white amounts are safe: you keep them even if you answer wrong later." },
                { sel: "#talkort", titel: "Safe and record", tekst: "Safe is what you go home with after a wrong answer. The record is your largest prize in this browser." }
            ]
        }
    };
}());
