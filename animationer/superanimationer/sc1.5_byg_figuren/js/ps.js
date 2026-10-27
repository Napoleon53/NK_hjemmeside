/* =====================================================================
   ps.js - det periodiske system til figurerne i 1.1 og 1.3

   Pladserne og inddelingen i metaller (m), halvmetaller (h) og
   ikke-metaller (i) er de samme som i Kemibogens figur
   periodesystem-metaller.svg. Lanthaniderne og actiniderne er udeladt
   som i bogen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;

    var RAEKKER = [
        "1:H:i 18:He:i",
        "1:Li:m 2:Be:m 13:B:h 14:C:i 15:N:i 16:O:i 17:F:i 18:Ne:i",
        "1:Na:m 2:Mg:m 13:Al:m 14:Si:h 15:P:i 16:S:i 17:Cl:i 18:Ar:i",
        "1:K:m 2:Ca:m 3:Sc:m 4:Ti:m 5:V:m 6:Cr:m 7:Mn:m 8:Fe:m 9:Co:m 10:Ni:m 11:Cu:m 12:Zn:m 13:Ga:m 14:Ge:h 15:As:h 16:Se:i 17:Br:i 18:Kr:i",
        "1:Rb:m 2:Sr:m 3:Y:m 4:Zr:m 5:Nb:m 6:Mo:m 7:Tc:m 8:Ru:m 9:Rh:m 10:Pd:m 11:Ag:m 12:Cd:m 13:In:m 14:Sn:m 15:Sb:h 16:Te:h 17:I:i 18:Xe:i",
        "1:Cs:m 2:Ba:m 3:La:m 4:Hf:m 5:Ta:m 6:W:m 7:Re:m 8:Os:m 9:Ir:m 10:Pt:m 11:Au:m 12:Hg:m 13:Tl:m 14:Pb:m 15:Bi:m 16:Po:m 17:At:h 18:Rn:i",
        "1:Fr:m 2:Ra:m 3:Ac:m 4:Rf:m 5:Db:m 6:Sg:m 7:Bh:m 8:Hs:m 9:Mt:m 10:Ds:m 11:Rg:m 12:Cn:m 13:Nh:m 14:Fl:m 15:Mc:m 16:Lv:m 17:Ts:m 18:Og:i"
    ];

    var FELTER = [];
    RAEKKER.forEach(function (r, i) {
        r.split(" ").forEach(function (s) {
            var d = s.split(":");
            FELTER.push({ kol: +d[0], raekke: i + 1, sym: d[1], kl: d[2] });
        });
    });

    /* Et gitter: o = { x, y, b, h, mx, my } (feltets bredde og hoejde, mellemrum) */
    function Gitter(o) {
        this.o = o;
    }
    Gitter.prototype.x = function (kol) { return this.o.x + (kol - 1) * (this.o.b + this.o.mx); };
    Gitter.prototype.y = function (r) { return this.o.y + (r - 1) * (this.o.h + this.o.my); };
    Gitter.prototype.cx = function (kol) { return this.x(kol) + this.o.b / 2; };
    Gitter.prototype.cy = function (r) { return this.y(r) + this.o.h / 2; };
    Gitter.prototype.hoejre = function (kol) { return this.x(kol) + this.o.b; };
    Gitter.prototype.bund = function (r) { return this.y(r) + this.o.h; };
    Gitter.prototype.felt = function (sym) {
        for (var i = 0; i < FELTER.length; i++) if (FELTER[i].sym === sym) return FELTER[i];
        return null;
    };

    /* Felterne tegnes; stil(f) giver { fill, stroke, tekst } for hvert felt.
       Returnerer en liste med { f, g, rect, t } */
    Gitter.prototype.tegn = function (g, stil, filter) {
        var self = this, o = this.o;
        var ud = [];
        FELTER.forEach(function (f) {
            if (filter && !filter(f)) return;
            var s = stil(f);
            var gg = SV.g(g);
            var rect = SV.el("rect", { x: self.x(f.kol), y: self.y(f.raekke), width: o.b, height: o.h, rx: 4,
                fill: s.fill, stroke: s.stroke || "none", "stroke-width": s.sw || 1, "stroke-dasharray": s.streg || null }, gg);
            var t = SV.tekst(gg, self.cx(f.kol), self.cy(f.raekke) + o.skrift * 0.36, f.sym,
                { "font-size": o.skrift, "font-weight": 700, fill: s.tekst });
            ud.push({ f: f, g: gg, rect: rect, t: t });
        });
        return ud;
    };

    /* Trappen mellem metallerne og ikke-metallerne, som i bogen */
    Gitter.prototype.trappe = function () {
        var p = [];
        var halv = this.o.mx / 2, halvy = this.o.my / 2;
        var self = this;
        function X(k) { return self.x(k) - halv; }
        function Y(r) { return self.y(r) - halvy; }
        p.push([X(13), Y(2)], [X(13), Y(3)], [X(14), Y(3)], [X(14), Y(4)], [X(15), Y(4)], [X(15), Y(5)],
            [X(16), Y(5)], [X(16), Y(6)], [X(17), Y(6)], [X(17), Y(7)], [this.hoejre(18) + halv, Y(7)]);
        return p.map(function (q) { return q[0] + "," + q[1]; }).join(" ");
    };

    NK.PS = { FELTER: FELTER, Gitter: Gitter };
}());
