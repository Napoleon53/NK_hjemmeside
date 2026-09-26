/* =====================================================================
   model.js - kemien bag alle tre faner

   NK.Syrebase  stofferne som formler: ladning, korresponderende par,
                hvem der er syre og base (ud fra pKs), traeningens par
                for hvert niveau, de forkerte svar paa fane 2 og
                forklaringerne paa fane 3. Intet her tegner noget.
   NK.Mol       strukturerne paa fane 1: atomer, bindinger og frie
                elektronpar. En hydron flyttes ved at fjerne et H fra
                syren (elektronparret bliver hos atomet, og ladningen
                falder med 1) og saette det paa basens frie par
                (ladningen stiger med 1). Parrene og ladningerne regnes
                ud af valenselektronerne, ikke skrevet i data.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = {};
    var TO_PI = Math.PI * 2;

    /* ----- Stofferne ----------------------------------------------------------- */
    S.del = function (id) {
        var p = String(id).split(":");
        return { fam: p[0], n: parseInt(p[1], 10) };
    };

    S.id = function (fam, n) { return fam + ":" + n; };

    S.findes = function (id) {
        var p = S.del(id), f = D.FAM[p.fam];
        return !!f && p.n >= f.min && p.n <= f.max;
    };

    S.ladning = function (id) {
        var p = S.del(id);
        return p.n + D.FAM[p.fam].q0;
    };

    /* Formlen med almindelige tal og uden ladning: "H3O", "CH3COOH", "OH" */
    S.raaFormel = function (id) {
        var p = S.del(id), f = D.FAM[p.fam];
        if (p.fam === "vand" && p.n === 1) return "OH";
        var h = p.n === 0 ? "" : (p.n === 1 ? "H" : "H" + p.n);
        return f.hFoer ? h + f.kerne : f.kerne + h;
    };

    /* Formlen, som den skrives: H₃O⁺. q giver en anden ladning (til de
       forkerte svar, fx Cl uden ladning). */
    S.formel = function (id, q) {
        if (q === undefined) q = S.ladning(id);
        return NK.formel(S.raaFormel(id)) + NK.ladningHaevet(q);
    };

    S.navn = function (id) {
        var p = S.del(id), f = D.FAM[p.fam];
        return (f.navn && f.navn[p.n]) || S.formel(id);
    };

    S.pks = function (id) { return D.PKS[id]; };
    S.korr = function (id, d) { var p = S.del(id); return S.id(p.fam, p.n + d); };
    S.kanGive = function (id) { return D.PKS[id] !== undefined; };
    S.kanTage = function (id) { return D.PKS[S.korr(id, 1)] !== undefined; };
    S.amfolyt = function (id) { return S.kanGive(id) && S.kanTage(id); };

    /* ----- Hvem er syren? ---------------------------------------------------------
       For hvert af de to stoffer: kan det give en hydron til det andet?
       logK = pKs(basens korresponderende syre) - pKs(syren). Den retning,
       der har den stoerste logK, er den, reaktionen gaar. */
    S.retninger = function (x, y) {
        var ud = [];
        [[x, y], [y, x]].forEach(function (par) {
            var a = par[0], b = par[1];
            if (S.kanGive(a) && S.kanTage(b)) ud.push({ syre: a, base: b, logK: S.pks(S.korr(b, 1)) - S.pks(a) });
        });
        return ud;
    };

    S.roller = function (x, y) {
        var r = S.retninger(x, y);
        if (!r.length) return null;
        r.sort(function (p, q) { return q.logK - p.logK; });
        var v = r[0];
        return {
            syre: v.syre, base: v.base, kb: S.korr(v.syre, -1), ks: S.korr(v.base, 1),
            logK: v.logK, forskel: r.length > 1 ? r[0].logK - r[1].logK : Infinity
        };
    };

    /* Maa traeningen bruge parret? Kun hvis rollerne er klare:
       * ikke to stoffer fra samme familie (HCO₃⁻ + CO₃²⁻ er ingen
         reaktion), bortset fra H₃O⁺ + OH⁻,
       * kan begge give, skal den ene retning vaere mindst 10⁶ gange
         bedre (HCO₃⁻ + H₂O er for tvetydig),
       * uden vand skal reaktionen forloebe (logK > 0),
       * med vand maa den gerne vaere svag, men ikke saa svag, at der
         praktisk talt intet sker (SO₄²⁻ + H₂O har logK = −12). */
    S.gyldig = function (x, y) {
        if (x === y) return null;
        var px = S.del(x), py = S.del(y);
        if (px.fam === py.fam && !(px.fam === "vand" && Math.abs(px.n - py.n) === 2)) return null;
        var r = S.roller(x, y);
        if (!r) return null;
        if (r.forskel < 6) return null;
        var medVand = x === "vand:2" || y === "vand:2";
        if (!medVand && r.logK <= 0) return null;
        if (medVand && r.logK < -11) return null;
        return r;
    };

    /* Alle gyldige par paa et niveau: [{ a, b, noegle, roller }] */
    var parCache = {};
    S.par = function (niveau) {
        if (parCache[niveau]) return parCache[niveau];
        var N = D.NIVEAUER[niveau], ud = [], set = {};
        function tag(x, y) {
            var k = [x, y].sort().join("+");
            if (set[k]) return;
            var r = S.gyldig(x, y);
            if (!r) return;
            set[k] = true;
            ud.push({ a: x, b: y, noegle: k, roller: r });
        }
        if (niveau === "let") N.andre.forEach(function (x) { N.med.forEach(function (y) { tag(x, y); }); });
        if (niveau === "middel") N.syrer.forEach(function (x) { N.baser.forEach(function (y) { tag(x, y); }); });
        if (niveau === "svaer") N.flere.forEach(function (x) { N.andre.forEach(function (y) { tag(x, y); }); });
        parCache[niveau] = ud;
        return ud;
    };

    /* En opgave ud fra et par. Reaktanterne staar i tilfaeldig orden, og
       produkterne staar under den, de er dannet af. */
    S.opgave = function (syre, base, syreFoerst) {
        var r = S.roller(syre, base) || { syre: syre, base: base, kb: S.korr(syre, -1), ks: S.korr(base, 1) };
        var reak = syreFoerst ? [r.syre, r.base] : [r.base, r.syre];
        return {
            syre: r.syre, base: r.base, kb: r.kb, ks: r.ks,
            noegle: [r.syre, r.base].sort().join("+"),
            reaktanter: reak,
            produkter: reak.map(function (id) { return id === r.syre ? r.kb : r.ks; })
        };
    };

    /* Et tilfaeldigt par, der ikke er blandt de seneste */
    S.nyOpgave = function (niveau, seneste) {
        var alle = S.par(niveau);
        var valg = alle.filter(function (p) { return !seneste || seneste.indexOf(p.noegle) < 0; });
        if (!valg.length) valg = alle;
        var p = NK.tilfaeldig(valg);
        return S.opgave(p.roller.syre, p.roller.base, Math.random() < 0.5);
    };

    /* ----- Fane 2: de forkerte svar ---------------------------------------------------
       Fejl, elever laver: ladningen glemt, fortegnet vendt, rollerne
       byttet (syren optager, basen afgiver), to hydroner i stedet for én,
       H₂ og en loes H⁺. Hvert forkert svar har sin forklaring. */
    S.forkerte = function (o) {
        var rigtige = [S.formel(o.kb), S.formel(o.ks)];
        var A = S.formel(o.syre), B = S.formel(o.base), KB = rigtige[0], KS = rigtige[1];
        var ps = S.del(o.syre), pb = S.del(o.base), fs = D.FAM[ps.fam], fb = D.FAM[pb.fam];
        var typiske = [], sjaeldne = [], set = {};
        function laeg(liste, f, hvorfor) {
            if (rigtige.indexOf(f) >= 0 || set[f]) return;
            set[f] = true;
            liste.push({ f: f, hvorfor: hvorfor });
        }

        laeg(typiske, S.formel(o.kb, S.ladning(o.syre)),
            "Hydronen er H⁺. Den tager en plusladning med, når den forlader " + A + ". Så bliver resten " + KB + ".");
        if (S.ladning(o.kb) < 0) {
            laeg(typiske, S.formel(o.kb, -S.ladning(o.kb)),
                "Ladningen falder med 1, når en positiv hydron forlader " + A + ". Det giver " + KB + ".");
        }
        laeg(typiske, S.formel(o.ks, S.ladning(o.base)),
            "Hydronen har en plusladning med over til " + B + ". Så bliver det " + KS + ".");
        if (ps.n + 1 <= fs.max || (fs.plus && ps.n + 1 === fs.max + 1)) {
            laeg(typiske, S.formel(S.korr(o.syre, 1)),
                A + " er syren. Den afgiver en hydron. Den optager ikke en.");
        }
        if (pb.n - 1 >= fb.min) {
            laeg(typiske, S.formel(S.korr(o.base, -1)),
                S.formel(S.korr(o.base, -1)) + " dannes, når " + B + " afgiver en hydron. Her tager " + B + " imod en.");
        }
        if (ps.n - 2 >= fs.min) {
            laeg(typiske, S.formel(S.korr(o.syre, -2)),
                "Der flytter kun én hydron i en reaktion. " + A + " bliver til " + KB + ".");
        }
        if (pb.n + 2 <= fb.max) {
            laeg(typiske, S.formel(S.korr(o.base, 2)),
                "Basen tager kun imod én hydron. " + B + " bliver til " + KS + ".");
        }
        laeg(sjaeldne, "H₂", "Der dannes ikke H₂. Hydronen H⁺ går over til " + B + ".");
        laeg(sjaeldne, "H⁺", "Hydronen bliver ikke alene tilbage. Den går over til " + B + ".");

        var ud = NK.bland(typiske).slice(0, 6);
        return ud.concat(NK.bland(sjaeldne).slice(0, Math.max(0, 6 - ud.length)));
    };

    /* ----- Fane 3: maerkaterne ------------------------------------------------------ */
    S.MAERKER = ["syre", "base", "kb", "ks"];
    S.MAERKE_TEKST = { syre: "syre", base: "base", kb: "korresp. base", ks: "korresp. syre" };
    S.MAERKE_LANG = { syre: "syren", base: "basen", kb: "den korresponderende base", ks: "den korresponderende syre" };

    S.maerkeArt = function (o, maerke) {
        return { syre: o.syre, base: o.base, kb: o.kb, ks: o.ks }[maerke];
    };

    /* Passer maerket paa stoffet id? foerPil: stoffet staar foer pilen.
       Giver "" ved et rigtigt svar, ellers en forklaring, der passer til
       fejlen. H₂O + H₂O efter pilen er begge rigtige for kb og ks. */
    S.maerkeFejl = function (o, maerke, id, foerPil) {
        var reak = maerke === "syre" || maerke === "base";
        var ret = S.maerkeArt(o, maerke);
        if (reak === foerPil && S.formel(ret) === S.formel(id)) return "";
        var X = S.formel(id);
        if (reak && !foerPil) return X + " står efter pilen. Det er dannet i reaktionen, så det er en korresponderende syre eller base.";
        if (!reak && foerPil) return X + " står før pilen. Det reagerer, så det er syren eller basen.";
        if (maerke === "syre") {
            return S.kanGive(id) ?
                X + " kan godt give en hydron af, men her tager den imod en og bliver til " + S.formel(o.ks) + "." :
                X + " har ingen hydron at give af her. Den tager imod en og bliver til " + S.formel(o.ks) + ".";
        }
        if (maerke === "base") return X + " giver en hydron af og bliver til " + S.formel(o.kb) + ". Så er den syren.";
        if (maerke === "kb") return X + " har én H mere end " + S.formel(o.base) + ". Den er den korresponderende syre.";
        return X + " har én H mindre end " + S.formel(o.syre) + ". Den er den korresponderende base.";
    };

    /* ----- Sværhedsgraden: faelles for fane 2 og 3 ------------------------------------ */
    var NIV_NOEGLE = "nk-sc7.1-niveau";
    var lyttere = [];
    S.niveau = NK.hent(NIV_NOEGLE, "let");
    if (!D.NIVEAUER[S.niveau]) S.niveau = "let";
    S.saetNiveau = function (n) {
        if (!D.NIVEAUER[n] || n === S.niveau) return;
        S.niveau = n;
        NK.gem(NIV_NOEGLE, n);
        lyttere.forEach(function (fn) { fn(n); });
    };
    S.lyt = function (fn) { lyttere.push(fn); };

    NK.Syrebase = S;

    /* =====================================================================
       NK.Mol - strukturerne paa fane 1
       ===================================================================== */
    var VALENS = { H: 1, C: 4, N: 5, O: 6, F: 7, Cl: 7, Br: 7, I: 7, P: 5, S: 6 };
    var M = { VALENS: VALENS };

    function norm(v) {
        v = v % TO_PI;
        return v < 0 ? v + TO_PI : v;
    }
    M.norm = norm;

    /* Et nyt molekyle ud fra D.STRUKTUR. spejl: x vendes (molekylet til
       hoejre paa scenen, saa det vender ind mod midten). */
    M.lav = function (id, spejl) {
        var d = D.STRUKTUR[id];
        var m = { art: id, spejl: !!spejl, atomer: [], bind: [] };
        d.atomer.forEach(function (a) {
            m.atomer.push({ s: a[0], x: spejl ? -a[1] : a[1], y: a[2], q: a[3] || 0, gruppe: !!a[4], vaek: false });
        });
        d.bind.forEach(function (b) { m.bind.push({ a: b[0], b: b[1], o: b[2] }); });
        return m;
    };

    M.naboer = function (m, i) {
        var ud = [], A = m.atomer[i];
        m.bind.forEach(function (b) {
            var j = b.a === i ? b.b : (b.b === i ? b.a : -1);
            if (j < 0) return;
            var B = m.atomer[j];
            ud.push({ j: j, o: b.o, v: Math.atan2(B.y - A.y, B.x - A.x) });
        });
        return ud;
    };

    M.bindingsSum = function (m, i) {
        var s = 0;
        M.naboer(m, i).forEach(function (n) { s += n.o; });
        return s;
    };

    /* Antal frie elektronpar: (valenselektroner - ladning - bindinger) / 2 */
    M.frie = function (m, i) {
        var a = m.atomer[i];
        if (a.gruppe || a.s === "H" || a.vaek) return 0;
        return Math.max(0, (VALENS[a.s] - a.q - M.bindingsSum(m, i)) / 2);
    };

    /* Elektroner omkring atomet: de frie og begge i hver binding */
    M.elektroner = function (m, i) {
        return 2 * M.frie(m, i) + 2 * M.bindingsSum(m, i);
    };

    /* Retningerne for de frie par. De laegges i hullerne mellem
       bindingerne, fordelt saa den mindste afstand bliver stoerst. Er der
       kun én binding, fordeles alt jaevnt (Cl i HCl: tre sider). Uden
       bindinger starter de der, hvor det sidste H sad (Cl⁻). Staar to
       fordelinger lige, vinder den, der vender mest ind mod midten. */
    M.parVinkler = function (m, i) {
        var n = M.frie(m, i), k;
        if (!n) return [];
        var a = m.atomer[i];
        var v = M.naboer(m, i).map(function (x) { return norm(x.v); }).sort(function (p, q) { return p - q; });
        var ud = [];
        if (!v.length) {
            var s = a.lpStart !== undefined ? a.lpStart : (m.spejl ? Math.PI : 0);
            for (k = 0; k < n; k++) ud.push(norm(s + k * TO_PI / n));
            return ud;
        }
        if (v.length === 1) {
            for (k = 1; k <= n; k++) ud.push(norm(v[0] + k * TO_PI / (n + 1)));
            return ud;
        }
        var huller = v.map(function (x, j) {
            var nx = j + 1 < v.length ? v[j + 1] : v[0] + TO_PI;
            return { fra: x, str: nx - x };
        });
        var mod = m.spejl ? Math.PI : 0, bedst = null;
        function prov(j, rest, fordeling) {
            if (j === huller.length - 1) {
                var f = fordeling.concat([rest]);
                var min = Infinity, retning = 0, pos = [];
                huller.forEach(function (h, t) {
                    if (!f[t]) return;
                    min = Math.min(min, h.str / (f[t] + 1));
                    for (var u = 1; u <= f[t]; u++) {
                        var vv = norm(h.fra + u * h.str / (f[t] + 1));
                        pos.push(vv);
                        retning += Math.cos(vv - mod);
                    }
                });
                if (!bedst || min > bedst.min + 1e-6 || (Math.abs(min - bedst.min) <= 1e-6 && retning > bedst.retning + 1e-6)) {
                    bedst = { min: min, retning: retning, pos: pos };
                }
                return;
            }
            for (var t = 0; t <= rest; t++) prov(j + 1, rest - t, fordeling.concat([t]));
        }
        prov(0, n, []);
        return bedst.pos;
    };

    /* H, der kan tages: bundet til et atom, der ikke er C eller en gruppe */
    M.loseH = function (m) {
        var ud = [];
        m.atomer.forEach(function (a, i) {
            if (a.vaek || a.s !== "H") return;
            var nb = M.naboer(m, i)[0];
            if (!nb) return;
            var A = m.atomer[nb.j];
            if (A.s !== "C" && !A.gruppe) ud.push(i);
        });
        return ud;
    };

    /* H paa C: sidder fast */
    M.fasteH = function (m) {
        var ud = [];
        m.atomer.forEach(function (a, i) {
            if (a.vaek || a.s !== "H") return;
            var nb = M.naboer(m, i)[0];
            if (nb && m.atomer[nb.j].s === "C") ud.push(i);
        });
        return ud;
    };

    /* Atomer, der kan tage imod en hydron: frie par og ingen dobbelt-
       binding. Har et af dem negativ ladning, er det kun dem. */
    M.modtagere = function (m) {
        var alle = [];
        m.atomer.forEach(function (a, i) {
            if (a.vaek || a.gruppe || a.s === "H" || !M.frie(m, i)) return;
            if (M.naboer(m, i).some(function (n) { return n.o > 1; })) return;
            alle.push(i);
        });
        var neg = alle.filter(function (i) { return m.atomer[i].q < 0; });
        return neg.length ? neg : alle;
    };

    /* Fjern H nr. h. Elektronparret bliver hos atomet, der mister en
       plusladning. Giver det, der skal til for at saette det tilbage. */
    M.fjernH = function (m, h) {
        var idx = -1;
        m.bind.forEach(function (b, t) { if (b.a === h || b.b === h) idx = t; });
        if (idx < 0) return null;
        var b = m.bind[idx], i = b.a === h ? b.b : b.a;
        var A = m.atomer[i], H = m.atomer[h];
        var v = Math.atan2(H.y - A.y, H.x - A.x);
        m.bind.splice(idx, 1);
        H.vaek = true;
        A.q -= 1;
        if (!M.naboer(m, i).length) A.lpStart = norm(v);
        m.art = NK.Syrebase.korr(m.art, -1);
        return { atom: i, h: h, v: v, x: H.x, y: H.y };
    };

    /* Saet det fjernede H tilbage, hvor det sad */
    M.tilbage = function (m, info) {
        var H = m.atomer[info.h], A = m.atomer[info.atom];
        H.vaek = false;
        H.x = info.x;
        H.y = info.y;
        A.q += 1;
        m.bind.push({ a: info.atom, b: info.h, o: 1 });
        m.art = NK.Syrebase.korr(m.art, 1);
    };

    /* Et nyt H paa atom i i retningen v: det frie par bliver til bindingen */
    M.tilfoejH = function (m, i, v) {
        var A = m.atomer[i];
        m.atomer.push({ s: "H", x: A.x + Math.cos(v), y: A.y + Math.sin(v), q: 0, gruppe: false, vaek: false, ny: true });
        m.bind.push({ a: i, b: m.atomer.length - 1, o: 1 });
        A.q += 1;
        m.art = NK.Syrebase.korr(m.art, 1);
        return m.atomer.length - 1;
    };

    M.hAntal = function (m) {
        return m.atomer.filter(function (a) { return !a.vaek && a.s === "H"; }).length;
    };

    M.ladning = function (m) {
        var q = 0;
        m.atomer.forEach(function (a) { if (!a.vaek) q += a.q; });
        return q;
    };

    /* Kassen, molekylet fylder (i bindingslaengder), med plads til et H
       paa hvert frit par, saa produktet ogsaa kan vaere der. */
    M.ramme = function (m) {
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        function med(x, y, r, rx) {
            x0 = Math.min(x0, x - (rx || r)); x1 = Math.max(x1, x + (rx || r));
            y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r);
        }
        m.atomer.forEach(function (a, i) {
            if (a.vaek) return;
            med(a.x, a.y, 0.4, a.gruppe ? 0.8 : 0.4);
            M.parVinkler(m, i).forEach(function (v) { med(a.x + Math.cos(v), a.y + Math.sin(v), 0.35); });
        });
        return { x0: x0, x1: x1, y0: y0, y1: y1, b: x1 - x0, h: y1 - y0 };
    };

    NK.Mol = M;
}());
