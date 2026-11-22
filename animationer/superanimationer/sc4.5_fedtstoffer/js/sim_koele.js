/* =====================================================================
   sim_koele.js - fane 2: Fast eller flydende? (foer: Koeleskabet)

   Et koekken med fire steder: fryseren (-18 °C), koeleskabet (5 °C),
   koekkenbordet (20 °C) og vindueskarmen i solen (35 °C). Glassene med
   smoer, olivenolie, solsikkeolie, hoerfroeolie og kakaosmoer kommer paa
   bordet ét ad gangen, naar en opgave bruger dem. Fedtet i et glas bliver
   fast, delvist fast eller flydende (NK.Fedt.fastAndel), og vinduet over
   bordet viser molekylerne i det valgte glas (NK.Proeve): de faste ligger
   i raekker, de flydende bevaeger sig. Ved siden af vinduet staar
   varedeklarationen paa et lyst ark; dens farver er kaedernes farver, saa
   der ikke er en saerskilt forklaring af farverne (REGELSAET 45, 55).

   Runde T10 (22. nov. 2026, Niels: "Det lyder godt. Du cooker bare :)"):
     * Intet panel. Opgaverne (fire fra T10b) i raekken oeverst (js/koele_opgaver.js,
       D.OPG_KOELE i js/data.js): gaet foerst, traek saa selv glasset derhen.
     * Under et spoergsmaal kan intet traekkes (et greb faar kortet til at
       blinke). Under en handling kan kun opgavens glas traekkes, og kun
       hen til opgavens sted. Glasset har gul ramme og en boble, og stedet
       lyser gult (REGELSAET 19-21).
     * Vinduet og varedeklarationen er stiplede pladser, til de bruges
       (REGELSAET 13). Tilbuddet om praesentationen er vaek (K viser den).
     * Fri leg (og efter alle opgaverne): alle glas kan flyttes, et klik
       paa et glas viser dets molekyler, og Dit fedtstof fra fane 1 staar
       paa bordet.

   Paaskeaegget: staar smoerret i solen i 12 sekunder, gaar der tre uger.
   Smoerret bliver harskt (hydrolyse: der dannes smoersyre), og
   Kemichael kommer med nyt smoer. Det kan kun ske i den fri leg.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fedt;
    var Tg = NK.Tegn;
    var Proeve = NK.Proeve;

    var NOEGLE = "nk-sc4.6-koele";
    var N_MOL = 6;                  /* molekyler i vinduet (runde T10d: kuglemodeller paa faste pladser) */

    function SimKoele() {
        this.L = new NK.Laerred(NK.el("koele-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.overZone = null;
        /* Ingen kop paa denne fane: der er ikke plads paa bordet */
        this.g = { kaffekop: { skjult: true, iHaand: false } };
        this.synlig = {};
        this.lagAlleGlas();
        this.valgt = this.glas[0];
        this.harskVent = 0;
        this.harskTekst = 0;
        this.e = { skort: NK.el("koele-skort"), boble: NK.el("koele-boble"), dekl: NK.el("koele-dekl") };
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.opgaver = new NK.KoeleOpgaver(this, D.OPG_KOELE);
        this.opgaver.start();
    }

    var P = SimKoele.prototype;

    /* ----- Glassene -------------------------------------------------------------------- */
    P.lagAlleGlas = function () {
        var mig = this;
        this.glas = D.FEDT.map(function (f) { return mig.nytGlas(f); });
        this.glas.push(this.nytGlas(this.ditFedt()));
    };

    /* Proeven i vinduet (NK.Proeve i js/fedt.js) */
    function nyProeve(fedt, T) { return new Proeve(fedt, T, N_MOL); }

    P.nytGlas = function (fedt) {
        var gl = {
            id: fedt.id, fedt: fedt, sted: "bord", plads: 0,
            x: 0, y: 0, placeret: false, vinkel: 0, fastVis: -1, alfa: 0,
            proeve: fedt.tom ? null : nyProeve(fedt, 20),
            solTid: 0, harsk: false
        };
        gl.plads = this.hjem(gl);
        return gl;
    };

    /* Glassets faste plads paa bordet: i den raekkefoelge, de kommer frem */
    P.hjem = function (gl) {
        var i = D.BORD_ORDEN.indexOf(gl.id);
        return i < 0 ? 0 : i;
    };

    /* Fedtet fra fane 1 som et fedt paa linje med de rigtige */
    P.ditFedt = function () {
        var k = NK.ditFedt;
        if (!k) return { id: "dit", navn: "dit fedtstof", Navn: "Dit fedtstof", delt: ["Dit", "fedtstof"], tom: true, farve: "#f2cf4a", laag: "#9b6bd6" };
        var andel = { S: 0, O: 0, L: 0, Ln: 0 };
        k.forEach(function (id) { andel[id] += 100 / 3; });
        var n = F.antalDb(k);
        return {
            id: "dit", navn: "dit fedtstof", Navn: "Dit fedtstof", delt: ["Dit", "fedtstof"], kaeder: k.slice(), andel: andel,
            farve: Tg.blandHex("#f4ecd0", "#f0c63c", NK.klamp(n / 5, 0, 1)), laag: "#9b6bd6"
        };
    };

    /* Fane 1 kan have bygget et nyt fedt, siden vi var her sidst */
    P.fokus = function () {
        var nu = NK.ditFedt ? NK.ditFedt.join(",") : "";
        var gl = this.glasMedId("dit");
        var foer = gl.fedt.kaeder ? gl.fedt.kaeder.join(",") : "";
        if (nu === foer) return;
        var f = this.ditFedt();
        gl.fedt = f;
        gl.proeve = f.tom ? null : nyProeve(f, D.sted(gl.sted).T);
        gl.fastVis = -1;
        if (!f.tom && this.fri()) this.vaelg(gl);
    };

    P.glasMedId = function (id) {
        for (var i = 0; i < this.glas.length; i++) if (this.glas[i].id === id) return this.glas[i];
        return null;
    };

    P.vaelg = function (gl) {
        if (!gl || gl.fedt.tom) return;
        this.valgt = gl;
        if (gl.proeve) gl.proeve.T = D.sted(gl.sted).T;
        this.visDeklaration();
    };

    /* ----- Det, opgaverne bruger (D.OPG_KOELE) ------------------------------------ */
    /* Glassene staar, hvor opgaven siger. Glas, der ikke er naevnt, er
       ikke paa bordet endnu. Et nyt glas kommer frem paa sin plads. */
    P.scene = function (steder, valgtId) {
        var mig = this, taelle = {};
        this.traek = null;
        this.overZone = null;
        this.glas.forEach(function (gl) {
            var sted = steder[gl.id], foer = !!mig.synlig[gl.id];
            if (gl.harsk) mig.nytSmoer(gl);
            gl.solTid = 0;
            if (!sted) {
                mig.synlig[gl.id] = false;
                gl.sted = "bord";
                gl.plads = mig.hjem(gl);
                if (gl.proeve) gl.proeve.T = 20;
                return;
            }
            mig.synlig[gl.id] = true;
            gl.sted = sted;
            if (sted === "bord") gl.plads = mig.hjem(gl);
            else { gl.plads = taelle[sted] || 0; taelle[sted] = gl.plads + 1; }
            if (gl.proeve) gl.proeve.T = D.sted(sted).T;
            if (!foer) {
                gl.alfa = 0;
                gl.fastVis = -1;
                gl.vinkel = 0;
                if (mig.lay) { var p = mig.pladsPos(gl); gl.x = p.x; gl.y = p.y; gl.placeret = true; }
            }
        });
        this.vaelg(this.glasMedId(valgtId));
    };

    /* Staar glasset paa stedet (og er det sluppet og naaet frem)? */
    P.staar = function (id, sted) {
        var gl = this.glasMedId(id);
        if (!gl || gl.sted !== sted || !this.synlig[id]) return false;
        if (this.traek && this.traek.gl === gl) return false;
        if (!this.lay) return true;
        var p = this.pladsPos(gl);
        return Math.abs(gl.x - p.x) < 6 && Math.abs(gl.y - p.y) < 6;
    };

    P.flytTil = function (id, sted) {
        var gl = this.glasMedId(id);
        if (gl && gl.sted !== sted) this.flyt(gl, sted);
        this.vaelg(gl);
    };

    P.fri = function () { return !!this.opgaver && this.opgaver.erFri(); };
    P.maa = function (hvad) { return !this.opgaver || this.opgaver.tillad(hvad); };
    P.skjult = function (del) { return !!this.opgaver && this.opgaver.skjult(del); };

    /* Fri leg (eller alle opgaverne er loest): alle glas er fremme */
    P.friStart = function () {
        var mig = this;
        this.glas.forEach(function (gl) {
            if (!mig.synlig[gl.id]) {
                mig.synlig[gl.id] = true;
                gl.alfa = 0;
                gl.fastVis = -1;
                gl.sted = "bord";
                var i = mig.ledigPlads("bord", gl, mig.hjem(gl));
                gl.plads = i < 0 ? mig.hjem(gl) : i;
                if (gl.proeve) gl.proeve.T = 20;
                if (mig.lay) { var p = mig.pladsPos(gl); gl.x = p.x; gl.y = p.y; }
            }
        });
    };

    /* Alle opgaverne er loest: Kemichael roser (kun foerste gang) */
    P.alleLoest = function () {
        if (NK.hent(NOEGLE, {}).rost) return;
        NK.gem(NOEGLE, { loest: true, rost: true });
        this.ventRos = 0.8;
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    /* Kortets faste plads under raekken (REGELSAET 4): mindst D.ZONE.koele */
    P.kortZone = function () {
        var e = this.e.skort, b = D.ZONE.koele[window.innerHeight <= 720 ? 1 : 0];
        var h = e && e.offsetParent ? e.offsetHeight : 0;
        var top = e && e.offsetParent ? e.offsetTop : 46;
        return top + Math.max(b, h) + 8;
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h, lay = { W: W, H: H };
        /* Paa en stor skaerm staar koekkenet samlet i midten (REGELSAET 32) */
        var ox = Math.max(0, Math.round((W - 1560) / 2)), Wc = W - 2 * ox;
        lay.ox = ox;
        var kant = NK.klamp(Wc * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.87);
        var gh = NK.klamp(H * 0.13, 56, 86);
        lay.gh = gh;
        /* Koeleskabet staar paa gulvet til venstre */
        var zone = this.kortZone();
        lay.zone = zone;
        var fh = Math.min(H - zone - 4, Wc * 0.24 * 520 / 220);
        lay.K = Tg.koeleskabMaal(ox + kant, H - 1 - 4 * fh / 520, fh);
        var K = lay.K;
        /* Vinduet til hoejre, med karmen et stykke over bordet */
        var vb = NK.klamp(Wc * 0.19, 140, 250);
        var karmY = lay.bordY - Math.max(gh + 48, H * 0.2);
        var vs = vb / 240;
        if (karmY - 306 * vs < zone) { vs = (karmY - zone) / 306; vb = 240 * vs; }
        lay.V = Tg.vindueMaal(ox + Wc - kant - vb, karmY, vb);
        var V = lay.V;
        /* Pladserne */
        var mig = this;
        function raekke(x0, x1, y, n) {
            var ud = [], d = (x1 - x0) / n;
            for (var i = 0; i < n; i++) ud.push({ x: x0 + d * (i + 0.5), y: y });
            return ud;
        }
        lay.pladser = {
            /* Antallet af pladser staar i D.STEDER (koeleskabet har tre fra
               runde T10b; foer stod der 2 her, saa det tredje glas landede
               oven i det andet: Niels' fejl "solsikken vil gerne staa oven i
               olivenolien", T10e) */
            fryser: raekke(K.rumV + 6, K.rumH - 6, K.fryserGulv, D.sted("fryser").plads),
            koele: raekke(K.rumV + 6, K.rumH - 6, K.koeleGulv, D.sted("koele").plads),
            bord: raekke(K.x + K.b + 16, ox + Wc - kant - 8, lay.bordY, 6),
            sol: raekke(V.karmV + 16, V.karmH - 16, V.karmY, 2)
        };
        /* Glassene maa ikke vaere hoejere end rummene i skabet */
        var rum = Math.min(K.fryserGulv - K.fryserTop, K.koeleGulv - K.koeleTop) - 44;
        lay.gh = Math.min(gh, rum);
        /* Zonerne, der lyser, naar et glas holdes over dem */
        lay.zoner = {
            fryser: { x: K.rumV, y: K.fryserTop, b: K.rumH - K.rumV, h: K.fryserGulv - K.fryserTop + 8 },
            koele: { x: K.rumV, y: K.koeleTop, b: K.rumH - K.rumV, h: K.koeleGulv - K.koeleTop + 8 },
            sol: { x: V.x, y: V.top, b: V.b, h: V.karmY - V.top + 10 },
            bord: { x: K.x + K.b + 4, y: lay.bordY - lay.gh - 20, b: ox + Wc - K.x - K.b - kant, h: lay.gh + 34 }
        };
        /* Vinduet med molekylerne og varedeklarationen samlet over bordet,
           mellem skabet og vinduet. Er der ikke plads ved siden af, staar
           varedeklarationen under vinduet. */
        var zx0 = K.x + K.b + 24, zx1 = V.x - 24;
        var zy0 = zone + 24, zy1 = lay.bordY - lay.gh - 34;
        var bred = zx1 - zx0, hoej = zy1 - zy0;
        var db = Math.round(NK.klamp(Wc * 0.16, 232, 252)), mel = 18;
        var zb, zh, z = {};
        /* Vinduet har proevens form (NK.Proeve.W x H, bredere end hoejt fra T10b) */
        var PW = Proeve.W, PH = Proeve.H;
        if (bred >= 220 + db + mel) {
            zb = Math.min(hoej * PW / PH, bred - db - mel, 660);
            zh = zb * PH / PW;
            var gx = zx0 + (bred - zb - mel - db) / 2;
            z = { x: Math.round(gx), y: Math.round(zy0 + (hoej - zh) / 2), b: Math.round(zb), h: Math.round(zh) };
            lay.dekl = { x: z.x + z.b + mel, y: z.y, b: db, under: false };
        } else {
            var dh = 58;
            zb = Math.min((hoej - dh - 10) * PW / PH, bred);
            zh = zb * PH / PW;
            z = { x: Math.round(zx0 + (bred - zb) / 2), y: Math.round(zy0 + (hoej - dh - 10 - zh) / 2), b: Math.round(zb), h: Math.round(zh) };
            lay.dekl = { x: z.x, y: z.y + z.h + 10, b: z.b, under: true };
        }
        lay.zoom = z;
        lay.kop = { x: -200, y: lay.bordY };
        this.lay = lay;
        this.glas.forEach(function (gl) { if (!gl.placeret) { var p = mig.pladsPos(gl); gl.x = p.x; gl.y = p.y; gl.placeret = true; } });
        this.saetAnker("koele-anker-skab", K.x, K.top, K.b, K.h);
        this.saetAnker("koele-anker-vindue", V.x, V.top, V.b, V.karmY - V.top + 12);
        this.saetAnker("koele-anker-zoom", z.x, z.y - 24, z.b, z.h + 30);
        this.saetAnker("koele-anker-bord", K.x + K.b + 8, lay.bordY - lay.gh - 10, ox + Wc - K.x - K.b - kant - 8, lay.gh + 44);
        this.placerDekl();
        if (this.opgaver) this.opgaver.visRaekke();
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.placerDekl = function () {
        var d = this.lay.dekl, e = this.e.dekl;
        e.style.left = Math.round(d.x) + "px";
        e.style.top = Math.round(d.y) + "px";
        e.style.width = Math.round(d.b) + "px";
        /* Arket er saa hoejt som teksten; den stiplede plads har samme hoejde */
        e.style.minHeight = d.under ? "" : "168px";
        e.classList.toggle("vandret", !!d.under);
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay || this.lay.zone !== this.kortZone()) {
            this.layout();
            var mig = this;
            this.glas.forEach(function (gl) { var p = mig.pladsPos(gl); gl.x = p.x; gl.y = p.y; });
        }
    };

    P.pladsPos = function (gl) {
        var r = this.lay.pladser[gl.sted];
        return r[Math.min(gl.plads, r.length - 1)];
    };

    P.glasMaal = function (gl) {
        return Tg.glasMaal(gl.x, gl.y, this.lay.gh);
    };

    /* ----- At flytte glas ------------------------------------------------------------------ */
    /* Den foerste ledige plads (helst oenske) blandt de synlige glas */
    P.ledigPlads = function (sted, undtagen, oenske) {
        var mig = this, n = D.sted(sted).plads, optaget = [];
        this.glas.forEach(function (g) { if (g !== undtagen && mig.synlig[g.id] && g.sted === sted) optaget.push(g.plads); });
        if (oenske !== undefined && oenske < n && optaget.indexOf(oenske) < 0) return oenske;
        for (var i = 0; i < n; i++) if (optaget.indexOf(i) < 0) return i;
        return -1;
    };

    /* Saet glasset et sted. Er der fuldt, bytter det plads med det
       glas, der staar naermest. */
    P.flyt = function (gl, sted, x) {
        var mig = this, fraSted = gl.sted, fraPlads = gl.plads;
        var i = this.ledigPlads(sted, gl, sted === "bord" ? this.hjem(gl) : undefined);
        if (i < 0) {
            var bedst = null;
            this.glas.forEach(function (g) {
                if (g === gl || !mig.synlig[g.id] || g.sted !== sted) return;
                var d = Math.abs(mig.pladsPos(g).x - (x === undefined ? 0 : x));
                if (!bedst || d < bedst.d) bedst = { g: g, d: d };
            });
            var anden = bedst.g;
            i = anden.plads;
            anden.sted = fraSted;
            anden.plads = fraPlads;
            anden.solTid = 0;
            if (anden.proeve) anden.proeve.T = D.sted(fraSted).T;
        }
        gl.sted = sted;
        gl.plads = i;
        if (sted !== "sol") gl.solTid = 0;
        if (gl.proeve) gl.proeve.T = D.sted(sted).T;
        this.vaelg(gl);
    };

    /* ----- Knapper og taster -------------------------------------------------------------- */
    P.nulstil = function () { this.opgaver.forfra(); };
    P.enter = function () { this.opgaver.enter(); };

    P.tast = function (tast) {
        if (tast === "p" || tast === "P") {
            if (this.valgt && this.valgt.proeve) this.valgt.proeve.pause = !this.valgt.proeve.pause;
            return true;
        }
        return false;
    };

    /* ----- Paaskeaegget ------------------------------------------------------------------------ */
    P.bliverHarsk = function (gl) {
        gl.harsk = true;
        gl.proeve.bliverHarsk();
        this.harskTekst = 3.2;
        this.vaelg(gl);
        this.opgaver.friBesked("Tre uger senere. Vand har spaltet noget af fedtet, og der er dannet smørsyre. Smørret er harskt.");
        if (this.laererHarsk) this.laererHarsk(gl);
        else this.harskVent = 4;
    };

    /* Kemichael (eller tiden) skifter det harske smoer ud med nyt */
    P.nytSmoer = function (gl) {
        gl = gl || this.glasMedId("smoer");
        gl.harsk = false;
        gl.solTid = 0;
        gl.proeve = nyProeve(gl.fedt, 20);
        gl.fastVis = -1;
        var i = this.ledigPlads("bord", gl, this.hjem(gl));
        gl.sted = "bord";
        gl.plads = i < 0 ? this.hjem(gl) : i;
        this.vaelg(gl);
    };

    /* ----- Varedeklarationen paa det lyse ark ---------------------------------------------- */
    /* En lille zigzag-kaede med 0, 1 eller 2 dobbeltbindinger (svg), tegnet
       som kaederne i vinduet: lys kaede og turkise dobbeltbindinger (T10c) */
    function kaedeSvg(antalDb) {
        var dbVed = antalDb === 0 ? [] : (antalDb === 1 ? [3] : [2, 5]);
        var x = 2, y = 13, ret = 0, op = true, L = 5, pkt = [{ x: x, y: y }];
        for (var i = 0; i < 8; i++) {
            var v = ret + (op ? -0.52 : 0.52);
            x += L * Math.cos(v);
            y += L * Math.sin(v);
            pkt.push({ x: x, y: y });
            op = !op;
            if (dbVed.indexOf(i) >= 0) ret += 0.45;
        }
        function linje(a, b, farve, b2) {
            return '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) +
                '" stroke="' + farve + '" stroke-width="' + b2 + '" stroke-linecap="round"/>';
        }
        var h = '<svg class="dekl-kaede" viewBox="0 0 44 26" aria-hidden="true">';
        for (var k = 0; k < pkt.length - 1; k++) {
            var erDb = dbVed.indexOf(k) >= 0;
            h += linje(pkt[k], pkt[k + 1], erDb ? Tg.DB_FARVE : "#5d6474", erDb ? 2.4 : 1.8);
            if (erDb) {
                var a = pkt[k], c = pkt[k + 1], dx = c.x - a.x, dy = c.y - a.y, l = Math.sqrt(dx * dx + dy * dy);
                var nx = -dy / l * 2.6, ny = dx / l * 2.6;
                h += linje({ x: a.x + dx * 0.15 + nx, y: a.y + dy * 0.15 + ny }, { x: c.x - dx * 0.15 + nx, y: c.y - dy * 0.15 + ny }, Tg.DB_FARVE, 2.4);
            }
        }
        return h + "</svg>";
    }

    P.visDeklaration = function () {
        var gl = this.valgt, e = this.e.dekl;
        if (!gl || !e) return;
        var f = gl.fedt, h;
        if (f.tom) h = '<p class="dekl-tom">Byg et fedtstof på fane 1.</p>';
        else {
            var t = D.typer(f.andel);
            var rk = [
                { navn: "Mættede", v: t.maettede, svg: kaedeSvg(0) },
                { navn: "Monoumættede", v: t.enkelt, svg: kaedeSvg(1) },
                { navn: "Polyumættede", v: t.fler, svg: kaedeSvg(2) }
            ];
            h = '<p class="dekl-titel">Varedeklaration</p><p class="dekl-navn">Fedtsyrer i ' + NK.html(f.navn) + "</p>" +
                rk.map(function (r) {
                    return '<div class="dekl-raekke">' + r.svg + '<span class="dekl-type">' + r.navn + '</span><span class="dekl-tal">' +
                        Math.round(r.v) + " %</span></div>";
                }).join("");
            if (f.kaeder) h += '<div class="dekl-raekke dekl-smp"><span class="dekl-type">Smeltepunkt</span><span class="dekl-tal">' +
                NK.html(F.smpTekst(f.kaeder)) + "</span></div>";
        }
        h += '<p class="dekl-plads-tekst">Varedeklarationen</p>';
        if (this._deklSidst !== h) { e.innerHTML = h; this._deklSidst = h; }
    };

    P.fastMaal = function (gl) {
        if (gl.fedt.tom) return 0;
        return F.fastAndel(gl.fedt, D.sted(gl.sted).T);
    };

    /* ----- Tegneloekken ---------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        this.glas.forEach(function (gl) {
            gl.alfa = NK.mod(gl.alfa, mig.synlig[gl.id] ? 1 : 0, 5, dt);
            if (mig.traek && mig.traek.gl === gl && mig.traek.flyttet) {
                gl.vinkel = NK.mod(gl.vinkel, NK.klamp(mig.traek.vx * 0.0012, -0.35, 0.35), 8, dt);
            } else {
                var p = mig.pladsPos(gl);
                gl.x = NK.mod(gl.x, p.x, 7, dt);
                gl.y = NK.mod(gl.y, p.y, 7, dt);
                gl.vinkel = NK.mod(gl.vinkel, 0, 6, dt);
            }
            /* Fedtet smelter eller stivner i loebet af et sekund eller to */
            var maal = mig.fastMaal(gl);
            gl.fastVis = gl.fastVis < 0 ? maal : NK.mod(gl.fastVis, maal, 1.6, dt);
            /* Smoerret i solen (paaskeaegget, kun i den fri leg) */
            if (gl.id === "smoer" && gl.sted === "sol" && !gl.harsk && mig.fri() && !(mig.traek && mig.traek.gl === gl)) {
                gl.solTid += dt;
                if (gl.solTid >= D.HARSK_TID) mig.bliverHarsk(gl);
            }
        });
        if (this.traek) this.traek.vx *= Math.exp(-dt * 6);
        if (this.valgt && this.valgt.proeve) this.valgt.proeve.opdater(dt);
        if (this.harskTekst > 0) this.harskTekst -= dt;
        if (this.harskVent > 0) {
            this.harskVent -= dt;
            if (this.harskVent <= 0) this.nytSmoer();
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        this.opgaver.opdater(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Handlingen, kortet beder om lige nu (glas og sted), eller null */
    P.handling = function () {
        var t = this.opgaver.trin();
        if (!t || t.type !== "handling" || this.opgaver.tilstand !== "trin") return null;
        return t;
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, K = lay.K, V = lay.V, tr = this.traek;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.bord(ctx, K.x + K.b - 6, lay.W, lay.bordY, lay.H + 10);
        Tg.vindue(ctx, V, this.tid);
        Tg.koeleskab(ctx, K);

        /* Stedet, handlingen gaar ud paa, lyser hele tiden; ellers lyser
           det sted, et glas holdes over */
        var h = this.handling(), maalSted = h && !h.maal(this) ? h.sted : null;
        var lysZ = tr && tr.flyttet ? this.overZone : null;
        if (maalSted) Tg.zone(ctx, lay.zoner[maalSted], 1, this.tid);
        else if (lysZ) Tg.zone(ctx, lay.zoner[lysZ], 1, this.tid);

        /* Skiltene ved stederne */
        var px = NK.klamp(lay.H * 0.021, 12, 14);
        function lys(id) { return lysZ === id || maalSted === id; }
        Tg.stedSkilt(ctx, (K.rumV + K.rumH) / 2, K.fryserTop + px * 1.5, D.sted("fryser"), { px: px, lys: lys("fryser") });
        Tg.stedSkilt(ctx, (K.rumV + K.rumH) / 2, K.koeleTop + px * 2.4, D.sted("koele"), { px: px, lys: lys("koele") });
        Tg.stedSkilt(ctx, (V.x + V.b / 2), V.top + px * 2.2, D.sted("sol"), { px: px, lys: lys("sol") });
        Tg.stedSkilt(ctx, K.x + K.b + 16, lay.bordY + px * 2.9 + 16, D.sted("bord"), { px: px, lys: lys("bord"), justering: "left" });

        /* Vinduet med molekylerne (en stiplet plads, til det bruges) */
        var gl = this.valgt, z = lay.zoom;
        if (this.skjult("zoom")) {
            Tg.stipletPlads(ctx, z, "Molekylerne i glasset");
        } else if (gl && gl.proeve && this.synlig[gl.id]) {
            var G = this.glasMaal(gl);
            Tg.zoomLinjer(ctx, { x: G.venstre, y: G.top, b: G.b, h: G.h }, z);
            var tilst = D.tilstand(gl.fastVis);
            Tg.zoomKasse(ctx, z, gl.proeve, {
                titel: gl.fedt.Navn + (gl.harsk ? " (harskt)" : ""),
                tilstand: tilst, T: D.sted(gl.sted).T
            });
        }
        var dk = this.skjult("dekl");
        if (this.e.dekl.classList.contains("plads") !== dk) this.e.dekl.classList.toggle("plads", dk);

        /* Glassene: det, der holdes, til sidst */
        var opf = this.opgaver.opfordring(), opfGlas = opf ? opf.el.replace(/^glas:/, "") : null;
        var puls = 0.5 + 0.5 * Math.sin(this.tid * 5), boble = null;
        this.glas.forEach(function (g) {
            if (g.alfa < 0.01 || (tr && tr.gl === g && tr.flyttet)) return;
            mig.tegnGlas(ctx, g, g.id === opfGlas ? 0.35 + 0.65 * puls : 0);
            if (g.id === opfGlas) {
                var M = mig.glasMaal(g);
                boble = { x: M.x, y: M.top - 12, tekst: opf.tekst };
            }
        });
        if (tr && tr.flyttet) this.tegnGlas(ctx, tr.gl, 0);
        this.visBoble(boble);

        /* Kaffekoppen er der ikke plads til her */
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    P.tegnGlas = function (ctx, gl, puls) {
        var G = this.glasMaal(gl), f = gl.fedt;
        var over = this.fri() && this.over && this.over.slags === "glas" && this.over.gl === gl;
        ctx.save();
        ctx.globalAlpha = NK.klamp(gl.alfa, 0, 1);
        Tg.glas(ctx, G, {
            tom: !!f.tom, fast: gl.fastVis, farve: f.farve, laag: f.laag, vinkel: gl.vinkel,
            lys: over ? 1 : (puls || (this.valgt === gl && this.fri() ? 0.25 : 0)), harsk: gl.harsk, tid: this.tid,
            alfa: f.tom ? 0.55 : 1
        });
        /* Navnet deles paa to linjer, hvis det er bredere end pladsen */
        var rk = this.lay.pladser[gl.sted] || this.lay.pladser.bord, bredde = rk.length > 1 ? rk[1].x - rk[0].x - 6 : 200;
        Tg.glasNavn(ctx, G, f.Navn, { farve: this.valgt === gl && !this.skjult("zoom") ? "#f2c53d" : undefined, bredde: bredde, delt: f.delt });
        ctx.restore();
    };

    /* Boblen med pil over det glas, eleven skal traekke (REGELSAET 20) */
    P.visBoble = function (b) {
        var e = this.e.boble;
        if (!b || !b.tekst) { if (!e.hidden) e.hidden = true; return; }
        if (e.textContent !== b.tekst) e.textContent = b.tekst;
        e.hidden = false;
        var halv = e.offsetWidth / 2 + 6, x = NK.klamp(b.x, halv, Math.max(halv, this.lay.W - halv));
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(b.y) + "px";
        e.style.setProperty("--pil", Math.round(NK.klamp(b.x - x, -halv + 14, halv - 14)) + "px");
    };

    /* ----- Musen -------------------------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        for (var i = this.glas.length - 1; i >= 0; i--) {
            var gl = this.glas[i], G = this.glasMaal(gl);
            if (!this.synlig[gl.id]) continue;
            if (pt.x >= G.venstre - 4 && pt.x <= G.venstre + G.b + 4 && pt.y >= G.top - 4 && pt.y <= G.bund + 22) return { slags: "glas", gl: gl };
        }
        var z = lay.zoom;
        if (pt.x >= z.x && pt.x <= z.x + z.b && pt.y >= z.y && pt.y <= z.y + z.h) return { slags: "zoom" };
        return null;
    };

    P.zoneVed = function (pt) {
        var Z = this.lay.zoner, raekke = ["sol", "fryser", "koele", "bord"];
        for (var i = 0; i < raekke.length; i++) {
            var r = Z[raekke[i]], m = 14;
            if (pt.x >= r.x - m && pt.x <= r.x + r.b + m && pt.y >= r.y - m && pt.y <= r.y + r.h + m) return raekke[i];
        }
        return null;
    };

    /* En kort besked i den fri leg om glasset */
    P.omGlasset = function (gl) {
        var st = D.sted(gl.sted);
        return gl.fedt.Navn + " " + st.i + " ved " + D.gradTekst(st.T) + " er " + D.TILSTANDE[D.tilstand(this.fastMaal(gl))].navn + ".";
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); return; }
            if (u.slags === "zoom") {
                if (mig.fri()) mig.opgaver.friBesked("Hver kæde er en fedtsyre i sin farve. Molekylerne i fast fedt ligger stille i rækker, og molekylerne i flydende fedt bevæger sig.");
                return;
            }
            if (u.slags === "glas") {
                var hvad = "glas:" + u.gl.id;
                /* Under et spoergsmaal er scenen laast: kortet blinker */
                if (!mig.maa(hvad)) { mig.opgaver.spaer(); return; }
                mig.traek = { gl: u.gl, x0: pt.x, y0: pt.y, dx: u.gl.x - pt.x, dy: u.gl.y - pt.y, flyttet: false, vx: 0, px: pt.x };
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
            }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                if (!tr.flyttet && Math.abs(pt.x - tr.x0) + Math.abs(pt.y - tr.y0) > 6) {
                    tr.flyttet = true;
                    /* Boblen forsvinder ved foerste traek (REGELSAET 19) */
                    if (!mig.fri()) mig.opgaver.brug("glas:" + tr.gl.id);
                }
                if (tr.flyttet) {
                    tr.vx = tr.vx * 0.6 + (pt.x - tr.px) * 30 * 0.4;
                    tr.px = pt.x;
                    tr.gl.x = pt.x + tr.dx;
                    tr.gl.y = pt.y + tr.dy;
                    mig.overZone = mig.zoneVed(pt);
                }
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags, kan = false;
            if (s === "glas") kan = mig.maa("glas:" + mig.over.gl.id);
            c.style.cursor = s === "glas" && kan ? "grab" : (s === "laerer" || (s === "zoom" && mig.fri()) ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        function slip() {
            var tr = mig.traek;
            if (!tr) return;
            mig.traek = null;
            var gl = tr.gl, zone = mig.overZone;
            mig.overZone = null;
            if (!tr.flyttet) {
                if (!mig.fri()) return;
                if (gl.fedt.tom) { mig.opgaver.friBesked("Glasset er tomt. Byg et fedtstof på fane 1, så står det her."); return; }
                mig.vaelg(gl);
                mig.opgaver.friBesked(mig.omGlasset(gl) + " Vinduet viser molekylerne.");
                return;
            }
            if (mig.fri()) {
                if (zone) {
                    mig.flyt(gl, zone, gl.x);
                    if (!gl.fedt.tom) mig.opgaver.friBesked(mig.omGlasset(gl));
                }
                return;
            }
            /* I en opgave kan glasset kun saettes paa opgavens sted. Ellers
               glider det tilbage, og boblen kommer igen. */
            var h = mig.handling();
            if (h && zone === h.sted && gl.id === h.glas) mig.flyt(gl, zone, gl.x);
            else if (h) delete mig.opgaver.brugt[h.el];
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc4.6-intro-koele", tilbud: "koele-tilbud" });
    /* Intet tilbud paa fane 2 (22. nov. 2026, T10): kun K viser praesentationen */
    P.startIntro = function (tving) {
        if (!this.laererIntro || !tving) return;
        NK.gem("nk-sc4.6-intro-koele", true);
        if (!(this.laererIIntro && this.laererIIntro())) this.introVent = 0.1;
    };

    NK.SimKoele = SimKoele;
}());
