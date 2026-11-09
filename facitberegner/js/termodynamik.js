/* =====================================================================
   termodynamik.js - facit til ΔH°, ΔS°, ΔG°, K, Y og ΔG

   Regner som arket Termodynamik i superskabelonen, men skriver
   besvarelsen som Kemibogen A (kapitel A2): tabel med tabelværdier,
   formel, beregning og konklusion, ⊖ for standardtilstand,
   R = 8,314 J/(mol · K) og T = (273 + t) K.
   ===================================================================== */
(function () {
    "use strict";

    var F = window.FACIT;
    var R = 8.314;
    var MAKS = 6;                       // højst seks stoffer på hver side
    var TILSTANDE = ["g", "l", "s", "aq"];

    /* ----- Databogen ---------------------------------------------------- */

    var INDEKS = {}, NAVNE = {};
    (window.TERMODATA || []).forEach(function (r, i) {
        var stof = { i: i, f: r[0], navn: r[3], triv: r[4], st: r[5], variant: r[6], M: r[7], H: r[8], S: r[9], G: r[10] };
        [r[0], r[1], r[2]].forEach(function (k) {
            k = F.formelNoegle(k);
            if (!k) return;
            (INDEKS[k] = INDEKS[k] || []);
            if (INDEKS[k].indexOf(stof) < 0) INDEKS[k].push(stof);
        });
        [r[3], r[4]].forEach(function (n) {
            n = (n || "").toLowerCase().replace(/\s+/g, "");
            if (!n) return;
            (NAVNE[n] = NAVNE[n] || []).push(stof);
        });
    });

    /* Kemibogen A's tabel (bilaget Termodynamiske data) */
    var KB = {}, KBNAVNE = {};
    (window.TERMODATA_KEMIBOGEN || []).forEach(function (r) {
        var stof = { f: r[0], navn: r[2], triv: "", st: r[3], variant: "", M: null, H: r[4], S: r[5], G: r[6], kb: true };
        [r[0], r[1]].forEach(function (k) {
            k = F.formelNoegle(k);
            if (!k) return;
            (KB[k] = KB[k] || []);
            if (KB[k].indexOf(stof) < 0) KB[k].push(stof);
        });
        (KBNAVNE[r[2].toLowerCase().replace(/\s+/g, "")] = KBNAVNE[r[2].toLowerCase().replace(/\s+/g, "")] || []).push(stof);
    });

    function tabelKilde() { var el = rod && F.$("#td-kilde", rod); return el ? el.value : "db"; }

    function slaaOp(formel, tilstand) {
        var k = F.formelNoegle(formel);
        if (!k) return { alle: [], passer: [] };
        var db = INDEKS[k] || NAVNE[k.toLowerCase()] || [];
        var dbPasser = tilstand ? db.filter(function (s) { return s.st === tilstand; }) : [];
        if (tabelKilde() === "kb") {
            var kb = KB[k] || KBNAVNE[k.toLowerCase()] || [];
            var kbPasser = tilstand ? kb.filter(function (s) { return s.st === tilstand; }) : [];
            if (kbPasser.length) return { alle: kb.concat(db), passer: kbPasser };
            return { alle: kb.concat(db), passer: dbPasser, ikkeIKB: true };
        }
        return { alle: db, passer: dbPasser };
    }

    /* Molarmasse ud fra en formel (bruges, hvis databogen ikke har den) */
    var ATOMMASSE = {};
    (window.GRUNDSTOFFER || []).forEach(function (g) { ATOMMASSE[g[1]] = g[3]; });
    function molarmasse(formel) {
        // kun neutrale stoffer (salte); ioner giver null
        var s = F.formelNoegle(formel);
        if (!s || /[+-]$/.test(s)) return null;
        var dele = s.split("∙"), total = 0;
        for (var d = 0; d < dele.length; d++) {
            var del = dele[d], gange = 1, m0 = del.match(/^(\d+)(.*)$/);
            if (m0 && d > 0) { gange = parseInt(m0[1], 10); del = m0[2]; }
            var stak = [{}], i = 0;
            while (i < del.length) {
                var c = del.charAt(i);
                if (c === "(" || c === "[") { stak.push({}); i++; continue; }
                if (c === ")" || c === "]") {
                    var top = stak.pop(); i++;
                    var tal = del.slice(i).match(/^\d+/); var k = tal ? parseInt(tal[0], 10) : 1; if (tal) i += tal[0].length;
                    Object.keys(top).forEach(function (e) { stak[stak.length - 1][e] = (stak[stak.length - 1][e] || 0) + top[e] * k; });
                    continue;
                }
                var m = del.slice(i).match(/^([A-Z][a-z]?)(\d*)/);
                if (!m) return null;
                if (ATOMMASSE[m[1]] === undefined) return null;
                stak[stak.length - 1][m[1]] = (stak[stak.length - 1][m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
                i += m[0].length;
            }
            var bund = stak[0];
            Object.keys(bund).forEach(function (e) { total += gange * bund[e] * ATOMMASSE[e]; });
        }
        return total || null;
    }

    /* ----- Skemaet med stoffer ------------------------------------------- */

    var rod, tabelKrop, stoffer = [];

    function nytStof(side, data) {
        data = data || {};
        return { side: side, koef: data.koef || "", formel: data.formel || "", tilstand: data.tilstand || "",
                 H: data.H || "", S: data.S || "", G: data.G || "", a: data.a || "", valg: data.valg || 0 };
    }

    function standard() {
        return [nytStof("r"), nytStof("r"), nytStof("p"), nytStof("p")];
    }

    function tegnSkema() {
        tabelKrop.innerHTML = "";
        ["r", "p"].forEach(function (side) {
            var her = stoffer.filter(function (s) { return s.side === side; });
            var del = document.createElement("tr");
            del.className = "skema-del";
            del.innerHTML = '<th colspan="8">' + (side === "r" ? "Reaktanter" : "Produkter") + "</th>";
            tabelKrop.appendChild(del);
            her.forEach(function (s) { tabelKrop.appendChild(raekke(s)); });
            var plus = document.createElement("tr");
            plus.className = "skema-plus";
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "knap-lille";
            knap.textContent = side === "r" ? "+ Reaktant" : "+ Produkt";
            knap.disabled = her.length >= MAKS;
            knap.addEventListener("click", function () {
                var sidste = stoffer.map(function (x) { return x.side; }).lastIndexOf(side);
                stoffer.splice(sidste + 1, 0, nytStof(side));
                tegnSkema(); beregn();
            });
            var td = document.createElement("td");
            td.colSpan = 8;
            td.appendChild(knap);
            plus.appendChild(td);
            tabelKrop.appendChild(plus);
        });
    }

    function felt(s, navn, klasse, etiket) {
        var inp = document.createElement("input");
        inp.type = "text";
        inp.className = klasse;
        inp.value = s[navn];
        inp.setAttribute("aria-label", etiket);
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.addEventListener("input", function () { s[navn] = inp.value; if (navn === "formel") s.valg = 0; beregn(); });
        return inp;
    }

    function raekke(s) {
        var tr = document.createElement("tr");
        tr.className = "stof";
        s.tr = tr;

        var tdK = document.createElement("td");
        tdK.appendChild(felt(s, "koef", "f-koef", "Koefficient"));
        s.koefFelt = tdK.firstChild;
        s.koefFelt.placeholder = "1";

        var tdF = document.createElement("td");
        tdF.className = "td-formel";
        var fInp = felt(s, "formel", "f-formel", "Kemisk formel eller navn");
        fInp.placeholder = "fx NH3";
        tdF.appendChild(fInp);
        s.status = document.createElement("div");
        s.status.className = "stof-status";
        tdF.appendChild(s.status);

        var tdT = document.createElement("td");
        var sel = document.createElement("select");
        sel.className = "f-tilstand";
        sel.setAttribute("aria-label", "Tilstandsform");
        sel.innerHTML = '<option value="">vælg</option>' + TILSTANDE.map(function (t) {
            return '<option value="' + t + '">' + t + "</option>";
        }).join("");
        sel.value = s.tilstand;
        sel.addEventListener("change", function () { s.tilstand = sel.value; s.valg = 0; beregn(); });
        tdT.appendChild(sel);

        var tdH = document.createElement("td"); s.hFelt = felt(s, "H", "f-tal", "H° i kJ/mol"); tdH.appendChild(s.hFelt);
        var tdS = document.createElement("td"); s.sFelt = felt(s, "S", "f-tal", "S° i J/(mol · K)"); tdS.appendChild(s.sFelt);
        var tdG = document.createElement("td"); s.gFelt = felt(s, "G", "f-tal", "G° i kJ/mol"); tdG.appendChild(s.gFelt);
        var tdA = document.createElement("td"); s.aFelt = felt(s, "a", "f-tal", "Partialtryk i bar eller koncentration i M"); tdA.appendChild(s.aFelt);

        var tdX = document.createElement("td");
        var fjern = document.createElement("button");
        fjern.type = "button";
        fjern.className = "fjern";
        fjern.title = "Fjern stoffet";
        fjern.setAttribute("aria-label", "Fjern stoffet");
        fjern.textContent = "×";
        fjern.addEventListener("click", function () {
            stoffer.splice(stoffer.indexOf(s), 1);
            tegnSkema(); beregn();
        });
        tdX.appendChild(fjern);

        [tdK, tdF, tdT, tdH, tdS, tdG, tdA, tdX].forEach(function (td) { tr.appendChild(td); });
        return tr;
    }

    /* ----- Reaktionsskema som tekst -------------------------------------- */

    function laesKoef(t) {
        if (!t) return "";
        if (t === "½") return "0,5";
        var m = t.match(/^(\d+)\/(\d+)$/);
        if (m) return String(parseInt(m[1], 10) / parseInt(m[2], 10)).replace(".", ",");
        return t;
    }

    function delSide(tekst) {
        var ud = [];
        var t = tekst.replace(/\(\s*(aq|g|l|s)\s*\)/gi, function (_, x) { return "(" + x.toLowerCase() + ")"; });
        if (/\((aq|g|l|s)\)/.test(t)) {
            var stykker = t.split(/(\((?:aq|g|l|s)\))/);
            for (var i = 0; i < stykker.length - 1; i += 2) {
                var stykke = stykker[i].replace(/^\s*\+\s*/, "").trim();
                if (stykke) ud.push({ tekst: stykke, tilstand: stykker[i + 1].slice(1, -1) });
            }
        } else {
            t.split(/\s\+\s/).forEach(function (stykke) {
                stykke = stykke.trim();
                if (stykke) ud.push({ tekst: stykke, tilstand: "" });
            });
        }
        return ud.map(function (d) {
            var m = d.tekst.match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?|½)\s*(?=[A-Z(\[⁺⁻]|[a-z]{3,})/);
            var koef = m ? laesKoef(m[1]) : "";
            var formel = m ? d.tekst.slice(m[0].length).trim() : d.tekst;
            return { koef: koef === "1" ? "" : koef, formel: formel, tilstand: d.tilstand };
        });
    }

    function indsaetSkema() {
        var felt = F.$("#td-skema-tekst", rod);
        var besked = F.$("#td-skema-besked", rod);
        var tekst = felt.value.trim();
        var dele = tekst.split(/\s*(?:→|⟶|⇌|⇄|<=>|<->|->|=>)\s*/);
        if (dele.length === 1) dele = tekst.split(/\s+=\s+/);
        if (dele.length !== 2 || !dele[0] || !dele[1]) {
            besked.textContent = "Skemaet skal have én reaktionspil, fx N2(g) + 3 H2(g) → 2 NH3(g).";
            return;
        }
        var r = delSide(dele[0]), p = delSide(dele[1]);
        if (r.length > MAKS || p.length > MAKS) {
            besked.textContent = "Der kan højst være " + MAKS + " stoffer på hver side.";
            return;
        }
        stoffer = r.map(function (d) { return nytStof("r", d); }).concat(p.map(function (d) { return nytStof("p", d); }));
        tegnSkema();
        beregn();
        var mangler = stoffer.filter(function (s) { return !s.tilstand; }).length;
        besked.textContent = "Skemaet er sat ind med " + r.length + (r.length === 1 ? " reaktant" : " reaktanter") +
            " og " + p.length + (p.length === 1 ? " produkt." : " produkter.") +
            (mangler ? " Vælg tilstandsformen for de stoffer, der mangler den." : "");
    }

    /* ----- Beregningen ----------------------------------------------------- */

    function koefTekst(k) {
        if (k === 0.5) return "½";
        return F.som(k);
    }

    function stofHTML(s) {
        return F.formelHTML(s.vis) + "(" + s.tilstand + ")";
    }

    function gennemgaa() {
        // Læser skemaet og slår stofferne op. Giver en liste med det, der skal regnes på.
        var liste = [], fejl = [], mangler = 0;
        stoffer.forEach(function (s) {
            var tom = !s.formel.trim();
            var opslag = slaaOp(s.formel, s.tilstand);
            var stof = null;
            if (opslag.passer.length) stof = opslag.passer[Math.min(s.valg, opslag.passer.length - 1)];
            // status under formlen
            var st = "";
            s.tr.classList.remove("fundet", "ikke-fundet");
            if (tom) {
                st = "";
            } else if (!s.tilstand) {
                st = opslag.alle.length ? "Vælg tilstandsform (findes som " + unik(opslag.alle.map(function (x) { return x.st; })).join(", ") + ")" : "Vælg tilstandsform";
            } else if (stof) {
                s.tr.classList.add("fundet");
                if (opslag.passer.length > 1) {
                    st = '<select class="f-valg" aria-label="Vælg stof">' + opslag.passer.map(function (x, i) {
                        return '<option value="' + i + '"' + (i === s.valg ? " selected" : "") + ">" + F.esc(stofNavn(x)) + "</option>";
                    }).join("") + "</select>";
                } else {
                    st = F.esc(stofNavn(stof));
                }
                if (tabelKilde() === "kb") st += stof.kb ? " (Kemibogens tabel)" : '<span class="hul"> Ikke i Kemibogens tabel, så værdierne er fra databogen.</span>';
                var huller = [["H", stof.H], ["S", stof.S], ["G", stof.G]].filter(function (x) { return x[1] === null; })
                    .map(function (x) { return "<i>" + x[0] + "</i><sup>⊖</sup>"; });
                if (huller.length) st += '<span class="hul"> ' + (stof.kb ? "Tabellen" : "Databogen") + " mangler " + huller.join(" og ") + ".</span>";
            } else {
                s.tr.classList.add("ikke-fundet");
                st = opslag.alle.length ? "Ikke i databogen som (" + s.tilstand + "). Findes som " + unik(opslag.alle.map(function (x) { return x.st; })).join(", ") + "." : "Ikke i databogen. Skriv selv værdierne.";
            }
            if (s.status.dataset.html !== st) {
                s.status.innerHTML = st;
                s.status.dataset.html = st;
                var valg = s.status.querySelector("select");
                if (valg) valg.addEventListener("change", function () { s.valg = parseInt(valg.value, 10); beregn(); });
            }
            // databogens værdier som grå tekst i felterne
            s.hFelt.placeholder = stof && stof.H !== null ? F.som(stof.H).replace(/<[^>]+>/g, "") : "";
            s.sFelt.placeholder = stof && stof.S !== null ? F.som(stof.S).replace(/<[^>]+>/g, "") : "";
            s.gFelt.placeholder = stof && stof.G !== null ? F.som(stof.G).replace(/<[^>]+>/g, "") : "";
            s.aFelt.disabled = s.tilstand === "s" || s.tilstand === "l";
            s.aFelt.placeholder = s.tilstand === "g" ? "bar" : s.tilstand === "aq" ? "M" : "";
            if (tom) return;

            var koef = s.koef.trim() === "" ? 1 : F.tal(s.koef);
            if (koef === null || isNaN(koef) || koef <= 0) fejl.push("Koefficienten for " + F.formelHTML(s.formel) + " skal være et positivt tal.");
            if (!s.tilstand) mangler++;
            function vaerdi(egen, tabel, navn) {
                var x = F.tal(egen);
                if (x !== null && isNaN(x)) { fejl.push(navn + " for " + F.formelHTML(s.formel) + " er ikke et tal."); return null; }
                if (x !== null) return { v: x, egen: true };
                return tabel !== null && tabel !== undefined ? { v: tabel, egen: false } : null;
            }
            var a = F.tal(s.a);
            if (a !== null && (isNaN(a) || a < 0)) { fejl.push("Partialtryk og koncentrationer skal være tal, der ikke er negative, og uden enhed."); a = null; }
            var dbM = null;
            if (stof && stof.M) dbM = stof.M;
            else { var dbStof = (INDEKS[F.formelNoegle(stof ? stof.f : s.formel)] || []).filter(function (x) { return x.st === s.tilstand && x.M; })[0]; if (dbStof) dbM = dbStof.M; }
            liste.push({
                side: s.side, koef: koef, tilstand: s.tilstand,
                vis: stof ? stof.f : s.formel.trim(),
                navn: stof ? stofNavn(stof) : "",
                kb: !!(stof && stof.kb),
                M: dbM || molarmasse(stof ? stof.f : s.formel),
                H: vaerdi(s.H, stof && stof.H, "H°"),
                S: vaerdi(s.S, stof && stof.S, "S°"),
                G: vaerdi(s.G, stof && stof.G, "G°"),
                a: (s.tilstand === "g" || s.tilstand === "aq") ? a : null,
                aTekst: s.a.trim().replace(".", ",").replace(/^-/, F.MINUS)
            });
        });
        return { liste: liste, fejl: fejl, mangler: mangler };
    }

    function unik(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

    function stofNavn(x) {
        var n = x.navn || "";
        if (x.triv) n += n ? " (" + x.triv + ")" : x.triv;
        if (x.variant) n += ", " + x.variant;
        return n || x.f;
    }

    function sum(liste, felt) {
        // Σ produkter − Σ reaktanter; null hvis en værdi mangler
        var t = 0;
        for (var i = 0; i < liste.length; i++) {
            var s = liste[i];
            if (!s[felt]) return null;
            t += (s.side === "p" ? 1 : -1) * s.koef * s[felt].v;
        }
        return t;
    }

    function laesFelt(id) {
        var x = F.tal(F.$(id, rod).value);
        return x === null || isNaN(x) ? (x === null ? null : NaN) : x;
    }

    function somSkrevet(raa, x) {
        return window.FACIT_SB ? window.FACIT_SB.somSkrevet(raa, x) : F.som(x);
    }

    /* ----- Målinger af K ved flere temperaturer: lineær regression ---------- */

    function regression(tekst, enhed, fejl) {
        var linjer = (tekst || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
        var pts = [];
        linjer.forEach(function (l) {
            var dele;
            if (/\t/.test(l)) dele = l.split(/\t+/);
            else if (/;/.test(l)) dele = l.split(/\s*;\s*/);
            else { var m = l.split(/\s+/); dele = [m[0], m.slice(1).join(" ")]; }
            if (dele.length < 2 || !dele[1]) return;
            var t = F.tal(dele[0]), K = F.tal(dele[1]);
            if (t === null || K === null || isNaN(t) || isNaN(K)) {
                if (!/[a-zæøå]{2,}/i.test(l)) fejl.push("Linjen \"" + F.esc(l) + "\" kan ikke læses som en temperatur og en ligevægtskonstant.");
                return;
            }
            if (K <= 0) { fejl.push("<i>K</i> skal være større end 0 i alle målinger."); return; }
            var T = enhed === "C" ? 273 + t : t;
            if (T <= 0) { fejl.push("Temperaturerne skal være over 0 K."); return; }
            pts.push({ t: t, tTekst: somSkrevet(dele[0], t), T: T, K: K, kTekst: somSkrevet(dele[1], K), x: 1 / T, y: Math.log(K) });
        });
        if (pts.length < 2) { if (linjer.length && !fejl.length) fejl.push("Der skal være mindst to målinger af <i>K</i>."); return null; }
        var nn = pts.length, mx = 0, my = 0;
        pts.forEach(function (q) { mx += q.x / nn; my += q.y / nn; });
        var sxx = 0, sxy = 0, syy = 0;
        pts.forEach(function (q) { sxx += (q.x - mx) * (q.x - mx); sxy += (q.x - mx) * (q.y - my); syy += (q.y - my) * (q.y - my); });
        if (sxx === 0) { fejl.push("Målingerne skal være ved forskellige temperaturer."); return null; }
        var a = sxy / sxx, b = my - a * mx;
        var ssr = 0;
        pts.forEach(function (q) { var e = q.y - (a * q.x + b); ssr += e * e; });
        return { pts: pts, a: a, b: b, r2: syy > 0 ? 1 - ssr / syy : 1, enhed: enhed };
    }

    /* ----- Ligevægten med et SÆL-skema ---------------------------------------- */

    function sael(r, rentVand) {
        var lnK = r.K.lnK;
        if (Math.abs(lnK) > 690) return { fejl: "<i>K</i> er så stor eller så lille, at ligevægten ikke kan regnes med tal." };
        var K = Math.exp(lnK);
        var arter = r.liste.map(function (s) {
            var aktiv = s.tilstand === "g" || s.tilstand === "aq";
            return { s: s, aktiv: aktiv, nu: s.koef, fortegn: s.side === "p" ? 1 : -1, a0: aktiv ? (rentVand ? 0 : s.a) : null };
        });
        var aktive = arter.filter(function (q) { return q.aktiv; });
        var prodNul = aktive.some(function (q) { return q.fortegn > 0 && q.a0 === 0; });
        var reakNul = aktive.some(function (q) { return q.fortegn < 0 && q.a0 === 0; });
        var dir;
        if (prodNul && reakNul) return { fejl: "Både en reaktant og et produkt mangler fra start, så reaktionen kan ikke komme i gang i nogen retning." };
        if (prodNul) dir = 1;
        else if (reakNul) dir = -1;
        else {
            var lnY0 = 0;
            aktive.forEach(function (q) { lnY0 += q.fortegn * q.nu * Math.log(q.a0); });
            dir = lnY0 < lnK - 1e-12 ? 1 : lnY0 > lnK + 1e-12 ? -1 : 0;
        }
        if (dir === 0) return { ligevaegt: true };
        arter.forEach(function (q) { q.d = dir * q.fortegn * q.nu; });
        function H(x) {   // voksende i x
            var h = -lnK;
            for (var i = 0; i < aktive.length; i++) {
                var e = aktive[i].a0 + aktive[i].d * x;
                if (e <= 0) return aktive[i].d < 0 ? Infinity : -Infinity;
                h += aktive[i].fortegn * aktive[i].nu * Math.log(e);
            }
            return dir * h;
        }
        var xmax = Infinity;
        aktive.forEach(function (q) { if (q.d < 0) xmax = Math.min(xmax, q.a0 / -q.d); });
        var lo = 0, hi = isFinite(xmax) ? xmax : 1;
        if (!isFinite(xmax)) { var k = 0; while (H(hi) < 0 && k++ < 400) hi *= 2; }
        for (var it = 0; it < 300; it++) { var mid = (lo + hi) / 2; if (H(mid) < 0) lo = mid; else hi = mid; }
        var x = (lo + hi) / 2;
        aktive.forEach(function (q) { q.lig = q.a0 + q.d * x; });

        // alle løsninger, som et CAS-værktøj ville give dem (kun hele koefficienter)
        var helt = aktive.every(function (q) { return Math.abs(q.nu - Math.round(q.nu)) < 1e-9; });
        var roedder = [x];
        if (helt) {
            var P = function (y) {
                var tael = 1, naev = 1;
                aktive.forEach(function (q) { var e = Math.pow(q.a0 + q.d * y, Math.round(q.nu)); if (q.fortegn > 0) tael *= e; else naev *= e; });
                return dir > 0 ? tael - K * naev : naev * K - tael;
            };
            var L = 20 * (Math.max.apply(null, aktive.map(function (q) { return q.a0; }).concat([x])) + 1);
            var xs = [];
            for (var i2 = 0; i2 <= 4000; i2++) xs.push(-L + 2 * L * i2 / 4000);
            for (var e10 = -16; e10 <= Math.log10(L); e10 += 0.05) { xs.push(Math.pow(10, e10)); xs.push(-Math.pow(10, e10)); }
            xs.push(0);
            xs.sort(function (a, b) { return a - b; });
            roedder = [];
            for (var j = 0; j < xs.length - 1; j++) {
                var a1 = xs[j], b1 = xs[j + 1], fa = P(a1), fb = P(b1);
                if (fa === 0) { roedder.push(a1); continue; }
                if (fa * fb < 0) {
                    for (var t2 = 0; t2 < 200; t2++) { var m2 = (a1 + b1) / 2, fm = P(m2); if (fa * fm <= 0) { b1 = m2; fb = fm; } else { a1 = m2; fa = fm; } }
                    roedder.push((a1 + b1) / 2);
                }
            }
            roedder = roedder.filter(function (y, i) { return !roedder.slice(0, i).some(function (z) { return Math.abs(z - y) <= 1e-9 * Math.max(1, Math.abs(y)); }); });
            if (!roedder.some(function (y) { return Math.abs(y - x) <= 1e-6 * Math.max(Math.abs(x), 1e-12); })) roedder.push(x);
            roedder.sort(function (a, b) { return b - a; });
        }
        var K_sym = r.oploes ? "<i>K</i><sub>o</sub>" : r.eBarBrugt ? "<i>K</i><sub>p</sub>" : "<i>K</i><sub>c</sub>";
        return { dir: dir, x: x, arter: arter, aktive: aktive, roedder: roedder, K: K, Ksym: K_sym, enhed: r.eBarBrugt ? "bar" : "M", rentVand: rentVand };
    }

    function beregn() {
        var n = Math.round(F.tal(F.$("#td-cifre", rod).value) || 3);
        n = Math.max(2, Math.min(7, n));
        var g = gennemgaa();
        var liste = g.liste, fejl = g.fejl;
        var r = { n: n, liste: liste };
        var harR = liste.some(function (s) { return s.side === "r"; });
        var harP = liste.some(function (s) { return s.side === "p"; });
        r.skemaOK = harR && harP && !fejl.length && !g.mangler;

        // temperatur
        var tInd = laesFelt("#td-temp");
        var enhed = F.$("#td-temp-enhed", rod).value;
        if (tInd !== null && isNaN(tInd)) fejl.push("Temperaturen er ikke et tal.");
        if (tInd !== null && !isNaN(tInd)) {
            r.Tgivet = true;
            r.tC = enhed === "C" ? tInd : null;
            r.T = enhed === "C" ? 273 + tInd : tInd;
            if (r.T <= 0) { fejl.push("Temperaturen skal være over 0 K."); r.T = null; }
        } else {
            r.Tgivet = false;
            r.T = 298;
        }

        // oplyst i opgaven og data fra grafer
        var oH = laesFelt("#td-oH"), oS = laesFelt("#td-oS"), oK = laesFelt("#td-oK");
        var gA = laesFelt("#td-gA"), gB = laesFelt("#td-gB"), vA = laesFelt("#td-vA"), vB = laesFelt("#td-vB");
        [oH, oS, oK, gA, gB, vA, vB].forEach(function (x) { if (x !== null && isNaN(x)) fejl.push("Et af felterne under opgavens oplysninger er ikke et tal."); });
        if ((gA !== null || gB !== null) && (vA !== null || vB !== null)) fejl.push("Brug kun data fra én graf ad gangen.");
        if (oK !== null && oK <= 0) fejl.push("K skal være et positivt tal.");

        // målinger af K ved flere temperaturer
        r.reg = regression(F.$("#td-kdata", rod).value, F.$("#td-kdata-enhed", rod).value, fejl);
        if (r.reg && (gA !== null || gB !== null || vA !== null || vB !== null)) fejl.push("Brug enten en graf eller målingerne af <i>K</i>, ikke begge.");

        // ΔH°
        if (oH !== null && !isNaN(oH)) r.dH = { v: oH, kilde: "opgave" };
        else if (gB !== null && !isNaN(gB)) r.dH = { v: gB, kilde: "G-graf", b: gB };
        else if (vA !== null && !isNaN(vA)) r.dH = { v: -vA * R / 1000, kilde: "vH-graf", a: vA };
        else if (r.reg) r.dH = { v: -r.reg.a * R / 1000, kilde: "vH-data" };
        else if (r.skemaOK) { var h = sum(liste, "H"); if (h !== null) r.dH = { v: h, kilde: "tabel" }; }
        // ΔS°
        if (oS !== null && !isNaN(oS)) r.dS = { v: oS, kilde: "opgave" };
        else if (gA !== null && !isNaN(gA)) r.dS = { v: -gA * 1000, kilde: "G-graf", a: gA };
        else if (vB !== null && !isNaN(vB)) r.dS = { v: vB * R, kilde: "vH-graf", b: vB };
        else if (r.reg) r.dS = { v: r.reg.b * R, kilde: "vH-data" };
        else if (r.skemaOK) { var sS = sum(liste, "S"); if (sS !== null) r.dS = { v: sS, kilde: "tabel" }; }
        // ΔG° ud fra tabellens G° (298 K)
        if (r.skemaOK) { var gg = sum(liste, "G"); if (gg !== null) r.dG298 = gg; }

        // ΔG° ved T
        if (r.T && r.dH && r.dS) r.dGT = { v: r.dH.v - r.T * r.dS.v / 1000, kilde: "HS" };
        else if (r.T === 298 && r.dG298 !== undefined) r.dGT = { v: r.dG298, kilde: "G" };
        // K
        if (oK !== null && !isNaN(oK) && oK > 0) {
            r.K = { lnK: Math.log(oK), kilde: "opgave", tekst: somSkrevet(F.$("#td-oK", rod).value, oK) };
            if (!r.dGT && r.T) r.dGT = { v: -R * r.T * Math.log(oK) / 1000, kilde: "K" };
        } else if (r.dGT && r.T) {
            r.K = { lnK: -r.dGT.v * 1000 / (R * r.T), kilde: "beregnet" };
        }
        // temperaturen, hvor ΔG° = 0
        if (r.dH && r.dS && r.dS.v !== 0) r.Tnul = r.dH.v * 1000 / r.dS.v;

        // reaktionsbrøken og enheden
        if (r.skemaOK) {
            var eBar = 0, eM = 0, alleA = true, lnY = 0, antal = 0;
            liste.forEach(function (s) {
                var fortegn = s.side === "p" ? 1 : -1;
                if (s.tilstand === "g") eBar += fortegn * s.koef;
                if (s.tilstand === "aq") eM += fortegn * s.koef;
                if (s.tilstand === "g" || s.tilstand === "aq") {
                    antal++;
                    if (s.a === null) alleA = false; else if (s.a > 0) lnY += fortegn * s.koef * Math.log(s.a);
                }
            });
            r.eBar = eBar; r.eM = eM;
            r.eBarBrugt = liste.some(function (s) { return s.tilstand === "g"; });
            r.eMBrugt = liste.some(function (s) { return s.tilstand === "aq"; });
            r.harY = antal > 0;
            var nul = liste.some(function (s) { return (s.tilstand === "g" || s.tilstand === "aq") && s.a === 0; });
            if (antal > 0 && alleA && !nul) r.lnY = lnY;
            var nogleA = liste.some(function (s) { return s.a !== null; });
            if (nogleA && !alleA) fejl.push("Skriv partialtryk eller koncentration for alle gasser og opløste stoffer, før <i>Y</i> og ligevægten kan beregnes. Skriv 0 for et stof, der ikke er der fra start.");
            if (r.lnY !== undefined && r.dGT && r.T) r.dG = r.dGT.v + R / 1000 * r.T * r.lnY;

            // opløsning af et salt: ét fast stof bliver til ioner i vand
            var reak = liste.filter(function (s) { return s.side === "r"; }), prod = liste.filter(function (s) { return s.side === "p"; });
            r.oploes = reak.length === 1 && reak[0].tilstand === "s" && prod.length > 0 && prod.every(function (s) { return s.tilstand === "aq"; });
            // ligevægten med et SÆL-skema
            if (r.K && antal > 0 && (alleA || (r.oploes && !nogleA))) {
                if (r.eBarBrugt && r.eMBrugt) r.saelNote = "Ligevægten regnes kun, når alle stofferne i reaktionsbrøken er gasser eller alle er opløste.";
                else r.sael = sael(r, !alleA);
            }
        }

        visFejl(fejl);
        visResultater(r);
        visBesvarelse(r);
        visGrafer(r);
        gem();
    }

    /* ----- Visning --------------------------------------------------------- */

    function visFejl(fejl) {
        var boks = F.$("#td-fejl", rod);
        var unikke = unik(fejl);
        boks.innerHTML = unikke.map(function (f) { return "<li>" + f + "</li>"; }).join("");
        boks.hidden = !unikke.length;
    }

    function enhedK(r) {
        function led(navn, e) {
            if (!e) return "";
            if (e === 1) return navn;
            return navn + "<sup>" + F.som(e).replace(/<[^>]+>/g, "") + "</sup>";
        }
        var dele = [led("bar", r.eBar), led("M", r.eM)].filter(Boolean);
        return dele.join(" · ");
    }

    function lnTilTal(ln, n) {
        // e^ln skrevet med n betydende cifre, også når tallet er for stort til en almindelig variabel
        var l10 = ln / Math.LN10;
        if (Math.abs(l10) < 300) return F.bc(Math.exp(ln), n);
        var e = Math.floor(l10), mant = Math.pow(10, l10 - e);
        if (Number(mant.toFixed(n - 1)) >= 10) { mant /= 10; e += 1; }
        return F.dec(mant, n - 1) + " · 10<sup>" + String(e).replace("-", F.MINUS) + "</sup>";
    }

    function grader(x, n) {
        // temperaturer skrives i hele grader, som i bogen (1119 K, 846 °C)
        return Math.abs(x) >= 100 ? F.dec(x, 0) : F.bc(x, Math.max(n, 2), 1e6);
    }

    function tekstT(r) { return grader(r.T, r.n) + " K"; }

    function raekkeHTML(navn, vaerdi, kommentar) {
        return "<tr><th>" + navn + "</th><td class=\"res\">" + vaerdi + "</td><td>" + (kommentar || "") + "</td></tr>";
    }

    function visResultater(r) {
        var n = r.n, rk = [];
        var kJ = " " + F.enh.kJmol, JK = " " + F.enh.JmolK;
        if (r.dH) rk.push(raekkeHTML(F.dH, F.bc(r.dH.v, n) + kJ, kildeTekst(r.dH.kilde) + (r.dH.v < 0 ? "Exoterm" : r.dH.v > 0 ? "Endoterm" : "")));
        if (r.dS) rk.push(raekkeHTML(F.dS, F.bc(r.dS.v, n) + JK, kildeTekst(r.dS.kilde) + (r.dS.v > 0 ? "Entropien stiger" : r.dS.v < 0 ? "Entropien falder" : "")));
        if (r.dGT && r.dGT.kilde !== "G") rk.push(raekkeHTML(F.dG + " ved " + tekstT(r), F.bc(r.dGT.v, n) + kJ, spontanKort(r.dGT.v)));
        if (r.dG298 !== undefined) rk.push(raekkeHTML(F.dG + " ved 298 K ud fra tabellens <i>G</i>" + F.std, F.bc(r.dG298, n) + kJ, spontanKort(r.dG298)));
        if (r.K) rk.push(raekkeHTML("<i>K</i> ved " + tekstT(r), (r.K.tekst || lnTilTal(r.K.lnK, n)) + (enhedK(r) ? " " + enhedK(r) : ""), r.K.kilde === "opgave" ? "Oplyst i opgaven" : (r.K.lnK < 0 ? "<i>K</i> &lt; 1" : "<i>K</i> &gt; 1")));
        if (r.dH && r.dS) rk.push(raekkeHTML("Temperaturgrænse", graenseKort(r), graenseKommentar(r)));
        if (r.harY) rk.push(raekkeHTML("Reaktionsbrøken", "<i>Y</i> = " + yUdtryk(r), ""));
        if (r.lnY !== undefined) rk.push(raekkeHTML("<i>Y</i>", lnTilTal(r.lnY, n), r.K ? (r.lnY < r.K.lnK ? "<i>Y</i> &lt; <i>K</i>, forløber mod højre" : r.lnY > r.K.lnK ? "<i>Y</i> &gt; <i>K</i>, forløber mod venstre" : "<i>Y</i> = <i>K</i>, ligevægt") : ""));
        if (r.dG !== undefined) rk.push(raekkeHTML("Δ<i>G</i> ved " + tekstT(r), F.bc(r.dG, n) + kJ, r.dG < 0 ? "Spontan mod højre" : r.dG > 0 ? "Spontan mod venstre" : "Ligevægt"));
        if (r.reg) rk.push(raekkeHTML("Regression", "<i>r</i><sup>2</sup> = " + F.dec(r.reg.r2, 4), r.reg.pts.length + " målinger af <i>K</i>"));
        if (r.sael && !r.sael.fejl && !r.sael.ligevaegt) {
            var S = r.sael, gasR = S.enhed === "bar";
            if (r.oploes) {
                var salt = S.arter.filter(function (q) { return q.fortegn < 0; })[0];
                rk.push(raekkeHTML("Opløselighed", F.bc(S.x, n) + " M", salt.s.M ? F.bc(S.x * salt.s.M, n) + " g/L" : ""));
            }
            S.aktive.forEach(function (q) {
                rk.push(raekkeHTML((gasR ? "<i>p</i>(" + F.formelHTML(q.s.vis) + ")" : "[" + F.formelHTML(q.s.vis) + "]") + " ved ligevægt", F.bc(q.lig, n) + " " + S.enhed, ""));
            });
        } else if (r.sael && r.sael.ligevaegt) rk.push(raekkeHTML("Ligevægt", "nået", "<i>Y</i> = <i>K</i>"));
        else if (r.saelNote) rk.push(raekkeHTML("Ligevægt", "", r.saelNote));
        var tabel = F.$("#td-resultater", rod);
        tabel.innerHTML = rk.join("");
        F.$("#td-ingen", rod).hidden = rk.length > 0;
        F.$("#td-resultatboks", rod).hidden = rk.length === 0;
    }

    function kildeTekst(k) {
        return { opgave: "Oplyst i opgaven. ", "G-graf": "Fra grafen over Δ<i>G</i>" + F.std + ". ", "vH-graf": "Fra van 't Hoff-grafen. ", "vH-data": "Fra målingerne af <i>K</i>. ", tabel: "" }[k] || "";
    }

    function spontanKort(dG) { return dG < 0 ? "Spontan ved standardtilstand" : dG > 0 ? "Ikke spontan ved standardtilstand" : "Ligevægt ved standardtilstand"; }

    function graenseKort(r) {
        if (r.dH.v < 0 && r.dS.v > 0) return "Ingen";
        if (r.dH.v > 0 && r.dS.v < 0) return "Ingen";
        if (!isFinite(r.Tnul)) return "";
        return grader(r.Tnul, r.n) + " K";
    }

    function graenseKommentar(r) {
        if (r.dH.v < 0 && r.dS.v > 0) return "Spontan ved alle temperaturer";
        if (r.dH.v > 0 && r.dS.v < 0) return "Aldrig spontan";
        if (r.dS.v > 0) return "Spontan over grænsen";
        return "Spontan under grænsen";
    }

    function aktivitetsled(s, medTal) {
        var navn = s.tilstand === "g" ? "<i>p</i>(" + F.formelHTML(s.vis) + ")" : "[" + F.formelHTML(s.vis) + "]";
        var x = navn;
        if (medTal) x = s.aTekst;
        if (s.koef !== 1) {
            var tal = koefTekst(s.koef);
            x = (medTal ? "(" + x + ")" : x) + "<sup>" + tal + "</sup>";
        }
        return x;
    }

    function yUdtryk(r, medTal) {
        function side(sd) {
            var led = r.liste.filter(function (s) { return s.side === sd && (s.tilstand === "g" || s.tilstand === "aq"); })
                .map(function (s) { return aktivitetsled(s, medTal); });
            return led.length ? led.join(" · ") : "1";
        }
        var t = side("p"), nv = side("r");
        if (nv === "1") return t;
        return F.brok(t, nv);
    }

    /* ----- Besvarelsen ------------------------------------------------------ */

    function ligning(html) { return '<p class="ligning">' + html + "</p>"; }

    function tabelLed(r, felt, enhed) {
        // Formel med symboler og beregning med tal for Σ produkter − Σ reaktanter
        var sym = { H: "<i>H</i>" + F.std, S: "<i>S</i>" + F.std, G: "<i>G</i>" + F.std }[felt];
        var prod = r.liste.filter(function (s) { return s.side === "p"; });
        var reak = r.liste.filter(function (s) { return s.side === "r"; });
        // H°(H₂O, l) i stedet for H°(H₂O(l)), som IUPAC, og hver reaktant trækkes fra for sig, så der ikke skal parenteser om
        function symLed(s) { return (s.koef !== 1 ? koefTekst(s.koef) + " · " : "") + sym + "(" + F.formelHTML(s.vis) + ", " + s.tilstand + ")"; }
        var formel = prod.map(symLed).join(" + ") + reak.map(function (s) { return " " + F.MINUS + " " + symLed(s); }).join("");
        var talLed = [];
        prod.forEach(function (s, i) {
            var v = F.par(F.som(s[felt].v));
            talLed.push((i ? " + " : "") + (s.koef !== 1 ? koefTekst(s.koef) + " · " : "") + v);
        });
        reak.forEach(function (s) {
            var v = F.par(F.som(s[felt].v));
            talLed.push(" " + F.MINUS + " " + (s.koef !== 1 ? koefTekst(s.koef) + " · " : "") + v);
        });
        return { formel: formel, tal: "(" + talLed.join("") + ") " + enhed };
    }

    function gasTal(r, side) {
        return r.liste.filter(function (s) { return s.side === side && s.tilstand === "g"; })
            .reduce(function (a, s) { return a + s.koef; }, 0);
    }

    function visBesvarelse(r) {
        var n = r.n, ud = [];
        var boks = F.$("#td-besvarelse", rod);
        var kJ = " " + F.enh.kJmol, JK = " " + F.enh.JmolK, kJK = " " + F.enh.kJmolK;
        var T = r.T;

        if (r.skemaOK) {
            var skema = function (sd) {
                return r.liste.filter(function (s) { return s.side === sd; })
                    .map(function (s) { return (s.koef !== 1 ? koefTekst(s.koef) + " " : "") + stofHTML(s); }).join(" + ");
            };
            ud.push("<h4>Reaktionsskemaet</h4>");
            ud.push('<p class="reaktion">' + skema("r") + " → " + skema("p") + "</p>");
        }
        if (r.Tgivet && r.tC !== null) {
            ud.push("<p>Temperaturen regnes om til kelvin.</p>");
            ud.push(ligning("<i>T</i> = (273 + " + F.som(r.tC) + ") K = " + F.som(r.T) + " K"));
        }

        // tabelværdier
        var brugH = r.dH && r.dH.kilde === "tabel", brugS = r.dS && r.dS.kilde === "tabel";
        var brugG = r.dG298 !== undefined && !(r.dH && r.dS);
        if (brugH || brugS || brugG) {
            var hoved = "<tr><th>Stof</th>" + (brugH ? "<th><i>H</i>" + F.std + " i kJ/mol</th>" : "") +
                (brugS ? "<th><i>S</i>" + F.std + " i J/(mol · K)</th>" : "") +
                (brugG ? "<th><i>G</i>" + F.std + " i kJ/mol</th>" : "") + "<th>Koefficient</th></tr>";
            var krop = r.liste.map(function (s) {
                return "<tr><td>" + stofHTML(s) + "</td>" + (brugH ? "<td>" + F.som(s.H.v) + "</td>" : "") +
                    (brugS ? "<td>" + F.som(s.S.v) + "</td>" : "") + (brugG ? "<td>" + F.som(s.G.v) + "</td>" : "") +
                    "<td>" + koefTekst(s.koef) + "</td></tr>";
            }).join("");
            ud.push("<h4>Tabelværdier</h4>");
            ud.push('<table class="lille-tabel"><thead>' + hoved + "</thead><tbody>" + krop + "</tbody></table>");
            var egne = r.liste.some(function (s) { return (brugH && s.H.egen) || (brugS && s.S.egen) || (brugG && s.G.egen); });
            var kbAlle = r.liste.every(function (s) { return s.kb; }), kbNogle = r.liste.some(function (s) { return s.kb; });
            var tabelNavn = kbAlle ? "Kemibogens tabel" : kbNogle ? "Kemibogens tabel og databogen" : "databogen";
            ud.push("<p>" + (egne ? "Værdierne er fra " + tabelNavn + " og opgaven." : "Værdierne er fra " + tabelNavn + ".") + "</p>");
        }

        // graferne
        var hG = r.dH && r.dH.kilde === "G-graf", sG = r.dS && r.dS.kilde === "G-graf";
        if (hG || sG) {
            ud.push("<h4>Grafen over " + F.dG + " som funktion af <i>T</i></h4>");
            ud.push("<p>Grafen er en ret linje, fordi " + F.dG + " = " + F.MINUS + F.dS + " · <i>T</i> + " + F.dH + ". Hældningen er " + F.MINUS + F.dS + ", og skæringen med andenaksen er " + F.dH + ".</p>");
            if (hG) ud.push(ligning(F.dH + " = <i>b</i> = " + F.bc(r.dH.v, n) + kJ));
            if (sG) ud.push(ligning(F.dS + " = " + F.MINUS + "<i>a</i> = " + F.MINUS + F.par(F.som(r.dS.a)) + kJK + " = " + F.bc(r.dS.v / 1000, n + 1) + kJK + " = " + F.bc(r.dS.v, n) + JK));
        }
        if (r.reg && r.dH && r.dH.kilde === "vH-data") {
            var rg = r.reg, C = rg.enhed === "C";
            ud.push("<h4>Målinger af <i>K</i> ved flere temperaturer</h4>");
            ud.push("<p>Van 't Hoff-ligningen, ln <i>K</i> = " + F.MINUS + F.dH + "/<i>R</i> · 1/<i>T</i> + " + F.dS + "/<i>R</i>, er en ret linje med hældningen " + F.MINUS + F.dH + "/<i>R</i> og skæringen " + F.dS + "/<i>R</i>. " +
                (C ? "Temperaturerne regnes om til kelvin med <i>T</i> = (273 + <i>t</i>) K, og <i>K</i> sættes ind som tal uden enhed." : "<i>K</i> sættes ind som tal uden enhed.") + "</p>");
            ud.push('<table class="lille-tabel"><thead><tr>' + (C ? "<th><i>t</i> i °C</th>" : "") + "<th><i>T</i> i K</th><th><i>K</i></th><th>1/<i>T</i> i K<sup>" + F.MINUS + "1</sup></th><th>ln <i>K</i></th></tr></thead><tbody>" +
                rg.pts.map(function (q) {
                    return "<tr>" + (C ? "<td>" + q.tTekst + "</td>" : "") + "<td>" + (C ? F.som(q.T) : q.tTekst) + "</td><td>" + q.kTekst + "</td><td>" + F.bc(q.x, 4) + "</td><td>" + F.bc(q.y, 4, 1e7) + "</td></tr>";
                }).join("") + "</tbody></table>");
            ud.push("<p>Lineær regression på de " + rg.pts.length + " punkter giver forskriften</p>");
            ud.push(ligning("ln <i>K</i> = " + F.bc(rg.a, n + 1, 1e3) + " K · " + F.brok("1", "<i>T</i>") + (rg.b < 0 ? " " + F.MINUS + " " + F.bc(-rg.b, n + 1, 1e7) : " + " + F.bc(rg.b, n + 1, 1e7)) +
                " &emsp; med <i>r</i><sup>2</sup> = " + F.dec(rg.r2, 4)));
            ud.push(ligning(F.dH + " = " + F.MINUS + "<i>a</i> · <i>R</i> = " + F.MINUS + F.par(F.bc(rg.a, n + 1, 1e3)) + " K · 8,314 " + F.enh.JmolK + " = " + F.bc(r.dH.v * 1000, n + 1, 1e7) + " J/mol = " + F.bc(r.dH.v, n) + kJ));
            ud.push(ligning(F.dS + " = <i>b</i> · <i>R</i> = " + F.par(F.bc(rg.b, n + 1, 1e7)) + " · 8,314 " + F.enh.JmolK + " = " + F.bc(r.dS.v, n) + JK));
            ud.push("<p>Linjen " + (rg.a > 0 ? "stiger" : "falder") + " mod højre, så " + F.dH + " er " + (rg.a > 0 ? "negativ, og reaktionen er exoterm." : "positiv, og reaktionen er endoterm.") + "</p>");
        }
        var hV = r.dH && r.dH.kilde === "vH-graf", sV = r.dS && r.dS.kilde === "vH-graf";
        if (hV || sV) {
            ud.push("<h4>Van 't Hoff-grafen</h4>");
            ud.push("<p>Grafen over ln <i>K</i> som funktion af 1/<i>T</i> er en ret linje, fordi</p>");
            ud.push(ligning("ln <i>K</i> = " + F.MINUS + F.brok(F.dH, "<i>R</i>") + " · " + F.brok("1", "<i>T</i>") + " + " + F.brok(F.dS, "<i>R</i>")));
            ud.push("<p>Hældningen er " + F.MINUS + F.dH + "/<i>R</i>, og skæringen med andenaksen er " + F.dS + "/<i>R</i>.</p>");
            if (hV) ud.push(ligning(F.dH + " = " + F.MINUS + "<i>a</i> · <i>R</i> = " + F.MINUS + F.som(r.dH.a) + " K · 8,314 " + F.enh.JmolK + " = " + F.bc(r.dH.v * 1000, n + 1, 1e7) + " J/mol = " + F.bc(r.dH.v, n) + kJ));
            if (sV) ud.push(ligning(F.dS + " = <i>b</i> · <i>R</i> = " + F.par(F.som(r.dS.b)) + " · 8,314 " + F.enh.JmolK + " = " + F.bc(r.dS.v, n) + JK));
        }

        // ΔH°
        if (brugH) {
            var lH = tabelLed(r, "H", "kJ/mol");
            ud.push("<h4>Tilvæksten i entalpi, " + F.dH + "</h4>");
            ud.push(ligning(F.dH + " = " + lH.formel));
            ud.push(ligning(F.dH + " = " + lH.tal + " = " + F.bc(r.dH.v, n) + kJ));
        }
        if (r.dH && r.dH.kilde !== "opgave") {
            ud.push("<p>" + F.dH + " = " + F.bc(r.dH.v, n) + kJ + ". " + (r.dH.v < 0 ? "Fortegnet er negativt, så reaktionen er exoterm og afgiver varme til omgivelserne." : r.dH.v > 0 ? "Fortegnet er positivt, så reaktionen er endoterm og optager varme fra omgivelserne." : "") + "</p>");
        }

        // ΔS°
        if (brugS) {
            var lS = tabelLed(r, "S", "J/(mol · K)");
            ud.push("<h4>Tilvæksten i entropi, " + F.dS + "</h4>");
            ud.push(ligning(F.dS + " = " + lS.formel));
            ud.push(ligning(F.dS + " = " + lS.tal + " = " + F.bc(r.dS.v, n) + JK));
        }
        if (r.dS && r.dS.kilde !== "opgave") {
            var gr = gasTal(r, "r"), gp = gasTal(r, "p");
            var kom = "";
            if (r.skemaOK && brugS) {
                if (gp > gr && r.dS.v > 0) kom = " Det passer med, at antallet af gasmolekyler stiger fra " + F.som(gr) + " til " + F.som(gp) + ".";
                else if (gp < gr && r.dS.v < 0) kom = " Det passer med, at antallet af gasmolekyler falder fra " + F.som(gr) + " til " + F.som(gp) + ".";
                else if (gp === gr) kom = " Antallet af gasmolekyler er det samme på begge sider af reaktionspilen, så fortegnet afgøres af de andre stoffer.";
            }
            ud.push("<p>" + F.dS + " = " + F.bc(r.dS.v, n) + JK + ". " + (r.dS.v > 0 ? "Fortegnet er positivt, så entropien stiger." : r.dS.v < 0 ? "Fortegnet er negativt, så entropien falder." : "") + kom + "</p>");
        }

        // ΔG° ved T
        if (r.dGT && r.dGT.kilde === "HS") {
            ud.push("<h4>Gibbs-energien, " + F.dG + " ved " + tekstT(r) + "</h4>");
            ud.push("<p>" + F.dS + " regnes om til kJ/(mol · K), så enheden passer med " + F.dH + ".</p>");
            ud.push(ligning(F.dS + " = " + F.bc(r.dS.v, n + 1) + JK + " = " + F.bc(r.dS.v / 1000, n + 1) + kJK));
            ud.push(ligning(F.dG + " = " + F.dH + " " + F.MINUS + " <i>T</i> · " + F.dS + " = " + F.bc(r.dH.v, n) + kJ + " " + F.MINUS + " " + tekstT(r) + " · " + medEnhed(F.bc(r.dS.v / 1000, n + 1), kJK) + " = " + F.bc(r.dGT.v, n) + kJ));
            ud.push("<p>" + spontanSaetning(r.dGT.v, tekstT(r)) + "</p>");
        }
        if (r.dG298 !== undefined && (!r.dGT || r.dGT.kilde === "G")) {
            var lG = tabelLed(r, "G", "kJ/mol");
            ud.push("<h4>Gibbs-energien, " + F.dG + " ved 298 K</h4>");
            ud.push(ligning(F.dG + " = " + lG.formel));
            ud.push(ligning(F.dG + " = " + lG.tal + " = " + F.bc(r.dG298, n) + kJ));
            ud.push("<p>" + spontanSaetning(r.dG298, "298 K") + "</p>");
        }

        // K
        if (r.K && r.K.kilde === "beregnet") {
            ud.push("<h4>Ligevægtskonstanten ved " + tekstT(r) + "</h4>");
            ud.push("<p>" + F.dG + " regnes om til J/mol, så enheden passer med gaskonstanten.</p>");
            ud.push(ligning(F.dG + " = " + F.bc(r.dGT.v, n + 1) + kJ + " = " + F.bc(r.dGT.v * 1000, n + 1, 1e7) + " J/mol"));
            ud.push(ligning("ln <i>K</i> = " + F.MINUS + F.brok(F.dG, "<i>R</i> · <i>T</i>") + " = " + F.MINUS + F.brok(medEnhed(F.bc(r.dGT.v * 1000, n + 1, 1e7), " J/mol"), "8,314 " + F.enh.JmolK + " · " + tekstT(r)) + " = " + F.bc(r.K.lnK, n + 1, 1e7)));
            ud.push(ligning("<i>K</i> = e<sup>" + F.bc(r.K.lnK, n + 1, 1e7) + "</sup> = " + lnTilTal(r.K.lnK, n)));
            if (enhedK(r)) {
                ud.push("<p>Formlen giver et tal uden enhed. Enheden findes af ligevægtsloven, <i>K</i> = " + yUdtryk(r) + ", og er " + enhedK(r) + ".</p>");
                ud.push(ligning("<i>K</i> = " + lnTilTal(r.K.lnK, n) + " " + enhedK(r)));
            }
            ud.push("<p>" + (r.K.lnK < 0 ? "<i>K</i> er mindre end 1. Er alle partialtryk 1 bar og alle koncentrationer 1 M, er <i>Y</i> = 1 og dermed større end <i>K</i>, så reaktionen forløber mod venstre." :
                r.K.lnK > 0 ? "<i>K</i> er større end 1. Er alle partialtryk 1 bar og alle koncentrationer 1 M, er <i>Y</i> = 1 og dermed mindre end <i>K</i>, så reaktionen forløber mod højre." : "") + "</p>");
        }

        // temperaturgrænsen
        if (r.dH && r.dS && r.dH.v !== 0 && r.dS.v !== 0) {
            ud.push("<h4>Temperaturen, hvor " + F.dG + " skifter fortegn</h4>");
            if ((r.dH.v < 0 && r.dS.v > 0) || (r.dH.v > 0 && r.dS.v < 0)) {
                var altid = r.dH.v < 0;
                ud.push("<p>" + F.dH + " er " + (altid ? "negativ" : "positiv") + ", og " + F.dS + " er " + (altid ? "positiv" : "negativ") + ". " +
                    "Så er " + F.dG + " = " + F.dH + " " + F.MINUS + " <i>T</i> · " + F.dS + " " + (altid ? "negativ" : "positiv") + " ved alle temperaturer, og reaktionen er " +
                    (altid ? "spontan" : "aldrig spontan") + " ved standardtilstand" + (altid ? " ved alle temperaturer." : ".") + "</p>");
            } else {
                var hoej = r.dS.v > 0;
                ud.push(ligning(F.dG + " = " + F.dH + " " + F.MINUS + " <i>T</i> · " + F.dS + " = 0"));
                ud.push(ligning("<i>T</i> = " + F.brok(F.dH, F.dS) + " = " + F.brok(F.bc(r.dH.v, n + 1) + kJ, F.bc(r.dS.v / 1000, n + 1) + kJK) + " = " + grader(r.Tnul, n) + " K"));
                var tc = r.Tnul - 273;
                ud.push("<p>Både " + F.dH + " og " + F.dS + " er " + (hoej ? "positive" : "negative") + ", så reaktionen er spontan ved " + (hoej ? "høje" : "lave") +
                    " temperaturer. Ved standardtilstand er reaktionen spontan, når temperaturen er " + (hoej ? "over " : "under ") + grader(r.Tnul, n) + " K" +
                    (r.Tnul > 0 ? ". Det svarer til " + grader(tc, n) + " °C." : ".") + "</p>");
            }
        }

        // reaktionsbrøken
        if (r.harY) {
            ud.push("<h4>Reaktionsbrøken</h4>");
            var fastFlyd = r.liste.some(function (s) { return s.tilstand === "s" || s.tilstand === "l"; });
            if (fastFlyd) ud.push("<p>Faste stoffer og væsker indgår ikke i reaktionsbrøken.</p>");
            ud.push(ligning("<i>Y</i> = " + yUdtryk(r)));
            if (r.lnY !== undefined) {
                var harG = r.eBarBrugt, harAq = r.eMBrugt;
                ud.push("<p>" + (harG && harAq ? "Partialtryk sættes ind som talværdien i bar og koncentrationer som talværdien i M." :
                    harG ? "Partialtrykkene sættes ind som talværdien i bar." : "Koncentrationerne sættes ind som talværdien i M.") + "</p>");
                ud.push(ligning("<i>Y</i> = " + yUdtryk(r, true) + " = " + lnTilTal(r.lnY, n)));
                if (r.K) {
                    var Ktekst = lnTilTal(r.K.lnK, n);
                    if (r.lnY < r.K.lnK) ud.push("<p><i>Y</i> = " + lnTilTal(r.lnY, n) + " er mindre end <i>K</i> = " + Ktekst + ", så reaktionen forløber mod højre, indtil der er ligevægt.</p>");
                    else if (r.lnY > r.K.lnK) ud.push("<p><i>Y</i> = " + lnTilTal(r.lnY, n) + " er større end <i>K</i> = " + Ktekst + ", så reaktionen forløber mod venstre, indtil der er ligevægt.</p>");
                    else ud.push("<p><i>Y</i> er lig med <i>K</i>, så blandingen er i ligevægt.</p>");
                }
            }
        }

        // ΔG i blandingen
        if (r.dG !== undefined) {
            ud.push("<h4>Tilvæksten i Gibbs-energi i blandingen, Δ<i>G</i></h4>");
            ud.push(ligning("Δ<i>G</i> = " + F.dG + " + <i>R</i> · <i>T</i> · ln <i>Y</i> = " + F.bc(r.dGT.v, n) + kJ + " + 8,314 · 10<sup>" + F.MINUS + "3</sup> " + F.enh.kJmolK + " · " + tekstT(r) + " · ln(" + lnTilTal(r.lnY, n) + ") = " + F.bc(r.dG, n) + kJ));
            ud.push("<p>" + (r.dG < 0 ? "Δ<i>G</i> er negativ, så reaktionen er spontan mod højre i blandingen." :
                r.dG > 0 ? "Δ<i>G</i> er positiv, så reaktionen er ikke spontan mod højre i blandingen. Den modsatte reaktion er spontan." :
                "Δ<i>G</i> er 0, så blandingen er i ligevægt.") + "</p>");
        }

        var saelTekst = saelHTML(r);
        if (saelTekst) ud.push(saelTekst);

        F.$("#td-besvarelsesboks", rod).hidden = ud.length === 0;
        boks.innerHTML = ud.join("");
        F.trin(boks);
    }

    /* ----- Ligevægten og opløseligheden i besvarelsen ---------------------------- */

    var TALORD = { 1: "én", 2: "to", 3: "tre", 4: "fire" };

    function aktNavn(q, gas) {
        return gas ? "<i>p</i>(" + F.formelHTML(q.s.vis) + ")" : "[" + F.formelHTML(q.s.vis) + "]";
    }
    function kx(k) { return k === 1 ? "<i>x</i>" : koefTekst(k) + "<i>x</i>"; }
    function liste(a, og) {
        if (a.length <= 1) return a.join("");
        return a.slice(0, -1).join(", ") + " " + (og || "og") + " " + a[a.length - 1];
    }
    function startTekst(q, S) {
        var enh = " " + S.enhed;
        if (S.rentVand || q.a0 === 0) return "0" + enh;
        return q.s.aTekst + enh;
    }
    function ligTekst(q, S) {
        var d = Math.abs(q.d);
        if (q.a0 === 0) return kx(d);
        return startTekst(q, S) + (q.d > 0 ? " + " : " " + F.MINUS + " ") + kx(d);
    }

    function saelTabel(r, S) {
        var reak = S.arter.filter(function (q) { return q.fortegn < 0; }), prod = S.arter.filter(function (q) { return q.fortegn > 0; });
        function celler(q, raekke) {
            if (!q.aktiv) {
                var t = q.s.tilstand === "s" ? "fast stof" : "væske";
                return raekke === "aendring" ? "" : t;
            }
            if (raekke === "start") return startTekst(q, S);
            if (raekke === "aendring") return (q.d > 0 ? "+" : F.MINUS) + kx(Math.abs(q.d));
            return ligTekst(q, S);
        }
        function linje(navn, raekke) {
            var c = [];
            reak.forEach(function (q, i) { if (i) c.push(""); c.push(celler(q, raekke)); });
            c.push("");
            prod.forEach(function (q, i) { if (i) c.push(""); c.push(celler(q, raekke)); });
            return "<tr><td>" + navn + "</td>" + c.map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>";
        }
        var hoved = [];
        function medKoef(q) { return (q.nu !== 1 ? koefTekst(q.nu) + " " : "") + stofHTML(q.s); }
        reak.forEach(function (q, i) { if (i) hoved.push("+"); hoved.push(medKoef(q)); });
        hoved.push("⇌");
        prod.forEach(function (q, i) { if (i) hoved.push("+"); hoved.push(medKoef(q)); });
        return '<table class="lille-tabel sael"><thead><tr><th></th>' + hoved.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody>" +
            linje("Start", "start") + linje("Ændring", "aendring") + linje("Ligevægt", "lig") + "</tbody></table>";
    }

    function ligeUdtryk(S) {
        function side(fortegn) {
            var led = S.aktive.filter(function (q) { return q.fortegn === fortegn; });
            return led.map(function (q) {
                var e = ligTekst(q, S), sammensat = /\s/.test(e);
                var par = (sammensat && (q.nu !== 1 || led.length > 1)) || (!sammensat && Math.abs(q.d) !== 1 && q.nu !== 1);
                var t = par ? "(" + e + ")" : e;
                return q.nu !== 1 ? t + "<sup>" + koefTekst(q.nu) + "</sup>" : t;
            });
        }
        var t = side(1), nv = side(-1);
        var tael = t.length ? t.join(" · ") : "1";
        return nv.length ? F.brok(tael, nv.join(" · ")) : tael;
    }

    function xSaetning(r, S) {
        var gas = S.enhed === "bar";
        if (r.oploes) {
            var salt = S.arter.filter(function (q) { return q.fortegn < 0; })[0];
            var ioner = S.aktive.map(function (q) { return (TALORD[q.nu] || koefTekst(q.nu)) + " " + F.formelHTML(q.s.vis); });
            var t = "<i>x</i> angiver her ændringen i stofmængdekoncentrationen af opløst " + F.formelHTML(salt.s.vis) + ", fra der ikke er opløst noget, til opløsningen er mættet. " +
                "Hver formelenhed " + F.formelHTML(salt.s.vis) + " giver " + liste(ioner) + ".";
            S.aktive.forEach(function (q) { if (q.a0 > 0) t += " Fra start er der " + startTekst(q, S) + " " + F.formelHTML(q.s.vis) + "."; });
            return t;
        }
        var ord = gas ? "det partialtryk" : "den koncentration";
        var forbrugt = S.aktive.filter(function (q) { return q.d < 0 && Math.abs(q.d) === 1; })[0];
        var dannet = S.aktive.filter(function (q) { return q.d > 0 && Math.abs(q.d) === 1; })[0];
        var ref = forbrugt || dannet;
        if (!ref) return "<i>x</i> angiver her, hvor langt reaktionen er forløbet fra start og frem til ligevægt. Hvert stof ændres med sin koefficient gange <i>x</i>.";
        var t2 = "<i>x</i> angiver her " + ord + " af " + F.formelHTML(ref.s.vis) + ", der bliver " + (ref.d < 0 ? "omdannet" : "dannet") + ", fra start og frem til ligevægt.";
        var dele = S.aktive.filter(function (q) { return q !== ref; }).map(function (q) {
            var forhold = Math.abs(q.d) / Math.abs(ref.d);
            var maengde = forhold === 1 ? "lige så meget" : forhold === 2 ? "dobbelt så meget" : forhold === 0.5 ? "halvt så meget" : F.som(forhold) + " gange så meget";
            return (q.d < 0 ? "der bliver omdannet " : "der dannes ") + maengde + " " + F.formelHTML(q.s.vis);
        });
        if (dele.length) { var s = dele.length > 1 ? dele.slice(0, -1).join(", ") + ", og " + dele[dele.length - 1] : dele[0]; t2 += " " + s.charAt(0).toUpperCase() + s.slice(1) + "."; }
        return t2;
    }

    function saelHTML(r) {
        var n = r.n, S = r.sael, ud = [];
        if (!S) {
            if (r.saelNote) ud.push("<h4>Ligevægten</h4><p>" + r.saelNote + "</p>");
            return ud.join("");
        }
        ud.push("<h4>" + (r.oploes ? "Opløseligheden" : "Ligevægten") + "</h4>");
        if (S.fejl) { ud.push("<p>" + S.fejl + "</p>"); return ud.join(""); }
        if (S.ligevaegt) { ud.push("<p>Reaktionsbrøken er lig med <i>K</i>, så blandingen er allerede i ligevægt.</p>"); return ud.join(""); }
        var gas = S.enhed === "bar", enh = " " + S.enhed;
        var Kt = (r.K.tekst || lnTilTal(r.K.lnK, n)) + (enhedK(r) ? " " + enhedK(r) : "");
        if (r.oploes && S.rentVand) ud.push("<p>Saltet opløses i rent vand, så der er ingen ioner fra start.</p>");
        ud.push("<p>" + (r.oploes ? "Opløselighedsproduktet" : "Ligevægtsloven") + " er</p>");
        ud.push(ligning(S.Ksym + " = " + yUdtryk(r) + " = " + Kt));
        ud.push("<p>" + xSaetning(r, S) + "</p>");
        ud.push(saelTabel(r, S));
        ud.push("<p>Udtrykkene fra rækken Ligevægt sættes ind i " + (r.oploes ? "opløselighedsproduktet" : "ligevægtsloven") + ".</p>");
        ud.push(ligning(S.Ksym + " = " + ligeUdtryk(S) + " = " + Kt));
        var fmt = function (x) { return F.bc(x, n); };
        if (S.roedder.length > 1) ud.push("<p>Ligningen løses med et CAS-værktøj, som giver " + liste(S.roedder.map(function (y) { return "<i>x</i> = " + fmt(y); }), "eller") + ".</p>");
        else ud.push("<p>Ligningen løses med et CAS-værktøj, som giver <i>x</i> = " + fmt(S.x) + ".</p>");
        var forkast = [];
        S.roedder.forEach(function (y) {
            if (Math.abs(y - S.x) <= 1e-6 * Math.max(Math.abs(S.x), 1e-12)) return;
            var neg = S.aktive.filter(function (q) { return q.a0 + q.d * y < 0; })[0];
            if (neg) forkast.push("Med <i>x</i> = " + fmt(y) + enh + " ville " + aktNavn(neg, gas) + " være " + (gas ? "negativt" : "negativ") + ", så den løsning forkastes.");
        });
        ud.push("<p>" + (forkast.length ? (gas ? "Et partialtryk kan ikke være negativt. " : "En koncentration kan ikke være negativ. ") + forkast.join(" ") + " " : "") + "Altså er <i>x</i> = " + fmt(S.x) + enh + ".</p>");
        ud.push('<table class="lille-tabel"><thead><tr><th>Stof</th><th>Udtryk</th><th>' + (gas ? "Partialtryk" : "Koncentration") + " ved ligevægt</th></tr></thead><tbody>" +
            S.aktive.map(function (q) { return "<tr><td>" + F.formelHTML(q.s.vis) + "</td><td>" + ligTekst(q, S) + "</td><td>" + fmt(q.lig) + enh + "</td></tr>"; }).join("") + "</tbody></table>");
        var lnYeq = 0;
        S.aktive.forEach(function (q) { lnYeq += q.fortegn * q.nu * Math.log(q.lig); });
        var tjekTael = [], tjekNaev = [];
        S.aktive.forEach(function (q) {
            var t = fmt(q.lig) + enh, sammen = S.aktive.filter(function (z) { return z.fortegn === q.fortegn; }).length > 1;
            t = q.nu !== 1 ? "(" + t + ")<sup>" + koefTekst(q.nu) + "</sup>" : t;
            (q.fortegn > 0 ? tjekTael : tjekNaev).push(t);
        });
        var tjek = tjekNaev.length ? F.brok(tjekTael.join(" · ") || "1", tjekNaev.join(" · ")) : tjekTael.join(" · ");
        ud.push("<p>Tjek med reaktionsbrøken</p>");
        ud.push(ligning("<i>Y</i> = " + tjek + " = " + lnTilTal(lnYeq, n) + (enhedK(r) ? " " + enhedK(r) : "")));
        ud.push("<p>Reaktionsbrøken giver " + S.Ksym + ", så resultatet passer.</p>");
        if (r.oploes) {
            var salt = S.arter.filter(function (q) { return q.fortegn < 0; })[0];
            ud.push("<h4>Konklusion</h4>");
            var t3 = "Opløseligheden af " + F.formelHTML(salt.s.vis) + " er " + fmt(S.x) + " M.";
            if (salt.s.M) {
                var m = S.x * salt.s.M;
                ud.push("<p>I 1,00 L mættet opløsning er der " + fmt(S.x) + " mol " + F.formelHTML(salt.s.vis) + " opløst. Massen er</p>");
                ud.push(ligning("<i>m</i> = <i>n</i> · <i>M</i> = " + fmt(S.x) + " mol · " + F.bc(salt.s.M, 4) + " g/mol = " + fmt(m) + " g" + (m < 0.1 ? " = " + fmt(m * 1000) + " mg" : "")));
                t3 += " Der kan opløses " + (m < 0.1 ? fmt(m * 1000) + " mg" : fmt(m) + " g") + " i en liter vand.";
            }
            ud.push("<p>" + t3 + "</p>");
        }
        return ud.join("");
    }

    function medEnhed(tal, enhed) {
        // negative tal med enhed står i parentes: (−0,1981 kJ/(mol · K))
        return tal.charAt(0) === F.MINUS ? "(" + tal + enhed + ")" : tal + enhed;
    }

    function spontanSaetning(dG, Ttekst) {
        if (dG < 0) return F.dG + " er negativ, så reaktionen er spontan ved " + Ttekst + " og standardtilstand.";
        if (dG > 0) return F.dG + " er positiv, så reaktionen er ikke spontan ved " + Ttekst + " og standardtilstand.";
        return F.dG + " er 0, så reaktionen er i ligevægt ved " + Ttekst + " og standardtilstand.";
    }

    /* ----- Grafer ----------------------------------------------------------- */

    function visGrafer(r) {
        var boks = F.$("#td-grafer", rod);
        if (!(r.dH && r.dS)) { boks.hidden = true; return; }
        boks.hidden = false;
        var hoejest = Math.max(800, r.Tgivet ? r.T * 1.3 : 0, r.Tnul > 0 ? r.Tnul * 1.5 : 0);
        hoejest = Math.min(hoejest, 5000);
        var Ts = [], i;
        for (i = 0; i <= 60; i++) Ts.push(200 + (hoejest - 200) * i / 60);
        var dG = Ts.map(function (t) { return r.dH.v - t * r.dS.v / 1000; });
        F.$("#td-graf-g", rod).innerHTML = graf(Ts, dG, "<i>T</i> i K", F.dG + " i kJ/mol", r.Tgivet ? r.T : null);
        var TsK = Ts, punkter = null;
        if (r.reg) {
            var Tmin = Math.min.apply(null, r.reg.pts.map(function (q) { return q.T; })), Tmax = Math.max.apply(null, r.reg.pts.map(function (q) { return q.T; }));
            TsK = [];
            for (i = 0; i <= 60; i++) TsK.push(Tmin * 0.95 + (Tmax * 1.05 - Tmin * 0.95) * i / 60);
            punkter = r.reg.pts.map(function (q) { return [q.x, q.y]; });
        }
        var lnK = TsK.map(function (t) { return -(r.dH.v * 1000 - t * r.dS.v) / (R * t); });
        F.$("#td-graf-k", rod).innerHTML = graf(TsK.map(function (t) { return 1 / t; }), lnK, "1/<i>T</i> i K<sup>" + F.MINUS + "1</sup>", "ln <i>K</i>", r.Tgivet ? 1 / r.T : null, punkter);
        // opløseligheden som funktion af temperaturen
        var oFig = F.$("#td-graf-o", rod);
        if (r.oploes) {
            var salt = r.liste.filter(function (s) { return s.side === "r"; })[0];
            var ioner = r.liste.filter(function (s) { return s.side === "p"; });
            var sumNu = 0, lnNu = 0;
            ioner.forEach(function (s) { sumNu += s.koef; lnNu += s.koef * Math.log(s.koef); });
            var ts = [], ss = [];
            for (i = 0; i <= 50; i++) {
                var t = 2 * i, TT = 273 + t;
                var lk = -(r.dH.v * 1000 - TT * r.dS.v) / (R * TT);
                var sM = Math.exp((lk - lnNu) / sumNu);
                ts.push(t); ss.push(salt.M ? sM * salt.M : sM);
            }
            oFig.innerHTML = graf(ts, ss, "<i>t</i> i °C", "Opløselighed i " + (salt.M ? "g/L" : "M") + " i rent vand", r.Tgivet && r.tC !== null ? r.tC : null);
            oFig.hidden = false;
        } else { oFig.innerHTML = ""; oFig.hidden = true; }
    }

    function aksetal(min, maks, antal) {
        var spaend = maks - min || 1;
        var skridt = Math.pow(10, Math.floor(Math.log10(spaend / antal)));
        [1, 2, 2.5, 5, 10].some(function (f) { if (spaend / (skridt * f) <= antal) { skridt *= f; return true; } return false; });
        var ud = [];
        for (var x = Math.ceil(min / skridt) * skridt; x <= maks + 1e-12; x += skridt) ud.push(Math.abs(x) < skridt / 1e6 ? 0 : x);
        return ud;
    }

    function graf(xs, ys, xNavn, yNavn, markX, punkter) {
        var B = 340, H = 220, ml = 54, mr = 12, mt = 12, mb = 40;
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
        var alleY = ys.concat([0]).concat((punkter || []).map(function (q) { return q[1]; }));
        var y0 = Math.min.apply(null, alleY), y1 = Math.max.apply(null, alleY);
        if (y1 - y0 < 1e-9) { y0 -= 1; y1 += 1; }
        var pad = (y1 - y0) * 0.06; y0 -= pad; y1 += pad;
        function X(x) { return ml + (x - x0) / (x1 - x0) * (B - ml - mr); }
        function Y(y) { return mt + (y1 - y) / (y1 - y0) * (H - mt - mb); }
        var s = '<svg viewBox="0 0 ' + B + " " + H + '" class="graf" role="img">';
        aksetal(y0, y1, 5).forEach(function (t) {
            s += '<line x1="' + ml + '" x2="' + (B - mr) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" class="net' + (t === 0 ? " nul" : "") + '"/>';
            s += '<text x="' + (ml - 6) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + F.som(Number(t.toPrecision(10))) + "</text>";
        });
        var xt = aksetal(x0, x1, 4);
        xt.forEach(function (t) {
            s += '<line y1="' + mt + '" y2="' + (H - mb) + '" x1="' + X(t) + '" x2="' + X(t) + '" class="net"/>';
            var lbl = x1 < 0.1 ? F.som(Number((t * 1000).toPrecision(10))) : F.som(Number(t.toPrecision(10)));
            s += '<text x="' + X(t) + '" y="' + (H - mb + 16) + '" text-anchor="middle">' + lbl + "</text>";
        });
        s += '<polyline class="kurve" points="' + xs.map(function (x, i) { return X(x).toFixed(1) + "," + Y(ys[i]).toFixed(1); }).join(" ") + '"/>';
        (punkter || []).forEach(function (q) {
            if (q[0] >= x0 && q[0] <= x1) s += '<circle class="punkt" cx="' + X(q[0]).toFixed(1) + '" cy="' + Y(q[1]).toFixed(1) + '" r="3.5"/>';
        });
        if (markX !== null && markX >= x0 && markX <= x1) {
            s += '<line class="maerke" x1="' + X(markX) + '" x2="' + X(markX) + '" y1="' + mt + '" y2="' + (H - mb) + '"/>';
        }
        s += "</svg>";
        var xEnhed = x1 < 0.1 ? xNavn.replace("1/<i>T</i> i K", "1/<i>T</i> i 10<sup>" + F.MINUS + "3</sup> K") : xNavn;
        return '<div class="graf-navn">' + yNavn + "</div>" + s + '<div class="graf-x">' + xEnhed + "</div>";
    }

    /* ----- Husk felterne ------------------------------------------------------ */

    var FELTER = ["#td-temp", "#td-temp-enhed", "#td-cifre", "#td-oH", "#td-oS", "#td-oK", "#td-gA", "#td-gB", "#td-vA", "#td-vB", "#td-skema-tekst", "#td-kilde", "#td-kdata", "#td-kdata-enhed"];

    function gem() {
        var data = { stoffer: stoffer.map(function (s) { return { side: s.side, koef: s.koef, formel: s.formel, tilstand: s.tilstand, H: s.H, S: s.S, G: s.G, a: s.a, valg: s.valg }; }), felter: {} };
        FELTER.forEach(function (id) { data.felter[id] = F.$(id, rod).value; });
        F.husk("termodynamik", data);
    }

    function hent() {
        var data = F.husk("termodynamik");
        if (!data || !data.stoffer) return false;
        stoffer = data.stoffer.map(function (d) { return nytStof(d.side, d); });
        FELTER.forEach(function (id) { if (data.felter && data.felter[id] !== undefined) F.$(id, rod).value = data.felter[id]; });
        return true;
    }

    /* ----- Start --------------------------------------------------------------- */

    function start() {
        rod = document.getElementById("termodynamik");
        if (!rod) return;
        tabelKrop = F.$("#td-stoffer tbody", rod);
        if (!hent()) stoffer = standard();
        tegnSkema();
        F.$$("input, select, textarea", F.$(".td-forhold", rod)).forEach(function (el) {
            el.addEventListener("input", beregn);
            el.addEventListener("change", beregn);
        });
        F.$("#td-skema-knap", rod).addEventListener("click", indsaetSkema);
        F.$("#td-skema-tekst", rod).addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); indsaetSkema(); } });
        F.$("#td-kopier", rod).addEventListener("click", function () { F.kopier(F.$("#td-besvarelse", rod), this); });
        F.$("#td-ryd", rod).addEventListener("click", function () {
            stoffer = standard();
            FELTER.forEach(function (id) { var el = F.$(id, rod); if (el.tagName === "SELECT") el.selectedIndex = 0; else el.value = id === "#td-cifre" ? "3" : ""; });
            F.$("#td-skema-besked", rod).textContent = "";
            tegnSkema(); beregn();
        });
        beregn();
    }

    window.FACIT_TD = { slaaOp: slaaOp, delSide: delSide };
    document.addEventListener("DOMContentLoaded", start);
})();
