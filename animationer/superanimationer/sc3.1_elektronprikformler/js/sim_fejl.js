/* =====================================================================
   sim_fejl.js - fanen Find fejlen

   Kemichael har tegnet en prikformel (NK.FEJL i js/data.js). Nogle har
   én fejl, som elever faktisk laver; nogle er rigtige. Eleven

     1. klikker paa det atom, der er tegnet forkert, eller paa Ingen fejl
     2. taeller, hvor mange elektroner det atom har omkring sig
     3. ser tegningen rettet ved siden af

   Klikker eleven paa et atom, der passer, taeller animationen hoejt:
   prikkerne om atomet lyser op én ad gangen, og tallet staar ved siden
   af. Saa ser eleven, hvordan der skal taelles, uden at faa svaret paa
   det forkerte atom. Et forkert elektrontal giver et hint, der passer
   til maaden, der er talt forkert paa (NK.taelleHint).

   Hjaelpen kommer i trin paa én knap: Giv hint, Vis svaret, Naeste
   tegning. En tegning taeller som loest, naar eleven kom igennem uden
   Vis svaret.

   Tegningen bruger de samme regler som byggefanen (NK.tegnSpil), saa
   de rettede tegninger ser ud som facit i sejrsboksen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var GEM_NR = "sc3_1_fejl_nr";
    var GEM_LOEST = "sc3_1_fejl_loeste";
    var TAEL_FART = 6;          /* prikker pr. sekund, naar der taelles hoejt */
    var SVAR_MAKS = 12;

    function lavTegning(zListe, geo, bindinger, frie) {
        var L = NK.BINDINGSLAENGDE;
        var n = zListe.length;
        var pos = [];
        if (geo.type === "kaede") {
            for (var i = 0; i < n; i++) pos[i] = { x: (i - (n - 1) / 2) * L, y: 0 };
        } else {
            pos[geo.hub] = { x: 0, y: 0 };
            Object.keys(geo.vinkler).forEach(function (k) {
                var rad = geo.vinkler[k] * Math.PI / 180;
                pos[+k] = { x: Math.cos(rad) * L, y: Math.sin(rad) * L };
            });
        }
        /* Midt i tegningen i (0, 0) */
        var xs = pos.map(function (p) { return p.x; }), ys = pos.map(function (p) { return p.y; });
        var mx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
        var my = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;

        var atomer = zListe.map(function (z, i) {
            var a = { id: i, z: z, x: pos[i].x - mx, y: pos[i].y - my, r: NK.ELEMENTER[z].s.length > 1 ? 28 : 22 };
            if (frie && frie[i] !== undefined) a.frie = frie[i];
            return a;
        });
        return {
            atomer: atomer,
            bindinger: bindinger.map(function (b) { return { s: atomer[b[0]], t: atomer[b[1]], orden: b[2] }; }),
            bredde: Math.max.apply(null, xs) - Math.min.apply(null, xs),
            hoejde: Math.max.apply(null, ys) - Math.min.apply(null, ys)
        };
    }

    /* Tegningen og den rettede udgave af opgave nr. */
    NK.fejlTegning = function (nr) {
        var o = NK.FEJL[nr];
        var ret = o.ret || {};
        return {
            tegning: lavTegning(o.atomer, o.geo, o.bindinger, o.frie),
            rettet: lavTegning(ret.atomer || o.atomer, ret.geo || o.geo, ret.bindinger || o.bindinger, null),
            sammeAtomer: !ret.atomer
        };
    };

    /* Det atom, der er tegnet forkert (eller null), regnet af tegningen. */
    NK.fejlAtomer = function (tegning) {
        return tegning.atomer.filter(function (a) { return !NK.atomStatus(tegning, a).stabil; });
    };

    NK.SimFejl = function (laerred) {
        this.laerred = laerred;
        this.aktiv = false;
        this.hover = null;
        var gemt = NK.hent(GEM_LOEST, null);
        this.loeste = NK.FEJL.map(function (_, i) { return !!(Array.isArray(gemt) && gemt[i]); });
        var nr = parseInt(NK.hent(GEM_NR, 0), 10);
        this._byggMenu();
        this._bindInteraktion();
        this.nyTegning(isNaN(nr) || nr < 0 || nr >= NK.FEJL.length ? 0 : nr);
    };

    var P = NK.SimFejl.prototype;

    /* ----- Menuen: én knap pr. tegning ---------------------------------- */
    P._byggMenu = function () {
        var self = this;
        var menu = NK.el("fejl-menu");
        menu.innerHTML = "";
        NK.FEJL.forEach(function (o, i) {
            var knap = document.createElement("button");
            knap.className = "opgave-knap";
            knap.type = "button";
            knap.title = "Tegning " + (i + 1);
            knap.textContent = i + 1;
            knap.addEventListener("click", function () { self.nyTegning(i); });
            menu.appendChild(knap);
        });
    };

    P._opdaterMenu = function () {
        var knapper = NK.el("fejl-menu").children;
        for (var i = 0; i < knapper.length; i++) {
            knapper[i].classList.toggle("loest", this.loeste[i]);
            knapper[i].classList.toggle("aktiv", i === this.nr);
        }
    };

    P.opdaterTaeller = function () {
        NK.el("taeller-tekst").textContent = "Tegning " + (this.nr + 1) + "/" + NK.FEJL.length;
    };

    /* ----- En ny tegning --------------------------------------------------- */
    P.nyTegning = function (nr) {
        if (nr >= NK.FEJL.length) nr = 0;
        this.nr = nr;
        NK.gem(GEM_NR, nr);
        var t = NK.fejlTegning(nr);
        this.tegning = t.tegning;
        this.rettet = t.rettet;
        this.sammeAtomer = t.sammeAtomer;
        var forkerte = NK.fejlAtomer(this.tegning);
        this.forkert = forkerte.length ? forkerte[0] : null;

        this.trin = "find";
        this.hjaelp = 0;            /* 0: intet, 1: hint vist, 2: svaret vist */
        this.valgt = null;
        this.talte = {};            /* atomer, der er talt hoejt: { id: true } */
        this.taelling = null;
        this.retAlfa = 0;
        this.visRettet = false;
        this.hover = null;

        NK.skjulHint("fejl");
        this._saetSpm("Klik på det atom, Kemichael har tegnet forkert.");
        this._saetBesked("", "");
        this._visSvarknapper("find");
        this._opdaterKnap();
        this._opdaterMenu();
        if (this.aktiv) this.opdaterTaeller();
    };

    P.nulstil = function () { this.nyTegning(this.nr); };

    /* ----- Tekst og knapper under scenen ---------------------------------- */
    P._saetSpm = function (tekst) { NK.el("fejl-spm").textContent = tekst; };

    P._saetBesked = function (tekst, klasse) {
        var b = NK.el("fejl-besked");
        b.textContent = tekst;
        b.className = "fejl-besked" + (klasse ? " " + klasse : "");
    };

    P._visSvarknapper = function (hvad) {
        var self = this;
        var boks = NK.el("fejl-svar");
        boks.innerHTML = "";
        if (hvad === "find") {
            var ingen = document.createElement("button");
            ingen.className = "knap";
            ingen.type = "button";
            ingen.id = "ingen-fejl-knap";
            ingen.textContent = "Ingen fejl";
            ingen.addEventListener("click", function () { self.ingenFejl(); });
            boks.appendChild(ingen);
        } else if (hvad === "taal") {
            for (var i = 1; i <= SVAR_MAKS; i++) {
                (function (tal) {
                    var k = document.createElement("button");
                    k.className = "tal-knap";
                    k.type = "button";
                    k.textContent = tal;
                    k.addEventListener("click", function () { self.svarTal(tal, k); });
                    boks.appendChild(k);
                }(i));
            }
        }
    };

    P._opdaterKnap = function () {
        var k = NK.el("fejl-knap");
        k.classList.toggle("groen", this.trin === "faerdig");
        k.classList.toggle("lilla", this.trin !== "faerdig");
        k.textContent = this.trin === "faerdig" ? "Næste tegning" : this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
    };

    /* ----- Elevens valg ---------------------------------------------------- */
    P.klikAtom = function (a) {
        if (this.trin !== "find" || !a) return;
        if (a === this.forkert) {
            this.valgt = a;
            this.trin = "taal";
            this.taelling = null;
            this._saetSpm("Hvor mange elektroner har " + NK.ELEMENTER[a.z].n.toLowerCase() + " omkring sig?");
            this._saetBesked("Det er det atom. Tæl nu elektronerne omkring det.", "ok");
            this._visSvarknapper("taal");
            return;
        }
        /* Et atom, der passer: animationen taeller hoejt. */
        var st = NK.atomStatus(this.tegning, a);
        this.talte[a.id] = true;
        this.taelling = { id: a.id, n: 0, faerdig: false };
        this._saetBesked(NK.ELEMENTER[a.z].n + " har " + st.nu + " elektroner omkring sig. Det passer.", "");
    };

    P.ingenFejl = function () {
        if (this.trin !== "find") return;
        if (this.forkert) {
            this._saetBesked("Der er en fejl. Tæl elektronerne om hvert atom.", "fejl");
            return;
        }
        this._afslut(this.hjaelp < 2, "Rigtigt. " + NK.FEJL[this.nr].forklaring);
    };

    P.svarTal = function (tal, knap) {
        if (this.trin !== "taal") return;
        var st = NK.atomStatus(this.tegning, this.valgt);
        if (tal === st.nu) {
            this._afslut(this.hjaelp < 2, "Rigtigt. " + NK.FEJL[this.nr].forklaring);
            return;
        }
        this._saetBesked(NK.taelleHint(st, tal), "fejl");
        if (knap) {
            knap.classList.add("forkert");
            setTimeout(function () { knap.classList.remove("forkert"); }, 400);
        }
    };

    /* Tegningen er klaret: det forkerte atom taelles hoejt, og den rettede
       tegning kommer frem ved siden af. */
    P._afslut = function (selv, tekst) {
        this.trin = "faerdig";
        NK.skjulHint("fejl");
        this._saetSpm(this.forkert ? "Sådan ser den rettede tegning ud." : "Tegningen er rigtig.");
        this._saetBesked(tekst, "ok");
        this._visSvarknapper("ingen");
        if (this.forkert) {
            this.valgt = this.forkert;
            this.taelling = { id: this.forkert.id, n: 0, faerdig: false, derefter: "ret" };
        } else {
            this.taelling = null;
        }
        if (selv && !this.loeste[this.nr]) {
            this.loeste[this.nr] = true;
            NK.gem(GEM_LOEST, this.loeste);
        }
        this._opdaterMenu();
        this._opdaterKnap();
    };

    /* Én knap: Giv hint, Vis svaret, Naeste tegning */
    P.knap = function () {
        if (this.trin === "faerdig") { this.nyTegning(this.nr + 1); return; }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            NK.visHint("fejl", "Hint", NK.FEJL[this.nr].hint);
            this._opdaterKnap();
            return;
        }
        this.hjaelp = 2;
        NK.skjulHint("fejl");
        this._afslut(false, NK.FEJL[this.nr].forklaring);
    };

    /* ----- Musen ---------------------------------------------------------- */
    P._layout = function () {
        var b = this.laerred.b, h = this.laerred.h;
        var k = NK.klamp(Math.min(b / 900, (h - 40) / 420), 0.8, 1.6);
        var skub = NK.blod(this.retAlfa);
        return {
            k: k,
            venstre: { x: b * (0.5 - 0.22 * skub), y: h * 0.5 },
            hoejre: { x: b * 0.72, y: h * 0.5 }
        };
    };

    P._atomVed = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        var lay = this._layout();
        var x = (e.clientX - r.left - lay.venstre.x) / lay.k;
        var y = (e.clientY - r.top - lay.venstre.y) / lay.k;
        var a = this.tegning.atomer;
        for (var i = 0; i < a.length; i++) {
            if (Math.hypot(x - a[i].x, y - a[i].y) < a[i].r + 6) return a[i];
        }
        return null;
    };

    P._bindInteraktion = function () {
        var self = this;
        var cvs = this.laerred.canvas;
        cvs.addEventListener("mousedown", function (e) {
            if (!self.aktiv) return;
            self.klikAtom(self._atomVed(e));
        });
        window.addEventListener("mousemove", function (e) {
            if (!self.aktiv) return;
            self.hover = self.trin === "find" ? self._atomVed(e) : null;
            cvs.style.cursor = self.hover ? "pointer" : "default";
        });
    };

    /* ----- Faelles grænseflade --------------------------------------------- */
    P.tilpas = function () {};

    P.opdater = function (dt) {
        var t = this.taelling;
        if (t && !t.faerdig) {
            var tegning = this.tegning;
            var a = tegning.atomer[t.id];
            var antal = NK.atometsPrikker(tegning, a).length;
            t.n += dt * TAEL_FART;
            if (t.n >= antal) {
                t.n = antal;
                t.faerdig = true;
                if (t.derefter === "ret") this.visRettet = true;
            }
        }
        if (this.visRettet && this.retAlfa < 1) this.retAlfa = Math.min(1, this.retAlfa + dt * 1.6);
    };

    function ark(ctx, lay, tegning, midt, titel, farve, alfa) {
        var k = lay.k;
        var b = (tegning.bredde + 150) * k, h = (tegning.hoejde + 150) * k;
        b = Math.max(b, 260); h = Math.max(h, 200);
        ctx.save();
        ctx.globalAlpha *= alfa;
        NK.rundtRekt(ctx, midt.x - b / 2, midt.y - h / 2, b, h, 14);
        ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
        NK.tekst(ctx, titel, midt.x - b / 2 + 14, midt.y - h / 2 + 22, {
            font: "700 13px 'Segoe UI', sans-serif", farve: farve
        });
        ctx.restore();
    }

    P.tegn = function () {
        var ctx = this.laerred.ctx;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, this.laerred.b, this.laerred.h);

        var lay = this._layout();
        var o = NK.FEJL[this.nr];
        var self = this;

        /* Kemichaels tegning */
        var vis = { hover: this.hover, ringe: {}, etiketter: {}, taelling: this.taelling };
        Object.keys(this.talte).forEach(function (id) {
            if (!self.taelling || +id !== self.taelling.id) {
                var st = NK.atomStatus(self.tegning, self.tegning.atomer[id]);
                vis.etiketter[id] = { tekst: st.nu + " e" + NK.haevet("-"), farve: "groen" };
            }
        });
        if (this.trin === "taal" && this.valgt) vis.ringe[this.valgt.id] = "gul";
        if (this.trin === "faerdig") {
            if (this.forkert) vis.ringe[this.forkert.id] = "roed";
            else vis.stabilGroen = true;
        }

        ark(ctx, lay, this.tegning, lay.venstre, "KEMICHAELS TEGNING AF " + o.f, "#a9b0ba", 1);
        ctx.save();
        ctx.translate(lay.venstre.x, lay.venstre.y);
        ctx.scale(lay.k, lay.k);
        NK.tegnSpil(ctx, this.tegning, vis);
        ctx.restore();

        /* Den rettede tegning ved siden af */
        if (this.retAlfa > 0) {
            var a = NK.blod(this.retAlfa);
            ark(ctx, lay, this.rettet, lay.hoejre, "RETTET", "#7ee0a8", a);
            var visRet = { stabilGroen: true, ringe: {}, etiketter: {} };
            if (this.sammeAtomer && this.forkert) {
                var st = NK.atomStatus(this.rettet, this.rettet.atomer[this.forkert.id]);
                visRet.ringe[this.forkert.id] = "groen";
                visRet.etiketter[this.forkert.id] = { tekst: st.nu + " e" + NK.haevet("-"), farve: "groen" };
            }
            ctx.save();
            ctx.globalAlpha = a;
            ctx.translate(lay.hoejre.x, lay.hoejre.y);
            ctx.scale(lay.k, lay.k);
            NK.tegnSpil(ctx, this.rettet, visRet);
            ctx.restore();
        }
    };
}());
