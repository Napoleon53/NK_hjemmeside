/* =====================================================================
   fig_laegemidler.js - figuren til B8.1 Lægemidler og receptorer

   Foroven til venstre en hovedpinetablet: lægemiddel er titlen paa
   kortet, og virksomt stof peger paa den blaa del af en bjælke, der
   viser 500 mg af tablettens 600 mg (resten er hjælpestoffer). Til
   hoejre bogens b8-laegemidler: acetylsalicylsyre, paracetamol og
   ibuprofen med de farvede grupper og et navneskilt under hvert kort.
   Bogens linjer med gruppernes navne under molekylerne er taget af.
   Forneden bogens b8-receptor i tre kort: kroppens eget signalstof over
   en receptor med en tom bindingslomme, et stof i lommen med det gule
   signal (agonist) og et stof i lommen uden signal, mens signalstoffet
   ikke kan komme til (antagonist). Bogens tekster under kortene er
   taget af, fordi de bruger ordene receptor og lomme.
   Ti fagord i fire lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var B8 = NK.B8;
    var F = ORG.F;
    var C = B8.F;

    /* ----- Lag 1: tabletten ---------------------------------------------- */
    var KT = { x: 16, y: 26, b: 300, h: 278 };
    var TAB = { cx: KT.x + KT.b / 2, cy: 104, r: 66 };
    var BAR = { x: KT.x + 22, y: 206, b: KT.b - 44, h: 30 };
    var BLAA = BAR.b * 500 / 600;

    /* ----- Lag 2: de tre molekyler ---------------------------------------- */
    var KM = [
        { id: "acetylsalicylsyre", x: 332, b: 262 },
        { id: "paracetamol", x: 606, b: 262 },
        { id: "ibuprofen", x: 880, b: 264 }
    ];
    var MY = 26, MH = 278, Lm = 29;
    KM.forEach(function (k) { k.cx = k.x + k.b / 2; });
    var ASA = B8.asa(KM[0].cx - 14, 186, { L: Lm, ester: C.ester, syre: C.syre });
    var PAR = B8.paracetamol(KM[1].cx - 26, 174, { L: Lm, oh: C.hydroxy, amid: C.amid });
    var IBU = B8.ibuprofen(KM[2].cx - 10, 172, { L: Lm, syre: C.syre });

    /* ----- Lag 3 og 4: receptorerne --------------------------------------- */
    var RY = 350, RH = 336, YM = 600, RTOP = 510, RBUND = 648;
    var PA = { x: 16, y: RY, b: 504, h: RH };
    var PB = { x: 536, y: RY, b: 296, h: RH };
    var PC = { x: 848, y: RY, b: 296, h: RH };
    var RA = 268, RB = PB.x + PB.b / 2, RC = PC.x + PC.b / 2 - 34;
    var SIG = { x: 104, bund: 516 };
    var LB = B8.LOMME.b, LD = B8.LOMME.d;
    var KROP = [RA - 52, RTOP, 104, RBUND - RTOP];

    function navneplads(k, fejl) {
        return { id: k.id, ord: [k.id], x: k.cx, y: MY + MH, maal: [k.cx, MY + MH], titel: true, dele: ["mol-" + k.id],
            omr: [{ r: [k.x - 4, MY - 4, k.b + 8, MH + 8, 18], tom: true }], fejl: fejl };
    }

    NK.FIGURER.laegemidler = {
        vb: [1160, 700],
        lag: [
            { navn: "Tabletten", pladser: ["lægemiddel", "virksomt stof"],
              ros: "Tabletten er et lægemiddel. Det virksomme stof virker mod sygdommen, og resten er hjælpestoffer." },
            { navn: "Tre smertestillende stoffer", pladser: ["acetylsalicylsyre", "paracetamol", "ibuprofen"],
              ros: "Acetylsalicylsyre har en estergruppe, paracetamol en amidgruppe, og ibuprofen har en lang, upolær del." },
            { navn: "Receptoren", pladser: ["signalstof", "receptor", "bindingslomme"],
              ros: "Signalstoffet passer i receptorens bindingslomme. Receptoren er et protein i cellens membran." },
            { navn: "Stoffer i lommen", pladser: ["agonist", "antagonist"],
              ros: "En agonist tænder receptoren som signalstoffet. En antagonist sidder i lommen uden at tænde den." }
        ],
        pladser: [
            { id: "lægemiddel", ord: ["lægemiddel"], x: TAB.cx, y: KT.y, maal: [TAB.cx, KT.y], titel: true, dele: ["kortT"],
              omr: [{ r: [KT.x - 4, KT.y - 4, KT.b + 8, KT.h + 8, 18], tom: true }],
              fejl: { "virksomt stof": "<b>virksomt stof</b> er kun den del af tabletten, der virker. Overskriften gælder hele tabletten mod sygdom." } },
            { id: "virksomt stof", ord: ["virksomt stof"], x: BAR.x + BLAA / 2, y: KT.y + KT.h - 26, maal: [BAR.x + BLAA / 2, BAR.y + BAR.h + 2], dele: ["blaa"],
              omr: [{ r: [BAR.x - 3, BAR.y - 3, BLAA + 6, BAR.h + 6, 7] }],
              fejl: { "lægemiddel": "<b>lægemiddel</b> er hele tabletten mod sygdom. Pladsen peger kun på den del af tabletten, der virker mod sygdommen.",
                      paracetamol: "<b>paracetamol</b> er navnet på ét bestemt stof. Pladsen spørger, hvad den del af tabletten kaldes, der virker." } },

            navneplads(KM[0], {
                paracetamol: "<b>paracetamol</b> har OH på ringen og en gruppe med N. Molekylet over skiltet har en estergruppe og −COOH.",
                ibuprofen: "<b>ibuprofen</b> har −COOH og en lang kæde uden oxygen. Molekylet over skiltet har også en estergruppe.",
                "lægemiddel": "<b>lægemiddel</b> passer på alle tre stoffer. Skiltet spørger om navnet på netop dette molekyle." }),
            navneplads(KM[1], {
                acetylsalicylsyre: "<b>acetylsalicylsyre</b> har −COOH og en estergruppe. Molekylet over skiltet har OH på ringen og en gruppe med N.",
                ibuprofen: "<b>ibuprofen</b> har −COOH. Molekylet over skiltet har OH på ringen og en amidgruppe med N.",
                "lægemiddel": "<b>lægemiddel</b> passer på alle tre stoffer. Skiltet spørger om navnet på netop dette molekyle." }),
            navneplads(KM[2], {
                acetylsalicylsyre: "<b>acetylsalicylsyre</b> har også en estergruppe. Molekylet over skiltet har kun −COOH og en lang kæde uden oxygen.",
                paracetamol: "<b>paracetamol</b> har en gruppe med N. Molekylet over skiltet har −COOH og en lang kæde uden oxygen.",
                "lægemiddel": "<b>lægemiddel</b> passer på alle tre stoffer. Skiltet spørger om navnet på netop dette molekyle." }),

            { id: "signalstof", ord: ["signalstof"], x: SIG.x + 6, y: 382, maal: [SIG.x, SIG.bund - LD - 52], dele: ["signal"],
              omr: [{ r: [SIG.x - 46, SIG.bund - LD - 64, 92, LD + 70, 18] }],
              fejl: { receptor: "<b>receptor</b> er proteinet i membranen. Pladsen peger på det lille molekyle over membranen.",
                      agonist: "<b>agonist</b> er et andet stof, der ligner signalstoffet. Pladsen peger på det molekyle, cellen selv udskiller.",
                      bindingslomme: "<b>bindingslomme</b> er et hul i proteinet. Pladsen peger på det lille molekyle over membranen." } },
            { id: "bindingslomme", ord: ["bindingslomme"], x: RA, y: 442, maal: [RA, RTOP + LD - 6], dele: ["lomme"],
              omr: [{ r: [RA - LB / 2 - 6, RTOP - 6, LB + 12, LD + 12, 8] }],
              fejl: { receptor: "<b>receptor</b> er hele proteinet. Pladsen peger kun på hullet foroven, hvor et stof kan bindes.",
                      signalstof: "<b>signalstof</b> er molekylet til venstre. Pladsen peger på hullet i proteinet, hvor molekylet kan bindes." } },
            { id: "receptor", ord: ["receptor"], x: 412, y: 494, maal: [KROP[0] + KROP[2] - 2, 550], dele: ["receptorA"],
              omr: [{ r: [KROP[0] - 6, KROP[1] - 6, KROP[2] + 12, KROP[3] + 12, 24] }],
              fejl: { signalstof: "<b>signalstof</b> er det lille molekyle, som cellen udskiller. Pladsen peger på proteinet, der sidder i membranen.",
                      bindingslomme: "<b>bindingslomme</b> er kun hullet foroven. Pladsen peger på hele proteinet i membranen." } },

            { id: "agonist", ord: ["agonist"], x: PB.x + PB.b / 2, y: PB.y, maal: [PB.x + PB.b / 2, PB.y], titel: true, dele: ["agonist"],
              omr: [{ r: [PB.x - 4, PB.y - 4, PB.b + 8, PB.h + 8, 18], tom: true }],
              fejl: { antagonist: "<b>antagonist</b> tænder ikke receptoren. På dette kort lyser det gule signal under receptoren.",
                      signalstof: "<b>signalstof</b> er kroppens eget stof. På dette kort er det et andet stof, der sidder i lommen og giver signal." } },
            { id: "antagonist", ord: ["antagonist"], x: PC.x + PC.b / 2, y: PC.y, maal: [PC.x + PC.b / 2, PC.y], titel: true, dele: ["antagonist"],
              omr: [{ r: [PC.x - 4, PC.y - 4, PC.b + 8, PC.h + 8, 18], tom: true }],
              fejl: { agonist: "<b>agonist</b> tænder receptoren. På dette kort er der intet gult signal, og signalstoffet kan ikke bindes.",
                      signalstof: "<b>signalstof</b> er det orange molekyle. Pladsen er titlen på kortet med det grå stof, der sidder i lommen." } }
        ],

        tegn: function (api) {
            B8.defs();

            /* ----- Lag 1 ---------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KT.x, KT.y, KT.b, KT.h);
                    B8.tablet(g, TAB.cx, TAB.cy, TAB.r);
                    ORG.t(g, TAB.cx, 176, "hovedpinetablet, 0,6 g", { fs: 15, fed: true });
                    SV.el("rect", { x: BAR.x + BLAA, y: BAR.y, width: BAR.b - BLAA, height: BAR.h, rx: 0, fill: "#d5dbe1", stroke: "#9aa6b1", "stroke-width": 1.2 }, g);
                    ORG.t(g, BAR.x + BAR.b, BAR.y - 10, "hjælpestoffer, 100 mg", { fs: 13, farve: F.daempet, anker: "end" });
                }
            });
            api.del("blaa", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: BAR.x, y: BAR.y, width: BLAA, height: BAR.h, rx: 0, fill: "#3f74d6", stroke: "#1f4f9e", "stroke-width": 1.2 }, gg);
                    ORG.t(gg, BAR.x + BLAA / 2, BAR.y + 20, "500 mg", { fs: 15, fed: true, farve: "#ffffff" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("kortT", {
                lag: 0,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: KT.x, y: KT.y, width: KT.b, height: KT.h, rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            /* ----- Lag 2 ---------------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) { KM.forEach(function (k) { ORG.kortB(g, k.x, MY, k.b, MH); }); }
            });
            function molDel(k, m, bokse) {
                api.del("mol-" + k.id, {
                    lag: 1,
                    fuld: function (g) {
                        var gg = SV.g(g);
                        bokse.forEach(function (b) { var r = B8.omkring(m, b[0], [13, 15]); ORG.boks(gg, r[0], r[1], r[2], r[3], { farve: b[1], rx: 12 }); });
                        B8.tegnMol(gg, m, { fs: 18 });
                        return { g: gg };
                    },
                    byg: function (g, r, an) { an.pop(r.g, 0, 450); }
                });
            }
            molDel(KM[0], ASA, [[["O1", "Ce", "Oe", "Me"], C.ester], [["Cs", "Os", "OH"], C.syre]]);
            molDel(KM[1], PAR, [[["HO"], C.hydroxy], [["N", "H", "Ca", "Oa"], C.amid]]);
            molDel(KM[2], IBU, [[["Cs", "Os", "OH"], C.syre]]);

            /* ----- Lag 3 ---------------------------------------------------- */
            api.del("base3", {
                lag: 2, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, PA.x, PA.y, PA.b, PA.h);
                    B8.membran(g, PA.x + 1, PA.x + PA.b - 1, YM);
                }
            });
            api.del("signal", {
                lag: 2,
                fuld: function (g) { var gg = SV.g(g); B8.stof(gg, SIG.x, SIG.bund, "signal"); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("receptorA", {
                lag: 2,
                fuld: function (g) { var gg = SV.g(g); B8.receptor(gg, RA, RTOP, RBUND); return { g: gg }; },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("lomme", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("path", { d: "M" + (RA - LB / 2) + "," + (RTOP + 3) + " L" + (RA - LB / 2) + "," + (RTOP + LD - 8) + " Q" + (RA - LB / 2) + "," + (RTOP + LD) + " " + (RA - LB / 2 + 8) + "," + (RTOP + LD) +
                        " L" + (RA + LB / 2 - 8) + "," + (RTOP + LD) + " Q" + (RA + LB / 2) + "," + (RTOP + LD) + " " + (RA + LB / 2) + "," + (RTOP + LD - 8) + " L" + (RA + LB / 2) + "," + (RTOP + 3),
                        fill: "none", stroke: "#1f6f63", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.streg(r.g.firstChild, 0, 500); }
            });

            /* ----- Lag 4 ---------------------------------------------------- */
            api.del("base4", {
                lag: 3, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, PB.x, PB.y, PB.b, PB.h);
                    ORG.kortB(g, PC.x, PC.y, PC.b, PC.h);
                    B8.membran(g, PB.x + 1, PB.x + PB.b - 1, YM);
                    B8.membran(g, PC.x + 1, PC.x + PC.b - 1, YM);
                    ORG.t(g, PB.x + PB.b / 2, PB.y + 52, "Et andet stof giver signal.", { fs: 14, farve: F.daempet });
                    ORG.t(g, PC.x + PC.b / 2, PC.y + 52, "Et andet stof giver intet signal.", { fs: 14, farve: F.daempet });
                }
            });
            api.del("agonist", {
                lag: 3,
                fuld: function (g) {
                    var gg = SV.g(g);
                    B8.receptor(gg, RB, RTOP, RBUND, { gloed: true });
                    B8.stof(gg, RB, RTOP + LD, "agonist");
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("antagonist", {
                lag: 3,
                fuld: function (g) {
                    var gg = SV.g(g);
                    B8.receptor(gg, RC, RTOP, RBUND);
                    B8.stof(gg, RC, RTOP + LD, "antagonist");
                    B8.stof(gg, PC.x + PC.b - 52, 500, "signal");
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
        }
    };
}());
