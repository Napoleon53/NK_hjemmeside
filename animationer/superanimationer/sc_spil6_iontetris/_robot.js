/* =====================================================================
   Udviklervaerktoej. Indgaar ikke i spillet og kan slettes.

   Robotspiller til Ion-Tetris: koerer spillets egen logik (kerne, data,
   kemi, braet, spil) i Node uden browser og laegger hver brik det bedste
   sted uden tidspres. Bruges til at maale, hvor svært spillet er, foer
   der skrues paa andelen af sten (sten i D.NIVEAUER) eller paa, hvor
   meget saltet spraenger (D.SPRAENG). Resultaterne staar i README under
   Balancen.

   Brug:  node _robot.js [spil pr. niveau] [stoej] [SPRAENG] [sten]
          node _robot.js 40 200            40 spil, en robot, der sjusker
          node _robot.js 12 0              den perfekte robot
          node _robot.js 40 200 1.5        proev en anden spraengning
          node _robot.js 40 200 1 0.5,0.33,0.17   og andre andele af sten

   stoej: robotten giver hvert muligt traek et tal og vaelger det hoejeste.
   Med stoej laegges et tilfaeldigt tal (op til +/- stoej/2) til, saa den
   af og til vaelger et daarligere traek, som en elev under tidspres.
   200 giver en spiller, der vinder ca. halvdelen af spillene paa Let.
   ===================================================================== */
var fs = require("fs"), path = require("path"), vm = require("vm");

var ANTAL = parseInt(process.argv[2] || "12", 10);
var STOEJ = parseFloat(process.argv[3] || "200");
var SPRAENG = process.argv[4] !== undefined && process.argv[4] !== "-" ? parseFloat(process.argv[4]) : null;
var STEN = process.argv[5] ? process.argv[5].split(",").map(parseFloat) : null;
var MAKS = 500;         /* brikker, foer et spil opgives */

/* Spillets filer i en lukket verden med sin egen, faste tilfaeldighed */
function lav(seed) {
    var lager = {};
    var win = { localStorage: { getItem: function (k) { return lager[k] || null; }, setItem: function (k, v) { lager[k] = v; }, removeItem: function (k) { delete lager[k]; } } };
    var ctx = vm.createContext({ window: win, console: console });
    ["kerne", "data", "kemi", "braet", "spil"].forEach(function (f) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, "js", f + ".js"), "utf8"), ctx, { filename: f + ".js" });
    });
    vm.runInContext("(function(s){ s = s >>> 0 || 1; Math.random = function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s % 1000000) / 1000000; }; })(" + seed + ")", ctx);
    return win.NK;
}

/* Kopi af brættet, saa et traek kan proeves */
function kopi(NK, B) {
    var K = new NK.Braet();
    K.g = B.g.map(function (r) { return r.map(function (c) { return c ? { id: c.id } : null; }); });
    K.stykker = {};
    Object.keys(B.stykker).forEach(function (id) {
        var s = B.stykker[id], n = {};
        for (var k in s) n[k] = s[k];
        K.stykker[id] = n;
    });
    K.naesteId = B.naesteId;
    K.naesteEnhed = B.naesteEnhed;
    K.rammer = {};
    Object.keys(B.rammer).forEach(function (r) { K.rammer[r] = B.rammer[r]; });
    K.naesteRamme = B.naesteRamme;
    return K;
}

/* Alt det, der sker, naar en brik er landet */
function afvikl(B, nyId) {
    var salte = [], rk = 0;
    for (var i = 0; i < 60; i++) {
        var r = B.reager(nyId);
        nyId = undefined;
        if (r.length) {
            r.forEach(function (x) { salte.push(x.formel); });
            B.fjernSalt();
            var n = 0;
            while (B.tyngdeSkridt() && n++ < 40) { /* falder */ }
            continue;
        }
        var f = B.fuldeRaekker();
        if (f.length) { rk += f.length; B.fjernRaekker(f); continue; }
        break;
    }
    return { salte: salte, rk: rk };
}

/* Et tal for, hvor godt brættet ser ud: lavt, jaevnt og uden huller er
   godt, salt er bedst (mest et salt, der mangler i panelet) */
