/* =====================================================================
   kemi.js - formler, ionligninger og reglen for, hvornaar ioner bliver
   til salt

   Reglen: en positiv og en negativ ion, der roerer hinanden, faar en
   ramme om sig. Rammen hoerer til ét salt (Mg²⁺ og Cl⁻: MgCl₂) og venter
   paa de ioner, der mangler i én formelenhed. En fri ion af den rigtige
   slags, der roerer rammen, kommer med. Naar ladningerne gaar lige op,
   bliver rammens ioner til salt.

   Ioner i en ramme er optaget: en anden slags ion, der roerer dem, sker
   der ikke noget med. Saa er det aldrig uklart, hvad der reagerer, naar
   flere slags ioner ligger op ad hinanden: Na⁺ op ad Cl⁻ i rammen med
   Mg²⁺ bliver liggende, og rammen venter stadig paa en Cl⁻ mere.

   Er der et valg, gaar en ion foerst i en ramme, der mangler den (helst
   den, der bliver faerdig, saa den aeldste). Ellers faar den en ny ramme
   sammen med en fri ion med modsat ladning (helst den, der straks giver
   et salt, saa den aeldste).

   Filen tegner ikke og kender ikke brættet. Den faar brikkerne som en
   graf: noder { id: { ion, orden, ramme } } og kanter { id: { id2: true } },
   og rammerne som { nr: { id, kat, an, x, y } }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function ion(id) { return D.IONER[id]; }

    /* Na⁺, SO₄²⁻ */
    function ionTekst(i) {
        return i.sym + NK.ladningHaevet(i.q);
    }

    /* Forholdet mellem ionerne: x positive for hver y negative. */
    function forhold(kat, an) {
        var g = NK.gcd(kat.q, an.q);
        return { x: Math.abs(an.q) / g, y: kat.q / g };
    }

    function del(i, n) {
        if (n === 1) return i.sym;
        return (i.sammensat ? "(" + i.sym + ")" : i.sym) + NK.saenket(n);
    }

    /* Formlen for saltet: NaCl, MgCl₂, Al₂O₃, Mg(OH)₂, Al₂(SO₄)₃ */
    function formel(kat, an) {
        var f = forhold(kat, an);
        return del(kat, f.x) + del(an, f.y);
    }

    /* 2 Al³⁺ + 3 O²⁻ → Al₂O₃ */
    function ionligning(kat, an) {
        var f = forhold(kat, an);
        return (f.x > 1 ? f.x + " " : "") + ionTekst(kat) + " + "
            + (f.y > 1 ? f.y + " " : "") + ionTekst(an) + " → " + formel(kat, an);
    }

    /* Alle salte paa en sværhedsgrad, i den raekkefoelge de staar i panelet */
    function salte(niveau) {
        var ud = [];
        niveau.kat.forEach(function (k) {
            niveau.an.forEach(function (a) {
                var kat = ion(k), an = ion(a), f = forhold(kat, an);
                ud.push({ noegle: k + "-" + a, kat: kat, an: an, x: f.x, y: f.y,
                          stoerrelse: f.x + f.y, formel: formel(kat, an) });
            });
        });
        return ud;
    }

    /* Ionerne til én formelenhed, som en liste af ion-id'er */
    function enhedsIoner(salt) {
        var ud = [], i;
        for (i = 0; i < salt.x; i++) ud.push(salt.kat.id);
        for (i = 0; i < salt.y; i++) ud.push(salt.an.id);
        return ud;
    }

    /* ----- Rammerne -------------------------------------------------------- */

    /* Brikkerne i en ramme */
    function iRamme(noder, nr) {
        return Object.keys(noder).filter(function (id) { return noder[id].ramme === nr; });
    }

    /* Hvor mange positive (nk) og negative (na) ioner er der i listen? */
    function tael(noder, ids) {
        var t = { nk: 0, na: 0 };
        ids.forEach(function (id) { if (noder[id].ion.q > 0) t.nk++; else t.na++; });
        return t;
    }

    function haengerSammen(ids, kanter) {
        if (!ids.length) return false;
        var med = {}, set = {}, stak = [ids[0]], n = 0;
        ids.forEach(function (id) { med[id] = true; });
        set[ids[0]] = true;
        while (stak.length) {
            var id = stak.pop();
            n++;
            for (var nb in (kanter[id] || {})) {
                if (med[nb] && !set[nb]) { set[nb] = true; stak.push(nb); }
            }
        }
        return n === ids.length;
    }

    /* Lad rammerne vokse, og giv frie par en ramme, til der ikke sker mere.
       Retter noder[id].ramme og rammer, og giver
         reaktioner  de rammer, der gik lige op (ionerne er fri af rammen igen)
         nye         numrene paa de rammer, der kom til og stadig venter
         med         { ramme, id } for hver ion, der kom med i en ramme
       nyId: den brik, der lige er landet (kan mangle). lavNr giver et nyt
       rammenummer. */
    function bind(noder, kanter, rammer, nyId, lavNr) {
        var ud = { reaktioner: [], nye: [], med: [] };
        var brugt = {};
        nyId = nyId === undefined || nyId === null ? null : String(nyId);

        function fri(id) { return !!noder[id] && !brugt[id] && !noder[id].ramme; }

        /* En ramme, der er gaaet i stykker (en fuld raekke tog en ion med,
           eller ionerne roerer ikke laengere hinanden), oploeses */
        Object.keys(noder).forEach(function (id) {
            if (noder[id].ramme && !rammer[noder[id].ramme]) noder[id].ramme = 0;
        });
        Object.keys(rammer).forEach(function (n) {
            var R = rammer[n], ids = iRamme(noder, R.id), t = tael(noder, ids);
            if (!t.nk || !t.na || !haengerSammen(ids, kanter)) {
                ids.forEach(function (id) { noder[id].ramme = 0; });
                delete rammer[n];
            }
        });

        function faerdig(R, ids) {
            ud.reaktioner.push({
                ids: ids.slice().sort(), kat: R.kat, an: R.an, x: R.x, y: R.y,
                formel: formel(R.kat, R.an), ligning: ionligning(R.kat, R.an),
                medNy: nyId !== null && ids.indexOf(nyId) >= 0
            });
            ids.forEach(function (id) { brugt[id] = true; noder[id].ramme = 0; });
            delete rammer[R.id];
        }

        /* En ramme vokser med én ion, eller to rammer af samme salt, der
           roerer hinanden og tilsammen hoejst er én formelenhed, bliver til én */
        function voks() {
            var bedst = null;
            function foer(a, b) {
                if (!b) return true;
                if (a.fuld !== b.fuld) return a.fuld;
                if (a.ny !== b.ny) return a.ny;
                if (a.R.id !== b.R.id) return a.R.id < b.R.id;
                return a.orden < b.orden;
            }
            Object.keys(rammer).forEach(function (n) {
                var R = rammer[n], ids = iRamme(noder, R.id), t = tael(noder, ids);
                ids.forEach(function (m) {
                    for (var nb in (kanter[m] || {})) {
                        var N = noder[nb], k = null;
                        if (!N || brugt[nb] || N.ramme === R.id) continue;
                        if (!N.ramme) {
                            if ((N.ion.id === R.kat.id && t.nk < R.x) || (N.ion.id === R.an.id && t.na < R.y)) {
                                k = { R: R, id: nb, fuld: ids.length + 1 === R.x + R.y, ny: nb === nyId, orden: N.orden };
                            }
                        } else {
                            var R2 = rammer[N.ramme];
                            if (R2 && R2.id > R.id && R2.kat.id === R.kat.id && R2.an.id === R.an.id) {
                                var ids2 = iRamme(noder, R2.id), t2 = tael(noder, ids2);
                                if (t.nk + t2.nk <= R.x && t.na + t2.na <= R.y) {
                                    k = { R: R, flet: R2, ids2: ids2, fuld: ids.length + ids2.length === R.x + R.y, ny: false, orden: N.orden };
                                }
                            }
                        }
                        if (k && foer(k, bedst)) bedst = k;
                    }
                });
            });
            if (!bedst) return false;
            var R = bedst.R;
            if (bedst.flet) {
                bedst.ids2.forEach(function (id) { noder[id].ramme = R.id; });
                delete rammer[bedst.flet.id];
            } else {
                noder[bedst.id].ramme = R.id;
                ud.med.push({ ramme: R.id, id: bedst.id });
            }
            if (bedst.fuld) faerdig(R, iRamme(noder, R.id));
            return true;
        }

        /* En fri positiv og en fri negativ ion, der roerer hinanden, faar en ramme */
        function nyRamme() {
            var bedst = null;
            function foer(a, b) {
                if (!b) return true;
                if (a.ny !== b.ny) return a.ny;
                if (a.fuld !== b.fuld) return a.fuld;
                if (a.orden !== b.orden) return a.orden < b.orden;
                return a.k + "," + a.a < b.k + "," + b.a;
            }
            Object.keys(noder).forEach(function (k) {
                if (!fri(k) || noder[k].ion.q <= 0) return;
                for (var a in (kanter[k] || {})) {
                    if (!fri(a) || noder[a].ion.q >= 0) continue;
                    var f = forhold(noder[k].ion, noder[a].ion);
                    var kand = { k: k, a: a, x: f.x, y: f.y, ny: k === nyId || a === nyId,
                                 fuld: f.x + f.y === 2, orden: noder[k].orden + noder[a].orden };
                    if (foer(kand, bedst)) bedst = kand;
                }
            });
            if (!bedst) return false;
            var R = { id: lavNr(), kat: noder[bedst.k].ion, an: noder[bedst.a].ion, x: bedst.x, y: bedst.y };
            rammer[R.id] = R;
            noder[bedst.k].ramme = R.id;
            noder[bedst.a].ramme = R.id;
            if (bedst.fuld) faerdig(R, [bedst.k, bedst.a]);
            else ud.nye.push(R.id);
            return true;
        }

        for (var sikring = 0; sikring < 500; sikring++) {
            if (!voks() && !nyRamme()) break;
        }
        ud.nye = ud.nye.filter(function (nr) { return !!rammer[nr]; });
        return ud;
    }

    NK.Kemi = {
        ion: ion,
        ionTekst: ionTekst,
        forhold: forhold,
        formel: formel,
        ionligning: ionligning,
        salte: salte,
        enhedsIoner: enhedsIoner,
        iRamme: iRamme,
        bind: bind
    };
}());
