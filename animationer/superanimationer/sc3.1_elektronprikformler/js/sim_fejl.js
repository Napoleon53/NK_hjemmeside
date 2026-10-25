/* =====================================================================
   sim_fejl.js - fanen Find fejlen

   En elev har tegnet tolv prikformler (D.FEJL). Ni har én fejl, som
   elever faktisk laver; tre er rigtige. For hver tegning:

     1 Eleven klikker paa det atom, der er tegnet forkert, eller vaelger
       Ingen fejl paa kortet, og trykker Indsend svar. Et klik vaelger
       kun. Er det valgte atom tegnet rigtigt, taeller animationen hoejt
       omkring det (saa eleven ser, hvordan der skal taelles), og svaret
       koster stjernen.
     2 Eleven taeller elektronerne omkring det forkerte atom og sender
       tallet ind.
     3 Den rettede tegning kommer frem ved siden af.

   Hvilket atom der er forkert, regnes ud af tegningen (NK.Prik.fejlAtomer).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var P = NK.Prik;
    var T = NK.T;

    var TAEL_FART = 6;

    NK.SimFejl = function () {
        this.startFane(D.FEJL.map(function (o, i) { return { id: "t" + (i + 1), chip: String(i + 1), titel: "Tegning " + (i + 1) + ": " + o.f }; }));
        var foerste = 0;
        for (var i = 0; i < this.status.length; i++) if (!this.status[i].loest) { foerste = i; break; }
        this.vaelg(foerste);
    };

    var P_ = NK.SimFejl.prototype;
    NK.Fane.paa(P_, { navn: "f", naesteTekst: "Næste tegning →" });

    P_.lavOpgave = function (i) {
        var o = D.FEJL[i];
        this.o = o;
        this.M = P.elevTegning(o);
        this.R = P.rettet(o);
        var fejl = P.fejlAtomer(this.M);
        this.forkert = fejl.length ? fejl[0] : null;
        this.del = "find";
        this.valgt = null;
        this.forkerteValg = {};
        this.talValg = null;
        this.talForkert = {};
        this.taelling = null;
        this.talte = {};
        this.retAlfa = 0;
        this.overAtom = null;
        this.pos = null;
        this.G = null;
    };

    /* "oxygenatomet", eller "bromatomet med den gule ring", naar der er to ens */
    P_.atomNavn = function (a) {
        var ens = this.M.atomer.filter(function (x) { return x.z === a.z; }).length;
        return D.EL[a.z].atom + "et" + (ens > 1 ? " med den gule ring" : "");
    };

    P_.delNu = function () {
        if (this.del === "find") {
            var kl = "sk-knap ingen" + (this.valgt === "ingen" ? " valgt" : "") + (this.forkerteValg.ingen ? " forkert" : "");
            return {
                chip: "Find fejlen",
                tekst: "En elev har tegnet prikformlen for " + this.o.f + ". Klik på det atom, der er tegnet forkert. Er tegningen rigtig, så vælg Ingen fejl.",
                ekstra: '<div class="sk-ingen"><button type="button" class="' + kl + '" data-ingen="1"' + (this.forkerteValg.ingen ? " disabled" : "") +
                    '><span class="v-boks" aria-hidden="true">' + (this.valgt === "ingen" ? "✓" : "") + "</span><span>Ingen fejl</span></button></div>"
            };
        }
        return {
            chip: "Tæl efter",
            tekst: "Hvor mange elektroner har " + this.atomNavn(this.forkert) + " omkring sig på elevens tegning?",
            ekstra: this.talHTML()
        };
    };

    P_.kanIndsende = function () {
        if (this.del === "find") return this.valgt !== null;
        return this.talValg !== null && this.talValg !== undefined;
    };

    P_.indsendTekst = function () {
        if (this.del === "find") {
            if (this.valgt === "ingen") return "Indsend svar: ingen fejl";
            if (this.valgt !== null) return "Indsend svar: " + D.EL[this.M.atomer[this.valgt].z].navn;
            return "Indsend svar";
        }
        return this.talValg ? "Indsend svar: " + this.talValg : "Indsend svar";
    };

    P_.kortKlik = function (e) {
        if (this.faerdig || this.venter) return;
        if (this.del === "tael") { this.talKlik(e); return; }
        var k = e.target.closest ? e.target.closest("[data-ingen]") : null;
        if (!k || k.disabled) return;
        this.valgt = this.valgt === "ingen" ? null : "ingen";
        if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
    };

    P_.indsend = function () {
        var o = this.o;
        if (this.del === "find") {
            if (this.valgt === "ingen") {
                if (!this.forkert) { this.loest("selv", o.forklaring); return; }
                this.forkerteValg.ingen = true;
                this.valgt = null;
                this.visKort();
                this.fejlLinje("Der er et atom, der er tegnet forkert. Tæl elektronerne omkring hvert atom.");
                return;
            }
            var a = this.M.atomer[this.valgt];
            if (a === this.forkert) {
                this.mellemsvar("selv", "Det er " + this.atomNavnUden(a) + ", der er tegnet forkert.", "Tæl efter →");
                return;
            }
            var st = P.status(this.M, a);
            this.forkerteValg[a.id] = true;
            this.talte[a.id] = true;
            this.taelling = { id: a.id, n: 0, faerdig: false };
            this.valgt = null;
            this.visKort();
            this.fejlLinje(NK.stort(D.EL[a.z].navn) + " har " + st.nu + " elektroner omkring sig, og det passer." +
                (this.forkert ? " Tæl omkring de andre atomer." : " Er de andre atomer også rigtige?"));
            return;
        }
        var stF = P.status(this.M, this.forkert);
        if (this.talValg === stF.nu) {
            this.taelling = { id: this.forkert.id, n: 0, faerdig: false };
            this.loest("selv", o.forklaring);
            return;
        }
        var galt = this.talValg;
        this.talForkert[galt] = true;
        this.talValg = null;
        this.visKort();
        this.fejlLinje(D.taelleHint(stF, galt));
    };

    /* "oxygenatomet" uden henvisningen til ringen (til det groenne kort) */
    P_.atomNavnUden = function (a) {
        var ens = this.M.atomer.filter(function (x) { return x.z === a.z; }).length;
        if (ens > 1 && this.o.ret && this.o.ret.atomer) return "hydrogenatomet i midten";
        return (ens > 1 ? "det ene " : "") + D.EL[a.z].atom + (ens > 1 ? "" : "et");
    };

    P_.visSvar = function () {
        var o = this.o;
        var svaret = this.forkert ? NK.stort(this.atomNavnUden(this.forkert)) + " er tegnet forkert." : "Tegningen er rigtig.";
        if (this.forkert) this.taelling = { id: this.forkert.id, n: 0, faerdig: false };
        this.valgt = null;
        this.loest("svar", o.forklaring, svaret);
    };

    P_.videre = function () {
        this.del = "tael";
        this.talValg = null;
        this.talForkert = {};
        this.taelling = null;
        this.nyDel();
    };

    P_.hintTrin = function () {
        if (this.del === "find") {
            return ["Tæl elektronerne omkring hvert atom. Begge elektroner i et fælles elektronpar tæller med hos begge atomer. Hydrogen skal have 2, de andre 8.",
                this.o.hint];
        }
        var st = P.status(this.M, this.forkert);
        return ["Tæl alle prikker omkring " + D.EL[this.forkert.z].navn + ": de frie elektroner og begge elektroner i hvert fælles elektronpar.",
            D.taelHint2(this.forkert.z, st)];
    };

    /* ----- Plads paa scenen ------------------------------------------------------ */
    P_.layout = function () {
        var W = this.L.b, H = this.L.h;
        var top = this.top();
        var flade = { x: 16, y: top, b: Math.max(200, W - 32), h: Math.max(160, H - top - 14) };
        this.lay = { W: W, H: H, flade: flade };
        this.saetAnker("flade", flade.x, flade.y, flade.b, flade.h);
    };

    /* Arkets plads: midt paa, saa til venstre, naar den rettede kommer frem */
    P_.arkPladser = function () {
        var fl = this.lay.flade;
        var skub = NK.blod(this.retAlfa);
        var b = Math.min(fl.b * (0.62 - 0.16 * skub), 560), h = Math.min(fl.h * 0.9, 380);
        var cy = fl.y + fl.h * 0.5;
        var cxV = fl.x + fl.b * (0.5 - 0.235 * skub), cxH = fl.x + fl.b * 0.735;
        return {
            venstre: { x: cxV - b / 2, y: cy - h / 2, b: b, h: h, cx: cxV, cy: cy + 10 },
            hoejre: { x: cxH - b / 2, y: cy - h / 2, b: b, h: h, cx: cxH, cy: cy + 10 }
        };
    };

    function pladser(M, ark, F) {
        var L = T.maal(F).bind;
        var xs = M.atomer.map(function (a) { return a.gx; }), ys = M.atomer.map(function (a) { return a.gy; });
        var mx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
        var my = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
        var pos = {};
        M.atomer.forEach(function (a) { pos[a.id] = { x: ark.cx + (a.gx - mx) * L, y: ark.cy + (a.gy - my) * L }; });
        return pos;
    }

    P_.stoerrelse = function (ark) {
        var M = this.M;
        var xs = M.atomer.map(function (a) { return a.gx; }), ys = M.atomer.map(function (a) { return a.gy; });
        var w = Math.max.apply(null, xs) - Math.min.apply(null, xs), h = Math.max.apply(null, ys) - Math.min.apply(null, ys);
        return NK.klamp(Math.min(ark.b / ((w + 1.6) * 2.45), (ark.h - 40) / ((h + 1.7) * 2.45)), 28, 58);
    };

    P_.opdaterScene = function (dt) {
        var t = this.taelling;
        if (t && !t.faerdig) {
            var antal = this.G && this.pos ? T.atometsPrikker(this.G, this.M, this.M.atomer[t.id], this.pos).length : P.status(this.M, this.M.atomer[t.id]).nu;
            t.n += dt * TAEL_FART;
            if (t.n >= antal) { t.n = antal; t.faerdig = true; }
        }
        if (this.faerdig && this.forkert && this.retAlfa < 1 && (!t || t.faerdig)) this.retAlfa = Math.min(1, this.retAlfa + dt * 1.5);
    };

    P_.tegn = function () {
        var ctx = this.L.ctx;
        this.L.ryd("#14141a");
        if (!this.lay) return;
        var ark = this.arkPladser();
        var F = this.stoerrelse(ark.venstre);
        this.F = F;
        this.pos = pladser(this.M, ark.venstre, F);
        T.ark(ctx, ark.venstre, "ELEVENS TEGNING AF " + this.o.f, "#a9b0ba");

        var ringe = {}, etiketter = {};
        var mig = this;
        if (this.del === "find" && !this.faerdig && !this.venter && this.valgt !== null && this.valgt !== "ingen") ringe[this.valgt] = "blaa";
        if (this.venter || (this.del === "tael" && !this.faerdig)) ringe[this.forkert.id] = "gul";
        if (this.faerdig) {
            if (this.forkert) ringe[this.forkert.id] = "roed";
            else this.M.atomer.forEach(function (a) {
                /* En rigtig tegning: hvert atom viser sit antal i groent */
                if (mig.taelling && a.id === mig.taelling.id) return;
                etiketter[a.id] = { tekst: P.status(mig.M, a).nu + " e" + NK.haevet("-"), farve: "groen" };
            });
        }
        if (this.overAtom !== null && this.overAtom !== undefined && !ringe[this.overAtom]) ringe[this.overAtom] = { farve: "rgba(255, 255, 255, 0.35)", stiplet: [4, 4], gloed: false };
        Object.keys(this.talte).forEach(function (id) {
            if (mig.taelling && +id === mig.taelling.id) return;
            var st = P.status(mig.M, mig.M.atomer[id]);
            etiketter[id] = { tekst: st.nu + " e" + NK.haevet("-"), farve: "groen" };
        });
        this.G = T.molekyle(ctx, this.M, this.pos, F, { ringe: ringe, etiketter: etiketter, taelling: this.taelling });

        /* Den rettede tegning ved siden af */
        if (this.retAlfa > 0) {
            var a = NK.blod(this.retAlfa);
            T.ark(ctx, ark.hoejre, "RETTET", "#7ee0a8", a);
            var R = this.R;
            var posR = pladser(R, ark.hoejre, F);
            var visR = { alfa: a, ringe: {}, etiketter: {} };
            var samme = !this.o.ret || !this.o.ret.atomer;
            if (samme && this.forkert) {
                var st = P.status(R, R.atomer[this.forkert.id]);
                visR.ringe[this.forkert.id] = "groen";
                visR.etiketter[this.forkert.id] = { tekst: st.nu + " e" + NK.haevet("-"), farve: "groen" };
            }
            T.molekyle(ctx, R, posR, F, visR);
        }
        this.tegnSejr(ctx, this.lay.W, this.lay.H);
    };

    /* ----- Musen ----------------------------------------------------------------- */
    P_.atomVed = function (pt) {
        if (!this.pos || !pt) return null;
        var F = this.F, mig = this, ramt = null;
        this.M.atomer.forEach(function (a) {
            var p = mig.pos[a.id];
            if (Math.hypot(pt.x - p.x, pt.y - p.y) < T.ringR(D.EL[a.z].s, F)) ramt = a;
        });
        return ramt;
    };

    P_.overScene = function (pt) {
        this.overAtom = null;
        var a = this.atomVed(pt);
        if (!a) return null;
        if (this.del === "find" && !this.faerdig && !this.venter) { this.overAtom = a.id; return "pointer"; }
        return null;
    };

    P_.nedScene = function (pt) {
        var a = this.atomVed(pt);
        if (!a) return false;
        if (this.spaer()) return false;
        if (this.del === "tael") {
            this.kortBesked("Tæl elektronerne omkring " + this.atomNavn(this.forkert) + ", og vælg tallet på kortet.", 4);
            return false;
        }
        if (this.forkerteValg[a.id]) {
            var st = P.status(this.M, a);
            this.kortBesked(NK.stort(D.EL[a.z].navn) + " har " + st.nu + " elektroner omkring sig, og det passer.", 4);
            return false;
        }
        this.valgt = this.valgt === a.id ? null : a.id;
        if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        return false;
    };
}());
