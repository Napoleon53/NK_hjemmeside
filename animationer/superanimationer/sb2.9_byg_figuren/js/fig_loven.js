/* =====================================================================
   fig_loven.js - figuren til B2.2 Ligevægtsloven

   Lavet om 2. nov. 2026 efter brugerens ord: "I 2.2 må det gerne være
   tydeligt at K er ligevægtskonstanten. Og ligevægtsloven indeholder vel
   også selve brøken.. så ligevægtsloven er vel at K er lig med Y som er
   lig med denne brøk ved ligevægt.. altså loven som et overbegreb" og "at
   A og B er forskud kræver lidt at man vist reaktionsskemaet ... Måske skal
   det være tydeligt at det er K der er forskud".

   Øverst til venstre reaktionsbroeken med "på ethvert tidspunkt" over
   (bogen: "Reaktionsbrøken kan regnes ud på ethvert tidspunkt"), og til
   hoejre en ramme med "ved ligevægt: Y = K" som ligevægtsloven (bogens
   definition: "Kort skrives den Y = K"). Brugeren 2. nov. 2026, efter den
   foerste udgave med hele "Y = broek = K" i rammen: "måske skal der bare
   stå Ved ligevægt Y=K ved siden af Y =[brøk]". Ligevægtskonstanten sidder
   direkte paa K.
   Nederst to kort med bogens eksempler fra opgave B2.2.7 (25 °C):
   3 O₂(g) ⇌ 2 O₃(g) med K = 10⁻⁵⁶ M⁻¹ og 2 H₂(g) + O₂(g) ⇌ 2 H₂O(g) med
   K = 10⁸² M⁻¹. Hvert kort har reaktionsskemaet med "reaktanter" og
   "produkter" under siderne, et vindue med molekylerne og saetningen
   "ligevægten er [ ]" lige under K.
   Fem fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B2 = NK.B2;
    var F = KV.F;

    /* Kortet med reaktionsbroeken (L) og rammen med ligevægtsloven (R) */
    var L = { x: 50, y: 30, b: 590, h: 274 };
    var R = { x: 680, y: 30, b: 370, h: 274 };
    var SY = L.y + 48;                                      /* reaktionsskemaet */
    var TY = L.y + 90;                                      /* "på ethvert tidspunkt" og "ved ligevægt" */
    var EY = L.y + 172;                                     /* grundlinjen for Y, = og K */
    var PY = L.y + 240;                                     /* pladserne i de to kort */
    var BR = { x: 400, y: EY - 12 };                        /* broekstregen (maales i tegn) */
    var KX = 900;                                           /* K (maales i tegn) */
    var KM = [KX + 13, EY - 13];                            /* midten af K */
    var HB = 70;                                            /* den halve broekstreg (maales i tegn) */

    /* De to kort */
    var KY = 336, KB = 515, KH = 332, KXS = [25, 560];
    var KORT = [
        { venstre: "3 O_2(g)", hoejre: "2 O_3(g)", k: "K = 10^{−56} M^{−1}", om: "er meget lille", mol: "O2", n: 11, tekst: "næsten kun reaktanter" },
        { venstre: "2 H_2(g) + O_2(g)", hoejre: "2 H_2O(g)", k: "K = 10^{82} M^{−1}", om: "er meget stor", mol: "H2O", n: 11, tekst: "næsten kun produkter" }
    ];
    var PL = KY + KH - 30;                                  /* pladserne */
    var B = 0;                                              /* pladsernes bredde (maales i tegn som i motoren) */

    function kort(g, k) {
        var d = KORT[k], x = KXS[k], cx = x + KB / 2, sy = KY + 46;
        KV.kort(g, x, KY, KB, KH);
        var wv = B2.bredde(d.venstre, 21, 700), wh = B2.bredde(d.hoejre, 21, 700);
        var x0 = cx - (wv + 76 + wh) / 2, a0 = x0 + wv + 14, a1 = a0 + 48;
        KV.tekst(g, x0, sy, d.venstre, { fs: 21, fed: true, anker: "start" });
        B2.dobbeltpil(g, a0, a1, sy - 7, F.blaek, 2.2, 9);
        KV.tekst(g, a1 + 14, sy, d.hoejre, { fs: 21, fed: true, anker: "start" });
        KV.tekst(g, x0 + wv / 2, sy + 24, "reaktanter", { fs: 14, farve: F.daempet });
        KV.tekst(g, a1 + 14 + wh / 2, sy + 24, "produkter", { fs: 14, farve: F.daempet });
        var vx = x + 30, vy = KY + 88, vb = KB - 60, vh = 108;
        var mol = [];
        for (var i = 0; i < d.n; i++) mol.push(d.mol);
        var spredt = B2.spred(mol, vx + 10, vy + 10, vx + vb - 10, vy + vh - 10, 21 + k, 1.4, 16);
        var rnd = B2.tilfaeldig(60 + k);
        B2.vindue(g, vx, vy, vb, vh, function (ind) {
            spredt.forEach(function (m) { KV.fart(ind, m[1], m[2], rnd() * 360, 13, "#8a9ba6", 10, 0.5); });
            spredt.forEach(function (m) { B2.molekyle(ind, m[0], m[1], m[2], m[3], 1.4); });
        });
        KV.tekst(g, cx, vy + vh + 26, d.tekst, { fs: 15.5, fed: true, farve: F.accent });
        var wk = B2.bredde(d.k, 22, 700), wo = B2.bredde(d.om, 18, 400);
        var kx = cx - (wk + 8 + wo) / 2;
        KV.tekst(g, kx, KY + 266, d.k, { fs: 22, fed: true, farve: F.serieB, anker: "start" });
        KV.tekst(g, kx + wk + 8, KY + 266, d.om, { fs: 18, anker: "start" });
        KV.tekst(g, pladsX(k) - B / 2 - 10, PL + 6, "ligevægten er", { fs: 17, anker: "end" });
    }
    /* "ligevægten er [plads]" staar samlet midt i kortet */
    function pladsX(k) {
        var w = B2.bredde("ligevægten er", 17, 400);
        return KXS[k] + KB / 2 - (w + 10 + B) / 2 + w + 10 + B / 2;
    }

    NK.FIGURER.loven = {
        vb: [1100, 690],
        lag: [
            { navn: "Loven", pladser: ["ligevægtsloven", "reaktionsbrøk", "ligevægtskonstant"],
              ros: "Reaktionsbrøken Y kan regnes ud på ethvert tidspunkt. Ligevægtsloven siger, at Y er lig med ligevægtskonstanten K ved ligevægt." },
            { navn: "Hvor ligger ligevægten?", pladser: ["forskudt mod venstre", "forskudt mod højre"],
              ros: "Er K meget lille, er ligevægten forskudt mod venstre. Er K meget stor, er den forskudt mod højre." }
        ],
        pladser: [
            { id: "ligevægtsloven", ord: ["ligevægtsloven"], x: R.x + R.b / 2, y: R.y, maal: [R.x + R.b / 2, R.y], titel: true, dele: ["ramme"],
              omr: [{ r: [R.x - 5, R.y - 5, R.b + 10, R.h + 10, 18], tom: true }],
              fejl: { reaktionsbrøk: "<b>reaktionsbrøk</b> er Y og brøken til venstre, som kan regnes ud når som helst. Overskriften gælder Y = K ved ligevægt.",
                      ligevægtskonstant: "<b>ligevægtskonstant</b> er kun K. Overskriften gælder hele udsagnet: ved ligevægt er Y lig med K.",
                      "forskudt mod højre": "<b>forskudt mod højre</b> fortæller, hvor en ligevægt ligger. Overskriften gælder udsagnet i rammen." } },
            { id: "reaktionsbrøk", ord: ["reaktionsbrøk"], x: BR.x, y: PY, maal: [BR.x, BR.y + 52], dele: ["broek"],
              omr: [{ r: [314, BR.y - 54, 246, 106, 10] }],
              fejl: { ligevægtskonstant: "<b>ligevægtskonstant</b> er K i rammen til højre. Pladsen peger på Y og brøken, der er skrevet af efter reaktionsskemaet.",
                      ligevægtsloven: "<b>ligevægtsloven</b> er udsagnet Y = K ved ligevægt. Pladsen peger på Y og brøken, som kan regnes ud på ethvert tidspunkt.",
                      "forskudt mod venstre": "<b>forskudt mod venstre</b> fortæller, hvor en ligevægt ligger. Pladsen peger på Y og brøken." } },
            { id: "ligevægtskonstant", ord: ["ligevægtskonstant"], x: KM[0], y: PY, maal: [KM[0], KM[1] + 26], dele: ["k"],
              omr: [{ c: [KM[0], KM[1], 26] }],
              fejl: { reaktionsbrøk: "<b>reaktionsbrøk</b> er Y og brøken til venstre. Pladsen peger på K, den værdi Y har ved ligevægt.",
                      ligevægtsloven: "<b>ligevægtsloven</b> er hele udsagnet i rammen. Pladsen peger kun på K.",
                      "forskudt mod højre": "<b>forskudt mod højre</b> siges om en ligevægt med meget produkt. Pladsen peger på bogstavet K." } },

            { id: "forskudt mod venstre", ord: ["forskudt mod venstre"], x: 0, y: PL, maal: [0, PL], titel: true, dele: ["lille"],
              omr: [{ r: [KXS[0] - 5, KY - 5, KB + 10, KH + 10, 18], tom: true }],
              fejl: { "forskudt mod højre": "<b>forskudt mod højre</b> betyder meget produkt og en meget stor K. Her er K meget lille, og der er næsten kun reaktanter.",
                      ligevægtskonstant: "<b>ligevægtskonstant</b> er K. Pladsen spørger, hvor ligevægten ligger, når K er meget lille." } },
            { id: "forskudt mod højre", ord: ["forskudt mod højre"], x: 0, y: PL, maal: [0, PL], titel: true, dele: ["stor"],
              omr: [{ r: [KXS[1] - 5, KY - 5, KB + 10, KH + 10, 18], tom: true }],
              fejl: { "forskudt mod venstre": "<b>forskudt mod venstre</b> betyder meget reaktant og en meget lille K. Her er K meget stor, og der er næsten kun produkter.",
                      ligevægtskonstant: "<b>ligevægtskonstant</b> er K. Pladsen spørger, hvor ligevægten ligger, når K er meget stor." } }
        ],

        tegn: function (api) {
            B2.defs();
            /* Pladsernes bredde maales som i motoren, saa "ligevægten er" kan staa lige foran */
            B = 120;
            this.pladser.forEach(function (p) { p.ord.forEach(function (o) { B = Math.max(B, NK.tekstBredde(o, 18, 700) + 28); }); });
            B = Math.ceil(B);
            var self = this;
            /* Y = broek til venstre og Y = K til hoejre: stykkerne saettes efter deres maalte bredde */
            HB = Math.max(B2.bredde("[NO_2]^2", 34, 700), B2.bredde("[N_2O_4]", 34, 700)) / 2 + 8;
            var wY = B2.bredde("Y", 36, 700), wK = B2.bredde("K", 36, 700), wL = B2.bredde("=", 36, 700);
            BR.x = L.x + L.b / 2 + (wY + 14 + wL + 18) / 2;
            var yx = BR.x - HB - 18 - wL - 14 - wY;
            var gr = wY + 14 + wL + 14 + wK;
            KX = R.x + R.b / 2 - gr / 2 + wY + 14 + wL + 14;
            KM = [KX + wK / 2, EY - 13];
            var pb = this.pladser.filter(function (q) { return q.id === "reaktionsbrøk"; })[0];
            pb.omr = [{ r: [yx - 10, BR.y - 54, BR.x + HB + 8 - yx + 10, 106, 10] }];
            pb.x = BR.x - (BR.x - yx - HB) / 2;
            pb.maal = [pb.x, BR.y + 52];
            var pk = this.pladser.filter(function (q) { return q.id === "ligevægtskonstant"; })[0];
            pk.omr = [{ c: [KM[0], KM[1], 26] }];
            pk.maal = [KM[0], KM[1] + 26];
            pk.x = Math.min(KM[0], R.x + R.b - 16 - B / 2);
            [0, 1].forEach(function (k) {
                var p = self.pladser.filter(function (q) { return q.id === (k ? "forskudt mod højre" : "forskudt mod venstre"); })[0];
                p.x = pladsX(k);
                p.maal = [p.x, PL];
            });

            /* ----- Lag 1: ligevægtsloven -------------------------------------------- */
            api.del("ramme", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, R.x, R.y, R.b, R.h);
                    var cx = R.x + R.b / 2;
                    KV.tekst(g, cx, TY, "ved ligevægt", { fs: 18, farve: F.daempet });
                    var wY = B2.bredde("Y", 36, 700), wL = B2.bredde("=", 36, 700);
                    KV.tekst(g, KX - 14 - wL - 14, EY, "Y", { fs: 36, fed: true, anker: "end" });
                    KV.tekst(g, KX - 14, EY, "=", { fs: 36, fed: true, anker: "end" });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("broek", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, L.x, L.y, L.b, L.h);
                    var cx = L.x + L.b / 2;
                    KV.tekst(g, cx - 42, SY, "N_2O_4(g)", { fs: 21, fed: true, anker: "end" });
                    B2.dobbeltpil(g, cx - 30, cx + 18, SY - 7, F.blaek, 2.2, 9);
                    KV.tekst(g, cx + 30, SY, "2 NO_2(g)", { fs: 21, fed: true, anker: "start" });
                    KV.tekst(g, cx, TY, "på ethvert tidspunkt", { fs: 18, farve: F.daempet });
                    var gg = SV.g(g);
                    KV.tekst(gg, BR.x - HB - 18, EY, "=", { fs: 36, fed: true, anker: "end" });
                    KV.tekst(gg, BR.x - HB - 18 - B2.bredde("=", 36, 700) - 14, EY, "Y", { fs: 36, fed: true, anker: "end" });
                    KV.tekst(gg, BR.x, BR.y - 14, "[NO_2]^2", { fs: 34, fed: true, farve: F.accent });
                    SV.el("line", { x1: BR.x - HB, y1: BR.y, x2: BR.x + HB, y2: BR.y, stroke: F.blaek, "stroke-width": 2.6, "stroke-linecap": "round" }, gg);
                    KV.tekst(gg, BR.x, BR.y + 38, "[N_2O_4]", { fs: 34, fed: true, farve: "#2558c4" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.g, 100, 500); }
            });

            api.del("k", {
                lag: 0,
                fuld: function (g) {
                    var t = KV.tekst(g, KX, EY, "K", { fs: 36, fed: true, farve: F.serieB, anker: "start" });
                    return { t: t };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 500); }
            });

            /* ----- Lag 2: to kort med K meget lille og meget stor -------------------- */
            api.del("lille", { lag: 1, fuld: function (g) { kort(g, 0); return {}; }, byg: function (g, r, an) { an.fade(g, 0, 500); } });
            api.del("stor", { lag: 1, fuld: function (g) { kort(g, 1); return {}; }, byg: function (g, r, an) { an.fade(g, 0, 500); } });
        }
    };
}());
