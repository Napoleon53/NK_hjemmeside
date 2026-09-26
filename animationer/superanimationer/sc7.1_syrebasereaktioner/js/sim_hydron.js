/* =====================================================================
   sim_hydron.js - fane 1: Hydronen

   To partikler staar paa scenen som strukturformler med frie
   elektronpar. Eleven tager fat i et H og slipper det paa den anden
   partikel. I det oejeblik H'et loeftes, bliver bindingens elektronpar
   hjemme som et frit par, og atomet faar en minusladning mere: det, der
   flyver, er H⁺. Slippes hydronen paa basen, lander den paa det
   naermeste frie par, og basen faar en plusladning mere.

   Tager eleven et H fra basen og slipper det paa syren, hopper det
   tilbage med en forklaring. Et H paa C sidder fast og ryster.
   Reaktionsskemaet under scenen faar produkterne og parrene foerst,
   naar hydronen er flyttet.

   Knappen: Giv hint -> Vis svaret -> Naeste reaktion. Efter alle ti
   gaar den videre til fane 2. Kemichael roser kun foerste gang. En
   hydron i kaffen er et paaskeaeg.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Syrebase;
    var M = NK.Mol;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc7.1-hydron";
    var GAB = 1.7;               /* bindingslaengder mellem de to partikler */

    function SimHydron() {
        this.L = new NK.Laerred(NK.el("hydron-laerred"));
        this.tid = 0;
        this.lay = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        var gemt = NK.hent(NOEGLE, null);
        this.loeste = gemt && gemt.loeste ? gemt.loeste.slice() : [];
        this.rostFoer = !!(gemt && gemt.rost);
        this.stjerner = [];
        this.kaffeNr = 0;
        this.brugtPil = this.loeste.length > 0;
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyOpgave(this.naesteUloeste(0));
    }

    var P = SimHydron.prototype;

    P.naesteUloeste = function (fra) {
        for (var i = 0; i < D.HYDRON.length; i++) {
            var n = (fra + i) % D.HYDRON.length;
            if (this.loeste.indexOf(n) < 0) return n;
        }
        return fra % D.HYDRON.length;
    };

    P.alleLoest = function () { return this.loeste.length >= D.HYDRON.length; };

    /* ----- En ny reaktion ------------------------------------------------------ */
    P.nyOpgave = function (nr) {
        var o = D.HYDRON[nr];
        this.opgNr = nr;
        var base = o.a === o.syre ? o.b : o.a;
        var aFoerst = o.fast || Math.random() < 0.5;
        this.ids = aFoerst ? [o.a, o.b] : [o.b, o.a];
        this.mols = [M.lav(this.ids[0], false), M.lav(this.ids[1], true)];
        this.rammer = this.mols.map(function (m) { return M.ramme(m); });
        this.syreSide = this.ids[0] === o.syre ? 0 : 1;
        this.opg = S.opgave(o.syre, base, this.syreSide === 0);
        this.hold = null;
        this.flyv = null;
        this.maal = null;
        this.overKop = false;
        this.spor = null;
        this.nyH = null;
        this.ryst = null;
        this.loest = false;
        this.hjaelp = 0;
        this.skemaT = 0;
        this.parT = 0;
        this.over = null;
        this.besked("", "");
        this.placer();
        this.visOpgave();
        this.visPar();
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        lay.kant = NK.klamp(W * 0.02, 10, 22);
        lay.bordY = H - NK.klamp(H * 0.09, 38, 60);
        lay.kop = { x: W - lay.kant - 34, y: lay.bordY };
        lay.fs = NK.klamp(Math.min(W / 34, H / 24), 17, 30);
        lay.capFs = NK.klamp(lay.fs * 0.78, 14, 21);
        lay.skemaY = lay.bordY - lay.fs * 2.05;
        var top = 14, bund = lay.skemaY - lay.fs * 1.3 - lay.capFs * 1.7;
        lay.mol = { x: lay.kant + 6, y: top, b: W - 2 * lay.kant - 12, h: Math.max(60, bund - top) };
        lay.maxB = NK.klamp(H * 0.15, 44, 112);
        this.lay = lay;
        this.placer();
        this.saetAnker("hydron-anker-skema", W * 0.18, lay.skemaY - lay.fs * 1.3, W * 0.64, lay.fs * 3.1);
    };

    /* Hvor de to partikler staar. Pladsen regnes ud fra reaktanterne med
       plads til et H paa hvert frit par, saa intet flytter sig, naar
       hydronen skifter side. */
    P.placer = function () {
        var lay = this.lay;
        if (!lay || !this.rammer) return;
        var r = this.rammer, fri = Math.max(0, (this.friBrugt || 0) - lay.mol.x);
        var omr = { x: lay.mol.x + fri, y: lay.mol.y, b: lay.mol.b - fri, h: lay.mol.h };
        var b = Math.min(lay.maxB, omr.b / (r[0].b + r[1].b + GAB), omr.h / Math.max(r[0].h, r[1].h));
        var ialt = (r[0].b + r[1].b + GAB) * b;
        var x = omr.x + (omr.b - ialt) / 2;
        var cy = omr.y + omr.h / 2;
        var pos = [];
        for (var i = 0; i < 2; i++) {
            pos.push({ ox: x - r[i].x0 * b, oy: cy - (r[i].y0 + r[i].h / 2) * b, x0: x, x1: x + r[i].b * b });
            x += r[i].b * b;
            if (i === 0) x += GAB * b;
        }
        this.b = b;
        this.pos = pos;
        this.plus = { x: (pos[0].x1 + pos[1].x0) / 2, y: cy };
        this.capY = cy + Math.max(r[0].h, r[1].h) * b / 2 + lay.capFs * 0.9;
        this.saetAnker("hydron-anker-mol", pos[0].x0 - 8, cy - Math.max(r[0].h, r[1].h) * b / 2 - 8,
            pos[1].x1 - pos[0].x0 + 16, Math.max(r[0].h, r[1].h) * b + lay.capFs * 1.6 + 16);
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

    /* ----- Positioner i pixels ------------------------------------------------------- */
    P.atomPx = function (side, i) {
        var p = this.pos[side];
        return Tg.atomPx(this.mols[side], i, p.ox, p.oy, this.b);
    };

    /* Det sted, hydronen sad (eller vil sidde), naar den er loeftet */
    P.hjemPx = function (side, info) {
        var p = this.pos[side];
        return { x: p.ox + info.x * this.b, y: p.oy + info.y * this.b };
    };

    P.molRekt = function (side) {
        var p = this.pos[side], r = this.rammer[side], b = this.b;
        return { x: p.x0 - b * 0.3, y: p.oy + r.y0 * b - b * 0.3, b: p.x1 - p.x0 + b * 0.6, h: r.h * b + b * 0.6 };
    };

    P.molUnder = function (pt) {
        for (var s = 0; s < 2; s++) {
            var R = this.molRekt(s);
            if (pt.x >= R.x && pt.x <= R.x + R.b && pt.y >= R.y && pt.y <= R.y + R.h) return s;
        }
        return null;
    };

    /* Det naermeste frie par, basen kan tage imod med: { atom, v, x, y } */
    P.parVed = function (side, pt) {
        var m = this.mols[side], p = this.pos[side], mm = Tg.molMaal(this.b), ctx = this.L.ctx, bedst = null;
        M.modtagere(m).forEach(function (i) {
            M.parVinkler(m, i).forEach(function (v) {
                var q = Tg.parPx(ctx, m, i, v, p.ox, p.oy, mm);
                var d = Math.hypot(q.x - pt.x, q.y - pt.y);
                if (!bedst || d < bedst.d) bedst = { atom: i, v: v, x: q.x, y: q.y, d: d };
            });
        });
        return bedst;
    };

    P.kopUnder = function (pt) {
        var lay = this.lay, kop = this.g.kaffekop;
        if (!lay || kop.skjult || kop.iHaand) return false;
        return Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60;
    };

    P.hvadErUnder = function (pt) {
        if (!this.lay || !this.pos) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        if (this.kopUnder(pt)) return { slags: "kop" };
        var bedst = null, b = this.b;
        for (var s = 0; s < 2; s++) {
            var m = this.mols[s];
            for (var i = 0; i < m.atomer.length; i++) {
                var a = m.atomer[i];
                if (a.vaek) continue;
                var q = this.atomPx(s, i), d = Math.hypot(q.x - pt.x, q.y - pt.y);
                var graense = a.s === "H" ? Math.max(14, b * 0.38) : Math.max(14, b * 0.42);
                if (d < graense && (!bedst || d < bedst.d)) bedst = { slags: a.s === "H" ? "H" : "atom", side: s, i: i, d: d };
            }
        }
        if (bedst) return bedst;
        var s2 = this.molUnder(pt);
        return s2 !== null ? { slags: "mol", side: s2 } : null;
    };

    /* ----- Handlingerne ---------------------------------------------------------------- */
    P.tagH = function (side, h, pt) {
        var info = M.fjernH(this.mols[side], h);
        if (!info) return;
        this.hold = { side: side, info: info, x: pt.x, y: pt.y, x0: pt.x, y0: pt.y, flyttet: false };
        this.spor = { side: side, atom: info.atom, v: info.v, t: 0 };
        this.brugtPil = true;
        if (this.afvisTilbud) this.afvisTilbud();
    };

    /* Hydronen flyver fra (x0, y0) til (x1, y1) og goer saa slut */
    P.flyvTil = function (fra, x1, y1, slut, tid, hoejde) {
        this.flyv = {
            x0: fra.x, y0: fra.y, x1: x1, y1: y1, t: 0, tid: tid || 0.45,
            h: hoejde === undefined ? Math.min(60, Math.abs(x1 - fra.x) * 0.2) : hoejde,
            slut: slut
        };
    };

    P.slip = function (pt) {
        var hold = this.hold;
        this.hold = null;
        this.maal = null;
        this.overKop = false;
        if (!hold) return;
        var hjem = this.hjemPx(hold.side, hold.info);
        if (!hold.flyttet) {
            M.tilbage(this.mols[hold.side], hold.info);
            this.spor = null;
            this.besked("Træk H'et over på den anden partikel.", "");
            return;
        }
        var fra = { x: hold.x, y: hold.y };
        if (this.kopUnder(pt)) {
            var lay = this.lay;
            this.flyvTil(fra, lay.kop.x, lay.kop.y - 30, { type: "kop", hold: hold }, 0.35, 20);
            return;
        }
        var s2 = this.molUnder(pt);
        if (s2 !== null && s2 !== hold.side) {
            var par = this.parVed(s2, pt);
            if (par && hold.side === this.syreSide) {
                this.flyvTil(fra, par.x, par.y, { type: "hos", hold: hold, side: s2, atom: par.atom, v: par.v }, 0.3, 10);
                return;
            }
            if (par) {
                this.besked(this.forkertVej(), "skidt");
                this.flyvTil(fra, par.x, par.y, { type: "retur", hold: hold, hjem: hjem }, 0.3, 10);
                return;
            }
        }
        this.flyvTil(fra, hjem.x, hjem.y, { type: "hjem", hold: hold }, 0.4);
    };

    /* Et H fra basen sluppet paa syren */
    P.forkertVej = function () {
        var base = this.ids[1 - this.syreSide], X = S.formel(base), A = S.formel(this.opg.syre);
        return S.kanGive(base) ?
            X + " kan godt afgive en hydron, men over for " + A + " tager den imod en. Tag et H fra " + A + "." :
            X + " afgiver ikke en hydron. Den tager imod en med et frit elektronpar. Tag et H fra " + A + ".";
    };

    P.flyvFaerdig = function (f) {
        var s = f.slut;
        if (s.type === "hos") {
            var h = M.tilfoejH(this.mols[s.side], s.atom, s.v);
            this.nyH = { side: s.side, h: h, t: 0 };
            this.loes();
            return;
        }
        if (s.type === "retur") {
            this.flyvTil({ x: f.x1, y: f.y1 }, s.hjem.x, s.hjem.y, { type: "hjem", hold: s.hold }, 0.55, 40);
            return;
        }
        if (s.type === "kop") {
            var hjem = this.hjemPx(s.hold.side, s.hold.info);
            this.plop = { x: f.x1, y: f.y1 + 8, t: 0 };
            if (this.laererKaffeSur) this.laererKaffeSur();
            this.flyv = null;
            this.ventHjem = { t: 0.7, hold: s.hold, x: hjem.x, y: hjem.y, fra: { x: f.x1, y: f.y1 } };
            return;
        }
        /* hjem: hydronen saettes paa igen, hvor den sad */
        M.tilbage(this.mols[s.hold.side], s.hold.info);
        this.spor = null;
        this.flyv = null;
    };

    P.loes = function () {
        this.flyv = null;
        this.loest = true;
        this.skemaT = 0;
        this.parT = 0;
        if (this.loeste.indexOf(this.opgNr) < 0) this.loeste.push(this.opgNr);
        var A = S.formel(this.opg.syre), B = S.formel(this.opg.base);
        this.besked("<b>Rigtigt.</b> " + NK.html(A) + " afgav en hydron, og " + NK.html(B) + " tog imod den.", "god");
        this.fejr();
        if (this.alleLoest() && !this.rostFoer) {
            this.rostFoer = true;
            this.ventRos = 1.4;
        }
        this.gem();
        this.visOpgave();
        this.visPar();
    };

    P.fejr = function () {
        var s = 1 - this.syreSide, p = this.pos[s];
        for (var i = 0; i < 7; i++) {
            this.stjerner.push({ x: NK.lerp(p.x0, p.x1, Math.random()), y: this.plus.y + (Math.random() - 0.5) * this.b * 2, t: -i * 0.06, r: 5 + Math.random() * 5 });
        }
    };

    /* Vis svaret: et H fra syren flyver over paa basens frie par */
    P.visSvar = function () {
        if (this.loest || this.hold || this.flyv) return;
        var mig = this, s = this.syreSide, s2 = 1 - s, m = this.mols[s];
        var mod = this.pos[s2].ox;
        var hs = M.loseH(m).sort(function (a, b) {
            return Math.abs(mig.atomPx(s, a).x - mod) - Math.abs(mig.atomPx(s, b).x - mod);
        });
        var h = hs[0], fra = this.atomPx(s, h);
        var info = M.fjernH(m, h);
        this.spor = { side: s, atom: info.atom, v: info.v, t: 0 };
        var par = this.parVed(s2, fra);
        this.hjaelp = 2;
        this.flyvTil(fra, par.x, par.y, { type: "hos", hold: { side: s, info: info }, side: s2, atom: par.atom, v: par.v }, 1.1, 70);
        this.besked("Sådan: et H fra " + NK.html(S.formel(this.opg.syre)) + " over på " + NK.html(S.formel(this.opg.base)) + ".", "gul");
        this.visOpgave();
    };

    P.knap = function () {
        if (this.loest) {
            if (this.alleLoest()) {
                var n = this.naesteUloesteEfter();
                if (n === null) {
                    var fane = document.querySelector('[data-fane="fane-produkter"]');
                    if (fane) fane.click();
                    return;
                }
            }
            this.nyOpgave(this.naesteUloeste(this.opgNr + 1));
            return;
        }
        if (this.hold || this.flyv) return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(D.HYDRON[this.opgNr].hint), "gul");
            this.visOpgave();
            return;
        }
        this.visSvar();
    };

    /* Efter alle ti: der er ingen uloeste, saa knappen gaar videre */
    P.naesteUloesteEfter = function () {
        return this.alleLoest() ? null : this.naesteUloeste(this.opgNr + 1);
    };

    P.gem = function () {
        NK.gem(NOEGLE, { loeste: this.loeste, rost: this.rostFoer });
    };

    /* Start forfra (knappen i panelet og R): ingen loeste, reaktion 1 */
    P.nulstil = function () {
        this.loeste = [];
        this.gem();
        if (this.laererNyt) this.laererNyt();
        this.nyOpgave(0);
    };

    P.enter = function () {
        if (this.loest) this.knap();
    };

    P.fokus = function () {};
    P.tast = function () { return false; };

    /* ----- Panelet ------------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("hydron-knap"),
            besked: NK.el("hydron-besked"),
            kort: NK.el("hydron-kort")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("hydron-forfra").addEventListener("click", function () { mig.nulstil(); });
        NK.el("hydron-spring").addEventListener("click", function () { mig.springIntro(); });
        NK.el("hydron-pips").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-nr]") : null;
            if (!k || mig.hold || mig.flyv) return;
            mig.nyOpgave(parseInt(k.getAttribute("data-nr"), 10));
        });
    };

    P.besked = function (html, klasse) {
        this.beskedKlasse = klasse;
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visOpgave = function () {
        var mig = this;
        NK.saetHTML("hydron-taeller", "<b>" + (this.opgNr + 1) + "</b>/" + D.HYDRON.length);
        NK.saetTekst("hydron-tekst", D.HYDRON[this.opgNr].tekst);
        NK.saetHTML("hydron-pips", D.HYDRON.map(function (o, i) {
            var klar = mig.loeste.indexOf(i) >= 0, nu = i === mig.opgNr;
            var titel = S.formel(o.a) + " + " + S.formel(o.b);
            return '<button type="button" class="pip' + (klar ? " klar" : "") + (nu ? " nu" : "") + '" data-nr="' + i +
                '" title="' + NK.html(titel) + '">' + (klar ? "✓" : (i + 1)) + "</button>";
        }).join(""));
        var tekst, klasse = "knap";
        if (this.loest) {
            tekst = this.alleLoest() && this.naesteUloesteEfter() === null ? "Videre til Produkterne" : "Næste reaktion";
            klasse = "knap blaa banker";
        } else {
            tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = !this.loest && this.hjaelp === 2;
        this.el.kort.classList.toggle("sejr", this.loest);
    };

    /* Kortet med parrene: ét par af hver farve for hver loest reaktion */
    P.visPar = function () {
        var mig = this;
        var liste = D.HYDRON.map(function (o, i) { return { o: o, i: i }; })
            .filter(function (x) { return mig.loeste.indexOf(x.i) >= 0; });
        NK.saetHTML("hydron-par-tal", liste.length + "/" + D.HYDRON.length);
        if (!liste.length) {
            NK.saetHTML("hydron-parliste", '<p class="note">Parrene fra dine reaktioner samles her.</p>');
            return;
        }
        NK.saetHTML("hydron-parliste", '<div class="parhoved"><span>syre / korresp. base</span><span>syre / korresp. base</span></div>' +
            liste.map(function (x) {
                var base = x.o.a === x.o.syre ? x.o.b : x.o.a;
                var o = S.opgave(x.o.syre, base, true);
                return '<div class="parlinje"><span class="par-a">' + NK.html(S.formel(o.syre) + " / " + S.formel(o.kb)) +
                    '</span><span class="par-b">' + NK.html(S.formel(o.ks) + " / " + S.formel(o.base)) + "</span></div>";
            }).join(""));
    };

    P.visStatus = function () {
        var t;
        if (this.hold && this.hold.flyttet) {
            t = this.maal ? "Slip: det frie elektronpar tager imod hydronen." :
                "Hydronen er et H uden sin elektron. Slip den på den anden partikel.";
        } else if (this.loest) {
            t = "<b>" + NK.html(S.formel(this.opg.kb)) + "</b> og <b>" + NK.html(S.formel(this.opg.ks)) + "</b> er dannet. Skemaet viser parrene.";
        } else if (this.opgNr === 0 && !this.brugtPil) {
            t = "Tag fat i H'et på HCl, og slip det på vandmolekylet.";
        } else {
            t = "Tag fat i et H, og slip det på den anden partikel.";
        }
        NK.saetHTML("hydron-status", t);
    };

    /* ----- Tegneloekken -------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.flyv) {
            this.flyv.t += dt / this.flyv.tid;
            if (this.flyv.t >= 1) {
                var f = this.flyv;
                this.flyv = null;
                this.flyvFaerdig(f);
            }
        }
        if (this.ventHjem) {
            this.ventHjem.t -= dt;
            if (this.ventHjem.t <= 0) {
                var v = this.ventHjem;
                this.ventHjem = null;
                this.flyvTil(v.fra, v.x, v.y, { type: "hjem", hold: v.hold }, 0.6, 50);
            }
        }
        if (this.spor) this.spor.t += dt;
        if (this.nyH) this.nyH.t += dt;
        if (this.ryst) { this.ryst.t += dt; if (this.ryst.t > 0.45) this.ryst = null; }
        if (this.plop) { this.plop.t += dt; if (this.plop.t > 0.6) this.plop = null; }
        if (this.loest) {
            this.skemaT = Math.min(1, this.skemaT + dt / 0.5);
            if (this.skemaT >= 1) this.parT = Math.min(1, this.parT + dt / 0.6);
        }
        this.stjerner = this.stjerner.filter(function (s) { s.t += dt; return s.t < 1.2; });
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        if (this.opdaterFri && this.opdaterFri(dt)) this.placer();
        this.visStatus();
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.pos) return;
        var mig = this, b = this.b;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        var kop = this.g.kaffekop, kk = NK.klamp(lay.H / 600, 0.8, 1.4);
        if (!kop.skjult && !kop.iHaand) NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        if (this.plop) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (1 - this.plop.t / 0.6) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(this.plop.x, this.plop.y, 8 + this.plop.t * 30, 3 + this.plop.t * 8, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        /* Plusset mellem de to partikler */
        Tg.formelTekst(ctx, "+", this.plus.x, this.plus.y, NK.klamp(b * 0.5, 18, 36), "#a9b0ba", 1, "400");

        /* Partiklerne */
        for (var s = 0; s < 2; s++) {
            var p = this.pos[s], o = {};
            if (this.over && this.over.slags === "H" && this.over.side === s && !this.hold && !this.loest && !this.flyv) o.lysH = this.over.i;
            if (this.maal && this.hold && this.maalSide === s) o.lysPar = { atom: this.maal.atom, v: this.maal.v };
            if (this.ryst && this.ryst.side === s) o.ryst = this.ryst;
            if (this.spor && this.spor.side === s) o.spor = this.spor;
            if (this.nyH && this.nyH.side === s) o.nyH = this.nyH;
            Tg.molekyle(ctx, this.mols[s], p.ox, p.oy, b, o);
            Tg.formelTekst(ctx, S.formel(this.mols[s].art), (p.x0 + p.x1) / 2, this.capY, lay.capFs, "#c8ced6", 1, "600");
        }

        this.tegnSkema(ctx);

        /* Hydronen i haanden eller paa vej */
        var hr = NK.klamp(b * 0.3, 13, 24);
        if (this.hold && this.hold.flyttet) Tg.hydron(ctx, this.hold.x, this.hold.y, hr, 1, !!this.maal);
        else if (this.hold) Tg.hydron(ctx, this.hold.x, this.hold.y, hr, 0.9, false);
        if (this.flyv) {
            var f = this.flyv, q = Tg.bue(f.x0, f.y0, f.x1, f.y1, f.h, f.t);
            Tg.hydron(ctx, q.x, q.y, hr, f.slut.type === "kop" ? 1 - f.t * 0.6 : 1, true);
        }

        this.stjerner.forEach(function (st) {
            if (st.t > 0) Tg.stjerne(ctx, st.x, st.y - st.t * 30, st.r, 1 - st.t / 1.2);
        });

        /* Foerste gang: en pil fra syrens H til basens frie par */
        if (this.opgNr === 0 && !this.brugtPil && !this.loest && !this.hold && !this.flyv) {
            var sa = this.syreSide, hH = M.loseH(this.mols[sa])[0];
            if (hH !== undefined) {
                var fra = this.atomPx(sa, hH), til = this.parVed(1 - sa, fra);
                if (til) Tg.buePil(ctx, fra.x, fra.y - b * 0.35, til.x, til.y - 6, this.tid);
            }
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* Skemaet: reaktanterne fra start, produkterne og parrene naar
       hydronen er flyttet */
    P.tegnSkema = function (ctx) {
        var mig = this, lay = this.lay, fs = lay.fs, o = this.opg, y = lay.skemaY;
        var tekster = o.reaktanter.concat(o.produkter).map(function (id) { return S.formel(id); });
        var felter = tekster.map(function (t) { return { b: Tg.tekstBredde(ctx, t, fs) + fs * 0.9 }; });
        var sk = Tg.skemaPlacer(ctx, felter, fs, (Math.max(0, this.friBrugt || 0) + lay.W) / 2);
        var maerker = [o.reaktanter[0] === o.syre ? "syre" : "base", o.reaktanter[1] === o.syre ? "syre" : "base"];
        maerker = maerker.concat(maerker.map(function (mk) { return mk === "syre" ? "kb" : "ks"; }));
        for (var i = 0; i < 4; i++) {
            var alfa = i < 2 ? 1 : this.skemaT;
            if (alfa > 0) Tg.formelTekst(ctx, tekster[i], sk.x[i], y, fs, this.loest ? Tg.PAR_FARVE[maerker[i]] : Tg.TEKST, alfa);
        }
        this.skemaX = sk.x;
        sk.tegn.forEach(function (t, k) {
            Tg.formelTekst(ctx, t.t, t.x, y, fs, "#a9b0ba", k === 2 ? mig.skemaT : 1, "400");
        });
        if (this.loest && this.parT > 0) Tg.par(ctx, sk.x, maerker, y, fs, this.parT, { maerker: true });
    };

    /* ----- Musen -------------------------------------------------------------------------------- */
    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); return; }
            if (u.slags === "kop") { if (mig.klikKop && !mig.hold) mig.klikKop(); return; }
            if (mig.loest) { mig.besked("Reaktionen er færdig. Tryk Næste reaktion.", ""); return; }
            if (mig.flyv || mig.hold) return;
            if (u.slags === "H") {
                var m = mig.mols[u.side];
                if (M.fasteH(m).indexOf(u.i) >= 0) {
                    mig.ryst = { side: u.side, h: u.i, t: 0 };
                    mig.besked("Et H bundet til C bliver siddende. Det sure H sidder på O.", "");
                    return;
                }
                mig.tagH(u.side, u.i, pt);
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                return;
            }
            mig.besked("Tag fat i et H, og træk det over på den anden partikel.", "");
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), hold = mig.hold;
            if (hold) {
                if (Math.abs(pt.x - hold.x0) + Math.abs(pt.y - hold.y0) > 6) hold.flyttet = true;
                hold.x = pt.x;
                hold.y = pt.y;
                var s2 = mig.molUnder(pt);
                mig.maal = s2 !== null && s2 !== hold.side ? mig.parVed(s2, pt) : null;
                mig.maalSide = s2;
                mig.overKop = mig.kopUnder(pt);
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            var kanTage = s === "H" && !mig.loest && M.fasteH(mig.mols[mig.over.side]).indexOf(mig.over.i) < 0;
            c.style.cursor = kanTage ? "grab" : (s === "laerer" || s === "kop" || s === "H" ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.hold) { mig.over = null; c.style.cursor = "default"; } });
        function slip(e) {
            if (!mig.hold) return;
            mig.slip(mig.L.punkt(e));
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.1-intro-hydron", tilbud: "hydron-tilbud", spring: "hydron-spring" });

    P.pegPaaFelt = function () {};

    NK.SimHydron = SimHydron;
}());
