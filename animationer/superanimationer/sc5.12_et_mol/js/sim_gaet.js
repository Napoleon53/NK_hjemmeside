/* =====================================================================
   sim_gaet.js - fane 1: Gæt et mol

   Ni gaet med fire svar hver. Eleven gaetter, og saa vokser soejlen op
   ad tierpotens-stigen fra ét stk. til 1 mol, mens de kendte ting lyser
   op, naar soejlen kommer forbi dem. Bagefter zoomer stigen ud, saa alle
   fire svar og 1 mol kan ses paa én gang: saa kan eleven se, hvor langt
   gaettet var fra svaret.

   Faserne: intro (dusin og mol, knappen Start) > spm (gaet, hintknappen)
   > koer (soejlen vokser, kortet er laast) > facit (groent ved et rigtigt
   gaet, blaat ellers, knappen Naeste gaet) > slut (antal rigtige og en
   fjollet titel).

   Laasen: under et gaet sker der intet ved et klik paa stigen, kortet
   blinker. Efter svaret maa eleven klikke paa stigen for at zoome ind og
   ud og traekke den op og ned (se naermere paa det, der er fremme).

   Elevens gaet huskes i browseren (nk-sc5.12-gaet). R starter forfra.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var log10 = NK.Stige.log10;
    var NOEGLE = "nk-sc5.12-gaet";

    var TURTID = 5.2;          /* sekunder fra ét stk. til 1 mol */
    var VENT = 1.1;            /* pause paa toppen, foer stigen zoomer ud */
    var ZOOMTID = 1.4;

    var TAL = ["nul", "én", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti", "elleve", "tolv"];

    function vaerdi(q) { return q.en * D.NA; }

    function blid(t) {
        t = NK.klamp(t, 0, 1);
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /* Et antal i stigens tal: 1, 10, 100, 1000, saa potensform */
    function antalTekst(N) {
        if (N < 9999.5) return String(Math.round(N));
        return NK.potens(N, 2);
    }

    function gangeTekst(k) {
        var a = Math.abs(k);
        if (a === 1) return "10";
        if (a === 2) return "100";
        if (a === 3) return "1000";
        return "10" + NK.haevet(a);
    }

    NK.SimGaet = function () {
        var mig = this;
        this.L = new NK.Laerred(NK.el("g-laerred"));
        this.stige = new NK.Stige();
        this.kort = new NK.Kort("g", {
            valg: function (i) { mig.svarValg(i); },
            videre: function () { mig.videre(); },
            knap: function () { mig.knap(); }
        });
        this.tid = 0;
        this.svar = NK.hent(NOEGLE, {}) || {};
        this.bygListe();
        this.koblMus();
        if (this.antalSvar() === 0) {
            this.nr = 0;
            this.intro();
        } else {
            var i = this.foersteUbesvarede();
            if (i < 0) this.slut(); else this.vaelg(i);
        }
    };

    var P = NK.SimGaet.prototype;

    /* ----- Tilstanden ------------------------------------------------------ */
    P.antalSvar = function () {
        var mig = this;
        return D.GAET.filter(function (q) { return mig.svar[q.id] !== undefined; }).length;
    };

    P.antalRigtige = function () {
        var mig = this;
        return D.GAET.filter(function (q) { return mig.svar[q.id] === q.ret; }).length;
    };

    P.foersteUbesvarede = function () {
        for (var i = 0; i < D.GAET.length; i++) if (this.svar[D.GAET[i].id] === undefined) return i;
        return -1;
    };

    P.q = function () { return D.GAET[this.nr]; };

    /* ----- Listen i panelet ---------------------------------------------------- */
    P.bygListe = function () {
        var mig = this;
        var liste = NK.el("g-liste");
        liste.innerHTML = "";
        this.chips = [];
        var raekke = document.createElement("div");
        raekke.className = "opg-chips lodret";
        D.GAET.forEach(function (q, i) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "opg-chip";
            k.innerHTML = '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" + NK.htmlPotens(q.titel) + '</span><i class="oc-m"></i>';
            k.addEventListener("click", function () { mig.vaelg(i); mig.fokus(); });
            raekke.appendChild(k);
            mig.chips[i] = k;
        });
        liste.appendChild(raekke);
    };

    P.visListe = function () {
        var mig = this;
        D.GAET.forEach(function (q, i) {
            var c = mig.chips[i], s = mig.svar[q.id];
            c.classList.toggle("valgt", i === mig.nr && mig.fase !== "intro" && mig.fase !== "slut");
            c.classList.toggle("loest", s === q.ret);
            c.classList.toggle("forbi", s !== undefined && s !== q.ret);
            c.querySelector(".oc-m").textContent = s === undefined ? "" : (s === q.ret ? "✓" : "✗");
        });
        NK.saetTekst("g-rigtige", String(this.antalRigtige()));
        NK.saetTekst("g-gaettet", String(this.antalSvar()));
    };

    /* ----- Faserne ------------------------------------------------------------- */
    P.intro = function () {
        this.fase = "intro";
        this.kort.vis("info intro", NK.Kort.slut("Et mol",
            NK.htmlPotens("Et dusin er 12 stk. Et mol er også et antal, bare meget større: 1 mol er 6,02 · 10²³ stk. " +
            "Gæt, hvor meget 1 mol er af " + TAL[D.GAET.length] + " forskellige ting."), "Start →"));
        this.kort.knap(null);
        this.kort.bund("");
        this.visListe();
    };

    P.vaelg = function (i) {
        this.nr = i;
        this.hintVist = false;
        this.stige.blink = {};
        var q = this.q();
        this.fra = log10(q.en);
        this.til = log10(vaerdi(q));
        this.zoomet = false;
        this.kam = null;
        if (this.svar[q.id] !== undefined) {
            /* Allerede gaettet: svaret og overblikket med det samme */
            this.fase = "facit";
            this.Ltop = this.til;
            this.facitKort();
            this.stige.saetKamera(this.overblikKamera());
        } else {
            this.fase = "spm";
            this.Ltop = this.fra;
            this.spmKort();
            this.stige.saetKamera(this.startKamera());
        }
        this.visListe();
    };

    P.spmKort = function () {
        var q = this.q();
        var html = NK.Kort.chip("Gæt " + (this.nr + 1) + " af " + D.GAET.length) +
            '<span class="sk-intro">' + NK.htmlPotens(q.intro) + "</span>" +
            '<p class="sk-tekst">' + NK.htmlPotens(q.spm) + "</p>" +
            NK.Kort.svarknapper(q.svar, null, false);
        this.kort.vis("spm", html);
        if (this.hintVist) {
            this.kort.knap(null);
            this.kort.bund("Hint: " + q.hint, "hint");
        } else {
            this.kort.knap("Giv et hint");
            this.kort.bund("");
        }
    };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        var q = this.q();
        this.valgt = j;
        this.svar[q.id] = j;
        NK.gem(NOEGLE, this.svar);
        this.fase = "koer";
        this.turT = 0;
        this.kam = null;
        var html = NK.Kort.chip("Gæt " + (this.nr + 1) + " af " + D.GAET.length) +
            '<span class="sk-intro">' + NK.htmlPotens(q.intro) + "</span>" +
            '<p class="sk-tekst">' + NK.htmlPotens(q.spm) + "</p>" +
            NK.Kort.svarknapper(q.svar, function (i) { return i === j ? "valgt" : ""; }, true);
        this.kort.vis("spm koer", html);
        this.kort.knap(null);
        this.kort.bund("Antal " + q.ting + ": 1", "peger");
        this.visListe();
    };

    P.facitKort = function () {
        var q = this.q(), dit = this.svar[q.id];
        var ret = dit === q.ret;
        var B = NK.Kort.BOGST;
        var tekst = '<span class="sk-svaret">' + (ret ? "" : "Svaret er " + B[q.ret] + ": ") + NK.htmlPotens(q.svar[q.ret].t) + ".</span> " + NK.htmlPotens(q.forkl);
        if (!ret) {
            var k = Math.round(log10(vaerdi(q) / q.svar[dit].v));
            var om = k === 0 ? "tæt på, men " + B[q.ret] + " passer bedre." :
                "ca. " + gangeTekst(k) + " gange for " + (k > 0 ? "lille." : "stort.");
            tekst += '<span class="sk-gaet">Dit gæt, ' + B[dit] + " " + NK.htmlPotens(q.svar[dit].t) + ", var " + NK.htmlPotens(om) + "</span>";
        }
        var sidste = this.foersteUbesvarede() < 0;
        var knap = sidste ? "Se resultatet →" : "Næste gæt →";
        this.kort.vis(ret ? "loest" : "loest facit", NK.Kort.slut(ret ? "Rigtigt ✓" : "Svaret", tekst, knap));
        this.kort.knap(null);
        this.kort.bund("");
    };

    P.slut = function () {
        this.fase = "slut";
        var r = this.antalRigtige(), titel = D.TITLER[0].t;
        D.TITLER.forEach(function (t) { if (r >= t.fra) titel = t.t; });
        this.titel = titel;
        this.kort.vis("loest", NK.Kort.slut("Færdig",
            "Du gættede <b>" + r + " af " + D.GAET.length + "</b> rigtigt. Din titel: <b>" + titel + "</b>. " + NK.htmlPotens(D.FAERDIG.g),
            "Videre til fane 2 →"));
        this.kort.knap("Gæt forfra", "almindelig");
        this.kort.bund("");
        this.visListe();
    };

    P.videre = function () {
        if (this.fase === "intro") {
            var i = this.foersteUbesvarede();
            this.vaelg(i < 0 ? 0 : i);
        } else if (this.fase === "facit") {
            var n = this.foersteUbesvarede();
            if (n < 0) this.slut();
            else this.vaelg(n > this.nr ? n : this.naesteEfter(this.nr));
        } else if (this.fase === "slut") {
            if (NK.visFane) NK.visFane("fane-t");
        }
    };

    /* Det naeste ubesvarede gaet efter i (der er mindst ét) */
    P.naesteEfter = function (i) {
        for (var k = 1; k <= D.GAET.length; k++) {
            var j = (i + k) % D.GAET.length;
            if (this.svar[D.GAET[j].id] === undefined) return j;
        }
        return 0;
    };

    P.knap = function () {
        if (this.fase === "spm" && !this.hintVist) {
            this.hintVist = true;
            this.spmKort();
        } else if (this.fase === "slut") {
            this.nulstil();
        }
    };

    P.enter = function () {
        if (this.fase === "intro" || this.fase === "facit" || this.fase === "slut") this.videre();
    };

    P.nulstil = function () {
        this.svar = {};
        NK.gem(NOEGLE, this.svar);
        this.nr = 0;
        this.intro();
    };

    /* ----- Kameraet -------------------------------------------------------------- */
    P.startKamera = function () {
        var s = this.stige, p = s.pTaet();
        return { c: s.cFor(this.fra, s.friY(0.8), p), p: p };
    };

    P.overblikKamera = function () {
        var q = this.q();
        var Lmin = this.fra, Lmax = this.til;
        q.svar.forEach(function (sv) { var L = log10(sv.v); Lmin = Math.min(Lmin, L); Lmax = Math.max(Lmax, L); });
        return this.stige.overblik(Lmin - 0.3, Lmax + 0.3);
    };

    P.taetKamera = function (L) {
        var s = this.stige, p = s.pTaet();
        return { c: s.cFor(L, s.friY(0.45), p), p: p };
    };

    /* Kameraet glider fra det, det viser nu, til k paa tid sekunder */
    P.glid = function (k, tid) {
        this.kam = { fra: { c: this.stige.c, p: this.stige.p }, til: k, t: 0, tid: tid };
    };

    P.opdaterKamera = function (dt) {
        if (!this.kam) return;
        var k = this.kam;
        k.t += dt;
        var u = blid(k.t / k.tid);
        var lp = Math.log(k.fra.p) + (Math.log(k.til.p) - Math.log(k.fra.p)) * u;
        this.stige.p = Math.exp(lp);
        this.stige.c = k.fra.c + (k.til.c - k.fra.c) * u;
        if (k.t >= k.tid) { this.stige.saetKamera(k.til); this.kam = null; }
    };

    /* ----- Loekken ----------------------------------------------------------------- */
    P.tilpas = function () {
        if (this.L.tilpas()) this.layout();
    };

    P.kortZone = function () { return this.L.h < 720 ? 192 : 214; };

    P.layout = function () {
        var fri = 10 + this.kortZone() + 8;
        this.stige.saetView(8, 8, this.L.b - 16, this.L.h - 14, Math.min(fri, this.L.h - 120));
        if (this.fase === "spm") this.stige.saetKamera(this.startKamera());
        else if (this.fase === "facit" && !this.kam) this.stige.saetKamera(this.zoomet ? this.taetKamera(this.zoomL) : this.overblikKamera());
        this.saetAnkre();
    };

    /* Usynlige felter, som rundvisningen peger paa */
    P.saetAnkre = function () {
        var s = this.stige, v = s.view;
        function anker(id, x, y, b, h) {
            var e = NK.el(id);
            if (!e) return;
            e.style.left = x + "px"; e.style.top = y + "px"; e.style.width = b + "px"; e.style.height = h + "px";
        }
        var y = s.fri, h = v.y + v.h - s.fri;
        anker("g-anker-stige", s.sporX - 40, y, 80, h);
        anker("g-anker-ting", s.sporX + 34, y, Math.min(260, v.x + v.b - s.sporX - 40), h);
        anker("g-anker-flag", Math.max(8, s.sporX - 330), y, Math.min(240, s.sporX - 100), h);
    };

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.fase === "koer") {
            var q = this.q();
            this.turT += dt;
            var forrige = this.Ltop;
            this.Ltop = this.fra + (this.til - this.fra) * blid(this.turT / TURTID);
            /* De kendte ting lyser op, naar soejlen kommer forbi */
            var mig = this;
            D.STIGER[q.stige].maerker.forEach(function (m) {
                var L = log10(m.v);
                if (forrige < L && mig.Ltop >= L) mig.stige.blink[m.n] = mig.tid;
            });
            /* Kameraet foelger toppen, men kommer aldrig under startbilledet */
            var s = this.stige, p = s.pTaet();
            var start = this.startKamera();
            var foelg = s.cFor(this.Ltop, s.friY(0.42), p);
            s.saetKamera({ c: Math.max(start.c, foelg), p: p });
            var N = Math.pow(10, this.Ltop - this.fra);
            if (this.turT >= TURTID) {
                this.kort.bund("Antal " + q.ting + ": 6,02 · 10²³ = 1 mol", "god");
            } else {
                this.kort.bund("Antal " + q.ting + ": " + antalTekst(N), "peger");
            }
            if (this.turT >= TURTID + VENT) {
                this.fase = "facit";
                this.Ltop = this.til;
                this.facitKort();
                this.glid(this.overblikKamera(), ZOOMTID);
                this.visListe();
            }
        }
        this.opdaterKamera(dt);
    };

    P.tegn = function () {
        var c = this.L.ctx, b = this.L.b, h = this.L.h;
        this.L.ryd("#14141a");
        if (this.fase === "intro" || this.fase === "slut") {
            this.tegnIntro(c, b, h);
            return;
        }
        var q = this.q(), stige = D.STIGER[q.stige], s = this.stige, v = s.view;
        var mig = this;
        c.save();
        NK.rundtRekt(c, v.x, v.y, v.b, v.h, 12);
        c.clip();
        s.tegnBaggrund(c, q.stige, this.tid);
        s.tegnStige(c, stige.enhed);
        /* De ting, der ligger taet paa svaret og gaettene, faar navn foerst */
        var vigtige = function (m) {
            var L = log10(m.v), bedst = Math.abs(L - mig.til);
            q.svar.forEach(function (sv) { bedst = Math.min(bedst, Math.abs(L - log10(sv.v)) + 0.5); });
            return -bedst;
        };
        s.tegnMaerker(c, stige.maerker, this.tid, vigtige);
        s.tegnSoejle(c, q.fyld, this.fra, this.Ltop, this.tid);
        var pille = null, farve = "";
        if (this.fase === "koer") {
            pille = this.turT >= TURTID ? "1 mol = 6,02 · 10²³ " + q.ting : antalTekst(Math.pow(10, this.Ltop - this.fra)) + " " + q.ting;
        } else if (this.fase === "facit") {
            pille = null;
        } else {
            pille = q.et;
        }
        s.tegnTop(c, q.top, this.Ltop, pille, farve);
        var dit = this.svar[q.id] === undefined ? -1 : this.svar[q.id];
        var fase = this.fase;
        var Ltop = this.Ltop;
        s.tegnFlag(c, q.svar, function (i) {
            if (fase === "spm") return "";
            if (fase === "koer") {
                if (i === dit) return "valgt";
                return log10(q.svar[i].v) < Ltop - 0.05 ? "mat" : "";
            }
            if (i === q.ret) return "ret";
            if (i === dit) return "forkert";
            return "mat";
        }, fase !== "facit", dit, this.molTekst());
        if (this.fase === "facit" && !this.kam) this.tegnSkilt(c);
        c.restore();
    };

    /* Tallet for 1 mol, som det staar under det rigtige svar */
    P.molTekst = function () {
        var q = this.q(), enhed = D.STIGER[q.stige].enhed;
        if (q.stige === "tid") return "1 mol: " + NK.potens(vaerdi(q) / 3.156e7, 2) + " år";
        return "1 mol: " + NK.potens(vaerdi(q), 2) + " " + enhed;
    };

    /* Det gule skilt, der siger, hvad et klik paa stigen goer */
    P.tegnSkilt = function (c) {
        var s = this.stige, v = s.view;
        var tekst = this.zoomet ? "Klik på stigen: se alle svar" : "Klik på stigen: zoom ind";
        c.save();
        c.font = "700 13px 'Segoe UI', sans-serif";
        var b = NK.tekstBredde(c, tekst) + 22, h = 26;
        var x = v.x + v.b - b - 14, y = s.fri + 8;
        NK.rundtRekt(c, x, y, b, h, 13);
        c.fillStyle = "#ffdf6b";
        c.fill();
        c.lineWidth = 1.5;
        c.strokeStyle = "#a67f08";
        c.stroke();
        c.restore();
        NK.tekst(c, tekst, x + b / 2, y + h / 2 + 1, { font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#33290a" });
    };

    /* Startbilledet (og slutbilledet): et dusin aeg og en sæk med 1 mol */
    P.tegnIntro = function (c, b, h) {
        var top = 10 + this.kortZone() + 8, bund = h - 10;
        var mx = b / 2, my = (top + bund) / 2;
        var s = NK.klamp(Math.min(b / 7, (bund - top) / 3.2), 60, 130);
        /* Bakken med et dusin aeg */
        var bx = mx - s * 1.7;
        NK.Ikon.tegn(c, "aeggebakke", bx, my, s * 2.5);
        NK.tekst(c, "1 dusin = 12 stk.", bx, my + s * 0.95, { font: "800 " + Math.round(s * 0.2) + "px 'Segoe UI', sans-serif", justering: "center", farve: "#ffffff" });
        /* Saekken med 1 mol */
        var sx = mx + s * 1.7;
        NK.Ikon.tegn(c, "saek", sx, my - s * 0.05, s * 1.3);
        NK.tekst(c, "1 mol", sx, my + s * 0.12, { font: "800 " + Math.round(s * 0.24) + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#4a3412" });
        NK.tekst(c, "1 mol = 6,02 · 10²³ stk.", sx, my + s * 0.95, { font: "800 " + Math.round(s * 0.2) + "px 'Segoe UI', sans-serif", justering: "center", farve: "#ffffff" });
        NK.tekst(c, D.MOL_LANG, sx, my + s * 1.22, { font: "600 " + Math.round(s * 0.13) + "px 'Segoe UI', sans-serif", justering: "center", farve: "#c8ced6" });
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.koblMus = function () {
        var mig = this, cv = this.L.canvas;
        var ned = null;
        cv.addEventListener("pointerdown", function (e) {
            var p = mig.L.punkt(e);
            ned = { x: p.x, y: p.y, c: mig.stige.c, flyttet: false };
            if (mig.fase === "facit") cv.setPointerCapture(e.pointerId);
        });
        cv.addEventListener("pointermove", function (e) {
            var p = mig.L.punkt(e);
            if (ned && mig.fase === "facit" && !mig.kam) {
                var dy = p.y - ned.y;
                if (Math.abs(dy) > 4) ned.flyttet = true;
                if (ned.flyttet) mig.stige.c = mig.klampC(ned.c + dy / mig.stige.p);
            }
            cv.style.cursor = mig.fase === "facit" ? (ned && ned.flyttet ? "grabbing" : "zoom-in") : "default";
        });
        cv.addEventListener("pointerup", function (e) {
            var p = mig.L.punkt(e);
            var var_ned = ned;
            ned = null;
            if (!var_ned || var_ned.flyttet) return;
            mig.klik(p.x, p.y);
        });
        cv.addEventListener("wheel", function (e) {
            if (mig.fase !== "facit" || mig.kam) return;
            e.preventDefault();
            mig.stige.c = mig.klampC(mig.stige.c - e.deltaY / Math.max(60, mig.stige.p) * 0.35);
        }, { passive: false });
    };

    P.klampC = function (c) {
        var q = this.q(), m = D.STIGER[q.stige].maerker;
        var lav = Math.min(this.fra, log10(m[0].v)) - 1, hoej = Math.max(this.til, log10(m[m.length - 1].v)) + 1;
        return NK.klamp(c, lav, hoej);
    };

    P.klik = function (x, y) {
        if (this.fase === "intro" || this.fase === "spm") { this.kort.blink(); return; }
        if (this.fase !== "facit" || this.kam) return;
        if (y < this.stige.fri) return;
        if (this.zoomet) {
            this.zoomet = false;
            this.glid(this.overblikKamera(), 0.8);
        } else {
            this.zoomet = true;
            this.zoomL = this.stige.LAf(y);
            this.glid(this.taetKamera(this.zoomL), 0.8);
        }
    };

    P.fokus = function () { /* intet felt at saette fokus i */ };
}());
