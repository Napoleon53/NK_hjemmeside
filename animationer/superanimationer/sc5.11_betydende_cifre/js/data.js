/* =====================================================================
   data.js - fanerne, runderne og linjerne paa papirkortet

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

    /* Fanerne. valg: de to knapper i panelet (fane 2 og 3). typer:
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
            typer: function (v) { return v === "enhed" ? "enhed" : "notation"; },
            /* Enhedernes niveauer (js/cifre.js, C.NIVEAUER). Meget svær er
               laast, til de tre andre er klaret (D.OPLAAS). */
            niveauer: [
                { id: "let", navn: "Let", note: "Kilo og milli: kg, g, mg, L og mL." },
                { id: "middel", navn: "Middel", note: "Også mikro og mol: µg, µL, mol, mmol og µmol." },
                { id: "svaer", navn: "Svær", note: "Også mol/L og tal med mange nuller." },
                { id: "meget", navn: "Meget svær", note: "Alle forstavelser: M, k, h, da, d, c, m, µ og n.", laast: true }
            ]
        },
        blandet: {
            navn: "Blandet", nr: 4,
            typer: function () { return ["tael", "afrund", "notation", "regn", "enhed"][Math.floor(NK.Cifre.rnd() * 5)]; }
        }
    };
    D.FANE_RAEKKE = ["tael", "komma", "afrund", "blandet"];

    /* Linjen paa kortet, naar en fane aabnes: hvor man er, og hvad
       man goer. Den gamle stod paa startskaermen: "Mestér de betydende
       cifre." */
    D.INTRO = {
        tael: "Tryk Indsend svar, når du har valgt cifrene på tavlen.",
        afrund: "Skriv svaret i feltet under tavlen, og tryk Indsend svar.",
        komma: "Skriv svaret i feltet under tavlen, og tryk Indsend svar.",
        blandet: "Ti blandede opgaver på tid. Fejl og hjælp koster 10 sekunder."
    };

    /* Uret i Blandet (27. nov. 2026): det gaar, mens en opgave venter paa
       et svar. Et forkert foerste svar, et hint og Vis svaret koster
       D.UR.straf sekunder hver. Elevens bedste tid huskes i browseren. */
    D.UR = {
        straf: 10,
        noegle: "nk-sc5.11-tid",
        glid: 0.35,                       /* den nye opgave glider ind; uret venter imens */
        strafTekst: "Det koster 10 sekunder."
    };

    /* Resultatet i Blandet: tiden, og hvor meget af den der er straf */
    D.DIN_TID = function (tid, straf) {
        return "Din tid: <b>" + tid + "</b>" + (straf ? " (heraf " + straf + " sekunder for fejl og hjælp)." : ".");
    };
    D.NY_BEDSTE = "Ny bedste tid.";

    /* Den faelles liste over de hurtigste runder i Blandet (overskrifterne
       Top 10 denne uge og Top 10 alle tider staar i index.html) */
    D.LISTE = {
        ingen: "Ingen endnu.",
        send: "Sæt på listen",
        sender: "Sender …",
        sendt: "Tiden er sendt",
        igen: "Prøv igen"
    };

    /* Meget svær under Enheder: laases op af en runde med mindst
       D.OPLAAS rigtige i foerste forsoeg paa hvert af de tre andre */
    D.OPLAAS = 7;
    D.LAAST = "Meget svær låses op, når du har klaret en runde med mindst 7 rigtige på Let, Middel og Svær.";
    D.LAAST_OP = "Meget svær er låst op.";

    /* Maerket foran forklaringen ved et rigtigt svar (punktummet tages af) */
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

    NK.Data = D;
}());
