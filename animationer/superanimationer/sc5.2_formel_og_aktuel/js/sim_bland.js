/* =====================================================================
   sim_bland.js - fane 3: blandinger

   Fire opgaver om en ion, der kommer fra to salte. I den foerste er
   begge salte i det samme glas, saa bidragene til [ion] laegges
   sammen. I de andre haeldes to glas, A og B, sammen: stofmaengderne
   laegges sammen, og rumfanget bliver det samlede. Eleven skriver
   formlen og tallet (n = k · c · V med tallet foran ionen) og saa
   rumfanget og koncentrationen.

   Scenen goer det, der er regnet: naar rumfanget er fundet, haeldes A
   og B i blandingsglasset, og naar koncentrationen er fundet, viser
   luppen ionerne i blandingen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimBland() {
        this.sidstTal = {};
        this.part = new NK.Partikler(41);
        this.startFane(D.BLAND);
        this.regning = new NK.Regning({ vaert: NK.el("bland-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimBland.prototype;
    NK.Fane.paa(P, { navn: "bland" });
    NK.Regning.paa(P);

    P.harNyeTal = function () { return true; };
    P.harForfra = function () { return false; };

    /* ----- Opgaven --------------------------------------------------------------- */
    P.lavOpgave = function (i, nyeTal) {
        var spec = D.BLAND[i];
        var tal = nyeTal ? this.traek(spec.tal, this.sidstTal[spec.id]) : (this.sidstTal[spec.id] || spec.tal[0]);
        this.sidstTal[spec.id] = tal;
        var o = { fane: 3, id: spec.id, titel: spec.titel, tekst: spec.tekst, tal: tal, ion: tal.ion || spec.ion, ion2: tal.ion2 };
        if (o.id === "samme") o.trin = ["bidragA", "bidragB", "total"];
        else o.trin = ["nA", "nB", "Vsum", "ionBland"].concat(o.ion2 ? ["ion2"] : []);
        o.facit = K.facitBland(o);
        this.opg = o;
        this.regning.saet(o);
        this.part = new NK.Partikler(41 + i);
        this.nyScene();
    };

    P.promptHTML = function () {
        var o = this.opg, t = o.tal;
        var s = o.tekst.replace("{A}", D.salt(t.A).formel).replace("{B}", D.salt(t.B).formel)
            .replace("{cA}", K.c(t.cA)).replace("{cB}", K.c(t.cB))
            .replace("{VA}", t.VA ? K.mL(t.VA) + " mL" : "").replace("{VB}", t.VB ? K.mL(t.VB) + " mL" : "")
            .replace("{ion}", D.ion(o.ion).t).replace("{ion}", D.ion(o.ion).t).replace("{ion2}", o.ion2 ? D.ion(o.ion2).t : "");
        return '<p class="maal-tekst">' + NK.html(s) + "</p>";
    };

    P.data = function () {
        var o = this.opg, t = o.tal, A = D.salt(t.A), B = D.salt(t.B);
        if (o.id === "samme") return ["c(" + A.formel + ") = " + K.c(t.cA) + " M", "c(" + B.formel + ") = " + K.c(t.cB) + " M"];
        return ["A: " + K.mL(t.VA) + " mL " + K.c(t.cA) + " M " + A.formel, "B: " + K.mL(t.VB) + " mL " + K.c(t.cB) + " M " + B.formel];
    };

    P.slutLinje = function () {
        var o = this.opg, f = o.facit, ion = D.ion(o.ion).t;
        if (o.id === "samme") return NK.html("Ionerne er i det samme glas, så bidragene lægges sammen: [" + ion + "] = " + K.c(f.total) + " M.");
        var t = "[" + ion + "] = " + K.c(f.ionBland) + " M i blandingen.";
        if (o.ion2) t += " [" + D.ion(o.ion2).t + "] = " + K.c(f.ion2) + " M: ionen fra det ene glas fordeler sig i det hele.";
        else if (o.id === "lige") t += " Stofmængderne lægges sammen, og det gør rumfangene også.";
        return NK.html(t);
    };

    /* ----- Scenen ------------------------------------------------------------------ */
    P.nyScene = function () {
        var t = this.opg.tal;
        this.s = { VA: t.VA || 0, VB: t.VB || 0, Vmix: 0, nMix: {}, poseA: { dx: 0, dy: 0, v: 0 }, poseB: { dx: 0, dy: 0, v: 0 },
                   straale: null, koe: [], aktiv: null, vist: false };
        if (this.opg.id === "samme") this.s.Vmix = 200;
    };

    P.trin = function (dur, fn, slut, start) { this.s.koe.push({ dur: dur, fn: fn, slut: slut, start: start, t: 0 }); };

    /* Glas A eller B haeldes i blandingsglasset */
    P.haeld = function (hvem) {
        var s = this.s, lay = this.lay, mig = this, t = this.opg.tal;
        var g = hvem === "A" ? lay.glasA : lay.glasB, mix = lay.mix, pose = hvem === "A" ? s.poseA : s.poseB;
        var tud = { x: g.x0 + 12 * g.k, y: g.y0 + 12 * g.k };
        var dx = mix.ind.x1 - 18 * mix.k - tud.x, dy = mix.ind.top - 34 - tud.y;
        var V0 = hvem === "A" ? t.VA : t.VB;
        var salt = hvem === "A" ? t.A : t.B, c = hvem === "A" ? t.cA : t.cB;
        var mixV0;
        this.trin(0.6, function (u) { pose.dx = dx * u; pose.dy = dy * u; });
        this.trin(0.35, function (u) { pose.v = -1.15 * u; });
        this.trin(1.1, function (u) {
            s[hvem === "A" ? "VA" : "VB"] = V0 * (1 - u);
            s.Vmix = mixV0 + V0 * u;
            s.straale = { x: tud.x + dx, y: tud.y + dy };
        }, function () {
            s.straale = null;
            s.nMix[salt] = (s.nMix[salt] || 0) + c * V0 / 1000;
        }, function () { mixV0 = s.Vmix; });
        this.trin(0.6, function (u) { pose.v = -1.15 * (1 - u); pose.dx = dx * (1 - u); pose.dy = dy * (1 - u); });
        void mig;
    };

    P.efterTrin = function (id) {
        if (id === "Vsum") { this.haeld("A"); this.haeld("B"); }
        if (id === "ionBland" || id === "total") this.s.vist = true;
    };

    P.opdaterScene = function (dt) {
        var s = this.s;
        if (!s) return;
        if (!s.aktiv && s.koe.length) {
            s.aktiv = s.koe.shift();
            if (s.aktiv.start) s.aktiv.start();
        }
        var a = s.aktiv;
        if (a) {
            a.t += dt / a.dur;
            a.fn(NK.blod(Math.min(1, a.t)));
            if (a.t >= 1) { s.aktiv = null; if (a.slut) a.slut(); }
        }
        var ioner = this.ionListe();
        var mig = this;
        this.part.saet(ioner.map(function (id) { return s.vist ? Tg.prikker(mig.ionMix(id)) : 0; }));
        this.part.opdater(dt);
    };

    /* Ionerne i blandingen (eller i glasset i foerste opgave) */
    P.ionListe = function () {
        var t = this.opg.tal, A = D.salt(t.A), B = D.salt(t.B), ud = [];
        [A.kat, B.kat, A.an, B.an].forEach(function (id) { if (ud.indexOf(id) < 0) ud.push(id); });
        return ud;
    };

    P.ionMix = function (id) {
        var o = this.opg, t = o.tal, A = D.salt(t.A), B = D.salt(t.B);
        if (o.id === "samme") return K.k(A, id) * t.cA + K.k(B, id) * t.cB;
        var V = (t.VA + t.VB) / 1000;
        return (K.k(A, id) * t.cA * t.VA / 1000 + K.k(B, id) * t.cB * t.VB / 1000) / V;
    };

    /* Farven: kun jern(III)chlorid farver */
    P.farve = function (hvem) {
        var t = this.opg.tal, st, c = 0;
        if (hvem === "A" || hvem === "B") {
            st = D.salt(hvem === "A" ? t.A : t.B);
            return Tg.vaeske(st, hvem === "A" ? t.cA : t.cB);
        }
        var fe = ["A", "B"].filter(function (h) { return D.salt(t[h]).opl; })[0];
        if (!fe) return Tg.vaeske(null, 0);
        st = D.salt(t[fe]);
        if (this.opg.id === "samme") c = fe === "A" ? t.cA : t.cB;
        else c = this.s.Vmix > 0 ? (this.s.nMix[t[fe]] || 0) / (this.s.Vmix / 1000) : 0;
        return Tg.vaeske(st, c);
    };

    /* ----- Musen ------------------------------------------------------------------- */
    P.overScene = function () { return null; };
    P.nedScene = function (pt) {
        var lay = this.lay;
        if (!lay) return false;
        [lay.glasA, lay.glasB, lay.mix].forEach(function () { });
        var ramt = [lay.glasA, lay.glasB, lay.mix].some(function (g) {
            return g && pt.x >= g.x0 && pt.x <= g.x0 + g.b && pt.y >= g.y0 && pt.y <= g.y0 + g.h;
        });
        if (ramt) this.kortBesked(this.opg.id === "samme" ? "Begge salte er opløst i det samme glas." :
            "Glassene hældes sammen, når du har regnet det samlede rumfang.");
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.08, 20, 48));
        var zr = Math.round(NK.klamp(Math.min(Hs * 0.13, W * 0.09), 44, 92));
        lay.zoom = { x: 16 + zr + 8, y: 16 + 24 + zr, r: zr };
        var tx = lay.zoom.x + zr + NK.klamp(W * 0.04, 24, 50);
        lay.tavle = { x: tx, y: 16, b: W - tx - 18, h: Math.round(NK.klamp(Hs * 0.42, 160, 320)) };
        var top = Math.max(lay.zoom.y + zr + 70, lay.tavle.y + lay.tavle.h + 22);
        var gh = NK.klamp((lay.bordY - top) * 0.95, 90, 220);
        var gb = gh * 160 / 200;
        var samme = this.opg && this.opg.id === "samme";
        if (samme) {
            lay.mix = Tg.glasGeo(W * 0.42 - gb / 2, lay.bordY, gh);
            lay.glasA = lay.glasB = null;
        } else {
            var mellem = NK.klamp(W * 0.08, 30, 90);
            var x0 = Math.max(24, (W - 3 * gb - 2 * mellem) / 2);
            lay.mix = Tg.glasGeo(x0, lay.bordY, gh);
            lay.glasA = Tg.glasGeo(x0 + gb + mellem, lay.bordY, gh);
            lay.glasB = Tg.glasGeo(x0 + 2 * (gb + mellem), lay.bordY, gh);
        }
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("glas", 10, top - 10, W - 20, lay.bordY - top + 40);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 26, 2 * zr, 2 * zr + 60);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Tegn ---------------------------------------------------------------------- */
    function tegnGlas(ctx, g, VmL, farve, pose) {
        ctx.save();
        if (pose && (pose.dx || pose.dy || pose.v)) {
            var px = g.x0 + 12 * g.k, py = g.y0 + 12 * g.k;
            ctx.translate(px + pose.dx, py + pose.dy);
            ctx.rotate(pose.v);
            ctx.translate(-px, -py);
        }
        Tg.glas(ctx, g, VmL, farve, 0);
        ctx.restore();
    }

    function skilt(ctx, tekst, x, y, farve) {
        NK.tekst(ctx, tekst, x, y, { font: Tg.font("700", 14), justering: "center", linje: "middle", farve: farve || "#dfe6ee" });
    }

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg, s = this.s;
        if (!lay || !o || !s) return;
        if ((o.id === "samme") !== !lay.glasA) this.layout();
        var t = o.tal, A = D.salt(t.A), B = D.salt(t.B);
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        this.regning.tegnTavle(ctx, lay.tavle, this.data(), this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var ly = Math.min(lay.bordY + 24, lay.Hs - 8);
        tegnGlas(ctx, lay.mix, s.Vmix, this.farve("mix"), null);
        if (o.id === "samme") {
            skilt(ctx, A.formel + " og " + B.formel, lay.mix.cx, ly);
        } else {
            skilt(ctx, "Blandingen", lay.mix.cx, ly);
            skilt(ctx, "A: " + A.formel, lay.glasA.cx, ly);
            skilt(ctx, "B: " + B.formel, lay.glasB.cx, ly);
            if (s.straale) Tg.straale(ctx, s.straale.x, s.straale.y, lay.mix.ymL(s.Vmix), 5, null, this.tid);
            tegnGlas(ctx, lay.glasA, s.VA, this.farve("A"), s.poseA);
            tegnGlas(ctx, lay.glasB, s.VB, this.farve("B"), s.poseB);
        }
        if (s.vist) {
            var v = o.id === "samme" ? o.facit.total : o.facit.ionBland;
            skilt(ctx, "[" + D.ion(o.ion).t + "] = " + K.c(v) + " M", lay.mix.cx, lay.mix.y0 - 14, "#f5dd8a");
        }
        var z = lay.zoom, ioner = this.ionListe();
        var st = { ioner: ioner.map(function (id) { return D.ion(id); }) };
        Tg.zoom(ctx, z.x, z.y, z.r, { part: this.part, st: st, farve: this.farve("mix"), titel: o.id === "samme" ? "Glasset" : "Blandingen",
            tekst: s.vist ? "" : "?", forklar: s.vist });
        this.k.tegn(ctx);
    };

    NK.SimBland = SimBland;
}());
