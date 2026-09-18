/* =====================================================================
   sim_polaritet.js - fane 3: polaer eller upolaer?

   Samme molekyler og kamera som fane 2 (NK.MolSim i sim_molekyler.js).
   Ovenpaa tegnes:
     traek        en pil langs hver polaer binding, fra δ+ mod δ−,
                  laengere jo stoerre forskel i elektronegativitet
     δ+ og δ−     ved de atomer, der er ende af en polaer binding
     samlet traek summen af pilene gennem molekylets midte

   Om molekylet er polaert, regnes ud i data.js ud fra de samme pile, saa
   tegningen og facit ikke kan vaere uenige.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var V = NK.V;
    var M = NK.Model3D;

    var PLUS = "#f39a8f";
    var MINUS = "#8fcaf0";
    var TRAEK = "#f2a93b";
    var SAMLET = "#7ee0a8";
    var KANT = "rgba(10, 10, 16, 0.85)";

    var ALLE = D.MOLEKYLER.map(function (m) { return m.id; });

    var OPGAVER = [
        function (sim) {
            var mol = sim.nytMolekyle(ALLE);
            return {
                mol: mol.id,
                tekst: "Er " + mol.formel + " polært eller upolært?",
                valg: ["Polært", "Upolært"],
                rigtig: mol.polaer ? 0 : 1,
                hint: mol.hintPol,
                svar: mol.svarPol,
                start: function (s) { s.startOpgaveMol(mol.id, { polaer: true }, { "pol-samlet": false }); },
                slut: function (s) { s.slutOpgaveMol(); }
            };
        },
        function (sim) {
            var mol = sim.nytMolekyle(["H2O", "NH3", "HCl", "CH3Cl", "HCN", "CH2O"]);
            var minus = mol.delta.indexOf(-1);
            var el = mol.atomer[minus].el;
            return {
                mol: mol.id,
                tekst: "Klik på det atom i " + mol.formel + ", der bliver δ−.",
                hint: "Det mest elektronegative atom trækker elektronerne i bindingen til sig. Find det i tabellen.",
                svar: NK.formel(el) + " har den største elektronegativitet (" + NK.tal(D.GRUNDSTOFFER[el].en, 1) + ") og bliver δ−.",
                start: function (s) { s.startOpgaveMol(mol.id, {}, { "pol-delta": false, "pol-traek": false, "pol-samlet": false }); },
                klik: function (s, idx) {
                    if (idx < 0) return false;
                    if (s.mol().delta[idx] === -1) return true;
                    return "Det er " + D.GRUNDSTOFFER[s.mol().atomer[idx].el].navn + ". Prøv et andet atom.";
                },
                slut: function (s) { s.slutOpgaveMol(); }
            };
        },
        function (sim) {
            var mol = sim.nytMolekyle(["CO2", "CCl4"]);
            var svar = [
                "Trækkene er lige store og ophæver hinanden",
                "Atomerne har samme elektronegativitet",
                "Bindingerne er for korte til at være polære",
                "Molekylet har ingen frie elektronpar"
            ];
            var orden = NK.bland([0, 1, 2, 3]);
            return {
                mol: mol.id,
                tekst: "Bindingerne i " + mol.formel + " er polære. Hvorfor er molekylet alligevel upolært?",
                valg: orden.map(function (i) { return svar[i]; }),
                rigtig: orden.indexOf(0),
                hint: "Se på trækkene i bindingerne, mens molekylet drejer. Hvilken vej peger de?",
                svar: mol.svarPol,
                start: function (s) { s.startOpgaveMol(mol.id, { polaer: true }, { "pol-samlet": false }); },
                slut: function (s) { s.slutOpgaveMol(); }
            };
        }
    ];

    NK.SimPolaritet = function () {
        this.init("pol", OPGAVER, ["pol-delta", "pol-traek", "pol-samlet", "pol-drej"]);
    };

    NK.SimPolaritet.prototype = Object.create(NK.MolSim.prototype);
    var P = NK.SimPolaritet.prototype;

    P.flag = function (id) {
        if (id === "pol-prikvis") return true;
        return NK.MolSim.prototype.flag.call(this, id);
    };

    /* ----- Panelet ----------------------------------------------------------- */
    function bindingstabel(mol) {
        var set = {};
        var html = "";
        mol.bindinger.forEach(function (b) {
            var A = mol.atomer[b[0]].el, B = mol.atomer[b[1]].el;
            var gA = D.GRUNDSTOFFER[A], gB = D.GRUNDSTOFFER[B];
            var hoej = gA.en >= gB.en ? A : B, lav = hoej === A ? B : A;
            var tegn = b[2] === 1 ? "-" : b[2] === 2 ? "=" : "≡";
            var noegle = hoej + tegn + lav;
            if (set[noegle]) return;
            set[noegle] = true;
            var dEN = Math.abs(gA.en - gB.en);
            var polaer = dEN >= D.POLAER_GRAENSE - 1e-9;
            html += '<div class="bindingsraekke">' +
                '<span class="bnavn">' + NK.formel(hoej) + tegn + NK.formel(lav) + "</span>" +
                '<span class="bregning">' + NK.tal(D.GRUNDSTOFFER[hoej].en, 1) + " − " + NK.tal(D.GRUNDSTOFFER[lav].en, 1) + " = <b>" + NK.tal(dEN, 1) + "</b></span>" +
                '<span class="maerke ' + (polaer ? "orange" : "graa") + '">' + (polaer ? "polær" : "upolær") + "</span>" +
                "</div>";
        });
        return html;
    }

    P.opdater = function (dt) {
        this.opdaterFaelles(dt);
        var mol = this.mol();
        NK.saetHTML("pol-en-tabel", bindingstabel(mol));
        NK.saetTekst("pol-formel", mol.navn.charAt(0).toUpperCase() + mol.navn.slice(1) + ", " + mol.formel + ", er");
        if (this.skjul.polaer) {
            NK.saetTekst("pol-polaer", "?");
            NK.saetKlasse("pol-polaer", "maerke graa");
        } else {
            NK.saetTekst("pol-polaer", mol.polaer ? "polært" : "upolært");
            NK.saetKlasse("pol-polaer", mol.polaer ? "maerke orange" : "maerke groen");
        }
    };

    /* ----- Tegningen --------------------------------------------------------- */
    P.tegnTraek = function (ctx, mol) {
        var vis = this.vis;
        mol.traek.forEach(function (t) {
            var A = mol.atomer[t.plus].p, Bp = mol.atomer[t.minus].p;
            var andel = NK.klamp(0.22 + t.dEN * 0.3, 0.36, 0.7);
            var s0 = vis.projicer(V.plus(A, V.gange(V.minus(Bp, A), 0.5 - andel / 2)));
            var s1 = vis.projicer(V.plus(A, V.gange(V.minus(Bp, A), 0.5 + andel / 2)));
            var dx = s1.x - s0.x, dy = s1.y - s0.y, l = Math.hypot(dx, dy);
            if (l < 10) return;
            var nx = -dy / l, ny = dx / l;
            if (ny > 0) { nx = -nx; ny = -ny; }
            var afst = 0.2 * vis.skala * (s0.f + s1.f) / 2;
            M.pil(ctx, s0.x + nx * afst, s0.y + ny * afst, s1.x + nx * afst, s1.y + ny * afst,
                { farve: TRAEK, kant: KANT, bredde: 3, hoved: 12, kryds: true });
        });
    };

    P.tegnDelta = function (ctx, mol) {
        var proj = this.proj;
        mol.delta.forEach(function (d, i) {
            if (!d) return;
            var p = proj[i];
            NK.tekst(ctx, d > 0 ? "δ+" : "δ−", p.x + p.R * 0.7 + 4, p.y - p.R * 0.7 - 4, {
                font: "700 17px 'Segoe UI', sans-serif", justering: "left", linje: "middle",
                farve: d > 0 ? PLUS : MINUS, kant: true, kantBredde: 4
            });
        });
    };

    P.tegnSamlet = function (ctx, mol) {
        var vis = this.vis;
        var s = mol.samletTraek;
        var c = vis.projicer([0, 0, 0]);
        if (!mol.polaer) {
            ctx.save();
            ctx.strokeStyle = SAMLET;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            NK.etiket(ctx, "samlet træk: 0", c.x, c.y + 26, { farve: SAMLET });
            return;
        }
        var u = V.enhed(s);
        var l = NK.klamp(V.laengde(s) * 1.1, 0.9, 1.8);
        var a = vis.projicer(V.gange(u, -l / 2)), b = vis.projicer(V.gange(u, l / 2));
        if (Math.hypot(b.x - a.x, b.y - a.y) < 14) {
            NK.etiket(ctx, "samlet træk peger mod dig", c.x, c.y + 26, { farve: SAMLET });
            return;
        }
        M.pil(ctx, a.x, a.y, b.x, b.y, { farve: SAMLET, kant: KANT, bredde: 6, hoved: 20, kryds: true });
    };

    P.tegn = function () {
        var ctx = this.tegnBaggrund();
        var mol = this.mol();
        this.proj = M.tegn(ctx, this.vis, mol.model, { visFrie: false, hover: this.hover });
        if (this.flag("pol-traek")) this.tegnTraek(ctx, mol);
        if (this.flag("pol-delta")) this.tegnDelta(ctx, mol);
        if (this.flag("pol-samlet")) this.tegnSamlet(ctx, mol);
        this.tegnPrik();
    };

    P.nulstil = function () {
        this.nulstilFaelles();
    };
}());
