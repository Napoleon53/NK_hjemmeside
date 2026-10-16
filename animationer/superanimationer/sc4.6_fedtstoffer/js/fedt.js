/* =====================================================================
   fedt.js - kemien bag fedtstofferne

   NK.Fedt.smp        smeltepunktet for et fedtstof af tre fedtsyrer
   NK.Fedt.tilstand   fast, delvist fast eller flydende ved en temperatur
   NK.Fedt.kaede      fedtsyrens kaede som zigzagformel med knaek
   NK.Fedt.form       et fedtmolekyle (triglycerid) til zoomvinduet
   NK.Proeve          molekylerne i zoomvinduet: de faste ligger i
                      raekker, de flydende bevaeger sig

   Laengder er i bindingslaengder (én C-C-binding = 1).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = {};

    /* ----- Smeltepunktet -------------------------------------------------------
       Tre ens fedtsyrer: tabelvaerdien (D.SYRER[].smpRen). Ellers en lille
       model med to dele:
         * De umaettede kaeder alene giver gennemsnittet af deres rene
           smeltepunkter (mU).
         * Hver ret kaede (stearinsyre) loefter smeltepunktet mod
           tristearins 73 °C, men én kaede med knaek oedelaegger meget:
           smp = mU + (73 - mU) · (nS / 3)^p
       p er valgt, saa SOS rammer den maalte vaerdi 43 °C. Rundet til hele
       grader. */
    var S_REN = D.syre("S").smpRen;
    var P_EKSP = Math.log((D.SMP_SOS - D.syre("O").smpRen) / (S_REN - D.syre("O").smpRen)) / Math.log(2 / 3);
    F.P_EKSP = P_EKSP;

    F.smpRaa = function (kaeder) {
        var nS = 0, sum = 0, nU = 0;
        kaeder.forEach(function (id) {
            if (id === "S") nS++;
            else { sum += D.syre(id).smpRen; nU++; }
        });
        if (nS === kaeder.length) return S_REN;
        var mU = sum / nU;
        return mU + (S_REN - mU) * Math.pow(nS / kaeder.length, P_EKSP);
    };

    F.smp = function (kaeder) {
        return Math.round(F.smpRaa(kaeder));
    };

    /* Er smeltepunktet maalt (tabelvaerdi) eller regnet med modellen? */
    F.smpMaalt = function (kaeder) {
        var k = kaeder.slice().sort().join(",");
        return kaeder.every(function (id) { return id === kaeder[0]; }) || k === "O,S,S";
    };

    /* Smeltepunktet som tekst: "73 °C" eller "ca. 19 °C" */
    F.smpTekst = function (kaeder) {
        return (F.smpMaalt(kaeder) ? "" : "ca. ") + D.gradTekst(F.smp(kaeder));
    };

    F.antalDb = function (kaeder) {
        var n = 0;
        kaeder.forEach(function (id) { n += D.syre(id).db; });
        return n;
    };

    /* Den faste andel i procent af et rent fedtstof. Ved smeltepunktet er
       der baade fast stof og vaeske: delvist fast. */
    F.fastAndelRen = function (smp, T) {
        if (T < smp) return 100;
        if (T > smp) return 0;
        return 30;
    };

    /* Tilstanden af et fedt: { ren: [id, id, id] } eller et af D.FEDT */
    F.fastAndel = function (fedt, T) {
        if (fedt.kaeder) return F.fastAndelRen(F.smp(fedt.kaeder), T);
        return D.fastAndel(fedt, T);
    };

    F.tilstand = function (fedt, T) {
        return D.tilstand(F.fastAndel(fedt, T));
    };

    /* Tilstanden paa alle fire steder: { fryser: "fast", ... } */
    F.stederne = function (fedt) {
        var ud = {};
        D.STEDER.forEach(function (st) { ud[st.id] = F.tilstand(fedt, st.T); });
        return ud;
    };

    /* Opfylder fedtet ordren? Giver ogsaa, hvad der er galt:
       "haard" (for fast et sted) eller "bloed" (for flydende et sted). */
    F.tjekOrdre = function (ordre, kaeder) {
        var fedt = { kaeder: kaeder }, galt = null, ok = true;
        Object.keys(ordre.krav).forEach(function (sted) {
            var t = F.tilstand(fedt, D.sted(sted).T), krav = ordre.krav[sted];
            if (D.opfylder(krav, t)) return;
            ok = false;
            if (krav === "fast" || krav === "ikkeFlydende") galt = galt || "bloed";
            else galt = galt || "haard";
        });
        return { ok: ok, galt: galt };
    };

    /* Alle 20 fedtstoffer af tre fedtsyrer (raekkefoelgen er ligegyldig) */
    F.alle = function () {
        var ids = D.SYRER.map(function (s) { return s.id; }), ud = [];
        for (var a = 0; a < 4; a++) {
            for (var b = a; b < 4; b++) {
                for (var c = b; c < 4; c++) ud.push([ids[a], ids[b], ids[c]]);
            }
        }
        return ud;
    };

    /* Navnet paa fedtstoffet, kort: "stearinsyre, oliesyre, oliesyre" */
    F.beskrivelse = function (kaeder) {
        return kaeder.map(function (id) { return D.syre(id).navn; }).join(", ");
    };

    /* ----- Kaeden som zigzagformel -------------------------------------------------
       18 C-atomer. C1 er carbonylkulstoffet i (0, 0). Den foerste binding
       gaar 30° ned til hoejre, og ellers skifter kaeden retning med 60° i
       hvert knaek (bindingsvinkel 120°). Ved en cis-dobbeltbinding Ca=Ca+1
       drejer kaeden 45° samme vej ved begge C-atomer, saa de to
       nabobindinger ligger paa samme side (cis), og kaeden boejer 30°.
       Alle knaek i en kaede boejer samme vej (nedad, eller opad med
       fortegn -1). =O paa C1 peger vaek fra boejningen.
       Giver { pkt: [{x, y}] for C1..C18, dobbelt: [bindingens nr] }.
       Binding k gaar fra pkt[k] til pkt[k+1]. */
    var kaedeCache = {};
    F.kaede = function (id, fortegn) {
        fortegn = fortegn || 1;
        var noegle = id + "|" + fortegn;
        if (kaedeCache[noegle]) return kaedeCache[noegle];
        var syre = D.syre(id);
        var nC = syre ? 18 : 4;               /* "C4" er smoersyre */
        var cis = syre ? syre.cis : [];
        var grad = Math.PI / 180;
        var pkt = [{ x: 0, y: 0 }], dobbelt = [];
        var retning = 30 * grad, fortegnDrej = 1;    /* skifter foer brug: knaekket ved C2 drejer -60° */
        var x = 0, y = 0;
        for (var k = 0; k < nC - 1; k++) {
            if (k > 0) {
                /* Knaekket ved C(k+1), som er pkt[k] */
                var cNr = k + 1;
                var foer = cis.indexOf(cNr) >= 0;        /* C(a) i en cis-binding */
                var efter = cis.indexOf(cNr - 1) >= 0;   /* C(a+1) */
                var drej;
                if (efter) {
                    drej = 45 * grad * fortegnDrej;      /* samme vej som foer: cis */
                } else {
                    fortegnDrej = -fortegnDrej;
                    drej = (foer ? 45 : 60) * grad * fortegnDrej;
                }
                retning += drej;
            }
            x += Math.cos(retning);
            y += Math.sin(retning) * fortegn;
            pkt.push({ x: x, y: y });
            if (cis.indexOf(k + 1) >= 0) dobbelt.push(k);
        }
        var ud = { pkt: pkt, dobbelt: dobbelt };
        kaedeCache[noegle] = ud;
        return ud;
    };

    /* Den anden streg i en dobbeltbinding ligger paa indersiden af
       knaekket: paa den side, hvor nabobindingerne er. */
    F.dobbeltSide = function (pkt, k) {
        var a = pkt[k], b = pkt[k + 1];
        var n1 = pkt[Math.max(0, k - 1)], n2 = pkt[Math.min(pkt.length - 1, k + 2)];
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var nx = (n1.x + n2.x) / 2 - mx, ny = (n1.y + n2.y) / 2 - my;
        var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var px = -dy / l, py = dx / l;
        return (px * nx + py * ny) >= 0 ? 1 : -1;
    };

    /* Hvor meget kaeden boejer i alt (grader) */
    F.boejning = function (id) {
        var s = D.syre(id);
        return s ? s.db * 30 : 0;
    };

    /* ----- Et fedtmolekyle i zoomvinduet ------------------------------------------------
       Glycerol er en lodret streg ved x = 0 med tre C-atomer, G = 1,5
       fra hinanden. Fra hvert gaar en kort binding ud til C1 i x = 1,7,
       og derfra kaeden. Kaederne boejer nedad, og den mest knaekkede
       sidder nederst, saa de ikke krydser. En fri fedtsyre (paaskeaegget)
       har ingen glycerol.
       Giver { kaeder: [{ id, pkt, dobbelt }], glycerol, top, bund, laengde,
               profil: { top(x), bund(x) } }. */
    var G = 1.5;
    F.G = G;
    var formCache = {};
    F.form = function (kaeder, glycerol) {
        if (glycerol === undefined) glycerol = true;
        var noegle = kaeder.join(",") + (glycerol ? "" : "|fri");
        if (formCache[noegle]) return formCache[noegle];
        var sorteret = kaeder.slice().sort(function (a, b) { return F.boejning(a) - F.boejning(b); });
        var n = sorteret.length;
        var ud = { kaeder: [], glycerol: glycerol, n: n };
        sorteret.forEach(function (id, i) {
            var y0 = glycerol ? (i - (n - 1) / 2) * G : 0;
            var x0 = glycerol ? 1.7 : 0;
            var k = F.kaede(id, 1);
            ud.kaeder.push({
                id: id, y0: y0,
                pkt: k.pkt.map(function (p) { return { x: p.x + x0, y: p.y + y0 }; }),
                dobbelt: k.dobbelt
            });
        });
        /* Profilen: hoejeste og laveste punkt for hver halve enhed i x */
        var trin = 0.5, top = [], bund = [], laengde = 0;
        function mrk(x, y) {
            var i = Math.max(0, Math.round(x / trin));
            top[i] = top[i] === undefined ? y : Math.min(top[i], y);
            bund[i] = bund[i] === undefined ? y : Math.max(bund[i], y);
            laengde = Math.max(laengde, x);
        }
        if (glycerol) {
            for (var gy = -(n - 1) / 2 * G; gy <= (n - 1) / 2 * G + 1e-6; gy += 0.25) mrk(0, gy);
        }
        ud.kaeder.forEach(function (kd) {
            if (glycerol) mrk(0.85, kd.y0);
            for (var j = 1; j < kd.pkt.length; j++) {
                var a = kd.pkt[j - 1], b = kd.pkt[j];
                for (var t = 0; t <= 1.0001; t += 0.25) mrk(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
            }
        });
        /* Huller i profilen udfyldes fra naboen */
        for (var i = 0; i < top.length; i++) {
            if (top[i] === undefined) { top[i] = top[i - 1]; bund[i] = bund[i - 1]; }
        }
        ud.profilTop = top;
        ud.profilBund = bund;
        ud.trin = trin;
        ud.laengde = laengde;
        ud.top = Math.min.apply(null, top);
        ud.bund = Math.max.apply(null, bund);
        formCache[noegle] = ud;
        return ud;
    };

    /* Hvor langt under molekylet a, molekylet b mindst skal ligge (glycerol
       over glycerol, samme retning), saa kaederne ikke roerer: kaederne i
       ens molekyler lægger sig ind i hinanden, forskellige efterlader huller. */
    F.afstand = function (a, b, luft) {
        var d = -Infinity;
        var n = Math.max(a.profilBund.length, b.profilTop.length);
        for (var i = 0; i < n; i++) {
            var ab = a.profilBund[Math.min(i, a.profilBund.length - 1)];
            var bt = b.profilTop[Math.min(i, b.profilTop.length - 1)];
            if (i >= a.profilBund.length) ab = -Infinity;
            if (i >= b.profilTop.length) bt = Infinity;
            d = Math.max(d, ab - bt);
        }
        return d + (luft === undefined ? 0.75 : luft);
    };

    /* ----- Molekylerne i et rigtigt fedtstof --------------------------------------------
       N molekyler med tre kaeder hver. Kaederne fordeles efter andelen,
       blandes med et fast fro (samme billede hver gang) og saettes sammen
       tre og tre. */
    function tilfaeldig(froe) {
        var s = froe % 2147483647;
        if (s <= 0) s += 2147483646;
        return function () {
            s = s * 16807 % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    F.molekylerI = function (fedt, N) {
        if (fedt.kaeder) {
            var ud = [];
            for (var m = 0; m < N; m++) ud.push(fedt.kaeder.slice());
            return ud;
        }
        var antal = 3 * N, liste = [];
        var ids = ["S", "O", "L", "Ln"], rest = [];
        ids.forEach(function (id) {
            var eksakt = fedt.andel[id] / 100 * antal;
            var hel = Math.floor(eksakt);
            for (var i = 0; i < hel; i++) liste.push(id);
            rest.push({ id: id, r: eksakt - hel });
        });
        rest.sort(function (a, b) { return b.r - a.r; });
        for (var j = 0; liste.length < antal; j++) liste.push(rest[j % rest.length].id);
        var r = tilfaeldig(fedt.id.length * 7919 + fedt.id.charCodeAt(0) * 131);
        for (var k = liste.length - 1; k > 0; k--) {
            var q = Math.floor(r() * (k + 1)), t = liste[k];
            liste[k] = liste[q];
            liste[q] = t;
        }
        var mol = [];
        for (var n = 0; n < N; n++) mol.push(liste.slice(n * 3, n * 3 + 3));
        return mol;
    };

    NK.Fedt = F;

    /* ===================================================================
       Proeven i zoomvinduet
       ===================================================================
       W x H enheder. Et molekyle har en form (F.form), en plads
       (x, y = glycerolens midte), en vinkel og en retning (1: kaederne
       mod hoejre, -1: mod venstre). De faste ligger i raekker nedefra i
       to soejler, glycerol udad og kaederne ind mod midten, som i et
       lag i en fedtkrystal. De flydende bevaeger sig over dem.

       Hvor mange der er faste, afgoeres af den faste andel ved
       temperaturen (NK.Fedt.fastAndel). I en blanding er det de
       molekyler med det hoejeste smeltepunkt, der er faste. */
    var W = 36, H = 34, KANT = 0.6;

    function Proeve(fedt, T, N) {
        this.W = W;
        this.H = H;
        this.N = N || 10;
        this.T = T;
        this.pause = false;
        this.saetFedt(fedt);
    }

    var P = Proeve.prototype;

    P.saetFedt = function (fedt) {
        var mig = this;
        this.fedt = fedt;
        this.harsk = 0;
        var r = tilfaeldig(97 + (fedt.id ? fedt.id.charCodeAt(0) : 3) * 17);
        this.r = r;
        this.mol = F.molekylerI(fedt, this.N).map(function (k, i) {
            var form = F.form(k, true);
            return {
                nr: i, kaeder: k, form: form, smp: F.smpRaa(k),
                x: W / 2, y: H / 2, a: 0, retning: i % 2 ? -1 : 1,
                vx: 0, vy: 0, va: 0, fast: false, glycerol: true,
                pladsX: 0, pladsY: 0, fase: r() * 6.28
            };
        });
        /* Raekkefoelgen, de bliver faste i: hoejeste smeltepunkt foerst */
        this.orden = this.mol.slice().sort(function (a, b) { return b.smp - a.smp || a.nr - b.nr; });
        this.fastAntal = -1;
        this.opdaterFaste(true);
        this.mol.forEach(function (m) {
            if (m.fast) { m.x = m.pladsX; m.y = m.pladsY; m.a = 0; }
            else mig.startFlydende(m, true);
        });
    };

    P.fastAndel = function () {
        return F.fastAndel(this.fedt, this.T);
    };

    P.tilstand = function () { return D.tilstand(this.fastAndel()); };

    /* Hvilke molekyler er faste, og hvor ligger de? */
    P.opdaterFaste = function (straks) {
        var mig = this;
        var n = Math.round(this.fastAndel() / 100 * this.mol.length);
        if (this.fedt.kaeder) n = this.fastAndel() >= 100 ? this.mol.length : (this.fastAndel() > 0 ? Math.round(this.mol.length / 2) : 0);
        var hele = this.mol.filter(function (m) { return m.glycerol && m.form.n === 3; });
        var orden = this.orden.filter(function (m) { return hele.indexOf(m) >= 0; });
        n = Math.min(n, orden.length);
        if (n === this.fastAntal && !straks) return;
        this.fastAntal = n;
        var faste = orden.slice(0, n);
        this.mol.forEach(function (m) {
            var bliver = faste.indexOf(m) >= 0;
            if (m.fast && !bliver) mig.startFlydende(m, false);
            m.fast = bliver;
        });
        /* Pladserne: to soejler, nedefra. De mest knaekkede nederst: deres
           kaeder boejer nedad, saa en ret kaede kan ligge over dem, men
           ikke omvendt. */
        var knaek = function (m) { return F.antalDb(m.kaeder); };
        var stak = faste.slice().sort(function (a, b) { return knaek(b) - knaek(a) || a.nr - b.nr; });
        var soejler = [[], []];
        stak.forEach(function (m, i) { soejler[i % 2].push(m); });
        /* Oeverst skal der vaere plads til de flydende */
        var nFlyd = this.mol.length - n;
        var loft = KANT + (nFlyd > 0 ? Math.min(16, 4 + nFlyd * 1.4) : 0);
        var toppe = [H, H];
        soejler.forEach(function (s, side) {
            var y = null, forrige = null, pladser = [];
            s.forEach(function (m) {
                if (forrige === null) y = H - KANT - m.form.bund;
                else y -= F.afstand(m.form, forrige.form);
                pladser.push(y);
                forrige = m;
            });
            /* Er der ikke plads, trykkes raekkerne sammen */
            var faktor = 1;
            if (s.length > 1) {
                var sidst = s[s.length - 1];
                var spaend = pladser[0] - pladser[pladser.length - 1];
                if (pladser[pladser.length - 1] + sidst.form.top < loft && spaend > 0) {
                    faktor = NK.klamp((pladser[0] + sidst.form.top - loft) / spaend, 0.45, 1);
                }
            }
            s.forEach(function (m, i) {
                var yy = pladser[0] - (pladser[0] - pladser[i]) * faktor;
                m.retning = side === 0 ? 1 : -1;
                m.pladsX = side === 0 ? KANT + 0.3 : W - KANT - 0.3;
                m.pladsY = yy;
                toppe[side] = Math.min(toppe[side], yy + m.form.top);
            });
        });
        this.krystalTop = Math.min(toppe[0], toppe[1]);
    };

    P.startFlydende = function (m, straks) {
        var r = this.r;
        m.fast = false;
        var fart = this.fart();
        var v = r() * Math.PI * 2;
        m.vx = Math.cos(v) * fart;
        m.vy = Math.sin(v) * fart * 0.6 - (straks ? 0 : fart * 0.6);
        m.va = (r() - 0.5) * 0.6;
        if (straks) {
            m.retning = r() < 0.5 ? 1 : -1;
            m.x = m.retning > 0 ? 1 + r() * 8 : W - 1 - r() * 8;
            var top = 1 - m.form.top, bund = this.flydeBund() - m.form.bund;
            m.y = bund > top ? top + r() * (bund - top) : top;
            m.a = (r() - 0.5) * 0.5;
        }
    };

    /* Farten for de flydende: lidt hurtigere, jo varmere */
    P.fart = function () {
        return 2.2 + NK.klamp(this.T + 30, 0, 80) * 0.05;
    };

    P.flydeBund = function () {
        return this.fastAntal > 0 ? this.krystalTop - 0.4 : H - KANT;
    };

    /* Molekylets yderpunkter (drejet) i verdenen: til vaeggene */
    function yderst(m) {
        var f = m.form, c = Math.cos(m.a), s = Math.sin(m.a), rt = m.retning;
        var hj = [[0, f.top], [0, f.bund], [f.laengde, f.top], [f.laengde, f.bund]];
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        hj.forEach(function (p) {
            var lx = p[0] * rt, ly = p[1];
            var wx = m.x + lx * c - ly * s, wy = m.y + lx * s + ly * c;
            x0 = Math.min(x0, wx); x1 = Math.max(x1, wx);
            y0 = Math.min(y0, wy); y1 = Math.max(y1, wy);
        });
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
    }
    Proeve.yderst = yderst;

    /* Molekylets midte (til frastoedningen) */
    function midte(m) {
        var c = Math.cos(m.a), s = Math.sin(m.a), lx = m.form.laengde / 2 * m.retning;
        var ly = (m.form.top + m.form.bund) / 2;
        return { x: m.x + lx * c - ly * s, y: m.y + lx * s + ly * c };
    }

    P.opdater = function (dt) {
        if (this.pause || dt <= 0) return;
        var mig = this, r = this.r;
        this.opdaterFaste(false);
        var bund = this.flydeBund();
        var fart = this.fart();
        this.mol.forEach(function (m) {
            m.fase += dt * 3;
            if (m.fast) {
                m.x = NK.mod(m.x, m.pladsX, 3.2, dt);
                m.y = NK.mod(m.y, m.pladsY, 3.2, dt);
                /* Vinklen drejes den korte vej mod 0 */
                m.a = NK.mod(m.a, 0, 3.2, dt);
                return;
            }
            /* Flydende: lidt tilfaeldige puf og en jaevn fart */
            m.vx += (r() - 0.5) * fart * 2.2 * dt;
            m.vy += (r() - 0.5) * fart * 2.2 * dt;
            var v = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
            var maal = fart * (m.glycerol ? 1 : 1.4);
            m.vx *= 1 + (maal / v - 1) * Math.min(1, dt * 2);
            m.vy *= 1 + (maal / v - 1) * Math.min(1, dt * 2);
            m.va += (r() - 0.5) * 1.2 * dt;
            m.va = NK.klamp(m.va, -0.5, 0.5);
            /* Vinklen holdes nogenlunde vandret, saa de kan vaere der */
            m.va -= m.a * 1.6 * dt;
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            m.a += m.va * dt;
            m.a = NK.klamp(m.a, -0.35, 0.35);
            var yd = yderst(m);
            if (yd.x0 < KANT) { m.x += KANT - yd.x0; m.vx = Math.abs(m.vx); }
            if (yd.x1 > W - KANT) { m.x -= yd.x1 - (W - KANT); m.vx = -Math.abs(m.vx); }
            /* Krystallen skubber op, men boksens loft vinder */
            if (yd.y1 > bund) { m.y -= Math.min(yd.y1 - bund, 6 * dt + (yd.y1 - bund) * 0.3); m.vy = -Math.abs(m.vy) * 0.8; }
            yd = yderst(m);
            if (yd.y0 < KANT) { m.y += KANT - yd.y0; m.vy = Math.abs(m.vy); }
            if (yd.y1 > H - KANT) { m.y -= yd.y1 - (H - KANT); m.vy = -Math.abs(m.vy); }
        });
        /* De flydende skubber blidt til hinanden */
        var fl = this.mol.filter(function (m) { return !m.fast; });
        for (var i = 0; i < fl.length; i++) {
            for (var j = i + 1; j < fl.length; j++) {
                var a = fl[i], b = fl[j], ma = midte(a), mb = midte(b);
                var dx = mb.x - ma.x, dy = mb.y - ma.y;
                var rx = (a.form.laengde + b.form.laengde) / 2 * 0.7;
                var ry = ((a.form.bund - a.form.top) + (b.form.bund - b.form.top)) / 2 * 0.8;
                var d = Math.sqrt((dx / rx) * (dx / rx) + (dy / ry) * (dy / ry));
                if (d < 1 && d > 1e-6) {
                    var skub = (1 - d) * 4 * dt;
                    var ux = dx / rx / d, uy = dy / ry / d;
                    a.x -= ux * skub * rx * 0.3; a.y -= uy * skub * ry;
                    b.x += ux * skub * rx * 0.3; b.y += uy * skub * ry;
                }
            }
        }
        void mig;
    };

    /* ----- Paaskeaegget: smoerret bliver harskt ------------------------------------
       Nogle af fedtmolekylerne spaltes af vand (hydrolyse): en fedtsyre
       gaar fri, og der dannes smoersyre (C4), som lugter. */
    P.bliverHarsk = function () {
        if (this.harsk) return;
        this.harsk = 1;
        var mig = this, r = this.r;
        var ramt = this.mol.filter(function (m) { return !m.fast && m.form.n === 3; }).slice(0, 4);
        ramt.forEach(function (m) {
            var fri = m.kaeder[2];
            m.kaeder = m.kaeder.slice(0, 2);
            m.form = F.form(m.kaeder, true);
            mig.mol.push(mig.friSyre(fri, m.x, m.y + 1));
        });
        for (var i = 0; i < 3; i++) this.mol.push(this.friSyre("C4", 4 + r() * (W - 8), 2 + r() * 6));
        this.fastAntal = -1;
    };

    P.friSyre = function (id, x, y) {
        var m = {
            nr: this.mol.length, kaeder: [id], form: F.form([id], false), smp: -99,
            x: x, y: y, a: 0, retning: this.r() < 0.5 ? 1 : -1,
            vx: 0, vy: 0, va: 0, fast: false, glycerol: false, pladsX: 0, pladsY: 0, fase: 0
        };
        this.startFlydende(m, false);
        return m;
    };

    NK.Proeve = Proeve;
}());
