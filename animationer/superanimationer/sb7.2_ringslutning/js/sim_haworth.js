/* =====================================================================
   sim_haworth.js - fane 2: Fra fischer til haworth

   Fem opgaver (D.HAWORTH):
     numre   en haworthformel (α-glucose): klik paa carbonatomerne fra 1 til 6
     ring    fischerprojektionen til venstre, en tom ring til hoejre: eleven
             klikker over eller under carbonatom 1 til 5 for at saette
             OH-gruppen (CH₂OH paa carbonatom 5)
     kaede   omvendt: ringen til hoejre, en tom fischerprojektion til
             venstre: eleven klikker til venstre eller hoejre for
             carbonatom 2 til 5
   Et tomt sted er en stiplet streg med en graa cirkel. Et klik paa
   cirklen saetter gruppen dér; et klik igen fjerner den. Intet bedoemmes
   foer Indsend svar. Efter hint 1 faar OH-grupperne farve som i bogens
   figur: til hoejre (ned) blaa, til venstre (op) roed.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Sukker;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.2-haworth";
    var BLAA = "#2b59c3", ROED = "#c0392b";

    function SimHaworth() {
        var mig = this;
        this.opgaver = D.HAWORTH;
        this.hentStatus();
        this.startFane();
        this.bygListe();
        NK.el("h-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("h-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
    }

    var P = SimHaworth.prototype;
    F.paa(P, "h");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, []) || [];
        this.status = this.opgaver.map(function (o, i) {
            var g = gemt[i] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        NK.gem(NOEGLE, this.status.map(function (s) { return { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; }));
    };

    P.antalLoest = function () { return this.status.filter(function (s) { return s.loest; }).length; };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.bygListe = function () {
        var html = "";
        this.opgaver.forEach(function (o, i) {
            html += '<button type="button" class="opg-chip" data-opg="' + i + '"><span class="oc-f"><b>' + (i + 1) + "</b> " +
                NK.html(o.navn) + '</span><i class="oc-m"></i></button>';
        });
        NK.el("h-liste").innerHTML = html;
    };

    P.visListe = function () {
        var chips = NK.el("h-liste").querySelectorAll("[data-opg]");
        for (var k = 0; k < chips.length; k++) {
            var i = parseInt(chips[k].getAttribute("data-opg"), 10), s = this.status[i];
            chips[k].classList.toggle("valgt", i === this.nr);
            chips[k].classList.toggle("loest", s.loest);
            chips[k].classList.toggle("stjerne", s.stjerne);
            chips[k].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        NK.saetTekst("h-loest", String(this.antalLoest()));
    };

    /* ----- Det rigtige svar ------------------------------------------------------------ */
    /* ring: { k: "op" | "ned" } for carbonatom 1 til 5. kaede: { k: "H" | "V" } for 2 til 5 */
    P.facit = function () {
        var o = this.opg, su = this.su, f = {};
        if (o.slags === "ring") {
            f[1] = o.form === "alfa" ? "ned" : "op";
            for (var k = 2; k <= 4; k++) f[k] = su.sider[k] === "H" ? "ned" : "op";
        } else if (o.slags === "kaede") {
            for (var j = 2; j <= 5; j++) f[j] = su.sider[j];
        }
        return f;
    };

    P.pladser = function () {
        if (this.opg.slags === "ring") return [1, 2, 3, 4];
        if (this.opg.slags === "kaede") return [2, 3, 4, 5];
        return [];
    };

    /* ----- En opgave ---------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.opg = this.opgaver[i];
        this.su = D.SUKKER[this.opg.sukker];
        this.M = S.model(this.opg.sukker, this.su.sider, this.su.keto);
        this.valg = {};
        this.forkert = {};
        this.numre = [];
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.hover = null;
        this.sejrT = null;
        this.kasser = {};
        this.farveHint = false;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        return { slags: "opgave", chip: "Opgave " + (this.nr + 1), tekst: this.opg.tekst };
    };

    P.svarValg = function () { /* ingen svarknapper paa kortet */ };

    P.kanSendes = function () {
        if (this.opg.slags === "numre") return this.numre.length === 6;
        var mig = this;
        return this.pladser().every(function (k) { return !!mig.valg[k]; });
    };

    P.indsendTekst = function () {
        if (this.opg.slags === "numre") return this.numre.length < 6 ? "Indsend svar (" + this.numre.length + " af 6)" : "Indsend svar";
        var mig = this, n = this.pladser().filter(function (k) { return !!mig.valg[k]; }).length;
        return n < this.pladser().length ? "Indsend svar (" + n + " af " + this.pladser().length + ")" : "Indsend svar";
    };

    P.ingentingTekst = function () {
        if (this.opg.slags === "numre") return "Giv alle seks carbonatomer et nummer først.";
        if (this.opg.slags === "kaede") return "Sæt en OH-gruppe ved alle fire carbonatomer med grå cirkler først.";
        return "Sæt en OH-gruppe ved alle fire carbonatomer med grå cirkler først.";
    };

    P.indsend = function () { this.bedoem(false); };

    /* Forklaringen til den foerste forkerte plads */
    P.fejlTekst = function (k) {
        var o = this.opg, su = this.su;
        if (o.slags === "ring") {
            if (k === 1) return "Carbonatom 1. I " + D.formNavn(o.form, o.sukker) + " peger OH-gruppen på carbonatom 1 " + (o.form === "alfa" ? "ned." : "op.");
            var h = su.sider[k] === "H";
            return "Carbonatom " + k + ". OH-gruppen står til " + (h ? "højre" : "venstre") + " i fischerprojektionen, så den skal pege " + (h ? "ned" : "op") + " i ringen.";
        }
        if (k === 5) return "Carbonatom 5. CH₂OH peger op i ringen, så sukkeret er en D-form med OH-gruppen til højre.";
        var ned = su.sider[k] === "H";
        return "Carbonatom " + k + ". OH-gruppen peger " + (ned ? "ned" : "op") + " i ringen, så den skal stå til " + (ned ? "højre" : "venstre") + " i fischerprojektionen.";
    };

    P.bedoem = function (vist) {
        var o = this.opg, tekst = null, mig = this;
        if (o.slags === "numre") {
            var i;
            for (i = 0; i < 6; i++) if (this.numre[i] !== "C" + (i + 1)) break;
            if (i < 6) {
                tekst = i === 0 ? o.fejl1 : o.fejlN.replace("{n}", String(i + 1));
                this.numre = this.numre.slice(0, i);
            }
        } else {
            var f = this.facit(), forkerte = this.pladser().filter(function (k) { return mig.valg[k] !== f[k]; });
            this.forkert = {};
            forkerte.forEach(function (k) { mig.forkert[k] = true; });
            if (forkerte.length) {
                tekst = this.fejlTekst(forkerte[0]);
                if (forkerte.length > 1) tekst += " Der er " + forkerte.length + " fejl i alt.";
            }
        }
        if (tekst) {
            this.fejl = true;
            this.visKort();
            this.fejlLinje(tekst);
            return;
        }
        var st = this.status[this.nr], foerste = !st.loest;
        st.loest = true;
        st.stjerne = st.stjerne || (!this.fejl && !this.sv && !vist);
        this.gem();
        var alle = this.antalLoest() === this.opgaver.length;
        var naeste = this.naesteUloeste();
        this.groen = {
            spm: true, maade: vist || this.sv ? "svar" : "selv",
            tekst: o.forkl + (alle && foerste ? " " + D.HAWORTH_FAERDIG : ""),
            knap: naeste >= 0 ? "Næste opgave →" : "Videre til Ligevægten →"
        };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (alle && foerste) NK.konfettiRegn(NK.el("fane-h").querySelector(".scene"), 60);
        else NK.konfetti(this.el.skort, 16);
    };

    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-l");
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () {
        if (this.groen) return;
        this.vaelg(this.nr);
    };

    /* ----- Hjaelpen ------------------------------------------------------------------- */
    P.hintNu = function () { return this.groen ? [] : this.opg.hint; };
    P.efterHint = function (n) { if (n >= 1 && this.opg.slags !== "numre") this.farveHint = true; };

    P.visSvar = function () {
        this.sv = true;
        if (this.opg.slags === "numre") this.numre = ["C1", "C2", "C3", "C4", "C5", "C6"];
        else this.valg = this.facit();
        this.bedoem(true);
    };

    /* ----- Tilstandene: fischerprojektionen og ringen -------------------------------- */
    /* Ringen med elevens valg (eller hele ringen) */
    P.ringTilstand = function (valg, hel) {
        var R = this.M.rammer, form = this.opg.form;
        var T0 = S.tilstand(hel && form === "beta" ? R.K2b : R.K2);
        if (hel) return T0;
        /* OH-gruppen paa carbonatom 1 tegnes som én gruppe "OH" */
        T0.it.H5.a = 0;
        /* CH₂OH paa carbonatom 5 peger op (D-form) og er tegnet fra start */
        for (var k = 1; k <= 4; k++) {
            var id = "O" + k, b = "C" + k + "-O" + k;
            var r = valg[k];
            if (!r) { T0.it[id].a = 0; T0.b[b].a = 0; continue; }
            var p = S.ringSub(false, k, r);
            T0.it[id] = { x: p.x, y: p.y, t: p.t, an: p.an, a: 1 };
            T0.b[b].a = 1;
        }
        return T0;
    };

    /* Fischerprojektionen med elevens valg (eller hele kaeden) */
    P.kaedeTilstand = function (valg, hel) {
        var T0 = S.tilstand(this.M.rammer.K0);
        T0.it.H5.a = 0;
        T0.it.O5.t = this.su.sider[5] === "H" ? "OH" : "HO";
        T0.it.O5.an = this.su.sider[5] === "H" ? 0 : 1;
        if (hel) return T0;
        for (var k = 2; k <= 5; k++) {
            var o = "O" + k, h = "H" + k + "c", s = valg[k];
            if (!s) {
                T0.it[o].a = 0; T0.it[h].a = 0;
                T0.b["C" + k + "-" + o].a = 0; T0.b["C" + k + "-" + h].a = 0;
                continue;
            }
            var p = S.fischerSub(k, s);
            T0.it[o] = { x: p.x, y: p.y, t: p.t, an: p.an, a: 1 };
            T0.it[h] = { x: -p.x, y: p.y, t: "H", an: 0, a: 1 };
        }
        return T0;
    };

    /* De to pladser for hver tomme plads: [{ k, ret, x, y }] i enheder */
    P.pladsEnder = function () {
        var ud = [], mig = this;
        this.pladser().forEach(function (k) {
            if (mig.opg.slags === "ring") {
                ["op", "ned"].forEach(function (r) { var p = S.ringSub(false, k, r); ud.push({ k: k, ret: r, x: p.x, y: p.y }); });
            } else {
                ["V", "H"].forEach(function (s) { var p = S.fischerSub(k, s); ud.push({ k: k, ret: s, x: p.x, y: p.y }); });
            }
        });
        return ud;
    };

    /* ----- Musen ----------------------------------------------------------------------- */
    P.ramt = function (pt) {
        if (!pt || this.groen) return null;
        var o = this.opg, mig = this, bedst = null, afst = 1e9;
        if (o.slags === "numre") {
            var v = this.vR;
            for (var k = 1; k <= 6; k++) {
                var q;
                if (k === 6) { var kb = this.kasser.C6; if (!kb) continue; q = { x: kb.x + kb.w * 0.2, y: kb.cy }; }
                else q = { x: v.cx + S.R6[k][0] * v.s, y: v.cy + S.R6[k][1] * v.s };
                var d = Math.sqrt((pt.x - q.x) * (pt.x - q.x) + (pt.y - q.y) * (pt.y - q.y));
                if (d < Math.max(16, v.s * 0.32) && d < afst) { afst = d; bedst = { id: "C" + k }; }
                if (k === 6 && kb && pt.x > kb.x - 4 && pt.x < kb.x + kb.w + 4 && pt.y > kb.y - 4 && pt.y < kb.y + kb.h + 4) { bedst = { id: "C6" }; afst = 0; }
            }
            return bedst;
        }
        var view = o.slags === "ring" ? this.vR : this.vF;
        this.pladsEnder().forEach(function (e) {
            var x = view.cx + e.x * view.s, y = view.cy + e.y * view.s;
            var d = Math.sqrt((pt.x - x) * (pt.x - x) + (pt.y - y) * (pt.y - y));
            if (d < Math.max(18, view.s * 0.36) && d < afst) { afst = d; bedst = e; }
        });
        return bedst;
    };

    P.overScene = function (pt) {
        this.hover = this.ramt(pt);
        return this.hover ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        var r = this.ramt(pt);
        if (!r) { this.kortBlink(); return; }
        if (this.opg.slags === "numre") {
            var i = this.numre.indexOf(r.id);
            if (i >= 0) this.numre = this.numre.slice(0, i);
            else if (this.numre.length < 6) this.numre.push(r.id);
        } else {
            this.valg[r.k] = this.valg[r.k] === r.ret ? null : r.ret;
            delete this.forkert[r.k];
        }
        this.besked("", "");
        this.visKort();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, o = this.opg;
        if (!o) return;
        var midtY = t.y + (t.h - 34) / 2;
        if (o.slags === "numre") {
            var sr = Math.round(NK.klamp(Math.min((t.h - 50) / 3.4, t.b / 5.0), 40, 92));
            this.vR = { cx: t.x + t.b / 2, cy: midtY + 0.15 * sr, s: sr };
            this.vF = null;
            this.saetAnker("ring", this.vR.cx - 1.8 * sr, midtY - 1.7 * sr, 3.6 * sr, 3.4 * sr);
            this.saetAnker("fischer", this.vR.cx - 2, midtY, 4, 4);
            return;
        }
        var sf = Math.round(NK.klamp(Math.min((t.h - 50) / 7.0, t.b * 0.42 / 3.6), 28, 58));
        var srr = Math.round(NK.klamp(Math.min(sf * 1.5, (t.h - 50) / 3.4, t.b * 0.46 / 3.6), 34, 86));
        this.vF = { cx: t.x + t.b * 0.27, cy: midtY + 0.2 * sf, s: sf };
        this.vR = { cx: t.x + t.b * 0.70, cy: midtY + 0.1 * srr, s: srr };
        this.saetAnker("fischer", this.vF.cx - 1.8 * sf, midtY - 3.4 * sf, 3.6 * sf, 6.9 * sf);
        this.saetAnker("ring", this.vR.cx - 1.8 * srr, midtY - 1.7 * srr, 3.6 * srr, 3.4 * srr);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tomPlads = function (ctx, view, kx, ky, e, opt) {
        var x = view.cx + e.x * view.s, y = view.cy + e.y * view.s;
        var cx = view.cx + kx * view.s, cy = view.cy + ky * view.s;
        var r = Math.max(8, view.s * 0.17);
        var over = this.hover && this.hover.k === e.k && this.hover.ret === e.ret;
        ctx.save();
        ctx.globalAlpha = opt.svag ? 0.35 : 1;
        ctx.strokeStyle = over ? T.VALG : "#9aa3b2";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        var dx = x - cx, dy = y - cy, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var start = view.s * (opt.fra || 0);
        ctx.beginPath();
        ctx.moveTo(cx + dx / l * start, cy + dy / l * start);
        ctx.lineTo(x - dx / l * r, y - dy / l * r);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = over ? "rgba(47, 111, 222, 0.16)" : "rgba(255, 255, 255, 0.9)";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg, mig = this;
        if (!lay) return;
        var t = lay.tavle;
        T.tavle(ctx, lay);
        this.kasser = {};
        var bundY = t.y + t.h - 20;

        if (o.slags === "numre") {
            var Tn = this.ringTilstand(null, true);
            var numre = {}, numTekst = {};
            if (this.groen) numre = true;
            else this.numre.forEach(function (id, j) { numre[id.slice(1)] = true; numTekst[id.slice(1)] = String(j + 1); });
            this.kasser = S.tegn(ctx, this.M, Tn, this.vR, { numre: numre, numTekst: this.groen ? null : numTekst });
            /* Smaa cirkler viser, hvor carbonatomerne er, til de har faaet et nummer */
            if (!this.groen) {
                for (var kk = 1; kk <= 5; kk++) {
                    if (this.numre.indexOf("C" + kk) >= 0) continue;
                    var qq = { x: this.vR.cx + S.R6[kk][0] * this.vR.s, y: this.vR.cy + S.R6[kk][1] * this.vR.s };
                    ctx.save();
                    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                    ctx.strokeStyle = "#8a93a3"; ctx.lineWidth = 1.8;
                    ctx.beginPath(); ctx.arc(qq.x, qq.y, Math.max(6, this.vR.s * 0.09), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.restore();
                }
            }
            /* Carbonatomerne i ringens hjoerner er klikbare: en lille cirkel ved musen */
            if (this.hover && !this.groen) {
                var h = this.hover.id, k = parseInt(h.slice(1), 10), q;
                if (k === 6) { var kb = this.kasser.C6; q = kb ? { x: kb.x + kb.w * 0.2, y: kb.cy } : null; }
                else q = { x: this.vR.cx + S.R6[k][0] * this.vR.s, y: this.vR.cy + S.R6[k][1] * this.vR.s };
                if (q) {
                    ctx.save();
                    ctx.strokeStyle = T.VALG; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
                    ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(12, this.vR.s * 0.24), 0, Math.PI * 2); ctx.stroke();
                    ctx.restore();
                }
            }
            T.billedtekst(ctx, this.vR.cx, bundY, "α-glucose (haworthformel)");
            this.tegnSejr(ctx, t);
            return;
        }

        var fv = {}, rv = {};
        var hint = this.farveHint;
        /* Fischerprojektionen til venstre */
        var Tf = o.slags === "kaede" ? this.kaedeTilstand(this.valg, false) : this.kaedeTilstand(null, true);
        if (hint && o.slags === "ring") {
            for (var j = 2; j <= 5; j++) fv["O" + j] = this.su.sider[j] === "H" ? BLAA : ROED;
        }
        if (o.slags === "kaede") {
            Object.keys(this.forkert).forEach(function (k) { fv["O" + k] = ROED; });
        }
        var kasserF = S.tegn(ctx, this.M, Tf, this.vF, { numre: true, farve: fv });
        if (o.slags === "kaede" && !this.groen) {
            this.pladsEnder().forEach(function (e) {
                var v = mig.valg[e.k];
                /* Er pladsen sat, staar H paa den anden side; et klik paa H flytter OH-gruppen */
                if (v) return;
                mig.tomPlads(ctx, mig.vF, 0, S.fy(e.k), e, { svag: false, fra: 0.3 });
            });
        }
        T.billedtekst(ctx, this.vF.cx, bundY, this.su.navn + " (fischerprojektion)");

        /* Pilen */
        T.pil(ctx, this.vF.cx + 1.6 * this.vF.s, this.vR.cx - 1.95 * this.vR.s, this.vR.cy);

        /* Ringen til hoejre */
        var Tr = o.slags === "ring" ? this.ringTilstand(this.valg, false) : this.ringTilstand(null, true);
        if (hint && o.slags === "kaede") {
            for (var k2 = 2; k2 <= 4; k2++) rv["O" + k2] = this.su.sider[k2] === "H" ? BLAA : ROED;
        }
        if (o.slags === "ring") {
            Object.keys(this.forkert).forEach(function (k) { rv["O" + k] = ROED; });
        }
        this.kasser = S.tegn(ctx, this.M, Tr, this.vR, { numre: true, farve: rv });
        if (o.slags === "ring" && !this.groen) {
            this.pladsEnder().forEach(function (e) {
                var v = mig.valg[e.k];
                if (v === e.ret) return;
                var c = S.R6[e.k];
                mig.tomPlads(ctx, mig.vR, c[0], c[1], e, { svag: !!v, fra: 0.08 });
            });
        }
        T.billedtekst(ctx, this.vR.cx, bundY, D.formNavn(o.form, o.sukker) + " (haworthformel)");

        /* De forkerte grupper har en roed ramme */
        Object.keys(this.forkert).forEach(function (k) {
            if (!mig.valg[k]) return;
            var id = "O" + k;
            T.valgRamme(ctx, (o.slags === "ring" ? mig.kasser : kasserF)[id], T.FORKERT, true);
        });
        this.tegnSejr(ctx, t);
    };

    NK.SimHaworth = SimHaworth;
}());
