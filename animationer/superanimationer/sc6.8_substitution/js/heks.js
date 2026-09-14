/* =====================================================================
   heks.js - heksen paa hylden

   Hexan, heksen. Hun sidder paa sin kost paa hylden ved siden af kaffen
   og er ikke en del af forsoeget. Klikkes der paa hende, viser hun et
   trick ad gangen:

     1  hun svarer, at hun er heksen, og griner
     2  hun flyver en tur gennem stinkskabet med gnister efter sig
     3  hun forhekser lampen: taender eller slukker den med et glimt,
        hvis der staar et glas under den
     4  hun siger sin remse om seks C og fjorten H

   Derefter forfra. Alt her kan slettes, uden at forsoeget aendres.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var r = NK.r;
    var P = NK.Forsoeg.prototype;

    var REPLIKKER = {
        hilsen: ["Kaldte du på heksen?", "Hexan? Nej, heksen.", "Ja, det er mig."],
        remse: "Seks C og fjorten H. Det er mig!",
        intet: "Der står intet under lampen.",
        lys: "Lys!",
        moerke: "Mørke!"
    };

    NK.HEKS_REPLIKKER = REPLIKKER;

    /* Flyveturen: fire bezierkurver rundt i stinkskabet og hjem igen */
    var TUR = [
        [[116, 268], [60, 120], [330, 60], [480, 150]],
        [[480, 150], [620, 230], [900, 120], [940, 260]],
        [[940, 260], [960, 400], [700, 430], [520, 330]],
        [[520, 330], [380, 250], [160, 150], [116, 268]]
    ];

    function bez(k, t) {
        var u = 1 - t;
        return {
            x: u * u * u * k[0][0] + 3 * u * u * t * k[1][0] + 3 * u * t * t * k[2][0] + t * t * t * k[3][0],
            y: u * u * u * k[0][1] + 3 * u * u * t * k[1][1] + 3 * u * t * t * k[2][1] + t * t * t * k[3][1]
        };
    }

    P.heksNyt = function () {
        var hj = S.HJEM.heks;
        if (!this.heks) {
            this.heks = { nr: 0, p: { x: hj.x, y: hj.y, v: 0 }, flyver: null, hop: 0, tale: "", taleUr: 0, taleAlfa: 0, gnister: [], glimt: 0, glimtSted: null };
        }
        var H = this.heks;
        H.p.x = hj.x; H.p.y = hj.y; H.p.v = 0;
        H.flyver = null;
        H.tale = "";
        H.taleUr = 0;
        H.gnister = [];
        H.glimt = 0;
    };

    P.heksSig = function (tekst, vis) {
        var H = this.heks;
        H.tale = tekst;
        H.taleUr = vis || 2.2;
    };

    P.klikHeks = function () {
        var H = this.heks;
        if (!H || H.flyver) return false;
        if (NK.Lyd) NK.Lyd.laasOp();
        H.nr++;
        var trick = H.nr % 4;
        if (trick === 1) {
            this.heksSig(REPLIKKER.hilsen[Math.floor(H.nr / 4) % REPLIKKER.hilsen.length]);
            H.hop = 1;
            if (NK.Lyd) NK.Lyd.latter();
        } else if (trick === 2) {
            H.flyver = { t: 0, varighed: 4.2 };
            H.tale = "";
            if (NK.Lyd) NK.Lyd.svusj();
        } else if (trick === 3) {
            var under = this.glasVed("lampe");
            if (under) {
                this.lampeTaendt = !this.lampeTaendt;
                if (this.lampeTaendt) this.gjort.lys = true;
                H.glimt = 1;
                H.glimtSted = { x: S.LAMPE.lys.x, y: S.LAMPE.lys.y };
                for (var i = 0; i < 26; i++) H.gnister.push({ x: S.LAMPE.lys.x + r(-10, 10), y: S.LAMPE.lys.y + r(-6, 6), vx: r(-160, 160), vy: r(-160, 80), liv: 1, farve: i % 2 ? "#f2c53d" : "#ffffff" });
                this.heksSig(this.lampeTaendt ? REPLIKKER.lys : REPLIKKER.moerke, 1.6);
                if (NK.Lyd) NK.Lyd.tryl();
                this.aendret("lampe");
            } else {
                this.heksSig(REPLIKKER.intet);
                if (NK.Lyd) NK.Lyd.klik();
            }
        } else {
            this.heksSig(REPLIKKER.remse, 2.8);
            H.hop = 1;
            if (NK.Lyd) NK.Lyd.latter();
        }
        this.aendret("heks");
        return true;
    };

    P.opdaterHeks = function (dt) {
        var H = this.heks;
        if (!H) return;
        var i;
        if (H.flyver) {
            var f = H.flyver;
            f.t += dt;
            var u = NK.klamp(f.t / f.varighed, 0, 1);
            var n = Math.min(TUR.length - 1, Math.floor(u * TUR.length));
            var lokal = u * TUR.length - n;
            var p = bez(TUR[n], lokal);
            var q = bez(TUR[n], Math.min(1, lokal + 0.02));
            H.p.v = Math.atan2(q.y - p.y, q.x - p.x) * 0.35 + (q.x < p.x ? 0 : 0);
            H.p.x = p.x;
            H.p.y = p.y;
            if (Math.random() < dt * 40) H.gnister.push({ x: p.x - 20, y: p.y - 14, vx: r(-30, 30), vy: r(-20, 40), liv: 1, farve: Math.random() < 0.5 ? "#f2c53d" : "#c9a4ff" });
            if (u >= 1) {
                H.flyver = null;
                H.p.x = S.HJEM.heks.x;
                H.p.y = S.HJEM.heks.y;
                H.p.v = 0;
                if (NK.Lyd) NK.Lyd.latter();
            }
        }
        if (H.hop > 0) H.hop = Math.max(0, H.hop - dt * 2.2);
        H.taleUr -= dt;
        H.taleAlfa = NK.mod(H.taleAlfa, H.taleUr > 0 ? 1 : 0, 12, dt);
        H.glimt = Math.max(0, H.glimt - dt * 2);
        for (i = H.gnister.length - 1; i >= 0; i--) {
            var g = H.gnister[i];
            g.x += g.vx * dt;
            g.y += g.vy * dt;
            g.vy += 120 * dt;
            g.liv -= dt * 1.6;
            if (g.liv <= 0) H.gnister.splice(i, 1);
        }
    };

    P.tegnHeks = function (ctx, tid) {
        var H = this.heks;
        if (!H) return;
        var i;
        var hop = Math.sin(H.hop * Math.PI) * 12;
        var p = { x: H.p.x, y: H.p.y - hop, v: H.p.v };
        if (H.flyver) p.y += Math.sin(tid * 9) * 3;
        NK.Sprites.tegnPositur(ctx, "heks", p, S.ANKER.heks);
        ctx.save();
        for (i = 0; i < H.gnister.length; i++) {
            var g = H.gnister[i];
            ctx.globalAlpha = NK.klamp(g.liv, 0, 1);
            ctx.fillStyle = g.farve;
            ctx.beginPath();
            ctx.arc(g.x, g.y, 1.6 + 1.4 * g.liv, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        if (H.glimt > 0.01 && H.glimtSted) NK.skaer(ctx, H.glimtSted.x, H.glimtSted.y, 90 * H.glimt, "rgba(255, 240, 190, 0.9)", H.glimt);
        if (H.taleAlfa > 0.01) S.tegnTaleboble(ctx, p.x + 40, p.y - 120, H.tale, H.taleAlfa, p.x + 10, p.y - 62);
    };
}());
