/* =====================================================================
   sim_ioner.js - fane 2: ionerne

   Fra den formelle koncentration til ionernes, i tre niveauer (som i
   den gamle c6.4). Eleven skriver foerst tallene foran ionerne i
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
        this.regning = new NK.Regning({ fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimIoner.prototype;
    /* Pladsen oeverst i scenen til papirkortet: almindelig og lav skaerm */
    /* Kortet har feltet eller svarene under spoergsmaalet (21. nov. 2026) */
    var ZONE = [206, 182];
    NK.Fane.paa(P, { navn: "ioner", niveauer: true, zone: ZONE });
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

    /* Opgavens tal foerst, saa vejen: det foerste trin staar foer det, der
       skal findes til sidst (brugerens oenske 4. okt. 2026) */
    P.promptHTML = function () {
        var o = this.opg, st = D.salt(o.salt), s, vej;
        if (o.m !== undefined) {
            s = K.g(o.m) + " g " + st.formel + " opløses, og der fyldes op til " + K.mL(o.V) + " mL.";
            vej = "Før ionernes aktuelle koncentrationer kan findes, skal c(" + st.formel + ") beregnes og opløsningsskemaet afstemmes.";
        } else if (o.bag) {
            var g = o.bag === "kat" ? st.kat : st.an, a = o.bag === "kat" ? st.an : st.kat;
            s = "I en opløsning af " + st.formel + " er [" + D.ion(g).t + "] = " + K.c(o.ionC) + " M.";
            vej = "Før c(" + st.formel + ") og [" + D.ion(a).t + "] kan findes, skal opløsningsskemaet afstemmes.";
        } else {
            s = "En opløsning af " + st.formel + " har c(" + st.formel + ") = " + K.c(o.c) + " M.";
            vej = "Før ionernes aktuelle koncentrationer kan findes, skal opløsningsskemaet afstemmes.";
        }
        return '<p class="maal-tekst">' + NK.html(s) + '</p><p class="opgave-vej">' + NK.html(vej) + "</p>";
    };

    /* Papirkortet: opgavens tal og niveauet */
    P.kortTekst = function () {
        var o = this.opg, st = D.salt(o.salt);
        var t = this.promptHTML().replace(/<\/p>/g, " ").replace(/<[^>]+>/g, "");
        var e = document.createElement("textarea");
        e.innerHTML = t;
        return e.value.replace(/\s+/g, " ").trim();
    };
    P.kortChip = function () { return D.NIV[this.nr].titel + ": " + D.salt(this.opg.salt).navn.toLowerCase(); };

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
            this.kortBesked("Etiketten viser saltets koncentration. Ionernes koncentrationer skal du selv finde.");
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

    /* ----- Layout (runde 3, 21. nov. 2026) ---------------------------------------------
       Tavlen til hoejre. Til venstre: luppen oeverst med en kegle ned i flasken,
       og flasken og soejlerne langs bordet. */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H, Hs: H };
        lay.bordY = Math.round(H - NK.klamp(H * 0.06, 14, 40));
        /* Pladsen oeverst er sat af til papirkortet (kortZone) */
        lay.zone = this.kortZone();
        var y0 = 10 + lay.zone, Hr = lay.bordY - y0;
        var tb = Math.round(NK.klamp(W * 0.34, 250, 420));
        lay.tavle = { x: W - tb - 14, y: y0, b: tb, h: lay.bordY - y0 - 8 };
        var venstre = lay.tavle.x - 22;
        var fh = NK.klamp(Hr * 0.42, 110, 230);
        var R = NK.klamp(Math.min((Hr - fh - 70) / 2, (venstre - 14) * 0.3), 50, 140);
        lay.flaske = Tg.flaskeGeo(18 + fh * 0.34, lay.bordY, fh);
        var sx = lay.flaske.x0 + lay.flaske.b + 30;
        var top = lay.flaske.y0;
        lay.soejler = { x: sx, y: Math.min(top, lay.bordY - 130), b: Math.min(venstre - sx, 520), h: lay.bordY - 8 - Math.min(top, lay.bordY - 130) };
        /* Luppen over flasken og lidt til hoejre, saa keglen gaar skraat ned i flasken */
        lay.zoom = { x: NK.klamp(lay.flaske.cx + R * 0.8, 14 + R, venstre - R), y: y0 + 26 + R, r: Math.round(R) };
        this.lay = lay;
        var f = this.opg ? this.opg.facit : null;
        this.skala = Tg.skala(f ? f.kat + f.an : 0.5, lay.zoom.r);
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("soejler", lay.soejler.x, lay.soejler.y, lay.soejler.b, lay.soejler.h);
        this.saetAnker("zoom", lay.zoom.x - R, lay.zoom.y - R - 26, 2 * R, 2 * R + 30);
    };

    /* ----- Opdater og tegn -------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var o = this.opg, st = D.salt(o.salt), f = o.facit, vis = this.vis;
        var mig = this;
        [["c", f.c], ["kat", f.kat], ["an", f.an]].forEach(function (p) {
            vis[p[0]] = NK.mod(vis[p[0]] || 0, mig.kendt(p[0]) ? p[1] : 0, 6, dt);
        });
        var alle = this.kendt("kat") && this.kendt("an") && this.regning.faerdig();
        this.part.saet(alle ? [Tg.kugler(f.kat, this.skala), Tg.kugler(f.an, this.skala)] : [0, 0]);
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
        /* Svær: massen og rumfanget staar paa etiketten (ingen "opgavens tal" paa tavlen) */
        Tg.flaske(ctx, lay.flaske, Tg.vaeske(st, f.c), o.m !== undefined ? [st.formel, K.g(o.m) + " g i " + K.mL(o.V) + " mL", linje2] : [st.formel, linje2]);
        var s = [
            { navn: "c(" + st.formel + ")", v: vis.c || 0, farve: "#8b93a0" },
            { navn: "[" + D.ion(st.kat).t + "]", v: vis.kat || 0, farve: D.ion(st.kat).farve },
            { navn: "[" + D.ion(st.an).t + "]", v: vis.an || 0, farve: D.ion(st.an).farve }
        ];
        var maks = Math.max(0.2, f.c, f.kat, f.an) * 1.15;
        maks = Math.ceil(maks / 0.1) * 0.1;
        Tg.soejler(ctx, lay.soejler, s, maks);
        /* Luppen kigger i flasken: keglen gaar fra vaesken op til luppen */
        var z = lay.zoom, alle = this.regning.faerdig(), fl = lay.flaske;
        Tg.zoomKegle(ctx, fl.cx, fl.y0 + fl.h * 0.62, z.x, z.y, z.r);
        Tg.zoom(ctx, z.x, z.y, z.r, { part: this.part, st: st, farve: Tg.vaeske(st, f.c), titel: "Luppen: opløsningen i flasken",
            tekst: alle ? "" : "?" });
    };

    NK.SimIoner = SimIoner;
}());
