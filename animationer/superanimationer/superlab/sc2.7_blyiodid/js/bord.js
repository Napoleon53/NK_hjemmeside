/* =====================================================================
   bord.js - tegning af bordet og styring med musen

   Udvider NK.Forsoeg med:
     hvad(pt)          hvilken genstand ligger under punktet
     ned / flyt / op   musen: alt bruges ved at klikke
     tegn()            hele scenen i den rigtige raekkefoelge
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var P = NK.Forsoeg.prototype;

    /* ----- Musens position paa tegnebordet ------------------------------ */
    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = S.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    function iRekt(pt, x, y, b, h, pad) {
        pad = pad || 0;
        return pt.x > x - pad && pt.x < x + b + pad && pt.y > y - pad && pt.y < y + h + pad;
    }

    /* ----- Hvad ligger under musen? ---------------------------------------- */
    P.hvad = function (pt) {
        var g = this.g, i;
        if (this.overLaerer) {
            var l = this.overLaerer(pt);
            if (l) return l;
        }
        var kop = g.kaffekop;
        if (!kop.skjult && !kop.iHaand && S.inden("kaffekop", kop.p, kop.anker, pt.x, pt.y, 6)) return "kaffekop";

        var knapper = ["varme", "omroer"];
        for (i = 0; i < knapper.length; i++) {
            var K = S.KNAP[knapper[i]];
            if (Math.abs(pt.x - K.x) < 18 && pt.y > K.y - 22 && pt.y < K.y + 16) return knapper[i];
        }
        var T = S.TERMOMETER;
        if (iRekt(pt, T.x, T.y, T.b, T.h, 4)) return "termometer";

        if (S.inden("vejebaad", g.vejebaad.p, g.vejebaad.anker, pt.x, pt.y, 7)) return "vejebaad";
        if (S.inden("spatel", g.spatel.p, g.spatel.anker, pt.x, pt.y, 9)) return "spatel";
        var navne = ["pbGlas", "kiGlas", "maaleglas", "baegerglas"];
        for (i = 0; i < navne.length; i++) {
            var gg = g[navne[i]];
            if (S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, navne[i] === "baegerglas" ? 0 : 5)) return gg.navn;
        }
        if (iRekt(pt, S.VAEGT.x, S.VAEGT.y, 150, 58, 2)) return "vaegt";
        if (iRekt(pt, S.VARMEPLADE.x, S.VARMEPLADE.y, 180, 72, 0)) return "varmeplade";
        if (iRekt(pt, S.DUNK.x, S.DUNK.y - 4, 90, 134, 0)) return "dunk";
        return null;
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.ned = function (pt) {
        if (NK.Lyd) NK.Lyd.laasOp();
        var navn = this.hvad(pt);
        if (!navn) return false;
        this.klik(navn);
        return false;
    };

    P.flyt = function (pt) {
        this.hover = this.hvad(pt);
    };

    P.op = function () {};

    P.bindMus = function () {
        var mig = this;
        var c = this.canvas;
        c.addEventListener("pointerdown", function (ev) {
            mig.ned(mig.tilBord(ev));
        });
        c.addEventListener("pointermove", function (ev) {
            mig.flyt(mig.tilBord(ev));
            c.style.cursor = mig.hover ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.hover = null; });
    };

    /* ================================================================
       TEGNING
       ================================================================ */
    P.tilpas = function () {
        return this.laerred.tilpas();
    };

    P.oppe = function (gg) {
        var hj = gg.hjem;
        return Math.abs(gg.p.x - hj.x) + Math.abs(gg.p.y - hj.y) > 1.5 || Math.abs(gg.p.v - hj.v) > 0.01;
    };

    P.tegnBaegerglas = function (ctx, tid) {
        var b = this.b, bg = this.g.baegerglas;
        var hn = this.handling ? this.handling.navn : "";
        var o = {
            p: bg.p, vandAreal: b.vandAreal, uklar: b.uklar, bundlag: b.bundlag,
            flager: b.flager, bobler: b.bobler, magnet: !b.flytter, spin: this.spin,
            hvirvel: b.flytter ? 0 : this.omroerFart * 4.5,
            boelge: (b.koger ? 0.9 : 0) + (hn === "vand" && this.straale ? 0.8 : 0),
            fremhaev: this.markeret("baegerglas")
        };
        b.niveau = S.tegnBaegerglas(ctx, o, tid);
    };

    P.tegnGenstand = function (ctx, gg, tid, hjemme) {
        var g = this.g;
        switch (gg.navn) {
            case "pbGlas":
            case "kiGlas":
                S.tegnStofglas(ctx, gg.navn, gg.p, gg.laagT, hjemme);
                break;
            case "vejebaad":
                S.tegnVejebaad(ctx, gg.p, gg.masse);
                break;
            case "spatel":
                if (hjemme) S.skygge(ctx, gg.p.x + 36, 44, 0.2);
                S.tegnSpatel(ctx, gg.p, gg.last);
                break;
            case "maaleglas":
                S.tegnMaaleglas(ctx, gg.p, gg.vandAreal, hjemme);
                break;
            case "baegerglas":
                this.tegnBaegerglas(ctx, tid);
                break;
        }
        if (this.markeret(gg.navn) && gg.navn !== "baegerglas") {
            var pad = gg.navn === "vejebaad" || gg.navn === "spatel" ? 4 : 0;
            S.tegnMarkering(ctx, S.rekt(gg.sprite, gg.p, gg.anker, pad), tid);
        }
        void g;
    };

    P.tegn = function () {
        var L = this.laerred;
        var ctx = L.ctx;
        ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        var tid = this.tid, g = this.g, i;

        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);

        S.tegnBaggrund(ctx, { urMinutter: this.urMinutter });

        var kop = g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            NK.Sprites.tegnPositur(ctx, "kaffekop", kop.p, kop.anker);
            if (Math.sin(tid * 1.3) > -0.2) {
                ctx.save();
                ctx.strokeStyle = "rgba(230, 236, 242, 0.25)";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(kop.p.x - 4, kop.p.y - 42);
                ctx.bezierCurveTo(kop.p.x - 10, kop.p.y - 52, kop.p.x + 2, kop.p.y - 58, kop.p.x - 4, kop.p.y - 68 - Math.sin(tid * 2) * 3);
                ctx.stroke();
                ctx.restore();
            }
        }

        S.tegnDunk(ctx);
        if (this.markeret("dunk")) S.tegnMarkering(ctx, { x: S.DUNK.x, y: S.DUNK.y, b: 90, h: 130 }, tid);

        S.tegnLedning(ctx, this.foelerLoeft);
        S.tegnStang(ctx, this.foelerLoeft);
        S.tegnTermometer(ctx, this.b.T, true, this.markeret("termometer"), tid);
        S.tegnVarmeplade(ctx, {
            varme: this.varme, omroer: this.omroer, effekt: this.effekt,
            vinkelVarme: this.vinkelVarme, vinkelOmroer: this.vinkelOmroer,
            markVarme: this.markeret("varme"), markOmroer: this.markeret("omroer")
        }, tid);

        S.tegnVaegt(ctx, g.vejebaad.stof ? g.vejebaad.masse : 0, tid);

        var aktive = [];
        var orden = ["baegerglas", "maaleglas", "vejebaad", "pbGlas", "kiGlas", "spatel"];
        for (i = 0; i < orden.length; i++) {
            var gg = g[orden[i]];
            if (this.oppe(gg)) aktive.push(gg);
            else this.tegnGenstand(ctx, gg, tid, true);
        }

        S.tegnSpild(ctx, this.spild);
        S.tegnSkvulp(ctx, this.skvulp);

        /* Zoomboblen */
        if (this.bobleAlfa > 0.01) {
            var bg = g.baegerglas;
            var lp = NK.tilVerden(bg.p, bg.anker, S.LUP.x, S.LUP.y);
            S.tegnForbindelse(ctx, lp, S.BOBLE, this.bobleAlfa);
            this.mikro.tegn(ctx, S.BOBLE, this.bobleAlfa, "I bægerglasset", tid);
        }

        for (i = 0; i < aktive.length; i++) this.tegnGenstand(ctx, aktive[i], tid, false);

        if (this.straale) S.tegnStraale(ctx, this.straale.fra, this.straale.til, this.straale.farve, this.straale.bredde, tid);
        S.tegnKorn(ctx, this.korn);
        S.tegnDamp(ctx, this.dampe);
        if (this.tegnLaerer) this.tegnLaerer(ctx, tid);
        ctx.restore();
    };
}());
