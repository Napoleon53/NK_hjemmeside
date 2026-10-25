/* =====================================================================
   prik.js - modellen bag prikformlerne (ingen canvas)

   Som i bogen: et atom har elektronerne i yderste skal paa symbolets
   fire sider. De foerste fire faar hver sin side, de naeste danner par.
   De elektroner, der staar alene, er uparrede, og hver uparret elektron
   kan danne én binding: to atomer laegger hver en uparret elektron i et
   faelles elektronpar.

   Siderne er 0 op, 1 hoejre, 2 ned og 3 venstre. Atomerne staar paa et
   gitter, og en binding gaar altid til nabofeltet, saa siden, bindingen
   sidder paa, er retningen til naboen (som bogens tegninger, hvor
   bindingerne gaar vandret og lodret).

   Et molekyle under opbygning (M) er
     { atomer: [{ id, z, gx, gy, tegnet }], bindinger: [{ a, b, n }] }
   gx, gy er pladsen i atomets eget molekyle (hver del har sine egne
   koordinater; sim_byg.js stiller delene ved siden af hinanden).
   tegnet er elevens egen tegning af atomet [op, hoejre, ned, venstre];
   den bruges, saa laenge atomet ingen bindinger har.

   En elevtegning paa Find fejlen har samme form; et atom kan have frie
   (antallet af frie elektroner, tegningen har ved atomet).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var P = {};

    var RET = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
    P.RET = RET;
    P.modsat = function (s) { return (s + 2) % 4; };

    P.side = function (dx, dy) {
        for (var s = 0; s < 4; s++) if (RET[s].x === dx && RET[s].y === dy) return s;
        /* Ikke et nabofelt: den side, der peger mest den vej */
        return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
    };

    /* Kvarte omdrejninger med uret (skaermens y peger nedad) */
    function drej(v, r) {
        r = ((r % 4) + 4) % 4;
        var x = v.x, y = v.y;
        for (var i = 0; i < r; i++) { var t = x; x = -y; y = t; }
        return { x: x, y: y };
    }
    P.drej = drej;

    /* ----- Atomet alene -------------------------------------------------- */
    P.uparrede = function (z) {
        var v = D.EL[z].v;
        return v <= 4 ? v : 8 - v;
    };

    P.friePar = function (z) {
        return (D.EL[z].v - P.uparrede(z)) / 2;
    };

    /* Bogens tegning: de foerste fire paa hver sin side, parrene oppe,
       nede, til venstre og til hoejre. Hydrogen har sin elektron til hoejre. */
    P.standard = function (z) {
        var v = D.EL[z].v;
        if (z === 1) return [0, 1, 0, 0];
        var s = [0, 0, 0, 0], i;
        for (i = 0; i < Math.min(v, 4); i++) s[i] = 1;
        var parOrden = [0, 2, 3, 1];
        for (i = 0; i < v - 4; i++) s[parOrden[i]] = 2;
        return s;
    };

    P.sum = function (sider) {
        return sider[0] + sider[1] + sider[2] + sider[3];
    };

    /* Elevens tegning af et atom holdt op mod bogens regel.
       null: rigtig. { slags: "antal", tal } eller { slags: "fordeling" } */
    P.tegningFejl = function (z, sider) {
        var tal = P.sum(sider);
        if (tal !== D.EL[z].v) return { slags: "antal", tal: tal };
        var mx = Math.max.apply(null, sider), mn = Math.min.apply(null, sider);
        if (mx - mn > 1) return { slags: "fordeling" };
        return null;
    };

    /* ----- Molekylet ------------------------------------------------------ */
    P.nytMolekyle = function (zListe, tegninger) {
        return {
            atomer: zListe.map(function (z, i) {
                return { id: i, z: z, gx: 0, gy: 0, tegnet: (tegninger && tegninger[z] ? tegninger[z] : P.standard(z)).slice() };
            }),
            bindinger: []
        };
    };

    P.bindingssum = function (M, a) {
        var s = 0;
        M.bindinger.forEach(function (b) { if (b.a === a.id || b.b === a.id) s += b.n; });
        return s;
    };

    P.naboer = function (M, a) {
        var ud = [];
        M.bindinger.forEach(function (b) {
            if (b.a === a.id) ud.push({ atom: M.atomer[b.b], b: b });
            else if (b.b === a.id) ud.push({ atom: M.atomer[b.a], b: b });
        });
        return ud;
    };

    P.find = function (M, a, b) {
        for (var i = 0; i < M.bindinger.length; i++) {
            var x = M.bindinger[i];
            if ((x.a === a.id && x.b === b.id) || (x.a === b.id && x.b === a.id)) return x;
        }
        return null;
    };

    /* Antallet af uparrede elektroner, atomet har tilbage (i Byg) */
    P.enlige = function (M, a) {
        return P.uparrede(a.z) - P.bindingssum(M, a);
    };

    /* Frie par og uparrede elektroner omkring atomet. En elevtegning
       paa Find fejlen kan have sit eget antal frie elektroner (a.frie). */
    P.friePU = function (M, a) {
        if (a.frie !== undefined) return { p: Math.floor(a.frie / 2), u: a.frie % 2 };
        return { p: P.friePar(a.z), u: Math.max(0, P.enlige(M, a)) };
    };

    /* Hvor mange elektroner ses omkring atomet, og hvor mange skal der
       vaere (8, hydrogen 2). frie: de frie elektroner. bs: bindingernes
       samlede antal elektronpar. */
    P.status = function (M, a) {
        var bs = P.bindingssum(M, a);
        var pu = P.friePU(M, a);
        var frie = 2 * pu.p + pu.u;
        var nu = frie + 2 * bs;
        var maal = a.z === 1 ? 2 : 8;
        return { nu: nu, maal: maal, ok: nu === maal, frie: frie, bs: bs };
    };

    /* Delene (molekylerne), atomerne er fordelt paa, ordnet efter det
       mindste atomnummer i hver */
    P.dele = function (M) {
        var set = {}, ud = [];
        M.atomer.forEach(function (a) {
            if (set[a.id]) return;
            var del = [], koe = [a];
            set[a.id] = true;
            while (koe.length) {
                var x = koe.shift();
                del.push(x.id);
                P.naboer(M, x).forEach(function (n) {
                    if (!set[n.atom.id]) { set[n.atom.id] = true; koe.push(n.atom); }
                });
            }
            del.sort(function (p, q) { return p - q; });
            ud.push(del);
        });
        ud.sort(function (p, q) { return p[0] - q[0]; });
        return ud;
    };

    function delAf(dele, id) {
        for (var i = 0; i < dele.length; i++) if (dele[i].indexOf(id) >= 0) return dele[i];
        return null;
    }

    /* ----- Elektronerne paa de fire sider ---------------------------------
       P.sider giver for hver side { b: binding } eller { e: antal frie
       elektroner paa siden }. Et atom uden bindinger med en tegning har
       elevens egen tegning. Ellers fordeles de frie elektroner paa de
       sider, bindingerne ikke bruger, saa symmetrisk som muligt. */
    P.sider = function (M, a) {
        var nb = P.naboer(M, a);
        if (!nb.length && a.tegnet && a.frie === undefined) {
            return a.tegnet.map(function (n) { return { e: n }; });
        }
        var ud = [null, null, null, null];
        nb.forEach(function (n) {
            var s = P.side(n.atom.gx - a.gx, n.atom.gy - a.gy);
            ud[s] = { b: n.b, nabo: n.atom };
        });
        var frieSider = [];
        for (var s = 0; s < 4; s++) if (!ud[s]) frieSider.push(s);
        var pu = P.friePU(M, a);
        var fordeling = fordel(ud, frieSider, pu.p, pu.u);
        frieSider.forEach(function (s, i) { ud[s] = { e: fordeling[i] }; });
        return ud;
    };

    /* Alle maader at lægge grupperne paa de frie sider. Grupperne er
       par (2), uparrede (1), dobbeltpar (4, kun i elevtegninger med for
       mange frie elektroner) og tomme sider (0). */
    function fordel(ud, frie, p, u) {
        var grupper = [], i;
        for (i = 0; i < p; i++) grupper.push(2);
        for (i = 0; i < u; i++) grupper.push(1);
        /* For mange grupper til siderne: to par deler en side */
        while (grupper.length > frie.length && grupper.indexOf(2) >= 0) {
            grupper.splice(grupper.indexOf(2), 1);
            var j = grupper.indexOf(2);
            if (j >= 0) grupper[j] = 4; else grupper.push(4);
            if (grupper.length > frie.length && grupper.indexOf(2) < 0) break;
        }
        while (grupper.length < frie.length) grupper.push(0);
        grupper = grupper.slice(0, frie.length);

        var bedst = null;
        permutationer(grupper).forEach(function (perm) {
            var indhold = ud.map(function (x) { return x ? "B" : null; });
            frie.forEach(function (s, k) { indhold[s] = String(perm[k]); });
            var score = symmetri(indhold) * 10;
            frie.forEach(function (s, k) {
                if (perm[k] === 1 && ud[P.modsat(s)]) score -= 25;      /* en uparret fortsaetter lige ud, saa
                                                                            naeste binding goer molekylet lige */
                if (perm[k] >= 2 && (s === 0 || s === 2)) score -= 0.5; /* par helst oppe og nede */
                if (perm[k] === 1 && (s === 1 || s === 3)) score -= 0.2;
            });
            if (!bedst || score < bedst.score - 1e-9) bedst = { score: score, perm: perm };
        });
        return bedst ? bedst.perm : [];
    }

    function permutationer(liste) {
        if (liste.length <= 1) return [liste.slice()];
        var ud = [], set = {};
        liste.forEach(function (x, i) {
            if (set[x]) return;
            set[x] = true;
            var rest = liste.slice(0, i).concat(liste.slice(i + 1));
            permutationer(rest).forEach(function (p) { ud.push([x].concat(p)); });
        });
        return ud;
    }

    /* Hvor langt indholdet er fra at vaere spejlsymmetrisk om en akse
       gennem atomet (lodret, vandret eller skraat). 0 er symmetrisk. */
    function symmetri(indhold) {
        var bedst = 4;
        for (var m = 0; m < 4; m++) {
            var fejl = 0;
            for (var k = 0; k < 4; k++) if (indhold[k] !== indhold[(m - k + 4) % 4]) fejl++;
            if (fejl < bedst) bedst = fejl;
        }
        return bedst;
    }

    /* Siderne med en uparret elektron (dem, der kan danne en binding) */
    P.enligeSider = function (M, a) {
        var ud = [];
        P.sider(M, a).forEach(function (x, s) { if (x.e === 1) ud.push(s); });
        return ud;
    };

    /* ----- At danne og bryde bindinger ------------------------------------
       binde(M, a, sA, b, sB, pos): atom a laegger sin uparrede elektron paa
       side sA sammen med atom b's paa side sB. Den mindste del flytter hen
       til den stoerste. Er de lige store, bliver det atom staaende, der har
       flest uparrede elektroner (det, der skal sidde i midten), ellers b.
       pos (frivillig) er atomernes plads paa skaermen: saa saettes det
       flyttede atom paa den side, der vender ind mod det, saa intet hopper
       over paa den anden side. Deler a og b allerede et par, bliver det et
       par mere.
       Svar: { ok: true, slags: "ny" | "flere", binding } eller
             { ok: false, grund: "selv" | "ingen" | "ring" | "maks" | "plads" } */
    P.binde = function (M, aId, sA, bId, sB, pos) {
        var A = M.atomer[aId], B = M.atomer[bId];
        if (aId === bId) return { ok: false, grund: "selv" };
        if (P.enlige(M, A) < 1 || P.enlige(M, B) < 1) return { ok: false, grund: "ingen" };
        var findes = P.find(M, A, B);
        if (findes) {
            if (findes.n >= 3) return { ok: false, grund: "maks" };
            findes.n++;
            return { ok: true, slags: "flere", binding: findes };
        }
        var dele = P.dele(M);
        var dA = delAf(dele, aId), dB = delAf(dele, bId);
        if (dA === dB) return { ok: false, grund: "ring" };

        var bStaar = dB.length > dA.length ||
            (dB.length === dA.length && P.enlige(M, B) >= P.enlige(M, A));
        var stat, flyt, sS, sF, dFlyt, dStat;
        if (bStaar) { stat = B; sS = sB; flyt = A; sF = sA; dFlyt = dA; dStat = dB; }
        else { stat = A; sS = sA; flyt = B; sF = sB; dFlyt = dB; dStat = dA; }

        /* De sider paa det staaende atom, der kan bruges: helst den, der
           vender mod det andet atom paa skaermen, og ellers den, eleven brugte */
        var retx = 0, rety = 0;
        if (pos && pos[stat.id] && pos[flyt.id]) {
            retx = pos[flyt.id].x - pos[stat.id].x;
            rety = pos[flyt.id].y - pos[stat.id].y;
            var l = Math.hypot(retx, rety) || 1;
            retx /= l; rety /= l;
        }
        /* Et loest atom kan vende sine elektroner, som det vil: alle sider kan bruges */
        var kandS = P.naboer(M, stat).length ? P.enligeSider(M, stat) : [0, 1, 2, 3];
        if (kandS.indexOf(sS) < 0) kandS.push(sS);
        kandS.sort(function (p, q) {
            var vp = RET[p].x * retx + RET[p].y * rety + (p === sS ? 0.6 : 0);
            var vq = RET[q].x * retx + RET[q].y * rety + (q === sS ? 0.6 : 0);
            return vq - vp;
        });
        var kandF = P.enligeSider(M, flyt);
        if (kandF.indexOf(sF) < 0) kandF.unshift(sF);
        var optaget = {};
        dStat.forEach(function (id) { optaget[M.atomer[id].gx + "," + M.atomer[id].gy] = true; });

        for (var i = 0; i < kandS.length; i++) {
            var s1 = kandS[i];
            /* Den flyttede del drejes saa lidt som muligt */
            var fs = kandF.slice().sort(function (p, q) {
                function drejning(s) { var r = (P.modsat(s1) - s + 4) % 4; return r === 0 ? 0 : (r === 2 ? 2 : 1); }
                return drejning(p) - drejning(q);
            });
            for (var j = 0; j < fs.length; j++) {
                var s2 = fs[j];
                var mx = stat.gx + RET[s1].x, my = stat.gy + RET[s1].y;
                var r = (P.modsat(s1) - s2 + 4) % 4;
                var nye = {}, ledigt = true;
                dFlyt.forEach(function (id) {
                    var x = M.atomer[id];
                    var v = drej({ x: x.gx - flyt.gx, y: x.gy - flyt.gy }, r);
                    nye[id] = { x: mx + v.x, y: my + v.y };
                    if (optaget[nye[id].x + "," + nye[id].y]) ledigt = false;
                });
                if (!ledigt) continue;
                dFlyt.forEach(function (id) { M.atomer[id].gx = nye[id].x; M.atomer[id].gy = nye[id].y; });
                var ny = { a: aId, b: bId, n: 1 };
                M.bindinger.push(ny);
                return { ok: true, slags: "ny", binding: ny, flyttet: dFlyt.slice() };
            }
        }
        return { ok: false, grund: "plads" };
    };

    /* Ét elektronpar i bindingen gaar tilbage som to uparrede elektroner.
       Var det det sidste, er atomerne ikke laengere bundet. */
    P.bryd = function (M, binding) {
        binding.n--;
        if (binding.n <= 0) {
            M.bindinger.splice(M.bindinger.indexOf(binding), 1);
            /* Hver del faar sine egne koordinater igen fra sit mindste atom */
            P.dele(M).forEach(function (del) {
                var o = M.atomer[del[0]], ox = o.gx, oy = o.gy;
                del.forEach(function (id) { M.atomer[id].gx -= ox; M.atomer[id].gy -= oy; });
            });
            return { fjernet: true };
        }
        return { fjernet: false };
    };

    /* Er prikformlen faerdig? Alle atomer i ét molekyle og ingen uparrede
       elektroner tilbage. For molekylerne her er det det samme som, at
       alle atomer har 8 elektroner omkring sig (hydrogen 2). */
    P.faerdig = function (M) {
        var dele = P.dele(M);
        var enlige = M.atomer.filter(function (a) { return P.enlige(M, a) > 0; });
        return { ok: dele.length === 1 && !enlige.length, sammen: dele.length === 1, enlige: enlige, dele: dele };
    };

    /* Facit som et faerdigt molekyle (Vis svaret og selvtesten) */
    P.facit = function (mol, tegninger) {
        var M = P.nytMolekyle(mol.atomer, tegninger);
        mol.facit.pos.forEach(function (p, i) { M.atomer[i].gx = p[0]; M.atomer[i].gy = p[1]; });
        M.bindinger = mol.facit.b.map(function (b) { return { a: b[0], b: b[1], n: b[2] }; });
        return M;
    };

    /* En elevtegning fra Find fejlen (og dens rettede udgave) */
    P.elevTegning = function (o) {
        var M = { atomer: [], bindinger: [] };
        o.atomer.forEach(function (z, i) {
            var a = { id: i, z: z, gx: o.pos[i][0], gy: o.pos[i][1] };
            if (o.frie && o.frie[i] !== undefined) a.frie = o.frie[i];
            M.atomer.push(a);
        });
        M.bindinger = o.b.map(function (b) { return { a: b[0], b: b[1], n: b[2] }; });
        return M;
    };

    P.rettet = function (o) {
        var r = o.ret || {};
        return P.elevTegning({ atomer: r.atomer || o.atomer, pos: r.pos || o.pos, b: r.b || o.b });
    };

    /* De atomer paa en tegning, der ikke har 8 omkring sig (hydrogen 2) */
    P.fejlAtomer = function (M) {
        return M.atomer.filter(function (a) { return !P.status(M, a).ok; });
    };

    NK.Prik = P;
}());
