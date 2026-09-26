/* =====================================================================
   fane.js - rammen om tegnebraettet: laerredet med tavlen, musen, en
   besked oeverst paa scenen (toast), linjen under scenen og Kemichael

   Det samme som NK.Fane i sc6.2 (js/opgavefane.js), bare uden quizzens
   konfetti, prikker og klistermaerke-vindue. NK.Fane.bland(P, "tb")
   laegger metoderne paa fanens prototype; "tb" er forstavelsen paa
   elementerne i index.html (tb-laerred, tb-toast, tb-status ...).

   Fanen selv skal have:
     regler()            tegnebraettets regler
     aendret(hvad)       efter hver aendring paa tavlen
     tegnFane(ctx)       det, fanen tegner oven paa tavlen (valgfri)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function bland(P, pre) {
        P.pre = pre;

        P.startFane = function () {
            var mig = this;
            this.L = new NK.Laerred(NK.el(pre + "-laerred"));
            this.tid = 0;
            this.lay = null;
            this.g = { kaffekop: { skjult: false, iHaand: false } };
            this.toastUr = 0;
            this.braet = new NK.Tegnebraet({
                felt: function () { return mig.felt(); },
                skala: function () { return mig.skala(); },
                regler: this.regler(),
                aendret: function (hvad) { mig.aendret(hvad); },
                toast: function (t, s) { mig.toast(t, s); }
            });
            this.koblMus();
            this.bygTilbud();
            NK.el(pre + "-spring").addEventListener("click", function () { mig.springIntro(); });
            if (this.laererStart) this.laererStart();
        };

        /* ----- Layout -------------------------------------------------------- */
        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay) this.layout();
        };

        P.layout = function () {
            this.lay = NK.Tavle.layout(this.L.b, this.L.h);
            var t = this.lay.tavle;
            this.saetAnker(pre + "-anker-tavle", t.x, t.y, t.b, t.h);
            /* Zoomknapperne i tavlens oeverste hoejre hjoerne */
            var z = NK.el(pre + "-zoom");
            if (z) {
                z.style.left = "0px";   /* maal bredden, foer den flyttes */
                z.style.left = Math.round(t.x + t.b - z.offsetWidth - 10) + "px";
                z.style.top = Math.round(t.y + 10) + "px";
            }
            if (this.efterLayout) this.efterLayout();
        };

        P.felt = function () {
            var t = this.lay ? this.lay.tavle : { x: 0, y: 0, b: 400, h: 300 };
            return { x: t.x + 8, y: t.y + 8, b: t.b - 16, h: t.h - 16 };
        };

        /* Bindingslaengden i pixels: stoerre paa en stor tavle */
        P.skala = function () {
            var t = this.lay ? this.lay.tavle : { b: 700, h: 450 };
            return Math.round(NK.klamp(Math.min(t.b / 13, t.h / 7.2), 34, 58));
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el(id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(b) + "px";
            e.style.height = Math.round(h) + "px";
        };

        /* ----- Beskeder -------------------------------------------------------- */
        P.toast = function (tekst, slags) {
            var e = NK.el(pre + "-toast");
            /* Skjul: den bliver lige staaende, saa den kan naa at blive laest */
            if (!tekst) { this.toastUr = Math.min(this.toastUr, 0.5); return; }
            if (e.textContent === tekst && !e.hidden) { this.toastUr = Math.max(this.toastUr, 1.2); return; }
            e.textContent = tekst;
            e.className = "toast " + (slags || "fejl");
            e.hidden = false;
            this.toastUr = 2.2;
        };

        P.status = function (html) { NK.saetHTML(pre + "-status", html); };

        /* ----- Musen ------------------------------------------------------------- */
        P.overKop = function (pt) {
            var kop = this.g.kaffekop, lay = this.lay;
            if (!lay || kop.skjult || kop.iHaand) return false;
            return Math.abs(pt.x - lay.kop.x) < 26 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 50;
        };

        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            c.addEventListener("pointerdown", function (e) {
                var pt = mig.L.punkt(e);
                mig.paaLaerer = !!(mig.laererUnder && mig.laererUnder(pt.x, pt.y));
                if (mig.paaLaerer || mig.overKop(pt)) return;
                if (e.button === 1) e.preventDefault();   /* ingen autoscroll paa den midterste knap */
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                mig.braet.ned(pt, e);
            });
            /* Musehjulet zoomer omkring musen */
            c.addEventListener("wheel", function (e) {
                e.preventDefault();
                mig.braet.zoomVed(e.deltaY < 0 ? 1.12 : 1 / 1.12, mig.L.punkt(e));
            }, { passive: false });
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                mig.braet.flyt(pt);
                var paaL = mig.laererUnder && mig.laererUnder(pt.x, pt.y);
                c.style.cursor = paaL || mig.overKop(pt) ? "pointer" : mig.braet.markoer(pt);
            });
            c.addEventListener("pointerup", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.paaLaerer) return;
                mig.braet.op(pt);
            });
            c.addEventListener("pointerleave", function () { mig.braet.ud(); });
            c.addEventListener("contextmenu", function (e) { e.preventDefault(); });
            c.addEventListener("click", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
                if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
                if (mig.overKop(pt) && mig.klikKop) mig.klikKop();
            });
        };

        /* ----- Tid og tegning -------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.toastUr > 0) {
                this.toastUr -= dt;
                if (this.toastUr <= 0) NK.el(pre + "-toast").hidden = true;
            }
            if (this.opdaterLaerer) this.opdaterLaerer(dt);
            this.opdaterIntro(dt);
        };

        P.tegn = function () {
            var ctx = this.L.ctx, lay = this.lay;
            if (!lay) return;
            /* Prikkerne foelger udsnittet, naar tavlen flyttes og zoomes */
            var o = this.braet.origo();
            NK.Tavle.tegn(ctx, lay, { ox: o.x, oy: o.y, trin: 26 * this.braet.zoom });
            if (this.tegnFane) this.tegnFane(ctx);
            else this.braet.tegn(ctx);
            var kop = this.g.kaffekop;
            if (!kop.skjult && !kop.iHaand) NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18, lay.kop.y - 40, 42, 40);
            if (this.laererTegnOver) this.laererTegnOver(ctx);
        };

        P.fortryd = function () { return this.braet.fortryd(); };
        P.gentag = function () { return this.braet.gentag(); };
    }

    NK.Fane = { bland: bland };
}());
