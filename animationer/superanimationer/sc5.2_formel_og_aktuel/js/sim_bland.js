/* =====================================================================
   sim_bland.js - fane 3: blandinger

   Fire opgaver om en ion, der kommer fra to salte. I den foerste vejes
   to salte af og opløses i det samme glas vand: eleven regner foerst
   stofmaengderne (n = m / M), saa koncentrationerne (c = n / V) og saa
   bidragene til [ion], der laegges sammen. I de andre haeldes to glas,
   A og B, sammen: stofmaengderne laegges sammen, og rumfanget bliver
   det samlede. Eleven skriver formlen og tallet (n = k · c · V med
   tallet foran ionen) og saa rumfanget og koncentrationen.

   Scenen goer det, der er regnet: i den foerste opgave kommer et salt i
   vandet, naar dets koncentration er fundet. I de andre haeldes A og B
   i blandingsglasset, naar rumfanget er fundet. Naar ionens
   koncentration er fundet, viser luppen ionerne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimBland() {
        this.sidstTal = {};
        this.part = new NK.Partikler(41);
        this.startFane(D.BLAND);
        this.regning = new NK.Regning({ vaert: NK.el("bland-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimBland.prototype;
    NK.Fane.paa(P, { navn: "bland" });
    NK.Regning.paa(P);

    P.harNyeTal = function () { return true; };
    P.harForfra = function () { return false; };

    /* ----- Opgaven --------------------------------------------------------------- */
    P.lavOpgave = function (i, nyeTal) {
        var spec = D.BLAND[i];
        var tal = nyeTal ? this.traek(spec.tal, this.sidstTal[spec.id]) : (this.sidstTal[spec.id] || spec.tal[0]);
        this.sidstTal[spec.id] = tal;
        var o = { fane: 3, id: spec.id, titel: spec.titel, tekst: spec.tekst, tal: tal, ion: tal.ion || spec.ion, ion2: tal.ion2 };
        if (o.id === "samme") o.trin = ["nSA", "nSB", "cSA", "cSB", "bidragA", "bidragB", "total"];
        else o.trin = ["nA", "nB", "Vsum", "ionBland"].concat(o.ion2 ? ["ion2"] : []);
        o.facit = K.facitBland(o);
        this.opg = o;
        this.regning.saet(o);
        this.part = new NK.Partikler(41 + i);
        this.nyScene();
    };

    P.promptHTML = function () {
        var o = this.opg, t = o.tal;
        var s = o.tekst.replace("{A}", D.salt(t.A).formel).replace("{B}", D.salt(t.B).formel)
            .replace("{cA}", t.cA ? K.c(t.cA) : "").replace("{cB}", t.cB ? K.c(t.cB) : "")
            .replace("{mA}", t.mA ? K.g(t.mA) : "").replace("{mB}", t.mB ? K.g(t.mB) : "")
            .replace("{VA}", t.VA ? K.mL(t.VA) + " mL" : "").replace("{VB}", t.VB ? K.mL(t.VB) + " mL" : "")
            .replace("{V}", t.V ? K.mL(t.V) + " mL" : "")
            .replace("{ion}", D.ion(o.ion).t).replace("{ion}", D.ion(o.ion).t).replace("{ion2}", o.ion2 ? D.ion(o.ion2).t : "");
        return '<p class="maal-tekst">' + NK.html(s) + "</p>";
    };

    P.data = function () {
        var o = this.opg, t = o.tal, A = D.salt(t.A), B = D.salt(t.B);
        if (o.id === "samme") {
            return ["m(" + A.formel + ") = " + K.g(t.mA) + " g    M(" + A.formel + ") = " + K.M(A) + " g/mol",
                    "m(" + B.formel + ") = " + K.g(t.mB) + " g    M(" + B.formel + ") = " + K.M(B) + " g/mol",
                    "V = " + K.mL(t.V) + " mL"];
        }
        return ["A: " + K.mL(t.VA) + " mL " + K.c(t.cA) + " M " + A.formel, "B: " + K.mL(t.VB) + " mL " + K.c(t.cB) + " M " + B.formel];
    };

    P.slutLinje = function () {
        var o = this.opg, f = o.facit, ion = D.ion(o.ion).t;
        if (o.id === "samme") return NK.html("Ionerne er i det samme glas, så bidragene lægges sammen: [" + ion + "] = " + K.c(f.total) + " M.");
        var t = "[" + ion + "] = " + K.c(f.ionBland) + " M i blandingen.";
        if (o.ion2) t += " [" + D.ion(o.ion2).t + "] = " + K.c(f.ion2) + " M: ionen fra det ene glas fordeler sig i det hele.";
        else if (o.id === "lige") t += " Stofmængderne lægges sammen, og det gør rumfangene også.";
        return NK.html(t);
    };

    /* ----- Scenen ------------------------------------------------------------------
       I den foerste opgave: saltene paa vaegtene (bunke 1 = hele portionen),
       de salte, der er i vandet (iGlas), og spatlen paa vej (flyv). */
    P.nyScene = function () {
        var t = this.opg.tal;
        this.s = { VA: t.VA || 0, VB: t.VB || 0, Vmix: 0, nMix: {}, poseA: { dx: 0, dy: 0, v: 0 }, poseB: { dx: 0, dy: 0, v: 0 },
                   straale: null, koe: [], aktiv: null, vist: false,
                   bunke: { A: 1, B: 1 }, iGlas: {}, flyv: null, skyer: [] };
        if (this.opg.id === "samme") this.s.Vmix = t.V;
    };

    P.trin = function (dur, fn, slut, start) { this.s.koe.push({ dur: dur, fn: fn, slut: slut, start: start, t: 0 }); };

    /* Glas A eller B haeldes i blandingsglasset */
    P.haeld = function (hvem) {
        var s = this.s, lay = this.lay, t = this.opg.tal;
        var g = hvem === "A" ? lay.glasA : lay.glasB, mix = lay.mix, pose = hvem === "A" ? s.poseA : s.poseB;
        var tud = { x: g.x0 + 12 * g.k, y: g.y0 + 12 * g.k };
        var dx = mix.ind.x1 - 18 * mix.k - tud.x, dy = mix.ind.top - 34 - tud.y;
        var V0 = hvem === "A" ? t.VA : t.VB;
        var salt = hvem === "A" ? t.A : t.B, c = hvem === "A" ? t.cA : t.cB;
        var mixV0;
        this.trin(0.6, function (u) { pose.dx = dx * u; pose.dy = dy * u; });
        this.trin(0.35, function (u) { pose.v = -1.15 * u; });
        this.trin(1.1, function (u) {
            s[hvem === "A" ? "VA" : "VB"] = V0 * (1 - u);
            s.Vmix = mixV0 + V0 * u;
            s.straale = { x: tud.x + dx, y: tud.y + dy };
        }, function () {
            s.straale = null;
            s.nMix[salt] = (s.nMix[salt] || 0) + c * V0 / 1000;
        }, function () { mixV0 = s.Vmix; });
        this.trin(0.6, function (u) { pose.v = -1.15 * (1 - u); pose.dx = dx * (1 - u); pose.dy = dy * (1 - u); });
    };

    /* Saltet paa vaegt A eller B kommer i vandet med spatlen */
    P.oploes = function (hvem) {
        var s = this.s, mig = this, salt = this.opg.tal[hvem];
        this.trin(1.0, function (u) {
            s.flyv = { hvem: hvem, u: u };
            s.bunke[hvem] = Math.max(0, 1 - u * 5);
        }, function () {
            s.flyv = null;
            s.bunke[hvem] = 0;
            s.iGlas[salt] = true;
            var g = mig.lay.mix;
            s.skyer.push({ x: g.cx, y: g.ymL(s.Vmix) + 16 * g.k, r: 10 * g.k, a: 1 });
        });
    };

    P.efterTrin = function (id) {
        if (id === "Vsum") { this.haeld("A"); this.haeld("B"); }
        if (id === "cSA") this.oploes("A");
        if (id === "cSB") this.oploes("B");
        if (id === "ionBland" || id === "total") this.s.vist = true;
    };

    P.opdaterScene = function (dt) {
        var s = this.s;
        if (!s) return;
        if (!s.aktiv && s.koe.length) {
            s.aktiv = s.koe.shift();
            if (s.aktiv.start) s.aktiv.start();
        }
        var a = s.aktiv;
        if (a) {
            a.t += dt / a.dur;
            a.fn(NK.blod(Math.min(1, a.t)));
            if (a.t >= 1) { s.aktiv = null; if (a.slut) a.slut(); }
        }
        var k = this.lay && this.lay.mix ? this.lay.mix.k : 1;
        s.skyer.forEach(function (sk) { sk.r += 60 * k * dt; sk.a -= 0.5 * dt; });
        s.skyer = s.skyer.filter(function (sk) { return sk.a > 0; });
        var ioner = this.ionListe();
        var mig = this;
        this.part.saet(ioner.map(function (id) { return s.vist ? Tg.prikker(mig.ionMix(id)) : 0; }));
        this.part.opdater(dt);
    };

    /* Ionerne i blandingen (eller i glasset i foerste opgave) */
    P.ionListe = function () {
        var t = this.opg.tal, A = D.salt(t.A), B = D.salt(t.B), ud = [];
        [A.kat, B.kat, A.an, B.an].forEach(function (id) { if (ud.indexOf(id) < 0) ud.push(id); });
        return ud;
    };

    P.ionMix = function (id) {
        var o = this.opg, t = o.tal, A = D.salt(t.A), B = D.salt(t.B);
        if (o.id === "samme") return K.k(A, id) * o.facit.cSA + K.k(B, id) * o.facit.cSB;
        var V = (t.VA + t.VB) / 1000;
        return (K.k(A, id) * t.cA * t.VA / 1000 + K.k(B, id) * t.cB * t.VB / 1000) / V;
    };

    /* Farven: kun jern(III)chlorid farver */
    P.farve = function (hvem) {
        var o = this.opg, t = o.tal, st, c = 0;
        if (hvem === "A" || hvem === "B") {
            st = D.salt(hvem === "A" ? t.A : t.B);
            return Tg.vaeske(st, hvem === "A" ? t.cA : t.cB);
        }
        var fe = ["A", "B"].filter(function (h) { return D.salt(t[h]).opl; })[0];
        if (!fe) return Tg.vaeske(null, 0);
        st = D.salt(t[fe]);
        if (o.id === "samme") c = this.s.iGlas[t[fe]] ? (fe === "A" ? o.facit.cSA : o.facit.cSB) : 0;
        else c = this.s.Vmix > 0 ? (this.s.nMix[t[fe]] || 0) / (this.s.Vmix / 1000) : 0;
        return Tg.vaeske(st, c);
    };

    /* ----- Musen ------------------------------------------------------------------- */
    P.overScene = function () { return null; };
    P.nedScene = function (pt) {
        var lay = this.lay;
        if (!lay) return false;
        function i(r) { return r && pt.x >= r.x0 && pt.x <= r.x0 + r.b && pt.y >= r.y0 && pt.y <= r.y0 + r.h; }
        if (this.opg.id === "samme") {
            if (i(lay.vaegtA) || i(lay.vaegtB)) {
                this.kortBesked("Saltet er vejet af. Det kommer i vandet, når du har regnet dets koncentration.");
            } else if (i(lay.mix)) {
                this.kortBesked(K.mL(this.opg.tal.V) + " mL vand. Et salt kommer i, når du har regnet dets koncentration.");
            }
            return false;
        }
        if (i(lay.glasA) || i(lay.glasB) || i(lay.mix)) this.kortBesked("Glassene hældes sammen, når du har regnet det samlede rumfang.");
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var Hs = H;
        var lay = { W: W, H: H, Hs: Hs };
        var samme = this.opg && this.opg.id === "samme";
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.08, 20, 48));
        var zr = Math.round(NK.klamp(Math.min(Hs * 0.13, W * 0.09), 44, 92));
        lay.zoom = { x: 16 + zr + 8, y: 16 + 24 + zr, r: zr };
        var tx = lay.zoom.x + zr + NK.klamp(W * 0.04, 24, 50);
        /* Den foerste opgave har syv trin, saa tavlen er hoejere */
        lay.tavle = { x: tx, y: 16, b: W - tx - 18, h: Math.round(samme ? NK.klamp(Hs * 0.5, 180, 380) : NK.klamp(Hs * 0.42, 160, 320)) };
        var top = Math.max(lay.zoom.y + zr + 70, lay.tavle.y + lay.tavle.h + 22);
        /* Glassene fylder hoejden ud, men tre glas skal kunne staa ved siden af hinanden */
        var gh = NK.klamp(Math.min((lay.bordY - top) * 0.95, W * 0.33), 90, 220);
        var gb = gh * 160 / 200;
        lay.vaegtA = lay.vaegtB = null;
        if (samme) {
            /* Vaegt A, vaegt B og glasset med vand */
            var vb = NK.klamp(Math.min(W * 0.17, gh * 1.05), 100, 200);
            var mel = NK.klamp(W * 0.04, 16, 44);
            var x0 = Math.max(16, (W - (2 * vb + gb + 2.5 * mel)) / 2);
            lay.vaegtA = vaegtGeo(x0 + vb / 2, lay.bordY, vb);
            lay.vaegtB = vaegtGeo(x0 + vb * 1.5 + mel, lay.bordY, vb);
            lay.mix = Tg.glasGeo(x0 + 2 * vb + 2.5 * mel, lay.bordY, gh);
            lay.glasA = lay.glasB = null;
        } else {
            var mellem = NK.klamp(W * 0.08, 30, 90);
            var xm = Math.max(24, (W - 3 * gb - 2 * mellem) / 2);
            lay.mix = Tg.glasGeo(xm, lay.bordY, gh);
            lay.glasA = Tg.glasGeo(xm + gb + mellem, lay.bordY, gh);
            lay.glasB = Tg.glasGeo(xm + 2 * (gb + mellem), lay.bordY, gh);
        }
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("glas", 10, top - 10, W - 20, lay.bordY - top + 40);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 26, 2 * zr, 2 * zr + 60);
    };

    /* Vaegten: midten cx, bordet y, bredden b; skaalen og vejebaaden */
    function vaegtGeo(cx, y, b) {
        var M = NK.Sprites.MAAL.vaegt, k = b / M.b, h = Tg.vaegtHoejde(b);
        var skaalY = y - M.bund * k + M.skaalY * k;
        var bb = M.skaalB * k * 0.8;
        return { cx: cx, y: y, b: b, k: k, x0: cx - b / 2, y0: skaalY - 40 * k, h: y - skaalY + 40 * k,
                 skaalY: skaalY, baadB: bb, top: y - M.bund * k, vH: h };
    }

    /* ----- Tegn ---------------------------------------------------------------------- */
    function tegnGlas(ctx, g, VmL, farve, pose) {
        ctx.save();
        if (pose && (pose.dx || pose.dy || pose.v)) {
            var px = g.x0 + 12 * g.k, py = g.y0 + 12 * g.k;
            ctx.translate(px + pose.dx, py + pose.dy);
            ctx.rotate(pose.v);
            ctx.translate(-px, -py);
        }
        Tg.glas(ctx, g, VmL, farve, 0);
        ctx.restore();
    }

    function skilt(ctx, tekst, x, y, farve) {
        NK.tekst(ctx, tekst, x, y, { font: Tg.font("700", 14), justering: "center", linje: "middle", farve: farve || "#dfe6ee" });
    }

    /* Skyerne, hvor saltet loeses op, inde i glasset under overfladen */
    function tegnSkyer(ctx, g, VmL, skyer) {
        if (!skyer.length) return;
        ctx.save();
        var ly = g.ymL(VmL);
        ctx.beginPath();
        ctx.rect(g.ind.x0, ly, g.ind.x1 - g.ind.x0, g.ind.bund - ly);
        ctx.clip();
        skyer.forEach(function (s) {
            var gr = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, s.r);
            gr.addColorStop(0, "rgba(255, 255, 255, " + (0.4 * s.a) + ")");
            gr.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    /* Den foerste opgave: to vaegte med saltet og glasset med vand */
    P.tegnOploes = function (ctx, ly) {
        var lay = this.lay, s = this.s, o = this.opg, t = o.tal, f = o.facit, r = this.regning;
        var mig = this;
        ["A", "B"].forEach(function (h) {
            var v = h === "A" ? lay.vaegtA : lay.vaegtB, st = D.salt(t[h]), m = h === "A" ? t.mA : t.mB;
            var tom = s.bunke[h] <= 0.001;
            Tg.vaegt(ctx, v.cx, v.y, v.b, (tom ? "0,00" : K.g(m)) + " g");
            Tg.bunke(ctx, v.cx, v.skaalY, v.baadB, st, s.bunke[h], 20 * v.k + 6, h === "A" ? 1 : 2);
            skilt(ctx, st.formel, v.cx, ly);
            /* Stofmaengden staar ved bunken, naar den er regnet */
            if (!tom && r.loest(h === "A" ? "nSA" : "nSB")) {
                skilt(ctx, K.mol(h === "A" ? f.nSA : f.nSB) + " mol", v.cx, v.skaalY - 56 * v.k - 12, "#9fe0b0");
            }
        });
        var g = lay.mix;
        tegnGlas(ctx, g, s.Vmix, this.farve("mix"), null);
        tegnSkyer(ctx, g, s.Vmix, s.skyer);
        skilt(ctx, K.mL(t.V) + " mL vand", g.cx, ly);
        /* Spatlen fra vejebaaden op over glasset og ned i vandet */
        if (s.flyv) {
            var v0 = s.flyv.hvem === "A" ? lay.vaegtA : lay.vaegtB, st0 = D.salt(t[s.flyv.hvem]);
            var u = s.flyv.u, sb = NK.klamp(g.h * 0.45, 70, 140);
            var x0 = v0.cx, y0 = v0.skaalY - 8 * v0.k, x1 = g.cx, y1 = g.ind.top - 10 * g.k;
            var x = NK.lerp(x0, x1, u), y = NK.lerp(y0, y1, u) - Math.sin(u * Math.PI) * 60 * g.k;
            Tg.spatel(ctx, x, y, sb, -0.08 + (u > 0.8 ? (u - 0.8) * 3 : 0), st0, u > 0.9 ? (1 - u) * 10 : 1);
        }
        void mig;
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg, s = this.s;
        if (!lay || !o || !s) return;
        if ((o.id === "samme") !== !!lay.vaegtA) this.layout();
        var t = o.tal, A = D.salt(t.A), B = D.salt(t.B);
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        this.regning.tegnTavle(ctx, lay.tavle, this.data(), this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var ly = Math.min(lay.bordY + 24, lay.Hs - 8);
        if (o.id === "samme") {
            this.tegnOploes(ctx, ly);
        } else {
            tegnGlas(ctx, lay.mix, s.Vmix, this.farve("mix"), null);
            skilt(ctx, "Blandingen", lay.mix.cx, ly);
            skilt(ctx, "A: " + A.formel, lay.glasA.cx, ly);
            skilt(ctx, "B: " + B.formel, lay.glasB.cx, ly);
            if (s.straale) Tg.straale(ctx, s.straale.x, s.straale.y, lay.mix.ymL(s.Vmix), 5, null, this.tid);
            tegnGlas(ctx, lay.glasA, s.VA, this.farve("A"), s.poseA);
            tegnGlas(ctx, lay.glasB, s.VB, this.farve("B"), s.poseB);
        }
        if (s.vist) {
            var v = o.id === "samme" ? o.facit.total : o.facit.ionBland;
            skilt(ctx, "[" + D.ion(o.ion).t + "] = " + K.c(v) + " M", lay.mix.cx, lay.mix.y0 - 14, "#f5dd8a");
        }
        var z = lay.zoom, ioner = this.ionListe();
        var st = { ioner: ioner.map(function (id) { return D.ion(id); }) };
        Tg.zoom(ctx, z.x, z.y, z.r, { part: this.part, st: st, farve: this.farve("mix"), titel: o.id === "samme" ? "Glasset" : "Blandingen",
            tekst: s.vist ? "" : "?", forklar: s.vist });
    };

    NK.SimBland = SimBland;
}());
