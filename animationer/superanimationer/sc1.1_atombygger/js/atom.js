/* =====================================================================
   atom.js - modellen af ET atom, og tegningen af det

   NK.Atom holder tre tal: protoner, neutroner og elektroner. Naar de
   aendrer sig, flyver partiklerne selv ind eller ud, saa eleven kan se
   HVAD der blev lagt til - ikke bare at billedet skiftede.

   Kernen pakkes ved at loese afstandene positionsvis i stedet for med
   fjederkraefter: den kan ikke eksplodere, uanset hvor mange partikler
   man propper i, og klumpen kommer af sig selv til at ligne en kerne.

   Modellen kender intet til laerredet. Den tegnes med tegn(ctx, ...),
   og derfor kan den samme klasse bruges baade til ét stort atom og til
   to smaa ved siden af hinanden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var FARVE = {
        proton:      "#e05446",
        protonLys:   "#ff9384",
        neutron:     "#7e8590",
        neutronLys:  "#b8bfc9",
        elektron:    "#f2c53d",
        elektronLys: "#fff2b8",
        skal:        "rgba(160, 190, 220, 0.22)",
        skalValens:  "rgba(242, 197, 61, 0.5)"
    };
    NK.FARVE = FARVE;

    var FLYVETID = 0.55;      /* sekunder for en partikel ind eller ud */

    function blod(t) { return t * t * (3 - 2 * t); }

    function nukleonRadius(a) {
        return NK.klamp(12 * Math.pow(Math.max(1, a), -0.22), 5, 11);
    }
    NK.nukleonRadius = nukleonRadius;

    function nyNukleon(slags, straks) {
        var v = Math.random() * Math.PI * 2;
        var r = straks ? Math.random() * 12 : 150 + Math.random() * 60;
        return {
            slags: slags,
            x: Math.cos(v) * r,
            y: Math.sin(v) * r,
            fase: Math.random() * Math.PI * 2,
            tilstand: straks ? "inde" : "kommer",
            t: 0,
            sx: Math.cos(v) * r,
            sy: Math.sin(v) * r
        };
    }

    function nyElektron(straks) {
        return {
            x: 0, y: 0, sx: 0, sy: 0,
            skal: 0, plads: 0, iSkal: 1,
            tilstand: straks ? "inde" : "kommer",
            t: 0,
            glimt: 0
        };
    }

    /* ----- Konstruktion ------------------------------------------------ */
    NK.Atom = function () {
        this.p = 0;            /* protoner */
        this.n = 0;            /* neutroner */
        this.e = 0;            /* elektroner */
        this.nukleoner = [];
        this.elektroner = [];
        this.fordeling = [];
        this.faser = [0, 0, 0, 0];
        this.retning = null;   /* hvilken vej nye elektroner kommer fra */
        this.puls = 0;         /* kort lysglimt naar noget aendrer sig */
        this.tid = 0;
    };

    /* Saet antallene. Forskellen animeres. */
    NK.Atom.prototype.saet = function (p, n, e) {
        this.saetNukleoner("proton", p);
        this.saetNukleoner("neutron", n);
        this.saetElektroner(e);
        this.p = p;
        this.n = n;
        this.e = e;
    };

    /* Samme, men uden flyvetur - bruges ved faneskift og nulstilling. */
    NK.Atom.prototype.saetStraks = function (p, n, e) {
        this.nukleoner.length = 0;
        this.elektroner.length = 0;
        this.p = p; this.n = n; this.e = e;
        var i;
        for (i = 0; i < p; i++) this.nukleoner.push(nyNukleon("proton", true));
        for (i = 0; i < n; i++) this.nukleoner.push(nyNukleon("neutron", true));
        for (i = 0; i < e; i++) this.elektroner.push(nyElektron(true));
        this.fordelElektroner();
    };

    /* ----- Kernen ------------------------------------------------------ */
    NK.Atom.prototype.saetNukleoner = function (slags, antal) {
        var levende = [];
        var i;
        for (i = 0; i < this.nukleoner.length; i++) {
            if (this.nukleoner[i].slags === slags && this.nukleoner[i].tilstand !== "gaar") {
                levende.push(this.nukleoner[i]);
            }
        }
        var forskel = antal - levende.length;
        if (forskel > 0) {
            for (i = 0; i < forskel; i++) this.nukleoner.push(nyNukleon(slags, false));
            this.puls = 1;
        } else if (forskel < 0) {
            /* Den yderste ryger foerst - saa ser man den forlade klumpen. */
            levende.sort(function (a, b) {
                return (b.x * b.x + b.y * b.y) - (a.x * a.x + a.y * a.y);
            });
            for (i = 0; i < -forskel; i++) {
                var u = levende[i];
                u.tilstand = "gaar";
                u.t = 0;
                var laengde = Math.sqrt(u.x * u.x + u.y * u.y) || 1;
                u.sx = u.x / laengde;
                u.sy = u.y / laengde;
            }
            this.puls = 1;
        }
    };

    /* Pakker nukleonerne: traek mod midten, og skub overlap fra hinanden. */
    NK.Atom.prototype.pakKerne = function (dt) {
        var inde = [];
        var i, j;
        for (i = 0; i < this.nukleoner.length; i++) {
            if (this.nukleoner[i].tilstand === "inde") inde.push(this.nukleoner[i]);
        }
        if (!inde.length) return;

        var r = nukleonRadius(inde.length);
        var traek = Math.min(1, dt * 5);
        for (i = 0; i < inde.length; i++) {
            var a = inde[i];
            a.x -= a.x * traek;
            a.y -= a.y * traek;
            a.x += Math.cos(a.fase) * 5 * dt;
            a.y += Math.sin(a.fase * 1.3) * 5 * dt;
        }

        /* To gennemloeb er rigeligt til at faa klumpen til at ligge paent. */
        var mindst = r * 1.86;
        for (var runde = 0; runde < 2; runde++) {
            for (i = 0; i < inde.length; i++) {
                for (j = i + 1; j < inde.length; j++) {
                    var p = inde[i], q = inde[j];
                    var dx = q.x - p.x, dy = q.y - p.y;
                    var d2 = dx * dx + dy * dy;
                    if (d2 > mindst * mindst || d2 === 0) continue;
                    var d = Math.sqrt(d2) || 0.001;
                    var skub = (mindst - d) * 0.5;
                    dx /= d; dy /= d;
                    p.x -= dx * skub; p.y -= dy * skub;
                    q.x += dx * skub; q.y += dy * skub;
                }
            }
        }
    };

    /* ----- Elektronerne ------------------------------------------------ */
    NK.Atom.prototype.saetElektroner = function (antal) {
        var levende = [];
        var i;
        for (i = 0; i < this.elektroner.length; i++) {
            if (this.elektroner[i].tilstand !== "gaar") levende.push(this.elektroner[i]);
        }
        var forskel = antal - levende.length;
        if (forskel > 0) {
            for (i = 0; i < forskel; i++) {
                var ny = nyElektron(false);
                var v = this.retning
                    ? Math.atan2(-this.retning.y, -this.retning.x)
                    : Math.random() * Math.PI * 2;
                ny.sx = Math.cos(v) * 340;
                ny.sy = Math.sin(v) * 340;
                ny.x = ny.sx;
                ny.y = ny.sy;
                this.elektroner.push(ny);
            }
            this.puls = 1;
        } else if (forskel < 0) {
            /* Elektroner afgives altid udefra: yderste skal toemmes foerst. */
            levende.sort(function (a, b) { return b.skal - a.skal; });
            for (i = 0; i < -forskel; i++) {
                levende[i].tilstand = "gaar";
                levende[i].t = 0;
            }
            this.puls = 1;
        }
        this.fordelElektroner();
    };

    /* Giver hver levende elektron en skal og en plads i den. */
    NK.Atom.prototype.fordelElektroner = function () {
        var levende = [];
        var i;
        for (i = 0; i < this.elektroner.length; i++) {
            if (this.elektroner[i].tilstand !== "gaar") levende.push(this.elektroner[i]);
        }
        var fordeling = D.skalfordeling(levende.length);
        var k = 0;
        for (var s = 0; s < fordeling.length; s++) {
            for (var j = 0; j < fordeling[s]; j++) {
                levende[k].skal = s;
                levende[k].plads = j;
                levende[k].iSkal = fordeling[s];
                k++;
            }
        }
        this.fordeling = fordeling;
    };
