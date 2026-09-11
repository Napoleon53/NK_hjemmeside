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
                ny.sx = Math.cos(v) * 250;
                ny.sy = Math.sin(v) * 250;
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

    /* ----- Opdatering --------------------------------------------------- */
    NK.Atom.prototype.opdater = function (dt) {
        if (dt > 0.05) dt = 0.05;
        this.tid += dt;
        this.puls = Math.max(0, this.puls - dt * 2.2);

        var i;
        for (i = this.nukleoner.length - 1; i >= 0; i--) {
            var nu = this.nukleoner[i];
            if (nu.tilstand === "kommer") {
                nu.t += dt / FLYVETID;
                if (nu.t >= 1) { nu.tilstand = "inde"; nu.x *= 0.2; nu.y *= 0.2; }
                else {
                    var f = blod(nu.t);
                    nu.x = nu.sx * (1 - f);
                    nu.y = nu.sy * (1 - f);
                }
            } else if (nu.tilstand === "gaar") {
                nu.t += dt / FLYVETID;
                if (nu.t >= 1) { this.nukleoner.splice(i, 1); continue; }
                nu.x += nu.sx * 300 * dt;
                nu.y += nu.sy * 300 * dt;
            } else {
                nu.fase += dt * 2.4;
            }
        }
        this.pakKerne(dt);

        for (i = this.elektroner.length - 1; i >= 0; i--) {
            var el = this.elektroner[i];
            el.glimt = Math.max(0, el.glimt - dt * 1.4);
            if (el.tilstand === "kommer") {
                el.t += dt / FLYVETID;
                if (el.t >= 1) { el.tilstand = "inde"; el.glimt = 1; }
            } else if (el.tilstand === "gaar") {
                el.t += dt / FLYVETID;
                if (el.t >= 1) { this.elektroner.splice(i, 1); continue; }
            }
        }

        /* Skallerne drejer hver sin vej, saa billedet ikke stivner. */
        for (i = 0; i < 4; i++) {
            this.faser[i] += dt * ((i % 2 === 0) ? 1 : -1) * (0.72 - i * 0.12);
        }
    };

    /* ----- Geometri ------------------------------------------------------ */
    /* Alt regnes i "modelpixels" og skaleres foerst ved tegningen. Den
       ydre stoerrelse er fast, saa et stort atom ogsaa SER stoerre ud
       end et lille - i stedet for at hvert atom fylder det hele. */
    var MODEL_YDRE = 176;

    NK.Atom.prototype.geometri = function () {
        var a = 0, i;
        for (i = 0; i < this.nukleoner.length; i++) {
            if (this.nukleoner[i].tilstand !== "gaar") a++;
        }
        var rN = nukleonRadius(a);
        var rKerne = a <= 1 ? rN + 2 : rN * Math.pow(a, 1 / 3) * 1.05 + 2;
        var rInder = rKerne + 30;
        var rSkal = [];
        for (i = 0; i < 4; i++) rSkal.push(rInder + i * 34);
        return { rNukleon: rN, rKerne: rKerne, rSkal: rSkal, antalNukleoner: a };
    };

    /* Hvor skal elektron nr. plads af iSkal i skal nr. skal ligge?
       lewis = true laaser den yderste skal fast i elektronprikformlens
       moenster: én i hvert verdenshjoerne foerst, derefter par. */
    NK.Atom.prototype.elektronVinkel = function (el, geo, lewis, yderste) {
        var r = geo.rSkal[el.skal];
        if (lewis && el.skal === yderste) {
            var parAfstand = 8 / r;                      /* halv afstand i et par */
            var hjoerner = [-Math.PI / 2, Math.PI / 2, 0, Math.PI];
            if (el.iSkal <= 2 && el.skal === 0) {
                if (el.iSkal === 1) return -Math.PI / 2;
                return -Math.PI / 2 + (el.plads === 0 ? -parAfstand : parAfstand);
            }
            var i = el.plads;
            if (i < 4) {
                /* Faar denne plads en makker senere, rykker den til side. */
                var faarPar = el.iSkal > 4 + i;
                return hjoerner[i] + (faarPar ? -parAfstand : 0);
            }
            return hjoerner[i - 4] + parAfstand;
        }
        return this.faser[el.skal] + Math.PI * 2 * el.plads / Math.max(1, el.iSkal);
    };

    /* ----- Tegning -------------------------------------------------------- */
    /* plads er den radius, atomet maa fylde. opt:
         lewis           yderste skal laases i prikformlens moenster
         fremhaevValens  ring om den yderste skal
         ladning         farvet skaer: roedt for plus, blaat for minus
         maerkat         tekst under atomet
         daempet         0-1, hvor gennemsigtigt det hele tegnes         */
    NK.Atom.prototype.tegn = function (ctx, cx, cy, plads, opt) {
        opt = opt || {};
        var geo = this.geometri();
        var s = plads / MODEL_YDRE;
        var i;
        this.sidsteGeo = { cx: cx, cy: cy, s: s, geo: geo };

        ctx.save();
        var dmp = opt.daempet ? 1 - opt.daempet : 1;

        var antalSkaller = this.fordeling.length;
        var yderste = antalSkaller - 1;

        /* Ladningens skaer ligger bagest, saa det ikke sloerer partiklerne. */
        if (opt.ladning) {
            var ydreR = (geo.rSkal[Math.max(0, yderste)] + 26) * s;
            NK.skaer(ctx, cx, cy, ydreR,
                opt.ladning > 0 ? "rgba(224, 84, 70, 0.20)" : "rgba(61, 158, 224, 0.22)", dmp);
        }

        /* Skallerne */
        for (i = 0; i < antalSkaller; i++) {
            var erValens = (i === yderste);
            ctx.beginPath();
            ctx.arc(cx, cy, geo.rSkal[i] * s, 0, Math.PI * 2);
            ctx.strokeStyle = (erValens && opt.fremhaevValens) ? FARVE.skalValens : FARVE.skal;
            ctx.lineWidth = (erValens && opt.fremhaevValens) ? 2 : 1;
            ctx.stroke();
        }

        /* Kernen: et skaer, og saa partiklerne oven i hinanden */
        var rK = geo.rKerne * s;
        NK.skaer(ctx, cx, cy, rK * 2.6, "rgba(224, 84, 70, 0.18)", dmp);
        if (this.puls > 0) NK.skaer(ctx, cx, cy, rK * 3.4, "rgba(255, 255, 255, 0.16)", this.puls * dmp);

        var sorteret = this.nukleoner.slice().sort(function (a, b) { return a.y - b.y; });
        var rN = geo.rNukleon * s;
        for (i = 0; i < sorteret.length; i++) {
            var nu = sorteret[i];
            var alfa = (nu.tilstand === "gaar" ? (1 - nu.t) : 1) * dmp;
            tegnKugle(ctx, cx + nu.x * s, cy + nu.y * s, rN,
                nu.slags === "proton" ? FARVE.protonLys : FARVE.neutronLys,
                nu.slags === "proton" ? FARVE.proton : FARVE.neutron, alfa);
            if (nu.slags === "proton" && rN > 6.2) {
                NK.tekst(ctx, "+", cx + nu.x * s, cy + nu.y * s + 0.5, {
                    font: "700 " + Math.round(rN * 1.25) + "px 'Segoe UI', sans-serif",
                    justering: "center", linje: "middle",
                    farve: "rgba(255, 255, 255, " + (0.85 * alfa) + ")"
                });
            }
        }

        /* Elektronerne */
        var rE = NK.klamp(6.6 * s, 3.4, 8);
        for (i = 0; i < this.elektroner.length; i++) {
            var el = this.elektroner[i];
            var alfaE = dmp;

            if (el.tilstand === "gaar") {
                if (!el.fanget) {
                    el.fanget = true;
                    var l = Math.sqrt(el.x * el.x + el.y * el.y) || 1;
                    el.sx = el.x; el.sy = el.y;
                    el.rx = this.retning ? this.retning.x : el.x / l;
                    el.ry = this.retning ? this.retning.y : el.y / l;
                }
                el.x = el.sx + el.rx * el.t * 300;
                el.y = el.sy + el.ry * el.t * 300;
                alfaE = (1 - el.t) * dmp;
            } else {
                var v = this.elektronVinkel(el, geo, opt.lewis, yderste);
                var r = geo.rSkal[el.skal];
                var mx = Math.cos(v) * r, my = Math.sin(v) * r;
                if (el.tilstand === "kommer") {
                    var f = blod(el.t);
                    el.x = NK.lerp(el.sx, mx, f);
                    el.y = NK.lerp(el.sy, my, f);
                } else {
                    el.x = mx; el.y = my;
                }
            }

            var ex = cx + el.x * s, ey = cy + el.y * s;
            if (el.glimt > 0) NK.skaer(ctx, ex, ey, rE * 4, "rgba(242, 197, 61, 0.55)", el.glimt * alfaE);
            NK.skaer(ctx, ex, ey, rE * 2.1, "rgba(242, 197, 61, 0.30)", alfaE);
            tegnKugle(ctx, ex, ey, rE, FARVE.elektronLys, FARVE.elektron, alfaE);
        }

        if (opt.maerkat) {
            var underR = (geo.rSkal[Math.max(0, yderste)]) * s + 24;
            NK.tekst(ctx, opt.maerkat, cx, cy + underR, {
                font: "700 " + Math.round(NK.klamp(19 * s, 13, 21)) + "px 'Segoe UI', sans-serif",
                justering: "center", linje: "middle", farve: "#e9eef4", kant: true
            });
        }

        ctx.restore();
    };

    function tegnKugle(ctx, x, y, r, lys, moerk, alfa) {
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, lys);
        g.addColorStop(1, moerk);
        ctx.globalAlpha = alfa === undefined ? 1 : alfa;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    NK.tegnKugle = tegnKugle;
}());

