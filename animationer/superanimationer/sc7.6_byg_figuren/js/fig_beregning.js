/* =====================================================================
   fig_beregning.js - figuren til 7.4 pH-beregninger

   Bogens eksempel "pH i en opløsning af natriumhydroxid" som en
   superberegning i tre trin: [OH⁻] = c(NaOH), vands ionprodukt og
   [H₃O⁺] med brøkstreger, og pH = −log₁₀[H₃O⁺] = 12,00 med en
   konklusion. Lighedstegnene står under hinanden.
   7.4 har kun ét fagord, vands ionprodukt. Brugeren 1. nov. 2026 bad om
   ord, der er værd at træne, selv om de ikke er fagord ("ala log" og
   "den aktuelle koncentration af oxonium"), så pladserne er også log,
   aktuel koncentration af oxonium og af hydroxid og pH fra 7.3.
   pH og log står som en streg i den grå udgave og kommer frem, når
   pladsen er løst, så teksten ikke afslører pladserne (som afvigelsen i
   sc6.4). Pladserne står til venstre, fordi de lange ord gør dem brede.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var FS = 19;                                        /* skriften i beregningen */
    var XL = 560, XE = 581, XR = 600;                   /* venstresidens højre kant, =, højresiden */
    var TX = 430;                                       /* trinenes og overskriftens venstre kant */
    var R1 = 144, R2a = 222, R2b = 276, R2c = 328, R3 = 404, R4 = 520;
    var LOG_Y = 464;

    /* Bredden af en formel med sænkede og hævede tal (som SV.formelInd) */
    function W(s, fs) {
        fs = fs || FS;
        var re = /([_^])(\{[^}]*\}|[0-9+−\-]+)/g, b = 0, sidst = 0, m;
        while ((m = re.exec(s)) !== null) {
            b += NK.tekstBredde(s.slice(sidst, m.index), fs, 400);
            b += 0.68 * NK.tekstBredde(m[2].replace(/[{}]/g, ""), fs, 400);
            sidst = re.lastIndex;
        }
        return b + NK.tekstBredde(s.slice(sidst), fs, 400);
    }
    function t(g, x, y, s, o) { return SV.tekst(g, x, y, s, Object.assign({ "font-size": FS, "text-anchor": "start" }, o || {})); }
    function broek(g, x, yc, over, under) {
        var b = Math.max(W(over), W(under)) + 12;
        SV.tekst(g, x + b / 2, yc - 8, over, { "font-size": FS });
        SV.el("line", { x1: x, y1: yc, x2: x + b, y2: yc, stroke: F.tekst, "stroke-width": 1.4 }, g);
        SV.tekst(g, x + b / 2, yc + FS + 3, under, { "font-size": FS });
        return x + b;
    }

    /* Positionerne i trin 3: pH = −log₁₀[H₃O⁺] = −log₁₀(1,0 · 10⁻¹²) = 12,00 */
    var WLOG = W("log_10"), WPH = W("pH");
    var L1 = XR + W("−"), L1e = L1 + WLOG;
    /* SVG tæller ikke et mellemrum i starten af en tekst med, så stykket
       efter log₁₀ står 3 enheder fra og har intet mellemrum foran */
    var MID = "[H_3O^+] = −";
    var L2 = L1e + 3 + W(MID) + 2, L2e = L2 + WLOG;
    var KONK = "Konklusion: Den fortyndede afløbsrens har ";
    var KX = TX + W(KONK, 17);

    var LV = { oh: W("[OH^−]"), ion: W("[H_3O^+] · [OH^−]"), h3o: W("[H_3O^+]") };
    function venstreFelt(w, y) { return { r: [XL - w - 6, y - 22, w + 12, 32, 6] }; }

    NK.FIGURER.beregning = {
        vb: [1100, 556],
        lag: [
            { navn: "Koncentrationerne", pladser: ["aktuel koncentration af hydroxid", "vands ionprodukt", "aktuel koncentration af oxonium"],
              ros: "[OH⁻] er det samme som c(NaOH). Vands ionprodukt giver så [H₃O⁺], den aktuelle koncentration af oxonium." },
            { navn: "Fra koncentration til pH", pladser: ["pH", "log"],
              ros: "pH regnes ud som −log₁₀[H₃O⁺]. Tasten log giver −12,00 for 1,0 · 10⁻¹², så pH er 12,00." }
        ],
        pladser: [
            { id: "aktuel koncentration af hydroxid", ord: ["aktuel koncentration af hydroxid"], x: 192, y: R1, maal: [XL - LV.oh - 8, R1 - 6], dele: ["oh"],
              omr: [venstreFelt(LV.oh, R1)],
              fejl: { "aktuel koncentration af oxonium": "<b>aktuel koncentration af oxonium</b> skrives [H₃O⁺]. Pladsen peger på [OH⁻].",
                      "vands ionprodukt": "<b>vands ionprodukt</b> er de to koncentrationer ganget med hinanden. Pladsen peger kun på [OH⁻]." } },
            { id: "vands ionprodukt", ord: ["vands ionprodukt"], x: 192, y: R2a, maal: [XL - LV.ion - 8, R2a - 6], dele: ["ion"],
              omr: [{ r: [XL - LV.ion - 8, R2a - 24, LV.ion + 8 + (XR - XL) + W("1,0 · 10^−14 M^2") + 12, 34, 6] }],
              fejl: { "aktuel koncentration af hydroxid": "<b>aktuel koncentration af hydroxid</b> er kun [OH⁻]. Pladsen peger på hele linjen, hvor to koncentrationer ganges.",
                      "aktuel koncentration af oxonium": "<b>aktuel koncentration af oxonium</b> er kun [H₃O⁺]. Pladsen peger på hele linjen, hvor to koncentrationer ganges.",
                      pH: "<b>pH</b> regnes ud med log i trin 3. Linjen her ganger to koncentrationer med hinanden." } },
            { id: "aktuel koncentration af oxonium", ord: ["aktuel koncentration af oxonium"], x: 192, y: R2b, maal: [XL - LV.h3o - 8, R2b - 6], dele: ["h3o"],
              omr: [venstreFelt(LV.h3o, R2b)],
              fejl: { "aktuel koncentration af hydroxid": "<b>aktuel koncentration af hydroxid</b> skrives [OH⁻]. Pladsen peger på [H₃O⁺].",
                      pH: "<b>pH</b> er et tal uden enhed. [H₃O⁺] måles i M og er her 1,0 · 10⁻¹² M.",
                      "vands ionprodukt": "<b>vands ionprodukt</b> er linjen ovenover, hvor to koncentrationer ganges. Pladsen peger kun på [H₃O⁺]." } },

            { id: "pH", ord: ["pH"], x: 192, y: R3, maal: [XL - WPH - 8, R3 - 6], dele: ["ph"],
              omr: [venstreFelt(WPH, R3), { r: [KX - 4, R4 - 22, W("pH", 17) + 8, 30, 6] }],
              fejl: { "aktuel koncentration af oxonium": "<b>aktuel koncentration af oxonium</b> skrives [H₃O⁺] og måles i M. Pladsen er tallet uden enhed, som regnes ud.",
                      log: "<b>log</b> er tasten, der bruges på koncentrationen. Pladsen står foran lighedstegnet og er det, der regnes ud." } },
            { id: "log", ord: ["log"], x: 740, y: LOG_Y, maal: [L1 + WLOG / 2, R3 + 10], dele: ["log"],
              omr: [{ r: [L1 - 4, R3 - 22, WLOG + 8, 32, 6] }, { r: [L2 - 4, R3 - 22, WLOG + 8, 32, 6] }],
              fejl: { pH: "<b>pH</b> er det, der regnes ud, til venstre for lighedstegnet. Pladsen er tasten, der bruges på koncentrationen.",
                      "vands ionprodukt": "<b>vands ionprodukt</b> er [H₃O⁺] · [OH⁻] i trin 2. Pladsen er tasten, der bruges på koncentrationen." } }
        ],

        tegn: function (api) {
            /* ----- Opgaven og trin 1 og 2 ------------------------------------------ */
            api.del("hoved", {
                lag: 0, auto: true,
                fuld: function (g) {
                    t(g, TX, 52, "Afløbsrens med c(NaOH) = 0,010 M", { "font-size": 18, "font-weight": 700 });
                    t(g, TX, 76, "Natriumhydroxid, NaOH, er en stærk base.", { "font-size": 15, fill: F.svag });
                    t(g, TX, R1 - 32, "Trin 1", { "font-size": 14, "font-weight": 700, fill: F.teal });
                    t(g, TX, R2a - 32, "Trin 2", { "font-size": 14, "font-weight": 700, fill: F.teal });
                    /* Trin 1: [OH⁻] = c(NaOH) = 0,010 M */
                    t(g, XE, R1, "=");
                    t(g, XR, R1, "c(NaOH) = 0,010 M");
                    /* Trin 2: [H₃O⁺] med brøkstreger */
                    t(g, XE, R2b + 6, "=");
                    var x = broek(g, XR, R2b, "1,0 · 10^−14 M^2", "[OH^−]");
                    t(g, x + 10, R2b + 6, "=");
                    broek(g, x + 34, R2b, "1,0 · 10^−14 M^2", "0,010 M");
                    t(g, XE, R2c + 6, "=");
                    t(g, XR, R2c + 6, "1,0 · 10^−12 M", { "font-weight": 700 });
                }
            });

            api.del("oh", {
                lag: 0,
                fuld: function (g) { return { t: t(g, XL, R1, "[OH^−]", { "text-anchor": "end", fill: F.teal }) }; },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });

            api.del("ion", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    t(gg, XL, R2a, "[H_3O^+] · [OH^−]", { "text-anchor": "end", fill: F.teal });
                    t(gg, XE, R2a, "=", { fill: F.teal });
                    t(gg, XR, R2a, "1,0 · 10^−14 M^2", { fill: F.teal });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            api.del("h3o", {
                lag: 0,
                fuld: function (g) { return { t: t(g, XL, R2b + 6, "[H_3O^+]", { "text-anchor": "end", fill: F.teal }) }; },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });

            /* ----- Trin 3 og konklusionen ------------------------------------------ */
            api.del("r3", {
                lag: 1, auto: true,
                fuld: function (g) {
                    t(g, TX, R3 - 32, "Trin 3", { "font-size": 14, "font-weight": 700, fill: F.teal });
                    t(g, XE, R3, "=");
                    t(g, XR, R3, "−");
                    t(g, L1e + 3, R3, MID);
                    t(g, L2e, R3, "(1,0 · 10^−12) = 12,00");
                    t(g, TX, R4, KONK, { "font-size": 17 });
                    t(g, KX + W("pH", 17) + 5, R4, "12,00.", { "font-size": 17 });
                }
            });

            /* pH og log: en streg i den grå udgave, ordet når pladsen er løst */
            function ordEllerStreg(g, x, y, ord, b, fs, anker) {
                if (g.getAttribute("class") === "spoeg") {
                    var x0 = anker === "end" ? x - b : x;
                    return SV.el("line", { x1: x0, y1: y + 4, x2: x0 + b, y2: y + 4, stroke: F.svag, "stroke-width": 1.4 }, g);
                }
                return t(g, x, y, ord, { "font-size": fs, "text-anchor": anker || "start", fill: F.teal });
            }

            api.del("ph", {
                lag: 1,
                fuld: function (g) {
                    return { a: ordEllerStreg(g, XL, R3, "pH", WPH, FS, "end"), b: ordEllerStreg(g, KX, R4, "pH", W("pH", 17), 17) };
                },
                byg: function (g, r, an) { an.pop(r.a, 0, 450); an.pop(r.b, 150, 450); }
            });

            api.del("log", {
                lag: 1,
                fuld: function (g) {
                    return { a: ordEllerStreg(g, L1, R3, "log_10", WLOG, FS), b: ordEllerStreg(g, L2, R3, "log_10", WLOG, FS) };
                },
                byg: function (g, r, an) { an.pop(r.a, 0, 450); an.pop(r.b, 150, 450); }
            });
        }
    };
}());
