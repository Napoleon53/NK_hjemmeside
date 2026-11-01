/* =====================================================================
   fig_navne.js - figuren til 2.2 Ioners navne

   Et kort pr. ion med en kuglemodel og formlen, og et navneskilt under
   kortet. Foerst de positive ioner, saa de negative af ét atom (og et
   lille kort, der viser endelsen -id), til sidst de seks sammensatte
   ioner i en ramme som i bogens figur sammensatte-ioner. Positive ioner
   er roede, negative blaa, som i bogen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var KB = 170, KH = 128;                         /* et ionkort */
    var R1 = 40, R2 = 238, R3 = 450, R4 = 618;      /* raekkernes top */
    var RAMME = { x: 18, y: 418, b: 964, h: 362 };  /* de sammensatte ioner */
    var ID = { x: 612, y: 40, b: 366, h: 132 };     /* kortet med -id */
    var KOL5 = [30, 220, 410, 600, 790];
    var KOL3 = [100, 415, 730];

    /* Pladsen til navnet sidder som et skilt under kortet */
    function navn(id, ord, x, y, dele, fejl) {
        return { id: id, ord: ord || [id], x: x + KB / 2, y: y + KH, maal: [x + KB / 2, y + KH], titel: true,
            dele: dele, omr: [{ r: [x - 5, y - 5, KB + 10, KH + 10, 14] }], fejl: fejl };
    }

    function kort(g, x, y, positiv) {
        SV.el("rect", { x: x, y: y, width: KB, height: KH, rx: 12, fill: positiv ? "#fbf1ef" : "#eef3fc",
            stroke: positiv ? "#e3b3ab" : "#adc3e8", "stroke-width": 1.5, filter: "url(#skygge)" }, g);
    }

    /* En ion af ét atom: en kugle med symbolet og formlen under */
    function enkel(g, x, y, sym, formel, r, positiv) {
        kort(g, x, y, positiv);
        var k = SV.kugle(g, x + KB / 2, y + 44, r, positiv ? "proton" : "elektron", sym);
        SV.tekst(g, x + KB / 2, y + 100, formel, { "font-size": 23, "font-weight": 700, fill: positiv ? "#b8382d" : "#2a55b0" });
        return k;
    }

    /* En sammensat ion: kuglemodel i en klamme med ladningen, formlen under */
    function sammensat(g, x, y, model, formel, ladning, positiv) {
        kort(g, x, y, positiv);
        var cx = x + KB / 2, cy = y + 44;
        var m = SV.g(g);
        model(m, cx, cy);
        var farve = positiv ? F.roed : F.blaa;
        var k = 44;
        SV.el("path", { d: "M" + (cx - k + 7) + "," + (cy - 40) + " h-7 v80 h7", fill: "none", stroke: farve, "stroke-width": 2.2 }, g);
        SV.el("path", { d: "M" + (cx + k - 7) + "," + (cy - 40) + " h7 v80 h-7", fill: "none", stroke: farve, "stroke-width": 2.2 }, g);
        SV.tekst(g, cx + k + 6, cy - 32, ladning, { "font-size": 15, "font-weight": 700, fill: farve, "text-anchor": "start" });
        SV.tekst(g, cx, y + 102, formel, { "font-size": 23, "font-weight": 700, fill: positiv ? "#b8382d" : "#2a55b0" });
        return m;
    }

    function rundt(m, cx, cy, midt, rM, ydre, rY, n, d, start) {
        for (var i = 0; i < n; i++) {
            var v = (start + i * 360 / n) * Math.PI / 180;
            SV.kugle(m, cx + d * Math.cos(v), cy + d * Math.sin(v), rY, ydre, ydre === "H" ? "H" : "O");
        }
        SV.kugle(m, cx, cy, rM, midt, midt === "N" ? "N" : (midt === "C" ? "C" : (midt === "S" ? "S" : "P")));
    }

    var MODEL = {
        OH: function (m, cx, cy) { SV.kugle(m, cx + 14, cy, 10, "H", "H"); SV.kugle(m, cx - 6, cy, 16, "O", "O"); },
        NO3: function (m, cx, cy) { rundt(m, cx, cy, "N", 13, "O", 12, 3, 22, -90); },
        CO3: function (m, cx, cy) { rundt(m, cx, cy, "C", 13, "O", 12, 3, 22, -90); },
        SO4: function (m, cx, cy) { rundt(m, cx, cy, "S", 14, "O", 11.5, 4, 23, -45); },
        PO4: function (m, cx, cy) { rundt(m, cx, cy, "P", 14, "O", 11.5, 4, 23, -45); },
        NH4: function (m, cx, cy) { rundt(m, cx, cy, "N", 14, "H", 9.5, 4, 21, -45); }
    };

    /* Hvor "id" staar i ordet bromid (maales, saa det gule felt passer) */
    var IDT = (function () {
        var x0 = ID.x + 250, b1 = NK.tekstBredde("brom", 24, 700), b2 = NK.tekstBredde("id", 24, 700);
        return { x0: x0, idX: x0 + b1, idB: b2, y: ID.y + 92 };
    }());

    var J2 = { "jern(III)ion": "<b>jern(III)ion</b> er Fe³⁺. Ionen på kortet har ladningen 2+." };
    var J3 = { "jern(II)ion": "<b>jern(II)ion</b> er Fe²⁺. Ionen på kortet har ladningen 3+." };
    var HELT = function (o) { return "<b>" + o + "</b> er navnet på en hel ion. Pladsen peger kun på de to sidste bogstaver."; };

    NK.FIGURER.navne = {
        vb: [1000, 792],
        lag: [
            { navn: "Positive ioner", pladser: ["natriumion", "jern(II)ion", "jern(III)ion"], ekstra: ["ammonium"],
              ros: "Positive ioner af ét atom hedder grundstoffets navn og ion. Jern kan danne to, så ladningen står i parentes." },
            { navn: "Negative ioner", pladser: ["-id", "fluorid", "chlorid", "oxid", "sulfid", "nitrid"], ekstra: ["sulfat"],
              ros: "Negative ioner af ét atom ender på -id og bygger på grundstoffets internationale navn." },
            { navn: "Sammensatte ioner", pladser: ["sammensat ion", "hydroxid", "nitrat", "carbonat"],
              ros: "En sammensat ion er en gruppe atomer med én fælles ladning." },
            { navn: "Flere sammensatte ioner", pladser: ["sulfat", "phosphat", "ammonium"],
              ros: "Ammonium er den eneste positive af de seks sammensatte ioner." }
        ],
        pladser: [
            navn("natriumion", null, KOL5[0], R1, ["na"],
                { ammonium: "<b>ammonium</b> er den sammensatte ion NH₄⁺. Kortet viser kun ét natriumatom." }),
            navn("jern(II)ion", null, KOL5[1], R1, ["fe2"], J2),
            navn("jern(III)ion", null, KOL5[2], R1, ["fe3"], J3),

            { id: "-id", ord: ["-id"], x: ID.x + ID.b / 2, y: ID.y + ID.h + 34, maal: [IDT.idX + IDT.idB / 2, IDT.y + 8], dele: ["id"],
              omr: [{ r: [IDT.idX - 4, IDT.y - 24, IDT.idB + 8, 32, 6] }],
              fejl: { chlorid: HELT("chlorid"), fluorid: HELT("fluorid"), oxid: HELT("oxid"), sulfid: HELT("sulfid"), nitrid: HELT("nitrid") } },
            navn("fluorid", null, KOL5[0], R2, ["f"]),
            navn("chlorid", null, KOL5[1], R2, ["cl"]),
            navn("oxid", null, KOL5[2], R2, ["o"]),
            navn("sulfid", null, KOL5[3], R2, ["s"],
                { sulfat: "<b>sulfat</b> er den sammensatte ion SO₄²⁻. S²⁻ er kun ét svovlatom." }),
            navn("nitrid", null, KOL5[4], R2, ["n"]),

            { id: "sammensat ion", ord: ["sammensat ion"], x: RAMME.x + RAMME.b / 2, y: RAMME.y, maal: [RAMME.x + RAMME.b / 2, RAMME.y], titel: true, dele: ["ramme"],
              omr: [{ r: [RAMME.x - 5, RAMME.y - 5, RAMME.b + 10, RAMME.h + 10, 18], tom: true }],
              fejl: { hydroxid: "<b>hydroxid</b> er kun OH⁻. Rammen rummer alle de sammensatte ioner.",
                      nitrat: "<b>nitrat</b> er kun NO₃⁻. Rammen rummer alle de sammensatte ioner.",
                      carbonat: "<b>carbonat</b> er kun CO₃²⁻. Rammen rummer alle de sammensatte ioner." } },
            navn("hydroxid", null, KOL3[0], R3, ["oh"]),
            navn("nitrat", null, KOL3[1], R3, ["no3"],
                { nitrid: "<b>nitrid</b> er N³⁻, kun ét nitrogenatom. Kortet viser NO₃⁻ med oxygen." }),
            navn("carbonat", null, KOL3[2], R3, ["co3"]),
            navn("sulfat", null, KOL3[0], R4, ["so4"],
                { sulfid: "<b>sulfid</b> er S²⁻, kun ét svovlatom. Kortet viser SO₄²⁻ med oxygen." }),
            navn("phosphat", null, KOL3[1], R4, ["po4"]),
            navn("ammonium", null, KOL3[2], R4, ["nh4"],
                { natriumion: "<b>natriumion</b> er Na⁺, kun ét atom. Kortet viser NH₄⁺, en gruppe af atomer." })
        ],

        tegn: function (api) {
            function pop(g, r, an) { an.pop(r.k, 0, 480); }

            /* ----- Lag 1: de positive ioner --------------------------------- */
            api.del("na", { lag: 0, fuld: function (g) { return { k: enkel(g, KOL5[0], R1, "Na", "Na^+", 25, true) }; }, byg: pop });
            api.del("fe2", { lag: 0, fuld: function (g) { return { k: enkel(g, KOL5[1], R1, "Fe", "Fe^2+", 22, true) }; }, byg: pop });
            api.del("fe3", { lag: 0, fuld: function (g) { return { k: enkel(g, KOL5[2], R1, "Fe", "Fe^3+", 19, true) }; }, byg: pop });

            /* ----- Lag 2: de negative ioner af ét atom og -id ------------------- */
            api.del("id", {
                lag: 1,
                fuld: function (g) {
                    SV.el("rect", { x: ID.x, y: ID.y, width: ID.b, height: ID.h, rx: 12, fill: "#f7f9fb", stroke: "#d4dbe2", "stroke-width": 1.5 }, g);
                    SV.tekst(g, ID.x + 70, ID.y + 26, "grundstof", { "font-size": 13, fill: F.mat });
                    SV.tekst(g, ID.x + 280, ID.y + 26, "negativ ion", { "font-size": 13, fill: F.mat });
                    SV.kugle(g, ID.x + 34, IDT.y - 8, 17, "neutron", "Br");
                    SV.tekst(g, ID.x + 60, IDT.y, "brom", { "font-size": 24, "font-weight": 700, fill: F.svag, "text-anchor": "start" });
                    SV.el("line", { x1: ID.x + 140, y1: IDT.y - 8, x2: ID.x + 172, y2: IDT.y - 8, stroke: "#4b5560", "stroke-width": 2.4 }, g);
                    SV.el("polygon", { points: (ID.x + 184) + "," + (IDT.y - 8) + " " + (ID.x + 170) + "," + (IDT.y - 15) + " " + (ID.x + 170) + "," + (IDT.y - 1), fill: "#4b5560" }, g);
                    SV.kugle(g, ID.x + 216, IDT.y - 8, 20, "elektron", "Br");
                    SV.tekst(g, IDT.x0, IDT.y, "brom", { "font-size": 24, "font-weight": 700, "text-anchor": "start" });
                    var id = SV.tekst(g, IDT.idX, IDT.y, "id", { "font-size": 24, "font-weight": 700, fill: "#2a55b0", "text-anchor": "start" });
                    SV.tekst(g, ID.x + 216, ID.y + ID.h - 12, "Br⁻", { "font-size": 14, fill: F.svag });
                    return { id: id };
                },
                byg: function (g, r, an) { an.pop(r.id, 0, 500); }
            });

            [["f", "F", "F^−", 26], ["cl", "Cl", "Cl^−", 32], ["o", "O", "O^2−", 28], ["s", "S", "S^2−", 33], ["n", "N", "N^3−", 30]].forEach(function (d, i) {
                api.del(d[0], { lag: 1, fuld: function (g) { return { k: enkel(g, KOL5[i], R2, d[1], d[2], d[3], false) }; }, byg: pop });
            });

            /* ----- Lag 3 og 4: de sammensatte ioner ---------------------------- */
            api.del("ramme", {
                lag: 2,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: RAMME.x, y: RAMME.y, width: RAMME.b, height: RAMME.h, rx: 18, fill: "#f6f8fc", stroke: "#9fb3d6", "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); }
            });

            [["oh", "OH", "OH^−", "−", KOL3[0], R3, 2, false], ["no3", "NO3", "NO_3^−", "−", KOL3[1], R3, 2, false], ["co3", "CO3", "CO_3^2−", "2−", KOL3[2], R3, 2, false],
             ["so4", "SO4", "SO_4^2−", "2−", KOL3[0], R4, 3, false], ["po4", "PO4", "PO_4^3−", "3−", KOL3[1], R4, 3, false], ["nh4", "NH4", "NH_4^+", "+", KOL3[2], R4, 3, true]].forEach(function (d) {
                api.del(d[0], {
                    lag: d[6],
                    fuld: function (g) { return { k: sammensat(g, d[4], d[5], MODEL[d[1]], d[2], d[3], d[7]) }; },
                    byg: pop
                });
            });
        }
    };
}());
