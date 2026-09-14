/* =====================================================================
   mikro.js - partikelniveauet i zoomboblen

   Hvert reagensglas har sin egen lille partikelmodel i en cirkel med
   radius 100 enheder. Oeverst hexanlaget, nederst vandfasen, med en
   graenseflade imellem. Modellen er ikke pynt: hvor mange Br2 der er i
   hvert lag, og hvor mange der er omdannet, kommer fra tallene i
   forsoeget (model.js), og bundfaldet paa scenen styres af, hvor mange
   AgBr der er dannet herinde.

   Bromvand:    Br2 svoemmer i vandet.
   Hexan:       hexanmolekyler i det oeverste lag. Naar der rystes,
                vandrer Br2 op over graensefladen.
   Lys:         fotoner (hν) kommer oppefra. Rammer lyset et Br2, spaltes
                det i to Br-atomer. Det ene saetter sig paa et hexan i
                stedet for et H-atom, det andet tager H-atomet med sig som
                HBr. HBr synker ned i vandfasen og afgiver H+ til et
                vandmolekyle: H3O+ og Br−.
   AgNO3:       Ag+ og NO3− falder ned gennem hexanen til vandfasen. Ag+
                finder Br− og danner AgBr, der synker til bunds. NO3− er
                tilskuerion.
   Moerke:      boblen er moerk, og der kommer ingen fotoner.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;
    var R = 100;
    var r = NK.r;

    var GRAENSE = 0;
    var VANDFLADE = -60;

    var RADIUS = { hexan: 13, bromhexan: 13, br2: 7, bra: 6.5, h: 3, hbr: 7, vand: 6, h3o: 7, br: 7.5, ag: 7, no3: 7, agbr: 10 };
    var FART = { hexan: 15, bromhexan: 15, br2: 24, bra: 30, h: 60, hbr: 22, vand: 18, h3o: 18, br: 18, ag: 26, no3: 20 };
    var FASE = { hexan: "hex", bromhexan: "hex", vand: "vand", h3o: "vand", br: "vand", ag: "vand", no3: "vand", agbr: "vand" };

    /* Pladserne til AgBr i bunden */
    var BUNDPLADS = [{ x: 0, y: 84 }, { x: -24, y: 82 }, { x: 24, y: 82 }, { x: -12, y: 66 }, { x: 12, y: 66 }, { x: -40, y: 68 }, { x: 40, y: 68 }, { x: 0, y: 50 }];

    NK.Mikro = function (navn) {
        this.navn = navn;
        this.nulstil();
    };

    var P = NK.Mikro.prototype;

    P.nulstil = function () {
        this.partikler = [];
        this.haendelser = [];
        this.blink = [];
        this.fotoner = [];
        this.brom = false;
        this.hexan = false;
        this.bund = 0;
        this.fotonUr = 0;
        this.s = { ryst: 0, lys: 0, moerke: false, brHex: 0, brVand: 0, nHex: 0, nVand: 0, nReageret: 0, stor: false };
    };

    P.ny = function (type, x, y, vx, vy, fase) {
        var p = { type: type, x: x, y: y, vx: vx || 0, vy: vy || 0, a: r(0, 6.28), va: r(-1.2, 1.2), rad: RADIUS[type], alfa: 0, fase: fase || FASE[type] || "vand" };
        this.partikler.push(p);
        return p;
    };

    P.fjern = function (p) {
        var i = this.partikler.indexOf(p);
        if (i >= 0) this.partikler.splice(i, 1);
    };

    P.antal = function (type, fase) {
        var n = 0;
        for (var i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            if (p.type === type && (fase === undefined || p.fase === fase)) n++;
        }
        return n;
    };

    /* Hvor maa en partikel i fasen vaere? */
    P.region = function (fase) {
        if (fase === "hex") return { y0: -88, y1: GRAENSE - 8 };
        return { y0: this.hexan ? GRAENSE + 8 : VANDFLADE + 8, y1: 92 };
    };

    P.plads = function (fase, rad) {
        var reg = this.region(fase);
        for (var n = 0; n < 40; n++) {
            var x = r(-76, 76), y = r(reg.y0, reg.y1);
            if (x * x + y * y < (R - (rad || 8) - 6) * (R - (rad || 8) - 6)) return { x: x, y: y };
        }
        return { x: 0, y: (reg.y0 + reg.y1) / 2 };
    };

    /* ----- Tilsaetninger ------------------------------------------------ */
    P.tilfoejBrom = function () {
        this.brom = true;
        for (var i = 0; i < M.MAENGDE.VAND; i++) {
            var q = this.plads("vand", 6);
            this.ny("vand", q.x, q.y, r(-15, 15), r(-15, 15));
        }
        for (i = 0; i < M.MAENGDE.BR2; i++) {
            var b = this.plads("vand", 7);
            this.ny("br2", b.x, b.y, r(-20, 20), r(-20, 20), "vand");
        }
    };

    P.tilfoejHexan = function () {
        this.hexan = true;
        for (var i = 0; i < M.MAENGDE.HEXAN; i++) {
            var q = this.plads("hex", 13);
            this.ny("hexan", q.x, q.y, r(-10, 10), r(-10, 10), "hex");
        }
        /* Vandet og bromen skubbes ned under graensefladen */
        var reg = this.region("vand");
        this.partikler.forEach(function (p) { if (p.fase === "vand" && p.y < reg.y0) p.y = r(reg.y0, reg.y1); });
    };

    P.tilfoejAgNO3 = function () {
        for (var i = 0; i < M.MAENGDE.AG_PR_DRAABE; i++) {
            var ag = this.ny("ag", r(-26, 26), -92 + r(-4, 4), r(-10, 10), r(55, 75), "vand");
            ag.falder = true;
            var no = this.ny("no3", r(-26, 26), -86 + r(-4, 4), r(-10, 10), r(45, 65), "vand");
            no.falder = true;
        }
    };

    P.toem = function () {
        this.nulstil();
    };

    /* ----- Til resten af animationen ------------------------------------ */
    P.agbrAndel = function () {
        return this.antal("agbr") / M.MAENGDE.BR2;
    };

    P.h3oAntal = function () {
        return this.antal("h3o");
    };

    P.brAntal = function () {
        return this.antal("br");
    };

    P.travl = function () {
        return this.haendelser.length > 0;
    };

    /* ----- Tidens gang --------------------------------------------------- */
    function naermeste(liste, p, filter) {
        var bedst = null, afst = Infinity;
        for (var i = 0; i < liste.length; i++) {
            var q = liste[i];
            if (q === p || !filter(q)) continue;
            var d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y);
            if (d < afst) { afst = d; bedst = q; }
        }
        return bedst;
    }

    function friBr(c) { return c.type === "br" && !c.laast; }
    function friVand(c) { return c.type === "vand" && !c.laast; }

    /* s = { ryst, lys, moerke, brHex, brVand, nHex, nVand, nReageret, stor }
       stor: den store visning. Saa gaar selve reaktionen langsommere, og
       der kommer flere fotoner. */
    P.opdater = function (dt, s) {
        this.s = s;
        var i, j, p, q;
        var liste = this.partikler;
        var ryst = s.ryst || 0;
        var lys = s.moerke ? 0 : (s.lys || 0);
        var mig = this;
        this.langsom = s.stor ? 2.2 : 1;

        /* Br2 fordeles mellem lagene efter modellen */
        if (this.hexan) {
            var iHex = 0, iVand = [];
            for (i = 0; i < liste.length; i++) {
                p = liste[i];
                if (p.type !== "br2" || p.laast) continue;
                if (p.fase === "hex" || p.skifter) iHex++; else iVand.push(p);
            }
            if (iHex < s.nHex && iVand.length) {
                iVand.sort(function (a, b) { return a.y - b.y; });
                var op = iVand[0];
                op.skifter = true;
                op.fase = "hex";
                op.vx = r(-10, 10);
                op.vy = -70;
            }
        }

        /* Reaktionen: saa mange Br2 skal vaere omdannet */
        var reageret = M.MAENGDE.BR2 - this.antal("br2");
        if (reageret < s.nReageret) {
            var kandidat = null;
            for (i = 0; i < liste.length; i++) {
                p = liste[i];
                if (p.type !== "br2" || p.laast || p.skifter) continue;
                if (!kandidat || (p.fase === "hex" && kandidat.fase !== "hex")) kandidat = p;
            }
            var hex = kandidat ? naermeste(liste, kandidat, function (c) { return c.type === "hexan" && !c.laast; }) : null;
            if (kandidat && hex) this.startSubstitution(kandidat, hex);
        }

        for (i = 0; i < liste.length; i++) {
            p = liste[i];
            p.alfa = Math.min(1, p.alfa + dt * 3);
            if (p.laast) continue;

            if (p.type === "agbr") {
                var bp = BUNDPLADS[p.plads % BUNDPLADS.length];
                p.x = NK.mod(p.x, bp.x, 2.2, dt);
                p.y = NK.mod(p.y, bp.y, 1.6, dt);
                continue;
            }
            var reg = this.region(p.fase);
            if (p.falder) {
                p.y += p.vy * dt;
                p.x += p.vx * dt;
                if (p.y >= reg.y0 + 4) { p.falder = false; p.vy = r(-10, 10); }
                continue;
            }
            if (p.skifter) {
                p.y += p.vy * dt;
                p.x += p.vx * dt;
                if (p.y <= reg.y1 - 4) { p.skifter = false; p.vy = r(-15, 15); }
                continue;
            }
            if (p.synker) {
                p.y += 48 * dt / (this.langsom || 1);
                p.x += p.vx * dt;
                var vandReg = this.region("vand");
                if (p.y >= vandReg.y0 + 4) { p.synker = false; p.fase = "vand"; p.vy = 10; }
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

            /* Ag+ soeger mod en fri Br−, HBr mod et vandmolekyle */
            var mod = null;
            if (p.type === "ag") mod = naermeste(liste, p, friBr);
            else if (p.type === "hbr" && p.fase === "vand") mod = naermeste(liste, p, friVand);
            if (mod) {
                var mx = mod.x - p.x, my = mod.y - p.y, md = Math.sqrt(mx * mx + my * my) || 1;
                p.vx += mx / md * 90 * dt;
                p.vy += my / md * 90 * dt;
                p.jagt = (p.jagt || 0) + dt;
            } else {
                p.jagt = 0;
            }
            if (ryst > 0.05) {
                p.vx += r(-1, 1) * 80 * ryst * dt;
                p.vy += r(-1, 1) * 80 * ryst * dt;
            }

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
            var pad = p.rad * 0.5;
            if (p.y < reg.y0 + pad) { p.y = NK.mod(p.y, reg.y0 + pad, 8, dt); if (p.vy < 0) p.vy = -p.vy; }
            if (p.y > reg.y1 - pad) { p.y = NK.mod(p.y, reg.y1 - pad, 8, dt); if (p.vy > 0) p.vy = -p.vy; }
        }

        /* Sammenstoed og reaktioner i vandfasen */
        for (i = 0; i < liste.length; i++) {
            p = liste[i];
            if (p.laast || p.falder || p.skifter || p.synker || p.type === "agbr" || p.type === "h") continue;

            /* Sikkerhedsnet: en Ag+ eller HBr, der har soegt sin partner i
               over 4 s uden at naa frem, reagerer med den naermeste. */
            if ((p.type === "ag" || (p.type === "hbr" && p.fase === "vand")) && p.jagt > 4) {
                var partner = naermeste(liste, p, p.type === "ag" ? friBr : friVand);
                if (partner) {
                    if (p.type === "ag") this.faeld(p, partner); else this.startSyre(p, partner);
                    i = -1;
                    continue;
                }
            }

            for (j = 0; j < liste.length; j++) {
                q = liste[j];
                if (q === p || q.laast || q.falder || q.skifter || q.synker || q.type === "agbr" || q.type === "h") continue;
                if (q.fase !== p.fase) continue;
                var dx = p.x - q.x, dy = p.y - q.y;
                var min = p.rad + q.rad + 0.5;
                var dd = dx * dx + dy * dy;
                if (dd >= min * min) continue;
                var afst = Math.sqrt(dd) || 0.01;
                var ux = dx / afst, uy = dy / afst;

                var ag = p.type === "ag" ? p : (q.type === "ag" ? q : null);
                var br = p.type === "br" ? p : (q.type === "br" ? q : null);
                if (ag && br) { this.faeld(ag, br); i = -1; break; }
                var hbr = p.type === "hbr" ? p : (q.type === "hbr" ? q : null);
                var vand = p.type === "vand" ? p : (q.type === "vand" ? q : null);
                if (hbr && vand && hbr.fase === "vand") { this.startSyre(hbr, vand); i = -1; break; }

                var skub = (min - afst) * 0.5;
                p.x += ux * skub;
                p.y += uy * skub;
                var vn2 = p.vx * ux + p.vy * uy;
                if (vn2 < 0) { p.vx -= 2 * vn2 * ux; p.vy -= 2 * vn2 * uy; }
            }
            if (i < 0) continue;
        }

        this.opdaterHaendelser(dt);

        /* Fotoner oppefra, naar der er lys */
        if (lys > 0.01 && this.hexan) {
            this.fotonUr -= dt * lys * (s.stor ? 9 : 5);
            if (this.fotonUr <= 0) {
                this.fotonUr = 1;
                this.fotoner.push({ x: r(-80, 80), y: -R - 10, vy: 130, liv: 1, maerke: Math.random() < 0.35 });
            }
        }
        for (i = this.fotoner.length - 1; i >= 0; i--) {
            var f = this.fotoner[i];
            f.y += f.vy * dt / (this.langsom || 1);
            if (f.y > GRAENSE - 10) f.liv -= dt * 4;
            if (f.liv <= 0 || f.y > R) this.fotoner.splice(i, 1);
        }

        for (i = this.blink.length - 1; i >= 0; i--) {
            this.blink[i].liv -= dt * 2.2;
            if (this.blink[i].liv <= 0) this.blink.splice(i, 1);
        }
        void mig;
    };

    /* Ag+ og Br− danner AgBr, der synker til bunds */
    P.faeld = function (ag, br) {
        var ab = this.ny("agbr", (ag.x + br.x) / 2, (ag.y + br.y) / 2, 0, 0, "vand");
        ab.alfa = 1;
        ab.plads = this.bund++;
        this.blink.push({ x: ab.x, y: ab.y, liv: 1, farve: "255, 240, 170" });
        this.fjern(ag);
        this.fjern(br);
        return true;
    };

    /* Br-atomernes pladser i et Br2-molekyle */
    function bromAtomer(m) {
        var c = Math.cos(m.a), s = Math.sin(m.a);
        return [{ x: m.x - c * 6, y: m.y - s * 6 }, { x: m.x + c * 6, y: m.y + s * 6 }];
    }

    /* Det sted paa hexanen, hvor Br saetter sig (andet C-atom) */
    function brPlads(hex) {
        var c = Math.cos(hex.a), s = Math.sin(hex.a);
        var lx = -7.5, ly = -8.5;
        return { x: hex.x + lx * c - ly * s, y: hex.y + lx * s + ly * c };
    }

    P.startSubstitution = function (br2, hex) {
        br2.laast = true;
        hex.laast = true;
        this.blink.push({ x: br2.x, y: br2.y, liv: 1, farve: "255, 230, 120" });
        this.haendelser.push({ type: "subst", br2: br2, hex: hex, t: 0, trin: 0 });
    };

    P.startSyre = function (hbr, vand) {
        hbr.laast = true;
        vand.laast = true;
        this.haendelser.push({ type: "syre", hbr: hbr, vand: vand, t: 0 });
    };

    P.opdaterHaendelser = function (dt) {
        var L = this.langsom || 1;
        for (var i = this.haendelser.length - 1; i >= 0; i--) {
            var h = this.haendelser[i];
            h.t += dt / L;
            if (h.type === "subst") {
                if (h.trin === 0) {
                    h.hex.a += h.hex.va * dt * 0.3;
                    if (h.t < 0.3) continue;
                    var at = bromAtomer(h.br2);
                    this.fjern(h.br2);
                    h.a = this.ny("bra", at[0].x, at[0].y, 0, 0, "hex");
                    h.b = this.ny("bra", at[1].x, at[1].y, r(-8, 8), r(-8, 8), "hex");
                    h.a.laast = true; h.b.laast = true;
                    h.a.alfa = 1; h.b.alfa = 1;
                    h.trin = 1;
                    h.t = 0;
                } else if (h.trin === 1) {
                    var mp = brPlads(h.hex);
                    h.a.x = NK.mod(h.a.x, mp.x, 6 / L, dt);
                    h.a.y = NK.mod(h.a.y, mp.y, 6 / L, dt);
                    h.b.x += h.b.vx * dt / L;
                    h.b.y += h.b.vy * dt / L;
                    if (Math.abs(h.a.x - mp.x) + Math.abs(h.a.y - mp.y) < 3 || h.t > 1.5) {
                        h.hex.type = "bromhexan";
                        this.fjern(h.a);
                        h.h = this.ny("h", mp.x + 4, mp.y - 4, 0, 0, "hex");
                        h.h.laast = true;
                        h.h.alfa = 1;
                        this.blink.push({ x: mp.x, y: mp.y, liv: 1, farve: "255, 200, 150" });
                        h.trin = 2;
                        h.t = 0;
                    }
                } else {
                    h.h.x = NK.mod(h.h.x, h.b.x + 7, 7 / L, dt);
                    h.h.y = NK.mod(h.h.y, h.b.y - 4, 7 / L, dt);
                    if (Math.abs(h.h.x - h.b.x - 7) + Math.abs(h.h.y - h.b.y + 4) < 2.5 || h.t > 1.5) {
                        this.fjern(h.h);
                        this.fjern(h.b);
                        var hbr = this.ny("hbr", h.b.x, h.b.y, r(-6, 6), 40, "hex");
                        hbr.alfa = 1;
                        hbr.synker = true;
                        h.hex.laast = false;
                        this.haendelser.splice(i, 1);
                    }
                }
            } else {
                /* HBr afgiver H+ til vand: H3O+ og Br− */
                h.hbr.x = NK.mod(h.hbr.x, h.vand.x + 9, 6 / L, dt);
                h.hbr.y = NK.mod(h.hbr.y, h.vand.y, 6 / L, dt);
                if (h.t > 0.45) {
                    var h3o = this.ny("h3o", h.vand.x, h.vand.y, r(-15, 15), r(-15, 15), "vand");
                    h3o.alfa = 1;
                    var br = this.ny("br", h.hbr.x + 6, h.hbr.y, r(10, 25), r(-15, 15), "vand");
                    br.alfa = 1;
                    this.blink.push({ x: h.vand.x + 4, y: h.vand.y, liv: 1, farve: "150, 210, 255" });
                    this.fjern(h.hbr);
                    this.fjern(h.vand);
                    this.haendelser.splice(i, 1);
                }
            }
        }
    };

    /* ================================================================
       TEGNING
       ================================================================ */
    var UDSEENDE = {
        br2:  { lys: "#ff9c70", moerk: "#8f2410", tekst: "#ffffff" },
        bra:  { lys: "#ff9c70", moerk: "#8f2410", tekst: "#ffffff" },
        br:   { lys: "#ffd9b8", moerk: "#b0552a", tekst: "#2e1204" },
        hbr:  { lys: "#ff9c70", moerk: "#8f2410", tekst: "#ffffff" },
        ag:   { lys: "#ffffff", moerk: "#8a949e", tekst: "#1a1d22" },
        no3:  { lys: "#dcebd0", moerk: "#6b8a5a", tekst: "#16210f" },
        agbr: { lys: "#fff6c4", moerk: "#bba64c", tekst: "#3a300a" },
        c:    { lys: "#b4bcc6", moerk: "#4a525c" },
        o:    { lys: "#ff9a90", moerk: "#b8332a" },
        h:    { lys: "#ffffff", moerk: "#aab4bf" }
    };

    var ETIKET = {
        br2: M.formel("Br2"), br: M.formel("Br-"), hbr: M.formel("HBr"), h3o: M.formel("H3O+"),
        ag: M.formel("Ag+"), no3: M.formel("NO3-"), agbr: M.formel("AgBr"),
        hexan: M.formel("C6H14"), bromhexan: M.formel("C6H13Br"), vand: M.formel("H2O"), lys: "Lys (hν)"
    };
    NK.Mikro.ETIKET = ETIKET;

    function etiket(ctx, tekst, x, y, farve, stoerrelse) {
        ctx.font = "700 " + stoerrelse + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = farve;
        ctx.fillText(tekst, x, y + 0.5);
    }

    /* Hexan som zigzag af seks C-atomer med H-atomer paa ydersiden.
       Bromhexan har et Br-atom paa det andet C-atom. */
    function tegnHexan(ctx, x, y, a, brom) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        var j, cx, cy;
        ctx.beginPath();
        for (j = 0; j < 6; j++) {
            cx = -12.5 + j * 5; cy = j % 2 ? -2.2 : 2.2;
            if (j === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = "#3a4048";
        ctx.lineWidth = 3.2;
        ctx.stroke();
        for (j = 0; j < 6; j++) {
            cx = -12.5 + j * 5; cy = j % 2 ? -2.2 : 2.2;
            var ud = j % 2 ? -1 : 1;
            var erBr = brom && j === 1;
            if (!erBr) NK.kugle(ctx, cx, cy + ud * 4.6, 1.7, UDSEENDE.h.lys, UDSEENDE.h.moerk);
            if (j === 0 || j === 5) NK.kugle(ctx, cx + (j === 0 ? -3.6 : 3.6), cy, 1.7, UDSEENDE.h.lys, UDSEENDE.h.moerk);
            NK.kugle(ctx, cx, cy, 3.3, UDSEENDE.c.lys, UDSEENDE.c.moerk);
        }
        if (brom) {
            NK.kugle(ctx, -7.5, -8.5, 5, UDSEENDE.br2.lys, UDSEENDE.br2.moerk);
            etiket(ctx, "Br", -7.5, -8.5, "#ffffff", 5.5);
        }
        ctx.restore();
    }

    function tegnVand(ctx, x, y, a, ekstra) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        NK.kugle(ctx, -4.2, 4, 2.6, UDSEENDE.h.lys, UDSEENDE.h.moerk);
        NK.kugle(ctx, 4.2, 4, 2.6, UDSEENDE.h.lys, UDSEENDE.h.moerk);
        if (ekstra) NK.kugle(ctx, 0, -5.2, 2.6, UDSEENDE.h.lys, UDSEENDE.h.moerk);
        NK.kugle(ctx, 0, 0, 4.3, UDSEENDE.o.lys, UDSEENDE.o.moerk);
        ctx.restore();
    }

    function tegnFoton(ctx, f) {
        ctx.save();
        ctx.globalAlpha = NK.klamp(f.liv, 0, 1) * 0.9;
        ctx.strokeStyle = "#ffe58a";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (var k = 0; k <= 8; k++) {
            var py = f.y - 18 + k * 2.25;
            var px = f.x + Math.sin(k * 1.6) * 2.6;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(f.x - 3, f.y - 3);
        ctx.lineTo(f.x, f.y + 1);
        ctx.lineTo(f.x + 3, f.y - 3);
        ctx.stroke();
        if (f.maerke) etiket(ctx, "hν", f.x + 8, f.y - 12, "#ffe58a", 7);
        ctx.restore();
    }

    function tegnPartikel(ctx, p) {
        var u = UDSEENDE[p.type];
        ctx.globalAlpha = NK.klamp(p.alfa, 0, 1);
        if (p.type === "hexan" || p.type === "bromhexan") {
            tegnHexan(ctx, p.x, p.y, p.a, p.type === "bromhexan");
        } else if (p.type === "br2") {
            var at = bromAtomer(p);
            NK.kugle(ctx, at[0].x, at[0].y, p.rad, u.lys, u.moerk);
            NK.kugle(ctx, at[1].x, at[1].y, p.rad, u.lys, u.moerk);
            etiket(ctx, ETIKET.br2, p.x, p.y, u.tekst, 7);
        } else if (p.type === "bra") {
            NK.kugle(ctx, p.x, p.y, p.rad, u.lys, u.moerk);
            etiket(ctx, "Br", p.x, p.y, u.tekst, 6.5);
        } else if (p.type === "h") {
            NK.kugle(ctx, p.x, p.y, p.rad, UDSEENDE.h.lys, UDSEENDE.h.moerk);
        } else if (p.type === "hbr") {
            NK.kugle(ctx, p.x + 7, p.y - 4, 3, UDSEENDE.h.lys, UDSEENDE.h.moerk);
            NK.kugle(ctx, p.x, p.y, 6.2, u.lys, u.moerk);
            etiket(ctx, ETIKET.hbr, p.x, p.y, u.tekst, 5.6);
        } else if (p.type === "vand") {
            tegnVand(ctx, p.x, p.y, p.a * 0.3, false);
        } else if (p.type === "h3o") {
            tegnVand(ctx, p.x, p.y, p.a * 0.3, true);
            etiket(ctx, ETIKET.h3o, p.x, p.y + 11, "#dfe9f5", 6);
        } else if (p.type === "agbr") {
            NK.kugle(ctx, p.x + 5, p.y, 8.5, u.lys, u.moerk);
            NK.kugle(ctx, p.x - 6, p.y, 6.5, "#ffffff", "#a4acb4");
            etiket(ctx, ETIKET.agbr, p.x - 1, p.y + 0.5, u.tekst, 6);
        } else {
            NK.kugle(ctx, p.x, p.y, p.rad, u.lys, u.moerk);
            etiket(ctx, ETIKET[p.type], p.x, p.y, u.tekst, p.type === "no3" ? 5.6 : 6.8);
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

        /* Lagene */
        var boelge = (s.ryst || 0) * 4;
        if (this.hexan) {
            ctx.fillStyle = "rgba(200, 215, 230, 0.1)";
            ctx.fillRect(-R, -R, 2 * R, R + GRAENSE);
            ctx.fillStyle = "rgba(232, 96, 18, " + (0.4 * NK.klamp(s.brHex || 0, 0, 1)).toFixed(3) + ")";
            ctx.fillRect(-R, -R, 2 * R, R + GRAENSE);
        }
        var ov = this.hexan ? GRAENSE : VANDFLADE;
        if (this.brom) {
            ctx.fillStyle = "rgba(90, 160, 220, 0.16)";
            ctx.fillRect(-R, ov, 2 * R, R - ov);
            ctx.fillStyle = "rgba(222, 118, 28, " + (0.4 * NK.klamp(s.brVand || 0, 0, 1)).toFixed(3) + ")";
            ctx.fillRect(-R, ov, 2 * R, R - ov);
            ctx.strokeStyle = "rgba(220, 235, 250, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (var x = -R; x <= R; x += 5) {
                var y = ov + Math.sin(x * 0.11 + tid * 9) * boelge;
                if (x === -R) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        for (i = 0; i < this.fotoner.length; i++) tegnFoton(ctx, this.fotoner[i]);

        for (i = 0; i < this.partikler.length; i++) {
            p = this.partikler[i];
            if (p.type === "hexan" || p.type === "bromhexan") tegnPartikel(ctx, p);
        }
        for (i = 0; i < this.partikler.length; i++) {
            p = this.partikler[i];
            if (p.type !== "hexan" && p.type !== "bromhexan") tegnPartikel(ctx, p);
        }

        for (i = 0; i < this.blink.length; i++) {
            var bl = this.blink[i];
            NK.skaer(ctx, bl.x, bl.y, 14 + 12 * (1 - bl.liv), "rgba(" + bl.farve + ", 0.9)", bl.liv * 0.9);
        }

        if (s.moerke) {
            ctx.fillStyle = "rgba(4, 6, 12, 0.6)";
            ctx.fillRect(-R, -R, 2 * R, 2 * R);
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
            ctx.font = "700 11px 'Segoe UI', sans-serif";
            var bredde = ctx.measureText(titel).width + 16;
            ctx.fillStyle = "rgba(20, 22, 28, 0.92)";
            NK.rundtRekt(ctx, -bredde / 2, -b.r - 10, bredde, 19, 9.5);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.lineWidth = 1;
            ctx.stroke();
            NK.tekst(ctx, titel, 0, -b.r - 0.5, { font: "700 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#dfe5ec" });
        }
        this.tegnForklaring(ctx, 0, b.r + 16);
        ctx.restore();
    };

    /* De partikeltyper, der kan ses lige nu */
    P.typer = function () {
        var ud = [], set = {};
        var orden = ["hexan", "bromhexan", "br2", "hbr", "vand", "h3o", "br", "ag", "no3", "agbr"];
        for (var i = 0; i < this.partikler.length; i++) set[this.partikler[i].type] = true;
        orden.forEach(function (t) { if (set[t]) ud.push(t); });
        return ud;
    };

    P.tegnForklaring = function (ctx, x, y) {
        var typer = this.typer();
        if (!typer.length) return;
        ctx.save();
        ctx.font = "600 10px 'Segoe UI', sans-serif";
        var bredder = typer.map(function (t) { return ctx.measureText(ETIKET[t]).width + 30; });
        var raekker = [[]], rb = [0];
        typer.forEach(function (t, i) {
            var n = raekker.length - 1;
            if (rb[n] + bredder[i] > 236 && raekker[n].length) { raekker.push([]); rb.push(0); n++; }
            raekker[n].push(i);
            rb[n] += bredder[i];
        });
        var h = raekker.length * 18 + 6;
        var maks = Math.max.apply(null, rb) + 12;
        ctx.fillStyle = "rgba(20, 22, 28, 0.85)";
        NK.rundtRekt(ctx, x - maks / 2, y, maks, h, 9);
        ctx.fill();
        raekker.forEach(function (rk, ri) {
            var cx = x - rb[ri] / 2;
            var cy = y + 12 + ri * 18;
            rk.forEach(function (i) {
                var t = typer[i];
                var ix = cx + 11;
                ctx.save();
                ctx.translate(ix, cy);
                if (t === "hexan" || t === "bromhexan") { ctx.scale(0.55, 0.55); tegnHexan(ctx, 0, 0, 0, t === "bromhexan"); }
                else if (t === "br2") { ctx.scale(0.6, 0.6); NK.kugle(ctx, -6, 0, 7, UDSEENDE.br2.lys, UDSEENDE.br2.moerk); NK.kugle(ctx, 6, 0, 7, UDSEENDE.br2.lys, UDSEENDE.br2.moerk); }
                else if (t === "hbr") { ctx.scale(0.7, 0.7); NK.kugle(ctx, 6, -4, 3, UDSEENDE.h.lys, UDSEENDE.h.moerk); NK.kugle(ctx, 0, 0, 6, UDSEENDE.hbr.lys, UDSEENDE.hbr.moerk); }
                else if (t === "vand") { ctx.scale(0.8, 0.8); tegnVand(ctx, 0, -1, 0, false); }
                else if (t === "h3o") { ctx.scale(0.8, 0.8); tegnVand(ctx, 0, 0, 0, true); }
                else if (t === "agbr") { ctx.scale(0.6, 0.6); NK.kugle(ctx, 4, 0, 8, UDSEENDE.agbr.lys, UDSEENDE.agbr.moerk); NK.kugle(ctx, -6, 0, 6, "#ffffff", "#a4acb4"); }
                else if (t === "lys") { tegnFoton(ctx, { x: 0, y: 8, liv: 1, maerke: false }); }
                else NK.kugle(ctx, 0, 0, 5, UDSEENDE[t].lys, UDSEENDE[t].moerk);
                ctx.restore();
                NK.tekst(ctx, ETIKET[t], cx + 22, cy + 0.5, { font: "600 10px 'Segoe UI', sans-serif", linje: "middle", farve: "#cfd6de" });
                cx += bredder[i];
            });
        });
        ctx.restore();
    };
}());
