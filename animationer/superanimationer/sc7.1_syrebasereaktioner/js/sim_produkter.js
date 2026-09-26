/* =====================================================================
   sim_produkter.js - fane 2: Produkterne

   Paa tavlen staar to reaktanter og en pil med to tomme pladser.
   Nederst sidder formler som brikker: de to rigtige produkter og de
   fejl, elever faktisk laver (NK.Syrebase.forkerte). Eleven traekker
   en brik op paa en plads (et klik saetter den paa den foerste ledige).
   Et forkert svar hopper tilbage med en forklaring, der passer til
   fejlen. Naar begge produkter staar der, flyver hydronen fra syren til
   basen, og parrene kommer frem.

   Opgaverne laves af modellen ud fra sværhedsgraden (Let, Middel,
   Svaer), saa der er altid en ny. Tavlen taeller, hvor mange der er
   loest i traek uden fejl og uden Vis svaret. Knappen: Giv hint ->
   Vis svaret -> Ny reaktion.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Syrebase;
    var Tg = NK.Tegn;
    var Tv = NK.Tavle;

    var NOEGLE = "nk-sc7.1-produkter";
    var KRIDT = "#f3f1ea";

    function SimProdukter() {
        this.L = new NK.Laerred(NK.el("prod-laerred"));
        this.tid = 0;
        this.lay = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.rekord = Tv.hentRekord(NOEGLE);
        this.iTraek = 0;
        this.seneste = [];
        this.stjerner = [];
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyOpgave();
    }

    var P = SimProdukter.prototype;

    P.nyOpgave = function () {
        var o = S.nyOpgave(S.niveau, this.seneste);
        this.seneste.push(o.noegle);
        if (this.seneste.length > 4) this.seneste.shift();
        this.opg = o;
        this.rigtige = o.produkter.map(function (id) { return S.formel(id); });
        var brikker = [];
        this.rigtige.forEach(function (t) {
            if (!brikker.some(function (bk) { return bk.tekst === t; })) brikker.push({ tekst: t, rigtig: true });
        });
        S.forkerte(o).forEach(function (f) { brikker.push({ tekst: f.f, rigtig: false, hvorfor: f.hvorfor }); });
        this.brikker = NK.bland(brikker);
        this.pladser = [null, null];
        this.loest = false;
        this.fejl = false;
        this.vist = false;
        this.hjaelp = 0;
        this.traek = null;
        this.over = null;
        this.overPlads = null;
        this.glimt = null;
        this.bueT = 0;
        this.parT = 0;
        this.besked("", "");
        this.stil();
        this.visOpgave();
    };

    P.nytNiveau = function () {
        this.iTraek = 0;
        this.seneste = [];
        this.nyOpgave();
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = Tv.layout(this.L.b, this.L.h);
        this.stil();
    };

    /* Ligningen og brikkerne. Er ligningen for bred, bliver alt mindre. */
    P.stil = function () {
        var lay = this.lay;
        if (!lay || !this.opg) return;
        var ctx = this.L.ctx, mig = this;
        /* Under praesentationen staar Kemichael foran tavlens venstre del */
        var fri = Math.max(0, (this.friBrugt || 0) - lay.R.x);
        var R = { x: lay.R.x + fri, y: lay.R.y, b: lay.R.b - fri, h: lay.R.h };
        var reak = this.opg.reaktanter.map(function (id) { return S.formel(id); });
        function proev(k) {
            var fs = lay.fs * k, bfs = lay.bfs * k;
            var st = Tv.stilBrikker(ctx, mig.brikker, R, lay.brikY0, lay.brikY1, bfs);
            var felter = [
                { b: Tg.tekstBredde(ctx, reak[0], fs) + fs * 0.9 },
                { b: Tg.tekstBredde(ctx, reak[1], fs) + fs * 0.9 },
                { b: st.b + fs * 0.5 }, { b: st.b + fs * 0.5 }
            ];
            return { fs: fs, bfs: bfs, st: st, sk: Tg.skemaPlacer(ctx, felter, fs, R.x + R.b / 2) };
        }
        var v = proev(1);
        if (v.sk.ialt > R.b * 0.95) v = proev(R.b * 0.95 / v.sk.ialt);
        this.fs = v.fs;
        this.bfs = v.bfs;
        this.sk = v.sk;
        this.pladsR = [2, 3].map(function (i) {
            return { x: v.sk.x[i] - v.st.b / 2, y: lay.ligY - v.st.h / 2, b: v.st.b, h: v.st.h };
        });
        this.saetAnker("prod-anker-lign", R.x + 10, lay.ligY - this.fs * 1.4, R.b - 20, this.fs * 3.3);
        var y0 = Math.min.apply(null, this.brikker.map(function (bk) { return bk.r.y; }));
        var y1 = Math.max.apply(null, this.brikker.map(function (bk) { return bk.r.y + bk.r.h; }));
        this.saetAnker("prod-anker-brikker", R.x + 10, y0 - 8, R.b - 20, y1 - y0 + 16);
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

    /* ----- Handlingerne ---------------------------------------------------------------- */
    /* Rollerne i hver kolonne: reaktanterne efter opgaven, produkterne
       efter det, der staar paa pladserne */
    P.maerker = function () {
        var o = this.opg, ud = o.reaktanter.map(function (id) { return id === o.syre ? "syre" : "base"; });
        var kb = S.formel(o.kb), brugtKb = false;
        this.pladser.forEach(function (t) {
            if (t === kb && !brugtKb) { ud.push("kb"); brugtKb = true; } else ud.push(t ? "ks" : null);
        });
        return ud;
    };

    P.placer = function (i, s) {
        if (this.loest) return;
        if (s === null || s === undefined || this.pladser[s]) s = !this.pladser[0] ? 0 : (!this.pladser[1] ? 1 : null);
        if (s === null) return;
        var bk = this.brikker[i];
        var rest = this.rigtige.slice();
        this.pladser.forEach(function (p) { if (p) rest.splice(rest.indexOf(p), 1); });
        if (this.afvisTilbud) this.afvisTilbud();
        if (rest.indexOf(bk.tekst) >= 0) {
            this.pladser[s] = bk.tekst;
            if (this.pladser[0] && this.pladser[1]) { this.loes(); return; }
            this.besked("<b>" + NK.html(bk.tekst) + "</b> passer. Find det andet produkt.", "god");
            return;
        }
        this.fejl = true;
        this.glimt = { s: s, t: 0 };
        if (this.iTraek) this.iTraek = 0;
        this.besked(NK.html(bk.hvorfor), "skidt");
        this.visOpgave();
    };

    P.loes = function () {
        this.loest = true;
        this.bueT = 0;
        this.parT = 0;
        var A = NK.html(S.formel(this.opg.syre)), B = NK.html(S.formel(this.opg.base));
        var talt = !this.fejl && !this.vist;
        if (talt) {
            this.iTraek++;
            var n = S.niveau;
            if (this.iTraek > (this.rekord[n] || 0)) this.rekord[n] = this.iTraek;
            if (this.iTraek >= 10 && !this.rekord.rost) {
                this.rekord.rost = true;
                this.ventRos = 1.4;
            }
            NK.gem(NOEGLE, this.rekord);
            this.besked("<b>Rigtigt.</b> " + A + " gav en hydron til " + B + ".", "god");
            this.fejr();
        } else {
            this.iTraek = 0;
            this.besked((this.vist ? "Sådan. " : "<b>Rigtigt.</b> ") + A + " gav en hydron til " + B + ".", this.vist ? "gul" : "god");
        }
        this.visOpgave();
    };

    P.fejr = function () {
        var R = this.lay.R;
        for (var i = 0; i < 7; i++) {
            this.stjerner.push({ x: this.sk.x[2 + (i % 2)] + (Math.random() - 0.5) * 80, y: this.lay.ligY - this.fs * 0.5,
                t: -0.5 - i * 0.06, r: 5 + Math.random() * 5 });
        }
        return R;
    };

    P.knap = function () {
        if (this.loest) { this.nyOpgave(); return; }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            var A = NK.html(S.formel(this.opg.syre)), B = NK.html(S.formel(this.opg.base));
            this.besked("<b>Hint:</b> " + A + " er syren, og " + B + " er basen. Hydronen H⁺ går fra " + A + " til " + B + ".", "gul");
            this.visOpgave();
            return;
        }
        this.vist = true;
        this.pladser = this.rigtige.slice();
        this.loes();
    };

    P.nulstil = function () {
        this.iTraek = 0;
        this.nyOpgave();
    };

    P.enter = function () { if (this.loest) this.knap(); };
    P.fokus = function () {};
    P.tast = function () { return false; };

    /* ----- Panelet --------------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = { knap: NK.el("prod-knap"), besked: NK.el("prod-besked"), kort: NK.el("prod-kort") };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("prod-spring").addEventListener("click", function () { mig.springIntro(); });
        Tv.bindNiveau("prod-niveau", this);
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visOpgave = function () {
        var rek = this.rekord[S.niveau] || 0;
        NK.saetHTML("prod-taeller", "<b>" + this.iTraek + "</b> i træk · rekord " + rek);
        var tekst, klasse = "knap";
        if (this.loest) { tekst = "Ny reaktion"; klasse = "knap blaa banker"; }
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.loest && !this.vist);
    };

    P.visStatus = function () {
        var t, tr = this.traek, n = (this.pladser[0] ? 1 : 0) + (this.pladser[1] ? 1 : 0);
        if (tr && tr.flyttet) t = this.overPlads !== null ? "Slip formlen på pladsen." : "Træk formlen op på en plads efter pilen.";
        else if (this.loest) t = "Syren og dens korresponderende base står i blåt. Basen og dens korresponderende syre i lilla.";
        else if (n === 1) t = "Ét produkt mangler.";
        else t = "Træk de to produkter op på pladserne efter pilen.";
        NK.saetHTML("prod-status", t);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.glimt) { this.glimt.t += dt; if (this.glimt.t > 0.7) this.glimt = null; }
        if (this.loest) {
            this.bueT += dt / 0.9;
            if (this.bueT >= 1) this.parT = Math.min(1, this.parT + dt / 0.5);
        }
        this.stjerner = this.stjerner.filter(function (s) { s.t += dt; return s.t < 1.2; });
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererTiITraek) this.laererTiITraek();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        if (this.opdaterFri && this.opdaterFri(dt)) this.stil();
        this.visStatus();
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.sk) return;
        var mig = this, fs = this.fs, y = lay.ligY, sk = this.sk, o = this.opg;
        Tv.tegnBaggrund(ctx, lay, this.g.kaffekop);
        var mk = this.maerker();
        var farve = function (i) { return mig.loest ? Tg.PAR_FARVE[mk[i]] : KRIDT; };

        o.reaktanter.forEach(function (id, i) { Tg.formelTekst(ctx, S.formel(id), sk.x[i], y, fs, farve(i)); });
        sk.tegn.forEach(function (t) { Tg.formelTekst(ctx, t.t, t.x, y, fs, "rgba(243, 241, 234, 0.75)", 1, "400"); });
        this.pladser.forEach(function (t, s) {
            if (t) { Tg.formelTekst(ctx, t, sk.x[2 + s], y, fs, farve(2 + s)); return; }
            Tg.plads(ctx, mig.pladsR[s], {
                lys: mig.overPlads === s,
                roed: mig.glimt && mig.glimt.s === s ? 1 - mig.glimt.t / 0.7 : 0
            });
        });

        if (this.loest) {
            var iS = o.reaktanter.indexOf(o.syre), iB = o.reaktanter.indexOf(o.base);
            Tv.hydronBue(ctx, sk.x[iS], sk.x[iB], y, fs, this.bueT);
            if (this.parT > 0) Tg.par(ctx, sk.x, mk, y, fs, this.parT, { maerker: true });
        }

        var tr = this.traek;
        this.brikker.forEach(function (bk, i) {
            if (tr && tr.i === i && tr.flyttet) return;
            var lys = !mig.loest && ((mig.over && mig.over.slags === "brik" && mig.over.i === i) || (tr && tr.i === i));
            Tg.brik(ctx, bk.r, bk.tekst, { fs: mig.bfs, lys: lys, alfa: mig.loest ? 0.35 : 1 });
        });
        if (tr && tr.flyttet) {
            var bk = this.brikker[tr.i];
            Tg.brik(ctx, { x: tr.x + tr.dx, y: tr.y + tr.dy, b: bk.r.b, h: bk.r.h }, bk.tekst, { fs: this.bfs, lys: true, loeftet: true });
        }

        this.stjerner.forEach(function (st) {
            if (st.t > 0) Tg.stjerne(ctx, st.x, st.y - st.t * 30, st.r, 1 - st.t / 1.2);
        });
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ----------------------------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay, i;
        if (!lay || !this.sk) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        if (Tv.kopUnder(lay, this.g.kaffekop, pt)) return { slags: "kop" };
        for (i = 0; i < this.brikker.length; i++) if (Tv.inde(pt, this.brikker[i].r)) return { slags: "brik", i: i };
        for (i = 0; i < 2; i++) if (Tv.inde(pt, this.pladsR[i], 6)) return { slags: "plads", s: i };
        for (i = 0; i < 2; i++) {
            if (Math.abs(pt.x - this.sk.x[i]) < this.fs * 1.6 && Math.abs(pt.y - lay.ligY) < this.fs * 0.7) return { slags: "reaktant", i: i };
        }
        return null;
    };

    /* Den plads, en brik med midten i (x, y) er over */
    P.pladsVed = function (x, y) {
        for (var s = 0; s < 2; s++) {
            if (!this.pladser[s] && Tv.inde({ x: x, y: y }, this.pladsR[s], this.fs * 0.6)) return s;
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); return; }
            if (u.slags === "kop") { if (mig.klikKop) mig.klikKop(); return; }
            if (mig.loest) { mig.besked("Tryk Ny reaktion for en ny.", ""); return; }
            if (u.slags === "brik") {
                var r = mig.brikker[u.i].r;
                mig.traek = { i: u.i, x0: pt.x, y0: pt.y, x: pt.x, y: pt.y, dx: r.x - pt.x, dy: r.y - pt.y, flyttet: false };
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                return;
            }
            if (u.slags === "plads") {
                mig.besked(mig.pladser[u.s] ? "Den plads er fyldt." : "Træk en formel herop, eller klik på den.", "");
                return;
            }
            if (u.slags === "reaktant") mig.besked("Det er en reaktant. Produkterne skal stå efter pilen.", "");
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                if (Math.abs(pt.x - tr.x0) + Math.abs(pt.y - tr.y0) > 6) tr.flyttet = true;
                tr.x = pt.x;
                tr.y = pt.y;
                var bk = mig.brikker[tr.i];
                mig.overPlads = tr.flyttet ? mig.pladsVed(pt.x + tr.dx + bk.r.b / 2, pt.y + tr.dy + bk.r.h / 2) : null;
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = s === "brik" && !mig.loest ? "grab" : (s === "laerer" || s === "kop" ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        function slip() {
            var tr = mig.traek;
            if (!tr) return;
            mig.traek = null;
            var s = mig.overPlads;
            mig.overPlads = null;
            if (!tr.flyttet) { mig.placer(tr.i, null); return; }
            if (s !== null) mig.placer(tr.i, s);
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.1-intro-produkter", tilbud: "prod-tilbud", spring: "prod-spring" });

    P.pegPaaFelt = function () {};

    NK.SimProdukter = SimProdukter;
}());
