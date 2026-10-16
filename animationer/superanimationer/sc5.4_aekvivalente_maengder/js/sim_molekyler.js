/* =====================================================================
   sim_molekyler.js - fane 2: molekylerne

   Skiltet paa vaeggen viser reaktionsskemaet med lige saa mange figurer
   under hver formel, som koefficienten siger. Eleven traekker figurer fra
   kasserne ind i kammeret (et klik paa en kasse virker ogsaa) og trykker
   Start. Saa reagerer de i hele saet efter skemaet: molekylerne i et saet
   samles, atomerne bytter partnere og danner produkterne. Det, der ikke
   passer ind i et helt saet, bliver tilbage med en orange ring.

   Fra maal 4 er hver figur 1 mol molekyler (en pose med "1 mol"), og
   plakaten siger det. Forholdet er det samme, fordi 1 mol bare er et
   antal. Kammeret regner ogsaa i mol ved at taelle poser.

   Fem maal (D.MAAL). Knappen giver et hint og saa svaret. Bagefter er der
   frit valg af reaktion og enhed. Hvor langt eleven er naaet, huskes
   under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc4.4-molekyler";
    var FLYV = 0.4;
    var SAML = 0.5;            /* molekylerne i et saet samles */
    var BYT = 0.85;            /* atomerne flytter til produkterne */
    var FORSKYD = 0.14;        /* saettene reagerer efter hinanden */

    function SimMolekyler() {
        this.L = new NK.Laerred(NK.el("molekyler-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.enheder = [];
        this.fase = "fyld";
        this.reak = null;
        this.foer = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.nr = NK.klamp(gemt.maal || 0, 0, D.MAAL.length);
        this.rost = this.nr >= D.MAAL.length;
        this.fri = { r: "vand", enhed: "stk" };

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.startMaal();
    }

    var P = SimMolekyler.prototype;

    /* ----- Hvad der vises: maalets reaktion og enhed, eller det frie valg ------------ */
    P.maal = function () { return D.MAAL[this.nr] || null; };
    P.r = function () { var m = this.maal(); return D.reaktion(m ? m.r : this.fri.r); };
    P.enhed = function () { var m = this.maal(); return m ? m.enhed : this.fri.enhed; };

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.9);
        var luft = NK.klamp(H * 0.1, 10, 74);
        var pb = NK.klamp(W * 0.22, 130, 230);
        lay.plakat = { x: W - kant - pb, y: luft, b: pb, h: Math.round(pb * 0.42) };
        var sb = lay.plakat.x - kant - 16;
        lay.skilt = { x: kant, y: luft, b: sb, h: this.skiltMaal(sb).h };
        var top = Math.max(lay.skilt.y + lay.skilt.h, lay.plakat.y + lay.plakat.h) + 14;

        /* Kasserne til venstre paa bordet, kammeret til hoejre */
        var r = this.r();
        var kb = NK.klamp(W * 0.12, 64, 124), kh = Math.round(kb * 0.62);
        lay.kop = { x: kant + 24, y: lay.bordY };
        lay.kasser = r.reaktanter.map(function (l, i) {
            return { s: l.s, x: kant + 64 + kb / 2 + i * (kb + 14), y: lay.bordY, b: kb, h: kh };
        });
        var venstre = kant + 64 + r.reaktanter.length * (kb + 14) + 10;
        var M = NK.Sprites.MAAL.kammer;
        var kamB = Math.min(W - kant - venstre - 6, (lay.bordY - top) * M.b / M.h, 560);
        kamB = Math.max(kamB, 180);
        lay.kammer = { x: Math.round(NK.klamp((venstre + W - kant) / 2, venstre + kamB / 2, W - kant - kamB / 2)), y: lay.bordY, b: kamB };
        var k = kamB / M.b;
        lay.ind = { x: lay.kammer.x - kamB / 2 + M.indV * k, y: lay.bordY - M.bund * k + M.indTop * k,
            b: (M.indH - M.indV) * k, h: (M.indBund - M.indTop) * k };
        lay.knap = { x: lay.kammer.x - Math.min(110 * k, kamB * 0.4) / 2, y: lay.bordY - M.bund * k + 212 * k,
            b: Math.min(110 * k, kamB * 0.4), h: 26 * k };
        /* Figurernes stoerrelse i kammeret */
        lay.s = NK.klamp(lay.ind.b / 22, 6, 22);
        lay.R = NK.klamp(lay.ind.b / 13, 16, 36);
        this.lay = lay;
        this.holdInde();

        this.saetAnker("molekyler-anker-skilt", lay.skilt.x, lay.skilt.y, lay.skilt.b, lay.skilt.h);
        this.saetAnker("molekyler-anker-plakat", lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h);
        var k0 = lay.kasser[0], k1 = lay.kasser[lay.kasser.length - 1];
        this.saetAnker("molekyler-anker-kasser", k0.x - kb / 2, lay.bordY - kh * 1.35, k1.x + kb / 2 - (k0.x - kb / 2), kh * 1.35);
        this.saetAnker("molekyler-anker-kammer", lay.kammer.x - kamB / 2, lay.bordY - M.bund * k, kamB, M.bund * k);
    };

    /* Skiltets maal uden at tegne det */
    P.skiltMaal = function (b) {
        var ctx = this.L.ctx;
        ctx.save();
        ctx.globalAlpha = 0;
        var s = Tg.skemaSkilt(ctx, -9999, -9999, b, this.r(), this.enhed(), {});
        ctx.restore();
        return s;
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

    /* ----- Figurerne i kammeret ----------------------------------------------------------
       En figur er { st, x, y, vx, vy, a, va, fra, t, maal, hjem, rest, skjult }. */
    P.radius = function (st) {
        var lay = this.lay;
        return this.enhed() === "mol" ? lay.R : st.radius * lay.s;
    };

    P.stoerrelse = function () {
        return this.enhed() === "mol" ? this.lay.R : this.lay.s;
    };

    P.i = function () {
        return this.enheder.filter(function (u) { return !u.hjem; });
    };

    P.antal = function (s) {
        return this.enheder.filter(function (u) { return !u.hjem && !u.skjult && u.st.id === s; }).length;
    };

    P.iLuften = function () {
        return this.enheder.some(function (u) { return u.fra || u.venter > 0; });
    };

    /* Et tilfaeldigt sted i kammeret, hvor en figur med radius r kan vaere */
    P.fritSted = function (r) {
        var ind = this.lay.ind;
        return { x: NK.r(ind.x + r, ind.x + ind.b - r), y: NK.r(ind.y + r, ind.y + ind.h - r) };
    };

    P.kasseMund = function (s) {
        var lay = this.lay;
        for (var i = 0; i < lay.kasser.length; i++) {
            if (lay.kasser[i].s === s) return { x: lay.kasser[i].x, y: lay.bordY - lay.kasser[i].h * 1.05 };
        }
        return { x: lay.ind.x, y: lay.ind.y };
    };

    /* Laeg én figur i kammeret. fra: hvor den kommer fra, til: hvor den lander */
    P.tilsaet = function (s, fra, til, venter, tving) {
        if (this.fase === "reagerer") { this.besked("Vent, til reaktionen er færdig.", "gul"); return false; }
        if (this.fase === "efter") this.toem(true);
        var reaktanter = this.i().length;
        if (!tving && reaktanter >= D.KAMMER_MAKS) {
            this.besked("Der er ikke plads til flere. " + D.KAMMER_MAKS + " figurer er nok.", "gul");
            return false;
        }
        var st = D.stof(s), r = this.radius(st);
        var start = fra || this.kasseMund(s);
        var maal = til ? this.inde(til, r) : this.fritSted(r);
        this.enheder.push({ st: st, x: start.x, y: start.y, fra: { x: start.x, y: start.y }, t: 0, maal: maal,
            vx: NK.r(-1, 1) * 50, vy: NK.r(-1, 1) * 50, a: NK.r(0, 6.28), va: NK.r(-0.6, 0.6), venter: venter || 0 });
        this.efterHandling();
        return true;
    };

    P.inde = function (p, r) {
        var ind = this.lay.ind;
        return { x: NK.klamp(p.x, ind.x + r, ind.x + ind.b - r), y: NK.klamp(p.y, ind.y + r, ind.y + ind.h - r) };
    };

    P.tagUd = function (u) {
        if (!u || u.hjem || this.fase !== "fyld") return;
        u.hjem = true;
        u.fra = { x: u.x, y: u.y };
        u.t = 0;
        u.maal = this.kasseMund(u.st.id);
        this.efterHandling();
    };

    /* Kammeret toemmes. straks: uden at figurerne flyver */
    P.toem = function (straks) {
        var mig = this;
        this.reak = null;
        this.fase = "fyld";
        this.foer = null;
        this.vurderT = 0;
        if (straks) this.enheder = [];
        else this.enheder.forEach(function (u) { u.hjem = true; u.fra = { x: u.x, y: u.y }; u.t = 0; u.maal = mig.kasseMund(u.st.id); u.forsvind = true; });
        var m = this.maal();
        if (m && m.fyld && this.lay) {
            Object.keys(m.fyld).forEach(function (s) {
                for (var i = 0; i < m.fyld[s]; i++) mig.tilsaet(s, mig.fritSted(mig.radius(D.stof(s))), null, 0, true);
            });
            this.enheder.forEach(function (u) { if (!u.hjem && u.fra) { u.x = u.maal.x; u.y = u.maal.y; u.fra = null; } });
        }
        this.efterHandling();
    };

    /* Figurerne skal blive inde i kammeret, fx efter et nyt layout */
    P.holdInde = function () {
        var mig = this;
        this.enheder.forEach(function (u) {
            if (u.hjem) return;
            var p = mig.inde(u, mig.radius(u.st));
            u.x = p.x; u.y = p.y;
            if (u.maal && !u.hjem) u.maal = mig.inde(u.maal, mig.radius(u.st));
        });
    };

    P.efterHandling = function () {
        this.visStatus();
        this.visKammer();
    };

    /* ----- Reaktionen ------------------------------------------------------------------ */
    P.startKnap = function () {
        if (this.fase === "reagerer") return;
        if (this.fase === "efter") { this.toem(false); this.besked("", ""); return; }
        this.start();
    };

    P.start = function () {
        var r = this.r(), mig = this;
        if (this.iLuften()) { this.besked("Vent, til figurerne er landet.", "gul"); return; }
        var liste = this.i();
        if (!liste.length) { this.besked("Kammeret er tomt. Træk først noget ind.", "gul"); return; }
        var enhed = this.enhed();
        var saetAntal = Infinity;
        r.reaktanter.forEach(function (l) { saetAntal = Math.min(saetAntal, Math.floor(mig.antal(l.s) / l.k)); });
        if (!saetAntal) {
            var mangler = r.reaktanter.map(function (l) { return mig.tal(l.k, l.s); }).join(" og ");
            this.besked("Der er ikke nok til skemaet. Der skal mindst " + mangler + " til.", "skidt");
            this.ryst = 0.5;
            return;
        }
        this.foer = {};
        r.led.forEach(function (l) { mig.foer[l.s] = (mig.foer[l.s] || 0) + (l.side === 0 ? mig.antal(l.s) : 0); });
        var fri = liste.slice();
        var saet = [];
        for (var j = 0; j < saetAntal; j++) {
            /* Et saet: en tilfaeldig figur af det foerste stof og de naermeste af resten */
            var foerste = r.reaktanter[0].s;
            var kandidater = fri.filter(function (u) { return u.st.id === foerste; });
            var kim = kandidater[Math.floor(Math.random() * kandidater.length)];
            var valgt = [];
            r.reaktanter.forEach(function (l) {
                var af = fri.filter(function (u) { return u.st.id === l.s; });
                af.sort(function (a, b) { return afst(a, kim) - afst(b, kim); });
                for (var n = 0; n < l.k; n++) {
                    valgt.push(af[n]);
                    fri.splice(fri.indexOf(af[n]), 1);
                }
            });
            var c = { x: 0, y: 0 };
            valgt.forEach(function (u) { c.x += u.x / valgt.length; c.y += u.y / valgt.length; });
            saet.push({ enheder: valgt, c: c, start: j * FORSKYD, B: false, faerdig: false });
        }
        this.reak = { t: 0, saet: saet, enhed: enhed, slut: (saetAntal - 1) * FORSKYD + SAML + BYT + 0.05 };
        this.fase = "reagerer";
        this.visStatus();
        this.visKammer();
    };

    function afst(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; }

    /* Produkterne i et saet: pladser rundt om saettets midte */
    P.produktPladser = function (st) {
        var r = this.r(), mig = this, ud = [];
        var n = 0;
        r.produkter.forEach(function (l) { n += l.k; });
        var ring = n > 1 ? (this.enhed() === "mol" ? this.lay.R * 1.25 : this.lay.s * 2.2) * (1 + n * 0.12) : 0;
        var v0 = Math.random() * 6.28, i = 0;
        r.produkter.forEach(function (l) {
            var ps = D.stof(l.s);
            for (var j = 0; j < l.k; j++) {
                var v = v0 + i * 6.283 / n;
                var p = mig.inde({ x: st.c.x + Math.cos(v) * ring, y: st.c.y + Math.sin(v) * ring }, mig.radius(ps));
                ud.push({ st: ps, x: p.x, y: p.y, a: NK.r(0, 6.28) });
                i++;
            }
        });
        return ud;
    };

    /* Fase B begynder: atomerne i saettets molekyler faar hver sin plads i et produkt */
    P.bytAtomer = function (st) {
        var s = this.lay.s;
        st.prod = this.produktPladser(st);
        st.B = true;
        if (this.reak.enhed === "mol") {
            st.enheder.forEach(function (u) { u.skjult = true; });
            return;
        }
        var fra = [];
        st.enheder.forEach(function (u) {
            Tg.atomPladser(u.st, u.x, u.y, s, u.a).forEach(function (p) { fra.push({ el: p.el, x: p.x, y: p.y, r: p.r, brugt: false }); });
            u.skjult = true;
        });
        var atomer = [];
        st.prod.forEach(function (p) {
            Tg.atomPladser(p.st, p.x, p.y, s, p.a).forEach(function (q) {
                var bedst = null, bd = Infinity;
                fra.forEach(function (f) {
                    if (f.brugt || f.el !== q.el) return;
                    var d = (f.x - q.x) * (f.x - q.x) + (f.y - q.y) * (f.y - q.y);
                    if (d < bd) { bd = d; bedst = f; }
                });
                if (bedst) {
                    bedst.brugt = true;
                    atomer.push({ el: q.el, fra: { x: bedst.x, y: bedst.y }, til: { x: q.x, y: q.y }, r: q.r });
                }
            });
        });
        st.atomer = atomer;
    };

    /* Fase C: produkterne bliver til figurer, og reaktanterne er vaek */
    P.dannProdukter = function (st) {
        var mig = this;
        st.faerdig = true;
        this.enheder = this.enheder.filter(function (u) { return st.enheder.indexOf(u) < 0; });
        st.prod.forEach(function (p) {
            mig.enheder.push({ st: p.st, x: p.x, y: p.y, fra: null, t: 1, maal: null,
                vx: NK.r(-1, 1) * 45, vy: NK.r(-1, 1) * 45, a: p.a, va: NK.r(-0.6, 0.6), venter: 0, ny: 1 });
        });
    };

    P.efterReaktion = function () {
        var r = this.r(), mig = this;
        this.fase = "efter";
        this.reak = null;
        this.enheder.forEach(function (u) {
            var reaktant = r.reaktanter.some(function (l) { return l.s === u.st.id; });
            u.rest = reaktant && !u.hjem;
        });
        this.visKammer();
        this.visStatus();
        this.vurderT = 0.35;
    };

    /* "2 H₂" eller "2 mol H₂" */
    P.tal = function (n, s) {
        return n + " " + (this.enhed() === "mol" ? "mol " : "") + D.stof(s).formel;
    };

    P.restTekst = function () {
        var r = this.r(), mig = this;
        return r.reaktanter.filter(function (l) { return mig.antal(l.s); }).map(function (l) { return mig.tal(mig.antal(l.s), l.s); });
    };

    P.vurder = function () {
        var m = this.maal();
        var rest = this.restTekst();
        var restTekst = rest.join(" og ");
        if (!m || this.naaet) {
            var r = this.r(), mig = this;
            var dannet = r.produkter.map(function (l) { return mig.tal(mig.antal(l.s), l.s); }).join(" og ");
            this.besked("Der blev dannet " + NK.html(dannet) + "." + (rest.length ? " " + NK.html(restTekst) + " er i overskud." : " Intet er i overskud."), "");
            return;
        }
        var ok = rest.length === 0, mig2 = this;
        var hoved = Object.keys(m.krav)[0];
        Object.keys(m.krav).forEach(function (s) { if (mig2.antal(s) !== m.krav[s]) ok = false; });
        if (ok) { this.maalNaaet(); return; }
        var g = this.antal(hoved), t = m.krav[hoved], b;
        if (g === t) b = "Rigtigt antal " + D.stof(hoved).formel + ", men " + restTekst + " er i overskud.";
        else {
            b = g < t ? "Kun " + this.tal(g, hoved) + ". Målet er " + this.tal(t, hoved) + "."
                : this.tal(g, hoved) + " er for mange. Målet er " + this.tal(t, hoved) + ".";
            if (rest.length) b += " " + restTekst + " er i overskud.";
        }
        this.besked(NK.html(b) + " Tryk på Tøm, og prøv igen.", "skidt");
    };

    /* ----- Maalene ----------------------------------------------------------------------- */
    P.startMaal = function () {
        var m = this.maal();
        this.naaet = false;
        this.hjaelp = 0;
        this.fremhaev = null;
        this.besked("", "");
        this.enheder = [];
        this.reak = null;
        this.fase = "fyld";
        this.foer = null;
        if (m && m.enhed === "mol" && this.sidsteEnhed === "stk") this.plakatBlink = 3;
        this.sidsteEnhed = this.enhed();
        this.lay = null;
        if (this.L.b > 1) this.layout();
        if (m && m.fyld && this.lay) this.toem(true);
        else if (m && m.fyld) this.ventFyld = true;
        this.bygTabel();
        this.visMaal();
        this.visKammer();
        this.visStatus();
    };

    P.maalNaaet = function () {
        this.naaet = true;
        this.hjaelp = 0;
        this.fremhaev = null;
        this.besked(NK.html(this.maal().efter), "god");
        if (this.afvisTilbud) this.afvisTilbud();
        var gemt = NK.hent(NOEGLE, {}) || {};
        NK.gem(NOEGLE, { maal: Math.max(this.nr + 1, gemt.maal || 0) });
        /* Det sidste maal: Kemichael roser, mens eleven stadig er her */
        if (this.nr >= D.MAAL.length - 1 && !this.rost) {
            this.rost = true;
            this.ventRos = 1.6;
        }
        this.visMaal();
    };

    /* Det, der skal i kammeret for at naa maalet */
    P.maalIndhold = function (m) {
        var r = D.reaktion(m.r);
        var hoved = Object.keys(m.krav)[0];
        var pl = null;
        r.produkter.forEach(function (l) { if (l.s === hoved) pl = l; });
        var saet = m.krav[hoved] / pl.k;
        var ud = {};
        r.reaktanter.forEach(function (l) { ud[l.s] = saet * l.k; });
        return ud;
    };

    P.knap = function () {
        var m = this.maal();
        if (!m) {
            this.nr = 0;
            this.startMaal();
            return;
        }
        if (this.naaet) {
            var sidste = this.nr >= D.MAAL.length - 1;
            this.nr++;
            this.startMaal();
            if (sidste && NK.visFane) NK.visFane("fane-regn");
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.fremhaev = "skilt";
            this.besked("<b>Hint:</b> " + NK.html(m.hint), "gul");
            this.visMaal();
            return;
        }
        /* Vis svaret: det rigtige i kammeret, og saa Start */
        if (this.fase === "reagerer") return;
        this.toem(true);
        var mig = this, ind = this.maalIndhold(m), n = 0;
        Object.keys(ind).forEach(function (s) {
            var har = mig.antal(s);
            for (var i = har; i < ind[s]; i++) mig.tilsaet(s, null, null, n++ * 0.06, true);
        });
        this.svarStart = 0.6;
        this.visMaal();
    };

    P.nulstil = function () {
        if (this.fase === "reagerer") return;
        this.toem(false);
        this.besked("", "");
    };

    P.enter = function () {
        if (this.naaet) { this.knap(); return; }
        if (this.fase !== "reagerer" && this.i().length) this.startKnap();
    };

    P.fokus = function () {};

    /* ----- Panelet ---------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("molekyler-knap"),
            besked: NK.el("molekyler-besked"),
            kort: NK.el("molekyler-kort"),
            tabel: NK.el("molekyler-tabel"),
            fri: NK.el("molekyler-frit")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("molekyler-spring").addEventListener("click", function () { mig.springIntro(); });

        var rk = NK.el("molekyler-reaktioner");
        D.REAKTIONER.forEach(function (r) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "vaelger";
            b.setAttribute("data-r", r.id);
            b.textContent = r.kort;
            b.addEventListener("click", function () { mig.vaelgFrit(r.id, null); });
            rk.appendChild(b);
        });
        Array.prototype.forEach.call(document.querySelectorAll("#molekyler-enhed .vaelger"), function (b) {
            b.addEventListener("click", function () { mig.vaelgFrit(null, b.getAttribute("data-enhed")); });
        });
    };

    P.vaelgFrit = function (r, enhed) {
        if (this.fase === "reagerer" || this.maal()) return;
        if (r) this.fri.r = r;
        if (enhed) this.fri.enhed = enhed;
        this.startMaal();
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visMaal = function () {
        var m = this.maal();
        NK.saetTekst("molekyler-nr", String(Math.min(this.nr + 1, D.MAAL.length)));
        NK.el("molekyler-taeller").hidden = !m;
        var tekst, klasse = "knap";
        if (!m) {
            NK.saetTekst("molekyler-titel", "Frit valg");
            NK.saetTekst("molekyler-prompt", "Vælg en reaktion, og fyld kammeret, som du vil.");
            tekst = "Start målene forfra";
        } else {
            NK.saetTekst("molekyler-titel", "Mål");
            NK.saetTekst("molekyler-prompt", m.tekst);
            if (this.naaet) {
                tekst = this.nr >= D.MAAL.length - 1 ? "Videre til tavlen →" : "Næste mål →";
                klasse = "knap blaa banker";
            } else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.naaet);
        this.el.fri.hidden = !!m;
        var mig = this;
        Array.prototype.forEach.call(document.querySelectorAll("#molekyler-reaktioner .vaelger"), function (b) {
            b.classList.toggle("valgt", b.getAttribute("data-r") === mig.r().id);
        });
        Array.prototype.forEach.call(document.querySelectorAll("#molekyler-enhed .vaelger"), function (b) {
            b.classList.toggle("valgt", b.getAttribute("data-enhed") === mig.enhed());
        });
    };

    /* Tabellen "I kammeret": én raekke pr. stof, foer og efter */
    P.bygTabel = function () {
        var r = this.r(), html = "";
        html += '<div class="tabel-raekke hoved"><span>Stof</span><span>Før</span><span>Efter</span></div>';
        r.led.forEach(function (l, i) {
            html += '<div class="tabel-raekke' + (l.side === 1 && r.led[i - 1].side === 0 ? " skel" : "") + '">' +
                '<span class="tabel-stof">' + D.stof(l.s).formel + '</span>' +
                '<span class="tal" id="molekyler-foer-' + i + '"></span>' +
                '<span class="tal" id="molekyler-efter-' + i + '"></span></div>';
        });
        this.el.tabel.innerHTML = html;
        NK.saetTekst("molekyler-forhold", D.forhold(r));
    };

    P.visKammer = function () {
        var r = this.r(), mig = this;
        NK.saetTekst("molekyler-enhedstekst", this.enhed() === "mol" ? "i mol" : "antal molekyler");
        r.led.forEach(function (l, i) {
            var foer, efter = "";
            if (mig.fase === "fyld") foer = l.side === 0 ? String(mig.antal(l.s)) : "0";
            else foer = String(mig.foer ? mig.foer[l.s] || 0 : 0);
            if (mig.fase === "efter") efter = String(mig.antal(l.s));
            /* Tabellen bygges om ved hvert skift, saa her skrives direkte (uden saetTekst) */
            var f = NK.el("molekyler-foer-" + i), e = NK.el("molekyler-efter-" + i);
            if (f) f.textContent = foer;
            if (e) e.textContent = efter;
            if (e) e.classList.toggle("rest", mig.fase === "efter" && l.side === 0 && mig.antal(l.s) > 0);
        });
    };

    P.visStatus = function () {
        var t, mol = this.enhed() === "mol";
        if (this.traek && this.traek.flyttet) t = "Slip i kammeret.";
        else if (this.fase === "reagerer") t = mol ? "Stofferne reagerer i det forhold, skemaet siger." : "Atomerne bytter partnere. Intet atom forsvinder.";
        else if (this.fase === "efter") t = "Tryk på Tøm for at prøve igen, eller træk mere ind.";
        else if (!this.i().length) t = mol ? "Træk poser med 1 mol fra kasserne ind i kammeret. Tryk så på Start." :
            "Træk molekyler fra kasserne ind i kammeret. Tryk så på Start.";
        else t = "Tryk på Start, når kammeret er klar. Klik på en figur for at tage den ud.";
        NK.saetHTML("molekyler-status", t);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this, lay = this.lay;
        if (!lay) { if (this.opdaterLaerer) this.opdaterLaerer(dt); this.opdaterIntro(dt); return; }
        if (this.ventFyld) { this.ventFyld = false; this.toem(true); }
        var ind = lay.ind;

        /* Figurerne: flyvning, bevaegelse og vaeggene */
        this.enheder.forEach(function (u) {
            if (u.venter > 0) { u.venter -= dt; return; }
            u.venter = 0;
            if (u.ny) u.ny = Math.max(0, u.ny - dt / 0.4);
            if (u.fra) {
                u.t = Math.min(1, u.t + dt / FLYV);
                if (u.t >= 1) { u.fra = null; u.x = u.maal.x; u.y = u.maal.y; }
                return;
            }
            if (u.samles) return;
            var r = mig.radius(u.st);
            var fart = mig.fase === "reagerer" ? 1.8 : 1;
            u.x += u.vx * dt * fart;
            u.y += u.vy * dt * fart;
            u.a += u.va * dt;
            if (u.x < ind.x + r) { u.x = ind.x + r; u.vx = Math.abs(u.vx); }
            if (u.x > ind.x + ind.b - r) { u.x = ind.x + ind.b - r; u.vx = -Math.abs(u.vx); }
            if (u.y < ind.y + r) { u.y = ind.y + r; u.vy = Math.abs(u.vy); }
            if (u.y > ind.y + ind.h - r) { u.y = ind.y + ind.h - r; u.vy = -Math.abs(u.vy); }
        });
        /* Figurerne skubber blidt til hinanden, saa de ikke ligger oven i hinanden */
        var frie = this.enheder.filter(function (u) { return !u.fra && !u.hjem && !u.samles && !u.skjult && !(u.venter > 0); });
        for (var i = 0; i < frie.length; i++) {
            for (var j = i + 1; j < frie.length; j++) {
                var a = frie[i], b = frie[j];
                var ra = this.radius(a.st) * 0.85, rb = this.radius(b.st) * 0.85;
                var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                if (d < ra + rb) {
                    var nx = dx / d, ny = dy / d, over = (ra + rb - d) * 0.5;
                    a.x -= nx * over; a.y -= ny * over;
                    b.x += nx * over; b.y += ny * over;
                    var va = a.vx * nx + a.vy * ny, vb = b.vx * nx + b.vy * ny;
                    if (va - vb > 0) {
                        a.vx += (vb - va) * nx; a.vy += (vb - va) * ny;
                        b.vx += (va - vb) * nx; b.vy += (va - vb) * ny;
                    }
                }
            }
        }
        var foer = this.enheder.length;
        this.enheder = this.enheder.filter(function (u) { return !(u.hjem && !u.fra && !(u.venter > 0)); });
        if (foer !== this.enheder.length) this.efterHandling();

        /* Reaktionen */
        var rk = this.reak;
        if (rk) {
            rk.t += dt;
            rk.saet.forEach(function (st) {
                var tau = rk.t - st.start;
                if (tau < 0 || st.faerdig) return;
                if (tau < SAML) {
                    var u2 = NK.blod(tau / SAML);
                    st.enheder.forEach(function (e) {
                        if (!e.p0) { e.p0 = { x: e.x, y: e.y }; e.samles = true; }
                        e.x = NK.lerp(e.p0.x, st.c.x + (e.p0.x - st.c.x) * 0.3, u2);
                        e.y = NK.lerp(e.p0.y, st.c.y + (e.p0.y - st.c.y) * 0.3, u2);
                    });
                } else if (!st.B) {
                    mig.bytAtomer(st);
                } else if (tau >= SAML + BYT) {
                    mig.dannProdukter(st);
                }
            });
            if (rk.t >= rk.slut && rk.saet.every(function (st) { return st.faerdig; })) this.efterReaktion();
        }

        if (this.vurderT > 0) {
            this.vurderT -= dt;
            if (this.vurderT <= 0) this.vurder();
        }
        if (this.svarStart > 0) {
            this.svarStart -= dt;
            if (this.svarStart <= 0) {
                if (this.iLuften()) this.svarStart = 0.1;
                else { this.svarStart = 0; this.start(); }
            }
        }
        if (this.ryst > 0) this.ryst = Math.max(0, this.ryst - dt);
        if (this.plakatBlink > 0) this.plakatBlink = Math.max(0, this.plakatBlink - dt);
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.figurPos = function (u) {
        if (!u.fra || u.venter > 0) return { x: u.fra ? u.fra.x : u.x, y: u.fra ? u.fra.y : u.y };
        var t = NK.blod(u.t);
        return { x: NK.lerp(u.fra.x, u.maal.x, t), y: NK.lerp(u.fra.y, u.maal.y, t) - Math.sin(t * Math.PI) * 50 };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, r = this.r(), enhed = this.enhed();
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 7);
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.skemaSkilt(ctx, lay.skilt.x, lay.skilt.y, lay.skilt.b, r, enhed, { lys: this.fremhaev === "skilt" ? puls : 0 });
        Tg.enhedPlakat(ctx, lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h, enhed, { lys: this.plakatBlink > 0 ? puls : 0 });
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Kasserne */
        lay.kasser.forEach(function (k) {
            var st = D.stof(k.s);
            var m = enhed === "mol" ? Math.min(lay.R, k.b * 0.19) : Math.min(lay.s, k.b * 0.15 / st.radius);
            var over = mig.over && mig.over.slags === "kasse" && mig.over.s === k.s;
            Tg.kasse(ctx, k.x, k.y, k.b, k.h, st, enhed, m, { lys: over ? 0.7 : (mig.pegKasser ? puls : 0) });
        });

        /* Kammeret: det moerke indre, figurerne og til sidst glasset og knappen */
        var knapTekst = this.fase === "efter" ? "Tøm" : "Start";
        var km = Tg.kammer(ctx, lay.kammer.x, lay.bordY, lay.kammer.b, {
            lys: this.traek && this.traek.flyttet && !this.traek.u && this.overKammer(this.traek) ? puls : 0,
            knap: knapTekst,
            knapAktiv: this.fase !== "reagerer",
            knapOver: this.over && this.over.slags === "knap",
            knapLys: this.fase === "fyld" && this.i().length && !this.iLuften() && !this.naaet ? puls : 0
        });
        var ryst = this.ryst > 0 ? Math.sin(this.tid * 60) * 3 * this.ryst / 0.5 : 0;
        ctx.save();
        ctx.beginPath();
        ctx.rect(lay.ind.x - 6, lay.ind.y - 6, lay.ind.b + 12, lay.ind.h + 12);
        ctx.clip();
        this.enheder.forEach(function (u) {
            if (u.fra || u.skjult || u.hjem || u.venter > 0) return;
            var lys = mig.over && mig.over.slags === "figur" && mig.over.u === u;
            var skala = u.ny ? 1 - 0.3 * u.ny : 1;
            Tg.figur(ctx, u.st, enhed, u.x + ryst, u.y, mig.stoerrelse() * skala, u.a, { rest: u.rest, lys: lys, drej: u.a * 0.2 });
        });
        /* Reaktionen: atomerne paa vej til produkterne, eller poserne, der skifter */
        if (this.reak) {
            this.reak.saet.forEach(function (st) {
                var tau = mig.reak.t - st.start;
                if (!st.B || st.faerdig) return;
                var u3 = NK.blod(NK.klamp((tau - SAML) / BYT, 0, 1));
                if (mig.reak.enhed === "mol") {
                    st.enheder.forEach(function (e) {
                        Tg.pose(ctx, e.st, NK.lerp(e.x, st.c.x, u3), NK.lerp(e.y, st.c.y, u3), lay.R * (1 - u3), {});
                    });
                    st.prod.forEach(function (p) {
                        Tg.pose(ctx, p.st, NK.lerp(st.c.x, p.x, u3), NK.lerp(st.c.y, p.y, u3), lay.R * u3, {});
                    });
                } else {
                    var glimt = Math.sin(u3 * Math.PI);
                    if (glimt > 0.05) {
                        ctx.save();
                        ctx.fillStyle = "rgba(255, 236, 170, " + (0.14 * glimt) + ")";
                        ctx.beginPath();
                        ctx.arc(st.c.x, st.c.y, lay.s * 2.6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                    st.atomer.forEach(function (a) {
                        var x = NK.lerp(a.fra.x, a.til.x, u3), y = NK.lerp(a.fra.y, a.til.y, u3) - glimt * lay.s * 0.6;
                        Tg.atom(ctx, a.el, x, y, a.r);
                    });
                }
            });
        }
        ctx.restore();
        km.foran(ctx);
        if (this.fase === "efter" && this.enheder.some(function (u) { return u.rest; })) {
            Tg.maerkat(ctx, lay.ind.x + lay.ind.b / 2, lay.ind.y + 14, "orange ring: overskud", { px: 12 });
        }

        /* Det, der flyver ind og ud */
        this.enheder.forEach(function (u) {
            if (!u.fra || u.venter > 0) return;
            var p = mig.figurPos(u);
            var skala = u.hjem ? 1 - 0.4 * NK.blod(u.t) : 0.6 + 0.4 * NK.blod(u.t);
            Tg.figur(ctx, u.st, enhed, p.x, p.y, mig.stoerrelse() * skala, u.a, { alfa: u.forsvind ? 1 - u.t : 1 });
        });

        /* Det, der traekkes */
        var tr = this.traek;
        if (tr && tr.flyttet) {
            Tg.figur(ctx, D.stof(tr.s), enhed, tr.x, tr.y, this.stoerrelse(), 0.3, { lys: this.overKammer(tr) });
        }

        /* Pilen viser, hvad der kan traekkes, saa laenge kammeret er tomt */
        if (!tr && this.nr === 0 && this.maal() && !this.naaet && !this.enheder.length) {
            var k0 = lay.kasser[0];
            Tg.buePil(ctx, k0.x, lay.bordY - k0.h * 1.2, lay.ind.x + lay.ind.b * 0.3, lay.ind.y + lay.ind.h * 0.5, this.tid,
                (k0.x + lay.ind.x) / 2, lay.ind.y - 10);
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.overKammer = function (pt) {
        var ind = this.lay.ind;
        return pt.x >= ind.x - 8 && pt.x <= ind.x + ind.b + 8 && pt.y >= ind.y - 8 && pt.y <= ind.y + ind.h + 8;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) {
            return { slags: "kop" };
        }
        for (var i = 0; i < lay.kasser.length; i++) {
            var k = lay.kasser[i];
            if (Math.abs(pt.x - k.x) <= k.b / 2 && pt.y <= k.y && pt.y >= k.y - k.h * 1.35) return { slags: "kasse", s: k.s };
        }
        var kn = lay.knap;
        if (pt.x >= kn.x && pt.x <= kn.x + kn.b && pt.y >= kn.y - 4 && pt.y <= kn.y + kn.h + 4) return { slags: "knap" };
        if (this.fase === "fyld" && this.overKammer(pt)) {
            var mig = this;
            var liste = this.enheder.filter(function (u) { return !u.fra && !u.hjem; });
            for (var j = liste.length - 1; j >= 0; j--) {
                var u = liste[j], r = mig.radius(u.st);
                if ((pt.x - u.x) * (pt.x - u.x) + (pt.y - u.y) * (pt.y - u.y) <= r * r) return { slags: "figur", u: u };
            }
        }
        if (this.overKammer(pt)) return { slags: "kammer" };
        var s = lay.skilt, p = lay.plakat;
        if (pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h) return { slags: "skilt" };
        if (pt.x >= p.x && pt.x <= p.x + p.b && pt.y >= p.y && pt.y <= p.y + p.h) return { slags: "plakat" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            var u = mig.hvadErUnder(pt);
            if (!u || (u.slags !== "kasse" && u.slags !== "figur")) return;
            mig.traek = { s: u.s || u.u.st.id, u: u.u || null, start: pt, x: pt.x, y: pt.y, flyttet: false };
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                tr.x = pt.x;
                tr.y = pt.y;
                if (!tr.flyttet && Math.abs(pt.x - tr.start.x) + Math.abs(pt.y - tr.start.y) > 6) {
                    tr.flyttet = true;
                    if (tr.u) { tr.u.hjem = true; tr.u.fra = null; tr.u.skjult = true; }
                    mig.visStatus();
                }
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var sl = mig.over && mig.over.slags;
            c.style.cursor = sl === "kasse" || sl === "figur" ? "grab" : (sl && sl !== "kammer" ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () { mig.slipTraek(null); });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr && tr.flyttet) { mig.slipTraek(pt); return; }
            mig.traek = null;
            mig.klik(pt);
        });
    };

    P.slipTraek = function (pt) {
        var tr = this.traek;
        this.traek = null;
        if (!tr) return;
        if (tr.u) {
            /* En figur fra kammeret: slippes den i kammeret, bliver den; ellers tages den ud */
            var u = tr.u;
            this.enheder = this.enheder.filter(function (x) { return x !== u; });
            if (!pt) pt = { x: u.x, y: u.y, inde: true };
            if ((pt.inde || this.overKammer(pt)) && this.fase === "fyld") this.tilsaet(u.st.id, pt, pt, 0, true);
            else {
                this.enheder.push({ st: u.st, x: pt.x, y: pt.y, fra: { x: pt.x, y: pt.y }, t: 0, maal: this.kasseMund(u.st.id),
                    hjem: true, a: u.a, va: 0, vx: 0, vy: 0, venter: 0 });
                this.efterHandling();
            }
        } else if (pt && this.overKammer(pt)) {
            this.tilsaet(tr.s, pt, pt);
        } else if (pt) {
            this.besked("Slip i kammeret.", "gul");
        }
        this.visStatus();
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "kasse") { this.tilsaet(u.s); return; }
        if (u.slags === "knap") { this.startKnap(); return; }
        if (u.slags === "figur") { this.tagUd(u.u); this.over = null; return; }
        if (u.slags === "kammer" && this.fase === "fyld" && !this.i().length) {
            this.besked("Træk noget fra kasserne herind, eller klik på en kasse.", "");
            return;
        }
        if (u.slags === "skilt") {
            var r = this.r();
            this.besked("Skemaet: " + NK.html(D.skema(r)) + ". Forholdet er " + D.forhold(r) + ".", "");
            return;
        }
        if (u.slags === "plakat") {
            this.besked(this.enhed() === "mol" ? "Hver figur er 1 mol, altså " + D.NA_TEKST + " molekyler. Forholdet er det samme."
                : "Hver figur er ét molekyle.", "");
        }
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc4.4-intro-molekyler", tilbud: "molekyler-tilbud", spring: "molekyler-spring" });

    /* Mens han siger, at man traekker dem ind i kammeret, lyser kasserne */
    P.pegPaaFelt = function (til) { this.pegKasser = til; };

    NK.SimMolekyler = SimMolekyler;
}());
