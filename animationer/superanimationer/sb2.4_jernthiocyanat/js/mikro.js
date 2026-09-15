/* =====================================================================
   mikro.js - partikelniveauet i zoomboblen

   Boblen viser den valgte beholder (baegerglasset eller et reagensglas)
   i en cirkel med radius 100 enheder. Hvor mange partikler der skal
   vaere af hver slags, kommer fra oploesningen i model.js (mikroMaal).
   Boblen afstemmer sig selv mod de tal, én haendelse ad gangen:

     Fe3+ og SCN- finder hinanden og danner FeSCN2+      (bind)
     FeSCN2+ gaar i stykker til Fe3+ og SCN-             (split)
     Ag+ finder SCN- og danner AgSCN, der synker         (faeld)

   Tilsaettes der ioner, falder de ned oppefra. Fortyndes der, toner
   partikler ud. Vandmolekylerne ligger svagt i baggrunden.

   K er forstaerket i boblen, saa der er komplekser at se. Det er et
   modelbillede af, hvad der sker, ikke et regnskab.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;
    var R = 100;
    var r = NK.r;

    var RADIUS = { fe: 11, scn: 11, fescn: 16, ag: 9.5, agscn: 11, vand: 6 };
    var FART = { fe: 22, scn: 26, fescn: 16, ag: 28, agscn: 0, vand: 16 };

    /* Pladserne til AgSCN i bunden */
    var BUNDPLADS = [
        { x: 0, y: 84 }, { x: -22, y: 82 }, { x: 22, y: 82 }, { x: -43, y: 76 }, { x: 43, y: 76 },
        { x: -11, y: 66 }, { x: 11, y: 66 }, { x: -32, y: 62 }, { x: 32, y: 62 }, { x: -60, y: 64 },
        { x: 60, y: 64 }, { x: 0, y: 50 }
    ];

    NK.Mikro = function () {
        this.nulstil();
    };

    var P = NK.Mikro.prototype;

    P.nulstil = function () {
        this.partikler = [];
        this.haendelser = [];
        this.blink = [];
        this.spawnUr = 0;
        this.evUr = 0;
        this.s = { ryst: 0, farve: null };
    };

    P.toem = function () {
        this.nulstil();
    };

    P.ny = function (type, x, y, vx, vy) {
        var p = { type: type, x: x, y: y, vx: vx || 0, vy: vy || 0, a: r(0, 6.28), va: r(-1.2, 1.2), rad: RADIUS[type], alfa: 0 };
        this.partikler.push(p);
        return p;
    };

    P.fjern = function (p) {
        var i = this.partikler.indexOf(p);
        if (i >= 0) this.partikler.splice(i, 1);
    };

    P.plads = function (rad) {
        for (var n = 0; n < 40; n++) {
            var x = r(-80, 80), y = r(-80, 80);
            if (x * x + y * y < (R - rad - 8) * (R - rad - 8)) return { x: x, y: y };
        }
        return { x: 0, y: 0 };
    };

    /* Antal af en slags, som den ser ud lige nu (til selvtesten) */
    P.antal = function (type) {
        var n = 0;
        for (var i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            if (p.type === type && !p.fjernes) n++;
        }
        return n;
    };

    /* Optaellingen, som den bliver, naar de igangvaerende haendelser er
       faerdige */
    P.telle = function () {
        var c = { fe: 0, scn: 0, fescn: 0, ag: 0, agscn: 0, vand: 0 };
        this.partikler.forEach(function (p) { if (!p.laast && !p.fjernes) c[p.type]++; });
        this.haendelser.forEach(function (h) {
            if (h.type === "bind") c.fescn++;
            else if (h.type === "split") { c.fe++; c.scn++; }
            else if (h.type === "faeld") c.agscn++;
        });
        return c;
    };

    P.travl = function () {
        return this.haendelser.length > 0;
    };

    function fri(p) { return !p.laast && !p.fjernes && !p.falder; }

    P.find = function (type) {
        var liste = this.partikler.filter(function (p) { return p.type === type && fri(p); });
        return liste.length ? liste[Math.floor(Math.random() * liste.length)] : null;
    };

    P.naermeste = function (p, type) {
        var bedst = null, afst = Infinity;
        for (var i = 0; i < this.partikler.length; i++) {
            var q = this.partikler[i];
            if (q === p || q.type !== type || !fri(q)) continue;
            var d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y);
            if (d < afst) { afst = d; bedst = q; }
        }
        return bedst;
    };

    /* En ion falder ned oppefra */
    P.spawn = function (type) {
        var p = this.ny(type, r(-55, 55), -R - 14, r(-12, 12), r(80, 105));
        p.falder = true;
        p.alfa = 1;
        return p;
    };

    P.forsvind = function (type) {
        var liste = this.partikler.filter(function (p) { return p.type === type && !p.laast && !p.fjernes; });
        if (!liste.length) return false;
        liste[Math.floor(Math.random() * liste.length)].fjernes = true;
        return true;
    };

    /* Et kompleks mister den ene del med det samme (ved fortynding) */
    P.omdan = function (fra, til) {
        var p = this.find(fra);
        if (!p) return false;
        p.type = til;
        p.rad = RADIUS[til];
        this.blink.push({ x: p.x, y: p.y, liv: 1, farve: "255, 230, 150" });
        return true;
    };

    P.fraBund = function () {
        var brugt = {};
        this.partikler.forEach(function (p) { if (p.type === "agscn" && p.plads !== undefined) brugt[p.plads] = true; });
        for (var i = 0; i < BUNDPLADS.length; i++) if (!brugt[i]) return i;
        return Math.floor(Math.random() * BUNDPLADS.length);
    };

    /* ----- Afstemning mod maalet --------------------------------------- */
    P.afstem = function (dt, m) {
        var c = this.telle();
        this.spawnUr -= dt;
        this.evUr -= dt;

        if (c.vand < m.vand) {
            var q = this.plads(6);
            this.ny("vand", q.x, q.y, r(-10, 10), r(-10, 10));
        } else if (c.vand > m.vand) {
            this.forsvind("vand");
        }

        var agMangler = m.agscn - c.agscn;
        var cAgAlt = c.ag + c.agscn, tAgAlt = m.ag + m.agscn;

        /* Jern i alt */
        var cFe = c.fe + c.fescn, tFe = m.fe + m.fescn;
        if (cFe < tFe && this.spawnUr <= 0) { this.spawn("fe"); this.spawnUr = 0.09; c = this.telle(); }
        else if (cFe > tFe) { if (!this.forsvind("fe")) this.omdan("fescn", "scn"); c = this.telle(); }

        /* Thiocyanat i alt (det faeldede taeller ikke med) */
        var cS = c.scn + c.fescn, tS = m.scn + m.fescn;
        var ventAg = agMangler > 0 && (c.ag > 0 || cAgAlt < tAgAlt);
        if (cS < tS && this.spawnUr <= 0) { this.spawn("scn"); this.spawnUr = 0.09; c = this.telle(); }
        else if (cS > tS && !ventAg) { if (!this.forsvind("scn")) this.omdan("fescn", "fe"); c = this.telle(); }

        /* Soelv i alt */
        cAgAlt = c.ag + c.agscn;
        if (cAgAlt < tAgAlt && this.spawnUr <= 0) { this.spawn("ag"); this.spawnUr = 0.09; c = this.telle(); }
        else if (cAgAlt > tAgAlt) { if (!this.forsvind("ag")) this.forsvind("agscn"); c = this.telle(); }

        if (this.haendelser.length >= 3 || this.evUr > 0) return;

        /* Faeldning: Ag+ finder SCN-. Er der ingen fri SCN-, gaar et
           kompleks i stykker foerst. */
        if (m.agscn > c.agscn && c.ag > 0) {
            var ag = this.find("ag");
            var scn = ag ? this.naermeste(ag, "scn") : null;
            if (ag && scn) { this.startFaeld(ag, scn); this.evUr = 0.16; return; }
            var kx = this.find("fescn");
            if (kx) { this.startSplit(kx); this.evUr = 0.25; return; }
        } else if (c.agscn > m.agscn) {
            this.forsvind("agscn");
        }

        /* Komplekset */
        if (c.fescn < m.fescn && c.fe > 0 && c.scn > 0) {
            var fe = this.find("fe");
            var s = fe ? this.naermeste(fe, "scn") : null;
            if (fe && s) { this.startBind(fe, s); this.evUr = 0.3; }
        } else if (c.fescn > m.fescn) {
            var k2 = this.find("fescn");
            if (k2) { this.startSplit(k2); this.evUr = 0.3; }
        }
    };

    P.startBind = function (fe, scn) {
        fe.laast = true;
        scn.laast = true;
        this.haendelser.push({ type: "bind", a: fe, b: scn, t: 0 });
    };

    P.startSplit = function (k) {
        k.laast = true;
        this.haendelser.push({ type: "split", k: k, t: 0 });
    };

    P.startFaeld = function (ag, scn) {
        ag.laast = true;
        scn.laast = true;
        this.haendelser.push({ type: "faeld", a: ag, b: scn, t: 0 });
    };

    P.opdaterHaendelser = function (dt) {
        for (var i = this.haendelser.length - 1; i >= 0; i--) {
            var h = this.haendelser[i];
            h.t += dt;
            if (h.type === "bind" || h.type === "faeld") {
                var a = h.a, b = h.b;
                var dx = b.x - a.x, dy = b.y - a.y;
                var d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                var skridt = Math.min(85 * dt, d / 2);
                a.x += dx / d * skridt;
                a.y += dy / d * skridt;
                b.x -= dx / d * skridt;
                b.y -= dy / d * skridt;
                a.a += 2 * dt;
                if (d < a.rad + b.rad - 6 || h.t > 2.2) {
                    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
                    this.fjern(a);
                    this.fjern(b);
                    if (h.type === "bind") {
                        var k = this.ny("fescn", mx, my, (a.vx + b.vx) * 0.3, (a.vy + b.vy) * 0.3);
                        k.a = Math.atan2(dy, dx);
                        k.alfa = 1;
                        this.blink.push({ x: mx, y: my, liv: 1, farve: "255, 110, 80" });
                    } else {
                        var q = this.ny("agscn", mx, my, 0, 0);
                        q.alfa = 1;
                        q.plads = this.fraBund();
                        this.blink.push({ x: mx, y: my, liv: 1, farve: "255, 255, 255" });
                    }
                    this.haendelser.splice(i, 1);
                }
            } else {
                h.k.x += Math.sin(h.t * 70) * 0.5;
                if (h.t > 0.35) {
                    var kk = h.k, c = Math.cos(kk.a), s = Math.sin(kk.a);
                    this.fjern(kk);
                    var fe = this.ny("fe", kk.x - c * 9, kk.y - s * 9, -c * 50, -s * 50);
                    var sc = this.ny("scn", kk.x + c * 11, kk.y + s * 11, c * 50, s * 50);
                    fe.alfa = 1;
                    sc.alfa = 1;
                    this.blink.push({ x: kk.x, y: kk.y, liv: 1, farve: "255, 230, 150" });
                    this.haendelser.splice(i, 1);
                }
            }
        }
    };

    /* ----- Tidens gang --------------------------------------------------- */
    /* m: maalet fra M.mikroMaal. s = { ryst, farve } */
    P.opdater = function (dt, m, s) {
        this.s = s || {};
        var ryst = this.s.ryst || 0;
        var i, j, p, q;
        this.afstem(dt, m);

        var liste = this.partikler;
        for (i = liste.length - 1; i >= 0; i--) {
            p = liste[i];
            if (p.fjernes) {
                p.alfa -= dt * 2.5;
                if (p.alfa <= 0) { liste.splice(i, 1); continue; }
            } else {
                p.alfa = Math.min(1, p.alfa + dt * 3);
            }
            if (p.laast) continue;

            if (p.type === "agscn") {
                var bp = BUNDPLADS[(p.plads || 0) % BUNDPLADS.length];
                if (ryst > 0.2) {
                    p.x += r(-1, 1) * 120 * ryst * dt;
                    p.y += r(-1.4, 0.6) * 120 * ryst * dt;
                } else {
                    p.x = NK.mod(p.x, bp.x, 1.8, dt);
                    p.y = NK.mod(p.y, bp.y, 1.2, dt);
                }
                p.a += 0.2 * dt;
                continue;
            }
            if (p.falder) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.y > -58) { p.falder = false; p.vy *= 0.3; }
                continue;
            }

            /* Varmebevaegelse: retningen skifter tilfaeldigt, farten soeger
               mod typens fart. Rystning saetter fart paa alt. */
            var maal = (FART[p.type] || 20) * (1 + 3 * ryst);
            var fart = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            var retning = fart > 0.01 ? Math.atan2(p.vy, p.vx) : r(0, 6.28);
            retning += (Math.random() - 0.5) * (5 + 8 * ryst) * dt;
            fart = NK.mod(fart, maal, 2.5, dt);
            p.vx = Math.cos(retning) * fart;
            p.vy = Math.sin(retning) * fart;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.a += p.va * (0.4 + 3 * ryst) * dt;

            var d = Math.sqrt(p.x * p.x + p.y * p.y);
            var graense = R - p.rad - 3;
            if (d > graense) {
                var nx = p.x / d, ny = p.y / d;
                p.x = nx * graense;
                p.y = ny * graense;
                var vn = p.vx * nx + p.vy * ny;
                if (vn > 0) { p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny; }
            }
        }

        /* Sammenstoed: partiklerne skubber hinanden, vandet er kun baggrund */
        for (i = 0; i < liste.length; i++) {
            p = liste[i];
            if (p.laast || p.falder || p.type === "vand" || p.type === "agscn") continue;
            for (j = i + 1; j < liste.length; j++) {
                q = liste[j];
                if (q.laast || q.falder || q.type === "vand" || q.type === "agscn") continue;
                var dx = p.x - q.x, dy = p.y - q.y;
                var min = p.rad + q.rad;
                var dd = dx * dx + dy * dy;
                if (dd >= min * min) continue;
                var afst = Math.sqrt(dd) || 0.01;
                var ux = dx / afst, uy = dy / afst, skub = (min - afst) * 0.5;
                p.x += ux * skub; p.y += uy * skub;
                q.x -= ux * skub; q.y -= uy * skub;
            }
        }

        this.opdaterHaendelser(dt);

        for (i = this.blink.length - 1; i >= 0; i--) {
            this.blink[i].liv -= dt * 2.2;
            if (this.blink[i].liv <= 0) this.blink.splice(i, 1);
        }
    };

    /* ================================================================
       TEGNING
       ================================================================ */
    var UDSEENDE = {
        fe:    { lys: "#ffd98a", moerk: "#a4610f", tekst: "#2b1703" },
        fescn: { lys: "#ffb08a", moerk: "#9b2d12", tekst: "#ffffff" },
        ag:    { lys: "#ffffff", moerk: "#8a949e", tekst: "#1a1d22" },
        agscn: { lys: "#ffffff", moerk: "#b3bac2", tekst: "#2a2f36" },
        s:     { lys: "#fff08a", moerk: "#a98a0c" },
        c:     { lys: "#b4bcc6", moerk: "#4a525c" },
        n:     { lys: "#9ec0ff", moerk: "#2a4ea8" },
        o:     { lys: "#ff9a90", moerk: "#b8332a" },
        h:     { lys: "#ffffff", moerk: "#aab4bf" }
    };

    var ETIKET = {
        fe: M.formel("Fe3+"), scn: M.formel("SCN-"), fescn: M.formel("FeSCN2+"),
        ag: M.formel("Ag+"), agscn: M.formel("AgSCN"), vand: M.formel("H2O")
    };
    NK.Mikro.ETIKET = ETIKET;

    function etiket(ctx, tekst, x, y, farve, stoerrelse) {
        ctx.font = "700 " + stoerrelse + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(10, 12, 18, 0.55)";
        ctx.lineJoin = "round";
        ctx.strokeText(tekst, x, y + 0.5);
        ctx.fillStyle = farve;
        ctx.fillText(tekst, x, y + 0.5);
    }

    /* SCN-: S, C og N paa en linje */
    function tegnSCN(ctx, x, y, a) {
        var c = Math.cos(a), s = Math.sin(a);
        ctx.strokeStyle = "#3a4048";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - c * 9, y - s * 9);
        ctx.lineTo(x + c * 8, y + s * 8);
        ctx.stroke();
        NK.kugle(ctx, x + c * 8, y + s * 8, 4.6, UDSEENDE.n.lys, UDSEENDE.n.moerk);
        NK.kugle(ctx, x, y, 4, UDSEENDE.c.lys, UDSEENDE.c.moerk);
        NK.kugle(ctx, x - c * 9, y - s * 9, 5.8, UDSEENDE.s.lys, UDSEENDE.s.moerk);
    }

    /* FeSCN2+: Fe bundet til N-enden af thiocyanat */
    function tegnFeSCN(ctx, x, y, a, glød) {
        var c = Math.cos(a), s = Math.sin(a);
        if (glød) NK.skaer(ctx, x, y, 26, "rgba(235, 60, 35, 0.6)", 0.8);
        ctx.strokeStyle = "#3a4048";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - c * 8, y - s * 8);
        ctx.lineTo(x + c * 20, y + s * 20);
        ctx.stroke();
        NK.kugle(ctx, x + c * 4, y + s * 4, 4.4, UDSEENDE.n.lys, UDSEENDE.n.moerk);
        NK.kugle(ctx, x + c * 11, y + s * 11, 3.8, UDSEENDE.c.lys, UDSEENDE.c.moerk);
        NK.kugle(ctx, x + c * 19, y + s * 19, 5.4, UDSEENDE.s.lys, UDSEENDE.s.moerk);
        NK.kugle(ctx, x - c * 9, y - s * 9, 10, UDSEENDE.fescn.lys, UDSEENDE.fescn.moerk);
    }

    function tegnVand(ctx, x, y, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        NK.kugle(ctx, -3.8, 3.4, 2.2, UDSEENDE.h.lys, UDSEENDE.h.moerk);
        NK.kugle(ctx, 3.8, 3.4, 2.2, UDSEENDE.h.lys, UDSEENDE.h.moerk);
        NK.kugle(ctx, 0, 0, 3.8, UDSEENDE.o.lys, UDSEENDE.o.moerk);
        ctx.restore();
    }

    function tegnAgSCN(ctx, x, y, a) {
        var c = Math.cos(a) * 0.3, s = Math.sin(a) * 0.3;
        NK.kugle(ctx, x - 5 + s, y + c, 7.5, UDSEENDE.agscn.lys, UDSEENDE.agscn.moerk);
        NK.kugle(ctx, x + 6 - s, y - 1 - c, 6.5, "#f4f6f8", "#9aa3ab");
        NK.kugle(ctx, x + 1, y - 6, 4.5, "#ffffff", "#b9c0c7");
    }

    /* medEtiket: kun de foerste af hver slags faar formlen paa, saa boblen
       ikke drukner i tekst. Forklaringen under boblen siger resten. */
    function tegnPartikel(ctx, p, medEtiket) {
        ctx.globalAlpha = NK.klamp(p.alfa, 0, 1) * (p.type === "vand" ? 0.45 : 1);
        if (p.type === "vand") {
            tegnVand(ctx, p.x, p.y, p.a * 0.3);
        } else if (p.type === "scn") {
            tegnSCN(ctx, p.x, p.y, p.a);
            if (medEtiket) etiket(ctx, ETIKET.scn, p.x, p.y + 15, "#eef2f6", 11);
        } else if (p.type === "fescn") {
            tegnFeSCN(ctx, p.x, p.y, p.a, true);
            if (medEtiket) etiket(ctx, ETIKET.fescn, p.x, p.y + 20, "#ffd6c9", 11);
        } else if (p.type === "fe") {
            NK.kugle(ctx, p.x, p.y, p.rad, UDSEENDE.fe.lys, UDSEENDE.fe.moerk);
            if (medEtiket) etiket(ctx, ETIKET.fe, p.x, p.y, "#ffffff", 11);
        } else if (p.type === "ag") {
            NK.kugle(ctx, p.x, p.y, p.rad, UDSEENDE.ag.lys, UDSEENDE.ag.moerk);
            if (medEtiket) etiket(ctx, ETIKET.ag, p.x, p.y, "#ffffff", 10.5);
        } else if (p.type === "agscn") {
            tegnAgSCN(ctx, p.x, p.y, p.a);
        }
        ctx.globalAlpha = 1;
    }

    /* Tegner boblen b = { x, y, r } med modellen indeni. */
    P.tegn = function (ctx, b, alfa, titel, tid) {
        if (alfa < 0.01) return;
        var k = (b.r - 4) / R;
        var i, p;
        var s = this.s;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.translate(b.x, b.y);

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#12151b";
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.scale(k, k);

        /* Oploesningens farve som et svagt skaer */
        if (s.farve) {
            ctx.fillStyle = "rgba(90, 150, 210, 0.12)";
            ctx.fillRect(-R, -R, 2 * R, 2 * R);
            var f = s.farve;
            var styrke = NK.klamp((f.a - 0.3) * 0.8, 0, 0.45);
            ctx.fillStyle = "rgba(" + Math.round(f.r) + ", " + Math.round(f.g * 0.8) + ", " + Math.round(f.b * 0.8) + ", " + styrke.toFixed(3) + ")";
            ctx.fillRect(-R, -R, 2 * R, 2 * R);
        }

        for (i = 0; i < this.partikler.length; i++) {
            p = this.partikler[i];
            if (p.type === "vand") tegnPartikel(ctx, p);
        }
        var talt = {};
        for (i = 0; i < this.partikler.length; i++) {
            p = this.partikler[i];
            if (p.type === "vand") continue;
            talt[p.type] = (talt[p.type] || 0) + 1;
            tegnPartikel(ctx, p, talt[p.type] <= 4);
        }

        for (i = 0; i < this.blink.length; i++) {
            var bl = this.blink[i];
            NK.skaer(ctx, bl.x, bl.y, 14 + 12 * (1 - bl.liv), "rgba(" + bl.farve + ", 0.9)", bl.liv * 0.9);
        }
        ctx.restore();

        /* Kant og genskin */
        ctx.globalAlpha = alfa;
        var ring = ctx.createLinearGradient(-b.r, -b.r, b.r, b.r);
        ring.addColorStop(0, "#e3e8ee");
        ring.addColorStop(0.5, "#7b8490");
        ring.addColorStop(1, "#c7ced7");
        ctx.strokeStyle = ring;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 9, Math.PI * 1.1, Math.PI * 1.45);
        ctx.stroke();

        if (titel) {
            ctx.font = "700 13px 'Segoe UI', sans-serif";
            var bredde = ctx.measureText(titel).width + 18;
            ctx.fillStyle = "rgba(20, 22, 28, 0.92)";
            NK.rundtRekt(ctx, -bredde / 2, -b.r - 11, bredde, 22, 11);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.lineWidth = 1;
            ctx.stroke();
            NK.tekst(ctx, titel, 0, -b.r, { font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#dfe5ec" });
        }
        this.tegnForklaring(ctx, 0, b.r + 12);
        ctx.restore();
    };

    /* De partikeltyper, der kan ses lige nu */
    P.typer = function () {
        var ud = [], set = {};
        var orden = ["fe", "scn", "fescn", "ag", "agscn", "vand"];
        for (var i = 0; i < this.partikler.length; i++) set[this.partikler[i].type] = true;
        orden.forEach(function (t) { if (set[t]) ud.push(t); });
        return ud;
    };

    P.tegnForklaring = function (ctx, x, y) {
        var typer = this.typer();
        if (!typer.length) return;
        ctx.save();
        ctx.font = "600 12px 'Segoe UI', sans-serif";
        var bredder = typer.map(function (t) { return ctx.measureText(ETIKET[t]).width + 36; });
        var raekker = [[]], rb = [0];
        typer.forEach(function (t, i) {
            var n = raekker.length - 1;
            if (rb[n] + bredder[i] > 250 && raekker[n].length) { raekker.push([]); rb.push(0); n++; }
            raekker[n].push(i);
            rb[n] += bredder[i];
        });
        var h = raekker.length * 22 + 6;
        var maks = Math.max.apply(null, rb) + 12;
        ctx.fillStyle = "rgba(20, 22, 28, 0.88)";
        NK.rundtRekt(ctx, x - maks / 2, y, maks, h, 10);
        ctx.fill();
        raekker.forEach(function (rk, ri) {
            var cx = x - rb[ri] / 2;
            var cy = y + 14 + ri * 22;
            rk.forEach(function (i) {
                var t = typer[i];
                var ix = cx + 13;
                ctx.save();
                ctx.translate(ix, cy);
                if (t === "scn") { ctx.scale(0.75, 0.75); tegnSCN(ctx, 0, 0, 0); }
                else if (t === "fescn") { ctx.scale(0.55, 0.55); tegnFeSCN(ctx, -4, 0, 0, false); }
                else if (t === "vand") { tegnVand(ctx, 0, 0, 0); }
                else if (t === "agscn") { ctx.scale(0.6, 0.6); tegnAgSCN(ctx, 0, 0, 0); }
                else { NK.kugle(ctx, 0, 0, 6.5, UDSEENDE[t].lys, UDSEENDE[t].moerk); }
                ctx.restore();
                NK.tekst(ctx, ETIKET[t], cx + 27, cy + 0.5, { font: "600 12px 'Segoe UI', sans-serif", linje: "middle", farve: "#cfd6de" });
                cx += bredder[i];
            });
        });
        ctx.restore();
    };
}());
