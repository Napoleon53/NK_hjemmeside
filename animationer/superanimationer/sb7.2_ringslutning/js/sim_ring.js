/* =====================================================================
   sim_ring.js - fane 1: Ringen lukker sig

   To opgaver (D.RING): glucose og fructose. Hver opgave har tre trin:
     ilt     eleven klikker paa det oxygenatom, der lukker ringen
     luk     knappen paa kortet laegger kaeden paa siden; saa traekker
             eleven selv det orange oxygenatom hen til carbonylgruppens
             carbonatom, og ringen lukker sig; bagefter et spoergsmaal
     alfa    α eller β
   Intet bedoemmes foer Indsend svar. Traekket er en handling, ikke et
   svar. Naar oxygenatomet er fundet, er det orange (med sit H), og
   aldehydgruppens oxygenatom er groent, som i bogens figur over
   ringslutningen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Sukker;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.2-ring";

    /* Forloebene: rammer, maade og varighed i sekunder */
    var FORLOEB = {
        vip: [{ fra: "K0", til: "K0r", m: "rot", d: 1.4 }]
    };
    /* Traekket boejer kaeden fra K0r mod K1 */
    var BOEJ = { fra: "K0r", til: "K1", m: "polar", sent: { C6: 0.9 } };
    var SNAP = 0.97;               /* her klikker oxygenatomet paa plads under traekket */
    var SLIP_OK = 0.7;             /* slippes det laengere fremme, lukker ringen sig alligevel */
    var STI_N = 60;                /* punkter paa oxygenatomets vej (musen foelger den) */

    /* Ringen tegnes stoerre end den lange kaede */
    var ZOOM = { K0: 1, K0r: 1, K1: 1.4, K1d: 1.4, K2: 1.4 };
    var NAVN_RAMME = { K0: "Åben kæde (fischerprojektion)", K0r: "Kæden på siden", K1: "Kæden er bøjet", K1d: "Kæden er bøjet", K2: "Ringen" };

    function SimRing() {
        var mig = this;
        this.opgaver = D.RING;
        this.hentStatus();
        this.startFane();
        this.bygListe();
        NK.el("r-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("r-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
    }

    var P = SimRing.prototype;
    F.paa(P, "r");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.opgaver.map(function (o) {
            var g = gemt[o.sukker] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.status.forEach(function (s, i) { ud[mig.opgaver[i].sukker] = { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function () { return this.status.filter(function (s) { return s.loest; }).length; };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.bygListe = function () {
        var html = "";
        this.opgaver.forEach(function (o, i) {
            html += '<button type="button" class="opg-chip" data-opg="' + i + '"><span class="oc-f"><b>' + (i + 1) + "</b> " +
                NK.html(o.navn) + '</span><i class="oc-m"></i></button>';
        });
        NK.el("r-liste").innerHTML = html;
    };

    P.visListe = function () {
        var chips = NK.el("r-liste").querySelectorAll("[data-opg]");
        for (var k = 0; k < chips.length; k++) {
            var i = parseInt(chips[k].getAttribute("data-opg"), 10), s = this.status[i];
            chips[k].classList.toggle("valgt", i === this.nr);
            chips[k].classList.toggle("loest", s.loest);
            chips[k].classList.toggle("stjerne", s.stjerne);
            chips[k].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        NK.saetTekst("r-loest", String(this.antalLoest()));
        /* Trinnene i den aktuelle opgave */
        var mig = this, html = "";
        this.opg.trin.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span>" + NK.html(t.navn) + "</li>";
        });
        NK.saetHTML("r-trin", html);
        NK.saetTekst("r-trin-navn", this.opg.navn);
    };

    /* ----- En opgave ---------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.opg = this.opgaver[i];
        var su = D.SUKKER[this.opg.sukker];
        this.su = su;
        this.M = S.model(this.opg.sukker, su.sider, su.keto);
        this.ramme = "K0";
        this.anim = null;
        this.fejl = false;
        this.sv = false;
        this.formNavn = null;
        this.sejrT = null;
        this.kasser = {};
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.opg.trin[j];
        this.fase = this.trin.forsoeg ? "forsoeg" : this.trin.slags;
        this.valgt = null;
        this.forkert = {};
        this.groen = null;
        this.hover = null;
        this.traekU = null;        /* hvor langt kaeden er boejet under traekket (0 til 1) */
        this.trukket = false;      /* eleven holder oxygenatomet lige nu */
        this.fjeder = false;       /* kaeden glider tilbage efter et slip for tidligt */
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    /* Er oxygenatomet, der lukker ringen, fundet? Saa faar det farve */
    P.farvet = function () {
        var i = -1;
        this.opg.trin.forEach(function (t, j) { if (t.slags === "ilt") i = j; });
        return this.trinNr > i || (this.trinNr === i && !!this.groen);
    };

    /* Numrene staar paa fra start */
    P.visNumre = function () { return true; };

    P.kortData = function () {
        var t = this.trin, mig = this;
        var chip = "Opgave " + (this.nr + 1) + " · Trin " + (this.trinNr + 1) + " af " + this.opg.trin.length;
        if (this.fase === "forsoeg") {
            return {
                slags: "opgave", chip: chip, tekst: t.forsoeg.tekst,
                ekstra: this.anim ? "" : '<div class="sk-handling"><button type="button" class="knap blaa" data-udfoer="1">' + NK.html(t.forsoeg.knap) + "</button></div>"
            };
        }
        if (this.fase === "traek") return { slags: "opgave", chip: chip, tekst: t.traek.tekst };
        if (this.fase === "spm") {
            return {
                slags: "spm", chip: chip, tekst: t.tekst,
                svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; })
            };
        }
        return { slags: "opgave", chip: chip, tekst: t.tekst };
    };

    P.skjulIndsend = function () { return this.fase === "forsoeg" || this.fase === "traek"; };
    P.skjulHint = function () { return this.fase === "forsoeg" || this.fase === "traek"; };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.fase === "ilt" || this.fase === "spm") return this.valgt !== null;
        return false;
    };

    P.indsendTekst = function () { return "Indsend svar"; };

    P.ingentingTekst = function () {
        if (this.fase === "ilt") return "Klik på et oxygenatom på tavlen først.";
        if (this.fase === "forsoeg") return "Tryk på knappen på kortet først.";
        if (this.fase === "traek") return "Træk det orange oxygenatom hen til carbonatom " + this.M.lukker.slice(1) + " først.";
        return "Vælg et af svarene på kortet først.";
    };

    P.indsend = function () { this.bedoem(false); };

    P.bedoem = function (vist) {
        var t = this.trin, tekst = null;
        if (this.fase === "ilt") {
            if (this.valgt !== t.rigtig) {
                tekst = t.fejl[this.valgt] || t.fejl.O2;
                this.forkert[this.valgt] = true;
                this.valgt = null;
            }
        } else if (this.fase === "spm") {
            if (this.valgt !== t.rigtig) {
                tekst = t.fejl[this.valgt];
                this.forkert[this.valgt] = true;
                this.valgt = null;
            }
        } else return;
        if (tekst) {
            this.fejl = true;
            this.visKort();
            this.fejlLinje(tekst);
            return;
        }
        this.rigtig(vist);
    };

    P.rigtig = function (vist) {
        var t = this.trin, sidste = this.trinNr === this.opg.trin.length - 1;
        if (t.navnEfter) this.formNavn = t.navnEfter;
        var tekst = t.forkl, foerste = false, alle = false;
        if (sidste) {
            var st = this.status[this.nr];
            foerste = !st.loest;
            st.loest = true;
            st.stjerne = st.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            alle = this.antalLoest() === this.opgaver.length;
            if (alle && foerste) tekst += " " + D.RING_FAERDIG;
        }
        var knap;
        if (!sidste) knap = "Næste trin →";
        else if (this.naesteUloeste() >= 0) knap = "Næste opgave →";
        else knap = "Videre til Fra fischer til haworth →";
        this.groen = { spm: true, svarNr: this.fase === "spm" ? t.rigtig : undefined, maade: vist || this.sv ? "svar" : "selv", tekst: tekst, knap: knap };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        /* Konfetti kun, naar en hel opgave er loest */
        if (sidste && alle && foerste) NK.konfettiRegn(NK.el("fane-r").querySelector(".scene"), 60);
        else if (sidste) NK.konfetti(this.el.skort, 18);
    };

    /* Kortets knap gaar altid fremad. Begynd forfra staar i panelet */
    P.videre = function () {
        if (this.trinNr < this.opg.trin.length - 1) { this.startTrin(this.trinNr + 1); return; }
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-h");
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () {
        if (this.groen || this.anim) return;
        this.vaelg(this.nr);
    };

    /* ----- Hjaelpen ------------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen || this.fase === "forsoeg" || this.fase === "traek") return [];
        return this.trin.hint;
    };

    P.visSvar = function () {
        this.sv = true;
        this.valgt = this.trin.rigtig;
        this.bedoem(true);
    };

    /* ----- Forsoeget: kaeden laegges paa siden ---------------------------------------- */
    P.udfoer = function () {
        if (this.fase !== "forsoeg" || this.anim) return;
        this.anim = { seg: FORLOEB[this.trin.forsoeg.forloeb], i: 0, t: 0 };
        this.visKort();
    };

    /* Ringen lukker sig fra der, hvor traekket slap */
    P.lukRing = function () {
        if (this.fase !== "traek" || this.anim) return;
        var u = this.traekU || 0;
        this.anim = { luk: true, i: 0, t: 0, seg: [
            { fra: BOEJ.fra, til: BOEJ.til, m: BOEJ.m, sent: BOEJ.sent, u0: u, d: Math.max(0.15, (1 - u) * 0.9) },
            { pause: 0.2 },
            { fra: "K1", til: "K1d", m: "lin", d: 0.45 },
            { pause: 0.5 },
            { fra: "K1d", til: "K2", m: "lin", d: 1.1 }
        ] };
        this.traekU = null;
        this.trukket = false;
        this.fjeder = false;
        this.besked("", "");
        this.visKort();
    };

    P.opdaterScene = function (dt) {
        /* Slippet for tidligt: kaeden glider tilbage paa siden */
        if (this.fjeder && this.traekU !== null) {
            this.traekU = Math.max(0, this.traekU - dt * 2.4);
            if (this.traekU === 0) { this.traekU = null; this.fjeder = false; }
        }
        if (!this.anim) return;
        var a = this.anim, seg = a.seg[a.i];
        a.t += dt;
        var d = seg.pause !== undefined ? seg.pause : seg.d;
        if (a.t < d) return;
        a.t -= d;
        if (seg.til) this.ramme = seg.til;
        a.i++;
        if (a.i >= a.seg.length) {
            this.anim = null;
            /* Efter vippet skal eleven selv lukke ringen; efter ringen kommer spoergsmaalet */
            this.fase = this.fase === "forsoeg" && this.trin.traek ? "traek" : "spm";
            this.valgt = null;
            this.nulstilHjaelp();
            this.visKort();
        }
    };

    /* Tilstanden ved en boejning u (0 til 1) under traekket */
    P.boejet = function (u) {
        var R = this.M.rammer;
        return { T: S.mellem(R[BOEJ.fra], R[BOEJ.til], u, BOEJ.m, BOEJ.sent, this.M.vaert),
                 z: NK.lerp(ZOOM[BOEJ.fra], ZOOM[BOEJ.til], u) };
    };

    /* Tilstanden lige nu, zoom og navn */
    P.nu = function () {
        var R = this.M.rammer, a = this.anim;
        if (a) {
            var seg = a.seg[a.i];
            if (seg.til) {
                var u = NK.blod(seg.d > 0 ? a.t / seg.d : 1);
                if (seg.u0 !== undefined) u = NK.lerp(seg.u0, 1, u);
                return { T: S.mellem(R[seg.fra], R[seg.til], u, seg.m, seg.sent, this.M.vaert),
                         z: NK.lerp(ZOOM[seg.fra], ZOOM[seg.til], u), ramme: u > 0.5 ? seg.til : seg.fra, u: u, seg: seg };
            }
        }
        if (this.traekU !== null && this.fase === "traek") {
            var b = this.boejet(this.traekU);
            return { T: b.T, z: b.z, ramme: "K0r", u: this.traekU, seg: null, boej: true };
        }
        return { T: S.tilstand(R[this.ramme]), z: ZOOM[this.ramme], ramme: this.ramme, u: 1, seg: null };
    };

    /* Oxygenatomets vej paa skaermen fra kaeden paa siden til ringen */
    P.sti = function () {
        var ud = [];
        for (var i = 0; i <= STI_N; i++) {
            var u = i / STI_N, b = this.boejet(u);
            var p = S.punkt(b.T, "O5", { cx: this.cx, cy: this.cy, s: this.s * b.z });
            ud.push({ x: p.x, y: p.y, u: u });
        }
        return ud;
    };

    /* ----- Musen ----------------------------------------------------------------------- */
    P.klikbare = function () {
        if (this.groen || this.anim) return [];
        if (this.fase === "ilt") {
            return this.su.keto ? ["C1", "O2", "O3", "O4", "O5", "C6"] : ["O1", "O2", "O3", "O4", "O5", "C6"];
        }
        return [];
    };

    /* Kassen om et emne; O5 tager sit H med */
    P.kasse = function (id) {
        if (id === "O5" && this.kasser.H5) return T.samlet([this.kasser.O5, this.kasser.H5]);
        return this.kasser[id];
    };

    P.ramt = function (pt) {
        if (!pt) return null;
        var liste = this.klikbare(), bedst = null, afst = 1e9;
        for (var i = 0; i < liste.length; i++) {
            var k = this.kasse(liste[i]);
            if (!k) continue;
            var m = 7;
            if (pt.x > k.x - m && pt.x < k.x + k.w + m && pt.y > k.y - m && pt.y < k.y + k.h + m) {
                var d = Math.abs(pt.x - (k.x + k.w / 2)) + Math.abs(pt.y - (k.y + k.h / 2));
                if (d < afst) { afst = d; bedst = liste[i]; }
            }
        }
        return bedst;
    };

    /* Kan oxygenatomet gribes her? */
    P.paaIlt = function (pt) {
        if (!pt || this.fase !== "traek" || this.anim || this.groen) return false;
        var k = this.kasse("O5");
        if (!k) return false;
        var m = 12;
        return pt.x > k.x - m && pt.x < k.x + k.w + m && pt.y > k.y - m && pt.y < k.y + k.h + m;
    };

    P.overScene = function (pt) {
        this.hover = this.ramt(pt);
        if (this.hover) return "pointer";
        if (this.fase === "traek") return this.trukket ? "grabbing" : (this.paaIlt(pt) ? "grab" : null);
        if (this.fase === "forsoeg" && !this.anim && pt && this.paaMolekyle(pt)) return "pointer";
        return null;
    };

    P.paaMolekyle = function (pt) {
        var t = this.lay && this.lay.tavle;
        return t && pt.x > t.x && pt.x < t.x + t.b && pt.y > t.y && pt.y < t.y + t.h;
    };

    P.nedScene = function (pt) {
        if (!this.paaIlt(pt)) return false;
        var u = this.traekU || 0;
        var b = this.boejet(u), o = S.punkt(b.T, "O5", { cx: this.cx, cy: this.cy, s: this.s * b.z });
        this.grebD = { x: pt.x - o.x, y: pt.y - o.y };
        this.traekU = u;
        this.trukket = true;
        this.fjeder = false;
        this.besked("", "");
        this.L.canvas.style.cursor = "grabbing";
        return true;
    };

    /* Oxygenatomet foelger musen langs sin vej; kun et stykke frem eller tilbage ad gangen */
    P.flytScene = function (pt) {
        if (!this.trukket || !pt) return;
        var maal = { x: pt.x - this.grebD.x, y: pt.y - this.grebD.y };
        var sti = this.sti(), u0 = this.traekU || 0, bedst = u0, afst = 1e9;
        sti.forEach(function (p) {
            if (Math.abs(p.u - u0) > 0.25) return;
            var d = (p.x - maal.x) * (p.x - maal.x) + (p.y - maal.y) * (p.y - maal.y);
            if (d < afst) { afst = d; bedst = p.u; }
        });
        this.traekU = bedst;
        if (bedst >= SNAP) {
            /* Oxygenatomet er naaet hen til carbonatomet: ringen lukker sig */
            this.greb = false;
            this.lukRing();
        }
    };

    P.opScene = function () {
        if (!this.trukket) return;
        this.trukket = false;
        this.L.canvas.style.cursor = "default";
        if ((this.traekU || 0) >= SLIP_OK) { this.lukRing(); return; }
        if ((this.traekU || 0) > 0.02) this.kortBesked("Træk oxygenatomet helt hen til carbonatom " + this.M.lukker.slice(1) + ".", 3);
        this.fjeder = true;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.anim) return;
        if (this.fase === "forsoeg") {
            if (this.paaMolekyle(pt)) { this.udfoer(); return; }
            this.kortBlink();
            return;
        }
        if (this.fase === "traek") {
            if (!this.paaIlt(pt)) this.kortBlink();
            return;
        }
        var id = this.ramt(pt);
        if (this.fase === "ilt") {
            if (!id) { this.kortBesked("Klik på et af oxygenatomerne i kæden.", 3); return; }
            this.valgt = this.valgt === id ? null : id;
            this.besked("", "");
            this.visKort();
            return;
        }
        this.kortBlink();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.s = Math.round(NK.klamp(Math.min((t.h - 40) / 7.0, t.b / 9.5), 30, 62));
        this.cx = t.x + t.b / 2;
        this.cy = t.y + (t.h - 34) / 2 + 0.25 * this.s;
        this.saetAnker("mol", t.x + t.b * 0.2, t.y + 8, t.b * 0.6, t.h - 16);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var t = lay.tavle;
        T.tavle(ctx, lay);
        var nu = this.nu();
        var cx = this.cx;
        /* Bindingen, eleven har trukket, staar stiplet, mens kaeden boejer helt */
        if (this.anim && this.anim.luk && (nu.ramme === "K0r" || nu.ramme === "K1") && nu.T.b[this.M.ringBind]) {
            nu.T.b[this.M.ringBind] = { o: 1, s: 1, w: S.TYND, a: 1 };
        }
        var view = { cx: cx, cy: this.cy, s: this.s * nu.z };

        /* Farverne efter ilt-trinnet: O5 og H orange, aldehydgruppens O groen */
        var farve = {}, bf = {};
        if (this.farvet()) {
            var co = this.M.carbonyl;
            farve.O5 = T.ORANGE;
            farve.H5 = T.ORANGE;
            farve[co] = T.GROEN;
            bf[this.M.ringBind] = T.ORANGE;
            bf[(this.su.keto ? "C2-" : "C1-") + co] = T.GROEN;
            var hjemme = nu.ramme === "K2";
            if (hjemme && (!nu.seg || nu.u > 0.7)) farve.H5 = T.GROEN;
        }

        /* Traekket: en stiplet linje fra oxygenatomet til carbonatomet, det skal binde sig til */
        var traek = this.fase === "traek" && !this.anim && !this.groen;
        if (traek) this.tegnMaal(ctx, nu.T, view);

        this.kasser = S.tegn(ctx, this.M, nu.T, view, { numre: this.visNumre(), farve: farve, bindFarve: bf });

        /* Det, eleven skal gribe, har en gul ramme */
        if (traek && !this.trukket) {
            var ko = this.kasse("O5");
            if (ko) T.gulRamme(ctx, ko.x - 7, ko.y - 5, ko.w + 14, ko.h + 10, 9);
        }

        /* Det, kortet spoerger om, har en gul ramme */
        if (this.fase === "spm" && !this.groen && this.trin.om) {
            /* om er en liste af grupper; hver gruppe faar sin egen ramme */
            this.trin.om.forEach(function (gruppe) {
                var k = T.samlet(gruppe.map(function (id) { return mig.kasser[id]; }));
                if (k) T.gulRamme(ctx, k.x - 7, k.y - 5, k.w + 14, k.h + 10, 9);
            });
        }

        /* Elevens valg og de forkerte forsoeg */
        if (this.fase === "ilt") {
            Object.keys(this.forkert).forEach(function (id) { if (id !== mig.valgt) T.valgRamme(ctx, mig.kasse(id), T.FORKERT, true); });
            if (this.valgt) T.valgRamme(ctx, this.kasse(this.valgt), this.groen ? "#2e8b57" : T.VALG);
        }
        if (this.hover && !this.groen && this.hover !== this.valgt) {
            var hk = this.kasse(this.hover);
            if (hk) {
                ctx.save();
                ctx.globalAlpha = 0.5;
                T.valgRamme(ctx, hk, T.VALG, true);
                ctx.restore();
            }
        }

        /* Navnet under molekylet */
        var navn = NAVN_RAMME[nu.ramme];
        if (nu.ramme === "K2" && this.formNavn && !nu.seg) navn = this.formNavn;
        if (nu.ramme === "K0") navn = D.stor(this.su.navn) + " som åben kæde (fischerprojektion)";
        if (nu.boej && nu.u > 0.05) navn = "Kæden bøjer";
        T.billedtekst(ctx, cx, t.y + t.h - 20, navn, { farve: nu.seg || nu.boej ? T.DAEMPET : T.BLAEK });

        /* Skiltet ved molekylet, naar forsoeget eller traekket venter */
        if ((this.fase === "forsoeg" && !this.anim) || (traek && !this.trukket && !(this.traekU > 0))) {
            var top = 1e9;
            Object.keys(this.kasser).forEach(function (id) { top = Math.min(top, mig.kasser[id].y); });
            var skilt = this.fase === "forsoeg" ? "Klik: " + this.trin.forsoeg.knap.toLowerCase()
                : "Træk det orange O hen til carbonatom " + this.M.lukker.slice(1);
            T.skilt(ctx, cx, Math.max(t.y + 40, top - 4), skilt, { min: t.x + 4, maks: t.x + t.b - 4 });
        }
        this.tegnSejr(ctx, t);
    };

    /* Den kommende binding som stiplet linje og en stiplet ring om carbonatomet */
    P.tegnMaal = function (ctx, Tn, view) {
        var o = S.punkt(Tn, "O5", view), c = S.punkt(Tn, this.M.lukker, view);
        if (!o || !c) return;
        var r = Math.max(15, view.s * 0.36);
        ctx.save();
        ctx.strokeStyle = "rgba(217, 72, 15, 0.55)";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 6]);
        var dx = c.x - o.x, dy = c.y - o.y, l = Math.sqrt(dx * dx + dy * dy);
        if (l > r + 18) {
            ctx.beginPath();
            ctx.moveTo(o.x + dx / l * 16, o.y + dy / l * 16);
            ctx.lineTo(c.x - dx / l * r, c.y - dy / l * r);
            ctx.stroke();
        }
        ctx.strokeStyle = T.ORANGE;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    NK.SimRing = SimRing;
}());
