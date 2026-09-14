/* =====================================================================
   sim_byg.js - selve spillet: vaelg valenselektroner, traek atomer
   sammen, byg bindinger, tjek mod oktetreglen.

   Objektet foelger samme moenster som resten af superanimationerne:
   tilpas(), opdater(dt), tegn() og nulstil(). Fordi der kun er én
   "fane" her, kaldes de altid - se js/app.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var GEM_FREMSKRIDT = "sc3_1_fremskridt";
    var GEM_LOEST = "sc3_1_loeste";
    var SNAP_AFSTAND = 105;
    var BRYD_AFSTAND = 200;

    function loadFremskridt() {
        var v = parseInt(localStorage.getItem(GEM_FREMSKRIDT), 10);
        return (isNaN(v) || v < 0 || v >= NK.OPGAVER.length) ? 0 : v;
    }

    function loadLoeste() {
        try {
            var arr = JSON.parse(localStorage.getItem(GEM_LOEST));
            if (Array.isArray(arr)) return NK.OPGAVER.map(function (_, i) { return !!arr[i]; });
        } catch (e) { /* ignoreres - starter forfra */ }
        return NK.OPGAVER.map(function () { return false; });
    }

    NK.SimByg = function () {
        this.laerred = new NK.Laerred(NK.el("laerred"));
        this.linjeLaerred = new NK.Laerred(NK.el("stregformel-laerred"));
        this.loeste = loadLoeste();

        this.state = {
            niveau: 0,
            fase: "opsaetning",
            delfase: 0,
            unikkeAtomer: [],
            atomer: [],
            bindinger: [],
            partikler: []
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
        NK.el("niveau-total").textContent = NK.OPGAVER.length;
    };

    NK.SimByg.prototype._opdaterOpgaveMenu = function () {
        var knapper = NK.el("opgave-menu").children;
        for (var i = 0; i < knapper.length; i++) {
            knapper[i].classList.toggle("loest", this.loeste[i]);
            knapper[i].classList.toggle("aktiv", i === this.state.niveau);
        }
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
        localStorage.setItem(GEM_FREMSKRIDT, idx);

        NK.el("niveau-nu").textContent = idx + 1;
        NK.el("sejr-overlay").classList.add("skjult");
        NK.el("tjek-knap").classList.add("skjult");
        NK.el("nulstil-knap").classList.add("skjult");
        NK.el("opsaetning-overlay").classList.remove("skjult");
        NK.el("stregformel-panel").classList.add("skjult");
        this._skjulHint();

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
            NK.el("hint-knap").classList.remove("skjult");
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
                knap.textContent = tal;
                knap.addEventListener("click", function () {
                    if (tal === NK.ELEMENTER[z].v) {
                        self.state.delfase++;
                        self._opsaetningsFase();
                    } else {
                        knap.classList.add("forkert");
                        setTimeout(function () { knap.classList.remove("forkert"); }, 400);
                    }
                });
                knapper.appendChild(knap);
            }(i));
        }
    };

    NK.SimByg.prototype.nulstilNiveau = function () {
        if (this.state.fase !== "aktion") return;
        this.state.atomer = [];
        this.state.bindinger = [];
        this.state.partikler = [];
        this._spawnAtomer();
    };

    NK.SimByg.prototype._spawnAtomer = function () {
        this.tilpas();
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

    NK.SimByg.prototype.tjekSvar = function () {
        var s = this.state;
        if (s.fase !== "aktion") return;

        if (s.atomer.length > 1 && s.bindinger.length < s.atomer.length - 1) {
            this._visToast("Atomerne hænger ikke sammen!");
            return;
        }

        var fejlAtom = null;
        for (var i = 0; i < s.atomer.length; i++) {
            if (!NK.atomStatus(s, s.atomer[i]).stabil) { fejlAtom = s.atomer[i]; break; }
        }

        if (!fejlAtom) {
            s.fase = "sejr";
            NK.el("sejr-sprite").src = "sprites/" + NK.OPGAVER[s.niveau].sprite;
            NK.el("sejr-overlay").classList.remove("skjult");
            NK.el("tjek-knap").classList.add("skjult");
            NK.el("nulstil-knap").classList.add("skjult");
            this.loeste[s.niveau] = true;
            localStorage.setItem(GEM_LOEST, JSON.stringify(this.loeste));
            this._opdaterOpgaveMenu();
            this._spawnKonfetti();
        } else {
            var navn = NK.ELEMENTER[fejlAtom.z].n;
            var st = NK.atomStatus(s, fejlAtom);
            this._visToast(st.nu < st.maal ? "Prøv igen: " + navn + " mangler elektroner." : "Prøv igen: " + navn + " har for mange elektroner!");
        }
    };

    NK.SimByg.prototype._visToast = function (tekst) {
        var t = NK.el("toast");
        t.textContent = tekst;
        t.classList.add("vis");
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(function () { t.classList.remove("vis"); }, 3000);
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

    /* ----- Hint: skjult indtil eleven selv beder om den ----------------- */
    NK.SimByg.prototype.skiftHint = function () {
        var boks = NK.el("hint-boks");
        var vis = !boks.classList.contains("vis");
        if (vis) NK.el("hint-tekst").textContent = NK.OPGAVER[this.state.niveau].hint;
        boks.classList.toggle("vis", vis);
    };

    NK.SimByg.prototype._skjulHint = function () {
        NK.el("hint-boks").classList.remove("vis");
        NK.el("hint-knap").classList.add("skjult");
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
            if (s.fase !== "aktion") return;
            var p = self._musPunkt(e);
            var i = self._bindingVed(p);
            if (i >= 0) {
                if (s.bindinger[i].orden >= 3) s.bindinger.splice(i, 1);
                else s.bindinger[i].orden++;
                return;
            }
            self.traekAtom = self._atomVed(p);
            if (self.traekAtom) cvs.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", function (e) {
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
                cvs.style.cursor = "grab";
            }
            self.traekAtom = null;
            self.snapMaal = null;
        });
    };

    /* ----- Faelles grænseflade: tilpas / opdater / tegn / nulstil ------- */
    NK.SimByg.prototype.tilpas = function () {
        this.laerred.tilpas();
        this.linjeLaerred.tilpas();
    };

    NK.SimByg.prototype.opdater = function () {
        /* Partiklerne opdateres i tegn() - se tegning.js. Metoden findes
           kun for at foelge samme grænseflade som de andre superanimationer. */
    };

    NK.SimByg.prototype.tegn = function () {
        var ctx = this.laerred.ctx;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, this.laerred.b, this.laerred.h);

        var opg = NK.OPGAVER[this.state.niveau];
        var geo = NK.OPGAVE_GEOMETRI[this.state.niveau];
        if (this.state.fase === "aktion" || this.state.fase === "sejr") {
            NK.tegnStregformel(this.linjeLaerred.ctx, this.linjeLaerred.b, this.linjeLaerred.h, opg, geo, this.state);
            NK.tegnSpil(ctx, this.state, { snap: this.snapMaal, hover: this.hoverAtom, traek: this.traekAtom });
        }
    };
}());
