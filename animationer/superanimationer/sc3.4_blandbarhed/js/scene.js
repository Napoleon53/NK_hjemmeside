/* =====================================================================
   scene.js - bassinet paa skaermen

   Binder modellen (js/model.js) til laerredet: placerer bassinet med
   koeleren, forlaget og det lille glas, tegner kuglerne, lader eleven
   ryste ved at traekke i bassinet og viser navnet paa den kugle, musen
   staar over.

   Alt placeres i bassinspritets enheder (sprites/bassin.svg, indersiden
   x 20-670 og y 30-604,4 = modellens 40,5 x 35,79 kuglediametre).
   Koeleren og forlaget har deres maal i js/apparat.js. Det lille glas er
   bassinspritet i godt en femtedel af stoerrelsen; det staar nede ved
   bassinet og glider op i hjoernet, naar forlaget er fremme.

   Haendelsen, som Kemichael lytter efter (NK.Bassin.prototype.paa):
     svaever     en stor oliedraabe svaever midt i det hele (paaskeaegget)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var A = NK.Apparat;
    var Tg = NK.Tegning;
    var TILST = NK.Model.TILSTAND;

    var SPRITE_B = 690, SPRITE_H = 686, SPRITE_TOP = -60;
    var IND_X = 20, IND_Y = 30, IND_B = 650, IND_BUND = 604.4;
    var KOELER = ["tilbagesvaler", "destillation"];

    function Bassin(canvas) {
        this.L = new NK.Laerred(canvas);
        this.m = new NK.Model(D);
        this.forlag = new NK.Model(D, A.forlagValg());
        this.forlag.saetT(20);
        this.koelerNavn = "tilbagesvaler";
        var mig = this;
        this.m.naarUd = function (art) { mig.forlag.dryp(art, A.drypX, A.drypY); };
        this.tid = 0;
        this.lay = null;
        this.ryk = 0;              /* bassinets forskydning, px */
        this.greb = null;          /* musen holder i bassinet */
        this.mus = null;
        this.lyttere = {};
        this.svaeverUr = 1;
        this.maengdeTekst = "";
        this.destillatTekst = null;
        this.glasT = 0;            /* 0: glasset staar nede, 1: oppe i hjoernet */
        this.koblMus();
    }

    var P = Bassin.prototype;

    P.paa = function (navn, f) { (this.lyttere[navn] = this.lyttere[navn] || []).push(f); };
    P.udsend = function (navn) {
        (this.lyttere[navn] || []).forEach(function (f) { f(); });
    };

    /* ----- Det, panelet og opgaverne kalder ------------------------------ */

    /* fyld: [["vand", 3], ["olie", 1]]. Forlaget toemmes ogsaa. */
    P.nulstil = function (fyld, blandet) {
        this.m.nulstil();
        this.forlag.nulstil();
        if (fyld && fyld.length) {
            var arter = [];
            fyld.forEach(function (f) { for (var i = 0; i < f[1]; i++) arter.push(D.nr(f[0])); });
            this.m.fyldStraks(arter, blandet);
        }
    };

    P.haeld = function (stofId) { this.m.haeldI(D.nr(stofId)); };

    P.ryst = function (sek) { this.m.ryst(sek || 1.2, 1); };

    /* Toemmer bassinet og forlaget */
    P.toem = function () { this.m.toem(); this.forlag.toem(); };

    P.saetT = function (T) { this.m.saetT(T); };

    P.analyse = function () { return this.m.analyse(); };

    /* Tilbagesvaler eller destillation. Knapperne i panelet foelger med. */
    P.saetKoeler = function (navn) {
        if (KOELER.indexOf(navn) < 0) return;
        if (navn !== this.koelerNavn) {
            this.koelerNavn = navn;
            this.m.saetKoeler(A.koeler(navn));
        }
        var knapper = document.querySelectorAll(".koelerknap");
        for (var i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-koeler") === navn;
            knapper[i].classList.toggle("valgt", valgt);
            knapper[i].setAttribute("aria-pressed", valgt ? "true" : "false");
        }
        if (this.lay) this.ankre();
    };

    P.skiftKoeler = function () {
        this.saetKoeler(this.koelerNavn === "destillation" ? "tilbagesvaler" : "destillation");
    };

    /* Forlaget staar fremme ved destillation, og saa laenge der er noget i det */
    P.visForlag = function () {
        return this.koelerNavn === "destillation" || this.forlag.kugler.some(function (k) {
            return k.tilst !== TILST.SPILD && k.tilst !== TILST.AFLOEB;
        });
    };

    /* ----- Placering ------------------------------------------------------- */
    P.tilpas = function () {
        this.L.tilpas();
        var W = this.L.b, H = this.L.h, K = A.KASSE;
        var bred = K.x1 - K.x0, hoej = K.y1 - K.y0;
        var k = Math.max(0.2, Math.min((W - 24) / bred, (H - 16) / hoej));
        var ox = Math.round((W - bred * k) / 2 - K.x0 * k);
        var oy = Math.round(H - 8 - K.y1 * k);
        var FL = A.FORLAG;
        this.lay = {
            k: k, x0: ox, y0: oy, u: IND_B * k / this.m.bredde,
            ind: { x: ox + IND_X * k, y: oy + IND_Y * k, b: IND_B * k, h: (IND_BUND - IND_Y) * k },
            forlag: { x: ox + FL.venstre * k, y: oy + FL.top * k, b: (FL.hoejre - FL.venstre) * k, h: (FL.bund - FL.top) * k }
        };
        this.ankre();
    };

    /* Det lille glas: nede ved bassinet eller oppe i hjoernet */
    P.glas = function () {
        var l = this.lay, G = A.GLAS;
        var gk = l.k * G.skala;
        var bund = NK.lerp(G.bundNede, G.bundOppe, NK.blod(this.glasT));
        var gx = l.x0 + G.x * l.k, gy = l.y0 + bund * l.k - SPRITE_H * gk;
        var top = gy - SPRITE_TOP * gk;           /* hvor bassinets y = 0 er */
        return {
            x: gx, y: gy, k: gk,
            ind: { x: gx + IND_X * gk, y: top + IND_Y * gk, bredde: IND_B * gk, hoejde: (IND_BUND - IND_Y) * gk },
            laag: top
        };
    };

    P.ankre = function () {
        var l = this.lay, g = this.glas(), kk = A.kasse(this.koelerNavn);
        this.anker("anker-bassin", l.x0, l.y0 + 20 * l.k, SPRITE_B * l.k, (SPRITE_H + SPRITE_TOP - 20) * l.k);
        this.anker("anker-glas", g.x - 10, g.laag - 34, SPRITE_B * g.k + 20, (IND_BUND + 10) * g.k + 40);
        this.anker("anker-koeler", l.x0 + kk.x0 * l.k, l.y0 + kk.y0 * l.k, (kk.x1 - kk.x0) * l.k, (kk.y1 - kk.y0) * l.k);
    };

    P.anker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    /* Modellens koordinater (kuglediametre, y opad) til pixels. Roeret
       over halsen bruger de samme koordinater og ryster med bassinet. */
    P.tilPx = function (x, y) {
        var l = this.lay;
        return { x: l.ind.x + this.ryk + x * l.u, y: l.ind.y + l.ind.h - y * l.u };
    };

    /* Det samme for forlaget, der staar stille */
    P.tilPxF = function (x, y) {
        var f = this.lay.forlag;
        return { x: f.x + x * this.lay.u, y: f.y + f.h - y * this.lay.u };
    };

    /* ----- Tidsskridt ------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var m = this.m;
        m.opdater(dt);
        this.forlag.opdater(dt);

        /* Bassinet ryster, mens modellen ryster, og fjedrer tilbage, naar
           musen slipper */
        if (m.rystTid > 0 && !this.greb) {
            this.ryk = Math.sin(this.tid * 13) * 5 * Math.min(1, m.rystTid * 2);
        } else if (!this.greb) {
            this.ryk *= Math.exp(-12 * dt);
        }

        /* Det lille glas glider op, naar forlaget kommer frem */
        var maal = this.visForlag() ? 1 : 0;
        if (this.glasT !== maal) {
            this.glasT = maal > this.glasT ? Math.min(maal, this.glasT + dt * 2.2) : Math.max(maal, this.glasT - dt * 2.2);
            if (this.lay) this.ankre();
        }

        this.svaeverUr -= dt;
        if (this.svaeverUr <= 0) {
            this.svaeverUr = 1;
            var a = m.analyse();
            var stor = a.lag.some(function (l) { return l.svaever && l.n >= 24; });
            if (stor) this.udsend("svaever");
        }
        this.visMaengde();
    };

    /* mL med én decimal under 10 mL, ellers hele */
    function ml(kugler) {
        var v = kugler / D.PORTION * D.PORTION_ML;
        return v < 9.95 ? v.toFixed(1).replace(".", ",") : String(Math.round(v));
    }

    /* Linjerne i panelet: hvor meget der er af hvert stof i bassinet og i
       destillatet */
    P.visMaengde = function () {
        var o = this.m.opgoer(), dele = [];
        D.STOFFER.forEach(function (s, i) {
            if (o.alt[i] > 0) dele.push(s.navn + " <b>" + Math.round(o.alt[i] / D.PORTION * D.PORTION_ML) + " mL</b>");
        });
        var tekst = dele.length ? "I bassinet: " + dele.join(" · ") : "Bassinet er tomt.";
        if (tekst !== this.maengdeTekst) {
            this.maengdeTekst = tekst;
            var e = NK.el("maengde");
            if (e) e.innerHTML = tekst;
        }
        var f = this.forlag.opgoer(), fd = [];
        D.STOFFER.forEach(function (s, i) {
            if (f.alt[i] > 0) fd.push(s.navn + " <b>" + ml(f.alt[i]) + " mL</b>");
        });
        var dt = fd.length ? "I destillatet: " + fd.join(" · ") : "";
        if (dt !== this.destillatTekst) {
            this.destillatTekst = dt;
            var ed = NK.el("destillat");
            if (ed) { ed.innerHTML = dt; ed.hidden = !dt; }
        }
    };

    /* ----- Tegning ------------------------------------------------------------ */
    P.tegn = function () {
        var L = this.L, ctx = L.ctx, l = this.lay, m = this.m;
        if (!l) return;
        L.ryd();
        var dpr = L._dpr || 1, u = l.u, r = u * 0.47;
        var T = m.T, t = this.tid, i, k, p;
        var amp = (0.025 + 0.06 * (T - 20) / 100) * u;
        var visF = this.visForlag() || this.glasT > 0;
        var TA = { ox: l.x0 + this.ryk, oy: l.y0, k: l.k };
        var TF = { ox: l.x0, oy: l.y0, k: l.k };

        /* Skygge og varme under bassinet */
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(l.ind.x + l.ind.b / 2 + this.ryk, l.y0 + (SPRITE_H + SPRITE_TOP) * l.k + 4, l.ind.b * 0.52, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (visF) A.tegnForlagSkygge(ctx, TF);

        /* Indersiden: vaesken og dampen */
        ctx.save();
        ctx.beginPath();
        ctx.rect(l.ind.x + this.ryk, l.ind.y, l.ind.b, l.ind.h);
        ctx.clip();

        if (T > 22) {
            var varme = NK.klamp((T - 20) / 100, 0, 1);
            var gv = ctx.createLinearGradient(0, l.ind.y + l.ind.h, 0, l.ind.y + l.ind.h - 5 * u);
            gv.addColorStop(0, "rgba(255, 90, 50, " + (0.28 * varme) + ")");
            gv.addColorStop(1, "rgba(255, 90, 50, 0)");
            ctx.fillStyle = gv;
            ctx.fillRect(l.ind.x + this.ryk, l.ind.y + l.ind.h - 5 * u, l.ind.b, 5 * u);
        }

        var kugler = m.kugler, n = kugler.length;
        this.tegnVaeske(ctx, kugler, this.tilPx, t, amp, r, dpr);
        for (i = 0; i < n; i++) {
            k = kugler[i];
            if (k.tilst === TILST.BOBLE) {
                p = this.tilPx(k.x, k.y);
                Tg.boble(ctx, k.art, p.x, p.y, r, dpr);
            } else if (k.tilst === TILST.DAMP || k.tilst === TILST.DRAABE) {
                this.tegnFri(ctx, k, this.tilPx(k.x, k.y), r, dpr);
            } else if (k.tilst === TILST.AFLOEB) {
                p = this.tilPx(k.x, k.y);
                ctx.globalAlpha = NK.klamp(k.alfa, 0, 1);
                Tg.kugle(ctx, k.art, p.x, p.y, r, dpr);
                ctx.globalAlpha = 1;
            }
        }
        ctx.restore();

        /* Straalen og det, der loeber over, er uden for glasset */
        for (i = 0; i < n; i++) {
            k = kugler[i];
            if (k.tilst !== TILST.FALD && k.tilst !== TILST.SPILD) continue;
            p = this.tilPx(k.x, k.y);
            ctx.globalAlpha = NK.klamp(k.alfa, 0, 1);
            Tg.kugle(ctx, k.art, p.x, p.y, r, dpr);
            ctx.globalAlpha = 1;
        }

        NK.Sprites.tegn(ctx, "bassin", l.x0 + this.ryk, l.y0 + SPRITE_TOP * l.k, SPRITE_B * l.k, SPRITE_H * l.k);
        A.tegnHane(ctx, TA, m.haelder());

        /* Roeret over halsen: dampen og draaberne bag glasset */
        for (i = 0; i < n; i++) {
            k = kugler[i];
            if (k.tilst === TILST.ROER) this.tegnFri(ctx, k, this.tilPx(k.x, k.y), r, dpr);
        }
        A.tegnSprite(ctx, TA, this.koelerNavn);
        A.tegnVand(ctx, TA, this.koelerNavn, t);
        var lbl = { font: "600 13px 'Segoe UI', sans-serif", farve: "rgba(160, 220, 250, 0.85)" };
        if (this.koelerNavn === "destillation") {
            var kp = A.dsKappe();
            NK.tekst(ctx, "køler", TA.ox + (kp.a.x + kp.b.x) / 2 * l.k - 18, TA.oy + ((kp.a.y + kp.b.y) / 2 - 48) * l.k,
                { font: lbl.font, farve: lbl.farve, justering: "center" });
        } else {
            var TS = A.TILBAGESVALER;
            NK.tekst(ctx, "tilbagesvaler", TA.ox + (A.HALS.x - TS.kappe.halv - 10) * l.k, TA.oy + -84 * l.k,
                { font: lbl.font, farve: lbl.farve, justering: "right" });
        }

        if (visF) this.tegnForlag(ctx, TF, r, dpr);
        this.tegnGlas(ctx);
        this.tegnNavn(ctx, r);
    };

    /* Kuglerne i en vaeske vibrerer lidt paa deres plads */
    P.tegnVaeske = function (ctx, kugler, tilPx, t, amp, r, dpr) {
        for (var i = 0; i < kugler.length; i++) {
            var k = kugler[i];
            if (k.tilst !== TILST.VAESKE) continue;
            var w1 = 1.8 + (k.f1 % 1.2), w2 = 1.6 + (k.f2 % 1.1);
            var p = tilPx.call(this, k.x + Math.sin(t * w1 + k.f1) * amp / this.lay.u, k.y + Math.sin(t * w2 + k.f2) * amp / this.lay.u);
            Tg.kugle(ctx, k.art, p.x, p.y, r, dpr);
        }
    };

    /* Damp er lidt mindre og gennemsigtig; en draabe er en hel kugle */
    P.tegnFri = function (ctx, k, p, r, dpr) {
        var damp = k.tilst === TILST.DAMP || (k.tilst === TILST.ROER && k.damp);
        ctx.globalAlpha = damp ? 0.6 : 0.95;
        Tg.kugle(ctx, k.art, p.x, p.y, damp ? r * 0.9 : r, dpr);
        ctx.globalAlpha = 1;
    };

    /* Forlaget: destillatet som kugler bag glasset */
    P.tegnForlag = function (ctx, TF, r, dpr) {
        var f = this.forlag, fl = this.lay.forlag, i, k, p;
        var alfa = NK.klamp(this.visForlag() ? 1 : this.glasT, 0, 1);
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.save();
        ctx.beginPath();
        ctx.rect(fl.x, fl.y, fl.b, fl.h);
        ctx.clip();
        this.tegnVaeske(ctx, f.kugler, this.tilPxF, this.tid, 0.025 * this.lay.u, r, dpr);
        for (i = 0; i < f.kugler.length; i++) {
            k = f.kugler[i];
            if (k.tilst === TILST.DAMP) this.tegnFri(ctx, k, this.tilPxF(k.x, k.y), r, dpr);
        }
        ctx.restore();
        /* Draaberne fra spidsen og det, der loeber over */
        for (i = 0; i < f.kugler.length; i++) {
            k = f.kugler[i];
            if (k.tilst === TILST.DRAABE) this.tegnFri(ctx, k, this.tilPxF(k.x, k.y), r, dpr);
            else if (k.tilst === TILST.SPILD || k.tilst === TILST.AFLOEB) {
                p = this.tilPxF(k.x, k.y);
                ctx.globalAlpha = alfa * NK.klamp(k.alfa, 0, 1);
                Tg.kugle(ctx, k.art, p.x, p.y, r, dpr);
                ctx.globalAlpha = alfa;
            }
        }
        A.tegnSprite(ctx, TF, "forlag");
        NK.tekst(ctx, "destillat", fl.x + fl.b, fl.y - 20,
            { font: "600 13px 'Segoe UI', sans-serif", justering: "right", farve: "rgba(200, 206, 214, 0.85)" });
        ctx.restore();
    };

    /* Det lille glas: det samme bassin, set med det blotte oeje */
    P.tegnGlas = function (ctx) {
        var l = this.lay, g = this.glas(), m = this.m;
        var gr = this.ryk * A.GLAS.skala;

        /* Forstoerrelsen: fra glasset til bassinet, kun naar det staar nede */
        var la = 1 - NK.blod(this.glasT);
        if (la > 0.01) {
            ctx.save();
            ctx.strokeStyle = "rgba(200, 210, 225, " + (0.22 * la) + ")";
            ctx.setLineDash([4, 5]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(g.ind.x + gr, g.ind.y);
            ctx.lineTo(l.ind.x + l.ind.b + this.ryk, l.ind.y);
            ctx.moveTo(g.ind.x + gr, g.ind.y + g.ind.hoejde);
            ctx.lineTo(l.ind.x + l.ind.b + this.ryk, l.ind.y + l.ind.h);
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = "rgba(10, 10, 14, 0.9)";
        ctx.fillRect(g.ind.x + gr, g.ind.y, g.ind.bredde, g.ind.hoejde);
        Tg.makro(ctx, m, { x: g.ind.x + gr, y: g.ind.y, bredde: g.ind.bredde, hoejde: g.ind.hoejde });
        /* Boblerne, naar det koger */
        var gs = g.ind.bredde / m.bredde;
        ctx.strokeStyle = "rgba(240, 248, 255, 0.85)";
        ctx.lineWidth = 1;
        for (var i = 0; i < m.kugler.length; i++) {
            var kb = m.kugler[i];
            if (kb.tilst !== TILST.BOBLE) continue;
            ctx.beginPath();
            ctx.arc(g.ind.x + gr + kb.x * gs, g.ind.y + g.ind.hoejde - kb.y * gs, Math.max(1.2, gs * 0.6), 0, Math.PI * 2);
            ctx.stroke();
        }
        /* Straalen gennem tragten, naar der haeldes i */
        if (m.haelder()) {
            var art = m.haeld[0].art, tx = g.x + gr + A.TRAGT.x * g.k;
            ctx.strokeStyle = art === D.nr("olie") ? "rgba(246, 208, 96, 0.8)" : "rgba(205, 228, 250, 0.7)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tx, g.laag + (A.TRAGT.top - 26) * g.k);
            ctx.lineTo(tx, g.ind.y + g.ind.hoejde - m.overflade() / m.hoejde * g.ind.hoejde);
            ctx.stroke();
        }
        ctx.restore();

        NK.Sprites.tegn(ctx, "bassin", g.x + gr, g.y, SPRITE_B * g.k, SPRITE_H * g.k);
        NK.tekst(ctx, "Sådan ser det ud", g.x + SPRITE_B * g.k / 2, g.y - 8,
            { font: "600 13px 'Segoe UI', sans-serif", justering: "center", farve: "#c8ced6" });
    };

    /* Navnet paa den kugle, musen staar over */
    P.tegnNavn = function (ctx, r) {
        if (!this.mus || this.greb) return;
        var fund = this.kugleVed(this.mus.x, this.mus.y, r * 1.1);
        if (!fund) return;
        var k = fund.k, s = D.STOFFER[k.art];
        var tekst = s.Navn + ", " + s.formel + ", " + (s.polaer ? "polær" : "upolær");
        if (k.tilst === TILST.DAMP || k.tilst === TILST.BOBLE || (k.tilst === TILST.ROER && k.damp)) tekst += ", damp";
        var p = fund.p;
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        Tg.skilt(ctx, tekst, p.x, p.y - r - 6, { kant: s.farve, klamp: [4, this.L.b - 4] });
    };

    /* Den kugle i bassinet, roeret eller forlaget, der er naermest musen */
    P.kugleVed = function (px, py, maks) {
        var bedst = null, afst = maks * maks, mig = this;
        function led(kugler, tilPx) {
            for (var i = 0; i < kugler.length; i++) {
                var k = kugler[i];
                if (k.tilst === TILST.SPILD || k.tilst === TILST.AFLOEB || k.tilst === TILST.FALD || k.tilst === TILST.UD) continue;
                var p = tilPx.call(mig, k.x, k.y), dx = p.x - px, dy = p.y - py, d = dx * dx + dy * dy;
                if (d < afst) { afst = d; bedst = { k: k, p: p }; }
            }
        }
        led(this.m.kugler, this.tilPx);
        if (this.visForlag()) led(this.forlag.kugler, this.tilPxF);
        return bedst;
    };

    /* ----- Musen ----------------------------------------------------------- */
    P.iBassin = function (px, py) {
        var l = this.lay;
        return !!l && px >= l.x0 + this.ryk && px <= l.x0 + this.ryk + SPRITE_B * l.k &&
            py >= l.y0 && py <= l.y0 + (SPRITE_H + SPRITE_TOP) * l.k;
    };

    /* Kemichael kan saette en funktion her, der fanger klik paa ham foerst */
    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        function punkt(e) {
            var r = c.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        c.addEventListener("pointerdown", function (e) {
            var p = punkt(e);
            if (mig.klikFoerst && mig.klikFoerst(p.x, p.y)) return;
            if (!mig.iBassin(p.x, p.y)) return;
            mig.greb = { x0: p.x, ryk0: mig.ryk, sidst: p.x, t: performance.now() };
            try { c.setPointerCapture(e.pointerId); } catch (fejl) { /* ingen fangst */ }
            c.style.cursor = "grabbing";
        });
        c.addEventListener("pointermove", function (e) {
            var p = punkt(e);
            mig.mus = p;
            if (mig.greb) {
                var g = mig.greb, nu = performance.now();
                mig.ryk = NK.klamp(g.ryk0 + p.x - g.x0, -40, 40);
                var fart = Math.abs(p.x - g.sidst) / Math.max(8, nu - g.t) * 1000;
                g.sidst = p.x;
                g.t = nu;
                /* Hurtige ryk ryster vaesken; langsomme flytter bare glasset */
                if (fart > 500) mig.m.ryst(0.12, NK.klamp((fart - 500) / 1500, 0.2, 1));
                return;
            }
            var over = mig.iBassin(p.x, p.y) || (mig.overLaerer && mig.overLaerer(p.x, p.y));
            c.style.cursor = over ? (mig.iBassin(p.x, p.y) ? "grab" : "pointer") : "default";
        });
        function slip() {
            if (!mig.greb) return;
            mig.greb = null;
            c.style.cursor = "grab";
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
        c.addEventListener("pointerleave", function () { mig.mus = null; });
    };

    NK.Bassin = Bassin;
}());
