/* =====================================================================
   sim_byg.js - fane 1: byg molekylet

   Eleven vaelger C, N, O eller Cl og saetter dem paa det valgte atom.
   Hydrogen og frie elektronpar kommer selv (bygning.js). Bindingen
   mellem to atomer skiftes i panelet eller ved at klikke paa den.

   Naar molekylet aendres, beregnes den nye form, og atomerne glider
   derhen. Den nye form drejes, saa den passer bedst muligt med den
   gamle, saa molekylet ikke hopper rundt, mens man bygger.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var V = NK.V;
    var M = NK.Model3D;
    var B = NK.Bygning;

    var VALGT = "#3d9ee0";
    var MAALT = "#f2c53d";

    /* ----- Opgaverne ------------------------------------------------------ */
    function byggeopgave(id, tekst, hint, svar, ekstra) {
        return function () {
            var maal = B.kendtMedId(id);
            return {
                tekst: tekst, hint: hint, svar: svar,
                start: function (sim) { sim.ryd(); },
                tjek: function (sim) {
                    if (B.noegle(sim.s) !== B.noegle(B.fraSpec(maal))) return false;
                    return ekstra ? ekstra.tjek(sim) : true;
                },
                visSvar: function (sim) {
                    sim.saetStruktur(B.fraSpec(maal));
                    if (ekstra) ekstra.vis(sim);
                }
            };
        };
    }

    /* Vinklen C-O-H i ethanol */
    var COH = {
        tjek: function (sim) {
            var m = sim.maaling();
            if (!m) return false;
            var el = function (id) { return sim.maal.atomer[sim.idIndeks[id]].el; };
            return el(m[1]) === "O" && [el(m[0]), el(m[2])].sort().join() === "C,H";
        },
        vis: function (sim) {
            var g = sim.maal;
            var o = g.atomer.filter(function (a) { return a.el === "O"; })[0];
            var ender = o.naboer.map(function (nb) { return g.atomer[nb.atom].id; });
            sim.skiftVinkelmaaler(true);
            sim.maaleValg = ender;
        }
    };

    var OPGAVER = [
        byggeopgave("C2H4", "Byg ethen, C₂H₄.",
            "Sæt to carbonatomer sammen, og gør bindingen mellem dem til en dobbeltbinding.",
            "To carbonatomer med en dobbeltbinding. Hvert carbonatom har tre retninger, så alle atomer ligger i samme plan."),
        byggeopgave("CH3OH", "Byg methanol, CH₃OH.",
            "Start med carbon, og sæt et oxygenatom på. Hydrogen kommer selv på.",
            "Carbon har fire retninger og er et tetraeder. Oxygen har to bindinger og to frie elektronpar og er vinklet."),
        byggeopgave("CO2", "Byg carbondioxid, CO₂.",
            "Der må ikke sidde hydrogen på carbon. Hvilken binding skal der så være til hvert oxygenatom?",
            "To dobbeltbindinger. Carbon har to retninger, så molekylet er lineært."),
        byggeopgave("HCN", "Byg blåsyre, HCN.",
            "Carbon og nitrogen skal dele tre elektronpar.",
            "En tripelbinding mellem C og N. Carbon har to retninger, så molekylet er lineært."),
        byggeopgave("CH3COOH", "Byg eddikesyre, CH₃COOH.",
            "Det ene carbonatom har to oxygenatomer: det ene med dobbeltbinding, det andet med enkeltbinding.",
            "Carbonatomet med dobbeltbindingen er plant. Det andet carbonatom er et tetraeder."),
        byggeopgave("C2H5OH", "Byg ethanol, C₂H₅OH, og mål vinklen mellem C, O og H.",
            "Slå vinkelmåleren til, og klik på carbonatomet og hydrogenatomet, der sidder på oxygen.",
            "Vinklen er 104,5°. Oxygen har to frie elektronpar, der trykker bindingerne sammen.", COH),
        function () {
            return {
                tekst: "Byg et molekyle med et nitrogenatom, der er pyramideformet.",
                hint: "Nitrogen med tre enkeltbindinger har ét frit elektronpar.",
                svar: "Fx NH₃ eller CH₃NH₂. Tre bindinger og ét frit elektronpar giver en pyramide.",
                start: function (sim) { sim.ryd(); },
                tjek: function (sim) {
                    var at = sim.maal ? sim.maal.atomer : [];
                    return at.some(function (a, i) { return a.el === "N" && B.formRundt(at, i) === "pyramide"; });
                },
                visSvar: function (sim) { sim.saetStruktur(B.fraSpec(B.kendtMedId("CH3NH2"))); }
            };
        },
        function () {
            return {
                tekst: "Byg et molekyle med to carbonatomer, hvor alle atomerne ligger på en ret linje.",
                hint: "En tripelbinding giver hvert carbonatom to retninger.",
                svar: "Fx ethyn, H-C≡C-H. Hvert carbonatom har to retninger, 180° fra hinanden.",
                start: function (sim) { sim.ryd(); },
                tjek: function (sim) {
                    var c = sim.s.atomer.filter(function (a) { return a.el === "C"; });
                    var bd = c.length === 2 ? B.binding(sim.s, c[0].id, c[1].id) : null;
                    return !!(bd && bd.orden === 3);
                },
                visSvar: function (sim) { sim.saetStruktur(B.fraSpec(B.kendtMedId("C2H2"))); }
            };
        },
        function () {
            return {
                tekst: "Her er ethen. Hvilken form har atomerne omkring et af carbonatomerne?",
                valg: D.FORM_ORDEN.map(function (f) { return D.FORMER[f].knap; }),
                rigtig: D.FORM_ORDEN.indexOf("plan"),
                hint: "Tæl retningerne omkring ét carbonatom. En dobbeltbinding tæller som én retning.",
                svar: "Carbon har tre retninger og ingen frie elektronpar. Formen er plan med 120° mellem bindingerne.",
                start: function (sim) { sim.saetStruktur(B.fraSpec(B.kendtMedId("C2H4"))); }
            };
        }
    ];

    /* ----- Simulationen ------------------------------------------------------ */
    NK.SimByg = function () {
        this.laerred = new NK.Laerred(NK.el("byg-laerred"));
        this.vis = new NK.Visning();
        this.s = B.ny();
        this.valgtId = null;
        this.visFrie = true;
        this.vinkelmaaler = false;
        this.maaleValg = [];
        this.disp = {};
        this.dispFrie = {};
        this.maal = null;
        this.idIndeks = {};
        this.radius = 1.5;
        this.proj = null;
        this.hover = -1;
        this.hoverBinding = null;
        this.traek = null;
        this.sidsteFormel = "";
        this.opgaver = new NK.Opgaver("byg", OPGAVER, this);
        this.OPGAVER = OPGAVER;
        this._bindPanel();
        this._bindMus();
        /* Man starter med ét carbonatom, saa methan kan ses med det samme. */
        this.saetStruktur(B.fraSpec({ atomer: ["C"] }));
    };

    var P = NK.SimByg.prototype;

    /* ----- Aendringer i molekylet ---------------------------------------- */
    P.saetStruktur = function (s) {
        this.s = B.kopi(s);
        this.valgtId = this.s.atomer.length ? this.s.atomer[0].id : null;
        this.maaleValg = [];
        this.ombyg();
    };

    P.ryd = function () {
        this.s = B.ny();
        this.valgtId = null;
        this.maaleValg = [];
        this.ombyg();
    };

    P.tilfoej = function (el) {
        var tom = !this.s.atomer.length;
        var grund = B.kanTilfoeje(this.s, this.valgtId, el);
        if (grund !== true) { this.besked(grund); return false; }
        var nyt = B.tilfoej(this.s, tom ? null : this.valgtId, el);
        /* Har det valgte atom ikke flere bindinger tilbage, flytter valget
           over paa det nye atom, saa man kan bygge videre. */
        if (tom || (B.fri(this.s, this.valgtId) === 0 && B.fri(this.s, nyt) > 0)) this.valgtId = nyt;
        this.ombyg();
        return true;
    };

    P.fjernValgt = function () {
        if (this.valgtId === null) return;
        var mig = this;
        var nabo = null;
        this.s.bindinger.forEach(function (bd) {
            if (nabo === null && (bd.a === mig.valgtId || bd.b === mig.valgtId)) nabo = bd.a === mig.valgtId ? bd.b : bd.a;
        });
        B.fjern(this.s, this.valgtId);
        this.valgtId = nabo !== null && B.atom(this.s, nabo) ? nabo : (this.s.atomer.length ? this.s.atomer[0].id : null);
        this.ombyg();
    };

    P.saetOrden = function (a, b, orden) {
        if (!B.saetOrden(this.s, a, b, orden)) {
            this.besked("Et af atomerne har ikke plads til flere bindinger.");
            return false;
        }
        this.ombyg();
        return true;
    };

    P.naesteOrden = function (a, b) {
        if (!B.naesteOrden(this.s, a, b)) {
            this.besked("Atomerne har ikke plads til flere bindinger mellem sig.");
            return false;
        }
        this.ombyg();
        return true;
    };

    /* Ny form: drejes oven i den gamle, og nye atomer vokser ud fra naboen. */
    P.ombyg = function () {
        var mig = this;
        var ny = B.geometri(this.s);
        var faelles = ny.atomer.filter(function (a) { return mig.disp[a.id]; }).map(function (a) { return a.id; });
        if (faelles.length) {
            var j = B.juster(faelles.map(function (id) { return ny.pos[id]; }), faelles.map(function (id) { return mig.disp[id]; }));
            ny.atomer.forEach(function (a) {
                ny.pos[a.id] = V.plus(NK.M3.anvend(j.R, V.minus(ny.pos[a.id], j.cFra)), j.cTil);
            });
            ny.frie.forEach(function (f) { f.u = NK.M3.anvend(j.R, f.u); });
            var midt = [0, 0, 0];
            ny.atomer.forEach(function (a) { midt = V.plus(midt, ny.pos[a.id]); });
            midt = V.gange(midt, 1 / ny.atomer.length);
            ny.atomer.forEach(function (a) { ny.pos[a.id] = V.minus(ny.pos[a.id], midt); });
        }

        var disp = {};
        ny.atomer.forEach(function (a) {
            if (mig.disp[a.id]) { disp[a.id] = mig.disp[a.id]; return; }
            var start = null;
            a.naboer.forEach(function (nb) {
                var id = ny.atomer[nb.atom].id;
                if (!start && mig.disp[id]) start = mig.disp[id].slice();
            });
            disp[a.id] = start || ny.pos[a.id].slice();
        });
        this.disp = disp;

        var frie = {};
        ny.frie.forEach(function (f) { frie[f.noegle] = mig.dispFrie[f.noegle] || f.u.slice(); });
        this.dispFrie = frie;

        this.maal = ny;
        this.idIndeks = {};
        var radius = 0.9;
        ny.atomer.forEach(function (a, i) {
            mig.idIndeks[a.id] = i;
            radius = Math.max(radius, V.laengde(ny.pos[a.id]) + (a.el === "H" ? 0.4 : 1.2));
        });
        this.radius = radius;
        this.maaleValg = this.maaleValg.filter(function (id) { return mig.idIndeks[id] !== undefined; });
        this.opdaterPanel();
    };

    /* ----- Vinkelmaaleren -------------------------------------------------- */
    P.skiftVinkelmaaler = function (til) {
        this.vinkelmaaler = til === undefined ? !this.vinkelmaaler : !!til;
        this.maaleValg = [];
        var knap = NK.el("byg-vinkelknap");
        knap.classList.toggle("aktiv", this.vinkelmaaler);
        knap.setAttribute("aria-pressed", this.vinkelmaaler ? "true" : "false");
        if (this.vinkelmaaler) this.besked("Klik på to atomer, der sidder på samme atom.");
    };

    P.faellesNabo = function (a, b) {
        var g = this.maal;
        var ia = this.idIndeks[a], ib = this.idIndeks[b];
        if (ia === undefined || ib === undefined) return null;
        var na = g.atomer[ia].naboer.map(function (nb) { return nb.atom; });
        for (var k = 0; k < g.atomer[ib].naboer.length; k++) {
            var c = g.atomer[ib].naboer[k].atom;
            if (na.indexOf(c) >= 0) return g.atomer[c].id;
        }
        return null;
    };

    P.maaling = function () {
        if (this.maaleValg.length !== 2) return null;
        var c = this.faellesNabo(this.maaleValg[0], this.maaleValg[1]);
        return c === null ? null : [this.maaleValg[0], c, this.maaleValg[1]];
    };

    P.klikMaal = function (id) {
        if (id === null) { this.maaleValg = []; return; }
        var i = this.maaleValg.indexOf(id);
        if (i >= 0) { this.maaleValg.splice(i, 1); return; }
        this.maaleValg.push(id);
        if (this.maaleValg.length > 2) this.maaleValg.shift();
        if (this.maaleValg.length === 2 && this.faellesNabo(this.maaleValg[0], this.maaleValg[1]) === null) {
            this.besked("Vælg to atomer, der sidder på samme atom.");
            this.maaleValg = [id];
        } else if (this.maaleValg.length === 1) {
            this.besked("Klik på ét atom mere.");
        }
    };

    /* ----- Panelet -------------------------------------------------------- */
    P._bindPanel = function () {
        var mig = this;
        Array.prototype.forEach.call(document.querySelectorAll("#byg-palette .atomknap"), function (k) {
            k.addEventListener("click", function () { mig.tilfoej(k.getAttribute("data-el")); });
        });
        NK.el("byg-bindingsliste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("button[data-orden]") : null;
            if (!k || k.disabled) return;
            mig.saetOrden(+k.getAttribute("data-a"), +k.getAttribute("data-b"), +k.getAttribute("data-orden"));
        });
        NK.el("byg-bindingsliste").addEventListener("mouseover", function (e) {
            var r = e.target.closest ? e.target.closest("[data-raekke]") : null;
            mig.fremhaevRaekke = r ? r.getAttribute("data-raekke").split("-").map(Number) : null;
        });
        NK.el("byg-bindingsliste").addEventListener("mouseleave", function () { mig.fremhaevRaekke = null; });
        NK.el("byg-frie").addEventListener("change", function () { mig.visFrie = this.checked; });
        NK.el("byg-fjern").addEventListener("click", function () { mig.fjernValgt(); });
        NK.el("byg-nulstil").addEventListener("click", function () { mig.ryd(); });
        NK.el("byg-vinkelknap").addEventListener("click", function () { mig.skiftVinkelmaaler(); });
    };

    var TEGN = { 1: "-", 2: "=", 3: "≡" };
    var IKON = { 1: "enkelt", 2: "dobbelt", 3: "tripel" };
    var ORDNAVN = { 1: "Enkeltbinding", 2: "Dobbeltbinding", 3: "Tripelbinding" };

    P.opdaterPanel = function () {
        var s = this.s, mig = this;
        var valgt = this.valgtId !== null ? B.atom(s, this.valgtId) : null;

        Array.prototype.forEach.call(document.querySelectorAll("#byg-palette .atomknap"), function (k) {
            var grund = B.kanTilfoeje(s, mig.valgtId, k.getAttribute("data-el"));
            k.disabled = grund !== true;
            k.title = grund === true ? D.GRUNDSTOFFER[k.getAttribute("data-el")].navn : grund;
        });
        NK.saetTekst("byg-valgt", !s.atomer.length ? "vælg det første atom" : valgt ? "sættes på " + valgt.el : "klik på et atom");
        NK.el("byg-fjern").disabled = !valgt;

        var html = "";
        s.bindinger.forEach(function (bd) {
            var a = B.atom(s, bd.a), b = B.atom(s, bd.b);
            var mulige = B.muligeOrdener(s, bd.a, bd.b);
            html += '<div class="bindingsvalg-raekke" data-raekke="' + bd.a + "-" + bd.b + '">' +
                '<span class="bnavn">' + a.el + TEGN[bd.orden] + b.el + "</span>" +
                '<div class="bindingsvalg">';
            [1, 2, 3].forEach(function (o) {
                html += '<button type="button" class="' + (o === bd.orden ? "aktiv" : "") + '" data-a="' + bd.a + '" data-b="' + bd.b +
                    '" data-orden="' + o + '" title="' + ORDNAVN[o] + '"' + (mulige.indexOf(o) < 0 ? " disabled" : "") +
                    '><span class="brik-ikon ' + IKON[o] + '"></span></button>';
            });
            html += "</div></div>";
        });
        NK.saetHTML("byg-bindingsliste", html || '<p class="note">Sæt to atomer sammen for at vælge bindingen mellem dem.</p>');

        var kendt = B.kendt(s);
        var formel = kendt ? NK.formel(kendt.formel) : (s.atomer.length ? NK.formel(B.formel(s)) : "?");
        NK.saetTekst("byg-formel", formel);
        NK.saetKlasse("byg-formel", s.atomer.length ? "fformel" : "fformel ukendt");
        NK.saetTekst("byg-navn", kendt ? kendt.navn : "");
        if (kendt && formel !== this.sidsteFormel) {
            var fv = NK.el("byg-formelvis");
            fv.classList.remove("ny");
            void fv.offsetWidth;
            fv.classList.add("ny");
        }
        this.sidsteFormel = kendt ? formel : "";

        var i = valgt ? this.idIndeks[valgt.id] : undefined;
        var form = i !== undefined ? B.formRundt(this.maal.atomer, i) : null;
        NK.saetTekst("byg-form-atom", valgt ? "Omkring " + valgt.el : "Omkring valgt atom");
        NK.saetTekst("byg-form", form ? D.FORMER[form].navn : "-");
    };

    P.besked = function (tekst) {
        var e = NK.el("byg-besked");
        e.textContent = tekst;
        e.classList.remove("vis");
        void e.offsetWidth;
        e.classList.add("vis");
        window.clearTimeout(this._beskedUr);
        this._beskedUr = window.setTimeout(function () { e.classList.remove("vis"); }, 2800);
    };

    /* ----- Musen: traek drejer, klik vaelger atom eller binding --------- */
    P._punkt = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    /* Bindingen mellem to tunge atomer under (x, y): [idA, idB] eller null. */
    P.bindingVed = function (x, y) {
        if (!this.proj || !this.maal) return null;
        var g = this.maal, bedst = null, bedstD = 10;
        for (var i = 0; i < g.atomer.length; i++) {
            if (g.atomer[i].el === "H") continue;
            for (var k = 0; k < g.atomer[i].naboer.length; k++) {
                var j = g.atomer[i].naboer[k].atom;
                if (j < i || g.atomer[j].el === "H") continue;
                var p1 = this.proj[i], p2 = this.proj[j];
                var dx = p2.x - p1.x, dy = p2.y - p1.y, l2 = dx * dx + dy * dy;
                if (l2 < 1) continue;
                var t = NK.klamp(((x - p1.x) * dx + (y - p1.y) * dy) / l2, 0, 1);
                var d = Math.hypot(x - (p1.x + t * dx), y - (p1.y + t * dy));
                if (d < bedstD && t > 0.1 && t < 0.9) { bedstD = d; bedst = [g.atomer[i].id, g.atomer[j].id]; }
            }
        }
        return bedst;
    };

    P.klik = function (x, y) {
        var idx = M.atomVed(this.proj, x, y);
        var g = this.maal;
        if (this.vinkelmaaler) {
            this.klikMaal(idx >= 0 ? g.atomer[idx].id : null);
            return;
        }
        if (idx >= 0) {
            var a = g.atomer[idx];
            /* Et klik paa et H vaelger det atom, H'et sidder paa. */
            this.valgtId = a.el === "H" ? g.atomer[a.naboer[0].atom].id : a.id;
            this.opdaterPanel();
            return;
        }
        var bd = this.bindingVed(x, y);
        if (bd) this.naesteOrden(bd[0], bd[1]);
    };

    P._bindMus = function () {
        var mig = this;
        var cvs = this.laerred.canvas;

        cvs.addEventListener("pointerdown", function (e) {
            var p = mig._punkt(e);
            mig.traek = { x0: p.x, y0: p.y, x: p.x, y: p.y, flyttet: false };
            try { cvs.setPointerCapture(e.pointerId); } catch (fejl) { /* ignoreres */ }
        });

        cvs.addEventListener("pointermove", function (e) {
            var p = mig._punkt(e);
            var t = mig.traek;
            if (!t) {
                mig.hover = M.atomVed(mig.proj, p.x, p.y);
                mig.hoverBinding = mig.hover < 0 && !mig.vinkelmaaler ? mig.bindingVed(p.x, p.y) : null;
                cvs.style.cursor = mig.hover >= 0 || mig.hoverBinding ? "pointer" : "grab";
                return;
            }
            if (Math.hypot(p.x - t.x0, p.y - t.y0) > 4) t.flyttet = true;
            if (t.flyttet) {
                cvs.style.cursor = "grabbing";
                mig.vis.drej(p.x - t.x, p.y - t.y);
            }
            t.x = p.x;
            t.y = p.y;
        });

        function slip(e) {
            var t = mig.traek;
            if (!t) return;
            mig.traek = null;
            cvs.style.cursor = "grab";
            if (!t.flyttet && e.type === "pointerup") mig.klik(t.x0, t.y0);
        }
        cvs.addEventListener("pointerup", slip);
        cvs.addEventListener("pointercancel", slip);
        cvs.addEventListener("pointerleave", function () { if (!mig.traek) { mig.hover = -1; mig.hoverBinding = null; } });
    };

    /* ----- Modellen, som model3d.js tegner ------------------------------- */
    P._bygModel = function () {
        var g = this.maal, mig = this;
        if (!g) return { atomer: [], bindinger: [], frie: [] };
        var bindinger = [];
        g.atomer.forEach(function (a, i) {
            a.naboer.forEach(function (nb) { if (nb.atom > i) bindinger.push({ a: i, b: nb.atom, orden: nb.orden }); });
        });
        return {
            atomer: g.atomer.map(function (a) { return { el: a.el, p: mig.disp[a.id] }; }),
            bindinger: bindinger,
            frie: g.frie.map(function (f) { return { atom: mig.idIndeks[f.ejer], u: mig.dispFrie[f.noegle], lille: f.lille }; })
        };
    };

    /* ----- Faelles graenseflade: tilpas / opdater / tegn / nulstil ------- */
    P.tilpas = function () {
        var nyt = this.laerred.tilpas();
        this.vis.tilpas(this.laerred.b, this.laerred.h, this.radius, nyt && !this._tilpasset);
        if (this.laerred.b > 10) this._tilpasset = true;
    };

    P.opdater = function (dt) {
        var mig = this;
        var k = 1 - Math.exp(-7 * dt);
        if (this.maal) {
            this.maal.atomer.forEach(function (a) {
                var d = mig.disp[a.id], t = mig.maal.pos[a.id];
                mig.disp[a.id] = V.plus(d, V.gange(V.minus(t, d), k));
            });
            this.maal.frie.forEach(function (f) {
                var u = mig.dispFrie[f.noegle];
                var ny = V.plus(u, V.gange(V.minus(f.u, u), k));
                mig.dispFrie[f.noegle] = V.laengde(ny) < 0.2 ? f.u.slice() : V.enhed(ny);
            });
        }
        this.vis.tilpas(this.laerred.b, this.laerred.h, this.radius, false);
        this.vis.opdater(dt);
        this.opgaver.opdater();
        var m = this.maaling();
        NK.saetTekst("byg-vinkel", m ? NK.grader(V.vinkel(V.minus(this.disp[m[0]], this.disp[m[1]]), V.minus(this.disp[m[2]], this.disp[m[1]]))) : "-");
    };

    P.tegn = function () {
        var ctx = this.laerred.ctx;
        var b = this.laerred.b, h = this.laerred.h;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, b, h);
        var glod = ctx.createRadialGradient(b / 2, h / 2, 0, b / 2, h / 2, Math.min(b, h) * 0.55);
        glod.addColorStop(0, "rgba(61, 158, 224, 0.07)");
        glod.addColorStop(1, "rgba(61, 158, 224, 0)");
        ctx.fillStyle = glod;
        ctx.fillRect(0, 0, b, h);

        if (!this.s.atomer.length) {
            NK.tekst(ctx, "Vælg det første atom i panelet.", b / 2, h / 2, { font: "600 16px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#9aa1ab" });
            this.proj = [];
            return;
        }

        var mig = this;
        var markeret = {};
        if (this.valgtId !== null && !this.vinkelmaaler) markeret[this.idIndeks[this.valgtId]] = VALGT;
        this.maaleValg.forEach(function (id) { markeret[mig.idIndeks[id]] = MAALT; });

        this.proj = M.tegn(ctx, this.vis, this._bygModel(), { visFrie: this.visFrie, markeret: markeret, hover: this.hover });

        var fremhaev = this.hoverBinding || this.fremhaevRaekke;
        if (fremhaev) {
            var p1 = this.proj[this.idIndeks[fremhaev[0]]], p2 = this.proj[this.idIndeks[fremhaev[1]]];
            if (p1 && p2) {
                ctx.save();
                ctx.strokeStyle = "rgba(242, 197, 61, 0.45)";
                ctx.lineWidth = 14;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                ctx.restore();
            }
        }

        var m = this.maaling();
        if (m) M.tegnVinkel(ctx, this.vis, this.disp[m[0]], this.disp[m[1]], this.disp[m[2]]);
    };

    P.nulstil = function () {
        this.opgaver.nulstil();
        this.skiftVinkelmaaler(false);
        this.saetStruktur(B.fraSpec({ atomer: ["C"] }));
    };
}());
