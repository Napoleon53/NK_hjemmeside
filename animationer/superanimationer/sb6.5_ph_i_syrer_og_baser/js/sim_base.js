/* =====================================================================
   sim_base.js - fane 3: Baser og salte (afsnit B6.6)

   Fire baser (D.BASER), alle bogens eksempler: natriumhydroxid 0,020 M
   (pH 12,30), calciumhydroxid 0,0050 M (to OH⁻, pH 12,00), ammoniak
   0,0500 M (genvejen, pH 10,97) og natriumethanoat 0,0500 M (hvilken ion
   er basen, pK_b = 14,00 − pKₛ, genvejen, pH 8,73).

   Regnevejen er bogens (figuren b6-base-vej): basens koncentration,
   [OH⁻], pOH og pH. Rammerne paa tavlen bygges op i den raekkefoelge.
   Nederst staar pH-skalaen. Skriver eleven pOH som pH (den hyppigste
   fejl, bogens "Husk det sidste trin"), viser skalaen det forkerte svar
   med roedt i den sure ende, og kortet siger, hvad der mangler.

   Fanen har ingen lup: bogen viser baserne med regnevejen, ikke med
   partikler (Claudes valg, se README).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var T = NK.Tegning;

    function tomt(f) { return !String(f || "").trim(); }
    function ohT(r) { return NK.betydende(r.oh, 2); }

    var TRIN = {
        oh: {
            navn: "Hydroxid", slags: "felter",
            tekst: function (b) { return D.stort(b.navn) + " er en stærk base. Hvad er [OH⁻] i " + b.ct + " M " + b.navn + "?"; },
            felter: function () { return [{ label: "[OH⁻] =", enhed: "M", ph: "tallet" }]; },
            tjek: function (b, r, f) {
                if (tomt(f[0])) return { tom: "Skriv [OH⁻] i feltet." };
                var v = D.tolk(f[0]);
                if (isNaN(v)) return { fejl: "Skriv [OH⁻] som et tal, for eksempel 0,050.", felt: 0 };
                if (D.naer(v, r.oh, 0.002)) return { ok: true };
                if (b.nOH === 2 && D.naer(v, b.c, 0.002)) return { fejl: "Tæl hydroxidionerne. Hver Ca(OH)₂ giver to OH⁻, så [OH⁻] er større end c_b.", felt: 0 };
                if (b.nOH === 1 && D.naer(v, 2 * b.c, 0.002)) return { fejl: "Hver NaOH giver kun én OH⁻.", felt: 0 };
                if (D.naer(v, b.c / 2, 0.002)) return { fejl: "Hver Ca(OH)₂ giver to OH⁻. Gang c_b med 2, og del ikke med 2.", felt: 0 };
                if (D.naerA(v, r.poh, 0.011)) return { fejl: "Du har beregnet pOH. Her spørges om koncentrationen [OH⁻] i M.", felt: 0 };
                return { fejl: "Ikke rigtigt. Reaktionsskemaet øverst på tavlen viser, hvor mange OH⁻ der dannes.", felt: 0 };
            },
            vis: function (b, r) { return [ohT(r)]; },
            hint: function (b) {
                return b.nOH === 2 ? ["Calciumhydroxid er en ionforbindelse. Alle hydroxidionerne går i opløsning.", "Reaktionsskemaet viser, at hver Ca(OH)₂ giver to OH⁻."] :
                    ["Natriumhydroxid er en ionforbindelse. Alle hydroxidionerne går i opløsning.", "Hver NaOH giver én OH⁻, så [OH⁻] = c_b."];
            },
            forkl: function (b, r) {
                return b.nOH === 2 ? "Hver Ca(OH)₂ giver to OH⁻, så [OH⁻] er dobbelt så stor som c_b: " + ohT(r) + " M." :
                    "Hver NaOH giver én OH⁻, så [OH⁻] = c_b = " + ohT(r) + " M.";
            }
        },
        vejb: {
            navn: "Vejen", slags: "valg",
            tekst: function (b, r) { return "Ammoniak har pK_b = " + D.d2(r.pkb) + ". Hvilken fremgangsmåde giver pOH i opløsningen?"; },
            svar: function () { return ["Stærk base: pOH = −log c_b", "Middelstærk base: løs ligningen", "Svag base: genvejen"]; },
            rigtig: function () { return 2; },
            fejlValg: function (b, r, j) {
                return j === 0 ? "Ammoniak er ikke en stærk base. Kun en lille del af molekylerne optager en hydron fra vand." :
                    "Ligningen med x gælder altid, men for en svag base med pK_b over 4 er genvejen en god tilnærmelse.";
            },
            hint: function () { return ["Baser inddeles som syrer: stærk under 0, middelstærk fra 0 til 4, svag over 4.", "pK_b = 4,75 er over 4."]; },
            forkl: function () { return "Ammoniak er en svag base. Kun lidt af ammoniakken har optaget en hydron, så genvejen kan bruges."; }
        },
        ion: {
            navn: "Basen", slags: "valg",
            tekst: function () { return "Natriumethanoat består af Na⁺ og CH₃COO⁻. Hvilken ion bestemmer pH i opløsningen?"; },
            svar: function () { return ["Na⁺", "CH₃COO⁻", "Både Na⁺ og CH₃COO⁻"]; },
            rigtig: function () { return 1; },
            fejlValg: function (b, r, j) {
                return j === 0 ? "Metalioner som Na⁺ reagerer ikke med vand. Se på den anden ion." : "Na⁺ reagerer ikke med vand, så kun CH₃COO⁻ er en base.";
            },
            hint: function () { return ["Natriumionen reagerer ikke med vand.", "Ethanoat er den korresponderende base til ethansyre, som er en svag syre."]; },
            forkl: function () { return "CH₃COO⁻ er den korresponderende base til ethansyre og reagerer med vand. Reaktionsskemaet står på tavlen."; }
        },
        pkb: {
            navn: "pK_b", slags: "felter",
            tekst: function (b) { return "Ethansyre har pKₛ = " + D.d2(b.pks) + ". Beregn pK_b for ethanoat, og tryk Indsend svar."; },
            felter: function () { return [{ label: "pK_b =", ph: "to decimaler" }]; },
            tjek: function (b, r, f) {
                if (tomt(f[0])) return { tom: "Skriv pK_b i feltet." };
                var v = D.tolk(f[0]);
                if (isNaN(v)) return { fejl: "Skriv pK_b som et tal, for eksempel 3,25.", felt: 0 };
                function ved(a) { return D.naerA(v, a, 0.011); }
                if (ved(r.pkb)) return { ok: true };
                if (ved(b.pks)) return { fejl: "Du har skrevet pKₛ for ethansyre. For et korresponderende syre-basepar er pKₛ + pK_b = 14,00.", felt: 0 };
                if (ved(14 + b.pks)) return { fejl: "Træk pKₛ fra 14,00.", felt: 0 };
                if (ved(-r.pkb)) return { fejl: "Tjek fortegnet. pK_b = 14,00 − pKₛ.", felt: 0 };
                return { fejl: "Ikke rigtigt. For et syre-basepar er pKₛ + pK_b = 14,00.", felt: 0 };
            },
            vis: function (b, r) { return [D.d2(r.pkb)]; },
            hint: function (b) { return ["For et korresponderende syre-basepar er pKₛ + pK_b = 14,00.", "pK_b = 14,00 − " + D.d2(b.pks) + "."]; },
            forkl: function (b, r) { return "pK_b = " + D.d2(r.pkb) + ". Ethanoat er en svag base, så genvejen kan bruges."; }
        },
        poh: {
            navn: "pOH", slags: "felter",
            tekst: function (b, r) {
                if (b.staerk) return "Beregn pOH i opløsningen ud fra [OH⁻], og tryk Indsend svar.";
                return (b.salt ? "Ethanoat" : "Ammoniak") + " er en svag base med pK_b = " + D.d2(r.pkb) + ". Beregn pOH med genvejen.";
            },
            felter: function () { return [{ label: "pOH =", ph: "to decimaler" }]; },
            tjek: function (b, r, f) {
                if (tomt(f[0])) return { tom: "Skriv pOH i feltet." };
                var v = D.tolk(f[0]);
                if (isNaN(v)) return { fejl: "Skriv pOH som et tal, for eksempel 3,25.", felt: 0 };
                function ved(a) { return D.naerA(v, a, 0.011); }
                if (ved(r.poh)) return { ok: true };
                if (ved(r.ph)) return { fejl: "Du har beregnet pH. Her spørges om pOH.", felt: 0 };
                if (b.staerk) {
                    if (ved(-r.poh)) return { fejl: "Tjek fortegnet. Husk minus foran log.", felt: 0 };
                    if (D.naerA(v, -Math.log(r.oh), 0.02)) return { fejl: "Du har brugt ln. pOH regnes med log.", felt: 0 };
                    if (b.nOH === 2 && ved(-D.log(b.c))) return { fejl: "Brug [OH⁻] = " + ohT(r) + " M, ikke c_b.", felt: 0 };
                    return { fejl: "Ikke rigtigt. pOH = −log [OH⁻].", felt: 0 };
                }
                if (ved(r.pohStaerk)) return { fejl: "Du har regnet pOH som for en stærk base. " + (b.salt ? "Ethanoat" : "Ammoniak") + " er svag, så brug genvejen.", felt: 0 };
                if (ved(r.pkb - D.log(b.c))) return { fejl: "Husk ½ foran parentesen.", felt: 0 };
                if (b.salt && ved(r.pohPks)) return { fejl: "Brug pK_b for ethanoat, ikke pKₛ for ethansyre.", felt: 0 };
                if (ved(0.5 * (r.pkb + D.log(b.c)))) return { fejl: "Tjek fortegnet foran log c_b. Med minus bliver −log c_b positiv.", felt: 0 };
                return { fejl: "Ikke rigtigt. Genvejen er pOH = ½ · (pK_b − log c_b).", felt: 0 };
            },
            vis: function (b, r) { return [D.d2(r.poh)]; },
            hint: function (b, r) {
                if (b.staerk) return ["pOH regnes som pH, men med [OH⁻]: pOH = −log [OH⁻].", "pOH = −log(" + ohT(r) + "). Afrund til to decimaler."];
                return ["Genvejen for en svag base: pOH = ½ · (pK_b − log c_b).", "pOH = ½ · (" + D.d2(r.pkb) + " − log(" + b.ct + ")). Afrund til to decimaler."];
            },
            forkl: function (b, r) { return "pOH = " + D.d2(r.poh) + ". Det sidste trin går fra pOH til pH."; }
        },
        ph: {
            navn: "pH", slags: "felter",
            tekst: function (b) { return "Beregn pH i opløsningen af " + b.navn + ", og tryk Indsend svar."; },
            felter: function () { return [{ label: "pH =", ph: "to decimaler" }]; },
            tjek: function (b, r, f) {
                if (tomt(f[0])) return { tom: "Skriv pH i feltet." };
                var v = D.tolk(f[0]);
                if (isNaN(v)) return { fejl: "Skriv pH som et tal, for eksempel 3,25.", felt: 0 };
                function ved(a) { return D.naerA(v, a, 0.011); }
                if (ved(r.ph)) return { ok: true };
                if (ved(r.poh)) return { fejl: "Du har skrevet pOH. Husk det sidste trin: pH = 14,00 − pOH.", felt: 0, vaerdi: v };
                if (ved(14 + r.poh)) return { fejl: "Træk pOH fra 14,00.", felt: 0, vaerdi: v };
                if (v < 7) return { fejl: "En opløsning af en base har pH over 7. Tjek beregningen.", felt: 0, vaerdi: v };
                return { fejl: "Ikke rigtigt. pH + pOH = 14,00.", felt: 0, vaerdi: v };
            },
            vis: function (b, r) { return [D.d2(r.ph)]; },
            hint: function (b, r) { return ["pH + pOH = 14,00.", "pH = 14,00 − " + D.d2(r.poh) + "."]; },
            forkl: function (b, r) {
                var t = "Opløsningen har pH " + D.d2(r.ph) + ".";
                if (b.id === "nh3") return t + " Havde ammoniak været en stærk base, ville pH have været " + D.d2(14 - r.pohStaerk) + ".";
                if (b.salt) return t + " Den er svagt basisk, selv om saltet er lavet af en syre.";
                return t + " Den er stærkt basisk, som pH-skalaen viser.";
            }
        }
    };

    function SimBase() {
        this.emner = D.BASER;
        this.startTrinFane({ noegle: "nk-sb6.5-base", liste: "b-baser", trinliste: "b-trin", titel: "b-titel",
                             naeste: "Næste base →", faerdig: D.BASE_FAERDIG });
    }

    var P = SimBase.prototype;
    NK.Trin.paa(P, "b");
    P.TRIN = TRIN;

    P.tal = function (b) { return D.baseTal(b); };
    P.trinFor = function (b) { return b.trin.slice(); };
    P.emneNavn = function (b) { return D.stort(b.navn); };
    P.listeNavn = function (b) { return D.stort(b.navn) + ", " + b.ct + " M"; };
    P.emneId = function (b) { return b.id; };

    /* Et forkert pH vises paa skalaen (roedt og stiplet) */
    P.efterFejl = function (res) {
        if (this.trin === "ph" && res && isFinite(res.vaerdi)) this.spoegelse = res.vaerdi;
    };

    P.opdaterScene = function (dt) { this.opdaterTrin(dt); };

    /* ----- Layout ------------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, ctx = this.L.ctx;
        this.rfs = NK.klamp(Math.min(t.b / 46, t.h / 22), 14, 18);
        var linjer = this.e && this.e.reakBase ? 2 : 1;
        this.reakR = { x: t.x + 14, y: t.y + 10, w: t.b - 28, h: linjer * this.rfs * 1.75 + 12 };
        this.skalaY = t.y + t.h - T.phSkalaHoejde() - 4;
        var y0 = this.reakR.y + this.reakR.h + 12, y1 = this.skalaY - 10;
        var vb = Math.round(NK.klamp(t.b * 0.26, 190, 290)), lx = t.x + 14, lw = vb - 14;
        var eh = T.etiket(ctx, 0, 0, lw, ["", "", ""], { fs: 13, kunHoejde: true });
        var kw = Math.round(NK.klamp(Math.min(lw * 0.6, (y1 - y0 - eh - 10) * 150 / 170), 60, 150)), kh = kw * 170 / 150;
        this.kolbe = { x: lx + (lw - kw) / 2, y: y0, w: kw, h: kh };
        this.etiketR = { x: lx, y: y0 + kh + 8, w: lw, h: eh };
        this.rx = t.x + vb + 18;
        this.rw = t.x + t.b - 14 - this.rx;
        this.rammeY = y0;
        this.rammeH = y1 - y0;
        this.saetAnker("reak", this.reakR.x - 4, this.reakR.y - 4, this.reakR.w + 8, this.reakR.h + 8);
        this.saetAnker("kolbe", lx - 4, y0 - 4, lw + 8, kh + eh + 16);
        this.saetAnker("rammer", this.rx - 4, y0 - 4, this.rw + 8, this.rammeH + 8);
        this.saetAnker("skala", t.x + 10, this.skalaY - 4, t.b - 20, T.phSkalaHoejde() + 8);
    };

    /* Ethanoat faar to linjer i reaktionsskemaet: layoutet skal goeres om */
    P.nytEmne = function () { this.lay = null; };

    /* ----- Tegning ---------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx;
        if (!this.lay) this.layout();
        var lay = this.lay, t = lay.tavle;
        if (t.b < 200) return;
        T.tavle(ctx, lay);
        this.tegnReaktion(ctx);
        this.tegnVenstre(ctx);
        T.rammer(ctx, this.rx, this.rammeY, this.rw, this.rammeH, this.rammeListe(), { maks: 17 });
        var phLoest = !!this.loestTrin.ph;
        T.phSkala(ctx, t.x + 14, this.skalaY, t.b - 28, { markoer: phLoest ? this.r.ph : null, spoegelse: phLoest ? null : this.spoegelse });
        this.tegnSejr(ctx, t);
    };

    P.tegnReaktion = function (ctx) {
        var R = this.reakR, b = this.e, fs = this.rfs;
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.w, R.h, 9);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#b9c4c8";
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.restore();
        var linjer = b.reak.slice();
        if (b.reakBase && this.loestTrin.ion) linjer.push(b.reakBase);
        linjer.forEach(function (l, i) {
            var f = fs;
            while (f > 12.5 && F.bredde(ctx, l, f, 700) > R.w - 24) f -= 0.5;
            var alfa = i === 1 ? this.ny("ion") : 1;
            F.tekst(ctx, l, R.x + R.w / 2, R.y + 6 + fs * 1.75 * (i + 0.5), f, T.BLAEK, "center", { vaegt: 700, alfa: alfa });
        }, this);
    };

    P.tegnVenstre = function (ctx) {
        var b = this.e, r = this.r, k = this.kolbe, E = this.etiketR;
        if (!T.sprite(ctx, "kolbe", k.x, k.y, k.w)) {
            ctx.save(); ctx.fillStyle = "rgba(200, 222, 236, 0.5)"; NK.rundtRekt(ctx, k.x + 8, k.y + k.h * 0.5, k.w - 16, k.h * 0.45, 6); ctx.fill(); ctx.restore();
        }
        var tredje = b.staerk ? "stærk base" : (b.salt ? "ethansyre: pK_s = " + D.d2(b.pks) : "pK_b = " + D.d2(r.pkb));
        T.etiket(ctx, E.x, E.y, E.w, [D.stort(b.navn) + ", " + b.formel, "c_b = " + b.ct + " M", tredje], { fs: 13, groen: !!this.loestTrin.ph });
    };

    P.rammeListe = function () {
        var b = this.e, r = this.r, mig = this;
        return this.trinListe.map(function (id, j) {
            var tilst = mig.tilstand(id), svag = !b.staerk;
            var ra = { id: id, nr: j + 1, titel: TRIN[id].navn, tilst: tilst, plads: id === "poh" && svag ? 3.7 : 2.25, linjer: [] };
            if (tilst === "aktiv") {
                var v = { oh: "[OH^-] =", vejb: "pK_b = " + D.d2(r.pkb) + " giver", ion: "Basen er", pkb: "pK_b =", poh: "pOH =", ph: "pH =" }[id];
                ra.linjer = [{ d: [v, T.SPM] }];
                return ra;
            }
            if (!tilst) return ra;
            ra.alfa = mig.ny(id);
            if (id === "oh") ra.linjer = [{ d: [b.nOH === 2 ? "[OH^-] = 2 · c_b = 2 · " + b.ct + " M = " + ohT(r) + " M" : "[OH^-] = c_b = " + ohT(r) + " M"] }];
            if (id === "vejb") ra.linjer = [{ d: ["Svag base: genvejen"] }];
            if (id === "ion") ra.linjer = [{ d: ["CH_3COO^- er basen. Na^+ reagerer ikke med vand."], kort: ["CH_3COO^- er basen"] }];
            if (id === "pkb") ra.linjer = [{ d: ["pK_b = 14,00 − pK_s = 14,00 − " + D.d2(b.pks) + " = " + D.d2(r.pkb)] }];
            if (id === "poh") {
                ra.linjer = b.staerk ? [{ d: ["pOH = −log[OH^-] = −log(" + ohT(r) + ") = " + D.d2(r.poh)] }] :
                    [{ d: ["pOH = ½ · (pK_b − log c_b)"] }, { d: ["= ½ · (" + D.d2(r.pkb) + " − log(" + b.ct + ")) = " + D.d2(r.poh)] }];
            }
            if (id === "ph") ra.linjer = [{ d: ["pH = 14,00 − pOH = 14,00 − " + D.d2(r.poh) + " = " + D.d2(r.ph)] }];
            return ra;
        });
    };

    NK.SimBase = SimBase;
}());
