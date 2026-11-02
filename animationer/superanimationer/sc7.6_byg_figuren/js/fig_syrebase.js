/* =====================================================================
   fig_syrebase.js - figuren til 7.1 Syrer og baser

   Tre bånd som bogens figurer i afsnittet:
   - Øverst hydronen (bogens figur hydron): et hydrogenatom afgiver sin
     elektron, og tilbage er H⁺, kun én proton.
   - I midten HCl + H₂O → Cl⁻ + H₃O⁺ (bogens figurer hcl-vand og
     syrebasepar) med en orange pil for hydronen, der overføres, og en
     klamme om H₂O og H₃O⁺. Syrer er røde og baser blå som i bogen.
   - Nederst vand, der både optager og afgiver en hydron (bogens figur
     amfolyt).
   Ordet hydron står ikke i figuren (der står H⁺), så det ikke afslører
   pladsen. Pladserne er brede, fordi korresponderende syre/base-par er
   det længste fagord i bogen, så de står i rækker over og under
   formlerne. Stregen fra syre går uden om hydronens pil med et knæk.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    /* Bånd 1: hydronen */
    var K1 = { x: 30, y: 56, b: 560, h: 150 };
    var AT = [130, 120], HP = [430, 120], SKAL = 46;

    /* Bånd 2: reaktionen */
    var FY = 392;                                       /* formlernes midte */
    var FX = { hcl: 150, h2o: 375, cl: 640, h3o: 860 };
    var PIL = [462, 548];
    var RA = 250, RB = 300, RC = 482;                   /* pladsernes rækker */
    var KL = FY + 44;                                   /* klammens vandrette streg */

    /* Bånd 3: vand begge veje */
    var BY = 600, BB = 120, BH = 64;
    var BX = { h3o: 150, vand: 450, oh: 800 };
    var RD = 690;

    function formelFelt(x, b) { return { r: [x - b / 2 - 8, FY - 28, b + 16, 50, 8] }; }
    function boksFelt(x) { return { r: [x - BB / 2 - 5, BY - BH / 2 - 5, BB + 10, BH + 10, 12] }; }

    NK.FIGURER.syrebase = {
        vb: [1000, 730],
        lag: [
            { navn: "Hydronen", pladser: ["hydron", "syre", "base"],
              ros: "HCl afgiver en hydron, H⁺, og er en syre. Vandet optager hydronen og er en base." },
            { navn: "Reaktionen", pladser: ["syre/base-reaktion", "oxoniumion", "korresponderende syre/base-par"],
              ros: "Når en hydron overføres, er det en syre/base-reaktion. H₂O og H₃O⁺ er et korresponderende syre/base-par." },
            { navn: "Vand begge veje", pladser: ["amfolyt", "hydroxidion"],
              ros: "Vand kan både optage og afgive en hydron og er en amfolyt. Når vand afgiver en hydron, er OH⁻ tilbage." }
        ],
        pladser: [
            /* ----- Lag 1: hydronen, syren og basen ------------------------------- */
            { id: "hydron", ord: ["hydron"], x: 790, y: HP[1], maal: [HP[0] + SKAL + 4, HP[1]], dele: ["hplus"],
              omr: [{ c: [HP[0], HP[1], SKAL + 6] }],
              fejl: { syre: "<b>syre</b> er et stof, der afgiver en hydron. Pladsen peger på selve partiklen H⁺, som er tilbage, når elektronen er væk.",
                      oxoniumion: "<b>oxoniumion</b> er H₃O⁺. Pladsen peger på H⁺, som kun er én proton.",
                      base: "<b>base</b> er et stof, der optager en hydron. Pladsen peger på selve partiklen H⁺." } },
            { id: "syre", ord: ["syre"], x: 192, y: RA, maal: [FX.hcl - 40, FY - 6], via: [FX.hcl - 66, FY - 50], dele: ["hcl"],
              omr: [formelFelt(FX.hcl, 66)],
              fejl: { base: "<b>base</b> optager en hydron. HCl afgiver sin hydron til vandet, som pilen viser.",
                      hydron: "<b>hydron</b> er kun partiklen H⁺. Pladsen peger på hele stoffet HCl, der afgiver den.",
                      oxoniumion: "<b>oxoniumion</b> er H₃O⁺ til højre for pilen. Pladsen peger på HCl." } },
            { id: "base", ord: ["base"], x: 192, y: RC, maal: [FX.h2o - 30, FY + 18], dele: ["h2o"],
              omr: [formelFelt(FX.h2o, 62)],
              fejl: { syre: "<b>syre</b> afgiver en hydron. Vandet her optager hydronen fra HCl, som pilen viser.",
                      amfolyt: "<b>amfolyt</b> passer også på vand, men ordet hører til nederst, hvor vandet gør begge dele. Her optager vandet en hydron.",
                      hydron: "<b>hydron</b> er kun partiklen H⁺. Pladsen peger på vandet, der optager den." } },

            /* ----- Lag 2: reaktionen --------------------------------------------- */
            { id: "syre/base-reaktion", ord: ["syre/base-reaktion"], x: 505, y: RB, maal: [(PIL[0] + PIL[1]) / 2, FY - 10], dele: ["pil"],
              omr: [{ r: [PIL[0] - 6, FY - 16, PIL[1] - PIL[0] + 12, 32, 8] }],
              fejl: { "korresponderende syre/base-par": "<b>korresponderende syre/base-par</b> er to stoffer. Pladsen peger på pilen, altså hele reaktionen, hvor hydronen overføres.",
                      hydron: "<b>hydron</b> er partiklen, der overføres. Pladsen peger på pilen, altså hele reaktionen." } },
            { id: "oxoniumion", ord: ["oxoniumion"], x: 808, y: RA, maal: [FX.h3o, FY - 30], dele: ["h3o"],
              omr: [formelFelt(FX.h3o, 74)],
              fejl: { hydron: "<b>hydron</b> er H⁺ alene. H₃O⁺ er et vandmolekyle, der har optaget en hydron.",
                      hydroxidion: "<b>hydroxidion</b> er OH⁻. Pladsen peger på H₃O⁺.",
                      syre: "<b>syre</b> passer også på H₃O⁺, men pladsen spørger om navnet på partiklen. Ordet syre hører til HCl." } },
            { id: "korresponderende syre/base-par", ord: ["korresponderende syre/base-par"], x: 700, y: RC, maal: [(FX.h2o + FX.h3o) / 2, KL + 3], dele: ["klamme"],
              omr: [{ r: [FX.h2o - 8, KL - 26, FX.h3o - FX.h2o + 16, 34, 6] }],
              fejl: { "syre/base-reaktion": "<b>syre/base-reaktion</b> er hele reaktionen. Klammen samler kun to stoffer, hvis formler er ens bortset fra én hydron.",
                      amfolyt: "<b>amfolyt</b> er ét stof. Klammen samler to stoffer, H₂O og H₃O⁺, hvis formler er ens bortset fra én hydron." } },

            /* ----- Lag 3: vand begge veje ---------------------------------------- */
            { id: "amfolyt", ord: ["amfolyt"], x: 420, y: RD, maal: [BX.vand, BY + BH / 2 + 4], dele: ["vandboks"],
              omr: [boksFelt(BX.vand)],
              fejl: { base: "<b>base</b> optager kun en hydron. Vandet her gør begge dele: det optager én og afgiver én.",
                      syre: "<b>syre</b> afgiver kun en hydron. Vandet her gør begge dele: det optager én og afgiver én.",
                      hydroxidion: "<b>hydroxidion</b> er OH⁻ til højre. Pladsen peger på vandet i midten." } },
            { id: "hydroxidion", ord: ["hydroxidion"], x: 806, y: RD, maal: [BX.oh, BY + BH / 2 + 4], dele: ["ohboks"],
              omr: [boksFelt(BX.oh)],
              fejl: { oxoniumion: "<b>oxoniumion</b> er H₃O⁺ til venstre. Pladsen peger på OH⁻, som er tilbage, når vand har afgivet en hydron.",
                      base: "<b>base</b> passer også på OH⁻, men pladsen spørger om navnet på partiklen. Ordet base hører til vandet i reaktionen.",
                      amfolyt: "<b>amfolyt</b> er vandet i midten, som kan begge dele. Pladsen peger på OH⁻." } }
        ],

        tegn: function (api) {
            LAB.gradienter();
            var formel = { "font-size": 34, "font-weight": 700 };

            /* ----- Bånd 1: hydrogenatomet afgiver sin elektron ------------------- */
            api.del("hatom", {
                lag: 0, auto: true,
                fuld: function (g) {
                    LAB.kort(g, K1.x, K1.y, K1.b, K1.h);
                    SV.el("circle", { cx: AT[0], cy: AT[1], r: SKAL, fill: "#f2f6fa", stroke: "#b8c4d2", "stroke-width": 2 }, g);
                    SV.kugle(g, AT[0], AT[1], 15, "proton", "+");
                    SV.kugle(g, AT[0] + SKAL * 0.71, AT[1] - SKAL * 0.71, 8, "elektron", "−");
                    LAB.pil(g, 200, 340, AT[1], { farve: "#3b4650" });
                    SV.tekst(g, 270, AT[1] - 12, "afgiver elektronen", { "font-size": 14, fill: F.svag });
                    SV.tekst(g, AT[0], K1.y + K1.h - 14, "hydrogenatom, H", { "font-size": 15, "font-weight": 700 });
                }
            });

            api.del("hplus", {
                lag: 0,
                fuld: function (g) {
                    SV.el("circle", { cx: HP[0], cy: HP[1], r: SKAL, fill: "none", stroke: "#9aa7b4", "stroke-width": 1.6, "stroke-dasharray": "5 5" }, g);
                    var k = SV.kugle(g, HP[0], HP[1], 15, "proton", "+");
                    SV.tekst(g, HP[0], K1.y + K1.h - 14, "H^+, kun 1 proton", { "font-size": 15, "font-weight": 700 });
                    return { k: k };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.k, 150, 450); }
            });

            /* ----- Bånd 2: HCl giver sin hydron til vand ------------------------- */
            api.del("r0", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.tekst(g, (FX.hcl + FX.h2o) / 2, FY + 12, "+", { "font-size": 30, fill: F.svag });
                    /* Hydronen hopper fra H i HCl over til vandet */
                    var x1 = FX.hcl - 14, x2 = FX.h2o - 14, y = FY - 26;
                    SV.el("path", { d: "M" + x1 + "," + y + " C" + x1 + "," + (y - 36) + " " + x2 + "," + (y - 36) + " " + x2 + "," + (y - 8),
                        fill: "none", stroke: LAB.HYDRON, "stroke-width": 2.4, "stroke-linecap": "round" }, g);
                    SV.el("polygon", { points: x2 + "," + (y - 1) + " " + (x2 - 5.5) + "," + (y - 11) + " " + (x2 + 5.5) + "," + (y - 11), fill: LAB.HYDRON }, g);
                    SV.tekst(g, (x1 + x2) / 2, y - 32, "H^+", { "font-size": 15, "font-weight": 700, fill: LAB.HYDRON });
                }
            });

            function formelDel(id, lag, x, tekst, farve) {
                api.del(id, {
                    lag: lag,
                    fuld: function (g) { return { t: SV.tekst(g, x, FY + 12, tekst, Object.assign({ fill: farve }, formel)) }; },
                    byg: function (g, r, an) { an.pop(r.t, 0, 450); }
                });
            }
            formelDel("hcl", 0, FX.hcl, "HCl", LAB.SYRE);
            formelDel("h2o", 0, FX.h2o, "H_2O", LAB.BASE);

            api.del("pil", {
                lag: 1,
                fuld: function (g) { return { p: LAB.pil(g, PIL[0], PIL[1], FY, { farve: "#1f2a33", bredde: 2.8 }) }; },
                byg: function (g, r, an) { an.pop(r.p, 0, 450); }
            });

            api.del("cl", {
                lag: 1, auto: true,
                fuld: function (g) {
                    SV.tekst(g, FX.cl, FY + 12, "Cl^−", Object.assign({ fill: LAB.BASE }, formel));
                    SV.tekst(g, (FX.cl + FX.h3o) / 2 - 4, FY + 12, "+", { "font-size": 30, fill: F.svag });
                }
            });
            formelDel("h3o", 1, FX.h3o, "H_3O^+", LAB.SYRE);

            api.del("klamme", {
                lag: 1,
                fuld: function (g) {
                    return { k: SV.el("path", { d: "M" + FX.h2o + "," + (FY + 24) + " L" + FX.h2o + "," + KL + " L" + FX.h3o + "," + KL + " L" + FX.h3o + "," + (FY + 24),
                        fill: "none", stroke: F.teal, "stroke-width": 2.4, "stroke-linejoin": "round" }, g) };
                },
                byg: function (g, r, an) { an.streg(r.k, 0, 700); }
            });

            /* ----- Bånd 3: vand optager og afgiver en hydron ---------------------- */
            function boks(g, x, tekst, f) {
                SV.el("rect", { x: x - BB / 2, y: BY - BH / 2, width: BB, height: BH, rx: 10, fill: f.fyld, stroke: f.kant, "stroke-width": 1.8 }, g);
                return SV.tekst(g, x, BY + 10, tekst, { "font-size": 26, "font-weight": 700, fill: f.tekst });
            }

            api.del("amf", {
                lag: 2, auto: true,
                fuld: function (g) {
                    boks(g, BX.h3o, "H_3O^+", LAB.POS);
                    LAB.pil(g, BX.vand - BB / 2 - 8, BX.h3o + BB / 2 + 8, BY, { farve: "#1f2a33" });
                    LAB.pil(g, BX.vand + BB / 2 + 8, BX.oh - BB / 2 - 8, BY, { farve: "#1f2a33" });
                    SV.tekst(g, (BX.h3o + BX.vand) / 2, BY - 12, "optager H^+", { "font-size": 15, "font-weight": 700, fill: LAB.BASE });
                    SV.tekst(g, (BX.vand + BX.oh) / 2, BY - 12, "afgiver H^+", { "font-size": 15, "font-weight": 700, fill: LAB.SYRE });
                }
            });

            api.del("vandboks", {
                lag: 2,
                fuld: function (g) { return { t: boks(g, BX.vand, "H_2O", { fyld: "#e3f2f0", kant: "#0f766e", tekst: "#14201f" }) }; },
                byg: function (g, r, an) { an.pop(g, 0, 450); }
            });

            api.del("ohboks", {
                lag: 2,
                fuld: function (g) { return { t: boks(g, BX.oh, "OH^−", LAB.NEG) }; },
                byg: function (g, r, an) { an.pop(g, 0, 450); }
            });
        }
    };
}());
