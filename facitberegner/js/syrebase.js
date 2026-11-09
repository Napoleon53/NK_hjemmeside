/* =====================================================================
   syrebase.js - pH-beregninger for én monohydron syre eller base og
   for et puffersystem

   Regner som arket SyreBase i superskabelonen: de kendte størrelser
   skrives ind, og resten regnes ud. Kolonnen "Beregnet med" viser,
   hvilken formel tallet kommer fra, og "Hele besvarelsen" skriver
   beregningen op som eksemplerne i Kemibogen B6.5, B6.6, B6.7, A1.6 og
   A1.7: reaktionsskema, x, SÆL-skema, ligning, begge løsninger fra
   CAS-værktøjet, pH, omdannelsesgrad og genvejen.
   Kw = 1,0 · 10^-14 M^2 (25 °C).

   SB.svag(...) bruges også af fordeling.js til polyhydrone syrer.
   ===================================================================== */
(function () {
    "use strict";

    var F = window.FACIT;
    var KW = 1e-14;
    var M = F.MINUS;
    var rod;

    /* Navne i HTML */
    var N = {
        cs: "<i>c</i><sub>s</sub>", cb: "<i>c</i><sub>b</sub>",
        Ks: "<i>K</i><sub>s</sub>", Kb: "<i>K</i><sub>b</sub>", Kw: "<i>K</i><sub>w</sub>",
        pKs: "p<i>K</i><sub>s</sub>", pKb: "p<i>K</i><sub>b</sub>",
        pH: "pH", pOH: "pOH",
        H: "[H<sub>3</sub>O<sup>+</sup>]", OH: "[OH<sup>" + M + "</sup>]",
        S: "[S]", B: "[B]", ns: "<i>n</i><sub>s</sub>", nb: "<i>n</i><sub>b</sub>",
        xs: "<i>x</i><sub>s</sub>", xb: "<i>x</i><sub>b</sub>",
        a: "α"
    };
    var H3O = "H<sub>3</sub>O<sup>+</sup>", OHion = "OH<sup>" + M + "</sup>", H2O = "H<sub>2</sub>O";
    var KW_TEKST = "1,0 · 10<sup>" + M + "14</sup> M<sup>2</sup>";

    /* ----- Læsning ------------------------------------------------------------ */

    /* Et tal, som eleven skrev det: "0,050" bliver stående, "1.8e-5" bliver 1,8 · 10^-5. */
    function somSkrevet(raa, x, n) {
        var t = (raa || "").trim();
        if (/^[-+−]?\d*[.,]?\d+$/.test(t)) return t.replace(".", ",").replace(/^[-−]/, M).replace(/^\+/, "");
        var cif = (t.replace(/^[-+−]/, "").split(/[eE·∙*x×]/)[0].replace(/[.,]/, "").replace(/^0+/, "").length) || n || 3;
        return F.bc(x, Math.max(2, Math.min(7, cif)));
    }

    function laes(prefiks, navne) {
        var v = {}, t = {}, fejl = [];
        navne.forEach(function (k) {
            var el = F.$("#" + prefiks + "-" + k, rod);
            if (!el) return;
            var x = F.tal(el.value);
            if (x === null) return;
            if (isNaN(x)) { fejl.push((N[k] || k) + " er ikke et tal."); return; }
            v[k] = x;
            t[k] = somSkrevet(el.value, x);
        });
        return { v: v, t: t, fejl: fejl };
    }

    function positiv(v, k, fejl) {
        if (v[k] !== undefined && v[k] <= 0) { fejl.push(N[k] + " skal være større end 0."); delete v[k]; }
    }

    /* Find K ud fra det, der er givet */
    function konstanter(v, ud) {
        if (v.Ks !== undefined) ud.Ks = [v.Ks, "givet"];
        else if (v.pKs !== undefined) ud.Ks = [Math.pow(10, -v.pKs), N.Ks + " = 10<sup>" + M + N.pKs + "</sup> M"];
        else if (v.Kb !== undefined) ud.Ks = [KW / v.Kb, N.Ks + " = " + F.brok(N.Kw, N.Kb)];
        else if (v.pKb !== undefined) ud.Ks = [Math.pow(10, v.pKb - 14), N.Ks + " = 10<sup>" + M + N.pKs + "</sup> M"];
        if (v.Kb !== undefined) ud.Kb = [v.Kb, "givet"];
        else if (v.pKb !== undefined) ud.Kb = [Math.pow(10, -v.pKb), N.Kb + " = 10<sup>" + M + N.pKb + "</sup> M"];
        else if (ud.Ks) ud.Kb = [KW / ud.Ks[0], N.Kb + " = " + F.brok(N.Kw, N.Ks)];
        if (ud.Ks) ud.pKs = [-Math.log10(ud.Ks[0]), v.pKs !== undefined ? "givet" : v.pKb !== undefined ? N.pKs + " = 14,00 " + M + " " + N.pKb : N.pKs + " = " + M + "log " + N.Ks];
        if (ud.Kb) ud.pKb = [-Math.log10(ud.Kb[0]), v.pKb !== undefined ? "givet" : ud.pKs && v.Kb === undefined ? N.pKb + " = 14,00 " + M + " " + N.pKs : N.pKb + " = " + M + "log " + N.Kb];
    }

    function hOgOH(v, ud) {
        // fælles: [H3O+], pH, [OH-] og pOH ud fra det, der er fundet
        if (!ud.H && ud.OH) { ud.H = [KW / ud.OH[0], N.H + " = " + F.brok(N.Kw, N.OH)]; ud.H.fraOH = true; }
        if (!ud.OH && ud.H) {
            if (v.pH !== undefined) { ud.OH = [Math.pow(10, v.pH - 14), N.OH + " = 10<sup>" + M + "pOH</sup> M"]; ud.OH.fraPH = true; }
            else ud.OH = [KW / ud.H[0], N.OH + " = " + F.brok(N.Kw, N.H)];
        }
        if (ud.H) ud.pH = [-Math.log10(ud.H[0]), v.pH !== undefined ? "givet" : ud.H.fraPOH || ud.H.fraOH ? "pH = 14,00 " + M + " pOH" : "pH = " + M + "log" + N.H];
        if (ud.OH) ud.pOH = [-Math.log10(ud.OH[0]), v.pOH !== undefined ? "givet" : ud.OH.fraPH ? "pOH = 14,00 " + M + " pH" : "pOH = " + M + "log" + N.OH];
    }

    var ROD = "√";

    /* ----- Byggesten til besvarelsen ------------------------------------------- */

    function ligning(html) { return '<p class="ligning">' + html + "</p>"; }
    function h4(t) { return "<h4>" + t + "</h4>"; }
    function p(t) { return "<p>" + t + "</p>"; }
    function logTekst(x, n) { return F.dec(x, Math.max(1, n - 1)); }
    function medM(tal) { return tal + " M"; }
    function potensTekst(t) { return "10<sup>" + t + "</sup>"; }

    /* SÆL-skema: kolonner [reaktant, vand, produkt 1, produkt 2] */
    function saelSkema(kol, start, aendring, ligevaegt) {
        function raekke(navn, celler) {
            return "<tr><td>" + navn + "</td><td>" + celler[0] + "</td><td></td><td></td><td></td><td>" + celler[1] + "</td><td></td><td>" + celler[2] + "</td></tr>";
        }
        return '<table class="lille-tabel sael"><thead><tr><th></th><th>' + kol[0] + "</th><th>+</th><th>" + kol[1] + "</th><th>⇌</th><th>" + kol[2] + "</th><th>+</th><th>" + kol[3] + "</th></tr></thead><tbody>" +
            raekke("Start", start) + raekke("Ændring", aendring) + raekke("Ligevægt", ligevaegt) + "</tbody></table>";
    }

    function styrkeOrd(pKs) {
        if (pKs < 0) return "en stærk syre";
        if (pKs < 4) return "en middelstærk syre";
        if (pKs < 10) return "en svag syre";
        return "en meget svag syre";
    }

    /* Hele beregningen for en syre eller base, der ikke er stærk, ud fra
       c og K. o = { type: "syre"|"base", c, cTekst, K, pK, afled: [html],
       navn, S, B (formler i HTML), n, reaktion (valgfri), konklusion (valgfri) } */
    function svag(o) {
        var n = o.n, ud = [];
        var syre = o.type === "syre";
        var Ksym = syre ? N.Ks : N.Kb, csym = syre ? N.cs : N.cb;
        var ion = syre ? H3O : OHion, ionK = syre ? N.H : N.OH;
        var forste = syre ? o.S : o.B, andet = syre ? o.B : o.S;
        var stof = o.navn || (syre ? "syren" : "basen");

        ud.push(h4("Reaktionsskemaet"));
        ud.push('<p class="reaktion">' + (o.reaktion || (forste + "(aq) + " + H2O + "(l) ⇌ " + andet + "(aq) + " + ion + "(aq)")) + "</p>");
        if (o.navn && !o.reaktion) ud.push(p("I skemaet står " + o.navn + " som " + forste + " og " + (syre ? "dens korresponderende base som " : "dens korresponderende syre som ") + andet + "."));

        if (o.afled && o.afled.length) {
            ud.push(h4(syre ? "Syrestyrkekonstanten" : "Basestyrkekonstanten"));
            o.afled.forEach(function (l) { ud.push(ligning(l)); });
        }

        ud.push(h4("Hvad er <i>x</i>?"));
        ud.push(p("<i>x</i> angiver her den koncentration af " + stof + ", der har " + (syre ? "afgivet" : "optaget") + " en hydron, fra start og frem til ligevægt. " +
            "Der dannes lige så meget af den korresponderende " + (syre ? "base" : "syre") + " og lige så meget " + (syre ? "oxonium" : "hydroxid") + "."));

        ud.push(h4("Skemaet"));
        ud.push(saelSkema([forste, H2O, andet, ion],
            [medM(o.cTekst), "0 M", "0 M"],
            [M + "<i>x</i>", "+<i>x</i>", "+<i>x</i>"],
            [medM(o.cTekst) + " " + M + " <i>x</i>", "<i>x</i>", "<i>x</i>"]));

        var K = o.K, c = o.c;
        var x1 = (-K + Math.sqrt(K * K + 4 * K * c)) / 2;
        var x2 = (-K - Math.sqrt(K * K + 4 * K * c)) / 2;
        var Ktekst = F.bc(K, n);

        ud.push(h4("Ligningen"));
        ud.push(ligning(Ksym + " = " + F.brok("<i>x</i> · <i>x</i>", medM(o.cTekst) + " " + M + " <i>x</i>") + " = " + medM(Ktekst)));
        ud.push(p("CAS-værktøjet giver <i>x</i> = " + F.bc(x1, n) + " eller <i>x</i> = " + F.bc(x2, n) + "."));

        // løsningen i hånden, som i B6.5
        var d = K * K + 4 * K * c;
        ud.push('<details class="haand"><summary>Løsning i hånden</summary>' +
            p("I mellemregningerne er enheden M udeladt. Først ganges med nævneren på begge sider.") +
            ligning("<i>x</i><sup>2</sup> = " + Ktekst + " · (" + o.cTekst + " " + M + " <i>x</i>)") +
            p("Parentesen ganges ud, og alle led flyttes over på samme side.") +
            ligning("<i>x</i><sup>2</sup> + " + Ktekst + " · <i>x</i> " + M + " " + F.bc(K * c, n) + " = 0") +
            p("Det er en andengradsligning med <i>a</i> = 1, <i>b</i> = " + Ktekst + " og <i>c</i> = " + M + F.bc(K * c, n) + ". Diskriminanten er") +
            ligning("<i>d</i> = <i>b</i><sup>2</sup> " + M + " 4<i>ac</i> = (" + Ktekst + ")<sup>2</sup> + 4 · " + F.bc(K * c, n) + " = " + F.bc(d, n)) +
            p("Kun løsningen med plus foran kvadratroden er positiv.") +
            ligning("<i>x</i> = " + F.brok(M + "<i>b</i> + " + ROD + "<i>d</i>", "2<i>a</i>") + " = " + F.brok(M + Ktekst + " + " + ROD + "(" + F.bc(d, n) + ")", "2") + " = " + F.bc(x1, n)) +
            "</details>");

        ud.push(h4("Den rigtige løsning"));
        ud.push(p("En koncentration kan ikke være negativ, så den negative løsning forkastes. Altså er " + ionK + " = <i>x</i> = " + medM(F.bc(x1, n)) + "."));

        var pH;
        if (syre) {
            pH = -Math.log10(x1);
            ud.push(h4("pH"));
            ud.push(ligning("pH = " + M + "log" + N.H + " = " + M + "log(" + F.bc(x1, n) + ") = " + logTekst(pH, n)));
        } else {
            var pOH = -Math.log10(x1);
            pH = 14 - Number(pOH.toFixed(Math.max(1, n - 1)));
            ud.push(h4("Fra hydroxid til pH"));
            ud.push(ligning("pOH = " + M + "log" + N.OH + " = " + M + "log(" + F.bc(x1, n) + ") = " + logTekst(pOH, n)));
            ud.push(ligning("pH = 14,00 " + M + " pOH = 14,00 " + M + " " + logTekst(pOH, n) + " = " + logTekst(pH, n)));
        }

        var alfa = x1 / c;
        ud.push(h4("Omdannelsesgraden"));
        ud.push(ligning("α = " + F.brok("<i>x</i>", csym) + " = " + F.brok(medM(F.bc(x1, n)), medM(o.cTekst)) + " = " + F.bc(alfa, n)));
        ud.push(p("Det svarer til " + F.bc(alfa * 100, Math.min(n, 3)) + " %. " + (syre ? "Så stor en del af syren har afgivet en hydron." : "Så stor en del af basen har optaget en hydron.")));

        // genvejen
        var pK = o.pK !== undefined ? o.pK : -Math.log10(K);
        var pKtekst = o.pKtekst || F.dec(pK, n);
        var gen = 0.5 * (pK - Math.log10(c));
        var genPH = syre ? gen : 14 - gen;
        ud.push(h4("Genvejen"));
        if (syre) {
            ud.push(ligning("pH = ½ · (" + N.pKs + " " + M + " log " + N.cs + ") = ½ · (" + pKtekst + " " + M + " log(" + o.cTekst + ")) = " + logTekst(gen, n)));
        } else {
            ud.push(ligning("pOH = ½ · (" + N.pKb + " " + M + " log " + N.cb + ") = ½ · (" + pKtekst + " " + M + " log(" + o.cTekst + ")) = " + logTekst(gen, n)));
            ud.push(p("Det svarer til pH = 14,00 " + M + " " + logTekst(gen, n) + " = " + logTekst(14 - Number(gen.toFixed(Math.max(1, n - 1))), n) + "."));
        }
        var afv = Math.abs(genPH - pH);
        ud.push(p(alfa < 0.05 ? "Omdannelsesgraden er under 5 %, så genvejen kan bruges og giver næsten det samme." :
            alfa < 0.07 && afv <= 0.02 ? "Omdannelsesgraden er lidt over 5 %, men genvejen giver næsten det samme." :
            "Omdannelsesgraden er over 5 %, så genvejen passer dårligt her. Ligningen med <i>x</i> passer altid."));

        ud.push(h4("Konklusion"));
        ud.push(p(o.konklusion || (o.navn ? "pH i " + o.cTekst + " M " + o.navn + " er " + logTekst(pH, n) + "." : "Opløsningen har pH " + logTekst(pH, n) + ".")));
        return { html: ud.join(""), pH: pH, x: x1, alfa: alfa };
    }

    /* Afledning af K til besvarelsen */
    function afledK(type, v, t, n) {
        var l = [];
        if (type === "syre") {
            if (v.Ks !== undefined) return l;
            if (v.pKs !== undefined) { l.push(N.Ks + " = 10<sup>" + M + N.pKs + "</sup> M = 10<sup>" + M + t.pKs + "</sup> M = " + medM(F.bc(Math.pow(10, -v.pKs), n))); return l; }
            if (v.pKb !== undefined) {
                var pk = 14 - v.pKb;
                l.push(N.pKs + " = 14,00 " + M + " " + N.pKb + " = 14,00 " + M + " " + t.pKb + " = " + logTekst(pk, n));
                l.push(N.Ks + " = 10<sup>" + M + N.pKs + "</sup> M = 10<sup>" + M + logTekst(pk, n) + "</sup> M = " + medM(F.bc(Math.pow(10, -pk), n)));
                return l;
            }
            if (v.Kb !== undefined) l.push(N.Ks + " = " + F.brok(N.Kw, N.Kb) + " = " + F.brok(KW_TEKST, medM(t.Kb)) + " = " + medM(F.bc(KW / v.Kb, n)));
        } else {
            if (v.Kb !== undefined) return l;
            if (v.pKb !== undefined) { l.push(N.Kb + " = 10<sup>" + M + N.pKb + "</sup> M = 10<sup>" + M + t.pKb + "</sup> M = " + medM(F.bc(Math.pow(10, -v.pKb), n))); return l; }
            if (v.pKs !== undefined) {
                var pkb = 14 - v.pKs;
                l.push(N.pKb + " = 14,00 " + M + " " + N.pKs + " = 14,00 " + M + " " + t.pKs + " = " + logTekst(pkb, n));
                l.push(N.Kb + " = 10<sup>" + M + N.pKb + "</sup> M = 10<sup>" + M + logTekst(pkb, n) + "</sup> M = " + medM(F.bc(Math.pow(10, -pkb), n)));
                return l;
            }
            if (v.Ks !== undefined) l.push(N.Kb + " = " + F.brok(N.Kw, N.Ks) + " = " + F.brok(KW_TEKST, medM(t.Ks)) + " = " + medM(F.bc(KW / v.Ks, n)));
        }
        return l;
    }

    /* ----- Én syre eller base -------------------------------------------------- */

    function beregnEn() {
        var l = laes("sb", ["cs", "Ks", "pKs", "pH", "H", "cb", "Kb", "pKb", "pOH", "OH"]);
        var v = l.v, t = l.t, fejl = l.fejl, ud = {};
        ["cs", "Ks", "H", "cb", "Kb", "OH"].forEach(function (k) { positiv(v, k, fejl); });
        var staerkS = F.$("#sb-staerk-s", rod).checked, staerkB = F.$("#sb-staerk-b", rod).checked;
        if (staerkS && staerkB) fejl.push("Vælg kun stærk syre eller stærk base.");
        var navn = F.$("#sb-navn", rod).value.trim();
        var givetH = v.H !== undefined || v.pH !== undefined || v.pOH !== undefined || v.OH !== undefined;

        konstanter(v, ud);
        // [H3O+]
        if (v.H !== undefined) ud.H = [v.H, "givet"];
        else if (v.pH !== undefined) ud.H = [Math.pow(10, -v.pH), N.H + " = 10<sup>" + M + "pH</sup> M"];
        else if (v.pOH !== undefined) { ud.H = [Math.pow(10, v.pOH - 14), N.H + " = 10<sup>" + M + "pH</sup> M"]; ud.H.fraPOH = true; }
        else if (v.OH !== undefined) { ud.H = [KW / v.OH, N.H + " = " + F.brok(N.Kw, N.OH)]; ud.H.fraOH = true; }
        else if (v.cs !== undefined && staerkS) ud.H = [v.cs, N.H + " = " + N.cs + " (stærk syre)"];
        else if (v.cs !== undefined && ud.Ks) {
            var K = ud.Ks[0];
            ud.H = [(-K + Math.sqrt(K * K + 4 * K * v.cs)) / 2,
                N.H + " = <i>x</i> i " + N.Ks + " = " + F.brok("<i>x</i><sup>2</sup>", N.cs + " " + M + " <i>x</i>")];
            ud.H.syre = true;
        }
        // [OH-]
        if (v.OH !== undefined) ud.OH = [v.OH, "givet"];
        else if (v.pOH !== undefined) ud.OH = [Math.pow(10, -v.pOH), N.OH + " = 10<sup>" + M + "pOH</sup> M"];
        else if (v.cb !== undefined && staerkB && !ud.H) ud.OH = [v.cb, N.OH + " = " + N.cb + " (stærk base)"];
        else if (v.cb !== undefined && ud.Kb && !ud.H) {
            var Kb = ud.Kb[0];
            ud.OH = [(-Kb + Math.sqrt(Kb * Kb + 4 * Kb * v.cb)) / 2,
                N.OH + " = <i>x</i> i " + N.Kb + " = " + F.brok("<i>x</i><sup>2</sup>", N.cb + " " + M + " <i>x</i>")];
        }
        hOgOH(v, ud);
        // K ud fra en målt pH og den formelle koncentration
        if (!ud.Ks && givetH && v.cs !== undefined && !staerkS && ud.H[0] < v.cs) {
            ud.Ks = [ud.H[0] * ud.H[0] / (v.cs - ud.H[0]), N.Ks + " = " + F.brok("<i>x</i> · <i>x</i>", N.cs + " " + M + " <i>x</i>") + " med <i>x</i> = " + N.H];
            ud.pKs = [-Math.log10(ud.Ks[0]), N.pKs + " = " + M + "log " + N.Ks];
            ud.Kb = [KW / ud.Ks[0], N.Kb + " = " + F.brok(N.Kw, N.Ks)];
            ud.pKb = [-Math.log10(ud.Kb[0]), N.pKb + " = 14,00 " + M + " " + N.pKs];
            ud.Ks.fraPH = true;
        } else if (!ud.Kb && givetH && v.cb !== undefined && !staerkB && ud.OH[0] < v.cb) {
            ud.Kb = [ud.OH[0] * ud.OH[0] / (v.cb - ud.OH[0]), N.Kb + " = " + F.brok("<i>x</i> · <i>x</i>", N.cb + " " + M + " <i>x</i>") + " med <i>x</i> = " + N.OH];
            ud.pKb = [-Math.log10(ud.Kb[0]), N.pKb + " = " + M + "log " + N.Kb];
            ud.Ks = [KW / ud.Kb[0], N.Ks + " = " + F.brok(N.Kw, N.Kb)];
            ud.pKs = [-Math.log10(ud.Ks[0]), N.pKs + " = 14,00 " + M + " " + N.pKb];
            ud.Kb.fraPH = true;
        }
        // formelle koncentrationer
        if (v.cs !== undefined) ud.cs = [v.cs, "givet"];
        else if (ud.H && staerkS) ud.cs = [ud.H[0], N.cs + " = " + N.H + " (stærk syre)"];
        else if (ud.H && ud.Ks && ud.H[0] > 1e-7 && v.cb === undefined) ud.cs = [ud.H[0] * ud.H[0] / ud.Ks[0] + ud.H[0], N.cs + " = " + F.brok(N.H + "<sup>2</sup>", N.Ks) + " + " + N.H];
        if (v.cb !== undefined) ud.cb = [v.cb, "givet"];
        else if (ud.OH && staerkB) ud.cb = [ud.OH[0], N.cb + " = " + N.OH + " (stærk base)"];
        else if (ud.OH && ud.Kb && ud.OH[0] > 1e-7 && v.cs === undefined && !(ud.H && ud.H.syre)) ud.cb = [ud.OH[0] * ud.OH[0] / ud.Kb[0] + ud.OH[0], N.cb + " = " + F.brok(N.OH + "<sup>2</sup>", N.Kb) + " + " + N.OH];
        // omdannelsesgrad
        if (ud.cs && ud.H && !staerkS && v.cb === undefined) ud.a = [ud.H[0] / ud.cs[0], "α = " + F.brok(N.H, N.cs)];
        else if (ud.cb && ud.OH && !staerkB && v.cs === undefined) ud.a = [ud.OH[0] / ud.cb[0], "α = " + F.brok(N.OH, N.cb)];

        if (v.cs !== undefined && v.cb !== undefined) fejl.push("Skriv enten " + N.cs + " eller " + N.cb + ". Er der både syre og base i opløsningen, så brug fanen Puffer.");
        if (ud.a && ud.a[0] > 1.0001) fejl.push("Omdannelsesgraden bliver over 100 %. Tjek tallene.");
        if (givetH && v.cs !== undefined && !staerkS && ud.H && ud.H[0] >= v.cs) fejl.push(N.H + " kan ikke være større end " + N.cs + " for en monohydron syre.");

        var n = cifre("#sb-cifre");
        vis("#sb-resultater", [
            ["cs", "M"], ["Ks", "M"], ["pKs", ""], ["a", ""], ["pH", ""], ["H", "M"],
            ["cb", "M"], ["Kb", "M"], ["pKb", ""], ["pOH", ""], ["OH", "M"]
        ], ud, n);
        visFejl("#sb-fejl", fejl);
        visBesvarelse("#sb-besvarelse", fejl.length ? "" : besvarEn(v, t, ud, n, navn, staerkS, staerkB, givetH));
    }

    function besvarEn(v, t, ud, n, navn, staerkS, staerkB, givetH) {
        var b = [];
        var stof = navn || null;
        // stærk syre
        if (staerkS && v.cs !== undefined && !givetH) {
            b.push(h4("pH i en stærk syre"));
            b.push(p("En stærk syre reagerer fuldstændigt med vand. Hvert syremolekyle giver én oxoniumion, så " + N.H + " = " + N.cs + "."));
            b.push(ligning("pH = " + M + "log " + N.cs + " = " + M + "log(" + t.cs + ") = " + logTekst(ud.pH[0], n)));
            b.push(h4("Konklusion"));
            b.push(p(stof ? "pH i " + t.cs + " M " + stof + " er " + logTekst(ud.pH[0], n) + "." : "Opløsningen har pH " + logTekst(ud.pH[0], n) + "."));
            return b.join("");
        }
        // stærk base
        if (staerkB && v.cb !== undefined && !givetH) {
            b.push(h4("Trin 1: pOH"));
            b.push(p("En stærk base reagerer fuldstændigt med vand, så " + N.OH + " = " + N.cb + "."));
            b.push(ligning("pOH = " + M + "log " + N.cb + " = " + M + "log(" + t.cb + ") = " + logTekst(ud.pOH[0], n)));
            b.push(h4("Trin 2: pH"));
            b.push(ligning("pH = 14,00 " + M + " pOH = 14,00 " + M + " " + logTekst(ud.pOH[0], n) + " = " + logTekst(ud.pH[0], n)));
            b.push(h4("Konklusion"));
            b.push(p(stof ? "pH i " + t.cb + " M " + stof + " er " + logTekst(ud.pH[0], n) + "." : "Opløsningen har pH " + logTekst(ud.pH[0], n) + "."));
            return b.join("");
        }
        // svag syre ud fra c og K
        if (v.cs !== undefined && ud.H && ud.H.syre) {
            return svag({ type: "syre", c: v.cs, cTekst: t.cs, K: ud.Ks[0], pK: ud.pKs[0], pKtekst: v.pKs !== undefined ? t.pKs : undefined,
                afled: afledK("syre", v, t, n), navn: stof, S: "S", B: "B", n: n }).html;
        }
        // svag base ud fra c og K
        if (v.cb !== undefined && ud.OH && ud.Kb && !givetH && !staerkB) {
            return svag({ type: "base", c: v.cb, cTekst: t.cb, K: ud.Kb[0], pK: ud.pKb[0], pKtekst: v.pKb !== undefined ? t.pKb : undefined,
                afled: afledK("base", v, t, n), navn: stof, S: "S", B: "B", n: n }).html;
        }
        // fra pH til K
        if ((ud.Ks && ud.Ks.fraPH) || (ud.Kb && ud.Kb.fraPH)) return fraPHTilK(v, t, ud, n, stof);
        // kun omregninger mellem pH, pOH og koncentrationer
        if (givetH && ud.pH) return omregning(v, t, ud, n);
        return "";
    }

    function fraPHTilK(v, t, ud, n, stof) {
        var b = [], syre = !!(ud.Ks && ud.Ks.fraPH);
        var c = syre ? v.cs : v.cb, cT = syre ? t.cs : t.cb;
        var x = syre ? ud.H[0] : ud.OH[0];
        b.push(h4(syre ? "Trin 1: koncentrationen af oxonium" : "Trin 1: koncentrationen af hydroxid"));
        if (syre) {
            if (v.H !== undefined) b.push(p(N.H + " = " + medM(t.H) + " er oplyst."));
            else if (v.pH !== undefined) b.push(ligning(N.H + " = 10<sup>" + M + "pH</sup> M = 10<sup>" + M + t.pH + "</sup> M = " + medM(F.bc(x, n))));
            else b.push(ligning(N.H + " = " + medM(F.bc(x, n))));
        } else {
            if (v.OH !== undefined) b.push(p(N.OH + " = " + medM(t.OH) + " er oplyst."));
            else if (v.pOH !== undefined) b.push(ligning(N.OH + " = 10<sup>" + M + "pOH</sup> M = 10<sup>" + M + t.pOH + "</sup> M = " + medM(F.bc(x, n))));
            else if (v.pH !== undefined) {
                b.push(ligning("pOH = 14,00 " + M + " pH = 14,00 " + M + " " + t.pH + " = " + logTekst(14 - v.pH, n)));
                b.push(ligning(N.OH + " = 10<sup>" + M + "pOH</sup> M = 10<sup>" + M + logTekst(14 - v.pH, n) + "</sup> M = " + medM(F.bc(x, n))));
            } else b.push(ligning(N.OH + " = " + medM(F.bc(x, n))));
        }
        b.push(h4("Trin 2: skemaet"));
        b.push(p("<i>x</i> angiver her den koncentration af " + (stof || (syre ? "syren" : "basen")) + ", der har " + (syre ? "afgivet" : "optaget") + " en hydron. Den er lig med " +
            (syre ? N.H : N.OH) + ", så <i>x</i> = " + medM(F.bc(x, n)) + " er kendt."));
        b.push(syre ? saelSkema(["S", H2O, "B", H3O], [medM(cT), "0 M", "0 M"], [M + "<i>x</i>", "+<i>x</i>", "+<i>x</i>"], [medM(cT) + " " + M + " <i>x</i>", "<i>x</i>", "<i>x</i>"])
            : saelSkema(["B", H2O, "S", OHion], [medM(cT), "0 M", "0 M"], [M + "<i>x</i>", "+<i>x</i>", "+<i>x</i>"], [medM(cT) + " " + M + " <i>x</i>", "<i>x</i>", "<i>x</i>"]));
        var K = syre ? ud.Ks[0] : ud.Kb[0], pK = -Math.log10(K);
        b.push(h4(syre ? "Trin 3: syrestyrkekonstanten" : "Trin 3: basestyrkekonstanten"));
        b.push(ligning((syre ? N.Ks : N.Kb) + " = " + F.brok("<i>x</i> · <i>x</i>", medM(cT) + " " + M + " <i>x</i>") + " = " +
            F.brok("(" + medM(F.bc(x, n)) + ")<sup>2</sup>", medM(cT) + " " + M + " " + medM(F.bc(x, n))) + " = " + medM(F.bc(K, n))));
        b.push(ligning((syre ? N.pKs : N.pKb) + " = " + M + "log(" + F.bc(K, n) + ") = " + logTekst(pK, n)));
        if (!syre) b.push(ligning(N.pKs + " = 14,00 " + M + " " + N.pKb + " = 14,00 " + M + " " + logTekst(pK, n) + " = " + logTekst(14 - pK, n)));
        b.push(h4("Konklusion"));
        var pKs = syre ? pK : 14 - pK;
        b.push(p((syre ? "Syren har " + N.Ks + " = " + medM(F.bc(K, n)) + " og " + N.pKs + " = " + logTekst(pK, n) + ". Det er " + styrkeOrd(pKs) + "." :
            "Basen har " + N.Kb + " = " + medM(F.bc(K, n)) + " og " + N.pKb + " = " + logTekst(pK, n) + ". Den korresponderende syre har " + N.pKs + " = " + logTekst(pKs, n) + ".")));
        return b.join("");
    }

    function omregning(v, t, ud, n) {
        var b = [h4("Omregninger")];
        var pH = ud.pH[0], pOH = ud.pOH[0];
        if (v.pH !== undefined) {
            b.push(ligning(N.H + " = 10<sup>" + M + "pH</sup> M = 10<sup>" + M + t.pH + "</sup> M = " + medM(F.bc(ud.H[0], n))));
            b.push(ligning("pOH = 14,00 " + M + " pH = 14,00 " + M + " " + t.pH + " = " + logTekst(pOH, n)));
            b.push(ligning(N.OH + " = 10<sup>" + M + "pOH</sup> M = 10<sup>" + M + logTekst(pOH, n) + "</sup> M = " + medM(F.bc(ud.OH[0], n))));
        } else if (v.pOH !== undefined) {
            b.push(ligning(N.OH + " = 10<sup>" + M + "pOH</sup> M = 10<sup>" + M + t.pOH + "</sup> M = " + medM(F.bc(ud.OH[0], n))));
            b.push(ligning("pH = 14,00 " + M + " pOH = 14,00 " + M + " " + t.pOH + " = " + logTekst(pH, n)));
            b.push(ligning(N.H + " = 10<sup>" + M + "pH</sup> M = 10<sup>" + M + logTekst(pH, n) + "</sup> M = " + medM(F.bc(ud.H[0], n))));
        } else if (v.H !== undefined) {
            b.push(ligning("pH = " + M + "log" + N.H + " = " + M + "log(" + t.H + ") = " + logTekst(pH, n)));
            b.push(ligning("pOH = 14,00 " + M + " pH = 14,00 " + M + " " + logTekst(pH, n) + " = " + logTekst(pOH, n)));
        } else if (v.OH !== undefined) {
            b.push(ligning("pOH = " + M + "log" + N.OH + " = " + M + "log(" + t.OH + ") = " + logTekst(pOH, n)));
            b.push(ligning("pH = 14,00 " + M + " pOH = 14,00 " + M + " " + logTekst(pOH, n) + " = " + logTekst(pH, n)));
        }
        return b.join("");
    }

    /* ----- Puffer --------------------------------------------------------------- */

    function beregnPuffer() {
        var l = laes("pu", ["S", "B", "ns", "nb", "Ks", "pKs", "Kb", "pKb", "pH", "pOH", "H", "OH"]);
        var v = l.v, t = l.t, fejl = l.fejl, ud = {};
        ["S", "B", "ns", "nb", "Ks", "Kb", "H", "OH"].forEach(function (k) { positiv(v, k, fejl); });
        konstanter(v, ud);
        var pufLign = "pH = " + N.pKs + " + log" + "(" + F.brok(N.B, N.S) + ")";
        var pufLignN = "pH = " + N.pKs + " + log" + "(" + F.brok(N.nb, N.ns) + ")";
        if (v.H !== undefined) ud.H = [v.H, "givet"];
        else if (v.pH !== undefined) ud.H = [Math.pow(10, -v.pH), N.H + " = 10<sup>" + M + "pH</sup> M"];
        else if (v.pOH !== undefined) { ud.H = [Math.pow(10, v.pOH - 14), N.H + " = 10<sup>" + M + "pH</sup> M"]; ud.H.fraPOH = true; }
        else if (v.OH !== undefined) { ud.H = [KW / v.OH, N.H + " = " + F.brok(N.Kw, N.OH)]; ud.H.fraOH = true; }
        else if (ud.Ks && v.S !== undefined && v.B !== undefined) { ud.H = [ud.Ks[0] * v.S / v.B, pufLign]; ud.H.puf = "c"; }
        else if (ud.Ks && v.ns !== undefined && v.nb !== undefined) { ud.H = [ud.Ks[0] * v.ns / v.nb, pufLignN]; ud.H.puf = "n"; }
        hOgOH(v, ud);
        if (ud.H && ud.H.puf) ud.pH[1] = ud.H[1];
        var Hk = ud.H ? ud.H[0] : null;
        if (v.S !== undefined) ud.S = [v.S, "givet"];
        else if (Hk && ud.Ks && v.B !== undefined) ud.S = [v.B * Hk / ud.Ks[0], pufLign];
        if (v.B !== undefined) ud.B = [v.B, "givet"];
        else if (Hk && ud.Ks && v.S !== undefined) ud.B = [ud.Ks[0] * v.S / Hk, pufLign];
        if (v.ns !== undefined) ud.ns = [v.ns, "givet"];
        else if (Hk && ud.Ks && v.nb !== undefined) ud.ns = [v.nb * Hk / ud.Ks[0], pufLignN];
        if (v.nb !== undefined) ud.nb = [v.nb, "givet"];
        else if (Hk && ud.Ks && v.ns !== undefined) ud.nb = [ud.Ks[0] * v.ns / Hk, pufLignN];
        // Ks ud fra pH og forholdet, hvis K ikke er givet
        var fraPH = false;
        if (!ud.Ks && Hk && ((v.S !== undefined && v.B !== undefined) || (v.ns !== undefined && v.nb !== undefined))) {
            var forhold = v.S !== undefined ? v.B / v.S : v.nb / v.ns;
            ud.Ks = [Hk * forhold, v.S !== undefined ? pufLign : pufLignN];
            ud.Kb = [KW / ud.Ks[0], N.Kb + " = " + F.brok(N.Kw, N.Ks)];
            ud.pKs = [-Math.log10(ud.Ks[0]), v.S !== undefined ? pufLign : pufLignN];
            ud.pKb = [-Math.log10(ud.Kb[0]), N.pKb + " = 14,00 " + M + " " + N.pKs];
            fraPH = true;
        }
        // syrebrøk
        var sN = ud.ns ? ud.ns[0] : ud.S ? ud.S[0] : null, bN = ud.nb ? ud.nb[0] : ud.B ? ud.B[0] : null;
        if (sN !== null && bN !== null) {
            ud.xs = [sN / (sN + bN), N.xs + " = " + F.brok(ud.ns ? N.ns : N.S, ud.ns ? N.ns + " + " + N.nb : N.S + " + " + N.B)];
            ud.xb = [bN / (sN + bN), N.xb + " = 1 " + M + " " + N.xs];
        }
        var n = cifre("#pu-cifre");
        vis("#pu-resultater", [
            ["S", "M"], ["ns", "mol"], ["Ks", "M"], ["pKs", ""], ["pH", ""], ["H", "M"], ["xs", ""],
            ["B", "M"], ["nb", "mol"], ["Kb", "M"], ["pKb", ""], ["pOH", ""], ["OH", "M"], ["xb", ""]
        ], ud, n);
        visFejl("#pu-fejl", fejl);
        visBesvarelse("#pu-besvarelse", fejl.length ? "" : besvarPuffer(v, t, ud, n, fraPH));
    }

    function besvarPuffer(v, t, ud, n, fraPH) {
        var b = [];
        var medN = v.ns !== undefined || v.nb !== undefined;
        var sSym = medN ? N.ns : N.S, bSym = medN ? N.nb : N.B;
        var enhed = medN ? " mol" : " M";
        var sV = medN ? ud.ns : ud.S, bV = medN ? ud.nb : ud.B;
        var sGiv = medN ? v.ns !== undefined : v.S !== undefined, bGiv = medN ? v.nb !== undefined : v.B !== undefined;
        var sT = medN ? t.ns : t.S, bT = medN ? t.nb : t.B;
        var lign = "pH = " + N.pKs + " + log(" + F.brok(bSym, sSym) + ")";

        function pKsLinjer() {
            if (v.pKs !== undefined) return t.pKs;
            var pk = F.dec(ud.pKs[0], n);
            if (v.Ks !== undefined) b.push(ligning(N.pKs + " = " + M + "log " + N.Ks + " = " + M + "log(" + t.Ks + ") = " + pk));
            else if (v.pKb !== undefined) b.push(ligning(N.pKs + " = 14,00 " + M + " " + N.pKb + " = 14,00 " + M + " " + t.pKb + " = " + pk));
            else if (v.Kb !== undefined) {
                b.push(ligning(N.pKb + " = " + M + "log " + N.Kb + " = " + M + "log(" + t.Kb + ") = " + F.dec(ud.pKb[0], n)));
                b.push(ligning(N.pKs + " = 14,00 " + M + " " + N.pKb + " = 14,00 " + M + " " + F.dec(ud.pKb[0], n) + " = " + pk));
            }
            return pk;
        }
        function phTekst() { return v.pH !== undefined ? t.pH : logTekst(ud.pH[0], n); }

        // 1) pH ud fra syre og base
        if (ud.H && ud.H.puf && sGiv && bGiv) {
            if (v.pKs === undefined) b.push(h4("Syrestyrkeeksponenten"));
            var pKt = pKsLinjer();
            b.push(h4("Pufferligningen"));
            b.push(ligning(lign + " = " + pKt + " + log(" + F.brok(bT + enhed, sT + enhed) + ") = " + logTekst(ud.pH[0], n)));
            if (ud.xs) {
                b.push(h4("Syrebrøken"));
                b.push(ligning(N.xs + " = " + F.brok(sSym, sSym + " + " + bSym) + " = " + F.brok(sT + enhed, sT + enhed + " + " + bT + enhed) + " = " + F.bc(ud.xs[0], n)));
                b.push(p(F.bc(ud.xs[0] * 100, Math.min(n, 3)) + " % af stoffet findes på syreform, og " + F.bc(ud.xb[0] * 100, Math.min(n, 3)) + " % findes på baseform."));
            }
            b.push(h4("Konklusion"));
            b.push(p("Puffersystemet har pH " + logTekst(ud.pH[0], n) + "."));
            return b.join("");
        }
        // 2) den manglende mængde ud fra pH
        if (ud.H && !ud.H.puf && ud.pKs && !fraPH && (sGiv !== bGiv)) {
            if (v.pH === undefined) {
                b.push(h4("pH"));
                if (v.pOH !== undefined) b.push(ligning("pH = 14,00 " + M + " pOH = 14,00 " + M + " " + t.pOH + " = " + logTekst(ud.pH[0], n)));
                else if (v.H !== undefined) b.push(ligning("pH = " + M + "log" + N.H + " = " + M + "log(" + t.H + ") = " + logTekst(ud.pH[0], n)));
                else b.push(ligning("pH = " + logTekst(ud.pH[0], n)));
            }
            if (v.pKs === undefined) b.push(h4("Syrestyrkeeksponenten"));
            var pKt2 = pKsLinjer();
            var r = Math.pow(10, ud.pH[0] - ud.pKs[0]);
            b.push(h4("Forholdet mellem base og syre"));
            b.push(p("Pufferligningen løses for forholdet mellem base og syre."));
            b.push(ligning(F.brok(bSym, sSym) + " = 10<sup>pH " + M + " " + N.pKs + "</sup> = 10<sup>" + phTekst() + " " + M + " " + pKt2 + "</sup> = " + F.bc(r, n)));
            if (sGiv) {
                b.push(ligning(bSym + " = " + F.bc(r, n) + " · " + sSym + " = " + F.bc(r, n) + " · " + sT + enhed + " = " + F.bc(bV[0], n) + enhed));
                b.push(h4("Konklusion"));
                b.push(p("Der skal være " + F.bc(bV[0], n) + enhed + " af basen, for at puffersystemet har pH " + phTekst() + "."));
            } else {
                b.push(ligning(sSym + " = " + F.brok(bSym, F.bc(r, n)) + " = " + F.brok(bT + enhed, F.bc(r, n)) + " = " + F.bc(sV[0], n) + enhed));
                b.push(h4("Konklusion"));
                b.push(p("Der skal være " + F.bc(sV[0], n) + enhed + " af syren, for at puffersystemet har pH " + phTekst() + "."));
            }
            return b.join("");
        }
        // 3) pKs ud fra pH og forholdet
        if (fraPH) {
            b.push(h4("Syrestyrkeeksponenten"));
            b.push(p("Pufferligningen løses for " + N.pKs + "."));
            b.push(ligning(N.pKs + " = pH " + M + " log(" + F.brok(bSym, sSym) + ") = " + phTekst() + " " + M + " log(" + F.brok(bT + enhed, sT + enhed) + ") = " + logTekst(ud.pKs[0], n)));
            b.push(ligning(N.Ks + " = 10<sup>" + M + N.pKs + "</sup> M = 10<sup>" + M + logTekst(ud.pKs[0], n) + "</sup> M = " + medM(F.bc(ud.Ks[0], n))));
            b.push(h4("Konklusion"));
            b.push(p("Syren har " + N.pKs + " = " + logTekst(ud.pKs[0], n) + ". Det er " + styrkeOrd(ud.pKs[0]) + "."));
            return b.join("");
        }
        return "";
    }

    /* ----- Visning --------------------------------------------------------------- */

    function cifre(id) {
        var n = Math.round(F.tal(F.$(id, rod).value) || 3);
        return Math.max(2, Math.min(7, n));
    }

    function vis(id, orden, ud, n) {
        var log = ["pH", "pOH", "pKs", "pKb"];
        var rk = orden.filter(function (o) { return ud[o[0]]; }).map(function (o) {
            var k = o[0], x = ud[k][0];
            var tal = log.indexOf(k) >= 0 ? logTekst(x, n) : k === "a" ? F.bc(x * 100, n) + " %" :
                (k === "xs" || k === "xb") ? F.bc(x, n) + " (" + F.bc(x * 100, Math.min(n, 3)) + " %)" : F.bc(x, n) + (o[1] ? " " + o[1] : "");
            var hvor = ud[k][1] === "givet" ? '<span class="givet">givet</span>' : ud[k][1];
            var navn = k === "a" ? "Omdannelsesgrad, α" : k === "xs" ? "Syrebrøk, " + N.xs : k === "xb" ? "Basebrøk, " + N.xb : N[k];
            return "<tr><th>" + navn + '</th><td class="res">' + tal + "</td><td>" + hvor + "</td></tr>";
        });
        var tabel = F.$(id, rod);
        tabel.innerHTML = rk.join("");
        tabel.closest(".resultat").hidden = !rk.length;
    }

    function visFejl(id, fejl) {
        var b = F.$(id, rod);
        b.innerHTML = fejl.map(function (f) { return "<li>" + f + "</li>"; }).join("");
        b.hidden = !fejl.length;
    }

    function visBesvarelse(id, html) {
        var b = F.$(id, rod);
        // en åben "Løsning i hånden" skal blive ved med at være åben
        var aaben = F.$$("details[open]", b).length > 0;
        if (b.dataset.html !== html) {
            b.innerHTML = html;
            b.dataset.html = html;
            if (aaben) F.$$("details", b).forEach(function (d) { d.open = true; });
            F.trin(b);
        }
        b.closest(".ramme").hidden = !html;
    }

    /* ----- Husk og start ---------------------------------------------------------- */

    function gem() {
        var data = {};
        F.$$("input, select", rod).forEach(function (el) { data[el.id] = el.type === "checkbox" ? el.checked : el.value; });
        var aaben = F.$(".underfane[aria-selected=true]", rod);
        data._fane = aaben ? aaben.dataset.fane : "en";
        F.husk("syrebase", data);
    }

    function visFane(navn) {
        F.$$(".underfane", rod).forEach(function (k) { k.setAttribute("aria-selected", k.dataset.fane === navn ? "true" : "false"); });
        F.$$(".underpanel", rod).forEach(function (pn) { pn.hidden = pn.dataset.fane !== navn; });
    }

    function start() {
        rod = document.getElementById("syrebase");
        if (!rod) return;
        var data = F.husk("syrebase") || {};
        F.$$("input, select", rod).forEach(function (el) {
            if (data[el.id] !== undefined) { if (el.type === "checkbox") el.checked = data[el.id]; else el.value = data[el.id]; }
            el.addEventListener("input", alt);
            el.addEventListener("change", alt);
        });
        F.$$(".underfane", rod).forEach(function (k) { k.addEventListener("click", function () { visFane(k.dataset.fane); gem(); }); });
        visFane(data._fane && F.$('.underfane[data-fane="' + data._fane + '"]', rod) ? data._fane : "en");
        F.$$(".sb-ryd", rod).forEach(function (k) {
            k.addEventListener("click", function () {
                var panel = k.closest(".underpanel");
                F.$$("input", panel).forEach(function (el) { if (el.type === "checkbox") el.checked = false; else if (!/cifre/.test(el.id)) el.value = ""; });
                alt();
            });
        });
        F.$$("[data-kopier]", rod).forEach(function (k) {
            k.addEventListener("click", function () { F.kopier(F.$(k.dataset.kopier, rod), k); });
        });
        // stærk syre og stærk base udelukker hinanden
        F.$("#sb-staerk-s", rod).addEventListener("change", function () { if (this.checked) F.$("#sb-staerk-b", rod).checked = false; alt(); });
        F.$("#sb-staerk-b", rod).addEventListener("change", function () { if (this.checked) F.$("#sb-staerk-s", rod).checked = false; alt(); });
        alt();
    }

    function alt() {
        beregnEn();
        beregnPuffer();
        if (window.FACIT_FORDELING) window.FACIT_FORDELING.beregn(rod);
        if (window.FACIT_TITRERING) window.FACIT_TITRERING.beregn(rod);
        gem();
    }

    window.FACIT_SB = {
        N: N, svag: svag, saelSkema: saelSkema, laes: function (prefiks, navne, r) { var gl = rod; rod = r || rod; var x = laes(prefiks, navne); rod = gl; return x; },
        logTekst: logTekst, visBesvarelse: function (id, html) { visBesvarelse(id, html); }, visFejl: function (id, f) { visFejl(id, f); },
        cifre: function (id) { return cifre(id); }, styrkeOrd: styrkeOrd, somSkrevet: somSkrevet
    };
    document.addEventListener("DOMContentLoaded", start);
})();
