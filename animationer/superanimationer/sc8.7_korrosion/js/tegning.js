/* =====================================================================
   tegning.js - det, flere faner tegner ens

   Farver, en lille tekstmaerkat, rammen om et zoomvindue og
   spaendingsraekken som HTML til panelet. Scenerne selv (roerene,
   skibet og jernpladen) tegnes i hver sin sim_*.js, og partiklerne
   tegnes af js/mikro.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farver --------------------------------------------------------- */
    function rgb(hex) {
        var h = hex.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    /* t > 0 blander mod hvid, t < 0 mod sort */
    T.nuance = function (hex, t) {
        var c = rgb(hex), maal = t > 0 ? 255 : 0, a = Math.abs(t);
        return "rgb(" + c.map(function (v) { return Math.round(v + (maal - v) * a); }).join(",") + ")";
    };

    T.alfa = function (hex, a) {
        var c = rgb(hex);
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    };

    T.VAND = "#1d4f78";
    T.E_FARVE = "#f2c53d";

    /* En lille maerkat med tekst paa moerk bund */
    T.maerkat = function (ctx, tekst, x, y, valg) {
        valg = valg || {};
        ctx.save();
        ctx.font = font("700", valg.px || 13);
        var b = ctx.measureText(tekst).width + 16, h = (valg.px || 13) + 10;
        var vx = valg.justering === "left" ? x : (valg.justering === "right" ? x - b : x - b / 2);
        NK.rundtRekt(ctx, vx, y - h / 2, b, h, h / 2);
        ctx.fillStyle = valg.bund || "rgba(14, 15, 21, 0.82)";
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = valg.farve || "#cfd6de";
        ctx.fillText(tekst, vx + b / 2, y + 0.5);
        ctx.restore();
    };

    /* En kugle med tekst paa (ioner og elektroner i de store scener) */
    T.kugle = function (ctx, x, y, r, f, tekst, px) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = f.f;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = f.k;
        ctx.stroke();
        if (tekst) {
            ctx.font = font("700", px || 12);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = f.t;
            ctx.fillText(tekst, x, y + 0.5);
        }
    };

    /* Rammen om et zoomvindue og de to streger hen til det, der er zoomet ind paa */
    T.zoomRamme = function (ctx, R, fra, titel) {
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.55)";
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y);
        ctx.lineTo(R.x + 6, R.y + R.h);
        ctx.moveTo(fra.x + fra.b, fra.y);
        ctx.lineTo(R.x + R.b - 6, R.y + R.h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
        ctx.strokeRect(fra.x, fra.y, fra.b, fra.h);
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#7d6a2c";
        ctx.stroke();
        ctx.restore();
        if (titel) {
            NK.tekst(ctx, titel, R.x + R.b / 2, R.y - 9, { font: font("700", 13), justering: "center", farve: "#9aa3ae" });
        }
    };

    /* ----- Spaendingsraekken til panelet ---------------------------------------
       med: de metaller, animationen bruger. valgt: dem, der er i brug nu.
       anode: det, der afgiver elektroner (faar en pil under sig). */
    T.raekkeHTML = function (med, valgt, anode) {
        var html = '<div class="rk-ender"><span>uædel</span><span>ædel</span></div><div class="rk">';
        K.RAEKKE.forEach(function (s) {
            var kl = "rk-m";
            if (med.indexOf(s) >= 0) kl += " med";
            if (valgt && valgt.indexOf(s) >= 0) kl += " valgt";
            if (s === anode) kl += " anode";
            html += '<span class="' + kl + '">' + s + "</span>";
        });
        return html + "</div>";
    };

    NK.Tegn = T;
}());
