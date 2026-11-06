/* =====================================================================
   sim_forbrug.js - fane 3: to kolber (hvad aendrer forbruget?)

   To opstillinger side om side. A er som paa fane 1. Ved B er én ting
   aendret: mere vand, mindre eddike, staerkere NaOH, en burette
   skyllet med vand eller noget spildt eddike (D.SITUATIONER). Eleven
   gaetter foerst, hvad der sker med forbruget eller masseprocenten. Saa
   titreres begge kolber til omslaget paa samme tid, og tabellen i
   panelet viser forbruget og den masseprocent, man ville regne ud.

   Pointen er den samme som paa fane 1: buretten taeller syren. Kun det,
   der aendrer stofmaengden af syre eller koncentrationen af NaOH,
   aendrer forbruget, og en fejl i en af dem giver et forkert resultat.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var FART = 6;                /* mL/s, naar Kemichael titrerer */
    var NOEGLE_ROS = "nk-sc7.4-ros-forbrug";

    function SimForbrug() {
        this.L = new NK.Laerred(NK.el("for-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.p = 4.60;
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

    /* Proeven i en kolbe: det, der faktisk er der, og det, eleven tror */
    P.kolbe = function (hvilken) {
        var sit = this.sit(), b = hvilken === "B" && sit ? sit.B : {};
        var m = b.m !== undefined ? b.m : K.PROEVE;
        var ks = {
            m: m,
            vand: b.vand !== undefined ? b.vand : K.VAND,
            c: b.c !== undefined ? b.c : K.C_NAOH,
            cTror: b.cTror !== undefined ? b.cTror : (b.c !== undefined ? b.c : K.C_NAOH),
            spild: b.spild || 0
        };
        ks.pr = { m: m * (1 - ks.spild), p: this.p, vand: ks.vand, c: ks.c };
        ks.v = Math.ceil(K.vAek(ks.pr) / K.DRAABE - 1e-9) * K.DRAABE;
        ks.procent = K.procent(ks.v, ks.cTror, ks.m);
        return ks;
    };

    P.startSituation = function (behold) {
        var sit = this.sit();
        this.valgt = -1;
        this.forste = -1;
        this.hjaelp = 0;
        this.svarVist = false;
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
        this.bygValg();
        this.visKort();
        this.visTabel();
        this.visStatus();
    };

    /* Et svar paa kortet vaelger kun. Indsend svar sender det, og saa titreres der. */
    P.vaelg = function (i) {
        var sit = this.sit();
        if (!sit || this.fase !== "vaelg") return;
        if (this.afvisTilbud) this.afvisTilbud();
        this.valgt = i;
        if (this.bKl === "peger") this.bH = "";
        this.visKort();
        this.visStatus();
    };

    P.kanSende = function () { return this.fase === "vaelg" && this.valgt >= 0; };

    P.indsend = function () {
        var sit = this.sit();
        if (!sit || this.fase !== "vaelg") return;
        if (this.valgt < 0) {
            this.besked("Vælg et af de tre svar først.", "peger");
            return;
        }
        if (this.forste === -1) this.forste = this.valgt;
        this.bH = "";
        if (sit.samme && this.koert) {
            this.vis();
            return;
        }
        this.vA = 0;
        this.vB = 0;
        this.fase = "koerer";
        this.visKort();
        this.visTabel();
        this.visStatus();
    };

    /* Et svar og Indsend svar i ét (Vis svaret og selvtesten) */
    P.svar = function (i) {
        this.vaelg(i);
        this.indsend();
    };

    P.vis = function () {
        var sit = this.sit();
        this.fase = "vist";
        this.koert = true;
        var rigtig = this.valgt === sit.rigtig;
        if (this.forste === sit.rigtig && !this.talt) { this.rigtige++; }
        this.talt = true;
        /* Kortet bliver paa spoergsmaalet: svaret groent (det forkerte roedt),
           forklaringen under svarene og Naeste dér, hvor Indsend svar stod */
        var efter = sit.efter;
        if (!rigtig) {
            /* Gentager forklaringen det, der lige er sagt om det forkerte svar,
               staar kun selve svaret (fx "For høj.") */
            var forste = efter.split(". ")[0] + ".", resten = efter.slice(forste.length).trim();
            if (resten && sit.forkert[this.valgt].indexOf(resten.split(". ")[0].replace(/\.$/, "")) >= 0) efter = forste;
        }
        this.slutTekst = rigtig ? NK.html(efter) :
            NK.html(sit.forkert[this.valgt]) + " <b>Svaret:</b> " + NK.html(efter);
        this.slutRigtig = rigtig;
        if (this.nr >= D.SITUATIONER.length - 1) {
            this.slutTekst += " <b>" + this.rigtige + " af " + D.SITUATIONER.length + " rigtige gæt i første forsøg.</b>";
            if (!NK.hent(NOEGLE_ROS, false)) {
                NK.gem(NOEGLE_ROS, true);
                this.ventRos = 1.2;
            }
        }
        this.bygValg();
        this.visKort();
        this.visTabel();
        this.visStatus();
    };

    /* ----- Kortets knapper: Giv hint -> Vis svaret, Indsend svar og Naeste ------------------ */
    P.knap = function () {
        if (this.fase === "vist") { this.videre(); return; }
        this.hjaelpKnap();
    };

    P.videre = function () {
        if (this.fase === "vist") {
            if (this.nr >= D.SITUATIONER.length - 1) {
                if (NK.sims && NK.sims["fane-titrering"]) NK.sims["fane-titrering"].nyProeve();
                if (NK.visFane) NK.visFane("fane-titrering");
                return;
            }
            var naesteSamme = D.SITUATIONER[this.nr + 1].samme;
            this.nr++;
            this.talt = false;
            this.startSituation(naesteSamme);
        }
    };

    P.hjaelpKnap = function () {
        var sit = this.sit();
        if (this.fase !== "vaelg") return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(sit.hint), "gul");
            return;
        }
        if (this.forste < 0) this.forste = -2;   /* svaret er vist: taeller ikke som rigtigt */
        this.svarVist = true;
        this.svar(sit.rigtig);
    };

    P.nulstil = function () {
        this.nr = 0;
        this.rigtige = 0;
        this.talt = false;
        this.startSituation();
    };

    /* ----- Panelet --------------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {};
        this.kort = new NK.SceneKort("for", {
            valg: function (j) { mig.vaelg(parseInt(j, 10)); },
            hint: function () { mig.hjaelpKnap(); },
            indsend: function () { mig.indsend(); },
            videre: function () { mig.videre(); }
        });
        this.el.besked = this.kort.beskedEl;
        this.bH = "";
        this.bKl = "";
        this.trinTekst = "";
        NK.el("for-nulstil").addEventListener("click", function () { mig.nulstil(); });
    };

    /* De tre svar staar paa kortet (visKort) */
    P.bygValg = function () { this.visKort(); };

    /* Beskeden paa papirkortet (hint). Uden besked staar det naeste skridt dér. */
    P.besked = function (html, klasse) {
        this.bH = html || "";
        this.bKl = klasse || "";
        this.visKnap();
    };

    P.visKort = function () {
        var sit = this.sit(), mig = this;
        if (!sit || !this.kort) return;
        var vist = this.fase === "vist";
        this.kort.vis({ kl: "spm", chip: "Opgave " + (this.nr + 1) + " af " + D.SITUATIONER.length, tekst: NK.html(sit.tekst),
            laast: this.fase !== "vaelg",
            svar: sit.valg.map(function (t, i) {
                return { j: i, t: NK.html(t), valgt: !vist && i === mig.valgt,
                    rigtig: vist && i === sit.rigtig && (mig.valgt === sit.rigtig || !mig.svarVist),
                    svarVist: vist && i === sit.rigtig && mig.svarVist,
                    forkert: vist && i === mig.valgt && i !== sit.rigtig };
            }) });
        this.visKnap();
    };

    /* Beskeden, Giv hint og Indsend svar, eller forklaringen og Naeste */
    P.visKnap = function () {
        var k = this.kort;
        if (!k) return;
        var bh = this.bH || this.trinTekst || "", bkl = this.bH ? this.bKl : "";
        var noegle = bh + "|" + bkl;
        if (noegle !== this.kortBesked) { this.kortBesked = noegle; k.besked(bh, bkl); }
        if (this.fase === "vist") {
            var sidst = this.nr >= D.SITUATIONER.length - 1;
            k.bliv(this.slutTekst || "", this.svarVist ? "Svaret" : (this.slutRigtig ? "Rigtigt" : "Forkert gæt"),
                sidst ? "Tag en ny prøve" : "Næste kolbe B", this.svarVist ? "svar" : (this.slutRigtig ? "god" : "nej"));
            return;
        }
        k.bliv(null);
        k.knapper({ hint: this.fase === "vaelg" ? (this.hjaelp === 0 ? "Giv hint" : "Vis svaret") : null,
            indsend: true, klar: this.kanSende() });
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
        h += raekke("Eddike (g)", NK.tal2(A.m), NK.tal2(B.m) + (B.spild ? "*" : ""), B.m !== A.m || B.spild > 0);
        h += raekke("Vand (mL)", String(A.vand), String(B.vand), B.vand !== A.vand);
        h += raekke("NaOH (M)", K.c(A.c), K.c(B.c) + (B.cTror !== B.c ? "*" : ""), B.c !== A.c);
        h += raekke("NaOH brugt (mL)", vist ? K.mL(A.v) : "?", vist ? K.mL(B.v) : "?", false);
        h += raekke("Masseprocent (%)", vist ? K.pct(A.procent) : "?", vist ? K.pct(B.procent) : "?", false);
        NK.saetHTML("for-tabel", h);
        var note = "";
        if (B.spild) note = "* Noget af eddiken nåede aldrig kolben, men du regner med " + NK.tal2(B.m) + " g.";
        else if (B.cTror !== B.c) note = "* Du regner med " + K.c(B.cTror) + " M.";
        NK.saetTekst("for-note", note);
    };

    /* Det naeste skridt i kortets linje, naar der ikke staar en besked */
    P.visStatus = function () {
        var t;
        if (this.fase === "vaelg") t = this.valgt < 0 ? "Vælg dit gæt, og tryk på Indsend svar." : "";
        else if (this.fase === "koerer") t = "Begge kolber titreres, til de bliver lyserøde.";
        else t = "";
        if (t !== this.trinTekst) { this.trinTekst = t; this.visKnap(); }
    };

    /* ----- Layout ------------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.12, 40, 80));
        /* Opstillingerne (med skiltet over buretten) begynder under papirkortets plads */
        lay.zone = this.kortZone();
        var topY = lay.zone + 38;
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
        else if (this.kortZone() !== this.lay.zone) this.layout();
    };

    /* Pladsen oeverst i scenen til papirkortet: [almindelig skaerm, lav skaerm] */
    var ZONE = [194, 180];
    P.kortZone = function () { return this.kort ? this.kort.zone(ZONE) : 10 + ZONE[0] + 8; };

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
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegnOpstilling = function (ctx, g, ks, v, navn, aendring, erB) {
        var lay = this.lay, sit = this.sit();
        var koerer = this.fase === "koerer" && v < ks.v - 1e-9;
        var ph = K.ph(ks.pr, v);
        var styrke = K.farveStyrke(ph);
        Tg.stativ(ctx, g);
        Tg.omroerer(ctx, g);
        var mL = ks.vand + ks.pr.m + v;
        var ov = Tg.kolbe(ctx, g, mL, K.kolbeFarve(styrke), this.tid * 9, []);
        if (koerer) Tg.straale(ctx, g, ov, 0.8);
        Tg.buret(ctx, g, v, koerer ? 0.85 : 0, {
            etiket: "NaOH " + K.c(ks.c) + " M",
            etiketFarve: erB && sit && sit.B.c !== undefined ? "#fff0b8" : null,
            tal: g.s > 0.45
        });
        /* Spildt eddike paa bordet */
        if (erB && ks.spild > 0) {
            ctx.save();
            ctx.fillStyle = "rgba(243, 239, 216, 0.35)";
            ctx.strokeStyle = "rgba(243, 239, 216, 0.6)";
            ctx.beginPath();
            ctx.ellipse(g.cx + 95 * g.k, g.bordY + 3, 34 * g.k, 6 * g.k, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        /* Sproejteflasken ved buretten, der blev skyllet med vand */
        if (erB && sit && sit.id === "skyllet") {
            Tg.sproejteflaske(ctx, g.cx + 60 * g.s, g.bordY - 110 * g.k * 0.9, 110 * g.k * 0.9);
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
        if (u.slags !== "A" && u.slags !== "B") return;
        if (this.fase === "vaelg") this.kort.blink();
        if (this.fase === "vist") return;
        if (u.slags === "A") this.besked("Kolbe A er som på fane 1: " + NK.tal2(this.A.m) + " g eddike, " + this.A.vand + " mL vand og NaOH " + K.c(this.A.c) + " M.", "peger");
        else this.besked("Kolbe B: " + NK.html(this.sit().aendring) + ". Resten er som ved kolbe A.", "peger");
    };

    P.tast = function (e) {
        if (this.fase === "vaelg" && /^[1-3]$/.test(e.key) && e.shiftKey) { this.vaelg(parseInt(e.key, 10) - 1); return true; }
        return false;
    };

    P.enter = function () {
        if (this.fase === "vist") this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.4-intro-forbrug", tilbud: "for-tilbud" });

    NK.SimForbrug = SimForbrug;
}());
