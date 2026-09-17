/* =====================================================================
   mikro.js - partikelniveauet i zoomboblen

   Boblen viser den valgte beholder i en cirkel med radius 100 enheder.
   Hvor mange partikler der skal vaere af hver slags, kommer fra
   oploesningen i model.js (mikroMaal). Boblen afstemmer sig selv mod de
   tal, én haendelse ad gangen:

     Fe3+ og SCN- finder hinanden og danner FeSCN2+      (bind)
     FeSCN2+ gaar i stykker til Fe3+ og SCN-             (split)
     Ag+ finder SCN- og danner AgSCN, der synker         (faeld)
     C6H8O6 finder to Fe3+ og goer dem til Fe2+          (reduk)

   Hver partikel er én kugle med formlen paa: en sammensat ion som SCN⁻
   eller FeSCN²⁺ er én kugle, ikke flere atomer, der sidder sammen. Det er
   boblen, der er stor (S.BOBLE), ikke kuglerne, saa der er plads til
   mange. Lange navne staar forkortet paa kuglen og forklares i legenden
   nederst i boblen.

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

    var TYPER = ["fe", "scn", "fescn", "fe2", "vitc", "ag", "agscn", "farvestof", "vand"];
    /* Kuglerne er smaa i forhold til boblen, saa der er plads til mange.
       Selve boblen er stor (S.BOBLE), og det er den, der goer formlerne
       laeselige. Lange navne forkortes og forklares i legenden. */
    var RADIUS = { fe: 7, scn: 8, fescn: 12, fe2: 7, vitc: 10, ag: 6, agscn: 9, farvestof: 7.5, vand: 3.5 };
    var FART = { fe: 22, scn: 26, fescn: 16, fe2: 22, vitc: 18, ag: 28, agscn: 0, farvestof: 14, vand: 16 };

    /* Pladserne til AgSCN i bunden */
    var BUNDPLADS = [
        { x: 0, y: 78 }, { x: -19, y: 78 }, { x: 19, y: 78 }, { x: -37, y: 74 }, { x: 37, y: 74 },
        { x: 0, y: 60 }, { x: -19, y: 60 }, { x: 19, y: 60 }, { x: -38, y: 56 }, { x: 38, y: 56 },
        { x: -9.5, y: 42 }, { x: 9.5, y: 42 }, { x: -28, y: 42 }, { x: 28, y: 42 }
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
        var c = {};
        TYPER.forEach(function (t) { c[t] = 0; });
        this.partikler.forEach(function (p) { if (!p.laast && !p.fjernes) c[p.type]++; });
        this.haendelser.forEach(function (h) {
            if (h.type === "bind") c.fescn++;
            else if (h.type === "split") { c.fe++; c.scn++; }
            else if (h.type === "faeld") c.agscn++;
            else if (h.type === "reduk") c.fe2++;
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

    /* En partikel falder ned oppefra */
    P.spawn = function (type) {
        var p = this.ny(type, r(-55, 55), -R - 14, r(-12, 12), r(80, 105));
        p.falder = true;
        p.alfa = 1;
        this.spawnUr = 0.09;
        return p;
    };

    P.forsvind = function (type) {
        var liste = this.partikler.filter(function (p) { return p.type === type && !p.laast && !p.fjernes; });
        if (!liste.length) return false;
        liste[Math.floor(Math.random() * liste.length)].fjernes = true;
        return true;
    };

    P.omdan = function (fra, til, farve) {
        var p = this.find(fra);
        if (!p) return false;
        p.type = til;
        p.rad = RADIUS[til];
        this.blink.push({ x: p.x, y: p.y, liv: 1, farve: farve || "255, 230, 150" });
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
        var mig = this;
        this.spawnUr -= dt;
        this.evUr -= dt;

        function klar() { return mig.spawnUr <= 0; }

        if (c.vand < m.vand) {
            var q = this.plads(6);
            this.ny("vand", q.x, q.y, r(-10, 10), r(-10, 10));
        } else if (c.vand > m.vand) {
            this.forsvind("vand");
        }

        if (c.farvestof < m.farvestof && klar()) { this.spawn("farvestof"); c = this.telle(); }
        else if (c.farvestof > m.farvestof) { this.forsvind("farvestof"); c = this.telle(); }

        var agMangler = m.agscn - c.agscn;
        var redMangler = m.fe2 - c.fe2;

        /* Ascorbinsyre */
        if (c.vitc < m.vitc && klar()) { this.spawn("vitc"); c = this.telle(); }
        else if (c.vitc > m.vitc && redMangler <= 0) { this.forsvind("vitc"); c = this.telle(); }

        /* Jern(III) i alt */
        var cFe = c.fe + c.fescn, tFe = m.fe + m.fescn;
        if (cFe < tFe && klar()) { this.spawn("fe"); c = this.telle(); }
        else if (cFe > tFe && redMangler <= 0) { if (!this.forsvind("fe")) this.omdan("fescn", "scn"); c = this.telle(); }

        /* Jern(II) */
        if (c.fe2 > m.fe2) { this.forsvind("fe2"); c = this.telle(); }
        else if (redMangler > 0 && c.fe + c.fescn === 0 && klar()) { this.spawn("fe2"); c = this.telle(); }

        /* Thiocyanat i alt (det faeldede taeller ikke med) */
        var cAgAlt = c.ag + c.agscn, tAgAlt = m.ag + m.agscn;
        var cS = c.scn + c.fescn, tS = m.scn + m.fescn;
        var ventAg = agMangler > 0 && (c.ag > 0 || cAgAlt < tAgAlt);
        if (cS < tS && klar()) { this.spawn("scn"); c = this.telle(); }
        else if (cS > tS && !ventAg) { if (!this.forsvind("scn")) this.omdan("fescn", "fe"); c = this.telle(); }

        /* Soelv i alt */
        cAgAlt = c.ag + c.agscn;
        if (cAgAlt < tAgAlt && klar()) { this.spawn("ag"); c = this.telle(); }
        else if (cAgAlt > tAgAlt) { if (!this.forsvind("ag")) this.forsvind("agscn"); c = this.telle(); }

        if (this.haendelser.length >= 3 || this.evUr > 0) return;

        /* Reduktion: ascorbinsyren finder Fe3+. Er der kun komplekser, gaar
           et af dem i stykker foerst. */
        redMangler = m.fe2 - c.fe2;
        if (redMangler > 0 && c.fe + c.fescn > 0) {
            var v = this.find("vitc");
            var jern = v ? this.naermeste(v, "fe") : this.find("fe");
            if (v && jern) { this.startReduk(v, jern); this.evUr = 0.2; return; }
            if (!jern) {
                var k0 = this.find("fescn");
                if (k0) { this.startSplit(k0); this.evUr = 0.25; return; }
            } else if (!v) {
                this.omdan("fe", "fe2", "170, 240, 170");
                this.evUr = 0.2;
                return;
            }
        }

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

    P.startReduk = function (v, fe) {
        v.laast = true;
        fe.laast = true;
        this.haendelser.push({ type: "reduk", v: v, a: fe, t: 0, trin: 0 });
    };

    function naermer(a, b, fart, dt) {
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        var skridt = Math.min(fart * dt, d / 2);
        a.x += dx / d * skridt;
        a.y += dy / d * skridt;
        b.x -= dx / d * skridt;
        b.y -= dy / d * skridt;
        return d;
    }

    P.opdaterHaendelser = function (dt) {
        for (var i = this.haendelser.length - 1; i >= 0; i--) {
            var h = this.haendelser[i];
            h.t += dt;
            if (h.type === "bind" || h.type === "faeld") {
                var a = h.a, b = h.b;
                var dx = b.x - a.x, dy = b.y - a.y;
                var d = naermer(a, b, 85, dt);
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
            } else if (h.type === "reduk") {
                var dv = naermer(h.v, h.a, 90, dt);
                if (dv < h.v.rad + h.a.rad - 5 || h.t > 2.2) {
                    h.a.type = "fe2";
                    h.a.rad = RADIUS.fe2;
                    h.a.laast = false;
                    this.blink.push({ x: h.a.x, y: h.a.y, liv: 1, farve: "170, 240, 170" });
                    h.trin++;
                    var andet = h.trin < 2 ? this.naermeste(h.v, "fe") : null;
                    if (andet) {
                        andet.laast = true;
                        h.a = andet;
                        h.t = 0;
                    } else {
                        h.v.laast = false;
                        h.v.fjernes = true;
                        this.haendelser.splice(i, 1);
                    }
                }
            } else {
                h.k.x += Math.sin(h.t * 70) * 0.5;
                if (h.t > 0.35) {
                    var kk = h.k, c = Math.cos(kk.a), s = Math.sin(kk.a);
                    this.fjern(kk);
                    var fe = this.ny("fe", kk.x - c * 9, kk.y - s * 9, -c * 45, -s * 45);
                    var sc = this.ny("scn", kk.x + c * 10, kk.y + s * 10, c * 45, s * 45);
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
        fe:        { lys: "#ffd98a", moerk: "#a4610f" },
        fescn:     { lys: "#ff9c72", moerk: "#8d2410" },
        fe2:       { lys: "#dcf2c9", moerk: "#5f8a48", tekst: "#2c3a22" },
        scn:       { lys: "#cadcff", moerk: "#2f4e8c" },
        vitc:      { lys: "#ffdd84", moerk: "#8a6a0a" },
        ag:        { lys: "#e8edf2", moerk: "#6b7580" },
        agscn:     { lys: "#e6eaee", moerk: "#828b93" },
        farvestof: { lys: "#8fb6ff", moerk: "#1f4fa8" },
        o:         { lys: "#ff9a90", moerk: "#b8332a" },
        h:         { lys: "#ffffff", moerk: "#aab4bf" }
    };

    var ETIKET = {
        fe: M.formel("Fe3+"), scn: M.formel("SCN-"), fescn: M.formel("FeSCN2+"), fe2: M.formel("Fe2+"),
        vitc: M.formel("C6H8O6"), ag: M.formel("Ag+"), agscn: M.formel("AgSCN"), farvestof: "farvestof",
        vand: M.formel("H2O")
    };
    NK.Mikro.ETIKET = ETIKET;

    /* Navne, der er for lange til kuglen, forkortes, og legenden nederst i
       boblen siger, hvad forkortelsen daekker */
    var KORT = { vitc: "Asc", farvestof: "F" };
    var LEGENDE = { vitc: "ascorbinsyre, " + M.formel("C6H8O6"), farvestof: "farvestof i frugtfarven" };
    NK.Mikro.KORT = KORT;
    NK.Mikro.LEGENDE = LEGENDE;

    /* Den stoerste skrift, formlen kan staa med paa kuglen. Regnes én gang
       pr. slags og gemmes. */
    var SKRIFT = {};
    function skriftMaal(ctx, type) {
        if (SKRIFT[type]) return SKRIFT[type];
        var tekst = KORT[type] || ETIKET[type], str = RADIUS[type] * 0.95;
        for (var n = 0; n < 8 && str > 6; n++) {
            ctx.font = "800 " + str.toFixed(1) + "px 'Segoe UI', sans-serif";
            if (ctx.measureText(tekst).width <= RADIUS[type] * 1.85) break;
            str *= 0.88;
        }
        SKRIFT[type] = { tekst: tekst, str: str };
        return SKRIFT[type];
    }

    function etiket(ctx, tekst, x, y, farve, stoerrelse) {
        ctx.font = "800 " + stoerrelse + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = Math.max(1.4, stoerrelse * 0.3);
        ctx.strokeStyle = "rgba(10, 12, 18, 0.5)";
        ctx.lineJoin = "round";
        ctx.strokeText(tekst, x, y + 0.5);
        ctx.fillStyle = farve;
        ctx.fillText(tekst, x, y + 0.5);
    }

    /* Én kugle med formlen paa. Sammensatte ioner er ikke flere kugler,
       der sidder sammen, men én med hele formlen. */
    function tegnKugle(ctx, p) {
        var u = UDSEENDE[p.type];
        var s = skriftMaal(ctx, p.type);
        NK.kugle(ctx, p.x, p.y, p.rad, u.lys, u.moerk);
        etiket(ctx, s.tekst, p.x, p.y, "#ffffff", s.str);
    }

    /* Bundfaldet: samme kugle med en lys kant, saa det ses, at det er fast */
    function tegnFast(ctx, p) {
        tegnKugle(ctx, p);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2);
        ctx.stroke();
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

    function tegnPartikel(ctx, p) {
        ctx.globalAlpha = NK.klamp(p.alfa, 0, 1) * (p.type === "vand" ? 0.45 : 1);
        if (p.type === "vand") tegnVand(ctx, p.x, p.y, p.a * 0.3);
        else if (p.type === "agscn") tegnFast(ctx, p);
        else {
            /* Komplekset er det roede, og det skal ses */
            if (p.type === "fescn") NK.skaer(ctx, p.x, p.y, p.rad + 10, "rgba(235, 60, 35, 0.55)", 0.75);
            tegnKugle(ctx, p);
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
        for (i = 0; i < this.partikler.length; i++) {
            p = this.partikler[i];
            if (p.type !== "vand") tegnPartikel(ctx, p);
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
        this.tegnLegende(ctx, b);
        ctx.restore();
    };

    /* De partikeltyper, der kan ses lige nu */
    P.typer = function () {
        var ud = [], set = {};
        for (var i = 0; i < this.partikler.length; i++) set[this.partikler[i].type] = true;
        TYPER.forEach(function (t) { if (set[t]) ud.push(t); });
        return ud;
    };

    /* Formlen staar paa kuglen. Legenden nederst i boblen siger kun, hvad
       de forkortede navne daekker over. */
    P.tegnLegende = function (ctx, b) {
        var linjer = this.typer().filter(function (t) { return !!KORT[t]; })
            .map(function (t) { return KORT[t] + " = " + LEGENDE[t]; });
        if (!linjer.length) return;
        var h = linjer.length * 17 + 10;
        var y0 = b.r * 0.72;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 3, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "rgba(10, 12, 18, 0.72)";
        ctx.fillRect(-b.r, y0, 2 * b.r, h);
        linjer.forEach(function (t, i) {
            NK.tekst(ctx, t, 0, y0 + 14 + i * 17, { font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#dfe5ec" });
        });
        ctx.restore();
    };
}());
