/* =====================================================================
   sim_spil.js - fane 3: Hvem koger foerst?

   Et glas med en blanding af to eller tre alkaner staar i kammeret, og
   zoomvinduet viser molekylerne i hver sin farve. Eleven gaetter, hvilket
   stof der koger foerst (i panelet eller ved at klikke paa et molekyle).
   Saa varmer kammeret op til midt mellem de to laveste kogepunkter, og
   det stof, der koger foerst, forlader vaesken og fylder ballonen.

   Tre niveauer (D.SPIL_NIVEAUER): kaedelaengde, formen og begge dele.
   En runde er ni blandinger, tre fra hvert niveau. De forkerte svar er
   de typiske fejl: den laengste kaede, den lige kaede og, paa niveau 3,
   den forgrenede med flere C-atomer. Rekorden huskes.

   Blandingen koger her, som om stofferne var hver for sig: hvert stof
   koger ved sit eget kogepunkt (se README om forenklingerne).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc6.1-spil";
    var KASSE = { W: 32, H: 30 };

    function SimSpil() {
        this.L = new NK.Laerred(NK.el("spil-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.termo = new NK.Termostat(D.T_VARM, D.STUE);
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.rekord = (NK.hent(NOEGLE, {}) || {}).rekord || 0;
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyRunde();
    }

    var P = SimSpil.prototype;

    /* ----- Runden ------------------------------------------------------------------ */
    P.nyRunde = function () {
        var runde = [];
        D.RUNDE.forEach(function (antal, niveau) {
            var pulje = NK.bland(D.BLANDINGER.filter(function (b) { return b.niveau === niveau; }));
            runde = runde.concat(pulje.slice(0, antal));
        });
        this.runde = runde;
        this.point = 0;
        this.stime = 0;
        this.slut = false;
        this.start(0);
    };

    P.antal = function (b, st) {
        return NK.klamp(Math.round(120 / b.st.length / st.nC), 4, 24);
    };

    P.start = function (nr) {
        var mig = this, b = this.runde[nr];
        this.nr = nr;
        this.b = b;
        this.termo.saet(b.start);
        this.termo.laast = false;
        this.proeve = new NK.Proeve({
            W: KASSE.W, H: KASSE.H, T: b.start,
            stoffer: b.st.map(function (st, k) { return { st: st, n: mig.antal(b, st), farve: D.SPIL_FARVER[k] }; })
        });
        this.fase = "gaet";
        this.valgt = null;
        this.hjaelp = 0;
        this.sete = false;
        this.besked("", "");
        this.visOpgave();
        this.visRunde();
    };

    /* Eleven vaelger stof nummer k: kammeret varmer op */
    P.svar = function (k) {
        if (this.fase !== "gaet") return;
        this.valgt = k;
        this.fase = "varmer";
        this.termo.animerTil(this.b.maal, D.OPVARMNING);
        this.termo.laast = true;
        if (this.afvisTilbud) this.afvisTilbud();
        this.besked("Dit gæt: <b>" + NK.html(this.b.st[k].navn) + "</b>. Kammeret varmer op.", "");
        this.visOpgave();
    };

    /* Er det foerste stof kogt helt vaek, og er kammeret naaet op? */
    P.tjekKogt = function () {
        if (this.fase !== "varmer" || this.termo.animerer()) return;
        var b = this.b, p = this.proeve;
        var g = p.grupper[b.st.indexOf(b.foerst)];
        if (p.taelling(g)[2] < g.n) return;
        this.fase = "svar";
        this.termo.laast = false;
        var valgt = b.st[this.valgt], rigtig = valgt === b.foerst;
        var naeste = b.st.filter(function (s) { return s !== b.foerst; }).sort(function (x, y) { return x.kp - y.kp; })[0];
        if (rigtig && !this.sete) {
            this.point++;
            this.stime++;
        } else {
            this.stime = 0;
        }
        var tekst;
        if (rigtig) {
            tekst = "<b>" + (this.sete ? "Sådan." : "Rigtigt.") + "</b> " + NK.html(b.foerst.Navn) + " koger ved " + D.gradTekst(b.foerst.kp) +
                ", " + NK.html(naeste.navn) + " først ved " + D.gradTekst(naeste.kp) + ". " + NK.html(D.hvorfor(b.foerst, naeste));
        } else {
            tekst = "<b>Nej.</b> " + NK.html(b.foerst.Navn) + " koger først, ved " + D.gradTekst(b.foerst.kp) + ". " +
                NK.html(valgt.Navn) + " koger ved " + D.gradTekst(valgt.kp) + ". " + NK.html(D.hvorfor(b.foerst, valgt));
        }
        this.besked(tekst, rigtig ? "god" : "skidt");
        if (this.nr === this.runde.length - 1) this.rundeSlut();
        this.visOpgave();
        this.visRunde();
    };

    P.rundeSlut = function () {
        this.slut = true;
        var ny = this.point > this.rekord;
        if (ny) {
            this.rekord = this.point;
            NK.gem(NOEGLE, { rekord: this.rekord });
        }
        if (this.laererSlut) this.laererSlut(this.point, ny);
    };

    P.knap = function () {
        if (this.fase === "svar") {
            if (this.slut) this.nyRunde();
            else this.start(this.nr + 1);
            return;
        }
        if (this.fase !== "gaet") return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(D.SPIL_NIVEAUER[this.b.niveau].hint), "gul");
            this.visOpgave();
            return;
        }
        /* Vis svaret: det tæller ikke med */
        this.sete = true;
        this.svar(this.b.st.indexOf(this.b.foerst));
    };

    P.nulstil = function () {
        this.nyRunde();
    };

    P.enter = function () {
        if (this.fase === "svar") this.knap();
    };

    P.fokus = function () {};

    P.tast = function (tast, e) {
        if (tast === "p" || tast === "P") { this.proeve.pause = !this.proeve.pause; return true; }
        return this.termo.tast(tast, e && e.shiftKey);
    };

    /* ----- Panelet ---------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("spil-knap"),
            besked: NK.el("spil-besked"),
            kort: NK.el("spil-kort"),
            valg: NK.el("spil-valg")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("spil-spring").addEventListener("click", function () { mig.springIntro(); });
        NK.el("spil-nulstil").addEventListener("click", function () { mig.nyRunde(); });
        this.el.valg.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || b.disabled) return;
            mig.svar(parseInt(b.getAttribute("data-nr"), 10));
        });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visOpgave = function () {
        var mig = this, b = this.b;
        NK.saetTekst("spil-niveau", D.SPIL_NIVEAUER[b.niveau].navn);
        NK.saetTekst("spil-nr", String(this.nr + 1));
        NK.saetTekst("spil-antal", String(this.runde.length));
        var html = b.st.map(function (st, k) {
            var klasse = "valglinje";
            if (mig.fase === "svar") {
                if (st === b.foerst) klasse += " rigtig";
                else if (k === mig.valgt) klasse += " forkert";
            } else if (k === mig.valgt) klasse += " valgt";
            return '<button class="' + klasse + '" type="button" data-nr="' + k + '"' + (mig.fase !== "gaet" ? " disabled" : "") + ">" +
                '<span class="prik" style="background:' + D.SPIL_FARVER[k] + '"></span>' +
                '<span class="vl-navn">' + NK.html(st.navn) + "</span>" +
                '<span class="vl-formel">' + D.formel(st) + "</span></button>";
        }).join("");
        NK.saetHTML("spil-valg", html);
        var tekst, klasse = "knap";
        if (this.fase === "svar") {
            tekst = this.slut ? "Ny runde ↺" : "Næste blanding →";
            klasse = "knap blaa banker";
        } else if (this.fase === "varmer") tekst = "Kammeret varmer op …";
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = this.fase === "varmer";
        this.el.kort.classList.toggle("sejr", this.fase === "svar" && this.b.st[this.valgt] === b.foerst && !this.sete);
    };

    P.visRunde = function () {
        NK.saetTekst("spil-point", String(this.point));
        NK.saetTekst("spil-stime", String(this.stime));
        NK.saetTekst("spil-rekord", String(this.rekord));
    };

    P.visStatus = function () {
        var t, tr = this.traek;
        if (tr && tr.slags === "termo") t = "Kammeret er " + D.gradTekst(this.termo.T, 0) + ".";
        else if (this.fase === "gaet") t = "Hvem koger først? Svar i panelet, eller klik på et af molekylerne.";
        else if (this.fase === "varmer") t = "Kammeret varmer op: " + D.gradTekst(this.termo.T, 0) + ".";
        else t = this.slut ? "Runden er slut. Træk i termometeret for at koge resten." :
            "Træk i termometeret for at koge resten, eller gå videre i panelet.";
        NK.saetHTML("spil-status", t);
    };

    /* ----- Layout ------------------------------------------------------------------
       Som paa fane 1: kammeret i en smal kolonne til venstre, zoomvinduet
       i midten og termometeret hoejt til hoejre. */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.9);
        var luft = NK.klamp(H * 0.085, 40, 64);
        var vB = Math.round(NK.klamp(W * 0.21, 140, 260));
        /* Forklaringen af stofferne oeverst i venstre kolonne: én raekke pr. stof */
        var rh = Math.round(NK.klamp(H * 0.07, 38, 58));
        lay.forkl = { x: kant, y: luft + 24, b: vB, h: 3 * rh, rh: rh };
        var rum = lay.bordY - (lay.forkl.y + lay.forkl.h) - 10;
        var sk = NK.klamp(Math.min(rum / 420, vB * 0.8 / 240, 0.85), 0.18, 0.85);
        var kx = kant + vB - 120 * sk - 4;
        lay.kammer = Tg.kammerMaal(kx, lay.bordY, 300 * sk);
        var K = lay.kammer;
        lay.glas = Tg.glasMaal(kx, K.y + 214 * sk, 250 * sk);
        lay.kop = { x: kant + 22, y: lay.bordY };
        lay.termo = Tg.termoMaal(W - kant - 58, lay.bordY - 2, lay.bordY - 2 - (luft + 10), D.T_VARM);
        var zx0 = kant + vB + 18, zx1 = lay.termo.x - 60;
        var zTop = luft + 24, zBund = lay.bordY - 14;
        var zb = Math.max(120, zx1 - zx0), zh = zb * KASSE.H / KASSE.W;
        if (zh > zBund - zTop) { zh = zBund - zTop; zb = zh * KASSE.W / KASSE.H; }
        lay.zoom = { x: Math.round(zx0 + (zx1 - zx0 - zb) / 2), y: Math.round(zTop + (zBund - zTop - zh) / 2), b: Math.round(zb), h: Math.round(zh) };
        this.lay = lay;
        this.saetAnker("spil-anker-kammer", K.x, lay.glas.top - 40 * sk, K.b, lay.bordY - lay.glas.top + 40 * sk);
        this.saetAnker("spil-anker-zoom", lay.forkl.x, lay.zoom.y - 22, lay.zoom.x + lay.zoom.b - lay.forkl.x, lay.zoom.h + 22);
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

    /* ----- Tegneloekken ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        this.termo.opdater(dt);
        this.proeve.T = this.termo.T;
        this.proeve.opdater(dt);
        this.proeve.hentHaendelser();
        this.tjekKogt();
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.visStatus();
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, b = this.b, mk = this.proeve.makro();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);
        var kop = this.g.kaffekop, kk = NK.klamp(lay.H / 600, 0.8, 1.4);
        if (!kop.skjult && !kop.iHaand && lay.kop.x + 30 < lay.kammer.x) {
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        var K = lay.kammer, G = lay.glas;
        Tg.kammerBag(ctx, K, this.termo.T, this.tid);
        Tg.glas(ctx, G, mk, this.tid, { frost: NK.klamp((-this.termo.T - 40) / 120, 0, 1), udenBallon: true });
        Tg.kammerFront(ctx, K, this.termo.T, {});
        Tg.ballon(ctx, G.mund.x, G.mund.y, G.s, mk.ballon, this.tid, undefined, {});

        /* Kogepunkterne staar paa termometeret, naar svaret er givet */
        var maerker = [];
        if (this.fase === "svar") {
            b.st.forEach(function (st, k) { maerker.push({ t: st.kp, tekst: "kp", farve: D.SPIL_FARVER[k] }); });
        }
        var tr = this.traek;
        Tg.termometer(ctx, lay.termo, this.termo.T, {
            trin: 50, store: 100, maerker: maerker, stue: true, tid: this.tid,
            haandtag: this.over && this.over.slags === "termo", traekker: tr && tr.slags === "termo"
        });

        var z = lay.zoom;
        var fra = { x: G.ind.x0, y: G.ind.bund - G.fuld - 6 * G.s, b: G.ind.x1 - G.ind.x0, h: G.fuld + 6 * G.s };
        Tg.zoomLinjer(ctx, fra, z);
        this.pauseFelt = Tg.zoomKasse(ctx, z, this.proeve, {
            titel: "Molekylerne i blandingen",
            farve: function (m) { return m.g.farve; },
            pause: !!this.proeve.pause, pauseLys: this.over && this.over.slags === "pause",
            lys: this.over && this.over.slags === "molekyle" ? 0.4 : 0
        });

        /* Forklaringen i venstre kolonne: et molekyle og navnet for hvert stof */
        var f = lay.forkl;
        var fs = NK.klamp(f.rh * 0.3, 12, 15);
        b.st.forEach(function (st, k) {
            var cy = f.y + f.rh * (k + 0.5);
            var form = NK.Form.form(st), s = Math.min(NK.klamp(f.rh * 0.13, 3.2, 6.5), f.b * 0.2 / form.R);
            var over = mig.over && mig.over.slags === "molekyle" && mig.over.k === k;
            var bredde = form.R * 2 * s;
            Tg.molekyle(ctx, form, 0, 0, 0, s, f.x + 4 + form.R * s, cy, D.SPIL_FARVER[k]);
            var tx = f.x + 4 + bredde + 10;
            NK.tekst(ctx, st.navn, tx, cy - 1, { font: Tg.font(over ? "700" : "600", fs), farve: over ? "#ffffff" : "#dde3ea" });
            NK.tekst(ctx, D.formel(st), tx, cy + fs, { font: Tg.font("500", fs * 0.9), farve: "#9aa3ae" });
        });

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    /* Stoffet, hvis molekyle ligger under musen i zoomvinduet */
    P.molekyleUnder = function (pt) {
        var z = this.lay.zoom, p = this.proeve;
        if (pt.x < z.x || pt.x > z.x + z.b || pt.y < z.y || pt.y > z.y + z.h) return -1;
        var s = z.b / p.W, mx = (pt.x - z.x - z.b / 2) / s, my = (pt.y - z.y - z.h / 2) / s;
        var bedst = -1, bd = 2.2 * 2.2;
        p.mol.forEach(function (m) {
            NK.Form.kugler(m.f, m.x, m.y, m.a).forEach(function (k) {
                var d = (k[0] - mx) * (k[0] - mx) + (k[1] - my) * (k[1] - my);
                if (d < bd) { bd = d; bedst = m.g.k; }
            });
        });
        return bedst;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var pk = this.pauseFelt;
        if (pk && pt.x >= pk.x && pt.x <= pk.x + pk.b && pt.y >= pk.y && pt.y <= pk.y + pk.h) return { slags: "pause" };
        if (!this.termo.laast && this.termo.rammer(pt, lay.termo)) return { slags: "termo" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60 && lay.kop.x + 30 < lay.kammer.x) return { slags: "kop" };
        var k = this.molekyleUnder(pt);
        if (k >= 0) return { slags: "molekyle", k: k };
        var f = lay.forkl;
        if (pt.x >= f.x && pt.x <= f.x + f.b && pt.y >= f.y && pt.y <= f.y + f.rh * this.b.st.length) {
            return { slags: "molekyle", k: Math.min(this.b.st.length - 1, Math.floor((pt.y - f.y) / f.rh)) };
        }
        var K = lay.kammer;
        if (pt.x >= K.x && pt.x <= K.x + K.b && pt.y >= lay.glas.top - 60 && pt.y <= K.bund) return { slags: "kammer" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) {
                if (mig.termo.laast && mig.termo.rammer(pt, mig.lay.termo)) mig.besked("Kammeret varmer op af sig selv lige nu.", "");
                return;
            }
            if (u.slags === "termo") {
                if (mig.termo.start(pt, mig.lay.termo)) {
                    mig.traek = { slags: "termo" };
                    try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                }
                return;
            }
            if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); return; }
            if (u.slags === "kop") { if (mig.klikKop) mig.klikKop(); return; }
            if (u.slags === "pause") { mig.proeve.pause = !mig.proeve.pause; return; }
            if (u.slags === "molekyle") {
                if (mig.fase === "gaet") mig.svar(u.k);
                else {
                    var st = mig.b.st[u.k];
                    mig.besked(NK.html(st.Navn + ", " + D.formel(st) + ", koger ved " + D.gradTekst(st.kp) + "."), "");
                }
                return;
            }
            if (u.slags === "kammer") {
                mig.besked(mig.fase === "gaet" ? "Kammeret varmer op, når du har gættet i panelet." : "Kammeret har den temperatur, termometeret viser.", "");
            }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) { mig.termo.flyt(pt, mig.lay.termo); c.style.cursor = "ns-resize"; return; }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = !s ? "default" : (s === "termo" ? "ns-resize" : "pointer");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        function slip() { if (mig.traek) { mig.termo.slip(); mig.traek = null; } }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc6.1-intro-spil", tilbud: "spil-tilbud", spring: "spil-spring" });

    /* Mens han siger, hvor man gaetter, lyser svarene */
    P.pegPaaFelt = function () {
        var i = this.laererIIntro && this.laererIIntro() ? this.introTrin : 0;
        NK.el("spil-valg").classList.toggle("peg", i === 2);
    };

    NK.SimSpil = SimSpil;
}());
