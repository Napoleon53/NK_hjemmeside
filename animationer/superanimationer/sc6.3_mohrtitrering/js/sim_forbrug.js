/* =====================================================================
   sim_forbrug.js - fane 3: fejlkilder (hvad aendrer forbruget og resultatet?)

   To opstillinger side om side. A er som paa fane 1 med havvand fra
   Vesterhavet. Ved B er én ting aendret: mere vand, mindre havvand,
   staerkere soelvnitrat, postevand i stedet for demineraliseret vand
   eller noget spildt havvand (D.SITUATIONER). Eleven gaetter foerst, hvad
   der sker med forbruget eller masseprocenten. Saa titreres begge kolber
   til omslaget paa samme tid, og tabellen i panelet viser forbruget og
   den masseprocent, man ville regne ud. Bygget som sc7.4's fane 3.

   Pointen er den samme som paa fane 1: buretten taeller chloridet. Kun
   det, der aendrer stofmaengden af chlorid i kolben eller koncentrationen
   af soelvnitrat, aendrer forbruget.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var FART = 6;                /* mL/s, naar Kemichael titrerer */
    var NOEGLE_ROS = "nk-sc6.3-ros-forbrug";

    function SimForbrug() {
        this.L = new NK.Laerred(NK.el("for-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.p = 3.10;
        this.sted = "Vesterhavet";
        this.nr = 0;
        this.rigtige = 0;
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.startSituation();
    }

    var P = SimForbrug.prototype;

    /* ----- Kolberne ---------------------------------------------------------------------- */
    P.sit = function () { return D.SITUATIONER[this.nr] || null; };

    /* Proeven i en kolbe: det, der faktisk er der, og det, eleven tror.
       Kemichael titrerer til den foerste draabe efter aekvivalenspunktet,
       hvor kolben har skiftet farve (den valgte indikator). */
    P.kolbe = function (hvilken) {
        var sit = this.sit(), b = hvilken === "B" && sit ? sit.B : {};
        var m = b.m !== undefined ? b.m : K.PROEVE;
        var ks = {
            m: m,
            vand: b.vand !== undefined ? b.vand : K.VAND,
            c: b.c !== undefined ? b.c : K.C_AG,
            cTror: b.cTror !== undefined ? b.cTror : (b.c !== undefined ? b.c : K.C_AG),
            spild: b.spild || 0,
            post: !!b.post
        };
        ks.pr = { m: m * (1 - ks.spild), p: this.p, vand: ks.vand, c: ks.c, clVand: ks.post ? K.CL_POSTEVAND : 0, sted: this.sted, ind: K.indikator };
        var v = Math.ceil(K.vAek(ks.pr) / K.DRAABE - 1e-9) * K.DRAABE;
        for (var i = 0; i < 4 && K.farveStyrke(ks.pr, v) < 0.04; i++) v += K.DRAABE;
        ks.v = Math.round(v * 100) / 100;
        ks.procent = K.procent(ks.v, ks.cTror, ks.m);
        return ks;
    };

    P.startSituation = function (behold) {
        var sit = this.sit();
        this.valgt = -1;
        this.forste = -1;
        this.hjaelp = 0;
        this.info = null;
        if (!behold) {
            this.vA = 0;
            this.vB = 0;
            this.koert = false;
        }
        this.fase = "vaelg";
        this.besked("", "");
        this.A = this.kolbe("A");
        this.B = this.kolbe("B");
        if (sit && sit.samme && this.koert) {
            /* Samme kolber som foer: de er allerede titreret */
            this.vA = this.A.v;
            this.vB = this.B.v;
        }
        this.visKort();
        this.visTabel();
    };

    /* Et svar paa kortet vaelger kun (brugeren 24. okt. 2026); det sendes
       med Indsend svar */
    P.kortValg = function (i) {
        if (!this.sit() || this.fase !== "vaelg") return;
        if (this.afvisTilbud) this.afvisTilbud();
        this.valgt = i;
        this.visKort();
    };

    P.indsend = function () {
        if (this.fase !== "vaelg") { this.kort.blink(); return; }
        if (this.valgt < 0) {
            this.kort.blink();
            this.besked("Vælg et af svarene på kortet først.", "gul");
            return;
        }
        this.send(this.valgt);
    };

    /* Svaret er sendt; saa titreres der */
    P.send = function (i) {
        var sit = this.sit();
        if (!sit || this.fase !== "vaelg") return;
        if (this.afvisTilbud) this.afvisTilbud();
        this.valgt = i;
        if (this.forste === -1) this.forste = i;
        this.besked("", "");
        if (sit.samme && this.koert) {
            this.vis();
            return;
        }
        this.vA = 0;
        this.vB = 0;
        this.fase = "koerer";
        this.visKort();
        this.visTabel();
    };

    /* Begge kolber er titreret: kortet bliver paa spoergsmaalet med svaret
       groent (det valgte roedt, hvis det var forkert), forklaringen under
       svarene og knappen videre, hvor Indsend svar stod */
    P.vis = function () {
        var sit = this.sit();
        this.fase = "vist";
        this.koert = true;
        if (this.forste === sit.rigtig && !this.talt) { this.rigtige++; }
        this.talt = true;
        if (this.nr >= D.SITUATIONER.length - 1) {
            if (!NK.hent(NOEGLE_ROS, false)) {
                NK.gem(NOEGLE_ROS, true);
                this.ventRos = 1.2;
            }
        }
        this.visKort();
        this.visTabel();
    };

    /* ----- Knappen: Giv hint -> Vis svaret; den groenne knap gaar videre ----------------- */
    P.videre = function () {
        if (this.fase !== "vist") return;
        if (this.nr >= D.SITUATIONER.length - 1) {
            if (NK.sims && NK.sims["fane-titrering"]) NK.sims["fane-titrering"].nyProeve();
            if (NK.visFane) NK.visFane("fane-titrering");
            return;
        }
        var naesteSamme = D.SITUATIONER[this.nr + 1].samme;
        this.nr++;
        this.talt = false;
        this.startSituation(naesteSamme);
    };

    P.knap = function () {
        var sit = this.sit();
        if (this.fase === "vist") { this.videre(); return; }
        if (this.fase === "koerer") return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked('<span class="b-maerke">Hint</span> ' + NK.html(sit.hint), "gul");
            return;
        }
        if (this.forste < 0) this.forste = -2;   /* svaret er vist: taeller ikke som rigtigt */
        this.send(sit.rigtig);
    };

    /* Indikatoren er skiftet: kolberne regnes om. Er de titreret, staar
       de ved det nye omslag; ellers titrerer Kemichael videre. */
    P.skiftIndikator = function () {
        this.A = this.kolbe("A");
        this.B = this.kolbe("B");
        if (this.fase === "vist" || (this.sit() && this.sit().samme && this.koert && this.fase === "vaelg")) {
            this.vA = this.A.v;
            this.vB = this.B.v;
        } else {
            this.vA = Math.min(this.vA, this.A.v);
            this.vB = Math.min(this.vB, this.B.v);
        }
        this.visTabel();
        this.visKort();
    };

    P.nulstil = function () {
        this.nr = 0;
        this.rigtige = 0;
        this.talt = false;
        this.startSituation();
    };

    /* ----- Panelet og kortet ------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.kort = new NK.Scenekort("for", this, [196, 172]);
        NK.el("for-nulstil").addEventListener("click", function () { mig.nulstil(); });
    };

    P.besked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        this.visBund();
    };

    /* Linjen paa kortet: et svar paa et klik paa en kolbe (kort tid), mens
       der titreres, eller fejl og hint */
    P.visBund = function () {
        if (!this.kort) return;
        if (this.info && this.info.tid > 0) this.kort.bund(this.info.tekst, "peger");
        else if (this.fase === "koerer") this.kort.bund("Kemichael titrerer begge kolber til omslaget.", "peger");
        else this.kort.bund(this.fast.html, this.fast.klasse);
    };

    P.visKort = function () {
        var sit = this.sit(), mig = this;
        if (!sit) return;
        var vist = this.fase === "vist", rigtig = this.valgt === sit.rigtig;
        var svar = sit.valg.map(function (t, j) {
            return {
                t: t,
                valgt: !vist && j === mig.valgt,
                rigtig: vist && j === sit.rigtig,
                forkert: vist && j === mig.valgt && !rigtig,
                dim: vist && j !== sit.rigtig && j !== mig.valgt
            };
        });
        var d = { slags: "spm", chip: "Fejlkilde " + (this.nr + 1) + " af " + D.SITUATIONER.length + ": " + sit.titel,
            tekst: NK.html(sit.tekst), efter: NK.Scenekort.svar(svar, this.fase !== "vaelg") };
        if (vist) {
            var t = rigtig ? NK.html(sit.efter) : NK.html(sit.forkert[this.valgt] + " " + sit.efter);
            if (this.nr >= D.SITUATIONER.length - 1) t += " <b>" + this.rigtige + " af " + D.SITUATIONER.length + " rigtige i første forsøg.</b>";
            d.bliv = { tekst: t, gul: !rigtig, knap: this.nr >= D.SITUATIONER.length - 1 ? "Tag en ny prøve →" : "Næste fejlkilde →" };
        }
        this.kort.vis(d);
        var pegKnap = this.fast.klasse === "skidt" && this.hjaelp === 0;
        if (this.fase === "vaelg") this.kort.knapper(this.hjaelp === 0 ? "Giv hint" : "Vis svaret", pegKnap, this.valgt >= 0);
        else this.kort.knapper(null, false, null);
        this.visBund();
    };

    /* Tabellen A og B. Det, der er aendret ved B, er gult. */
    P.visTabel = function () {
        var A = this.A, B = this.B, vist = this.fase === "vist" || (this.sit() && this.sit().samme && this.koert);
        function celle(tekst, aendret) {
            return '<span class="tal' + (aendret ? " gul" : "") + '">' + tekst + "</span>";
        }
        function raekke(navn, a, b, aendret) {
            return '<div class="ab-raekke"><span>' + navn + "</span>" + celle(a, false) + celle(b, aendret) + "</div>";
        }
        var h = '<div class="ab-raekke hoved"><span></span><span>A</span><span>B</span></div>';
        h += raekke("Havvand (g)", NK.tal2(A.m), NK.tal2(B.m) + (B.spild ? "*" : ""), B.m !== A.m || B.spild > 0);
        h += raekke("Vand (mL)", String(A.vand), String(B.vand) + (B.post ? "*" : ""), B.vand !== A.vand || B.post);
        h += raekke("c(AgNO₃) (M)", K.c(A.c), K.c(B.c) + (B.cTror !== B.c ? "*" : ""), B.c !== A.c);
        h += raekke("Forbrug (mL)", vist ? K.mL(A.v) : "?", vist ? K.mL(B.v) : "?", false);
        h += raekke("Masseprocent (%)", vist ? K.pct(A.procent) : "?", vist ? K.pct(B.procent) : "?", false);
        NK.saetHTML("for-tabel", h);
        var note = "";
        if (B.spild) note = "* Noget af havvandet kom ikke i kolben, men der beregnes med " + NK.tal2(B.m) + " g.";
        else if (B.post) note = "* Postevand med lidt chlorid i stedet for demineraliseret vand.";
        else if (B.cTror !== B.c) note = "* Der beregnes med " + K.c(B.cTror) + " M.";
        NK.saetTekst("for-note", note);
    };

    /* ----- Layout ------------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.12, 40, 80));
        /* Pladsen oeverst er sat af til kortet (kortZone); 40 px til tallet over buretten */
        lay.zone = this.kort.zone();
        var topY = 10 + lay.zone + 40;
        var x0 = NK.klamp(W * 0.14, 90, 170);
        var fri = W - kant - x0;
        lay.gA = Tg.opstilling(x0 + fri * 0.3, lay.bordY, topY, 0.85);
        lay.gB = Tg.opstilling(x0 + fri * 0.74, lay.bordY, topY, 0.85);
        lay.kop = { x: kant + 22, y: lay.bordY };
        lay.px = NK.klamp(W * 0.014, 12, 15);
        lay.skiltY = lay.bordY + 12 + (H - lay.bordY - 12) / 2;
        this.lay = lay;
        var gA = lay.gA, gB = lay.gB;
        this.saetAnker("for-anker-a", gA.stang.x - 44 * gA.s, gA.buret.y - 44, gA.cx - gA.stang.x + 130 * gA.s, H - gA.buret.y + 44);
        this.saetAnker("for-anker-b", gB.stang.x - 44 * gB.s, gB.buret.y - 44, gB.cx - gB.stang.x + 130 * gB.s, H - gB.buret.y + 44);
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
    };

    /* ----- Opdater og tegn ------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.fase === "koerer") {
            this.vA = Math.min(this.A.v, this.vA + FART * dt);
            this.vB = Math.min(this.B.v, this.vB + FART * dt);
            if (this.vA >= this.A.v - 1e-9 && this.vB >= this.B.v - 1e-9) {
                this.efter = (this.efter || 0) + dt;
                if (this.efter > 0.5) { this.efter = 0; this.vis(); }
            }
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererReplik) this.laererReplik(D.ROS_FORBRUG, true);
        }
        if (this.info) {
            this.info.tid -= dt;
            if (this.info.tid <= 0) { this.info = null; this.visBund(); }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegnOpstilling = function (ctx, g, ks, v, navn, aendring, erB) {
        var lay = this.lay, sit = this.sit();
        var koerer = this.fase === "koerer" && v < ks.v - 1e-9;
        var t = K.tilstand(ks.pr, v);
        var styrke = K.styrke(t), uklar = K.uklarhed(ks.pr, t);
        Tg.stativ(ctx, g);
        Tg.omroerer(ctx, g);
        var mL = ks.vand + ks.pr.m + K.V_IND + v;
        var ov = Tg.kolbe(ctx, g, mL, K.kolbeFarve(uklar, styrke, undefined, ks.pr.ind), this.tid * 9, [], { fnug: uklar });
        if (koerer) Tg.straale(ctx, g, ov, 0.8);
        Tg.buret(ctx, g, v, koerer ? 0.85 : 0, {
            etiket: "AgNO₃ " + K.c(ks.c) + " M",
            etiketFarve: erB && sit && sit.B.c !== undefined ? "#fff0b8" : null,
            tal: g.s > 0.45
        });
        /* Spildt havvand paa bordet */
        if (erB && ks.spild > 0) {
            ctx.save();
            ctx.fillStyle = "rgba(127, 198, 207, 0.3)";
            ctx.strokeStyle = "rgba(170, 222, 228, 0.6)";
            ctx.beginPath();
            ctx.ellipse(g.cx + 95 * g.k, g.bordY + 3, 34 * g.k, 6 * g.k, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        /* Aflaesningen over buretten */
        var vist = this.fase === "vist" || (sit && sit.samme && this.koert);
        if (vist || v > 0) {
            Tg.skilt(ctx, g.cx, g.buret.y - 24, K.mL(v) + " mL", {
                px: NK.klamp(lay.px + 2, 13, 17), farve: vist ? "#f2c53d" : "#dde3ea", kant: vist ? "#f2c53d" : "#4a4a58"
            });
        }
        /* Navnet paa bordets forkant */
        Tg.skilt(ctx, g.cx, lay.skiltY, navn + " · " + aendring, {
            px: lay.px, farve: erB ? "#f5dd8a" : "#dde3ea", kant: erB ? "rgba(242, 197, 61, 0.7)" : "#4a4a58"
        });
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }
        var sit = this.sit();
        this.tegnOpstilling(ctx, lay.gA, this.A, this.vA, "A", "som på fane 1", false);
        this.tegnOpstilling(ctx, lay.gB, this.B, this.vB, "B", sit ? sit.aendring : "", true);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ------------------------------------------------------------------------------ */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        function i(g) { return Math.abs(pt.x - g.cx) <= 80 * g.k && pt.y >= g.buret.y - 40 && pt.y <= g.bordY + 50; }
        if (i(lay.gA)) return { slags: "A" };
        if (i(lay.gB)) return { slags: "B" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            c.style.cursor = mig.over ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; });
        c.addEventListener("pointerup", function (e) { mig.klik(mig.L.punkt(e)); });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "A") this.info = { tekst: "Kolbe A: " + NK.tal2(this.A.m) + " g havvand fra " + this.sted + ", " + this.A.vand +
            " mL demineraliseret vand og sølvnitrat " + K.c(this.A.c) + " M.", tid: 5 };
        if (u.slags === "B") this.info = { tekst: "Kolbe B: <b>" + NK.html(this.sit().aendring) + "</b>. Resten er som ved kolbe A.", tid: 5 };
        this.visBund();
    };

    P.tast = function (e) {
        if (this.fase === "vaelg" && /^[1-3]$/.test(e.key) && e.shiftKey) { this.kortValg(parseInt(e.key, 10) - 1); return true; }
        return false;
    };

    P.enter = function () {
        if (this.fase === "vist") this.videre();
        else if (this.fase === "vaelg" && this.valgt >= 0) this.indsend();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc6.3-intro-forbrug", tilbud: "for-tilbud" });

    NK.SimForbrug = SimForbrug;
}());
