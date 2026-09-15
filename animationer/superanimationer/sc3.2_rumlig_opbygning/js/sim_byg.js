/* =====================================================================
   sim_byg.js - fane 1: byg formen

   Eleven saetter bindinger og frie elektronpar paa et centralatom.
   Grupperne skubber til hinanden (frastoedning.js) og finder selv den
   form, der giver mest plads. Man kan tage fat i en gruppe, traekke den
   et andet sted hen og se den glide tilbage, naar man slipper.

   Enkeltbindinger gaar til H, dobbeltbindinger til O, tripelbindinger
   til N. Centralatomet er det grundstof, der faar oktet, og formlen vises
   i panelet. Uden oktet er centralatomet en graa kugle uden symbol.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var V = NK.V;
    var M = NK.Model3D;

    var MAKS = 4;
    var RADIUS = 1.9;
    var BRIKKER = {
        enkelt:  { type: "binding", orden: 1 },
        dobbelt: { type: "binding", orden: 2 },
        tripel:  { type: "binding", orden: 3 },
        fri:     { type: "fri", orden: 0 }
    };

    /* ----- Opgaverne ------------------------------------------------------ */
    function byggeopgave(maal, tekst, hint, svar, maalVinkel) {
        return function () {
            return {
                tekst: tekst, hint: hint, svar: svar,
                start: function (sim) { sim.ryd(); },
                tjek: function (sim) {
                    if (!sim.har(maal)) return false;
                    return !maalVinkel || sim.harMaaltBindinger();
                },
                visSvar: function (sim) { sim.saetGrupper(maal); }
            };
        };
    }

    var OPGAVER = [
        byggeopgave({ enkelt: 3, fri: 1 }, "Byg ammoniak, NH₃.",
            "Nitrogen har 5 valenselektroner. Tre af dem bruges i bindinger til H. Hvad bliver de to sidste til?",
            "Tre enkeltbindinger og ét frit elektronpar. Formen er en pyramide."),
        byggeopgave({ enkelt: 2, fri: 2 }, "Byg vand, H₂O.",
            "Oxygen har 6 valenselektroner og danner to bindinger. Hvor mange elektronpar bliver der tilbage?",
            "To enkeltbindinger og to frie elektronpar. Molekylet er vinklet."),
        byggeopgave({ dobbelt: 2 }, "Byg carbondioxid, CO₂.",
            "Carbon deler to elektronpar med hvert oxygenatom.",
            "To dobbeltbindinger og ingen frie elektronpar. De to retninger ligger 180° fra hinanden, så CO₂ er lineært."),
        byggeopgave({ enkelt: 2, dobbelt: 1 }, "Byg formaldehyd, CH₂O.",
            "Carbon har fire bindinger i alt, og to af dem går til hvert sit H-atom.",
            "To enkeltbindinger og én dobbeltbinding. Tre retninger giver en plan trekant med 120°."),
        byggeopgave({ enkelt: 1, tripel: 1 }, "Byg blåsyre, HCN.",
            "Carbon binder til H med én binding. Hvor mange bindinger skal der så være til N?",
            "En enkeltbinding og en tripelbinding. To retninger giver et lineært molekyle."),
        byggeopgave({ enkelt: 4 }, "Byg methan, CH₄, og mål vinklen mellem to bindinger.",
            "Slå vinkelmåleren til, og klik på to H-atomer.",
            "Fire enkeltbindinger og ingen frie elektronpar. Vinklen er 109,5°.", true),
        byggeopgave({ enkelt: 3, fri: 1 }, "Byg NH₃, og mål vinklen mellem to N-H-bindinger.",
            "Slå vinkelmåleren til, og klik på to H-atomer.",
            "Vinklen er 107°. Det frie elektronpar skubber lidt mere end bindingerne og trykker dem sammen.", true),
        function () {
            return {
                tekst: "Her er CH₄. Skift én enkeltbinding ud med et frit elektronpar. Hvad sker der med vinklen mellem bindingerne?",
                valg: ["Den bliver mindre", "Den bliver større", "Den er uændret"],
                rigtig: 0,
                hint: "Mål vinklen mellem to H-atomer med vinkelmåleren før og efter.",
                svar: "Vinklen går fra 109,5° til 107°. Et frit elektronpar skubber mere end en binding.",
                start: function (sim) { sim.ryd(); sim.saetGrupper({ enkelt: 4 }); },
                visSvar: function (sim) { sim.saetGrupper({ enkelt: 3, fri: 1 }); }
            };
        },
        function () {
            return {
                tekst: "Byg et molekyle, der er plant, og hvor centralatomet har oktet.",
                hint: "Et plant molekyle har tre retninger og ingen frie elektronpar på centralatomet. Carbon skal have fire bindinger i alt.",
                svar: "CH₂O: to enkeltbindinger og én dobbeltbinding giver tre retninger i samme plan.",
                start: function (sim) { sim.ryd(); },
                tjek: function (sim) {
                    var t = sim.taelling();
                    if (t.fri || t.enkelt + t.dobbelt + t.tripel !== 3) return false;
                    return sim.centralatom() ? true : "Formen er plan, men centralatomet har ikke oktet.";
                },
                visSvar: function (sim) { sim.saetGrupper({ enkelt: 2, dobbelt: 1 }); }
            };
        }
    ];

    /* ----- Simulationen ------------------------------------------------------ */
    NK.SimByg = function () {
        this.laerred = new NK.Laerred(NK.el("byg-laerred"));
        this.vis = new NK.Visning();
        this.grupper = [];
        this.visning = "molekyle";
        this.visFrie = true;
        this.vinkelmaaler = false;
        this.valgt = [];
        this.model = null;
        this.proj = null;
        this.hover = null;
        this.traek = null;
        this.sidsteFormel = "";
        this.opgaver = new NK.Opgaver("byg", OPGAVER, this);
        this.OPGAVER = OPGAVER;
        this._bindPanel();
        this._bindMus();
        /* Man starter med methan, saa formen kan ses med det samme. */
        this.saetGrupper({ enkelt: 4 });
        this.opdaterPanel();
    };

    var P = NK.SimByg.prototype;

    /* ----- Grupperne ----------------------------------------------------- */
    P.taelling = function () {
        var t = { enkelt: 0, dobbelt: 0, tripel: 0, fri: 0 };
        this.grupper.forEach(function (g) {
            if (g.type === "fri") t.fri++;
            else t[g.orden === 1 ? "enkelt" : g.orden === 2 ? "dobbelt" : "tripel"]++;
        });
        return t;
    };

    P.har = function (maal) {
        var t = this.taelling();
        return ["enkelt", "dobbelt", "tripel", "fri"].every(function (k) { return t[k] === (maal[k] || 0); });
    };

    P.centralatom = function () {
        var t = this.taelling();
        return D.centralatom(t.enkelt, t.dobbelt, t.tripel, t.fri);
    };

    P.tilfoej = function (brik) {
        if (this.grupper.length >= MAKS) {
            this.besked("Der er ikke plads til flere. Fire retninger er det højeste her.");
            return false;
        }
        var b = BRIKKER[brik];
        this.grupper.push({ type: b.type, orden: b.orden, u: NK.Frastoed.nyRetning(this.grupper), v: [0, 0, 0] });
        this.opdaterPanel();
        return true;
    };

    P.fjern = function (brik) {
        var b = BRIKKER[brik];
        for (var i = this.grupper.length - 1; i >= 0; i--) {
            var g = this.grupper[i];
            if (g.type === b.type && g.orden === b.orden) {
                this.grupper.splice(i, 1);
                this.valgt = this.valgt.filter(function (x) { return x !== g; });
                this.opdaterPanel();
                return true;
            }
        }
        return false;
    };

    P.ryd = function () {
        this.grupper = [];
        this.valgt = [];
        this.traek = null;
        this.opdaterPanel();
    };

    /* Saetter et bestemt antal af hver slags, og beholder de grupper,
       der allerede passer, saa man kan se formen aendre sig. */
    P.saetGrupper = function (maal) {
        var mig = this;
        ["enkelt", "dobbelt", "tripel", "fri"].forEach(function (k) {
            var b = BRIKKER[k];
            var nu = mig.grupper.filter(function (g) { return g.type === b.type && g.orden === b.orden; }).length;
            for (; nu > (maal[k] || 0); nu--) mig.fjern(k);
        });
        ["enkelt", "dobbelt", "tripel", "fri"].forEach(function (k) {
            var b = BRIKKER[k];
            var nu = mig.grupper.filter(function (g) { return g.type === b.type && g.orden === b.orden; }).length;
            for (; nu < (maal[k] || 0); nu++) mig.tilfoej(k);
        });
    };

    /* ----- Vinkelmaaleren -------------------------------------------------- */
    P.skiftVinkelmaaler = function (til) {
        this.vinkelmaaler = til === undefined ? !this.vinkelmaaler : !!til;
        if (!this.vinkelmaaler) this.valgt = [];
        var knap = NK.el("byg-vinkelknap");
        knap.classList.toggle("aktiv", this.vinkelmaaler);
        knap.setAttribute("aria-pressed", this.vinkelmaaler ? "true" : "false");
        if (this.vinkelmaaler) this.besked(this.visning === "balloner" ? "Klik på to balloner." : "Klik på to atomer.");
    };

    P.maaling = function () {
        var mig = this;
        var ok = this.valgt.length === 2 && this.valgt.every(function (g) {
            return mig.grupper.indexOf(g) >= 0 && (mig.visning === "balloner" || g.type === "binding");
        });
        return ok ? this.valgt : null;
    };

    P.harMaaltBindinger = function () {
        var m = this.maaling();
        return !!(m && m[0].type === "binding" && m[1].type === "binding");
    };

    P.vaelgTilMaaling = function (g) {
        if (!g) { this.valgt = []; return; }
        if (this.visning === "molekyle" && g.type === "fri") {
            this.besked("Vinkelmåleren måler mellem atomer. Klik på to atomer.");
            return;
        }
        var i = this.valgt.indexOf(g);
        if (i >= 0) { this.valgt.splice(i, 1); return; }
        this.valgt.push(g);
        if (this.valgt.length > 2) this.valgt.shift();
        if (this.valgt.length === 1) this.besked(this.visning === "balloner" ? "Klik på én ballon mere." : "Klik på ét atom mere.");
    };

    /* ----- Panelet -------------------------------------------------------- */
    P._bindPanel = function () {
        var mig = this;
        var knapper = document.querySelectorAll("#byg-saet .talknap");
        Array.prototype.forEach.call(knapper, function (k) {
            k.addEventListener("click", function () {
                var brik = k.getAttribute("data-brik");
                if (k.getAttribute("data-d") === "1") mig.tilfoej(brik); else mig.fjern(brik);
            });
        });
        Array.prototype.forEach.call(document.querySelectorAll("#byg-visning .tilstandsknap"), function (k) {
            k.addEventListener("click", function () { mig.saetVisning(k.getAttribute("data-visning")); });
        });
        NK.el("byg-frie").addEventListener("change", function () { mig.visFrie = this.checked; });
        NK.el("byg-nulstil").addEventListener("click", function () { mig.ryd(); });
        NK.el("byg-vinkelknap").addEventListener("click", function () { mig.skiftVinkelmaaler(); });
    };

    P.saetVisning = function (v) {
        this.visning = v;
        this.valgt = [];
        Array.prototype.forEach.call(document.querySelectorAll("#byg-visning .tilstandsknap"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-visning") === v);
        });
        NK.el("byg-frie").disabled = v === "balloner";
    };

    P.opdaterPanel = function () {
        var t = this.taelling();
        var i = this.grupper.length;
        ["enkelt", "dobbelt", "tripel", "fri"].forEach(function (k) {
            NK.saetTekst("byg-tal-" + k, String(t[k]));
        });
        Array.prototype.forEach.call(document.querySelectorAll("#byg-saet .talknap"), function (k) {
            var brik = k.getAttribute("data-brik");
            k.disabled = k.getAttribute("data-d") === "1" ? i >= MAKS : t[brik] === 0;
        });
        NK.saetTekst("byg-antal", i + " af " + MAKS + " retninger");

        var el = this.centralatom();
        var noegle = el ? [el, t.enkelt, t.dobbelt, t.tripel].join("|") : "";
        var kendt = D.BYGGEDE[noegle];
        var formel = kendt ? NK.formel(kendt.formel) : "?";
        NK.saetTekst("byg-formel", formel);
        NK.saetTekst("byg-navn", kendt ? kendt.navn : (i ? "Centralatomet har ikke oktet." : "Sæt bindinger på centralatomet."));
        NK.saetKlasse("byg-formel", kendt ? "fformel" : "fformel ukendt");
        if (kendt && formel !== this.sidsteFormel) {
            var fv = NK.el("byg-formelvis");
            fv.classList.remove("ny");
            void fv.offsetWidth;
            fv.classList.add("ny");
        }
        this.sidsteFormel = kendt ? formel : "";

        var bindinger = t.enkelt + t.dobbelt + t.tripel;
        var form = D.form(bindinger, t.fri);
        NK.saetTekst("byg-form", form ? D.FORMER[form].navn : "-");
    };

    P.besked = function (tekst) {
        var e = NK.el("byg-besked");
        e.textContent = tekst;
        e.classList.remove("vis");
        void e.offsetWidth;
        e.classList.add("vis");
        window.clearTimeout(this._beskedUr);
        this._beskedUr = window.setTimeout(function () { e.classList.remove("vis"); }, 2600);
    };

    /* ----- Musen ---------------------------------------------------------- */
    P._punkt = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    /* Afstanden fra centrum til det sted, man tager fat i en gruppe. */
    P._grebRadius = function (g) {
        if (this.visning === "balloner") return M.BALLON * 0.62;
        return g.type === "fri" ? 0.6 : D.LIGAND[g.orden].laengde;
    };

    /* Den forreste gruppe under musen, eller null. */
    P.gruppeVed = function (x, y) {
        var mig = this, bedst = null, bedstZ = -Infinity;
        if (!this.model) return null;
        this.grupper.forEach(function (g) {
            var z = null;
            if (mig.visning === "balloner") {
                var s = g._bl && g._bl._skaerm;
                if (s && Math.hypot(x - s.x, y - s.y) <= s.r) z = mig.vis.projicer(g.u).z;
            } else if (g.type === "fri") {
                var sf = g._fp && g._fp._skaerm;
                if (mig.visFrie && sf && Math.hypot(x - sf.x, y - sf.y) <= sf.r) z = mig.vis.projicer(V.gange(g.u, 0.6)).z;
            } else if (mig.proj && mig.proj[g._atom]) {
                var p = mig.proj[g._atom];
                if (Math.hypot(x - p.x, y - p.y) <= Math.max(p.R, 12)) z = p.z;
            }
            if (z !== null && z > bedstZ) { bedst = g; bedstZ = z; }
        });
        return bedst;
    };

    P._bindMus = function () {
        var mig = this;
        var cvs = this.laerred.canvas;

        cvs.addEventListener("pointerdown", function (e) {
            var p = mig._punkt(e);
            var g = mig.gruppeVed(p.x, p.y);
            mig.traek = { id: e.pointerId, x0: p.x, y0: p.y, x: p.x, y: p.y, gruppe: g, flyttet: false,
                bag: g ? mig.vis.projicer(g.u).z < 0 : false };
            if (g) g.holdt = true;
            try { cvs.setPointerCapture(e.pointerId); } catch (fejl) { /* ignoreres */ }
            cvs.style.cursor = "grabbing";
        });

        cvs.addEventListener("pointermove", function (e) {
            var p = mig._punkt(e);
            var t = mig.traek;
            if (!t) {
                mig.hover = mig.gruppeVed(p.x, p.y);
                cvs.style.cursor = mig.hover && mig.vinkelmaaler ? "pointer" : "grab";
                return;
            }
            if (Math.hypot(p.x - t.x0, p.y - t.y0) > 4) t.flyttet = true;
            if (t.gruppe && t.flyttet) {
                var maal = mig.vis.retningFraSkaerm(p.x, p.y, mig._grebRadius(t.gruppe), t.bag);
                t.gruppe.u = V.enhed(V.plus(t.gruppe.u, V.gange(V.minus(maal, t.gruppe.u), 0.6)));
            } else if (!t.gruppe) {
                mig.vis.drej(p.x - t.x, p.y - t.y);
            }
            t.x = p.x;
            t.y = p.y;
        });

        function slip() {
            var t = mig.traek;
            if (!t) return;
            if (t.gruppe) t.gruppe.holdt = false;
            if (!t.flyttet && mig.vinkelmaaler) mig.vaelgTilMaaling(t.gruppe);
            mig.traek = null;
            cvs.style.cursor = "grab";
        }
        cvs.addEventListener("pointerup", slip);
        cvs.addEventListener("pointercancel", slip);
        cvs.addEventListener("pointerleave", function () { if (!mig.traek) mig.hover = null; });
    };

    /* ----- Modellen, som model3d.js tegner ------------------------------- */
    P._bygModel = function () {
        var mig = this;
        if (this.visning === "balloner") {
            this.model = {
                atomer: [],
                balloner: this.grupper.map(function (g) {
                    g._bl = { u: g.u, type: g.type === "fri" ? "fri" : "bindende" };
                    return g._bl;
                })
            };
            return this.model;
        }
        var el = this.centralatom();
        var model = {
            atomer: [el ? { el: el, p: [0, 0, 0] } : { el: "?", p: [0, 0, 0], sprite: "atom_ukendt", symbol: false }],
            bindinger: [],
            frie: []
        };
        this.grupper.forEach(function (g) {
            if (g.type === "fri") {
                g._fp = { atom: 0, u: g.u };
                model.frie.push(g._fp);
                return;
            }
            var lig = D.LIGAND[g.orden];
            g._atom = model.atomer.length;
            model.atomer.push({ el: lig.el, p: V.gange(g.u, lig.laengde) });
            model.bindinger.push({ a: 0, b: g._atom, orden: g.orden });
        });
        this.model = model;
        return model;
    };

    P.maalepunkt = function (g) {
        if (this.visning === "balloner") return V.gange(g.u, 1.6);
        return V.gange(g.u, D.LIGAND[g.orden].laengde);
    };

    /* ----- Faelles graenseflade: tilpas / opdater / tegn / nulstil ------- */
    P.tilpas = function () {
        var nyt = this.laerred.tilpas();
        this.vis.tilpas(this.laerred.b, this.laerred.h, RADIUS, nyt && !this._tilpasset);
        if (this.laerred.b > 10) this._tilpasset = true;
    };

    P.opdater = function (dt) {
        NK.Frastoed.skridt(this.grupper, dt);
        this.vis.opdater(dt);
        this.opgaver.opdater();
        var m = this.maaling();
        NK.saetTekst("byg-vinkel", m ? NK.grader(V.vinkel(m[0].u, m[1].u)) : "-");
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

        var mig = this;
        var model = this._bygModel();
        var markeret = {};
        this.valgt.forEach(function (g) { if (g._atom !== undefined && g.type === "binding") markeret[g._atom] = "#f2c53d"; });
        var hover = this.hover && this.hover.type === "binding" && this.visning === "molekyle" ? this.hover._atom : -1;

        this.proj = M.tegn(ctx, this.vis, model, { visFrie: this.visFrie, markeret: markeret, hover: hover });

        if (this.visning === "balloner") {
            this.valgt.forEach(function (g) {
                var s = g._bl && g._bl._skaerm;
                if (!s) return;
                ctx.save();
                ctx.strokeStyle = "#f2c53d";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            });
        }

        var m = this.maaling();
        if (m) M.tegnVinkel(ctx, this.vis, mig.maalepunkt(m[0]), [0, 0, 0], mig.maalepunkt(m[1]));
    };

    P.nulstil = function () {
        this.opgaver.nulstil();
        this.skiftVinkelmaaler(false);
        this.saetVisning("molekyle");
        this.ryd();
    };
}());
