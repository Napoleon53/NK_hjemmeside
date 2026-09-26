/* =====================================================================
   tegnebraet.js - tavlen, man tegner molekyler paa

   Den samme tavle bruges paa tegnebraettet og paa quizfanerne i sc6.2. Reglerne afgoer, hvad man
   maa: paa opgavefanerne kun C og et bestemt antal atomer, paa
   tegnebraettet alle grundstoffer, ringe og tripelbindinger.

   Saadan tegner man (som i de gamle 6.2-6.4):
     traek fra et atom      kaeden bygges, mens man traekker, og knaekker
                            af sig selv (120 grader), saa den aldrig er lige
     klik paa et atom       et nyt C-atom: for enden fortsaetter zigzaggen,
                            saa man ogsaa kan bygge en kaede med klik. Er et
                            andet grundstof valgt (tegnebraettet), bliver
                            atomet til det grundstof
     klik paa en binding    enkelt -> dobbelt (-> tripel) -> enkelt
     hoejreklik             sletter et atom, en binding eller en pil. Et
                            langt tryk paa en skaerm goer det samme
     Shift + traek          flytter et atom (tegnebraettet)
     Ctrl+Z, Ctrl+Y         fortryd og gentag

   Paa tegnebraettet desuden (regler.udsnit):
     traek i tom tavle      flytter udsnittet (tavlen er stoerre end skaermen)
     zoomTil, zoomVed       zoom ind og ud; tilpasTil viser en kasse
     vaerktoejet "marker"   klik paa et molekyle markerer hele molekylet,
                            Shift tilfoejer, traek i tom tavle trækker en
                            ramme om flere; traek i det markerede flytter
                            det, sletValgte sletter det; hoejreklik gaar
                            tilbage til at tegne med C (tilTegn)
     paenTegning, spejlvend  det markerede (eller alt) tegnet som i bogen,
                            spejlet vandret
     kopier, klip, indsaet  kopi af det markerede (kun paa siden)
     "gruppe:COOH" osv.     klik paa et atom saetter gruppen paa (GRUPPER:
                            OH, O (=O), NH2, CHO, COOH, COO (COO⁻))
     "ladning"              klik paa et atom: ingen ladning -> - -> +
                            (hoejreklik med en gruppe eller ladning gaar
                            ogsaa tilbage til C, som i Markér)

   Et C uden bindinger, som eleven har sat (startatomet eller et klik paa
   tom tavle), er et startpunkt (a.start): det tegnes som et haandtag med
   en lille animation, der viser, at man traekker derfra.

   Pile og plus (tegnebraettet) er objekter ved siden af molekylet:
   { id, type: "pil"|"lig"|"plus", x, y, over, under }. De saettes med
   vaerktoejet "pil", "lig" eller "plus", flyttes ved at traekke i dem og
   er med i fortryd.

   Molekylets koordinater er i bindingslaengder. Med zoom 1 og centrum
   (0, 0) staar (0, 0) midt i feltet, saa tegningen foelger med, naar
   vinduet aendrer stoerrelse. Quizfanerne i sc6.2 roerer aldrig udsnittet.

   valg:
     felt()        { x, y, b, h } i pixels: hvor man maa tegne
     skala()       pixels pr. bindingslaengde (ved zoom 1)
     regler        { kunC, ringe, tripel, dobbelt, enDobbelt, knaek,
                     sletAlt, flyt, udsnit, maks() }
     aendret(hvad) kaldes efter hver aendring
     toast(tekst, slags)  en kort besked oeverst paa scenen, null skjuler
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Mol = NK.Molekyle;
    var GRAD = Math.PI / 180;
    var TRIN = 30 * GRAD;

    function Tegnebraet(valg) {
        this.v = valg;
        this.r = valg.regler || {};
        this.mol = new Mol();
        this.hist = [];
        this.frem = [];
        this.mus = null;
        this.over = null;
        this.traek = null;
        this.spoegelse = null;
        this.grundstof = "C";
        this.vaerktoej = "tegn";
        this.stil = "zigzag";
        this.laast = false;
        this.atomFarve = null;
        this.bindingFarve = null;
        this.lokanter = null;
        this.visC = null;
        /* Pile og plus paa tegnebraettet: { id, type: "pil"|"lig"|"plus", x, y, over, under } */
        this.objekter = [];
        this.valgtObj = null;
        this.objId = 1;
        /* Udsnittet: zoom og det punkt (i bindingslaengder), der staar midt i feltet */
        this.zoom = 1;
        this.centrum = { x: 0, y: 0 };
        /* Markeringen (vaerktoejet "marker"): atomernes og objekternes id */
        this.valgte = { a: {}, o: {} };
        this.ramme = null;
    }

    var P = Tegnebraet.prototype;

    /* ----- Koordinater ------------------------------------------------------- */
    P.midte = function () {
        var f = this.v.felt();
        return { x: f.x + f.b / 2, y: f.y + f.h / 2 };
    };

    /* Pixels pr. bindingslaengde, med zoom */
    P.s = function () { return this.v.skala() * this.zoom; };

    P.px = function (a) {
        if (typeof a === "number") a = this.mol.atom(a);
        var m = this.midte(), s = this.s(), c = this.centrum;
        return { x: m.x + (a.x - c.x) * s, y: m.y + (a.y - c.y) * s };
    };

    P.enheder = function (pt) {
        var m = this.midte(), s = this.s(), c = this.centrum;
        return { x: (pt.x - m.x) / s + c.x, y: (pt.y - m.y) / s + c.y };
    };

    /* Hvor tavlens (0, 0) staar i pixels */
    P.origo = function () { return this.px({ x: 0, y: 0 }); };

    /* ----- Udsnittet: zoom og flyt ------------------------------------------------ */
    var ZOOM_MIN = 0.3, ZOOM_MAKS = 2.5;

    /* Zoom til z, saa punktet pt (pixels, standard: feltets midte) bliver staaende */
    P.zoomTil = function (z, pt) {
        z = NK.klamp(z, ZOOM_MIN, ZOOM_MAKS);
        var p = pt || this.midte(), u = this.enheder(p);
        this.zoom = z;
        var m = this.midte(), s = this.s();
        this.centrum = { x: u.x - (p.x - m.x) / s, y: u.y - (p.y - m.y) / s };
    };

    P.zoomVed = function (faktor, pt) { this.zoomTil(this.zoom * faktor, pt); };

    /* Flyt udsnittet (dx, dy) pixels: tegningen foelger musen */
    P.flytUdsnit = function (dx, dy) {
        var s = this.s();
        this.centrum = { x: this.centrum.x - dx / s, y: this.centrum.y - dy / s };
    };

    /* Vis kassen { x0, y0, x1, y1 } (bindingslaengder) i feltet. maksZoom:
       hoejst saa meget zoom (standard 1, den normale stoerrelse) */
    P.tilpasTil = function (k, maksZoom) {
        var f = this.v.felt(), s0 = this.v.skala();
        var b = Math.max(0.5, k.x1 - k.x0), h = Math.max(0.5, k.y1 - k.y0);
        this.zoom = NK.klamp(Math.min((f.b - 24) / (b * s0), (f.h - 24) / (h * s0), maksZoom || 1), ZOOM_MIN, ZOOM_MAKS);
        this.centrum = { x: (k.x0 + k.x1) / 2, y: (k.y0 + k.y1) / 2 };
    };

    /* Er kassen helt inde i feltet? */
    P.synlig = function (k) {
        var f = this.v.felt(), a = this.px({ x: k.x0, y: k.y0 }), b = this.px({ x: k.x1, y: k.y1 });
        return a.x >= f.x && a.y >= f.y && b.x <= f.x + f.b && b.y <= f.y + f.h;
    };

    P.nulstilUdsnit = function () { this.zoom = 1; this.centrum = { x: 0, y: 0 }; };

    P.iFelt = function (u) {
        var f = this.v.felt(), p = this.px(u), s = this.s(), k = s * 0.3;
        return p.x >= f.x + k && p.x <= f.x + f.b - k && p.y >= f.y + k && p.y <= f.y + f.h - k;
    };

    P.maks = function () { return this.r.maks ? this.r.maks() : 80; };

    /* ----- Historik ------------------------------------------------------------
       Et oejebliksbillede er molekylet og pilene. */
    P.billede = function () {
        return { m: this.mol.tilData(), o: JSON.parse(JSON.stringify(this.objekter)) };
    };

    P.gendan = function (b) {
        this.mol = Mol.fraData(b.m || b);
        this.objekter = b.o || [];
        var mig = this;
        if (this.valgtObj && !this.objekter.some(function (o) { return o.id === mig.valgtObj.id; })) this.valgtObj = null;
        else if (this.valgtObj) this.valgtObj = this.objekter.filter(function (o) { return o.id === mig.valgtObj.id; })[0];
        this.objekter.forEach(function (o) { mig.objId = Math.max(mig.objId, o.id + 1); });
        this.renValg();
    };

    /* ----- Markeringen (vaerktoejet "marker") ------------------------------------------
       Et klik paa et atom eller en binding markerer hele molekylet; Shift
       tilfoejer eller fjerner. En ramme om flere markerer det, der er inde i
       den. Det markerede flyttes ved at traekke i det og slettes med Delete. */
    P.harValgte = function () { return Object.keys(this.valgte.a).length + Object.keys(this.valgte.o).length > 0; };

    P.rydValg = function () { this.valgte = { a: {}, o: {} }; };

    /* Kun det, der stadig findes (efter fortryd eller sletning) */
    P.renValg = function () {
        var mig = this, a = {}, o = {};
        this.mol.atomer.forEach(function (x) { if (mig.valgte.a[x.id]) a[x.id] = true; });
        this.objekter.forEach(function (x) { if (mig.valgte.o[x.id]) o[x.id] = true; });
        this.valgte = { a: a, o: o };
    };

    P.fragmentMed = function (id) {
        var fr = this.mol.fragmenter();
        for (var i = 0; i < fr.length; i++) if (fr[i].indexOf(id) >= 0) return fr[i];
        return [id];
    };

    P.vaelgFragment = function (id, skift) {
        var mig = this, fr = this.fragmentMed(id);
        var alle = fr.every(function (x) { return mig.valgte.a[x]; });
        fr.forEach(function (x) { if (skift && alle) delete mig.valgte.a[x]; else mig.valgte.a[x] = true; });
    };

    P.vaelgObjekt = function (o, skift) {
        if (skift && this.valgte.o[o.id]) delete this.valgte.o[o.id];
        else this.valgte.o[o.id] = true;
    };

    P.vaelgAlt = function () {
        var mig = this;
        this.rydValg();
        this.mol.atomer.forEach(function (a) { if (!(a.start && !mig.mol.grad(a.id))) mig.valgte.a[a.id] = true; });
        this.objekter.forEach(function (o) { mig.valgte.o[o.id] = true; });
    };

    /* Alt inde i kassen k (bindingslaengder) */
    P.vaelgRamme = function (k, skift) {
        var mig = this;
        if (!skift) this.rydValg();
        this.mol.atomer.forEach(function (a) {
            if (a.x >= k.x0 && a.x <= k.x1 && a.y >= k.y0 && a.y <= k.y1) mig.valgte.a[a.id] = true;
        });
        this.objekter.forEach(function (o) {
            if (o.x >= k.x0 && o.x <= k.x1 && o.y >= k.y0 && o.y <= k.y1) mig.valgte.o[o.id] = true;
        });
    };

    P.flytValgte = function (dx, dy) {
        var mig = this;
        this.mol.atomer.forEach(function (a) { if (mig.valgte.a[a.id]) { a.x += dx; a.y += dy; } });
        this.objekter.forEach(function (o) { if (mig.valgte.o[o.id]) { o.x += dx; o.y += dy; } });
    };

    P.sletValgte = function () {
        if (!this.harValgte()) return false;
        var mig = this;
        this.gem();
        Object.keys(this.valgte.a).forEach(function (k) { mig.mol.fjernAtom(+k); });
        this.objekter = this.objekter.filter(function (o) { return !mig.valgte.o[o.id]; });
        if (this.valgtObj && this.valgte.o[this.valgtObj.id]) this.valgtObj = null;
        this.rydValg();
        this.efter("slet");
        return true;
    };

    /* ----- Pæn tegning, spejlvend, kopiér og indsæt (tegnebraettet) ------------------ */

    /* De molekyler (fragmenter), der er markeret, eller alle, naar intet er */
    P.valgteMolekyler = function () {
        var mig = this, alle = !Object.keys(this.valgte.a).length;
        return this.mol.fragmenter().filter(function (f) {
            return f.length > 1 && (alle || f.some(function (id) { return mig.valgte.a[id]; }));
        });
    };

    /* De dobbeltbindinger i kaeden, der er tegnet som cis: par af atomernes id */
    function cisPar(mol, kaede) {
        var ud = [];
        if (!kaede) return ud;
        function kryds(p, q, r) { return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x); }
        for (var l = 1; l + 1 < kaede.length; l++) {
            var bd = mol.binding(kaede[l - 1], kaede[l]);
            if (!bd || bd.orden !== 2 || l < 2) continue;
            var A = mol.atom(kaede[l - 2]), B = mol.atom(kaede[l - 1]), C = mol.atom(kaede[l]), D = mol.atom(kaede[l + 1]);
            if (kryds(B, C, A) * kryds(B, C, D) > 0) ud.push([B.id, C.id]);
        }
        return ud;
    }

    /* Molekylet tegnes forfra som i bogen (zigzag, sidegrupperne ud i det
       frie rum), med midten samme sted som foer. cis og trans bliver, som de
       var tegnet. Et molekyle, der ikke kan faa et navn, faar kaeden lagt
       ud, hvis det ikke har ringe. */
    P.paenTegning = function () {
        var mig = this, mol = this.mol, gemt = false;
        this.valgteMolekyler().forEach(function (f) {
            var d = mol.del(f), res = NK.Navn.analyser(d);
            var kaede = res.tegnekaede && res.tegnekaede.length ? res.tegnekaede : res.kaede;
            if (!kaede || !kaede.length) return;
            var g0 = d.graenser();
            var foerst = d.atom(kaede[0]), sidst = d.atom(kaede[kaede.length - 1]);
            var foer = sidst.x - foerst.x;
            NK.Layout.zigzag(d, res, res.ring ? null : cisPar(d, kaede));
            /* Samme retning som foer: staar syregruppen til hoejre, bliver den der */
            if (!res.ring && foer * (sidst.x - foerst.x) < 0) d.atomer.forEach(function (x) { x.x = -x.x; });
            var g1 = d.graenser();
            var dx = (g0.x0 + g0.x1) / 2 - (g1.x0 + g1.x1) / 2, dy = (g0.y0 + g0.y1) / 2 - (g1.y0 + g1.y1) / 2;
            if (!gemt) { mig.gem(); gemt = true; }
            d.atomer.forEach(function (x) {
                var a = mol.atom(x.id);
                a.x = x.x + dx;
                a.y = x.y + dy;
            });
        });
        if (gemt) this.efter("flyt");
        return gemt;
    };

    /* Det markerede spejles vandret om sin egen midte */
    P.spejlvend = function () {
        if (!this.harValgte()) return false;
        var mig = this, x0 = Infinity, x1 = -Infinity;
        function med(x) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
        this.mol.atomer.forEach(function (a) { if (mig.valgte.a[a.id]) med(a.x); });
        this.objekter.forEach(function (o) { if (mig.valgte.o[o.id]) med(o.x); });
        var m = x0 + x1;
        this.gem();
        this.mol.atomer.forEach(function (a) { if (mig.valgte.a[a.id]) a.x = m - a.x; });
        this.objekter.forEach(function (o) { if (mig.valgte.o[o.id]) o.x = m - o.x; });
        this.efter("flyt");
        return true;
    };

    /* Kopiér: det markerede huskes (kun paa siden, ikke i udklipsholderen) */
    P.kopier = function () {
        if (!this.harValgte()) return false;
        var mig = this;
        this.udklip = {
            m: this.mol.del(Object.keys(this.valgte.a).map(Number)).tilData(),
            o: JSON.parse(JSON.stringify(this.objekter.filter(function (o) { return mig.valgte.o[o.id]; }))),
            n: 0
        };
        return true;
    };

    P.klip = function () { return this.kopier() && this.sletValgte(); };

    /* Indsæt: kopien lidt skraat nedenfor (en ny kopi hver gang), markeret,
       saa den kan traekkes paa plads */
    P.indsaet = function () {
        var u = this.udklip, mig = this;
        if (!u) return false;
        var m = Mol.fraData(u.m);
        if (this.antal() + m.atomer.length > this.maks()) { this.toast(this.maksTekst(), "advar"); return false; }
        u.n++;
        var d = u.n * 0.8;
        this.gem();
        var nyt = this.mol.indsaet(m, d, d);
        this.rydValg();
        Object.keys(nyt).forEach(function (k) { mig.valgte.a[nyt[k]] = true; });
        u.o.forEach(function (o) {
            var k = JSON.parse(JSON.stringify(o));
            k.id = mig.objId++;
            k.x += d;
            k.y += d;
            mig.objekter.push(k);
            mig.valgte.o[k.id] = true;
        });
        this.vaerktoej = "marker";
        this.valgtObj = eneObjekt(this);
        this.efter("indsaet");
        return true;
    };

    /* Den eneste markerede pil (til tekstfelterne i panelet) */
    function eneObjekt(b) {
        var ao = Object.keys(b.valgte.o);
        if (ao.length !== 1 || Object.keys(b.valgte.a).length) return null;
        return b.objekter.filter(function (o) { return o.id === +ao[0]; })[0] || null;
    }

    P.gem = function () {
        this.hist.push(this.billede());
        if (this.hist.length > 80) this.hist.shift();
        this.frem = [];
    };

    P.fortryd = function () {
        if (!this.hist.length) return false;
        this.frem.push(this.billede());
        this.gendan(this.hist.pop());
        this.efter("fortryd");
        return true;
    };

    P.gentag = function () {
        if (!this.frem.length) return false;
        this.hist.push(this.billede());
        this.gendan(this.frem.pop());
        this.efter("fortryd");
        return true;
    };

    P.efter = function (hvad) {
        this.over = null;
        if (this.v.aendret) this.v.aendret(hvad);
    };

    P.toast = function (t, slags) { if (this.v.toast) this.v.toast(t, slags || "fejl"); };

    /* ----- Nulstil og saet ------------------------------------------------------ */
    P.nulstil = function (medStart, glemHistorik) {
        if (!glemHistorik && (!this.mol.tom() || this.objekter.length)) this.gem();
        this.mol = new Mol();
        this.objekter = [];
        this.valgtObj = null;
        if (medStart) this.mol.tilfoej("C", -0.43, 0).start = true;
        this.traek = null;
        this.spoegelse = null;
        this.efter("nulstil");
    };

    P.saet = function (mol, glemHistorik) {
        if (!glemHistorik) this.gem();
        this.mol = mol;
        this.efter("saet");
    };

    P.antal = function () { return this.mol.atomer.length; };

    /* ----- Hvad er under musen? ---------------------------------------------------- */
    P.atomVed = function (pt, radius) {
        var s = this.s(), r = radius || Math.max(15, s * 0.32), bedst = null, bd = r;
        var mig = this;
        this.mol.atomer.forEach(function (a) {
            var p = mig.px(a), d = Math.hypot(p.x - pt.x, p.y - pt.y);
            if (d < bd) { bd = d; bedst = a; }
        });
        return bedst;
    };

    P.bindingVed = function (pt) {
        var bedst = null, bd = 9, mig = this;
        this.mol.bindinger.forEach(function (b) {
            var A = mig.px(b.a), B = mig.px(b.b);
            var dx = B.x - A.x, dy = B.y - A.y, l2 = dx * dx + dy * dy;
            var t = l2 ? ((pt.x - A.x) * dx + (pt.y - A.y) * dy) / l2 : 0;
            if (t < 0.18 || t > 0.82) return;
            var d = Math.hypot(pt.x - (A.x + t * dx), pt.y - (A.y + t * dy));
            if (d < bd) { bd = d; bedst = b; }
        });
        return bedst;
    };

    /* En pils eller et plus' kasse i bindingslaengder */
    P.objKasse = function (o) {
        if (o.type === "plus") return { x0: o.x - 0.35, x1: o.x + 0.35, y0: o.y - 0.4, y1: o.y + 0.4 };
        if (o.type === "klister") {
            var k = NK.Skuffe && NK.Skuffe.klister(o.navn), b = k ? k.bredde * (o.skala || 1) / 2 : 0.5;
            var h = k ? b * k.h / k.b : 0.5;
            return { x0: o.x - b, x1: o.x + b, y0: o.y - h, y1: o.y + h };
        }
        var l = NK.Struktur.pilLaengde(o, this.s()) / 2;
        return { x0: o.x - l - 0.15, x1: o.x + l + 0.15, y0: o.y - (o.over ? 0.95 : 0.35), y1: o.y + (o.under ? 0.95 : 0.35) };
    };

    /* Det oeverste objekt under punktet (klistermaerker foran pile og plus) */
    P.objektVed = function (pt) {
        var u = this.enheder(pt), fund = null, mig = this;
        this.objekter.forEach(function (o) {
            var k = mig.objKasse(o);
            if (u.x >= k.x0 && u.x <= k.x1 && u.y >= k.y0 && u.y <= k.y1) {
                if (!fund || o.type === "klister" || fund.type !== "klister") fund = o;
            }
        });
        return fund;
    };

    P.under = function (pt) {
        /* Et klistermaerke ligger oven paa molekylet og rammes foerst */
        var ko = this.objektVed(pt);
        if (ko && ko.type === "klister") return { slags: "objekt", obj: ko };
        var a = this.atomVed(pt);
        if (a) return { slags: "atom", atom: a };
        var b = this.bindingVed(pt);
        if (b) return { slags: "binding", binding: b };
        var o = this.objektVed(pt);
        if (o) return { slags: "objekt", obj: o };
        return null;
    };

    /* ----- Pile og plus ----------------------------------------------------------- */
    P.nytObjekt = function (type, pt, navn) {
        var u = this.enheder(pt);
        if (!this.iFelt(u)) return null;
        this.gem();
        var o = { id: this.objId++, type: type, x: u.x, y: u.y, over: "", under: "" };
        if (type === "klister") { o.navn = navn; o.skala = 1; }
        this.objekter.push(o);
        this.valgtObj = type === "plus" ? null : o;
        this.vaerktoej = "tegn";
        this.efter("objekt");
        return o;
    };

    P.sletObjekt = function (o) {
        this.gem();
        this.objekter = this.objekter.filter(function (x) { return x !== o; });
        if (this.valgtObj === o) this.valgtObj = null;
        this.efter("objekt");
        return true;
    };

    /* Et klistermaerke bliver stoerre eller mindre (faktor f) */
    P.klisterSkala = function (f) {
        var o = this.valgtObj;
        if (!o || o.type !== "klister") return;
        var ny = NK.klamp((o.skala || 1) * f, 0.4, 4);
        if (ny === o.skala) return;
        this.gem();
        o.skala = ny;
        this.efter("tekst");
    };

    /* Tekst over eller under den valgte pil */
    P.pilTekst = function (felt, tekst) {
        var o = this.valgtObj;
        if (!o || o.type === "plus" || o[felt] === tekst) return;
        this.gem();
        o[felt] = tekst;
        this.efter("tekst");
    };

    /* ----- Reglerne for et nyt atom ------------------------------------------------ */
    function krydser(p1, p2, p3, p4) {
        var det = (p2.x - p1.x) * (p4.y - p3.y) - (p3.x - p4.x) * (p1.y - p2.y);
        if (Math.abs(det) < 1e-9) return false;
        var l = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
        var g = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
        return l > 0.01 && l < 0.99 && g > 0.01 && g < 0.99;
    }

    function vinkelForskel(a, b) {
        var d = a - b;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        return d;
    }

    P.fuld = function (fra) {
        var a = this.mol.atom(fra), v = Mol.maksValens(a.el, a.q), navn = a.el + (a.q ? NK.ladningHaevet(a.q) : "");
        if (!v) return navn + " kan ikke have bindinger!";
        return navn + " har allerede " + v + (v === 1 ? " binding!" : " bindinger!");
    };

    /* Maa der komme et atom i kand (enheder) ved en binding fra atomet fra? */
    P.vurder = function (fra, kand, vinkel, til) {
        var mol = this.mol, a = mol.atom(fra);
        if (!mol.ledig(fra, 1)) return { ok: false, toast: this.fuld(fra) };
        var nb = mol.naboer(fra), taget = false, lige = false;
        nb.forEach(function (n) {
            var b = mol.atom(n);
            var d = Math.abs(vinkelForskel(vinkel, Math.atan2(b.y - a.y, b.x - a.x)));
            if (d < 0.3) taget = true;
            if (d > 2.8) lige = true;
        });
        if (taget) return { ok: false };
        var ekstra = mol.bindingerTil(fra).some(function (bd) { return bd.orden === 3; });
        if (lige && nb.length === 1 && this.r.knaek !== false && !ekstra) return { ok: false, toast: "Husk knæk på kæden!", slags: "advar" };
        if (!til) {
            for (var i = 0; i < mol.atomer.length; i++) {
                var o = mol.atomer[i];
                if (o.id !== fra && Math.hypot(o.x - kand.x, o.y - kand.y) < 0.45) return { ok: false };
            }
            if (!this.iFelt(kand)) return { ok: false };
        }
        for (var j = 0; j < mol.bindinger.length; j++) {
            var bd = mol.bindinger[j];
            if (bd.a === fra || bd.b === fra || (til && (bd.a === til || bd.b === til))) continue;
            if (krydser(a, kand, mol.atom(bd.a), mol.atom(bd.b))) return { ok: false, toast: "Bindinger må ikke krydse!" };
        }
        return { ok: true };
    };

    /* Naeste skridt fra atomet mod musen: den lige retning, eller et knaek
       paa 30 grader til hver side, hvis den lige ikke maa bruges. */
    P.naesteTrin = function (fra, mod) {
        var a = this.mol.atom(fra), mol = this.mol;
        var u = this.enheder(mod);
        var raa = Math.atan2(u.y - a.y, u.x - a.x);
        var grund = Math.round(raa / TRIN) * TRIN;
        var mig = this;
        var knaek = [grund - TRIN, grund + TRIN].sort(function (p, q) {
            return Math.abs(vinkelForskel(raa, p)) - Math.abs(vinkelForskel(raa, q));
        });
        var forslag = [grund].concat(knaek);
        var nb = mol.naboer(fra);
        var lineaer = mol.bindingerTil(fra).some(function (bd) { return bd.orden === 3; });
        if (!nb.length && this.r.knaek !== false) {
            /* Foerste binding fra et enligt atom: 30 grader op eller ned, saa
               en kaede, der traekkes vandret, bliver bogens zigzag */
            var g2 = Math.round((raa - TRIN) / (2 * TRIN)) * 2 * TRIN + TRIN;
            forslag = [g2, g2 - 2 * TRIN, g2 + 2 * TRIN];
        } else if (nb.length === 1 && this.r.knaek !== false && !lineaer) {
            /* Midt i en kaede: drej 60 grader, saa vinklen altid er 120 grader.
               Skiftevis til hver side, saa laenge musen peger nogenlunde frem;
               peger den tydeligt til én side, boejer kaeden med. */
            var b = mol.atom(nb[0]);
            var ret = Math.atan2(a.y - b.y, a.x - b.x);
            var sidst = 0;
            var foer = mol.naboer(b.id).filter(function (x) { return x !== fra; });
            if (foer.length === 1) {
                var c = mol.atom(foer[0]);
                var k = (b.x - c.x) * (a.y - b.y) - (b.y - c.y) * (a.x - b.x);
                sidst = k > 1e-6 ? 1 : (k < -1e-6 ? -1 : 0);
            }
            var v1 = ret + 2 * TRIN, v2 = ret - 2 * TRIN;
            var d1 = Math.abs(vinkelForskel(raa, v1)), d2 = Math.abs(vinkelForskel(raa, v2));
            var foerst = d1 <= d2 ? v1 : v2;
            if (sidst) {
                var skift = sidst > 0 ? v2 : v1, dS = skift === v1 ? d1 : d2, dA = skift === v1 ? d2 : d1;
                if (dS - dA < 45 * GRAD) foerst = skift;
            }
            forslag = [foerst, foerst === v1 ? v2 : v1];
        }
        var res = forslag.map(function (v) {
            var kand = { x: a.x + Math.cos(v), y: a.y + Math.sin(v) };
            var r = mig.vurder(fra, kand, v, null);
            r.kand = kand;
            r.vinkel = v;
            return r;
        });
        for (var i = 0; i < res.length; i++) if (res[i].ok) return res[i];
        return res[0];
    };

    /* Ringslutning: slippes kaeden over et andet atom (tegnebraettet) */
    P.ringMaal = function (fra, pt) {
        if (!this.r.ringe) return null;
        var b = this.atomVed(pt, Math.max(14, this.s() * 0.3));
        if (!b || b.id === fra || this.mol.binding(fra, b.id)) return null;
        var a = this.mol.atom(fra);
        var d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d > 1.75) return null;
        if (!this.mol.ledig(b.id, 1)) return { ok: false, til: b.id, toast: this.fuld(b.id) };
        var r = this.vurder(fra, b, Math.atan2(b.y - a.y, b.x - a.x), b.id);
        r.til = b.id;
        r.kand = { x: b.x, y: b.y };
        return r;
    };

    P.tilfoejFra = function (fra, kand, el) {
        var n = this.mol.tilfoej(el || "C", kand.x, kand.y);
        this.mol.bind(fra, n.id, 1);
        return n;
    };

    /* Et klik paa et atom: et nyt C. Et enligt atom faar sin foerste binding
       30 grader op mod hoejre. For enden af en kaede fortsaetter zigzaggen
       (skiftevis op og ned), saa man kan bygge en lang kaede med klik.
       Midt i kaeden kommer en sidegren i det stoerste frie hul. */
    P.nytFra = function (fra, el) {
        if (this.antal() >= this.maks()) { this.toast(this.maksTekst(), "advar"); return null; }
        var a = this.mol.atom(fra), mig = this;
        if (!this.mol.ledig(fra, 1)) { this.toast(this.fuld(fra)); return null; }
        var valgt = null;
        this.retninger(fra).some(function (v) {
            var kand = { x: a.x + Math.cos(v), y: a.y + Math.sin(v) };
            if (mig.vurder(fra, kand, v, null).ok) { valgt = { kand: kand }; return true; }
            return false;
        });
        if (!valgt) { this.toast("Der er ikke plads til flere atomer her!"); return null; }
        this.gem();
        var n = mig.tilfoejFra(fra, valgt.kand, el);
        this.efter("atom");
        return n;
    };

    /* Retningerne (vinkler) for en ny binding fra atomet, de bedste foerst:
       zigzaggen eller den foerste binding 30 grader op, og saa de tolv
       retninger med de paeneste vinkler til naboerne */
    P.retninger = function (fra) {
        var a = this.mol.atom(fra), mol = this.mol;
        var nbId = mol.naboer(fra);
        var nb = nbId.map(function (n) { var b = mol.atom(n); return Math.atan2(b.y - a.y, b.x - a.x); });
        var foretrukne = [];
        var lineaer = mol.bindingerTil(fra).some(function (bd) { return bd.orden === 3; });
        if (!nb.length) {
            foretrukne = [-TRIN, TRIN, -5 * TRIN, 5 * TRIN];
        } else if (nb.length === 1) {
            var ret = nb[0] + Math.PI;
            if (lineaer) foretrukne = [ret];
            else {
                var v1 = ret + 2 * TRIN, v2 = ret - 2 * TRIN, sidst = 0, b = mol.atom(nbId[0]);
                var foer = mol.naboer(b.id).filter(function (x) { return x !== fra; });
                if (foer.length === 1) {
                    var c = mol.atom(foer[0]);
                    var k = (b.x - c.x) * (a.y - b.y) - (b.y - c.y) * (a.x - b.x);
                    sidst = k > 1e-6 ? 1 : (k < -1e-6 ? -1 : 0);
                }
                if (sidst > 0) foretrukne = [v2, v1];
                else if (sidst < 0) foretrukne = [v1, v2];
                else foretrukne = Math.abs(Math.sin(v1)) <= Math.abs(Math.sin(v2)) ? [v1, v2] : [v2, v1];
            }
        }
        /* Ellers den retning, der giver paenest vinkler til naboerne */
        var resten = [];
        for (var i = 0; i < 12; i++) {
            var v = i * TRIN;
            resten.push({ v: v, mind: nb.reduce(function (m, w) { return Math.min(m, Math.abs(vinkelForskel(v, w))); }, Math.PI), i: i });
        }
        resten.sort(function (p, q) { return q.mind - p.mind > 1e-6 ? 1 : (p.mind - q.mind > 1e-6 ? -1 : p.i - q.i); });
        return foretrukne.concat(resten.map(function (r) { return r.v; }));
    };

    /* ----- Grupper med ét klik (tegnebraettet) ------------------------------------
       Gruppen saettes paa det atom, der klikkes paa, i det bedste frie hul.
       Hvert atom i gruppen: [grundstof, bindingsorden, vinkel (grader) i
       forhold til den foerste binding, ladning]. Det foerste atom sidder paa
       det atom, der klikkes paa; de andre paa gruppens foerste atom. Vinklen
       +60 er det atom, der fortsaetter zigzaggen (OH i COOH); spejlingen
       vaelges, saa kaeden stadig er en zigzag. */
    var GRUPPER = {
        OH: [["O", 1, 0]],
        O: [["O", 2, 0]],
        NH2: [["N", 1, 0]],
        CHO: [["C", 1, 0], ["O", 2, 60]],
        COOH: [["C", 1, 0], ["O", 1, 60], ["O", 2, -60]],
        COO: [["C", 1, 0], ["O", 1, 60, -1], ["O", 2, -60]]
    };
    Tegnebraet.GRUPPER = GRUPPER;

    P.saetGruppe = function (fra, navn) {
        var g = GRUPPER[navn], mol = this.mol, a = mol.atom(fra), mig = this;
        if (!g || !a) return false;
        if (this.antal() + g.length > this.maks()) { this.toast(this.maksTekst(), "advar"); return false; }
        if (!mol.ledig(fra, g[0][1])) {
            this.toast(g[0][1] === 2 && mol.ledig(fra, 1) ? "Der er ikke plads til en dobbeltbinding på " + a.el + "-atomet!" : this.fuld(fra));
            return false;
        }
        /* Knaekket ved atomet, der klikkes paa (fra den eneste nabo), saa
           gruppen kan knaekke den anden vej */
        var nb = mol.naboer(fra), forrige = nb.length === 1 ? mol.atom(nb[0]) : null;
        function kryds(p, q, r) { return (q.x - p.x) * (r.y - q.y) - (q.y - p.y) * (r.x - q.x); }
        function steder(v, spejl) {
            var p0 = { x: a.x + Math.cos(v), y: a.y + Math.sin(v) }, ud = [p0];
            for (var i = 1; i < g.length; i++) {
                var w = v + spejl * g[i][2] * GRAD;
                ud.push({ x: p0.x + Math.cos(w), y: p0.y + Math.sin(w) });
            }
            return ud;
        }
        function fri(ps, v) {
            if (!mig.vurder(fra, ps[0], v, null).ok) return false;
            for (var i = 0; i < ps.length; i++) {
                if (!mig.iFelt(ps[i])) return false;
                for (var j = 0; j < mol.atomer.length; j++) {
                    var o = mol.atomer[j];
                    if (o.id !== fra && Math.hypot(o.x - ps[i].x, o.y - ps[i].y) < 0.6) return false;
                }
                if (i === 0) continue;
                for (var k = 0; k < mol.bindinger.length; k++) {
                    var bd = mol.bindinger[k];
                    if (krydser(ps[0], ps[i], mol.atom(bd.a), mol.atom(bd.b))) return false;
                }
            }
            return true;
        }
        var fund = null;
        this.retninger(fra).some(function (v) {
            var muligheder = g.length > 1 ? [1, -1] : [1];
            if (g.length > 1) {
                /* Zigzag: gruppens knaek gaar den anden vej end knaekket ved fra.
                   Uden knaek: =O op (mindst y) */
                muligheder.sort(function (s1, s2) {
                    var p1 = steder(v, s1), p2 = steder(v, s2);
                    if (forrige) {
                        var k0 = kryds(forrige, a, p1[0]);
                        var z1 = kryds(a, p1[0], p1[1]) * k0 < 0 ? 0 : 1, z2 = kryds(a, p2[0], p2[1]) * k0 < 0 ? 0 : 1;
                        if (Math.abs(k0) > 1e-6 && z1 !== z2) return z1 - z2;
                    }
                    var dO1 = p1[p1.length - 1].y, dO2 = p2[p2.length - 1].y;
                    return dO1 - dO2;
                });
            }
            return muligheder.some(function (spejl) {
                var ps = steder(v, spejl);
                if (fri(ps, v)) { fund = ps; return true; }
                return false;
            });
        });
        if (!fund) { this.toast("Der er ikke plads til gruppen her!"); return false; }
        this.gem();
        var ids = [];
        g.forEach(function (x, i) {
            var n = mol.tilfoej(x[0], fund[i].x, fund[i].y);
            if (x[3]) n.q = x[3];
            mol.bind(i === 0 ? fra : ids[0], n.id, x[1]);
            ids.push(n.id);
        });
        this.efter("atom");
        return true;
    };

    /* ----- Ladning (tegnebraettet) ---------------------------------------------
       Et klik skifter mellem ingen ladning, - og +. En ladning, der ikke
       passer til atomets bindinger (Cl⁻ med en binding), springes over. */
    P.skiftLadning = function (a) {
        var cyklus = [0, -1, 1], i = cyklus.indexOf(a.q || 0), sum = this.mol.bindingssum(a.id);
        for (var k = 1; k < 3; k++) {
            var q = cyklus[(i + k) % 3];
            if (sum > Mol.maksValens(a.el, q)) continue;
            this.gem();
            if (q) a.q = q; else delete a.q;
            this.efter("ladning");
            return true;
        }
        this.toast(a.el + " kan ikke have en anden ladning med de bindinger.");
        return false;
    };

    P.maksTekst = function () {
        return this.r.maksTekst ? this.r.maksTekst() : "Der er ikke plads til flere atomer.";
    };

    /* ----- Bindinger og grundstoffer --------------------------------------------- */
    P.skiftBinding = function (bd) {
        var mol = this.mol, max = this.r.tripel ? 3 : (this.r.dobbelt === false ? 1 : 2);
        var ny = bd.orden >= max ? 1 : bd.orden + 1;
        if (ny > bd.orden) {
            var ekstra = ny - bd.orden;
            if (!mol.ledig(bd.a, ekstra) || !mol.ledig(bd.b, ekstra)) {
                /* Kan den ikke blive tripel, maa den gerne springe tilbage til enkelt */
                if (ny === 3) ny = 1;
                else {
                    var fuldt = !mol.ledig(bd.a, ekstra) ? bd.a : bd.b;
                    this.toast(mol.atom(fuldt).el === "C" ? "Kulstofatomet har ikke plads til en dobbeltbinding her!" : this.fuld(fuldt));
                    return false;
                }
            }
            if (ny === 2 && this.r.enDobbelt) {
                var anden = mol.bindinger.some(function (x) {
                    return x !== bd && x.orden === 2 && (x.a === bd.a || x.b === bd.a || x.a === bd.b || x.b === bd.b);
                });
                if (anden) { this.toast("Et kulstofatom kan kun indgå i én dobbeltbinding her!"); return false; }
            }
        }
        if (this.r.dobbelt === false && ny > 1) { this.toast("Alkaner har kun enkeltbindinger.", "advar"); return false; }
        this.gem();
        bd.orden = ny;
        this.efter("binding");
        return true;
    };

    P.skiftGrundstof = function (a, el) {
        if (a.el === el && !a.q) return false;
        var sum = this.mol.bindingssum(a.id);
        if (sum > Mol.maksValens(el)) {
            this.toast(el + " kan kun have " + Mol.maksValens(el) + (Mol.maksValens(el) === 1 ? " binding." : " bindinger."));
            return false;
        }
        this.gem();
        a.el = el;
        delete a.q;   /* et nyt grundstof er uden ladning */
        this.efter("grundstof");
        return true;
    };

    P.sletAtom = function (a) {
        if (!this.r.sletAlt) {
            if (this.mol.grad(a.id) > 1) { this.toast("Slet fra enden af kæden.", "advar"); return false; }
            if (this.antal() <= 1) return false;
        }
        this.gem();
        this.mol.fjernAtom(a.id);
        this.efter("slet");
        return true;
    };

    P.sletBinding = function (bd) {
        if (!this.r.sletAlt) return false;
        this.gem();
        this.mol.fjernBinding(bd);
        this.efter("slet");
        return true;
    };

    /* ----- Ringe (tegnebraettet) ----------------------------------------------------
       n: 3-8. benzen: seks-ring med skiftevis dobbeltbindinger.
       Paa tom tavle: en fri ring. Paa et atom: ringen sidder paa atomet med
       en binding. Paa en binding: ringen deler bindingen. Nye hjoerner, der
       falder oven i et atom, bruger atomet. */
    P.ring = function (pt, n, benzen) {
        var mol = this.mol, u = this.enheder(pt);
        var R = 1 / (2 * Math.sin(Math.PI / n));
        var punkter = [], i;
        var under = this.under(pt);
        if (under && under.slags === "binding") {
            var A = mol.atom(under.binding.a), B = mol.atom(under.binding.b);
            var mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
            var nx = -(B.y - A.y), ny = B.x - A.x;
            /* Paa den side af bindingen, hvor der er faerrest atomer */
            var side = 0;
            mol.atomer.forEach(function (o) { side += (o.x - mx) * nx + (o.y - my) * ny > 0.05 ? 1 : 0; side -= (o.x - mx) * nx + (o.y - my) * ny < -0.05 ? 1 : 0; });
            var sg = side > 0 ? -1 : 1, apot = R * Math.cos(Math.PI / n);
            var cx = mx + nx * sg * apot, cy = my + ny * sg * apot;
            var v0 = Math.atan2(A.y - cy, A.x - cx), v1 = Math.atan2(B.y - cy, B.x - cx);
            var ret = vinkelForskel(v1, v0) > 0 ? 1 : -1;
            for (i = 0; i < n; i++) punkter.push({ x: cx + R * Math.cos(v0 + ret * i * 2 * Math.PI / n), y: cy + R * Math.sin(v0 + ret * i * 2 * Math.PI / n) });
        } else if (under && under.slags === "atom") {
            var a = under.atom;
            if (!mol.ledig(a.id, 1)) { this.toast(this.fuld(a.id)); return false; }
            var nb = mol.naboer(a.id), sx = 0, sy = 0;
            nb.forEach(function (x) { var b = mol.atom(x); sx += b.x - a.x; sy += b.y - a.y; });
            var ud = nb.length ? Math.atan2(-sy, -sx) : 0;
            var f = { x: a.x + Math.cos(ud), y: a.y + Math.sin(ud) };
            var c = { x: f.x + R * Math.cos(ud), y: f.y + R * Math.sin(ud) };
            var start = Math.atan2(f.y - c.y, f.x - c.x);
            for (i = 0; i < n; i++) punkter.push({ x: c.x + R * Math.cos(start + i * 2 * Math.PI / n), y: c.y + R * Math.sin(start + i * 2 * Math.PI / n) });
            punkter.bindTil = a.id;
        } else {
            for (i = 0; i < n; i++) {
                var v = -Math.PI / 2 + i * 2 * Math.PI / n + (n % 2 ? 0 : Math.PI / n);
                punkter.push({ x: u.x + R * Math.cos(v), y: u.y + R * Math.sin(v) });
            }
        }
        if (this.antal() + n > this.maks()) { this.toast(this.maksTekst(), "advar"); return false; }
        this.gem();
        var ids = punkter.map(function (p) {
            var eks = null;
            mol.atomer.forEach(function (o) { if (!eks && Math.hypot(o.x - p.x, o.y - p.y) < 0.2) eks = o; });
            return eks ? eks.id : mol.tilfoej("C", p.x, p.y).id;
        });
        for (i = 0; i < n; i++) {
            var x = ids[i], y = ids[(i + 1) % n];
            if (!mol.binding(x, y)) {
                var orden = benzen && i % 2 === 0 && mol.ledig(x, 2) && mol.ledig(y, 2) ? 2 : 1;
                mol.bind(x, y, orden);
            }
        }
        if (punkter.bindTil !== undefined) mol.bind(punkter.bindTil, ids[0], 1);
        this.efter("ring");
        return true;
    };

    /* Tilbage til at tegne med C (hoejreklik i Markér eller paa tom tavle med
       et andet vaerktoej, og Esc paa tegnebraettet) */
    P.tilTegn = function () {
        this.vaerktoej = "tegn";
        this.grundstof = "C";
        this.rydValg();
        this.ramme = null;
        this.efter("vaerktoej");
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.ned = function (pt, e) {
        if (this.laast) return false;
        this.mus = pt;
        var hoejre = e && e.button === 2;
        var u = this.under(pt);
        if (hoejre) {
            /* Hoejreklik i Markér, med en gruppe og med ladning sletter ikke:
               det gaar tilbage til at tegne med C */
            var afbryd = this.vaerktoej === "marker" || this.vaerktoej === "ladning" || this.vaerktoej.indexOf("gruppe:") === 0;
            if (afbryd || (!u && this.r.udsnit && this.vaerktoej !== "tegn")) { this.tilTegn(); return true; }
            if (u && u.slags === "atom") this.sletAtom(u.atom);
            else if (u && u.slags === "binding") this.sletBinding(u.binding);
            else if (u && u.slags === "objekt") this.sletObjekt(u.obj);
            return true;
        }
        this.traek = { start: { x: pt.x, y: pt.y }, u: u, bevaeget: false, tid: Date.now(), flyt: false };
        /* Den midterste museknap flytter altid udsnittet */
        if (this.r.udsnit && e && e.button === 1) { this.traek.udsnit = true; return true; }
        if (this.vaerktoej === "marker") {
            var skift = !!(e && e.shiftKey);
            if (u && (u.slags === "atom" || u.slags === "binding")) {
                var id = u.slags === "atom" ? u.atom.id : u.binding.a;
                if (skift || !this.valgte.a[id]) { if (!skift) this.rydValg(); this.vaelgFragment(id, skift); }
                this.traek.marker = "flyt";
            } else if (u && u.slags === "objekt") {
                if (skift || !this.valgte.o[u.obj.id]) { if (!skift) this.rydValg(); this.vaelgObjekt(u.obj, skift); }
                this.traek.marker = "flyt";
            } else {
                this.traek.marker = "ramme";
                this.traek.skift = skift;
            }
            this.valgtObj = eneObjekt(this);
            this.efter("valg");
            return true;
        }
        if (u && u.slags === "objekt") {
            /* En pil eller et plus flyttes, naar man traekker i det */
            this.traek.obj = u.obj;
            this.traek.objStart = { x: u.obj.x, y: u.obj.y };
        } else if (u && u.slags === "atom") {
            this.traek.fra = u.atom.id;
            this.traek.flyt = !!(this.r.flyt && ((e && e.shiftKey) || this.vaerktoej === "flyt"));
        } else if (!u && this.r.udsnit && (this.vaerktoej === "tegn" || this.vaerktoej === "flyt")) {
            /* Traek i tom tavle flytter udsnittet; et klik uden at traekke tegner som foer */
            this.traek.udsnit = "klik";
        } else if (!u && this.r.flyt && this.vaerktoej === "flyt") {
            this.traek.panorer = true;
        }
        var mig = this;
        clearTimeout(this.langtTryk);
        if (u && e && e.pointerType === "touch") {
            this.langtTryk = setTimeout(function () {
                if (mig.traek && !mig.traek.bevaeget) {
                    mig.traek = null;
                    if (u.slags === "atom") mig.sletAtom(u.atom);
                    else if (u.slags === "binding") mig.sletBinding(u.binding);
                    else mig.sletObjekt(u.obj);
                }
            }, 650);
        }
        return true;
    };

    P.flyt = function (pt) {
        this.mus = pt;
        var t = this.traek;
        if (!t) { this.over = this.laast ? null : this.under(pt); return; }
        if (!t.bevaeget && Math.hypot(pt.x - t.start.x, pt.y - t.start.y) > 6) {
            t.bevaeget = true;
            clearTimeout(this.langtTryk);
            if (t.flyt || t.panorer || t.obj || t.marker === "flyt") this.gem();
        }
        if (!t.bevaeget) return;
        var s = this.s(), sd = t.sidste || t.start;
        if (t.udsnit) {
            this.flytUdsnit(pt.x - sd.x, pt.y - sd.y);
            t.sidste = { x: pt.x, y: pt.y };
            return;
        }
        if (t.marker === "flyt") {
            this.flytValgte((pt.x - sd.x) / s, (pt.y - sd.y) / s);
            t.sidste = { x: pt.x, y: pt.y };
            return;
        }
        if (t.marker === "ramme") {
            t.slut = { x: pt.x, y: pt.y };
            this.ramme = { a: t.start, b: t.slut };
            return;
        }
        if (t.obj) {
            t.obj.x = t.objStart.x + (pt.x - t.start.x) / s;
            t.obj.y = t.objStart.y + (pt.y - t.start.y) / s;
            return;
        }
        if (t.flyt) {
            var a = this.mol.atom(t.fra), u = this.enheder(pt);
            if (a) { a.x = u.x; a.y = u.y; }
            return;
        }
        if (t.panorer) {
            var dx = (pt.x - (t.sidste || t.start).x) / s, dy = (pt.y - (t.sidste || t.start).y) / s;
            this.mol.atomer.forEach(function (o) { o.x += dx; o.y += dy; });
            this.objekter.forEach(function (o) { o.x += dx; o.y += dy; });
            t.sidste = { x: pt.x, y: pt.y };
            return;
        }
        if (t.fra === undefined) return;
        if (this.grundstof !== "C" && !this.r.kunC) {
            /* Et andet grundstof: kun én binding ad gangen */
            this.spoegelse = this.spoegelseFor(t.fra, pt);
            return;
        }
        /* Kaeden bygges, mens man traekker */
        var fra = t.aktiv !== undefined ? t.aktiv : t.fra, vaern = 0;
        while (this.antal() < this.maks() && vaern++ < 40) {
            var p = this.px(fra);
            if (Math.hypot(pt.x - p.x, pt.y - p.y) < s) break;
            if (this.ringMaal(fra, pt)) break;
            var trin = this.naesteTrin(fra, pt);
            if (!trin.ok) break;
            if (!t.gemt) { this.gem(); t.gemt = true; }
            fra = this.tilfoejFra(fra, trin.kand, "C").id;
            t.aktiv = fra;
            this.efter("atom");
        }
        t.aktiv = fra;
        this.spoegelse = this.spoegelseFor(fra, pt);
    };

    P.spoegelseFor = function (fra, pt) {
        var p = this.px(fra);
        if (Math.hypot(pt.x - p.x, pt.y - p.y) < this.s() * 0.35) { this.toast(null); return null; }
        var r = this.ringMaal(fra, pt);
        if (!r) {
            if (this.antal() >= this.maks()) { this.toast(this.maksTekst(), "advar"); return { fra: fra, kand: this.naesteTrin(fra, pt).kand, ok: false }; }
            r = this.naesteTrin(fra, pt);
        }
        if (r.toast) this.toast(r.toast, r.slags); else this.toast(null);
        return { fra: fra, kand: r.kand, ok: r.ok, til: r.til };
    };

    P.op = function (pt) {
        clearTimeout(this.langtTryk);
        var t = this.traek;
        this.traek = null;
        var g = this.spoegelse;
        this.spoegelse = null;
        this.toast(null);
        if (!t) return;
        if (t.udsnit && (t.bevaeget || t.udsnit !== "klik")) return;
        if (t.marker) {
            this.ramme = null;
            if (t.marker === "flyt") { if (t.bevaeget) this.efter("flyt"); return; }
            if (t.bevaeget) {
                var p1 = this.enheder(t.start), p2 = this.enheder(pt || t.slut || t.start);
                this.vaelgRamme({ x0: Math.min(p1.x, p2.x), x1: Math.max(p1.x, p2.x), y0: Math.min(p1.y, p2.y), y1: Math.max(p1.y, p2.y) }, t.skift);
            } else if (!t.skift) this.rydValg();
            this.valgtObj = eneObjekt(this);
            this.efter("valg");
            return;
        }
        if (t.obj && t.bevaeget) { this.valgtObj = t.obj.type === "plus" ? this.valgtObj : t.obj; this.efter("flyt"); return; }
        if (t.flyt || t.panorer) { if (t.bevaeget) this.efter("flyt"); return; }
        if (t.bevaeget) {
            if (g && g.ok) {
                if (!t.gemt) this.gem();
                if (g.til !== undefined) this.mol.bind(g.fra, g.til, 1);
                else this.tilfoejFra(g.fra, g.kand, this.r.kunC ? "C" : this.grundstof);
                this.efter("atom");
            }
            return;
        }
        this.klik(t.u, pt);
    };

    P.klik = function (u, pt) {
        var el = this.r.kunC ? "C" : this.grundstof;
        if (this.vaerktoej === "ring6" || this.vaerktoej === "ring5" || this.vaerktoej === "benzen") {
            this.ring(pt, this.vaerktoej === "ring5" ? 5 : 6, this.vaerktoej === "benzen");
            return;
        }
        if (this.vaerktoej === "pil" || this.vaerktoej === "lig" || this.vaerktoej === "plus") {
            this.nytObjekt(this.vaerktoej, pt);
            return;
        }
        if (this.vaerktoej.indexOf("klister:") === 0) {
            this.nytObjekt("klister", pt, this.vaerktoej.slice(8));
            return;
        }
        if (this.vaerktoej.indexOf("gruppe:") === 0) {
            if (u && u.slags === "atom") this.saetGruppe(u.atom.id, this.vaerktoej.slice(7));
            else this.toast("Klik på et atom for at sætte gruppen på.", "advar");
            return;
        }
        if (this.vaerktoej === "ladning") {
            if (u && u.slags === "atom") this.skiftLadning(u.atom);
            else this.toast("Klik på et atom for at give det en ladning.", "advar");
            return;
        }
        if (u && u.slags === "objekt") {
            /* Et klik paa en pil vaelger den, saa teksten kan skrives i panelet */
            this.valgtObj = u.obj.type === "plus" ? null : u.obj;
            this.efter("valg");
            return;
        }
        if (!u) {
            if (this.r.kunC) { this.toast("Træk fra et C-atom for at tegne.", "advar"); return; }
            if (this.antal() >= this.maks()) { this.toast(this.maksTekst(), "advar"); return; }
            var ny = this.enheder(pt);
            if (!this.iFelt(ny)) return;
            this.gem();
            this.mol.tilfoej(el, ny.x, ny.y).start = true;
            this.efter("atom");
            return;
        }
        if (u.slags === "binding") { this.skiftBinding(u.binding); return; }
        if (u.atom.el !== el) { this.skiftGrundstof(u.atom, el); return; }
        this.nytFra(u.atom.id, "C");
    };

    P.ud = function () {
        this.mus = null;
        this.over = null;
        if (this.traek && this.traek.bevaeget && !this.traek.flyt && !this.traek.panorer) this.op(null);
    };

    /* CSS-markoeren over punktet */
    P.markoer = function (pt) {
        if (this.laast) return "default";
        if (this.traek && this.traek.udsnit && this.traek.bevaeget) return "grabbing";
        if (this.vaerktoej === "marker") return this.under(pt) ? "move" : "crosshair";
        if (this.vaerktoej === "flyt") return "move";
        if (this.vaerktoej === "ladning" || this.vaerktoej.indexOf("gruppe:") === 0) {
            var ua = this.under(pt);
            return ua && ua.slags === "atom" ? "pointer" : "default";
        }
        if (this.vaerktoej !== "tegn") return "crosshair";
        var u = this.under(pt);
        if (u && u.slags === "objekt") return "move";
        if (u) return "pointer";
        return this.r.kunC ? "default" : "crosshair";
    };

    /* ----- Tegning -------------------------------------------------------------------- */
    P.tegn = function (ctx, ekstra) {
        ekstra = ekstra || {};
        var m = this.midte(), s = this.s(), mig = this;
        var farve = ekstra.farve || "#1d2433";
        /* Et C uden bindinger er et startpunkt: det tegnes som et haandtag,
           ikke som CH4 (billedet til rapporten viser stadig CH4) */
        var enlige = {}, nEnlige = 0;
        if (this.stil === "zigzag") {
            this.mol.atomer.forEach(function (a) {
                if (a.el === "C" && a.start && !mig.mol.grad(a.id)) { enlige[a.id] = true; nEnlige++; }
            });
        }
        var visMol = this.mol;
        if (nEnlige) visMol = this.mol.del(this.mol.atomer.filter(function (a) { return !enlige[a.id]; }).map(function (a) { return a.id; }));
        /* Den valgte pil */
        var vo = this.valgtObj;
        if (vo && !this.laast && this.objekter.indexOf(vo) >= 0) {
            var k = this.objKasse(vo), p0 = this.px({ x: k.x0, y: k.y0 }), p1b = this.px({ x: k.x1, y: k.y1 });
            ctx.save();
            ctx.strokeStyle = "rgba(61, 158, 224, 0.7)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            NK.rundtRekt(ctx, p0.x - 4, p0.y - 4, p1b.x - p0.x + 8, p1b.y - p0.y + 8, 6);
            ctx.stroke();
            ctx.restore();
        }
        /* Det markerede: blå ramme om atomerne og bindingerne. Med vaerktoejet
           Markér lyser det molekyle, musen er over, svagt op */
        var marker = this.vaerktoej === "marker" && !this.laast;
        if (!this.laast) this.tegnMarkering(ctx, this.valgte.a, 0.3);
        var o = this.over;
        if (marker && o && !this.traek && (o.slags === "atom" || o.slags === "binding")) {
            var hov = {};
            this.fragmentMed(o.slags === "atom" ? o.atom.id : o.binding.a).forEach(function (x) { hov[x] = true; });
            this.tegnMarkering(ctx, hov, 0.14);
        }
        if (!this.laast) {
            this.objekter.forEach(function (ob) {
                if (!mig.valgte.o[ob.id] || ob === vo) return;
                var kk = mig.objKasse(ob), q0 = mig.px({ x: kk.x0, y: kk.y0 }), q1 = mig.px({ x: kk.x1, y: kk.y1 });
                ctx.save();
                ctx.fillStyle = "rgba(61, 158, 224, 0.14)";
                ctx.strokeStyle = "rgba(61, 158, 224, 0.7)";
                ctx.lineWidth = 1.5;
                NK.rundtRekt(ctx, q0.x - 4, q0.y - 4, q1.x - q0.x + 8, q1.y - q0.y + 8, 6);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            });
        }
        /* Det, musen er over */
        if (o && !this.traek && !this.laast && !marker) {
            ctx.save();
            if (o.slags === "binding") {
                var A = this.px(o.binding.a), B = this.px(o.binding.b);
                ctx.strokeStyle = "rgba(61, 158, 224, 0.28)";
                ctx.lineWidth = Math.max(10, s * 0.28);
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(A.x, A.y);
                ctx.lineTo(B.x, B.y);
                ctx.stroke();
            }
            ctx.restore();
        }
        var og = this.origo();
        var g = NK.Struktur.tegn(ctx, visMol, {
            skala: s, ox: og.x, oy: og.y, stil: this.stil, farve: farve,
            atomFarve: this.atomFarve, bindingFarve: this.bindingFarve,
            lokanter: this.lokanter, visC: this.visC,
            linje: ekstra.linje, objekter: this.objekter
        });
        /* Haandtag: kun paa startpunktet og paa det atom, musen er over eller
           traekker fra. Enderne af en tegnet kaede faar ingen prik */
        if (!this.laast && !ekstra.udenHaandtag) {
            this.mol.atomer.forEach(function (a) {
                var p = mig.px(a), start = !!enlige[a.id];
                var aktiv = !marker && ((mig.traek && (mig.traek.aktiv === a.id || (mig.traek.aktiv === undefined && mig.traek.fra === a.id))) ||
                    (o && o.slags === "atom" && o.atom.id === a.id));
                if (!aktiv && !start) return;
                /* Med alle atomer staar der et C; saa kun en ring om det, musen er over */
                if (mig.stil === "alle" && !start) {
                    if (!aktiv) return;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, Math.max(12, s * 0.3), 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(61, 158, 224, 0.9)";
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                    ctx.restore();
                    return;
                }
                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, aktiv ? Math.max(7, s * 0.16) : Math.max(5, s * 0.11), 0, Math.PI * 2);
                ctx.fillStyle = aktiv ? "rgba(61, 158, 224, 0.9)" : "rgba(29, 36, 51, 0.85)";
                if (a.el !== "C") { ctx.fillStyle = "rgba(61, 158, 224, 0.25)"; }
                ctx.fill();
                if (a.el === "C") {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, Math.max(2, s * 0.05), 0, Math.PI * 2);
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();
                }
                ctx.restore();
            });
        }
        /* Et atom uden bindinger pulserer, og en svag kaede vokser ud fra det,
           saa man kan se, at man traekker derfra */
        if (nEnlige && !this.laast && !this.traek && !ekstra.udenHaandtag) {
            var tid = (window.performance ? performance.now() : Date.now()) / 1000;
            this.mol.atomer.forEach(function (a) {
                if (enlige[a.id]) mig.tegnDemo(ctx, mig.px(a), s, tid);
            });
        }
        /* Spoegelset: den naeste binding, blaa hvis den maa laves, roed hvis ikke */
        var sp = this.spoegelse;
        if (sp && sp.kand) {
            var a0 = this.px(sp.fra), k = this.px(sp.kand);
            ctx.save();
            ctx.strokeStyle = sp.ok ? "#3d9ee0" : "#e05446";
            ctx.lineWidth = Math.max(3, s * 0.1);
            ctx.lineCap = "round";
            ctx.setLineDash([5, 8]);
            ctx.beginPath();
            ctx.moveTo(a0.x, a0.y);
            ctx.lineTo(k.x, k.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(k.x, k.y, Math.max(5, s * 0.12), 0, Math.PI * 2);
            ctx.fillStyle = sp.ok ? "#3d9ee0" : "#e05446";
            ctx.fill();
            ctx.restore();
        }
        /* Rammen, der traekkes om det, der skal markeres */
        var ra = this.ramme;
        if (ra) {
            ctx.save();
            ctx.fillStyle = "rgba(61, 158, 224, 0.08)";
            ctx.strokeStyle = "rgba(61, 158, 224, 0.8)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            ctx.fillRect(Math.min(ra.a.x, ra.b.x), Math.min(ra.a.y, ra.b.y), Math.abs(ra.b.x - ra.a.x), Math.abs(ra.b.y - ra.a.y));
            ctx.strokeRect(Math.min(ra.a.x, ra.b.x), Math.min(ra.a.y, ra.b.y), Math.abs(ra.b.x - ra.a.x), Math.abs(ra.b.y - ra.a.y));
            ctx.restore();
        }
        return g;
    };

    /* Blå, gennemsigtig markering af atomerne i ids og bindingerne mellem dem */
    P.tegnMarkering = function (ctx, ids, alfa) {
        if (!Object.keys(ids).length) return;
        var mig = this, s = this.s();
        ctx.save();
        ctx.strokeStyle = ctx.fillStyle = "rgba(61, 158, 224, " + alfa + ")";
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(10, s * 0.34);
        this.mol.bindinger.forEach(function (bd) {
            if (!ids[bd.a] || !ids[bd.b]) return;
            var A = mig.px(bd.a), B = mig.px(bd.b);
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.stroke();
        });
        this.mol.atomer.forEach(function (a) {
            if (!ids[a.id] || mig.mol.grad(a.id)) return;
            var p = mig.px(a);
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(8, s * 0.3), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };

    /* Den lille forestilling ved et atom uden bindinger: en ring pulserer, og
       en svag zigzag med fire C vokser mod hoejre, som naar man traekker */
    P.tegnDemo = function (ctx, p, s, tid) {
        var puls = 0.5 + 0.5 * Math.sin(tid * 3);
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(10, s * 0.22) + puls * 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(61, 158, 224, " + (0.25 + 0.4 * (1 - puls)) + ")";
        ctx.lineWidth = 3;
        ctx.stroke();
        var fase = (tid % 3.2) / 3.2;
        var vis = NK.klamp(fase * 5, 0, 3);
        var alfa = fase > 0.82 ? (1 - fase) / 0.18 : 1;
        var x = p.x, y = p.y;
        ctx.strokeStyle = "rgba(61, 158, 224, " + (0.5 * alfa) + ")";
        ctx.lineWidth = Math.max(2.5, s * 0.06);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (var i = 0; i < 3 && i < vis; i++) {
            var v = i % 2 === 0 ? -TRIN : TRIN, l = Math.min(1, vis - i) * s;
            x += Math.cos(v) * l;
            y += Math.sin(v) * l;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        /* Musen, der traekker */
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(61, 158, 224, " + (0.8 * alfa) + ")";
        ctx.fill();
        ctx.font = "600 13px 'Segoe UI', sans-serif";
        ctx.fillStyle = "rgba(42, 118, 172, " + (0.9 * alfa) + ")";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("træk", x + 10, y - 12);
        ctx.restore();
    };

    NK.Tegnebraet = Tegnebraet;
}());
