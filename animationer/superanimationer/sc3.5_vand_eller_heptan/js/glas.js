/* =====================================================================
   glas.js - et reagensglas med vand eller heptan: modellen og tegningen

   Et glas har 5 mL oploesningsmiddel. Et stof kommer i i portioner (en
   pipette er 1 mL, en spatelspids er et par korn), hoejst tre. Hvad der
   sker, afgoeres kun af D.blandbar og massefylden:

     vaeske, blandbar      ligger foerst for sig (schlieren), en rystning
                           blander det til ét lag
     vaeske, ikke blandbar to lag; en rystning giver en emulsion, der
                           skiller sig ad igen paa et par sekunder. Det
                           tungeste lag nederst
     fast, oploeseligt     kornene forsvinder, mens glasset rystes (en
                           rystning oploeser ca. én portion)
     fast, uoploeseligt    kornene hvirvler op og lægger sig igen

   Resultatet (ét lag, to lag, oploest, oploeses ikke) er foerst klart,
   naar glasset er rystet og har staaet, til alt har lagt sig.

   Koordinaterne i tegningen er reagensglas.svg's: indersiden er x 9-51,
   bunden y 351, og 1 mL er 20 enheder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var RYST_TID = 1.1;          /* sekunder, én rystning */
    var TILSAET_TID = 0.9;       /* sekunder, dryp eller korn */
    var PR_ML = 20;              /* enheder pr. mL i glasset */
    var BUND = 351, VENSTRE = 9, HOEJRE = 51, MIDT = 30, RADIUS = 21;
    var KORN_PR_PORTION = 16;

    function Glas(opl) {
        this.opl = opl;
        this.nulstil();
    }

    var P = Glas.prototype;

    P.nulstil = function () {
        this.stof = null;
        this.portioner = 0;
        this.tilsaetT = -1;       /* -1: intet paa vej; ellers 0-1 */
        this.blandet = 1;         /* blandbar vaeske: 0 lige tilsat, 1 ét lag */
        this.hvirvel = 0;         /* emulsion eller korn i svaev, 0-1 */
        this.uopl = 0;            /* oploeseligt fast stof: portioner, der ikke er oploest */
        this.rystT = -1;          /* -1: staar stille; ellers tiden i rystningen */
        this.rystet = false;      /* rystet siden sidste tilsaetning */
        this.resultat = null;
        this.nyt = false;         /* resultatet er lige kommet (fanen henter det) */
        this.rystEfter = 0;       /* rystninger efter resultatet (paaskeaegget) */
        this.rystTotal = 0;       /* sekunder rystet i alt (iod i vand) */
        this.draaber = [];
        this.faldKorn = [];
        this.t = 0;
    };

    P.s = function () { return this.stof ? D.stof(this.stof) : null; };
    P.tom = function () { return !this.stof || (this.portioner === 0 && this.tilsaetT < 0); };
    P.optaget = function () { return this.tilsaetT >= 0 || this.rystT >= 0; };
    P.fuld = function () { return this.portioner + (this.tilsaetT >= 0 ? 1 : 0) >= D.MAKS_PORTIONER; };
    P.blandbar = function () { return !!this.stof && D.blandbar(this.stof, this.opl); };

    /* Stoffet kommer i. Kaldes af pipetten/spatlen, naar den er over glasset. */
    P.tilsaet = function (stofId) {
        if (this.tilsaetT >= 0 || this.fuld()) return false;
        if (this.stof && this.stof !== stofId) this.nulstil();
        this.stof = stofId;
        this.tilsaetT = 0;
        return true;
    };

    P.tilsatFaerdig = function () {
        var s = this.s();
        this.tilsaetT = -1;
        this.portioner++;
        if (s.tilstand === "vaeske" && this.blandbar()) {
            this.blandet = this.blandet * (this.portioner - 1) / this.portioner;
        }
        if (s.tilstand === "fast" && this.blandbar()) this.uopl += 1;
        this.rystet = false;
        this.resultat = null;
        this.rystEfter = 0;
    };

    /* Klik paa glasset. Et glas uden stof kan ogsaa rystes; det sker bare ingenting. */
    P.ryst = function () {
        if (this.tilsaetT >= 0) return false;
        if (this.rystT >= 0) return false;
        this.rystT = 0;
        if (this.resultat) this.rystEfter++;
        return true;
    };

    P.vinkel = function () {
        if (this.rystT < 0) return 0;
        var t = this.rystT;
        return 0.075 * Math.sin(t * 36) * Math.sin(Math.PI * Math.min(1, t / RYST_TID));
    };

    P.opdater = function (dt) {
        this.t += dt;
        var s = this.s();

        if (this.tilsaetT >= 0) {
            var foer = this.tilsaetT;
            this.tilsaetT = Math.min(1, this.tilsaetT + dt / TILSAET_TID);
            if (s) this.drypEllerDrys(s, foer, this.tilsaetT);
            if (this.tilsaetT >= 1) this.tilsatFaerdig();
        }
        this.opdaterFald(dt);

        var ryster = this.rystT >= 0;
        if (ryster) {
            this.rystT += dt;
            this.rystTotal += dt;
            if (this.rystT >= RYST_TID) {
                this.rystT = -1;
                if (this.portioner > 0) this.rystet = true;
            }
        }
        if (!s || this.portioner === 0) return;

        var blandbar = this.blandbar(), vaeske = s.tilstand === "vaeske";
        if (ryster) {
            if (vaeske && blandbar) this.blandet = Math.min(1, this.blandet + dt * 1.8);
            else this.hvirvel = Math.min(1, this.hvirvel + dt * 3);
            if (!vaeske && blandbar) this.uopl = Math.max(0, this.uopl - dt * 1.2);
        } else {
            if (vaeske && blandbar) this.blandet = Math.min(1, this.blandet + dt * 0.012);
            /* Emulsionen skiller sig langsommere end kornene synker */
            var fald = vaeske ? (Math.abs(s.rho - D.stof(this.opl).rho) > 0.25 ? 0.75 : 0.55) : 0.8;
            this.hvirvel = Math.max(0, this.hvirvel - dt * fald);
            if (this.hvirvel < 0.004) this.hvirvel = 0;
            if (!vaeske && blandbar) this.uopl = Math.max(0, this.uopl - dt * 0.004);
        }
        if (this.uopl < 0.004) this.uopl = 0;
        if (this.blandet > 0.998) this.blandet = 1;

        if (!this.resultat && this.rystet && !ryster && this.tilsaetT < 0) {
            var klar = vaeske ? (blandbar ? this.blandet >= 1 : this.hvirvel === 0)
                              : (blandbar ? this.uopl === 0 : this.hvirvel === 0);
            if (klar) {
                this.resultat = { blandes: blandbar, obs: D.iagttagelse(this.stof, this.opl) };
                this.nyt = true;
            }
        }
    };

    /* Er der stadig korn paa bunden efter en rystning? (til linjen under scenen) */
    P.mereAtRyste = function () {
        var s = this.s();
        return !!(s && this.rystet && !this.resultat && this.rystT < 0 && s.tilstand === "fast" &&
                  this.blandbar() && this.uopl > 0 && this.hvirvel < 0.05);
    };

    /* ----- Draaber og korn, der falder ned i glasset -------------------------- */
    P.drypEllerDrys = function (s, fra, til) {
        var n = s.tilstand === "vaeske" ? 8 : 12;
        var a = Math.floor(fra * n), b = Math.floor(til * n);
        for (var i = a; i < b; i++) {
            if (s.tilstand === "vaeske") this.draaber.push({ y: 20, v: 60 });
            else this.faldKorn.push({ x: MIDT + (Math.random() - 0.5) * 16, y: 16, v: 40 });
        }
    };

    P.opdaterFald = function (dt) {
        var top = this.overflade();
        this.draaber = this.draaber.filter(function (d) {
            d.v += 700 * dt;
            d.y += d.v * dt;
            return d.y < top;
        });
        this.faldKorn = this.faldKorn.filter(function (k) {
            k.v += 500 * dt;
            k.y += k.v * dt;
            return k.y < top;
        });
    };

    /* ----- Lagene ---------------------------------------------------------------
       Rumfanget i glasset nu (mL), med det der er paa vej ind */
    P.tilsatML = function () {
        var s = this.s();
        if (!s || s.tilstand !== "vaeske") return 0;
        return (this.portioner + Math.max(0, this.tilsaetT)) * D.V_PORTION;
    };

    P.overflade = function () {
        return BUND - (D.V_OPL + this.tilsatML()) * PR_ML;
    };

    /* Lagene fra bunden og op: { fra, til (y), tint, navn } */
    P.lag = function () {
        var s = this.s(), opl = D.stof(this.opl);
        var Vo = D.V_OPL, Vs = this.tilsatML();
        if (!s || Vs === 0 || this.blandbar()) {
            var tint = opl.tint;
            if (s && Vs > 0) tint = blandFarve(opl.tint, s.tint, Vs / (Vo + Vs));
            if (s && s.farveI) tint = this.iodFarve(tint);
            return [{ fra: BUND, til: BUND - (Vo + Vs) * PR_ML, tint: tint, navn: s && Vs > 0 ? "blanding" : opl.navn }];
        }
        var nederst = s.rho > opl.rho ? { V: Vs, st: s } : { V: Vo, st: opl };
        var oeverst = nederst.st === s ? { V: Vo, st: opl } : { V: Vs, st: s };
        var graense = BUND - nederst.V * PR_ML;
        return [
            { fra: BUND, til: graense, tint: nederst.st.tint, navn: nederst.st.navn },
            { fra: graense, til: graense - oeverst.V * PR_ML, tint: oeverst.st.tint, navn: oeverst.st.navn }
        ];
    };

    /* Iod farver oploesningsmidlet: violet i heptan, svagt brunt i vand */
    P.iodFarve = function (tint) {
        var s = this.s(), c = s.farveI[this.opl];
        var styrke = this.blandbar() ? Math.min(0.85, 0.3 * (this.portioner - this.uopl) + 0.08 * Math.max(0, this.tilsaetT))
                                     : Math.min(0.16, 0.1 * this.rystTotal + 0.02 * this.portioner);
        return [c[0], c[1], c[2], Math.max(tint[3], styrke)];
    };

    function blandFarve(a, b, t) {
        return [0, 1, 2, 3].map(function (i) { return a[i] + (b[i] - a[i]) * t; });
    }

    function rgba(c, alfaGange) {
        return "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + (c[3] * (alfaGange === undefined ? 1 : alfaGange)).toFixed(3) + ")";
    }

    /* Bunden inderst ved x (den runde bund) */
    function bundVed(x) {
        var d = x - MIDT;
        return 330 + Math.sqrt(Math.max(0, RADIUS * RADIUS - d * d));
    }

    function indersti(ctx) {
        ctx.beginPath();
        ctx.moveTo(VENSTRE, 12);
        ctx.lineTo(VENSTRE, 330);
        ctx.arc(MIDT, 330, RADIUS, Math.PI, 0, true);
        ctx.lineTo(HOEJRE, 12);
        ctx.closePath();
    }

    /* En overflade eller en graense mellem to lag: lidt hvaelvet (menisk) */
    function menisk(ctx, y, bue) {
        ctx.moveTo(VENSTRE - 2, y - bue);
        ctx.quadraticCurveTo(MIDT, y + bue, HOEJRE + 2, y - bue);
    }

    function streg(ctx, y, bue, moerk) {
        ctx.beginPath();
        menisk(ctx, y, bue);
        ctx.strokeStyle = "rgba(55, 68, 82, " + moerk + ")";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.beginPath();
        menisk(ctx, y + 1.6, bue);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /* Et fast pseudo-tilfaeldigt tal pr. korn, saa de ikke hopper */
    function froe(n) {
        var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
    }

    /* ----- Tegningen --------------------------------------------------------------
       Tegner indholdet og glasset i glassets egne enheder. Kalderen har
       flyttet og skaleret, saa (0, 0) er spritets oeverste venstre hjoerne. */
    P.tegn = function (ctx) {
        var s = this.s(), mig = this, t = this.t;
        var top = this.overflade();

        ctx.save();
        indersti(ctx);
        ctx.clip();

        /* Vaeskerne */
        var lag = this.lag();
        lag.forEach(function (l, i) {
            ctx.beginPath();
            if (i === lag.length - 1) {
                menisk(ctx, l.til, 3);
                ctx.lineTo(HOEJRE + 2, l.fra + 4);
                ctx.lineTo(VENSTRE - 2, l.fra + 4);
            } else {
                ctx.rect(VENSTRE - 2, l.til - 3, HOEJRE - VENSTRE + 4, l.fra - l.til + 7);
            }
            ctx.closePath();
            ctx.fillStyle = rgba(l.tint);
            ctx.fill();
        });

        /* Det ublandede stof: et baand med schlieren ved kanten */
        if (s && s.tilstand === "vaeske" && this.blandbar() && this.blandet < 1) {
            var u = this.tilsatML() * (1 - this.blandet) * PR_ML;
            if (u > 0.5) {
                var oppe = s.rho < D.stof(this.opl).rho;
                var y0 = oppe ? top : BUND - u, y1 = oppe ? top + u : BUND;
                var kant = oppe ? y1 : y0;
                ctx.fillStyle = rgba(s.tint, 1.6);
                ctx.fillRect(VENSTRE - 2, y0, HOEJRE - VENSTRE + 4, y1 - y0);
                var uro = this.rystT >= 0 ? 4 : 1.6;
                for (var k = 0; k < 4; k++) {
                    ctx.beginPath();
                    for (var x = VENSTRE; x <= HOEJRE; x += 2) {
                        var y = kant + (k - 1.5) * 3 + Math.sin(x * 0.35 + t * (1.2 + k * 0.4) + k * 2) * uro;
                        if (x === VENSTRE) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    }
                    ctx.strokeStyle = k % 2 ? "rgba(255, 255, 255, " + (0.5 * (1 - this.blandet)) + ")"
                                            : "rgba(60, 75, 90, " + (0.28 * (1 - this.blandet)) + ")";
                    ctx.lineWidth = 1.1;
                    ctx.stroke();
                }
            }
        }

        /* Graensen mellem to lag */
        if (lag.length === 2) streg(ctx, lag[0].til, 2.5, 0.6 * (1 - this.hvirvel * 0.8));
        streg(ctx, top, 3, 0.55);

        /* Emulsionen: maelket, med smaa draaber, der finder hjem til deres lag */
        if (s && s.tilstand === "vaeske" && !this.blandbar() && this.hvirvel > 0) {
            var h = this.hvirvel;
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.42 * h) + ")";
            ctx.fillRect(VENSTRE - 2, top - 2, HOEJRE - VENSTRE + 4, BUND - top + 4);
            var g = lag[0].til;
            var antal = Math.round(34 * h);
            for (var d = 0; d < antal; d++) {
                var fx = VENSTRE + 4 + froe(d) * (HOEJRE - VENSTRE - 8);
                var tilfaeldig = top + 4 + froe(d + 50) * (BUND - top - 10);
                var hjem = d % 2 ? (g + top) / 2 : (g + BUND) / 2;
                var dy = hjem + (tilfaeldig - hjem) * h + Math.sin(t * 3 + d) * 1.5 * h;
                ctx.beginPath();
                ctx.arc(fx + Math.sin(t * 2 + d * 1.7) * 2 * h, dy, 1.8 + froe(d + 9) * 2.4, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, " + (0.55 * h) + ")";
                ctx.fill();
                ctx.strokeStyle = "rgba(70, 85, 100, " + (0.4 * h) + ")";
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        /* Kornene: paa bunden, i svaev under en rystning, og mindre, mens de oploeses */
        if (s && s.tilstand === "fast" && this.portioner > 0) {
            var blandbar = this.blandbar();
            var tilbage = blandbar ? this.uopl : this.portioner;
            var n = Math.ceil(tilbage * KORN_PR_PORTION);
            var svaev = this.hvirvel;
            for (var i = 0; i < n; i++) {
                var rest = Math.min(1, tilbage * KORN_PR_PORTION - i);
                var fx2 = VENSTRE + 7 + froe(i + 3) * (HOEJRE - VENSTRE - 14);
                var stak = Math.floor(i / 9) * 3.2;
                var ligger = bundVed(fx2) - 3 - stak - froe(i + 77) * 2;
                var oppe2 = top + 10 + froe(i + 31) * (BUND - top - 22);
                var ky = ligger + (oppe2 - ligger) * svaev + Math.sin(t * 5 + i) * 3 * svaev;
                var kx = fx2 + Math.sin(t * 4 + i * 2.1) * 4 * svaev;
                korn(ctx, kx, ky, (3 + froe(i + 5) * 1.4) * (0.45 + 0.55 * rest), froe(i + 13) * 3, s.korn);
            }
        }

        /* Draaber og korn paa vej ned */
        this.draaber.forEach(function (d) {
            ctx.beginPath();
            ctx.ellipse(MIDT, d.y, 2.2, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = s ? rgba(s.tint, 2.2) : "rgba(200,220,240,0.5)";
            ctx.fill();
            ctx.strokeStyle = "rgba(60, 75, 90, 0.5)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
        });
        this.faldKorn.forEach(function (k, i) {
            korn(ctx, k.x, k.y, 2.6, i, s ? s.korn : "#ffffff");
        });

        ctx.restore();
    };

    function korn(ctx, x, y, r, v, farve) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(v);
        ctx.fillStyle = farve;
        ctx.strokeStyle = "rgba(70, 78, 88, 0.75)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.rect(-r, -r * 0.8, r * 2, r * 1.6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    /* Midten af hvert lag i glassets enheder (til maerkaterne ved siden af) */
    P.lagMidter = function () {
        return this.lag().map(function (l) { return { y: (l.fra + l.til) / 2, navn: l.navn }; });
    };

    Glas.RYST_TID = RYST_TID;
    Glas.TILSAET_TID = TILSAET_TID;
    Glas.PR_ML = PR_ML;
    Glas.BUND = BUND;
    Glas.KORN_PR_PORTION = KORN_PR_PORTION;
    Glas.tegnKorn = korn;
    NK.Glas = Glas;
}());
