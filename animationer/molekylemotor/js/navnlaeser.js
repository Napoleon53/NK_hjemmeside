/* =====================================================================
   navnlaeser.js - fra navn til molekyle (tegnebraettet)

   NK.NavnLaeser.laes("propan-2-ol") bygger molekylet ud fra navnet,
   laegger det ud som zigzag og lader NK.Navn.analyser give det rigtige
   navn tilbage. Er det, eleven skrev, ikke det rigtige navn (fx
   4-methylpentan), tegnes molekylet alligevel, og noten siger, hvad det
   hedder.

   Det, der kan laeses, er det samme, som navngivningen kan give:
     carbonhydrider (ogsaa ringe og benzen) og halogenforbindelser
     alkoholer, aldehyder, ketoner, carboxylsyrer, estre, amider, aminer
       og ethere: propan-2-ol, butanal, propanon, ethansyre, ethylethanoat,
       N-methylethanamid, ethylamin og ethanamin, diethylether og
       methoxyethan, benzoesyre, phenol, 2-(acetyloxy)benzoesyre
     de andre grupper foran: hydroxy, oxo, amino, methoxy, carboxy,
       formyl, acetyl, (acetyloxy), (methoxycarbonyl), phenyl, N-methyl
   Desuden:
     den gamle danske skrivemaade      2-buten, 2-propanol, 1,2-ethandiol,
                                       ethansyreethylester
     de engelske endelser              2-methylbutane, propan-2-one,
                                       ethanoic acid, ethyl ethanoate
     (Z) og (E) for cis og trans       (Z)-but-2-ene
     gamle sidegruppenavne             isopropyl, isobutyl, sec-butyl,
                                       tert-butyl, vinyl, allyl, benzyl
     trivialnavne                      eddikesyre, acetone, glycerol,
                                       anilin ... (trivialnavne.js)
     smaa uorganiske molekyler         vand, brom, chlor, iod, hydrogen,
                                       oxygen, nitrogen, ammoniak,
                                       carbondioxid, hydrogenchlorid ...
     carboxylat-ionerne og smaa ioner  ethanoat (CH₃COO⁻), acetat, benzoat,
                                       ethanoat-ion, hydroxid, oxonium,
                                       ammonium, chlorid, OH⁻, H₃O⁺

   NK.NavnLaeser.skema("ethanol + ethansyre -> ethylethanoat + vand")
   deler teksten ved +, ->, → og <=>, ⇌ og giver en liste af molekyler,
   plus og pile.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Mol = NK.Molekyle;

    var STAMMER = NK.Navn.STAMME.map(function (s, n) { return { s: s, n: n }; })
        .filter(function (x) { return x.s; })
        .sort(function (a, b) { return b.s.length - a.s.length; });
    var MULT = { di: 2, tri: 3, tetra: 4, penta: 5, hexa: 6, hepta: 7, octa: 8, bis: 2, tris: 3, tetrakis: 4 };
    var HALO = { fluor: "F", chlor: "Cl", brom: "Br", iod: "I" };

    /* Simple sidegrupper, der staar foran uden parentes (laengste foerst) */
    function lang(a, b) { return b.length - a.length; }
    var ALKYLNAVNE = STAMMER.map(function (x) { return x.s + "yl"; })
        .concat(["ethenyl", "ethynyl", "phenyl"])
        .concat(["prop", "but", "pent", "hex", "hept", "oct"].map(function (s) { return "cyclo" + s + "yl"; }))
        .sort(lang);
    var SIMPEL = ALKYLNAVNE.concat(["fluor", "chlor", "brom", "iod", "hydroxy", "oxo", "amino", "carboxy", "carboxylato", "formyl",
        "carbamoyl", "acetyl", "benzoyl", "acetyloxy", "formyloxy", "benzoyloxy", "phenoxy", "methoxy", "ethoxy",
        "propoxy", "butoxy"]).concat(STAMMER.filter(function (x) { return x.n >= 5; }).map(function (x) { return x.s + "yloxy"; }))
        .concat(STAMMER.filter(function (x) { return x.n >= 3; }).map(function (x) { return x.s + "anoyl"; })).sort(lang);
    var SIMPEL_RE = new RegExp("^(" + SIMPEL.join("|") + ")");
    var ALKYL_RE = new RegExp("^(" + ALKYLNAVNE.join("|") + ")");

    /* Smaa uorganiske molekyler: atomer, bindinger [a, b, orden] og ladninger */
    function lille(atomer, bindinger, ladninger) { return { atomer: atomer, bindinger: bindinger || [], q: ladninger || [] }; }
    var UORG = {
        hydrogen: lille(["H", "H"], [[0, 1, 1]]), dihydrogen: "hydrogen",
        oxygen: lille(["O", "O"], [[0, 1, 2]]), dioxygen: "oxygen",
        nitrogen: lille(["N", "N"], [[0, 1, 3]]), dinitrogen: "nitrogen",
        fluor: lille(["F", "F"], [[0, 1, 1]]), difluor: "fluor",
        chlor: lille(["Cl", "Cl"], [[0, 1, 1]]), dichlor: "chlor",
        brom: lille(["Br", "Br"], [[0, 1, 1]]), dibrom: "brom",
        iod: lille(["I", "I"], [[0, 1, 1]]), diiod: "iod",
        vand: lille(["O"]), hydrogenperoxid: lille(["O", "O"], [[0, 1, 1]]),
        hydrogenfluorid: lille(["F"]), hydrogenchlorid: lille(["Cl"]),
        hydrogenbromid: lille(["Br"]), hydrogeniodid: lille(["I"]),
        ammoniak: lille(["N"]), carbondioxid: lille(["O", "C", "O"], [[0, 1, 2], [1, 2, 2]]),
        /* engelsk */
        water: "vand", bromine: "brom", chlorine: "chlor", iodine: "iod", fluorine: "fluor",
        ammonia: "ammoniak", carbondioxide: "carbondioxid", hydrogenperoxide: "hydrogenperoxid",
        hydrogenchloride: "hydrogenchlorid", hydrogenbromide: "hydrogenbromid",
        /* formler */
        h2: "hydrogen", o2: "oxygen", n2: "nitrogen", f2: "fluor", cl2: "chlor", br2: "brom", i2: "iod",
        h2o: "vand", h2o2: "hydrogenperoxid", hf: "hydrogenfluorid", hcl: "hydrogenchlorid", hbr: "hydrogenbromid",
        hi: "hydrogeniodid", nh3: "ammoniak", co2: "carbondioxid",
        /* ioner; "ion" bagefter er skaaret af (hydroxidion) */
        hydroxid: lille(["O"], [], [-1]), oxonium: lille(["O"], [], [1]), ammonium: lille(["N"], [], [1]),
        fluorid: lille(["F"], [], [-1]), chlorid: lille(["Cl"], [], [-1]), bromid: lille(["Br"], [], [-1]),
        iodid: lille(["I"], [], [-1]),
        hydroxide: "hydroxid", hydronium: "oxonium", fluoride: "fluorid", chloride: "chlorid",
        bromide: "bromid", iodide: "iodid",
        "oh-": "hydroxid", "h3o+": "oxonium", "nh4+": "ammonium", "f-": "fluorid", "cl-": "chlorid",
        "br-": "bromid", "i-": "iodid"
    };

    var HAEVET = { "⁺": "+", "⁻": "-", "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

    var GENEREL = "Det navn kan tegnebrættet ikke læse. Det kender carbonhydrider, halogenforbindelser, alkoholer, " +
        "aldehyder, ketoner, carboxylsyrer, estre, amider, aminer og ethere, fx propan-2-ol. Andre stoffer tegner du selv.";

    /* ----- Skrivemaaderne ------------------------------------------------ */
    function grundform(t) {
        return String(t || "").toLowerCase().trim()
            .replace(/[⁺⁻₀-₉]/g, function (c) { return HAEVET[c]; })
            .replace(/[‐-―−]/g, "-")
            .replace(/\s+/g, "")
            .replace(/\.$/, "");
    }

    function normaliser(t) {
        var s = grundform(t);
        s = s.replace(/^\(?z\)?-/, "cis-").replace(/^\(?e\)?-/, "trans-");
        s = s.replace(/chloro/g, "chlor").replace(/bromo/g, "brom").replace(/iodo/g, "iod").replace(/fluoro/g, "fluor");
        s = s.replace(/tert-butyl|t-butyl/g, "(1,1-dimethylethyl)").replace(/sec-butyl/g, "(1-methylpropyl)")
            .replace(/isobutyl/g, "(2-methylpropyl)").replace(/isopropyl/g, "(1-methylethyl)")
            .replace(/vinyl/g, "ethenyl").replace(/allyl/g, "(prop-2-enyl)").replace(/benzyl/g, "(phenylmethyl)")
            .replace(/acetoxy/g, "acetyloxy");
        s = s.replace(/2-methylpropan-2-yl/g, "1,1-dimethylethyl").replace(/propan-2-yl/g, "1-methylethyl")
            .replace(/butan-2-yl/g, "1-methylpropyl").replace(/-1-yl/g, "yl");
        s = s.replace(/\(\(([^()]*)\)\)/g, "($1)");
        /* Engelske endelser: ethanoic acid, ethanoate, propanone, ethanamine */
        s = s.replace(/benzoicacid$/, "benzoesyre").replace(/carboxylicacid$/, "carboxylsyre").replace(/oicacid$/, "syre")
            .replace(/oate$/, "oat").replace(/carboxylate$/, "carboxylat").replace(/aldehyde$/, "aldehyd")
            .replace(/amine$/, "amin").replace(/amide$/, "amid").replace(/one$/, "on").replace(/one(?=[-,)])/, "on");
        s = s.replace(/(an|en|yn)e(?=$|[-,)]|di|tri|tetra)/g, "$1");
        return s;
    }

    /* Den gamle danske skrivemaade for estre: ethansyreethylester */
    function gammelEster(s) {
        var m = /^(.+)syre(.+yl)ester$/.exec(s);
        return m ? m[2] + m[1] + "oat" : null;
    }

    function tal(s) { return s.split(",").filter(function (x) { return x !== ""; }).map(Number); }
    function erTal(x) { return typeof x === "number"; }

    /* Den tilsvarende lukkeparentes */
    function lukkende(s) {
        var dybde = 0;
        for (var i = 0; i < s.length; i++) {
            if ("([{".indexOf(s[i]) >= 0) dybde++;
            if (")]}".indexOf(s[i]) >= 0) { dybde--; if (!dybde) return i; }
        }
        return -1;
    }

    /* ----- Endelsen: -ol, -on, -amin, -syre, -al, -amid, -oat ... -------------------
       mode: "forb" (et stof), "sub" (en sidegruppe, -yl), "acyl" (-oyl),
       "oat" (syredelen af en ester) */
    var FEJL_SUF = {
        alkohol: "Skriv, hvor OH-gruppen sidder, fx propan-1-ol eller propan-2-ol.",
        keton: "Skriv, hvor C=O sidder, fx pentan-2-on eller pentan-3-on.",
        amin: "Skriv, hvor NH₂-gruppen sidder, fx propan-1-amin eller propan-2-amin.",
        ende: "En kæde kan højst have to af de grupper, én i hver ende.",
        tilk: "Skriv, hvor grupperne sidder, fx benzen-1,4-dicarboxylsyre."
    };

    function laesSuffiks(t, mode) {
        var m;
        if (mode === "sub") return /^(-1-)?yl$/.test(t) ? { type: null } : null;
        if (mode === "acyl") return t === "oyl" ? { type: null } : null;
        if (mode === "oat") {
            if ((m = /^(di|tri)?oat$/.exec(t))) return { type: "ester", antal: m[1] ? MULT[m[1]] : 1, locs: null };
            if ((m = /^(?:-([\d,]+)-)?(di|tri|tetra)?carboxylat$/.exec(t))) return { type: "ester", tilk: true, antal: m[2] ? MULT[m[2]] : 1, locs: m[1] ? tal(m[1]) : null };
            return null;
        }
        if (t === "") return { type: null };
        if ((m = /^(?:-([\d,]+)-)?(di|tri|tetra|penta|hexa)?(ol|on|amin)$/.exec(t))) {
            return { type: { ol: "alkohol", on: "keton", amin: "amin" }[m[3]], antal: m[2] ? MULT[m[2]] : 1, locs: m[1] ? tal(m[1]) : null };
        }
        if ((m = /^(di)?(syre|al|amid)$/.exec(t))) return { type: { syre: "syre", al: "aldehyd", amid: "amid" }[m[2]], antal: m[1] ? 2 : 1, locs: null };
        if ((m = /^(?:-([\d,]+)-)?(di|tri|tetra)?(carboxylsyre|carbaldehyd|carboxamid)$/.exec(t))) {
            return { type: { carboxylsyre: "syre", carbaldehyd: "aldehyd", carboxamid: "amid" }[m[3]], tilk: true,
                antal: m[2] ? MULT[m[2]] : 1, locs: m[1] ? tal(m[1]) : null };
        }
        return null;
    }

    /* Dobbelt- og tripelbindinger og saa endelsen */
    var UMAETTET = [
        { re: /^an/, f: function () { return [[], 0, [], 0]; } },
        { re: /^a?-([\d,]+)-(di|tri|tetra)?en-([\d,]+)-(di|tri|tetra)?yn/, f: function (m) { return [tal(m[1]), m[2] ? MULT[m[2]] : 1, tal(m[3]), m[4] ? MULT[m[4]] : 1]; } },
        { re: /^a?-([\d,]+)-(di|tri|tetra)?en/, f: function (m) { return [tal(m[1]), m[2] ? MULT[m[2]] : 1, [], 0]; } },
        { re: /^a?-([\d,]+)-(di|tri|tetra)?yn/, f: function (m) { return [[], 0, tal(m[1]), m[2] ? MULT[m[2]] : 1]; } },
        { re: /^a?(di|tri|tetra)?en(di|tri)?yn/, f: function (m) { return [null, m[1] ? MULT[m[1]] : 1, null, m[2] ? MULT[m[2]] : 1]; } },
        { re: /^a?(di|tri|tetra)?en/, f: function (m) { return [null, m[1] ? MULT[m[1]] : 1, [], 0]; } },
        { re: /^a?(di|tri|tetra)?yn/, f: function (m) { return [[], 0, null, m[1] ? MULT[m[1]] : 1]; } }
    ];

    function laesEndelse(rest, mode) {
        if (mode === "sub" && /^yl$/.test(rest)) return { dbl: [], nd: 0, tri: [], nt: 0, suffix: { type: null } };
        for (var i = 0; i < UMAETTET.length; i++) {
            var m = UMAETTET[i].re.exec(rest);
            if (!m) continue;
            var suf = laesSuffiks(rest.slice(m[0].length), mode);
            if (!suf) continue;
            var u = UMAETTET[i].f(m);
            return { dbl: u[0], nd: u[1], tri: u[2], nt: u[3], suffix: suf };
        }
        return null;
    }

    function benzen(suf) {
        return { n: 6, ring: true, aromat: true, dbl: [], nd: 0, tri: [], nt: 0, suffix: suf || { type: null } };
    }

    function laesStam(r, mode) {
        if (mode === "forb") {
            if (r === "phenol") return benzen({ type: "alkohol", antal: 1, locs: [1] });
            if (r === "benzoesyre") return benzen({ type: "syre", tilk: true, antal: 1, locs: [1] });
            if (r === "benzaldehyd") return benzen({ type: "aldehyd", tilk: true, antal: 1, locs: [1] });
            if (r === "benzamid") return benzen({ type: "amid", tilk: true, antal: 1, locs: [1] });
        }
        if (mode === "oat" && r === "benzoat") return benzen({ type: "ester", tilk: true, antal: 1, locs: [1] });
        if (mode === "sub" && r === "phenyl") return benzen(null);
        if (mode === "acyl" && r === "benzoyl") return { benzoyl: true };
        if (r.indexOf("benzen") === 0) {
            var sb = laesSuffiks(r.slice(6), mode);
            if (sb && (mode === "forb" || mode === "oat")) return benzen(sb);
        }
        var ring = false, rr = r;
        if (rr.indexOf("cyclo") === 0) { ring = true; rr = rr.slice(5); }
        for (var i = 0; i < STAMMER.length; i++) {
            if (rr.indexOf(STAMMER[i].s) !== 0) continue;
            var e = laesEndelse(rr.slice(STAMMER[i].s.length), mode);
            if (e) { e.n = STAMMER[i].n; e.ring = ring; e.aromat = false; return e; }
        }
        return null;
    }

    /* ----- Forstavelserne: 3-ethyl-2,2-dimethyl, 4-(1-methylethyl), N-methyl --------- */
    function laesPraefikser(pre) {
        var pos = 0, grupper = [];
        while (pos < pre.length) {
            if (pre[pos] === "-") { pos++; continue; }
            var rest = pre.slice(pos), locs = null, antal = 1, m;
            if ((m = /^((?:\d+|n)(?:,(?:\d+|n))*)-/.exec(rest))) {
                locs = m[1].split(",").map(function (x) { return x === "n" ? "N" : +x; });
                pos += m[0].length;
                rest = pre.slice(pos);
            }
            if (!SIMPEL_RE.test(rest) && (m = /^(tetrakis|tris|bis|tetra|penta|hexa|tri|di)(?=[a-z(\[])/.exec(rest))) {
                antal = MULT[m[1]];
                pos += m[1].length;
                rest = pre.slice(pos);
            }
            var sub = null;
            if ("([{".indexOf(rest[0]) >= 0) {
                var slut = lukkende(rest);
                if (slut < 0) return { fejl: "Der mangler en slutparentes." };
                sub = laesSub(rest.slice(1, slut));
                if (sub.fejl) return sub;
                pos += slut + 1;
            } else if ((m = SIMPEL_RE.exec(rest))) {
                sub = laesSub(m[1]);
                if (sub.fejl) return sub;
                pos += m[1].length;
            } else {
                return { fejl: "Tegnebrættet kender ikke \"" + rest.replace(/-.*$/, "") + "\"." };
            }
            if (locs && locs.length !== antal) {
                return { fejl: "Antallet af numre passer ikke: " + locs.join(",") + " er " + locs.length + (locs.length === 1 ? " nummer." : " numre.") };
            }
            grupper.push({ locs: locs, antal: antal, sub: sub });
        }
        return { grupper: grupper };
    }

    /* ----- En sidegruppe uden tal foran ------------------------------------------------ */
    function laesAcyl(t) {
        if (t === "acetyl") return { n: 2, ring: false, dbl: [], tri: [], grupper: [] };
        if (t === "formyl") return { formyl: true };
        if (t === "benzoyl") return { benzoyl: true };
        return laesKaede(t, "acyl");
    }

    function laesSub(t) {
        var m;
        if (HALO[t]) return { halogen: HALO[t] };
        if (t === "hydroxy") return { o: "hydroxy" };
        if (t === "oxo") return { oxo: true };
        if (t === "amino") return { n: [] };
        if (t === "carboxy") return { c: "carboxy" };
        if (t === "carboxylato") return { c: "carboxylato" };
        if (t === "carbamoyl") return { c: "carbamoyl", r: [] };
        if ((m = /^(.+)carbamoyl$/.exec(t))) {
            var gc = laesGruppeListe(m[1]);
            return gc ? { c: "carbamoyl", r: gc } : { fejl: "Tegnebrættet kender ikke \"" + t + "\"." };
        }
        if (t === "formyl" || t === "acetyl" || t === "benzoyl" || /oyl$/.test(t)) {
            var a = laesAcyl(t);
            return a.fejl ? a : { acyl: a };
        }
        if ((m = /^(.+oxy)carbonyl$/.exec(t))) {
            var r = laesSub(m[1]);
            return r.o === "alkoxy" ? { c: "ester", r: r.r } : { fejl: "Tegnebrættet kender ikke \"" + t + "\"." };
        }
        if ((m = /^(.+)amino$/.exec(t))) {
            if (/(oyl|acetyl|formyl)$/.test(m[1])) {
                var a2 = laesAcyl(m[1]);
                return a2.fejl ? a2 : { nAcyl: a2 };
            }
            var g = laesGruppeListe(m[1]);
            return g ? { n: g } : { fejl: "Tegnebrættet kender ikke \"" + t + "\"." };
        }
        if ((m = /^(.+)oxy$/.exec(t))) {
            var d = m[1];
            if (/(oyl|acetyl|formyl)$/.test(d)) {
                var a3 = laesAcyl(d);
                return a3.fejl ? a3 : { o: "acyloxy", acyl: a3 };
            }
            var k0 = laesKaede(/yl$/.test(d) ? d : d + "yl", "sub");
            return k0.fejl ? k0 : { o: "alkoxy", r: { kulstof: k0 } };
        }
        var k = laesKaede(t, "sub");
        return k.fejl ? k : { kulstof: k };
    }

    /* Grupper efter hinanden uden tal: diethyl, ethylmethyl, (1-methylethyl), phenyl */
    function atomiske(t) {
        if (!t) return [];
        var m, antal = 1, rest = t;
        if (!ALKYL_RE.test(t) && (m = /^(tris|bis|tri|di)(?=[a-z(\[])/.exec(t))) { antal = MULT[m[1]]; rest = t.slice(m[1].length); }
        var sub, len;
        if ("([{".indexOf(rest[0]) >= 0) {
            var slut = lukkende(rest);
            if (slut < 0) return null;
            var k = laesKaede(rest.slice(1, slut), "sub");
            if (k.fejl) return null;
            sub = { kulstof: k };
            len = slut + 1;
        } else if ((m = ALKYL_RE.exec(rest))) {
            var k2 = laesKaede(m[1], "sub");
            if (k2.fejl) return null;
            sub = { kulstof: k2 };
            len = m[1].length;
        } else return null;
        var resten = atomiske(rest.slice(len));
        if (!resten) return null;
        var ud = [];
        for (var i = 0; i < antal; i++) ud.push(sub);
        return ud.concat(resten);
    }

    function laesGruppeListe(t) {
        var a = atomiske(t);
        if (a && a.length) return a;
        var k = laesKaede(t, "sub");
        return k.fejl ? null : [{ kulstof: k }];
    }

    /* ----- Hele kaeden: forstavelser + stamme + endelse ---------------------------- */
    function std(st, antal, mode) {
        var suf = st.suffix && st.suffix.type ? st.suffix : null;
        var ende = suf && !suf.tilk && /^(syre|aldehyd|amid|ester)$/.test(suf.type);
        if (antal !== 1) return null;
        if (st.ring) return suf ? null : [1];
        if (mode === "sub") return st.n <= 2 ? [1] : null;
        if (st.n <= 2 || (st.n === 3 && !suf && mode !== "acyl")) return [1];
        if (st.n === 3 && (ende || mode === "acyl")) return [2];
        return null;
    }

    function standardLok(st, mode) {
        if (st.benzoyl) return null;
        if (st.dbl === null) {
            st.dbl = std(st, st.nd, mode);
            if (!st.dbl) return "Skriv, hvor dobbeltbindingen sidder, fx but-1-en eller but-2-en.";
        }
        if (st.tri === null) {
            st.tri = std(st, st.nt, mode);
            if (!st.tri) return "Skriv, hvor tripelbindingen sidder, fx but-1-yn.";
        }
        if (st.dbl.length !== st.nd || st.tri.length !== st.nt) return "Antallet af numre passer ikke med di- eller tri-.";
        var suf = st.suffix && st.suffix.type ? st.suffix : null;
        if (!suf) return null;
        var ende = !suf.tilk && /^(syre|aldehyd|amid|ester)$/.test(suf.type);
        if (suf.locs === null) {
            if (ende) {
                if (suf.antal === 1) suf.locs = [1];
                else if (suf.antal === 2 && !st.ring && st.n > 1) suf.locs = [1, st.n];
                else return FEJL_SUF.ende;
            } else if (suf.antal === 1) {
                if (st.ring) suf.locs = [1];
                else if (suf.type === "keton") suf.locs = st.n === 2 ? [1] : (st.n === 3 || st.n === 4 ? [2] : null);
                else if (!suf.tilk) suf.locs = st.n <= 2 ? [1] : null;
                if (!suf.locs) return suf.tilk ? FEJL_SUF.tilk : FEJL_SUF[suf.type];
            } else return suf.tilk ? FEJL_SUF.tilk : (FEJL_SUF[suf.type] || GENEREL);
        }
        if (suf.locs.length !== suf.antal) return "Antallet af numre passer ikke: " + suf.locs.join(",") + " er " + suf.locs.length + (suf.locs.length === 1 ? " nummer." : " numre.");
        return null;
    }

    function laesKaede(s, mode) {
        var foersteFejl = null;
        for (var i = 0; i < s.length; i++) {
            var st = laesStam(s.slice(i), mode);
            if (!st) continue;
            if (st.benzoyl) { if (i === 0) return st; continue; }
            var pre = s.slice(0, i), gammel = false;
            /* Den gamle skrivemaade: tallene for dobbeltbindingen eller OH-gruppen staar foran stammen */
            var gl = /(?:^|-)([\d,]+)-$/.exec(pre);
            var suf = st.suffix && st.suffix.type ? st.suffix : null;
            if (gl && (st.dbl === null || st.tri === null)) {
                var l = tal(gl[1]);
                if (st.dbl === null) { st.dbl = l.slice(0, st.nd); l = l.slice(st.nd); }
                if (st.tri === null) st.tri = l.slice(0, st.nt);
                pre = pre.slice(0, pre.length - gl[1].length - 1);
                gammel = true;
            } else if (gl && suf && suf.locs === null && !/^(syre|aldehyd|amid|ester)$/.test(suf.type) || gl && suf && suf.tilk && suf.locs === null) {
                suf.locs = tal(gl[1]);
                pre = pre.slice(0, pre.length - gl[1].length - 1);
                gammel = true;
            }
            var p = laesPraefikser(pre);
            if (p.fejl) { foersteFejl = foersteFejl || p.fejl; continue; }
            st.grupper = p.grupper;
            st.gammel = gammel;
            var f = standardLok(st, mode);
            if (f) return { fejl: f };
            return st;
        }
        return { fejl: foersteFejl || GENEREL };
    }

    /* ----- Estre, aminer og ethere, hvor grupperne staar foran ----------------------- */
    function laesEster(s) {
        if (!/(oat|carboxylat)$/.test(s)) return null;
        var fejl = null;
        for (var j = 1; j < s.length - 3; j++) {
            var venstre = s.slice(0, j), hoejre = s.slice(j), stereo = null;
            if (hoejre[0] === "-") continue;
            venstre = venstre.replace(/-$/, "");
            var mm = /^(cis|trans)-/.exec(hoejre);
            if (mm) { stereo = mm[1]; hoejre = hoejre.slice(mm[0].length); }
            var grp = laesGruppeListe(venstre);
            if (!grp) continue;
            var syre = laesKaede(hoejre, "oat");
            if (syre.fejl) { fejl = fejl || syre.fejl; continue; }
            if (grp.length !== syre.suffix.antal) {
                fejl = "Der skal være en alkylgruppe for hver estergruppe, fx diethylbutandioat.";
                continue;
            }
            return { ester: true, syre: syre, alkyl: grp, stereo: stereo, gammel: syre.gammel };
        }
        /* Uden alkylgruppe foran: carboxylat-ionen, ethanoat (CH₃COO⁻) */
        if (!fejl) {
            var ion = laesKaede(s, "oat");
            if (!ion.fejl) return { anion: true, syre: ion, gammel: ion.gammel };
        }
        return fejl ? { fejl: fejl } : null;
    }

    function laesFunktionel(s, endelse, min, maks) {
        if (s.slice(-endelse.length) !== endelse) return null;
        var venstre = s.slice(0, -endelse.length);
        if (!venstre) return null;
        var g = laesGruppeListe(venstre);
        if (!g || g.length < min || g.length > maks) return null;
        return g;
    }

    /* ----- Molekylet bygges ------------------------------------------------ */
    var BENZENRING = benzen(null);
    BENZENRING.grupper = [];

    function byg(spec) {
        var mol = new Mol(), fejl = null;
        function atom(el) { return mol.tilfoej(el, 0, 0).id; }
        function bind(a, b, o) { mol.bind(a, b, o || 1); }
        function nummerFejl(l, n) { fejl = fejl || "Nummeret " + l + " passer ikke til en kæde med " + n + " C."; }

        function kaede(sp, fra, esterAlkyl) {
            var n = sp.n, ids = [], i;
            for (i = 0; i < n; i++) ids.push(atom("C"));
            for (i = 0; i < n - 1; i++) bind(ids[i], ids[i + 1], 1);
            if (sp.ring && n >= 3) bind(ids[n - 1], ids[0], 1);
            if (sp.aromat) [0, 2, 4].forEach(function (k) { mol.binding(ids[k], ids[k + 1]).orden = 2; });
            function orden(l, o) {
                if (l < 1 || l > (sp.ring ? n : n - 1)) { nummerFejl(l, n); return; }
                var bd = mol.binding(ids[l - 1], ids[l % n]);
                if (bd) bd.orden = o;
            }
            sp.dbl.forEach(function (l) { orden(l, 2); });
            sp.tri.forEach(function (l) { orden(l, 3); });
            if (fra !== undefined && fra !== null) bind(fra, ids[0], 1);
            function C(l) {
                if (l < 1 || l > n) { nummerFejl(l, n); return null; }
                return ids[l - 1];
            }
            var nAtomer = [];
            var suf = sp.suffix && sp.suffix.type ? sp.suffix : null;
            var ende = suf && !suf.tilk && /^(syre|aldehyd|amid|ester)$/.test(suf.type);
            if (suf) {
                var anion = esterAlkyl === "anion";
            var alk = anion ? [] : (esterAlkyl || []).slice();
                suf.locs.forEach(function (l) {
                    var c = C(l);
                    if (c === null) return;
                    if (suf.tilk) { var ny = atom("C"); bind(c, ny, 1); c = ny; }
                    else if (ende && l !== 1 && l !== n) { fejl = fejl || FEJL_SUF.ende; return; }
                    if (suf.type === "alkohol") bind(c, atom("O"), 1);
                    else if (suf.type === "keton" || suf.type === "aldehyd") bind(c, atom("O"), 2);
                    else if (suf.type === "amin") { var nn = atom("N"); bind(c, nn, 1); nAtomer.push(nn); }
                    else if (suf.type === "syre") { bind(c, atom("O"), 2); bind(c, atom("O"), 1); }
                    else if (suf.type === "amid") { bind(c, atom("O"), 2); var na = atom("N"); bind(c, na, 1); nAtomer.push(na); }
                    else if (suf.type === "ester") {
                        bind(c, atom("O"), 2);
                        var ob = atom("O");
                        bind(c, ob, 1);
                        var r = alk.shift();
                        if (r) sub(r, ob);
                        else if (anion) mol.atom(ob).q = -1;
                    }
                });
            }
            var ialt = 0;
            (sp.grupper || []).forEach(function (g) { if (!g.locs || g.locs.some(erTal)) ialt += g.antal; });
            (sp.grupper || []).forEach(function (g) {
                var locs = g.locs;
                if (!locs) {
                    if (n === 1 || (n === 2 && !suf && ialt === 1) || (n === 2 && ende) || (sp.ring && !suf && ialt === 1)) {
                        var l0 = n === 2 && ende ? (suf.locs[0] === 1 ? 2 : 1) : 1;
                        locs = [];
                        for (var k = 0; k < g.antal; k++) locs.push(l0);
                    } else { fejl = fejl || "Skriv numrene foran sidegrupperne, fx 2-methyl."; return; }
                }
                locs.forEach(function (l) {
                    if (l === "N") {
                        if (nAtomer.length !== 1) { fejl = fejl || "N- foran et navn kræver én amin- eller amidgruppe, fx N-methylethanamid."; return; }
                        sub(g.sub, nAtomer[0]);
                        return;
                    }
                    var c = C(l);
                    if (c !== null) sub(g.sub, c);
                });
            });
            return ids;
        }

        function acyl(A, at) {
            var c;
            if (A.formyl) { c = atom("C"); bind(at, c, 1); bind(c, atom("O"), 2); return; }
            if (A.benzoyl) { c = atom("C"); bind(at, c, 1); bind(c, atom("O"), 2); kaede(BENZENRING, c); return; }
            var ids = kaede(A, at);
            bind(ids[0], atom("O"), 2);
        }

        function sub(S, at) {
            var o, nn, c;
            if (S.halogen) bind(at, atom(S.halogen), 1);
            else if (S.kulstof) kaede(S.kulstof, at);
            else if (S.oxo) bind(at, atom("O"), 2);
            else if (S.o === "hydroxy") bind(at, atom("O"), 1);
            else if (S.o === "alkoxy") { o = atom("O"); bind(at, o, 1); sub(S.r, o); }
            else if (S.o === "acyloxy") { o = atom("O"); bind(at, o, 1); acyl(S.acyl, o); }
            else if (S.n) { nn = atom("N"); bind(at, nn, 1); S.n.forEach(function (r) { sub(r, nn); }); }
            else if (S.nAcyl) { nn = atom("N"); bind(at, nn, 1); acyl(S.nAcyl, nn); }
            else if (S.c === "carboxy") { c = atom("C"); bind(at, c, 1); bind(c, atom("O"), 2); bind(c, atom("O"), 1); }
            else if (S.c === "carboxylato") { c = atom("C"); bind(at, c, 1); bind(c, atom("O"), 2); o = atom("O"); bind(c, o, 1); mol.atom(o).q = -1; }
            else if (S.c === "carbamoyl") { c = atom("C"); bind(at, c, 1); bind(c, atom("O"), 2); nn = atom("N"); bind(c, nn, 1); (S.r || []).forEach(function (r) { sub(r, nn); }); }
            else if (S.c === "ester") { c = atom("C"); bind(at, c, 1); bind(c, atom("O"), 2); o = atom("O"); bind(c, o, 1); sub(S.r, o); }
            else if (S.acyl) acyl(S.acyl, at);
        }

        if (spec.ester) kaede(spec.syre, null, spec.alkyl);
        else if (spec.anion) kaede(spec.syre, null, "anion");
        else if (spec.amin) { var n0 = atom("N"); spec.amin.forEach(function (g) { sub(g, n0); }); }
        else if (spec.ether) { var o0 = atom("O"); spec.ether.forEach(function (g) { sub(g, o0); }); }
        else kaede(spec);

        if (!fejl) {
            mol.atomer.forEach(function (a) {
                if (!fejl && mol.bindingssum(a.id) > Mol.maksValens(a.el, a.q)) {
                    fejl = "Navnet giver et " + a.el + "-atom med mere end " + ["", "én", "to", "tre", "fire"][Mol.maksValens(a.el, a.q)] + " bindinger.";
                }
            });
        }
        return fejl ? { fejl: fejl } : { mol: mol };
    }

    function bygLille(def) {
        var mol = new Mol();
        var ids = def.atomer.map(function (el, i) {
            var a = mol.tilfoej(el, 0, 0);
            if (def.q && def.q[i]) a.q = def.q[i];
            return a.id;
        });
        def.bindinger.forEach(function (b) { mol.bind(ids[b[0]], ids[b[1]], b[2]); });
        mol.atomer.forEach(function (a, i) { a.x = i * 0.9; a.y = 0; });
        return mol;
    }

    /* Molekylet lagt ud og navngivet */
    function udlagt(mol, stereo) {
        var res = NK.Navn.analyser(mol);
        if (!res.navn) return { fejl: "Molekylet kan tegnes, men ikke navngives her." };
        NK.Layout.zigzag(mol, res, stereo);
        return { mol: mol, res: NK.Navn.analyser(mol) };
    }

    function lig(a, b) { return String(a || "").toLowerCase() === String(b || "").toLowerCase(); }

    /* ----- Indgangen ----------------------------------------------------------
       Giver { mol, res, navn, note } eller { fejl }. mol er lagt ud med (0, 0)
       i midten. */
    function laes(tekst) {
        var raa = grundform(tekst);
        if (!raa) return { fejl: "Skriv et navn." };
        var s = normaliser(tekst);
        /* ethanoat-ion, acetation og hydroxidion: "ion" er ikke en del af navnet */
        var udenIon = function (t) { return t.replace(/(at|id|ium)-?ion$/, "$1"); };
        raa = udenIon(raa);
        s = udenIon(s);
        var u = UORG[s] || UORG[s.replace(/[-,]/g, "")];
        if (typeof u === "string") u = UORG[u];
        if (u) {
            var lm = bygLille(u);
            lm.centrer(0, 0);
            var lr = NK.Navn.analyser(lm);
            return { mol: lm, res: lr, navn: lr.navn || s, note: "" };
        }
        /* Trivialnavne: eddikesyre, acetone, glycerol ... */
        var tri = NK.Trivialnavne && NK.Smiles && (NK.Trivialnavne.laes(raa) || NK.Trivialnavne.laes(s));
        if (tri) {
            var ud = udlagt(NK.Smiles.laes(tri.smiles), tri.stereo);
            if (ud.fejl) return ud;
            ud.navn = ud.res.navn;
            /* Linjen "Tegnet: ethansyre" siger det systematiske navn; ingen note */
            ud.note = "";
            ud.trivial = tri.navn;
            return ud;
        }
        var gammel = false, ge = gammelEster(s);
        if (ge) { s = ge; gammel = true; }
        var stereo = null, m = /^(cis|trans)-/.exec(s);
        var udenStereo = s;
        if (m) { stereo = m[1]; udenStereo = s.slice(m[0].length); }

        /* Hvilken slags navn: ester, alkylamin, ether eller et almindeligt */
        var spec = laesEster(udenStereo);
        if (spec && spec.fejl) {
            var alm = laesKaede(udenStereo, "forb");
            spec = alm.fejl ? spec : alm;
        }
        if (spec && spec.ester && spec.stereo) stereo = spec.stereo;
        if (!spec) {
            var g = laesFunktionel(udenStereo, "amin", 1, 3);
            if (g) spec = { amin: g };
        }
        if (!spec) {
            var g2 = laesFunktionel(udenStereo, "ether", 2, 2);
            if (g2) spec = { ether: g2 };
        }
        if (!spec) spec = laesKaede(udenStereo, "forb");
        if (spec.fejl) return spec;
        if (spec.gammel) gammel = true;

        var b = byg(spec);
        if (b.fejl) return b;
        var r = udlagt(b.mol, stereo === "cis" ? "cis" : null);
        if (r.fejl) return r;
        var res = r.res;

        /* Noten: hvad hedder det, eleven skrev? */
        var note = "";
        var alt = res.alternativer || [];
        var ren = function (t) { return String(t).toLowerCase().replace(/[()\[\]{}]/g, ""); };
        /* Den gamle skrivemaade med tallene foran stammen: samme bogstaver og samme tal */
        var aftryk = function (t) { return ren(t).replace(/[^a-z]/g, "") + "|" + (ren(t).match(/\d+/g) || []).sort().join(","); };
        var engelsk = raa !== s && raa.replace(/^\(?[ze]\)?-/, "") !== s.replace(/^(cis|trans)-/, "");
        var somNavn = lig(s, res.navn) || (!stereo && !res.stereo && lig(s, res.navnUdenStereo));
        var somAndet = alt.some(function (a) { return lig(a, udenStereo); }) && (!res.stereo || !stereo || stereo === res.stereo);
        if (gammel && [res.navn, res.navnUdenStereo].concat(alt).some(function (a) { return aftryk(a) === aftryk(s); })) {
            note = "Den nyere skrivemåde er " + res.navn + ".";
        } else if (somNavn || somAndet) {
            if (engelsk) note = "På dansk: " + res.navn + ".";
            else if (!somNavn) note = (res.stereo && !stereo ? "Tegnet som " + res.stereo + ". " : "") + "Kaldes også " + res.navn + ".";
        } else if (NK.Navn.gammelForm(res) && lig(s, NK.Navn.gammelForm(res))) {
            note = "Den nyere skrivemåde er " + res.navn + ".";
        } else if (res.stereo && !stereo && lig(res.navnUdenStereo, s)) {
            note = "Tegnet som " + res.stereo + ". Skriv cis- eller trans- foran for at vælge.";
        } else if (stereo && !res.stereo && lig(res.navnUdenStereo, udenStereo)) {
            note = "Her er der ingen cis eller trans.";
        } else if (ren(s) === ren(res.navn)) {
            note = "Med parenteser: " + res.navn + ".";
        } else {
            note = "Det rigtige navn er " + res.navn + ".";
        }
        return { mol: r.mol, res: res, navn: res.navn, note: note };
    }

    /* Et reaktionsskema: navne adskilt af +, ->, →, <=> eller ⇌ */
    function skema(tekst) {
        /* + lige efter H3O og NH4 er ladningen, ikke et plus */
        tekst = String(tekst || "").replace(/(h3o|h₃o|nh4|nh₄)\+/gi, "$1⁺");
        var dele = tekst.split(/(<=>|<->|⇌|⇄|-+>|→|=>|\+)/);
        var ud = [];
        for (var i = 0; i < dele.length; i++) {
            var d = dele[i].trim();
            if (!d) continue;
            if (d === "+") ud.push({ type: "plus" });
            else if (/^(<=>|<->|⇌|⇄)$/.test(d)) ud.push({ type: "lig" });
            else if (/^(-+>|→|=>)$/.test(d)) ud.push({ type: "pil" });
            else {
                var r = laes(d);
                if (r.fejl) return { fejl: "\"" + d + "\": " + r.fejl };
                ud.push({ type: "mol", mol: r.mol, res: r.res, navn: r.navn, note: r.note, skrevet: d });
            }
        }
        if (!ud.length) return { fejl: "Skriv et navn." };
        return { dele: ud };
    }

    NK.NavnLaeser = { laes: laes, skema: skema, normaliser: normaliser };
}());
