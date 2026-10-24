/* =====================================================================
   sim_ethanol.js - fane 1: ethanol

   Den gamle b4.1, gjort faerdig: luppen med ethanolmolekylerne, de
   roede hydrogenbindinger og de graa London-kraefter, temperaturen man
   skruer paa, og kontakten, der slaar hydrogenbindingerne fra.

   Til venstre staar forklaringen af stregerne i luppen (ingen taeller:
   brugeren 24. okt. 2026 fandt taelleren "lidt underlig og
   indforstaaet") og under den temperaturkammeret med et reagensglas med
   ethanol og en ballon paa (som sc4.1). Termometeret til hoejre styrer
   temperaturen. Fire opgaver, og ingen af dem loeses af sig selv, naar
   eleven traekker i termometeret:

     1. kog: find kogepunktet og send det ind (Indsend svar: 78 °C)
     2. brydes: hvilke bindinger brydes, vaelg alle, der passer
     3. hvilket: klik paa det H, der kan danne hydrogenbindinger, og send
        det ind
     4. uden: gaet foerst, slaa saa hydrogenbindingerne fra og find det
        nye kogepunkt (−42 °C)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    function SimEthanol() {
        var mig = this;
        this.cfg = D.ETHANOL;
        this.st = D.STOF[this.cfg.stof];
        this.P = new NK.Proeve(this.st, this.cfg.antal, this.cfg.Rm, 5);
        this.P.nulstil(this.cfg.start);
        this.termo = new NK.Termostat(this.cfg.omr, this.cfg.start);
        this.valgt = null;
        this.valgtT = 0;
        this.kontakt = NK.el("e-kontakt");
        this.signatur = NK.el("e-signatur");
        this.startFane(D.E_MAAL, [{ id: "alle", titel: "", lodret: true }]);
        this.fundet = { kp: this.status[this.idx("kog")].loest, uden: this.status[this.idx("uden")].loest };
        this.donorKant = this.status[this.idx("hvilket")].loest;
        this.kontakt.addEventListener("click", function () { mig.skiftHb(); });
        /* Den foerste opgave, eleven ikke har loest */
        this.nr = this.opgaver.length - 1;
        var start = this.naesteUloeste();
        this.vaelg(start >= 0 ? start : 0);
    }

    var P = SimEthanol.prototype;
    NK.Fane.paa(P, { navn: "e", naesteFane: "fane-s", naesteNavn: "Sammenlign" });

    P.chipTekst = function (o, i) {
        return '<span class="oc-nr">' + (i + 1) + "</span>" + NK.html(o.navn);
    };

    P.gasMest = function () { return this.P.antalGas() > this.P.N / 2; };

    /* ----- Opgaven -------------------------------------------------------------- */
    /* Hver opgave begynder med en frisk proeve, der passer til den: en vaeske
       ved 20 °C, og til Hvad brydes? en vaeske, der varmes op, til den koger */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.opg = { o: o, fase: o.gaet ? "gaet" : (o.svar ? "spm" : "opgave"), gaet: -1, atom: null, lysH: null };
        this.P.hb = true;
        this.valgt = null;
        this.roertTermo = false;
        if (o.id === "brydes") {
            this.P.nulstil(70);
            this.termo.saet(70);
            this.termo.animerTil(84, 5);
        } else {
            this.P.nulstil(this.cfg.start);
            this.termo.saet(this.cfg.start);
        }
        this.visKontakt();
    };

    P.delNu = function () {
        var g = this.opg, o = g.o;
        if (g.fase === "gaet") return { slags: "gaet", intro: o.gaet.intro, tekst: o.gaet.tekst, svar: o.gaet.svar };
        if (g.fase === "spm") return { slags: "spm", tekst: o.tekst, svar: o.svar, multi: o.multi, chip: "Opgave " + (this.nr + 1) };
        var d = { slags: "opgave", tekst: o.tekst, chip: "Opgave " + (this.nr + 1) };
        if (o.id === "uden" && g.gaet >= 0) d.ekstra = '<p class="sk-gaet">Dit gæt: <b>' + NK.html(o.gaet.svar[g.gaet].t) + "</b></p>";
        return d;
    };

    /* Det, kortet ikke selv siger, i kortets nederste raekke */
    P.sceneLinje = function () {
        var g = this.opg, id = g.o.id;
        if (id === "hvilket") return g.atom ? g.o.valgt[g.atom.e] + " Tryk Indsend svar." : "";
        if (id === "uden" && !this.P.hb && this.roertTermo) return "Stil termometeret på kogepunktet, og tryk Indsend svar.";
        if (id === "kog" && this.roertTermo) return "Stil termometeret på kogepunktet, og tryk Indsend svar.";
        return "";
    };

    P.hintTrin = function () { return this.opg.o.hint; };

    /* ----- Indsend svar ------------------------------------------------------------ */
    P.kanIndsende = function () {
        var g = this.opg, id = g.o.id;
        if (id === "kog") return !!this.roertTermo;
        if (id === "uden") return !this.P.hb && !!this.roertTermo;
        if (id === "hvilket") return !!g.atom;
        return false;
    };

    P.indsendTekst = function () {
        var id = this.opg.o.id;
        if (id === "kog" || id === "uden") return this.indsendTemp();
        return "";
    };

    P.indsend = function () {
        var g = this.opg, o = g.o, T = this.Tnu();
        if (o.id === "kog" || o.id === "uden") {
            if (Math.abs(T - this.P.kp()) <= D.TOL) {
                if (o.id === "kog") this.fundet.kp = true; else this.fundet.uden = true;
                this.loest("selv", this.gaetDom() + o.loest, o.id === "kog" ? "Ethanol koger ved 78 °C." : "");
                return;
            }
            this.fejlLinje(D.tempFejl(o.id === "kog" ? "ethanol" : "ethanol uden hydrogenbindinger", T, this.P));
            return;
        }
        if (o.id === "hvilket") {
            var a = g.atom;
            if (a.donor) {
                g.lysH = { m: a.m, h: a.i };
                this.donorKant = true;
                this.loest("selv", o.loest);
                return;
            }
            this.fejlLinje(a.e === "H" ? o.klik.HC : o.klik[a.e]);
            g.atom = null;
            this.visKort();
        }
    };

    P.spmLoest = function () {
        this.loest("selv", this.opg.o.loest);
    };

    P.gaetDom = function () {
        var g = this.opg;
        if (g.gaet < 0) return "";
        return g.o.gaet.svar[g.gaet].ok ? "Dit gæt holdt. " : "Dit gæt holdt ikke. ";
    };

    P.gaetValg = function (j) {
        var g = this.opg;
        g.gaet = j;
        g.fase = "opgave";
        this.visKontakt();
        this.nyDel();
        this.layout();
    };

    P.visSvar = function () {
        var g = this.opg, o = g.o;
        if (o.id === "kog") {
            this.termo.animerTil(80, 50);
            this.fundet.kp = true;
            this.loest("svar", o.loest, "Ethanol koger ved 78 °C.");
        } else if (o.id === "brydes") {
            var mig = this;
            this.valgte = {};
            o.svar.forEach(function (sv, j) { if (sv.ok) mig.valgte[j] = true; });
            this.loest("svar", o.loest, "Hydrogenbindingerne og London-kræfterne.");
        } else if (o.id === "hvilket") {
            var m = this.findMolekyle(false) || this.P.mol[0];
            g.lysH = { m: m, h: this.P.F.donorer[0] };
            g.atom = null;
            this.donorKant = true;
            this.loest("svar", o.loest);
        } else {
            if (g.gaet < 0) g.gaet = 2;
            g.fase = "opgave";
            this.P.hb = false;
            this.visKontakt();
            this.termo.animerTil(-42, 60);
            this.fundet.uden = true;
            this.loest("svar", o.loest);
        }
    };

    /* Et molekyle i vaesken (eller dampen), helst midt i luppen */
    P.findMolekyle = function (gas) {
        var bedst = null, d = 1e9;
        this.P.mol.forEach(function (m) {
            if (m.gas !== gas) return;
            var dd = Math.hypot(m.x, m.y);
            if (dd < d) { d = dd; bedst = m; }
        });
        return bedst;
    };

    /* ----- Kontakten: hydrogenbindingerne til og fra ---------------------------------
       Den er der kun i opgave 4, efter gaettet. I de andre opgaver er
       hydrogenbindingerne slaaet til, saa kogepunktet er ethanols. */
    P.visKontakt = function () {
        var g = this.opg;
        var vis = !!g && g.o.id === "uden" && g.fase !== "gaet";
        this.kontakt.hidden = !vis;
        this.kontakt.classList.toggle("til", this.P.hb);
        this.kontakt.classList.toggle("peg", vis && this.P.hb && !this.faerdig);
        this.kontakt.setAttribute("aria-pressed", this.P.hb ? "true" : "false");
        NK.saetTekst("e-kontakt-tekst", this.P.hb ? "Hydrogenbindinger: til" : "Hydrogenbindinger: fra");
        if (this.lay) this.placerKontakt();
    };

    P.skiftHb = function () {
        if (this.spaer()) return;
        this.P.hb = !this.P.hb;
        this.roertTermo = false;
        this.nulstilHjaelp();
        this.visKontakt();
        if (!this.P.hb) {
            this.besked('<span class="b-maerke">Tankeeksperiment</span> ' +
                NK.html("I virkeligheden kan man ikke slå hydrogenbindingerne fra, men modellen kan. Find nu kogepunktet."), "peger");
        } else {
            this.besked('<span class="b-maerke">Til igen</span> ' + NK.html("Hydrogenbindingerne er slået til igen."), "peger");
        }
        this.visKnap();
    };

    /* ----- Forfra: ny proeve ved 20 °C ----------------------------------------------- */
    P.nulstil = function () { this.vaelg(this.nr); };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.placerKontakt = function () {
        var sig = this.signatur, lay = this.lay;
        this.kontakt.style.left = lay.kant + "px";
        this.kontakt.style.top = Math.round(lay.top + (sig.offsetHeight || 150) + 10) + "px";
        this.kontakt.style.width = Math.round(lay.vB) + "px";
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.baand();
        var lay = { W: W, H: H, baand: baand, top: this.top() };
        var kant = NK.klamp(W * 0.016, 10, 18);
        lay.kant = kant;
        lay.bordY = baand.y - NK.klamp(H * 0.035, 14, 26);
        lay.termo = Tg.termoMaal(W - kant - 50, lay.bordY - 4, lay.bordY - 4 - lay.top - 4, this.cfg.omr);

        /* Venstre kolonne: forklaringen foroven, kontakten under den, kammeret paa bordet */
        var vB = NK.klamp(W * 0.25, 196, 260);
        lay.vB = vB;
        var sig = this.signatur;
        sig.style.left = kant + "px";
        sig.style.top = lay.top + "px";
        sig.style.width = Math.round(vB) + "px";
        this.lay = lay;
        this.placerKontakt();
        /* Kammeret faar pladsen under kontakten, ogsaa naar kontakten er skjult,
           saa intet flytter sig, naar den kommer frem */
        var sigBund = lay.top + (sig.offsetHeight || 150) + 10 + (this.kontakt.offsetHeight || 46) + 8;
        var rum = lay.bordY - sigBund - 12;
        var sk = NK.klamp(Math.min(rum / 420, vB * 0.92 / 240), 0.22, 0.8);
        lay.kammer = Tg.kammerMaal(kant + vB / 2, lay.bordY, 300 * sk);
        var G = lay.kammer.glas();
        lay.glas = G;
        lay.zoomFra = { x: G.ind.x0 + 2, y: G.ind.bund - G.fuld * 0.55, b: G.ind.x1 - G.ind.x0 - 4, h: G.fuld * 0.4 };

        /* Luppen i midten */
        var x0 = kant + vB + 26, x1 = lay.termo.x - 74;
        var top = lay.top + 24, bund = lay.bordY - 10;
        var r = Math.max(60, Math.min((x1 - x0) / 2, (bund - top) / 2));
        lay.lup = { x: (x0 + x1) / 2, y: top + (bund - top) / 2, r: r };

        this.saetAnker("lup", lay.lup.x - r, lay.lup.y - r, 2 * r, 2 * r);
        this.saetAnker("kammer", lay.kammer.x, G.top - 40 * sk, lay.kammer.b, lay.bordY - G.top + 40 * sk);
        this.saetAnker("termometer", lay.termo.venstre - 30, lay.termo.top, lay.termo.b + 74, lay.termo.h);
    };

    P.opdaterScene = function (dt) {
        var P0 = this.P;
        this.termo.opdater(dt);
        P0.opdater(dt, this.termo.T);
        if (this.valgtT > 0) { this.valgtT -= dt; if (this.valgtT <= 0) this.valgt = null; }
        /* Det valgte atom foelger sit molekyle; flyver det op i dampen, er valget vaek */
        var g = this.opg;
        if (g && g.atom && g.atom.m.gas) { g.atom = null; this.visKort(); }
    };

    P.efterOpgave = function () {
        if (this.opg.o.id === "hvilket") this.donorKant = true;
        this.visKontakt();
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, g = this.opg;
        if (!lay) return;
        Tg.rum(ctx, lay.W, lay.baand.y, lay.bordY + 10);
        Tg.bord(ctx, 0, lay.kammer.x + lay.kammer.b + 16, lay.bordY, lay.baand.y);
        var mk = this.P.makro();
        Tg.kammerMedGlas(ctx, lay.kammer, this.termo.T, mk, this.tid, {});
        Tg.zoomTilLup(ctx, lay.zoomFra, lay.lup);
        Tg.lup(ctx, lay.lup, this.P, {
            valgt: this.valgt, donorKant: this.donorKant, tid: this.tid,
            valgtAtom: g && g.atom ? g.atom : null,
            lysH: g && g.lysH && g.o.id === "hvilket" ? g.lysH : null
        });
        NK.tekst(ctx, "ETHANOLMOLEKYLERNE I GLASSET", lay.lup.x, lay.lup.y - lay.lup.r - 12, {
            font: Tg.font("700", 13), justering: "center", farve: "#9aa3ae"
        });
        var maerker = [];
        if (this.fundet.kp) maerker.push({ t: this.st.kp, tekst: "78 °C", farve: "#ffb74d" });
        if (this.fundet.uden) maerker.push({ t: D.STOF[this.st.uden].kp, tekst: "−42 °C", farve: "#b0bec5", stiplet: true });
        var brugTermo = g && !this.faerdig && !this.venter && g.fase === "opgave" &&
            (g.o.id === "kog" || (g.o.id === "uden" && !this.P.hb));
        Tg.termometer(ctx, lay.termo, this.termo.T, {
            trin: 10, store: 20, maerker: maerker, stue: true, tid: this.tid,
            haandtag: this.haandtagLys, traekker: this.termo.traekker,
            puls: brugTermo && !this.roertTermo
        });
        this.tegnSejr(ctx, lay.W, lay.baand.y);
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    /* Atomet under musen i luppen: { m, i } */
    P.atomVed = function (pt) {
        var L = this.lay && this.lay.lup;
        if (!L || Math.hypot(pt.x - L.x, pt.y - L.y) > L.r) return null;
        var P0 = this.P, s = L.r / P0.Rm, A = P0.F.atomer;
        var mx = (pt.x - L.x) / s, my = (pt.y - L.y) / s;
        var bedst = null, bd = 1e9;
        P0.mol.forEach(function (m) {
            if (!m.wx) return;
            for (var i = 0; i < A.length; i++) {
                var d = Math.hypot(m.wx[i] - mx, m.wy[i] - my);
                /* H er smaa: de faar lidt ekstra plads, saa de kan rammes */
                var r = A[i].r + (A[i].e === "H" ? 0.18 : 0.05);
                if (d < r && d / r < bd) { bd = d / r; bedst = { m: m, i: i }; }
            }
        });
        return bedst;
    };

    P.overScene = function (pt) {
        var t = this.termoOver(pt);
        if (t) return t;
        return pt && this.atomVed(pt) ? "pointer" : null;
    };

    P.nedScene = function (pt) { return this.termoNed(pt); };
    P.flytScene = function (pt) { this.termo.flyt(pt, this.lay.termo); };
    P.opScene = function () { this.termo.slip(); };

    P.klikScene = function (pt) {
        if (this.termoKugle(pt)) return;
        if (this.paaTermo(pt)) return;
        var hit = this.atomVed(pt);
        if (!hit) return;
        var a = this.P.F.atomer[hit.i], m = hit.m, g = this.opg;
        if (g.o.id === "hvilket" && !this.faerdig) {
            /* Et klik vaelger atomet. Det bliver foerst bedoemt, naar eleven sender det ind. */
            if (m.gas) { this.kortBesked("Det molekyle er i dampen. Klik på et H-atom i væsken.", 4); return; }
            g.atom = { m: m, i: hit.i, e: a.e, donor: !!a.donor };
            this.nulstilHjaelp();
            this.naesteLinje("", "");
            this.visKort();
            return;
        }
        this.valgt = m;
        this.valgtT = 6;
        var P0 = this.P;
        if (m.gas) {
            this.kortBesked("Et ethanolmolekyle i dampen. Det er helt: 2 C, 6 H og 1 O. Det har ingen bindinger til andre molekyler.", 6);
            return;
        }
        var nh = P0.hbListe.filter(function (b) { return b.a === m || b.b === m; }).length;
        var nl = P0.lonListe.filter(function (b) { return b.a === m || b.b === m; }).length;
        this.kortBesked("Et ethanolmolekyle i væsken. Lige nu har det " + nh + " hydrogenbinding" + (nh === 1 ? "" : "er") +
            " og " + nl + " London-kraft" + (nl === 1 ? "" : "er") + " til naboerne. δ+ og δ− står ved OH-gruppen.", 6);
    };

    NK.SimEthanol = SimEthanol;
}());
