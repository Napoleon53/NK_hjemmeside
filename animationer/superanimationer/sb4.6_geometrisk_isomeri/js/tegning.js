/* =====================================================================
   tegning.js - tavlen, strukturformlen som i bogen og kuglemodellen

   NK.T.formel tegner C=C med de fire grupper i 120 grader, som i bogen.
   Det atom, der binder, staar lige for enden af stregen: H₃C til venstre,
   CH₃ til hoejre. Funktionen giver felterne tilbage, saa fanen kan se,
   hvad musen er over.

   NK.T.kugle og NK.T.pind er kuglemodellen paa fane 1. Fanen sorterer
   selv efter dybde og tegner det bageste foerst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var FONT = "'Segoe UI', Tahoma, sans-serif";
    T.KRIDT = "#e9eee9";
    T.GUL = "#f2c53d";
    T.GROEN = "#5fcf92";
    T.ROED = "#f0796c";

    /* En farve gjort lysere (t > 0) eller moerkere (t < 0) */
    T.lys = function (hex, t) {
        var n = parseInt(hex.slice(1), 16);
        var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        if (t >= 0) { r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t; }
        else { r *= 1 + t; g *= 1 + t; b *= 1 + t; }
        return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
    };

    /* ----- Tavlen: samme farver som .tavle i css/stil.css ------------------------------ */
    T.tavle = function (ctx, r, kant) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        NK.rundtRekt(ctx, r.x + 3, r.y + 5, r.b, r.h, 8);
        ctx.fill();
        ctx.fillStyle = "#6d4c2f";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8);
        ctx.fill();
        var g = ctx.createLinearGradient(r.x, r.y, r.x + r.b, r.y + r.h);
        g.addColorStop(0, "#22302b");
        g.addColorStop(1, "#1b2622");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, r.x + 10, r.y + 10, r.b - 20, r.h - 20, 4);
        ctx.fill();
        if (kant) {
            ctx.strokeStyle = kant;
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, r.x - 2, r.y - 2, r.b + 4, r.h + 4, 9);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Strukturformlen ----------------------------------------------------------------
       lay: { cx, cy, u }  midten og enheden (ca. en bindingslaengde)
       pos: fire gruppe-id'er (eller null for en tom plads)
       opt: ring[i] farve paa ringen om gruppen; zTal[i] vis atomnummeret;
            naeste[i] vis atomerne paa det foerste atom; linje [i, j] stiplet
            linje mellem to grupper; over: pladsen musen eller en gruppe er
            over; skjul: pladsen, der er loftet op; svag: tegnes svagere */
    var RETNING = [[-0.5, -0.866], [-0.5, 0.866], [0.5, -0.866], [0.5, 0.866]];

    T.formelGeo = function (lay) {
        var u = lay.u, fs = NK.klamp(u * 0.42, 20, 46);
        var cv = { x: lay.cx - u * 0.72, y: lay.cy }, ch = { x: lay.cx + u * 0.72, y: lay.cy };
        var felter = RETNING.map(function (d, i) {
            var c = i < 2 ? cv : ch;
            return { x: c.x + d[0] * u * 1.42, y: c.y + d[1] * u * 1.42, d: d, c: c, i: i };
        });
        return { u: u, fs: fs, cv: cv, ch: ch, felter: felter };
    };

    T.formel = function (ctx, lay, pos, opt) {
        opt = opt || {};
        var G = T.formelGeo(lay), fs = G.fs, u = G.u;
        var font = "700 " + fs + "px " + FONT;
        var lw = Math.max(2.4, fs * 0.075);
        ctx.save();
        ctx.globalAlpha = opt.svag ? 0.35 : 1;
        ctx.font = font;
        ctx.textBaseline = "middle";
        ctx.strokeStyle = T.KRIDT;
        ctx.fillStyle = T.KRIDT;
        ctx.lineCap = "round";
        ctx.lineWidth = lw;

        /* C=C */
        var rC = fs * 0.45;
        ctx.textAlign = "center";
        ctx.fillText("C", G.cv.x, G.cv.y + fs * 0.04);
        ctx.fillText("C", G.ch.x, G.ch.y + fs * 0.04);
        var dy = fs * 0.13;
        linje(ctx, G.cv.x + rC, G.cv.y - dy, G.ch.x - rC, G.ch.y - dy);
        linje(ctx, G.cv.x + rC, G.cv.y + dy, G.ch.x - rC, G.ch.y + dy);

        /* Den stiplede linje mellem de to vindere ligger under grupperne */
        if (opt.linje) {
            var a = G.felter[opt.linje[0]], b = G.felter[opt.linje[1]];
            ctx.save();
            ctx.setLineDash([fs * 0.28, fs * 0.22]);
            ctx.strokeStyle = opt.linjeFarve || T.GUL;
            ctx.globalAlpha = (opt.svag ? 0.35 : 1) * 0.85;
            ctx.lineWidth = lw * 1.1;
            linje(ctx, a.x, a.y, b.x, b.y);
            ctx.restore();
        }

        var ud = [];
        G.felter.forEach(function (f, i) {
            var id = pos[i];
            var c = f.c, d = f.d;
            var startX = c.x + d[0] * rC * 1.05, startY = c.y + d[1] * rC * 1.05;
            if (!id || opt.skjul === i) {
                /* En tom plads: en stiplet ring med et spoergsmaalstegn */
                var rr = fs * 0.62;
                ctx.save();
                ctx.globalAlpha = (opt.svag ? 0.35 : 1) * (opt.over === i ? 1 : 0.55);
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = opt.over === i ? T.GUL : T.KRIDT;
                ctx.lineWidth = 2;
                linje(ctx, startX, startY, f.x - d[0] * rr, f.y - d[1] * rr);
                ctx.beginPath();
                ctx.arc(f.x, f.y, rr, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = opt.over === i ? T.GUL : T.KRIDT;
                ctx.font = "600 " + (fs * 0.7) + "px " + FONT;
                ctx.textAlign = "center";
                ctx.fillText("?", f.x, f.y + fs * 0.03);
                ctx.restore();
                ud.push({ x: f.x - rr, y: f.y - rr, b: rr * 2, h: rr * 2, cx: f.x, cy: f.y, i: i, tom: true });
                return;
            }
            var gr = D.G[id];
            var spec = i < 2 ? gr.v : gr.h;
            var tekst = spec[0];
            var foer = tekst.slice(0, spec[1]), sym = tekst.substr(spec[1], spec[2]);
            ctx.font = font;
            var wFoer = ctx.measureText(foer).width, wSym = ctx.measureText(sym).width, wAlt = ctx.measureText(tekst).width;
            var x0 = f.x - wFoer - wSym / 2;
            var rG = Math.max(fs * 0.42, wSym / 2 + fs * 0.12);
            ctx.strokeStyle = T.KRIDT;
            linje(ctx, startX, startY, f.x - d[0] * rG, f.y - d[1] * rG);

            var boks = { x: x0 - fs * 0.22, y: f.y - fs * 0.66, b: wAlt + fs * 0.44, h: fs * 1.32, cx: f.x, cy: f.y, i: i };
            if (opt.ring && opt.ring[i]) {
                ctx.save();
                ctx.strokeStyle = opt.ring[i];
                ctx.lineWidth = 3;
                ctx.fillStyle = opt.ring[i] === T.ROED ? "rgba(240,121,108,0.16)" : (opt.ring[i] === T.GROEN ? "rgba(95,207,146,0.16)" : "rgba(242,197,61,0.16)");
                NK.rundtRekt(ctx, boks.x, boks.y, boks.b, boks.h, fs * 0.3);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            } else if (opt.over === i) {
                ctx.save();
                ctx.strokeStyle = "rgba(242,197,61,0.7)";
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                NK.rundtRekt(ctx, boks.x, boks.y, boks.b, boks.h, fs * 0.3);
                ctx.stroke();
                ctx.restore();
            }
            ctx.fillStyle = (opt.tekstFarve && opt.tekstFarve[i]) || T.KRIDT;
            ctx.textAlign = "left";
            ctx.fillText(tekst, x0, f.y + fs * 0.04);

            /* Atomnummeret over (eller under) det atom, der binder */
            var op = d[1] < 0;
            if (opt.zTal && opt.zTal[i]) {
                var z = D.Z[gr.atom], rz = fs * 0.36;
                var by = op ? f.y - fs * 1.08 : f.y + fs * 1.08;
                ctx.save();
                ctx.fillStyle = T.GUL;
                ctx.beginPath();
                ctx.arc(f.x, by, rz, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#1b2622";
                ctx.font = "800 " + (fs * 0.42) + "px " + FONT;
                ctx.textAlign = "center";
                ctx.fillText(String(z), f.x, by + fs * 0.02);
                ctx.restore();
                if (opt.naeste && opt.naeste[i] && gr.naeste.length) {
                    var n = gr.naeste.slice().sort(function (p, q) { return D.Z[q] - D.Z[p]; }).join(", ");
                    ctx.save();
                    ctx.fillStyle = "#cfe0d6";
                    ctx.font = "600 " + Math.max(13, fs * 0.38) + "px " + FONT;
                    ctx.textAlign = "left";
                    ctx.fillText("på " + gr.atom + ": " + n, f.x + rz + 6, by + fs * 0.02);
                    ctx.restore();
                }
            }
            ud.push(boks);
        });
        ctx.restore();
        return { felter: ud, geo: G };
    };

    function linje(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    /* En gruppe som brik (paletten og den brik, eleven holder) */
    T.brik = function (ctx, x, y, id, opt) {
        opt = opt || {};
        var tekst = D.tekst(id);
        var fs = opt.fs || 22;
        ctx.save();
        ctx.font = "700 " + fs + "px " + FONT;
        var b = Math.max(fs * 1.9, ctx.measureText(tekst).width + fs * 0.9), h = fs * 1.7;
        ctx.globalAlpha = opt.alfa === undefined ? 1 : opt.alfa;
        if (opt.skygge) {
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            NK.rundtRekt(ctx, x - b / 2 + 3, y - h / 2 + 5, b, h, 8);
            ctx.fill();
        }
        ctx.fillStyle = opt.over ? "#3f4a45" : "#2c3833";
        ctx.strokeStyle = opt.over ? T.GUL : "rgba(233,238,233,0.45)";
        ctx.lineWidth = opt.over ? 2.5 : 1.5;
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = T.KRIDT;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + fs * 0.04);
        ctx.restore();
        return { x: x - b / 2, y: y - h / 2, b: b, h: h };
    };

    T.brikBredde = function (ctx, id, fs) {
        ctx.save();
        ctx.font = "700 " + fs + "px " + FONT;
        var b = Math.max(fs * 1.9, ctx.measureText(D.tekst(id)).width + fs * 0.9);
        ctx.restore();
        return b;
    };

    /* ----- Et stempel, der popper frem (t fra 0 til 1) ---------------------------------- */
    T.stempel = function (ctx, x, y, tekst, farve, t, fs) {
        if (t <= 0) return;
        var s = NK.pop(Math.min(1, t * 2.2));
        fs = fs || 30;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.06 * (1 - s));
        ctx.scale(0.4 + 0.6 * s, 0.4 + 0.6 * s);
        ctx.globalAlpha = Math.min(1, t * 3);
        ctx.font = "800 " + fs + "px " + FONT;
        var b = ctx.measureText(tekst).width + fs * 1.1, h = fs * 1.55;
        ctx.fillStyle = "rgba(14, 22, 18, 0.92)";
        ctx.strokeStyle = farve;
        ctx.lineWidth = 3;
        NK.rundtRekt(ctx, -b / 2, -h / 2, b, h, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = farve;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, 0, fs * 0.04);
        ctx.restore();
    };

    /* ----- Kuglemodellen ---------------------------------------------------------------- */
    T.kugle = function (ctx, x, y, r, farve, tekst, opt) {
        opt = opt || {};
        ctx.save();
        ctx.globalAlpha = opt.alfa === undefined ? 1 : opt.alfa;
        if (opt.omrids) {
            ctx.setLineDash([5, 4]);
            ctx.strokeStyle = "rgba(220, 226, 235, 0.55)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            return;
        }
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, T.lys(farve, 0.55));
        g.addColorStop(0.55, farve);
        g.addColorStop(1, T.lys(farve, -0.35));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (opt.ring) {
            ctx.strokeStyle = opt.ring;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(x, y, r + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (tekst) {
            var fs = opt.fs || Math.max(13, r * 0.78);
            ctx.font = "700 " + fs + "px " + FONT;
            if (ctx.measureText(tekst).width > r * 1.8) {
                fs = Math.max(11, fs * r * 1.8 / ctx.measureText(tekst).width);
                ctx.font = "700 " + fs + "px " + FONT;
            }
            ctx.fillStyle = opt.tekstFarve || "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(tekst, x, y + fs * 0.05);
        }
        ctx.restore();
    };

    /* Bogstaverne paa en kugle (tegnes efter alle kugler og pinde) */
    T.kugleTekst = function (ctx, x, y, r, tekst, farve) {
        if (!tekst) return;
        ctx.save();
        var fs = Math.max(13, r * 0.78);
        ctx.font = "700 " + fs + "px " + FONT;
        if (ctx.measureText(tekst).width > r * 1.8) {
            fs = Math.max(11, fs * r * 1.8 / ctx.measureText(tekst).width);
            ctx.font = "700 " + fs + "px " + FONT;
        }
        ctx.fillStyle = farve || "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + fs * 0.05);
        ctx.restore();
    };

    /* En pind mellem to kugler, med lys kant, saa den ser rund ud */
    T.pind = function (ctx, x1, y1, x2, y2, b, farve, alfa) {
        ctx.save();
        ctx.globalAlpha = alfa === undefined ? 1 : alfa;
        ctx.lineCap = "round";
        ctx.strokeStyle = T.lys(farve, -0.4);
        ctx.lineWidth = b;
        linje(ctx, x1, y1, x2, y2);
        ctx.strokeStyle = farve;
        ctx.lineWidth = b * 0.62;
        linje(ctx, x1, y1, x2, y2);
        ctx.strokeStyle = T.lys(farve, 0.45);
        ctx.lineWidth = b * 0.2;
        var nx = -(y2 - y1), ny = x2 - x1, L = Math.hypot(nx, ny) || 1;
        var o = b * 0.16;
        linje(ctx, x1 + nx / L * o, y1 + ny / L * o, x2 + nx / L * o, y2 + ny / L * o);
        ctx.restore();
    };

    /* ----- Rummet: drejning og perspektiv ------------------------------------------------- */
    T.drejX = function (p, v) {
        var c = Math.cos(v), s = Math.sin(v);
        return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
    };
    T.drejY = function (p, v) {
        var c = Math.cos(v), s = Math.sin(v);
        return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    };

    /* kam: { cx, cy, s (pixels pr. enhed), f (afstand), yaw, pitch } */
    T.projekter = function (p, kam) {
        var q = T.drejY(p, kam.yaw || 0);
        q = T.drejX(q, kam.pitch || 0);
        var f = kam.f || 7;
        var k = f / (f + q[2]);
        return { x: kam.cx + q[0] * kam.s * k, y: kam.cy + q[1] * kam.s * k, k: k, z: q[2] };
    };

    NK.T = T;
}());
