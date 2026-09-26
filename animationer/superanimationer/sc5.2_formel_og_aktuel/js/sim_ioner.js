/* =====================================================================
   sim_ioner.js - fane 2: ionerne

   Fra den formelle koncentration til ionernes, i tre niveauer (som i
   den gamle c5.4). Eleven skriver foerst tallene foran ionerne i
   opløsningsskemaet og saa ionernes koncentrationer. Middel er
   halvdelen af gangene baglæns: en ions koncentration er maalt, og
   saltets og den anden ions skal findes. Svær starter fra massen.

   Scenen: flasken med etiketten, soejlerne (en soejle kommer, naar
   tallet er fundet) og luppen, der fyldes med ionerne til sidst.
   Ny opgave giver et nyt salt eller nye tal paa samme niveau.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimIoner() {
        this.gang = [0, 0, 0];
        this.sidst = {};
        this.over = null;
        this.part = new NK.Partikler(17);
        this.vis = {};
        this.startFane(D.NIV);
        this.regning = new NK.Regning({ vaert: NK.el("ioner-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimIoner.prototype;
    NK.Fane.paa(P, { navn: "ioner", niveauer: true });
    NK.Regning.paa(P);

    P.harNyeTal = function () { return false; };
    P.harForfra = function () { return false; };

    /* ----- Opgaven --------------------------------------------------------------- */
    P.lavOpgave = function (i, ny) {
        var niv = D.NIV[i], nr = this.gang[i], o = { fane: 2, niv: niv.id };
        if (ny) nr = ++this.gang[i];
        if (niv.id === "let" || (niv.id === "middel" && nr % 2 === 0)) {
            var fast = nr === 0 ? niv.std : null;
            o.salt = fast ? fast.salt : this.traek(niv.salte, this.sidst[niv.id]);
            o.c = fast ? fast.c : NK.tilfaeldig(niv.c);
            o.trin = ["afstem", "kat", "an"];
        } else if (niv.id === "middel") {
            var fb = nr === 1 ? niv.stdBag : null;
            if (fb) { o.salt = fb.salt; o.bag = fb.ion; o.ionC = fb.ionC; }
            else {
                var alle = D.NIV[0].salte.concat(niv.salte);
                o.salt = this.traek(alle, this.sidst[niv.id]);
                var st = D.salt(o.salt);
                /* Den maalte ion er helst den med et tal foran */
                o.bag = st.ka > 1 ? "an" : (st.kk > 1 ? "kat" : NK.tilfaeldig(["kat", "an"]));
                var k = o.bag === "kat" ? st.kk : st.ka;
                o.ionC = k * NK.tilfaeldig(D.NIV[1].c);
            }
            o.trin = ["afstem", "cSalt", "anden"];
        } else {
            var fs = nr === 0 ? niv.std : null;
            o.salt = fs ? fs.salt : this.traek(niv.salte, this.sidst[niv.id]);
            var st2 = D.salt(o.salt);
            if (fs) { o.m = fs.m; o.V = fs.V; }
            else {
                var n = NK.tilfaeldig(niv.n);
                o.V = NK.tilfaeldig(niv.V);
                o.m = Math.round(n * st2.Mv * 100) / 100;
            }
            o.trin = ["M", "n_mM", "c", "afstem", "kat", "an"];
        }
        this.sidst[niv.id] = o.salt;
        o.facit = K.facitIoner(o);
        this.opg = o;
        this.regning.saet(o);
        this.part = new NK.Partikler(17 + nr);
        this.vis = {};
    };

    P.promptHTML = function () {
        var o = this.opg, st = D.salt(o.salt), s;
        if (o.m !== undefined) {
            s = K.g(o.m) + " g " + st.formel + " opløses, og der fyldes op til " + K.mL(o.V) + " mL. Find ionernes koncentrationer.";
        } else if (o.bag) {
            var g = o.bag === "kat" ? st.kat : st.an, a = o.bag === "kat" ? st.an : st.kat;
            s = "I en opløsning af " + st.formel + " er [" + D.ion(g).t + "] = " + K.c(o.ionC) + " M. Find c(" + st.formel + ") og [" +
                D.ion(a).t + "].";
        } else {
            s = "En opløsning af " + st.formel + " har c(" + st.formel + ") = " + K.c(o.c) + " M. Find ionernes koncentrationer.";
        }
        return '<p class="maal-tekst">' + NK.html(s) + '</p><p class="opgave-spm">' + NK.html(st.navn) + "</p>";
    };

    P.data = function () {
        var o = this.opg, st = D.salt(o.salt);
        if (o.m !== undefined) return ["m(" + st.formel + ") = " + K.g(o.m) + " g", "V = " + K.mL(o.V) + " mL"];
        if (o.bag) return ["[" + D.ion(o.bag === "kat" ? st.kat : st.an).t + "] = " + K.c(o.ionC) + " M"];
        return ["c(" + st.formel + ") = " + K.c(o.c) + " M"];
    };

    P.slutLinje = function () {
        var o = this.opg, st = D.salt(o.salt), f = o.facit;
        return NK.html("[" + D.ion(st.kat).t + "] = " + K.c(f.kat) + " M og [" + D.ion(st.an).t + "] = " + K.c(f.an) + " M.");
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.overScene = function () { return null; };
    P.nedScene = function (pt) {
        var lay = this.lay;
        if (!lay) return false;
        var fl = lay.flaske;
        if (pt.x >= fl.x0 && pt.x <= fl.x0 + fl.b && pt.y >= fl.y0 && pt.y <= fl.y0 + fl.h) {
            this.kortBesked("Etiketten siger saltets koncentration. Ionernes skal du selv finde.");
        } else if (Math.hypot(pt.x - lay.zoom.x, pt.y - lay.zoom.y) < lay.zoom.r) {
            this.kortBesked("Ionerne kommer i luppen, når du har fundet deres koncentrationer.");
        }
        return false;
    };

    /* ----- Hvad der er kendt ------------------------------------------------------- */
    P.kendt = function (hvad) {
        var o = this.opg, r = this.regning;
        if (hvad === "c") return !o.bag && o.m === undefined ? true : (o.bag ? r.loest("cSalt") : r.loest("c"));
        var st = D.salt(o.salt), id = hvad === "kat" ? st.kat : st.an;
        if (o.bag && (o.bag === hvad)) return true;
        if (o.bag) return r.loest("anden");
        return r.loest(hvad);
        void id;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.06, 14, 40));
        var zr = Math.round(NK.klamp(Math.min(Hs * 0.13, W * 0.09), 44, 92));
        lay.zoom = { x: 16 + zr + 8, y: 16 + 24 + zr, r: zr };
        var tx = lay.zoom.x + zr + NK.klamp(W * 0.04, 24, 50);
        lay.tavle = { x: tx, y: 16, b: W - tx - 18, h: Math.round(NK.klamp(Hs * 0.42, 160, 320)) };
        var top = Math.max(lay.zoom.y + zr + 70, lay.tavle.y + lay.tavle.h + 22);
        var zone = lay.bordY - top;
        var fh = NK.klamp(zone * 0.92, 90, 210);
        lay.flaske = Tg.flaskeGeo(18 + fh * 0.34, lay.bordY, fh);
        var sx = lay.flaske.x0 + lay.flaske.b + 36;
        lay.soejler = { x: sx, y: top, b: Math.min(W - 18 - sx, 520), h: Math.max(120, lay.bordY - 8 - top) };
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("soejler", lay.soejler.x, lay.soejler.y, lay.soejler.b, lay.soejler.h);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 26, 2 * zr, 2 * zr + 60);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Opdater og tegn -------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var o = this.opg, st = D.salt(o.salt), f = o.facit, vis = this.vis;
        var mig = this;
        [["c", f.c], ["kat", f.kat], ["an", f.an]].forEach(function (p) {
            vis[p[0]] = NK.mod(vis[p[0]] || 0, mig.kendt(p[0]) ? p[1] : 0, 6, dt);
        });
        var alle = this.kendt("kat") && this.kendt("an") && this.regning.faerdig();
        this.part.saet(alle ? [Tg.prikker(f.kat), Tg.prikker(f.an)] : [0, 0]);
        this.part.opdater(dt);
        void st;
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg;
        if (!lay || !o) return;
        var st = D.salt(o.salt), f = o.facit, vis = this.vis;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        this.regning.tegnTavle(ctx, lay.tavle, this.data(), this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var ck = this.kendt("c");
        var linje2 = ck ? K.c(f.c) + " M" : (o.bag ? "[" + D.ion(o.bag === "kat" ? st.kat : st.an).t + "] " + K.c(o.ionC) + " M" : "? M");
        Tg.flaske(ctx, lay.flaske, Tg.vaeske(st, f.c), [st.formel, linje2]);
        var s = [
            { navn: "c(" + st.formel + ")", v: vis.c || 0, farve: "#8b93a0" },
            { navn: "[" + D.ion(st.kat).t + "]", v: vis.kat || 0, farve: D.ion(st.kat).farve },
            { navn: "[" + D.ion(st.an).t + "]", v: vis.an || 0, farve: D.ion(st.an).farve }
        ];
        var maks = Math.max(0.2, f.c, f.kat, f.an) * 1.15;
        maks = Math.ceil(maks / 0.1) * 0.1;
        Tg.soejler(ctx, lay.soejler, s, maks);
        var z = lay.zoom, alle = this.regning.faerdig();
        Tg.zoom(ctx, z.x, z.y, z.r, { part: this.part, st: st, farve: Tg.vaeske(st, f.c), titel: "Luppen",
            tekst: alle ? "" : "?", forklar: alle });
        this.k.tegn(ctx);
    };

    NK.SimIoner = SimIoner;
}());
