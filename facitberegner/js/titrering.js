/* =====================================================================
   titrering.js - fanen Titrering under Syre og base

   En monohydron syre eller base i kolben titreres med en stærk base
   eller syre fra buretten. Besvarelsen følger Kemibogen B6.8: stofmængden
   fra start, ækvivalenspunktet, og pH i de fire områder (kun syren,
   puffersystem, ækvivalenspunktet, overskud), skemaet med Før, Ændring
   og Efter i mmol, det samlede volumen og valg af indikator.
   Kurven tegnes med ladningsbalancen, så den også er rigtig dér, hvor
   bogens formler er tilnærmelser.
   ===================================================================== */
(function () {
    "use strict";

    var F = window.FACIT;
    var M = F.MINUS;
    var KW = 1e-14;
    var H3O = "H<sub>3</sub>O<sup>+</sup>", OHion = "OH<sup>" + M + "</sup>", H2O = "H<sub>2</sub>O";
    var INDIKATORER = [
        { navn: "methylorange", fra: 3.1, til: 4.4, farve: "rød til gul" },
        { navn: "methylrødt", fra: 4.4, til: 6.2, farve: "rød til gul" },
        { navn: "bromthymolblåt", fra: 6.0, til: 7.6, farve: "gul til blå" },
        { navn: "phenolphthalein", fra: 8.2, til: 10.0, farve: "farveløs til lyserød" }
    ];

    function SB() { return window.FACIT_SB; }
    function ligning(h) { return '<p class="ligning">' + h + "</p>"; }
    function h4(t) { return "<h4>" + t + "</h4>"; }
    function p(t) { return "<p>" + t + "</p>"; }

    /* ----- pH med ladningsbalancen (til kurven) ----------------------------------- */

    function phPraecis(type, c0, V0, cB, V, Ks) {
        var Vt = V0 + V, C = c0 * V0 / Vt, T = cB * V / Vt;   // kolbens stof og titrantens ion
        function g(lh) {
            var h = Math.pow(10, lh), oh = KW / h;
            if (type === "svag-syre") return T + h - oh - C * Ks / (Ks + h);
            if (type === "staerk-syre") return T + h - oh - C;
            if (type === "svag-base") return h + C * h / (h + Ks) - oh - T;
            return h + C - oh - T;                               // stærk base
        }
        var lo = -15, hi = 1;
        for (var k = 0; k < 100; k++) { var mid = (lo + hi) / 2; if (g(mid) > 0) hi = mid; else lo = mid; }
        return -(lo + hi) / 2;
    }

    /* ----- Læsning ------------------------------------------------------------------ */

    function laesTal(rod, id) {
        var el = F.$("#" + id, rod), x = F.tal(el.value);
        return { v: x === null || isNaN(x) ? null : x, fejl: x !== null && isNaN(x), t: x === null || isNaN(x) ? "" : SB().somSkrevet(el.value, x) };
    }

    function laesVoluminer(tekst) {
        var dele = (tekst || "").split(/[;\s]+/).map(function (s) { return s.trim(); }).filter(Boolean);
        var ud = [];
        dele.forEach(function (d) { var x = F.tal(d); if (x !== null && !isNaN(x) && x >= 0) ud.push({ v: x, t: SB().somSkrevet(d, x) }); });
        return ud;
    }

    function mL(x) { return x === 0 ? "0" : F.bc(x, 3, 1e5); }

    /* pH = 14,00 - pOH med den pOH, der står i besvarelsen */
    function phFraPOH(pOH, n) { return 14 - Number(pOH.toFixed(Math.max(1, n - 1))); }

    /* ----- Beregningen ----------------------------------------------------------------- */

    function beregn(rod) {
        var fejl = [];
        var type = F.$("#ti-type", rod).value;
        var syreIKolben = type === "svag-syre" || type === "staerk-syre";
        var svag = type === "svag-syre" || type === "svag-base";
        var V0 = laesTal(rod, "ti-V0"), c0 = laesTal(rod, "ti-c0"), cB = laesTal(rod, "ti-cB"), pK = laesTal(rod, "ti-pKs"), Veq = laesTal(rod, "ti-Veq");
        [V0, c0, cB, pK, Veq].forEach(function (x) { if (x.fejl) fejl.push("Et af felterne er ikke et tal."); });
        var n = SB().cifre("#ti-cifre");
        var navn = F.$("#ti-navn", rod).value.trim();
        var resRamme = F.$("#ti-resultatboks", rod);

        F.$("#ti-pk-felt", rod).hidden = !svag;
        F.$("#ti-pk-navn", rod).innerHTML = type === "svag-base" ? "p<i>K</i><sub>s</sub> for basens korresponderende syre" : "p<i>K</i><sub>s</sub> for syren";

        var mangler = !V0.v || !cB.v || (!c0.v && !Veq.v) || (svag && pK.v === null);
        if (V0.v !== null && V0.v <= 0 || cB.v !== null && cB.v <= 0 || c0.v !== null && c0.v <= 0) fejl.push("Volumen og koncentrationer skal være større end 0.");
        if (mangler || fejl.length) {
            SB().visFejl("#ti-fejl", fejl);
            resRamme.hidden = true;
            SB().visBesvarelse("#ti-besvarelse", "");
            return;
        }

        var cUkendt = !c0.v;
        var c0v = cUkendt ? cB.v * Veq.v / V0.v : c0.v;
        var c0t = cUkendt ? F.bc(c0v, n) : c0.t;
        var n0 = c0v * V0.v / 1000;                 // mol
        var VeqV = n0 / cB.v * 1000;                // mL
        var Ks = svag ? Math.pow(10, -pK.v) : null;

        var punkter = laesVoluminer(F.$("#ti-V", rod).value);
        var standard = !punkter.length;
        if (standard) {
            punkter = [0, VeqV / 2, VeqV, VeqV * 1.2].map(function (x) { return { v: x, t: mL(x) }; });
        }

        var ud = [], rk = [];
        var stof = navn || (syreIKolben ? "syren" : "basen");
        var stofUbest = navn || (syreIKolben ? "syre" : "base");
        var titrant = syreIKolben ? "hydroxid" : "oxonium";
        var titrantFormel = syreIKolben ? OHion : H3O;

        // reaktionen
        ud.push(h4("Reaktionen i kolben"));
        var rx = {
            "svag-syre": "S(aq) + " + OHion + "(aq) → B(aq) + " + H2O + "(l)",
            "staerk-syre": H3O + "(aq) + " + OHion + "(aq) → 2 " + H2O + "(l)",
            "svag-base": "B(aq) + " + H3O + "(aq) → S(aq) + " + H2O + "(l)",
            "staerk-base": OHion + "(aq) + " + H3O + "(aq) → 2 " + H2O + "(l)"
        }[type];
        ud.push('<p class="reaktion">' + rx + "</p>");
        ud.push(p((syreIKolben ? "Hydroxid" : "Oxonium") + " fra buretten er " + (syreIKolben ? "en stærk base" : "en stærk syre") + ", så reaktionen forløber fuldstændig." +
            (svag && navn ? " I skemaet står " + navn + " som " + (syreIKolben ? "S og dens korresponderende base som B." : "B og dens korresponderende syre som S.") : "")));

        // koncentrationen i kolben, hvis den er ukendt
        if (cUkendt) {
            ud.push(h4("Koncentrationen i kolben"));
            ud.push(p("Ved ækvivalenspunktet er der tilsat " + Veq.t + " mL " + titrant + ". Stofmængden er"));
            ud.push(ligning("<i>n</i>(" + titrantFormel + ") = <i>c</i> · <i>V</i> = " + cB.t + " " + F.brok("mol", "L") + " · " + F.bc(Veq.v / 1000, Math.max(n, 3), 1e5) + " L = " + F.bc(n0, n) + " mol"));
            ud.push(p("Stofferne reagerer 1 : 1, så der var lige så meget " + stofUbest + " i kolben fra start."));
            ud.push(ligning("<i>c</i> = " + F.brok("<i>n</i>", "<i>V</i>") + " = " + F.brok(F.bc(n0, n) + " mol", F.bc(V0.v / 1000, Math.max(n, 3), 1e5) + " L") + " = " + c0t + " M"));
        } else {
            ud.push(h4("Stofmængden fra start"));
            ud.push(ligning("<i>n</i> = <i>c</i> · <i>V</i> = " + c0.t + " " + F.brok("mol", "L") + " · " + F.bc(V0.v / 1000, Math.max(n, 3), 1e5) + " L = " + F.bc(n0, n) + " mol = " + F.bc(n0 * 1000, n) + " mmol"));
            ud.push(h4("Ækvivalenspunktet"));
            ud.push(p("Ækvivalenspunktet nås, når der er tilsat " + F.bc(n0 * 1000, n) + " mmol " + titrant + "."));
            ud.push(ligning("<i>V</i> = " + F.brok("<i>n</i>", "<i>c</i>") + " = " + F.brok(F.bc(n0, n) + " mol", cB.t + " " + F.brok("mol", "L")) + " = " + F.bc(VeqV / 1000, n) + " L = " + mL(VeqV) + " mL"));
        }
        rk.push("<tr><th>Ækvivalensvolumen</th><td class=\"res\">" + mL(VeqV) + " mL</td><td>" + (cUkendt ? "Oplyst" : "<i>V</i> = <i>n</i> / <i>c</i>") + "</td></tr>");
        if (cUkendt) rk.push("<tr><th>Koncentration i kolben</th><td class=\"res\">" + c0t + " M</td><td><i>c</i> = <i>n</i> / <i>V</i></td></tr>");
        if (svag) rk.push("<tr><th>Halvækvivalenspunktet</th><td class=\"res\">" + mL(VeqV / 2) + " mL</td><td>pH = p<i>K</i><sub>s</sub> = " + pK.t + "</td></tr>");

        var phAekv = null;
        punkter.forEach(function (pt) {
            var res = punkt(type, pt, { V0: V0, c0v: c0v, c0t: c0t, cB: cB, n0: n0, VeqV: VeqV, Ks: Ks, pK: pK, n: n, stof: stof, stofUbest: stofUbest, svag: svag, syreIKolben: syreIKolben });
            ud.push(res.html);
            rk.push("<tr><th>pH efter " + pt.t + " mL</th><td class=\"res\">" + SB().logTekst(res.pH, n) + "</td><td>" + res.omraade + "</td></tr>");
            if (res.aekv) phAekv = res.pH;
        });
        if (phAekv === null) phAekv = punkt(type, { v: VeqV, t: mL(VeqV) }, { V0: V0, c0v: c0v, c0t: c0t, cB: cB, n0: n0, VeqV: VeqV, Ks: Ks, pK: pK, n: n, stof: stof, stofUbest: stofUbest, svag: svag, syreIKolben: syreIKolben }).pH;

        // indikator
        var ind = INDIKATORER.filter(function (i) { return phAekv >= i.fra && phAekv <= i.til; })[0] ||
            INDIKATORER.reduce(function (a, i) { var d = Math.min(Math.abs(phAekv - i.fra), Math.abs(phAekv - i.til)); return !a || d < a.d ? { i: i, d: d } : a; }, null).i;
        ud.push(h4("Valg af indikator"));
        ud.push(p("pH i ækvivalenspunktet er " + SB().logTekst(phAekv, n) + ". Omslagsområdet for " + ind.navn + " er " + F.dec(ind.fra, 1) + " til " + F.dec(ind.til, 1) +
            " og ligger i springet, så " + ind.navn + " passer. Den skifter fra " + ind.farve + "."));
        rk.push("<tr><th>Indikator</th><td class=\"res\">" + ind.navn + "</td><td>Omslagsområde " + F.dec(ind.fra, 1) + " til " + F.dec(ind.til, 1) + "</td></tr>");

        F.$("#ti-resultater", rod).innerHTML = rk.join("");
        F.$("#ti-kurve", rod).innerHTML = '<div class="graf-navn">Titrerkurve</div>' + kurve(type, c0v, V0.v, cB.v, Ks, VeqV, punkter, ind, n);
        resRamme.hidden = false;
        SB().visFejl("#ti-fejl", fejl);
        SB().visBesvarelse("#ti-besvarelse", ud.join(""));
    }

    /* pH i ét punkt med bogens fremgangsmåde */
    function punkt(type, pt, o) {
        var n = o.n, b = [];
        var V = pt.v, Vt = o.V0.v + V;
        var nT = o.cB.v * V / 1000;                       // tilsat titrant i mol
        var nTm = nT * 1000, n0m = o.n0 * 1000;
        var titel, omraade, pH, aekv = false;
        var lt = SB().logTekst;
        var tilsat = o.syreIKolben ? OHion : H3O;
        var VtTekst = mL(o.V0.v) + " mL + " + pt.t + " mL = " + mL(Vt) + " mL";
        var rel = Math.abs(nT - o.n0) / o.n0;

        if (V === 0) {
            titel = "Før titreringen";
            omraade = o.svag ? (o.syreIKolben ? "Kun den svage syre" : "Kun den svage base") : (o.syreIKolben ? "Kun den stærke syre" : "Kun den stærke base");
            if (!o.svag) {
                if (o.syreIKolben) { pH = -Math.log10(o.c0v); b.push(p("Kolben indeholder kun " + o.c0t + " M " + o.stofUbest + ". Den er en stærk syre.")); b.push(ligning("pH = " + M + "log <i>c</i><sub>s</sub> = " + M + "log(" + o.c0t + ") = " + lt(pH, n))); }
                else { var pOH0 = -Math.log10(o.c0v); pH = phFraPOH(pOH0, n); b.push(p("Kolben indeholder kun " + o.c0t + " M " + o.stofUbest + ". Den er en stærk base.")); b.push(ligning("pOH = " + M + "log <i>c</i><sub>b</sub> = " + M + "log(" + o.c0t + ") = " + lt(pOH0, n) + " &emsp;&emsp; pH = 14,00 " + M + " " + lt(pOH0, n) + " = " + lt(pH, n))); }
            } else {
                var K = o.syreIKolben ? o.Ks : KW / o.Ks;
                var x = (-K + Math.sqrt(K * K + 4 * K * o.c0v)) / 2, alfa = x / o.c0v;
                var pKbrug = o.syreIKolben ? o.pK.v : 14 - o.pK.v;
                var pKtekst = o.syreIKolben ? o.pK.t : lt(pKbrug, n + 1);
                if (!o.syreIKolben) b.push(ligning("p<i>K</i><sub>b</sub> = 14,00 " + M + " p<i>K</i><sub>s</sub> = 14,00 " + M + " " + o.pK.t + " = " + pKtekst));
                if (alfa < 0.05) {
                    var g = 0.5 * (pKbrug - Math.log10(o.c0v));
                    b.push(p("Kolben indeholder kun " + o.c0t + " M " + o.stofUbest + ". Den er " + (o.syreIKolben ? "en svag syre" : "en svag base") + ", og omdannelsesgraden er under 5 %, så genvejen kan bruges."));
                    if (o.syreIKolben) { pH = g; b.push(ligning("pH = ½ · (p<i>K</i><sub>s</sub> " + M + " log <i>c</i><sub>s</sub>) = ½ · (" + pKtekst + " " + M + " log(" + o.c0t + ")) = " + lt(pH, n))); }
                    else { pH = phFraPOH(g, n); b.push(ligning("pOH = ½ · (p<i>K</i><sub>b</sub> " + M + " log <i>c</i><sub>b</sub>) = ½ · (" + pKtekst + " " + M + " log(" + o.c0t + ")) = " + lt(g, n) + " &emsp;&emsp; pH = 14,00 " + M + " " + lt(g, n) + " = " + lt(pH, n))); }
                } else {
                    b.push(p("Kolben indeholder kun " + o.c0t + " M " + o.stofUbest + ". Omdannelsesgraden er " + F.bc(alfa * 100, 2) + " %, så genvejen passer ikke. Ligningen " +
                        (o.syreIKolben ? "<i>K</i><sub>s</sub>" : "<i>K</i><sub>b</sub>") + " = <i>x</i><sup>2</sup> / (" + o.c0t + " M " + M + " <i>x</i>) løses med et CAS-værktøj, og den positive løsning er <i>x</i> = " + F.bc(x, n) + " M."));
                    if (o.syreIKolben) { pH = -Math.log10(x); b.push(ligning("pH = " + M + "log(" + F.bc(x, n) + ") = " + lt(pH, n))); }
                    else { var pOHx = -Math.log10(x); pH = phFraPOH(pOHx, n); b.push(ligning("pOH = " + M + "log(" + F.bc(x, n) + ") = " + lt(pOHx, n) + " &emsp;&emsp; pH = 14,00 " + M + " " + lt(pOHx, n) + " = " + lt(pH, n))); }
                }
            }
        } else if (rel < 1e-3) {
            aekv = true;
            titel = "I ækvivalenspunktet, efter " + pt.t + " mL";
            omraade = "Ækvivalenspunktet";
            if (!o.svag) {
                pH = 7;
                b.push(p("Al " + (o.syreIKolben ? "syren" : "basen") + " har reageret, og kolben indeholder kun vand og ioner, der ikke påvirker pH. Derfor er pH = 7,00 ved 25 °C."));
            } else {
                var cny = o.n0 / (Vt / 1000);
                b.push(p("Al " + o.stof + " er lavet om til " + (o.syreIKolben ? "den korresponderende base" : "den korresponderende syre") + ". Kolben indeholder " + F.bc(n0m, n) + " mmol i et samlet volumen på " + VtTekst + "."));
                b.push(ligning("<i>c</i><sub>" + (o.syreIKolben ? "b" : "s") + "</sub> = " + F.brok("<i>n</i>", "<i>V</i>") + " = " + F.brok(F.bc(o.n0, n) + " mol", F.bc(Vt / 1000, Math.max(n, 3), 1e5) + " L") + " = " + F.bc(cny, n) + " M"));
                if (o.syreIKolben) {
                    var pKb = 14 - o.pK.v;
                    var Kb = Math.pow(10, -pKb), xb = (-Kb + Math.sqrt(Kb * Kb + 4 * Kb * cny)) / 2;
                    b.push(p("Basen er svag med p<i>K</i><sub>b</sub> = 14,00 " + M + " " + o.pK.t + " = " + lt(pKb, n + 1) + "."));
                    var gb = 0.5 * (pKb - Math.log10(cny));
                    if (xb / cny < 0.05) { pH = phFraPOH(gb, n); b.push(ligning("pOH = ½ · (p<i>K</i><sub>b</sub> " + M + " log <i>c</i><sub>b</sub>) = ½ · (" + lt(pKb, n + 1) + " " + M + " log(" + F.bc(cny, n) + ")) = " + lt(gb, n) + " &emsp;&emsp; pH = 14,00 " + M + " " + lt(gb, n) + " = " + lt(pH, n))); }
                    else { var pO = -Math.log10(xb); pH = phFraPOH(pO, n); b.push(ligning("pOH = " + M + "log(" + F.bc(xb, n) + ") = " + lt(pO, n) + " &emsp;&emsp; pH = 14,00 " + M + " " + lt(pO, n) + " = " + lt(pH, n))); }
                    b.push(p("pH i ækvivalenspunktet er over 7, fordi kolben nu indeholder en svag base."));
                } else {
                    var xs = (-o.Ks + Math.sqrt(o.Ks * o.Ks + 4 * o.Ks * cny)) / 2;
                    var gs = 0.5 * (o.pK.v - Math.log10(cny));
                    if (xs / cny < 0.05) { pH = gs; b.push(ligning("pH = ½ · (p<i>K</i><sub>s</sub> " + M + " log <i>c</i><sub>s</sub>) = ½ · (" + o.pK.t + " " + M + " log(" + F.bc(cny, n) + ")) = " + lt(pH, n))); }
                    else { pH = -Math.log10(xs); b.push(ligning("pH = " + M + "log(" + F.bc(xs, n) + ") = " + lt(pH, n))); }
                    b.push(p("pH i ækvivalenspunktet er under 7, fordi kolben nu indeholder en svag syre."));
                }
            }
        } else if (nT < o.n0) {
            var halv = Math.abs(nT - o.n0 / 2) / o.n0 < 1e-3;
            titel = (halv ? "Halvækvivalenspunktet, efter " : "Undervejs, efter ") + pt.t + " mL";
            omraade = o.svag ? (halv ? "Halvækvivalens, puffersystem" : "Puffersystem") : (o.syreIKolben ? "Overskud af syre" : "Overskud af base");
            b.push(p("Der er tilsat"));
            b.push(ligning("<i>n</i>(" + tilsat + ") = " + o.cB.t + " " + F.brok("mol", "L") + " · " + F.bc(V / 1000, Math.max(n, 3), 1e5) + " L = " + F.bc(nT, n) + " mol = " + F.bc(nTm, n) + " mmol"));
            var rest = n0m - nTm;
            if (o.svag) {
                var forste = o.syreIKolben ? "S" : "B", dannet = o.syreIKolben ? "B" : "S";
                b.push(skema([forste, tilsat, dannet, H2O], [F.bc(n0m, n) + " mmol", F.bc(nTm, n) + " mmol", "0 mmol"],
                    [M + F.bc(nTm, n) + " mmol", M + F.bc(nTm, n) + " mmol", "+" + F.bc(nTm, n) + " mmol"], [F.bc(rest, n) + " mmol", "0 mmol", F.bc(nTm, n) + " mmol"]));
                b.push(p("Nu er der både syre og base i kolben. Det er et puffersystem."));
                var ns = o.syreIKolben ? rest : nTm, nb = o.syreIKolben ? nTm : rest;
                pH = o.pK.v + Math.log10(nb / ns);
                b.push(ligning("pH = p<i>K</i><sub>s</sub> + log(" + F.brok("<i>n</i><sub>b</sub>", "<i>n</i><sub>s</sub>") + ") = " + o.pK.t + " + log(" + F.brok(F.bc(nb, n) + " mmol", F.bc(ns, n) + " mmol") + ") = " + lt(pH, n)));
                if (halv) b.push(p("I halvækvivalenspunktet er <i>n</i><sub>b</sub> = <i>n</i><sub>s</sub>, så pH = p<i>K</i><sub>s</sub>."));
            } else {
                var cRest = rest / Vt;   // mmol/mL = M
                b.push(p("Der er " + F.bc(rest, n) + " mmol " + (o.syreIKolben ? "oxonium" : "hydroxid") + " tilbage i et samlet volumen på " + VtTekst + "."));
                if (o.syreIKolben) {
                    pH = -Math.log10(cRest);
                    b.push(ligning("[" + H3O + "] = " + F.brok("<i>n</i>", "<i>V</i>") + " = " + F.brok(F.bc(rest / 1000, n) + " mol", F.bc(Vt / 1000, Math.max(n, 3), 1e5) + " L") + " = " + F.bc(cRest, n) + " M &emsp;&emsp; pH = " + M + "log(" + F.bc(cRest, n) + ") = " + lt(pH, n)));
                } else {
                    var pOHr = -Math.log10(cRest); pH = phFraPOH(pOHr, n);
                    b.push(ligning("[" + OHion + "] = " + F.brok("<i>n</i>", "<i>V</i>") + " = " + F.brok(F.bc(rest / 1000, n) + " mol", F.bc(Vt / 1000, Math.max(n, 3), 1e5) + " L") + " = " + F.bc(cRest, n) + " M"));
                    b.push(ligning("pOH = " + M + "log(" + F.bc(cRest, n) + ") = " + lt(pOHr, n) + " &emsp;&emsp; pH = 14,00 " + M + " " + lt(pOHr, n) + " = " + lt(pH, n)));
                }
            }
        } else {
            titel = "Efter ækvivalenspunktet, efter " + pt.t + " mL";
            omraade = o.syreIKolben ? "Overskud af hydroxid" : "Overskud af oxonium";
            var over = nT - o.n0, cO = over / (Vt / 1000);
            b.push(p("Der er tilsat " + mL(V - o.VeqV) + " mL mere, end " + (o.syreIKolben ? "syren" : "basen") + " kunne bruge. Overskuddet er"));
            b.push(ligning("<i>n</i>(" + tilsat + ") = " + o.cB.t + " " + F.brok("mol", "L") + " · " + F.bc((V - o.VeqV) / 1000, Math.max(n, 3), 1e5) + " L = " + F.bc(over, n) + " mol"));
            b.push(p("Det samlede volumen er " + VtTekst + "."));
            b.push(ligning("[" + tilsat + "] = " + F.brok("<i>n</i>", "<i>V</i>") + " = " + F.brok(F.bc(over, n) + " mol", F.bc(Vt / 1000, Math.max(n, 3), 1e5) + " L") + " = " + F.bc(cO, n) + " M"));
            if (o.syreIKolben) { var pOHe = -Math.log10(cO); pH = phFraPOH(pOHe, n); b.push(ligning("pOH = " + M + "log(" + F.bc(cO, n) + ") = " + lt(pOHe, n) + " &emsp;&emsp; pH = 14,00 " + M + " " + lt(pOHe, n) + " = " + lt(pH, n))); }
            else { pH = -Math.log10(cO); b.push(ligning("pH = " + M + "log(" + F.bc(cO, n) + ") = " + lt(pH, n))); }
            if (o.svag) b.push(p((o.syreIKolben ? "Den korresponderende base" : "Den korresponderende syre") + " er der stadig, men den påvirker næsten ikke pH ved siden af overskuddet."));
        }
        return { html: h4(titel) + b.join(""), pH: pH, omraade: omraade, aekv: aekv };
    }

    function skema(kol, foer, aendring, efter) {
        function raekke(navn, c) { return "<tr><td>" + navn + "</td><td>" + c[0] + "</td><td></td><td>" + c[1] + "</td><td></td><td>" + c[2] + "</td><td></td><td></td></tr>"; }
        return '<table class="lille-tabel sael"><thead><tr><th></th><th>' + kol[0] + "</th><th>+</th><th>" + kol[1] + "</th><th>→</th><th>" + kol[2] + "</th><th>+</th><th>" + kol[3] + "</th></tr></thead><tbody>" +
            raekke("Før", foer) + raekke("Ændring", aendring) + raekke("Efter", efter) + "</tbody></table>";
    }

    /* ----- Titrerkurven ------------------------------------------------------------------ */

    function kurve(type, c0, V0, cB, Ks, Veq, punkter, ind, n) {
        var Bw = 560, H = 312, ml = 40, mr = 14, mt = 26, mb = 40;
        var Vmax = Math.max(Veq * 1.6, Math.max.apply(null, punkter.map(function (q) { return q.v; })) * 1.1);
        function X(v) { return ml + v / Vmax * (Bw - ml - mr); }
        function Y(ph) { return mt + (14 - ph) / 14 * (H - mt - mb); }
        var s = '<svg viewBox="0 0 ' + Bw + " " + H + '" class="graf titrerkurve" role="img" aria-label="Titrerkurve">';
        // indikatorens omslagsområde
        s += '<rect class="omslag" x="' + ml + '" width="' + (Bw - ml - mr) + '" y="' + Y(ind.til) + '" height="' + (Y(ind.fra) - Y(ind.til)) + '"/>';
        s += '<text class="omslag-tekst" x="' + (Bw - mr - 4) + '" y="' + (Y(ind.til) + 12) + '" text-anchor="end">' + ind.navn + "</text>";
        for (var ph = 0; ph <= 14; ph += 2) {
            s += '<line class="net" x1="' + ml + '" x2="' + (Bw - mr) + '" y1="' + Y(ph) + '" y2="' + Y(ph) + '"/>';
            s += '<text x="' + (ml - 6) + '" y="' + (Y(ph) + 4) + '" text-anchor="end">' + ph + "</text>";
        }
        var skridt = [1, 2, 2.5, 5, 10, 20, 25, 50, 100].filter(function (k) { return Vmax / k <= 8; })[0] || 100;
        for (var v = 0; v <= Vmax + 1e-9; v += skridt) {
            s += '<line class="net" y1="' + mt + '" y2="' + (H - mb) + '" x1="' + X(v) + '" x2="' + X(v) + '"/>';
            s += '<text x="' + X(v) + '" y="' + (H - mb + 15) + '" text-anchor="middle">' + F.som(v) + "</text>";
        }
        s += '<text x="' + ((ml + Bw - mr) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">Tilsat volumen i mL</text>';
        s += '<text x="' + (ml - 6) + '" y="12" text-anchor="end">pH</text>';
        // ækvivalens og halvækvivalens
        s += '<line class="maerke" x1="' + X(Veq) + '" x2="' + X(Veq) + '" y1="' + mt + '" y2="' + (H - mb) + '"/>';
        if (Ks) s += '<line class="maerke svag" x1="' + X(Veq / 2) + '" x2="' + X(Veq / 2) + '" y1="' + mt + '" y2="' + (H - mb) + '"/>';
        var pts = [];
        for (var i = 0; i <= 400; i++) {
            var vv = Vmax * i / 400;
            pts.push(X(vv).toFixed(1) + "," + Y(phPraecis(type, c0, V0, cB, vv, Ks)).toFixed(1));
        }
        s += '<polyline class="kurve" points="' + pts.join(" ") + '"/>';
        punkter.forEach(function (q) {
            var ph = phPraecis(type, c0, V0, cB, q.v, Ks);
            s += '<circle class="punkt" cx="' + X(q.v) + '" cy="' + Y(ph) + '" r="4"/>';
        });
        return s + "</svg>";
    }

    window.FACIT_TITRERING = { beregn: beregn, phPraecis: phPraecis };
})();
