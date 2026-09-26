/* =====================================================================
   sim_par.js - fane 3: Parrene

   En hel reaktion staar paa tavlen. Under hver formel er en tom plads,
   og nederst sidder fire maerkater: syre, base, korresponderende base
   og korresponderende syre. Maerkaterne har parrenes farver fra start
   (syren og dens korresponderende base blaa, basen og dens
   korresponderende syre lilla). Eleven traekker et maerkat hen under en
   formel, eller klikker paa maerkatet og saa paa formlen.

   Et forkert maerkat hopper tilbage med en forklaring, der passer til
   fejlen (NK.Syrebase.maerkeFejl): syre og base efter pilen, syre paa
   en amfolyt, der her tager imod, osv. Produkterne staar i tilfaeldig
   orden, saa parrene ikke altid staar over hinanden. Naar alle fire
   sidder, flyver hydronen, og klammerne viser parrene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Syrebase;
    var Tg = NK.Tegn;
    var Tv = NK.Tavle;

    var NOEGLE = "nk-sc7.1-par";
    var KRIDT = "#f3f1ea";

    function SimPar() {
        this.L = new NK.Laerred(NK.el("par-laerred"));
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

    var P = SimPar.prototype;

    P.nyOpgave = function () {
        var o = S.nyOpgave(S.niveau, this.seneste);
        this.seneste.push(o.noegle);
        if (this.seneste.length > 4) this.seneste.shift();
        this.opg = o;
        var prod = Math.random() < 0.5 ? o.produkter.slice() : o.produkter.slice().reverse();
        this.arter = o.reaktanter.concat(prod);
        this.kol = [null, null, null, null];
        this.brikker = S.MAERKER.map(function (mk) { return { mk: mk, tekst: S.MAERKE_TEKST[mk], kol: null }; });
        this.valgt = null;
        this.loest = false;
        this.fejl = false;
        this.vist = false;
        this.hjaelp = 0;
        this.traek = null;
        this.over = null;
        this.overKol = null;
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

    P.stil = function () {
        var lay = this.lay;
        if (!lay || !this.opg) return;
        var ctx = this.L.ctx, mig = this;
        /* Under praesentationen staar Kemichael foran tavlens venstre del */
        var fri = Math.max(0, (this.friBrugt || 0) - lay.R.x);
        var R = { x: lay.R.x + fri, y: lay.R.y, b: lay.R.b - fri, h: lay.R.h };
        var tekster = this.arter.map(function (id) { return S.formel(id); });
        function proev(k, toLinjer) {
            mig.brikker.forEach(function (bk) {
                bk.tekst = toLinjer ? S.MAERKE_TEKST[bk.mk].replace(" ", "\n") : S.MAERKE_TEKST[bk.mk];
            });
            var fs = lay.fs * k, bfs = NK.klamp(lay.bfs * k * 0.8, 14, 24);
            /* Under pladserne og den nederste klamme */
            var y0 = Math.max(lay.ligY + fs * 1.75 + bfs * (toLinjer ? 2.8 : 1.75) + 6, lay.brikY0);
            var st = Tv.stilBrikker(ctx, mig.brikker, R, y0, lay.brikY1, bfs);
            var felter = tekster.map(function (t) { return { b: Math.max(Tg.tekstBredde(ctx, t, fs) + fs * 0.9, st.b + fs * 0.35) }; });
            return { fs: fs, bfs: bfs, st: st, felter: felter, sk: Tg.skemaPlacer(ctx, felter, fs, R.x + R.b / 2) };
        }
        /* For bredt: foerst mindre, saa maerkaterne paa to linjer */
        var v = proev(1, false);
        if (v.sk.ialt > R.b * 0.95) v = proev(R.b * 0.95 / v.sk.ialt, false);
        if (v.sk.ialt > R.b * 0.95) {
            v = proev(1, true);
            if (v.sk.ialt > R.b * 0.95) v = proev(R.b * 0.95 / v.sk.ialt, true);
        }
        this.fs = v.fs;
        this.bfs = v.bfs;
        this.sk = v.sk;
        this.felter = v.felter;
        this.hjem = this.brikker.map(function (bk) { return { x: bk.r.x, y: bk.r.y, b: bk.r.b, h: bk.r.h }; });
        var py = lay.ligY + v.fs * 0.8;
        this.pladsR = v.sk.x.map(function (x) { return { x: x - v.st.b / 2, y: py, b: v.st.b, h: v.st.h }; });
        this.underY = py + v.st.h + 6;
        this.saetAnker("par-anker-lign", R.x + 10, lay.ligY - this.fs * 1.4, R.b - 20, this.underY - lay.ligY + this.fs * 1.9);
        var y0 = Math.min.apply(null, this.hjem.map(function (r) { return r.y; }));
        var y1 = Math.max.apply(null, this.hjem.map(function (r) { return r.y + r.h; }));
        this.saetAnker("par-anker-brikker", R.x + 10, y0 - 8, R.b - 20, y1 - y0 + 16);
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

    /* Brikkens plads: hjemme i bunden eller i sin kolonne */
    P.brikR = function (i) {
        var bk = this.brikker[i];
        return bk.kol === null ? this.hjem[i] : this.pladsR[bk.kol];
    };

    /* ----- Handlingerne ---------------------------------------------------------------- */
    P.saet = function (i, k) {
        if (this.loest || k === null || k === undefined) return;
        var bk = this.brikker[i];
        if (bk.kol !== null) return;
        if (this.afvisTilbud) this.afvisTilbud();
        this.valgt = null;
        if (this.kol[k]) {
            this.besked(NK.html(S.formel(this.arter[k])) + " har allerede et mærkat.", "");
            return;
        }
        var fejl = S.maerkeFejl(this.opg, bk.mk, this.arter[k], k < 2);
        if (!fejl) {
            bk.kol = k;
            this.kol[k] = bk.mk;
            if (this.kol.every(function (m) { return m; })) { this.loes(); return; }
            this.besked("<b>" + NK.html(S.formel(this.arter[k])) + "</b> er " + S.MAERKE_LANG[bk.mk] + ".", "god");
            return;
        }
        this.fejl = true;
        this.glimt = { k: k, t: 0 };
        if (this.iTraek) this.iTraek = 0;
        this.besked(NK.html(fejl), "skidt");
        this.visOpgave();
    };

    P.loes = function () {
        this.loest = true;
        this.bueT = 0;
        this.parT = 0;
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
            this.fejr();
        } else {
            this.iTraek = 0;
        }
        var o = this.opg;
        this.besked((this.vist ? "Sådan. " : "<b>Rigtigt.</b> ") + NK.html(S.formel(o.syre) + " og " + S.formel(o.kb)) +
            " er det ene par, " + NK.html(S.formel(o.base) + " og " + S.formel(o.ks)) + " det andet.", this.vist ? "gul" : "god");
        this.visOpgave();
    };

    P.fejr = function () {
        for (var i = 0; i < 7; i++) {
            this.stjerner.push({ x: this.sk.x[i % 4] + (Math.random() - 0.5) * 60, y: this.lay.ligY - this.fs * 0.5,
                t: -0.5 - i * 0.06, r: 5 + Math.random() * 5 });
        }
    };

    /* Hvor hvert maerkat skal sidde (til Vis svaret) */
    P.facit = function () {
        var o = this.opg, a = this.arter, ud = {};
        ud.syre = a.indexOf(o.syre);
        ud.base = a.indexOf(o.base);
        ud.kb = a[2] === o.kb || S.formel(a[2]) === S.formel(o.kb) ? 2 : 3;
        ud.ks = ud.kb === 2 ? 3 : 2;
        return ud;
    };

    P.knap = function () {
        if (this.loest) { this.nyOpgave(); return; }
        var o = this.opg;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(S.formel(o.syre) + " og " + S.formel(o.kb)) +
                " er det ene par. De er ens bortset fra én H⁺.", "gul");
            this.visOpgave();
            return;
        }
        this.vist = true;
        var f = this.facit(), mig = this;
        this.brikker.forEach(function (bk) { bk.kol = f[bk.mk]; mig.kol[f[bk.mk]] = bk.mk; });
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
        this.el = { knap: NK.el("par-knap"), besked: NK.el("par-besked"), kort: NK.el("par-kort") };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("par-spring").addEventListener("click", function () { mig.springIntro(); });
        Tv.bindNiveau("par-niveau", this);
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visOpgave = function () {
        var rek = this.rekord[S.niveau] || 0;
        NK.saetHTML("par-taeller", "<b>" + this.iTraek + "</b> i træk · rekord " + rek);
        var tekst, klasse = "knap";
        if (this.loest) { tekst = "Ny reaktion"; klasse = "knap blaa banker"; }
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.loest && !this.vist);
    };

    P.visStatus = function () {
        var t, tr = this.traek;
        var n = this.kol.filter(function (m) { return m; }).length;
        if (tr && tr.flyttet) t = this.overKol !== null ? "Slip mærkatet under formlen." : "Træk mærkatet hen under en formel.";
        else if (this.loest) t = "Klammen over viser syren og dens korresponderende base. Klammen under basen og dens korresponderende syre.";
        else if (this.valgt !== null) t = "Klik nu på den formel, mærkatet hører til.";
        else if (n === 0) t = "Træk hvert mærkat hen under den formel, det passer til.";
        else t = (4 - n) + (4 - n === 1 ? " mærkat" : " mærkater") + " mangler.";
        NK.saetHTML("par-status", t);
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
        var mig = this, fs = this.fs, y = lay.ligY, sk = this.sk;
        Tv.tegnBaggrund(ctx, lay, this.g.kaffekop);

        this.arter.forEach(function (id, i) {
            Tg.formelTekst(ctx, S.formel(id), sk.x[i], y, fs, mig.loest ? Tg.PAR_FARVE[mig.kol[i]] : KRIDT);
        });
        sk.tegn.forEach(function (t) { Tg.formelTekst(ctx, t.t, t.x, y, fs, "rgba(243, 241, 234, 0.75)", 1, "400"); });
        this.pladsR.forEach(function (r, k) {
            if (mig.kol[k]) return;
            Tg.plads(ctx, r, {
                lys: mig.overKol === k || (mig.valgt !== null && mig.over && mig.over.slags === "kol" && mig.over.k === k),
                roed: mig.glimt && mig.glimt.k === k ? 1 - mig.glimt.t / 0.7 : 0
            });
        });

        if (this.loest) {
            var o = this.opg;
            Tv.hydronBue(ctx, sk.x[this.arter.indexOf(o.syre)], sk.x[this.arter.indexOf(o.base)], y, fs, this.bueT);
            if (this.parT > 0) Tg.par(ctx, sk.x, this.kol, y, fs, this.parT, { under: this.underY });
        }

        var tr = this.traek;
        this.brikker.forEach(function (bk, i) {
            if (tr && tr.i === i && tr.flyttet) return;
            var lys = bk.kol === null && ((mig.over && mig.over.slags === "brik" && mig.over.i === i) || mig.valgt === i);
            Tg.brik(ctx, mig.brikR(i), bk.tekst, { fs: mig.bfs, farve: Tg.PAR_FARVE[bk.mk], lys: lys });
        });
        if (tr && tr.flyttet) {
            var bk = this.brikker[tr.i], r = this.hjem[tr.i];
            Tg.brik(ctx, { x: tr.x + tr.dx, y: tr.y + tr.dy, b: r.b, h: r.h }, bk.tekst,
                { fs: this.bfs, farve: Tg.PAR_FARVE[bk.mk], lys: true, loeftet: true });
        }

        this.stjerner.forEach(function (st) {
            if (st.t > 0) Tg.stjerne(ctx, st.x, st.y - st.t * 30, st.r, 1 - st.t / 1.2);
        });
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ----------------------------------------------------------------------------------- */
    P.kolVed = function (pt, luft) {
        var lay = this.lay;
        for (var k = 0; k < 4; k++) {
            var hb = this.felter[k].b / 2;
            if (Math.abs(pt.x - this.sk.x[k]) <= hb && pt.y >= lay.ligY - this.fs * 0.8 - (luft || 0) &&
                pt.y <= this.pladsR[k].y + this.pladsR[k].h + (luft || 0)) return k;
        }
        return null;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay || !this.sk) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        if (Tv.kopUnder(lay, this.g.kaffekop, pt)) return { slags: "kop" };
        for (var i = 0; i < this.brikker.length; i++) {
            if (Tv.inde(pt, this.brikR(i))) return { slags: "brik", i: i };
        }
        var k = this.kolVed(pt, 0);
        return k !== null ? { slags: "kol", k: k } : null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) { mig.valgt = null; return; }
            if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); return; }
            if (u.slags === "kop") { if (mig.klikKop) mig.klikKop(); return; }
            if (mig.loest) { mig.besked("Tryk Ny reaktion for en ny.", ""); return; }
            if (u.slags === "brik") {
                var bk = mig.brikker[u.i];
                if (bk.kol !== null) { mig.besked("Det mærkat sidder rigtigt.", ""); return; }
                var r = mig.hjem[u.i];
                mig.traek = { i: u.i, x0: pt.x, y0: pt.y, x: pt.x, y: pt.y, dx: r.x - pt.x, dy: r.y - pt.y, flyttet: false };
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                return;
            }
            if (u.slags === "kol") {
                if (mig.valgt !== null) { mig.saet(mig.valgt, u.k); return; }
                mig.besked("Træk et mærkat hen under " + NK.html(S.formel(mig.arter[u.k])) + ".", "");
            }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                if (Math.abs(pt.x - tr.x0) + Math.abs(pt.y - tr.y0) > 6) tr.flyttet = true;
                tr.x = pt.x;
                tr.y = pt.y;
                var r = mig.hjem[tr.i];
                mig.overKol = tr.flyttet ? mig.kolVed({ x: pt.x + tr.dx + r.b / 2, y: pt.y + tr.dy + r.h / 2 }, mig.fs * 0.6) : null;
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            var fri = s === "brik" && mig.brikker[mig.over.i].kol === null && !mig.loest;
            c.style.cursor = fri ? "grab" : (s === "laerer" || s === "kop" || (s === "kol" && mig.valgt !== null) ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        function slip() {
            var tr = mig.traek;
            if (!tr) return;
            mig.traek = null;
            var k = mig.overKol;
            mig.overKol = null;
            if (!tr.flyttet) {
                mig.valgt = mig.valgt === tr.i ? null : tr.i;
                if (mig.valgt !== null) mig.besked("Klik på den formel, <b>" + NK.html(S.MAERKE_TEKST[mig.brikker[tr.i].mk]) + "</b> hører til.", "");
                return;
            }
            if (k !== null) mig.saet(tr.i, k);
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.1-intro-par", tilbud: "par-tilbud", spring: "par-spring" });

    P.pegPaaFelt = function () {};

    NK.SimPar = SimPar;
}());
