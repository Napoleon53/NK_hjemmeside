/* =====================================================================
   plade.js - byggepladen, som alle tre faner har til venstre

   En lys tavle med:
     * skifteren Alle atomer / Zigzag oeverst til hoejre (deles af fanerne
       og huskes i browseren)
     * molekylet som strukturformel (js/formel.js) med samme skala for
       alle molekyler, saa atomerne ikke skifter stoerrelse, naar kaeden
       bliver laengere
     * evt. navnet under molekylet (fane 2 og 3; fane 1 har navnemaskinen)
     * knapperne − og + med kaedens laengde imellem
     * hylden med de tre grupper −H, −OH og −COOH, som traekkes hen paa
       kaeden (eller klikkes paa)

   Pladen tegner og siger, hvad musen er over (hit). Det er fanen
   (js/sim.js), der bestemmer, hvad et klik eller et traek goer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var SKRIFT = "'Segoe UI', sans-serif";
    function font(v, px) { return v + " " + Math.round(px) + "px " + SKRIFT; }

    var BLAEK = "#1f2430", GROEN = "#0f766e", RING_MOERK = "#c99400";
    var GRUPPER = ["H", "OH", "COOH"];
    var TILE = {
        H: { f: "−H", t: "ingen gruppe" },
        OH: { f: "−OH", t: "hydroxygruppe" },
        COOH: { f: "−COOH", t: "carboxylgruppe" }
    };

    /* Stilen er faelles for de tre faner */
    NK.formelStil = NK.hent("nk-sc4.7-stil", "alle") === "zigzag" ? "zigzag" : "alle";

    function Plade() {
        this.stof = null;
        this.gammel = null;
        this.t = 1;
        this.r = {};
        this.skala = {};
    }

    var P = Plade.prototype;

    P.saet = function (stof, straks) {
        if (this.stof && stof.id === this.stof.id) return;
        this.gammel = straks ? null : this.stof;
        this.stof = stof;
        this.t = straks || !this.gammel ? 1 : 0;
    };

    P.opdater = function (dt) {
        if (this.t < 1) this.t = Math.min(1, this.t + dt / 0.28);
    };

    /* Den stoerste kasse, et molekyle kan faa i stilen, i enheder */
    function maksKasse(stil) {
        var b = 0, h = 0;
        D.alle().concat([D.stof("glycerol", 3)]).forEach(function (s) {
            var k = F.kasse(F.graf(s, stil));
            b = Math.max(b, k.x1 - k.x0);
            h = Math.max(h, k.y1 - k.y0);
        });
        return { b: b, h: h };
    }
    var MAKS = {};

    /* ----- Pladserne ------------------------------------------------------------------ */
    P.layout = function (R, valg) {
        valg = valg || {};
        var r = { R: R };
        var pad = 14;
        var lav = R.h < 360;
        /* Mellem knapperne og hylden er der plads til det gule skilt over en gruppe */
        var hylde = lav ? 64 : 78, kontrol = lav ? 40 : 46, navn = valg.visNavn ? (lav ? 38 : 46) : 0, hoved = 38, skilt = 40;
        r.stilAlle = { x: R.x + R.b - pad - 196, y: R.y + 10, b: 104, h: 26 };
        r.stilZig = { x: R.x + R.b - pad - 90, y: R.y + 10, b: 90, h: 26 };
        var fy = R.y + hoved;
        var fh = Math.max(70, R.h - hoved - navn - kontrol - skilt - hylde - 6);
        r.formel = { x: R.x + pad, y: fy, b: R.b - 2 * pad, h: fh };
        r.navn = navn ? { x: R.x + pad, y: fy + fh, b: R.b - 2 * pad, h: navn } : null;
        var ky = fy + fh + navn;
        var kb = 40, kh = kontrol - 8;
        r.minus = { x: R.x + R.b / 2 - 150, y: ky + 4, b: kb, h: kh };
        r.plus = { x: R.x + R.b / 2 + 110, y: ky + 4, b: kb, h: kh };
        r.kaedeTekst = { x: R.x + R.b / 2, y: ky + 4 + kh / 2 };
        var hy = ky + kontrol + skilt;
        r.hylde = { x: R.x + pad, y: hy, b: R.b - 2 * pad, h: hylde - 10 };
        var gap = 10, tb = Math.min(150, (r.hylde.b - 16 - 2 * gap) / 3), th = hylde - 22;
        var tx0 = R.x + R.b / 2 - (3 * tb + 2 * gap) / 2;
        r.tiles = {};
        GRUPPER.forEach(function (g, i) { r.tiles[g] = { x: tx0 + i * (tb + gap), y: hy + 6, b: tb, h: th }; });
        this.r = r;
        this.visNavn = !!valg.visNavn;
        ["alle", "zigzag"].forEach(function (st) {
            if (!MAKS[st]) MAKS[st] = maksKasse(st);
        });
        this.skala = {
            alle: Math.min((r.formel.b - 16) / MAKS.alle.b, (r.formel.h - 12) / MAKS.alle.h, 58),
            zigzag: Math.min((r.formel.b - 16) / MAKS.zigzag.b, (r.formel.h - 12) / MAKS.zigzag.h, 70)
        };
    };

    /* ----- Tegning --------------------------------------------------------------------
       st: over (det, musen er over), traek ({g, x, y} mens en gruppe
       holdes), laas ({gruppe, laengde}: hvad der ikke kan bruges nu),
       skjulNavn, om (ringe), tid */
    P.tegn = function (ctx, st) {
        var r = this.r, R = r.R, stof = this.stof;
        if (!R || !stof) return;
        st = st || {};
        var stil = NK.formelStil;
        NK.Tegn.tavle(ctx, R);

        NK.tekst(ctx, "Byg molekylet", R.x + 16, R.y + 28, { font: font("700", 15), farve: BLAEK });
        this.tegnStil(ctx, st.over);

        /* Molekylet: det nye toner ind over det gamle */
        var valg = { stil: stil, maksSkala: this.skala[stil] };
        if (this.gammel && this.t < 1) {
            valg.alfa = 1 - this.t;
            F.tegn(ctx, this.gammel, r.formel, valg);
        }
        valg.alfa = this.t;
        var ud = F.tegn(ctx, stof, r.formel, valg);
        this.ende = ud.ende;
        this.formelKasse = formelKasse(ud);

        /* Mens en gruppe holdes: enden af kaeden lyser */
        if (st.traek && this.ende) {
            var e = this.ende;
            NK.Tegn.ring(ctx, e.x - 4, e.y - 4, e.b + 8, e.h + 8, st.tid || 0, 10);
        }

        if (this.visNavn) this.tegnNavn(ctx, st.skjulNavn);
        this.tegnKontrol(ctx, st);
        this.tegnHylde(ctx, st);

        /* Rolige gule ringe om det, opgaven handler om */
        var om = st.om || [];
        if (om.indexOf("kaede") >= 0 && this.formelKasse) {
            var k = this.formelKasse;
            NK.Tegn.omRing(ctx, k.x, k.y, k.b, k.h, RING_MOERK);
        }
        if (om.indexOf("hylde") >= 0) NK.Tegn.omRing(ctx, r.hylde.x + 4, r.hylde.y + 4, r.hylde.b - 8, r.hylde.h - 6, RING_MOERK);
        if (om.indexOf("navn") >= 0 && r.navn) NK.Tegn.omRing(ctx, r.navn.x + 20, r.navn.y + 4, r.navn.b - 40, r.navn.h - 8, RING_MOERK);

        /* Gruppen, der holdes, foelger musen */
        if (st.traek) this.tegnTile(ctx, st.traek.g, { x: st.traek.x - r.tiles.H.b / 2, y: st.traek.y - r.tiles.H.h / 2, b: r.tiles.H.b, h: r.tiles.H.h }, "holdt");
    };

    /* Kassen om hele formlen i px (til den gule ring) */
    function formelKasse(ud) {
        var G = ud.graf, p = ud.p;
        if (!G || !G.atomer.length) return ud.ende;
        var k = F.kasse(G);
        return { x: p.ox + k.x0 * p.s - 6, y: p.oy + k.y0 * p.s - 6, b: (k.x1 - k.x0) * p.s + 12, h: (k.y1 - k.y0) * p.s + 12 };
    }

    P.tegnStil = function (ctx, over) {
        var r = this.r, stil = NK.formelStil;
        [["alle", r.stilAlle, "Alle atomer"], ["zigzag", r.stilZig, "Zigzag"]].forEach(function (s) {
            var valgt = stil === s[0], R = s[1];
            ctx.save();
            NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 7);
            ctx.fillStyle = valgt ? "#2f3a4a" : (over === "stil:" + s[0] ? "#e6e0d2" : "#efe9dc");
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = valgt ? "#2f3a4a" : "#c9c0ab";
            ctx.stroke();
            ctx.font = font("700", 12.5);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = valgt ? "#ffffff" : "#4b5260";
            ctx.fillText(s[2], R.x + R.b / 2, R.y + R.h / 2 + 0.5);
            ctx.restore();
        });
    };

    P.tegnNavn = function (ctx, skjult) {
        var R = this.r.navn, stof = this.stof;
        var y = R.y + R.h / 2 + 2;
        if (skjult) {
            NK.tekst(ctx, "Navnet vises, når du har indsendt", R.x + R.b / 2, y + 5, { font: font("600", 14), justering: "center", farve: "#8a6d12" });
            return;
        }
        var navn = stof.navn, kl = stof.klasse;
        var px = NK.Tegn.passer(ctx, navn + "   " + kl, R.b - 20, "700", 24, 13);
        ctx.save();
        ctx.font = font("700", px);
        var bN = ctx.measureText(navn).width;
        ctx.font = font("600", px * 0.62);
        var bK = ctx.measureText(kl).width;
        var x0 = R.x + R.b / 2 - (bN + 14 + bK) / 2;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.font = font("700", px);
        ctx.fillStyle = BLAEK;
        ctx.fillText(navn, x0, y);
        ctx.font = font("600", px * 0.62);
        ctx.fillStyle = stof.g === "H" || !stof.organisk ? "#6b7280" : GROEN;
        ctx.fillText(kl, x0 + bN + 14, y + 1);
        ctx.restore();
    };

    P.tegnKontrol = function (ctx, st) {
        var r = this.r, stof = this.stof, laas = st.laas || {};
        var n = stof.n;
        var maks = D.maksN(stof.g);
        [["minus", r.minus, "−", n <= 0], ["plus", r.plus, "+", n >= maks || stof.g === "glycerol"]].forEach(function (k) {
            var slukket = laas.laengde || k[3] || stof.g === "glycerol";
            NK.Tegn.knap(ctx, k[1], k[2], {
                px: 24, radius: 9,
                bund: slukket ? "#e7e2d6" : (st.over === k[0] ? "#2f6f8f" : "#2a5d78"),
                kant: slukket ? "#cfc8b6" : "#1d4a62",
                farve: slukket ? "#a9a291" : "#ffffff"
            });
        });
        var tekst = stof.g === "glycerol" ? "Kæden: 3 carbonatomer" :
            (n === 0 ? "Kæden: intet carbonatom" : "Kæden: " + n + " carbonatom" + (n === 1 ? "" : "er"));
        var b = r.plus.x - (r.minus.x + r.minus.b) - 12;
        NK.tekst(ctx, tekst, r.kaedeTekst.x, r.kaedeTekst.y + 5, { font: font("700", NK.Tegn.passer(ctx, tekst, b, "700", 15, 11)), justering: "center", farve: BLAEK });
    };

    P.tegnHylde = function (ctx, st) {
        var r = this.r, mig = this, laas = st.laas || {};
        ctx.save();
        NK.rundtRekt(ctx, r.hylde.x, r.hylde.y, r.hylde.b, r.hylde.h, 9);
        ctx.fillStyle = "#e9e3d5";
        ctx.fill();
        ctx.restore();
        GRUPPER.forEach(function (g) {
            var tilstand = mig.stof.g === g ? "paa" : (st.traek && st.traek.g === g ? "tom" : "");
            if (laas.gruppe && tilstand !== "paa") tilstand = "laast";
            if (st.over === "tile:" + g && !tilstand) tilstand = "over";
            mig.tegnTile(ctx, g, r.tiles[g], tilstand);
        });
    };

    /* En gruppe paa hylden. tilstand: "paa" (sidder paa kaeden), "over",
       "laast", "tom" (holdes lige nu) eller "holdt" (foelger musen) */
    P.tegnTile = function (ctx, g, R, tilstand) {
        var T = TILE[g];
        ctx.save();
        if (tilstand === "tom") {
            NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 9);
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "#b9b09a";
            ctx.stroke();
            ctx.restore();
            return;
        }
        if (tilstand === "holdt") {
            ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 4;
        }
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 9);
        ctx.fillStyle = tilstand === "paa" ? "#dff0ec" : (tilstand === "over" ? "#ffffff" : "#fbf9f3");
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.lineWidth = tilstand === "paa" ? 2.2 : 1.4;
        ctx.strokeStyle = tilstand === "paa" ? GROEN : (tilstand === "over" ? "#8a8170" : "#cfc6b0");
        ctx.stroke();
        var alfa = tilstand === "laast" ? 0.45 : 1;
        ctx.globalAlpha *= alfa;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = font("700", Math.min(22, R.h * 0.4));
        ctx.fillStyle = g === "H" ? BLAEK : GROEN;
        ctx.fillText(T.f, R.x + R.b / 2, R.y + R.h * 0.4);
        ctx.font = font("600", Math.min(12.5, R.h * 0.22));
        ctx.fillStyle = "#5b6270";
        ctx.fillText(tilstand === "paa" ? "sidder på kæden" : T.t, R.x + R.b / 2, R.y + R.h * 0.8);
        ctx.restore();
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.hit = function (pt) {
        var r = this.r, T = NK.Tegn;
        if (!r.R || !pt) return null;
        if (T.inde(r.stilAlle, pt)) return "stil:alle";
        if (T.inde(r.stilZig, pt)) return "stil:zigzag";
        if (T.inde(r.minus, pt, 3)) return "minus";
        if (T.inde(r.plus, pt, 3)) return "plus";
        for (var i = 0; i < GRUPPER.length; i++) if (T.inde(r.tiles[GRUPPER[i]], pt)) return "tile:" + GRUPPER[i];
        if (T.inde(r.formel, pt)) return "formel";
        return null;
    };

    /* Kan en gruppe slippes her? Hele omraadet med molekylet taeller. */
    P.slipOmraade = function (pt) {
        var r = this.r;
        return NK.Tegn.inde(r.formel, pt, 10) || (this.ende && NK.Tegn.inde(this.ende, pt, 30));
    };

    NK.Plade = Plade;
}());
