/* =====================================================================
   lup.js - luppen med kuglemodellerne

   To slags lup:
     "rent"  molekylerne i det rene stof som vaeske (fane 2). Molekylerne
             ligger parvis hoved mod hoved i raekker. Mellem kaederne i to
             raekker staar kontaktfladen som et gyldent baand (bogens
             kogepunkt-kontakt i 4.1), og mellem grupperne staar
             hydrogenbindingerne som stiplede linjer. En alkohol har én
             hydrogenbinding pr. par, en carboxylsyre to, en alkan ingen.
             Med to stoffer (sammenligning) faar hvert sin halvdel.
     "vand"  ét molekyle blandt vandmolekyler (fane 3). Vandmolekylerne
             holder sig vaek fra kaeden, og ved gruppen staar der
             hydrogenbindinger til vandet.

   Intet er tilfaeldigt: vandmolekylernes pladser og drejning regnes af
   et fast moenster, saa luppen ser ens ud hver gang. Et nyt stof toner
   ind over det gamle paa 0,35 s.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kugler;

    function Lup(slags) {
        this.slags = slags;
        this.stof = null;
        this.stof2 = null;
        this.gammel = null;
        this.t = 1;
        this.cache = {};
    }

    var P = Lup.prototype;

    /* Stoffet (og evt. et stof at sammenligne med). straks: ingen toning. */
    P.saet = function (stof, stof2, straks) {
        var noegle = (stof ? stof.id : "") + "|" + (stof2 ? stof2.id : "");
        if (noegle === this.noegle) return;
        if (!straks && this.stof) this.gammel = { stof: this.stof, stof2: this.stof2 };
        else this.gammel = null;
        this.noegle = noegle;
        this.stof = stof;
        this.stof2 = stof2 || null;
        this.t = straks ? 1 : 0;
    };

    P.opdater = function (dt) {
        if (this.t < 1) {
            this.t = Math.min(1, this.t + dt / 0.35);
            if (this.t >= 1) this.gammel = null;
        }
    };

    /* ----- Det rene stof ------------------------------------------------------------------ */
    /* Parrene i raekker, i enheder. Giver molekylerne, kontaktfladerne og
       kassen for én raekke. */
    function raekke(stof) {
        if (stof.id === "vand" || stof.id === "dihydrogen") return null;
        var p = K.par(stof);
        var k = K.kasse(p);
        return { par: p, k: k, hoejde: k.y1 - k.y0 };
    }

    /* Molekylerne i et rektangel (px) for ét stof: r og nulpunkt, saa
       raekkerne fylder rektanglet, og et par ekstra raekker i kanten, som
       klippes, saa det ligner en vaeske, der fortsaetter */
    function layoutRent(stof, R, rMaks, raekkerMaal, kunEn) {
        var rk = raekke(stof);
        if (!rk) return null;
        var bredde = rk.k.x1 - rk.k.x0;
        var pitch = rk.hoejde - 0.15;
        var antal = raekkerMaal || 3;
        var r = Math.min((R.b - 20) / bredde, (R.h - 14) / (antal * pitch), rMaks);
        var ox = R.x + R.b / 2 - (rk.k.x0 + rk.k.x1) / 2 * r;
        var midt = R.y + R.h / 2;
        var mol = [], kontakt = [];
        /* Raekke 0 til antal − 1 staar midt i luppen; raekke −1 og antal
           klippes af kanten */
        var y0Midt = -(rk.k.y0 + rk.k.y1) / 2;
        for (var i = kunEn ? 0 : -1; i <= (kunEn ? 0 : antal); i++) {
            var dy = y0Midt + (i - (antal - 1) / 2) * pitch;
            rk.par.forEach(function (m) { mol.push(K.flyt(m, 0, dy)); });
        }
        /* Kontaktfladerne: mellem kaeden i én raekke og kaeden lige under */
        for (var a = 0; a < mol.length; a++) {
            for (var b = 0; b < mol.length; b++) {
                var A = mol[a], B = mol[b];
                if (!A.kaede || !B.kaede) continue;
                var ya = kaedeY(A), yb = kaedeY(B);
                if (yb - ya < pitch * 0.6 || yb - ya > pitch * 1.4) continue;
                var x0 = Math.max(A.kaede[0], B.kaede[0]), x1 = Math.min(A.kaede[1], B.kaede[1]);
                if (x1 > x0 - 0.01) kontakt.push({ x0: x0, x1: x1, y: (ya + yb) / 2 });
            }
        }
        return { r: r, ox: ox, oy: midt, mol: mol, kontakt: kontakt, hb: K.hBindinger(mol) };
    }

    /* Hoejden (y) for carbonatomerne i et molekyle */
    function kaedeY(m) {
        for (var i = 0; i < m.atomer.length; i++) if (m.atomer[i].s === "C") return m.atomer[i].y;
        return 0;
    }

    /* Vand og dihydrogen som rent stof: et fast moenster */
    function layoutSmaa(stof, R, rMaks) {
        var r = Math.min(rMaks, R.b / 16);
        var ox = R.x + R.b / 2, oy = R.y + R.h / 2;
        var mol = [], nx = Math.ceil(R.b / (3.1 * r)) + 2, ny = Math.ceil(R.h / (2.9 * r)) + 2;
        var grund = K.model(stof);
        for (var j = -Math.ceil(ny / 2); j <= Math.ceil(ny / 2); j++) {
            for (var i = -Math.ceil(nx / 2); i <= Math.ceil(nx / 2); i++) {
                var x = i * 3.1 + (j % 2 ? 1.55 : 0), y = j * 2.9;
                var v = (hash(i * 7 + 3, j * 11 + 5) - 0.5) * 2.4;
                mol.push(drej(grund, v, x, y));
            }
        }
        return { r: r, ox: ox, oy: oy, mol: mol, kontakt: [], hb: stof.id === "vand" ? K.hBindinger(mol) : [] };
    }

    function drej(m, v, tx, ty) {
        var c = Math.cos(v), s = Math.sin(v);
        return {
            atomer: m.atomer.map(function (a) {
                var b = {}; for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) b[k] = a[k];
                b.x = a.x * c - a.y * s + tx; b.y = a.x * s + a.y * c + ty;
                return b;
            }),
            kaede: null
        };
    }

    /* Et fast tal mellem 0 og 1 for et par heltal */
    function hash(a, b) {
        var h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
        return h - Math.floor(h);
    }

    /* ----- Ét molekyle i vand --------------------------------------------------------------- */
    var VAND = { atomer: [{ s: "O", x: 0, y: 0, tag: true }, { s: "H", x: -0.98, y: 0.7, giv: true }, { s: "H", x: 0.98, y: 0.7, giv: true }] };

    /* Et vandmolekyle med O i (x, y), hvor det ene H peger i retningen u
       (enhedsvektor), og det andet H sidder 104,5 grader derfra */
    function vandRettet(x, y, ux, uy, side) {
        var v = 104.5 * Math.PI / 180 * (side || 1);
        var c = Math.cos(v), s = Math.sin(v);
        var h2x = ux * c - uy * s, h2y = ux * s + uy * c;
        return { atomer: [
            { s: "O", x: x, y: y, tag: true },
            { s: "H", x: x + ux, y: y + uy, giv: true },
            { s: "H", x: x + h2x, y: y + h2y, giv: true }
        ], kaede: null, saer: true };
    }

    function afstand(a, x, y) { return Math.sqrt((a.x - x) * (a.x - x) + (a.y - y) * (a.y - y)); }

    /* Ét molekyle i vand, fokuseret (brugeren 13. nov. 2026: den store lup
       "tager alt fokus ... Det er okay med en mikrofigur.. men den skal være
       mindre og mere fokuseret og mere pædagogisk"). Molekylet er vendt, saa H
       i OH-gruppen peger opad. Kun vandet taet paa molekylet er med, og ingen
       vandmolekyler ligger lige om kaeden. Under molekylet viser en graa
       klamme den upolaere kaede og en groen klamme den polaere gruppe. */
    function layoutVand(stof, R, rMaks) {
        var m = K.model(stof);
        /* Vendt, saa H i OH-gruppen peger op (glycerol har allerede den
           midterste OH-gruppe opad) */
        if (stof.id !== "glycerol") m = { atomer: m.atomer.map(function (a) { var b = {}; for (var q in a) if (Object.prototype.hasOwnProperty.call(a, q)) b[q] = a[q]; b.y = -a.y; return b; }), kaede: m.kaede };
        var k = K.kasse([m]);
        var L = k.x1 - k.x0, Hm = k.y1 - k.y0;
        var r = Math.min(rMaks, (R.b * 0.86) / Math.max(L + 5, 9), R.h / (Hm + 8));
        var mol = K.flyt(m, -(k.x0 + k.x1) / 2, -(k.y0 + k.y1) / 2);
        var mk = K.kasse([mol]);
        var saer = [];
        /* Vand, der tager imod fra et H i en gruppe */
        mol.atomer.forEach(function (h) {
            if (!h.giv) return;
            var o = naermesteO(mol, h);
            var dx = h.x - o.x, dy = h.y - o.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
            var ux = dx / l, uy = dy / l;
            var wx = h.x + ux * K.HB, wy = h.y + uy * K.HB;
            /* Ikke ned under molekylet, hvor klammerne staar: saa vandret */
            if (wy > mk.y1 - 0.2 && stof.id !== "vand") { ux = ux < 0 ? -1 : 1; uy = 0; wx = h.x + ux * K.HB; wy = h.y; }
            var v = Math.atan2(uy, ux);
            saer.push(vandRettet(wx, wy, Math.cos(v + 0.95), Math.sin(v + 0.95), 1));
        });
        /* Vand, der giver et H til et O i en gruppe (helst ovenfra, saa der er
           plads til klammerne under molekylet) */
        var RET = [[0, -1], [0.55, -0.84], [-0.55, -0.84], [1, 0], [-1, 0], [0.55, 0.84], [-0.55, 0.84], [0, 1]];
        mol.atomer.forEach(function (o) {
            if (!o.tag) return;
            var antal = 0, maks = stof.id === "vand" ? 2 : 1;
            for (var i = 0; i < RET.length && antal < maks; i++) {
                var ux = RET[i][0], uy = RET[i][1];
                var wx = o.x + ux * (K.HB + 1), wy = o.y + uy * (K.HB + 1);
                if (!fri(mol, saer, wx, wy)) continue;
                if (wy > mk.y1 + 0.2 && stof.id !== "vand") continue;
                saer.push(vandRettet(wx, wy, -ux, -uy, i % 2 ? 1 : -1));
                antal++;
            }
        });
        /* Lidt vand rundt om: kun taet paa molekylet, ikke lige om kaeden og
           ikke under molekylet, hvor klammerne staar */
        var vand = [];
        var nx = Math.ceil(R.b / (3.3 * r)) + 2, ny = Math.ceil(R.h / (3.0 * r)) + 2;
        for (var j = -Math.ceil(ny / 2); j <= Math.ceil(ny / 2); j++) {
            for (var i = -Math.ceil(nx / 2); i <= Math.ceil(nx / 2); i++) {
                var x = i * 3.3 + (j % 2 ? 1.65 : 0) + (hash(i, j) - 0.5) * 0.5;
                var y = j * 3.0 + (hash(j + 9, i - 4) - 0.5) * 0.5;
                if (!fri(mol, saer, x, y, true)) continue;
                var naer = Infinity;
                mol.atomer.forEach(function (a) { naer = Math.min(naer, afstand(a, x, y)); });
                if (naer > 4.4) continue;
                if (y > mk.y1 - 0.2 && x > mk.x0 - 1.5 && x < mk.x1 + 1.5) continue;
                vand.push(drej(VAND, (hash(i * 3 + 1, j * 5 + 2) - 0.5) * 6.2, x, y));
            }
        }
        var alle = [mol].concat(saer);
        var hb = K.hBindinger(alle).filter(function (b) {
            return mol.atomer.indexOf(b.h) >= 0 || mol.atomer.indexOf(b.o) >= 0;
        });
        /* Klammerne under molekylet */
        var klammer = [];
        if (stof.id === "glycerol") klammer.push({ x0: mk.x0 + 0.3, x1: mk.x1 - 0.3, polaer: true, tekst: "3 polære grupper" });
        else if (stof.id === "dihydrogen") klammer.push({ x0: mk.x0 + 0.3, x1: mk.x1 - 0.3, polaer: false, tekst: "upolært" });
        else if (stof.id !== "vand") {
            var cx = mol.atomer.filter(function (a) { return a.s === "C" && !a.gruppe; }).map(function (a) { return a.x; });
            var gx = mol.atomer.filter(function (a) { return a.tag || a.giv || a.gruppe; }).map(function (a) { return a.x; });
            if (cx.length) klammer.push({ x0: Math.min.apply(null, cx) - 0.7, x1: Math.max.apply(null, cx) + 0.7, polaer: false, tekst: gx.length ? "upolær kæde" : "upolært" });
            if (gx.length) klammer.push({ x0: Math.min.apply(null, gx) - 0.6, x1: Math.max.apply(null, gx) + 0.5, polaer: true, tekst: "polær gruppe" });
        }
        return { r: r, ox: R.x + R.b / 2, oy: R.y + R.h * 0.42, mol: [mol], vand: saer.concat(vand), kontakt: [], hb: hb, klammer: klammer, bundY: mk.y1 };
    }

    function naermesteO(m, h) {
        var bedst = null, bd = Infinity;
        m.atomer.forEach(function (o) {
            if (o.s !== "O") return;
            var d = afstand(o, h.x, h.y);
            if (d < bd) { bd = d; bedst = o; }
        });
        return bedst;
    }

    /* Er der plads til et vandmolekyle med O i (x, y)? */
    function fri(mol, saer, x, y, grid) {
        for (var i = 0; i < mol.atomer.length; i++) {
            var a = mol.atomer[i], d = afstand(a, x, y);
            var graense = a.s === "H" ? 2.0 : 2.4;
            /* Om kaeden holder vandet sig laengere vaek */
            if (grid && a.s === "C") graense = 3.1;
            if (grid && a.s === "H" && !a.giv) graense = 2.6;
            if (grid && a.tag) graense = 3.0;
            if (grid && a.giv) graense = 2.9;
            if (d < graense) return false;
        }
        for (var j = 0; j < saer.length; j++) {
            if (afstand(saer[j].atomer[0], x, y) < (grid ? 2.8 : 2.6)) return false;
        }
        return true;
    }

    /* ----- Tegning -------------------------------------------------------------------- */
    P.layoutFor = function (stof, R, rMaks, antal, kunEn) {
        var noegle = this.slags + "|" + stof.id + "|" + Math.round(R.x) + "," + Math.round(R.y) + "," + Math.round(R.b) + "," + Math.round(R.h) + "|" + rMaks + "|" + (antal || 0) + (kunEn ? "e" : "");
        if (this.cache[noegle]) return this.cache[noegle];
        var lay;
        if (this.slags === "vand") lay = layoutVand(stof, R, rMaks);
        else lay = layoutRent(stof, R, rMaks, antal, kunEn) || layoutSmaa(stof, R, rMaks);
        /* Hoejst fire layouts gemmes (to stoffer, der toner over i hinanden) */
        var noegler = Object.keys(this.cache);
        if (noegler.length > 3) delete this.cache[noegler[0]];
        this.cache[noegle] = lay;
        return lay;
    };

    function tegnLay(ctx, lay, alfa) {
        var r = lay.r, ox = lay.ox, oy = lay.oy;
        if (lay.vand) {
            K.tegnMolekyler(ctx, lay.vand, ox, oy, r, 0.5 * alfa);
            /* En glorie om molekylet, saa det skiller sig ud fra vandet */
            ctx.save();
            ctx.globalAlpha *= alfa;
            lay.mol[0].atomer.forEach(function (a) {
                ctx.beginPath();
                ctx.arc(ox + a.x * r, oy + a.y * r, r * (a.s === "H" ? 1.25 : 1.6), 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 228, 150, 0.09)";
                ctx.fill();
            });
            ctx.restore();
        }
        lay.kontakt.forEach(function (c) { K.tegnKontakt(ctx, c.x0, c.x1, c.y, ox, oy, r, alfa); });
        K.tegnMolekyler(ctx, lay.mol, ox, oy, r, alfa);
        lay.hb.forEach(function (b) { K.tegnHBinding(ctx, b.h, b.o, ox, oy, r, alfa); });
        if (lay.klammer) tegnKlammer(ctx, lay, alfa);
    }

    /* Klammer under molekylet med "upolær kæde" og "polær gruppe" */
    function tegnKlammer(ctx, lay, alfa) {
        var r = lay.r, y = lay.oy + (lay.bundY + 0.9) * r;
        ctx.save();
        ctx.globalAlpha *= alfa;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.font = "700 " + Math.round(Math.max(11.5, Math.min(14, r * 0.95))) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        /* En etiket, der ville staa oven i den forrige, rykkes en linje ned */
        var forrigeSlut = -Infinity, linje = parseFloat(ctx.font.split(" ")[1]) + 3;
        lay.klammer.forEach(function (k) {
            var x0 = lay.ox + k.x0 * r, x1 = lay.ox + k.x1 * r;
            var farve = k.polaer ? "#7fe0d2" : "#aab3bf";
            ctx.strokeStyle = farve;
            ctx.beginPath();
            ctx.moveTo(x0, y - 6); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y - 6);
            ctx.stroke();
            var w = ctx.measureText(k.tekst).width, mx = (x0 + x1) / 2;
            var ty = y + 5;
            if (mx - w / 2 < forrigeSlut + 6) ty += linje;
            ctx.fillStyle = farve;
            ctx.fillText(k.tekst, mx, ty);
            forrigeSlut = mx + w / 2;
        });
        ctx.restore();
    }

    /* Luppens indhold i rektanglet R (rammen tegnes af fanen) */
    P.tegn = function (ctx, R) {
        if (!this.stof) return;
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.clip();
        if (this.gammel && this.t < 1) this.tegnIndhold(ctx, R, this.gammel.stof, this.gammel.stof2, 1 - this.t);
        this.tegnIndhold(ctx, R, this.stof, this.stof2, this.t);
        ctx.restore();
    };

    P.tegnIndhold = function (ctx, R, stof, stof2, alfa) {
        var rMaks = this.slags === "vand" ? 17 : 15;
        if (!stof2) {
            tegnLay(ctx, this.layoutFor(stof, R, rMaks, 3), alfa);
            return;
        }
        /* To stoffer: hver sin halvdel med ét par og navnet i hjoernet, saa
           de stiplede linjer i hvert par kan taelles */
        var h2 = R.h / 2;
        var mig = this;
        [[stof, R.y], [stof2, R.y + h2]].forEach(function (p, i) {
            var Ri = { x: R.x, y: p[1], b: R.b, h: h2 };
            ctx.save();
            ctx.beginPath();
            ctx.rect(Ri.x, Ri.y, Ri.b, Ri.h);
            ctx.clip();
            tegnLay(ctx, mig.layoutFor(p[0], { x: Ri.x + 10, y: Ri.y + 30, b: Ri.b - 20, h: Ri.h - 36 }, 22, 1, true), alfa);
            ctx.restore();
            ctx.save();
            ctx.globalAlpha *= alfa;
            if (i === 1) {
                ctx.fillStyle = "#5a5f70";
                ctx.fillRect(R.x, Ri.y - 1, R.b, 2);
            }
            var navn = NK.Data.stort(p[0].navn);
            ctx.font = "700 14px 'Segoe UI', sans-serif";
            var b = ctx.measureText(navn).width + 16;
            NK.rundtRekt(ctx, R.x + 8, Ri.y + 6, b, 22, 6);
            ctx.fillStyle = "rgba(20, 22, 30, 0.86)";
            ctx.fill();
            ctx.fillStyle = "#e6eaef";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(navn, R.x + 16, Ri.y + 17);
            ctx.restore();
        });
    };

    /* Antal hydrogenbindinger pr. par i det rene stof (til selvtesten) */
    Lup.parBindinger = function (stof) {
        var p = K.par(stof);
        return K.hBindinger(p).length;
    };

    /* Bindinger fra molekylet til vandet (til selvtesten) */
    Lup.vandBindinger = function (stof) {
        var lay = layoutVand(stof, { x: 0, y: 0, b: 340, h: 200 }, 13);
        return lay.hb.length;
    };

    /* Klammerne og om molekylet er inde i luppen (til selvtesten) */
    Lup.vandTjek = function (stof, R) {
        var lay = layoutVand(stof, R, 17), inde = true;
        lay.mol[0].atomer.forEach(function (a) {
            var x = lay.ox + a.x * lay.r, y = lay.oy + a.y * lay.r;
            if (x < R.x + lay.r || x > R.x + R.b - lay.r || y < R.y + lay.r || y > R.y + R.h - lay.r) inde = false;
        });
        var bund = lay.oy + (lay.bundY + 0.9) * lay.r + 2 * 17;
        return { klammer: lay.klammer.map(function (k) { return k.tekst; }), inde: inde && bund <= R.y + R.h, r: lay.r, vand: lay.vand.length };
    };

    /* Kontaktfladernes samlede laengde i det rene stof (til selvtesten) */
    Lup.kontaktLaengde = function (stof) {
        var lay = layoutRent(stof, { x: 0, y: 0, b: 600, h: 300 }, 15, 3);
        if (!lay) return 0;
        return lay.kontakt.reduce(function (s, c) { return s + (c.x1 - c.x0); }, 0);
    };

    NK.Lup = Lup;
}());
