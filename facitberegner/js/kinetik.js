/* =====================================================================
   kinetik.js - reaktionens orden og Arrhenius ud fra måledata

   Afløser arkene Reaktionsordener og Aktiveringsenergi (Arrhenius) i
   superskabelonen. Data sættes ind som to kolonner, fx kopieret fra
   Excel. Besvarelserne følger Kemibogen A5.2 til A5.4 og UVM's
   Lærerens hæfte: udtrykket, regression uden at tvinge linjen gennem
   (0,0), modellen med symboler og enheder, graf med punkter og linje,
   og en vurdering ud fra grafen og residualerne, suppleret med r².
   ===================================================================== */
(function () {
    "use strict";

    var F = window.FACIT;
    var M = F.MINUS;
    var R = 8.314;
    var rod;

    function ligning(h) { return '<p class="ligning">' + h + "</p>"; }
    function h4(t) { return "<h4>" + t + "</h4>"; }
    function p(t) { return "<p>" + t + "</p>"; }
    function sup(t) { return "<sup>" + t + "</sup>"; }

    function somSkrevet(raa, x) { return window.FACIT_SB ? window.FACIT_SB.somSkrevet(raa, x) : F.som(x); }

    /* En enhed som "s-1" eller "M^-1 s^-1" skrives med hævet skrift */
    function enhed(t) {
        t = (t || "").trim();
        return F.esc(t).replace(/\^?([-−]?\d+)/g, function (_, e) { return sup(e.replace("-", M)); }).replace(/\*/g, " · ");
    }
    function enhedMinus1(t) { return /\s|·|\//.test(t) ? "(" + t + ")" + sup(M + "1") : t + sup(M + "1"); }

    /* To kolonner: tabulator, semikolon eller mellemrum */
    function laesData(tekst, fejl, navn1, navn2) {
        var pts = [];
        (tekst || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (l) {
            var dele;
            if (/\t/.test(l)) dele = l.split(/\t+/);
            else if (/;/.test(l)) dele = l.split(/\s*;\s*/);
            else { var m = l.split(/\s+/); dele = [m[0], m.slice(1).join(" ")]; }
            if (dele.length < 2 || !dele[1]) return;
            var x = F.tal(dele[0]), y = F.tal(dele[1]);
            if (x === null || y === null || isNaN(x) || isNaN(y)) {
                if (!/[a-zæøå]{2,}/i.test(l)) fejl.push("Linjen \"" + F.esc(l) + "\" kan ikke læses som " + navn1 + " og " + navn2 + ".");
                return;
            }
            pts.push({ x: x, y: y, xT: somSkrevet(dele[0], x), yT: somSkrevet(dele[1], y) });
        });
        return pts;
    }

    function regression(xs, ys) {
        var n = xs.length, mx = 0, my = 0, sxx = 0, sxy = 0, syy = 0;
        xs.forEach(function (x, i) { mx += x / n; my += ys[i] / n; });
        xs.forEach(function (x, i) { sxx += (x - mx) * (x - mx); sxy += (x - mx) * (ys[i] - my); syy += (ys[i] - my) * (ys[i] - my); });
        if (sxx === 0) return null;
        var a = sxy / sxx, b = my - a * mx;
        var res = xs.map(function (x, i) { return ys[i] - (a * x + b); });
        var ssr = res.reduce(function (s, e) { return s + e * e; }, 0);
        return { a: a, b: b, r2: syy > 0 ? 1 - ssr / syy : 1, res: res };
    }

    /* Ligger residualerne i en bue (fx + − − − +), eller tilfældigt? */
    function moenster(res) {
        var n = res.length;
        var maks = Math.max.apply(null, res.map(Math.abs)) || 1;
        var tegn = res.map(function (e) { return Math.abs(e) < 1e-9 * maks ? 0 : e > 0 ? 1 : -1; }).filter(function (s) { return s !== 0; });
        var loeb = 1;
        for (var i = 1; i < tegn.length; i++) if (tegn[i] !== tegn[i - 1]) loeb++;
        return { bue: n >= 5 && loeb <= 3 && tegn.length >= 5 && tegn[0] === tegn[tegn.length - 1], loeb: loeb, maks: maks };
    }

    /* ----- Graf med punkter og linje ---------------------------------------------- */

    function aksetal(min, maks, antal) {
        var spaend = maks - min || 1;
        var skridt = Math.pow(10, Math.floor(Math.log10(spaend / antal)));
        [1, 2, 2.5, 5, 10].some(function (f) { if (spaend / (skridt * f) <= antal) { skridt *= f; return true; } return false; });
        var ud = [];
        for (var x = Math.ceil(min / skridt) * skridt; x <= maks + skridt * 1e-9; x += skridt) ud.push(Math.abs(x) < skridt / 1e6 ? 0 : x);
        return ud;
    }

    function tickTekst(t, skala) { return F.som(Number((t * (skala || 1)).toPrecision(10))).replace(/<sup>(.*?)<\/sup>/g, "^$1"); }

    function plot(xs, ys, linje, xNavn, yNavn, o) {
        o = o || {};
        var B = 330, H = 220, ml = 50, mr = 10, mt = 12, mb = 38;
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
        if (o.medNul && x0 > 0) x0 = 0;
        var px = (x1 - x0) * 0.05 || 1; x0 -= o.medNul ? 0 : px; x1 += px;
        var alle = ys.slice();
        if (linje) alle.push(linje.a * x0 + linje.b, linje.a * x1 + linje.b);
        if (o.nullinje) alle.push(0);
        var y0 = Math.min.apply(null, alle), y1 = Math.max.apply(null, alle);
        if (y1 - y0 < 1e-12) { y0 -= 1; y1 += 1; }
        var py = (y1 - y0) * 0.08; y0 -= py; y1 += py;
        function X(x) { return ml + (x - x0) / (x1 - x0) * (B - ml - mr); }
        function Y(y) { return mt + (y1 - y) / (y1 - y0) * (H - mt - mb); }
        var skala = o.xSkala || 1;
        var s = '<svg viewBox="0 0 ' + B + " " + H + '" class="graf" role="img">';
        aksetal(y0, y1, 5).forEach(function (t) {
            s += '<line class="net' + (t === 0 && o.nullinje ? " nul" : "") + '" x1="' + ml + '" x2="' + (B - mr) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/>';
            s += '<text x="' + (ml - 5) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + tickTekst(t) + "</text>";
        });
        aksetal(x0, x1, 5).forEach(function (t) {
            s += '<line class="net" y1="' + mt + '" y2="' + (H - mb) + '" x1="' + X(t) + '" x2="' + X(t) + '"/>';
            s += '<text x="' + X(t) + '" y="' + (H - mb + 15) + '" text-anchor="middle">' + tickTekst(t, skala) + "</text>";
        });
        if (linje) s += '<line class="kurve" x1="' + X(x0) + '" x2="' + X(x1) + '" y1="' + Y(linje.a * x0 + linje.b) + '" y2="' + Y(linje.a * x1 + linje.b) + '"/>';
        xs.forEach(function (x, i) { s += '<circle class="punkt" cx="' + X(x).toFixed(1) + '" cy="' + Y(ys[i]).toFixed(1) + '" r="3.5"/>'; });
        s += "</svg>";
        return '<figure class="kin-graf"><div class="graf-navn">' + yNavn + "</div>" + s + '<div class="graf-x">' + xNavn + "</div>" + (o.tekst ? '<figcaption>' + o.tekst + "</figcaption>" : "") + "</figure>";
    }

    /* ----- Reaktionens orden ------------------------------------------------------- */

    var ORD = ["nulte", "første", "anden"];

    function beregnOrden() {
        var fejl = [];
        var n = cifre("#ki-cifre");
        var stof = F.$("#ki-stof", rod).value.trim() || "A";
        var cU = F.$("#ki-cenhed", rod).value.trim() || "M", tU = F.$("#ki-tenhed", rod).value.trim() || "s";
        var opgave = F.$("#ki-opgave", rod).value;
        var gas = cU === "bar";
        var A = gas ? "<i>p</i>(" + F.formelHTML(stof) + ")" : "[" + F.formelHTML(stof) + "]";
        var A0 = gas ? "<i>p</i>(" + F.formelHTML(stof) + ")<sub>0</sub>" : "[" + F.formelHTML(stof) + "]<sub>0</sub>";
        var cUh = enhed(cU), tUh = enhed(tU);
        var pts = laesData(F.$("#ki-data", rod).value, fejl, "en tid", "en koncentration");
        if (pts.some(function (q) { return q.y <= 0; })) fejl.push("Alle koncentrationer skal være større end 0, så ln og 1/koncentration kan beregnes.");
        var resRamme = F.$("#ki-resultatboks", rod);
        if (pts.length < 3 || fejl.length) {
            if (pts.length && pts.length < 3 && !fejl.length) fejl.push("Der skal være mindst tre målinger.");
            visFejl("#ki-fejl", fejl); resRamme.hidden = true; visBesvarelse("#ki-besvarelse", ""); return;
        }
        var ts = pts.map(function (q) { return q.x; });
        var ordener = opgave === "bestem" ? [0, 1, 2] : [parseInt(opgave, 10)];
        var mod = {};
        [0, 1, 2].forEach(function (o) {
            var ys = pts.map(function (q) { return o === 0 ? q.y : o === 1 ? Math.log(q.y) : 1 / q.y; });
            var rg = regression(ts, ys);
            if (!rg) return;
            rg.ys = ys;
            rg.m = moenster(rg.res);
            rg.k = o === 2 ? rg.a : -rg.a;
            rg.c0 = o === 0 ? rg.b : o === 1 ? Math.exp(rg.b) : 1 / rg.b;
            rg.thalv = o === 0 ? rg.c0 / (2 * rg.k) : o === 1 ? Math.LN2 / rg.k : 1 / (rg.k * rg.c0);
            rg.passer = rg.r2 >= 0.99 && !rg.m.bue && rg.k > 0;
            mod[o] = rg;
        });
        if (!mod[0]) { visFejl("#ki-fejl", ["Målingerne skal være ved forskellige tider."]); resRamme.hidden = true; visBesvarelse("#ki-besvarelse", ""); return; }
        var valgt;
        if (opgave === "bestem") {
            var passer = ordener.filter(function (o) { return mod[o].passer; });
            var kand = passer.length ? passer : ordener;
            valgt = kand.reduce(function (a, o) { return mod[o].r2 > mod[a].r2 ? o : a; }, kand[0]);
        } else valgt = ordener[0];
        var V = mod[valgt];

        // enheder og navne for hver orden
        function yNavn(o) { return o === 0 ? A + " i " + cUh : o === 1 ? "ln(" + A + " / " + cUh + ")" : "1/" + A + " i " + enhedMinus1(cUh); }
        function kEnhed(o) { return o === 0 ? cUh + "/" + tUh : o === 1 ? enhedMinus1(tUh) : F.brok("1", cUh + " · " + tUh); }
        function kEnhedKort(o) { return o === 0 ? cUh + "/" + tUh : o === 1 ? enhedMinus1(tUh) : enhedMinus1(cUh) + " · " + enhedMinus1(tUh); }
        function bTekst(o, rg) { return o === 1 ? F.bc(rg.b, n + 1, 1e7) : F.bc(rg.b, n, 1e7); }
        function model(o, rg) {
            var hT = F.bc(Math.abs(rg.a), n, 1e7);
            var hd = o === 2 ? (rg.a < 0 ? M : "") + hT : (rg.a > 0 ? "" : M) + hT;
            var bt = rg.b < 0 ? " " + M + " " + F.bc(-rg.b, o === 1 ? n + 1 : n, 1e7) : " + " + bTekst(o, rg);
            var venstre = o === 0 ? A : o === 1 ? "ln(" + A + " / " + cUh + ")" : F.brok("1", A);
            var bEnh = o === 0 ? " " + cUh : o === 1 ? "" : " " + F.brok("1", cUh);
            return venstre + " = " + hd + " " + kEnhed(o) + " · <i>t</i>" + bt + bEnh;
        }
        function linjeUdtryk(o) {
            return o === 0 ? A + " = " + M + "<i>k</i> · <i>t</i> + " + A0 : o === 1 ? "ln" + A + " = " + M + "<i>k</i> · <i>t</i> + ln" + A0 : F.brok("1", A) + " = <i>k</i> · <i>t</i> + " + F.brok("1", A0);
        }
        function vurdering(o, rg) {
            var r2 = F.dec(rg.r2, 4);
            if (rg.k <= 0) return "Hældningen har det forkerte fortegn, så modellen for " + ORD[o] + " orden passer ikke (<i>r</i>" + sup("2") + " = " + r2 + ").";
            if (rg.m.bue) return "For " + ORD[o] + " orden ligger punkterne i en bue omkring linjen, og residualerne danner et mønster, selv om <i>r</i>" + sup("2") + " = " + r2 + ".";
            if (rg.r2 < 0.99) return "For " + ORD[o] + " orden ligger punkterne ikke tæt på linjen (<i>r</i>" + sup("2") + " = " + r2 + ").";
            return "For " + ORD[o] + " orden ligger punkterne tæt på linjen og tilfældigt omkring den. Residualerne er højst " + F.bc(rg.m.maks, 2, 1e7) + " og uden mønster, og <i>r</i>" + sup("2") + " = " + r2 + ".";
        }

        // resultattabellen
        var rk = [];
        ordener.forEach(function (o) {
            var rg = mod[o];
            rk.push("<tr><th>" + ORD[o].charAt(0).toUpperCase() + ORD[o].slice(1) + " orden" + (o === valgt && opgave === "bestem" ? " (valgt)" : "") + '</th><td class="res">' +
                "<i>r</i>" + sup("2") + " = " + F.dec(rg.r2, 4) + "</td><td>" + (rg.passer ? "Punkterne ligger tilfældigt om linjen" : rg.m.bue ? "Punkterne ligger i en bue" : "Passer ikke") + "</td></tr>");
        });
        rk.push("<tr><th>Hastighedskonstant</th><td class=\"res\"><i>k</i> = " + F.bc(V.k, n, 1e7) + " " + kEnhedKort(valgt) + "</td><td>" + ORD[valgt].charAt(0).toUpperCase() + ORD[valgt].slice(1) + " orden</td></tr>");
        rk.push("<tr><th>Halveringstid</th><td class=\"res\"><i>t</i><sub>½</sub> = " + F.bc(V.thalv, n, 1e7) + " " + tUh + "</td><td>" + (valgt === 1 ? "Den samme hele vejen" : "Fra starten, " + A0 + " = " + F.bc(V.c0, n, 1e7) + " " + cUh) + "</td></tr>");
        rk.push("<tr><th>Hastighedsudtryk</th><td class=\"res\"><i>v</i> = <i>k</i>" + (valgt === 0 ? "" : " · " + A + (valgt === 2 ? sup("2") : "")) + "</td><td></td></tr>");

        // brug modellen
        var tny = F.tal(F.$("#ki-tny", rod).value), cny = F.tal(F.$("#ki-cny", rod).value);
        var brug = [];
        function cVedT(t) { return valgt === 0 ? V.a * t + V.b : valgt === 1 ? Math.exp(V.a * t + V.b) : 1 / (V.a * t + V.b); }
        function tVedC(c) { return valgt === 0 ? (c - V.b) / V.a : valgt === 1 ? (Math.log(c) - V.b) / V.a : (1 / c - V.b) / V.a; }
        if (tny !== null && !isNaN(tny)) {
            var cT = cVedT(tny);
            rk.push("<tr><th>" + A + " efter " + somSkrevet(F.$("#ki-tny", rod).value, tny) + " " + tUh + '</th><td class="res">' + (cT > 0 ? F.bc(cT, n, 1e7) + " " + cUh : "under 0") + "</td><td>Modellen</td></tr>");
            brug.push({ type: "c", t: tny, tT: somSkrevet(F.$("#ki-tny", rod).value, tny), v: cT });
        }
        if (cny !== null && !isNaN(cny) && cny > 0) {
            var tC = tVedC(cny);
            rk.push("<tr><th>Tid til " + A + " = " + somSkrevet(F.$("#ki-cny", rod).value, cny) + " " + cUh + '</th><td class="res">' + F.bc(tC, n, 1e7) + " " + tUh + "</td><td>Modellen</td></tr>");
            brug.push({ type: "t", c: cny, cT: somSkrevet(F.$("#ki-cny", rod).value, cny), v: tC });
        }
        F.$("#ki-resultater", rod).innerHTML = rk.join("");

        // graferne
        var g = [];
        ordener.forEach(function (o) {
            var rg = mod[o];
            g.push('<div class="kin-par">' + plot(ts, rg.ys, rg, "<i>t</i> i " + tUh, yNavn(o), { tekst: ORD[o].charAt(0).toUpperCase() + ORD[o].slice(1) + " orden" }) +
                plot(ts, rg.res, null, "<i>t</i> i " + tUh, "Residual", { nullinje: true }) + "</div>");
        });
        F.$("#ki-grafer", rod).innerHTML = g.join("");
        resRamme.hidden = false;

        // besvarelsen
        var ud = [];
        ud.push(h4(ordener.length > 1 ? "Udtrykkene, der skal undersøges" : "Udtrykket, der skal undersøges"));
        if (ordener.length > 1) ud.push(p("De tre lineære udtryk er " + linjeUdtryk(0) + " for nulte orden, " + linjeUdtryk(1) + " for første orden og " + linjeUdtryk(2) + " for anden orden."));
        else ud.push(p("For en reaktion af " + ORD[valgt] + " orden er " + linjeUdtryk(valgt) + "." + (valgt === 0 ? " Her skal der ikke regnes om." : " Derfor beregnes " + (valgt === 1 ? "ln" + A : "1/" + A) + " for hver måling.")));
        var visLn = ordener.indexOf(1) >= 0, vis1 = ordener.indexOf(2) >= 0;
        if (visLn || vis1) {
            ud.push('<table class="lille-tabel"><thead><tr><th><i>t</i> i ' + tUh + "</th><th>" + A + " i " + cUh + "</th>" + (visLn ? "<th>ln(" + A + " / " + cUh + ")</th>" : "") + (vis1 ? "<th>1/" + A + " i " + enhedMinus1(cUh) + "</th>" : "") + "</tr></thead><tbody>" +
                pts.map(function (q) { return "<tr><td>" + q.xT + "</td><td>" + q.yT + "</td>" + (visLn ? "<td>" + F.dec(Math.log(q.y), 3) + "</td>" : "") + (vis1 ? "<td>" + F.bc(1 / q.y, 3, 1e7) + "</td>" : "") + "</tr>"; }).join("") + "</tbody></table>");
        }
        ud.push(h4(ordener.length > 1 ? "Grafer og regression" : "Graf og regression"));
        if (ordener.length > 1) {
            ud.push('<table class="lille-tabel"><thead><tr><th>Orden</th><th>På <i>y</i>-aksen</th><th>Regression</th><th><i>r</i>' + sup("2") + "</th></tr></thead><tbody>" +
                ordener.map(function (o) {
                    var rg = mod[o];
                    return "<tr><td>" + ORD[o] + "</td><td>" + (o === 0 ? A : o === 1 ? "ln" + A : "1/" + A) + "</td><td><i>y</i> = " + F.bc(rg.a, n, 1e7) + " · <i>x</i> " + (rg.b < 0 ? M + " " + F.bc(-rg.b, o === 1 ? n + 1 : n, 1e7) : "+ " + bTekst(o, rg)) + "</td><td>" + F.dec(rg.r2, 4) + "</td></tr>";
                }).join("") + "</tbody></table>");
            ud.push(p("Graferne med punkter, linjer og residualplot står under Facit."));
        } else {
            ud.push(p("Lineær regression uden at tvinge linjen gennem (0,0) giver <i>y</i> = " + F.bc(V.a, n, 1e7) + " · <i>x</i> " + (V.b < 0 ? M + " " + F.bc(-V.b, valgt === 1 ? n + 1 : n, 1e7) : "+ " + bTekst(valgt, V)) +
                ". Med symboler og enheder er modellen"));
            ud.push(ligning(model(valgt, V)));
            ud.push(p("Grafen med punkter, linje og residualplot står under Facit."));
        }
        ud.push(h4(ordener.length > 1 ? "Vurdering af modellerne" : "Vurdering af modellen"));
        ordener.forEach(function (o) { ud.push(p(vurdering(o, mod[o]))); });
        ud.push(h4("Konklusion"));
        if (opgave === "bestem") {
            if (V.passer) {
                ud.push(p("Kun modellen for " + ORD[valgt] + " orden beskriver målingerne. Reaktionen er af " + ORD[valgt] + " orden med hensyn til " + F.formelHTML(stof) + ", og modellen er"));
            } else {
                ud.push(p("Ingen af de tre modeller passer helt. Modellen for " + ORD[valgt] + " orden passer bedst, og den er"));
            }
            ud.push(ligning(model(valgt, V)));
        } else if (V.passer) {
            ud.push(p("Punkterne ligger tilfældigt omkring linjen, så målingerne viser, at reaktionen er af " + ORD[valgt] + " orden med hensyn til " + F.formelHTML(stof) + "."));
        } else {
            ud.push(p("Punkterne ligger ikke tilfældigt omkring linjen, så målingerne viser ikke, at reaktionen er af " + ORD[valgt] + " orden. Prøv at bestemme ordenen."));
        }
        ud.push(h4("Hastighedskonstanten"));
        ud.push(p("Hældningen er " + (valgt === 2 ? "<i>k</i>" : M + "<i>k</i>") + ", så <i>k</i> = " + F.bc(V.k, n, 1e7) + " " + kEnhedKort(valgt) + "."));
        ud.push(h4("Halveringstiden"));
        if (valgt === 0) {
            ud.push(p("Modellens startkoncentration er " + A0 + " = " + F.bc(V.c0, n, 1e7) + " " + cUh + "."));
            ud.push(ligning("<i>t</i><sub>½</sub> = " + F.brok(A0, "2 · <i>k</i>") + " = " + F.brok(F.bc(V.c0, n, 1e7) + " " + cUh, "2 · " + F.bc(V.k, n, 1e7) + " " + cUh + "/" + tUh) + " = " + F.bc(V.thalv, n, 1e7) + " " + tUh));
            ud.push(p("Ved nulte orden bliver halveringstiden kortere og kortere, fordi den afhænger af koncentrationen."));
        } else if (valgt === 1) {
            ud.push(ligning("<i>t</i><sub>½</sub> = " + F.brok("ln 2", "<i>k</i>") + " = " + F.brok("ln 2", F.bc(V.k, n, 1e7) + " " + enhedMinus1(tUh)) + " = " + F.bc(V.thalv, n, 1e7) + " " + tUh));
            ud.push(p("Ved første orden er halveringstiden den samme hele vejen."));
        } else {
            ud.push(p("Modellens startkoncentration er " + A0 + " = " + F.brok("1", F.bc(V.b, n, 1e7) + " " + enhedMinus1(cUh)) + " = " + F.bc(V.c0, n, 1e7) + " " + cUh + "."));
            ud.push(ligning("<i>t</i><sub>½</sub> = " + F.brok("1", "<i>k</i> · " + A0) + " = " + F.brok("1", F.bc(V.k, n, 1e7) + " " + kEnhedKort(2) + " · " + F.bc(V.c0, n, 1e7) + " " + cUh) + " = " + F.bc(V.thalv, n, 1e7) + " " + tUh));
            ud.push(p("Ved anden orden bliver halveringstiden længere og længere, fordi den afhænger af koncentrationen."));
        }
        ud.push(h4("Hastighedsudtrykket"));
        ud.push(ligning("<i>v</i> = <i>k</i>" + (valgt === 0 ? "" : " · " + A + (valgt === 2 ? sup("2") : "")) + " &emsp; med <i>k</i> = " + F.bc(V.k, n, 1e7) + " " + kEnhedKort(valgt)));
        brug.forEach(function (b) {
            if (b.type === "c") {
                ud.push(h4(A + " efter " + b.tT + " " + tUh));
                var hoejre = F.bc(V.a, n, 1e7) + " " + kEnhed(valgt).replace(/^/, "") + " · " + b.tT + " " + tUh;
                if (valgt === 0) ud.push(ligning(A + " = " + F.bc(V.a, n, 1e7) + " " + cUh + "/" + tUh + " · " + b.tT + " " + tUh + " + " + F.bc(V.b, n, 1e7) + " " + cUh + " = " + F.bc(b.v, n, 1e7) + " " + cUh));
                else if (valgt === 1) {
                    var lnv = V.a * b.t + V.b;
                    ud.push(ligning("ln(" + A + " / " + cUh + ") = " + F.bc(V.a, n, 1e7) + " " + enhedMinus1(tUh) + " · " + b.tT + " " + tUh + " + " + F.bc(V.b, n + 1, 1e7) + " = " + F.bc(lnv, n + 1, 1e7)));
                    ud.push(ligning(A + " = e" + sup(F.bc(lnv, n + 1, 1e7)) + " " + cUh + " = " + F.bc(b.v, n, 1e7) + " " + cUh));
                } else {
                    var inv = V.a * b.t + V.b;
                    ud.push(ligning(F.brok("1", A) + " = " + F.bc(V.a, n, 1e7) + " " + kEnhed(2) + " · " + b.tT + " " + tUh + " + " + F.bc(V.b, n, 1e7) + " " + F.brok("1", cUh) + " = " + F.bc(inv, n, 1e7) + " " + F.brok("1", cUh)));
                    ud.push(ligning(A + " = " + F.brok("1", F.bc(inv, n, 1e7) + " " + enhedMinus1(cUh)) + " = " + F.bc(b.v, n, 1e7) + " " + cUh));
                }
            } else {
                ud.push(h4("Tidspunktet, hvor " + A + " = " + b.cT + " " + cUh));
                ud.push(p("Modellen løses for <i>t</i>, og " + A + " = " + b.cT + " " + cUh + " sættes ind."));
                if (valgt === 0) ud.push(ligning("<i>t</i> = " + F.brok(A0 + " " + M + " " + A, "<i>k</i>") + " = " + F.brok(F.bc(V.b, n, 1e7) + " " + cUh + " " + M + " " + b.cT + " " + cUh, F.bc(V.k, n, 1e7) + " " + cUh + "/" + tUh) + " = " + F.bc(b.v, n, 1e7) + " " + tUh));
                else if (valgt === 1) ud.push(ligning("<i>t</i> = " + F.brok(F.bc(V.b, n + 1, 1e7) + " " + M + " ln(" + b.cT + ")", F.bc(V.k, n, 1e7) + " " + enhedMinus1(tUh)) + " = " + F.bc(b.v, n, 1e7) + " " + tUh));
                else ud.push(ligning("<i>t</i> = " + F.brok(F.brok("1", A) + " " + M + " " + F.brok("1", A0), "<i>k</i>") + " = " + F.brok(F.brok("1", b.cT + " " + cUh) + " " + M + " " + F.bc(V.b, n, 1e7) + " " + F.brok("1", cUh), F.bc(V.k, n, 1e7) + " " + kEnhed(2)) + " = " + F.bc(b.v, n, 1e7) + " " + tUh));
            }
        });
        visFejl("#ki-fejl", fejl);
        visBesvarelse("#ki-besvarelse", ud.join(""));
    }

    /* ----- Arrhenius -------------------------------------------------------------------- */

    function beregnArrhenius() {
        var fejl = [];
        var n = cifre("#ar-cifre");
        var C = F.$("#ar-tenhed", rod).value === "C";
        var kU = F.$("#ar-kenhed", rod).value.trim() || "s-1";
        var kUh = enhed(kU);
        var pts = laesData(F.$("#ar-data", rod).value, fejl, "en temperatur", "en hastighedskonstant");
        if (pts.some(function (q) { return q.y <= 0; })) fejl.push("Alle hastighedskonstanter skal være større end 0.");
        pts.forEach(function (q) { q.T = C ? 273 + q.x : q.x; q.ix = 1 / q.T; q.ln = Math.log(q.y); });
        if (pts.some(function (q) { return q.T <= 0; })) fejl.push("Temperaturerne skal være over 0 K.");
        var resRamme = F.$("#ar-resultatboks", rod);
        if (pts.length < 2 || fejl.length) {
            if (pts.length === 1 && !fejl.length) fejl.push("Der skal være mindst to målinger.");
            visFejl("#ar-fejl", fejl); resRamme.hidden = true; visBesvarelse("#ar-besvarelse", ""); return;
        }
        var rg = regression(pts.map(function (q) { return q.ix; }), pts.map(function (q) { return q.ln; }));
        if (!rg) { visFejl("#ar-fejl", ["Målingerne skal være ved forskellige temperaturer."]); resRamme.hidden = true; visBesvarelse("#ar-besvarelse", ""); return; }
        var Ea = -rg.a * R;                 // J/mol
        var lnA = rg.b, Aft = Math.exp(lnA);
        var to = pts.length === 2;
        var aT = F.bc(rg.a, Math.max(n + 1, 4), 1e6), bT = F.bc(rg.b, n + 1, 1e7);
        var rk = [];
        rk.push("<tr><th>Aktiveringsenergi</th><td class=\"res\"><i>E</i><sub>a</sub> = " + F.bc(Ea / 1000, n) + " kJ/mol</td><td><i>E</i><sub>a</sub> = " + M + "<i>a</i> · <i>R</i></td></tr>");
        rk.push("<tr><th>Frekvensfaktor</th><td class=\"res\"><i>A</i> = " + F.bc(Aft, n) + " " + kUh + "</td><td><i>A</i> = e" + sup("<i>b</i>") + "</td></tr>");
        if (!to) rk.push("<tr><th>Regression</th><td class=\"res\"><i>r</i>" + sup("2") + " = " + F.dec(rg.r2, 4) + "</td><td>" + (moenster(rg.res).bue ? "Punkterne ligger i en bue" : "Punkterne ligger tilfældigt om linjen") + "</td></tr>");
        var Tny = F.tal(F.$("#ar-Tny", rod).value), kny = null, TnyK = null;
        if (Tny !== null && !isNaN(Tny)) {
            TnyK = C ? 273 + Tny : Tny;
            if (TnyK > 0) { kny = Math.exp(rg.a / TnyK + rg.b); rk.push("<tr><th><i>k</i> ved " + F.som(Tny) + (C ? " °C" : " K") + '</th><td class="res">' + F.bc(kny, n) + " " + kUh + "</td><td>Modellen</td></tr>"); }
        }
        F.$("#ar-resultater", rod).innerHTML = rk.join("");
        F.$("#ar-grafer", rod).innerHTML = '<div class="kin-par">' + plot(pts.map(function (q) { return q.ix; }), pts.map(function (q) { return q.ln; }), rg,
            "1/<i>T</i> i 10" + sup(M + "3") + " K" + sup(M + "1"), "ln(<i>k</i> / " + kUh + ")", { xSkala: 1000, tekst: "Arrhenius-plot" }) +
            (to ? "" : plot(pts.map(function (q) { return q.ix; }), rg.res, null, "1/<i>T</i> i 10" + sup(M + "3") + " K" + sup(M + "1"), "Residual", { xSkala: 1000, nullinje: true })) + "</div>";
        resRamme.hidden = false;

        var ud = [];
        ud.push(h4("Udtrykket, der skal undersøges"));
        ud.push(p("Arrhenius-ligningen på lineær form er"));
        ud.push(ligning("ln <i>k</i> = " + M + F.brok("<i>E</i><sub>a</sub>", "<i>R</i>") + " · " + F.brok("1", "<i>T</i>") + " + ln <i>A</i>"));
        ud.push(p("Afbildes ln <i>k</i> som funktion af 1/<i>T</i>, er hældningen " + M + "<i>E</i><sub>a</sub>/<i>R</i>, og skæringen med <i>y</i>-aksen er ln <i>A</i>. " +
            (C ? "Temperaturerne regnes om til kelvin med <i>T</i> = (273 + <i>t</i>) K, og " : "") + "<i>k</i> sættes ind som tal uden enhed."));
        ud.push('<table class="lille-tabel"><thead><tr>' + (C ? "<th><i>t</i> i °C</th>" : "") + "<th><i>T</i> i K</th><th><i>k</i> i " + kUh + "</th><th>1/<i>T</i> i K" + sup(M + "1") + "</th><th>ln(<i>k</i> / " + kUh + ")</th></tr></thead><tbody>" +
            pts.map(function (q) { return "<tr>" + (C ? "<td>" + q.xT + "</td>" : "") + "<td>" + (C ? F.som(q.T) : q.xT) + "</td><td>" + q.yT + "</td><td>" + F.bc(q.ix, 4) + "</td><td>" + F.dec(q.ln, 3) + "</td></tr>"; }).join("") + "</tbody></table>");
        if (to) {
            var q1 = pts[0], q2 = pts[1];
            ud.push(h4("Aktiveringsenergien ud fra to målinger"));
            ud.push(p("Med to målinger bruges"));
            ud.push(ligning("ln(" + F.brok("<i>k</i><sub>2</sub>", "<i>k</i><sub>1</sub>") + ") = " + F.brok("<i>E</i><sub>a</sub>", "<i>R</i>") + " · (" + F.brok("1", "<i>T</i><sub>1</sub>") + " " + M + " " + F.brok("1", "<i>T</i><sub>2</sub>") + ")"));
            ud.push(p("Ligningen løses for <i>E</i><sub>a</sub>, og tallene sættes ind."));
            ud.push(ligning("<i>E</i><sub>a</sub> = " + F.brok("<i>R</i> · ln(<i>k</i><sub>2</sub> / <i>k</i><sub>1</sub>)", "1/<i>T</i><sub>1</sub> " + M + " 1/<i>T</i><sub>2</sub>") + " = " +
                F.brok("8,314 " + F.enh.JmolK + " · ln(" + q2.yT + " / " + q1.yT + ")", "1/(" + F.som(q1.T) + " K) " + M + " 1/(" + F.som(q2.T) + " K)") + " = " + F.bc(Ea, n + 1, 1e7) + " J/mol"));
        } else {
            ud.push(h4("Graf og regression"));
            ud.push(p("Lineær regression giver modellen"));
            ud.push(ligning("ln(<i>k</i> / " + kUh + ") = " + aT + " K · " + F.brok("1", "<i>T</i>") + (rg.b < 0 ? " " + M + " " + F.bc(-rg.b, n + 1, 1e7) : " + " + bT)));
            var mm = moenster(rg.res);
            ud.push(p(mm.bue ? "Punkterne ligger i en bue omkring linjen, og residualerne danner et mønster (<i>r</i>" + sup("2") + " = " + F.dec(rg.r2, 4) + "). Målingerne følger ikke helt Arrhenius-ligningen." :
                "Punkterne ligger tæt på linjen og tilfældigt omkring den, og <i>r</i>" + sup("2") + " = " + F.dec(rg.r2, 4) + ". Målingerne følger Arrhenius-ligningen. Grafen og residualplottet står under Facit."));
            ud.push(h4("Aktiveringsenergien"));
            ud.push(ligning("<i>E</i><sub>a</sub> = " + M + "<i>a</i> · <i>R</i> = " + M + F.par(aT) + " K · 8,314 " + F.enh.JmolK + " = " + F.bc(Ea, n + 1, 1e7) + " J/mol"));
        }
        ud.push(h4("Konklusion"));
        ud.push(p("Aktiveringsenergien er <i>E</i><sub>a</sub> = " + F.bc(Ea / 1000, n) + " kJ/mol." +
            (to ? "" : " Skæringen giver frekvensfaktoren: <i>A</i> = e" + sup(bT) + " " + kUh + " = " + F.bc(Aft, n) + " " + kUh + ".")));
        if (to) {
            ud.push(p("Frekvensfaktoren findes ved at sætte den ene måling ind i Arrhenius-ligningen."));
            ud.push(ligning("ln <i>A</i> = ln <i>k</i><sub>1</sub> + " + F.brok("<i>E</i><sub>a</sub>", "<i>R</i> · <i>T</i><sub>1</sub>") + " = ln(" + q1.yT + ") + " + F.brok(F.bc(Ea, n + 1, 1e7) + " J/mol", "8,314 " + F.enh.JmolK + " · " + F.som(q1.T) + " K") + " = " + F.bc(lnA, n + 1, 1e7)));
            ud.push(ligning("<i>A</i> = e" + sup(F.bc(lnA, n + 1, 1e7)) + " " + kUh + " = " + F.bc(Aft, n) + " " + kUh));
        }
        if (kny !== null) {
            ud.push(h4("Hastighedskonstanten ved " + F.som(Tny) + (C ? " °C" : " K")));
            if (C) ud.push(ligning("<i>T</i> = (273 + " + F.som(Tny) + ") K = " + F.som(TnyK) + " K"));
            var lnk = rg.a / TnyK + rg.b;
            ud.push(ligning("ln(<i>k</i> / " + kUh + ") = " + aT + " K · " + F.brok("1", F.som(TnyK) + " K") + (rg.b < 0 ? " " + M + " " + F.bc(-rg.b, n + 1, 1e7) : " + " + bT) + " = " + F.bc(lnk, n + 1, 1e7)));
            ud.push(ligning("<i>k</i> = e" + sup(F.bc(lnk, n + 1, 1e7)) + " " + kUh + " = " + F.bc(kny, n) + " " + kUh));
        }
        visFejl("#ar-fejl", fejl);
        visBesvarelse("#ar-besvarelse", ud.join(""));
    }

    /* ----- Fælles visning ---------------------------------------------------------------- */

    function cifre(id) {
        var n = Math.round(F.tal(F.$(id, rod).value) || 3);
        return Math.max(2, Math.min(7, n));
    }
    function visFejl(id, fejl) {
        var b = F.$(id, rod);
        b.innerHTML = fejl.map(function (f) { return "<li>" + f + "</li>"; }).join("");
        b.hidden = !fejl.length;
    }
    function visBesvarelse(id, html) {
        var b = F.$(id, rod);
        if (b.dataset.html !== html) { b.innerHTML = html; b.dataset.html = html; F.trin(b); }
        b.closest(".ramme").hidden = !html;
    }

    function alt() { beregnOrden(); beregnArrhenius(); gem(); }

    function gem() {
        var data = {};
        F.$$("input, select, textarea", rod).forEach(function (el) { if (el.id) data[el.id] = el.value; });
        var aaben = F.$(".underfane[aria-selected=true]", rod);
        data._fane = aaben ? aaben.dataset.fane : "orden";
        F.husk("kinetik", data);
    }

    function visFane(navn) {
        F.$$(".underfane", rod).forEach(function (k) { k.setAttribute("aria-selected", k.dataset.fane === navn ? "true" : "false"); });
        F.$$(".underpanel", rod).forEach(function (pn) { pn.hidden = pn.dataset.fane !== navn; });
    }

    function start() {
        rod = document.getElementById("kinetik");
        if (!rod) return;
        var data = F.husk("kinetik") || {};
        F.$$("input, select, textarea", rod).forEach(function (el) {
            if (el.id && data[el.id] !== undefined) el.value = data[el.id];
            el.addEventListener("input", alt);
            el.addEventListener("change", alt);
        });
        F.$$(".underfane", rod).forEach(function (k) { k.addEventListener("click", function () { visFane(k.dataset.fane); gem(); }); });
        visFane(data._fane === "arrhenius" ? "arrhenius" : "orden");
        F.$$("[data-kopier]", rod).forEach(function (k) { k.addEventListener("click", function () { F.kopier(F.$(k.dataset.kopier, rod), k); }); });
        F.$$(".kin-ryd", rod).forEach(function (k) {
            k.addEventListener("click", function () {
                F.$$("input, textarea", k.closest(".underpanel")).forEach(function (el) { if (!/cifre|enhed|stof/.test(el.id)) el.value = ""; });
                alt();
            });
        });
        alt();
    }

    window.FACIT_KINETIK = { regression: regression, moenster: moenster };
    document.addEventListener("DOMContentLoaded", start);
})();
