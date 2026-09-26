/* =====================================================================
   forklaring.js - Kemichaels grundige forklaring bag "Læs mere"

   Kemichael siger kun én kort sætning, når eleven beder om et hint
   eller svaret (brugerens ønske 26. sept. 2026: de lange regnestykker i
   boblen var for meget for en svag elev). Knappen "Læs mere" åbner hans
   forklaring i fuld skærm, stillet op i kort med regnestykket linje for
   linje, tabeller, en tallinje og gangetabeller.

   NK.Forklaring.lav(R, trin, medSvar, ekstra) giver { titel, skema, html }.
   medSvar = false (efter et hint): opstillingen, men ikke resultatet.
   medSvar = true (efter Vis svaret): det hele regnet ud.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var X = NK.Redox;

    function h(s) { return NK.html(s); }

    /* Et kort: overskrift, en regel i almindelige ord og linjerne */
    function kort(klasse, hoved, regel, linjer, svar) {
        var t = '<div class="fx-kort' + (klasse ? " " + klasse : "") + '">';
        if (hoved) t += '<div class="fx-hoved">' + hoved + "</div>";
        if (regel) t += '<p class="fx-regel">' + h(regel) + "</p>";
        if (linjer && linjer.length) {
            t += '<div class="fx-linjer">' + linjer.map(function (l) {
                return typeof l === "string" ? '<div class="fx-linje">' + h(l) + "</div>" : l.html;
            }).join("") + "</div>";
        }
        if (svar) t += '<div class="fx-svar">' + h(svar) + "</div>";
        return t + "</div>";
    }

    function raa(html) { return { html: html }; }

    function sideOrd(side) { return side === "v" ? "før pilen" : "efter pilen"; }

    /* Skemaet, som det står i hæftet på det trin */
    function skema(R, trin) {
        var medKoef = ["ladning", "ion", "brint", "vand"].indexOf(trin) >= 0;
        var medIon = ["brint", "vand"].indexOf(trin) >= 0;
        var s = { v: [], h: [] };
        R.led.forEach(function (l, i) {
            var k = medKoef && R.koef[i] !== 1 ? R.koef[i] + " " : "";
            s[l.side].push(k + l.st.tekst);
        });
        if (medIon && R.ion.side) s[R.ion.side].push(R.ion.antal + " " + R.ionSt.tekst);
        return s.v.join(" + ") + " ⟶ " + s.h.join(" + ");
    }

    /* ----- Oxidationstallene ------------------------------------------------------
       Romertal over atomet og i svaret, almindelige tal i mellemregningerne
       (brugerens valg 26. sept. 2026, se sc8.2): S + 3 · (−2) = −2 */
    function oxKort(st, E, medSvar) {
        var ox = st.ox[E], n = st.el[E], q = st.q, linjer = [], regel, svar = "";
        if (st.slags === "grundstof") {
            regel = st.tekst + " er et grundstof. Oxidationstallet er 0.";
            linjer.push(E + " = " + (medSvar ? "0" : "?"));
        } else if (st.slags === "ion") {
            regel = st.tekst + " er en ion af ét atom. Oxidationstallet er ionens ladning.";
            linjer.push(E + " = " + (medSvar ? X.ox(ox) : "?"));
        } else {
            var faste = Object.keys(st.el).filter(function (s) { return s !== E; });
            var sumFast = 0;
            faste.forEach(function (s) { sumFast += st.ox[s] * st.el[s]; });
            regel = faste.map(function (s) { return s + " er " + X.ox(st.ox[s]); }).join(" og ") + ". " +
                (q === 0 ? "Alle tallene skal give 0, for " + st.tekst + " er neutralt." :
                    "Alle tallene skal give ionens ladning, " + X.lad(q) + ".");
            if (E === "O") regel = "O sidder på O her, så O er ikke −II. " + regel;
            var venstre = (n > 1 ? n + " · " : "") + E;
            linjer.push(venstre + " + " + faste.map(function (s) { return st.el[s] + " · " + X.ladP(st.ox[s]); }).join(" + ") + " = " + X.lad(q));
            linjer.push(venstre + " " + (sumFast < 0 ? "− " + (-sumFast) : "+ " + sumFast) + " = " + X.lad(q));
            if (medSvar) {
                var rest = q - sumFast;
                linjer.push(venstre + " = " + X.lad(q) + (sumFast < 0 ? " + " + (-sumFast) : " − " + sumFast) + " = " + X.lad(rest));
                if (n > 1) linjer.push(E + " = " + X.lad(rest) + " : " + n + " = " + X.lad(ox));
            } else {
                linjer.push(venstre + " = ?");
            }
        }
        if (medSvar) svar = E + " i " + st.tekst + " er " + X.ox(ox) + (ox !== 0 && st.slags === "sammensat" ? " (det samme som " + X.lad(ox) + ")" : "") + ".";
        return kort("", st.tekst, regel, linjer, svar);
    }

    function ox(R, medSvar) {
        var led = [R.ox.v, R.red.v, R.ox.h, R.red.h].sort(function (a, b) { return a - b; });
        return led.map(function (i) {
            var K = R.led[i].rolle === "ox" ? R.ox : R.red;
            return oxKort(R.led[i].st, K.E, medSvar);
        }).join("");
    }

    /* ----- Lige mange atomer --------------------------------------------------------- */
    function forafstem(R, medSvar) {
        return [R.ox, R.red].filter(function (K) { return K.pv > 1 || K.ph > 1; }).map(function (K) {
            var A = R.led[K.v].st, B = R.led[K.h].st;
            var faa = K.pv > 1 ? A : B, mange = K.pv > 1 ? B : A, n = Math.max(K.pv, K.ph);
            var regel = mange.tekst + " har " + Math.max(K.nV, K.nH) + " " + K.E + ", og " + faa.tekst + " har " + Math.min(K.nV, K.nH) + " " + K.E + ".";
            var linjer = medSvar ? [(K.pv > 1 ? n + " " + A.tekst : A.tekst) + " ⟶ " + (K.ph > 1 ? n + " " + B.tekst : B.tekst)] :
                ["? " + faa.tekst];
            return kort("", A.tekst + " ⟶ " + B.tekst, regel, linjer,
                medSvar ? "Der skal " + n + " " + faa.tekst + " til, så der er " + K.antal + " " + K.E + " på begge sider." :
                    "Hvor mange " + faa.tekst + " skal der til, så der er lige mange " + K.E + " på begge sider?");
        }).join("");
    }

    /* ----- Stigning og fald: en tallinje ------------------------------------------------ */
    function tallinje(K, medSvar) {
        var lo = Math.min(K.fra, K.til), hi = Math.max(K.fra, K.til), t = '<div class="fx-tallinje">';
        for (var v = lo; v <= hi; v++) {
            var kl = "fx-trin";
            if (v === K.fra) kl += " fra";
            if (v === K.til) kl += " til";
            if (medSvar && v !== K.fra) kl += " vej";
            t += '<span class="' + kl + '">' + h(X.ox(v)) + (v === K.fra ? "<i>før</i>" : (v === K.til ? "<i>efter</i>" : "")) + "</span>";
        }
        return t + "</div>";
    }

    function klammer(R, medSvar) {
        return [R.ox, R.red].map(function (K) {
            var A = R.led[K.v].st, B = R.led[K.h].st;
            var linjer = [raa(tallinje(K, medSvar)), "Fra " + X.ox(K.fra) + " til " + X.ox(K.til) + "."];
            var svar;
            if (medSvar) {
                linjer.push("Tallet " + (K.op ? "stiger" : "falder") + " " + K.delta + " trin.");
                if (K.antal > 1) linjer.push("Der er " + K.antal + " " + K.E + " på klammen: " + K.antal + " · " + K.delta + " = " + K.tot + ".");
                svar = (K.op ? "↑" : "↓") + K.tot + ". Det er en " + (K.op ? "oxidation" : "reduktion") + ".";
            } else {
                svar = "Går tallet op eller ned? Tæl trinene på tallinjen." + (K.antal > 1 ? " Husk, at der er " + K.antal + " " + K.E + " på klammen." : "");
            }
            return kort(K.type, K.E + ": " + A.tekst + " ⟶ " + B.tekst, "", linjer, svar);
        }).join("");
    }

    /* ----- Gangetallene: to gangetabeller ------------------------------------------------ */
    function gange(R, medSvar) {
        var a = R.ox.tot, b = R.red.tot, fael = a * R.ox.gange;
        var graense = Math.max(fael * 2, a * 3, b * 3);
        function raekke(t, pil) {
            var s = '<div class="fx-tabel-raekke"><span class="fx-tabel-navn">' + pil + t + "</span>";
            for (var n = 1; n * t <= graense && n <= 10; n++) {
                s += '<span class="fx-gange' + (medSvar && n * t === fael ? " faelles" : "") + '">' + n * t + "</span>";
            }
            return s + "</div>";
        }
        var linjer = [raa(raekke(a, "↑") + raekke(b, "↓"))];
        var svar;
        if (medSvar) {
            linjer.push("Det første tal, der står i begge rækker, er " + fael + ".");
            linjer.push(fael + " = " + R.ox.gange + " · " + a + " og " + fael + " = " + R.red.gange + " · " + b + ".");
            svar = "Skriv " + R.ox.gange + " foran ↑" + a + " og " + R.red.gange + " foran ↓" + b + ". Der flytter " + fael + " elektroner.";
            if (R.forafstem) svar += " Tallet foran en formel bliver gangetallet gange det tal, der stod der før.";
        } else {
            svar = "Find det første tal, der står i begge rækker.";
        }
        return kort("", "Stigning ↑" + a + " og fald ↓" + b,
            "Stigningen og faldet skal være lige store. Gangetabellen viser, hvad de kan blive til.", linjer, svar);
    }

    /* ----- Tabeller: ladningen og O-atomerne -------------------------------------------------- */
    function tabel(hoveder, raekker, sum) {
        var t = '<table class="fx-tabel"><thead><tr>' + hoveder.map(function (x) { return "<th>" + h(x) + "</th>"; }).join("") + "</tr></thead><tbody>";
        raekker.forEach(function (r) { t += "<tr>" + r.map(function (x) { return "<td>" + h(x) + "</td>"; }).join("") + "</tr>"; });
        t += '<tr class="sum"><td>I alt</td>' + sum.map(function (x) { return "<td>" + h(x) + "</td>"; }).join("") + "</tr>";
        return t + "</tbody></table>";
    }

    function ladning(R, medSvar) {
        return ["v", "h"].map(function (side) {
            var raekker = [], sum = 0;
            R.led.forEach(function (l, i) {
                if (l.side !== side) return;
                var k = R.koef[i];
                sum += k * l.st.q;
                raekker.push([l.st.tekst, String(k), X.lad(l.st.q), medSvar ? X.lad(k * l.st.q) : k + " · " + X.ladP(l.st.q)]);
            });
            return kort("", side === "v" ? "Før pilen" : "Efter pilen", "",
                [raa(tabel(["Formel", "Tal foran", "Ladning", "I alt"], raekker, ["", "", medSvar ? X.lad(sum) : "?"]))],
                medSvar ? "Ladningen " + sideOrd(side) + " er " + X.lad(sum) + "." : "");
        }).join("") + kort("hel", "", "Gang ionens ladning med tallet foran, og læg det hele sammen. Et stof uden ladning giver 0.", [], "");
    }

    function ion(R, medSvar) {
        var q = R.ladning, ionT = R.ionSt.tekst, pos = R.ionSt.q > 0;
        var regel = pos ? "H⁺ er positive. De skal på den side, hvor ladningen er lavest." :
            "OH⁻ er negative. De skal på den side, hvor ladningen er højest.";
        if (R.miljoe === "neutralt") regel = "Glasset er neutralt: vand kan give OH⁻, men ikke H⁺. " + regel;
        var linjer = ["Før pilen: " + X.lad(q.v), "Efter pilen: " + X.lad(q.h)];
        var svar;
        if (medSvar) {
            var s = R.ion.side, ny = q[s] + R.ion.antal * R.ionSt.q;
            linjer.push("Forskellen er " + Math.abs(q.v - q.h) + ".");
            svar = R.ion.antal + " " + ionT + " " + sideOrd(s) + " gør " + X.lad(q[s]) + " til " + X.lad(ny) + ". Nu er ladningen ens på begge sider.";
        } else {
            svar = "Hvilken side skal " + ionT + " på, og hvor stor er forskellen?";
        }
        return kort("hel", ionT, regel, linjer, svar);
    }

    /* H-atomerne: vandet afstemmer H (som man goer i Danmark), og O er
       kontrollen til sidst */
    function brint(R, medSvar) {
        return ["v", "h"].map(function (side) {
            var raekker = [], sum = 0;
            R.led.forEach(function (l, i) {
                if (l.side !== side) return;
                var k = R.koef[i], n = l.st.el.H || 0;
                sum += k * n;
                raekker.push([l.st.tekst, String(k), String(n), medSvar ? String(k * n) : k + " · " + n]);
            });
            if (R.ion.side === side) {
                sum += R.ion.antal;
                raekker.push([R.ionSt.tekst, String(R.ion.antal), "1", medSvar ? String(R.ion.antal) : R.ion.antal + " · 1"]);
            }
            return kort("", side === "v" ? "Før pilen" : "Efter pilen", "",
                [raa(tabel(["Formel", "Tal foran", "H i formlen", "H i alt"], raekker, ["", "", medSvar ? String(sum) : "?"]))],
                medSvar ? sum + " H " + sideOrd(side) + "." : "");
        }).join("") + kort("hel", "", "Tæl H i hver formel, og gang med tallet foran. Husk H i " + R.ionSt.tekst + ".", [], "");
    }

    function vand(R, medSvar) {
        var o = { v: R.foer.v.H || 0, h: R.foer.h.H || 0 };
        var linjer = ["Før pilen: " + o.v + " H", "Efter pilen: " + o.h + " H"];
        var svar;
        if (medSvar) {
            var s = R.vand.side;
            linjer.push("Der mangler " + 2 * R.vand.antal + " H " + sideOrd(s) + ". Det er " + 2 * R.vand.antal + " : 2 = " + R.vand.antal + " H₂O.");
            svar = R.vand.antal + " H₂O " + sideOrd(s) + ". Så er der " + (R.slut.v.H || 0) + " H på begge sider. Tjek O: " +
                (R.slut.v.O || 0) + " før pilen og " + (R.slut.h.O || 0) + " efter. Det passer.";
        } else {
            svar = "Hvilken side mangler H, og hvor mange H₂O skal der til?";
        }
        return kort("hel", "H₂O", "Hvert H₂O har 2 H. Vandet skal på den side, der har færrest H. Til sidst tjekker man, at O også passer.", linjer, svar);
    }

    /* ----- Farven ------------------------------------------------------------------------ */
    function produkt(R, medSvar, ekstra) {
        var rigtig = R.led[R.red.h].st.f;
        var t = '<div class="fx-farver">';
        D.MANGAN.forEach(function (m) {
            var f = D.FARVE[m.farve];
            t += '<div class="fx-farve' + (medSvar && m.f === rigtig ? " rigtig" : "") + '"><span class="fx-prik" style="background:rgb(' +
                f[0] + "," + f[1] + "," + f[2] + ')"></span><b>' + X.stof(m.f).tekst + "</b><span>" + h(m.tekst) + "</span></div>";
        });
        t += "</div>";
        var m = D.MANGAN.filter(function (x) { return x.f === rigtig; })[0];
        return kort("hel", "", "Hvert manganstof har sin egen farve. Glasset er nu " + (ekstra && ekstra.glas || "") + ".",
            [raa(t)], medSvar ? "Det passer med " + X.stof(rigtig).tekst + ", der er " + m.ord + "." :
                "Hvilken farve på kortet passer med glasset?" + (ekstra && ekstra.kontekst ? " " + ekstra.kontekst : ""));
    }

    var TITEL = {
        produkt: "Hvad blev mangan til?", ox: "Oxidationstallene", "for": "Lige mange atomer",
        klammer: "Stigning og fald", gange: "Gangetallene", ladning: "Ladningen", brint: "H-atomerne", vand: "Vand"
    };

    function lav(R, trin, medSvar, ekstra) {
        var html = "";
        switch (trin) {
        case "produkt": html = produkt(R, medSvar, ekstra); break;
        case "ox": html = ox(R, medSvar); break;
        case "for": html = forafstem(R, medSvar); break;
        case "klammer": html = klammer(R, medSvar); break;
        case "gange": html = gange(R, medSvar); break;
        case "ladning": html = ladning(R, medSvar); break;
        case "ion": html = ion(R, medSvar); break;
        case "brint": html = brint(R, medSvar); break;
        case "vand": html = vand(R, medSvar); break;
        }
        /* Efter et hint er den nederste linje et spoergsmaal, ikke et svar */
        if (!medSvar) html = html.replace(/class="fx-svar"/g, "class=\"fx-svar spoerg\"");
        return { titel: trin === "ion" ? R.ionSt.tekst + " afstemmer ladningen" : TITEL[trin] || "", skema: skema(R, trin), html: html };
    }

    NK.Forklaring = { lav: lav, skema: skema };
}());
