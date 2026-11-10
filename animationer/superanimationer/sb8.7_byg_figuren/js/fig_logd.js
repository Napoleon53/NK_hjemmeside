/* =====================================================================
   fig_logd.js - figuren til B8.4 Log P og log D

   Foroven til venstre bogens b8-fordeling-octanol: skilletragten med
   octan-1-ol over vand og en lup paa graensen. I lag 2 kommer ionerne
   af syren til, og de er kun i vandet. I midten et kort med brøken for
   fordelingskonstanten og bogens eksempel (30,0), til hoejre et kort med
   brøken for fordelingsforholdet, hvor A⁻ tæller med i vandlaget. Begge
   ord er titler paa deres kort; bogens linje "log P = log K_F" er taget
   af, fordi den afsloerer pladsen log P.
   Forneden bogens b8-logp-skala med fem stoffer (log P er titlen paa
   kortet) og bogens b8-logd-kurve for acetylsalicylsyre, hvor log D er
   den lodrette akse. Bogens tekst "log D = log P = 1,2" er taget af.
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var KV = NK.KV;
    var LAB = NK.LAB;
    var B8 = NK.B8;
    var F = ORG.F;
    var f1 = B8.f1;

    var GUL = "#9a6a10", BLAA = "#1f5fbf";

    /* ----- Lag 1: skilletragten og fordelingskonstanten ------------------- */
    var KS = { x: 16, y: 24, b: 424, h: 280 };
    var TR = { cx: 106, top: 66 };
    var LUP = { x: 318, y: 156, r: 96 };
    var KK = { x: 456, y: 24, b: 328, h: 280 };
    var KD = { x: 800, y: 24, b: 344, h: 280 };

    /* Molekylerne i luppen: mange i octanol, faa i vand (lag 1) og ionerne,
       der kun er i vand (lag 2) */
    var MOL = [[-58, -50], [-20, -66], [24, -58], [60, -36], [-38, -22], [8, -28], [44, -12], [-70, -10], [-26, 40], [36, 56]];
    var IONER = [[-56, 30], [6, 22], [54, 30], [-6, 66], [-44, 66]];

    /* ----- Lag 1 og 2: skalaen og kurven ---------------------------------- */
    var KP = { x: 16, y: 336, b: 544, h: 288 };
    var SK = { x0: 54, x1: 522, y: 482, min: -4, max: 6 };
    function SX(v) { return SK.x0 + (SK.x1 - SK.x0) * (v - SK.min) / (SK.max - SK.min); }
    var STOFFER = [["glucose", -3.0, 418], ["paracetamol", 0.5, 418], ["acetylsalicylsyre", 1.2, 388], ["ibuprofen", 4.0, 418], ["vitamin A", 5.7, 388]];
    var KL = { x: 576, y: 336, b: 568, h: 288 };
    var G = { xa: 672, xb: 1116, ya: 408, yb: 578, xmax: 14, ymin: -5, ymax: 3 };
    function GX(v) { return G.xa + (G.xb - G.xa) * v / G.xmax; }
    function GY(v) { return G.yb - (G.yb - G.ya) * (v - G.ymin) / (G.ymax - G.ymin); }
    function logD(ph) { return 1.2 - Math.log(1 + Math.pow(10, ph - 3.5)) / Math.LN10; }
    var KURVE = [];
    for (var ph = 0; ph <= 9.62; ph += 0.2) KURVE.push([GX(ph), GY(logD(ph))]);
    KURVE.push([GX(9.7), GY(logD(9.7))]);

    /* Halvdelen af en cirkel over (op) eller under graensen */
    function halv(x, y, r, op) {
        return "M" + (x - r) + "," + y + " A" + r + "," + r + " 0 0," + (op ? 1 : 0) + " " + (x + r) + "," + y + " Z";
    }
    function molekyle(g, x, y) {
        SV.el("circle", { cx: x, cy: y, r: 7.5, fill: "url(#b8-orange)", stroke: "#b4661b", "stroke-width": 1.1 }, g);
    }
    function ion(g, x, y) {
        SV.el("circle", { cx: x, cy: y, r: 12, fill: "url(#b8-blaagloed)" }, g);
        SV.el("circle", { cx: x, cy: y, r: 7.5, fill: "url(#b8-orange)", stroke: "#b4661b", "stroke-width": 1.1 }, g);
        ORG.t(g, x + 9, y - 5, "−", { fs: 13, fed: true, farve: BLAA, anker: "start" });
    }

    /* En brøk i kortets skrift: x er venstre kant, y er stregen. Giver hoejre kant */
    function broek(g, x, y, over, under, fs, fo, fu) {
        var b = Math.max(NK.tekstBredde(over.replace(/[_^{}]/g, ""), fs, 700), NK.tekstBredde(under.replace(/[_^{}]/g, ""), fs, 700)) + 12;
        SV.tekst(g, x + b / 2, y - 9, over, { "font-size": fs, "font-weight": 700, fill: fo || F.blaek });
        SV.el("line", { x1: x, y1: y, x2: x + b, y2: y, stroke: F.blaek, "stroke-width": 1.8 }, g);
        SV.tekst(g, x + b / 2, y + fs + 4, under, { "font-size": fs, "font-weight": 700, fill: fu || F.blaek });
        return x + b;
    }

    function kortRamme(g, k) {
        return { r: SV.el("rect", { x: k.x, y: k.y, width: k.b, height: k.h, rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) };
    }
    function titelPlads(id, k, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y, maal: [k.x + k.b / 2, k.y], titel: true, dele: ["ramme-" + id],
            omr: [{ r: [k.x - 4, k.y - 4, k.b + 8, k.h + 8, 18], tom: true }], fejl: fejl };
    }

    NK.FIGURER.logd = {
        vb: [1160, 640],
        lag: [
            { navn: "Det uladede stof", pladser: ["fordelingskonstant", "log P"],
              ros: "Fordelingskonstanten er stoffet i octanol divideret med stoffet i vand. Log P er logaritmen til den." },
            { navn: "En syre ved forskellig pH", pladser: ["fordelingsforhold", "log D"],
              ros: "Fordelingsforholdet tæller ionen med i vandet. Derfor falder log D, når syren bliver til ioner ved høj pH." }
        ],
        pladser: [
            titelPlads("fordelingskonstant", KK, {
                fordelingsforhold: "<b>fordelingsforhold</b> skrives D og tæller ionen med i vandet. Kortet viser K<sub>F</sub> med samme stof i begge lag.",
                "log P": "<b>log P</b> er logaritmen til tallet. Kortet viser selve brøken med koncentrationerne i de to lag." }),
            titelPlads("log P", KP, {
                "log D": "<b>log D</b> afhænger af pH. Skalaen viser ét tal for hvert stof, og tallet gælder den uladede form.",
                fordelingskonstant: "<b>fordelingskonstant</b> er brøken med koncentrationerne. Skalaen viser logaritmen til den fra −4 til 6." }),

            titelPlads("fordelingsforhold", KD, {
                fordelingskonstant: "<b>fordelingskonstant</b> har kun den uladede form i vandet. Brøken på dette kort lægger ionen A⁻ med i vandlaget.",
                "log D": "<b>log D</b> er logaritmen til tallet. Kortet viser selve brøken med HA og A⁻." }),
            { id: "log D", ord: ["log D"], x: 800, y: 374, maal: [G.xa, G.ya + 18], dele: ["akse"],
              omr: [{ linje: [[G.xa, G.ya - 4], [G.xa, G.yb]], b: 18 }],
              fejl: { "log P": "<b>log P</b> er ét tal for stoffet. Grafen viser et tal, der ændrer sig med pH.",
                      fordelingsforhold: "<b>fordelingsforhold</b> er D selv. Aksen viser logaritmen til D fra −5 til 3." } }
        ],

        tegn: function (api) {
            B8.defs();

            /* ----- Lag 1 ---------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KS.x, KS.y, KS.b, KS.h);
                    var t = B8.skilletragt(g, TR.cx, TR.top, { b: 122, h: 156 });
                    ORG.t(g, TR.cx, t.oMidte + 5, "octan-1-ol", { fs: 13, fed: true, farve: GUL });
                    ORG.t(g, TR.cx, t.vMidte - 14, "vand", { fs: 13, fed: true, farve: BLAA });
                    /* holderen */
                    var hy = t.spids - 22, hb = t.bredde(hy) + 5;
                    SV.el("line", { x1: KS.x + 10, y1: hy, x2: TR.cx - hb, y2: hy, stroke: "#5c6873", "stroke-width": 4, "stroke-linecap": "round" }, g);
                    SV.el("ellipse", { cx: TR.cx, cy: hy, rx: hb, ry: 4, fill: "none", stroke: "#5c6873", "stroke-width": 3 }, g);
                    /* luppen paa graensen */
                    var fra = [TR.cx + 26, t.graense];
                    LAB.lup(g, LUP.x, LUP.y, LUP.r, fra);
                    SV.el("path", { d: halv(LUP.x, LUP.y, LUP.r - 2, true), fill: "url(#b8-octanol)" }, g);
                    SV.el("path", { d: halv(LUP.x, LUP.y, LUP.r - 2, false), fill: "url(#b8-vand)" }, g);
                    SV.el("line", { x1: LUP.x - LUP.r + 2, y1: LUP.y, x2: LUP.x + LUP.r - 2, y2: LUP.y, stroke: "#8aa4bb", "stroke-width": 1.4 }, g);
                    MOL.forEach(function (m) { molekyle(g, LUP.x + m[0], LUP.y + m[1]); });
                    SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r, fill: "none", stroke: "#b7c3cf", "stroke-width": 3 }, g);
                    ORG.t(g, LUP.x, LUP.y - LUP.r - 10, "upolært lag", { fs: 13, farve: GUL, fed: true });
                    ORG.t(g, LUP.x, LUP.y + LUP.r + 20, "polært lag", { fs: 13, farve: BLAA, fed: true });
                    molekyle(g, KS.x + 28, KS.y + KS.h - 18);
                    ORG.t(g, KS.x + 42, KS.y + KS.h - 13, "uladet molekyle", { fs: 13, farve: F.daempet, anker: "start" });

                    /* brøken for K_F */
                    ORG.kortB(g, KK.x, KK.y, KK.b, KK.h);
                    var x = KK.x + 24, y = KK.y + 110;
                    SV.tekst(g, x, y + 8, "K_{F} =", { "font-size": 24, "font-weight": 700, fill: F.blaek, "text-anchor": "start" });
                    broek(g, x + 72, y, "[stof i octanol]", "[stof i vand]", 19, GUL, BLAA);
                    y = KK.y + 204;
                    SV.tekst(g, x + 52, y + 8, "=", { "font-size": 24, "font-weight": 700, fill: F.blaek });
                    var xe = broek(g, x + 72, y, "0,0450 M", "0,00150 M", 19);
                    SV.tekst(g, xe + 10, y + 8, "= 30,0", { "font-size": 22, "font-weight": 700, fill: F.blaek, "text-anchor": "start" });

                    /* skalaen */
                    ORG.kortB(g, KP.x, KP.y, KP.b, KP.h);
                    var gr = SV.el("linearGradient", { id: KV.id("skala"), x1: 0, x2: 1, y1: 0, y2: 0 }, g);
                    SV.el("stop", { offset: "0", "stop-color": "#8fbfee" }, gr);
                    SV.el("stop", { offset: "0.5", "stop-color": "#eef2f0" }, gr);
                    SV.el("stop", { offset: "1", "stop-color": "#f1cf74" }, gr);
                    SV.el("rect", { x: SK.x0 - 10, y: SK.y - 10, width: SK.x1 - SK.x0 + 20, height: 20, rx: 10, fill: "url(#" + gr.getAttribute("id") + ")", stroke: "#b8c4cc", "stroke-width": 1.2 }, g);
                    for (var v = SK.min; v <= SK.max; v++) {
                        SV.el("line", { x1: SX(v), y1: SK.y + 10, x2: SX(v), y2: SK.y + 16, stroke: F.daempet, "stroke-width": 1.2 }, g);
                        ORG.t(g, SX(v), SK.y + 34, String(v).replace("-", "−"), { fs: 13, farve: F.daempet });
                    }
                    STOFFER.forEach(function (s) {
                        SV.el("line", { x1: SX(s[1]), y1: s[2] + 6, x2: SX(s[1]), y2: SK.y, stroke: "#7d8b96", "stroke-width": 1.2 }, g);
                        SV.el("circle", { cx: SX(s[1]), cy: SK.y, r: 5.5, fill: "#ffffff", stroke: F.blaek, "stroke-width": 1.8 }, g);
                        ORG.t(g, SX(s[1]), s[2], s[0], { fs: 14, fed: true });
                    });
                    ORG.t(g, KP.x + 26, KP.y + KP.h - 24, "hydrofil: mest i vand", { fs: 14, fed: true, farve: BLAA, anker: "start" });
                    ORG.t(g, KP.x + KP.b - 26, KP.y + KP.h - 24, "hydrofob: mest i fedt", { fs: 14, fed: true, farve: GUL, anker: "end" });
                }
            });
            api.del("ramme-fordelingskonstant", { lag: 0, fuld: function (g) { return kortRamme(g, KK); }, byg: function (g, r, an) { an.fade(g, 0, 450); } });
            api.del("ramme-log P", { lag: 0, fuld: function (g) { return kortRamme(g, KP); }, byg: function (g, r, an) { an.fade(g, 0, 450); } });

            /* ----- Lag 2 ---------------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    IONER.forEach(function (m) { ion(g, LUP.x + m[0], LUP.y + m[1]); });
                    ion(g, KS.x + 230, KS.y + KS.h - 18);
                    ORG.t(g, KS.x + 248, KS.y + KS.h - 13, "ion", { fs: 13, farve: F.daempet, anker: "start" });

                    /* brøken for D */
                    ORG.kortB(g, KD.x, KD.y, KD.b, KD.h);
                    var x = KD.x + 22, y = KD.y + 120;
                    SV.tekst(g, x, y + 8, "D =", { "font-size": 24, "font-weight": 700, fill: F.blaek, "text-anchor": "start" });
                    broek(g, x + 54, y, "[HA]_{octanol}", "[HA]_{vand} + [A^−]_{vand}", 19, GUL, BLAA);
                    ORG.t(g, KD.x + KD.b / 2, KD.y + 210, "HA er syren, og A⁻ er dens ion.", { fs: 14, farve: F.daempet });
                    ORG.t(g, KD.x + KD.b / 2, KD.y + 234, "Ionen går ikke over i octanol.", { fs: 14, farve: F.daempet });

                    /* kurven for acetylsalicylsyre */
                    ORG.kortB(g, KL.x, KL.y, KL.b, KL.h);
                    KV.flade(g, G.xa, G.ya - 8, G.xb + 8, G.yb);
                    var v;
                    for (v = G.ymin; v <= G.ymax; v++) {
                        KV.linje(g, G.xa, GY(v), G.xb + 8, GY(v), v === 0 ? F.daempet : KV.F.net, v === 0 ? 1.3 : 1);
                        KV.linje(g, G.xa - 5, GY(v), G.xa, GY(v), F.daempet, 1.2);
                        KV.tekst(g, G.xa - 10, GY(v) + 4.5, String(v).replace("-", "−"), { fs: 13, anker: "end", farve: F.daempet });
                    }
                    KV.linje(g, G.xa, G.yb, G.xb + 8, G.yb, F.daempet, 1.3);
                    for (v = 0; v <= G.xmax; v += 2) {
                        KV.linje(g, GX(v), G.yb, GX(v), G.yb + 5, F.daempet, 1.2);
                        KV.tekst(g, GX(v), G.yb + 20, String(v), { fs: 13, farve: F.daempet });
                    }
                    KV.tekst(g, (G.xa + G.xb) / 2, G.yb + 40, "pH", { fs: 13.5, farve: F.daempet });
                    KV.linje(g, GX(3.5), G.ya - 6, GX(3.5), G.yb, "#6b7780", 1.3, "5 4");
                    KV.tekst(g, GX(3.5) + 8, G.ya + 10, "pH = pKₛ = 3,5", { fs: 13, fed: true, farve: "#4b5560", anker: "start", halo: true });
                    KV.kurve(g, KURVE, "#b3362a", 3, { moerk: "#5a1a12" });
                    KV.punkt(g, GX(1.5), GY(logD(1.5)), "a", 6);
                    KV.tekst(g, GX(1.5) + 2, GY(logD(1.5)) + 24, "mavesæk", { fs: 13, fed: true, farve: F.accent, halo: true });
                    KV.punkt(g, GX(7.4), GY(logD(7.4)), "a", 6);
                    KV.tekst(g, GX(7.4) + 12, GY(logD(7.4)) + 4, "blod", { fs: 13, fed: true, farve: F.accent, anker: "start", halo: true });
                    KV.tekst(g, G.xb - 6, G.ya + 10, "acetylsalicylsyre", { fs: 14, fed: true, farve: "#b3362a", anker: "end", halo: true });
                }
            });
            api.del("ramme-fordelingsforhold", { lag: 1, fuld: function (g) { return kortRamme(g, KD); }, byg: function (g, r, an) { an.fade(g, 0, 450); } });
            api.del("akse", {
                lag: 1,
                fuld: function (g) {
                    return { l: SV.el("line", { x1: G.xa, y1: G.ya - 8, x2: G.xa, y2: G.yb, stroke: "#b3362a", "stroke-width": 3, "stroke-linecap": "round" }, g) };
                },
                byg: function (g, r, an) { an.streg(r.l, 0, 500); }
            });
        }
    };
}());
