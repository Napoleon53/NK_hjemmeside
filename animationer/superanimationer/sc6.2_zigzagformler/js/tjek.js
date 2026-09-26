/* =====================================================================
   tjek.js - tjek af det, eleven skriver og tegner

   Et forkert svar giver en besked, der passer til fejlen, ligesom
   NameChecker i den gamle 6.4, men sidegrupperne findes nu ved at laese
   navnet, ikke ved at soege efter bogstaver (saa "ethyl" ikke findes
   inde i "methyl").

     formel(raa, C, H, alken)   molekylformlen (fanen Zigzag)
     navn(raa, maal)            et navn (fanen Navne)
     tegning(res, maal, stereo) en tegning mod et opgavemolekyle
                                (fanerne Zigzag og Navne); res er NK.Navn.analyser

   Svarene er { ok, besked, note, tom }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};

    var ORD = ["", "én", "to", "tre", "fire", "fem", "seks"];
    var MULT = { di: 2, tri: 3, tetra: 4, penta: 5 };
    var SUBNAVNE = ["methyl", "ethyl", "propyl", "butyl", "pentyl", "fluor", "chlor", "brom", "iod"];

    /* ----- Molekylformlen ---------------------------------------------------- */
    T.formel = function (raa, C, H, alken) {
        var s = NK.ascii(raa || "").replace(/\s+/g, "");
        if (!s) return { tom: true, besked: "Skriv molekylformlen i feltet, fx C5H12." };
        var m = /^C(\d*)H(\d*)$/i.exec(s);
        if (!m) {
            if (/^H\d*C\d*$/i.test(s)) return { besked: "Skriv C først og så H, fx C5H12." };
            return { besked: "Skriv formlen som C og H med antallet bagefter, fx C5H12." };
        }
        var c = m[1] === "" ? 1 : parseInt(m[1], 10), h = m[2] === "" ? 1 : parseInt(m[2], 10);
        if (c === C && h === H) {
            if (!/^C/.test(s) || !/H/.test(s)) return { ok: true, note: "Rigtigt. Grundstofsymbolerne skrives med stort: C og H." };
            return { ok: true };
        }
        if (c !== C) return { besked: "Tæl C-atomerne igen. Der er ét ved hvert knæk og hver ende." };
        if (alken && h === 2 * C + 2) return { besked: "Det er formlen for en alkan. Dobbeltbindingen giver to H færre." };
        return { besked: "C-tallet passer. Tæl H igen: hvert C har fire bindinger i alt." };
    };

    /* ----- Navne ------------------------------------------------------------------ */
    T.normaliser = function (s) {
        return String(s || "").toLowerCase().trim()
            .replace(/[‐-―−]/g, "-")
            .replace(/\s+/g, "")
            .replace(/\.$/, "");
    };

    function bogstaver(s) { return s.replace(/[^a-z]/g, ""); }
    function cifre(s) { return (s.match(/\d+/g) || []).map(Number).sort(function (a, b) { return a - b; }); }

    /* Sidegrupperne i et navn: { methyl: 2, ethyl: 1 } */
    function laesSidegrupper(s) {
        var t = {};
        var re = /(di|tri|tetra|penta)?(methyl|ethyl|propyl|butyl|pentyl|fluor|chlor|brom|iod)/g, m;
        while ((m = re.exec(s))) t[m[2]] = (t[m[2]] || 0) + (m[1] ? MULT[m[1]] : 1);
        return t;
    }

    /* Sidegruppernes raekkefoelge i navnet */
    function raekkefoelge(s) {
        var re = /(methyl|ethyl|propyl|butyl|pentyl|fluor|chlor|brom|iod)/g, m, ud = [];
        while ((m = re.exec(s))) if (ud.indexOf(m[1]) < 0) ud.push(m[1]);
        return ud;
    }

    /* Hvilket nummer hver sidegruppe har: ["2:methyl", "3:ethyl"] */
    function lokPar(s) {
        var re = /((?:\d+,)*\d+)-(?:di|tri|tetra|penta)?(methyl|ethyl|propyl|butyl|pentyl|fluor|chlor|brom|iod)/g, m, ud = [];
        while ((m = re.exec(s))) m[1].split(",").forEach(function (l) { ud.push(l + ":" + m[2]); });
        return ud.sort();
    }

    function forventet(res) {
        var t = {};
        (res.sub || []).forEach(function (s) { t[s.navn] = (t[s.navn] || 0) + 1; });
        return t;
    }

    function gruppeNavn(navn, n) { return ORD[n] + " " + navn + "gruppe" + (n > 1 ? "r" : ""); }

    T.navn = function (raa, maal) {
        var u = T.normaliser(raa);
        if (!u) return { tom: true, besked: "Skriv et navn i feltet." };
        var res = maal.res;
        if (u === maal.navn) return { ok: true };
        var gammel = NK.Navn.gammelForm(res);
        if (gammel && u === gammel) return { ok: true, note: "Rigtigt. Den nyere skrivemåde er " + maal.navn + "." };

        /* cis og trans */
        var uSt = /^(cis|trans)-/.exec(u);
        var uUden = uSt ? u.slice(uSt[0].length) : u;
        var gUden = gammel ? gammel.replace(/^(cis|trans)-/, "") : null;
        var restRigtig = uUden === maal.navnUden || uUden === gUden;
        if (maal.stereo && restRigtig) {
            if (!uSt) return { besked: "Resten er rigtigt. Navnet mangler cis eller trans foran." };
            return { besked: "Se på dobbeltbindingen igen. Sidder kædens to dele på samme side (cis) eller på hver sin side (trans)?" };
        }
        if (!maal.stereo && uSt && restRigtig) {
            return { besked: "Resten er rigtigt, men her er der ingen cis eller trans. Det kræver ét H og én anden gruppe på begge C-atomer i dobbeltbindingen." };
        }
        if (maal.stereo && !uSt) {
            /* Kommer til sidst, hvis resten ogsaa er forkert */
        }

        var fUden = maal.navnUden;
        var uB = bogstaver(uUden), fB = bogstaver(fUden);
        if (/(ane|ene|yne)$/.test(uB) && uB.slice(0, -1) === fB) return { besked: "Skriv navnet på dansk, uden e til sidst: " + (/an$/.test(fB) ? "pentan" : "penten") + ", ikke " + (/an$/.test(fB) ? "pentane" : "pentene") + "." };
        var alken = res.dobbelt && res.dobbelt.length > 0;

        /* Samme bogstaver: numre eller tegnsaetning */
        if (uB === fB || (gUden && uB === bogstaver(gUden))) {
            var uc = cifre(uUden), fc = cifre(fUden);
            if (!uc.length) return { besked: "Du mangler numrene: hvilket C i hovedkæden hver sidegruppe sidder på." };
            if (JSON.stringify(uc) !== JSON.stringify(fc)) {
                if (alken) {
                    var dbU = /-(\d+)-en$/.exec(uUden) || /(\d+)-[a-z]+en$/.exec(uUden);
                    if (dbU && +dbU[1] !== res.dobbelt[0]) {
                        return { besked: "Tjek dobbeltbindingens nummer. Nummerér kæden fra den ende, der er nærmest dobbeltbindingen." };
                    }
                    return { besked: "Tjek sidegruppernes numre. Dobbeltbindingen bestemmer, hvilken ende der er nummer 1." };
                }
                return { besked: "Tjek numrene. Nummerér hovedkæden fra den ende, der giver sidegrupperne de laveste numre." };
            }
            if (/\d[a-z]/.test(uUden)) return { besked: "Husk bindestreg mellem tal og navn, fx 2-methylpentan." };
            if (/[a-z]\d/.test(uUden)) return { besked: "Husk bindestreg mellem to sidegrupper, fx 3-ethyl-2-methylhexan." };
            if (/\d-\d/.test(uUden)) return { besked: "Brug komma mellem tallene for samme slags sidegruppe, fx 2,3-dimethylhexan." };
            var grupper = uUden.match(/\d+(,\d+)+/g) || [];
            var usorteret = grupper.some(function (g) {
                var t = g.split(",").map(Number);
                return t.some(function (x, i) { return i > 0 && x < t[i - 1]; });
            });
            if (usorteret) return { besked: "Skriv tallene i stigende rækkefølge, fx 2,3 og ikke 3,2." };
            if (lokPar(uUden).join() !== lokPar(fUden).join()) {
                return { besked: "Begge ender giver de samme numre. Så får den sidegruppe, der står først i alfabetet, det laveste nummer." };
            }
            return { besked: "Tjek tegnsætningen: komma mellem tal, bindestreg mellem tal og bogstaver." };
        }

        /* Hovedkaeden */
        /* Kaeden er det, der staar efter sidegrupperne (pentan, buten) */
        var forstavelser = /^((di|tri|tetra)?(methyl|ethyl|propyl|butyl|pentyl|fluor|chlor|brom|iod))*/.exec(uB)[0];
        var uHale = uB.slice(forstavelser.length);
        if (alken && /an$/.test(uB)) return { besked: "Molekylet har en dobbeltbinding. Så ender navnet på -en, ikke -an." };
        if (!alken && /en$/.test(uB)) return { besked: "Der er ingen dobbeltbinding. Så ender navnet på -an." };
        if (uHale !== bogstaver(NK.Navn.kaedeNavn(res))) {
            return { besked: "Tjek hovedkæden. Tæl C-atomerne i den længste kæde" + (alken ? " gennem dobbeltbindingen" : "") + "." };
        }

        /* Sidegrupperne */
        var fT = forventet(res), uT = laesSidegrupper(uUden);
        var i, navn;
        for (i = 0; i < SUBNAVNE.length; i++) {
            navn = SUBNAVNE[i];
            var fN = fT[navn] || 0, uN = uT[navn] || 0;
            if (fN && !uN) return { besked: "Der mangler en sidegruppe i navnet. Se efter en " + navn + "gruppe." };
            if (!fN && uN) return { besked: "Der er ingen " + navn + "gruppe i molekylet. Tæl sidegruppens C-atomer igen." };
        }
        for (i = 0; i < SUBNAVNE.length; i++) {
            navn = SUBNAVNE[i];
            var f2 = fT[navn] || 0, u2 = uT[navn] || 0;
            if (f2 !== u2) {
                var mult = ["", "", "di", "tri", "tetra"][f2] || "";
                if (f2 > 1) return { besked: "Der sidder " + gruppeNavn(navn, f2) + " på kæden. Husk " + mult + " foran: " + mult + navn + "." };
                return { besked: "Der er kun " + gruppeNavn(navn, f2) + " på kæden." };
            }
        }
        var ur = raekkefoelge(uUden), fr = raekkefoelge(fUden);
        if (ur.join() !== fr.join() && ur.slice().sort().join() === fr.slice().sort().join()) {
            return { besked: "Sidegrupperne skal stå i alfabetisk rækkefølge: " + fr.join(" før ") + "." };
        }
        if (maal.stereo && !uSt) return { besked: "Navnet mangler cis eller trans foran, og noget af resten er forkert." };
        return { besked: "Navnet er ikke helt rigtigt. Tjek hovedkæden, sidegrupperne og numrene." };
    };

    /* ----- En tegning mod et opgavemolekyle ---------------------------------------- */
    function beskriv(subs) {
        var t = {}, raek = [];
        subs.forEach(function (s) {
            if (!t[s.navn]) { t[s.navn] = 0; raek.push(s.navn); }
            t[s.navn]++;
        });
        if (!raek.length) return "ingen sidegrupper";
        var dele = raek.map(function (n) { return gruppeNavn(n, t[n]); });
        return dele.length > 1 ? dele.slice(0, -1).join(", ") + " og " + dele[dele.length - 1] : dele[0];
    }

    function samme(a, b) {
        var x = a.map(function (s) { return s.navn; }).sort().join();
        var y = b.map(function (s) { return s.navn; }).sort().join();
        return x === y;
    }

    T.tegning = function (res, maal, medStereo) {
        if (!res || !res.navn) {
            if (res && res.grund === "flere") return { besked: "Molekylet skal hænge sammen." };
            return { besked: "Det kan ikke navngives endnu. Tegn videre." };
        }
        var mr = maal.res;
        var rigtigMolekyle = res.navnUdenStereo === maal.navnUden;
        if (rigtigMolekyle && (!medStereo || !maal.stereo || res.stereo === maal.stereo)) return { ok: true };
        var hedder = "Det, du har tegnet, hedder " + (medStereo ? res.navn : res.navnUdenStereo) + ".";
        if (rigtigMolekyle) {
            if (!res.stereo) return { besked: "Molekylet er rigtigt, men kæden går lige gennem dobbeltbindingen. Tegn den med knæk, så man kan se cis eller trans." };
            return {
                besked: "Rigtigt molekyle, men det er " + res.stereo + ". Navnet siger " + maal.stereo + ": " +
                    (maal.stereo === "cis" ? "kædens to dele på samme side af dobbeltbindingen." : "kædens to dele på hver sin side af dobbeltbindingen.") +
                    " Højreklik på enden, og tegn den om."
            };
        }
        if (mr.antalDobbelt && !res.antalDobbelt) return { besked: "Molekylet mangler dobbeltbindingen. Klik på en binding for at gøre den dobbelt." };
        if (!mr.antalDobbelt && res.antalDobbelt) return { besked: "Her er der ingen dobbeltbinding. Klik på den for at gøre den enkelt igen." };
        if (res.kaede.length !== mr.kaede.length) {
            return { besked: "Din længste kæde" + (mr.antalDobbelt ? " gennem dobbeltbindingen" : "") + " har " + res.kaede.length +
                " C. Den skal have " + mr.kaede.length + " C. " + hedder };
        }
        if (mr.antalDobbelt && res.dobbelt[0] !== mr.dobbelt[0]) {
            return { besked: "Dobbeltbindingen sidder forkert. Den skal være mellem C" + mr.dobbelt[0] + " og C" + (mr.dobbelt[0] + 1) + ". " + hedder };
        }
        if (samme(res.sub, mr.sub)) return { besked: "Kæden og sidegrupperne passer, men sidegrupperne sidder på de forkerte C-atomer. " + hedder };
        return { besked: "Der skal være " + beskriv(mr.sub) + ". Din tegning har " + beskriv(res.sub) + ". " + hedder };
    };

    T.beskriv = beskriv;
    NK.Tjek = T;
}());
