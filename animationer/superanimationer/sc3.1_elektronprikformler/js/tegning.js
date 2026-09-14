/* =====================================================================
   tegning.js - alt der tegnes: atomer, bindinger, frie elektronpar,
   stregformel-panelet og sejrskonfetti.

   Tegnefunktionerne kender ikke til spillets faser - de tager et
   NK.Spiltilstand-objekt og tegner det, som det ser ud lige nu. Al
   spillogik (traek, bindingsskift, tjek af svar) ligger i sim_byg.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Én status pr. atom: hvor mange elektroner ses omkring det lige nu,
       og hvor mange skal der til for oktet- (eller duet-) reglen. */
    NK.atomStatus = function (state, a) {
        var base = NK.ELEMENTER[a.z].v;
        var bindingssum = 0, delt = 0;
        state.bindinger.forEach(function (b) {
            if (b.s === a || b.t === a) { bindingssum += b.orden; delt += b.orden * 2; }
        });
        var frie = Math.max(0, base - bindingssum);
        var nu = frie + delt;
        var maal = (a.z === 1) ? 2 : 8;
        return { nu: nu, maal: maal, stabil: nu === maal && frie >= 0, frie: frie };
    };

    /* ----- Hovedlaerredet: atomer, bindinger og frie elektronpar ------ */
    NK.tegnSpil = function (ctx, state, snapMaal) {
        /* Bindinger og deres elektronpar. */
        ctx.strokeStyle = "#3d3d4b";
        ctx.lineWidth = 4;
        state.bindinger.forEach(function (b) {
            ctx.beginPath();
            ctx.moveTo(b.s.x, b.s.y);
            ctx.lineTo(b.t.x, b.t.y);
            ctx.stroke();

            var cx = (b.s.x + b.t.x) / 2, cy = (b.s.y + b.t.y) / 2;
            var vinkel = Math.atan2(b.t.y - b.s.y, b.t.x - b.s.x);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(vinkel);
            ctx.fillStyle = "#f2c53d";
            var prik = function (x, y) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); };
            if (b.orden === 1) { prik(0, -6); prik(0, 6); }
            if (b.orden === 2) { prik(-6, -6); prik(-6, 6); prik(6, -6); prik(6, 6); }
            if (b.orden === 3) { prik(-12, -6); prik(-12, 6); prik(0, -6); prik(0, 6); prik(12, -6); prik(12, 6); }
            ctx.restore();
        });

        /* Atomerne. */
        state.atomer.forEach(function (a) {
            var st = NK.atomStatus(state, a);

            if (a === snapMaal) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r + 10, 0, Math.PI * 2);
                ctx.strokeStyle = "#3d9ee0";
                ctx.lineWidth = 4;
                ctx.shadowColor = "#3d9ee0";
                ctx.shadowBlur = 18;
                ctx.stroke();
                ctx.restore();
            }

            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fillStyle = st.stabil ? "#1c4a37" : "#2b2b36";
            ctx.fill();
            ctx.strokeStyle = st.stabil ? "#3fae72" : "#6b6b7a";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = "#f2f3f5";
            ctx.font = "bold 20px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(NK.ELEMENTER[a.z].s, a.x, a.y);

            ctx.font = "12px 'Cascadia Mono', Consolas, monospace";
            ctx.fillStyle = st.stabil ? "#7ee0a8" : "#f0918a";
            ctx.fillText(st.nu + "/" + st.maal + "e" + NK.haevet("-"), a.x, a.y + 50);

            if (st.frie > 0) {
                var vinkler = state.bindinger.map(function (b) {
                    if (b.s === a) return Math.atan2(b.t.y - a.y, b.t.x - a.x);
                    if (b.t === a) return Math.atan2(b.s.y - a.y, b.s.x - a.x);
                    return null;
                }).filter(function (v) { return v !== null; });

                var start = 0;
                if (vinkler.length) {
                    var sx = 0, sy = 0;
                    vinkler.forEach(function (r) { sx += Math.cos(r); sy += Math.sin(r); });
                    start = Math.atan2(sy, sx) + Math.PI;
                }

                var par = Math.ceil(st.frie / 2);
                for (var i = 0; i < par; i++) {
                    var vinkel = start + (i - (par - 1) / 2);
                    var lx = a.x + Math.cos(vinkel) * (a.r - 6);
                    var ly = a.y + Math.sin(vinkel) * (a.r - 6);
                    ctx.fillStyle = "#f2c53d";
                    var to = (i === par - 1 && st.frie % 2 !== 0) ? 1 : 2;
                    if (to === 2) {
                        var p = vinkel + Math.PI / 2;
                        ctx.beginPath(); ctx.arc(lx + Math.cos(p) * 4, ly + Math.sin(p) * 4, 3, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(lx - Math.cos(p) * 4, ly - Math.sin(p) * 4, 3, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fill();
                    }
                }
            }
        });

        /* Konfettipartikler. */
        for (var k = state.partikler.length - 1; k >= 0; k--) {
            var p = state.partikler[k];
            p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.liv -= 0.02;
            ctx.globalAlpha = Math.max(0, p.liv);
            ctx.fillStyle = p.farve;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.stoerrelse, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            if (p.liv <= 0) state.partikler.splice(k, 1);
        }
    };

    /* ----- Stregformel-panelet: samme struktur som eleven bygger,
       tegnet efter molekylets rigtige bindingsvinkler ------------------ */
    var LINJE_ATOM_R = 17;
    var LINJE_BOND = 52;

    NK.tegnStregformel = function (ctx, w, h, opgave, geometri, state) {
        ctx.clearRect(0, 0, w, h);
        var cx = w / 2, cy = h / 2 - 10;

        var pos = [];
        if (geometri.type === "kaede") {
            var n = opgave.atomer.length;
            opgave.atomer.forEach(function (z, i) {
                pos[i] = { x: cx + (i - (n - 1) / 2) * LINJE_BOND, y: cy };
            });
        } else {
            pos[geometri.hub] = { x: cx, y: cy };
            Object.keys(geometri.vinkler).forEach(function (idxStr) {
                var rad = geometri.vinkler[idxStr] * Math.PI / 180;
                pos[+idxStr] = { x: cx + Math.cos(rad) * LINJE_BOND, y: cy + Math.sin(rad) * LINJE_BOND };
            });
        }

        /* Atomer uden bindinger endnu ligger loest i en raekke i stedet
           for paa deres "rigtige" plads. */
        var bindingssum = {};
        state.atomer.forEach(function (a) { bindingssum[a.id] = 0; });
        state.bindinger.forEach(function (b) { bindingssum[b.s.id] += b.orden; bindingssum[b.t.id] += b.orden; });

        var loese = state.atomer.filter(function (a) { return bindingssum[a.id] === 0; });
        loese.forEach(function (a, k) {
            pos[a.id] = { x: cx + (k - (loese.length - 1) / 2) * 46, y: cy + 62 };
        });

        ctx.strokeStyle = "#7e8590";
        ctx.lineWidth = 2;
        state.bindinger.forEach(function (b) {
            var p1 = pos[b.s.id], p2 = pos[b.t.id];
            var dx = p2.x - p1.x, dy = p2.y - p1.y;
            var len = Math.hypot(dx, dy) || 1;
            var ux = dx / len, uy = dy / len;
            var a1 = { x: p1.x + ux * LINJE_ATOM_R, y: p1.y + uy * LINJE_ATOM_R };
            var a2 = { x: p2.x - ux * LINJE_ATOM_R, y: p2.y - uy * LINJE_ATOM_R };
            var ox = -uy * 3, oy = ux * 3;
            var offsets = b.orden === 1 ? [0] : b.orden === 2 ? [-1, 1] : [-1.6, 0, 1.6];
            offsets.forEach(function (m) {
                ctx.beginPath();
                ctx.moveTo(a1.x + ox * m, a1.y + oy * m);
                ctx.lineTo(a2.x + ox * m, a2.y + oy * m);
                ctx.stroke();
            });
        });

        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#f2f3f5";
        state.atomer.forEach(function (a) {
            var p = pos[a.id];
            ctx.fillText(NK.ELEMENTER[a.z].s, p.x, p.y);
        });
    };
}());
