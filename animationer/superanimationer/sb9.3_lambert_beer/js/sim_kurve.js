/* =====================================================================
   sim_kurve.js - fane 2: Standardkurven

   Til venstre et spektrofotometer og en bakke med kuvetter: vand
   (blindproeven), fem standarder og proeven. Et klik paa en kuvette
   saetter den i spektrofotometret, og maalingen bliver et punkt paa
   grafen til hoejre (med lidt stoej, js/lb.js).

   Eleven
     1. maaler vandet og standarderne,
     2. traekker linjen gennem (0, 0), til den passer med punkterne
        (tjekkes mod den bedste linje gennem (0, 0), 3 %),
     3. maaler proeven, og en stiplet linje viser dens absorbans,
     4. traekker den lodrette linje hen, hvor proevens absorbans rammer
        linjen, og aflaeser koncentrationen.

   Raekkefoelgen er ikke laast, men linjen godtages foerst, naar alle
   standarderne er maalt, og aflaesningen kraever linjen og proeven.
   Opgave 4 har et fingeraftryk paa én kuvette: punktet ligger for hoejt,
   og kuvetten skal toerres af med papiret og maales igen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var LB = NK.LB;
    var Tg = NK.Tegn;

    var TID_IND = 0.35, TID_MAAL = 0.8, TID_UD = 0.35;
    var TOL_LINJE = 0.03;

    function SimKurve() {
        var mig = this;
        this.laerred = new NK.Laerred(NK.el("kurve-laerred"));
        this.fotoner = [];
        this.spawnRest = 0;
        this.startFane(D.KURVE, [{ id: "alle", titel: "" }]);
        var cv = this.laerred.canvas;
        cv.addEventListener("pointerdown", function (e) { mig.ned(e); });
        cv.addEventListener("pointermove", function (e) { mig.flyt(e); });
        cv.addEventListener("pointerup", function (e) { mig.op(e); });
        cv.addEventListener("pointercancel", function () { mig.traek = null; });
        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimKurve.prototype;
    NK.Fane.paa(P, { navn: "kurve", naesteFane: "fane-regn", naesteNavn: "Beregningen" });

    P.opg = function () { return this.opgaver[this.nr]; };

    /* ----- Opgaven ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i], s = D.STOFFER[o.stof];
        this.stof = s;
        var trin = s.cTrin / 5;
        var pc = NK.r(o.proeve[0], o.proeve[1]);
        this.proeveC = Math.round(pc / trin) * trin;
        /* Kuvetterne: vand, de fem standarder og proeven */
        this.kuv = [{ navn: "Vand", c: 0, A: null }];
        o.std.forEach(function (c) { this.kuv.push({ navn: NK.dk(c, s.cDec), c: c, A: null }); }, this);
        this.kuv.push({ navn: "Prøven", c: this.proeveC, A: null, proeve: true });
        this.aftrykI = o.aftryk ? o.aftryk.i + 1 : -1;
        if (this.aftrykI > 0) this.kuv[this.aftrykI].aftryk = true;
        this.gamle = [];               /* fejlmaalinger, der er maalt om */
        this.koe = [];
        this.maaling = null;           /* den kuvette, der er paa vej ind, maales eller paa vej ud */
        this.iSpekt = -1;              /* kuvetten i spektrofotometret */
        this.visA = null;              /* tallet i displayet */
        this.papir = { valgt: false, toerrer: null };
        var bedst = s.eps * 1;
        this.linje = { a: bedst * 0.55, ok: false, flyttet: false };
        this.aflaes = { c: null, ok: false };
        this.sagtNy = {};
        this.sidsteTrin = "maal";
        this.fotoner = [];
        NK.saetTekst("kurve-linje", o.navn + ": find prøvens koncentration med en standardkurve ved " + s.lambda + " nm.");
        this.visTabel();
    };

    P.standarder = function () { return this.kuv.filter(function (k) { return !k.proeve; }); };
    P.antalMaalt = function () { return this.standarder().filter(function (k) { return k.A !== null; }).length; };
    P.alleMaalt = function () { return this.antalMaalt() === this.standarder().length; };
    P.proeve = function () { return this.kuv[this.kuv.length - 1]; };
    P.aftrykMaalt = function () { return this.aftrykI > 0 && this.kuv[this.aftrykI].aftryk && this.kuv[this.aftrykI].A !== null; };

    /* Den bedste linje gennem (0, 0) for de rigtige maalinger */
    P.bedsteA = function () {
        var pkt = this.standarder().filter(function (k) { return k.A !== null && !k.aftryk; });
        if (pkt.length < 2) return this.stof.eps;
        return LB.haeldning(pkt);
    };

    P.trin = function () {
        if (!this.alleMaalt()) return "maal";
        if (this.aftrykMaalt()) return "aftryk";
        if (!this.linje.ok) return "linje";
        if (this.proeve().A === null) return "proeve";
        if (!this.aflaes.ok) return "aflaes";
        return "slut";
    };

    /* ----- Maalingerne --------------------------------------------------------------------- */
    P.klikKuvette = function (k) {
        if (this.papir.valgt) { this.toer(k); return; }
        if (this.maaling && this.maaling.k === k) return;
        if (this.koe.indexOf(k) >= 0) return;
        var ku = this.kuv[k];
        if (ku.aftryk && ku.A !== null && !this.sagtNy.aftryk) {
            this.sagtNy.aftryk = true;
            this.kortBesked("Kuvetten bliver målt igen, men glasset er det samme.", 4);
        }
        this.koe.push(k);
        this.nulstilHjaelp();
    };

    P.startMaaling = function () {
        if (this.maaling || !this.koe.length) return;
        var k = this.koe.shift();
        this.maaling = { k: k, fase: "ind", t: 0 };
    };

    P.afslutMaaling = function (k) {
        var ku = this.kuv[k], s = this.stof;
        var Asand = LB.A(s.eps, 1, ku.c) + (ku.aftryk ? this.opg().aftryk.A : 0);
        var A = k === 0 ? 0 : LB.maal(Asand);
        if (k === 0) A = 0;
        if (ku.A !== null && ku.rettes) { this.gamle.push({ c: ku.c, A: ku.A }); ku.rettes = false; }
        if (ku.A !== null && !ku.aftryk) this.gamle = this.gamle.filter(function (g) { return g.c !== ku.c; });
        ku.A = Math.round(A * 1000) / 1000;
        ku.nyT = 0;
        this.visA = ku.A;
        /* Linjen tjekkes igen, hvis noget er maalt om */
        if (this.linje.ok && !ku.proeve) this.linje.ok = Math.abs(this.linje.a - this.bedsteA()) / this.bedsteA() <= TOL_LINJE && !this.aftrykMaalt();
        this.visTabel();
        this.visKort();
        this.efterSkridt();
    };

    /* Papiret: toerrer en kuvette af. Kun kuvetten med fingeraftrykket
       bliver anderledes. */
    P.vaelgPapir = function () {
        this.papir.valgt = !this.papir.valgt;
        if (this.papir.valgt) this.kortBesked("Klik på den kuvette, papiret skal tørre af.", 5);
    };

    P.toer = function (k) {
        this.papir.valgt = false;
        var ku = this.kuv[k];
        this.papir.toerrer = { k: k, t: 0 };
        if (ku.aftryk) {
            ku.aftryk = false;
            if (ku.A !== null) {
                this.gamle.push({ c: ku.c, A: ku.A });
                ku.A = null;
            }
            this.visTabel();
            this.besked('<span class="b-maerke">Tørret af</span> Fingeraftrykket er væk. Mål kuvetten med ' + NK.html(ku.navn) + " mM igen.", "gul");
            this.nulstilHjaelp();
            this.visKort();
        } else {
            this.kortBesked("Kuvetten var allerede ren.", 3);
        }
    };

    /* Efter hvert skridt: linjen siger det naeste */
    P.efterSkridt = function () {
        if (this.faerdig) return;
        var t = this.trin();
        if (t !== this.sidsteTrin) { this.sidsteTrin = t; this.nulstilHjaelp(); }
        if (t === "aftryk" && !this.sagtNy.punkt) {
            this.sagtNy.punkt = true;
            this.besked('<span class="b-maerke">Se på punkterne</span> Ét punkt ligger langt fra de andre. Find ud af hvorfor, før linjen lægges.', "gul");
            return;
        }
        if (t === "slut") return;
        this.naesteLinje("", "");
    };

    /* ----- Linjen ----------------------------------------------------------------------- */
    P.tjekLinje = function () {
        var best = this.bedsteA(), a = this.linje.a;
        if (!this.alleMaalt()) {
            this.besked("Mål vandet og alle fem standarder først. Linjen skal passe med dem alle.", "gul");
            return;
        }
        if (Math.abs(a - best) / best <= TOL_LINJE) {
            if (this.aftrykMaalt()) {
                var ku = this.kuv[this.aftrykI];
                this.besked('<span class="b-maerke">Næsten</span> Linjen passer med de fleste punkter, men punktet ved ' + NK.html(ku.navn) +
                    " mM ligger langt over den. Se på den kuvette i bakken.", "gul");
                return;
            }
            this.linje.ok = true;
            this.linje.a = Math.round(a * 1000) / 1000;
            this.nulstilHjaelp();
            this.besked('<span class="b-maerke">Linjen passer ✓</span> Hældningen er a = ' + NK.dk(this.linje.a, this.decA()) + " mM⁻¹. " +
                (this.proeve().A === null ? "Mål nu prøven." : "Aflæs nu prøvens koncentration."), "god");
            this.visKort();
            return;
        }
        this.linje.ok = false;
        this.fejlLinje(a > best ? "Linjen ligger over de fleste punkter. Træk den gule prik lidt ned." :
            "Linjen ligger under de fleste punkter. Træk den gule prik lidt op.");
    };

    P.decA = function () { return this.stof.eps >= 10 ? 1 : 2; };

    /* ----- Aflaesningen ---------------------------------------------------------------- */
    P.facitC = function () { return this.proeve().A / this.linje.a; };

    P.tjekAflaes = function () {
        if (!this.linje.ok || this.proeve().A === null) return;
        var g = this.graf(), m = this.aflaes.c, f = this.facitC();
        if (Math.abs(m - f) <= g.xMax * 0.02) {
            this.aflaes.c = f;
            this.aflaes.ok = true;
            this.faerdigOpgave(false);
        } else {
            this.fejlLinje(m < f ? "Den lodrette linje rammer standardkurven under prøvens absorbans. Træk den mod højre." :
                "Den lodrette linje rammer standardkurven over prøvens absorbans. Træk den mod venstre.");
        }
    };

    P.faerdigOpgave = function (vist) {
        var s = this.stof, a = this.linje.a, Ap = this.proeve().A, c = Ap / a;
        var tekst = "Prøvens koncentration er " + NK.dk(c, s.cDec + (c < 0.1 ? 1 : 0)) + " mM. Det samme giver c = A / a = " +
            NK.dk(Ap, 3) + " / " + NK.dk(a, this.decA()) + " mM⁻¹ = " + NK.betydende(c, 3) + " mM.";
        this.visTabel();
        this.loest(vist ? "svar" : "ok", NK.html(tekst), vist ? "Svaret" : "Aflæst ✓");
    };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.promptHTML = function () {
        var o = this.opg(), s = this.stof, mig = this;
        var t = this.trin();
        var punkter = [
            { tekst: this.aftrykMaalt() ? "Mål vandet og standarderne (én skal måles igen)" : "Mål vandet og standarderne (" + this.antalMaalt() + "/6)",
                ok: this.alleMaalt() && !this.aftrykMaalt() },
            { tekst: "Læg linjen gennem (0, 0)", ok: this.linje.ok },
            { tekst: "Mål prøven", ok: this.proeve().A !== null },
            { tekst: "Aflæs prøvens koncentration", ok: this.aflaes.ok }
        ];
        var html = '<p class="note-tekst">' + NK.html(o.tekst) + "</p><ol class='tjekliste'>";
        punkter.forEach(function (p) { html += '<li class="' + (p.ok ? "ok" : "") + '">' + NK.html(p.tekst) + "</li>"; });
        html += "</ol>";
        if (t === "slut") {
            var a = this.linje.a;
            html += '<div class="forklaring"><p>Punkterne ligger på en ret linje gennem (0, 0), fordi A = ε · l · c. Hældningen er a = ε · l. ' +
                "Med l = 1,00 cm er ε = " + NK.dk(a, mig.decA()) + " mM⁻¹·cm⁻¹ (tabelværdien er " + NK.dk(s.eps, mig.decA()) + ").</p></div>";
        }
        return html;
    };

    P.visTabel = function () {
        var s = this.stof, mig = this;
        var html = "<table class='maaletabel'><thead><tr><th></th><th>c (mM)</th><th>A</th></tr></thead><tbody>";
        this.kuv.forEach(function (k, i) {
            var nu = mig.maaling && mig.maaling.k === i;
            html += "<tr class='" + (nu ? "nu" : "") + (k.proeve ? " proeve" : "") + "'><td>" + (k.proeve ? "Prøven" : (i === 0 ? "Vand" : "Standard " + i)) +
                "</td><td>" + (k.proeve ? (mig.aflaes.ok ? NK.dk(mig.facitC(), s.cDec + 1) : "?") : NK.dk(k.c, s.cDec)) +
                "</td><td>" + (k.A === null ? "" : NK.dk(k.A, 3)) + "</td></tr>";
        });
        html += "</tbody></table>";
        NK.saetHTML("kurve-tabel", html);
    };

    P.trinLinje = function () {
        var t = this.trin(), mangler = this.standarder().filter(function (k) { return k.A === null; });
        if (t === "maal") {
            if (this.kuv[0].A === null) return "Klik på kuvetterne i bakken for at måle dem. Begynd med vandet.";
            return "Mål de næste kuvetter. Der mangler " + mangler.length + ".";
        }
        if (t === "aftryk") return "Ét punkt ligger langt fra de andre. Find ud af hvorfor.";
        if (t === "linje") return "Træk i den gule prik for enden af linjen, til linjen passer med punkterne.";
        if (t === "proeve") return "Mål prøven: klik på kuvetten Prøven i bakken.";
        if (t === "aflaes") return "Træk den lodrette linje hen, hvor prøvens absorbans rammer standardkurven.";
        return "";
    };

    /* ----- Hint og svar ------------------------------------------------------------------- */
    P.hintTrin = function () {
        var t = this.trin(), s = this.stof;
        if (t === "maal") {
            var mangler = this.standarder().filter(function (k) { return k.A === null; }).map(function (k) { return k.navn === "Vand" ? "vandet" : k.navn + " mM"; });
            return { trin: ["Klik på en kuvette i bakken. Den bliver sat i spektrofotometret og målt.",
                "Mål vandet og alle fem standarder. Hver måling bliver et punkt på grafen.",
                "Der mangler: " + mangler.join(", ") + "."], lys: "bakke" };
        }
        if (t === "aftryk") {
            var ku = this.kuv[this.aftrykI];
            return { trin: ["Ét punkt ligger langt over linjen gennem de andre. Hvilken koncentration hører det til?",
                "Se godt på kuvetten med " + NK.html(ku.navn) + " mM i bakken. Der er et fingeraftryk på glasset.",
                "Klik på papiret og så på kuvetten med " + NK.html(ku.navn) + " mM. Mål den derefter igen."], lys: "aftryk" };
        }
        if (t === "linje") {
            return { trin: ["Vandet gav A = 0, så linjen går gennem (0, 0).",
                "Træk i den gule prik. Punkterne skal ligge tæt på linjen, nogle lidt over og nogle lidt under.",
                "Hældningen skal være ca. " + NK.dk(this.bedsteA(), this.decA()) + " mM⁻¹."], lys: "linje" };
        }
        if (t === "proeve") {
            return { trin: ["Prøven måles på samme måde som standarderne.", "Klik på kuvetten Prøven i bakken.",
                "Prøven står yderst til højre i bakken."], lys: "proeve" };
        }
        if (t === "aflaes") {
            var c = this.facitC(), trin = s.cTrin * 5;
            var lav = Math.floor(c / trin) * trin;
            return { trin: ["Prøvens absorbans står på y-aksen. Den stiplede linje går derfra vandret hen til standardkurven.",
                "Træk den lodrette linje hen, hvor den stiplede linje rammer standardkurven.",
                "Koncentrationen ligger mellem " + NK.dk(lav, s.cDec) + " og " + NK.dk(lav + trin, s.cDec) + " mM."], lys: "aflaes" };
        }
        return null;
    };

    P.visSvar = function () {
        var t = this.trin(), mig = this;
        this.hjaelp = 0;
        this.hintLys = null;
        if (t === "maal") {
            this.standarder().forEach(function (k, i) { if (k.A === null && mig.koe.indexOf(i) < 0 && !(mig.maaling && mig.maaling.k === i)) mig.koe.push(i); });
            this.besked('<span class="b-maerke">Svaret</span> Alle standarderne bliver målt.', "gul");
        } else if (t === "aftryk") {
            this.toer(this.aftrykI);
            this.koe.push(this.aftrykI);
            this.besked('<span class="b-maerke">Svaret</span> Fingeraftrykket gav for høj absorbans. Kuvetten er tørret af og bliver målt igen.', "gul");
        } else if (t === "linje") {
            this.linje.a = this.bedsteA();
            this.linje.flyttet = true;
            this.tjekLinje();
        } else if (t === "proeve") {
            if (this.koe.indexOf(this.kuv.length - 1) < 0) this.koe.push(this.kuv.length - 1);
            this.besked('<span class="b-maerke">Svaret</span> Prøven bliver målt.', "gul");
        } else if (t === "aflaes") {
            this.aflaes.c = this.facitC();
            this.aflaes.ok = true;
            this.faerdigOpgave(true);
        }
    };

    P.visHintLys = function () {};

    P.enter = function () { if (this.faerdig) this.knap(); };
    P.nulstil = function () { this.vaelg(this.nr); };
    P.tilpas = function () { this.laerred.tilpas(); };

    /* ----- Geometrien ------------------------------------------------------------------- */
    P.geo = function () {
        var W = this.laerred.b, H = this.laerred.h, pad = 14;
        var g = { W: W, H: H, pad: pad };
        g.vb = NK.klamp(W * 0.38, 250, 380);                 /* venstre spalte */
        g.px = NK.klamp(Math.min(W / 60, H / 34), 12.5, 16);
        /* Spektrofotometret */
        g.sx = pad; g.sy = pad + g.px * 1.4;
        g.sb = g.vb - pad; g.sh = NK.klamp(H * 0.36, 150, 230);
        g.yc = g.sy + g.sh * 0.42;
        g.lb = 34; g.lh = 46;
        g.lx = g.sx + 14; g.ly = g.yc - g.lh / 2;
        g.detB = 40; g.detH = 54;
        g.dx = g.sx + g.sb - 14 - g.detB; g.dy = g.yc - g.detH / 2;
        g.slotX = (g.lx + g.lb + g.dx) / 2;
        g.kb = 30; g.kh = 64;
        g.slotY = g.yc - g.kh * 0.55;
        g.beamH = 20;
        g.dispB = NK.klamp(g.sb * 0.5, 140, 200);
        g.dispX = g.sx + g.sb / 2 - g.dispB / 2;
        g.dpx = NK.klamp(g.px * 1.1, 14, 18);
        g.dispH = g.dpx * (1.45 + 0.7);
        g.dispY = g.sy + g.sh - g.dispH - 10;
        /* Bakken */
        g.bakkeY = g.sy + g.sh + g.px * 2.4;
        var n = this.kuv.length + (this.aftrykI > 0 ? 1 : 0);
        g.raekker = (g.vb - pad) / n < 40 ? 2 : 1;
        var perRaekke = Math.ceil(n / g.raekker);
        g.slot = (g.vb - pad - 10) / perRaekke;
        g.bk = NK.klamp(g.slot * 0.55, 20, 30);
        g.bh = NK.klamp(H * 0.11, 46, 64);
        g.bakkeH = g.raekker * (g.bh + g.px * 2.6) + 14;
        g.perRaekke = perRaekke;
        /* Grafen */
        g.gx0 = g.vb + 30 + g.px * 3.2;
        g.gx1 = W - pad - 12;
        g.gy0 = pad + g.px * 2.4;
        g.gy1 = H - pad - g.px * 3.2;
        return g;
    };

    /* Kuvettens plads i bakken (oeverste venstre hjoerne) */
    P.bakkePlads = function (g, i) {
        var r = Math.floor(i / g.perRaekke), j = i % g.perRaekke;
        var x = g.pad + 5 + j * g.slot + (g.slot - g.bk) / 2;
        var y = g.bakkeY + 8 + r * (g.bh + g.px * 2.6);
        return { x: x, y: y };
    };

    /* Grafens skalaer */
    P.graf = function () {
        var s = this.stof, o = this.opg();
        var maxC = o.std[o.std.length - 1] * 1.12;
        var xs = Tg.skala(maxC, 5);
        var maxA = s.eps * maxC * 1.08;
        this.kuv.forEach(function (k) { if (k.A !== null) maxA = Math.max(maxA, k.A * 1.05); });
        var ys = Tg.skala(maxA, 5);
        return { xs: xs, ys: ys, xMax: xs.maks, yMax: ys.maks };
    };

    P.tilPx = function (g, gr, c, A) {
        return { x: g.gx0 + c / gr.xMax * (g.gx1 - g.gx0), y: g.gy1 - A / gr.yMax * (g.gy1 - g.gy0) };
    };

    P.fraPx = function (g, gr, x, y) {
        return { c: (x - g.gx0) / (g.gx1 - g.gx0) * gr.xMax, A: (g.gy1 - y) / (g.gy1 - g.gy0) * gr.yMax };
    };

    /* Linjens ende (der, hvor grebet sidder) */
    P.linjeEnde = function (g, gr) {
        var a = this.linje.a;
        var c = gr.xMax * 0.94;
        if (a * c > gr.yMax * 0.94) c = gr.yMax * 0.94 / a;
        return this.tilPx(g, gr, c, a * c);
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.hvad = function (p) {
        var g = this.geo(), gr = this.graf(), i;
        /* Papiret */
        if (this.aftrykI > 0) {
            var pp = this.bakkePlads(g, this.kuv.length);
            if (p.x >= pp.x - 6 && p.x <= pp.x + g.bk + 10 && p.y >= pp.y - 4 && p.y <= pp.y + g.bh + 4) return { slags: "papir" };
        }
        for (i = 0; i < this.kuv.length; i++) {
            var q = this.bakkePlads(g, i);
            if (p.x >= q.x - 8 && p.x <= q.x + g.bk + 8 && p.y >= q.y - 6 && p.y <= q.y + g.bh + g.px * 2) return { slags: "kuvette", k: i };
        }
        /* Grebet paa linjen og selve linjen */
        var e = this.linjeEnde(g, gr);
        if (this.antalMaalt() >= 2 && Math.hypot(p.x - e.x, p.y - e.y) <= 16) return { slags: "linje" };
        /* Den lodrette aflaesningslinje */
        if (this.linje.ok && this.proeve().A !== null && !this.aflaes.ok && this.aflaes.c !== null) {
            var ax = this.tilPx(g, gr, this.aflaes.c, 0).x;
            if (Math.abs(p.x - ax) <= 12 && p.y >= g.gy0 && p.y <= g.gy1 + 22) return { slags: "aflaes" };
        }
        if (p.x >= g.gx0 && p.x <= g.gx1 && p.y >= g.gy0 && p.y <= g.gy1) {
            if (this.antalMaalt() >= 2) {
                var d = this.fraPx(g, gr, p.x, p.y);
                var paaLinje = this.tilPx(g, gr, d.c, this.linje.a * d.c);
                if (Math.abs(paaLinje.y - p.y) <= 10 && d.c > gr.xMax * 0.1) return { slags: "linje" };
            }
            return { slags: "graf" };
        }
        if (p.x >= g.sx && p.x <= g.sx + g.sb && p.y >= g.sy && p.y <= g.sy + g.sh) return { slags: "spekt" };
        return null;
    };

    P.ned = function (e) {
        var p = this.laerred.punkt(e);
        var h = this.hvad(p);
        this.traek = { h: h, x: p.x, y: p.y, flyttet: false };
        if (h && (h.slags === "linje" || h.slags === "aflaes" || h.slags === "papir")) {
            try { this.laerred.canvas.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            e.preventDefault();
        }
    };

    P.flyt = function (e) {
        var p = this.laerred.punkt(e), t = this.traek;
        if (t && t.h && Math.hypot(p.x - t.x, p.y - t.y) > 4) t.flyttet = true;
        if (t && t.h && t.flyttet) {
            var g = this.geo(), gr = this.graf();
            var d = this.fraPx(g, gr, p.x, p.y);
            if (t.h.slags === "linje" && !this.faerdig) {
                if (d.c > gr.xMax * 0.03) {
                    this.linje.a = NK.klamp(Math.max(0, d.A) / d.c, 0.05 * this.stof.eps, 4 * this.stof.eps);
                    this.linje.flyttet = true;
                    if (this.linje.ok) { this.linje.ok = false; this.visKort(); }
                }
                this.laerred.canvas.style.cursor = "grabbing";
                return;
            }
            if (t.h.slags === "aflaes" && !this.faerdig) {
                this.aflaes.c = NK.klamp(d.c, 0, gr.xMax);
                this.laerred.canvas.style.cursor = "ew-resize";
                return;
            }
            if (t.h.slags === "papir") { this.papirTraek = p; return; }
        }
        var h = this.hvad(p);
        var cur = "default";
        if (h) {
            if (h.slags === "linje") cur = "grab";
            else if (h.slags === "aflaes") cur = "ew-resize";
            else if (h.slags === "kuvette" || h.slags === "papir") cur = "pointer";
        }
        this.laerred.canvas.style.cursor = cur;
    };

    P.op = function (e) {
        var t = this.traek, p = this.laerred.punkt(e);
        this.traek = null;
        this.papirTraek = null;
        if (!t || !t.h) { if (this.papir.valgt) this.papir.valgt = false; return; }
        try { this.laerred.canvas.releasePointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
        var s = t.h.slags;
        if (t.flyttet) {
            if (s === "linje" && !this.faerdig) { this.tjekLinje(); return; }
            if (s === "aflaes" && !this.faerdig) { this.tjekAflaes(); return; }
            if (s === "papir") {
                var h = this.hvad(p);
                if (h && h.slags === "kuvette") this.toer(h.k);
                return;
            }
        }
        this.klik(t.h);
    };

    P.klik = function (h) {
        var s = this.stof;
        if (h.slags === "kuvette") { this.klikKuvette(h.k); return; }
        if (h.slags === "papir") { this.vaelgPapir(); return; }
        if (this.papir.valgt) this.papir.valgt = false;
        if (h.slags === "linje") {
            this.kortBesked(this.antalMaalt() < 2 ? "Linjen kan trækkes, når der er mindst to punkter." :
                "Træk i den gule prik for at dreje linjen om (0, 0).", 4);
        } else if (h.slags === "graf") {
            if (this.linje.ok && this.proeve().A !== null && !this.aflaes.ok) {
                this.kortBesked("Træk i den lodrette linje med den gule trekant på x-aksen.", 4);
            } else {
                this.kortBesked("Grafen viser absorbansen A mod koncentrationen c. Hver måling bliver et punkt.", 4);
            }
        } else if (h.slags === "spekt") {
            this.kortBesked("Spektrofotometret sender lys med " + s.lambda + " nm gennem kuvetten og måler absorbansen A.", 5);
        }
    };

    /* ----- Loekken ---------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.opdaterBesked(dt);
        this.startMaaling();
        var m = this.maaling;
        if (m) {
            m.t += dt;
            if (m.fase === "ind" && m.t >= TID_IND) { m.fase = "maal"; m.t = 0; this.iSpekt = m.k; this.visA = null; this.visTabel(); }
            else if (m.fase === "maal" && m.t >= TID_MAAL) { m.fase = "ud"; m.t = 0; this.afslutMaaling(m.k); }
            else if (m.fase === "ud" && m.t >= TID_UD) { this.maaling = null; this.iSpekt = -1; this.visTabel(); }
        }
        if (this.papir.toerrer) {
            this.papir.toerrer.t += dt;
            if (this.papir.toerrer.t > 0.6) this.papir.toerrer = null;
        }
        this.kuv.forEach(function (k) { if (k.nyT !== undefined && k.nyT < 1) k.nyT += dt * 2.5; });
        /* Aflaesningslinjen dukker op, naar der er noget at aflaese */
        if (this.linje.ok && this.proeve().A !== null && this.aflaes.c === null) this.aflaes.c = this.graf().xMax * 0.08;
        this.opdaterFotoner(dt);
        this.tegn();
    };

    P.opdaterFotoner = function (dt) {
        var g = this.geo();
        var k = this.iSpekt >= 0 ? this.kuv[this.iSpekt] : null;
        var T = 1;
        if (k && this.maaling && this.maaling.fase !== "ind") {
            T = LB.T(LB.A(this.stof.eps, 1, k.c) + (k.aftryk ? this.opg().aftryk.A : 0));
        }
        this.spawnRest += dt * 22;
        while (this.spawnRest >= 1) {
            this.spawnRest -= 1;
            this.fotoner.push({ x: g.lx + g.lb, y: g.yc + (Math.random() - 0.5) * g.beamH * 0.6, afgjort: false, ude: false });
        }
        var kl = g.slotX - g.kb / 2;
        for (var i = this.fotoner.length - 1; i >= 0; i--) {
            var p = this.fotoner[i];
            p.x += 170 * dt;
            if (!p.afgjort && p.x >= kl) {
                p.afgjort = true;
                if (k && Math.random() > T) p.ude = true;
            }
            if ((p.ude && p.x >= kl + 4) || p.x >= g.dx) this.fotoner.splice(i, 1);
        }
    };

    /* ----- Tegningen ---------------------------------------------------------------------- */
    P.tegn = function () {
        var L = this.laerred, ctx = L.ctx;
        if (L.b < 50 || L.h < 50) return;
        L.ryd();
        var g = this.geo();
        this.tegnSpekt(ctx, g);
        this.tegnBakke(ctx, g);
        this.tegnGraf(ctx, g);
    };

    P.kuvetteFarve = function (k) {
        return k.c > 0 ? Tg.vaeskeFarve(this.stof, k.c * 2.2) : null;
    };

    P.tegnSpekt = function (ctx, g) {
        var s = this.stof, px = g.px;
        ctx.save();
        ctx.fillStyle = "#2a2d38";
        NK.rundtRekt(ctx, g.sx, g.sy, g.sb, g.sh, 12);
        ctx.fill();
        ctx.strokeStyle = this.hintLys === "spekt" ? "#f2c53d" : "#4a4d5c";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "Spektrofotometer, " + s.lambda + " nm", g.sx + 4, g.sy - 7, { font: Tg.font("700", px), farve: "#cfd6de" });

        var k = this.iSpekt >= 0 ? this.kuv[this.iSpekt] : null;
        var T = 1;
        if (k && this.maaling && this.maaling.fase !== "ind") T = LB.T(LB.A(s.eps, 1, k.c) + (k.aftryk ? this.opg().aftryk.A : 0));
        var kl = g.slotX - g.kb / 2, kr = g.slotX + g.kb / 2;
        Tg.straale(ctx, g.lx + g.lb, kl, g.yc, g.beamH, s.lys, 1);
        Tg.straale(ctx, kr, g.dx, g.yc, g.beamH, s.lys, k ? T : 1);
        /* Holderen */
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = 2;
        ctx.strokeRect(kl - 5, g.slotY - 4, g.kb + 10, g.kh + 8);
        ctx.restore();
        Tg.lampe(ctx, g.lx, g.ly, g.lb, g.lh, s.lys);
        Tg.detektor(ctx, g.dx, g.dy, g.detB, g.detH, g.beamH + 6);
        ctx.save();
        ctx.fillStyle = Tg.rgba(s.lys, 1);
        this.fotoner.forEach(function (p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        /* Kuvetten, der er paa vej ind eller ud, eller staar i holderen */
        var m = this.maaling;
        if (m) {
            var fra = this.bakkePlads(g, m.k), til = { x: kl, y: g.slotY };
            var u = m.fase === "ind" ? NK.blod(m.t / TID_IND) : (m.fase === "ud" ? 1 - NK.blod(m.t / TID_UD) : 1);
            var kx = NK.lerp(fra.x, til.x, u), ky = NK.lerp(fra.y, til.y, u) - Math.sin(u * Math.PI) * 30;
            var b = NK.lerp(g.bk, g.kb, u), h = NK.lerp(g.bh, g.kh, u);
            var ku = this.kuv[m.k];
            Tg.kuvette(ctx, kx, ky, b, h, { rgb: this.kuvetteFarve(ku), aftryk: ku.aftryk });
        }

        /* Displayet */
        var vis = "–";
        if (m && m.fase === "maal") vis = "måler …";
        else if (this.visA !== null) vis = NK.dk(this.visA, 3);
        else vis = "0,000";
        Tg.display(ctx, g.dispX, g.dispY, g.dispB, [{ etiket: "A", tal: vis, farve: "#ffe28a" }], g.dpx);
    };

    P.tegnBakke = function (ctx, g) {
        var px = g.px, mig = this;
        var y0 = g.bakkeY - 4;
        ctx.save();
        ctx.fillStyle = "#2d303b";
        NK.rundtRekt(ctx, g.pad, y0, g.vb - g.pad, g.bakkeH, 12);
        ctx.fill();
        var lys = this.hintLys === "bakke" || this.hintLys === "proeve" || this.hintLys === "aftryk";
        ctx.strokeStyle = lys ? "#f2c53d" : "#454859";
        ctx.lineWidth = lys ? 2.5 : 1.5;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "Bakken", g.pad + 4, y0 - 7, { font: Tg.font("700", px), farve: "#cfd6de" });
        this.kuv.forEach(function (k, i) {
            var q = mig.bakkePlads(g, i);
            var ude = mig.maaling && mig.maaling.k === i;
            var koe = mig.koe.indexOf(i) >= 0;
            if (!ude) {
                var lysK = (mig.hintLys === "proeve" && k.proeve) || (mig.hintLys === "aftryk" && i === mig.aftrykI) ||
                    (mig.hintLys === "bakke" && k.A === null && !k.proeve);
                Tg.kuvette(ctx, q.x, q.y, g.bk, g.bh, { rgb: mig.kuvetteFarve(k), aftryk: k.aftryk, lys: lysK ? "rgba(242, 197, 61, 0.95)" : (koe ? "rgba(61, 158, 224, 0.9)" : null) });
            } else {
                ctx.save();
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.strokeRect(q.x, q.y, g.bk, g.bh);
                ctx.restore();
            }
            var navn = k.proeve ? "Prøven" : k.navn;
            NK.tekst(ctx, navn, q.x + g.bk / 2, q.y + g.bh + px * 1.15, { font: Tg.font("600", Math.max(12, px * 0.85)), justering: "center", farve: k.proeve ? "#ffe28a" : "#c8ced6" });
            if (k.A !== null) NK.tekst(ctx, "✓", q.x + g.bk / 2, q.y + g.bh + px * 2.2, { font: Tg.font("700", px * 0.85), justering: "center", farve: "#7ee0a8" });
        });
        if (this.aftrykI > 0) {
            var pp = this.bakkePlads(g, this.kuv.length);
            if (this.papirTraek) pp = { x: this.papirTraek.x - g.bk / 2, y: this.papirTraek.y - g.bh / 3 };
            var tt = this.papir.toerrer;
            if (tt) {
                var mq = this.bakkePlads(g, tt.k);
                pp = { x: mq.x + Math.sin(tt.t * 30) * 4, y: mq.y + g.bh * 0.3 };
            }
            ctx.save();
            ctx.fillStyle = "#f4f4ef";
            ctx.strokeStyle = this.papir.valgt ? "#f2c53d" : "#b9b9b0";
            ctx.lineWidth = this.papir.valgt ? 3 : 1.5;
            ctx.beginPath();
            ctx.moveTo(pp.x, pp.y + 6);
            ctx.lineTo(pp.x + g.bk + 4, pp.y);
            ctx.lineTo(pp.x + g.bk + 2, pp.y + g.bh * 0.6);
            ctx.lineTo(pp.x - 2, pp.y + g.bh * 0.66);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            var hp = this.bakkePlads(g, this.kuv.length);
            NK.tekst(ctx, "Papir", hp.x + g.bk / 2, hp.y + g.bh + px * 1.15, { font: Tg.font("600", Math.max(12, px * 0.85)), justering: "center", farve: "#c8ced6" });
        }
    };

    P.tegnGraf = function (ctx, g) {
        var gr = this.graf(), s = this.stof, px = g.px, mig = this;
        var x0 = g.gx0, x1 = g.gx1, y0 = g.gy0, y1 = g.gy1;
        ctx.save();
        /* Baggrund og gitter */
        ctx.fillStyle = "#f7f8fa";
        NK.rundtRekt(ctx, x0 - g.px * 3.4, y0 - g.px * 1.6, x1 - x0 + g.px * 3.4 + 10, y1 - y0 + g.px * 4.4, 10);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.font = Tg.font("600", Math.max(12, px * 0.85));
        ctx.fillStyle = "#4a5160";
        ctx.textAlign = "center";
        for (var c = 0; c <= gr.xMax + 1e-9; c += gr.xs.trin) {
            var X = this.tilPx(g, gr, c, 0).x;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
            ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, y1); ctx.stroke();
            ctx.fillText(NK.dk(c, Math.max(gr.xs.dec, 1)), X, y1 + px * 1.2);
        }
        ctx.textAlign = "right";
        for (var a = 0; a <= gr.yMax + 1e-9; a += gr.ys.trin) {
            var Y = this.tilPx(g, gr, 0, a).y;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
            ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(x1, Y); ctx.stroke();
            ctx.fillText(NK.dk(a, Math.max(gr.ys.dec, 1)), x0 - 6, Y + 4);
        }
        ctx.strokeStyle = "#222831";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.fillStyle = "#222831";
        ctx.font = Tg.font("700", px);
        ctx.textAlign = "center";
        ctx.fillText("c (mM)", (x0 + x1) / 2, y1 + px * 2.5);
        ctx.textAlign = "left";
        ctx.fillText("A", x0 - px * 2.6, y0 - px * 0.5);
        ctx.restore();

        /* Proevens absorbans: stiplet vandret linje hen til linjen */
        var pr = this.proeve();
        if (pr.A !== null) {
            var cKryds = this.linje.a > 0 ? pr.A / this.linje.a : gr.xMax;
            var p1 = this.tilPx(g, gr, 0, pr.A), p2 = this.tilPx(g, gr, Math.min(cKryds, gr.xMax), pr.A);
            ctx.save();
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = "#c28a00";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "Prøven: A = " + NK.dk(pr.A, 3), p1.x + 6, p1.y - 6, { font: Tg.font("700", Math.max(12, px * 0.85)), farve: "#8a6200" });
        }

        /* Linjen gennem (0, 0) */
        if (this.antalMaalt() >= 2) {
            var e = this.linjeEnde(g, gr), o = this.tilPx(g, gr, 0, 0);
            var aMax = Math.min(gr.xMax, gr.yMax / this.linje.a);
            var slut = this.tilPx(g, gr, aMax, this.linje.a * aMax);
            ctx.save();
            ctx.strokeStyle = this.linje.ok ? "#1d9a55" : "#5a7fa8";
            ctx.lineWidth = 3;
            if (!this.linje.flyttet) ctx.setLineDash([8, 6]);
            ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(slut.x, slut.y); ctx.stroke();
            ctx.setLineDash([]);
            if (!this.faerdig) {
                var lys = this.hintLys === "linje";
                ctx.fillStyle = "#f2c53d";
                ctx.strokeStyle = lys ? "#b07800" : "#7a5a00";
                ctx.lineWidth = lys ? 3 : 2;
                ctx.beginPath(); ctx.arc(e.x, e.y, lys ? 10 : 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
            ctx.restore();
            NK.tekst(ctx, "A = a · c     a = " + NK.dk(this.linje.a, this.decA()) + " mM⁻¹", x0 + 10, y0 + px * 1.1,
                { font: Tg.font("700", px), farve: this.linje.ok ? "#1d7a48" : "#3f5f86" });
        }

        /* Fejlmaalinger, der er maalt om: et blegt kryds */
        this.gamle.forEach(function (q) {
            var p = mig.tilPx(g, gr, q.c, q.A);
            ctx.save();
            ctx.strokeStyle = "rgba(200, 60, 50, 0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(p.x - 5, p.y - 5); ctx.lineTo(p.x + 5, p.y + 5); ctx.moveTo(p.x + 5, p.y - 5); ctx.lineTo(p.x - 5, p.y + 5); ctx.stroke();
            ctx.restore();
        });

        /* Punkterne */
        this.kuv.forEach(function (k) {
            if (k.A === null || k.proeve) return;
            var p = mig.tilPx(g, gr, k.c, k.A);
            var r = 5.5 * NK.pop(k.nyT === undefined ? 1 : Math.min(1, k.nyT));
            ctx.save();
            ctx.fillStyle = "#2a76ac";
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, r), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.restore();
        });

        /* Den lodrette aflaesningslinje */
        if (this.aflaes.c !== null && this.linje.ok && pr.A !== null) {
            var cc = this.aflaes.c;
            var top = this.tilPx(g, gr, cc, Math.min(this.linje.a * cc, gr.yMax)), bund = this.tilPx(g, gr, cc, 0);
            var ok = this.aflaes.ok;
            ctx.save();
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = ok ? "#1d9a55" : "#c28a00";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bund.x, bund.y); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = ok ? "#1d9a55" : "#f2c53d";
            ctx.strokeStyle = ok ? "#11653a" : "#7a5a00";
            ctx.lineWidth = this.hintLys === "aflaes" ? 3 : 1.8;
            ctx.beginPath();
            ctx.moveTo(bund.x, bund.y + 2);
            ctx.lineTo(bund.x - 9, bund.y + 16);
            ctx.lineTo(bund.x + 9, bund.y + 16);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = ok ? "#1d9a55" : "#c28a00";
            ctx.beginPath(); ctx.arc(top.x, top.y, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            if (ok) {
                NK.tekst(ctx, "c = " + NK.dk(cc, s.cDec + (cc < 0.1 ? 1 : 0)) + " mM", bund.x + 12, bund.y - 10,
                    { font: Tg.font("800", px * 1.05), farve: "#1d7a48" });
            }
        }
    };

    NK.SimKurve = SimKurve;
}());
