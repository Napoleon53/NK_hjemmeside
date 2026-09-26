/* =====================================================================
   sim_kolbe.js - fane 2: maalekolben

   Seks regneopgaver fra den gamle c5.2: find c, n og V, fra masse til
   koncentration og hvor meget der skal afvejes. I hvert trin skriver
   eleven formlen og saa tallet. Tavlen viser opgavens tal og
   beregningerne. Scenen goer det, eleven har regnet: vaegten vejer
   stoffet af, pulveret kommer i kolben, der fyldes op til maerket, og
   kolben faar en etiket. Et forkert tal for massen vejes ogsaa af, og
   linjen siger, hvilken koncentration det ville give.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimKolbe() {
        this.sidstTal = {};
        this.over = null;
        this.startFane(D.KOLBE);
        this.regning = new NK.Regning({ vaert: NK.el("kolbe-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimKolbe.prototype;
    NK.Fane.paa(P, { navn: "kolbe", naesteFane: "fane-fortynd", naesteNavn: "Fortynding" });
    NK.Regning.paa(P);

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i, nyeTal) {
        var spec = D.KOLBE[i];
        var tal = nyeTal ? this.traek(spec.tal, this.sidstTal[spec.id]) : (this.sidstTal[spec.id] || spec.tal[0]);
        this.sidstTal[spec.id] = tal;
        var o = { id: spec.id, fane: 2, titel: spec.titel, stof: tal.stof || spec.stof, tal: tal, enhed: spec.enhed,
                  trin: spec.trin, tekst: spec.tekst };
        o.facit = K.facitKolbe(o);
        this.opg = o;
        this.regning.saet(o);
        this.nyScene();
    };

    P.harNyeTal = function () { return true; };
    P.harForfra = function () { return false; };

    P.st = function () { return D.stof(this.opg.stof); };

    P.promptHTML = function () {
        var o = this.opg, t = o.tal, st = this.st();
        var s = o.tekst
            .replace("{n}", K.mol(t.n)).replace("{c}", K.c(t.c)).replace("{m}", K.g(t.m))
            .replace("{V}", t.V !== undefined ? K.rumfang(t.V, o.enhed) : "")
            .replace("{stof}", st.formel);
        return '<p class="maal-tekst">' + NK.html(s) + "</p>";
    };

    /* Tavlens linjer med opgavens tal */
    P.data = function () {
        var o = this.opg, t = o.tal, f = "(" + this.st().formel + ")";
        switch (o.id) {
        case "c": return ["n" + f + " = " + K.mol(t.n) + " mol", "V = " + K.rumfang(t.V, o.enhed)];
        case "n": return ["c" + f + " = " + K.c(t.c) + " M", "V = " + K.rumfang(t.V, o.enhed)];
        case "V": return ["n" + f + " = " + K.mol(t.n) + " mol", "c" + f + " = " + K.c(t.c) + " M"];
        case "mc": return ["m" + f + " = " + K.g(t.m) + " g", "V = " + K.rumfang(t.V, o.enhed)];
        }
        return ["c" + f + " = " + K.c(t.c) + " M", "V = " + K.rumfang(t.V, o.enhed)];
    };

    /* ----- Scenen: det, der er vejet, haeldt og fyldt ---------------------------- */
    P.nyScene = function () {
        var o = this.opg, f = o.facit;
        var s = { vaegtM: 0, bunke: 0, kolbeSynlig: 1, fyld: 0, pulver: 0, c: 0, etiket: null, Mvist: true,
                  tag: null, proeve: null, flyv: null, koe: [], aktiv: null };
        if (o.trin.indexOf("M") >= 0) s.Mvist = false;
        if (o.id === "c") { s.fyld = 0.5; s.c = f.c * 2; }
        if (o.id === "V") { s.vaegtM = f.m; s.bunke = 1; s.kolbeSynlig = 0; }
        if (o.id === "mc") { s.vaegtM = f.m; s.bunke = 1; }
        this.s = s;
    };

    P.efterTrin = function (id) {
        var o = this.opg, s = this.s;
        if (id === "M") s.Mvist = true;
        if (id === "n_mM") s.tag = "= " + K.mol(o.facit.n) + " mol";
        if (id === "c" && o.id === "c") this.koe(["fyld", "etiket"]);
        if (id === "c" && o.id === "mc") this.koe(["haeld", "fyld", "etiket"]);
        if (id === "n_cV" && o.id === "n") this.koe(["vej", "haeld", "fyld", "etiket"]);
        if (id === "V") this.koe(["kolbe", "haeld", "fyld", "etiket"]);
        if (id === "m") { s.proeve = null; this.koe(["vej", "haeld", "fyld", "etiket"]); }
    };

    /* Et forkert tal for massen vejes af, og linjen siger, hvad det ville give */
    P.efterFejl = function (id, v) {
        if (id !== "m" || !(v > 0)) return;
        var o = this.opg, st = this.st(), c = v / st.Mv / (o.tal.V / 1000);
        this.s.proeve = { m: v, t: 3.5 };
        this.besked(this.fast.html + " Med " + NK.html(K.g(v)) + " g bliver c = " + NK.html(K.c(c)) + " M, ikke " +
            NK.html(K.c(o.tal.c)) + " M.", "skidt");
    };

    P.koe = function (trin) {
        var s = this.s;
        trin.forEach(function (t) { s.koe.push({ slags: t, t: 0 }); });
    };

    var VARIGHED = { vej: 1.0, haeld: 0.9, fyld: 1.4, etiket: 0.4, kolbe: 0.5 };

    P.opdaterScene = function (dt) {
        var s = this.s, o = this.opg, f = o.facit;
        if (!s) return;
        if (s.proeve) { s.proeve.t -= dt; if (s.proeve.t <= 0) s.proeve = null; }
        if (!s.aktiv && s.koe.length) {
            s.aktiv = s.koe.shift();
            s.aktiv.fra = { fyld: s.fyld, m: s.vaegtM };
        }
        var a = s.aktiv;
        if (!a) return;
        a.t += dt / VARIGHED[a.slags];
        var u = NK.blod(Math.min(1, a.t));
        if (a.slags === "vej") { s.vaegtM = f.m * u; s.bunke = u; }
        if (a.slags === "kolbe") s.kolbeSynlig = u;
        if (a.slags === "haeld") {
            s.flyv = u < 1 ? u : null;
            s.bunke = 1 - u;
            if (a.t >= 1) { s.vaegtM = 0; s.pulver = 1; s.tag = null; }
        }
        if (a.slags === "fyld") {
            s.fyld = NK.lerp(a.fra.fyld, 1, u);
            s.pulver = Math.max(0, 1 - u * 2.5);
            s.c = s.fyld > 0.02 ? f.c / s.fyld : 0;
        }
        if (a.slags === "etiket" && a.t >= 1) s.etiket = [this.st().formel, K.c(f.c) + " M"];
        if (a.t >= 1) s.aktiv = null;
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var kg = lay.kolbe, kr = lay.krukke, v = lay.vaegt;
        if (pt.x >= kr.x && pt.x <= kr.x + kr.b && pt.y >= kr.y && pt.y <= kr.y + kr.h) return "krukke";
        if (pt.x >= v.x - v.b / 2 && pt.x <= v.x + v.b / 2 && pt.y >= lay.bordY - v.h - 20 && pt.y <= lay.bordY) return "vaegt";
        if (kg && pt.x >= kg.x0 && pt.x <= kg.x0 + kg.b && pt.y >= kg.y0 && pt.y <= kg.bund) return "kolbe";
        var tv = lay.tavle;
        if (pt.x >= tv.x && pt.x <= tv.x + tv.b && pt.y >= tv.y && pt.y <= tv.y + tv.h) return "tavle";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over && this.over !== "tavle" ? this.over : null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (u === "krukke") this.kortBesked(this.s.Mvist ? "Molarmassen står på etiketten." : "Molarmassen regner du selv ud af atommasserne.");
        if (u === "vaegt") this.kortBesked("Vægten viser massen af pulveret i gram.");
        if (u === "kolbe") this.kortBesked("Kolben fyldes op til mærket, når du har regnet rigtigt.");
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.07, 16, 44));
        var kh = NK.klamp(Math.min(Hs * 0.58, W * 0.42), 150, 330);
        lay.kolbeH = kh;
        var kbMaks = kh * 1.35 * 120 / 260;
        lay.kolbeX = 18 + kbMaks / 2;
        var tx = Math.round(lay.kolbeX + kbMaks / 2 + 26);
        var rest = W - tx - 18;
        var vb = NK.klamp(rest * 0.4, 120, 240);
        var vh = Tg.vaegtHoejde(vb);
        var krH = NK.klamp(vb * 0.85, 90, 170);
        var krB = Tg.krukkeBredde(krH);
        lay.krukke = { cx: tx + rest * 0.18, x: tx + rest * 0.18 - krB / 2, y: lay.bordY - krH, b: krB, h: krH };
        lay.vaegt = { x: tx + rest * 0.62, b: vb, h: vh };
        lay.tavle = { x: tx, y: 16, b: rest, h: Math.max(150, lay.bordY - Math.max(vh, krH) - 44 - 16) };
        this.lay = lay;
        this.kolbeGeo();
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("bord", 10, lay.bordY - kh * 1.1, W - 20, kh * 1.1);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* Kolbens stoerrelse foelger rumfanget (den tredjedel potens, som glas goer) */
    P.kolbeGeo = function () {
        var lay = this.lay, o = this.opg;
        if (!lay || !o) return;
        var VmL = o.id === "V" ? o.facit.V * 1000 : o.tal.V;
        var fak = NK.klamp(Math.pow(VmL / 250, 1 / 3), 0.8, 1.35);
        lay.kolbe = Tg.kolbeGeo(lay.kolbeX, lay.bordY, lay.kolbeH * fak);
        lay.kolbeV = VmL;
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, s = this.s, o = this.opg;
        if (!lay || !s) return;
        if (!lay.kolbe || lay.kolbeFor !== o) { this.kolbeGeo(); lay.kolbeFor = o; }
        var st = this.st();
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        this.regning.tegnTavle(ctx, lay.tavle, this.data(), this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);

        /* Krukken: molarmassen staar der, naar den er kendt */
        var kr = lay.krukke;
        Tg.krukke(ctx, kr.cx, lay.bordY, kr.h, st, { lys: this.over === "krukke" ? 1 : 0,
            linje3: s.Mvist ? NK.komma(st.M) + " g/mol" : "M = ? g/mol", linje3Farve: s.Mvist ? "#1d7a48" : "#b0463a" });

        /* Vaegten med vejebaaden */
        var v = lay.vaegt;
        var m = s.proeve ? s.proeve.m : s.vaegtM;
        var skaal = Tg.vaegt(ctx, v.x, lay.bordY, v.b, K.g(m) + " g", { lys: this.over === "vaegt" ? 1 : 0, roed: !!s.proeve });
        var bb = skaal.b * 0.72;
        var bunke = s.proeve ? NK.klamp(s.proeve.m / Math.max(1, o.facit.m), 0.2, 1.4) : s.bunke;
        Tg.bunke(ctx, skaal.x, skaal.y, bb, st, bunke, NK.klamp(bb * 0.22, 10, 34), 3);
        if (s.tag) NK.tekst(ctx, s.tag, v.x, lay.bordY + 26, { font: Tg.font("700", 14), justering: "center", farve: "#f5dd8a" });

        /* Kolben */
        var kg = lay.kolbe;
        if (s.kolbeSynlig < 1) {
            ctx.save();
            ctx.globalAlpha = 0.35 * (1 - s.kolbeSynlig);
            ctx.strokeStyle = "#dcecf8";
            ctx.setLineDash([6, 6]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(kg.boble.x, kg.boble.y, kg.boble.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
            NK.tekst(ctx, "? L", kg.cx, kg.boble.y, { font: Tg.font("700", 18), justering: "center", linje: "middle",
                farve: "rgba(238, 246, 252, " + (0.8 * (1 - s.kolbeSynlig)) + ")" });
        }
        if (s.kolbeSynlig > 0) {
            ctx.save();
            ctx.globalAlpha = s.kolbeSynlig;
            Tg.kolbe(ctx, kg, { fyld: s.fyld, farve: Tg.vaeske(st, s.c), tekst: K.rumfang(lay.kolbeV, "mL"),
                etiket: s.etiket, pulver: s.pulver, st: st, lys: this.over === "kolbe" ? 1 : 0 });
            ctx.restore();
        }

        /* Pulveret paa vej fra vejebaaden ned i kolben */
        if (s.flyv !== null && s.flyv !== undefined) {
            var u = s.flyv;
            var x = NK.lerp(skaal.x, kg.cx, u), y = NK.lerp(skaal.y - 10, kg.hals.y - 8, u) - Math.sin(u * Math.PI) * 60;
            Tg.pulver(ctx, x, y, 26, 11, st, 6);
        }
        this.k.tegn(ctx);
    };

    NK.SimKolbe = SimKolbe;
}());
