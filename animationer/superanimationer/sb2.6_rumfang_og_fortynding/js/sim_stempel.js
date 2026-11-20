/* =====================================================================
   sim_stempel.js - fane 1: Stemplet

   En cylinder med stempel og N2O4(g) <=> 2 NO2(g), K = 0,25 M
   (NK.Model.GAS). Et molekyle staar for 0,020 mol. Eleven presser
   stemplet ned til det halve rumfang eller trækker det op til det
   dobbelte, naar opgaven beder om det. Gassen er brun med en styrke, der
   foelger [NO2]: lige efter et pres bliver den moerkere, og naar
   ligevaegten forskydes, bliver den lidt lysere igen.

   Forloebet: stemplet flytter sig (0,9 s), "lige efter" staar stille
   (1,1 s), saa eleven kan se Y springe, og derefter naermer omfanget xi
   sig ligevaegtens. For hvert helt xi bliver én N2O4 til to NO2 eller
   omvendt, saa molekylerne foelger koncentrationerne. Molekylerne kan
   vises som danserne fra den gamle b2.6: et par er N2O4, en single NO2.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var G = M.GAS;
    var Tg = NK.Tegn;

    var STEMPEL_TID = 0.9;      /* sekunder, stemplet flytter sig */
    var LIGE_EFTER = 1.1;       /* sekunder, hvor blandingen staar "lige efter" */
    var HASTIGHED = 1.5;        /* hvor hurtigt reaktionen naermer sig ligevaegten (1/s) */
    var PAUSE = 0.7;            /* sekunder ved ligevaegten, foer forsoeget er klaret */
    var VMAX = 4.0;

    function kopi(n) { return [n[0], n[1]]; }

    /* Dansernes replikker fra den gamle b2.6 (brugeren 20. nov. 2026: "eleverne
       var ret vilde med dansernes kommentarer"). De kommer kun i dansevisningen,
       og der er længere tid "lige efter", saa de naar at blive sagt. */
    var REPLIKKER = {
        ned: { start: "Hov, her blev trangt!", spoerg: "Skal vi danse sammen?", svar: "Ja, så fylder vi mindre!",
               naeste: ["Os to også!", "Og os!"], slut: "Nu er der lidt bedre plads." },
        op: { start: "Dejligt med mere plads!", spoerg: "Nu behøver vi ikke danse så tæt.",
              svar: "Fint, så danser jeg lidt for mig selv.",
              naeste: ["Vi går også hver til sit.", "Os også!"], slut: "Wuhu, fri bane!" }
    };
    var BOBLE_TID = 1.9;
    var LIGE_DANS = 3.3;        /* sekunder "lige efter" i dansevisningen */

    /* Y i M og som tal gange K */
    function yM(n, V) { return M.Y(G, n, V) * G.MOL; }
    function SimStempel() {
        this.mol = [];
        this.visning = "molekyler";
        this.startFane(D.S_MAAL);
    }

    var P = SimStempel.prototype;
    NK.Fane.paa(P, { navn: "s", naesteFane: "fane-f", naesteNavn: "Fortynding" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) { this.opstil(o); };

    P.opstil = function (o) {
        o = o || this.opg.o;
        this.V = o.opstil.V;
        this.Vvis = this.V;
        this.n = M.efter(G, G.start, M.ligevaegtXi(G, G.start, this.V));
        if (Math.abs(this.V - G.V0) < 1e-9) this.n = kopi(G.start);
        this.foer = null;
        this.efter = null;
        this.handling = "";
        this.trin = "hvile";       /* hvile, stempel, lige, reaktion */
        this.t = 0;
        this.xi = 0;
        this.xiMaal = 0;
        this.haendelser = 0;
        this.haendelseT = 0;
        this.mol = [];
        this.bobler = [];
        this.replik = 0;
        this.partner = null;
        if (o.visning) this.visning = o.visning;
        this.fyldMolekyler();
        if (this.lay) this.visPanel();
    };

    /* En danser siger noget */
    P.sig = function (m, tekst, sek) {
        if (!m || this.visning !== "dansere") return;
        this.bobler = this.bobler.filter(function (b) { return b.m !== m; });
        this.bobler.push({ m: m, tekst: tekst, t0: this.tid, varighed: sek || BOBLE_TID });
    };

    P.tilfaeldigDanser = function () {
        var fri = this.mol.filter(function (m) { return !m.til && !m.vaek; });
        return fri.length ? NK.tilfaeldig(fri) : null;
    };

    /* De to, der skal danse sammen (to NO2), eller det par, der skal gaa fra hinanden */
    P.vaelgPartnere = function () {
        if (this.handling === "ned") {
            var b = this.mol.filter(function (m) { return m.slags === "NO2" && !m.til && !m.nyt; }), bedst = null, d = 1e9;
            b.forEach(function (p) {
                b.forEach(function (q) {
                    if (p === q) return;
                    var dd = (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y);
                    if (dd < d) { d = dd; bedst = [p, q]; }
                });
            });
            this.partner = bedst ? { a: bedst[0], c: bedst[1] } : null;
        } else {
            var a = this.mol.filter(function (m) { return m.slags === "N2O4" && !m.til && !m.nyt; });
            this.partner = a.length ? { a: NK.tilfaeldig(a), c: null } : null;
        }
    };

    P.nulstilScene = function () { this.opstil(); };

    /* ----- Molekylerne ------------------------------------------------------------------ */
    P.rum = function () {
        var C = this.lay ? this.lay.C : { x: 0, b: 240, top: 0, bund: 300 };
        return { x0: C.x, x1: C.x + C.b, y0: this.stempelY(this.Vvis), y1: C.bund };
    };

    P.nytMolekyle = function (slags, x, y) {
        var R = this.rum();
        var m = {
            slags: slags,
            x: x !== undefined ? x : R.x0 + 24 + Math.random() * (R.x1 - R.x0 - 48),
            y: y !== undefined ? y : R.y0 + 20 + Math.random() * Math.max(4, R.y1 - R.y0 - 40),
            vx: NK.r(-1, 1), vy: NK.r(-1, 1), v: NK.r(0, 6.3), w: NK.r(-1.2, 1.2),
            blink: 0, fade: 0, ring: 0
        };
        var fart = NK.r(30, 48), l = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
        m.vx *= fart / l; m.vy *= fart / l;
        this.mol.push(m);
        return m;
    };

    P.fyldMolekyler = function () {
        var liste = [], i;
        for (i = 0; i < Math.round(this.n[0]); i++) liste.push("N2O4");
        for (i = 0; i < Math.round(this.n[1]); i++) liste.push("NO2");
        var mig = this;
        NK.bland(liste).forEach(function (s) { mig.nytMolekyle(s); });
    };

    P.antal = function (slags) {
        return this.mol.filter(function (m) { return m.slags === slags && !m.vaek && !m.til; }).length;
    };

    /* Mod hoejre bliver én N2O4 til to NO2; mod venstre bliver to NO2 til én N2O4 */
    P.haendelse = function (mod) {
        var mig = this;
        var pa = this.partner;
        this.partner = null;
        if (mod > 0) {
            var a = this.mol.filter(function (m) { return m.slags === "N2O4" && !m.nyt && !m.til; });
            if (!a.length) return false;
            var m = pa && a.indexOf(pa.a) >= 0 ? pa.a : NK.tilfaeldig(a);
            m.blink = 0.55;
            m.nyt = "NO2";
            m.dele = true;
            this.taler = m;
            return true;
        }
        var b = this.mol.filter(function (m) { return m.slags === "NO2" && !m.nyt && !m.til; });
        if (b.length < 2) return false;
        var bedst = null, d = 1e9;
        b.forEach(function (p) {
            b.forEach(function (q) {
                if (p === q) return;
                var dd = (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y);
                if (dd < d) { d = dd; bedst = [p, q]; }
            });
        });
        if (pa && pa.c && b.indexOf(pa.a) >= 0 && b.indexOf(pa.c) >= 0) bedst = [pa.a, pa.c];
        bedst[0].blink = 0.55;
        bedst[0].nyt = "N2O4";
        this.taler = bedst[0];
        bedst[1].til = bedst[0];
        bedst[1].tilT = 0.45;
        void mig;
        return true;
    };

    /* ----- Indgrebet ------------------------------------------------------------------ */
    P.indgreb = function (maal) {
        var Vtil = maal === "ned" ? this.V / 2 : this.V * 2;
        if (Vtil > VMAX + 1e-9 || Vtil < 0.5 - 1e-9) return;
        this.foer = { V: this.V, n: kopi(this.n) };
        this.Vfra = this.V;
        this.Vtil = Vtil;
        this.handling = maal;
        this.trin = "stempel";
        this.t = 0;
        this.nulstilHjaelp();
    };

    P.forsoegSvar = function () {
        if (this.trin === "hvile" && !this.handling) this.indgreb(this.del().maal);
    };

    P.klaret = function () {
        if (!this.iForsoeg()) return;
        this.forsoegKlaret(this.del().set || "");
    };

    /* De knapper, eleven maa bruge lige nu (laasen) */
    P.tilladte = function () {
        if (!this.iForsoeg() || this.trin !== "hvile" || this.handling) return [];
        return [this.del().maal];
    };

    /* ----- Panelet: rumfang, antal og koncentrationer foer, lige efter og nu ---------- */
    P.visPanel = function () {
        var kol = [];
        if (this.foer) kol = [["før", this.foer.V, this.foer.n], ["lige efter", this.Vtil, this.foer.n]];
        var nu = ["nu", this.V, this.n];
        var vis = this.trin === "stempel" ? kol.slice(0, 1) : kol;
        var raekker = [
            ["V i L", function (V) { return NK.betydende(V, 2); }],
            ["N₂O₄", function (V, n) { return String(Math.round(n[0])); }, "N2O4"],
            ["NO₂", function (V, n) { return String(Math.round(n[1])); }, "NO2"],
            ["[N₂O₄] i M", function (V, n) { return Tg.konc(M.konc(n[0]) / V).replace(" M", ""); }],
            ["[NO₂] i M", function (V, n) { return Tg.konc(M.konc(n[1]) / V).replace(" M", ""); }],
            ["Y i M", function (V, n) { return NK.betydende(yM(n, V), 2); }]
        ];
        var mig = this;
        var html = '<table class="konc-tabel"><thead><tr><th></th>';
        vis.forEach(function (k) { html += "<th>" + k[0] + "</th>"; });
        html += "<th>nu</th></tr></thead><tbody>";
        raekker.forEach(function (r) {
            var kl = r[0] === "Y i M" ? ' class="y"' : "";
            html += "<tr" + kl + "><td>" + r[0] + "</td>";
            vis.forEach(function (k) { html += "<td>" + r[1](k[1], k[2]) + "</td>"; });
            var nuTekst = r[2] ? String(mig.antal(r[2])) : r[1](nu[1], nu[2]);
            if (r[0] === "V i L") nuTekst = NK.betydende(mig.Vvis, 2);
            html += "<td><b>" + nuTekst + "</b></td></tr>";
        });
        html += '</tbody></table><p class="konc-k">N₂O₄ og NO₂ er antal molekyler i cylinderen. Et molekyle står for 0,020 mol. K = 0,25 M.</p>';
        NK.saetHTML("s-tal", html);
        var kort = NK.el("s-talkort");
        var omPanel = this.omNu().indexOf("panel") >= 0;
        if (kort) kort.classList.toggle("om", omPanel);
        if (omPanel && !this.panelAabnet && NK.fold) { NK.fold("s-tal", true); this.panelAabnet = true; }
        if (!omPanel) this.panelAabnet = false;
    };

    P.yRel = function () { return M.Y(G, this.n, this.V) / G.K; };

    /* ----- Scenen -------------------------------------------------------------------------- */
    P.stempelY = function (V) {
        var C = this.lay ? this.lay.C : { top: 0, bund: 300 };
        return C.bund - (C.bund - C.top - 10) * V / VMAX;
    };

    P.layout = function () {
        var W = this.L.b, Hs = this.baand().y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.y0 = 10 + this.kortZone() + 8;
        /* Cylinderen vokser med skaermen, og hoejre side faar resten, men
           tallinjen bliver hoejst 560 bred (brugeren 20. nov. 2026: paa store
           skaerme fyldte mikrofiguren for lidt og aksen med Y for meget) */
        var cx = Math.max(34, W * 0.04);
        var cb = NK.klamp(Math.min(W * 0.4, W - cx - 24 - 130 - 30 - 26 - 310), 200, 520);
        /* Knapperne Molekyler og Dansere staar over cylinderen. Rammer de
           haandtaget, naar stemplet er trukket helt op, rykker cylinderen ned. */
        lay.vis1 = { x: cx, y: lay.y0 + 4, b: 86, h: 26 };
        lay.vis2 = { x: cx + 90, y: lay.y0 + 4, b: 74, h: 26 };
        var ned = cx + 170 > cx + cb / 2 - 52 ? 30 : 0;
        lay.C = { x: cx, b: cb, top: lay.y0 + 78 + ned, bund: Hs - 34 };
        lay.k = NK.klamp(cb / 290, 1, 1.45);
        lay.knapX = cx + cb + 24;
        lay.knapB = 130;
        var my = (lay.C.top + lay.C.bund) / 2;
        lay.ned = { x: lay.knapX, y: my + 8, b: lay.knapB, h: 40 };
        lay.op = { x: lay.knapX, y: my - 48, b: lay.knapB, h: 40 };
        var rx = lay.knapX + lay.knapB + 30;
        lay.rx = rx;
        lay.rw = Math.max(260, W - rx - 26);
        lay.skemaY = lay.y0 + 16;
        lay.sigY = lay.y0 + 56;
        lay.formelY = lay.y0 + 142;
        lay.tlY = lay.formelY + 104;
        lay.tlW = Math.min(lay.rw, 560);
        lay.tlX = rx + (lay.rw - lay.tlW) / 2;
        var gammel = this.lay;
        this.lay = lay;
        var R = this.rum();
        if (gammel && gammel.C && gammel.C.bund - gammel.C.top > 80 && lay.C.bund - lay.C.top > 80) {
            var sx = lay.C.b / gammel.C.b, gy0 = gammel.C.bund;
            this.mol.forEach(function (m) {
                m.x = lay.C.x + (m.x - gammel.C.x) * sx;
                m.y = lay.C.bund - (gy0 - m.y) * (lay.C.bund - lay.C.top) / (gammel.C.bund - gammel.C.top);
            });
        } else {
            this.mol.forEach(function (m) {
                m.x = R.x0 + 24 + Math.random() * (R.x1 - R.x0 - 48);
                m.y = R.y0 + 20 + Math.random() * Math.max(4, R.y1 - R.y0 - 40);
            });
        }
        this.saetAnker("cylinder", lay.C.x - 12, lay.y0 + 34, lay.C.b + 24, lay.C.bund - lay.y0 - 24);
        this.saetAnker("knapper", lay.knapX - 6, lay.op.y - 6, lay.knapB + 12, 104);
        this.saetAnker("visning", lay.vis1.x - 4, lay.vis1.y - 4, 172, 34);
        this.saetAnker("tallinje", lay.tlX - 10, lay.formelY - 34, lay.tlW + 20, lay.tlY + 54 - lay.formelY + 34);
        this.visPanel();
    };

    P.opdaterScene = function (dt) {
        var lay = this.lay, mig = this;
        if (!lay) return;

        /* Stemplet flytter sig */
        if (this.trin === "stempel") {
            this.t += dt;
            var u = NK.blod(NK.klamp(this.t / STEMPEL_TID, 0, 1));
            this.Vvis = NK.lerp(this.Vfra, this.Vtil, u);
            if (this.t >= STEMPEL_TID) {
                this.Vvis = this.V = this.Vtil;
                this.efter = { V: this.V, n: kopi(this.n) };
                this.trin = "lige";
                this.t = 0;
            }
        } else if (this.trin === "lige") {
            var rep = REPLIKKER[this.handling] || REPLIKKER.ned;
            var dans = this.visning === "dansere";
            this.t += dt;
            if (dans && this.replik === 0 && this.t >= 0.3) { this.sig(this.tilfaeldigDanser(), rep.start); this.replik = 1; }
            if (dans && this.replik === 1 && this.t >= 1.4) {
                this.vaelgPartnere();
                if (this.partner) this.sig(this.partner.a, rep.spoerg);
                this.replik = 2;
            }
            if (dans && this.replik === 2 && this.t >= 2.4) {
                if (this.partner) this.sig(this.partner.c || this.partner.a, rep.svar);
                this.replik = 3;
            }
            if (this.t >= (dans ? LIGE_DANS : LIGE_EFTER)) {
                this.trin = "reaktion";
                this.base = kopi(this.n);
                this.xi = 0;
                this.xiMaal = M.ligevaegtXi(G, this.base, this.V);
                this.haendelser = 0;
                this.haendelseT = 0;
                this.t = 0;
            }
        } else if (this.trin === "reaktion") {
            this.xi += (this.xiMaal - this.xi) * (1 - Math.exp(-HASTIGHED * dt));
            if (Math.abs(this.xiMaal - this.xi) < 2e-3) this.xi = this.xiMaal;
            this.n = M.efter(G, this.base, this.xi);
            var maal = Math.round(this.xiMaal);
            var nu = this.xi >= 0 ? Math.floor(this.xi + 0.5 + 1e-9) : -Math.floor(-this.xi + 0.5 + 1e-9);
            if (Math.abs(nu) > Math.abs(maal)) nu = maal;
            this.haendelseT -= dt;
            if (nu !== this.haendelser && this.haendelseT <= 0) {
                var mod = nu > this.haendelser ? 1 : -1;
                this.taler = null;
                if (this.haendelse(mod)) this.haendelser += mod; else this.haendelser = nu;
                this.haendelseT = this.visning === "dansere" ? 1.0 : 0.35;
                var k = Math.abs(this.haendelser);
                var rp = REPLIKKER[this.handling] || REPLIKKER.ned;
                if (k >= 2 && this.taler) this.sig(this.taler, rp.naeste[Math.min(k - 2, rp.naeste.length - 1)], 1.2);
            }
            if (this.xi === this.xiMaal && this.haendelser === maal && this.haendelseT <= 0) {
                this.t += dt;
                if (this.t >= PAUSE) {
                    this.trin = "hvile";
                    var rs = REPLIKKER[this.handling] || REPLIKKER.ned;
                    this.sig(this.taler || this.tilfaeldigDanser(), rs.slut);
                    this.klaret();
                }
            }
        }

        /* Molekylerne bevaeger sig i gassen under stemplet */
        var R = this.rum(), k = lay.k || 1;
        this.mol.forEach(function (m) {
            if (m.til) {
                m.tilT -= dt;
                var t = NK.klamp(1 - m.tilT / 0.45, 0, 1);
                m.x = NK.lerp(m.x, m.til.x, t * 0.3);
                m.y = NK.lerp(m.y, m.til.y, t * 0.3);
                if (m.tilT <= 0) m.vaek = true;
                return;
            }
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            m.v += m.w * dt;
            var r = (m.slags === "N2O4" ? 17 : 13) * k;
            if (m.x < R.x0 + r) { m.x = R.x0 + r; m.vx = Math.abs(m.vx); }
            if (m.x > R.x1 - r) { m.x = R.x1 - r; m.vx = -Math.abs(m.vx); }
            if (m.y < R.y0 + r) { m.y = R.y0 + r; m.vy = Math.abs(m.vy); }
            if (m.y > R.y1 - r) { m.y = R.y1 - r; m.vy = -Math.abs(m.vy); }
            if (m.fade > 0) m.fade = Math.max(0, m.fade - dt * 2.5);
            if (m.blink > 0) {
                m.blink -= dt;
                if (m.blink <= 0.25 && m.nyt) {
                    m.slags = m.nyt;
                    m.nyt = null;
                    if (m.dele) {
                        m.dele = false;
                        var ny = mig.nytMolekyle("NO2", m.x + 8, m.y);
                        ny.vx = -m.vx; ny.vy = -m.vy;
                        ny.fade = 1;
                    }
                }
                if (m.blink < 0) m.blink = 0;
            }
        });
        this.mol = this.mol.filter(function (m) { return !m.vaek; });
        var tid = this.tid;
        this.bobler = this.bobler.filter(function (b) { return tid - b.t0 < b.varighed && !b.m.vaek && !b.m.til; });
        this.visPanel();
    };

    /* ----- Tegning ------------------------------------------------------------------------------ */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var om = this.omNu(), C = lay.C;

        /* Visningen: molekyler eller dansere */
        [["molekyler", lay.vis1, "Molekyler"], ["dansere", lay.vis2, "Dansere"]].forEach(function (v) {
            Tg.knap(ctx, v[1], v[2], { farve: mig.visning === v[0] ? "gul" : "graa", px: 13, over: mig.hover === v[0] });
        });

        /* Cylinderen med gassen, der er brun efter [NO2] */
        var sY = this.stempelY(this.Vvis);
        var no2 = M.konc(this.n[1]) / this.Vvis;
        var brun = 0.9 * no2 / 0.20;
        var dansere = this.visning === "dansere";
        var c = Tg.cylinder(ctx, C, sY, brun, function () {
            mig.mol.forEach(function (m) {
                var a = 1 - (m.fade || 0);
                if (m.blink > 0) {
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, 20, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 223, 107, " + (0.45 * Math.min(1, m.blink / 0.3)) + ")";
                    ctx.fill();
                }
                if (dansere) Tg.dansere(ctx, m.slags, m.x, m.y - 4, m.v * 3, 0.95 * lay.k);
                else Tg.molekyle(ctx, m.slags, m.x, m.y, m.v, 0.85 * lay.k, a);
            });
        });
        this.haandtag = c.haandtag;
        /* Rumfanget ved stemplet */
        Tg.maerkat(ctx, "V = " + NK.betydende(this.Vvis, 2) + " L", C.x + C.b + 16, sY + 2, { justering: "left", px: 13 });
        if (om.indexOf("cylinder") >= 0) Tg.omRing(ctx, C.x - 6, sY - 8, C.b + 12, C.bund - sY + 14, 12);

        /* Knapperne til indgrebet */
        var till = this.tilladte();
        if (till.indexOf("ned") >= 0) {
            Tg.knap(ctx, lay.ned, "Pres ned ▼", { farve: "groen", over: this.hover === "ned" });
            Tg.ring(ctx, lay.ned.x, lay.ned.y, lay.ned.b, lay.ned.h, this.tid, 10);
            Tg.skilt(ctx, "Klik: halvt rumfang", lay.ned.x + lay.ned.b / 2, lay.ned.y - 8, 8, lay.W - 8);
        }
        if (till.indexOf("op") >= 0) {
            Tg.knap(ctx, lay.op, "Træk op ▲", { farve: "groen", over: this.hover === "op" });
            Tg.ring(ctx, lay.op.x, lay.op.y, lay.op.b, lay.op.h, this.tid, 10);
            Tg.skilt(ctx, "Klik: dobbelt rumfang", lay.op.x + lay.op.b / 2, lay.op.y - 8, 8, lay.W - 8);
        }
        if (om.indexOf("stempel") >= 0 && till.length) Tg.omRing(ctx, lay.knapX - 4, lay.op.y - 4, lay.knapB + 8, 96, 12);
        if (this.trin === "lige") {
            NK.tekst(ctx, "Lige efter indgrebet", C.x + C.b + 16, sY + 34, { font: Tg.font("800", 14), farve: Tg.GUL });
        }
        /* Dansernes talebobler */
        if (dansere) {
            this.bobler.forEach(function (b) {
                var alder = mig.tid - b.t0;
                var a = Math.min(NK.klamp(alder / 0.2, 0, 1), NK.klamp((b.varighed - alder) / 0.3, 0, 1));
                Tg.boble(ctx, b.m.x, b.m.y - 18 * lay.k, b.tekst, a, 6, lay.knapX + lay.knapB + 40);
            });
        }

        /* Reaktionsskemaet, signaturen, broeken og tallinjen til hoejre */
        var mx = lay.rx + lay.rw / 2;
        var skema = "N₂O₄(g) ⇌ 2 NO₂(g)";
        NK.tekst(ctx, skema, mx, lay.skemaY + 6, { font: Tg.font("700", 18), farve: "#ffffff", justering: "center" });
        ctx.font = Tg.font("700", 18);
        Tg.maerkat(ctx, "K = 0,25 M", mx + ctx.measureText(skema).width / 2 + 12, lay.skemaY, { justering: "left", farve: Tg.K_FARVE, px: 13 });
        this.felter = Tg.signatur(ctx, mx, lay.sigY, [
            { slags: "N2O4", tekst: "N₂O₄ er farveløs" }, { slags: "NO2", tekst: "NO₂ er brun" }
        ], lay.rw);
        var o = this.opg.o;
        if (this.synlig("retning") && !this.faerdig) Tg.retning(ctx, mx, lay.sigY + 34, "forskydes mod venstre", -1);
        if (this.synlig("broek")) {
            var fb = Tg.broekLed(ctx, mx, lay.formelY, [["[NO₂]", 2]], [["[N₂O₄]", 1]], this.synlig("faktor") ? o.faktor : null, 17);
            if (om.indexOf("formel") >= 0) Tg.omRing(ctx, fb.x - 4, lay.formelY - 28, fb.b + 8, 56, 10);
        } else {
            Tg.plads(ctx, mx - 90, lay.formelY - 28, 180, 56, "reaktionsbrøken");
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
                foer: (spaa || (this.foer && this.trin !== "stempel")) ? 1 : null,
                maal: this.trin === "reaktion" || (spaa && this.synlig("retning"))
            });
            if (om.indexOf("tallinje") >= 0) Tg.omRing(ctx, lay.tlX - 8, lay.tlY - 44, lay.tlW + 16, 92, 12);
        } else {
            Tg.plads(ctx, lay.tlX, lay.tlY - 30, lay.tlW, 70, "tallinjen med Y og K");
        }

        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (!pt || !this.lay) { this.hover = null; return null; }
        var lay = this.lay, till = this.tilladte();
        this.hover = null;
        if (till.indexOf("ned") >= 0 && Tg.i(lay.ned, pt)) { this.hover = "ned"; return "klik"; }
        if (till.indexOf("op") >= 0 && Tg.i(lay.op, pt)) { this.hover = "op"; return "klik"; }
        if (Tg.i(lay.vis1, pt)) { this.hover = "molekyler"; return "klik"; }
        if (Tg.i(lay.vis2, pt)) { this.hover = "dansere"; return "klik"; }
        if (Tg.feltVed(this.felter, pt) || this.molekyleVed(pt)) return "klik";
        return null;
    };

    P.molekyleVed = function (pt) {
        for (var i = this.mol.length - 1; i >= 0; i--) {
            var m = this.mol[i];
            if (!m.til && (m.x - pt.x) * (m.x - pt.x) + (m.y - pt.y) * (m.y - pt.y) < 16 * 16) return m;
        }
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var lay = this.lay, till = this.tilladte();
        /* At skifte visning og se naermere paa stofferne er altid i orden */
        if (Tg.i(lay.vis1, pt)) { this.visning = "molekyler"; return; }
        if (Tg.i(lay.vis2, pt)) { this.visning = "dansere"; return; }
        var knap = Tg.i(lay.ned, pt) ? "ned" : (Tg.i(lay.op, pt) ? "op" : "");
        if (knap && till.indexOf(knap) >= 0) {
            if (this.spaer()) return;
            this.indgreb(knap);
            return;
        }
        var f = Tg.feltVed(this.felter, pt);
        if (f) { this.kortBesked(D.partikel(f.slags), 6); return; }
        var m = this.molekyleVed(pt);
        if (m) {
            this.kortBesked(this.visning === "dansere" ? (m.slags === "N2O4" ? "Et par dansere er ét N₂O₄-molekyle." : "En danser alene er ét NO₂-molekyle.") : D.partikel(m.slags), 5);
            return;
        }
        var iCyl = pt.x >= lay.C.x - 50 && pt.x <= lay.knapX + lay.knapB && pt.y >= lay.y0 + 30 && pt.y <= lay.C.bund + 6;
        if (iCyl) {
            if (this.iForsoeg() && this.trin !== "hvile") { this.kortBesked("Vent, til Y står ved K på tallinjen.", 3); return; }
            if (!this.iForsoeg()) this.kortBlink();
        }
    };

    P.enter = function () {
        var till = this.tilladte();
        if (till.length && !this.spaer()) this.indgreb(till[0]);
    };

    NK.SimStempel = SimStempel;
}());
