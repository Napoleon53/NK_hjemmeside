/* =====================================================================
   sim_logp.js - fane 1: Log P

   Fire trin (D.LOGP):
     1 ryst   eleven klikker paa skilletragten; den rystes, lagene blandes
              og skilles igen, og paracetamol fordeler sig med 15 molekyler
              i octanol og 5 i vand (luppen viser lige store rumfang)
     2 tal    eleven taeller og skriver Kꜰ = 3,0
     3 tal    eleven skriver log P = 0,48
     4 x      stof X er glucose eller ibuprofen (begge formler staar fra
              start); X rystes (alle 20 gaar i octanol), og eleven vaelger
   Strukturformlerne staar til hoejre paa tavlen (js/struktur.js) over
   kassen, hvor regnestykket bygges op og bliver staaende. Bagefter kan
   eleven ryste de tre stoffer fra panelet, og ekstraopgaverne uden hints
   startes fra panelet (js/ekstra.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fane;
    var T = NK.Tegning;
    var S = NK.Scene;
    var ST = NK.Struktur;
    var NOEGLE = "nk-sb8.4-logp";
    var RYST = 1.3, SKIL = 0.9;
    var FONT = T.FONT;
    var NAVN = { para: "Paracetamol", glu: "Glucose", ibu: "Ibuprofen" };

    function SimLogP() {
        var mig = this;
        this.cfg = { navn: "p", faerdig: D.LOGP_FAERDIG, videreTekst: "Videre til Log D og pH →" };
        this.hovedListe = D.LOGP;
        this.trinListe = D.LOGP;
        this.resultater = [];
        this.hentStatus();
        this.startFane();
        this.lup = new S.Lup();
        this.ekstraInit(D.LOGP_EKSTRA);
        this.draaber = [];
        for (var i = 0; i < 26; i++) this.draaber.push({ u: NK.r(-1, 1), v: Math.random(), r: NK.r(4, 9), oct: i % 2 === 0 });
        NK.el("p-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("input", function (e) {
            if (e.target && e.target.id === "p-felt") { mig.talTekst = e.target.value; e.target.classList.remove("ryst"); mig.visIndsend(); }
        });
        this.el.skort.addEventListener("keydown", function (e) {
            if (e.target && e.target.id === "p-felt" && e.key === "Enter") { e.preventDefault(); mig.indsendKlik(); }
        });
        NK.el("p-stoffer").addEventListener("click", function (e) {
            var k = e.target.closest && e.target.closest("[data-stof]");
            if (k) mig.proevStof(k.getAttribute("data-stof"));
        });
    }

    var P = SimLogP.prototype;
    F.paa(P, "p");
    NK.Ekstra.paa(P);

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        this.hovedListe.forEach(function (t, j) {
            var nr = mig.iEkstra ? (mig.gemtTrin ? mig.gemtTrin.nr : 0) : mig.trinNr;
            var faerdig = mig.faerdig || j < nr || (!mig.iEkstra && j === mig.trinNr && !!mig.groen);
            var kl = faerdig ? "faerdig" : (!mig.iEkstra && j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + D.sub(NK.html(t.navn)) + "</span></li>";
        });
        NK.saetHTML("p-trin", html);
        NK.saetTekst("p-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
        NK.el("p-proev").hidden = !this.faerdig || this.iEkstra;
        var knapper = NK.el("p-stoffer").querySelectorAll("[data-stof]");
        for (var i = 0; i < knapper.length; i++) knapper[i].classList.toggle("valgt", !!this.fritStof && knapper[i].getAttribute("data-stof") === this.stofId);
        this.visEkstraPanel();
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.sejrT = null;
        this.resultater = [];
        this.fritStof = false;
        this.iEkstra = false;
        this.trinListe = this.hovedListe;
        this.saetStof("para");
        this.startTrin(0);
    };

    P.saetStof = function (id, rystet) {
        this.stofId = id;
        this.stof = D.STOFFER[id];
        this.rystet = !!rystet;
        this.rystT = null;
        this.lup.blandet = 0;
        this.lup.ryster = false;
        this.lup.nulstil(rystet ? D.fordeling(this.stof, 7) : null);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.fase = this.trin.slags;
        this.groen = null;
        this.talTekst = "";
        this.valgt = null;
        this.forkerte = [];
        var t = this.trin;
        if (t.stof && t.stof !== this.stofId) this.saetStof(t.stof, false);
        /* Ekstraopgaverne om ibuprofen og glucose: stoffet er allerede rystet */
        if (this.iEkstra && !t.stof && D.STOFFER[t.id]) this.saetStof(t.id, true);
        this.fritStof = false;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    /* Skal skilletragten rystes, foer opgaven kan besvares? */
    P.venterPaaRyst = function () {
        return !this.rystet && (this.fase === "ryst" || this.fase === "x" || (this.fase === "tal" && this.trin.ryst));
    };

    P.kortData = function () {
        var t = this.trin, chip = this.chip(), mig = this;
        if (this.fase === "ryst") return { slags: "opgave", chip: chip, tekst: t.tekst };
        if (this.fase === "tal") {
            var v = NK.html(this.talTekst || "");
            return { slags: "spm", chip: chip, tekst: t.tekst,
                     ekstra: '<div class="sk-felt"><label for="p-felt">' + t.felt + '</label><input id="p-felt" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + v + '" placeholder="tallet med komma"></div>' };
        }
        if (this.fase === "x") {
            if (!this.rystet) return { slags: "opgave", chip: chip, tekst: t.rystTekst };
            return { slags: "spm", chip: chip, tekst: t.tekst, svar: t.svar.map(function (s, i) { return { t: s, valgt: mig.valgt === i, forkert: mig.forkerte.indexOf(i) >= 0 }; }) };
        }
        return { slags: "opgave", chip: chip, tekst: "" };
    };

    P.skjulIndsend = function () { return this.fase === "ryst" || (this.fase === "x" && !this.rystet); };

    P.svarValg = function (j) {
        if (this.fase !== "x" || !this.rystet) return;
        this.valgt = j;
        this.besked("", "");
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.fase === "tal") return !this.venterPaaRyst() && !!(this.talTekst && this.talTekst.trim());
        if (this.fase === "x") return this.rystet && this.valgt !== null;
        return false;
    };
    P.indsendTekst = function () { return "Indsend svar"; };
    P.ingentingTekst = function () {
        if (this.venterPaaRyst()) return "Klik på skilletragten for at ryste den først.";
        return this.fase === "x" ? "Vælg et af de to stoffer først." : "Skriv et tal først.";
    };

    P.notérFejl = function () { if (!this.iEkstra) this.fejl = true; };

    P.indsend = function () {
        var t = this.trin;
        if (this.fase === "tal") {
            var x = D.laesTal(this.talTekst);
            if (isNaN(x)) { this.kortBlink(); this.kortBesked("Skriv et tal, fx 2,5.", 3.5); return; }
            if (Math.abs(x - t.maal) <= t.tol) { this.rigtigt(false); return; }
            var tekst = t.fejlAndet;
            (t.fejl || []).forEach(function (f) { if (Math.abs(x - f.lig) <= f.tol && tekst === t.fejlAndet) tekst = f.t; });
            this.notérFejl();
            this.fejlLinje(tekst);
            var f = NK.el("p-felt");
            if (f) { f.classList.remove("ryst"); void f.offsetWidth; f.classList.add("ryst"); }
            return;
        }
        if (this.fase === "x") {
            if (this.valgt === t.rigtig) { this.rigtigt(false); return; }
            this.notérFejl();
            this.forkerte.push(this.valgt);
            var fj = t.fejl[this.valgt];
            this.valgt = null;
            this.visKort();
            this.fejlLinje(fj);
        }
    };

    var RESULTAT = {
        kf: { t: "Paracetamol: K_F = 15 / 5 = 3,0" },
        logp: { t: "log P = log(3,0) = 0,48", fed: true },
        x: { t: "Stof X er ibuprofen: log P = 4,0" },
        z: { t: "Stof Z: log P = log(9,0) = 0,95" },
        ibu: { t: "Ibuprofen: K_F = 10 000" },
        glu: { t: "Glucose: K_F = 0,001" }
    };

    P.rigtigt = function (vist) {
        var t = this.trin, sidste = this.trinNr === this.trinListe.length - 1, tekst = t.forkl, foerste = false;
        var r = RESULTAT[t.id];
        if (r && !this.resultater.some(function (x) { return x.t === r.t; })) this.resultater.push(r);
        var knap = "Næste trin →";
        if (this.iEkstra) {
            this.ekstraRigtigt(t);
            knap = sidste ? this.cfg.videreTekst : "Næste ekstraopgave →";
        } else if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            tekst += " " + D.LOGP_FAERDIG;
            knap = this.cfg.videreTekst;
        }
        this.groen = { spm: true, svarNr: t.rigtig, maade: vist || this.sv ? "svar" : "selv", tekst: tekst, knap: knap };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-p").querySelector(".scene"), 60);
    };

    /* Omrystningen er slut: trin 1 bliver staaende med en knap videre, og
       stof X faar sit spoergsmaal */
    P.rystFaerdig = function () {
        this.rystet = true;
        if (this.fritStof) { this.notérFrit(); return; }
        if (this.fase === "ryst" && !this.groen) {
            this.groen = { spm: true, maade: this.sv ? "svar" : "selv", maerke: "Rystet", tekst: this.trin.forkl, knap: "Næste trin →" };
            this.sejrT = 0;
            this.besked("", "");
            this.visKort();
            this.visListe();
            return;
        }
        if (!this.groen) { this.nulstilHjaelp(); this.visKort(); }
    };

    /* Frit forsoeg: log P for stoffet staar i kassen */
    P.notérFrit = function () {
        var s = this.stof, linje = s.navn.charAt(0).toUpperCase() + s.navn.slice(1) + ": log P = " + D.komma1(s.logP);
        if (s.id === "para") linje = "Paracetamol: log P = 0,48";
        if (!this.resultater.some(function (r) { return r.t === linje; })) this.resultater.push({ t: linje });
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        if (NK.visFane) NK.visFane("fane-d");
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen) this.vaelg(0); };

    /* Ekstraopgaverne har ingen hints, kun Vis svaret */
    P.hintNu = function () {
        if (this.groen || this.iEkstra) return [];
        return this.trin.hint || [];
    };

    P.visSvar = function () {
        if (!this.iEkstra) this.sv = true;
        var t = this.trin;
        if (this.venterPaaRyst()) { if (this.rystT === null) this.rystTragt(); return; }
        if (this.fase === "tal") { this.talTekst = t.maal >= 100 ? String(Math.round(t.maal)) : D.komma2(t.maal); this.rigtigt(true); return; }
        if (this.fase === "x") { this.valgt = t.rigtig; this.rigtigt(true); }
    };

    P.proevStof = function (id) {
        if (!this.faerdig || !D.STOFFER[id]) return;
        this.saetStof(id, false);
        this.fritStof = true;
        this.visListe();
        this.layout();
    };

    /* ----- Omrystningen ------------------------------------------------------------------ */
    P.rystTragt = function () {
        this.rystT = 0;
        this.lup.ryster = true;
        this.draaber.forEach(function (d) { d.u = NK.r(-1, 1); d.v = Math.random(); });
    };

    P.opdaterScene = function (dt) {
        this.lup.opdater(dt);
        if (this.rystT === null) return;
        this.rystT += dt;
        var t = this.rystT;
        this.lup.blandet = t < RYST ? Math.min(1, t / 0.3) : Math.max(0, 1 - (t - RYST) / SKIL);
        if (t >= RYST && this.lup.ryster) {
            this.lup.ryster = false;
            this.lup.saetFordeling(D.fordeling(this.stof, 7), false);
        }
        this.draaber.forEach(function (d) { d.v = (d.v + dt * (t < RYST ? 0.6 : 0)) % 1; });
        if (t >= RYST + SKIL) {
            this.rystT = null;
            this.lup.blandet = 0;
            this.rystFaerdig();
        }
    };

    P.vinkel = function () {
        if (this.rystT === null || this.rystT >= RYST) return 0;
        var t = this.rystT, env = Math.min(1, t / 0.15) * Math.min(1, (RYST - t) / 0.2);
        return 0.12 * env * Math.sin(t * 17);
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (!pt) { this.overTragt = false; return null; }
        this.overTragt = S.iTragt(this.tragt, pt);
        return this.overTragt && this.kanRyste() ? "pointer" : null;
    };

    P.kanRyste = function () { return this.rystT === null && (this.fritStof || !this.groen); };

    P.klikScene = function (pt) {
        if (S.iTragt(this.tragt, pt)) {
            if (!this.kanRyste()) { if (this.groen) this.kortBlink(); return; }
            this.rystTragt();
            return;
        }
        if (this.groen && !this.fritStof) { this.kortBlink(); return; }
        if (this.venterPaaRyst() && this.rystT === null) {
            this.kortBlink();
            this.kortBesked("Klik på skilletragten til venstre.", 3);
        }
    };

    /* ----- Strukturformlerne til hoejre ----------------------------------------------
       Trin 1-3: paracetamol. Trin 4: glucose og ibuprofen (begge fra start).
       Ekstraopgaverne og det frie forsoeg: stoffet, der er i tragten. */
    P.formler = function () {
        var t = this.trin, mig = this;
        if (!t) return [];
        function kort(id, under, ramme) { return { id: id, navn: NAVN[id], under: under, ramme: ramme }; }
        if (this.fritStof || this.iEkstra) return NAVN[this.stofId] ? [kort(this.stofId, "log P = " + (this.stofId === "para" ? "0,48" : D.komma1(this.stof.logP)))] : [];
        if (this.fase === "x") {
            var svaret = !!this.groen;
            return [kort("glu", svaret ? "log P = −3,0" : "fem OH-grupper", svaret ? null : "gul"),
                    kort("ibu", svaret ? "log P = 4,0" : "en benzenring og to carbonkæder", svaret ? "groen" : "gul")];
        }
        var harLogP = this.resultater.some(function (r) { return r.fed; }) && t.id !== "x";
        void mig;
        return [kort("para", harLogP ? "log P = 0,48" : "OH-gruppe, benzenring og amidgruppe")];
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        var tb = Math.round(NK.klamp(t.b * 0.23, 140, 240));
        this.tragt = S.tragtKasse(t.x + 14, t.y + 14, tb, t.h - 24);
        var kasseB = NK.klamp(t.b * 0.26, 200, 290);
        var plads = t.b - (this.tragt.x - t.x) - this.tragt.b - kasseB - 70;
        var R = Math.round(NK.klamp(Math.min((t.h - 86) / 2, t.b * 0.19, plads / 2), 92, 185));
        var lx = this.tragt.x + this.tragt.b + Math.max(36, (plads - 2 * R) * 0.45) + R;
        this.lup.geometri(lx, t.y + t.h / 2 + 4, R);
        var kx = lx + R + Math.max(30, (t.x + t.b - 14 - kasseB - lx - R) * 0.5);
        var kb = Math.min(kasseB, t.x + t.b - 12 - kx);
        /* Formlerne oeverst i kolonnen, kassen med regnestykket under */
        var formler = this.formler(), y = t.y + 14, top = t.y + 14, bund = t.y + t.h - 12;
        var to = formler.length === 2, hF = to ? NK.klamp((bund - top - 12) / 2, 104, 160) : NK.klamp(t.h * 0.3, 112, 160);
        this.formKort = formler.map(function (f, i) { return { f: f, k: { x: kx, y: top + i * (hF + 12), b: kb, h: hF } }; });
        if (formler.length) y = top + formler.length * (hF + 12);
        this.kasse = to ? null : { x: kx, y: y, b: kb, h: Math.max(60, bund - y) };
        this.saetAnker("tragt", this.tragt.x, this.tragt.y, this.tragt.b, this.tragt.h);
        this.saetAnker("lup", lx - R - 6, this.lup.cy - R - 30, 2 * R + 12, 2 * R + 60);
        this.saetAnker("formler", kx, top, kb, formler.length ? formler.length * (hF + 12) - 12 : 1);
        if (this.kasse) this.saetAnker("kasse", this.kasse.x, this.kasse.y, this.kasse.b, Math.min(this.kasse.h, 150 + this.resultater.length * 26));
        else this.saetAnker("kasse", 0, 0, 1, 1);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;
        T.tavle(ctx, lay);
        var p = S.lupPunkt(this.tragt);
        S.lupLinjer(ctx, p, this.lup);
        S.tragt(ctx, this.tragt, { vinkel: this.vinkel(), blandet: this.lup.blandet, draaber: this.draaber });
        this.lup.tegn(ctx, { orange: true });
        /* Kortenes indhold foelger trinnet; antallet bestemmer layoutet */
        var fl = this.formler();
        if (fl.length !== (this.formKort || []).length) this.layout();
        (this.formKort || []).forEach(function (fk, i) {
            fk.f = fl[i] || fk.f;
            var r = fk.f.ramme, opt = { under: fk.f.under, maksL: 24 };
            if (r === "gul") { opt.kant = "#d69e0c"; opt.kantBredde = 2.5; opt.fyld = "#fffbea"; }
            if (r === "groen") { opt.kant = "#2b7d51"; opt.kantBredde = 2.5; opt.fyld = "#eef8f1"; }
            ST.kort(ctx, fk.k, fk.f.navn, fk.f.id, opt);
        });
        this.tegnKasse(ctx);
        if (this.kanRyste() && this.venterPaaRyst() || (this.fritStof && !this.rystet && this.rystT === null)) {
            var tk = this.tragt;
            T.skilt(ctx, tk.x + tk.b * 0.62, tk.y + tk.h * 0.1, "Klik for at ryste", { min: t.x + 6, maks: t.x + t.b - 6 });
        }
        if (!this.rystet && this.rystT === null) this.tegnFoerRyst(ctx);
        this.tegnSejr(ctx, t);
    };

    /* Foer omrystningen: stoffets navn i vandlaget i luppen */
    P.tegnFoerRyst = function (ctx) {
        var l = this.lup, navn = this.fase === "x" && !this.fritStof && !this.iEkstra ? "stof X" : this.stof.navn;
        NK.tekst(ctx, navn + " er opløst i vandet", l.cx, l.cy - l.R * 0.45, { font: "700 13px " + FONT, farve: D.FARVE.octanolTekst, justering: "center", linje: "middle" });
    };

    /* Kassen med formlen og det, eleven har regnet (de nyeste linjer, der er plads til) */
    P.tegnKasse = function (ctx) {
        var k = this.kasse;
        if (!k || k.b < 150) return;
        var plads = Math.max(0, Math.floor((k.h - 150) / 26)), vis = this.resultater.slice(Math.max(0, this.resultater.length - plads));
        var h = Math.min(k.h, 150 + vis.length * 26);
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#f3f7fa";
        NK.rundtRekt(ctx, k.x, k.y, k.b, h, 14);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#cdd8e1";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        var cx = k.x + k.b / 2, y = k.y + 26;
        NK.tekst(ctx, "Fordelingskonstanten", cx, y, { font: "800 15px " + FONT, farve: D.FARVE.prik, justering: "center", linje: "middle" });
        /* K_F = [stof i octanol] / [stof i vand] */
        var fs = k.b < 220 ? 12.5 : 14;
        ctx.save();
        ctx.font = "700 " + fs + "px " + FONT;
        var bT = ctx.measureText("[stof i octanol]").width;
        ctx.restore();
        var bK = T.formelBredde(ctx, "K_F =", fs + 2, 800), x0 = cx - (bK + 8 + bT) / 2, yb = y + 46;
        T.formel(ctx, "K_F =", x0, yb, fs + 2, D.FARVE.blaek, "left", 800);
        var xb = x0 + bK + 8 + bT / 2;
        NK.tekst(ctx, "[stof i octanol]", xb, yb - 14, { font: "700 " + fs + "px " + FONT, farve: D.FARVE.octanolTekst, justering: "center", linje: "middle" });
        NK.tekst(ctx, "[stof i vand]", xb, yb + 15, { font: "700 " + fs + "px " + FONT, farve: D.FARVE.vandTekst, justering: "center", linje: "middle" });
        ctx.save();
        ctx.strokeStyle = D.FARVE.blaek;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(xb - bT / 2 - 2, yb); ctx.lineTo(xb + bT / 2 + 2, yb); ctx.stroke();
        ctx.restore();
        T.formel(ctx, "log P = log K_F", cx, yb + 50, fs + 1, D.FARVE.blaek, "center", 800);
        /* Det, eleven har fundet */
        var yr = yb + 88;
        vis.forEach(function (r, i) {
            var fsr = k.b < 220 ? 12 : 13;
            var b = T.formelBredde(ctx, r.t, fsr, 700);
            if (b > k.b - 20) fsr *= (k.b - 20) / b;
            T.formel(ctx, r.t, cx, yr + i * 26, fsr, r.fed ? D.FARVE.prik : "#2a3342", "center", r.fed ? 800 : 700);
        });
    };

    NK.SimLogP = SimLogP;
}());
