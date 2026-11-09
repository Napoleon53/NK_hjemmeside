/* =====================================================================
   fordeling.js - syrebrøk, basebrøk og fordelingsdiagram (fanen
   Fordeling) og pH i en opløsning af en di- eller trihydron syre
   (fanen Polyhydron syre).

   Besvarelserne følger Kemibogen A1.7 (syrebrøk og basebrøk ud fra
   pufferligningen, x_s = 1 / (1 + 10^(pH - pKs))) og A1.8 (kun første
   trin bestemmer pH; to nabokurver ad gangen i fordelingsdiagrammet).
   Tabellens brøker regnes med alle trin, så tallene også passer, når
   p*K*s-værdierne ligger tæt.
   ===================================================================== */
(function () {
    "use strict";

    var F = window.FACIT;
    var M = F.MINUS;
    var KW = 1e-14;
    var FARVER = { 2: ["#c0392b", "#1f5fbf"], 3: ["#c0392b", "#7c3aed", "#1f5fbf"], 4: ["#c0392b", "#d97706", "#7c3aed", "#1f5fbf"] };
    var H3O = "H<sub>3</sub>O<sup>+</sup>", H2O = "H<sub>2</sub>O";

    function SB() { return window.FACIT_SB; }

    /* ----- Regning ------------------------------------------------------------- */

    /* Andelen af hver form ved en given [H3O+]; form i har afgivet i hydroner */
    function andele(h, Ks) {
        var m = Ks.length, lg = [];
        var lh = Math.log10(h), sum = 0;
        for (var i = 0; i <= m; i++) {
            var l = (m - i) * lh;
            for (var j = 0; j < i; j++) l += Math.log10(Ks[j]);
            lg.push(l);
        }
        var maks = Math.max.apply(null, lg);
        var t = lg.map(function (l) { return Math.pow(10, l - maks); });
        t.forEach(function (x) { sum += x; });
        return t.map(function (x) { return x / sum; });
    }

    /* pH i en opløsning af syren med alle trin (ladningsbalancen) */
    function phAlleTrin(c, Ks) {
        function g(lh) {
            var h = Math.pow(10, lh), a = andele(h, Ks), neg = 0;
            a.forEach(function (x, i) { neg += i * x; });
            return h - KW / h - c * neg;
        }
        var lo = -14, hi = 1;
        for (var k = 0; k < 200; k++) {
            var mid = (lo + hi) / 2;
            if (g(mid) > 0) hi = mid; else lo = mid;
        }
        return -(lo + hi) / 2;
    }

    /* ----- Formlerne ------------------------------------------------------------- */

    function standardFormer(m) {
        var mi = M;
        if (m === 1) return ["S", "B"];
        if (m === 2) return ["H<sub>2</sub>A", "HA<sup>" + mi + "</sup>", "A<sup>2" + mi + "</sup>"];
        return ["H<sub>3</sub>A", "H<sub>2</sub>A<sup>" + mi + "</sup>", "HA<sup>2" + mi + "</sup>", "A<sup>3" + mi + "</sup>"];
    }

    function formerFra(tekst, m, fejl) {
        var dele = (tekst || "").split(/[,;]/).map(function (s) { return s.trim(); }).filter(Boolean);
        if (!dele.length) return standardFormer(m);
        if (dele.length !== m + 1) {
            fejl.push("Skriv " + (m + 1) + " formler adskilt med komma, én for hver form (der er " + m + (m === 1 ? " trin" : " trin") + "). Indtil da bruges " + standardFormer(m).join(", ") + ".");
            return standardFormer(m);
        }
        return dele.map(function (d) {
            // "A2-" og lignende: et enkelt stort bogstav med ladning
            var mm = d.match(/^([A-Z])(\d)([+-])$/);
            if (mm) return mm[1] + "<sup>" + mm[2] + mm[3].replace("-", M) + "</sup>";
            return F.formelHTML(d);
        });
    }

    function svgTekst(html) {
        return html.replace(/<sub>(.*?)<\/sub>/g, '<tspan baseline-shift="sub" font-size="72%">$1</tspan>')
            .replace(/<sup>(.*?)<\/sup>/g, '<tspan baseline-shift="super" font-size="72%">$1</tspan>');
    }

    /* ----- Fordelingsdiagrammet -------------------------------------------------- */

    function diagram(pKs, former, maerker) {
        var B = 560, H = 276, ml = 46, mr = 14, mt = 40, mb = 36;
        var Ks = pKs.map(function (p) { return Math.pow(10, -p); });
        function X(pH) { return ml + pH / 14 * (B - ml - mr); }
        function Y(a) { return mt + (1 - a) * (H - mt - mb); }
        var farver = FARVER[former.length];
        var s = '<svg viewBox="0 0 ' + B + " " + H + '" class="graf fordeling" role="img" aria-label="Fordelingsdiagram">';
        [0, 0.25, 0.5, 0.75, 1].forEach(function (a) {
            s += '<line class="net" x1="' + ml + '" x2="' + (B - mr) + '" y1="' + Y(a) + '" y2="' + Y(a) + '"/>';
            s += '<text x="' + (ml - 6) + '" y="' + (Y(a) + 4) + '" text-anchor="end">' + F.dec(a, 2) + "</text>";
        });
        for (var ph = 0; ph <= 14; ph += 2) {
            s += '<line class="net" y1="' + mt + '" y2="' + (H - mb) + '" x1="' + X(ph) + '" x2="' + X(ph) + '"/>';
            s += '<text x="' + X(ph) + '" y="' + (H - mb + 15) + '" text-anchor="middle">' + ph + "</text>";
        }
        s += '<text x="' + ((ml + B - mr) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">pH</text>';
        var punkter = [], i, k;
        for (i = 0; i <= 280; i++) punkter.push(i * 14 / 280);
        var kurver = former.map(function () { return []; });
        punkter.forEach(function (ph) {
            var a = andele(Math.pow(10, -ph), Ks);
            a.forEach(function (x, j) { kurver[j].push([ph, x]); });
        });
        kurver.forEach(function (kurve, j) {
            s += '<polyline fill="none" stroke="' + farver[j] + '" stroke-width="2.2" points="' + kurve.map(function (pt) { return X(pt[0]).toFixed(1) + "," + Y(pt[1]).toFixed(1); }).join(" ") + '"/>';
        });
        // navne ved hver kurves top; den første og den sidste står ved kanterne
        kurver.forEach(function (kurve, j) {
            var sidst = j === kurver.length - 1;
            var phT, anker = "middle";
            if (j === 0) { phT = 0.25; anker = "start"; }
            else if (sidst) { phT = 13.75; anker = "end"; }
            else phT = kurve.reduce(function (a, b) { return b[1] > a[1] ? b : a; })[0];
            var a = andele(Math.pow(10, -phT), Ks)[j];
            var y = a > 0.5 ? Y(a) - 7 : Y(a) + 16;
            s += '<text class="kurvenavn" x="' + X(phT) + '" y="' + y + '" text-anchor="' + anker + '" fill="' + farver[j] + '">' + svgTekst(former[j]) + "</text>";
        });
        (maerker || []).forEach(function (mk) {
            if (mk.pH < 0 || mk.pH > 14) return;
            s += '<line class="maerke" x1="' + X(mk.pH) + '" x2="' + X(mk.pH) + '" y1="' + mt + '" y2="' + (H - mb) + '"/>';
            s += '<text class="maerke-tekst" x="' + X(mk.pH) + '" y="12" text-anchor="' + (mk.pH < 1 ? "start" : mk.pH > 13 ? "end" : "middle") + '">' + mk.tekst + "</text>";
            s += '<line class="maerke" x1="' + X(mk.pH) + '" x2="' + X(mk.pH) + '" y1="16" y2="' + mt + '"/>';
        });
        return s + "</svg>";
    }

    /* ----- Fælles hjælpere -------------------------------------------------------- */

    function laes(rod, ids) {
        var v = {}, t = {}, fejl = [];
        ids.forEach(function (id) {
            var el = F.$("#" + id, rod);
            var x = F.tal(el.value);
            if (x === null) return;
            if (isNaN(x)) { fejl.push(el.closest("label").querySelector(".feltnavn").innerHTML + " er ikke et tal."); return; }
            v[id] = x;
            t[id] = SB().somSkrevet(el.value, x);
        });
        return { v: v, t: t, fejl: fejl };
    }

    function pKliste(v, t, prefiks, fejl) {
        var pk = [], pt = [];
        [1, 2, 3].forEach(function (i) {
            var k = prefiks + "-pK" + i;
            if (v[k] !== undefined) { pk.push(v[k]); pt.push(t[k]); }
        });
        for (var i = 1; i < pk.length; i++) if (pk[i] <= pk[i - 1]) fejl.push("p<i>K</i><sub>s</sub> skal blive større for hvert trin, fordi hvert trin er svagere end det forrige.");
        if (v[prefiks + "-pK3"] !== undefined && v[prefiks + "-pK2"] === undefined) fejl.push("Udfyld trin 2, før trin 3.");
        return { pk: pk, pt: pt };
    }

    function ligning(h) { return '<p class="ligning">' + h + "</p>"; }
    function h4(t) { return "<h4>" + t + "</h4>"; }
    function p(t) { return "<p>" + t + "</p>"; }
    function pct(x, n) { return F.bc(x * 100, Math.min(n, 3)) + " %"; }
    function liste(a) { return a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " og " + a[a.length - 1]; }

    function andelsTabel(former, a, n) {
        return "<tr><th>Form</th><td class=\"res\">Andel</td><td></td></tr>" + former.map(function (f, i) {
            return "<tr><th>" + f + '</th><td class="res">' + F.bc(a[i], n) + "</td><td>" + pct(a[i], n) + "</td></tr>";
        }).join("");
    }

    /* Syrebrøk og basebrøk for ét trin, som i A1.7 */
    function parBesvarelse(ud, pHt, pKt, pH, pK, syreNavn, baseNavn, n) {
        var r = Math.pow(10, pH - pK);
        var xs = 1 / (1 + r);
        ud.push(h4("Forholdet mellem base og syre"));
        ud.push(ligning(F.brok("<i>n</i><sub>b</sub>", "<i>n</i><sub>s</sub>") + " = 10<sup>pH " + M + " p<i>K</i><sub>s</sub></sup> = 10<sup>" + pHt + " " + M + " " + pKt + "</sup> = 10<sup>" + F.dec(pH - pK, 2) + "</sup> = " + F.bc(r, n)));
        ud.push(h4("Syrebrøken og basebrøken"));
        ud.push(ligning("<i>x</i><sub>s</sub> = " + F.brok("1", "1 + " + F.bc(r, n)) + " = " + F.bc(xs, n) + " &emsp;&emsp; <i>x</i><sub>b</sub> = 1 " + M + " " + F.bc(xs, n) + " = " + F.bc(1 - xs, n)));
        return xs;
    }

    /* ----- Fanen Fordeling --------------------------------------------------------- */

    function beregnFordeling(rod) {
        var l = laes(rod, ["fo-pK1", "fo-pK2", "fo-pK3", "fo-pH", "fo-andel"]);
        var v = l.v, t = l.t, fejl = l.fejl;
        var n = SB().cifre("#fo-cifre");
        var pk = pKliste(v, t, "fo", fejl);
        var tabel = F.$("#fo-resultater", rod), fig = F.$("#fo-diagram", rod), resRamme = F.$("#fo-resultatboks", rod);
        if (v["fo-andel"] !== undefined && (v["fo-andel"] <= 0 || v["fo-andel"] >= 100)) { fejl.push("Andelen på syreform skal være mellem 0 og 100 %."); delete v["fo-andel"]; }
        if (v["fo-andel"] !== undefined && pk.pk.length > 1) fejl.push("Andelen på syreform kan kun regnes om til pH for en monohydron syre (ét trin).");
        if (!pk.pk.length) {
            SB().visFejl("#fo-fejl", fejl);
            resRamme.hidden = true;
            SB().visBesvarelse("#fo-besvarelse", "");
            return;
        }
        var m = pk.pk.length;
        var former = formerFra(F.$("#fo-formler", rod).value, m, fejl);
        var Ks = pk.pk.map(function (x) { return Math.pow(10, -x); });
        var rk = [], ud = [], maerker = [];
        var pH = v["fo-pH"];

        if (pH !== undefined) {
            var a = andele(Math.pow(10, -pH), Ks);
            rk.push(andelsTabel(former, a, n));
            maerker.push({ pH: pH, tekst: "pH " + t["fo-pH"] });
            if (m === 1) {
                ud.push(p("For syren er p<i>K</i><sub>s</sub> = " + pk.pt[0] + ", og pH er " + t["fo-pH"] + "."));
                var xs = parBesvarelse(ud, t["fo-pH"], pk.pt[0], pH, pk.pk[0], former[0], former[1], n);
                ud.push(h4("Konklusion"));
                ud.push(p("Ved pH " + t["fo-pH"] + " findes " + pct(xs, n) + " på syreform (" + former[0] + ") og " + pct(1 - xs, n) + " på baseform (" + former[1] + ")."));
            } else {
                // trinnet med pKs tættest på pH
                var j = 0;
                pk.pk.forEach(function (x, i) { if (Math.abs(x - pH) < Math.abs(pk.pk[j] - pH)) j = i; });
                ud.push(p("Der er aldrig mere end to former, der betyder noget ved samme pH, når p<i>K</i><sub>s</sub>-værdierne ligger langt fra hinanden. Ved pH " + t["fo-pH"] +
                    " er det syren og basen i trin " + (j + 1) + ", " + former[j] + " og " + former[j + 1] + ", som har p<i>K</i><sub>s</sub> = " + pk.pt[j] + "."));
                var xs2 = parBesvarelse(ud, t["fo-pH"], pk.pt[j], pH, pk.pk[j], former[j], former[j + 1], n);
                var andre = 1 - a[j] - a[j + 1];
                ud.push(h4("De andre former"));
                if (andre < 0.01) {
                    ud.push(p("Med alle trin regnet med udgør de andre former tilsammen " + F.bc(andre * 100, 2) + " %. De kan ses bort fra."));
                    ud.push(h4("Konklusion"));
                    ud.push(p("Ved pH " + t["fo-pH"] + " findes " + pct(xs2, n) + " som " + former[j] + " og " + pct(1 - xs2, n) + " som " + former[j + 1] + "."));
                } else {
                    ud.push(p("Med alle trin regnet med udgør de andre former tilsammen " + pct(andre, n) + ". p<i>K</i><sub>s</sub>-værdierne ligger så tæt, at to former ikke er nok, så brug tallene med alle trin."));
                    ud.push(h4("Konklusion"));
                    ud.push(p("Ved pH " + t["fo-pH"] + " findes " + liste(former.map(function (f, i) { return pct(a[i], n) + " som " + f; })) + "."));
                }
            }
        }

        // den anden vej: pH for en bestemt andel på syreform
        if (v["fo-andel"] !== undefined && m === 1) {
            var x = v["fo-andel"] / 100;
            var r = (1 - x) / x;
            var pHa = pk.pk[0] + Math.log10(r);
            rk.push("<tr><th>pH med " + t["fo-andel"] + " % på syreform</th><td class=\"res\">" + SB().logTekst(pHa, n) + "</td><td>pH = p<i>K</i><sub>s</sub> + log(" + F.brok("<i>x</i><sub>b</sub>", "<i>x</i><sub>s</sub>") + ")</td></tr>");
            maerker.push({ pH: pHa, tekst: "pH " + SB().logTekst(pHa, n) });
            ud.push(h4("pH, hvor " + t["fo-andel"] + " % er på syreform"));
            ud.push(ligning("<i>x</i><sub>s</sub> = " + F.bc(x, n) + " &emsp;&emsp; <i>x</i><sub>b</sub> = 1 " + M + " <i>x</i><sub>s</sub> = " + F.bc(1 - x, n)));
            ud.push(p("Forholdet mellem base og syre er det samme som forholdet mellem basebrøken og syrebrøken, og pufferligningen giver pH."));
            ud.push(ligning("pH = p<i>K</i><sub>s</sub> + log(" + F.brok("<i>x</i><sub>b</sub>", "<i>x</i><sub>s</sub>") + ") = " + pk.pt[0] + " + log(" + F.brok(F.bc(1 - x, n), F.bc(x, n)) + ") = " + SB().logTekst(pHa, n)));
            ud.push(p("Ved pH " + SB().logTekst(pHa, n) + " er " + t["fo-andel"] + " % på syreform (" + former[0] + ")."));
        }

        tabel.innerHTML = rk.join("");
        tabel.closest(".tabel-rul").hidden = !rk.length;
        fig.innerHTML = '<div class="graf-navn">Fordelingsdiagram</div>' + diagram(pk.pk, former, maerker);
        resRamme.hidden = false;
        SB().visFejl("#fo-fejl", fejl);
        SB().visBesvarelse("#fo-besvarelse", ud.join(""));
    }

    /* ----- Fanen Polyhydron syre ---------------------------------------------------- */

    function beregnPoly(rod) {
        var l = laes(rod, ["po-cs", "po-pK1", "po-pK2", "po-pK3"]);
        var v = l.v, t = l.t, fejl = l.fejl;
        var n = SB().cifre("#po-cifre");
        var pk = pKliste(v, t, "po", fejl);
        var navn = F.$("#po-navn", rod).value.trim();
        var tabel = F.$("#po-resultater", rod), fig = F.$("#po-diagram", rod), resRamme = F.$("#po-resultatboks", rod);
        if (v["po-cs"] !== undefined && v["po-cs"] <= 0) { fejl.push("<i>c</i><sub>s</sub> skal være større end 0."); delete v["po-cs"]; }
        var m = pk.pk.length;
        var former = formerFra(F.$("#po-formler", rod).value, Math.max(m, 2), fejl);
        if (m === 1 && v["po-pK1"] !== undefined) fejl.push("Udfyld p<i>K</i><sub>s</sub> for trin 2. En monohydron syre regnes i fanen Én syre eller base.");
        if (m < 2 || v["po-cs"] === undefined || fejl.length) {
            SB().visFejl("#po-fejl", fejl);
            resRamme.hidden = true;
            SB().visBesvarelse("#po-besvarelse", "");
            return;
        }
        var c = v["po-cs"], Ks = pk.pk.map(function (x) { return Math.pow(10, -x); });
        var K1 = Ks[0];
        var x1 = (-K1 + Math.sqrt(K1 * K1 + 4 * K1 * c)) / 2;
        var pH1 = -Math.log10(x1);
        var pHalle = phAlleTrin(c, Ks);
        var a = andele(Math.pow(10, -pH1), Ks);

        var rk = [];
        rk.push("<tr><th>pH (første trin)</th><td class=\"res\">" + SB().logTekst(pH1, n) + "</td><td>Som en monohydron syre med p<i>K</i><sub>s</sub> for første trin</td></tr>");
        rk.push("<tr><th>pH (alle trin)</th><td class=\"res\">" + SB().logTekst(pHalle, n) + "</td><td>Kontrol, hvor alle trin og vands selvionisering er regnet med</td></tr>");
        rk.push("<tr><th>[H<sub>3</sub>O<sup>+</sup>]</th><td class=\"res\">" + F.bc(x1, n) + " M</td><td>Første trin</td></tr>");
        rk.push("<tr><th>Omdannelsesgrad, α</th><td class=\"res\">" + pct(x1 / c, n) + "</td><td>Første trin</td></tr>");
        tabel.innerHTML = rk.join("") + andelsTabel(former, a, n).replace("<th>Form</th>", "<th>Form ved pH " + SB().logTekst(pH1, n) + "</th>");
        fig.innerHTML = '<div class="graf-navn">Fordelingsdiagram</div>' + diagram(pk.pk, former, [{ pH: pH1, tekst: "pH " + SB().logTekst(pH1, n) }]);
        resRamme.hidden = false;

        // besvarelsen
        var ud = [];
        ud.push(h4("Trinene"));
        ud.push('<table class="lille-tabel"><thead><tr><th>Trin</th><th>Ligevægt</th><th>p<i>K</i><sub>s</sub></th></tr></thead><tbody>' +
            pk.pk.map(function (x, i) {
                return "<tr><td>" + (i + 1) + "</td><td>" + former[i] + "(aq) + " + H2O + "(l) ⇌ " + former[i + 1] + "(aq) + " + H3O + "(aq)</td><td>" + pk.pt[i] + "</td></tr>";
            }).join("") + "</tbody></table>");
        var forhold = Ks[0] / Ks[1];
        var eksp = Math.round(Math.log10(forhold));
        if (forhold >= 1000) {
            ud.push(p("Andet trin er omkring 10<sup>" + eksp + "</sup> gange svagere end første. Derfor er det kun første trin, der betyder noget for pH, og der regnes, som om syren var monohydron."));
        } else {
            ud.push(p("Andet trin er kun omkring " + F.bc(forhold, 2) + " gange svagere end første. Der regnes først kun med første trin, og bagefter kontrolleres det med alle trin."));
        }
        var stof = navn || former[0];
        var res = SB().svag({
            type: "syre", c: c, cTekst: t["po-cs"], K: K1, pK: pk.pk[0], pKtekst: pk.pt[0],
            afled: ["<i>K</i><sub>s</sub> = 10<sup>" + M + "p<i>K</i><sub>s</sub></sup> M = 10<sup>" + M + pk.pt[0] + "</sup> M = " + F.bc(K1, n) + " M &emsp; (første trin)"],
            navn: stof, S: former[0], B: former[1], n: n,
            reaktion: former[0] + "(aq) + " + H2O + "(l) ⇌ " + former[1] + "(aq) + " + H3O + "(aq)",
            konklusion: "pH i " + t["po-cs"] + " M " + stof + " er " + SB().logTekst(pH1, n) + "."
        });
        ud.push(res.html);
        ud.push(h4("Kontrol med alle trin"));
        var forskel = Math.abs(pHalle - pH1);
        ud.push(p("En beregning, der også regner de andre trin og vands selvionisering med, giver pH = " + SB().logTekst(pHalle, n) + ". " +
            (forskel < 0.005 ? "De andre trin betyder altså ikke noget for pH." : forskel < 0.05 ? "De andre trin ændrer kun pH lidt." :
                "De andre trin ændrer pH med " + F.dec(forskel, 2) + ", så de kan ikke ses bort fra her.")));
        ud.push(h4("Formerne i opløsningen"));
        var vigtige = former.map(function (f, i) { return { f: f, a: a[i] }; }).filter(function (o) { return o.a >= 0.001; });
        ud.push(p("Ved pH " + SB().logTekst(pH1, n) + " findes " + liste(vigtige.map(function (o) { return pct(o.a, n) + " som " + o.f; })) + ". " +
            (vigtige.length < former.length ? "Resten af formerne udgør under 0,1 %." : "")));
        SB().visFejl("#po-fejl", fejl);
        SB().visBesvarelse("#po-besvarelse", ud.join(""));
    }

    window.FACIT_FORDELING = {
        beregn: function (rod) { beregnFordeling(rod); beregnPoly(rod); },
        andele: andele, phAlleTrin: phAlleTrin
    };
})();
