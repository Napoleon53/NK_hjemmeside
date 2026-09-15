/* =====================================================================
   tegneserie.js - forsoeget opsummeret som en tegneserie

   Bag knappen Tegneserie, som laases op, naar resterne er afleveret.
   Hver rude er et lille laerred, tegnet med de samme funktioner som
   scenen, og en kort tekst bygget af elevens egne tal: draaberne i
   stamoploesningen, hvilket glas der fik hvilket indgreb, og hvordan
   glassene saa ud, da de blev vurderet. Uheld faar deres egen rude.
   Sidste rude er resultatskemaet med elevens iagttagelser.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;

    var B = 300, H = 214;
    var GLAS_Y = 24;

    function tekst(ctx, t, x, y, opt) {
        NK.tekst(ctx, t, x, y, { font: (opt && opt.font) || "700 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: (opt && opt.farve) || "#dfe5ec" });
    }

    function rude(container, nr, tekstStr, tegn) {
        var div = document.createElement("div");
        div.className = "rude";
        var canvas = document.createElement("canvas");
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(B * dpr);
        canvas.height = Math.round(H * dpr);
        var ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#262b33");
        g.addColorStop(1, "#1a1e25");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, B, H);
        ctx.fillStyle = "#3b404b";
        ctx.fillRect(0, GLAS_Y + 160, B, 16);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(0, GLAS_Y + 160, B, 1.5);
        tegn(ctx);
        div.appendChild(canvas);
        var p = document.createElement("p");
        var sp = document.createElement("span");
        sp.className = "nr";
        sp.textContent = String(nr);
        p.appendChild(sp);
        p.appendChild(document.createTextNode(tekstStr));
        div.appendChild(p);
        container.appendChild(div);
    }

    /* Samme koncentrationer i et andet volumen */
    function skaler(o, V) {
        if (!o || o.V <= 0) return null;
        var ud = M.kopiOpl(o), k = V / o.V;
        ["V", "fe", "scn", "ag", "agscn", "x"].forEach(function (n) { ud[n] = o[n] * k; });
        return ud;
    }

    function glasObj(x, opl, opt) {
        opt = opt || {};
        var V = opl ? opl.V : 0;
        return {
            p: { x: x, y: GLAS_Y, v: 0 }, V: V, Vsol: V, solFarve: opl ? M.glasFarve(opl) : null, lagFarve: null,
            bund: opt.bund || 0, uklar: opt.uklar || 0, boelge: 0, fremhaev: false, nr: opt.nr || 0, valgt: false
        };
    }

    /* Glassets tal: gemt ved afleveringen, ellers som glasset er nu */
    function data(f, gl) {
        if (gl.slut) return gl.slut;
        return {
            opl: M.samlet(gl.b), bundfald: f.bundfald(gl), indgreb: f.indgrebTekst(gl), liste: f.indgrebListe(gl),
            vurdering: gl.vurdering, afkoelet: gl.afkoelet, uroert: f.uroert(gl)
        };
    }

    /* Glasset, som det saa ud, da det blev vurderet */
    function visOpl(d) {
        return d.vurdering ? d.vurdering.opl : d.opl;
    }

    function visBund(d) {
        return (d.vurdering ? d.vurdering.bundfald : d.bundfald) || { bund: 0, uklar: 0 };
    }

    function ord(rel) {
        if (rel === "mørkere" || rel === "lysere") return rel;
        return "ikke synligt anderledes";
    }

    function draaber(n) {
        return n === 1 ? "dråbe" : "dråber";
    }

    function tegnBad(ctx, x, varm) {
        var y0 = GLAS_Y + 92, y1 = GLAS_Y + 160, i;
        ctx.save();
        ctx.fillStyle = varm ? "rgba(170, 210, 236, 0.3)" : "rgba(190, 225, 245, 0.36)";
        ctx.fillRect(x - 38, y0, 76, y1 - y0);
        ctx.strokeStyle = "rgba(220, 236, 248, 0.8)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x - 40, y0 - 20);
        ctx.lineTo(x - 40, y1);
        ctx.lineTo(x + 40, y1);
        ctx.lineTo(x + 40, y0 - 20);
        ctx.stroke();
        if (varm) {
            ctx.fillStyle = "rgba(235, 245, 255, 0.6)";
            for (i = 0; i < 7; i++) {
                ctx.beginPath();
                ctx.arc(x - 30 + i * 10, y1 - 10 - (i * 13) % 50, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = "rgba(235, 242, 248, 0.35)";
            ctx.lineWidth = 2;
            for (i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x - 22 + i * 22, y0 - 6);
                ctx.bezierCurveTo(x - 30 + i * 22, y0 - 18, x - 14 + i * 22, y0 - 26, x - 22 + i * 22, y0 - 38);
                ctx.stroke();
            }
            tekst(ctx, M.TEMP.vandbad + " °C", x - 66, y0 + 30, { farve: "#f0a58f" });
        } else {
            for (i = 0; i < 4; i++) {
                ctx.fillStyle = "rgba(236, 246, 255, 0.8)";
                NK.rundtRekt(ctx, x - 34 + i * 18, y0 - 4 + (i % 2) * 5, 13, 11, 3);
                ctx.fill();
            }
            tekst(ctx, M.TEMP.isbad + " °C", x - 66, y0 + 30, { farve: "#9fd0f2" });
        }
        ctx.restore();
    }

    /* ----- Resultatskemaet ---------------------------------------------------- */
    function celle(tr, tekstStr) {
        var td = document.createElement("td");
        td.textContent = tekstStr;
        tr.appendChild(td);
        return td;
    }

    function resultatTabel(f) {
        var refNr = f.resultat ? f.resultat.refNr : 0;
        var tabel = document.createElement("table");
        tabel.className = "resultater skema";
        var hoved = document.createElement("tr");
        ["Glas", "Indgreb", "Din iagttagelse", "Ligevægten forskydes"].forEach(function (t) {
            var th = document.createElement("th");
            th.textContent = t;
            hoved.appendChild(th);
        });
        tabel.appendChild(hoved);
        f.glasListe().forEach(function (gl) {
            var d = data(f, gl);
            var tr = document.createElement("tr");
            var th = document.createElement("th");
            th.textContent = String(gl.nr);
            tr.appendChild(th);
            var erRef = gl.nr === refNr;
            var tom = (!d.opl || d.opl.V < 0.05) && !d.vurdering;
            celle(tr, erRef ? "urørt" : (tom ? "tomt" : d.indgreb));

            var td = document.createElement("td");
            var farve = tom ? null : M.glasFarve(visOpl(d));
            if (farve) {
                var sp = document.createElement("span");
                sp.className = "farve";
                sp.style.backgroundColor = NK.css({ r: farve.r, g: farve.g, b: farve.b, a: 1 });
                td.appendChild(sp);
            }
            if (erRef) {
                td.appendChild(document.createTextNode("reference"));
            } else if (d.vurdering) {
                td.appendChild(document.createTextNode(d.vurdering.svar));
                if (d.vurdering.faktisk && d.vurdering.svar !== d.vurdering.faktisk) {
                    var fk = document.createElement("span");
                    fk.className = "facit";
                    fk.textContent = "Glasset var " + d.vurdering.faktisk + ".";
                    td.appendChild(fk);
                }
            } else if (!tom) {
                td.appendChild(document.createTextNode("ikke vurderet"));
            }
            tr.appendChild(td);

            var fs = "";
            if (!erRef && d.vurdering && d.vurdering.faktisk) {
                fs = M.forskydning(d.vurdering.faktisk);
                if (fs === "ingen") fs = "ikke synligt";
            }
            celle(tr, fs);
            tabel.appendChild(tr);
        });
        return tabel;
    }

    NK.Tegneserie = {
        resultatTabel: resultatTabel,

        byg: function (f, container) {
            container.innerHTML = "";
            var nr = 0;
            var D = f.glasListe().map(function (gl) { return data(f, gl); });
            var st = f.stam;
            var refNr = f.resultat ? f.resultat.refNr : 0;
            var ref5 = st ? skaler(st.opl, M.MAENGDE.FORDEL) : null;

            /* 1. Stamoploesningen */
            if (st) {
                var t1 = "Vand, " + st.draaber.fe + " " + draaber(st.draaber.fe) + " Fe(NO₃)₃ og " + st.draaber.scn + " " + draaber(st.draaber.scn) + " KSCN giver en " + M.farveNavn(st.opl) + " opløsning.";
                if (st.vurdering === "farveloes") t1 += " Uden begge stoffer dannes der ikke " + M.formel("FeSCN2+") + ".";
                else t1 += " Farven skyldes " + M.formel("FeSCN2+") + ".";
                if (st.vurdering === "soelv") t1 += " Der kom også AgNO₃ i, så alle glas fik bundfald.";
                if (st.vurdering === "moerk") t1 += " Den var så mørk, at forskelle var svære at se.";
                if (st.vurdering === "lys") t1 += " Den var så lys, at forskelle var svære at se.";
                if (st.ujaevn) t1 += " Der blev ikke rørt om, så glassene fik forskellig farve.";
                rude(container, ++nr, t1, function (ctx) {
                    S.tegnBaeger(ctx, {
                        p: { x: 150, y: GLAS_Y + 160 - 110 + 4, v: 0 }, V: st.V, Vsol: st.V, solFarve: M.baegerFarve(st.opl),
                        lagFarve: null, bund: 0, uklar: 0, boelge: 0, fremhaev: false, valgt: false
                    }, 0, false);
                    S.tegnDraaber(ctx, [
                        { x: 136, y: GLAS_Y + 30, r: 3.6, liv: 1, farve: NK.STOF.fe.farve },
                        { x: 164, y: GLAS_Y + 30, r: 3.6, liv: 1, farveloes: true }
                    ]);
                    tekst(ctx, "Fe(NO₃)₃", 62, GLAS_Y + 22, { farve: "#f0d88a" });
                    tekst(ctx, "KSCN", 238, GLAS_Y + 22, { farve: "#c8ced6" });
                });

                /* 2. Fordelingen */
                var t2 = "Opløsningen er fordelt i fem glas.";
                if (refNr) t2 += " Glas " + refNr + " står urørt som reference.";
                else if (f.haendt.ingenRef) t2 += " Alle fem glas fik et indgreb, så der var ingen urørt reference.";
                rude(container, ++nr, t2, function (ctx) {
                    for (var i = 0; i < 5; i++) S.tegnGlas(ctx, glasObj(42 + i * 54, ref5, { nr: i + 1 }), 0);
                    if (refNr) tekst(ctx, "reference", 42 + (refNr - 1) * 54, GLAS_Y + 178, { farve: "#7ee0a8" });
                });
            }

            /* 3. Indgrebene, ét glas ad gangen ved siden af referencen */
            function find(slags) {
                var bedst = -1;
                D.forEach(function (d, i) {
                    if (d.liste.indexOf(slags) < 0) return;
                    if (bedst < 0 || (d.liste.length === 1 && D[bedst].liste.length > 1)) bedst = i;
                });
                return bedst;
            }

            function rel(d) {
                if (d.vurdering && d.vurdering.faktisk) return d.vurdering.faktisk;
                return ref5 ? M.sammenlign(d.opl, ref5) : null;
            }

            function toGlas(i, t, efter) {
                var d = D[i];
                rude(container, ++nr, t, function (ctx) {
                    S.tegnGlas(ctx, glasObj(95, ref5, { nr: refNr }), 0);
                    var bf = visBund(d);
                    S.tegnGlas(ctx, glasObj(205, visOpl(d), { nr: i + 1, bund: bf.bund, uklar: bf.uklar }), 0);
                    if (efter) efter(ctx);
                    tekst(ctx, "reference", 95, GLAS_Y + 178, { farve: "#7ee0a8" });
                    tekst(ctx, "glas " + (i + 1), 205, GLAS_Y + 178);
                });
            }

            var i = find("fe");
            if (i >= 0) {
                toGlas(i, "Glas " + (i + 1) + " fik Fe(NO₃)₃ og blev " + ord(rel(D[i])) + ". Mere " + M.formel("Fe3+") + " forskyder ligevægten mod højre, så der dannes mere " + M.formel("FeSCN2+") + ".", function (ctx) {
                    S.tegnDraaber(ctx, [{ x: 205, y: GLAS_Y - 10, r: 3.4, liv: 1, farve: NK.STOF.fe.farve }]);
                    tekst(ctx, "+ " + M.formel("Fe3+"), 262, GLAS_Y + 30, { farve: "#f0d88a" });
                });
            }
            i = find("scn");
            if (i >= 0) {
                toGlas(i, "Glas " + (i + 1) + " fik KSCN og blev " + ord(rel(D[i])) + ". Mere " + M.formel("SCN-") + " forskyder ligevægten mod højre, så der dannes mere " + M.formel("FeSCN2+") + ".", function (ctx) {
                    S.tegnDraaber(ctx, [{ x: 205, y: GLAS_Y - 10, r: 3.4, liv: 1, farveloes: true }]);
                    tekst(ctx, "+ " + M.formel("SCN-"), 262, GLAS_Y + 30, { farve: "#c8ced6" });
                });
            }
            i = find("ag");
            if (i >= 0) {
                toGlas(i, "Glas " + (i + 1) + " fik AgNO₃ og blev " + ord(rel(D[i])) + ". Der dannes et hvidt bundfald: " + M.ligning(M.REAKTIONER.faeldning, false).replace("AgSCN", "AgSCN(s)") + ". Når " + M.formel("SCN-") + " fjernes, forskydes ligevægten mod venstre.", function (ctx) {
                    S.tegnDraaber(ctx, [{ x: 205, y: GLAS_Y - 10, r: 3.4, liv: 1, farveloes: true }]);
                    tekst(ctx, "+ " + M.formel("Ag+"), 262, GLAS_Y + 30, { farve: "#c8ced6" });
                    tekst(ctx, "AgSCN(s)", 262, GLAS_Y + 150, { farve: "#f4f6f8" });
                });
            }
            i = find("varme");
            if (i >= 0) {
                toGlas(i, "Glas " + (i + 1) + " i det varme vandbad blev " + ord(rel(D[i])) + ". Reaktionen mod højre er exoterm, så opvarmning forskyder ligevægten mod venstre." + (D[i].afkoelet ? " Da glasset kølede af, blev det mørkere igen." : ""), function (ctx) {
                    tegnBad(ctx, 205, true);
                });
            }
            i = find("kulde");
            if (i >= 0) {
                toGlas(i, "Glas " + (i + 1) + " i isbadet blev " + ord(rel(D[i])) + ". Afkøling forskyder ligevægten mod højre, fordi reaktionen mod højre er exoterm.", function (ctx) {
                    tegnBad(ctx, 205, false);
                });
            }
            i = find("vand");
            if (i >= 0) {
                toGlas(i, "Glas " + (i + 1) + " fik vand og blev " + ord(rel(D[i])) + ". Fortynding forskyder ligevægten mod venstre, hvor der er flest opløste partikler.", function (ctx) {
                    S.tegnDraaber(ctx, [{ x: 205, y: GLAS_Y - 10, r: 3, liv: 1, farveloes: true }, { x: 199, y: GLAS_Y - 24, r: 2.6, liv: 1, farveloes: true }]);
                    tekst(ctx, "+ " + M.formel("H2O"), 262, GLAS_Y + 30, { farve: "#9fd0f2" });
                });
            }

            /* 4. Glassene set ovenfra */
            rude(container, ++nr, "Set ovenfra mod hvidt papir går lyset gennem hele væskesøjlen, så forskellene ses tydeligst.", function (ctx) {
                ctx.fillStyle = "#f4f5f3";
                NK.rundtRekt(ctx, 8, 26, 284, 158, 8);
                ctx.fill();
                D.forEach(function (d, k) {
                    var x = 36 + k * 57, y = 84;
                    var o = visOpl(d), bf = visBund(d);
                    S.tegnOppefra(ctx, x, y, 19, { farve: M.oppefraFarve(o), bund: bf.bund, uklar: bf.uklar, tom: !o || o.V < 0.3 });
                    tekst(ctx, "glas " + (k + 1), x, y + 40, { farve: "#2a2f36" });
                    var s = k + 1 === refNr ? "ref." : (d.vurdering ? (d.vurdering.svar === "som referencen" ? "som ref." : d.vurdering.svar) : "");
                    tekst(ctx, s, x, y + 60, { farve: k + 1 === refNr ? "#2b7d51" : "#56606b", font: "600 12px 'Segoe UI', sans-serif" });
                });
            });

            /* 5. Uheld */
            D.forEach(function (d, k) {
                if (f.haendt["spild" + (k + 1)]) {
                    rude(container, ++nr, "Uheld: glas " + (k + 1) + " blev rystet så voldsomt, at indholdet sprøjtede ud. Kemichael tørrede op.", function (ctx) {
                        S.tegnGlas(ctx, glasObj(105, null, { nr: k + 1 }), 0);
                        var fa = ref5 ? M.glasFarve(ref5) : M.FARVE.vand;
                        ctx.fillStyle = NK.css({ r: fa.r, g: fa.g, b: fa.b, a: 0.85 });
                        ctx.beginPath();
                        ctx.ellipse(200, GLAS_Y + 162, 46, 5, 0, 0, Math.PI * 2);
                        ctx.fill();
                        S.tegnDraaber(ctx, [
                            { x: 132, y: GLAS_Y + 4, r: 2.6, liv: 1, farve: fa },
                            { x: 150, y: GLAS_Y + 22, r: 2.2, liv: 1, farve: fa },
                            { x: 120, y: GLAS_Y - 8, r: 2.4, liv: 1, farve: fa }
                        ]);
                        tekst(ctx, "for voldsomt", 210, GLAS_Y + 70, { farve: "#f0918a" });
                    });
                }
                if (f.haendt["overloeb" + (k + 1)]) {
                    rude(container, ++nr, "Uheld: glas " + (k + 1) + " løb over, fordi der kom for meget vand i. Kemichael tørrede op.", function (ctx) {
                        S.tegnGlas(ctx, glasObj(105, skaler(ref5 || M.nyOpl(), M.MAENGDE.GLAS_MAKS), { nr: k + 1 }), 0);
                        ctx.fillStyle = "rgba(196, 224, 242, 0.7)";
                        ctx.beginPath();
                        ctx.ellipse(170, GLAS_Y + 162, 50, 5, 0, 0, Math.PI * 2);
                        ctx.fill();
                        tekst(ctx, "fuldt er fuldt", 222, GLAS_Y + 70, { farve: "#f0918a" });
                    });
                }
            });
            if (f.haendt.overloeb0) {
                rude(container, ++nr, "Uheld: bægerglasset løb over, fordi der kom for meget vand i. Kemichael tørrede op.", function (ctx) {
                    S.tegnBaeger(ctx, {
                        p: { x: 110, y: GLAS_Y + 160 - 110 + 4, v: 0 }, V: M.MAENGDE.BAEGER_MAKS, Vsol: M.MAENGDE.BAEGER_MAKS,
                        solFarve: st ? M.baegerFarve(skaler(st.opl, M.MAENGDE.BAEGER_MAKS)) : M.FARVE.vand, lagFarve: null,
                        bund: 0, uklar: 0, boelge: 0, fremhaev: false, valgt: false
                    }, 0, false);
                    ctx.fillStyle = "rgba(196, 224, 242, 0.7)";
                    ctx.beginPath();
                    ctx.ellipse(190, GLAS_Y + 162, 60, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    tekst(ctx, "100 mL", 222, GLAS_Y + 60, { farve: "#f0918a" });
                });
            }

            /* 6. Resultatskemaet i sidste rude */
            var sidste = document.createElement("div");
            sidste.className = "rude skema-rude";
            var overskrift = document.createElement("p");
            var nrSpan = document.createElement("span");
            nrSpan.className = "nr";
            nrSpan.textContent = String(++nr);
            overskrift.appendChild(nrSpan);
            overskrift.appendChild(document.createTextNode("Resultatskema"));
            sidste.appendChild(overskrift);
            sidste.appendChild(resultatTabel(f));
            container.appendChild(sidste);
        }
    };
}());
