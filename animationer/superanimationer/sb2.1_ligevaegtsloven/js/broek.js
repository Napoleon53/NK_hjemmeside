/* =====================================================================
   broek.js - modellen: reaktionsbroeken regnet af skemaet

   Facit regnes af skemaet efter reglerne og staar ingen steder i data:
     * produkterne (efter pilen) i taelleren, reaktanterne i naevneren
     * koefficienten bliver til eksponenten
     * faste stoffer (s) og opløsningsmidlet (l) er ikke med

   Elevens broek er to raekker brikker: { k: "stof", v: "H2" },
   { k: "eks", v: 3 } og { k: "tegn", v: "·" } (ogsaa "+", "−" og "1").
   B.laes laver en raekke om til led, B.dom finder den foerste fejl og
   B.hintTrin trappen paa tre trin til den fejl. Rækkefoelgen af leddene
   er ligegyldig: [A]·[B] er det samme som [B]·[A].
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var B = {};

    /* ----- Skrivemaaden --------------------------------------------------- */
    /* "CO3^2-" -> CO₃²⁻, "NH4^+" -> NH₄⁺, "Fe^3+" -> Fe³⁺ */
    B.skriv = function (s) {
        var d = String(s).split("^");
        var f = NK.formel(d[0]);
        if (d[1]) {
            var m = /^(\d*)([+-])$/.exec(d[1]);
            if (m) f += NK.ladningHaevet((m[1] ? parseInt(m[1], 10) : 1) * (m[2] === "+" ? 1 : -1));
        }
        return f;
    };

    /* Koncentrationen: [H₂] */
    B.kon = function (s) { return "[" + B.skriv(s) + "]"; };

    /* Et led med eksponent: [H₂]³ (en eksponent paa 1 skrives ikke) */
    B.led = function (s, e) { return B.kon(s) + (e > 1 ? NK.haevet(e) : ""); };

    /* Flere led med gangeprik, og 1, hvis der ingen er */
    B.ledene = function (liste) {
        if (!liste.length) return "1";
        return liste.map(function (l) { return B.led(l.s, l.e); }).join("·");
    };

    /* Hele broeken paa én linje: [NH₃]² / ([N₂]·[H₂]³) */
    B.linje = function (f) {
        var t = B.ledene(f.num), n = B.ledene(f.den);
        if (!f.den.length) return t;
        if (f.num.length > 1) t = "(" + t + ")";
        if (f.den.length > 1) n = "(" + n + ")";
        return t + " / " + n;
    };

    /* Broeken som HTML med taeller over naevner */
    B.broekHTML = function (f, kl) {
        return '<span class="vbroek' + (kl ? " " + kl : "") + '"><span>' + NK.html(B.ledene(f.num)) +
            "</span><span>" + NK.html(B.ledene(f.den)) + "</span></span>";
    };

    /* K med det lille bogstav: K, K<sub>s</sub>, K<sub>b</sub>, K<sub>v</sub> */
    B.kHTML = function (opg) {
        return "K" + (opg.ksub ? "<sub>" + opg.ksub + "</sub>" : "");
    };

    B.TILSTAND = { g: "gas", aq: "opløst i vand", l: "væske", s: "fast stof" };

    /* Et stof i skemaet med tallet foran og tilstandsformen: 3H₂(g) */
    B.art = function (a) {
        return (a.k > 1 ? a.k : "") + B.skriv(a.s) + "(" + a.t + ")";
    };

    B.skemaTekst = function (opg) {
        function side(l) { return l.map(function (x) { return B.art({ k: x[0], s: x[1], t: x[2] }); }).join(" + "); }
        return side(opg.r) + " ⇌ " + side(opg.p);
    };

    /* ----- Skemaet ----------------------------------------------------------- */
    /* Alle stoffer i skemaet: { s, k, t, side: "r" eller "p" } */
    B.alle = function (opg) {
        var ud = [];
        opg.r.forEach(function (x) { ud.push({ s: x[1], k: x[0], t: x[2], side: "r" }); });
        opg.p.forEach(function (x) { ud.push({ s: x[1], k: x[0], t: x[2], side: "p" }); });
        return ud;
    };

    B.find = function (opg, s) {
        var a = B.alle(opg);
        for (var i = 0; i < a.length; i++) if (a[i].s === s) return a[i];
        return null;
    };

    /* Faste stoffer og opløsningsmidlet er ikke med */
    B.udelades = function (a) { return a.t === "s" || a.t === "l"; };

    B.facit = function (opg) {
        var f = { num: [], den: [] };
        B.alle(opg).forEach(function (a) {
            if (B.udelades(a)) return;
            (a.side === "p" ? f.num : f.den).push({ s: a.s, e: a.k });
        });
        return f;
    };

    /* ----- Elevens raekke af brikker ---------------------------------------- */
    function fejl(kode, i, x) {
        var f = { kode: kode, i: i };
        if (x) Object.keys(x).forEach(function (k) { f[k] = x[k]; });
        return { ok: false, fejl: f };
    }

    B.laes = function (tok) {
        if (!tok.length) return { ok: true, led: [] };
        var i, ener = [];
        for (i = 0; i < tok.length; i++) if (tok[i].k === "tegn" && tok[i].v === "1") ener.push(i);
        if (ener.length) {
            if (tok.length === 1) return { ok: true, led: [], en: true };
            /* 1 med en eksponent (1²) er stadig 1: saadan regner eleven, naar det
               udeladte stof har et tal foran (elev, 6. okt. 2026) */
            if (tok.length === 2 && ener[0] === 0 && tok[1].k === "eks") return { ok: true, led: [], en: true, enEks: tok[1].v };
            return fejl("en", ener[0]);
        }
        var led = [], venter = true;            /* venter: der skal komme et stof nu */
        for (i = 0; i < tok.length; i++) {
            var t = tok[i], sidst = led[led.length - 1];
            if (t.k === "stof") {
                if (!venter) return fejl("prik-mangler", i, { a: sidst.s, b: t.v });
                led.push({ s: t.v, e: 1, i: i, eks: -1 });
                venter = false;
            } else if (t.k === "eks") {
                if (venter) return fejl("eks-foerst", i, { v: t.v });
                if (sidst.eks >= 0) return fejl("to-eks", i, { a: sidst.s });
                sidst.e = t.v;
                sidst.eks = i;
            } else if (t.v === "+" || t.v === "−") {
                return fejl("plus", i, { v: t.v });
            } else {
                if (venter) return fejl("prik-loes", i);
                venter = true;
            }
        }
        if (venter) return fejl("prik-loes", tok.length - 1);
        return { ok: true, led: led };
    };

    /* Leddene samlet: { H2: 3 }. Staar et stof flere gange, laegges
       eksponenterne sammen, som naar man ganger. */
    function samlet(led) {
        var m = {};
        led.forEach(function (l) { m[l.s] = (m[l.s] || 0) + l.e; });
        return m;
    }

    function ens(a, b) {
        var ka = Object.keys(a), kb = Object.keys(b);
        if (ka.length !== kb.length) return false;
        for (var i = 0; i < ka.length; i++) if (a[ka[i]] !== b[ka[i]]) return false;
        return true;
    }

    /* Samme stof uden ladning: [CH₃COO] mod CH₃COO⁻ */
    function udenLadning(opg, s) {
        var a = B.alle(opg);
        for (var i = 0; i < a.length; i++) if (a[i].s.split("^")[0] === s && a[i].s !== s) return a[i];
        return null;
    }

    var ZN = { num: "tælleren", den: "nævneren" };
    B.ZN = ZN;

    /* ----- Dommen: den foerste fejl ----------------------------------------------
       Svar: { ok: true } eller { ok: false, kode, tekst, z, rod: [{ z, i }],
       s (det stof, fejlen handler om) og de oplysninger, hintet skal bruge }.
       Taelleren tjekkes foer naevneren, og inden for en side: tegnene,
       fremmede stoffer, faste stoffer og vand, forkert side, gentagelser,
       manglende stoffer og til sidst eksponenterne. */
    B.dom = function (opg, num, den) {
        var F = B.facit(opg);
        var sider = { num: num || [], den: den || [] };
        var laest = {};

        if (!sider.num.length && !sider.den.length) {
            return { ok: false, kode: "tom", z: "num", rod: [], tekst: "Brøken er tom." };
        }

        var z, i, a, r, en = {}, enEks = {};
        for (z in sider) {
            r = B.laes(sider[z]);
            if (!r.ok) return syntaks(r.fejl, z, sider[z]);
            laest[z] = r.led;
            en[z] = !!r.en;
            enEks[z] = r.enEks;
        }

        /* Hele broeken vendt: taeller og naevner er byttet om */
        if (F.den.length && ens(samlet(laest.num), samlet(F.den)) && ens(samlet(laest.den), samlet(F.num))) {
            var alleRod = [];
            ["num", "den"].forEach(function (zz) { laest[zz].forEach(function (l) { alleRod.push({ z: zz, i: l.i }); }); });
            return { ok: false, kode: "byttet", z: "num", rod: alleRod,
                tekst: "Tæller og nævner er byttet om. Den brøk hører til den omvendte reaktion." };
        }

        var rigtigSide = { num: "p", den: "r" };
        for (z in laest) {
            var L = laest[z];
            /* Stoffer, der ikke skal staa her */
            for (i = 0; i < L.length; i++) {
                a = B.find(opg, L[i].s);
                if (!a) {
                    var u = udenLadning(opg, L[i].s);
                    return { ok: false, kode: "fremmed", z: z, rod: [{ z: z, i: L[i].i }], s: L[i].s, ligner: u ? u.s : null,
                        tekst: B.kon(L[i].s) + " står ikke i skemaet." };
                }
                if (B.udelades(a)) {
                    return { ok: false, kode: "udeladt", z: z, rod: rodFor(z, L[i]), s: a.s, t: a.t,
                        tekst: B.kon(a.s) + " skal ikke stå i brøken." };
                }
                if (a.side !== rigtigSide[z]) {
                    return { ok: false, kode: "side", z: z, rod: rodFor(z, L[i]), s: a.s, side: a.side,
                        tekst: B.kon(a.s) + " står i " + ZN[z] + ", men " + B.skriv(a.s) + " står " +
                            (a.side === "r" ? "før" : "efter") + " pilen." };
                }
            }
            /* Samme stof flere gange */
            var set = {};
            for (i = 0; i < L.length; i++) {
                if (set[L[i].s]) {
                    var dobbelt = L.filter(function (l) { return l.s === L[i].s; });
                    var rod = [];
                    dobbelt.forEach(function (l) { rod = rod.concat(rodFor(z, l)); });
                    return { ok: false, kode: "gentaget", z: z, rod: rod, s: L[i].s,
                        tekst: B.kon(L[i].s) + " står flere gange i " + ZN[z] + "." };
                }
                set[L[i].s] = 1;
            }
            /* Manglende stoffer */
            var FL = F[z];
            if (!L.length && FL.length) {
                return { ok: false, kode: "tom-side", z: z, rod: en[z] ? (enEks[z] ? [{ z: z, i: 0 }, { z: z, i: 1 }] : [{ z: z, i: 0 }]) : [],
                    tekst: en[z] ? "Der står 1 i " + ZN[z] + ", men der er stoffer, der skal med." :
                        (z === "num" ? "Tælleren" : "Nævneren") + " er tom." };
            }
            for (i = 0; i < FL.length; i++) {
                if (!set[FL[i].s]) {
                    return { ok: false, kode: "mangler", z: z, rod: [], s: FL[i].s,
                        tekst: "Der mangler et stof i " + ZN[z] + "." };
                }
            }
            /* Eksponenterne */
            for (i = 0; i < L.length; i++) {
                a = B.find(opg, L[i].s);
                if (L[i].e !== a.k) {
                    return { ok: false, kode: "eksponent", z: z, rod: rodFor(z, L[i]), s: a.s, k: a.k, e: L[i].e,
                        tekst: "Eksponenten på " + B.kon(a.s) + " passer ikke med skemaet." };
                }
            }
        }
        /* enEks: eleven skrev 1 med en eksponent; linjen siger, at det er 1 */
        return enEks.den ? { ok: true, enEks: enEks.den } : { ok: true };
    };

    /* Leddet og dets eksponent, som skal have en roed ring */
    function rodFor(z, l) {
        var r = [{ z: z, i: l.i }];
        if (l.eks >= 0) r.push({ z: z, i: l.eks });
        return r;
    }

    function syntaks(f, z, tok) {
        var ud = { ok: false, kode: f.kode, z: z, rod: [{ z: z, i: f.i }], v: f.v, a: f.a, b: f.b };
        switch (f.kode) {
        case "en":
            ud.tekst = "1 står sammen med andre brikker i " + ZN[z] + ".";
            break;
        case "prik-mangler":
            ud.rod = [{ z: z, i: f.i - 1 }, { z: z, i: f.i }];
            if (tok[f.i - 1] && tok[f.i - 1].k === "eks") ud.rod.push({ z: z, i: f.i - 2 });
            ud.tekst = "Der mangler et tegn mellem " + B.kon(f.a) + " og " + B.kon(f.b) + ".";
            break;
        case "eks-foerst":
            ud.tekst = "Eksponenten " + NK.haevet(f.v) + " står ikke lige efter et stof.";
            break;
        case "to-eks":
            ud.tekst = B.kon(f.a) + " har to eksponenter.";
            break;
        case "plus":
            ud.tekst = "Der står " + f.v + " i " + ZN[z] + ". Det hører ikke hjemme i en reaktionsbrøk.";
            break;
        default:
            ud.kode = "prik-loes";
            ud.tekst = "En gangeprik i " + ZN[z] + " har ikke et stof på begge sider.";
        }
        return ud;
    }

    /* ----- Hinttrappen ------------------------------------------------------------
       Tre trin: hvad man skal se paa (uden svaret) > hvad der staar i
       skemaet > hvad man goer. s er det stof (eller en liste af stoffer),
       der lyser i skemaet. */
    function liste(navne) {
        if (navne.length < 2) return navne.join("");
        return navne.slice(0, -1).join(", ") + " og " + navne[navne.length - 1];
    }

    function begynd(opg, z) {
        var F = B.facit(opg);
        var side = z === "num" ? "p" : "r";
        var arter = B.alle(opg).filter(function (a) { return a.side === side; });
        var ude = arter.filter(B.udelades);
        var trin3;
        if (!F[z].length) {
            trin3 = (z === "num" ? "Tælleren" : "Nævneren") + " skal være 1, fordi ingen af stofferne skal med.";
        } else {
            trin3 = (z === "num" ? "Tælleren" : "Nævneren") + " skal være " + B.ledene(F[z]) + ".";
        }
        if (ude.length && F[z].length) {
            trin3 += " " + liste(ude.map(function (a) { return B.skriv(a.s) + "(" + a.t + ")"; })) + " er ikke med.";
        }
        return {
            s: arter.map(function (a) { return a.s; }),
            trin: [
                z === "num" ? "Begynd med tælleren. I tælleren står stofferne efter pilen." :
                    "Nu nævneren. I nævneren står stofferne før pilen.",
                (z === "num" ? "Efter" : "Før") + " pilen står " + liste(arter.map(B.art)) + ".",
                trin3
            ]
        };
    }

    B.hintTrin = function (opg, num, den) {
        var d = B.dom(opg, num, den);
        if (d.ok) return { s: null, trin: ["Brøken er klar til at blive tjekket. Tryk Tjek brøken."] };
        var zn = ZN[d.z], K = d.s ? B.kon(d.s) : "", f = d.s ? B.skriv(d.s) : "";
        var op = d.z === "num" ? "op i tælleren" : "ned i nævneren";
        switch (d.kode) {
        case "tom":
        case "tom-side":
            return begynd(opg, d.z);
        case "plus":
            return { s: null, trin: ["Se på tegnene mellem leddene i " + zn + ".",
                "Leddene i en reaktionsbrøk ganges sammen. Der står aldrig + eller −.",
                "Byt " + d.v + " ud med ·."] };
        case "prik-mangler":
            return { s: d.a, trin: ["Se på, hvad der står mellem " + B.kon(d.a) + " og " + B.kon(d.b) + ".",
                "Leddene ganges sammen, så der skal stå · mellem to stoffer.",
                "Træk · ind mellem " + B.kon(d.a) + " og " + B.kon(d.b) + "."] };
        case "prik-loes":
            return { s: null, trin: ["Se på gangeprikkerne i " + zn + ".",
                "En gangeprik står mellem to stoffer. Den kan ikke stå forrest, bagerst eller ved siden af en anden gangeprik.",
                "Fjern den gangeprik, der er i overskud."] };
        case "en":
            return { s: null, trin: ["Se på 1 i " + zn + ".",
                "1 skriver man kun, når der ikke står noget andet.",
                "Fjern 1 fra " + zn + "."] };
        case "eks-foerst":
            return { s: null, trin: ["Se på eksponenten " + NK.haevet(d.v) + ".",
                "En eksponent hører til stoffet lige foran den.",
                "Flyt " + NK.haevet(d.v) + " hen lige efter det stof, den hører til."] };
        case "to-eks":
            return { s: d.a, trin: ["Se på " + B.kon(d.a) + ".",
                "Et stof kan kun have én eksponent.",
                "Fjern den ene eksponent efter " + B.kon(d.a) + "."] };
        case "byttet":
            return { s: null, trin: ["Se på, hvilken side af pilen stofferne i tælleren står.",
                "Produkterne står efter pilen og skal i tælleren. Reaktanterne skal i nævneren.",
                "Byt om på tælleren og nævneren."] };
        case "fremmed":
            if (d.ligner) {
                return { s: d.ligner, trin: ["Sammenlign " + K + " med stofferne i skemaet.",
                    "I skemaet står " + B.skriv(d.ligner) + " med ladning.",
                    "Brug " + B.kon(d.ligner) + " i stedet for " + K + "."] };
            }
            return { s: null, trin: ["Sammenlign stofferne i brøken med skemaet.",
                K + " står ikke i skemaet. Brug kun stofferne, som de står der.",
                "Træk " + K + " ud af brøken."] };
        case "udeladt":
            return { s: d.s, trin: ["Se på tilstandsformen efter " + f + " i skemaet.",
                d.t === "s" ? f + "(s) er et fast stof. Et fast stof har samme koncentration hele tiden, så det er ikke med i brøken." :
                    f + "(l) er opløsningsmidlet. Koncentrationen af vand ændrer sig praktisk talt ikke, så det er ikke med i brøken.",
                "Træk " + K + " ud af brøken."] };
        case "side":
            return { s: d.s, trin: ["Se på, hvilken side af pilen " + f + " står.",
                f + " står " + (d.side === "r" ? "før pilen. Det er en reaktant, og reaktanterne står i nævneren." :
                    "efter pilen. Det er et produkt, og produkterne står i tælleren."),
                "Flyt " + K + " " + (d.side === "r" ? "ned i nævneren" : "op i tælleren") + "."] };
        case "gentaget":
            var a = B.find(opg, d.s);
            return { s: d.s, trin: ["Se på " + K + ". Det står flere gange i " + zn + ".",
                "Et stof skrives én gang, og koefficienten bliver til eksponenten.",
                "Skriv " + B.led(d.s, a.k) + " én gang."] };
        case "mangler":
            var m = B.find(opg, d.s);
            var trin2 = m.s === "H2O" && m.t === "g" ?
                "H₂O står før pilen som gas, H₂O(g). En gas er med i brøken som de andre stoffer." :
                f + " står " + (m.side === "r" ? "før" : "efter") + " pilen, men " + K + " er ikke i " + zn + ".";
            return { s: d.s, trin: ["Gå stofferne " + (d.z === "num" ? "efter" : "før") + " pilen igennem. Er de alle med i " + zn + "?",
                trin2,
                "Træk " + K + " " + op + "."] };
        case "eksponent":
            if (d.k > 1) {
                return { s: d.s, trin: ["Se på tallet foran " + f + " i skemaet.",
                    "Der står " + d.k + " foran " + f + ". Koefficienten bliver til eksponenten.",
                    "Leddet skal være " + B.led(d.s, d.k) + "."] };
            }
            return { s: d.s, trin: ["Se på tallet foran " + f + " i skemaet.",
                "Der står ikke noget tal foran " + f + ". Så er eksponenten 1, og den skrives ikke.",
                "Fjern eksponenten efter " + K + "."] };
        }
        return { s: null, trin: ["Sammenlign brøken med skemaet."] };
    };

    /* ----- Fane 2: hvorfor en del af broeken er rigtig ------------------------------ */
    B.godDel = function (opg, del) {
        if (del.t === "tegn" && del.v === "·") return "Gangeprikken er rigtig. Leddene i en reaktionsbrøk ganges sammen.";
        if (del.t === "en") return "1 er rigtig. Ingen af stofferne før pilen skal med, så nævneren er 1.";
        if (del.t === "led") {
            var a = B.find(opg, del.s);
            if (!a) return "";
            return B.led(del.s, del.e) + " er rigtig. " + B.skriv(a.s) + " står " + (a.side === "r" ? "før" : "efter") +
                " pilen" + (a.k > 1 ? " med " + a.k + " foran" : "") + ", så det står i " + (a.side === "r" ? "nævneren" : "tælleren") +
                (a.k > 1 ? " med eksponenten " + a.k + "." : ".");
        }
        return "";
    };

    /* Delen skrevet som paa tavlen */
    B.delTekst = function (del) {
        if (del.t === "led") return B.led(del.s, del.e);
        if (del.t === "tegn") return del.v;
        if (del.t === "faktor") return String(del.v);
        if (del.t === "inde") return "[" + del.k + B.skriv(del.s) + "]";
        return "1";
    };

    NK.Broek = B;
}());
