/* =====================================================================
   lup_vand.js - luppen paa fane 3, hvor eleven selv bygger

   Runde T11b (28. nov. 2026). Niels om de faste vandmolekyler i luppen:
   "De intermolekylære bindinger med vand er lidt underlige.. skal man
   ikke også bare selv bygge dem?" og "mere leg (besvarelser med drag n
   drop) og færre krøllede spørgsmål" (REGELSAET 67).

     * Ét molekyle paa et lyst kort (REGELSAET 60) med bogens kugler.
       Hvert H i en polaer gruppe har en plads, hvor et vandmolekyle kan
       haenge fast: O i vandet ligger ud for H i gruppen (H...O, 2,65 r
       centrum til centrum), og vandets to H peger vaek. Den stiplede linje
       gaar altid fra H til O.
     * Bakken til venstre har vandmolekyler, som eleven traekker hen paa
       molekylet. Slippes vandet ved en plads, glider det paa plads, og
       hydrogenbindingen toner frem. Slippes det paa kaeden, glider det
       roligt tilbage (fanen skriver beskeden).
     * Under molekylet staar to korte saetninger, "Kæden er ____" og
       "OH-gruppen er ____", som eleven udfylder ved at traekke ordene polær
       og upolær fra bakken (ordtrinet). Ellers staar de udfyldt eller er
       vaek (modus.klammer).
     * Layoutet afhaenger kun af stoffet og rektanglet, saa intet hopper,
       naar bakken skifter mellem vand, ord og ingenting (REGELSAET 4, 13).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kugler;
    var T = NK.Tegn;

    var HB = 3.0;                        /* H i gruppen til O i vandet (lidt laengere end
                                            K.HB, saa den stiplede linje kan ses) */
    var OH = 1.2;                        /* O til H i vandet */
    var V = 52.25 * Math.PI / 180;       /* halv H-O-H-vinkel */
    var SNAP = 2.5;                      /* saa taet paa pladsen (i r) gribes vandet */
    var BLAEK = "#1f2430", POL = "#0b7f74", UPOL = "#5b6270";

    function lex(v, px) { return v + " " + Math.round(px) + "px Lexend, 'Segoe UI', sans-serif"; }
    function rot(x, y, v) { var c = Math.cos(v), s = Math.sin(v); return { x: x * c - y * s, y: x * s + y * c }; }
    function afst(ax, ay, bx, by) { return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by)); }
    function blod(t) { t = NK.klamp(t, 0, 1); return t * t * (3 - 2 * t); }

    /* Et vandmolekyle staaende: O oeverst og de to H nedad, om (0, 0) */
    var OPREJST = [
        { s: "O", x: 0, y: -0.37, tag: true },
        { s: "H", x: -0.95, y: 0.37, giv: true },
        { s: "H", x: 0.95, y: 0.37, giv: true }
    ];

    function kopi(a) { var b = {}; for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) b[k] = a[k]; return b; }

    function naermesteO(atomer, h) {
        var bedst = null, bd = Infinity;
        atomer.forEach(function (o) {
            if (o.s !== "O") return;
            var d = afst(o.x, o.y, h.x, h.y);
            if (d < bd) { bd = d; bedst = o; }
        });
        return bedst;
    }

    /* Molekylet i enheder af r med pladserne til vandet og saetningerne */
    function model(stof) {
        var m = K.model(stof);
        var atomer = m.atomer.map(kopi);
        /* Vendt, saa H i OH-gruppen peger op (glycerol har allerede den
           midterste OH-gruppe opad) */
        if (stof.id !== "glycerol") atomer.forEach(function (a) { a.y = -a.y; });
        /* I glycerol peger H i den hoejre OH-gruppe ogsaa op, saa alt vandet
           ligger over molekylet, og saetningen under det staar frit */
        else atomer.forEach(function (h) {
            if (!h.giv) return;
            var o = naermesteO(atomer, h);
            if (h.y > o.y) h.y = o.y - (h.y - o.y);
        });
        var k = K.kasse([{ atomer: atomer }]);
        var cx = (k.x0 + k.x1) / 2, cy = (k.y0 + k.y1) / 2;
        atomer.forEach(function (a) { a.x -= cx; a.y -= cy; });

        var steder = [];
        atomer.forEach(function (h) {
            if (!h.giv) return;
            var o = naermesteO(atomer, h);
            var dx = h.x - o.x, dy = h.y - o.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
            var ux = dx / l, uy = dy / l;
            var px = h.x + ux * HB, py = h.y + uy * HB;
            var a1 = rot(ux, uy, -V), a2 = rot(ux, uy, V);
            steder.push({
                h: h, x: px, y: py,
                vand: [
                    { s: "O", x: px, y: py, tag: true },
                    { s: "H", x: px + a1.x * OH, y: py + a1.y * OH, giv: true },
                    { s: "H", x: px + a2.x * OH, y: py + a2.y * OH, giv: true }
                ]
            });
        });

        /* Saetningerne under molekylet */
        var saetn = [];
        var kaede = atomer.filter(function (a) { return a.s === "C" && !a.gruppe; });
        var gruppe = atomer.filter(function (a) { return a.tag || a.giv || a.gruppe; });
        function spaend(liste, luft) {
            var xs = liste.map(function (a) { return a.x; });
            return { x0: Math.min.apply(null, xs) - luft, x1: Math.max.apply(null, xs) + luft };
        }
        if (stof.id === "glycerol") {
            var s3 = spaend(atomer, 0);
            saetn.push({ id: "gruppe", x0: s3.x0 + 0.4, x1: s3.x1 - 0.4, foer: "Alle tre OH-grupper er", ord: "polære", rigtig: "polaer" });
        } else if (stof.id === "vand") {
            /* Vand selv: ingen saetning */
        } else if (!gruppe.length) {
            var su = spaend(atomer, 0);
            saetn.push({ id: "kaede", x0: su.x0 + 0.3, x1: su.x1 - 0.3, foer: "Molekylet er", ord: "upolært", rigtig: "upolaer" });
        } else {
            if (kaede.length) {
                var sk = spaend(kaede, 0.7);
                saetn.push({ id: "kaede", x0: sk.x0, x1: sk.x1, foer: "Kæden er", ord: "upolær", rigtig: "upolaer" });
            }
            var sg = spaend(gruppe, 0.6);
            saetn.push({ id: "gruppe", x0: sg.x0, x1: sg.x1, foer: (stof.g === "COOH" ? "COOH-gruppen er" : "OH-gruppen er"), ord: "polær", rigtig: "polaer" });
        }
        return { atomer: atomer, steder: steder, saetn: saetn, mk: K.kasse([{ atomer: atomer }]) };
    }

    var ORD = [{ id: "polaer", tekst: "polær" }, { id: "upolaer", tekst: "upolær" }];

    function LupVand() {
        this.stof = null;
        this.md = null;
        this.fast = {};          /* plads nr -> { fra: {x, y} i px, t } */
        this.brugt = {};         /* bakkens plads nr -> true, naar vandet er brugt */
        this.ord = {};           /* saetning id -> ord id */
        this.flyv = [];          /* ting, der glider tilbage til bakken */
        this.modus = { vand: false, ord: false, klammer: "vis" };
        this.alfa = 1;
        this.tid = 0;
        this.hover = null;
    }

    var P = LupVand.prototype;

    P.saet = function (stof, straks) {
        if (this.stof && this.stof.id === stof.id) return;
        this.stof = stof;
        this.md = model(stof);
        this.nulstil();
        this.alfa = straks ? 1 : 0;
        this.cache = null;
    };

    /* Alt vand tilbage i bakken og ordene ud af saetningerne */
    P.nulstil = function () {
        this.fast = {};
        this.brugt = {};
        this.ord = {};
        this.flyv = [];
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.alfa = Math.min(1, this.alfa + dt / 0.35);
        var k;
        for (k in this.fast) if (Object.prototype.hasOwnProperty.call(this.fast, k)) this.fast[k].t = Math.min(1, this.fast[k].t + dt / 0.35);
        this.flyv = this.flyv.filter(function (f) { f.t += dt / f.varighed; return f.t < 1; });
    };

    /* ----- Status til opgaverne ------------------------------------------------- */
    P.antalSteder = function () { return this.md ? this.md.steder.length : 0; };
    P.antalFast = function () { return Object.keys(this.fast).length; };
    P.alleFast = function () { return this.antalSteder() > 0 && this.antalFast() >= this.antalSteder(); };
    P.ordFaerdig = function () {
        var mig = this;
        return !!this.md && this.md.saetn.length > 0 && this.md.saetn.every(function (s) { return mig.ord[s.id] === s.rigtig; });
    };

    /* Vis svaret: vandet paa alle pladser og ordene i saetningerne */
    P.fyldAlle = function () {
        var mig = this, L = this.cache;
        this.md.steder.forEach(function (s, i) {
            if (mig.fast[i]) return;
            var fra = L ? L.bakke.pladser[0] : { x: 0, y: 0 };
            mig.fast[i] = { fra: { x: fra.x, y: fra.y }, t: 0 };
        });
        this.brugtAlle();
    };
    P.brugtAlle = function () { for (var i = 0; i < 6; i++) this.brugt[i] = true; };
    P.placerOrd = function () {
        var mig = this;
        this.md.saetn.forEach(function (s) { mig.ord[s.id] = s.rigtig; });
    };

    /* ----- Layoutet --------------------------------------------------------------- */
    P.layout = function (R) {
        var noegle = (this.stof ? this.stof.id : "") + "|" + Math.round(R.x) + "," + Math.round(R.y) + "," + Math.round(R.b) + "," + Math.round(R.h);
        if (this.cache && this.cacheN === noegle) return this.cache;
        var md = this.md;
        var bakkeB = NK.klamp(R.b * 0.2, 96, 128);
        var zone = { x: R.x + bakkeB + 14, y: R.y + 8, b: R.b - bakkeB - 22, h: R.h - 16 };
        var alle = [{ atomer: md.atomer }].concat(md.steder.map(function (s) { return { atomer: s.vand }; }));
        var k = K.kasse(alle), mk = md.mk;
        var linje = 24, under = md.saetn.length ? (md.saetn.length > 1 ? 2 * linje + 14 : linje + 14) : 0;
        var rMaks = NK.klamp(R.h / 9.5, 20, 30);
        var r = Math.min(rMaks,
            zone.b / (k.x1 - k.x0 + 0.4),
            zone.h / (k.y1 - k.y0 + 0.3),
            (zone.h - under) / Math.max(1, mk.y1 + 0.9 - k.y0 + 0.2));
        var hoej = Math.max((k.y1 - k.y0) * r, (mk.y1 + 0.9 - k.y0) * r + under);
        var ox = zone.x + zone.b / 2 - (k.x0 + k.x1) / 2 * r;
        var oy = zone.y + (zone.h - hoej) / 2 - k.y0 * r;

        /* Saetningerne: hver centreret under sin del, og en, der ville staa
           oven i den forrige, rykkes en linje ned */
        var ctx = this.maaleCtx || (this.maaleCtx = document.createElement("canvas").getContext("2d"));
        var px = 15, chipB = 0;
        ctx.font = lex("600", px);
        ORD.forEach(function (o) { chipB = Math.max(chipB, ctx.measureText(o.tekst).width + 24); });
        ctx.font = lex("600", px);
        ["polære", "upolært"].forEach(function (t) { chipB = Math.max(chipB, ctx.measureText(t).width + 24); });
        var ky = oy + (mk.y1 + 0.9) * r;
        var saetn = [], forrige = -Infinity;
        md.saetn.forEach(function (s) {
            var x0 = ox + s.x0 * r, x1 = ox + s.x1 * r, mx = (x0 + x1) / 2;
            ctx.font = lex("500", px);
            var fb = ctx.measureText(s.foer + " ").width;
            var b = fb + chipB, vx = NK.klamp(mx - b / 2, zone.x - 4, zone.x + zone.b + 4 - b);
            var ty = ky + 10;
            if (vx < forrige + 10) ty += linje;
            forrige = vx + b;
            saetn.push({ s: s, x0: x0, x1: x1, y: ky, tx: vx, ty: ty, fb: fb,
                felt: { x: vx + fb, y: ty - 2, b: chipB, h: linje } });
        });

        /* Bakken til venstre med pladser til vandet og ordene */
        var bakke = { x: R.x + 8, y: R.y + 8, b: bakkeB, h: R.h - 16 };
        var nV = Math.max(2, Math.min(4, md.steder.length + 1));
        var plads = 3.0 * r;
        nV = Math.max(Math.min(nV, Math.floor((bakke.h - 30) / plads)), Math.min(nV, md.steder.length));
        var pladser = [];
        var y0 = bakke.y + 30 + (bakke.h - 30 - nV * plads) / 2 + plads / 2;
        for (var i = 0; i < nV; i++) pladser.push({ x: bakke.x + bakke.b / 2, y: y0 + i * plads });
        var chips = ORD.map(function (o, j) {
            var cy = bakke.y + 30 + (bakke.h - 30) / 2 + (j - 0.5) * (linje + 18);
            return { id: o.id, tekst: o.tekst, x: bakke.x + (bakke.b - chipB) / 2, y: cy - linje / 2, b: chipB, h: linje + 2 };
        });
        bakke.pladser = pladser;
        bakke.chips = chips;

        this.cache = { r: r, ox: ox, oy: oy, saetn: saetn, bakke: bakke, R: R, px: px, chipB: chipB };
        this.cacheN = noegle;
        return this.cache;
    };

    /* Fra enheder til px og tilbage */
    function tilPx(L, a) { return { s: a.s, x: L.ox + a.x * L.r, y: L.oy + a.y * L.r }; }

    /* ----- Musen -------------------------------------------------------------------- */
    /* Det, der kan gribes i bakken lige nu, eller null */
    P.hvad = function (R, pt) {
        if (!this.md) return null;
        var L = this.layout(R), mig = this, ud = null;
        if (this.modus.vand) {
            L.bakke.pladser.forEach(function (p, i) {
                if (ud || mig.brugt[i] || mig.flyver("vand", i)) return;
                if (afst(p.x, p.y, pt.x, pt.y) < L.r * 1.4) ud = { slags: "vand", nr: i };
            });
        }
        if (!ud && this.modus.ord) {
            L.bakke.chips.forEach(function (c) {
                if (ud || mig.ordBrugt(c.id) || mig.flyver("ord", c.id)) return;
                if (T.inde(c, pt, 4)) ud = { slags: "ord", id: c.id };
            });
        }
        return ud;
    };

    P.ordBrugt = function (id) {
        for (var k in this.ord) if (Object.prototype.hasOwnProperty.call(this.ord, k) && this.ord[k] === id) return true;
        return false;
    };

    P.flyver = function (slags, nr) {
        return this.flyv.some(function (f) { return f.slags === slags && f.nr === nr; });
    };

    /* Den ledige plads naermest punktet (i px), eller null */
    P.ledigVed = function (L, pt) {
        var mig = this, bedst = null, bd = Infinity;
        this.md.steder.forEach(function (s, i) {
            if (mig.fast[i]) return;
            var p = tilPx(L, s), h = tilPx(L, s.h);
            var d = Math.min(afst(p.x, p.y, pt.x, pt.y), afst(h.x, h.y, pt.x, pt.y) + 0.3 * L.r);
            if (d < SNAP * L.r && d < bd) { bd = d; bedst = i; }
        });
        return bedst;
    };

    /* Er punktet paa molekylet (eller ved en optaget plads)? */
    P.paaMolekyle = function (L, pt) {
        var mig = this;
        var paa = this.md.atomer.some(function (a) { var p = tilPx(L, a); return afst(p.x, p.y, pt.x, pt.y) < 1.9 * L.r; });
        var optaget = this.md.steder.some(function (s, i) {
            if (!mig.fast[i]) return false;
            var p = tilPx(L, s);
            return afst(p.x, p.y, pt.x, pt.y) < SNAP * L.r;
        });
        return optaget ? "optaget" : (paa ? "molekyle" : null);
    };

    /* Eleven slipper det, der blev trukket. Giver hvad der skete:
       { slags: "fast" }, { slags: "molekyle" }, { slags: "optaget" },
       { slags: "ord", ok, saetning } eller { slags: "ingen" } */
    P.slip = function (R, g, pt) {
        var L = this.layout(R), mig = this;
        if (g.slags === "vand") {
            var i = this.ledigVed(L, pt);
            if (i !== null) {
                this.fast[i] = { fra: { x: pt.x, y: pt.y }, t: 0 };
                this.brugt[g.nr] = true;
                return { slags: "fast", nr: i };
            }
            var paa = this.paaMolekyle(L, pt);
            this.flyv.push({ slags: "vand", nr: g.nr, fra: { x: pt.x, y: pt.y }, t: 0, varighed: paa ? 0.7 : 0.45 });
            return { slags: paa || "ingen" };
        }
        if (g.slags === "ord") {
            var ramt = null;
            L.saetn.forEach(function (s) {
                if (!ramt && !mig.ord[s.s.id] && T.inde(s.felt, pt, 16)) ramt = s.s;
            });
            if (ramt && ramt.rigtig === g.id) {
                this.ord[ramt.id] = g.id;
                return { slags: "ord", ok: true, saetning: ramt.id };
            }
            this.flyv.push({ slags: "ord", nr: g.id, fra: { x: pt.x, y: pt.y }, t: 0, varighed: ramt ? 0.7 : 0.45 });
            return ramt ? { slags: "ord", ok: false, saetning: ramt.id, ord: g.id } : { slags: "ingen" };
        }
        return { slags: "ingen" };
    };

    /* ----- Tegning ------------------------------------------------------------------ */
    /* Vand som atomer i px (til K.tegnMolekyler, der vil have enheder) */
    function tegnVandPx(ctx, L, atomerPx, alfa) {
        var m = { atomer: atomerPx.map(function (a) { return { s: a.s, x: (a.x - L.ox) / L.r, y: (a.y - L.oy) / L.r, giv: a.s === "H", tag: a.s === "O" }; }) };
        K.tegnMolekyler(ctx, [m], L.ox, L.oy, L.r, alfa);
    }

    /* Hydrogenbindingen som en tynd, fint stiplet linje fra kanten af H til
       kanten af O (Niels 28. nov. 2026: "Hydrogenbindingerne er for fede..
       kan de ikke være mere stiplet") */
    function tegnHB(ctx, L, h, o, alfa) {
        var hx = L.ox + h.x * L.r, hy = L.oy + h.y * L.r, qx = L.ox + o.x * L.r, qy = L.oy + o.y * L.r;
        var dx = qx - hx, dy = qy - hy, l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l;
        var a1 = 0.62 * L.r + 3, a2 = L.r + 3;
        ctx.save();
        ctx.globalAlpha *= alfa;
        ctx.lineCap = "butt";
        ctx.lineWidth = Math.max(1.6, L.r * 0.085);
        ctx.setLineDash([Math.max(3, L.r * 0.15), Math.max(3, L.r * 0.15)]);
        ctx.strokeStyle = K.HB_LYS;
        ctx.beginPath();
        ctx.moveTo(hx + ux * a1, hy + uy * a1);
        ctx.lineTo(qx - ux * a2, qy - uy * a2);
        ctx.stroke();
        ctx.restore();
    }

    function oprejstPx(L, x, y) {
        return OPREJST.map(function (a) { return { s: a.s, x: x + a.x * L.r, y: y + a.y * L.r }; });
    }

    /* R: luppens rektangel. traek: det, eleven traekker lige nu ({g, x, y}) */
    P.tegn = function (ctx, R, traek) {
        if (!this.md) return;
        var L = this.layout(R), mig = this, md = this.md, alfa = this.alfa;
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.clip();

        /* Bakken */
        if (this.modus.vand || this.modus.ord) this.tegnBakke(ctx, L);

        /* Pladsen, vandet glider ind paa, naar det er taet nok paa */
        if (traek && traek.g.slags === "vand") {
            var ved = this.ledigVed(L, traek);
            if (ved !== null) {
                var vp = tilPx(L, md.steder[ved]);
                ctx.save();
                ctx.beginPath();
                ctx.arc(vp.x, vp.y, L.r * 1.45, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(11, 127, 116, 0.10)";
                ctx.fill();
                ctx.setLineDash([5, 4]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgba(11, 127, 116, 0.75)";
                ctx.stroke();
                ctx.restore();
            }
        }

        /* Molekylet */
        K.tegnMolekyler(ctx, [{ atomer: md.atomer }], L.ox, L.oy, L.r, alfa);

        /* Vandet paa pladserne og hydrogenbindingerne (stiplet fra H til O) */
        var auto = this.modus.auto !== undefined ? this.modus.auto : (!this.modus.vand && !this.modus.ord);
        md.steder.forEach(function (s, i) {
            var f = mig.fast[i];
            if (!f && !auto) return;
            var t = f ? blod(f.t) : 1;
            var til = s.vand.map(function (a) { return tilPx(L, a); });
            var atomer = til;
            if (t < 1) {
                var fra = oprejstPx(L, f.fra.x, f.fra.y);
                atomer = til.map(function (a, j) { return { s: a.s, x: fra[j].x + (a.x - fra[j].x) * t, y: fra[j].y + (a.y - fra[j].y) * t }; });
            }
            tegnVandPx(ctx, L, atomer, alfa);
            if (t > 0.6) tegnHB(ctx, L, s.h, s.vand[0], alfa * (t - 0.6) / 0.4);
        });
        /* H i gruppen tegnes igen, saa det ligger foran vandet */
        md.steder.forEach(function (s) { var p = tilPx(L, s.h); T.atom(ctx, "H", p.x, p.y, L.r, alfa); });

        /* Saetningerne */
        if (this.modus.klammer !== "skjul") this.tegnSaetninger(ctx, L);

        /* Det, der glider tilbage til bakken */
        this.flyv.forEach(function (f) {
            var t = blod(f.t);
            if (f.slags === "vand") {
                var p = L.bakke.pladser[f.nr];
                if (!p) return;
                tegnVandPx(ctx, L, oprejstPx(L, f.fra.x + (p.x - f.fra.x) * t, f.fra.y + (p.y - f.fra.y) * t), 1);
            } else {
                var c = mig.chip(L, f.nr);
                if (c) mig.tegnChip(ctx, L, c.tekst, f.fra.x - c.b / 2 + (c.x + c.b / 2 - f.fra.x) * t, f.fra.y - c.h / 2 + (c.y + c.h / 2 - f.fra.y) * t, false);
            }
        });
        ctx.restore();

        /* Det, eleven traekker, tegnes uden for klippet, saa det kan ses overalt */
        if (traek) this.tegnTraek(ctx, traek);
    };

    P.chip = function (L, id) {
        var ud = null;
        L.bakke.chips.forEach(function (c) { if (c.id === id) ud = c; });
        return ud;
    };

    P.tegnBakke = function (ctx, L) {
        var B = L.bakke, mig = this;
        ctx.save();
        NK.rundtRekt(ctx, B.x, B.y, B.b, B.h, 10);
        ctx.fillStyle = this.modus.vand ? "#eaf3f9" : "#f1efe8";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#d6dde3";
        ctx.stroke();
        ctx.restore();
        var titel = this.modus.vand ? "Vand" : "Ord";
        NK.tekst(ctx, titel, B.x + B.b / 2, B.y + 21, { font: lex("500", 14), justering: "center", farve: "#5b6270" });
        if (this.modus.vand) {
            B.pladser.forEach(function (p, i) {
                if (mig.brugt[i] || mig.flyver("vand", i) || (mig.traekNr === i)) return;
                tegnVandPx(ctx, L, oprejstPx(L, p.x, p.y), 1);
            });
        } else {
            B.chips.forEach(function (c) {
                if (mig.ordBrugt(c.id) || mig.flyver("ord", c.id) || mig.traekOrd === c.id) return;
                mig.tegnChip(ctx, L, c.tekst, c.x, c.y, false);
            });
        }
    };

    /* Et ord som et lille kort; neutralt i bakken, farvet i saetningen */
    P.tegnChip = function (ctx, L, tekst, x, y, farve) {
        var b = L.chipB, h = 26;
        ctx.save();
        NK.rundtRekt(ctx, x, y, b, h, 7);
        ctx.fillStyle = farve ? (farve === POL ? "#dcefeb" : "#e6e8ec") : "#ffffff";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = farve || "#9aa3ad";
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, tekst, x + b / 2, y + h / 2 + 5.5, { font: lex("600", L.px), justering: "center", farve: farve || BLAEK });
    };

    P.tegnSaetninger = function (ctx, L) {
        var mig = this, ordtrin = this.modus.klammer === "ord";
        L.saetn.forEach(function (sl) {
            var s = sl.s, valgt = ordtrin ? mig.ord[s.id] : s.rigtig;
            var farve = valgt ? (s.rigtig === "polaer" ? POL : UPOL) : "#9aa3ad";
            /* Klammen under delen */
            ctx.save();
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.strokeStyle = farve;
            if (!valgt) ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(sl.x0, sl.y - 6); ctx.lineTo(sl.x0, sl.y); ctx.lineTo(sl.x1, sl.y); ctx.lineTo(sl.x1, sl.y - 6);
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, s.foer, sl.tx, sl.ty + 17, { font: lex("500", L.px), farve: BLAEK });
            var F = sl.felt;
            if (valgt) {
                var ordTekst = ordtrin ? (valgt === "polaer" ? "polær" : "upolær") : s.ord;
                if (ordtrin) mig.tegnChip(ctx, L, ordTekst, F.x, F.y, farve);
                else NK.tekst(ctx, ordTekst, F.x, sl.ty + 17, { font: lex("600", L.px), farve: farve });
            } else {
                ctx.save();
                NK.rundtRekt(ctx, F.x, F.y, F.b, 26, 7);
                ctx.setLineDash([5, 4]);
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = "#8f97a3";
                ctx.stroke();
                ctx.restore();
            }
        });
    };

    P.tegnTraek = function (ctx, tr) {
        var L = this.cache;
        if (!L) return;
        if (tr.g.slags === "vand") tegnVandPx(ctx, L, oprejstPx(L, tr.x, tr.y), 1);
        else {
            var c = this.chip(L, tr.g.id);
            if (c) this.tegnChip(ctx, L, c.tekst, tr.x - c.b / 2, tr.y - c.h / 2, false);
        }
    };

    /* Saetter, hvad der traekkes, saa bakken ikke tegner det to steder */
    P.traekker = function (g) {
        this.traekNr = g && g.slags === "vand" ? g.nr : -1;
        this.traekOrd = g && g.slags === "ord" ? g.id : null;
    };

    /* Til selvtesten: pladsernes og saetningernes midte i px */
    P.punkter = function (R) {
        var L = this.layout(R), md = this.md;
        return {
            steder: md.steder.map(function (s) { return tilPx(L, s); }),
            kaede: md.atomer.filter(function (a) { return a.s === "C" && !a.gruppe; }).map(function (a) { return tilPx(L, a); }),
            felter: L.saetn.map(function (s) { return { id: s.s.id, x: s.felt.x + s.felt.b / 2, y: s.felt.y + s.felt.h / 2 }; }),
            bakke: L.bakke, r: L.r
        };
    };

    NK.LupVand = LupVand;
}());
