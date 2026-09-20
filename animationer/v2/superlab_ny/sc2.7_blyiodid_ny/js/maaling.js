/* =====================================================================
   maaling.js - maalingerne og afvejningens regel i sc2.7

   En maaling er et TIDSPUNKT, ikke et svar: eleven koeler en klar
   oploesning af og trykker paa »Notér temperatur« (eller K), saa snart
   de foerste krystaller kommer. Det, der noteres, er det, termometeret i
   bægerglasset viser. Facit regnes af verden i det oejeblik (journal.js):
   den temperatur, hvor alt det Pb2+ og I-, der er i glasset, netop kan
   vaere oploest (NK.Stof.maetningsT af PbI2's K(T)). Maalingen er rigtig,
   naar den ligger hoejst TOLERANCE °C derfra - som i den gamle sc2.7.

   Protokollen fra den gamle er med: en temperatur kan kun noteres, naar
   oploesningen har vaeret helt klar siden sidste tilsaetning (ellers er
   der ingen »foerste« krystaller), naar der er krystaller i glasset nu,
   og naar termometeret sidder i glasset. Hvornaar glasset sidst var klart,
   huskes af udloeseren »klar« i js/forloeb.js (husk), for det er historie
   og ikke tilstand: det, der huskes, er glassets samlede indhold af Pb og
   I i det oejeblik. Er indholdet det samme nu, er der ikke tilsat noget
   siden.

   Grafen (M9, laboratoriet/js/graf.js): hver maaling er et punkt med den
   noterede temperatur ud ad x-aksen og oploeseligheden op ad y-aksen - den
   masse PbI2, der kan dannes af det, der er i glasset, pr. 100 mL. Kurven
   med tabelvaerdierne (oploeseligheden af rent PbI2 efter K(T): 4s³ = K)
   kommer foerst, naar alle tre maalinger er noteret, saa den ikke siger
   eleven, hvornaar krystallerne skal komme.

   Afvejningens regel (bord.regel, se js/app.js): vejebaaden haeldes kun i
   bægerglasset, naar massen passer - foerste gang 0,090-0,110 g
   Pb(NO3)2, derefter 0,040-0,060 g, og KI samme masse som den Pb(NO3)2,
   der lige kom i, hoejst 0,010 g fra. Pb(NO3)2 og KI skiftes: foerst Pb,
   saa KI. Ellers gaar vejebaaden hjem til vaegten, og det staar paa
   scenen, hvad der skal til.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var St = NK.Stof, B = NK.Beholder;
    var T = function (n) { return NK.TEKST.maaling[n]; };

    var TOLERANCE = 6;           /* °C mellem noteret og facit */
    var KRYSTAL = 0.5;           /* µmol PbI2(s): saa er der krystaller - og
                                    saa ses de som flager (beholder.js) */
    var AFVEJ = { foerste: 0.100, senere: 0.050, tolerance: 0.010, forskel: 0.010 };
    var M_PB = 331.2, M_KI = 166.0;

    function tre(x) { return (Math.round(x * 1000) / 1000).toFixed(3).replace(".", ","); }
    function rx() { return St.REAKTIONER.filter(function (r) { return r.id === "pbi2"; })[0]; }

    /* Glassets samlede Pb og I (µmol), uanset om de er oploest eller
       bundet i PbI2(s) */
    function indhold(gg) {
        var o = B.samlet(gg);
        return { pb: NK.Vilkaar.tilsatUmol(o, "Pb(NO3)2(s)"), ki: NK.Vilkaar.tilsatUmol(o, "KI(s)"), o: o };
    }
    function signatur(gg) {
        var i = indhold(gg);
        return Math.round(i.pb * 10) + "/" + Math.round(i.ki * 10);
    }

    /* Er glasset klart: der er baade Pb og I i det, intet fast stof, og
       oploesningen er ikke overmaettet ved den temperatur, den har. Det
       sidste er med, for i det oejeblik, KI er oploest, og PbI2 endnu ikke
       naaet at falde ud, er glasset ogsaa uden fast stof - men det er ikke
       klart, det er kun et gab mellem to skridt. */
    function klar(gg) {
        if (!gg || B.volumen(gg) < 50) return false;
        var i = indhold(gg);
        if (!(i.pb > 1 && i.ki > 1) || St.fastIalt(i.o) >= 0.5) return false;
        var r = rx();
        return St.ionprodukt(i.o, r) < St.Kved(r, i.o.T);
    }

    function krystaller(gg) {
        return !!gg && (B.samlet(gg).n["PbI2(s)"] || 0) >= KRYSTAL;
    }

    /* Den temperatur, de foerste krystaller kommer ved (facit) */
    function maetning(gg) {
        return gg ? St.maetningsT(B.samlet(gg), rx()) : null;
    }

    /* Tabelvaerdien: g PbI2, der kan vaere oploest i 100 mL vand ved T °C.
       [Pb2+] = s og [I-] = 2s, saa 4s³ = K(T) (i mM), og s mM er
       s · 461 mg pr. liter */
    function oploeselighed(T) {
        var K = St.Kved(rx(), T);
        return Math.pow(K / 4, 1 / 3) * 461.0 * 1e-4;
    }

    /* En maalings punkt: noteret temperatur og g PbI2 pr. 100 mL */
    function punkt(post) {
        var b = post.billede || {};
        if (!(b.V > 1)) return null;
        return { x: Number(post.svar), y: b.pbi2 * 100 / b.V };
    }

    var M = {
        TOLERANCE: TOLERANCE,
        AFVEJ: AFVEJ,
        klarFor: null,           /* signaturen, da glasset sidst var klart */
        noteret: {},             /* signaturer, der er maalt */
        sidstePb: null,          /* g Pb(NO3)2 i den seneste tilsaetning */
        ventKI: false,           /* Pb er kommet i, KI mangler */

        maetning: maetning,
        oploeselighed: oploeselighed,
        klar: klar,
        krystaller: krystaller,

        nulstil: function () {
            M.klarFor = null;
            M.noteret = {};
            M.sidstePb = null;
            M.ventKI = false;
        },

        /* Udloeseren »klar« kalder den, naar glasset er blevet klart */
        husk: function (bord) {
            var gg = bord.g.baeger;
            if (klar(gg)) M.klarFor = signatur(gg);
        },

        /* Kan der noteres nu? { ok, grund } */
        kan: function (bord) {
            var gg = bord.g.baeger, tm = bord.g.termometer;
            if (!gg) return { ok: false, grund: T("intet-glas") };
            if (klar(gg)) M.klarFor = signatur(gg);
            var i = indhold(gg);
            if (i.pb < 1 || i.ki < 1) return { ok: false, grund: T("intet-stof") };
            if (!tm || tm.i !== gg) return { ok: false, grund: T("termometer") };
            var sig = signatur(gg);
            if (M.noteret[sig]) return { ok: false, grund: T("allerede") };
            if (M.klarFor !== sig) return { ok: false, grund: T("ikke-klar") };
            if (!krystaller(gg)) return { ok: false, grund: T("ingen-krystaller") };
            return { ok: true };
        },

        /* Noter temperaturen. Returnerer posten eller null. */
        noter: function (bord) {
            var k = M.kan(bord);
            if (!k.ok) { bord.besked(k.grund, "advarsel"); return null; }
            var gg = bord.g.baeger, tm = bord.g.termometer;
            var vist = Math.round((typeof tm.visT === "number" ? tm.visT : tm.T) * 10) / 10;
            var n = M.journal.antal() + 1;
            M.noteret[signatur(gg)] = true;
            M.journal.noter(String(n), vist, bord);
            bord.besked(T("noteret").replace("{n}", n).replace("{T}", vist.toFixed(1).replace(".", ",")), "gjort");
            if (NK.Lyd && NK.Lyd.klik) NK.Lyd.klik();
            bord.aendret("maaling");
            return M.journal.post(String(n));
        },

        /* ----- Afvejningens regel (bord.regel) --------------------------- */
        regel: function (gg, c, bord) {
            if (!gg || gg.type.navn !== "vejebaad" || !c || c !== bord.g.baeger) return null;
            var faste = St.faste(gg.indhold);
            if (!faste.length) return null;
            if (faste.length > 1) return T("blandet");
            /* Det, vaegten viser: tre decimaler */
            var f = faste[0], g = Math.round(f.umol * (f.stof.M || 0) * 1e-3) / 1000;
            var i = indhold(c);
            if (f.navn === "Pb(NO3)2(s)") {
                if (M.ventKI) return T("foerst-ki");
                var maal = i.pb < 1 ? AFVEJ.foerste : AFVEJ.senere;
                if (Math.abs(g - maal) > AFVEJ.tolerance + 1e-9) {
                    return T("pb-vindue").replace("{m}", tre(maal)).replace("{a}", tre(maal - AFVEJ.tolerance))
                        .replace("{b}", tre(maal + AFVEJ.tolerance)).replace("{g}", tre(g));
                }
                /* Det maa haeldes i: husk massen, saa KI kan holdes op mod den */
                M.sidstePb = g;
                M.ventKI = true;
                return null;
            }
            if (f.navn === "KI(s)") {
                if (!M.ventKI || M.sidstePb === null) return T("foerst-pb");
                if (Math.abs(g - M.sidstePb) > AFVEJ.forskel + 1e-9) {
                    return T("ki-vindue").replace("{m}", tre(M.sidstePb)).replace("{g}", tre(g));
                }
                M.ventKI = false;
                return null;
            }
            return null;
        },

        /* Grafen i maalingskortet (side.visGraf): null uden maalinger */
        graf: function () {
            var pkt = M.journal.punkter(punkt);
            if (!pkt.length) return null;
            var G = NK.TEKST.graf;
            var serier = [];
            if (M.journal.faerdig()) serier.push({ type: "kurve", f: oploeselighed, navn: G.kurve, stiplet: true });
            serier.push({ type: "punkter", punkter: pkt, navn: G.punkter });
            return {
                x: { navn: G.x, enhed: "°C", min: 0, max: 100, trin: 20 },
                y: { navn: G.y, enhed: G.yEnhed, min: 0 },
                serier: serier
            };
        },

        /* Panelets kort med maalingerne */
        visKort: function () {
            var tabel = NK.el("maaling-tabel"), tom = NK.el("maaling-tom");
            if (!tabel) return;
            var J = M.journal, poster = J.svarede().sort(function (a, b) { return +a - +b; });
            NK.saetTekst("maaling-taeller", poster.length + "/3");
            if (tom) { tom.hidden = poster.length > 0; NK.saetTekst("maaling-tom", T("tom")); }
            tabel.hidden = !poster.length;
            var note = NK.el("graf-note");
            if (note) note.textContent = M.journal.faerdig() ? NK.TEKST.graf.noteFaerdig : NK.TEKST.graf.note;
            tabel.innerHTML = "";
            if (!poster.length) return;
            var hoved = document.createElement("tr");
            T("kolonner").forEach(function (k) { var th = document.createElement("th"); th.textContent = k; hoved.appendChild(th); });
            tabel.appendChild(hoved);
            poster.forEach(function (id) {
                var p = J.post(id), b = p.billede || {};
                var tr = document.createElement("tr");
                [id, tre(b.pb || 0) + " g", tre(b.ki || 0) + " g", tre(b.pbi2 || 0) + " g",
                 String(p.svar.toFixed(1)).replace(".", ",") + " °C"].forEach(function (x, k) {
                    var td = document.createElement("td");
                    td.textContent = x;
                    if (k === 4) td.className = J.rigtig(id) ? "rigtig" : "forkert";
                    tr.appendChild(td);
                });
                tabel.appendChild(tr);
            });
        }
    };

    /* Journalen: posterne hedder 1, 2 og 3. Facit er maetningstemperaturen
       lige nu; oejebliksbilledet er masserne, den masse PbI2, der kan
       dannes, rumfanget (mL) og opskriften paa glasset (til grafen og
       tegneserien) */
    M.journal = NK.Journal.lav({
        id: "maaling",
        kraevede: ["1", "2", "3"],
        tolerance: TOLERANCE,
        facit: function (id, bord) {
            var t = maetning(bord.g.baeger);
            return t === null ? -999 : t;
        },
        billede: function (id, bord) {
            var gg = bord.g.baeger, i = indhold(gg);
            var pb = i.pb * M_PB * 1e-6, ki = i.ki * M_KI * 1e-6;
            return {
                pb: pb, ki: ki,
                pbi2: Math.min(i.pb, i.ki / 2) * 461.0 * 1e-6,
                V: B.volumen(gg),
                T: B.samlet(gg).T,
                opl: St.opskrift(B.samlet(gg))
            };
        }
    });

    NK.MAALING = M;
}());
