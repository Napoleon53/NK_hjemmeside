/* =====================================================================
   laerer.js - Kemichael i ståuldsforsoeget

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../kemichael/kemichael.js. Her staar de scener, der hoerer til dette
   forsoeg.

   Paaskeaeg og uheld:
     ryst       kolben rystes saa voldsomt, at det skvulper
     overloeb   buretten fyldes, mens den allerede er fuld: en plet paa
                bordet, der bliver staaende
     vaegt      syren haeldes ud over vaegten: laereren toerrer op
     aubergine  der titreres langt forbi endepunktet: laereren kigger ind
                fra kanten
     spild      KMnO₄ loeber ud paa flisen: laereren lukker hanen
     over100    et resultat over 100 %
     ros        et godt resultat med svovlsyre: laereren siger "Rustfrit."
     bemaerk    en fejl, som laereren lader ske og kommenterer (BEMAERK),
                ofte med et vink om et nyt forsoeg

   Glimt af baggrunden: bartender (rystningen), jura (aubergine),
   titrering (rosen) og regnskabet over uheld (overloebet og vaegten).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var S = NK.Scene;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { kaffeX: 170, fredet: ["vaegt", "spild"] });

    P.laererStartEkstra = function () {
        this.antalRyst = 0;
        this.antalOver100 = 0;
        this.antalNyt = 0;
        this.over100Venter = false;
        this.bemaerket = {};
        this.bemaerkKoe = [];
    };

    P.laererNytEkstra = function () {
        this.over100Venter = false;
        this.bemaerket = {};
        this.bemaerkKoe = [];
        this.laerer.baerer = null;
    };

    /* Scener, der ventede, fordi laereren var optaget */
    P.laererVentende = function () {
        if (this.laerer.scene) return;
        if (this.over100Venter) { this.laererOver100(); return; }
        while (this.bemaerkKoe.length && !this.laerer.scene) {
            var id = this.bemaerkKoe.shift();
            if (this.bemaerket[id]) continue;
            this.laererBemaerk(id);
        }
    };

    /* ----- Kolben rystes voldsomt --------------------------------------- */
    var RYST_SVAR = [
        "Det er en titrerkolbe. Ikke en cocktailshaker.",
        "Blidt. Som en kop te.",
        "Jernet er opløst. Det skal ikke rystes ud af kolben.",
        "Hvis det skal skvulpe, kan du gå i svømmehallen.",
        "Imponerende. Der er stadig noget i kolben."
    ];

    P.laererRyst = function () {
        var L = this.laerer;
        if (!L || L.scene) return false;
        this.antalRyst++;
        this.stopArbejde();
        this.holdt = null;
        var n = (this.antalRyst - 1) % RYST_SVAR.length;
        this.laererKoer("ryst", [
            { udtryk: { vrede: 0.6, humoer: -0.2, roed: 0.1, skeptisk: 1, briller: 1 } },
            { gaa: 240 },
            { sig: RYST_SVAR[n], vis: 3.2, tid: 0.3 },
            { arm: 1.62, tid: 0.45 },
            { tid: 2.4 }
        ].concat(n === 0 ? K.glimtTrin("bartender") : [], [
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { arm: HAENGER, tid: 0.4 },
            { gaa: UDE }
        ]));
        return true;
    };

    /* ----- Buretten fyldes, mens den er fuld ----------------------------- */
    P.laererOverloeb = function () {
        var L = this.laerer;
        if (!L || L.scene) return false;
        this.laererKoer("overloeb", [
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3 } },
            { gaa: 210 },
            { sig: "Buretten var fuld. Nu er bordet også lilla.", vis: 3, tid: 0.2 },
            { arm: -0.1, tid: 0.4, hver: function () { this.laerer.plakatRegel = 3; } },
            { tid: 2.4, hver: function (t) { this.laerer.arm = -0.1 + Math.sin(t * Math.PI * 8) * 0.12; } },
            K.suk(),
            { sig: "Permanganat går aldrig helt af.", vis: 2.4, tid: 2.4 },
            { kald: function () { this.laerer.plakatRegel = 0; if (NK.Lyd) NK.Lyd.brum(); } }
        ].concat(K.uheld(), [
            { arm: HAENGER, tid: 0.45 },
            { gaa: UDE }
        ]));
        return true;
    };

    /* ----- Syren blev haeldt ud over vaegten ------------------------------ */
    P.laererVaegt = function () {
        var L = this.laerer;
        var mig = this;
        if (!L) return false;
        L.scene = null;
        this.laererKoer("vaegt", [
            { tid: 0.3 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3, briller: 1 } },
            { gaa: function () { return (mig.vaegtPyt ? mig.vaegtPyt.x : S.VAEGT.midt) - 130; } },
            { sig: "Vægten er ikke et bægerglas.", vis: 2.6, tid: 0.3 },
            { udtryk: { briller: 0 } },
            { arm: 1.8, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd && NK.Lyd.papir) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
                if (this.vaegtPyt) this.vaegtPyt.alfa = 1 - t;
                if (t >= 0.99) this.vaegtPyt = null;
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 },
            { sig: "Syren skal i kolben.", vis: 2.2, tid: 1.4 }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
        return true;
    };

    /* ----- Langt forbi endepunktet: laereren kigger ind fra kanten ------- */
    P.laererAubergine = function () {
        var L = this.laerer;
        if (!L || L.scene) return false;
        this.laererKoer("aubergine", [
            { udtryk: { vrede: 0.4, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1, laen: 1 } },
            { gaa: K.KANT },
            { sig: "Svagt lyserød. Ikke aubergine.", vis: 3, tid: 3.2 }
        ].concat(K.glimtTrin("jura"), [
            { udtryk: { skeptisk: 0, briller: 0, laen: 0 } },
            { gaa: UDE }
        ]), false);
        return true;
    };

    /* ----- Mere end 100 % jern ------------------------------------------ */
    var OVER100_SVAR = [
        "Over 100 % jern. Det er noget af en ståluld.",
        "Mere jern end ståluld. Igen.",
        "Stadig over 100 %. Måske er det syren?"
    ];

    P.laererOver100 = function () {
        var L = this.laerer;
        if (!L) return false;
        if (L.scene) { this.over100Venter = true; return false; }
        this.over100Venter = false;
        var tekst = OVER100_SVAR[this.antalOver100 % OVER100_SVAR.length];
        this.antalOver100++;
        this.laererKoer("over100", [
            { udtryk: { vrede: 0.3, humoer: 0.3, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: 220 },
            { sig: tekst, vis: 3.4, tid: 3.6 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { gaa: UDE }
        ], false);
        return true;
    };

    /* ----- Ros ---------------------------------------------------------- */
    P.laererRos = function () {
        var L = this.laerer;
        if (L.rost || L.scene) return;
        L.rost = true;
        this.laererKoer("ros", [
            { udtryk: { vrede: 0, humoer: 0.9, roed: 0 } },
            { gaa: 150 },
            { tid: 0.3 },
            { sig: "Rustfrit.", vis: 1.8, tid: 1.8, hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
            { kald: function () { this.laerer.nik = 0; } }
        ].concat(K.glimtTrin("titrering"), [
            { gaa: UDE }
        ]), false);
    };

    /* ----- Bemaerkninger om fejl ------------------------------------------
       Laereren lader fejlen ske og kommer med en bemaerkning. Scenen
       blokerer ikke, saa eleven kan fortsaette. Hver bemaerkning kommer
       hoejst én gang pr. forsoeg. Er laereren optaget, venter den. */
    var BEMAERK = {
        lidtStaal:   { tekst: "Ca. 0,1 g, stod der. Det der er et fnug." },
        megetStaal:  { tekst: "Ca. 0,1 g. Det der er en hel pude." },
        toSyrer:     { tekst: "Svovlsyre og saltsyre i samme kolbe. Modigt.", nyt: true },
        kmno4Kolbe:  { tekst: "Permanganat hører til i buretten. Ikke i kolben.", nyt: true },
        ingenSyre:   { tekst: "Uden syre er der intet opløst jern at titrere.", nyt: true },
        uoploest:    { tekst: "Stålulden er ikke opløst. Det jern tæller ikke med.", nyt: true },
        glemtStart:  { tekst: "Startaflæsningen? Jeg skrev den op. Denne gang." },
        ikkeNulstillet: { tekst: "Buretten stod over nulstregen. Så passer startaflæsningen ikke.", nyt: true },
        affaldTaelt: { tekst: "Efter aflæsningen tæller hver dråbe. Også i affaldet.", nyt: true },
        genfyldt:    { tekst: "Buretten er fyldt op efter aflæsningen. Nu passer tallene ikke.", nyt: true },
        nul:         { tekst: "Næsten 0 % jern. Så er det vist ikke ståluld.", nyt: true },
        negativ:     { tekst: "Negativt jernindhold. Det har jeg ikke set før.", nyt: true },
        lavt:        { tekst: "Hvor blev resten af jernet af?", nyt: true }
    };
    NK.BEMAERK = BEMAERK;

    var NYT_SVAR = [
        "Knappen Nyt forsøg sidder øverst.",
        "Et nyt forsøg er en mulighed.",
        "Du kan også fortsætte. Det bliver spændende."
    ];

    P.laererBemaerk = function (id) {
        var b = BEMAERK[id];
        var L = this.laerer;
        if (!b || !L || this.bemaerket[id]) return false;
        if (L.scene) {
            if (this.bemaerkKoe.indexOf(id) < 0) this.bemaerkKoe.push(id);
            return false;
        }
        this.bemaerket[id] = true;
        var trin = [
            { udtryk: { vrede: 0.5, humoer: -0.3, roed: 0.05, skeptisk: 1, briller: 1 } },
            { gaa: 220 },
            { sig: b.tekst, vis: 1.6 + b.tekst.length * 0.045, tid: 1.8 + b.tekst.length * 0.045 }
        ];
        if (b.nyt) {
            var nyt = NYT_SVAR[this.antalNyt++ % NYT_SVAR.length];
            trin.push({ arm: 0.4, tid: 0.4 });
            trin.push({ sig: nyt, vis: 2.2, tid: 2.2 });
            trin.push({ arm: HAENGER, tid: 0.4 });
        }
        trin.push({ kald: function () { if (NK.Lyd) NK.Lyd.brum(); } });
        trin.push({ udtryk: { skeptisk: 0, briller: 0 } });
        trin.push({ gaa: UDE });
        this.laererKoer("bemaerk", trin, false);
        return true;
    };

    /* ----- Uheld: KMnO₄ loeb ud paa flisen, fordi der ikke stod noget
       under buretten. Laereren lukker hanen; pletten bliver staaende. */
    P.laererSpild = function () {
        var L = this.laerer;
        if (!L) return false;
        L.scene = null;
        this.laererKoer("spild", [
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3 } },
            { gaa: S.BURET.x - 190, loeb: true },
            { sig: "Hanen lukkes, når der ikke står noget under.", vis: 2.8, tid: 0.3 },
            { arm: 0.9, tid: 0.45 },
            { kald: function () {
                if (this.buret.aaben) { this.buret.aaben = false; if (NK.Lyd) NK.Lyd.klik(); this.aendret("hane"); }
            } },
            { tid: 1.6 },
            { arm: HAENGER, tid: 0.4 },
            K.suk(),
            { sig: "Permanganat går aldrig helt af.", vis: 2.4, tid: 2.2 }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
        return true;
    };

    /* ----- Tegning ------------------------------------------------------ */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, S.ANKER.papir);
        }
    };
}());
