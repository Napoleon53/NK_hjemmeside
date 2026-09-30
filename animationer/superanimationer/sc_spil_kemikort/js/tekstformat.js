/* =====================================================================
   tekstformat.js - kortsaettet som tekst: laes, skriv og vejledning

   Formatet er Quizlets: tabulator mellem forside og bagside og et
   linjeskift mellem kortene. Saa kan et saet flyttes begge veje ved at
   kopiere og saette ind. Oven over kortene kan der staa to linjer, som
   kun dette spil bruger:

     Sæt: C2 Ioner: formel og navn
     Sider: Ion<TAB>Navn

     Na⁺<TAB>natriumion
     SO₄²⁻<TAB>sulfation

   Begge linjer kan undvaeres; et rent Quizlet-saet faar navnet
   "Importeret saet" (eller filnavnet, se editor.js). En lodret streg
   eller et semikolon deler ogsaa, saa en laerer eller en AI kan skrive
   "Na⁺ | natriumion". Den foerste af de tre, linjen indeholder, er den,
   der deler. // begynder en kommentar, og [ ] omkring en tekst fjernes,
   saa skabelonen ogsaa kan laeses.

   F.fraTekst giver { saet, udkast, fejl, linjefejl, oversigt, harNavn }.
   Er der fejl, er saet null, men udkast rummer det, der kunne laeses, saa
   vinduet kan vise kortene, mens man skriver. F.tilQuizlet giver kun
   kortene, klar til Quizlets import.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Tekstformat = {};

    F.MINDST = 4;
    F.MAKS = 300;
    F.MAKS_TEGN = 90;

    F.STANDARDNAVN = "Importeret sæt";

    /* Navnelinjen har ingen tabulator. Ellers kunne et Quizlet-kort med
       forsiden "Titel: ..." blive laest som saettets navn. */
    var HOVED = /^(sæt|saet|titel)\s*:\s*([^\t]*)$/i;
    var SIDER = /^(sider|side)\s*:\s*(.*)$/i;

    function udenKlammer(s) {
        s = String(s || "").trim();
        if (/^\[.*\]$/.test(s)) s = s.slice(1, -1).trim();
        return s;
    }

    /* Tegnet, der deler linjen: tabulator, lodret streg eller semikolon. */
    function deler(linje) {
        if (linje.indexOf("\t") >= 0) return "\t";
        if (linje.indexOf("|") >= 0) return "|";
        if (linje.indexOf(";") >= 0) return ";";
        return null;
    }

    function antal(linje, tegn) {
        return linje.split(tegn).length - 1;
    }

    function navnPaaTegn(tegn) {
        return tegn === "\t" ? "tabulatortegn" : (tegn === "|" ? "lodret streg" : "semikolon");
    }

    F.fraTekst = function (tekst) {
        var fejl = [], linjefejl = {};
        var navn = "";
        var sider = null;
        var kort = [];
        var setForside = {};

        function meld(nr, besked) {
            fejl.push("Linje " + nr + ": " + besked);
            linjefejl[nr] = besked;
        }

        String(tekst || "").replace(/\r/g, "").split("\n").forEach(function (raa, i) {
            var nr = i + 1;
            var l = raa.replace(/(^|\s)\/\/.*$/, "$1").trim();
            var m;
            if (!l) return;

            if ((m = HOVED.exec(l))) { navn = udenKlammer(m[2]); return; }

            if ((m = SIDER.exec(l))) {
                var s = m[2];
                var d = deler(s);
                if (!d) { meld(nr, "de to overskrifter skal deles af et tabulatortegn."); return; }
                var dele = s.split(d);
                var a = udenKlammer(dele[0]), b = udenKlammer(dele[1]);
                if (!a || !b) { meld(nr, "der skal stå en overskrift på begge sider af tabulatortegnet."); return; }
                sider = [a, b];
                return;
            }

            var tegn = deler(l);
            if (!tegn) {
                meld(nr, "der mangler et tabulatortegn mellem forside og bagside.");
                return;
            }
            if (antal(l, tegn) > 1) {
                meld(nr, "der må kun være ét " + navnPaaTegn(tegn) + " på linjen.");
                return;
            }
            var p = l.indexOf(tegn);
            var forside = udenKlammer(l.slice(0, p));
            var bagside = udenKlammer(l.slice(p + 1));
            if (!forside) { meld(nr, "forsiden mangler."); return; }
            if (!bagside) { meld(nr, "bagsiden mangler."); return; }
            if (forside.length > F.MAKS_TEGN || bagside.length > F.MAKS_TEGN) {
                meld(nr, "teksten er over " + F.MAKS_TEGN + " tegn og kan ikke stå på et kort.");
                return;
            }
            /* Store og smaa bogstaver er ikke det samme: m er masse og M
               er molarmasse, saa de to kort maa godt staa i samme saet. */
            var noegle = forside;
            if (Object.prototype.hasOwnProperty.call(setForside, noegle)) {
                meld(nr, "forsiden \"" + forside + "\" står også på linje " + setForside[noegle] + ".");
                return;
            }
            setForside[noegle] = nr;
            kort.push({ forside: forside, bagside: bagside, linje: nr });
        });

        var udkast = {
            navn: navn || F.STANDARDNAVN,
            sider: sider || ["Forside", "Bagside"],
            kort: kort
        };

        if (kort.length > F.MAKS) {
            fejl.push("Der er " + kort.length + " kort. Der er plads til " + F.MAKS + ".");
            udkast.kort = kort.slice(0, F.MAKS);
        }
        if (kort.length < F.MINDST) {
            fejl.push("Der skal være mindst " + F.MINDST + " kort. Der er " + kort.length + ".");
        }

        var oversigt = udkast.kort.length + " kort · " + udkast.sider[0] + " og " + udkast.sider[1];

        return {
            saet: fejl.length ? null : {
                navn: udkast.navn,
                sider: udkast.sider,
                kort: udkast.kort.map(function (k) { return { forside: k.forside, bagside: k.bagside }; })
            },
            udkast: udkast,
            fejl: fejl,
            linjefejl: linjefejl,
            oversigt: oversigt,
            harNavn: !!navn
        };
    };

    /* Hele saettet som tekst, med navn og overskrifter. */
    F.tilTekst = function (saet) {
        var linjer = ["Sæt: " + saet.navn, "Sider: " + saet.sider[0] + "\t" + saet.sider[1], ""];
        saet.kort.forEach(function (k) { linjer.push(k.forside + "\t" + k.bagside); });
        return linjer.join("\n");
    };

    /* Kun kortene, som Quizlet vil have dem: tabulator mellem forside og
       bagside og et linjeskift mellem kortene. Navn og overskrifter er
       ikke med, for Quizlet ville laese dem som kort. */
    F.tilQuizlet = function (saet) {
        return saet.kort.map(function (k) { return k.forside + "\t" + k.bagside; }).join("\n") + "\n";
    };

    F.skabelon = function () {
        return [
            "Sæt: [navnet på sættet]",
            "Sider: [overskrift forside]\t[overskrift bagside]",
            "",
            "[forside 1]\t[bagside 1]",
            "[forside 2]\t[bagside 2]",
            "[forside 3]\t[bagside 3]",
            "[forside 4]\t[bagside 4]",
            ""
        ].join("\n");
    };

    /* Vejledningen, en laerer kan give en AI sammen med sit emne. */
    F.aiVejledning = function () {
        return [
            "Lav et sæt flashcards til undervisning om: [SKRIV EMNET OG NIVEAUET HER]",
            "",
            "Brug præcis dette tekstformat og intet andet:",
            "",
            "Sæt: sættets navn",
            "Sider: overskrift på forsiden | overskrift på bagsiden",
            "",
            "forside | bagside",
            "forside | bagside",
            "",
            "Regler:",
            "- Ét kort pr. linje. Forside og bagside deles af en lodret streg.",
            "- Forsiden er det, eleven skal genkende: et symbol, en formel, et fagord.",
            "- Bagsiden er svaret: navnet, betydningen eller en forklaring på højst en linje.",
            "- Højst 90 tegn på hver side. Korte bagsider er bedre end lange.",
            "- Hver forside må kun stå én gang i sættet.",
            "- Ingen lodret streg inde i teksten.",
            "- 15 til 30 kort i et sæt.",
            "- Dansk fagsprog. En ion med ladningen 1 skrives Na⁺ og Cl⁻, aldrig Na1+.",
            "- Skriv formler med sænkede og hævede tal: H₂O, SO₄²⁻, 10²³.",
            "",
            "Eksempel:",
            "Sæt: C2 Ioner: formel og navn",
            "Sider: Ion | Navn",
            "",
            "Na⁺ | natriumion",
            "SO₄²⁻ | sulfation"
        ].join("\n");
    };

    /* ----- Link med saettet i: index.html#kort=... ---------------------- */
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
