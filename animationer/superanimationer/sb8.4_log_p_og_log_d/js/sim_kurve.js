/* =====================================================================
   sim_kurve.js - fane 2 (Log D og pH) og fane 3 (Syre eller base)

   Skilletragten, luppen og log D-kurven med pH-skyderen under kurven.
   Skyderen bestemmer vandlagets pH. Luppen viser de 20 molekyler: de
   uladede (HA eller B) kan vaere i begge lag, ionerne (A⁻ eller BH⁺)
   kun i vandet. Kurven tegnes dér, hvor skyderen har vaeret, som
   fordelingsdiagrammet i sb7.7 (skyderen begynder ved pH 0, og knappen
   glider hoejst D.TEGNEFART pH pr. sekund, mens kurven tegnes).

   Trinnenes slags (D.LOGD og D.BASE):
     spor    eleven traekker skyderen fra 0 til 14; kortet bliver staaende
     spm     et spoergsmaal med svar paa kortet
     tal     eleven regner og skriver et tal; bagefter glider skyderen til
             trinnets pH, og punktet faar et navn paa kurven
     ukendt  et ukendt stof: syre eller base og log P (fane 3)
   Fane 2 viser stregen ved pH = pKₛ i trin 4 og trekanten med haeldningen
   −1 bagefter. Fane 3 viser syrens kurve svagt bagved og kroppens
   omraader fra trin 3.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fane;
    var T = NK.Tegning;
    var S = NK.Scene;
    var FONT = T.FONT;

    /* cfg: navn (forstavelsen), fane, trin, stof, noegle, faerdig, videre,
       videreTekst, baggrund (svage kurver bagved), stoffer (frit valg) */
    function SimKurve(cfg) {
        var mig = this;
        this.cfg = cfg;
        this.trinListe = cfg.trin;
        this.hentStatus();
        this.startFane();
        this.lup = new S.Lup();
        NK.el(cfg.navn + "-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("input", function (e) {
            if (e.target && e.target.id === cfg.navn + "-felt") { mig.talTekst = e.target.value; e.target.classList.remove("ryst"); mig.visIndsend(); }
        });
        this.el.skort.addEventListener("keydown", function (e) {
            if (e.target && e.target.id === cfg.navn + "-felt" && e.key === "Enter") { e.preventDefault(); mig.indsendKlik(); }
        });
        var sv = NK.el(cfg.navn + "-stoffer");
        if (sv) sv.addEventListener("click", function (e) {
            var k = e.target.closest && e.target.closest("[data-stof]");
            if (k) mig.proevStof(k.getAttribute("data-stof"));
        });
    }

    var P = SimKurve.prototype;

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(this.cfg.noegle, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(this.cfg.noegle, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "", n = this.cfg.navn;
        this.trinListe.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) || mig.faerdig ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + D.sub(NK.html(t.navn)) + "</span></li>";
        });
        NK.saetHTML(n + "-trin", html);
        NK.saetTekst(n + "-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
        var s = this.stof, skjult = this.skjult();
        var om = skjult ? "Et ukendt lægemiddel. Hvad er log P, og er det en syre eller en base?" :
            s.navn.charAt(0).toUpperCase() + s.navn.slice(1) + " er " + (s.slags === "syre" ? "en syre" : "en base") +
            " med log P = " + D.komma1(s.logP) + " og pKₛ = " + D.komma1(s.pks) + ".";
        NK.saetHTML(n + "-omstof", D.sub(NK.html(om)));
        var forkl = skjult ? "Grå kugle: stoffets uladede form. Lilla kugle: stoffets ion." :
            (s.slags === "syre" ? "Grå kugle: den uladede syre HA. Blå kugle: ionen A⁻." : "Grå kugle: den uladede base B. Rød kugle: ionen BH⁺.");
        NK.saetHTML(n + "-omlup", D.sub(NK.html(forkl + " Luppen viser lige store rumfang af de to lag.")));
        var pr = NK.el(n + "-proev");
        if (pr) {
            pr.hidden = !this.faerdig;
            var knapper = pr.querySelectorAll("[data-stof]");
            for (var i = 0; i < knapper.length; i++) knapper[i].classList.toggle("valgt", knapper[i].getAttribute("data-stof") === this.stofId);
        }
    };

    /* Det ukendte stof er skjult, til eleven har fundet det */
    P.skjult = function () { return !!this.stof.skjult && !this.afsloeret; };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.fri = true;
        this.sejrT = null;
        this.besoegt = {};
        this.punkter = [];
        this.visPks = false;
        this.visHaeldning = false;
        this.visKrop = false;
        this.afsloeret = false;
        this.phMaal = null;
        this.traekMaal = null;
        this.saetStof(this.cfg.stof, 0);
        this.startTrin(0);
    };

    P.saetStof = function (id, ph) {
        this.stofId = id;
        this.stof = D.STOFFER[id];
        if (!this.besoegt[id]) { this.besoegt[id] = []; for (var i = 0; i < S.ANTAL_BIN; i++) this.besoegt[id].push(false); }
        this.ph = undefined;
        this.lup.nulstil(D.fordeling(this.stof, ph));
        this.saetPh(ph, true);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.fase = this.trin.slags;
        this.groen = null;
        this.talTekst = "";
        this.valgt = null;
        this.forkerte = [];
        if (this.trin.id === "genvej") this.visPks = true;
        if (this.trin.krop) this.visKrop = true;
        if (this.trin.stof && this.trin.stof !== this.stofId) this.saetStof(this.trin.stof, 0);
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length, mig = this, n = this.cfg.navn;
        function felt() {
            return '<div class="sk-felt"><label for="' + n + '-felt">' + t.felt + '</label><input id="' + n + '-felt" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="' +
                NK.html(mig.talTekst || "") + '" placeholder="tallet med komma"></div>';
        }
        function svar() { return t.svar.map(function (s, i) { return { t: s, valgt: mig.valgt === i, forkert: mig.forkerte.indexOf(i) >= 0 }; }); }
        if (this.fase === "spor") return { slags: "opgave", chip: chip, tekst: t.tekst };
        if (this.fase === "spm") return { slags: "spm", chip: chip, tekst: t.tekst, svar: svar() };
        /* Formlen og feltet staar i én raekke, saa kortet bliver lavt */
        if (this.fase === "tal") return { slags: "spm", chip: chip, tekst: t.tekst, ekstra: '<div class="sk-raekke"><p class="sk-formel">' + t.formel + "</p>" + felt() + "</div>" };
        /* Det ukendte stof: syre eller base og feltet i én raekke */
        if (this.fase === "ukendt") {
            var knapper = svar().map(function (sv, j) {
                return '<button type="button" class="sk-knap brik' + (sv.valgt ? " valgt" : "") + (sv.forkert ? " forkert" : "") + '" data-valg="' + j + '"' +
                    (sv.forkert ? " disabled" : "") + "><span>" + NK.html(sv.t) + "</span></button>";
            }).join("");
            return { slags: "spm", chip: chip, tekst: t.tekst, ekstra: '<div class="sk-raekke"><div class="sk-svar brikker sk-to">' + knapper + "</div>" + felt() + "</div>" };
        }
        return { slags: "opgave", chip: chip, tekst: "" };
    };

    P.skjulIndsend = function () { return this.fase === "spor"; };

    P.svarValg = function (j) {
        if (this.fase !== "spm" && this.fase !== "ukendt") return;
        this.valgt = j;
        this.besked("", "");
        this.visKort();
        if (this.fase === "ukendt") { var f = NK.el(this.cfg.navn + "-felt"); if (f && !f.value) f.focus(); }
    };

    P.kanSendes = function () {
        if (this.fase === "spm") return this.valgt !== null;
        if (this.fase === "tal") return !!(this.talTekst && this.talTekst.trim());
        if (this.fase === "ukendt") return this.valgt !== null && !!(this.talTekst && this.talTekst.trim());
        return false;
    };
    P.indsendTekst = function () { return "Indsend svar"; };
    P.ingentingTekst = function () {
        if (this.fase === "ukendt") return this.trin.fejlIntet;
        return this.fase === "spm" ? "Vælg et svar først." : "Skriv et tal først.";
    };

    P.rystFelt = function () {
        var f = NK.el(this.cfg.navn + "-felt");
        if (f) { f.classList.remove("ryst"); void f.offsetWidth; f.classList.add("ryst"); }
    };

    P.indsend = function () {
        var t = this.trin, x;
        if (this.fase === "spm") {
            if (this.valgt === t.rigtig) { this.rigtigt(false); return; }
            this.fejl = true;
            this.forkerte.push(this.valgt);
            var fj = t.fejl[this.valgt];
            this.valgt = null;
            this.visKort();
            this.fejlLinje(fj);
            return;
        }
        if (this.fase === "tal") {
            x = D.laesTal(this.talTekst);
            if (isNaN(x)) { this.kortBlink(); this.kortBesked("Skriv et tal, fx −2,5.", 3.5); return; }
            if (Math.abs(x - t.maal) <= t.tol) { this.rigtigt(false); return; }
            var tekst = t.fejlAndet;
            (t.fejl || []).forEach(function (f) { if (Math.abs(x - f.lig) <= f.tol && tekst === t.fejlAndet) tekst = f.t; });
            this.fejl = true;
            this.fejlLinje(tekst);
            this.rystFelt();
            return;
        }
        if (this.fase === "ukendt") {
            x = D.laesTal(this.talTekst);
            if (isNaN(x)) { this.kortBlink(); this.kortBesked("Skriv log P som et tal, fx 1,5.", 3.5); return; }
            var slagsOk = this.valgt === t.rigtig, talOk = Math.abs(x - t.maal) <= t.tol;
            if (slagsOk && talOk) { this.rigtigt(false); return; }
            this.fejl = true;
            if (!slagsOk) {
                this.forkerte.push(this.valgt);
                this.valgt = null;
                this.visKort();
                this.fejlLinje(t.fejlSlags);
                return;
            }
            this.fejlLinje(t.fejlLogP);
            this.rystFelt();
        }
    };

    P.rigtigt = function (vist) {
        var t = this.trin, sidste = this.trinNr === this.trinListe.length - 1, tekst = t.forkl, foerste = false;
        if (this.fase === "tal") {
            this.phMaal = t.ph;
            var v = D.logD(this.stof, t.ph);
            this.punkter.push({ stof: this.stofId, ph: t.ph, v: v, tekst: t.punkt + ": " + D.komma1(v) });
        }
        if (t.id === "genvej") this.visHaeldning = true;
        if (this.fase === "ukendt") this.afsloeret = true;
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            tekst += " " + this.cfg.faerdig;
        }
        this.groen = { spm: true, svarNr: t.rigtig, maade: vist || this.sv ? "svar" : "selv", tekst: tekst,
                       knap: sidste ? (this.cfg.videre ? this.cfg.videreTekst : "Se teorien →") : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el(this.cfg.fane).querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        if (this.cfg.videre && NK.visFane) { NK.visFane(this.cfg.videre); return; }
        /* Sidste fane: knappen aabner teorien (som sb7.7) */
        var tk = NK.el("teoriknap");
        if (tk) tk.click();
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen) return [];
        return this.trin.hint || [];
    };

    /* Kurven er tegnet: kortet bliver staaende med en knap videre */
    P.sporFaerdig = function (vist) {
        this.groen = { spm: true, maade: vist ? "svar" : "selv", maerke: vist ? "Svaret" : "Tegnet", tekst: this.trin.forkl, knap: "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
    };

    P.visSvar = function () {
        this.sv = true;
        var t = this.trin;
        if (this.fase === "spor") { this.tegnHele(); this.sporFaerdig(true); return; }
        if (this.fase === "spm") { this.valgt = t.rigtig; this.rigtigt(true); return; }
        if (this.fase === "tal") { this.talTekst = D.komma1(t.maal); this.rigtigt(true); return; }
        if (this.fase === "ukendt") { this.tegnHele(); this.valgt = t.rigtig; this.talTekst = D.komma1(t.maal); this.rigtigt(true); }
    };

    P.tegnHele = function () {
        var b = this.besoegt[this.stofId];
        for (var i = 0; i < S.ANTAL_BIN; i++) b[i] = true;
    };

    P.proevStof = function (id) {
        if (!this.faerdig || !D.STOFFER[id]) return;
        this.phMaal = null;
        this.traekMaal = null;
        this.saetStof(id, this.ph);
        this.visListe();
        this.layout();
    };

    /* ----- pH, sporet og molekylerne --------------------------------------------------- */
    P.saetPh = function (ph, foerste) {
        ph = Math.round(NK.klamp(ph, 0, 14) / D.PH_SKRIDT) * D.PH_SKRIDT;
        var b = this.besoegt[this.stofId], b1 = S.bin(ph);
        if (!foerste && this.ph !== undefined) {
            var b0 = S.bin(this.ph);
            for (var k = Math.min(b0, b1); k <= Math.max(b0, b1); k++) b[k] = true;
        } else b[b1] = true;
        this.ph = ph;
        this.lup.saetFordeling(D.fordeling(this.stof, ph), !!foerste);
        if (this.fase === "spor" && !this.groen && this.daekning() >= D.DAEKNING) this.sporFaerdig(false);
    };

    P.daekning = function () {
        var n = 0, b = this.besoegt[this.stofId];
        b.forEach(function (x) { if (x) n++; });
        return n / S.ANTAL_BIN;
    };

    P.opdaterScene = function (dt) {
        this.lup.opdater(dt);
        if (this.phMaal !== null) {
            var ny = NK.mod(this.ph, this.phMaal, 5, dt);
            if (Math.abs(ny - this.phMaal) < 0.03) { ny = this.phMaal; this.phMaal = null; }
            this.ph = ny;
            this.lup.saetFordeling(D.fordeling(this.stof, ny), false);
        }
        /* Mens kurven tegnes, glider knappen roligt hen mod musen */
        if (this.traekMaal !== null) {
            var skridt = D.TEGNEFART * dt, rest = this.traekMaal - this.glid;
            if (Math.abs(rest) <= skridt) { this.glid = this.traekMaal; this.traekMaal = null; }
            else this.glid += rest > 0 ? skridt : -skridt;
            this.saetPh(this.glid);
        }
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (!pt) return null;
        if (T.paaSkala(this.skala, pt)) return "ew-resize";
        return null;
    };

    /* Mens kurven tegnes foerste gang (og for det ukendte stof), glider knappen */
    P.langsom = function () { return (this.fase === "spor" || this.fase === "ukendt") && !this.groen; };

    P.traekTil = function (ph) {
        if (this.langsom()) {
            if (this.traekMaal === null) this.glid = this.ph;
            this.traekMaal = NK.klamp(ph, 0, 14);
        } else {
            this.traekMaal = null;
            this.saetPh(ph);
        }
    };

    P.nedScene = function (pt) {
        if (!T.paaSkala(this.skala, pt)) return false;
        this.grebSkyder = true;
        this.phMaal = null;
        this.traekTil(T.xTilPh(this.skala, pt.x));
        return true;
    };

    P.flytScene = function (pt) { if (this.grebSkyder) this.traekTil(T.xTilPh(this.skala, pt.x)); };
    P.opScene = function () { this.grebSkyder = false; };

    P.klikScene = function () {
        if (this.groen && !this.faerdig) { this.kortBlink(); return; }
        if (this.fase === "spor" && !this.groen) {
            this.kortBlink();
            this.kortBesked("Træk i pH-skyderen under kurven.", 3);
        }
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.medTragt = t.b >= 720;
        var x = t.x + 14;
        if (this.medTragt) {
            var tb = Math.round(NK.klamp(t.b * 0.19, 120, 200));
            this.tragt = S.tragtKasse(x, t.y + 14, tb, t.h - 24);
            x = this.tragt.x + this.tragt.b + 34;
        } else this.tragt = null;
        var R = Math.round(NK.klamp(Math.min((t.h - 96) / 2, t.b * 0.15), 84, 150));
        this.lup.geometri(x + R, t.y + Math.max(R + 34, t.h * 0.46), R);
        var gx0 = x + 2 * R + 34 + 48, gx1 = t.x + t.b - 22;
        this.graf = { x0: gx0, x1: gx1, y0: t.y + 36, y1: t.y + t.h - 122 };
        this.skala = { x: gx0, y: t.y + t.h - 30, b: gx1 - gx0 };
        if (this.tragt) this.saetAnker("tragt", this.tragt.x, this.tragt.y, this.tragt.b, this.tragt.h);
        else this.saetAnker("tragt", 0, 0, 1, 1);
        this.saetAnker("lup", this.lup.cx - R - 6, this.lup.cy - R - 30, 2 * R + 12, 2 * R + 60);
        this.saetAnker("graf", gx0 - 50, this.graf.y0 - 20, gx1 - gx0 + 60, this.graf.y1 - this.graf.y0 + 54);
        this.saetAnker("skyder", gx0 - 36, this.skala.y - 46, gx1 - gx0 + 72, 70);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;
        T.tavle(ctx, lay);
        if (this.tragt) {
            S.lupLinjer(ctx, S.lupPunkt(this.tragt), this.lup);
            S.tragt(ctx, this.tragt, { ph: this.ph });
        }
        this.lup.tegn(ctx, { stof: this.stof, ph: this.ph, ukendt: this.skjult() });
        this.tegnGraf(ctx);
        T.phSkala(ctx, this.skala, this.ph, { greb: this.grebSkyder, navn: false });
        NK.tekst(ctx, "pH", this.skala.x - 14, this.skala.y + 1, { font: "800 14px " + FONT, farve: T.BLAEK, justering: "right", linje: "middle" });
        if (this.langsom() && this.daekning() < 0.2) {
            T.skilt(ctx, T.phTilX(this.skala, this.ph), this.skala.y - 44, "Træk i skyderen", { min: t.x + 6, maks: t.x + t.b - 6 });
        }
        this.tegnSejr(ctx, t);
    };

    P.navnPaa = function (s) {
        if (s.skjult && !this.afsloeret && s.id === this.stofId) return "ukendt stof";
        return (s.slags === "syre" ? "en syre: " : "en base: ") + s.navn;
    };

    P.tegnGraf = function (ctx) {
        var g = this.graf, mig = this;
        S.akser(ctx, g);
        if (this.visKrop) S.krop(ctx, g);
        if (this.visPks) S.pks(ctx, g, this.stof.pks);
        /* De andre stoffers kurver svagt bagved */
        var bag = this.faerdig ? (this.cfg.stoffer || []).filter(function (id) { return id !== mig.stofId; }) : (this.cfg.baggrund || []).slice();
        if (!this.faerdig && this.trin.slags === "ukendt" && this.cfg.ekstraBag) bag = bag.concat(this.cfg.ekstraBag);
        bag.forEach(function (id) {
            var s = D.STOFFER[id];
            S.kurve(ctx, g, s, null, { alfa: 0.35, bredde: 2.2 });
            S.kurveNavn(ctx, g, s, (s.skjult && !mig.afsloeret) ? "ukendt stof" : s.navn, { farve: "rgba(80, 90, 100, 0.75)", under: true });
        });
        S.kurve(ctx, g, this.stof, this.besoegt[this.stofId]);
        var b = this.besoegt[this.stofId], plateau = this.stof.slags === "syre" ? S.bin(0.5) : S.bin(13.5);
        S.akseTekst(ctx, g);
        S.markoer(ctx, g, this.stof, this.ph, this.skala.y - 12, false);
        if (b[plateau]) S.kurveNavn(ctx, g, this.stof, this.navnPaa(this.stof));
        if (this.visHaeldning) S.haeldning(ctx, g, this.stof, 8);
        this.punkter.forEach(function (p) { if (p.stof === mig.stofId) S.punkt(ctx, g, p.ph, p.v, p.tekst); });
        if (b[S.bin(this.ph)]) S.prik(ctx, g, this.stof, this.ph);
    };

    NK.SimKurve = SimKurve;

    /* fane.js binder forstavelsen (d eller b) til prototypen, saa hver fane
       har sin egen underklasse */
    function klasse(navn) {
        function K(cfg) { SimKurve.call(this, cfg); }
        K.prototype = Object.create(SimKurve.prototype);
        K.prototype.constructor = K;
        F.paa(K.prototype, navn);
        return K;
    }
    var LogD = klasse("d"), Base = klasse("b");
    NK.lavLogD = function () {
        return new LogD({ navn: "d", fane: "fane-d", trin: D.LOGD, stof: "asa", noegle: "nk-sb8.4-logd",
                          faerdig: D.LOGD_FAERDIG, videre: "fane-b", videreTekst: "Videre til Syre eller base →" });
    };
    NK.lavBase = function () {
        return new Base({ navn: "b", fane: "fane-b", trin: D.BASE, stof: "amf", noegle: "nk-sb8.4-base",
                          faerdig: D.BASE_FAERDIG, videre: null, baggrund: ["asa"], ekstraBag: ["amf"], stoffer: D.BASE_STOFFER });
    };
}());
