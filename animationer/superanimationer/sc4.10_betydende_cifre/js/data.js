/* =====================================================================
   data.js - fanerne, runderne og Kemichaels replikker

   Opgaverne selv laves af js/cifre.js. Her staar kun, hvilke typer hver
   fane bruger, og de faste saetninger. Hoejst ca. 60 tegn pr. replik,
   ingen teori, ingen tankestreger.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* Ti opgaver i en runde, som i den gamle */
    D.RUNDE = 10;

    /* Fanerne. valg: de to knapper i opgavekortet (fane 2 og 3). typer:
       hvilke opgaver valget giver. Blandet tager de fem fra den gamle
       med lige stor sandsynlighed. */
    D.FANER = {
        tael: {
            navn: "Tæl cifrene", nr: 1,
            typer: function () { return "tael"; }
        },
        afrund: {
            navn: "Afrund", nr: 3,
            valg: [{ id: "maaletal", navn: "Måletal" }, { id: "regn", navn: "Regnestykker" }],
            typer: function (v) { return v === "regn" ? "regn" : "afrund"; }
        },
        komma: {
            navn: "Flyt kommaet", nr: 2,
            valg: [{ id: "notation", navn: "Videnskabelig notation" }, { id: "enhed", navn: "Enheder" }],
            typer: function (v) { return v === "enhed" ? "enhed" : "notation"; }
        },
        blandet: {
            navn: "Blandet", nr: 4,
            typer: function () { return ["tael", "afrund", "notation", "regn", "enhed"][Math.floor(NK.Cifre.rnd() * 5)]; }
        }
    };
    D.FANE_RAEKKE = ["tael", "komma", "afrund", "blandet"];

    /* Linjen under svarfeltet, naar en fane aabnes: hvor man er, og hvad
       man goer. Den gamle stod paa startskaermen: "Mestér de betydende
       cifre." */
    D.INTRO = {
        tael: "Tryk Tjek, når du har valgt dem.",
        afrund: "Skriv svaret, og tryk Tjek. En eksponent skrives i det lille felt ved 10-tallet.",
        komma: "Skriv svaret, og tryk Tjek. Eksponenten skrives i det lille felt ved 10-tallet.",
        blandet: "Ti blandede opgaver. Kun første forsøg tæller."
    };

    /* Foran forklaringen ved et rigtigt svar */
    D.ROS = ["Rigtigt.", "Ja.", "Det passer.", "Præcis."];

    /* Slutningen af en runde, efter antallet rigtige i foerste forsoeg */
    D.SLUT = function (rigtige, i_alt) {
        if (rigtige === i_alt) return "Alle " + i_alt + " i første forsøg.";
        if (rigtige >= 7) return "Godt gået.";
        if (rigtige >= 5) return "Godt på vej. Tag en runde til.";
        return "Øvelse gør mester. Tag en runde til.";
    };

    /* Paaskeaeg: et klik paa kommaet, naar cifrene skal taelles */
    D.KOMMA = [
        "Kommaet er ikke et ciffer. Det tæller aldrig med.",
        "Stadig ikke et ciffer. Kommaet viser kun, hvor enerne er.",
        "Kommaet har været her længe. Det har aldrig talt med."
    ];

    /* Paaskeaeg: alle ti rigtige i foerste forsoeg i Blandet */
    D.TI_AF_TI = "10 af 10. Med to betydende cifre.";

    /* ----- Kemichael ved katederet -----------------------------------------------
       Han siger kun noget ved Giv hint, Vis svaret og K, og naar han sendes
       ud eller hentes (UD_LINJE, IND_LINJE) eller klikkes paa (KAFFE,
       PRIK_SIDST). */
    D.KEMICHAEL = {
        tael: "Tæl cifrene. Kommaet er ikke et af dem.",
        afrund: "Afrund. Ikke mere præcist, end du ved.",
        komma: "Kommaet flytter sig. Cifrene bliver.",
        blandet: "Ti opgaver. Jeg tæller med."
    };

    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Pausen blev rundet ned.";

    /* Klik paa koppen: han drikker og siger noget om kaffen */
    D.KAFFE = [
        "Kold. Som altid.",
        "Den er fra i morges. Plus minus en time.",
        "Kaffen er min. Cifrene er dine.",
        "Fjerde kop i dag. Det tal er præcist.",
        "Nogen har fortyndet den. Med tre betydende cifre.",
        "Stadig kold. Men det er min."
    ];
    /* Klik paa ham, naar prik-puljerne er brugt op */
    D.PRIK_SIDST = "Jeg sidder her bare. Tæl du.";

    NK.Data = D;
}());
