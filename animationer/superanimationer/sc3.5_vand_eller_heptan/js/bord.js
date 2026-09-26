/* =====================================================================
   bord.js - scenen, som begge faner deler

   Et bord med hvide fliser bag, et stativ med to reagensglas (vand til
   venstre, heptan til hoejre), et proeveglas med stoffet og en pipette
   (vaesker) eller en spatel (faste stoffer), og kortet med
   strukturformlen paa vaeggen.

   Pipetten traekkes ned i et glas; slippes den over glasset, flyver den
   paa plads og drypper. Et klik paa et glas er det samme (fanen
   bestemmer). Fanerne kobles paa med NK.Bord.kobl(Prototype, valg) og
   kan give disse kroge:
     maaTilsaette(i)     maa stoffet i glas i nu?
     slipPaaGlas(i)      pipetten er sluppet over glas i (ellers sendTil)
     efterTilsaet(i)     stoffet er i glasset
     klikGlas(i)         klik paa glas i
     klikProeve()        klik paa pipetten eller proeveglasset
     klikKort(pt)        klik paa kortet
     tegnKortet(ctx)     kortet (ellers kun formlen)
     visTraekPil()       den gule pil ved pipetten
   valg.soejle: plads forneden paa kortet til soejlen (fane 2)
   valg.prefix: begyndelsen paa id'erne for ankerne (rundvisningen)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegn;
    var S = NK.Sprites;
    var M = NK.Molekyle;

    var FLYV = 0.3, HJEM = 0.35;
    var VENSTRE_PLADS = 165;      /* til maerkaterne til venstre for vandglasset */

    function kobl(P, valg) {
        valg = valg || {};

        P.bordStart = function () {
            this.glas = D.OPL.map(function (o) { return new NK.Glas(o); });
            this.pip = { tilstand: "hjemme", t: 0, fra: null, til: -1, pos: null, hop: 0 };
            this.over = -1;
            this.tryk = null;
            this.bordMus();
        };

        /* Nye glas: begge glas tømmes, og pipetten er hjemme */
        P.nyeGlas = function () {
            this.glas.forEach(function (g) { g.nulstil(); });
            this.pip.tilstand = "hjemme";
            this.pip.til = -1;
            this.over = -1;
            this.tryk = null;
        };

        P.redskab = function () {
            var s = D.stof(this.stof);
            return s && s.tilstand === "fast" ? "spatel" : "pipette";
        };

        /* ----- Layout --------------------------------------------------------- */
        P.bordLayout = function () {
            var W = this.L.b, H = this.L.h;
            var lay = { W: W, H: H };
            var m = NK.klamp(W * 0.02, 8, 18);
            lay.m = m;
            lay.bordY = Math.round(H - NK.klamp(H * 0.12, 40, 92));
            var bund = valg.soejle ? 44 : 0;

            var tH = NK.klamp(Math.min(H * 0.52, lay.bordY * 0.66), 110, 390);
            var k = tH / 360;
            var rackX = Math.max(m + VENSTRE_PLADS + 120 * k, W * 0.27);
            var kortX = rackX + 80 * k + 30;
            lay.bred = W - m - kortX >= 300;

            if (!lay.bred) {
                /* Smal scene: kortet foroven i hele bredden, glassene under det */
                var ch = NK.klamp(H * 0.36, 140, 260) + bund;
                lay.kort = { x: m, y: m, b: W - 2 * m, h: ch };
                var kMaks = (lay.bordY - (lay.kort.y + ch) - 30) / 375;
                k = Math.max(0.3, Math.min(k, kMaks));
                rackX = Math.max(m + VENSTRE_PLADS * 0.85 + 120 * k, W * 0.3);
            }
            lay.k = k;
            lay.rack = { x: rackX - 120 * k, y: lay.bordY - 230 * k, b: 240 * k, h: 230 * k };
            var glasY = lay.bordY - 375 * k;
            lay.glas = [-1, 1].map(function (side) {
                var cx = rackX + side * 50 * k;
                return { cx: cx, x: cx - 30 * k, y: glasY, side: side };
            });

            var vk = Math.max(1.2 * k, 0.9);   /* proeveglasset kan ikke blive mindre, saa etiketten kan laeses */
            var vb = 90 * vk, vh = 110 * vk;
            var vx = rackX + 120 * k + 170;   /* plads til maerkaterne ved heptanglasset */
            vx = Math.min(vx, W - m - vb - 6);
            lay.vial = { x: vx, y: lay.bordY - vh, k: vk, b: vb, h: vh, cx: vx + vb / 2 };
            /* Pipettens top, naar den staar i proeveglasset */
            lay.pipTop = lay.vial.y + 88 * vk - 170 * k;

            if (lay.bred) {
                var kb = Math.min(W - m - kortX, 640);
                var kx = kortX + (W - m - kortX - kb) / 2;
                var kBund = Math.min(glasY + 150 * k, lay.pipTop - 14);
                lay.kort = { x: kx, y: m, b: kb, h: Math.max(120, Math.min(kBund - m, 300 + bund)) };
            }
            lay.fliseTop = Math.round(Math.max(lay.kort.y + 30, glasY + 150 * k));
            if (!lay.bred) lay.fliseTop = Math.round(glasY + 150 * k);
            this.lay = lay;

            var p = valg.prefix;
            if (p) {
                this.saetAnker(p + "-anker-glas", lay.rack.x - 8, glasY - 24, lay.rack.b + 16, lay.bordY - glasY + 28);
                this.saetAnker(p + "-anker-proeve", lay.vial.x - 8, lay.pipTop - 8, lay.vial.b + 16, lay.bordY - lay.pipTop + 12);
                this.saetAnker(p + "-anker-kort", lay.kort.x, lay.kort.y, lay.kort.b, lay.kort.h);
            }
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el(id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(b) + "px";
            e.style.height = Math.round(h) + "px";
        };

        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay) this.bordLayout();
        };

        /* ----- Pipetten (eller spatlen) ------------------------------------------ */
        P.pipHjem = function () {
            var v = this.lay.vial;
            if (this.redskab() === "spatel") return { x: v.cx - 12 * v.k, y: v.y + 84 * v.k, v: -1.15 };
            return { x: v.cx + 4 * v.k, y: v.y + 88 * v.k, v: 0.08 };
        };

        /* Over glas i: pipettens spids lige nede i mundingen, spatlen ved kanten */
        P.pipOver = function (i) {
            var g = this.lay.glas[i], k = this.lay.k;
            if (this.redskab() === "spatel") return { x: g.cx + 3 * k, y: g.y + 2 * k, v: -0.38 };
            return { x: g.cx, y: g.y + 34 * k, v: 0 };
        };

        function mellem(a, b, t) {
            return { x: NK.lerp(a.x, b.x, t), y: NK.lerp(a.y, b.y, t), v: NK.lerp(a.v, b.v, t) };
        }

        P.pipPos = function () {
            var p = this.pip;
            switch (p.tilstand) {
                case "traek": return p.pos;
                case "flyv": return mellem(p.fra, this.pipOver(p.til), NK.blod(p.t));
                case "dryp": return this.pipOver(p.til);
                case "hjem": return mellem(p.fra, this.pipHjem(), NK.blod(p.t));
                default:
                    var h = this.pipHjem();
                    return { x: h.x, y: h.y - Math.sin(Math.PI * p.hop) * 14 * this.lay.k, v: h.v };
            }
        };

        P.sendTil = function (i) {
            if (this.pip.tilstand !== "hjemme" && this.pip.tilstand !== "traek") return false;
            this.pip.fra = this.pipPos();
            this.pip.tilstand = "flyv";
            this.pip.t = 0;
            this.pip.til = i;
            return true;
        };

        P.sendHjem = function () {
            this.pip.fra = this.pipPos();
            this.pip.tilstand = "hjem";
            this.pip.t = 0;
        };

        P.pipHjemme = function () { return this.pip.tilstand === "hjemme"; };

        P.opdaterPip = function (dt) {
            var p = this.pip;
            p.hop = Math.max(0, p.hop - dt * 2.5);
            if (p.tilstand === "flyv") {
                p.t += dt / FLYV;
                if (p.t >= 1) {
                    var g = this.glas[p.til];
                    if (g.tilsaet(this.stof)) {
                        p.tilstand = "dryp";
                        p.t = 0;
                    } else {
                        this.sendHjem();
                    }
                }
            } else if (p.tilstand === "dryp") {
                p.t += dt;
                if (this.glas[p.til].tilsaetT < 0) {
                    var i = p.til;
                    this.sendHjem();
                    if (this.efterTilsaet) this.efterTilsaet(i);
                }
            } else if (p.tilstand === "hjem") {
                p.t += dt / HJEM;
                if (p.t >= 1) { p.tilstand = "hjemme"; p.til = -1; }
            }
        };

        P.bordOpdater = function (dt) {
            this.glas.forEach(function (g) { g.opdater(dt); });
            this.opdaterPip(dt);
        };

        /* ----- Hvor er musen? --------------------------------------------------------- */
        P.glasVed = function (pt) {
            var lay = this.lay;
            if (!lay) return -1;
            for (var i = 0; i < 2; i++) {
                var g = lay.glas[i];
                if (Math.abs(pt.x - g.cx) <= 30 * lay.k + 8 && pt.y >= g.y - 6 && pt.y <= lay.bordY) return i;
            }
            return -1;
        };

        P.overProeve = function (pt) {
            var lay = this.lay;
            if (!lay) return false;
            var v = lay.vial;
            if (pt.x >= v.x - 4 && pt.x <= v.x + v.b + 4 && pt.y >= v.y - 4 && pt.y <= lay.bordY) return true;
            var p = this.pipPos(), k = lay.k;
            if (this.redskab() === "spatel") {
                var ex = Math.cos(p.v), ey = Math.sin(p.v);
                var dx = pt.x - p.x, dy = pt.y - p.y;
                var langs = dx * ex + dy * ey, tvaers = Math.abs(-dx * ey + dy * ex);
                return langs >= -20 * k && langs <= 140 * k && tvaers <= 14 * k + 4;
            }
            return Math.abs(pt.x - p.x) <= 16 * k + 4 && pt.y <= p.y && pt.y >= p.y - 170 * k;
        };

        P.overKort = function (pt) {
            var r = this.lay && this.lay.kort;
            return !!r && pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h;
        };

        /* Glasset under pipettens spids, mens den traekkes */
        P.glasUnderSpids = function () {
            var p = this.pipPos(), lay = this.lay;
            for (var i = 0; i < 2; i++) {
                var g = lay.glas[i];
                if (Math.abs(p.x - g.cx) <= 44 * lay.k + 12 && p.y < lay.bordY && p.y > g.y - 190 * lay.k) {
                    return (!this.maaTilsaette || this.maaTilsaette(i)) ? i : -1;
                }
            }
            return -1;
        };

        /* ----- Musen -------------------------------------------------------------------- */
        P.bordMus = function () {
            var mig = this, c = this.L.canvas;
            c.style.touchAction = "none";

            c.addEventListener("pointerdown", function (e) {
                var pt = mig.L.punkt(e);
                mig.tryk = { x: pt.x, y: pt.y, flyttet: false };
                if (mig.laererUnder && mig.laererUnder(pt.x, pt.y)) return;
                if (mig.pipHjemme() && mig.overProeve(pt) && (!mig.maaTraekke || mig.maaTraekke())) {
                    var p = mig.pipPos();
                    mig.tryk.proeve = true;
                    mig.tryk.dx = p.x - pt.x;
                    mig.tryk.dy = p.y - pt.y;
                    /* Proeveglasset: grib pipetten, ikke glasset */
                    if (pt.y > p.y - 10) { mig.tryk.dx = 0; mig.tryk.dy = 30 * mig.lay.k; }
                    try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                }
            });

            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e), t = mig.tryk;
                if (t && t.proeve) {
                    if (!t.flyttet && Math.abs(pt.x - t.x) + Math.abs(pt.y - t.y) > 6) {
                        t.flyttet = true;
                        mig.pip.tilstand = "traek";
                    }
                    if (mig.pip.tilstand === "traek") {
                        mig.pip.pos = {
                            x: NK.klamp(pt.x + t.dx, 10, mig.L.b - 10),
                            y: NK.klamp(pt.y + t.dy, 40, mig.lay.bordY - 4),
                            v: mig.redskab() === "spatel" ? -0.38 : 0
                        };
                        mig.over = mig.glasUnderSpids();
                    }
                    c.style.cursor = "grabbing";
                    return;
                }
                c.style.cursor = mig.markoer(pt);
            });

            function slip(e, afbrudt) {
                var t = mig.tryk;
                mig.tryk = null;
                if (!t) return;
                var pt = mig.L.punkt(e);
                if (t.proeve && mig.pip.tilstand === "traek") {
                    var i = afbrudt ? -1 : mig.over;
                    mig.over = -1;
                    if (i >= 0) {
                        if (mig.slipPaaGlas) mig.slipPaaGlas(i);
                        else mig.sendTil(i);
                        if (mig.pip.tilstand === "traek") mig.sendHjem();
                    } else {
                        mig.sendHjem();
                        if (mig.slipVed) mig.slipVed(pt);
                    }
                    return;
                }
                if (afbrudt || Math.abs(pt.x - t.x) + Math.abs(pt.y - t.y) > 8) return;
                mig.bordKlik(pt);
            }
            c.addEventListener("pointerup", function (e) { slip(e, false); });
            c.addEventListener("pointercancel", function (e) { slip(e, true); });
        };

        P.bordKlik = function (pt) {
            if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
            if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
            var i = this.glasVed(pt);
            if (i >= 0) { if (this.klikGlas) this.klikGlas(i); return; }
            if (this.overProeve(pt)) {
                if (this.pipHjemme()) this.pip.hop = 1;
                if (this.klikProeve) this.klikProeve();
                return;
            }
            if (this.overKort(pt)) { if (this.klikKort) this.klikKort(pt); return; }
            if (this.klikAndet) this.klikAndet(pt);
        };

        P.markoer = function (pt) {
            if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return "pointer";
            if (this.pipHjemme() && this.overProeve(pt) && (!this.maaTraekke || this.maaTraekke())) return "grab";
            if (this.glasVed(pt) >= 0) return "pointer";
            if (this.overKort(pt) && this.kortMarkoer) return this.kortMarkoer(pt);
            return "default";
        };

        /* ----- Tegningen ------------------------------------------------------------------ */
        P.bordTegn = function () {
            var ctx = this.L.ctx, lay = this.lay, k = lay.k, mig = this;
            var s = D.stof(this.stof);
            T.rum(ctx, lay.W, lay.H, lay.fliseTop, lay.bordY + 6);

            if (this.tegnKortet) this.tegnKortet(ctx);
            else if (s) {
                var felt = T.kort(ctx, lay.kort, s, {});
                var mol = M.laes(s);
                M.tegn(ctx, mol, M.plan(mol, felt, 46), {});
            }

            T.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

            /* Stativet, glassene og stativets forkant */
            S.tegn(ctx, "stativ", lay.rack.x, lay.rack.y, lay.rack.b, lay.rack.h);
            this.glas.forEach(function (g, i) {
                var gl = lay.glas[i];
                var lys = mig.over === i || (mig.maalGlas && mig.maalGlas() === i);
                if (lys) {
                    ctx.save();
                    ctx.fillStyle = "rgba(242, 197, 61, " + (0.28 + 0.12 * Math.sin(mig.tid * 6)) + ")";
                    NK.rundtRekt(ctx, gl.x - 9, gl.y - 8, 60 * k + 18, 360 * k + 12, 12);
                    ctx.fill();
                    ctx.restore();
                }
                ctx.save();
                ctx.translate(gl.x + 30 * k, gl.y + 160 * k);
                ctx.rotate(g.vinkel());
                ctx.scale(k, k);
                ctx.translate(-30, -160);
                g.tegn(ctx);
                S.tegn(ctx, "reagensglas", 0, 0, 60, 360);
                ctx.restore();
            });
            S.tegn(ctx, "stativ_forkant", lay.rack.x, lay.rack.y + 22 * k, lay.rack.b, 14 * k);

            /* Navnene over glassene */
            this.glas.forEach(function (g, i) {
                var gl = lay.glas[i];
                NK.tekst(ctx, D.stof(g.opl).navn, gl.cx, gl.y - 9, {
                    justering: "center", font: T.font("700", NK.klamp(14 * k + 2, 13, 16)),
                    farve: "#eef2f6", kant: true
                });
            });

            this.glas.forEach(function (g, i) { mig.tegnIagttagelse(ctx, g, i); });

            /* Proeveglasset; pipetten staar i det, naar den er hjemme */
            var hjemme = this.pipHjemme();
            T.proeveglas(ctx, lay.vial.x, lay.vial.y, lay.vial.k, s, hjemme ? function () { mig.tegnPip(ctx); } : null);
            if (!hjemme) this.tegnPip(ctx);

            if (this.visTraekPil && this.visTraekPil() && hjemme) {
                T.traekPil(ctx, lay.vial.x - 20, lay.vial.y - 14 * k, this.tid, -1);
            }
        };

        P.tegnPip = function (ctx) {
            var navn = this.redskab(), p = this.pipPos(), k = this.lay.k;
            var mf = S.MAAL[navn];
            S.tegnPositur(ctx, navn, p, mf.anker, 1, k);
            var s = D.stof(this.stof);
            var fuld = this.pip.tilstand !== "hjem" && !(this.pip.tilstand === "dryp" && this.pip.t > 0.25);
            if (navn === "spatel" && s && fuld) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.v);
                ctx.scale(k, k);
                ctx.translate(-mf.anker.x, -mf.anker.y);
                T.spatelIndhold(ctx, s);
                ctx.restore();
            }
        };

        /* Skiltet med iagttagelsen og navnene paa lagene ved siden af glasset */
        P.tegnIagttagelse = function (ctx, g, i) {
            if (!g.resultat) return;
            var lay = this.lay, gl = lay.glas[i], k = lay.k, side = gl.side;
            /* Uden for stativets stolpe, saa stregen gaar ind til laget */
            var kant = side < 0 ? Math.min(gl.cx - 30 * k - 10, lay.rack.x - 4) : Math.max(gl.cx + 30 * k + 10, lay.rack.x + lay.rack.b + 4);
            var ind = gl.cx + side * 16 * k;
            var ny = function (y) { return gl.y + y * k; };
            var top = ny(g.overflade());
            T.skilt(ctx, kant, top - 22, g.resultat.obs, g.resultat.blandes, side);
            var s = g.s();
            if (s.tilstand === "vaeske" && !g.resultat.blandes) {
                g.lagMidter().forEach(function (l) {
                    T.lagNavn(ctx, kant + side * 4, ny(l.y), ind, l.navn, side);
                });
            } else if (s.tilstand === "fast" && !g.resultat.blandes) {
                T.lagNavn(ctx, kant + side * 4, ny(NK.Glas.BUND - 8), ind, s.navn, side);
            }
        };
    }

    NK.Bord = { kobl: kobl };
}());
