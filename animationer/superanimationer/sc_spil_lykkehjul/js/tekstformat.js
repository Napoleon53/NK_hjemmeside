/* =====================================================================
   tekstformat.js - quizzen som tekst: laes, skriv og vejledning til AI

   Formatet er skrevet, saa en laerer (eller en AI) kan lave en quiz i en
   almindelig teksteditor. Én linje pr. gaade:

     Titel: Kemi B, grundbegreber

     Toss-up: Organisk kemi ; Substitutions-reaktion
     Runde: Ligevægte ; Le Chateliers princip
     Toss-up 2000: Begreb ved reaktionsskemaer ; Tilstandsform
     Final: I naturen ; Koffein

   Foran kolon staar typen (Toss-up med et valgfrit beloeb, Runde eller
   Final). Efter kolon staar kategorien og loesningen, delt af semikolon.
   // begynder en kommentar. [ ] omkring en tekst fjernes, saa en skabelon
   som "Runde: [kategori] ; [løsning]" ogsaa virker.

   F.fraTekst giver { quiz, fejl, linjefejl, oversigt }. Hver gaade i
   quiz.gaader har ogsaa sin opstilling paa tavlen (tavle.js), saa fejl
   som et for langt ord fanges, foer spillet starter.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Tekstformat = {};

    F.MAKS_GAADER = 20;

    function udenKlammer(s) {
        s = String(s || "").trim();
        if (/^\[.*\]$/.test(s)) s = s.slice(1, -1).trim();
        return s;
    }

    /* Et kort fingeraftryk af teksten, saa en ny quiz faar et nyt id og
       ikke tager et gemt spil fra en anden quiz */
    F.fingeraftryk = function (s) {
        var h = 2166136261;
        for (var i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h.toString(36);
    };

    /* Beloeb som 2000, 2.000 eller 2.000 kr. */
    function beloeb(s) {
        var v = parseInt(String(s).replace(/kr\.?/i, "").replace(/[.\s]/g, ""), 10);
        return isFinite(v) && v > 0 ? v : null;
    }

    var TYPE = /^(toss[\s-]?up|lyn|runde|gåde|gaade|final|finale)\s*([\d.\s]*(?:kr\.?)?)\s*:\s*(.*)$/i;

    F.fraTekst = function (tekst) {
        var fejl = [], linjefejl = {};
        var navn = "", gaader = [], final = null;

        function meld(nr, besked) {
            fejl.push("Linje " + nr + ": " + besked);
            linjefejl[nr] = besked;
        }

        String(tekst || "").replace(/\r/g, "").split("\n").forEach(function (raa, i) {
            var nr = i + 1;
            var l = raa.replace(/\/\/.*$/, "").trim(), m;
            if (!l) return;
            if ((m = /^titel\s*:\s*(.*)$/i.exec(l))) { navn = udenKlammer(m[1]); return; }
            m = TYPE.exec(l);
            if (!m) {
                meld(nr, "linjen skal begynde med Toss-up:, Runde: eller Final:");
                return;
            }
            var ord = m[1].toLowerCase();
            var type = /^(toss|lyn)/.test(ord) ? "tossup" : (/^final/.test(ord) ? "final" : "runde");
            var semi = m[3].indexOf(";");
            if (semi < 0) { meld(nr, "der mangler et semikolon mellem kategori og løsning."); return; }
            var kategori = udenKlammer(m[3].slice(0, semi));
            var loesning = udenKlammer(m[3].slice(semi + 1));
            if (!kategori) { meld(nr, "kategorien mangler."); return; }
            if (!loesning) { meld(nr, "løsningen mangler."); return; }
            if (loesning.indexOf(";") >= 0) { meld(nr, "der må kun være ét semikolon."); return; }
            var vaerdi = null;
            if (m[2].trim()) {
                if (type !== "tossup") { meld(nr, "kun en toss-up har et beløb."); return; }
                vaerdi = beloeb(m[2]);
                if (!vaerdi) { meld(nr, "beløbet kan ikke læses."); return; }
            }
            var opst = NK.Tavle.opstil(loesning);
            if (opst.fejl) { meld(nr, opst.fejl); return; }
            var g = {
                type: type,
                kategori: kategori,
                loesning: loesning,
                vaerdi: type === "tossup" ? (vaerdi || D.TOSSUP_STANDARD) : 0,
                eksplicit: !!vaerdi,
                linjer: opst.linjer,
                celler: opst.celler,
                antal: opst.antal,
                linje: nr
            };
            if (type === "final") {
                if (final) { meld(nr, "der må kun være én Final."); return; }
                final = g;
            } else {
                gaader.push(g);
            }
        });

        if (!gaader.length && !Object.keys(linjefejl).length) fejl.push("Der er ingen gåder. Skriv fx: Runde: Syre-base ; Buffer");
        else if (!gaader.length) fejl.push("Der er ingen gåder uden fejl endnu.");
        if (gaader.length > F.MAKS_GAADER) fejl.push("Der er " + gaader.length + " gåder. Spillet har plads til højst " + F.MAKS_GAADER + ".");

        var toss = gaader.filter(function (g) { return g.type === "tossup"; }).length;
        var oversigt = toss + (toss === 1 ? " toss-up, " : " toss-ups, ")
            + (gaader.length - toss) + (gaader.length - toss === 1 ? " runde" : " runder")
            + (final ? " og en Final" : ", ingen Final");

        var quiz = {
            navn: navn || "Egen quiz",
            gaader: gaader,
            final: final,
            tekst: String(tekst || "")
        };
        quiz.id = "q" + F.fingeraftryk(F.tilTekst(quiz));
        return { quiz: fejl.length ? null : quiz, udkast: quiz, fejl: fejl, linjefejl: linjefejl, oversigt: oversigt };
    };

    function linje(g) {
        var hoved = g.type === "tossup" ? "Toss-up" + (g.vaerdi !== D.TOSSUP_STANDARD ? " " + g.vaerdi : "")
            : g.type === "final" ? "Final" : "Runde";
        return hoved + ": " + g.kategori + " ; " + g.loesning;
    }

    F.tilTekst = function (Q) {
        var ud = ["Titel: " + Q.navn, ""];
        Q.gaader.forEach(function (g) { ud.push(linje(g)); });
        if (Q.final) ud.push("", linje(Q.final));
        return ud.join("\n") + "\n";
    };

    /* En tom skabelon til en ny quiz */
    F.skabelon = function () {
        return [
            "Titel: Min quiz",
            "",
            "Toss-up: [kategori] ; [løsning]",
            "Runde: [kategori] ; [løsning]",
            "Runde: [kategori] ; [løsning]",
            "",
            "Final: [kategori] ; [løsning]",
            ""
        ].join("\n");
    };

    /* Vejledningen, som en laerer kan give en AI sammen med sine emner */
    F.aiVejledning = function () {
        return [
            "Lav en Lykkehjulet-quiz til undervisning om: [SKRIV EMNET OG NIVEAUET HER]",
            "",
            "Brug præcis dette tekstformat og intet andet:",
            "",
            "Titel: quizzens navn",
            "",
            "Toss-up: kategori ; løsning",
            "Runde: kategori ; løsning",
            "Toss-up 2000: kategori ; løsning",
            "Final: kategori ; løsning",
            "",
            "Regler:",
            "- Én gåde pr. linje. Typen står før kolon: Toss-up, Runde eller Final.",
            "- En toss-up giver 1000 kr. Skriv et andet beløb efter ordet, fx Toss-up 2000.",
            "- Kategorien er en kort overskrift, fx Syre-base eller Begreb ved molekyler.",
            "- Løsningen er et fagbegreb eller en kort, faglig sætning på dansk.",
            "- Tavlen har fire rækker med 12, 14, 14 og 12 felter. Et ord må højst have 14 bogstaver.",
            "  Et længere ord deles med bindestreg, fx Substitutions-reaktion.",
            "- Brug kun bogstaver, mellemrum og bindestreg i løsningen. Ingen kemiske formler.",
            "- Ingen semikolon inde i kategori eller løsning.",
            "- 2 til 4 toss-ups, 3 til 5 runder og højst én Final.",
            "- Finalens løsning er ét ord på 6 til 10 bogstaver.",
            "",
            "Eksempel:",
            "Toss-up: Organisk kemi ; Substitutions-reaktion",
            "Runde: Redoxkemi ; Oxidation er afgivelse af elektroner",
            "Final: I naturen ; Koffein"
        ].join("\n");
    };

    /* ----- Link med quizzen i: index.html#quiz=... ---------------------- */
    F.tilLink = function (tekst) {
        var b = window.btoa(unescape(encodeURIComponent(String(tekst))));
        return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };

    F.fraLink = function (kode) {
        try {
            var b = String(kode).replace(/-/g, "+").replace(/_/g, "/");
            while (b.length % 4) b += "=";
            return decodeURIComponent(escape(window.atob(b)));
        } catch (e) {
            return null;
        }
    };
}());
