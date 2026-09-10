/* =====================================================================
   indikatorbar.js - "Indikatoren"-baren i sidepanelet paa fane 1

   Viser den VALGTE indikators egen farve hen over hele pH-skalaen - ikke
   en fast regnbue, som var den samme uanset hvilken indikator man havde
   valgt. Skalaen gaar fra pH -1 til 15, saa ogsaa de yderste ender er
   med: fx phenolphthaleins afblegning igen i staerkt basisk opløsning,
   et godt stykke over dens normale omslag.

   Farverne er regnet paa hvid bund (Kemi.indikatorPaaHvid), praecis som
   farveprikken ved pH-tallet, saa baren viser den farve, man faktisk
   ville se i et glas.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Kemi = NK.Kemi;

    var PH_LAV = -1;
    var PH_HOEJ = 15;

    NK.IndikatorBjaelke = function (canvas) {
        this.l = new NK.Laerred(canvas);
    };

    NK.IndikatorBjaelke.prototype.tilpas = function () {
        return this.l.tilpas();
    };

    function xTil(pH, bredde) {
        return (pH - PH_LAV) / (PH_HOEJ - PH_LAV) * bredde;
    }

    function graenseMaerke(ctx, pH, barH, bredde) {
        var x = xTil(pH, bredde);
        ctx.beginPath();
        ctx.moveTo(x + 0.5, barH - 3);
        ctx.lineTo(x + 0.5, barH + 2);
        ctx.stroke();
    }

    /* t = { indikator, pHNu } */
    NK.IndikatorBjaelke.prototype.tegn = function (t) {
        var ctx = this.l.ctx;
        var bredde = this.l.b, hoejde = this.l.h;
        var ind = t.indikator;
        var i, x, pH, f;

        ctx.clearRect(0, 0, bredde, hoejde);
        if (!ind || bredde < 4 || hoejde < 4) return;

        var akseH = Math.min(16, hoejde * 0.35);
        var barH = hoejde - akseH;

        /* ----- Selve farvebaren, en pixelsoejle ad gangen ----------- */
        if (ind.id === "ingen") {
            ctx.fillStyle = "#1a1a22";
            ctx.fillRect(0, 0, bredde, barH);
        } else {
            for (x = 0; x < bredde; x++) {
                pH = PH_LAV + (x + 0.5) / bredde * (PH_HOEJ - PH_LAV);
                /* Universalindikatoren ER en farveskala - den vises med
                   sin fulde daekkraft. De rigtige indikatorer blandes
                   ned i hvidt, som i et glas. */
                f = ind.skala ? Kemi.indikatorFarve(ind, pH) : Kemi.indikatorPaaHvid(ind, pH);
                ctx.fillStyle = "rgb(" + Math.round(f[0]) + "," + Math.round(f[1]) + "," + Math.round(f[2]) + ")";
                ctx.fillRect(x, 0, 1, barH);
            }
        }

        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(0.6, 0.6, bredde - 1.2, barH - 1.2);

        /* ----- Det officielt opgivne omslagsinterval ------------------
           En let ramme oven i den rigtige farve, saa man kan se, hvor
           "bogens" tal plejer at saette skellet. */
        if (ind.omraade) {
            var x0 = xTil(ind.omraade[0], bredde), x1 = xTil(ind.omraade[1], bredde);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
            ctx.lineWidth = 1.4;
            ctx.strokeRect(x0 + 0.7, 1.4, Math.max(1, x1 - x0 - 1.4), barH - 2.8);
        }

        /* ----- Akselinje og pæne pH-tal -------------------------------
           Samme rytme som graferne: tal for hver 2. hele pH-enhed. Selve
           baren daekker et stykke ud over 0-14 (til -1 og 15), markeret
           med en lille streg uden tal, saa man kan se, at den fortsaetter. */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barH + 0.5);
        ctx.lineTo(bredde, barH + 0.5);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        graenseMaerke(ctx, PH_LAV, barH, bredde);
        graenseMaerke(ctx, PH_HOEJ, barH, bredde);

        if (akseH > 8) {
            ctx.font = "600 9px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            for (i = 0; i <= 14; i += 2) {
                x = xTil(i, bredde);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.beginPath();
                ctx.moveTo(x + 0.5, barH - 3);
                ctx.lineTo(x + 0.5, barH + 3);
                ctx.stroke();
                ctx.fillStyle = "rgba(221, 227, 234, 0.9)";
                ctx.fillText(String(i), x, barH + 4);
            }
        }

        /* ----- Naalen: hvor blandingen staar lige nu ------------------ */
        if (isFinite(t.pHNu)) {
            var xn = NK.klamp(xTil(t.pHNu, bredde), 1.5, bredde - 1.5);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(15, 15, 20, 0.85)";
            ctx.beginPath();
            ctx.moveTo(xn, -1);
            ctx.lineTo(xn, barH + 1);
            ctx.stroke();
            ctx.lineWidth = 1.3;
            ctx.strokeStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(xn, -1);
            ctx.lineTo(xn, barH + 1);
            ctx.stroke();
        }
    };
}());
