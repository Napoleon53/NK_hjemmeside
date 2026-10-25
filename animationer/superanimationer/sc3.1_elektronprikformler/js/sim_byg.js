/* =====================================================================
   sim_byg.js - fanen Byg

   Hvert molekyle bygges i tre trin, som i bogen:

     1 Byg atomet. Foerste gang et grundstof dukker op, saetter eleven
       selv dets elektroner i yderste skal. Hver side har to stiplede
       pladser: et klik paa en tom plads (eller ved siden) saetter en
       elektron, et klik paa en elektron fjerner den, og et hoejreklik
       ved en side fjerner én (brugerens oenske 25. okt. 2026: begge dele).
       Det periodiske system med hovedgrupperne staar ved siden af.
       Indsend svar holder tegningen op mod antallet (hovedgruppen) og
       bogens regel: de foerste fire faar hver sin side.
     2 Byg molekylet. Atomerne ligger paa bordet med elevens egne
       elektroner. Eleven traekker en uparret elektron hen paa en uparret
       elektron paa et andet atom (eller klikker paa dem efter hinanden),
       og de bliver et faelles elektronpar. Et klik paa et faelles par
       skiller det ad igen. Programmet laver aldrig en binding selv.
       Indsend svar: er der uparrede elektroner tilbage, faar eleven at
       vide hvor.
     3 Tael efter. Eleven taeller elektronerne omkring ét atom og sender
       tallet ind. Bagefter staar stregformlen ved siden af.

   Intet bedoemmes, foer eleven trykker Indsend svar, og et forkert svar
   koster stjernen (brugeren 24. okt. 2026). Hint og svar staar paa
   kortet oeverst i scenen (js/fane.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var P = NK.Prik;
    var T = NK.T;

    var FART = 9;          /* atomerne glider mod deres plads */
    var TAEL_FART = 6;     /* prikker pr. sekund i optaellingen */

    /* Grundstofferne i formlens raekkefoelge: "CH₂O" -> C, H, O */
    function grundstoffer(mol) {
        var ud = [];
        (mol.f.match(/[A-Z][a-z]?/g) || []).forEach(function (s) {
            Object.keys(D.EL).forEach(function (z) {
                if (D.EL[z].s === s && ud.indexOf(+z) < 0) ud.push(+z);
            });
        });
        return ud;
    }

    NK.SimByg = function () {
        this.tegnede = {};
        this.vis = {};
        this.harBundet = false;
        this.startFane(D.MOLEKYLER.map(function (m) { return { id: m.id, chip: m.f, titel: NK.stort(m.navn) }; }));
        var mig = this;
        /* Hoejreklik ved en side af atomet fjerner en elektron */
        this.L.canvas.addEventListener("contextmenu", function (e) {
            if (mig.trin !== "atom") return;
            e.preventDefault();
            mig.hoejreKlik(mig.L.punkt(e));
        });
        var foerste = 0;
        for (var i = 0; i < this.status.length; i++) if (!this.status[i].loest) { foerste = i; break; }
        this.vaelg(foerste);
    };

    var P_ = NK.SimByg.prototype;
    NK.Fane.paa(P_, { navn: "b", naesteFane: "fane-f", naesteNavn: "Find fejlen", naesteTekst: "Næste molekyle →" });

    /* ----- Opgaven ------------------------------------------------------------ */
    P_.lavOpgave = function (i) {
        var mol = D.MOLEKYLER[i];
        var mig = this;
        this.mol = mol;
        this.nye = grundstoffer(mol).filter(function (z) { return !mig.tegnede[z]; });
        this.atomNr = 0;
        this.trin = this.nye.length ? "atom" : "byg";
        this.tegning = [0, 0, 0, 0];
        this.pladser = [[0, 0], [0, 0], [0, 0], [0, 0]];
        this.overPlads = null;
        this.M = P.nytMolekyle(mol.atomer, this.tegnede);
        this.talValg = null;
        this.talForkert = {};
        this.taelling = null;
        this.haand = null;
        this.valgtE = null;
        this.over = null;
        this.markering = {};
        this.nytPar = null;
        this.stregAlfa = 0;
        this.vis = {};
        this.pl = null;
        this.G = null;
        this.straks = true;
    };

    P_.atomZ = function () { return this.nye[this.atomNr]; };
    P_.omAtom = function () { return this.M.atomer[this.mol.om]; };

    P_.delNu = function () {
        var mol = this.mol;
        if (this.trin === "atom") {
            var el = D.EL[this.atomZ()];
            return {
                chip: "Byg atomet" + (this.nye.length > 1 ? " " + (this.atomNr + 1) + " af " + this.nye.length : ""),
                tekst: mol.f + ": Byg et " + el.atom + ". Klik på pladserne omkring " + el.s + " for at sætte elektronerne i yderste skal. Et klik på en elektron fjerner den."
            };
        }
        if (this.trin === "byg") {
            return {
                chip: "Byg molekylet",
                tekst: "Byg " + mol.f + ": Træk en uparret elektron hen på en uparret elektron på et andet atom. Så deler de to atomer et elektronpar."
            };
        }
        return {
            chip: "Tæl efter",
            tekst: "Hvor mange elektroner har " + D.omNavn(mol) + " omkring sig i " + mol.f + "?",
            ekstra: this.talHTML()
        };
    };

    P_.kanIndsende = function () {
        if (this.trin === "atom") return P.sum(this.tegning) > 0;
        if (this.trin === "byg") return this.M.bindinger.length > 0;
        return this.talValg !== null && this.talValg !== undefined;
    };

    P_.indsendTekst = function () {
        if (this.trin === "atom") {
            var n = P.sum(this.tegning);
            return n ? "Indsend svar: " + n + (n === 1 ? " elektron" : " elektroner") : "Indsend svar";
        }
        if (this.trin === "tael" && this.talValg) return "Indsend svar: " + this.talValg;
        return "Indsend svar";
    };

    P_.kortKlik = function (e) {
        if (this.trin === "tael") this.talKlik(e);
    };

    P_.indsend = function () {
        if (this.trin === "atom") {
            var z = this.atomZ();
            var f = P.tegningFejl(z, this.tegning);
            if (f) { this.fejlLinje(f.slags === "antal" ? D.antalHint(z, f.tal) : D.FORDELING); return; }
            this.tegnede[z] = this.tegning.slice();
            this.mellemsvar("selv", D.atomRigtigt(z), this.atomNr + 1 < this.nye.length ? "Næste atom →" : "Byg molekylet →");
            return;
        }
        if (this.trin === "byg") {
            var r = P.faerdig(this.M);
            if (r.ok) {
                this.markering = {};
                this.mellemsvar("selv", this.mol.bygt, "Tæl efter →");
                return;
            }
            this.markering = {};
            var mig = this;
            r.enlige.forEach(function (a) { mig.markering[a.id] = true; });
            this.fejlLinje(this.bygFejl(r));
            return;
        }
        var om = this.omAtom();
        var st = P.status(this.M, om);
        if (this.talValg === st.nu) {
            this.taelling = { id: om.id, n: 0, faerdig: false };
            this.loest("selv", D.taelForklaring(om.z, st) + " Til højre er hvert fælles elektronpar tegnet som en streg.");
            return;
        }
        var galt = this.talValg;
        this.talForkert[galt] = true;
        this.talValg = null;
        this.visKort();
        this.fejlLinje(D.taelleHint(st, galt));
    };

    /* Hvad der mangler, naar prikformlen ikke er faerdig */
    P_.bygFejl = function (r) {
        var M = this.M;
        var tekst;
        if (r.enlige.length === 1) {
            var a = r.enlige[0], n = P.enlige(M, a);
            tekst = NK.stort(D.EL[a.z].navn) + " har stadig " + n + (n === 1 ? " uparret elektron." : " uparrede elektroner.") +
                " Hver uparret elektron skal være med i et fælles elektronpar.";
        } else {
            tekst = "Atomerne med rød ring har stadig uparrede elektroner. Hver uparret elektron skal være med i et fælles elektronpar.";
        }
        if (!this.kanBindes()) tekst += " Klik på et fælles elektronpar for at skille det ad igen.";
        return tekst;
    };

    /* Kan to atomer med uparrede elektroner stadig dele et par? */
    P_.kanBindes = function () {
        var M = this.M;
        var dele = P.dele(M);
        function del(id) { for (var i = 0; i < dele.length; i++) if (dele[i].indexOf(id) >= 0) return i; return -1; }
        var enlige = M.atomer.filter(function (a) { return P.enlige(M, a) > 0; });
        for (var i = 0; i < enlige.length; i++) {
            for (var j = i + 1; j < enlige.length; j++) {
                var a = enlige[i], b = enlige[j];
                var x = P.find(M, a, b);
                if (x ? x.n < 3 : del(a.id) !== del(b.id)) return true;
            }
        }
        return false;
    };

    P_.visSvar = function () {
        if (this.trin === "atom") {
            var z = this.atomZ();
            this.tegning = P.standard(z);
            this.tegnede[z] = this.tegning.slice();
            this.mellemsvar("svar", D.atomRigtigt(z), this.atomNr + 1 < this.nye.length ? "Næste atom →" : "Byg molekylet →");
            return;
        }
        if (this.trin === "byg") {
            this.M = P.facit(this.mol, this.tegnede);
            this.pl = null;
            this.markering = {};
            this.haand = null;
            this.valgtE = null;
            this.mellemsvar("svar", this.mol.bygt, "Tæl efter →");
            return;
        }
        var om = this.omAtom();
        var st = P.status(this.M, om);
        this.taelling = { id: om.id, n: 0, faerdig: false };
        this.loest("svar", D.taelForklaring(om.z, st) + " Til højre er hvert fælles elektronpar tegnet som en streg.", st.nu + " elektroner.");
    };

    /* Eleven trykker videre paa et groent mellemsvar */
    P_.videre = function () {
        if (this.trin === "atom") {
            this.atomNr++;
            if (this.atomNr < this.nye.length) {
                this.tegning = [0, 0, 0, 0];
                this.pladser = [[0, 0], [0, 0], [0, 0], [0, 0]];
                this.nyDel();
                return;
            }
            this.trin = "byg";
            this.M = P.nytMolekyle(this.mol.atomer, this.tegnede);
            this.vis = {};
            this.pl = null;
            this.G = null;
            this.straks = true;
            this.nyDel();
            this.layout();
            return;
        }
        if (this.trin === "byg") {
            this.trin = "tael";
            this.talValg = null;
            this.talForkert = {};
            this.nyDel();
        }
    };

    P_.hintTrin = function () {
        if (this.trin === "atom") {
            var z = this.atomZ(), el = D.EL[z];
            return [
                "Find " + el.s + " i det periodiske system til højre. Hovedgruppens nummer er antallet af elektroner i yderste skal.",
                z === 1 ? "H står i hovedgruppe 1 og har 1 elektron. Den sættes ved én af siderne." :
                    el.s + " står i hovedgruppe " + el.g + ". De første fire elektroner får hver sin side af symbolet. Først derefter danner de par."
            ];
        }
        if (this.trin === "byg") return this.mol.hint;
        var om = this.omAtom();
        var st = P.status(this.M, om);
        return [
            "Tæl alle prikker omkring " + D.EL[om.z].navn + ": de frie elektroner og begge elektroner i hvert fælles elektronpar.",
            D.taelHint2(om.z, st)
        ];
    };

    /* ----- Plads paa scenen ------------------------------------------------------ */
    P_.layout = function () {
        var W = this.L.b, H = this.L.h;
        var top = this.top();
        var flade = { x: 16, y: top, b: Math.max(200, W - 32), h: Math.max(160, H - top - 14) };
        var lay = { W: W, H: H, flade: flade };
        /* Tegn atomet: atomet til venstre, det periodiske system til hoejre */
        lay.stor = NK.klamp(Math.min(flade.h * 0.22, flade.b * 0.09), 46, 84);
        lay.celle = Math.floor(NK.klamp(Math.min(flade.b * 0.46 / 8, flade.h * 0.78 / 5.2), 24, 50));
        var tabB = lay.celle * 8;
        var friB = flade.b - tabB;
        lay.atom = { x: flade.x + Math.max(lay.stor * 2.4, friB * 0.48), y: flade.y + flade.h * 0.5 };
        lay.tabel = { x: flade.x + flade.b - tabB - Math.max(10, friB * 0.06), y: flade.y + (flade.h - lay.celle * 4) / 2 + lay.celle * 0.45 };
        /* Bordet: symbolernes stoerrelse efter scenen */
        lay.F = NK.klamp(Math.min(flade.b / 14, flade.h / 6.4), 30, 62);
        this.lay = lay;
        this.saetAnker("flade", flade.x, flade.y, flade.b, flade.h);
    };

    /* Atomernes pladser paa bordet: delene (molekylerne og de loese atomer)
       side om side. Naar opgaven er loest, staar prikformlen til venstre og
       stregformlen til hoejre. */
    P_.bordPladser = function () {
        var lay = this.lay, M = this.M, fl = lay.flade;
        var F = lay.F, L = T.maal(F).bind;
        var dele = P.dele(M);
        var bokse = dele.map(function (del) {
            var xs = del.map(function (id) { return M.atomer[id].gx; }), ys = del.map(function (id) { return M.atomer[id].gy; });
            return { del: del, x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
        });
        var mellem = 1.45;
        var bredde = 0, hoejde = 0;
        bokse.forEach(function (b, i) { bredde += (b.x1 - b.x0) + (i ? mellem : 0); hoejde = Math.max(hoejde, b.y1 - b.y0); });
        var to = this.faerdig && this.trin === "tael";
        var plads = to ? fl.b * 0.42 : fl.b * 0.9;
        var k = Math.min(1, plads / Math.max(1, (bredde + 0.9) * L), fl.h * 0.78 / Math.max(1, (hoejde + 0.9) * L));
        F *= k; L *= k;
        var cx = to ? fl.x + fl.b * 0.27 : fl.x + fl.b / 2;
        var cy = fl.y + fl.h * 0.5;
        var x = cx - bredde * L / 2;
        var pos = {};
        bokse.forEach(function (b) {
            var my = (b.y0 + b.y1) / 2;
            b.del.forEach(function (id) {
                var a = M.atomer[id];
                pos[id] = { x: x + (a.gx - b.x0) * L, y: cy + (a.gy - my) * L };
            });
            x += (b.x1 - b.x0 + mellem) * L;
        });
        var streg = null;
        if (to) {
            streg = {};
            var sx = fl.x + fl.b * 0.76 - cx;
            Object.keys(pos).forEach(function (id) { streg[id] = { x: pos[id].x + sx, y: pos[id].y }; });
        }
        return { pos: pos, F: F, streg: streg, pil: to ? { x1: fl.x + fl.b * 0.47, x2: fl.x + fl.b * 0.55, y: cy } : null };
    };

    /* ----- Tegneloekken ---------------------------------------------------------- */
    P_.opdaterScene = function (dt) {
        if (this.trin === "atom" || !this.lay) return;
        var pl = this.bordPladser();
        this.pl = pl;
        var mig = this;
        Object.keys(pl.pos).forEach(function (id) {
            var m = pl.pos[id], v = mig.vis[id];
            if (!v || mig.straks) { mig.vis[id] = { x: m.x, y: m.y }; return; }
            v.x = NK.mod(v.x, m.x, FART, dt);
            v.y = NK.mod(v.y, m.y, FART, dt);
        });
        this.straks = false;
        var t = this.taelling;
        if (t && !t.faerdig) {
            var antal = this.G ? T.atometsPrikker(this.G, this.M, this.M.atomer[t.id], this.vis).length : P.status(this.M, this.M.atomer[t.id]).nu;
            t.n += dt * TAEL_FART;
            if (t.n >= antal) { t.n = antal; t.faerdig = true; }
        }
        if (this.faerdig && this.stregAlfa < 1) this.stregAlfa = Math.min(1, this.stregAlfa + dt * 1.4);
        if (this.nytPar) { this.nytPar.t += dt; if (this.nytPar.t > 0.8) this.nytPar = null; }
    };

    P_.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        this.L.ryd("#14141a");
        if (!lay) return;
        if (this.trin === "atom") { this.tegnAtomTrin(ctx); this.tegnSejr(ctx, lay.W, lay.H); return; }
        if (!this.pl) this.opdaterScene(0);
        var pl = this.pl, M = this.M;
        var aaben = !this.faerdig && !this.venter;
        var ringe = {};
        var mig = this;
        Object.keys(this.markering).forEach(function (id) { ringe[id] = "roed"; });
        if (this.trin === "tael") ringe[this.mol.om] = this.faerdig ? "groen" : "gul";
        var vis = {
            tid: this.tid,
            gloed: this.trin === "byg" && aaben,
            skjul: this.haand && this.haand.flyttet ? this.haand : null,
            valgt: this.valgtE,
            over: aaben && this.trin === "byg" ? this.over : null,
            maal: !!(this.haand && this.haand.flyttet),
            ringe: ringe,
            taelling: this.taelling
        };
        this.G = T.molekyle(ctx, M, this.vis, pl.F, vis);

        /* Et nyt faelles par lyser kort op */
        if (this.nytPar) {
            var np = this.nytPar;
            this.G.par.forEach(function (q) {
                if (q.binding !== np.binding) return;
                T.ring(ctx, q.x, q.y, T.maal(pl.F).par * 2.4 + np.t * 18, "rgba(255, 255, 255, " + (0.7 * (1 - np.t / 0.8)).toFixed(3) + ")", { bredde: 2 });
            });
        }

        /* Foerste gang: en stiplet pil viser, hvad der skal traekkes hvorhen */
        if (this.trin === "byg" && aaben && !this.harBundet && !M.bindinger.length && !this.haand) this.tegnVejledning(ctx);

        /* Elektronen i haanden og en elastik hjem til atomet */
        var h = this.haand;
        if (h && h.flyttet) {
            var hjem = this.G.frie.filter(function (d) { return d.id === h.id && d.side === h.side; })[0];
            var m = T.maal(pl.F);
            if (hjem) {
                ctx.save();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
                ctx.setLineDash([4, 5]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(hjem.x, hjem.y);
                ctx.lineTo(h.x, h.y);
                ctx.stroke();
                ctx.restore();
                T.ring(ctx, hjem.x, hjem.y, m.prikR + 1, "rgba(255, 255, 255, 0.35)", { bredde: 1.4, stiplet: [2, 3] });
            }
            ctx.save();
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 12;
            T.prik(ctx, h.x, h.y, m.prikR * 1.35, D.EL[M.atomer[h.id].z].farve);
            ctx.restore();
        }

        /* Loest: stregformlen ved siden af */
        if (this.faerdig && pl.streg) {
            var a = NK.blod(this.stregAlfa);
            var fs = Math.round(NK.klamp(pl.F * 0.36, 13, 16));
            var under = this.underkant(pl);
            T.pil(ctx, pl.pil.x1, pl.pil.x2, pl.pil.y, "rgba(201, 208, 217, " + (0.8 * a).toFixed(3) + ")");
            T.stregformel(ctx, M, pl.streg, pl.F, a);
            NK.tekst(ctx, "Elektronprikformel", this.midtX(pl.pos), under, { font: "700 " + fs + "px 'Segoe UI', sans-serif", farve: "#a9b0ba", justering: "center", alfa: a });
            NK.tekst(ctx, "Stregformel", this.midtX(pl.streg), under, { font: "700 " + fs + "px 'Segoe UI', sans-serif", farve: "#a9b0ba", justering: "center", alfa: a });
        }
        this.tegnSejr(ctx, lay.W, lay.H);
    };

    P_.midtX = function (pos) {
        var xs = Object.keys(pos).map(function (id) { return pos[id].x; });
        return (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
    };

    P_.underkant = function (pl) {
        var ys = Object.keys(pl.pos).map(function (id) { return pl.pos[id].y; });
        return Math.max.apply(null, ys) + pl.F * 2.1;
    };

    /* Den stiplede pil fra en uparret elektron paa det foerste atom til en
       paa det naeste, og et skilt, der siger, hvad man goer */
    P_.tegnVejledning = function (ctx) {
        var G = this.G;
        var a = this.M.atomer[0], b = null;
        for (var i = 1; i < this.M.atomer.length; i++) if (this.M.atomer[i].z !== 1 || a.z === 1) { b = this.M.atomer[i]; break; }
        if (!b) return;
        var fra = null, til = null, bedst = Infinity;
        G.frie.forEach(function (d) {
            if (!d.enlig || d.id !== a.id) return;
            G.frie.forEach(function (e) {
                if (!e.enlig || e.id !== b.id) return;
                var dd = Math.hypot(d.x - e.x, d.y - e.y);
                if (dd < bedst) { bedst = dd; fra = d; til = e; }
            });
        });
        if (!fra) return;
        var t = (this.tid % 2.2) / 2.2;
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.85)";
        ctx.fillStyle = "rgba(242, 197, 61, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 6]);
        var mx = (fra.x + til.x) / 2, my = Math.min(fra.y, til.y) - 46;
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y - 10);
        ctx.quadraticCurveTo(mx, my, til.x, til.y - 10);
        ctx.stroke();
        ctx.setLineDash([]);
        /* En lille elektron, der viser vejen */
        var u = NK.blod(t), x = (1 - u) * (1 - u) * fra.x + 2 * (1 - u) * u * mx + u * u * til.x;
        var y = (1 - u) * (1 - u) * (fra.y - 10) + 2 * (1 - u) * u * my + u * u * (til.y - 10);
        ctx.globalAlpha = 0.9 * (1 - Math.max(0, t - 0.85) / 0.15);
        T.prik(ctx, x, y, T.maal(this.pl.F).prikR, D.EL[a.z].farve);
        ctx.restore();
        T.skilt(ctx, "Træk den uparrede elektron", mx, my - 24, 0.95);
    };

    /* Pladserne foelger antallet paa hver side (tegning), ogsaa naar
       tegningen er sat udefra (Vis svaret): én elektron sidder paa den
       foerste plads, to paa begge. */
    P_.synkPladser = function () {
        for (var s = 0; s < 4; s++) {
            var p = this.pladser[s], n = this.tegning[s];
            if (p[0] + p[1] !== n) this.pladser[s] = n === 0 ? [0, 0] : (n === 1 ? [1, 0] : [1, 1]);
        }
    };

    P_.saetPlads = function (s, k, v) {
        this.synkPladser();
        this.pladser[s][k] = v;
        this.tegning[s] = this.pladser[s][0] + this.pladser[s][1];
        if (this.fast.klasse === "skidt") this.besked("", "");
        this.nulstilHjaelp();
        this.visIndsend();
    };

    /* Den plads, et klik ved siden (ikke lige paa en plads) skal bruge:
       den naermeste tomme, eller den naermeste fyldte, naar der fjernes */
    P_.naermestePlads = function (side, pt, fyldt) {
        var lay = this.lay, mig = this, bedst = null;
        T.pladsPunkter(lay.atom.x, lay.atom.y, lay.stor, this.atomZ()).forEach(function (q) {
            if (q.side !== side || !!mig.pladser[side][q.plads] !== fyldt) return;
            var d = Math.hypot(pt.x - q.x, pt.y - q.y);
            if (!bedst || d < bedst.d) bedst = { side: side, plads: q.plads, d: d };
        });
        return bedst;
    };

    P_.hoejreKlik = function (pt) {
        if (!this.lay || this.trin !== "atom") return;
        var lay = this.lay, z = this.atomZ();
        var q = T.pladsVed(lay.atom.x, lay.atom.y, lay.stor, z, pt);
        var s = q ? q.side : T.sideVed(lay.atom.x, lay.atom.y, lay.stor, pt);
        if (s < 0) return;
        if (this.spaer()) return;
        this.synkPladser();
        var f = q && this.pladser[q.side][q.plads] ? q : this.naermestePlads(s, pt, true);
        if (f) this.saetPlads(f.side, f.plads, 0);
    };

    /* Foerste trin: atomet og det periodiske system */
    P_.tegnAtomTrin = function (ctx) {
        var lay = this.lay, z = this.atomZ();
        var aaben = !this.venter && !this.faerdig;
        var tegnet = this.venter || this.faerdig;
        this.synkPladser();
        T.byggeAtom(ctx, lay.atom.x, lay.atom.y, lay.stor, z, this.pladser, aaben ? this.overPlads : null);
        if (tegnet) T.ring(ctx, lay.atom.x, lay.atom.y, lay.stor * 1.55, this.mellem && this.mellem.maade === "svar" ? T.FARVE.gul : T.FARVE.groen, { bredde: 3, gloed: 12 });
        else T.ring(ctx, lay.atom.x, lay.atom.y, lay.stor * 1.55, "rgba(242, 197, 61, 0.55)", { bredde: 2, stiplet: [6, 6] });
        if (aaben && P.sum(this.tegning) === 0) T.skilt(ctx, "Klik på de stiplede pladser", lay.atom.x, lay.atom.y + lay.stor * 1.55 + 26);
        this.felter = T.periodisk(ctx, lay.tabel.x, lay.tabel.y, lay.celle, z, aaben && this.hjaelp >= 2 ? D.EL[z].g : null);
    };

    /* ----- Musen ----------------------------------------------------------------- */
    P_.radius = function () { return Math.max(15, T.maal(this.pl ? this.pl.F : 40).prikR * 3); };

    /* Den uparrede elektron under punktet (ikke paa atomet uden) */
    P_.enligVed = function (pt, uden) {
        if (!this.G) return null;
        var bedst = null, r = this.radius();
        this.G.frie.forEach(function (d) {
            if (!d.enlig || d.id === uden) return;
            var dd = Math.hypot(pt.x - d.x, pt.y - d.y);
            if (dd < r && (!bedst || dd < bedst.d)) bedst = { id: d.id, side: d.side, d: dd };
        });
        return bedst;
    };

    /* Et atom under punktet: dets naermeste uparrede elektron */
    P_.atomVed = function (pt, uden) {
        if (!this.G || !this.pl) return null;
        var M = this.M, F = this.pl.F, mig = this;
        var ramt = null;
        M.atomer.forEach(function (a) {
            if (a.id === uden) return;
            var p = mig.vis[a.id];
            if (p && Math.hypot(pt.x - p.x, pt.y - p.y) < T.ringR(D.EL[a.z].s, F)) ramt = a;
        });
        if (!ramt) return null;
        var bedst = null;
        this.G.frie.forEach(function (d) {
            if (!d.enlig || d.id !== ramt.id) return;
            var dd = Math.hypot(pt.x - d.x, pt.y - d.y);
            if (!bedst || dd < bedst.d) bedst = { id: d.id, side: d.side, d: dd };
        });
        return bedst || { id: ramt.id, side: -1, ingen: true };
    };

    P_.parVed = function (pt) {
        if (!this.G) return null;
        var r = T.maal(this.pl.F).par * 2.4, bedst = null;
        this.G.par.forEach(function (q) {
            var d = Math.hypot(pt.x - q.x, pt.y - q.y);
            if (d < Math.max(r, 13) && (!bedst || d < bedst.d)) bedst = { binding: q.binding, d: d };
        });
        return bedst;
    };

    P_.parretVed = function (pt) {
        if (!this.G) return null;
        var r = this.radius() * 0.8, fundet = null;
        this.G.frie.forEach(function (d) {
            if (!d.enlig && Math.hypot(pt.x - d.x, pt.y - d.y) < r) fundet = d;
        });
        return fundet;
    };

    P_.overScene = function (pt) {
        this.over = null;
        this.overPlads = null;
        if (!pt || !this.lay) return null;
        var aaben = !this.faerdig && !this.venter;
        if (this.trin === "atom") {
            if (!aaben) return null;
            var lay = this.lay;
            this.synkPladser();
            var q = T.pladsVed(lay.atom.x, lay.atom.y, lay.stor, this.atomZ(), pt);
            if (q) { this.overPlads = q; return "pointer"; }
            var s = T.sideVed(lay.atom.x, lay.atom.y, lay.stor, pt);
            if (s >= 0) { this.overPlads = this.naermestePlads(s, pt, false); return "pointer"; }
            return this.aedelgasVed(pt) ? "pointer" : null;
        }
        if (this.trin !== "byg" || !aaben) return null;
        var e = this.enligVed(pt);
        if (e) { this.over = e; return "greb"; }
        var q = this.parVed(pt);
        if (q) { this.over = q; return "pointer"; }
        return null;
    };

    P_.aedelgasVed = function (pt) {
        var f = (this.felter || []).filter(function (x) {
            return pt.x >= x.x && pt.x <= x.x + x.b && pt.y >= x.y && pt.y <= x.y + x.h;
        })[0];
        return f && D.AEDELGAS[f.s] ? f.s : null;
    };

    P_.nedScene = function (pt) {
        if (!this.lay) return false;
        if (this.trin === "atom") {
            var lay = this.lay;
            var gas = this.aedelgasVed(pt);
            if (gas) { this.kortBesked(D.AEDELGAS[gas], 8, "gul"); NK.paaskeaeg = (NK.paaskeaeg || 0) + 1; return false; }
            var pl = T.pladsVed(lay.atom.x, lay.atom.y, lay.stor, this.atomZ(), pt);
            var s = pl ? pl.side : T.sideVed(lay.atom.x, lay.atom.y, lay.stor, pt);
            if (s < 0) return false;
            if (this.spaer()) return false;
            this.synkPladser();
            /* Lige paa en plads: saet eller fjern. Ved siden: den naermeste tomme plads. */
            if (pl) { this.saetPlads(pl.side, pl.plads, this.pladser[pl.side][pl.plads] ? 0 : 1); return false; }
            var tom = this.naermestePlads(s, pt, false);
            if (tom) this.saetPlads(tom.side, tom.plads, 1);
            else this.kortBesked("Der kan højst sidde 2 elektroner på hver side af symbolet. Et klik på en elektron fjerner den.", 5);
            return false;
        }
        var e = this.trin === "byg" ? this.enligVed(pt) : null;
        var q = this.parVed(pt);
        var parret = this.parretVed(pt);
        if (this.faerdig || this.venter) {
            if (e || q || parret) this.spaer();
            return false;
        }
        if (this.trin === "tael") {
            if (e || q || parret || this.atomVed(pt)) this.kortBesked("Prikformlen er færdig. Tæl elektronerne, og vælg tallet på kortet.", 4);
            return false;
        }
        if (e) {
            this.haand = { id: e.id, side: e.side, x: pt.x, y: pt.y, sx: pt.x, sy: pt.y, flyttet: false };
            return true;
        }
        if (q) {
            P.bryd(this.M, q.binding);
            this.efterAendring();
            this.valgtE = null;
            return false;
        }
        if (parret) {
            this.kortBesked("Den elektron er med i et frit elektronpar. Kun en uparret elektron kan danne en binding.", 5);
            return false;
        }
        this.valgtE = null;
        return false;
    };

    P_.flytScene = function (pt) {
        var h = this.haand;
        if (!h) return;
        h.x = pt.x;
        h.y = pt.y;
        if (Math.hypot(pt.x - h.sx, pt.y - h.sy) > 7) h.flyttet = true;
        var parret = this.parretVed(pt);
        this.over = h.flyttet ? (this.enligVed(pt, h.id) || (parret && parret.id !== h.id ? null : this.atomVed(pt, h.id))) : null;
        if (this.over && this.over.ingen) this.over = null;
    };

    P_.opScene = function (pt) {
        var h = this.haand;
        this.haand = null;
        this.over = null;
        if (!h) return;
        if (!h.flyttet) {
            /* Et klik: vaelg elektronen, eller bind den til den, der er valgt */
            var v = this.valgtE;
            if (v && v.id !== h.id) { this.valgtE = null; this.forsoegBind(v.id, v.side, h.id, h.side); return; }
            this.valgtE = v && v.id === h.id && v.side === h.side ? null : { id: h.id, side: h.side };
            return;
        }
        this.valgtE = null;
        var enlig = this.enligVed(pt, h.id);
        if (enlig) { this.forsoegBind(h.id, h.side, enlig.id, enlig.side); return; }
        /* Lige paa et frit elektronpar: det kan ikke danne en binding */
        var parret = this.parretVed(pt);
        if (parret && parret.id !== h.id) {
            this.kortBesked("Den elektron er med i et frit elektronpar. Kun en uparret elektron kan danne en binding.", 5);
            return;
        }
        var maal = this.atomVed(pt, h.id);
        if (maal && !maal.ingen) { this.forsoegBind(h.id, h.side, maal.id, maal.side); return; }
        if (maal && maal.ingen) {
            var a = this.M.atomer[maal.id];
            this.kortBesked(NK.stort(D.EL[a.z].navn) + " har ingen uparrede elektroner tilbage og kan ikke danne flere bindinger.", 5);
            return;
        }
    };

    P_.forsoegBind = function (aId, sA, bId, sB) {
        var M = this.M;
        var r = P.binde(M, aId, sA, bId, sB, this.vis);
        if (r.ok) {
            this.harBundet = true;
            this.nytPar = { binding: r.binding, t: 0 };
            this.efterAendring();
            return;
        }
        var ea = D.EL[M.atomer[aId].z], eb = D.EL[M.atomer[bId].z];
        var to = ea === eb ? "De to " + ea.atom + "er" : NK.stort(ea.atom) + "et og " + eb.atom + "et";
        if (r.grund === "ring") this.kortBesked(to + " sidder ikke ved siden af hinanden, så de kan ikke dele et elektronpar.", 6);
        else if (r.grund === "maks") this.kortBesked("To atomer kan højst dele 3 elektronpar.", 5);
        else if (r.grund === "plads") this.kortBesked("Der er ikke plads til atomet dér. Prøv med en anden uparret elektron.", 5);
    };

    /* Molekylet er aendret: de roede ringe og hinttrappen begynder forfra */
    P_.efterAendring = function () {
        this.markering = {};
        if (this.fast.klasse === "skidt") this.besked("", "");
        this.nulstilHjaelp();
        this.visIndsend();
    };
}());
