/* =====================================================================
   sim_spil.js - fane 2: spillet Cis eller trans? (og E eller Z?)

   Spillet fra den gamle b6.1 med de samme tal: 15 molekyler, 50 point
   for et rigtigt svar og en bonus for et hurtigt svar, en stime og de
   samme rang-graenser (700, 1000, 1150, 1350).

   Spillet handler om cis og trans (brugeren 10. okt. 2026). E og Z er
   et tilvalg i panelet, og de to emner har hver sin rekord. Emnet er
   data (EMNER): svarknapperne, teksterne og modellen (NK.CT eller NK.EZ
   i js/ez.js).

   Al tekst staar paa kortet oeverst i scenen: spoergsmaalet, og under
   det forklaringen efter et svar. Efter en fejl venter spillet, til
   eleven trykker Naeste, saa forklaringen kan laeses.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.T;

    var EMNER = {
        ct: {
            titel: "Cis eller trans?", skilt: "cis, trans eller ingen?", rekord: "nk-sb4.6-rekord-ct", model: NK.CT,
            typer: ["cis", "trans"],
            svar: [["cis", "cis", "c", "cis: de to ens grupper på samme side (tast C)"],
                   ["trans", "trans", "t", "trans: de to ens grupper på hver sin side (tast T)"],
                   ["ingen", "Ingen cis/trans-isomeri", "i", "Tast I"]],
            start: "15 molekyler. cis: de to ens grupper sidder på samme side af dobbeltbindingen. trans: de sidder på hver sin side.",
            spm: "Er molekylet cis, trans eller uden cis/trans-isomeri?"
        },
        ez: {
            titel: "E eller Z?", skilt: "E, Z eller ingen?", rekord: "nk-sb4.6-rekord", model: NK.EZ,
            typer: ["E", "Z"],
            svar: [["E", "E", "e", "E: på hver sin side (tast E)"],
                   ["Z", "Z", "z", "Z: på samme side (tast Z)"],
                   ["ingen", "Ingen E/Z-isomeri", "i", "Tast I"]],
            start: "15 molekyler. Z: de to grupper med højest prioritet sidder på samme side af dobbeltbindingen. E: de sidder på hver sin side.",
            spm: "Er molekylet E, Z eller uden E/Z-isomeri?"
        }
    };

    function SimSpil() {
        var mig = this;
        this.navn = "sp";
        this.L = new NK.Laerred(NK.el("sp-laerred"));
        this.tid = 0;
        this.el = { knap: NK.el("sp-knap"), besked: NK.el("sp-besked"), status: NK.el("sp-status"), valg: NK.el("sp-valg") };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        var eb = document.querySelectorAll("#sp-emnekort [data-emne]");
        for (var i = 0; i < eb.length; i++) {
            (function (b) {
                b.addEventListener("click", function () { mig.saetEmne(b.getAttribute("data-emne")); });
            }(eb[i]));
        }
        this.emneKnapper = eb;
        this.saetEmne("ct");
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimSpil.prototype;

    /* ----- Emnet: cis og trans, eller E og Z ------------------------------------------ */
    P.saetEmne = function (id) {
        var mig = this;
        this.emne = id;
        this.e = EMNER[id];
        this.rekord = NK.hent(this.e.rekord, 0) || 0;
        for (var i = 0; i < this.emneKnapper.length; i++) {
            var b = this.emneKnapper[i], valgt = b.getAttribute("data-emne") === id;
            b.classList.toggle("aktiv", valgt);
            b.setAttribute("aria-pressed", valgt ? "true" : "false");
        }
        this.el.valg.innerHTML = "";
        this.knapper = {};
        this.e.svar.forEach(function (s) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap" + (s[0] === "ingen" ? "" : " stor-bogstav");
            k.textContent = s[1];
            k.title = s[3];
            k.addEventListener("click", function () { mig.svar(s[0]); });
            mig.el.valg.appendChild(k);
            mig.knapper[s[0]] = k;
        });
        this.pos = ["CH3", "H", "CH3", "H"];
        this.nulstil();
    };

    /* ----- Spillets gang ----------------------------------------------------------- */
    P.start = function () {
        var e = this.e, a = e.typer[0], b = e.typer[1];
        var typer = NK.bland([a, a, a, a, a, a, b, b, b, b, b, b, "ingen", "ingen", "ingen"]);
        /* Tre faelder blandt E og Z (cis og trans har ingen) */
        var faelder = NK.bland([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].filter(function (i) { return typer[i] !== "ingen"; })).slice(0, 3);
        this.molekyler = typer.map(function (t, i) { return e.model.tilfaeldigt(t, faelder.indexOf(i) >= 0); });
        this.score = 0;
        this.stime = 0;
        this.rigtige = 0;
        this.runde = 0;
        this.naeste();
    };

    P.naeste = function () {
        if (this.runde >= D.SPIL.runder) { this.slut(); return; }
        this.pos = this.molekyler[this.runde];
        this.runde++;
        this.r = this.e.model.analyser(this.pos);
        this.tilstand = "spil";
        this.svaret = null;
        this.startTid = this.tid;
        this.autoT = 0;
        this.stempel = null;
        for (var k in this.knapper) this.knapper[k].classList.remove("rigtig", "forkert");
        this.visPanel();
        this.visStatus();
    };

    P.svar = function (s) {
        if (this.tilstand !== "spil") return;
        var r = this.r, sek = this.tid - this.startTid, model = this.e.model;
        this.svaret = s;
        this.tilstand = "svar";
        if (s === r.type) {
            var bonus = 0, ord = "";
            D.SPIL.bonus.some(function (b) {
                if (sek < b[0]) { bonus = b[1]; ord = b[2]; return true; }
                return false;
            });
            var p = D.SPIL.point + bonus;
            this.score += p;
            this.stime++;
            this.rigtige++;
            this.stempel = { tekst: "+" + p, farve: T.GROEN, t: 0.001 };
            this.knapper[s].classList.add("rigtig");
            this.autoT = 1.6;
            this.besked('<span class="b-maerke stor">Rigtigt +' + p + "</span> " + (ord ? NK.html(ord) + ". " : "") + NK.html(model.dom(r)), "god");
        } else {
            this.stime = 0;
            this.stempel = { tekst: "Forkert", farve: T.ROED, t: 0.001 };
            this.knapper[s].classList.add("forkert");
            this.knapper[r.type].classList.add("rigtig");
            /* Forklaringen til cis og trans slutter selv med svaret */
            var hoved = r.type === "ingen" || this.emne === "ct" ? "" : "Svaret er " + r.type + ". ";
            this.besked('<span class="b-maerke">Forkert</span> ' + NK.html(hoved + model.fejl(r, s)), "skidt");
            this.ryst();
        }
        this.visPanel();
        this.visKnap();
    };

    P.slut = function () {
        this.tilstand = "slut";
        for (var k in this.knapper) this.knapper[k].classList.remove("rigtig", "forkert");
        var mig = this;
        this.rang = D.SPIL.rang[0];
        D.SPIL.rang.forEach(function (r) { if (mig.score >= r[0]) mig.rang = r; });
        this.nyRekord = this.score > this.rekord;
        if (this.nyRekord) { this.rekord = this.score; NK.gem(this.e.rekord, this.rekord); }
        this.visPanel();
        this.visStatus();
        this.besked('<span class="b-maerke stor">' + NK.html(this.rang[1]) + "</span> " + this.rigtige + " af " + D.SPIL.runder + " rigtige og " +
            this.score + " point. " + NK.html(this.rang[2]) + (this.nyRekord ? " Ny rekord." : ""), this.rigtige >= 12 ? "god" : "gul");
    };

    P.knap = function () {
        if (this.tilstand === "start" || this.tilstand === "slut") { this.start(); return; }
        if (this.tilstand === "svar") { this.naeste(); return; }
    };

    P.enter = function () { this.knap(); };

    P.tast = function (k) {
        var m = null;
        k = k.toLowerCase();
        this.e.svar.forEach(function (s) { if (s[2] === k) m = s[0]; });
        if (!m) return false;
        if (this.tilstand === "spil") this.svar(m);
        return true;
    };

    P.nulstil = function () {
        this.tilstand = "start";
        this.score = 0;
        this.stime = 0;
        this.runde = 0;
        this.stempel = null;
        for (var k in this.knapper) this.knapper[k].classList.remove("rigtig", "forkert");
        this.visPanel();
        this.visStatus();
    };

    /* ----- Kortet oeverst i scenen og panelet --------------------------------------------- */
    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.status.className = "statuslinje" + (klasse ? " " + klasse : "");
    };

    P.beskedTekst = function () { return this.el.besked.textContent; };

    P.ryst = function () {
        var e = this.el.status;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    /* Spoergsmaalet staar stille paa kortet gennem hele spillet; kun linjen
       under det skifter */
    P.visStatus = function () {
        var e = this.e, t = this.tilstand;
        NK.saetTekst("sp-titel", e.titel);
        NK.saetTekst("sp-taeller", this.runde && t !== "slut" ? "molekyle " + this.runde + " af " + D.SPIL.runder : "");
        var prompt = t === "start" ? e.start : (t === "slut" ? "" : e.spm);
        NK.saetHTML("sp-prompt", prompt ? '<p class="maal-tekst">' + NK.html(prompt) + "</p>" : "");
        if (t === "start" || t === "spil") this.besked("", "");
        this.visKnap();
    };

    P.visKnap = function () {
        var k = this.el.knap, t = this.tilstand;
        k.textContent = t === "start" ? "Start spillet" : (t === "slut" ? "Spil igen ↺" : "Næste molekyle →");
        k.className = "knap videre banker";
        k.hidden = t === "spil";
        var aktiv = t === "spil";
        for (var n in this.knapper) this.knapper[n].disabled = !aktiv;
        this.el.valg.classList.toggle("slukket", !aktiv);
    };

    P.visPanel = function () {
        NK.saetTekst("sp-score", String(this.score));
        NK.saetTekst("sp-stime", String(this.stime));
        NK.saetTekst("sp-runde", this.runde + "/" + D.SPIL.runder);
        NK.saetTekst("sp-rekord", String(this.rekord));
    };

    /* ----- Fanens kontrakt med app.js ------------------------------------------------------ */
    P.tilpas = function () {
        var h = this.el.status.offsetHeight;
        if (this.L.tilpas() || !this.lay || h !== this._baandH) {
            this._baandH = h;
            this.layout();
        }
    };

    P.layout = function () {
        var L = this.L;
        var top = NK.kortZone(this.el.status);
        var bund = L.h - 62 - 16;
        var tavle = { x: 18, y: top, b: L.b - 36, h: Math.max(200, bund - top) };
        this.lay = { tavle: tavle, cx: tavle.x + tavle.b / 2, cy: tavle.y + tavle.h / 2 + 4, u: Math.min(tavle.b * 0.15, tavle.h * 0.26) };
        this.el.valg.style.bottom = "12px";
        var a = NK.el("sp-anker-tavle");
        a.style.left = tavle.x + "px";
        a.style.top = tavle.y + "px";
        a.style.width = tavle.b + "px";
        a.style.height = tavle.h + "px";
    };

    P.fokus = function () { };

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.stempel && this.stempel.t < 1) this.stempel.t = Math.min(1, this.stempel.t + dt);
        if (this.tilstand === "svar" && this.autoT > 0) {
            this.autoT -= dt;
            if (this.autoT <= 0) this.naeste();
        }
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        L.ryd("#14141a");
        T.tavle(ctx, lay.tavle, null);
        var tv = lay.tavle;
        if (this.tilstand === "start" || this.tilstand === "slut") {
            this.tegnSkilt(ctx);
            return;
        }
        var opt = { ring: {}, zTal: {}, naeste: {} };
        if (this.tilstand === "svar") {
            var r = this.r, rigtig = this.svaret === r.type;
            /* Det, der vises efter en fejl, er det rigtige svar: gult, ikke roedt */
            var f = rigtig ? T.GROEN : T.GUL;
            if (r.type === "ingen") {
                var s = r.ensV ? 0 : 2;
                opt.ring[s] = opt.ring[s + 1] = T.GUL;
            } else if (this.emne === "ct") {
                /* De to ens grupper og linjen mellem dem */
                opt.ring[r.par[0]] = opt.ring[r.par[1]] = f;
                opt.linje = r.par;
                opt.linjeFarve = f;
            } else {
                opt.ring[r.v] = f; opt.ring[r.h] = f; opt.linje = [r.v, r.h]; opt.linjeFarve = f;
            }
            if (this.emne === "ez") {
                opt.zTal = { 0: true, 1: true, 2: true, 3: true };
                if (!NK.EZ.foersteAtom(this.pos[0], this.pos[1])) opt.naeste[0] = opt.naeste[1] = true;
                if (!NK.EZ.foersteAtom(this.pos[2], this.pos[3])) opt.naeste[2] = opt.naeste[3] = true;
            }
        }
        T.formel(ctx, lay, this.pos, opt);
        if (this.tilstand === "spil") {
            /* Uret: en tynd streg, der bliver kortere, mens bonussen falder */
            var sek = this.tid - this.startTid, andel = NK.klamp(1 - sek / 10, 0, 1);
            ctx.save();
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.fillRect(tv.x + 24, tv.y + tv.h - 30, tv.b - 48, 6);
            ctx.fillStyle = sek < 2 ? "#5fcf92" : (sek < 4 ? "#f2c53d" : "#e6892a");
            ctx.fillRect(tv.x + 24, tv.y + tv.h - 30, (tv.b - 48) * andel, 6);
            ctx.restore();
        }
        if (this.stempel) T.stempel(ctx, tv.x + tv.b - 100, tv.y + 52, this.stempel.tekst, this.stempel.farve, this.stempel.t, 30);
    };

    P.tegnSkilt = function (ctx) {
        var lay = this.lay, cx = lay.cx, cy = lay.cy;
        if (this.tilstand === "start") {
            NK.tekst(ctx, this.e.skilt, cx, cy - 14, { font: "800 40px 'Segoe UI', sans-serif", farve: "#e9eee9", justering: "center" });
            NK.tekst(ctx, "Rekord: " + this.rekord + " point", cx, cy + 30,
                { font: "600 16px 'Segoe UI', sans-serif", farve: "#9fb1a9", justering: "center" });
            return;
        }
        NK.tekst(ctx, this.score + " point", cx, cy - 22, { font: "800 54px 'Segoe UI', sans-serif", farve: "#f2c53d", justering: "center" });
        NK.tekst(ctx, this.rang[1], cx, cy + 30, { font: "800 30px 'Segoe UI', sans-serif", farve: "#7fc4ef", justering: "center" });
    };

    NK.SimSpil = SimSpil;
}());
