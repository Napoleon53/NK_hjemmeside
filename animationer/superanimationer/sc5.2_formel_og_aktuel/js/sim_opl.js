/* =====================================================================
   sim_opl.js - fane 1: opløsningen

   Et literglas med vand og én eller to krukker med salt. Eleven
   traekker en portion (0,10 mol) fra en krukke ned i glasset (et klik
   paa krukken virker ogsaa). Luppen viser ionerne, og soejlerne viser
   saltets koncentration (graa) og hver ions koncentration. Panelet
   viser c = n / V og [ion] = tallet foran ionen · c.

   Seks opgaver: ram en ions koncentration, gaet foer du proever (to
   Na⁺, hvem er flest) og to salte med en faelles ion. En opgave er
   loest, naar glasset viser maalet; saa forklarer linjen i kortet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimOpl() {
        this.part = new NK.Partikler(7);
        this.skyer = [];
        this.fald = [];
        this.spatel = null;
        this.flyv = null;
        this.over = null;
        this.auto = null;
        this.pegT = 0;
        this.vis = {};
        this.startFane(D.OPL);
        this.el.valg = NK.el("opl-valg");
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimOpl.prototype;
    NK.Fane.paa(P, { navn: "opl", naesteFane: "fane-ioner", naesteNavn: "Ionerne" });

    /* ----- Opgaven ------------------------------------------------------------ */
    P.lavOpgave = function (i) {
        var o = D.OPL[i];
        this.opg = o;
        this.glas = new K.Glas(o.V, o.salte);
        this.fase = o.valg ? "valg" : "goer";
        this.valgt = null;
        this.orden = o.valg ? NK.bland(o.valg.svar.map(function (s, j) { return j; })) : [];
        this.skyer = [];
        this.fald = [];
        this.spatel = null;
        this.flyv = null;
        this.auto = null;
        this.maade = "ok";
        this.handlet = false;
        this.forklaring = "";
        this.part = new NK.Partikler(11 + i);
        this.vis = {};
        this.visPanel();
    };

    P.harForfra = function () { return true; };
    P.harNyeTal = function () { return false; };

    P.forfra = function () {
        if (this.auto) return;
        this.glas = new K.Glas(this.opg.V, this.opg.salte);
        this.spatel = null;
        this.fald = [];
        this.flyv = null;
        this.handlet = false;
        this.visPanel();
        if (!this.faerdig) this.besked("Glasset har kun vand igen. " + this.trinLinje(), "");
    };

    P.promptHTML = function () {
        var o = this.opg;
        return '<p class="maal-tekst">' + NK.html(o.tekst) + "</p>" +
            (o.valg ? '<p class="opgave-spm">' + NK.html(o.valg.spm) + "</p>" : "");
    };

    P.visKortEkstra = function () {
        var o = this.opg, mig = this, e = this.el.valg;
        if (!o.valg) { e.hidden = true; e.innerHTML = ""; return; }
        e.hidden = false;
        e.innerHTML = "";
        this.orden.forEach(function (j) {
            var s = o.valg.svar[j];
            var b = document.createElement("button");
            b.type = "button";
            b.className = "knap";
            b.textContent = s.t;
            if (mig.valgt !== null) {
                b.disabled = true;
                if (j === mig.valgt) b.classList.add("valgt");
                if (mig.faerdig && s.ok) b.classList.add("rigtig");
                if (mig.faerdig && j === mig.valgt && !s.ok) b.classList.add("forkert");
            }
            b.addEventListener("click", function () { mig.vaelgSvar(j, "gaet"); });
            e.appendChild(b);
        });
    };

    P.vaelgSvar = function (j, maade) {
        if (this.valgt !== null || this.auto) return;
        var o = this.opg, s = o.valg.svar[j];
        this.valgt = j;
        this.fase = "goer";
        this.hjaelp = 0;
        if (maade === "svar") {
            this.brugtSvar = true;
            this.svarVis(NK.html("Den rigtige: " + s.t + ". Prøv det."));
        } else {
            this.k.tie();
            this.besked(NK.html("Dit gæt: " + s.t + ". " + o.linje), "");
        }
        this.visKort();
    };

    /* ----- Knappen: hint og svar ------------------------------------------------ */
    P.trinInfo = function () {
        var o = this.opg, mig = this;
        if (this.faerdig) return null;
        if (this.fase === "valg") {
            var ret = o.valg.svar.map(function (s) { return !!s.ok; }).indexOf(true);
            return { hint: NK.html(o.valg.hint), svar: function () { mig.vaelgSvar(ret, "svar"); } };
        }
        return { hint: NK.html(o.hint), svar: function () { mig.visGoer(); } };
    };

    P.opgaveFaerdig = function () { return this.fase === "faerdig"; };

    P.trinLinje = function () {
        if (this.fase === "valg") return "Gæt først: vælg et af svarene herunder.";
        if (!this.handlet) return this.opg.linje;
        return this.statusLinje();
    };

    /* Linjen efter en portion: hvor glasset er, og hvad der mangler */
    P.statusLinje = function () {
        var o = this.opg, m = o.maal, g = this.glas;
        if (m.ion) {
            var c = g.ion(m.ion), navn = "[" + D.ion(m.ion).t + "]";
            var t = navn + " = " + K.to(c) + " M, målet er " + K.to(m.c) + " M.";
            if (c > m.c + 0.005) {
                var st = D.salt(o.salte[o.salte.length - 1]);
                var k = K.k(st, m.ion);
                t += (k > 1 ? " Hver " + st.formel + " giver " + k + " " + D.ion(m.ion).t + "." : "") + " Der er for meget. Tryk på Start forfra.";
            } else if (m.begge && o.salte.some(function (s) { return g.n[s] <= 0; })) {
                t += " Brug begge salte.";
            }
            return t;
        }
        return o.linje;
    };

    P.slutLinje = function () { return this.forklaring; };

    P.tjekMaal = function () {
        var o = this.opg, m = o.maal, g = this.glas;
        if (this.fase !== "goer") return false;
        var ok;
        if (m.portioner) ok = o.salte.every(function (s) { return g.portioner(s) === m.portioner; });
        else {
            ok = Math.abs(g.ion(m.ion) - m.c) < 0.005;
            if (m.begge) ok = ok && o.salte.every(function (s) { return g.n[s] > 0; });
        }
        if (!ok) return false;
        this.fase = "faerdig";
        var pre = "";
        if (o.valg && this.valgt !== null) {
            var s = o.valg.svar[this.valgt];
            pre = s.ok ? "Dit gæt holdt." : "Du gættede " + s.t + ". " + s.forkl;
        }
        var efter = o.efter;
        if (o.id === "begge") {
            var cA = g.cSalt("NaCl"), cB = g.cSalt("Na2SO4");
            efter = "[Na⁺] = " + K.to(cA) + " M + 2 · " + K.to(cB) + " M = " + K.to(g.ion("Na")) + " M. Na⁺ kommer fra begge salte, og bidragene lægges sammen.";
        }
        this.forklaring = NK.html((pre ? pre + " " : "") + efter);
        this.trinLoest(this.maade, this.maade === "svar" ? NK.html(o.svar) : null);
        return true;
    };

    P.efterHandling = function () {
        this.handlet = true;
        this.visPanel();
        if (this.fase === "goer" && this.tjekMaal()) return;
        if (this.fase === "goer" && !this.auto) this.besked(NK.html(this.statusLinje()), "");
    };

    /* ----- Vis svaret: glasset goer det selv fra start ---------------------------- */
    P.visGoer = function () {
        var o = this.opg;
        this.glas = new K.Glas(o.V, o.salte);
        this.spatel = null;
        this.fald = [];
        this.flyv = null;
        this.maade = "svar";
        this.brugtSvar = true;
        var koe = [];
        o.goer.forEach(function (g) { for (var i = 0; i < g[1]; i++) koe.push(g[0]); });
        this.auto = { koe: koe };
        this.svarVis(NK.html(o.svar));
        this.visPanel();
        this.visKnap();
    };

    P.koerAuto = function () {
        var a = this.auto;
        if (!a || this.flyv || this.fald.length) return;
        if (!a.koe.length || this.faerdig) { this.auto = null; this.visKnap(); return; }
        this.startFlyv(a.koe.shift());
    };

    /* ----- Portionerne ------------------------------------------------------------ */
    P.krukke = function (s) {
        var kr = this.lay.krukker;
        for (var i = 0; i < kr.length; i++) if (kr[i].salt === s) return kr[i];
        return kr[0];
    };

    P.startFlyv = function (s) {
        var kr = this.krukke(s), g = this.lay.glas;
        this.flyv = { t: 0, salt: s, x0: kr.cx, y0: kr.y - 10, x1: g.cx, y1: g.ind.top - 30 * g.k };
    };

    P.slipPulver = function (s, x, y) {
        var g = this.lay.glas;
        if (this.glas.portioner(s) >= D.MAKS_PORTIONER) {
            this.kortBesked("Nu er der nok i glasset. Tryk på Start forfra.");
            return;
        }
        x = NK.klamp(x, g.ind.x0 + 16 * g.k, g.ind.x1 - 16 * g.k);
        this.fald.push({ x: x, y: y, vy: 0, salt: s });
    };

    P.landet = function (p) {
        this.glas.tilsaet(p.salt, D.PORTION);
        var g = this.lay.glas;
        this.skyer.push({ x: p.x, y: g.yV(this.glas.V / 1000) + 14 * g.k, r: 8 * g.k, a: 1 });
        this.efterHandling();
    };

    P.blokValg = function () {
        this.kortBesked("Gæt først: vælg et af svarene i kortet.");
        this.pegT = 1.6;
    };

    /* ----- Musen ------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        for (var i = 0; i < lay.krukker.length; i++) {
            var kr = lay.krukker[i];
            if (pt.x >= kr.x - 6 && pt.x <= kr.x + kr.b + 6 && pt.y >= kr.y - 10 && pt.y <= kr.y + kr.h) return { slags: "krukke", salt: kr.salt };
        }
        var z = lay.zoom, g = lay.glas;
        if (Math.hypot(pt.x - z.x, pt.y - z.y) < z.r) return { slags: "zoom" };
        var s = lay.soejler;
        if (pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h) return { slags: "soejler" };
        if (pt.x >= g.ind.x0 && pt.x <= g.ind.x1 && pt.y >= g.ind.top - 20 * g.k && pt.y <= g.ind.bund) return { slags: "glas" };
        return null;
    };

    P.overScene = function (pt) {
        var u = this.hvad(pt);
        this.over = u;
        return u && u.slags === "krukke" ? "krukke" : null;
    };

    P.nedScene = function (pt) {
        if (this.auto) { this.kortBesked("Vent. Glasset viser svaret."); return false; }
        var u = this.hvad(pt);
        if (!u) return false;
        if (u.slags === "krukke") {
            if (this.fase === "valg") { this.blokValg(); return false; }
            if (this.flyv) return false;
            this.spatel = { x: pt.x, y: pt.y, sx: pt.x, sy: pt.y, trukket: false, salt: u.salt };
            return true;
        }
        if (u.slags === "glas") this.kortBesked("Træk en portion fra krukken hertil.");
        if (u.slags === "zoom") this.kortBesked("Luppen viser altid lige meget væske. Én prik er 0,05 M af ionen.");
        if (u.slags === "soejler") this.kortBesked("Den grå søjle er saltets koncentration. De farvede er ionernes.");
        return false;
    };

    P.flytScene = function (pt) {
        var s = this.spatel;
        if (!s) return;
        s.x = pt.x;
        s.y = pt.y;
        if (Math.hypot(pt.x - s.sx, pt.y - s.sy) > 6) s.trukket = true;
    };

    P.opScene = function (pt) {
        var s = this.spatel;
        if (!s) return;
        this.spatel = null;
        var g = this.lay.glas;
        if (!s.trukket) { this.startFlyv(s.salt); return; }
        if (pt.x >= g.ind.x0 - 10 && pt.x <= g.ind.x1 + 10 && pt.y < g.ind.bund - 10 * g.k) {
            this.slipPulver(s.salt, pt.x, Math.min(pt.y, g.ind.top - 6));
            return;
        }
        this.kortBesked("Slip portionen over glasset.");
    };

    /* ----- Panelet ------------------------------------------------------------------- */
    P.visPanel = function () {
        var g = this.glas, o = this.opg, html = "";
        var VL = K.to(g.V / 1000);
        o.salte.forEach(function (s) {
            var st = D.salt(s);
            html += '<div class="regn-linje">c(' + NK.html(st.formel) + ") = n / V = " + K.to(g.n[s]) + " mol / " + VL + " L = <b>" +
                K.to(g.cSalt(s)) + " M</b></div>";
        });
        g.ionListe().forEach(function (id) {
            var dele = [];
            o.salte.forEach(function (s) {
                var k = K.k(D.salt(s), id);
                if (k) dele.push((k > 1 ? k + " · " : "") + K.to(g.cSalt(s)) + " M");
            });
            var ion = D.ion(id).t;
            var midt = dele.length > 1 || /·/.test(dele[0]) ? dele.join(" + ") + " = " : "";
            html += '<div class="regn-linje ion"><span class="prik" style="background:' + D.ion(id).farve + '"></span>[' + NK.html(ion) + "] = " +
                midt + "<b>" + K.to(g.ion(id)) + " M</b></div>";
        });
        NK.saetHTML("opl-regn", html);
        NK.saetHTML("opl-skema", o.salte.map(function (s) { return NK.html(K.skema(D.salt(s))); }).join("<br>"));
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.07, 16, 44));
        var colB = Math.round(NK.klamp(W * 0.36, 210, 400));
        var colX = W - colB - 14;
        var zr = Math.round(NK.klamp(Math.min(colB * 0.3, Hs * 0.15), 46, 105));
        lay.zoom = { x: colX + colB / 2, y: 16 + 24 + zr, r: zr };
        var sy = lay.zoom.y + zr + 66;
        lay.soejler = { x: colX, y: sy, b: colB, h: Math.max(130, lay.bordY - 8 - sy) };
        var venstreB = colX - 24;
        var nK = this.opg ? this.opg.salte.length : 1;
        var gh = Math.min(lay.bordY - 34, (venstreB - 30) / (0.8 + 0.34 * nK) / 1.02);
        gh = Math.max(140, Math.min(gh, 460));
        var krH = gh * 0.42, krB = Tg.krukkeBredde(krH);
        lay.krukker = [];
        var x = 18;
        (this.opg ? this.opg.salte : ["NaCl"]).forEach(function (s) {
            lay.krukker.push({ salt: s, cx: x + krB / 2, x: x, y: lay.bordY - krH, b: krB, h: krH });
            x += krB + 14;
        });
        var gx = Math.max(x + 10, (x + venstreB - gh * 0.8) / 2);
        lay.glas = Tg.glas1Geo(gx, lay.bordY, gh);
        lay.lup = { x: lay.glas.cx + 20 * lay.glas.k, y: lay.glas.ind.bund - 60 * lay.glas.k };
        this.lay = lay;
        var gg = lay.glas;
        this.saetAnker("glas", gg.x, gg.y0, gg.b, gg.h);
        this.saetAnker("krukke", lay.krukker[0].x, lay.krukker[0].y, x - 18, krH);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 30, 2 * zr, 2 * zr + 90);
        this.saetAnker("soejler", lay.soejler.x, lay.soejler.y, lay.soejler.b, lay.soejler.h);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Opdater ----------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var lay = this.lay;
        if (!lay) return;
        var g = lay.glas, mig = this;
        this.koerAuto();
        if (this.flyv) {
            var f = this.flyv;
            f.t += dt / 0.7;
            if (f.t >= 1) { this.flyv = null; this.slipPulver(f.salt, f.x1, f.y1 + 6); }
        }
        var nyt = [];
        this.fald.forEach(function (p) {
            p.vy += 1400 * dt;
            p.y += p.vy * dt;
            if (p.y >= g.yV(mig.glas.V / 1000)) mig.landet(p);
            else nyt.push(p);
        });
        this.fald = nyt;
        this.skyer.forEach(function (s) { s.r += 70 * g.k * dt; s.a -= 0.55 * dt; });
        this.skyer = this.skyer.filter(function (s) { return s.a > 0; });
        /* Soejlerne glider mod tallene */
        var vis = this.vis, gl = this.glas;
        this.opg.salte.forEach(function (s) { vis["s" + s] = NK.mod(vis["s" + s] || 0, gl.cSalt(s), 6, dt); });
        this.ioner().forEach(function (id) { vis["i" + id] = NK.mod(vis["i" + id] || 0, gl.ion(id), 6, dt); });
        this.part.saet(this.ioner().map(function (id) { return Tg.prikker(gl.ion(id)); }));
        this.part.opdater(dt);
        if (this.pegT > 0) {
            this.pegT -= dt;
            this.el.valg.classList.toggle("peg", this.pegT > 0);
        }
    };

    P.ioner = function () { return this.glas.ionListe(); };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg, mig = this;
        if (!lay) return;
        var g = lay.glas, t = this.tid;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);

        /* Glasset: farven kommer kun fra farvede salte (jern(III)chlorid) */
        var farve = Tg.vaeske(null, 0);
        o.salte.forEach(function (s) {
            var st = D.salt(s);
            if (st.opl && mig.glas.cSalt(s) > 0) farve = Tg.vaeske(st, mig.glas.cSalt(s));
        });
        Tg.glas1(ctx, g, { V: this.glas.V / 1000, farve: farve, skyer: this.skyer });

        /* Krukkerne */
        lay.krukker.forEach(function (kr) {
            var st = D.salt(kr.salt);
            var lys = mig.over && mig.over.slags === "krukke" && mig.over.salt === kr.salt ? 1 : 0;
            Tg.krukke(ctx, kr.cx, lay.bordY, kr.h, st, { lys: lys, linje3: "" });
        });
        NK.tekst(ctx, "1 portion = 0,10 mol", lay.krukker[0].x, Math.min(lay.bordY + 26, lay.Hs - 6), {
            font: Tg.font("700", NK.klamp(g.k * 15, 13, 16)), linje: "middle", farve: "#9fcdf3" });

        /* Pilen over krukken, foer der er gjort noget */
        if (!this.handlet && !this.faerdig && this.fase !== "valg" && !this.auto) {
            var kr0 = lay.krukker[0], hop = Math.sin(t * 5) * 5;
            ctx.save();
            ctx.fillStyle = "#f2c53d";
            ctx.beginPath();
            ctx.moveTo(kr0.cx, kr0.y - 14 + hop);
            ctx.lineTo(kr0.cx - 9, kr0.y - 28 + hop);
            ctx.lineTo(kr0.cx + 9, kr0.y - 28 + hop);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        /* Pulveret og spatlen */
        var sb = NK.klamp(g.h * 0.3, 70, 150);
        this.fald.forEach(function (p) { Tg.pulver(ctx, p.x, p.y, 26 * g.k, 10 * g.k, D.salt(p.salt), 2); });
        if (this.spatel) Tg.spatel(ctx, this.spatel.x, this.spatel.y, sb, -0.08, D.salt(this.spatel.salt), 1);
        if (this.flyv) {
            var f = this.flyv, u = NK.blod(f.t);
            Tg.spatel(ctx, NK.lerp(f.x0, f.x1, u), NK.lerp(f.y0, f.y1, u) - Math.sin(u * Math.PI) * 50 * g.k, sb, -0.08 + u * 0.3,
                D.salt(f.salt), 1);
        }

        /* Luppen */
        var z = lay.zoom, ioner = this.ioner();
        Tg.zoomLinje(ctx, lay.lup.x, lay.lup.y, z.x - z.r, z.y);
        var st = { ioner: ioner.map(function (id) { return D.ion(id); }) };
        Tg.zoom(ctx, z.x, z.y, z.r, { part: this.part, st: st, farve: farve, titel: "Luppen: altid lige meget væske" });
        var lk = NK.klamp(g.k * 0.45, 0.25, 0.6);
        NK.Sprites.tegn(ctx, "lup", lay.lup.x - 52 * lk, lay.lup.y - 52 * lk, 140 * lk, 140 * lk);

        /* Soejlerne: saltene graa, ionerne i deres farve, maalet stiplet */
        var s = [], vis = this.vis, maks = 0.6;
        o.salte.forEach(function (sa) {
            s.push({ navn: "c(" + D.salt(sa).formel + ")", v: vis["s" + sa] || 0, farve: "#8b93a0" });
        });
        ioner.forEach(function (id) {
            var so = { navn: "[" + D.ion(id).t + "]", v: vis["i" + id] || 0, farve: D.ion(id).farve };
            if (o.maal.ion === id) so.maal = o.maal.c;
            s.push(so);
            maks = Math.max(maks, mig.glas.ion(id) * 1.1, o.maal.c ? o.maal.c * 1.2 : 0);
        });
        maks = Math.ceil(maks / 0.2) * 0.2;
        Tg.soejler(ctx, lay.soejler, s, maks);

        this.k.tegn(ctx);
    };

    NK.SimOpl = SimOpl;
}());
