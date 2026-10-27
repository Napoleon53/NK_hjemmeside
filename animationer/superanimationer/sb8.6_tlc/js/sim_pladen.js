/* =====================================================================
   sim_pladen.js - fane 1: Tovtraekningen

   Et TLC-kar med en plade med gulerod og spinat, fire flasker med
   løbevæske fra upolær (heptan) til polær (propanon) og luppen, der
   viser pladens overflade paa mikroniveau. Eleven gaetter, stiller
   pladen i karret og ser pletterne loebe op, skifter løbevæske og finder
   til sidst den, der skiller de fire farvestoffer bedst ad.

   Pladen staar over karret, til eleven klikker paa den. Saa saenkes den
   ned i løbevæsken, laaget kommer paa, og væsken suges op (js/model.js).
   Et klik paa en flaske hælder karret ud og fylder det med den nye
   løbevæske, og en ny plade kommer frem over karret.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NED_TID = 0.7, LAAG_TID = 0.35, FYLD_TID = 0.9;

    function SimPladen() {
        this.lup = new NK.Lup();
        this.startFane(D.PLADEN);
        this.startFoerste();
    }

    var P = SimPladen.prototype;
    NK.Fane.paa(P, { navn: "p", naesteFane: "fane-r", naesteNavn: "Rf-værdien" });

    /* ----- Opgaven ---------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        var id = o.fra || o.loeb;
        this.valgtDel = null;
        this.hover = null;
        this.fyldT = 0;
        this.nyPlade(id, !!(o.koert || o.fra));
    };

    /* En ny plade med løbevæsken id. koert: pladen er allerede loebet (fx 7 : 3,
       som eleven skal sammenligne med). */
    P.nyPlade = function (id, koert) {
        this.loeb = D.LOEB[id];
        this.plade = new NK.Model.Plade({ baner: D.SPINAT_BANER, loeb: this.loeb, bredde: 4.2 });
        if (this.kuglepen) { this.plade.kuglepen = true; }
        this.plade.meldt = false;
        if (koert) {
            this.plade.faerdiggoer();
            this.plade.meldt = true;
            this.ned = 1;
            this.laag = 0;
            this.sted = "i";
        } else {
            this.ned = 0;
            this.laag = 1;
            this.sted = "over";
        }
        this.lup.saet(this.loeb, { caroten: 3, lutein: 3 });
    };

    P.sceneLinje = function () {
        var o = this.opg.o, del = this.delData();
        if (o.vaelg && this.plade.status === "faerdig" && this.sted === "i")
            return "TLC-pladen er kørt med " + this.loeb.navn + ". Tryk Indsend svar, eller prøv en anden flaske.";
        if (del && del.slags === "opgave" && del.maal && this.valgtDel)
            return "Du har valgt " + D.DELE[this.valgtDel].navn + ".";
        return "";
    };

    /* Den flaske, forsoeget beder om (eller null) */
    P.oenskeFlaske = function () {
        var del = this.delData();
        if (!del || del.slags !== "forsoeg" || !del.om) return null;
        for (var i = 0; i < del.om.length; i++) if (del.om[i].indexOf("flaske:") === 0) return del.om[i].slice(7);
        return null;
    };

    /* ----- Indsend (opgaverne Stationær og mobil fase og Find den bedste) --------- */
    P.kanIndsende = function (del) {
        if (del.maal) return !!this.valgtDel;
        if (this.opg.o.vaelg) return this.plade.status === "faerdig" && this.sted === "i";
        return false;
    };

    P.indsendTekst = function (del) {
        if (del.maal) return this.valgtDel ? "Indsend svar: " + D.DELE[this.valgtDel].navn : "Indsend svar";
        if (this.opg.o.vaelg) return this.plade.status === "faerdig" ? "Indsend svar: " + this.loeb.kort : "Indsend svar";
        return "Indsend svar";
    };

    P.indsend = function (del) {
        var o = this.opg.o;
        if (del.maal) {
            if (this.valgtDel === del.maal) {
                var godt = del.godt;
                this.valgtDel = null;
                this.delKlaret("selv", godt, D.Stort(D.DELE[del.maal].navn) + ".");
                return;
            }
            this.fejlLinje(D.DELE[this.valgtDel].f);
            return;
        }
        if (o.vaelg) {
            if (this.loeb.id === o.rigtig) { this.delKlaret("selv", "", D.Stort(this.loeb.navn) + "."); return; }
            this.fejlLinje(o.fejl[this.loeb.id] || "Prøv en anden løbevæske.");
        }
    };

    P.opgaveSvar = function (del) {
        var o = this.opg.o;
        if (del.maal) { this.valgtDel = del.maal; return del.godt; }
        if (o.vaelg) { this.nyPlade(o.rigtig, true); return ""; }
        return "";
    };

    /* Vis svaret under et forsoeg: den rigtige flaske og en faerdig plade */
    P.forsoegSvar = function () {
        var f = this.oenskeFlaske();
        this.nyPlade(f || this.loeb.id, true);
        this.fyldT = 0;
    };

    /* ----- Scenen ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H, top: this.top() };
        lay.bordY = H - NK.klamp(H * 0.085, 44, 70);
        var kant = NK.klamp(W * 0.02, 12, 26);
        /* Luppen til hoejre */
        lay.lupB = Math.round(NK.klamp(W * 0.33, 230, 400));
        lay.lupH = Math.round(NK.klamp(lay.bordY - lay.top - 40, 200, 400));
        lay.lupX = W - kant - lay.lupB - 7;
        lay.lupY = lay.top + 28;
        /* Flaskerne til venstre */
        lay.flB = Math.round(NK.klamp(W * 0.052, 38, 58));
        var flH = lay.flB * 2.1, gab = Math.round(lay.flB * 0.28);
        lay.flasker = D.FLASKER.map(function (id, i) {
            return { id: id, x: kant + i * (lay.flB + gab), y: lay.bordY - flH, b: lay.flB, h: flH };
        });
        lay.flSlut = kant + 4 * lay.flB + 3 * gab;
        /* Karret i midten. Pladen over karret skal ogsaa kunne vaere der. */
        var plade = this.plade;
        var hoejKar = (lay.bordY - lay.top - 26) / 1.32;
        var s = hoejKar * 0.8 / plade.hoejde;
        var rum = lay.lupX - 30 - lay.flSlut - 30;
        var kb = (plade.bredde + 1.4) * s * 240 / 204;
        if (kb > rum) { s *= rum / kb; kb = rum; }
        s = NK.klamp(s, 8, 46);
        kb = (plade.bredde + 1.4) * s * 240 / 204;
        var kh = plade.hoejde * s / 0.8;
        lay.s = s;
        lay.K = { x: lay.flSlut + 30 + (rum - kb) / 2, y: lay.bordY - kh, b: kb, h: kh };
        this.lay = lay;
        this.lup.stoerrelse(lay.lupB, lay.lupH);
        this.saetAnker("kar", lay.K.x, lay.K.y - kh * 0.3, lay.K.b, kh * 1.3);
        this.saetAnker("lup", lay.lupX, lay.lupY, lay.lupB, lay.lupH);
        this.saetAnker("flasker", kant, lay.bordY - flH, lay.flSlut - kant, flH);
    };

    /* Pladens rektangel lige nu (over karret, paa vej ned eller i karret) */
    P.pladeRekt = function () {
        var lay = this.lay, K = lay.K, I = Tg.karInde(K), s = lay.s, p = this.plade;
        var b = p.bredde * s, h = p.hoejde * s;
        var x = (I.x0 + I.x1) / 2 - b / 2;
        var yI = I.bund - h - 1;
        var yO = K.y - h * 0.42;
        var u = NK.blod(this.ned);
        return { x: x, y: NK.lerp(yO, yI, u), b: b, h: h };
    };

    /* ----- Tegneloekken -------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var p = this.plade;
        if (this.fyldT > 0) {
            this.fyldT = Math.max(0, this.fyldT - dt);
        }
        if (this.sted === "ned") {
            this.ned = Math.min(1, this.ned + dt / NED_TID);
            if (this.ned >= 1) { this.sted = "laag"; }
        } else if (this.sted === "laag") {
            this.laag = Math.max(0, this.laag - dt / LAAG_TID);
            if (this.laag <= 0) { this.sted = "i"; p.koer(); }
        }
        p.opdater(dt);
        this.lup.opdater(dt);
        /* Pladen er loebet: forsoeget er klaret */
        if (p.status === "faerdig" && !p.meldt) {
            p.meldt = true;
            var del = this.delData();
            if (del && del.slags === "forsoeg" && !this.faerdig && !this.venter) {
                var f = this.oenskeFlaske();
                if (!f || f === this.loeb.id) this.delKlaret("selv", del.set);
            }
            /* Paaskeaegget: efter kortet, saa beskeden ikke viskes ud */
            if (p.kuglepen) this.kortBesked(D.PAASKE.set, 9, "gul");
            this.visIndsend();
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, W = lay.W, H = lay.H, t = this.tid;
        if (!lay) return;
        Tg.baggrund(ctx, W, H, lay.bordY);
        this.tegnFlasker(ctx);
        this.tegnKar(ctx);
        this.tegnLup(ctx);
        this.tegnRinge(ctx, t);
        this.tegnSkilte(ctx, t);
        this.tegnSejr(ctx, W, H);
    };

    P.tegnFlasker = function (ctx) {
        var lay = this.lay, mig = this;
        var aaben = this.opg.o.vaelg && this.iForsoeg(), oenske = this.oenskeFlaske();
        lay.flasker.forEach(function (f) {
            var L = D.LOEB[f.id];
            var navn = L.kort === "9 : 1" || L.kort === "7 : 3" ? L.kort : L.navn;
            var svag = !aaben && oenske && oenske !== f.id;
            Tg.flaske(ctx, f.x, f.y, f.b, navn, "", { valgt: mig.loeb.id === f.id, svag: svag });
        });
        /* De to blandinger: en klamme over flaskerne med 9 : 1 og 7 : 3 */
        var b1 = lay.flasker[1], b2 = lay.flasker[2], ky = b1.y - 8;
        ctx.save();
        ctx.strokeStyle = "rgba(207, 214, 222, 0.7)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(b1.x + 4, ky + 5);
        ctx.lineTo(b1.x + 4, ky);
        ctx.lineTo(b2.x + b2.b - 4, ky);
        ctx.lineTo(b2.x + b2.b - 4, ky + 5);
        ctx.stroke();
        ctx.fillStyle = "#cfd6de";
        ctx.font = "600 11px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("heptan : propanon", (b1.x + b2.x + b2.b) / 2, ky - 3);
        ctx.restore();
        /* Polaritetsbaandet paa bordkanten */
        var x0 = lay.flasker[0].x, x1 = lay.flSlut, y = lay.bordY + 16;
        var g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, "#8b929c");
        g.addColorStop(1, "#3d9ee0");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x0, y - 4, x1 - x0, 8, 4);
        ctx.fill();
        ctx.fillStyle = "#cfd6de";
        ctx.font = "700 12px 'Segoe UI', sans-serif";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.fillText("upolær", x0, y + 8);
        ctx.textAlign = "right";
        ctx.fillText("polær →", x1, y + 8);
    };

    P.tegnKar = function (ctx) {
        var lay = this.lay, K = lay.K, s = lay.s, p = this.plade;
        Tg.karBag(ctx, K);
        /* Løbevæsken: under ompaeldningen falder den og stiger igen */
        var dybde = p.vaeske * s;
        if (this.fyldT > 0) {
            var u = this.fyldT / FYLD_TID;
            dybde *= u > 0.5 ? (u - 0.5) * 2 : (0.5 - u) * 2;
        }
        Tg.karVaeske(ctx, K, dybde);
        var R = this.pladeRekt();
        Tg.plade(ctx, p, R.x, R.y, s, {});
        this.pladeR = R;
        Tg.karFor(ctx, K);
        this.laagR = Tg.laag(ctx, K, this.laag);
        /* Banernes navne paa bordet foran karret */
        var mig = this;
        p.baner.forEach(function (b, i) {
            Tg.etiket(ctx, b.navn, R.x + p.banePos(i) * s, lay.bordY + 15, { font: "700 11px 'Segoe UI', sans-serif", pad: 8,
                kant: mig.erOm("bane:" + i) ? "#f2c53d" : null });
        });
        /* Delene, man kan vaelge i opgaven Stationær og mobil fase */
        var del = this.delData();
        if (del && del.maal && !this.faerdig && !this.venter) {
            var vis = this.valgtDel ? [this.valgtDel] : [];
            if (this.hover && this.hover !== this.valgtDel) vis.push(this.hover);
            vis.forEach(function (id) {
                var r = mig.delRekt(id);
                if (!r) return;
                var valgt = id === mig.valgtDel;
                ctx.save();
                ctx.strokeStyle = valgt ? "#3d9ee0" : "rgba(255,255,255,0.8)";
                ctx.lineWidth = valgt ? 3 : 2;
                ctx.setLineDash(valgt ? [] : [5, 4]);
                NK.rundtRekt(ctx, r.x - 3, r.y - 3, r.b + 6, r.h + 6, 6);
                ctx.stroke();
                ctx.restore();
                Tg.etiket(ctx, D.DELE[id].navn, r.x + r.b + 10, r.y + r.h / 2, { venstre: true,
                    bund: valgt ? "#2a76ac" : "rgba(20,22,28,0.9)", font: "700 13px 'Segoe UI', sans-serif" });
            });
        }
    };

    /* Delenes rektangler (til opgaven Stationær og mobil fase) */
    P.delRekt = function (id) {
        var lay = this.lay, K = lay.K, I = Tg.karInde(K), s = lay.s, p = this.plade, R = this.pladeR || this.pladeRekt();
        var yS = Tg.pladeY(p, R.y, s, p.start), yF = Tg.pladeY(p, R.y, s, p.start + p.front);
        switch (id) {
            case "laag": return this.laagR && !this.laagR.af ? this.laagR : null;
            case "plade": return { x: R.x, y: R.y, b: R.b, h: R.h };
            case "loeb": return { x: I.x0, y: I.bund - p.vaeske * s, b: I.x1 - I.x0, h: p.vaeske * s };
            case "start": return { x: R.x, y: yS - 4, b: R.b, h: 8 };
            case "front": return p.markeret ? { x: R.x, y: yF - 4, b: R.b, h: 8 } : null;
            case "pletter":
                var pl = p.pletter().filter(function (q) { return q.z > 0.3; });
                if (!pl.length) return null;
                var y0 = 1e9, y1 = -1e9;
                pl.forEach(function (q) { var yy = Tg.pladeY(p, R.y, s, p.start + q.z); y0 = Math.min(y0, yy - q.ry * s); y1 = Math.max(y1, yy + q.ry * s); });
                return { x: R.x + 3, y: y0, b: R.b - 6, h: y1 - y0 };
        }
        return null;
    };

    P.tegnLup = function (ctx) {
        var lay = this.lay, R = this.pladeR, p = this.plade, s = lay.s;
        /* Udsnittet paa pladen og linjerne ud til luppen */
        var bx = R.x + p.banePos(1) * s, by = Tg.pladeY(p, R.y, s, p.start + 1.2);
        var r = 9;
        ctx.save();
        ctx.strokeStyle = "rgba(220, 230, 240, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(bx + r, by - r);
        ctx.lineTo(lay.lupX - 6, lay.lupY);
        ctx.moveTo(bx + r, by + r);
        ctx.lineTo(lay.lupX - 6, lay.lupY + lay.lupH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(240, 245, 250, 0.9)";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(bx - r, by - r, 2 * r, 2 * r);
        ctx.restore();
        this.lup.tegn(ctx, lay.lupX, lay.lupY);
        Tg.etiket(ctx, "Luppen: spinat i " + this.loeb.navn, lay.lupX + lay.lupB / 2, lay.lupY - 18,
            { font: "700 13px 'Segoe UI', sans-serif" });
    };

    /* De gule ringe om det, kortet handler om */
    P.tegnRinge = function (ctx, t) {
        var lay = this.lay, mig = this, R = this.pladeR, p = this.plade, s = lay.s;
        this.omNu().forEach(function (om) {
            if (om === "lup") Tg.ring(ctx, lay.lupX - 7, lay.lupY - 7, lay.lupB + 14, lay.lupH + 14, t, 20);
            else if (om === "plade" && mig.sted === "over") Tg.ring(ctx, R.x, R.y, R.b, R.h, t, 6);
            else if (om === "flasker") Tg.ring(ctx, lay.flasker[0].x, lay.flasker[0].y, lay.flSlut - lay.flasker[0].x, lay.flasker[0].h, t);
            else if (om.indexOf("flaske:") === 0 && mig.loeb.id !== om.slice(7)) {
                lay.flasker.forEach(function (f) { if (f.id === om.slice(7)) Tg.ring(ctx, f.x, f.y, f.b, f.h, t); });
            } else if (om.indexOf("bane:") === 0) {
                var i = parseInt(om.slice(5), 10), bx = R.x + p.banePos(i) * s, bb = 1.15 * s;
                Tg.ring(ctx, bx - bb / 2, R.y + 3, bb, R.h - 6, t, 6);
            }
        });
    };

    /* Gule skilte, der siger, hvad et klik goer */
    P.tegnSkilte = function (ctx, t) {
        if (!this.iForsoeg()) return;
        var lay = this.lay, R = this.pladeR, oenske = this.oenskeFlaske();
        if (oenske && oenske !== this.loeb.id) {
            var f = lay.flasker[D.FLASKER.indexOf(oenske)];
            Tg.skilt(ctx, "Klik: hæld " + D.LOEB[oenske].kort + " i karret", f.x + f.b / 2, f.y - 22, t, "ned");
            return;
        }
        if (this.sted === "over" && this.fyldT <= 0 && (this.delData().slags === "forsoeg" || this.opg.o.vaelg)) {
            Tg.skilt(ctx, "Klik: stil pladen i karret", R.x + R.b / 2, R.y - 22, t, "ned");
        }
        if (this.opg.o.vaelg && this.sted !== "ned" && this.sted !== "laag" && this.plade.status !== "loeber") {
            var f0 = lay.flasker[0];
            Tg.skilt(ctx, "Klik på en flaske", (f0.x + lay.flSlut) / 2, f0.y - 22, t, "ned");
        }
    };

    /* ----- Musen ----------------------------------------------------------------------- */
    P.flaskeVed = function (pt) {
        var lay = this.lay;
        for (var i = 0; i < lay.flasker.length; i++) {
            var f = lay.flasker[i];
            if (pt.x >= f.x - 4 && pt.x <= f.x + f.b + 4 && pt.y >= f.y && pt.y <= f.y + f.h) return f.id;
        }
        return null;
    };

    P.paaPlade = function (pt) {
        var R = this.pladeR || this.pladeRekt();
        return pt.x >= R.x - 6 && pt.x <= R.x + R.b + 6 && pt.y >= R.y - 6 && pt.y <= R.y + R.h + 6;
    };

    P.paaKar = function (pt) {
        var K = this.lay.K;
        return pt.x >= K.x && pt.x <= K.x + K.b && pt.y >= K.y - K.h * 0.35 && pt.y <= K.y + K.h;
    };

    P.paaStart = function (pt) {
        var R = this.pladeR || this.pladeRekt(), p = this.plade;
        var yS = Tg.pladeY(p, R.y, this.lay.s, p.start);
        return pt.x >= R.x && pt.x <= R.x + R.b && Math.abs(pt.y - yS) <= 6;
    };

    /* Den del af karret, musen er over (opgaven Stationær og mobil fase) */
    P.delVed = function (pt) {
        /* Pletterne: kun naar klikket rammer en plet */
        var p = this.plade, R = this.pladeR || this.pladeRekt(), s = this.lay.s;
        var plet = p.pletter().some(function (q) {
            if (q.z < 0.3) return false;
            var qx = R.x + q.x * s, qy = Tg.pladeY(p, R.y, s, p.start + q.z);
            var dx = (pt.x - qx) / (q.rx * s + 4), dy = (pt.y - qy) / (q.ry * s + 4);
            return dx * dx + dy * dy <= 1;
        });
        if (plet) return "pletter";
        var orden = ["start", "front", "laag", "loeb", "plade"];
        for (var i = 0; i < orden.length; i++) {
            var r = this.delRekt(orden[i]);
            if (r && pt.x >= r.x - 3 && pt.x <= r.x + r.b + 3 && pt.y >= r.y - 3 && pt.y <= r.y + r.h + 3) return orden[i];
        }
        return null;
    };

    P.overScene = function (pt) {
        this.hover = null;
        if (!pt || !this.lay) return null;
        var del = this.delData();
        if (del && del.maal && !this.faerdig && !this.venter) {
            this.hover = this.delVed(pt);
            return this.hover ? "pointer" : null;
        }
        if (this.flaskeVed(pt)) return "pointer";
        if (this.sted === "over" && (this.paaPlade(pt) || this.paaKar(pt))) return "pointer";
        if (this.paaStart(pt)) return "pointer";
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        /* Paaskeaegget: tre klik paa startlinjen */
        if (this.paaStart(pt)) {
            this.startKlik = (this.startKlik || 0) + 1;
            if (this.startKlik === 3 && !this.kuglepen) {
                this.kuglepen = true;
                if (this.plade.status === "klar") this.plade.kuglepen = true;
                this.kortBesked(D.PAASKE.kuglepen, 7, "gul");
                NK.paaskeaeg = (NK.paaskeaeg || 0) + 1;
            }
        }
        var del = this.delData();
        /* Stationær og mobil fase: et klik vaelger en del af karret */
        if (del && del.maal && !this.faerdig && !this.venter) {
            var d = this.delVed(pt);
            if (d) {
                this.valgtDel = d;
                this.nulstilHjaelp();
                if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.naesteLinje("", "");
                this.visIndsend();
                return;
            }
        }
        var f = this.flaskeVed(pt);
        if (f) { this.flaskeKlik(f); return; }
        if (this.paaPlade(pt) || this.paaKar(pt)) { this.pladeKlik(); return; }
    };

    P.flaskeKlik = function (id) {
        if (this.spaer()) return;
        var o = this.opg.o, oenske = this.oenskeFlaske();
        if (!o.vaelg && !oenske) {
            this.kortBlink();
            this.kortBesked("I denne opgave er løbevæsken " + this.loeb.navn + ".", 4);
            return;
        }
        if (!o.vaelg && oenske !== id) {
            this.kortBesked("Opgaven beder om flasken med " + D.LOEB[oenske].navn + ".", 4);
            return;
        }
        if (this.sted === "ned" || this.sted === "laag" || this.plade.status === "loeber") {
            this.kortBesked("Vent, til løbevæsken er nået op til toppen af TLC-pladen.", 3);
            return;
        }
        if (id === this.loeb.id && this.sted === "over") return;
        this.nulstilHjaelp();
        this.nyPlade(id, false);
        this.fyldT = FYLD_TID;
        if (this.fast.klasse === "skidt" || this.fast.klasse === "hint") this.naesteLinje("", "");
    };

    P.pladeKlik = function () {
        if (this.sted !== "over") {
            if (this.plade.status === "faerdig" && this.iForsoeg() && this.opg.o.vaelg) {
                this.kortBesked("TLC-pladen er kørt. Klik på en flaske for at prøve en anden løbevæske.", 4);
            }
            return;
        }
        if (this.spaer()) return;
        var oenske = this.oenskeFlaske();
        if (oenske && oenske !== this.loeb.id) {
            this.kortBesked("Klik først på flasken med " + D.LOEB[oenske].navn + ".", 4);
            return;
        }
        if (this.fyldT > 0) return;
        this.nulstilHjaelp();
        this.sted = "ned";
    };

    NK.SimPladen = SimPladen;
}());