/* =====================================================================
   Skalmaerkaterne: "2/2", "8/8", "1/8" lige uden for hver skal.

   De staar skraat nedad til venstre, hvor der hverken er en
   elektronprikformel eller en tekst i vejen, og de siger baade hvor
   mange elektroner der ER i skallen, og hvor mange der er PLADS til.
   Det er den halvdel af oktetreglen, tegninger plejer at udelade.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    NK.tegnSkaltal = function (ctx, atom, vinkel) {
        var g = atom.sidsteGeo;
        if (!g || !atom.fordeling.length) return;
        var v = vinkel === undefined ? Math.PI * 0.75 : vinkel;
        var pladser = NK.Data.SKALPLADSER;

        for (var i = 0; i < atom.fordeling.length; i++) {
            var r = g.geo.rSkal[i] * g.s + 21;
            var x = g.cx + Math.cos(v) * r;
            var y = g.cy + Math.sin(v) * r;
            var fuld = atom.fordeling[i] === pladser[i];
            var tekst = atom.fordeling[i] + "/" + pladser[i];

            ctx.save();
            ctx.font = "700 11px 'Segoe UI', sans-serif";
            var b = ctx.measureText(tekst).width + 12;
            NK.rundtRekt(ctx, x - b / 2, y - 9, b, 18, 9);
            ctx.fillStyle = fuld ? "rgba(63, 174, 114, 0.22)" : "rgba(20, 20, 26, 0.78)";
            ctx.fill();
            ctx.strokeStyle = fuld ? "rgba(63, 174, 114, 0.75)" : "rgba(255, 255, 255, 0.16)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            NK.tekst(ctx, tekst, x, y + 0.5, {
                font: "700 11px 'Segoe UI', sans-serif",
                justering: "center", linje: "middle",
                farve: fuld ? "#7ee0a8" : "#c8ced6"
            });
        }
    };
}());
