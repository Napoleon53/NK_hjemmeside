/* =====================================================================
   sim_spil.js - fane 2: spillet Cis eller trans? (og E eller Z?)

   Spillet fra den gamle b6.1 med de samme tal: 15 molekyler, 50 point
   for et rigtigt svar og en bonus for et hurtigt svar, en stime og de
   samme rang-graenser (700, 1000, 1150, 1350).

   Spillet handler om cis og trans (brugeren 10. okt. 2026). E og Z er
   et tilvalg i panelet, og de to emner har hver sin rekord. Emnet er
   data (EMNER): svarknapperne, teksterne og modellen (NK.CT eller NK.EZ
   i js/ez.js).

   Al tekst staar paa det lyse papirkort oeverst i scenen (6. nov. 2026):
   spoergsmaalet og svarknapperne. Et svar vaelges og sendes med Indsend
   svar (Enter); uret stopper ved Indsend svar. Efter svaret bliver kortet
   paa molekylet: svaret er groent (eller roedt, og det rigtige groent),
   forklaringen staar under svarene, og Naeste molekyle staar, hvor
   Indsend svar stod. Spillet venter altid paa Naeste. Spil igen ligger i
   panelet, aldrig paa kortet.
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
                   ["ingen", "Ingen cis-trans-isomeri", "i", "Tast I"]],
            start: "Spillet har 15 molekyler. I cis-formen sidder de to ens grupper på samme side af dobbeltbindingen, og i trans-formen sidder de på hver sin side.",
            spm: "Er molekylet cis, trans eller uden cis-trans-isomeri?"
        },
        ez: {
            titel: "E eller Z?", skilt: "E, Z eller ingen?", rekord: "nk-sb4.6-rekord", model: NK.EZ,
            typer: ["E", "Z"],
            svar: [["E", "E", "e", "E: på hver sin side (tast E)"],
                   ["Z", "Z", "z", "Z: på samme side (tast Z)"],
                   ["ingen", "Ingen E/Z-isomeri", "i", "Tast I"]],
            start: "Spillet har 15 molekyler. I Z-formen sidder de to grupper med højest prioritet på samme side af dobbeltbindingen, og i E-formen sidder de på hver sin side.",
            spm: "Er molekylet E, Z eller uden E/Z-isomeri?"
        }
    };

    function SimSpil() {
        var mig = this;
        this.navn = "sp";
        this.L = new NK.Laerred(NK.el("sp-laerred"));
        this.tid = 0;
        this.el = { kort: NK.el("sp-skort"), besked: NK.el("sp-besked"), status: NK.el("sp-status"), valg: NK.el("sp-valg"),
                    indsend: NK.el("sp-indsend"), bliv: NK.el("sp-bliv"), forfra: NK.el("sp-forfra") };
        this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        this.el.forfra.addEventListener("click", function () { mig.start(); });
        this.el.kort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-videre]")) mig.knap();
        });
        this.L.canvas.addEventListener("click", function () {
            if (mig.tilstand === "svar" || mig.tilstand === "start") mig.kortBlink();
        });
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
            k.className = "sk-knap" + (s[0] === "ingen" ? "" : " stor-bogstav");
            k.textContent = s[1];
            k.title = s[3];
            /* Svarknappen vaelger kun; Indsend svar sender svaret */
            k.addEventListener("click", function () { mig.vaelgSvar(s[0]); });
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
        this.stempel = null;
        this.valgt = null;
        for (var k in this.knapper) this.knapper[k].classList.remove("rigtig", "forkert", "valgt");
        this.visPanel();
        this.visStatus();
    };

    /* Et svar vaelges (klik eller tast); Indsend svar sender det */
    P.vaelgSvar = function (s) {
        if (this.tilstand !== "spil" || !this.knapper[s]) return;
        this.valgt = s;
        for (var k in this.knapper) this.knapper[k].classList.toggle("valgt", k === s);
        this.visKnap();
    };

    P.indsendKlik = function () {
        if (this.tilstand !== "spil") return;
        if (!this.valgt) { this.besked("Vælg først et svar på kortet. Tryk så Indsend svar.", "peger"); return; }
        this.svar(this.valgt);
    };

    P.svar = function (s) {
        if (this.tilstand !== "spil") return;
        var r = this.r, sek = this.tid - this.startTid, model = this.e.model;
        this.svaret = s;
        this.valgt = null;
        this.tilstand = "svar";
        for (var v in this.knapper) this.knapper[v].classList.remove("valgt");
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
            this.forklaring = { maerke: "Rigtigt +" + p, tekst: (ord ? NK.html(ord) + ". " : "") + NK.html(model.dom(r)), god: true };
        } else {
            this.stime = 0;
            this.stempel = { tekst: "Forkert", farve: T.ROED, t: 0.001 };
            this.knapper[s].classList.add("forkert");
            this.knapper[r.type].classList.add("rigtig");
            /* Forklaringen til cis og trans slutter selv med svaret */
            var hoved = r.type === "ingen" || this.emne === "ct" ? "" : "Svaret er " + r.type + ". ";
            this.forklaring = { maerke: "Forkert", tekst: NK.html(hoved + model.fejl(r, s)), god: false };
        }
        this.visPanel();
        this.visStatus();
    };

    P.slut = function () {
        this.tilstand = "slut";
        for (var k in this.knapper) this.knapper[k].classList.remove("rigtig", "forkert");
        var mig = this;
        this.rang = D.SPIL.rang[0];
        D.SPIL.rang.forEach(function (r) { if (mig.score >= r[0]) mig.rang = r; });
        this.nyRekord = this.score > this.rekord;
        if (this.nyRekord) { this.rekord = this.score; NK.gem(this.e.rekord, this.rekord); }
        this.forklaring = { maerke: this.rang[1], tekst: this.rigtige + " af " + D.SPIL.runder + " rigtige og " +
            this.score + " point. " + NK.html(this.rang[2]) + (this.nyRekord ? " Ny rekord." : "") + " Spil igen med knappen i panelet.",
            god: this.rigtige >= 12 };
        this.visPanel();
        this.visStatus();
    };

    /* Den groenne knap paa kortet foerer altid fremad: Start spillet eller
       Naeste molekyle. Efter sidste molekyle er der ingen knap paa kortet. */
    P.knap = function () {
        if (this.tilstand === "start") { this.start(); return; }
        if (this.tilstand === "svar") { this.naeste(); return; }
    };

    P.enter = function () {
        if (this.tilstand === "spil") this.indsendKlik(); else this.knap();
    };

    P.tast = function (k) {
        var m = null;
        k = k.toLowerCase();
        this.e.svar.forEach(function (s) { if (s[2] === k) m = s[0]; });
        if (!m) return false;
        this.vaelgSvar(m);
        return true;
    };

    P.kortBlink = function () {
        var e = this.el.kort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    P.nulstil = function () {
        this.tilstand = "start";
        this.score = 0;
        this.stime = 0;
        this.runde = 0;
        this.stempel = null;
        this.valgt = null;
        for (var k in this.knapper) this.knapper[k].classList.remove("rigtig", "forkert", "valgt");
        this.visPanel();
        this.visStatus();
    };

    /* ----- Kortet oeverst i scenen og panelet --------------------------------------------- */
    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.status.className = "sk-bund" + (klasse ? " " + klasse : "");
    };

    /* Teksten nederst paa kortet: beskeden, eller forklaringen efter et svar */
    P.beskedTekst = function () {
        if (!this.el.bliv.hidden) { var t = this.el.bliv.querySelector(".st-tekst"); return t ? t.textContent : ""; }
        return this.el.besked.textContent;
    };

    P.ryst = function () {
        var e = this.el.status;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    /* Spoergsmaalet staar stille paa kortet gennem hele spillet. Under det:
       Indsend svar, eller (efter et svar) forklaringen og Naeste molekyle */
    P.visStatus = function () {
        var e = this.e, t = this.tilstand;
        var etiket = t === "start" || t === "slut" ? e.titel : "Molekyle " + this.runde + " af " + D.SPIL.runder;
        var prompt = t === "start" ? e.start : (t === "slut" ? "Spillet er slut." : e.spm);
        NK.saetHTML("sp-prompt", '<span class="sk-chip">' + NK.html(etiket) + "</span>" + NK.Papir.tekst(NK.html(prompt)));
        this.el.valg.hidden = t === "start" || t === "slut";
        if (t === "spil") this.besked("", "");
        var blivNu = t !== "spil";
        this.el.status.hidden = blivNu;
        this.el.bliv.hidden = !blivNu;
        var html = "";
        if (t === "start") {
            html = '<div class="sk-bund bliv start"><p class="st-tekst">Rekord: ' + this.rekord + " point. Svar så hurtigt, du kan.</p>" +
                '<button type="button" class="sk-videre" data-videre="1">Start spillet</button></div>';
        } else if (t === "svar") {
            var f = this.forklaring;
            html = NK.Papir.bliv(f.tekst, NK.html(f.maerke), this.runde >= D.SPIL.runder ? "Se resultatet →" : "Næste molekyle →", !f.god);
            if (!f.god) html = html.replace("sk-bund bliv svar", "sk-bund bliv forkert");
        } else if (t === "slut") {
            html = NK.Papir.bliv(this.forklaring.tekst, NK.html(this.forklaring.maerke), "-", !this.forklaring.god).replace(/<button[\s\S]*?<\/button>/, "");
        }
        this.el.bliv.innerHTML = html;
        this.el.kort.classList.toggle("loest", t === "svar" && this.forklaring && this.forklaring.god);
        this.visKnap();
    };

    P.visKnap = function () {
        var t = this.tilstand;
        var aktiv = t === "spil";
        for (var n in this.knapper) this.knapper[n].disabled = !aktiv;
        this.el.indsend.classList.toggle("ikke-klar", !this.valgt);
    };

    P.visPanel = function () {
        NK.saetTekst("sp-score", String(this.score));
        NK.saetTekst("sp-stime", String(this.stime));
        NK.saetTekst("sp-runde", this.runde + "/" + D.SPIL.runder);
        NK.saetTekst("sp-rekord", String(this.rekord));
    };

    /* ----- Fanens kontrakt med app.js ------------------------------------------------------ */
    P.tilpas = function () {
        var h = this.el.kort.offsetHeight;
        if (this.L.tilpas() || !this.lay || h !== this._baandH) {
            this._baandH = h;
            this.layout();
        }
    };

    P.layout = function () {
        var L = this.L;
        var top = NK.kortZone(this.el.kort);
        var bund = L.h - 16;   /* svarknapperne staar paa kortet */
        var tavle = { x: 18, y: top, b: L.b - 36, h: Math.max(200, bund - top) };
        this.lay = { tavle: tavle, cx: tavle.x + tavle.b / 2, cy: tavle.y + tavle.h / 2 + 4, u: Math.min(tavle.b * 0.15, tavle.h * 0.26) };
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
        /* Spillet venter altid paa Naeste molekyle (papirkortet, 6. nov. 2026) */
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
