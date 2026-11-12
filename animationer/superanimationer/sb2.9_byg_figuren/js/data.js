/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B2

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B2 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b2.qmd) den
   2. nov. 2026 med et lille script; saenkede tal er skrevet som tegn
   (Kₒ), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det).
       Kun fire af kapitlets syv afsnit har fagord: B2.1, B2.2, B2.4 og B2.7. */
    NK.KAPITEL = "B2";
    NK.ANTAL_FAGORD = 21;

    NK.FORKLARING = {
        /* B2.1 Kemisk ligevægt */
        "reversibel": "Siges om en reaktion, der kan forløbe i begge retninger. Reaktionen skrives med en dobbeltpil.",
        "ligevægt": "Tilstand, hvor koncentrationerne af alle stoffer ikke længere ændrer sig. Kurverne på grafen er blevet vandrette.",
        "dynamisk ligevægt": "Balance, hvor reaktionen mod højre og reaktionen mod venstre forløber lige hurtigt. Begge forløber hele tiden.",
        "indstille sig": "Udtryk for, at koncentrationerne når deres endelige værdier. Reaktionen kommer i ligevægt.",
        /* B2.2 Ligevægtsloven */
        "reaktionsbrøk": "Produkternes koncentrationer ganget sammen og divideret med reaktanternes. Hver koncentration er opløftet til stoffets koefficient, og symbolet er Y.",
        "ligevægtskonstant": "Værdien af reaktionsbrøken, når koncentrationerne ikke længere ændrer sig. Den afhænger kun af temperaturen og har symbolet K.",
        "ligevægtsloven": "Siger, at reaktionsbrøken er lig med K, når koncentrationerne ikke længere ændrer sig. Kort skrives den Y = K.",
        "forskudt mod højre": "Siges om en ligevægt med meget produkt og lidt reaktant. Konstanten K er meget stor, og reaktionen forløber næsten fuldstændig.",
        "forskudt mod venstre": "Siges om en ligevægt med meget reaktant og lidt produkt. Konstanten K er meget lille, og der sker næsten ingen reaktion.",
        /* B2.4 Ikke-ligevægt og indgreb */
        "indgreb": "Ændring udefra, som bringer en blanding ud af ligevægt. Et stof kan for eksempel blive tilsat eller fjernet.",
        "forskudt": "Siges om en ligevægt, der flytter sig efter et indgreb. Reaktionen forløber mod højre eller mod venstre, indtil Y igen er lig med K.",
        "Le Chateliers princip": "Huskeregel: En ligevægt forskydes i den retning, der modvirker et indgreb. Tilsættes et stof, bliver noget af stoffet forbrugt.",
        /* B2.7 Opløselighedsprodukt */
        "tungtopløselig": "Siges om et salt, der danner bundfald, fordi vand kun kan rumme meget lidt af det. Bly(II)iodid er et eksempel.",
        "bundfald": "Fast stof, der samler sig i væsken, når ioner mødes og danner et tungtopløseligt salt. Bly(II)iodid danner et gult bundfald.",
        "fældningsreaktion": "Reaktion, hvor ioner fra to opløsninger danner et bundfald, når opløsningerne blandes.",
        "opløselighedsligevægt": "Balance mellem et fast salt og saltets ioner i væsken omkring. Ioner forlader iongitteret lige så hurtigt, som andre sætter sig på.",
        "mættet": "Siges om en opløsning med så meget salt, som vandet kan rumme ved den temperatur. Den er i ligevægt med det faste salt.",
        "opløselighed": "Den mængde af et salt, som vandet højst kan rumme ved en bestemt temperatur. Den angives i mol pr. liter eller i gram pr. 100 mL.",
        "opløselighedsprodukt": "Ligevægtskonstanten for ligevægten mellem et fast salt og saltets ioner i vand. Symbolet er Kₒ.",
        "umættet": "Siges om en opløsning, der kan rumme mere salt. Reaktionsbrøken er mindre end Kₒ, og der dannes ikke bundfald.",
        "overmættet": "Siges om en opløsning med mere salt, end vandet kan rumme. Reaktionsbrøken er større end Kₒ, og der dannes bundfald."
    };

    /* Afsnittene med fagord. Fanerne har ikke numrene 1 til 4, saa
       selvtesten tjekker numrene herfra. */
    NK.AFSNIT = ["B2.1", "B2.2", "B2.4", "B2.7"];

    /* Alle fagord fra listen sidder paa en figur */
    NK.UDELADT = [];

    /* Ingen ord fra andre kapitler */
    NK.TIDLIGERE = {};

    /* Ingen fagord staar paa mere end én figur */
    NK.GENTAGET = [];

    /* De fire faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#b2.4 */
    NK.FANER = [
        { id: "ligevaegt",     nr: "B2.1", titel: "Kemisk ligevægt",      hash: ["ligevaegt", "ligevægt", "kemisk-ligevaegt", "b2.1"] },
        { id: "loven",         nr: "B2.2", titel: "Ligevægtsloven",       hash: ["loven", "ligevaegtsloven", "ligevægtsloven", "b2.2"] },
        { id: "indgreb",       nr: "B2.4", titel: "Indgreb",              hash: ["indgreb", "ikke-ligevaegt", "b2.4"] },
        { id: "oploeselighed", nr: "B2.7", titel: "Opløselighedsprodukt", hash: ["oploeselighed", "opløselighed", "oploeselighedsprodukt", "b2.7"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.ligevaegt = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());
