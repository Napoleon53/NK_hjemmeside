/* =====================================================================
   serie.js - sb2.4 som tegneserie

   Rammen staar i ../../laboratoriet/js/tegneserie.js: ruden, udsnittet af
   tegnebordet, oejebliksbilledet, pilen, etiketten og skemaet. Her staar
   kun, HVILKE ruder sb2.4 har, og teksterne staar i js/tekst.js under
   noeglen "serie".

   Ruderne bygges af elevens egne journalposter. Hver post i journalen
   "billede" har en opskrift paa det, der stod i glasset, da der blev
   trykket, og hver post i "fortynding" har de to glas' opskrifter og
   deres lysveje. Ruden tegnes af DEM og ikke af bordet, som det ser ud
   nu: haelder eleven glassene ud bagefter, staar tegneserien stadig med
   det, han saa.

   Og hvad glasset FIK, staar ingen steder. Det er med vilje - motoren
   spoerger altid, hvad der ER, aldrig hvordan man kom dertil. Indgrebet
   laeses derfor ud af oejebliksbilledet: er der Fe²⁺, har glasset faaet
   ascorbinsyre; er der AgSCN(s), har det faaet soelv; er der mere jern i
   alt end i glas 7, har det faaet Fe(NO₃)₃. Tog eleven en anden vej, end
   trinnet foreslog, staar der stadig det rigtige i ruden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var TS = NK.Tegneserie;
    var Stof = NK.Stof;
    var B = NK.Beholder;

    var TEK = NK.TEKST.serie || {};
    var GLAS = ["glas1", "glas2", "glas3", "glas4", "glas5", "glas6"];

    /* ----- Tal og navne -------------------------------------------------- */
    function komma(x, n) {
        var t = (Math.round(x * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n);
        return t.replace(".", ",");
    }

    function grader(T) { return komma(T, 0) + " °C"; }

    /* mM af et stof i en opskrift */
    function mM(opl, navn) {
        if (!opl || !opl.V) return 0;
        return (opl.umol[navn] || 0) / opl.V;
    }

    function sum(opl, navne) {
        var s = 0;
        navne.forEach(function (n) { s += mM(opl, n); });
        return s;
    }

    /* ----- Hvad der ER i glasset ----------------------------------------
       Indgrebet laeses af oejebliksbilledet, holdt op mod glas 7. Hvert
       svar er { id, tekst, forklaring } fra tekst.js. */
    function indgreb(opl, ref) {
        if (!opl || opl.V < 0.5) return null;
        var jern = sum(opl, ["Fe3+", "FeSCN2+", "Fe2+"]);
        var scn = sum(opl, ["SCN-", "FeSCN2+", "AgSCN(s)"]);
        var rJern = sum(ref, ["Fe3+", "FeSCN2+", "Fe2+"]);
        var rScn = sum(ref, ["SCN-", "FeSCN2+", "AgSCN(s)"]);
        if (mM(opl, "AgSCN(s)") > 0.02) return "ag";
        if (mM(opl, "Fe2+") > 0.1) return "vitc";
        if (opl.T > 30) return "varme";
        if (opl.T < 12) return "kulde";
        if (jern > rJern * 1.15) return "fe";
        if (scn > rScn * 1.15) return "scn";
        if (rJern > 0.01 && jern < rJern * 0.85 && scn < rScn * 0.85) return "vand";
        return null;
    }

    /* Elevens svar og verdens facit for et glas paa billedet */
    function post(id) {
        var J = NK.BILLEDE.journal;
        return J.post(id);
    }

    /* En kopi af glasset, fyldt med det, der stod i det, da eleven
       noterede det - og ikke med det, der staar i det nu */
    function glasSom(bord, navn, p, opl) {
        var k = TS.kopi(bord.g[navn], p);
        if (!k) return null;
        if (opl) k.indhold = Stof.lav(opl);
        return k;
    }

    /* ----- Ruderne -------------------------------------------------------- */
    function ruder(bord) {
        var ud = [];
        var d7 = post("glas7");
        /* Referencen: som den blev noteret, ellers som den staar nu */
        var ref7 = d7 && d7.billede ? d7.billede.opl : Stof.opskrift(B.samlet(bord.g.glas7));

        ud.push(rudeStam(bord));
        GLAS.forEach(function (navn, i) { ud.push(rudeGlas(bord, navn, i + 1, ref7)); });
        ud.push(rudeBillede(bord));
        ud.push(rudeOvenfra(bord));
        uheldsruder(bord).forEach(function (r) { ud.push(r); });
        ud.push(rudeSkema(bord, ref7));
        return ud;
    }

    /* 1. Stamoploesningen: kolben og forraadet, stillet ved siden af
       hinanden. Paa bordet staar de i hver sin ende - i ruden hoerer de
       sammen, for det er den samme oploesning. */
    function rudeStam(bord) {
        var ting = [TS.kopi(bord.g.kolbe, { x: 430, y: 500 }), TS.kopi(bord.g.baeger, { x: 600, y: 500 })];
        return {
            tekst: TEK.stam,
            udsnit: TS.omkring(ting, 40),
            ting: ting,
            alt: "Kolben med stamopløsning og det store bægerglas med dagens forråd"
        };
    }

    /* 2-7. Ét glas ad gangen ved siden af glas 7 */
    var VENSTRE = { x: 450, y: 420, v: 0 };
    var HOEJRE = { x: 590, y: 420, v: 0 };

    function rudeGlas(bord, navn, nr, ref7) {
        var p = post(navn);
        if (!p || !p.billede || !p.billede.opl || p.billede.opl.V < 0.5) return null;
        var opl = p.billede.opl;
        var kode = indgreb(opl, ref7);
        /* Skiltet, glasset har paa bordet (4b, R ...), ikke dets plads */
        var mk = (bord.g[navn] && bord.g[navn].nr) || nr, mkR = bord.g.glas7.nr || "7";
        var t = (TEK.glas || "").replace("{nr}", String(mk));
        var g = TEK.indgreb && TEK.indgreb[kode];
        t += g ? " " + g.hvad : " " + (TEK.ukendt || "");
        if (kode === "varme" || kode === "kulde") t += " (" + grader(opl.T) + ")";
        t += ". ";
        /* F40: elevens egen iagttagelse og teoriens forklaring - ruden
           retter ikke det, eleven saa */
        if (p.svar && TEK.noteret && TEK.noteret[p.svar]) t += TEK.noteret[p.svar] + " ";
        if (g) t += g.hvorfor;
        /* Hver post har sin egen reference gemt: glas 7, som det saa ud,
           da netop DETTE glas blev noteret */
        var ting = [glasSom(bord, "glas7", VENSTRE, p.billede.ref || ref7), glasSom(bord, navn, HOEJRE, opl)];
        return {
            tekst: t,
            froe: nr,
            udsnit: TS.omkring(ting, 44),
            ting: ting,
            /* Etiketterne staar i rudens bund og ikke ved glasset: saa
               daekker de aldrig det, der skal ses */
            oven: function (ctx, pt) {
                TS.etiket(ctx, "glas " + mkR, pt(VENSTRE.x, 0).x, TS.H - 13, { farve: "#7ee0a8" });
                TS.etiket(ctx, "glas " + mk, pt(HOEJRE.x, 0).x, TS.H - 13);
            },
            alt: "Glas " + mkR + " og glas " + mk + " ved siden af hinanden"
        };
    }

    /* 9. Billedet af glas 1 til 7 */
    function rudeBillede(bord) {
        var J = NK.BILLEDE.journal;
        if (!J.antal()) return null;
        var alle = GLAS.concat(["glas7"]);
        var ting = alle.map(function (navn) {
            var p = post(navn);
            if (p && p.billede) return glasSom(bord, navn, null, p.billede.opl);
            /* Glas 7 svares der ikke paa - det ER svaret. Det tegnes af den
               reference, det sidst noterede glas blev holdt op mod. */
            var sidst = null;
            GLAS.forEach(function (n) { var q = post(n); if (q && q.billede && q.billede.ref) sidst = q.billede.ref; });
            return glasSom(bord, navn, null, sidst);
        });
        var X0 = 360, AFSTAND = 64;
        TS.paaRaekke(ting, X0, 420, AFSTAND);
        /* Bred rude: syv glas ved siden af hinanden skal have plads til
           hver sit ord under sig */
        var m = TS.maal({ bred: true });
        return {
            tekst: (TEK.billede || "").replace("{n}", String(J.antal())).replace("{i alt}", String(GLAS.length)),
            froe: 9,
            bred: true,
            udsnit: TS.omkring(ting, 26, m.h / m.b),
            ting: ting,
            oven: function (ctx, pt) {
                alle.forEach(function (navn, i) {
                    var x = pt(X0 + i * AFSTAND, 0).x;
                    var ref = navn === "glas7";
                    var s = ref ? TEK.refKort : (TEK.kort && TEK.kort[J.svar(navn)]) || "";
                    if (s) TS.etiket(ctx, s, x, m.h - 14,
                        { font: "700 13px 'Segoe UI', sans-serif", farve: ref ? "#7ee0a8" : "#c8ced6" });
                });
            },
            alt: "Glas 1–6 og R i række, som de så ud på billedet"
        };
    }

    /* 10. Del 2: de fire glas ovenfra, to og to i par */
    function rudeOvenfra() {
        var J = NK.OVENFRA.journal;
        if (!J.antal()) return null;
        var poster = NK.OVENFRA.TYPER.map(function (type) { return J.post(type); });
        if (!poster.some(function (p) { return p && p.billede && p.billede.fortyndet; })) return null;
        var gange = 0, n = 0;
        poster.forEach(function (p) {
            if (!p || !p.billede || !p.billede.fortyndet) return;
            var f = p.billede.fortyndet, r = p.billede.reference;
            if (r.V > 0) { gange += f.V / r.V; n++; }
        });
        var t = TEK.ovenfra || "";
        poster.forEach(function (p, i) {
            if (!p) return;
            t = t.replace("{" + NK.OVENFRA.TYPER[i] + "}", TEK.ord[p.svar] || String(p.svar));
        });
        t = t.replace("{gange}", komma(n ? gange / n : 2, 1));
        return {
            tekst: t,
            froe: 10,
            ren: true,
            oven: function (ctx) {
                var Bp = TS.B, Hp = TS.H;
                ctx.fillStyle = "#f4f5f3";
                NK.rundtRekt(ctx, 12, 18, Bp - 24, Hp - 42, 8);
                ctx.fill();
                ctx.strokeStyle = "rgba(90, 100, 112, 0.35)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(Bp / 2, 30);
                ctx.lineTo(Bp / 2, Hp - 34);
                ctx.stroke();
                poster.forEach(function (p, i) {
                    if (!p || !p.billede || !p.billede.fortyndet) return;
                    var x0 = 48 + i * 142;
                    TS.etiket(ctx, TEK.par[NK.OVENFRA.TYPER[i]], x0 + 31, 40,
                        { farve: "#2a2f36", font: "700 11px 'Segoe UI', sans-serif", kant: false });
                    [p.billede.reference, p.billede.fortyndet].forEach(function (s, j) {
                        NK.OVENFRA.tegnSkive(ctx, x0 + j * 62, 104, 27, Stof.lav(s.opl), s.vej);
                        TS.etiket(ctx, Math.round(s.V) + " mL", x0 + j * 62, 152,
                            { farve: "#2a2f36", font: "600 11px 'Segoe UI', sans-serif", kant: false });
                    });
                });
            },
            alt: "De fire bægerglas set lige ned i, to og to i par, på hvidt papir"
        };
    }

    /* 11. Uheld: én roed rude for hvert. Uheldene staar i bordets haendt,
       og navnene staar i opstillingen - ikke her. */
    function uheldsruder(bord) {
        var ud = [];
        Object.keys(bord.haendt).forEach(function (n) {
            var i = n.indexOf("_");
            if (i < 0) return;
            var slags = n.slice(0, i), navn = n.slice(i + 1);
            var t = TEK.uheld && TEK.uheld[slags];
            var gg = bord.g[navn];
            if (!t || !gg) return;
            /* Glasset stilles paa bordpladen i ruden. Paa bordet staar det
               i stativet, men stativet er ikke med i udsnittet, og et glas,
               der svaever, laeses som en fejl i tegningen. */
            var bund = NK.Scene.BORD + 6;
            /* type og anker er allerede i glassets skala (S31) */
            var ting = [TS.kopi(gg, { x: gg.p.x, y: bund - gg.type.h + gg.anker.y })];
            var f = B.farve(gg) || NK.Stof.VAND;
            /* F41: hvem ryddede op? Kun hvis Kemichael greb ind, siger ruden
               det - og saa staar han i den med koekkenrullen eller kosten */
            var hvem = bord.opryddet && bord.opryddet[n];
            var laerer = hvem === "laerer" && NK.Kemichael && NK.Kemichael.tegneserieFigur;
            var O = TEK.oprydning || {};
            var efter = hvem === "laerer" ? (slags === "knust" ? O.laererKnust : O.laerer) : (hvem === "elev" ? O.elev : O.ingen);
            ud.push({
                tekst: t.replace("{glas}", gg.titel || navn) + (efter ? " " + efter : ""),
                oven: laerer ? function (ctx) {
                    NK.Kemichael.tegneserieFigur(ctx, {
                        x: TS.B * 0.78, gulv: TS.H - 18, skala: 0.42, arm: 2.05,
                        udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.2, lukket: 1 },
                        haand: function (c, hd) {
                            var hvad = slags === "knust" ? "kost" : "koekkenrulle";
                            NK.Sprites.tegnPositur(c, hvad, { x: hd.x + 6, y: hd.y + 8, v: 0.2 },
                                (NK.Udstyr.type(hvad) && NK.Udstyr.type(hvad).anker) || { x: 0, y: 0 });
                        }
                    });
                } : undefined,
                fejl: true,
                froe: 20 + ud.length,
                udsnit: TS.omkring(ting, 70),
                ting: ting,
                /* Pytten paa bordet: det, der roeg ud. Den tegnes af
                   motorens egen tegnefunktion, som pytter paa bordet. */
                tegn: function (ctx) {
                    NK.Tegning.tegnPyt(ctx, { x: gg.p.x + 30, y: bund, rx: 46, vaad: 1, farve: f });
                },
                alt: "Uheldet med " + (gg.titel || navn)
            });
        });
        return ud;
    }

    /* 13. Resultatskemaet: begge dele i den sidste, brede rude */
    function rudeSkema(bord, ref7) {
        var J = NK.BILLEDE.journal, O = NK.OVENFRA.journal;
        var K = TEK.skema || {};
        return {
            tekst: K.titel || "",
            uden: true,
            bred: true,
            dom: function (div) {
                var o = document.createElement("p");
                o.className = "mellemrubrik";
                o.textContent = K.del1 || "";
                div.appendChild(o);
                div.appendChild(TS.tabel(del1Raekker(bord, J, ref7, K)));
                if (O.antal()) {
                    var o2 = document.createElement("p");
                    o2.className = "mellemrubrik";
                    o2.textContent = K.del2 || "";
                    div.appendChild(o2);
                    div.appendChild(TS.tabel(del2Raekker(O, K)));
                }
            }
        };
    }

    function del1Raekker(bord, J, ref7, K) {
        var raekker = [K.hoved1 || []];
        GLAS.concat(["glas7"]).forEach(function (navn, i) {
            var nr = i + 1;
            var p = post(navn);
            var opl = p && p.billede ? p.billede.opl : Stof.opskrift(B.samlet(bord.g[navn]));
            var tom = !opl || opl.V < 0.5;
            var kode = navn === "glas7" ? null : indgreb(opl, (p && p.billede && p.billede.ref) || ref7);
            var g = TEK.indgreb && TEK.indgreb[kode];
            var svar;
            if (navn === "glas7") svar = TEK.reference;
            else if (!p) svar = tom ? "" : (K.ikkeNoteret || "");
            else svar = TS.svarCelle({
                farve: p.billede && p.billede.farve,
                svar: TEK.ord[p.svar] || p.svar
            });
            raekker.push([
                String((bord.g[navn] && bord.g[navn].nr) || nr),
                tom ? (K.tomt || "") : (g ? g.kort : (navn === "glas7" ? (K.uroert || "") : (TEK.ukendt || ""))),
                tom ? "" : grader(opl.T),
                svar,
                navn === "glas7" || !g || !g.forventet || !K.forventet ? "" : K.forventet[g.forventet]
            ]);
        });
        return raekker;
    }

    function del2Raekker(O, K) {
        var raekker = [K.hoved2 || []];
        NK.OVENFRA.TYPER.forEach(function (type) {
            var p = O.post(type);
            if (!p || !p.billede || !p.billede.fortyndet) return;
            var f = p.billede.fortyndet, r = p.billede.reference;
            raekker.push([
                TEK.par[type],
                Math.round(r.V) + " mL ⟶ " + Math.round(f.V) + " mL",
                TS.svarCelle({
                    farve: f.farve,
                    svar: TEK.ord[p.svar] || p.svar
                }),
                !K.forventet ? "" : (type === "farve" ? K.forventet.ens + " (" + (K.ingen || "") + ")" : K.forventet.lysere)
            ]);
        });
        return raekker;
    }

    NK.SERIE = {
        ruder: ruder,
        indgreb: indgreb,
        GLAS: GLAS
    };
}());
