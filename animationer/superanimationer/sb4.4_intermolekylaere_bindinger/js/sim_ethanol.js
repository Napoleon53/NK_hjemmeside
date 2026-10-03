/* =====================================================================
   sim_ethanol.js - fane 1: ethanol

   Den gamle b4.1, gjort faerdig: luppen med ethanolmolekylerne, de
   roede hydrogenbindinger og de graa London-kraefter, temperaturen man
   skruer paa, og kontakten, der slaar hydrogenbindingerne fra.

   Til venstre staar temperaturkammeret med et reagensglas med ethanol
   og en ballon paa (som sc6.1). Termometeret til hoejre er knappen.
   Fire maal: kog ethanol, hvad brydes, find det H, der kan danne
   hydrogenbindinger, og et tankeeksperiment uden hydrogenbindinger,
   hvor eleven gaetter foerst. Proeven fortsaetter fra maal til maal.
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
        this.fundet = { kp: false, uden: false };
        this.valgt = null;
        this.valgtT = 0;
        this.kontakt = NK.el("e-kontakt");
        this.signatur = NK.el("e-signatur");
        this.startFane(D.E_MAAL, [{ id: "alle", titel: "", lodret: true }]);
        this.donorKant = this.status[this.idx("hvilket")].loest;
        this.kontakt.addEventListener("click", function () { mig.skiftHb(); });
        /* Den foerste opgave, eleven ikke har loest */
        this.nr = this.opgaver.length - 1;
        var start = this.naesteUloeste();
        this.vaelg(start >= 0 ? start : 0);
    }

    var P = SimEthanol.prototype;
    NK.Fane.paa(P, { navn: "e", naesteFane: "fane-s", naesteNavn: "Sammenlign" });

    P.idx = function (id) {
        for (var i = 0; i < this.opgaver.length; i++) if (this.opgaver[i].id === id) return i;
        return -1;
    };

    P.chipTekst = function (o, i) {
        return '<span class="oc-nr">' + (i + 1) + "</span>" + NK.html(o.navn);
    };

    P.gasMest = function () { return this.P.antalGas() > this.P.N / 2; };

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.opg = { o: o, fase: o.id === "uden" ? "gaet" : "", forkert: {}, gaet: -1, lysH: null };
        this.udenSaa = { over: false, under: false };
        this.visKontakt();
    };

    P.promptHTML = function () {
        var g = this.opg, o = g.o;
        var html = '<p class="maal-tekst">' + NK.html(g.fase === "find" ? o.prompt2 : o.prompt) + "</p>";
        if (o.svar && (o.id !== "uden" || g.fase === "gaet" || g.gaet >= 0)) {
            html += '<div class="knapper valgrad">';
            o.svar.forEach(function (sv, j) {
                var kl = "knap";
                var laast = false;
                if (o.id === "uden") {
                    if (g.gaet >= 0) { laast = true; if (j === g.gaet) kl += " valgt"; }
                } else {
                    if (g.forkert[j]) { kl += " forkert"; laast = true; }
                    if (g.rigtig === j) kl += " rigtig";
                    if (g.rigtig !== undefined) laast = true;
                }
                html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                    '<span class="v-bogstav">' + "ABC".charAt(j) + "</span>" + NK.html(sv.t) + "</button>";
            });
            html += "</div>";

        }
        return html;
    };

    P.trinLinje = function () {
        var g = this.opg, id = g.o.id, T = Math.round(this.termo.T);
        if (id === "kog") {
            if (!this.roertTermo) return "Træk i det runde håndtag på termometeret til højre.";
            if (!this.P.hb) return "Hydrogenbindingerne er slået fra. Slå dem til igen med kontakten over luppen.";
            if (this.P.koger()) return "Ethanol koger. Se, hvad der sker i luppen.";
            return "Varm videre. Ethanol er stadig en væske ved " + D.grader(T) + " °C.";
        }
        if (id === "brydes") {
            if (this.gasMest()) return "Vælg et svar i opgavekortet.";
            if (this.P.koger() && this.P.hb) return "Ethanol koger. Se i luppen, og vælg så et svar i opgavekortet.";
            return "Varm op, til ethanol koger, og se i luppen. Vælg så et svar i opgavekortet.";
        }
        if (id === "hvilket") {
            return this.gasMest() ? "Klik på et H-atom. Det er nemmest at se i væsken under 78 °C." : "Klik på et H-atom i luppen.";
        }
        if (g.fase === "gaet") return "Gæt først i opgavekortet.";
        if (this.P.hb) return "Slå hydrogenbindingerne fra med kontakten over luppen.";
        return this.gasMest() ? "Køl ned, til ethanol bliver en væske igen." : "Varm op, til ethanol koger.";
    };

    P.hintTrin = function () {
        var g = this.opg;
        if (g.o.id === "uden" && g.fase === "gaet") return ["Det er et gæt. Vælg det, du tror, og prøv det bagefter."];
        return g.o.hint;
    };

    P.visSvar = function () {
        var g = this.opg, o = g.o;
        if (o.id === "kog") {
            this.P.hb = true;
            this.visKontakt();
            this.termo.animerTil(90, 50);
            this.fundet.kp = true;
            this.loest("svar", o.loest);
        } else if (o.id === "brydes") {
            g.rigtig = 1;
            this.loest("svar", o.loest);
        } else if (o.id === "hvilket") {
            var m = this.findMolekyle(false) || this.P.mol[0];
            g.lysH = { m: m, h: this.P.F.donorer[0] };
            this.donorKant = true;
            this.loest("svar", o.loest);
        } else {
            if (g.gaet < 0) g.gaet = 2;
            g.fase = "find";
            this.P.hb = false;
            this.visKontakt();
            this.termo.animerTil(-60, 60);
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

    /* ----- Svarknapperne ----------------------------------------------------------- */
    P.svarValg = function (j) {
        var g = this.opg, o = g.o;
        if (this.faerdig || !o.svar) return;
        if (o.id === "uden") {
            if (g.fase !== "gaet") return;
            g.gaet = j;
            g.fase = "find";
            this.visKontakt();
            this.visKort();
            var godt = o.svar[j].ok;
            if (godt) this.besked('<span class="b-maerke">Godt gættet</span> ' + NK.html("Slå nu hydrogenbindingerne fra med kontakten over luppen, og find det nye kogepunkt."), "god");
            else this.besked('<span class="b-maerke">Dit gæt</span> ' + NK.html("Det finder du ud af nu. Slå hydrogenbindingerne fra med kontakten over luppen."), "peger");
            return;
        }
        if (o.svar[j].ok) {
            g.rigtig = j;
            this.loest("selv", o.loest + " " + NK.tilfaeldig(D.ROS));
            return;
        }
        g.forkert[j] = true;
        this.visKort();
        this.fejlLinje(o.svar[j].f);
    };

    /* ----- Kontakten: hydrogenbindingerne til og fra --------------------------------- */
    P.visKontakt = function () {
        var g = this.opg;
        var vis = this.status[this.idx("uden")].loest || (g && g.o.id === "uden" && g.fase === "find") || !this.P.hb;
        this.kontakt.hidden = !vis;
        this.kontakt.classList.toggle("til", this.P.hb);
        this.kontakt.setAttribute("aria-pressed", this.P.hb ? "true" : "false");
        NK.saetTekst("e-kontakt-tekst", this.P.hb ? "Hydrogenbindinger: til" : "Hydrogenbindinger: fra");
    };

    P.skiftHb = function () {
        this.P.hb = !this.P.hb;
        this.nulstilHjaelp();
        this.visKontakt();
        if (!this.P.hb) {
            this.udenSaa = { over: false, under: false };
            this.besked('<span class="b-maerke">Tankeeksperiment</span> ' +
                NK.html("Hydrogenbindingerne er slået fra. I virkeligheden kan man ikke det, men modellen kan. ") +
                NK.html(this.trinLinje()), "peger");
        } else {
            this.besked('<span class="b-maerke">Til igen</span> ' + NK.html("Hydrogenbindingerne er slået til igen. " +
                (this.faerdig ? "" : this.trinLinje())), "peger");
        }
        this.sidsteTrin = this.trinLinje();
    };

    /* ----- Forfra: ny proeve ved 20 °C med hydrogenbindingerne slaaet til ----------- */
    P.nulstil = function () {
        this.P.hb = true;
        this.P.nulstil(this.cfg.start);
        this.termo.saet(this.cfg.start);
        this.valgt = null;
        this.vaelg(this.nr);
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.baand();
        var lay = { W: W, H: H, baand: baand };
        var kant = NK.klamp(W * 0.016, 10, 18);
        lay.bordY = baand.y - NK.klamp(H * 0.035, 14, 26);
        lay.termo = Tg.termoMaal(W - kant - 50, lay.bordY - 4, lay.bordY - 4 - 16, this.cfg.omr);

        /* Venstre kolonne: signaturen foroven, kammeret paa bordet */
        var vB = NK.klamp(W * 0.24, 178, 250);
        var sig = this.signatur;
        sig.style.left = kant + "px";
        sig.style.top = "12px";
        sig.style.width = Math.round(vB) + "px";
        var sigBund = 12 + (sig.offsetHeight || 120) + (this.kontakt.hidden ? 0 : (this.kontakt.offsetHeight || 44) + 8);
        this.kontakt.style.left = kant + "px";
        this.kontakt.style.top = Math.round(12 + (sig.offsetHeight || 120) + 8) + "px";
        this.kontakt.style.width = Math.round(vB) + "px";
        var rum = lay.bordY - sigBund - 12;
        var sk = NK.klamp(Math.min(rum / 420, vB * 0.92 / 240), 0.22, 0.8);
        lay.kammer = Tg.kammerMaal(kant + vB / 2, lay.bordY, 300 * sk);
        var G = lay.kammer.glas();
        lay.glas = G;
        lay.zoomFra = { x: G.ind.x0 + 2, y: G.ind.bund - G.fuld * 0.55, b: G.ind.x1 - G.ind.x0 - 4, h: G.fuld * 0.4 };

        /* Luppen i midten */
        var x0 = kant + vB + 26, x1 = lay.termo.x - 74;
        var top = 36, bund = lay.bordY - 10;
        var r = Math.max(60, Math.min((x1 - x0) / 2, (bund - top) / 2));
        lay.lup = { x: (x0 + x1) / 2, y: top + (bund - top) / 2, r: r };
        this.lay = lay;

        this.saetAnker("lup", lay.lup.x - r, lay.lup.y - r, 2 * r, 2 * r);
        this.saetAnker("kammer", lay.kammer.x, G.top - 40 * sk, lay.kammer.b, lay.bordY - G.top + 40 * sk);
        this.saetAnker("termometer", lay.termo.venstre - 30, lay.termo.top, lay.termo.b + 74, lay.termo.h);
    };

    P.opdaterScene = function (dt) {
        var P0 = this.P, g = this.opg;
        this.termo.opdater(dt);
        P0.opdater(dt, this.termo.T);
        if (this.valgtT > 0) { this.valgtT -= dt; if (this.valgtT <= 0) this.valgt = null; }

        var gasMest = this.gasMest(), kp = P0.kp();
        if (P0.hb && P0.T >= kp && gasMest) this.fundet.kp = true;
        if (!P0.hb) {
            if (P0.T >= kp && gasMest) this.udenSaa.over = true;
            if (P0.T < kp && !gasMest) this.udenSaa.under = true;
            if (this.udenSaa.over && this.udenSaa.under) this.fundet.uden = true;
        }

        if (g && !this.faerdig) {
            if (g.o.id === "kog" && this.fundet.kp && P0.hb && gasMest) {
                this.loest("selv", g.o.loest);
            } else if (g.o.id === "uden" && g.fase === "find" && !P0.hb && this.udenSaa.over && this.udenSaa.under) {
                this.loest("selv", g.o.loest);
            }
        }

        /* Linjen foelger med, naar noget skifter (men et hint eller en fejl bliver staaende) */
        if (!this.faerdig && !this.kortT && (this.fast.klasse === "" || this.fast.klasse === "peger")) {
            var t = this.trinLinje();
            if (t !== this.sidsteTrin) { this.sidsteTrin = t; if (this.fast.klasse === "") this.naesteLinje("", ""); }
        }

        NK.saetTekst("e-ant-hb", String(P0.hbListe.length));
        NK.saetTekst("e-ant-lon", String(P0.lonListe.length));
    };

    P.naesteLinjeGammel = P.naesteLinje;
    P.naesteLinje = function (foer, slags) {
        this.sidsteTrin = this.faerdig ? "" : this.trinLinje();
        this.naesteLinjeGammel(foer, slags);
    };

    P.efterOpgave = function () {
        if (this.opg.o.id === "hvilket") this.donorKant = true;
        this.visKontakt();
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        Tg.rum(ctx, lay.W, lay.baand.y, lay.bordY + 10);
        Tg.bord(ctx, 0, lay.kammer.x + lay.kammer.b + 16, lay.bordY, lay.baand.y);
        var mk = this.P.makro();
        Tg.kammerMedGlas(ctx, lay.kammer, this.termo.T, mk, this.tid, {});
        Tg.zoomTilLup(ctx, lay.zoomFra, lay.lup);
        Tg.lup(ctx, lay.lup, this.P, {
            valgt: this.valgt, donorKant: this.donorKant, tid: this.tid,
            lysH: this.opg && this.opg.lysH && this.opg.o.id === "hvilket" ? this.opg.lysH : null
        });
        NK.tekst(ctx, "MOLEKYLERNE I GLASSET", lay.lup.x, lay.lup.y - lay.lup.r - 14, {
            font: Tg.font("700", 13), justering: "center", farve: "#9aa3ae"
        });
        var maerker = [];
        if (this.fundet.kp) maerker.push({ t: this.st.kp, tekst: "78 °C", farve: "#ffb74d" });
        if (this.fundet.uden) maerker.push({ t: D.STOF[this.st.uden].kp, tekst: "−42 °C", farve: "#b0bec5", stiplet: true });
        var g = this.opg;
        Tg.termometer(ctx, lay.termo, this.termo.T, {
            trin: 10, store: 20, maerker: maerker, stue: true, tid: this.tid,
            haandtag: this.haandtagLys, traekker: this.termo.traekker,
            puls: !this.roertTermo && g && g.o.id === "kog"
        });
        if (this.faerdig && this.sejrT < 0.9) {
            ctx.save();
            ctx.globalAlpha = 0.14 * (1 - this.sejrT / 0.9);
            ctx.fillStyle = "#3fae72";
            ctx.fillRect(0, 0, lay.W, lay.baand.y);
            ctx.restore();
        }
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
        var hit = this.atomVed(pt);
        if (!hit) return;
        var a = this.P.F.atomer[hit.i], m = hit.m, g = this.opg;
        if (g.o.id === "hvilket" && !this.faerdig) {
            this.valgt = m;
            this.valgtT = 5;
            if (a.donor) {
                g.lysH = { m: m, h: hit.i };
                this.loest("selv", g.o.loest + " " + NK.tilfaeldig(D.ROS));
            } else if (a.e === "H") {
                this.fejlLinje(g.o.klik.HC);
            } else {
                this.kortBesked(g.o.klik[a.e], 6);
            }
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
