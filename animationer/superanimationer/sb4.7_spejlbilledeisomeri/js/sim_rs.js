/* =====================================================================
   sim_rs.js - fane 3: R eller S

   Kuglemodellen fra den gamle b6.2, men eleven goer det selv, i tre bidder:
     1. Giv grupperne nummer: klik paa dem i prioritetens raekkefoelge.
        Den sidste faar nummer 4 af sig selv.
     2. Drej molekylet, saa gruppe 4 peger vaek. Taet paa klikker det paa
        plads (den gamle Auto-orienter er nu Vis svaret i dette trin).
     3. R eller S: gaar 1 > 2 > 3 med eller mod uret?
   Raekkefoelgen er ikke laast. Et rigtigt svar godtages, naar som helst,
   og et forkert faar en besked, der passer til, hvor eleven er.

   Hver gang opgaven begynder, er det tilfaeldigt, om molekylet er R eller
   S, og hvordan det er drejet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.T;
    var R = NK.Rum;
    var Q = R.Q;
    var K = NK.Kiral;

    function SimRS() {
        var mig = this;
        this.valg = NK.el("rs-valg");
        this.startFane(D.RS, D.RS_GRUPPER);
        this.vaelg(0);
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimRS.prototype;
    NK.Fane.paa(P, { navn: "rs" });

    P.chipTekst = function (o, i) { return String(i + 1); };

    /* En tilfaeldig drejning, hvor gruppe 4 hverken peger vaek eller lige mod en */
    function startDrejning(grupper) {
        var o = K.raekkefoelge(grupper);
        for (var n = 0; n < 200; n++) {
            var q = Q.norm([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1]);
            var r = R.retninger(q);
            if (r[o[3]][2] < 0.15 && r[o[3]][2] > -0.6 && Math.abs(r[o[3]][0]) > 0.35) return q;
        }
        return Q.akse([1, 0.3, 0], 0.8);
    }

    /* ----- Opgaven ------------------------------------------------------------------- */
    P.lavOpgave = function (i, fast) {
        var o = this.opgaver[i];
        this.o = o;
        this.m = D.MOL[o.mol];
        this.grupper = this.m.g.slice();
        var vil = fast || (Math.random() < 0.5 ? "R" : "S");
        if (K.rs(this.grupper, R.BASIS) !== vil) { var t = this.grupper[1]; this.grupper[1] = this.grupper[2]; this.grupper[2] = t; }
        this.orden = K.raekkefoelge(this.grupper);
        this.q = startDrejning(this.grupper);
        this.maalQ = null;
        this.tal = {};
        this.naesteTal = 1;
        this.forkertTal = null;
        this.drejOK = false;
        this.svar = null;
        this.hold = null;
        this.over = null;
        this.pilT = 0;
        this.bygValg();
    };

    P.facit = function () { return K.rs(this.grupper, R.BASIS); };

    P.bygValg = function () {
        var mig = this;
        this.valg.innerHTML = "";
        this.knapper = {};
        [["R", "R  (med uret)"], ["S", "S  (mod uret)"]].forEach(function (x) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap";
            k.textContent = x[1];
            k.title = "Tast " + x[0];
            k.addEventListener("click", function () { mig.svarRS(x[0]); mig.fokus(); });
            mig.valg.appendChild(k);
            mig.knapper[x[0]] = k;
        });
    };

    P.trinNu = function () {
        if (this.naesteTal <= 4) return "tal";
        if (!this.drejOK) return "drej";
        return "svar";
    };

    P.promptHTML = function () {
        var trin = [
            ["Giv grupperne nummer efter prioritet", this.naesteTal > 4],
            ["Drej, så gruppe 4 peger væk fra dig", this.drejOK],
            ["Går 1 → 2 → 3 med uret (R) eller mod uret (S)?", this.faerdig]
        ];
        var aktiv = trin.findIndex(function (t) { return !t[1]; });
        return '<p class="maal-tekst">Er det (R)- eller (S)-' + NK.html(this.m.navn) + "?</p>" +
            '<ol class="trinliste">' + trin.map(function (t, i) {
                return '<li class="' + (t[1] ? "ok" : (i === aktiv ? "aktiv" : "")) + '">' + NK.html(t[0]) + (t[1] ? " ✓" : "") + "</li>";
            }).join("") + "</ol>";
    };

    P.trinLinje = function () {
        var t = this.trinNu();
        if (t === "tal") return this.naesteTal === 1 ? "Klik på den gruppe, der har højest prioritet. Den får nummer 1." : "Klik på den gruppe, der får nummer " + this.naesteTal + ".";
        if (t === "drej") return "Træk i molekylet, så gruppe 4 (" + D.tekst(this.grupper[this.orden[3]]) + ") peger væk fra dig.";
        return "Følg 1 → 2 → 3. Vælg R eller S under molekylet.";
    };

    /* ----- Hinttrappen og Vis svaret ------------------------------------------------- */
    P.hintTrin = function () {
        var t = this.trinNu(), g = this.grupper, mig = this;
        if (t === "tal") {
            var rest = [0, 1, 2, 3].filter(function (i) { return mig.tal[i] === undefined; });
            var naeste = this.orden[this.naesteTal - 1];
            var t2 = "Tilbage: " + K.tilbageTekst(g, rest) + ".";
            if (K.uafgjortVedFoerste(g, rest)) {
                var c = rest.filter(function (i) { return D.Z[D.G[g[i]].atom] === D.Z[D.G[g[naeste]].atom]; });
                if (c.length > 1) t2 += " " + K.hvorfor(g[c[0]], g[c[1]]);
            }
            return [
                "Den gruppe, hvis første atom har det højeste atomnummer, får nummer " + this.naesteTal + ".",
                t2,
                "Klik på " + D.tekst(g[naeste]) + ". Den får nummer " + this.naesteTal + "."
            ];
        }
        if (t === "drej") {
            var t4 = D.tekst(g[this.orden[3]]);
            return [
                "Drej molekylet, så gruppe 4 (" + t4 + ") peger væk fra dig, ind i skærmen.",
                "Når 4 peger lige væk, gemmer " + t4 + " sig bag C-atomet, og de tre andre står i en trekant rundt om det.",
                "Træk langsomt. Er " + t4 + " tæt på at pege væk, klikker molekylet selv på plads."
            ];
        }
        var f = this.facit();
        return [
            "Følg grupperne rundt om C-atomet i rækkefølgen 1 → 2 → 3.",
            "Med uret er R (rectus). Mod uret er S (sinister).",
            "1 → 2 → 3 går " + (f === "R" ? "med uret. Det er R." : "mod uret. Det er S.")
        ];
    };

    P.visSvar = function () {
        var t = this.trinNu();
        if (t === "tal") { this.giv(this.orden[this.naesteTal - 1], true); return; }
        if (t === "drej") { this.maalQ = this.vaekDrejning(); this.auto = true; return; }
        this.svarRS(this.facit(), true);
    };

    /* ----- Nummereringen ---------------------------------------------------------------- */
    P.giv = function (i, vist) {
        var g = this.grupper, mig = this;
        if (this.tal[i] !== undefined) { this.kortBesked(D.tekst(g[i]) + " har allerede nummer " + this.tal[i] + ".", 3); return; }
        var rigtig = this.orden[this.naesteTal - 1];
        if (i !== rigtig) {
            this.forkertTal = i;
            var rest = [0, 1, 2, 3].filter(function (x) { return mig.tal[x] === undefined; });
            var tekst = D.tekst(g[i]) + " får ikke nummer " + this.naesteTal + ". ";
            if (D.G[g[i]].atom === D.G[g[rigtig]].atom) tekst += K.hvorfor(g[rigtig], g[i]).replace(/ slår .*$/, "") + " Se, hvilken der vinder.";
            else tekst += "Tilbage: " + K.tilbageTekst(g, rest) + ". Det højeste atomnummer vinder.";
            this.fejlLinje(tekst);
            return;
        }
        this.forkertTal = null;
        this.tal[i] = this.naesteTal++;
        var besked = D.tekst(g[i]) + " får nummer " + this.tal[i] + ".";
        if (this.naesteTal === 4) {
            var sidste = this.orden[3];
            this.tal[sidste] = 4;
            this.naesteTal = 5;
            besked += " " + D.tekst(g[sidste]) + " er tilbage og får nummer 4.";
        }
        this.nulstilHjaelp();
        this.visKort();
        if (vist) this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(besked + " " + this.trinLinje()), "gul");
        else this.godLinje(besked);
    };

    /* ----- Drejningen ------------------------------------------------------------------- */
    /* Den mindste drejning, der vender gruppe 4 lige vaek (z ind i skaermen) */
    P.vaekDrejning = function () {
        var v = R.retninger(this.q)[this.orden[3]];
        var akse = R.kryds(v, [0, 0, 1]);
        var vink = Math.acos(NK.klamp(v[2], -1, 1));
        if (Math.hypot(akse[0], akse[1], akse[2]) < 1e-6) akse = [1, 0, 0];
        return Q.norm(Q.gange(Q.akse(akse, vink), this.q));
    };

    P.tjekDrej = function () {
        var r = R.retninger(this.q);
        if (!this.drejOK && r[this.orden[3]][2] > 0.9) {
            this.maalQ = this.vaekDrejning();
        }
    };

    /* ----- R eller S -------------------------------------------------------------------- */
    P.svarRS = function (s, vist) {
        if (this.faerdig) return;
        var f = this.facit(), mig = this;
        if (s === f) {
            this.orden.forEach(function (i, n) { mig.tal[i] = n + 1; });
            this.naesteTal = 5;
            if (!this.drejOK) { this.maalQ = this.vaekDrejning(); }
            this.drejOK = true;
            this.svar = s;
            this.knapper[s].classList.add("rigtig");
            this.pilT = 0.001;
            this.loest("1 → 2 → 3 går " + (s === "R" ? "med uret" : "mod uret") + ", når 4 peger væk. Det er (" + s + ")-" + this.m.navn + ".");
            void vist;
            return;
        }
        this.knapper[s].classList.add("forkert");
        var r4 = R.retninger(this.q)[this.orden[3]][2];
        if (this.naesteTal <= 4) this.fejlLinje("Giv først grupperne nummer efter prioritet. Ellers ved du ikke, hvilken vej du skal følge.");
        else if (r4 < -0.5) this.fejlLinje("Gruppe 4 peger mod dig. Så ser du rundt den modsatte vej. Drej, så 4 peger væk fra dig.");
        else if (!this.drejOK) this.fejlLinje("Drej først molekylet, så gruppe 4 peger væk fra dig. Så kan du se, hvilken vej 1 → 2 → 3 går.");
        else this.fejlLinje("Følg 1 → 2 → 3 igen. Med uret er R, mod uret er S.");
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        var L = this.L, baand = this.baand();
        var top = 14, bund = L.h - Math.max(baand.h, 92) - 62 - 4;
        var h = Math.max(200, bund - top);
        this.lay = { top: top, bund: bund, h: h, cx: L.b / 2, cy: top + h * 0.52, s: Math.min(L.b * 0.15, h * 0.24) };
        this.valg.style.bottom = (baand.h + 10) + "px";
        this.saetAnker("molekyle", L.b * 0.15, top, L.b * 0.7, h);
    };

    P.kam = function () { return { cx: this.lay.cx, cy: this.lay.cy, s: this.lay.s, f: 8 }; };
    P.model = function () { return { g: this.grupper, q: this.q }; };

    /* ----- Musen -------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (!pt) { this.over = null; return null; }
        var k = R.ramt(this.model(), this.kam(), pt);
        this.over = k && k.i >= 0 ? k.i : null;
        if (this.faerdig) return null;
        if (this.over !== null && this.naesteTal <= 4) return "peg";
        return "greb";
    };

    P.nedScene = function (pt) {
        if (this.faerdig || this.auto) return false;
        this.hold = { start: pt, sidst: pt, flyttet: 0 };
        return true;
    };

    P.flytScene = function (pt) {
        var h = this.hold;
        if (!h || this.faerdig) return;
        var dx = pt.x - h.sidst.x, dy = pt.y - h.sidst.y;
        h.sidst = pt;
        h.flyttet = Math.max(h.flyttet, Math.hypot(pt.x - h.start.x, pt.y - h.start.y));
        if (h.flyttet < 4) return;
        var dq = Q.gange(Q.akse([0, 1, 0], -dx * 0.011), Q.akse([1, 0, 0], dy * 0.011));
        this.q = Q.norm(Q.gange(dq, this.q));
        this.maalQ = null;
        if (this.drejOK && R.retninger(this.q)[this.orden[3]][2] < 0.85) {
            this.drejOK = false;
            this.visKort();
            this.naesteLinje("", "");
        }
    };

    P.opScene = function (pt) {
        var h = this.hold;
        this.hold = null;
        if (!h) return;
        if (h.flyttet < 4) {
            var k = R.ramt(this.model(), this.kam(), pt);
            if (!k) return;
            if (k.i < 0) { this.kortBesked("Det asymmetriske C-atom. Det har fire forskellige grupper.", 3); return; }
            if (this.naesteTal <= 4) this.giv(k.i);
            else this.kortBesked(D.tekst(this.grupper[k.i]) + " har nummer " + this.tal[k.i] + ". Træk for at dreje.", 3);
            return;
        }
        this.tjekDrej();
    };

    /* ----- Tiden og tegningen ---------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        if (this.maalQ) {
            this.q = Q.mod(this.q, this.maalQ, this.auto ? 3.5 : 8, dt);
            if (Q.vinkel(this.q, this.maalQ) < 0.004) {
                this.q = this.maalQ;
                this.maalQ = null;
                this.auto = false;
                if (!this.drejOK) {
                    this.drejOK = true;
                    this.visKort();
                    this.nulstilHjaelp();
                    if (!this.faerdig) this.godLinje("Gruppe 4 peger væk fra dig.");
                }
                this.visKnap();
            }
        }
        if (this.pilT > 0) this.pilT = Math.min(1, this.pilT + dt * 0.9);
    };

    P.efterOpgave = function () { this.visKnap(); };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay, mig = this;
        L.ryd("#14141a");
        NK.tekst(ctx, D.navn(this.m), lay.cx, lay.top + 24, { font: "700 19px 'Segoe UI', sans-serif", farve: "#cfd6de", justering: "center" });
        var ring = {};
        if (this.forkertTal !== null) ring[this.forkertTal] = T.ROED;
        var kug = R.tegn(ctx, this.model(), this.kam(), { tal: this.tal, ring: ring, over: this.faerdig ? null : this.over });
        if (this.drejOK && !this.maalQ) {
            NK.tekst(ctx, "4 peger væk fra dig", lay.cx, lay.bund - 6, { font: "600 15px 'Segoe UI', sans-serif", farve: "#7ee0a8", justering: "center" });
        } else if (!this.faerdig && this.naesteTal > 4) {
            NK.tekst(ctx, "↔  træk for at dreje  ↕", lay.cx, lay.bund - 6,
                { font: "600 15px 'Segoe UI', sans-serif", farve: "rgba(242,197,61," + (0.55 + 0.4 * Math.sin(this.tid * 3)) + ")", justering: "center" });
        }
        if (this.faerdig && this.svar && !this.maalQ) this.tegnPil(ctx, kug);
    };

    /* Buen 1 > 2 > 3 rundt om C-atomet og det store bogstav (som i den gamle) */
    P.tegnPil = function (ctx, kug) {
        var mig = this, lay = this.lay;
        var pos = [0, 1, 2].map(function (n) {
            var i = mig.orden[n];
            return kug.filter(function (u) { return u.i === i; })[0];
        });
        var midt = kug.filter(function (u) { return u.i === -1; })[0];
        var vink = pos.map(function (p) { return Math.atan2(p.y - midt.y, p.x - midt.x); });
        var radius = pos.reduce(function (s, p) { return s + Math.hypot(p.x - midt.x, p.y - midt.y); }, 0) / 3 * 0.62;
        var medUret = this.svar === "R";
        /* Fra 1 rundt forbi 2 til 3 i den rigtige retning */
        function frem(a, b) { var d = b - a; while (d <= 0) d += Math.PI * 2; return d; }
        var span = medUret ? frem(vink[0], vink[2]) : frem(vink[2], vink[0]);
        var t = NK.blod(this.pilT);
        var start = vink[0], slut = medUret ? start + span * t : start - span * t;
        var farve = medUret ? "#5fcf92" : "#7fc4ef";
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(midt.x, midt.y, radius, start, slut, !medUret);
        ctx.stroke();
        var tan = slut + (medUret ? Math.PI / 2 : -Math.PI / 2);
        var ex = midt.x + Math.cos(slut) * radius, ey = midt.y + Math.sin(slut) * radius;
        ctx.beginPath();
        ctx.moveTo(ex + Math.cos(tan) * 14, ey + Math.sin(tan) * 14);
        ctx.lineTo(ex + Math.cos(tan + 2.5) * 14, ey + Math.sin(tan + 2.5) * 14);
        ctx.lineTo(ex + Math.cos(tan - 2.5) * 14, ey + Math.sin(tan - 2.5) * 14);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 0.9 * t;
        ctx.font = "800 " + Math.round(lay.s * 0.9) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 6;
        ctx.strokeStyle = "rgba(10,10,16,0.85)";
        ctx.strokeText(this.svar, lay.cx + lay.s * 2.1, lay.cy);
        ctx.fillText(this.svar, lay.cx + lay.s * 2.1, lay.cy);
        ctx.restore();
    };

    P.fokusFelt = function () { };

    NK.SimRS = SimRS;
}());
