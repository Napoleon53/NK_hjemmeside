/* =====================================================================
   fig_syrebase.js - figuren til B8.3 Lægemidler som syrer og baser

   Foroven bogens b8-syre-base-former for acetylsalicylsyre: den uladede
   form og ionen med den blaa gloed om O⁻. carboxylgruppe peger paa −COOH
   og estergruppe (B4.5) paa estergruppen i samme molekyle, saa eleven
   skal skelne de to grupper.
   Forneden bogens b8-salt-oploeselighed: amfetamin + HCl → amfetamins ion
   og Cl⁻. aminogruppe peger paa −NH₂, og hydrochlorid peger paa rammen om
   produkterne. Bogens navn "amfetamins ion" er taget af.
   Tre fagord og ét ord fra B4 i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var B8 = NK.B8;
    var F = ORG.F;
    var C = B8.F;

    /* ----- Lag 1: syren -------------------------------------------------- */
    var KS = { x: 16, y: 24, b: 1128, h: 250 };
    var ASA = B8.asa(300, 188);
    var ION = B8.asa(800, 188, { ion: true });
    var ESTER = B8.omkring(ASA, ["O1", "Ce", "Oe", "Me"], [14, 15]);
    var COOH = B8.omkring(ASA, ["Cs", "Os", "OH"], [14, 15]);
    var PIL1 = { x1: 500, x2: 620, y: 170 };

    /* ----- Lag 2: basen og saltet --------------------------------------- */
    var KB = { x: 16, y: 306, b: 1128, h: 250 };
    var AMF = B8.amfetamin(140, 460);
    var AION = B8.amfetamin(650, 460, { ion: true });
    var NH2 = B8.omkring(AMF, ["N"], [12, 14]);
    var PIL2 = { x1: 430, x2: 530, y: 442 };
    var CL = [930, 426];
    var SALT = [586, 370, 400, 128];

    NK.FIGURER.syrebase = {
        vb: [1160, 574],
        lag: [
            { navn: "Syren", pladser: ["carboxylgruppe", "estergruppe"],
              ros: "Acetylsalicylsyre har en estergruppe og en carboxylgruppe. Carboxylgruppen gør stoffet til en syre." },
            { navn: "Basen", pladser: ["aminogruppe", "hydrochlorid"],
              ros: "Aminogruppen gør amfetamin til en base. Med saltsyre dannes et hydrochlorid, som er letopløseligt i vand." }
        ],
        pladser: [
            { id: "estergruppe", ord: ["estergruppe"], x: 122, y: 84, maal: [ESTER[0] - 1, ESTER[1] + ESTER[3] / 2], dele: ["ester"],
              omr: [{ r: [ESTER[0], ESTER[1], ESTER[2], ESTER[3], 12] }],
              fejl: { carboxylgruppe: "<b>carboxylgruppe</b> er −COOH med OH for enden. Pladsen peger på gruppen, hvor O sidder mellem to carbonatomer.",
                      aminogruppe: "<b>aminogruppe</b> er −NH₂ med nitrogen. Pladsen peger på en gruppe i acetylsalicylsyre med to O." } },
            { id: "carboxylgruppe", ord: ["carboxylgruppe"], x: 450, y: 74, maal: [COOH[0] + COOH[2] / 2, COOH[1] - 1], dele: ["cooh"],
              omr: [{ r: [COOH[0], COOH[1], COOH[2], COOH[3], 12] }],
              fejl: { estergruppe: "<b>estergruppe</b> er −COO− mellem to carbonatomer. Pladsen peger på gruppen −COOH, som kan afgive H⁺.",
                      aminogruppe: "<b>aminogruppe</b> er −NH₂. Pladsen peger på gruppen −COOH i acetylsalicylsyre." } },

            { id: "aminogruppe", ord: ["aminogruppe"], x: 236, y: 350, maal: [NH2[0] + NH2[2] / 2, NH2[1] - 1], dele: ["nh2"],
              omr: [{ r: [NH2[0], NH2[1], NH2[2], NH2[3], 12] }],
              fejl: { carboxylgruppe: "<b>carboxylgruppe</b> er −COOH. Pladsen peger på gruppen med N i amfetamin.",
                      hydrochlorid: "<b>hydrochlorid</b> er saltet, der dannes med saltsyre. Pladsen peger kun på gruppen −NH₂ i amfetamin.",
                      estergruppe: "<b>estergruppe</b> har to O. Pladsen peger på gruppen med N i amfetamin." } },
            { id: "hydrochlorid", ord: ["hydrochlorid"], x: SALT[0] + SALT[2] / 2, y: 344, maal: [SALT[0] + SALT[2] / 2, SALT[1] - 1], dele: ["salt"],
              omr: [{ r: [SALT[0], SALT[1], SALT[2], SALT[3], 16], tom: true }],
              fejl: { aminogruppe: "<b>aminogruppe</b> er kun −NH₂. Pladsen peger på saltet til højre for pilen, som er dannet med saltsyre.",
                      carboxylgruppe: "<b>carboxylgruppe</b> er −COOH. Pladsen peger på saltet af amfetamins ion og Cl⁻." } }
        ],

        tegn: function (api) {
            B8.defs();

            /* ----- Lag 1 ---------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KS.x, KS.y, KS.b, KS.h);
                    ORG.t(g, KS.x + KS.b - 24, KS.y + 32, "En syre: acetylsalicylsyre", { fs: 17, fed: true, farve: F.accent, anker: "end" });
                    ORG.t(g, KS.x + KS.b - 24, KS.y + 54, "pKₛ = 3,5", { fs: 14, farve: F.daempet, anker: "end" });
                    var o = ION.p("OH");
                    B8.gloed(g, o[0] + 12, o[1], 30, "neg");
                    B8.tegnMol(g, ASA, { fs: 19 });
                    B8.tegnMol(g, ION, { fs: 19 });
                    ORG.reaktionspil(g, PIL1.x1, PIL1.x2, PIL1.y, { lig: true });
                    ORG.t(g, (PIL1.x1 + PIL1.x2) / 2, PIL1.y - 16, "afgiver H⁺", { fs: 14, fed: true });
                    ORG.t(g, (PIL1.x1 + PIL1.x2) / 2, PIL1.y + 28, "optager H⁺", { fs: 14, fed: true });
                    ORG.t(g, 300, KS.y + KS.h - 16, "uladet ved lav pH", { fs: 14, farve: F.daempet });
                    ORG.t(g, 800, KS.y + KS.h - 16, "negativ ion ved høj pH", { fs: 14, farve: F.daempet });
                }
            });
            api.del("ester", {
                lag: 0,
                fuld: function (g) { return { r: ORG.boks(g, ESTER[0], ESTER[1], ESTER[2], ESTER[3], { farve: C.ester }) }; },
                byg: function (g, r, an) { an.pop(r.r, 0, 450); }
            });
            api.del("cooh", {
                lag: 0,
                fuld: function (g) { return { r: ORG.boks(g, COOH[0], COOH[1], COOH[2], COOH[3], { farve: C.syre }) }; },
                byg: function (g, r, an) { an.pop(r.r, 0, 450); }
            });

            /* ----- Lag 2 ---------------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KB.x, KB.y, KB.b, KB.h);
                    ORG.t(g, KB.x + KB.b - 24, KB.y + 32, "En base: amfetamin", { fs: 17, fed: true, farve: F.accent, anker: "end" });
                    var n = AION.p("N");
                    B8.gloed(g, n[0] + 24, n[1], 32, "pos");
                    B8.gloed(g, CL[0], CL[1], 30, "neg");
                    B8.tegnMol(g, AMF, { fs: 19 });
                    ORG.plus(g, 340, PIL2.y);
                    ORG.f(g, 380, PIL2.y, "HCl");
                    ORG.reaktionspil(g, PIL2.x1, PIL2.x2, PIL2.y);
                    B8.tegnMol(g, AION, { fs: 19 });
                    ORG.plus(g, 870, PIL2.y);
                    ORG.f(g, CL[0], CL[1], "Cl^−", { farve: C.neg });
                    ORG.t(g, 190, KB.y + KB.h - 34, "uladet", { fs: 14, farve: F.daempet });
                    ORG.t(g, 190, KB.y + KB.h - 16, "tungtopløselig i vand", { fs: 14, farve: F.daempet });
                    ORG.t(g, SALT[0] + SALT[2] / 2, KB.y + KB.h - 34, "ladet", { fs: 14, farve: F.daempet });
                    ORG.t(g, SALT[0] + SALT[2] / 2, KB.y + KB.h - 16, "letopløselig i vand", { fs: 14, farve: F.daempet });
                }
            });
            api.del("nh2", {
                lag: 1,
                fuld: function (g) { return { r: ORG.boks(g, NH2[0], NH2[1], NH2[2], NH2[3], { farve: C.amid }) }; },
                byg: function (g, r, an) { an.pop(r.r, 0, 450); }
            });
            api.del("salt", {
                lag: 1,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: SALT[0], y: SALT[1], width: SALT[2], height: SALT[3], rx: 16, fill: "rgba(15,118,110,0.05)", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
        }
    };
}());
