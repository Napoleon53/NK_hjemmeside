/* =====================================================================
   layout.js - hvor atomerne staar, naar animationen selv tegner

   Tre opstillinger:
     zigzag(mol, res, stereo)  facit og opgaver: hovedkaeden som zigzag
                               med 120 grader mellem bindingerne,
                               sidegrupperne ud i det frie rum. cis
                               spejler kaeden efter dobbeltbindingen.
     struktur90(mol, res)      strukturformlen med alle atomer paa et
                               kvadratisk gitter, som i bogen: kaeden
                               vandret, sidegrupperne lodret, H i de
                               frie retninger. Kun til ligekaedede
                               sidegrupper (opgaverne paa fanen Zigzag).
     hRetninger(mol, id, n)    hvor n H-atomer skal sidde omkring et
                               atom, naar alle atomer vises: fordelt i
                               de stoerste huller mellem bindingerne.

   Koordinaterne er i bindingslaengder. y vender nedad som paa skaermen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var GRAD = Math.PI / 180;

    function enhed(v) { return { x: Math.cos(v * GRAD), y: Math.sin(v * GRAD) }; }
    function norm(v) { v = v % 360; return v < 0 ? v + 360 : v; }

    function krydser(p1, p2, p3, p4) {
        var det = (p2.x - p1.x) * (p4.y - p3.y) - (p3.x - p4.x) * (p1.y - p2.y);
        if (Math.abs(det) < 1e-9) return false;
        var l = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
        var g = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
        return l > 0.01 && l < 0.99 && g > 0.01 && g < 0.99;
    }

    /* Atomerne i en ring (de tunge atomer, der er tilbage, naar enderne
       pilles af igen og igen) */
    function ringAtomer(mol, tunge) {
        var grad = {}, ko = [], vaek = {}, ud = {};
        Object.keys(tunge).forEach(function (k) {
            var id = +k;
            grad[id] = mol.naboer(id).filter(function (x) { return tunge[x]; }).length;
            if (grad[id] <= 1) ko.push(id);
        });
        while (ko.length) {
            var id = ko.pop();
            if (vaek[id]) continue;
            vaek[id] = true;
            mol.naboer(id).forEach(function (n) { if (tunge[n] && !vaek[n] && --grad[n] <= 1) ko.push(n); });
        }
        Object.keys(tunge).forEach(function (k) { if (!vaek[k]) ud[k] = true; });
        return ud;
    }

    /* ----- Zigzag ---------------------------------------------------------------
       mol faar nye koordinater. res er NK.Navn.analyser(mol). stereo: "cis"
       spejler halen efter kaedens foerste dobbeltbinding (zigzag er trans).
       Kaeden er res.tegnekaede, naar den findes: stamkaeden forlaenget ud
       gennem O og N (C-C-O i ethanol, C-C(=O)-O-C-C i ethylethanoat). En
       ring, der sidder paa kaeden (phenyl), tegnes som en regulaer ring.
       stereo kan ogsaa vaere en liste af par [a, b] med de cis-dobbeltbindinger. */
    function zigzag(mol, res, stereo) {
        var kaede = res && (res.tegnekaede && res.tegnekaede.length ? res.tegnekaede : res.kaede);
        if (!kaede || !kaede.length) return mol;
        if (res.ring) return ringLayout(mol, res);
        var n = kaede.length, pos = {};
        function orden(a, b) { var bd = mol.binding(a, b); return bd ? bd.orden : 0; }
        var tri = {}, loks = [], q;
        for (q = 0; q < n - 1; q++) {
            if (orden(kaede[q], kaede[q + 1]) === 3) tri[q] = true;
            if (orden(kaede[q], kaede[q + 1]) === 2) loks.push(q + 1);
        }
        /* "cis": den foerste dobbeltbinding er cis; "alleCis": dem alle (linolsyre).
           En liste af par [a, b]: de dobbeltbindinger (atomernes id), der er cis
           (Pæn tegning paa tegnebraettet beholder tegningens cis og trans) */
        if (Array.isArray(stereo)) {
            loks = loks.filter(function (l) {
                return stereo.some(function (p) {
                    return (p[0] === kaede[l - 1] && p[1] === kaede[l]) || (p[1] === kaede[l - 1] && p[0] === kaede[l]);
                });
            });
        } else if (stereo === "cis") loks = loks.slice(0, 1);
        else if (stereo !== "alleCis") loks = [];
        /* sp-atom: sidder i en tripelbinding, saa kaeden gaar lige igennem */
        function sp(i) { return tri[i] || tri[i - 1]; }

        var ret = [], v = -30, tegn = 1;
        for (var i = 0; i < n - 1; i++) {
            if (i > 0 && !sp(i)) { v += tegn * 60; tegn = -tegn; }
            ret.push(v);
        }
        pos[kaede[0]] = { x: 0, y: 0 };
        for (i = 0; i < n - 1; i++) {
            var e = enhed(ret[i]);
            pos[kaede[i + 1]] = { x: pos[kaede[i]].x + e.x, y: pos[kaede[i]].y + e.y };
        }

        var iKaede = {};
        kaede.forEach(function (id, k) { iKaede[id] = k; });
        var tunge = {};
        mol.atomer.forEach(function (a) { if (a.el !== "H") tunge[a.id] = true; });
        var iRing = ringAtomer(mol, tunge);
        /* Boern: tunge naboer uden for kaeden. Ringens egne naboer er ikke
           boern; ringen placeres samlet (placerRing) */
        function boern(id, far) {
            return mol.naboer(id).filter(function (x) {
                return x !== far && tunge[x] && iKaede[x] === undefined && !(iRing[x] && iRing[id]);
            });
        }
        function stoerrelse(id, far) {
            var set = {}, ko = [id], s = 0;
            set[id] = true;
            set[far] = true;
            while (ko.length) {
                var x = ko.pop();
                s++;
                mol.naboer(x).forEach(function (y) {
                    if (!set[y] && tunge[y] && iKaede[y] === undefined) { set[y] = true; ko.push(y); }
                });
            }
            return s;
        }

        /* Et atom i en sidegruppe og alt det, der haenger paa det */
        function placer(id, far, vInd, drej) {
            var b = boern(id, far).sort(function (x, y) { return stoerrelse(y, id) - stoerrelse(x, id); });
            var erSp = mol.bindingerTil(id).some(function (bd) { return bd.orden === 3; });
            var vinkler;
            if (b.length === 1) vinkler = [erSp ? vInd : vInd + drej * 60];
            else if (b.length === 2) vinkler = [vInd + drej * 60, vInd - drej * 60];
            else vinkler = [vInd - 90, vInd, vInd + 90];
            b.forEach(function (x, k) {
                if (iRing[x]) { placerRing(x, id, vinkler[k]); return; }
                var e = enhed(vinkler[k]);
                pos[x] = { x: pos[id].x + e.x, y: pos[id].y + e.y };
                var nyDrej = b.length === 1 ? -drej : (k === 0 ? -drej : drej);
                placer(x, id, vinkler[k], nyDrej);
            });
        }

        /* En ring paa en sidegruppe: ringatomet x sidder én binding fra far i
           retningen v, og ringen ligger videre ud ad samme retning */
        function placerRing(x, far, v) {
            var cyk = [x], forrige = null, nu = x;
            for (;;) {
                var nx = mol.naboer(nu).filter(function (y) { return iRing[y] && y !== forrige && cyk.indexOf(y) < 0; })[0];
                if (nx === undefined) break;
                cyk.push(nx);
                forrige = nu;
                nu = nx;
            }
            var m = cyk.length, R = 1 / (2 * Math.sin(Math.PI / m)), e = enhed(v);
            var c = { x: pos[far].x + e.x * (1 + R), y: pos[far].y + e.y * (1 + R) };
            cyk.forEach(function (id, k) {
                var u = enhed(v + 180 + k * 360 / m);
                pos[id] = { x: c.x + R * u.x, y: c.y + R * u.y };
            });
            cyk.forEach(function (id, k) {
                var ud = v + 180 + k * 360 / m;
                var b = boern(id, far).filter(function (y) { return !pos[y]; });
                var vinkler = b.length === 1 ? [ud] : [ud - 35, ud + 35, ud];
                b.forEach(function (y, j) {
                    var u = enhed(vinkler[j] !== undefined ? vinkler[j] : ud);
                    pos[y] = { x: pos[id].x + u.x, y: pos[id].y + u.y };
                    placer(y, id, vinkler[j] !== undefined ? vinkler[j] : ud, 1);
                });
            });
        }

        /* Sidegrupperne paa hvert kaedeatom */
        var valg = [];
        kaede.forEach(function (id, k) {
            var b = boern(id, null);
            if (!b.length) return;
            var retninger = [];
            if (k > 0) retninger.push(norm(ret[k - 1] + 180));
            if (k < n - 1) retninger.push(norm(ret[k]));
            var vinkler;
            if (retninger.length === 2) {
                /* Midt i det store hul: modsat summen af de to bindinger */
                var e1 = enhed(retninger[0]), e2 = enhed(retninger[1]);
                var sx = e1.x + e2.x, sy = e1.y + e2.y;
                var bis = Math.hypot(sx, sy) < 1e-6 ? norm(retninger[0] + 90) : norm(Math.atan2(-sy, -sx) / GRAD);
                vinkler = b.length === 1 ? [bis] : [bis - 40, bis + 40];
            } else if (retninger.length === 1) {
                /* For enden: fortsaet zigzaggen, som om kaeden var en binding laengere */
                var mod = norm(retninger[0] + 180), fort;
                if (k === 0) fort = sp(0) ? norm(ret[0] + 180) : norm((ret[0] < 0 ? ret[0] + 60 : ret[0] - 60) + 180);
                else fort = sp(n - 1) ? ret[n - 2] : norm(ret[n - 2] < 0 ? ret[n - 2] + 60 : ret[n - 2] - 60);
                if (b.length === 1) vinkler = [fort];
                else if (b.length === 2) vinkler = [mod - 60, mod + 60];
                else vinkler = [mod - 90, mod, mod + 90];
            } else {
                vinkler = [[0], [0, 180], [90, 210, 330], [0, 90, 180, 270]][Math.min(b.length, 4) - 1];
            }
            b.sort(function (x, y) { return stoerrelse(y, id) - stoerrelse(x, id); });
            b.forEach(function (x, j) {
                var v2 = vinkler[j] !== undefined ? vinkler[j] : vinkler[0] + 90 * j;
                /* Drej sidegruppens zigzag mod kaedens hoejre ende */
                var s = Math.sin(v2 * GRAD) < 0 ? 1 : -1;
                if (b.length === 2) s = j === 0 ? -1 : 1;
                valg.push({ id: x, far: id, v: v2, drej: s });
            });
        });

        /* cis: halen efter dobbeltbindingen spejles i bindingens linje. Flere
           dobbeltbindinger spejles én ad gangen fra venstre */
        var haler = loks.map(function (lok) {
            var hale = {}, ko = kaede.slice(lok);
            ko.forEach(function (id) { hale[id] = true; });
            while (ko.length) {
                var x0 = ko.pop();
                mol.naboer(x0).forEach(function (y) {
                    if (!hale[y] && tunge[y] && iKaede[y] === undefined) { hale[y] = true; ko.push(y); }
                });
            }
            return { lok: lok, atomer: Object.keys(hale) };
        });

        /* To sidegrupper paa samme C kan ogsaa bytte plads */
        var par = [];
        valg.forEach(function (g, j) { if (j > 0 && valg[j - 1].far === g.far) par.push(j - 1); });

        var basis = {};
        kaede.forEach(function (id) { basis[id] = pos[id]; });
        function kor(bits) {
            pos = {};
            kaede.forEach(function (id) { pos[id] = basis[id]; });
            var vinkel = valg.map(function (g) { return g.v; });
            par.forEach(function (j, k) {
                if (bits[valg.length + k]) { var t = vinkel[j]; vinkel[j] = vinkel[j + 1]; vinkel[j + 1] = t; }
                /* En smallere vifte, hvis naboens vifte er i vejen */
                var midt = (vinkel[j] + vinkel[j + 1]) / 2;
                if (bits[valg.length + par.length + k]) {
                    vinkel[j] = midt + (vinkel[j] - midt) * 0.65;
                    vinkel[j + 1] = midt + (vinkel[j + 1] - midt) * 0.65;
                }
                /* Kryds: den ene sidegruppe op, den anden ned mellem kaedens
                   bindinger (kun naar det ellers stoeder sammen, se nedenfor) */
                if (bits[valg.length + 2 * par.length + k]) {
                    vinkel[j] = midt;
                    vinkel[j + 1] = midt + 180;
                }
            });
            valg.forEach(function (g, j) {
                if (iRing[g.id]) { placerRing(g.id, g.far, vinkel[j]); return; }
                var e = enhed(vinkel[j]);
                pos[g.id] = { x: pos[g.far].x + e.x, y: pos[g.far].y + e.y };
                placer(g.id, g.far, vinkel[j], bits[j] ? -g.drej : g.drej);
            });
            haler.forEach(function (h) {
                var A = pos[kaede[h.lok - 1]], B = pos[kaede[h.lok]];
                var dx = B.x - A.x, dy = B.y - A.y, l2 = dx * dx + dy * dy;
                h.atomer.forEach(function (id) {
                    var Q = pos[id];
                    if (!Q) return;
                    var t2 = ((Q.x - A.x) * dx + (Q.y - A.y) * dy) / l2;
                    var px = A.x + t2 * dx, py = A.y + t2 * dy;
                    pos[id] = { x: 2 * px - Q.x, y: 2 * py - Q.y };
                });
            });
        }

        /* Straf for atomer taet paa hinanden og for bindinger, der krydser */
        var tungeBind = mol.bindinger.filter(function (bd) { return tunge[bd.a] && tunge[bd.b]; });
        function straf() {
            var ids = Object.keys(pos), t = 0;
            for (var a = 0; a < ids.length; a++) {
                for (var b = a + 1; b < ids.length; b++) {
                    var p = pos[ids[a]], q = pos[ids[b]];
                    var d = Math.hypot(p.x - q.x, p.y - q.y);
                    if (d < 1.2) t += (1.2 - d) * (d < 0.7 ? 20 : 1);
                }
            }
            for (a = 0; a < tungeBind.length; a++) {
                for (b = a + 1; b < tungeBind.length; b++) {
                    var x = tungeBind[a], y = tungeBind[b];
                    if (x.a === y.a || x.a === y.b || x.b === y.a || x.b === y.b) continue;
                    if (krydser(pos[x.a], pos[x.b], pos[y.a], pos[y.b])) t += 40;
                }
            }
            return t;
        }

        /* Alle kombinationer, naar de er faa nok; ellers én ad gangen */
        function soeg(nBits) {
            var bits = [], bedstBits = null, bedst = Infinity, j, t;
            for (j = 0; j < nBits; j++) bits.push(false);
            if (nBits <= 11) {
                for (var kode = 0; kode < (1 << nBits) && bedst > 0; kode++) {
                    for (j = 0; j < nBits; j++) bits[j] = !!(kode & (1 << j));
                    kor(bits);
                    t = straf();
                    if (t < bedst - 1e-9) { bedst = t; bedstBits = bits.slice(); }
                }
            } else {
                kor(bits);
                bedst = straf();
                bedstBits = bits.slice();
                for (var runde = 0; runde < 3; runde++) {
                    for (j = 0; j < nBits; j++) {
                        bits[j] = !bits[j];
                        kor(bits);
                        t = straf();
                        if (t < bedst) { bedst = t; bedstBits = bits.slice(); } else bits[j] = !bits[j];
                    }
                }
            }
            return { bits: bedstBits || bits, straf: bedst };
        }
        var fund = soeg(valg.length + 2 * par.length);
        /* Stoeder atomerne sammen (straf 10 = to atomer under 0,7 fra hinanden),
           proeves ogsaa krydset: citronsyrens OH op og COOH ned */
        if (fund.straf >= 10 && par.length) {
            var fund2 = soeg(valg.length + 3 * par.length);
            if (fund2.straf < fund.straf - 1e-9) fund = fund2;
        }
        kor(fund.bits);

        mol.atomer.forEach(function (a) {
            var p = pos[a.id];
            if (p) { a.x = p.x; a.y = p.y; }
        });
        /* Tegnede H-atomer: i et frit hul ved deres atom */
        mol.atomer.forEach(function (a) {
            if (a.el !== "H" || pos[a.id]) return;
            var far = mol.naboer(a.id)[0];
            if (far === undefined) return;
            var andre = mol.naboer(far).filter(function (x) { return x !== a.id; });
            var v2 = hRetninger(mol, far, 1, andre)[0];
            var f = mol.atom(far), e = enhed(v2);
            a.x = f.x + e.x; a.y = f.y + e.y;
        });
        mol.centrer(0, 0);
        return mol;
    }

    /* ----- Én ring: en regulaer polygon, sidegrupperne udad ---------------------- */
    function ringLayout(mol, res) {
        var ring = res.kaede, n = ring.length, pos = {};
        var r = 1 / (2 * Math.sin(Math.PI / n));
        ring.forEach(function (id, k) {
            var v = -90 + 360 * k / n;
            pos[id] = { x: r * Math.cos(v * GRAD), y: r * Math.sin(v * GRAD) };
        });
        var iRing = {};
        ring.forEach(function (id) { iRing[id] = true; });
        function placer(id, far, vInd, drej) {
            var b = mol.naboer(id).filter(function (x) { return x !== far && !pos[x] && mol.atom(x).el !== "H"; });
            var vinkler = b.length === 1 ? [vInd + drej * 60] : (b.length === 2 ? [vInd - 60, vInd + 60] : [vInd - 90, vInd, vInd + 90]);
            b.forEach(function (x, k) {
                var e = enhed(vinkler[k]);
                pos[x] = { x: pos[id].x + e.x, y: pos[id].y + e.y };
                placer(x, id, vinkler[k], -drej);
            });
        }
        ring.forEach(function (id, k) {
            var ud = -90 + 360 * k / n;
            var b = mol.naboer(id).filter(function (x) { return !iRing[x] && mol.atom(x).el !== "H"; });
            var vinkler = b.length === 1 ? [ud] : [ud - 35, ud + 35];
            b.forEach(function (x, j) {
                var e = enhed(vinkler[j]);
                pos[x] = { x: pos[id].x + e.x, y: pos[id].y + e.y };
                placer(x, id, vinkler[j], 1);
            });
        });
        mol.atomer.forEach(function (a) { var p = pos[a.id]; if (p) { a.x = p.x; a.y = p.y; } });
        mol.centrer(0, 0);
        return mol;
    }

    /* ----- Retninger til H-atomer ------------------------------------------------
       Bindingernes vinkler deler cirklen i huller. H-atomerne fordeles efter
       hullernes stoerrelse og saettes jaevnt i hvert hul. Et CH3 for enden
       bliver et kors, et CH2 i kaeden faar to H i det store hul. */
    function hRetninger(mol, id, antal, naboer) {
        if (antal <= 0) return [];
        var a = mol.atom(id);
        var nb = naboer || mol.naboer(id);
        var v = nb.map(function (x) {
            var b = mol.atom(x);
            return norm(Math.atan2(b.y - a.y, b.x - a.x) / GRAD);
        }).sort(function (p, q) { return p - q; });
        if (!v.length) {
            return [[0], [180, 0], [90, 210, 330], [0, 90, 180, 270]][Math.min(antal, 4) - 1].slice(0, antal);
        }
        var huller = v.map(function (s, k) {
            var slut = k + 1 < v.length ? v[k + 1] : v[0] + 360;
            return { start: s, str: slut - s, n: 0 };
        });
        for (var k = 0; k < antal; k++) {
            var bedst = huller[0];
            huller.forEach(function (h) { if (h.str / (h.n + 1) > bedst.str / (bedst.n + 1) + 1e-6) bedst = h; });
            bedst.n++;
        }
        var ud = [];
        huller.forEach(function (h) {
            for (var j = 0; j < h.n; j++) ud.push(norm(h.start + h.str * (j + 1) / (h.n + 1)));
        });
        return ud;
    }

    /* ----- Strukturformlen paa et kvadratisk gitter ---------------------------------
       Giver et nyt molekyle, hvor alle H er rigtige atomer. Kaeden ligger
       vandret; sidegrupperne gaar lodret op eller ned (to paa samme C: én
       hver vej). To sidegrupper paa naboatomer til samme side faar ekstra
       luft imellem, saa deres H ikke stoeder sammen. */
    function struktur90(mol, res) {
        var HL = 0.62;
        var kaede = res.kaede, n = kaede.length;
        var iKaede = {};
        kaede.forEach(function (id, k) { iKaede[id] = k; });
        var ud = new NK.Molekyle();
        var nyt = {};
        var subs = kaede.map(function (id) {
            return mol.naboer(id).filter(function (x) { return iKaede[x] === undefined && mol.atom(x).el !== "H"; });
        });
        /* Retning for hver sidegruppe: op (-1) eller ned (+1) */
        var sider = subs.map(function () { return []; });
        subs.forEach(function (l, k) {
            if (l.length >= 2) { sider[k] = [-1, 1]; return; }
            if (l.length === 1) {
                var forrigeOp = k > 0 && sider[k - 1].length === 1 && sider[k - 1][0] === -1;
                sider[k] = [forrigeOp ? 1 : -1];
            }
        });
        var x = 0, xs = [];
        for (var k = 0; k < n; k++) {
            if (k > 0) {
                var faelles = sider[k - 1].some(function (s) { return sider[k].indexOf(s) >= 0; });
                x += faelles ? 1.8 : 1;
            }
            xs.push(x);
        }
        var brugt = {};
        function saet(gammel, px, py) {
            var a = ud.tilfoej(mol.atom(gammel).el, px, py);
            nyt[gammel] = a.id;
            brugt[a.id] = {};
            return a;
        }
        kaede.forEach(function (id, k) { saet(id, xs[k], 0); });
        for (k = 0; k < n - 1; k++) {
            var bd = mol.binding(kaede[k], kaede[k + 1]);
            ud.bind(nyt[kaede[k]], nyt[kaede[k + 1]], bd ? bd.orden : 1);
            brugt[nyt[kaede[k]]].R = true;
            brugt[nyt[kaede[k + 1]]].L = true;
        }
        subs.forEach(function (l, k) {
            l.forEach(function (rod, j) {
                var s = sider[k][j] || -1, far = kaede[k], id = rod, y = 0;
                while (id !== undefined) {
                    y += s;
                    saet(id, xs[k], y);
                    var bd2 = mol.binding(far, id);
                    ud.bind(nyt[far], nyt[id], bd2 ? bd2.orden : 1);
                    brugt[nyt[far]][s < 0 ? "U" : "D"] = true;
                    brugt[nyt[id]][s < 0 ? "D" : "U"] = true;
                    var videre = mol.naboer(id).filter(function (z) { return z !== far && nyt[z] === undefined && mol.atom(z).el !== "H"; });
                    far = id;
                    id = videre[0];
                }
            });
        });
        /* H i de frie retninger. Ved en dobbeltbinding i kaeden med ét H paa
           hvert C sidder H'erne paa hver sin side, saa tegningen ikke ligner cis. */
        var RET = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
        var ned = {};
        for (k = 0; k < n - 1; k++) {
            var bdk = ud.binding(nyt[kaede[k]], nyt[kaede[k + 1]]);
            if (bdk && bdk.orden === 2 && ud.implicitH(nyt[kaede[k]]) === 1 && ud.implicitH(nyt[kaede[k + 1]]) === 1) ned[nyt[kaede[k + 1]]] = true;
        }
        ud.atomer.slice().forEach(function (a) {
            if (a.el === "H") return;
            var h = ud.implicitH(a.id);
            var frie = (ned[a.id] ? ["D", "U", "L", "R"] : ["U", "D", "L", "R"]).filter(function (r) { return !brugt[a.id][r]; });
            frie.slice(0, h).forEach(function (r) {
                var H = ud.tilfoej("H", a.x + RET[r][0] * HL, a.y + RET[r][1] * HL);
                ud.bind(a.id, H.id, 1);
            });
        });
        ud.centrer(0, 0);
        return ud;
    }

    NK.Layout = {
        zigzag: zigzag,
        struktur90: struktur90,
        hRetninger: hRetninger,
        enhed: enhed
    };
}());
