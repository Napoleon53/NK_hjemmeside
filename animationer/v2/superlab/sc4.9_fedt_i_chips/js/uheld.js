/* =====================================================================
   uheld.js - to paaskeaeg, der skal ryddes op efter

   Petriskaalen:  knuses der ekstremt voldsomt med musen (KNUS.skaalFart i
                  KNUS.skaalTid sekunder), glider pistillen ud af haanden og
                  knuser petriskaalen ved siden af morteren. Eleven fejer
                  skaarene op og toemmer fejebladet i glasaffaldet. Saa kommer
                  en ny petriskaal, og forsoeget fortsaetter.
   Heptanflasken: holdes flasken i mere end TAB.heptanTid sekunder, glider
                  den ud af haanden og knuses paa gulvet. Laereren rydder op
                  (laererHeptan i laerer.js) og stiller en ny flaske frem.

   Branden, som oedelaegger forsoeget, staar i laerer.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var r = NK.r;
    var P = NK.Forsoeg.prototype;

    var OPRYDNING_TRIN = {
        fej: { id: "fej", tekst: "Fej skårene op", mark: "kost",
            hint: "Tag fat i kosten, og fej skårene over i fejebladet. Du kan også klikke på kosten." },
        aflever: { id: "aflever", tekst: "Tøm fejebladet i glasaffaldet", mark: "glasaffald",
            hint: "Klik på fejebladet eller på kassen med glasaffald." }
    };
    NK.OPRYDNING_TRIN = OPRYDNING_TRIN;

    var UDE = { x: -140, y: 360, v: -0.3 };
    var AFFALD = { x: 250, y: 514, v: 0 };
    var GULV = S.GULV + 12;

    /* Heptanflaskens yderpunkter: rammer et af dem gulvet, knuses den */
    var FLASKE = [[3, 40], [43, 40], [3, 119], [43, 119], [16, 4], [30, 4]];

    function skaarForm(rad) {
        var n = Math.random() < 0.5 ? 3 : 4, pts = [];
        for (var j = 0; j < n; j++) {
            var vv = j / n * Math.PI * 2 + r(-0.4, 0.4), rr = rad * r(0.5, 1);
            pts.push({ x: Math.cos(vv) * rr, y: Math.sin(vv) * rr });
        }
        return pts;
    }

    function opdaterSkaar(liste, dt, gulv, x0, x1) {
        for (var i = 0; i < liste.length; i++) {
            var s = liste[i];
            if (s.fejet || s.hvile) continue;
            s.vy += 1300 * dt;
            s.x = NK.klamp(s.x + s.vx * dt, x0, x1);
            s.y += s.vy * dt;
            s.a += s.va * dt;
            if (s.y > gulv) {
                s.y = gulv;
                if (Math.abs(s.vy) > 90) { s.vy = -s.vy * 0.3; s.vx *= 0.6; s.va *= 0.5; }
                else {
                    s.vy = 0;
                    s.vx *= Math.max(0, 1 - 8 * dt);
                    s.va *= Math.max(0, 1 - 10 * dt);
                    if (Math.abs(s.vx) < 5 && Math.abs(s.va) < 0.4) s.hvile = true;
                }
            }
        }
    }

    function iFejeblad(s) {
        s.fejet = true;
        s.panX = r(24, 74);
        s.panY = r(32, 46);
    }

    /* ================================================================
       PETRISKAALEN KNUSES
       ================================================================ */
    P.oprydningTrin = function () {
        var o = this.oprydning;
        return o ? (OPRYDNING_TRIN[o.trin] || null) : null;
    };

    P.oprydningListe = function () {
        var o = this.oprydning;
        if (!o) return [];
        var nr = o.trinene.indexOf(o.trin);
        return o.trinene.map(function (id, i) {
            return { id: id, tekst: OPRYDNING_TRIN[id].tekst, gjort: nr >= 0 && i < nr };
        });
    };

    P.knusSkaal = function () {
        var s = this.g.skaal, pi = this.g.pistil;
        if (this.oprydning || this.uheld || s.sted !== "hjem") return false;
        this.stopArbejde();
        this.holdt = null;
        this.amokTid = 0;
        this.skaalTid = 0;
        this.antalSkaalKnust++;
        var o = this.oprydning = {
            trin: "falder", trinene: ["fej", "aflever"], x: s.hjem.x,
            skaar: [], faldSkaar: [], redskaber: {}, traek: null, fejUr: 0
        };
        this.handling = null;
        this.koer([
            { flyt: pi, til: { x: s.p.x + 14, y: s.p.y - 16, v: -2.4 }, tid: 0.42, loeft: 110 },
            { kald: function () { this.skaalSplintres(); } },
            { flyt: pi, til: { x: s.p.x - 42, y: S.BORD - 1, v: -Math.PI / 2 }, tid: 0.4, loeft: 22 },
            { tid: 0.3 },
            { kald: function () { o.trin = "fej"; this.visRedskaber(); this.aendret("oprydning"); } }
        ], "uheldSkaal");
        this.besked("Pistillen gled ud af hånden!", "advarsel");
        this.aendret("oprydning");
        return true;
    };

    P.skaalSplintres = function () {
        var o = this.oprydning, s = this.g.skaal;
        s.sted = "knust";
        for (var i = 0; i < 22; i++) {
            var lx = r(-36, 36);
            o.skaar.push({
                x: s.p.x + lx, y: S.BORD - 8, a: r(0, 6), va: r(-12, 12),
                vx: lx * r(1.5, 3) + r(-60, 60), vy: -r(80, 260),
                pts: skaarForm(r(3, 8)), alfa: 1, hvile: false, fejet: false
            });
        }
        this.ryk = 10;
        if (NK.Lyd) NK.Lyd.glas();
        this.besked("Petriskålen er knust. Ryd op, før du går videre.", "advarsel");
    };

    /* Redskaberne kommer ind fra venstre */
    P.visRedskaber = function () {
        var o = this.oprydning, liste = [];
        function ind(navn, hjem) {
            var gg = { navn: navn, sprite: navn, anker: S.ANKER[navn], hjem: hjem, p: { x: UDE.x, y: hjem.y - 140, v: 0.3 } };
            o.redskaber[navn] = gg;
            liste.push({ flyt: gg, til: hjem, tid: 0.55, loeft: 30 });
        }
        if (o.trin === "fej") {
            ind("fejeblad", { x: o.x + 64, y: S.BORD - 2, v: 0 });
            ind("kost", { x: o.x - 10, y: 340, v: 0 });
        }
        if (o.trin === "aflever") ind("glasaffald", AFFALD);
        if (liste.length) this.koerEfter(liste, "redskab");
    };

    P.naesteOprydningTrin = function () {
        var o = this.oprydning, ud = [];
        if (o.trin === "fej" && o.redskaber.kost) {
            var k = o.redskaber.kost;
            ud.push({ flyt: k, til: UDE, tid: 0.8, loeft: 20 });
            ud.push({ kald: function () { delete o.redskaber.kost; } });
        }
        o.trin = o.trinene[o.trinene.indexOf(o.trin) + 1];
        if (ud.length) this.koerEfter(ud, "redskab");
        this.visRedskaber();
        this.aendret("oprydningstrin");
    };

    /* ----- Klik og traek under oprydningen -------------------------------- */
    P.overOprydning = function (pt) {
        var o = this.oprydning;
        if (!o) return null;
        var navne = ["kost", "glasaffald", "fejeblad"];
        for (var i = 0; i < navne.length; i++) {
            var gg = o.redskaber[navne[i]];
            if (gg && S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, 8)) return navne[i];
        }
        return null;
    };

    P.klikOprydning = function (navn) {
        var o = this.oprydning;
        if (!o || o.trin === "falder" || this.handling) return false;
        if (o.trin === "fej" && (navn === "kost" || navn === "fejeblad")) { this.autoFej(); return true; }
        if (o.trin === "aflever" && (navn === "fejeblad" || navn === "glasaffald")) { this.aflevOprydning(); return true; }
        var t = this.oprydningTrin();
        this.besked("Ryd op først.");
        if (t) this.markér(t.mark, 3);
        return false;
    };

    P.nedOprydning = function (pt) {
        var o = this.oprydning;
        if (!o || o.trin !== "fej" || this.handling) return false;
        if (this.overOprydning(pt) !== "kost") return false;
        var k = o.redskaber.kost;
        o.traek = { dx: pt.x - k.p.x, dy: pt.y - k.p.y, start: pt, flyttet: false };
        return true;
    };

    P.flytOprydning = function (pt) {
        var o = this.oprydning;
        if (!o || !o.traek) return false;
        var t = o.traek, k = o.redskaber.kost;
        if (!k) { o.traek = null; return false; }
        if (!t.flyttet && Math.abs(pt.x - t.start.x) + Math.abs(pt.y - t.start.y) < 6) return true;
        t.flyttet = true;
        var nx = NK.klamp(pt.x - t.dx, 40, 960);
        var ny = NK.klamp(pt.y - t.dy, 150, S.BORD);
        var dx = nx - k.p.x;
        k.p.x = nx;
        k.p.y = ny;
        k.p.v = 0;
        this.fejMed(k, dx);
        return true;
    };

    P.opOprydning = function () {
        var o = this.oprydning;
        if (!o || !o.traek) return false;
        var t = o.traek;
        o.traek = null;
        if (!t.flyttet) this.klikOprydning("kost");
        return true;
    };

    P.fejMed = function (kost, dx) {
        var o = this.oprydning, fb = o.redskaber.fejeblad;
        if (!fb || kost.p.y < S.BORD - 22) return;
        var ramt = false;
        o.skaar.forEach(function (s) {
            if (s.fejet || !s.hvile) return;
            if (Math.abs(s.x - kost.p.x) < 42) {
                if (dx > 0) s.x += dx;
                ramt = true;
                if (s.x >= fb.p.x - 10) iFejeblad(s);
            }
        });
        if (ramt && Math.abs(dx) > 1 && o.fejUr <= 0) {
            if (NK.Lyd) NK.Lyd.fej();
            o.fejUr = 0.12;
        }
    };

    P.autoFej = function () {
        var o = this.oprydning, kost = o.redskaber.kost, fb = o.redskaber.fejeblad;
        if (!kost || !fb) return;
        var min = Infinity;
        o.skaar.forEach(function (s) { if (!s.fejet) min = Math.min(min, s.x); });
        if (!isFinite(min)) min = fb.p.x - 100;
        var fra = { x: Math.max(60, min - 50), y: S.BORD, v: 0 };
        function stroeg(tid) {
            return { tid: tid, hver: function (t) {
                var x = NK.lerp(fra.x, fb.p.x + 8, NK.blod(t));
                var dx = x - kost.p.x;
                kost.p.x = x;
                kost.p.y = S.BORD;
                kost.p.v = 0;
                this.fejMed(kost, dx);
            } };
        }
        this.koer([
            { flyt: kost, til: fra, tid: 0.6, loeft: 30 },
            stroeg(1.4),
            { flyt: kost, til: fra, tid: 0.5, loeft: 20 },
            stroeg(1.2),
            { kald: function () { o.skaar.forEach(function (s) { if (!s.fejet) iFejeblad(s); }); } }
        ], "oprydning");
    };

    P.aflevOprydning = function () {
        var o = this.oprydning, fb = o.redskaber.fejeblad, d = o.redskaber.glasaffald;
        if (!fb || !d) return;
        this.koer([
            { flyt: fb, til: { x: d.p.x - 30, y: d.p.y - 34, v: 0 }, tid: 0.9, loeft: 60 },
            { flyt: fb, til: { x: d.p.x - 24, y: d.p.y - 30, v: 0.95 }, tid: 0.45, loeft: 0 },
            { kald: function () {
                o.skaar.forEach(function (s) {
                    if (!s.fejet) return;
                    var w = NK.tilVerden(fb.p, fb.anker, s.panX, s.panY);
                    o.faldSkaar.push({ x: w.x, y: w.y, a: s.a, pts: s.pts, vx: r(-10, 40), vy: r(-40, 20), alfa: 1 });
                });
                o.skaar = [];
                if (NK.Lyd) NK.Lyd.glas();
            } },
            { tid: 0.6 },
            { flyt: fb, til: UDE, tid: 0.8, loeft: 20 },
            { flyt: d, til: { x: UDE.x, y: d.p.y, v: 0 }, tid: 0.8, loeft: 30 },
            { kald: function () {
                delete o.redskaber.fejeblad;
                delete o.redskaber.glasaffald;
                this.nySkaal();
            } }
        ], "oprydning");
    };

    P.nySkaal = function () {
        var s = this.g.skaal, pi = this.g.pistil;
        var antal = this.antalSkaalKnust;
        this.oprydning = null;
        this.skaalMasse = M.afrund(r(M.SKAAL.min, M.SKAAL.max), 2);
        s.sted = "hjem";
        s.fyld = 0;
        s.fedt = 0;
        s.salt = 0;
        s.sod = 0;
        s.farve = null;
        s.p = { x: s.hjem.x, y: s.hjem.y - 260, v: 0 };
        this.koerEfter([
            { flyt: s, til: s.hjem, tid: 0.8, loeft: 0 },
            { flyt: pi, til: pi.hjem, tid: 0.6, loeft: 40 },
            { kald: function () {
                this.besked("Ny petriskål. Knus lidt mere forsigtigt.");
                if (antal >= 2 && this.laererSkaal) this.laererSkaal(antal);
                this.aendret("nySkaal");
            } }
        ], "nySkaal");
        this.aendret("nySkaal");
    };

    P.opdaterOprydning = function (dt) {
        var o = this.oprydning;
        if (!o) return;
        o.fejUr -= dt;
        opdaterSkaar(o.skaar, dt, S.BORD - 2, o.x - 55, o.x + 55);
        for (var i = o.faldSkaar.length - 1; i >= 0; i--) {
            var s = o.faldSkaar[i];
            s.vy += 1300 * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.a += 6 * dt;
            if (s.y > AFFALD.y + 16) o.faldSkaar.splice(i, 1);
        }
        if (!this.handling && o.trin === "fej" && o.skaar.length && o.skaar.every(function (q) { return q.fejet; })) {
            this.naesteOprydningTrin();
        }
    };

    /* lag: "bord" (skaar paa bordet), "redskaber" (fejeblad og kost),
       "top" (skaar i luften og glasaffaldet) */
    P.tegnOprydning = function (ctx, lag, tid) {
        var o = this.oprydning;
        if (!o) return;
        if (lag === "bord") {
            S.tegnSkaar(ctx, o.skaar.filter(function (s) { return !s.fejet && s.hvile; }));
        } else if (lag === "redskaber") {
            var fb = o.redskaber.fejeblad;
            if (fb) {
                NK.Sprites.tegnPositur(ctx, "fejeblad", fb.p, fb.anker);
                var iBladet = [];
                o.skaar.forEach(function (s) {
                    if (!s.fejet) return;
                    var w = NK.tilVerden(fb.p, fb.anker, s.panX, s.panY);
                    iBladet.push({ x: w.x, y: w.y, a: s.a, pts: s.pts, alfa: 1 });
                });
                S.tegnSkaar(ctx, iBladet);
                if (this.markeret("fejeblad")) S.tegnMarkering(ctx, S.rekt("fejeblad", fb.p, fb.anker, 0), tid);
            }
            var k = o.redskaber.kost;
            if (k) {
                var p = k.p;
                var svaever = !this.handling && !o.traek && Math.abs(p.x - k.hjem.x) + Math.abs(p.y - k.hjem.y) < 1;
                if (svaever) p = { x: p.x, y: p.y + Math.sin(tid * 2.6) * 3, v: p.v };
                NK.Sprites.tegnPositur(ctx, "kost", p, k.anker);
                if (this.markeret("kost")) S.tegnMarkering(ctx, S.rekt("kost", k.p, k.anker, 0), tid);
            }
        } else {
            S.tegnSkaar(ctx, o.skaar.filter(function (s) { return !s.fejet && !s.hvile; }));
            S.tegnSkaar(ctx, o.faldSkaar);
            var d = o.redskaber.glasaffald;
            if (d) {
                NK.Sprites.tegnPositur(ctx, "glasaffald", d.p, d.anker);
                if (this.markeret("glasaffald")) S.tegnMarkering(ctx, S.rekt("glasaffald", d.p, d.anker, 0), tid);
            }
        }
    };

    /* ================================================================
       HEPTANFLASKEN TABES
       ================================================================ */
    P.tabHeptan = function () {
        var fl = this.g.heptan;
        if (this.heptanSpild || fl.skjult) return false;
        this.holdt = null;
        fl.traekkes = false;
        this.traekMaal = null;
        this.antalHeptanTab++;
        this.heptanSpild = { fase: "falder", vx: r(-40, 40), vy: -80, va: (Math.random() < 0.5 ? -1 : 1) * r(3, 5), skaar: [], pyt: null, x: fl.p.x, dampUr: 0 };
        if (NK.Lyd) NK.Lyd.klik();
        this.besked("Flasken gled ud af hånden!", "advarsel");
        this.aendret("heptanTab");
        return true;
    };

    P.heptanSplintres = function (lav) {
        var sp = this.heptanSpild, fl = this.g.heptan;
        fl.p.y -= lav - GULV;
        var midt = NK.tilVerden(fl.p, fl.anker, 23, 80);
        sp.x = NK.klamp(midt.x, 60, 940);
        sp.fase = "ligger";
        for (var i = 0; i < 24; i++) {
            var w = NK.tilVerden(fl.p, fl.anker, r(4, 42), r(8, 118));
            sp.skaar.push({
                x: w.x, y: Math.min(w.y, GULV - 2), a: r(0, 6), va: r(-12, 12),
                vx: (w.x - midt.x) * r(1, 2.5) + r(-120, 120), vy: -r(60, 240),
                pts: skaarForm(r(3, 9)), alfa: 1, hvile: false
            });
        }
        fl.skjult = true;
        sp.pyt = { x: sp.x, rx: 12, rxMaal: 80, vaad: 1 };
        this.ryk = 9;
        if (NK.Lyd) { NK.Lyd.glas(); NK.Lyd.plask(); }
        this.besked("Heptan på gulvet!", "advarsel");
        this.aendret("heptanTab");
    };

    P.opdaterHeptanSpild = function (dt) {
        var sp = this.heptanSpild;
        if (!sp) return;
        var fl = this.g.heptan, i;
        if (sp.fase === "falder") {
            sp.vy += 1300 * dt;
            fl.p.x += sp.vx * dt;
            fl.p.y += sp.vy * dt;
            fl.p.v += sp.va * dt;
            var lav = -Infinity;
            for (i = 0; i < FLASKE.length; i++) lav = Math.max(lav, NK.tilVerden(fl.p, fl.anker, FLASKE[i][0], FLASKE[i][1]).y);
            if (lav >= GULV) this.heptanSplintres(lav);
            return;
        }
        opdaterSkaar(sp.skaar, dt, GULV, sp.x - 110, sp.x + 110);
        var pyt = sp.pyt;
        if (pyt) {
            pyt.rx = NK.mod(pyt.rx, pyt.rxMaal, 3, dt);
            sp.dampUr -= dt;
            if (pyt.vaad > 0.1 && sp.dampUr <= 0) {
                sp.dampUr = 0.2;
                this.dampe.push({ x: pyt.x + r(-0.8, 0.8) * pyt.rx, y: GULV - 2, vx: r(-6, 6), vy: r(-34, -16), r: r(6, 11), liv: 0.7 * pyt.vaad });
            }
        }
        if (sp.fase === "ligger" && this.laererHeptan) this.laererHeptan();
    };

    /* Laereren stiller en ny flaske paa plads */
    P.nyHeptan = function () {
        var fl = this.g.heptan;
        var hd = this.laererHaand ? this.laererHaand() : { x: 300, y: 400 };
        fl.skjult = false;
        fl.p = { x: hd.x, y: hd.y - 70, v: 0 };
        this.laagT = 0;
        this.koerEfter([{ flyt: fl, til: fl.hjem, tid: 1.1, loeft: 90 }], "nyFlaske");
    };

    P.tegnHeptanSpild = function (ctx) {
        var sp = this.heptanSpild;
        if (!sp) return;
        S.tegnPyt(ctx, sp.pyt, GULV + 2);
        S.tegnSkaar(ctx, sp.skaar);
    };
}());
