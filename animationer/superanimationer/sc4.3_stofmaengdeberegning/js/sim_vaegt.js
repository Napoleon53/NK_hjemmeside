/* =====================================================================
   sim_vaegt.js - fane 2: Vaegten

   De seks opgavetyper fra den gamle c4.3: find n (to gange), find m (to
   gange), find M af et ukendt pulver og Mesteren, hvor stofmaengden af
   ét stof giver massen af et andet. I hvert trin skriver eleven formlen
   og saa tallet med enheden.

   Scenen goer det, eleven har regnet. Modellen er posen med 1 mol (som
   i sc4.5): massen m ligger paa vaegten, én pose er M gram, og n er,
   hvor mange poser der bliver. Naar n er regnet, deles bunken i poser,
   og vaegten taeller ned med M gram pr. pose. Naar m er regnet, vejes m
   af og fylder de poser, der stod stiplet. Et forkert tal faar en
   konsekvens: forkerte poser i roedt, eller en forkert masse paa
   vaegten, og linjen siger, hvad det ville give.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    function SimVaegt() {
        this.sidstTal = {};
        this.over = null;
        this.startFane(D.VAEGT);
        this.regning = new NK.Regning({ vaert: NK.el("vaegt-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimVaegt.prototype;
    NK.Fane.paa(P, { navn: "vaegt", naesteFane: "fane-hurtig", naesteNavn: "Hurtigrunden" });
    NK.Regning.paa(P);

    /* ----- Opgaven -------------------------------------------------------------- */
    SimVaegt.facit = function (o) {
        var t = o.tal, f = {};
        if (o.id === "n1" || o.id === "n2") { f.m = t.m; f.n = t.m / o.st.Mv; }
        if (o.id === "m1" || o.id === "m2") { f.n = t.n; f.m = t.n * o.st.Mv; }
        if (o.id === "M") { f.n = t.n; f.m = t.m; f.M = t.m / t.n; }
        if (o.id === "mester") { f.m1 = t.m; f.n = t.m / o.st.Mv; f.m = f.n * o.st2.Mv; }
        return f;
    };

    /* Opgaven med tal og facit, bygget af en linje i D.VAEGT */
    SimVaegt.byg = function (spec, tal) {
        var o = { id: spec.id, titel: spec.titel, trin: spec.trin, tekst: spec.tekst, tal: {} };
        Object.keys(tal).forEach(function (k) { o.tal[k] = tal[k]; });
        o.st = D.stof(spec.stof === "?" ? tal.ukendt : spec.stof);
        o.st2 = spec.stof2 ? D.stof(spec.stof2) : null;
        /* Det ukendte pulver: massen regnes af stofmaengden og vejes med to decimaler */
        if (spec.stof === "?") o.tal.m = Math.round(tal.n * o.st.M) / 100;
        o.facit = SimVaegt.facit(o);
        return o;
    };

    P.lavOpgave = function (i, nyeTal) {
        var spec = D.VAEGT[i];
        var tal = nyeTal ? this.traek(spec.tal, this.sidstTal[spec.id]) : (this.sidstTal[spec.id] || spec.tal[0]);
        this.sidstTal[spec.id] = tal;
        this.opg = SimVaegt.byg(spec, tal);
        this.regning.saet(this.opg);
        this.nyScene();
    };

    P.harNyeTal = function () { return true; };

    P.promptHTML = function () {
        var o = this.opg, t = o.tal, st = o.st;
        var s = o.tekst
            .replace("{m}", t.m !== undefined ? T.g(t.m) : "")
            .replace("{n}", t.n !== undefined ? T.mol(t.n) : "")
            .replace("{navn}", st.navn)
            .replace("{kendt}", st.kendt || st.navn);
        return '<p class="maal-tekst">' + NK.html(s) + "</p>";
    };

    /* Tavlens linjer med opgavens tal */
    P.data = function () {
        var o = this.opg, t = o.tal, f = "(" + o.st.formel + ")";
        var M = "M" + f + " = " + NK.komma(o.st.M) + " g/mol";
        switch (o.id) {
        case "n1": case "n2": return ["m" + f + " = " + T.g(t.m) + " g", M];
        case "m1": case "m2": return ["n" + f + " = " + T.mol(t.n) + " mol", M];
        case "M": return ["m = " + T.g(t.m) + " g", "n = " + T.mol(t.n) + " mol"];
        }
        return ["m" + f + " = " + T.g(t.m) + " g", M, "M(" + o.st2.formel + ") = " + NK.komma(o.st2.M) + " g/mol"];
    };

    /* ----- Scenen: vaegten, bunken og poserne ---------------------------------------
       raekker: poserne, der er eller skal blive til. fyldt (0-1): hvor
       mange af dem der er fyldt. stiplet: de tomme vises som omrids. */
    P.nyScene = function () {
        var o = this.opg, f = o.facit, t = o.tal;
        var s = { vaegtM: 0, bunke: 0, bunkeSt: o.st, raekker: [], enhedPose: null, afsloert: o.id !== "M",
                  proeve: null, proeveN: null, flyv: null, koe: [], aktiv: null, spoerg: false };
        if (o.id === "n1" || o.id === "n2") {
            s.vaegtM = t.m; s.bunke = 1; s.spoerg = true;
            s.raekker.push({ st: o.st, n: f.n, fyldt: 0, stiplet: false, under: "" });
        }
        if (o.id === "m1" || o.id === "m2") {
            s.raekker.push({ st: o.st, n: t.n, fyldt: 0, stiplet: true, under: T.mol(t.n) + " mol = ? g" });
        }
        if (o.id === "M") {
            s.vaegtM = t.m; s.bunke = 1;
            s.raekker.push({ st: o.st, n: t.n, fyldt: 0, stiplet: true, under: T.mol(t.n) + " mol = " + T.g(t.m) + " g" });
            s.enhedPose = { st: o.st, etiket: "? g", under: "1 mol = ? g" };
        }
        if (o.id === "mester") {
            s.vaegtM = t.m; s.bunke = 1; s.spoerg = true;
            s.raekker.push({ st: o.st, n: f.n, fyldt: 0, stiplet: false, under: "" });
            s.raekker.push({ st: o.st2, n: f.n, fyldt: 0, stiplet: false, under: "", skjult: true });
        }
        this.s = s;
    };

    P.efterTrin = function (id) {
        var o = this.opg, s = this.s, f = o.facit;
        s.proeve = null; s.proeveN = null;
        if (id === "n") {
            s.spoerg = false;
            s.raekker[0].under = T.g(o.tal.m) + " g = " + T.mol(f.n) + " mol";
            this.koe([{ slags: "del", r: 0 }]);
            if (o.id === "mester") {
                var r2 = s.raekker[1];
                r2.skjult = false; r2.stiplet = true; r2.under = T.mol(f.n) + " mol = ? g";
            }
        }
        if (id === "m") {
            var r = o.id === "mester" ? 1 : 0, st = o.st2 || o.st;
            s.raekker[r].under = T.mol(f.n) + " mol = " + T.g(f.m) + " g";
            this.koe([{ slags: "vej", m: f.m, st: st }, { slags: "del", r: r }]);
        }
        if (id === "M") {
            s.enhedPose.etiket = T.Mtal(f.M) + " g";
            s.enhedPose.under = "1 mol = " + T.Mtal(f.M) + " g";
            this.koe([{ slags: "del", r: 0 }, { slags: "afsloer" }]);
        }
    };

    P.slutLinje = function () {
        var o = this.opg, f = o.facit;
        switch (o.id) {
        case "n1": case "n2": return T.g(o.tal.m) + " g giver " + T.mol(f.n) + " poser på " + NK.komma(o.st.M) + " g.";
        case "m1": case "m2": return T.mol(f.n) + " mol " + o.st.formel + " vejer " + T.g(f.m) + " g.";
        case "M": return "Pulveret er " + o.st.navn + ", " + o.st.formel + " (" + NK.komma(o.st.M) + " g/mol).";
        }
        return "Samme stofmængde, men et mol glukose vejer mere end et mol natriumchlorid.";
    };

    /* Et forkert tal faar en konsekvens i scenen, og linjen siger, hvad det giver */
    P.efterFejl = function (id, v) {
        if (!(v > 0) || !isFinite(v)) return;
        var o = this.opg, f = o.facit, fast = this.fast.html;
        if (id === "n") {
            var mv = v * o.st.Mv;
            this.s.proeveN = { n: v, t: 4, r: 0 };
            this.besked(fast + " Regn efter: " + NK.html(T.mol(v)) + " mol · " + NK.komma(o.st.M) + " g/mol = " +
                NK.html(T.g(mv)) + " g, men vægten viser " + NK.html(T.g(o.tal.m)) + " g.", "skidt");
        }
        if (id === "m") {
            var st = o.st2 || o.st, nv = v / st.Mv;
            this.s.proeve = { m: v, t: 4, st: st };
            this.besked(fast + " Med " + NK.html(T.g(v)) + " g får du " + NK.html(T.mol(nv)) + " mol, ikke " +
                NK.html(T.mol(f.n)) + " mol.", "skidt");
        }
        if (id === "M") {
            this.besked(fast + " Regn efter: med M = " + NK.html(T.Mtal(v)) + " g/mol er " + NK.html(T.g(o.tal.m)) + " g " +
                NK.html(T.mol(o.tal.m / v)) + " mol, ikke " + NK.html(T.mol(o.tal.n)) + " mol.", "skidt");
        }
    };

    P.koe = function (trin) {
        var s = this.s;
        trin.forEach(function (t) { t.t = 0; s.koe.push(t); });
    };

    P.varighed = function (a) {
        if (a.slags === "vej") return 1.1;
        if (a.slags === "del") {
            var r = this.s.raekker[a.r];
            return 0.35 + 0.45 * Math.max(1, Math.ceil(r.n - 1e-6));
        }
        return 0.4;
    };

    P.opdaterScene = function (dt) {
        var s = this.s;
        if (!s) return;
        if (s.proeve) { s.proeve.t -= dt; if (s.proeve.t <= 0) s.proeve = null; }
        if (s.proeveN) { s.proeveN.t -= dt; if (s.proeveN.t <= 0) s.proeveN = null; }
        if (!s.aktiv && s.koe.length) {
            s.aktiv = s.koe.shift();
            s.aktiv.fraM = s.vaegtM;
        }
        var a = s.aktiv;
        s.flyv = null;
        if (!a) return;
        a.t += dt / this.varighed(a);
        var u = Math.min(1, a.t);
        var lay = this.lay;
        if (a.slags === "vej") {
            s.bunkeSt = a.st;
            s.vaegtM = a.m * NK.blod(u);
            s.bunke = NK.blod(u);
            if (lay && u < 0.92) {
                var kr = this.krukkeFor(a.st);
                s.flyv = { x0: kr.cx, y0: kr.y - 6, x1: lay.vaegt.x, y1: lay.skaalY - 8, u: (u * 5) % 1, st: a.st };
            }
        }
        if (a.slags === "del") {
            var r = s.raekker[a.r];
            r.fyldt = u;
            s.vaegtM = a.fraM * (1 - u);
            s.bunke = 1 - u;
            if (lay && u < 0.98) {
                var pl = this.pladser(a.r);
                var j = Math.min(pl.length - 1, Math.floor(u * pl.length));
                var uu = u * pl.length - j;
                if (pl[j]) s.flyv = { x0: lay.vaegt.x, y0: lay.skaalY - 10, x1: pl[j].x, y1: pl[j].y - lay.poseS * 0.5, u: uu, st: r.st };
            }
            if (u >= 1) { s.vaegtM = 0; s.bunke = 0; }
        }
        if (a.slags === "afsloer" && u >= 1) s.afsloert = true;
        if (a.t >= 1) s.aktiv = null;
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        for (var i = 0; i < lay.krukker.length; i++) {
            var kr = lay.krukker[i];
            if (pt.x >= kr.x && pt.x <= kr.x + kr.b && pt.y >= kr.y && pt.y <= kr.y + kr.h) return "krukke" + i;
        }
        var v = lay.vaegt;
        if (pt.x >= v.x - v.b / 2 && pt.x <= v.x + v.b / 2 && pt.y >= lay.bordY - v.h - 24 && pt.y <= lay.bordY) return "vaegt";
        var pa = lay.poser;
        if (pt.x >= pa.x0 && pt.x <= pa.x1 && pt.y >= lay.bordY - lay.poseS * 1.2 && pt.y <= lay.bordY) return "poser";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt), o = this.opg, s = this.s;
        if (u && u.indexOf("krukke") === 0) {
            var st = this.lay.krukker[parseInt(u.slice(6), 10)].st;
            if (o.id === "M" && !s.afsloert) this.kortBesked("Etiketten er revet af. Molarmassen må du regne ud.");
            else this.kortBesked("Molarmassen står på etiketten: M(" + NK.html(st.formel) + ") = " + NK.komma(st.M) + " g/mol.");
        }
        if (u === "vaegt") this.kortBesked("Vægten viser massen m i gram.");
        if (u === "poser") this.kortBesked("Hver pose er 1 mol. En hel pose vejer M gram.");
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, o = this.opg;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.1, 30, 50));
        /* Tavlen faar den hoejde, teksten skal bruge; resten gaar til bordet */
        lay.f = NK.klamp(Math.min(W / 40, Hs / 24), 14, 22);
        var tavleH = Math.round(NK.klamp(lay.f * 9.4, 140, Hs * 0.46));
        var fri = lay.bordY - (16 + tavleH + 34);
        var vb = NK.klamp(Math.min(W * 0.25, fri * 1.35), 120, 290);
        var vh = Tg.vaegtHoejde(vb);
        var krH = NK.klamp(Math.min(vb * 0.78, fri * 0.95), 78, 190);
        var krB = Tg.krukkeBredde(krH);
        var antalKr = o && o.st2 ? 2 : 1;
        var x = 18;
        lay.krukker = [];
        for (var i = 0; i < antalKr; i++) {
            var st = i === 0 ? o.st : o.st2;
            lay.krukker.push({ cx: x + krB / 2, x: x, y: lay.bordY - krH, b: krB, h: krH, st: st });
            x += krB + 14;
        }
        lay.vaegt = { x: x + 10 + vb / 2, b: vb, h: vh };
        lay.skaalY = lay.bordY - vh + vh * 13 / 130;
        var px0 = lay.vaegt.x + vb / 2 + 26, px1 = W - 18;
        lay.poser = { x0: px0, x1: px1 };
        var grupper = antalKr === 2 || (o && o.id === "M") ? 2 : 1;
        var gb = (px1 - px0) / grupper;
        /* Poserne: saa store, at den laengste raekke kan staa i sin gruppe */
        var flest = 1;
        if (this.s) this.s.raekker.forEach(function (rk) { flest = Math.max(flest, Math.min(4, Math.ceil(rk.n - 0.004))); });
        lay.poseS = NK.klamp(Math.min(krH * 0.75, gb / (flest * 0.96 + 0.5), fri * 0.8), 30, 96);
        lay.grupper = [];
        lay.gb = gb;
        for (i = 0; i < grupper; i++) lay.grupper.push(px0 + gb * (i + 0.5));
        var objH = Math.max(vh, krH, lay.poseS * 1.1);
        lay.tavle = { x: 16, y: 16, b: W - 32, h: Math.max(120, Math.min(tavleH, lay.bordY - objH - 36 - 16)) };
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("bord", 8, lay.bordY - objH - 8, W - 16, objH + 8);
        this.saetAnker("poser", px0, lay.bordY - lay.poseS * 1.2, px1 - px0, lay.poseS * 1.2 + 30);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    P.krukkeFor = function (st) {
        var k = this.lay.krukker;
        for (var i = 0; i < k.length; i++) if (k[i].st === st) return k[i];
        return k[0];
    };

    /* Pladserne for poserne i raekke r (hoejst fire paa en raekke) */
    P.pladser = function (r) {
        var lay = this.lay, s = this.s, rk = s.raekker[r];
        var cx = lay.grupper[Math.min(r, lay.grupper.length - 1)];
        if (this.opg.id === "M") cx = lay.grupper[0];
        return Tg.posePladser(rk.n, cx, lay.bordY, lay.poseS, 4);
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, s = this.s, o = this.opg, mig = this;
        if (!lay || !s) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        var tv = lay.tavle;
        var ts = this.trekant ? NK.klamp(Math.min(tv.h * 0.78, tv.b * 0.3), 80, 150) : 0;
        this.regning.tegnTavle(ctx, tv, this.data(), this.tid, ts ? ts + 14 : 0, lay.f);
        if (this.trekant) Tg.trekant(ctx, tv.x + tv.b - ts - 12, tv.y + 12, ts, this.trekant, this.trekantT);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);

        /* Krukkerne */
        lay.krukker.forEach(function (kr, i) {
            var ukendt = o.id === "M" && !s.afsloert;
            Tg.krukke(ctx, kr.cx, lay.bordY, kr.h, kr.st, { lys: mig.over === "krukke" + i ? 1 : 0, ukendt: ukendt });
        });

        /* Vaegten med vejebaaden */
        var v = lay.vaegt;
        var m = s.proeve ? s.proeve.m : s.vaegtM;
        var skaal = Tg.vaegt(ctx, v.x, lay.bordY, v.b, T.g(Math.max(0, m)) + " g", { lys: this.over === "vaegt" ? 1 : 0, roed: !!s.proeve });
        var bb = skaal.b * 0.72;
        var bunke = s.proeve ? NK.klamp(s.proeve.m / Math.max(1, o.facit.m), 0.15, 1.5) : s.bunke;
        Tg.bunke(ctx, skaal.x, skaal.y, bb, s.proeve ? s.proeve.st : s.bunkeSt, bunke, NK.klamp(bb * 0.22, 10, 34), 3);

        /* Poserne */
        var tekstY = lay.bordY + 12 + (lay.Hs - lay.bordY - 12) / 2;
        /* Linjen under en gruppe poser paa bordets forkant: to linjer ved
           lighedstegnet, hvis den ikke kan staa paa én uden at blive for lille */
        function under(tekst, cx, farve) {
            var maks = NK.klamp(lay.poseS * 0.24, 12, 15), b = lay.gb - 12;
            var px = NK.passendeSkrift(ctx, tekst, b, maks, 11, "700");
            var dele = tekst.split(" = ");
            if (px >= 12 || dele.length < 2) {
                NK.tekst(ctx, tekst, cx, tekstY, { font: Tg.font("700", px), justering: "center", linje: "middle", farve: farve });
                return;
            }
            var l1 = dele[0] + " =", l2 = dele.slice(1).join(" = ");
            px = Math.min(NK.passendeSkrift(ctx, l1, b, maks, 11, "700"), NK.passendeSkrift(ctx, l2, b, maks, 11, "700"));
            NK.tekst(ctx, l1, cx, tekstY - px * 0.58, { font: Tg.font("700", px), justering: "center", linje: "middle", farve: farve });
            NK.tekst(ctx, l2, cx, tekstY + px * 0.58, { font: Tg.font("700", px), justering: "center", linje: "middle", farve: farve });
        }
        s.raekker.forEach(function (rk, r) {
            if (rk.skjult) return;
            var pl = mig.pladser(r), k = pl.length;
            var hele = rk.fyldt * k;
            pl.forEach(function (p, i) {
                var fyldt = hele >= i + 1 - 1e-6;
                var i0 = i < hele && !fyldt;
                if (fyldt || i0) {
                    Tg.pose(ctx, p.x, p.y, lay.poseS, rk.st, { andel: p.andel, alfa: fyldt ? 1 : NK.klamp(hele - i, 0.15, 1),
                        lys: mig.over === "poser" ? 0.6 : 0 });
                } else if (rk.stiplet) {
                    Tg.pose(ctx, p.x, p.y, lay.poseS, rk.st, { andel: p.andel, stiplet: true,
                        etiket: p.andel >= 1 ? "1 mol" : Tg.brokTal(p.andel) + " mol" });
                }
            });
            if (s.spoerg && r === 0 && rk.fyldt === 0 && !s.proeveN) {
                Tg.pose(ctx, lay.grupper[0], lay.bordY, lay.poseS, rk.st, { stiplet: true, etiket: "? mol" });
            }
            if (rk.under) under(rk.under, lay.grupper[Math.min(r, lay.grupper.length - 1)], "#f5dd8a");
        });

        /* Den forkerte stofmaengde: poserne, eleven har regnet, i roedt */
        if (s.proeveN && s.proeveN.n <= 12) {
            var pr = Tg.posePladser(s.proeveN.n, lay.grupper[0], lay.bordY, lay.poseS * (s.proeveN.n > 4 ? 0.62 : 1), s.proeveN.n > 4 ? 6 : 4);
            pr.forEach(function (p) {
                Tg.pose(ctx, p.x, p.y, lay.poseS * (s.proeveN.n > 4 ? 0.62 : 1), s.raekker[0].st,
                    { andel: p.andel, stiplet: true, roed: true, etiket: p.andel >= 1 ? "1 mol" : "" });
            });
        } else if (s.proeveN) {
            NK.tekst(ctx, T.mol(s.proeveN.n) + " poser?", lay.grupper[0], lay.bordY - lay.poseS * 0.5,
                { font: Tg.font("700", 16), justering: "center", linje: "middle", farve: "#f0918a" });
        }

        /* Posen med 1 mol ved det ukendte pulver */
        if (s.enhedPose) {
            var ex = lay.grupper[1];
            Tg.pose(ctx, ex, lay.bordY, lay.poseS, s.enhedPose.st, { stiplet: true, etiket: s.enhedPose.etiket });
            under(s.enhedPose.under, ex, s.afsloert ? "#7ee0a8" : "#f5dd8a");
        }

        /* Pulveret paa vej */
        if (s.flyv) {
            var f = s.flyv, u = f.u;
            var x = NK.lerp(f.x0, f.x1, u), y = NK.lerp(f.y0, f.y1, u) - Math.sin(u * Math.PI) * 50;
            Tg.pulver(ctx, x, y, 22, 9, f.st, 6);
        }
        this.k.tegn(ctx);
    };

    NK.SimVaegt = SimVaegt;
}());
