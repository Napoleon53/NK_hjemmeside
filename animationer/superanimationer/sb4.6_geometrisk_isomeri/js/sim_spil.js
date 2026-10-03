/* =====================================================================
   sim_spil.js - fane 3: spillet E eller Z?

   Spillet fra den gamle b6.1 med de samme tal: 15 molekyler, 50 point
   for et rigtigt svar og en bonus for et hurtigt svar, en stime og de
   samme rang-graenser (700, 1000, 1150, 1350).

   Nyt: hvert svar viser prioriteterne paa tavlen, og et forkert svar
   faar en forklaring, der passer til fejlen. Efter en fejl venter
   spillet, til eleven trykker Naeste, saa forklaringen kan laeses. Tre
   af molekylerne er uden E/Z-isomeri, og nogle er faelder, hvor den
   samme gruppe sidder paa begge C-atomer uden at vinde paa begge.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.T;
    var EZ = NK.EZ;
    var REKORD = "nk-sb4.6-rekord";

    function SimSpil() {
        var mig = this;
        this.navn = "sp";
        this.L = new NK.Laerred(NK.el("sp-laerred"));
        this.tid = 0;
        this.el = { knap: NK.el("sp-knap"), besked: NK.el("sp-besked"), status: NK.el("sp-status"), valg: NK.el("sp-valg") };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        this.knapper = {};
        var bt = this.el.valg.querySelectorAll("button");
        for (var i = 0; i < bt.length; i++) {
            (function (b) {
                mig.knapper[b.getAttribute("data-svar")] = b;
                b.addEventListener("click", function () { mig.svar(b.getAttribute("data-svar")); });
            }(bt[i]));
        }
        this.rekord = NK.hent(REKORD, 0) || 0;
        this.tilstand = "start";
        this.score = 0;
        this.stime = 0;
        this.runde = 0;
        this.pos = ["CH3", "H", "Cl", "H"];
        this.visPanel();
        this.visStatus();
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimSpil.prototype;

    /* ----- Spillets gang ----------------------------------------------------------- */
    P.start = function () {
        var typer = NK.bland(["E", "E", "E", "E", "E", "E", "Z", "Z", "Z", "Z", "Z", "Z", "ingen", "ingen", "ingen"]);
        /* Tre faelder blandt E og Z */
        var faelder = NK.bland([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].filter(function (i) { return typer[i] !== "ingen"; })).slice(0, 3);
        this.molekyler = typer.map(function (t, i) { return EZ.tilfaeldigt(t, faelder.indexOf(i) >= 0); });
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
        this.r = EZ.analyser(this.pos);
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
        if (this.tilstand === "start" || this.tilstand === "slut") { this.start(); return; }
        if (this.tilstand !== "spil") return;
        var r = this.r, sek = this.tid - this.startTid;
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
            this.besked('<span class="b-maerke stor">Rigtigt +' + p + "</span> " + (ord ? NK.html(ord) + ". " : "") + NK.html(EZ.dom(r)), "god");
        } else {
            this.stime = 0;
            this.stempel = { tekst: "Forkert", farve: T.ROED, t: 0.001 };
            this.knapper[s].classList.add("forkert");
            this.knapper[r.type].classList.add("rigtig");
            var hoved = r.type === "ingen" ? "" : "Svaret er " + r.type + ". ";
            this.besked('<span class="b-maerke">Forkert</span> ' + NK.html(hoved + EZ.fejl(r, s)), "skidt");
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
        if (this.nyRekord) { this.rekord = this.score; NK.gem(REKORD, this.rekord); }
        this.besked('<span class="b-maerke stor">' + NK.html(this.rang[1]) + "</span> " + this.rigtige + " af " + D.SPIL.runder + " rigtige og " +
            this.score + " point. " + NK.html(this.rang[2]) + (this.nyRekord ? " Ny rekord." : ""), this.rigtige >= 12 ? "god" : "gul");
        this.visPanel();
        this.visKnap();
    };

    P.knap = function () {
        if (this.tilstand === "start" || this.tilstand === "slut") { this.start(); return; }
        if (this.tilstand === "svar") { this.naeste(); return; }
    };

    P.enter = function () { this.knap(); };

    P.tast = function (k) {
        var m = { e: "E", z: "Z", i: "ingen" }[k.toLowerCase()];
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

    /* ----- Statuslinjen og panelet -------------------------------------------------------- */
    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.status.className = "statuslinje" + (klasse ? " " + klasse : "");
    };

    P.ryst = function () {
        var e = this.el.status;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    P.visStatus = function () {
        if (this.tilstand === "start") {
            this.besked("15 molekyler. Er hvert af dem E, Z eller uden E/Z-isomeri? Hurtige svar giver bonus.", "");
        } else if (this.tilstand === "spil") {
            this.besked(this.runde === D.SPIL.runder ? "Sidste molekyle. Er det E, Z eller uden E/Z-isomeri?" :
                "Er molekylet E, Z eller uden E/Z-isomeri? Tasterne E, Z og I virker også.", "");
        }
        this.visKnap();
    };

    P.visKnap = function () {
        var k = this.el.knap, t = this.tilstand;
        k.textContent = t === "start" ? "Start spillet" : (t === "slut" ? "Spil igen ↺" : (t === "svar" ? "Næste molekyle →" : "Svar under tavlen"));
        k.className = "knap " + (t === "spil" ? "hjaelp" : "videre banker");
        k.disabled = t === "spil";
        var aktiv = t === "spil";
        for (var n in this.knapper) this.knapper[n].disabled = !aktiv;
        this.el.valg.classList.toggle("slukket", !aktiv);
    };

    P.visPanel = function () {
        NK.saetTekst("sp-score", String(this.score));
        NK.saetTekst("sp-stime", String(this.stime));
        NK.saetTekst("sp-runde", this.runde ? this.runde + "/" + D.SPIL.runder : "–");
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
        var h = this.el.status.offsetHeight || 68;
        var bund = L.h - Math.max(h, 92) - 62 - 6;
        var tavle = { x: 18, y: 14, b: L.b - 36, h: Math.max(200, bund - 14) };
        this.lay = { tavle: tavle, cx: tavle.x + tavle.b / 2, cy: tavle.y + tavle.h / 2 + 4, u: Math.min(tavle.b * 0.15, tavle.h * 0.26) };
        this.el.valg.style.bottom = (h + 10) + "px";
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
            var f = rigtig ? T.GROEN : T.ROED;
            opt.zTal = { 0: true, 1: true, 2: true, 3: true };
            if (!EZ.foersteAtom(this.pos[0], this.pos[1])) opt.naeste[0] = opt.naeste[1] = true;
            if (!EZ.foersteAtom(this.pos[2], this.pos[3])) opt.naeste[2] = opt.naeste[3] = true;
            if (r.type !== "ingen") { opt.ring[r.v] = f; opt.ring[r.h] = f; opt.linje = [r.v, r.h]; opt.linjeFarve = f; }
            else { var s = r.ensV ? 0 : 2; opt.ring[s] = opt.ring[s + 1] = T.GUL; }
        }
        T.formel(ctx, lay, this.pos, opt);
        NK.tekst(ctx, "Molekyle " + this.runde + " af " + D.SPIL.runder, tv.x + 24, tv.y + 36, { font: "700 17px 'Segoe UI', sans-serif", farve: "#9fb1a9" });
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
        var kridt = { font: "800 40px 'Segoe UI', sans-serif", farve: "#e9eee9", justering: "center" };
        if (this.tilstand === "start") {
            NK.tekst(ctx, "E, Z eller ingen?", cx, cy - 40, kridt);
            NK.tekst(ctx, "15 molekyler. 50 point for hvert rigtigt svar og bonus for fart.", cx, cy + 6,
                { font: "600 18px 'Segoe UI', sans-serif", farve: "#cfe0d6", justering: "center" });
            NK.tekst(ctx, "Rekord: " + this.rekord + " point", cx, cy + 40,
                { font: "600 16px 'Segoe UI', sans-serif", farve: "#9fb1a9", justering: "center" });
            return;
        }
        NK.tekst(ctx, "Spillet er slut", cx, cy - 78, { font: "700 24px 'Segoe UI', sans-serif", farve: "#cfe0d6", justering: "center" });
        NK.tekst(ctx, this.score + " point", cx, cy - 22, { font: "800 54px 'Segoe UI', sans-serif", farve: "#f2c53d", justering: "center" });
        NK.tekst(ctx, this.rang[1], cx, cy + 30, { font: "800 30px 'Segoe UI', sans-serif", farve: "#7fc4ef", justering: "center" });
        NK.tekst(ctx, this.rigtige + " af " + D.SPIL.runder + " rigtige · rekord " + this.rekord, cx, cy + 66,
            { font: "600 17px 'Segoe UI', sans-serif", farve: "#cfe0d6", justering: "center" });
    };

    NK.SimSpil = SimSpil;
}());
