/* =====================================================================
   scene.js - laboratoriebordet, tegnet paa ét laerred pr. fane

   Til venstre staar spektrofotometeret, og under det zoomboblen, der
   viser lyset gaa gennem kuvetten: fotonerne kommer ind fra venstre,
   nogle bliver opsuget af farvestofmolekylerne, resten naar frem til
   detektoren. Til hoejre er grafen (to grafer paa fane 3). Nederst
   staar stativet med kuvetterne og evt. flasker.

   En kuvette traekkes op i kuvetteholderen eller klikkes (genvej). Saa
   flyver den derop og bliver maalt. Det, displayet viser, og det, der
   bliver gemt, regnes af fanen (js/forsoeg.js); scenen tegner kun.

   Fanen giver scenen:
     d, lambda, kuvette(id), frem, reag, visA(id, lambda), maalt(id, lambda),
     peg(), grafInfo(graf), og faar kald tilbage:
     paaMaaling(id, lambda), paaReagens(navn), paaKlik(hvad), paaLambda(lambda)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var T = NK.Tal;

    /* ----- Sprites ------------------------------------------------------------
       Hentes med <img>, saa de ogsaa virker fra harddisken. Maalene staar
       i kommentaren oeverst i hver SVG-fil. */
    var MAAL = {
        spektrofotometer: { b: 380, h: 210, slotX: 294, slotY: 32, holderBund: 64, lampeX: 246, detX: 342, straaleY: 31,
                            dispX: 24, dispY: 60, dispB: 190, dispH: 82, knapX: 236, knapY: 70, knapB: 124, knapH: 114 },
        kuvette: { b: 34, h: 84, indV: 7, indH: 27, vTop: 18, indBund: 80, bund: 83 },
        draabeflaske: { b: 56, h: 100, etiketV: 10, etiketH: 46, etiketTop: 54, etiketBund: 86, bund: 98 },
        flaske: { b: 50, h: 140, indV: 8, indH: 42, vTop: 52, indBund: 134, etiketTop: 82, etiketBund: 106, bund: 138 }
    };
    var lager = {};
    function hentSprites() {
        Object.keys(MAAL).forEach(function (n) {
            if (lager[n]) return;
            var p = { img: new Image(), klar: false };
            lager[n] = p;
            p.img.addEventListener("load", function () { p.klar = true; });
            p.img.src = "sprites/" + n + ".svg";
        });
    }
    function sprite(c, navn, x, y, sk) {
        var p = lager[navn];
        if (!p || !p.klar) return false;
        c.drawImage(p.img, x, y, MAAL[navn].b * sk, MAAL[navn].h * sk);
        return true;
    }
    NK.Sprites = { MAAL: MAAL, hent: hentSprites, klar: function () {
        return Object.keys(lager).every(function (n) { return lager[n].klar; });
    } };

    var SKRIFT = "'Segoe UI', sans-serif";
    function font(px, vaegt) { return (vaegt || "600") + " " + Math.max(12, Math.round(px)) + "px " + SKRIFT; }

    /* ===================================================================
       SCENEN
       =================================================================== */
    function Scene(canvas, fane) {
        this.l = new NK.Laerred(canvas);
        this.fane = fane;
        this.d = fane.d;
        this.holder = null;        /* id paa kuvetten i instrumentet */
        this.maaling = null;       /* { id, lambda, t, varighed } */
        this.flyv = null;          /* { id, t, fra, til } */
        this.traek = null;
        this.koe = [];             /* automatisk maaling (Vis svaret) */
        this.fotoner = [];
        this.ind = 0; this.ud = 0;
        this.molekyler = {};       /* id -> molekylerne i zoomboblen */
        this.draaber = [];         /* reagensdraaber paa fane 2 */
        this.tid = 0;
        this.blink = {};           /* id -> tid tilbage af et groent blink */
        this.L = null;
        hentSprites();
        this.bind();
    }
    var P = Scene.prototype;

    /* ----- Layout --------------------------------------------------------------- */
    P.tilpas = function () {
        this.l.tilpas();
        var W = this.l.b, H = this.l.h, g = 14;
        var L = {};
        L.W = W; L.H = H; L.g = g;
        var bordH = NK.klamp(H * 0.12, 64, 84);
        L.yb = H - bordH;                         /* bordets overflade */
        L.ks = NK.klamp(H / 560, 0.9, 1.3);       /* kuvetternes skala */
        var oeverst = g, nederst = L.yb + 6 - 84 * L.ks - 30;
        var UH = nederst - oeverst;

        /* Venstre: instrumentet og boblen. Hoejre: graferne. */
        var lw = Math.round(W * 0.5) - g;
        L.lab = { x: g, y: oeverst, b: lw, h: UH };
        var s = Math.min(lw / 380, UH * 0.44 / 210);
        L.s = s;
        L.ix = g; L.iy = oeverst + 8 * s + 16;
        L.holderX = L.ix + MAAL.spektrofotometer.slotX * s;
        L.slotY = L.iy + MAAL.spektrofotometer.slotY * s;
        var bundI = L.iy + 210 * s;
        var r = Math.min(lw * 0.44, (nederst - bundI - 40) / 2);
        r = Math.max(56, r);
        L.br = r;
        L.bx = NK.klamp(L.holderX, g + r + 4, g + lw - r - 4);
        L.by = bundI + 26 + r;

        var gx = Math.round(W * 0.5) + 6;
        var gb = W - gx - g;
        var antal = this.d.grafer.length;
        L.grafer = [];
        if (antal === 1) {
            var gh = Math.min(UH, gb * 1.0);
            L.grafer.push({ x: gx, y: oeverst, b: gb, h: gh });
        } else {
            var h2 = (UH - 10) / 2;
            L.grafer.push({ x: gx, y: oeverst, b: gb, h: h2 });
            L.grafer.push({ x: gx, y: oeverst + h2 + 10, b: gb, h: h2 });
        }

        /* Bordet: kuvetterne i stativet og flaskerne til hoejre */
        var ting = [];
        var ekstra = [];
        if (this.d.flaske) ekstra.push({ id: "flaske", slags: "flaske" });
        if (this.d.reagenser) {
            ekstra.push({ id: "sulf", slags: "reagens", navn: ["Sulfanil-", "amid"] });
            ekstra.push({ id: "kob", slags: "reagens", navn: ["Koblings-", "reagens"] });
        }
        var n = this.d.kuvetter.length;
        var ekstraB = ekstra.length ? ekstra.length * 64 + 26 : 0;
        var sp = NK.klamp((W - 2 * g - ekstraB - 10) / n, 44, 82);
        var raekkeB = sp * n;
        var x0 = g + Math.max(0, (W - 2 * g - ekstraB - raekkeB) / 2);
        var mig = this;
        this.d.kuvetter.forEach(function (k, i) {
            ting.push({ id: k.id, slags: "kuvette", x: x0 + sp * (i + 0.5), y: L.yb + 6 });
        });
        L.stativ = { x: x0 + 4, b: raekkeB - 8 };
        var ex = x0 + raekkeB + 26;
        ekstra.forEach(function (e, i) {
            e.x = ex + 64 * i + 32;
            e.y = L.yb + 8;
            ting.push(e);
        });
        L.ting = ting;
        L.sp = sp;
        this.L = L;
        void mig;
    };

    P.ting = function (id) {
        var t = this.L.ting;
        for (var i = 0; i < t.length; i++) if (t[i].id === id) return t[i];
        return null;
    };

    /* Kuvettens rektangel paa bordet (bunden staar paa y) */
    P.kuvRekt = function (x, y, sk) {
        var m = MAAL.kuvette;
        return { x: x - m.b * sk / 2, y: y - m.bund * sk, b: m.b * sk, h: m.h * sk };
    };

    /* Kuvetten i holderen: bunden nede i instrumentet */
    P.holderPos = function () {
        var L = this.L;
        return { x: L.holderX, y: L.iy + MAAL.spektrofotometer.holderBund * L.s, sk: L.s * 0.95 };
    };

    /* ----- Mus og finger ---------------------------------------------------------- */
    P.bind = function () {
        var mig = this, cv = this.l.canvas;
        cv.addEventListener("pointerdown", function (e) { mig.ned(e); });
        cv.addEventListener("pointermove", function (e) { mig.flyt(e); });
        cv.addEventListener("pointerup", function (e) { mig.op(e); });
        cv.addEventListener("pointercancel", function () { mig.traek = null; });
        cv.addEventListener("pointerleave", function () { if (!mig.traek) cv.style.cursor = "default"; });
    };

    P.ramt = function (p) {
        var L = this.L;
        if (!L) return null;
        /* Boelgelaengdeknapperne */
        var kn = this.lambdaKnapper();
        for (var i = 0; i < kn.length; i++) {
            var k = kn[i];
            if (p.x >= k.x && p.x <= k.x + k.b && p.y >= k.y && p.y <= k.y + k.h) return { slags: "lambda", lambda: k.lambda };
        }
        /* Kuvetten i holderen */
        if (this.holder) {
            var hp = this.holderPos();
            var r = this.kuvRekt(hp.x, hp.y, hp.sk);
            if (p.x >= r.x - 4 && p.x <= r.x + r.b + 4 && p.y >= r.y - 4 && p.y <= L.slotY + 6) return { slags: "holder", id: this.holder };
        }
        /* Tingene paa bordet */
        for (i = 0; i < L.ting.length; i++) {
            var t = L.ting[i];
            if (t.id === this.holder) continue;
            var rr = this.tingRekt(t);
            if (p.x >= rr.x - 5 && p.x <= rr.x + rr.b + 5 && p.y >= rr.y - 6 && p.y <= rr.y + rr.h + 34) return { slags: t.slags, id: t.id };
        }
        /* Instrumentet og boblen */
        if (p.x >= L.ix && p.x <= L.ix + 380 * L.s && p.y >= L.iy && p.y <= L.iy + 210 * L.s) return { slags: "instrument" };
        var dx = p.x - L.bx, dy = p.y - L.by;
        if (dx * dx + dy * dy <= L.br * L.br) return { slags: "boble" };
        for (i = 0; i < L.grafer.length; i++) {
            var gg = L.grafer[i];
            if (p.x >= gg.x && p.x <= gg.x + gg.b && p.y >= gg.y && p.y <= gg.y + gg.h) return { slags: "graf", nr: i };
        }
        return null;
    };

    P.tingRekt = function (t) {
        var L = this.L;
        if (t.slags === "kuvette") return this.kuvRekt(t.x, t.y, L.ks);
        var m = MAAL[t.slags === "flaske" ? "flaske" : "draabeflaske"];
        var sk = t.slags === "flaske" ? L.ks * 0.78 : L.ks * 0.82;
        return { x: t.x - m.b * sk / 2, y: t.y - m.bund * sk, b: m.b * sk, h: m.h * sk, sk: sk };
    };

    P.overInstrument = function (p) {
        var L = this.L;
        return p.x >= L.ix - 10 && p.x <= L.ix + 380 * L.s + 10 && p.y >= L.iy - 70 * L.s && p.y <= L.iy + 210 * L.s;
    };

    P.overStativ = function (p) {
        var L = this.L;
        return p.x >= L.stativ.x - 10 && p.x <= L.stativ.x + L.stativ.b + 10 && p.y >= L.yb - 120 && p.y <= L.yb + 30;
    };

    P.ned = function (e) {
        var p = this.l.punkt(e);
        var h = this.ramt(p);
        if (!h) return;
        if (h.slags === "kuvette" || h.slags === "flaske" || h.slags === "reagens" || h.slags === "holder") {
            this.traek = { slags: h.slags, id: h.id, x: p.x, y: p.y, sx: p.x, sy: p.y, flyttet: false };
            try { this.l.canvas.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            e.preventDefault();
            return;
        }
        if (h.slags === "lambda") { this.fane.paaLambda(h.lambda); return; }
        this.fane.paaKlik(h.slags, h);
    };

    P.flyt = function (e) {
        var p = this.l.punkt(e);
        var t = this.traek;
        if (t) {
            t.x = p.x; t.y = p.y;
            if (Math.abs(p.x - t.sx) + Math.abs(p.y - t.sy) > 6) t.flyttet = true;
            this.l.canvas.style.cursor = "grabbing";
            return;
        }
        var h = this.ramt(p);
        var kan = h && (h.slags === "kuvette" || h.slags === "flaske" || h.slags === "reagens" || h.slags === "holder" || h.slags === "lambda");
        this.l.canvas.style.cursor = kan ? "grab" : (h && (h.slags === "instrument" || h.slags === "boble") ? "pointer" : "default");
        if (h && h.slags === "lambda") this.l.canvas.style.cursor = "pointer";
    };

    P.op = function (e) {
        var t = this.traek;
        this.traek = null;
        this.l.canvas.style.cursor = "default";
        if (!t) return;
        var p = this.l.punkt(e);
        if (t.slags === "holder") {
            /* Kuvetten tages ud af instrumentet: tilbage i stativet */
            if (t.flyttet && !this.overInstrument(p)) this.tagUd();
            else if (!t.flyttet) this.fane.paaKlik("holder", { id: t.id });
            return;
        }
        if (t.slags === "reagens") {
            if (!t.flyttet || this.overStativ(p) || this.overInstrument(p)) this.fane.paaReagens(t.id);
            return;
        }
        /* En kuvette eller flasken: klik eller slip over instrumentet maaler */
        if (!t.flyttet || this.overInstrument(p)) {
            this.saetI(t.id, t.flyttet ? { x: p.x, y: p.y } : null);
        }
    };

    /* ----- Maalingen ----------------------------------------------------------------- */
    P.saetI = function (id, fra) {
        var L = this.L;
        if (this.holder && this.holder !== id) this.holder = null;
        var t = this.ting(id);
        if (!fra && t) fra = { x: t.x, y: t.y - 10 };
        var hp = this.holderPos();
        this.holder = id;
        this.flyv = { id: id, t: 0, fra: fra || { x: hp.x, y: hp.y - 80 }, til: hp };
        this.maaling = null;
        this.fotoner = [];
        this.ind = 0; this.ud = 0;
        void L;
    };

    P.tagUd = function () {
        this.holder = null;
        this.maaling = null;
        this.flyv = null;
        this.fotoner = [];
        this.ind = 0; this.ud = 0;
    };

    P.startMaaling = function () {
        if (!this.holder) return;
        var v = this.d.maaletid || 1;
        if (this.koe.length) v = Math.min(v, 0.45);
        this.maaling = { id: this.holder, lambda: this.fane.lambda, t: 0, varighed: v, faerdig: false };
        this.fotoner = [];
        this.ind = 0; this.ud = 0;
    };

    /* Maal igen ved en ny boelgelaengde (fane 3) */
    P.maalIgen = function () {
        if (this.holder && !this.flyv) this.startMaaling();
    };

    /* Vis svaret: maal en liste { id, lambda } én efter én */
    P.maalAlle = function (liste) {
        this.koe = liste.slice();
        this.naesteIKoe();
    };

    P.naesteIKoe = function () {
        if (!this.koe.length) return;
        var n = this.koe.shift();
        if (n.lambda && n.lambda !== this.fane.lambda) this.fane.saetLambda(n.lambda);
        if (this.holder === n.id && !this.flyv) this.startMaaling();
        else this.saetI(n.id, null);
    };

    P.travl = function () {
        return !!(this.flyv || (this.maaling && !this.maaling.faerdig) || this.koe.length);
    };

    /* ----- Tiden --------------------------------------------------------------------- */
    P.opdater = function (dt) {
        if (!this.L) this.tilpas();
        this.tid += dt;
        var mig = this;
        Object.keys(this.blink).forEach(function (k) {
            mig.blink[k] -= dt;
            if (mig.blink[k] <= 0) delete mig.blink[k];
        });
        if (this.flyv) {
            this.flyv.t += dt / 0.32;
            if (this.flyv.t >= 1) { this.flyv = null; this.startMaaling(); }
        }
        if (this.maaling && !this.maaling.faerdig) {
            this.maaling.t += dt;
            if (this.maaling.t >= this.maaling.varighed) {
                this.maaling.faerdig = true;
                this.blink[this.maaling.id] = 0.9;
                this.fane.paaMaaling(this.maaling.id, this.maaling.lambda);
                if (this.koe.length) this.koeVent = 0.15;
            }
        }
        if (this.koeVent > 0) {
            this.koeVent -= dt;
            if (this.koeVent <= 0) { this.koeVent = 0; this.naesteIKoe(); }
        }
        this.opdaterDraaber(dt);
        this.opdaterBoble(dt);
        this.tegn();
    };

    /* ===================================================================
       TEGNINGEN
       =================================================================== */
    P.tegn = function () {
        var c = this.l.ctx, L = this.L;
        this.l.ryd();
        this.tegnBord(c);
        this.tegnZoomKegle(c);
        this.tegnInstrument(c);
        this.tegnBoble(c);
        for (var i = 0; i < L.grafer.length; i++) this.tegnGraf(c, L.grafer[i], this.d.grafer[i]);
        this.tegnTing(c);
        this.tegnPile(c);
        this.tegnTraek(c);
    };

    /* ----- Bordet og stativet ------------------------------------------------------- */
    P.tegnBord = function (c) {
        var L = this.L;
        c.save();
        var gr = c.createLinearGradient(0, L.yb, 0, L.H);
        gr.addColorStop(0, "#5b5f6a");
        gr.addColorStop(0.14, "#4a4e58");
        gr.addColorStop(0.15, "#33363e");
        gr.addColorStop(1, "#24262c");
        c.fillStyle = gr;
        c.fillRect(0, L.yb, L.W, L.H - L.yb);
        c.fillStyle = "rgba(255,255,255,0.14)";
        c.fillRect(0, L.yb, L.W, 2);
        /* Stativets bagkant */
        var st = L.stativ;
        c.fillStyle = "#2a2d35";
        NK.rundtRekt(c, st.x, L.yb - 30 * L.ks, st.b, 30 * L.ks + 8, 5);
        c.fill();
        c.restore();
    };

    /* Stativets forkant tegnes over kuvetterne, saa de staar nede i det */
    P.tegnStativFront = function (c) {
        var L = this.L, st = L.stativ;
        c.save();
        var gr = c.createLinearGradient(0, L.yb - 18 * L.ks, 0, L.yb + 8);
        gr.addColorStop(0, "#5a606c");
        gr.addColorStop(1, "#3c414b");
        c.fillStyle = gr;
        NK.rundtRekt(c, st.x - 2, L.yb - 18 * L.ks, st.b + 4, 18 * L.ks + 8, 4);
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.18)";
        c.fillRect(st.x, L.yb - 18 * L.ks, st.b, 1.5);
        c.restore();
    };

    P.tegnTing = function (c) {
        var L = this.L, mig = this;
        var peg = this.fane.peg();
        L.ting.forEach(function (t) {
            if (t.slags !== "kuvette") return;
            var tom = t.id === mig.holder || (mig.traek && mig.traek.id === t.id && mig.traek.flyttet);
            var r = mig.kuvRekt(t.x, t.y, L.ks);
            if (tom) {
                c.save();
                c.strokeStyle = "rgba(255,255,255,0.18)";
                c.setLineDash([4, 4]);
                c.strokeRect(r.x + 3 * L.ks, r.y + 4 * L.ks, r.b - 6 * L.ks, r.h - 6 * L.ks);
                c.restore();
            } else {
                if (peg.indexOf(t.id) >= 0) mig.glod(c, r);
                mig.tegnKuvette(c, t.id, t.x, t.y, L.ks);
            }
        });
        this.tegnStativFront(c);
        /* Etiketterne paa bordets forkant */
        L.ting.forEach(function (t) {
            if (t.slags !== "kuvette") return;
            var k = mig.fane.kuvette(t.id);
            var et = k.etiket || [];
            c.save();
            c.textAlign = "center";
            c.fillStyle = "#e6eaf0";
            c.font = font(13.5 * Math.min(1.1, L.ks), "700");
            if (et[0]) c.fillText(et[0], t.x, L.yb + 28);
            c.fillStyle = "#aab2bf";
            c.font = font(12.5 * Math.min(1.1, L.ks), "600");
            if (et[1]) c.fillText(et[1], t.x, L.yb + 44);
            c.restore();
            mig.tegnFlueben(c, t);
        });
        /* Flaskerne */
        L.ting.forEach(function (t) {
            if (t.slags === "kuvette") return;
            if (mig.traek && mig.traek.id === t.id && mig.traek.flyttet) return;
            var r = mig.tingRekt(t);
            if (peg.indexOf(t.id) >= 0) mig.glod(c, r);
            if (t.slags === "flaske") mig.tegnFlaske(c, t.x, t.y, r.sk);
            else mig.tegnReagens(c, t, t.x, t.y, r.sk);
        });
        this.tegnUr(c);
    };

    /* Et lille groent maerke over en kuvette, der er maalt (ved alle
       boelgelaengder, trinnet skal bruge) */
    P.tegnFlueben = function (c, t) {
        var L = this.L;
        var lam = this.d.lambdaer;
        var r = this.kuvRekt(t.x, t.y, L.ks);
        var x = t.x - (lam.length - 1) * 7, y = r.y - 9;
        for (var i = 0; i < lam.length; i++) {
            var m = this.fane.maalt(t.id, lam[i]);
            if (!m) continue;
            c.save();
            c.beginPath();
            c.arc(x + i * 14, y, 4.5, 0, Math.PI * 2);
            c.fillStyle = m.ok ? (lam.length > 1 ? D.LYS[lam[i]] : "#5fd38f") : "#ff6b5e";
            c.fill();
            c.restore();
        }
    };

    P.glod = function (c, r) {
        var p = 0.5 + 0.5 * Math.sin(this.tid * 4);
        c.save();
        c.shadowColor = "rgba(242,197,61,0.9)";
        c.shadowBlur = 8 + 8 * p;
        c.strokeStyle = "rgba(242,197,61," + (0.55 + 0.4 * p).toFixed(2) + ")";
        c.lineWidth = 2;
        NK.rundtRekt(c, r.x - 4, r.y - 4, r.b + 8, r.h + 8, 6);
        c.stroke();
        c.restore();
    };

    /* En kuvette med vaesken bag glasset. id kan ogsaa vaere "flaske" */
    P.tegnKuvette = function (c, id, x, y, sk) {
        var m = MAAL.kuvette;
        var r = this.kuvRekt(x, y, sk);
        var k = this.fane.kuvette(id);
        var f = M.farve(k.indhold, this.fane.frem);
        c.save();
        c.fillStyle = M.rgba(f);
        c.fillRect(r.x + m.indV * sk, r.y + m.vTop * sk, (m.indH - m.indV) * sk, (m.indBund - m.vTop) * sk);
        c.fillStyle = "rgba(255,255,255,0.25)";
        c.fillRect(r.x + m.indV * sk, r.y + m.vTop * sk, (m.indH - m.indV) * sk, 1.5);
        if (!sprite(c, "kuvette", r.x, r.y, sk)) {
            c.strokeStyle = "#dfeaf5";
            c.strokeRect(r.x + 3 * sk, r.y + 4 * sk, 28 * sk, 78 * sk);
        }
        if (this.blink[id]) {
            c.strokeStyle = "rgba(95,211,143," + Math.min(1, this.blink[id]).toFixed(2) + ")";
            c.lineWidth = 3;
            c.strokeRect(r.x + 1, r.y + 2, r.b - 2, r.h - 3);
        }
        c.restore();
    };

    P.tegnFlaske = function (c, x, y, sk) {
        var m = MAAL.flaske;
        var r = { x: x - m.b * sk / 2, y: y - m.bund * sk };
        var k = this.fane.kuvette("flaske");
        var f = M.farve(k.indhold, 1);
        c.save();
        c.fillStyle = M.rgba(f);
        NK.rundtRekt(c, r.x + m.indV * sk, r.y + m.vTop * sk, (m.indH - m.indV) * sk, (m.indBund - m.vTop) * sk, 5 * sk);
        c.fill();
        sprite(c, "flaske", r.x, r.y, sk);
        c.fillStyle = "#f4f1e8";
        c.fillRect(r.x + 7 * sk, r.y + m.etiketTop * sk, 36 * sk, (m.etiketBund - m.etiketTop) * sk);
        c.fillStyle = "#2b2f38";
        c.textAlign = "center";
        c.font = font(11 * sk + 2, "700");
        c.fillText("E129", x, r.y + (m.etiketTop + 14) * sk);
        c.restore();
        c.save();
        c.textAlign = "center";
        c.fillStyle = "#e6eaf0";
        c.font = font(13, "700");
        c.fillText(this.d.flaske.etiket, this.ting("flaske").x, this.L.yb + 28);
        c.restore();
    };

    P.tegnReagens = function (c, t, x, y, sk) {
        var m = MAAL.draabeflaske;
        var r = { x: x - m.b * sk / 2, y: y - m.bund * sk };
        var hop = 0;
        var d = this.draaber.filter(function (q) { return q.fra === t.id; })[0];
        if (d) hop = Math.sin(Math.min(1, d.t) * Math.PI) * 14;
        c.save();
        c.translate(0, -hop);
        sprite(c, "draabeflaske", r.x, r.y, sk);
        c.fillStyle = "#2b2f38";
        c.textAlign = "center";
        c.font = font(10 * sk + 1, "700");
        c.fillText(t.id === "sulf" ? "SULF" : "KOBL", x, r.y + (m.etiketTop + 18) * sk);
        c.restore();
        c.save();
        c.textAlign = "center";
        c.fillStyle = "#e6eaf0";
        c.font = font(12.5, "700");
        c.fillText(t.navn[0], t.x, this.L.yb + 28);
        c.fillText(t.navn[1], t.x, this.L.yb + 44);
        var givet = this.fane.reag && this.fane.reag[t.id];
        if (givet) {
            c.fillStyle = "#5fd38f";
            c.beginPath();
            c.arc(x + 20, r.y - 4, 8, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#10241a";
            c.font = font(12, "800");
            c.fillText("✓", x + 20, r.y);
        }
        c.restore();
    };

    /* Uret, mens farven udvikler sig (fane 2) */
    P.tegnUr = function (c) {
        var r = this.fane.reag;
        if (!r || !r.venter) return;
        var L = this.L;
        var rr = 22;
        var x = L.g + rr + 10, y = L.by - L.br + rr + 6;
        if (L.bx - L.br - L.g < 2 * rr + 30) { x = L.bx + L.br + rr + 12; }
        c.save();
        c.fillStyle = "rgba(14,16,22,0.9)";
        c.beginPath(); c.arc(x, y, rr + 6, 0, Math.PI * 2); c.fill();
        c.strokeStyle = "#f2c53d";
        c.lineWidth = 4;
        c.beginPath();
        c.arc(x, y, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r.frem);
        c.stroke();
        c.fillStyle = "#f7e4ab";
        c.textAlign = "center";
        c.font = font(12, "800");
        c.fillText(Math.round(r.frem * 10) + " min", x, y + 4);
        c.restore();
    };

    /* ----- Draaberne fra reagensflaskerne -------------------------------------------- */
    P.reagensDraaber = function (id) {
        this.draaber.push({ fra: id, t: 0 });
    };

    P.opdaterDraaber = function (dt) {
        this.draaber.forEach(function (d) { d.t += dt / 0.9; });
        this.draaber = this.draaber.filter(function (d) { return d.t < 1.4; });
    };

    /* ----- Instrumentet ------------------------------------------------------------- */
    P.lambdaKnapper = function () {
        var L = this.L;
        if (!L || this.d.lambdaer.length < 2) return [];
        var m = MAAL.spektrofotometer, s = L.s;
        var ud = [];
        this.d.lambdaer.forEach(function (lam, i) {
            ud.push({ lambda: lam, x: L.ix + (m.knapX + 8) * s, y: L.iy + (m.knapY + 10 + i * 50) * s, b: (m.knapB - 16) * s, h: 42 * s });
        });
        return ud;
    };

    P.tegnInstrument = function (c) {
        var L = this.L, s = L.s, m = MAAL.spektrofotometer, mig = this;
        var ix = L.ix, iy = L.iy;
        /* Kuvetten i holderen tegnes foerst og klippes ved aabningen */
        var hp = this.holderPos();
        if (this.holder) {
            var pos = hp;
            if (this.flyv) {
                var u = NK.blod(this.flyv.t);
                pos = { x: NK.lerp(this.flyv.fra.x, hp.x, u), y: NK.lerp(this.flyv.fra.y, hp.y, u) - Math.sin(u * Math.PI) * 50, sk: NK.lerp(L.ks, hp.sk, u) };
            }
            c.save();
            if (!this.flyv || this.flyv.t > 0.85) {
                c.beginPath();
                c.rect(0, 0, L.W, L.slotY + 2);
                c.clip();
            }
            this.tegnKuvette(c, this.holder, pos.x, pos.y, pos.sk);
            c.restore();
        }
        if (!sprite(c, "spektrofotometer", ix, iy, s)) {
            c.fillStyle = "#c3c8d0";
            NK.rundtRekt(c, ix + 6 * s, iy + 44 * s, 368 * s, 156 * s, 14 * s);
            c.fill();
        }
        /* Lyset i rummet: lampen lyser, detektoren faar det, der slipper igennem */
        var lam = this.fane.lambda;
        var lysF = D.LYS[lam];
        var ly = iy + m.straaleY * s;
        if (this.holder && !this.flyv) {
            var A = this.visDisplay().Asand;
            var Tr = M.transmittans(Math.max(0, A));
            c.save();
            c.strokeStyle = lysF;
            c.lineWidth = 3 * s;
            c.globalAlpha = 0.95;
            c.beginPath(); c.moveTo(ix + (m.lampeX + 5) * s, ly); c.lineTo(hp.x - 12 * s, ly); c.stroke();
            c.globalAlpha = 0.25 + 0.7 * Tr;
            c.beginPath(); c.moveTo(hp.x + 12 * s, ly); c.lineTo(ix + (m.detX - 5) * s, ly); c.stroke();
            c.restore();
        }
        c.save();
        c.beginPath();
        c.arc(ix + m.lampeX * s, ly, 3.4 * s, 0, Math.PI * 2);
        c.fillStyle = this.holder ? lysF : "#454b55";
        c.fill();
        c.restore();

        /* Displayet */
        var dx = ix + m.dispX * s, dy = iy + m.dispY * s, db = m.dispB * s, dh = m.dispH * s;
        var v = this.visDisplay();
        c.save();
        c.textBaseline = "alphabetic";
        c.fillStyle = "#8fa39a";
        c.font = font(12.5 * s + 1, "700");
        c.textAlign = "left";
        c.fillText("λ = " + lam + " nm", dx + 10 * s, dy + 20 * s);
        c.textAlign = "left";
        c.fillStyle = v.farveA;
        c.font = font(27 * s, "700");
        c.fillText(v.A, dx + 10 * s, dy + 52 * s);
        /* Foer nulstillingen staar advarslen, hvor T ellers staar */
        if (!this.fane.nulstillet) {
            c.fillStyle = "#ff8a7d";
            c.font = font(13 * s + 1, "700");
            c.fillText("ikke nulstillet", dx + 10 * s, dy + 74 * s);
        } else {
            c.fillStyle = "#7fd6f0";
            c.font = font(15 * s + 1, "700");
            c.fillText(v.T, dx + 10 * s, dy + 74 * s);
        }
        c.restore();

        /* Knapperne til boelgelaengden, eller en fast boelgelaengde */
        var kn = this.lambdaKnapper();
        if (kn.length) {
            kn.forEach(function (k) {
                var aktiv = k.lambda === lam;
                c.save();
                NK.rundtRekt(c, k.x, k.y, k.b, k.h, 6 * s);
                c.fillStyle = aktiv ? "#20242c" : "#e8ebef";
                c.fill();
                c.lineWidth = aktiv ? 3 : 1.5;
                c.strokeStyle = aktiv ? D.LYS[k.lambda] : "#8e95a0";
                c.stroke();
                c.fillStyle = aktiv ? D.LYS[k.lambda] : "#3b414c";
                c.textAlign = "center";
                c.font = font(15 * s + 1, "800");
                c.fillText(k.lambda + " nm", k.x + k.b / 2, k.y + k.h / 2 + 5 * s);
                c.restore();
            });
            if (this.fane.pegLambda && this.fane.pegLambda()) {
                var pk = kn.filter(function (k) { return k.lambda !== lam; })[0];
                if (pk) mig.glod(c, { x: pk.x, y: pk.y, b: pk.b, h: pk.h });
            }
        } else {
            var kx = ix + (m.knapX + 10) * s, ky = iy + (m.knapY + 12) * s;
            c.save();
            c.fillStyle = "#3b414c";
            c.font = font(12 * s + 1, "700");
            c.textAlign = "left";
            c.fillText("Bølgelængde", kx, ky + 8 * s);
            NK.rundtRekt(c, kx, ky + 18 * s, (m.knapB - 20) * s, 38 * s, 5 * s);
            c.fillStyle = "#20242c";
            c.fill();
            c.fillStyle = lysF;
            c.font = font(16 * s + 1, "800");
            c.textAlign = "center";
            c.fillText(lam + " nm", kx + (m.knapB - 20) * s / 2, ky + 43 * s);
            c.restore();
        }
        /* Holderen lyser, naar der er noget at saette i */
        if (!this.holder && (this.fane.peg().length || (this.traek && this.traek.flyttet && this.traek.slags !== "reagens"))) {
            var p = 0.5 + 0.5 * Math.sin(this.tid * 4);
            c.save();
            c.strokeStyle = "rgba(242,197,61," + (0.45 + 0.45 * p).toFixed(2) + ")";
            c.setLineDash([5, 4]);
            c.lineWidth = 2;
            c.strokeRect(hp.x - 22 * s, L.slotY - 12 * s, 44 * s, 18 * s);
            c.restore();
        }
    };

    /* Det, displayet viser lige nu */
    P.visDisplay = function () {
        var ud = { A: "A = –,–––", T: "T = –– %", farveA: "#f2c53d", Asand: 0 };
        if (!this.holder || this.flyv) return ud;
        var mm = this.maaling;
        var lam = this.fane.lambda;
        var A = this.fane.visA(this.holder, lam);
        var Asand = A;
        ud.Asand = Asand;
        if (mm && !mm.faerdig) {
            var u = NK.blod(mm.t / mm.varighed);
            var Ta = 100 - (100 - 100 * M.transmittans(A)) * u;
            ud.A = "Måler …";
            ud.T = "T = " + T.dk(Ta, 1) + " %";
            ud.farveA = "#e9eef4";
            ud.Asand = A * u;
            return ud;
        }
        ud.A = "A = " + T.A(A);
        ud.T = "T = " + T.dk(100 * M.transmittans(A), 1) + " %";
        ud.farveA = A > 1.5 ? "#ff8a7d" : "#7ee0a8";
        return ud;
    };

    /* ----- Zoomboblen ----------------------------------------------------------------- */
    P.tegnZoomKegle = function (c) {
        var L = this.L;
        var hp = this.holderPos();
        c.save();
        c.fillStyle = "rgba(255,255,255,0.045)";
        c.beginPath();
        c.moveTo(hp.x - 8 * L.s, L.iy + 210 * L.s - 4);
        c.lineTo(L.bx - L.br * 0.85, L.by - L.br * 0.5);
        c.lineTo(L.bx + L.br * 0.85, L.by - L.br * 0.5);
        c.lineTo(hp.x + 8 * L.s, L.iy + 210 * L.s - 4);
        c.closePath();
        c.fill();
        c.restore();
    };

    /* Molekylerne i en kuvette, i boblens egne koordinater (-1..1) */
    P.molekylerFor = function (id) {
        var k = this.fane.kuvette(id);
        var noegle = id + "|" + (k.noegle || "");
        if (this.molekyler[noegle]) return this.molekyler[noegle];
        var ud = [];
        var skala = this.d.prikker || 1.2;
        var ind = k.indhold || {};
        function nye(type, antal, r) {
            for (var i = 0; i < antal; i++) {
                ud.push({ type: type, x: NK.r(-0.52, 0.52), y: NK.r(-0.86, 0.86), vx: NK.r(-0.12, 0.12), vy: NK.r(-0.12, 0.12),
                          r: r, u: Math.random(), v: Math.random(), glimt: 0 });
            }
        }
        Object.keys(ind).forEach(function (s) {
            var n = Math.min(110, Math.round(ind[s] * (s === "nitrit" ? 2.4 : skala)));
            if (ind[s] > 0 && n < 1) n = 1;
            nye(s, n, s === "nitrit" ? 4.5 : 5);
        });
        if (this.d.reagenser) {
            var nn = Math.round((ind.nitrit || 0) * 2.4) + 6;
            nye("sulf", nn, 4.5);
            nye("kob", nn, 5);
        }
        /* Vandmolekylerne ses ikke; et par lyse prikker antyder vandet */
        this.molekyler[noegle] = ud;
        return ud;
    };

    /* Hvad et molekyle er lige nu (fane 2: nitrit bliver til diazonium og azo) */
    P.molType = function (m) {
        var r = this.fane.reag;
        if (m.type === "nitrit") {
            if (!r) return "nitrit";
            var diaz = r.pS > m.u;
            if (diaz && this.fane.frem > m.v) return "azo";
            return diaz ? "diaz" : "nitrit";
        }
        return m.type;
    };

    P.opdaterBoble = function (dt) {
        var L = this.L;
        if (!L) return;
        var id = this.holder || this.fane.bobleKuvette();
        if (!id) { this.fotoner = []; return; }
        var mol = this.molekylerFor(id);
        mol.forEach(function (m) {
            m.x += m.vx * dt; m.y += m.vy * dt;
            if (m.x < -0.55 || m.x > 0.55) m.vx *= -1;
            if (m.y < -0.88 || m.y > 0.88) m.vy *= -1;
            m.vx += NK.r(-0.15, 0.15) * dt; m.vy += NK.r(-0.15, 0.15) * dt;
            m.vx = NK.klamp(m.vx, -0.16, 0.16); m.vy = NK.klamp(m.vy, -0.16, 0.16);
            if (m.glimt > 0) m.glimt -= dt;
        });
        /* Fotoner kun, naar kuvetten er i lyset */
        var lys = this.holder && !this.flyv;
        if (lys) {
            var k = this.fane.kuvette(id);
            var lam = this.fane.lambda;
            var frem = this.fane.frem;
            var bid = M.bidrag(k.indhold, lam, frem);
            var Asum = 0;
            Object.keys(bid).forEach(function (s) { Asum += bid[s]; });
            var Tr = M.transmittans(Asum);
            var antal = dt * 34;
            while (antal > 0) {
                if (Math.random() < antal) {
                    var f = { x: -1.05, y: NK.r(-0.7, 0.7), v: 1.15, slut: 2 };
                    if (Math.random() > Tr) {
                        f.slut = NK.r(-0.5, 0.5);
                        var t = Math.random() * Asum, valgt = null;
                        Object.keys(bid).forEach(function (s) { if (!valgt) { t -= bid[s]; if (t <= 0) valgt = s; } });
                        f.af = valgt;
                    }
                    this.fotoner.push(f);
                }
                antal -= 1;
            }
        }
        var mig = this;
        this.fotoner.forEach(function (f) {
            var foer = f.x;
            f.x += f.v * dt;
            /* Ind taelles, naar fotonens skaebne er afgjort, saa Ud / Ind passer med T */
            if (f.x >= f.slut) {
                f.dod = true;
                mig.ind++;
                var best = null, bd = 1e9;
                mol.forEach(function (m) {
                    var t = mig.molType(m);
                    if (t !== f.af && !(f.af === "azo" && t === "azo")) return;
                    var dd = (m.x - f.x) * (m.x - f.x) + (m.y - f.y) * (m.y - f.y);
                    if (dd < bd) { bd = dd; best = m; }
                });
                if (best) best.glimt = 0.35;
            }
            if (foer < 0.55 && f.x >= 0.55 && !f.dod) { mig.ud++; mig.ind++; }
            if (f.x > 1.1) f.dod = true;
        });
        this.fotoner = this.fotoner.filter(function (f) { return !f.dod; });
    };

    var MOL_FARVE = {
        nitrit: "#4fa3ff", sulf: "#9aa3ad", diaz: "#b07cff", kob: "#4fd18b"
    };

    P.tegnBoble = function (c) {
        var L = this.L, r = L.br, bx = L.bx, by = L.by;
        var id = this.holder || this.fane.bobleKuvette();
        c.save();
        c.beginPath();
        c.arc(bx, by, r, 0, Math.PI * 2);
        c.fillStyle = "#0b0e14";
        c.fill();
        c.clip();
        var lam = this.fane.lambda;
        var lysF = D.LYS[lam];
        if (id) {
            var k = this.fane.kuvette(id);
            var f = M.farve(k.indhold, this.fane.frem);
            /* Kuvettens vaegge og vaesken */
            c.fillStyle = M.rgba(f, 0.45);
            c.fillRect(bx - 0.55 * r, by - r, 1.1 * r, 2 * r);
            c.fillStyle = "rgba(220,235,250,0.22)";
            c.fillRect(bx - 0.62 * r, by - r, 0.07 * r, 2 * r);
            c.fillRect(bx + 0.55 * r, by - r, 0.07 * r, 2 * r);
            /* Molekylerne */
            var mol = this.molekylerFor(id);
            var mig = this;
            mol.forEach(function (m) {
                var t = mig.molType(m);
                if (t === "sulf" && !(mig.fane.reag && mig.fane.reag.sulf)) return;
                if (t === "kob" && !(mig.fane.reag && mig.fane.reag.kob)) return;
                var x = bx + m.x * r, y = by + m.y * r;
                var rr = m.r * Math.max(0.8, r / 120);
                c.beginPath();
                c.arc(x, y, (t === "azo" ? rr * 1.25 : rr), 0, Math.PI * 2);
                if (t === "nitrit" || t === "sulf" || t === "diaz" || t === "kob") {
                    c.lineWidth = 2;
                    c.strokeStyle = MOL_FARVE[t];
                    c.stroke();
                } else {
                    var st = D.STOFFER[t];
                    c.fillStyle = st ? st.prik : "#ffffff";
                    c.fill();
                }
                if (m.glimt > 0) {
                    c.beginPath();
                    c.arc(x, y, rr * 2.2, 0, Math.PI * 2);
                    c.fillStyle = "rgba(255,255,255," + (m.glimt * 1.8).toFixed(2) + ")";
                    c.fill();
                }
            });
            /* Skjul reagensmolekyler, der er brugt: de taelles i molType;
               de overskydende ses som ringe */
        } else {
            c.fillStyle = "#8a93a3";
            c.textAlign = "center";
            c.font = font(14, "600");
            c.fillText("Ingen kuvette i lyset", bx, by + 5);
        }
        /* Fotonerne */
        c.strokeStyle = lysF;
        c.fillStyle = lysF;
        c.lineWidth = 2.2;
        this.fotoner.forEach(function (f) {
            var x = bx + f.x * r, y = by + f.y * r;
            c.globalAlpha = 0.9;
            c.beginPath();
            c.moveTo(x - 12, y);
            c.lineTo(x, y);
            c.stroke();
            c.beginPath();
            c.arc(x, y, 2.4, 0, Math.PI * 2);
            c.fill();
        });
        c.globalAlpha = 1;
        c.restore();
        /* Kanten og teksterne */
        c.save();
        c.beginPath();
        c.arc(bx, by, r, 0, Math.PI * 2);
        c.lineWidth = 3;
        c.strokeStyle = "#6d7686";
        c.stroke();
        c.textAlign = "center";
        c.fillStyle = "#c9d1dc";
        c.font = font(13, "700");
        var navn = id ? this.fane.kuvetteNavn(id) : "";
        c.fillText(navn ? "Zoom: " + navn : "Zoom på kuvetten", bx, by - r - 8);
        if (this.holder && !this.flyv) {
            c.font = font(13, "700");
            c.fillStyle = "#e6eaf0";
            var tekst = "Ind: " + this.ind + "   Ud: " + this.ud;
            var tb = c.measureText(tekst).width + 18;
            c.fillStyle = "rgba(11,14,20,0.88)";
            NK.rundtRekt(c, bx - tb / 2, by + r - 30, tb, 22, 11);
            c.fill();
            c.fillStyle = "#e6eaf0";
            c.fillText(tekst, bx, by + r - 14);
        }
        c.restore();
        this.tegnForklaring(c, id);
    };

    /* Forklaringen til molekylerne ved siden af boblen */
    P.tegnForklaring = function (c, id) {
        if (!id) return;
        var L = this.L, mig = this;
        var k = this.fane.kuvette(id);
        var rk = [];
        var ind = k.indhold || {};
        if (this.d.reagenser) {
            var mol = this.molekylerFor(id);
            var har = {};
            mol.forEach(function (m) { har[mig.molType(m)] = 1; });
            if (har.nitrit) rk.push({ t: "nitrit", navn: "nitrit, NO₂⁻", ring: true });
            if (this.fane.reag.sulf) rk.push({ t: "sulf", navn: "sulfanilamid", ring: true });
            if (har.diaz) rk.push({ t: "diaz", navn: "diazoniumion", ring: true });
            if (this.fane.reag.kob) rk.push({ t: "kob", navn: "koblingsreagens", ring: true });
            if (har.azo) rk.push({ t: "azo", navn: "azofarvestof (rødt)", ring: false });
        } else {
            Object.keys(ind).forEach(function (s) { if (ind[s] > 0) rk.push({ t: s, navn: D.STOFFER[s].langt, ring: false }); });
        }
        if (!rk.length) return;
        var x = L.g + 2, y = L.by + L.br - rk.length * 19 + 4;
        if (L.bx - L.br - L.g < 120) { x = L.bx + L.br + 10; }
        c.save();
        c.font = font(12.5, "600");
        c.textAlign = "left";
        rk.forEach(function (e, i) {
            var yy = y + i * 19;
            c.beginPath();
            c.arc(x + 6, yy - 4, 5, 0, Math.PI * 2);
            if (e.ring) { c.strokeStyle = MOL_FARVE[e.t]; c.lineWidth = 2; c.stroke(); }
            else { c.fillStyle = D.STOFFER[e.t].prik; c.fill(); }
            c.fillStyle = "#c9d1dc";
            c.fillText(e.navn, x + 16, yy);
        });
        c.restore();
    };

    /* ----- Graferne -------------------------------------------------------------------- */
    P.tegnGraf = function (c, R, g) {
        var info = this.fane.grafInfo(g);
        var pad = { v: 50, h: 14, o: 48, n: 40 };
        var px = R.x + pad.v, py = R.y + pad.o, pw = R.b - pad.v - pad.h, ph = R.h - pad.o - pad.n;
        function X(cc) { return px + cc / g.xMaks * pw; }
        function Y(A) { return py + ph - A / g.yMaks * ph; }
        c.save();
        c.fillStyle = "rgba(12,14,20,0.9)";
        NK.rundtRekt(c, R.x, R.y, R.b, R.h, 10);
        c.fill();
        c.strokeStyle = "#3a3f4c";
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = "#e9eef4";
        c.font = font(14, "700");
        c.textAlign = "left";
        c.fillText(g.titel, R.x + 12, R.y + 22);
        /* Forklaringen paa serierne (fane 3) */
        if (g.serier.length > 1) {
            var lx = R.x + R.b - 14;
            c.textAlign = "right";
            c.font = font(12.5, "700");
            for (var si = g.serier.length - 1; si >= 0; si--) {
                var se = g.serier[si];
                var tt = se.lambda + " nm";
                c.fillStyle = se.farve;
                c.fillText(tt, lx, R.y + 22);
                var tw = c.measureText(tt).width;
                c.beginPath(); c.arc(lx - tw - 9, R.y + 17, 4.5, 0, Math.PI * 2); c.fill();
                lx -= tw + 26;
            }
        }
        /* Gitteret */
        var i, v;
        if (g.xFin) {
            c.strokeStyle = "rgba(255,255,255,0.045)";
            for (v = 0; v <= g.xMaks + 1e-9; v += g.xFin) { c.beginPath(); c.moveTo(X(v), py); c.lineTo(X(v), py + ph); c.stroke(); }
            c.strokeStyle = "rgba(255,255,255,0.045)";
            for (v = 0; v <= g.yMaks + 1e-9; v += g.yTrin / 5) { c.beginPath(); c.moveTo(px, Y(v)); c.lineTo(px + pw, Y(v)); c.stroke(); }
        }
        c.strokeStyle = "rgba(255,255,255,0.11)";
        c.fillStyle = "#aab2bf";
        c.font = font(12.5, "600");
        c.textAlign = "center";
        for (i = 0; i * g.xTrin <= g.xMaks + 1e-9; i++) {
            v = i * g.xTrin;
            c.beginPath(); c.moveTo(X(v), py); c.lineTo(X(v), py + ph); c.stroke();
            c.fillText(String(v), X(v), py + ph + 17);
        }
        c.textAlign = "right";
        for (i = 0; i * g.yTrin <= g.yMaks + 1e-9; i++) {
            v = i * g.yTrin;
            c.beginPath(); c.moveTo(px, Y(v)); c.lineTo(px + pw, Y(v)); c.stroke();
            c.fillText(T.dk(v, 1), px - 7, Y(v) + 4);
        }
        c.strokeStyle = "#8a93a3";
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(px, py); c.lineTo(px, py + ph); c.lineTo(px + pw, py + ph); c.stroke();
        c.fillStyle = "#c9d1dc";
        c.font = font(13, "700");
        c.textAlign = "right";
        c.fillText("c / µM", px + pw, py + ph + 34);
        c.textAlign = "left";
        c.fillText("A", R.x + 14, py - 12);

        c.save();
        c.beginPath();
        c.rect(px, py - 2, pw + 2, ph + 4);
        c.clip();
        /* Standardkurverne */
        info.serier.forEach(function (s) {
            if (s.a === null || s.a === undefined) return;
            var xs = s.a > 0 ? Math.min(g.xMaks, g.yMaks / s.a) : g.xMaks;
            c.strokeStyle = s.farve;
            c.globalAlpha = 0.75;
            c.lineWidth = 2;
            c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(xs), Y(s.a * xs)); c.stroke();
            c.globalAlpha = 1;
        });
        /* Proeverne: vandret stiplet linje ved A, og lodret ned til c */
        info.proever.forEach(function (p) {
            c.strokeStyle = p.farve;
            c.lineWidth = 2;
            c.setLineDash([6, 5]);
            var xs = p.cSlut !== undefined ? p.cSlut : g.xMaks;
            c.beginPath(); c.moveTo(X(0), Y(p.A)); c.lineTo(X(xs), Y(p.A)); c.stroke();
            if (p.cSlut !== undefined) {
                c.strokeStyle = "#7ee0a8";
                c.beginPath(); c.moveTo(X(p.cSlut), Y(p.Atop !== undefined ? p.Atop : p.A)); c.lineTo(X(p.cSlut), Y(0)); c.stroke();
            }
            c.setLineDash([]);
            if (p.bidrag) {
                /* Det stablede bidrag ved 427 nm: gult forneden, blaat ovenpaa */
                var bx = X(p.cSlut);
                c.fillStyle = "rgba(255,210,31,0.75)";
                c.fillRect(bx - 7, Y(p.bidrag.gul), 14, Y(0) - Y(p.bidrag.gul));
                c.fillStyle = "rgba(58,123,255,0.9)";
                c.fillRect(bx - 7, Y(p.A), 14, Y(p.bidrag.gul) - Y(p.A));
            }
        });
        /* Elevens forkerte aflaesning */
        if (info.elev) {
            c.strokeStyle = "#ff6b5e";
            c.lineWidth = 2;
            c.setLineDash([3, 4]);
            c.beginPath(); c.moveTo(X(info.elev.c), Y(0)); c.lineTo(X(info.elev.c), Y(info.elev.A)); c.stroke();
            c.setLineDash([]);
            c.beginPath(); c.arc(X(info.elev.c), Y(info.elev.A), 4, 0, Math.PI * 2);
            c.fillStyle = "#ff6b5e"; c.fill();
        }
        /* Punkterne */
        info.serier.forEach(function (s) {
            s.punkter.forEach(function (pt) {
                c.beginPath();
                c.arc(X(pt.c), Y(pt.A), 5, 0, Math.PI * 2);
                c.fillStyle = pt.fejl ? "#ff6b5e" : s.farve;
                c.fill();
                c.lineWidth = 1.5;
                c.strokeStyle = "rgba(10,12,18,0.9)";
                c.stroke();
            });
        });
        c.restore();

        /* Teksterne oven paa. En tekst med moerk bund, saa den kan laeses
           oven paa gitteret. */
        function maerke(tekst, x, y, farve, just) {
            var tb = c.measureText(tekst).width;
            var x0 = just === "right" ? x - tb : x;
            c.fillStyle = "rgba(12,14,20,0.86)";
            c.fillRect(x0 - 4, y - 13, tb + 8, 18);
            c.fillStyle = farve;
            c.textAlign = "left";
            c.fillText(tekst, x0, y);
        }
        /* Ligningerne oeverst til venstre, over linjerne, hvor der er tomt */
        var ln = 0;
        c.font = font(13, "700");
        info.serier.forEach(function (s) {
            if (!s.ligning) return;
            maerke(s.ligning, px + 10, py + 16 + ln * 20, s.farve, "left");
            ln++;
        });
        /* Proeverne: navnet i hoejre side under den stiplede linje (dér er
           der tomt, for kurven ligger over), c ved den lodrette linje forneden */
        info.proever.forEach(function (p) {
            c.font = font(12.5, "700");
            var y0 = Y(p.A) + 17 + (p.forskyd || 0);
            maerke(p.navn + ": A = " + T.A(p.A), px + pw - 6, y0, p.farve, "right");
            if (p.cSlut !== undefined && p.cTekst) {
                c.font = font(13, "800");
                var cx = X(p.cSlut) + (p.bidrag ? 14 : 6);
                var hoejre = cx + c.measureText(p.cTekst).width > px + pw - 4;
                maerke(p.cTekst, hoejre ? X(p.cSlut) - 6 : cx, py + ph - 8, "#7ee0a8", hoejre ? "right" : "left");
            }
            if (p.bidrag) {
                c.font = font(12.5, "700");
                var bx = X(p.cSlut) + 14;
                var yb = Y(p.A) + 4;
                var yg = Math.min(Y(p.bidrag.gul / 2) + 4, py + ph - 28);
                if (yg - yb < 16) yb = yg - 16;
                maerke("blå " + T.A(p.A - p.bidrag.gul), bx, yb, "#8fb3ff", "left");
                maerke("gul " + T.A(p.bidrag.gul), bx, yg, "#ffe17a", "left");
            }
        });
        if (info.elev) {
            c.font = font(12.5, "700");
            c.fillStyle = "#ff8a7d";
            c.textAlign = "left";
            c.fillText("dit tal", X(info.elev.c) + 6, Y(info.elev.A) - 8);
        }
        if (info.tom) {
            c.fillStyle = "#7e8590";
            c.font = font(13, "600");
            c.textAlign = "center";
            c.fillText(info.tom, px + pw / 2, py + ph / 2);
        }
        c.restore();
    };

    /* ----- Pilene og det, der traekkes ------------------------------------------------- */
    P.tegnPile = function (c) {
        if (this.traek && this.traek.flyttet) return;
        var peg = this.fane.peg();
        if (!peg.length) return;
        var mig = this, L = this.L;
        var bob = Math.sin(this.tid * 5) * 4;
        /* Kun én pil ad gangen, ellers bliver det rodet */
        var id = peg[0];
        var t = this.ting(id);
        if (!t || t.id === this.holder) return;
        var r = this.tingRekt(t);
        var x = r.x + r.b / 2, y = r.y - 24 + bob;
        c.save();
        c.fillStyle = "#f2c53d";
        c.beginPath();
        c.moveTo(x, y + 10);
        c.lineTo(x - 8, y - 4);
        c.lineTo(x + 8, y - 4);
        c.closePath();
        c.fill();
        c.restore();
        void mig; void L;
    };

    P.tegnTraek = function (c) {
        var t = this.traek;
        if (!t || !t.flyttet) return;
        var L = this.L;
        if (t.slags === "kuvette" || t.slags === "holder") {
            this.tegnKuvette(c, t.id, t.x, t.y + 40 * L.ks, L.ks);
        } else if (t.slags === "flaske") {
            var r = this.tingRekt(this.ting("flaske"));
            this.tegnFlaske(c, t.x, t.y + 60 * r.sk, r.sk);
        } else if (t.slags === "reagens") {
            var tt = this.ting(t.id);
            var rr = this.tingRekt(tt);
            this.tegnReagens(c, tt, t.x, t.y + 50 * rr.sk, rr.sk);
        }
    };

    NK.Scene = Scene;
}());
