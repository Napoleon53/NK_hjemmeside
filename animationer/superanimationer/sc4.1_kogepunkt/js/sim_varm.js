/* =====================================================================
   sim_varm.js - fane 1: Varm op

   Elleve glas med en ballon paa staar paa hylden: de ti foerste lige
   alkaner og icosan. Et glas traekkes ned i temperaturkammeret, og
   eleven skruer paa temperaturen ved at traekke i termometeret.
   Zoomvinduet viser molekylerne i glasset. Naar stoffet koger, fylder
   gassen ballonen, og kogepunktet kommer paa kurven. Fortaetter en gas,
   er det ogsaa kogepunktet.

   Runde T9 (22. nov. 2026, REGELSAET): intet panel. Fem opgaver i
   raekken oeverst (D.OPG_VARM, motoren i js/varm_opgaver.js). Kurven
   staar paa et lyst papir til hoejre, hylden og kurven er stiplede
   pladser, til de bruges, og kun det, kortet beder om, kan traekkes.
   Tændstikæsken og pauseknappen kommer frem i den fri leg.

   Paaskeaegget: taendstikaesken paa bordet. En taendstik, der roerer
   en fuld ballon, braender gassen, og Kemichael saetter en ny ballon paa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var S = NK.Sprites;

    var NOEGLE = "nk-sc4.1-varm";
    var FLYV_TID = 0.5;
    var KASSE = { W: 32, H: 31 };
    var KP_FARVE = "#f0685a", SMP_FARVE = "#7fb8ec";
    var RAEKKE = 46;                  /* raekken oeverst; kortet staar under den */

    function SimVarm() {
        this.L = new NK.Laerred(NK.el("varm-laerred"));
        this.KL = new NK.Laerred(NK.el("varm-kurve"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.termo = new NK.Termostat(D.T_VARM, D.STUE);
        this.valgt = D.HYLDE.indexOf(D.stof("pentan"));
        this.proeve = this.lavProeve(this.valgt);
        this.flyv = null;
        this.stik = null;
        this.brand = null;
        this.ballonVaek = false;
        this.braende = 0;
        this.g = { kaffekop: { skjult: false, iHaand: false } };

        var gemt = NK.hent(NOEGLE, {}) || {};
        this.fundet = (gemt.fundet || []).filter(function (id) { return !!D.stof(id); });
        this.gaet = gemt.gaet && D.stof(gemt.gaet.id) ? gemt.gaet : null;
        this.rost = !!gemt.rost;
        this.smp = {};
        this.glimt = {};
        this.sidstFundet = null;

        this.e = { ark: NK.el("varm-kurve-ark"), boble: NK.el("varm-boble"), kort: NK.el("varm-skort") };
        this.koblKurve();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.opgaver = new NK.VarmOpgaver(this, D.OPG_VARM);
        this.opgaver.start();
    }

    var P = SimVarm.prototype;

    P.lavProeve = function (i) {
        var st = D.HYLDE[i];
        return new NK.Proeve({ W: KASSE.W, H: KASSE.H, T: this.termo.T, startT: D.STUE, stoffer: [{ st: st, n: st.antal }] });
    };

    P.stof = function () { return D.HYLDE[this.valgt]; };

    /* ----- Det, opgaverne bruger (D.OPG_VARM) ------------------------------------ */
    P.saetGlas = function (id) {
        var i = D.HYLDE.indexOf(D.stof(id));
        if (i >= 0 && i !== this.valgt) this.skift(i);
    };

    /* Kammeret paa temperaturen T og et nyt glas af samme stof */
    P.saetT = function (T) {
        this.termo.saet(T);
        this.proeve = this.lavProeve(this.valgt);
        this.proeve.pause = !!this.pause;
        this.ballonVaek = false;
        this.brand = null;
        this.stik = null;
    };

    P.varmTil = function (T, fart) { this.termo.roert = true; this.termo.animerTil(T, fart); };

    P.glem = function (id) {
        this.fundet = this.fundet.filter(function (f) { return f !== id; });
        delete this.smp[id];
        if (this.sidstFundet === id) this.sidstFundet = null;
        this.gem();
    };

    P.erGlas = function (id) {
        return this.stof().id === id && (!this.flyv || this.flyv.t >= 1);
    };

    /* Er stoffet i glasset, og koger det (eller er det gas) ved temperaturen? */
    P.koger = function (id) {
        return this.erGlas(id) && this.proeve.T >= D.stof(id).kp - 0.5 && this.fundet.indexOf(id) >= 0;
    };

    P.nytGaet = function (id) {
        this.gaet = { id: id, t: 0, sat: false };
        this.gem();
    };

    /* Alle fem opgaver er loest: Kemichael roser (kun foerste gang) */
    P.alleLoest = function () {
        if (this.rost) return;
        this.rost = true;
        this.gem();
        this.ventRos = 1.0;
    };

    /* Den fri leg begynder (eller alle opgaverne er loest) */
    P.friStart = function () {
        this.termo.roert = true;
    };

    P.fri = function () { return this.opgaver && this.opgaver.erFri(); };
    P.maa = function (hvad) { return !this.opgaver || this.opgaver.tillad(hvad); };
    P.skjult = function (del) { return !!this.opgaver && this.opgaver.skjult(del); };

    /* ----- Layout ------------------------------------------------------------------ */
    /* Hylden og kammeret i en kolonne til venstre, kurven paa et lyst papir
       i en kolonne til hoejre, og kortet mellem dem under raekken. Under
       kortet staar zoomvinduet i midten med termometeret til hoejre.
       Paa en stor skaerm staar det hele samlet i midten (REGELSAET 32). */
    var REOL = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10]];

    /* Kortets faste plads: hoejere, naar kortet er smalt (under 640 px),
       saa svarene fylder flere linjer. Den skifter kun med vinduet. */
    P.kortTop = function () {
        var z = D.ZONE.varm[window.innerHeight <= 720 ? 1 : 0] + (this.kortSmalt ? 26 : 0);
        return RAEKKE + z + 10;
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.91);
        var cw = Math.min(W - 2 * kant, 1640), ox = Math.round((W - cw) / 2);
        var vB = Math.round(NK.klamp(cw * 0.21, Math.min(190, cw * 0.26), 310));
        var vR = Math.round(NK.klamp(cw * 0.19, Math.min(190, cw * 0.24), 320));
        var x0 = ox, x1 = ox + vB, xr1 = ox + cw, xr0 = xr1 - vR;
        lay.x0 = x0; lay.x1 = x1;
        /* En smal scene (fx i menuen paa en baerbar): kortet gaar helt ud
           til hoejre, og kurven staar under kortet i hoejre kolonne */
        var smal = xr0 - x1 < 600;
        lay.smal = smal;

        /* Kortet mellem kolonnerne og med en fast hoejde (REGELSAET 4) */
        var kv = x1 + 12, kh = smal ? xr1 : xr0 - 12, kb = Math.min(880, kh - kv);
        var ks = this.e.kort.style;
        ks.left = Math.round((kv + kh - kb) / 2) + "px";
        ks.width = Math.round(kb) + "px";
        ks.right = "auto";
        ks.margin = "0";
        this.kortSmalt = kb < 640;
        var kortTop = this.kortTop();
        lay.kortTop = kortTop;

        /* Reolen fra raekken og nedad */
        var luft = RAEKKE + 4;
        var plads = (vB - 8) / 4;
        /* Glassene med prop i et stativ paa hver hylde, med navn og formel
           under (T9b). Saa store, som der er plads til over kammeret. */
        var skilt = NK.klamp(W * 0.0095, 12.5, 14.5);
        var maksGh = ((lay.bordY - 250 - luft) / 3 - 22 - skilt * 2.5) / 1.12;
        var gh = Math.round(NK.klamp(Math.min(plads * 1.5, H * 0.09, maksGh), 32, 96));
        var raekkeH = gh * 1.12 + 22 + skilt * 2.5;
        lay.plads = plads;
        lay.hyldeGlasH = gh;
        lay.skilt = skilt;
        lay.planker = REOL.map(function (r, k) { return Math.round(luft + gh * 1.12 + k * raekkeH); });
        lay.hyldeGlas = [];
        REOL.forEach(function (r, k) {
            var skub = (4 - r.length) * plads / 2;
            r.forEach(function (i, j) {
                lay.hyldeGlas[i] = { x: x0 + 4 + skub + plads * (j + 0.5), y: lay.planker[k] - 1, raekke: k };
            });
        });
        lay.skiltBund = 13 + skilt * 2.45;
        lay.hylde = { x0: x0, x1: x1, top: luft, y: lay.planker[2], bund: lay.planker[2] + lay.skiltBund };

        /* Kammeret under reolen. Glasset stikker op af loftet, og ballonen
           skal kunne fyldes over det */
        var rum = lay.bordY - lay.hylde.bund - 10;
        var sk = NK.klamp(Math.min(rum / 420, vB * 0.72 / 240, 0.8), 0.18, 0.8);
        var kx = x1 - 120 * sk - 4;
        lay.kammer = Tg.kammerMaal(kx, lay.bordY, 300 * sk);
        var K = lay.kammer;
        lay.glas = Tg.glasMaal(kx, K.y + 214 * sk, 250 * sk);
        var aeB = Math.min(72 * NK.klamp(sk, 0.6, 1), K.x - x0 - 8);
        lay.aeske = aeB >= 30 ? { x: K.x - 6 - aeB, y: lay.bordY - aeB * 0.55, b: aeB, h: aeB * 0.55 } : null;
        lay.kop = { x: x0 + 22, y: lay.bordY };

        /* Kurven paa papiret til hoejre, fra raekken og ned */
        var arkY = smal ? kortTop + 4 : luft;
        var arkH = Math.round(Math.min(lay.bordY - arkY, vR * 1.8));
        lay.ark = { x: xr0, y: arkY, b: vR, h: arkH };
        var as = this.e.ark.style;
        as.left = lay.ark.x + "px"; as.top = lay.ark.y + "px";
        as.width = lay.ark.b + "px"; as.height = lay.ark.h + "px";

        /* Zoomvinduet og termometeret samlet i midten under kortet:
           termometeret staar lige til hoejre for vinduet (REGELSAET 21, 32) */
        var mx0 = x1 + 24, mx1 = xr0 - 20, TERMO_B = 118;
        var zTop = kortTop + 24, zBund = lay.bordY - 10;
        var zh = zBund - zTop, zb = zh * KASSE.W / KASSE.H;
        if (zb > mx1 - mx0 - TERMO_B) { zb = Math.max(120, mx1 - mx0 - TERMO_B); zh = zb * KASSE.H / KASSE.W; }
        var gx = Math.round((mx0 + mx1 - zb - TERMO_B) / 2);
        lay.zoom = { x: gx, y: Math.round(zTop + (zBund - zTop - zh) / 2), b: Math.round(zb), h: Math.round(zh) };
        lay.termo = Tg.termoMaal(gx + zb + 64, lay.bordY - 2, lay.bordY - 2 - (kortTop + 10), D.T_VARM);
        this.lay = lay;

        this.saetAnker("varm-anker-hylde", x0, luft, vB, lay.hylde.bund - luft);
        this.saetAnker("varm-anker-kammer", K.x, lay.glas.top - 40 * sk, K.b, lay.bordY - lay.glas.top + 40 * sk);
        this.saetAnker("varm-anker-termometer", lay.termo.venstre - 26, lay.termo.top, lay.termo.b + 70, lay.termo.h);
        this.saetAnker("varm-anker-zoom", lay.zoom.x, lay.zoom.y - 22, lay.zoom.b, lay.zoom.h + 22);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
        this.KL.tilpas();
    };

    /* ----- Glassene -------------------------------------------------------------------
       Et glas paa hylden er ved stuetemperatur: gasserne har fuld ballon. */
    function hyldeMakro(st) {
        var T = D.STUE;
        if (T < st.smp) return { fast: 1, vaeske: 0, koger: 0, ballon: 0 };
        if (T >= st.kp) return { fast: 0, vaeske: 0, koger: 0, ballon: 1 };
        return { fast: 0, vaeske: 1 - D.DAMP * D.damptryk(st, T), koger: 0, ballon: 0 };
    }

    /* Saet glasset i med nummer i i kammeret; det gamle flyver op paa hylden */
    P.skift = function (i) {
        if (i === this.valgt || this.brand) return;
        this.flyv = { gammel: this.valgt, ny: i, t: 0 };
        this.valgt = i;
        this.proeve = this.lavProeve(i);
        this.proeve.pause = !!this.pause;
        this.ballonVaek = false;
    };

    /* ----- Hvad der sker i proeven --------------------------------------------------- */
    P.haendelser = function () {
        var mig = this;
        this.proeve.hentHaendelser().forEach(function (h) {
            if (h.slags === "koge" || h.slags === "fortaette") mig.fundKp(h.st, h.slags);
            if (h.slags === "smelte" || h.slags === "fryse") mig.fundSmp(h.st, h.slags);
        });
    };

    P.fundKp = function (st, slags) {
        var noegle = st.id + slags;
        var nyt = this.fundet.indexOf(st.id) < 0;
        if (nyt) {
            this.fundet.push(st.id);
            this.sidstFundet = st.id;
            this.glimt[st.id] = 1;
            this.gem();
        }
        if (nyt || this.sidstMeldt !== noegle) {
            this.sidstMeldt = noegle;
            this.note(slags === "koge" ?
                st.Navn + " koger ved " + D.gradTekst(st.kp) + "." :
                st.Navn + " fortætter ved " + D.gradTekst(st.kp) + ". Det er også kogepunktet.");
        }
    };

    P.fundSmp = function (st, slags) {
        var noegle = st.id + slags;
        this.smp[st.id] = true;
        if (this.sidstMeldt === noegle) return;
        this.sidstMeldt = noegle;
        this.note(slags === "smelte" ?
            st.Navn + " smelter ved " + D.gradTekst(st.smp) + "." :
            st.Navn + " størkner ved " + D.gradTekst(st.smp) + ". Det er smeltepunktet.");
    };

    /* Kun i den fri leg staar en kort besked paa kortet; under opgaverne
       viser scenen det (maerkerne paa termometeret og kurven) */
    P.note = function (tekst) {
        if (this.opgaver) this.opgaver.friBesked(tekst);
    };

    P.gem = function () {
        NK.gem(NOEGLE, { fundet: this.fundet, gaet: this.gaet, rost: this.rost });
    };

    /* ----- Kortet (bagudkompatible navne til Kemichael og selvtesten) ------------ */
    P.visKort = function () { if (this.opgaver) this.opgaver.visKort(); };
    P.visMaal = P.visKort;
    P.knap = function () { this.opgaver.enter(); };
    P.enter = function () { this.opgaver.enter(); };
    P.fokus = function () {};

    /* R: opgaven forfra; i den fri leg et nyt glas ved stuetemperatur */
    P.nulstil = function () {
        if (this.fri()) { this.saetT(D.STUE); return; }
        this.opgaver.forfra();
    };

    /* Piletasterne skruer paa temperaturen, naar termometeret maa bruges;
       P holder pause i den fri leg */
    P.tast = function (tast, e) {
        if ((tast === "p" || tast === "P") && this.fri()) { this.skiftPause(); return true; }
        if (/^Arrow(Up|Down)$/.test(tast) && !this.maa("termo")) { this.opgaver.spaer(); return true; }
        if (this.termo.tast(tast, e && e.shiftKey)) { this.opgaver.brug("termo"); return true; }
        return false;
    };

    P.skiftPause = function () {
        this.pause = !this.pause;
        this.proeve.pause = this.pause;
    };

    /* ----- Kurven paa papiret ------------------------------------------------------------- */
    /* Gaettet vises paa opgaven Gæt decan og kan kun traekkes, mens kortet
       beder om det */
    P.gaetVis = function () {
        var o = this.opgaver && this.opgaver.opgave();
        return !!(this.gaet && o && o.id === "decan");
    };
    P.gaetAktiv = function () { return this.gaetVis() && !this.fri() && this.maa("kurve"); };

    P.kurveData = function () {
        var mig = this;
        return {
            punkter: this.fundet.map(function (id) {
                return { st: D.stof(id), ny: mig.glimt[id] || 0, sidst: id === mig.sidstFundet };
            }),
            gaet: this.gaetVis() ? { nC: D.stof(this.gaet.id).nC, t: this.gaet.t, sat: this.gaet.sat, aktiv: this.gaetAktiv() } : null,
            gaetLys: this.kurveOver === "gaet" || (this.kurveTraek && this.kurveTraek.slags === "gaet"),
            aktiv: this.stof().nC,
            tid: this.tid
        };
    };

    P.koblKurve = function () {
        var mig = this, c = this.KL.canvas;
        function hvad(pt) {
            var K = Tg.kurveMaal(mig.KL.b, mig.KL.h);
            if (mig.gaetAktiv()) {
                var gx = K.xFor(D.stof(mig.gaet.id).nC), gy = K.yFor(mig.gaet.t);
                if (Math.abs(pt.x - gx) < 20 && Math.abs(pt.y - gy) < 20) return { slags: "gaet" };
                if (Math.abs(pt.x - gx) < 20 && pt.y > K.top && pt.y < K.bund) return { slags: "gaetSoejle" };
            }
            if (!mig.fri()) return null;
            var bedst = null;
            mig.fundet.forEach(function (id) {
                var st = D.stof(id), d = Math.abs(pt.x - K.xFor(st.nC)) + Math.abs(pt.y - K.yFor(st.kp));
                if (d < 16 && (!bedst || d < bedst.d)) bedst = { slags: "punkt", st: st, d: d };
            });
            return bedst;
        }
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.KL.punkt(e), u = hvad(pt);
            if (!u) {
                if (mig.gaetAktiv()) mig.opgaver.spaer();
                else if (!mig.fri()) mig.opgaver.spaer();
                return;
            }
            if (u.slags === "gaet" || u.slags === "gaetSoejle") {
                mig.kurveTraek = { slags: "gaet" };
                mig.opgaver.brug("kurve");
                mig.flytGaet(pt);
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                return;
            }
            if (u.slags === "punkt") {
                mig.note(u.st.Navn + ", " + D.formel(u.st) + ", koger ved " + D.gradTekst(u.st.kp) + ".");
            }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.KL.punkt(e);
            if (mig.kurveTraek) { mig.flytGaet(pt); return; }
            var u = hvad(pt);
            mig.kurveOver = u ? (u.slags === "gaetSoejle" ? "gaet" : u.slags) : null;
            c.style.cursor = u ? (u.slags === "punkt" ? "pointer" : "ns-resize") : "default";
        });
        c.addEventListener("pointerup", function (e) {
            if (!mig.kurveTraek) return;
            mig.flytGaet(mig.KL.punkt(e));
            mig.kurveTraek = null;
            if (mig.gaetAktiv()) {
                mig.gaet.sat = true;
                mig.gem();
                mig.visKort();
            }
        });
        c.addEventListener("pointerleave", function () { mig.kurveOver = null; });
    };

    P.flytGaet = function (pt) {
        if (!this.gaetAktiv()) return;
        var K = Tg.kurveMaal(this.KL.b, this.KL.h);
        this.gaet.t = Math.round(NK.klamp(K.tFor(pt.y), -200, 360) / 5) * 5;
    };

    /* ----- Tegneloekken ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        this.termo.opdater(dt);
        this.proeve.T = this.termo.T;
        if (!this.fri() && this.pause) { this.pause = false; this.proeve.pause = false; }
        this.proeve.opdater(dt);
        this.haendelser();
        if (this.flyv) {
            this.flyv.t += dt / FLYV_TID;
            if (this.flyv.t >= 1) this.flyv = null;
        }
        Object.keys(this.glimt).forEach(function (id) {
            mig.glimt[id] = Math.max(0, mig.glimt[id] - dt * 0.6);
        });
        if (this.stik) {
            this.stik.tid += dt;
            if (this.stik.braender && this.stik.tid > 7) {
                this.stik = null;
                if (this.traek && this.traek.slags === "stik") this.traek = null;
            } else if (this.stik.braender) {
                this.tjekStik();
            }
        }
        if (this.brand) {
            this.brand.t += dt;
            if (this.brand.t > 1.1 && !this.brand.kaldt) {
                this.brand.kaldt = true;
                if (this.laererBrand) this.laererBrand();
                else this.brand.nyTid = 1.5;
            }
            if (this.brand.nyTid !== undefined) {
                this.brand.nyTid -= dt;
                if (this.brand.nyTid <= 0) this.nyBallon();
            }
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.opgaver.opdater(dt);
    };

    /* Kemichael saetter et nyt glas med en ny ballon i */
    P.nyBallon = function () {
        this.brand = null;
        this.ballonVaek = false;
        this.proeve = this.lavProeve(this.valgt);
        this.proeve.pause = !!this.pause;
    };

    /* Et glas' plads og hoejde paa hylden eller i kammeret */
    P.glasPlads = function (i) {
        var lay = this.lay;
        if (i === "kammer") return { x: lay.glas.x, y: lay.glas.bund, h: lay.glas.h };
        var h = lay.hyldeGlas[i];
        return { x: h.x, y: h.y, h: lay.hyldeGlasH };
    };

    /* En gul ramme om det, eleven skal traekke i (REGELSAET 20) */
    function gulRamme(ctx, x, y, b, h, tid) {
        var a = 0.7 + 0.3 * Math.sin(tid * 4);
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, " + a + ")";
        ctx.lineWidth = 2.5;
        NK.rundtRekt(ctx, x, y, b, h, 7);
        ctx.stroke();
        ctx.restore();
    }

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, st = this.stof(), mk = this.proeve.makro();
        var fri = this.fri(), opf = this.opgaver.opfordring();
        var boble = null;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);

        /* Reolen med glassene ved stuetemperatur, eller en stiplet plads */
        var trukket = this.traek && this.traek.slags === "glas" && this.traek.flyttet ? this.traek.i : -1;
        if (this.skjult("hylde")) {
            var hy = lay.hylde;
            ctx.save();
            ctx.strokeStyle = "#3b3f4c";
            ctx.lineWidth = 2;
            ctx.setLineDash([7, 6]);
            NK.rundtRekt(ctx, hy.x0 + 2, hy.top + 4, hy.x1 - hy.x0 - 4, hy.bund - hy.top - 4, 10);
            ctx.stroke();
            ctx.setLineDash([]);
            NK.tekst(ctx, "Hylden med flere alkaner", (hy.x0 + hy.x1) / 2, (hy.top + hy.bund) / 2,
                { font: "400 14px Lexend, 'Segoe UI', sans-serif", farve: "#6a707b", justering: "center", linje: "middle" });
            ctx.restore();
        } else {
            lay.planker.forEach(function (py) { Tg.hylde(ctx, lay.hylde.x0, lay.hylde.x1, py); });
            var stativ = [[], [], []];
            D.HYLDE.forEach(function (hs, i) {
                var hg = lay.hyldeGlas[i];
                stativ[hg.raekke].push(hg.x);
                var iLuften = mig.flyv && (i === mig.flyv.gammel || i === mig.flyv.ny);
                var G = Tg.hyldeGlasMaal(hg.x, hg.y, lay.hyldeGlasH);
                if (i !== mig.valgt && i !== trukket && !iLuften) {
                    var over = mig.over && mig.over.slags === "hylde" && mig.over.i === i;
                    Tg.proppetGlas(ctx, G, hyldeMakro(hs), mig.tid, { lys: over ? 1 : 0 });
                }
            });
            /* Stativet foran glassene, og navn og formel under hvert glas */
            stativ.forEach(function (xs, k) {
                if (!xs.length) return;
                var hb = lay.plads * 0.46;
                Tg.stativ(ctx, xs[0] - hb, xs[xs.length - 1] + hb, lay.planker[k], lay.hyldeGlasH * 0.7, xs);
            });
            D.HYLDE.forEach(function (hs, i) {
                var hg = lay.hyldeGlas[i];
                var valgt = i === mig.valgt, fundet = mig.fundet.indexOf(hs.id) >= 0;
                Tg.skilt(ctx, hg.x, hg.y + 13, [hs.navn, D.formel(hs)], {
                    px: lay.skilt, px2: lay.skilt * 0.9, lexend: true,
                    farve: valgt ? "#f2c53d" : (fundet ? "#ffd2cb" : "#eef2f6"), farve2: valgt ? "#d9b54a" : "#aab3be" });
                /* Glasset, kortet beder eleven traekke ned */
                if (opf && opf.el === "glas:" + hs.id && i !== mig.valgt && i !== trukket) {
                    var G = Tg.hyldeGlasMaal(hg.x, hg.y, lay.hyldeGlasH);
                    var rb = Math.max(G.b + 16, lay.plads * 0.92), top = G.top - 18 * G.s - 4;
                    gulRamme(ctx, hg.x - rb / 2, top, rb, hg.y + lay.skiltBund + 2 - top, mig.tid);
                    Tg.buePil(ctx, hg.x + 6, hg.y + lay.skiltBund + 4, lay.glas.x + 14, lay.glas.top + 8, mig.tid,
                        Math.max(hg.x, lay.glas.x) + 40, (hg.y + lay.glas.top) / 2 + 20);
                    boble = { x: hg.x, y: hg.y + lay.skiltBund + 12, kl: "under", tekst: opf.tekst,
                              min: lay.hylde.x0, max: lay.hylde.x1 };
                }
            });
        }

        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        /* Koppen og (i den fri leg) taendstikaesken */
        var kop = this.g.kaffekop, kk = NK.klamp(lay.H / 600, 0.8, 1.4), ae = fri ? lay.aeske : null;
        if (!kop.skjult && !kop.iHaand && lay.aeske && lay.kop.x + 30 < lay.aeske.x) {
            S.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }
        if (ae) S.tegn(ctx, "taendstikaeske", ae.x, ae.y, ae.b, ae.h);
        if (ae && this.over && this.over.slags === "aeske") {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, ae.x - 3, ae.y - 3, ae.b + 6, ae.h + 6, 5);
            ctx.stroke();
            ctx.restore();
        }

        /* Kammeret med glasset */
        var K = lay.kammer, G = lay.glas;
        Tg.kammerBag(ctx, K, this.termo.T, this.tid);
        var iKammer = !this.flyv || this.flyv.t > 0.999;
        var overBallon = this.over && this.over.slags === "ballon";
        var frost = NK.klamp((-this.termo.T - 40) / 120, 0, 1);
        if (iKammer) {
            /* Samme skarpe glas som paa hylden, men med ballonen i stedet for proppen */
            Tg.proppetGlas(ctx, G, mk, this.tid, { lys: this.over && this.over.slags === "glas" ? 1 : 0, frost: frost, udenProp: true });
        }
        Tg.kammerFront(ctx, K, this.termo.T, { lys: this.over && this.over.slags === "kammer" ? 1 : 0 });
        if (iKammer) {
            Tg.ballon(ctx, G.mund.x, G.mund.y, G.s, mk.ballon, this.tid, undefined, {
                vaek: this.ballonVaek && !this.brand, pop: this.brand ? NK.klamp(this.brand.t / 0.5, 0, 1) : 0,
                lysBallon: overBallon ? 1 : 0
            });
        }

        /* Glassene, der flyver mellem hylden og kammeret */
        if (this.flyv) {
            var t = NK.blod(this.flyv.t);
            [[this.flyv.gammel, "kammer", this.flyv.gammel], [this.flyv.ny, this.flyv.ny, "kammer"]].forEach(function (f, n) {
                var fra = mig.glasPlads(f[1]), til = mig.glasPlads(f[2]);
                var x = NK.lerp(fra.x, til.x, t), y = NK.lerp(fra.y, til.y, t) - Math.sin(t * Math.PI) * 50;
                var h = NK.lerp(fra.h, til.h, t);
                /* Glassene i luften har prop; ballonen kommer paa i kammeret */
                Tg.proppetGlas(ctx, Tg.hyldeGlasMaal(x, y, h), hyldeMakro(D.HYLDE[f[0]]), mig.tid, {});
            });
        }

        /* Termometeret med kogepunktet og smeltepunktet, naar de er fundet.
           Haandtaget er der kun, naar termometeret maa bruges (REGELSAET 19a). */
        var maerker = [];
        if (this.fundet.indexOf(st.id) >= 0) maerker.push({ t: st.kp, tekst: "kp", farve: KP_FARVE });
        if (this.smp[st.id]) maerker.push({ t: st.smp, tekst: "smp", farve: SMP_FARVE });
        if (maerker.length === 2 && Math.abs(lay.termo.yFor(st.kp) - lay.termo.yFor(st.smp)) < 14) { maerker[0].dy = -6; maerker[1].dy = 6; }
        var tr = this.traek;
        var termoOpf = !!opf && opf.el === "termo";
        var hd = Tg.termometer(ctx, lay.termo, this.termo.T, {
            trin: 50, store: 100, maerker: maerker, stue: true, tid: this.tid,
            haandtag: this.over && this.over.slags === "termo", traekker: tr && tr.slags === "termo",
            puls: termoOpf, udenHaandtag: !this.maa("termo")
        });
        if (termoOpf && !tr) {
            Tg.traekPil(ctx, hd.x, hd.y, hd.r * 2 + 18, this.tid);
            boble = { x: hd.x - hd.r - 14, y: hd.y, kl: "venstre", tekst: opf.tekst };
        }

        /* Zoomvinduet. Forklaringen af farverne kommer, naar kortet har
           spurgt om tilstanden; pauseknappen kun i den fri leg. */
        var z = lay.zoom;
        var fraZ = { x: G.ind.x0, y: G.ind.bund - G.fuld - 6 * G.s, b: G.ind.x1 - G.ind.x0, h: G.fuld + 6 * G.s };
        if (iKammer) Tg.zoomLinjer(ctx, fraZ, z);
        this.pauseFelt = Tg.zoomKasse(ctx, z, this.proeve, {
            kontakter: "svag",
            titel: "I glasset: " + st.navn + ", " + D.formel(st),
            forklaring: this.skjult("forklaring") ? null :
                [{ farve: Tg.TILSTAND[0], tekst: "fast stof" }, { farve: Tg.TILSTAND[1], tekst: "væske" }, { farve: Tg.TILSTAND[2], tekst: "gas" }],
            pause: fri ? !!this.pause : undefined, pauseLys: this.over && this.over.slags === "pause",
            lys: fri && this.over && this.over.slags === "zoom" ? 0.6 : 0
        });

        /* Glasset, der traekkes */
        if (trukket >= 0) {
            Tg.proppetGlas(ctx, Tg.hyldeGlasMaal(tr.x, tr.y + lay.hyldeGlasH * 0.45, lay.hyldeGlasH), hyldeMakro(D.HYLDE[trukket]), this.tid,
                { lys: this.overKammer(tr) ? 1 : 0.4 });
        }

        /* Ildkuglen og taendstikken */
        if (this.brand) Tg.ildkugle(ctx, this.brand.x, this.brand.y, this.brand.r, this.brand.t / 1.1);
        if (this.stik) {
            Tg.taendstik(ctx, this.stik.x, this.stik.y, { s: NK.klamp(lay.H / 600, 0.8, 1.3), vinkel: 0.45, braender: this.stik.braender, tid: this.tid });
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);

        /* Kurven paa papiret: en stiplet plads, til den bruges */
        var plads = this.skjult("kurve") || this.fundet.length === 0;
        if (this.e.ark.classList.contains("plads") !== plads) this.e.ark.classList.toggle("plads", plads);
        if (!plads && this.KL.b > 10) {
            var KM = Tg.kurve(this.KL.ctx, this.KL.b, this.KL.h, this.kurveData());
            if (opf && opf.el === "kurve" && this.gaetVis()) {
                boble = { x: lay.ark.x + KM.xFor(D.stof(this.gaet.id).nC), y: lay.ark.y + KM.yFor(this.gaet.t) + 18, kl: "under", tekst: opf.tekst,
                          min: lay.ark.x, max: lay.ark.x + lay.ark.b };
            }
        }
        this.visBoble(boble);
    };

    /* Boblen med pil ved det, eleven skal bruge. min og max holder den
       inden for hylden eller papiret; pilen peger stadig paa tingen. */
    P.visBoble = function (b) {
        var e = this.e.boble;
        if (!b || !b.tekst) { if (!e.hidden) e.hidden = true; return; }
        if (e.textContent !== b.tekst) e.textContent = b.tekst;
        var kl = "varm-boble" + (b.kl ? " " + b.kl : "");
        if (e.className !== kl) e.className = kl;
        e.hidden = false;
        var x = b.x, pil = 0;
        if (b.kl !== "venstre" && b.min !== undefined) {
            var halv = e.offsetWidth / 2 + 4;
            var cx = NK.klamp(x, b.min + halv, Math.max(b.min + halv, b.max - halv));
            pil = NK.klamp(x - cx, -halv + 14, halv - 14);
            x = cx;
        }
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(b.y) + "px";
        e.style.setProperty("--pil", Math.round(pil) + "px");
    };

    /* ----- Taendstikken -------------------------------------------------------------------- */
    P.ballonFelt = function () {
        var G = this.lay.glas, mk = this.proeve.makro();
        if (this.ballonVaek) return null;
        if (mk.ballon > 0.08) {
            var B = Tg.ballonMaal(G.mund.x, G.mund.y, G.s, mk.ballon);
            return { x: B.x, y: B.y, r: B.r * 1.1 + 6, fuld: true };
        }
        return { x: G.mund.x + 10 * G.s, y: G.mund.y, r: 26 * G.s, fuld: false };
    };

    P.tjekStik = function () {
        var b = this.ballonFelt(), s = this.stik;
        if (!b) return;
        var d = Math.sqrt((s.x - b.x) * (s.x - b.x) + (s.y - 10 - b.y) * (s.y - 10 - b.y));
        if (d > b.r) { s.ved = false; return; }
        if (b.fuld && this.proeve.gasIBallonen()) {
            this.antaend(b);
        } else if (!s.ved) {
            s.ved = true;
            this.note(D.TOM_BALLON);
        }
    };

    P.antaend = function (b) {
        this.brand = { t: 0, x: b.x, y: b.y, r: b.r * 1.6 };
        this.proeve.braend();
        this.ballonVaek = true;
        this.stik = null;
        if (this.traek && this.traek.slags === "stik") this.traek = null;
        this.braende++;
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.overKammer = function (pt) {
        var K = this.lay.kammer;
        return pt.x >= K.x - 20 && pt.x <= K.x + K.b + 20 && pt.y >= this.lay.glas.top - 80 * K.s && pt.y <= K.bund;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var z = lay.zoom, pk = this.pauseFelt, fri = this.fri();
        if (pk && pt.x >= pk.x && pt.x <= pk.x + pk.b && pt.y >= pk.y && pt.y <= pk.y + pk.h) return { slags: "pause" };
        if (this.termo.rammer(pt, lay.termo)) return { slags: "termo" };
        var kop = this.g.kaffekop, ae = lay.aeske;
        if (!kop.skjult && !kop.iHaand && ae && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60 && lay.kop.x + 30 < ae.x) {
            return { slags: "kop" };
        }
        if (fri && ae && pt.x >= ae.x - 4 && pt.x <= ae.x + ae.b + 4 && pt.y >= ae.y - 12 && pt.y <= ae.y + ae.h + 4) return { slags: "aeske" };
        if (!this.skjult("hylde")) {
            for (var i = 0; i < D.HYLDE.length; i++) {
                if (i === this.valgt) continue;
                var hg = lay.hyldeGlas[i], G = Tg.hyldeGlasMaal(hg.x, hg.y, lay.hyldeGlasH);
                var b = Math.max(G.b, lay.plads * 0.9);
                if (Math.abs(pt.x - hg.x) <= b / 2 && pt.y >= G.top - 20 * G.s && pt.y <= hg.y + lay.skiltBund) return { slags: "hylde", i: i };
            }
        }
        if (!fri) return null;
        var bf = this.ballonFelt();
        if (bf && bf.fuld && Math.abs(pt.x - bf.x) < bf.r && Math.abs(pt.y - bf.y) < bf.r) return { slags: "ballon" };
        var Gk = lay.glas;
        if (pt.x >= Gk.venstre - 4 && pt.x <= Gk.venstre + Gk.b + 4 && pt.y >= Gk.top && pt.y <= Gk.bund) return { slags: "glas" };
        if (this.overKammer(pt)) return { slags: "kammer" };
        if (pt.x >= z.x && pt.x <= z.x + z.b && pt.y >= z.y && pt.y <= z.y + z.h) return { slags: "zoom" };
        return null;
    };

    /* Maa det under musen bruges nu? Termometeret og glassene kun, naar
       kortet beder om dem (REGELSAET 19a). */
    P.maaBruge = function (u) {
        if (!u) return false;
        if (u.slags === "termo") return this.maa("termo");
        if (u.slags === "hylde") return this.maa("glas:" + D.HYLDE[u.i].id);
        return true;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (!mig.maaBruge(u)) { mig.opgaver.spaer(); return; }
            if (u.slags === "termo") {
                if (mig.termo.start(pt, mig.lay.termo)) {
                    mig.traek = { slags: "termo" };
                    mig.proeve.T = mig.termo.T;
                    mig.opgaver.brug("termo");
                }
            } else if (u.slags === "hylde") {
                mig.traek = { slags: "glas", i: u.i, start: pt, x: pt.x, y: pt.y, flyttet: false };
                mig.opgaver.brug("glas:" + D.HYLDE[u.i].id);
            } else if (u.slags === "aeske" && !mig.brand) {
                mig.traek = { slags: "stik", start: pt };
                mig.stik = { x: pt.x, y: pt.y, braender: false, tid: 0 };
            } else {
                if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); }
                else if (u.slags === "kop") { if (mig.klikKop) mig.klikKop(); }
                else if (u.slags === "pause") mig.skiftPause();
                else mig.klikInfo(u);
                return;
            }
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                if (tr.slags === "termo") mig.termo.flyt(pt, mig.lay.termo);
                if (tr.slags === "glas") {
                    tr.x = pt.x;
                    tr.y = pt.y;
                    if (!tr.flyttet && Math.abs(pt.x - tr.start.x) + Math.abs(pt.y - tr.start.y) > 6) tr.flyttet = true;
                }
                if (tr.slags === "stik" && mig.stik) {
                    mig.stik.x = pt.x;
                    mig.stik.y = pt.y;
                    if (!mig.stik.braender && Math.abs(pt.x - tr.start.x) + Math.abs(pt.y - tr.start.y) > 24) {
                        mig.stik.braender = true;
                        mig.stik.tid = 0;
                    }
                }
                c.style.cursor = tr.slags === "termo" ? "ns-resize" : "grabbing";
                return;
            }
            var u = mig.hvadErUnder(pt);
            mig.over = mig.maaBruge(u) ? u : null;
            var s = mig.over && mig.over.slags;
            c.style.cursor = !s ? "default" : (s === "termo" ? "ns-resize" : (s === "hylde" || s === "aeske" ? "grab" : "pointer"));
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () { mig.slipTraek(null); });
        c.addEventListener("pointerup", function (e) { mig.slipTraek(mig.L.punkt(e)); });
    };

    P.slipTraek = function (pt) {
        var tr = this.traek;
        this.traek = null;
        if (!tr) return;
        if (tr.slags === "termo") {
            this.termo.slip();
        } else if (tr.slags === "glas") {
            if (!tr.flyttet || (pt && this.overKammer(pt))) this.skift(tr.i);
            else this.opgaver.brugt["glas:" + D.HYLDE[tr.i].id] = false;
        } else if (tr.slags === "stik") {
            this.stik = null;
        }
    };

    /* Et klik uden at traekke (kun i den fri leg) */
    P.klikInfo = function (u) {
        var st = this.stof(), t = "";
        if (u.slags === "glas") {
            t = st.Navn + ", " + D.formel(st) + ". " + (this.fundet.indexOf(st.id) >= 0 ?
                "Kogepunktet er " + D.gradTekst(st.kp) + "." : "Kogepunktet for " + st.navn + " er ikke fundet endnu.");
        } else if (u.slags === "ballon") {
            t = "Ballonen fanger gassen, når stoffet koger. Varm gas fylder mere.";
        } else if (u.slags === "kammer") {
            t = "Kammeret har den temperatur, termometeret viser.";
        } else if (u.slags === "zoom") {
            t = "Hver kugle er et C-atom med dets H-atomer. De gule prikker viser, hvor molekylerne rører hinanden.";
        }
        if (t) this.note(t);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc4.1-intro-varm", tilbud: "varm-tilbud" });
    /* Intet tilbud paa fane 1 (22. nov. 2026, T9): kun K viser praesentationen */
    P.startIntro = function (tving) {
        if (!this.laererIntro || !tving) return;
        NK.gem("nk-sc4.1-intro-varm", true);
        if (!(this.laererIIntro && this.laererIIntro())) this.introVent = 0.1;
    };

    NK.SimVarm = SimVarm;
}());
