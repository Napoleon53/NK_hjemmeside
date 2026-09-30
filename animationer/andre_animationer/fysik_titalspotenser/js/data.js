/* =====================================================================
   data.js - fanerne, runderne og de faste saetninger

   Opgaverne selv laves af js/tal.js. Her staar kun, hvilke typer hver
   fane bruger, og teksterne. Korte saetninger, ingen teori i scenen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.Tal;
    var D = {};

    /* Ti opgaver i en runde */
    D.RUNDE = 10;

    /* Fanerne. valg: knapperne i opgavekortet. typer: hvilke opgaver
       valget giver. Blandet tager alle fem typer. */
    D.FANER = {
        potens: {
            navn: "Tierpotenser", nr: 1,
            valg: [
                { id: "begge", navn: "Begge veje" },
                { id: "udskriv", navn: "Potens → tal" },
                { id: "potensform", navn: "Tal → potens" }
            ],
            typer: function (v) { return v === "begge" ? "potens" : v; }
        },
        forstavelse: {
            navn: "Forstavelser", nr: 2,
            valg: [
                { id: "vaelg", navn: "Vælg forstavelsen" },
                { id: "enhedspotens", navn: "Forstavelse → potens" }
            ],
            typer: function (v) { return v === "enhedspotens" ? "enhedspotens" : "vaelg"; }
        },
        omregn: {
            navn: "Omregning", nr: 3,
            typer: function () { return "omregn"; },
            niveauer: T.NIVEAU_RAEKKE.map(function (id) {
                return { id: id, navn: T.NIVEAUER[id].navn, note: T.NIVEAUER[id].note };
            })
        },
        blandet: {
            navn: "Blandet", nr: 4,
            typer: function () {
                return ["udskriv", "potensform", "vaelg", "enhedspotens", "omregn", "omregn"][Math.floor(T.rnd() * 6)];
            }
        }
    };
    D.FANE_RAEKKE = ["potens", "forstavelse", "omregn", "blandet"];

    /* Linjen i statuslinjen, naar en fane aabnes: hvad man goer nu */
    D.INTRO = {
        potens: "Skriv svaret i feltet, og tryk Tjek.",
        forstavelse: "Vælg forstavelsen nedenfor, og tryk Tjek.",
        omregn: "Skriv svaret i feltet, og tryk Tjek.",
        blandet: "Ti blandede opgaver. Kun første forsøg tæller."
    };

    /* Maerket forrest i statuslinjen */
    D.MAERKE = {
        skidt: "Ikke endnu",
        god: "Rigtigt ✓",
        svar: "Svaret",
        hint: function (n, i_alt) { return "Hint " + n + " af " + i_alt; }
    };

    /* Foran forklaringen ved et rigtigt svar */
    D.ROS = ["Rigtigt.", "Ja.", "Det passer.", "Præcis."];

    /* Slutningen af en runde */
    D.SLUT = function (rigtige, i_alt) {
        if (rigtige === i_alt) return "Alle " + i_alt + " i første forsøg.";
        if (rigtige >= 7) return "Godt gået.";
        if (rigtige >= 5) return "Godt på vej. Tag en runde til.";
        return "Øvelse gør mester. Tag en runde til.";
    };

    D.TI_AF_TI = "10 af 10. Det er 10¹ af 10¹.";

    /* Paaskeaeg: et klik paa kommaet */
    D.KOMMA = [
        "Kommaet flytter sig. Cifrene bliver, hvor de er.",
        "Stadig et komma. Det er hele pointen.",
        "Kommaet er flyttet nok i dag."
    ];

    NK.Data = D;
}());
