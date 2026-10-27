/* =====================================================================
   lup.js - luppen paa fane 1: pladens overflade paa mikroniveau

   Tegnet som bogens figur i B8.6 (Polære stoffer hænger fast paa den
   polære plade), men drejet, saa løbevæsken loeber opad som paa pladen:
   pladens overflade er et baand til venstre med OH-grupper, og
   løbevæsken stroemmer op ved siden af den.

   Hvert farvestofmolekyle springer mellem to tilstande. Fast: det sidder
   paa en OH-gruppe (lutein med en hydrogenbinding fra sin OH-gruppe,
   caroten kun med svage London-kraefter) og flytter sig ikke. Fri: det
   foelger med væsken op. Andelen af tiden, det er frit, er Rf-vaerdien
   fra js/model.js, saa luppen og pladen viser det samme.

   Propanon i løbevæsken saetter sig selv paa OH-grupperne (O-atomet
   tager imod en hydrogenbinding), og saa er der faerre steder til
   lutein. Heptan saetter sig aldrig. Klorofyl er ikke med i luppen.

   Molekylerne er kugle-og-pind-modeller af tunge atomer plus H paa O.
   Caroten og lutein har en ring i hver ende, en kaede med fire
   methylgrupper og (lutein) en OH-gruppe i hver ende.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var ATOM = {
        C: { r: 0.42, lys: "#7b828c", mork: "#2b2f36" },
        O: { r: 0.46, lys: "#ff8a7d", mork: "#b3261c" },
        H: { r: 0.28, lys: "#ffffff", mork: "#a9b0b8" }
    };

    /* ----- Molekylernes atomer (enhed: bindingslaengden) ------------------------ */
    function ring(cx, cy) {
        var a = [];
        for (var k = 0; k < 6; k++) {
            var v = Math.PI / 6 + k * Math.PI / 3;
            a.push({ x: cx + Math.cos(v), y: cy + Math.sin(v) });
        }
        return a;
    }

    /* Caroten eller lutein: ring - kaede - ring. Giver atomer og bindinger. */
    function carotenoid(oh) {
        var at = [], bd = [];
        function ny(x, y, e) { at.push({ x: x, y: y, e: e }); return at.length - 1; }
        /* Venstre ring med centrum (0, 0); hoejre hjoerne i (0,866; ±0,5) */
        var rv = ring(0, 0).map(function (p) { return ny(p.x, p.y, "C"); });
        for (var i = 0; i < 6; i++) bd.push([rv[i], rv[(i + 1) % 6]]);
        var forrige = rv[0];                       /* hjoernet ved (0,866; 0,5) */
        var x = at[forrige].x, y = at[forrige].y;
        var kaede = 10;
        for (var j = 0; j < kaede; j++) {
            x += 0.866;
            y += (j % 2 === 0) ? -0.5 : 0.5;
            var c = ny(x, y, "C");
            bd.push([forrige, c]);
            /* Methylgrupperne peger vaek fra kaeden, der hvor den knaekker */
            if (j === 1 || j === 4 || j === 5 || j === 8) {
                var m = ny(x, y + ((j % 2 === 0) ? -1 : 1), "C");
                bd.push([c, m]);
            }
            forrige = c;
        }
        /* Hoejre ring: dens hjoerne ved 150 grader er naeste trin i kaeden */
        var vx = x + 0.866, vy = y + ((kaede % 2 === 0) ? -0.5 : 0.5);
        var rh = ring(vx + 0.866, vy - 0.5).map(function (p) { return ny(p.x, p.y, "C"); });
        for (var k = 0; k < 6; k++) bd.push([rh[k], rh[(k + 1) % 6]]);
        bd.push([forrige, rh[2]]);
        /* Ringenes yderste hjoerner (laengst til venstre og hoejre) */
        var venstre = rv[3], hoejre = rh[0];
        at.forEach(function (p, idx) {
            if (rv.indexOf(idx) >= 0 && p.x < at[venstre].x - 0.01) venstre = idx;
            if (rh.indexOf(idx) >= 0 && p.x > at[hoejre].x + 0.01) hoejre = idx;
        });
        var anker = venstre;
        if (oh) {
            var o1 = ny(at[venstre].x - 1, at[venstre].y, "O");
            bd.push([venstre, o1]);
            var h1 = ny(at[o1].x - 0.55, at[o1].y - 0.55, "H");
            bd.push([o1, h1]);
            var o2 = ny(at[hoejre].x + 1, at[hoejre].y, "O");
            bd.push([hoejre, o2]);
            var h2 = ny(at[o2].x + 0.55, at[o2].y + 0.55, "H");
            bd.push([o2, h2]);
            anker = o1;
        }
        return centrer({ at: at, bd: bd, anker: anker });
    }

    function heptan() {
        var at = [], bd = [];
        for (var i = 0; i < 7; i++) {
            at.push({ x: i * 0.866, y: (i % 2) * 0.5, e: "C" });
            if (i) bd.push([i - 1, i]);
        }
        return centrer({ at: at, bd: bd, anker: 0 });
    }

    function propanon() {
        var at = [{ x: 0, y: 0, e: "C" }, { x: -0.866, y: 0.5, e: "C" }, { x: 0.866, y: 0.5, e: "C" }, { x: 0, y: -1.05, e: "O" }];
        /* Drejet, saa O peger mod venstre (mod pladen, naar molekylet sidder fast) */
        at.forEach(function (p) { var x = p.x; p.x = p.y; p.y = -x; });
        return centrer({ at: at, bd: [[0, 1], [0, 2], [0, 3]], anker: 3, dobbelt: [[0, 3]] });
    }

    /* Molekylet med centrum i (0, 0); laengden og ankerets plads huskes */
    function centrer(m) {
        var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        m.at.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); });
        var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        m.at.forEach(function (p) { p.x -= cx; p.y -= cy; });
        m.laengde = x1 - x0;
        m.hoejde = y1 - y0;
        return m;
    }

    var FORM = { caroten: carotenoid(false), lutein: carotenoid(true), heptan: heptan(), propanon: propanon() };
    var GLOED = { caroten: "#f0a040", lutein: "#f0d23a" };

    /* ===================================================================== */
    function Lup() {
        this.mol = [];
        this.pladser = [];
        this.loeb = null;
        this.t = 0;
        this.W = 0;
        this.H = 0;
        this.fart = 1;
        this.stoerrelse(300, 300);
    }

    /* Luppens stoerrelse i px og pladserne paa overfladen */
    Lup.prototype.stoerrelse = function (W, H) {
        if (W === this.W && H === this.H && this.pladser.length) return;
        var gl = { W: this.W || W, H: this.H || H };
        this.W = W;
        this.H = H;
        this.b = NK.klamp(W / 34, 6.2, 8.6);                       /* bindingslaengden i px */
        this.vaeg = Math.round(W * 0.14);
        var n = Math.max(5, Math.round(H / 46));
        var gamle = this.pladser;
        this.pladser = [];
        for (var i = 0; i < n; i++) this.pladser.push({ y: H * (i + 0.5) / n, mol: null });
        gamle.forEach(function (p) { if (p.mol) { p.mol.tilst = "fri"; p.mol.plads = null; } });
        var mig = this;
        this.mol.forEach(function (m) {
            m.x = m.x * W / gl.W;
            m.y = m.y * H / gl.H;
            if (m.tilst !== "fri") { m.tilst = "fri"; m.plads = null; }
            m.x = NK.klamp(m.x, mig.fri0(m), mig.fri1(m));
        });
    };

    /* Den vandrette plads, et frit molekyle kan vaere i */
    Lup.prototype.fri0 = function (m) { return this.vaeg + 14 + FORM[m.slags].laengde * this.b * 0.5; };
    Lup.prototype.fri1 = function (m) { return this.W - 10 - FORM[m.slags].laengde * this.b * 0.5; };

    /* Ny løbevæske eller nye stoffer: molekylerne laegges ud forfra */
    Lup.prototype.saet = function (loeb, stoffer) {
        this.loeb = loeb;
        var mig = this;
        this.mol = [];
        this.pladser.forEach(function (p) { p.mol = null; });
        var n = 0;
        Object.keys(stoffer).forEach(function (id) {
            for (var i = 0; i < stoffer[id]; i++) mig.mol.push(mig.nyt(id, n++));
        });
        /* Løbevæsken: 12 molekyler, delt efter molbroeken af propanon */
        var antalP = Math.round(12 * (loeb.propanon || 0));
        for (var j = 0; j < 12; j++) mig.mol.push(mig.nyt(j < antalP ? "propanon" : "heptan", n++));
        /* Kom hurtigt i ligevaegt, saa luppen ikke begynder tom */
        for (var k = 0; k < 360; k++) this.opdater(1 / 30, true);
    };

    Lup.prototype.nyt = function (slags, n) {
        var m = { slags: slags, x: 0, y: NK.r(0, this.H), v: NK.r(-0.25, 0.25), tilst: "fri", plads: null,
            fase: NK.r(0, 6.28), tempo: NK.r(0.85, 1.15), stof: D.STOF[slags] || null, n: n };
        m.x = NK.r(this.fri0(m), this.fri1(m));
        return m;
    };

    /* Hvor ofte et molekyle slipper og saetter sig (pr. sekund). ROLIG gør
       begge rater langsommere, saa bindingerne ikke blinker; forholdet og
       dermed andelen af tiden fast er det samme. */
    var ROLIG = 0.4;
    Lup.prototype.rater = function (m) {
        if (m.slags === "heptan") return { paa: 0, af: 0 };
        if (m.slags === "propanon") return { paa: 4.0 * ROLIG, af: 0.8 * ROLIG };
        var rf = NK.Model.rf(m.stof, this.loeb);
        var af = 0.55;
        var paa = NK.klamp(af * (1 - rf) / Math.max(rf, 0.004), 0, 40);
        return { paa: paa * ROLIG, af: af * ROLIG };
    };

    /* En ledig plads naer molekylet (lutein og caroten maa skubbe propanon vaek) */
    Lup.prototype.findPlads = function (m) {
        var bedst = null, afst = this.H * 0.4;
        var farvestof = m.slags !== "propanon";
        this.pladser.forEach(function (p) {
            if (p.mol && (!farvestof || p.mol.slags !== "propanon")) return;
            var d = Math.abs(p.y - m.y) + (p.mol ? 20 : 0);
            if (d < afst) { afst = d; bedst = p; }
        });
        return bedst;
    };

    Lup.prototype.slip = function (m, skub) {
        if (m.plads) m.plads.mol = null;
        m.plads = null;
        m.tilst = "fri";
        m.vx = skub ? 60 : 30;
    };

    /* Hvor molekylet sidder, naar det er fast paa pladsen p */
    Lup.prototype.fastPos = function (m, p) {
        var F = FORM[m.slags], b = this.b;
        var a = F.at[F.anker];
        var ax = this.vaeg + (m.slags === "caroten" ? 12 : 22);
        return { x: ax - a.x * b, y: p.y - a.y * b };
    };

    Lup.prototype.opdater = function (dt, stille) {
        this.t += dt;
        var mig = this, u = 34 * this.fart;              /* væskens fart i px/s */
        this.mol.forEach(function (m) {
            var r = mig.rater(m);
            if (m.tilst === "fri") {
                m.y -= u * m.tempo * dt;
                m.vx = (m.vx || 0) * Math.exp(-2.5 * dt);
                m.x += (m.vx + Math.sin(mig.t * 0.6 + m.fase) * 4) * dt;
                m.x = NK.klamp(m.x, mig.fri0(m), mig.fri1(m));
                m.v += (Math.sin(mig.t * 0.7 + m.fase) * 0.2 - m.v) * dt;
                if (m.y < -26) { m.y = mig.H + 26; m.x = NK.r(mig.fri0(m), mig.fri1(m)); }
                if (r.paa > 0 && Math.random() < 1 - Math.exp(-r.paa * dt)) {
                    var p = mig.findPlads(m);
                    if (p) {
                        if (p.mol) mig.slip(p.mol, true);
                        p.mol = m;
                        m.plads = p;
                        m.tilst = "kommer";
                    }
                }
            } else if (m.tilst === "kommer") {
                var maal = mig.fastPos(m, m.plads);
                var dx = maal.x - m.x, dy = maal.y - m.y, d = Math.hypot(dx, dy);
                var fart = stille ? 1e4 : 140;
                if (d < fart * dt) { m.x = maal.x; m.y = maal.y; m.tilst = "fast"; }
                else { m.x += dx / d * fart * dt; m.y += dy / d * fart * dt; }
                m.v += (0 - m.v) * Math.min(1, 6 * dt);
            } else {
                var fp = mig.fastPos(m, m.plads);
                m.x = fp.x;                             /* fast: staar stille */
                m.y = fp.y;
                m.v = 0;
                if (Math.random() < 1 - Math.exp(-r.af * dt)) mig.slip(m, false);
            }
        });
    };

    /* Andelen af et stofs molekyler, der sidder fast lige nu (selvtesten) */
    Lup.prototype.andelFast = function (slags) {
        var alle = this.mol.filter(function (m) { return m.slags === slags; });
        if (!alle.length) return 0;
        return alle.filter(function (m) { return m.tilst === "fast"; }).length / alle.length;
    };

    /* ----- Tegningen ------------------------------------------------------------ */
    function kugle(ctx, x, y, r, e) {
        var A = ATOM[e];
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, A.lys);
        g.addColorStop(1, A.mork);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    Lup.prototype.tegnMolekyle = function (ctx, m, alfa) {
        var F = FORM[m.slags], b = this.b, c = Math.cos(m.v), s = Math.sin(m.v);
        var P = F.at.map(function (a) { return { x: m.x + (a.x * c - a.y * s) * b, y: m.y + (a.x * s + a.y * c) * b, e: a.e }; });
        ctx.save();
        ctx.globalAlpha = alfa;
        /* Farvestoffets farve som et skaer om molekylet */
        if (GLOED[m.slags]) {
            ctx.strokeStyle = NK.Tegn.rgba(GLOED[m.slags], 0.42);
            ctx.lineWidth = b * 1.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            F.bd.forEach(function (bd) { ctx.moveTo(P[bd[0]].x, P[bd[0]].y); ctx.lineTo(P[bd[1]].x, P[bd[1]].y); });
            ctx.stroke();
        }
        ctx.strokeStyle = "#5d636c";
        ctx.lineWidth = Math.max(1.4, b * 0.22);
        ctx.lineCap = "round";
        ctx.beginPath();
        F.bd.forEach(function (bd) { ctx.moveTo(P[bd[0]].x, P[bd[0]].y); ctx.lineTo(P[bd[1]].x, P[bd[1]].y); });
        ctx.stroke();
        P.forEach(function (p) { kugle(ctx, p.x, p.y, ATOM[p.e].r * b, p.e); });
        ctx.restore();
        return P;
    };

    /* opt: titel (tekst over luppen) */
    Lup.prototype.tegn = function (ctx, x, y, opt) {
        opt = opt || {};
        var W = this.W, H = this.H, b = this.b, mig = this;
        ctx.save();
        /* Rammen */
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#0e1015";
        NK.rundtRekt(ctx, x - 7, y - 7, W + 14, H + 14, 18);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.save();
        NK.rundtRekt(ctx, x, y, W, H, 13);
        ctx.clip();
        var g = ctx.createLinearGradient(x, y, x + W, y + H);
        g.addColorStop(0, "#eef5fb");
        g.addColorStop(1, "#d9e7f2");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, W, H);
        ctx.translate(x, y);
        /* Stroemmen i væsken: svage pile opad, der staar stille */
        ctx.strokeStyle = "rgba(61, 120, 170, 0.18)";
        ctx.lineWidth = 2;
        for (var k = 0; k < 3; k++) {
            var px = this.vaeg + (W - this.vaeg) * (0.3 + 0.3 * k);
            for (var yy = H + 35; yy > -30; yy -= 70) {
                ctx.beginPath();
                ctx.moveTo(px, yy);
                ctx.lineTo(px, yy - 26);
                ctx.moveTo(px - 5, yy - 20);
                ctx.lineTo(px, yy - 27);
                ctx.lineTo(px + 5, yy - 20);
                ctx.stroke();
            }
        }
        /* Pladens overflade */
        var gv = ctx.createLinearGradient(0, 0, this.vaeg, 0);
        gv.addColorStop(0, "#d8ccb2");
        gv.addColorStop(1, "#ece2cc");
        ctx.fillStyle = gv;
        ctx.fillRect(0, 0, this.vaeg, H);
        ctx.fillStyle = "rgba(150, 130, 100, 0.35)";
        for (var d = 0; d < 26; d++) {
            ctx.beginPath();
            ctx.arc((d * 37 % 97) / 97 * (this.vaeg - 8) + 3, (d * 53 % 101) / 101 * H, 1.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.save();
        ctx.translate(this.vaeg * 0.42, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = "#5b4e36";
        ctx.font = "700 " + Math.round(NK.klamp(W * 0.042, 11, 14)) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("pladens overflade", 0, 0);
        ctx.restore();
        /* OH-grupperne paa overfladen */
        this.pladser.forEach(function (p) {
            kugle(ctx, mig.vaeg + 1, p.y, ATOM.O.r * b * 1.05, "O");
            ctx.strokeStyle = "#5d636c";
            ctx.lineWidth = Math.max(1.4, b * 0.22);
            ctx.beginPath();
            ctx.moveTo(mig.vaeg + 1, p.y);
            ctx.lineTo(mig.vaeg + 1 + b * 0.95, p.y);
            ctx.stroke();
            kugle(ctx, mig.vaeg + 1 + b * 0.95, p.y, ATOM.H.r * b * 1.05, "H");
        });
        /* Molekylerne: løbevæsken bagest, saa de frie og til sidst de faste */
        var orden = this.mol.slice().sort(function (a, c) {
            var va = (a.slags === "heptan" || a.slags === "propanon") ? 0 : 1;
            var vc = (c.slags === "heptan" || c.slags === "propanon") ? 0 : 1;
            if (va !== vc) return va - vc;
            return (a.tilst === "fast" ? 1 : 0) - (c.tilst === "fast" ? 1 : 0);
        });
        orden.forEach(function (m) {
            var loebende = m.slags === "heptan" || m.slags === "propanon";
            var P = mig.tegnMolekyle(ctx, m, loebende && m.tilst !== "fast" ? 0.55 : 1);
            if (m.tilst !== "fast") return;
            var F = FORM[m.slags], a = P[F.anker];
            var hx = mig.vaeg + 1 + b * 0.95 + ATOM.H.r * b, hy = m.plads.y;
            if (m.slags === "caroten") {
                /* Svage London-kraefter: graa prikker */
                ctx.strokeStyle = "rgba(110, 118, 130, 0.85)";
                ctx.lineWidth = 2.2;
                ctx.lineCap = "round";
                ctx.setLineDash([0.5, 4.5]);
                ctx.beginPath();
                ctx.moveTo(mig.vaeg + 3, a.y - b * 0.6);
                ctx.lineTo(a.x - ATOM.C.r * b, a.y - b * 0.4);
                ctx.moveTo(mig.vaeg + 3, a.y + b * 0.6);
                ctx.lineTo(a.x - ATOM.C.r * b, a.y + b * 0.4);
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                /* Hydrogenbinding: roed stiplet streg fra pladens H til molekylets O */
                ctx.strokeStyle = "#e05446";
                ctx.lineWidth = 2.4;
                ctx.setLineDash([3.5, 3]);
                ctx.beginPath();
                ctx.moveTo(hx + 1, hy);
                ctx.lineTo(a.x - ATOM.O.r * b - 1, a.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });
        ctx.restore();
        /* Rammens kant */
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 1.5;
        NK.rundtRekt(ctx, x, y, W, H, 13);
        ctx.stroke();
        /* Navnet paa løbevæsken og pilen */
        ctx.font = "700 " + Math.round(NK.klamp(W * 0.042, 11, 14)) + "px 'Segoe UI', sans-serif";
        var tb = ctx.measureText("løbevæsken ↑").width;
        ctx.fillStyle = "rgba(238, 245, 251, 0.92)";
        NK.rundtRekt(ctx, x + W - 16 - tb, y + 6, tb + 10, 20, 6);
        ctx.fill();
        ctx.fillStyle = "rgba(28, 74, 112, 0.95)";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText("løbevæsken ↑", x + W - 11, y + 9);
        ctx.restore();
    };

    NK.Lup = Lup;
    NK.Lup.FORM = FORM;
}());
