/* =====================================================================
   rum.js - et C-atom med fire grupper i rummet

   Rummet: x mod hoejre, y nedad, z ind i skaermen (et hoejrehaandet
   system). Molekylets drejning er en kvaternion [w, x, y, z], saa det
   kan drejes frit med musen (som en kugle) og glide blødt hen til en
   bestemt drejning (Vis svaret og klik paa plads).

   De fire grupper sidder i et tetraeder om C-atomet: BASIS er de fire
   retninger, foer molekylet er drejet.

   justeringer(kilde, maal) finder de drejninger, der lægger de fire
   retninger i kilde oven i de fire retninger i maal (12 for et
   tetraeder, ét for hver lige permutation). Det bruges til at se, om
   molekylet kan drejes, saa det passer med sit spejlbillede.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.T;
    var R = {};
    var ENHED = 60;           /* kuglernes radius i data er i pixels ved s = ENHED */
    R.ENHED = ENHED;
    R.LAENGDE = 1.3;          /* bindingens laengde */
    var C_KUGLE = { farve: "#3b4049", r: 23, tekst: "#ffffff" };

    /* ----- Vektorer ---------------------------------------------------------------- */
    function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
    function prik(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function kryds(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    R.norm = norm; R.prik = prik; R.kryds = kryds;

    var k = 1 / Math.sqrt(3);
    R.BASIS = [[k, k, k], [k, -k, -k], [-k, k, -k], [-k, -k, k]];

    /* ----- Kvaternioner ------------------------------------------------------------- */
    var Q = {};
    Q.en = function () { return [1, 0, 0, 0]; };
    Q.akse = function (a, v) {
        a = norm(a);
        var s = Math.sin(v / 2);
        return [Math.cos(v / 2), a[0] * s, a[1] * s, a[2] * s];
    };
    Q.gange = function (a, b) {
        return [
            a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
            a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
            a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
            a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]
        ];
    };
    Q.norm = function (q) { var l = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; };
    Q.drej = function (q, v) {
        var p = Q.gange(Q.gange(q, [0, v[0], v[1], v[2]]), [q[0], -q[1], -q[2], -q[3]]);
        return [p[1], p[2], p[3]];
    };
    Q.fraMatrix = function (m) {
        /* m[raekke][soejle] */
        var tr = m[0][0] + m[1][1] + m[2][2], w, x, y, z, s;
        if (tr > 0) {
            s = Math.sqrt(tr + 1) * 2;
            w = 0.25 * s; x = (m[2][1] - m[1][2]) / s; y = (m[0][2] - m[2][0]) / s; z = (m[1][0] - m[0][1]) / s;
        } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
            s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2;
            w = (m[2][1] - m[1][2]) / s; x = 0.25 * s; y = (m[0][1] + m[1][0]) / s; z = (m[0][2] + m[2][0]) / s;
        } else if (m[1][1] > m[2][2]) {
            s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2;
            w = (m[0][2] - m[2][0]) / s; x = (m[0][1] + m[1][0]) / s; y = 0.25 * s; z = (m[1][2] + m[2][1]) / s;
        } else {
            s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2;
            w = (m[1][0] - m[0][1]) / s; x = (m[0][2] + m[2][0]) / s; y = (m[1][2] + m[2][1]) / s; z = 0.25 * s;
        }
        return Q.norm([w, x, y, z]);
    };
    Q.prik = function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; };
    /* Vinklen (radianer) mellem to drejninger */
    Q.vinkel = function (a, b) { return 2 * Math.acos(Math.min(1, Math.abs(Q.prik(a, b)))); };
    Q.slerp = function (a, b, t) {
        var d = Q.prik(a, b);
        if (d < 0) { b = [-b[0], -b[1], -b[2], -b[3]]; d = -d; }
        if (d > 0.9995) return Q.norm([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]);
        var th = Math.acos(d), s = Math.sin(th);
        var wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
        return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb, a[3] * wa + b[3] * wb];
    };
    /* Bloed bevaegelse mod maalet, uafhaengigt af billedraten */
    Q.mod = function (nu, maal, hastighed, dt) {
        return Q.norm(Q.slerp(nu, maal, 1 - Math.exp(-hastighed * dt)));
    };
    R.Q = Q;

    /* Den drejning, der laegger a0 paa b0 og a1 i planet med b1 */
    function rammeDrejning(a0, a1, b0, b1) {
        function ramme(u, v) {
            var e1 = norm(u);
            var e2 = norm([v[0] - prik(v, e1) * e1[0], v[1] - prik(v, e1) * e1[1], v[2] - prik(v, e1) * e1[2]]);
            return [e1, e2, kryds(e1, e2)];
        }
        var A = ramme(a0, a1), B = ramme(b0, b1);
        var m = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
            m[i][j] = B[0][i] * A[0][j] + B[1][i] * A[1][j] + B[2][i] * A[2][j];
        }
        return Q.fraMatrix(m);
    }

    R.ramme = rammeDrejning;

    var PERM = [];
    (function lav(p, rest) {
        if (!rest.length) { PERM.push(p); return; }
        rest.forEach(function (x, i) { lav(p.concat([x]), rest.slice(0, i).concat(rest.slice(i + 1))); });
    }([], [0, 1, 2, 3]));

    /* Alle drejninger q, saa drej(q, kilde[i]) = maal[perm[i]] for alle fire */
    R.justeringer = function (kilde, maal) {
        var ud = [];
        PERM.forEach(function (p) {
            var q = rammeDrejning(kilde[0], kilde[1], maal[p[0]], maal[p[1]]);
            var ok = [0, 1, 2, 3].every(function (i) { return prik(Q.drej(q, kilde[i]), maal[p[i]]) > 0.995; });
            if (ok) ud.push({ q: q, perm: p });
        });
        return ud;
    };

    R.spejl = function (v) { return [-v[0], v[1], v[2]]; };

    /* ----- Tegningen --------------------------------------------------------------------
       m: { g: fire gruppe-id'er, q: drejningen, retninger (valgfri: i stedet for q) }
       kam: { cx, cy, s, f }
       opt: ring[i] farve, tal[i] prioritetens nummer, over (i), omrids, alfa,
            lys (i, en gruppe, der lyser) */
    R.retninger = function (q) { return R.BASIS.map(function (b) { return Q.drej(q, b); }); };

    function projekter(p, kam) {
        var f = kam.f || 8;
        var kk = f / (f + p[2]);
        return { x: kam.cx + p[0] * kam.s * kk, y: kam.cy + p[1] * kam.s * kk, k: kk, z: p[2] };
    }
    R.projekter = projekter;

    /* Kuglerne projiceret (forrest foerst): til musen */
    R.kugler = function (m, kam) {
        var ret = m.retninger || R.retninger(m.q);
        var D = NK.Data;
        var ud = [{ i: -1, p: [0, 0, 0], kug: C_KUGLE }];
        ret.forEach(function (r, i) {
            ud.push({ i: i, p: [r[0] * R.LAENGDE, r[1] * R.LAENGDE, r[2] * R.LAENGDE], kug: D.G[m.g[i]].kugle });
        });
        ud.forEach(function (u) {
            var pr = projekter(u.p, kam);
            u.x = pr.x; u.y = pr.y; u.z = pr.z; u.k = pr.k;
            u.r = u.kug.r * pr.k * kam.s / ENHED;
            u.rm = u.kug.r / ENHED;
        });
        return ud.sort(function (a, b) { return a.z - b.z; });
    };

    R.ramt = function (m, kam, pt) {
        var k2 = R.kugler(m, kam);
        for (var i = 0; i < k2.length; i++) {
            if (Math.hypot(pt.x - k2[i].x, pt.y - k2[i].y) <= k2[i].r + 5) return k2[i];
        }
        return null;
    };

    R.tegn = function (ctx, m, kam, opt) {
        opt = opt || {};
        var D = NK.Data;
        var kug = R.kugler(m, kam);
        var midt = kug.filter(function (u) { return u.i === -1; })[0];
        var ting = [];
        kug.forEach(function (u) {
            ting.push({ slags: "a", u: u, z: u.z });
            if (u.i >= 0) ting.push({ slags: "b", u: u, z: Math.max(u.z, midt.z) - 0.001 });
        });
        ting.sort(function (a, b) { return b.z - a.z; });
        ctx.save();
        ctx.globalAlpha = opt.alfa === undefined ? 1 : opt.alfa;
        ting.forEach(function (t) {
            var u = t.u;
            if (t.slags === "b") {
                var d = norm(u.p);
                var s = [d[0] * midt.rm * 0.8, d[1] * midt.rm * 0.8, d[2] * midt.rm * 0.8];
                var e = [u.p[0] - d[0] * u.rm * 0.8, u.p[1] - d[1] * u.rm * 0.8, u.p[2] - d[2] * u.rm * 0.8];
                var ps = projekter(s, kam), pe = projekter(e, kam);
                if (opt.omrids) {
                    ctx.save();
                    ctx.setLineDash([5, 5]);
                    ctx.strokeStyle = "rgba(220,226,235,0.4)";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(ps.x, ps.y); ctx.lineTo(pe.x, pe.y); ctx.stroke();
                    ctx.restore();
                } else {
                    T.pind(ctx, ps.x, ps.y, pe.x, pe.y, 9 * (ps.k + pe.k) / 2 * kam.s / ENHED, "#9aa3ad");
                }
                return;
            }
            if (opt.omrids) {
                if (u.i >= 0) T.kugle(ctx, u.x, u.y, u.r, u.kug.farve, "", { omrids: true });
                return;
            }
            var ring = null;
            if (u.i >= 0) {
                if (opt.ring && opt.ring[u.i]) ring = opt.ring[u.i];
                else if (opt.lys === u.i) ring = T.GUL;
                else if (opt.over === u.i) ring = "rgba(242,197,61,0.75)";
            }
            T.kugle(ctx, u.x, u.y, u.r, u.kug.farve, "", { ring: ring });
        });
        if (!opt.omrids) {
            /* Bogstaverne til sidst, medmindre en kugle laengere fremme daekker dem */
            kug.forEach(function (u) {
                var daekket = kug.some(function (v) { return v !== u && v.z < u.z - 0.05 && Math.hypot(v.x - u.x, v.y - u.y) < v.r * 0.85; });
                if (daekket) return;
                T.kugleTekst(ctx, u.x, u.y, u.r, u.i < 0 ? "C" : D.tekst(m.g[u.i]), u.kug.tekst);
            });
            /* Prioriteternes numre oppe til hoejre for kuglen */
            if (opt.tal) {
                kug.forEach(function (u) {
                    if (u.i < 0 || !opt.tal[u.i]) return;
                    var bx = u.x + u.r * 0.8, by = u.y - u.r * 0.8, rb = Math.max(11, u.r * 0.48);
                    ctx.save();
                    ctx.fillStyle = opt.talFarve && opt.talFarve[u.i] ? opt.talFarve[u.i] : T.GUL;
                    ctx.strokeStyle = "rgba(0,0,0,0.6)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.arc(bx, by, rb, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = "#1b1b21";
                    ctx.font = "800 " + Math.round(rb * 1.25) + "px 'Segoe UI', sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(String(opt.tal[u.i]), bx, by + 1);
                    ctx.restore();
                });
            }
        }
        ctx.restore();
        return kug;
    };

    NK.Rum = R;
}());
