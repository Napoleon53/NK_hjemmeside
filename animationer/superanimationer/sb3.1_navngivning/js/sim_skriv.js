/* =====================================================================
   sim_skriv.js - fane 2: Skriv navnet

   Molekylet staar paa whiteboardet som zigzagformel. Eleven skriver
   navnet i feltet paa kortet og trykker Tjek (eller Enter). Tavlen
   tegner saa det, eleven skrev, til hoejre paa whiteboardet (kassen
   "Dit navn tegnet"), saa formlen og elevens navn kan sammenlignes, som
   paa tegnebraettet. Kortet siger, hvad der er galt: et andet stof
   (endelsen, kaeden, numrene, sidegrupperne), eller det rigtige stof med
   et navn, der ikke er skrevet efter reglerne (den anden ende, ikke den
   laengste kaede, alfabetisk raekkefoelge, di og tri, bindestreger).

   Den gamle skrivemaade (2-propanol) og et tal, der kan udelades
   (ethan-1-ol), godkendes med en note. Trivialnavne og engelske navne
   godkendes ikke. Felter, der er tomme, er intet svar.

   Hintene er bogens fire trin (afsnit B3.1): kaeden, numrene, endelsen
   og forleddet. Hvert hint goer det gult i formlen, det handler om, og
   numrene bliver staaende paa kaeden, naar de er vist.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;

    function SimSkriv() {
        var mig = this;
        this.stoffer = {};
        this.input = NK.el("s-input");
        this.feltrad = NK.el("s-feltrad");
        NK.el("s-tjek").addEventListener("click", function () { mig.tjek(); });
        this.input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
        });
        this.input.addEventListener("input", function () { mig.input.classList.remove("forkert"); });
        this.startFane();
    }

    var P = SimSkriv.prototype;
    F.paa(P, { navn: "s", naesteFane: "fane-t", naesteNavn: "Tegn molekylet" });

    P.lavOpgaver = function (aktive) {
        return K.raekkefoelge(D.STOFFER.filter(function (o) { return o.fane === "s" && aktive.indexOf(o.k) >= 0; }));
    };

    /* Kortet: opgaven, feltet og den nederste raekke */
    P.kortZone = function () { return window.innerHeight <= 720 ? 150 : 170; };

    P.nyOpgave = function (opg) {
        if (!this.stoffer[opg.id]) this.stoffer[opg.id] = K.stof(opg.o);
        this.stof = this.stoffer[opg.id];
        this.hints = K.skriveHints(this.stof);
        this.hintVis = null;
        this.visNumre = false;
        this.dit = null;
        this.input.value = "";
        this.input.disabled = false;
        this.input.classList.remove("forkert");
        this.bygTegning();
    };

    P.fokus = function () {
        if (!this.faerdig && this.input && !this.input.disabled) {
            try { this.input.focus({ preventScroll: true }); } catch (x) { /* intet fokus */ }
        }
    };

    /* ----- Kortet ------------------------------------------------------------------ */
    P.kortData = function () {
        return { slags: "opgave", chip: "Opgave " + (this.nr + 1), tekst: "Skriv molekylets navn i feltet, og tryk Tjek." };
    };

    P.kortVist = function () {
        this.feltrad.hidden = !!this.faerdig;
        this.input.disabled = !!this.faerdig;
    };

    P.slutEkstra = function () {
        return F.navnHTML(this.stof.dele.map(function (d) { return { type: d.type, tekst: d.tekst, fyldt: true }; }), { stor: true });
    };

    P.svarValg = function () { };

    P.hintNu = function () {
        return this.faerdig || !this.hints ? [] : this.hints.map(function (h) { return h.tekst; });
    };

    /* Et hint viser det, det handler om, i formlen */
    P.efterHint = function (n) {
        var h = this.hints[n - 1];
        if (!h) return;
        this.hintVis = h.vis || null;
        if (h.numre) this.visNumre = true;
        this.bygTegning();
    };

    /* ----- Tjek ------------------------------------------------------------------- */
    P.tjek = function () {
        if (this.spaer()) return;
        var r = K.tjekNavn(this.stof, this.input.value);
        if (r.tom) { this.kortBesked("Skriv navnet i feltet først.", 3, "peger"); this.fokus(); return; }
        this.dit = { mol: r.mol, skrevet: r.skrevet, navn: r.navn, ok: r.ok, same: r.same };
        this.bygTegning();
        if (r.ok) { this.klaret(r.note); return; }
        this.input.classList.remove("forkert");
        void this.input.offsetWidth;
        this.input.classList.add("forkert");
        this.fejlLinje(r.tekst);
    };

    P.klaret = function (note) {
        this.input.classList.remove("forkert");
        this.hintVis = null;
        this.loest("selv", (note ? note + " " : "") + K.forklaring(this.stof), this.stof.navn + ".");
        this.bygTegning();
    };

    P.visSvar = function () {
        this.input.value = this.stof.navn;
        this.dit = { mol: this.stof.mol.kopi(), skrevet: this.stof.navn, navn: this.stof.navn, ok: true, same: true };
        this.klaret("");
    };

    /* ----- Layout ------------------------------------------------------------------------
       Formlen til venstre, kassen med elevens navn til hoejre. Pladserne staar
       fast, saa intet flytter sig, naar eleven trykker Tjek. */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, kb = Math.round(NK.klamp(t.b * 0.36, 230, 380));
        this.venstre = { x: t.x, y: t.y, b: t.b - kb - 10, h: t.h };
        this.kasse = { x: t.x + t.b - kb - 14, y: t.y + 14, b: kb, h: t.h - 28 };
        this.saetAnker("tavle", this.venstre.x, this.venstre.y, this.venstre.b, this.venstre.h);
        this.saetAnker("kasse", this.kasse.x, this.kasse.y, this.kasse.b, this.kasse.h);
        this.bygTegning();
    };

    /* Farverne: et svar faar navnedelens farve, foerst naar navnet er rigtigt.
       Gult (fokusNu) er det, hintet handler om lige nu. */
    P.farver = function () {
        var s = this.stof, mol = s.mol, a = {}, b = {}, gl = [];
        if (!this.faerdig) return { a: a, b: b, gl: gl };
        function kant(x, y) { return x < y ? x + "-" + y : y + "-" + x; }
        function maal(maengde, farve, medBindinger) {
            mol.bindinger.forEach(function (bd) {
                if (maengde[bd.a] && maengde[bd.b]) b[kant(bd.a, bd.b)] = farve;
                else if (medBindinger && (maengde[bd.a] || maengde[bd.b])) b[kant(bd.a, bd.b)] = farve;
            });
            Object.keys(maengde).forEach(function (id) { if (mol.atom(Number(id)).el !== "C") a[id] = farve; });
        }
        var kaede = {};
        s.res.kaede.forEach(function (id) { kaede[id] = true; });
        maal(kaede, D.DELE.stamme.blaek, false);
        gl.push([kaede, D.DELE.stamme.blaek]);
        var side = this.atomer("side");
        if (Object.keys(side).length) {
            var kun = {};
            (s.res.sub || []).forEach(function (x) { (x.atomer || []).forEach(function (id) { kun[id] = true; }); });
            maal(kun, D.DELE.forled.blaek, true);
            gl.push([kun, D.DELE.forled.blaek]);
        }
        var g = this.atomer("gruppe");
        if (Object.keys(g).length) {
            var o = {};
            Object.keys(g).forEach(function (id) { if (mol.atom(Number(id)).el !== "C") o[id] = true; });
            if (s.p.endelse) maal(o, D.DELE.endelse.blaek, true);
            else mol.bindinger.forEach(function (bd) { if (bd.orden > 1 && g[bd.a] && g[bd.b]) b[kant(bd.a, bd.b)] = D.DELE.endelse.blaek; });
            gl.push([g, D.DELE.endelse.blaek]);
        }
        return { a: a, b: b, gl: gl };
    };

    /* De atomer i formlen, en del af navnet handler om:
         kaede   hovedkaeden (eller ringen)
         gruppe  OH- eller COOH-gruppen med sit carbonatom, eller
                 dobbelt- og tripelbindingens to carbonatomer
         side    sidegrupperne (ogsaa halogenatomer og hydroxy) og de
                 carbonatomer i kaeden, de sidder paa */
    P.atomer = function (hvad) {
        var s = this.stof, mol = s.mol, sig = s.sig, m = {};
        function med(id) { m[id] = true; }
        if (hvad === "kaede") s.res.kaede.forEach(med);
        else if (hvad === "gruppe") {
            if (s.p.endelse && s.p.endelse.type === "syre") sig.coohAtomer.forEach(med);
            else if (s.p.endelse) {
                /* Kun OH-grupperne paa kaeden, ikke hydroxy som forled (findes ikke med -ol) */
                sig.ohAtomer.forEach(med);
            } else if (s.p.umaettet) {
                mol.bindinger.forEach(function (bd) {
                    if (bd.orden > 1 && mol.atom(bd.a).el === "C" && mol.atom(bd.b).el === "C") { med(bd.a); med(bd.b); }
                });
            }
        } else if (hvad === "side") {
            (s.res.sub || []).forEach(function (x) {
                (x.atomer || []).forEach(function (id) {
                    med(id);
                    mol.naboer(id).forEach(function (n) { if (s.res.kaede.indexOf(n) >= 0) med(n); });
                });
            });
        }
        return m;
    };

    P.fokusNu = function () {
        if (this.faerdig || !this.hintVis) return null;
        var m = this.atomer(this.hintVis);
        return Object.keys(m).length ? m : null;
    };

    P.bygTegning = function () {
        if (!this.lay || !this.stof) return;
        var f = this.farver(), s = this.stof;
        this.farve = f;
        var lok = null;
        if (this.visNumre || (this.faerdig && /\d/.test(s.navn))) {
            lok = {};
            if (!s.res.ring) s.res.kaede.forEach(function (id, i) { lok[id] = i + 1; });
        }
        var r = F.geo(s.mol, this.venstre, {
            atomFarve: function (id) { return f.a[id] || null; },
            bindingFarve: function (bd) { return f.b[bd.a < bd.b ? bd.a + "-" + bd.b : bd.b + "-" + bd.a] || null; },
            lokanter: lok, luft: [110, 90]
        });
        this.geo = r.geo;
        this.s = r.s;
        this.ditGeo = null;
        if (this.dit && this.dit.mol) {
            var k = this.kasse;
            var rd = F.geo(this.dit.mol, { x: k.x, y: k.y + 46, b: k.b, h: k.h - 92 }, {
                luft: [36, 24], maks: Math.min(70, this.s * 0.85), mindst: 18, farve: "#334155"
            });
            this.ditGeo = rd.geo;
            this.ditS = rd.s;
        }
    };

    /* ----- Tegningen -------------------------------------------------------------------- */
    P.klikScene = function () { this.spaer(); };

    P.tegnKasse = function (ctx) {
        var k = this.kasse, d = this.dit, ok = d && d.ok;
        ctx.save();
        NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, 12);
        ctx.fillStyle = ok ? "rgba(63, 174, 114, 0.07)" : "rgba(51, 65, 85, 0.035)";
        ctx.fill();
        ctx.setLineDash(d ? [] : [7, 6]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = ok ? "#3fae72" : "#b6bfcc";
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var fs = Math.round(NK.klamp(k.b / 17, 14, 18));
        ctx.font = "700 " + fs + "px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Dit navn tegnet", k.x + k.b / 2, k.y + 22);
        if (!d) {
            ctx.font = "600 " + fs + "px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#94a3b8";
            linjer(ctx, "Når du trykker Tjek, tegner tavlen det navn, du har skrevet, her.", k.x + k.b / 2, k.y + k.h / 2, k.b - 40, fs * 1.35);
            ctx.restore();
            return;
        }
        /* Det, eleven skrev, nederst i kassen */
        var navn = d.skrevet;
        ctx.font = "700 " + fs + "px 'Segoe UI', Arial, sans-serif";
        var maks = k.b - 24;
        while (ctx.measureText(navn).width > maks && navn.length > 4) navn = navn.slice(0, -2);
        if (navn !== d.skrevet) navn += "…";
        ctx.fillStyle = ok ? "#1c8a4e" : "#1d2433";
        ctx.fillText(navn, k.x + k.b / 2, k.y + k.h - 22);
        if (!d.mol) {
            ctx.font = "700 " + Math.round(fs * 3) + "px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#cbd5e1";
            ctx.fillText("?", k.x + k.b / 2, k.y + k.h / 2 - 8);
            ctx.font = "600 " + fs + "px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#94a3b8";
            ctx.fillText("Navnet kan ikke tegnes.", k.x + k.b / 2, k.y + k.h / 2 + fs * 2);
        }
        ctx.restore();
        if (this.ditGeo) NK.Struktur.tegnGeo(ctx, this.ditGeo);
    };

    /* Tekst i flere linjer, centreret om (x, y) */
    function linjer(ctx, tekst, x, y, b, lh) {
        var ord = tekst.split(" "), l = [], nu = "";
        ord.forEach(function (o) {
            var p = nu ? nu + " " + o : o;
            if (ctx.measureText(p).width > b && nu) { l.push(nu); nu = o; } else nu = p;
        });
        if (nu) l.push(nu);
        var y0 = y - (l.length - 1) * lh / 2;
        l.forEach(function (t, i) { ctx.fillText(t, x, y0 + i * lh); });
    }

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mol = this.stof.mol, g = this.geo, s = this.s;
        NK.Tavle.tegn(ctx, lay);
        if (!g) return;
        /* Gult bag det, hintet handler om. Det pulserer stille. */
        var fokus = this.fokusNu();
        if (fokus) F.glorie(ctx, mol, g, s, fokus, "#f5b400", 0.5 + 0.12 * Math.sin(this.tid * 3.2), 0.6);
        this.farve.gl.forEach(function (x) { F.glorie(ctx, mol, g, s, x[0], x[1], 0.16); });
        NK.Struktur.tegnGeo(ctx, g);
        this.tegnKasse(ctx);
        this.tegnSejr(ctx, lay.tavle);
    };

    NK.SimSkriv = SimSkriv;
}());
