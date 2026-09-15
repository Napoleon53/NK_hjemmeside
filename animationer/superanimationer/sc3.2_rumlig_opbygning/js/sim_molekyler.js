/* =====================================================================
   sim_molekyler.js - fane 2: rigtige molekyler i 3D

   NK.MolSim er det, fane 2 og 3 har til faelles: laerredet, kameraet,
   molekylemenuen, prikformlen, langsom drejning, klik paa atomer og
   vinkelmaaleren. NK.SimMolekyler bygger videre med visningen
   (kugle-stang eller kalotte, frie elektronpar) og opgaverne om form,
   vinkel og frie elektronpar.

   Under en opgave viser fanen opgavens molekyle, menuen er laast, og
   det, opgaven spoerger om, staar som "?" i panelet. Nogle opgaver
   slaar ogsaa en visning fra (this.tvang), til de er afsluttet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model3D;

    /* ----- Det faelles ----------------------------------------------------- */
    NK.MolSim = function () {};
    var B = NK.MolSim.prototype;

    B.init = function (prefix, opgaver, tjekIds) {
        var mig = this;
        this.p = prefix;
        this.laerred = new NK.Laerred(NK.el(prefix + "-laerred"));
        this.prik = new NK.Laerred(NK.el(prefix + "-prik"));
        this.vis = new NK.Visning();
        this.tjekIds = tjekIds;
        this.tvang = {};
        this.skjul = {};
        this.opgaveMol = null;
        this.vinkelmaaler = false;
        this.valgt = [];
        this.proj = null;
        this.hover = -1;
        this.traek = null;
        this.tid = 0;
        this.sidstDrejet = -10;
        this.sidsteId = null;
        this.prikNoegle = "";
        this.opgaver = new NK.Opgaver(prefix, opgaver, this);
        this.OPGAVER = opgaver;

        NK.Valg.byg(NK.el(prefix + "-menu"), this);
        var vk = NK.el(prefix + "-vinkelknap");
        if (vk) vk.addEventListener("click", function () { mig.skiftVinkelmaaler(); });
        this._bindMus();
    };

    B.molId = function () { return this.opgaveMol || NK.Valg.molId; };
    B.mol = function () { return D.molekyle(this.molId()); };
    B.menuLaast = function () { return this.opgaver.igang(); };

    /* En visning, som en opgave kan have slaaet fra eller til. */
    B.flag = function (id) {
        return Object.prototype.hasOwnProperty.call(this.tvang, id) ? this.tvang[id] : NK.el(id).checked;
    };

    B.saetTvang = function (tvang) {
        var mig = this;
        this.tvang = tvang || {};
        this.tjekIds.forEach(function (id) {
            NK.el(id).disabled = Object.prototype.hasOwnProperty.call(mig.tvang, id);
        });
    };

    /* Kaldes af opgavernes start() og slut(). */
    B.startOpgaveMol = function (id, skjul, tvang) {
        NK.Valg.saet(id);
        this.opgaveMol = id;
        this.skjul = skjul || {};
        this.saetTvang(tvang);
        this.valgt = [];
        NK.Valg.opdaterKnapper();
    };

    B.slutOpgaveMol = function () {
        if (this.opgaveMol) NK.Valg.saet(this.opgaveMol);
        this.opgaveMol = null;
        this.skjul = {};
        this.saetTvang({});
        NK.Valg.opdaterKnapper();
    };

    /* Et tilfaeldigt molekyle fra puljen, helst ikke det, der vises nu. */
    B.nytMolekyle = function (pulje) {
        var nu = this.molId();
        var andre = pulje.filter(function (id) { return id !== nu; });
        return D.molekyle(NK.tilfaeldig(andre.length ? andre : pulje));
    };

    B.besked = function (tekst) {
        var e = NK.el(this.p + "-besked");
        e.textContent = tekst;
        e.classList.remove("vis");
        void e.offsetWidth;
        e.classList.add("vis");
        window.clearTimeout(this._beskedUr);
        this._beskedUr = window.setTimeout(function () { e.classList.remove("vis"); }, 2600);
    };

    /* ----- Vinkelmaaleren ---------------------------------------------------- */
    B.skiftVinkelmaaler = function (til) {
        var knap = NK.el(this.p + "-vinkelknap");
        if (!knap) return;
        this.vinkelmaaler = til === undefined ? !this.vinkelmaaler : !!til;
        this.valgt = [];
        knap.classList.toggle("aktiv", this.vinkelmaaler);
        knap.setAttribute("aria-pressed", this.vinkelmaaler ? "true" : "false");
        if (this.vinkelmaaler) this.besked("Klik på to atomer, der sidder på samme atom.");
    };

    B.faellesNabo = function (a, b) {
        var mol = this.mol();
        var na = mol.naboer[a].map(function (n) { return n.atom; });
        for (var i = 0; i < mol.naboer[b].length; i++) {
            if (na.indexOf(mol.naboer[b][i].atom) >= 0) return mol.naboer[b][i].atom;
        }
        return -1;
    };

    B.maaling = function () {
        if (this.valgt.length !== 2) return null;
        var c = this.faellesNabo(this.valgt[0], this.valgt[1]);
        return c < 0 ? null : [this.valgt[0], c, this.valgt[1]];
    };

    B.klikAtom = function (idx) {
        if (!this.vinkelmaaler) return;
        if (idx < 0) { this.valgt = []; return; }
        var i = this.valgt.indexOf(idx);
        if (i >= 0) { this.valgt.splice(i, 1); return; }
        this.valgt.push(idx);
        if (this.valgt.length > 2) this.valgt.shift();
        if (this.valgt.length === 2 && this.faellesNabo(this.valgt[0], this.valgt[1]) < 0) {
            this.besked("Vælg to atomer, der sidder på samme atom.");
            this.valgt = [idx];
        } else if (this.valgt.length === 1) {
            this.besked("Klik på ét atom mere.");
        }
    };

    /* ----- Musen: traek drejer, klik vaelger et atom ---------------------- */
    B._punkt = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    B._klikbar = function () {
        var o = this.opgaver.opgave;
        return this.vinkelmaaler || !!(o && !o.afsluttet && o.klik);
    };

    B._bindMus = function () {
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
                mig.hover = mig._klikbar() ? M.atomVed(mig.proj, p.x, p.y) : -1;
                cvs.style.cursor = mig.hover >= 0 ? "pointer" : "grab";
                return;
            }
            if (Math.hypot(p.x - t.x0, p.y - t.y0) > 4) t.flyttet = true;
            if (t.flyttet) {
                cvs.style.cursor = "grabbing";
                mig.vis.drej(p.x - t.x, p.y - t.y);
                mig.sidstDrejet = mig.tid;
            }
            t.x = p.x;
            t.y = p.y;
        });

        function slip(e) {
            var t = mig.traek;
            if (!t) return;
            mig.traek = null;
            cvs.style.cursor = "grab";
            if (t.flyttet || e.type === "pointercancel") return;
            var idx = M.atomVed(mig.proj, t.x0, t.y0);
            if (!mig.opgaver.klik(idx)) mig.klikAtom(idx);
        }
        cvs.addEventListener("pointerup", slip);
        cvs.addEventListener("pointercancel", slip);
    };

    /* ----- Faelles tilpas / opdater / tegn ---------------------------------- */
    B.radius = function () { return this.mol().radius; };

    B.tilpas = function () {
        var nyt = this.laerred.tilpas();
        if (this.prik.tilpas()) this.prikNoegle = "";
        this.vis.tilpas(this.laerred.b, this.laerred.h, this.radius(), nyt && !this._tilpasset);
        this._tilpasset = true;
    };

    B.opdaterFaelles = function (dt) {
        this.tid += dt;
        var id = this.molId();
        if (id !== this.sidsteId) {
            this.sidsteId = id;
            this.valgt = [];
            this.prikNoegle = "";
            NK.Valg.opdaterKnapper();
        }
        if (this.flag(this.p + "-drej") && !this.traek && this.tid - this.sidstDrejet > 2.5) this.vis.drejLangsomt(dt);
        this.vis.tilpas(this.laerred.b, this.laerred.h, this.radius(), false);
        this.vis.opdater(dt);
        this.opgaver.opdater();
    };

    B.tegnBaggrund = function () {
        var ctx = this.laerred.ctx;
        var b = this.laerred.b, h = this.laerred.h;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, b, h);
        var glod = ctx.createRadialGradient(b / 2, h / 2, 0, b / 2, h / 2, Math.min(b, h) * 0.6);
        glod.addColorStop(0, "rgba(61, 158, 224, 0.07)");
        glod.addColorStop(1, "rgba(61, 158, 224, 0)");
        ctx.fillStyle = glod;
        ctx.fillRect(0, 0, b, h);
        return ctx;
    };

    B.tegnPrik = function () {
        var vis = this.flag(this.p + "-prikvis");
        NK.el(this.p + "-prikpanel").hidden = !vis;
        if (!vis) return;
        var mol = this.mol();
        var noegle = mol.id + "|" + this.prik.b + "x" + this.prik.h;
        if (noegle === this.prikNoegle) return;
        this.prikNoegle = noegle;
        NK.Prikformel.tegn(this.prik.ctx, this.prik.b, this.prik.h, mol);
    };

    B.tegnMaaling = function (ctx) {
        var m = this.maaling();
        if (!m) return;
        var a = this.mol().atomer;
        M.tegnVinkel(ctx, this.vis, a[m[0]].p, a[m[1]].p, a[m[2]].p);
    };

    B.markeringer = function () {
        var markeret = {};
        this.valgt.forEach(function (i) { markeret[i] = "#f2c53d"; });
        return markeret;
    };

    B.nulstilFaelles = function () {
        this.opgaver.nulstil();
        this.slutOpgaveMol();
        this.skiftVinkelmaaler(false);
    };

    /* ----- Fane 2: opgaverne ---------------------------------------------------- */
    var ALLE = D.MOLEKYLER.map(function (m) { return m.id; });
    var VINKLER = ["90°", "104,5°", "107°", "109,5°", "120°", "180°"];
    var GRUND = {
        tetraeder: "Fire retninger giver 109,5° mellem bindingerne.",
        pyramide: "Det frie elektronpar trykker de tre bindinger sammen til 107°.",
        vinklet: "De to frie elektronpar trykker bindingerne sammen til 104,5°.",
        plan: "Tre retninger i samme plan giver 120°.",
        lineaer: "To retninger giver 180°."
    };
    var TAL = ["ingen", "ét", "to", "tre"];

    var OPGAVER = [
        function (sim) {
            var mol = sim.nytMolekyle(ALLE);
            return {
                mol: mol.id,
                tekst: "Hvilken form har " + mol.formel + "?",
                valg: D.FORM_ORDEN.map(function (f) { return D.FORMER[f].knap; }),
                rigtig: D.FORM_ORDEN.indexOf(mol.form),
                hint: mol.hintForm,
                svar: mol.svarForm,
                start: function (s) { s.startOpgaveMol(mol.id, { form: true, vinkel: true }); },
                slut: function (s) { s.slutOpgaveMol(); }
            };
        },
        function (sim) {
            var mol = sim.nytMolekyle(ALLE.filter(function (id) { return D.molekyle(id).vinkel; }));
            var vinkel = NK.grader(mol.vinkelGrader);
            return {
                mol: mol.id,
                tekst: "Hvor stor er bindingsvinklen i " + mol.formel + "?",
                valg: VINKLER,
                rigtig: VINKLER.indexOf(vinkel),
                hint: "Slå vinkelmåleren til, og klik på to atomer, der sidder på samme atom.",
                svar: "Vinklen er " + vinkel + ". " + GRUND[mol.form],
                start: function (s) { s.startOpgaveMol(mol.id, { vinkel: true }); },
                slut: function (s) { s.slutOpgaveMol(); }
            };
        },
        function (sim) {
            var mol = sim.nytMolekyle(["H2O", "NH3", "CH4", "CO2", "HCN", "CH2O"]);
            var c = mol.centrum;
            var el = mol.atomer[c].el;
            var v = D.GRUNDSTOFFER[el].v;
            var brugt = mol.naboer[c].reduce(function (s, n) { return s + n.orden; }, 0);
            var k = mol.frieAntal[c];
            var navn = NK.formel(el);
            return {
                mol: mol.id,
                tekst: "Hvor mange frie elektronpar har centralatomet " + navn + " i " + mol.formel + "?",
                valg: ["0", "1", "2", "3"],
                rigtig: k,
                hint: navn + " har " + v + " valenselektroner. Hvor mange af dem bruges i bindingerne?",
                svar: navn + " har " + v + " valenselektroner, og " + brugt + " bruges i bindingerne. " +
                    (k === 0 ? "Der er ingen tilbage, så der er ingen frie elektronpar."
                        : "De sidste " + (v - brugt) + " danner " + TAL[k] + (k === 1 ? " frit elektronpar." : " frie elektronpar.")),
                start: function (s) { s.startOpgaveMol(mol.id, { frie: true }, { "mol-frie": false, "mol-prikvis": false }); },
                slut: function (s) { s.slutOpgaveMol(); }
            };
        }
    ];

    /* ----- Fane 2 ----------------------------------------------------------- */
    NK.SimMolekyler = function () {
        var mig = this;
        this.kalotte = false;
        this.init("mol", OPGAVER, ["mol-frie", "mol-prikvis", "mol-drej"]);
        Array.prototype.forEach.call(document.querySelectorAll("#mol-model .tilstandsknap"), function (k) {
            k.addEventListener("click", function () { mig.saetModel(k.getAttribute("data-model")); });
        });
    };

    NK.SimMolekyler.prototype = Object.create(B);
    var P = NK.SimMolekyler.prototype;

    P.saetModel = function (navn) {
        this.kalotte = navn === "kalotte";
        Array.prototype.forEach.call(document.querySelectorAll("#mol-model .tilstandsknap"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-model") === navn);
        });
    };

    P.radius = function () {
        return this.mol().radius + (this.kalotte ? 0.8 : 0);
    };

    P.opdater = function (dt) {
        this.opdaterFaelles(dt);
        var mol = this.mol();
        var s = this.skjul;
        NK.saetTekst("mol-formel", mol.formel);
        NK.saetTekst("mol-navn", mol.navn);
        NK.saetTekst("mol-form", s.form ? "?" : D.FORMER[mol.form].navn);
        NK.saetTekst("mol-vinkel", s.vinkel ? "?" : (mol.vinkel ? NK.grader(mol.vinkelGrader) : "ingen"));
        NK.saetTekst("mol-frie-tal", s.frie ? "?" : (mol.centrum === null ? "-" : String(mol.frieAntal[mol.centrum])));
    };

    P.tegn = function () {
        var ctx = this.tegnBaggrund();
        var mol = this.mol();
        this.proj = M.tegn(ctx, this.vis, mol.model, {
            kalotte: this.kalotte,
            visFrie: this.flag("mol-frie"),
            markeret: this.markeringer(),
            hover: this.hover
        });
        this.tegnMaaling(ctx);
        this.tegnPrik();
    };

    P.nulstil = function () {
        this.nulstilFaelles();
        this.saetModel("kuglestang");
    };
}());
