/* =====================================================================
   graf.js - lille grafmotor til sidepanelerne
   Kan vise flere serier og skifte mellem grupper (fx "Antal" og
   "Hastighed") paa det samme laerred. Y-aksen skalerer sig selv, men
   glidende, saa kurven ikke hopper.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* serier: [{ navn, farve, gruppe }]
       opt:    { maksPunkter, enheder: {gruppe: tekst}, minTop: {gruppe: tal} } */
    NK.Graf = function (canvas, serier, opt) {
        opt = opt || {};
        this.l = new NK.Laerred(canvas);
        this.serier = serier;
        this.data = [];                                  // [[v1, v2, ...], ...]
        this.maksPunkter = opt.maksPunkter || 260;
        this.enheder = opt.enheder || {};
        this.minTop = opt.minTop || {};
        this.gruppe = opt.startGruppe || serier[0].gruppe;
        this.yTop = 1;
        this.reference = null;                           // {vaerdi, farve, navn}
    };

    NK.Graf.prototype.tilpas = function () {
        return this.l.tilpas();
    };

    NK.Graf.prototype.nulstil = function () {
        this.data.length = 0;
        this.yTop = 1;
    };

    NK.Graf.prototype.visGruppe = function (gruppe) {
        this.gruppe = gruppe;
        this.yTop = 1;   // ny skala for den nye gruppe
    };

    NK.Graf.prototype.saetReference = function (vaerdi, farve, navn) {
        this.reference = (vaerdi === null || vaerdi === undefined)
            ? null
            : { vaerdi: vaerdi, farve: farve, navn: navn };
    };

    NK.Graf.prototype.tilfoej = function (vaerdier) {
        this.data.push(vaerdier);
        if (this.data.length > this.maksPunkter) this.data.shift();
    };

    /* Finder en paen akse-top: 1, 2, 2,5 eller 5 gange en tierpotens. */
    function paenTop(v) {
        if (v <= 0) return 1;
        var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
        var n = v / p;
        var trin = n <= 1 ? 1 : (n <= 2 ? 2 : (n <= 2.5 ? 2.5 : (n <= 5 ? 5 : 10)));
        return trin * p;
    }

    NK.Graf.prototype.tegn = function () {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var i, j, s;

        ctx.clearRect(0, 0, b, h);

        var venstre = 40;
        var top = 20;
        var bund = h - 14;
        var hoejre = b - 8;
        var plotB = Math.max(1, hoejre - venstre);
        var plotH = Math.max(1, bund - top);

        /* Hvilke serier hoerer til den valgte gruppe? */
        var synlige = [];
        for (i = 0; i < this.serier.length; i++) {
            if (this.serier[i].gruppe === this.gruppe) synlige.push(i);
        }

        /* Find hoejeste vaerdi og glid roligt derhen. */
        var maks = this.minTop[this.gruppe] || 0;
        for (i = 0; i < this.data.length; i++) {
            for (j = 0; j < synlige.length; j++) {
                var v = this.data[i][synlige[j]];
                if (isFinite(v) && v > maks) maks = v;
            }
        }
        if (this.reference && isFinite(this.reference.vaerdi)) {
            maks = Math.max(maks, this.reference.vaerdi);
        }
        var maalTop = paenTop(maks * 1.15) || 1;
        this.yTop = this.yTop <= 0 ? maalTop : this.yTop + (maalTop - this.yTop) * 0.12;
        var yTop = this.yTop;

        function tilY(v) {
            return bund - NK.klamp(v / yTop, 0, 1.04) * plotH;
        }

        /* Gitter og aksetal */
        ctx.font = "10px 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        for (i = 0; i <= 4; i++) {
            var vaerdi = yTop * i / 4;
            var y = bund - (i / 4) * plotH;
            ctx.strokeStyle = i === 0 ? "rgba(255, 255, 255, 0.22)" : "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(venstre, Math.round(y) + 0.5);
            ctx.lineTo(hoejre, Math.round(y) + 0.5);
            ctx.stroke();
            ctx.fillStyle = "#7e8590";
            ctx.fillText(NK.tal(vaerdi, yTop < 10 ? 1 : 0), venstre - 6, y);
        }

        /* Referencelinje, fx K */
        if (this.reference && isFinite(this.reference.vaerdi) && this.reference.vaerdi <= yTop) {
            var ry = tilY(this.reference.vaerdi);
            ctx.save();
            ctx.setLineDash([5, 4]);
            ctx.strokeStyle = this.reference.farve;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(venstre, ry);
            ctx.lineTo(hoejre, ry);
            ctx.stroke();
            ctx.restore();
            if (this.reference.navn) {
                ctx.textAlign = "left";
                ctx.fillStyle = this.reference.farve;
                ctx.fillText(this.reference.navn, venstre + 4, ry - 7);
            }
        }

        /* Kurver */
        if (this.data.length >= 2) {
            var trinX = plotB / (this.maksPunkter - 1);
            var start = this.maksPunkter - this.data.length;

            for (j = 0; j < synlige.length; j++) {
                s = this.serier[synlige[j]];

                /* Svag udfyldning under kurven */
                ctx.beginPath();
                for (i = 0; i < this.data.length; i++) {
                    var xf = venstre + (start + i) * trinX;
                    var yf = tilY(this.data[i][synlige[j]]);
                    if (i === 0) ctx.moveTo(xf, yf); else ctx.lineTo(xf, yf);
                }
                ctx.lineTo(venstre + (start + this.data.length - 1) * trinX, bund);
                ctx.lineTo(venstre + start * trinX, bund);
                ctx.closePath();
                ctx.globalAlpha = 0.13;
                ctx.fillStyle = s.farve;
                ctx.fill();
                ctx.globalAlpha = 1;

                /* Selve kurven */
                ctx.beginPath();
                for (i = 0; i < this.data.length; i++) {
                    var x = venstre + (start + i) * trinX;
                    var y2 = tilY(this.data[i][synlige[j]]);
                    if (i === 0) ctx.moveTo(x, y2); else ctx.lineTo(x, y2);
                }
                ctx.strokeStyle = s.farve;
                ctx.lineWidth = 2.2;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.stroke();

                /* Prik for sidste maaling */
                var sidsteX = venstre + (start + this.data.length - 1) * trinX;
                var sidsteY = tilY(this.data[this.data.length - 1][synlige[j]]);
                ctx.fillStyle = s.farve;
                ctx.beginPath();
                ctx.arc(sidsteX, sidsteY, 2.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        /* Signaturforklaring */
        var lx = venstre + 4;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "600 10px 'Segoe UI', sans-serif";
        for (j = 0; j < synlige.length; j++) {
            s = this.serier[synlige[j]];
            ctx.strokeStyle = s.farve;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(lx, 10);
            ctx.lineTo(lx + 12, 10);
            ctx.stroke();
            ctx.fillStyle = "#c8ced6";
            ctx.fillText(s.navn, lx + 16, 10);
            lx += 16 + ctx.measureText(s.navn).width + 12;
        }

        /* Enhed nederst til hoejre */
        var enhed = this.enheder[this.gruppe];
        if (enhed) {
            ctx.textAlign = "right";
            ctx.font = "10px 'Segoe UI', sans-serif";
            ctx.fillStyle = "#5f6570";
            ctx.fillText(enhed + "  —  tid →", hoejre, h - 6);
        }
    };
}());
