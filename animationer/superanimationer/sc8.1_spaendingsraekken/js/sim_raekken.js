/* =====================================================================
   sim_raekken.js - fane 2: raekken

   Seks kort ligger paa bordet: de fem metaller fra forsoeget og
   hydrogen. Eleven traekker dem op paa hylden, der gaar fra uaedel til
   aedel, med skemaet fra fane 1 i panelet. Naar alle seks staar paa
   hylden, tjekkes raekkefoelgen. Er den forkert, bliver to kort, der
   staar forkert i forhold til hinanden, roede, og beskeden siger hvorfor
   ud fra skemaet. Er den rigtig, kommer bogens spaendingsraekke frem
   foroven, og de seks faar deres pladser i den.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE_ROS = "nk-sc8.1-ros-raekken";

    function SimRaekken() {
        this.L = new NK.Laerred(NK.el("rk-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.afsloer = 0;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        var mig = this;
        NK.Skema.lyttere.push(function () { mig.visSkema(); });
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyRunde();
    }

    var P = SimRaekken.prototype;

    /* Den rigtige raekkefoelge: efter E° */
    P.facit = function () {
        return D.RAEKKEN.slice().sort(function (a, b) { return K.STOF[a].E - K.STOF[b].E; });
    };

    P.nyRunde = function () {
        /* Kortene i en blandet raekkefoelge paa bordet, aldrig den rigtige */
        var orden, facit = this.facit().join();
        do { orden = NK.bland(D.RAEKKEN); } while (orden.join() === facit);
        this.kort = orden.map(function (sym, n) {
            return { sym: sym, hjemNr: n, plads: -1, x: 0, y: 0, bane: null };
        });
        this.pladser = [null, null, null, null, null, null];
        this.fase = "stil";
        this.hjaelp = 0;
        this.fejlPar = null;
        this.afsloer = 0;
        this.besked("", "");
        if (this.lay) this.stilKort(true);
        this.visKort();
        this.visSkema();
    };

    P.nulstil = function () { this.nyRunde(); };

    /* ----- Kortene ------------------------------------------------------------------ */
    P.kortPos = function (k) {
        var lay = this.lay;
        if (k.plads >= 0) {
            var p = lay.pladser[k.plads];
            return { x: p.x - lay.kb / 2, y: p.y };
        }
        return { x: lay.hjem[k.hjemNr] - lay.kb / 2, y: lay.bordY - lay.kh - 6 };
    };

    /* Alle kort hen, hvor de hoerer til (straks: uden at glide) */
    P.stilKort = function (straks) {
        var mig = this;
        this.kort.forEach(function (k) {
            var p = mig.kortPos(k);
            if (straks) { k.x = p.x; k.y = p.y; k.bane = null; }
            else k.bane = p;
        });
    };

    P.saetPaa = function (k, plads) {
        if (this.fase !== "stil") return;
        if (this.afvisTilbud) this.afvisTilbud();
        var fra = k.plads;
        var anden = this.pladser[plads];
        if (fra >= 0) this.pladser[fra] = null;
        if (anden && anden !== k) {
            /* Byt: den anden faar kortets gamle plads, eller gaar hjem */
            anden.plads = fra;
            if (fra >= 0) this.pladser[fra] = anden;
            anden.bane = this.kortPos(anden);
        }
        k.plads = plads;
        this.pladser[plads] = k;
        k.bane = this.kortPos(k);
        this.fejlPar = null;
        this.tjek();
    };

    P.hjem = function (k) {
        if (this.fase !== "stil") return;
        if (k.plads >= 0) this.pladser[k.plads] = null;
        k.plads = -1;
        k.bane = this.kortPos(k);
        this.fejlPar = null;
        this.besked("", "");
        this.visKort();
    };

    P.antalPaa = function () {
        return this.pladser.filter(function (k) { return !!k; }).length;
    };

    /* ----- Tjekket ------------------------------------------------------------------ */
    P.tjek = function () {
        this.visKort();
        if (this.antalPaa() < 6) { this.besked("", ""); return; }
        var orden = this.pladser.map(function (k) { return k.sym; });
        if (orden.join() === this.facit().join()) {
            this.faerdig(this.hjaelp < 2);
            return;
        }
        /* Det foerste par ved siden af hinanden, der staar forkert */
        for (var n = 0; n < 5; n++) {
            var l = orden[n], r = orden[n + 1];
            if (K.STOF[r].E < K.STOF[l].E) {
                this.fejlPar = [l, r];
                var set;
                if (l === "H") set = NK.Skema.get(r, "H") !== undefined;
                else if (r === "H") set = NK.Skema.get(l, "H") !== undefined;
                else set = NK.Skema.get(r, l) !== undefined;
                this.besked(NK.html(D.rkForkert(l, r, set)), "skidt");
                break;
            }
        }
        this.visKort();
    };

    P.faerdig = function (egen) {
        this.fase = "faerdig";
        this.fejlPar = null;
        this.besked(NK.html(D.RK_FAERDIG), "god");
        if (egen && !NK.hent(NOEGLE_ROS, false)) {
            NK.gem(NOEGLE_ROS, true);
            this.ventRos = 1.6;
        }
        this.visKort();
    };

    /* Knappen: Giv hint -> Vis svaret -> Til Forudsig */
    P.knap = function () {
        if (this.fase === "faerdig") {
            if (NK.visFane) NK.visFane("fane-forudsig");
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(D.RK_HINT), "gul");
            this.visKort();
            this.visSkema();
            return;
        }
        this.hjaelp = 2;
        var facit = this.facit(), mig = this;
        this.pladser = [null, null, null, null, null, null];
        this.kort.forEach(function (k) {
            k.plads = facit.indexOf(k.sym);
            mig.pladser[k.plads] = k;
        });
        this.stilKort(false);
        this.faerdig(false);
    };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("rk-knap"),
            besked: NK.el("rk-besked"),
            kort: NK.el("rk-kort")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("rk-spring").addEventListener("click", function () { mig.springIntro(); });
        NK.el("rk-nulstil").addEventListener("click", function () { mig.nulstil(); });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visKort = function () {
        NK.saetTekst("rk-taeller", this.antalPaa() + "/6 på hylden");
        NK.saetTekst("rk-prompt", this.fase === "faerdig" ? "Sådan står de i spændingsrækken." : D.RK_PROMPT);
        var tekst, klasse = "knap";
        if (this.fase === "faerdig") { tekst = "Til Forudsig →"; klasse = "knap blaa banker"; }
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.fase === "faerdig");
    };

    P.visSkema = function () {
        var S = NK.Skema;
        NK.saetHTML("rk-skema", NK.skemaHTML({ taelle: this.hjaelp >= 1 }));
        NK.saetTekst("rk-antal", String(S.antal()));
        var mangler = S.ialt - S.antal();
        NK.saetTekst("rk-note", mangler > 0 ? "Skemaet mangler " + mangler + " forsøg. Dem kan du lave på fane 1." : "");
    };

    /* Kaldes, naar fanen vises: skemaet kan vaere aendret paa fane 1 */
    P.vises = function () { this.visSkema(); };

    P.visStatus = function () {
        var t;
        if (this.traek && this.traek.flyttet) t = "Slip kortet på en plads på hylden.";
        else if (this.fase === "faerdig") t = "Rækken foroven er spændingsrækken, som den står i bogen.";
        else if (this.fejlPar) t = "Ikke rigtigt endnu. Se på de to røde kort.";
        else if (this.antalPaa() === 0) t = "Træk kortene op på hylden, fra uædel til ædel.";
        else t = "Træk resten op. Kort på hylden kan flyttes igen.";
        NK.saetHTML("rk-status", t);
    };

    /* ----- Layout ---------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.1, 36, 64));
        lay.kop = { x: kant + 22, y: lay.bordY };
        var rk = kant + Tg.RAEKKE_KANT;
        lay.raekke = { x: rk, y: 72, b: W - 2 * rk, h: NK.klamp(H * 0.06, 28, 42) };
        var kb = NK.klamp(Math.min((W - 2 * kant - 60) / (6 * 1.25), H * 0.15), 58, 116);
        var kh = kb * 1.28;
        lay.kb = kb;
        lay.kh = kh;
        var plankeY = Math.max(lay.raekke.y + lay.raekke.h + 56 + kh + 8, H * 0.5);
        /* Er der ikke plads under hylden til kortene, rykker den op */
        plankeY = Math.min(plankeY, lay.bordY - kh - 70);
        var x0 = kant + 64, x1 = W - kant - 10;
        var sp = (x1 - x0) / 6;
        lay.hylde = { x0: x0 - 10, x1: x1, y: plankeY, pladser: [] };
        lay.pladser = [];
        for (var n = 0; n < 6; n++) {
            var p = { x: x0 + sp * (n + 0.5), y: plankeY - kh - 5, b: kb + 10, h: kh + 3 };
            lay.pladser.push(p);
            lay.hylde.pladser.push(p);
        }
        lay.hjem = [];
        for (n = 0; n < 6; n++) lay.hjem.push(x0 + sp * (n + 0.5));
        lay.px = NK.klamp(Math.round(kb * 0.15), 12, 15);
        this.lay = lay;
        this.stilKort(true);
        this.saetAnker("rk-anker-hylde", x0 - 12, plankeY - kh - 10, x1 - x0 + 24, kh + 60);
        this.saetAnker("rk-anker-kort", x0 - 12, lay.bordY - kh - 12, x1 - x0 + 24, kh + 14);
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

    /* ----- Opdater og tegn -------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        this.kort.forEach(function (k) {
            if (!k.bane) return;
            k.x = NK.mod(k.x, k.bane.x, 14, dt);
            k.y = NK.mod(k.y, k.bane.y, 14, dt);
            if (Math.abs(k.x - k.bane.x) < 0.5 && Math.abs(k.y - k.bane.y) < 0.5) {
                k.x = k.bane.x;
                k.y = k.bane.y;
                k.bane = null;
            }
        });
        if (this.fase === "faerdig") this.afsloer = Math.min(1, this.afsloer + dt / 0.8);
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererReplik) this.laererReplik(D.ROS_RAEKKEN, true);
        }
        this.visStatus();
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Bogens raekke, naar raekken er rigtig */
        if (this.afsloer > 0) {
            var lys = {};
            D.RAEKKEN.forEach(function (s) { lys[s] = true; });
            var midter = Tg.raekke(ctx, lay.raekke, K.RAEKKE, { alfa: this.afsloer, lys: lys });
            /* Linjer fra kortene op til deres plads i raekken */
            ctx.save();
            ctx.globalAlpha = this.afsloer;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.55)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            this.kort.forEach(function (k) {
                var m = midter[k.sym];
                if (!m || k.plads < 0) return;
                ctx.beginPath();
                ctx.moveTo(m.x, lay.raekke.y + lay.raekke.h + 2);
                ctx.lineTo(k.x + lay.kb / 2, k.y - 2);
                ctx.stroke();
            });
            ctx.restore();
        }

        /* Hylden med pladserne */
        var over = this.traek && this.traek.flyttet ? this.pladsUnder(this.traek.pt) : -1;
        lay.hylde.pladser.forEach(function (p, n) { p.lys = n === over; });
        Tg.hylde(ctx, lay.hylde, lay.px);

        /* Kemichael staar bag kortene, saa de kan ses og gribes, mens han taler */
        if (this.laererTegnOver) this.laererTegnOver(ctx);

        /* Kortene: det, der holdes, oeverst */
        var holdt = this.traek && this.traek.flyttet ? this.traek.k : null;
        this.kort.forEach(function (k) {
            if (k === holdt) return;
            mig.tegnKort(ctx, k);
        });
        if (holdt) this.tegnKort(ctx, holdt, true);
    };

    P.tegnKort = function (ctx, k, loeftet) {
        var lay = this.lay;
        var fejl = !!(this.fejlPar && this.fejlPar.indexOf(k.sym) >= 0);
        var hover = this.over && this.over.slags === "kort" && this.over.k === k;
        var lys = hover || loeftet || (this.pegKort && k.plads < 0 && Math.sin(this.tid * 6) > -0.2);
        Tg.kort(ctx, { x: k.x, y: k.y, b: lay.kb, h: lay.kh }, k.sym, K.navn(k.sym), {
            px: lay.px, fejl: fejl, ok: this.fase === "faerdig", lys: lys, loeftet: loeftet
        });
    };

    /* ----- Musen --------------------------------------------------------------------------------- */
    P.kortUnder = function (pt) {
        var lay = this.lay;
        for (var n = this.kort.length - 1; n >= 0; n--) {
            var k = this.kort[n];
            if (pt.x >= k.x && pt.x <= k.x + lay.kb && pt.y >= k.y && pt.y <= k.y + lay.kh) return k;
        }
        return null;
    };

    P.pladsUnder = function (pt) {
        var lay = this.lay;
        if (!pt) return -1;
        for (var n = 0; n < lay.pladser.length; n++) {
            var p = lay.pladser[n];
            if (Math.abs(pt.x - p.x) <= (lay.hylde.x1 - lay.hylde.x0) / 12 && pt.y >= p.y - 50 && pt.y <= lay.hylde.y + 30) return n;
        }
        return -1;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        /* Kortene ligger foran Kemichael */
        var k = this.kortUnder(pt);
        if (k) return { slags: "kort", k: k };
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        var p = this.pladsUnder(pt);
        if (p >= 0) return { slags: "plads", n: p };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.fase !== "stil") return;
            var k = mig.kortUnder(pt);
            if (!k) return;
            mig.traek = { k: k, start: pt, pt: pt, dx: k.x - pt.x, dy: k.y - pt.y, flyttet: false };
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), t = mig.traek;
            if (t) {
                t.pt = pt;
                if (!t.flyttet && Math.abs(pt.x - t.start.x) + Math.abs(pt.y - t.start.y) > 6) {
                    t.flyttet = true;
                    if (mig.afvisTilbud) mig.afvisTilbud();
                }
                if (t.flyttet) {
                    t.k.bane = null;
                    t.k.x = pt.x + t.dx;
                    t.k.y = pt.y + t.dy;
                    c.style.cursor = "grabbing";
                }
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = s === "kort" && mig.fase === "stil" ? "grab" : (s === "kop" || s === "laerer" ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) mig.over = null; });
        c.addEventListener("pointercancel", function () {
            if (mig.traek) mig.traek.k.bane = mig.kortPos(mig.traek.k);
            mig.traek = null;
        });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e), t = mig.traek;
            mig.traek = null;
            if (t && t.flyttet) {
                var p = mig.pladsUnder(pt);
                if (p >= 0) mig.saetPaa(t.k, p);
                else mig.hjem(t.k);
                return;
            }
            if (t) { mig.klikKort(t.k); return; }
            mig.klik(pt);
        });
    };

    /* Et klik paa et kort: op paa den foerste ledige plads, eller ned igen */
    P.klikKort = function (k) {
        if (this.fase !== "stil") return;
        if (k.plads >= 0) { this.hjem(k); return; }
        var fri = this.pladser.indexOf(null);
        if (fri >= 0) this.saetPaa(k, fri);
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (u && u.slags === "kop" && this.klikKop) this.klikKop();
    };

    P.tast = function () { return false; };

    P.enter = function () {
        if (this.fase === "faerdig") this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc8.1-intro-raekken", tilbud: "rk-tilbud", spring: "rk-spring" });

    P.pegPaaFelt = function (til) { this.pegKort = til; };

    NK.SimRaekken = SimRaekken;
}());
