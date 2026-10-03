/* =====================================================================
   kemi.js - molekylerne, deres gruppe og tegningerne af dem

   Hvert molekyle i data.js laves af molekylemotoren: SMILES bliver til
   et molekyle (NK.Smiles), navngivningen finder hovedkaeden og
   stofklassen (NK.Navn), og NK.Layout.zigzag laegger det ud som i
   bogen. Tegningen (NK.Struktur) laves én gang pr. stoerrelse og gemmes.

   Gruppen er det, der afgoer stofklassen: dobbelt- eller
   tripelbindingen, ringen, OH, COOH, NH₂, CHO, C=O i kaeden eller COO.
   Den fremhaeves i klassens farve, naar molekylet er sorteret, og naar
   det lander i den forkerte spand.

   NK.Kemi.molekyler(udgave)   alle molekylerne til en udgave
   NK.Kemi.gruppe(mol, klasse) { atomer: {id: true}, bindinger: [...] }
   NK.Kemi.tegning(m, v)       tegningen centreret om (0, 0), gemt pr. v
   NK.Kemi.tegn(ctx, m, v)     tegner den
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var STREG = "#f2f3f5";

    /* ----- Gruppen ----------------------------------------------------------- */
    function andet(bd, id) { return bd.a === id ? bd.b : bd.a; }

    /* Ringens atomer: de tunge atomer, der er tilbage, naar enderne pilles
       af igen og igen (som i layout.js) */
    function ringAtomer(mol) {
        var grad = {}, ko = [], vaek = {}, ud = {};
        mol.atomer.forEach(function (a) {
            grad[a.id] = mol.grad(a.id);
            if (grad[a.id] <= 1) ko.push(a.id);
        });
        while (ko.length) {
            var id = ko.pop();
            if (vaek[id]) continue;
            vaek[id] = true;
            mol.naboer(id).forEach(function (n) { if (!vaek[n] && --grad[n] <= 1) ko.push(n); });
        }
        mol.atomer.forEach(function (a) { if (!vaek[a.id]) ud[a.id] = true; });
        return ud;
    }

    /* C=O paa et C: { c, o, bd } for hvert carbonyl-O (O med kun den ene binding) */
    function carbonyler(mol) {
        var ud = [];
        mol.bindinger.forEach(function (bd) {
            if (bd.orden !== 2) return;
            var a = mol.atom(bd.a), b = mol.atom(bd.b);
            var c = a.el === "C" && b.el === "O" ? a : (b.el === "C" && a.el === "O" ? b : null);
            if (!c) return;
            var o = c === a ? b : a;
            if (mol.grad(o.id) === 1) ud.push({ c: c.id, o: o.id, bd: bd });
        });
        return ud;
    }

    /* Enkeltbundne O paa et C: [{ o, bd, andre: [andre naboer til O] }] */
    function enkeltO(mol, c) {
        return mol.bindingerTil(c).filter(function (bd) {
            return bd.orden === 1 && mol.atom(andet(bd, c)).el === "O";
        }).map(function (bd) {
            var o = andet(bd, c);
            return { o: o, bd: bd, andre: mol.bindingerTil(o).filter(function (x) { return x !== bd; }) };
        });
    }

    function gruppe(mol, klasse) {
        var atomer = {}, bindinger = [];
        function med(bd) {
            if (bindinger.indexOf(bd) < 0) bindinger.push(bd);
            atomer[bd.a] = true;
            atomer[bd.b] = true;
        }
        var co = carbonyler(mol);
        if (klasse === "alkan") {
            mol.bindinger.forEach(med);
        } else if (klasse === "alken" || klasse === "alkyn") {
            var orden = klasse === "alken" ? 2 : 3;
            mol.bindinger.forEach(function (bd) {
                if (bd.orden === orden && mol.atom(bd.a).el === "C" && mol.atom(bd.b).el === "C") med(bd);
            });
        } else if (klasse === "cycloalkan" || klasse === "aromat") {
            var ring = ringAtomer(mol);
            mol.bindinger.forEach(function (bd) { if (ring[bd.a] && ring[bd.b]) med(bd); });
        } else if (klasse === "alkohol") {
            mol.atomer.forEach(function (a) {
                if (a.el !== "O" || mol.implicitH(a.id) !== 1 || mol.grad(a.id) !== 1) return;
                var bd = mol.bindingerTil(a.id)[0], c = andet(bd, a.id);
                if (mol.atom(c).el === "C" && !co.some(function (x) { return x.c === c; })) med(bd);
            });
        } else if (klasse === "amin") {
            mol.atomer.forEach(function (a) {
                if (a.el === "N") mol.bindingerTil(a.id).forEach(med);
            });
        } else {
            co.forEach(function (x) {
                var os = enkeltO(mol, x.c);
                var oh = os.filter(function (s) { return !s.andre.length && mol.implicitH(s.o) === 1; });
                var oc = os.filter(function (s) { return s.andre.length === 1 && mol.atom(andet(s.andre[0], s.o)).el === "C"; });
                var cNab = mol.naboer(x.c).filter(function (n) { return mol.atom(n).el === "C"; }).length;
                if (klasse === "syre" && oh.length && !oc.length) { med(x.bd); med(oh[0].bd); }
                else if (klasse === "ester" && oc.length) { med(x.bd); med(oc[0].bd); med(oc[0].andre[0]); }
                else if (klasse === "aldehyd" && !os.length && mol.implicitH(x.c) >= 1) med(x.bd);
                else if (klasse === "keton" && !os.length && cNab === 2) med(x.bd);
            });
        }
        return { atomer: atomer, bindinger: bindinger };
    }

    /* ----- Molekylerne --------------------------------------------------------- */
    function lav(d, udgave) {
        var mol = NK.Smiles.laes(d[2]);
        var res = NK.Navn.analyser(mol);
        NK.Layout.zigzag(mol, res);
        return {
            klasse: d[0],
            navn: d[1],
            note: d[3] || "",
            smiles: d[2],
            udgave: udgave,
            mol: mol,
            res: res,
            formel: mol.formel(),
            gruppe: gruppe(mol, d[0]),
            cache: {}
        };
    }

    var lager = {};
    function molekyler(udgave) {
        if (!lager[udgave]) {
            lager[udgave] = D.UDGAVER[udgave].molekyler.map(function (d) { return lav(d, udgave); });
        }
        return lager[udgave];
    }

    /* Navnet med trivialnavnet i parentes: ethansyre (eddikesyre) */
    function fuldtNavn(m) {
        return m.navn + (m.note ? " (" + m.note + ")" : "");
    }

    /* ----- Farver --------------------------------------------------------------- */
    function lys(hex, t) {
        var n = parseInt(hex.slice(1), 16);
        var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        r = Math.round(r + (255 - r) * t); g = Math.round(g + (255 - g) * t); b = Math.round(b + (255 - b) * t);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    function klasseFarve(udgave, klasse) {
        return (D.FARVER[udgave] || {})[klasse] || "#bbbbbb";
    }

    /* ----- Tegningen ----------------------------------------------------------------
       v: { bredde: stoerste bredde, binding: bindingslaengde, skrift,
            linje, fremhaev: klassen, hvis gruppen skal fremhaeves } */
    function geo(m, skala, v) {
        var fremhaev = v.fremhaev, gr = m.gruppe;
        var farve = fremhaev ? lys(klasseFarve(m.udgave, fremhaev), 0.4) : null;
        return NK.Struktur.geometri(m.mol, {
            skala: skala,
            stil: "zigzag",
            farve: STREG,
            skrift: v.skrift,
            linje: v.linje,
            atomFarve: function (id) {
                if (farve && gr.atomer[id] && m.mol.atom(id).el !== "C") return farve;
                return D.ATOMFARVE[m.mol.atom(id).el] || null;
            },
            bindingFarve: function (bd) { return farve && gr.bindinger.indexOf(bd) >= 0 ? farve : null; }
        });
    }

    function tegning(m, v) {
        var noegle = [v.bredde, v.binding, v.skrift, v.linje, v.fremhaev || ""].join("|");
        if (m.cache[noegle]) return m.cache[noegle];
        var skala = v.binding;
        var g = geo(m, skala, v);
        var b = g.x1 - g.x0;
        if (v.bredde && b > v.bredde) {
            skala = skala * v.bredde / b;
            g = geo(m, skala, v);
        }
        var t = { g: g, cx: (g.x0 + g.x1) / 2, cy: (g.y0 + g.y1) / 2, b: g.x1 - g.x0, h: g.y1 - g.y0 };
        m.cache[noegle] = t;
        return t;
    }

    function tegn(ctx, m, v) {
        var t = tegning(m, v);
        ctx.save();
        ctx.translate(-t.cx, -t.cy);
        NK.Struktur.tegnGeo(ctx, t.g);
        ctx.restore();
        return t;
    }

    /* Molekylet i et lille laerred (panelet og kortene), centreret og
       skaleret ned, hvis det ikke kan vaere der. clientWidth, ikke
       getBoundingClientRect: kortet kan vaere midt i en skalering. */
    function tegnILaerred(canvas, m, v) {
        var dpr = window.devicePixelRatio || 1;
        var b = Math.max(1, Math.round(canvas.clientWidth)), h = Math.max(1, Math.round(canvas.clientHeight));
        if (canvas.width !== Math.round(b * dpr) || canvas.height !== Math.round(h * dpr)) {
            canvas.width = Math.round(b * dpr);
            canvas.height = Math.round(h * dpr);
        }
        var ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, b, h);
        if (!m) return;
        var t = tegning(m, v);
        var k = Math.min(1, (b - 12) / Math.max(1, t.b), (h - 10) / Math.max(1, t.h));
        ctx.save();
        ctx.translate(b / 2, h / 2);
        ctx.scale(k, k);
        tegn(ctx, m, v);
        ctx.restore();
    }

    NK.Kemi = {
        molekyler: molekyler,
        lav: lav,
        gruppe: gruppe,
        fuldtNavn: fuldtNavn,
        tegning: tegning,
        tegn: tegn,
        tegnILaerred: tegnILaerred,
        klasseFarve: klasseFarve,
        lys: lys
    };
}());
