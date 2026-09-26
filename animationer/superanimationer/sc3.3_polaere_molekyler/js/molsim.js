/* =====================================================================
   molsim.js - et molekyle i 3D, som fane 2 bygger paa

   NK.MolSim er laerredet, kameraet, molekylemenuen, prikformlen,
   langsom drejning og klik paa atomer. Det er samme kode som i sc3.2
   (sim_molekyler.js), bare uden vinkelmaaleren. NK.SimPolaritet i
   sim_polaritet.js bygger videre med traekkene, δ+ og δ− og opgaverne.

   Under en opgave viser fanen opgavens molekyle, menuen er laast, og
   det, opgaven spoerger om, staar som "?" i panelet. Nogle opgaver
   slaar ogsaa en visning fra (this.tvang), til de er afsluttet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model3D;

    NK.MolSim = function () {};
    var B = NK.MolSim.prototype;

    B.init = function (prefix, opgaver, tjekIds) {
        this.p = prefix;
        this.laerred = new NK.Laerred(NK.el(prefix + "-laerred"));
        this.prik = new NK.Laerred(NK.el(prefix + "-prik"));
        this.vis = new NK.Visning();
        this.tjekIds = tjekIds;
        this.tvang = {};
        this.skjul = {};
        this.opgaveMol = null;
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

    /* ----- Musen: traek drejer, klik vaelger et atom ---------------------- */
    B._punkt = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    B._klikbar = function () {
        var o = this.opgaver.opgave;
        return !!(o && !o.afsluttet && o.klik);
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
            mig.opgaver.klik(M.atomVed(mig.proj, t.x0, t.y0));
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
        if (this.laerred.b > 10) this._tilpasset = true;
    };

    B.opdaterFaelles = function (dt) {
        this.tid += dt;
        var id = this.molId();
        if (id !== this.sidsteId) {
            this.sidsteId = id;
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

    B.nulstilFaelles = function () {
        this.opgaver.nulstil();
        this.slutOpgaveMol();
    };
}());
