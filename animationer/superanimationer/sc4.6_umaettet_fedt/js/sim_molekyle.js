/* =====================================================================
   sim_molekyle.js - fane 2: Ét molekyle

   Ét fedtstofmolekyle staar stort paa en lys tavle, tegnet som i bogen:
   glycerol, esterbindingerne og tre fedtsyrer som zigzag. Eleven klikker
   paa de bindinger, eleven mener er dobbeltbindinger mellem to carbon-
   atomer (de bliver gule), og trykker Indsend svar. Er det rigtigt,
   flyver ét dibrommolekyle hen til hver dobbeltbinding og adderer: den
   anden streg forsvinder, og der sidder et bromatom paa hvert carbonatom.
   C=O ved esterbindingen er en faelde: den er en dobbeltbinding, men
   mellem C og O, og dibrom adderer ikke til den.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fedt;
    var Tg = NK.Tegn;

    var FLYV = 0.55, MELLEM = 0.3, SAET = 0.3;

    function SimMolekyle() {
        this.mrk = {};
        this.brom = {};
        this.addering = null;
        this.overN = null;
        this.indsendT = "";
        this.startFane(D.M_MAAL);
        this.visPanel();
    }

    var P = SimMolekyle.prototype;
    NK.Fane.paa(P, { navn: "m", naesteFane: "fane-u", naesteNavn: "Ukendte fedtstoffer" });

    /* ----- Maalene ------------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        this.form = F.formStor(o.mol);
        this.mrk = {};
        this.brom = {};
        this.addering = null;
        this.fundet = false;
        this.geo = null;
        if (this.status) this.visPanel();
    };

    P.efterOpgave = function () { this.visPanel(); };

    P.nulstilScene = function () {
        if (!this.iForsoeg() || this.addering) { this.kortBlink(); return; }
        this.mrk = {};
        this.visIndsend();
    };

    /* Alle dobbeltbindinger mellem to C i molekylet: "nr.k" */
    P.dobbelte = function () {
        var ud = [];
        this.form.raekker.forEach(function (r) { r.dobbelt.forEach(function (k) { ud.push(r.nr + "." + k); }); });
        return ud;
    };

    P.forsoegSvar = function () {
        var mig = this;
        this.mrk = {};
        this.addering = null;
        this.dobbelte().forEach(function (n) { mig.brom[n] = 1; });
        this.fundet = true;
        this.visPanel();
    };

    /* ----- Indsend svar: de markerede bindinger ------------------------------------------ */
    P.antalMrk = function () {
        var mig = this;
        return Object.keys(this.mrk).filter(function (n) { return mig.mrk[n]; }).length;
    };

    P.kanIndsendes = function () { return !this.addering; };

    P.indsendTekst = function () {
        var n = this.antalMrk();
        return "Indsend svar: " + (n === 0 ? "ingen dobbeltbindinger" : F.dbTekst(n));
    };

    P.ikkeKlar = function () { return "Vent, til dibrom har adderet."; };

    P.forsoegIndsend = function () {
        var mig = this, rigtige = this.dobbelte(), mrk = Object.keys(this.mrk).filter(function (n) { return mig.mrk[n]; });
        var co = mrk.some(function (n) { return /\.co$/.test(n); });
        var enkelt = mrk.some(function (n) { return !/\.co$/.test(n) && rigtige.indexOf(n) < 0; });
        if (co) { this.fejlLinje(D.mFejl.co); return; }
        if (enkelt) { this.fejlLinje(D.mFejl.enkelt); return; }
        if (mrk.length < rigtige.length) { this.fejlLinje(D.mFejl.mangler(mrk.length)); return; }
        /* Rigtigt: ét dibrommolekyle til hver dobbeltbinding */
        this.nulstilHjaelp();
        this.mrk = {};
        if (!rigtige.length) { this.fundet = true; this.visPanel(); this.forsoegKlaret(this.opg.o.forsoeg.set); return; }
        this.addering = { liste: rigtige, t: 0 };
        this.visIndsend();
    };

    /* ----- Panelet ------------------------------------------------------------------- */
    P.visPanel = function () {
        var mig = this, o = this.opg ? this.opg.o : D.M_MAAL[0], loest = this.faerdig;
        var form = F.formStor(o.mol), pl = ["Øverst", "Midten", "Nederst"];
        var html = '<p class="note-tekst">Fedtstof ' + NK.html(o.navn.replace(/^Fra/, "fra")) + "</p>";
        html += '<table class="skema"><thead><tr><th>Plads</th><th>Fedtsyre</th><th>C=C</th>' + (loest ? "<th>Slags</th>" : "") + "</tr></thead><tbody>";
        form.raekker.forEach(function (r, j) {
            var s = F.syre(r.id);
            html += "<tr><td>" + pl[j] + "</td><td>" + NK.html(s.navn) + "</td><td>" + (mig.fundet ? String(s.db) : "") + "</td>" +
                (loest ? '<td><span class="slags" style="color:' + F.FARVE[s.slags] + '">' + s.slags + "</span></td>" : "") + "</tr>";
        });
        html += "</tbody></table>";
        if (this.fundet) html += '<p class="note">Dibrom adderet: <b>' + F.antalDbMol(o.mol) + "</b></p>";
        NK.saetHTML("m-fedtsyrer", html);
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var kortBund = 10 + this.kortZone();
        var tb = Math.min(W - 40, 940), th = Math.max(160, H - kortBund - 30);
        var R = { x: W / 2 - tb / 2, y: kortBund + 12, b: tb, h: th };
        this.lay = { W: W, H: H, tavle: R };
        this.geo = null;
        this.saetAnker("tavle", R.x, R.y, R.b, R.h);
    };

    /* Molekylets stoerrelse og plads paa tavlen */
    P.geometri = function () {
        if (this.geo && this.geo.form === this.form && this.geo.R === this.lay.tavle) return this.geo;
        var R = this.lay.tavle, k = this.form.kasse, luft = 1.2;
        var w = k.maxX - k.minX + 2 * luft, h = k.maxY - k.minY + 2 * luft;
        var s = Math.min((R.b - 30) / w, (R.h - 24) / h, 34);
        var ox = R.x + R.b / 2 - (k.minX + k.maxX) / 2 * s, oy = R.y + R.h / 2 - (k.minY + k.maxY) / 2 * s;
        var bindinger = [];
        function P2(p) { return { x: ox + p.x * s, y: oy + p.y * s }; }
        this.form.raekker.forEach(function (r) {
            var pkt = r.pkt.map(P2);
            for (var j = 0; j < pkt.length - 1; j++) bindinger.push({ n: r.nr + "." + j, a: pkt[j], b: pkt[j + 1] });
            bindinger.push({ n: r.nr + ".co", a: P2(r.C1), b: P2(r.Oc), kortB: true });
            bindinger.push({ n: r.nr + ".oc", a: P2(r.O), b: P2(r.C1), kortA: true });
        });
        this.geo = { form: this.form, R: R, s: s, ox: ox, oy: oy, bindinger: bindinger };
        return this.geo;
    };

    P.bindingVed = function (pt) {
        var g = this.geometri(), bedst = null, min = Math.max(9, g.s * 0.32);
        g.bindinger.forEach(function (b) {
            var a = b.a, c = b.b;
            if (b.kortA) a = { x: NK.lerp(a.x, c.x, 0.4), y: NK.lerp(a.y, c.y, 0.4) };
            if (b.kortB) c = { x: NK.lerp(a.x, c.x, 0.65), y: NK.lerp(a.y, c.y, 0.65) };
            var dx = c.x - a.x, dy = c.y - a.y, l2 = dx * dx + dy * dy || 1;
            var t = NK.klamp(((pt.x - a.x) * dx + (pt.y - a.y) * dy) / l2, 0, 1);
            var d = Math.hypot(pt.x - (a.x + dx * t), pt.y - (a.y + dy * t));
            if (d < min) { min = d; bedst = b.n; }
        });
        return bedst;
    };

    P.midte = function (n) {
        var g = this.geometri(), ud = null;
        g.bindinger.forEach(function (b) { if (b.n === n) ud = { x: (b.a.x + b.b.x) / 2, y: (b.a.y + b.b.y) / 2 }; });
        return ud;
    };

    P.opdaterScene = function (dt) {
        var a = this.addering, mig = this;
        if (a) {
            a.t += dt;
            a.liste.forEach(function (n, i) {
                var t0 = i * MELLEM + FLYV;
                if (a.t >= t0) mig.brom[n] = Math.min(1, (a.t - t0) / SAET);
            });
            var slut = (a.liste.length - 1) * MELLEM + FLYV + SAET + 0.15;
            if (a.t >= slut) {
                this.addering = null;
                this.fundet = true;
                this.visPanel();
                this.forsoegKlaret(this.opg.o.forsoeg.set);
            }
        }
        if (this.opg && this.opg.fase === "forsoeg") {
            var t = this.indsendTekst() + (this.kanIndsendes() ? "+" : "-");
            if (t !== this.indsendT) { this.indsendT = t; this.visIndsend(); }
        }
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var g = this.geometri(), om = this.omNu();
        Tg.tavle(ctx, lay.tavle, om.indexOf("tavle") >= 0 && !this.iForsoeg());
        var forsoeg = this.iForsoeg() && !this.addering;
        Tg.storMolekyle(ctx, this.form, g.ox, g.oy, g.s, {
            brom: function (nr, k) { return mig.brom[nr + "." + k] || 0; },
            mrk: function (n) { return !!mig.mrk[n]; },
            over: forsoeg ? this.overN : null,
            farver: this.faerdig
        });
        /* Efter opgaven: slagsen ved enden af hver kaede */
        if (this.faerdig) {
            this.form.raekker.forEach(function (r) {
                var s = F.syre(r.id), p = r.pkt[r.pkt.length - 1];
                var x = g.ox + p.x * g.s + 10, y = g.oy + p.y * g.s;
                if (x > lay.tavle.x + lay.tavle.b - 110) { x = g.ox + p.x * g.s; y += 22; }
                NK.tekst(ctx, s.slags, x, y + 5, { font: Tg.font("700", 14), farve: Tg.moerk(F.FARVE[s.slags]) });
            });
        }
        /* Dibrommolekylerne paa vej hen til dobbeltbindingerne */
        var a = this.addering;
        if (a) {
            var start = { x: lay.tavle.x + lay.tavle.b - 40, y: lay.tavle.y + 30 }, u = NK.klamp(g.s * 0.9, 16, 26);
            a.liste.forEach(function (n, i) {
                var t = (a.t - i * MELLEM) / FLYV;
                if (t < 0 || t >= 1) return;
                var m = mig.midte(n), e = NK.blod(t);
                var x = NK.lerp(start.x, m.x, e), y = NK.lerp(start.y, m.y, e) - Math.sin(Math.PI * e) * 30;
                var c = Math.cos(a.t * 3 + i) * 0.62 * u, sn = Math.sin(a.t * 3 + i) * 0.62 * u;
                ctx.save();
                ctx.strokeStyle = Tg.BROM_MOERK;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - c * 0.45, y - sn * 0.45);
                ctx.lineTo(x + c * 0.45, y + sn * 0.45);
                ctx.stroke();
                ctx.font = Tg.font("700", Math.round(u * 0.62));
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = Tg.BROM_MOERK;
                ctx.fillText("Br", x - c, y - sn);
                ctx.fillText("Br", x + c, y + sn);
                ctx.restore();
            });
        }
        this.tegnSejr(ctx, lay.W, lay.H);
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.overScene = function (pt) {
        this.overN = null;
        if (!pt || !this.lay || !this.iForsoeg() || this.addering) return null;
        this.overN = this.bindingVed(pt);
        return this.overN ? "klik" : null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var R = this.lay.tavle;
        var paaTavle = pt.x >= R.x && pt.x <= R.x + R.b && pt.y >= R.y && pt.y <= R.y + R.h;
        if (!paaTavle) return;
        /* Laasen: bindinger kan kun markeres, mens kortet viser forsoeget */
        if (this.spaer()) return;
        if (this.addering) return;
        var n = this.bindingVed(pt);
        if (!n) return;
        this.mrk[n] = !this.mrk[n];
        this.nulstilHjaelp();
        if (this.fast && this.fast.klasse === "skidt") this.naesteLinje("", "");
        this.visIndsend();
    };

    NK.SimMolekyle = SimMolekyle;
}());
