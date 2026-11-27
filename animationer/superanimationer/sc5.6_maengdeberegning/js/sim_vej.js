/* =====================================================================
   sim_vej.js - fane 1: Fra gram til gram

   Runde T12 (27. nov. 2026) efter REGELSAET. Fanen bruger ikke laengere
   js/fane.js (panelet med felterne paa tavlen); opgaverne staar i
   js/vej_opgaver.js og D.OPG_VEJ i js/data.js.

     * Intet panel (REGELSAET 2-3): tre opgaver i raekken oeverst i scenen
       med Start forfra og Fri leg, og kortet centreret under raekken.
       Svaret gives i kortet: tre svar, formlen blandt tre knapper eller
       tallet i et felt.
     * Skemaet paa tavlen viser "?" med gul ramme i den celle, kortet
       spoerger om. Tallet kommer ind, naar svaret er rigtigt, og pilen
       for vejen kommer frem (· 1/M ned, forholdet paa tvaers, · M op).
     * Beregningen staar paa et lyst ark til hoejre for skemaet og vokser
       linje for linje med et navn i ord over hver linje (REGELSAET 28-29).
       Foer foerste linje er arket en stiplet plads.
     * Paa bordet: det kendte stof paa vaegten til venstre. Reaktionspilen
       kommer frem, naar stofmaengden af det kendte stof er fundet, og
       vaegten til hoejre er en stiplet plads, til massen skal findes
       (REGELSAET 13). Hvert rigtigt tal vises ogsaa her: pulveret bliver
       til poser med 1 mol, poserne gaar gennem pilen i forholdet, og det
       nye stof vejes.
     * Scenen staar samlet i midten, ogsaa paa en stor skaerm (REGELSAET 32).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;
    function lex(v, px) { return v + " " + Math.round(px) + "px Lexend, 'Segoe UI', sans-serif"; }

    function vejData(id) {
        for (var i = 0; i < D.VEJ.length; i++) if (D.VEJ[i].id === id) return D.VEJ[i];
        return D.VEJ[0];
    }

    function SimVej() {
        var mig = this;
        this.navn = "vej";
        this.L = new NK.Laerred(NK.el("vej-laerred"));
        this.e = { skort: NK.el("vej-skort"), ark: NK.el("vej-ark") };
        this.tid = 0;
        this.linjer = [];
        this.skema = new NK.Skema({
            vaert: NK.el("vej-felter"), navn: "vej",
            kald: { klik: function () { mig.opgaver.spaer(); } }
        });
        this.skema.iKort = true;
        this.koblMus();
        this.opgaver = new NK.VejOpgaver(this);
        this.opgaver.start();
    }

    var P = SimVej.prototype;

    /* ----- Opgavens tal ------------------------------------------------------------
       o: { vej (D.VEJ-id), n (stofmaengden af det kendte stof) } */
    P.kontekst = function (o) {
        var v = vejData(o.vej), r = D.reaktion(v.r), stK = D.stof(v.kendt), stS = D.stof(v.soegt);
        var jK = D.plads(r, v.kendt), jS = D.plads(r, v.soegt), kK = r.led[jK].k, kS = r.led[jS].k;
        var m = Math.round(o.n * stK.M) / 100;
        var nK = m / stK.Mv, nS = nK * kS / kK;
        return { o: o, v: v, r: r, stK: stK, stS: stS, jK: jK, jS: jS, kK: kK, kS: kS, m: m, nK: nK, nS: nS, mS: nS * stS.Mv };
    };

    /* Teksterne for en anden opgave end den, der er i gang (maalingen af kortet) */
    P.medOpgave = function (o, f) {
        var gemt = this.x;
        this.x = this.kontekst(o);
        try { f(); } finally { this.x = gemt; }
    };

    P.traekN = function (liste, sidst) {
        var andre = liste.filter(function (x) { return x !== sidst; });
        return NK.tilfaeldig(andre.length ? andre : liste);
    };

    function variant(v, x) {
        if (!v || typeof v === "string") return v || "";
        var een = x.kK === 1 && x.kS === 1;
        if (v.ellers !== undefined) return een ? v.een : v.ellers;
        if (een && v.een !== undefined) return v.een;
        return x.kK === x.kS ? v.lige : v.ulige;
    }

    P.fyld = function (s) {
        var x = this.x;
        var tab = {
            K: x.stK.navn, S: x.stS.navn, Kf: x.stK.formel, Sf: x.stS.formel,
            m: D.tekstMasse(x.m), MK: D.tekstMolar(x.stK), MS: D.tekstMolar(x.stS),
            nK: D.tekstN(x.nK), nS: D.tekstN(x.nS), mS: D.tekstMasse(x.mS), kK: x.kK, kS: x.kS
        };
        return String(variant(s, x)).replace(/\{(\w+)\}/g, function (m, k) { return tab[k] !== undefined ? String(tab[k]) : m; });
    };

    /* Trinets tekster med tallene sat ind */
    P.tekster = function (t) {
        var mig = this, base = D.VEJ_TEKST[t.felt] || {};
        return {
            spm: this.fyld(t.spm || base.spm || ""),
            tekst: t.tekst ? this.fyld(t.tekst) : "",
            hint: (t.hint || base.hint || []).map(function (h) { return mig.fyld(h); }),
            slut: this.fyld(t.slut || base.slut || "")
        };
    };

    /* ----- Felterne --------------------------------------------------------------------- */
    P.celleId = function (felt) {
        var x = this.x;
        if (felt === "nK") return x.jK + "_n";
        if (felt === "nS") return x.jS + "_n";
        if (felt === "mS") return x.jS + "_m";
        return null;
    };

    P.venstre = function (felt) {
        var x = this.x;
        return (felt === "mS" ? "m" : "n") + "(" + (felt === "nK" ? x.stK.formel : x.stS.formel) + ")";
    };

    P.enhed = function (felt) { return felt === "mS" ? "g" : "mol"; };

    P.feltNavn = function (felt) {
        var x = this.x;
        return (felt === "mS" ? "Massen af " : "Stofmængden af ") + (felt === "nK" ? x.stK.navn : x.stS.navn);
    };

    P.vaerdi = function (felt) {
        var x = this.x;
        return felt === "nK" ? x.nK : (felt === "nS" ? x.nS : x.mS);
    };

    P.svarLinje = function (felt) {
        var v = this.vaerdi(felt);
        return NK.html(this.venstre(felt)) + " = " + (felt === "mS" ? D.tekstMasse(v) : D.tekstN(v)) + " " + this.enhed(felt);
    };

    /* Tallet, eleven har skrevet, med beskeder, der kender fejlene (js/tjek.js) */
    P.tjekTal = function (felt, raa) {
        var x = this.x;
        if (felt === "nK") return Tj.nFraM(raa, { st: x.stK, m: x.m, k: x.kK });
        if (felt === "nS") return Tj.nFraForhold(raa, { st: x.stS, kilde: x.stK, nKilde: x.nK, kj: x.kS, kk: x.kK, mKilde: x.m, andre: [] });
        return Tj.mFraN(raa, { st: x.stS, n: x.nS, k: x.kS, kilde: x.stK, mKilde: x.m, nKilde: x.nK, kj: x.kS, kk: x.kK });
    };

    /* Typiske forkerte tal til maalingen af kortet: beskederne, de giver */
    P.fejlProever = function (felt) {
        var x = this.x, MK = x.stK.Mv, MS = x.stS.Mv, v;
        if (felt === "nK") v = [x.m * MK, MK / x.m, x.m, x.nK * 10, x.nK * 1.04, 7.77];
        else if (felt === "nS") v = [x.nK * x.kK / x.kS, x.nK, x.m * x.kS / x.kK, x.m, x.nK * x.kS, x.nK / x.kK, x.kS, x.nS * 10, x.nS * 1.04, 7.77];
        else v = [x.nS / MS, MS / x.nS, x.m * x.kS / x.kK, x.nS * MK, x.m, x.mS * x.kS, x.nS, x.mS * 10, x.mS * 1.04, 7.77];
        var mig = this, ud = [];
        v.forEach(function (tal) {
            var r = mig.tjekTal(felt, String(Math.round(tal * 1000) / 1000).replace(".", ","));
            if (!r.ok && r.besked) {
                var h = Tj.htmlBesked(r.besked);
                if (ud.indexOf(h) < 0) ud.push(h);
            }
        });
        return ud;
    };

    /* ----- Opgaven ------------------------------------------------------------------------ */
    P.nyOpgave = function (o, fremme) {
        var x = this.x = this.kontekst(o), v = x.v;
        var givet = {};
        givet[v.kendt] = x.m;
        this.opg = NK.Skema.lavOpgave({
            r: x.r, givet: givet, kilde: v.kendt, visM: [v.kendt, v.soegt],
            spoerg: [[v.kendt, "n"], [v.soegt, "n"], [v.soegt, "m"]]
        });
        this.skema.spm = null;
        this.skema.fremhaev = null;
        this.skema.saet(this.opg);
        this.jK = x.jK;
        this.jS = x.jS;
        this.a = { fase: 0, t: 0 };
        this.visHoejre = 0;
        this.visVenstre = x.m;
        this.linjer = [];
        this.overgang = o.trin && o.trin[0] && o.trin[0].felt === "reaktion";
        if (fremme) {
            var mig = this;
            ["nK", "nS", "mS"].forEach(function (f) { mig.loes(f, "ok"); });
            this.skema.pile.forEach(function (p) { p.t = 1; });
            this.a = { fase: 3, t: 99 };
            this.visVenstre = 0;
            this.visHoejre = x.mS;
        }
        this.layout();
        this.visArk();
    };

    /* Kortet spoerger om feltet: "?" med gul ramme i skemaet */
    P.spoerg = function (felt) {
        var id = felt ? this.celleId(felt) : null;
        this.skema.fremhaev = null;
        if (this.skema.spm !== id) {
            this.skema.spm = id;
            this.skema.byg();
        }
    };

    /* Hintet lyser det op i skemaet, som feltet regnes af */
    P.fremhaev = function (felt) { this.skema.fremhaev = this.celleId(felt); };

    P.loes = function (felt, maade) {
        var id = this.celleId(felt);
        if (!id) return;
        this.skema.loes(id, maade);
        this.linjer.push({ felt: felt, id: id, svar: maade === "svar" });
        if (id === this.jK + "_n") this.a = { fase: 1, t: 0 };
        else if (id === this.jS + "_n") this.a = { fase: 2, t: 0 };
        else if (id === this.jS + "_m") this.a = { fase: 3, t: 0 };
        this.visArk();
    };

    P.loest = function (felt) {
        var c = this.opg && this.skema.celle(this.celleId(felt));
        return !!c && (c.status === "ok" || c.status === "svar");
    };

    /* Delene paa bordet dukker op, naar de bruges (REGELSAET 13) */
    P.synlig = function (del) {
        if (this.opgaver.erFri()) return true;
        if (del === "pil") return this.overgang || this.loest("nK");
        if (del === "hoejre") return this.loest("nS");
        return true;
    };

    /* ----- Arket med beregningen ------------------------------------------------------------ */
    P.visArk = function () {
        var e = this.e.ark, mig = this, x = this.x;
        if (!e || !x) return;
        var h;
        if (!this.linjer.length) h = '<p class="va-tom">Beregningen</p>';
        else {
            h = this.linjer.map(function (l) {
                var navn = l.felt === "mS" ? "Massen af " + x.stS.navn : "Stofmængden af " + (l.felt === "nK" ? x.stK.navn : x.stS.navn);
                /* Bliver linjen for lang, brydes den foer et lighedstegn (REGELSAET 50) */
                var regn = mig.skema.regnHTML(l.id).split(" = ").map(function (d, i) { return '<span class="va-led">' + (i ? "= " : "") + d + "</span>"; }).join(" ");
                return '<div class="va-linje' + (l.svar ? " svar" : "") + '"><div class="va-navn">' + NK.html(navn) + '</div><div class="va-regn">' + regn + "</div></div>";
            }).join("");
        }
        if (h !== this._ark) {
            e.innerHTML = h;
            this._ark = h;
        }
        e.classList.toggle("tom", !this.linjer.length);
    };

    /* ----- Kortets plads -------------------------------------------------------------------
       Kortet staar under raekken (top 46 px). Pladsen er det hoejeste, kortet
       kan blive paa fanen, maalt i en usynlig kopi (REGELSAET 4). */
    P.zoneNoegle = function () {
        var e = this.e.skort;
        return e.parentNode.clientWidth + "x" + window.innerHeight + (document.fonts && document.fonts.status === "loaded" ? "f" : "");
    };

    P.kortZone = function () {
        var e = this.e.skort;
        var top = e.offsetTop || 46;
        if (!e.parentNode || !e.parentNode.clientWidth) return top + 170;
        var noegle = this.zoneNoegle();
        if (this.zone && this.zoneN === noegle) return top + this.zone;
        var kopi = e.cloneNode(true);
        kopi.removeAttribute("id");
        Array.prototype.forEach.call(kopi.querySelectorAll("[id]"), function (y) { y.removeAttribute("id"); });
        kopi.hidden = false;
        kopi.style.visibility = "hidden";
        kopi.style.pointerEvents = "none";
        kopi.classList.remove("blink");
        e.parentNode.appendChild(kopi);
        var h = this.opgaver.maalZone(kopi);
        kopi.parentNode.removeChild(kopi);
        this.zone = Math.max(90, Math.ceil(h) + 2);
        this.zoneN = noegle;
        return top + this.zone;
    };

    P.kortSkiftet = function () { };

    /* ----- Layout ---------------------------------------------------------------------------- */
    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay || (this.zoneN && this.zoneN !== this.zoneNoegle())) this.layout();
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        if (!this.opg || W < 10) return;
        var lay = { W: W, H: H };
        var top = this.kortZone() + 10;
        lay.bordY = Math.round(H - NK.klamp(H * 0.06, 18, 44));
        /* Scenen staar samlet i midten (REGELSAET 32) */
        var maxB = Math.min(W - 24, 1340), x0 = Math.round((W - maxB) / 2);
        lay.x0 = x0;
        lay.maxB = maxB;
        var fri = lay.bordY - top;
        var tH = Math.round(NK.klamp(fri * 0.52, 170, 400));
        /* Arket med beregningen til hoejre for skemaet; paa en smal skaerm er der ikke plads */
        lay.smal = W < 900;
        var aB = lay.smal ? 0 : Math.round(NK.klamp(maxB * 0.34, 300, 470));
        var tB = maxB - (aB ? aB + 14 : 0);
        lay.tavle = { x: x0, y: top, b: tB, h: tH };
        lay.ark = aB ? { x: x0 + tB + 14, y: top, b: aB, h: tH } : null;
        var ind = NK.klamp(tB * 0.03, 8, 22);
        this.skema.layout({ x: x0 + ind, y: top + ind * 0.6, b: tB - 2 * ind, h: tH - ind * 1.2 }, this.L.ctx);
        var ea = this.e.ark;
        if (ea) {
            ea.hidden = !lay.ark;
            if (lay.ark) {
                ea.style.left = lay.ark.x + "px";
                ea.style.top = lay.ark.y + "px";
                ea.style.width = lay.ark.b + "px";
                ea.style.height = lay.ark.h + "px";
                ea.style.fontSize = Math.round(NK.klamp(aB / 27, 13, 16.5)) + "px";
            }
        }
        /* Vaegtene og krukkerne paa bordet */
        var zoneTop = top + tH + 16;
        var A = lay.bordY - zoneTop;
        var vb = NK.klamp(Math.min(maxB * 0.2, A * 1.2), 100, 270);
        var vh = Tg.vaegtHoejde(vb);
        var jh = NK.klamp(Math.min(vb * 0.66, A * 0.66), 54, 140);
        var jb = Tg.krukkeBredde(jh);
        lay.vb = vb;
        lay.vh = vh;
        lay.jh = jh;
        lay.jb = jb;
        lay.krukkeV = { x: x0 + 8 + jb / 2, y: lay.bordY };
        lay.vaegtV = { x: lay.krukkeV.x + jb / 2 + 12 + vb / 2, y: lay.bordY };
        lay.krukkeH = { x: x0 + maxB - 8 - jb / 2, y: lay.bordY };
        lay.vaegtH = { x: lay.krukkeH.x - jb / 2 - 12 - vb / 2, y: lay.bordY };
        var sk = NK.Sprites.MAAL.vaegt, k = vb / sk.b;
        lay.skaalY = lay.bordY - sk.bund * k + sk.skaalY * k;
        lay.pose = NK.klamp(Math.min(vb * 0.26, (lay.skaalY - zoneTop) * 0.42), 26, 58);
        /* Reaktionspilen midt mellem vaegtene, hoejst 460 px lang */
        var mid = (lay.vaegtV.x + lay.vaegtH.x) / 2;
        var halv = Math.min((lay.vaegtH.x - lay.vaegtV.x) / 2 - vb / 2 - 14, 230);
        lay.pilX0 = mid - halv;
        lay.pilX1 = mid + halv;
        lay.pilY = Math.max(zoneTop + 46, lay.skaalY - lay.pose * 1.9);
        lay.venteX = mid;
        /* Den stiplede plads for vaegten til hoejre og krukken */
        var hp = Math.max(vh, jh) + 26;
        lay.hoejrePlads = { x: lay.vaegtH.x - vb / 2 - 8, y: lay.bordY - hp, b: lay.krukkeH.x + jb / 2 + 8 - (lay.vaegtH.x - vb / 2 - 8), h: hp - 6 };
        this.lay = lay;
        this.saetAnker("skema", lay.tavle.x, lay.tavle.y, lay.tavle.b, tH);
        this.saetAnker("vaegte", x0, zoneTop, maxB, lay.bordY - zoneTop + 10);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el("vej-anker-" + id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(Math.max(1, b)) + "px";
        e.style.height = Math.round(Math.max(1, h)) + "px";
    };

    /* ----- Tegneloekken ------------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        this.skema.opdater(dt);
        this.opdaterScene(dt);
    };

    P.opdaterScene = function (dt) {
        var a = this.a;
        if (!a) return;
        a.t += dt;
        var mS = this.x.mS;
        /* Displayene: venstre falder til 0, naar poserne er gaaet; hoejre
           taeller op, naar de nye er paa vaegten */
        if (a.fase >= 2 && a.t > 0.9) this.visVenstre = NK.mod(this.visVenstre, 0, 6, dt);
        if (a.fase === 3 && a.t > 0.8) {
            this.visHoejre = NK.mod(this.visHoejre, mS, 5, dt);
            if (Math.abs(this.visHoejre - mS) < 0.005) this.visHoejre = mS;
        }
    };

    P.pladser = function (n, cx, bund) {
        return Tg.posePladser(n, cx, bund, this.lay.pose, 3);
    };

    function bue(p0, p1, t, hoejde) {
        var u = NK.blod(t);
        return { x: NK.lerp(p0.x, p1.x, u), y: NK.lerp(p0.y, p1.y, u) - Math.sin(u * Math.PI) * hoejde };
    }

    /* En stiplet plads med navnet, til tingen bruges (REGELSAET 13) */
    P.tegnPlads = function (ctx, R, navn) {
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#4a4f5e";
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = lex("400", NK.klamp(R.b / 16, 13, 16));
        ctx.fillStyle = "#8f97a3";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(navn, R.x + R.b / 2, R.y + R.h / 2);
        ctx.restore();
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.opg) return;
        var x = this.x, stK = x.stK, stS = x.stS;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.tavle(ctx, lay.tavle);
        this.skema.tegn(ctx, this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);

        /* Det kendte stof: krukken og vaegten til venstre */
        Tg.krukke(ctx, lay.krukkeV.x, lay.krukkeV.y, lay.jh, stK, {});
        var vV = Tg.vaegt(ctx, lay.vaegtV.x, lay.vaegtV.y, lay.vb, Tg.gram(this.visVenstre), {});
        var bb = vV.b * 0.72, a = this.a;
        var tBunke = a.fase === 0 ? 1 : (a.fase === 1 ? 1 - NK.klamp(a.t / 0.7, 0, 1) : 0);
        Tg.bunke(ctx, vV.x, vV.y, bb, stK, tBunke, lay.pose * 0.7, 3);

        /* Reaktionspilen med forholdet; den lyser, mens poserne gaar igennem */
        if (this.synlig("pil")) {
            var r = x.r, lK = r.led[x.jK], lS = r.led[x.jS];
            var pilTekst = (lK.k > 1 ? lK.k + " " : "") + stK.formel + " ⟶ " + (lS.k > 1 ? lS.k + " " : "") + stS.formel;
            var pilLys = a.fase === 2 && a.t > 0.5 && a.t < 1.6 ? 0.8 : 0;
            Tg.reaktionsPil(ctx, lay.pilX0, lay.pilX1, lay.pilY, pilTekst, { lys: pilLys });
        }

        /* Det soegte stof: vaegten til hoejre, eller en stiplet plads */
        var vH = null;
        if (this.synlig("hoejre")) {
            Tg.krukke(ctx, lay.krukkeH.x, lay.krukkeH.y, lay.jh, stS, { fyld: 0.3 });
            vH = Tg.vaegt(ctx, lay.vaegtH.x, lay.vaegtH.y, lay.vb, Tg.gram(this.visHoejre), { lys: a.fase === 3 ? 0.6 : 0 });
            Tg.bunke(ctx, vH.x, vH.y, bb, stS, 0, lay.pose * 0.7, 5);
        } else {
            this.tegnPlads(ctx, lay.hoejrePlads, "Vægten til " + stS.navn);
        }
        this.tegnPoser(ctx, vV, vH, stK, stS);
    };

    /* Poserne: paa vaegten til venstre (fase 1), paa vej gennem pilen
       (fase 2), paa bordet under pilen og til sidst paa vaegten til hoejre */
    P.tegnPoser = function (ctx, vV, vH, stK, stS) {
        var lay = this.lay, a = this.a, s = lay.pose;
        var nK = this.opg.n[this.jK], nS = this.opg.n[this.jS];
        var fraV = this.pladser(nK, vV.x, vV.y - 3);
        var vente = this.pladser(nS, lay.venteX, lay.bordY);
        var pilStart = { x: lay.pilX0 + 8, y: lay.pilY }, pilSlut = { x: lay.pilX1 - 8, y: lay.pilY };
        if (a.fase === 1) {
            fraV.forEach(function (p, i) {
                var t = NK.klamp((a.t - 0.2 - i * 0.14) / 0.35, 0, 1);
                if (t <= 0) return;
                Tg.pose(ctx, p.x, p.y, s * NK.pop(t), stK, { andel: p.andel });
            });
        } else if (a.fase === 2) {
            fraV.forEach(function (p, i) {
                var t = NK.klamp((a.t - i * 0.12) / 0.7, 0, 1);
                var q = bue(p, pilStart, t, s * 0.9);
                Tg.pose(ctx, q.x, q.y, s * (1 - 0.5 * t), stK, { andel: p.andel, alfa: 1 - NK.klamp((t - 0.75) / 0.25, 0, 1) });
            });
            vente.forEach(function (p, i) {
                var t = NK.klamp((a.t - 1.0 - i * 0.14) / 0.7, 0, 1);
                if (t <= 0) return;
                var q = bue(pilSlut, p, t, s * 0.5);
                Tg.pose(ctx, q.x, q.y, s * (0.5 + 0.5 * t), stS, { andel: p.andel, alfa: NK.klamp(t * 3, 0, 1) });
            });
        } else if (a.fase >= 3 && vH) {
            var paaH = this.pladser(nS, vH.x, vH.y - 3);
            paaH.forEach(function (p, i) {
                var t = NK.klamp((a.t - i * 0.1) / 0.6, 0, 1);
                var q = bue(vente[i], p, t, s * 0.8);
                Tg.pose(ctx, q.x, q.y, s, stS, { andel: p.andel });
            });
        }
    };

    /* ----- Musen: scenen er laast, mens kortet spoerger (REGELSAET 15) ----------------------- */
    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            c.style.cursor = mig.opgaver && mig.opgaver.erFri() && mig.overVaegt(mig.L.punkt(e)) ? "pointer" : "default";
        });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e), O = mig.opgaver;
            if (O.erFri()) {
                var v = mig.overVaegt(pt), x = mig.x;
                if (v === "v") O.saetBesked(NK.html(D.tekstMasse(x.m) + " g " + x.stK.navn + ". Den masse står også i skemaet."), "peger");
                else if (v === "h") O.saetBesked(NK.html(mig.loest("mS") ? "Vægten viser den masse, du har regnet ud." : "Vægten er tom, til massen er regnet ud."), "peger");
                return;
            }
            O.spaer();
        });
    };

    P.overVaegt = function (pt) {
        var lay = this.lay;
        if (!lay || !pt || pt.y < lay.skaalY - lay.pose * 2 || pt.y > lay.bordY) return null;
        if (Math.abs(pt.x - lay.vaegtV.x) < lay.vb / 2) return "v";
        if (Math.abs(pt.x - lay.vaegtH.x) < lay.vb / 2) return "h";
        return null;
    };

    P.fokus = function () { this.opgaver.fokus(); };
    P.enter = function () { this.opgaver.enter(); };
    P.nulstil = function () { this.opgaver.forfra(); };

    NK.SimVej = SimVej;
}());
