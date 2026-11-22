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
       Proeven i vinduet paa fane 2 (runde T10d, 22. nov. 2026)
       ===================================================================
       Kuglemodeller som i Kemibogens figur i C 4.6 (fedt-pakning): samme
       geometri og farver som fk_zigzag, fk_h, fk_h_retning og fk_fedtstof i
       Kemibogen/vaerktoej/lav_figurer.py (12 carbonatomer i hver kaede,
       FK_S = 0,64). Dobbeltbindingens carbonatomer er turkise (Cdb).
       Niels efter stillbilledet: "Jotak Prøv at bygge dette".

       Ingen fri bevaegelse (de flyvende molekyler lignede "et stankelben,
       der bliver udsat for dyreplageri"): hvert molekyle har en plads.
       Faste molekyler ligger taet i et dobbeltlag i bunden (glycerol udad,
       kaederne mod midten) og vibrerer lidt; flydende ligger loest med
       mellemrum og lidt paa skraa og vugger roligt paa stedet. Skifter
       tilstanden, glider molekylerne roligt til deres nye plads, og et
       molekyle, der skal vende, drejer om sig selv.
       Vinduet er BW x BH enheder (bogens pixels). */
    var KS = 0.64, KN = 12, KD = 47, SP2 = 50, KNAEK = [4, 5, 6];
    var RAD = { C: 12.5 * KS, Cdb: 12.5 * KS, O: 12 * KS, H: 7.5 * KS };
    var BW = 600, BH = 420, MARGIN = 12;      /* T10f: stoerre end molekylerne (foer 500 x 350), saa krystallen er en kompakt blok, og det flydende har luft */

    function grad(v) { return v * Math.PI / 180; }

    function zigzag(x, y, v, n, cis) {
        var L = 19.5 * KS, pos = [[x, y]], sgn = v < 0 ? 1 : -1;
        for (var i = 1; i < n; i++) {
            x += L * Math.cos(grad(v));
            y += L * Math.sin(grad(v));
            pos.push([x, y]);
            v += (cis.indexOf(i) >= 0 || cis.indexOf(i - 1) >= 0 ? SP2 : 70) * sgn;
            if (cis.indexOf(i) < 0) sgn = -sgn;
        }
        return pos;
    }

    function hRetning(x, y, ov, antal) {
        var L = 15.5 * KS;
        var vink = { 1: [[ov, true]], 2: [[ov - 0.62, false], [ov + 0.62, true]],
            3: [[ov - 1.05, false], [ov, true], [ov + 1.05, true]] }[antal];
        return vink.map(function (w) { return [x + L * Math.cos(w[0]), y + L * Math.sin(w[0]), w[1]]; });
    }

    function hPaa(pos, i, antal) {
        var x = pos[i][0], y = pos[i][1], ox, oy;
        if (i > 0 && i < pos.length - 1) {
            ox = x - (pos[i - 1][0] + pos[i + 1][0]) / 2;
            oy = y - (pos[i - 1][1] + pos[i + 1][1]) / 2;
        } else {
            var j = i === 0 ? 1 : pos.length - 2;
            ox = x - pos[j][0];
            oy = y - pos[j][1];
        }
        return hRetning(x, y, Math.atan2(oy, ox), antal);
    }

    var ANTAL_DB = { S: 0, O: 1, L: 2, Ln: 3, C4: 0 };
    /* Dobbeltbindingerne i kaede k (0 oeverst): forskudt én binding pr.
       kaede som i bogen, saa alle knaek boejer samme vej, og den anden
       (og tredje) tre bindinger laengere ude, saa kaeden krummer mere. */
    function cisFor(id, k) {
        var j = KNAEK[k];
        if (id === "O") return [j];
        if (id === "L") return [j, j + 3];
        if (id === "Ln") return [j - 2, j + 1, j + 4];
        return [];
    }
    function erDb(cis, i) { return cis.some(function (c) { return i === c || i === c + 1; }); }

    /* Smoersyre (paaskeaegget): fire carbonatomer og COOH */
    function friSyre() {
        var pos = zigzag(0, 0, -35, 4, []), ud = [];
        var o = hPaa(pos, 0, 2);
        o.forEach(function (h) { ud.push([h[0], h[1], "O"]); });
        pos.forEach(function (p) { ud.push([p[0], p[1], "C"]); });
        for (var i = 1; i < 4; i++) hPaa(pos, i, i === 3 ? 3 : 2).forEach(function (h) { ud.push([h[0], h[1], "H"]); });
        return ud;
    }

    var kalotteCache = {};
    /* Kuglerne i ét molekyle, centreret om kassens midte:
       { kugler: [{ x, y, r, g }], tunge (uden H), b, h }. De mest boejede
       kaeder sidder oeverst, saa de boejer vaek fra de andre. */
    F.kalotte = function (kaeder) {
        var noegle = kaeder.join(",");
        if (kalotteCache[noegle]) return kalotteCache[noegle];
        var raa;
        if (kaeder.length === 1) raa = friSyre();
        else {
            var k3 = kaeder.slice().sort(function (a, b) { return ANTAL_DB[b] - ANTAL_DB[a]; });
            var d = KD * KS, glyc = [[0, -17 * KS], [-9 * KS, 0], [0, 17 * KS]], cx = 30 * KS;
            var bag = [], midt = [], foran = [];
            for (var k = 0; k < 3; k++) {
                var gx = glyc[k][0], gy = glyc[k][1], cy = (k - 1) * d, op = k !== 1;
                var cis = cisFor(k3[k], k);
                var pos = zigzag(cx, cy, op ? -35 : 35, KN, cis);
                var ox = (gx + cx) / 2 + (k !== 1 ? 4 * KS : 0), oy = (gy + cy) / 2 + [3, -7, -3][k] * KS;
                midt.push([gx, gy, "C"], [ox, oy, "O"]);
                pos.forEach(function (p, i) { midt.push([p[0], p[1], erDb(cis, i) ? "Cdb" : "C"]); });
                foran.push([cx + 4 * KS, cy + (op ? 10 : -10) * KS, "O"]);
                var hs = hRetning(gx, gy, grad([-120, 180, 120][k]), k === 1 ? 1 : 2);
                for (var i = 1; i < KN; i++) hs = hs.concat(hPaa(pos, i, erDb(cis, i) ? 1 : (i === KN - 1 ? 3 : 2)));
                hs.forEach(function (h) { (h[2] ? foran : bag).push([h[0], h[1], "H"]); });
            }
            raa = bag.concat(midt, foran);
        }
        var kugler = raa.map(function (b) { return { x: b[0], y: b[1], r: RAD[b[2]], g: b[2] }; });
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        kugler.forEach(function (q) {
            x0 = Math.min(x0, q.x - q.r); x1 = Math.max(x1, q.x + q.r);
            y0 = Math.min(y0, q.y - q.r); y1 = Math.max(y1, q.y + q.r);
        });
        var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        kugler.forEach(function (q) { q.x -= mx; q.y -= my; });
        var ud = { kugler: kugler, tunge: kugler.filter(function (q) { return q.g !== "H"; }), b: x1 - x0, h: y1 - y0 };
        kalotteCache[noegle] = ud;
        return ud;
    };

    /* Kaederne i N molekyler efter andelen (stoerste rester), sorteret, saa
       hvert molekyle faar ens kaeder saa vidt muligt (de mest lige foerst) */
    F.molekylerSorteret = function (fedt, N) {
        if (fedt.kaeder) {
            var ens = [];
            for (var m = 0; m < N; m++) ens.push(fedt.kaeder.slice());
            return ens;
        }
        var antal = 3 * N, liste = [], rest = [];
        ["S", "O", "L", "Ln"].forEach(function (id) {
            var eksakt = fedt.andel[id] / 100 * antal, hel = Math.floor(eksakt);
            for (var i = 0; i < hel; i++) liste.push(id);
            rest.push({ id: id, r: eksakt - hel });
        });
        rest.sort(function (a, b) { return b.r - a.r; });
        for (var j = 0; liste.length < antal; j++) liste.push(rest[j % rest.length].id);
        liste.sort(function (a, b) { return ANTAL_DB[a] - ANTAL_DB[b]; });
        var ud = [];
        for (var n = 0; n < N; n++) ud.push(liste.slice(n * 3, n * 3 + 3));
        return ud;
    };

    /* Kuglerne i molekylet ved en stilling { x, y, a, sx, sy } */
    function placer(form, st, kunTunge) {
        var c = Math.cos(st.a), s = Math.sin(st.a);
        return (kunTunge ? form.tunge : form.kugler).map(function (q) {
            var x = q.x * st.sx, y = q.y * st.sy;
            return { x: st.x + x * c - y * s, y: st.y + x * s + y * c, r: q.r, g: q.g };
        });
    }
    F.placer = placer;

    function overlapper(a, b, luft) {
        for (var i = 0; i < a.length; i++) {
            var p = a[i];
            for (var j = 0; j < b.length; j++) {
                var q = b[j], dx = p.x - q.x, dy = p.y - q.y, rr = p.r + q.r + luft;
                if (dx * dx + dy * dy < rr * rr) return true;
            }
        }
        return false;
    }
    F.overlapper = overlapper;

    /* Hvor meget kuglerne i a roerer kuglerne i de placerede (0: slet ikke,
       med et mellemrum paa ca. et H-atom). Store overlap tæller mest. */
    var LUFT = 2 * RAD.H + 14;     /* de loese har god luft imellem sig (T10f) */
    var TAET = -2.5;               /* kuglerne i krystallen maa gaa lidt ind i hinanden (T10f) */
    function straf(a, placeret) {
        var sum = 0;
        placeret.forEach(function (b) {
            for (var i = 0; i < a.length; i++) {
                var p = a[i];
                for (var j = 0; j < b.length; j++) {
                    var q = b[j], dx = p.x - q.x, dy = p.y - q.y, rr = p.r + q.r + LUFT;
                    var d2 = dx * dx + dy * dy;
                    if (d2 < rr * rr) sum += rr - Math.sqrt(d2);
                }
            }
        });
        return sum;
    }

    function kasse(kugler) {
        var k = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
        kugler.forEach(function (q) {
            k.x0 = Math.min(k.x0, q.x - q.r); k.x1 = Math.max(k.x1, q.x + q.r);
            k.y0 = Math.min(k.y0, q.y - q.r); k.y1 = Math.max(k.y1, q.y + q.r);
        });
        return k;
    }

    var PLANER = {};

    function Proeve(fedt, T, N) {
        this.W = BW;
        this.H = BH;
        this.N = N || 6;
        this.T = T;
        this.pause = false;
        this.tid = 0;
        this.saetFedt(fedt);
    }

    var P = Proeve.prototype;

    P.saetFedt = function (fedt) {
        var r = tilfaeldig(97 + (fedt.id ? fedt.id.charCodeAt(0) : 3) * 17);
        this.fedt = fedt;
        this.harsk = 0;
        this.r = r;
        this.mol = F.molekylerSorteret(fedt, this.N).map(function (k, i) {
            return {
                nr: i, kaeder: k, form: F.kalotte(k), smp: F.smpRaa(k), glycerol: true, fast: false,
                x: BW / 2, y: BH / 2, a: 0, sx: 1, sy: 1, maal: null,
                fase: r() * 6.28, fase2: r() * 6.28, fase3: r() * 6.28
            };
        });
        /* Raekkefoelgen, de bliver faste i: hoejeste smeltepunkt foerst */
        this.orden = this.mol.slice().sort(function (a, b) { return b.smp - a.smp || a.nr - b.nr; });
        this.fastAntal = -1;
        this.opdaterFaste(true);
    };

    P.fastAndel = function () { return F.fastAndel(this.fedt, this.T); };
    P.tilstand = function () { return D.tilstand(this.fastAndel()); };

    /* Hvor mange af de N molekyler, der er faste. Vinduet viser tilstanden
       entydigt (Niels 22. nov. 2026, T10c: "smoer er helt fast i et
       koeleskab.. maaske med lidt vibration.. men ikke med noget smoer der
       er flydende i toppen"): fast er alle i raekker, flydende ingen, og
       delvist fast mindst to (én raekke) og hoejst N - 2 efter den faste andel. */
    P.antalFaste = function (N) {
        var fa = this.fastAndel(), t = D.tilstand(fa);
        if (t === "fast") return N;
        if (t === "flydende") return 0;
        /* Mindst to, saa de ligger side om side som en raekke (T10e) */
        return NK.klamp(Math.round(fa / 100 * N), Math.min(2, N - 1), Math.max(1, N - 2));
    };

    P.opdaterFaste = function (straks) {
        var hele = this.mol.filter(function (m) { return m.glycerol; });
        var orden = this.orden.filter(function (m) { return hele.indexOf(m) >= 0; });
        var n = Math.min(this.antalFaste(hele.length), orden.length);
        if (n === this.fastAntal && !straks) return;
        this.fastAntal = n;
        var faste = orden.slice(0, n);
        this.mol.forEach(function (m) { m.fast = faste.indexOf(m) >= 0; });
        /* Pladserne afhaenger kun af fedtet og antallet af faste: de gemmes
           for alle proever (et nyt glas smoer faar de samme) */
        var noegle = (this.fedt.kaeder ? this.fedt.kaeder.join("") : this.fedt.id) + "|" + this.N + "|" + n + "|" + this.mol.length;
        if (!PLANER[noegle]) PLANER[noegle] = this.plan(faste);
        var plan = PLANER[noegle];
        this.mol.forEach(function (m) {
            m.maal = plan[m.nr];
            if (straks) { m.x = m.maal.x; m.y = m.maal.y; m.a = m.maal.a; m.sx = m.maal.sx; m.sy = m.maal.sy; }
        });
    };

    /* Pladserne: de faste i et dobbeltlag i bunden (de mest lige nederst,
       venstre soejle med glycerol til venstre, hoejre spejlvendt), resten
       loest i det, der er tilbage, uden at roere hinanden. Fast fro, saa
       billedet er det samme hver gang. */
    P.plan = function (faste) {
        var mig = this, plan = {}, placeret = [];
        var sb = F.kalotte(["S", "S", "S"]).b;
        var kol = [BW / 2 - sb / 2 - 1, BW / 2 + sb / 2 + 1];
        var forrige = [null, null];
        var stak = faste.slice().sort(function (a, b) { return F.antalDb(a.kaeder) - F.antalDb(b.kaeder) || a.nr - b.nr; });
        /* Krystallen er pakket ekstra taet for pædagogikkens skyld (Niels
           22. nov. 2026, T10f: "jeg kunne maaske alligevel godt taenke mig at
           taetheden blev stoerre, naar det var fast ... for paedagogikkens
           skyld"): kuglerne i to naboer maa gaa TAET ind i hinanden, og den
           hoejre soejle skubbes ind mod den venstre, til halerne roerer. */
        var krystal = [], stillinger = [];
        stak.forEach(function (m, i) {
            var c = i % 2, raekke = Math.floor(i / 2);
            /* Boejede molekyler vender knaekkene opad, vaek fra raekken under;
               lige molekyler skiftes, saa de lægger sig ind i hinanden */
            var sy = F.antalDb(m.kaeder) > 0 ? 1 : (raekke % 2 ? -1 : 1);
            var st = { x: kol[c], y: 0, a: 0, sx: c ? -1 : 1, sy: sy };
            var p = forrige[c];
            st.y = p ? p.st.y - (p.form.h + m.form.h) / 2 : BH - MARGIN - m.form.h / 2;
            function roerer(x, y) {
                var k = placer(m.form, { x: x, y: y, a: 0, sx: st.sx, sy: st.sy }, false);
                return krystal.some(function (o) { return overlapper(k, o, TAET); });
            }
            /* Op, til det er fri af alle i krystallen, og saa ned, til det roerer */
            for (var op = 0; op < 120 && roerer(st.x, st.y); op++) st.y -= 2;
            if (p) for (var ned = 0; ned < 240 && !roerer(st.x, st.y + 1); ned++) st.y += 1;
            /* Den hoejre soejle ind mod den venstre */
            if (c === 1) for (var ind = 0; ind < 80 && !roerer(st.x - 1, st.y); ind++) st.x -= 1;
            forrige[c] = { st: st, form: m.form };
            plan[m.nr] = st;
            stillinger.push({ m: m, st: st });
            krystal.push(placer(m.form, st, false));
        });
        /* Krystallen midt i vinduet (vandret), stadig paa bunden */
        if (krystal.length) {
            var kx0 = Infinity, kx1 = -Infinity;
            krystal.forEach(function (k) { k.forEach(function (q) { kx0 = Math.min(kx0, q.x - q.r); kx1 = Math.max(kx1, q.x + q.r); }); });
            var skub = BW / 2 - (kx0 + kx1) / 2;
            stillinger.forEach(function (o) { o.st.x += skub; placeret.push(placer(o.m.form, o.st, true)); });
        }
        /* De loese: tilfaeldige pladser (fast fro) inden for vinduet */
        var r = tilfaeldig(1234 + faste.length * 71 + this.mol.length * 13 + (this.fedt.id ? this.fedt.id.length * 7 : 0));
        var loese = this.mol.filter(function (m) { return faste.indexOf(m) < 0; });
        /* De stoerste foerst; for hvert molekyle den plads, der roerer de
           andre mindst (helst slet ikke, med et mellemrum) */
        loese.sort(function (a, b) { return b.form.b * b.form.h - a.form.b * a.form.h || a.nr - b.nr; });
        loese.forEach(function (m) {
            var bedst = null, bedstPoint = Infinity;
            for (var forsoeg = 0; forsoeg < 1400 && bedstPoint > 0; forsoeg++) {
                var st = { x: 30 + r() * (BW - 60), y: 30 + r() * (BH - 60), a: grad(-22 + r() * 44),
                    sx: r() < 0.5 ? 1 : -1, sy: r() < 0.5 ? 1 : -1 };
                var k = kasse(placer(m.form, st, false));
                if (k.x0 < MARGIN || k.x1 > BW - MARGIN || k.y0 < MARGIN || k.y1 > BH - MARGIN) continue;
                var point = straf(placer(m.form, st, true), placeret);
                if (point < bedstPoint) { bedstPoint = point; bedst = st; }
            }
            if (!bedst) bedst = { x: BW / 2, y: BH / 2, a: 0, sx: 1, sy: 1 };
            plan[m.nr] = bedst;
            placeret.push(placer(m.form, bedst, true));
        });
        void mig;
        return plan;
    };

    /* Stillingen lige nu, med vibrationen (fast) eller vuggen (flydende) */
    P.stilling = function (m) {
        var t = this.tid;
        if (m.fast) {
            var v = 0.7;
            return { x: m.x + v * Math.sin(t * 9 + m.fase), y: m.y + v * Math.sin(t * 7.3 + m.fase2), a: m.a, sx: m.sx, sy: m.sy };
        }
        return { x: m.x + 3.5 * Math.sin(t * 0.8 + m.fase), y: m.y + 2.5 * Math.sin(t * 0.6 + m.fase2),
            a: m.a + 0.04 * Math.sin(t * 0.5 + m.fase3), sx: m.sx, sy: m.sy };
    };

    P.kuglerI = function (m) { return placer(m.form, this.stilling(m), false); };

    P.opdater = function (dt) {
        if (this.pause || dt <= 0) return;
        this.tid += dt;
        this.opdaterFaste(false);
        this.mol.forEach(function (m) {
            var q = m.maal;
            if (!q) return;
            m.x = NK.mod(m.x, q.x, 2.2, dt);
            m.y = NK.mod(m.y, q.y, 2.2, dt);
            m.a = NK.mod(m.a, q.a, 2.2, dt);
            m.sx = NK.mod(m.sx, q.sx, 2.6, dt);
            m.sy = NK.mod(m.sy, q.sy, 2.6, dt);
        });
    };

    /* ----- Paaskeaegget: smoerret bliver harskt ------------------------------------
       Vand spalter noget af fedtet (hydrolyse), og der dannes smoersyre,
       der lugter. Vinduet faar to smoersyremolekyler mellem de andre. */
    P.bliverHarsk = function () {
        if (this.harsk) return;
        this.harsk = 1;
        for (var i = 0; i < 2; i++) {
            this.mol.push({
                nr: this.mol.length, kaeder: ["C4"], form: F.kalotte(["C4"]), smp: -99, glycerol: false, fast: false,
                x: BW / 2, y: 30, a: 0, sx: 1, sy: 1, maal: null,
                fase: this.r() * 6.28, fase2: this.r() * 6.28, fase3: this.r() * 6.28
            });
        }
        this.fastAntal = -1;
        this.opdaterFaste(false);
    };

    Proeve.W = BW;
    Proeve.H = BH;
    NK.Proeve = Proeve;
}());
