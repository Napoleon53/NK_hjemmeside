/* =====================================================================
   tegneserie.js - forsoeget opsummeret som en tegneserie

   Bag knappen Tegneserie, som laases op, naar jernindholdet er beregnet.
   Hver rude er et udsnit af tegnebordet, tegnet med de samme funktioner
   som scenen, og en kort tekst. Ruderne bruger elevens egne tal. Hver
   fejl undervejs faar sin egen roede rude, og resultatskemaet med alle
   forsoeg staar i den sidste rude.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var BU = S.BURET;

    var B = 300, H = 214;

    /* Udsnit af tegnebordet: venstre kant, top og bredde i tegneenheder */
    var UDSNIT = {
        vaegt:  { x: 110, y: 360, b: 270 },
        skab:   { x: 455, y: 300, b: 300 },
        plade:  { x: 560, y: 300, b: 300 },
        buret:  { x: 700, y: 60, b: 640 },
        titrer: { x: 780, y: 250, b: 360 }
    };

    /* ----- Ruden ----------------------------------------------------------
       o = { udsnit, tegn(ctx) i tegneenheder, oven(ctx) i rudens pixels,
             fejl } */
    function rude(container, nr, tekstStr, o) {
        var div = document.createElement("div");
        div.className = "rude" + (o.fejl ? " fejl" : "");
        var canvas = document.createElement("canvas");
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(B * dpr);
        canvas.height = Math.round(H * dpr);
        var ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var u = o.udsnit || UDSNIT.skab;
        var s = B / u.b;
        ctx.save();
        ctx.scale(s, s);
        ctx.translate(-u.x, -u.y);
        baggrund(ctx, u);
        if (o.tegn) o.tegn(ctx);
        ctx.restore();
        if (o.oven) o.oven(ctx, function (x, y) { return { x: (x - u.x) * s, y: (y - u.y) * s }; });
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

    function baggrund(ctx, u) {
        var h = u.b * H / B;
        var g = ctx.createLinearGradient(0, u.y, 0, S.BORD);
        g.addColorStop(0, "#232a33");
        g.addColorStop(1, "#303843");
        ctx.fillStyle = g;
        ctx.fillRect(u.x - 2, u.y - 2, u.b + 4, h + 4);
        ctx.fillStyle = "#3b404b";
        ctx.fillRect(u.x - 2, S.BORD, u.b + 4, 9);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(u.x - 2, S.BORD, u.b + 4, 1.5);
        ctx.fillStyle = "#1c1f26";
        ctx.fillRect(u.x - 2, S.BORD + 9, u.b + 4, h);
    }

    /* Tekst i rudens pixels */
    function etiket(ctx, t, x, y, opt) {
        opt = opt || {};
        NK.tekst(ctx, t, x, y, {
            font: opt.font || "700 13px 'Segoe UI', sans-serif", justering: opt.justering || "center", linje: "middle",
            farve: opt.farve || "#dfe5ec", kant: true
        });
    }

    function pil(ctx, x1, y1, x2, y2, farve) {
        var v = Math.atan2(y2 - y1, x2 - x1);
        ctx.save();
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.fillStyle = farve || "#f2c53d";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2 - Math.cos(v) * 6, y2 - Math.sin(v) * 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - Math.cos(v - 0.5) * 9, y2 - Math.sin(v - 0.5) * 9);
        ctx.lineTo(x2 - Math.cos(v + 0.5) * 9, y2 - Math.sin(v + 0.5) * 9);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /* Burettens skala tæt på, med menisken i midten. I rudens pixels. */
    function skala(ctx, cx, cy, h, V) {
        var halv = 22, prMl = h / 2.4;
        ctx.save();
        ctx.fillStyle = "#12151b";
        NK.rundtRekt(ctx, cx - halv - 4, cy - h / 2 - 4, 2 * halv + 8, h + 8, 6);
        ctx.fill();
        ctx.beginPath();
        ctx.rect(cx - halv, cy - h / 2, 2 * halv, h);
        ctx.clip();
        ctx.fillStyle = "rgba(210, 228, 240, 0.08)";
        ctx.fillRect(cx - halv, cy - h / 2, 2 * halv, h);
        ctx.fillStyle = "rgba(110, 22, 128, 0.95)";
        ctx.beginPath();
        ctx.moveTo(cx - halv, cy - 3);
        ctx.quadraticCurveTo(cx, cy + 4, cx + halv, cy - 3);
        ctx.lineTo(cx + halv, cy + h);
        ctx.lineTo(cx - halv, cy + h);
        ctx.closePath();
        ctx.fill();
        for (var n = Math.floor((V - 1.3) * 10); n <= Math.ceil((V + 1.3) * 10); n++) {
            if (n < 0 || n > 500) continue;
            var y = cy + (n / 10 - V) * prMl;
            var hel = n % 10 === 0, halvt = n % 5 === 0;
            ctx.beginPath();
            ctx.moveTo(cx - halv, y);
            ctx.lineTo(cx - halv + (hel ? 20 : (halvt ? 13 : 7)), y);
            ctx.strokeStyle = "rgba(245, 248, 252, 0.95)";
            ctx.lineWidth = hel ? 1.6 : 1;
            ctx.stroke();
            if (hel) etiket(ctx, String(n / 10), cx + 8, y, { font: "700 12px 'Segoe UI', sans-serif", justering: "left" });
        }
        ctx.restore();
        ctx.strokeStyle = "rgba(198, 222, 240, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - halv, cy - h / 2, 2 * halv, h);
    }

    /* Farven i en kolbe: fe2 og fe3 fra 0 til 1, I er den lyserøde intensitet */
    function farve(opt) {
        var kem = M.nyKemi();
        kem.syre = "svovlsyre";
        kem.ml = opt.ml || 50;
        var l = kem.ml / 1000;
        kem.nFe2 = (opt.fe2 || 0) * 0.04 * l;
        kem.nFe3 = (opt.fe3 || 0) * 0.04 * l;
        kem.nMnO4 = (opt.I || 0) * 2e-4 * l;
        return M.kolbeFarve(kem);
    }

    function kolbe(p, opt) {
        opt = opt || {};
        return {
            p: p, ml: opt.ml === undefined ? 50 : opt.ml, farve: opt.farve || farve(opt),
            lokal: opt.lokal || 0, lokalX: p.x, jern: opt.jern || 0,
            bobler: opt.bobler || [], boelge: opt.boelge || 0, hvirvel: 0, fremhaev: false
        };
    }

    function bobler(n) {
        var ud = [];
        for (var i = 0; i < n; i++) ud.push({ x: 48 + Math.sin(i * 2.3) * 22, y: 112 - (i * 13) % 50, r: 1 + (i % 3) * 0.5 });
        return ud;
    }

    function totter(m) {
        var n = NK.klamp(Math.round(m / 0.02), 1, 12), ud = [];
        for (var i = 0; i < n; i++) ud.push({ dx: (i - (n - 1) / 2) * 5, dy: -2 - i * 1.2, a: i * 0.7, s: 0.95 });
        return ud;
    }

    /* Titreropstillingen: stativ, buret og det, der staar under */
    function opstilling(ctx, V, opt) {
        opt = opt || {};
        S.tegnStativ(ctx);
        if (opt.affald !== undefined) S.tegnAffald(ctx, { p: S.HJEM.affald, ml: opt.affald }, 0);
        if (opt.kolbe) S.tegnKolbe(ctx, opt.kolbe, 0);
        if (opt.plet) S.tegnPlet(ctx, { x: BU.x + 18, y: S.STATIV.y - 1, styrke: 1 });
        S.tegnBuret(ctx, { V: V, fyldt: true, tragt: !!opt.tragt, aaben: !!opt.aaben }, 0);
        S.tegnKlemme(ctx);
        if (opt.draaber) S.tegnDraaber(ctx, [{ x: BU.x, y: BU.spids + 26, r: 2.4 }, { x: BU.x, y: BU.spids + 62, r: 2.4 }]);
        if (opt.aaben) {
            ctx.strokeStyle = "rgba(120, 26, 138, 0.9)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(BU.x, BU.spids);
            ctx.lineTo(BU.x, opt.straaleTil || S.FLISE.y);
            ctx.stroke();
        }
    }

    function flaske(ctx, navn, p) {
        NK.Sprites.tegnPositur(ctx, navn, p, S.ANKER[navn]);
    }

    /* Rude uden udsnit af bordet: kun det, oven tegner */
    function tavle(ctx) {
        ctx.fillStyle = "#1d2128";
        ctx.fillRect(0, 0, B, H);
    }

    function soejle(ctx, y, navn, v, farveStr) {
        etiket(ctx, navn, 14, y, { justering: "left", font: "600 12px 'Segoe UI', sans-serif", farve: "#c8ced6" });
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        NK.rundtRekt(ctx, 104, y - 6, 130, 12, 6);
        ctx.fill();
        ctx.fillStyle = farveStr;
        NK.rundtRekt(ctx, 104, y - 6, 130 * NK.klamp(v / 120, 0.02, 1), 12, 6);
        ctx.fill();
        etiket(ctx, M.komma(v, 1) + " %", 290, y, { justering: "right" });
    }

    NK.Tegneserie = {
        byg: function (f, container) {
            container.innerHTML = "";
            var nr = 0;
            var kem = f.kem, gj = f.iagttaget;
            var m = f.mStaal || 0;
            var vStart = f.vStart === null ? 0 : f.vStart;
            var vSlut = f.vSlut === null ? vStart : f.vSlut;
            var res = f.resultater.length ? f.resultater[f.resultater.length - 1] : null;
            /* Kolben kan vaere toemt efter beregningen: syren staar i resultatet */
            var sid = res && f.gjort.beregn ? res.syre : M.syreId(kem);
            var procent = res ? res.procent : (m > 0 ? M.jernprocent(m, vStart, vSlut) : 0);
            var t = M.mellemregning(m || 1, vStart, vSlut);
            var UNDER = S.UNDER_BURET;

            rude(container, ++nr, "Stålulden afvejes i en vejebåd: m = " + M.komma(m, 3) + " g.", {
                udsnit: UDSNIT.vaegt,
                tegn: function (ctx) {
                    S.tegnVaegt(ctx, M.komma(m, 3) + " g", true);
                    S.tegnVejebaad(ctx, S.HJEM.vejebaad, totter(m));
                }
            });

            var foerste = kem.syre || "svovlsyre";
            rude(container, ++nr, sid ? M.syreNavn(sid) + " hældes over stålulden i kolben." : "Stålulden kommer i kolben.", {
                udsnit: UDSNIT.skab,
                tegn: function (ctx) {
                    var k = S.HJEM.kolbe;
                    S.tegnKolbe(ctx, kolbe(k, { ml: sid ? 40 : 0, jern: 0.9 }), 0);
                    if (!sid) return;
                    var fp = { x: k.x - 26, y: k.y - 30, v: 2.05 };
                    flaske(ctx, foerste, fp);
                    S.tegnStraale(ctx, NK.tilVerden(fp, S.ANKER[foerste], 23, 4), { x: k.x + 2, y: k.y + 96 }, M.FARVE.syre, 3, 0);
                }
            });

            rude(container, ++nr, "På varmepladen oxideres jernet af syren: Fe(s) + 2 H⁺(aq) → Fe²⁺(aq) + H₂(g). Boblerne er H₂.", {
                udsnit: UDSNIT.plade,
                tegn: function (ctx) {
                    S.tegnVarmeplade(ctx, 80, true);
                    S.tegnKolbe(ctx, kolbe(S.PAA_PLADE, { fe2: 0.8, jern: 0.25, bobler: bobler(12) }), 0);
                    S.tegnDampe(ctx, [{ x: S.PAA_PLADE.x - 4, y: S.PAA_PLADE.y - 14, r: 6, liv: 1 }, { x: S.PAA_PLADE.x + 6, y: S.PAA_PLADE.y - 34, r: 9, liv: 0.8 }]);
                }
            });

            rude(container, ++nr, "Buretten fyldes med 0,0200 M KMnO₄ og tappes af til nulstregen: V(start) = " + M.komma(vStart, 2) + " mL.", {
                udsnit: UDSNIT.buret,
                tegn: function (ctx) {
                    opstilling(ctx, vStart, { affald: 1.5 });
                    flaske(ctx, "kmno4", S.HJEM.kmno4);
                },
                oven: function (ctx, pt) {
                    var mp = pt(BU.x + 10, S.buretY(vStart));
                    pil(ctx, mp.x + 4, mp.y, 196, 96);
                    skala(ctx, 228, 96, 150, vStart);
                    etiket(ctx, "V(start)", 228, 196);
                }
            });

            rude(container, ++nr, "Hver dråbe MnO₄⁻ reagerer straks med Fe²⁺, så den lilla farve forsvinder: MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O.", {
                udsnit: UDSNIT.titrer,
                tegn: function (ctx) {
                    var V = vStart + 0.6 * (vSlut - vStart);
                    opstilling(ctx, V, { kolbe: kolbe(UNDER, { fe2: 0.5, fe3: 0.5, lokal: 3, ml: 60 }), draaber: true });
                }
            });

            var lyserod = f.aflaestI >= M.TITRER.synlig;
            rude(container, ++nr, (lyserod ? "Når al Fe²⁺ er brugt, bliver den næste dråbe ikke omsat, og opløsningen bliver svagt lyserød. " : "Buretten aflæses igen. ") + "V(slut) = " + M.komma(vSlut, 2) + " mL.", {
                udsnit: UDSNIT.titrer,
                tegn: function (ctx) {
                    opstilling(ctx, vSlut, { kolbe: kolbe(UNDER, { fe3: 1, I: f.aflaestI || 0, ml: 70 }) });
                },
                oven: function (ctx, pt) {
                    var mp = pt(BU.x + 10, S.buretY(vSlut));
                    pil(ctx, mp.x + 4, mp.y, 212, 96);
                    skala(ctx, 244, 96, 150, vSlut);
                    etiket(ctx, "V(slut)", 244, 196);
                }
            });

            var vurdering;
            if (procent > 101) vurdering = "Resultatet er over 100 %. Der er brugt mere KMnO₄, end jernet kan forklare.";
            else if (procent < 95) vurdering = "Resultatet er lavere end de 98,5 %, som ståluld typisk indeholder.";
            else vurdering = "Resultatet passer med, at ståluld er næsten rent jern.";
            rude(container, ++nr, vurdering, {
                oven: function (ctx) {
                    tavle(ctx);
                    var L = { justering: "left", font: "600 13px 'Segoe UI', sans-serif" };
                    etiket(ctx, "V = " + M.komma(t.V, 2) + " mL", 14, 24, L);
                    etiket(ctx, "n(MnO₄⁻) = " + M.videnskabelig(t.nMn, 2) + " mol", 14, 50, L);
                    etiket(ctx, "n(Fe²⁺) = 5 · n(MnO₄⁻) = " + M.videnskabelig(t.nFe, 2) + " mol", 14, 76, L);
                    etiket(ctx, "m(Fe) = " + M.komma(t.mFe, 4) + " g", 14, 102, L);
                    soejle(ctx, 150, "Dit resultat", procent, "#f2c53d");
                    soejle(ctx, 180, "Ståluld", M.STAALULD.typisk, "#8a95a3");
                }
            });

            /* Fejl og uheld: én roed rude for hver */
            var TIT = UDSNIT.titrer;
            function underBuret(opt) { return kolbe(UNDER, opt); }
            var FEJL = [
                ["lidtStaal", "Kun " + M.komma(m, 3) + " g ståluld. Et lille forbrug af KMnO₄ giver en større relativ usikkerhed.", UDSNIT.vaegt, function (ctx) {
                    S.tegnVaegt(ctx, M.komma(m, 3) + " g", true);
                    S.tegnVejebaad(ctx, S.HJEM.vejebaad, totter(m));
                }],
                ["megetStaal", "Hele " + M.komma(m, 3) + " g ståluld. Titreringen kræver meget KMnO₄, og buretten kan løbe tør.", UDSNIT.vaegt, function (ctx) {
                    S.tegnVaegt(ctx, M.komma(m, 3) + " g", true);
                    S.tegnVejebaad(ctx, S.HJEM.vejebaad, totter(m));
                }],
                ["vaegt", "Syren blev hældt ud over vægten i stedet for i kolben.", UDSNIT.vaegt, function (ctx) {
                    S.tegnVaegt(ctx, "0,000 g", true);
                    S.tegnSyrepyt(ctx, { x: S.VAEGT.vejeskaal.x, rx: 50, alfa: 1 });
                }],
                ["toSyrer", "Både svovlsyre og saltsyre kom i kolben. Chloridet fra saltsyren bruger også KMnO₄, så resultatet bliver for højt.", UDSNIT.skab, function (ctx) {
                    var k = S.HJEM.kolbe;
                    S.tegnKolbe(ctx, kolbe(k, { ml: 100, fe2: 0.3 }), 0);
                    flaske(ctx, "svovlsyre", S.HJEM.svovlsyre);
                    var fp = { x: k.x - 26, y: k.y - 30, v: 2.05 };
                    flaske(ctx, "saltsyre", fp);
                    S.tegnStraale(ctx, NK.tilVerden(fp, S.ANKER.saltsyre, 23, 4), { x: k.x + 2, y: k.y + 80 }, M.FARVE.syre, 3, 0);
                }],
                ["kmno4Kolbe", "KMnO₄ blev hældt direkte i kolben. Det reagerede med jernet uden at blive målt, så resultatet bliver for lavt.", UDSNIT.skab, function (ctx) {
                    var k = S.HJEM.kolbe;
                    S.tegnKolbe(ctx, kolbe(k, { ml: 58, fe3: 1, I: 3 }), 0);
                    var fp = { x: k.x - 26, y: k.y - 30, v: 2.05 };
                    flaske(ctx, "kmno4", fp);
                    S.tegnStraale(ctx, NK.tilVerden(fp, S.ANKER.kmno4, 23, 4), { x: k.x + 2, y: k.y + 90 }, M.FARVE.kmno4, 2.4, 0);
                }],
                ["ingenSyre", "Der blev titreret uden syre. Stålulden var ikke opløst, så der var intet Fe²⁺ at titrere.", TIT, function (ctx) {
                    opstilling(ctx, vSlut, { kolbe: underBuret({ ml: 12, I: 6, jern: 0.9 }) });
                }],
                ["uoploest", "Kolben kom under buretten, før al stålulden var opløst. Det uopløste jern blev ikke titreret, så resultatet bliver for lavt.", TIT, function (ctx) {
                    opstilling(ctx, vStart, { kolbe: underBuret({ fe2: 0.6, jern: 0.4 }) });
                }],
                ["glemtStart", "Buretten blev ikke aflæst, før titreringen begyndte. Kemichael skrev V(start) = " + M.komma(vStart, 2) + " mL op.", UDSNIT.buret, function (ctx) {
                    opstilling(ctx, vStart, { affald: 1.5 });
                    flaske(ctx, "kmno4", S.HJEM.kmno4);
                }],
                ["ikkeNulstillet", "Titreringen begyndte, mens menisken stod over nulstregen. V(start) blev skrevet som 0,00 mL, så resultatet bliver for lavt.", TIT, function (ctx) {
                    opstilling(ctx, -1.2, { kolbe: underBuret({ fe2: 0.8, lokal: 3 }), aaben: true, straaleTil: UNDER.y + 100 });
                }],
                ["affaldTaelt", "Efter startaflæsningen løb KMnO₄ i affaldsbægeret. Det tæller med i forbruget, så resultatet bliver for højt.", TIT, function (ctx) {
                    opstilling(ctx, vStart + 2, { affald: 3, aaben: true, straaleTil: S.HJEM.affald.y + 76 });
                }],
                ["genfyldt", "Buretten blev fyldt op efter startaflæsningen. Aflæsningerne passer ikke længere til forbruget.", UDSNIT.buret, function (ctx) {
                    opstilling(ctx, -1, { kolbe: underBuret({ fe3: 0.6, fe2: 0.4 }), tragt: true });
                    var fp = { x: BU.x - 7, y: 86, v: 2.05 };
                    flaske(ctx, "kmno4", fp);
                    S.tegnStraale(ctx, NK.tilVerden(fp, S.ANKER.kmno4, 23, 4), { x: BU.x, y: 100 }, M.FARVE.kmno4, 2.4, 0);
                }],
                ["ikkeLyserod", "Buretten blev aflæst, før opløsningen var lyserød. Titreringen var ikke færdig, så resultatet bliver for lavt.", TIT, function (ctx) {
                    opstilling(ctx, vSlut, { kolbe: underBuret({ fe2: 0.4, fe3: 0.6, ml: 65 }) });
                }],
                ["lilla", "Opløsningen var kraftigt lilla ved aflæsningen. Der er tilsat for meget KMnO₄, så resultatet bliver for højt.", TIT, function (ctx) {
                    opstilling(ctx, vSlut, { kolbe: underBuret({ fe3: 1, I: 4, ml: 75 }) });
                }],
                ["klor", "Det lugtede af klor: MnO₄⁻ oxiderede også Cl⁻ fra saltsyren til Cl₂.", TIT, function (ctx) {
                    opstilling(ctx, vSlut, { kolbe: underBuret({ fe3: 1, I: 0.3, ml: 70 }) });
                    S.tegnDampe(ctx, [0, 1, 2, 3].map(function (i) { return { x: UNDER.x - 10 + i * 8, y: UNDER.y - 10 - i * 16, r: 8 + i * 3, liv: 1, alfa: 0.35, farve: "#c9e27a" }; }));
                }],
                ["falmer", "Den lyserøde farve forsvandt igen. Chlorid bruger langsomt overskuddet af MnO₄⁻.", TIT, function (ctx) {
                    opstilling(ctx, vSlut, { kolbe: underBuret({ fe3: 1, I: 0.02, ml: 70 }) });
                }],
                ["skvulp", "Kolben blev rystet så voldsomt, at noget af opløsningen skvulpede ud. Det tabte jern gør resultatet for lavt.", TIT, function (ctx) {
                    var kp = { x: UNDER.x + 6, y: UNDER.y, v: 0.12 };
                    opstilling(ctx, vStart + 8, { kolbe: kolbe(kp, { fe2: 0.5, fe3: 0.5, ml: 60, boelge: 6 }) });
                    ctx.fillStyle = "rgba(220, 225, 160, 0.9)";
                    [[-30, -20], [34, -34], [-50, 10], [48, 0], [20, -52]].forEach(function (d) {
                        ctx.beginPath();
                        ctx.arc(kp.x + d[0], kp.y + d[1], 3, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }],
                ["overloeb", "Buretten blev fyldt, mens den var fuld, og løb over. Kemichael kom forbi.", UDSNIT.buret, function (ctx) {
                    opstilling(ctx, -2.5, { affald: 1, plet: true, tragt: true });
                }],
                ["spild", "Hanen var åben uden noget under buretten, og KMnO₄ løb ud på flisen.", TIT, function (ctx) {
                    opstilling(ctx, vStart + 1, { aaben: true, plet: true });
                }]
            ];
            FEJL.forEach(function (fj) {
                if (gj[fj[0]]) rude(container, ++nr, fj[1], { udsnit: fj[2], tegn: fj[3], fejl: true });
            });

            /* Ryddede han op undervejs, faar han en rude foer skemaet */
            var K = NK.Kemichael;
            if (K.uheldIForsoeget()) {
                rude(container, ++nr, K.oprydningsTekst(), {
                    udsnit: UDSNIT.skab,
                    oven: function (ctx) {
                        K.tegneserieFigur(ctx, {
                            x: 150, gulv: 196, skala: 0.46, arm: 2.05,
                            udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.2, lukket: 1 },
                            haand: function (c, hd) {
                                NK.Sprites.tegnPositur(c, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, S.ANKER.papir);
                            }
                        });
                    }
                });
            }

            skema(container, ++nr, f);
        }
    };

    /* ----- Resultatskemaet: alle forsoeg ved siden af hinanden ------------ */
    function skema(container, nr, f) {
        var div = document.createElement("div");
        div.className = "rude skema";
        var p = document.createElement("p");
        var sp = document.createElement("span");
        sp.className = "nr";
        sp.textContent = String(nr);
        p.appendChild(sp);
        p.appendChild(document.createTextNode("Resultater"));
        div.appendChild(p);

        var liste = f.resultater.slice(-4);
        var tabel = document.createElement("table");
        tabel.className = "resultater";
        function raekke(navn, vaerdi, hoved) {
            var tr = document.createElement("tr");
            var th = document.createElement("th");
            th.textContent = navn;
            tr.appendChild(th);
            liste.forEach(function (x) {
                var c = document.createElement(hoved ? "th" : "td");
                c.textContent = vaerdi(x);
                if (!hoved && x.nr === f.forsoegNr) c.className = "aktuel";
                tr.appendChild(c);
            });
            tabel.appendChild(tr);
        }
        raekke("", function (x) { return "Forsøg " + x.nr; }, true);
        raekke("Syre", function (x) { return M.syreNavn(x.syre); });
        raekke("m(ståluld)", function (x) { return M.komma(x.m, 3) + " g"; });
        raekke("V(start)", function (x) { return M.komma(x.vStart, 2) + " mL"; });
        raekke("V(slut)", function (x) { return M.komma(x.vSlut, 2) + " mL"; });
        raekke("V(KMnO₄)", function (x) { return M.komma(x.vSlut - x.vStart, 2) + " mL"; });
        raekke("Jernindhold", function (x) { return M.komma(x.procent, 1) + " %"; });
        div.appendChild(tabel);

        var note = document.createElement("p");
        note.className = "skema-note";
        note.textContent = "c(KMnO₄) = 0,0200 M. Ståluld indeholder typisk 98,5 % jern.";
        div.appendChild(note);
        container.appendChild(div);
    }
}());
