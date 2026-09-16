/* =====================================================================
   rum.js - laboratoriet som flere rum, man gaar imellem

   Et laboratorium er en raekke rum. Hvert rum er et bord (NK.Bord) med
   sin egen opstilling, og alle rum deler ét laerred: kun det rum, man
   staar i, tegnes og tager imod musen. De andre rum gaar stille videre
   (varmeplader, reaktioner, termometre), saa et glas, man har sat paa
   pladen i det ene rum, koger, mens man er i det andet.

   Man gaar med pilene i siderne af scenen eller med piletasterne. Det,
   man baerer i haanden, kommer med. En luge (udstyr "luge") er et
   gennemraekningsskab: det, der staar i den, sendes til lugen i det
   andet rum med et klik paa knappen.

   Plan:
     new NK.Rum(canvas, {
         start: "bord",
         rum: [
             { navn: "forrum", titel: "Forrummet", valg: {...}, opstilling: [...] },
             { navn: "bord",   titel: "Prøvebordet", valg: {...}, opstilling: [...] },
             ...
         ]
     })
   Rummene ligger paa raekke i listens orden (venstre-hoejre), medmindre
   et rum selv siger { venstre: navn, hoejre: navn }. En luge i
   opstillingen skriver, hvor den foerer hen: { type: "luge", til: "bord" }.
   Alle rum bruger samme bredde og hoejde.

   Hooks, som siden saetter (kaldes for det aktive rum):
     vedBesked, vedAendring, vedHaendelse   som paa NK.Bord
     vedSkift(rum, forrige)                 man er kommet ind i et rum
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.Tegning;

    var PIL_Y = 200;      /* pilenes hoejde paa vaeggen */
    var PIL_R = 30;       /* traefning */
    var SKIFT_TID = 0.55; /* sekunder for at glide til naborummet */

    function glat(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    NK.Rum = function (canvas, plan) {
        var mig = this;
        this.canvas = canvas;
        this.plan = plan;
        this.rum = [];
        this.ved = {};
        this.skift = null;
        this.pilAlfa = 0;
        this.tid = 0;
        this.vedBesked = null;
        this.vedAendring = null;
        this.vedHaendelse = null;
        this.vedSkift = null;

        plan.rum.forEach(function (spec, i) {
            var bord = new NK.Bord(canvas, spec.valg || {});
            bord.byg(spec.opstilling || []);
            var r = { navn: spec.navn, titel: spec.titel || spec.navn, spec: spec, bord: bord, i: i };
            bord.rum = r;
            mig.rum.push(r);
            mig.ved[spec.navn] = r;
            bord.vedBesked = function (t, s) { if (mig.nu === r && mig.vedBesked) mig.vedBesked(t, s); };
            bord.vedAendring = function (grund) { if (mig.vedAendring) mig.vedAendring(grund, r); };
            bord.vedHaendelse = function (type, data) { if (mig.vedHaendelse) mig.vedHaendelse(type, data, r); };
            bord.vedLuge = function (luge) { return mig.send(luge); };
        });
        this.rum.forEach(function (r, i) {
            var s = r.spec;
            r.venstre = s.venstre ? mig.ved[s.venstre] : (i > 0 ? mig.rum[i - 1] : null);
            r.hoejre = s.hoejre ? mig.ved[s.hoejre] : (i < mig.rum.length - 1 ? mig.rum[i + 1] : null);
        });
        this.nu = this.ved[plan.start] || this.rum[0];
        this.nu.bord.saetScene();
    };

    var P = NK.Rum.prototype;

    P.aktiv = function () { return this.nu.bord; };
    P.find = function (navn) { return this.ved[navn] || null; };
    P.alle = function () { return this.rum.map(function (r) { return r.bord; }); };

    /* ----- At gaa ------------------------------------------------------------ */
    P.nabo = function (retning) {
        return retning === "venstre" ? this.nu.venstre : this.nu.hoejre;
    };

    P.gaa = function (retning) {
        var til = this.nabo(retning);
        if (!til || this.skift) return false;
        return this.gaaTil(til, retning === "venstre" ? -1 : 1);
    };

    /* Skifter rum. d: -1 (rummet ligger til venstre), 1 (til hoejre), 0 (spring) */
    P.gaaTil = function (til, d) {
        if (typeof til === "string") til = this.ved[til];
        if (!til || til === this.nu || this.skift) return false;
        var fra = this.nu, b = fra.bord;
        if (b.laererOptaget && b.laererOptaget()) { b.besked("Vent, til Kemichael er færdig."); return false; }
        if (b.koer.optaget()) return false;

        /* Det, man har i haanden, kommer med */
        var baerer = b.baerer, holdt = b.holdt;
        if (baerer) {
            b.haeldning = null;
            b.straale = null;
            b.slipMaal = null;
            var med = b.tagUd(baerer);
            med.forEach(function (x) { til.bord.tagImod(x); });
            til.bord.baerer = baerer;
            til.bord.holdt = holdt ? { navn: baerer.navn, start: holdt.start, dx: holdt.dx, dy: holdt.dy, flyttet: true, sidst: holdt.sidst, t: holdt.t } : null;
            til.bord.valgt = baerer.kan.holder ? baerer.navn : null;
        }
        b.hover = null;
        this.nu = til;
        til.bord.saetScene();
        if (d) {
            this.skift = { fra: fra, til: til, t: 0, d: d };
            fra.bord.forskyd = 0;
            til.bord.forskyd = d * NK.Scene.BREDDE;
        }
        this.pilAlfa = 0;
        if (NK.Lyd && NK.Lyd.klik) NK.Lyd.klik();
        this.opdaterSus();
        if (this.vedSkift) this.vedSkift(til, fra);
        if (this.vedAendring) this.vedAendring("rum", til);
        return true;
    };

    /* Udsugningen suser, mens man staar i et rum med stinkskab
       (stinkskab.lyd: false slaar det fra) */
    P.opdaterSus = function () {
        if (!NK.Lyd || !NK.Lyd.udsugning) return;
        var sk = this.nu.bord.stinkskab;
        NK.Lyd.udsugning(!!(sk && sk.lyd !== false && sk.taendt !== false));
    };

    /* ----- Lugen ------------------------------------------------------------- */
    P.lugeModsat = function (luge) {
        var tilNavn = luge.spec && luge.spec.til;
        var til = tilNavn ? this.ved[tilNavn] : null;
        if (!til) return null;
        var fraNavn = null;
        this.rum.forEach(function (r) { if (r.bord.g[luge.navn] === luge) fraNavn = r.navn; });
        var modsat = null;
        til.bord.liste.forEach(function (x) {
            if (x.kan.luge && x.spec && x.spec.til === fraNavn && !modsat) modsat = x;
        });
        return modsat ? { rum: til, luge: modsat } : null;
    };

    /* Sender det, der staar i lugen, til lugen i det andet rum */
    P.send = function (luge) {
        var mig = this, b = this.nu.bord;
        var ind = b.paaLuge(luge);
        if (!ind.length) { b.besked("Der står ikke noget i lugen."); return false; }
        var m = this.lugeModsat(luge);
        if (!m) { b.besked("Lugen fører ingen steder hen."); return false; }
        var t = m.luge.type, p0 = m.luge.p.x - m.luge.anker.x;
        var x0 = p0 + t.plade.x0, x1 = p0 + t.plade.x1;
        ind.forEach(function (gg, i) {
            var med = b.tagUd(gg);
            med.forEach(function (x) { m.rum.bord.tagImod(x); });
            var cx = ind.length === 1 ? (x0 + x1) / 2 : NK.lerp(x0 + gg.type.b / 2, x1 - gg.type.b / 2, i / (ind.length - 1));
            m.rum.bord.paaPlade(gg, m.luge, cx, true);
            /* Termometeret bliver siddende i glasset */
            med.forEach(function (x) { if (x !== gg && x.rel) { x.i = gg; x.p.x = gg.p.x + x.rel.dx; x.p.y = gg.p.y + x.rel.dy; } });
        });
        luge.lys = 1;
        m.luge.lys = 1;
        if (NK.Lyd && NK.Lyd.kontakt) NK.Lyd.kontakt();
        b.besked(ind.length === 1 ? ind[0].titel.charAt(0).toUpperCase() + ind[0].titel.slice(1) + " er sendt til " + m.rum.titel.toLowerCase() + "." : ind.length + " ting er sendt til " + m.rum.titel.toLowerCase() + ".");
        b.haendelse("luge", { fra: this.nu, til: m.rum, ting: ind });
        b.aendret("luge");
        return true;
    };

    /* ----- Tid og tegning ---------------------------------------------------- */
    P.opdater = function (dt) {
        var mig = this;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        this.rum.forEach(function (r) {
            if (r === mig.nu) r.bord.opdater(dt);
            else r.bord.opdaterStille(dt);
            r.bord.liste.forEach(function (gg) { if (gg.lys > 0) gg.lys = Math.max(0, gg.lys - dt * 0.6); });
        });
        var sk = this.skift;
        if (sk) {
            sk.t += dt;
            var e = glat(Math.min(1, sk.t / SKIFT_TID)), B = NK.Scene.BREDDE;
            sk.fra.bord.forskyd = -sk.d * B * e;
            sk.til.bord.forskyd = sk.d * B * (1 - e);
            if (sk.t >= SKIFT_TID) {
                sk.fra.bord.forskyd = 0;
                sk.til.bord.forskyd = 0;
                this.skift = null;
            }
        }
        var vis = !this.skift && !this.nu.bord.baerer;
        this.pilAlfa = NK.mod(this.pilAlfa, vis ? 1 : (this.skift ? 0 : 0.45), 4, dt);
    };

    P.tilpas = function () { return this.nu.bord.tilpas(); };

    P.tegn = function () {
        var sk = this.skift;
        if (sk) {
            sk.fra.bord.tegn();
            sk.til.bord.tegn(true);
        } else this.nu.bord.tegn();
        this.tegnPile();
    };

    P.tegnPile = function () {
        if (this.pilAlfa < 0.01) return;
        var L = this.nu.bord.laerred, ctx = L.ctx, S = NK.Scene;
        var sk = S.skala(L.b, L.h);
        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);
        if (this.nu.venstre) T.tegnRumpil(ctx, "venstre", PIL_Y, this.nu.venstre.titel, this.pilAlfa * (this.hoverPil === "venstre" ? 1 : 0.8), this.tid);
        if (this.nu.hoejre) T.tegnRumpil(ctx, "hoejre", PIL_Y, this.nu.hoejre.titel, this.pilAlfa * (this.hoverPil === "hoejre" ? 1 : 0.8), this.tid);
        ctx.restore();
    };

    P.tegnBoble = function (ctx, cx, cy) { return this.nu.bord.tegnBoble(ctx, cx, cy); };

    /* ----- Mus og tastatur ---------------------------------------------------- */
    P.pilVed = function (pt) {
        var S = NK.Scene;
        if (this.nu.venstre && Math.hypot(pt.x - 40, pt.y - PIL_Y) < PIL_R) return "venstre";
        if (this.nu.hoejre && Math.hypot(pt.x - (S.BREDDE - 40), pt.y - PIL_Y) < PIL_R) return "hoejre";
        return null;
    };

    P.bindMus = function () {
        var mig = this, c = this.canvas;
        c.addEventListener("pointerdown", function (ev) {
            if (ev.button !== undefined && ev.button !== 0) return;
            if (mig.skift) return;
            var b = mig.nu.bord, pt = b.tilBord(ev);
            var pil = mig.pilVed(pt);
            if (pil && !b.holdt) { mig.gaa(pil); ev.preventDefault(); return; }
            if (b.ned(pt)) {
                try { c.setPointerCapture(ev.pointerId); } catch (fejl) {}
                ev.preventDefault();
            }
        });
        c.addEventListener("pointermove", function (ev) {
            var b = mig.nu.bord, pt = b.tilBord(ev);
            if (mig.skift) return;
            b.flyt(pt, ev.timeStamp || Date.now());
            mig.hoverPil = b.holdt ? null : mig.pilVed(pt);
            var hv = b.hover;
            var greb = hv && b.grebbar(hv);
            c.style.cursor = b.holdt ? "grabbing" : (mig.hoverPil ? "pointer" : (greb ? "grab" : (hv ? "pointer" : "default")));
        });
        c.addEventListener("pointerup", function () { mig.nu.bord.op(); });
        c.addEventListener("pointercancel", function () { mig.nu.bord.op(); });
        c.addEventListener("pointerleave", function () { var b = mig.nu.bord; if (!b.holdt) b.hover = null; mig.hoverPil = null; });
        c.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    };

    /* Piletasterne. Returnerer true, hvis tasten blev brugt. */
    P.tast = function (e) {
        if (e.key === "ArrowLeft") { this.gaa("venstre"); return true; }
        if (e.key === "ArrowRight") { this.gaa("hoejre"); return true; }
        return false;
    };

    /* ----- Start forfra ---------------------------------------------------------- */
    P.nulstil = function () {
        var mig = this;
        this.skift = null;
        this.rum.forEach(function (r) {
            r.bord.holdt = null;
            r.bord.baerer = null;
            r.bord.forskyd = 0;
            r.bord.nulstil();
        });
        var start = this.ved[this.plan.start] || this.rum[0];
        var forrige = this.nu;
        this.nu = start;
        start.bord.saetScene();
        this.opdaterSus();
        if (forrige !== start && this.vedSkift) this.vedSkift(start, forrige);
    };

    /* Alle uheld i alle rum */
    P.antalUheld = function () {
        return this.rum.reduce(function (n, r) { return n + r.bord.antalUheld; }, 0);
    };
}());
