/* =====================================================================
   sim_lup.js - fane 2: luppen

   Et baegerglas med vand og universalindikator. Eleven traekker
   pH-maerket paa skalaen (eller klikker paa den, saa glider maerket
   derhen), og luppen viser H₃O⁺ og OH⁻ i et lille rum af vaesken:
   1 prik = 1 ion. Luppen zoomer selv (lup.js): bliver der over 100 af
   den ion, der er flest af, zoomer den ind paa et 10 gange mindre rum,
   og under ét trin fra 7 zoomer den ud igen.

   Fem maal (D.LUP_MAAL) i smaa bidder: pH 6 (10 gange i samme rum),
   pH 5 (det foerste zoom), pH 2 (tael zoomene), hvor mange gange
   (valg) og pH 12 (nu er det OH⁻). Et pH-maal er naaet, naar maerket
   er sluppet paa den rigtige pH, og luppen er faerdig med at zoome.
   Bagefter er der frit valg. Hvor langt eleven er naaet, huskes under
   NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc7.2-lup";
    var FYLD = 110;              /* mL i baegerglasset */
    var GLID = 5;                /* pH pr. sekund, naar maerket glider */

    function SimLup() {
        this.L = new NK.Laerred(NK.el("lup-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.glid = null;
        this.lup = new NK.Lup();
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.ph = 7;
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
        var R = NK.klamp(Math.min((hoej - 60) / 2, fri * 0.42), 60, 230);
        lay.lup = { cx: lay.glas.cx + gb / 2 + fri / 2, cy: top + R + 8, R: R };
        lay.tekstY = lay.lup.cy + R + NK.klamp(R * 0.08, 12, 18);
        lay.kop = { x: kant + 24, y: lay.bordY };
        this.lay = lay;

        this.saetAnker("lup-anker-skala", lay.skala.x0 - 4, lay.skala.y - 50, lay.skala.x1 - lay.skala.x0 + 8, lay.skalaBund - lay.skala.y + 56);
        var gl = lay.glas;
        this.saetAnker("lup-anker-glas", gl.cx - gb / 2, gl.bund - gb * 1.2, gb, gb * 1.2);
        this.saetAnker("lup-anker-lup", lay.lup.cx - R - 8, lay.lup.cy - R - 8, 2 * R + 16, 2 * R + 16);
        this.saetAnker("lup-anker-zoom", lay.lup.cx - R, lay.tekstY - 4, 2 * R, 2 * lay.px + 34);
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
    P.nH = function () { return this.lup.antal("h3o"); };
    P.nO = function () { return this.lup.antal("oh"); };

    P.opdaterLup = function () {
        this.lup.saet(K.h3o(this.ph), K.oh(this.ph));
        this.visMaaling();
        this.visStatus();
    };

    P.saetPh = function (ph) {
        ph = NK.klamp(Math.round(ph * 10) / 10, K.PH_MIN, K.PH_MAKS);
        /* Hele tal trækker lidt i mærket */
        if (Math.abs(ph - Math.round(ph)) <= 0.1 && this.traek && this.traek.flyttet) ph = Math.round(ph);
        if (ph === this.ph) return;
        this.ph = ph;
        this.opdaterLup();
    };

    /* Maerket glider hen til ph (et klik paa skalaen, Vis svaret) */
    P.glidTil = function (ph) {
        ph = NK.klamp(Math.round(ph * 10) / 10, K.PH_MIN, K.PH_MAKS);
        if (ph === this.ph) { this.glid = null; return; }
        this.glid = { til: ph, nu: this.ph };
    };

    /* ----- Maalene ---------------------------------------------------------------------- */
    P.maal = function () { return D.LUP_MAAL[this.nr] || null; };

    P.startMaal = function () {
        var m = this.maal();
        this.naaet = false;
        this.hjaelp = 0;
        this.valgNr = -1;
        this.glid = null;
        this.besked("", "");
        if (m) this.ph = m.start;
        this.lup.nulstil();
        this.lup.saet(K.h3o(this.ph), K.oh(this.ph));
        this.lup.straks();
        this.bygOpgave();
        this.visMaal();
        this.visMaaling();
        this.visStatus();
    };

    P.tjekMaal = function () {
        var m = this.maal();
        if (!m || this.naaet || m.slags === "valg") return;
        if (this.traek || this.glid || !this.lup.rolig()) return;
        if (Math.abs(this.ph - m.ph) < 0.04) this.maalNaaet();
    };

    P.maalNaaet = function () {
        var m = this.maal();
        var svar = this.hjaelp === 2;
        this.naaet = true;
        this.hjaelp = 0;
        this.besked((svar ? "<b>Svar:</b> " : "") + NK.html(m.efter), svar ? "gul" : "god");
        if (this.afvisTilbud) this.afvisTilbud();
        var gemt = NK.hent(NOEGLE, {}) || {};
        NK.gem(NOEGLE, { maal: Math.max(this.nr + 1, gemt.maal || 0) });
        if (this.nr >= D.LUP_MAAL.length - 1 && !this.rost) {
            this.rost = true;
            this.ventRos = 1.4;
        }
        this.bygOpgave();
        this.visMaal();
        this.visStatus();
    };

    /* Et valg i en valg-opgave */
    P.vaelg = function (i) {
        var m = this.maal();
        if (!m || m.slags !== "valg" || this.naaet) return;
        this.valgNr = i;
        if (this.afvisTilbud) this.afvisTilbud();
        if (i === m.rigtig) { this.maalNaaet(); return; }
        this.besked(NK.html(m.valg[i][1]) + " Vælg igen.", "skidt");
        this.bygOpgave();
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
                this.bygOpgave();
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
        if (this.hjaelp === 2) return;
        /* Vis svaret: valget saettes, eller maerket glider hen, og luppen zoomer */
        this.hjaelp = 2;
        if (m.slags === "valg") {
            this.valgNr = m.rigtig;
            this.maalNaaet();
            return;
        }
        this.traek = null;
        this.glidTil(m.ph);
        this.visMaal();
        this.tjekMaal();
    };

    P.nulstil = function () {
        var m = this.maal();
        if (m) this.startMaal();
        else { this.ph = 7; this.glid = null; this.lup.nulstil(); this.opdaterLup(); this.lup.straks(); }
    };

    /* ----- Panelet ------------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("lup-knap"),
            besked: NK.el("lup-besked"),
            kort: NK.el("lup-kort"),
            opgave: NK.el("lup-opgave")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("lup-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    /* Valgknapperne i valg-opgaven */
    P.bygOpgave = function () {
        var m = this.maal(), mig = this, v = this.el.opgave;
        v.innerHTML = "";
        if (!m || m.slags !== "valg") return;
        var rad = document.createElement("div");
        rad.className = "vaelgerrad";
        m.valg.forEach(function (x, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "vaelger";
            if (i === mig.valgNr) b.className += i === m.rigtig ? " rigtig" : " forkert";
            b.textContent = x[0];
            b.disabled = mig.naaet;
            b.addEventListener("click", function () { mig.vaelg(i); });
            rad.appendChild(b);
        });
        v.appendChild(rad);
    };

    P.visMaal = function () {
        var m = this.maal();
        NK.saetTekst("lup-nr", String(Math.min(this.nr + 1, D.LUP_MAAL.length)));
        NK.el("lup-taeller").hidden = !m;
        var tekst, klasse = "knap";
        if (!m) {
            NK.saetTekst("lup-titel", "Frit valg");
            NK.saetTekst("lup-prompt", "Træk pH-mærket, og se luppen zoome.");
            tekst = "Start målene forfra";
        } else {
            NK.saetTekst("lup-titel", "Mål");
            NK.saetTekst("lup-prompt", m.tekst);
            if (this.naaet) {
                tekst = this.nr >= D.LUP_MAAL.length - 1 ? "Videre til fortyndingen →" : "Næste mål →";
                klasse = "knap blaa banker";
            } else if (this.hjaelp === 2) tekst = "Viser svaret …";
            else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = !!m && !this.naaet && this.hjaelp === 2;
        this.el.kort.classList.toggle("sejr", this.naaet);
    };

    P.visMaaling = function () {
        var nH = this.nH(), nO = this.nO();
        NK.saetTekst("lup-ph", K.phTekst(this.ph, 1));
        NK.saetTekst("lup-nh", K.antalTekst(nH));
        NK.saetTekst("lup-no", K.antalTekst(nO));
        NK.saetTekst("lup-ch", NK.potens(K.h3o(this.ph), 2) + " M");
        NK.saetTekst("lup-co", NK.potens(K.oh(this.ph), 2) + " M");
        NK.saetTekst("lup-side", this.lup.z === null ? "" : K.sideTekst(this.lup.z));
        NK.saetTekst("lup-modvand", K.modVand(this.ph));
    };

    P.visStatus = function () {
        var m = this.maal(), zm = this.lup.zoomerMod(), t;
        if (zm < 0) t = "Over 100 at se. Luppen zoomer ind på et 10 gange mindre rum.";
        else if (zm > 0) t = "Højst 10 at se. Luppen zoomer ud til et 10 gange større rum.";
        else if (this.naaet && m) t = "Målet er nået. Tryk på knappen til højre for at gå videre.";
        else if (m && m.slags === "valg") t = "Vælg dit svar til højre. Du kan stadig trække pH-mærket.";
        else if (m && Math.abs(this.ph - m.start) < 0.04 && !this.glid) t = "Træk pH-mærket på skalaen. Et klik på skalaen virker også.";
        else t = "pH " + K.phTekst(this.ph, 1) + ". " + K.modVand(this.ph);
        NK.saetHTML("lup-status", t);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.glid) {
            var gl = this.glid, d = gl.til - gl.nu, skridt = GLID * dt;
            gl.nu = Math.abs(d) <= skridt ? gl.til : gl.nu + (d > 0 ? skridt : -skridt);
            this.saetPh(gl.nu);
            if (gl.nu === gl.til) this.glid = null;
        }
        this.lup.opdater(dt);
        /* Panelet og linjen foelger med, naar luppen zoomer */
        var lup = this.lup, noegle = lup.z + "|" + lup.zMaal + "|" + (lup.zoomT < 1) + "|" + !!this.glid;
        if (noegle !== this.sidsteNoegle) {
            this.sidsteNoegle = noegle;
            this.visMaaling();
            this.visStatus();
        }
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
        var vent = m && m.slags !== "valg" && !this.naaet && Math.abs(this.ph - m.start) < 0.04 && !this.traek && !this.glid;
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

        /* Taellingen under luppen */
        NK.Lup.taelling(ctx, L.cx, lay.tekstY, L.R, this.lup, NK.klamp(lay.px - 1, 12, 14), lay.W);

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ------------------------------------------------------------------------ */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
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
            if (mig.hjaelp === 2 && !mig.naaet) return;
            if (mig.afvisTilbud) mig.afvisTilbud();
            /* Paa maerket: traek det. Paa skalaen: maerket glider derhen,
               og traekkes der videre, foelger det musen. */
            mig.traek = { start: pt, flyttet: u.slags === "maerke" };
            if (u.slags === "maerke") mig.glid = null;
            else mig.glidTil(Tg.skalaPh(mig.lay.skala, pt.x));
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) {
                if (!mig.traek.flyttet && Math.abs(pt.x - mig.traek.start.x) > 4) { mig.traek.flyttet = true; mig.glid = null; }
                if (mig.traek.flyttet) mig.saetPh(Tg.skalaPh(mig.lay.skala, pt.x));
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
                var flyttet = mig.traek.flyttet;
                mig.traek = null;
                if (flyttet) {
                    /* Hele tal trækker også, naar man slipper */
                    var ph = Tg.skalaPh(mig.lay.skala, pt.x);
                    if (Math.abs(ph - Math.round(ph)) <= 0.12) ph = Math.round(ph);
                    mig.saetPh(ph);
                } else if (mig.glid && Math.abs(mig.glid.til - Math.round(mig.glid.til)) <= 0.12) {
                    mig.glid.til = Math.round(mig.glid.til);
                }
                mig.visStatus();
                return;
            }
            mig.klik(pt);
        });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "lup") {
            this.besked("Luppen viser et lille rum af væsken. Den zoomer selv, så der er 10 til 100 af den ion, der er flest af.", "");
            return;
        }
        if (u.slags === "glas") this.besked("Vand med et par dråber universalindikator. Farven følger pH.", "");
    };

    /* Tastaturet: pilene flytter pH */
    P.tast = function (e) {
        if (this.hjaelp === 2 && !this.naaet) return false;
        var fra = this.glid ? this.glid.til : this.ph;
        if (e.key === "ArrowLeft") { this.glid = null; this.saetPh(this.ph - 0.1); return true; }
        if (e.key === "ArrowRight") { this.glid = null; this.saetPh(this.ph + 0.1); return true; }
        if (e.key === "ArrowDown" || e.key === "PageDown") { this.glidTil(Math.ceil(fra - 1 - 1e-9)); return true; }
        if (e.key === "ArrowUp" || e.key === "PageUp") { this.glidTil(Math.floor(fra + 1 + 1e-9)); return true; }
        return false;
    };

    P.enter = function () {
        if (this.naaet || !this.maal()) this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.2-intro-lup", tilbud: "lup-tilbud", spring: "lup-spring" });

    /* Mens han siger, at man traekker maerket, og at luppen zoomer, lyser de */
    P.pegPaaFelt = function (til) { this.pegMaerke = til; this.pegLup = til; };

    NK.SimLup = SimLup;
}());
