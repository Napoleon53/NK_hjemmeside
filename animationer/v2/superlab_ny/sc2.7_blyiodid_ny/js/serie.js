/* =====================================================================
   serie.js - sc2.7 som tegneserie

   Rammen staar i ../../laboratoriet/js/tegneserie.js: ruden, udsnittet af
   tegnebordet, oejebliksbilledet, pilen, etiketten og skemaet. Her staar
   kun, HVILKE ruder sc2.7 har, og teksterne staar i js/tekst.js under
   noeglen "serie".

   Ruderne er tegnet af elevens egne tal. To slags kilder:

     * journalen "maaling" (js/maaling.js): hver post har den noterede
       temperatur og et oejebliksbillede af glasset, som det saa ud, da
       der blev trykket - masserne, rumfanget og opskriften.
     * oejeblikkene her i filen: hvad der stod i glasset, da noget skete
       (bundfaldet kom, glasset blev klart, det kogte). Forloebets
       udloesere kalder SE, naar de fyrer, saa det er verden i det
       oejeblik, der gemmes - ikke en historie skrevet i forvejen. Det er
       den samme regel som journalens.

   Haelder eleven glasset ud bagefter, staar tegneserien stadig med det,
   han saa. Derfor tegnes hver rude af en loesreven kopi af glasset med
   den gemte opskrift i - aldrig af bordet, som det ser ud nu.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var TS = NK.Tegneserie;
    var St = NK.Stof, B = NK.Beholder;

    var TEK = NK.TEKST.serie || {};
    var R = TEK.ruder || {};
    var GLAS = "baeger";

    /* ----- Tal ----------------------------------------------------------- */
    function komma(x, n) {
        return (Math.round(x * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n).replace(".", ",");
    }
    function grader(T) { return komma(T, 1) + " °C"; }

    /* ----- Oejeblikkene --------------------------------------------------
       Det, der stod i glasset, da noget skete. Gemmes én gang hver og
       ryddes med bordet (js/app.js). */
    var OEJEBLIKKE = {};

    /* mest: et fast stof, ruden skal vise saa meget som muligt af. Staar
       det, erstattes oejeblikket, saa laenge bundfaldet vokser - ellers
       gemmes kun det foerste. */
    function se(navn, bord, mest) {
        var haves = OEJEBLIKKE[navn];
        if (haves && !mest) return null;
        bord = bord || (NK.Side.nu && NK.Side.nu.bord());
        var gg = bord && bord.g[GLAS];
        if (!gg) return null;
        var o = B.samlet(gg);
        if (haves && mest && (o.n[mest] || 0) <= (haves.opl.umol[mest] || 0)) return null;
        OEJEBLIKKE[navn] = {
            opl: St.opskrift(o),
            T: o.T,
            varme: !!(bord.g.plade && bord.g.plade.taendt),
            omroerer: !!(bord.g.plade && bord.g.plade.omroerer)
        };
        return OEJEBLIKKE[navn];
    }

    /* ----- Kopier af glasset og pladen ------------------------------------ */
    /* Glassets plads paa varmepladen, ogsaa naar det er taget op */
    function plads(gg) {
        if (!gg) return null;
        var p = (gg.hjemPaa && gg.hjemPaa.p) || gg.hjem || gg.p;
        return { x: p.x, y: p.y, v: 0 };
    }

    /* Glinsende flager, der ikke skifter fra gang til gang: samme rude,
       samme billede (rammens froe daekker kun det, der tegnes med
       Math.random undervejs) */
    function slump(i, froe) {
        var x = Math.sin(i * 12.9898 + froe * 78.233) * 43758.5453;
        return x - Math.floor(x);
    }
    function flager(antal, froe, falder) {
        var ud = [];
        for (var i = 0; i < antal; i++) {
            ud.push({
                u: 0.08 + slump(i, froe) * 0.84,
                v: falder ? 0.16 + slump(i, froe + 3) * 0.7 : 0.02 + slump(i, froe + 3) * 0.1,
                a: slump(i, froe + 7) * 6.28,
                s: 0.016 + (i % 3) * 0.006,
                alfa: 1
            });
        }
        return ud;
    }

    function glasSom(bord, opl, valg) {
        valg = valg || {};
        var k = TS.kopi(bord.g[GLAS], plads(bord.g[GLAS]));
        if (!k) return null;
        if (opl) k.indhold = St.lav(opl);
        if (valg.flager) {
            k.flager = flager(valg.flager, valg.froe || 1, valg.falder);
            k.flageFarve = St.stof("PbI2(s)").farve || { r: 255, g: 210, b: 46 };
        }
        return k;
    }

    function pladeSom(bord, varme, omroerer) {
        var k = TS.kopi(bord.g.plade);
        if (!k) return null;
        k.taendt = !!varme;
        k.omroerer = !!omroerer;
        return k;
    }

    /* En rude med varmepladen og bægerglasset paa. Teksten staar i
       tekst.js; etiketten er det ord, ruden skal ses efter. */
    function glasrude(bord, tekst, oejeblik, valg) {
        valg = valg || {};
        var g = glasSom(bord, oejeblik && oejeblik.opl, valg);
        if (!g) return null;
        var ting = [pladeSom(bord, valg.varme, valg.omroerer), g];
        return {
            tekst: tekst,
            froe: valg.froe || 1,
            udsnit: TS.omkring(ting, 40),
            ting: ting,
            oven: valg.etiket ? function (ctx) {
                TS.etiket(ctx, valg.etiket, TS.B / 2, 18, { farve: valg.etiketFarve || "#f2c53d" });
            } : undefined,
            alt: valg.alt || "Bægerglasset på varmepladen"
        };
    }

    /* ----- Ruderne -------------------------------------------------------- */
    function ruder(bord) {
        var J = NK.MAALING.journal;
        var ud = [];
        ud.push(rudeVand(bord));
        ud.push(rudeAfvejning(bord, J));
        ud.push(rudeBundfald(bord));
        ud.push(rudeVarm(bord));
        ud.push(rudeRegn(bord, J));
        ud.push(rudeKoger(bord));
        uheldsruder(bord).forEach(function (r) { ud.push(r); });
        ud.push(rudeAffald(bord, J));
        ud.push(rudeGraf());
        ud.push(rudeSkema(J));
        return ud;
    }

    /* 1. Vandet i bægerglasset */
    function rudeVand(bord) {
        var o = OEJEBLIKKE.vand;
        if (!o) return null;
        return glasrude(bord, R.vand, o, { froe: 1, alt: "Bægerglasset med 100 mL vand på varmepladen" });
    }

    /* 2. Afvejningen: vaegten med vejebaaden og de to pulverglas ved siden
       af. Massen er den, eleven vejede af foerste gang. */
    function rudeAfvejning(bord, J) {
        var p1 = J.post("1");
        if (!p1 || !p1.billede) return null;
        var pb = p1.billede.pb, ki = p1.billede.ki;
        var vaegt = TS.kopi(bord.g.vaegt);
        if (!vaegt) return null;
        vaegt.vaegtTekst = komma(pb, 3) + " g";
        var baad = TS.kopi(bord.g.baad, plads(bord.g.baad));
        if (baad) baad.indhold = St.lav({ V: 0, T: 20, umol: { "Pb(NO3)2(s)": pb / 331.2 * 1e6 } });
        /* Pulverglassene staar paa hylden i scenen; i ruden hoerer de
           sammen med vaegten, for det er dér, de blev brugt */
        var pbG = TS.kopi(bord.g.pb, { x: vaegt.p.x + 170, y: NK.Scene.BORD, v: 0 });
        var kiG = TS.kopi(bord.g.ki, { x: vaegt.p.x + 250, y: NK.Scene.BORD, v: 0 });
        var ting = [vaegt, baad, pbG, kiG].filter(function (k) { return !!k; });
        return {
            tekst: (R.afvejning || "").replace("{pb}", komma(pb, 3)).replace("{ki}", komma(ki, 3)),
            froe: 2,
            udsnit: TS.omkring(ting, 36),
            ting: ting,
            alt: "Vægten med vejebåden og de to pulverglas"
        };
    }

    /* 3. Det gule bundfald, da KI kom i */
    function rudeBundfald(bord) {
        var o = OEJEBLIKKE.bundfald;
        if (!o) return null;
        return glasrude(bord, R.bundfald, o, {
            froe: 3, flager: 26, etiket: "PbI₂(s)",
            alt: "Bægerglasset med gult bundfald"
        });
    }

    /* 4. Varmt og klart */
    function rudeVarm(bord) {
        var o = OEJEBLIKKE.klar;
        if (!o) return null;
        return glasrude(bord, (R.varm || "").replace("{T}", grader(o.T)), o, {
            froe: 4, varme: o.varme, omroerer: o.omroerer,
            etiket: grader(o.T), etiketFarve: "#ffb27a",
            alt: "Bægerglasset klart og varmt på den tændte varmeplade"
        });
    }

    /* 5. Den gyldne regn: den foerste maaling, som eleven noterede den */
    function rudeRegn(bord, J) {
        var p1 = J.post("1");
        if (!p1 || !p1.billede) return null;
        var b = p1.billede;
        var t = (R.regn || "").replace("{nr}", "1").replace("{T}", grader(Number(p1.svar)))
            .replace("{m}", komma(b.pbi2 * 100 / (b.V || 100), 3));
        return glasrude(bord, t, { opl: b.opl }, {
            froe: 5, flager: 22, falder: true,
            etiket: grader(Number(p1.svar)), etiketFarve: "#f2c53d",
            alt: "Bægerglasset med glinsende krystaller, der daler ned gennem væsken"
        });
    }

    /* 6. Det kogte med bundfald i: for meget stof */
    function rudeKoger(bord) {
        var o = OEJEBLIKKE.koger;
        if (!o) return null;
        var r = glasrude(bord, R.koger, o, {
            froe: 6, varme: true, omroerer: o.omroerer, flager: 18,
            etiket: "100,0 °C", etiketFarve: "#f0918a",
            alt: "Bægerglasset koger med bundfald i"
        });
        if (r) r.fejl = true;
        return r;
    }

    /* 7. Uheldene: én roed rude for hvert. De staar i bordets haendt, og
       navnene staar i opstillingen - ikke her. */
    function uheldsruder(bord) {
        var ud = [];
        Object.keys(bord.haendt).forEach(function (n) {
            var i = n.indexOf("_");
            if (i < 0) return;
            var slags = n.slice(0, i), navn = n.slice(i + 1);
            var t = TEK.uheld && TEK.uheld[slags];
            var gg = bord.g[navn];
            if (!t || !gg) return;
            var bund = NK.Scene.BORD + 6;
            var ting = [TS.kopi(gg, { x: gg.p.x, y: bund - gg.type.h + gg.anker.y })];
            var f = B.er(gg) ? B.farve(gg) : null;
            var hvem = bord.opryddet && bord.opryddet[n];
            var laerer = hvem === "laerer" && NK.Kemichael && NK.Kemichael.tegneserieFigur;
            var O = TEK.oprydning || {};
            var efter = hvem === "laerer" ? (slags === "knust" ? O.laererKnust : O.laerer)
                : (hvem === "elev" ? O.elev : O.ingen);
            ud.push({
                tekst: t.replace("{glas}", gg.titel || navn) + (efter ? " " + efter : ""),
                fejl: true,
                froe: 20 + ud.length,
                udsnit: TS.omkring(ting, 70),
                ting: ting,
                tegn: function (ctx) {
                    NK.Tegning.tegnPyt(ctx, { x: gg.p.x + 30, y: bund, rx: 46, vaad: 1, farve: f || NK.Stof.VAND });
                },
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
                alt: "Uheldet med " + (gg.titel || navn)
            });
        });
        return ud;
    }

    /* 8. Resterne i dunken: glasset haelder ned i dunken med det, der var
       i det ved den sidste maaling. Genstandens anker er aabningens midte,
       saa straalen starter netop dér, glasset haelder fra. */
    function rudeAffald(bord, J) {
        var dunk = TS.kopi(bord.g.dunk);
        var sidste = J.post(String(J.antal()));
        if (!dunk || !sidste || !sidste.billede) return null;
        var d = bord.g.dunk;
        var top = { x: d.p.x - d.anker.x + d.type.b * 0.5, y: d.p.y - d.anker.y + 14 };
        var g = TS.kopi(bord.g[GLAS], { x: top.x - 16, y: top.y - 78, v: -0.95 });
        if (!g) return null;
        /* Halvdelen er haeldt i: resten staar stadig i glasset */
        var opl = sidste.billede.opl, halv = { V: (opl.V || 0) / 2, T: opl.T, umol: {} };
        Object.keys(opl.umol || {}).forEach(function (n) { halv.umol[n] = opl.umol[n] / 2; });
        g.indhold = St.lav(halv);
        var farve = B.farve(g) || St.VAND;
        var ting = [dunk, g];
        return {
            tekst: R.affald,
            froe: 8,
            udsnit: TS.omkring(ting, 40),
            ting: ting,
            tegn: function (ctx) {
                NK.Tegning.tegnStraale(ctx, { x: g.p.x, y: g.p.y + 2 }, top, farve, 3.5, 0);
            },
            alt: "Bægerglasset hældes ned i dunken til tungmetalaffald"
        };
    }

    /* 9. Grafen i en bred rude: den samme graf som i panelet (M9) */
    function rudeGraf() {
        var def = NK.MAALING.graf();
        if (!def) return null;
        return {
            tekst: R.graf,
            bred: true,
            ren: true,
            froe: 9,
            oven: function (ctx, pt, m) { NK.Graf.tegnPaa(ctx, m.b, m.h, def); },
            alt: "Graf: opløselighed mod temperatur med de tre målinger og tabelkurven"
        };
    }

    /* 10. Resultatskemaet */
    function rudeSkema(J) {
        var K = TEK.skema || {};
        var raekker = [K.hoved || []];
        J.svarede().sort(function (a, b) { return +a - +b; }).forEach(function (id) {
            var p = J.post(id), b = p.billede || {};
            raekker.push([
                id,
                komma(b.pb || 0, 3) + " g",
                komma(b.ki || 0, 3) + " g",
                komma(b.pbi2 || 0, 3) + " g",
                TS.svarCelle({ svar: grader(Number(p.svar)) }),
                p.facit === undefined || p.facit === null ? "" : grader(p.facit)
            ]);
        });
        var alleRigtige = J.antalRigtige() === J.antal();
        return {
            tekst: K.titel || "",
            uden: true,
            bred: true,
            dom: function (div) {
                div.appendChild(TS.tabel(raekker));
                var p = document.createElement("p");
                p.textContent = alleRigtige ? (K.konklusion || "") : (K.konklusionAfvig || "");
                div.appendChild(p);
            }
        };
    }

    NK.SERIE = {
        OEJEBLIKKE: OEJEBLIKKE,
        se: se,
        nulstil: function () { Object.keys(OEJEBLIKKE).forEach(function (n) { delete OEJEBLIKKE[n]; }); },
        ruder: ruder
    };
}());
