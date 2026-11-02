/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel 7

   Forklaringerne er kopieret ordret fra Kemibogens fagordliste til
   kapitel 7 (NK_Undervisning/Kemibogen/fagord/kapitel-7.qmd) den
   1. nov. 2026 med et lille script; hævede og sænkede tal er skrevet
   som tegn (H₃O⁺, OH⁻), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "7";
    NK.ANTAL_FAGORD = 24;

    NK.FORKLARING = {
        /* 7.1 Syrer og baser */
        "hydron": "Partiklen H⁺, som overføres fra en syre til en base. Den er en enkelt proton uden nogen elektron.",
        "syre": "Stof, der kan afgive en hydron. Hydrogenchlorid, HCl, er et eksempel.",
        "base": "Stof, der kan optage en hydron. Ammoniak, NH₃, er et eksempel.",
        "oxoniumion": "Partiklen H₃O⁺. Den dannes, når et vandmolekyle optager en hydron.",
        "hydroxidion": "Partiklen OH⁻. Den er tilbage, når et vandmolekyle har afgivet H⁺ til en base.",
        "syre/base-reaktion": "En hydron overføres fra ét stof til et andet. Det ene stof afgiver den, og det andet optager den.",
        "korresponderende syre/base-par": "To stoffer, hvis formler er ens bortset fra én hydron, for eksempel NH₄⁺ og NH₃. Det ene bliver til det andet ved at afgive hydronen.",
        "amfolyt": "Stof, der både kan afgive og optage en hydron. Vand er et eksempel.",
        /* 7.2 Stærke og svage syrer */
        "stærk syre": "Stof, der afgiver alle sine hydroner, når det kommer i vand, for eksempel HCl. Reaktionen skrives med en enkelt pil.",
        "svag syre": "Stof, der kun afgiver få af sine hydroner i vand, for eksempel CH₃COOH. Reaktionen skrives med en dobbeltpil.",
        "stærk base": "Stof, der optager en hydron, så snart det møder en syre. Hydroxidionen er et eksempel.",
        "svag base": "Stof, hvor kun få af molekylerne har optaget en hydron i vand. Ammoniak er et eksempel.",
        "neutralisation": "Reaktion mellem en syre og en base, der gør blandingen mindre sur eller mindre basisk. Hældes ammoniakvand i saltsyre, dannes ammoniumioner, som kun er en svag syre.",
        /* 7.3 pH-skalaen */
        "sur": "Siges om en opløsning, der har flere oxoniumioner end hydroxidioner. Den har pH under 7 ved 25 °C.",
        "neutral": "Siges om en opløsning med lige mange oxoniumioner og hydroxidioner. Den har pH 7 ved 25 °C.",
        "basisk": "Siges om en opløsning, der har flere hydroxidioner end oxoniumioner. Den har pH over 7 ved 25 °C.",
        "pH": "Tal, der fortæller, hvor høj koncentrationen af oxoniumioner er. Jo flere oxoniumioner, jo lavere er tallet.",
        "syre/base-indikator": "Farvestof, hvis farve afhænger af opløsningens pH. Farvestofferne skifter farve ved hver sin pH.",
        "pH-meter": "Apparat, der måler, hvor sur eller basisk en opløsning er. Det har en elektrode, som holdes ned i opløsningen.",
        /* 7.4 pH-beregninger */
        "vands ionprodukt": "Koncentrationerne af H₃O⁺ og OH⁻ ganget med hinanden. Det giver altid 1,0 · 10⁻¹⁴ M² ved 25 °C.",
        /* 7.5 Syre/base-titrering */
        "ækvivalenspunkt": "Det sted i en titrering, hvor tilsat hydroxid og syre har samme stofmængde. Her springer pH flere enheder.",
        "phenolphthalein": "Indikator, der er farveløs under pH 8 og lyserød over pH 10. Den bruges ofte til titreringer.",
        "omslag": "Det øjeblik i en titrering, hvor én dråbe mere får indikatoren til at skifte farve. Med phenolphthalein bliver opløsningen svagt lyserød, og så lukkes burettens hane.",
        "titrerkurve": "Graf, der viser pH som funktion af det volumen, der er tilsat fra buretten."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur */
    NK.UDELADT = [];

    /* 7.4 har kun ét fagord (vands ionprodukt). Brugeren 1. nov. 2026:
       "du kan saette ord ind, som ellers ikke betragtes som kemifagord,
       men som alligevel er vaerd at traene.. ala log .. Det vil helt
       sikkert vaere godt at have ord som 'den aktuelle koncentration af
       oxonium'." De tre ord staar ikke paa nogen af bogens fagordlister,
       saa forklaringerne er skrevet her i bogens stil (som masse i
       sc5.13). "aktuel koncentration af ..." er kortere end "den aktuelle
       koncentration af ...", saa pladserne ikke bliver bredere end i 7.1. */
    NK.TIDLIGERE = {
        "log": "Tast på lommeregneren, der finder den eksponent, som 10 skal opløftes til for at give et bestemt tal. For eksempel er log₁₀(0,001) = −3.",
        "aktuel koncentration af oxonium": "Antallet af mol oxoniumioner, H₃O⁺, pr. liter opløsning. Skrives [H₃O⁺] og måles i M.",
        "aktuel koncentration af hydroxid": "Antallet af mol hydroxidioner, OH⁻, pr. liter opløsning. Skrives [OH⁻] og måles i M."
    };
    Object.keys(NK.TIDLIGERE).forEach(function (o) { NK.FORKLARING[o] = NK.TIDLIGERE[o]; });

    /* Fagord, der med vilje staar paa mere end én figur: pH i 7.3 ved
       skalaen og igen i 7.4 i beregningen (brugeren 1. nov. 2026: "der maa
       gerne vaere lidt repeterende oevelser") */
    NK.GENTAGET = ["pH"];

    /* De fem faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#titrering */
    NK.FANER = [
        { id: "syrebase",  nr: "7.1", titel: "Syrer og baser",   hash: ["syrebase", "syrer-og-baser", "7.1"] },
        { id: "staerk",    nr: "7.2", titel: "Stærke og svage",  hash: ["staerk", "staerke-og-svage-syrer", "neutralisation", "7.2"] },
        { id: "ph",        nr: "7.3", titel: "pH-skalaen",       hash: ["ph", "ph-skalaen", "7.3"] },
        { id: "beregning", nr: "7.4", titel: "pH-beregninger",   hash: ["beregning", "ph-beregninger", "7.4"] },
        { id: "titrering", nr: "7.5", titel: "Titrering",        hash: ["titrering", "syre-base-titrering", "titrerkurve", "7.5"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.syrebase = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());
