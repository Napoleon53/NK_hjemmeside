/* =====================================================================
   sim_blod.js - fane 2: Oxygen i blodet

   Lungerne til venstre og en muskel til hoejre, forbundet af to
   blodaarer: over luppen loeber blodet fra lungerne til musklen, under
   den tilbage. Luppen viser en lille portion blod: 12 Hb (ét
   bindingssted hver, som i Kemibogen) og de frie O2 i blodet.
   Ligevaegten er Hb + O2 <=> HbO2 (NK.Model.blod).

   Luften i lungerne og forbruget i musklen holder antallet af frie O2
   fast (10 i lungerne, 3 i lungerne i bjergene, 2 i en muskel i hvile og
   1 i en muskel, der arbejder). Naar blodet kommer et nyt sted hen,
   springer [O2], og Y springer vaek fra K. Saa binder eller afgiver Hb
   oxygen, til Y = K igen. I lungerne kommer der nyt O2 ind fra
   venstre; i musklen forsvinder det frie O2 ud til hoejre.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var BL = NK.Model.blod;
    var Tg = NK.Tegn;

    var REJSE = 1.6;          /* sekunder fra lungerne til musklen eller tilbage */
    var HASTIGHED = 1.7;
    var PAUSE = 0.7;
    var NAVN = { lunge: "lungerne", muskel: "musklen" };

    function SimBlod() {
        this.hb = [];
        this.fri = [];
        this.startFane(D.B_MAAL);
    }

    var P = SimBlod.prototype;
    NK.Fane.paa(P, { navn: "b", naesteFane: "fane-r", naesteNavn: "Regn på Y" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) { this.opstil(o); };

    P.opstil = function (o) {
        o = o || this.opg.o;
        this.sted = o.opstil.sted;
        this.bjerg = !!o.opstil.bjerg;
        this.loeb = false;
        this.N = BL.N;
        this.paaVej = null;
        this.koerer = false;
        this.ventT = 0;
        this.o = this.o2Her();
        this.b = BL.ligevaegt(this.N, this.o);
        this.foerY = null;
        this.handling = "";
        this.lavPartikler();
    };

    P.nulstilScene = function () { this.opstil(); };

    P.o2Her = function () {
        if (this.sted === "lunge") return this.bjerg ? BL.O2.bjerg : BL.O2.lunge;
        return this.loeb ? BL.O2.loeb : BL.O2.muskel;
    };

    /* 16 pladser i luppen (4 x 4). De foerste 12 Hb tager hver tredje
       plads fra; de 4 nye (Mere Hb) faar de sidste. */
    var PLADSER = [];
    (function () {
        var raekke, kol, ekstra = [];
        for (raekke = 0; raekke < 4; raekke++) {
            for (kol = 0; kol < 4; kol++) {
                var p = { x: 0.14 + kol * 0.24 + (raekke % 2 ? 0.05 : -0.03), y: 0.22 + raekke * 0.2 };
                if ((raekke + kol * 3) % 4 === 1) ekstra.push(p); else PLADSER.push(p);
            }
        }
        PLADSER = PLADSER.concat(ekstra);
    }());

    P.lavPartikler = function () {
        var bundet = Math.round(this.b);
        this.hb = [];
        for (var i = 0; i < this.N; i++) {
            this.hb.push({ x: PLADSER[i].x, y: PLADSER[i].y, bundet: i < bundet, fase: Math.random() * 6.3, ind: 0, venter: false });
        }
        /* Bland, hvilke der har O2 paa */
        var b = this.hb.map(function (h) { return h.bundet; });
        b = NK.bland(b);
        this.hb.forEach(function (h, j) { h.bundet = b[j]; });
        this.fri = [];
        for (var k = 0; k < Math.round(this.o); k++) this.nytFri();
        this.bVis = bundet;
    };

    P.nytFri = function (x, y, ind) {
        var m = { x: x !== undefined ? x : NK.r(0.06, 0.94), y: y !== undefined ? y : NK.r(0.14, 0.92),
            vx: NK.r(-0.08, 0.08), vy: NK.r(-0.08, 0.08), v: NK.r(0, 6.3), w: NK.r(-1, 1), ud: 0, flyv: null };
        if (ind) { m.x = -0.04; m.vx = NK.r(0.12, 0.2); m.ind = 0.8; }
        this.fri.push(m);
        return m;
    };

    P.friAntal = function () {
        return this.fri.filter(function (m) { return !m.ud && !m.flyv; }).length;
    };

    /* ----- Handlingerne ---------------------------------------------------------------- */
    P.rejs = function (til) {
        if (this.sted === til || this.paaVej) return;
        this.paaVej = { fra: this.sted, til: til, t: 0 };
        this.handling = til;
        this.nulstilHjaelp();
    };

    P.ankomst = function () {
        this.sted = this.paaVej.til;
        this.paaVej = null;
        this.skiftO2();
    };

    /* [O2] springer: Y kommer vaek fra K, og reaktionen begynder efter en pause */
    P.skiftO2 = function () {
        this.foerY = this.yNu();
        this.o = this.o2Her();
        this.koerer = true;
        this.ventT = -0.6;
    };

    P.loebNu = function () {
        this.loeb = true;
        this.handling = "loeb";
        if (this.sted === "muskel") this.skiftO2();
        this.nulstilHjaelp();
    };

    P.mereHb = function () {
        if (this.N >= BL.NFLERE) return;
        this.foerY = this.yNu();
        for (var i = this.N; i < BL.NFLERE; i++) {
            this.hb.push({ x: PLADSER[i].x, y: PLADSER[i].y, bundet: false, fase: Math.random() * 6.3, ind: 1, venter: false });
        }
        this.N = BL.NFLERE;
        this.handling = "flere";
        this.koerer = true;
        this.ventT = -0.8;
        this.nulstilHjaelp();
    };

    P.forsoegSvar = function (o) {
        var h = o.forsoeg.handling;
        if (h === "lunge" || h === "muskel") this.rejs(h);
        else if (h === "loeb") this.loebNu();
        else if (h === "flere") this.mereHb();
    };

    P.klaret = function () {
        var g = this.opg;
        if (this.faerdig || this.venter || g.fase !== "forsoeg") return;
        if (this.handling !== g.o.forsoeg.handling) return;
        this.forsoegKlaret(g.o.forsoeg.set || "");
    };

    P.yNu = function () { return BL.Y(this.N, this.b, this.o); };

    /* Det, eleven maa goere lige nu (laasen) */
    P.tilladt = function () {
        if (!this.iForsoeg() || this.paaVej || this.koerer) return "";
        return this.opg.o.forsoeg.handling;
    };

    /* ----- Panelet ---------------------------------------------------------------------- */
    P.visPanel = function () {
        var bv = this.bVis, n = this.N;
        var hvor = this.paaVej ? "på vej til " + NAVN[this.paaVej.til] :
            "i " + NAVN[this.sted] + (this.sted === "lunge" && this.bjerg ? " i bjergene" : "") +
            (this.sted === "muskel" && this.loeb ? ", der arbejder" : "");
        var html = '<p class="blod-hvor">Blodet er ' + hvor + ".</p>" +
            '<div class="talraekke"><span>Hb i alt</span><span class="tal">' + n + "</span></div>" +
            '<div class="talraekke"><span>Med O₂, HbO₂</span><span class="tal roed">' + bv + "</span></div>" +
            '<div class="talraekke"><span>Uden O₂, Hb</span><span class="tal">' + (n - bv) + "</span></div>" +
            '<div class="talraekke"><span>Frie O₂</span><span class="tal">' + this.friAntal() + "</span></div>";
        if (this.bjerg) html += '<div class="talraekke skil"><span>Ved havet i lungerne</span><span class="tal mat">11 af 12 HbO₂</span></div>';
        NK.saetHTML("b-luppen", html);
    };

    /* ----- Scenen ------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, Hs = this.baand().y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.y0 = 10 + this.kortZone() + 8;
        lay.sigY = lay.y0 + 14;
        var top = lay.y0 + 40;
        var rh = NK.klamp(Hs - top - 161, 150, 300);
        var s = NK.klamp(W * 0.15, 110, 170);
        lay.lunge = { cx: 26 + s * 0.55, cy: top + rh * 0.5, s: s };
        lay.muskel = { cx: W - 26 - s * 0.62, cy: top + rh * 0.5, s: s };
        var venstre = lay.lunge.cx + s * 0.5 + 56, hoejre = lay.muskel.cx - s * 0.62 - 56;
        var lb = Math.min(hoejre - venstre, 470);
        lay.lup = { x: (venstre + hoejre) / 2 - lb / 2, y: top + 22, b: lb, h: rh - 44 };
        lay.k = NK.klamp(lay.lup.h / 210, 0.72, 1.15);
        /* Blodaarerne: over luppen fra lungerne til musklen, under den tilbage */
        var pl = { x: lay.lunge.cx + s * 0.42, y: lay.lunge.cy }, pm = { x: lay.muskel.cx - s * 0.5, y: lay.muskel.cy };
        lay.pl = pl; lay.pm = pm;
        lay.aaOp = lavVej(pl, pm, lay.lup.y - 20);
        lay.aaNed = lavVej(pm, pl, lay.lup.y + lay.lup.h + 20);
        lay.formelY = top + rh + 34;
        lay.tlY = lay.formelY + 76;
        lay.tlW = Math.min(W - 70, 700);
        lay.tlX = (W - lay.tlW) / 2;
        lay.loebKnap = { x: lay.muskel.cx - 46, y: lay.muskel.cy + s * 0.42 + 8, b: 92, h: 34 };
        lay.flereKnap = { x: lay.lunge.cx - 57, y: lay.lunge.cy + s * 0.68 + 12, b: 114, h: 34 };
        this.lay = lay;
        this.saetAnker("lunge", lay.lunge.cx - s * 0.55, lay.lunge.cy - s * 0.62, s * 1.1, s * 1.24);
        this.saetAnker("muskel", lay.muskel.cx - s * 0.65, lay.muskel.cy - s * 0.5, s * 1.3, s * 1.0 + 44);
        this.saetAnker("lup", lay.lup.x - 6, lay.sigY - 18, lay.lup.b + 12, lay.lup.y + lay.lup.h - lay.sigY + 24);
        this.saetAnker("tallinje", lay.tlX - 10, lay.formelY - 30, lay.tlW + 20, lay.tlY + 50 - lay.formelY + 30);
        this.visPanel();
    };

    /* En blodaare fra a til b, der gaar uden om luppen i hoejden yMidt: ud
       fra organet, en blod kurve op (eller ned), lige over (eller under)
       luppen, og en kurve ind i det andet organ. Punkterne ligger tæt, saa
       draaben kan foelge aaren efter laengden. */
    function lavVej(a, b, yMidt) {
        var d = b.x > a.x ? 1 : -1, p = [];
        function kubisk(p0, p1, p2, p3) {
            for (var i = 0; i <= 24; i++) {
                var t = i / 24, u = 1 - t;
                p.push({ x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
                         y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y });
            }
        }
        kubisk(a, { x: a.x + d * 40, y: a.y }, { x: a.x + d * 40, y: yMidt }, { x: a.x + d * 80, y: yMidt });
        kubisk({ x: b.x - d * 80, y: yMidt }, { x: b.x - d * 40, y: yMidt }, { x: b.x - d * 40, y: b.y }, b);
        var l = [0];
        for (var i = 1; i < p.length; i++) l.push(l[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y));
        return { p: p, l: l, L: l[l.length - 1] };
    }

    /* Punktet en broekdel t af vejen fra start (efter laengden) */
    function paaVejen(v, t) {
        var m = NK.klamp(t, 0, 1) * v.L, i = 1;
        while (i < v.l.length - 1 && v.l[i] < m) i++;
        var a = v.p[i - 1], b = v.p[i], f = (m - v.l[i - 1]) / Math.max(1e-9, v.l[i] - v.l[i - 1]);
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }

    P.draabe = function () {
        var lay = this.lay;
        if (!this.paaVej) return this.sted === "lunge" ? lay.pl : lay.pm;
        var t = NK.blod(this.paaVej.t / REJSE);
        return paaVejen(this.paaVej.til === "muskel" ? lay.aaOp : lay.aaNed, t);
    };

    P.hbPunkt = function (h) {
        var L = this.lay.lup, w = Math.sin(this.tid * 1.3 + h.fase) * 0.006;
        return { x: L.x + (h.x + w) * L.b, y: L.y + (h.y + w * 1.4) * L.h };
    };

    P.opdaterScene = function (dt) {
        var lay = this.lay, mig = this;
        if (!lay) return;
        /* Blodet paa vej */
        if (this.paaVej) {
            this.paaVej.t += dt;
            if (this.paaVej.t >= REJSE) this.ankomst();
        }
        /* Reaktionen */
        if (this.koerer) {
            if (this.ventT < 0) this.ventT += dt;
            else {
                var maal = BL.ligevaegt(this.N, this.o);
                this.b += (maal - this.b) * (1 - Math.exp(-HASTIGHED * dt));
                if (Math.abs(maal - this.b) < 0.02) this.b = maal;
                if (this.b === maal && this.bVis === Math.round(maal) && !this.travlt()) {
                    this.ventT += dt;
                    if (this.ventT >= PAUSE) { this.koerer = false; this.klaret(); }
                }
            }
        }
        /* Partiklerne foelger: binding og afgivelse én ad gangen */
        this.skiftT = (this.skiftT || 0) - dt;
        var bMaal = Math.round(this.b);
        if (this.skiftT <= 0 && !this.paaVej) {
            if (bMaal > this.bVis && this.bind()) { this.bVis++; this.skiftT = 0.28; }
            else if (bMaal < this.bVis && this.afgiv()) { this.bVis--; this.skiftT = 0.28; }
        }
        /* De nye Hb toner frem */
        this.hb.forEach(function (h) { if (h.ind > 0) h.ind = Math.max(0, h.ind - dt / 0.8); });
        /* De frie O2 */
        var L = lay.lup;
        this.fri.forEach(function (m) {
            m.v += m.w * dt;
            if (m.flyv) {
                m.flyv.t += dt / 0.5;
                var t = NK.blod(Math.min(1, m.flyv.t)), p = mig.hbPunkt(m.flyv.h);
                var mx = (p.x - L.x) / L.b + 0.04, my = (p.y - L.y) / L.h - 0.06;
                m.x = NK.lerp(m.flyv.x0, mx, t);
                m.y = NK.lerp(m.flyv.y0, my, t);
                if (m.flyv.t >= 1) { m.flyv.h.bundet = true; m.flyv.h.venter = false; m.vaek = true; }
                return;
            }
            if (m.ud) {
                m.x += 0.35 * dt;
                if (m.x > 1.06) m.vaek = true;
                return;
            }
            if (m.ind > 0) m.ind = Math.max(0, m.ind - dt);
            m.vx += NK.r(-0.25, 0.25) * dt;
            m.vy += NK.r(-0.25, 0.25) * dt;
            var f = Math.sqrt(m.vx * m.vx + m.vy * m.vy), maxf = m.ind > 0 ? 0.25 : 0.1;
            if (f > maxf) { m.vx *= maxf / f; m.vy *= maxf / f; }
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            /* Et frit O2 holder afstand til Hb, saa det ikke ligner et, der sidder paa */
            var minD = 13 * lay.k + 12;
            mig.hb.forEach(function (h) {
                var dx = (m.x - h.x) * L.b, dy = (m.y - h.y) * L.h, d = Math.sqrt(dx * dx + dy * dy);
                if (d < minD && d > 0.01) {
                    m.x += dx / d * (minD - d) / L.b;
                    m.y += dy / d * (minD - d) / L.h;
                }
            });
            if (m.x < 0.05 && !(m.ind > 0)) { m.x = 0.05; m.vx = Math.abs(m.vx); }
            if (m.x > 0.95) { m.x = 0.95; m.vx = -Math.abs(m.vx); }
            if (m.y < 0.13) { m.y = 0.13; m.vy = Math.abs(m.vy); }
            if (m.y > 0.93) { m.y = 0.93; m.vy = -Math.abs(m.vy); }
        });
        this.fri = this.fri.filter(function (m) { return !m.vaek; });
        /* Luften i lungerne fylder op, og musklen tager det overskydende */
        if (!this.paaVej) {
            var mangler = Math.round(this.o) - this.friAntal();
            this.fyldT = (this.fyldT || 0) - dt;
            if (this.fyldT <= 0) {
                if (mangler > 0) { this.nytFri(undefined, NK.r(0.2, 0.85), true); this.fyldT = 0.22; }
                else if (mangler < 0) {
                    var ledig = this.fri.filter(function (m) { return !m.ud && !m.flyv; });
                    ledig.sort(function (p, q) { return q.x - p.x; });
                    if (ledig.length) ledig[0].ud = 1;
                    this.fyldT = 0.22;
                }
            }
        }
        this.visPanel();
    };

    P.travlt = function () {
        return this.fri.some(function (m) { return m.flyv; }) || Math.round(this.o) !== this.friAntal();
    };

    /* Et frit O2 flyver hen til en Hb uden O2 */
    P.bind = function () {
        var ledige = this.hb.filter(function (h) { return !h.bundet && !h.venter && h.ind < 0.3; });
        var frie = this.fri.filter(function (m) { return !m.ud && !m.flyv && !(m.ind > 0); });
        if (!ledige.length || !frie.length) return false;
        var h = NK.tilfaeldig(ledige), mig = this, bedst = null, d = 1e9;
        frie.forEach(function (m) {
            var p = mig.hbPunkt(h), L = mig.lay.lup;
            var dd = Math.pow(m.x - (p.x - L.x) / L.b, 2) + Math.pow(m.y - (p.y - L.y) / L.h, 2);
            if (dd < d) { d = dd; bedst = m; }
        });
        h.venter = true;
        bedst.flyv = { h: h, t: 0, x0: bedst.x, y0: bedst.y };
        return true;
    };

    /* En HbO2 slipper sit O2 */
    P.afgiv = function () {
        var bundne = this.hb.filter(function (h) { return h.bundet; });
        if (!bundne.length) return false;
        var h = NK.tilfaeldig(bundne), p = this.hbPunkt(h), L = this.lay.lup;
        h.bundet = false;
        var m = this.nytFri((p.x - L.x) / L.b + 0.04, (p.y - L.y) / L.h - 0.06);
        m.vx = NK.r(0.04, 0.1); m.vy = NK.r(-0.1, -0.03);
        return true;
    };

    /* ----- Tegning --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var om = this.omNu(), till = this.tilladt(), s = lay.lunge.s;

        /* Bjergene bag lungerne */
        if (this.bjerg) {
            Tg.bjerge(ctx, lay.lunge.cx - s * 0.75, lay.lunge.cy - s * 0.95, s * 1.5, s * 0.75);
            Tg.maerkat(ctx, "I bjergene", lay.lunge.cx, lay.lunge.cy - s * 0.98, { px: 12.5, farve: "#dfe7f1" });
        }

        /* Blodaarerne med pile i blodets retning */
        function aare(a, farve, lys) {
            ctx.save();
            ctx.lineCap = "round";
            ctx.lineWidth = 11;
            ctx.strokeStyle = farve;
            function streg() {
                ctx.beginPath();
                a.p.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
                ctx.stroke();
            }
            ctx.lineJoin = "round";
            streg();
            ctx.lineWidth = 3;
            ctx.strokeStyle = lys;
            streg();
            [0.35, 0.65].forEach(function (t) {
                var p = paaVejen(a, t), q = paaVejen(a, t + 0.02);
                var v = Math.atan2(q.y - p.y, q.x - p.x);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(v);
                ctx.fillStyle = "#ffe1dc";
                ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4.5); ctx.lineTo(-4, 4.5); ctx.closePath(); ctx.fill();
                ctx.restore();
            });
            ctx.restore();
        }
        aare(lay.aaOp, "#b3202c", "#e2564f");
        aare(lay.aaNed, "#5c1530", "#8a2c4a");

        /* Lungerne og musklen */
        Tg.lunger(ctx, lay.lunge.cx, lay.lunge.cy, s, this.tid);
        Tg.muskel(ctx, lay.muskel.cx, lay.muskel.cy, lay.muskel.s, this.tid, this.loeb);
        NK.tekst(ctx, "Lungerne", lay.lunge.cx, lay.lunge.cy + s * 0.68, { font: Tg.font("700", 14), farve: "#dfe7f1", justering: "center" });
        NK.tekst(ctx, this.loeb ? "Musklen arbejder" : "Musklen", lay.muskel.cx, lay.muskel.cy - s * 0.44, { font: Tg.font("700", 14), farve: "#dfe7f1", justering: "center" });
        if (till === "lunge") Tg.ring(ctx, lay.lunge.cx - s * 0.55, lay.lunge.cy - s * 0.6, s * 1.1, s * 1.2, this.tid, 20);
        if (till === "muskel") Tg.ring(ctx, lay.muskel.cx - s * 0.62, lay.muskel.cy - s * 0.38, s * 1.24, s * 0.76, this.tid, 20);
        if (om.indexOf("lunge") >= 0 && till !== "lunge") Tg.omRing(ctx, lay.lunge.cx - s * 0.55, lay.lunge.cy - s * 0.6, s * 1.1, s * 1.2, 20);
        if (om.indexOf("muskel") >= 0 && till !== "muskel") Tg.omRing(ctx, lay.muskel.cx - s * 0.62, lay.muskel.cy - s * 0.38, s * 1.24, s * 0.76, 20);

        /* Draaben med den portion blod, luppen viser, og stregerne op til luppen */
        var dr = this.draabe(), L = lay.lup;
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.5)";
        ctx.beginPath();
        var naer = dr.x < L.x + L.b / 2 ? L.x : L.x + L.b;
        ctx.moveTo(dr.x, dr.y); ctx.lineTo(naer, L.y + 10);
        ctx.moveTo(dr.x, dr.y); ctx.lineTo(naer, L.y + L.h - 10);
        ctx.stroke();
        ctx.restore();
        Tg.kugle(ctx, dr.x, dr.y, 9, this.bVis >= this.N * 0.8 ? "HbO2" : "Hb");
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
        ctx.beginPath(); ctx.arc(dr.x, dr.y, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        /* Luppen */
        ctx.save();
        NK.rundtRekt(ctx, L.x, L.y, L.b, L.h, 14);
        var gl = ctx.createLinearGradient(L.x, L.y, L.x, L.y + L.h);
        gl.addColorStop(0, "#3a141c");
        gl.addColorStop(1, "#2a0e15");
        ctx.fillStyle = gl;
        ctx.fill();
        ctx.clip();
        this.hb.forEach(function (h) {
            var p = mig.hbPunkt(h);
            Tg.hb(ctx, p.x, p.y, lay.k, h.bundet, h.ind > 0 ? 1 - h.ind : undefined, h.fase);
        });
        this.fri.forEach(function (m) {
            var x = L.x + m.x * L.b, y = L.y + m.y * L.h;
            Tg.molekyle(ctx, "O2", x, y, m.v, lay.k * 0.85);
        });
        ctx.restore();
        ctx.save();
        NK.rundtRekt(ctx, L.x, L.y, L.b, L.h, 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = om.indexOf("lup") >= 0 ? "#f2c53d" : "#7d6a2c";
        ctx.stroke();
        ctx.restore();
        var hvor = this.paaVej ? "Blodet er på vej til " + NAVN[this.paaVej.til] : "Blodet i " + NAVN[this.sted];
        Tg.maerkat(ctx, hvor, L.x + 12, L.y + 18, { justering: "left", px: 13 });

        /* Signaturen over luppen */
        this.sig = Tg.signatur(ctx, L.x + L.b / 2, lay.sigY, [
            { slags: "Hb", tekst: "Hb" }, { slags: "O2", tekst: "O₂" }, { slags: "HbO2", tekst: "HbO₂" }
        ], Math.max(L.b, 300));

        /* Knapperne Loeb og Mere Hb, kun naar opgaven beder om dem */
        if (till === "loeb") {
            Tg.knap(ctx, lay.loebKnap, "Løb ▶", { farve: "gul", over: this.hover === "loeb" });
            Tg.ring(ctx, lay.loebKnap.x, lay.loebKnap.y, lay.loebKnap.b, lay.loebKnap.h, this.tid, 10);
        }
        if (till === "flere") {
            Tg.knap(ctx, lay.flereKnap, "Mere Hb +", { farve: "gul", over: this.hover === "flere" });
            Tg.ring(ctx, lay.flereKnap.x, lay.flereKnap.y, lay.flereKnap.b, lay.flereKnap.h, this.tid, 10);
        }
        if (till === "lunge") Tg.skilt(ctx, "Klik: til lungerne", lay.lunge.cx, lay.lunge.cy - s * 0.62, 8, lay.W - 8);
        if (till === "muskel") Tg.skilt(ctx, "Klik: til musklen", lay.muskel.cx, lay.muskel.cy - s * 0.52, 8, lay.W - 8);

        /* Reaktionsskemaet, broeken og tallinjen */
        var midt = lay.W / 2;
        NK.tekst(ctx, "Hb + O₂ ⇌ HbO₂", midt - 34, lay.formelY + 6, { font: Tg.font("700", 17), farve: "#ffffff", justering: "right" });
        var fb = Tg.broek(ctx, midt + 4, lay.formelY, "Y =", "[HbO₂]", "[Hb] · [O₂]", { px: 16 });
        if (om.indexOf("formel") >= 0) Tg.omRing(ctx, fb.x - 4, lay.formelY - 26, fb.b + 8, 52, 10);
        var vis = !this.gaetNu();
        Tg.tallinje(ctx, lay.tlX, lay.tlY, lay.tlW, {
            K: BL.K, Ktekst: "",
            Y: vis ? this.yNu() : null,
            yTekst: "Y",
            foer: vis && this.koerer ? this.foerY : null,
            maal: this.koerer && this.ventT >= 0
        });
        if (om.indexOf("tallinje") >= 0) Tg.omRing(ctx, lay.tlX - 8, lay.tlY - 40, lay.tlW + 16, 86, 12);
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.ved = function (pt) {
        var lay = this.lay, s = lay.lunge.s;
        if (Math.abs(pt.x - lay.lunge.cx) < s * 0.55 && Math.abs(pt.y - lay.lunge.cy) < s * 0.62) return "lunge";
        if (Math.abs(pt.x - lay.muskel.cx) < s * 0.64 && Math.abs(pt.y - lay.muskel.cy) < s * 0.42) return "muskel";
        if (Tg.i(lay.loebKnap, pt)) return "loeb";
        if (Tg.i(lay.flereKnap, pt)) return "flere";
        return "";
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) { this.hover = null; return null; }
        var v = this.ved(pt);
        this.hover = v;
        if (v && v === this.tilladt()) return "klik";
        if (Tg.feltVed(this.sig, pt)) return "klik";
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var f = Tg.feltVed(this.sig, pt);
        if (f) { this.kortBesked(D.partikel(f.slags), 6); return; }
        var v = this.ved(pt);
        /* Knapperne kan kun ses, naar opgaven beder om dem */
        if ((v === "loeb" || v === "flere") && this.tilladt() !== v) v = "";
        if (!v) {
            if (Tg.i(this.lay.lup, pt)) {
                var p = this.hbVed(pt);
                if (p) this.kortBesked(D.partikel(p), 5);
            }
            return;
        }
        if (this.spaer()) return;
        if (this.paaVej || this.koerer) { this.kortBesked("Vent, til Y står ved K på tallinjen.", 3); return; }
        if (v !== this.opg.o.forsoeg.handling) { this.kortBlink(); return; }
        if (v === "lunge" || v === "muskel") this.rejs(v);
        else if (v === "loeb") this.loebNu();
        else if (v === "flere") this.mereHb();
    };

    P.hbVed = function (pt) {
        var mig = this, L = this.lay.lup, ud = null;
        this.hb.forEach(function (h) {
            var p = mig.hbPunkt(h);
            if ((p.x - pt.x) * (p.x - pt.x) + (p.y - pt.y) * (p.y - pt.y) < 16 * 16) ud = h.bundet ? "HbO2" : "Hb";
        });
        if (ud) return ud;
        this.fri.forEach(function (m) {
            var x = L.x + m.x * L.b, y = L.y + m.y * L.h;
            if ((x - pt.x) * (x - pt.x) + (y - pt.y) * (y - pt.y) < 12 * 12) ud = "O2";
        });
        return ud;
    };

    NK.SimBlod = SimBlod;
}());
