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

    /* Eleven vaelger et svar; saa titreres der */
    P.vaelg = function (i) {
        var sit = this.sit();
        if (!sit || this.fase !== "vaelg") return;
        if (this.afvisTilbud) this.afvisTilbud();
        this.valgt = i;
        if (this.forste === -1) this.forste = i;
        this.bygValg();
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

    P.vis = function () {
        var sit = this.sit();
        this.fase = "vist";
        this.koert = true;
        var rigtig = this.valgt === sit.rigtig;
        if (this.forste === sit.rigtig && !this.talt) { this.rigtige++; }
        this.talt = true;
        var t = rigtig ? "Rigtigt. " + sit.efter :
            NK.html(sit.forkert[this.valgt]) + " <b>Svar:</b> " + NK.html(sit.efter);
        this.besked(rigtig ? NK.html(t) : t, rigtig ? "god" : "skidt");
        if (this.nr >= D.SITUATIONER.length - 1) {
            this.besked(this.el.besked.innerHTML + "<br><b>" + this.rigtige + " af " + D.SITUATIONER.length +
                " rigtige gæt i første forsøg.</b>", rigtig ? "god" : "skidt");
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

    /* ----- Knappen: Giv hint -> Vis svaret -> Naeste -------------------------------------- */
    P.knap = function () {
        var sit = this.sit();
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
            return;
        }
        if (this.fase === "koerer") return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(sit.hint), "gul");
            this.visKort();
            return;
        }
        if (this.forste < 0) this.forste = -2;   /* svaret er vist: taeller ikke som rigtigt */
        this.vaelg(sit.rigtig);
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
        this.el = {
            knap: NK.el("for-knap"),
            besked: NK.el("for-besked"),
            kort: NK.el("for-kort"),
            valg: NK.el("for-valg")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("for-spring").addEventListener("click", function () { mig.springIntro(); });
        NK.el("for-nulstil").addEventListener("click", function () { mig.nulstil(); });
    };

    P.bygValg = function () {
        var mig = this, sit = this.sit(), vaert = this.el.valg;
        vaert.innerHTML = "";
        if (!sit) return;
        var rad = document.createElement("div");
        rad.className = "vaelgerrad";
        sit.valg.forEach(function (tekst, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "vaelger";
            b.textContent = tekst;
            if (mig.fase === "vist") {
                if (i === sit.rigtig) b.className += " rigtig";
                else if (i === mig.valgt) b.className += " forkert";
                b.disabled = true;
            } else if (i === mig.valgt) {
                b.className += " valgt";
                b.disabled = true;
            } else if (mig.fase === "koerer") b.disabled = true;
            b.addEventListener("click", function () { mig.vaelg(i); });
            rad.appendChild(b);
        });
        vaert.appendChild(rad);
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visKort = function () {
        var sit = this.sit();
        NK.saetTekst("for-nr", String(this.nr + 1));
        NK.saetTekst("for-ialt", String(D.SITUATIONER.length));
        NK.saetTekst("for-prompt", sit ? sit.tekst : "");
        var tekst, klasse = "knap";
        if (this.fase === "vist") {
            tekst = this.nr >= D.SITUATIONER.length - 1 ? "Tag en ny prøve →" : "Næste →";
            klasse = "knap blaa banker";
        } else if (this.fase === "koerer") tekst = "Kemichael titrerer …";
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = this.fase === "koerer";
        this.el.kort.classList.toggle("sejr", this.fase === "vist" && this.valgt === (sit && sit.rigtig));
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

    P.visStatus = function () {
        var t;
        if (this.fase === "vaelg") t = "Kolbe B er ændret: <b>" + NK.html(this.sit().aendring) + "</b>. Vælg dit gæt til højre.";
        else if (this.fase === "koerer") t = "Kemichael titrerer begge kolber, til de bliver lyserøde.";
        else t = "Kolbe A brugte " + K.mL(this.A.v) + " mL NaOH og kolbe B " + K.mL(this.B.v) + " mL.";
        NK.saetHTML("for-status", t);
    };

    /* ----- Layout ------------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.12, 40, 80));
        var topY = NK.klamp(H * 0.03, 8, 24) + 44;
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
        if (u.slags === "A") NK.saetHTML("for-status", "Kolbe A er som på fane 1: " + NK.tal2(this.A.m) + " g eddike, " + this.A.vand + " mL vand og NaOH " + K.c(this.A.c) + " M.");
        if (u.slags === "B") NK.saetHTML("for-status", "Kolbe B: <b>" + NK.html(this.sit().aendring) + "</b>. Resten er som ved A.");
    };

    P.tast = function (e) {
        if (this.fase === "vaelg" && /^[1-3]$/.test(e.key) && e.shiftKey) { this.vaelg(parseInt(e.key, 10) - 1); return true; }
        return false;
    };

    P.enter = function () {
        if (this.fase === "vist") this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.4-intro-forbrug", tilbud: "for-tilbud", spring: "for-spring" });

    P.pegPaaFelt = function (til) { this.el.valg.classList.toggle("peg", !!til); };

    NK.SimForbrug = SimForbrug;
}());
