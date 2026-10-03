/* =====================================================================
   sim_prioritet.js - fane 2: prioriteten

   Strukturformlen staar paa tavlen som i bogen. To slags opgaver:

     afgoer  otte molekyler. Eleven klikker paa vinderen paa hvert
             C-atom (i hvilken som helst raekkefoelge) og vaelger saa E,
             Z eller Ingen E/Z-isomeri under tavlen. Et rigtigt svar kan
             gives med det samme; et forkert faar en forklaring, der
             passer til fejlen (js/ez.js).
     byg     fire opgaver, hvor eleven bygger molekylet selv: grupperne
             traekkes fra raekken under tavlen hen paa pladserne (eller et
             klik paa en plads skifter gruppe, som i den gamle b6.1).
             Tjek eller Enter afgoer det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.T;
    var EZ = NK.EZ;

    function SimPrioritet() {
        var mig = this;
        this.valg = NK.el("pr-valg");
        this.startFane(D.PRIO, D.PRIO_GRUPPER);
        this.vaelg(0);
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimPrioritet.prototype;
    NK.Fane.paa(P, { navn: "pr", naesteFane: "fane-sp", naesteNavn: "spillet" });

    P.chipTekst = function (o, i) { return o.slags === "byg" ? "B" + (i - 7) : String(i + 1); };

    /* ----- Opgaven ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.o = o;
        this.pos = o.slags === "byg" ? [null, null, null, null] : o.pos.slice();
        this.r = o.slags === "byg" ? null : EZ.analyser(this.pos);
        this.side = { v: null, h: null };     /* den gruppe, eleven har fundet som vinder */
        this.forkert = null;                  /* den gruppe, eleven lige har klikket forkert paa */
        this.zVist = { v: false, h: false };
        this.svar = null;
        this.stempelT = 0;
        this.hold = null;
        this.over = null;
        this.bygValg();
    };

    P.bygValg = function () {
        var mig = this;
        this.valg.innerHTML = "";
        this.knapper = {};
        function knap(tekst, noegle, klasse, fn, titel) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap" + (klasse ? " " + klasse : "");
            k.textContent = tekst;
            if (titel) k.title = titel;
            k.addEventListener("click", function () { fn(); mig.fokus(); });
            mig.valg.appendChild(k);
            mig.knapper[noegle] = k;
        }
        if (this.o.slags === "afgoer") {
            knap("E", "E", "stor-bogstav", function () { mig.svarEZ("E"); }, "E: på hver sin side (tast E)");
            knap("Z", "Z", "stor-bogstav", function () { mig.svarEZ("Z"); }, "Z: på samme side (tast Z)");
            knap("Ingen E/Z-isomeri", "ingen", "", function () { mig.svarEZ("ingen"); }, "Tast I");
        } else {
            knap("Tjek molekylet", "tjek", "tjek", function () { mig.tjek(); }, "Enter");
        }
    };

    P.promptHTML = function () {
        var o = this.o;
        if (o.slags === "byg") {
            return '<p class="maal-tekst">' + NK.html(o.maal) + "</p>" +
                '<p class="note-tekst">Træk grupperne fra rækken under tavlen hen på pladserne. Et klik på en plads skifter gruppe.</p>';
        }
        var trin = [
            ["Find vinderen på det venstre C-atom", this.side.v !== null],
            ["Find vinderen på det højre C-atom", this.side.h !== null],
            ["Vælg E, Z eller Ingen E/Z-isomeri", this.faerdig]
        ];
        var aktiv = trin.findIndex(function (t) { return !t[1]; });
        return '<p class="maal-tekst">Er molekylet E, Z eller uden E/Z-isomeri?</p><ol class="trinliste">' +
            trin.map(function (t, i) {
                return '<li class="' + (t[1] ? "ok" : (i === aktiv ? "aktiv" : "")) + '">' + NK.html(t[0]) + (t[1] ? " ✓" : "") + "</li>";
            }).join("") + "</ol>";
    };

    P.trinLinje = function () {
        var o = this.o;
        if (o.slags === "byg") {
            return this.pos.some(function (x) { return !x; }) ?
                "Træk grupper hen på de fire pladser på tavlen. Tryk Tjek molekylet, når det er bygget." :
                "Tryk Tjek molekylet, når du er klar.";
        }
        if (this.side.v === null) return "Klik på den gruppe, der har højest prioritet på det venstre C-atom.";
        if (this.side.h === null) return "Klik nu på den gruppe, der har højest prioritet på det højre C-atom.";
        return "Er molekylet E, Z eller uden E/Z-isomeri? Vælg under tavlen.";
    };

    /* ----- Hinttrappen og Vis svaret ------------------------------------------------- */
    P.trinNu = function () {
        if (this.o.slags === "byg") return "byg";
        if (this.side.v === null) return "v";
        if (this.side.h === null) return "h";
        return "svar";
    };

    P.hintTrin = function () {
        var t = this.trinNu();
        if (t === "byg") return EZ.hintByg(this.o);
        if (t === "v" || t === "h") return EZ.hintSide(this.pos, t);
        return EZ.hintSvar(this.r);
    };

    P.visSvar = function () {
        var t = this.trinNu();
        if (t === "byg") {
            this.pos = this.o.facit.slice();
            var res = EZ.tjekByg(this.o, this.pos);
            this.r = res.r;
            this.loest(res.tekst);
            return;
        }
        if (t === "v" || t === "h") { this.findVinder(t, true); return; }
        this.svarEZ(this.r.type, true);
    };

    /* ----- Afgoer: vinderen paa hver side ----------------------------------------------- */
    P.findVinder = function (side, vist) {
        var r = this.r;
        this.side[side] = side === "v" ? (r.ensV ? "ens" : r.v) : (r.ensH ? "ens" : r.h);
        this.zVist[side] = true;
        this.forkert = null;
        var i = side === "v" ? 0 : 2;
        var tekst = EZ.hvorfor(this.pos[i], this.pos[i + 1]);
        if (this.side[side] === "ens") tekst += " Så er der ingen E/Z-isomeri.";
        this.visKort();
        this.nulstilHjaelp();
        if (vist) this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(tekst) + " " + NK.html(this.trinLinje()), "gul");
        else this.godLinje(tekst);
    };

    P.klikGruppe = function (i) {
        var o = this.o, r = this.r;
        if (this.faerdig) return;
        var side = i < 2 ? "v" : "h";
        var navn = side === "v" ? "venstre" : "højre";
        if (this.side[side] !== null) {
            this.kortBesked("Det " + navn + " C-atom er afgjort. " + this.trinLinje(), 4);
            return;
        }
        var ens = side === "v" ? r.ensV : r.ensH;
        var vinder = side === "v" ? r.v : r.h;
        if (ens || i === vinder) { this.findVinder(side, false); return; }
        this.forkert = i;
        this.zVist[side] = true;
        var j = side === "v" ? 0 : 2;
        var a = this.pos[j], b = this.pos[j + 1];
        var info = EZ.hintSide(this.pos, side)[1];
        var stoerrelse = EZ.foersteAtom(a, b) && D.tekst(this.pos[i]).length > D.tekst(this.pos[vinder]).length + 1 ?
            " Det er ikke gruppens størrelse, der tæller, men atomnummeret på det atom, der sidder på C-atomet." : "";
        this.fejlLinje(D.tekst(this.pos[i]) + " har ikke højest prioritet. " + info + stoerrelse);
    };

    P.svarEZ = function (svar, vist) {
        if (this.faerdig || this.o.slags !== "afgoer") return;
        var r = this.r;
        if (svar === r.type) {
            this.side.v = r.ensV ? "ens" : r.v;
            this.side.h = r.ensH ? "ens" : r.h;
            this.zVist = { v: true, h: true };
            this.forkert = null;
            this.svar = svar;
            this.stempelT = 0.001;
            this.markerValg(svar, true);
            this.loest(EZ.dom(r));
            return;
        }
        this.markerValg(svar, false);
        this.fejlLinje(EZ.fejl(r, svar));
    };

    P.markerValg = function (svar, rigtig) {
        var k = this.knapper[svar];
        for (var n in this.knapper) this.knapper[n].classList.remove("forkert");
        if (!k) return;
        k.classList.add(rigtig ? "rigtig" : "forkert");
    };

    /* ----- Byg selv -------------------------------------------------------------------- */
    P.saet = function (i, id) {
        if (this.faerdig) return;
        this.pos[i] = id;
        this.nulstilHjaelp();
        if (this.pos.every(function (x) { return x === "H"; })) this.kortBesked(D.ETHEN, 6);
        else this.naesteLinje("", "");
    };

    P.tjek = function () {
        if (this.faerdig || this.o.slags !== "byg") return;
        var res = EZ.tjekByg(this.o, this.pos);
        if (res.ok) {
            this.r = res.r;
            this.stempelT = 0.001;
            this.loest(res.tekst);
        } else {
            this.fejlLinje(res.tekst);
        }
    };

    P.enter = function () {
        if (this.o.slags === "byg") this.tjek();
    };

    P.tast = function (k) {
        if (this.o.slags !== "afgoer") return false;
        var m = { e: "E", z: "Z", i: "ingen" }[k.toLowerCase()];
        if (!m) return false;
        this.svarEZ(m);
        return true;
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        var L = this.L, baand = this.baand();
        var valgH = 62, paletH = this.o && this.o.slags === "byg" ? 74 : 0;
        var top = 14, side = 18;
        /* Tavlen flytter sig ikke, naar statuslinjen faar en linje mere */
        var bund = this.L.h - Math.max(baand.h, 92) - valgH - paletH - 6;
        var tavle = { x: side, y: top, b: L.b - side * 2, h: Math.max(200, bund - top) };
        var u = Math.min(tavle.b * 0.15, tavle.h * 0.26);
        this.lay = { tavle: tavle, cx: tavle.x + tavle.b / 2, cy: tavle.y + tavle.h / 2 + 4, u: u };
        this.lay.palet = { y: tavle.y + tavle.h + 10 + paletH / 2, h: paletH };
        this.valg.style.bottom = (baand.h + 10) + "px";
        this.saetAnker("tavle", tavle.x, tavle.y, tavle.b, tavle.h);
        this.saetAnker("palet", side, tavle.y + tavle.h + 6, L.b - side * 2, paletH);
        this.bygPalet();
    };

    P.bygPalet = function () {
        this.palet = [];
        if (!this.o || this.o.slags !== "byg") return;
        var ctx = this.L.ctx, fs = NK.klamp(this.lay.u * 0.2, 15, 20);
        var b = D.PALET.map(function (id) { return T.brikBredde(ctx, id, fs); });
        var mellem = 8, ialt = b.reduce(function (s, x) { return s + x; }, 0) + mellem * (b.length - 1);
        var skala = Math.min(1, (this.L.b - 30) / ialt);
        if (skala < 1) { fs *= skala; b = b.map(function (x) { return x * skala; }); mellem *= skala; ialt *= skala; }
        var x = (this.L.b - ialt) / 2;
        var mig = this;
        D.PALET.forEach(function (id, i) {
            mig.palet.push({ id: id, cx: x + b[i] / 2, cy: mig.lay.palet.y, b: b[i], h: fs * 1.7, fs: fs });
            x += b[i] + mellem;
        });
    };

    /* ----- Musen -------------------------------------------------------------------- */
    P.felter = function () {
        if (!this.lay) return [];
        return this._felter || [];
    };

    P.feltVed = function (pt, ekstra) {
        var f = this.felter();
        for (var i = 0; i < f.length; i++) {
            var x = f[i];
            var m = ekstra || 0;
            if (pt.x >= x.x - m && pt.x <= x.x + x.b + m && pt.y >= x.y - m && pt.y <= x.y + x.h + m) return x.i;
        }
        return null;
    };

    P.brikVed = function (pt) {
        for (var i = 0; i < this.palet.length; i++) {
            var p = this.palet[i];
            if (Math.abs(pt.x - p.cx) <= p.b / 2 && Math.abs(pt.y - p.cy) <= p.h / 2) return p;
        }
        return null;
    };

    P.overScene = function (pt) {
        if (!pt) { this.over = null; return null; }
        this.over = this.feltVed(pt, 6);
        if (this.faerdig) return null;
        if (this.o.slags === "byg") {
            if (this.brikVed(pt)) return "greb";
            if (this.over !== null) return this.pos[this.over] ? "greb" : "peg";
            return null;
        }
        return this.over !== null ? "peg" : null;
    };

    P.nedScene = function (pt) {
        if (this.faerdig || this.o.slags !== "byg") return false;
        var b = this.brikVed(pt);
        if (b) { this.hold = { id: b.id, fra: null, start: pt, pt: pt }; return true; }
        var f = this.feltVed(pt, 6);
        if (f !== null && this.pos[f]) { this.hold = { id: this.pos[f], fra: f, start: pt, pt: pt }; return true; }
        return false;
    };

    P.flytScene = function (pt) {
        if (!this.hold) return;
        this.hold.pt = pt;
        this.over = this.feltVed(pt, 22);
    };

    P.opScene = function (pt) {
        var h = this.hold;
        this.hold = null;
        if (!h) return;
        var flyttet = Math.hypot(pt.x - h.start.x, pt.y - h.start.y);
        if (flyttet < 6) {
            /* Et klik: brikken i paletten gaar paa den foerste tomme plads,
               og en plads skifter til den naeste gruppe */
            if (h.fra === null) {
                var tom = this.pos.indexOf(null);
                if (tom >= 0) this.saet(tom, h.id);
                else this.kortBesked("Alle fire pladser er fyldt. Træk " + D.tekst(h.id) + " hen på den plads, den skal stå på.", 4);
            } else {
                var k = D.PALET.indexOf(this.pos[h.fra]);
                this.saet(h.fra, D.PALET[(k + 1) % D.PALET.length]);
            }
            return;
        }
        var maal = this.feltVed(pt, 22);
        if (maal === null) {
            if (h.fra !== null) this.saet(h.fra, null);   /* trukket af tavlen: pladsen bliver tom */
            return;
        }
        if (h.fra === null) { this.saet(maal, h.id); return; }
        if (maal === h.fra) return;
        var andet = this.pos[maal];
        this.pos[maal] = h.id;
        this.saet(h.fra, andet);
    };

    P.klikScene = function (pt) {
        if (this.o.slags !== "afgoer") return;
        var f = this.feltVed(pt, 6);
        if (f !== null) { this.klikGruppe(f); return; }
        if (!this.faerdig) this.kortBesked("Klik på en af de fire grupper på tavlen.", 3);
    };

    /* ----- Tiden og tegningen ---------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        if (this.stempelT > 0) this.stempelT = Math.min(1, this.stempelT + dt);
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay, o = this.o;
        L.ryd("#14141a");
        T.tavle(ctx, lay.tavle, this.faerdig ? "rgba(95,207,146,0.75)" : null);

        var opt = { ring: {}, zTal: {}, naeste: {}, over: this.faerdig ? null : this.over };
        var r = this.r;
        var mig = this;
        var trin = this.trinNu();
        if (o.slags === "afgoer") {
            ["v", "h"].forEach(function (s) {
                var j = s === "v" ? 0 : 2;
                var hintHer = trin === s && mig.hjaelp >= 2;
                if (mig.zVist[s] || hintHer) {
                    opt.zTal[j] = opt.zTal[j + 1] = true;
                    if (!EZ.foersteAtom(mig.pos[j], mig.pos[j + 1])) opt.naeste[j] = opt.naeste[j + 1] = true;
                }
                if (mig.side[s] === "ens") { opt.ring[j] = opt.ring[j + 1] = T.GUL; }
                else if (mig.side[s] !== null) opt.ring[mig.side[s]] = T.GROEN;
            });
            if (this.forkert !== null) opt.ring[this.forkert] = T.ROED;
            if (r.type !== "ingen" && (this.faerdig || (trin === "svar" && this.hjaelp >= 2))) {
                opt.linje = [r.v, r.h];
            }
        } else if (this.faerdig && r) {
            opt.zTal = { 0: true, 1: true, 2: true, 3: true };
            if (r.type !== "ingen") { opt.ring[r.v] = T.GROEN; opt.ring[r.h] = T.GROEN; opt.linje = [r.v, r.h]; }
            else { var s0 = r.ensV ? 0 : 2; opt.ring[s0] = opt.ring[s0 + 1] = T.GUL; }
        }
        if (this.hold && this.hold.fra !== null) opt.skjul = this.hold.fra;

        var res = T.formel(ctx, lay, this.pos, opt);
        this._felter = res.felter;

        /* Stemplet: E, Z eller Ingen */
        if (this.faerdig && r && this.stempelT > 0) {
            var t = r.type === "ingen" ? "Ingen E/Z" : r.type;
            T.stempel(ctx, lay.tavle.x + lay.tavle.b - 90, lay.tavle.y + 52, t, T.GROEN, this.stempelT, r.type === "ingen" ? 22 : 36);
        }
        /* Venstre og hoejre C-atom */
        NK.tekst(ctx, this.o.navn, lay.tavle.x + 24, lay.tavle.y + 36, { font: "700 17px 'Segoe UI', sans-serif", farve: "#9fb1a9" });

        /* Paletten og brikken, der holdes */
        if (o.slags === "byg") {
            this.palet.forEach(function (p) {
                T.brik(ctx, p.cx, p.cy, p.id, { fs: p.fs, alfa: mig.faerdig ? 0.4 : 1 });
            });
            if (this.hold) {
                T.brik(ctx, this.hold.pt.x, this.hold.pt.y, this.hold.id, { fs: 22, skygge: true, over: this.over !== null });
            }
        }
    };

    P.fokusFelt = function () { /* ingen felter */ };

    NK.SimPrioritet = SimPrioritet;
}());
