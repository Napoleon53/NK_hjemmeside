/* =====================================================================
   sim_hurtig.js - fane 3: Hurtigrunden

   Tolv korte spoergsmaal paa tid, blandet af formlen (n = ?, m = ?,
   M = ?), enhederne, navnene, enheder der gaar ud med hinanden og
   hovedregning med nemme tal. Eleven klikker paa et svar (eller taster
   1 til 4). De forkerte svar er de fejl, elever laver, og hvert har sin
   forklaring. Et forkert svar giver 5 sekunder ekstra, og spoergsmaalet
   kommer igen senere i runden, saa formlen hentes frem flere gange.
   Den bedste tid huskes i browseren.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc4.3-hurtig";

    var HINT = {
        formel: "Tænk på enhederne: g, mol og g/mol. Hvilken regning giver den rigtige enhed?",
        enhed: "Molarmassen er massen af 1 mol. Massen vejes på en vægt.",
        navn: "Lille m og stort M er to forskellige ting. Det er lille n og stort N også.",
        forkort: "Ens enheder over og under brøkstregen går ud med hinanden.",
        n: "Stofmængden er massen delt med molarmassen.",
        m: "Isolér m i n = m / M.",
        M: "Isolér M i n = m / M."
    };

    /* Et tal til hovedregning: hoejst tre cifre og ingen nuller til sidst */
    function tal(v) {
        return NK.betydende(v, 3).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "");
    }

    /* Et spoergsmaal med tal: n, m eller M skal findes */
    SimHurtig.talSpm = function (slags, p) {
        var m = p.m, M = p.M, n = m / M, sp;
        if (slags === "n") {
            sp = { spm: "m = " + tal(m) + " g og M = " + tal(M) + " g/mol. n = ?", svar: [
                [tal(n) + " mol", ""], [tal(M / m) + " mol", "Vendt om. Massen står øverst: n = m / M."],
                [tal(m * M) + " mol", "Ganget. Enheden ville blive g²/mol, ikke mol."],
                [tal(n) + " g", "Tallet er rigtigt, men stofmængden er i mol."]],
                forkl: "n = " + tal(m) + " g / " + tal(M) + " g/mol = " + tal(n) + " mol." };
        } else if (slags === "m") {
            sp = { spm: "n = " + tal(n) + " mol og M = " + tal(M) + " g/mol. m = ?", svar: [
                [tal(m) + " g", ""], [tal(M / n) + " g", "Delt. Massen er stofmængde gange molarmasse."],
                [tal(n / M) + " g", "Delt. Massen er stofmængde gange molarmasse."],
                [tal(m) + " mol", "Tallet er rigtigt, men massen er i g."]],
                forkl: "m = " + tal(n) + " mol · " + tal(M) + " g/mol = " + tal(m) + " g." };
        } else {
            sp = { spm: "m = " + tal(m) + " g og n = " + tal(n) + " mol. M = ?", svar: [
                [tal(M) + " g/mol", ""], [tal(n / m) + " g/mol", "Vendt om. Massen står øverst: M = m / n."],
                [tal(m * n) + " g/mol", "Ganget. Molarmassen er massen delt med stofmængden."],
                [tal(M) + " mol/g", "Tallet er rigtigt, men molarmassen er i g/mol."]],
                forkl: "M = " + tal(m) + " g / " + tal(n) + " mol = " + tal(M) + " g/mol." };
        }
        /* Ingen to svar maa se ens ud */
        var set = {}, svar = [];
        sp.svar.forEach(function (s) { if (!set[s[0]]) { set[s[0]] = 1; svar.push(s); } });
        return { slags: "tal", hint: HINT[slags], spm: sp.spm, forkl: sp.forkl,
                 svar: svar.map(function (s) { return s[0]; }), fejl: svar.map(function (s) { return s[1]; }) };
    };

    /* En ny runde: D.RUNDE siger, hvor mange af hver slags */
    SimHurtig.lavRunde = function () {
        var ud = [];
        Object.keys(D.RUNDE).forEach(function (slags) {
            var antal = D.RUNDE[slags];
            if (slags === "tal") {
                var par = NK.bland(D.HURTIG_TAL), typer = ["n", "n", "m", "M"];
                for (var i = 0; i < antal; i++) ud.push(SimHurtig.talSpm(typer[i % typer.length], par[i % par.length]));
                return;
            }
            NK.bland(D.HURTIG.filter(function (q) { return q.slags === slags; })).slice(0, antal).forEach(function (q) {
                ud.push({ slags: q.slags, hint: HINT[q.slags], spm: q.spm, forkl: q.forkl, svar: q.svar.slice(), fejl: q.fejl.slice() });
            });
        });
        return NK.bland(ud);
    };

    function SimHurtig() {
        this.over = null;
        this.startFane([]);
        this.el.tid = NK.el("hurtig-tid");
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.rekord = gemt.r || 0;
        this.introNu = true;
        this.tilstand = "klar";
        this.nulstilRunde();
        this.besked(D.INTRO.hurtig + " " + this.trinLinje(), "");
        this.visKnap();
        this.visTal();
    }

    var P = SimHurtig.prototype;
    NK.Fane.paa(P, { navn: "hurtig" });

    P.nulstilRunde = function () {
        this.koe = [];
        this.nuv = null;
        this.valg = [];
        this.tidBrugt = 0;
        this.straf = 0;
        this.fejl = 0;
        this.rigtige = 0;
        this.antal = 0;
        this.pause = 0;
        this.flash = null;
        this.strafT = 0;
        this.hjaelp = 0;
        this.nyRekord = false;
        this.prikker = [];
    };

    /* ----- Runden ------------------------------------------------------------------- */
    P.start = function () {
        this.nulstilRunde();
        this.koe = SimHurtig.lavRunde();
        this.koe.forEach(function (q, i) { q.nr = i; });
        this.antal = this.koe.length;
        this.prikker = this.koe.map(function () { return 0; });
        this.tilstand = "koerer";
        this.k.tie();
        this.naeste();
        this.besked(this.trinLinje(), "");
        this.visKnap();
    };

    P.naeste = function () {
        this.hjaelp = 0;
        this.flash = null;
        if (!this.koe.length) { this.slut(); return; }
        this.nuv = this.koe.shift();
        if (this.nuv.forkert) this.nuv.igen = true;
        this.k.tie();
        var idx = NK.bland(this.nuv.svar.map(function (s, i) { return i; }));
        var q = this.nuv;
        this.valg = idx.map(function (i) { return { tekst: q.svar[i], ok: i === 0, fejl: q.fejl[i] }; });
        this.layout();
        this.visKnap();
    };

    P.svar = function (i) {
        if (this.tilstand !== "koerer" || this.pause > 0 || !this.valg[i]) return;
        var v = this.valg[i], q = this.nuv;
        this.k.tie();
        if (v.ok) {
            this.rigtige++;
            if (!q.forkert) this.prikker[q.nr] = 1;
            this.flash = { i: i, ok: true, t: 0 };
            this.besked("<b>Rigtigt.</b> " + NK.html(q.forkl), "god");
            this.pause = 0.7;
        } else {
            this.forkert(i, "<b>Nej.</b> " + NK.html(v.fejl) + " " + NK.html(q.forkl));
        }
        this.visTal();
    };

    /* Forkert eller Vis svaret: det rigtige lyser, og spoergsmaalet kommer igen */
    P.forkert = function (i, html) {
        var q = this.nuv;
        this.fejl++;
        this.straf += D.STRAF;
        this.strafT = 1.2;
        q.forkert = true;
        this.prikker[q.nr] = -1;
        var ret = 0;
        this.valg.forEach(function (v, j) { if (v.ok) ret = j; });
        this.flash = { i: i, ok: false, ret: ret, t: 0 };
        this.besked(html, "skidt");
        /* Tilbage i koeen, helst mindst tre spoergsmaal senere */
        var pos = Math.min(this.koe.length, 3);
        this.koe.splice(pos, 0, q);
        this.pause = 2.2;
    };

    P.slut = function () {
        this.tilstand = "slut";
        this.nuv = null;
        this.valg = [];
        var samlet = Math.round(this.tidBrugt) + this.straf;
        this.samlet = samlet;
        this.nyRekord = !this.rekord || samlet < this.rekord;
        if (this.nyRekord) {
            this.rekord = samlet;
            NK.gem(NOEGLE, { r: samlet });
        }
        var t = "Runden er slut: " + samlet + " s" + (this.straf ? " (heraf " + this.straf + " s for fejl og hint)" : "") + ".";
        this.besked(t + (this.nyRekord ? " <b>Ny rekord.</b>" : " Rekorden er " + this.rekord + " s."), "god");
        this.visKnap();
        this.visTal();
    };

    /* ----- Knappen: Start, Giv hint, Vis svaret, Ny runde ----------------------------- */
    P.visKnap = function () {
        var e = this.el.knap;
        if (this.tilstand !== "koerer") {
            e.textContent = this.tilstand === "klar" ? "Start runden" : "Ny runde ↺";
            e.className = "knap blaa banker";
        } else {
            e.textContent = this.hjaelp === 0 ? "Giv hint (+" + D.STRAF + " s)" : "Vis svaret";
            e.className = "knap";
        }
        e.disabled = false;
    };

    P.knap = function () {
        if (this.tilstand !== "koerer") { this.start(); return; }
        if (this.pause > 0 || !this.nuv) return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.straf += D.STRAF;
            this.strafT = 1.2;
            this.hjaelpVis("<b>Hint:</b> " + NK.html(this.nuv.hint), "hint");
        } else {
            var ret = 0;
            this.valg.forEach(function (v, j) { if (v.ok) ret = j; });
            this.forkert(-1, "<b>Svaret:</b> " + NK.html(this.nuv.svar[0]) + ". " + NK.html(this.nuv.forkl));
            this.k.sig("<b>Svaret:</b> " + NK.html(this.nuv.svar[0]) + ".", "svar");
        }
        this.visKnap();
        this.visTal();
    };

    P.trinInfo = function () { return null; };
    P.opgaveFaerdig = function () { return this.tilstand === "slut"; };
    P.trinLinje = function () {
        if (this.tilstand === "klar") return "Tryk på Start runden.";
        if (this.tilstand === "koerer") return "Klik på det rigtige svar, eller tast 1 til " + this.valg.length + ".";
        return "";
    };
    P.enter = function () { if (this.tilstand !== "koerer") this.start(); };
    P.nulstil = function () { this.start(); };
    P.fokus = function () { };
    P.harNyeTal = function () { return false; };

    /* Tallene 1 til 4 svarer, mens runden koerer */
    P.tast = function (key) {
        if (this.tilstand !== "koerer") return false;
        var i = parseInt(key, 10);
        if (i >= 1 && i <= this.valg.length) { this.svar(i - 1); return true; }
        return false;
    };

    /* Panelet: tiden, de rigtige, fejlene og rekorden */
    P.visTal = function () {
        var tid = this.tilstand === "slut" ? this.samlet : Math.floor(this.tidBrugt) + this.straf;
        NK.saetTekst("hurtig-tid", tid + " s");
        var foerste = this.prikker.filter(function (p) { return p === 1; }).length;
        NK.saetTekst("hurtig-rigtige", foerste + "/" + (this.antal || D.HURTIG_ANTAL));
        NK.saetTekst("hurtig-fejl", String(this.fejl));
        NK.saetTekst("hurtig-rekord", this.rekord ? this.rekord + " s" : "ingen endnu");
    };

    /* ----- Tid ------------------------------------------------------------------------ */
    P.opdaterScene = function (dt) {
        if (this.tilstand === "koerer") {
            this.tidBrugt += dt;
            if (this.pause > 0) {
                this.pause -= dt;
                if (this.pause <= 0) { this.pause = 0; this.naeste(); }
            }
            this.visTal();
        }
        if (this.flash) this.flash.t += dt;
        if (this.strafT > 0) this.strafT = Math.max(0, this.strafT - dt);
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.valgUnder = function (pt) {
        for (var i = 0; i < this.valg.length; i++) {
            var v = this.valg[i];
            if (v.r && pt.x >= v.r.x && pt.x <= v.r.x + v.r.b && pt.y >= v.r.y && pt.y <= v.r.y + v.r.h) return i;
        }
        return -1;
    };

    P.overScene = function (pt) {
        this.over = null;
        if (!pt || !this.lay) return null;
        if (this.tilstand !== "koerer") {
            var s = this.lay.start;
            if (s && pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h) { this.over = "start"; return "knap"; }
            return null;
        }
        var i = this.valgUnder(pt);
        if (i >= 0 && this.pause <= 0) { this.over = i; return "knap"; }
        return null;
    };

    P.nedScene = function (pt) {
        if (this.tilstand !== "koerer") {
            var s = this.lay.start;
            if (s && pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h) this.start();
            else this.kortBesked("Tryk på Start for at begynde runden.");
            return false;
        }
        var i = this.valgUnder(pt);
        if (i >= 0) this.svar(i);
        else if (this.pause <= 0) this.kortBesked("Klik på et af svarene.", 2.5);
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    function erFormel(t) { return /^[nmM =·\/]+$/.test(t); }

    P.layout = function () {
        var W = this.L.b, H = this.L.h, ctx = this.L.ctx;
        var baand = this.k.layout(W, H);
        var R = { x: 16, y: 16, b: W - 32, h: Math.max(160, baand.y - 16 - 24) };
        var lay = { W: W, H: H, Hs: baand.y, tavle: R };
        lay.bh = Math.round(NK.klamp(Math.min(R.h * 0.16, R.b * 0.1), 42, 78));
        lay.spmPx = NK.klamp(Math.min(R.h * 0.1, R.b / 20), 18, 40);
        var bh = lay.bh;
        /* Svarene: paa én raekke, hvis der er plads, ellers to og to */
        var bredder = this.valg.map(function (v) {
            ctx.font = erFormel(v.tekst) ? Tg.matte(Math.round(bh * 0.46)) : Tg.font("700", Math.round(NK.klamp(bh * 0.36, 14, 26)));
            return Math.max(bh * 2.2, ctx.measureText(v.tekst).width + 44);
        });
        var gap = 16;
        var samlet = bredder.reduce(function (a, b) { return a + b + gap; }, -gap);
        var y0 = R.y + R.h * 0.56;
        if (samlet <= R.b - 40) {
            var x = R.x + (R.b - samlet) / 2;
            this.valg.forEach(function (v, i) { v.r = { x: x, y: y0, b: bredder[i], h: bh }; x += bredder[i] + gap; });
        } else {
            var bmax = Math.min((R.b - 40 - gap) / 2, Math.max.apply(null, bredder.concat([0])));
            this.valg.forEach(function (v, i) {
                var c = i % 2, rk = Math.floor(i / 2);
                v.r = { x: R.x + R.b / 2 + (c === 0 ? -gap / 2 - bmax : gap / 2), y: y0 - bh * 0.3 + rk * (bh + 12), b: bmax, h: bh };
            });
        }
        var sb = Math.max(bh * 2.6, 160);
        lay.start = { x: R.x + (R.b - sb) / 2, y: R.y + R.h * 0.58, b: sb, h: bh };
        this.lay = lay;
        this.saetAnker("tavle", R.x, R.y, R.b, R.h);
        this.saetAnker("svar", R.x + 20, y0 - bh * 0.35, R.b - 40, bh * 2.4);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var R = lay.tavle;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.Hs);
        Tg.tavle(ctx, R);
        var moerk = "#1f2530", svag = "#6a7280";
        var lille = NK.klamp(lay.spmPx * 0.42, 12, 15);

        if (this.tilstand !== "koerer") {
            NK.tekst(ctx, "Hurtigrunden", R.x + R.b / 2, R.y + R.h * 0.2, { font: Tg.font("800", Math.round(lay.spmPx * 1.1)), justering: "center", linje: "middle", farve: moerk });
            var linjer = this.tilstand === "slut" ?
                [this.samlet + " s" + (this.straf ? ", heraf " + this.straf + " s for fejl og hint" : ""), this.nyRekord ? "Ny rekord" : "Rekorden er " + this.rekord + " s"] :
                [D.HURTIG_ANTAL + " spørgsmål om stofmængde, masse og molarmasse.", "Et forkert svar giver " + D.STRAF + " s ekstra og kommer igen senere."];
            linjer.forEach(function (t, i) {
                var px = NK.passendeSkrift(ctx, t, R.b - 40, NK.klamp(lay.spmPx * 0.6, 14, 22), 12, "600");
                NK.tekst(ctx, t, R.x + R.b / 2, R.y + R.h * (0.34 + i * 0.1), { font: Tg.font("600", px), justering: "center", linje: "middle",
                    farve: i === 1 && mig.nyRekord ? "#1d7a48" : "#3a4150" });
            });
            var s = lay.start;
            Tg.brik(ctx, { x: s.x, y: s.y, b: s.b, h: s.h, tekst: this.tilstand === "klar" ? "Start" : "Ny runde", slags: "sym_start" },
                { over: this.over === "start" });
            this.k.tegn(ctx);
            return;
        }

        /* Prikkerne: et for hvert spoergsmaal */
        var n = this.prikker.length, pr = NK.klamp(R.b / (n * 3.2), 5, 9);
        var py = R.y + Math.max(22, R.h * 0.09);
        for (var i = 0; i < n; i++) {
            var x = R.x + 24 + i * pr * 2.7;
            ctx.beginPath();
            ctx.arc(x, py, pr, 0, Math.PI * 2);
            ctx.fillStyle = this.prikker[i] === 1 ? "#3fae72" : (this.prikker[i] === -1 ? "#e05446" : "rgba(60, 72, 90, 0.15)");
            ctx.fill();
            if (this.nuv && this.nuv.nr === i) {
                ctx.strokeStyle = "#e0a82e";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, py, pr + 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        /* Uret */
        var tid = Math.floor(this.tidBrugt) + this.straf;
        NK.tekst(ctx, tid + " s", R.x + R.b - 20, py, { font: "700 " + Math.round(NK.klamp(lay.spmPx * 0.8, 16, 30)) + "px Consolas, monospace", justering: "right", linje: "middle", farve: moerk });
        if (this.strafT > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.strafT);
            NK.tekst(ctx, "+" + D.STRAF + " s", R.x + R.b - 20, py + lay.spmPx * 0.9 - (1.2 - this.strafT) * 10,
                { font: Tg.font("800", Math.round(NK.klamp(lay.spmPx * 0.6, 14, 22))), justering: "right", linje: "middle", farve: "#c0392b" });
            ctx.restore();
        }
        Tg.etiket(ctx, this.nuv && this.nuv.igen ? "Igen" : "Spørgsmål", R.x + 24, py + lay.spmPx * 1.1, lille, this.nuv && this.nuv.igen ? "#c0392b" : svag);

        /* Spoergsmaalet */
        if (this.nuv) {
            var t = this.nuv.spm;
            var px = NK.passendeSkrift(ctx, t, R.b - 48, lay.spmPx, 15, "700");
            NK.tekst(ctx, t, R.x + R.b / 2, R.y + R.h * 0.36, { font: Tg.font("700", px), justering: "center", linje: "middle", farve: moerk });
        }

        /* Svarene */
        this.valg.forEach(function (v, i) {
            if (!v.r) return;
            var f = mig.flash, groen = 0, roed = 0;
            if (f && f.ok && f.i === i) groen = 1;
            if (f && !f.ok && f.i === i) roed = 1;
            if (f && !f.ok && f.ret === i) groen = 0.6 + 0.4 * Math.sin(f.t * 8);
            var ryst = f && !f.ok && f.i === i && f.t < 0.4 ? Math.sin(f.t * 60) * 4 : 0;
            ctx.save();
            ctx.translate(ryst, 0);
            Tg.brik(ctx, { x: v.r.x, y: v.r.y, b: v.r.b, h: v.r.h, tekst: v.tekst, slags: erFormel(v.tekst) ? "sym_svar" : "svar" },
                { over: mig.over === i && mig.pause <= 0, roed: roed, groen: groen });
            NK.tekst(ctx, String(i + 1), v.r.x + 9, v.r.y + 13, { font: Tg.font("700", 12), linje: "middle", farve: "#7b8594" });
            ctx.restore();
        });
        this.k.tegn(ctx);
    };

    NK.SimHurtig = SimHurtig;
}());
