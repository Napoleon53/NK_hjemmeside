/* =====================================================================
   sim_bland.js - fane 3: blandinger

   Fire opgaver om en ion, der kommer fra to salte. I den foerste vejes
   to salte af og opløses i det samme glas vand: eleven regner foerst
   stofmaengderne (n = m / M), saa koncentrationerne (c = n / V) og saa
   bidragene til [ion], der laegges sammen. I de andre haeldes to glas,
   A og B, sammen: stofmaengderne laegges sammen, og rumfanget bliver
   det samlede. Eleven skriver formlen og tallet (n = k · c · V med
   tallet foran ionen) og saa rumfanget og koncentrationen.

   Scenen goer det, der er regnet: i den foerste opgave kommer et salt i
   vandet, naar dets koncentration er fundet. I de andre haeldes A og B
   i blandingsglasset, naar rumfanget er fundet. Naar ionens
   koncentration er fundet, viser luppen ionerne.

   Raekkefoelgen (21. nov. 2026): Samme rumfang, Forskelligt rumfang, Ionen i
   det ene glas og til sidst To salte i ét glas. Paa tavlen staar kun de
   loeste linjer og den aktive; resten er samlet i én linje.

   Runde 2 (brugeren 21. nov. 2026): Svarene staar paa kortet, aldrig i
   panelet (regning.js). Den foerste opgave (start i D.BLAND) er trinvis i
   seks trin: eleven haelder glas A og B over i det tomme glas (klik eller
   traek), og saa kommer fem spoergsmaal med tre svar hver (rumfanget,
   formlen og tallet for glas A, tallet for glas B og [Cl⁻]). Luppen har en
   stiplet plads, til glassene er haeldt sammen. I de andre opgaver vaelges
   formlen blandt tre svar, og tallet skrives i et felt paa kortet. Mens
   kortet stiller et spoergsmaal, blinker det ved et klik i scenen. Er den
   foerste opgave loest (ogsaa foer, gemt i browseren), regnes den som de
   andre. Nye tal paa den uloeste foerste opgave giver trinene igen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimBland() {
        this.sidstTal = {};
        this.part = new NK.Partikler(41);
        this.trinvis = null;
        this.startFane(D.BLAND);
        this.regning = new NK.Regning({ fane: this, samle: true });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimBland.prototype;
    /* Pladsen oeverst i scenen til papirkortet: almindelig og lav skaerm */
    /* Kortet har svarene eller feltet under spoergsmaalet (21. nov. 2026) */
    var ZONE = [200, 178];
    NK.Fane.paa(P, { navn: "bland", zone: ZONE });
    NK.Regning.paa(P);
    /* Den trinvise opgave har korte kort (ingen opgavetekst over spoergsmaalet) */
    var ZONE_TRIN = [190, 166];
    P.zoneBasis = function () { return this.trinvis ? ZONE_TRIN : ZONE; };

    P.harNyeTal = function () { return true; };
    P.harForfra = function () { return false; };

    /* ----- Opgaven --------------------------------------------------------------- */
    P.lavOpgave = function (i, nyeTal) {
        var spec = D.BLAND[i];
        var tal = nyeTal ? this.traek(spec.tal, this.sidstTal[spec.id]) : (this.sidstTal[spec.id] || spec.tal[0]);
        this.sidstTal[spec.id] = tal;
        var o = { fane: 3, id: spec.id, titel: spec.titel, tekst: spec.tekst, tal: tal, ion: tal.ion || spec.ion, ion2: tal.ion2 };
        /* Den foerste opgave er trinvis, til eleven har loest den */
        /* trin: 0 haeld glas A, 1 haeld glas B, 2 ionerne i luppen; saa regningen */
        this.trinvis = spec.start && !this.status[i].loest ? { trin: 0, haeldt: {}, klar: false, lup: false, slut: false, maade: "ok",
            fejl: [], rigtigJ: null, orden: null } : null;
        this.slutEgen = !!this.trinvis;
        if (o.id === "samme") o.trin = ["nSA", "nSB", "cSA", "cSB", "bidragA", "bidragB", "total"];
        else if (this.trinvis) {
            /* Tavlen laeses oppefra i den raekkefoelge, eleven svarer */
            o.trin = ["Vsum", "nA", "nB", "ionBland"];
            o.kendt = ["nB", "ionBland"];
            o.valgTal = o.trin.slice();
            o.foerTrin = 3;
        } else o.trin = ["nA", "nB", "Vsum", "ionBland"].concat(o.ion2 ? ["ion2"] : []);
        o.facit = K.facitBland(o);
        this.opg = o;
        this.regning.saet(o, !!this.trinvis);
        this.part = new NK.Partikler(41 + i);
        this.nyScene();
    };

    P.kortChip = function () { return "Opgave " + (this.nr + 1) + " af " + D.BLAND.length; };
    P.kortTekst = function () {
        var o = this.opg, t = o.tal;
        var s = o.tekst.replace("{A}", D.salt(t.A).formel).replace("{B}", D.salt(t.B).formel)
            .replace("{cA}", t.cA ? K.c(t.cA) : "").replace("{cB}", t.cB ? K.c(t.cB) : "")
            .replace("{mA}", t.mA ? K.g(t.mA) : "").replace("{mB}", t.mB ? K.g(t.mB) : "")
            .replace("{VA}", t.VA ? K.mL(t.VA) + " mL" : "").replace("{VB}", t.VB ? K.mL(t.VB) + " mL" : "")
            .replace("{V}", t.V ? K.mL(t.V) + " mL" : "")
            .replace("{ion}", D.ion(o.ion).t).replace("{ion}", D.ion(o.ion).t).replace("{ion2}", o.ion2 ? D.ion(o.ion2).t : "");
        /* Ved første regnetrin siger kortet, hvad trinnet er (i stedet for trinnavnet som løs sætning) */
        var r = this.regning;
        if (r && r.k === 0 && !r.faerdig() && r.nuNr() === r.foer + 1) {
            var navn = NK.Tjek.navn(o.trin[0], o);
            s += " Første trin er " + navn.charAt(0).toLowerCase() + navn.slice(1) + ".";
        }
        return s;
    };

    P.data = function () {
        var o = this.opg, t = o.tal, A = D.salt(t.A), B = D.salt(t.B);
        if (o.id === "samme") {
            return ["m(" + A.formel + ") = " + K.g(t.mA) + " g    M(" + A.formel + ") = " + K.M(A) + " g/mol",
                    "m(" + B.formel + ") = " + K.g(t.mB) + " g    M(" + B.formel + ") = " + K.M(B) + " g/mol",
                    "V = " + K.mL(t.V) + " mL"];
        }
        return ["A: " + K.mL(t.VA) + " mL " + K.c(t.cA) + " M " + A.formel, "B: " + K.mL(t.VB) + " mL " + K.c(t.cB) + " M " + B.formel];
    };

    P.slutLinje = function () {
        var o = this.opg, f = o.facit, ion = D.ion(o.ion).t;
        if (o.id === "samme") return NK.html("Ionerne er i det samme glas, så bidragene lægges sammen: [" + ion + "] = " + K.c(f.total) + " M.");
        var t = "[" + ion + "] = " + K.c(f.ionBland) + " M i blandingen.";
        if (o.ion2) t += " [" + D.ion(o.ion2).t + "] = " + K.c(f.ion2) + " M, fordi ionen fra det ene glas fordeler sig i hele blandingen.";
        else if (o.id === "lige") t += " Stofmængderne fra de to glas lægges sammen.";
        return NK.html(t);
    };

    /* ----- Den trinvise foerste opgave (runde 2-4, 21. nov. 2026) --------------------
       Otte trin (runde 4: "en let start"): 1 eleven haelder glas A over i det
       tomme glas, 2 glas B, 3 hvilke ioner er der i blandingen (luppen er
       kommet frem), og 4 til 8 er regnetrinene, hvor svarene vaelges blandt tre
       paa kortet (regning.js med valgTal). Kun det glas, kortet beder om, har
       den gule ramme og boblen "Klik: hæld". Teksterne staar i start i D.BLAND,
       og de forkerte tal laves her (talValg). */
    P.trinNu = function () { return !!(this.trinvis && !this.trinvis.slut); };
    P.lupVist = function () { return !this.trinvis || this.trinvis.lup; };
    P.startData = function () { return D.BLAND[this.nr].start; };
    /* Det glas, eleven skal klikke paa nu (trin 1 og 2), ellers null */
    P.aktivtGlas = function () {
        var tv = this.trinvis;
        if (!this.trinNu() || tv.trin > 1 || this.auto) return null;
        var h = this.startData().haeld[tv.trin].glas;
        return tv.haeldt[h] ? null : h;
    };

    /* Tallene og navnene, der saettes ind i teksterne */
    P.vaerdier = function () {
        var o = this.opg, t = o.tal, f = o.facit, T = NK.Tjek;
        var formel = function (k) { return "n = " + (k > 1 ? k + " · " : "") + "c · V"; };
        var led = function (id) { return T.regning(id, o)[1].replace(/^= /, ""); };
        var ioner = this.ionListe().map(function (id) { return D.ion(id).t; });
        var kat = ioner.filter(function (x) { return x !== D.ion(o.ion).t; });
        function og(l) { return l.length > 1 ? l.slice(0, -1).join(", ") + " og " + l[l.length - 1] : l.join(""); }
        return { A: D.salt(t.A).formel, B: D.salt(t.B).formel, ion: D.ion(o.ion).t, kA: f.kA, kB: f.kB,
                 ioner: og(ioner), kationer: og(kat),
                 VA: K.mL(t.VA), VB: K.mL(t.VB), Vsum: K.mL(t.VA + t.VB), VAL: K.L(t.VA), VBL: K.L(t.VB), VsumL: K.L(t.VA + t.VB),
                 cAion: K.c(f.kA * t.cA), cBion: K.c(f.kB * t.cB), formelA: formel(f.kA), formelB: formel(f.kB),
                 nA: K.mol(f.nA), nB: K.mol(f.nB), nAled: led("nA"), nBled: led("nB"), ionLed: led("ionBland") };
    };
    P.fyld = function (s) {
        var v = this.vaerdier();
        return String(s || "").replace(/\{(\w+)\}/g, function (m, n) { return v[n] !== undefined ? String(v[n]) : m; });
    };
    /* To udgaver af en tekst: formlen med ét eller flere Cl⁻ pr. formelenhed,
       og [Cl⁻], naar glassene har samme eller forskellig [Cl⁻] */
    P.udgave = function (x, id) {
        if (!Array.isArray(x)) return x;
        var o = this.opg, t = o.tal, f = o.facit;
        if (id === "nA") return x[f.kA > 1 ? 1 : 0];
        return x[Math.abs(f.kA * t.cA - f.kB * t.cB) < 1e-9 ? 0 : 1];
    };

    /* Kortets tekster til et regnetrin (regning.js spoerger) */
    P.trinTekst = function (f, fase) {
        if (!this.trinvis) return null;
        var mig = this, t = this.startData().trin.filter(function (x) { return x.id === f.id && (x.fase || "tal") === fase; })[0];
        if (!t) return null;
        return { intro: this.fyld(t.intro || ""), tekst: this.fyld(t.tekst), hint: t.hint.map(function (h) { return NK.html(mig.fyld(h)); }),
                 godt: this.fyld(this.udgave(t.godt, f.id)) };
    };

    /* De tre tal paa kortet: det rigtige og to typiske fejl */
    P.talValg = function (id) {
        var o = this.opg, t = o.tal, f = o.facit, mig = this;
        var d = this.startData().trin.filter(function (x) { return x.id === id && !x.fase; })[0];
        function fejl(n) { return mig.fyld(d.fejl[n]); }
        if (id === "Vsum") {
            return [{ t: K.mL(t.VA + t.VB) + " mL", ok: true }, { t: K.mL(t.VA) + " mL", f: fejl("en") },
                    { t: K.mL(2 * (t.VA + t.VB)) + " mL", f: fejl("dobbelt") }];
        }
        if (id === "nA" || id === "nB") {
            var k = id === "nA" ? f.kA : f.kB, c = id === "nA" ? t.cA : t.cB;
            return [{ t: K.mol(f[id]) + " mol", ok: true }, { t: K.mol(f[id] * 1000) + " mol", f: fejl("mL") },
                    { t: K.mol(k * c) + " mol", f: fejl("c") }];
        }
        return [{ t: K.c(f.ionBland) + " M", ok: true }, { t: K.c(f.kA * t.cA + f.kB * t.cB) + " M", f: fejl("sum") },
                { t: K.c(f.nA / f.Vsum) + " M", f: fejl("en") }];
    };

    /* Fane 3's etiket: kun trinnet (opgaven staar i listen i panelet) */
    P.chipFor = function (nr, n) { return "Trin " + nr + " af " + n; };

    /* Papirkortet i trin 1 til 3: haeldningen (et kort uden svar) og ionerne */
    var regnKort = P.kortData, regnAaben = P.spmAaben, regnInfo = P.trinInfo, regnNaeste = P.naesteSpm,
        regnKlar = P.indsendKlar, regnSend = P.sendSvar, regnValg = P.kortValg;
    P.ionData = function () { return this.startData().ioner; };
    P.kortData = function () {
        if (!this.trinNu()) return regnKort.call(this);
        var tv = this.trinvis, n = this.regning.antalTrin(), mig = this;
        if (tv.trin < 2) {
            var h = this.startData().haeld[tv.trin];
            return { slags: "opgave", kompakt: true, fed: true, chip: this.chipFor(tv.trin + 1, n), intro: this.fyld(h.intro), tekst: this.fyld(h.tekst) };
        }
        var q = this.ionData(), vist = tv.maade === "svar";
        if (!tv.orden) tv.orden = NK.bland(q.svar.map(function (x, j) { return j; }));
        var k = { chip: this.chipFor(3, n), intro: this.fyld(q.intro), tekst: this.fyld(q.tekst) };
        k.svar = tv.orden.map(function (j) {
            var r = tv.rigtigJ === j, forkert = tv.fejl.indexOf(j) >= 0, t = mig.fyld(q.svar[j].t);
            if (mig.venter) return { j: j, t: t, rigtig: r && !vist, svarVist: r && vist, forkert: forkert, dim: !r && !forkert, laast: true };
            return { j: j, t: t, forkert: forkert, valgt: mig.valgtSvar === j && !forkert, laast: forkert || !!mig.auto };
        });
        if (!this.venter) { k.slags = "spm"; return k; }
        k.slags = "loest";
        k.bliv = true;
        k.gul = vist;
        k.html = NK.html(this.fyld(q.godt));
        k.videre = this.videreTekst();
        return k;
    };
    P.spmAaben = function () {
        if (!this.trinNu()) return regnAaben.call(this);
        return this.trinvis.trin === 2 && !this.venter && !this.auto;
    };
    P.indsendKlar = function () {
        if (!this.trinNu()) return regnKlar.call(this);
        return this.valgtSvar !== null && this.valgtSvar !== undefined;
    };
    P.sendSvar = function (j) {
        if (!this.trinNu()) { regnSend.call(this, j); return; }
        this.ionSvar(j, "klik");
    };
    P.kortValg = function (j) {
        if (!this.trinNu()) { regnValg.call(this, j); return; }
        var tv = this.trinvis;
        if (tv.trin !== 2 || this.venter || this.auto || tv.fejl.indexOf(j) >= 0) return;
        this.vaelgKortSvar(j);
    };
    P.trinInfo = function () {
        if (!this.trinNu()) return regnInfo.call(this);
        if (this.venter) return null;
        var tv = this.trinvis, mig = this;
        var data = tv.trin < 2 ? this.startData().haeld[tv.trin] : this.ionData();
        var hints = data.hint.map(function (x) { return NK.html(mig.fyld(x)); });
        if (tv.trin < 2) return { hints: hints, hint: hints[0], svar: function () { mig.haeldSelv(); } };
        var ret = data.svar.map(function (x) { return !!x.ok; }).indexOf(true);
        return { hints: hints, hint: hints[0], svar: function () { mig.ionSvar(ret, "svar"); } };
    };
    /* Naeste efter spoergsmaalet om ionerne: regningen begynder */
    P.naesteSpm = function () {
        if (!this.trinNu()) { regnNaeste.call(this); return; }
        this.venter = false;
        this.hjaelp = 0;
        this.valgtSvar = null;
        this.trinvis.slut = true;
        this.regning.aabn();
        this.besked("", "");
        this.visKort();
    };

    /* Svaret paa spoergsmaalet om ionerne */
    P.ionSvar = function (j, maade) {
        var tv = this.trinvis, q = this.ionData();
        if (!this.trinNu() || tv.trin !== 2 || this.venter || this.auto) return;
        var x = q.svar[j];
        this.valgtSvar = null;
        if (!x.ok) {
            if (tv.fejl.indexOf(j) < 0) tv.fejl.push(j);
            this.brugtSvar = true;
            this.fejlLinje(NK.html(this.fyld(x.f)));
            this.visKort();
            return;
        }
        tv.rigtigJ = j;
        tv.maade = maade === "svar" ? "svar" : "ok";
        if (maade === "svar") this.brugtSvar = true;
        this.hjaelp = 0;
        this.venter = true;
        this.besked("", "");
        this.visKort();
    };

    /* Vis svaret paa en haeldning: det glas, kortet beder om, haeldes af sig selv */
    P.haeldSelv = function () {
        var h = this.aktivtGlas();
        if (!h) return;
        this.brugtSvar = true;
        this.trinvis.haeldt[h] = true;
        this.haeld(h);
    };

    /* Et glas er haeldt over: kortet gaar videre af sig selv (det er en handling,
       ikke et svar). Efter glas B kommer luppen frem. */
    P.haeldKlar = function () {
        var tv = this.trinvis;
        this.hjaelp = 0;
        tv.trin++;
        if (tv.trin === 2) {
            tv.klar = true;
            tv.lup = true;
            this.s.ionerVist = true;
        }
        this.besked("", "");
        this.visKort();
    };

    /* ----- Scenen ------------------------------------------------------------------
       I den foerste opgave: saltene paa vaegtene (bunke 1 = hele portionen),
       de salte, der er i vandet (iGlas), og spatlen paa vej (flyv). */
    P.nyScene = function () {
        var t = this.opg.tal;
        this.s = { VA: t.VA || 0, VB: t.VB || 0, Vmix: 0, nMix: {}, poseA: { dx: 0, dy: 0, v: 0 }, poseB: { dx: 0, dy: 0, v: 0 },
                   straale: null, koe: [], aktiv: null, vist: false,
                   bunke: { A: 1, B: 1 }, iGlas: {}, flyv: null, skyer: [] };
        if (this.opg.id === "samme") this.s.Vmix = t.V;
        this.traekGlas = null;
    };

    P.trin = function (dur, fn, slut, start) { this.s.koe.push({ dur: dur, fn: fn, slut: slut, start: start, t: 0 }); };

    /* Glas A eller B haeldes i blandingsglasset */
    P.haeld = function (hvem) {
        var s = this.s, lay = this.lay, t = this.opg.tal;
        var g = hvem === "A" ? lay.glasA : lay.glasB, mix = lay.mix, pose = hvem === "A" ? s.poseA : s.poseB;
        var tud = { x: g.x0 + 12 * g.k, y: g.y0 + 12 * g.k };
        var dx = mix.ind.x1 - 18 * mix.k - tud.x, dy = mix.ind.top - 34 - tud.y;
        var V0 = hvem === "A" ? t.VA : t.VB;
        var salt = hvem === "A" ? t.A : t.B, c = hvem === "A" ? t.cA : t.cB;
        var mixV0, dx0 = 0, dy0 = 0;
        /* Glasset flyttes fra dér, hvor det er (eleven kan have trukket det) */
        this.trin(0.6, function (u) { pose.dx = dx0 + (dx - dx0) * u; pose.dy = dy0 + (dy - dy0) * u; }, null,
            function () { dx0 = pose.dx; dy0 = pose.dy; });
        this.trin(0.35, function (u) { pose.v = -1.15 * u; });
        this.trin(1.1, function (u) {
            s[hvem === "A" ? "VA" : "VB"] = V0 * (1 - u);
            s.Vmix = mixV0 + V0 * u;
            s.straale = { x: tud.x + dx, y: tud.y + dy };
        }, function () {
            s.straale = null;
            s.nMix[salt] = (s.nMix[salt] || 0) + c * V0 / 1000;
        }, function () { mixV0 = s.Vmix; });
        this.trin(0.6, function (u) { pose.v = -1.15 * (1 - u); pose.dx = dx * (1 - u); pose.dy = dy * (1 - u); });
    };

    /* Saltet paa vaegt A eller B kommer i vandet med spatlen */
    P.oploes = function (hvem) {
        var s = this.s, mig = this, salt = this.opg.tal[hvem];
        this.trin(1.0, function (u) {
            s.flyv = { hvem: hvem, u: u };
            s.bunke[hvem] = Math.max(0, 1 - u * 5);
        }, function () {
            s.flyv = null;
            s.bunke[hvem] = 0;
            s.iGlas[salt] = true;
            var g = mig.lay.mix;
            s.skyer.push({ x: g.cx, y: g.ymL(s.Vmix) + 16 * g.k, r: 10 * g.k, a: 1 });
        });
    };

    P.efterTrin = function (id) {
        /* Glassene haeldes over, naar stofmaengderne er fundet, saa det samlede
           rumfang kan aflaeses paa blandingsglasset (runde 5) */
        if (id === "nB" && !this.s.Vmix) { this.haeld("A"); this.haeld("B"); }
        if (id === "cSA") this.oploes("A");
        if (id === "cSB") this.oploes("B");
        if (id === "ionBland" || id === "total") this.s.vist = true;
    };

    P.opdaterScene = function (dt) {
        var s = this.s;
        if (!s) return;
        if (!s.aktiv && s.koe.length) {
            s.aktiv = s.koe.shift();
            if (s.aktiv.start) s.aktiv.start();
        }
        var a = s.aktiv;
        if (a) {
            a.t += dt / a.dur;
            a.fn(NK.blod(Math.min(1, a.t)));
            if (a.t >= 1) { s.aktiv = null; if (a.slut) a.slut(); }
        }
        var k = this.lay && this.lay.mix ? this.lay.mix.k : 1;
        s.skyer.forEach(function (sk) { sk.r += 60 * k * dt; sk.a -= 0.5 * dt; });
        s.skyer = s.skyer.filter(function (sk) { return sk.a > 0; });
        /* Haeldningen i den trinvise opgave er faerdig, naar begge glas er tomme */
        var tv = this.trinvis;
        if (this.trinNu() && tv.trin < 2 && tv.haeldt[this.startData().haeld[tv.trin].glas] && !s.aktiv && !s.koe.length) this.haeldKlar();
        var ioner = this.ionListe();
        var mig = this;
        this.part.saet(ioner.map(function (id) { return s.vist || s.ionerVist ? Tg.kugler(mig.ionMix(id), mig.skala) : 0; }));
        this.part.opdater(dt);
    };

    /* Ionerne i blandingen (eller i glasset i foerste opgave) */
    P.ionListe = function () {
        var t = this.opg.tal, A = D.salt(t.A), B = D.salt(t.B), ud = [];
        [A.kat, B.kat, A.an, B.an].forEach(function (id) { if (ud.indexOf(id) < 0) ud.push(id); });
        return ud;
    };

    P.ionMix = function (id) {
        var o = this.opg, t = o.tal, A = D.salt(t.A), B = D.salt(t.B);
        if (o.id === "samme") return K.k(A, id) * o.facit.cSA + K.k(B, id) * o.facit.cSB;
        var V = (t.VA + t.VB) / 1000;
        return (K.k(A, id) * t.cA * t.VA / 1000 + K.k(B, id) * t.cB * t.VB / 1000) / V;
    };

    /* Farven: kun jern(III)chlorid farver */
    P.farve = function (hvem) {
        var o = this.opg, t = o.tal, st, c = 0;
        if (hvem === "A" || hvem === "B") {
            st = D.salt(hvem === "A" ? t.A : t.B);
            return Tg.vaeske(st, hvem === "A" ? t.cA : t.cB);
        }
        var fe = ["A", "B"].filter(function (h) { return D.salt(t[h]).opl; })[0];
        if (!fe) return Tg.vaeske(null, 0);
        st = D.salt(t[fe]);
        if (o.id === "samme") c = this.s.iGlas[t[fe]] ? (fe === "A" ? o.facit.cSA : o.facit.cSB) : 0;
        else c = this.s.Vmix > 0 ? (this.s.nMix[t[fe]] || 0) / (this.s.Vmix / 1000) : 0;
        return Tg.vaeske(st, c);
    };

    /* ----- Musen -------------------------------------------------------------------
       I haeldningen kan glas A og B klikkes eller traekkes over i det tomme glas.
       Ellers sker der intet ved et klik i scenen: kortet blinker og siger,
       hvad eleven skal goere (laasen, brugeren 9. okt. 2026). */
    function inde(r, pt, luft) {
        luft = luft || 0;
        return !!r && pt.x >= r.x0 - luft && pt.x <= r.x0 + r.b + luft && pt.y >= r.y0 - luft && pt.y <= r.y0 + r.h + luft;
    }
    /* Kun det glas, kortet beder om (trin 1: glas A, trin 2: glas B), kan haeldes */
    P.kanHaelde = function () { return !!this.aktivtGlas() && !this.venter; };
    P.glasVed = function (pt) {
        var lay = this.lay, h = this.aktivtGlas();
        if (!lay || !pt || !lay.glasA || !h) return null;
        return inde(h === "A" ? lay.glasA : lay.glasB, pt) ? h : null;
    };
    P.overScene = function (pt) { return this.kanHaelde() ? this.glasVed(pt) : null; };
    P.nedScene = function (pt) {
        var lay = this.lay;
        if (!lay) return false;
        if (this.kanHaelde()) {
            var h = this.glasVed(pt);
            if (h) { this.traekGlas = { hvem: h, x0: pt.x, y0: pt.y, flyttet: false }; return true; }
            var aktiv = this.aktivtGlas();
            this.blinkKort();
            this.kortBesked("Klik på glas " + aktiv + ". Det har den gule ramme.", 3.5, "gul");
            return false;
        }
        var spm = this.spmAaben() || this.venter || this.faerdig;
        if (spm) this.blinkKort();
        if (this.venter && !this.faerdig) { this.kortBesked("Tryk på Næste på kortet.", 3.5, "gul"); return false; }
        if (this.opg.id === "samme") {
            if (inde(lay.vaegtA, pt) || inde(lay.vaegtB, pt)) {
                this.kortBesked("Saltet er vejet af. Det kommer i vandet, når du har regnet dets koncentration.");
            } else if (inde(lay.mix, pt)) {
                this.kortBesked("Glasset har " + K.mL(this.opg.tal.V) + " mL vand. Et salt kommer i, når du har regnet dets koncentration.");
            }
            return false;
        }
        if (this.trinvis && this.trinvis.klar) {
            if (inde(lay.mix, pt) || inde(lay.glasA, pt) || inde(lay.glasB, pt)) this.kortBesked("Glassene er hældt sammen. Svar på spørgsmålet på kortet.");
            return false;
        }
        if (inde(lay.glasA, pt) || inde(lay.glasB, pt) || inde(lay.mix, pt)) this.kortBesked("Glassene hældes sammen, når du har fundet stofmængderne.");
        return false;
    };
    P.flytScene = function (pt) {
        var g = this.traekGlas;
        if (!g) return;
        var pose = g.hvem === "A" ? this.s.poseA : this.s.poseB;
        var dx = pt.x - g.x0, dy = pt.y - g.y0;
        if (Math.abs(dx) + Math.abs(dy) > 6) g.flyttet = true;
        if (g.flyttet) { pose.dx = dx; pose.dy = dy; }
    };
    /* Et klik eller et slip over det tomme glas haelder glasset over */
    P.opScene = function (pt) {
        var g = this.traekGlas, tv = this.trinvis;
        this.traekGlas = null;
        if (!g || !tv || tv.haeldt[g.hvem]) return;
        if (!g.flyttet || inde(this.lay.mix, pt, 30)) {
            tv.haeldt[g.hvem] = true;
            this.haeld(g.hvem);
            return;
        }
        var pose = g.hvem === "A" ? this.s.poseA : this.s.poseB, dx0 = pose.dx, dy0 = pose.dy;
        this.trin(0.3, function (u) { pose.dx = dx0 * (1 - u); pose.dy = dy0 * (1 - u); });
        this.kortBesked("Slip glasset over det tomme glas, eller klik på det.", 3.5);
    };

    /* ----- Layout (runde 3, 21. nov. 2026) ---------------------------------------------
       Kortet oeverst i midten. Under det: glassene langs bordet til venstre og
       i midten (blandingsglasset forrest, saa A og B), luppen over
       blandingsglasset med en kegle ned i det og tavlen til hoejre. */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H, Hs: H };
        var samme = this.opg && this.opg.id === "samme";
        lay.bordY = Math.round(H - NK.klamp(H * 0.075, 20, 46));
        /* Pladsen oeverst er sat af til papirkortet (kortZone) */
        lay.zone = this.kortZone();
        var y0 = 10 + lay.zone, Hr = lay.bordY - y0;
        var tb = Math.round(NK.klamp(W * 0.34, 250, 420));
        lay.tavle = { x: W - tb - 14, y: y0, b: tb, h: lay.bordY - y0 - 8 };
        var venstre = lay.tavle.x - 22, bredde = venstre - 14;
        var mel = NK.klamp(bredde * 0.06, 18, 50);
        /* Glassenes hoejde: hvad bredden tillader, og hvad der er tilbage under luppen */
        var ghB = samme ? (bredde - 2.5 * mel) / (2 * 0.95 + 0.8) : (bredde - 2 * mel) / (3 * 0.8);
        var R = NK.klamp(Hr * 0.25, 62, 150);
        var gh = Math.min(260, ghB, Hr - 2 * R - 64);
        if (gh < 120) {
            gh = Math.min(ghB, Math.max(120, Hr * 0.42));
            R = NK.klamp((Hr - gh - 64) / 2, 46, 150);
        }
        lay.vaegtA = lay.vaegtB = lay.glasA = lay.glasB = null;
        if (samme) {
            var vb = NK.klamp(gh * 0.95, 100, 200);
            var x0 = 14 + Math.max(0, (bredde - (2 * vb + gh * 0.8 + 2.5 * mel)) / 2);
            lay.vaegtA = vaegtGeo(x0 + vb / 2, lay.bordY, vb);
            lay.vaegtB = vaegtGeo(x0 + vb * 1.5 + mel, lay.bordY, vb);
            lay.mix = Tg.glasGeo(x0 + 2 * vb + 2.5 * mel, lay.bordY, gh);
        } else {
            var gb = gh * 0.8, xm = 14 + Math.max(0, (bredde - 3 * gb - 2 * mel) / 2);
            lay.mix = Tg.glasGeo(xm, lay.bordY, gh);
            lay.glasA = Tg.glasGeo(xm + gb + mel, lay.bordY, gh);
            lay.glasB = Tg.glasGeo(xm + 2 * (gb + mel), lay.bordY, gh);
        }
        /* Luppen over blandingsglasset, med titlen over sig */
        R = Math.min(R, (lay.mix.y0 - y0 - 64) / 2, bredde / 2 - 4);
        var zx = NK.klamp(lay.mix.cx + R * 0.35, 14 + R, venstre - R);
        lay.zoom = { x: zx, y: y0 + 26 + R, r: Math.round(R) };
        this.lay = lay;
        /* Skalaen: ca. 20 kugler hoejst, naar opgaven er regnet faerdig */
        var mig = this;
        this.skala = Tg.skala(this.ionListe().reduce(function (sum, id) { return sum + mig.ionMix(id); }, 0), lay.zoom.r);
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("glas", 10, lay.mix.y0 - 30, venstre - 10, lay.bordY - lay.mix.y0 + 56);
        this.saetAnker("zoom", lay.zoom.x - R, lay.zoom.y - R - 26, 2 * R, 2 * R + 30);
    };

    /* Vaegten: midten cx, bordet y, bredden b; skaalen og vejebaaden */
    function vaegtGeo(cx, y, b) {
        var M = NK.Sprites.MAAL.vaegt, k = b / M.b, h = Tg.vaegtHoejde(b);
        var skaalY = y - M.bund * k + M.skaalY * k;
        var bb = M.skaalB * k * 0.8;
        return { cx: cx, y: y, b: b, k: k, x0: cx - b / 2, y0: skaalY - 40 * k, h: y - skaalY + 40 * k,
                 skaalY: skaalY, baadB: bb, top: y - M.bund * k, vH: h };
    }

    /* ----- Tegn ---------------------------------------------------------------------- */
    function tegnGlas(ctx, g, VmL, farve, pose, etiket, gammelV) {
        ctx.save();
        if (pose && (pose.dx || pose.dy || pose.v)) {
            var px = g.x0 + 12 * g.k, py = g.y0 + 12 * g.k;
            ctx.translate(px + pose.dx, py + pose.dy);
            ctx.rotate(pose.v);
            ctx.translate(-px, -py);
        }
        Tg.glasTydelig(ctx, g, VmL, farve, etiket, gammelV);
        ctx.restore();
    }

    function skilt(ctx, tekst, x, y, farve, px) {
        NK.tekst(ctx, tekst, x, y, { font: Tg.font("700", px || 15), justering: "center", linje: "middle", farve: farve || "#dfe6ee",
            kant: true, kantFarve: "rgba(10, 14, 20, 0.75)", kantBredde: 3.5 });
    }

    /* Etiketterne: et stort A eller B, saltet og koncentrationen */
    function etiketGlas(g, hvem, st, c) {
        var k = g.k;
        return { stor: hvem, linjer: [{ t: st.formel, px: NK.klamp(16 * k, 14, 19) },
                                      { t: K.c(c) + " M", px: NK.klamp(14.5 * k, 13.5, 17), vaegt: "600" }] };
    }
    function etiketTekst(g, linjer) {
        var k = g.k;
        return { linjer: linjer.map(function (t, i) { return { t: t, px: NK.klamp((i ? 14 : 16) * k, i ? 13.5 : 14, 19), vaegt: i ? "600" : "700" }; }) };
    }

    /* Skyerne, hvor saltet loeses op, inde i glasset under overfladen */
    function tegnSkyer(ctx, g, VmL, skyer) {
        if (!skyer.length) return;
        ctx.save();
        var ly = g.ymL(VmL);
        ctx.beginPath();
        ctx.rect(g.ind.x0, ly, g.ind.x1 - g.ind.x0, g.ind.bund - ly);
        ctx.clip();
        skyer.forEach(function (s) {
            var gr = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, s.r);
            gr.addColorStop(0, "rgba(255, 255, 255, " + (0.4 * s.a) + ")");
            gr.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    /* To salte i ét glas: to vaegte med saltet og glasset med vand */
    P.tegnOploes = function (ctx, ly) {
        var lay = this.lay, s = this.s, o = this.opg, t = o.tal, f = o.facit, r = this.regning;
        ["A", "B"].forEach(function (h) {
            var v = h === "A" ? lay.vaegtA : lay.vaegtB, st = D.salt(t[h]), m = h === "A" ? t.mA : t.mB;
            var tom = s.bunke[h] <= 0.001;
            Tg.vaegt(ctx, v.cx, v.y, v.b, (tom ? "0,00" : K.g(m)) + " g", {});
            Tg.bunke(ctx, v.cx, v.skaalY, v.baadB, st, s.bunke[h], 20 * v.k + 6, h === "A" ? 1 : 2);
            /* Saltets navn paa en seddel foran vaegten */
            Tg.etiket(ctx, v.cx, ly - 12, { linjer: [{ t: st.formel, px: 17 }] });
            /* Stofmaengden staar ved bunken, naar den er regnet */
            if (!tom && r.loest(h === "A" ? "nSA" : "nSB")) {
                skilt(ctx, K.mol(h === "A" ? f.nSA : f.nSB) + " mol", v.cx, v.skaalY - 56 * v.k - 12, "#9fe0b0");
            }
        });
        var g = lay.mix;
        tegnGlas(ctx, g, s.Vmix, this.farve("mix"), null, etiketTekst(g, ["Glasset", K.mL(t.V) + " mL vand"]));
        tegnSkyer(ctx, g, s.Vmix, s.skyer);
        /* Spatlen fra vejebaaden op over glasset og ned i vandet */
        if (s.flyv) {
            var v0 = s.flyv.hvem === "A" ? lay.vaegtA : lay.vaegtB, st0 = D.salt(t[s.flyv.hvem]);
            var u = s.flyv.u, sb = NK.klamp(g.h * 0.45, 70, 140);
            var x0 = v0.cx, y0 = v0.skaalY - 8 * v0.k, x1 = g.cx, y1 = g.ind.top - 10 * g.k;
            var x = NK.lerp(x0, x1, u), y = NK.lerp(y0, y1, u) - Math.sin(u * Math.PI) * 60 * g.k;
            Tg.spatel(ctx, x, y, sb, -0.08 + (u > 0.8 ? (u - 0.8) * 3 : 0), st0, u > 0.9 ? (1 - u) * 10 : 1);
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg, s = this.s;
        if (!lay || !o || !s) return;
        if ((o.id === "samme") !== !!lay.vaegtA) this.layout();
        var t = o.tal, A = D.salt(t.A), B = D.salt(t.B), mig = this;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        this.regning.tegnTavle(ctx, lay.tavle, this.data(), this.tid);
        var ly = Math.min(lay.bordY + 24, lay.Hs - 8);
        if (o.id === "samme") {
            this.tegnOploes(ctx, ly);
        } else {
            tegnGlas(ctx, lay.mix, s.Vmix, this.farve("mix"), null, etiketTekst(lay.mix, ["Blandingen"]));
            if (s.straale) Tg.straale(ctx, s.straale.x, s.straale.y, lay.mix.ymL(s.Vmix), 5, null, this.tid);
            /* Et tomt glas har en stiplet linje ved det gamle niveau (runde 5) */
            tegnGlas(ctx, lay.glasA, s.VA, this.farve("A"), s.poseA, etiketGlas(lay.glasA, "A", A, t.cA), s.VA < t.VA - 0.5 ? t.VA : 0);
            tegnGlas(ctx, lay.glasB, s.VB, this.farve("B"), s.poseB, etiketGlas(lay.glasB, "B", B, t.cB), s.VB < t.VB - 0.5 ? t.VB : 0);
            /* Det glas, kortet beder om: gul ramme og boblen "Klik: hæld" (som krukken i sc6.1) */
            var aktiv = this.kanHaelde() ? this.aktivtGlas() : null;
            if (aktiv) {
                var ga = aktiv === "A" ? lay.glasA : lay.glasB, pa = aktiv === "A" ? s.poseA : s.poseB;
                if (!pa.dx && !pa.dy && !pa.v) {
                    Tg.ramme(ctx, ga.x0 - 4, ga.y0 - 4, ga.b + 4, ga.h + 2, 0.5 + 0.5 * Math.sin(this.tid * 4.5));
                    Tg.boble(ctx, "Klik: hæld", ga.cx, ga.y0 - 10, lay.W, this.tid);
                }
            }
        }
        if (s.vist) {
            var v = o.id === "samme" ? o.facit.total : o.facit.ionBland;
            skilt(ctx, "[" + D.ion(o.ion).t + "] = " + K.c(v) + " M", lay.mix.cx, lay.mix.y0 - 16, "#f5dd8a", 16);
        }
        /* Luppen kigger i blandingsglasset: keglen gaar fra vaesken op til luppen */
        var z = lay.zoom, ioner = this.ionListe(), g = lay.mix;
        var st = { ioner: ioner.map(function (id) { return D.ion(id); }) };
        if (!this.lupVist()) {
            Tg.plads(ctx, z.x, z.y, z.r, 0, "luppen", false, true);
            return;
        }
        var py = s.Vmix > 1 ? Math.max(g.ymL(s.Vmix) + 14 * g.k, g.ind.bund - 60 * g.k) : g.ind.bund - 24 * g.k;
        Tg.zoomKegle(ctx, g.cx + 8 * g.k, py, z.x, z.y, z.r);
        Tg.zoom(ctx, z.x, z.y, z.r, { part: this.part, st: st, farve: this.farve("mix"), titel: o.id === "samme" ? "Luppen: glasset" : "Luppen: blandingen",
            tekst: s.vist || s.ionerVist ? "" : "?" });
    };

    NK.SimBland = SimBland;
}());
