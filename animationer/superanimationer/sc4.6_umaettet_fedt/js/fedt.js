/* =====================================================================
   fedt.js - kemien: fedtsyrerne, fedtstofferne i glassene og modellen
   for dibrom i det oeverste lag

   NK.Fedt.SYRER      fedtsyrerne (antal C, hvor dobbeltbindingerne sidder)
   NK.Fedt.FEDT       fedtstofferne: ét molekyle af hvert i luppen (det
                      samme som paa tavlen paa fane 1) og bogens tabel
                      over maettede og umaettede fedtsyrer
   NK.Fedt.kaede      en fedtsyres kaede som zigzagformel med knaek
   NK.Fedt.formLup    et fedtstofmolekyle, som luppen tegner det
   NK.Fedt.formStor   et fedtstofmolekyle med esterbindingerne (fane 2)
   NK.Proeve          det oeverste lag i ét glas: molekylerne, de dibrom-
                      molekyler, der er dryppet i, og hvilke dobbelt-
                      bindinger de har adderet til

   Modellen: én draabe bromvand giver ét dibrommolekyle i luppen. Hvert
   dibrommolekyle adderer til én ledig dobbeltbinding. Er der ingen
   ledige, bliver det frit i laget og giver det farve. Saa farven bliver
   ved efter draabe nummer (antal dobbeltbindinger + 1), og det er det
   tal, eleven taeller. Farven i glasset regnes af antallet af frie
   dibrommolekyler (js/glas.js).

   Laengder er i bindingslaengder (én C-C-binding = 1).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = {};

    /* ----- Fedtsyrerne -----------------------------------------------------------
       nC: antal carbonatomer (carbonatomet i carboxylgruppen taeller med, som i
       bogen). cis: numrene paa de C-atomer, hvor en cis-dobbeltbinding begynder
       (C9=C10 osv.). EPA er en omega-3-fedtsyre fra fisk. */
    F.SYRER = [
        { id: "La",  navn: "laurinsyre",   nC: 12, cis: [] },
        { id: "M",   navn: "myristinsyre", nC: 14, cis: [] },
        { id: "P",   navn: "palmitinsyre", nC: 16, cis: [] },
        { id: "S",   navn: "stearinsyre",  nC: 18, cis: [] },
        { id: "O",   navn: "oliesyre",     nC: 18, cis: [9] },
        { id: "L",   navn: "linolsyre",    nC: 18, cis: [9, 12] },
        { id: "EPA", navn: "EPA",          nC: 20, cis: [5, 8, 11, 14, 17] }
    ];
    var syreEfterId = {};
    F.SYRER.forEach(function (s) {
        s.db = s.cis.length;
        s.slags = s.db === 0 ? "mættet" : (s.db === 1 ? "monoumættet" : "polyumættet");
        s.Navn = s.navn.charAt(0).toUpperCase() + s.navn.slice(1);
        syreEfterId[s.id] = s;
    });
    F.syre = function (id) { return syreEfterId[id] || null; };

    /* Farven paa kaeden efter slagsen (som i sc4.5, hvor stearinsyre er lilla,
       oliesyre groen og linolsyre blaa) */
    F.FARVE = { "mættet": "#c4a3f2", "monoumættet": "#6fd08c", "polyumættet": "#5fb3f0" };

    F.dbTekst = function (n) {
        return n === 0 ? "ingen dobbeltbindinger" : (n === 1 ? "1 dobbeltbinding" : n + " dobbeltbindinger");
    };

    /* ----- Fedtstofferne -------------------------------------------------------
       mol: det ene molekyle, luppen viser (tre fedtsyrer), i en liste, saa
       proeven og luppen kan klare flere. Brugeren 12. nov. 2026: "lidt mange
       dryp til hvert molekyle", saa luppen viser ét molekyle, ikke to. Det er
       det samme molekyle som paa tavlen paa fane 1 (Ét molekyle), saa eleven
       kan genkende det. Valgt, saa slagsen, der er mest af, er den samme som i
       tabellen, og saa iodtallet, regnet af molekylet, ligger i intervallet
       fra tabellen paa Wikipedia, som oevelse 4.6b bruger (se README).
       tabel: procent af fedtsyrerne (maettet, mono, poly) fra tabellen i
       Kemibogens afsnit 4.6; tran fra USDA (FDC 173577), afrundet. */
    F.FEDT = {
        kokos:    { navn: "kokosfedt",    Navn: "Kokosfedt",    mol: [["La", "M", "P"]],  tabel: [91, 7, 2] },
        smoer:    { navn: "smør",         Navn: "Smør",         mol: [["P", "S", "O"]],   tabel: [66, 30, 4] },
        oliven:   { navn: "olivenolie",   Navn: "Olivenolie",   mol: [["O", "O", "O"]],   tabel: [15, 75, 10] },
        raps:     { navn: "rapsolie",     Navn: "Rapsolie",     mol: [["O", "O", "L"]],   tabel: [7, 63, 30] },
        solsikke: { navn: "solsikkeolie", Navn: "Solsikkeolie", mol: [["O", "L", "L"]],   tabel: [10, 20, 70] },
        tran:     { navn: "tran",         Navn: "Tran",         mol: [["P", "O", "EPA"]], tabel: [25, 50, 25] },
        heptan:   { navn: "heptan",       Navn: "Kun heptan",   mol: [], heptan: true }
    };

    F.antalDbMol = function (kaeder) {
        var n = 0;
        kaeder.forEach(function (id) { n += F.syre(id).db; });
        return n;
    };

    F.antalDb = function (fedtId) {
        var n = 0;
        F.FEDT[fedtId].mol.forEach(function (m) { n += F.antalDbMol(m); });
        return n;
    };

    /* Den draabe, hvor farven bliver ved: alle dobbeltbindinger er brugt, og
       dibrom fra den naeste draabe kan ikke addere */
    F.endepunkt = function (fedtId) { return F.antalDb(fedtId) + 1; };

    /* ----- Kaeden som zigzagformel (fra sc4.5) -------------------------------------
       C1 er carbonylkulstoffet i (0, 0). Den foerste binding gaar 30° ned til
       hoejre (fortegn 1), og ellers skifter kaeden retning med 60° i hvert
       knaek. Ved en cis-dobbeltbinding Ca=Ca+1 drejer kaeden 45° samme vej ved
       begge C-atomer, saa de to nabobindinger ligger paa samme side (cis), og
       kaeden boejer 30°. Giver { pkt: [{x, y}] for C1..Cn, dobbelt: [bindingens
       nr] }. Binding k gaar fra pkt[k] til pkt[k+1]. */
    var kaedeCache = {};
    function kaedeRaa(syre, fortegn) {
        var cis = syre.cis, grad = Math.PI / 180;
        var pkt = [{ x: 0, y: 0 }], dobbelt = [];
        var retning = 30 * grad, fortegnDrej = 1;
        var x = 0, y = 0;
        for (var k = 0; k < syre.nC - 1; k++) {
            if (k > 0) {
                var cNr = k + 1;
                var foer = cis.indexOf(cNr) >= 0, efter = cis.indexOf(cNr - 1) >= 0, drej;
                if (efter) {
                    drej = 45 * grad * fortegnDrej;
                } else {
                    fortegnDrej = -fortegnDrej;
                    drej = (foer ? 45 : 60) * grad * fortegnDrej;
                }
                retning += drej;
            }
            x += Math.cos(retning);
            y += Math.sin(retning) * fortegn;
            pkt.push({ x: x, y: y });
            if (cis.indexOf(k + 1) >= 0) dobbelt.push(k);
        }
        return { pkt: pkt, dobbelt: dobbelt };
    }

    /* Kaeden boejer altid nedad (y vokser), saa kaederne i et molekyle ikke
       krydser hinanden: en kaede, der boejer opad med fortegn 1 (som EPA),
       vendes. */
    F.kaede = function (id) {
        if (kaedeCache[id]) return kaedeCache[id];
        var syre = F.syre(id), k = kaedeRaa(syre, 1);
        var slut = k.pkt[k.pkt.length - 1];
        var fortegn = 1;
        if (syre.db > 0 && slut.y < 0) { k = kaedeRaa(syre, -1); fortegn = -1; }
        k.fortegn = fortegn;
        kaedeCache[id] = k;
        return k;
    };

    /* Den anden streg i en dobbeltbinding ligger paa indersiden af knaekket:
       paa den side, hvor nabobindingerne er. Giver +1 eller -1. */
    F.dobbeltSide = function (pkt, k) {
        var a = pkt[k], b = pkt[k + 1];
        var n1 = pkt[Math.max(0, k - 1)], n2 = pkt[Math.min(pkt.length - 1, k + 2)];
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var nx = (n1.x + n2.x) / 2 - mx, ny = (n1.y + n2.y) / 2 - my;
        var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var px = -dy / l, py = dx / l;
        return (px * nx + py * ny) >= 0 ? 1 : -1;
    };

    /* Hvor bromatomet sidder, naar dibrom har adderet til dobbeltbindingen
       k: paa ydersiden af knaekket, et stykke ud fra hvert carbonatom.
       Giver [{ c, br }, { c, br }] i samme maal som pkt. */
    F.bromSteder = function (pkt, k, laengde) {
        var a = pkt[k], b = pkt[k + 1], side = -F.dobbeltSide(pkt, k);
        var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / l * side, ny = dx / l * side;
        var L = laengde || 1;
        return [a, b].map(function (c) { return { c: c, br: { x: c.x + nx * L, y: c.y + ny * L } }; });
    };

    function kasse(punkter) {
        var k = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        punkter.forEach(function (p) {
            k.minX = Math.min(k.minX, p.x); k.maxX = Math.max(k.maxX, p.x);
            k.minY = Math.min(k.minY, p.y); k.maxY = Math.max(k.maxY, p.y);
        });
        return k;
    }

    /* Kaederne sorteres, saa den mest boejede sidder nederst: alle boejer
       nedad, saa de ikke krydser. */
    function sorter(kaeder) {
        return kaeder.map(function (id, i) { return { id: id, i: i }; }).sort(function (a, b) {
            return F.syre(a.id).db - F.syre(b.id).db || a.i - b.i;
        });
    }

    /* Hvor raekkerne staar (y0), med mindst G imellem. Boejer to naboer lige
       meget, loeber de parallelt efter knaekkene, og afstanden mellem dem
       skrumper til G · cos(vinklen). Saa faar de mere luft: mindst
       maal / cos(vinklen), hvor vinklen er den oeverste kaedes boejning (den
       nederste boejer mindst lige saa meget og kommer kun laengere vaek). */
    function raekkeY(s, G, maal) {
        var y = [0];
        for (var j = 1; j < s.length; j++) {
            var v = Math.min(70, 30 * F.syre(s[j - 1].id).db) * Math.PI / 180;
            y.push(y[j - 1] + Math.max(G, maal / Math.cos(v)));
        }
        var midt = (y[0] + y[y.length - 1]) / 2;
        return y.map(function (v2) { return v2 - midt; });
    }

    /* ----- Et molekyle i luppen ------------------------------------------------------
       Glycerol er en lodret streg ved x = 0 med tre C-atomer, mindst G = 2,1
       fra hinanden (luft til bromatomerne, se raekkeY). Fra hvert gaar en kort binding ud til C1 i x = 1, og derfra
       kaeden. Esterbindingerne er ikke skrevet ud i luppen.
       Giver { kaeder: [{ id, nr, pkt, dobbelt }], kasse }. nr er kaedens plads
       i molekylets liste (den, data og Proeve bruger). */
    var G_LUP = 2.1;
    var lupCache = {};
    F.formLup = function (kaeder) {
        var noegle = kaeder.join(",");
        if (lupCache[noegle]) return lupCache[noegle];
        var s = sorter(kaeder), n = s.length, alle = [], ys = raekkeY(s, G_LUP, 1.6);
        var ud = { kaeder: [], G: G_LUP, n: n };
        s.forEach(function (x, j) {
            var y0 = ys[j], k = F.kaede(x.id);
            var pkt = k.pkt.map(function (p) { return { x: p.x + 1, y: p.y + y0 }; });
            ud.kaeder.push({ id: x.id, nr: x.i, y0: y0, pkt: pkt, dobbelt: k.dobbelt });
            alle = alle.concat(pkt);
            /* kassen skal ogsaa have plads til bromatomerne (kugler i luppen) */
            k.dobbelt.forEach(function (kk) {
                F.bromSteder(pkt, kk, 1.4).forEach(function (st) { alle.push(st.br); });
            });
        });
        alle.push({ x: 0, y: ys[0] - 0.3 }, { x: 0, y: ys[n - 1] + 0.3 });
        ud.kasse = kasse(alle);
        lupCache[noegle] = ud;
        return ud;
    };

    /* ----- Et molekyle med esterbindingerne (fane 2) ------------------------------------
       Som i bogens figur: CH₂, CH og CH₂ under hinanden ved x = 0, derfra -O-
       og carbonylkulstoffet C1 med =O, og saa kaeden. Mindst G = 2,6
       mellem raekkerne, saa =O ikke roerer kaeden ovenover (se raekkeY).
       Giver { raekker: [{ id, nr, y0, glycerol, O, C1, Oc, pkt, dobbelt, f }], kasse } */
    var G_STOR = 2.6;
    var storCache = {};
    F.formStor = function (kaeder) {
        var noegle = kaeder.join(",");
        if (storCache[noegle]) return storCache[noegle];
        var s = sorter(kaeder), n = s.length, alle = [], ys = raekkeY(s, G_STOR, 2.0);
        var ud = { raekker: [], G: G_STOR, n: n };
        s.forEach(function (x, j) {
            var y0 = ys[j], k = F.kaede(x.id), f = k.fortegn;
            var C1 = { x: 2.1, y: y0 - 0.5 * f };
            var pkt = k.pkt.map(function (p) { return { x: p.x + C1.x, y: p.y + C1.y }; });
            var r = {
                id: x.id, nr: x.i, y0: y0, f: f,
                glycerol: { x: 0, y: y0, tekst: j === 1 ? "CH" : "CH₂" },
                O: { x: 1.25, y: y0 },
                C1: C1,
                Oc: { x: C1.x, y: C1.y - 1.0 * f },
                pkt: pkt, dobbelt: k.dobbelt
            };
            ud.raekker.push(r);
            alle = alle.concat(pkt, [r.Oc, { x: -1.5, y: y0 }]);
            k.dobbelt.forEach(function (kk) {
                F.bromSteder(pkt, kk, 1.5).forEach(function (st) { alle.push(st.br); });
            });
        });
        ud.kasse = kasse(alle);
        storCache[noegle] = ud;
        return ud;
    };

    /* ----- Det oeverste lag i ét glas ----------------------------------------------------
       Proeven ved kun, hvad der er sket: hvilke dobbeltbindinger der har faaet
       brom, og hvor hvert dibrommolekyle er paa vej hen. Hvor tingene staar paa
       skaermen, regner luppen (js/lup.js) ud fra det. */
    var TRANSIT = 0.6;      /* sekunder om at finde en dobbeltbinding */
    var VAEK = 0.3;         /* sekunder om at blive en del af molekylet */

    function Proeve(fedtId) {
        this.fedtId = fedtId;
        this.fedt = F.FEDT[fedtId];
        this.nulstil();
    }

    var P = Proeve.prototype;

    P.nulstil = function () {
        var mig = this;
        this.draaber = 0;
        this.dibrom = [];
        this.br = {};               /* "m.nr.k" -> true, naar dobbeltbindingen har adderet */
        this.ledige = [];
        /* Dobbeltbindingerne i den raekkefoelge, dibrom finder dem (skiftevis i
           molekylerne, hvis der er flere) */
        var lister = this.fedt.mol.map(function (kaeder, m) {
            var l = [];
            kaeder.forEach(function (id, nr) {
                F.kaede(id).dobbelt.forEach(function (k) { l.push({ m: m, nr: nr, k: k }); });
            });
            return l;
        });
        var mest = Math.max.apply(null, [0].concat(lister.map(function (l) { return l.length; })));
        for (var i = 0; i < mest; i++) lister.forEach(function (l) { if (l[i]) mig.ledige.push(l[i]); });
        this.antalDb = this.ledige.length;
    };

    P.noegle = function (s) { return s.m + "." + s.nr + "." + s.k; };

    /* Én draabe: ét dibrommolekyle kommer op i laget. Det finder en ledig
       dobbeltbinding, hvis der er en. */
    P.dryp = function () {
        this.draaber++;
        var maal = this.ledige.length ? this.ledige.shift() : null;
        var i = this.dibrom.length;
        this.dibrom.push({
            maal: maal, p: 0, sat: false, vaek: 0,
            fx: 0.12 + 0.76 * ((i * 0.618 + 0.21) % 1), fy: 0.92,
            vx: (i % 2 ? 1 : -1) * NK.r(0.05, 0.09), vy: -NK.r(0.06, 0.1), vink: NK.r(0, 3.14), vr: NK.r(-1, 1), fase: NK.r(0, 6.28)
        });
    };

    P.opdater = function (dt) {
        var mig = this;
        this.dibrom.forEach(function (d) {
            if (d.sat) { d.vaek = Math.min(1, d.vaek + dt / VAEK); return; }
            if (d.maal) {
                d.p = Math.min(1, d.p + dt / TRANSIT);
                d.vink += dt * 3;
                if (d.p >= 1) { d.sat = true; mig.br[mig.noegle(d.maal)] = true; }
                return;
            }
            /* frit: driver rundt i laget */
            d.fase += dt;
            d.fx += d.vx * dt;
            d.fy += d.vy * dt;
            d.vink += d.vr * dt;
            if (d.fx < 0.05) { d.fx = 0.05; d.vx = Math.abs(d.vx); }
            if (d.fx > 0.95) { d.fx = 0.95; d.vx = -Math.abs(d.vx); }
            if (d.fy < 0.1) { d.fy = 0.1; d.vy = Math.abs(d.vy); }
            if (d.fy > 0.9) { d.fy = 0.9; d.vy = -Math.abs(d.vy); }
        });
    };

    /* Saa meget dibrom giver farve lige nu: de frie, dem paa vej, og dem, der
       er ved at blive en del af et molekyle */
    P.farveMaengde = function () {
        var n = 0;
        this.dibrom.forEach(function (d) { n += d.sat ? 1 - d.vaek : 1; });
        return n;
    };

    /* De frie dibrommolekyler, der ikke fandt en dobbeltbinding */
    P.frie = function () {
        return this.dibrom.filter(function (d) { return !d.maal; }).length;
    };

    /* Alt er faldet til ro: ingen er paa vej, og alle, der har adderet, er
       blevet en del af molekylet */
    P.ro = function () {
        return this.dibrom.every(function (d) { return !d.maal || (d.sat && d.vaek >= 1); });
    };

    P.harBrom = function (m, nr, k) { return !!this.br[m + "." + nr + "." + k]; };

    /* Antal dobbeltbindinger, der har adderet dibrom */
    P.adderet = function () { return Object.keys(this.br).length; };

    /* Faerdig med det samme (Vis svaret): dryppet til farven blev ved */
    P.tilEndepunkt = function () {
        this.nulstil();
        var n = F.endepunkt(this.fedtId);
        for (var i = 0; i < n; i++) this.dryp();
        this.opdater(10);
        this.opdater(10);
    };

    Proeve.TRANSIT = TRANSIT;
    NK.Proeve = Proeve;
    NK.Fedt = F;
}());
