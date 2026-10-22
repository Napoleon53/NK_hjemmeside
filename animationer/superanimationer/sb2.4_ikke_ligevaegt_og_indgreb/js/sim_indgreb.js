/* =====================================================================
   sim_indgreb.js - fane 1: Indgreb

   En lukket beholder med CO(g) + H2O(g) <=> CO2(g) + H2(g), K = 4,0
   (NK.Model.gas). Et molekyle i beholderen staar for 0,025 M. Til
   hoejre for beholderen kan eleven pumpe et stof ind (+, 0,10 M) eller
   fjerne det (−, 0,10 M), naar opgaven beder om det. Under beholderen
   staar reaktionsbroeken og tallinjen med Y og K, som i figur 1 i
   Kemibogens afsnit B2.4.

   Efter et indgreb forloeber reaktionen, til Y = K: omfanget xi naermer
   sig ligevaegtens xi, og for hver 0,025 M bliver ét par molekyler lavet
   om (CO + H2O -> CO2 + H2 eller omvendt), saa partiklerne foelger
   koncentrationerne. Panelet viser koncentrationerne foer, lige efter
   og nu.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var G = NK.Model.gas;
    var Tg = NK.Tegn;

    var PORTION = 0.10;          /* et indgreb pumper 0,10 M ind eller fjerner 0,10 M */
    var HASTIGHED = 1.7;         /* hvor hurtigt reaktionen naermer sig ligevaegten (1/s) */
    var PAUSE = 0.7;             /* sekunder ved ligevaegten, foer forsoeget er klaret */
    var STOFFER = G.stoffer;

    function kopi(c) { return { CO: c.CO, H2O: c.H2O, CO2: c.CO2, H2: c.H2 }; }

    function SimIndgreb() {
        this.mol = [];
        this.c = kopi(D.I_MAAL[0].opstil.c);
        this.startFane(D.I_MAAL);
    }

    var P = SimIndgreb.prototype;
    NK.Fane.paa(P, { navn: "i", naesteFane: "fane-b", naesteNavn: "Oxygen i blodet" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) {
        this.opstil(o);
    };

    P.opstil = function (o) {
        o = o || this.opg.o;
        this.tom = !!o.opstil.tom;
        this.c = kopi(o.opstil.c);
        this.start = kopi(o.opstil.c);
        this.foer = null;            /* koncentrationerne foer indgrebet (eller fra start) */
        this.efter = null;           /* lige efter indgrebet */
        this.maade = "";             /* "fyld" eller "indgreb" */
        this.handling = "";          /* det indgreb, eleven lavede ("+CO" ...) */
        this.koerer = false;
        this.fylder = 0;
        this.ventT = 0;
        this.base = kopi(this.c);
        this.xi = 0;
        this.xiMaal = 0;
        this.haendelser = 0;
        this.haendelseT = 0;
        this.mol = [];
        if (!this.tom) this.fyldMolekyler(G.antal(this.c), false);
        if (this.lay) this.visPanel();
    };

    P.nulstilScene = function () { this.opstil(); };

    /* ----- Molekylerne ------------------------------------------------------------------ */
    P.nytMolekyle = function (slags, ind) {
        var B = this.lay ? this.lay.B : { x: 0, y: 0, b: 300, h: 200 };
        var m = {
            slags: slags,
            x: B.x + 30 + Math.random() * (B.b - 60), y: B.y + 30 + Math.random() * (B.h - 60),
            vx: NK.r(-1, 1), vy: NK.r(-1, 1), v: NK.r(0, 6.3), w: NK.r(-1.2, 1.2),
            blink: 0, ind: 0, ud: 0
        };
        var fart = NK.r(28, 46), l = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
        m.vx *= fart / l; m.vy *= fart / l;
        if (ind) {
            /* Kommer ind gennem roeret i venstre side */
            m.ind = 1;
            m.fra = { x: B.x - 26, y: B.y + B.h * 0.5 };
            m.til = { x: B.x + 30 + Math.random() * B.b * 0.45, y: B.y + 30 + Math.random() * (B.h - 60) };
            m.x = m.fra.x; m.y = m.fra.y;
            m.forsink = ind;
        }
        this.mol.push(m);
        return m;
    };

    P.fyldMolekyler = function (antal, ind) {
        var mig = this, liste = [];
        STOFFER.forEach(function (s) { for (var i = 0; i < antal[s]; i++) liste.push(s); });
        liste = NK.bland(liste);
        liste.forEach(function (s, i) { mig.nytMolekyle(s, ind ? 1 + i * 0.05 : 0); });
    };

    P.antalSynlige = function (slags) {
        return this.mol.filter(function (m) { return m.slags === slags && !m.ud; }).length;
    };

    /* Et par molekyler laves om: mod hoejre CO + H2O -> CO2 + H2, mod venstre
       omvendt. Det par, der er taettest paa hinanden, blinker og skifter. */
    P.haendelse = function (mod) {
        var a = mod > 0 ? "CO" : "CO2", b = mod > 0 ? "H2O" : "H2";
        var ny = mod > 0 ? { CO: "CO2", H2O: "H2" } : { CO2: "CO", H2: "H2O" };
        var as = this.mol.filter(function (m) { return m.slags === a && !m.ud && !m.ind; });
        var bs = this.mol.filter(function (m) { return m.slags === b && !m.ud && !m.ind; });
        if (!as.length || !bs.length) return false;
        var bedst = null, d = 1e9;
        as.forEach(function (p) {
            bs.forEach(function (q) {
                var dd = (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y);
                if (dd < d) { d = dd; bedst = [p, q]; }
            });
        });
        bedst.forEach(function (m) { m.blink = 0.55; m.nyt = ny[m.slags]; });
        return true;
    };

    /* ----- Indgreb og fyldning ------------------------------------------------------------ */
    P.fyld = function () {
        this.tom = false;
        this.maade = "fyld";
        this.handling = "fyld";
        this.foer = kopi(this.start);
        this.efter = null;
        this.fyldMolekyler(G.antal(this.c), true);
        this.fylder = 1.6;
        this.nulstilHjaelp();
    };

    P.indgreb = function (kode) {
        var s = kode.slice(1), plus = kode.charAt(0) === "+";
        var maengde = plus ? PORTION : Math.min(PORTION, this.c[s]);
        this.foer = kopi(this.c);
        this.c[s] = Math.max(0, this.c[s] + (plus ? maengde : -maengde));
        if (Math.abs(this.c[s]) < 1e-9) this.c[s] = 0;
        this.efter = kopi(this.c);
        this.maade = "indgreb";
        this.handling = kode;
        var n = Math.round(maengde / G.ENHED + 1e-9), i;
        if (plus) {
            for (i = 0; i < n; i++) this.nytMolekyle(s, 1 + i * 0.12);
        } else {
            var B = this.lay.B;
            var ude = this.mol.filter(function (m) { return m.slags === s && !m.ud && !m.ind; });
            ude.sort(function (p, q) { return p.y - q.y; });
            for (i = 0; i < Math.min(n, ude.length); i++) {
                ude[i].ud = 1;
                ude[i].fra = { x: ude[i].x, y: ude[i].y };
                ude[i].til = { x: B.x + B.b * 0.72, y: B.y - 30 };
                ude[i].forsink = i * 0.12;
            }
        }
        this.startReaktion(0.9);
        this.nulstilHjaelp();
    };

    /* Reaktionen begynder efter en lille pause, saa eleven naar at se Y springe */
    P.startReaktion = function (pause) {
        this.base = kopi(this.c);
        this.xi = 0;
        this.xiMaal = G.ligevaegtXi(this.base);
        this.haendelser = 0;
        this.haendelseT = 0;
        this.koerer = true;
        this.ventT = -(pause || 0);
    };

    P.erLigevaegt = function () {
        return !this.koerer && !this.tom && this.fylder <= 0;
    };

    P.forsoegSvar = function (o) {
        if (o.forsoeg.fyld) { if (this.tom) this.fyld(); return; }
        if (!this.koerer) this.indgreb(o.forsoeg.mere ? "+CO" : o.forsoeg.indgreb[0]);
        this.svarGivet = true;
    };

    /* Klaret, naar reaktionen har naaet ligevaegten igen */
    P.klaret = function () {
        var g = this.opg, o = g.o;
        if (this.faerdig || this.venter || g.fase !== "forsoeg") return;
        if (!o.forsoeg.mere) { this.forsoegKlaret(o.forsoeg.set || ""); return; }
        var h0 = this.start.H2, h1 = this.c.H2;
        var navn = this.handlingNavn(this.handling);
        if (h1 > h0 + 1e-6) {
            this.forsoegKlaret("Du " + navn + ". Ligevægten blev forskudt mod højre, og [H₂] steg fra " +
                Tg.konc(h0) + " til " + Tg.konc(h1) + ".");
            return;
        }
        var hvorfor = this.handling === "-H2" ? "Ligevægten dannede noget H₂ igen, men ikke det hele." :
            "Ligevægten blev forskudt mod venstre, og H₂ blev brugt.";
        this.fejlLinje("Du " + navn + ". " + hvorfor + " [H₂] endte på " + Tg.konc(h1) + ". Prøv et andet indgreb.");
        this.opstil();
    };

    P.handlingNavn = function (kode) {
        var s = D.STOF[kode.slice(1)];
        return kode.charAt(0) === "+" ? "pumpede " + s.f + " ind" : "fjernede " + s.f;
    };

    /* ----- Panelet: koncentrationerne foer, lige efter og nu -------------------------------- */
    P.visPanel = function () {
        var mig = this, kol = [];
        if (this.maade === "fyld") kol = [["fra start", this.foer]];
        else if (this.maade === "indgreb") kol = [["før", this.foer], ["lige efter", this.efter]];
        var tom = this.tom;
        var html = '<table class="konc-tabel"><thead><tr><th></th>';
        kol.forEach(function (k) { html += "<th>" + k[0] + "</th>"; });
        html += "<th>nu</th></tr></thead><tbody>";
        STOFFER.forEach(function (s) {
            var hl = mig.handling && mig.handling.slice(1) === s ? ' class="valgt"' : "";
            html += "<tr" + hl + "><td>[" + D.STOF[s].f + "]</td>";
            kol.forEach(function (k) { html += "<td>" + Tg.konc(k[1][s]) + "</td>"; });
            html += "<td><b>" + (tom ? "–" : Tg.konc(mig.c[s])) + "</b></td></tr>";
        });
        html += '<tr class="y"><td>Y</td>';
        kol.forEach(function (k) { html += "<td>" + Tg.yTal(G.Y(k[1])) + "</td>"; });
        html += "<td><b>" + (tom ? "–" : Tg.yTal(this.yNu())) + "</b></td></tr>";
        html += '</tbody></table><p class="konc-k">K = 4,0. Et molekyle i beholderen står for 0,025 M.</p>';
        NK.saetHTML("i-konc", html);
        var kort = NK.el("i-konckort");
        if (kort) kort.classList.toggle("om", this.omNu().indexOf("panel") >= 0);
    };

    P.yNu = function () { return this.tom ? null : G.Y(this.c); };

    /* ----- Scenen -------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, Hs = this.baand().y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.y0 = 10 + this.kortZone() + 8;
        lay.skemaY = lay.y0 + 4;
        var cw = 196, mellem = 34;
        var rest = Hs - lay.y0 - 40 - 168;
        var bh = NK.klamp(rest, 104, 250);
        var bb = Math.min(bh * 1.75, W - 2 * 22 - cw - mellem - 30);
        bb = Math.max(bb, 220);
        var samlet = bb + mellem + cw;
        var bx = Math.max(40, (W - samlet) / 2 + 10);
        lay.B = { x: bx, y: lay.y0 + 40, b: bb, h: bh };
        lay.C = { x: bx + bb + mellem, y: lay.B.y, b: cw, h: bh };
        lay.formelY = lay.B.y + bh + 18 + 26;
        lay.tlY = lay.formelY + 26 + 46;
        lay.tlW = Math.min(W - 70, 700);
        lay.tlX = (W - lay.tlW) / 2;
        /* Knapperne: én raekke pr. stof */
        var rh = Math.min(48, bh / 4);
        lay.raekker = STOFFER.map(function (s, i) {
            var y = lay.C.y + (bh - rh * 4) / 2 + i * rh + rh / 2;
            return {
                s: s, y: y,
                minus: { x: lay.C.x, y: y - 15, b: 34, h: 30 },
                chip: { x: lay.C.x + 42, y: y - 17, b: cw - 84, h: 34 },
                plus: { x: lay.C.x + cw - 34, y: y - 15, b: 34, h: 30 }
            };
        });
        lay.fyldKnap = { x: lay.B.x + bb / 2 - 92, y: lay.B.y + bh / 2 - 21, b: 184, h: 42 };
        var gammel = this.lay;
        this.lay = lay;
        /* Molekylerne flyttes med beholderen, hvis den er flyttet */
        if (gammel && gammel.B) {
            var dx = lay.B.x - gammel.B.x, dy = lay.B.y - gammel.B.y, sx = lay.B.b / gammel.B.b, sy = lay.B.h / gammel.B.h;
            this.mol.forEach(function (m) {
                m.x = lay.B.x + (m.x - gammel.B.x) * sx; m.y = lay.B.y + (m.y - gammel.B.y) * sy;
                if (m.til) { m.til.x += dx; m.til.y += dy; }
                if (m.fra) { m.fra.x += dx; m.fra.y += dy; }
            });
        } else {
            this.mol.forEach(function (m) {
                m.x = lay.B.x + 30 + Math.random() * (lay.B.b - 60);
                m.y = lay.B.y + 30 + Math.random() * (lay.B.h - 60);
            });
        }
        this.saetAnker("beholder", lay.B.x - 30, lay.B.y - 34, lay.B.b + 40, lay.B.h + 44);
        this.saetAnker("knapper", lay.C.x - 6, lay.C.y - 4, lay.C.b + 12, lay.C.h + 8);
        this.saetAnker("tallinje", lay.tlX - 10, lay.formelY - 30, lay.tlW + 20, lay.tlY + 50 - lay.formelY + 30);
        this.visPanel();
    };

    /* De knapper, eleven maa bruge lige nu (laasen): kun i forsoeget og kun dem,
       opgaven naevner */
    P.tilladte = function () {
        if (!this.iForsoeg() || this.tom || this.koerer || this.fylder > 0) return [];
        return this.opg.o.forsoeg.indgreb || [];
    };

    P.opdaterScene = function (dt) {
        var lay = this.lay, mig = this;
        if (!lay) return;
        var B = lay.B;
        /* Molekylerne bevaeger sig */
        this.mol.forEach(function (m) {
            if (m.ind) {
                if (m.forsink > 0) { m.forsink -= dt; return; }
                m.ind = Math.max(0, m.ind - dt / 0.7);
                var t = NK.blod(1 - m.ind);
                m.x = NK.lerp(m.fra.x, m.til.x, t);
                m.y = NK.lerp(m.fra.y, m.til.y, t) - Math.sin(t * Math.PI) * 10;
                m.v += m.w * dt;
                return;
            }
            if (m.ud) {
                if (m.forsink > 0) { m.forsink -= dt; return; }
                m.ud = Math.max(0.0001, m.ud - dt / 0.7);
                var u = NK.blod(1 - m.ud);
                m.x = NK.lerp(m.fra.x, m.til.x, u);
                m.y = NK.lerp(m.fra.y, m.til.y, u);
                if (m.ud <= 0.0001) m.vaek = true;
                return;
            }
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            m.v += m.w * dt;
            var r = 16;
            if (m.x < B.x + r) { m.x = B.x + r; m.vx = Math.abs(m.vx); }
            if (m.x > B.x + B.b - r) { m.x = B.x + B.b - r; m.vx = -Math.abs(m.vx); }
            if (m.y < B.y + r) { m.y = B.y + r; m.vy = Math.abs(m.vy); }
            if (m.y > B.y + B.h - r) { m.y = B.y + B.h - r; m.vy = -Math.abs(m.vy); }
            if (m.blink > 0) {
                m.blink -= dt;
                if (m.blink <= 0.25 && m.nyt) { m.slags = m.nyt; m.nyt = null; }
                if (m.blink < 0) m.blink = 0;
            }
        });
        this.mol = this.mol.filter(function (m) { return !m.vaek; });

        /* Beholderen fyldes */
        if (this.fylder > 0) {
            this.fylder -= dt;
            if (this.fylder <= 0) { this.fylder = 0; this.startReaktion(0.6); }
        }

        /* Reaktionen naermer sig ligevaegten */
        if (this.koerer) {
            if (this.ventT < 0) {
                this.ventT += dt;
            } else {
                this.xi += (this.xiMaal - this.xi) * (1 - Math.exp(-HASTIGHED * dt));
                if (Math.abs(this.xiMaal - this.xi) < 4e-4) this.xi = this.xiMaal;
                this.c = G.efter(this.base, this.xi);
                /* Partiklerne foelger: ét par for hver 0,025 M */
                var maal = Math.round(this.xi / G.ENHED + (this.xi >= 0 ? 1e-9 : -1e-9));
                this.haendelseT -= dt;
                if (maal !== this.haendelser && this.haendelseT <= 0) {
                    var mod = maal > this.haendelser ? 1 : -1;
                    if (this.haendelse(mod)) this.haendelser += mod;
                    else this.haendelser = maal;
                    this.haendelseT = 0.3;
                }
                if (this.xi === this.xiMaal && this.haendelser === maal && this.haendelseT <= 0) {
                    this.ventT += dt;
                    if (this.ventT >= PAUSE) {
                        this.koerer = false;
                        this.klaret();
                    }
                }
            }
        }
        this.visPanel();
        void mig;
    };

    /* ----- Tegning ------------------------------------------------------------------------------ */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var om = this.omNu(), B = lay.B;

        /* Reaktionsskemaet over beholderen */
        var skema = "CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)";
        NK.tekst(ctx, skema, B.x + B.b / 2, lay.skemaY + 6, { font: Tg.font("700", 18), farve: "#ffffff", justering: "center" });
        ctx.font = Tg.font("700", 18);
        Tg.maerkat(ctx, "K = 4,0", B.x + B.b / 2 + ctx.measureText(skema).width / 2 + 12, lay.skemaY, { justering: "left", farve: Tg.K_FARVE, px: 13 });

        /* Roerene: ind i venstre side, ud foroven */
        ctx.save();
        ctx.fillStyle = "#59606e";
        ctx.fillRect(B.x - 34, B.y + B.h * 0.5 - 7, 34, 14);
        ctx.fillRect(B.x + B.b * 0.72 - 7, B.y - 22, 14, 22);
        ctx.fillStyle = "#c9a227";
        ctx.fillRect(B.x - 24, B.y + B.h * 0.5 - 11, 8, 22);
        ctx.fillRect(B.x + B.b * 0.72 - 11, B.y - 16, 22, 8);
        ctx.restore();

        /* Beholderen: staalramme og en moerk rude */
        ctx.save();
        NK.rundtRekt(ctx, B.x - 7, B.y - 7, B.b + 14, B.h + 14, 16);
        var gr = ctx.createLinearGradient(B.x, B.y - 7, B.x, B.y + B.h + 7);
        gr.addColorStop(0, "#9aa1ad");
        gr.addColorStop(0.5, "#5d6370");
        gr.addColorStop(1, "#3b404b");
        ctx.fillStyle = gr;
        ctx.fill();
        NK.rundtRekt(ctx, B.x, B.y, B.b, B.h, 11);
        var gi = ctx.createLinearGradient(B.x, B.y, B.x, B.y + B.h);
        gi.addColorStop(0, "#1d2733");
        gi.addColorStop(1, "#141b24");
        ctx.fillStyle = gi;
        ctx.fill();
        ctx.restore();

        /* Molekylerne (de blinkende med en gul glorie) */
        ctx.save();
        NK.rundtRekt(ctx, B.x - 40, B.y - 40, B.b + 80, B.h + 80, 11);
        this.mol.forEach(function (m) {
            if (m.ind && m.forsink > 0) return;
            if (m.blink > 0) {
                ctx.beginPath();
                ctx.arc(m.x, m.y, 19, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 223, 107, " + (0.45 * Math.min(1, m.blink / 0.3)) + ")";
                ctx.fill();
            }
            Tg.molekyle(ctx, m.slags, m.x, m.y, m.v, 1);
        });
        ctx.restore();

        if (this.tom) {
            NK.tekst(ctx, "Beholderen er tom", B.x + B.b / 2, B.y + 30, { font: Tg.font("700", 15), farve: "#6f7682", justering: "center" });
            if (this.iForsoeg() && this.opg.o.forsoeg.fyld) {
                Tg.knap(ctx, lay.fyldKnap, "Fyld beholderen ▶", { farve: "gul", over: this.hover === "fyld" });
                Tg.ring(ctx, lay.fyldKnap.x, lay.fyldKnap.y, lay.fyldKnap.b, lay.fyldKnap.h, this.tid, 12);
            }
        }
        if (om.indexOf("beholder") >= 0) Tg.omRing(ctx, B.x - 7, B.y - 7, B.b + 14, B.h + 14, 16);

        /* Knapperne til indgrebene */
        var till = this.tilladte();
        this.felter = [];
        lay.raekker.forEach(function (r) {
            var chip = r.chip;
            NK.rundtRekt(ctx, chip.x, chip.y, chip.b, chip.h, 17);
            ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "#4d5364";
            ctx.stroke();
            Tg.molekyle(ctx, r.s, chip.x + 26, r.y, 0, 0.85);
            NK.tekst(ctx, D.STOF[r.s].f, chip.x + 52, r.y + 5.5, { font: Tg.font("800", 16), farve: "#ffffff" });
            mig.felter.push({ slags: r.s, x: chip.x, y: chip.y, b: chip.b, h: chip.h });
            ["-", "+"].forEach(function (fortegn) {
                var kode = fortegn + r.s, f = fortegn === "+" ? r.plus : r.minus;
                if (till.indexOf(kode) < 0) return;
                Tg.knap(ctx, f, fortegn === "+" ? "+" : "−", { farve: fortegn === "+" ? "groen" : "graa", px: 19, over: mig.hover === kode });
                if (om.indexOf(kode) >= 0) Tg.ring(ctx, f.x, f.y, f.b, f.h, mig.tid, 10);
            });
        });
        if (om.indexOf("knapper") >= 0 && till.length) Tg.omRing(ctx, lay.C.x - 4, lay.C.y, lay.C.b + 8, lay.C.h, 14);
        /* Skiltet ved den knap, opgaven beder om */
        if (till.length === 1) {
            var kode1 = till[0], r1 = lay.raekker[STOFFER.indexOf(kode1.slice(1))];
            var f1 = kode1.charAt(0) === "+" ? r1.plus : r1.minus;
            Tg.skilt(ctx, (kode1.charAt(0) === "+" ? "Klik: mere " : "Klik: fjern ") + D.STOF[kode1.slice(1)].f, f1.x + f1.b / 2, f1.y - 8, 8, lay.W - 8);
        }

        /* Reaktionsbroeken og tallinjen */
        var fb = Tg.broek(ctx, lay.W / 2, lay.formelY, "Y =", "[CO₂] · [H₂]", "[CO] · [H₂O]", { midt: true, px: 16 });
        if (om.indexOf("formel") >= 0) Tg.omRing(ctx, fb.x - 4, lay.formelY - 26, fb.b + 8, 52, 10);
        var vis = !this.gaetNu() && !this.tom;
        var y = this.yNu();
        var tl = Tg.tallinje(ctx, lay.tlX, lay.tlY, lay.tlW, {
            K: G.K, Ktekst: "4,0",
            Y: vis ? y : null,
            yTekst: vis ? "Y = " + Tg.yTal(y) : "Y",
            foer: this.maade === "indgreb" && vis && this.foer ? G.Y(this.foer) : null,
            maal: this.koerer
        });
        this.tl = tl;
        if (om.indexOf("tallinje") >= 0) Tg.omRing(ctx, lay.tlX - 8, lay.tlY - 40, lay.tlW + 16, 86, 12);

        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.knapVed = function (pt) {
        var lay = this.lay, ud = null;
        lay.raekker.forEach(function (r) {
            if (Tg.i(r.plus, pt)) ud = "+" + r.s;
            if (Tg.i(r.minus, pt)) ud = "-" + r.s;
        });
        return ud;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) { this.hover = null; return null; }
        var k = this.knapVed(pt);
        if (k && this.tilladte().indexOf(k) >= 0) { this.hover = k; return "klik"; }
        if (this.tom && this.iForsoeg() && this.opg.o.forsoeg.fyld && Tg.i(this.lay.fyldKnap, pt)) { this.hover = "fyld"; return "klik"; }
        this.hover = null;
        if (Tg.feltVed(this.felter, pt)) return "klik";
        return null;
    };

    P.molekyleVed = function (pt) {
        for (var i = this.mol.length - 1; i >= 0; i--) {
            var m = this.mol[i];
            if (!m.ind && !m.ud && (m.x - pt.x) * (m.x - pt.x) + (m.y - pt.y) * (m.y - pt.y) < 15 * 15) return m;
        }
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var o = this.opg.o;
        /* Fyld beholderen */
        if (this.tom && Tg.i(this.lay.fyldKnap, pt)) {
            if (this.spaer()) return;
            if (!o.forsoeg.fyld) { this.kortBlink(); return; }
            this.fyld();
            return;
        }
        var k = this.knapVed(pt);
        if (k && this.tilladte().indexOf(k) >= 0) {
            if (this.spaer()) return;
            if (k === "+H2" && o.forsoeg.mere) { this.kortBesked("Du må ikke selv pumpe H₂ ind. Find et indgreb, der får beholderen til at danne H₂.", 6); return; }
            if (k.charAt(0) === "-" && this.c[k.slice(1)] < 1e-9) { this.kortBesked("Der er ingen " + D.STOF[k.slice(1)].f + " i beholderen at fjerne.", 4); return; }
            this.indgreb(k);
            return;
        }
        /* At se naermere paa stofferne er altid i orden */
        var f = Tg.feltVed(this.felter, pt);
        if (f) { this.kortBesked(D.partikel(f.slags), 6); return; }
        var m = this.molekyleVed(pt);
        if (m) { this.kortBesked(D.partikel(m.slags), 5); return; }
        /* Et klik i beholderen eller paa knapperne, mens det ikke er tilladt */
        if (Tg.i(this.lay.B, pt) || Tg.i(this.lay.C, pt)) {
            if (this.iForsoeg() && (this.koerer || this.fylder > 0)) { this.kortBesked("Vent, til Y står ved K på tallinjen.", 3); return; }
            if (!this.iForsoeg()) this.kortBlink();
        }
    };

    P.enter = function () {
        if (this.iForsoeg() && this.tom && this.opg.o.forsoeg.fyld) this.fyld();
    };

    NK.SimIndgreb = SimIndgreb;
}());
