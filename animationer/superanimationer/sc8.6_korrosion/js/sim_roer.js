/* =====================================================================
   sim_roer.js - fane 1: Rørene

   To vandroer i en kaelder, skruet sammen paa midten. Eleven vaelger
   metal til hvert roer (kobber, jern, zink) og lader 20 aar gaa. Det
   mindst aedle roer taeres ved samlingen, og er forskellen stor nok,
   gaar der hul. Luppen over samlingen viser atomerne i roerenes vaeg:
   elektronerne gaar gennem metallet fra det mindst aedle til det mest
   aedle, og ionerne gaar ud i vandet.

   Vandet loeber fra venstre mod hoejre. Sidder kobberroeret foerst,
   har vandet kobberioner med, som saetter sig paa det andet roer og
   tager elektroner fra det. Luppen viser dem fra maalet om vandets
   retning (visIoner).

   Hvor meget vaeggen er taeret, regnes af K.roerpar og K.tab. Luppen
   foelger samme tal: en kolonne mister et atom, hver gang vaeggen der
   er blevet en fjerdedel tyndere.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var AAR_PR_SEK = 1.25;
    var KOL = 12, RAEK = 5;

    function SimRoer() {
        var mig = this;
        this.a = "Cu";
        this.b = "Fe";
        this.plast = false;
        this.proevet = [];
        this.tidknap = NK.el("r-tid");
        this.plastknap = NK.el("r-plast");
        this.valg = { v: NK.el("r-valg-v"), h: NK.el("r-valg-h") };
        this.tidknap.addEventListener("click", function () { mig.tidKlik(); mig.fokus(); });
        this.plastknap.addEventListener("click", function () { mig.saetRoer(mig.a, mig.b, !mig.plast); });
        ["v", "h"].forEach(function (side) {
            mig.valg[side].addEventListener("click", function (e) {
                var k = e.target.closest ? e.target.closest("[data-metal]") : null;
                if (!k) return;
                var m = k.getAttribute("data-metal");
                mig.saetRoer(side === "v" ? m : mig.a, side === "h" ? m : mig.b, mig.plast);
            });
        });
        this.nyeRoer();
        this.startFane(D.R_MAAL);
    }

    var P = SimRoer.prototype;
    NK.Fane.paa(P, { navn: "r", naesteFane: "fane-s", naesteNavn: "Skibet" });

    /* ----- Roerene ---------------------------------------------------------------- */
    P.nyeRoer = function () {
        var mig = this;
        this.par = K.roerpar(this.a, this.b, this.plast);
        this.t = 0;
        this.koerer = false;
        this.slut = false;
        this.hulT = 0;
        this.ventT = 0;
        this.ionRest = 0.5;
        this.M = new NK.Mikro({
            kol: KOL, raek: RAEK, over: this.lay ? this.lay.over : 3.2, vand: "fuld", stroem: 0.9, o2: 5,
            medIoner: this.visIoner() && K.ROER.ioner[this.a] ? this.a : null,
            metal: function (c) {
                if (mig.plast && (c === KOL / 2 - 1 || c === KOL / 2)) return null;
                return c < KOL / 2 ? mig.a : mig.b;
            }
        });
        this.visValg();
        this.visRaekke();
    };

    /* Eleven skifter metal eller muffe: nye roer, og tiden begynder forfra */
    P.saetRoer = function (a, b, plast) {
        this.a = a;
        this.b = b;
        this.plast = plast;
        this.nyeRoer();
        this.nulstilHjaelp();
        if (this.lay) this.layout();
        if (!this.faerdig && this.opg) this.naesteLinje("", "");
    };

    P.nulstilScene = function () { this.nyeRoer(); };

    /* Det, vandet har med fra det foerste roer, ses i luppen fra maalet om vandets retning */
    P.visIoner = function () {
        if (!this.status) return false;
        return this.erLoest("retning") || !!(this.opg && this.opg.o.id === "retning");
    };

    P.visValg = function () {
        var mig = this;
        ["v", "h"].forEach(function (side) {
            var nu = side === "v" ? mig.a : mig.b;
            var knapper = mig.valg[side].querySelectorAll("[data-metal]");
            for (var i = 0; i < knapper.length; i++) {
                knapper[i].classList.toggle("valgt", knapper[i].getAttribute("data-metal") === nu);
            }
        });
        this.plastknap.classList.toggle("til", this.plast);
        this.plastknap.setAttribute("aria-pressed", this.plast ? "true" : "false");
        this.visTid();
    };

    P.visTid = function () {
        var R = K.ROER;
        NK.saetTekst("r-aartal", String(Math.floor(this.t + 1e-6)));
        NK.el("r-aarfyld").style.width = Math.round(100 * this.t / R.aar) + "%";
        var tekst = this.koerer ? "Tiden går …" : (this.slut ? "Nye rør ↺" : "Lad tiden gå ▶");
        if (this.tidknap.textContent !== tekst) this.tidknap.textContent = tekst;
        this.tidknap.disabled = this.koerer;
        this.tidknap.classList.toggle("banker", !this.koerer && !this.slut && !this.faerdig && this.opg && this.klarTilTid());
    };

    /* Staar roerene, som maalet beder om? (saa banker knappen) */
    P.klarTilTid = function () {
        var g = this.opg;
        if (!g || g.fase === "gaet") return false;
        if (g.fase === "spm") return this.t === 0 && (!g.o.spm.krav || this.opfylder(g.o.spm.krav));
        return this.opfylder(g.o.forsoeg.krav);
    };

    P.tidKlik = function () {
        if (this.koerer) return;
        if (this.slut) { this.nyeRoer(); if (!this.faerdig) this.naesteLinje("", ""); return; }
        this.koerer = true;
        this.nulstilHjaelp();
        if (!this.faerdig) this.naesteLinje("", "");
        this.visTid();
    };

    P.sluttid = function () { return this.par.hul || K.ROER.aar; };

    /* Kolonnens afstand fra samlingen (0 ved samlingen) og dens side */
    P.kolonne = function (c) {
        var halv = KOL / 2, pl = this.plast ? 1 : 0;
        var side = c < halv ? "v" : "h";
        var dk = side === "v" ? halv - 1 - pl - c : c - halv - pl;
        return { side: side, dk: dk, d: dk / halv * 0.5 };
    };

    /* Saa mange atomer skal kolonne c have mistet efter t aar */
    P.dybde = function (c, t) {
        if (!this.M.metal[c]) return 0;
        var k = this.kolonne(c);
        return Math.floor(K.tab(this.par, k.side, t, k.d) / K.ROER.vaeg * (RAEK - 1) + 1e-6);
    };

    /* Hvor elektronerne fra kolonne c gaar hen */
    P.katodeFor = function (c) {
        var k = this.kolonne(c), halv = KOL / 2, kandidater = [], i, mig = this;
        var over = this.par.side === k.side;      /* elektronerne gaar over samlingen */
        if (over) {
            /* Til det aedle roer: en af de tre kolonner naermest samlingen */
            for (i = 0; i < 3; i++) kandidater.push(k.side === "v" ? halv + i : halv - 1 - i);
        } else {
            /* Roeret sidder alene: til et sted et par atomer vaek paa samme roer */
            [-3, -2, 2, 3].forEach(function (dc) { kandidater.push(c + dc); });
        }
        kandidater = kandidater.filter(function (q) {
            if (q < 0 || q >= KOL || !mig.M.metal[q]) return false;
            return over || mig.kolonne(q).side === k.side;
        });
        return kandidater.length ? NK.tilfaeldig(kandidater) : -1;
    };

    /* Roerene, som de ser ud efter t aar, uden at vente (Vis svaret) */
    P.spolTil = function (t) {
        this.t = t;
        for (var c = 0; c < KOL; c++) this.M.top[c] = Math.min(RAEK - 1, this.dybde(c, t));
        this.koerer = false;
        this.slut = true;
        this.hulT = this.par.hul ? 3 : 0;
        this.gemProevet();
        this.visTid();
    };

    /* ----- Maalene ---------------------------------------------------------------- */
    /* Er det de rigtige metaller? orden: det foerste i par skal sidde til venstre */
    P.rigtigeRoer = function (krav) {
        if (this.a === krav.par[0] && this.b === krav.par[1]) return true;
        return !krav.orden && this.a === krav.par[1] && this.b === krav.par[0];
    };

    P.opfylder = function (krav) {
        if (krav.ens) return this.a === this.b && !this.plast;
        return this.rigtigeRoer(krav) && this.plast === !!krav.plast;
    };

    P.vaelgLinje = function (krav) {
        var m0 = D.Stort(K.navn(krav.par[0])), m1 = D.Stort(K.navn(krav.par[1]));
        if (krav.orden) return "Vælg " + m0 + " til venstre rør og " + m1 + " til højre rør.";
        return "Vælg " + m0 + " til det ene rør og " + m1 + " til det andet.";
    };

    P.nyOpgave = function (o) {
        if (o.opstil) {
            this.a = o.opstil.a;
            this.b = o.opstil.b;
            this.plast = !!o.opstil.plast;
        }
        this.nyeRoer();
        this.visEkstra();
    };

    P.efterOpgave = function () { this.visEkstra(); this.visTid(); };

    /* Har eleven ladet tiden gaa foer gaettet, taeller det, der allerede er set */
    P.efterGaet = function () {
        var f = this.opg.o.forsoeg;
        if (this.slut && f && this.opfylder(f.krav)) this.forsoegKlaret(f.set || "");
    };

    /* Plastmuffen og spaendingsraekken kommer frem, naar maalene naar til dem */
    P.visEkstra = function () {
        var o = this.opg ? this.opg.o : null;
        this.plastknap.hidden = !(this.erLoest("plast") || (o && o.id === "plast"));
        NK.el("r-raekkekort").hidden = !this.erLoest("znfe");
        this.visRaekke();
    };

    P.visRaekke = function () {
        var par = this.par, tekst;
        if (par.plast) tekst = "Med en plastmuffe imellem kan elektronerne ikke komme fra det ene rør til det andet.";
        else if (!par.anode) tekst = "To rør af samme metal. Ingen af dem afgiver elektroner til det andet.";
        else {
            tekst = D.Stort(K.navn(par.anode)) + " står til venstre for " + K.navn(par.katode) + " og er mindre ædelt. " +
                D.Stort(K.navn(par.anode)) + " afgiver elektroner til " + K.navn(par.katode) + ".";
        }
        NK.saetHTML("r-raekke", Tg.raekkeHTML(K.ROER.metaller, [this.a, this.b], par.anode) +
            '<p class="note">' + NK.html(tekst) + "</p>");
    };

    P.gemProevet = function () {
        var navn = D.roerNavn(this.par), res = D.roerResultat(this.par);
        this.proevet = this.proevet.filter(function (p) { return p.navn !== navn; });
        this.proevet.push({ navn: navn, res: res, hul: !!this.par.hul });
        var html = this.proevet.map(function (p) {
            return '<div class="talraekke"><span>' + NK.html(p.navn) + '</span><span class="tal' + (p.hul ? " roed" : "") + '">' + NK.html(p.res) + "</span></div>";
        }).join("");
        NK.saetHTML("r-proevet", html);
        NK.el("r-proevetkort").hidden = false;
    };

    /* De 20 aar er gaaet, eller der er gaaet hul */
    P.forsoegSlut = function () {
        this.koerer = false;
        this.slut = true;
        this.gemProevet();
        this.visTid();
        var g = this.opg;
        if (this.faerdig || g.fase !== "forsoeg") return;
        var krav = g.o.forsoeg.krav;
        if (this.opfylder(krav)) this.forsoegKlaret(g.o.forsoeg.set || "");
        else this.fejlLinje(D.roerForkert(krav, this.par));
    };

    P.forsoegSvar = function (o) {
        var krav = o.forsoeg.krav;
        if (!this.opfylder(krav)) {
            if (krav.ens) { this.a = "Fe"; this.b = "Fe"; this.plast = false; }
            else { this.a = krav.par[0]; this.b = krav.par[1]; this.plast = !!krav.plast; }
            this.nyeRoer();
            this.layout();
        }
        this.spolTil(this.sluttid());
    };

    P.sceneLinje = function () {
        var krav = this.opg.o.forsoeg.krav;
        if (this.koerer) return "Tiden går. Se på rørene ved samlingen og i luppen.";
        if (this.slut) return "Tryk på Nye rør, og prøv igen.";
        if (this.opfylder(krav)) return "Tryk på Lad tiden gå øverst i scenen.";
        if (krav.ens) return "Vælg metal med knapperne under rørene, og tryk på Lad tiden gå.";
        if (!this.rigtigeRoer(krav)) return this.vaelgLinje(krav);
        return krav.plast ? "Slå Plastmuffe til med kontakten øverst i scenen." : "Slå Plastmuffe fra med kontakten øverst i scenen.";
    };

    P.spmLinje = function () {
        var krav = this.opg.o.spm.krav;
        if (this.koerer) return "Se i luppen, og vælg et svar i opgavekortet til højre.";
        if (krav && !this.opfylder(krav)) return this.vaelgLinje(krav).replace(/\.$/, "") + ", og lad tiden gå.";
        if (this.t === 0) return "Tryk på Lad tiden gå, og se i luppen. Vælg så et svar i opgavekortet til højre.";
        return "";
    };

    P.enter = function () { if (!this.koerer) this.tidKlik(); };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.gulv = Hs - 12;
        lay.Ro = NK.klamp(Hs * 0.075, 28, 40);
        lay.vaeg = Math.round(lay.Ro * 0.42);
        lay.roerY = Hs - lay.Ro - NK.klamp(Hs * 0.2, 98, 124);
        lay.xJ = W / 2;
        lay.muffe = this.plast ? 15 : 0;
        var top = 92;
        var lh = NK.klamp(lay.roerY - lay.Ro - 30 - top, 140, 340);
        var lb = Math.min(NK.klamp(W * 0.62, 320, 680), KOL * lh / 8.2);
        lay.lup = { x: lay.xJ - lb / 2, y: top, b: lb, h: lh };
        lay.over = lh / (lb / KOL) - RAEK;
        lay.fra = { x: lay.xJ - 34, y: lay.roerY + lay.Ro - lay.vaeg - 6, b: 68, h: lay.vaeg + 12 };
        this.lay = lay;
        if (this.M) this.M.over = lay.over;

        var mig = this;
        ["v", "h"].forEach(function (side) {
            var e = mig.valg[side];
            e.style.left = Math.round(side === "v" ? W * 0.25 : W * 0.75) + "px";
            e.style.top = Math.round(lay.roerY + lay.Ro + 30) + "px";
        });
        this.saetAnker("lup", lay.lup.x, lay.lup.y, lay.lup.b, lay.lup.h);
        this.saetAnker("roer", 8, lay.roerY - lay.Ro - 14, W - 16, 2 * lay.Ro + 28);
    };

    P.opdaterScene = function (dt) {
        var M = this.M;
        if (this.koerer) {
            var slut = this.sluttid();
            this.t = Math.min(slut, this.t + dt * AAR_PR_SEK);
            /* Luppen foelger vaeggen: ét atom ad gangen, naermest samlingen foerst */
            this.ventT -= dt;
            if (this.ventT <= 0) {
                var bedst = -1, bd = 99;
                for (var c = 0; c < KOL; c++) {
                    if (M.top[c] + M.paaVej(c) < this.dybde(c, this.t) && M.kanAfgive(c)) {
                        var dk = this.kolonne(c).dk + M.top[c] * 0.5;
                        if (dk < bd) { bd = dk; bedst = c; }
                    }
                }
                if (bedst >= 0) {
                    /* Saa stor en del af atomerne tages af en ion fra det foerste roer:
                       delen samles op, og hver gang der er til en hel, kommer en ion */
                    var kb = this.kolonne(bedst);
                    if (M.medIoner) this.ionRest += K.ionDel(this.par, kb.side, kb.d);
                    if (M.medIoner && this.ionRest >= 1 && M.sendIon(bedst)) { this.ionRest -= 1; this.ventT = 0.28; }
                    else {
                        var kat = this.katodeFor(bedst);
                        if (kat >= 0) { M.afgiv(bedst, kat); this.ventT = 0.28; }
                    }
                }
            }
            if (this.t >= slut) this.forsoegSlut();
            this.visTid();
        }
        if (this.slut && this.par.hul) this.hulT += dt;
        M.opdater(dt);
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        this.tegnKaelder(ctx, lay);
        this.tegnRoer(ctx, lay);
        Tg.zoomRamme(ctx, lay.lup, lay.fra, "ATOMERNE I RØRENES VÆG VED SAMLINGEN");
        this.M.tegn(ctx, lay.lup, { radius: 12 });
        this.tegnLupTekst(ctx, lay);
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    P.tegnKaelder = function (ctx, lay) {
        var W = lay.W, Hs = lay.Hs, x, y;
        var g = ctx.createLinearGradient(0, 0, 0, Hs);
        g.addColorStop(0, "#24262f");
        g.addColorStop(1, "#1a1c23");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, Hs);
        /* Mursten */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
        ctx.lineWidth = 1;
        for (y = 0; y < lay.gulv; y += 26) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(W, y + 0.5);
            ctx.stroke();
            for (x = (Math.round(y / 26) % 2) * 32; x < W; x += 64) {
                ctx.beginPath();
                ctx.moveTo(x + 0.5, y);
                ctx.lineTo(x + 0.5, y + 26);
                ctx.stroke();
            }
        }
        ctx.fillStyle = "#121318";
        ctx.fillRect(0, lay.gulv, W, lay.H - lay.gulv);
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(0, lay.gulv, W, 2);
    };

    P.tegnRoer = function (ctx, lay) {
        var mig = this, W = lay.W, y0 = lay.roerY, Ro = lay.Ro, vg = lay.vaeg, Ri = Ro - vg;
        var par = this.par, t = this.t, halv = W / 2;

        /* Boejler paa vaeggen */
        [0.1, 0.9].forEach(function (f) {
            ctx.fillStyle = "#15161b";
            ctx.fillRect(W * f - 7, y0 - Ro - 10, 14, 2 * Ro + 20);
            ctx.fillStyle = "#3a3d48";
            ctx.fillRect(W * f - 5, y0 - Ro - 10, 10, 2 * Ro + 20);
        });

        function side(navn) {
            var m = navn === "v" ? mig.a : mig.b, F = K.METAL[m];
            var x0 = navn === "v" ? 0 : lay.xJ + lay.muffe, x1 = navn === "v" ? lay.xJ - lay.muffe : W;
            /* Roerets vaeg, set i snit */
            var g = ctx.createLinearGradient(0, y0 - Ro, 0, y0 + Ro);
            g.addColorStop(0, Tg.nuance(F.farve, 0.25));
            g.addColorStop(0.5, F.farve);
            g.addColorStop(1, Tg.nuance(F.farve, -0.3));
            ctx.fillStyle = g;
            ctx.fillRect(x0, y0 - Ro, x1 - x0, 2 * Ro);
            /* Vandet, og det, vandet har aedt af vaeggen */
            ctx.fillStyle = Tg.VAND;
            ctx.beginPath();
            var x, skridt = 4, tab;
            function tabVed(px) {
                var d = Math.abs(px - (navn === "v" ? x1 : x0)) / halv;
                return K.tab(par, navn, t, d) / K.ROER.vaeg * vg;
            }
            ctx.moveTo(x0, y0 - Ri - tabVed(x0));
            for (x = x0; x <= x1; x += skridt) ctx.lineTo(x, y0 - Ri - tabVed(x));
            ctx.lineTo(x1, y0 - Ri - tabVed(x1));
            ctx.lineTo(x1, y0 + Ri + tabVed(x1));
            for (x = x1; x >= x0; x -= skridt) ctx.lineTo(x, y0 + Ri + tabVed(x));
            ctx.lineTo(x0, y0 + Ri + tabVed(x0));
            ctx.closePath();
            ctx.fill();
            /* Belaegningen paa den taerede vaeg: rust paa jern, hvidt paa zink */
            ctx.fillStyle = F.belaeg;
            for (x = x0; x < x1; x += skridt) {
                tab = tabVed(x + skridt / 2);
                if (tab < 0.6) continue;
                var lag = Math.min(5, 1.5 + tab * 0.45) * (0.7 + 0.3 * Math.sin(x * 1.7));
                ctx.fillRect(x, y0 - Ri - tab, skridt + 0.5, lag);
                ctx.fillRect(x, y0 + Ri + tab - lag, skridt + 0.5, lag);
            }
            /* Kanten yderst */
            ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
            ctx.fillRect(x0, y0 - Ro, x1 - x0, 1.5);
            ctx.fillRect(x0, y0 + Ro - 1.5, x1 - x0, 1.5);
        }
        side("v");
        side("h");

        /* Vandet loeber */
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y0 - Ri + 3, W, 2 * Ri - 6);
        ctx.clip();
        ctx.strokeStyle = "rgba(170, 215, 255, 0.22)";
        ctx.lineWidth = 2;
        var forskyd = (this.tid * 46) % 90;
        for (var i = -1; i < W / 90 + 1; i++) {
            for (var j = 0; j < 3; j++) {
                var sx = i * 90 + forskyd + j * 31, sy = y0 - Ri + 9 + j * (2 * Ri - 18) / 2;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + 22, sy);
                ctx.stroke();
            }
        }
        ctx.restore();

        /* Vandets retning: en pil i hvert roer */
        [0.2, 0.8].forEach(function (fx) {
            var px = W * fx, lgd = 26;
            ctx.save();
            ctx.font = Tg.font("700", 13);
            var tb = ctx.measureText("vand").width, vx = px - (tb + 8 + lgd) / 2;
            NK.tekst(ctx, "vand", vx, y0 + 0.5, { font: Tg.font("700", 13), linje: "middle", farve: "#d5e9fb", kant: true });
            ctx.strokeStyle = "#d5e9fb";
            ctx.fillStyle = "#d5e9fb";
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            var ax = vx + tb + 8;
            ctx.beginPath();
            ctx.moveTo(ax, y0);
            ctx.lineTo(ax + lgd - 7, y0);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ax + lgd, y0);
            ctx.lineTo(ax + lgd - 9, y0 - 5.5);
            ctx.lineTo(ax + lgd - 9, y0 + 5.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        /* Flangerne og muffen ved samlingen */
        function flange(x, m) {
            var F = K.METAL[m];
            ctx.fillStyle = Tg.nuance(F.farve, -0.18);
            ctx.fillRect(x, y0 - Ro - 9, 10, 9 + vg);
            ctx.fillRect(x, y0 + Ro - vg, 10, 9 + vg);
            ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y0 - Ro - 8.5, 9, 8 + vg);
            ctx.strokeRect(x + 0.5, y0 + Ro - vg + 0.5, 9, 8 + vg);
        }
        var tabV = K.tab(par, "v", t, 0) / K.ROER.vaeg * vg, tabH = K.tab(par, "h", t, 0) / K.ROER.vaeg * vg;
        flange(lay.xJ - lay.muffe - 10, this.a);
        flange(lay.xJ + lay.muffe, this.b);
        if (this.plast) {
            ctx.fillStyle = "#d9d3bf";
            ctx.fillRect(lay.xJ - lay.muffe, y0 - Ro - 9, 2 * lay.muffe, 9 + vg);
            ctx.fillRect(lay.xJ - lay.muffe, y0 + Ro - vg, 2 * lay.muffe, 9 + vg);
            ctx.fillStyle = Tg.VAND;
            ctx.fillRect(lay.xJ - lay.muffe - 0.5, y0 - Ri, 2 * lay.muffe + 1, 2 * Ri);
            Tg.maerkat(ctx, "plastmuffe", lay.xJ, y0 + Ro + 26, { farve: "#e9e4d2" });
        }
        /* Vandet har aedt sig ind under flangen */
        ctx.fillStyle = Tg.VAND;
        if (tabV > 0.6) { ctx.fillRect(lay.xJ - lay.muffe - 10, y0 - Ri - tabV, 10, tabV); ctx.fillRect(lay.xJ - lay.muffe - 10, y0 + Ri, 10, tabV); }
        if (tabH > 0.6) { ctx.fillRect(lay.xJ + lay.muffe, y0 - Ri - tabH, 10, tabH); ctx.fillRect(lay.xJ + lay.muffe, y0 + Ri, 10, tabH); }
        /* Boltene */
        ctx.fillStyle = "#2a2c34";
        [y0 - Ro - 6, y0 + Ro + 2].forEach(function (by) {
            ctx.fillRect(lay.xJ - lay.muffe - 13, by, 2 * lay.muffe + 26, 4);
        });

        /* Hullet: vandet sproejter ud ved samlingen */
        this.pyt = null;
        if (par.hul && t >= par.hul - 1e-6) {
            var hx = lay.xJ + (par.svag === "v" ? -lay.muffe - 16 : lay.muffe + 16);
            var ret = par.svag === "v" ? -1 : 1;
            ctx.fillStyle = Tg.VAND;
            ctx.fillRect(hx - 5, y0 + Ri - 1, 10, vg + 3);
            ctx.strokeStyle = "rgba(120, 190, 250, 0.85)";
            ctx.lineCap = "round";
            for (var s = 0; s < 4; s++) {
                ctx.lineWidth = 3 - s * 0.4;
                ctx.setLineDash([9, 7]);
                ctx.lineDashOffset = -this.tid * 90 - s * 5;
                ctx.beginPath();
                ctx.moveTo(hx + (s - 1.5) * 2, y0 + Ro + 2);
                ctx.quadraticCurveTo(hx + ret * (6 + s * 7), (y0 + Ro + lay.gulv) / 2, hx + ret * (10 + s * 14), lay.gulv);
                ctx.stroke();
            }
            ctx.setLineDash([]);
            var b = Math.min(1, this.hulT / 4) * NK.klamp(W * 0.16, 90, 170);
            if (b > 4) {
                ctx.fillStyle = "rgba(60, 130, 200, 0.75)";
                ctx.beginPath();
                ctx.ellipse(hx + ret * 22, lay.gulv + 3, b, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                this.pyt = { x: hx + ret * 22, y: lay.gulv + 3, b: b };
            }
            Tg.maerkat(ctx, "hul efter " + D.aar(par.hul) + " år", lay.xJ - ret * 16, y0 + Ro + 16,
                { farve: "#ffd7d2", bund: "rgba(120, 30, 22, 0.92)", justering: ret > 0 ? "right" : "left", px: 14 });
        }
    };

    P.tegnLupTekst = function (ctx, lay) {
        var R = lay.lup, y = R.y + R.h - 16;
        Tg.maerkat(ctx, K.navn(this.a), R.x + 12, y, { justering: "left" });
        Tg.maerkat(ctx, K.navn(this.b), R.x + R.b - 12, y, { justering: "right" });
        Tg.maerkat(ctx, "vand →", R.x + 12, R.y + 18, { justering: "left", farve: "#a8d4f5" });
        if (this.plast) Tg.maerkat(ctx, "plast", R.x + R.b / 2, y, { farve: "#2a2a22", bund: "rgba(217, 211, 191, 0.92)" });
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.overPyt = function (pt) {
        var p = this.pyt;
        return !!(p && pt && Math.abs(pt.x - p.x) < p.b && Math.abs(pt.y - p.y) < 14);
    };

    P.overScene = function (pt) { return this.overPyt(pt) ? "pointer" : null; };

    P.klikScene = function (pt) {
        if (this.overPyt(pt)) {
            this.kortBesked(D.PAASKE.vandpyt, 7, "gul");
            NK.paaskeaeg = (NK.paaskeaeg || 0) + 1;
        }
    };

    NK.SimRoer = SimRoer;
}());
