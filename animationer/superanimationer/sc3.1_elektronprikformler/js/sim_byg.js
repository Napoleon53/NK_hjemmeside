/* =====================================================================
   sim_byg.js - fanen Byg: vaelg valenselektroner, traek atomer
   sammen, byg bindinger, tjek mod oktetreglen.

   Eleven taeller selv. Der staar intet elektrontal ved atomerne, og
   symbolerne skifter ikke farve undervejs. Foerst "Tjek svar" viser,
   hvilke atomer der ikke passer (roed ring og "for faa"/"for mange").
   Hjaelpen kommer i trin paa én knap: Giv hint, Tael for mig (nu staar
   elektrontallet ved hvert atom) og Vis svaret (facit i hintboksen).

   Objektet foelger samme moenster som resten af superanimationerne:
   tilpas(), opdater(dt), tegn() og nulstil(). Kun den aktive fane
   tegnes; musen virker kun, naar aktiv er sat - se js/app.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var GEM_FREMSKRIDT = "sc3_1_fremskridt";
    var GEM_LOEST = "sc3_1_loeste";
    var SNAP_AFSTAND = 105;
    var BRYD_AFSTAND = 200;

    /* Knappens tekst foer hvert trin i hjaelpen */
    var HJAELP_KNAP = ["Giv hint", "Tæl for mig", "Vis svaret"];

    function loadFremskridt() {
        var v = parseInt(NK.hent(GEM_FREMSKRIDT, 0), 10);
        return (isNaN(v) || v < 0 || v >= NK.OPGAVER.length) ? 0 : v;
    }

    function loadLoeste() {
        var arr = NK.hent(GEM_LOEST, null);
        if (Array.isArray(arr)) return NK.OPGAVER.map(function (_, i) { return !!arr[i]; });
        return NK.OPGAVER.map(function () { return false; });
    }

    NK.SimByg = function (laerred) {
        this.laerred = laerred;
        this.linjeLaerred = new NK.Laerred(NK.el("stregformel-laerred"));
        this.loeste = loadLoeste();
        this.aktiv = true;

        this.state = {
            niveau: 0,
            fase: "opsaetning",
            delfase: 0,
            unikkeAtomer: [],
            atomer: [],
            bindinger: [],
            partikler: [],
            hjaelp: 0,          /* 0: ingen, 1: hint, 2: elektrontal, 3: svaret */
            markering: {},      /* { atom-id: "faa" | "mange" } efter Tjek svar */
            fejlTjek: 0
        };

        this.traekAtom = null;
        this.snapMaal = null;
        this.hoverAtom = null;

        this._byggOpgaveMenu();
        this._bindInteraktion();
        this.initNiveau(loadFremskridt());
    };

    /* ----- Opgavemenuen: én knap pr. molekylformel --------------------- */
    NK.SimByg.prototype._byggOpgaveMenu = function () {
        var self = this;
        var menu = NK.el("opgave-menu");
        menu.innerHTML = "";
        NK.OPGAVER.forEach(function (opg, i) {
            var knap = document.createElement("button");
            knap.className = "opgave-knap";
            knap.type = "button";
            knap.title = opg.navn;
            knap.textContent = opg.f;
            knap.addEventListener("click", function () { self.initNiveau(i); });
            menu.appendChild(knap);
        });
    };

    NK.SimByg.prototype._opdaterOpgaveMenu = function () {
        var knapper = NK.el("opgave-menu").children;
        for (var i = 0; i < knapper.length; i++) {
            knapper[i].classList.toggle("loest", this.loeste[i]);
            knapper[i].classList.toggle("aktiv", i === this.state.niveau);
        }
    };

    NK.SimByg.prototype.opdaterTaeller = function () {
        NK.el("taeller-tekst").textContent = "Opgave " + (this.state.niveau + 1) + "/" + NK.OPGAVER.length;
    };

    /* ----- Niveaustyring ------------------------------------------------ */
    NK.SimByg.prototype.initNiveau = function (idx) {
        if (idx >= NK.OPGAVER.length) idx = 0;
        var s = this.state;
        s.niveau = idx;
        s.fase = "opsaetning";
        s.delfase = 0;
        s.unikkeAtomer = Array.from(new Set(NK.OPGAVER[idx].atomer)).sort(function (a, b) { return a - b; });
        s.atomer = [];
        s.bindinger = [];
        s.partikler = [];
        s.hjaelp = 0;
        s.markering = {};
        s.fejlTjek = 0;
        NK.gem(GEM_FREMSKRIDT, idx);

        if (this.aktiv) this.opdaterTaeller();
        NK.el("sejr-overlay").classList.add("skjult");
        NK.el("tjek-knap").classList.add("skjult");
        NK.el("nulstil-knap").classList.add("skjult");
        NK.el("byg-knap").classList.add("skjult");
        NK.el("opsaetning-overlay").classList.remove("skjult");
        NK.el("stregformel-panel").classList.add("skjult");
        NK.skjulHint("byg");

        this._opdaterOpgaveMenu();
        this._opsaetningsFase();
    };

    NK.SimByg.prototype._opsaetningsFase = function () {
        var s = this.state;
        var opg = NK.OPGAVER[s.niveau];

        if (s.delfase >= s.unikkeAtomer.length) {
            NK.el("opsaetning-overlay").classList.add("skjult");
            NK.el("tjek-knap").classList.remove("skjult");
            NK.el("nulstil-knap").classList.remove("skjult");
            NK.el("stregformel-panel").classList.remove("skjult");
            this._opdaterHjaelpKnap();
            this._spawnAtomer();
            return;
        }

        var z = s.unikkeAtomer[s.delfase];
        var el = NK.ELEMENTER[z];
        var atomLabel = '<span class="fremhaev">' + el.n + " (" + el.s + ")</span>";
        NK.el("opsaetning-molekyle").innerHTML =
            opg.f + ' <span class="opsaetning-navn">(' + opg.navn + ")</span>";
        NK.el("opsaetning-overskrift").innerHTML = s.delfase === 0
            ? "Før vi kan lave elektronprikformlen for " + opg.f + " (" + opg.navn + "), skal vi først betragte " + atomLabel
            : "Lad os nu se nærmere på " + atomLabel;
        NK.el("valens-besked").textContent = "";

        var pt = NK.el("periodisk-system");
        pt.innerHTML = "";
        NK.PT_KORT.forEach(function (pid) {
            var felt = document.createElement("div");
            felt.className = "pt-felt";
            if (pid > 0 && NK.ELEMENTER[pid]) {
                felt.innerHTML = '<span class="pt-nr">' + pid + '</span><span class="pt-symbol">' + NK.ELEMENTER[pid].s + "</span>";
                felt.classList.add("aktiv");
                if (pid === z) felt.classList.add("fremhaevet");
            } else {
                felt.style.visibility = "hidden";
            }
            pt.appendChild(felt);
        });

        var self = this;
        var knapper = NK.el("valens-knapper");
        knapper.innerHTML = "";
        for (var i = 1; i <= 8; i++) {
            (function (tal) {
                var knap = document.createElement("button");
                knap.className = "valens-knap";
                knap.type = "button";
                knap.textContent = tal;
                knap.addEventListener("click", function () { self.svarValens(tal, knap); });
                knapper.appendChild(knap);
            }(i));
        }
    };

    /* Et forkert tal blinker og giver et hint, der passer til fejlen. */
    NK.SimByg.prototype.svarValens = function (tal, knap) {
        var s = this.state;
        if (s.fase !== "opsaetning") return;
        var z = s.unikkeAtomer[s.delfase];
        if (tal === NK.ELEMENTER[z].v) {
            s.delfase++;
            this._opsaetningsFase();
            return;
        }
        NK.el("valens-besked").textContent = NK.valensHint(z, tal);
        if (knap) {
            knap.classList.add("forkert");
            setTimeout(function () { knap.classList.remove("forkert"); }, 400);
        }
    };

    NK.SimByg.prototype.nulstilNiveau = function () {
        if (this.state.fase !== "aktion") return;
        this.state.atomer = [];
        this.state.bindinger = [];
        this.state.partikler = [];
        this.state.markering = {};
        this._spawnAtomer();
    };

    NK.SimByg.prototype._spawnAtomer = function () {
        this.laerred.tilpas();
        var s = this.state;
        s.fase = "aktion";
        var liste = NK.OPGAVER[s.niveau].atomer;
        var cx = this.laerred.b / 2, cy = this.laerred.h / 2;
        var r = Math.min(this.laerred.b, this.laerred.h) * 0.25;

        liste.forEach(function (z, i) {
            var vinkel = (i / liste.length) * Math.PI * 2 - 1.57;
            s.atomer.push({
                id: i, z: z,
                x: cx + Math.cos(vinkel) * r,
                y: cy + Math.sin(vinkel) * r,
                r: 30
            });
        });
    };

    /* Haenger alle atomerne sammen gennem bindingerne? */
    NK.SimByg.prototype._sammenhaengende = function () {
        var s = this.state;
        if (!s.atomer.length) return true;
        var set = {}, koe = [s.atomer[0]];
        set[s.atomer[0].id] = true;
        while (koe.length) {
            var a = koe.shift();
            s.bindinger.forEach(function (b) {
                var n = b.s === a ? b.t : b.t === a ? b.s : null;
                if (n && !set[n.id]) { set[n.id] = true; koe.push(n); }
            });
        }
        return s.atomer.every(function (a) { return set[a.id]; });
    };

    NK.SimByg.prototype.tjekSvar = function () {
        var s = this.state;
        if (s.fase !== "aktion") return;
        s.markering = {};

        if (!this._sammenhaengende()) {
            this._fejlTjek("Atomerne hænger ikke sammen.");
            return;
        }

        var forkerte = [];
        s.atomer.forEach(function (a) {
            var st = NK.atomStatus(s, a);
            if (st.stabil) return;
            forkerte.push({ a: a, st: st });
            s.markering[a.id] = st.nu < st.maal ? "faa" : "mange";
        });

        if (!forkerte.length) {
            s.fase = "sejr";
            NK.el("sejr-sprite").src = "sprites/" + NK.OPGAVER[s.niveau].sprite;
            NK.el("sejr-overlay").classList.remove("skjult");
            NK.el("tjek-knap").classList.add("skjult");
            NK.el("nulstil-knap").classList.add("skjult");
            NK.el("byg-knap").classList.add("skjult");
            NK.skjulHint("byg");
            this.loeste[s.niveau] = true;
            NK.gem(GEM_LOEST, this.loeste);
            this._opdaterOpgaveMenu();
            this._spawnKonfetti();
            return;
        }

        if (forkerte.length === 1) {
            var f = forkerte[0];
            this._fejlTjek("Prøv igen: " + NK.ELEMENTER[f.a.z].n.toLowerCase() + " har for " +
                (f.st.nu < f.st.maal ? "få" : "mange") + " elektroner.");
        } else {
            this._fejlTjek("Prøv igen: de røde atomer passer ikke med oktetreglen.");
        }
    };

    /* Efter tre forkerte tjek i træk minder hjaelpeknappen om sig selv. */
    NK.SimByg.prototype._fejlTjek = function (tekst) {
        var s = this.state;
        NK.visToast(tekst);
        s.fejlTjek++;
        if (s.fejlTjek >= 3 && s.hjaelp < HJAELP_KNAP.length) {
            var k = NK.el("byg-knap");
            k.classList.remove("puf");
            void k.offsetWidth;
            k.classList.add("puf");
        }
    };

    NK.SimByg.prototype._spawnKonfetti = function () {
        var cx = this.laerred.b / 2, cy = this.laerred.h / 2;
        for (var i = 0; i < 80; i++) {
            this.state.partikler.push({
                x: cx, y: cy,
                vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15,
                liv: 1 + Math.random(),
                farve: "hsl(" + Math.floor(Math.random() * 360) + ", 70%, 60%)",
                stoerrelse: 3 + Math.random() * 3
            });
        }
    };

    NK.SimByg.prototype.naesteNiveau = function () {
        this.initNiveau(this.state.niveau + 1);
    };

    /* ----- Hjaelpen: én knap, ét trin ad gangen ------------------------- */
    NK.SimByg.prototype.hjaelp = function () {
        var s = this.state;
        if (s.fase !== "aktion" || s.hjaelp >= HJAELP_KNAP.length) return;
        s.hjaelp++;
        var opg = NK.OPGAVER[s.niveau];
        if (s.hjaelp === 1) NK.visHint("byg", "Hint", opg.hint);
        else if (s.hjaelp === 2) NK.visHint("byg", "Hint", opg.hint + " Nu står elektrontallet ved hvert atom.");
        else NK.visHint("byg", "Svaret", "Byg den, og tryk Tjek svar.", "sprites/" + opg.sprite);
        this._opdaterHjaelpKnap();
    };

    NK.SimByg.prototype._opdaterHjaelpKnap = function () {
        var k = NK.el("byg-knap");
        var s = this.state;
        k.classList.remove("puf");
        k.classList.toggle("skjult", s.fase !== "aktion" || s.hjaelp >= HJAELP_KNAP.length);
        if (s.hjaelp < HJAELP_KNAP.length) k.textContent = HJAELP_KNAP[s.hjaelp];
    };

    /* ----- Traek og slip ------------------------------------------------- */
    NK.SimByg.prototype._musPunkt = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    NK.SimByg.prototype._bindingVed = function (p) {
        var b = this.state.bindinger;
        for (var i = 0; i < b.length; i++) {
            if (Math.hypot(p.x - (b[i].s.x + b[i].t.x) / 2, p.y - (b[i].s.y + b[i].t.y) / 2) < 16) return i;
        }
        return -1;
    };

    NK.SimByg.prototype._atomVed = function (p) {
        var a = this.state.atomer;
        for (var i = 0; i < a.length; i++) {
            if (Math.hypot(p.x - a[i].x, p.y - a[i].y) < a[i].r) return a[i];
        }
        return null;
    };

    /* Laeg atomet i bindingslaengde fra det andet, i den retning det har nu. */
    NK.SimByg.prototype._placerVed = function (atom, andet) {
        var dx = atom.x - andet.x, dy = atom.y - andet.y;
        var len = Math.hypot(dx, dy);
        if (len < 1) { dx = 1; dy = 0; len = 1; }
        atom.x = NK.klamp(andet.x + (dx / len) * NK.BINDINGSLAENGDE, 40, this.laerred.b - 40);
        atom.y = NK.klamp(andet.y + (dy / len) * NK.BINDINGSLAENGDE, 40, this.laerred.h - 40);
    };

    NK.SimByg.prototype._bindInteraktion = function () {
        var self = this;
        var cvs = this.laerred.canvas;

        cvs.addEventListener("mousedown", function (e) {
            var s = self.state;
            if (!self.aktiv || s.fase !== "aktion") return;
            var p = self._musPunkt(e);
            var i = self._bindingVed(p);
            if (i >= 0) {
                if (s.bindinger[i].orden >= 3) s.bindinger.splice(i, 1);
                else s.bindinger[i].orden++;
                s.markering = {};
                return;
            }
            self.traekAtom = self._atomVed(p);
            if (self.traekAtom) cvs.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", function (e) {
            if (!self.aktiv) return;
            var p = self._musPunkt(e);
            var t = self.traekAtom;
            if (!t) {
                var aktiv = self.state.fase === "aktion";
                self.hoverAtom = aktiv ? self._atomVed(p) : null;
                cvs.style.cursor = !aktiv ? "default" : self._bindingVed(p) >= 0 ? "pointer" : self.hoverAtom ? "grab" : "default";
                return;
            }
            t.x = NK.klamp(p.x, 40, self.laerred.b - 40);
            t.y = NK.klamp(p.y, 40, self.laerred.h - 40);

            self.snapMaal = null;
            var bedsteAfstand = SNAP_AFSTAND;
            self.state.atomer.forEach(function (a) {
                if (a === t) return;
                var d = Math.hypot(t.x - a.x, t.y - a.y);
                if (d < bedsteAfstand) { bedsteAfstand = d; self.snapMaal = a; }
            });
        });

        window.addEventListener("mouseup", function () {
            var t = self.traekAtom;
            if (t) {
                var s = self.state;
                var foer = s.bindinger.length;
                s.bindinger = s.bindinger.filter(function (b) {
                    if (b.s !== t && b.t !== t) return true;
                    var modpart = (b.s === t) ? b.t : b.s;
                    return Math.hypot(t.x - modpart.x, t.y - modpart.y) <= BRYD_AFSTAND;
                });

                var andet = self.snapMaal;
                var findes = andet && s.bindinger.some(function (b) {
                    return (b.s === t && b.t === andet) || (b.s === andet && b.t === t);
                });
                if (andet && !findes) {
                    s.bindinger.push({ s: t, t: andet, orden: 1 });
                    self._placerVed(t, andet);
                } else {
                    /* Et endeatom falder tilbage i bindingslaengde, naar det slippes. */
                    var mine = s.bindinger.filter(function (b) { return b.s === t || b.t === t; });
                    if (mine.length === 1) self._placerVed(t, mine[0].s === t ? mine[0].t : mine[0].s);
                }
                if (s.bindinger.length !== foer) s.markering = {};
                cvs.style.cursor = "grab";
            }
            self.traekAtom = null;
            self.snapMaal = null;
        });
    };

    /* ----- Faelles grænseflade: tilpas / opdater / tegn / nulstil ------- */
    NK.SimByg.prototype.tilpas = function () {
        this.linjeLaerred.tilpas();
    };

    NK.SimByg.prototype.opdater = function () {
        /* Partiklerne opdateres i tegn() - se tegning.js. Metoden findes
           kun for at foelge samme grænseflade som de andre superanimationer. */
    };

    NK.SimByg.prototype.nulstil = function () {
        this.nulstilNiveau();
    };

    NK.SimByg.prototype.tegn = function () {
        var ctx = this.laerred.ctx;
        var s = this.state;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, this.laerred.b, this.laerred.h);

        var opg = NK.OPGAVER[s.niveau];
        var geo = NK.OPGAVE_GEOMETRI[s.niveau];
        if (s.fase !== "aktion" && s.fase !== "sejr") return;

        var vis = {
            snap: this.snapMaal, hover: this.hoverAtom, traek: this.traekAtom,
            taeller: s.hjaelp >= 2,
            stabilGroen: s.fase === "sejr",
            ringe: {}, etiketter: {}
        };
        Object.keys(s.markering).forEach(function (id) {
            vis.ringe[id] = "roed";
            if (!vis.taeller) vis.etiketter[id] = { tekst: s.markering[id] === "faa" ? "for få" : "for mange", farve: "roed" };
        });
        NK.tegnStregformel(this.linjeLaerred.ctx, this.linjeLaerred.b, this.linjeLaerred.h, opg, geo, s);
        NK.tegnSpil(ctx, s, vis);
    };
}());
