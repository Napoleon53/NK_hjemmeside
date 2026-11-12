/* =====================================================================
   sim_braender.js - fane 1: Braenderen

   En bunsenbraender med methan. Luftreguleringen styrer, hvor meget luft
   der blandes i gassen: lukket giver en gul, sodende flamme, aaben en blaa
   flamme. En kold ske paa et stativ kan skubbes ind i flammen, og luppen
   over flammen viser, hvad der kommer op: CO₂ og H₂O, og over den gule
   flamme ogsaa CO og sod.

   Braenderen, skeen og luftreguleringen er js/braender.js, luppen
   js/lup.js. Luppen er skjult i de to foerste opgaver (den kan vises med
   knappen Vis luppen) og fremme fra opgave 3, hvor den spoerges om
   (som sb8.6: ingen levende model i baggrunden, foer den bruges).

   Laasen: braenderen taendes, skeen skubbes ind, og luften stilles kun,
   mens kortet viser et forsoeg. I opgave 1 er luftreguleringen laast, saa
   flammen bliver gul.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    function SimBraender() {
        this.b = new NK.Braender();
        this.lupM = new NK.LupFlamme();
        this.lupVis = false;
        this.traek = false;
        this.over = null;
        this.indsendT = "";
        this.luftRoert = false;
        this.dypNu = 0;
        this.startFane(D.B_MAAL);
        this.visPanel();
    }

    var P = SimBraender.prototype;
    NK.Fane.paa(P, { navn: "b", naesteFane: "fane-a", naesteNavn: "Afstem forbrændingen" });

    /* ----- Maalene --------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        var s = o.start || {}, b = this.b;
        if (s.taendt === false) b.sluk();
        else if (s.taendt && !b.taendt) { b.taend(); b.taendT = 1; }
        if (s.luft !== undefined) b.saetLuft(s.luft, true);
        if (s.blaa && b.luft < D.BLAA_FRA) b.saetLuft(D.LUFT.length - 1, true);
        b.rensSke();
        if (o.lup) this.lupVis = true;
        this.lupM.saet(b.luft, true);
        this.luftRoert = false;
        this.dypNu = 0;
        this.traek = false;
        if (this.status) this.visPanel();
    };

    P.efterOpgave = function () { this.visPanel(); };

    P.nulstilScene = function () {
        if (!this.iForsoeg()) { this.kortBlink(); return; }
        this.nyOpgave(this.opg.o);
        this.visIndsend();
    };

    /* Vis svaret: braenderen goer det, forsoeget beder om */
    P.forsoegSvar = function (o, del) {
        var b = this.b;
        if (!b.taendt) { b.taend(); b.taendT = 1; }
        if (del.maal === "sod") { b.saetLuft(0, true); b.rensSke(); b.ske.sod = 1; }
        else if (del.maal === "blaa") b.saetLuft(D.LUFT.length - 1);
        else if (del.maal === "gul") b.saetLuft(0);
        this.lupM.saet(b.luft);
        return del.set;
    };

    /* ----- Indsend svar: luftreguleringens trin ---------------------------------------- */
    P.kanIndsendes = function () { return this.b.taendt && !this.traek; };

    P.indsendTekst = function () { return "Indsend svar: luften " + D.LUFT[this.b.luft].navn; };

    P.ikkeKlar = function () { return D.taendFoerst; };

    P.forsoegIndsend = function () {
        var del = this.opg.del, pos = this.b.luft;
        if (del.maal === "blaa") {
            if (pos >= D.BLAA_FRA) { this.forsoegKlaret(); return; }
            this.fejlLinje(D.forLidtLuft(pos));
            return;
        }
        if (del.maal === "gul") {
            if (pos === 0) { this.forsoegKlaret(); return; }
            this.fejlLinje(D.forMegetLuft);
        }
    };

    /* ----- Panelet: de to flammer ------------------------------------------------------- */
    P.visPanel = function () {
        var mig = this, html = "";
        D.FLAMMER.forEach(function (f) {
            html += '<div class="flamme-blok ' + f.id + '"><h3>' + NK.html(f.navn) + "</h3><dl>";
            f.linjer.forEach(function (l) {
                var kendt = mig.erLoest(l.efter);
                html += "<dt>" + NK.html(l.t) + "</dt><dd" + (kendt ? "" : ' class="mat"') + ">" + (kendt ? NK.html(l.v) : "…") + "</dd>";
            });
            html += "</dl></div>";
        });
        NK.saetHTML("b-flammer", html);
    };

    /* ----- Scenen --------------------------------------------------------------------
       Braenderen med skeen og luftreguleringen til venstre, luppen til hoejre
       (som glas og lup i sc4.6). */
    var DEL = 0.54;

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        lay.yBord = H - 46;
        var top = 10 + this.kortZone() + 14;
        lay.top = top;
        var delX = Math.round(W * DEL);
        lay.delX = delX;
        /* Hoejden: braenderen (216), den gule flamme (168), soden over den og luft (40).
           Bredden: slangen, braenderen og skeen med stativet til hoejre (ca. 300). */
        var k = Math.min((lay.yBord - top - 8) / (216 + 168 + 40), (delX - 30) / 300, 1.9);
        k = Math.max(k, 0.6);
        /* Opstillingen (slangen til venstre, stativet til hoejre, ca. 280 k bred)
           staar midt i sin del af scenen */
        var x = Math.max(14 + 46 * k, (delX - 280 * k) / 2 + 46 * k);
        this.b.plads(x, lay.yBord, k, delX);
        /* Luppen til hoejre: titlen over (26 px), signaturen under (34 px) */
        var lx = delX + 22, lb = W - 16 - lx;
        var lyTop = top + 26, lyBund = lay.yBord - 38;
        var lh = Math.min(lyBund - lyTop, Math.max(lb * 1.0, 160));
        var ly = lyTop + Math.max(0, (lyBund - lyTop - lh) / 2);
        lay.lup = { x: lx, y: ly, b: lb, h: lh };
        lay.visKnap = { x: lx + lb / 2 - 70, y: ly + lh / 2 + 18, b: 140, h: 38 };
        this.lay = lay;
        var g = this.b.g;
        this.saetAnker("braender", g.rekt.x - 10, g.mund.y - g.hGul - 20, g.stativX - g.rekt.x + 30, lay.yBord - (g.mund.y - g.hGul - 20));
        var lr = this.b.luftRekt();
        this.saetAnker("luft", lr.x, lr.y, lr.b, lr.h);
        this.saetAnker("lup", lx, ly - 26, lb, lh + 64);
    };

    P.lupNu = function () { return this.lupVis; };

    P.opdaterScene = function (dt) {
        var b = this.b;
        b.opdater(dt);
        this.lupM.saet(b.luft);
        if (this.lupVis && b.taendt) this.lupM.opdater(dt);
        /* Opgave 1: skeen er tilbage fra flammen */
        if (b.netopTilbage && this.iForsoeg() && this.opg.del.maal === "sod") {
            if (b.ske.sod > 0.5) this.forsoegKlaret();
            else this.kortBesked(D.skeIkkeSort, 6);
        }
        if (this.erForsoeg() && this.opg.del.indsend) {
            var t = this.indsendTekst() + (this.kanIndsendes() ? "+" : "-");
            if (t !== this.indsendT) { this.indsendT = t; this.visIndsend(); }
        }
    };

    /* Det skilt, der viser, hvad et klik goer, ved det, opgaven beder om nu */
    P.skiltNu = function () {
        if (!this.iForsoeg()) return null;
        var b = this.b, del = this.opg.del;
        if (!b.taendt) return "taend";
        if (del.maal === "sod") return b.skeKlar() && b.ske.sod < 0.5 && this.dypNu === 0 ? "ske" : null;
        if (!this.luftRoert && !this.traek) return "luft";
        if (del.maal === "blaa" && this.dypNu === 0 && b.skeKlar() && b.luft >= D.BLAA_FRA) return "ske";
        return null;
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, b = this.b, g = b.g;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        Tg.bord(ctx, lay.W, lay.yBord, lay.H);
        var om = this.omNu(), R = lay.lup;

        /* Luppen, eller pladsen til den */
        if (this.lupVis) {
            Tg.zoomRamme(ctx, R, b.taendt ? b.lupFelt() : null, om.indexOf("lup") >= 0);
            this.lupM.tegn(ctx, R, b.taendt);
            var titel = "Luppen over flammen";
            NK.tekst(ctx, titel, R.x + 2, R.y - 10, { font: Tg.font("700", Tg.passer(ctx, titel, R.b - 4, "700", 15, 12)), farve: "#e6eaef" });
            this.lupM.tegnSignatur(ctx, R.x, R.y + R.h + 22, R.b);
        } else {
            ctx.save();
            NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
            ctx.fillStyle = "#17181f";
            ctx.fill();
            ctx.setLineDash([7, 6]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#4a4f5e";
            ctx.stroke();
            ctx.restore();
            var t1 = "Luppen viser, hvad der kommer op fra flammen.";
            NK.tekst(ctx, t1, R.x + R.b / 2, R.y + R.h / 2 - 8, { font: Tg.font("600", Tg.passer(ctx, t1, R.b - 30, "600", 15, 12)), justering: "center", farve: "#9aa3ae" });
            Tg.knap(ctx, lay.visKnap, "Vis luppen", { over: this.over === "visLup" });
        }

        /* Skeen bag flammen, saa den ser ud til at vaere inde i den */
        b.tegnSke(ctx);
        b.tegnBraender(ctx);
        b.tegnFlamme(ctx);
        var luftAktiv = this.iForsoeg() && this.opg.del.indsend;
        b.tegnLuftknap(ctx, luftAktiv, this.over === "luft" || this.traek);

        /* Gule ringe om det, opgaven handler om, og skiltet ved det, der skal bruges */
        if (om.indexOf("braender") >= 0 && !b.taendt) {
            var br = b.braenderRekt();
            Tg.omRing(ctx, br.x, br.y, br.b, br.h);
        }
        if (om.indexOf("ske") >= 0 && (this.erSpm() || b.taendt)) {
            var sr = b.skeRekt();
            Tg.omRing(ctx, sr.x, sr.y, sr.b, sr.h);
        }
        if (om.indexOf("luft") >= 0) {
            var lr = b.luftRekt();
            Tg.omRing(ctx, lr.x, lr.y, lr.b, lr.h);
        }
        var sk = this.skiltNu();
        if (sk === "taend") Tg.skilt(ctx, "Klik: tænd", g.mund.x, g.mund.y - 12, 6, lay.delX);
        else if (sk === "ske") {
            var sr2 = b.skeRekt();
            Tg.skilt(ctx, "Klik: ind i flammen", sr2.x + sr2.b / 2, sr2.y - 4, 6, lay.delX);
        } else if (sk === "luft") {
            var kr = b.knapRekt();
            Tg.skilt(ctx, "Træk: mere eller mindre luft", kr.x + kr.b / 2, kr.y - 24, 6, lay.delX);
        }
        this.tegnSejr(ctx, lay.W, lay.H);
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var b = this.b, lay = this.lay;
        if (!lay || !pt) return null;
        if (!this.lupVis && Tg.inde(lay.visKnap, pt, 4)) return "visLup";
        if (Tg.inde(b.knapRekt(), pt, 6) || Tg.inde(b.skinneRekt(), pt)) return "luft";
        if (Tg.inde(b.skeRekt(), pt)) return "ske";
        if (Tg.inde(b.braenderRekt(), pt) || (b.taendt && Tg.inde(b.flammeRekt(), pt))) return "braender";
        if (this.lupVis && b.taendt && this.lupM.ved(lay.lup, pt)) return "lup";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        if (this.over === "luft") return "greb";
        return this.over ? "klik" : null;
    };

    /* Eleven har stillet luften eller proevet med skeen: hinttrappen begynder
       forfra, og forklaringen til et forkert svar passer ikke laengere */
    P.nytForsoeg = function () {
        this.luftRoert = true;
        this.nulstilHjaelp();
        if (this.fast.klasse === "skidt") this.naesteLinje("", "");
    };

    /* Maa eleven stille luften lige nu? Kun i et forsoeg, der beder om det. */
    P.maaLuft = function () {
        if (this.spaer()) return false;
        if (!this.opg.del.indsend) { this.kortBesked(D.luftLaast, 6); this.kortBlink(); return false; }
        if (!this.b.taendt) { this.kortBesked(D.taendFoerst, 5); return false; }
        return true;
    };

    P.nedScene = function (pt) {
        if (this.hvad(pt) !== "luft") return false;
        if (!this.maaLuft()) return false;
        this.traek = true;
        this.flytScene(pt);
        return true;
    };

    P.flytScene = function (pt) {
        if (!this.traek) return;
        var n = this.b.trinVed(pt.x);
        if (this.b.saetLuft(n)) this.nytForsoeg();
    };

    P.opScene = function () {
        if (!this.traek) return;
        this.traek = false;
        this.luftRoert = true;
        this.visIndsend();
    };

    P.klikScene = function (pt) {
        var h = this.hvad(pt), b = this.b;
        if (h === "visLup") { this.lupVis = true; this.lupM.saet(b.luft, true); return; }
        if (h === "braender") {
            if (b.taendt) { if (this.iForsoeg()) this.kortBesked(D.braenderTaendt, 5); else this.kortBlink(); return; }
            if (this.spaer()) return;
            b.taend();
            this.nulstilHjaelp();
            return;
        }
        if (h === "ske") {
            if (this.spaer()) return;
            if (!b.taendt) { this.kortBesked(D.taendFoerst, 5); return; }
            if (b.dypSke()) { this.dypNu++; this.nytForsoeg(); }
            return;
        }
        if (h === "lup") {
            var m = this.lupM.ved(this.lay.lup, pt);
            if (!m) return;
            if (this.erSpm() && !this.venter && !this.faerdig && (this.opg.del.om || []).indexOf("lup") >= 0) { this.kortBesked(D.lupSpm, 6); return; }
            this.kortBesked(D.LUP_NAVN[m.type], 6);
        }
    };

    /* Piletasterne flytter luftreguleringen, naar opgaven beder om det */
    P.tast = function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return false;
        if (!this.maaLuft()) return true;
        if (this.b.saetLuft(this.b.luft + (e.key === "ArrowRight" ? 1 : -1))) this.nytForsoeg();
        return true;
    };

    NK.SimBraender = SimBraender;
}());
