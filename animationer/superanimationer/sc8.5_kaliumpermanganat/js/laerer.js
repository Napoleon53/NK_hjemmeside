/* =====================================================================
   laerer.js - Kemichael ved katederet (den rolige udgave, som sc4.5 og sc5.1)

   I denne animation gaar Kemichael ikke ind og ud af scenen. Han sidder
   stille bag sit kateder i scenens nederste venstre hjoerne med kaffen
   foran sig, og han blander sig ikke: han siger kun noget, naar eleven
   trykker Giv hint eller Vis svaret (eller K). Boblen staar fast til
   hoejre for ham og lukker igen, naar delopgaven er loest. Naeste skridt,
   fejl og ros staar i opgavekortet i panelet, ikke hos ham (brugerens
   valg 25. sept. 2026).

   Knappen i scenens hjoerne sender ham ud. Saa staar katederet tomt med
   en seddel, og hintene staar i opgavekortet i stedet. Samme knap (eller
   et klik paa sedlen) henter ham igen. Valget gaelder begge faner og
   huskes i browseren.

   Figuren er den faelles fra ../../v2/kemichael/ (K.tegneserieFigur),
   saa han ser ud som alle andre steder. Det eneste, der bevaeger sig, er
   oejnene (han blinker), brynene og brillerne (han kigger op over dem,
   naar han siger noget) og armen, naar eleven klikker paa koppen. Klik
   paa ham giver et kort svar fra de faelles prik-puljer, som forsvinder
   igen efter fire sekunder.

   Brug (én pr. fane):
     this.k = new NK.RoligLaerer({ boble: "kar-boble", knap: "kar-kknap" });
     var baand = this.k.layout(W, H);   // { y, h }: det nederste baand
     this.k.sig(html, slags, valg);     // kun hint og svar; giver false, naar han er ude
     this.k.tie();                      // delopgaven er loest
     this.k.opdater(dt); this.k.tegn(ctx);
     this.k.klik(pt) / this.k.hover(pt)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    var MK = NK.Sprites.MAAL.kateder;

    /* Figurens maal i dens egne enheder (se kemichael.js): issen ligger 336
       over gulvet, og katederets plade skaerer ham 140 over gulvet, lige
       under navneskiltet. Munden er (0, -247). */
    var ISSE = 336, PLADE = 140;
    var MUND = { x: 0, y: -247 };
    var HAENGER = K ? K.HAENGER : 2.9;
    var ARM_KOP = HAENGER + 1.52;    /* ned og om foran brystet, hvor koppen staar */
    var ARM_MUND = HAENGER + 2.5;    /* op til munden */
    var GAA_TID = 1.8;               /* sekunder, han siger farvel, foer han er vaek */

    /* Udtrykket for hver slags replik */
    var UDTRYK = {
        "": { humoer: 0.15, skeptisk: 0, briller: 0, vrede: 0 },
        god: { humoer: 0.75, skeptisk: 0, briller: 0, vrede: 0 },
        skidt: { humoer: -0.1, skeptisk: 0.7, briller: 0.2, vrede: 0 },
        hint: { humoer: 0.25, skeptisk: 0, briller: 0.55, vrede: 0 },
        svar: { humoer: 0.1, skeptisk: 0.25, briller: 0.35, vrede: 0 }
    };

    /* Ude eller inde gaelder begge faner */
    var NOEGLE_UDE = "nk-sc8.5-kemichael-ude";
    var faelles = { ude: !!NK.hent(NOEGLE_UDE, false) };
    var alle = [];

    function RoligLaerer(o) {
        var mig = this;
        this.boble = NK.el(o.boble);
        this.tekstEl = this.boble ? this.boble.querySelector(".kb-tekst") : null;
        this.knap = o.knap ? NK.el(o.knap) : null;
        this.linje = { html: "", slags: "" };
        this.midl = null;
        this.vist = null;
        this.lukVedSkriv = false;
        this.u = { humoer: 0.15, skeptisk: 0, briller: 0, vrede: 0, roed: 0 };
        this.kig = 0;               /* sekunder, han endnu kigger op over brillerne */
        this.blinkNaeste = 2.5 + Math.random() * 3;
        this.blink = 0;
        this.arm = HAENGER;
        this.slurk = null;          /* { t } mens han drikker */
        this.prik = 0;
        this.prikTid = 0;
        this.tid = 0;
        this.lay = null;
        this.overKop = false;
        this.overHam = false;
        this.overSeddel = false;
        this.gaar = 0;              /* sekunder til han er vaek, mens han siger farvel */
        this.synlig = faelles.ude ? 0 : 1;
        if (this.knap) this.knap.addEventListener("click", function () { if (faelles.ude) mig.hentInd(); else mig.sendUd(); });
        alle.push(this);
        this.visKnap();
    }

    var P = RoligLaerer.prototype;

    RoligLaerer.ude = function () { return faelles.ude; };

    P.inde = function () { return !faelles.ude; };

    /* ----- Layout ----------------------------------------------------------------
       Baandet i bunden af scenen: katederet med ham til venstre og boblen
       til hoejre for hovedet. Giver { y, h }. */
    P.layout = function (W, H) {
        var hB = Math.round(NK.klamp(H * 0.19, 92, 150));
        var y = H - hB;
        var kant = NK.klamp(W * 0.014, 8, 16);
        var bordY = y + Math.round(hB * 0.7);                 /* pladens overflade */
        var s = (bordY - y - 5) / (ISSE - PLADE);             /* figurens skala */
        var gulv = bordY + PLADE * s;
        var deskB = Math.round(NK.klamp(440 * s, 150, 260));
        var ky = (H + 2 - bordY) / (MK.h - MK.flade);
        var x0 = kant;
        var cx = x0 + deskB * 0.34;
        var lay = { W: W, H: H, y: y, h: hB, s: s, gulv: gulv, bordY: bordY, cx: cx,
            desk: { x: x0, y: bordY - MK.flade * ky, b: deskB, h: MK.h * ky } };
        /* Koppen staar paa pladen foran ham, der hvor haanden naar ned (ARM_KOP) */
        lay.kop = { x: cx - 36 * s, y: bordY, b: 42 * s, h: 40 * s };
        /* Boblen: fra hovedets hoejre side til scenens kant, over pladen */
        var hoejre = cx + 62 * s;
        var bx = Math.round(hoejre + 16);
        lay.boble = { x: bx, y: y + 6, b: Math.max(120, W - bx - kant), h: Math.max(40, bordY - y - 12) };
        lay.mund = { x: cx + MUND.x * s, y: gulv + MUND.y * s };
        lay.hoved = { x: cx - 58 * s, y: gulv - ISSE * s, b: 116 * s, h: (ISSE - PLADE) * s };
        /* Sedlen paa det tomme kateder */
        var sb = Math.min(deskB * 0.62, 150), sh = NK.klamp(hB * 0.34, 30, 44);
        lay.seddel = { x: cx - sb / 2, y: bordY - sh + 4, b: sb, h: sh };
        this.lay = lay;
        this.placerBoble();
        return { y: y, h: hB };
    };

    P.placerBoble = function () {
        var b = this.boble, lay = this.lay;
        if (!b || !lay) return;
        b.style.left = lay.boble.x + "px";
        b.style.top = lay.boble.y + "px";
        b.style.maxWidth = lay.boble.b + "px";
        b.style.maxHeight = lay.boble.h + "px";
        this.tilpasSkrift();
    };

    /* Skriften bliver mindre, hvis teksten ikke kan vaere i boblen */
    P.tilpasSkrift = function () {
        var b = this.boble, lay = this.lay;
        if (!b || !lay || !this.tekstEl || b.hidden) return;
        var px = 16;
        b.style.fontSize = px + "px";
        while (px > 13 && b.scrollHeight > lay.boble.h + 1) {
            px -= 0.5;
            b.style.fontSize = px + "px";
        }
        /* Halen peger paa munden, hvor boblen end er */
        var r = b.offsetHeight || 40;
        var hy = NK.klamp(lay.mund.y - lay.boble.y, 14, Math.max(14, r - 14));
        b.style.setProperty("--hale", Math.round(hy) + "px");
    };

    /* ----- Replikkerne ----------------------------------------------------------------
       sig: et hint eller svaret, som eleven har bedt om. Det staar, til
       delopgaven er loest (tie), eller, med valg.lukVedSkriv, til eleven
       begynder at skrive igen. Giver false, naar han er sendt ud; saa
       skal fanen vise teksten et andet sted.
       svar: et kort svar paa et klik paa ham eller koppen; det forsvinder
       efter sek sekunder. */
    P.sig = function (html, slags, valg) {
        if (faelles.ude || this.gaar > 0) return false;
        this.linje = { html: html || "", slags: slags || "" };
        this.lukVedSkriv = !!(valg && valg.lukVedSkriv);
        this.midl = null;
        this.vis(this.linje);
        return true;
    };

    P.tie = function () {
        this.linje = { html: "", slags: "" };
        this.lukVedSkriv = false;
        if (!this.midl) this.vis(this.linje);
    };

    /* Eleven skriver i et felt: et vist svar lukker */
    P.skriver = function () { if (this.lukVedSkriv) this.tie(); };

    P.svar = function (html, slags, sek) {
        this.midl = { html: html, slags: slags || "", t: sek || Math.max(3.5, 1.6 + String(html).length * 0.06) };
        this.vis(this.midl);
    };

    P.vis = function (l) {
        if (this.vist && this.vist.html === l.html && this.vist.slags === l.slags) return;
        var ny = !this.vist || this.vist.html !== l.html;
        this.vist = { html: l.html, slags: l.slags };
        if (!this.boble || !this.tekstEl) return;
        var b = this.boble, t = this.tekstEl;
        b.className = "kboble" + (l.slags ? " " + l.slags : "");
        if (ny) {
            b.classList.add("skift");
            t.innerHTML = l.html;
            void b.offsetWidth;
            b.classList.remove("skift");
            this.kig = l.html ? 1.6 : 0;
        }
        b.hidden = !l.html;
        this.tilpasSkrift();
    };

    P.tekst = function () { return this.tekstEl && this.boble && !this.boble.hidden ? this.tekstEl.textContent : ""; };
    P.taler = function () { return !!(this.boble && !this.boble.hidden); };

    /* ----- Send ud og hent ind -------------------------------------------------------- */
    P.sendUd = function () {
        if (faelles.ude) return;
        faelles.ude = true;
        NK.gem(NOEGLE_UDE, true);
        this.linje = { html: "", slags: "" };
        this.lukVedSkriv = false;
        this.svar(NK.html(D.UD_LINJE), "", GAA_TID);
        this.gaar = GAA_TID;
        alle.forEach(function (l) { l.visKnap(); });
        if (RoligLaerer.vedSkift) RoligLaerer.vedSkift(true);
    };

    P.hentInd = function () {
        if (!faelles.ude) return;
        faelles.ude = false;
        NK.gem(NOEGLE_UDE, false);
        this.gaar = 0;
        this.svar(NK.html(D.IND_LINJE), "", 3);
        alle.forEach(function (l) { l.visKnap(); });
        if (RoligLaerer.vedSkift) RoligLaerer.vedSkift(false);
    };

    P.visKnap = function () {
        if (!this.knap) return;
        this.knap.textContent = faelles.ude ? "Hent Kemichael" : "Send Kemichael ud";
        this.knap.classList.toggle("ude", faelles.ude);
        this.knap.title = faelles.ude ? "Kemichael kommer tilbage og giver hint, når du beder om det" :
            "Kemichael går på lærerværelset. Hintene står så i opgavekortet";
    };

    /* ----- Tid ------------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.midl) {
            this.midl.t -= dt;
            if (this.midl.t <= 0) { this.midl = null; this.vis(this.linje); }
        }
        /* Ude: han siger farvel og forsvinder; inde: han kommer frem igen */
        if (this.gaar > 0) this.gaar = Math.max(0, this.gaar - dt);
        var maal = faelles.ude && this.gaar <= 0 ? 0 : 1;
        this.synlig = NK.klamp(this.synlig + (maal > this.synlig ? 1 : -1) * dt / 0.45, 0, 1);
        if (faelles.ude && this.gaar <= 0 && !this.midl && this.vist && this.vist.html) this.vis({ html: "", slags: "" });
        this.kig = Math.max(0, this.kig - dt);
        if (this.prikTid > 0) { this.prikTid -= dt; if (this.prikTid <= 0) this.prik = 0; }
        /* Blink */
        this.blinkNaeste -= dt;
        if (this.blinkNaeste <= 0) { this.blink = 0.13; this.blinkNaeste = 2.8 + Math.random() * 4; }
        this.blink = Math.max(0, this.blink - dt);
        /* Udtrykket glider mod det, replikken kalder paa */
        var slags = this.vist ? this.vist.slags : "";
        var m = UDTRYK[slags] || UDTRYK[""];
        var mig = this;
        ["humoer", "skeptisk", "vrede"].forEach(function (n) { mig.u[n] = NK.mod(mig.u[n], m[n], 4, dt); });
        var br = this.kig > 0 ? Math.max(m.briller, 0.55) : m.briller * 0.5;
        this.u.briller = NK.mod(this.u.briller, br, 5, dt);
        this.u.roed = NK.mod(this.u.roed, this.prik >= 4 ? 0.6 : 0, 3, dt);
        /* Slurken: armen ned efter koppen, op til munden, og tilbage */
        if (this.slurk) {
            var s = this.slurk;
            s.t += dt;
            var t = s.t;
            if (t < 0.55) this.arm = NK.lerp(HAENGER, ARM_KOP, NK.blod(t / 0.55));
            else if (t < 1.1) this.arm = NK.lerp(ARM_KOP, ARM_MUND, NK.blod((t - 0.55) / 0.55));
            else if (t < 2.1) this.arm = ARM_MUND;
            else if (t < 2.6) this.arm = NK.lerp(ARM_MUND, ARM_KOP, NK.blod((t - 2.1) / 0.5));
            else if (t < 3.1) this.arm = NK.lerp(ARM_KOP, HAENGER, NK.blod((t - 2.6) / 0.5));
            else { this.arm = HAENGER; this.slurk = null; }
            s.iHaand = t >= 0.5 && t < 2.65;
        }
    };

    /* Armens vinkel, som figuren vil have den: mellem -pi og pi */
    function norm(v) {
        while (v > Math.PI) v -= 2 * Math.PI;
        while (v < -Math.PI) v += 2 * Math.PI;
        return v;
    }

    /* ----- Tegning ----------------------------------------------------------------------- */
    P.tegn = function (ctx) {
        var lay = this.lay;
        if (!lay) return;
        var s = lay.s;
        ctx.save();
        /* Baandet: et moerkt gulv under resten af scenen */
        var g = ctx.createLinearGradient(0, lay.y, 0, lay.H);
        g.addColorStop(0, "#17181f");
        g.addColorStop(1, "#101117");
        ctx.fillStyle = g;
        ctx.fillRect(0, lay.y, lay.W, lay.h);
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(0, lay.y, lay.W, 1.5);
        /* Figuren. Kun det over pladen ses, saa den klippes der, hvor
           katederet ikke daekker (armen kan gaa ned bag pladen). */
        if (K && NK.Sprites.klar("laererKrop") && this.synlig > 0.01) {
            ctx.save();
            ctx.globalAlpha *= this.synlig;
            ctx.beginPath();
            ctx.rect(0, lay.y + 1, lay.W, lay.bordY - lay.y + 2);
            ctx.clip();
            var arm = norm(this.arm);
            var slurk = this.slurk;
            K.tegneserieFigur(ctx, {
                x: lay.cx, gulv: lay.gulv, skala: s, arm: arm,
                udtryk: { humoer: this.u.humoer, skeptisk: this.u.skeptisk, vrede: this.u.vrede, roed: this.u.roed,
                    briller: this.u.briller, lukket: this.blink > 0 ? 1 : 0 },
                haand: function (c, hd) {
                    if (!slurk || !slurk.iHaand) return;
                    NK.Sprites.tegn(c, "kaffekop", hd.x - 20, hd.y - 30, 42, 40);
                }
            });
            ctx.restore();
        }
        /* Katederet foran ham */
        NK.Sprites.tegn(ctx, "kateder", lay.desk.x, lay.desk.y, lay.desk.b, lay.desk.h);
        /* Koppen paa pladen (han tager den med, naar han gaar) */
        if (!(this.slurk && this.slurk.iHaand) && this.synlig > 0.01) {
            var k = lay.kop;
            ctx.save();
            ctx.globalAlpha *= this.synlig;
            if (this.overKop) {
                ctx.fillStyle = "rgba(242, 197, 61, 0.28)";
                ctx.beginPath();
                ctx.ellipse(k.x, k.y - k.h * 0.45, k.b * 0.75, k.h * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            NK.Sprites.tegn(ctx, "kaffekop", k.x - k.b * 18 / 42, k.y - k.h, k.b, k.h);
            ctx.restore();
        }
        /* Sedlen paa det tomme kateder */
        if (this.synlig < 0.99) this.tegnSeddel(ctx, 1 - this.synlig);
        ctx.restore();
    };

    P.tegnSeddel = function (ctx, alfa) {
        var r = this.lay.seddel;
        ctx.save();
        ctx.globalAlpha *= alfa;
        ctx.translate(r.x + r.b / 2, r.y + r.h / 2);
        ctx.rotate(-0.04);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(-r.b / 2 + 3, -r.h / 2 + 4, r.b, r.h);
        ctx.fillStyle = this.overSeddel ? "#fff6c4" : "#f6f1dc";
        ctx.fillRect(-r.b / 2, -r.h / 2, r.b, r.h);
        ctx.fillStyle = "#c0392b";
        ctx.beginPath();
        ctx.arc(0, -r.h / 2 + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2a2f36";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var px = NK.passendeSkrift(ctx, "På lærerværelset", r.b - 12, NK.klamp(r.h * 0.38, 12, 15), 11, "700");
        ctx.fillText("På lærerværelset", 0, -px * 0.35 + 2);
        ctx.font = "italic 600 " + Math.max(11, px - 2) + "px 'Segoe UI', sans-serif";
        ctx.fillStyle = "#5a6270";
        if (r.h >= 34) ctx.fillText("M.", r.b / 2 - 14, r.h / 2 - 8);
        ctx.restore();
    };

    /* ----- Musen ------------------------------------------------------------------------------ */
    P.under = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (faelles.ude) {
            var r = lay.seddel;
            if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return "seddel";
            return null;
        }
        var k = lay.kop;
        if (pt.x >= k.x - k.b * 0.6 && pt.x <= k.x + k.b * 0.7 && pt.y >= k.y - k.h * 1.2 && pt.y <= k.y + 4) return "kop";
        var h = lay.hoved;
        if (pt.x >= h.x && pt.x <= h.x + h.b && pt.y >= h.y && pt.y <= lay.bordY) return "laerer";
        return null;
    };

    P.hover = function (pt) {
        var u = pt ? this.under(pt) : null;
        this.overKop = u === "kop";
        this.overHam = u === "laerer";
        this.overSeddel = u === "seddel";
        return u;
    };

    P.klik = function (pt) {
        var u = this.under(pt);
        if (u === "kop") { this.kaffe(); return true; }
        if (u === "laerer") { this.prikket(); return true; }
        if (u === "seddel") { this.hentInd(); return true; }
        return false;
    };

    /* Klik paa ham: stadig kortere svar fra de faelles puljer. Svaret
       forsvinder efter fire sekunder. Efter 20 sekunder er det glemt. */
    P.prikket = function () {
        if (this.gaar > 0) return;
        this.prik++;
        this.prikTid = 20;
        var t = null;
        if (this.prik === 1 && K && K.glimt) t = K.glimt("navn");
        if (!t && this.prik <= 4 && K && K.replik) t = K.replik("prik" + this.prik);
        if (!t) t = D.PRIK_SIDST;
        this.svar(NK.html(t), this.prik >= 3 ? "skidt" : "", 4);
    };

    /* Klik paa koppen: han drikker og siger noget om kaffen */
    P.kaffe = function () {
        if (this.slurk || this.gaar > 0) return;
        this.slurk = { t: 0, iHaand: false };
        var t = K && K.glimt ? K.glimt("kaffeKold") : null;
        if (!t) {
            this.kaffeNr = ((this.kaffeNr === undefined ? Math.floor(Math.random() * D.KAFFE.length) : this.kaffeNr) + 1) % D.KAFFE.length;
            t = D.KAFFE[this.kaffeNr];
        }
        this.svar(NK.html(t), "", 4.2);
    };

    NK.RoligLaerer = RoligLaerer;
}());
