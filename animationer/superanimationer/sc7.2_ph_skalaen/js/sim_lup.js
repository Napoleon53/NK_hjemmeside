/* =====================================================================
   sim_lup.js - fane 2: luppen

   Et baegerglas med vand og universalindikator. Eleven traekker
   pH-maerket paa skalaen (eller klikker paa den), og luppen viser
   H₃O⁺ og OH⁻ i et lille rum af vaesken: 1 prik = 1 ion. Med + og −
   zoomes i trin af ti, saa hele skalaen fra 0 til 14 kan taelles.

   Fem maal (D.LUP_MAAL) foerer fra ét trin (10 gange) til tolv
   (en billion). Et maal er naaet, naar pH og zoom passer, og eleven har
   sluppet maerket. Bagefter er der frit valg. Hvor langt eleven er
   naaet, huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc7.2-lup";
    var FYLD = 110;              /* mL i baegerglasset */

    function SimLup() {
        this.L = new NK.Laerred(NK.el("lup-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.lup = new NK.Lup();
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.ph = 7;
        this.z = 8;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.nr = NK.klamp(gemt.maal || 0, 0, D.LUP_MAAL.length);
        this.rost = this.nr >= D.LUP_MAAL.length;

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.startMaal();
    }

    var P = SimLup.prototype;

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.luft = NK.klamp(H * 0.1, 10, 70);
        lay.px = NK.klamp(W * 0.017, 12, 15);
        var bandH = NK.klamp(H * 0.055, 24, 40);
        lay.skala = { x0: kant + 40, x1: W - kant - 40, y: Math.round(lay.luft + 56), h: bandH };
        lay.skalaBund = lay.skala.y + bandH + 12 + lay.px;
        lay.bordY = Math.round(H - NK.klamp(H * 0.1, 30, 70));

        /* Glasset til venstre, luppen til hoejre */
        var top = lay.skalaBund + 30;
        var hoej = lay.bordY - top;
        var gb = NK.klamp(Math.min(W * 0.26, hoej * 0.62), 80, 230);
        lay.glas = { cx: kant + 40 + gb / 2 + NK.klamp(W * 0.03, 0, 40), bund: lay.bordY, b: gb };
        var fri = W - (lay.glas.cx + gb / 2) - kant;
        var R = NK.klamp(Math.min((hoej - 64) / 2, fri * 0.4), 60, 230);
        lay.lup = { cx: lay.glas.cx + gb / 2 + fri / 2, cy: top + R + 8, R: R };
        /* Knapperne paa luppens kant forneden */
        var kr = NK.klamp(R * 0.14, 17, 26);
        var a = Math.PI * 0.78;
        lay.ud = { x: lay.lup.cx + Math.cos(a) * (R + kr * 0.5), y: lay.lup.cy + Math.sin(a) * (R + kr * 0.5), r: kr };
        a = Math.PI * 0.22;
        lay.ind = { x: lay.lup.cx + Math.cos(a) * (R + kr * 0.5), y: lay.lup.cy + Math.sin(a) * (R + kr * 0.5), r: kr };
        lay.tekstY = lay.lup.cy + R + NK.klamp(R * 0.12, 14, 24);
        lay.kop = { x: kant + 24, y: lay.bordY };
        this.lay = lay;

        this.saetAnker("lup-anker-skala", lay.skala.x0 - 4, lay.skala.y - 50, lay.skala.x1 - lay.skala.x0 + 8, lay.skalaBund - lay.skala.y + 56);
        var gl = lay.glas;
        this.saetAnker("lup-anker-glas", gl.cx - gb / 2, gl.bund - gb * 1.2, gb, gb * 1.2);
        this.saetAnker("lup-anker-lup", lay.lup.cx - R - 8, lay.lup.cy - R - 8, 2 * R + 16, 2 * R + 16);
        this.saetAnker("lup-anker-zoom", lay.ud.x - kr - 4, Math.min(lay.ud.y, lay.ind.y) - kr - 4, lay.ind.x - lay.ud.x + 2 * kr + 8, 2 * kr + 8 + (lay.tekstY + 40 - lay.ud.y));
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
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* ----- Modellen ------------------------------------------------------------------ */
    P.nH = function () { return K.antal(K.h3o(this.ph), this.z); };
    P.nO = function () { return K.antal(K.oh(this.ph), this.z); };

    P.opdaterLup = function () {
        this.lup.saet(this.nH(), this.nO());
        this.visMaaling();
        this.visStatus();
    };

    P.saetPh = function (ph) {
        ph = NK.klamp(Math.round(ph * 10) / 10, 0, 14);
        /* Hele tal trækker lidt i mærket */
        if (Math.abs(ph - Math.round(ph)) <= 0.1 && this.traek) ph = Math.round(ph);
        if (ph === this.ph) return;
        this.ph = ph;
        this.opdaterLup();
    };

    /* retning +1: zoom ud (stoerre rum), -1: zoom ind */
    P.zoom = function (retning) {
        var z = this.z + retning;
        if (z < K.ZOOM_MIN || z > K.ZOOM_MAKS) {
            this.besked(retning > 0 ? "Længere ud kan luppen ikke zoome." : "Længere ind kan luppen ikke zoome.", "gul");
            return;
        }
        this.z = z;
        this.lup.zoom(retning);
        this.opdaterLup();
        if (this.afvisTilbud) this.afvisTilbud();
        if (z === K.ZOOM_MAKS && this.laererAeg) this.laererAeg();
    };

    /* ----- Maalene ---------------------------------------------------------------------- */
    P.maal = function () { return D.LUP_MAAL[this.nr] || null; };

    P.startMaal = function () {
        var m = this.maal();
        this.naaet = false;
        this.hjaelp = 0;
        this.besked("", "");
        if (m) {
            this.ph = m.start.ph;
            this.z = m.start.z;
            this.startZ = m.start.z;
        }
        this.lup.nulstil();
        this.lup.saet(this.nH(), this.nO());
        this.lup.straks();
        this.visMaal();
        this.visMaaling();
        this.visStatus();
    };

    P.opfyldt = function (m) {
        var mm = m.maal;
        if (Math.abs(this.ph - mm.ph) > 0.04) return false;
        if (mm.zMin !== undefined && this.z < mm.zMin) return false;
        if (mm.zMaks !== undefined && this.z > mm.zMaks) return false;
        return true;
    };

    P.tjekMaal = function () {
        var m = this.maal();
        if (!m || this.naaet || this.traek) return;
        if (this.opfyldt(m)) this.maalNaaet();
    };

    P.maalNaaet = function () {
        var m = this.maal();
        this.naaet = true;
        this.hjaelp = 0;
        var efter = m.efter;
        if (!efter) {
            var k = this.startZ - this.z;
            efter = "Ved pH 2 er der 100.000 gange så mange H₃O⁺ som ved pH 7. Du zoomede " + k +
                " gange ind, så luppen viser et " + K.ord(Math.pow(10, k)) + " gange mindre rum.";
        }
        this.besked(NK.html(efter), "god");
        if (this.afvisTilbud) this.afvisTilbud();
        var gemt = NK.hent(NOEGLE, {}) || {};
        NK.gem(NOEGLE, { maal: Math.max(this.nr + 1, gemt.maal || 0) });
        if (this.nr >= D.LUP_MAAL.length - 1 && !this.rost) {
            this.rost = true;
            this.ventRos = 1.4;
        }
        this.visMaal();
        this.visStatus();
    };

    P.knap = function () {
        var m = this.maal();
        if (!m) {
            this.nr = 0;
            this.startMaal();
            return;
        }
        if (this.naaet) {
            var sidste = this.nr >= D.LUP_MAAL.length - 1;
            this.nr++;
            if (sidste) {
                this.visMaal();
                this.visStatus();
                if (NK.visFane) NK.visFane("fane-fortynd");
                return;
            }
            this.startMaal();
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(m.hint), "gul");
            this.visMaal();
            return;
        }
        /* Vis svaret: pH og zoom saettes, saa maalet er naaet */
        var mm = m.maal;
        var z = this.z;
        if (mm.zMin !== undefined && z < mm.zMin) z = mm.zMin;
        if (mm.zMaks !== undefined && z > mm.zMaks) z = mm.zMaks;
        if (mm.zMin !== undefined && mm.zMaks !== undefined && m.start.z > mm.zMaks) z = mm.zMaks;
        while (this.z !== z) this.zoomStille(this.z < z ? 1 : -1);
        this.ph = mm.ph;
        this.opdaterLup();
        this.maalNaaet();
        this.besked("<b>Svar:</b> " + NK.html(this.el.besked.textContent), "gul");
    };

    /* Zoom uden beskeder (Vis svaret) */
    P.zoomStille = function (retning) {
        this.z += retning;
        this.lup.zoom(retning);
    };

    P.nulstil = function () {
        var m = this.maal();
        if (m) this.startMaal();
        else { this.ph = 7; this.z = 8; this.lup.nulstil(); this.opdaterLup(); this.lup.straks(); }
    };

    /* ----- Panelet ------------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("lup-knap"),
            besked: NK.el("lup-besked"),
            kort: NK.el("lup-kort")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("lup-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visMaal = function () {
        var m = this.maal();
        NK.saetTekst("lup-nr", String(Math.min(this.nr + 1, D.LUP_MAAL.length)));
        NK.el("lup-taeller").hidden = !m;
        var tekst, klasse = "knap";
        if (!m) {
            NK.saetTekst("lup-titel", "Frit valg");
            NK.saetTekst("lup-prompt", "Træk pH-mærket, og zoom med + og −.");
            tekst = "Start målene forfra";
        } else {
            NK.saetTekst("lup-titel", "Mål");
            NK.saetTekst("lup-prompt", m.tekst);
            if (this.naaet) {
                tekst = this.nr >= D.LUP_MAAL.length - 1 ? "Videre til fortyndingen →" : "Næste mål →";
                klasse = "knap blaa banker";
            } else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.naaet);
    };

    P.visMaaling = function () {
        var nH = this.nH(), nO = this.nO();
        NK.saetTekst("lup-ph", K.phTekst(this.ph, 1));
        NK.saetTekst("lup-nh", K.antalTekst(nH));
        NK.saetTekst("lup-no", K.antalTekst(nO));
        NK.saetTekst("lup-ch", NK.potens(K.h3o(this.ph), 2) + " M");
        NK.saetTekst("lup-co", NK.potens(K.oh(this.ph), 2) + " M");
        NK.saetTekst("lup-side", K.sideTekst(this.z));
        NK.saetTekst("lup-modvand", K.modVand(this.ph));
    };

    P.visStatus = function () {
        var nH = this.nH(), nO = this.nO(), t;
        var m = this.maal();
        if (this.naaet && m) t = "Målet er nået. Tryk på knappen til højre for at gå videre.";
        else if (nH > NK.Lup.MAKS && nO < 0.5) t = "For mange H₃O⁺ at tælle. Zoom ind med <b>+</b>.";
        else if (nO > NK.Lup.MAKS && nH < 0.5) t = "For mange OH⁻ at tælle. Zoom ind med <b>+</b>.";
        else if (nH < 0.5 && nO < 0.5) t = "Ingen ioner i luppen lige nu. Zoom ud med <b>−</b>.";
        else if (m && m.maal.zMin !== undefined && Math.abs(this.ph - m.maal.ph) < 0.04 && this.z < m.maal.zMin) t = "Zoom ud med <b>−</b>.";
        else if (m && m.maal.zMaks !== undefined && Math.abs(this.ph - m.maal.ph) < 0.04 && this.z > m.maal.zMaks) t = "Zoom ind med <b>+</b>.";
        else if (m && Math.abs(this.ph - m.start.ph) < 0.04 && this.nr <= 1) t = "Træk pH-mærket på skalaen. Et klik på skalaen virker også.";
        else t = "pH " + K.phTekst(this.ph, 1) + ". " + K.modVand(this.ph);
        NK.saetHTML("lup-status", t);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        this.lup.opdater(dt);
        this.tjekMaal();
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 6);
        var m = this.maal();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);

        /* Skalaen og maerket */
        var overSkala = this.over && (this.over.slags === "skala" || this.over.slags === "maerke");
        Tg.skala(ctx, lay.skala, { px: lay.px, ord: "ender", lys: overSkala ? 0.5 : 0 });
        var vent = m && !this.naaet && this.nr <= 1 && Math.abs(this.ph - m.start.ph) < 0.04 && !this.traek;
        Tg.phMaerke(ctx, lay.skala, this.ph, { lys: overSkala || !!this.traek, puls: vent || this.pegMaerke ? puls : 0 });

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Glasset med vaesken i indikatorens farve */
        var gl = lay.glas;
        Tg.baegerglas(ctx, gl.cx, gl.bund, gl.b, FYLD, K.farveCss(this.ph, 0.78));
        var ov = Tg.baegerOverflade(gl.cx, gl.bund, gl.b, FYLD);
        var px = gl.cx + gl.b * 0.06, py = (ov + gl.bund) / 2;
        var L = lay.lup;
        Tg.zoomKegle(ctx, px, py, L.cx, L.cy, L.R);

        /* Luppen */
        this.lup.tegn(ctx, L.cx, L.cy, L.R, this.tid, { farve: K.farveCss(this.ph, 0.1), lys: this.pegLup ? puls : 0 });
        NK.tekst(ctx, "1 prik = 1 ion", L.cx, L.cy - L.R - 12, {
            font: Tg.font("700", NK.klamp(lay.px - 1, 12, 14)), justering: "center", farve: "#c8ced6", kant: true
        });

        /* Zoomknapperne */
        var z = this.z;
        var zp = this.pegZoom ? puls : 0;
        var tip = m && !this.naaet && m.maal.zMin !== undefined && Math.abs(this.ph - m.maal.ph) < 0.04;
        Tg.rundKnap(ctx, lay.ud.x, lay.ud.y, lay.ud.r, "−", {
            lys: this.over && this.over.slags === "ud", slukket: z >= K.ZOOM_MAKS,
            puls: zp || (tip && z < m.maal.zMin) || (this.nH() < 0.5 && this.nO() < 0.5) ? puls : 0
        });
        Tg.rundKnap(ctx, lay.ind.x, lay.ind.y, lay.ind.r, "+", {
            lys: this.over && this.over.slags === "ind", slukket: z <= K.ZOOM_MIN,
            puls: zp || (tip && m.maal.zMaks !== undefined && z > m.maal.zMaks) ? puls : 0
        });
        var zpx = NK.klamp(lay.px - 1, 12, 14);
        NK.tekst(ctx, "zoom ud", lay.ud.x, lay.ud.y + lay.ud.r + 4, { font: Tg.font("600", zpx), justering: "center", linje: "top", farve: "#a9b0ba" });
        NK.tekst(ctx, "zoom ind", lay.ind.x, lay.ind.y + lay.ind.r + 4, { font: Tg.font("600", zpx), justering: "center", linje: "top", farve: "#a9b0ba" });

        /* Taellingen under luppen */
        NK.Lup.taelling(ctx, L.cx, lay.tekstY, L.R, this.nH(), this.nO(), this.z, NK.klamp(lay.px - 1, 12, 14));

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ------------------------------------------------------------------------ */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        function i(k) { var dx = pt.x - k.x, dy = pt.y - k.y; return dx * dx + dy * dy <= (k.r + 4) * (k.r + 4); }
        if (i(lay.ud)) return { slags: "ud" };
        if (i(lay.ind)) return { slags: "ind" };
        var sk = lay.skala, mx = Tg.skalaX(sk, this.ph);
        if (Math.abs(pt.x - mx) <= 36 && pt.y >= sk.y - 52 && pt.y <= sk.y + sk.h + 8) return { slags: "maerke" };
        if (pt.x >= sk.x0 - 12 && pt.x <= sk.x1 + 12 && pt.y >= sk.y - 10 && pt.y <= lay.skalaBund + 4) return { slags: "skala" };
        var L = lay.lup, dx = pt.x - L.cx, dy = pt.y - L.cy;
        if (dx * dx + dy * dy <= L.R * L.R) return { slags: "lup" };
        var gl = lay.glas;
        if (Math.abs(pt.x - gl.cx) <= gl.b / 2 && pt.y <= gl.bund && pt.y >= gl.bund - gl.b * 1.2) return { slags: "glas" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            var u = mig.hvadErUnder(pt);
            if (!u || (u.slags !== "maerke" && u.slags !== "skala")) return;
            mig.traek = { start: pt };
            if (mig.afvisTilbud) mig.afvisTilbud();
            mig.saetPh(Tg.skalaPh(mig.lay.skala, pt.x));
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) {
                mig.saetPh(Tg.skalaPh(mig.lay.skala, pt.x));
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = s === "maerke" ? "grab" : (s ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () { mig.traek = null; });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) {
                var ph = Tg.skalaPh(mig.lay.skala, pt.x);
                mig.traek = null;
                /* Hele tal trækker også, naar man slipper */
                if (Math.abs(ph - Math.round(ph)) <= 0.12) ph = Math.round(ph);
                mig.saetPh(ph);
                mig.visStatus();
                return;
            }
            mig.klik(pt);
        });
        c.addEventListener("wheel", function (e) {
            var pt = mig.L.punkt(e), L = mig.lay && mig.lay.lup;
            if (!L) return;
            var dx = pt.x - L.cx, dy = pt.y - L.cy;
            if (dx * dx + dy * dy > L.R * L.R) return;
            e.preventDefault();
            var nu = Date.now();
            if (mig.sidsteHjul && nu - mig.sidsteHjul < 180) return;
            mig.sidsteHjul = nu;
            mig.zoom(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "ud") { this.zoom(1); return; }
        if (u.slags === "ind") { this.zoom(-1); return; }
        if (u.slags === "lup") {
            this.besked("Luppen viser et rum på " + K.sideTekst(this.z) + ". Zoom med + og −.", "");
            return;
        }
        if (u.slags === "glas") this.besked("Vand med et par dråber universalindikator. Farven følger pH.", "");
    };

    /* Tastaturet: pilene flytter pH, + og − zoomer */
    P.tast = function (e) {
        if (e.key === "ArrowLeft") { this.saetPh(this.ph - 0.1); return true; }
        if (e.key === "ArrowRight") { this.saetPh(this.ph + 0.1); return true; }
        if (e.key === "ArrowDown" || e.key === "PageDown") { this.saetPh(Math.ceil(this.ph - 1 - 1e-9)); return true; }
        if (e.key === "ArrowUp" || e.key === "PageUp") { this.saetPh(Math.floor(this.ph + 1 + 1e-9)); return true; }
        if (e.key === "+") { this.zoom(-1); return true; }
        if (e.key === "-" || e.key === "−") { this.zoom(1); return true; }
        return false;
    };

    P.enter = function () {
        if (this.naaet || !this.maal()) this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.2-intro-lup", tilbud: "lup-tilbud", spring: "lup-spring" });

    /* Mens han siger, at man traekker maerket og zoomer, lyser de */
    P.pegPaaFelt = function (til) { this.pegMaerke = til; this.pegZoom = til; };

    NK.SimLup = SimLup;
}());
