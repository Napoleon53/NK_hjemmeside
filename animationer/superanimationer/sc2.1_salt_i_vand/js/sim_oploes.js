/* =====================================================================
   sim_oploes.js - fane 1: hvad vandet goer ved krystallen

   Til venstre staar et baegerglas paa en varmeplade med et saltkorn i
   bunden. Lupen viser et udsnit af kornet, ion for ion: vandmolekylerne
   finder en ion i overfladen, vender den rigtige ende ind mod den, og
   naar fire har fat, river de den loes og bliver siddende om den som
   dens vandskal.

   Tre ting bestemmer forloebet:
     temperaturen    - hvor hurtigt vandmolekylerne arbejder
     omroeringen     - knuser krystallen i stykker, saa flere hold af
                       vandmolekyler kan arbejde paa én gang
     oploeseligheden - hvor mange ioner der overhovedet kan komme ud,
                       foer vandet ikke kan rumme mere (D.frieIoner)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegn;
    var S = NK.Sprites;

    var PAAKRAEVET = 4;          /* saa mange skal have fat, foer ionen slipper */
    var RAEKKER = 5;
    var MAKS_HOLD = 4;           /* hold af vandmolekyler, der kan arbejde paa én gang */
    var MAKS_SYNLIGE = 7;        /* frie ioner i lupen, foer de aeldste driver videre ud i glasset */
    var FART_ENHED = 34;         /* hastighederne er afstemt til en celle paa 34 px */
    var GRAENSE_SEK = 25;        /* opgaven "hurtigst": se README for, hvordan tallet er fundet */

    /* De fire pladser om en ion ligger alle paa den aabne side af den. */
    var PLADS_VINKLER = [-0.95, -0.32, 0.32, 0.95];

    /* De tre knapper. temp er den temperatur, oploeseligheden slaas op ved. */
    var TEMPERATURER = [
        { id: "kold",   navn: "Koldt",   tegn: "❄️", temp: 5,  fart: 0.55 },
        { id: "lunken", navn: "Lunkent", tegn: "💧", temp: 20, fart: 1.00 },
        { id: "varm",   navn: "Varmt",   tegn: "🔥", temp: 70, fart: 1.95 }
    ];

    /* Omroeringen knuser krystallen i tre omgange. Hvert snit deler de
       stykker, der er, efter ionens plads i gitteret (k = antal kolonner).
       efter er sekunder med omroering, foer snittet sker. */
    var SNIT = [
        { efter: 1.0, del: function (o, k) { return o.c < k / 2; } },
        { efter: 4.0, del: function (o) { return o.r < 2; } },
        { efter: 8.0, del: function (o, k) { return (o.c % (k / 2)) < k / 4; } }
    ];

    NK.SimOploes = function () {
        this.L = new NK.Laerred(NK.el("oploes-laerred"));
        this.tempValg = TEMPERATURER[1];
        this.visDelta = true;
        this.omroering = false;
        this.roerStyrke = 0;         /* 0-1: stroemmen tager lidt tid om at starte og stoppe */
        this.roerFase = 0;
        this.ioner = [];
        this.vand = [];
        this.baggrund = [];
        this.stykker = {};
        this.bygget = "";
        this.opgaver = null;

        this.koblPanel();
        this.koblMus();
        NK.Valg.paa(this.nulstil.bind(this));
        this.nulstil();
        this.opgaver = new NK.Opgaver("oploes", OPGAVER, this);
        this.opdaterPanel();
    };

    var P = NK.SimOploes.prototype;

    /* Til selvtesten */
    NK.SimOploes.GRAENSE_SEK = GRAENSE_SEK;
    NK.SimOploes.MAKS_SYNLIGE = MAKS_SYNLIGE;

    /* ----- Panelet ------------------------------------------------------ */
    P.koblPanel = function () {
        var mig = this;

        NK.Valg.byg(NK.el("oploes-saltvalg"));

        var vaert = NK.el("oploes-temp");
        this.tempKnapper = [];
        TEMPERATURER.forEach(function (t) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "tilstandsknap" + (t.id === mig.tempValg.id ? " aktiv" : "");
            b.textContent = t.tegn + " " + t.navn;
            b.addEventListener("click", function () { mig.saetTemp(t); });
            vaert.appendChild(b);
            mig.tempKnapper.push({ el: b, id: t.id });
        });

        var roer = NK.el("oploes-roer");
        this.roerKnapper = [];
        [{ til: false, tekst: "Står stille" }, { til: true, tekst: "🌀 Omrøring" }].forEach(function (r) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "tilstandsknap" + (r.til === mig.omroering ? " aktiv" : "");
            b.textContent = r.tekst;
            b.addEventListener("click", function () { mig.saetOmroering(r.til); });
            roer.appendChild(b);
            mig.roerKnapper.push({ el: b, til: r.til });
        });

        NK.el("oploes-nulstil").addEventListener("click", function () { mig.nulstil(); });
        NK.el("oploes-delta").addEventListener("change", function (e) {
            mig.visDelta = e.target.checked;
        });
    };

    P.saetTemp = function (t) {
        this.tempValg = t;
        for (var i = 0; i < this.tempKnapper.length; i++) {
            this.tempKnapper[i].el.classList.toggle("aktiv", this.tempKnapper[i].id === t.id);
        }
    };

    P.saetOmroering = function (til) {
        this.omroering = !!til;
        for (var i = 0; i < this.roerKnapper.length; i++) {
            this.roerKnapper[i].el.classList.toggle("aktiv", this.roerKnapper[i].til === this.omroering);
        }
    };

    /* Et klik i billedet gaar kun til opgaven (fx "find fejlen"). */
    P.koblMus = function () {
        var mig = this;
        var c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            if (!mig.opgaver) return;
            var r = c.getBoundingClientRect();
            if (mig.opgaver.klik(e.clientX - r.left, e.clientY - r.top)) e.preventDefault();
        });
    };

    /* ----- Krystallen ---------------------------------------------------- */
    /* Moensteret gentager sig med p + n felter pr. raekke og er forskudt én
       plads for hver raekke. Med et lige antal felter pr. raekke giver det
       praecis forholdet i formlen: 1:1 bliver et skakbraet, 1:2 bliver to
       negative for hver positiv. */
    P.byg = function () {
        var salt = NK.Valg.salt();
        var k = salt.p + salt.n;
        var kolonner = k * Math.max(2, Math.round(6 / k));

        this.ioner = [];
        this.optaget = {};           /* "r:c" -> nummeret paa det stykke, ionen sidder i */
        this.kolonner = kolonner;
        this.raekker = RAEKKER;

        for (var r = 0; r < RAEKKER; r++) {
            for (var c = 0; c < kolonner; c++) {
                var positiv = (c + r) % k < salt.p;
                this.ioner.push({
                    r: r, c: c,
                    ion: D.ion(positiv ? salt.kat : salt.an),
                    tilstand: "fast",        /* fast, paavej, fri, ud, vaek */
                    stykke: 0,
                    x: 0, y: 0, hvileX: 0, hvileY: 0,
                    maalX: 0, maalY: 0, vx: 0, vy: 0,
                    baerere: [], reserveret: 0,
                    skal: null, skalfase: 0, alder: 0, alpha: 1
                });
                this.optaget[r + ":" + c] = 0;
            }
        }

        this.stykker = { 0: { dx: 0, dy: 0, mdx: 0, mdy: 0 } };
        this.stykkeOrden = [0];
        this.naesteStykke = 1;
        this.knusTrin = 0;
        this.roerTid = 0;
        this.knaekUr = 0;

        this.vand = [];
        this.baggrund = [];
        for (var j = 0; j < 30; j++) {
            this.baggrund.push({
                x: Math.random(), y: Math.random(),
                fx: (Math.random() - 0.5) * 12,
                fy: (Math.random() - 0.5) * 12,
                vinkel: Math.random() * Math.PI * 2,
                drej: (Math.random() - 0.5) * 0.5,
                skala: 0.45 + Math.random() * 0.25
            });
        }

        this.bygget = salt.id;
        this.frie = 0;
        this.paabegyndt = 0;         /* frie + dem, der er ved at blive revet loes */
        this.tid = 0;
        this.slutTid = null;
        this.pause = false;
        this.pauseUr = 0;
        this.hvil = false;
        this.celle = 0;
        this.layout(true);
        this.justerHold();
    };

    P.nulstil = function () {
        this.byg();
    };

    /* ----- Maal ----------------------------------------------------------- */
    P.layout = function (flytAlt) {
        var L = this.L;
        var kant = 14;
        var gammelCelle = this.celle;

        this.bred = L.b >= 700;
        if (this.bred) {
            this.makroB = NK.klamp(L.b * 0.19, 150, 230);
            this.zoom = { x: this.makroB + 30, y: kant,
                          b: Math.max(100, L.b - this.makroB - 30 - kant), h: Math.max(100, L.h - 2 * kant) };
        } else {
            this.makroB = NK.klamp(L.b * 0.28, 96, 140);
            this.zoom = { x: kant, y: kant, b: Math.max(100, L.b - 2 * kant), h: Math.max(100, L.h - 2 * kant) };
        }
        var z = this.zoom;
        this.glasX = z.x;
        this.glasB = z.b;
        this.overflade = z.y + 4;
        this.gulv = z.y + z.h - 16;

        /* Cellen skal kunne rumme den knuste krystal side om side paa
           bunden og levne plads over den til de frie ioner. */
        var celleB = z.b / (2 * this.kolonner + 3);
        var celleH = (z.h * 0.40) / this.raekker;
        this.celle = NK.klamp(Math.min(celleB, celleH), 14, 60);
        this.vandSkala = this.celle / 38;

        var bredde = this.celle * this.kolonner;
        this.gitterX = z.x + (z.b - bredde) / 2 + this.celle / 2;
        this.gitterY = this.gulv - this.celle * this.raekker + this.celle / 2;
        this.gitterTop = this.gitterY - this.celle / 2;

        var luft = this.celle * 1.3;
        this.frit = {
            x0: z.x + luft, x1: z.x + z.b - luft,
            y0: this.overflade + luft,
            y1: Math.max(this.overflade + luft + 20, this.gitterTop - this.celle * 0.9)
        };

        this.layoutMakro();

        var i;
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            o.hvileX = this.gitterX + o.c * this.celle;
            o.hvileY = this.gitterY + o.r * this.celle;
        }
        this.placerStykker(true);
        for (i = 0; i < this.ioner.length; i++) {
            var p = this.ioner[i];
            if (p.tilstand === "fast") {
                var st = this.stykker[p.stykke];
                p.x = p.hvileX + st.dx;
                p.y = p.hvileY + st.dy;
            } else if (flytAlt && (p.tilstand === "fri" || p.tilstand === "paavej")) {
                p.x = NK.klamp(p.x, this.frit.x0, this.frit.x1);
                p.y = NK.klamp(p.y, this.frit.y0, this.frit.y1);
                p.maalX = NK.klamp(p.maalX, this.frit.x0, this.frit.x1);
                p.maalY = NK.klamp(p.maalY, this.frit.y0, this.frit.y1);
            }
        }

        var forhold = gammelCelle ? this.celle / gammelCelle : 1;
        for (var j = 0; j < this.vand.length; j++) {
            var v = this.vand[j];
            v.afX *= forhold;
            v.afY *= forhold;
            if (v.tilstand === "hjemme") {
                this.nytHjem(v);
                v.x = v.hjemX;
                v.y = v.hjemY;
            } else if (v.tilstand === "fast" && v.maal) {
                v.x = v.maal.x + v.afX;
                v.y = v.maal.y + v.afY;
            }
        }
    };

    /* Glasset, pladen og lupen til venstre (eller i hjoernet paa en smal skaerm). */
    P.layoutMakro = function () {
        var MB = S.MAAL.baegerglas, MP = S.MAAL.varmeplade, MT = S.MAAL.termometer;
        var m = {};
        m.bw = this.makroB * (this.bred ? 0.74 : 0.7);
        m.s = m.bw / MB.b;
        m.hoejde = m.bw * 231 / MB.b + m.bw * 1.2 * MP.h / MP.b;
        if (this.bred) {
            m.x = (this.makroB - m.bw) / 2 + 8;
            m.y = this.L.h / 2 - m.hoejde / 2 + 10;
        } else {
            m.boks = { x: this.zoom.x + 8, y: this.zoom.y + 8, b: this.makroB, h: m.hoejde + 34 };
            m.x = m.boks.x + (m.boks.b - m.bw) / 2;
            m.y = m.boks.y + 22;
        }
        m.glasX = m.x + MB.indV * m.s;
        m.glasB = (MB.indH - MB.indV) * m.s;
        m.bund = m.y + MB.bund * m.s;
        m.overflade = m.y + MB.ml100 * m.s;
        m.pladeB = m.bw * 1.2;
        m.pladeX = m.x + m.bw / 2 - m.pladeB / 2;
        m.pladeY = m.y + 231 * m.s;

        m.kornX = m.glasX + m.glasB * 0.74;
        m.lupR = m.bw * 0.17;
        m.lupX = m.kornX;
        m.lupY = m.bund - m.lupR * 0.75;
        m.roerX = m.glasX + m.glasB * 0.36;

        m.termoH = (MB.bund - 6 + 14) * m.s;
        m.termoB = m.termoH * MT.b / MT.h;
        m.termoX = m.glasX + 4 * m.s;
        m.termoY = m.y - 14 * m.s;
        this.makro = m;
    };

    /* Stykkerne af krystallen ligger side om side paa bunden. Et stykke,
       der ikke naar ned til bunden, falder ned ved siden af de andre. */
    P.placerStykker = function (straks) {
        var info = {}, liste = [], id, i;
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand !== "fast") continue;
            var f = info[o.stykke];
            if (!f) f = info[o.stykke] = { id: o.stykke, minC: 99, maxC: -1, maxR: -1 };
            f.minC = Math.min(f.minC, o.c);
            f.maxC = Math.max(f.maxC, o.c);
            f.maxR = Math.max(f.maxR, o.r);
        }
        for (id in info) {
            if (Object.prototype.hasOwnProperty.call(info, id)) liste.push(info[id]);
        }

        var mig = this, k = this.kolonner, c = this.celle, z = this.zoom;
        liste.forEach(function (f) {
            var midt = (f.minC + f.maxC) / 2;
            var falder = f.maxR < mig.raekker - 1;
            f.noegle = midt + (falder ? (midt < (k - 1) / 2 ? -0.5 : 0.5) : 0);
        });
        liste.sort(function (a, b) { return a.noegle - b.noegle; });

        var total = 0;
        liste.forEach(function (f) { total += (f.maxC - f.minC + 1) * c; });
        var n = liste.length;
        var mellem = n > 1 ? NK.klamp((z.b * 0.9 - total) / (n + 1), 3, c * 1.1) : 0;
        var x = z.x + (z.b - total - mellem * (n - 1)) / 2;

        this.stykkeOrden = [];
        liste.forEach(function (f) {
            var st = mig.stykker[f.id];
            if (!st) st = mig.stykker[f.id] = { dx: 0, dy: 0, mdx: 0, mdy: 0 };
            st.mdx = x - (mig.gitterX + f.minC * c - c / 2);
            st.mdy = (mig.raekker - 1 - f.maxR) * c;
            if (straks) { st.dx = st.mdx; st.dy = st.mdy; }
            x += (f.maxC - f.minC + 1) * c + mellem;
            mig.stykkeOrden.push(f.id);
        });
    };

    P.tilpas = function () {
        if (this.L.tilpas()) this.layout(true);
    };

    /* ----- Vandmolekylerne -------------------------------------------------- */
    function nytVand() {
        return {
            x: 0, y: 0, hjemX: 0, hjemY: 0,
            vinkel: Math.random() * Math.PI * 2, tilstand: "hjemme",
            maal: null, plads: 0, afX: 0, afY: 0,
            fade: 1                           /* toner op, naar molekylet er nyt et sted */
        };
    }

    /* Et nyt sted at svoemme hen, spredt tilfaeldigt ud over det frie vand. */
    P.nytHjem = function (v) {
        var f = this.frit;
        v.hjemX = f.x0 + Math.random() * Math.max(10, f.x1 - f.x0);
        v.hjemY = f.y0 + Math.random() * Math.max(10, f.y1 - f.y0);
    };

    /* Et molekyle, der er faerdigt, toner op et nyt, tilfaeldigt sted.
       Naar det har baaret en ion ud, er det de samme molekyler, der bliver
       siddende om ionen (se slipFri) - der er vand overalt i glasset, og
       et nyt molekyle tager over. */
    P.sendVaek = function (v) {
        this.nytHjem(v);
        v.x = v.hjemX;
        v.y = v.hjemY;
        v.maal = null;
        v.tilstand = "hjemme";
        v.vinkel = Math.random() * Math.PI * 2;
        v.fade = 0;
    };

    P.antalStykker = function () {
        var set = {}, n = 0;
        for (var i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand === "fast" && !set[o.stykke]) { set[o.stykke] = true; n++; }
        }
        return n;
    };

    /* Jo flere stykker, jo flere steder kan vandet tage fat paa én gang:
       to hold pr. stykke, hoejst MAKS_HOLD. Molekyler, der ikke laengere
       er brug for, fjernes kun, mens de ikke arbejder. */
    P.justerHold = function () {
        var hold = NK.klamp(2 * this.antalStykker(), 2, MAKS_HOLD);
        var oensket = hold * PAAKRAEVET;
        while (this.vand.length < oensket) {
            var v = nytVand();
            this.sendVaek(v);
            this.vand.push(v);
        }
        for (var i = this.vand.length - 1; i >= 0 && this.vand.length > oensket; i--) {
            if (this.vand[i].tilstand === "hjemme") this.vand.splice(i, 1);
        }
    };

    /* ----- Hvem kan angribes? --------------------------------------------- */
    /* De sider af en ion, der vender ud mod vandet. Bunden af glasset
       taeller ikke som vand. Retningen er gennemsnittet af de aabne sider. */
    P.aabning = function (o) {
        var s = o.stykke, op = this.optaget, sx = 0, sy = 0, n = 0;
        var tom = function (r, c) {
            var v = op[r + ":" + c];
            return v === undefined || v !== s;
        };
        if (tom(o.r - 1, o.c)) { sy -= 1; n++; }
        if (tom(o.r, o.c - 1)) { sx -= 1; n++; }
        if (tom(o.r, o.c + 1)) { sx += 1; n++; }
        var st = this.stykker[s];
        var underkant = o.hvileY + (st ? st.dy : 0) + this.celle * 1.5;
        if (tom(o.r + 1, o.c) && underkant < this.gulv + 1) { sy += 1; n++; }
        return { n: n, vinkel: (sx === 0 && sy === 0) ? -Math.PI / 2 : Math.atan2(sy, sx) };
    };

    /* Kun ioner i overfladen: en ion inde midt i krystallen er daekket paa
       alle sider, og der er ikke plads til vand omkring den. */
    P.iOverfladen = function (o) {
        return this.aabning(o).n > 0;
    };

    P.maxFrie = function () {
        return D.frieIoner(NK.Valg.salt(), this.tempValg.temp);
    };

    P.faerdig = function () {
        return this.tilbage() === 0 || this.frie >= this.maxFrie();
    };

    P.tilbage = function () {
        var n = 0;
        for (var i = 0; i < this.ioner.length; i++) if (this.ioner[i].tilstand === "fast") n++;
        return n;
    };

    P.synligeFrie = function () {
        var n = 0;
        for (var i = 0; i < this.ioner.length; i++) if (this.ioner[i].tilstand === "fri") n++;
        return n;
    };

    /* Den ion, der er naermest og allerede har flest vandmolekyler paa vej -
       saa bliver en paabegyndt ion faerdig, i stedet for at mange ioner
       staar halvfaerdige paa én gang. */
    P.naermesteFrie = function (v) {
        for (var mangler = PAAKRAEVET - 1; mangler >= 0; mangler--) {
            var bedst = null, bedstAfstand = Infinity;
            for (var i = 0; i < this.ioner.length; i++) {
                var o = this.ioner[i];
                if (o.tilstand !== "fast" || o.reserveret !== mangler) continue;
                if (!this.iOverfladen(o)) continue;
                var d = Math.hypot(o.x - v.x, o.y - v.y);
                if (d < bedstAfstand) { bedstAfstand = d; bedst = o; }
            }
            if (bedst) return bedst;
        }
        return null;
    };

    /* ----- Omroeringen ------------------------------------------------------ */
    /* En enkelt hvirvel, der fylder hele lupen: vandet loeber mod hoejre
       foroven og mod venstre forneden. Den er tegnet, saa intet vand
       loeber ud gennem kanterne. */
    P.stroem = function (x, y) {
        var z = this.zoom;
        var W = z.b, H = Math.max(1, this.gulv - z.y);
        var u = (x - z.x) / W, w = (y - z.y) / H;
        var A = 70 * this.roerStyrke;
        return [
            A * Math.sin(Math.PI * u) * Math.cos(Math.PI * w),
            -A * (H / W) * Math.cos(Math.PI * u) * Math.sin(Math.PI * w)
        ];
    };

    /* Ét snit gennem alle stykkerne. De nye stykker starter, hvor det
       gamle laa, og glider saa paa plads. */
    P.knus = function () {
        var snit = SNIT[this.knusTrin++];
        var k = this.kolonner, mig = this;
        var gamle = this.stykker, nye = {}, noegler = {};

        this.ioner.forEach(function (o) {
            if (o.tilstand !== "fast") return;
            var noegle = o.stykke + (snit.del(o, k) ? "a" : "b");
            if (!(noegle in noegler)) {
                var id = mig.naesteStykke++;
                noegler[noegle] = id;
                var g = gamle[o.stykke];
                nye[id] = { dx: g.dx, dy: g.dy, mdx: g.dx, mdy: g.dy };
            }
            o.stykke = noegler[noegle];
            mig.optaget[o.r + ":" + o.c] = o.stykke;
        });

        this.stykker = nye;
        this.placerStykker(false);
        this.knaekUr = 0.6;
        this.justerHold();
    };

    /* ----- Opdatering ------------------------------------------------------ */
    P.opdater = function (dt) {
        if (this.bygget !== NK.Valg.saltId) this.byg();

        if (this.pauseUr > 0) {
            this.pauseUr -= dt;
            if (this.pauseUr <= 0) {
                this.pauseUr = 0;
                this.pause = false;
                this.hvil = false;
                this.rydFejl();
            }
        }
        if (this.pause) {
            if (this.opgaver) this.opgaver.opdater();
            this.opdaterPanel();
            return;
        }

        var i, id;
        var z = this.zoom;
        this.roerStyrke = NK.mod(this.roerStyrke, this.omroering ? 1 : 0, 1.6, dt);
        this.roerFase += dt * 16 * this.roerStyrke;
        var fart = this.tempValg.fart * (1 + 0.15 * this.roerStyrke);
        var enhed = this.celle / FART_ENHED;

        if (!this.faerdig()) { this.tid += dt; this.slutTid = null; }
        else if (this.slutTid === null) this.slutTid = this.tid;

        if (this.omroering && this.knusTrin < SNIT.length && this.tilbage() > 0) {
            this.roerTid += dt;
            if (this.roerTid >= SNIT[this.knusTrin].efter) this.knus();
        }
        if (this.knaekUr > 0) this.knaekUr -= dt;

        for (id in this.stykker) {
            if (!Object.prototype.hasOwnProperty.call(this.stykker, id)) continue;
            var st = this.stykker[id];
            st.dx = NK.mod(st.dx, st.mdx, 4, dt);
            st.dy = NK.mod(st.dy, st.mdy, 6, dt);
        }

        this.justerHold();

        /* Ionerne */
        var rysten = (0.5 + fart * 0.9) * Math.max(1, enhed * 0.7);
        var synlige = 0, aeldste = null;
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand === "fast") {
                var s = this.stykker[o.stykke];
                o.x = o.hvileX + s.dx + (Math.random() - 0.5) * rysten;
                o.y = o.hvileY + s.dy + (Math.random() - 0.5) * rysten;
            } else if (o.tilstand === "paavej") {
                var dx = o.maalX - o.x, dy = o.maalY - o.y;
                var d = Math.hypot(dx, dy);
                var skridt = 95 * fart * enhed * dt;
                if (d > skridt) {
                    o.x += (dx / d) * skridt;
                    o.y += (dy / d) * skridt;
                } else {
                    this.slipFri(o);
                }
            } else if (o.tilstand === "fri" || o.tilstand === "ud") {
                var sp = this.stroem(o.x, o.y);
                o.x += (o.vx * fart * enhed + sp[0]) * dt;
                o.y += (o.vy * fart * enhed + sp[1]) * dt;
                o.skalfase += dt * 0.35;
                o.alder += dt;
                this.slapSkal(o, dt);
                if (o.tilstand === "fri") {
                    var f = this.frit;
                    if (o.x < f.x0) { o.x = f.x0; o.vx = Math.abs(o.vx); }
                    if (o.x > f.x1) { o.x = f.x1; o.vx = -Math.abs(o.vx); }
                    if (o.y < f.y0) { o.y = f.y0; o.vy = Math.abs(o.vy); }
                    if (o.y > f.y1) { o.y = f.y1; o.vy = -Math.abs(o.vy); }
                    synlige++;
                    if (!aeldste || o.alder > aeldste.alder) aeldste = o;
                } else {
                    o.alpha -= dt / 2.2;
                    if (o.alpha <= 0) { o.alpha = 0; o.tilstand = "vaek"; }
                }
            }
        }

        this.skubFra(dt);

        /* Er der for mange frie ioner i lupen, driver den aeldste videre ud
           i resten af glasset. Den er stadig opløst - den er bare ikke
           laengere i det lille udsnit, lupen viser. */
        if (synlige > MAKS_SYNLIGE && aeldste) {
            aeldste.tilstand = "ud";
            aeldste.vx = (aeldste.x < z.x + z.b / 2 ? -1 : 1) * 55;
            aeldste.vy = -18;
        }

        /* Vandmolekylerne */
        for (i = 0; i < this.vand.length; i++) this.opdaterVand(this.vand[i], 190 * fart * enhed * dt, dt);

        /* Baggrundsvandet */
        for (i = 0; i < this.baggrund.length; i++) {
            var g = this.baggrund[i];
            var sg = this.stroem(z.x + g.x * z.b, z.y + g.y * z.h);
            g.x += (g.fx * fart + sg[0]) * dt / z.b;
            g.y += (g.fy * fart + sg[1]) * dt / z.h;
            g.vinkel += g.drej * dt * fart;
            if (g.x < -0.05) g.x = 1.05; else if (g.x > 1.05) g.x = -0.05;
            if (g.y < -0.05) g.y = 1.05; else if (g.y > 1.05) g.y = -0.05;
        }

        if (this.opgaver) this.opgaver.opdater();
        this.opdaterPanel();
    };

    /* De frie ioner skubber blidt til hinanden, saa vandskallerne ikke
       ligger oven i hinanden. */
    P.skubFra = function (dt) {
        var frie = this.ioner.filter(function (o) { return o.tilstand === "fri"; });
        var ekstra = 78 * this.vandSkala, k = Math.min(1, dt * 8);
        for (var i = 0; i < frie.length; i++) {
            for (var j = i + 1; j < frie.length; j++) {
                var a = frie[i], b = frie[j];
                var dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
                var min = this.ionRadius(a) + this.ionRadius(b) + ekstra;
                if (d >= min) continue;
                var skub = (min - d) * k / 2;
                dx /= d; dy /= d;
                a.x -= dx * skub; a.y -= dy * skub;
                b.x += dx * skub; b.y += dy * skub;
            }
        }
    };

    P.opdaterVand = function (v, skridt, dt) {
        var o = v.maal;

        if (v.fade < 1) v.fade = Math.min(1, v.fade + dt * 3);

        switch (v.tilstand) {
        case "hjemme": {
            /* hvil: opgaven "find fejlen" venter paa et roligt billede, saa
               der startes ikke paa nye ioner imens. */
            o = this.tilbage() === 0 || this.hvil ? null : this.naermesteFrie(v);
            /* En ion, der ikke er begyndt endnu, taeller med i graensen med
               det samme. Ellers ville de ioner, der allerede er i gang,
               naa at komme ud, efter graensen var naaet - og et
               tungtoploeseligt salt ville slippe flere ioner end det maa. */
            if (o && o.reserveret === 0) {
                if (this.paabegyndt >= this.maxFrie()) o = null;
                else this.paabegyndt++;
            }
            if (o) {
                v.plads = o.reserveret;
                o.reserveret++;
                v.maal = o;
                v.tilstand = "soeger";
            } else {
                v.vinkel += 0.25 * dt;
                var sp = this.stroem(v.x, v.y);
                v.x = NK.klamp(v.x + sp[0] * dt * 0.6, this.frit.x0, this.frit.x1);
                v.y = NK.klamp(v.y + sp[1] * dt * 0.6, this.frit.y0, this.frit.y1);
            }
            break;
        }

        case "soeger": {
            if (!o || o.tilstand !== "fast") { this.sendVaek(v); break; }
            var positiv = o.ion.q > 0;
            var vinkel = this.aabning(o).vinkel + PLADS_VINKLER[v.plads % PLADS_VINKLER.length];
            var afstand = this.ionRadius(o) + (positiv ? 12 : 7) * this.vandSkala * 1.08;
            var maalX = o.x + Math.cos(vinkel) * afstand;
            var maalY = o.y + Math.sin(vinkel) * afstand;
            var dx = maalX - v.x, dy = maalY - v.y;
            var d = Math.hypot(dx, dy);

            v.vinkel = T.vendMod(v.x, v.y, o.x, o.y, positiv);

            if (d > skridt) {
                v.x += (dx / d) * skridt;
                v.y += (dy / d) * skridt;
            } else {
                v.x = maalX; v.y = maalY;
                v.afX = v.x - o.x;
                v.afY = v.y - o.y;
                v.tilstand = "fast";
                o.baerere.push(v);
                if (o.baerere.length >= PAAKRAEVET) this.rivLoes(o);
            }
            break;
        }

        case "fast":
            if (!o) { this.sendVaek(v); break; }
            v.x = o.x + v.afX;
            v.y = o.y + v.afY;
            v.vinkel = T.vendMod(v.x, v.y, o.x, o.y, o.ion.q > 0);
            break;
        }
    };

    P.rivLoes = function (o) {
        o.tilstand = "paavej";
        delete this.optaget[o.r + ":" + o.c];
        this.frie++;
        var f = this.frit;
        o.maalX = f.x0 + Math.random() * Math.max(10, f.x1 - f.x0);
        o.maalY = f.y0 + Math.random() * Math.max(10, f.y1 - f.y0);
        this.faldNed();
    };

    /* Er den nederste raekke i et stykke gaaet i opløsning, falder resten
       af stykket ned paa bunden. Stykkerne flytter sig kun lodret, saa de
       ikke glider rundt, mens vandet arbejder paa dem. */
    P.faldNed = function () {
        var nederst = {}, i, id;
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand !== "fast") continue;
            nederst[o.stykke] = Math.max(nederst[o.stykke] === undefined ? -1 : nederst[o.stykke], o.r);
        }
        for (id in nederst) {
            if (Object.prototype.hasOwnProperty.call(nederst, id) && this.stykker[id]) {
                this.stykker[id].mdy = (this.raekker - 1 - nederst[id]) * this.celle;
            }
        }
    };

    /* Ionen er ude i vandet. De molekyler, der bar den ud, bliver siddende
       som dens vandskal - praecis dér, hvor de sad - og glider saa jaevnt
       ud hele vejen rundt. Arbejdsmolekylerne selv starter forfra et andet
       sted, saa et nyt hold kan tage over. */
    P.slipFri = function (o) {
        o.x = o.maalX;
        o.y = o.maalY;
        o.tilstand = "fri";
        o.alder = 0;
        o.skalfase = 0;

        var vinkler = o.baerere.map(function (v) { return Math.atan2(v.y - o.y, v.x - o.x); });
        var sx = 0, sy = 0;
        vinkler.forEach(function (a) { sx += Math.cos(a); sy += Math.sin(a); });
        var midt = Math.atan2(sy, sx);
        var afvig = vinkler.map(function (a) {
            var dv = a - midt;
            while (dv > Math.PI) dv -= Math.PI * 2;
            while (dv < -Math.PI) dv += Math.PI * 2;
            return dv;
        }).sort(function (a, b) { return a - b; });

        var n = afvig.length;
        o.skal = afvig.map(function (dv, i) {
            return { vinkel: midt + dv, maal: midt + (i - (n - 1) / 2) * (Math.PI * 2 / n), forkert: false, ring: null };
        });

        for (var b = 0; b < o.baerere.length; b++) this.sendVaek(o.baerere[b]);
        o.baerere = [];
        o.vx = (Math.random() - 0.5) * 26;
        o.vy = (Math.random() - 0.5) * 26;
    };

    P.slapSkal = function (o, dt) {
        if (!o.skal) return;
        var t = 1 - Math.exp(-1.6 * dt);
        for (var i = 0; i < o.skal.length; i++) {
            o.skal[i].vinkel += (o.skal[i].maal - o.skal[i].vinkel) * t;
        }
    };

    P.ionRadius = function (o) {
        return this.celle * 0.40 * o.ion.r;
    };

    /* ----- Hjaelp til opgaverne ---------------------------------------------- */
    /* Lader tiden gaa uden at tegne, til betingelsen er opfyldt. */
    P.spolFrem = function (betingelse, maksSek) {
        for (var t = 0; t < maksSek; t += 0.05) {
            this.opdater(0.05);
            if (betingelse()) return true;
        }
        return false;
    };

    /* Vender ét molekyle i en vandskal forkert. */
    P.vaelgFejl = function () {
        var kandidater = this.ioner.filter(function (o) {
            return o.tilstand === "fri" && o.skal && o.skal.length;
        });
        if (!kandidater.length) return null;
        var o = NK.tilfaeldig(kandidater);
        var nr = Math.floor(Math.random() * o.skal.length);
        o.skal[nr].forkert = true;
        return { ion: o, nr: nr };
    };

    P.rydFejl = function () {
        for (var i = 0; i < this.ioner.length; i++) {
            var s = this.ioner[i].skal;
            if (!s) continue;
            for (var j = 0; j < s.length; j++) { s[j].forkert = false; s[j].ring = null; }
        }
    };

    /* Det vandmolekyle, der ligger under et klik: i en vandskal eller et
       af arbejdsmolekylerne. */
    P.vandVed = function (x, y) {
        var bedst = null, bedstAfstand = Infinity, i, j;
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (!o.skal || (o.tilstand !== "fri" && o.tilstand !== "ud") || o.alpha < 0.5) continue;
            var r = this.ionRadius(o);
            for (j = 0; j < o.skal.length; j++) {
                var s = o.skal[j];
                var p = T.skalVand(null, o.x, o.y, r, s.vinkel + o.skalfase, this.vandSkala, o.ion.q > 0, { forkert: s.forkert });
                var d = Math.hypot(p.x - x, p.y - y);
                if (d < p.r && d < bedstAfstand) { bedstAfstand = d; bedst = { ion: o, nr: j }; }
            }
        }
        for (i = 0; i < this.vand.length; i++) {
            var v = this.vand[i];
            var dv = Math.hypot(v.x - x, v.y - y);
            if (dv < 20 * this.vandSkala && dv < bedstAfstand) { bedstAfstand = dv; bedst = { vand: v }; }
        }
        return bedst;
    };

    /* ----- Panelteksten ----------------------------------------------------- */
    P.opdaterPanel = function () {
        var salt = NK.Valg.salt();
        var tung = D.erTung(salt);
        var loest = D.oploeselighed(salt, this.tempValg.temp);

        /* Under opgaven om ligningen staar kun venstresiden. */
        var opg = this.opgaver && this.opgaver.igang() ? this.opgaver.opgave : null;
        var ligningHTML = opg && opg.skjulLigning
            ? '<span class="fast">' + D.venstreLed(salt) + '</span><span class="pil">→</span> ?'
            : D.ligningHTML(salt);
        if (this._sidsteLigning !== ligningHTML) {
            NK.saetHTML("oploes-ligning", ligningHTML);
            NK.tilpasEnLinje("oploes-ligning");
            this._sidsteLigning = ligningHTML;
        }
        NK.saetTekst("oploes-navn", salt.navn);
        NK.saetTekst("oploes-hverdag", salt.hverdag);
        NK.saetTekst("oploes-type", tung ? "tungtopløseligt" : "letopløseligt");
        NK.saetKlasse("oploes-type", "maerke " + (tung ? "orange" : "groen"));
        NK.saetTekst("oploes-graense", NK.gram(loest) + " g pr. 100 mL");

        var besked, klasse = "besked";
        if (this.tilbage() === 0) {
            besked = "Hele krystallen er væk. Alle ionerne er nu " + D.ionTekst(D.ion(salt.kat)) +
                     "(aq) og " + D.ionTekst(D.ion(salt.an)) + "(aq).";
            klasse = "besked god";
        } else if (this.frie >= this.maxFrie()) {
            besked = "Der går ikke mere i opløsning. Resten bliver liggende som bundfald.";
            klasse = "besked gul";
        } else if (this.frie === 0) {
            besked = "Vandmolekylerne søger hen til krystallens overflade.";
        } else {
            besked = "Vandet river ionerne løs udefra og ind.";
        }
        NK.saetTekst("oploes-besked", besked);
        NK.saetKlasse("oploes-besked", klasse);

        NK.saetTekst("oploes-status", this.statusTekst(tung));
    };

    P.statusTekst = function (tung) {
        if (this.pause) return "Billedet står stille, mens du leder.";
        if (this.tilbage() === 0) return "Alt saltet er opløst.";
        if (this.frie >= this.maxFrie()) {
            return tung
                ? "Mættet: der er kun plads til nogle ganske få ioner i vandet."
                : "Vandet kan ikke opløse mere.";
        }
        if (this.knusTrin > 0) return "Krystallen er knust. Flere vandmolekyler kan tage fat på én gang.";
        return "Vandmolekylerne vender den rigtige ende ind mod ionerne og river dem løs.";
    };

    /* ----- Tegning ------------------------------------------------------------ */
    P.tegn = function () {
        var L = this.L, ctx = L.ctx;
        L.ryd("#10131a");
        var salt = NK.Valg.salt();

        this.tegnLupbillede(ctx, salt);
        if (this.bred) {
            this.tegnMakro(ctx, salt);
            this.tegnLupLinjer(ctx);
        } else {
            var bx = this.makro.boks;
            ctx.save();
            ctx.fillStyle = "rgba(16, 19, 26, 0.9)";
            NK.rundtRekt(ctx, bx.x, bx.y, bx.b, bx.h, 10);
            ctx.fill();
            ctx.strokeStyle = "rgba(201, 211, 222, 0.3)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
            this.tegnMakro(ctx, salt);
        }
        this.tegnLup(ctx);
    };

    /* Det, lupen viser: vand, krystalstykker, ioner og vandmolekyler. */
    P.tegnLupbillede = function (ctx, salt) {
        var z = this.zoom, vs = this.vandSkala, i, j;

        ctx.save();
        NK.rundtRekt(ctx, z.x, z.y, z.b, z.h, 16);
        var vg = ctx.createLinearGradient(0, z.y, 0, z.y + z.h);
        vg.addColorStop(0, "#1a3650");
        vg.addColorStop(1, "#142b42");
        ctx.fillStyle = vg;
        ctx.fill();
        ctx.clip();

        if (salt.vandfarve && this.frie > 0) {
            ctx.globalAlpha = NK.klamp(this.frie / 14, 0, 1) * 0.35;
            ctx.fillStyle = salt.vandfarve;
            ctx.fillRect(z.x, z.y, z.b, z.h);
            ctx.globalAlpha = 1;
        }

        /* Bunden af glasset */
        ctx.fillStyle = "rgba(200, 225, 245, 0.10)";
        ctx.fillRect(z.x, this.gulv, z.b, z.y + z.h - this.gulv);
        ctx.strokeStyle = "rgba(200, 225, 245, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(z.x, this.gulv);
        ctx.lineTo(z.x + z.b, this.gulv);
        ctx.stroke();

        /* Baggrundsvand - antyder de mange molekyler, der ikke er tegnet */
        for (i = 0; i < this.baggrund.length; i++) {
            var g = this.baggrund[i];
            T.vand(ctx, z.x + g.x * z.b, z.y + g.y * z.h, g.vinkel, vs * g.skala, { alpha: 0.16 });
        }

        /* Krystalstykkerne */
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand !== "fast") continue;
            T.ion(ctx, o.x, o.y, o.ion, this.ionRadius(o), { fremhaev: o.reserveret > 0 });
        }

        /* Et kort lysglimt langs kanterne, lige naar krystallen knaekker */
        if (this.knaekUr > 0) this.tegnKnaek(ctx);

        /* De frie ioner med deres vandskal */
        for (i = 0; i < this.ioner.length; i++) {
            var f = this.ioner[i];
            if ((f.tilstand !== "fri" && f.tilstand !== "ud") || !f.skal) continue;
            var r = this.ionRadius(f);
            for (j = 0; j < f.skal.length; j++) {
                var s = f.skal[j];
                T.skalVand(ctx, f.x, f.y, r, s.vinkel + f.skalfase, vs, f.ion.q > 0, {
                    alpha: 0.95 * f.alpha,
                    forkert: s.forkert,
                    ring: s.ring
                });
            }
            T.ion(ctx, f.x, f.y, f.ion, r, { alpha: f.alpha });
        }

        /* Arbejdsmolekylerne */
        for (i = 0; i < this.vand.length; i++) {
            var v = this.vand[i];
            var arbejder = v.tilstand === "soeger" || v.tilstand === "fast";
            T.vand(ctx, v.x, v.y, v.vinkel, vs, {
                delta: this.visDelta,
                alpha: (arbejder ? 1 : 0.6) * v.fade,
                spidsH: v.maal ? v.maal.ion.q < 0 : false
            });
        }

        /* Ioner paa vej ud tegnes oeverst */
        for (i = 0; i < this.ioner.length; i++) {
            var pv = this.ioner[i];
            if (pv.tilstand !== "paavej") continue;
            T.ion(ctx, pv.x, pv.y, pv.ion, this.ionRadius(pv), { fremhaev: true });
        }
        ctx.restore();

        ctx.save();
        NK.rundtRekt(ctx, z.x, z.y, z.b, z.h, 16);
        ctx.strokeStyle = "rgba(201, 211, 222, 0.55)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        this.tegnUr(ctx);
    };

    P.tegnKnaek = function (ctx) {
        var kasser = {}, c = this.celle, i, id;
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand !== "fast") continue;
            var k = kasser[o.stykke];
            if (!k) k = kasser[o.stykke] = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
            k.x0 = Math.min(k.x0, o.x - c / 2); k.x1 = Math.max(k.x1, o.x + c / 2);
            k.y0 = Math.min(k.y0, o.y - c / 2); k.y1 = Math.max(k.y1, o.y + c / 2);
        }
        ctx.save();
        ctx.globalAlpha = NK.klamp(this.knaekUr / 0.6, 0, 1);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        for (id in kasser) {
            if (!Object.prototype.hasOwnProperty.call(kasser, id)) continue;
            var b = kasser[id];
            NK.rundtRekt(ctx, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, 6);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Et lille ur, der viser, hvor lang tid opløsningen har taget. */
    P.tegnUr = function (ctx) {
        var z = this.zoom;
        var stoppet = this.slutTid !== null;
        var tekst = "Tid: " + Math.floor(stoppet ? this.slutTid : this.tid) + " s";
        var b = 92, h = 28, x = z.x + z.b - b - 12, y = z.y + 12;
        ctx.save();
        ctx.fillStyle = "rgba(10, 14, 20, 0.72)";
        NK.rundtRekt(ctx, x, y, b, h, 7);
        ctx.fill();
        ctx.restore();
        NK.tekst(ctx, tekst, x + b / 2, y + h / 2 + 1, {
            justering: "center", linje: "middle",
            farve: stoppet ? "#7ee0a8" : "#e9eef4", font: "600 13px 'Segoe UI', sans-serif"
        });
    };

    /* Glasset, som man ville se det paa bordet. */
    P.tegnMakro = function (ctx, salt) {
        var m = this.makro;
        var gloed = NK.klamp((this.tempValg.temp - 25) / 60, 0, 1);
        T.varmeplade(ctx, m.pladeX, m.pladeY, m.pladeB, gloed, this.omroering);

        var x0 = m.glasX, x1 = m.glasX + m.glasB;
        ctx.save();
        T.vandSti(ctx, x0, x1, m.overflade, m.bund, 7 * m.s);
        var v = ctx.createLinearGradient(0, m.overflade, 0, m.bund);
        v.addColorStop(0, "rgba(58, 110, 150, 0.34)");
        v.addColorStop(1, "rgba(30, 66, 96, 0.52)");
        ctx.fillStyle = v;
        ctx.fill();
        if (salt.vandfarve && this.frie > 0) {
            ctx.globalAlpha = NK.klamp(this.frie / 14, 0, 1) * 0.45;
            ctx.fillStyle = salt.vandfarve;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        ctx.clip();

        /* Isterninger i det kolde vand */
        if (this.tempValg.id === "kold") {
            ctx.fillStyle = "rgba(225, 242, 255, 0.55)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 1;
            var terning = 16 * m.s;
            [[0.34, -0.2], [0.52, 0.1]].forEach(function (p, i) {
                ctx.save();
                ctx.translate(x0 + m.glasB * p[0], m.overflade + terning * 0.35);
                ctx.rotate(p[1] + i * 0.3);
                NK.rundtRekt(ctx, -terning / 2, -terning / 2, terning, terning, 3);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            });
        }

        this.tegnKorn(ctx, salt);

        /* Magneten fra omroereren. Den ses fra siden, saa den bliver
           kortere og laengere, mens den drejer. */
        var lang = m.glasB * 0.24, tyk = Math.max(3, 7 * m.s);
        var synlig = Math.max(0.22, Math.abs(Math.cos(this.roerFase)));
        ctx.fillStyle = "#f2f4f7";
        NK.rundtRekt(ctx, m.roerX - lang * synlig / 2, m.bund - tyk - 1, lang * synlig, tyk, tyk / 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(180, 220, 250, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0, m.overflade);
        ctx.lineTo(x1, m.overflade);
        ctx.stroke();
        ctx.restore();

        T.termometer(ctx, m.termoX, m.termoY, m.termoB, this.tempValg.temp);
        S.tegn(ctx, "baegerglas", m.x, m.y, m.bw);
    };

    /* Saltkornet i glasset: ét korn pr. stykke af krystallen, og hvert
       korn bliver mindre, efterhaanden som ionerne gaar i opløsning. */
    P.tegnKorn = function (ctx, salt) {
        var m = this.makro, tael = {}, i;
        for (i = 0; i < this.ioner.length; i++) {
            var o = this.ioner[i];
            if (o.tilstand === "fast") tael[o.stykke] = (tael[o.stykke] || 0) + 1;
        }
        var ids = this.stykkeOrden.filter(function (id) { return tael[id]; });
        var n = ids.length, total = this.ioner.length;
        var maksR = m.lupR * 0.62, spred = m.lupR * 1.0;

        ctx.save();
        ctx.fillStyle = D.pulverfarve(salt);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ids.forEach(function (id, j) {
            var r = Math.max(1.4, maksR * Math.sqrt(tael[id] / total));
            var x = m.kornX + (n > 1 ? (j / (n - 1) - 0.5) * spred : 0);
            var y = m.bund - r * 0.75;
            ctx.beginPath();
            for (var h = 0; h < 6; h++) {
                var a = h * Math.PI / 3 + id * 0.7;
                var rr = r * (0.82 + 0.22 * Math.sin(id * 3.1 + h * 2.3));
                var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.8;
                if (h === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();
    };

    P.tegnLupLinjer = function (ctx) {
        var m = this.makro, z = this.zoom;
        ctx.save();
        ctx.strokeStyle = "rgba(201, 211, 222, 0.32)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(m.lupX, m.lupY - m.lupR);
        ctx.lineTo(z.x + 10, z.y + 2);
        ctx.moveTo(m.lupX, m.lupY + m.lupR);
        ctx.lineTo(z.x + 10, z.y + z.h - 2);
        ctx.stroke();
        ctx.restore();
    };

    P.tegnLup = function (ctx) {
        var m = this.makro, ML = S.MAAL.lup;
        var b = m.lupR * ML.b / ML.linseR;
        S.tegn(ctx, "lup", m.lupX - ML.linseX * b / ML.b, m.lupY - ML.linseY * b / ML.b, b);
    };

    /* ----- Opgaverne ------------------------------------------------------------ */
    function opgFindFejl() {
        var saltId = NK.tilfaeldig(["NaCl", "KNO3", "CaCl2", "CuSO4"]);
        var fejl = null;
        var o = {
            tekst: "Ét vandmolekyle vender forkert ind mod sin ion. Klik på det.",
            hint: "Oxygen (rød, δ−) skal vende ind mod en positiv ion, og hydrogen (hvid, δ+) mod en negativ.",
            svar: "",
            start: function (sim) {
                NK.Valg.saet(saltId);
                sim.nulstil();
                sim.spolFrem(function () { return sim.synligeFrie() >= 3; }, 240);
                sim.spolFrem(function () { return false; }, 2.5);   /* lad vandskallerne lukke sig */
                /* Start ikke paa flere ioner, og vent, til ingen er midt paa vej
                   ud, og de nyeste har naaet at glide fri af de andre. */
                sim.hvil = true;
                sim.spolFrem(function () {
                    return sim.ioner.every(function (ion) {
                        return ion.tilstand !== "paavej" && !(ion.tilstand === "fri" && ion.alder < 1.2);
                    });
                }, 10);
                fejl = sim.vaelgFejl();
                sim.pause = true;
                if (!fejl) return;
                o.svar = fejl.ion.ion.q > 0
                    ? "Molekylet vendte hydrogen ind mod en positiv ion. Det er oxygen-enden (δ−), der skal vende ind."
                    : "Molekylet vendte oxygen ind mod en negativ ion. Det er hydrogen-enderne (δ+), der skal vende ind.";
            },
            klik: function (sim, x, y) {
                var ramt = sim.vandVed(x, y);
                if (!ramt) return false;
                if (fejl && ramt.ion === fejl.ion && ramt.nr === fejl.nr) {
                    var s = fejl.ion.skal[fejl.nr];
                    s.forkert = false;
                    s.ring = "#7ee0a8";
                    return true;
                }
                return "Det vandmolekyle vender rigtigt. Prøv et andet.";
            },
            visSvar: function () {
                if (fejl) fejl.ion.skal[fejl.nr].ring = "#f2c53d";
            },
            slut: function (sim) {
                sim.pauseUr = 5;
            }
        };
        return o;
    }

    function opgLigning() {
        var salt = D.salt(NK.tilfaeldig(["NaCl", "KNO3", "CaCl2", "CuSO4", "CaCO3", "AgCl"]));
        var ret = D.hoejreSide(salt);
        var alle = NK.bland([ret].concat(D.forkerteHoejresider(salt).slice(0, 3)));
        return {
            tekst: "Hvad bliver " + D.venstreLed(salt) + " til, når det opløses i vand?",
            valg: alle,
            rigtig: alle.indexOf(ret),
            skjulLigning: true,
            hint: "Se på krystallen i lupen. Hvor mange negative ioner er der for hver positiv, og hvilken ladning har de?",
            svar: D.venstreLed(salt) + " → " + ret + ". Ionerne kommer fra hinanden, men ændrer sig ikke.",
            start: function (sim) {
                NK.Valg.saet(salt.id);
                sim.nulstil();
            }
        };
    }

    function opgHurtigst() {
        return {
            tekst: "Få hele NaCl-krystallen opløst på under " + GRAENSE_SEK + " sekunder. Uret i lupen er startet.",
            hint: "To af indstillingerne under Forsøget kan gøre det hurtigere.",
            svar: "Varmt vand og omrøring. Varmen gør vandmolekylerne hurtigere, og omrøringen knuser krystallen, " +
                  "så flere kan tage fat på én gang.",
            start: function (sim) {
                NK.Valg.saet("NaCl");
                sim.saetTemp(TEMPERATURER[1]);
                sim.saetOmroering(false);
                sim.nulstil();
            },
            tjek: function (sim) {
                if (NK.Valg.saltId !== "NaCl" || sim.tilbage() > 0 || sim.slutTid === null) return false;
                if (sim.slutTid <= GRAENSE_SEK) return true;
                return "Det tog " + Math.round(sim.slutTid) + " sekunder. Tryk på Ny krystal, og prøv igen.";
            },
            visSvar: function (sim) {
                sim.saetTemp(TEMPERATURER[2]);
                sim.saetOmroering(true);
                sim.nulstil();
            }
        };
    }

    function opgTungOmroering() {
        return {
            tekst: "Sølvchlorid er tungtopløseligt. Hvad sker der med antallet af ioner i vandet, hvis du rører rundt?",
            valg: ["Der går flere ioner i opløsning",
                   "Der går lige så mange i opløsning",
                   "Der går færre ioner i opløsning"],
            rigtig: 1,
            hint: "Prøv det: slå omrøring til, og tæl de frie ioner i lupen.",
            svar: "Omrøringen knuser krystallen, så det går hurtigere. Men vandet kan stadig kun rumme nogle få ioner.",
            start: function (sim) {
                NK.Valg.saet("AgCl");
                sim.saetOmroering(false);
                sim.nulstil();
            },
            visSvar: function (sim) { sim.saetOmroering(true); }
        };
    }

    var OPGAVER = [opgFindFejl, opgLigning, opgHurtigst, opgTungOmroering];
}());
