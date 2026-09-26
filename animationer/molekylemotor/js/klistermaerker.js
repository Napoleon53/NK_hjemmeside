/* =====================================================================
   klistermaerker.js - Kemichaels skuffe

   Ti klistermaerker, som eleven laaser op ved at klare quizzerne i
   sc6.2 Zigzagformler (fanerne Zigzag, Navne og Isomerer), og som kan
   saettes paa tegnebraettet (og kommer med i billedet til rapporten).
   Hver quiz giver ét klistermaerke; de svaereste giver de bedste, og det
   sidste er Kemichael selv.

   Tegningerne staar her som SVG-tekst, ikke som filer i sprites/: et
   billede fra en data-adresse maa tegnes paa et laerred, der skal gemmes
   som PNG, ogsaa naar siden er aabnet fra harddisken (en fil ville
   "forurene" laerredet, saa det ikke kan gemmes).

   Det, der er laast op, huskes i browseren under NOEGLE. Begge sider
   (sc6.2 og tegnebraettet) laeser den samme noegle. Indtil 25. sept. 2026
   hed den nk-sc6.2-skuffe; den gamle laeses én gang og flyttes over.

     NK.Skuffe.ALLE             listen i raekkefoelge
     NK.Skuffe.aaben(navn)      er klistermaerket laast op?
     NK.Skuffe.laasOp(quiz)     laaser quizzens klistermaerke op; giver det,
                                hvis det er nyt, ellers null
     NK.Skuffe.billede(navn)    et Image, klar til drawImage
     NK.Skuffe.dataAdresse(navn)  til <img> og til SVG-eksporten
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var NOEGLE = "nk-skuffe";
    var GAMMEL = "nk-sc6.2-skuffe";

    /* ----- Tegningerne ------------------------------------------------------ */
    var SVG = {
        kaffekop: [42, 40,
            '<path d="M30 12 Q41 12 41 21 Q41 30 30 30" fill="none" stroke="#e9ecef" stroke-width="4"/>' +
            '<path d="M30 12 Q41 12 41 21 Q41 30 30 30" fill="none" stroke="#b8bec5" stroke-width="0.8"/>' +
            '<path d="M3 6 L33 6 L31 36 Q31 40 27 40 L9 40 Q5 40 5 36 Z" fill="#f6f7f8" stroke="#b8bec5" stroke-width="1"/>' +
            '<ellipse cx="18" cy="6" rx="15" ry="3" fill="#3b2314" stroke="#c9cdd2" stroke-width="1"/>' +
            '<path d="M7 9 L8.5 34" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>' +
            '<text x="18" y="21" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="5.4" font-weight="800" fill="#c0392b">BEDSTE</text>' +
            '<text x="18" y="28" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="5.4" font-weight="800" fill="#c0392b">LÆRER</text>' +
            '<path d="M15 31 q1.5 -1.6 3 0 q1.5 -1.6 3 0 l-3 3 Z" fill="#c0392b"/>'],

        gloeoejne: [64, 32,
            '<circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#1d2433" stroke-width="2.2"/>' +
            '<circle cx="48" cy="16" r="14" fill="#ffffff" stroke="#1d2433" stroke-width="2.2"/>' +
            '<circle cx="21" cy="21" r="6.5" fill="#1d2433"/>' +
            '<circle cx="43" cy="11" r="6.5" fill="#1d2433"/>' +
            '<circle cx="19" cy="19" r="1.8" fill="#ffffff"/>' +
            '<circle cx="41" cy="9" r="1.8" fill="#ffffff"/>' +
            '<path d="M7 7 Q11 4 15 5" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>' +
            '<path d="M39 5 Q43 3 47 4" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>'],

        festhat: [44, 56,
            '<path d="M22 6 L40 50 L4 50 Z" fill="#9b6bd6"/>' +
            '<path d="M22 6 L27 18 L17 18 Z M14 26 L30 26 L33 34 L11 34 Z M8 42 L36 42 L39 50 L5 50 Z" fill="#f2c53d"/>' +
            '<circle cx="15" cy="30" r="1.6" fill="#e05446"/><circle cx="28" cy="38" r="1.6" fill="#3d9ee0"/><circle cx="21" cy="22" r="1.4" fill="#3fae72"/>' +
            '<path d="M4 50 Q22 56 40 50" stroke="#6d4ba3" stroke-width="2" fill="none"/>' +
            '<circle cx="22" cy="6" r="5.5" fill="#e05446"/>' +
            '<path d="M18 3 L26 9 M26 3 L18 9 M22 0.5 L22 11.5" stroke="#f7a79d" stroke-width="1.2"/>'],

        bunsen: [56, 76,
            '<path d="M28 6 Q35 6 35 14 L35 50 L21 50 L21 14 Q21 6 28 6 Z" fill="#3fae72" stroke="#2b7d51" stroke-width="1.5"/>' +
            '<path d="M21 30 L13 30 Q8 30 8 25 L8 18 Q8 13 12 13 Q16 13 16 18 L16 23 L21 23" fill="#3fae72" stroke="#2b7d51" stroke-width="1.5"/>' +
            '<path d="M35 34 L43 34 Q48 34 48 29 L48 20 Q48 15 44 15 Q40 15 40 20 L40 27 L35 27" fill="#3fae72" stroke="#2b7d51" stroke-width="1.5"/>' +
            '<path d="M28 10 L28 48 M24 16 L24 46 M32 16 L32 46" stroke="#2b7d51" stroke-width="0.8" opacity="0.6"/>' +
            '<path d="M26 12 l-2 -2 M30 20 l2 -2 M25 28 l-2 -1 M31 36 l2 -1 M12 18 l-2 -1 M45 22 l2 -1" stroke="#1e4d33" stroke-width="0.9" stroke-linecap="round"/>' +
            '<circle cx="28" cy="5" r="3" fill="#f7a79d"/><circle cx="28" cy="5" r="1.2" fill="#e05446"/>' +
            '<path d="M10 50 L46 50 L42 74 L14 74 Z" fill="#c46a3a" stroke="#8f4724" stroke-width="1.5"/>' +
            '<rect x="8" y="48" width="40" height="7" rx="2" fill="#d27a48" stroke="#8f4724" stroke-width="1.5"/>' +
            '<text x="28" y="67" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="7" font-weight="800" fill="#fbe3cf">BUNSEN</text>'],

        overskaeg: [64, 26,
            '<path d="M32 9 Q24 2 14 6 Q4 10 2 20 Q8 14 16 16 Q24 18 32 14 Q40 18 48 16 Q56 14 62 20 Q60 10 50 6 Q40 2 32 9 Z" fill="#8f949b" stroke="#6d737a" stroke-width="1.2"/>' +
            '<path d="M2 20 Q0 14 4 11 M62 20 Q64 14 60 11" stroke="#6d737a" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
            '<path d="M18 9 Q22 11 26 11 M38 11 Q42 11 46 9" stroke="#b3b7bd" stroke-width="1" fill="none"/>'],

        stempel: [124, 64,
            '<g transform="rotate(-7 62 30)">' +
            '<rect x="6" y="8" width="112" height="44" rx="6" fill="none" stroke="#c8473a" stroke-width="3.5"/>' +
            '<rect x="11" y="13" width="102" height="34" rx="4" fill="none" stroke="#c8473a" stroke-width="1.4"/>' +
            '<text x="62" y="33" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="900" letter-spacing="2" fill="#c8473a">GODKENDT</text>' +
            '<text x="62" y="44" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#c8473a">AF MICHAEL, LÆRER</text>' +
            '</g>' +
            '<path d="M80 60 Q85 52 90 58 Q93 62 98 55 Q101 52 104 57 L116 54" stroke="#2a4a8a" stroke-width="1.6" fill="none" stroke-linecap="round"/>'],

        chips: [52, 68,
            '<path d="M6 8 L46 8 L44 60 L8 60 Z" fill="#f2c53d" stroke="#b8901d" stroke-width="1.5"/>' +
            '<path d="M6 8 L10 4 L14 8 L18 4 L22 8 L26 4 L30 8 L34 4 L38 8 L42 4 L46 8 Z M8 60 L12 64 L16 60 L20 64 L24 60 L28 64 L32 60 L36 64 L40 60 L44 64 Z" fill="#e0b12b" stroke="#b8901d" stroke-width="1"/>' +
            '<ellipse cx="26" cy="26" rx="15" ry="10" fill="#e05446"/>' +
            '<text x="26" y="30" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="10" font-weight="900" fill="#ffffff">CHIPS</text>' +
            '<ellipse cx="20" cy="45" rx="7" ry="4" fill="#f8dc86" transform="rotate(-15 20 45)"/>' +
            '<ellipse cx="32" cy="47" rx="7" ry="4" fill="#f8dc86" transform="rotate(12 32 47)"/>' +
            '<g transform="rotate(-18 26 38)"><rect x="0" y="33" width="52" height="11" fill="#ffffff" opacity="0.92"/>' +
            '<text x="26" y="41.5" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="7" font-weight="900" fill="#c8473a">KONFISKERET</text></g>'],

        navneskilt: [104, 40,
            '<rect x="2" y="6" width="100" height="32" rx="5" fill="#ffffff" stroke="#9aa1ab" stroke-width="1.5"/>' +
            '<rect x="2" y="6" width="100" height="9" rx="5" fill="#3d9ee0"/><rect x="2" y="11" width="100" height="4" fill="#3d9ee0"/>' +
            '<rect x="44" y="0" width="16" height="9" rx="2" fill="#c9cdd2" stroke="#8a9099" stroke-width="1"/>' +
            '<text x="62" y="31" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" fill="#1d2433">MICHAEL</text>' +
            '<text x="15" y="32" text-anchor="middle" font-family="Comic Sans MS, Segoe Print, cursive" font-size="11" font-weight="700" fill="#2a4a8a" transform="rotate(-8 15 28)">KE</text>'],

        oejenbryn: [56, 30,
            '<path d="M4 20 Q16 8 32 10 Q44 11 52 17 Q42 16 32 17 Q18 18 4 20 Z" fill="#6d737a"/>' +
            '<path d="M8 18 l-2 -4 M14 15 l-1 -5 M20 13 l0 -5 M26 12 l1 -5 M33 12 l2 -5 M40 13 l3 -4 M46 15 l3 -3" stroke="#6d737a" stroke-width="1.4" stroke-linecap="round"/>' +
            '<path d="M44 12 l2 -4 l1 3 l2 -4" stroke="#2a2f36" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
            '<path d="M48 8 Q44 4 48 1 Q52 -2 50 4" stroke="#b3b7bd" stroke-width="1.2" fill="none" opacity="0.8"/>'],

        kemichael: [110, 122,
            '<defs><radialGradient id="hud" cx="0.45" cy="0.4" r="0.65"><stop offset="0" stop-color="#f7d3b2"/>' +
            '<stop offset="0.75" stop-color="#eebf98"/><stop offset="1" stop-color="#d69f78"/></radialGradient></defs>' +
            '<ellipse cx="13" cy="66" rx="8" ry="12" fill="#e7b48d"/><ellipse cx="97" cy="66" rx="8" ry="12" fill="#e7b48d"/>' +
            '<path d="M11 60 Q15 66 11 72 M99 60 Q95 66 99 72" stroke="#c98f68" stroke-width="1.5" fill="none"/>' +
            '<path d="M55 8 Q94 8 94 56 Q94 96 76 110 Q66 118 55 118 Q44 118 34 110 Q16 96 16 56 Q16 8 55 8 Z" fill="url(#hud)"/>' +
            '<ellipse cx="44" cy="22" rx="14" ry="6" fill="#ffffff" fill-opacity="0.35" transform="rotate(-18 44 22)"/>' +
            '<path d="M14 58 Q8 40 18 28 Q20 40 26 46 Q22 36 28 30 Q28 44 32 50 L20 62 Z" fill="#a9adb3"/>' +
            '<path d="M96 58 Q102 40 92 28 Q90 40 84 46 Q88 36 82 30 Q82 44 78 50 L90 62 Z" fill="#a9adb3"/>' +
            '<path d="M40 12 Q50 2 62 10 Q54 8 48 14 Z" fill="#a9adb3"/>' +
            '<path d="M55 62 Q50 76 48 80 Q52 84 58 82" fill="none" stroke="#c98f68" stroke-width="2.2" stroke-linecap="round"/>' +
            '<ellipse cx="37" cy="61" rx="5.2" ry="4.2" fill="#ffffff"/><ellipse cx="73" cy="61" rx="5.2" ry="4.2" fill="#ffffff"/>' +
            '<circle cx="38.5" cy="61.5" r="2.4" fill="#2a2f36"/><circle cx="74.5" cy="61.5" r="2.4" fill="#2a2f36"/>' +
            '<circle cx="37" cy="60" r="12" fill="#c8e6ff" fill-opacity="0.12" stroke="#23272e" stroke-width="2.4"/>' +
            '<circle cx="73" cy="60" r="12" fill="#c8e6ff" fill-opacity="0.12" stroke="#23272e" stroke-width="2.4"/>' +
            '<path d="M49 59 Q55 55 61 59 M25 58 L15 55 M85 58 L95 55" stroke="#23272e" stroke-width="2.4" fill="none"/>' +
            '<path d="M24 40 L47 43 M86 40 L63 43" stroke="#6d737a" stroke-width="4.2" stroke-linecap="round"/>' +
            '<path d="M38 90 Q46 82 55 86 Q64 82 72 90 Q66 92 60 90 Q55 92 50 90 Q44 92 38 90 Z" fill="#8f949b"/>' +
            '<path d="M45 96 Q55 104 65 96" stroke="#7a3b2e" stroke-width="2.4" fill="none" stroke-linecap="round"/>']
    };

    /* ----- Hvad der laases op og hvordan -----------------------------------
       bredde: klistermaerkets bredde i bindingslaengder paa tavlen */
    var ALLE = [
        { navn: "kaffekop", titel: "Kaffekoppen", quiz: "is-4", bredde: 0.9,
          hvordan: "Find alle isomerer af C₄H₁₀ i Zigzagformler, fanen Isomerer.",
          replik: "Min reservekop. Den er ren. Næsten." },
        { navn: "gloeoejne", titel: "Gloøjne", quiz: "zz-tegn", bredde: 0.95,
          hvordan: "Klar serien Strukturformel → zigzag i Zigzagformler, fanen Zigzag.",
          replik: "Øjne til molekylerne. Så kigger de tilbage." },
        { navn: "festhat", titel: "Festhatten", quiz: "zz-atomer", bredde: 0.75,
          hvordan: "Klar serien Zigzag → strukturformel i Zigzagformler, fanen Zigzag.",
          replik: "Fra sidste fredagsmøde. Der var kage." },
        { navn: "bunsen", titel: "Bunsen, kaktussen", quiz: "is-5", bredde: 1.1,
          hvordan: "Find alle isomerer af C₅H₁₂ i Zigzagformler, fanen Isomerer.",
          replik: "Bunsen. Han får resten af kaffen." },
        { navn: "overskaeg", titel: "Overskægget", quiz: "nv-byg-alkaner", bredde: 1.0,
          hvordan: "Klar serien Byg ud fra navnet med alkaner i Zigzagformler, fanen Navne.",
          replik: "Et reserveoverskæg. Spørg ikke." },
        { navn: "stempel", titel: "Stemplet", quiz: "nv-navn-alkaner", bredde: 2.2,
          hvordan: "Klar serien Giv navnet med alkaner i Zigzagformler, fanen Navne.",
          replik: "Mit stempel. Brug det med omtanke." },
        { navn: "chips", titel: "Chipsposen", quiz: "is-6", bredde: 1.0,
          hvordan: "Find alle isomerer af C₆H₁₄ i Zigzagformler, fanen Isomerer.",
          replik: "Konfiskeret i 3.g. Du kan få posen." },
        { navn: "navneskilt", titel: "Navneskiltet", quiz: "nv-byg-alkener", bredde: 1.9,
          hvordan: "Klar serien Byg ud fra navnet med alkener i Zigzagformler, fanen Navne.",
          replik: "Mit gamle skilt. Nogen har skrevet KE." },
        { navn: "oejenbryn", titel: "Øjenbrynet fra 1994", quiz: "nv-navn-alkener", bredde: 1.0,
          hvordan: "Klar serien Giv navnet med alkener i Zigzagformler, fanen Navne.",
          replik: "Fra 1994. Det voksede aldrig helt ud." },
        { navn: "kemichael", titel: "Kemichael", quiz: "is-7", bredde: 1.5,
          hvordan: "Find alle ni isomerer af C₇H₁₆ i Zigzagformler, fanen Isomerer.",
          replik: "Mig. Kun hovedet. Resten har travlt." }
    ];

    var efterNavn = {}, efterQuiz = {};
    ALLE.forEach(function (k) {
        efterNavn[k.navn] = k;
        efterQuiz[k.quiz] = k;
        var s = SVG[k.navn];
        k.b = s[0];
        k.h = s[1];
        k.svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + s[0] * 2 + '" height="' + s[1] * 2 +
            '" viewBox="0 0 ' + s[0] + " " + s[1] + '">' + s[2] + "</svg>";
        k.adresse = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(k.svg);
        k.img = new Image();
        k.img.src = k.adresse;
    });

    function aabne() {
        var a = NK.hent(NOEGLE, null);
        if (!a) {
            a = NK.hent(GAMMEL, null) || {};
            if (Object.keys(a).length) NK.gem(NOEGLE, a);
        }
        return a;
    }

    NK.Skuffe = {
        ALLE: ALLE,
        klister: function (navn) { return efterNavn[navn] || null; },
        aaben: function (navn) { return !!aabne()[navn]; },
        antalAabne: function () { var a = aabne(); return ALLE.filter(function (k) { return a[k.navn]; }).length; },
        /* Giver klistermaerket, hvis det er nyt; ellers null */
        laasOp: function (quiz) {
            var k = efterQuiz[quiz];
            if (!k) return null;
            var a = aabne();
            if (a[k.navn]) return null;
            a[k.navn] = true;
            NK.gem(NOEGLE, a);
            return k;
        },
        billede: function (navn) { var k = efterNavn[navn]; return k && k.img.complete ? k.img : null; },
        dataAdresse: function (navn) { var k = efterNavn[navn]; return k ? k.adresse : ""; },
        NOEGLE: NOEGLE
    };
}());
