/* =====================================================================
   data.js - stofferne, molekylerne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her. Kemien regnes
   i js/ox.js: oxidationstallene efter reglerne paa fane 1 og
   elektronregnskabet paa fane 2. Her staar kun formlerne, ladningerne,
   tegningerne af molekylerne og teksterne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Grundstofferne ------------------------------------------------------
       en: Paulings elektronegativitet med én decimal (Databogen, samme tal
       som den gamle c8.3 og sc3.3). v: valenselektroner. farve: symbolet og
       dets elektroner paa den moerke tavle. */
    D.GRUNDSTOF = {
        H:  { navn: "hydrogen", en: 2.1, v: 1, farve: "#eef2f6" },
        C:  { navn: "carbon",   en: 2.5, v: 4, farve: "#8e99a8" },
        N:  { navn: "nitrogen", en: 3.0, v: 5, farve: "#86aaff" },
        O:  { navn: "oxygen",   en: 3.5, v: 6, farve: "#ff8474" },
        F:  { navn: "fluor",    en: 4.0, v: 7, farve: "#bfe46e" },
        S:  { navn: "svovl",    en: 2.5, v: 6, farve: "#f4d661" },
        Cl: { navn: "chlor",    en: 3.0, v: 7, farve: "#74d886" }
    };

    /* Den ekstra elektron i en negativ ion (OH⁻) */
    D.EKSTRA_FARVE = "#c9a2ff";

    /* ----- Fane 1: reglerne -----------------------------------------------------
       f: formlen med almindelige tal, q: ladningen. Det ukendte grundstof
       er det, der hverken er O eller H (eller det eneste). trin: de seks
       foerste gennemgaas trin for trin (ladning, O, H, det ukendte), resten
       er oevelse, hvor kun det ukendte spoerges.
       navn: det, der staar paa tavlen, foer opgaven er loest. Navne med
       romertal (mangan(IV)oxid) ville vise facit, saa de kommer foerst i
       noten bagefter. De seks trin og de 25 oevestoffer er dem fra c8.2
       (fra SelvrettendeKemiC.xlsx); S₂O₈²⁻ er skiftet ud med H₂S, og det
       ene CO₂ med CH₄. */
    D.GRUPPER_RG = [
        { id: "trin", titel: "Trin for trin" },
        { id: "mangan", titel: "Mangan" },
        { id: "nitrogen", titel: "Nitrogen" },
        { id: "carbon", titel: "Carbon" },
        { id: "svovl", titel: "Svovl" }
    ];

    D.REGLER = [
        { id: "co2",     gruppe: "trin", f: "CO2",   q: 0,  navn: "Carbondioxid" },
        { id: "nh4",     gruppe: "trin", f: "NH4",   q: 1,  navn: "Ammonium-ion" },
        { id: "clo3",    gruppe: "trin", f: "ClO3",  q: -1, navn: "Chlorat-ion" },
        { id: "h2so4",   gruppe: "trin", f: "H2SO4", q: 0,  navn: "Svovlsyre" },
        { id: "cro4",    gruppe: "trin", f: "CrO4",  q: -2, navn: "Chromat-ion" },
        { id: "cr2o7",   gruppe: "trin", f: "Cr2O7", q: -2, navn: "Dichromat-ion",
          note: "Der er 2 Cr, så summen deles mellem dem." },

        { id: "mno2",    gruppe: "mangan", f: "MnO2",  q: 0,  navn: "Mangandioxid",
          note: "Derfor hedder stoffet også mangan(IV)oxid." },
        { id: "mn",      gruppe: "mangan", f: "Mn",    q: 2,  navn: "Manganion",
          note: "En ion af ét atom har ionens ladning som oxidationstal." },
        { id: "mno4_2",  gruppe: "mangan", f: "MnO4",  q: -2, navn: "Manganat-ion" },
        { id: "mn2o7",   gruppe: "mangan", f: "Mn2O7", q: 0,  navn: "Dimanganheptaoxid",
          note: "Der er 2 Mn, så summen deles mellem dem. Stoffet hedder også mangan(VII)oxid." },
        { id: "mno4",    gruppe: "mangan", f: "MnO4",  q: -1, navn: "Permanganat-ion" },

        { id: "no",      gruppe: "nitrogen", f: "NO",   q: 0,  navn: "Nitrogenmonoxid" },
        { id: "no2",     gruppe: "nitrogen", f: "NO2",  q: 0,  navn: "Nitrogendioxid" },
        { id: "n2o5",    gruppe: "nitrogen", f: "N2O5", q: 0,  navn: "Dinitrogenpentaoxid" },
        { id: "n2o",     gruppe: "nitrogen", f: "N2O",  q: 0,  navn: "Dinitrogenoxid (lattergas)" },
        { id: "no2m",    gruppe: "nitrogen", f: "NO2",  q: -1, navn: "Nitrit-ion" },
        { id: "nh3",     gruppe: "nitrogen", f: "NH3",  q: 0,  navn: "Ammoniak" },
        { id: "no3",     gruppe: "nitrogen", f: "NO3",  q: -1, navn: "Nitrat-ion" },
        { id: "hno3",    gruppe: "nitrogen", f: "HNO3", q: 0,  navn: "Salpetersyre" },

        { id: "co",      gruppe: "carbon", f: "CO",   q: 0,  navn: "Carbonmonoxid" },
        { id: "ch4",     gruppe: "carbon", f: "CH4",  q: 0,  navn: "Methan",
          note: "C kan have alt fra −IV til +IV." },
        { id: "c2o4",    gruppe: "carbon", f: "C2O4", q: -2, navn: "Oxalat-ion" },
        { id: "co3",     gruppe: "carbon", f: "CO3",  q: -2, navn: "Carbonat-ion" },
        { id: "hco3",    gruppe: "carbon", f: "HCO3", q: -1, navn: "Hydrogencarbonat-ion" },

        { id: "so3",     gruppe: "svovl", f: "SO3",  q: 0,  navn: "Svovltrioxid" },
        { id: "hso3",    gruppe: "svovl", f: "HSO3", q: -1, navn: "Hydrogensulfit-ion" },
        { id: "so4",     gruppe: "svovl", f: "SO4",  q: -2, navn: "Sulfat-ion" },
        { id: "h2s",     gruppe: "svovl", f: "H2S",  q: 0,  navn: "Hydrogensulfid" },
        { id: "so2",     gruppe: "svovl", f: "SO2",  q: 0,  navn: "Svovldioxid" },
        { id: "s2o3",    gruppe: "svovl", f: "S2O3", q: -2, navn: "Thiosulfat-ion" },
        { id: "s8",      gruppe: "svovl", f: "S8",   q: 0,  navn: "Svovl",
          note: "Et grundstof har altid oxidationstallet 0, uanset hvor mange atomer der sidder sammen." }
    ];

    /* ----- Fane 2: elektronerne --------------------------------------------------
       De tolv molekyler og ioner fra c8.3 i samme raekkefoelge. Tegningen er
       en elektronprikformel som i bogen: atomerne staar i et gitter (gx, gy
       i bindingslaengder), bindingerne er vandrette eller lodrette, og de
       frie elektronpar sidder paa de ledige sider. Antallet af frie
       elektroner regnes ud af valenselektronerne (js/ox.js).
       spoerg: de grundstoffer, eleven gaetter paa.
       ekstra / mangler: det atom, der har ionens ekstra elektron, eller som
       mangler én.
       forklar: teksten, naar regnskabet er gjort op. Tallene i den tjekkes
       af selvtesten mod modellen. */
    D.MOLEKYLER = [
        { id: "h2o", navn: "Vand", f: "H2O", q: 0, spoerg: ["O", "H"],
          atomer: [["H", -1, 0], ["O", 0, 0], ["H", 1, 0]],
          bindinger: [[0, 1, 1], [1, 2, 1]],
          forklar: "O trækker parrene fra begge H. O har 6 valenselektroner og ender med 8: 6 − 8 = −2, så O er −II. Hvert H har mistet sin elektron: 1 − 0 = +1, så H er +I." },
        { id: "hcl", navn: "Hydrogenchlorid", f: "HCl", q: 0, spoerg: ["Cl"],
          atomer: [["H", 0, 0], ["Cl", 1, 0]],
          bindinger: [[0, 1, 1]],
          forklar: "Cl trækker hårdere end H. Cl har 7 valenselektroner og ender med 8: 7 − 8 = −1, så Cl er −I." },
        { id: "h2s", navn: "Hydrogensulfid", f: "H2S", q: 0, spoerg: ["S"],
          atomer: [["H", -1, 0], ["S", 0, 0], ["H", 1, 0]],
          bindinger: [[0, 1, 1], [1, 2, 1]],
          forklar: "S trækker hårdere end H, ligesom O i vand. S ender med 8 i stedet for 6: 6 − 8 = −2, så S er −II." },
        { id: "so2", navn: "Svovldioxid", f: "SO2", q: 0, spoerg: ["S"],
          atomer: [["O", -1, 0], ["S", 0, 0], ["O", 1, 0]],
          bindinger: [[0, 1, 2], [1, 2, 2]],
          forklar: "O tager alle fire elektroner i hver dobbeltbinding. S har kun sit frie par tilbage: 6 − 2 = +4, så S er +IV." },
        { id: "ch3oh", navn: "Methanol", f: "CH3OH", q: 0, spoerg: ["C"],
          atomer: [["C", 0, 0], ["H", 0, -1], ["H", -1, 0], ["H", 0, 1], ["O", 1, 0], ["H", 2, 0]],
          bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [4, 5, 1]],
          forklar: "C får parrene fra de tre H, men mister parret til O. C ender med 6: 4 − 6 = −2, så C er −II." },
        { id: "c2h4", navn: "Ethen", f: "C2H4", q: 0, spoerg: ["C"],
          atomer: [["C", 0, 0], ["C", 1, 0], ["H", 0, -1], ["H", 0, 1], ["H", 1, -1], ["H", 1, 1]],
          bindinger: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
          forklar: "Hvert C får parrene fra sine to H. Dobbeltbindingen mellem de to C deles ligeligt. C ender med 6: 4 − 6 = −2, så C er −II." },
        { id: "h2", navn: "Hydrogen", f: "H2", q: 0, spoerg: ["H"],
          atomer: [["H", 0, 0], ["H", 1, 0]],
          bindinger: [[0, 1, 1]],
          forklar: "To ens atomer trækker lige hårdt. Hvert H beholder sin egen elektron: 1 − 1 = 0. Et grundstof har altid 0." },
        { id: "o2", navn: "Oxygen", f: "O2", q: 0, spoerg: ["O"],
          atomer: [["O", 0, 0], ["O", 1, 0]],
          bindinger: [[0, 1, 2]],
          forklar: "Dobbeltbindingen deles ligeligt. Hvert O har sine 6 elektroner: 6 − 6 = 0. Reglen om −II gælder ikke for grundstoffet." },
        { id: "h2o2", navn: "Hydrogenperoxid", f: "H2O2", q: 0, spoerg: ["O"],
          atomer: [["H", -1, 0], ["O", 0, 0], ["O", 1, 0], ["H", 2, 0]],
          bindinger: [[0, 1, 1], [1, 2, 1], [2, 3, 1]],
          forklar: "Parret mellem de to O deles. Hvert O får kun ét H's elektron og ender med 7: 6 − 7 = −1, så O er −I. Her passer reglen om −II ikke." },
        { id: "of2", navn: "Oxygendifluorid", f: "OF2", q: 0, spoerg: ["O"],
          atomer: [["F", -1, 0], ["O", 0, 0], ["F", 1, 0]],
          bindinger: [[0, 1, 1], [1, 2, 1]],
          forklar: "F trækker hårdere end O. F tager begge par, og O ender med 4: 6 − 4 = +2, så O er +II. Her er O positiv." },
        { id: "oh", navn: "Hydroxid-ion", f: "OH", q: -1, spoerg: ["O", "H"], ekstra: 0,
          atomer: [["O", 0, 0], ["H", 1, 0]],
          bindinger: [[0, 1, 1]],
          forklar: "O får parret fra H og har den ekstra elektron, der gør ionen negativ. O ender med 8: 6 − 8 = −2, så O er −II, og H er +I. Summen (−2) + (+1) = −1 er ionens ladning." },
        { id: "nh4", navn: "Ammonium-ion", f: "NH4", q: 1, spoerg: ["N", "H"], mangler: 0,
          atomer: [["N", 0, 0], ["H", 0, -1], ["H", 1, 0], ["H", 0, 1], ["H", -1, 0]],
          bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
          forklar: "N mangler én af sine 5 elektroner, men får alle fire par. N ender med 8: 5 − 8 = −3, så N er −III, og hvert H er +I. Summen (−3) + 4 · (+1) = +1 er ionens ladning." }
    ];

    /* ----- Replikkerne ---------------------------------------------------------------
       Linjen i opgavekortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros. Kemichael blander sig ikke: han siger kun noget ved
       Giv hint og Vis svaret, naar han sendes ud eller hentes, og naar der
       klikkes paa ham eller koppen. */
    D.INTRO = {
        rg: "Her finder du oxidationstal med reglerne, ét trin ad gangen.",
        ek: "Hvert elektronpar går til det atom, der trækker hårdest."
    };
    D.FAERDIG = {
        rg: "Alle 31. Summen er ladningen, hver gang.",
        ek: "Alle 12. Reglerne er en genvej. Elektronerne er grunden."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    D.UD_LINJE = "Fint. Jeg går på lærerværelset.";
    D.IND_LINJE = "Tilbage. Nogen havde taget min stol.";

    D.KAFFE = [
        "Kold. Som altid.",
        "Den er fra i morges. Den er vist oxideret.",
        "Nogen har fortyndet den.",
        "Kaffen er min. Elektronerne må du gerne flytte.",
        "Stadig kold."
    ];
    D.PRIK_SIDST = "Jeg sidder her bare. Tæl du.";

    /* Paaskeaegget: et elektronpar sluppet over hans kop */
    D.KAFFE_PAR = "Min kaffe er neutral. Lad den blive det.";

    NK.Data = D;
}());
