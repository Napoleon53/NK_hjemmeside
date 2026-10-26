/* =====================================================================
   kemi.js - isomererne, slags isomeri og teksterne til kortet

   Alt, der har med kemien at goere, og ingen tegning:
     K.isomer(navn)       stoffet bygget af navnet (molekylemotoren) med
                          stofklasse, carbonskelet, OH-gruppens plads og
                          antal sidegrene
     K.tegning(mol)       det samme for elevens tegning
     K.optael(mol)        antal C, O og H paa tegningen
     K.formelFejl(j, t)   forklaringen, naar tegningen har en anden
                          molekylformel end jagten
     K.relation(a, b)     "kaede", "stilling", "funktion" eller "samme"
     K.ren(a, b)          sand, naar parret kun er forskelligt paa én
                          maade (de par, kortet spoerger om)
     K.partner(...)       den isomer paa hylden, kortet sammenligner med
     K.relForklaring, K.relFejl, K.relHint   teksterne til spoergsmaalet
     K.kogFacit, K.kogFejl, K.hoejestFejl     teksterne til kogepunkterne

   Slags isomeri afgoeres som i bogen (hjaelpen til opgave B3.3.3): er
   grupperne forskellige, er stofferne funktionsisomerer. Er gruppen den
   samme, men carbonkaeden forskellig, er de kaedeisomerer. Er baade
   gruppen og kaeden den samme, sidder gruppen forskellige steder, og de
   er stillingsisomerer. Carbonkaeden er hele carbonskelettet (kun C og
   bindingerne mellem dem), sammenlignet som traeer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    var TAL_T = ["intet", "ét", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti"];
    var TAL_F = ["ingen", "én", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti"];

    /* Et tal med ord: intetkoen (et atom) eller faelleskoen (en isomer) */
    K.tal = function (n, intetkoen) { return (intetkoen ? TAL_T : TAL_F)[n] || String(n); };
    K.stor = D.stor;

    /* ----- Carbonskelettet ----------------------------------------------------
       Et kanonisk navn for skelettet af C-atomer (AHU-metoden for traeer):
       to skeletter er ens, naar navnene er ens. Hver del (en ether har to)
       laves for sig, og delene sorteres. */
    function skelet(mol) {
        var C = mol.atomer.filter(function (a) { return a.el === "C"; }).map(function (a) { return a.id; });
        var erC = {};
        C.forEach(function (id) { erC[id] = true; });
        function nb(id) { return mol.naboer(id).filter(function (x) { return erC[x]; }); }
        function kode(id, far) {
            var boern = nb(id).filter(function (x) { return x !== far; }).map(function (x) { return kode(x, id); });
            boern.sort();
            return "(" + boern.join("") + ")";
        }
        var set = {}, dele = [];
        C.forEach(function (start) {
            if (set[start]) return;
            /* Atomerne i denne del */
            var del = [], stak = [start];
            set[start] = true;
            while (stak.length) {
                var x = stak.pop();
                del.push(x);
                nb(x).forEach(function (y) { if (!set[y]) { set[y] = true; stak.push(y); } });
            }
            var bedst = null;
            del.forEach(function (rod) {
                var k = kode(rod, null);
                if (bedst === null || k < bedst) bedst = k;
            });
            dele.push(bedst);
        });
        dele.sort();
        return dele.join("|");
    }

    /* Antal sidegrene paa carbonskelettet: et C med tre C-naboer giver én,
       et C med fire giver to */
    function grene(mol) {
        var n = 0;
        mol.atomer.forEach(function (a) {
            if (a.el !== "C") return;
            var c = mol.naboer(a.id).filter(function (x) { return mol.atom(x).el === "C"; }).length;
            if (c > 2) n += c - 2;
        });
        return n;
    }

    /* Gruppens plads, laest af navnet: butan-2-ol -> 2, pent-2-en -> 2.
       Ethanol -> 1 */
    function lokGruppe(navn) {
        var m = /-(\d+)-(ol|en)$/.exec(navn);
        if (m) return +m[1];
        return /ol$/.test(navn) ? 1 : 0;
    }

    /* Navnet uden gruppens tal: butan-1-ol og butan-2-ol -> butanol,
       pent-1-en og pent-2-en -> penten */
    function udenLok(navn) { return navn.replace(/-\d+-(ol|en)$/, "$1"); }

    function info(mol, res) {
        var navn = res && (res.navnUdenStereo || res.navn);
        var kl = res ? res.stofklasse : null;
        return {
            navn: navn, mol: mol, res: res, stereoNavn: res && res.navn,
            klasse: kl || "andet",
            skelet: skelet(mol), grene: grene(mol), lok: lokGruppe(navn || ""), uden: udenLok(navn || "")
        };
    }

    var cache = {};
    K.isomer = function (navn) {
        if (!cache[navn]) {
            var mol = NK.NavnLaeser.laes(navn).mol;
            cache[navn] = info(mol, NK.Navn.analyser(mol));
        }
        return cache[navn];
    };

    K.tegning = function (mol) { return info(mol, NK.Navn.analyser(mol)); };

    /* ----- Molekylformlen paa tegningen --------------------------------------- */
    K.optael = function (mol) {
        var t = mol.optaelling();
        return { C: t.C || 0, O: t.O || 0, H: t.H || 0, andet: Object.keys(t).filter(function (k) { return k !== "C" && k !== "O" && k !== "H"; }).length };
    };

    K.formelTekst = function (t) { return NK.Molekyle.formelTekst({ C: t.C, H: t.H, O: t.O }); };

    /* Forklaringen, naar tegningen ikke har jagtens molekylformel (eller null) */
    K.formelFejl = function (jagt, t) {
        var n = D.antal(jagt), f = D.formelVist(jagt);
        if (t.C !== n.C) {
            return "Tegningen har " + K.tal(t.C, true) + " carbon" + (t.C === 1 ? "atom" : "atomer") + ", men " + f + " har " +
                K.tal(n.C, true) + ". " + (t.C > n.C ? "Slet et carbonatom." : "Byg kæden længere.");
        }
        if (t.O !== n.O) {
            if (!n.O) return "Tegningen har oxygen, men " + f + " har intet oxygenatom.";
            if (!t.O) return "Tegningen har intet oxygenatom, men " + f + " har ét. Sæt en OH-gruppe på, eller gør et C til O.";
            return "Tegningen har " + K.tal(t.O, true) + " oxygenatomer, men " + f + " har ét. Slet et oxygenatom.";
        }
        if (t.H !== n.H) {
            var dbl = (n.C * 2 + 2 - n.H) / 2, har = (t.C * 2 + 2 - t.H) / 2;
            if (dbl === 1 && har === 0) return "Tegningen har ingen dobbeltbinding, men " + f + " har én. Klik på en binding med = Binding.";
            if (dbl === 1) return "Tegningen har " + K.tal(har) + " dobbeltbindinger, men " + f + " har kun én.";
            return "Tegningen har " + t.H + " hydrogenatomer, men " + f + " har " + n.H + ".";
        }
        return null;
    };

    /* ----- Slags isomeri ---------------------------------------------------------- */
    K.relation = function (a, b) {
        if (a.navn === b.navn) return "samme";
        if (a.klasse !== b.klasse) return "funktion";
        if (a.skelet !== b.skelet) return "kaede";
        return "stilling";
    };

    /* Kortet spoerger kun om par, der er forskellige paa én maade: to ethere
       sammenlignes ikke (bogen navngiver dem ikke), kaedeisomere alkoholer
       har OH paa samme nummer, og stillingsisomere har samme navn paa
       naer OH-gruppens tal (2-methylbutan-1-ol og 3-methylbutan-1-ol er
       stillingsisomerer, men det ses ikke let). */
    K.ren = function (a, b) {
        var r = K.relation(a, b);
        if (r === "samme") return false;
        if (r === "funktion") return true;
        if (a.klasse === "ether") return false;
        if (a.klasse === "alkan") return true;
        if (r === "kaede") return a.lok === b.lok;
        return a.uden === b.uden;
    };

    /* Den isomer paa hylden, den nye sammenlignes med. Den slags isomeri,
       der er spurgt mindst om i jagten, kommer foerst; derefter den sidst
       fundne. Hoejst D.SPM_PR_SLAGS spoergsmaal om hver slags. */
    K.partner = function (nyNavn, fundne, spurgt) {
        var ny = K.isomer(nyNavn), bedst = null;
        for (var i = fundne.length - 1; i >= 0; i--) {
            if (fundne[i] === nyNavn) continue;
            var f = K.isomer(fundne[i]);
            if (!K.ren(ny, f)) continue;
            var r = K.relation(ny, f), n = (spurgt && spurgt[r]) || 0;
            if (n >= D.SPM_PR_SLAGS) continue;
            if (!bedst || n < bedst.n) bedst = { navn: f.navn, rel: r, n: n };
        }
        return bedst ? { navn: bedst.navn, rel: bedst.rel } : null;
    };

    function kaedeTekst(x) {
        if (!x.grene) return "en lige kæde";
        return x.grene === 1 ? "en kæde med én sidegren" : "en kæde med " + K.tal(x.grene) + " sidegrene";
    }

    function gruppeNavn(x) { return { alkan: "alkaner", alken: "alkener", alkohol: "alkoholer", ether: "ethere" }[x.klasse] || "samme stofklasse"; }

    /* Den gruppe, der flytter sig ved stillingsisomeri */
    function gruppe(x, ejefald) {
        if (x.klasse === "alken") return ejefald ? "dobbeltbindingens" : "dobbeltbindingen";
        return ejefald ? "OH-gruppens" : "OH-gruppen";
    }

    /* Alkoholen og etheren i et par af funktionsisomerer */
    function alkEth(a, b) { return a.klasse === "alkohol" ? [a, b] : [b, a]; }

    K.relForklaring = function (nyNavn, partnerNavn) {
        var a = K.isomer(nyNavn), b = K.isomer(partnerNavn), r = K.relation(a, b);
        if (r === "funktion") {
            var p = alkEth(a, b);
            return K.stor(p[0].navn) + " er en alkohol med en OH-gruppe, og " + p[1].navn +
                " er en ether med O midt i kæden. Det er funktionsisomeri.";
        }
        if (r === "kaede") {
            return K.stor(a.navn) + " har " + kaedeTekst(a) + ", og " + b.navn + " har " + kaedeTekst(b) +
                ". Det er kædeisomeri.";
        }
        return K.stor(a.navn) + " og " + b.navn + " har samme carbonkæde, men " + gruppe(a) + (a.klasse === "alken" ? " går fra nr. " : " sidder på nr. ") +
            a.lok + " og nr. " + b.lok + ". Det er stillingsisomeri.";
    };

    /* Forklaringen til et forkert svar (valgt er "kaede", "stilling" eller "funktion") */
    K.relFejl = function (nyNavn, partnerNavn, valgt) {
        var a = K.isomer(nyNavn), b = K.isomer(partnerNavn), r = K.relation(a, b);
        if (r === "funktion") {
            var p = alkEth(a, b);
            return K.stor(p[0].navn) + " har en OH-gruppe. I " + p[1].navn + " sidder O mellem to C. Grupperne er forskellige.";
        }
        if (valgt === "funktion") {
            if (a.klasse === "alkan") return K.stor(a.navn) + " og " + b.navn + " er begge alkaner. De har ingen funktionel gruppe.";
            return K.stor(a.navn) + " og " + b.navn + " er begge " + gruppeNavn(a) + ". De har samme funktionelle gruppe.";
        }
        if (r === "kaede") {
            return "Se på carbonkæden: " + a.navn + " har " + kaedeTekst(a) + ", og " + b.navn + " har " + kaedeTekst(b) + ".";
        }
        return "Carbonkæden er den samme i " + a.navn + " og " + b.navn + ". Kun " + gruppe(a, true) + " plads er forskellig.";
    };

    K.SPM_HINT = "Har de to stoffer den samme funktionelle gruppe? Er carbonkæden den samme?";

    K.relHint = function (nyNavn, partnerNavn) {
        var a = K.isomer(nyNavn), b = K.isomer(partnerNavn), r = K.relation(a, b);
        if (r === "funktion") return "Se på oxygenatomet. Sidder det for enden som OH eller midt i kæden mellem to C?";
        if (a.klasse === "alkan") return "Alkaner har ingen funktionel gruppe. Se på, hvordan carbonkæden er bygget.";
        if (r === "kaede") return "Begge er " + gruppeNavn(a) + ". Tæl carbonatomerne i den længste kæde, og se efter sidegrene.";
        return "Begge er " + gruppeNavn(a) + " med samme kæde. Se, hvilket carbonatom " + gruppe(a) + " sidder på.";
    };

    /* ----- Kogepunkterne -------------------------------------------------------------- */

    /* Navnene sorteret fra hoejeste til laveste kogepunkt */
    K.kogFacit = function (jagt, navne) {
        return navne.slice().sort(function (x, y) { return D.isomer(jagt, y).kp - D.isomer(jagt, x).kp; });
    };

    /* T skulle staa over S i raekkefoelgen */
    K.kogFejl = function (jagt, T, S) {
        var t = K.isomer(T), s = K.isomer(S), si = D.isomer(jagt, S), ti = D.isomer(jagt, T);
        if (t.klasse === "alkohol" && s.klasse !== "alkohol") {
            return K.stor(T) + " har en OH-gruppe og danner hydrogenbindinger. Det kan " + S + " ikke, så " + T + " koger højere.";
        }
        if (si && si.form) return K.stor(S) + " er " + si.form + ". Kontaktfladen er mindre, så " + S + " koger lavere end " + T + ".";
        if (ti && ti.form) return K.stor(T) + " er " + ti.form + ", men " + S + " er endnu mere kugleformet.";
        return K.stor(T) + " koger højere end " + S + ".";
    };

    /* Eleven valgte S som den med det hoejeste kogepunkt */
    K.hoejestFejl = function (jagt, S) {
        var s = K.isomer(S);
        if (s.klasse === "ether") return K.stor(S) + " er en ether og kan ikke danne hydrogenbindinger med sig selv. Vælg en alkohol.";
        if (s.grene) return K.stor(S) + " har en forgrenet kæde. Kontaktfladen er mindre end i det stof, der koger højest.";
        return "I " + S + " sidder OH-gruppen inde på kæden. Molekylet er mere kugleformet end det stof, der koger højest.";
    };

    /* ----- Teksterne, naar tegningen ikke er en ny isomer ------------------------- */
    K.sammeTekst = function (navn) {
        return "Det er " + navn + " igen, og den står allerede på hylden. Et molekyle må vendes og drejes: det er stadig samme stof.";
    };

    /* Cis og trans af en isomer, der allerede er paa hylden */
    K.sammeStereo = function (navn, stereoNavn) {
        return K.stor(navn) + " står allerede på hylden. Din tegning er " + stereoNavn + ". Cis og trans tæller som ét stof her.";
    };

    K.kunAlkohol = function (navn) {
        return K.stor(navn) + " er en ether: O sidder mellem to carbonatomer. Her skal du kun finde alkoholerne.";
    };

    NK.Kemi = K;
}());
