/* =====================================================================
   sim_fortynd.js - fane 2: Fortynding

   Et maaleglas med Co2+(aq) + 4 Cl-(aq) <=> CoCl4 2-(aq) (NK.Model.OPL)
   med de samme ioner som figur B2.10 i Kemibogen: 2 CoCl4 2-, 1 Co2+ og
   10 Cl- i 25 mL. Eleven haelder vand i, saa rumfanget bliver dobbelt saa
   stort (50 mL og 100 mL). Ionerne bliver i glasset og fordeles i det
   stoerre rumfang; lige efter er opløsningen lysere blaa, og naar
   ligevaegten forskydes mod venstre, bliver én CoCl4 2- til én Co2+ og
   fire Cl-, og farven skifter mod violet og lyseroed. De nye ioner har en
   groen ring som i bogens figur.

   Farven er en blanding af blaa og lyseroed efter andelen af cobalt, der
   sidder i CoCl4 2-, hvor den blaa ion vejer 2,5 gange saa meget, og den
   bliver svagere, jo stoerre rumfanget er. I virkeligheden farver CoCl4 2-
   omkring 100 gange kraftigere pr. ion end Co2+(aq) (se README).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var O = M.OPL;
    var Tg = NK.Tegn;

    var HAELD_TID = 1.2;
    var LIGE_EFTER = 1.3;
    var HASTIGHED = 1.4;
    var PAUSE = 0.8;
    var VMAX = 4;
    var BLAA = [52, 92, 210], LYSEROED = [228, 128, 190];
    var VAEGT = 2.5;            /* CoCl4 2- farver kraftigere end Co2+ (i virkeligheden omkring 100 gange) */

    function kopi(n) { return n.slice(); }

    /* Ionernes stoerrelse foelger maaleglasset (K = 1 til 1,4) */
    var K = 1;
    function ir(slags) { return Tg.ION[slags].r * K; }

    function SimFortynd() {
        this.ioner = [];
        this.startFane(D.F_MAAL);
    }

    var P = SimFortynd.prototype;
    NK.Fane.paa(P, { navn: "f", naesteFane: "fane-r", naesteNavn: "Regn på Y" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) { this.opstil(o); };

    P.opstil = function (o) {
        o = o || this.opg.o;
        this.V = o.opstil.V;
        this.Vvis = this.V;
        this.n = this.V === 1 ? kopi(O.start) : M.efter(O, O.start, M.ligevaegtXi(O, O.start, this.V));
        this.foer = null;
        this.Vtil = this.V;
        this.handling = "";
        this.trin = "hvile";
        this.t = 0;
        this.ioner = [];
        this.fyldIoner();
        if (this.lay) this.visPanel();
    };

    P.nulstilScene = function () { this.opstil(); };

    /* ----- Ionerne ---------------------------------------------------------------------- */
    P.rum = function (V) {
        var G = this.lay ? this.lay.G : { x: 0, b: 260, bund: 300 };
        var mp = this.lay ? this.lay.mlPx : 60;
        return { x0: G.x, x1: G.x + G.b, y0: G.bund - (V === undefined ? this.Vvis : V) * mp, y1: G.bund };
    };

    P.nyIon = function (slags, x, y) {
        var R = this.rum(), r = ir(slags);
        var fri = x === undefined ? Tg.friPlads(R, r, this.andre()) : null;
        var i = {
            slags: slags,
            x: fri ? fri.x : x,
            y: fri ? fri.y : y,
            vx: NK.r(-1, 1), vy: NK.r(-1, 1), blink: 0, fade: 0, ring: 0
        };
        var fart = NK.r(10, 18), l = Math.sqrt(i.vx * i.vx + i.vy * i.vy) || 1;
        i.vx *= fart / l; i.vy *= fart / l;
        this.ioner.push(i);
        return i;
    };

    P.andre = function (uden) {
        return this.ioner.filter(function (i) { return i !== uden && !i.vaek; }).map(function (i) {
            return { x: i.maal ? i.maal.x : i.x, y: i.maal ? i.maal.y : i.y, r: ir(i.slags) };
        });
    };

    P.spred = function (R) {
        var mig = this;
        this.ioner.forEach(function (i) { i.x = -999; i.y = -999; });
        this.ioner.forEach(function (i) {
            var p = Tg.friPlads(R, ir(i.slags), mig.andre(i).filter(function (a) { return a.x > -900; }));
            i.x = p.x; i.y = p.y;
        });
    };

    P.fyldIoner = function () {
        var mig = this, liste = [], k;
        var antal = { Co: Math.round(this.n[0]), Cl: Math.round(this.n[1]), CoCl4: Math.round(this.n[2]) };
        ["CoCl4", "Co", "Cl"].forEach(function (s) { for (k = 0; k < antal[s]; k++) liste.push(s); });
        liste.forEach(function (s) { mig.nyIon(s); });
    };

    P.antal = function (slags) {
        return this.ioner.filter(function (i) { return i.slags === slags && !i.vaek && !i.til; }).length;
    };

    /* Mod venstre bliver én CoCl4 2- til én Co2+ og fire Cl-; mod hoejre omvendt */
    P.haendelse = function (mod) {
        if (mod < 0) {
            var a = this.ioner.filter(function (i) { return i.slags === "CoCl4" && !i.nyt; });
            if (!a.length) return false;
            var m = NK.tilfaeldig(a);
            m.blink = 0.6;
            m.nyt = "Co";
            m.dele = true;
            return true;
        }
        var co = this.ioner.filter(function (i) { return i.slags === "Co" && !i.nyt; });
        var cl = this.ioner.filter(function (i) { return i.slags === "Cl" && !i.til; });
        if (!co.length || cl.length < 4) return false;
        var c = NK.tilfaeldig(co);
        cl.sort(function (p, q) { return ((p.x - c.x) * (p.x - c.x) + (p.y - c.y) * (p.y - c.y)) - ((q.x - c.x) * (q.x - c.x) + (q.y - c.y) * (q.y - c.y)); });
        cl.slice(0, 4).forEach(function (i) { i.til = c; i.tilT = 0.5; });
        c.blink = 0.6;
        c.nyt = "CoCl4";
        return true;
    };

    /* ----- Vandet ------------------------------------------------------------------------ */
    P.haeld = function (Vtil) {
        if (Vtil > VMAX || Vtil <= this.V) return;
        var mig = this;
        this.foer = { V: this.V, n: kopi(this.n), antal: this.taelling() };
        this.Vfra = this.V;
        this.Vtil = Vtil;
        this.handling = "vand";
        this.trin = "haeld";
        this.t = 0;
        /* Ionerne fordeles i det stoerre rumfang, mens vandet loeber i */
        var R = this.rum(Vtil);
        this.ioner.forEach(function (i) { i.fra = { x: i.x, y: i.y }; i.maal = null; });
        this.ioner.forEach(function (i) {
            var andre = mig.ioner.filter(function (a) { return a !== i && a.maal; }).map(function (a) { return { x: a.maal.x, y: a.maal.y, r: ir(a.slags) }; });
            var p = Tg.friPlads(R, ir(i.slags), andre);
            i.maal = { x: p.x, y: p.y };
        });
        this.nulstilHjaelp();
        void mig;
    };

    P.taelling = function () {
        return { Co: this.antal("Co"), Cl: this.antal("Cl"), CoCl4: this.antal("CoCl4") };
    };

    P.forsoegSvar = function () {
        if (this.trin === "hvile" && !this.handling) this.haeld(this.del().maal);
    };

    P.klaret = function () {
        if (!this.iForsoeg()) return;
        this.forsoegKlaret(this.del().set || "");
    };

    P.tilladte = function () {
        if (!this.iForsoeg() || this.trin !== "hvile" || this.handling) return [];
        return ["vand"];
    };

    P.yRel = function () { return M.Y(O, this.n, this.V) / O.K; };

    /* Vaeskens farve: blaa og lyseroed blandet efter andelen af cobalt i CoCl4 2-,
       hvor den blaa ion vejer 2,5 gange saa meget, og svagere ved et stoerre
       rumfang. Saa er 25 mL blaa, 50 mL violet og 100 mL lyseroed. */
    P.farve = function () {
        var a0 = this.n[2] / (this.n[0] + this.n[2]);
        var f = VAEGT * a0 / (VAEGT * a0 + 1 - a0);
        var a = 0.92 * Math.pow(this.Vvis, -0.7);
        return [
            Math.round(NK.lerp(LYSEROED[0], BLAA[0], f)),
            Math.round(NK.lerp(LYSEROED[1], BLAA[1], f)),
            Math.round(NK.lerp(LYSEROED[2], BLAA[2], f)),
            a
        ];
    };

    /* ----- Panelet ---------------------------------------------------------------------- */
    P.visPanel = function () {
        var mig = this;
        var kol = [];
        if (this.foer) kol = [["før", this.foer.V, this.foer.antal, 1]];
        if (this.foer && this.trin !== "haeld") kol.push(["lige efter", this.Vtil, this.foer.antal, Math.pow(this.Vtil / this.foer.V, 4)]);
        var nu = this.taelling();
        var raekker = [
            ["V i mL", function (k) { return String(Math.round(k[1] * 25)); }, String(Math.round(this.Vvis * 25))],
            ["CoCl₄²⁻", function (k) { return String(k[2].CoCl4); }, String(nu.CoCl4)],
            ["Co²⁺", function (k) { return String(k[2].Co); }, String(nu.Co)],
            ["Cl⁻", function (k) { return String(k[2].Cl); }, String(nu.Cl)],
            ["Y", function (k) { return D.relTekst(k[3]).replace("Y = ", ""); }, D.relTekst(this.yRel()).replace("Y = ", "")]
        ];
        var html = '<table class="konc-tabel"><thead><tr><th></th>';
        kol.forEach(function (k) { html += "<th>" + k[0] + "</th>"; });
        html += "<th>nu</th></tr></thead><tbody>";
        raekker.forEach(function (r) {
            html += "<tr" + (r[0] === "Y" ? ' class="y"' : "") + "><td>" + r[0] + "</td>";
            kol.forEach(function (k) { html += "<td>" + r[1](k) + "</td>"; });
            html += "<td><b>" + r[2] + "</b></td></tr>";
        });
        html += '</tbody></table><p class="konc-k">Antal ioner i måleglasset. Hver ion i tegningen står for mange ioner i opløsningen.</p>';
        NK.saetHTML("f-tal", html);
        var kort = NK.el("f-talkort");
        var omPanel = this.omNu().indexOf("panel") >= 0;
        if (kort) kort.classList.toggle("om", omPanel);
        if (omPanel && !this.panelAabnet && NK.fold) { NK.fold("f-tal", true); this.panelAabnet = true; }
        if (!omPanel) this.panelAabnet = false;
        void mig;
    };

    /* ----- Scenen -------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, Hs = this.baand().y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.y0 = 10 + this.kortZone() + 8;
        /* Maaleglasset vokser med skaermen, og tallinjen bliver hoejst 560 bred
           (brugeren 20. nov. 2026) */
        var gx = Math.max(40, W * 0.04);
        var gb = NK.klamp(Math.min(W * 0.4, W - gx - 74 - 136 - 26 - 26 - 310), 210, 520);
        lay.G = { x: gx, b: gb, top: lay.y0 + 40, bund: Hs - 34 };
        lay.mlPx = (lay.G.bund - lay.G.top - 14) / 4;
        lay.knapX = gx + gb + 74;
        lay.knapB = 136;
        lay.vand = { x: lay.knapX, y: (lay.G.top + lay.G.bund) / 2 - 20, b: lay.knapB, h: 40 };
        var rx = lay.knapX + lay.knapB + 26;
        lay.rx = rx;
        lay.rw = Math.max(280, W - rx - 26);
        lay.skemaY = lay.y0 + 16;
        lay.sigY = lay.y0 + 56;
        lay.formelY = lay.y0 + 142;
        lay.tlY = lay.formelY + 104;
        lay.tlW = Math.min(lay.rw, 560);
        lay.tlX = rx + (lay.rw - lay.tlW) / 2;
        lay.k = NK.klamp(gb / 290, 1, 1.4);
        K = lay.k;
        var gammel = this.lay;
        this.lay = lay;
        if (gammel && gammel.G && gammel.mlPx > 20 && lay.mlPx > 20) {
            var sx = lay.G.b / gammel.G.b, sy = lay.mlPx / gammel.mlPx;
            this.ioner.forEach(function (i) {
                i.x = lay.G.x + (i.x - gammel.G.x) * sx;
                i.y = lay.G.bund - (gammel.G.bund - i.y) * sy;
            });
        } else {
            this.spred(this.rum());
        }
        this.saetAnker("glas", lay.G.x - 14, lay.G.top - 16, lay.G.b + 64, lay.G.bund - lay.G.top + 26);
        this.saetAnker("vand", lay.vand.x - 6, lay.vand.y - 40, lay.knapB + 12, 86);
        this.saetAnker("tallinje", lay.tlX - 10, lay.formelY - 34, lay.tlW + 20, lay.tlY + 54 - lay.formelY + 34);
        this.visPanel();
    };

    P.opdaterScene = function (dt) {
        var lay = this.lay, mig = this;
        if (!lay) return;

        if (this.trin === "haeld") {
            this.t += dt;
            var u = NK.blod(NK.klamp(this.t / HAELD_TID, 0, 1));
            this.Vvis = NK.lerp(this.Vfra, this.Vtil, u);
            this.ioner.forEach(function (i) {
                if (i.maal) { i.x = NK.lerp(i.fra.x, i.maal.x, u); i.y = NK.lerp(i.fra.y, i.maal.y, u); }
            });
            if (this.t >= HAELD_TID) {
                this.Vvis = this.V = this.Vtil;
                this.ioner.forEach(function (i) { i.fra = null; i.maal = null; });
                this.trin = "lige";
                this.t = 0;
            }
        } else if (this.trin === "lige") {
            this.t += dt;
            if (this.t >= LIGE_EFTER) {
                this.trin = "reaktion";
                this.base = kopi(this.n);
                this.xi = 0;
                this.xiMaal = M.ligevaegtXi(O, this.base, this.V);
                this.haendelser = 0;
                this.haendelseT = 0;
                this.t = 0;
            }
        } else if (this.trin === "reaktion") {
            this.xi += (this.xiMaal - this.xi) * (1 - Math.exp(-HASTIGHED * dt));
            if (Math.abs(this.xiMaal - this.xi) < 2e-3) this.xi = this.xiMaal;
            this.n = M.efter(O, this.base, this.xi);
            var maal = Math.round(this.xiMaal);
            var nu = this.xi >= 0 ? Math.floor(this.xi + 0.5 + 1e-9) : -Math.floor(-this.xi + 0.5 + 1e-9);
            if (Math.abs(nu) > Math.abs(maal)) nu = maal;
            this.haendelseT -= dt;
            if (nu !== this.haendelser && this.haendelseT <= 0) {
                var mod = nu > this.haendelser ? 1 : -1;
                if (this.haendelse(mod)) this.haendelser += mod; else this.haendelser = nu;
                this.haendelseT = 0.45;
            }
            if (this.xi === this.xiMaal && this.haendelser === maal && this.haendelseT <= 0) {
                this.t += dt;
                if (this.t >= PAUSE) {
                    this.trin = "hvile";
                    this.klaret();
                }
            }
        }

        /* Ionerne bevaeger sig langsomt i vaesken */
        var R = this.rum();
        this.ioner.forEach(function (i) {
            if (i.til) {
                i.tilT -= dt;
                i.x = NK.lerp(i.x, i.til.x, 0.15);
                i.y = NK.lerp(i.y, i.til.y, 0.15);
                if (i.tilT <= 0) i.vaek = true;
                return;
            }
            if (i.ring > 0) i.ring = Math.max(0, i.ring - dt * 0.25);
            if (i.fade > 0) i.fade = Math.max(0, i.fade - dt * 2.5);
            if (mig.trin !== "haeld") {
                i.x += i.vx * dt;
                i.y += i.vy * dt;
            }
            var r = ir(i.slags) + 2;
            if (i.x < R.x0 + r) { i.x = R.x0 + r; i.vx = Math.abs(i.vx); }
            if (i.x > R.x1 - r) { i.x = R.x1 - r; i.vx = -Math.abs(i.vx); }
            if (mig.trin !== "haeld") {
                if (i.y < R.y0 + r) { i.y = R.y0 + r; i.vy = Math.abs(i.vy); }
                if (i.y > R.y1 - r) { i.y = R.y1 - r; i.vy = -Math.abs(i.vy); }
            }
            if (i.blink > 0) {
                i.blink -= dt;
                if (i.blink <= 0.25 && i.nyt) {
                    i.slags = i.nyt;
                    i.nyt = null;
                    if (i.dele) {
                        i.dele = false;
                        i.ring = 1;
                        for (var k = 0; k < 4; k++) {
                            var v = k * Math.PI / 2 + 0.6;
                            var ny = mig.nyIon("Cl", i.x + Math.cos(v) * 26, i.y + Math.sin(v) * 26);
                            ny.vx = Math.cos(v) * 16; ny.vy = Math.sin(v) * 16;
                            ny.fade = 1;
                            ny.ring = 1;
                        }
                    }
                }
                if (i.blink < 0) i.blink = 0;
            }
        });
        this.ioner = this.ioner.filter(function (i) { return !i.vaek; });
        this.visPanel();
    };

    /* ----- Tegning ------------------------------------------------------------------------------ */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var om = this.omNu(), G = lay.G;
        var vY = G.bund - this.Vvis * lay.mlPx;

        /* Vandet, der loeber i fra sproejteflasken */
        if (this.trin === "haeld") {
            var a = Math.min(1, this.t / 0.15) * Math.min(1, (HAELD_TID - this.t) / 0.15 + 0.2);
            Tg.straale(ctx, G.x + G.b * 0.72, G.top - 34, vY, this.tid, NK.klamp(a, 0, 1));
            NK.rundtRekt(ctx, G.x + G.b * 0.72 - 16, G.top - 70, 40, 36, 8);
            ctx.fillStyle = "rgba(220, 235, 245, 0.85)";
            ctx.fill();
        }

        Tg.glas(ctx, G, vY, this.farve(), lay.mlPx, function () {
            mig.ioner.forEach(function (i) {
                var al = 1 - (i.fade || 0);
                if (i.blink > 0) {
                    ctx.beginPath();
                    ctx.arc(i.x, i.y, ir(i.slags) + 7, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 223, 107, " + (0.5 * Math.min(1, i.blink / 0.3)) + ")";
                    ctx.fill();
                }
                if (i.ring > 0) {
                    ctx.save();
                    ctx.globalAlpha = Math.min(1, i.ring * 1.5);
                    ctx.beginPath();
                    ctx.arc(i.x, i.y, ir(i.slags) + 4.5, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(60, 194, 178, 0.18)";
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#3cc2b2";
                    ctx.stroke();
                    ctx.restore();
                }
                Tg.ion(ctx, i.slags, i.x, i.y, K, al);
            });
        });
        if (om.indexOf("glas") >= 0) Tg.omRing(ctx, G.x - 6, vY - 8, G.b + 12, G.bund - vY + 14, 12);
        if (this.trin === "lige") {
            NK.tekst(ctx, "Lige efter fortyndingen", G.x + G.b / 2, G.top - 20, { font: Tg.font("800", 14), farve: Tg.GUL, justering: "center" });
        }

        /* Knappen til vandet */
        var till = this.tilladte();
        if (till.length) {
            var Vt = this.del().maal;
            Tg.knap(ctx, lay.vand, "Hæld vand i", { farve: "groen", over: this.hover === "vand" });
            Tg.ring(ctx, lay.vand.x, lay.vand.y, lay.vand.b, lay.vand.h, this.tid, 10);
            Tg.skilt(ctx, "Klik: vand til " + (Vt * 25) + " mL", lay.vand.x + lay.vand.b / 2, lay.vand.y - 8, 8, lay.W - 8);
            if (om.indexOf("vand") >= 0) Tg.omRing(ctx, lay.vand.x - 4, lay.vand.y - 4, lay.vand.b + 8, lay.vand.h + 8, 12);
        }

        /* Reaktionsskemaet, signaturen, broeken og tallinjen til hoejre */
        var mx = lay.rx + lay.rw / 2;
        NK.tekst(ctx, "Co²⁺(aq) + 4 Cl⁻(aq) ⇌ CoCl₄²⁻(aq)", mx, lay.skemaY + 6, { font: Tg.font("700", 18), farve: "#ffffff", justering: "center" });
        this.felter = Tg.signatur(ctx, mx, lay.sigY, [
            { slags: "Co", tekst: "lyserød" }, { slags: "Cl", tekst: "farveløs" }, { slags: "CoCl4", tekst: "blå" }
        ], lay.rw);
        var o = this.opg.o;
        if (this.synlig("retning") && !this.faerdig) Tg.retning(ctx, mx, lay.sigY + 34, "forskydes mod venstre", -1);
        if (this.synlig("broek")) {
            var taelling = this.synlig("taelling");
            var fb = Tg.broekLed(ctx, taelling ? mx - 55 : mx, lay.formelY, [["[CoCl₄²⁻]", 1]], [["[Co²⁺]", 1], ["[Cl⁻]", 4]], this.synlig("faktor") ? o.faktor : null, 17);
            if (om.indexOf("formel") >= 0) Tg.omRing(ctx, fb.x - 4, lay.formelY - 28, fb.b + 8, 56, 10);
            /* Taellingen: hvor mange gange der ganges med ½ over og under broekstregen.
               Er der ikke plads til hoejre for broeken, staar den paa én linje under. */
            if (taelling) {
                var lf = { font: Tg.font("800", 14), farve: Tg.LILLA };
                if (fb.hoejre + 120 <= lay.rx + lay.rw) {
                    NK.tekst(ctx, "½ én gang", fb.hoejre + 14, fb.overY + 5, lf);
                    NK.tekst(ctx, "½ fem gange", fb.hoejre + 14, fb.underY + 5, lf);
                } else {
                    lf.justering = "center";
                    NK.tekst(ctx, "½ én gang over og fem gange under brøkstregen", fb.x + fb.b / 2, fb.underY + 26, lf);
                }
            }
        } else {
            Tg.plads(ctx, mx - 100, lay.formelY - 28, 200, 56, "reaktionsbrøken");
        }
        if (this.synlig("tallinje")) {
            var rel = this.yRel();
            /* I stilladset viser tallinjen det forudsagte Y lige efter indgrebet,
               til forsoeget er lavet, saa kortet og tallinjen siger det samme */
            var spaa = !!o.trin && !this.handling && !!o.yLige;
            this.tl = Tg.tallinje(ctx, lay.tlX, lay.tlY, lay.tlW, {
                K: 1, Ktekst: "",
                Y: this.gaetNu() ? null : (spaa ? o.yLige : rel),
                yTekst: spaa ? D.relTekst(o.yLige).replace("Y =", "Y lige efter =") : D.relTekst(rel),
                foer: (spaa || (this.foer && this.trin !== "haeld")) ? 1 : null,
                maal: this.trin === "reaktion" || (spaa && this.synlig("retning"))
            });
            if (om.indexOf("tallinje") >= 0) Tg.omRing(ctx, lay.tlX - 8, lay.tlY - 44, lay.tlW + 16, 92, 12);
        } else {
            Tg.plads(ctx, lay.tlX, lay.tlY - 30, lay.tlW, 70, "tallinjen med Y og K");
        }

        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.ionVed = function (pt) {
        for (var k = this.ioner.length - 1; k >= 0; k--) {
            var i = this.ioner[k], r = ir(i.slags) + 3;
            if (!i.til && (i.x - pt.x) * (i.x - pt.x) + (i.y - pt.y) * (i.y - pt.y) < r * r) return i;
        }
        return null;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) { this.hover = null; return null; }
        this.hover = null;
        if (this.tilladte().length && Tg.i(this.lay.vand, pt)) { this.hover = "vand"; return "klik"; }
        if (Tg.feltVed(this.felter, pt) || this.ionVed(pt)) return "klik";
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var lay = this.lay;
        if (Tg.i(lay.vand, pt) && this.tilladte().length) {
            if (this.spaer()) return;
            this.haeld(this.del().maal);
            return;
        }
        var f = Tg.feltVed(this.felter, pt);
        if (f) { this.kortBesked(D.partikel(f.slags), 6); return; }
        var i = this.ionVed(pt);
        if (i) { this.kortBesked(D.partikel(i.slags), 5); return; }
        var iGlas = pt.x >= lay.G.x - 20 && pt.x <= lay.knapX + lay.knapB && pt.y >= lay.G.top - 20 && pt.y <= lay.G.bund + 6;
        if (iGlas) {
            if (this.iForsoeg() && this.trin !== "hvile") { this.kortBesked("Vent, til Y står ved K på tallinjen.", 3); return; }
            if (!this.iForsoeg()) this.kortBlink();
        }
    };

    P.enter = function () {
        if (this.tilladte().length && !this.spaer()) this.haeld(this.del().maal);
    };

    NK.SimFortynd = SimFortynd;
}());
