/* =====================================================================
   sim_sammen.js - fane 3: Syre/base og redox

   To lyse kort side om side. Til venstre syre/base-reaktionen HCl + H₂O
   fra kapitel 7 med en lup, hvor den orange hydron overfoeres, og
   hydrogenatomets elektron bliver hos chlor (bogens figur 7.2). Til hoejre
   redoxreaktionen 2 Mg + O₂ fra fane 1 med samme lup som dér.

   Opgave 1: eleven klikker paa begge lupper og ser, hvad der overfoeres.
   Opgave 2: fire mærkater (syre, base, reduktionsmiddel, oxidations-
   middel) skal under de fire stoffer; bagefter staar det under hver
   mærkat, hvad stoffet afgiver eller optager. Opgave 3: fire nye
   reaktioner sorteres i de to kort. Lupperne er skjult i opgave 3, for
   opgaven handler om formlerne (intet, der bevaeger sig i baggrunden).

   Et klik paa en lup, der allerede har vist sin reaktion, viser den igen.
   Det er at se naermere og er derfor ikke laast.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var ML = NK.MgLup, HL = NK.HclLup;

    var SIDER = ["sb", "rx"];
    var SKEMA = {
        sb: [{ f: "HCl", id: "hcl" }, { t: "+" }, { f: "H_2O", id: "h2o" }, { pil: true }, { f: "Cl^−" }, { t: "+" }, { f: "H_3O^+" }],
        rx: [{ k: "2", f: "Mg", id: "mg" }, { t: "+" }, { f: "O_2", id: "o2" }, { pil: true }, { k: "2", f: "MgO" }]
    };
    var TITEL = { sb: "Syre/base-reaktion", rx: "Redoxreaktion" };
    var RIGTIG = { hcl: "syre", h2o: "base", mg: "reduktionsmiddel", o2: "oxidationsmiddel" };
    var UNDER = { hcl: "afgiver en hydron", h2o: "optager en hydron", mg: "afgiver elektroner", o2: "optager elektroner" };
    var SLUT = { sb: HL.H_SLUT, rx: ML.T_SLUT };

    function SimSammen() {
        this.lupT = { sb: 0, rx: 0 };
        this.spiller = { sb: false, rx: false };
        this.set = { sb: false, rx: false };
        this.traek = null;
        this.flyttet = false;
        /* Elektronprikkerne i lupperne er et tilvalg, slaaet fra, hver gang siden aabnes */
        this.prikker = false;
        this.startFane(D.S_MAAL);
        var mig = this;
        this.prikKnap = NK.el("s-prikker");
        if (this.prikKnap) this.prikKnap.addEventListener("click", function () { mig.skiftPrikker(); });
    }

    var P = SimSammen.prototype;
    NK.Fane.paa(P, { navn: "s" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) {
        var mig = this;
        var foerst = o.id === "overfoer";
        SIDER.forEach(function (s) {
            mig.lupT[s] = foerst ? 0 : SLUT[s];
            mig.spiller[s] = false;
            mig.set[s] = !foerst;
        });
        this.maerker = o.id === "sorter" ? { hcl: "syre", h2o: "base", mg: "reduktionsmiddel", o2: "oxidationsmiddel" } : { hcl: null, h2o: null, mg: null, o2: null };
        this.maerkerLoest = o.id === "sorter";
        this.plac = {};
        this.orden = [];
        D.SORTER.forEach(function (k) { mig.plac[k.id] = null; });
        this.forkertKort = null;
        this.traek = null;
        this.valgt = null;
        this.groenT = undefined;
    };

    P.erSortering = function () { return this.opg && this.opg.o.id === "sorter"; };
    P.erMaerker = function () { return this.opg && this.opg.o.id === "giver"; };

    P.nulstilScene = function () {
        if (!this.iForsoeg()) { this.kortBlink(); return; }
        if (this.erMaerker()) this.maerker = { hcl: null, h2o: null, mg: null, o2: null };
        else if (this.erSortering()) { var mig = this; Object.keys(this.plac).forEach(function (k) { mig.plac[k] = null; }); this.orden = []; this.forkertKort = null; }
        else this.nyOpgave(this.opg.o);
        this.visIndsend();
    };

    /* ----- Lupperne ----------------------------------------------------------------- */
    P.skiftPrikker = function () {
        this.prikker = !this.prikker;
        if (this.prikKnap) {
            this.prikKnap.classList.toggle("til", this.prikker);
            this.prikKnap.setAttribute("aria-pressed", this.prikker ? "true" : "false");
        }
    };

    /* Tasten E slaar elektronprikkerne til og fra */
    P.tast = function (k) {
        if (k === "e" || k === "E") { this.skiftPrikker(); return true; }
        return false;
    };

    P.spil = function (s) {
        this.lupT[s] = 0;
        this.spiller[s] = true;
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        SIDER.forEach(function (s) {
            if (!mig.spiller[s]) return;
            mig.lupT[s] += dt;
            if (mig.lupT[s] >= SLUT[s] + 0.3) {
                mig.lupT[s] = SLUT[s];
                mig.spiller[s] = false;
                if (!mig.set[s]) {
                    mig.set[s] = true;
                    if (mig.iForsoeg() && mig.opg.o.id === "overfoer" && mig.set.sb && mig.set.rx) mig.forsoegKlaret(mig.delNu().set);
                }
            }
        });
        if (this.groenT !== undefined) { this.groenT += dt; if (this.groenT > 1.6) this.groenT = undefined; }
    };

    P.forsoegSvar = function (o) {
        var mig = this;
        if (o.id === "overfoer") {
            SIDER.forEach(function (s) { if (!mig.set[s]) mig.spil(s); mig.set[s] = true; });
        } else if (o.id === "giver") {
            this.maerker = { hcl: "syre", h2o: "base", mg: "reduktionsmiddel", o2: "oxidationsmiddel" };
            this.maerkerLoest = true;
        } else {
            D.SORTER.forEach(function (k) { mig.plac[k.id] = k.slags; });
            this.orden = D.SORTER.map(function (k) { return k.id; });
            this.forkertKort = null;
        }
        return "";
    };

    P.sceneLinje = function () { return ""; };

    /* ----- Indsend svar --------------------------------------------------------------- */
    P.kanIndsendes = function () {
        var mig = this;
        if (this.erMaerker()) return Object.keys(RIGTIG).every(function (k) { return !!mig.maerker[k]; });
        if (this.erSortering()) return D.SORTER.every(function (k) { return !!mig.plac[k.id]; });
        return false;
    };

    P.ikkeKlar = function () {
        if (this.erMaerker()) return "Sæt alle fire mærkater under stofferne først.";
        return "Træk alle fire reaktioner hen i en af de to bokse først.";
    };

    P.indsendTekst = function () {
        if (this.erSortering()) {
            var n = 0, mig = this;
            D.SORTER.forEach(function (k) { if (mig.plac[k.id]) n++; });
            return n < 4 ? "Indsend svar (" + n + " af 4)" : "Indsend svar";
        }
        return "Indsend svar";
    };

    P.forsoegIndsend = function () {
        var mig = this;
        if (this.erMaerker()) {
            var f = D.giverFejl(this.maerker);
            if (f) { this.fejlLinje(f); return; }
            this.maerkerLoest = true;
            this.groenT = 0;
            this.nulstilHjaelp();
            this.forsoegKlaret(this.delNu().set);
            return;
        }
        if (this.erSortering()) {
            var forkert = null;
            D.SORTER.forEach(function (k) { if (!forkert && mig.plac[k.id] !== k.slags) forkert = k; });
            if (forkert) { this.forkertKort = forkert.id; this.fejlLinje(forkert.fejl); return; }
            this.forkertKort = null;
            this.groenT = 0;
            this.nulstilHjaelp();
            this.forsoegKlaret();
        }
    };

    /* ----- Geometrien ------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, ctx = this.L.ctx, mig = this;
        var top = 10 + this.kortZone() + 8, kant = 16, gap = 18;
        var kortB = (W - 2 * kant - gap) / 2;
        var lpx = Math.round(NK.klamp(kortB * 0.03, 12, 16));
        var sort = this.erSortering();
        var kortH0 = 40;
        var cardW = Math.min(360, kortB - 10), cardH = NK.klamp(H * 0.055, 34, 44);
        var bakkeH = sort ? 2 * cardH + 30 : Math.max(58, lpx * 2 + 24);
        var kortH = H - top - 12 - bakkeH - 12;
        var kort = {}, lay = { W: W, H: H, top: top, lpx: lpx, kort: kort, cardW: cardW, cardH: cardH };
        SIDER.forEach(function (s, i) {
            var x = kant + i * (kortB + gap), y = top;
            var R = { x: x, y: y, b: kortB, h: kortH };
            /* skemaets skriftstoerrelse: saa stort, at det kan vaere i kortet */
            var Fs = 30;
            while (Fs > 14 && mig.skemaBredde(ctx, s, Fs) > kortB - 28) Fs -= 1;
            var yTitel = y + 20, ySkema = y + kortH0 + Fs * 0.55;
            var yMaerke = ySkema + Fs * 0.6 + 18 + lpx;
            var maerkeBund = yMaerke + lpx + 18;
            var lup = { x: x + 12, y: maerkeBund + 8, b: kortB - 24, h: y + kortH - 12 - (maerkeBund + 8) };
            kort[s] = { R: R, Fs: Fs, yTitel: yTitel, ySkema: ySkema, yMaerke: yMaerke, maerkeBund: maerkeBund, lup: lup };
        });
        lay.bakke = { x: kant, y: top + kortH + 12, b: W - 2 * kant, h: bakkeH };
        this.lay = lay;
        SIDER.forEach(function (s) { kort[s].skema = mig.skemaPos(ctx, s); });
        this.pladser = this.lavPladser();
        this.saetAnker("sb", kort.sb.R.x, kort.sb.R.y, kort.sb.R.b, kort.sb.R.h);
        this.saetAnker("rx", kort.rx.R.x, kort.rx.R.y, kort.rx.R.b, kort.rx.R.h);
        this.saetAnker("bakke", lay.bakke.x, lay.bakke.y, lay.bakke.b, lay.bakke.h);
    };

    P.skemaBredde = function (ctx, s, F) {
        var b = 0;
        SKEMA[s].forEach(function (d) {
            if (d.pil) b += F * 1.6;
            else if (d.t) b += Tg.formelBredde(ctx, d.t, F);
            else b += (d.k ? Tg.formelBredde(ctx, d.k + " ", F) : 0) + Tg.formelBredde(ctx, d.f, F);
            b += F * 0.3;
        });
        return b - F * 0.3;
    };

    P.skemaPos = function (ctx, s) {
        var k = this.lay.kort[s], F = k.Fs, x = k.R.x + k.R.b / 2 - this.skemaBredde(ctx, s, F) / 2, dele = [], stoffer = {};
        SKEMA[s].forEach(function (d) {
            var b;
            if (d.pil) { dele.push({ pil: true, x: x, b: F * 1.6 }); x += F * 1.6 + F * 0.3; return; }
            if (d.t) { b = Tg.formelBredde(ctx, d.t, F); dele.push({ t: d.t, x: x }); x += b + F * 0.3; return; }
            var kb = d.k ? Tg.formelBredde(ctx, d.k + " ", F) : 0, fb = Tg.formelBredde(ctx, d.f, F);
            dele.push({ k: d.k, f: d.f, x: x, kb: kb });
            if (d.id) stoffer[d.id] = x + kb + fb / 2;
            x += kb + fb + F * 0.3;
        });
        return { dele: dele, stoffer: stoffer };
    };

    /* Mærkaternes pladser under de fire stoffer */
    P.lavPladser = function () {
        var l = this.lay, ctx = this.L.ctx, ud = [];
        var mb = 0;
        ["Syre", "Base", "Reduktionsmiddel", "Oxidationsmiddel"].forEach(function (t) { mb = Math.max(mb, Tg.brikBredde(ctx, t, l.lpx)); });
        mb += 6;
        SIDER.forEach(function (s) {
            var k = l.kort[s], ids = Object.keys(k.skema.stoffer);
            var c = ids.map(function (id) { return k.skema.stoffer[id]; });
            if (c[1] - c[0] < mb + 12) {
                var m = (c[0] + c[1]) / 2;
                c = [m - (mb + 12) / 2, m + (mb + 12) / 2];
            }
            /* parret flyttes samlet ind i kortet, saa de to pladser aldrig overlapper */
            var lav = k.R.x + mb / 2 + 10, hoej = k.R.x + k.R.b - mb / 2 - 10;
            if (c[0] < lav) { c[1] += lav - c[0]; c[0] = lav; }
            if (c[1] > hoej) { c[0] -= c[1] - hoej; c[1] = hoej; }
            ids.forEach(function (id, i) {
                var cx = c[i];
                ud.push({ id: id, side: s, x: cx - mb / 2, y: k.yMaerke - l.lpx, b: mb, h: l.lpx * 2, stofX: k.skema.stoffer[id] });
            });
        });
        return ud;
    };

    /* Bakken: mærkaterne (opgave 2) eller reaktionerne (opgave 3), der ikke er sat paa */
    P.bakkeFelter = function () {
        var l = this.lay, ctx = this.L.ctx, mig = this, ud = [];
        if (!this.iForsoeg()) return ud;
        if (this.erMaerker()) {
            var brugt = Object.keys(this.maerker).map(function (k) { return mig.maerker[k]; });
            var liste = ["syre", "base", "reduktionsmiddel", "oxidationsmiddel"].filter(function (b) { return brugt.indexOf(b) < 0; });
            var gap = 18, felter = liste.map(function (b) { return { brik: b, b: Tg.brikBredde(ctx, D.BRIKKER[b].tekst, l.lpx), h: l.lpx * 2 }; });
            var samlet = felter.reduce(function (s, f) { return s + f.b; }, 0) + gap * Math.max(0, felter.length - 1);
            var x = l.W / 2 - samlet / 2, cy = l.bakke.y + l.bakke.h / 2;
            felter.forEach(function (f) { f.x = x; f.y = cy - f.h / 2; f.cx = x + f.b / 2; f.cy = cy; x += f.b + gap; ud.push(f); });
            return ud;
        }
        if (this.erSortering()) {
            var ikke = D.SORTER.filter(function (k) { return !mig.plac[k.id]; });
            var cw = l.cardW, ch = l.cardH, g = 12;
            D.SORTER.forEach(function (k, i) {
                if (ikke.indexOf(k) < 0) return;
                var kol = i % 2, raek = Math.floor(i / 2);
                var x = l.W / 2 + (kol ? g / 2 : -g / 2 - cw), y = l.bakke.y + 10 + raek * (ch + 10);
                ud.push({ kortId: k.id, x: x, y: y, b: cw, h: ch });
            });
        }
        return ud;
    };

    /* De sorterede reaktioner i et kort (opgave 3) */
    P.zone = function (s) {
        var k = this.lay.kort[s];
        return { x: k.R.x + 12, y: k.maerkeBund + 8, b: k.R.b - 24, h: k.R.y + k.R.h - 12 - (k.maerkeBund + 8) };
    };

    P.zoneFelter = function (s) {
        var z = this.zone(s), mig = this, l = this.lay, liste = this.orden.filter(function (id) { return mig.plac[id] === s; });
        var ch = Math.min(l.cardH, (z.h - 10) / 4 - 6), to = ch < 30;
        if (to) ch = Math.min(l.cardH, (z.h - 10) / 2 - 6);
        var cw = to ? (z.b - 30) / 2 : Math.min(z.b - 20, l.cardW);
        return liste.map(function (id, i) {
            var kol = to ? i % 2 : 0, raek = to ? Math.floor(i / 2) : i;
            var x = to ? z.x + 10 + kol * (cw + 10) : z.x + z.b / 2 - cw / 2;
            return { kortId: id, x: x, y: z.y + 8 + raek * (ch + 6), b: cw, h: ch };
        });
    };

    /* ----- Tegningen -------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, l = this.lay, mig = this;
        if (!l) return;
        var W = l.W, H = l.H, om = this.omNu();
        ctx.clearRect(0, 0, W, H);
        SIDER.forEach(function (s) { mig.tegnKort(ctx, s, om); });

        /* Bakken */
        var felter = this.bakkeFelter();
        if (this.iForsoeg() && (this.erMaerker() || this.erSortering())) {
            NK.rundtRekt(ctx, l.bakke.x, l.bakke.y, l.bakke.b, l.bakke.h, 12);
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
            ctx.fill();
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = om.indexOf("kort") >= 0 ? "rgba(242, 197, 61, 0.9)" : "rgba(255, 255, 255, 0.14)";
            ctx.lineWidth = om.indexOf("kort") >= 0 ? 2.5 : 1.5;
            ctx.stroke();
            ctx.restore();
        }
        felter.forEach(function (f) {
            if (mig.traek && mig.flyttet && (mig.traek.brik === f.brik && f.brik || mig.traek.kortId === f.kortId && f.kortId)) return;
            if (f.brik) {
                var bk = D.BRIKKER[f.brik];
                Tg.brik(ctx, bk.tekst, f.cx, f.cy, l.lpx, { b: f.b, h: f.h });
                if (mig.valgt === f.brik) Tg.ring(ctx, f.x, f.y, f.b, f.h, 11);
            } else {
                mig.tegnReaktion(ctx, f, f.kortId, mig.valgt === f.kortId);
            }
        });
        if (this.iForsoeg() && felter.length && !this.traek && felter.length === (this.erMaerker() ? 4 : 4)) {
            var f0 = felter[0];
            Tg.skilt(ctx, this.erMaerker() ? "Træk: mærkaterne op under stofferne" : "Træk: reaktionerne op i boksene", f0.x + f0.b / 2, f0.y - 6, 8, W - 8);
        }

        /* Det, eleven traekker */
        if (this.traek && this.flyttet) {
            if (this.traek.brik) {
                var bt = D.BRIKKER[this.traek.brik];
                Tg.brik(ctx, bt.tekst, this.traek.x, this.traek.y, l.lpx, { loeftet: true });
            } else {
                this.tegnReaktion(ctx, { x: this.traek.x - l.cardW / 2, y: this.traek.y - l.cardH / 2, b: l.cardW, h: l.cardH }, this.traek.kortId, false, true);
            }
        }
        this.tegnSejr(ctx, W, H);
    };

    P.tegnKort = function (ctx, s, om) {
        var l = this.lay, k = l.kort[s], mig = this;
        var over = this.traek && this.flyttet && this.traek.kortId && this.overZone === s;
        Tg.ark(ctx, k.R, over);
        ctx.save();
        ctx.font = Tg.font("700", 16);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#3a4250";
        ctx.fillText(TITEL[s], k.R.x + k.R.b / 2, k.yTitel);
        ctx.restore();
        /* Skemaet */
        k.skema.dele.forEach(function (d) {
            if (d.pil) { Tg.reaktionspil(ctx, d.x + 3, d.x + d.b - 3, k.ySkema, Tg.BLAEK, Math.max(2, k.Fs * 0.07)); return; }
            if (d.t) { Tg.formel(ctx, d.t, d.x, k.ySkema, k.Fs, { justering: "left", vaegt: "600", farve: "#5a6170" }); return; }
            if (d.k) Tg.formel(ctx, d.k, d.x, k.ySkema, k.Fs, { justering: "left" });
            Tg.formel(ctx, d.f, d.x + d.kb, k.ySkema, k.Fs, { justering: "left" });
        });
        /* Mærkaterne under stofferne */
        var vis = this.erMaerker() || this.maerkerLoest;
        if (vis) {
            this.pladser.forEach(function (p) {
                if (p.side !== s) return;
                var b = mig.maerker[p.id];
                ctx.save();
                ctx.strokeStyle = "rgba(90, 97, 112, 0.45)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(p.stofX, k.ySkema + k.Fs * 0.55);
                ctx.lineTo(p.x + p.b / 2, p.y - 2);
                ctx.stroke();
                ctx.restore();
                if (b) {
                    var loest = mig.maerkerLoest;
                    var farve = loest ? (b === "syre" ? "#b0402a" : (b === "base" ? Tg.RED : "#2b3240")) : "#2b3240";
                    Tg.brik(ctx, D.BRIKKER[b].tekst, p.x + p.b / 2, p.y + p.h / 2, l.lpx, { b: p.b - 4, h: p.h, groen: loest && mig.groenT !== undefined, bund: loest ? "#fffdf6" : "#ffffff" });
                    if (loest) {
                        ctx.save();
                        ctx.font = Tg.font("600", Math.max(11, l.lpx - 2));
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillStyle = "#5a6170";
                        ctx.fillText(UNDER[p.id], p.x + p.b / 2, p.y + p.h + 9);
                        ctx.restore();
                    }
                    void farve;
                } else if (mig.iForsoeg()) {
                    Tg.plads(ctx, p, mig.overPlads === p);
                }
            });
        }
        if (om.indexOf("maerker") >= 0) {
            var ps = this.pladser.filter(function (p) { return p.side === s; });
            var x0 = Math.min(ps[0].x, ps[1].x), x1 = Math.max(ps[0].x + ps[0].b, ps[1].x + ps[1].b);
            Tg.ring(ctx, x0 - 6, ps[0].y - 6, x1 - x0 + 12, ps[0].h + 12 + (this.maerkerLoest ? 16 : 0), 12);
        }

        /* Luppen eller boksen til reaktionerne */
        if (this.erSortering()) {
            var z = this.zone(s);
            var zo = this.traek && this.flyttet && this.traek.kortId && this.overZone === s;
            NK.rundtRekt(ctx, z.x, z.y, z.b, z.h, 12);
            ctx.save();
            ctx.fillStyle = zo ? "rgba(242, 197, 61, 0.18)" : "rgba(120, 112, 92, 0.06)";
            ctx.fill();
            ctx.setLineDash([7, 6]);
            ctx.lineWidth = zo ? 2.6 : 1.8;
            ctx.strokeStyle = zo ? "#c99400" : "#a49a82";
            ctx.stroke();
            ctx.restore();
            var zf = this.zoneFelter(s);
            if (!zf.length) {
                ctx.save();
                ctx.font = Tg.font("600", 14);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#9a917c";
                ctx.fillText(s === "sb" ? "Reaktioner, hvor en hydron overføres" : "Reaktioner, hvor elektroner overføres", z.x + z.b / 2, z.y + z.h / 2);
                ctx.restore();
            }
            zf.forEach(function (f) {
                if (mig.traek && mig.flyttet && mig.traek.kortId === f.kortId) return;
                mig.tegnReaktion(ctx, f, f.kortId, false, false, mig.forkertKort === f.kortId, mig.groenT !== undefined && mig.faerdig);
            });
            return;
        }
        var L = k.lup, fremhaev = om.indexOf(s) >= 0;
        var t = this.lupT[s];
        Tg.lupRekt(ctx, L, function (c) {
            var cx = L.x + L.b / 2, cy = L.y + L.h / 2;
            if (s === "sb") {
                var u = Math.min(L.h / 2 * 0.95, L.b / 2 / 1.0);
                HL.tegn(c, cx, cy - u * 0.08, u, t, { prikker: mig.prikker });
            } else {
                var R = L.h / 2 * 0.98;
                ML.tegn(c, cx, cy, R, t, { halv: L.b / 2 / R, prikker: mig.prikker });
            }
        }, fremhaev);
        if (this.iForsoeg() && this.opg.o.id === "overfoer" && !this.set[s] && !this.spiller[s]) {
            Tg.skilt(ctx, "Klik: se reaktionen", L.x + L.b / 2, L.y + 30, L.x + 4, L.x + L.b - 4);
        }
    };

    /* Et reaktionskort (opgave 3) */
    P.tegnReaktion = function (ctx, f, id, valgt, loeftet, roed, groen) {
        var k = null;
        D.SORTER.forEach(function (x) { if (x.id === id) k = x; });
        ctx.save();
        if (loeftet) {
            NK.rundtRekt(ctx, f.x + 3, f.y + 6, f.b, f.h, 9);
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fill();
        }
        NK.rundtRekt(ctx, f.x, f.y, f.b, f.h, 9);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = roed || groen || valgt ? 3 : 1.6;
        ctx.strokeStyle = roed ? "#c4473a" : (groen ? "#2f9e6a" : (valgt ? "#f2c53d" : "#9aa3b0"));
        ctx.stroke();
        ctx.restore();
        var px = Math.round(Math.min(f.h * 0.46, 19));
        while (px > 10 && Tg.formelBredde(ctx, k.f, px) > f.b - 18) px--;
        Tg.formel(ctx, k.f, f.x + f.b / 2, f.y + f.h / 2, px, {});
    };

    /* ----- Musen -------------------------------------------------------------------------- */
    P.lupVed = function (pt) {
        if (!this.lay || this.erSortering()) return null;
        var ud = null, l = this.lay;
        SIDER.forEach(function (s) { if (Tg.inde(l.kort[s].lup, pt)) ud = s; });
        return ud;
    };

    P.pladsVed = function (pt) {
        if (!this.erMaerker() || !this.iForsoeg()) return null;
        var ud = null;
        (this.pladser || []).forEach(function (p) { if (Tg.inde(p, pt, 6)) ud = p; });
        return ud;
    };

    P.zoneVed = function (pt) {
        if (!this.erSortering() || !this.lay) return null;
        var ud = null, l = this.lay;
        SIDER.forEach(function (s) { if (Tg.inde(l.kort[s].R, pt)) ud = s; });
        return ud;
    };

    P.feltVed = function (pt) {
        var ud = null, mig = this;
        this.bakkeFelter().forEach(function (f) { if (Tg.inde(f, pt, 4)) ud = f; });
        if (ud || !this.erSortering()) return ud;
        SIDER.forEach(function (s) { mig.zoneFelter(s).forEach(function (f) { if (Tg.inde(f, pt, 2)) ud = f; }); });
        return ud;
    };

    P.overScene = function (pt) {
        this.overPlads = null;
        if (!pt || !this.lay) return null;
        if (this.iForsoeg()) {
            var f = this.feltVed(pt);
            if (f) return "greb";
            var p = this.pladsVed(pt);
            if (p) { if (this.valgt) this.overPlads = p; return this.maerker[p.id] ? "greb" : "pointer"; }
        }
        if (this.lupVed(pt)) return "pointer";
        return null;
    };

    P.nedScene = function (pt) {
        if (!this.lay) return false;
        var f = this.iForsoeg() ? this.feltVed(pt) : null;
        var p = f ? null : this.pladsVed(pt);
        if (!f && !(p && this.maerker[p.id])) return false;
        this.flyttet = false;
        this.start = { x: pt.x, y: pt.y };
        if (f) this.traek = { brik: f.brik || null, kortId: f.kortId || null, x: pt.x, y: pt.y, fra: null };
        else this.traek = { brik: this.maerker[p.id], kortId: null, x: pt.x, y: pt.y, fra: p };
        return true;
    };

    P.flytScene = function (pt) {
        var t = this.traek;
        if (!t) return;
        if (!this.flyttet && Math.hypot(pt.x - this.start.x, pt.y - this.start.y) > 6) {
            this.flyttet = true;
            if (t.fra) this.maerker[t.fra.id] = null;
            if (t.kortId && this.plac[t.kortId]) this.tagKort(t.kortId);
            this.valgt = null;
            this.visIndsend();
        }
        t.x = pt.x;
        t.y = pt.y;
        this.overPlads = t.brik ? this.pladsVed(pt) : null;
        this.overZone = t.kortId ? this.zoneVed(pt) : null;
    };

    P.tagKort = function (id) {
        this.plac[id] = null;
        this.orden = this.orden.filter(function (x) { return x !== id; });
        if (this.forkertKort === id) this.forkertKort = null;
    };

    P.saetKort = function (id, s) {
        this.tagKort(id);
        this.plac[id] = s;
        this.orden.push(id);
        this.nulstilHjaelp();
        this.visIndsend();
    };

    P.saetMaerke = function (brik, p) {
        var mig = this;
        Object.keys(this.maerker).forEach(function (k) { if (mig.maerker[k] === brik) mig.maerker[k] = null; });
        this.maerker[p.id] = brik;
        this.nulstilHjaelp();
        this.visIndsend();
    };

    P.opScene = function (pt) {
        var t = this.traek;
        this.traek = null;
        this.overPlads = null;
        this.overZone = null;
        if (!t) return;
        if (!this.flyttet) { this.klikPaa(pt, t); return; }
        this.flyttet = false;
        if (t.brik) {
            var p = this.pladsVed(pt);
            if (p) this.saetMaerke(t.brik, p);
        } else if (t.kortId) {
            var s = this.zoneVed(pt);
            if (s) this.saetKort(t.kortId, s);
        }
        this.visIndsend();
    };

    /* Et klik: vaelg en brik eller et kort, og klik saa paa det sted, det skal hen */
    P.klikPaa = function (pt, t) {
        if (t && t.fra && !t.brik) return;
        if (t && !t.fra) {
            var id = t.brik || t.kortId;
            this.valgt = this.valgt === id ? null : id;
            if (this.valgt) this.kortBesked(t.brik ? "Klik nu på den plads, mærkaten skal sidde på." : "Klik nu på den boks, reaktionen hører til.", 3);
            return;
        }
        if (t && t.fra) {
            if (this.valgt && D.BRIKKER[this.valgt]) { this.saetMaerke(this.valgt, t.fra); this.valgt = null; return; }
            this.maerker[t.fra.id] = null;
            this.visIndsend();
        }
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        /* et valgt kort eller en valgt mærkat saettes paa der, hvor eleven klikker */
        if (this.valgt && this.iForsoeg()) {
            if (D.BRIKKER[this.valgt]) {
                var p = this.pladsVed(pt);
                if (p) { this.saetMaerke(this.valgt, p); this.valgt = null; return; }
            } else {
                var s = this.zoneVed(pt);
                if (s) { this.saetKort(this.valgt, s); this.valgt = null; return; }
            }
        }
        var lup = this.lupVed(pt);
        if (lup) {
            if (this.spiller[lup]) return;
            this.spil(lup);
            return;
        }
        if (!this.iForsoeg() && (Tg.inde(this.lay.kort.sb.R, pt) || Tg.inde(this.lay.kort.rx.R, pt))) this.kortBlink();
    };

    NK.SimSammen = SimSammen;
}());
