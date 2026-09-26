/* =====================================================================
   sim_fortynd.js - fane 3: fortyndingen

   Skalaen hænger over et langt bord. Saltsyren (0,1 M, pH 1) staar ved
   pH 1 og natronluden (0,1 M, pH 13) ved pH 13. Knappen Fortynd 10
   gange laver et nyt glas: pipetten tager 1 mL fra det sidste glas i
   raekken, og sproejteflasken fylder op med 9 mL vand. Det nye glas
   staar under sin pH paa skalaen, saa hver fortynding er ét trin mod 7.
   Taet ved 7 stilles glassene bag hinanden: syren fra venstre, basen fra
   hoejre. Alle glas har et par draaber universalindikator.

   pH regnes med vandets egne ioner (NK.Kemi.syre og .base), saa syren
   aldrig bliver basisk. Luppen viser det valgte glas.

   Fem maal (D.FORTYND_MAAL): gaet pH efter én fortynding, naa pH 5, hvor
   mange gange, fortynd til basisk (det kan ikke lade sig goere) og
   natronluden 1.000 gange. Hvor langt eleven er naaet, huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc7.2-fortynd";
    var FYLD = 105;              /* mL i hvert glas, som tegnet */
    var DRAABE = 8;              /* den ene del fra glasset foer */
    var RAEKKER = 5;             /* glas bag hinanden ved pH 7 */
    var FASER = [                /* pipetten og sproejteflasken */
        ["suger", 0.35], ["flytter", 0.45], ["drypper", 0.25], ["vand", 0.6], ["faerdig", 0.2]
    ];
    var ZOOM = 9;

    function SimFortynd() {
        this.L = new NK.Laerred(NK.el("fortynd-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.lup = new NK.Lup();
        this.z = ZOOM;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.nr = NK.klamp(gemt.maal || 0, 0, D.FORTYND_MAAL.length);
        this.rost = this.nr >= D.FORTYND_MAAL.length;
        this.sagtBasisk = !!gemt.basisk;

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.toemBordet();
        this.startMaal();
    }

    var P = SimFortynd.prototype;

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.luft = NK.klamp(H * 0.1, 10, 70);
        lay.px = NK.klamp(W * 0.017, 12, 15);
        var bandH = NK.klamp(H * 0.05, 22, 36);
        var inde = NK.klamp(W * 0.06, 40, 64);
        lay.skala = { x0: kant + inde, x1: W - kant - inde, y: Math.round(lay.luft + 8), h: bandH };
        lay.skalaBund = lay.skala.y + bandH + 12 + lay.px;
        var foran = NK.klamp(H * 0.12, 44, 86);
        lay.bordY = Math.round(H - foran);
        var enhed = (lay.skala.x1 - lay.skala.x0) / 14;
        lay.gw = NK.klamp(Math.min(enhed * 0.86, (lay.bordY - lay.skalaBund) * 0.16), 26, 66);
        lay.gh = lay.gw * 1.2;
        lay.raekke = lay.gh * 0.62;
        lay.fb = lay.gw * 1.15;

        /* Knapperne foran paa bordet */
        var kh = NK.klamp(foran * 0.5, 30, 40), kb = NK.klamp(W * 0.24, 120, 220);
        var ky = lay.bordY + 12 + (foran - 12 - kh) / 2;
        lay.knapSyre = { x: kant + 6, y: ky, b: kb, h: kh };
        lay.knapBase = { x: W - kant - 6 - kb, y: ky, b: kb, h: kh };

        /* Luppen til venstre over syreglassene, skiltet til hoejre */
        var top = lay.skalaBund + 22;
        var bund = lay.bordY - lay.fb * 1.6 - 56;
        var R = NK.klamp(Math.min((bund - top) / 2, (Tg.skalaX(lay.skala, 5.8) - kant - 10) / 2), 44, 150);
        lay.lup = { cx: Math.max(kant + R + 14, Tg.skalaX(lay.skala, 5.8) - R - 6), cy: top + R, R: R };
        var kr = NK.klamp(R * 0.15, 15, 22);
        var a = Math.PI * 0.8;
        lay.ud = { x: lay.lup.cx + Math.cos(a) * (R + kr * 0.4), y: lay.lup.cy + Math.sin(a) * (R + kr * 0.4), r: kr };
        a = Math.PI * 0.2;
        lay.ind = { x: lay.lup.cx + Math.cos(a) * (R + kr * 0.4), y: lay.lup.cy + Math.sin(a) * (R + kr * 0.4), r: kr };
        lay.tekstY = lay.lup.cy + R + 12;
        var sx = Tg.skalaX(lay.skala, 8.3);
        lay.skilt = { x: sx, y: top, b: Math.min(lay.skala.x1 - sx, 300), h: 0 };
        lay.kop = { x: kant + 20, y: lay.bordY };
        this.lay = lay;
        this.placerAlle(true);

        this.saetAnker("fortynd-anker-skala", lay.skala.x0 - 4, lay.skala.y - 4, lay.skala.x1 - lay.skala.x0 + 8, lay.skalaBund - lay.skala.y + 8);
        this.saetAnker("fortynd-anker-flasker", lay.skala.x0, lay.bordY - lay.gh * 1.6, lay.skala.x1 - lay.skala.x0, lay.gh * 1.6 + 4);
        this.saetAnker("fortynd-anker-knapper", lay.knapSyre.x, lay.knapSyre.y - 4, lay.knapBase.x + kb - lay.knapSyre.x, kh + 8);
        this.saetAnker("fortynd-anker-lup", lay.lup.cx - R - 8, lay.lup.cy - R - 8, 2 * R + 16, 2 * R + 16 + 44);
        this.saetAnker("fortynd-anker-skilt", lay.skilt.x, lay.skilt.y, lay.skilt.b, 120);
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

    /* ----- Glassene --------------------------------------------------------------------
       Et glas er { serie, k, c, ph, x, bund, r, fyld, farvePh, ny }. k = 0 er flasken. */
    function glasAf(serie, k) {
        var c = D.START_C / Math.pow(10, k);
        var m = serie === "syre" ? K.syre(c) : K.base(c);
        return { serie: serie, k: k, c: c, ph: m.ph, h3o: m.h3o, oh: m.oh, r: 0, x: 0, bund: 0, fyld: FYLD, farvePh: m.ph };
    }

    P.toemBordet = function () {
        this.serier = { syre: [glasAf("syre", 0)], base: [glasAf("base", 0)] };
        this.anim = null;
        this.auto = null;
        this.valgt = this.serier.syre[0];
        this.lup.nulstil();
        this.placerAlle(true);
        this.opdaterLup(true);
    };

    P.sidste = function (serie) {
        var l = this.serier[serie];
        return l[l.length - 1];
    };

    P.antalFortyndinger = function (serie) { return this.serier[serie].length - 1; };

    /* Hvor glasset staar: under sin pH, og bag de andre, hvis der ikke er plads */
    P.placer = function (g) {
        var lay = this.lay;
        if (!lay) return;
        var x7 = Tg.skalaX(lay.skala, 7), x = Tg.skalaX(lay.skala, g.ph);
        if (g.k > 0) {
            if (g.serie === "syre") x = Math.min(x, x7 - lay.gw * 0.55);
            else x = Math.max(x, x7 + lay.gw * 0.55);
        }
        var andre = this.serier[g.serie].filter(function (a) { return a !== g && a.placeret && a.k < g.k; });
        var r = 0;
        while (r < RAEKKER - 1 && andre.some(function (a) { return a.r === r && Math.abs(a.x - x) < lay.gw * 0.95; })) r++;
        g.x = x;
        g.r = r;
        g.bund = lay.bordY - r * lay.raekke;
        g.skala = Math.pow(0.9, r);
        g.placeret = true;
    };

    P.placerAlle = function () {
        if (!this.lay) return;
        var mig = this;
        ["syre", "base"].forEach(function (s) {
            mig.serier[s].forEach(function (g) { g.placeret = false; });
            mig.serier[s].forEach(function (g) { mig.placer(g); });
        });
    };

    /* ----- Fortyndingen -------------------------------------------------------------------- */
    P.fortynd = function (serie, stille) {
        if (this.anim) {
            if (!stille) this.besked("Vent, til glasset er fyldt.", "gul");
            return false;
        }
        if (this.antalFortyndinger(serie) >= D.MAKS_GLAS) {
            if (!stille) this.besked("Der er ikke plads til flere glas i den række. Tryk R for at tømme bordet.", "gul");
            return false;
        }
        var fra = this.sidste(serie);
        var ny = glasAf(serie, fra.k + 1);
        ny.fyld = 0;
        ny.farvePh = fra.ph;
        this.serier[serie].push(ny);
        this.placer(ny);
        this.anim = { serie: serie, fra: fra, ny: ny, fase: 0, t: 0 };
        if (this.afvisTilbud) this.afvisTilbud();
        if (!stille) this.besked("", "");
        this.visStatus();
        return true;
    };

    P.animFase = function () { return this.anim ? FASER[this.anim.fase][0] : ""; };

    P.efterFortynding = function (ny) {
        ny.fyld = FYLD;
        ny.farvePh = ny.ph;
        this.anim = null;
        this.valgt = ny;
        this.opdaterLup();
        this.visGlas();
        this.tjekMaal();
        this.visStatus();
    };

    /* Pipettens spids og sproejteflaskens dyse, mens glasset fyldes */
    P.pipettePos = function () {
        var a = this.anim, lay = this.lay;
        if (!a) return null;
        var f = FASER[a.fase][0], t = a.t;
        var fra = a.fra, ny = a.ny;
        var over = function (g, dyb) {
            var b = g.k === 0 ? lay.fb * g.skala : lay.gw * g.skala;
            var ov = g.k === 0 ? g.bund - lay.fb * 0.85 : Tg.baegerOverflade(g.x, g.bund, b, g.fyld);
            return { x: g.x, y: ov + dyb };
        };
        var op = -lay.gh * 0.9;
        if (f === "suger") {
            var s0 = over(fra, op), s1 = over(fra, 6);
            return { x: s1.x, y: NK.lerp(s0.y, s1.y, NK.blod(t)), fyld: t };
        }
        if (f === "flytter") {
            var a0 = over(fra, 6), a1 = over(ny, op * 0.4);
            var u = NK.blod(t);
            return { x: NK.lerp(a0.x, a1.x, u), y: NK.lerp(a0.y, a1.y, u) - Math.sin(u * Math.PI) * lay.gh * 0.9, fyld: 1 };
        }
        if (f === "drypper") {
            var d = over(ny, op * 0.4);
            return { x: d.x, y: d.y, fyld: 1 - t };
        }
        return null;
    };

    /* ----- Luppen ------------------------------------------------------------------------ */
    P.opdaterLup = function (straks) {
        var g = this.valgt;
        if (!g) return;
        this.lup.saet(K.antal(g.h3o, this.z), K.antal(g.oh, this.z));
        if (straks) this.lup.straks();
        this.visGlas();
    };

    P.zoom = function (retning) {
        var z = this.z + retning;
        if (z < K.ZOOM_MIN || z > K.ZOOM_MAKS) {
            this.besked(retning > 0 ? "Længere ud kan luppen ikke zoome." : "Længere ind kan luppen ikke zoome.", "gul");
            return;
        }
        this.z = z;
        this.lup.zoom(retning);
        this.opdaterLup();
    };

    P.vaelgGlas = function (g) {
        if (this.valgt === g) return;
        this.valgt = g;
        this.opdaterLup();
    };

    /* ----- Maalene ---------------------------------------------------------------------- */
    P.maal = function () { return D.FORTYND_MAAL[this.nr] || null; };

    P.startMaal = function () {
        this.naaet = false;
        this.hjaelp = 0;
        this.valgNr = -1;
        this.brugtSvar = false;
        this.besked("", "");
        this.bygOpgave();
        this.visMaal();
        this.visStatus();
        /* Er det allerede gjort, er maalet naaet med det samme */
        this.tjekMaal();
    };

    P.tjekMaal = function () {
        var m = this.maal();
        if (!m || this.naaet) return;
        if (m.slags === "valg") {
            if (this.antalFortyndinger(m.serie) < m.k || this.valgNr < 0) return;
            if (this.valgNr === m.rigtig) this.maalNaaet();
            else {
                this.besked(NK.html(m.valg[this.valgNr][1]) + " Vælg igen.", "skidt");
                this.bygOpgave();
            }
            return;
        }
        if (m.slags === "glas" && this.antalFortyndinger(m.serie) >= m.k) this.maalNaaet();
        if (m.slags === "basisk" && this.antalFortyndinger(m.serie) >= D.MAKS_GLAS) this.maalNaaet();
    };

    P.maalNaaet = function () {
        var m = this.maal();
        this.naaet = true;
        this.hjaelp = 0;
        this.auto = null;
        this.besked(NK.html(m.efter), "god");
        if (this.afvisTilbud) this.afvisTilbud();
        var gemt = NK.hent(NOEGLE, {}) || {};
        gemt.maal = Math.max(this.nr + 1, gemt.maal || 0);
        if (m.slags === "basisk" && !this.sagtBasisk) {
            this.sagtBasisk = true;
            gemt.basisk = true;
            this.ventReplik = { t: 1.2, tekst: D.FORTYND_BASISK };
        }
        NK.gem(NOEGLE, gemt);
        if (this.nr >= D.FORTYND_MAAL.length - 1 && !this.rost) {
            this.rost = true;
            this.ventReplik = { t: 1.4, tekst: D.FORTYND_FAERDIG, ros: true };
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
        var set = this.antalFortyndinger(m.serie) >= m.k;
        if (!set) {
            this.besked("Dit bud: <b>" + NK.html(m.valg[i][0]) + "</b>. Tryk på Fortynd 10 gange under " +
                (m.serie === "syre" ? "saltsyren" : "natronluden") + " for at se det.", "");
        } else if (i !== m.rigtig) {
            this.besked(NK.html(m.valg[i][1]) + " Vælg igen.", "skidt");
        }
        this.bygOpgave();
        this.tjekMaal();
        this.visStatus();
    };

    /* Det, eleven skriver i tal-opgaven */
    function tolkTal(raa) {
        var s = String(raa || "").trim().replace(/gange/gi, "").trim();
        if (!s) return null;
        /* Haevet skrift efter 10: 10⁴ -> 10^4 */
        s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, function (x) { return "^" + NK.ascii(x); });
        s = s.replace(/[·×x*]/g, "*").replace(/\s+/g, "");
        var m = s.match(/^(?:(\d+(?:[.,]\d+)?)\*)?10\^(\d+)$/);
        if (m) return (m[1] ? parseFloat(m[1].replace(",", ".")) : 1) * Math.pow(10, parseInt(m[2], 10));
        m = s.match(/^(\d+(?:[.,]\d+)?)e(\d+)$/i);
        if (m) return parseFloat(m[1].replace(",", ".")) * Math.pow(10, parseInt(m[2], 10));
        if (/^\d{1,3}(\.\d{3})+$/.test(s)) return parseInt(s.replace(/\./g, ""), 10);
        if (/^\d+(,\d+)?$/.test(s)) return parseFloat(s.replace(",", "."));
        return NaN;
    }
    SimFortynd.tolkTal = tolkTal;

    /* Tjek et tal: { ok, tom, besked } */
    SimFortynd.tjekTal = function (raa, m) {
        var v = tolkTal(raa);
        if (v === null) return { tom: true, besked: "Skriv et tal." };
        if (isNaN(v)) return { ok: false, besked: "Skriv et tal, fx 500 eller 10^3." };
        if (Math.abs(v - m.svar) < 1e-6 * m.svar) return { ok: true };
        for (var i = 0; i < m.fejl.length; i++) {
            if (Math.abs(v - m.fejl[i][0]) < 1e-9) return { ok: false, besked: m.fejl[i][1] };
        }
        return { ok: false, besked: "Hver fortynding er 10 gange. Gang dem sammen." };
    };

    P.tjekFelt = function () {
        var m = this.maal();
        if (!m || m.slags !== "tal" || this.naaet || !this.input) return;
        var r = SimFortynd.tjekTal(this.input.value, m);
        if (r.tom) { this.besked(r.besked, ""); this.fokus(); return; }
        if (r.ok) { this.maalNaaet(); return; }
        this.besked(NK.html(r.besked), "skidt");
        var fe = this.feltEl;
        if (fe) { fe.classList.remove("ryst"); void fe.offsetWidth; fe.classList.add("ryst"); }
        this.fokus();
    };

    P.knap = function () {
        var m = this.maal();
        if (!m) {
            this.nr = 0;
            this.toemBordet();
            this.startMaal();
            return;
        }
        if (this.naaet) {
            this.nr++;
            this.startMaal();
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(m.hint), "gul");
            this.visMaal();
            return;
        }
        /* Vis svaret */
        this.brugtSvar = true;
        if (m.slags === "tal") {
            this.maalNaaet();
            this.besked("<b>Svar:</b> " + NK.html(m.efter), "gul");
            return;
        }
        if (m.slags === "valg") this.valgNr = m.rigtig;
        var til = m.slags === "basisk" ? D.MAKS_GLAS : m.k;
        if (this.antalFortyndinger(m.serie) >= til) { this.tjekMaal(); return; }
        this.auto = { serie: m.serie, til: til };
        this.hjaelp = 2;
        this.bygOpgave();
        this.visMaal();
    };

    P.nulstil = function () {
        this.toemBordet();
        this.besked("", "");
        this.visStatus();
    };

    /* ----- Panelet ------------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("fortynd-knap"),
            besked: NK.el("fortynd-besked"),
            kort: NK.el("fortynd-kort"),
            opgave: NK.el("fortynd-opgave")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("fortynd-nulstil").addEventListener("click", function () { mig.nulstil(); });
        NK.el("fortynd-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    /* Valgknapperne eller feltet til tallet */
    P.bygOpgave = function () {
        var m = this.maal(), mig = this, v = this.el.opgave;
        v.innerHTML = "";
        this.input = null;
        this.feltEl = null;
        if (!m) return;
        if (m.slags === "valg") {
            var rad = document.createElement("div");
            rad.className = "vaelgerrad";
            m.valg.forEach(function (x, i) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "vaelger";
                if (i === mig.valgNr) {
                    var vist = mig.antalFortyndinger(m.serie) >= m.k;
                    b.className += vist ? (i === m.rigtig ? " rigtig" : " forkert") : " valgt";
                }
                b.textContent = x[0];
                b.disabled = mig.naaet;
                b.addEventListener("click", function () { mig.vaelg(i); });
                rad.appendChild(b);
            });
            v.appendChild(rad);
        } else if (m.slags === "tal") {
            var fe = document.createElement("div");
            if (this.naaet) {
                fe.className = "felt " + (this.brugtSvar ? "svar" : "ok");
                fe.innerHTML = '<span class="felt-svar"><b>' + K.tusind(m.svar) + '</b> gange</span><span class="felt-maerke">' + (this.brugtSvar ? "↩" : "✓") + "</span>";
            } else {
                fe.className = "felt aktiv";
                fe.innerHTML = '<input type="text" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="Antal gange">' +
                    '<span class="felt-efter">gange</span><button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1">↵</button>';
                var inp = fe.querySelector("input");
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjekFelt(); }
                });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjekFelt(); });
                this.input = inp;
            }
            this.feltEl = fe;
            v.appendChild(fe);
        }
    };

    P.fokus = function () {
        if (this.input && NK.el("fane-fortynd").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { this.input.focus({ preventScroll: true }); } catch (e) { this.input.focus(); }
        }
    };

    P.visMaal = function () {
        var m = this.maal();
        NK.saetTekst("fortynd-nr", String(Math.min(this.nr + 1, D.FORTYND_MAAL.length)));
        NK.el("fortynd-taeller").hidden = !m;
        var tekst, klasse = "knap";
        if (!m) {
            NK.saetTekst("fortynd-titel", "Frit valg");
            NK.saetTekst("fortynd-prompt", "Fortynd saltsyren og natronluden, og klik på et glas for at se det i luppen.");
            tekst = "Start målene forfra";
        } else {
            NK.saetTekst("fortynd-titel", "Mål");
            NK.saetTekst("fortynd-prompt", m.tekst);
            if (this.naaet) {
                tekst = this.nr >= D.FORTYND_MAAL.length - 1 ? "Til frit valg →" : "Næste mål →";
                klasse = "knap blaa banker";
            } else if (this.hjaelp === 0) tekst = "Giv hint";
            else if (this.hjaelp === 1) tekst = "Vis svaret";
            else tekst = "Fortynder …";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = !!m && this.hjaelp === 2 && !this.naaet;
        this.el.kort.classList.toggle("sejr", this.naaet);
    };

    P.visGlas = function () {
        var g = this.valgt;
        if (!g) return;
        var navn = g.serie === "syre" ? "Saltsyre" : "Natronlud";
        NK.saetTekst("fortynd-glasnavn", g.k === 0 ? navn + ", 0,1 M" : navn + " fortyndet " + K.tusind(Math.pow(10, g.k)) + " gange");
        NK.saetTekst("fortynd-ph", K.phTekst(g.ph, 2));
        var s = K.surhed(g.ph, 2);
        NK.saetTekst("fortynd-surhed", s.charAt(0).toUpperCase() + s.slice(1));
        NK.saetTekst("fortynd-nh", K.antalTekst(K.antal(g.h3o, this.z)));
        NK.saetTekst("fortynd-no", K.antalTekst(K.antal(g.oh, this.z)));
        NK.saetTekst("fortynd-ch", NK.potens(g.h3o, 2) + " M");
    };

    P.visStatus = function () {
        var m = this.maal(), t;
        var g = this.valgt;
        var serieNavn = m && m.serie === "base" ? "natronluden" : "saltsyren";
        if (this.anim) t = "Pipetten tager 1 mL fra glasset før, og sprøjteflasken fylder op med 9 mL vand.";
        else if (m && this.naaet) t = "Målet er nået. Tryk på knappen til højre for at gå videre.";
        else if (m && m.slags === "valg" && this.valgNr < 0) t = "Vælg dit bud til højre. Tryk så på <b>Fortynd 10 gange</b> under " + serieNavn + ".";
        else if (m && m.slags === "tal") t = "Skriv tallet til højre. Glassene står på bordet.";
        else if (m && m.slags === "basisk" && g && g.serie === "syre" && g.k >= 5) {
            t = "pH " + K.phTekst(g.ph, 2) + ". " + (K.surhed(g.ph, 2) === "sur" ? "Stadig sur. Fortynd igen." : "Neutral, men ikke basisk. Fortynd igen.");
        } else if (m && m.serie) {
            var n = this.antalFortyndinger(m.serie), k = m.slags === "basisk" ? 0 : m.k;
            t = "Tryk på <b>Fortynd 10 gange</b> under " + serieNavn + "." + (k > 1 && n > 0 && n < k ? " " + n + " af " + k + " gange." : "");
        }
        else t = "Klik på et glas for at se det i luppen.";
        NK.saetHTML("fortynd-status", t);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        this.lup.opdater(dt);
        var a = this.anim;
        if (a) {
            a.t += dt / FASER[a.fase][1];
            var f = FASER[a.fase][0];
            if (f === "drypper") { a.ny.fyld = DRAABE * Math.min(1, a.t); }
            if (f === "vand") {
                var u = Math.min(1, a.t);
                a.ny.fyld = NK.lerp(DRAABE, FYLD, u);
                a.ny.farvePh = NK.lerp(a.fra.ph, a.ny.ph, NK.blod(u));
            }
            if (a.t >= 1) {
                a.t = 0;
                a.fase++;
                if (a.fase >= FASER.length) this.efterFortynding(a.ny);
            }
        } else if (this.auto) {
            if (this.antalFortyndinger(this.auto.serie) < this.auto.til) this.fortynd(this.auto.serie, true);
            else { this.auto = null; this.tjekMaal(); }
        }
        if (this.ventReplik) {
            this.ventReplik.t -= dt;
            if (this.ventReplik.t <= 0) {
                var r = this.ventReplik;
                this.ventReplik = null;
                if (this.laererReplik) this.laererReplik(r.tekst, r.ros);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegnGlas = function (ctx, g, lys) {
        var lay = this.lay, r, b;
        if (g.r > 0 && g.placeret) {
            /* Glassene bagved staar paa en klods, saa man kan se dem */
            var kb = lay.gw * g.skala * 1.08;
            ctx.save();
            ctx.fillStyle = "#343944";
            ctx.fillRect(g.x - kb / 2, g.bund, kb, lay.bordY - g.bund + 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
            ctx.fillRect(g.x - kb / 2, g.bund, kb, 2);
            ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
            ctx.lineWidth = 1;
            ctx.strokeRect(g.x - kb / 2 + 0.5, g.bund + 0.5, kb - 1, lay.bordY - g.bund + 1);
            ctx.restore();
        }
        if (g.k === 0) {
            /* Flasken: formlen og koncentrationen paa etiketten */
            var fpx = NK.klamp(lay.fb * 0.24, 11, 16);
            b = lay.fb;
            r = Tg.flaske(ctx, g.x, g.bund, b, [
                { t: g.serie === "syre" ? "HCl" : "NaOH", px: fpx, vaegt: "800" },
                { t: "0,1 M", px: fpx * 0.85, vaegt: "700", farve: "#5a6270" }
            ], null, { lys: lys });
        } else {
            b = lay.gw * g.skala;
            var farve = g.fyld > 0 ? K.farveCss(g.farvePh, 0.8) : null;
            r = Tg.baegerglas(ctx, g.x, g.bund, b, g.fyld, farve, { lys: lys });
        }
        if (g.fyld >= FYLD - 0.5) {
            /* Maerkaten med pH paa glasset */
            var px = NK.klamp(b * 0.26, 11, 14);
            ctx.save();
            ctx.font = Tg.font("800", px);
            var t = K.phTekst(g.ph, 2), tb = ctx.measureText(t).width + 8;
            var my = r.y + r.h * 0.34;
            ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
            NK.rundtRekt(ctx, g.x - tb / 2, my - px * 0.7, tb, px * 1.4, 3);
            ctx.fill();
            ctx.fillStyle = "#1c1f26";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(t, g.x, my + 0.5);
            ctx.restore();
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this;
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 6);
        var m = this.maal();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);
        Tg.skala(ctx, lay.skala, { px: lay.px, ord: true, lys: this.pegSkala ? puls : 0 });

        /* Streger fra glassene op til deres pH paa skalaen */
        var alle = this.serier.syre.concat(this.serier.base);
        alle.forEach(function (g) {
            if (!g.placeret || g.fyld < FYLD - 0.5) return;
            var sx = Tg.skalaX(lay.skala, g.ph);
            var top = g.bund - (g.k === 0 ? lay.fb * 1.45 : lay.gh * g.skala);
            ctx.save();
            ctx.strokeStyle = K.farveCss(g.ph, mig.valgt === g ? 0.8 : 0.35);
            ctx.lineWidth = mig.valgt === g ? 2 : 1.2;
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.moveTo(g.x, top - 2);
            ctx.lineTo(sx, lay.skalaBund + 2);
            ctx.stroke();
            ctx.restore();
        });

        /* Skiltet med opskriften */
        this.tegnSkilt(ctx);

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Glassene: bagerste raekke foerst */
        alle.slice().sort(function (a, b) { return b.r - a.r; }).forEach(function (g) {
            var lys = mig.valgt === g ? 0.9 : (mig.over && mig.over.slags === "glas" && mig.over.g === g ? 0.6 : 0);
            mig.tegnGlas(ctx, g, lys);
        });

        /* Pipetten og sproejteflasken */
        var a = this.anim;
        if (a) {
            var pp = this.pipettePos();
            var farve = K.farveCss(a.fra.ph, 0.85);
            if (a.fra.k === 0) farve = "rgba(214, 234, 248, 0.6)";
            if (pp) Tg.pipette(ctx, pp.x, pp.y, lay.gh * 1.25, pp.fyld, farve);
            var f = FASER[a.fase][0];
            if (f === "vand" || f === "faerdig") {
                var b = lay.gw * a.ny.skala;
                var top = a.ny.bund - lay.gh * a.ny.skala;
                var dx = a.ny.x + b * 0.1, dy = top - lay.gh * 0.55;
                var alfa = f === "faerdig" ? 1 - a.t : 1;
                ctx.save();
                ctx.globalAlpha = alfa;
                if (f === "vand") {
                    ctx.strokeStyle = "rgba(159, 208, 242, 0.85)";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(dx, dy);
                    ctx.quadraticCurveTo(dx + 2, dy + lay.gh * 0.3, a.ny.x + b * 0.12, Tg.baegerOverflade(a.ny.x, a.ny.bund, b, a.ny.fyld));
                    ctx.stroke();
                }
                Tg.sproejteflaske(ctx, dx, dy, lay.gh * 1.1);
                ctx.restore();
            }
        }

        /* Luppen og keglen fra det valgte glas */
        var L = lay.lup, g = this.valgt;
        if (g && g.placeret && g.fyld > 0) {
            var gy = g.k === 0 ? g.bund - lay.fb * 0.5 : (Tg.baegerOverflade(g.x, g.bund, lay.gw * g.skala, g.fyld) + g.bund) / 2;
            Tg.zoomKegle(ctx, g.x, gy, L.cx, L.cy, L.R);
        }
        this.lup.tegn(ctx, L.cx, L.cy, L.R, this.tid, { farve: g ? K.farveCss(g.farvePh, 0.1) : null, lys: this.pegLup ? puls : 0 });
        var z = this.z;
        Tg.rundKnap(ctx, lay.ud.x, lay.ud.y, lay.ud.r, "−", { lys: this.over && this.over.slags === "ud", slukket: z >= K.ZOOM_MAKS });
        Tg.rundKnap(ctx, lay.ind.x, lay.ind.y, lay.ind.r, "+", { lys: this.over && this.over.slags === "ind", slukket: z <= K.ZOOM_MIN });
        NK.tekst(ctx, "1 prik = 1 ion", L.cx, L.cy - L.R - 10, { font: Tg.font("700", NK.klamp(lay.px - 1, 12, 14)), justering: "center", farve: "#c8ced6", kant: true });
        if (g) NK.Lup.taelling(ctx, L.cx, lay.tekstY, L.R, K.antal(g.h3o, z), K.antal(g.oh, z), z, NK.klamp(lay.px - 1, 12, 14));

        /* Knapperne */
        var ventSyre = m && !this.naaet && m.serie === "syre" && !(m.slags === "valg" && this.valgNr < 0);
        var ventBase = m && !this.naaet && m.serie === "base" && !(m.slags === "valg" && this.valgNr < 0);
        Tg.knap(ctx, lay.knapSyre, "Fortynd 10 gange ▸", {
            lys: this.over && this.over.slags === "knapSyre", slukket: this.antalFortyndinger("syre") >= D.MAKS_GLAS,
            puls: (ventSyre && !this.anim) || this.pegKnapper ? puls : 0
        });
        Tg.knap(ctx, lay.knapBase, "◂ Fortynd 10 gange", {
            lys: this.over && this.over.slags === "knapBase", slukket: this.antalFortyndinger("base") >= D.MAKS_GLAS,
            puls: (ventBase && !this.anim) || this.pegKnapper ? puls : 0
        });

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* Skiltet: hvad der sker ved hver fortynding */
    P.tegnSkilt = function (ctx) {
        var lay = this.lay, s = lay.skilt;
        var px = NK.klamp(s.b * 0.055, 12, 15);
        var linjer = [
            ["HVERT NYT GLAS", "700", "#8a7f66", px * 0.85],
            ["1 mL fra glasset før", "700", "#2b2b2b", px],
            ["+ 9 mL vand", "700", "#2a76ac", px],
            ["= 10 gange fortyndet", "800", "#2b2b2b", px],
            ["Alle glas har universalindikator.", "600", "#6b6b6b", px * 0.85]
        ];
        var h = 18;
        linjer.forEach(function (l) { h += l[3] * 1.45; });
        s.h = h;
        if (s.b < 120 || s.y + h > lay.bordY - lay.gh * 1.2 - 8) return;
        Tg.skilt(ctx, s.x, s.y, s.b, h, { lys: this.over && this.over.slags === "skilt" ? 0.5 : 0 });
        var y = s.y + 14;
        linjer.forEach(function (l) {
            NK.tekst(ctx, l[0], s.x + 14, y, { font: Tg.font(l[1], l[3]), linje: "top", farve: l[2] });
            y += l[3] * 1.45;
        });
    };

    /* ----- Musen ------------------------------------------------------------------------ */
    P.overKnap = function (pt, r) {
        return pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 26 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        if (this.overKnap(pt, lay.knapSyre)) return { slags: "knapSyre" };
        if (this.overKnap(pt, lay.knapBase)) return { slags: "knapBase" };
        function i(k) { var dx = pt.x - k.x, dy = pt.y - k.y; return dx * dx + dy * dy <= (k.r + 4) * (k.r + 4); }
        if (i(lay.ud)) return { slags: "ud" };
        if (i(lay.ind)) return { slags: "ind" };
        /* Glassene: forreste raekke foerst */
        var alle = this.serier.syre.concat(this.serier.base).filter(function (g) { return g.placeret; });
        alle.sort(function (a, b) { return a.r - b.r; });
        for (var j = 0; j < alle.length; j++) {
            var g = alle[j];
            var b = g.k === 0 ? lay.fb : lay.gw * g.skala, h = g.k === 0 ? lay.fb * 1.55 : lay.gh * g.skala;
            if (Math.abs(pt.x - g.x) <= b / 2 && pt.y <= g.bund + 2 && pt.y >= g.bund - h) return { slags: "glas", g: g };
        }
        var L = lay.lup, dx = pt.x - L.cx, dy = pt.y - L.cy;
        if (dx * dx + dy * dy <= L.R * L.R) return { slags: "lup" };
        var s = lay.skilt;
        if (s.h && pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h) return { slags: "skilt" };
        var sk = lay.skala;
        if (pt.x >= sk.x0 && pt.x <= sk.x1 && pt.y >= sk.y && pt.y <= lay.skalaBund) return { slags: "skala" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            mig.over = mig.hvadErUnder(pt);
            c.style.cursor = mig.over && mig.over.slags !== "skala" ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("pointerup", function (e) { mig.klik(mig.L.punkt(e)); });
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
        if (u.slags === "knapSyre") { this.fortynd("syre"); return; }
        if (u.slags === "knapBase") { this.fortynd("base"); return; }
        if (u.slags === "ud") { this.zoom(1); return; }
        if (u.slags === "ind") { this.zoom(-1); return; }
        if (u.slags === "glas") { this.vaelgGlas(u.g); return; }
        if (u.slags === "lup") { this.besked("Luppen viser det glas, du har klikket på. Zoom med + og −.", ""); return; }
        if (u.slags === "skilt") { this.besked("1 del fra glasset før og 9 dele vand: 10 gange så meget væske og 10 gange lavere koncentration.", ""); return; }
        if (u.slags === "skala") this.besked("Hvert glas står under sin pH. Stregen viser hvor.", "");
    };

    P.tast = function (e) {
        if (e.key === "+") { this.zoom(-1); return true; }
        if (e.key === "-" || e.key === "−") { this.zoom(1); return true; }
        if (e.key === "f" || e.key === "F") {
            var m = this.maal();
            this.fortynd(m && m.serie === "base" ? "base" : "syre");
            return true;
        }
        return false;
    };

    P.enter = function () {
        var m = this.maal();
        if (this.naaet || !m) { this.knap(); return; }
        if (m.slags === "tal") { this.tjekFelt(); return; }
        if (m.serie) this.fortynd(m.serie);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.2-intro-fortynd", tilbud: "fortynd-tilbud", spring: "fortynd-spring" });

    /* Mens han siger, hvor man trykker, lyser knapperne */
    P.pegPaaFelt = function (til) { this.pegKnapper = til; };

    NK.SimFortynd = SimFortynd;
}());