function vurder(sp, B, res, nyId) {
    var H = B.H, W = B.B, x, y, hoejder = [], huller = 0, sum = 0, ujaevn = 0, maks = 0;
    for (x = 0; x < W; x++) {
        var h = 0, set = false;
        for (y = 0; y < H; y++) {
            if (B.g[y][x]) { if (!set) { h = H - y; set = true; } }
            else if (set) huller++;
        }
        hoejder.push(h);
        sum += h;
        if (h > maks) maks = h;
    }
    for (x = 1; x < W; x++) ujaevn += Math.abs(hoejder[x] - hoejder[x - 1]);
    var p = -5.1 * sum - 36 * huller - 1.8 * ujaevn + 76 * res.rk;
    if (maks > 14) p -= (maks - 14) * 60;
    var set2 = {};
    res.salte.forEach(function (f) {
        var ny = !sp.salte[f] && !set2[f];
        set2[f] = true;
        p += ny ? 900 : 160;
    });
    /* En ion, der ligger op ad en modsat ladet ion, er paa vej til at blive salt */
    var s = B.stykker[nyId];
    if (s && !s.sten && !s.salt) {
        var naboOk = false;
        for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
            var c = B.g[y][x];
            if (!c || c.id !== nyId) continue;
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
                var n = B.stykke(x + d[0], y + d[1]);
                if (n && !n.sten && !n.salt && n.id !== nyId && n.ion.q * s.ion.q < 0) naboOk = true;
            });
        }
        if (naboOk) p += 45;
    }
    return p;
}

function vaelg(NK, sp) {
    var a = sp.aktiv, bedst = null;
    for (var rot = 0; rot < 4; rot++) {
        for (var bx = -3; bx < 10; bx++) {
            if (!sp.braet.passer(a.form, rot, bx, a.y)) continue;
            var by = sp.braet.bund({ form: a.form, rot: rot, x: bx, y: a.y });
            var forsoeg = { form: a.form, rot: rot, x: bx, y: by, ion: a.ion, sten: a.sten };
            if (sp.braet.overBraettet(forsoeg)) continue;
            var K = kopi(NK, sp.braet);
            var id = K.placer(forsoeg);
            var res = afvikl(K, a.sten ? undefined : id);
            var p = vurder(sp, K, res, id) + Math.random() * 0.01 + (Math.random() - 0.5) * STOEJ;
            if (!bedst || p > bedst.p) bedst = { p: p, rot: rot, x: bx };
        }
        if (NK.Braet.FORMER[a.form].fast) break;
    }
    return bedst;
}

function etSpil(niveau, seed) {
    var NK = lav(seed);
    if (SPRAENG !== null) NK.Data.SPRAENG = SPRAENG;
    if (STEN) ["let", "middel", "svaer"].forEach(function (n, i) { NK.Data.NIVEAUER[n].sten = STEN[i]; });
    var sp = new NK.Spil(niveau);
    sp.start();
    var brikker = 0;
    while (sp.tilstand === "koerer" && brikker < MAKS) {
        if (!sp.aktiv) break;
        var v = vaelg(NK, sp);
        if (v) { sp.aktiv.rot = v.rot; sp.aktiv.x = v.x; }
        sp.tryk("slip");
        var sik = 0;
        while (sp.ryddes && sik++ < 400) sp.opdater(0.05);
        brikker++;
    }
    return { vundet: sp.tilstand === "vundet", brikker: brikker, salte: sp.fundne(), af: sp.salteListe.length, raekker: sp.raekker, sprangt: sp.sprangt };
}

console.log(ANTAL + " spil pr. niveau, stoej " + STOEJ + (SPRAENG !== null ? ", SPRAENG " + SPRAENG : "") + (STEN ? ", sten " + STEN.join(" / ") : ""));
["let", "middel", "svaer"].forEach(function (niveau, ni) {
    var vundet = 0, brik = [], salt = 0, rk = 0, sprangt = 0;
    for (var g = 0; g < ANTAL; g++) {
        var r = etSpil(niveau, 7000 + ni * 131 + g * 17);
        if (r.vundet) { vundet++; brik.push(r.brikker); }
        salt += r.salte / r.af;
        rk += r.raekker;
        sprangt += r.sprangt;
    }
    var snit = brik.length ? Math.round(brik.reduce(function (a, b) { return a + b; }, 0) / brik.length) : 0;
    console.log(niveau + ": vundet " + vundet + " af " + ANTAL + (snit ? " (ca. " + snit + " brikker)" : "")
        + ", salte i snit " + Math.round(100 * salt / ANTAL) + " %, fulde rækker " + (rk / ANTAL).toFixed(1)
        + ", sprængte stenfelter " + (sprangt / ANTAL).toFixed(0));
});
