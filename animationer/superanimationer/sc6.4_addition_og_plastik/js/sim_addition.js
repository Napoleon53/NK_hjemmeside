/* =====================================================================
   sim_addition.js - fane 1: Addition

   Midt i scenen ligger et molekyle som strukturformel: ethen, ethan
   eller propen. Paa hylden nederst ligger brom, hydrogen og vand.
   Eleven traekker et af dem hen til dobbeltbindingen. Saa aabner den
   sig, hvert af de to carbonatomer faar en ledig plads, og molekylets
   to dele saetter sig paa. Der bliver kun ét produkt. Ethan har ingen
   dobbeltbinding, saa dér kan intet saette sig paa.

   Kemien er K.rig i js/kemi.js: alle atomer og bindinger med start og
   slut. Fanen flytter dem kun fra det ene til det andet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var REAK_SEK = 2.9;       /* en addition fra slip til faerdigt produkt */
    var AFVIS_SEK = 1.9;      /* et molekyle, der ikke kan saette sig paa */
    var SET_SEK = 0.6;        /* saa laenge staar produktet, foer det taeller */
    /* Additionens dele (broekdele af REAK_SEK): flyv hen, vent, aabn, saet paa */
    var F1 = 0.2, F2 = 0.3, F3 = 0.58, F4 = 0.86;

    function SimAddition() {
        this.stof = "ethen";
        this.produkt = null;      /* det, der har sat sig paa: "Br2", "H2" eller "H2O" */
        this.reak = null;         /* { reagens, t, fra, afvist, tekst } */
        this.traek = null;        /* { reagens, x, y, x0, y0 } */
        this.over = null;
        this.lavet = [];          /* de additioner, eleven har lavet: "ethen+Br2" */
        this.afvistN = 0;
        this.afvistSet = false;
        this.setT = 0;
        this.u = 0;
        this.cy = 0;
        this.startFane(D.A_MAAL);
        this.visPanel();
    }

    var P = SimAddition.prototype;
    NK.Fane.paa(P, { navn: "a", naesteFane: "fane-b", naesteNavn: "Bromvand" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) {
        var op = o.opstil || {};
        this.stof = op.stof || "ethen";
        this.produkt = op.produkt || null;
        this.reak = null;
        this.traek = null;
        this.setT = 0;
        this.afvistSet = false;
        this.afvistN = 0;
        this.snap = true;         /* molekylet staar paa sin plads fra foerste billede */
        if (this.status) this.visPanel();
    };

    P.efterOpgave = function () { this.visPanel(); };

    P.nulstilScene = function () {
        var op = this.opg.o.opstil || {};
        this.stof = op.stof || "ethen";
        /* i et maal, der kun er et spoergsmaal om produktet, ligger produktet klar */
        this.produkt = this.opg.o.forsoeg ? null : (op.produkt || null);
        this.reak = null;
        this.traek = null;
        this.setT = 0;
    };

    /* De tre molekyler paa hylden kommer frem, efterhaanden som maalene bruger dem */
    P.kanBruges = function (r) {
        var fra = D.REAGENS_FRA[r];
        return this.idx(this.opg.o.id) >= this.idx(fra) || this.erLoest(fra);
    };

    P.kravNu = function () {
        var o = this.opg.o;
        return o.forsoeg ? o.forsoeg.krav : null;
    };

    /* Kortets opgavetekst siger, hvad der skal traekkes hvorhen. Linjen under
       den har kun noget at tilfoeje, mens additionen sker, og naar eleven har
       brugt et andet molekyle end det, opgaven beder om. */
    P.sceneLinje = function () {
        var krav = this.kravNu();
        var sNavn = K.STOF[this.stof].navn;
        if (this.reak) {
            if (this.reak.afvist) return "";
            return "Dobbeltbindingen i " + sNavn + " åbner sig, og der bliver en ledig plads på hvert carbonatom.";
        }
        if (!this.produkt || this.produkt === krav) return "";
        var r = krav === "afvist" ? "Br2" : krav;
        return "Du brugte " + K.REAGENS[this.produkt].navn + ", og produktet er " + K.produkt(this.stof, this.produkt).navn +
            ". Tryk på Nyt molekyle, og træk " + K.REAGENS[r].navn + "molekylet hen til dobbeltbindingen i " + sNavn + ".";
    };

    /* Spoergsmaalene gaelder det produkt, maalet har lavet */
    P.spmLinje = function () {
        var o = this.opg.o, krav = (o.opstil && o.opstil.produkt) || this.kravNu();
        if (!krav || krav === "afvist" || this.reak || this.produkt === krav) return "";
        return "Spørgsmålet gælder produktet af " + K.STOF[this.stof].navn + " og " + K.REAGENS[krav].navn + ". " +
            (this.produkt ? "Tryk på Nyt molekyle, og træk " : "Træk ") + K.REAGENS[krav].navn + "molekylet hen til dobbeltbindingen i " + K.STOF[this.stof].navn + "." + D.SAA_SVAR;
    };

    P.forsoegSvar = function (o) {
        var krav = o.forsoeg.krav;
        this.reak = null;
        this.traek = null;
        if (krav === "afvist") { this.afvistSet = true; this.husk(this.stof + "+Br2"); this.visPanel(); return; }
        this.produkt = krav;
        this.husk(this.stof + "+" + krav);
        this.visPanel();
    };

    P.husk = function (noegle) {
        if (this.lavet.indexOf(noegle) < 0) this.lavet.push(noegle);
    };

    /* ----- Panelet: de additioner, eleven har lavet ------------------------------------ */
    P.visPanel = function () {
        var html = "";
        this.lavet.forEach(function (n) {
            var d = n.split("+"), s = K.STOF[d[0]], r = K.REAGENS[d[1]], p = K.produkt(d[0], d[1]);
            html += '<div class="talraekke skema"><span>' + NK.html(s.navn + " + " + r.navn) + '</span><span class="tal">' +
                NK.html(p ? K.skema(d[0], d[1]) : "ingen addition") + "</span></div>";
        });
        NK.saetHTML("a-regnskab", html);
        NK.el("a-regnkort").hidden = !html;
    };

    /* ----- Reaktionen ------------------------------------------------------------------- */
    /* Et molekyle fra hylden er sluppet over molekylet (eller klikket paa) */
    P.reager = function (reagens, fra) {
        if (this.reak) return;
        this.nulstilHjaelp();
        var r = K.REAGENS[reagens], s = K.STOF[this.stof];
        if (this.produkt) {
            this.reak = { reagens: reagens, t: 0, fra: fra, afvist: true, tekst: D.afvistProdukt(r.navn, K.produkt(this.stof, this.produkt).navn) };
        } else if (!K.kanAddere(this.stof)) {
            this.reak = { reagens: reagens, t: 0, fra: fra, afvist: true, tekst: D.afvist(s.navn, r.navn), tael: true };
        } else {
            this.reak = { reagens: reagens, t: 0, fra: fra, afvist: false, rig: K.rig(this.stof, reagens) };
        }
        if (!this.faerdig && !this.venter) this.naesteLinje("", "");
    };

    P.reakSlut = function () {
        var rk = this.reak;
        this.reak = null;
        if (rk.afvist) {
            if (!rk.tael) { this.kortBesked(rk.tekst, 7); return; }
            /* ethan: intet kan saette sig paa */
            var maalet = !this.faerdig && !this.venter && this.opg.fase === "forsoeg" && this.kravNu() === "afvist";
            this.afvistN++;
            this.husk(this.stof + "+" + rk.reagens);
            this.visPanel();
            if (maalet && rk.reagens === "Br2") { this.afvistSet = true; this.forsoegKlaret(""); return; }
            if (this.afvistN === 3) { this.kortBesked(D.PAASKE.ethan, 6); return; }
            this.kortBesked(rk.tekst + (maalet ? " Prøv også med brom." : ""), 7);
            return;
        }
        this.produkt = rk.reagens;
        this.setT = 0;
        this.husk(this.stof + "+" + rk.reagens);
        this.visPanel();
        if (!this.faerdig && !this.venter) this.naesteLinje("", "");
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        var hh = NK.klamp(Hs * 0.17, 84, 106), bb = NK.klamp(W * 0.21, 124, 176);
        lay.hylde = { y: Hs - hh - 12, h: hh };
        var xs = [W * 0.22, W * 0.5, W * 0.78];
        lay.brik = {};
        K.REAGENSER.forEach(function (r, i) { lay.brik[r] = { x: xs[i] - bb / 2, y: lay.hylde.y, b: bb, h: hh }; });
        lay.bund = lay.hylde.y - 14;
        lay.bh = baand.h;
        this.lay = lay;
        /* Nyt molekyle staar til hoejre lige under kortets plads; under et gaet er der intet at laegge klar */
        if (this.el.forfra) {
            this.el.forfra.style.top = (10 + this.kortZone() + 8) + "px";
            this.el.forfra.hidden = this.gaetNu();
        }
        this.maalMol();
        if (!this.u) { this.u = lay.uMaal; this.cy = lay.cyMaal; }
        var u = lay.uMaal;
        this.saetAnker("mol", W / 2 - 2.8 * u, lay.cyMaal - 1.4 * u, 5.6 * u, 2.8 * u);
        this.saetAnker("hylde", lay.brik.Br2.x - 4, lay.hylde.y - 4, lay.brik.H2O.x + bb - lay.brik.Br2.x + 8, hh + 8);
    };

    /* Hvor molekylet skal staa, og hvor stort det kan vaere. Det staar under
       den plads, scenekortet har faaet sat af, med plads til, at molekylet
       fra hylden kan svaeve over det. Et gaet er hoejere end den plads: naar
       molekylet ellers ville ligge under kortet, rykker det ned. */
    P.maalMol = function () {
        var lay = this.lay, e = this.el.skort;
        var top = 10 + this.kortZone() + 8, zone = lay.bund - top;
        var u = NK.klamp((zone - 76) / 4.15, 24, 78);
        var fri = Math.max(0, zone - (4.15 * u + 76));
        var cy = top + fri / 2 + 2.9 * u;
        if (this.gaetNu() && e) {
            var gk = e.offsetTop + e.offsetHeight + 10;
            if (cy - 1.3 * u < gk) {
                var z2 = lay.bund - gk;
                u = Math.min(u, NK.klamp((z2 - 36) / 2.5, 20, 78));
                cy = gk + Math.max(0, z2 - (2.5 * u + 36)) / 2 + 1.25 * u;
            }
        }
        lay.uMaal = u;
        lay.cyMaal = cy;
    };

    P.opdaterScene = function (dt) {
        var lay = this.lay, g = this.opg;
        if (!lay) return;
        /* statuslinjen er blevet hoejere eller lavere: hylden flytter med */
        if (this.baand().h !== lay.bh) { this.layout(); lay = this.lay; }
        this.maalMol();
        if (this.snap) { this.snap = false; this.u = lay.uMaal; this.cy = lay.cyMaal; }
        this.u = NK.mod(this.u, lay.uMaal, 9, dt);
        this.cy = NK.mod(this.cy, lay.cyMaal, 9, dt);
        if (Math.abs(this.u - lay.uMaal) < 0.05) this.u = lay.uMaal;
        if (Math.abs(this.cy - lay.cyMaal) < 0.3) this.cy = lay.cyMaal;

        if (this.reak) {
            this.reak.t += dt / (this.reak.afvist ? AFVIS_SEK : REAK_SEK);
            if (this.reak.t >= 1) this.reakSlut();
        }
        if (this.faerdig || this.venter || g.fase !== "forsoeg" || this.reak) return;
        var krav = this.kravNu();
        if (krav !== "afvist" && this.produkt === krav) {
            this.setT += dt;
            if (this.setT >= SET_SEK) this.forsoegKlaret("");
        }
    };

    /* Det molekyle paa hylden, der skal traekkes nu, eller null */
    P.peger = function () {
        var g = this.opg;
        if (this.faerdig || this.venter || g.fase !== "forsoeg" || this.reak || this.traek) return null;
        var krav = this.kravNu();
        if (krav === "afvist") return this.afvistSet ? null : "Br2";
        return this.produkt ? null : krav;
    };

    /* Midten af dobbeltbindingen (eller af molekylet) i pixels */
    P.maalPunkt = function () {
        var s = K.STOF[this.stof], x = 0;
        if (s.dobbelt) x = (s.atomer[s.dobbelt[0]][1] + s.atomer[s.dobbelt[1]][1]) / 2;
        return { x: this.lay.W / 2 + x * this.u, y: this.cy };
    };

    P.px = function (p) {
        return { x: this.lay.W / 2 + p[0] * this.u, y: this.cy + p[1] * this.u };
    };

    /* Molekylet, som det ligger: alene eller med det, der har sat sig paa */
    P.rigNu = function () {
        var n = this.stof + "+" + this.produkt;
        if (!this._rig || this._rigN !== n) { this._rig = K.rig(this.stof, this.produkt); this._rigN = n; }
        return this._rig;
    };

    /* Atomerne og bindingerne, som de staar lige nu */
    P.figur = function () {
        var mig = this, u = this.u, rk = this.reak;
        var add = rk && !rk.afvist;
        var rig = add ? rk.rig : this.rigNu();
        var t = add ? rk.t : 1;
        var eInd = NK.blod(t / F1), eAab = NK.blod((t - F2) / (F3 - F2)), ePaa = NK.blod((t - F3) / (F4 - F3));
        if (!rig.reagens) { eAab = 0; ePaa = 0; }
        var atomer = rig.atomer.map(function (a, i) {
            var p;
            if (a.del === "stof") p = [NK.lerp(a.p0[0], a.p1[0], eAab), NK.lerp(a.p0[1], a.p1[1], eAab)];
            else p = [NK.lerp(a.p0[0], a.p1[0], ePaa), NK.lerp(a.p0[1], a.p1[1], ePaa)];
            var pt = mig.px(p);
            if (add && a.del !== "stof" && eInd < 1) {
                /* flyver fra det sted, det blev sluppet */
                var r0 = K.REAGENS[rk.reagens].atomer[i - (rig.atomer.length - K.REAGENS[rk.reagens].atomer.length)];
                var um = u * 0.62;
                pt = { x: NK.lerp(rk.fra.x + r0[1] * um, pt.x, eInd), y: NK.lerp(rk.fra.y + r0[2] * um, pt.y, eInd) };
            }
            return { el: a.el, x: pt.x, y: pt.y };
        });
        var bindinger = rig.bindinger.map(function (b) {
            var s;
            if (b.dobbelt) s = NK.lerp(b.s0, b.s1, eAab);
            else if (b.brydes) s = 1 - eAab;
            else if (b.ny) s = ePaa;
            else s = b.s1;
            return { a: b.a, b: b.b, s: s };
        });
        var pladser = [];
        if (add && rig.pladser) {
            var s0 = K.STOF[this.stof];
            rig.pladser.forEach(function (pl, k) {
                var c = atomer[s0.dobbelt[k]], pt = mig.px(pl);
                pladser.push({ cx: c.x, cy: c.y, x: pt.x, y: pt.y, alfa: eAab * (1 - ePaa) });
            });
        }
        return { atomer: atomer, bindinger: bindinger, pladser: pladser, rig: rig };
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegnReagens = function (ctx, r, x, y, um, alfa) {
        var R = K.REAGENS[r];
        var atomer = R.atomer.map(function (a) { return { el: a[0], x: x + a[1] * um, y: y + a[2] * um, alfa: alfa }; });
        var bind = R.bindinger.map(function (b) { return { a: b[0], b: b[1], s: b[2], alfa: alfa }; });
        Tg.molekyle(ctx, atomer, bind, um);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this, u = this.u;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);

        /* Hylden */
        var H = lay.hylde, peger = this.peger();
        ctx.fillStyle = "#1b1c24";
        ctx.fillRect(0, H.y - 12, lay.W, lay.Hs - H.y + 12);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(0, H.y - 12, lay.W, 1);
        K.REAGENSER.forEach(function (r) {
            if (!mig.kanBruges(r)) return;
            var B = lay.brik[r], R = K.REAGENS[r];
            var ude = (mig.traek && mig.traek.reagens === r) || (mig.reak && mig.reak.reagens === r);
            Tg.brik(ctx, B.x, B.y, B.b, B.h, { over: mig.over === r && !ude, alfa: ude ? 0.45 : 1 });
            mig.tegnReagens(ctx, r, B.x + B.b / 2, B.y + B.h * 0.4, Math.min(34, B.h * 0.34), ude ? 0.3 : 1);
            NK.tekst(ctx, R.navn + ", " + R.formel, B.x + B.b / 2, B.y + B.h - 13, { font: Tg.font("600", 15), justering: "center", farve: ude ? "#7e8590" : "#dfe5ec" });
            if (peger === r) Tg.ring(ctx, B.x, B.y, B.b, B.h, mig.tid);
        });

        /* Molekylet */
        var f = this.figur(), s = K.STOF[this.stof], m = this.maalPunkt();
        if (this.traek) {
            /* maalet lyser op, mens noget holdes */
            if (s.dobbelt && !this.produkt) Tg.ring(ctx, m.x - 0.8 * u, m.y - 0.45 * u, 1.6 * u, 0.9 * u, this.tid, 16);
            else Tg.ring(ctx, lay.W / 2 - 2.2 * u, this.cy - 1.3 * u, 4.4 * u, 2.6 * u, this.tid, 20);
        }
        /* En rolig gul ring om det molekyle, spoergsmaalet handler om */
        if (this.omNu().indexOf("mol") >= 0 && !this.traek && !this.reak) {
            var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
            f.atomer.forEach(function (a) { x0 = Math.min(x0, a.x); x1 = Math.max(x1, a.x); y0 = Math.min(y0, a.y); y1 = Math.max(y1, a.y); });
            Tg.omRing(ctx, x0 - 0.42 * u, y0 - 0.34 * u, x1 - x0 + 0.84 * u, y1 - y0 + 0.66 * u);
        }
        f.pladser.forEach(function (p) { Tg.plads(ctx, p.cx, p.cy, p.x, p.y, u, p.alfa); });
        Tg.molekyle(ctx, f.atomer, f.bindinger, u);

        /* Ordet dobbeltbinding staar ved de to streger i det foerste maal */
        if (s.dobbelt && !this.produkt && !this.reak && this.opg.o.id === "brom" && !this.faerdig) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, 0.7)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y + 0.18 * u);
            ctx.lineTo(m.x, m.y + 1.0 * u);
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "dobbeltbinding", m.x, m.y + 1.0 * u + 16, { font: Tg.font("600", 14), justering: "center", farve: "#f7e4ab" });
        }

        /* Navnet under molekylet, og reaktionsskemaet, naar additionen er set */
        var medOrd = s.dobbelt && !this.produkt && !this.reak && this.opg.o.id === "brom" && !this.faerdig;
        var yN = this.cy + 1.25 * u + (medOrd ? 42 : 32);
        if (!this.gaetNu() || lay.bund - yN > 4) {
            if (this.produkt && !this.reak) {
                var p = K.produkt(this.stof, this.produkt);
                NK.tekst(ctx, p.navn + ", " + p.formel, lay.W / 2, yN, { font: Tg.font("700", 18), justering: "center", farve: "#ffffff" });
                Tg.maerkat(ctx, K.skema(this.stof, this.produkt), lay.W / 2, yN + 30, { px: 16, farve: "#b8f0cf", bund: "rgba(63, 174, 114, 0.16)" });
            } else if (!this.reak || this.reak.afvist) {
                NK.tekst(ctx, s.navn + ", " + s.formel, lay.W / 2, yN, { font: Tg.font("600", 17), justering: "center", farve: "#c9d0d9" });
            }
        }

        /* Et molekyle, der ikke kan saette sig paa: hen, ryst og tilbage */
        if (this.reak && this.reak.afvist) {
            var rk = this.reak, t = rk.t, B2 = lay.brik[rk.reagens];
            var hen = { x: lay.W / 2, y: this.cy - 1.9 * u }, hjem = { x: B2.x + B2.b / 2, y: B2.y + B2.h * 0.4 };
            var x, y, um = u * 0.62;
            if (t < 0.28) {
                var e1 = NK.blod(t / 0.28);
                x = NK.lerp(rk.fra.x, hen.x, e1); y = NK.lerp(rk.fra.y, hen.y, e1);
            } else if (t < 0.68) {
                var v = (t - 0.28) / 0.4;
                x = hen.x + Math.sin(v * Math.PI * 6) * 9 * (1 - v);
                y = hen.y + Math.abs(Math.sin(v * Math.PI * 3)) * 0.42 * u * (1 - v * 0.6);
                Tg.maerkat(ctx, "ingen ledig plads", hen.x, hen.y - 0.62 * u - 8, { px: 15, farve: "#ffd7d2", bund: "rgba(224, 84, 70, 0.34)" });
            } else {
                var e2 = NK.blod((t - 0.68) / 0.32);
                x = NK.lerp(hen.x, hjem.x, e2); y = NK.lerp(hen.y, hjem.y, e2);
                um = NK.lerp(u * 0.62, Math.min(34, B2.h * 0.34), e2);
            }
            this.tegnReagens(ctx, rk.reagens, x, y, um, 1);
        }

        /* Det gule skilt ved det, der skal traekkes nu */
        if (peger) {
            var Bp = lay.brik[peger];
            Tg.skilt(ctx, K.kanAddere(this.stof) ? "Træk hen til dobbeltbindingen" : "Træk hen til molekylet", Bp.x + Bp.b / 2, Bp.y - 12, 8, lay.W - 8);
        }

        /* Molekylet under musen */
        if (this.traek) this.tegnReagens(ctx, this.traek.reagens, this.traek.x, this.traek.y, u * 0.62, 1);
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.brikVed = function (pt) {
        var lay = this.lay, ud = null, mig = this;
        K.REAGENSER.forEach(function (r) {
            var B = lay.brik[r];
            if (mig.kanBruges(r) && pt.x >= B.x && pt.x <= B.x + B.b && pt.y >= B.y && pt.y <= B.y + B.h) ud = r;
        });
        return ud;
    };

    P.molVed = function (pt, bredt) {
        var u = this.u, k = bredt ? 1.25 : 1;
        return Math.abs(pt.x - this.lay.W / 2) <= 2.5 * u * k && pt.y >= this.cy - (bredt ? 3.1 : 1.3) * u && pt.y <= this.cy + 1.35 * u * k;
    };

    P.overScene = function (pt) {
        this.over = null;
        if (!pt || !this.lay) return null;
        var r = this.brikVed(pt);
        if (r) { this.over = r; return this.gaetNu() || this.reak ? "klik" : "greb"; }
        return this.molVed(pt) ? "klik" : null;
    };

    P.nedScene = function (pt) {
        if (this.gaetNu() || this.reak) return false;       /* gaettet foerst: klikket faar kortet til at blinke */
        var r = this.brikVed(pt);
        if (!r) return false;
        this.traek = { reagens: r, x: pt.x, y: pt.y, x0: pt.x, y0: pt.y };
        return true;
    };

    P.flytScene = function (pt) {
        if (this.traek) { this.traek.x = pt.x; this.traek.y = pt.y; }
    };

    P.opScene = function (pt) {
        var t = this.traek;
        this.traek = null;
        if (!t) return;
        var B = this.lay.brik[t.reagens];
        /* et klik paa molekylet paa hylden sender det selv af sted */
        if (Math.hypot(pt.x - t.x0, pt.y - t.y0) < 8) {
            this.reager(t.reagens, { x: B.x + B.b / 2, y: B.y + B.h * 0.4 });
            return;
        }
        if (this.molVed(pt, true)) { this.reager(t.reagens, { x: pt.x, y: pt.y }); return; }
        this.kortBesked("Slip " + K.REAGENS[t.reagens].navn + "molekylet oven på molekylet midt i scenen.", 5);
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var paaBrik = this.brikVed(pt), paaMol = this.molVed(pt);
        if (this.gaetNu()) {
            if (paaBrik || paaMol) this.gaetBlink();
            return;
        }
        if (!paaMol || this.reak) return;
        var s = K.STOF[this.stof];
        if (this.produkt) {
            var p = K.produkt(this.stof, this.produkt);
            this.kortBesked(K.Stort(p.navn) + ", " + p.formel + ". Dobbeltbindingen er blevet til en enkeltbinding, og der er kun dette ene produkt.", 6);
        } else if (s.dobbelt) {
            this.kortBesked(K.Stort(s.navn) + ", " + s.formel + ". De to streger mellem carbonatomerne er en dobbeltbinding. Træk et molekyle fra hylden hen til den.", 6);
        } else {
            this.kortBesked(K.Stort(s.navn) + ", " + s.formel + ". Der er kun enkeltbindinger, og hvert carbonatom har fire bindinger.", 6);
        }
    };

    NK.SimAddition = SimAddition;
}());
