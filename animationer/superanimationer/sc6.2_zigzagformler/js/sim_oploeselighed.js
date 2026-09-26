/* =====================================================================
   sim_oploeselighed.js - fane 5: opløselighed (den gamle 6.5)

   Et spil med en bunke paa 15 molekyler: fem lette, fem middel og fem
   svaere. Molekylet staar paa tavlen. Eleven traekker det ned i
   baegerglasset, i heptan (oeverst) eller vand (nederst), eller klikker
   paa et af lagene.
     rigtigt   molekylet bliver i laget
     forkert   det flytter selv over i det rigtige lag, og et liv er vaek
     praecis 4 C pr. polaer gruppe: begge svar taeller, og molekylet
               laegger sig i graensen mellem lagene med de polaere
               grupper nede i vandet
   Efter svaret bliver de polaere grupper blaa og carbonkaeden brun, og
   C-atomerne faar numre, saa regnestykket i panelet kan tjekkes paa
   tegningen.

   Opgavekortet har én knap: Giv hint -> Vis svaret -> Naeste molekyle.
   Point: 100 for et rigtigt svar, 70 med hint, 0 for et vist svar. Tre
   liv. Rekorden huskes i browseren. Molekylerne og reglen staar i
   oploeselighed.js; tegningen er motorens (struktur.js), og knappen
   Zigzag / Alle atomer skifter mellem de to maader at tegne paa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var OP = NK.Oploes;

    var BLAA = "#1f63c7", BRUN = "#a8620f", GROEN = "#2f8f5b", ROED = "#c8473a", GUL = "#d9a520";
    var LIV = 3;
    var POINT = { selv: 100, hint: 70 };
    var NOEGLE_REKORD = "nk-sc6.2-oploeselighed-rekord";

    var LAG = {
        heptan: { navn: "heptan", under: "upolær", fyld: "rgba(246, 205, 92, 0.30)", lys: "rgba(246, 205, 92, 0.58)",
            kant: "#c48a12", tekst: "#7a4f00", flade: "rgba(196, 138, 18, 0.6)" },
        vand: { navn: "vand", under: "polær", fyld: "rgba(92, 168, 232, 0.26)", lys: "rgba(92, 168, 232, 0.52)",
            kant: "#2f7fc4", tekst: "#1b5a92", flade: "rgba(60, 110, 160, 0.65)" }
    };

    function SimOploes() {
        this.stil = "zigzag";
        this.sete = {};
        this.rekord = NK.hent(NOEGLE_REKORD, 0) || 0;
        this.nyRekord = false;
        this.partikler = [];
        this.geoCache = {};
        this.harTrukket = false;
        this.startFane();
        this.braet.laast = true;
        this.bygPanel();
        this.nytSpil();
    }

    var P = SimOploes.prototype;
    NK.Fane.bland(P, "op");

    /* Tegnebraettet bruges ikke: musen gaar til musKrog */
    P.regler = function () { return { kunC: true, maks: function () { return 0; } }; };
    P.aendret = function () {};
    P.fortryd = function () { return false; };
    P.gentag = function () { return false; };
    P.nulstil = function () {};
    P.fokus = function () {};

    /* ----- Spillet -------------------------------------------------------------- */
    P.nytSpil = function () {
        var mig = this;
        if (this.bunke) {
            this.bunke.forEach(function (m) { mig.sete[m.navn] = true; });
            if (Object.keys(this.sete).length >= OP.MOLEKYLER.length) {
                this.sete = {};
                this.bunke.forEach(function (m) { mig.sete[m.navn] = true; });
            }
        }
        this.bunke = OP.bunke(this.sete);
        this.res = this.bunke.map(function () { return 0; });   /* 1 rigtigt, 2 vist, 3 forkert */
        this.valgte = this.bunke.map(function () { return null; });
        this.nr = 0;
        this.point = 0;
        this.liv = LIV;
        this.slut = null;
        this.nyRekord = false;
        this.mini = -1;
        this.startMolekyle();
    };

    P.startMolekyle = function () {
        this.m = this.bunke[this.nr];
        this.hjaelp = 0;
        this.svaret = false;
        this.farver = 0;          /* 0 ingen, 1 de polaere grupper (hint), 2 alt (svaret) */
        this.maerke = null;
        this.efter = null;
        this.overLag = null;
        this.klikLag = null;
        this.geoCache = {};
        this.m.rotGraense = graenseVinkel(this.m);
        this.fig = { sted: "tavle", x: 0, y: 0, s: 0.3, rot: 0, fart: 12, traek: false, ny: true };
        if (this.zoner) this.molSkala = this.beregnSkala();
        this.besked("", "");
        NK.saetHTML("op-regn", "");
        this.visPanel();
    };

    P.knap = function () {
        if (this.slut) { this.nytSpil(); return; }
        if (this.svaret) { this.naeste(); return; }
        if (this.hjaelp === 0) { this.giveHint(); return; }
        this.visSvaret();
    };

    P.enter = function () { if (this.svaret || this.slut) this.knap(); };

    P.naeste = function () {
        if (this.nr >= this.bunke.length - 1) return;
        /* Det gamle molekyle toner ud i glasset, mens det nye kommer frem */
        var f = this.fig;
        this.spoegelse = { g: this.geo(f.rot), x: f.x, y: f.y, s: f.s, t: 0 };
        this.nr++;
        this.startMolekyle();
    };

    P.giveHint = function () {
        this.hjaelp = 1;
        this.farver = 1;
        if (!this.m.grupper.length) {
            this.besked("<b>Hint:</b> Kig efter polære grupper: OH, COOH og O i kæden. Er der ingen, er molekylet upolært.", "gul");
        } else {
            this.besked("<b>Hint:</b> De blå grupper er polære. Tæl C-atomerne, og del med antallet af blå grupper. Under 4: vand. Over 4: heptan.", "gul");
        }
        this.visPanel();
    };

    /* Eleven har valgt et lag */
    P.vaelg = function (lag) {
        if (this.svaret || this.slut) return;
        var m = this.m, f = this.fig;
        var rigtigt = m.svar === "begge" || m.svar === lag;
        this.svaret = true;
        this.farver = 2;
        this.valgte[this.nr] = lag;
        f.traek = false;
        f.sted = lag;
        f.fart = 10;
        this.maerke = { slags: rigtigt ? (m.svar === "begge" ? "graense" : "ok") : "fejl", t: 0 };
        if (rigtigt) {
            var p = this.hjaelp ? POINT.hint : POINT.selv;
            this.point += p;
            this.res[this.nr] = 1;
            this.konfetti(false);
            if (this.afvisTilbud) this.afvisTilbud();
            if (m.svar === "begge") {
                this.efter = { sted: "graense", vent: 0.9 };
                this.toast("Lige på grænsen. Begge svar tæller.", "advar");
                this.besked("<b>Rigtigt. +" + p + " point.</b> Molekylet lægger sig i grænsen mellem lagene.", "god");
            } else {
                this.toast("Rigtigt: " + LAG[lag].navn + ".", "god");
                this.besked("<b>Rigtigt. +" + p + " point.</b>" + (this.hjaelp ? " (med hint)" : ""), "god");
            }
        } else {
            this.liv--;
            this.res[this.nr] = 3;
            this.efter = { sted: m.svar, vent: 1.0 };
            this.toast("Forkert. Det opløses i " + LAG[m.svar].navn + ".", "fejl");
            this.besked("<b>Forkert.</b> " + OP.fejlBesked(m, lag) + " Et liv mindre.", "skidt");
        }
        NK.saetHTML("op-regn", OP.regnestykke(m));
        this.tjekSlut();
        this.visPanel();
    };

    P.visSvaret = function () {
        var m = this.m, f = this.fig;
        this.svaret = true;
        this.farver = 2;
        this.res[this.nr] = 2;
        f.traek = false;
        f.sted = m.svar === "begge" ? "graense" : m.svar;
        f.fart = 4;
        this.besked("Svaret: " + (m.svar === "begge" ? "lidt i begge lag." : "det opløses i " + LAG[m.svar].navn + ".") + " Ingen point.", "gul");
        NK.saetHTML("op-regn", OP.regnestykke(m));
        this.tjekSlut();
        this.visPanel();
    };

    P.tjekSlut = function () {
        if (this.liv <= 0) this.slut = "tabt";
        else if (this.res.every(function (s) { return s > 0; })) this.slut = "vundet";
        if (!this.slut) return;
        if (this.point > this.rekord) {
            this.rekord = this.point;
            this.nyRekord = true;
            NK.gem(NOEGLE_REKORD, this.rekord);
        }
        var fejl = [], mig = this;
        this.res.forEach(function (s, i) { if (s === 3) fejl.push(mig.bunke[i].navn); });
        var e = NK.el("op-besked");
        if (this.slut === "tabt") {
            e.innerHTML += " <b>Ingen liv tilbage.</b> Klik på de røde prikker for at se fejlene.";
            return;
        }
        var vist = this.res.filter(function (s) { return s === 2; }).length;
        if (vist <= 3) this.konfetti(true);
        if (this.laererFaerdig) this.laererFaerdig(vist <= 3 ? D.ROS.oploes : D.ROS.oploesVist);
        e.innerHTML += " <b>Hele bunken er sorteret.</b>" + (fejl.length ? " Klik på de røde prikker for at se fejlene." : "");
    };

    /* ----- Tegningen af molekylet ------------------------------------------------ */
    function roteret(mol, v) {
        var k = mol.kopi(), c = Math.cos(v), s = Math.sin(v);
        k.atomer.forEach(function (a) {
            var x = a.x, y = a.y;
            a.x = x * c - y * s;
            a.y = x * s + y * c;
        });
        return k;
    }

    /* Drejningen, der vender de polaere grupper ned i vandet, naar molekylet
       ligger i graensen. Ligger de midt paa molekylet, drejes det ikke. */
    function graenseVinkel(m) {
        var px = 0, py = 0, np = 0, cx = 0, cy = 0, nc = 0;
        m.mol.atomer.forEach(function (a) {
            if (m.polaer[a.id]) { px += a.x; py += a.y; np++; }
            else if (a.el === "C") { cx += a.x; cy += a.y; nc++; }
        });
        if (!np || !nc) return 0;
        var vx = px / np - cx / nc, vy = py / np - cy / nc;
        if (Math.hypot(vx, vy) < 0.8) return 0;
        var v = Math.PI / 2 - Math.atan2(vy, vx);
        while (v > Math.PI) v -= 2 * Math.PI;
        while (v <= -Math.PI) v += 2 * Math.PI;
        return v;
    }

    P.strukturValg = function (skala) {
        var m = this.m, f = this.farver;
        return farveValg(m, f, { skala: skala || this.molSkala, stil: this.stil, farve: "#1d2433" });
    };

    function farveValg(m, f, v) {
        var polaer = m.polaer, mol = m.mol;
        if (f >= 1) {
            v.atomFarve = function (id) { return polaer[id] ? BLAA : null; };
            v.bindingFarve = function (bd) {
                var ea = mol.atom(bd.a).el, eb = mol.atom(bd.b).el;
                if (polaer[bd.a] && polaer[bd.b]) return BLAA;
                if ((polaer[bd.a] || polaer[bd.b]) && (ea !== "C" || eb !== "C")) return BLAA;
                if (f >= 2 && ea === "C" && eb === "C") return BRUN;
                return null;
            };
        }
        if (f >= 2 && v.lokanter !== false) {
            v.lokanter = {};
            m.cIds.forEach(function (id, i) { v.lokanter[id] = i + 1; });
            v.lokantFarve = "#7a6545";
        } else delete v.lokanter;
        return v;
    }

    /* Geometrien i pixels ved molSkala, drejet v radianer (gemt, saa den
       kun regnes én gang pr. drejning) */
    P.geo = function (v) {
        v = Math.round((v || 0) * 50) / 50;
        var k = [this.molSkala.toFixed(2), this.stil, this.farver, v].join("|");
        var c = this.geoCache;
        if (c[k]) return c[k];
        if (Object.keys(c).length > 80) c = this.geoCache = {};
        var mol = v ? roteret(this.m.mol, v) : this.m.mol;
        var g = NK.Struktur.geometri(mol, this.strukturValg());
        g.mol = mol;
        c[k] = g;
        return g;
    };

    /* Den stoerste skala, hvor molekylet kan staa paa tavlen over glasset */
    P.beregnSkala = function () {
        var z = this.zoner, s0 = this.skala();
        var g = NK.Struktur.geometri(this.m.mol, farveValg(this.m, 2, { skala: s0, stil: this.stil }));
        var b = g.x1 - g.x0 + 8, h = g.y1 - g.y0 + 8;
        var k = Math.min(1, z.mol.b / b, z.mol.h / h);
        this.geoCache = {};
        return Math.max(12, s0 * k);
    };

    /* ----- Scenen: tavlen foroven, baegerglasset paa bakken ----------------------- */
    P.layoutEkstra = function (lay) {
        var t = lay.tavle, bk = lay.bakke;
        var lille = t.h < 420;
        var glasTop = t.y + t.h * (lille ? 0.44 : 0.40);
        var glasBund = bk.y + 1;
        var glasH = glasBund - glasTop;
        var glasB = Math.min(t.b - 44, Math.max(glasH * 1.9, t.b * 0.8));
        var gx = t.x + (t.b - glasB) / 2;
        var vaeg = NK.klamp(glasB * 0.008, 3, 5);
        var vaeskeTop = glasTop + glasH * 0.09;
        var bund = glasBund - vaeg;
        var graense = vaeskeTop + (bund - vaeskeTop) * 0.5;
        var molTop = t.y + (lille ? 50 : 58);
        this.zoner = {
            mol: { x: t.x + 20, y: molTop, b: t.b - 40, h: Math.max(30, glasTop - molTop - 30) },
            glas: { x: gx, y: glasTop, b: glasB, h: glasH, vaeg: vaeg },
            heptan: { x: gx + vaeg, y: vaeskeTop, b: glasB - 2 * vaeg, h: graense - vaeskeTop },
            vand: { x: gx + vaeg, y: graense, b: glasB - 2 * vaeg, h: bund - graense },
            graense: graense,
            luft: { y: glasTop }
        };
        var ctx = this.L.ctx;
        ctx.font = "700 17px 'Segoe UI', sans-serif";
        this.etiketB = Math.round(Math.max(ctx.measureText("heptan").width, 60) + 30);
        this.saetAnker("op-anker-glas", gx, glasTop, glasB, glasH);
        this.saetAnker("op-anker-mol", this.zoner.mol.x, this.zoner.mol.y, this.zoner.mol.b, this.zoner.mol.h + 26);
        if (this.m) this.molSkala = this.beregnSkala();
        this.lavPartikler();
    };

    /* Det frie felt i et lag: til hoejre for etiketten og til venstre for
       glassets maalestreger */
    P.fri = function (navn) {
        var L = this.zoner[navn], lb = this.etiketB;
        return { x: L.x + lb, y: L.y + 6, b: L.b - lb - 34, h: L.h - 12 };
    };

    /* Hvor molekylet skal hen (pixels), og hvor stort det skal vaere */
    P.maal = function (sted) {
        var z = this.zoner, g, fr, b, h, s;
        if (sted === "tavle") {
            g = this.geo(0);
            var mz = z.mol;
            return { x: mz.x + mz.b / 2 - (g.x0 + g.x1) / 2, y: mz.y + mz.h / 2 - (g.y0 + g.y1) / 2, s: 1, rot: 0 };
        }
        if (sted === "graense") {
            var v = this.m.rotGraense;
            g = this.geo(v);
            fr = this.fri("heptan");
            /* De polaere gruppers midte i den drejede tegning */
            var px = 0, py = 0, n = 0, sk = this.molSkala, mig = this;
            g.mol.atomer.forEach(function (a) { if (mig.m.polaer[a.id]) { px += a.x * sk; py += a.y * sk; n++; } });
            px /= n || 1; py /= n || 1;
            var op = Math.max(1, py - g.y0), ned = Math.max(1, g.y1 - py);
            s = Math.min(0.85, (z.heptan.h - 10) / op, (z.vand.h - 10) / ned, fr.b / (g.x1 - g.x0));
            return { x: fr.x + fr.b / 2 - (g.x0 + g.x1) / 2 * s, y: z.graense + 5 - py * s, s: s, rot: v };
        }
        /* Ved siden af etiketten, eller i hele lagets bredde under den,
           hvis et langt molekyle saa kan blive mindst 10 % stoerre */
        g = this.geo(0);
        b = g.x1 - g.x0; h = g.y1 - g.y0;
        var L = z[sted], bund = this.etiketBund(sted) + 4, bedst = null;
        [this.fri(sted), { x: L.x + 12, y: bund, b: L.b - 46, h: L.y + L.h - 6 - bund }].forEach(function (x) {
            if (x.b <= 0 || x.h <= 0) return;
            var sx = Math.min(0.85, x.b / b, x.h / h);
            if (!bedst || sx > bedst.s * 1.1) bedst = { s: sx, fr: x };
        });
        s = bedst.s; fr = bedst.fr;
        return { x: fr.x + fr.b / 2 - (g.x0 + g.x1) / 2 * s, y: fr.y + fr.h / 2 - (g.y0 + g.y1) / 2 * s, s: s, rot: 0 };
    };

    /* Etikettens boks i laget (samme maal som tegnEtiket) */
    P.etiketBoks = function (navn) {
        var L = this.zoner[navn], to = L.h >= 64;
        return { x: L.x + 10, y: L.y + (navn === "heptan" ? 10 : 8), b: this.etiketB - 18, h: to ? 46 : 26, to: to };
    };

    P.etiketBund = function (navn) {
        var e = this.etiketBoks(navn);
        return e.y + e.h;
    };

    /* Laget under punktet: luften over heptanen taeller som heptan */
    P.lagVed = function (pt) {
        var z = this.zoner;
        if (!z || !pt) return null;
        var g = z.glas;
        if (pt.x < g.x - 6 || pt.x > g.x + g.b + 6 || pt.y < g.y - 10 || pt.y > g.y + g.h + 4) return null;
        return pt.y < z.graense ? "heptan" : "vand";
    };

    P.paaMol = function (pt) {
        var f = this.fig;
        if (!f || f.ny || f.sted !== "tavle") return false;
        var g = this.geo(f.rot), x = (pt.x - f.x) / f.s, y = (pt.y - f.y) / f.s;
        return x > g.x0 - 16 && x < g.x1 + 16 && y > g.y0 - 16 && y < g.y1 + 16;
    };

    /* ----- Musen: traek molekylet, eller klik paa et lag ---------------------------- */
    P.musKrog = function (type, pt, e) {
        var f = this.fig;
        if (!this.zoner || !f) return true;
        var kan = !this.svaret && !this.slut;
        if (type === "ud") {
            if (!f.traek) this.overLag = null;
            return true;
        }
        if (type === "ned") {
            if (e && e.button === 2) return true;
            if (kan && this.paaMol(pt)) {
                f.traek = true;
                this.harTrukket = true;
                this.traekD = { x: pt.x - f.x, y: pt.y - f.y };
                try { this.L.canvas.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                this.krogMarkoer = "grabbing";
                return true;
            }
            this.klikLag = kan ? this.lagVed(pt) : null;
            return true;
        }
        if (type === "flyt") {
            if (f.traek) {
                f.x = pt.x - this.traekD.x;
                f.y = pt.y - this.traekD.y;
                this.overLag = this.lagVed(pt);
                this.krogMarkoer = "grabbing";
                return true;
            }
            this.overLag = kan ? this.lagVed(pt) : null;
            var paaL = this.laererUnder && this.laererUnder(pt.x, pt.y);
            this.krogMarkoer = paaL ? "pointer" : (kan && this.paaMol(pt) ? "grab" : (this.overLag ? "pointer" : "default"));
            return true;
        }
        if (type === "op") {
            if (f.traek) {
                f.traek = false;
                f.fart = 9;
                var lag = this.lagVed(pt);
                this.overLag = null;
                if (lag) this.vaelg(lag);
                return true;
            }
            var klik = this.klikLag && this.lagVed(pt) === this.klikLag ? this.klikLag : null;
            this.klikLag = null;
            if (klik && kan) this.vaelg(klik);
            return true;
        }
        return true;
    };

    /* ----- Tid ------------------------------------------------------------------------ */
    P.opdaterEkstra = function (dt) {
        var f = this.fig;
        if (this.zoner && f) {
            if (f.ny) {
                var m0 = this.maal("tavle");
                f.x = m0.x; f.y = m0.y; f.s = 0.3; f.ny = false;
            }
            if (this.efter) {
                this.efter.vent -= dt;
                if (this.efter.vent <= 0) { f.sted = this.efter.sted; f.fart = 2.4; this.efter = null; }
            }
            if (!f.traek) {
                var m = this.maal(f.sted);
                f.x = NK.mod(f.x, m.x, f.fart, dt);
                f.y = NK.mod(f.y, m.y, f.fart, dt);
                f.s = NK.mod(f.s, m.s, f.fart * 0.9, dt);
                f.rot = NK.mod(f.rot, m.rot, f.fart * 0.8, dt);
            } else {
                f.s = NK.mod(f.s, 1.06, 10, dt);
            }
        }
        if (this.maerke) this.maerke.t += dt;
        if (this.spoegelse) {
            this.spoegelse.t += dt;
            if (this.spoegelse.t > 0.6) this.spoegelse = null;
        }
        this.opdaterPartikler(dt);
        this.visStatus();
    };

    /* ----- Molekylerne i vaeskerne: vand som små V'er, heptan som zigzag -------------- */
    P.lavPartikler = function () {
        var z = this.zoner, ud = [];
        if (!z) return;
        ["heptan", "vand"].forEach(function (navn) {
            var L = z[navn];
            var n = Math.round(L.b * L.h / (navn === "vand" ? 3000 : 7500));
            for (var i = 0; i < n; i++) {
                ud.push({ lag: navn, u: Math.random(), v: Math.random(), vx: NK.r(-9, 9), vy: NK.r(-6, 6),
                    rot: NK.r(0, 6.3), vr: NK.r(-0.8, 0.8) });
            }
        });
        this.partikler = ud;
    };

    P.opdaterPartikler = function (dt) {
        var z = this.zoner;
        if (!z) return;
        this.partikler.forEach(function (p) {
            var L = z[p.lag];
            p.vx += NK.r(-20, 20) * dt;
            p.vy += NK.r(-20, 20) * dt;
            p.vx = NK.klamp(p.vx, -12, 12);
            p.vy = NK.klamp(p.vy, -9, 9);
            p.u += p.vx * dt / Math.max(1, L.b);
            p.v += p.vy * dt / Math.max(1, L.h);
            if (p.u < 0.02) { p.u = 0.02; p.vx = Math.abs(p.vx); }
            if (p.u > 0.98) { p.u = 0.98; p.vx = -Math.abs(p.vx); }
            if (p.v < 0.06) { p.v = 0.06; p.vy = Math.abs(p.vy); }
            if (p.v > 0.94) { p.v = 0.94; p.vy = -Math.abs(p.vy); }
            p.rot += p.vr * dt;
        });
    };

    function tegnPartikel(ctx, p, x, y, k) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        if (p.lag === "vand") {
            var d = 6.5 * k, rH = 2.8 * k;
            [-0.91, 0.91].forEach(function (v) {
                ctx.beginPath();
                ctx.arc(Math.sin(v) * d, Math.cos(v) * d, rH, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "rgba(80, 105, 130, 0.45)";
                ctx.stroke();
            });
            ctx.beginPath();
            ctx.arc(0, 0, 4.6 * k, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(214, 72, 66, 0.5)";
            ctx.fill();
        } else {
            var l = 6.5 * k, dx = l * 0.866, dy = l * 0.5;
            ctx.beginPath();
            ctx.moveTo(-3 * dx, dy / 2);
            for (var i = 1; i < 7; i++) ctx.lineTo(-3 * dx + i * dx, i % 2 ? -dy / 2 : dy / 2);
            ctx.strokeStyle = "rgba(120, 92, 30, 0.5)";
            ctx.lineWidth = 1.7 * k;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.stroke();
        }
        ctx.restore();
    }

    /* ----- Tegning ------------------------------------------------------------------------ */
    function glasSti(ctx, x0, y0, x1, y1, r) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0, y1 - r);
        ctx.quadraticCurveTo(x0, y1, x0 + r, y1);
        ctx.lineTo(x1 - r, y1);
        ctx.quadraticCurveTo(x1, y1, x1, y1 - r);
        ctx.lineTo(x1, y0);
        ctx.closePath();
    }

    /* En flade med en lille menisk ved glasvaeggene */
    function flade(ctx, x0, x1, y, farve) {
        ctx.beginPath();
        ctx.moveTo(x0, y - 4);
        ctx.quadraticCurveTo(x0 + 5, y, x0 + 16, y);
        ctx.lineTo(x1 - 16, y);
        ctx.quadraticCurveTo(x1 - 5, y, x1, y - 4);
        ctx.strokeStyle = farve;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    P.tegnGlasBag = function (ctx) {
        var z = this.zoner, g = z.glas, v = g.vaeg, r = Math.min(18, g.b * 0.05);
        var x0 = g.x, x1 = g.x + g.b, y0 = g.y, y1 = g.y + g.h;
        var mig = this, k = NK.klamp(this.skala() / 46, 0.75, 1.2);
        ctx.save();
        glasSti(ctx, x0, y0, x1, y1, r);
        ctx.fillStyle = "rgba(205, 228, 246, 0.22)";
        ctx.fill();
        glasSti(ctx, x0 + v / 2, y0, x1 - v / 2, y1 - v / 2, Math.max(2, r - v / 2));
        ctx.clip();
        ["heptan", "vand"].forEach(function (navn) {
            var L = z[navn], st = LAG[navn];
            ctx.fillStyle = mig.overLag === navn ? st.lys : st.fyld;
            ctx.fillRect(L.x - v, L.y, L.b + 2 * v, L.h + (navn === "vand" ? v : 0));
        });
        this.partikler.forEach(function (p) {
            var L = z[p.lag];
            tegnPartikel(ctx, p, L.x + p.u * L.b, L.y + p.v * L.h, k);
        });
        flade(ctx, x0 + v / 2, x1 - v / 2, z.heptan.y, LAG.heptan.flade);
        flade(ctx, x0 + v / 2, x1 - v / 2, z.graense, LAG.vand.flade);
        /* Laget, der lyser op, faar en kant */
        if (this.overLag) {
            var Lv = z[this.overLag];
            ctx.setLineDash([8, 6]);
            ctx.strokeStyle = LAG[this.overLag].kant;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(Lv.x + 4, Lv.y + 4, Lv.b - 8, Lv.h - 8);
            ctx.setLineDash([]);
        }
        ctx.restore();
    };

    P.tegnGlasForan = function (ctx) {
        var z = this.zoner, g = z.glas, v = g.vaeg, r = Math.min(18, g.b * 0.05);
        var x0 = g.x, x1 = g.x + g.b, y0 = g.y, y1 = g.y + g.h;
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        /* Vaeggene med en lille udadboejet kant foroven */
        ctx.beginPath();
        ctx.moveTo(x0 - v * 2.2, y0 - v * 0.8);
        ctx.quadraticCurveTo(x0, y0 - v * 0.4, x0, y0 + v * 2);
        ctx.lineTo(x0, y1 - r);
        ctx.quadraticCurveTo(x0, y1, x0 + r, y1);
        ctx.lineTo(x1 - r, y1);
        ctx.quadraticCurveTo(x1, y1, x1, y1 - r);
        ctx.lineTo(x1, y0 + v * 2);
        ctx.quadraticCurveTo(x1, y0 - v * 0.4, x1 + v * 2.2, y0 - v * 0.8);
        ctx.strokeStyle = "rgba(92, 118, 145, 0.9)";
        ctx.lineWidth = v;
        ctx.stroke();
        /* Lysstriber i glasset */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = Math.max(3, v * 1.2);
        ctx.beginPath();
        ctx.moveTo(x0 + v * 2.6, y0 + g.h * 0.14);
        ctx.lineTo(x0 + v * 2.6, y1 - r * 1.3);
        ctx.stroke();
        ctx.lineWidth = Math.max(2, v * 0.7);
        ctx.beginPath();
        ctx.moveTo(x1 - v * 2.4, y0 + g.h * 0.2);
        ctx.lineTo(x1 - v * 2.4, y0 + g.h * 0.55);
        ctx.stroke();
        /* Maalestreger */
        ctx.strokeStyle = "rgba(92, 118, 145, 0.6)";
        ctx.lineWidth = 1.5;
        for (var i = 1; i <= 8; i++) {
            var yy = y1 - g.h * 0.1 * i;
            if (yy < y0 + g.h * 0.12) break;
            var l = i % 2 ? 9 : 16;
            ctx.beginPath();
            ctx.moveTo(x1 - v * 4, yy);
            ctx.lineTo(x1 - v * 4 - l, yy);
            ctx.stroke();
        }
        ctx.restore();
        this.tegnEtiket(ctx, "heptan");
        this.tegnEtiket(ctx, "vand");
    };

    /* Lagets navn i en lille hvid boks til venstre i laget */
    P.tegnEtiket = function (ctx, navn) {
        var st = LAG[navn], lys = this.overLag === navn, e = this.etiketBoks(navn);
        var to = e.to, bx = e.x, by = e.y, bb = e.b, bh = e.h;
        ctx.save();
        ctx.fillStyle = lys ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.78)";
        NK.rundtRekt(ctx, bx, by, bb, bh, 7);
        ctx.fill();
        ctx.strokeStyle = lys ? st.kant : "rgba(0, 0, 0, 0.08)";
        ctx.lineWidth = lys ? 2 : 1;
        ctx.stroke();
        NK.tekst(ctx, st.navn, bx + bb / 2, by + 19, { font: "700 17px 'Segoe UI', sans-serif", farve: st.tekst, justering: "center" });
        if (to) NK.tekst(ctx, st.under, bx + bb / 2, by + 37, { font: "600 13px 'Segoe UI', sans-serif", farve: st.tekst, justering: "center" });
        ctx.restore();
    };

    /* Hvid glorie bag stregerne, saa molekylet kan ses mellem vaeskens molekyler */
    function glorie(ctx, g) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        g.linjer.forEach(function (l) {
            ctx.lineWidth = l.b + 7;
            ctx.beginPath();
            ctx.moveTo(l.x1, l.y1);
            ctx.lineTo(l.x2, l.y2);
            ctx.stroke();
        });
        ctx.textBaseline = "middle";
        ctx.lineWidth = 6;
        g.tekster.forEach(function (t) {
            ctx.font = t.font;
            ctx.textAlign = t.juster;
            ctx.strokeText(t.t, t.x, t.y + t.h * 0.04);
        });
        ctx.restore();
    }

    function tegnGeo(ctx, g, x, y, s, alfa, medGlorie) {
        ctx.save();
        ctx.globalAlpha = alfa === undefined ? 1 : alfa;
        ctx.translate(x, y);
        ctx.scale(s, s);
        if (medGlorie) glorie(ctx, g);
        NK.Struktur.tegnGeo(ctx, g);
        ctx.restore();
    }

    P.tegnFane = function (ctx) {
        var z = this.zoner, f = this.fig;
        if (!z || !f || !this.m) return;
        this.tegnGlasBag(ctx);
        var iGlas = !f.traek && f.sted !== "tavle";
        var sp = this.spoegelse;
        if (sp) tegnGeo(ctx, sp.g, sp.x, sp.y, sp.s * (1 - sp.t * 0.3), NK.klamp(1 - sp.t / 0.6, 0, 1), true);
        if (!f.ny && iGlas) tegnGeo(ctx, this.geo(f.rot), f.x, f.y, f.s, 1, true);
        this.tegnGlasForan(ctx);
        if (!f.ny && !iGlas) this.tegnPaaTavlen(ctx);
        if (!f.ny) this.tegnMaerke(ctx);
    };

    P.tegnPaaTavlen = function (ctx) {
        var f = this.fig, g = this.geo(f.rot);
        if (f.traek) {
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
            ctx.shadowBlur = 14;
            ctx.shadowOffsetY = 6;
            tegnGeo(ctx, g, f.x, f.y, f.s, 1, false);
            ctx.restore();
            return;
        }
        tegnGeo(ctx, g, f.x, f.y, f.s, NK.klamp(f.s, 0, 1), false);
        /* Navnet under molekylet */
        var ny = f.y + g.y1 * f.s + 20;
        NK.tekst(ctx, this.m.navn, f.x + (g.x0 + g.x1) / 2 * f.s, ny, { font: "600 17px 'Segoe UI', sans-serif", farve: "#4a5260", justering: "center", linje: "middle" });
        /* Foerste gang: en pil, der viser vejen ned i glasset */
        if (!this.harTrukket && !this.svaret && this.nr === 0) {
            var y1 = ny + 16, y2 = this.zoner.glas.y - 10, x = f.x + (g.x0 + g.x1) / 2 * f.s;
            if (y2 - y1 > 22) {
                var bob = Math.sin(this.tid * 3.2) * 4;
                ctx.save();
                ctx.strokeStyle = "rgba(74, 82, 96, 0.55)";
                ctx.fillStyle = "rgba(74, 82, 96, 0.55)";
                ctx.lineWidth = 2.5;
                ctx.setLineDash([6, 6]);
                ctx.beginPath();
                ctx.moveTo(x, y1 + bob);
                ctx.lineTo(x, y2 - 8 + bob);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(x - 8, y2 - 10 + bob);
                ctx.lineTo(x + 8, y2 - 10 + bob);
                ctx.lineTo(x, y2 + bob);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
    };

    /* Flueben, kryds eller ≈ ved molekylet, lige efter svaret */
    P.tegnMaerke = function (ctx) {
        var mk = this.maerke, f = this.fig;
        if (!mk || mk.t > 2.6) return;
        var g = this.geo(f.rot);
        var a = NK.klamp((2.6 - mk.t) / 0.5, 0, 1) * NK.klamp(mk.t / 0.15, 0, 1);
        var x = f.x + g.x1 * f.s + 16, y = f.y + g.y0 * f.s + 4;
        var r = 15 * NK.pop(mk.t / 0.35);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2);
        ctx.fillStyle = mk.slags === "ok" ? GROEN : (mk.slags === "fejl" ? ROED : GUL);
        ctx.fill();
        NK.tekst(ctx, mk.slags === "ok" ? "✓" : (mk.slags === "fejl" ? "✕" : "≈"), x, y + 1,
            { font: "700 17px 'Segoe UI', sans-serif", farve: "#ffffff", justering: "center", linje: "middle" });
        ctx.restore();
    };

    /* ----- Panelet ------------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        NK.el("op-knap").addEventListener("click", function () { mig.knap(); });
        NK.el("op-forfra").addEventListener("click", function () { mig.nytSpil(); });
        Array.prototype.forEach.call(document.querySelectorAll("#op-tegning button"), function (k) {
            k.addEventListener("click", function () {
                mig.stil = k.getAttribute("data-v");
                if (mig.zoner) mig.molSkala = mig.beregnSkala();
                mig.visPanel();
            });
        });
    };

    P.besked = function (html, klasse) {
        var e = NK.el("op-besked");
        e.innerHTML = html;
        e.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visPanel = function () {
        var m = this.m, mig = this, n = this.bunke.length;
        NK.saetTekst("op-nr", String(Math.min(this.nr + 1, n)));
        NK.saetTekst("op-antal", String(n));
        NK.saetHTML("op-prompt", NK.html(m.navn) + (m.note || this.svaret ?
            "<small>" + [m.note ? NK.html(m.note) : "", this.svaret ? m.formel : ""].filter(Boolean).join(" · ") + "</small>" : ""));
        NK.saetTekst("op-point", String(this.point));
        var hjerter = "", i;
        for (i = 0; i < LIV; i++) hjerter += i < this.liv ? "❤" : '<span class="tabt-liv">♡</span>';
        NK.saetHTML("op-liv", hjerter);
        NK.saetTekst("op-titel", this.slut === "tabt" ? "Spillet er slut" : (this.slut === "vundet" ? "Bunken er sorteret" : "Hvor opløses det?"));
        var knap = NK.el("op-knap");
        if (this.slut) { knap.textContent = "Nyt spil ↺"; knap.className = "knap blaa banker"; }
        else if (this.svaret) { knap.textContent = "Næste molekyle →"; knap.className = "knap blaa banker"; }
        else { knap.textContent = this.hjaelp ? "Vis svaret" : "Giv hint"; knap.className = "knap"; }
        NK.el("op-kort").classList.toggle("sejr", this.slut === "vundet");
        NK.saetTekst("op-sorteret", String(this.res.filter(function (s) { return s > 0; }).length));
        NK.saetTekst("op-ialt", String(n));
        NK.Fane.prikker("op-prikker", this.res, this.slut ? -1 : this.nr, function (k) { mig.mini = k; mig.visMini(); });
        NK.saetTekst("op-rekord", this.rekord ? (this.nyRekord ? "Ny rekord: " : "Rekord: ") + this.rekord + " point" : "");
        Array.prototype.forEach.call(document.querySelectorAll("#op-tegning button"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-v") === mig.stil);
        });
        this.visMini();
        this.visStatus();
    };

    /* Et klik paa en prik viser molekylet med farverne og regnestykket */
    P.visMini = function () {
        var i = this.mini;
        if (i < 0 || !this.res[i]) { NK.saetHTML("op-mini", ""); return; }
        var m = this.bunke[i], s = this.res[i], g = m.grupper.length;
        var svg = NK.Struktur.svg(m.mol, farveValg(m, 2, { skala: 24, stil: this.stil, farve: "#1d2433", linje: 2.2, skrift: 13, lokanter: false }), { pad: 8 });
        var mm = /width="(\d+)" height="(\d+)"/.exec(svg);
        if (mm) {
            var b = +mm[1], h = +mm[2], k = Math.min(1, 360 / b, 120 / h);
            svg = svg.replace(/width="\d+" height="\d+"/, 'width="' + Math.round(b * k) + '" height="' + Math.round(h * k) + '"');
        }
        var hvor = m.svar === "begge" ? "Lidt i begge" : "Opløses i " + LAG[m.svar].navn;
        var regn = g ? m.c + " C / " + g + " " + (g === 1 ? "polær gruppe" : "polære grupper") + " " + (m.forhold.indexOf("≈") === 0 ? m.forhold : "= " + m.forhold) :
            "ingen polære grupper";
        var hvad = s === 3 ? ". Du valgte " + LAG[this.valgte[i]].navn : (s === 2 ? ". Svaret blev vist" : "");
        NK.saetHTML("op-mini", svg + NK.html(m.navn) + '<span class="mini-note">' + hvor + ": " + regn + hvad + "</span>");
    };

    P.visStatus = function () {
        var S = D.STATUS;
        if (this.slut) { this.status(S.oploesSlut); return; }
        if (this.svaret) { this.status(S.loest); return; }
        if (this.fig && this.fig.traek) { this.status(S.oploesTraek); return; }
        this.status(this.hjaelp && this.m.grupper.length ? S.oploesHint : S.oploesStart);
    };

    NK.Praesentation.kobl(P, { noegle: "nk-sc6.2-intro-oploeselighed", tilbud: "op-tilbud", spring: "op-spring" });

    NK.SimOploes = SimOploes;
}());
