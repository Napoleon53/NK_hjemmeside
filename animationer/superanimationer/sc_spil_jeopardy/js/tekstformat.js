/* =====================================================================
   tekstformat.js - quizzen som tekst: eksport, upload og kontrol

   Formatet er skrevet, saa en laerer (eller en AI) kan lave en quiz i en
   almindelig teksteditor:

     Titel: Kemi C, 1.g
     Beløb: 100, 200, 300, 400, 500

     Atomer:
     Den positivt ladede partikel i atomkernen ; Hvad er en proton?
     ... én linje pr. beloeb, fra det mindste

     Final: Det periodiske system
     Russeren, der i 1869 ... ; Hvem er Mendelejev?

   Et emne er en linje, der slutter med kolon (eller begynder med ##).
   En ledetraad og dens svar staar paa samme linje, delt af semikolon.
   [ ] omkring en tekst fjernes, saa skabelonen "[spørgsmål] ; [svar]"
   ogsaa virker. Titel, Beløb og Final kan udelades. Teksten maa have
   <sub> og <sup>; alt andet HTML vises som tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Tekstformat = {};

    F.MAKS_EMNER = 6;
    F.MAKS_RAEKKER = 6;

    /* Fra quizzens HTML til tekst: kun &shy; fjernes, <sub> og <sup> bliver */
    function tilLinje(html) {
        return String(html).replace(/&shy;/g, "").replace(/­/g, "").replace(/\s+/g, " ").trim();
    }

    /* Fra tekst til sikker HTML: alt escapes, og saa faar <sub> og <sup> lov */
    function sikker(s) {
        return NK.html(s).replace(/&lt;(\/?)(sub|sup)&gt;/gi, "<$1$2>");
    }

    function udenKlammer(s) {
        s = s.trim();
        if (/^\[.*\]$/.test(s)) s = s.slice(1, -1).trim();
        return s;
    }

    F.tilTekst = function (Q) {
        var R = Q.runder[0];
        var ud = ["Titel: " + tilLinje(Q.navn), "Beløb: " + R.vaerdier.join(", "), ""];
        R.kategorier.forEach(function (K) {
            ud.push(tilLinje(K.navn) + ":");
            K.felter.forEach(function (f) { ud.push(tilLinje(f.ledetraad) + " ; " + tilLinje(f.svar)); });
            ud.push("");
        });
        if (Q.final && Q.final.ledetraad) {
            ud.push("Final: " + tilLinje(Q.final.kategori));
            ud.push(tilLinje(Q.final.ledetraad) + " ; " + tilLinje(Q.final.svar));
        }
        return ud.join("\n").replace(/\n+$/, "") + "\n";
    };

    /* Et kort fingeraftryk af teksten, saa en ny quiz faar et nyt id og
       ikke tager et gemt spil fra en anden quiz */
    function fingeraftryk(s) {
        var h = 2166136261;
        for (var i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h.toString(36);
    }

    /* Giver { quiz, fejl: [], oversigt }. quiz er null, hvis der er fejl. */
    F.fraTekst = function (tekst, idForstavelse) {
        var fejl = [];
        var navn = "", vaerdier = null, kategorier = [], final = null, aktuel = null, iFinal = false;
        String(tekst || "").replace(/\r/g, "").split("\n").forEach(function (raa, nr) {
            var l = raa.trim(), m;
            var linje = "Linje " + (nr + 1) + ": ";
            if (!l || /^\/\//.test(l)) return;
            if ((m = /^titel\s*:\s*(.*)$/i.exec(l))) { navn = m[1].trim(); return; }
            if (/^#\s/.test(l) && !kategorier.length && !navn) { navn = l.replace(/^#\s*/, "").trim(); return; }
            if ((m = /^(beløb|beloeb|point)\s*:\s*(.*)$/i.exec(l))) {
                vaerdier = m[2].split(/[,;]|\s+(?=\d)/).map(function (x) { return parseInt(x.replace(/[^\d]/g, ""), 10); })
                    .filter(function (x) { return isFinite(x); });
                if (!vaerdier.length) { fejl.push(linje + "der står ingen beløb efter Beløb:"); vaerdier = null; }
                return;
            }
            if ((m = /^#*\s*final\b\s*:?\s*(.*)$/i.exec(l)) && l.indexOf(";") < 0) {
                iFinal = true;
                aktuel = null;
                final = { kategori: udenKlammer(m[1].replace(/:\s*$/, "")) || "Final", ledetraad: "", svar: "" };
                return;
            }
            var semi = l.indexOf(";");
            if (semi >= 0) {
                var a = udenKlammer(l.slice(0, semi)), b = udenKlammer(l.slice(semi + 1));
                if (!a || !b) { fejl.push(linje + "der mangler en ledetråd eller et svar på hver sin side af semikolon."); return; }
                if (iFinal) {
                    if (final.ledetraad) fejl.push(linje + "Final har kun én ledetråd.");
                    else { final.ledetraad = sikker(a); final.svar = sikker(b); }
                    return;
                }
                if (!aktuel) { fejl.push(linje + "ledetråden står før det første emne. Et emne er en linje, der slutter med kolon."); return; }
                aktuel.felter.push({ ledetraad: sikker(a), svar: sikker(b) });
                return;
            }
            if (/:\s*$/.test(l) || /^##/.test(l)) {
                var kn = udenKlammer(l.replace(/^#+\s*/, "").replace(/:\s*$/, ""));
                if (!kn) { fejl.push(linje + "emnet har intet navn."); return; }
                aktuel = { navn: sikker(kn), felter: [] };
                kategorier.push(aktuel);
                iFinal = false;
                return;
            }
            fejl.push(linje + "er hverken et emne (slutter med kolon) eller en ledetråd (ledetråd ; svar): " + l.slice(0, 50));
        });

        if (!kategorier.length) fejl.push("Der er ingen emner. Et emne er en linje, der slutter med kolon.");
        if (kategorier.length > F.MAKS_EMNER) fejl.push("Der er " + kategorier.length + " emner. Brættet har plads til højst " + F.MAKS_EMNER + ".");
        var antal = vaerdier ? vaerdier.length : (kategorier.length ? kategorier[0].felter.length : 0);
        if (!vaerdier && antal) {
            vaerdier = [];
            for (var i = 0; i < antal; i++) vaerdier.push(100 * (i + 1));
        }
        if (antal > F.MAKS_RAEKKER) fejl.push("Der er " + antal + " beløb. Brættet har plads til højst " + F.MAKS_RAEKKER + " pr. emne.");
        kategorier.forEach(function (K) {
            if (K.felter.length !== antal) {
                fejl.push("Emnet " + NK.renTekst(K.navn) + " har " + K.felter.length + (K.felter.length === 1 ? " ledetråd" : " ledetråde")
                    + ", men der er " + antal + " beløb.");
            }
        });
        if (final && !final.ledetraad) fejl.push("Final mangler en linje med ledetråd ; svar.");

        var oversigt = kategorier.length + (kategorier.length === 1 ? " emne" : " emner") + " × " + antal
            + (antal === 1 ? " ledetråd" : " ledetråde") + (final && final.ledetraad ? " og en Final" : ", ingen Final");
        if (fejl.length) return { quiz: null, fejl: fejl, oversigt: oversigt };

        var quiz = {
            navn: sikker(navn || "Egen quiz"),
            enhed: "kr.",
            runder: [{ vaerdier: vaerdier, kategorier: kategorier }],
            final: final
        };
        quiz.id = (idForstavelse || "egen") + "-" + fingeraftryk(JSON.stringify(quiz));
        return { quiz: quiz, fejl: [], oversigt: oversigt };
    };

    /* Vejledningen, som en laerer kan give en AI sammen med sine emner */
    F.aiVejledning = function (Q) {
        var R = Q.runder[0], K = R.kategorier[0];
        var eksempel = [tilLinje(K.navn) + ":"].concat(K.felter.slice(0, 2).map(function (f) {
            return tilLinje(f.ledetraad) + " ; " + tilLinje(f.svar);
        }));
        return [
            "Lav en Jeopardy-quiz til undervisning om: [SKRIV DINE EMNER OG NIVEAUET HER]",
            "",
            "Brug præcis dette tekstformat og intet andet:",
            "Titel: quizzens navn",
            "Beløb: 100, 200, 300, 400, 500",
            "",
            "Emnets navn:",
            "ledetråd ; svar",
            "(én linje pr. beløb, fra den letteste til den sværeste)",
            "",
            "Final: emnets navn",
            "ledetråd ; svar",
            "",
            "Regler:",
            "- Højst " + F.MAKS_EMNER + " emner, og præcis lige så mange ledetråde i hvert emne, som der er beløb.",
            "- Ledetråden er en påstand eller beskrivelse, ikke et spørgsmål.",
            "- Svaret stilles som et spørgsmål: Hvad er ...? eller Hvem er ...?",
            "- Ingen semikolon inde i en ledetråd eller et svar.",
            "- Skriv kemiske formler med sænkede og hævede tegn: H₂O, SO₄²⁻, Na⁺.",
            "- Kun én linje ledetråd ; svar efter Final.",
            "",
            "Eksempel:",
            eksempel.join("\n")
        ].join("\n");
    };
}());
