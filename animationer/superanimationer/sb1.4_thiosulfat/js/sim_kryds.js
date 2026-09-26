/* =====================================================================
   sim_kryds.js - fane 1: Krydset

   Et baegerglas med thiosulfat og vand staar paa et papir med et kryds.
   Eleven haelder syren i (traek maaleglasset hen over glasset, klik paa
   det eller tryk Tilsaet syren). Uret starter, idet syren rammer, og
   eleven stopper det selv, naar krydset ikke kan ses oppefra.

   Bagefter vises kurven for det dannede svovl med en stiplet streg,
   hvor krydset forsvinder. Alle gode maalinger ender paa stregen: der
   er dannet den samme maengde svovl, saa 1/Δt er et maal for
   hastigheden. Et tryk for tidligt ender under stregen, et for sent
   over den.

   Tilstande:  klar -> haelder -> koerer -> stoppet -> (Forfra) klar
   Uret (this.t) staar stille, naar det er stoppet, men reaktionen
   (this.rt) fortsaetter, saa glasset bliver ved med at blive uklart.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var Tg = NK.Tegn;
    var SKRIFT = Tg.SKRIFT;

    /* Haeldningen i sekunder: hen og vip, haeld, tilbage. Uret starter
       efter hen og vip, idet syren rammer. */
    var HEN = 0.55, HAELD = 0.7, TILBAGE = 0.55;
    var VIP = -2.25;                 /* maaleglassets vinkel, naar det haelder */
    var TIDLIG = 0.12;               /* kontrasten, over hvilken krydset stadig ses */
    var SEN = 1.3;                   /* gange den rigtige tid */
    var AUTO = 2.5;                  /* uret stopper selv efter saa mange gange */

    function SimKryds() {
        this.L = new NK.Laerred(NK.el("kryds-laerred"));
        this.tid = 0;
        this.valgt = 0;
        this.maalinger = [];
        this.naesteNr = 1;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.tilbage = null;
        this.klar();
        this.kort = new NK.Opgavekort("kryds", D.KRYDS_OPGAVER, this);
        this.bind();
        if (this.laererStart) this.laererStart();
        this.bygTilbud();
        this.visPanel();
    }

    var P = SimKryds.prototype;

    /* ----- Tilstande --------------------------------------------------- */
    P.blanding = function () {
        var ml = D.KRYDS_BLANDINGER[this.valgt];
        return M.blanding(ml, D.SYRE_ML, D.GLAS_ML - ml);
    };

    P.klar = function () {
        this.tilstand = "klar";
        this.t = 0;
        this.rt = 0;
        this.haeldT = -1;
        this.syreIGlas = 0;
        this.forl = null;
        this.fod = null;               /* null: maaleglasset staar paa sin plads */
        this.hvirvel = 0;
        this.hvirvlet = false;
        this.sidste = null;
        this.saetStatus("Træk måleglasset med syre hen over bægerglasset, eller tryk Tilsæt syren.", "");
        this.visPanel();
    };

    P.nulstil = function () {
        if (this.tilstand === "klar" && !this.maalinger.length) return;
        if (this.tilstand === "klar" || this.tilstand === "stoppet") {
            if (this.tilstand === "klar") { this.maalinger = []; this.naesteNr = 1; }
            this.klar();
        }
    };

    /* Syren haeldes i. fra: hvor maaleglassets fod staar lige nu. */
    P.startHaeld = function (fra) {
        if (this.tilstand !== "klar") return false;
        this.tilstand = "haelder";
        this.haeldT = 0;
        this.haeldFra = fra || this.hvilested();
        this.fod = null;
        this.traek = null;
        this.tilbage = null;
        this.forl = M.forloeb(this.blanding(), M.T_REF);
        this.saetStatus("Syren hældes i. Uret starter, når den rammer.", "");
        if (this.afvisTilbud) this.afvisTilbud();
        this.visPanel();
        return true;
    };

    P.stop = function (auto) {
        if (this.tilstand !== "koerer") return null;
        this.tilstand = "stoppet";
        var f = this.forl, sand = f.dtKryds, stopT = this.t;
        var kontrast = f.kontrast(stopT);
        var vurdering = auto ? "auto" : (kontrast > TIDLIG ? "tidlig" : (stopT > SEN * sand ? "sen" : "god"));
        var m = {
            nr: this.naesteNr++,
            ml: D.KRYDS_BLANDINGER[this.valgt],
            c: f.bl.c,
            dt: stopT, sand: sand, vurdering: vurdering, forl: f
        };
        this.maalinger.push(m);
        while (this.maalinger.length > D.MAKS_KRYDS) this.maalinger.shift();
        this.sidste = m;

        var tekst, art = "";
        if (vurdering === "tidlig") {
            tekst = "For tidligt: krydset kunne stadig ses. Punktet ligger under stregen.";
            art = "skidt";
        } else if (vurdering === "sen") {
            tekst = "For sent: krydset var væk ved ca. " + Math.round(sand) + " s. Punktet ligger over stregen.";
            art = "skidt";
        } else if (vurdering === "auto") {
            tekst = "Uret er stoppet. Krydset var væk ved ca. " + Math.round(sand) + " s. Stop det, så snart krydset er væk.";
            art = "skidt";
        } else {
            var andre = this.maalinger.filter(function (x) { return x.vurdering === "god" && x.ml !== m.ml; });
            tekst = "Godt målt: Δt = " + NK.tal(stopT, 1) + " s. " + (andre.length
                ? "Kurverne ender samme sted: der er dannet lige meget svovl."
                : "Prøv en anden blanding, og sammenlign kurverne.");
            art = "god";
        }
        this.saetStatus(tekst + " Tryk Forfra for en ny måling.", art);
        this.visPanel();
        return m;
    };

    P.forfra = function () {
        if (this.tilstand === "stoppet") this.klar();
    };

    /* Den store knap: Tilsaet syren -> Stop uret -> Forfra */
    P.hovedknap = function () {
        if (this.tilstand === "klar") this.startHaeld();
        else if (this.tilstand === "koerer") this.stop(false);
        else if (this.tilstand === "stoppet") this.forfra();
    };

    P.vaelg = function (i) {
        if (this.tilstand !== "klar" && this.tilstand !== "stoppet") return;
        this.valgt = i;
        this.klar();
    };

    /* ----- Opgavekortet ---------------------------------------------- */
    P.opsaetOpgave = function () {};
    P.slutOpgave = function () {};

    /* ----- Tiden ------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.haeldT >= 0) {
            this.haeldT += dt;
            var start = HEN;
            if (this.tilstand === "haelder" && this.haeldT >= start) {
                this.tilstand = "koerer";
                this.t = this.haeldT - start;
                this.rt = this.t;
                this.saetStatus("Kig på krydset oppefra. Stop uret, når du ikke kan se det.", "");
                this.visPanel();
            } else if (this.tilstand !== "haelder") {
                this.t += this.tilstand === "koerer" ? dt : 0;
                this.rt += dt;
            }
            this.syreIGlas = D.SYRE_ML * NK.klamp((this.haeldT - start) / HAELD, 0, 1);
            /* Blandingen hvirvler lidt, naar syren er i */
            if (this.haeldT >= start + HAELD && !this.hvirvlet) { this.hvirvel = 1; this.hvirvlet = true; }
            if (this.haeldT >= HEN + HAELD + TILBAGE) this.haeldT = -1;
        } else if (this.tilstand === "koerer") {
            this.t += dt;
            this.rt += dt;
        } else if (this.tilstand === "stoppet") {
            this.rt += dt;
        }
        if (this.hvirvel > 0) this.hvirvel = Math.max(0, this.hvirvel - dt / 2.4);
        if (this.tilstand === "koerer" && this.forl && this.t > Math.min(M.MAKS_TID, AUTO * this.forl.dtKryds)) this.stop(true);
        if (this.tilbage) {
            this.tilbage.t += dt / 0.35;
            if (this.tilbage.t >= 1) { this.tilbage = null; this.fod = null; }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.visUr();
    };

    /* Selvtesten og konsollen: koer tiden frem i smaa skridt */
    P.koer = function (sek) {
        var n = Math.max(1, Math.ceil(sek / 0.02));
        for (var i = 0; i < n; i++) this.opdater(sek / n);
    };

    P.kontrastNu = function () {
        if (!this.forl || this.tilstand === "klar" || this.tilstand === "haelder") return 1;
        return this.forl.kontrast(this.rt);
    };

    /* ----- Maaleglasset -------------------------------------------------- */
    P.hvilested = function () {
        return this.lay ? { x: this.lay.mg.x, y: this.lay.mg.y } : { x: 0, y: 0 };
    };

    /* Hvor foden skal staa, naar tuden er over baegerglasset */
    P.haeldested = function () {
        var lay = this.lay, k = lay.mg.h / 260;
        var tx = lay.bg.indX1 - lay.bg.b * 0.12, ty = lay.bg.y - lay.bg.b * 0.12;
        /* Tuden sidder (15, -242)·k fra foden; drejet med VIP */
        var c = Math.cos(VIP), s = Math.sin(VIP), lx = 15 * k, ly = -242 * k;
        return { x: tx - (lx * c - ly * s), y: ty - (lx * s + ly * c) };
    };

    P.mgPositur = function () {
        var hvile = this.hvilested();
        if (this.haeldT < 0) {
            if (this.tilbage) {
                var b = NK.blod(this.tilbage.t);
                return { x: NK.lerp(this.tilbage.fra.x, hvile.x, b), y: NK.lerp(this.tilbage.fra.y, hvile.y, b), v: 0 };
            }
            var f = this.fod || hvile;
            return { x: f.x, y: f.y, v: 0 };
        }
        var maal = this.haeldested(), t = this.haeldT;
        if (t < HEN) {
            var a = NK.blod(t / HEN);
            return { x: NK.lerp(this.haeldFra.x, maal.x, a), y: NK.lerp(this.haeldFra.y, maal.y, a), v: VIP * a };
        }
        if (t < HEN + HAELD) return { x: maal.x, y: maal.y, v: VIP };
        var r = NK.blod((t - HEN - HAELD) / TILBAGE);
        return { x: NK.lerp(maal.x, hvile.x, r), y: NK.lerp(maal.y, hvile.y, r), v: VIP * (1 - r) };
    };

    P.mgRekt = function () {
        var p = this.mgPositur(), k = this.lay.mg.h / 260;
        return { x: p.x - 30 * k, y: p.y - 249 * k, b: 60 * k, h: 250 * k };
    };

    /* ----- Mus og tryk ----------------------------------------------------- */
    P.ramt = function (p) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.tilstand === "klar" && Tg.inde(p, this.mgRekt(), 6)) return "maaleglas";
        var su = lay.ur;
        if (Math.hypot(p.x - su.x, p.y - su.y) < su.r * 1.15 || Tg.inde(p, { x: su.x - su.r * 0.25, y: su.y - su.r * 1.35, b: su.r * 0.5, h: su.r * 0.4 })) return "stopur";
        if (Math.hypot(p.x - lay.op.x, p.y - lay.op.y) < lay.op.r) return "oppefra";
        if (Tg.inde(p, { x: lay.bg.x, y: lay.bg.y, b: lay.bg.b, h: lay.bg.h })) return "baeger";
        if (Math.hypot(p.x - lay.oeje.x, p.y - lay.oeje.y) < lay.oeje.r * 1.4) return "oeje";
        if (Tg.inde(p, this.mgRekt(), 6)) return "maaleglas";
        return null;
    };

    P.tryk = function (p, e) {
        if (this.laererIntroKlik && this.laererIntroKlik(p.x, p.y)) return;
        if (this.laererKlik && this.laererKlik(p.x, p.y)) return;
        var hvad = this.ramt(p), tilst = this.tilstand;
        if (hvad === "maaleglas" && tilst === "klar") {
            var f = this.mgPositur();
            this.traek = { dx: p.x - f.x, dy: p.y - f.y, x0: p.x, y0: p.y, flyttet: false };
            try { this.L.canvas.setPointerCapture(e.pointerId); } catch (x) { /* ingen fangst */ }
            return;
        }
        if (hvad === "baeger" && tilst === "klar") { this.startHaeld(); return; }
        if (hvad === "stopur") {
            if (tilst === "klar") this.saetStatus("Uret starter selv, når syren hældes i.", "gul");
            else if (tilst === "koerer") this.stop(false);
            else if (tilst === "stoppet") this.forfra();
            return;
        }
        if (hvad === "oppefra" || hvad === "oeje") {
            if (tilst === "klar") this.saetStatus("Oppefra ses krydset gennem den klare væske. Tilsæt syren.", "gul");
            else if (tilst === "koerer") this.saetStatus("Kig godt efter. Stop uret, når krydset er helt væk.", "gul");
            else this.blinkStatus();
            return;
        }
        if (hvad === "maaleglas" && tilst === "stoppet") { this.saetStatus("Måleglasset er tomt. Tryk Forfra for en ny måling.", "gul"); return; }
        this.blinkStatus();
    };

    P.flyt = function (p) {
        if (this.traek) {
            var t = this.traek;
            if (Math.hypot(p.x - t.x0, p.y - t.y0) > 6) t.flyttet = true;
            if (t.flyttet) this.fod = { x: p.x - t.dx, y: p.y - t.dy };
            return;
        }
        var hvad = this.ramt(p), tilst = this.tilstand;
        var aktiv = hvad === "maaleglas" && tilst === "klar" || hvad === "baeger" && tilst === "klar" ||
            hvad === "stopur" && tilst !== "haelder";
        this.over = aktiv ? hvad : null;
        var laerer = this.laererUnder && this.laererUnder(p.x, p.y);
        this.L.canvas.style.cursor = this.traek ? "grabbing" : (laerer || aktiv ? (hvad === "maaleglas" ? "grab" : "pointer") : "default");
    };

    P.slip = function (p) {
        var t = this.traek;
        if (!t) return;
        this.traek = null;
        if (!t.flyttet) { this.startHaeld(); return; }
        /* Over glasset? Maaleglassets rekt eller musen skal ramme det */
        var bg = this.lay.bg, mg = this.mgRekt();
        var over = Tg.inde(p, { x: bg.x, y: bg.y - bg.h * 0.6, b: bg.b, h: bg.h * 1.6 }) ||
            (mg.x < bg.x + bg.b && mg.x + mg.b > bg.x && mg.y + mg.h > bg.y - bg.h * 0.3 && mg.y < bg.y + bg.h * 0.6);
        if (over) {
            this.startHaeld(this.fod);
        } else {
            this.tilbage = { fra: this.fod || this.hvilested(), t: 0 };
            this.saetStatus("Slip måleglasset over bægerglasset.", "gul");
        }
    };

    P.bind = function () {
        var mig = this, cv = this.L.canvas;
        cv.addEventListener("pointerdown", function (e) { mig.tryk(mig.L.punkt(e), e); });
        cv.addEventListener("pointermove", function (e) { mig.flyt(mig.L.punkt(e)); });
        cv.addEventListener("pointerup", function (e) { mig.slip(mig.L.punkt(e)); });
        cv.addEventListener("pointercancel", function () { mig.traek = null; mig.fod = null; });
        cv.addEventListener("pointerleave", function () { if (!mig.traek) mig.over = null; });
        NK.el("kryds-knap").addEventListener("click", function () { mig.hovedknap(); });
        Array.prototype.forEach.call(document.querySelectorAll("#kryds-segment button"), function (k, i) {
            k.addEventListener("click", function () { mig.vaelg(i); });
        });
        NK.el("kryds-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    /* ----- Panel og status --------------------------------------------------- */
    P.saetStatus = function (tekst, art) {
        NK.saetTekst("kryds-status", tekst);
        NK.saetKlasse("kryds-status", "status" + (art ? " " + art : ""));
    };

    P.blinkStatus = function () {
        var e = NK.el("kryds-status");
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    P.visUr = function () {
        NK.saetTekst("kryds-tid", NK.tal(this.t, 1) + " s");
    };

    P.visPanel = function () {
        var mig = this, t = this.tilstand;
        var ml = D.KRYDS_BLANDINGER[this.valgt];
        Array.prototype.forEach.call(document.querySelectorAll("#kryds-segment button"), function (k, i) {
            k.classList.toggle("aktiv", i === mig.valgt);
            k.disabled = t === "haelder" || t === "koerer";
        });
        NK.saetTekst("kryds-note", ml + " mL " + M.THIO_TEKST + " Na₂S₂O₃ og " + (D.GLAS_ML - ml) + " mL vand i glasset. " +
            D.SYRE_ML + " mL 1,0 M HCl i måleglasset.");
        var knap = { klar: ["Tilsæt syren", "▶", "knap stor groen"], haelder: ["Stop uret", "■", "knap stor roed"],
            koerer: ["Stop uret", "■", "knap stor roed"], stoppet: ["Forfra", "↺", "knap stor blaa"] }[t];
        NK.saetHTML("kryds-knap", "<span>" + knap[0] + "</span><span class=\"tegn\">" + knap[1] + "</span>");
        NK.saetKlasse("kryds-knap", knap[2]);

        var h = "<thead><tr><th>Nr.</th><th>Na₂S₂O₃</th><th>Δt / s</th><th>1/Δt / s⁻¹</th></tr></thead><tbody>";
        if (!this.maalinger.length) h += '<tr class="tom"><td colspan="4">Ingen målinger endnu.</td></tr>';
        this.maalinger.forEach(function (m) {
            h += '<tr><td><span class="nrchip" style="background-color:' + Tg.farve(m.nr) + '">' + m.nr + "</span></td>" +
                "<td>" + m.ml + " mL</td><td><b>" + NK.tal(m.dt, 1) + "</b></td><td>" + NK.bet(1 / m.dt, 3) + "</td></tr>";
        });
        NK.saetHTML("kryds-tabel", h + "</tbody>");
        this.visUr();
    };

    /* ----- Tegning ------------------------------------------------------------ */
    P.tilpas = function () {
        var ny = this.L.tilpas();
        if (!ny && this.lay) return;
        var W = this.L.b, H = this.L.h;
        var bordY = Math.round(H * 0.7);
        var b = NK.klamp(Math.min(W * 0.26, H * 0.3), 130, 300);
        var cx = W * 0.27;
        /* Glasset staar paa papiret, og papiret ligger helt paa bordet */
        var staa = bordY + b * 0.17 + 10;
        var urR = NK.klamp(Math.min(W * 0.06, H * 0.08), 38, 66);
        var opR = NK.klamp(Math.min(W * 0.15, H * 0.2), 90, 180);
        var opX = W - opR - 44, opY = 34 + opR;
        var lay = {
            W: W, H: H, bordY: bordY,
            bgX: cx, bgY: staa, bgB: b,
            ur: { x: Math.max(urR + 24, W * 0.08), y: urR * 1.45 + 18, r: urR },
            op: { x: opX, y: opY, r: opR },
            graf: { x0: W * 0.58 + 40, x1: W - 36, y0: opY + opR + 70, y1: H - 106 }
        };
        /* Glassets maal til klik og haeldning (samme regning som Tegn.baeger) */
        var k = b / 200;
        lay.bg = { x: cx - b / 2, y: lay.bgY - 211 * k, b: b, h: 220 * k, indX1: cx - b / 2 + 179 * k };
        lay.oeje = { x: cx, y: lay.bg.y - Math.max(46, H * 0.08), r: Math.max(18, b * 0.1) };
        var mgH = b * 1.0;
        lay.mg = { x: cx + b / 2 + mgH * 0.23 + 34, y: staa - b * 0.04, h: mgH };
        if (lay.graf.y1 - lay.graf.y0 < 120) lay.graf.y0 = lay.graf.y1 - 120;
        this.lay = lay;
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        L.ryd();
        if (!lay) return;
        var tilst = this.tilstand;
        var kontrast = this.kontrastNu();

        Tg.bord(ctx, lay.W, lay.H, lay.bordY);
        Tg.papir(ctx, lay.bgX, lay.bgY, lay.bgB * 1.7);
        Tg.baeger(ctx, lay.bgX, lay.bgY, lay.bgB, {
            ml: D.GLAS_ML + this.syreIGlas,
            kontrast: kontrast < 1 ? Math.pow(kontrast, 1.3) : 1
        });
        if (this.over === "baeger") {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, 0.7)";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, lay.bg.x - 4, lay.bg.y - 4, lay.bg.b + 8, lay.bg.h + 8, 10);
            ctx.stroke();
            ctx.restore();
        }

        /* Oejet og synslinjen ned gennem vaesken til krydset */
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lay.oeje.x, lay.oeje.y + lay.oeje.r * 0.7);
        ctx.lineTo(lay.bgX, lay.bgY - 2);
        ctx.stroke();
        ctx.restore();
        Tg.oeje(ctx, lay.oeje.x, lay.oeje.y, lay.oeje.r);

        this.tegnMaaleglas(ctx);
        this.tegnUr(ctx);

        /* Krydset set oppefra */
        NK.tekst(ctx, "SET OPPEFRA", lay.op.x, lay.op.y - lay.op.r - 12,
            { font: "700 13px " + SKRIFT, justering: "center", farve: "#9fa6af" });
        Tg.oppefra(ctx, lay.op.x, lay.op.y, lay.op.r, {
            vaeske: true, kontrast: kontrast, hvirvel: this.hvirvel, tid: this.tid,
            lys: this.over === "oppefra"
        });

        this.tegnGraf(ctx);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    P.tegnMaaleglas = function (ctx) {
        var lay = this.lay, p = this.mgPositur();
        var ml = D.SYRE_ML - this.syreIGlas;
        Tg.maaleglas(ctx, p, lay.mg.h, ml, { etiket: true, lys: this.over === "maaleglas" || !!this.traek });
        /* Straalen fra tuden ned i glasset */
        if (this.haeldT >= HEN && this.haeldT < HEN + HAELD) {
            var tud = Tg.maaleglasTud(p, lay.mg.h);
            var bund = lay.bg.y + (209 - 1.6 * (D.GLAS_ML + this.syreIGlas)) * lay.bgB / 200;
            var a = Math.min(1, (this.haeldT - HEN) / 0.1, (HEN + HAELD - this.haeldT) / 0.12);
            ctx.save();
            ctx.strokeStyle = "rgba(190, 225, 245, " + (0.7 * a).toFixed(3) + ")";
            ctx.lineWidth = Math.max(2.5, lay.bgB * 0.018);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tud.x, tud.y);
            ctx.quadraticCurveTo(tud.x - 6, (tud.y + bund) / 2, tud.x - 8, bund);
            ctx.stroke();
            ctx.restore();
        }
        /* En lille pil: det her kan flyttes */
        if (this.tilstand === "klar" && !this.traek && !this.tilbage) {
            var r = this.mgRekt(), y = r.y - 16 + Math.sin(this.tid * 4) * 5, x = r.x + r.b / 2;
            ctx.save();
            ctx.fillStyle = "#f2c53d";
            ctx.beginPath();
            ctx.moveTo(x, y + 12); ctx.lineTo(x - 10, y); ctx.lineTo(x - 3.5, y); ctx.lineTo(x - 3.5, y - 12);
            ctx.lineTo(x + 3.5, y - 12); ctx.lineTo(x + 3.5, y); ctx.lineTo(x + 10, y);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    };

    P.tegnUr = function (ctx) {
        var u = this.lay.ur, tilst = this.tilstand;
        Tg.stopur(ctx, u.x, u.y, u.r, this.t, { lys: this.over === "stopur" });
        var farve = tilst === "koerer" ? "#f2c53d" : (tilst === "stoppet" ? "#ffffff" : "#9fa6af");
        NK.tekst(ctx, NK.tal(this.t, 1) + " s", u.x, u.y + u.r + 34,
            { font: "700 26px " + SKRIFT, justering: "center", farve: farve });
    };

    P.tegnGraf = function (ctx) {
        var lay = this.lay, g = lay.graf;
        if (g.x1 - g.x0 < 120) return;
        var ms = this.maalinger;
        var xMaks = 30, yMaks = 2;
        ms.forEach(function (m) {
            xMaks = Math.max(xMaks, m.dt * 1.15);
            yMaks = Math.max(yMaks, m.forl.svovl(m.dt) * 1000 * 1.1);
        });
        var sx = Tg.skala(xMaks, 5), sy = Tg.skala(yMaks, 4);
        var a = Tg.akser(ctx, g, {
            xMaks: sx.maks, yMaks: sy.maks, xTrin: sx.trin, yTrin: sy.trin, xDec: sx.dec, yDec: Math.max(1, sy.dec),
            xNavn: "t / s", yNavn: "Dannet svovl / mM"
        });
        /* Stregen, hvor krydset er vaek (50 mL i glasset) */
        var ys = a.Y(M.S_KRYDS * 1000);
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.strokeStyle = "rgba(240, 235, 208, 0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(g.x0, ys); ctx.lineTo(g.x1, ys); ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "krydset er væk", g.x0 + 8, ys - 8, { font: "600 13px " + SKRIFT, farve: "#f0ebd0" });

        if (!ms.length) {
            NK.tekst(ctx, "Kurven kommer, når du har stoppet uret", (g.x0 + g.x1) / 2, (g.y0 + ys) / 2 + 6,
                { font: "600 14px " + SKRIFT, justering: "center", farve: "#9fa6af" });
            return;
        }
        ms.forEach(function (m) {
            var farve = Tg.farve(m.nr), n = 60;
            ctx.save();
            ctx.strokeStyle = farve;
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.beginPath();
            for (var i = 0; i <= n; i++) {
                var t = m.dt * i / n, x = a.X(t), y = a.Y(m.forl.svovl(t) * 1000);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            var px = a.X(m.dt), py = a.Y(m.forl.svovl(m.dt) * 1000);
            ctx.fillStyle = farve;
            ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#14141a";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, String(m.nr), px + 9, py - 8, { font: "700 14px " + SKRIFT, farve: farve, kant: true });
        });
    };

    /* Kemichaels praesentation: tilbuddet med Start praesentation / Nej tak */
    NK.Praesentation.kobl(P, { noegle: "nk-sb1.4-intro-kryds", tilbud: "kryds-tilbud", spring: "kryds-spring" });

    NK.SimKryds = SimKryds;
}());
