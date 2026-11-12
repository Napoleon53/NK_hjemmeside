/* =====================================================================
   tegning.js - det, flere faner tegner ens

   Fedtstofmolekylerne: smaa i luppen (T.lupMolekyle) og store med
   esterbindingerne paa tavlen paa fane 2 (T.storMolekyle). Brom i luppen
   som orange kugler (T.brKugle og T.dibrom), bordet, luppens ramme,
   tavlen, den gule ring og det gule skilt ved det, der skal bruges nu.
   Det faelles er fra sc4.4.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Fedt;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    T.GUL = "#f2c53d";
    T.BROM = "#f0a35c";          /* brom og bromvand: orange som i bogens figurer */
    T.BROM_MOERK = "#c0561b";    /* brom paa den lyse tavle */
    T.STREG = "#aeb8c5";
    T.BLAEK = "#1f2430";         /* stregerne paa den lyse tavle */
    T.ESTER = "#0f7a6e";         /* esterbindingens O, som i bogens figur */

    /* Et bromatom i luppen: en orange kugle, med Br paa, naar der er plads */
    T.brKugle = function (ctx, x, y, r, alfa) {
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, "#ffd2a3");
        g.addColorStop(0.55, "#f0913f");
        g.addColorStop(1, "#b9561a");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (r >= 7) {
            ctx.font = font("700", Math.round(r * 1.02));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#3a1a05";
            ctx.fillText("Br", x, y + r * 0.06);
        }
        ctx.restore();
    };

    /* Et dibrommolekyle, Br₂, i luppen: to bromkugler, der roerer hinanden */
    T.dibrom = function (ctx, x, y, r, vink, alfa) {
        var c = Math.cos(vink) * r * 0.8, s = Math.sin(vink) * r * 0.8;
        T.brKugle(ctx, x - c, y - s, r, alfa);
        T.brKugle(ctx, x + c, y + s, r, alfa);
    };

    /* ----- En fedtsyres kaede ----------------------------------------------------------
       pkt i pixels. v: farve, lw, afst (afstanden til den anden streg i en
       dobbeltbinding), brom(k) giver 0-1 (hvor langt dibrom er kommet med at
       addere til dobbeltbinding k), brFarve, brPx, brLaengde (pixels ud til Br),
       ekstra(k, a, b) tegner noget under bindingen (fremhaevning). */
    T.kaede = function (ctx, pkt, dobbelt, v) {
        var i;
        ctx.save();
        ctx.strokeStyle = v.farve;
        ctx.lineWidth = v.lw;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        for (i = 0; i < pkt.length; i++) {
            if (i) ctx.lineTo(pkt[i].x, pkt[i].y);
            else ctx.moveTo(pkt[i].x, pkt[i].y);
        }
        ctx.stroke();
        (dobbelt || []).forEach(function (k) {
            var a = pkt[k], b = pkt[k + 1], p = v.brom ? v.brom(k) : 0;
            /* den anden streg: forsvinder, naar dibrom adderer */
            if (p < 1) {
                var side = F.dobbeltSide(pkt, k);
                var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
                var nx = -dy / l * v.afst * side, ny = dx / l * v.afst * side, kort = 0.2;
                ctx.save();
                ctx.globalAlpha *= 1 - p;
                ctx.beginPath();
                ctx.moveTo(a.x + dx * kort + nx, a.y + dy * kort + ny);
                ctx.lineTo(b.x - dx * kort + nx, b.y - dy * kort + ny);
                ctx.stroke();
                ctx.restore();
            }
            if (p > 0) T.bromPaa(ctx, pkt, k, p, v);
        });
        ctx.restore();
    };

    /* De to bromatomer paa carbonatomerne i dobbeltbinding k, der har adderet */
    T.bromPaa = function (ctx, pkt, k, p, v) {
        var steder = F.bromSteder(pkt, k, v.brLaengde);
        ctx.save();
        ctx.globalAlpha *= NK.klamp(p, 0, 1);
        ctx.strokeStyle = v.brFarve || T.BROM;
        ctx.lineWidth = Math.max(1.2, v.lw * 0.8);
        ctx.font = font("700", v.brPx);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = v.brFarve || T.BROM;
        steder.forEach(function (st) {
            var dx = st.br.x - st.c.x, dy = st.br.y - st.c.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
            /* I luppen er bromatomet en kugle som i dibrommolekylerne */
            if (v.kugle) {
                ctx.beginPath();
                ctx.moveTo(st.c.x, st.c.y);
                ctx.lineTo(st.br.x - dx / l * v.kugle * 0.8, st.br.y - dy / l * v.kugle * 0.8);
                ctx.stroke();
                T.brKugle(ctx, st.br.x, st.br.y, v.kugle);
                return;
            }
            var stop = Math.max(0, l - v.brPx * 0.75);
            ctx.beginPath();
            ctx.moveTo(st.c.x, st.c.y);
            ctx.lineTo(st.c.x + dx / l * stop, st.c.y + dy / l * stop);
            ctx.stroke();
            ctx.fillText("Br", st.br.x, st.br.y + v.brPx * 0.05);
        });
        ctx.restore();
    };

    /* Bromkuglernes radius i luppen, naar bindingerne er s pixels lange */
    T.brR = function (s) { return NK.klamp(s * 0.4, 4.5, 10); };

    /* ----- Et fedtstofmolekyle i luppen ----------------------------------------------------
       form fra F.formLup. (ox, oy) er glycerolens midte. brom(nr, k) giver 0-1. */
    T.lupMolekyle = function (ctx, form, ox, oy, s, brom, alfa) {
        var lw = NK.klamp(s * 0.13, 1.6, 2.6);
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        /* glycerol og bindingerne ud til kaederne */
        ctx.strokeStyle = "#dfe5ec";
        ctx.lineWidth = lw * 1.15;
        var top = form.kaeder[0].y0, bund = form.kaeder[form.kaeder.length - 1].y0;
        ctx.beginPath();
        ctx.moveTo(ox, oy + top * s);
        ctx.lineTo(ox, oy + bund * s);
        form.kaeder.forEach(function (kd) {
            ctx.moveTo(ox, oy + kd.y0 * s);
            ctx.lineTo(ox + kd.pkt[0].x * s, oy + kd.pkt[0].y * s);
        });
        ctx.stroke();
        form.kaeder.forEach(function (kd) {
            var syre = F.syre(kd.id);
            var pkt = kd.pkt.map(function (p) { return { x: ox + p.x * s, y: oy + p.y * s }; });
            T.kaede(ctx, pkt, kd.dobbelt, {
                farve: F.FARVE[syre.slags], lw: lw, afst: Math.max(2.2, s * 0.2),
                brom: function (k) { return brom ? brom(kd.nr, k) : 0; },
                kugle: T.brR(s), brLaengde: Math.max(s * 0.95, T.brR(s) * 2.1)
            });
        });
        ctx.restore();
    };

    /* ----- Et stort fedtstofmolekyle paa tavlen (fane 2) ------------------------------------
       form fra F.formStor. v: brom(nr, k) 0-1, mrk(noegle) (markeret af eleven),
       over (noeglen under musen), farver (kaederne i slagsens farve). */
    T.storMolekyle = function (ctx, form, ox, oy, s, v) {
        v = v || {};
        var lw = NK.klamp(s * 0.085, 1.8, 3);
        var px = NK.klamp(s * 0.62, 12, 19);
        function P(p) { return { x: ox + p.x * s, y: oy + p.y * s }; }

        /* Fremhaevningen under en binding: markeret (gul) eller under musen */
        function under(a, b, noegle) {
            var mrk = v.mrk && v.mrk(noegle), over = v.over === noegle;
            if (!mrk && !over) return;
            ctx.save();
            ctx.lineCap = "round";
            ctx.strokeStyle = mrk ? "rgba(242, 197, 61, 0.85)" : "rgba(242, 197, 61, 0.35)";
            ctx.lineWidth = s * 0.42;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        /* CH₂, CH og CH₂ staar med C'erne under hinanden og slutter ved x = 0 */
        ctx.font = font("700", px);
        var xL = ox - ctx.measureText("CH₂").width - px * 0.1;
        var gx = xL + ctx.measureText("C").width / 2;
        form.raekker.forEach(function (r) {
            var pkt = r.pkt.map(P), C1 = P(r.C1), O = P(r.O), Oc = P(r.Oc), g = P(r.glycerol);
            ctx.font = font("700", px);
            var tekstSlut = xL + ctx.measureText(r.glycerol.tekst).width;
            /* fremhaevningerne foerst, saa stregerne ligger ovenpaa */
            for (var k = 0; k < pkt.length - 1; k++) under(pkt[k], pkt[k + 1], r.nr + "." + k);
            under(C1, Oc, r.nr + ".co");

            ctx.strokeStyle = T.BLAEK;
            ctx.lineWidth = lw;
            /* glycerol -O- C1 */
            ctx.beginPath();
            ctx.moveTo(tekstSlut + px * 0.2, g.y);
            ctx.lineTo(O.x - px * 0.48, O.y);
            ctx.moveTo(O.x + px * 0.4, O.y - px * 0.2 * r.f);
            ctx.lineTo(C1.x, C1.y);
            ctx.stroke();
            /* C=O */
            var nx = s * 0.1;
            ctx.beginPath();
            ctx.moveTo(C1.x - nx, C1.y);
            ctx.lineTo(Oc.x - nx, Oc.y + px * 0.5 * r.f);
            ctx.moveTo(C1.x + nx, C1.y);
            ctx.lineTo(Oc.x + nx, Oc.y + px * 0.5 * r.f);
            ctx.stroke();
            /* kaeden */
            var syre = F.syre(r.id);
            T.kaede(ctx, pkt, r.dobbelt, {
                farve: v.farver ? NK.Tegn.moerk(F.FARVE[syre.slags]) : T.BLAEK, lw: lw, afst: Math.max(3, s * 0.17),
                brom: function (k) { return v.brom ? v.brom(r.nr, k) : 0; },
                brFarve: T.BROM_MOERK, brPx: px * 0.95, brLaengde: s * 0.95
            });
            /* bogstaverne */
            ctx.font = font("700", px);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = T.ESTER;
            ctx.fillText("O", O.x, O.y + px * 0.04);
            ctx.fillText("O", Oc.x, Oc.y + px * 0.04);
            ctx.fillStyle = T.BLAEK;
            ctx.textAlign = "left";
            ctx.fillText(r.glycerol.tekst, xL, g.y + px * 0.04);
        });
        /* glycerolens lodrette bindinger under C'erne */
        var r0 = form.raekker[0], r2 = form.raekker[form.raekker.length - 1];
        ctx.strokeStyle = T.BLAEK;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(gx, oy + r0.y0 * s + px * 0.62);
        ctx.lineTo(gx, oy + form.raekker[1].y0 * s - px * 0.62);
        ctx.moveTo(gx, oy + form.raekker[1].y0 * s + px * 0.62);
        ctx.lineTo(gx, oy + r2.y0 * s - px * 0.62);
        ctx.stroke();
        ctx.restore();
    };

    /* En lys farve gjort moerk nok til den lyse tavle */
    T.moerk = function (hex) {
        var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        return "rgb(" + Math.round(r * 0.55) + ", " + Math.round(g * 0.55) + ", " + Math.round(b * 0.55) + ")";
    };

    /* ----- Det faelles (fra sc4.4) -------------------------------------------------------- */
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

    /* Bordet: en plade, tingene staar paa, og forkanten ned til scenens bund */
    T.bord = function (ctx, W, y, Hs) {
        ctx.fillStyle = "#3b3e4a";
        ctx.fillRect(0, y, W, 5);
        var g = ctx.createLinearGradient(0, y + 5, 0, Hs);
        g.addColorStop(0, "#262832");
        g.addColorStop(1, "#1d1e26");
        ctx.fillStyle = g;
        ctx.fillRect(0, y + 5, W, Math.max(0, Hs - y - 5));
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(0, y, W, 1);
    };

    /* Rammen om luppens vindue og de to stiplede streger hen til det lille
       felt i glasset, som vinduet viser forstoerret. Staar luppen til hoejre
       for feltet, gaar stregerne til luppens venstre side, ellers til bunden. */
    T.zoomRamme = function (ctx, R, fra, fremhaev) {
        ctx.save();
        if (fra) {
            ctx.setLineDash([6, 5]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(214, 160, 20, 0.75)";
            ctx.beginPath();
            if (fra.x + fra.b < R.x) {
                ctx.moveTo(fra.x + fra.b, fra.y);
                ctx.lineTo(R.x, R.y + 12);
                ctx.moveTo(fra.x + fra.b, fra.y + fra.h);
                ctx.lineTo(R.x, R.y + R.h - 12);
            } else {
                ctx.moveTo(fra.x, fra.y);
                ctx.lineTo(R.x + 8, R.y + R.h);
                ctx.moveTo(fra.x + fra.b, fra.y);
                ctx.lineTo(R.x + R.b - 8, R.y + R.h);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#c99400";
            ctx.strokeRect(fra.x, fra.y, fra.b, fra.h);
        }
        if (fremhaev) {
            NK.rundtRekt(ctx, R.x - 4, R.y - 4, R.b + 8, R.h + 8, 15);
            ctx.lineWidth = 6;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.28)";
            ctx.stroke();
        }
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.fillStyle = "#191a22";
        ctx.fill();
        ctx.lineWidth = fremhaev ? 4 : 3;
        ctx.strokeStyle = fremhaev ? "#f2c53d" : "#7d6a2c";
        ctx.stroke();
        ctx.restore();
    };

    /* Den lyse tavle, molekylet staar paa paa fane 2 */
    T.tavle = function (ctx, R, fremhaev) {
        ctx.save();
        NK.rundtRekt(ctx, R.x + 3, R.y + 5, R.b, R.h, 12);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fill();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.fillStyle = "#f7f4ec";
        ctx.fill();
        ctx.lineWidth = fremhaev ? 3 : 1.5;
        ctx.strokeStyle = fremhaev ? "#f2c53d" : "#cfc8b6";
        ctx.stroke();
        ctx.restore();
    };

    /* En rolig gul ring om det, opgaven eller spoergsmaalet handler om
       (intet indforstaaet). Ringen, der pulserer (T.ring), betyder "brug mig nu". */
    /* farve: en moerkere gul til ringe paa den hvide plade bag glassene */
    T.omRing = function (ctx, x, y, b, h, farve) {
        ctx.save();
        NK.rundtRekt(ctx, x - 9, y - 9, b + 18, h + 18, 16);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.stroke();
        NK.rundtRekt(ctx, x - 6, y - 6, b + 12, h + 12, 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.stroke();
        ctx.restore();
    };

    T.ring = function (ctx, x, y, b, h, tid, radius) {
        var puls = 0.5 + 0.5 * Math.sin(tid * 4.2);
        ctx.save();
        NK.rundtRekt(ctx, x - 4 - puls * 3, y - 4 - puls * 3, b + 8 + puls * 6, h + 8 + puls * 6, radius || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.4 * puls) + ")";
        ctx.stroke();
        ctx.restore();
    };

    /* Et lille gult skilt med en spids, der peger ned paa tingen */
    T.skilt = function (ctx, tekst, x, y, minX, maxX) {
        ctx.save();
        ctx.font = font("700", 14);
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var vx = x - b / 2;
        if (minX !== undefined) vx = NK.klamp(vx, minX, Math.max(minX, maxX - b));
        var top = y - h;
        NK.rundtRekt(ctx, vx, top, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 1); ctx.lineTo(x + 7, y - 1); ctx.lineTo(x, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, vx + b / 2, top + h / 2 + 0.5);
        ctx.restore();
    };

    NK.Tegn = T;
}());
