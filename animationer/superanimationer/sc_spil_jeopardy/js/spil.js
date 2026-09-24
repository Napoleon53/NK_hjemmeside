/* =====================================================================
   spil.js - reglerne og pointene, uden tegning

   Hele spillet staar i én tilstand T, som gemmes i localStorage efter
   hver handling, saa en genindlaest side kan fortsaette. Pointene gemmes
   ikke som tal: de regnes hver gang ud fra felternes udfald, Daily
   Double, Final og laererens rettelser. Derfor kan et klik mere paa + eller
   − altid fortryde.

   Et felt hedder "r.k.i": runde, kategori og raekke (0 er det mindste
   beloeb).

   T.fase
     intro   braettet fyldes, og kategorierne vises én ad gangen (T.vist)
     braet   felterne vaelges; T.aabent er det felt, der staar fremme
     final   T.final.trin: kategori, indsats, spoergsmaal, svar
     slut    resultatet
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var VERSION = 1;
    var Q = null;
    var T = null;

    function noegle(r, k, i) { return r + "." + k + "." + i; }
    function del(n) {
        var p = String(n).split(".");
        return { r: +p[0], k: +p[1], i: +p[2] };
    }
    function lagernoegle() { return "nk-jeopardy-" + Q.id; }

    function runde(r) { return Q.runder[r === undefined ? T.runde : r]; }
    function stoersteBeloeb(r) {
        var v = runde(r).vaerdier;
        return v[v.length - 1];
    }

    function holdliste(navne) {
        return navne.map(function (n, h) {
            return { navn: String(n || "").trim() || "Hold " + (h + 1), justering: 0 };
        });
    }

    /* Daily Double: laast i data eller tilfaeldigt i raekke 3-5 */
    function vaelgDobbelt() {
        var ud = [];
        Q.runder.forEach(function (R, r) {
            if (R.dobbelt) {
                R.dobbelt.forEach(function (p) { ud.push(noegle(r, p[0], p[1])); });
                return;
            }
            var mulige = [], fra = Math.min(2, R.vaerdier.length - 1);
            R.kategorier.forEach(function (K, k) {
                K.felter.forEach(function (f, i) { if (i >= fra) mulige.push(noegle(r, k, i)); });
            });
            ud = ud.concat(NK.bland(mulige).slice(0, R.antalDobbelt || 1));
        });
        return ud;
    }

    function gyldig(t) {
        return !!(t && t.version === VERSION && t.quiz === Q.id && t.hold && t.hold.length
            && t.felter && t.final && Q.runder[t.runde]);
    }

    var S = NK.Spil = {};

    S.noegle = noegle;
    S.del = del;

    S.init = function (quiz) {
        Q = quiz;
        T = NK.hent(lagernoegle(), null);
        if (!gyldig(T)) T = null;
        return T;
    };

    S.Q = function () { return Q; };
    S.T = function () { return T; };
    S.gem = function () { if (T) NK.gem(lagernoegle(), T); };
    S.glem = function () { T = null; NK.glem(lagernoegle()); };

    S.nyt = function (navne, ur) {
        T = {
            version: VERSION,
            quiz: Q.id,
            fase: "intro",
            runde: 0,
            vist: 0,
            hold: holdliste(navne),
            ur: ur,
            kontrol: -1,
            felter: {},
            dobbelt: vaelgDobbelt(),
            aabent: null,
            visning: "spoergsmaal",
            final: { trin: "kategori", indsats: [], res: [] }
        };
        S.gem();
        return T;
    };

    /* Navne og antal, fx fra titelskaermen midt i et spil. Et nyt hold
       starter paa 0; fjernes et hold, glemmes dets point. */
    S.saetHold = function (navne) {
        var gamle = T.hold;
        T.hold = navne.map(function (n, h) {
            var navn = String(n || "").trim() || "Hold " + (h + 1);
            return gamle[h] ? { navn: navn, justering: gamle[h].justering } : { navn: navn, justering: 0 };
        });
        if (gamle.length > T.hold.length) {
            var antal = T.hold.length;
            Object.keys(T.felter).forEach(function (n) {
                var f = T.felter[n];
                Object.keys(f.res || {}).forEach(function (h) { if (+h >= antal) delete f.res[h]; });
                if (f.dd && f.dd.hold >= antal) f.dd.hold = 0;
            });
            T.final.indsats.length = Math.min(T.final.indsats.length, antal);
            T.final.res.length = Math.min(T.final.res.length, antal);
            if (T.kontrol >= antal) T.kontrol = -1;
        }
        S.gem();
    };

    S.omdoeb = function (h, navn) {
        if (!T.hold[h]) return;
        T.hold[h].navn = String(navn || "").trim() || T.hold[h].navn;
        S.gem();
    };

    S.saetUr = function (s) { T.ur = s; S.gem(); };

    /* ----- Felterne --------------------------------------------------- */
    S.felt = function (n) { return T.felter[n] || null; };
    S.data = function (n) {
        var p = del(n);
        var K = runde(p.r).kategorier[p.k];
        return { kategori: K.navn, ledetraad: K.felter[p.i].ledetraad, svar: K.felter[p.i].svar, vaerdi: runde(p.r).vaerdier[p.i] };
    };
    S.brugt = function (n) { return !!(T.felter[n] && T.felter[n].brugt); };
    S.erDobbelt = function (n) { return T.dobbelt.indexOf(n) >= 0; };

    /* Beloebet, et hold faar eller mister paa feltet: indsatsen ved Daily Double */
    S.vaerdi = function (n) {
        var f = T.felter[n];
        if (f && f.dd) return f.dd.indsats || 0;
        return S.data(n).vaerdi;
    };

    S.aabn = function (n) {
        var f = T.felter[n] || (T.felter[n] = { res: {} });
        f.brugt = true;
        if (S.erDobbelt(n) && !f.dd) {
            f.dd = { hold: T.kontrol >= 0 ? T.kontrol : 0, indsats: null, klar: false };
        }
        T.aabent = n;
        T.visning = "spoergsmaal";
        S.gem();
        return f;
    };

    S.luk = function () {
        T.aabent = null;
        T.visning = "spoergsmaal";
        S.gem();
    };

    S.vis = function (visning) {
        T.visning = visning;
        S.gem();
    };

    /* + (1) eller − (−1). Samme knap igen fortryder. Et rigtigt svar giver
       holdet braettet. Ved Daily Double er det kun holdet, der satsede. */
    S.bedoem = function (n, h, retning) {
        var f = T.felter[n];
        if (!f || !T.hold[h]) return false;
        if (f.dd && (f.dd.hold !== h || !f.dd.klar)) return false;
        f.res = f.res || {};
        if (f.res[h] === retning) delete f.res[h];
        else f.res[h] = retning;
        if (f.res[h] === 1) T.kontrol = h;
        S.gem();
        return true;
    };

    S.udfald = function (n, h) {
        var f = T.felter[n];
        return f && f.res ? (f.res[h] || 0) : 0;
    };

    /* ----- Daily Double ------------------------------------------------ */
    /* Holdet maa satse sine egne point eller op til rundens stoerste
       beloeb, hvis det har faerre. */
    S.maksIndsats = function (h, n) {
        var egne = S.grundpoint(h, n);
        return Math.max(egne, stoersteBeloeb(n ? del(n).r : T.runde));
    };

    S.ddHold = function (n, h) {
        var f = T.felter[n];
        if (!f || !f.dd || !T.hold[h]) return;
        f.dd.hold = h;
        S.gem();
    };

    S.ddIndsats = function (n, v) {
        var f = T.felter[n];
        if (!f || !f.dd) return null;
        v = v === "" || v === null || v === undefined ? NaN : Math.round(Number(v));
        f.dd.indsats = isFinite(v) ? NK.klamp(v, 0, S.maksIndsats(f.dd.hold, n)) : null;
        S.gem();
        return f.dd.indsats;
    };

    S.ddKlar = function (n) {
        var f = T.felter[n];
        if (!f || !f.dd || f.dd.indsats === null || f.dd.indsats === undefined) return false;
        f.dd.indsats = NK.klamp(f.dd.indsats, 0, S.maksIndsats(f.dd.hold, n));
        f.dd.klar = true;
        S.gem();
        return true;
    };

    /* ----- Point -------------------------------------------------------- */
    /* Point foer Final. Med udenFelt regnes et felt ikke med, saa en Daily
       Double kan aabnes igen uden at flytte sin egen graense. */
    S.grundpoint = function (h, udenFelt) {
        if (!T.hold[h]) return 0;
        var sum = T.hold[h].justering || 0;
        Object.keys(T.felter).forEach(function (n) {
            if (n === udenFelt) return;
            var r = S.udfald(n, h);
            if (r) sum += r * S.vaerdi(n);
        });
        return sum;
    };

    S.point = function (h) {
        var p = S.grundpoint(h);
        var r = T.final.res[h];
        if (r) p += r * (T.final.indsats[h] || 0);
        return p;
    };

    /* Laereren retter pointene til et bestemt tal. */
    S.saetPoint = function (h, ny) {
        if (!T.hold[h]) return;
        ny = Math.round(Number(ny));
        if (!isFinite(ny)) return;
        T.hold[h].justering += ny - S.point(h);
        S.gem();
    };

    /* ----- Runder og kategorier ---------------------------------------- */
    S.antalKategorier = function () { return runde().kategorier.length; };

    S.visKategori = function () {
        T.vist = Math.min(T.vist + 1, S.antalKategorier());
        S.gem();
    };

    S.tilBraettet = function () {
        T.vist = S.antalKategorier();
        T.fase = "braet";
        T.aabent = null;
        S.gem();
    };

    S.tilbage = function () {
        var R = runde(), antal = 0;
        R.kategorier.forEach(function (K, k) {
            K.felter.forEach(function (f, i) { if (!S.brugt(noegle(T.runde, k, i))) antal++; });
        });
        return antal;
    };

    S.rundeFaerdig = function () { return S.tilbage() === 0; };
    S.flereRunder = function () { return T.runde + 1 < Q.runder.length; };

    S.naesteRunde = function () {
        if (!S.flereRunder()) return false;
        T.runde++;
        T.fase = "intro";
        T.vist = 0;
        T.aabent = null;
        S.gem();
        return true;
    };

    /* ----- Final ------------------------------------------------------ */
    S.harFinal = function () { return !!(Q.final && Q.final.ledetraad); };

    S.startFinal = function () {
        T.fase = "final";
        T.aabent = null;
        if (!T.final.trin || T.final.trin === "slut") T.final.trin = "kategori";
        S.gem();
    };

    S.finalTrin = function (trin) {
        T.final.trin = trin;
        S.gem();
    };

    S.tilbageTilBraet = function () {
        T.fase = "braet";
        T.final.trin = "kategori";
        S.gem();
    };

    /* Kun hold med over 0 kr. deltager. */
    S.deltager = function (h) { return S.grundpoint(h) > 0; };

    S.finalIndsats = function (h, v) {
        if (!S.deltager(h)) { T.final.indsats[h] = 0; S.gem(); return 0; }
        v = Math.round(Number(v));
        T.final.indsats[h] = isFinite(v) ? NK.klamp(v, 0, S.grundpoint(h)) : 0;
        S.gem();
        return T.final.indsats[h];
    };

    S.bedoemFinal = function (h, retning) {
        if (!S.deltager(h)) return false;
        T.final.res[h] = T.final.res[h] === retning ? 0 : retning;
        S.gem();
        return true;
    };

    S.slut = function () {
        T.fase = "slut";
        S.gem();
    };

    S.tilbageTilFinal = function () {
        T.fase = "final";
        T.final.trin = "svar";
        S.gem();
    };

    /* Holdene efter point, flest foerst. */
    S.rangliste = function () {
        return T.hold.map(function (x, h) { return h; })
            .sort(function (a, b) { return S.point(b) - S.point(a) || a - b; });
    };

    S.vindere = function () {
        var liste = S.rangliste();
        var top = S.point(liste[0]);
        return liste.filter(function (h) { return S.point(h) === top; });
    };
}());
