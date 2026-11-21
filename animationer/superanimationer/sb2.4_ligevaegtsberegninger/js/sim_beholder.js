/* =====================================================================
   sim_beholder.js - fane 1: Beholderen (runde 2, 21. nov. 2026)

   Niels efter runde 1: "Selve animationen er lidt grim.. Det er
   forvirrende med alle de farver.. Der er så lidt plads i beholderen ...
   Grafen har fået lov til at få den centrale plads ... og skyderen sidder
   lidt akavet adskilt fra grafen." Og: "ved beregningen skal der kun komme
   en række eller endda felt ad gangen... Måske skal x lige defineres lidt
   tydeligere inden man bliver kastet ud i det."

   Scenen:
     * Beholderen er hovedfiguren til venstre. Hvert stof har sin egen
       daempede farve (D.FARVE), og molekylerne er enkle former i én farve
       med en blød skygge. Under beholderen staar antallet af hvert stof i
       stoffets farve og "1 molekyle = 0,01 M".
     * Maal 1: grafen (Y som funktion af x) staar til hoejre, og skyderen
       ligger under beholder og graf som én raekke. Skyderens skala flugter
       med grafens x-akse, saa den laeses som grafens x-akse.
     * Fra maal 2 er grafen foldet ind ("Vis grafen ▸"), skyderen sidder
       direkte under beholderen, og tavlen (et lyst papir med skemaet og
       linjerne) staar til hoejre. Skemaet fyldes ét felt ad gangen.
     * Boksen med Y og K staar over grafen eller tavlen paa de maal, der
       bruger den (yBoks).
     * Reaktionsskemaet staar med stort paa kortets foerste linje (fane.js).

   Hvert maal er en raekke trin (D.MAAL[i].trin): valg (et spoergsmaal med
   tre svar paa kortet), handling (kortet beder om noget med skyderen og gaar
   selv videre 1 s efter, at det er gjort) og ligevaegt (find x, hvor Y = K,
   og tryk Indsend svar). Scenen er laast, og intet ser klikbart ud, mens
   kortet stiller et spoergsmaal (REGELSAET 15 og 19a).

   Runde 3 (Niels 21. nov. 2026): beholderen er lidt mindre og har et
   rigtigt laag. Reaktionsskemaet staar centreret over kortet (#bh-rx).
   Svaret staar ikke i scenen, foer eleven har svaret ("Y = ?", regel 38).
   Lampen Y = K bliver groen af sig selv, naar x staar stille paa ligevaegten
   i 0,7 s, og et traek-maal er saa loest (regel 39). Skemaet har enheder
   (regel 40), og udtrykket med x saettes lig med K (regel 41). Ved et nyt
   reaktionsskema fyldes beholderen roligt (regel 42).

   Molekylerne er tal: ét molekyle er rx.enhed M, og antallet, der er
   omsat, er x / enhed rundet af. Alt andet regnes af js/model.js.
   Paaskeaegget: et klik paa laaget aabner beholderen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var H = NK.RegnHjaelp;

    var SKRIFT = "'Lexend', 'Segoe UI', sans-serif";
    var KNAP_R = 10;          /* skyderens knap: radius i px (css/stil.css) */
    var VENT = 0.7;           /* et maal i scenen giver selv groent efter 0,7 s (REGELSAET 33, 39) */

    function el(tag, klasse, html) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (html !== undefined) e.innerHTML = html;
        return e;
    }

    /* Tal med tre decimaler som paa skyderen: 0,078, −0,078 */
    function t3(v) {
        if (Math.abs(v) < 0.0005) return "0,000";
        return (v < 0 ? "−" : "") + Math.abs(v).toFixed(3).replace(".", ",");
    }

    /* Farven lysere (f > 0) eller moerkere (f < 0) */
    function nuance(hex, f) {
        var r, g, b, m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(hex);
        if (m) { r = +m[1]; g = +m[2]; b = +m[3]; }
        else { var n = parseInt(hex.slice(1), 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; }
        var maal = f > 0 ? 255 : 0, a = Math.abs(f);
        r = Math.round(r + (maal - r) * a); g = Math.round(g + (maal - g) * a); b = Math.round(b + (maal - b) * a);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    function farve(s) { return (D.FARVE && D.FARVE[s]) || "#a9b4c2"; }

    function SimBeholder() {
        var mig = this;
        this.laerred = new NK.Laerred(NK.el("bh-laerred"));
        this.skyder = NK.el("bh-x");
        this.mol = [];
        this.laag = null;
        this.traek = false;
        this.grafUd = false;
        this.venter = 0;
        this.startFane(D.MAAL, D.GRUPPER_BH);

        this.skyder.addEventListener("input", function () { mig.saetX(parseFloat(mig.skyder.value)); });
        this.skyder.addEventListener("change", function () { mig.slutTraek(); });
        var c = this.laerred.canvas;
        c.addEventListener("pointerdown", function (e) { mig.ned(e); });
        c.addEventListener("pointermove", function (e) { mig.flyt(e); });
        c.addEventListener("pointerup", function (e) { mig.op(e); });
        c.addEventListener("pointercancel", function (e) { mig.op(e); });
        NK.el("bh-graffane").addEventListener("click", function () { mig.foldGraf(); });
        window.addEventListener("resize", function () { if (NK.el("fane-bh").classList.contains("aktiv")) mig.tilpas(); });

        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimBeholder.prototype;
    NK.Fane.paa(P, { navn: "bh", chip: "Mål", naesteFane: "fane-ux", naesteNavn: "Ved ligevægt", videreTekst: "Næste mål →" });

    P.maal = function () { return this.opgaver[this.nr]; };

    /* ----- Maalet ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var m = this.opgaver[i];
        var rx = D.RX[m.rx];
        var nyRx = this.rx !== rx;
        this.rx = rx;
        this.g = M.xGraenser(rx);
        this.xMax = this.g.hoej;
        this.xEq = M.xFacit(rx);
        this.roert = false;
        this.venter = 0;
        this.naaet = false;
        this.skjulMaerke();
        this.tValgt = null;
        this.tForkert = {};
        this.efterFase = false;
        /* Trinene vises fra start paa maal 1 foerste gang (eller efter Start
           forfra). Er maal 1 naaet foer, er alt fremme, og kortet staar paa
           selve maalet. De andre maal er trinene selv. */
        this.frisk = !!m.graf && (this.tvingTrin || !this.status[i].loest);
        this.trinNr = (m.graf && !this.frisk) ? m.trin.length - 1 : 0;
        this.tvingTrin = false;
        this.skyder.max = String(this.xMax);
        this.saetX(0, true);
        if (nyRx || !this.mol.length) this.nyeMolekyler();
        NK.saetHTML("bh-xdef", NK.html("koncentrationen af " + M.skriv(rx.xStof) + ", der er " + rx.xOrd));
        this.lampe = false;
        this.visRx(nyRx);
        this.bygY();
        this.bygTavle();
        this.opdaterTal();
        this.visDele();
        this.tilpas();
    };

    /* Reaktionsskemaet med stort, centreret over kortet (runde 3). Skifter
       reaktionen, toner det nye skema roligt frem (regel 42). */
    P.visRx = function (ny) {
        var rx = this.rx, e = NK.el("bh-rx");
        e.innerHTML = '<span class="rx-skema">' + NK.html(M.skemaTekst(rx)).replace(/\((g|l|s|aq)\)/g, '<span class="rx-ti">($1)</span>') +
            '</span><span class="rx-k">' + NK.html("K = " + M.kTekst(rx) + " ved " + rx.T) + "</span>";
        if (ny) { e.classList.remove("ny"); void e.offsetWidth; e.classList.add("ny"); }
    };

    /* Ligevaegt: Y er lig med K inden for 4 %, eller x er saa taet paa
       ligevaegten, som skyderen kan komme (et trin er 0,001 M) */
    P.erLigevaegt = function (x) {
        var Y = M.Y(this.rx, x), K = this.rx.K;
        return Math.abs(x - this.xEq) <= 0.0006 || (isFinite(Y) && Math.abs(Y - K) <= 0.04 * K);
    };

    /* ----- Trinene ------------------------------------------------------------------ */
    P.trin = function () {
        var m = this.maal(), t = m.trin[this.trinNr];
        if (!t) return null;
        return t.efter && this.efterFase ? t.efter : t;
    };

    /* Det trin, kortet stiller et spoergsmaal i (valg) */
    P.trinNu = function () {
        var t = this.trin();
        return !this.faerdig && t && t.type === "valg" ? t : null;
    };

    P.sidsteTrin = function () {
        var m = this.maal(), t = m.trin[this.trinNr];
        return this.trinNr === m.trin.length - 1 && (!t.efter || this.efterFase);
    };

    /* Scenen er laast, mens kortet stiller et spoergsmaal eller staar paa
       forklaringen til et trin (REGELSAET 15 og 19a) */
    P.laastScene = function () { return !!this.trinNu() || !!this.trinBliv; };

    /* Det, der er fremme i scenen. Paa maal 1 kommer det frem trin for trin. */
    P.fremme = function () {
        var m = this.maal(), v = { y: !!m.yBoks, yv: !!m.yBoks, graf: !!m.graf || this.grafUd, skyder: true };
        if (!this.frisk) return v;
        var naaet = this.trinNr + (this.trinBliv ? 1 : 0);
        m.trin.forEach(function (t, j) { if (t.vis && j >= naaet) t.vis.forEach(function (k) { v[k] = false; }); });
        return v;
    };

    P.visDele = function () {
        var m = this.maal(), v = this.fremme(), laast = this.laastScene();
        NK.el("bh-y").hidden = !m.yBoks;
        NK.el("bh-y").classList.toggle("stiplet", !!m.yBoks && !v.y);
        NK.el("bh-tavle").hidden = !m.tavle;
        var skyd = NK.el("bh-skyder");
        skyd.classList.toggle("stiplet", !v.skyder);
        /* Mens kortet spoerger, ser skyderen ikke klikbar ud: knappen er vaek */
        skyd.classList.toggle("hvile", v.skyder && (laast || this.faerdig));
        this.skyder.disabled = !v.skyder || laast;
        this.opdaterTal();
        var fane = NK.el("bh-graffane");
        fane.hidden = !!m.graf;
        /* Skjult kun mens kortet stiller et aabent spoergsmaal (regel 19a) */
        fane.classList.toggle("skjult", this.spoergerAabent());
        fane.textContent = this.grafUd ? "Skjul grafen ▾" : "Vis grafen ▸";
        fane.setAttribute("aria-expanded", this.grafUd ? "true" : "false");
        this.visOpfordring();
    };

    /* Klik-opfordringen (REGELSAET 19-21): kun naar kortet beder om en
       handling med skyderen, og den forsvinder, naar det er gjort */
    P.visOpfordring = function () {
        var t = this.trin(), on = false;
        if (!this.faerdig && t && !this.laastScene() && this.fremme().skyder) {
            if (t.type === "handling" || t.type === "ligevaegt") on = !this.roert;
        }
        NK.el("bh-skyder").classList.toggle("opfordring", on);
    };

    P.maalNaaet = function (t) {
        if (!t) return false;
        if (t.type === "ligevaegt") return this.erLigevaegt(this.x);
        if (t.type !== "handling") return false;
        if (t.xMax) return this.x >= this.xMax - 1e-9;
        if (t.lige) return this.erLigevaegt(this.x);
        return Math.abs(this.x - t.x) <= t.tol + 1e-9;
    };

    /* Det x, en handling er paa maalet med (til Vis svaret og snap) */
    P.maalX = function (t) {
        if (t.xMax) return this.xMax;
        if (t.lige || t.type === "ligevaegt") return Math.round(this.xEq * 1000) / 1000;
        return t.x;
    };

    P.vaelgKortSvar = function (j) {
        var t = this.trinNu();
        if (!t || this.trinBliv || this.tForkert[j]) return;
        this.tValgt = j;
        this.paab[this.nr] = true;
        this.visKort();
    };

    P.dommTrin = function () {
        var t = this.trinNu(), j = this.tValgt;
        if (!t || j === null) return;
        if (t.svar[j].ok) { this.trinOk("ok"); return; }
        this.tForkert[j] = true;
        this.tValgt = null;
        this.visKort();
        this.fejlLinje(t.svar[j].nej, "Ikke rigtigt");
    };

    /* Et trin er loest. Det sidste trin loeser maalet. */
    P.trinOk = function (maade) {
        var t = this.trin();
        if (t.svar) this.tValgt = t.svar.map(function (v) { return !!v.ok; }).indexOf(true);
        if (this.sidsteTrin()) {
            this.loest(maade, NK.html(this.maal().slut), maade === "svar" ? "Svaret" : "Rigtigt");
            return;
        }
        this.trinBliv = { maade: maade, tekst: NK.html(t.slut || "") };
        this.hjaelp = 0;
        this.hintS = null;
        this.pegKnap = false;
        this.besked("", "");
        this.bygTavle();
        this.visKort();
        this.visDele();
    };

    P.naesteTrin = function () {
        this.trinBliv = null;
        this.trinNr++;
        this.efterFase = false;
        this.tValgt = null;
        this.tForkert = {};
        this.hjaelp = 0;
        this.pegKnap = false;
        this.venter = 0;
        this.roert = false;
        this.skjulMaerke();
        this.bygTavle();
        this.visKort();
        this.naesteLinje("", "");
        this.visDele();
        this.fokus();
    };

    /* En handling er gjort (eller svaret er vist): spoergsmaalet bagefter,
       naeste trin, eller maalet er loest */
    P.handlingFaerdig = function (vist) {
        var t = this.maal().trin[this.trinNr];
        this.venter = 0;
        this.skjulMaerke();
        if (t.snap || vist) { this.saetX(this.maalX(t), true); this.opdaterTal(); }
        if (t.efter) {
            this.efterFase = true;
            this.tValgt = null;
            this.tForkert = {};
            this.hjaelp = 0;
            this.pegKnap = false;
            this.visKort();
            this.naesteLinje("", "");
            this.visDele();
            return;
        }
        if (this.sidsteTrin()) { this.loest(vist ? "svar" : "ok", NK.html(this.maal().slut), vist ? "Svaret" : "Rigtigt"); return; }
        this.naesteTrin();
    };

    /* Papirkortet: reaktionsskemaet med stort, trinnet og svarene */
    P.kortData = function () {
        var m = this.maal(), t = this.trin(), mig = this, rx = this.rx;
        var d = {};
        if (m.trin.length > 1 && (!m.graf || this.frisk)) d.chip = "Trin " + (this.trinNr + 1) + " af " + m.trin.length;
        if (!t) return d;
        d.tekst = t.tekst ? NK.html(t.tekst) : "";
        d.spm = NK.html(t.spm);
        if (t.type === "valg") {
            var tb = this.trinBliv || (this.faerdig && this.slut ? { maade: this.slut.maade } : null);
            /* Det rigtige svar staar ikke altid foerst: raekkefoelgen skifter fra
               trin til trin (data-valg er stadig svarets plads i data) */
            var n = t.svar.length, rot = (this.nr * 2 + this.trinNr + (this.efterFase ? 1 : 0)) % n;
            d.svar = t.svar.map(function (v, j) {
                var tt = v.broek ? NK.html(v.foer || (/^Y/.test(v.t) ? "Y = " : "")) + H.broek(NK.html(v.broek[0]), NK.html(v.broek[1])) : NK.html(v.t);
                return { j: j, t: tt, valgt: !tb && j === mig.tValgt, forkert: !!mig.tForkert[j],
                    rigtig: !!(tb && v.ok && tb.maade !== "svar"), svarVist: !!(tb && v.ok && tb.maade === "svar"),
                    laast: !!tb || !!mig.tForkert[j] };
            });
            d.svar = d.svar.slice(rot).concat(d.svar.slice(0, rot));
        }
        return d;
    };

    /* Indsend svar er klar, naar der er noget at sende ind. En handling har
       ingen Indsend svar: kortet gaar selv videre. */
    P.kanIndsende = function () {
        var t = this.trin();
        if (!t) return false;
        if (t.type === "valg") return this.tValgt !== null;
        if (t.type === "ligevaegt") return this.x > 0 && this.roert;
        return false;
    };

    P.udenIndsend = function () { var t = this.trin(); return !!t && t.type === "handling"; };

    /* ----- x ---------------------------------------------------------------------- */
    P.saetX = function (x, stille) {
        if (!stille && (this.laastScene() || !this.fremme().skyder)) {
            this.skyder.value = String(this.x);
            this.kortBlink();
            return;
        }
        x = NK.klamp(isFinite(x) ? x : 0, 0, this.xMax);
        this.x = x;
        if (Math.abs(parseFloat(this.skyder.value) - x) > 1e-9) this.skyder.value = String(x);
        NK.saetTekst("bh-xtal", t3(x));
        if (stille) return;
        this.roert = true;
        this.paab[this.nr] = true;
        /* Lampen og et maal i scenen: uret begynder forfra ved hver aendring, saa
           det bliver groent, naar x staar stille paa maalet i 0,7 s (regel 39) */
        this.lampe = false;
        var t = this.trin(), ok = !this.faerdig && this.maalNaaet(t);
        this.venter = ok || this.erLigevaegt(x) ? VENT : 0;
        this.opdaterTal();
        if (!this.faerdig) this.visIndsend();
        this.visOpfordring();
    };

    /* Skyderen er sluppet. Skyderen bedoemmer aldrig selv; det goer
       Indsend svar (Niels 24. okt. og 4. nov. 2026). */
    P.slutTraek = function () {
        if (this.faerdig) return;
        this.visIndsend();
    };

    /* ----- Molekylerne -------------------------------------------------------------- */
    P.nyeMolekyler = function () {
        var mig = this, rx = this.rx;
        this.mol = [];
        /* Beholderen fyldes roligt: molekylerne toner frem ét ad gangen (regel 42) */
        var k = 0, L = this.lay, iw = L ? L.beh.w - 16 : 500, ih = L ? L.beh.h - 16 : 350, R = L ? this.molR(L.beh) : 14;
        /* Pladserne vaelges, saa molekylerne helst ikke ligger oven i hinanden */
        function plads(s) {
            var bedst = null, bd = -Infinity;
            for (var f = 0; f < 30; f++) {
                var p = { x: NK.r(0.08, 0.92), y: NK.r(0.08, 0.92) }, d = Infinity;
                mig.mol.forEach(function (q) {
                    var dx = (q.x - p.x) * iw, dy = (q.y - p.y) * ih;
                    d = Math.min(d, Math.sqrt(dx * dx + dy * dy) - (molRad(q.s) + molRad(s)) * R);
                });
                if (d > bd) { bd = d; bedst = p; }
                if (d > 4) break;
            }
            return bedst;
        }
        M.alle(rx).forEach(function (a) {
            var n = Math.round(M.c0(rx, a.s) / rx.enhed);
            for (var i = 0; i < n; i++) {
                var pl = plads(a.s);
                var m = mig.nytMolekyle(a.s, pl.x, pl.y);
                m.alfa = 0;
                m.forsink = 0.15 + k++ * 0.07;
                mig.mol.push(m);
            }
        });
        this.nOms = 0;
    };

    /* Rolige bevaegelser (REGELSAET 26): langsom fart og langsom drejning */
    P.nytMolekyle = function (s, x, y) {
        var v = NK.r(0.025, 0.06), a = NK.r(0, Math.PI * 2);
        return { s: s, x: NK.klamp(x, 0.05, 0.95), y: NK.klamp(y, 0.05, 0.95), vx: Math.cos(a) * v, vy: Math.sin(a) * v,
            rot: NK.r(0, Math.PI * 2), vr: 0, ny: 0, alfa: 1 };
    };

    function naermeste(liste, s, x, y, undtagen) {
        var bedst = null, d = Infinity;
        liste.forEach(function (m) {
            if (m.s !== s || undtagen.indexOf(m) >= 0 || m.ude) return;
            var dd = (m.x - x) * (m.x - x) + (m.y - y) * (m.y - y);
            if (dd < d) { d = dd; bedst = m; }
        });
        return bedst;
    }

    /* Én omsaetning frem (reaktanter > produkter) eller tilbage */
    P.omsaet = function (frem) {
        var rx = this.rx;
        var fra = frem ? rx.r : rx.p, til = frem ? rx.p : rx.r;
        var valgt = [];
        var start = this.mol.filter(function (m) { return m.s === fra[0][1] && !m.ude; });
        if (!start.length) return false;
        var foerste = NK.tilfaeldig(start);
        var cx = foerste.x, cy = foerste.y;
        for (var i = 0; i < fra.length; i++) {
            for (var k = 0; k < fra[i][0]; k++) {
                var m = i === 0 && k === 0 ? foerste : naermeste(this.mol, fra[i][1], cx, cy, valgt);
                if (!m) return false;
                valgt.push(m);
            }
        }
        var sx = 0, sy = 0;
        valgt.forEach(function (m) { sx += m.x; sy += m.y; });
        sx /= valgt.length;
        sy /= valgt.length;
        this.mol = this.mol.filter(function (m) { return valgt.indexOf(m) < 0; });
        var mig = this;
        til.forEach(function (t) {
            for (var j = 0; j < t[0]; j++) {
                var n = mig.nytMolekyle(t[1], sx + NK.r(-0.03, 0.03), sy + NK.r(-0.03, 0.03));
                n.ny = 0.7;
                mig.mol.push(n);
            }
        });
        return true;
    };

    P.opdaterMolekyler = function (dt) {
        var L = this.lay, geo = L ? { iw: L.beh.w - 16, ih: L.beh.h - 16, R: this.molR(L.beh) } : null;
        var maal = Math.round(this.x / this.rx.enhed + 1e-9);
        var gange = 0;
        while (this.nOms !== maal && gange++ < 4) {
            var frem = this.nOms < maal;
            if (!this.omsaet(frem)) break;
            this.nOms += frem ? 1 : -1;
        }
        var aaben = this.laag && this.laag.t < 2.6;
        this.mol.forEach(function (m) {
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            m.rot += m.vr * dt;
            if (m.ny > 0) m.ny = Math.max(0, m.ny - dt);
            if (aaben && !m.ude && m.y < 0.35 && Math.random() < dt * 1.4) { m.ude = true; m.vy = -NK.r(0.2, 0.3); }
            if (m.ude) {
                m.alfa = Math.max(0, m.alfa - dt * 1.6);
                return;
            }
            if (m.forsink > 0) m.forsink -= dt;
            else if (m.alfa < 1) m.alfa = Math.min(1, m.alfa + dt * 1.5);
            var mx = geo ? Math.min(0.3, molRad(m.s) * geo.R / geo.iw) : 0.05, my = geo ? Math.min(0.3, molRad(m.s) * geo.R / geo.ih) : 0.06;
            if (m.x < mx) { m.x = mx; m.vx = Math.abs(m.vx); }
            if (m.x > 1 - mx) { m.x = 1 - mx; m.vx = -Math.abs(m.vx); }
            if (m.y < my) { m.y = my; m.vy = Math.abs(m.vy); }
            if (m.y > 1 - my) { m.y = 1 - my; m.vy = -Math.abs(m.vy); }
        });
        /* Faerre overlap (runde 4): molekyler, der rammer hinanden, skubbes blidt
           fra hinanden, saa atomsymbolerne kan laeses */
        if (geo) {
            var ml = this.mol.filter(function (m) { return !m.ude; });
            for (var i = 0; i < ml.length; i++) {
                for (var j = i + 1; j < ml.length; j++) {
                    var a = ml[i], b = ml[j];
                    var dx = (b.x - a.x) * geo.iw, dy = (b.y - a.y) * geo.ih, d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                    var min = (molRad(a.s) + molRad(b.s)) * geo.R * 0.92;
                    if (d >= min) continue;
                    var skub = Math.min(1, (min - d) / min) * 40 * dt, ux = dx / d, uy = dy / d;
                    a.x -= ux * skub / geo.iw; a.y -= uy * skub / geo.ih;
                    b.x += ux * skub / geo.iw; b.y += uy * skub / geo.ih;
                    var va = a.vx * ux + a.vy * uy, vb = b.vx * ux + b.vy * uy;
                    if (va - vb > 0) { a.vx += (vb - va) * ux; a.vy += (vb - va) * uy; b.vx += (va - vb) * ux; b.vy += (va - vb) * uy; }
                }
            }
        }
        if (this.laag) {
            this.laag.t += dt;
            if (this.laag.t > 2.6 && !this.laag.lukket) {
                /* Laaget er paa igen: molekylerne kommer tilbage (det er jo en model) */
                this.laag.lukket = true;
                var mig = this;
                this.mol.forEach(function (m) {
                    if (!m.ude) return;
                    var n = mig.nytMolekyle(m.s, Math.random(), NK.r(0.4, 0.95));
                    m.x = n.x; m.y = n.y; m.vx = n.vx; m.vy = n.vy; m.ude = false; m.alfa = 0;
                });
            }
            if (this.laag.t > 3.2) this.laag = null;
        }
    };

    /* ----- Boksen med Y og K ------------------------------------------------------------- */
    P.bygY = function () {
        var rx = this.rx;
        var lov = M.lovFacit(rx);
        var html = '<div class="y-linje">Y = ' + H.broek(NK.html(M.ledene(lov.num)), NK.html(M.ledene(lov.den))) +
            ' = <b id="bh-yv"></b></div>';
        html += '<div class="y-k">K = ' + NK.html(M.kTekst(rx)) + ' <span class="y-sml" id="bh-ysml"></span></div>';
        NK.el("bh-y").innerHTML = NK.kc(html);
        /* saetTekst husker den sidste tekst: glem den, saa tallet skrives igen */
        NK.saetTekst("bh-yv", "·");
        NK.saetTekst("bh-ysml", "·");
    };

    /* ----- Tavlen: skemaet ét felt ad gangen og linjerne under det (REGELSAET 28, 36) ---- */
    var RNAVN = { start: "Start", aendr: "Ændring", lig: "Ligevægt" };

    /* Hvor langt er trinnet, der udfylder et felt eller en linje: "kendt",
       "spoerg" (kortet spoerger om det nu) eller "senere" */
    P.feltTilstand = function (hvad, vaerdi) {
        var m = this.maal(), k = -1;
        m.trin.forEach(function (t, j) { if (t[hvad] === vaerdi) k = j; });
        if (k < 0 || this.faerdig) return "kendt";
        if (k < this.trinNr || (k === this.trinNr && this.trinBliv)) return "kendt";
        if (k === this.trinNr) return "spoerg";
        return "senere";
    };

    /* Ligevaegtskoncentrationen med enhed (regel 40): "0,200 M − x", "x", "2x" */
    function ligMedEnhed(rx, a) {
        var c0 = M.c0(rx, a.s), d = M.aendrTekst(a);
        if (!c0) return d.replace(/^\+/, "");
        return NK.tal(c0) + " M " + d.replace(/^([+−])/, "$1 ");
    }
    NK.ligMedEnhed = ligMedEnhed;

    P.bygTavle = function () {
        var mig = this, m = this.maal(), rx = this.rx, w = NK.el("bh-tavle");
        if (!m.tavle) { w.innerHTML = ""; return; }
        var tab = el("table", "bt-skema");
        var hoved = el("tr"), arter = M.alle(rx);
        hoved.appendChild(el("th", "bt-hj", ""));
        /* Oeverste raekke laeses som reaktionsskemaet: + mellem stofferne paa samme
           side og ⇌ mellem reaktanter og produkter, i smalle kolonner, der er tomme
           i raekkerne under (runde 5, REGELSAET 48) */
        function tegn(i) { return i === 0 ? null : (arter[i - 1].side !== arter[i].side ? "⇌" : "+"); }
        arter.forEach(function (a, i) {
            if (tegn(i)) hoved.appendChild(el("th", "bt-tegn", tegn(i)));
            var th = el("th", "bt-stof");
            if (a.k > 1) th.appendChild(el("span", "bt-koef", String(a.k)));
            var p = el("span", "bt-pille", NK.html(M.skriv(a.s)));
            p.style.setProperty("--stof", farve(a.s));
            p.setAttribute("data-s", a.s);
            th.appendChild(p);
            hoved.appendChild(th);
        });
        tab.appendChild(hoved);
        m.tavle.raekker.forEach(function (r) {
            var tr = el("tr", "bt-" + r);
            tr.appendChild(el("th", "bt-r", RNAVN[r]));
            arter.forEach(function (a, ai) {
                if (tegn(ai)) tr.appendChild(el("td", "bt-tegn", ""));
                var td = el("td");
                td.setAttribute("data-felt", r + "." + a.s);
                if (r === "start") {
                    td.textContent = (M.c0(rx, a.s) ? NK.tal(M.c0(rx, a.s)) : "0") + " M";
                } else {
                    var tilst = mig.feltTilstand("felt", r + "." + a.s);
                    if (tilst === "spoerg") { td.className = "spoerg"; td.innerHTML = '<span class="bt-felt">?</span>'; }
                    else if (tilst === "senere") { td.className = "tom"; td.innerHTML = '<span class="bt-felt"></span>'; }
                    else {
                        td.innerHTML = NK.html(r === "aendr" ? M.aendrTekst(a) : ligMedEnhed(rx, a));
                        /* Tallet staar paa sin egen linje i mindre skrift og kun ved ligevaegt (regel 49, 50) */
                        if (r === "lig" && m.tavle.tal) td.innerHTML += '<span class="bt-tal skjult" data-s="' + a.s + '">= 0,000 M</span>';
                    }
                }
                tr.appendChild(td);
            });
            tab.appendChild(tr);
        });
        w.innerHTML = "";
        w.appendChild(tab);
        (m.tavle.linjer || []).forEach(function (l, i) {
            var tilst = mig.feltTilstand("linje", i);
            if (tilst === "senere") return;
            if (l.fra !== undefined && !mig.faerdig && mig.trinNr < l.fra) return;
            if (l.til !== undefined && (mig.faerdig || mig.trinNr > l.til)) return;
            var d = el("div", "bt-linje" + (tilst === "spoerg" ? " spoerg" : "") + (l.lov ? " bt-lov" : ""));
            d.appendChild(el("div", "bt-navn", NK.html(l.navn)));
            /* Ligevaegtsloven med symboler staar synligt, mens eleven saetter ind (regel 41) */
            var lov = M.lovFacit(rx);
            var html = l.lov ? "K = " + H.broek(NK.html(M.ledene(lov.num).replace(/·/g, " · ")), NK.html(M.ledene(lov.den).replace(/·/g, " · "))) : l.html;
            d.appendChild(el("div", "bt-regn", tilst === "spoerg" ? '<span class="bt-felt">?</span>' : NK.kc(html)));
            w.appendChild(d);
        });
        this.opdaterTal();
        this.tilpasTavle();
    };

    P.opdaterTal = function () {
        var rx = this.rx, x = this.x;
        /* Raekken Ligevaegt faar kun tal, naar der er ligevaegt: lampen er groen,
           eller opgaven er loest med x paa ligevaegten (runde 5, regel 49). Pladsen
           er der hele tiden, saa tavlen ikke hopper. */
        var tal = NK.el("bh-tavle").querySelectorAll(".bt-tal");
        var ligeNu = this.erLigevaegt(x) && (this.lampe || this.faerdig);
        for (var i = 0; i < tal.length; i++) {
            var s = tal[i].getAttribute("data-s"), v = M.vaerdi(M.plads(rx, s), x);
            var tekst = "= " + t3(v) + " M";
            if (tal[i].textContent !== tekst) tal[i].textContent = tekst;
            tal[i].classList.toggle("skjult", !ligeNu);
        }
        var Y = M.Y(rx, x), K = rx.K;
        /* Svaret staar ikke i scenen, foer eleven har svaret (regel 38): Y's
           vaerdi er "?", til trinnet om Y er loest, og maerket Y < K er skjult,
           mens kortet spoerger, om der er ligevaegt */
        var fr = this.fremme ? this.fremme() : { yv: true }, tt = this.trin && this.trin();
        var visV = fr.yv, visL = fr.yv && !(tt && tt.skjulLampe && !this.trinBliv && !this.faerdig);
        var yTekst = !visV ? "?" : (!isFinite(Y) ? "uendelig" : NK.tal(Y) + (M.kEnhed(rx) ? " " + M.kEnhed(rx) : ""));
        NK.saetTekst("bh-yv", yTekst);
        var lige = this.erLigevaegt(x);
        NK.saetTekst("bh-ysml", lige ? "Y = K" : (!isFinite(Y) || Y > K ? "Y > K" : "Y < K"));
        var e = NK.el("bh-ysml");
        /* Lampen bliver groen, naar x har staaet stille paa ligevaegten (regel 39) */
        if (e) { e.className = "y-sml" + (lige && this.lampe ? " lige" : ""); e.hidden = !visL; }
    };

    /* ----- Hjaelpen paa skyderen (runde 4, Niels: "lidt svært at ramme x ... måske skal
       den blinke lidt hjælpende, hvis man ikke rammer efter 10 sekunder") ------------
       Har eleven trukket i 10 s uden at naa maalet (eller faaet hintet om den),
       kommer en lille gul streg paa skyderens spor, dér hvor maalet er. Den
       pulserer roligt tre gange og bliver staaende svagt (regel 26). */
    var HJAELP_EFTER = 10;

    P.skjulMaerke = function () {
        this.maerke = false;
        this.traekT = 0;
        var e = NK.el("bh-maal");
        if (e) { e.hidden = true; e.classList.remove("vis"); }
    };

    P.visMaerke = function () {
        var t = this.trin();
        if (!t || this.faerdig || (t.type !== "handling" && t.type !== "ligevaegt")) return;
        this.maerke = true;
        this.placerMaerke();
        var e = NK.el("bh-maal");
        e.hidden = false;
        e.classList.remove("vis");
        void e.offsetWidth;
        e.classList.add("vis");
    };

    P.placerMaerke = function () {
        var t = this.trin(), e = NK.el("bh-maal");
        if (!t || !e || !this.maerke) return;
        var w = this.skyder.getBoundingClientRect().width;
        var xm = this.maalX(t);
        e.style.left = Math.round(KNAP_R + xm / this.xMax * (w - 2 * KNAP_R)) + "px";
    };

    /* Fane.js kalder efterHint, naar eleven faar et hint: hintet om den gule streg viser den */
    P.efterHint = function (tekst) { if (/gule streg/.test(tekst || "")) this.visMaerke(); };

    /* ----- Grafen foldes ind og ud (fra maal 2) --------------------------------------- */
    P.spoergerAabent = function () { return !!this.trinNu() && !this.trinBliv; };

    P.foldGraf = function () {
        if (this.spoergerAabent()) { this.kortBlink(); return; }
        this.grafUd = !this.grafUd;
        this.visDele();
        this.tilpas();
    };

    /* ----- Tjek, hint og svar ------------------------------------------------------------ */
    P.tjek = function () {
        if (this.faerdig) return;
        var t = this.trin();
        if (!t) return;
        if (t.type === "valg") { this.dommTrin(); return; }
        if (t.type !== "ligevaegt") return;
        var Y = M.Y(this.rx, this.x);
        if (this.erLigevaegt(this.x) || Math.abs(this.x - this.xEq) <= 0.0015) {
            this.lampe = true;
            this.opdaterTal();
            this.loest("ok", NK.html(this.maal().slut), "Ligevægt");
            return;
        }
        this.fejlLinje(isFinite(Y) && Y < this.rx.K ? "Y er mindre end K. Der skal mere produkt til, så x skal være større." :
            "Y er større end K. Der er for meget produkt, så x skal være mindre.");
    };

    P.efterOpgave = function () {
        this.venter = 0;
        this.skjulMaerke();
        this.bygTavle();
        this.visDele();
    };

    P.trinLinje = function () {
        var t = this.trin();
        if (!t) return "";
        if (t.type === "valg") return "Vælg et svar, og tryk Indsend svar.";
        if (t.type === "handling") return this.maal().graf ? "Skyderen ligger under beholderen og grafen." : "Skyderen ligger under beholderen.";
        return this.fremme().graf ? "Træk i skyderen eller på grafen, og tryk Indsend svar." : "Træk i skyderen, og tryk Indsend svar.";
    };

    P.hintTrin = function () {
        if (this.faerdig) return null;
        var t = this.trin(), rx = this.rx;
        if (!t) return null;
        if (t.hint) return { s: null, trin: t.hint };
        var Y = M.Y(rx, this.x);
        return { s: null, trin: [
            "Y er reaktionsbrøken regnet med koncentrationerne lige nu. Ved ligevægt er Y = K.",
            isFinite(Y) && Y < rx.K ? "Y er for lille. Træk x større, så der bliver mere produkt." : "Y er for stor. Træk x mindre.",
            "Den gule streg på skyderen viser ligevægten ved x ≈ " + t3(this.xEq) + " M."
        ] };
    };

    P.visSvar = function () {
        var t = this.trin();
        if (!t) return;
        if (t.type === "valg") { this.trinOk("svar"); return; }
        if (t.type === "handling") {
            this.handlingFaerdig(true);
            return;
        }
        this.saetX(Math.round(this.xEq * 1000) / 1000, true);
        this.lampe = true;
        this.opdaterTal();
        this.loest("svar", NK.html(this.maal().slut));
    };

    P.enter = function () {
        if (this.faerdig) { if (this.videreTekst()) this.knap(); return; }
        if (this.trinBliv) { this.knap(); return; }
        if (this.udenIndsend()) return;
        this.indsendKlik();
    };

    /* Start forfra giver trinene igen (REGELSAET 16) */
    P.nulstil = function () {
        this.mol = [];
        this.tvingTrin = true;
        this.vaelg(this.nr);
    };

    P.fokusFelt = function () {
        var t = this.trin();
        if (!this.skyder.disabled && t && !this.faerdig && (t.type === "handling" || t.type === "ligevaegt")) {
            try { this.skyder.focus({ preventScroll: true }); } catch (e) { this.skyder.focus(); }
        }
    };

    P.paabegyndt = function (i) { return !!(this.paab && this.paab[i]); };

    P.faneStart = P.startFane;
    P.startFane = function (o, g) { this.paab = {}; this.faneStart(o, g); };

    /* ----- Musen paa laerredet: laaget, beholderen og grafen ------------------------------ */
    function inde(p, r) { return r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }

    P.ned = function (e) {
        var p = this.laerred.punkt(e), L = this.lay;
        if (!L) return;
        var laag = { x: L.laag.x, y: L.laag.y - 6, w: L.laag.w, h: L.laag.h + 12 };
        if (inde(p, laag)) {
            if (this.laastScene()) { this.kortBlink(); return; }
            this.aabnLaag();
            return;
        }
        if (inde(p, L.beh)) { this.klikBeholder(); return; }
        if (L.graf && inde(p, L.graf) && this.fremme().graf) {
            if (this.laastScene() || !this.fremme().skyder || this.faerdig) { this.kortBlink(); return; }
            this.traek = true;
            try { this.laerred.canvas.setPointerCapture(e.pointerId); } catch (err) { /* intet */ }
            this.traekTil(p.x);
        }
    };

    /* Et klik i beholderen: en kort besked, eller kortet blinker */
    P.klikBeholder = function () {
        if (this.spaer()) return;
        this.kortBesked("Beholderen er lukket. Molekylerne bevæger sig hele tiden, også ved ligevægt.", 4);
    };

    P.flyt = function (e) {
        var p = this.laerred.punkt(e), L = this.lay;
        if (this.traek) { this.traekTil(p.x); return; }
        if (!L) return;
        var kan = !this.laastScene() && !this.faerdig && this.fremme().skyder;
        var graf = kan && L.graf && inde(p, L.graf) && this.fremme().graf;
        this.laerred.canvas.style.cursor = graf ? "ew-resize" : "default";
    };

    P.op = function () {
        if (!this.traek) return;
        this.traek = false;
        this.slutTraek();
    };

    P.traekTil = function (px) {
        var G = this.lay && this.lay.graf;
        if (!G) return;
        var x = (px - G.x) / G.w * this.xMax;
        this.saetX(Math.round(NK.klamp(x, 0, this.xMax) * 1000) / 1000);
    };

    P.aabnLaag = function () {
        if (this.laag) return;
        this.laag = { t: 0 };
        this.kortBesked("Låget er af. Gassen slipper ud, og der bliver aldrig ligevægt. Derfor står der lukket beholder i alle opgaverne.", 5);
    };

    /* ----- Layoutet ------------------------------------------------------------------------
       Scenen er samlet og hoejst 1500 px bred (REGELSAET 32). Beholderen er
       stor: halvdelen af scenen, men ikke meget bredere end den er hoej. Til
       hoejre staar Y-boksen og grafen (maal 1) eller tavlen (fra maal 2).
       Skyderen ligger under beholderen; paa maal 1 strækker den sig ind under
       grafen, og dens skala flugter med grafens x-akse. */
    P.beregnLay = function () {
        var arb = NK.el("bh-arbejde");
        var W = arb.clientWidth, Hh = arb.clientHeight;
        var m = this.maal(), grafMode = !!m.graf, harY = !!m.yBoks;
        var pad = 6, laagH = 30, taelH = 30, skydH = 54, gap = 34;
        var S = Math.min(W - 24, 1500);
        var behH = Math.max(120, Hh - pad - laagH - taelH - skydH - 12);
        /* Runde 3: beholderen lidt mindre end i runde 2 (Niels: "faktisk lidt for stor") */
        var bw = Math.round(Math.max(S * 0.38, Math.min(S * 0.46, behH * 1.5)));
        var rw = Math.round(Math.min(S - bw - gap, bw * (grafMode ? 0.85 : 1.0)));
        var total = bw + gap + rw;
        var ox = Math.round((W - total) / 2);
        var L = { W: W, H: Hh, ox: ox, total: total, grafMode: grafMode };
        L.beh = { x: ox, y: pad + laagH, w: bw, h: behH };
        L.laag = { x: L.beh.x - 8, y: L.beh.y - 17, w: bw + 16, h: 14 };
        L.tael = { x: ox, y: L.beh.y + behH + 8, w: bw };
        var bund = L.beh.y + behH + taelH;
        var hx = ox + bw + gap, top = pad;
        if (harY) { L.y = { x: hx, y: top, w: rw, h: 56 }; top += 56 + 8; }
        L.skyd = { x: ox, y: Hh - skydH - 2, h: skydH };
        if (grafMode) {
            L.graf = { x: hx + 54, y: top + 8, w: rw - 54 - 10, h: bund - top - 8 - 26 };
            /* Feltet begynder lige foer sporet, saa x-vaerdien staar tæt ved det */
            var labB = 300;
            L.skyd.x = Math.max(ox, L.graf.x - KNAP_R - labB - 28);
            L.skyd.w = ox + total - L.skyd.x;
            L.spor = { x: L.graf.x - KNAP_R, w: L.graf.w + 2 * KNAP_R };
        } else {
            /* Runde 4 (Niels: "Man kan kun folde grafen ud, hvis man zoomer ud"):
               "Vis grafen" staar i hoejre side ud for skyderen, altid inden for scenen */
            var plads = bund - top;
            if (this.grafUd) {
                L.tavle = { x: hx, y: top, w: rw, h: Math.round(plads * 0.56) };
                var gy = L.tavle.y + L.tavle.h + 14;
                L.graf = { x: hx + 54, y: gy + 6, w: rw - 54 - 10, h: bund - gy - 6 - 22 };
                if (L.graf.h < 60) L.graf = null;
            } else L.tavle = { x: hx, y: top, w: rw, h: plads };
            L.fane = { x: hx, y: L.skyd.y + Math.round((skydH - 32) / 2), w: rw, h: 32 };
            L.skyd.w = bw;
            L.spor = null;
        }
        return L;
    };

    function stil(e, r) {
        e.style.left = Math.round(r.x) + "px";
        e.style.top = Math.round(r.y) + "px";
        if (r.w !== undefined) e.style.width = Math.round(r.w) + "px";
        if (r.h !== undefined) e.style.height = Math.round(r.h) + "px";
    }

    P.tilpas = function () {
        var arb = NK.el("bh-arbejde");
        if (!arb || !arb.offsetWidth) return;
        var L = this.lay = this.beregnLay();
        if (L.y) stil(NK.el("bh-y"), L.y);
        if (L.tavle) this.tilpasTavle();
        if (L.fane) stil(NK.el("bh-graffane"), { x: L.fane.x, y: L.fane.y + 2 });
        var sk = NK.el("bh-skyder");
        stil(sk, L.skyd);
        var lab = sk.querySelector(".bh-xlab"), spor = sk.querySelector(".bh-spor");
        this.placerMaerke();
        if (L.spor) {
            /* Skalaen flugter med grafens x-akse: sporet begynder, hvor x = 0 er paa grafen */
            lab.style.width = Math.max(120, L.spor.x - L.skyd.x - 16 - 12) + "px";
            spor.style.flex = "none";
            spor.style.width = L.spor.w + "px";
            spor.style.marginLeft = "auto";
            sk.classList.add("under-graf");
        } else {
            lab.style.width = "";
            spor.style.flex = "";
            spor.style.width = "";
            spor.style.marginLeft = "";
            sk.classList.remove("under-graf");
        }
        this.laerred.tilpas();
    };

    /* Tavlen er saa hoej som indholdet, hoejst til pladsen. Er der ikke plads,
       bliver skriften mindre (ned til 13 px), og det, kortet spoerger om,
       rulles frem. */
    P.tilpasTavle = function () {
        var L = this.lay, w = NK.el("bh-tavle");
        if (!L || !L.tavle || w.hidden) return;
        stil(w, { x: L.tavle.x, y: L.tavle.y, w: L.tavle.w });
        w.style.height = "";
        w.style.maxHeight = Math.round(L.tavle.h) + "px";
        /* Ingen rullebjaelke (regel 50): skriften bliver mindre, ned til 14 px */
        var fs = 17;
        w.style.fontSize = fs + "px";
        while (fs > 14 && w.scrollHeight > w.clientHeight) { fs -= 0.5; w.style.fontSize = fs + "px"; }
        var sp = w.querySelector(".spoerg");
        if (sp && w.scrollHeight > w.clientHeight + 1) {
            var rw = w.getBoundingClientRect(), rs = sp.getBoundingClientRect();
            if (rs.bottom > rw.bottom) w.scrollTop += rs.bottom - rw.bottom + 10;
        } else w.scrollTop = 0;
    };

    /* ----- Tegning ------------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.opdaterBesked(dt);
        if (this.venter > 0) {
            this.venter -= dt;
            if (this.venter <= 0) {
                this.venter = 0;
                var t = this.trin();
                this.lampe = this.erLigevaegt(this.x);
                this.opdaterTal();
                if (!this.faerdig && t && this.maalNaaet(t)) {
                    if (t.type === "handling") this.handlingFaerdig(false);
                    else if (t.type === "ligevaegt") this.loest("ok", NK.html(this.maal().slut), "Ligevægt");
                }
            }
        }
        var th = this.trin();
        if (!this.faerdig && th && (th.type === "handling" || th.type === "ligevaegt") && this.roert && !this.maerke && !this.trinBliv) {
            this.traekT += dt;
            if (this.traekT >= HJAELP_EFTER && !this.maalNaaet(th)) this.visMaerke();
        }
        if (!NK.el("fane-bh").classList.contains("aktiv")) return;
        this.opdaterMolekyler(dt);
        this.tegn();
    };

    P.tegn = function () {
        var l = this.laerred;
        if (!this.lay) this.tilpas();
        l.tilpas();
        var c = l.ctx, L = this.lay;
        l.ryd();
        if (this.laag && this.laag.t < 2.6) {
            this.laagLoeft = Math.min(1, this.laag.t * 3) * (this.laag.t > 2.2 ? Math.max(0, (2.6 - this.laag.t) / 0.4) : 1);
        } else this.laagLoeft = 0;
        this.tegnBeholder(c, L.beh);
        this.tegnTaeller(c, L.tael);
        if (L.graf) {
            if (this.fremme().graf) this.tegnGraf(c, L.graf);
            else this.tegnPlads(c, { x: L.graf.x - 54, y: L.graf.y - 8, w: L.graf.w + 64, h: L.graf.h + 34 }, "Grafen");
        }
    };

    /* En stiplet plads med navnet til det, der kommer senere (REGELSAET 13) */
    P.tegnPlads = function (c, r, navn) {
        c.save();
        NK.rundtRekt(c, r.x, r.y, r.w, r.h, 10);
        c.setLineDash([8, 6]);
        c.lineWidth = 1.5;
        c.strokeStyle = "rgba(200, 206, 216, 0.35)";
        c.stroke();
        c.setLineDash([]);
        c.font = "500 15px " + SKRIFT;
        c.fillStyle = "rgba(200, 206, 216, 0.55)";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(navn, r.x + r.w / 2, r.y + r.h / 2);
        c.restore();
    };

    /* Molekylets stoerrelse foelger beholderen */
    /* Runde 4: molekylerne ca. 1,3 gange stoerre, saa atomsymbolerne kan staa i
       kuglerne i mindst 13,5 px (ogsaa i H) */
    P.molR = function (b) { return NK.klamp(Math.min(b.w, b.h) / 24, 14, 17); };

    /* Molekylets radius (i R): det yderste atom med dets kugle */
    var RAD = {};
    function molRad(s) {
        if (RAD[s]) return RAD[s];
        var st = D.STOF[s], r = 1;
        if (st && st.atomer) st.atomer.forEach(function (a) { r = Math.max(r, Math.sqrt(a[1] * a[1] + a[2] * a[2]) * 1.45 + D.ATOM[a[0]].r); });
        return (RAD[s] = r);
    }

    P.tegnBeholder = function (c, b) {
        var R = this.molR(b);
        /* Glasset: en rolig, moerk beholder med en tynd lys kant */
        c.save();
        NK.rundtRekt(c, b.x, b.y, b.w, b.h, 16);
        var g = c.createLinearGradient(0, b.y, 0, b.y + b.h);
        g.addColorStop(0, "rgba(120, 140, 165, 0.10)");
        g.addColorStop(1, "rgba(120, 140, 165, 0.04)");
        c.fillStyle = g;
        c.fill();
        c.lineWidth = 2.5;
        c.strokeStyle = "rgba(190, 210, 228, 0.5)";
        c.stroke();
        c.clip();
        var ix = b.x + 8, iy = b.y + 8, iw = b.w - 16, ih = b.h - 16;
        var tt = this.trin(), mig = this, fremhaev = !!(tt && tt.fremhaev) && !this.faerdig;
        var prod = {};
        this.rx.p.forEach(function (p) { prod[p[1]] = true; });
        this.mol.forEach(function (m) {
            if (m.alfa <= 0) return;
            mig.tegnMolekyle(c, m.s, ix + m.x * iw, iy + m.y * ih, R, m.rot, m.alfa, fremhaev && prod[m.s], true);
        });
        c.restore();
        this.tegnLaag(c, this.lay.laag, b);
    };

    /* Laaget (runde 3, Niels: "Toppen af låget ser lidt skør ud"): en
       metalplade med lidt dybde, en moerk gummipakning mod glasset, to
       klemmer med skruer, der gaar ned over glaskanten, og et greb i midten. */
    P.tegnLaag = function (c, Lg, b) {
        var loeft = this.laagLoeft || 0;
        c.save();
        /* Pakningen mellem laag og glas */
        if (loeft < 0.05) {
            NK.rundtRekt(c, b.x + 3, b.y - 4, b.w - 6, 6, 3);
            c.fillStyle = "#23262e";
            c.fill();
        }
        c.translate(Lg.x + Lg.w / 2, Lg.y + Lg.h / 2 - loeft * 26);
        c.rotate(-loeft * 0.16);
        var x0 = -Lg.w / 2, y0 = -Lg.h / 2;
        /* Skygge under pladen */
        c.shadowColor = "rgba(0, 0, 0, 0.45)";
        c.shadowBlur = 6;
        c.shadowOffsetY = 2;
        /* Pladen: forside og overside giver dybde */
        var g = c.createLinearGradient(0, y0, 0, y0 + Lg.h);
        g.addColorStop(0, "#a7b0bd");
        g.addColorStop(0.35, "#848d9a");
        g.addColorStop(1, "#5a616c");
        NK.rundtRekt(c, x0, y0, Lg.w, Lg.h, 5);
        c.fillStyle = g;
        c.fill();
        c.shadowColor = "transparent";
        c.lineWidth = 1;
        c.strokeStyle = "rgba(30, 34, 42, 0.8)";
        c.stroke();
        /* Lys kant langs oversiden */
        c.beginPath();
        c.moveTo(x0 + 7, y0 + 1.5);
        c.lineTo(x0 + Lg.w - 7, y0 + 1.5);
        c.strokeStyle = "rgba(255, 255, 255, 0.45)";
        c.stroke();
        /* Klemmerne i hver ende med en skrue */
        [x0 + 12, x0 + Lg.w - 26].forEach(function (kx) {
            var kg = c.createLinearGradient(kx, 0, kx + 14, 0);
            kg.addColorStop(0, "#6b7380");
            kg.addColorStop(0.5, "#8f98a5");
            kg.addColorStop(1, "#5d6470");
            NK.rundtRekt(c, kx, y0 + 4, 14, Lg.h + 9, 3);
            c.fillStyle = kg;
            c.fill();
            c.strokeStyle = "rgba(30, 34, 42, 0.8)";
            c.stroke();
            c.beginPath();
            c.arc(kx + 7, y0 + 7, 3.2, 0, Math.PI * 2);
            c.fillStyle = "#c4cbd5";
            c.fill();
            c.beginPath();
            c.moveTo(kx + 5, y0 + 7);
            c.lineTo(kx + 9, y0 + 7);
            c.strokeStyle = "#4b525d";
            c.stroke();
        });
        /* Grebet i midten */
        var gw = Math.min(70, Lg.w * 0.14);
        var gg = c.createLinearGradient(0, y0 - 11, 0, y0);
        gg.addColorStop(0, "#b3bcc8");
        gg.addColorStop(1, "#6f7783");
        NK.rundtRekt(c, -gw * 0.18, y0 - 5, gw * 0.36, 6, 2);
        c.fillStyle = "#6a727e";
        c.fill();
        NK.rundtRekt(c, -gw / 2, y0 - 12, gw, 8, 4);
        c.fillStyle = gg;
        c.fill();
        c.strokeStyle = "rgba(30, 34, 42, 0.8)";
        c.stroke();
        c.restore();
    };

    /* Et molekyle: atomerne i stoffets daempede farve med en blød skygge og
       et stille lys foroven. Ingen atomfarver (Niels: "forvirrende med alle
       de farver"). fremhaev: en tynd lys ring om de nye molekyler. */
    /* Grundstoffets nuance af stoffets farve: lidt lysere eller moerkere, saa
       atomerne kan skelnes uden nye farver (runde 4) */
    var NUANCE = { H: 0.28, O: 0.12, S: 0, C: -0.12, Cl: -0.05, Br: -0.12 };

    P.tegnMolekyle = function (c, s, x, y, R, rot, alfa, fremhaev, symboler) {
        var st = D.STOF[s];
        if (!st || !st.atomer) return;
        var f0 = farve(s);
        var co = Math.cos(rot), si = Math.sin(rot);
        var atomer = st.atomer.slice().sort(function (a, b) {
            return (b[1] * b[1] + b[2] * b[2]) - (a[1] * a[1] + a[2] * a[2]);
        });
        c.save();
        c.globalAlpha = alfa;
        if (fremhaev) {
            c.beginPath();
            c.arc(x, y, R * (molRad(s) + 0.45), 0, Math.PI * 2);
            c.strokeStyle = "rgba(255, 255, 255, 0.5)";
            c.lineWidth = 1.5;
            c.stroke();
        }
        c.shadowColor = "rgba(0, 0, 0, 0.35)";
        c.shadowBlur = R * 0.5;
        c.shadowOffsetY = R * 0.15;
        var tekster = [];
        atomer.forEach(function (a) {
            var at = D.ATOM[a[0]];
            var f = nuance(f0, NUANCE[a[0]] || 0);
            var lys = nuance(f, 0.35), moerk = nuance(f, -0.25);
            var ax = x + (a[1] * co - a[2] * si) * R * 1.45, ay = y + (a[1] * si + a[2] * co) * R * 1.45;
            var r = at.r * R;
            if (symboler) tekster.push({ t: a[0], x: ax, y: ay, r: r });
            var gr = c.createRadialGradient(ax - r * 0.35, ay - r * 0.4, r * 0.1, ax, ay, r);
            gr.addColorStop(0, lys);
            gr.addColorStop(0.55, f);
            gr.addColorStop(1, moerk);
            c.beginPath();
            c.arc(ax, ay, r, 0, Math.PI * 2);
            c.fillStyle = gr;
            c.fill();
            c.shadowColor = "transparent";
            c.lineWidth = 1;
            c.strokeStyle = nuance(f, -0.35);
            c.globalAlpha = alfa * 0.45;
            c.stroke();
            c.globalAlpha = alfa;
            c.shadowColor = "rgba(0, 0, 0, 0.35)";
        });
        /* Atomsymbolerne staar oprejst inde i kuglerne (mindst 13,5 px, Lexend 500) */
        if (tekster.length) {
            c.shadowColor = "transparent";
            c.fillStyle = "rgba(24, 30, 42, 0.88)";
            c.textAlign = "center";
            c.textBaseline = "middle";
            tekster.forEach(function (t) {
                var fs = Math.max(13.5, Math.min(16, t.r * 1.0));
                c.font = "500 " + fs + "px " + SKRIFT;
                c.fillText(t.t, t.x, t.y + fs * 0.04);
            });
        }
        c.restore();
    };

    /* Antallet af hvert stof under beholderen i stoffets farve. Det er den
       eneste "legende" (REGELSAET 24). */
    P.tegnTaeller = function (c, t) {
        var mig = this, rx = this.rx, x = t.x + 4, y = t.y + 11;
        var R = 5.5;
        M.alle(rx).forEach(function (a) {
            var n = mig.mol.filter(function (m) { return m.s === a.s && !m.ude; }).length;
            mig.tegnMolekyle(c, a.s, x + 10, y, R, 0, 1, false);
            var tekst = M.skriv(a.s) + ": " + n;
            c.font = "500 14px " + SKRIFT;
            c.fillStyle = nuance(farve(a.s), 0.25);
            c.textAlign = "left";
            c.textBaseline = "middle";
            c.fillText(tekst, x + 26, y + 1);
            x += 46 + c.measureText(tekst).width;
        });
        var e = "1 molekyle = " + NK.tal(rx.enhed).replace(/0+$/, "").replace(/,$/, "") + " M";
        c.font = "400 13.5px " + SKRIFT;
        c.fillStyle = "#a9b0ba";
        c.textAlign = "right";
        c.textBaseline = "middle";
        c.fillText(e, t.x + t.w - 4, y + 1);
    };

    /* Grafen: Y som funktion af x fra 0 til den stoerste x. x-aksen gaar
       praecis fra 0 til xMax, saa skyderen under den flugter med den. */
    P.tegnGraf = function (c, G) {
        var rx = this.rx, K = rx.K;
        var v = { x0: 0, x1: this.xMax, y0: -0.08 * K, y1: 2.4 * K };
        function px(x) { return G.x + (x - v.x0) / (v.x1 - v.x0) * G.w; }
        function py(y) { return G.y + G.h - (y - v.y0) / (v.y1 - v.y0) * G.h; }
        this.px = px;

        c.save();
        c.beginPath();
        c.rect(G.x, G.y - 2, G.w, G.h + 2);
        c.clip();
        c.strokeStyle = "rgba(255,255,255,0.06)";
        c.lineWidth = 1;
        var skridt = this.xMax > 0.15 ? 0.05 : 0.025;
        for (var xt = 0; xt <= v.x1 + 1e-9; xt += skridt) {
            c.beginPath(); c.moveTo(px(xt), G.y); c.lineTo(px(xt), G.y + G.h); c.stroke();
        }
        /* K-linjen */
        c.setLineDash([7, 5]);
        c.strokeStyle = "rgba(226, 196, 110, 0.85)";
        c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(G.x, py(K)); c.lineTo(G.x + G.w, py(K)); c.stroke();
        c.setLineDash([]);
        /* Kurven */
        c.strokeStyle = "#9fd2c0";
        c.lineWidth = 2.5;
        c.beginPath();
        var nede = true;
        for (var i = 0; i <= 300; i++) {
            var x = v.x1 * i / 300, Y = M.Y(rx, x);
            if (!isFinite(Y) || Y > v.y1 * 3) { nede = true; continue; }
            if (nede) c.moveTo(px(x), py(Y)); else c.lineTo(px(x), py(Y));
            nede = false;
        }
        c.stroke();
        /* Det x, skyderen staar paa */
        var Yn = M.Y(rx, this.x);
        c.setLineDash([3, 4]);
        c.strokeStyle = "rgba(170, 200, 225, 0.6)";
        c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(px(this.x), G.y); c.lineTo(px(this.x), G.y + G.h); c.stroke();
        c.setLineDash([]);
        if (isFinite(Yn) && Yn <= v.y1) {
            c.beginPath();
            c.arc(px(this.x), py(Yn), 6, 0, Math.PI * 2);
            c.fillStyle = "#cfe3f2";
            c.fill();
            c.lineWidth = 2;
            c.strokeStyle = "#1d1f27";
            c.stroke();
        }
        c.restore();
        /* Akserne */
        c.strokeStyle = "rgba(255,255,255,0.35)";
        c.lineWidth = 1;
        c.beginPath(); c.moveTo(G.x, G.y); c.lineTo(G.x, py(0)); c.lineTo(G.x + G.w, py(0)); c.stroke();
        c.fillStyle = "#a9b0ba";
        c.font = "400 12.5px " + SKRIFT;
        c.textAlign = "center";
        c.textBaseline = "top";
        for (xt = 0; xt <= v.x1 + 1e-9; xt += skridt) {
            c.fillText(Math.abs(xt) < 1e-9 ? "0" : xt.toFixed(skridt < 0.05 ? 3 : 2).replace(".", ","), px(xt), py(0) + 5);
        }
        c.textAlign = "right";
        c.textBaseline = "middle";
        c.fillText("0", G.x - 8, py(0));
        c.font = "500 13px " + SKRIFT;
        c.fillStyle = "#e2c46e";
        c.fillText("K", G.x - 8, py(K));
        c.fillStyle = "#dfe6ee";
        c.textAlign = "left";
        c.textBaseline = "alphabetic";
        c.fillText("Y", G.x - 14, G.y - 2 < 12 ? 12 : G.y + 2);
        c.textAlign = "right";
        c.fillText("x / M", G.x + G.w, py(0) + 34);
    };

    NK.SimBeholder = SimBeholder;
}());
