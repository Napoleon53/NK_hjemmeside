/* =====================================================================
   tegneserie.js - forsoeget opsummeret som en tegneserie

   Bag knappen Tegneserie, som laases op, naar begge dele er gjort. Hver
   rude er et lille laerred, tegnet med de samme funktioner som scenen,
   og en kort tekst bygget af elevens egne resultater: hvad hvert glas
   fik, temperaturerne, farveaendringerne paa billedet og fortyndingen i
   del 2. Uheld faar deres egen rude. Sidste rude er resultatskemaet.
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

    /* En tegning af et glas flyttet hen til x i ruden */
    function glasHer(t, x, nr) {
        var ny = {};
        for (var k in t) if (Object.prototype.hasOwnProperty.call(t, k)) ny[k] = t[k];
        ny.p = { x: x, y: GLAS_Y, v: 0 };
        ny.nr = nr || 0;
        ny.valgt = false;
        ny.fremhaev = false;
        ny.boelge = 0;
        return ny;
    }

    /* Glassets tal: gemt ved afleveringen, ellers som glasset er nu */
    function data(f, gl) {
        if (gl.slut) return gl.slut;
        return {
            opl: M.samlet(gl.b), tegning: f.beholderTegning(gl), indgreb: f.indgrebTekst(gl), liste: f.indgrebListe(gl),
            vurdering: gl.vurdering, maaltT: gl.maaltT, afkoelet: gl.afkoelet, uroert: f.uroert(gl)
        };
    }

    function visTegning(d) {
        return d.vurdering ? d.vurdering.tegning : d.tegning;
    }

    function ord(rel) {
        if (rel === "mørkere" || rel === "lysere") return rel;
        return "ikke synligt anderledes";
    }

    var HANDLING = {
        fe: "fik Fe(NO₃)₃ (s)", vitc: "fik ascorbinsyre", scn: "fik KSCN (s)", kscn: "fik KSCN-opløsning",
        ag: "fik AgNO₃", vand: "fik vand", varme: "stod i det varme vandbad", kulde: "stod i isbadet"
    };

    var FORKLARING = {
        fe: "Mere " + "Fe³⁺" + " forskyder ligevægten mod højre.",
        vitc: "Ascorbinsyre reducerer Fe³⁺ til Fe²⁺, så c(Fe³⁺) falder, og ligevægten forskydes mod venstre.",
        scn: "Mere SCN⁻ forskyder ligevægten mod højre.",
        kscn: "Mere SCN⁻ forskyder ligevægten mod højre, men opløsningen fortynder også glasset.",
        ag: "Ag⁺ fælder SCN⁻ som AgSCN, og ligevægten forskydes mod venstre.",
        vand: "Fortynding forskyder ligevægten mod venstre.",
        varme: "Reaktionen mod højre er exoterm, så opvarmning forskyder ligevægten mod venstre.",
        kulde: "Afkøling forskyder ligevægten mod højre, fordi reaktionen mod højre er exoterm."
    };

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
        } else {
            for (i = 0; i < 4; i++) {
                ctx.fillStyle = "rgba(236, 246, 255, 0.8)";
                NK.rundtRekt(ctx, x - 34 + i * 18, y0 - 4 + (i % 2) * 5, 13, 11, 3);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    function korn(ctx, x, stof) {
        var f = M.FARVE.fast[stof];
        ctx.save();
        for (var i = 0; i < 7; i++) {
            ctx.fillStyle = NK.css(f, 1);
            ctx.fillRect(x - 6 + (i * 5) % 12, GLAS_Y - 22 + (i * 7) % 14, 3, 3);
        }
        ctx.restore();
    }

    /* ----- Resultatskemaet ---------------------------------------------------- */
    function raekke(tabel, celler, overskrift) {
        var tr = document.createElement("tr");
        celler.forEach(function (c, i) {
            var el = document.createElement(overskrift || i === 0 ? "th" : "td");
            if (typeof c === "string") el.textContent = c;
            else el.appendChild(c);
            tr.appendChild(el);
        });
        tabel.appendChild(tr);
        return tr;
    }

    function iagttagelse(tegning, svar, faktisk) {
        var span = document.createElement("span");
        if (tegning && tegning.solFarve) {
            var sw = document.createElement("span");
            sw.className = "farve";
            var f = tegning.solFarve;
            sw.style.backgroundColor = NK.css({ r: f.r, g: f.g, b: f.b, a: 1 });
            span.appendChild(sw);
        }
        span.appendChild(document.createTextNode(svar || ""));
        if (svar && faktisk && svar !== faktisk) {
            var fk = document.createElement("span");
            fk.className = "facit";
            fk.textContent = "Glasset var " + faktisk + ".";
            span.appendChild(fk);
        }
        return span;
    }

    function resultatTabel(f) {
        var tabel = document.createElement("table");
        tabel.className = "resultater skema";
        raekke(tabel, ["Glas", "Indgreb", "Temperatur", "Farveændring", "⟵ / ⟶"], true);
        f.glasListe().forEach(function (gl) {
            if (gl.nr > 7) return;
            var d = data(f, gl);
            var tom = (!d.opl || d.opl.V < 0.05) && !d.vurdering;
            var T = d.maaltT !== null && d.maaltT !== undefined ? S.temperaturTekst(d.maaltT) : "";
            if (gl.nr === 7) {
                raekke(tabel, ["7", tom ? "tomt" : (d.uroert ? "stuetemperatur" : d.indgreb), T, iagttagelse(d.tegning, "reference"), ""]);
                return;
            }
            var v = d.vurdering;
            raekke(tabel, [
                String(gl.nr), tom ? "tomt" : d.indgreb, T,
                v ? iagttagelse(v.tegning, v.svar, v.faktisk) : (tom ? "" : "ikke noteret"),
                v && v.faktisk ? (M.forskydning(v.faktisk === "som glas 7" ? "" : v.faktisk) === "ingen" ? "ingen" : M.forskydning(v.faktisk)) : ""
            ]);
        });
        return tabel;
    }

    function del2Tabel(f) {
        var res = f.del2.resultat;
        if (!res.farve && !res.lv) return null;
        var tabel = document.createElement("table");
        tabel.className = "resultater skema";
        raekke(tabel, ["Opløsning", "Volumen", "Set ovenfra efter fortynding", "⟵ / ⟶"], true);
        [["frugtfarve", res.farve, "ingen ligevægt"], ["ligevægtsblanding", res.lv, null]].forEach(function (rk) {
            var r = rk[1];
            if (!r) return;
            var svar = document.createElement("span");
            svar.appendChild(document.createTextNode(r.svar));
            if (r.faktisk && r.svar !== r.faktisk) {
                var fk = document.createElement("span");
                fk.className = "facit";
                fk.textContent = "Glasset var " + r.faktisk + ".";
                svar.appendChild(fk);
            }
            raekke(tabel, [rk[0], Math.round(r.V[1]) + " mL ⟶ " + Math.round(r.V[0]) + " mL", svar,
                rk[2] || (r.faktisk === "lysere" ? "⟵" : (r.faktisk === "mørkere" ? "⟶" : "ingen"))]);
        });
        return tabel;
    }

    NK.Tegneserie = {
        resultatTabel: resultatTabel,

        byg: function (f, container) {
            container.innerHTML = "";
            var nr = 0;
            var alle = f.glasListe();
            var D = alle.map(function (gl) { return data(f, gl); });
            var d7 = D[6];
            var ref7 = d7.vurdering ? null : d7.tegning;

            /* 1. Stamoploesningen */
            rude(container, ++nr, "Stamopløsningen af Fe(NO₃)₃ og KSCN er rødbrun. Farven skyldes FeSCN²⁺. Der hældes lidt i et bægerglas og et par mL i glas 1 til 7.", function (ctx) {
                var stam = M.stamOpl(30);
                S.tegnKolbe(ctx, { p: { x: 90, y: GLAS_Y + 160 - 128 + 2.5, v: 0 }, V: 200, farve: M.baegerFarve(stam), fremhaev: false }, 0, false);
                S.tegnBaeger(ctx, {
                    p: { x: 210, y: GLAS_Y + 160 - 110 + 4, v: 0 }, V: 30, Vsol: 30, solFarve: M.baegerFarve(stam), lagFarve: null,
                    bund: 0, uklar: 0, fast: null, boelge: 0, fremhaev: false, valgt: false
                }, 0, false);
            });

            /* 2. Et glas ad gangen ved siden af glas 7 */
            function refTegning(d) {
                if (d.vurdering && d.vurdering.ref) return d.vurdering.ref.tegning;
                return ref7 || d7.tegning;
            }
            D.forEach(function (d, i) {
                var n = i + 1;
                if (n >= 7 || !d.liste.length) return;
                var hoved = d.liste[0];
                var rel = d.vurdering ? d.vurdering.faktisk : null;
                var T = d.maaltT !== null && d.maaltT !== undefined && (hoved === "varme" || hoved === "kulde") ? " (" + S.temperaturTekst(d.maaltT) + ")" : "";
                var t = "Glas " + n + " " + HANDLING[hoved] + T + (rel ? " og blev " + ord(rel) + ". " : ". ") + FORKLARING[hoved];
                if (d.liste.length > 1) t += " Glasset fik også " + d.liste.slice(1).map(function (k) { return NK.INDGREB_TEKST[k].replace("+ ", ""); }).join(" og ") + ".";
                rude(container, ++nr, t, function (ctx) {
                    S.tegnGlas(ctx, glasHer(refTegning(d), 95, 7), 0);
                    S.tegnGlas(ctx, glasHer(visTegning(d), 205, n), 0);
                    if (hoved === "fe" || hoved === "vitc" || hoved === "scn") korn(ctx, 205, hoved);
                    if (hoved === "ag" || hoved === "kscn" || hoved === "vand") S.tegnDraaber(ctx, [{ x: 205, y: GLAS_Y - 10, r: 3.4, liv: 1, farveloes: true }]);
                    if (hoved === "varme") tegnBad(ctx, 205, true);
                    if (hoved === "kulde") tegnBad(ctx, 205, false);
                    tekst(ctx, "glas 7", 95, GLAS_Y + 178, { farve: "#7ee0a8" });
                    tekst(ctx, "glas " + n, 205, GLAS_Y + 178);
                });
            });

            /* 3. Forundersoegelsen i glas 8 */
            var d8 = D[7];
            if (d8.liste.indexOf("kscn") >= 0 && d8.liste.indexOf("ag") >= 0) {
                rude(container, ++nr, "Forundersøgelsen i glas 8: KSCN og AgNO₃ giver et hvidt bundfald. " + M.ligning(M.REAKTIONER.faeldning).replace("AgSCN", "AgSCN(s)") + ".", function (ctx) {
                    S.tegnGlas(ctx, glasHer(d8.tegning, 150, 8), 0);
                    tekst(ctx, "AgSCN(s)", 222, GLAS_Y + 150, { farve: "#f4f6f8" });
                });
            }

            /* 4. Billedet af glas 1 til 7 */
            rude(container, ++nr, "Billedet af glas 1 til 7. Glas 7 ved stuetemperatur er referencen.", function (ctx) {
                for (var i = 0; i < 7; i++) {
                    var d = D[i];
                    var x = 26 + i * 41;
                    ctx.save();
                    ctx.translate(x, GLAS_Y + 16);
                    ctx.scale(0.72, 0.72);
                    S.tegnGlas(ctx, glasHer(visTegning(d), 0, 0), 0);
                    ctx.restore();
                    tekst(ctx, String(i + 1), x, GLAS_Y + 140);
                    var s = i === 6 ? "ref." : (d.vurdering ? { "mørkere": "mørk", "lysere": "lys", "som glas 7": "som 7" }[d.vurdering.svar] : "");
                    tekst(ctx, s, x, GLAS_Y + 172, { farve: i === 6 ? "#7ee0a8" : "#c8ced6", font: "600 11px 'Segoe UI', sans-serif" });
                }
            });

            /* 5. Del 2: de fire glas ovenfra, to og to i par */
            var r2 = f.del2.resultat;
            if (r2.farve && r2.lv) {
                var TEKST2 = "De fire glas ovenfra: frugtfarven var " + r2.farve.svar + ", og ligevægtsblandingen var " +
                    r2.lv.svar + ". Frugtfarven har lige mange farvestofmolekyler i lysvejen, uanset volumen. " +
                    "I ligevægtsblandingen halveres alle koncentrationer, så Y bliver dobbelt så stor som K, " +
                    "og ligevægten forskydes mod venstre.";
                rude(container, ++nr, TEKST2, function (ctx) {
                    ctx.fillStyle = "#f4f5f3";
                    NK.rundtRekt(ctx, 12, 18, 276, 166, 8);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(90, 100, 112, 0.35)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(150, 30);
                    ctx.lineTo(150, 172);
                    ctx.stroke();
                    [["Frugtfarve", r2.farve, 48], ["Ligevægt", r2.lv, 190]].forEach(function (p) {
                        var r = p[1], x0 = p[2];
                        tekst(ctx, p[0], x0 + 31, 40, { farve: "#2a2f36", font: "700 11px 'Segoe UI', sans-serif" });
                        S.tegnOppefra(ctx, x0, 104, 27, { farve: r.farver[1] });
                        S.tegnOppefra(ctx, x0 + 62, 104, 27, { farve: r.farver[0] });
                        tekst(ctx, Math.round(r.V[1]) + " mL", x0, 152, { farve: "#2a2f36", font: "600 11px 'Segoe UI', sans-serif" });
                        tekst(ctx, Math.round(r.V[0]) + " mL", x0 + 62, 152, { farve: "#2a2f36", font: "600 11px 'Segoe UI', sans-serif" });
                    });
                });
            }

            /* 6. Uheld */
            var UHELD = [];
            alle.forEach(function (gl) {
                if (f.haendt["spild_" + gl.navn]) UHELD.push("Uheld: glas " + gl.nr + " blev rystet så voldsomt, at indholdet sprøjtede ud. Kemichael tørrede op.");
                if (f.haendt["overloeb_" + gl.navn]) UHELD.push("Uheld: glas " + gl.nr + " løb over. Kemichael tørrede op.");
            });
            [["baegerA", "bægerglasset"]].concat(NK.BAEGERE.map(function (n, i) {
                return [n, "bægerglas " + (i + 1)];
            })).forEach(function (b) {
                if (f.haendt["spild_" + b[0]]) UHELD.push("Uheld: " + b[1] + " blev rystet, så indholdet røg ud. Kemichael tørrede op.");
                if (f.haendt["overloeb_" + b[0]]) UHELD.push("Uheld: " + b[1] + " løb over. Kemichael tørrede op.");
            });
            if (f.haendt.spild_kolbe1 || f.haendt.spild_kolbe2) UHELD.push("Uheld: kolben med stamopløsning blev rystet, så det skvulpede ud. Kemichael tørrede op.");
            if (f.haendt.spild_vandbad || f.haendt.spild_isbad) UHELD.push("Uheld: et bad blev rystet, så vandet skvulpede ud. Kemichael tørrede op.");
            if (f.haendt.kolbeDunk) UHELD.push("Uheld: stamopløsningen blev hældt i affaldsdunken. Kemichael hentede mere.");
            UHELD.forEach(function (t) {
                rude(container, ++nr, t, function (ctx) {
                    var fa = M.baegerFarve(M.stamOpl(10));
                    ctx.fillStyle = NK.css({ r: fa.r, g: fa.g, b: fa.b, a: 0.85 });
                    ctx.beginPath();
                    ctx.ellipse(150, GLAS_Y + 162, 70, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    S.tegnDraaber(ctx, [
                        { x: 120, y: GLAS_Y + 60, r: 2.6, liv: 1, farve: fa },
                        { x: 150, y: GLAS_Y + 40, r: 2.2, liv: 1, farve: fa },
                        { x: 182, y: GLAS_Y + 70, r: 2.4, liv: 1, farve: fa }
                    ]);
                    tekst(ctx, "køkkenrulle", 150, GLAS_Y + 120, { farve: "#f0918a" });
                });
            });

            /* Ryddede han op undervejs, faar han en rude foer skemaet */
            var K = NK.Kemichael;
            if (K.uheldIForsoeget()) {
                rude(container, ++nr, K.oprydningsTekst(), function (ctx) {
                    K.tegneserieFigur(ctx, {
                        x: 150, gulv: GLAS_Y + 162, skala: 0.46, arm: 2.05,
                        udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.2, lukket: 1 },
                        haand: function (c, hd) {
                            NK.Sprites.tegnPositur(c, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, NK.Scene.ANKER.papir);
                        }
                    });
                });
            }

            /* 7. Resultatskemaet i sidste rude */
            var sidste = document.createElement("div");
            sidste.className = "rude skema-rude";
            var overskrift = document.createElement("p");
            var nrSpan = document.createElement("span");
            nrSpan.className = "nr";
            nrSpan.textContent = String(++nr);
            overskrift.appendChild(nrSpan);
            overskrift.appendChild(document.createTextNode("Resultatskema, del 1: de syv glas"));
            sidste.appendChild(overskrift);
            sidste.appendChild(resultatTabel(f));
            var t2 = del2Tabel(f);
            if (t2) {
                var o2 = document.createElement("p");
                o2.className = "del2";
                o2.textContent = "Del 2: fortynding set ovenfra";
                sidste.appendChild(o2);
                sidste.appendChild(t2);
            }
            container.appendChild(sidste);
        }
    };
}());
