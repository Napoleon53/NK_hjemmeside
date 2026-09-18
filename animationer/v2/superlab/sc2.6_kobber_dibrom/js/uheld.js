/* =====================================================================
   uheld.js - paaskeaegget: kolben tabes og skal ryddes op

   forsoeg.js kalder tab(), naar eleven har rystet meget voldsomt med
   musen (graenserne staar i M.RYST). Kolben flyver ud af haanden, rammer
   bordet og knuses. Det, der var i den, havner paa bordet:
     pyt      bromvand eller opløsning, alt efter hvor langt eleven var
     skaar    glasskaar og kobberspaaner
     dampe    Br2-dampe fra pytten, saa laenge der er brom i den

   Oprydningen er op til fire trin, alt efter hvad der blev spildt:
     neutraliser  sprøjt natriumthiosulfat paa bromvandet
     toer         tør pytten op med køkkenrulle
     fej          fej skaarene over i fejebladet
     aflever      tøm fejebladet i affaldsdunken
   Derefter kommer en ny kolbe, og eleven begynder forfra med kobber og
   bromvand. Udsugningen og resten af opstillingen er uroert.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var r = NK.r;
    var P = NK.Forsoeg.prototype;

    var UHELD_TRIN = {
        neutraliser: { id: "neutraliser", tekst: "Uskadeliggør bromvandet", mark: "spray",
            hint: "Klik på sprayflasken med natriumthiosulfat, og hold øje med pytten." },
        toer: { id: "toer", tekst: "Tør pytten op", mark: "papir",
            hint: "Tag fat i køkkenrullen, og tør pytten op. Du kan også klikke på den." },
        fej: { id: "fej", tekst: "Fej skårene op", mark: "kost",
            hint: "Tag fat i kosten, og fej skårene over i fejebladet. Du kan også klikke på kosten." },
        aflever: { id: "aflever", tekst: "Tøm fejebladet i affaldsdunken", mark: "dunk",
            hint: "Klik på affaldsdunken." }
    };
    NK.UHELD_TRIN = UHELD_TRIN;

    /* Kolbens yderste punkter: rammer et af dem bordet, knuses den */
    var OMRIDS = [[51, 0], [99, 0], [55, 64], [95, 64], [8, 178], [142, 178], [22, 198], [128, 198]];
    var UDE = { x: 1140, y: S.BORD - 250, v: 0.3 };

    P.uheldTrin = function () {
        return this.uheld ? (UHELD_TRIN[this.uheld.trin] || null) : null;
    };

    P.uheldListe = function () {
        var u = this.uheld;
        if (!u) return [];
        var nr = u.trinene.indexOf(u.trin);
        return u.trinene.map(function (id, i) {
            return { id: id, tekst: UHELD_TRIN[id].tekst, gjort: nr >= 0 && i < nr };
        });
    };

    /* Som koer, men venter paa en igangvaerende koreografi. */
    P.koerEfter = function (liste, navn) {
        if (this.handling) this.handling.liste = this.handling.liste.concat(liste);
        else this.koer(liste, navn);
    };

    /* ----- Kolben glider ud af haanden ------------------------------------ */
    P.tab = function () {
        var k = this.g.kolbe;
        var hp = NK.tilVerden(k.p, k.anker, 75, 38);
        var brom = !!(this.gjort.brom && this.visBr > 0.03);
        var vaeske = k.areal > 5;
        var retning = this.musVx < 0 ? -1 : 1;

        this.rystKilde = null;
        this.holdt = null;
        this.farligTid = 0;
        this.uro = 0;
        this.handling = null;
        this.haandAlfa = 0;
        this.ryst = 0;

        this.uheld = {
            trin: "falder",
            falder: true,
            trinene: (vaeske && brom ? ["neutraliser"] : []).concat(vaeske ? ["toer"] : []).concat(["fej", "aflever"]),
            krop: { vx: retning * r(40, 90), vy: -r(220, 300), va: retning * r(3, 6) },
            haand: { p: { x: hp.x, y: hp.y, v: k.p.v }, alfa: 1 },
            brom: brom, vaeske: vaeske, areal: k.areal, kobber: k.kobber > 0.05,
            farve: this.kolbeFarve() || M.FARVE.thiosulfat,
            x: k.p.x, pyt: null, skaar: [], stank: [], taage: [], faldSkaar: [],
            redskaber: {}, traek: null, fejUr: 0, dampUr: 0, propFart: null
        };
        this.musVx = 0;
        this.musFart = 0;
        this.vold = 0;
        this.besked(this.antalUheld ? "Igen! Kolben gled ud af hånden." : "Kolben gled ud af hånden!", "advarsel");
        this.aendret("uheld");
    };

    P.knus = function (lav) {
        var u = this.uheld, k = this.g.kolbe, pr = this.g.prop;
        var i, j;
        k.p.y -= lav - S.BORD;
        u.falder = false;
        var midt = NK.tilVerden(k.p, k.anker, 75, 130);
        u.x = NK.klamp(midt.x, 280, 400);

        for (i = 0; i < 30; i++) {
            var ly = r(4, 196);
            var bred = ly < 64 ? 20 : 20 + (ly - 64) * (47 / 114);
            var w = NK.tilVerden(k.p, k.anker, 75 + r(-bred, bred), ly);
            var n = Math.random() < 0.5 ? 3 : 4, pts = [], rad = r(4, 11);
            for (j = 0; j < n; j++) {
                var vv = j / n * Math.PI * 2 + r(-0.4, 0.4), rr = rad * r(0.5, 1);
                pts.push({ x: Math.cos(vv) * rr, y: Math.sin(vv) * rr });
            }
            u.skaar.push({
                x: w.x, y: Math.min(w.y, S.BORD - 3), a: r(0, 6), va: r(-12, 12),
                vx: (w.x - midt.x) * r(1, 2.5) + r(-80, 80), vy: -r(60, 260),
                pts: pts, alfa: 1, hvile: false, fejet: false
            });
        }
        if (u.kobber) {
            for (i = 0; i < 12; i++) {
                u.skaar.push({ kobber: true, r: r(2.2, 3.6), x: midt.x + r(-20, 20), y: S.BORD - 6, a: r(0, 6), va: r(-10, 10), vx: r(-110, 110), vy: -r(40, 200), alfa: 1, hvile: false, fejet: false });
            }
        }
        if (u.vaeske) {
            u.pyt = { x: u.x, rx: 16, rxMaal: 34 + 56 * NK.klamp(u.areal / S.KOLBE_FULD, 0, 1), farve: u.farve, vaad: 1, neutral: 0, brom: u.brom };
            for (i = 0; i < 26; i++) {
                u.stank.push({ x: midt.x + r(-10, 10), y: S.BORD - 6, vx: r(-220, 220), vy: -r(80, 320), r: r(1.6, 3.2), liv: 1, farve: u.farve });
            }
        }
        if (k.prop) {
            pr.p = this.propIKolbe();
            pr.iKolbe = false;
            k.prop = false;
            u.propFart = { vx: r(-100, 100), vy: -r(260, 380), va: r(-12, 12) };
        }
        k.skjult = true;
        k.areal = 0;
        k.kobber = 0;
        this.mikro.kolbe.nulstil();
        this.ryk = 14;
        this.antalUheld++;
        if (NK.Lyd) { NK.Lyd.glas(); if (u.vaeske) NK.Lyd.plask(); }
        this.besked("Kolben er knust. Ryd op, før du går videre.", "advarsel");
        if (this.laererKnust) this.laererKnust();
        u.trin = u.trinene[0];
        this.visRedskaber();
        this.aendret("knust");
    };

    /* ----- Redskaberne kommer ind fra hoejre ------------------------------- */
    P.visRedskaber = function () {
        var u = this.uheld;
        var liste = [];
        function ind(navn, hjem) {
            var gg = { navn: navn, sprite: navn, anker: S.ANKER[navn], hjem: hjem, p: { x: UDE.x, y: hjem.y - 140, v: 0.3 } };
            u.redskaber[navn] = gg;
            liste.push({ flyt: gg, til: hjem, tid: 0.9, loeft: 30 });
        }
        /* Redskaberne svaever over pladsen, hvor kolben stod, saa de ikke
           daekker for resten af opstillingen. Skaarene ligger hoejst 130
           fra u.x, saa fejebladet kan staa lige til hoejre for dem. */
        if (u.trin === "neutraliser") ind("spray", { x: u.x + 20, y: 250, v: 0 });
        if (u.trin === "toer") ind("papir", { x: u.x, y: 300, v: 0 });
        if (u.trin === "fej") {
            ind("fejeblad", { x: u.x + 160, y: S.BORD - 2, v: 0 });
            ind("kost", { x: u.x - 20, y: 330, v: 0 });
        }
        if (liste.length) this.koerEfter(liste, "redskab");
    };

    P.naesteUheldTrin = function () {
        var u = this.uheld;
        var ud = [];
        var gammel = null;
        if (u.trin === "neutraliser") gammel = "spray";
        if (u.trin === "fej") gammel = "kost";
        if (gammel && u.redskaber[gammel]) {
            var gg = u.redskaber[gammel];
            ud.push({ flyt: gg, til: UDE, tid: 0.8, loeft: 20 });
            ud.push({ kald: function () { if (u.redskaber[gammel] === gg) delete u.redskaber[gammel]; } });
        }
        if (u.trin === "toer" && u.redskaber.papir) {
            var pa = u.redskaber.papir;
            ud.push({ flyt: pa, til: { x: S.DUNK.aabning.x, y: S.DUNK.aabning.y - 6, v: 0.8 }, tid: 0.9, loeft: 70 });
            ud.push({ kald: function () { delete u.redskaber.papir; } });
        }
        u.trin = u.trinene[u.trinene.indexOf(u.trin) + 1];
        if (ud.length) this.koerEfter(ud, "redskab");
        this.visRedskaber();
        this.aendret("uheldtrin");
    };

    /* ----- Klik og traek ----------------------------------------------------- */
    P.overUheld = function (pt) {
        var u = this.uheld;
        if (!u) return null;
        var navne = ["kost", "papir", "spray", "fejeblad"];
        for (var i = 0; i < navne.length; i++) {
            var gg = u.redskaber[navne[i]];
            if (gg && S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, 8)) return navne[i];
        }
        if (u.pyt && u.pyt.vaad > 0.05 && Math.abs(pt.x - u.pyt.x) < u.pyt.rx + 10 && Math.abs(pt.y - S.BORD) < 16) return "pyt";
        return null;
    };

    P.klikUheld = function (navn) {
        var u = this.uheld;
        if (!u || u.falder || this.handling) return false;
        switch (u.trin) {
            case "neutraliser":
                if (navn === "spray" || navn === "pyt") { this.neutraliser(); return true; }
                break;
            case "toer":
                if (navn === "papir" || navn === "pyt") { this.autoToer(); return true; }
                break;
            case "fej":
                if (navn === "kost" || navn === "fejeblad") { this.autoFej(); return true; }
                break;
            case "aflever":
                if (navn === "dunk" || navn === "fejeblad") { this.aflevUheld(); return true; }
                break;
        }
        if (navn === "vask") {
            this.besked("Skår og kemikalierester skal ikke i vasken.", "advarsel");
            return false;
        }
        var t = this.uheldTrin();
        this.besked("Ryd op først.");
        if (t) this.markér(t.mark, 3);
        return false;
    };

    P.nedUheld = function (pt) {
        var u = this.uheld;
        if (!u || u.falder || this.handling) return false;
        var navn = this.overUheld(pt);
        if ((navn === "papir" && u.trin === "toer") || (navn === "kost" && u.trin === "fej")) {
            var gg = u.redskaber[navn];
            u.traek = { navn: navn, dx: pt.x - gg.p.x, dy: pt.y - gg.p.y, start: pt, flyttet: false };
            return true;
        }
        return false;
    };

    P.flytUheld = function (pt) {
        var u = this.uheld;
        if (!u || !u.traek) return false;
        var t = u.traek, gg = u.redskaber[t.navn];
        if (!gg) { u.traek = null; return false; }
        if (!t.flyttet && Math.abs(pt.x - t.start.x) + Math.abs(pt.y - t.start.y) < 6) return true;
        t.flyttet = true;
        var kost = t.navn === "kost";
        var nx = NK.klamp(pt.x - t.dx, 40, 960);
        var ny = NK.klamp(pt.y - t.dy, 150, kost ? S.BORD : S.BORD - 10);
        var dx = nx - gg.p.x, dy = ny - gg.p.y;
        gg.p.x = nx;
        gg.p.y = ny;
        if (kost) this.fejMed(gg, dx);
        else this.toerMed(gg, Math.sqrt(dx * dx + dy * dy));
        return true;
    };

    P.opUheld = function () {
        var u = this.uheld;
        if (!u || !u.traek) return false;
        var t = u.traek;
        u.traek = null;
        if (!t.flyttet) this.klikUheld(t.navn);
        return true;
    };

    /* ----- Oprydningens handlinger ------------------------------------------ */
    P.neutraliser = function () {
        var u = this.uheld, sp = u.redskaber.spray, pyt = u.pyt;
        if (!sp || !pyt) return;
        var anden = false;
        this.koer([
            { flyt: sp, til: { x: pyt.x + pyt.rx + 62, y: S.BORD - 78, v: -0.55 }, tid: 0.7, loeft: 30 },
            { kald: function () { if (NK.Lyd) NK.Lyd.spray(); } },
            { tid: 1.5, hver: function (t, sek) {
                pyt.neutral = NK.blod(t);
                u.taage.push({ x: sp.p.x, y: sp.p.y, vx: -r(140, 240), vy: r(40, 110), r: r(2, 4.5), liv: 0.7 });
                if (sek > 0.75 && !anden) { anden = true; if (NK.Lyd) NK.Lyd.spray(); }
            } },
            { kald: function () {
                pyt.neutral = 1;
                pyt.brom = false;
                this.besked("Den orange farve er væk.", "god");
                this.naesteUheldTrin();
            } }
        ], "uheld");
    };

    P.toerMed = function (pa, afstand) {
        var pyt = this.uheld.pyt;
        if (!pyt) return;
        if (Math.abs(pa.p.x - pyt.x) < pyt.rx + 20 && pa.p.y > S.BORD - 34) pyt.vaad = Math.max(0, pyt.vaad - afstand / 650);
    };

    P.autoToer = function () {
        var u = this.uheld, pa = u.redskaber.papir, pyt = u.pyt;
        if (!pa || !pyt) return;
        var start = pyt.vaad;
        this.koer([
            { flyt: pa, til: { x: pyt.x, y: S.BORD - 12, v: 0 }, tid: 0.6, loeft: 30 },
            { tid: 1.6, hver: function (t) {
                pa.p.x = pyt.x + Math.sin(t * Math.PI * 4) * pyt.rx * 0.75;
                pa.p.y = S.BORD - 12 + Math.abs(Math.cos(t * 16)) * 2;
                pa.p.v = Math.sin(t * 20) * 0.1;
                pyt.vaad = start * (1 - t);
            } },
            { kald: function () { pyt.vaad = 0; } }
        ], "uheld");
    };

    function iFejeblad(s) {
        s.fejet = true;
        s.panX = r(24, 74);
        s.panY = r(32, 46);
    }

    P.fejMed = function (kost, dx) {
        var u = this.uheld, fb = u.redskaber.fejeblad;
        if (!fb || kost.p.y < S.BORD - 22) return;
        var ramt = false;
        u.skaar.forEach(function (s) {
            if (s.fejet || !s.hvile) return;
            if (Math.abs(s.x - kost.p.x) < 42) {
                if (dx > 0) s.x += dx;
                ramt = true;
                if (s.x >= fb.p.x - 10) iFejeblad(s);
            }
        });
        if (ramt && Math.abs(dx) > 1 && u.fejUr <= 0) {
            if (NK.Lyd) NK.Lyd.fej();
            u.fejUr = 0.12;
        }
    };

    P.autoFej = function () {
        var u = this.uheld, kost = u.redskaber.kost, fb = u.redskaber.fejeblad;
        if (!kost || !fb) return;
        var min = Infinity;
        u.skaar.forEach(function (s) { if (!s.fejet) min = Math.min(min, s.x); });
        if (!isFinite(min)) min = fb.p.x - 100;
        var fra = { x: Math.max(60, min - 50), y: S.BORD, v: 0 };
        function strøg(tid) {
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
            strøg(1.4),
            { flyt: kost, til: fra, tid: 0.5, loeft: 20 },
            strøg(1.2),
            { kald: function () { u.skaar.forEach(function (s) { if (!s.fejet) iFejeblad(s); }); } }
        ], "uheld");
    };

    P.aflevUheld = function () {
        var u = this.uheld, fb = u.redskaber.fejeblad, d = S.DUNK.aabning;
        if (!fb) return;
        this.koer([
            { flyt: fb, til: { x: d.x - 26, y: d.y - 30, v: 0 }, tid: 0.9, loeft: 60 },
            { flyt: fb, til: { x: d.x - 20, y: d.y - 26, v: 0.95 }, tid: 0.5, loeft: 0 },
            { kald: function () {
                u.skaar.forEach(function (s) {
                    if (!s.fejet) return;
                    var w = NK.tilVerden(fb.p, fb.anker, s.panX, s.panY);
                    s.x = w.x; s.y = w.y; s.vx = r(-10, 40); s.vy = r(-40, 20);
                    s.hvile = false;
                    u.faldSkaar.push(s);
                });
                u.skaar = [];
                if (NK.Lyd) NK.Lyd.glas();
            } },
            { tid: 0.6 },
            { flyt: fb, til: UDE, tid: 0.8, loeft: 20 },
            { kald: function () { delete u.redskaber.fejeblad; this.nyKolbe(); } }
        ], "uheld");
    };

    P.nyKolbe = function () {
        var k = this.g.kolbe, pr = this.g.prop, ug = this.g.urglas;
        k.skjult = false;
        k.areal = 0;
        k.kobber = 0;
        k.prop = false;
        k.niveau = null;
        k.p = { x: k.hjem.x, y: -240, v: 0 };
        ug.kobber = true;
        ug.kobberVis = 1;
        this.gjort.kobber = false;
        this.gjort.brom = false;
        this.gjort.reageret = false;
        this.mikro.kolbe.nulstil();
        this.visBr = 1;
        this.uheld = null;
        this.iagttag("uheld");
        this.koerEfter([
            { flyt: k, til: k.hjem, tid: 0.9, loeft: 0 },
            { flyt: pr, til: pr.hjem, tid: 0.7, loeft: 40 },
            { kald: function () {
                this.besked(this.knusGraense() ? "Ny kolbe og nye kobberspåner. Start igen." : "Ny kolbe. Den her kan ikke gå i stykker.");
                this.aendret("nykolbe");
            } }
        ], "nykolbe");
        this.aendret("nykolbe");
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdaterUheld = function (dt) {
        var u = this.uheld;
        if (!u) return;
        var k = this.g.kolbe, i, s;

        if (u.falder) {
            var kb = u.krop;
            kb.vy += 1300 * dt;
            k.p.x += kb.vx * dt;
            k.p.y += kb.vy * dt;
            k.p.v += kb.va * dt;
            var lav = -Infinity;
            for (i = 0; i < OMRIDS.length; i++) lav = Math.max(lav, NK.tilVerden(k.p, k.anker, OMRIDS[i][0], OMRIDS[i][1]).y);
            if (lav >= S.BORD) this.knus(lav);
            if (!this.uheld) return;
        }
        u.haand.alfa = Math.max(0, u.haand.alfa - dt * 1.4);
        u.fejUr -= dt;

        if (u.propFart) {
            var pr = this.g.prop, pf = u.propFart;
            pf.vy += 1300 * dt;
            pr.p.x = NK.klamp(pr.p.x + pf.vx * dt, u.x - 160, u.x + 160);
            pr.p.y += pf.vy * dt;
            pr.p.v += pf.va * dt;
            if (pr.p.y >= S.BORD) {
                pr.p.y = S.BORD;
                if (pf.vy > 160) { pf.vy = -pf.vy * 0.35; pf.vx *= 0.6; pf.va *= 0.5; }
                else {
                    pf.vy = 0; pf.va = 0;
                    pf.vx *= Math.max(0, 1 - 6 * dt);
                    pr.p.v = NK.mod(pr.p.v, Math.round(pr.p.v / (Math.PI * 2)) * Math.PI * 2, 8, dt);
                }
            }
        }

        for (i = 0; i < u.skaar.length; i++) {
            s = u.skaar[i];
            if (s.fejet || s.hvile) continue;
            s.vy += 1300 * dt;
            s.x = NK.klamp(s.x + s.vx * dt, u.x - 130, u.x + 130);
            s.y += s.vy * dt;
            s.a += s.va * dt;
            if (s.y > S.BORD - 2) {
                s.y = S.BORD - 2;
                if (Math.abs(s.vy) > 90) { s.vy = -s.vy * 0.3; s.vx *= 0.6; s.va *= 0.5; }
                else {
                    s.vy = 0;
                    s.vx *= Math.max(0, 1 - 8 * dt);
                    s.va *= Math.max(0, 1 - 10 * dt);
                    if (Math.abs(s.vx) < 5 && Math.abs(s.va) < 0.4) s.hvile = true;
                }
            }
        }
        for (i = u.faldSkaar.length - 1; i >= 0; i--) {
            s = u.faldSkaar[i];
            s.vy += 1300 * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.a += 6 * dt;
            if (s.y > S.DUNK.aabning.y + 14) u.faldSkaar.splice(i, 1);
        }
        for (i = u.stank.length - 1; i >= 0; i--) {
            s = u.stank[i];
            s.vy += 1300 * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            if (s.y > S.BORD) u.stank.splice(i, 1);
        }
        for (i = u.taage.length - 1; i >= 0; i--) {
            s = u.taage[i];
            s.vy += 200 * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.r += dt * 8;
            s.liv -= dt * 1.2;
            if (s.liv <= 0 || s.y > S.BORD) u.taage.splice(i, 1);
        }

        var pyt = u.pyt;
        if (pyt) {
            pyt.rx = NK.mod(pyt.rx, pyt.rxMaal, 4, dt);
            if (pyt.brom && pyt.neutral < 0.9 && pyt.vaad > 0.1) {
                u.dampUr -= dt;
                if (u.dampUr <= 0) {
                    u.dampUr = 0.18;
                    this.dampe.push({ x: pyt.x + r(-0.8, 0.8) * pyt.rx, y: S.BORD - 2, vx: r(-6, 6), vy: r(-30, -14), r: r(6, 11), liv: 0.9 * (1 - pyt.neutral) });
                }
            }
        }

        if (!this.handling) {
            if (u.trin === "toer" && pyt && pyt.vaad <= 0.03) {
                pyt.vaad = 0;
                this.naesteUheldTrin();
            } else if (u.trin === "fej" && u.skaar.length && u.skaar.every(function (q) { return q.fejet; })) {
                this.naesteUheldTrin();
            }
        }
    };

    /* ----- Tegning: "bord" under genstandene, "redskaber" over dem,
       "top" oeverst ------------------------------------------------------- */
    P.tegnUheld = function (ctx, lag, tid) {
        var u = this.uheld;
        if (!u) return;
        var mig = this;
        if (lag === "bord") {
            S.tegnPyt(ctx, u.pyt);
            S.tegnSkaar(ctx, u.skaar.filter(function (s) { return !s.fejet && s.hvile; }));
            if (u.pyt && u.pyt.vaad > 0.05 && (this.markeret("spray") || this.markeret("papir"))) {
                S.tegnMarkering(ctx, { x: u.pyt.x - u.pyt.rx, y: S.BORD - 8, b: u.pyt.rx * 2, h: 16 }, tid);
            }
        } else if (lag === "redskaber") {
            var fb = u.redskaber.fejeblad;
            if (fb) {
                NK.Sprites.tegnPositur(ctx, "fejeblad", fb.p, fb.anker);
                var iBladet = [];
                u.skaar.forEach(function (s) {
                    if (!s.fejet) return;
                    var w = NK.tilVerden(fb.p, fb.anker, s.panX, s.panY);
                    iBladet.push({ x: w.x, y: w.y, a: s.a, pts: s.pts, kobber: s.kobber, r: s.r, alfa: 1 });
                });
                S.tegnSkaar(ctx, iBladet);
                if (this.markeret("fejeblad")) S.tegnMarkering(ctx, S.rekt("fejeblad", fb.p, fb.anker, 0), tid);
            }
            ["spray", "papir", "kost"].forEach(function (n) {
                var gg = u.redskaber[n];
                if (!gg) return;
                var p = gg.p;
                var svaever = !mig.handling && !(u.traek && u.traek.navn === n) && Math.abs(p.x - gg.hjem.x) + Math.abs(p.y - gg.hjem.y) < 1;
                if (svaever) p = { x: p.x, y: p.y + Math.sin(tid * 2.6 + n.length) * 3, v: p.v };
                NK.Sprites.tegnPositur(ctx, gg.sprite, p, gg.anker);
                if (mig.markeret(n)) S.tegnMarkering(ctx, S.rekt(gg.sprite, gg.p, gg.anker, 0), tid);
            });
        } else {
            S.tegnSkaar(ctx, u.skaar.filter(function (s) { return !s.fejet && !s.hvile; }));
            S.tegnSkaar(ctx, u.faldSkaar);
            S.tegnDraaber(ctx, u.stank);
            ctx.save();
            for (var i = 0; i < u.taage.length; i++) {
                var t = u.taage[i];
                ctx.globalAlpha = NK.klamp(t.liv, 0, 1) * 0.45;
                ctx.fillStyle = "#e3eef5";
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            if (u.haand.alfa > 0.01) NK.Sprites.tegnPositur(ctx, "haand", u.haand.p, S.ANKER.haand, u.haand.alfa);
        }
    };
}());
