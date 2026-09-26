/* =====================================================================
   tavle.js - det, fane 2 og 3 deler

   Tavlen fylder scenen med kaffekoppen paa kridtholderen. Ligningen
   staar oeverst med plads til parrene over og under, og brikkerne
   (formler paa fane 2, maerkater paa fane 3) sidder nederst paa
   tavlen. Sværhedsgraden er faelles for de to faner (NK.Syrebase.niveau).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Syrebase;
    var Tg = NK.Tegn;

    var Tv = {};

    Tv.layout = function (W, H) {
        var lay = { W: W, H: H };
        lay.kant = NK.klamp(W * 0.02, 10, 22);
        var bund = NK.klamp(H * 0.1, 36, 64);
        var R = { x: lay.kant + NK.klamp(W * 0.025, 6, 26), y: NK.klamp(H * 0.04, 14, 30) };
        R.b = W - 2 * R.x;
        R.h = H - R.y - bund - 16;
        lay.R = R;
        lay.kop = { x: R.x + R.b * 0.9, y: R.y + R.h + NK.klamp(R.b * 0.012, 8, 13) - 2 };
        lay.fs = NK.klamp(Math.min(R.b / 21, R.h / 8.5), 19, 40);
        lay.bfs = NK.klamp(lay.fs * 0.8, 16, 30);
        lay.ligY = R.y + NK.klamp(R.h * 0.33, lay.fs * 1.9, R.h * 0.4);
        lay.brikY0 = Math.max(lay.ligY + lay.fs * 2.5, R.y + R.h * 0.55);
        lay.brikY1 = R.y + R.h - NK.klamp(R.h * 0.08, 10, 40);
        return lay;
    };

    Tv.inde = function (pt, r, luft) {
        luft = luft || 0;
        return pt.x >= r.x - luft && pt.x <= r.x + r.b + luft && pt.y >= r.y - luft && pt.y <= r.y + r.h + luft;
    };

    /* Brikkerne i raekker, lige brede, midt paa tavlen mellem y0 og y1.
       En tekst med \n staar paa to linjer (maerkaterne paa smalle skaerme). */
    Tv.stilBrikker = function (ctx, brikker, R, y0, y1, fs) {
        if (!brikker.length) return;
        var pad = fs * 0.8, linjer = 1;
        var b = Math.max.apply(null, brikker.map(function (bk) {
            var dele = bk.tekst.split("\n");
            linjer = Math.max(linjer, dele.length);
            return Math.max.apply(null, dele.map(function (t) { return Tg.tekstBredde(ctx, t, fs, "700"); }));
        })) + 2 * pad;
        var h = fs * (1.75 + 1.05 * (linjer - 1)), gab = NK.klamp(fs * 0.55, 8, 16);
        var prRaekke = Math.max(1, Math.min(brikker.length, Math.floor((R.b * 0.92 + gab) / (b + gab))));
        var raekker = Math.ceil(brikker.length / prRaekke);
        /* For hoejt: brikkerne bliver lavere, ikke smallere */
        var plads = y1 - y0;
        if (raekker * h + (raekker - 1) * gab > plads) h = Math.max(fs * 1.35, (plads - (raekker - 1) * gab) / raekker);
        var top = y0 + Math.max(0, (plads - (raekker * h + (raekker - 1) * gab)) / 2);
        brikker.forEach(function (bk, i) {
            var rk = Math.floor(i / prRaekke), nr = i % prRaekke;
            var iRk = Math.min(prRaekke, brikker.length - rk * prRaekke);
            var x0 = R.x + (R.b - (iRk * b + (iRk - 1) * gab)) / 2;
            bk.r = { x: x0 + nr * (b + gab), y: top + rk * (h + gab), b: b, h: h };
        });
        return { b: b, h: h };
    };

    /* Rummet bag tavlen, tavlen og koppen paa kridtholderen */
    Tv.tegnBaggrund = function (ctx, lay, kop) {
        Tg.rum(ctx, lay.W, lay.H, lay.H - 6);
        Tg.tavle(ctx, lay.R);
        var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
        if (kop && !kop.skjult && !kop.iHaand) NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
    };

    Tv.kopUnder = function (lay, kop, pt) {
        if (!lay || kop.skjult || kop.iHaand) return false;
        return Math.abs(pt.x - lay.kop.x) < 28 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 56;
    };

    /* Hydronen flyver fra syren til basen over ligningen */
    Tv.hydronBue = function (ctx, x0, x1, y, fs, t) {
        if (t <= 0 || t >= 1.3) return;
        var k = Math.min(1, t);
        var q = Tg.bue(x0, y - fs * 0.9, x1, y - fs * 0.9, fs * 1.2, k);
        Tg.hydron(ctx, q.x, q.y, NK.klamp(fs * 0.45, 12, 20), t > 1 ? 1 - (t - 1) / 0.3 : 1, true);
    };

    /* ----- Sværhedsgraden -------------------------------------------------------------- */
    Tv.bindNiveau = function (id, sim) {
        var boks = NK.el(id);
        if (!boks) return;
        boks.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-niveau]") : null;
            if (!k) return;
            S.saetNiveau(k.getAttribute("data-niveau"));
        });
        S.lyt(function () {
            Tv.visNiveau(id);
            sim.nytNiveau();
        });
        Tv.visNiveau(id);
    };

    Tv.visNiveau = function (id) {
        var boks = NK.el(id);
        if (!boks) return;
        var knapper = boks.querySelectorAll("[data-niveau]");
        for (var i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-niveau") === S.niveau;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-pressed", valgt ? "true" : "false");
        }
        var tekst = boks.querySelector(".niveau-tekst");
        if (tekst) tekst.textContent = D.NIVEAUER[S.niveau].tekst;
    };

    /* Rekorden i traek pr. niveau, gemt for hver fane */
    Tv.hentRekord = function (noegle) { return NK.hent(noegle, { let: 0, middel: 0, svaer: 0, rost: false }); };

    NK.Tavle = Tv;
}());
