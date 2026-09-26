/* =====================================================================
   molekyle.js - molekylet som graf: atomer, bindinger og det, der kan
   regnes ud af dem (hydrogen, molekylformel, molarmasse, ringe)

   Det er den samme model paa tegnebraettet og i sc6.2. Tegnebraettet (tegnebraet.js)
   aendrer den, navngivningen (navngivning.js) laeser den, og tegningen
   (struktur.js) viser den.

   Et atom er { id, el, x, y }. x og y er maalt i bindingslaengder, ikke
   i pixels, saa en tegning kan vises i enhver stoerrelse. En binding er
   { a, b, orden } med atomernes id og orden 1, 2 eller 3.

   Hydrogen tegnes normalt ikke. Det regnes ud af valensen: et C-atom har
   4 bindinger, og dem, der ikke gaar til andre atomer, gaar til H.
   Eleven kan ogsaa saette H paa som et rigtigt atom; saa taeller det som
   en binding.

   Atommasserne er IUPAC's standardatommasser (2021) rundet til to
   decimaler, som i sc4.1 (H 1,01). De regnes i hundrededele, saa
   summen bliver praecis.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Valens: de mulige antal bindinger. Det foerste tal er det normale;
       S kan have flere (sulfonsyrer). */
    var VALENS = {
        C: [4], H: [1], O: [2], N: [3], S: [2, 4, 6],
        F: [1], Cl: [1], Br: [1], I: [1]
    };

    /* Atommasse i hundrededele af g/mol */
    var MASSE = {
        H: 101, C: 1201, N: 1401, O: 1600, F: 1900,
        S: 3206, Cl: 3545, Br: 7990, I: 12690
    };

    var NAVN = {
        H: "hydrogen", C: "carbon", N: "nitrogen", O: "oxygen", F: "fluor",
        S: "svovl", Cl: "chlor", Br: "brom", I: "iod"
    };

    var HALOGEN = { F: true, Cl: true, Br: true, I: true };

    function Molekyle() {
        this.atomer = [];
        this.bindinger = [];
        this.naesteId = 1;
    }

    var P = Molekyle.prototype;

    /* ----- Opbygning ------------------------------------------------------ */
    P.tilfoej = function (el, x, y) {
        var a = { id: this.naesteId++, el: el || "C", x: x || 0, y: y || 0 };
        this.atomer.push(a);
        return a;
    };

    P.bind = function (a, b, orden) {
        if (a === b || this.binding(a, b)) return null;
        var bd = { a: a, b: b, orden: orden || 1 };
        this.bindinger.push(bd);
        return bd;
    };

    P.atom = function (id) {
        for (var i = 0; i < this.atomer.length; i++) if (this.atomer[i].id === id) return this.atomer[i];
        return null;
    };

    P.binding = function (a, b) {
        for (var i = 0; i < this.bindinger.length; i++) {
            var bd = this.bindinger[i];
            if ((bd.a === a && bd.b === b) || (bd.a === b && bd.b === a)) return bd;
        }
        return null;
    };

    P.bindingerTil = function (id) {
        return this.bindinger.filter(function (bd) { return bd.a === id || bd.b === id; });
    };

    P.naboer = function (id) {
        return this.bindingerTil(id).map(function (bd) { return bd.a === id ? bd.b : bd.a; });
    };

    P.grad = function (id) { return this.bindingerTil(id).length; };

    /* Summen af bindingsordenerne til atomet */
    P.bindingssum = function (id) {
        return this.bindingerTil(id).reduce(function (s, bd) { return s + bd.orden; }, 0);
    };

    P.fjernAtom = function (id) {
        this.atomer = this.atomer.filter(function (a) { return a.id !== id; });
        this.bindinger = this.bindinger.filter(function (bd) { return bd.a !== id && bd.b !== id; });
    };

    P.fjernBinding = function (bd) {
        this.bindinger = this.bindinger.filter(function (x) { return x !== bd; });
    };

    P.tom = function () { return this.atomer.length === 0; };

    /* ----- Valens -----------------------------------------------------------
       En ladning q (atomets a.q, -1, 0 eller +1) aendrer valensen: O⁻ har én
       binding og O⁺ tre, N⁺ fire (NH₄⁺), Cl⁻ ingen; C⁺ og C⁻ har tre. */
    function valenser(el, q) {
        var v = VALENS[el] || [4];
        if (!q) return v;
        if (el === "C" || el === "H") return [Math.max(0, v[0] - Math.abs(q))];
        return [Math.max(0, v[0] + q)];
    }

    Molekyle.maksValens = function (el, q) {
        var v = valenser(el, q);
        return v[v.length - 1];
    };

    /* Antal H, der ikke er tegnet: den mindste mulige valens, der er stor
       nok, minus bindingerne. */
    P.implicitH = function (id) {
        var a = this.atom(id);
        if (!a) return 0;
        var sum = this.bindingssum(id);
        var v = valenser(a.el, a.q);
        for (var i = 0; i < v.length; i++) if (v[i] >= sum) return v[i] - sum;
        return 0;
    };

    /* Er der plads til ekstra bindingsorden paa atomet? */
    P.ledig = function (id, ekstra) {
        var a = this.atom(id);
        if (!a) return false;
        return this.bindingssum(id) + (ekstra || 1) <= Molekyle.maksValens(a.el, a.q);
    };

    /* Den samlede ladning */
    P.ladning = function () {
        return this.atomer.reduce(function (s, a) { return s + (a.q || 0); }, 0);
    };

    /* ----- Dele af molekylet --------------------------------------------------
       Et fragment er en sammenhaengende gruppe af atomer. Tavlen kan have
       flere molekyler paa én gang. */
    P.fragmenter = function () {
        var set = {}, ud = [], mig = this;
        this.atomer.forEach(function (a) {
            if (set[a.id]) return;
            var gruppe = [], ko = [a.id];
            set[a.id] = true;
            while (ko.length) {
                var id = ko.shift();
                gruppe.push(id);
                mig.naboer(id).forEach(function (n) {
                    if (!set[n]) { set[n] = true; ko.push(n); }
                });
            }
            ud.push(gruppe);
        });
        return ud;
    };

    /* Et nyt molekyle med kun de atomer, der er naevnt (samme id'er) */
    P.del = function (ids) {
        var m = new Molekyle(), med = {};
        ids.forEach(function (id) { med[id] = true; });
        this.atomer.forEach(function (a) {
            if (!med[a.id]) return;
            var k = { id: a.id, el: a.el, x: a.x, y: a.y };
            if (a.q) k.q = a.q;
            m.atomer.push(k);
        });
        this.bindinger.forEach(function (bd) {
            if (med[bd.a] && med[bd.b]) m.bindinger.push({ a: bd.a, b: bd.b, orden: bd.orden });
        });
        m.naesteId = this.naesteId;
        return m;
    };

    /* Saet et andet molekyle ind, flyttet (dx, dy). Atomerne faar nye id'er. */
    P.indsaet = function (andet, dx, dy) {
        var nyt = {}, mig = this;
        andet.atomer.forEach(function (a) {
            var k = mig.tilfoej(a.el, a.x + (dx || 0), a.y + (dy || 0));
            if (a.q) k.q = a.q;
            nyt[a.id] = k.id;
        });
        andet.bindinger.forEach(function (bd) { mig.bind(nyt[bd.a], nyt[bd.b], bd.orden); });
        return nyt;
    };

    P.kopi = function () {
        return this.del(this.atomer.map(function (a) { return a.id; }));
    };

    /* Et atom er [id, el, x, y, start] og med ladning [..., q] */
    P.tilData = function () {
        return {
            atomer: this.atomer.map(function (a) {
                var r = [a.id, a.el, Math.round(a.x * 1000) / 1000, Math.round(a.y * 1000) / 1000, a.start ? 1 : 0];
                if (a.q) r.push(a.q);
                return r;
            }),
            bindinger: this.bindinger.map(function (bd) { return [bd.a, bd.b, bd.orden]; }),
            naeste: this.naesteId
        };
    };

    Molekyle.fraData = function (d) {
        var m = new Molekyle();
        (d.atomer || []).forEach(function (r) {
            var a = { id: r[0], el: r[1], x: r[2], y: r[3] };
            if (r[4]) a.start = true;
            if (r[5]) a.q = r[5];
            m.atomer.push(a);
        });
        (d.bindinger || []).forEach(function (r) { m.bindinger.push({ a: r[0], b: r[1], orden: r[2] }); });
        m.naesteId = d.naeste || (m.atomer.reduce(function (s, a) { return Math.max(s, a.id); }, 0) + 1);
        return m;
    };

    /* Antal ringe (for et sammenhaengende molekyle): bindinger - atomer + 1 */
    P.ringe = function () {
        var n = 0, mig = this;
        this.fragmenter().forEach(function (f) {
            var set = {};
            f.forEach(function (id) { set[id] = true; });
            var b = mig.bindinger.filter(function (bd) { return set[bd.a]; }).length;
            n += b - f.length + 1;
        });
        return n;
    };

    /* ----- Molekylformel og molarmasse --------------------------------------- */
    /* Antal af hvert grundstof, med de H, der ikke er tegnet */
    P.optaelling = function () {
        var t = {}, mig = this;
        this.atomer.forEach(function (a) {
            t[a.el] = (t[a.el] || 0) + 1;
            var h = mig.implicitH(a.id);
            if (h) t.H = (t.H || 0) + h;
        });
        return t;
    };

    /* Hill-raekkefoelgen: C, H og saa resten alfabetisk. Uden C: alfabetisk. */
    Molekyle.hill = function (t) {
        var noegler = Object.keys(t).filter(function (k) { return t[k] > 0; });
        var harC = !!t.C;
        noegler.sort(function (a, b) {
            if (harC) {
                var ra = a === "C" ? 0 : (a === "H" ? 1 : 2), rb = b === "C" ? 0 : (b === "H" ? 1 : 2);
                if (ra !== rb) return ra - rb;
            }
            return a < b ? -1 : (a > b ? 1 : 0);
        });
        return noegler;
    };

    /* Raekkefoelgen, formlen vises i. Med C er det Hill (C, H, resten).
       Uden C skrives H foerst, naar resten er halogen, O eller S (HCl, HBr,
       H₂O), og NH₃ som i bogen; ellers alfabetisk. */
    Molekyle.visOrden = function (t) {
        var h = Molekyle.hill(t);
        if (t.C || !t.H) return h;
        var andre = h.filter(function (k) { return k !== "H"; });
        if (andre.length === 1 && andre[0] === "N") return ["N", "H"];
        if (andre.every(function (k) { return /^(F|Cl|Br|I|O|S)$/.test(k); })) return ["H"].concat(andre);
        return h;
    };

    /* Molekylformlen med saenkede tal: C₂H₆O */
    Molekyle.formelTekst = function (t) {
        return Molekyle.visOrden(t).map(function (k) {
            return k + (t[k] > 1 ? NK.saenket(t[k]) : "");
        }).join("");
    };

    /* Samme formel som almindelig tekst: C2H6O */
    Molekyle.formelAscii = function (t) {
        return Molekyle.hill(t).map(function (k) { return k + (t[k] > 1 ? t[k] : ""); }).join("");
    };

    /* Med ladning efter formlen: CH₃COO⁻. En ion uden C med kun O og H
       skrives OH⁻ og H₃O⁺, som i bogen. */
    P.formel = function () {
        var t = this.optaelling(), q = this.ladning();
        if (!q) return Molekyle.formelTekst(t);
        var tekst;
        if (!t.C && t.O === 1 && t.H === 1 && Object.keys(t).length === 2) tekst = "OH";
        else tekst = Molekyle.formelTekst(t);
        if (t.C) tekst = Molekyle.ionFormel(this) || tekst;
        return tekst + NK.ladningHaevet(q);
    };

    /* Carboxylat-ioner skrives med gruppen til sidst, som i bogen:
       CH₃COO⁻, HCOO⁻, C₆H₅COO⁻. Kun naar der er én COO⁻-gruppe, og resten
       er C og H; ellers bruges molekylformlen. */
    Molekyle.ionFormel = function (m) {
        var t = m.optaelling();
        if (m.ladning() !== -1 || t.O !== 2 || Object.keys(t).some(function (k) { return k !== "C" && k !== "H" && k !== "O"; })) return null;
        var coo = null;
        m.atomer.forEach(function (a) {
            if (a.q !== -1 || a.el !== "O") return;
            var n = m.naboer(a.id);
            if (n.length !== 1) return;
            var c = m.atom(n[0]);
            if (!c || c.el !== "C") return;
            var dobbelt = m.bindingerTil(c.id).filter(function (bd) {
                var o = m.atom(bd.a === c.id ? bd.b : bd.a);
                return bd.orden === 2 && o.el === "O";
            });
            if (dobbelt.length === 1) coo = c;
        });
        if (!coo) return null;
        var rest = { C: t.C - 1, H: t.H };
        if (!rest.C) return (rest.H ? "H" + (rest.H > 1 ? NK.saenket(rest.H) : "") : "") + "COO";
        return Molekyle.formelTekst(rest) + "COO";
    };

    /* Molarmassen i hundrededele af g/mol */
    P.molarmasse = function () {
        var t = this.optaelling(), s = 0;
        Object.keys(t).forEach(function (k) { s += (MASSE[k] || 0) * t[k]; });
        return s;
    };

    /* ----- Geometri ------------------------------------------------------------ */
    P.graenser = function () {
        if (!this.atomer.length) return { x0: 0, y0: 0, x1: 0, y1: 0 };
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        this.atomer.forEach(function (a) {
            x0 = Math.min(x0, a.x); y0 = Math.min(y0, a.y);
            x1 = Math.max(x1, a.x); y1 = Math.max(y1, a.y);
        });
        return { x0: x0, y0: y0, x1: x1, y1: y1 };
    };

    /* Flyt hele tegningen, saa midten ligger i (cx, cy) */
    P.centrer = function (cx, cy) {
        var g = this.graenser();
        var dx = (cx || 0) - (g.x0 + g.x1) / 2, dy = (cy || 0) - (g.y0 + g.y1) / 2;
        this.atomer.forEach(function (a) { a.x += dx; a.y += dy; });
    };

    Molekyle.VALENS = VALENS;
    Molekyle.MASSE = MASSE;
    Molekyle.NAVN = NAVN;
    Molekyle.erHalogen = function (el) { return !!HALOGEN[el]; };

    NK.Molekyle = Molekyle;
}());
