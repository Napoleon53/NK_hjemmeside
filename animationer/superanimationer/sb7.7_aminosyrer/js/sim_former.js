/* =====================================================================
   sim_former.js - fane 1: Tre former

   Tre trin med valin (D.FORMER):
     1 amfoion  eleven traekker hydronen fra −COOH over til −NH₂, og
                spoergsmaalet er amfoionens samlede ladning (0)
     2 sur      saltsyre: eleven klikker paa den gruppe, der optager en
                hydron (−COO⁻), og en oxoniumion afleverer den
     3 basisk   natriumhydroxid: foerst afgiver −COOH sin hydron til en
                hydroxidion (pH 1 til 7), saa klikker eleven paa den gruppe,
                der afgiver en hydron, naar pH stiger til 13 (−NH₃⁺)
   Bagefter er pH-skyderen fri, og valin skifter form efter pH.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Mol;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.7-former";

    var IND = 0.7, FLYT = 0.55, UD = 0.65;     /* reaktionen med oxoniumionen eller hydroxidionen */
    var SELV = 0.4;                            /* den traekkede hydron glider paa plads */
    var GNIST = 0.5;                           /* en hydron, der kommer eller gaar (fri skyder) */

    function SimFormer() {
        var mig = this;
        this.trinListe = D.FORMER;
        this.aa = D.VALIN;
        this.hentStatus();
        this.startFane();
        NK.el("f-forfra").addEventListener("click", function () { mig.forfra(); });
    }

    var P = SimFormer.prototype;
    F.paa(P, "f");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };
    P.naesteUloeste = function () { return 0; };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        this.trinListe.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) || mig.faerdig ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + NK.html(t.navn) + "</span></li>";
        });
        NK.saetHTML("f-trin", html);
        NK.saetTekst("f-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.fri = false;
        this.sejrT = null;
        this.reak = null;
        this.gnister = [];
        this.ph = 7;
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        var mig = this;
        if (this.reak) this.slutReak();
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.valgt = null;
        this.valgtGruppe = null;
        this.forkert = {};
        this.groen = null;
        this.haand = null;
        this.flyv = null;
        this.besked("", "");
        if (j === 0) {
            this.tilst = { amino: 0, carboxyl: 1 };
            this.visLadning = false;
            this.ph = 7;
            this.fase = "traek";
        } else if (j === 1) {
            this.tilst = { amino: 1, carboxyl: 0 };
            this.visLadning = true;
            this.ph = 7;
            this.fase = "klik";
        } else {
            this.tilst = { amino: 1, carboxyl: 1 };
            this.visLadning = true;
            this.fase = "anim";
            this.startReak(this.trin.for, this.trin.for.gruppe, function () { mig.fase = "klik"; mig.visKort(); mig.nulstilHjaelp(); });
        }
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var mig = this, t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fase === "traek") return { slags: "opgave", chip: chip, tekst: t.traekTekst };
        if (this.fase === "anim") return { slags: "opgave", chip: chip, tekst: t.forTekst };
        if (this.fase === "spm") {
            return { slags: "spm", chip: chip, tekst: t.tekst,
                     svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
        }
        return { slags: "spm", chip: chip, tekst: t.tekst };
    };

    P.skjulIndsend = function () { return this.fase === "traek" || this.fase === "anim"; };
    P.skjulHint = function () { return this.fase === "anim"; };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.fase === "spm") return this.valgt !== null;
        if (this.fase === "klik") return this.valgtGruppe !== null;
        return false;
    };
    P.indsendTekst = function () {
        if (this.fase === "klik" && this.valgtGruppe) return "Indsend svar: " + D.GRUPPE_TEKST[this.valgtGruppe][this.tilst[this.valgtGruppe]];
        return "Indsend svar";
    };
    P.ingentingTekst = function () {
        return this.fase === "klik" ? "Klik på en af de to grupper i formlen først." : "Vælg et af svarene på kortet først.";
    };

    P.indsend = function () { this.bedoem(false); };

    P.bedoem = function (vist) {
        var mig = this, t = this.trin, ok, valg;
        if (this.fase === "spm") { valg = this.valgt; ok = valg === t.rigtig; }
        else if (this.fase === "klik") { valg = this.valgtGruppe; ok = valg === t.rigtig; }
        else return;
        if (!ok) {
            this.fejl = true;
            this.forkert[valg] = true;
            if (this.fase === "spm") this.valgt = null; else this.valgtGruppe = null;
            this.visKort();
            this.fejlLinje(t.fejl[valg]);
            return;
        }
        var sidste = this.trinNr === this.trinListe.length - 1, tekst = t.forkl, foerste = false;
        if (this.fase === "spm") this.visLadning = true;
        if (this.fase === "klik") {
            this.startReak(t.reak, t.rigtig, sidste ? function () { mig.fri = true; } : null);
            this.valgtGruppe = null;
        }
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            tekst += " " + D.FORMER_FAERDIG;
        }
        this.groen = { spm: true, svarNr: this.fase === "spm" ? t.rigtig : undefined, maade: vist || this.sv ? "svar" : "selv", tekst: tekst,
                       knap: sidste ? "Videre til Fordelingsdiagrammet →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-f").querySelector(".scene"), 60);
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

    P.nulstil = function () { if (!this.groen && !this.reak) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen) return [];
        if (this.fase === "traek") return this.trin.traekHint;
        if (this.fase === "spm" || this.fase === "klik") return this.trin.hint;
        return [];
    };

    P.visSvar = function () {
        this.sv = true;
        if (this.fase === "traek") {
            /* Hydronen flyver selv over til aminogruppen */
            var h = this.kasser && this.kasser.hydron;
            this.haand = null;
            this.flyv = { fra: h ? { x: h.cx, y: h.cy } : { x: this.mol.x, y: this.mol.y }, t: 0, hjem: false };
            return;
        }
        if (this.fase === "spm") this.valgt = this.trin.rigtig;
        else this.valgtGruppe = this.trin.rigtig;
        this.bedoem(true);
    };

    /* ----- Reaktionen med oxoniumionen eller hydroxidionen ------------------------------- */
    P.startReak = function (r, gruppe, efter) {
        this.reak = { slags: r.slags, partner: r.partner, gruppe: gruppe, ph0: r.ph0, ph1: r.ph1, t: 0, skiftet: false, efter: efter || null };
        this.ph = r.ph0;
    };

    P.skiftReak = function () {
        var r = this.reak;
        if (r.skiftet) return;
        r.skiftet = true;
        this.tilst[r.gruppe] = r.slags === "giv" ? 1 : 0;
    };

    P.slutReak = function () {
        var r = this.reak;
        if (!r) return;
        this.skiftReak();
        this.ph = r.ph1;
        this.reak = null;
        if (r.efter) r.efter.call(this);
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        if (this.reak) {
            var r = this.reak;
            r.t += dt;
            this.ph = NK.lerp(r.ph0, r.ph1, NK.blod(r.t / (IND + FLYT + UD)));
            if (r.t >= (r.slags === "giv" ? IND + FLYT : IND)) this.skiftReak();
            if (r.t >= IND + FLYT + UD) this.slutReak();
        }
        /* Den traekkede hydron glider paa plads eller tilbage */
        if (this.flyv) {
            this.flyv.t += dt;
            if (this.flyv.t >= SELV) {
                var hjem = this.flyv.hjem;
                this.flyv = null;
                if (!hjem) {
                    this.tilst = { amino: 1, carboxyl: 0 };
                    this.fase = "spm";
                    this.nulstilHjaelp();
                    this.visKort();
                }
            }
        }
        this.gnister.forEach(function (g) { g.t += dt; });
        this.gnister = this.gnister.filter(function (g) { return g.t < GNIST; });
        void mig;
    };

    /* ----- pH-skyderen naar fanen er gennemfoert ----------------------------------------- */
    P.saetPh = function (ph) {
        var mig = this;
        ph = Math.round(ph / D.PH_SKRIDT) * D.PH_SKRIDT;
        this.ph = ph;
        var nyT = D.tilstand(this.aa, ph);
        ["amino", "carboxyl"].forEach(function (g) {
            if (nyT[g] !== mig.tilst[g]) {
                mig.gnister.push({ gruppe: g, ind: nyT[g] === 1, t: 0 });
                mig.tilst[g] = nyT[g];
            }
        });
    };

    /* ----- Musen --------------------------------------------------------------------- */
    function inde(k, pt, m) {
        m = m || 0;
        return k && pt && pt.x > k.x - m && pt.x < k.x + k.w + m && pt.y > k.y - m && pt.y < k.y + k.h + m;
    }

    P.gruppeVed = function (pt) {
        if (!this.kasser) return null;
        if (inde(this.kasser.amino, pt, 8)) return "amino";
        if (inde(this.kasser.carboxyl, pt, 8)) return "carboxyl";
        return null;
    };

    P.overScene = function (pt) {
        if (!pt) return null;
        if (T.paaSkala(this.skala, pt)) return this.fri ? "ew-resize" : "not-allowed";
        if (this.groen) return null;
        if (this.fase === "traek" && !this.flyv && inde(this.kasser && this.kasser.hydron, pt, 8)) return "grab";
        if (this.fase === "klik" && this.gruppeVed(pt)) return "pointer";
        return null;
    };

    P.nedScene = function (pt) {
        if (T.paaSkala(this.skala, pt)) {
            if (!this.fri) return false;
            this.grebSkyder = true;
            this.saetPh(T.xTilPh(this.skala, pt.x));
            return true;
        }
        if (this.groen || this.reak) return false;
        if (this.fase === "traek" && !this.flyv && inde(this.kasser && this.kasser.hydron, pt, 8)) {
            this.haand = { x: pt.x, y: pt.y };
            this.nulstilHjaelp();
            return true;
        }
        return false;
    };

    P.flytScene = function (pt) {
        if (this.grebSkyder) { this.saetPh(T.xTilPh(this.skala, pt.x)); return; }
        if (this.haand) { this.haand.x = pt.x; this.haand.y = pt.y; }
    };

    P.opScene = function (pt) {
        if (this.grebSkyder) { this.grebSkyder = false; return; }
        if (!this.haand) return;
        var fra = { x: this.haand.x, y: this.haand.y };
        this.haand = null;
        if (inde(this.kasser.amino, pt, this.fs * 0.8)) {
            this.flyv = { fra: fra, t: 0, hjem: false };
        } else {
            this.flyv = { fra: fra, t: 0, hjem: true };
            this.kortBesked("Slip hydronen på aminogruppen til venstre.", 3.5);
        }
    };

    P.klikScene = function (pt) {
        if (T.paaSkala(this.skala, pt)) {
            if (!this.fri) { this.kortBlink(); this.kortBesked("Skyderen er låst, til de tre trin er løst.", 3); }
            return;
        }
        if (this.spaer()) return;
        if (this.fase === "klik" && !this.reak) {
            var g = this.gruppeVed(pt);
            if (g && !this.forkert[g]) {
                this.valgtGruppe = this.valgtGruppe === g ? null : g;
                this.besked("", "");
                this.visKort();
                return;
            }
        }
        this.kortBlink();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        var fs = Math.round(NK.klamp(Math.min(t.b / 16, (t.h - 100) / 9.2), 18, 36));
        this.fs = fs;
        var fri = Math.max(0, t.h - 96 - 9.2 * fs);
        this.mol = { x: t.x + t.b / 2 + fs * 0.4, y: t.y + 4.2 * fs + fri * 0.45 };
        this.skala = { x: t.x + 70, y: t.y + t.h - 40, b: t.b - 140 };
        this.saetAnker("mol", this.mol.x - 5.6 * fs, this.mol.y - 1.2 * fs, 11.2 * fs, 6.2 * fs);
        this.saetAnker("skyder", this.skala.x - 40, this.skala.y - 48, this.skala.b + 80, 72);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;          /* fanen er skjult og har ingen bredde */
        T.tavle(ctx, lay);
        var fs = this.fs, mol = this.mol, F2 = D.FARVE;

        /* Molekylet. Mens hydronen er i haanden eller flyver, staar −COO⁻ uden H */
        var uden = this.fase === "traek" && (!!this.haand || !!this.flyv);
        if (this.fase === "traek" && !uden && this.kasser && this.kasser.hydron) {
            var kh = this.kasser.hydron, puls = 0.75 + 0.25 * Math.sin(this.tid * 4);
            ctx.save();
            var gh = ctx.createRadialGradient(kh.cx, kh.cy, 2, kh.cx, kh.cy, fs * 0.75);
            gh.addColorStop(0, "rgba(224, 138, 44, " + (0.38 * puls) + ")");
            gh.addColorStop(1, "rgba(224, 138, 44, 0)");
            ctx.fillStyle = gh;
            ctx.beginPath(); ctx.arc(kh.cx, kh.cy, fs * 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        this.kasser = M.tegn(ctx, this.aa, this.tilst, mol.x, mol.y, fs,
            { orangeH: this.fase === "traek", utenH: uden, gloed: this.fase === "traek" && !uden ? 0 : 1 });

        /* Det, eleven kan klikke paa, og valget */
        var k = this.kasser;
        if (!this.groen && this.fase === "klik" && !this.reak) {
            var mig = this;
            ["amino", "carboxyl"].forEach(function (g) {
                var farve = mig.forkert[g] ? T.FORKERT : (mig.valgtGruppe === g ? T.VALG : "#d69e0c");
                T.valgRamme(ctx, k[g], farve, !!mig.forkert[g] || mig.valgtGruppe !== g);
            });
        }
        if (this.fase === "traek" && this.haand) T.valgRamme(ctx, k.amino, "#d69e0c", true);
        if (this.fase === "traek" && !this.haand && !this.flyv && !this.groen && k.hydron) {
            T.skilt(ctx, k.hydron.cx, k.hydron.y - 4, "Træk hydronen", { min: t.x + 6, maks: t.x + t.b - 6 });
        }

        /* Hydronen i haanden eller paa vej */
        var r = fs * 0.5;
        if (this.haand) T.hydron(ctx, this.haand.x, this.haand.y, r);
        if (this.flyv) {
            var u = NK.blod(this.flyv.t / SELV), h = k.hydron, til;
            til = this.flyv.hjem ? (h ? { x: h.cx, y: h.cy } : this.flyv.fra) : { x: k.amino.x + k.amino.w * 0.25, y: k.amino.cy };
            T.hydron(ctx, NK.lerp(this.flyv.fra.x, til.x, u), NK.lerp(this.flyv.fra.y, til.y, u) - Math.sin(u * Math.PI) * fs * 0.8, r);
        }

        /* Oxoniumionen eller hydroxidionen */
        if (this.reak) this.tegnReak(ctx, k);

        /* Hydroner, der kommer og gaar, naar skyderen er fri */
        this.gnister.forEach(function (g) {
            var kk = k[g.gruppe], u2 = g.t / GNIST;
            var y0 = kk.cy, y1 = kk.cy - fs * 1.8;
            var y = g.ind ? NK.lerp(y1, y0, NK.blod(u2)) : NK.lerp(y0, y1, NK.blod(u2));
            T.hydron(ctx, kk.cx, y, r * 0.9, g.ind ? Math.min(1, u2 * 3) : 1 - u2);
        });

        /* Navnet, formen og ladningen under molekylet */
        var yN = mol.y + M.hoejde(this.aa) * fs - fs * 0.62 + fs * 0.95;
        NK.tekst(ctx, "valin", mol.x, yN, { font: "800 " + Math.round(fs * 0.62) + "px " + M.FONT, farve: F2.blaek, justering: "center", linje: "middle" });
        var navn = D.formNavn(this.tilst);
        if (this.visLadning && navn) {
            NK.tekst(ctx, navn, mol.x, yN + fs * 0.85, { font: "800 " + Math.round(fs * 0.56) + "px " + M.FONT, farve: D.formFarve(navn), justering: "center", linje: "middle" });
            NK.tekst(ctx, "samlet ladning " + NK.fortegn(D.tilstandLadning(this.aa, this.tilst)), mol.x, yN + fs * 1.55,
                { font: "700 " + Math.round(fs * 0.5) + "px " + M.FONT, farve: F2.amfo, justering: "center", linje: "middle" });
        }

        T.phSkala(ctx, this.skala, this.ph, { laast: !this.fri, greb: this.grebSkyder });
        this.tegnSejr(ctx, t);
    };

    /* Partneren kommer ind ved gruppen, hydronen flytter, og vandet glider vaek */
    P.tegnReak = function (ctx, k) {
        var r = this.reak, fs = this.fs, t = this.lay.tavle;
        var g = k[r.gruppe], side = r.gruppe === "carboxyl" ? 1 : -1;
        var A = { x: g.cx + side * fs * 1.1, y: g.cy - fs * 2.5 };
        var E = { x: NK.klamp(A.x + side * fs * 4, t.x + fs * 2, t.x + t.b - fs * 2), y: Math.max(t.y + fs, A.y - fs * 1.6) };
        var U = { x: NK.klamp(A.x + side * fs * 2.6, t.x + fs * 2, t.x + t.b - fs * 2), y: A.y - fs * 1.2 };
        var pos, alfa = 1, slags;
        var harH = r.slags === "giv" ? r.t < IND : r.t >= IND + FLYT;   /* har partneren hydronen? */
        if (r.slags === "giv") slags = r.t < IND ? "H3O" : "H2O";
        else slags = r.t < IND + FLYT ? "OH" : "H2O";
        if (r.t < IND) { var u = NK.blod(r.t / IND); pos = { x: NK.lerp(E.x, A.x, u), y: NK.lerp(E.y, A.y, u) }; alfa = Math.min(1, r.t / (IND * 0.5)); }
        else if (r.t < IND + FLYT) pos = A;
        else { var v = NK.blod((r.t - IND - FLYT) / UD); pos = { x: NK.lerp(A.x, U.x, v), y: NK.lerp(A.y, U.y, v) }; alfa = 1 - v; }
        T.partikel(ctx, pos.x, pos.y, slags, fs * 0.6, alfa);
        /* Hydronen paa vej mellem partneren og gruppen */
        if (r.t >= IND && r.t < IND + FLYT) {
            var w = NK.blod((r.t - IND) / FLYT);
            var fra = r.slags === "giv" ? A : { x: g.cx, y: g.cy }, til = r.slags === "giv" ? { x: g.cx, y: g.cy } : A;
            T.hydron(ctx, NK.lerp(fra.x, til.x, w), NK.lerp(fra.y, til.y, w) - Math.sin(w * Math.PI) * fs * 0.5, fs * 0.42);
        }
        void harH;
    };

    NK.SimFormer = SimFormer;
}());
