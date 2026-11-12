/* =====================================================================
   sim_vej.js - fane 2: Vælg vejen

   Seks syrer (D.VEJ_SYRER): to staerke, to svage og to middelstaerke.
   Eleven aflaeser syrens pKₛ paa bogens skala oeverst paa tavlen og
   vaelger fremgangsmaaden (figuren b6-hvilken-formel): staerk giver
   pH = −log cₛ, middelstaerk giver ligningen med x, og svag giver
   genvejen. Saa regner eleven pH.

   Luppen aabner foerst, naar vejen er valgt (svar foerst, naar de er
   aktuelle), og viser, hvorfor vejen er den rigtige: i en staerk syre har
   alle 100 molekyler afgivet hydronen, i en svag kun ganske faa. De to
   middelstaerke er valgt, saa genvejen giver et maerkbart forkert tal.

   Trinnene er ["vej", "ph"]. Er syren middelstaerk, kommer "cas" ind
   imellem, foerst naar vejen er valgt, saa listen i panelet ikke roeber
   svaret.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var T = NK.Tegning;

    function S(e) { return D.SYRER[e.id]; }
    function tomt(f) { return !String(f || "").trim(); }
    function partikler(e) { return S(e).q === 1 ? "ammoniumioner" : "molekyler"; }
    function alfaTekst(a) { return a < 0.1 ? "under 0,1 %" : D.tal1(a) + " %"; }

    var TRIN = {
        vej: {
            navn: "Vejen", slags: "valg",
            tekst: function (e) {
                return D.Navn(e.id) + (e.kilde ? " fra " + e.kilde : "") + " har pKₛ = " + D.tal2(S(e).pks) +
                    ". Hvilken fremgangsmåde giver pH i " + e.ct + " M " + S(e).navn + "?";
            },
            svar: function () { return D.VEJE.slice(); },
            rigtig: function (e, r) { return r.vej; },
            fejlValg: function (e, r, j) {
                if (j === 0) return D.Navn(e.id) + " er ikke en stærk syre. Kun en del af " + partikler(e) + "ne afgiver hydronen, så [H₃O⁺] er mindre end cₛ.";
                if (j === 1) return r.vej === 0 ? "En stærk syre reagerer fuldstændigt med vand. Der er ingen ligevægt, så [H₃O⁺] = cₛ." :
                    "Ligningen med x gælder altid, men for en svag syre med pKₛ over 4 er genvejen en god tilnærmelse.";
                return r.vej === 0 ? "Genvejen gælder kun, når en lille del af syren har reageret. En stærk syre har reageret fuldstændigt." :
                    "Genvejen bygger på, at x er meget mindre end cₛ. Det gælder først for syrer med pKₛ over 4.";
            },
            hint: function (e) { return ["Find " + S(e).navn + " på skalaen øverst på tavlen. Hvilken gruppe hører syren til?", "Stærk: pKₛ under 0. Middelstærk: fra 0 til 4. Svag: over 4."]; },
            forkl: function (e, r) {
                if (r.vej === 0) return D.Navn(e.id) + " er en stærk syre. Luppen viser, at alle 100 molekyler har afgivet hydronen, så [H₃O⁺] = cₛ.";
                if (r.vej === 1) return D.Navn(e.id) + " er en middelstærk syre. I luppen har " + r.iLup + " af 100 molekyler afgivet en hydron. Omdannelsesgraden er for stor til, at genvejen kan bruges.";
                if (!r.iLup) return D.Navn(e.id) + " er en svag syre. Under 1 af 100 " + partikler(e) + " har afgivet en hydron, så luppen viser ingen. x er meget mindre end cₛ.";
                return D.Navn(e.id) + " er en svag syre. I luppen har kun " + r.iLup + " af 100 " + partikler(e) + " afgivet en hydron, så x er meget mindre end cₛ.";
            }
        },
        cas: {
            navn: "Ligningen", slags: "cas",
            tekstA: function (e) { return "Ligningen på tavlen er opstillet med Kₛ for " + S(e).navn + ". Løs ligningen med CAS."; },
            tekst: function () { return "CAS giver to løsninger. Hvilken af løsningerne er [H₃O⁺]?"; },
            svar: function (e, r) { return ["x = " + D.potensU(r.xmR) + " M", "x = " + D.potensU(r.xpR) + " M"]; },
            rigtig: function () { return 1; },
            fejlValg: function () { return "x er en koncentration og kan ikke være negativ. Den negative løsning forkastes."; },
            hintA: function () { return ["Tryk Løs ligningen med CAS. CAS finder alle løsninger til ligningen."]; },
            hint: function () { return ["[H₃O⁺] = x, og x er en koncentration.", "En koncentration kan ikke være negativ."]; },
            forkl: function (e, r) { return "[H₃O⁺] = x = " + D.potensU(r.xpR) + " M. Den negative løsning forkastes, fordi en koncentration ikke kan være negativ."; }
        },
        ph: {
            navn: "pH", slags: "felter",
            tekst: function (e) { return "Beregn pH i " + e.ct + " M " + S(e).navn + ", og tryk Indsend svar."; },
            felter: function () { return [{ label: "pH =", ph: "to decimaler" }]; },
            tjek: function (e, r, f) {
                if (tomt(f[0])) return { tom: "Skriv pH i feltet." };
                var v = D.tolk(f[0]), s = S(e), c = e.c;
                if (isNaN(v)) return { fejl: "Skriv pH som et tal, for eksempel 3,25.", felt: 0 };
                function ved(a) { return D.naerA(v, a, 0.011); }
                if (ved(r.ph) || (r.vej === 1 && ved(-D.log(r.xp)))) return { ok: true };
                if (ved(-r.ph)) return { fejl: "Tjek fortegnet. pH er positiv i en fortyndet syre.", felt: 0 };
                if (r.vej === 0) {
                    if (D.naerA(v, -Math.log(c), 0.02)) return { fejl: "Du har brugt ln. pH regnes med log.", felt: 0 };
                    return { fejl: "Ikke rigtigt. For en stærk syre er pH = −log cₛ.", felt: 0 };
                }
                if (r.vej === 2) {
                    if (ved(r.phStaerk)) return { fejl: "Du har regnet pH som for en stærk syre. " + D.Navn(e.id) + " er svag, så brug genvejen.", felt: 0 };
                    if (ved(s.pks - D.log(c))) return { fejl: "Husk ½ foran parentesen.", felt: 0 };
                    if (ved(0.5 * (s.pks + D.log(c)))) return { fejl: "Tjek fortegnet foran log cₛ. Med minus bliver −log cₛ positiv.", felt: 0 };
                    if (ved(0.5 * s.pks)) return { fejl: "Husk log cₛ i parentesen.", felt: 0 };
                    return { fejl: "Ikke rigtigt. Genvejen er pH = ½ · (pKₛ − log cₛ).", felt: 0 };
                }
                if (ved(r.phStaerk)) return { fejl: "Du har regnet pH, som om al syren havde afgivet sin hydron. Brug x fra CAS.", felt: 0 };
                if (ved(r.phGenvej)) return { fejl: "Du har regnet med genvejens formel. " + D.Navn(e.id) + " er middelstærk, så brug x fra CAS.", felt: 0 };
                if (D.naerA(v, -Math.log(r.xpR), 0.02)) return { fejl: "Du har brugt ln. pH regnes med log.", felt: 0 };
                return { fejl: "Ikke rigtigt. pH = −log [H₃O⁺], og [H₃O⁺] = x.", felt: 0 };
            },
            vis: function (e, r) { return [D.d2(r.ph)]; },
            hint: function (e, r) {
                if (r.vej === 0) return ["I en stærk syre er [H₃O⁺] = cₛ.", "pH = −log(" + e.ct + "). Afrund til to decimaler."];
                if (r.vej === 2) return ["Genvejen: pH = ½ · (pKₛ − log cₛ).", "pH = ½ · (" + D.tal2(S(e).pks) + " − log(" + e.ct + ")). Afrund til to decimaler."];
                return ["[H₃O⁺] er lig med x fra CAS.", "pH = −log(" + D.potensU(r.xpR) + "). Afrund til to decimaler."];
            },
            forkl: function (e, r) {
                var t = "Opløsningen har pH " + D.d2(r.ph) + ".";
                if (r.vej === 0) return t + " Alle molekylerne har afgivet deres hydron, så [H₃O⁺] = cₛ.";
                if (r.vej === 2) return t + " Omdannelsesgraden er " + alfaTekst(r.alfa) + ", så genvejen er en god tilnærmelse.";
                return t + " Genvejen ville give " + D.d2(r.phGenvej) + " og er for unøjagtig, fordi omdannelsesgraden er " + Math.round(r.alfa) + " %.";
            }
        }
    };

    function SimVej() {
        this.emner = D.VEJ_SYRER;
        this.lup = new NK.Lup();
        this.lupVist = false;
        this.startTrinFane({ noegle: "nk-sb6.5-vej", liste: "v-syrer", trinliste: "v-trin", titel: "v-titel",
                             naeste: "Næste syre →", faerdig: D.VEJ_FAERDIG });
    }

    var P = SimVej.prototype;
    NK.Trin.paa(P, "v");
    P.TRIN = TRIN;

    P.tal = function (e) { return D.syreTal(e); };
    P.trinFor = function () { return ["vej", "ph"]; };
    P.emneNavn = function (e) { return D.Navn(e.id); };
    P.listeNavn = function (e) { return D.Navn(e.id) + ", " + e.ct + " M"; };
    P.emneId = function (e) { return e.id; };

    P.nytEmne = function () {
        this.lup.saetSyre(this.e.id);
        this.lupVist = false;
    };

    /* Vejen er valgt: luppen aabner, og den middelstaerke faar trinnet med CAS */
    P.efterRigtigt = function (id) {
        if (id !== "vej") return;
        this.lupVist = true;
        this.lup.saetKs(D.ksFraPks(D.SYRER[this.e.id].pks), false, this.e.c);
        if (this.r.vej === 1 && this.trinListe.indexOf("cas") < 0) {
            this.trinListe = ["vej", "cas", "ph"];
            this.visListe();
        }
    };

    P.opdaterScene = function (dt) {
        this.opdaterTrin(dt);
        this.lup.opdater(dt);
    };

    /* ----- Layout ------------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, ctx = this.L.ctx;
        var k = NK.klamp(Math.min(t.b / 900, t.h / 430), 0.78, 1.1);
        this.s = T.skalaLay(t.x + 16, t.y + 8, t.b - 32, k, { ks: false, flag: 1 });
        var y0 = this.s.bund + 14;
        var vb = Math.round(NK.klamp(t.b * 0.3, 220, 330)), lx = t.x + 14, lw = vb - 14;
        var kw = Math.round(NK.klamp(lw * 0.26, 52, 78)), kh = kw * 170 / 150;
        var ew = lw - kw - 10, eh = T.etiket(ctx, 0, 0, ew, ["", "", "", ""], { fs: 13, kunHoejde: true });
        var raekke = Math.max(kh, eh);
        this.kolbe = { x: lx, y: y0 + raekke - kh, w: kw, h: kh };
        this.etiketR = { x: lx + kw + 10, y: y0, w: ew };
        var ly = y0 + raekke + 22, tael = 30;
        var lh = Math.round(NK.klamp(Math.min(lw * 0.8, t.y + t.h - 10 - tael - ly), 90, 300));
        this.lupR = { x: lx, y: ly, b: lw, h: lh };
        this.rx = t.x + vb + 18;
        this.rw = t.x + t.b - 14 - this.rx;
        this.rammeY = y0;
        this.saetAnker("skala", t.x + 10, this.s.y - 4, t.b - 20, this.s.h + 8);
        this.saetAnker("lup", lx - 4, y0 - 4, lw + 8, ly + lh + tael - y0 + 8);
        this.saetAnker("rammer", this.rx - 4, y0 - 4, this.rw + 8, t.y + t.h - y0);
    };

    /* ----- Tegning ---------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 200) return;
        T.tavle(ctx, lay);
        this.tegnSkala(ctx);
        this.tegnVenstre(ctx);
        T.rammer(ctx, this.rx, this.rammeY, this.rw, t.y + t.h - 10 - this.rammeY, this.rammeListe(), { maks: 17 });
        this.tegnSejr(ctx, t);
    };

    P.tegnSkala = function (ctx) {
        var s = this.s, e = this.e, sy = S(e), loest = !!this.loestTrin.vej;
        ctx.save();
        NK.rundtRekt(ctx, s.x - 6, s.y - 2, s.b + 12, s.h + 4, 9);
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fill();
        ctx.restore();
        T.skala(ctx, s, { pil: false, aktivZone: loest ? D.zone(sy.pks) : undefined });
        T.flag(ctx, s, sy.pks, sy.syre + "   pK_s = " + D.tal2(sy.pks), 0, { gul: this.trin === "vej" && !this.groen });
    };

    P.tegnVenstre = function (ctx) {
        var e = this.e, s = S(e), k = this.kolbe, R = this.lupR;
        if (this.lupVist) T.kegle(ctx, { x: k.x + k.w * 0.5, y: k.y + k.h * 0.8 }, R);
        if (!T.sprite(ctx, "kolbe", k.x, k.y, k.w)) {
            ctx.save(); ctx.fillStyle = "rgba(200, 222, 236, 0.5)"; NK.rundtRekt(ctx, k.x + 8, k.y + k.h * 0.5, k.w - 16, k.h * 0.45, 6); ctx.fill(); ctx.restore();
        }
        var linjer = [D.Navn(e.id) + ", " + s.syre];
        if (e.kilde) linjer.push("fra " + e.kilde);
        linjer.push("c_s = " + e.ct + " M", "pK_s = " + D.tal2(s.pks));
        var E = this.etiketR;
        T.etiket(ctx, E.x, E.y, E.w, linjer, { fs: 13 });
        if (!this.lupVist) return;
        T.vindue(ctx, R.x, R.y, R.b, R.h);
        this.lup.tegn(ctx, R);
        var n = this.lup.antal().delte, cy = R.y + R.h + 16, fs = 13, bred = 0, mig = this;
        var dele = [["hel", (100 - n) + " " + s.syre], ["ion", n + " " + s.base], ["ox", n + " H_3O^+"]];
        dele.forEach(function (d) { d.w = 24 + F.bredde(ctx, d[1], fs, 700); bred += d.w + 12; });
        var xx = R.x + Math.max(0, (R.b - bred + 12) / 2);
        dele.forEach(function (d) {
            NK.Lup.ikon(ctx, d[0], mig.e.id, xx + 9, cy, 0.85);
            F.tekst(ctx, d[1], xx + 22, cy, fs, T.BLAEK, "left", { vaegt: 700 });
            xx += d.w + 12;
        });
    };

    P.rammeListe = function () {
        var e = this.e, r = this.r, s = S(e), liste = [];
        var xp = D.potensC(r.xpR) + " M", xm = D.potensC(r.xmR) + " M", Kc = D.potensC(r.K) + " M";
        var vej = { id: "vej", nr: 1, titel: "Vejen", tilst: this.tilstand("vej"), plads: 2.25, linjer: [] };
        if (vej.tilst === "aktiv") vej.linjer = [{ d: ["pK_s = " + D.tal2(s.pks) + " giver", T.SPM] }];
        else if (vej.tilst) { vej.linjer = [{ d: [D.VEJ_TITEL[r.vej]] }]; vej.alfa = this.ny("vej"); }
        liste.push(vej);
        if (this.trinListe.indexOf("cas") >= 0) {
            var lig = { id: "cas", nr: this.nrAf("cas"), titel: "Ligningen", tilst: this.tilstand("cas"), plads: 7.7, linjer: [] };
            lig.linjer = [{ d: ["K_s = 10^{-pK_s} M = 10^{" + D.tal2(-s.pks) + "} M = " + Kc] },
                          { d: ["K_s =", { b: ["x^2", e.ct + " M − x"] }, "= " + Kc] }];
            if (lig.tilst === "aktiv") {
                if (this.casT !== null) lig.linjer.push({ d: ["CAS løser ligningen" + ["", ".", "..", "..."][Math.floor(this.casT * 5) % 4]], daempet: true });
                else if (!this.casVist) lig.linjer.push({ d: ["x =", T.SPM] });
                else lig.linjer.push({ d: [{ t: "x = " + xm, ring: this.valgt === 0 ? T.VALG : null }, "  eller  ", { t: "x = " + xp, ring: this.valgt === 1 ? T.VALG : null }] });
            } else if (lig.tilst) {
                lig.linjer.push({ d: ["x = " + xp, { t: "(x = " + xm + " forkastes)", farve: T.DAEMPET }], kort: ["x = " + xp] });
                lig.linjer.push({ d: ["[H_3O^+] = x = " + xp] });
            }
            liste.push(lig);
        }
        var ph = { id: "ph", nr: this.nrAf("ph"), titel: "pH", tilst: this.tilstand("ph"), plads: r.vej === 2 && this.loestTrin.vej ? 3.7 : 2.25, linjer: [] };
        var formel = ["pH = −log c_s", "pH = −log[H_3O^+]", "pH = ½ · (pK_s − log c_s)"][r.vej];
        if (ph.tilst === "aktiv") ph.linjer = [{ d: [formel + " =", T.SPM] }];
        else if (ph.tilst) {
            if (r.vej === 0) ph.linjer = [{ d: [formel + " = −log(" + e.ct + ") = " + D.d2(r.ph)] }];
            else if (r.vej === 1) ph.linjer = [{ d: [formel + " = −log(" + D.potensC(r.xpR) + ") = " + D.d2(r.ph)], kort: ["pH = −log(" + D.potensC(r.xpR) + ") = " + D.d2(r.ph)] }];
            else ph.linjer = [{ d: [formel] }, { d: ["= ½ · (" + D.tal2(s.pks) + " − log(" + e.ct + ")) = " + D.d2(r.ph)] }];
            ph.alfa = this.ny("ph");
        }
        liste.push(ph);
        return liste;
    };

    NK.SimVej = SimVej;
}());
