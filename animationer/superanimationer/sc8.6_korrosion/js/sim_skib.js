/* =====================================================================
   sim_skib.js - fane 2: Skibet

   Agterenden af et skib i havvand, set fra siden. Skroget er af jern,
   propellen af bronze (regnes som kobber). Paa kajen ligger klodser af
   zink, magnesium og kobber, som eleven traekker ned paa to pladser paa
   skroget. Knappen Sejl 1 år lader et aar gaa: det mindst aedle metal
   afgiver elektronerne, saa enten ruster skroget ved propellen, eller
   ogsaa svinder klodsen (offeranoden), og skroget er beskyttet.

   Rusten og klodsernes rest regnes af K.sejl. Elektronerne og ionerne,
   der tegnes oven paa skibet, viser kun, hvem der afgiver til hvem.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;
    var MF = NK.Mikro.FARVE;

    var AAR_SEK = 2.6;          /* saa laenge varer et aar paa skaermen */
    var PLETTER = 70;

    /* Rustpletterne ligger fast: de samme hver gang (lille taltromle med fast fro) */
    function tromle(fro) {
        var s = fro;
        return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    }

    function SimSkib() {
        var mig = this;
        this.tidknap = NK.el("s-tid");
        this.tidknap.addEventListener("click", function () { mig.sejlKlik(); mig.fokus(); });
        var rnd = tromle(8611);
        this.pletter = [];
        for (var i = 0; i < PLETTER; i++) this.pletter.push({ u: rnd(), v: rnd(), r: 0.6 + rnd() * 0.8, f: rnd() });
        this.part = [];
        this.vaerft();
        this.startFane(D.S_MAAL);
    }

    var P = SimSkib.prototype;
    NK.Fane.paa(P, { navn: "s", naesteFane: "fane-j", naesteNavn: "Rusten" });

    /* ----- Skibet -------------------------------------------------------------------- */
    P.vaerft = function () {
        this.aar = 0;
        this.rust = 0;
        this.klodser = [];
        for (var i = 0; i < K.SKIB.pladser; i++) this.klodser.push(null);
        this.brugt = 0;
        this.rustfri = 0;
        this.sejler = false;
        this.sejlT = 0;
        this.valgt = null;
        this.traek = null;
        this.part = [];
        this.ankomne = 0;
        this.visPanel();
    };

    P.nulstilScene = function () { this.vaerft(); };

    P.tilstand = function () { return { rust: this.rust, klodser: this.klodser }; };

    P.antalKlodser = function (m) {
        return this.klodser.filter(function (k) { return k && (!m || k.metal === m); }).length;
    };

    P.friPlads = function () {
        for (var i = 0; i < this.klodser.length; i++) if (!this.klodser[i]) return i;
        return -1;
    };

    P.monter = function (i, metal) {
        this.klodser[i] = { metal: metal, rest: 100 };
        this.brugt++;
        this.valgt = null;
        this.nulstilHjaelp();
        this.visPanel();
        if (!this.faerdig) this.naesteLinje("", "");
    };

    P.tagAf = function (i) {
        this.klodser[i] = null;
        this.nulstilHjaelp();
        this.visPanel();
        if (!this.faerdig) this.naesteLinje("", "");
    };

    P.hul = function () { return this.rust >= 100; };

    /* ----- Et aar ---------------------------------------------------------------------- */
    P.sejlKlik = function () {
        if (this.sejler || this.hul()) return;
        this.sejler = true;
        this.sejlT = 0;
        this.rustFoer = this.rust;
        this.klodserFoer = this.klodser.map(function (k) { return k ? k.metal : null; });
        this.brugtOp = null;
        this.nulstilHjaelp();
        if (!this.faerdig) this.naesteLinje("", "");
        this.visPanel();
    };

    /* Klodser, der er brugt op, falder af */
    P.rydTomme = function () {
        for (var i = 0; i < this.klodser.length; i++) {
            var k = this.klodser[i];
            if (k && k.rest <= 0) { this.brugtOp = k.metal; this.klodser[i] = null; }
        }
    };

    P.aarSlut = function () {
        this.sejler = false;
        this.aar++;
        this.rydTomme();
        var nyRust = this.rust - this.rustFoer > 0.01;
        this.rustfri = nyRust ? 0 : this.rustfri + 1;
        this.visPanel();
        if (this.hul()) { this.fejlLinje(D.SKIB.hul); return; }
        var g = this.opg;
        if (this.faerdig || g.fase !== "forsoeg") return;
        var id = g.o.id, havde = this.klodserFoer.filter(function (m) { return !!m; });
        if (id === "uden") {
            if (this.rust >= 30) this.forsoegKlaret(g.o.forsoeg.set);
            else if (!nyRust) this.fejlLinje("Skroget rustede ikke, fordi der sad en klods på det. Klik på klodsen for at tage den af, og sejl igen.");
        } else if (id === "klods") {
            if (nyRust) {
                if (!havde.length) this.fejlLinje(D.SKIB.ingenKlods);
                else if (this.brugtOp) this.fejlLinje(D.SKIB.brugtOp(this.brugtOp));
                else this.fejlLinje(D.SKIB.kobber);
            } else if (this.rustfri >= 3) this.forsoegKlaret("");
        } else if (id === "mg") {
            if (this.brugtOp === "Mg") this.forsoegKlaret("");
        } else if (id === "ti") {
            if (this.rust > 0.01) this.fejlLinje(D.SKIB.tiRust);
            else if (this.aar >= 10) this.forsoegKlaret("", D.SKIB.tiLoest(this.brugt));
        }
    };

    /* ----- Maalene ---------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        if (o.vaerft) this.vaerft();
        this.rustfri = 0;
        this.visPanel();
    };

    P.efterOpgave = function () { this.visPanel(); };

    P.forsoegSvar = function (o) {
        var mig = this;
        /* K.sejl retter i det objekt, den faar: rusten hentes tilbage herfra */
        function koer(n) {
            for (var i = 0; i < n; i++) {
                var t = mig.tilstand();
                K.sejl(t, 1);
                mig.rust = t.rust;
                mig.aar++;
                mig.rydTomme();
            }
        }
        var tekst = "";
        if (o.id === "uden") {
            this.vaerft();
            koer(3);
        } else if (o.id === "klods") {
            this.klodser = this.klodser.map(function () { return null; });
            this.monter(0, "Zn");
            koer(3);
        } else if (o.id === "mg") {
            this.klodser = this.klodser.map(function () { return null; });
            this.monter(0, "Mg");
            koer(2);
        } else {
            this.vaerft();
            this.monter(0, "Zn");
            koer(3);
            this.monter(1, "Zn");
            koer(3);
            this.monter(this.friPlads(), "Zn");
            koer(4);
            tekst = D.SKIB.tiLoest(this.brugt);
        }
        this.visPanel();
        return tekst;
    };

    P.sceneLinje = function () {
        var id = this.opg.o.id, n = this.antalKlodser();
        if (this.sejler) return "Skibet sejler. Se på skroget, klodserne og propellen.";
        if (this.hul()) return D.SKIB.hul;
        if (id === "uden") {
            if (n) return "Klik på klodsen på skroget for at tage den af. I denne opgave sejler skibet uden.";
            return "Tryk på Sejl 1 år øverst i scenen." + (this.aar ? " Der er sejlet " + Math.min(this.aar, 3) + " af 3 år." : "");
        }
        if (id === "klods") {
            if (!n) return "Træk en klods fra kajen ned på en af de stiplede pladser på skroget.";
            return "Tryk på Sejl 1 år. Skroget skal klare 3 år uden mere rust (" + Math.min(this.rustfri, 3) + " af 3).";
        }
        if (id === "mg") {
            if (!this.antalKlodser("Mg")) return "Træk en magnesiumklods fra kajen ned på en plads på skroget.";
            return "Tryk på Sejl 1 år, til magnesiumklodsen er brugt op.";
        }
        if (this.rust > 0.01) return D.SKIB.tiRust;
        if (!n) return "Sæt en klods på skroget, før skibet sejler.";
        return "Tryk på Sejl 1 år. År " + this.aar + " af 10. Klodser brugt: " + this.brugt + ".";
    };

    P.spmLinje = function () {
        if (this.opg.o.id === "zink" && !this.antalKlodser("Zn") && !this.sejler) {
            return "Sæt en zinkklods på skroget, sejl et år, og vælg så et svar i opgavekortet til højre.";
        }
        return "";
    };

    P.enter = function () { this.sejlKlik(); };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.visPanel = function () {
        var html = "";
        function raekke(a, b, kl) {
            return '<div class="talraekke"><span>' + NK.html(a) + '</span><span class="tal' + (kl ? " " + kl : "") + '">' + NK.html(b) + "</span></div>";
        }
        html += raekke("År siden værftet", String(this.aar));
        html += raekke("Rust på skroget ved propellen", Math.round(this.rust) + " %", this.rust > 0.5 ? "roed" : "");
        this.klodser.forEach(function (k, i) {
            html += raekke("Plads " + (i + 1), k ? K.navn(k.metal) + ", " + Math.ceil(k.rest) + " % tilbage" : "tom");
        });
        html += raekke("Klodser brugt", String(this.brugt));
        NK.saetHTML("s-skib", html);
        NK.saetTekst("s-aartal", String(this.aar));
        var tekst = this.sejler ? "Skibet sejler …" : "Sejl 1 år ▶";
        if (this.tidknap.textContent !== tekst) this.tidknap.textContent = tekst;
        this.tidknap.disabled = this.sejler || this.hul();

        /* Spaendingsraekken kommer frem, naar eleven selv har fundet en klods, der virker */
        var kort = NK.el("s-raekkekort");
        if (!this.status) { kort.hidden = true; return; }
        kort.hidden = !this.erLoest("klods");
        var anode = K.skibAnode(this.klodser), paa = ["Fe", "Cu"];
        this.klodser.forEach(function (k) { if (k && paa.indexOf(k.metal) < 0) paa.push(k.metal); });
        var note = anode === "Fe" ? "Jern er det mindst ædle metal på skibet lige nu. Skroget afgiver elektronerne og ruster."
            : D.Stort(K.navn(anode)) + " er det mindst ædle metal på skibet lige nu. Klodsen afgiver elektronerne, og skroget er beskyttet.";
        NK.saetHTML("s-raekke", Tg.raekkeHTML(["Mg", "Zn", "Fe", "Cu"], paa, anode) + '<p class="note">' + NK.html(note) + "</p>");
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        /* Vandlinjen ligger saa lavt, at kajens klodser er fri af knapperne oeverst */
        var yv = Math.round(Math.max(Hs * 0.3, 190)), yb = Math.round(Hs * 0.8), Dy = yb - yv;
        var xs = W * 0.3;
        lay.yv = yv;
        lay.yb = yb;
        lay.xs = xs;
        lay.yd = yv - Math.round(Hs * 0.1);
        lay.B = { x: xs + 8, y: yv + 0.1 * Dy };
        lay.C = { x: xs + W * 0.13, y: yv + 0.34 * Dy };
        lay.Dp = { x: xs + W * 0.15, y: yv + 0.5 * Dy };
        lay.E = { x: xs + W * 0.17, y: yb };
        lay.prop = { x: xs + W * 0.105, y: yv + 0.5 * Dy, r: Math.min(0.2 * Dy, W * 0.06) };
        lay.ror = { x: xs + W * 0.032, y: yv + 0.2 * Dy, b: W * 0.03, h: 0.62 * Dy };
        /* Pladserne til klodserne paa skroget */
        var pb = NK.klamp(W * 0.08, 60, 80), ph = 36;
        lay.plads = [];
        for (var i = 0; i < K.SKIB.pladser; i++) {
            lay.plads.push({ x: xs + W * (0.3 + 0.17 * i) - pb / 2, y: yv + 0.26 * Dy - ph / 2, b: pb, h: ph });
        }
        /* Kajen med stablerne */
        lay.kajX = W * 0.23;
        lay.kajY = yv - 24;
        lay.stak = {};
        var sb = NK.klamp(W * 0.055, 44, 58);
        K.SKIB.klodser.forEach(function (m, j) {
            lay.stak[m] = { x: lay.kajX * (0.2 + 0.3 * j) - sb / 2, y: lay.kajY - 26, b: sb, h: 26, metal: m };
        });
        /* Omraadet, rustpletterne ligger i (inden for skroget, fra propellen og frem) */
        lay.rust = { x0: lay.Dp.x + 4, x1: Math.min(W - 10, xs + W * 0.62), y0: yv + 0.44 * Dy, y1: yb - 8 };
        lay.aksel = lay.Dp.y;
        this.lay = lay;
        this.saetAnker("kaj", 6, lay.kajY - 82, lay.kajX, 96);
        this.saetAnker("pladser", lay.plads[0].x - 8, lay.plads[0].y - 8, lay.plads[lay.plads.length - 1].x + pb - lay.plads[0].x + 16, ph + 40);
        this.saetAnker("propel", lay.prop.x - lay.prop.r * 0.7, lay.prop.y - lay.prop.r - 6, lay.Dp.x - lay.prop.x + lay.prop.r * 0.7 + 60, 2 * lay.prop.r + 12);
    };

    P.pladsMidte = function (i) {
        var p = this.lay.plads[i];
        return { x: p.x + p.b / 2, y: p.y + p.h / 2 };
    };

    /* Pletten paa skroget, der ruster nu: den naeste i raekken fra propellen */
    P.rustPunkt = function () {
        var n = NK.klamp(Math.round(this.rust / 100 * PLETTER), 0, PLETTER - 1);
        var p = this.pletSorteret()[n];
        return { x: p.x, y: p.y };
    };

    P.pletSorteret = function () {
        var lay = this.lay, R = lay.rust;
        if (this._pl && this._plW === lay.W && this._plH === lay.Hs) return this._pl;
        var liste = this.pletter.map(function (p) {
            return { x: R.x0 + p.u * p.u * (R.x1 - R.x0), y: R.y0 + p.v * (R.y1 - R.y0), r: p.r, f: p.f };
        });
        liste.sort(function (a, b) {
            return Math.hypot(a.x - lay.Dp.x, a.y - lay.Dp.y) - Math.hypot(b.x - lay.Dp.x, b.y - lay.Dp.y);
        });
        this._pl = liste;
        this._plW = lay.W;
        this._plH = lay.Hs;
        return liste;
    };

    P.opdaterScene = function (dt) {
        var mig = this, i;
        if (this.sejler) {
            var foer = this.sejlT;
            this.sejlT = Math.min(1, this.sejlT + dt / AAR_SEK);
            var t = this.tilstand();
            K.sejl(t, this.sejlT - foer);
            this.rust = t.rust;
            this.klodser.forEach(function (k) { if (k && k.rest <= 0) mig.brugtOp = mig.brugtOp || k.metal; });
            this.udsend(dt);
            this.visPanel();
            if (this.sejlT >= 1 || this.hul()) this.aarSlut();
        }
        /* Partiklerne oven paa skibet */
        for (i = this.part.length - 1; i >= 0; i--) {
            var p = this.part[i];
            if (p.type === "e") {
                var maal = p.sti[p.seg + 1], dx = maal.x - p.x, dy = maal.y - p.y, d = Math.hypot(dx, dy), skridt = 250 * dt;
                if (d <= skridt) {
                    p.x = maal.x; p.y = maal.y; p.seg++;
                    if (p.seg >= p.sti.length - 1) {
                        this.part.splice(i, 1);
                        this.ankomne++;
                        if (this.ankomne % 4 === 0) this.dannOH(maal);
                    }
                } else { p.x += dx / d * skridt; p.y += dy / d * skridt; }
            } else {
                p.alder += dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.alder > 2.8) this.part.splice(i, 1);
            }
        }
    };

    /* Mens skibet sejler: det mindst aedle metal sender en ion ud i vandet og to elektroner mod kobberet */
    P.udsend = function (dt) {
        var lay = this.lay, mig = this;
        this.sendT = (this.sendT || 0) - dt;
        if (this.sendT > 0) return;
        this.sendT = 0.42;
        var anode = K.skibAnode(this.klodser), fra;
        if (anode === "Fe") fra = this.rustPunkt();
        else {
            var ofre = [];
            this.klodser.forEach(function (k, i) { if (k && k.metal === anode && k.rest > 0) ofre.push(i); });
            fra = this.pladsMidte(NK.tilfaeldig(ofre));
        }
        /* Elektronerne gaar til propellen, og til en kobberklods, hvis der sidder en */
        var maal = [{ x: lay.prop.x, y: lay.prop.y, aksel: true }];
        if (anode === "Fe") {
            this.klodser.forEach(function (k, i) { if (k && k.metal === "Cu") maal.push(mig.pladsMidte(i)); });
        }
        this.sendNr = (this.sendNr || 0) + 1;
        var m = maal[this.sendNr % maal.length];
        var sti = m.aksel ? [fra, { x: fra.x, y: lay.aksel }, { x: m.x, y: m.y }] : [fra, { x: m.x, y: fra.y }, { x: m.x, y: m.y }];
        for (var i = 0; i < 2; i++) {
            this.part.push({ type: "e", sti: sti, seg: 0, x: fra.x + (i ? 12 : -12), y: fra.y });
        }
        this.part.push({ type: "ion", sym: anode, x: fra.x, y: fra.y, vx: NK.r(-22, 10), vy: NK.r(-34, -14), alder: 0 });
    };

    P.dannOH = function (ved) {
        for (var i = 0; i < 4; i++) {
            this.part.push({ type: "oh", x: ved.x - 18 + NK.r(-8, 8), y: ved.y + NK.r(-34, 34), vx: NK.r(-70, -40), vy: NK.r(-14, 14), alder: 0.6 });
        }
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        this.tegnHav(ctx, lay);
        this.tegnSkib(ctx, lay);
        this.tegnKaj(ctx, lay);
        this.tegnPartikler(ctx);
        if (this.traek) this.tegnKlods(ctx, this.traek.x, this.traek.y, lay.stak[this.traek.metal].b, 26, this.traek.metal, 100);
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    P.tegnHav = function (ctx, lay) {
        var W = lay.W, Hs = lay.Hs, yv = lay.yv;
        var g = ctx.createLinearGradient(0, 0, 0, yv);
        g.addColorStop(0, "#1b2130");
        g.addColorStop(1, "#2a3447");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, yv);
        g = ctx.createLinearGradient(0, yv, 0, Hs);
        g.addColorStop(0, "#1c5175");
        g.addColorStop(1, "#0d2438");
        ctx.fillStyle = g;
        ctx.fillRect(0, yv, W, lay.H - yv);
        /* Fisken */
        var fx = ((this.tid * 34) % (W + 120)) - 60, fy = Hs * 0.9 + Math.sin(this.tid * 1.3) * 6;
        this.fisk = { x: fx, y: fy };
        ctx.fillStyle = "#e7913c";
        ctx.beginPath();
        ctx.ellipse(fx, fy, 17, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(fx - 14, fy);
        ctx.lineTo(fx - 27, fy - 8);
        ctx.lineTo(fx - 27, fy + 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(fx + 9, fy - 2, 1.8, 0, Math.PI * 2);
        ctx.fill();
    };

    P.skrogSti = function (ctx, lay) {
        var W = lay.W;
        ctx.beginPath();
        ctx.moveTo(lay.xs, lay.yd);
        ctx.lineTo(lay.B.x, lay.B.y);
        ctx.quadraticCurveTo(lay.xs + W * 0.06, lay.B.y + (lay.C.y - lay.B.y) * 0.2, lay.C.x, lay.C.y);
        ctx.lineTo(lay.Dp.x, lay.Dp.y);
        ctx.quadraticCurveTo(lay.Dp.x, lay.yb, lay.E.x, lay.yb);
        ctx.lineTo(W + 30, lay.yb);
        ctx.lineTo(W + 30, lay.yd);
        ctx.closePath();
    };

    P.tegnSkib = function (ctx, lay) {
        var W = lay.W, yv = lay.yv, yd = lay.yd, xs = lay.xs, mig = this, i;

        /* Overbygningen */
        var ox = xs + W * 0.12, ob = W * 0.2, oh = Math.min(38, yd - 60);
        if (oh > 14) {
            ctx.fillStyle = "#d9dde3";
            ctx.fillRect(ox, yd - oh, ob, oh);
            ctx.fillStyle = "#33435c";
            for (i = 0; i < 5; i++) ctx.fillRect(ox + 12 + i * (ob - 24) / 5, yd - oh + 8, (ob - 24) / 5 - 8, Math.min(12, oh - 16));
        }
        ctx.strokeStyle = "#8d96a3";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xs, yd - 9);
        ctx.lineTo(W, yd - 9);
        for (var rx = xs + 6; rx < W; rx += 26) { ctx.moveTo(rx, yd - 9); ctx.lineTo(rx, yd); }
        ctx.stroke();

        /* Roret og akslen */
        ctx.fillStyle = "#5c6673";
        ctx.fillRect(lay.ror.x, lay.ror.y, lay.ror.b, lay.ror.h);
        ctx.fillStyle = "#4b545f";
        ctx.fillRect(lay.ror.x + lay.ror.b * 0.4, lay.B.y, lay.ror.b * 0.2, lay.ror.y - lay.B.y + 4);
        ctx.fillStyle = "#8d7a4a";
        ctx.fillRect(lay.prop.x, lay.prop.y - 5, lay.Dp.x - lay.prop.x + 4, 10);

        /* Skroget: jern under vandlinjen, malet over den */
        this.skrogSti(ctx, lay);
        var g = ctx.createLinearGradient(0, yv, 0, lay.yb);
        g.addColorStop(0, "#7e8998");
        g.addColorStop(1, "#59626f");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.save();
        this.skrogSti(ctx, lay);
        ctx.clip();
        ctx.fillStyle = "#262d3c";
        ctx.fillRect(0, yd - 2, W + 40, yv - yd + 2);
        ctx.fillStyle = "#b9c0ca";
        ctx.fillRect(0, yv - 5, W + 40, 3);
        /* Pladerne i skroget */
        ctx.strokeStyle = "rgba(20, 24, 30, 0.28)";
        ctx.lineWidth = 1;
        for (var py = yv + 34; py < lay.yb; py += 46) {
            ctx.beginPath(); ctx.moveTo(0, py + 0.5); ctx.lineTo(W + 40, py + 0.5); ctx.stroke();
        }
        for (var pxx = xs + 40; pxx < W + 40; pxx += 96) {
            ctx.beginPath(); ctx.moveTo(pxx + 0.5, yv); ctx.lineTo(pxx + 0.5, lay.yb); ctx.stroke();
        }
        /* Rusten: pletterne naermest propellen foerst */
        var pl = this.pletSorteret(), vis = this.rust / 100 * PLETTER;
        for (i = 0; i < pl.length && i < vis; i++) {
            var p = pl[i], st = Math.min(1, vis - i) * (9 + 13 * p.r);
            ctx.fillStyle = p.f < 0.5 ? "#a9521f" : "#8a3f15";
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, st * 1.25, st * 0.8, p.f * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.hul()) {
            ctx.fillStyle = "#07090d";
            ctx.beginPath();
            ctx.ellipse(lay.Dp.x + 34, lay.Dp.y + 26, 30, 17, 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        this.skrogSti(ctx, lay);
        ctx.strokeStyle = "#1a1e26";
        ctx.lineWidth = 2;
        ctx.stroke();
        NK.tekst(ctx, "M/S REDOX", xs + W * 0.36, yd + (yv - yd) / 2 + 3, {
            font: Tg.font("700", 15), farve: "#e9eef4", linje: "middle"
        });

        /* Propellen: tre blade, set fra siden */
        var pr = lay.prop, v = this.sejler ? this.tid * 9 : 0.6;
        ctx.fillStyle = "#c79a45";
        ctx.strokeStyle = "#7d5f22";
        ctx.lineWidth = 1.5;
        for (i = 0; i < 3; i++) {
            var a = v + i * Math.PI * 2 / 3, laengde = Math.cos(a) * pr.r;
            ctx.beginPath();
            ctx.ellipse(pr.x, pr.y - laengde / 2, 9, Math.max(3, Math.abs(laengde) / 2), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.ellipse(pr.x, pr.y, 13, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#d8ae58";
        ctx.fill();
        ctx.stroke();

        /* Pladserne og klodserne */
        var visPladser = !!this.traek || !!this.valgt || this.antalKlodser() === 0;
        lay.plads.forEach(function (pp, j) {
            var k = mig.klodser[j];
            if (!k) {
                ctx.save();
                ctx.setLineDash([6, 5]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = (mig.traek || mig.valgt) ? "rgba(242, 197, 61, 0.95)" : (visPladser ? "rgba(233, 238, 244, 0.6)" : "rgba(233, 238, 244, 0.3)");
                NK.rundtRekt(ctx, pp.x, pp.y, pp.b, pp.h, 5);
                ctx.stroke();
                ctx.restore();
                return;
            }
            mig.tegnKlods(ctx, pp.x + pp.b / 2, pp.y + pp.h / 2, pp.b - 6, pp.h - 6, k.metal, k.rest);
            Tg.maerkat(ctx, K.navn(k.metal) + " " + Math.ceil(k.rest) + " %", pp.x + pp.b / 2, pp.y + pp.h + 15);
        });

        /* Vandlinjen med smaa boelger */
        ctx.strokeStyle = "rgba(190, 225, 250, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        var fart = this.sejler ? 60 : 14;
        for (var wx = 0; wx <= W; wx += 8) {
            var wy = yv + Math.sin((wx + this.tid * fart) / 26) * 2.2;
            if (wx === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        Tg.maerkat(ctx, "propel af bronze (kobber)", lay.prop.x + 22, lay.prop.y + pr.r + 22, { justering: "right" });
        Tg.maerkat(ctx, "skrog af jern", Math.min(W - 70, xs + W * 0.52), lay.yb - 20);
    };

    /* (x, y): midten. rest: procent tilbage, klodsen svinder ind mod midten. */
    P.tegnKlods = function (ctx, x, y, b, h, metal, rest) {
        var F = K.METAL[metal], f = 0.3 + 0.7 * Math.sqrt(Math.max(0, rest) / 100);
        var bb = b * f, hh = h * (0.45 + 0.55 * f);
        var g = ctx.createLinearGradient(0, y - hh / 2, 0, y + hh / 2);
        g.addColorStop(0, Tg.nuance(F.farve, 0.3));
        g.addColorStop(1, Tg.nuance(F.farve, -0.25));
        NK.rundtRekt(ctx, x - bb / 2, y - hh / 2, bb, hh, 4);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = F.kant;
        ctx.stroke();
        NK.tekst(ctx, metal, x, y + 0.5, { font: Tg.font("800", 14), justering: "center", linje: "middle", farve: metal === "Cu" ? "#2a1407" : "#1b222b" });
    };

    P.tegnKaj = function (ctx, lay) {
        var mig = this;
        /* Paelene og daekket */
        ctx.fillStyle = "#3b3128";
        [0.12, 0.5, 0.88].forEach(function (f) { ctx.fillRect(lay.kajX * f - 5, lay.kajY, 10, lay.Hs - lay.kajY); });
        ctx.fillStyle = "#6b5a48";
        ctx.fillRect(0, lay.kajY, lay.kajX, 12);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(0, lay.kajY, lay.kajX, 2);
        K.SKIB.klodser.forEach(function (m, nr) {
            var s = lay.stak[m], cx = s.x + s.b / 2;
            mig.tegnKlods(ctx, cx + 3, s.y - s.h / 2 + 2, s.b, s.h, m, 100);
            mig.tegnKlods(ctx, cx, s.y + s.h / 2, s.b, s.h, m, 100);
            if (mig.valgt === m) {
                ctx.strokeStyle = "#f2c53d";
                ctx.lineWidth = 2.5;
                NK.rundtRekt(ctx, s.x - 5, s.y - s.h - 3, s.b + 12, 2 * s.h + 6, 6);
                ctx.stroke();
            }
            /* Navnene staar forskudt, saa "magnesium" har plads */
            NK.tekst(ctx, K.navn(m), cx, s.y - s.h - 12 - (nr % 2 ? 17 : 0), { font: Tg.font("700", 13), justering: "center", farve: "#cfd6de", kant: true });
        });
        NK.tekst(ctx, "KAJEN", 14, lay.kajY + 48, { font: Tg.font("700", 13), farve: "rgba(207, 214, 222, 0.6)" });
    };

    P.tegnPartikler = function (ctx) {
        this.part.forEach(function (p) {
            if (p.type === "e") { Tg.kugle(ctx, p.x, p.y, 10, MF.e, "e⁻", 12); return; }
            ctx.save();
            ctx.globalAlpha = p.alder > 2 ? Math.max(0, (2.8 - p.alder) / 0.8) : 1;
            if (p.type === "oh") Tg.kugle(ctx, p.x, p.y, 15, MF.oh, "OH⁻", 12);
            else Tg.kugle(ctx, p.x, p.y, 17, { f: MF.ion[p.sym], k: "#1e3b2a", t: "#0e2416" }, K.ion(p.sym), 12);
            ctx.restore();
        });
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    function inde(pt, r, luft) {
        var a = luft || 0;
        return pt.x >= r.x - a && pt.x <= r.x + r.b + a && pt.y >= r.y - a && pt.y <= r.y + r.h + a;
    }

    P.stakVed = function (pt) {
        var lay = this.lay, fundet = null;
        K.SKIB.klodser.forEach(function (m) {
            var s = lay.stak[m];
            if (inde(pt, { x: s.x, y: s.y - s.h, b: s.b, h: 2 * s.h }, 6)) fundet = m;
        });
        return fundet;
    };

    P.pladsVed = function (pt, luft) {
        for (var j = 0; j < this.lay.plads.length; j++) if (inde(pt, this.lay.plads[j], luft || 4)) return j;
        return -1;
    };

    P.overFisk = function (pt) { return this.fisk && Math.hypot(pt.x - this.fisk.x, pt.y - this.fisk.y) < 26; };

    P.overScene = function (pt) {
        if (!pt || !this.lay) return null;
        if (this.stakVed(pt)) return "greb";
        if (this.pladsVed(pt) >= 0 || this.overFisk(pt)) return "pointer";
        return null;
    };

    P.nedScene = function (pt) {
        var m = this.stakVed(pt);
        if (!m) return false;
        if (this.sejler) { this.kortBesked("Vent, til året er gået.", 3); return false; }
        this.traek = { metal: m, x: pt.x, y: pt.y, x0: pt.x, y0: pt.y, flyttet: false };
        return true;
    };

    P.flytScene = function (pt) {
        var t = this.traek;
        if (!t) return;
        t.x = pt.x;
        t.y = pt.y;
        if (Math.hypot(pt.x - t.x0, pt.y - t.y0) > 7) t.flyttet = true;
    };

    P.opScene = function (pt) {
        var t = this.traek;
        this.traek = null;
        if (!t) return;
        if (!t.flyttet) {
            /* Et klik paa stablen: klodsen er valgt, og et klik paa en plads saetter den paa */
            this.valgt = this.valgt === t.metal ? null : t.metal;
            if (this.valgt) this.kortBesked("Klik på en af de stiplede pladser på skroget, eller træk klodsen derned.", 5);
            return;
        }
        var j = this.pladsVed(pt, 22);
        if (j < 0) return;
        if (this.klodser[j]) { this.kortBesked(this.friPlads() < 0 ? D.SKIB.fuldt : "Den plads er optaget. Slip klodsen på den tomme plads.", 5); return; }
        this.monter(j, t.metal);
    };

    P.klikScene = function (pt) {
        if (this.overFisk(pt)) {
            this.kortBesked(D.PAASKE.fisk, 6, "gul");
            NK.paaskeaeg = (NK.paaskeaeg || 0) + 1;
            return;
        }
        var j = this.pladsVed(pt);
        if (j < 0) return;
        if (this.sejler) { this.kortBesked("Vent, til året er gået.", 3); return; }
        if (this.klodser[j]) { this.tagAf(j); return; }
        if (this.valgt) this.monter(j, this.valgt);
        else this.kortBesked("Træk en klods fra kajen herned.", 4);
    };

    NK.SimSkib = SimSkib;
}());
