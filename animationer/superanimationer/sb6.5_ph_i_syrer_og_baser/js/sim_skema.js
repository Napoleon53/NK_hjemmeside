/* =====================================================================
   sim_skema.js - fane 1: Skemaet

   Tre middelstaerke syrer (D.SKEMA_SYRER), den foerste er bogens eksempel
   (0,0100 M methansyre, pH 2,90). Eleven skriver rækkerne Start, Ændring
   og Ligevægt i skemaet under reaktionsskemaet, saetter rækken Ligevægt
   ind i Kₛ, loeser ligningen med CAS, forkaster den negative loesning og
   finder pH. Den foerste syre har ogsaa spoergsmaalet "Hvad angiver x?"
   (x defineres, foer det bruges, som i sb2.4).

   Luppen viser 100 af syrens molekyler. Ved Start er alle hele; naar
   rækken Ændring er rigtig, hopper hydronerne én ad gangen over paa vand,
   og luppen viser ligevaegten: de graa er cₛ − x, de blaa og de roede x.

   Det, eleven skriver i felterne, staar med det samme i skemaet (blaat),
   og det, kortet spoerger om, har den gule ring. Beregningen under
   skemaet bygges op i tre rammer, der har deres plads fra start.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var T = NK.Tegning;
    var P1 = D.FARVE.par1, P2 = D.FARVE.par2;

    function S(e) { return D.SYRER[e.id]; }
    function syreU(e) { return D.u(S(e).syre); }
    function baseU(e) { return D.u(S(e).base); }
    function tomt(f) { return !String(f || "").trim(); }
    function x(v) { return v; }

    /* Et udtryk med x: { u } eller { fejl } */
    function medX(tekst, felt) {
        var u = D.udtryk(tekst);
        if (u.tom) return { tom: true };
        if (!u.ok) return { fejl: u.fejl, felt: felt };
        if (u.vars.some(function (v) { return v !== "x"; })) return { fejl: "Skriv udtrykket med bogstavet x og tal, ikke med andre bogstaver.", felt: felt, andre: true };
        return { u: u };
    }

    var TRIN = {
        start: {
            navn: "Start", slags: "felter",
            tekst: function (e) { return D.Navn(e.id) + " har cₛ = " + e.ct + " M. Hvad er koncentrationerne i rækken Start, før syren har reageret med vand?"; },
            felter: function (e) { return [{ label: syreU(e), enhed: "M", ph: "tallet" }, { label: baseU(e), enhed: "M", ph: "tallet" }, { label: "H₃O⁺", enhed: "M", ph: "tallet" }]; },
            tjek: function (e, r, f) {
                if (f.some(tomt)) return { tom: "Skriv et tal i alle tre felter." };
                var v = f.map(D.tolk), galt = [];
                v.forEach(function (t, i) { if (isNaN(t)) galt.push(i); });
                if (galt.length) return { fejl: "Skriv et tal i hvert felt, for eksempel " + e.ct + ".", felt: galt };
                if (!D.naer(v[0], e.c, 0.002)) {
                    return { fejl: v[0] === 0 ? "Ved start er al syren til stede: [" + syreU(e) + "] = cₛ = " + e.ct + " M." :
                        "Startkoncentrationen af " + S(e).navn + " er cₛ, som står på etiketten ved kolben.", felt: 0 };
                }
                if (v[1] !== 0 || v[2] !== 0) {
                    var fl = [];
                    if (v[1] !== 0) fl.push(1);
                    if (v[2] !== 0) fl.push(2);
                    if (v[1] === 0 && D.naer(v[2], 1e-7, 0.05)) return { fejl: "Vands selvionisering giver så få oxoniumioner, at [H₃O⁺] ved start sættes til 0 M.", felt: 2 };
                    return { fejl: "Basen og H₃O⁺ dannes først, når syren afgiver hydroner. Ved start er begge koncentrationer 0 M.", felt: fl };
                }
                return { ok: true };
            },
            vis: function (e) { return [e.ct, "0", "0"]; },
            hint: function (e) { return ["Ved start har syren endnu ikke afgivet nogen hydroner.", "[" + syreU(e) + "] = cₛ = " + e.ct + " M, og [" + baseU(e) + "] = [H₃O⁺] = 0 M."]; },
            forkl: function () { return "Ved start er der kun syre. Basen og H₃O⁺ dannes først, når syren reagerer med vand."; }
        },
        x: {
            navn: "Hvad er x?", slags: "valg",
            tekst: function () { return "Syren afgiver hydroner til vand, til der er ligevægt. Ændringen i koncentration er ukendt og kaldes x. Hvad angiver x?"; },
            svar: function () { return ["Koncentrationen af syre, der har afgivet en hydron", "Syrens koncentration ved start", "Syrens koncentration ved ligevægt"]; },
            rigtig: function () { return 0; },
            fejlValg: function (e, r, j) {
                return j === 1 ? "Syrens koncentration ved start er kendt. x er ukendt." :
                    "Syrens koncentration ved ligevægt er cₛ − x, ikke x.";
            },
            hint: function () { return ["x angiver, hvor meget syrens koncentration falder.", "Syrens koncentration falder, når syren afgiver hydroner."]; },
            forkl: function (e) { return "x er den koncentration af " + S(e).navn + ", der har afgivet en hydron fra start til ligevægt. x er ukendt, til ligningen er løst."; }
        },
        aendring: {
            navn: "Ændring", slags: "felter",
            tekst: function () { return "Syren afgiver hydroner til vand, til der er ligevægt. Skriv rækken Ændring med x."; },
            felter: function (e) { return [{ label: syreU(e), ph: "med x" }, { label: baseU(e), ph: "med x" }, { label: "H₃O⁺", ph: "med x" }]; },
            tjek: function (e, r, f) {
                if (f.some(tomt)) return { tom: "Skriv et udtryk med x i alle tre felter." };
                var u = [], i, res;
                for (i = 0; i < 3; i++) {
                    res = medX(f[i], i);
                    if (res.fejl) return res;
                    if (res.u.konst) return { fejl: "Ændringen i koncentration er ukendt. Skriv den med x.", felt: i };
                    u.push(res.u.f);
                }
                if (!D.samme(u[0], function (t) { return -t; })) {
                    if (D.samme(u[0], x)) return { fejl: "Syrens koncentration falder, når syren afgiver hydroner. Skriv −x.", felt: 0 };
                    if (D.samme(u[0], function (t) { return e.c - t; })) return { fejl: "Syrens koncentration ved ligevægt er cₛ − x. I rækken Ændring står kun ændringen, −x.", felt: 0 };
                    return { fejl: "Hvert syremolekyle afgiver én hydron, så syrens koncentration falder med x. Skriv −x.", felt: 0 };
                }
                var galt = [1, 2].filter(function (j) { return !D.samme(u[j], x); });
                if (galt.length) {
                    if (galt.some(function (j) { return D.samme(u[j], function (t) { return -t; }); })) return { fejl: "Basen og H₃O⁺ dannes, så deres koncentrationer vokser. Skriv +x.", felt: galt };
                    return { fejl: "Der dannes én base og én H₃O⁺, hver gang syren afgiver en hydron. Begge koncentrationer vokser med x.", felt: galt };
                }
                return { ok: true };
            },
            vis: function () { return ["−x", "+x", "+x"]; },
            hint: function () { return ["Når syrens koncentration falder med x, stiger koncentrationen af basen og af H₃O⁺ lige så meget.", "Skriv −x for syren og +x for basen og for H₃O⁺."]; },
            forkl: function (e, r) { return "[" + syreU(e) + "] falder med x, og [" + baseU(e) + "] og [H₃O⁺] stiger begge med x. I luppen har " + r.iLup + " af 100 molekyler afgivet en hydron ved ligevægt."; }
        },
        ligevaegt: {
            navn: "Ligevægt", slags: "felter",
            tekst: function () { return "Rækken Ligevægt er rækken Start plus rækken Ændring. Skriv koncentrationerne ved ligevægt med x."; },
            felter: function (e) { return [{ label: syreU(e), ph: "med x" }, { label: baseU(e), ph: "med x" }, { label: "H₃O⁺", ph: "med x" }]; },
            tjek: function (e, r, f) {
                if (f.some(tomt)) return { tom: "Skriv et udtryk med x i alle tre felter." };
                var u = [], i, res;
                for (i = 0; i < 3; i++) {
                    res = medX(f[i], i);
                    if (res.fejl) return res.andre && i === 0 ? { fejl: "Skriv cₛ som tallet " + e.ct + ".", felt: 0 } : res;
                    u.push(res.u);
                }
                var c = e.c;
                if (u[0].konst || !D.samme(u[0].f, function (t) { return c - t; })) {
                    if (D.samme(u[0].f, function (t) { return -t; })) return { fejl: "Husk startkoncentrationen. Syrens koncentration er " + e.ct + " M ved start og falder med x.", felt: 0 };
                    if (u[0].konst && D.naer(u[0].f(0), c, 0.002)) return { fejl: "Husk ændringen. Syrens koncentration er x mindre end ved start.", felt: 0 };
                    if (D.samme(u[0].f, function (t) { return c + t; })) return { fejl: "Syrens koncentration bliver mindre, når syren afgiver hydroner. Skriv " + e.ct + " − x.", felt: 0 };
                    return { fejl: "Læg rækken Start og rækken Ændring sammen for syren.", felt: 0 };
                }
                var galt = [1, 2].filter(function (j) { return u[j].konst || !D.samme(u[j].f, x); });
                if (galt.length) {
                    if (galt.some(function (j) { return u[j].konst && u[j].f(0) === 0; })) return { fejl: "For basen og H₃O⁺ er koncentrationen 0 M ved start, og ændringen er +x. Ved ligevægt er koncentrationen derfor x.", felt: galt };
                    if (galt.some(function (j) { return D.samme(u[j].f, function (t) { return c - t; }); })) return { fejl: "Udtrykket cₛ − x er syrens koncentration. Koncentrationen af basen og af H₃O⁺ er 0 M ved start og x ved ligevægt.", felt: galt };
                    return { fejl: "Læg rækken Start og rækken Ændring sammen for basen og H₃O⁺.", felt: galt };
                }
                return { ok: true };
            },
            vis: function (e) { return [e.ct + " − x", "x", "x"]; },
            hint: function () { return ["Læg rækken Start og rækken Ændring sammen i hver søjle.", "Skriv cₛ − x for syren og x for basen og for H₃O⁺."]; },
            forkl: function (e) { return "Ved ligevægt er [" + syreU(e) + "] = " + e.ct + " M − x og [" + baseU(e) + "] = [H₃O⁺] = x. I luppen svarer x til de blå baser og de røde oxoniumioner."; }
        },
        ligning: {
            navn: "Ligningen", slags: "broek",
            tekst: function () { return "Sæt udtrykkene fra rækken Ligevægt ind i udtrykket for Kₛ. Skriv tælleren og nævneren."; },
            broek: function (e, r) { return { label: "Kₛ =", efter: "= " + D.potensU(r.K) + " M" }; },
            tjek: function (e, r, f) {
                if (tomt(f[0]) || tomt(f[1])) return { tom: "Skriv både tælleren og nævneren." };
                var t = medX(f[0], 0), n = medX(f[1], 1);
                if (t.fejl) return t;
                if (n.fejl) return n.andre ? { fejl: "Skriv cₛ som tallet " + e.ct + ".", felt: 1 } : n;
                var c = e.c;
                function kv(v) { return v * v; }
                function rest(v) { return c - v; }
                var tOk = !t.u.konst && D.samme(t.u.f, kv), nOk = !n.u.konst && D.samme(n.u.f, rest);
                if (tOk && nOk) return { ok: true };
                if (!n.u.konst && !t.u.konst && D.samme(t.u.f, rest) && D.samme(n.u.f, kv)) return { fejl: "Produkternes koncentrationer står i tælleren, og syrens koncentration står i nævneren.", felt: [0, 1] };
                if (!tOk) {
                    if (D.samme(t.u.f, x)) return { fejl: "Tælleren er [" + baseU(e) + "] · [H₃O⁺]. Begge er x, så tælleren er x · x.", felt: 0 };
                    if (D.samme(t.u.f, function (v) { return 2 * v; })) return { fejl: "x · x er ikke det samme som 2x. Skriv x · x eller x².", felt: 0 };
                    return { fejl: "Tælleren er [" + baseU(e) + "] · [H₃O⁺] fra rækken Ligevægt.", felt: 0 };
                }
                if (n.u.konst && D.naer(n.u.f(0), c, 0.002)) return { fejl: "En nævner uden x er genvejens tilnærmelse. Her skal hele udtrykket fra rækken Ligevægt stå: " + e.ct + " − x.", felt: 1 };
                return { fejl: "Nævneren er [" + syreU(e) + "] fra rækken Ligevægt.", felt: 1 };
            },
            vis: function (e) { return ["x²", e.ct + " − x"]; },
            hint: function (e) { return ["Kₛ = [B] · [H₃O⁺] / [S]. Indsæt udtrykkene fra rækken Ligevægt.", "Tælleren er x · x. Nævneren er " + e.ct + " − x."]; },
            forkl: function () { return "Ligningen har kun én ubekendt, x. Det er en andengradsligning, som CAS kan løse."; }
        },
        cas: {
            navn: "Løsningen", slags: "cas",
            tekstA: function () { return "Ligningen på tavlen har kun én ubekendt, x. Løs ligningen med CAS."; },
            tekst: function () { return "CAS giver to løsninger. Hvilken af løsningerne kan være koncentrationen x?"; },
            svar: function (e, r) { return ["x = " + D.potensU(r.xmR) + " M", "x = " + D.potensU(r.xpR) + " M"]; },
            rigtig: function () { return 1; },
            fejlValg: function () { return "x er en koncentration og kan ikke være negativ. Den negative løsning forkastes."; },
            hintA: function () { return ["Tryk Løs ligningen med CAS. CAS finder alle løsninger til ligningen."]; },
            hint: function () { return ["x er en koncentration.", "En koncentration kan ikke være negativ."]; },
            forkl: function (e, r) { return "x = " + D.potensU(r.xpR) + " M. Den negative løsning forkastes, fordi en koncentration ikke kan være negativ."; }
        },
        ph: {
            navn: "pH", slags: "felter",
            tekst: function (e) { return "Beregn pH i opløsningen af " + S(e).navn + ". Find [H₃O⁺] i rækken Ligevægt."; },
            felter: function () { return [{ label: "pH =", ph: "to decimaler" }]; },
            tjek: function (e, r, f) {
                if (tomt(f[0])) return { tom: "Skriv pH i feltet." };
                var v = D.tolk(f[0]);
                if (isNaN(v)) return { fejl: "Skriv pH som et tal, for eksempel 3,25.", felt: 0 };
                if (D.naerA(v, r.phLigning, 0.011) || D.naerA(v, -D.log(r.xp), 0.011)) return { ok: true };
                if (D.naerA(v, r.phStaerk, 0.011)) return { fejl: "Du har regnet pH, som om al syren havde afgivet sin hydron. [H₃O⁺] er x, ikke cₛ.", felt: 0 };
                if (D.naerA(v, -r.phLigning, 0.011)) return { fejl: "Tjek fortegnet. pH = −log [H₃O⁺].", felt: 0 };
                if (D.naerA(v, -Math.log(r.xpR), 0.02)) return { fejl: "Du har brugt ln. pH regnes med log.", felt: 0 };
                if (D.naerA(v, r.phGenvej, 0.011)) return { fejl: "Du har regnet med genvejens formel. Brug x fra CAS: pH = −log x.", felt: 0 };
                if (D.naerA(v, -D.log(-r.xmR), 0.011)) return { fejl: "Brug den positive løsning. Den negative er forkastet.", felt: 0 };
                return { fejl: "Ikke rigtigt. pH = −log [H₃O⁺], og [H₃O⁺] = x.", felt: 0 };
            },
            vis: function (e, r) { return [D.d2(r.phLigning)]; },
            hint: function (e, r) { return ["I rækken Ligevægt står [H₃O⁺] = x.", "pH = −log(" + D.potensU(r.xpR) + "). Afrund til to decimaler."]; },
            forkl: function (e, r) { return "Opløsningen har pH " + D.d2(r.phLigning) + ". Omdannelsesgraden er " + D.tal1(r.alfa) + " %, og i luppen har " + r.iLup + " af 100 molekyler afgivet en hydron."; }
        }
    };

    function SimSkema() {
        this.emner = D.SKEMA_SYRER;
        this.lup = new NK.Lup();
        this.lupFase = "start";
        this.startTrinFane({ noegle: "nk-sb6.5-skema", liste: "s-syrer", trinliste: "s-trin", titel: "s-titel",
                             naeste: "Næste syre →", faerdig: D.SKEMA_FAERDIG });
    }

    var P = SimSkema.prototype;
    NK.Trin.paa(P, "s");
    P.TRIN = TRIN;

    P.tal = function (e) { return D.syreTal(e); };
    P.trinFor = function (e) {
        return e.medX ? ["start", "x", "aendring", "ligevaegt", "ligning", "cas", "ph"] : ["start", "aendring", "ligevaegt", "ligning", "cas", "ph"];
    };
    P.emneNavn = function (e) { return D.Navn(e.id); };
    P.listeNavn = function (e) { return D.Navn(e.id) + ", " + e.ct + " M"; };
    P.emneId = function (e) { return e.id; };

    P.nytEmne = function () {
        this.lup.saetSyre(this.e.id);
        this.lupFase = "start";
    };

    /* Rækken Ændring er rigtig: hydronerne hopper over paa vand */
    P.efterRigtigt = function (id) {
        if (id === "aendring") {
            this.lup.saetKs(D.ksFraPks(D.SYRER[this.e.id].pks), false, this.e.c);
            this.lupFase = "ligevaegt";
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
        var vb = Math.round(NK.klamp(t.b * 0.3, 220, 330));
        var lx = t.x + 14, lw = vb - 14;
        /* Venstre: kolben og etiketten, under dem luppen og taellingen */
        var kw = Math.round(NK.klamp(lw * 0.28, 56, 84)), kh = kw * 170 / 150;
        var ew = lw - kw - 10, eh = T.etiket(ctx, 0, 0, ew, ["", "", ""], { fs: 13, kunHoejde: true });
        var top = t.y + 12, raekke = Math.max(kh, eh);
        this.kolbe = { x: lx, y: top + raekke - kh, w: kw, h: kh };
        this.etiketR = { x: lx + kw + 10, y: top + (raekke - eh) / 2, w: ew, h: eh };
        var ly = top + raekke + 26, tael = 30;
        var lh = Math.round(NK.klamp(Math.min(lw * 1.0, t.y + t.h - 10 - tael - ly), 110, 340));
        this.lupR = { x: lx, y: ly, b: lw, h: lh };
        /* Hoejre: skemaet og rammerne */
        var rx = t.x + vb + 18, rw = t.x + t.b - 14 - rx;
        this.rx = rx; this.rw = rw;
        /* Skemaet og rammerne deler hoejden, saa skriften er omtrent lige stor
           i begge (skemaet lidt stoerre) */
        var rammeEnh = 3.35 + 3.7 + 3.7, skemaEnh = 2.95 + 3 * 1.95;
        var fc = (t.h - 12 - 8 - 12 - 10 - 14) / (rammeEnh + skemaEnh * 1.08);
        this.rammeMaks = NK.klamp(fc, 13, 19);
        this.fsS = Math.round(NK.klamp(Math.min(rw / 38, fc * 1.08), 13, 21) * 2) / 2;
        this.skema = this.skemaLayout(ctx, rx, t.y + 12, rw);
        this.rammeY = this.skema.y + this.skema.h + 12;
        this.saetAnker("lup", this.lupR.x - 4, this.lupR.y - 4, this.lupR.b + 8, this.lupR.h + tael + 8);
        this.saetAnker("kolbe", lx - 4, top - 4, lw + 8, raekke + 8);
        this.saetAnker("skema", rx - 4, this.skema.y - 4, rw + 8, this.skema.h + 8);
        this.saetAnker("rammer", rx - 4, this.rammeY - 4, rw + 8, t.y + t.h - this.rammeY);
    };

    /* Skemaets kolonner: raekkens navn, S, +, H₂O, ⇌, B, +, H₃O⁺ */
    P.skemaLayout = function (ctx, x, y, w) {
        var fs = this.fsS, rf = fs * 1.08;
        var navnB = F.bredde(ctx, "Ligevægt", fs, 800) + 24, op = fs * 1.7;
        var vand = F.bredde(ctx, "H_2O", rf, 700) + F.bredde(ctx, "(l)", rf * 0.6, 600) + 18;
        var stof = (w - navnB - 3 * op - vand) / 3;
        var k = { x: x, y: y, w: w, fs: fs, rf: rf, navnB: navnB };
        var xx = x + navnB;
        k.c = {};
        [["S", stof], ["op1", op], ["W", vand], ["op2", op], ["B", stof], ["op3", op], ["H", stof]].forEach(function (s) {
            k.c[s[0]] = xx + s[1] / 2;
            xx += s[1];
        });
        k.stofB = stof;
        k.hoved = fs * 2.95;
        k.rh = fs * 1.95;
        k.h = k.hoved + 3 * k.rh + 8;
        return k;
    };

    /* ----- Tegning ---------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 200) return;
        T.tavle(ctx, lay);
        this.tegnVenstre(ctx);
        this.tegnSkema(ctx);
        this.tegnRammer(ctx, t);
        this.tegnSejr(ctx, t);
    };

    P.tegnVenstre = function (ctx) {
        var e = this.e, s = D.SYRER[e.id], r = this.r, k = this.kolbe, R = this.lupR;
        /* Keglen fra vaesken i kolben ned til luppen */
        T.kegle(ctx, { x: k.x + k.w * 0.5, y: k.y + k.h * 0.8 }, R);
        if (!T.sprite(ctx, "kolbe", k.x, k.y, k.w)) {
            ctx.save(); ctx.fillStyle = "rgba(200, 222, 236, 0.5)"; NK.rundtRekt(ctx, k.x + 8, k.y + k.h * 0.5, k.w - 16, k.h * 0.45, 6); ctx.fill(); ctx.restore();
        }
        var E = this.etiketR;
        T.etiket(ctx, E.x, E.y, E.w, [D.Navn(e.id) + ", " + s.syre, "c_s = " + e.ct + " M", "K_s = " + D.potensC(r.K) + " M"], { fs: 13 });
        /* Luppen */
        T.vindue(ctx, R.x, R.y, R.b, R.h);
        this.lup.tegn(ctx, R);
        var tag = this.lupFase === "start" ? "Start" : "Ligevægt";
        ctx.save();
        ctx.font = "800 13px " + T.FONT;
        var tb = ctx.measureText(tag).width + 18;
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        NK.rundtRekt(ctx, R.x + 8, R.y + 8, tb, 22, 7);
        ctx.fill();
        ctx.restore();
        NK.tekst(ctx, tag, R.x + 8 + tb / 2, R.y + 19.5, { font: "800 13px " + T.FONT, farve: T.BLAEK, justering: "center", linje: "middle" });
        /* Taellingen under luppen med luppens tegn */
        var n = this.lupFase === "start" ? 0 : this.lup.antal().delte, cy = R.y + R.h + 16;
        var dele = this.lupFase === "start" ? [["hel", "100 " + s.syre]] :
            [["hel", (100 - n) + " " + s.syre], ["ion", n + " " + s.base], ["ox", n + " H_3O^+"]];
        var fs = 13, bred = 0, mig = this;
        dele.forEach(function (d) { d.w = 24 + F.bredde(ctx, d[1], fs, 700); bred += d.w + 12; });
        var xx = R.x + Math.max(0, (R.b - bred + 12) / 2);
        dele.forEach(function (d) {
            NK.Lup.ikon(ctx, d[0], mig.e.id, xx + 9, cy, 0.85);
            F.tekst(ctx, d[1], xx + 22, cy, fs, T.BLAEK, "left", { vaegt: 700 });
            xx += d.w + 12;
        });
    };

    /* Cellerne i en raekke: det loeste, det eleven skriver, eller ? */
    var RAEKKER = ["start", "aendring", "ligevaegt"];
    var NAVN = { start: "Start", aendring: "Ændring", ligevaegt: "Ligevægt" };
    P.celler = function (id) {
        var e = this.e;
        if (id === "start") return [e.ct + " M", "0 M", "0 M"];
        if (id === "aendring") return ["−x", "+x", "+x"];
        return [e.ct + " M − x", "x", "x"];
    };
    function vist(tekst) { return String(tekst).trim().replace(/-/g, "−").replace(/\*/g, "·"); }

    P.tegnSkema = function (ctx) {
        var k = this.skema, e = this.e, s = D.SYRER[e.id], mig = this;
        if (!k) return;
        var fs = k.fs, rf = k.rf;
        ctx.save();
        NK.rundtRekt(ctx, k.x, k.y, k.w, k.h, 9);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#b9c4c8";
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.restore();
        /* Reaktionen med tilstandsformer og H⁺-buen */
        var y0 = k.y + k.hoved - rf * 0.75;
        var stoffer = [{ f: s.syre, tf: "(aq)", c: k.c.S, farve: P1 }, { f: "H_2O", tf: "(l)", c: k.c.W, farve: P2 },
                       { f: s.base, tf: "(aq)", c: k.c.B, farve: P1 }, { f: "H_3O^+", tf: "(aq)", c: k.c.H, farve: P2 }];
        var kas = [];
        stoffer.forEach(function (d) {
            var fw = F.bredde(ctx, d.f, rf, 700), tw = F.bredde(ctx, d.tf, rf * 0.6, 600), x0 = d.c - (fw + tw + 2) / 2;
            kas.push(F.tekst(ctx, d.f, x0, y0, rf, d.farve, "left", { vaegt: 700 }));
            F.tekst(ctx, d.tf, x0 + fw + 2, y0 + rf * 0.08, rf * 0.6, T.DAEMPET, "left", { vaegt: 600 });
        });
        F.tekst(ctx, "+", k.c.op1, y0, rf, T.DAEMPET, "center", { vaegt: 600 });
        F.tekst(ctx, "⇌", k.c.op2, y0, rf, T.DAEMPET, "center", { vaegt: 600 });
        F.tekst(ctx, "+", k.c.op3, y0, rf, T.DAEMPET, "center", { vaegt: 600 });
        var x1 = kas[0].x + kas[0].w / 2, x2 = kas[1].x + kas[1].w / 2 - 4, ya = y0 - rf * 0.62, mx = (x1 + x2) / 2;
        ctx.save();
        ctx.strokeStyle = "#6b7685";
        ctx.fillStyle = "#6b7685";
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(x1, ya); ctx.quadraticCurveTo(mx, ya - rf * 1.25, x2, ya); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2, ya); ctx.lineTo(x2 - 8, ya - 7); ctx.lineTo(x2 + 1, ya - 9); ctx.closePath(); ctx.fill();
        ctx.restore();
        F.tekst(ctx, "H^+", mx, ya - rf * 0.84, rf * 0.66, D.FARVE.hydron, "center", { vaegt: 800 });
        /* Raekkerne */
        var ry = k.y + k.hoved;
        RAEKKER.forEach(function (id, i) {
            var y = ry + i * k.rh, cy = y + k.rh / 2, tilst = mig.tilstand(id);
            if (tilst === "aktiv") {
                ctx.save();
                ctx.fillStyle = "rgba(242, 197, 61, 0.14)";
                ctx.fillRect(k.x + 1.5, y, k.w - 3, k.rh);
                ctx.restore();
            }
            ctx.save();
            ctx.strokeStyle = "#d5dde0";
            ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.moveTo(k.x + 8, y); ctx.lineTo(k.x + k.w - 8, y); ctx.stroke();
            ctx.restore();
            F.tekst(ctx, NAVN[id], k.x + 12, cy, fs, tilst ? T.BLAEK : "#9aa3a6", "left", { vaegt: 800 });
            if (!tilst) return;
            var kol = [k.c.S, k.c.B, k.c.H], farver = [P1, P1, P2];
            var vis = tilst === "aktiv" ? null : mig.celler(id);
            var alfa = tilst === "aktiv" ? 1 : mig.ny(id);
            kol.forEach(function (cx, j) {
                if (vis) {
                    var cfs = fs;
                    while (cfs > 12 && F.bredde(ctx, vis[j], cfs, 700) > k.stofB - 8) cfs -= 0.5;
                    F.tekst(ctx, vis[j], cx, cy, cfs, farver[j], "center", { vaegt: 700, alfa: alfa });
                    return;
                }
                var skrevet = vist(mig.f[j] || "");
                if (skrevet) {
                    /* Det, eleven skriver, staar paa en lys blaa seddel, saa det
                       ikke kan forveksles med det loeste */
                    var sfs = fs;
                    while (sfs > 12 && F.bredde(ctx, skrevet, sfs, 700) > k.stofB - 16) sfs -= 0.5;
                    var sb = F.bredde(ctx, skrevet, sfs, 700) + 16;
                    ctx.save();
                    NK.rundtRekt(ctx, cx - sb / 2, cy - sfs * 0.85, sb, sfs * 1.7, 6);
                    ctx.fillStyle = "rgba(47, 111, 222, 0.10)";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(47, 111, 222, 0.55)";
                    ctx.setLineDash([4, 3]);
                    ctx.lineWidth = 1.3;
                    ctx.stroke();
                    ctx.restore();
                    F.tekst(ctx, skrevet, cx, cy, sfs, "#2a3342", "center", { vaegt: 700 });
                } else {
                    var q = F.tekst(ctx, "?", cx, cy, fs, T.BLAEK, "center", { vaegt: 700 });
                    T.gulRamme(ctx, q.x - 8, q.y - 2, q.w + 16, q.h + 4, 7);
                }
            });
        });
    };

    P.rammeListe = function () {
        var e = this.e, r = this.r, s = D.SYRER[e.id], mig = this;
        var Kc = D.potensC(r.K) + " M", xp = D.potensC(r.xpR) + " M", xm = D.potensC(r.xmR) + " M";
        var lig = { id: "ligning", nr: this.nrAf("ligning"), titel: "Ligningen", tilst: this.tilstand("ligning"), plads: 3.35, broek: true, linjer: [] };
        if (lig.tilst === "aktiv") {
            var t0 = vist(this.f[0] || ""), t1 = vist(this.f[1] || "");
            lig.linjer = [{ d: ["K_s =", { b: [[{ t: t0 || "?", farve: t0 ? "#2a3342" : T.BLAEK }], [{ t: t1 || "?", farve: t1 ? "#2a3342" : T.BLAEK }]] }, "= " + Kc] }];
        } else if (lig.tilst) {
            lig.linjer = [{ d: ["K_s =", { b: ["[" + s.base + "] · [H_3O^+]", "[" + s.syre + "]"] }, "=", { b: ["x^2", e.ct + " M − x"] }, "= " + Kc],
                            kort: ["K_s =", { b: ["x^2", e.ct + " M − x"] }, "= " + Kc] }];
            lig.alfa = this.ny("ligning");
        }
        var cas = { id: "cas", nr: this.nrAf("cas"), titel: "Løsningen", tilst: this.tilstand("cas"), plads: 3.7, linjer: [] };
        if (cas.tilst === "aktiv") {
            if (this.casT !== null) {
                var prik = ["", ".", "..", "..."][Math.floor(this.casT * 5) % 4];
                cas.linjer = [{ d: ["CAS løser ligningen" + prik], daempet: true }];
            } else if (!this.casVist) cas.linjer = [{ d: ["x =", T.SPM] }];
            else {
                cas.linjer = [{ d: [{ t: "x = " + xm, ring: this.valgt === 0 ? T.VALG : null }, "  eller  ", { t: "x = " + xp, ring: this.valgt === 1 ? T.VALG : null }] }];
                cas.alfa = this.ny("cas");
            }
        } else if (cas.tilst) {
            cas.linjer = [{ d: ["x = " + xp] }, { d: ["x = " + xm + " forkastes, fordi en koncentration ikke kan være negativ"], daempet: true, kort: ["x = " + xm + " forkastes"] }];
        }
        var ph = { id: "ph", nr: this.nrAf("ph"), titel: "pH", tilst: this.tilstand("ph"), plads: 3.7, linjer: [] };
        if (ph.tilst === "aktiv") ph.linjer = [{ d: ["pH =", T.SPM] }];
        else if (ph.tilst) {
            ph.linjer = [{ d: ["[H_3O^+] = x = " + xp] }, { d: ["pH = −log[H_3O^+] = −log(" + D.potensC(r.xpR) + ") = " + D.d2(r.phLigning)],
                                                             kort: ["pH = −log(" + D.potensC(r.xpR) + ") = " + D.d2(r.phLigning)] }];
            ph.alfa = this.ny("ph");
        }
        void mig;
        return [lig, cas, ph];
    };

    P.tegnRammer = function (ctx, t) {
        this.rammeRes = T.rammer(ctx, this.rx, this.rammeY, this.rw, t.y + t.h - 10 - this.rammeY, this.rammeListe(), { maks: this.rammeMaks });
    };

    NK.SimSkema = SimSkema;
}());
