/* =====================================================================
   model3d.js - kameraet og tegningen af et molekyle i rummet

   Alle tre faner tegner med de samme funktioner. En model er et objekt:

     atomer     [{ el, p: [x, y, z], sprite?, symbol?, alfa? }]
     bindinger  [{ a, b, orden }]
     frie       [{ atom, u: retning, lille? }]   frie elektronpar

   Tegningen er en malermetode: alt sorteres efter afstanden til
   beskueren og tegnes bagfra. Atomer og elektronpar er sprites;
   bindingspindene tegnes i koden.

   Koordinater: x mod hoejre, y opad, z ud mod beskueren. En modelenhed
   svarer omtrent til én aangstroem, saa en C-H-binding er 1,09 lang.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var V = NK.V, M3 = NK.M3;

    var KAMERA = 14;         /* kameraets afstand i modelenheder */
    var PIND_R = 0.085;      /* bindingspindens radius */
    var LAP = 0.8;           /* et frit elektronpars laengde */
    var SPRITE_KUGLE = 128 / 120;   /* atomspritet er 128 bredt, kuglen 120 */

    /* ----- Kameraet ------------------------------------------------------ */
    NK.Visning = function () {
        this.rot = M3.gange(M3.omX(0.3), M3.omY(-0.5));
        this.skala = 90;
        this.skalaMaal = 90;
        this.cx = 0;
        this.cy = 0;
    };

    var VP = NK.Visning.prototype;

    /* Laerredets midte og en skala, saa en kugle med radius r kan vaere der. */
    VP.tilpas = function (b, h, radius, straks) {
        this.cx = b / 2;
        this.cy = h / 2;
        this.skalaMaal = NK.klamp(Math.min(b, h) * 0.4 / Math.max(radius, 0.8), 30, 240);
        if (straks) this.skala = this.skalaMaal;
    };

    VP.opdater = function (dt) {
        this.skala = NK.mod(this.skala, this.skalaMaal, 8, dt);
    };

    VP.drej = function (dx, dy) {
        this.rot = M3.gange(M3.omY(dx * 0.0085), this.rot);
        this.rot = M3.gange(M3.omX(dy * 0.0085), this.rot);
        this.rot = M3.ortonormer(this.rot);
    };

    VP.drejLangsomt = function (dt) {
        this.rot = M3.ortonormer(M3.gange(M3.omY(0.32 * dt), this.rot));
    };

    VP.tilVerden = function (c) {
        return M3.anvend(M3.transponer(this.rot), c);
    };

    VP.projicer = function (p) {
        var q = M3.anvend(this.rot, p);
        var f = KAMERA / (KAMERA - q[2]);
        return { x: this.cx + q[0] * this.skala * f, y: this.cy - q[1] * this.skala * f, z: q[2], f: f };
    };

    /* Et punkt paa skaermen som retning paa en kugle med radius r om
       origo. bag = true vaelger kuglens bagside. */
    VP.retningFraSkaerm = function (x, y, r, bag) {
        var dx = (x - this.cx) / this.skala, dy = -(y - this.cy) / this.skala;
        var d2 = dx * dx + dy * dy;
        var c = d2 < r * r ? [dx, dy, (bag ? -1 : 1) * Math.sqrt(r * r - d2)] : [dx, dy, 0];
        return V.enhed(this.tilVerden(c));
    };

    /* ----- Tegningen ----------------------------------------------------- */
    var T = {};
    NK.Model3D = T;
    T.LAP = LAP;

    function atomRadius(a, kalotte) {
        var g = NK.Data.GRUNDSTOFFER[a.el];
        if (!g) return kalotte ? 1.2 : 0.36;
        return kalotte ? g.rk : g.r;
    }
    T.atomRadius = atomRadius;

    function linje(ctx, x0, y0, x1, y1) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }

    function tegnPind(ctx, vis, e) {
        var dx = e.retning.x, dy = e.retning.y;
        var l = Math.hypot(dx, dy);
        var nx = l > 0.5 ? -dy / l : 0, ny = l > 0.5 ? dx / l : -1;
        if (ny > 0) { nx = -nx; ny = -ny; }   /* normalen vender op mod lyset */
        var enhed = vis.skala * (e.fra.f + e.til.f) / 2;
        var r = PIND_R, afstande = [0];
        if (e.orden === 2) { r = 0.06; afstande = [-0.1, 0.1]; }
        else if (e.orden === 3) { r = 0.05; afstande = [-0.155, 0, 0.155]; }
        var w = 2 * r * enhed;

        ctx.save();
        ctx.globalAlpha = e.alfa;
        afstande.forEach(function (o) {
            var ox = nx * o * enhed, oy = ny * o * enhed;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#5b636e";
            ctx.lineWidth = w;
            linje(ctx, e.fra.x + ox, e.fra.y + oy, e.til.x + ox, e.til.y + oy);
            ctx.lineCap = "butt";
            ctx.strokeStyle = "rgba(226, 231, 238, 0.5)";
            ctx.lineWidth = w * 0.32;
            var hx = nx * w * 0.2, hy = ny * w * 0.2;
            linje(ctx, e.fra.x + ox + hx, e.fra.y + oy + hy, e.til.x + ox + hx, e.til.y + oy + hy);
        });
        ctx.restore();
    }

    function tegnAtom(ctx, e, opt) {
        var p = e.p, a = p.a;
        var R = p.R;
        var billede = NK.Sprites.billede(a.sprite || ("atom_" + a.el));
        var g = NK.Data.GRUNDSTOFFER[a.el];
        ctx.save();
        if (a.alfa !== undefined) ctx.globalAlpha = a.alfa;
        if (billede) {
            var s = R * SPRITE_KUGLE;
            ctx.drawImage(billede, p.x - s, p.y - s, 2 * s, 2 * s);
        } else {
            var gr = ctx.createRadialGradient(p.x - R * 0.35, p.y - R * 0.4, R * 0.1, p.x, p.y, R);
            gr.addColorStop(0, "#ffffff");
            gr.addColorStop(0.35, g ? g.farve : "#8a919b");
            gr.addColorStop(1, "#111418");
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
            ctx.fill();
        }

        var ring = opt.markeret && opt.markeret[p.idx];
        if (ring || opt.hover === p.idx) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, R + 4, 0, Math.PI * 2);
            ctx.lineWidth = ring ? 3 : 2;
            ctx.strokeStyle = ring || "rgba(255, 255, 255, 0.45)";
            ctx.stroke();
        }

        if (a.symbol !== false && R > 8) {
            var fs = NK.klamp(R * 0.8, 11, 34);
            ctx.font = "700 " + Math.round(fs) + "px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            var moerkTekst = g && g.moerkTekst;
            if (!moerkTekst) {
                ctx.lineWidth = Math.max(2, fs * 0.16);
                ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
                ctx.lineJoin = "round";
                ctx.strokeText(a.el, p.x, p.y + 1);
            }
            ctx.fillStyle = moerkTekst ? "#2b2f36" : "#ffffff";
            ctx.fillText(a.el, p.x, p.y + 1);
        }
        ctx.restore();
    }

    /* Et frit elektronpar: spritet drejes ud i sin retning og forkortes,
       naar det peger mod beskueren. */
    function tegnLap(ctx, vis, e, navn, anker, sprB, sprH, breddeFaktor, minFaktor) {
        var dx = e.s1.x - e.s0.x, dy = e.s1.y - e.s0.y;
        var fuld = e.laengde * vis.skala * e.sm.f;
        var synlig = Math.hypot(dx, dy);
        var l = Math.max(synlig, fuld * minFaktor);
        var vinkel = synlig > 0.5 ? Math.atan2(dx, -dy) : 0;
        var hoejde = l * sprH / (anker.y - anker.top);
        var bredde = fuld * (sprB / (anker.y - anker.top)) * breddeFaktor;
        var billede = NK.Sprites.billede(navn);

        ctx.save();
        ctx.translate(e.s0.x, e.s0.y);
        ctx.rotate(vinkel);
        if (billede) {
            ctx.drawImage(billede, -bredde * anker.x / sprB, -hoejde * anker.y / sprH, bredde, hoejde);
        } else {
            ctx.fillStyle = "rgba(242, 197, 61, 0.35)";
            ctx.beginPath();
            ctx.ellipse(0, -l * 0.55, bredde * 0.45, l * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        return { synlig: synlig, fuld: fuld, dx: dx, dy: dy };
    }

    function tegnFri(ctx, vis, e) {
        ctx.save();
        if (e.fp.lille) ctx.globalAlpha = 0.72;
        var m = tegnLap(ctx, vis, e, "elektronpar", NK.ANKER.elektronpar, 64, 110, 1, 0.45);
        /* De to elektroner tegnes rundt, uanset hvor forkortet wolken er. */
        var ux = 1, uy = 0;
        if (m.synlig > 0.5) { ux = -m.dy / m.synlig; uy = m.dx / m.synlig; }
        var afst = m.fuld * 0.1;
        var rp = Math.max(2.2, m.fuld * 0.05);
        ctx.fillStyle = "#f2c53d";
        ctx.strokeStyle = "rgba(60, 40, 0, 0.55)";
        ctx.lineWidth = 1;
        [-1, 1].forEach(function (t) {
            ctx.beginPath();
            ctx.arc(e.sm.x + ux * afst * t, e.sm.y + uy * afst * t, rp, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();
        e.fp._skaerm = { x: e.sm.x, y: e.sm.y, r: Math.max(14, m.fuld * 0.35) };
    }

    /* Tegner modellen og returnerer atomernes plads paa skaermen, som
       bruges til at finde det atom, der bliver klikket paa.
       opt: kalotte, visFrie, markeret: { atomnr: farve }, hover: atomnr */
    T.tegn = function (ctx, vis, model, opt) {
        opt = opt || {};
        var liste = [];

        var proj = model.atomer.map(function (a, i) {
            var s = vis.projicer(a.p);
            var r = atomRadius(a, opt.kalotte);
            return { idx: i, x: s.x, y: s.y, z: s.z, f: s.f, r: r, R: r * vis.skala * s.f, a: a };
        });
        proj.forEach(function (p) { liste.push({ z: p.z, slags: "atom", p: p }); });

        if (!opt.kalotte) {
            (model.bindinger || []).forEach(function (b) {
                var A = model.atomer[b.a], B = model.atomer[b.b];
                var midt = V.gange(V.plus(A.p, B.p), 0.5);
                var sm = vis.projicer(midt);
                var retning = { x: proj[b.b].x - proj[b.a].x, y: proj[b.b].y - proj[b.a].y };
                var u = V.enhed(V.minus(B.p, A.p));
                var alfa = Math.min(A.alfa === undefined ? 1 : A.alfa, B.alfa === undefined ? 1 : B.alfa);
                /* Pinden begynder ved kuglens overflade, ikke i centrum, saa
                   den ikke daekker symbolet paa et atom laengere bagude. */
                [[A, 1], [B, -1]].forEach(function (par) {
                    var start = V.plus(par[0].p, V.gange(u, atomRadius(par[0], false) * 0.85 * par[1]));
                    var z = vis.projicer(V.gange(V.plus(start, midt), 0.5)).z;
                    liste.push({ z: z, slags: "pind", fra: vis.projicer(start), til: sm, orden: b.orden, retning: retning, alfa: alfa });
                });
            });
        }

        if (opt.visFrie !== false) {
            (model.frie || []).forEach(function (fp) {
                var A = model.atomer[fp.atom];
                var rA = atomRadius(A, opt.kalotte);
                var laengde = LAP * (fp.lille ? 0.72 : 1);
                var start = V.plus(A.p, V.gange(fp.u, rA * (opt.kalotte ? 0.7 : 0.35)));
                var sm = vis.projicer(V.plus(start, V.gange(fp.u, laengde * 0.58)));
                liste.push({
                    z: sm.z, slags: "fri", fp: fp, laengde: laengde, sm: sm,
                    s0: vis.projicer(start), s1: vis.projicer(V.plus(start, V.gange(fp.u, laengde)))
                });
            });
        }

        liste.sort(function (a, b) { return a.z - b.z; });
        liste.forEach(function (e) {
            if (e.slags === "atom") tegnAtom(ctx, e, opt);
            else if (e.slags === "pind") tegnPind(ctx, vis, e);
            else if (e.slags === "fri") tegnFri(ctx, vis, e);
        });
        return proj;
    };

    /* Det forreste atom under (x, y), eller -1. */
    T.atomVed = function (proj, x, y) {
        var bedst = -1, bedstZ = -Infinity;
        (proj || []).forEach(function (p) {
            if (Math.hypot(x - p.x, y - p.y) <= Math.max(p.R, 12) && p.z > bedstZ) {
                bedst = p.idx;
                bedstZ = p.z;
            }
        });
        return bedst;
    };

    /* Buen for vinklen A-C-B tegnet i den plan, vinklen ligger i.
       Returnerer vinklen i grader. */
    T.tegnVinkel = function (ctx, vis, pA, pC, pB) {
        var a = V.minus(pA, pC), b = V.minus(pB, pC);
        var e1 = V.enhed(a);
        var vinkel = V.vinkel(a, b);
        var w = V.minus(b, V.gange(e1, V.prik(b, e1)));
        var e2;
        if (V.laengde(w) < 1e-3 * V.laengde(b)) {
            /* 180°: buen lægges i den plan, der vender mod beskueren. */
            var op = vis.tilVerden([0, 1, 0]);
            e2 = V.minus(op, V.gange(e1, V.prik(op, e1)));
            e2 = V.laengde(e2) < 1e-3 ? V.vinkelret(e1) : V.enhed(e2);
        } else {
            e2 = V.enhed(w);
        }
        var rr = Math.min(V.laengde(a), V.laengde(b)) * 0.45;
        var rad = vinkel * Math.PI / 180;
        var c = vis.projicer(pC);
        var N = 40, pts = [];
        for (var i = 0; i <= N; i++) {
            var t = rad * i / N;
            pts.push(vis.projicer(V.plus(pC, V.plus(V.gange(e1, rr * Math.cos(t)), V.gange(e2, rr * Math.sin(t))))));
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        pts.forEach(function (p) { ctx.lineTo(p.x, p.y); });
        ctx.closePath();
        ctx.fillStyle = "rgba(242, 197, 61, 0.2)";
        ctx.fill();
        ctx.beginPath();
        pts.forEach(function (p, k) { if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
        ctx.strokeStyle = "#f2c53d";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();

        var tm = rad / 2;
        var retning = V.plus(V.gange(e1, Math.cos(tm)), V.gange(e2, Math.sin(tm)));
        var lp = vis.projicer(V.plus(pC, V.gange(retning, rr * 1.75)));
        NK.etiket(ctx, NK.grader(vinkel), lp.x, lp.y, { farve: "#f2c53d", kant: "rgba(242, 197, 61, 0.55)", font: "700 15px 'Segoe UI', sans-serif", hoejde: 24 });
        return vinkel;
    };

    /* En pil fra (x1, y1) til (x2, y2). kryds: en tvaerstreg ved halen,
       som i tegnet for et dipoltraek. */
    T.pil = function (ctx, x1, y1, x2, y2, opt) {
        opt = opt || {};
        var dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy);
        if (l < 3) return;
        var ux = dx / l, uy = dy / l;
        var bredde = opt.bredde || 3;
        var hoved = Math.min(opt.hoved || 11, l * 0.6);
        var bx = x2 - ux * hoved, by = y2 - uy * hoved;

        function sti(tykkelse, farve) {
            ctx.strokeStyle = farve;
            ctx.fillStyle = farve;
            ctx.lineWidth = tykkelse;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(bx, by);
            ctx.stroke();
            if (opt.kryds) {
                var kx = x1 + ux * hoved * 0.55, ky = y1 + uy * hoved * 0.55;
                ctx.beginPath();
                ctx.moveTo(kx - uy * hoved * 0.5, ky + ux * hoved * 0.5);
                ctx.lineTo(kx + uy * hoved * 0.5, ky - ux * hoved * 0.5);
                ctx.stroke();
            }
        }

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (opt.kant) sti(bredde + 4, opt.kant);
        sti(bredde, opt.farve || "#f2a93b");
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(bx - uy * hoved * 0.55, by + ux * hoved * 0.55);
        ctx.lineTo(bx + uy * hoved * 0.55, by - ux * hoved * 0.55);
        ctx.closePath();
        if (opt.kant) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = opt.kant;
            ctx.stroke();
        }
        ctx.fillStyle = opt.farve || "#f2a93b";
        ctx.fill();
        ctx.restore();
    };
}());
