/* =====================================================================
   forsoeg.js - selve forsoeget: draabeflasker, folie, lup og papir

   Eleven tager en flaske op fra stativet og klikker paa et felt i
   skemaet. Flasken vendes, klemmes, og én draabe falder ned paa
   folien. Et felt er udfoert, naar det har mindst én draabe af
   søjlens og rækkens opløsning og intet andet.

   Flasken bliver i haanden, til man klikker ved siden af, paa
   stativet eller trykker Esc, saa man kan dryppe en hel søjle i træk.

   Luppen traekkes hen over en draabe (eller flyver derhen, naar man
   klikker paa draaben). Saa viser zoomcirklen ionerne i netop den
   draabe, se mikro.js. Et felt tørres af med køkkenrulle.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var D = NK.Data;

    var MAKS_DRAABER = 4;          /* draaber pr. felt, foer det er fyldt */
    var RADIUS = 13;               /* én draabes radius paa folien */
    var TYNGDE = 1800;
    var KLEM_TID = 0.3;            /* sekunder om at klemme én draabe ud */
    var MAKRO_TID = 1.4;           /* sekunder om at bundfaldet ses fuldt ud */
    NK.MIKRO_TID = 2.6;            /* sekunder om at samle bundfaldet i luppen */
    var TOER_TID = 0.7;

    NK.Forsoeg = function (canvas) {
        this.canvas = canvas;
        this.laerred = canvas ? new NK.Laerred(canvas) : null;
        this.vedAendring = null;
        this.vedBesked = null;
        this.mikro = new NK.Mikro();
        this.nulstil();
        if (canvas) this.bindMus();
    };

    var P = NK.Forsoeg.prototype;
    P.MAKS_DRAABER = MAKS_DRAABER;

    P.nulstil = function () {
        this.tid = 0;
        this.felter = D.FELTER.map(function (F) {
            return {
                nr: F.nr, draaber: {}, antal: 0, r: 0, rMaal: 0, bobl: 0,
                blandTid: -1, analyse: D.analyser({}), loest: false, froe: F.nr * 37 + 11
            };
        });
        this.flasker = D.OPLOESNINGER.map(function (o, i) {
            var h = S.hjem(i);
            return { opl: o.id, nr: i, x: h.x, y: h.y, vinkel: 0, klem: 0, iStativ: true };
        });
        this.haand = -1;
        this.dryp = null;
        this.faldende = [];
        this.plask = [];
        this.papir = [];
        this.lup = { x: S.LUP_HVILE.x, y: S.LUP_HVILE.y, traek: null, over: false };
        this.valgt = -1;
        this.pointer = null;
        this.hover = { felt: -1, flaske: -1, lup: false };
        this.markoer = -1;
        this.harKigget = false;
    };

    P.aendret = function (grund) {
        if (this.vedAendring) this.vedAendring(grund);
    };

    P.besked = function (tekst, slags) {
        if (this.vedBesked) this.vedBesked(tekst, slags || "info");
    };

    /* ----- Til panelet -------------------------------------------------- */
    /* "tom" | "delvis" | "forurenet" | "intet" | "bundfald" */
    P.status = function (nr) {
        var f = this.felter[nr], F = D.FELTER[nr];
        if (!f.antal) return "tom";
        if (D.fremmede(F, f.draaber).length) return "forurenet";
        if (!D.udfoert(F, f.draaber)) return "delvis";
        return f.analyse.bundfald.length ? "bundfald" : "intet";
    };

    P.antalUdfoert = function () {
        var n = 0;
        for (var i = 0; i < this.felter.length; i++) {
            var s = this.status(i);
            if (s === "bundfald" || s === "intet") n++;
        }
        return n;
    };

    P.makroGrad = function (nr) {
        var f = this.felter[nr];
        return f.blandTid < 0 ? 0 : NK.klamp((this.tid - f.blandTid) / MAKRO_TID, 0, 1);
    };

    P.mikroGrad = function (nr) {
        var f = this.felter[nr];
        return f.blandTid < 0 ? 0 : NK.klamp((this.tid - f.blandTid) / NK.MIKRO_TID, 0, 1);
    };

    /* 1: dryp, 2: brug luppen, 3: opskriv reaktionen */
    P.trin = function () {
        if (this.antalUdfoert() === 0) return 1;
        return this.harKigget ? 3 : 2;
    };

    /* ----- Flaskerne ------------------------------------------------------ */
    P.tagFlaske = function (i) {
        if (i < 0 || i >= this.flasker.length) return false;
        if (this.haand === i) return true;
        if (this.haand >= 0) this.saetTilbage();
        this.haand = i;
        this.dryp = null;
        this.flasker[i].iStativ = false;
        this.aendret("tag");
        return true;
    };

    P.saetTilbage = function () {
        if (this.haand < 0) return false;
        this.flasker[this.haand].klem = 0;
        this.haand = -1;
        this.dryp = null;
        this.aendret("tilbage");
        return true;
    };

    /* Flasken i haanden flyver hen over feltet og klemmer én draabe ud. */
    P.drypI = function (nr) {
        if (this.haand < 0 || nr < 0 || nr >= this.felter.length) return false;
        if (this.dryp) return false;
        var f = this.felter[nr];
        if (f.antal >= MAKS_DRAABER) {
            this.besked("Feltet er fyldt. Tør det af for at begynde forfra.", "advarsel");
            return false;
        }
        this.dryp = { felt: nr, fase: "flyt", t: 0, faeldet: false };
        return true;
    };

    P.lander = function (d) {
        var f = this.felter[d.felt], F = D.FELTER[d.felt];
        var foer = f.analyse.bundfald.length;
        f.draaber[d.opl] = (f.draaber[d.opl] || 0) + 1;
        f.antal++;
        f.rMaal = RADIUS * Math.cbrt(f.antal);
        if (f.r < 1) f.r = RADIUS * 0.6;
        f.bobl = 1;
        f.analyse = D.analyser(f.draaber);
        if (f.analyse.bundfald.length && !foer) f.blandTid = this.tid;
        if (!f.analyse.bundfald.length) f.blandTid = -1;
        var c = S.felt(d.felt);
        this.plask.push({ x: c.cx, y: c.cy, r: f.r, liv: 1 });

        if (d.opl !== F.soejle && d.opl !== F.raekke) {
            this.besked(D.opl(d.opl).formel + " hører ikke til i feltet " + D.feltNavn(F) + ".", "advarsel");
        }
        this.aendret("dryp");
    };

    /* ----- Luppen ----------------------------------------------------------- */
    P.vaelgFelt = function (nr) {
        if (nr >= 0 && !this.felter[nr].antal) nr = -1;
        if (this.valgt === nr) return false;
        this.valgt = nr;
        this.aendret("lup");
        return true;
    };

    P.lupMaal = function () {
        if (this.valgt >= 0) {
            var c = S.felt(this.valgt);
            return { x: c.cx, y: c.cy };
        }
        return S.LUP_HVILE;
    };

    /* ----- Køkkenrullen ---------------------------------------------------- */
    P.toerAf = function (nr, forsinkelse) {
        var f = this.felter[nr];
        if (!f || !f.antal) return false;
        for (var i = 0; i < this.papir.length; i++) if (this.papir[i].felt === nr) return false;
        this.papir.push({ felt: nr, t: -(forsinkelse || 0), ryddet: false, x: 0, y: 0, vinkel: 0, alfa: 0 });
        return true;
    };

    P.toerAlt = function () {
        var n = 0;
        for (var i = 0; i < this.felter.length; i++) if (this.toerAf(i, n * 0.07)) n++;
        return n > 0;
    };

    P.ryd = function (nr) {
        var f = this.felter[nr];
        f.draaber = {};
        f.antal = 0;
        f.rMaal = 0;
        f.blandTid = -1;
        f.analyse = D.analyser({});
        if (this.valgt === nr) this.valgt = -1;
        this.aendret("toer");
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = S.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    P.flaskeVed = function (p) {
        for (var i = 0; i < this.flasker.length; i++) {
            var h = S.hjem(i);
            if (i === this.haand) continue;
            if (Math.abs(p.x - h.x) < 34 && p.y > 8 && p.y < S.STATIV.y + S.STATIV.h) return i;
        }
        return -1;
    };

    P.overLup = function (p) {
        var L = this.lup;
        var dx = p.x - L.x, dy = p.y - L.y;
        if (dx * dx + dy * dy < 44 * 44) return true;
        /* skaftet gaar skraat ned til hoejre */
        var t = NK.klamp((dx + dy) / 2 / 66, 0, 1);
        var hx = dx - 66 * t, hy = dy - 66 * t;
        return t > 0 && hx * hx + hy * hy < 13 * 13;
    };

    P.ned = function (p) {
        this.pointer = p;
        var nr, fi;
        if (this.haand >= 0) {
            nr = S.feltVed(p);
            if (nr >= 0) { this.drypI(nr); return true; }
            fi = this.flaskeVed(p);
            if (fi >= 0) { this.tagFlaske(fi); return true; }
            this.saetTilbage();
            return false;
        }
        if (this.overLup(p)) {
            this.lup.traek = { dx: p.x - this.lup.x, dy: p.y - this.lup.y };
            return true;
        }
        fi = this.flaskeVed(p);
        if (fi >= 0) { this.tagFlaske(fi); return true; }
        nr = S.feltVed(p);
        if (nr >= 0 && this.felter[nr].antal > 0) { this.vaelgFelt(nr); return false; }
        return false;
    };

    P.flyt = function (p) {
        this.pointer = p;
        if (this.lup.traek) {
            this.lup.x = NK.klamp(p.x - this.lup.traek.dx, 20, 980);
            this.lup.y = NK.klamp(p.y - this.lup.traek.dy, 20, 580);
            var nr = S.feltVed(this.lup);
            this.vaelgFelt(nr >= 0 && this.felter[nr].antal > 0 ? nr : -1);
            return;
        }
        this.hover.felt = S.feltVed(p);
        this.hover.flaske = this.flaskeVed(p);
        this.hover.lup = this.haand < 0 && this.overLup(p);
    };

    P.op = function () {
        if (!this.lup.traek) return;
        this.lup.traek = null;
        var nr = S.feltVed(this.lup);
        this.vaelgFelt(nr >= 0 && this.felter[nr].antal > 0 ? nr : -1);
    };

    P.markoerStil = function () {
        if (this.lup.traek) return "grabbing";
        if (this.haand >= 0) return this.hover.felt >= 0 ? "none" : (this.hover.flaske >= 0 ? "pointer" : "default");
        if (this.hover.lup || this.hover.flaske >= 0) return "grab";
        if (this.hover.felt >= 0 && this.felter[this.hover.felt].antal > 0) return "zoom-in";
        return "default";
    };

    P.bindMus = function () {
        var mig = this;
        var c = this.canvas;
        c.addEventListener("pointerdown", function (ev) {
            var p = mig.tilBord(ev);
            mig.flyt(p);
            if (mig.ned(p)) {
                try { c.setPointerCapture(ev.pointerId); } catch (fejl) { /* ignoreres */ }
                ev.preventDefault();
            }
            c.style.cursor = mig.markoerStil();
        });
        c.addEventListener("pointermove", function (ev) {
            mig.flyt(mig.tilBord(ev));
            c.style.cursor = mig.markoerStil();
        });
        c.addEventListener("pointerup", function () { mig.op(); });
        c.addEventListener("pointercancel", function () { mig.op(); });
        c.addEventListener("pointerleave", function () {
            if (mig.lup.traek) return;
            mig.pointer = null;
            mig.hover = { felt: -1, flaske: -1, lup: false };
        });
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdater = function (dt) {
        var i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;

        this.opdaterFlasker(dt);

        for (i = this.faldende.length - 1; i >= 0; i--) {
            var d = this.faldende[i];
            d.vy += TYNGDE * dt;
            d.y += d.vy * dt;
            if (d.y >= d.maalY) {
                this.faldende.splice(i, 1);
                this.lander(d);
            }
        }

        for (i = 0; i < this.felter.length; i++) {
            var f = this.felter[i];
            f.r = NK.mod(f.r, f.rMaal, 9, dt);
            if (f.rMaal === 0 && f.r < 0.5) f.r = 0;
            f.bobl = Math.max(0, f.bobl - dt * 2.5);
        }

        for (i = this.plask.length - 1; i >= 0; i--) {
            var p = this.plask[i];
            p.r += dt * 40;
            p.liv -= dt * 2.4;
            if (p.liv <= 0) this.plask.splice(i, 1);
        }

        this.opdaterPapir(dt);

        /* Luppen */
        if (!this.lup.traek) {
            var m = this.lupMaal();
            this.lup.x = NK.mod(this.lup.x, m.x, 8, dt);
            this.lup.y = NK.mod(this.lup.y, m.y, 8, dt);
        }
        var K = S.SKEMA;
        this.lup.over = this.lup.x > K.x0 - 30 && this.lup.x < K.x1 + 30 && this.lup.y > K.y0 - 30 && this.lup.y < K.y1 + 30;

        if (this.valgt >= 0) {
            var vf = this.felter[this.valgt];
            this.mikro.byg(vf.draaber, String(this.valgt));
            this.mikro.opdater(dt, this.mikroGrad(this.valgt));
            if (!this.harKigget && this.status(this.valgt) === "bundfald" && this.mikroGrad(this.valgt) >= 1) {
                this.harKigget = true;
                this.aendret("kigget");
            }
        }
    };

    P.opdaterFlasker = function (dt) {
        for (var i = 0; i < this.flasker.length; i++) {
            var fl = this.flasker[i];
            if (i === this.haand) {
                var maal;
                if (this.dryp) {
                    var c = S.felt(this.dryp.felt);
                    maal = { x: c.cx, y: c.cy - S.OVER_FELT };
                } else if (this.pointer) {
                    maal = { x: this.pointer.x, y: this.pointer.y - S.OVER_FELT };
                } else {
                    maal = { x: 330, y: 200 };
                }
                fl.x = NK.mod(fl.x, maal.x, 16, dt);
                fl.y = NK.mod(fl.y, maal.y, 16, dt);
                fl.vinkel = NK.mod(fl.vinkel, Math.PI, 12, dt);

                if (this.dryp) {
                    var dr = this.dryp;
                    var dx = maal.x - fl.x, dy = maal.y - fl.y;
                    if (dr.fase === "flyt" && dx * dx + dy * dy < 9 && Math.abs(fl.vinkel - Math.PI) < 0.15) {
                        dr.fase = "klem";
                        dr.t = 0;
                    }
                    if (dr.fase === "klem") {
                        dr.t += dt;
                        fl.klem = Math.sin(Math.PI * NK.klamp(dr.t / KLEM_TID, 0, 1));
                        if (!dr.faeldet && dr.t >= KLEM_TID * 0.5) {
                            dr.faeldet = true;
                            var cc = S.felt(dr.felt);
                            var o = D.opl(fl.opl);
                            this.faldende.push({ x: fl.x, y: fl.y + 4, vy: 60, maalY: cc.cy, felt: dr.felt, opl: fl.opl, vaeske: o.farve });
                        }
                        if (dr.t >= KLEM_TID) {
                            fl.klem = 0;
                            this.dryp = null;
                        }
                    }
                }
            } else if (!fl.iStativ) {
                var h = S.hjem(i);
                fl.x = NK.mod(fl.x, h.x, 12, dt);
                fl.y = NK.mod(fl.y, h.y, 12, dt);
                fl.vinkel = NK.mod(fl.vinkel, 0, 12, dt);
                fl.klem = 0;
                if (Math.abs(fl.x - h.x) < 0.6 && Math.abs(fl.y - h.y) < 0.6 && Math.abs(fl.vinkel) < 0.02) {
                    fl.x = h.x;
                    fl.y = h.y;
                    fl.vinkel = 0;
                    fl.iStativ = true;
                }
            }
        }
    };

    /* Papiret glider hen over feltet; draaben er vaek halvvejs. */
    P.opdaterPapir = function (dt) {
        for (var i = this.papir.length - 1; i >= 0; i--) {
            var p = this.papir[i];
            p.t += dt;
            var t = NK.klamp(p.t / TOER_TID, 0, 1);
            var c = S.felt(p.felt);
            p.x = c.cx - 44 + 88 * NK.blod(t);
            p.y = c.cy + 6 * Math.sin(t * Math.PI * 3);
            p.vinkel = -0.25 + 0.2 * Math.sin(t * Math.PI * 4);
            p.alfa = p.t < 0 ? 0 : Math.min(1, Math.min(t * 6, (1 - t) * 6));
            if (!p.ryddet && t >= 0.45) {
                p.ryddet = true;
                this.ryd(p.felt);
            }
            if (p.t >= TOER_TID) this.papir.splice(i, 1);
        }
    };

    /* ----- Tegning -------------------------------------------------------- */
    P.tilpas = function () {
        return this.laerred ? this.laerred.tilpas() : false;
    };

    P.draabeData = function (nr) {
        var f = this.felter[nr], c = S.felt(nr);
        var farve = null;
        for (var id in f.draaber) {
            var o = D.opl(id);
            if (f.draaber[id] > 0 && o.farve) farve = o.farve;
        }
        var b = f.analyse.bundfald[0];
        return {
            x: c.cx, y: c.cy,
            r: f.r * (1 + 0.07 * f.bobl * Math.sin(this.tid * 32)),
            vaeske: farve, bundfald: b ? b.info : null, grad: this.makroGrad(nr), froe: f.froe
        };
    };

    P.tegnFolie = function (ctx, medFremhaev) {
        var fremhaev = {};
        if (medFremhaev) {
            if (this.haand >= 0) {
                var id = this.flasker[this.haand].opl;
                fremhaev.soejle = D.SOEJLER.indexOf(id);
                fremhaev.raekke = D.RAEKKER.indexOf(id);
                fremhaev.felt = this.dryp ? this.dryp.felt : this.hover.felt;
            }
            fremhaev.markoer = this.markoer;
        }
        S.tegnLomme(ctx, fremhaev);
        for (var i = 0; i < this.felter.length; i++) {
            if (this.felter[i].r > 0.5) S.tegnDraabe(ctx, this.draabeData(i));
        }
    };

    P.tegn = function () {
        var L = this.laerred;
        var ctx = L.ctx;
        var i;
        ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        var mig = this;

        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);

        S.tegnBaggrund(ctx);
        this.tegnFolie(ctx, true);
        for (i = 0; i < this.plask.length; i++) S.tegnPlask(ctx, this.plask[i]);
        for (i = 0; i < this.papir.length; i++) if (this.papir[i].alfa > 0) S.tegnPapir(ctx, this.papir[i]);

        for (i = 0; i < this.flasker.length; i++) {
            var fl = this.flasker[i];
            if (fl.iStativ && i !== this.haand) {
                S.tegnFlaske(ctx, { x: fl.x, y: fl.y, vinkel: 0, klem: 0, opl: fl.opl, fremhaev: this.hover.flaske === i && !this.lup.traek });
            }
        }
        S.tegnStativ(ctx);

        if (this.valgt >= 0) {
            var vf = this.felter[this.valgt];
            var farve = null;
            for (var id in vf.draaber) if (D.opl(id).farve) farve = D.opl(id).farve;
            S.tegnKegle(ctx, this.lup, 1);
            S.tegnZoom(ctx, this.mikro, "Dråben i feltet " + D.feltNavn(D.FELTER[this.valgt]), farve);
        } else {
            S.tegnZoom(ctx, null);
        }
        S.tegnLup(ctx, { x: this.lup.x, y: this.lup.y, over: this.lup.over, fremhaev: this.hover.lup }, function (c) {
            mig.tegnFolie(c, false);
        });

        for (i = 0; i < this.flasker.length; i++) {
            var fm = this.flasker[i];
            if (!fm.iStativ && i !== this.haand) S.tegnFlaske(ctx, fm);
        }
        if (this.haand >= 0) {
            var fh = this.flasker[this.haand];
            S.tegnFlaske(ctx, fh);
            if (Math.abs(fh.vinkel - Math.PI) < 0.4) S.tegnHaandSkilt(ctx, fh);
        }
        for (i = 0; i < this.faldende.length; i++) S.tegnFaldendeDraabe(ctx, this.faldende[i]);
        ctx.restore();
    };
}());
