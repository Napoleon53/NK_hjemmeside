/* =====================================================================
   empirisk.js - empirisk formel og molekylformel ud fra masseprocenter

   Regner som arket Elementaranalyse i superskabelonen og skriver
   besvarelsen som eksemplerne i Kemibogen A, afsnit A3.1: 100 g,
   én linje pr. stofmængde, én linje pr. forhold, gang op til hele tal,
   formelmassen og molekylformlen. Atommasserne er bogens.
   ===================================================================== */
(function () {
    "use strict";

    var F = window.FACIT;
    var MAKS = 10;
    var rod, krop, raekker = [];

    var SYMBOL = {}, NAVN = {};
    (window.GRUNDSTOFFER || []).forEach(function (g) {
        var e = { z: g[0], sym: g[1], navn: g[2], M: g[3], Mtekst: g[4] };
        SYMBOL[g[1]] = e;
        NAVN[g[2].toLowerCase()] = e;
    });

    function findGrundstof(t) {
        t = (t || "").trim();
        if (!t) return null;
        if (SYMBOL[t]) return SYMBOL[t];
        var stort = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
        if (SYMBOL[stort]) return SYMBOL[stort];
        return NAVN[t.toLowerCase()] || null;
    }

    function nyRaekke(d) { d = d || {}; return { sym: d.sym || "", pct: d.pct || "" }; }

    function tegn() {
        krop.innerHTML = "";
        raekker.forEach(function (r) {
            var tr = document.createElement("tr");
            var t1 = document.createElement("td"), t2 = document.createElement("td"), t3 = document.createElement("td"), t4 = document.createElement("td");
            var s = document.createElement("input");
            s.type = "text"; s.className = "f-sym"; s.value = r.sym; s.placeholder = "fx C"; s.autocomplete = "off"; s.spellcheck = false;
            s.setAttribute("aria-label", "Grundstof");
            var p = document.createElement("input");
            p.type = "text"; p.className = "f-tal"; p.value = r.pct; p.autocomplete = "off";
            p.setAttribute("aria-label", "Masseprocent");
            s.addEventListener("input", function () { r.sym = s.value; beregn(); });
            p.addEventListener("input", function () { r.pct = p.value; beregn(); });
            r.navnEl = t3;
            r.pctFelt = p;
            t1.appendChild(s); t2.appendChild(p);
            var fjern = document.createElement("button");
            fjern.type = "button"; fjern.className = "fjern"; fjern.textContent = "×";
            fjern.title = "Fjern grundstoffet"; fjern.setAttribute("aria-label", "Fjern grundstoffet");
            fjern.addEventListener("click", function () { raekker.splice(raekker.indexOf(r), 1); if (!raekker.length) raekker.push(nyRaekke()); tegn(); beregn(); });
            t4.appendChild(fjern);
            [t1, t2, t3, t4].forEach(function (t) { tr.appendChild(t); });
            krop.appendChild(tr);
        });
        F.$("#ea-plus", rod).disabled = raekker.length >= MAKS;
    }

    function beregn() {
        var fejl = [], data = [];
        raekker.forEach(function (r) {
            var g = findGrundstof(r.sym);
            r.navnEl.textContent = r.sym.trim() ? (g ? g.navn : "ukendt symbol") : "";
            r.navnEl.className = g || !r.sym.trim() ? "navn" : "navn fejl";
            if (!r.sym.trim()) return;
            if (!g) { fejl.push("Symbolet " + F.esc(r.sym) + " findes ikke. Skriv fx C, H, O eller Cl."); return; }
            if (data.some(function (d) { return d.g === g; })) { fejl.push(g.navn.charAt(0).toUpperCase() + g.navn.slice(1) + " står to gange."); return; }
            var p = F.tal(r.pct);
            if (p !== null && (isNaN(p) || p <= 0)) { fejl.push((gram() ? "Massen af " : "Masseprocenten for ") + g.navn + " skal være et positivt tal."); return; }
            data.push({ g: g, pct: p });
        });

        // én tom masseprocent er resten op til 100 % (eller op til prøvens masse)
        var tomme = data.filter(function (d) { return d.pct === null; });
        var sumKendt = data.reduce(function (a, d) { return a + (d.pct || 0); }, 0);
        var rest = null;
        var mProeve = gram() ? F.tal(F.$("#ea-mprove", rod).value) : null;
        if (mProeve !== null && (isNaN(mProeve) || mProeve <= 0)) { fejl.push("Prøvens masse skal være et positivt tal."); mProeve = null; }
        var helt = gram() ? mProeve : 100;
        raekker.forEach(function (r) { r.pctFelt.placeholder = ""; });
        if (tomme.length === 1 && helt !== null && sumKendt < helt && data.length > 1) {
            tomme[0].pct = helt - sumKendt;
            rest = tomme[0];
            raekker.forEach(function (r) { if (findGrundstof(r.sym) === rest.g && !r.pct.trim()) r.pctFelt.placeholder = "resten"; });
        } else if (tomme.length) {
            if (data.length > 1) fejl.push(gram() ? "Skriv massen af alle grundstoffer. Én af dem må stå tom, hvis prøvens masse er oplyst, så regnes den som resten." :
                "Skriv masseprocenten for alle grundstoffer. Én af dem må stå tom, så regnes den som resten op til 100 %.");
        }
        F.$("#ea-maengde-navn", rod).textContent = gram() ? "Masse" : "Masseprocent";
        F.$("#ea-maengde-enhed", rod).textContent = gram() ? "g" : "%";
        F.$("#ea-mprove-felt", rod).hidden = !gram();
        var sum = data.reduce(function (a, d) { return a + (d.pct || 0); }, 0);
        var Mind = F.tal(F.$("#ea-M", rod).value);
        if (Mind !== null && (isNaN(Mind) || Mind <= 0)) { fejl.push("Molarmassen skal være et positivt tal."); Mind = null; }

        var r = null;
        if (data.length >= 2 && !tomme.filter(function (d) { return d !== rest; }).length && !fejl.length) {
            if (!gram() && Math.abs(sum - 100) > 0.5) fejl.push("Masseprocenterne giver " + F.dec(sum, 2) + " % tilsammen og ikke 100 %. Mangler der et grundstof?");
            if (gram() && mProeve && Math.abs(sum - mProeve) > 0.005 * mProeve) fejl.push("Masserne giver " + F.som(Number(sum.toPrecision(6))) + " g tilsammen og ikke prøvens masse, " + F.som(mProeve) + " g. Mangler der et grundstof?");
            r = regn(data, Mind);
            r.rest = rest; r.sumKendt = sumKendt;
        }
        F.$("#ea-fejl", rod).innerHTML = fejl.map(function (f) { return "<li>" + f + "</li>"; }).join("");
        F.$("#ea-fejl", rod).hidden = !fejl.length;
        vis(r);
        gem();
    }

    function regn(data, Mind) {
        data.forEach(function (d) { d.n = d.pct / d.g.M; });
        var min = data.reduce(function (a, d) { return d.n < a.n ? d : a; }, data[0]);
        data.forEach(function (d) { d.forhold = d.n / min.n; });
        // mindste faktor, der gør alle forhold (næsten) hele
        var bedst = null;
        for (var k = 1; k <= 12; k++) {
            var afv = Math.max.apply(null, data.map(function (d) { var x = k * d.forhold; return Math.abs(x - Math.round(x)); }));
            if (afv < 0.1) { bedst = { k: k, afv: afv }; break; }
            if (!bedst || afv < bedst.afv) bedst = { k: k, afv: afv, usikker: true };
        }
        data.forEach(function (d) { d.hel = Math.max(1, Math.round(bedst.k * d.forhold)); });
        var Memp = data.reduce(function (a, d) { return a + d.hel * d.g.M; }, 0);
        var r = { data: data, min: min, k: bedst.k, afv: bedst.afv, usikker: !!bedst.usikker, Memp: Memp };
        if (Mind) {
            r.M = Mind;
            r.faktor = Mind / Memp;
            r.hel = Math.max(1, Math.round(r.faktor));
            r.faktorAfv = Math.abs(r.faktor - r.hel);
        }
        return r;
    }

    function formel(data, gange) {
        return data.map(function (d) {
            var t = d.hel * (gange || 1);
            return d.g.sym + (t > 1 ? "<sub>" + t + "</sub>" : "");
        }).join("");
    }

    function n4(x) { return F.bc(x, 4); }

    function broekOrd(x) {
        var rest = x - Math.floor(x);
        if (Math.abs(rest - 0.5) < 0.04) return { tekst: "en halv", k: 2 };
        if (Math.abs(rest - 1 / 3) < 0.04) return { tekst: "en tredjedel", k: 3 };
        if (Math.abs(rest - 2 / 3) < 0.04) return { tekst: "to tredjedele", k: 3 };
        if (Math.abs(rest - 0.25) < 0.04) return { tekst: "en fjerdedel", k: 4 };
        if (Math.abs(rest - 0.75) < 0.04) return { tekst: "tre fjerdedele", k: 4 };
        return null;
    }

    function vis(r) {
        var res = F.$("#ea-resultater", rod), bes = F.$("#ea-besvarelse", rod);
        F.$("#ea-resultatboks", rod).hidden = !r;
        F.$("#ea-besvarelsesboks", rod).hidden = !r;
        F.$("#ea-ingen", rod).hidden = !!r;
        if (!r) { res.innerHTML = ""; bes.innerHTML = ""; return; }

        var rk = [];
        rk.push("<tr><th>Empirisk formel</th><td class=\"res formel-stor\">" + formel(r.data) + "</td><td>" +
            (r.usikker ? "Usikker: forholdene bliver ikke hele, selv ganget med op til 12." : "Største afvigelse fra et helt tal er " + F.dec(r.afv, 2) + ".") + "</td></tr>");
        rk.push("<tr><th>Formelmasse</th><td class=\"res\">" + F.dec(r.Memp, 2) + " g/mol</td><td></td></tr>");
        if (r.M) {
            rk.push("<tr><th>Molekylformel</th><td class=\"res formel-stor\">" + formel(r.data, r.hel) + "</td><td>" +
                "<i>M</i>/<i>M</i><sub>emp</sub> = " + F.dec(r.faktor, 2) + (r.faktorAfv > 0.1 ? ". Usikker: tallet er langt fra et helt tal." : "") + "</td></tr>");
        }
        var bDBE = dbe(r.data, r.M ? r.hel : 1);
        if (bDBE) rk.push("<tr><th>DBE</th><td class=\"res\">" + F.som(bDBE.v) + "</td><td>Dobbeltbindingsækvivalenter for " + (r.M ? "molekylformlen" : "den empiriske formel") + "</td></tr>");
        res.innerHTML = rk.join("");

        var ud = [], d = r.data;
        var masser = d.map(function (x) { return F.dec(x.pct, decimaler(x)) + " g " + x.g.sym; });
        if (r.rest) {
            ud.push("<h4>Resten</h4>");
            var andre = d.filter(function (x) { return x !== r.rest; });
            if (gram()) {
                var mpT = F.$("#ea-mprove", rod).value.trim().replace(".", ",");
                ud.push('<p class="ligning"><i>m</i>(' + r.rest.g.sym + ") = <i>m</i>(prøve) " + andre.map(function (x) { return F.MINUS + " <i>m</i>(" + x.g.sym + ")"; }).join(" ") +
                    " = " + mpT + " g " + andre.map(function (x) { return F.MINUS + " " + F.dec(x.pct, decimaler(x)) + " g"; }).join(" ") + " = " + F.dec(r.rest.pct, decimaler(r.rest)) + " g</p>");
            } else {
                ud.push('<p class="ligning"><i>m</i>%(' + r.rest.g.sym + ") = 100 % " + andre.map(function (x) { return F.MINUS + " " + F.dec(x.pct, decimaler(x)) + " %"; }).join(" ") +
                    " = " + F.dec(r.rest.pct, decimaler(r.rest)) + " %</p>");
            }
        }
        if (gram()) {
            ud.push("<h4>Trin 1: masserne</h4>");
            ud.push("<p>Prøven indeholder " + liste(masser) + ". Masserne regnes direkte om til stofmængder.</p>");
        } else {
            ud.push("<h4>Trin 1: Regn på 100 g</h4>");
            ud.push("<p>I 100 g af stoffet er der " + liste(masser) + ".</p>");
        }
        ud.push("<h4>Trin 2: stofmængderne</h4>");
        ud.push("<p>Hver masse regnes om til en stofmængde. Atommasserne står i det periodiske system.</p>");
        d.forEach(function (x) {
            var s = x.g.sym;
            ud.push('<p class="ligning"><i>n</i>(' + s + ") = " + F.brok("<i>m</i>(" + s + ")", "<i>M</i>(" + s + ")") + " = " +
                F.brok(F.dec(x.pct, decimaler(x)) + " g", x.g.Mtekst + " g/mol") + " = " + n4(x.n) + " mol</p>");
        });
        ud.push("<h4>Trin 3: forholdet mellem stofmængderne</h4>");
        var andre2 = d.filter(function (x) { return x !== r.min; });
        ud.push("<p>Den mindste stofmængde er stofmængden af " + r.min.g.navn + ", " + n4(r.min.n) + " mol. " +
            (andre2.length === 1 ? "Den anden stofmængde divideres med den." : "De " + talOrd(andre2.length) + " andre stofmængder divideres med den.") + "</p>");
        andre2.forEach(function (x) {
            ud.push('<p class="ligning">' + F.brok("<i>n</i>(" + x.g.sym + ")", "<i>n</i>(" + r.min.g.sym + ")") + " = " +
                F.brok(n4(x.n) + " mol", n4(r.min.n) + " mol") + " = " + F.dec(x.forhold, 2) + "</p>");
        });
        if (r.k > 1) {
            ud.push("<h4>Trin 4: Gang op til hele tal</h4>");
            var ikkeHel = d.filter(function (x) { return Math.abs(x.forhold - Math.round(x.forhold)) >= 0.1; })[0];
            var bo = ikkeHel ? broekOrd(ikkeHel.forhold) : null;
            if (bo && bo.k === r.k) {
                ud.push("<p>Tallet " + F.dec(ikkeHel.forhold, 2) + " ender på " + bo.tekst + ". Alle tallene ganges derfor med " + r.k + ".</p>");
            } else {
                ud.push("<p>Tallene er ikke hele. Alle tallene ganges derfor med " + r.k + ", som er det mindste tal, der gør dem hele.</p>");
            }
            ud.push('<table class="lille-tabel"><thead><tr><th></th>' + d.map(function (x) { return "<th>" + x.g.sym + "</th>"; }).join("") + "</tr></thead><tbody>" +
                "<tr><td>forholdet fra trin 3</td>" + d.map(function (x) { return "<td>" + F.dec(x.forhold, 2) + "</td>"; }).join("") + "</tr>" +
                "<tr><td>ganget med " + r.k + "</td>" + d.map(function (x) { return "<td>" + x.hel + "</td>"; }).join("") + "</tr></tbody></table>");
        }
        ud.push("<h4>Den empiriske formel</h4>");
        if (r.k === 1) {
            var beskriv = andre2.map(function (x) { return x.hel + " " + atomOrd(x.g, x.hel); });
            ud.push("<p>For hvert " + atomOrd(r.min.g, 1) + " er der " + liste(beskriv) + ". Tallene er hele, så trin 4 er ikke nødvendigt. Den empiriske formel er " + formel(d) + ".</p>");
        } else {
            ud.push("<p>Den empiriske formel er " + formel(d) + ".</p>");
        }
        if (r.M) {
            ud.push("<h4>Molekylformlen</h4>");
            ud.push("<p>Den empiriske formel har formelmassen</p>");
            ud.push('<p class="ligning"><i>M</i><sub>emp</sub> = (' + d.map(function (x) { return (x.hel > 1 ? x.hel + " · " : "") + x.g.Mtekst; }).join(" + ") + ") g/mol = " + F.dec(r.Memp, 2) + " g/mol</p>");
            ud.push("<p>Molarmassen divideres med formelmassen.</p>");
            ud.push('<p class="ligning">' + F.brok("<i>M</i>", "<i>M</i><sub>emp</sub>") + " = " + F.brok(F.som(r.M) + " g/mol", F.dec(r.Memp, 2) + " g/mol") + " = " + F.dec(r.faktor, 2) + "</p>");
            ud.push("<h4>Konklusion</h4>");
            if (r.hel === 1) ud.push("<p>Molarmassen er lig med formelmassen, så molekylformlen er den samme som den empiriske formel, " + formel(d) + ".</p>");
            else ud.push("<p>Molekylformlen er den empiriske formel ganget med " + r.hel + ". Stoffet har molekylformlen " + formel(d, r.hel) + ".</p>");
        }
        if (bDBE) ud.push(dbeHTML(bDBE, r.M ? "Molekylet" : "Et molekyl med den empiriske formel som molekylformel", !r.M));
        bes.innerHTML = ud.join("");
        F.trin(bes);
    }

    function decimaler(x) {
        // så mange decimaler, som eleven skrev (mindst én for resten)
        var r = raekker.filter(function (rr) { return findGrundstof(rr.sym) === x.g; })[0];
        var t = r ? r.pct.trim() : "";
        var m = t.match(/[.,](\d+)/);
        if (m) return m[1].length;
        if (t) return 0;
        // resten får lige så mange decimaler som det mest præcise tal
        var maks = 0;
        raekker.forEach(function (rr) { var mm = rr.pct.trim().match(/[.,](\d+)/); if (mm) maks = Math.max(maks, mm[1].length); });
        return maks;
    }

    function liste(a) {
        if (a.length <= 1) return a.join("");
        return a.slice(0, -1).join(", ") + " og " + a[a.length - 1];
    }

    function talOrd(k) { return ["nul", "en", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni"][k] || String(k); }

    function atomOrd(g, antal) {
        var stamme = g.navn + "atom";
        return antal === 1 ? stamme : stamme + "er";
    }


    function gram() { return F.$("#ea-type", rod).value === "g"; }

    /* ----- Dobbeltbindingsækvivalenter (A3.1) ------------------------------- */

    function dbe(data, gange) {
        var antal = {};
        data.forEach(function (d) { antal[d.g.sym] = d.hel * (gange || 1); });
        if (!antal.C) return null;
        var tilladt = ["C", "H", "N", "O", "S", "F", "Cl", "Br", "I"];
        if (Object.keys(antal).some(function (s) { return tilladt.indexOf(s) < 0; })) return null;
        var X = (antal.F || 0) + (antal.Cl || 0) + (antal.Br || 0) + (antal.I || 0);
        var H = (antal.H || 0) + X;
        return { C: antal.C, N: antal.N || 0, H: H, Hegen: antal.H || 0, X: X, v: (2 * antal.C + 2 + (antal.N || 0) - H) / 2 };
    }

    function dbeHTML(b, formelTekst, empirisk) {
        var ud = [];
        ud.push("<h4>Dobbeltbindingsækvivalenter</h4>");
        if (b.X) ud.push("<p>Et halogenatom tæller som et hydrogenatom, så H = " + b.Hegen + " + " + b.X + " = " + b.H + ".</p>");
        ud.push('<p class="ligning">DBE = ' + F.brok("2 · C + 2 + N " + F.MINUS + " H", "2") + " = " + F.brok("2 · " + b.C + " + 2 + " + b.N + " " + F.MINUS + " " + b.H, "2") + " = " + F.som(b.v) + "</p>");
        var hel = Math.abs(b.v - Math.round(b.v)) < 1e-9 && b.v >= 0;
        if (!hel) ud.push("<p>DBE er ikke et helt tal, der ikke er negativt. " + (empirisk ? "Den empiriske formel er derfor ikke selv en molekylformel." : "Tjek formlen.") + "</p>");
        else if (b.v === 0) ud.push("<p>" + formelTekst + " har ingen dobbeltbindinger og ingen ringe.</p>");
        else ud.push("<p>" + formelTekst + " har " + F.som(b.v) + " dobbeltbinding" + (b.v === 1 ? "" : "er") + " eller ring" + (b.v === 1 ? "" : "e") + " tilsammen, hvor en tripelbinding tæller 2." +
            (b.v >= 4 ? " Er DBE 4 eller mere, er det ofte tegn på en benzenring." : "") + "</p>");
        return ud.join("");
    }

    /* ----- Fra formel til masseprocent --------------------------------------- */

    function taelAtomer(formel) {
        // giver [[symbol, antal], ...] i den rækkefølge, grundstofferne står i formlen
        var s = F.formelNoegle(formel);
        if (!s || /[+-]$/.test(s)) return null;
        var orden = [], ialt = {};
        function laeg(sym, k) { if (!(sym in ialt)) { ialt[sym] = 0; orden.push(sym); } ialt[sym] += k; }
        var dele = s.split("∙");
        for (var d = 0; d < dele.length; d++) {
            var del = dele[d], gange = 1, m0 = del.match(/^(\d+)(.*)$/);
            if (m0 && d > 0) { gange = parseInt(m0[1], 10); del = m0[2]; }
            var stak = [[]], i = 0;
            while (i < del.length) {
                var c = del.charAt(i);
                if (c === "(" || c === "[") { stak.push([]); i++; continue; }
                if (c === ")" || c === "]") {
                    if (stak.length < 2) return null;
                    var top = stak.pop(); i++;
                    var tal = del.slice(i).match(/^\d+/), k = tal ? parseInt(tal[0], 10) : 1;
                    if (tal) i += tal[0].length;
                    top.forEach(function (e) { stak[stak.length - 1].push([e[0], e[1] * k]); });
                    continue;
                }
                var m = del.slice(i).match(/^([A-Z][a-z]?)(\d*)/);
                if (!m || !SYMBOL[m[1]]) return null;
                stak[stak.length - 1].push([m[1], m[2] ? parseInt(m[2], 10) : 1]);
                i += m[0].length;
            }
            if (stak.length !== 1) return null;
            stak[0].forEach(function (e) { laeg(e[0], e[1] * gange); });
        }
        return orden.map(function (sym) { return [sym, ialt[sym]]; });
    }

    function beregnOmvendt() {
        var felt = F.$("#eo-formel", rod), tekst = felt.value.trim();
        var res = F.$("#eo-resultater", rod), bes = F.$("#eo-besvarelse", rod), fejlEl = F.$("#eo-fejl", rod);
        var atomer = tekst ? taelAtomer(tekst) : null;
        fejlEl.hidden = !(tekst && !atomer);
        fejlEl.innerHTML = tekst && !atomer ? "<li>Formlen kan ikke læses. Skriv den fx som C6H12O6 eller CuSO4·5H2O, uden ladning.</li>" : "";
        F.$("#eo-resultatboks", rod).hidden = !atomer;
        F.$("#eo-besvarelsesboks", rod).hidden = !atomer;
        if (!atomer) { res.innerHTML = ""; bes.innerHTML = ""; return; }
        var fHTML = F.formelHTML(tekst);
        var M = atomer.reduce(function (a, e) { return a + e[1] * SYMBOL[e[0]].M; }, 0);
        var rk = ["<tr><th>Molarmasse</th><td class=\"res\">" + F.dec(M, 2) + " g/mol</td><td></td></tr>"];
        var ud = ["<h4>Molarmassen</h4>"];
        ud.push('<p class="ligning"><i>M</i>(' + fHTML + ") = (" + atomer.map(function (e) { return (e[1] > 1 ? e[1] + " · " : "") + SYMBOL[e[0]].Mtekst; }).join(" + ") + ") g/mol = " + F.dec(M, 2) + " g/mol</p>");
        ud.push("<h4>Masseprocenterne</h4>");
        ud.push("<p>Masseprocenten af et grundstof er massen af grundstoffet i ét mol stof divideret med molarmassen.</p>");
        atomer.forEach(function (e) {
            var g = SYMBOL[e[0]], m = e[1] * g.M, p = m / M * 100;
            rk.push("<tr><th>" + g.navn.charAt(0).toUpperCase() + g.navn.slice(1) + "</th><td class=\"res\">" + F.dec(p, 2) + " %</td><td>" + e[1] + " " + atomOrd(g, e[1]) + "</td></tr>");
            ud.push('<p class="ligning"><i>m</i>%(' + e[0] + ") = " + F.brok((e[1] > 1 ? e[1] + " · " : "") + g.Mtekst + " g/mol", F.dec(M, 2) + " g/mol") + " · 100 % = " + F.dec(p, 2) + " %</p>");
        });
        var b = dbe(atomer.map(function (e) { return { g: SYMBOL[e[0]], hel: e[1] }; }));
        if (b) { rk.push("<tr><th>DBE</th><td class=\"res\">" + F.som(b.v) + "</td><td>Dobbeltbindingsækvivalenter</td></tr>"); ud.push(dbeHTML(b, fHTML, false)); }
        res.innerHTML = rk.join("");
        bes.innerHTML = ud.join("");
        F.trin(bes);
    }

    /* ----- Husk og start ---------------------------------------------------- */

    function gem() {
        F.husk("empirisk", { raekker: raekker.map(function (r) { return { sym: r.sym, pct: r.pct }; }), M: F.$("#ea-M", rod).value,
            type: F.$("#ea-type", rod).value, mprove: F.$("#ea-mprove", rod).value, omvendt: F.$("#eo-formel", rod).value,
            fane: F.$('.underfane[aria-selected="true"]', rod) ? F.$('.underfane[aria-selected="true"]', rod).dataset.fane : "frem" });
    }

    function start() {
        rod = document.getElementById("empirisk");
        if (!rod) return;
        krop = F.$("#ea-tabel tbody", rod);
        var data = F.husk("empirisk");
        if (data && data.raekker && data.raekker.length) {
            raekker = data.raekker.map(nyRaekke);
            F.$("#ea-M", rod).value = data.M || "";
            if (data.type) F.$("#ea-type", rod).value = data.type;
            F.$("#ea-mprove", rod).value = data.mprove || "";
            F.$("#eo-formel", rod).value = data.omvendt || "";
        } else {
            raekker = [nyRaekke(), nyRaekke(), nyRaekke(), nyRaekke()];
        }
        tegn();
        F.$("#ea-M", rod).addEventListener("input", beregn);
        F.$("#ea-mprove", rod).addEventListener("input", beregn);
        F.$("#ea-type", rod).addEventListener("change", function () { beregn(); });
        F.$("#eo-formel", rod).addEventListener("input", function () { beregnOmvendt(); gem(); });
        F.$("#eo-kopier", rod).addEventListener("click", function () { F.kopier(F.$("#eo-besvarelse", rod), this); });
        function visFane(navn) {
            F.$$(".underfane", rod).forEach(function (k) { k.setAttribute("aria-selected", k.dataset.fane === navn ? "true" : "false"); });
            F.$$(".underpanel", rod).forEach(function (pn) { pn.hidden = pn.dataset.fane !== navn; });
        }
        F.$$(".underfane", rod).forEach(function (k) { k.addEventListener("click", function () { visFane(k.dataset.fane); gem(); }); });
        visFane(data && data.fane === "omvendt" ? "omvendt" : "frem");
        beregnOmvendt();
        F.$("#ea-plus", rod).addEventListener("click", function () { raekker.push(nyRaekke()); tegn(); beregn(); });
        F.$("#ea-kopier", rod).addEventListener("click", function () { F.kopier(F.$("#ea-besvarelse", rod), this); });
        F.$("#ea-ryd", rod).addEventListener("click", function () {
            raekker = [nyRaekke(), nyRaekke(), nyRaekke(), nyRaekke()];
            F.$("#ea-M", rod).value = "";
            tegn(); beregn();
        });
        beregn();
    }

    document.addEventListener("DOMContentLoaded", start);
})();
