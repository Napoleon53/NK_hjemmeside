/* =====================================================================
   apparat.js - koeleren paa bassinet og forlaget

   Bassinet har laag med to halse (sprites/bassin.svg): en tragt med
   hane, som der haeldes i, og en hals, som koeleren sidder paa. Koeleren
   kan vaere
     tilbagesvaler   en kuglekoeler lodret paa halsen. Dampen fortaetter
                     i den, og draaberne loeber tilbage i bassinet.
     destillation    et destillationshoved og en skraa Liebigkoeler. Det,
                     der fortaetter i koeleren, loeber ned i forlaget.
   Forlaget er et glas til hoejre for bassinet med sit eget lille gitter
   (en NK.Model uden koeler), saa destillatet ses som kugler.

   Alle maal staar her i bassinspritets enheder (y nedad, 16,05 enheder
   pr. kuglediameter, indersiden x 20-670 og y 30-604,4). Modellen faar
   roerets vej omregnet til kuglediametre (A.koeler). Glasset er
   sprites/tilbagesvaler.svg, destillation.svg og forlag.svg, hvis
   viewBox er i de samme enheder; de er regnet ud fra A.vaegge, saa
   kuglerne altid er inde i roeret. Rettes et maal her, skal de tre
   sprites laves om (se README).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var A = {};
    NK.Apparat = A;

    var E = 650 / 40.5;                 /* enheder pr. kuglediameter */
    var IND_X = 20, IND_BUND = 604.4;
    A.E = E;

    /* Fra spritets enheder til modellens kuglediametre (y opad) */
    function tilModel(x, y) { return { x: (x - IND_X) / E, y: (IND_BUND - y) / E }; }
    A.tilModel = tilModel;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function klamp(v, lav, hoej) { return v < lav ? lav : (v > hoej ? hoej : v); }

    /* ----- Laaget ---------------------------------------------------------
       Halsen, koeleren sidder paa, og tragten, der haeldes i. Tallene gaar
       igen i sprites/bassin.svg. */
    A.LAAG = 30;                                    /* indersiden af laaget */
    A.HALS = { x: 440, halv: 26, top: -20 };
    A.TRAGT = { x: 250, top: -50, hane: -2 };

    /* ----- Tilbagesvaleren: en kuglekoeler med tre kugler ------------------ */
    var TS = {
        bund: -20, top: -160, roer: 14,
        kappe: { fra: -24, til: -150, halv: 48 },
        kugler: [-50, -88, -126], kHoej: 19, kBred: 30,
        ind: -36, ud: -138                          /* slangerne: ind forneden til hoejre, ud foroven til venstre */
    };
    A.TILBAGESVALER = TS;

    /* Roerets halve bredde i hoejden y */
    function tsBredde(y) {
        if (y > TS.bund) return A.HALS.halv;
        if (y > TS.bund - 6) return lerp(A.HALS.halv, TS.roer, (TS.bund - y) / 6);
        var w = TS.roer;
        TS.kugler.forEach(function (yc) {
            var t = (y - yc) / TS.kHoej;
            if (t > -1 && t < 1) w = Math.max(w, TS.kBred * Math.sqrt(1 - t * t));
        });
        return w;
    }
    A.tsBredde = tsBredde;

    /* ----- Destillationen ---------------------------------------------------
       Vejen: halsen op til sidearmen (B), Liebigkoeleren skraat ned (C),
       spidsen boejer ned (D) og drypper fra enden (F). */
    var DS = {
        hovedTop: -122, prop: -136, roer: 14,
        vej: [{ x: 440, y: 30 }, { x: 440, y: -100 }, { x: 800, y: 31 }, { x: 826, y: 53 }, { x: 830, y: 84 }],
        arm: 13, spids: 12,
        kappe: { fra: 0.2, til: 0.88, halv: 28 }
    };
    A.DESTILLATION = DS;

    /* Kappens ender paa linjen fra B til C */
    A.dsKappe = function () {
        var B = DS.vej[1], C = DS.vej[2];
        return {
            a: { x: lerp(B.x, C.x, DS.kappe.fra), y: lerp(B.y, C.y, DS.kappe.fra) },
            b: { x: lerp(B.x, C.x, DS.kappe.til), y: lerp(B.y, C.y, DS.kappe.til) },
            halv: DS.kappe.halv
        };
    };

    /* ----- Forlaget ------------------------------------------------------- */
    var FL = { x: 830, halv: 14.5 * E / 2, top: 115, bund: IND_BUND, kolonner: 14, raekker: 33 };
    FL.venstre = FL.x - FL.halv;
    FL.hoejre = FL.x + FL.halv;
    A.FORLAG = FL;

    /* Modellen til forlaget: 14 x 33 pladser, luften foroven fylder resten */
    A.forlagValg = function () {
        var H = Math.sqrt(3) / 2;
        var fyld = (FL.raekker - 1) * H + 1;
        return { kolonner: FL.kolonner, raekker: FL.raekker, hoved: (FL.bund - FL.top) / E - fyld, koeler: null };
    };

    /* Hvor draaben fra spidsen lander i forlagets model */
    A.drypX = (FL.x - FL.venstre) / E;
    A.drypY = (FL.bund - (DS.vej[4].y + 6)) / E;

    /* ----- Spritesene: deres viewBox i de samme enheder -------------------- */
    A.SPRITE = {
        tilbagesvaler: { x: 360, y: -172, b: 160, h: 172 },
        destillation: { x: 400, y: -146, b: 460, h: 246 },
        forlag: { x: 700, y: 95, b: 262, h: 520 }
    };

    /* ----- Hele billedet ----------------------------------------------------
       Kassen om alt, der tegnes (skygger og glassets tekst med), og hvor
       det lille glas staar: nede, naar forlaget ikke er fremme, og oppe i
       hjoernet, naar det er. */
    A.KASSE = { x0: -12, x1: 980, y0: -178, y1: 640 };
    A.GLAS = { skala: 0.22, x: 823, bundNede: 626, bundOppe: 10 };

    /* ----- Vaeggene (til spritesene og tegningen af roeret) ---------------- */

    /* Forskyder en polylinje d til den ene side med spidse samlinger */
    function forskyd(pkt, d) {
        var ud = [], n = pkt.length, i;
        var normal = [];
        for (i = 0; i < n - 1; i++) {
            var dx = pkt[i + 1].x - pkt[i].x, dy = pkt[i + 1].y - pkt[i].y, l = Math.sqrt(dx * dx + dy * dy);
            normal.push({ x: -dy / l, y: dx / l });
        }
        for (i = 0; i < n; i++) {
            var a = normal[Math.max(0, i - 1)], b = normal[Math.min(n - 2, i)];
            var mx = a.x + b.x, my = a.y + b.y, ml = Math.sqrt(mx * mx + my * my) || 1;
            mx /= ml; my /= ml;
            var cos = mx * b.x + my * b.y || 1;
            ud.push({ x: pkt[i].x + mx * d / cos, y: pkt[i].y + my * d / cos });
        }
        return ud;
    }

    function kryds(p, q, x0) {
        var t = (x0 - p.x) / (q.x - p.x);
        return { x: x0, y: p.y + (q.y - p.y) * t };
    }

    /* Glassets midterlinje ligger 1,6 enheder uden for roerets inderside */
    var VAEG = 1.6;

    A.vaegge = function (navn) {
        if (navn === "destillation") {
            var arm = DS.vej.slice(1);
            var op = forskyd(arm, -(DS.arm + VAEG)), ned = forskyd(arm, DS.arm + VAEG);
            var ops = forskyd(arm, -(DS.spids + VAEG)), neds = forskyd(arm, DS.spids + VAEG);
            op[2] = ops[2]; op[3] = ops[3]; ned[2] = neds[2]; ned[3] = neds[3];
            var xh = A.HALS.x + DS.roer + VAEG;
            op[0] = kryds(op[0], op[1], xh);
            ned[0] = kryds(ned[0], ned[1], xh);
            return { op: op, ned: ned, xv: A.HALS.x - DS.roer - VAEG, xh: xh };
        }
        var v = [], h = [];
        for (var y = TS.bund; y >= TS.top - 0.01; y -= 1) {
            var w = tsBredde(y) + VAEG;
            v.push({ x: A.HALS.x - w, y: y });
            h.push({ x: A.HALS.x + w, y: y });
        }
        return { v: v, h: h };
    };

    /* ----- Vejen gennem roeret til modellen -------------------------------- */
    function laengder(pkt) {
        var s = [0];
        for (var i = 1; i < pkt.length; i++) {
            var dx = pkt[i].x - pkt[i - 1].x, dy = pkt[i].y - pkt[i - 1].y;
            s.push(s[i - 1] + Math.sqrt(dx * dx + dy * dy));
        }
        return s;
    }

    /* En vej i modellens enheder med punkt(s, q): s er laengden langs vejen
       fra laaget, q er -1 til 1 paa tvaers (1 = hoejre i et lodret roer og
       den nederste side i et skraat), og en kugle naar hoejst ud til
       vaeggen. bredde(s) er roerets halve bredde. */
    function lavVej(pktSprite, bredde, kold, ud) {
        var pkt = pktSprite.map(function (p) { return tilModel(p.x, p.y); });
        var s = laengder(pkt);
        var vej = {
            pkt: pkt, s: s, L: s[s.length - 1],
            hx: pkt[0].x, aabning: A.HALS.halv / E,
            koldFra: kold[0], koldTil: kold[1], ud: ud,
            tragt: { x: tilModel(A.TRAGT.x, 0).x, y: (IND_BUND - (A.TRAGT.top - 26)) / E },
            bredde: bredde
        };
        function stykke(sv) {
            var i = 1;
            while (i < pkt.length - 1 && sv > s[i]) i++;
            return i;
        }
        vej.punkt = function (sv, q) {
            var i = stykke(sv);
            var a = pkt[i - 1], b = pkt[i], l = s[i] - s[i - 1];
            var t = klamp((sv - s[i - 1]) / l, 0, 1);
            var dx = (b.x - a.x) / l, dy = (b.y - a.y) / l;
            var w = Math.max(0, bredde(sv) - 0.55);
            return { x: a.x + (b.x - a.x) * t + dy * q * w, y: a.y + (b.y - a.y) * t - dx * q * w };
        };
        /* Er stykket ved s lodret? Saa kan en draabe loebe paa begge sider */
        vej.lodret = function (sv) {
            var i = stykke(sv);
            return Math.abs(pkt[i].x - pkt[i - 1].x) < 1e-6;
        };
        return vej;
    }

    A.koeler = function (navn) {
        if (navn === "destillation") {
            var sAll = laengder(DS.vej.map(function (p) { return tilModel(p.x, p.y); }));
            var sB = sAll[1], lBC = sAll[2] - sAll[1];
            var halsTop = (A.LAAG - A.HALS.top) / E;
            return lavVej(DS.vej, function (sv) {
                if (sv < halsTop) return A.HALS.halv / E;
                if (sv < sB) return DS.roer / E;
                if (sv < sAll[2]) return DS.arm / E;
                return DS.spids / E;
            }, [sB + DS.kappe.fra * lBC, sB + DS.kappe.til * lBC], true);
        }
        return lavVej([{ x: A.HALS.x, y: A.LAAG }, { x: A.HALS.x, y: TS.top + 2 }], function (sv) {
            return tsBredde(A.LAAG - sv * E) / E;
        }, [(A.LAAG - TS.kappe.fra) / E, (A.LAAG - TS.kappe.til) / E], false);
    };

    /* =====================================================================
       Tegningen. T = { ox, oy, k }: et punkt (x, y) i spritets enheder
       tegnes i (ox + x·k, oy + y·k).
       ===================================================================== */
    function px(T, x, y) { return { x: T.ox + x * T.k, y: T.oy + y * T.k }; }

    A.tegnSprite = function (ctx, T, navn) {
        var s = A.SPRITE[navn], p = px(T, s.x, s.y);
        return NK.Sprites.tegn(ctx, navn, p.x, p.y, s.b * T.k, s.h * T.k);
    };

    /* Koelevandet: smaa prikker, der stroemmer fra slangen forneden til
       slangen foroven */
    A.tegnVand = function (ctx, T, navn, tid) {
        var i, p;
        ctx.save();
        ctx.fillStyle = "rgba(224, 242, 254, 0.5)";
        if (navn === "destillation") {
            var K = A.dsKappe(), dx = K.b.x - K.a.x, dy = K.b.y - K.a.y, l = Math.sqrt(dx * dx + dy * dy);
            var nx = -dy / l, ny = dx / l;
            for (i = 0; i < 9; i++) {
                var t = 1 - ((tid * 0.12 + i / 9) % 1);
                var side = i % 2 ? 1 : -1, af = DS.arm + 6 + (i * 7 % 8);
                p = px(T, lerp(K.a.x, K.b.x, t) + nx * side * af, lerp(K.a.y, K.b.y, t) + ny * side * af);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.4 * T.k, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            for (i = 0; i < 10; i++) {
                var f = (tid * 0.1 + i / 10) % 1;
                var y = lerp(TS.kappe.fra - 6, TS.kappe.til + 6, f);
                var s2 = i % 2 ? 1 : -1;
                var ind = tsBredde(y) + 5 + (i * 7 % 8);
                p = px(T, A.HALS.x + s2 * Math.min(ind, TS.kappe.halv - 4), y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.4 * T.k, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    };

    /* Kassen om koeleren, til rundvisningen */
    A.kasse = function (navn) {
        var s = A.SPRITE[navn === "destillation" ? "destillation" : "tilbagesvaler"];
        return { x0: s.x, y0: s.y, x1: s.x + s.b, y1: s.y + s.h + 20 };
    };

    /* ----- Hanen paa tragten: vandret er lukket, lodret er aaben ----------- */
    A.tegnHane = function (ctx, T, aaben) {
        var p = px(T, A.TRAGT.x, A.TRAGT.hane);
        ctx.save();
        ctx.translate(p.x, p.y);
        if (aaben) ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "rgba(214, 234, 248, 0.75)";
        NK.rundtRekt(ctx, -17 * T.k, -3 * T.k, 34 * T.k, 6 * T.k, 3 * T.k);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 5 * T.k, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160, 190, 215, 0.9)";
        ctx.fill();
        ctx.restore();
    };

    /* Skyggen under forlaget */
    A.tegnForlagSkygge = function (ctx, T) {
        var p = px(T, FL.x, FL.bund + 7);
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, FL.halv * 1.05 * T.k, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };
}());
