/* =====================================================================
   lup.js - luppen: 100 af syrens partikler i 0,10 M

   Tegnet som luppen i sc7.5 Staerke og svage syrer, men partiklerne staar
   stille i et gitter paa 10 · 10, saa de kan taelles, og intet bevaeger
   sig, foer markoeren flyttes (brugerens oenske om ro i baggrunden, sb8.6):

     hel    graa, med hydronen siddende paa som en lille orange kugle
     delt   blaa: syrens korresponderende base, der har afgivet hydronen.
            Hydronen sidder nu paa et vandmolekyle: en roed kugle med plus
            (H₃O⁺) i et af hullerne mellem partiklerne

   Formen foelger stoffet (brugerens oenske 9. okt. 2026): Cl⁻ og F⁻ er
   kugler, ethansyre og methansyre er aflange, salpetersyre og
   hydrogencarbonat er trekanter. Ladningen staar paa partiklen. Antallet
   af delte er modellens gennemsnit afrundet (D.andel ved D.LUP_C).
   Vandmolekylerne tegnes ikke.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var FARVE = {
        hel: { f: "#8a919b", k: "#d9dee4" },
        ion: { f: "#3f86d8", k: "#c2ddfc" },
        ox: { f: "#e2503f", k: "#ffc4ba" },
        hydron: { f: "#f5a742", k: "#fff0d2" }
    };
    /* Maal i pixels ved skala 1 (et vindue paa ca. 300 · 210) */
    var FORM = {
        kugle: { slags: "kugle", R: 6.0 },
        stor: { slags: "kugle", R: 7.4 },
        kort: { slags: "pille", l: 7.2, t: 4.3 },
        pille: { slags: "pille", l: 9.0, t: 4.4 },
        lang: { slags: "pille", l: 10.4, t: 5.4 },
        trekant: { slags: "trekant", R: 7.4 }
    };
    var KNOP = 2.8, OX = 4.4, N = 10;

    function formMaal(navn, s) {
        var f = FORM[navn] || FORM.pille, knop = KNOP * s;
        if (f.slags === "pille") return { slags: "pille", l: f.l * s, t: f.t * s, arm: f.l * s, knop: knop };
        return { slags: f.slags, R: f.R * s, arm: (f.slags === "trekant" ? f.R * 0.92 : f.R) * s, knop: knop };
    }

    function Lup() {
        this.syre = null;
        this.enh = [];
        this.ox = [];
        this.antalDelte = 0;
        this.ks = null;
    }
    var P = Lup.prototype;

    P.saetSyre = function (id) {
        this.syre = id;
        this.enh = [];
        this.ox = [];
        var i;
        this.huller = null;
        this.gitter = null;
        /* Hver partikel har sin plads i en raekkefoelge og en lille, fast
           forskydning, saa gitteret ikke ser stift ud */
        for (i = 0; i < N * N; i++) {
            this.enh.push({ i: i, jx: NK.r(-0.2, 0.2), jy: NK.r(-0.16, 0.16), a: NK.r(0, Math.PI * 2), delt: false, blink: 0 });
        }
        this.antalDelte = 0;
        this.ks = null;
    };

    /* Kₛ ved markoeren: saa mange af de 100 har afgivet deres hydron */
    P.saetKs = function (ks, straks) {
        this.ks = ks;
        var maal = Math.round(N * N * D.andel(ks, D.LUP_C)), mig = this;
        var delte = this.enh.filter(function (e) { return e.delt; });
        var hele = this.enh.filter(function (e) { return !e.delt; });
        hele = NK.bland(hele);
        delte = NK.bland(delte);
        while (delte.length < maal && hele.length) {
            var e = hele.pop();
            e.delt = true;
            e.blink = straks ? 0 : 1;
            var hul = this.ledigtHul();
            this.ox.push({ ejer: e, hul: hul, t: straks ? 1 : 0, ud: false, alfa: 1 });
            delte.push(e);
        }
        while (delte.length > maal) {
            var d = delte.pop();
            d.delt = false;
            d.blink = straks ? 0 : 1;
            this.ox.forEach(function (o) { if (o.ejer === d && !o.ud) { o.ud = true; o.t = straks ? 0 : 1; } });
        }
        if (straks) this.ox = this.ox.filter(function (o) { return !o.ud; });
        this.antalDelte = maal;
        void mig;
    };

    /* Det laveste nummer, ingen oxoniumion har. Nummeret peger paa et hul i
       en blandet liste over hullerne i det gitter, luppen har lige nu. */
    P.ledigtHul = function () {
        var brugt = {};
        this.ox.forEach(function (o) { if (!o.ud) brugt[o.hul] = true; });
        for (var i = 0; i < N * N; i++) if (!brugt[i]) return i;
        return 0;
    };

    P.antal = function () {
        var d = this.antalDelte;
        return { hele: N * N - d, delte: d, ox: d };
    };

    /* Hydronen glider fra partiklen til sit hul (t fra 0 til 1) og tilbage */
    P.opdater = function (dt) {
        this.enh.forEach(function (e) { if (e.blink > 0) e.blink = Math.max(0, e.blink - dt / 0.7); });
        this.ox.forEach(function (o) {
            if (o.ud) o.t = Math.max(0, o.t - dt / 0.45);
            else o.t = Math.min(1, o.t + dt / 0.45);
        });
        this.ox = this.ox.filter(function (o) { return !(o.ud && o.t <= 0); });
    };

    P.stille = function () {
        return this.enh.every(function (e) { return e.blink <= 0; }) && this.ox.every(function (o) { return o.t >= 1 && !o.ud; });
    };

    /* ----- Tegning --------------------------------------------------------------- */
    function kropSti(ctx, F) {
        if (F.slags === "pille") { NK.rundtRekt(ctx, -F.l, -F.t, 2 * F.l, 2 * F.t, F.t); return; }
        ctx.beginPath();
        if (F.slags === "kugle") { ctx.arc(0, 0, F.R, 0, Math.PI * 2); return; }
        var p = [], i;
        for (i = 0; i < 3; i++) p.push({ x: Math.cos(i * 2 * Math.PI / 3) * F.R * 1.25, y: Math.sin(i * 2 * Math.PI / 3) * F.R * 1.25 });
        ctx.moveTo((p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
        ctx.arcTo(p[1].x, p[1].y, p[2].x, p[2].y, F.R * 0.42);
        ctx.arcTo(p[2].x, p[2].y, p[0].x, p[0].y, F.R * 0.42);
        ctx.arcTo(p[0].x, p[0].y, p[1].x, p[1].y, F.R * 0.42);
        ctx.closePath();
    }

    /* Ladningen paa partiklen, vandret: +, −, 2− */
    function ladning(ctx, x, y, q, F) {
        if (!q) return;
        var m = Math.max(2.2, F.knop * 1.05);
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1.4, F.knop * 0.5);
        ctx.lineCap = "round";
        ctx.beginPath();
        if (q === -2) {
            ctx.moveTo(x - m * 0.4, y - m * 0.45); ctx.lineTo(x + m * 1.1, y - m * 0.45);
            ctx.moveTo(x - m * 0.4, y + m * 0.45); ctx.lineTo(x + m * 1.1, y + m * 0.45);
        } else {
            ctx.moveTo(x - m, y); ctx.lineTo(x + m, y);
            if (q > 0) { ctx.moveTo(x, y - m); ctx.lineTo(x, y + m); }
        }
        ctx.stroke();
        ctx.restore();
    }

    function enhed(ctx, x, y, a, F, delt, q) {
        var f = delt ? FARVE.ion : FARVE.hel;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        if (!delt) {
            ctx.beginPath();
            ctx.arc(F.arm + F.knop * 0.55, 0, F.knop, 0, Math.PI * 2);
            ctx.fillStyle = FARVE.hydron.f;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = FARVE.hydron.k;
            ctx.stroke();
        }
        kropSti(ctx, F);
        ctx.fillStyle = f.f;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = f.k;
        ctx.stroke();
        ctx.restore();
        ladning(ctx, x, y, q, F);
    }

    function oxKugle(ctx, x, y, r, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = FARVE.ox.f;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = FARVE.ox.k;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - r * 0.5, y); ctx.lineTo(x + r * 0.5, y);
        ctx.moveTo(x, y - r * 0.5); ctx.lineTo(x, y + r * 0.5);
        ctx.lineWidth = Math.max(1.3, r * 0.27);
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        ctx.restore();
    }

    /* R = { x, y, b, h }: vinduet paa laerredet */
    P.tegn = function (ctx, R) {
        if (!this.syre) return;
        /* Gitteret: 10 · 10, 20 · 5 eller 25 · 4, saa en plads er ca. 1,4 gange
           saa bred som hoej */
        var kol = 10, bedst = 1e9;
        [[10, 10], [20, 5], [25, 4]].forEach(function (g) {
            var v = Math.abs(Math.log((R.b / g[0]) / (R.h / g[1]) / 1.4));
            if (v < bedst) { bedst = v; kol = g[0]; }
        });
        var rk = N * N / kol;
        var cw0 = R.b / kol, ch0 = R.h / rk;
        var s = NK.klamp(Math.min(cw0 / 32, ch0 / 22), 0.6, 1.3), F = formMaal(D.SYRER[this.syre].form, s);
        var q = D.SYRER[this.syre].q, mx = 10 * s, my = 8 * s;
        var cw = (R.b - 2 * mx) / kol, ch = (R.h - 2 * my) / rk;
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.clip();
        var g = ctx.createLinearGradient(0, R.y, 0, R.y + R.h);
        g.addColorStop(0, "#1c4a70");
        g.addColorStop(1, "#163c5c");
        ctx.fillStyle = g;
        ctx.fillRect(R.x, R.y, R.b, R.h);
        function midt(e) { var k = e.i % kol, r = Math.floor(e.i / kol); return { x: R.x + mx + (k + 0.5 + e.jx) * cw, y: R.y + my + (r + 0.5 + e.jy) * ch }; }
        function knop(e) { var m = midt(e), d = F.arm + F.knop * 0.55; return { x: m.x + Math.cos(e.a) * d, y: m.y + Math.sin(e.a) * d }; }
        if (this.gitter !== kol) {
            /* Hullerne mellem partiklerne i dette gitter, i tilfaeldig orden */
            var alle = [];
            for (var a = 0; a < (kol + 1) * (rk + 1); a++) alle.push(a);
            this.huller = NK.bland(alle);
            this.gitter = kol;
        }
        var huller = this.huller;
        function hul(h) { var n = huller[h % huller.length], i = n % (kol + 1), j = Math.floor(n / (kol + 1)); return { x: R.x + mx + i * cw, y: R.y + my + j * ch }; }
        this.enh.forEach(function (e) {
            var m = midt(e);
            enhed(ctx, m.x, m.y, e.a, F, e.delt, e.delt ? q - 1 : q);
            if (e.blink > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(m.x, m.y, (F.arm + F.knop * 1.6) + (1 - e.blink) * 4, 0, Math.PI * 2);
                ctx.lineWidth = 2.2;
                ctx.strokeStyle = "rgba(245, 167, 66, " + (0.9 * e.blink) + ")";
                ctx.stroke();
                ctx.restore();
            }
        });
        var or = OX * s;
        this.ox.forEach(function (o) {
            var a = knop(o.ejer), b = hul(o.hul), t = NK.blod(o.t);
            oxKugle(ctx, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, or, o.ud ? Math.max(0.2, o.t) : 1);
        });
        ctx.restore();
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#5b6878";
        ctx.stroke();
        ctx.restore();
    };

    /* Signaturens tegn i skalaen k med midten i (x, y): "hel", "ion" eller "ox" */
    Lup.ikon = function (ctx, slags, syre, x, y, k) {
        if (slags === "ox") { oxKugle(ctx, x, y, OX * k, 1); return; }
        var s = D.SYRER[syre], F = formMaal(s.form, k);
        if (slags === "ion") { enhed(ctx, x, y, 0, F, true, s.q - 1); return; }
        enhed(ctx, x - F.knop * 0.8, y, 0, F, false, s.q);
    };

    Lup.FARVE = FARVE;
    NK.Lup = Lup;
}());
