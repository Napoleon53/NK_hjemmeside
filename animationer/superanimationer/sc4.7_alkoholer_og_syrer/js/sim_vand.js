/* =====================================================================
   sim_vand.js - fane 3: I vand

   Runde T11 (27. nov. 2026) efter REGELSAET. Fanen har sin egen fil og
   bruger ikke js/fane.js; opgaverne staar i js/vand_opgaver.js (motoren
   fra T10 i sc4.5) og D.OPG_VAND i js/data.js.

     * Intet panel (REGELSAET 2-3): opgaverne staar i en raekke oeverst i
       scenen med Start forfra og Fri leg yderst til hoejre, og kortet
       staar centreret under raekken.
     * Scenen fra venstre: byggepladen (js/plade.js), reagensglasset med
       vand og stoffet foran en hvid plade, og til hoejre
       tommelfingerreglen og luppen.
     * Luppen og tommelfingerreglen er stiplede pladser med navnet, til de
       bruges (REGELSAET 13). Luppen kommer frem, naar eleven klikker paa
       glasset, og en kegle fra et forstoerrelsesglas paa glasset viser,
       hvor den kigger (REGELSAET 25). Luppen er et lyst kort som bogens
       figurer (REGELSAET 60) uden signatur under (REGELSAET 24).
     * Paa pladen staar kun det, eleven kan bruge lige nu: skifteren Alle
       atomer / Zigzag kun i fri leg, knapperne − og + kun naar kortet
       beder om kaeden, og paa hylden kun den gruppe, der skal bruges
       (REGELSAET 19a, 57).
     * Mens tommelfingerreglen bruges, og glasset er skjult, viser
       oversigten hverken farver, pil eller konklusion (REGELSAET 38).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var GRUPPER = ["H", "OH", "COOH"];
    function lex(v, px) { return v + " " + Math.round(px) + "px Lexend, 'Segoe UI', sans-serif"; }

    function SimVand() {
        this.L = new NK.Laerred(NK.el("vand-laerred"));
        this.e = { skort: NK.el("vand-skort") };
        this.plade = new NK.Plade();
        this.glas = new NK.Glas();
        this.lup = new NK.Lup("vand", true);
        this.g = "OH";
        this.n = 2;
        this.tid = 0;
        this.over = null;
        this.traek = null;
        this.lupKlikket = false;
        this.glasVar = false;
        this.saetMolekyle("OH", 2, true);
        this.koblMus();
        this.opgaver = new NK.VandOpgaver(this, D.OPG_VAND);
        this.opgaver.start();
    }

    var P = SimVand.prototype;

    /* ----- Stoffet --------------------------------------------------------------------- */
    P.stofNu = function () { return D.stof(this.g, this.n); };

    P.saetMolekyle = function (g, n, straks) {
        this.g = g;
        this.n = g === "glycerol" ? 3 : NK.klamp(n, 0, D.maksN(g));
        var s = this.stofNu();
        this.plade.saet(s, straks);
        this.glas.saet(s, straks);
        this.lup.saet(s, null, straks);
    };

    /* Eleven har bygget noget nyt */
    P.skift = function (g, n) {
        if (g !== "glycerol") n = NK.klamp(n, 0, D.maksN(g));
        if (g === this.g && n === this.n) return false;
        this.saetMolekyle(g, n);
        var s = this.stofNu(), O = this.opgaver, t = O.trin();
        var ved = O.tilstand === "trin" && t && t.beskedVed ? t.beskedVed(s) : "";
        if (ved) O.saetBesked(NK.html(ved), "peger");
        else if (!s.organisk && D.PAASKE[s.id]) {
            if (O.erFri()) O.friBesked(D.PAASKE[s.id]);
            else O.saetBesked(NK.html(D.PAASKE[s.id]), "peger");
        } else if (O.besked && (O.besked.klasse === "skidt" || O.besked.klasse === "peger")) O.saetBesked("", "");
        return true;
    };

    /* Glasset er rystet, og lagene har skilt sig */
    P.glasFaerdigt = function () { return this.glas.t > 1.5; };

    /* Klik paa glasset: luppen kommer frem (fane 3, opgave 1, trin 2) */
    P.klikGlas = function () {
        this.lupKlikket = true;
        this.opgaver.brug("glas");
    };

    /* ----- Opgaverne --------------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        this.traek = null;
        this.lupKlikket = false;
        this.saetMolekyle(o.start.g, o.start.n, true);
    };

    P.fri = function () { return this.opgaver.erFri(); };
    P.maa = function (hvad) { return this.opgaver.tillad(hvad); };
    P.skjult = function (del) { return this.opgaver.skjult(del); };
    P.friStart = function () { this.traek = null; };
    P.nulstil = function () { this.opgaver.forfra(); };
    P.fokus = function () { };

    /* Det, kortet handler om lige nu, faar en rolig gul ring (trin.om) */
    P.omNu = function () {
        var t = this.opgaver.trin();
        if (this.opgaver.tilstand !== "trin" || !t) return [];
        return t.om || [];
    };

    /* ----- Kortets plads ------------------------------------------------------------------
       Kortet staar under raekken (top 46 px). Pladsen er det hoejeste, kortet
       kan blive paa fanen, maalt i en usynlig kopi (REGELSAET 4). */
    P.zoneNoegle = function () {
        var e = this.e.skort;
        return e.parentNode.clientWidth + "x" + window.innerHeight + (document.fonts && document.fonts.status === "loaded" ? "f" : "");
    };

    P.kortZone = function () {
        var e = this.e.skort;
        var top = e.offsetTop || 46;
        if (!e.parentNode || !e.parentNode.clientWidth) return top + 150;
        var noegle = this.zoneNoegle();
        if (this.zone && this.zoneN === noegle) return top + this.zone;
        var kopi = e.cloneNode(true);
        kopi.removeAttribute("id");
        Array.prototype.forEach.call(kopi.querySelectorAll("[id]"), function (x) { x.removeAttribute("id"); });
        kopi.hidden = false;
        kopi.style.visibility = "hidden";
        kopi.style.pointerEvents = "none";
        kopi.classList.remove("blink");
        e.parentNode.appendChild(kopi);
        var h = this.opgaver.maalZone(kopi);
        kopi.parentNode.removeChild(kopi);
        this.zone = Math.max(80, Math.ceil(h) + 2);
        this.zoneN = noegle;
        return top + this.zone;
    };

    /* ----- Scenen ------------------------------------------------------------------------- */
    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var top = this.kortZone() + 10, bund = H - 12;
        /* Paa en hoej skaerm rykkes scenen lidt ned, saa den ikke staar
           klemt op under kortet med et tomt felt nederst (REGELSAET 32).
           Kun vinduets stoerrelse taeller, saa intet hopper (REGELSAET 4). */
        var ekstra = Math.max(0, bund - top - 620);
        top += Math.round(Math.min(40, ekstra / 4));
        lay.top = top;
        /* Scenen staar samlet i midten, ogsaa paa en stor skaerm (REGELSAET 32) */
        var maxB = Math.min(W - 24, 1340);
        var x0 = Math.round((W - maxB) / 2), gap = 18;
        var pb = NK.klamp(maxB * 0.38, 330, 540);
        var gb = NK.klamp(maxB * 0.15, 150, 210);
        var rb = maxB - pb - gb - 2 * gap;
        if (rb < 250) { pb = Math.max(300, pb - (250 - rb)); rb = maxB - pb - gb - 2 * gap; }
        lay.plade = { x: x0, y: top, b: pb, h: Math.min(bund - top, 560) };
        this.plade.layout(lay.plade, { visNavn: true });
        lay.instr = { x: x0 + pb + gap, y: top, b: gb, h: Math.min(bund - top, 520) };
        var rx = lay.instr.x + gb + gap;
        var rh = NK.klamp((bund - top) * 0.32, 140, 175);
        lay.regel = { x: rx, y: top, b: rb, h: rh };
        var lTop = top + rh + 34;
        /* Paa en stor skaerm bliver luppen hoejere, og molekylerne i den stoerre */
        var lh = Math.max(130, Math.min(bund - 8 - lTop, 250 + Math.min(70, ekstra * 0.4), rb * 0.5));
        lay.lup = { x: rx, y: lTop, b: rb, h: lh };
        this.lay = lay;
        this.saetAnker("plade", lay.plade.x, lay.plade.y, lay.plade.b, lay.plade.h);
        this.saetAnker("instr", lay.instr.x, lay.instr.y, lay.instr.b, lay.instr.h);
        this.saetAnker("regel", lay.regel.x, lay.regel.y, lay.regel.b, lay.regel.h);
        this.saetAnker("lup", lay.lup.x, lay.lup.y - 26, lay.lup.b, lay.lup.h + 26);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el("vand-anker-" + id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(Math.max(1, b)) + "px";
        e.style.height = Math.round(Math.max(1, h)) + "px";
    };

    P.opdater = function (dt) {
        this.tid += dt;
        /* Skriften Lexend kan komme, efter kortet er maalt: maal igen */
        if (this.zoneN && this.e.skort.parentNode.clientWidth && this.zoneN !== this.zoneNoegle()) this.layout();
        /* Kommer glasset frem efter et svar, rystes det igen */
        var gs = this.skjult("glas");
        if (this.glasVar && !gs) this.glas.t = 0;
        this.glasVar = gs;
        this.plade.opdater(dt);
        this.glas.opdater(dt);
        this.lup.saet(this.stofNu(), null);
        this.lup.opdater(dt);
        this.opgaver.opdater(dt);
    };

    /* Det paa pladen, eleven kan bruge lige nu */
    P.visPaaPladen = function () {
        if (this.fri()) return { stil: true, kontrol: true, tiles: GRUPPER };
        var mig = this;
        return {
            stil: false,
            kontrol: this.maa("laengde"),
            tiles: GRUPPER.filter(function (g) { return mig.maa("tile:" + g); })
        };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var s = this.stofNu(), om = this.omNu(), O = this.opgaver;

        this.plade.tegn(ctx, {
            over: this.over, traek: this.traek, laas: {}, tid: this.tid,
            vis: this.visPaaPladen(), om: om
        });

        /* Glasset */
        var t = O.trin();
        var glasSkjult = this.skjult("glas");
        var gr = this.glas.tegn(ctx, lay.instr, {
            skjult: glasSkjult,
            skjultTekst: t && t.type === "valg" ? "Glasset vises, når du har svaret" : "Glasset vises, når du har indsendt"
        });
        this.glasR = gr;
        if (om.indexOf("glas") >= 0 && gr) Tg.omRing(ctx, gr.x, gr.y, gr.b, gr.h);

        /* Tommelfingerreglen */
        if (this.skjult("regel")) this.tegnPlads(ctx, lay.regel, "Tommelfingerreglen");
        else {
            NK.tegnRegel(ctx, lay.regel, s, { skjult: glasSkjult });
            if (om.indexOf("regel") >= 0) Tg.omRing(ctx, lay.regel.x, lay.regel.y, lay.regel.b, lay.regel.h);
        }

        /* Luppen */
        if (this.skjult("lup")) this.tegnPlads(ctx, lay.lup, "Luppen");
        else this.tegnLup(ctx, lay.lup, gr, om.indexOf("lup") >= 0, glasSkjult);

        this.tegnOpfordring(ctx);
    };

    /* En stiplet plads med navnet, til tingen bruges (REGELSAET 13) */
    P.tegnPlads = function (ctx, R, navn) {
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#4a4f5e";
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, navn, R.x + R.b / 2, R.y + R.h / 2 + 5, { font: lex("400", 15), justering: "center", farve: "#8f97a3" });
    };

    /* Luppen: et lyst kort med en kegle fra et forstoerrelsesglas paa glasset */
    P.tegnLup = function (ctx, R, gr, fremhaev, glasSkjult) {
        var s = this.stofNu();
        if (gr && !glasSkjult) this.tegnKegle(ctx, gr, R);
        var titel = s.id === "vand" ? "Luppen: vandmolekyler" : "Luppen: ét molekyle " + s.navn + " i vand";
        NK.tekst(ctx, titel, R.x + 2, R.y - 10, { font: lex("500", Tg.passer(ctx, titel, R.b - 4, "600", 15, 12)), farve: "#e6eaef" });
        ctx.save();
        NK.rundtRekt(ctx, R.x + 2, R.y + 4, R.b, R.h, 12);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.fillStyle = "#fbfaf6";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#d9d4c6";
        ctx.stroke();
        ctx.restore();
        this.lup.tegn(ctx, R);
        if (fremhaev) Tg.omRing(ctx, R.x, R.y, R.b, R.h);
    };

    /* Forstoerrelsesglasset paa det oeverste lag i glasset og keglen derfra
       hen til luppen */
    P.tegnKegle = function (ctx, gr, R) {
        var cx = gr.x + gr.b / 2, cy = gr.y + gr.h * 0.47, r = Math.min(20, gr.b * 0.13);
        var tx = R.x, t1 = R.y + 10, t2 = R.y + R.h - 10;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.4, cy - r * 0.92);
        ctx.lineTo(tx, t1);
        ctx.lineTo(tx, t2);
        ctx.lineTo(cx + r * 0.4, cy + r * 0.92);
        ctx.closePath();
        ctx.fillStyle = "rgba(242, 197, 61, 0.07)";
        ctx.fill();
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(214, 160, 20, 0.7)";
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.4, cy - r * 0.92); ctx.lineTo(tx, t1);
        ctx.moveTo(cx + r * 0.4, cy + r * 0.92); ctx.lineTo(tx, t2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#c99400";
        ctx.stroke();
        ctx.restore();
    };

    /* Den gule ring og skiltet ved det, eleven skal bruge (REGELSAET 19-21) */
    P.tegnOpfordring = function (ctx) {
        var op = this.opgaver.opfordring();
        if (!op || this.traek) return;
        var pr = this.plade.r, lay = this.lay;
        var minX = 8, maxX = lay.W - 8;
        if (op.el === "plus") {
            Tg.ring(ctx, pr.plus.x, pr.plus.y, pr.plus.b, pr.plus.h, this.tid, 10);
            Tg.skiltUnder(ctx, op.tekst, pr.plus.x + pr.plus.b / 2, pr.plus.y + pr.plus.h + 2, lay.plade.x + 4, lay.plade.x + lay.plade.b - 4);
        } else if (op.el.indexOf("tile:") === 0) {
            var tl = pr.tiles[op.el.slice(5)];
            Tg.ring(ctx, tl.x, tl.y, tl.b, tl.h, this.tid, 10);
            Tg.skilt(ctx, op.tekst, tl.x + tl.b / 2, tl.y - 4, lay.plade.x + 4, lay.plade.x + lay.plade.b - 4);
        } else if (op.el === "glas" && this.glasR) {
            var g = this.glasR;
            Tg.ring(ctx, g.x, g.y, g.b, g.h, this.tid, 12);
            Tg.skilt(ctx, op.tekst, g.x + g.b / 2, g.y - 6, minX, maxX);
        }
    };

    /* ----- Musen og tastaturet ------------------------------------------------------------ */
    P.hvad = function (pt) {
        /* Pladen skal kende det synlige nu, ikke kun fra sidste billede */
        var v = this.visPaaPladen();
        this.plade.vis = { stil: v.stil, kontrol: v.kontrol, tiles: v.tiles };
        var h = this.plade.hit(pt);
        if (h) return h;
        if (this.glasR && Tg.inde(this.glasR, pt)) return "glas";
        if (this.lay && !this.skjult("lup") && Tg.inde(this.lay.lup, pt)) return "lup";
        return null;
    };

    /* Kan det, musen er over, bruges nu? */
    P.kanBruges = function (h) {
        if (!h) return false;
        if (this.fri()) return h !== "glas" && h !== "lup" && h !== "formel";
        if (h === "plus" || h === "minus") return this.maa("laengde");
        if (h.indexOf("tile:") === 0) return this.maa(h);
        if (h === "glas") return this.maa("glas");
        return false;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) {
                mig.traek.x = pt.x;
                mig.traek.y = pt.y;
                if (Math.abs(pt.x - mig.traek.x0) + Math.abs(pt.y - mig.traek.y0) > 6) mig.traek.flyttet = true;
                return;
            }
            var h = mig.hvad(pt);
            mig.over = h;
            c.style.cursor = mig.kanBruges(h) ? (h.indexOf("tile:") === 0 ? "grab" : "pointer") : "default";
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointerdown", function (e) {
            if (e.button !== undefined && e.button !== 0) return;
            var pt = mig.L.punkt(e), h = mig.hvad(pt);
            mig.slapNetop = false;
            if (!h || h.indexOf("tile:") !== 0) return;
            if (!mig.kanBruges(h)) { mig.opgaver.spaer(); return; }
            mig.traek = { g: h.slice(5), x: pt.x, y: pt.y, x0: pt.x, y0: pt.y, flyttet: false };
            c.style.cursor = "grabbing";
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            e.preventDefault();
        });
        function slip(e) {
            var t = mig.traek;
            if (!t) return;
            mig.traek = null;
            mig.slapNetop = true;
            c.style.cursor = "default";
            var pt = mig.L.punkt(e);
            /* Et klik paa gruppen eller et slip ved kaeden saetter gruppen paa */
            if (!t.flyttet || mig.plade.slipOmraade(pt)) {
                mig.opgaver.brug("tile:" + t.g);
                if (!mig.skift(t.g, mig.n) && t.g === mig.g) mig.besked("Gruppen −" + t.g + " sidder allerede på kæden.");
            } else mig.besked(D.trakForbi);
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
        c.addEventListener("click", function (e) {
            if (mig.slapNetop) { mig.slapNetop = false; return; }
            mig.klik(mig.L.punkt(e));
        });
    };

    /* En kort besked paa kortet (i fri leg med det roede kryds) */
    P.besked = function (tekst) {
        if (this.fri()) this.opgaver.friBesked(tekst);
        else this.opgaver.saetBesked(NK.html(tekst), "peger");
    };

    P.klik = function (pt) {
        var h = this.hvad(pt);
        if (!h) return;
        if (h === "stil:alle" || h === "stil:zigzag") {
            NK.formelStil = h.slice(5);
            NK.gem("nk-sc4.7-stil", NK.formelStil);
            return;
        }
        if (h === "plus" || h === "minus") { this.laengde(h === "plus" ? 1 : -1); return; }
        if (h === "glas") {
            if (this.maa("glas")) this.klikGlas();
            else if (!this.fri()) this.opgaver.spaer();
            return;
        }
        /* Et klik paa noget, kortet ikke har bedt om: kortet blinker (REGELSAET 15) */
        if (!this.fri() && h !== "tile:" + this.g) this.opgaver.spaer();
    };

    P.laengde = function (d) {
        if (!this.fri() && !this.maa("laengde")) { this.opgaver.spaer(); return; }
        this.opgaver.brug(d > 0 ? "plus" : "minus");
        /* Glycerol har ingen kaede at goere laengere: saa propan-1-ol */
        if (this.g === "glycerol") { this.skift("OH", 3 + d); return; }
        var n = this.n + d;
        if (n < 0) { this.besked(D.kortest); return; }
        if (n > D.maksN(this.g)) { this.besked(D.laengst); return; }
        this.skift(this.g, n);
    };

    /* Piletasterne og + og − goer kaeden kortere og laengere, Enter indsender */
    P.tast = function (e) {
        var k = e.key;
        if (k === "ArrowLeft" || k === "ArrowRight" || k === "+" || k === "-") {
            this.laengde(k === "ArrowRight" || k === "+" ? 1 : -1);
            return true;
        }
        if (k === "Enter") { this.opgaver.enter(); return true; }
        return false;
    };

    NK.SimVand = SimVand;
}());
