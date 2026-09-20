/* =====================================================================
   tjek.js - oevelsestjekket (udviklervaerktoej)

   En generisk validering, som ethvert forsoeg paa motoren koeres igennem.
   Den spoerger ikke, om forsoeget er godt, men om det overhovedet kan
   haenge sammen: findes alle stoffer i stoftabellen, findes alt udstyr i
   kataloget, kan alle sprites indlaeses, peger hvert trin paa noget, der
   findes, kan forloebets betingelser naas, og er der plads paa bordet.
   Det er det, der goer en konverteret eller genereret oevelse til noget,
   der bestaar eller dumper, i stedet for noget, man haaber virker.

   Brug fra en side, der har forsoeget i en iframe (som selvtesterne):

       var r = NKTjek.koer(ramme.contentWindow);
       r.fejl, r.advarsler            antal
       r.afsnit                       [{ titel, poster: [{ slags, tekst, note }] }]
                                      slags: "ok", "fejl" eller "advarsel"

   Tjekket laeser forsoeget som DATA - opstillingen, bordets valg,
   forloebet og teksterne - og kun det, der ikke kan ses i data, spoerges
   levende paa siden (sprites, journaler, elementerne i panelet, og om
   hvert vilkaar kan proeves paa bordet, som det staar). Derfor kan en fejl
   saettes ind i en kopi af data, og tjekket skal fange den:

       NKTjek.koer(vin, { rediger: function (f) { f.borde[0].opstilling.push(...); } })
       NKTjek.selvproeve(vin)         saetter ti slags fejl ind én ad gangen
                                      og siger, om hver blev fanget

   Forsoeget findes paa siden saadan: har siden en skal (NK.Side.nu), er
   det dens valg (opstilling, valg eller plan, forloeb, tekster, quiz og
   serie). Ellers laeses NK.RUM_PLAN eller NK.OPSTILLING og NK.BORD_VALG,
   NK.FORLOEB og NK.TEKST, som et forsoeg skriver dem - ogsaa naar siden
   ikke kunne starte, for det er tit netop dét, tjekket skal forklare.

   Det, der kan give en falsk fejl, er en advarsel: en betingelse skrevet
   som en funktion (proev) kan ikke afgoeres paa papiret, og et flag kan
   vaere sat af forsoegets egen kode. Et forloeb kan sige, hvilke flag dets
   kode saetter, med flagFraKode: ["navn", ...]; saa er de ikke en fejl.

   Indgaar ikke i forsoegene; kun _oevelsestjek.html og selvtesterne
   laeser den.
   ===================================================================== */
(function (rod) {
    "use strict";

    var STUE = 20;              /* grader, naar intet andet er sagt */
    var KOG = 100;              /* det hoejeste, en vandig oploesning naar */
    var T_LUFT = 5;             /* reaktionsvarme kan flytte et glas et par grader */
    var FOD_LUFT = 2;           /* enheder: en fod paa bordpladen eller en hylde */
    var SAMME_FOD = 0.5;        /* enheder: to ting staar paa samme linje (samme dybde).
                                   Staar den ene bare lidt bagved, maa de gerne
                                   overlappe paa tegningen (kurven og spatelboetten) */
    var OVERLAP = 2;            /* enheder, to ting maa roere hinanden */
    var HYLDE_H = 21;           /* hyldens tykkelse paa tegningen */
    var BOBLE_NAVN = 26;        /* navnet under zoomboblen */

    function har(o, n) { return !!o && Object.prototype.hasOwnProperty.call(o, n); }
    function liste(x) { return x === undefined || x === null ? [] : (Array.isArray(x) ? x : [x]); }
    function unik(a) { var set = {}; return a.filter(function (x) { if (set[x]) return false; set[x] = true; return true; }); }
    function tal(x, d) { return Number(x).toFixed(d === undefined ? 0 : d).replace(".", ","); }

    /* ================================================================
       Forsoeget som data
       ================================================================ */
    function beskriv(vin) {
        var NK = vin.NK || null;
        var f = { vin: vin, NK: NK, navn: "", borde: [], forloeb: null, F: null, tekster: null,
                  side: null, sideValg: null, startet: false, journaler: null };
        if (!NK) return f;
        var side = NK.Side && NK.Side.nu ? NK.Side.nu : null;
        var sv = side ? side.valg : null;
        f.side = side;
        f.sideValg = sv;
        f.startet = !!(side || NK.bord || NK.rum);
        f.navn = (sv && sv.navn) || vin.location.pathname.replace(/\/(index\.html)?$/, "").split("/").pop();

        var plan = sv ? sv.plan : (NK.rum ? NK.rum.plan : NK.RUM_PLAN);
        if (plan && plan.rum) {
            plan.rum.forEach(function (r, i) {
                var levende = NK.rum && NK.rum.rum[i] && NK.rum.rum[i].navn === r.navn ? NK.rum.rum[i].bord : null;
                f.borde.push({ rum: r.navn, titel: r.titel || r.navn, opstilling: r.opstilling || [], valg: r.valg || {}, bord: levende });
            });
        } else {
            var op = (sv && sv.opstilling) || NK.OPSTILLING;
            var valg = (sv && sv.valg) || NK.BORD_VALG || {};
            var bord = side ? side.etBord : (NK.bord || null);
            if (op) f.borde.push({ rum: null, titel: "bordet", opstilling: op, valg: valg, bord: bord });
        }
        f.forloeb = (sv && sv.forloeb) || NK.FORLOEB || null;
        f.F = side ? side.forloeb || null : (NK.Forloeb && NK.Forloeb.nu) || null;
        f.tekster = (sv && sv.tekster) || NK.TEKST || null;
        f.journaler = NK.Journal ? NK.Journal.alle : null;
        return f;
    }

    /* En kopi, der kan skrives i uden at roere siden: nye lister og nye
       poster, saa en fejl kan saettes ind og tages ud igen */
    function kopi(f) {
        var k = {}, n;
        for (n in f) if (har(f, n)) k[n] = f[n];
        k.borde = f.borde.map(function (b) {
            return { rum: b.rum, titel: b.titel, bord: b.bord, valg: b.valg,
                     opstilling: b.opstilling.map(function (s) { var t = {}, m; for (m in s) if (har(s, m)) t[m] = s[m]; return t; }) };
        });
        if (f.forloeb) {
            k.forloeb = {};
            for (n in f.forloeb) if (har(f.forloeb, n)) k.forloeb[n] = f.forloeb[n];
            k.forloeb.trin = (f.forloeb.trin || []).slice();
            k.forloeb.udloesere = (f.forloeb.udloesere || []).slice();
        }
        if (f.tekster) {
            k.tekster = {};
            for (n in f.tekster) if (har(f.tekster, n)) k.tekster[n] = f.tekster[n];
        }
        return k;
    }

    /* ================================================================
       Resultatet
       ================================================================ */
    function Resultat(navn) {
        this.navn = navn;
        this.afsnit = [];
        this.fejl = 0;
        this.advarsler = 0;
        this.nu = null;
    }
    Resultat.prototype.overskrift = function (titel) {
        this.nu = { titel: titel, poster: [] };
        this.afsnit.push(this.nu);
    };
    /* problemer tomme: ok, med note; ellers fejl (eller advarsel) med
       problemerne som note */
    Resultat.prototype.tjek = function (tekst, problemer, note, slags) {
        problemer = unik(problemer || []);
        if (!problemer.length) { this.nu.poster.push({ slags: "ok", tekst: tekst, note: note }); return true; }
        slags = slags || "fejl";
        if (slags === "fejl") this.fejl++; else this.advarsler++;
        this.nu.poster.push({ slags: slags, tekst: tekst, note: problemer.join("; "), problemer: problemer });
        return false;
    };
    Resultat.prototype.info = function (tekst, note) {
        this.nu.poster.push({ slags: "info", tekst: tekst, note: note });
    };
    /* Alle fejl (og advarsler) som tekst, fx til en selvtests note */
    Resultat.prototype.fund = function (medAdvarsler) {
        var ud = [];
        this.afsnit.forEach(function (a) {
            a.poster.forEach(function (p) {
                if (p.slags === "fejl" || (medAdvarsler && p.slags === "advarsel")) ud.push(p.tekst + ": " + p.note);
            });
        });
        return ud;
    };

    /* ================================================================
       Hjaelpere over data
       ================================================================ */

    /* Alle genstande i alle borde: navn -> [{ spec, bord }] */
    function genstande(f) {
        var ud = {};
        f.borde.forEach(function (b) {
            b.opstilling.forEach(function (s) {
                if (!s || !s.navn) return;
                (ud[s.navn] = ud[s.navn] || []).push({ spec: s, bord: b });
            });
            /* Det, motoren selv stiller op (kaffekoppen), findes ogsaa */
            if (b.bord && b.bord.liste) {
                b.bord.liste.forEach(function (gg) {
                    if (ud[gg.navn]) return;
                    var fraSpec = b.bord.specs && b.bord.specs.some(function (s) { return s.navn === gg.navn; });
                    if (!fraSpec) ud[gg.navn] = [{ spec: { navn: gg.navn, motor: true }, bord: b }];
                });
            }
        });
        return ud;
    }

    function typeAf(NK, spec) {
        var T = NK.Udstyr.TYPER;
        return spec && typeof spec.type === "string" ? (har(T, spec.type) ? T[spec.type] : null) : (spec && spec.type) || null;
    }

    /* Typen, som bordet bruger den: skaleret og evt. mindre (se
       bord.tilfoej). Det, der staar i eller paa noget, arver dets skala. */
    function brugtType(NK, spec, bord) {
        var t = typeAf(NK, spec);
        if (!t) return null;
        var k = spec.skala;
        var fra = spec.stativ || spec.paa;
        if (k === undefined && fra) {
            var mor = bord.opstilling.filter(function (s) { return s.navn === fra; })[0];
            if (mor) k = mor.skala;
        }
        k = Math.max(0.25, Math.min(1, k === undefined ? 1 : k));
        if (k === 1) return t;
        return spec.rumfangFoelger ? NK.Udstyr.mindre(t, k) : NK.Udstyr.skaleret(t, k);
    }

    function kan(NK, spec, egenskab) {
        var t = typeAf(NK, spec);
        return !!((t && t.kan && t.kan[egenskab]) || (spec.kan && spec.kan[egenskab]));
    }

    function stofferI(spec) {
        var ud = [];
        if (!spec || !spec.indhold) return ud;
        ["mM", "umol"].forEach(function (n) { if (spec.indhold[n]) ud = ud.concat(Object.keys(spec.indhold[n])); });
        return ud;
    }

    function erTom(spec) {
        var i = spec.indhold;
        if (!i) return true;
        if (i.V > 0) return false;
        return !stofferI(spec).some(function (n) {
            return (i.mM && i.mM[n] > 0) || (i.umol && i.umol[n] > 0);
        });
    }

    /* De stoffer, der kan opstaa ud fra det, der staar paa bordene: en
       reaktion kan loebe, naar alt paa venstre side er der (en ligevaegt
       og et bundfald ogsaa baglaens), og saa er dens produkter der ogsaa.
       Vand er der altid. Betingelser (koncentreret syre) regnes som
       opfyldt. Det er samme regnestykke som Stof.tilskuerioner. */
    function lukning(NK, f) {
        var St = NK.Stof, har2 = { "H2O": true }, brugt = [], nyt = true;
        f.borde.forEach(function (b) { b.opstilling.forEach(function (s) { stofferI(s).forEach(function (n) { har2[n] = true; }); }); });
        function alle(side) { return side.every(function (l) { return har2[l[1]]; }); }
        while (nyt) {
            nyt = false;
            St.REAKTIONER.forEach(function (rx, i) {
                if (brugt[i]) return;
                var begge = rx.slags === "ligevaegt" || rx.slags === "faeld";
                if (!alle(rx.venstre) && !(begge && alle(rx.hoejre))) return;
                brugt[i] = true;
                nyt = true;
                rx.venstre.concat(rx.hoejre).forEach(function (l) { har2[l[1]] = true; });
            });
        }
        return har2;
    }

    /* Hvor varmt og koldt et glas kan blive: stuen, badenes holdT, det,
       der staar i flaskerne, og kogepunktet, hvis noget varmer. Paa alle
       borde, for et glas kan baeres fra ét rum til et andet. */
    function temperaturer(NK, f) {
        var hoej = STUE, lav = STUE, alle = [];
        f.borde.forEach(function (b) { alle = alle.concat(b.opstilling); });
        alle.forEach(function (s) {
            if (kan(NK, s, "varmer")) hoej = Math.max(hoej, KOG);
            if (typeof s.holdT === "number") { hoej = Math.max(hoej, s.holdT); lav = Math.min(lav, s.holdT); }
            if (s.indhold && typeof s.indhold.T === "number") { hoej = Math.max(hoej, s.indhold.T); lav = Math.min(lav, s.indhold.T); }
        });
        return { hoej: hoej, lav: lav };
    }

    /* Alle strenge i et objekt, med stien til dem */
    function strenge(o, sti, ud, set) {
        ud = ud || [];
        set = set || [];
        if (typeof o === "string") { ud.push({ sti: sti, tekst: o }); return ud; }
        if (!o || typeof o !== "object" || set.indexOf(o) >= 0 || set.length > 5000) return ud;
        set.push(o);
        if (Array.isArray(o)) o.forEach(function (x, i) { strenge(x, sti + "[" + i + "]", ud, set); });
        else Object.keys(o).forEach(function (n) { strenge(o[n], sti ? sti + "." + n : n, ud, set); });
        return ud;
    }

    /* c(ion): den aktuelle koncentration skrives [Fe³⁺] (F65). c(X) er
       kun den formelle koncentration af det, der er oploest, og det er
       et salt eller en syre uden ladning: c(Fe(NO₃)₃). En ladning inden i
       c( ) betyder derfor, at det er en aktuel koncentration. */
    var C_ION = /(^|[^A-Za-z0-9_ÆØÅæøå])c\(((?:[^()]|\([^()]*\))*(?:[⁺⁻]|[A-Za-z0-9][+\-−]))\)/g;
    function cIoner(tekst) {
        var ud = [], m;
        C_ION.lastIndex = 0;
        while ((m = C_ION.exec(tekst))) ud.push("c(" + m[2] + ")");
        return ud;
    }

    /* {{navn.hvad}} i en replik (vilkaar.js' udfyld) */
    var PLADSHOLDER = /\{\{\s*([A-Za-z0-9_]+)\.([^}\s]+)\s*\}\}/g;
    function pladsholdere(tekst) {
        var ud = [], m;
        PLADSHOLDER.lastIndex = 0;
        while ((m = PLADSHOLDER.exec(tekst))) ud.push({ navn: m[1], hvad: m[2], hele: m[0] });
        return ud;
    }

    /* De genstande og stoffer, et vilkaar naevner. Det er NK.Vilkaar's
       naevnte og naevnteStoffer, naar siden har vilkaar.js; ellers de
       samme regler her, saa et forloeb ogsaa kan tjekkes paa en side
       uden (proevebordet), og en fejl kan saettes ind i et nyt. */
    function naevnte(NK, v, ud) {
        if (NK.Vilkaar) return NK.Vilkaar.naevnte(v);
        ud = ud || [];
        if (!v || typeof v !== "object") return ud;
        if (Array.isArray(v)) { v.forEach(function (x) { naevnte(NK, x, ud); }); return ud; }
        ["alle", "nogen"].forEach(function (n) { if (v[n]) naevnte(NK, v[n], ud); });
        if (v.ikke) naevnte(NK, v.ikke, ud);
        if (v.beholder) ud.push(v.beholder);
        liste(v.alleAf).concat(liste(v.nogenAf)).forEach(function (n) { ud.push(n); });
        ["staarI", "lysere", "moerkere"].forEach(function (n) { if (v[n]) ud.push(v[n]); });
        return ud;
    }
    function naevnteStoffer(NK, v, ud) {
        if (NK.Vilkaar) return NK.Vilkaar.naevnteStoffer(v);
        ud = ud || [];
        if (!v || typeof v !== "object") return ud;
        if (Array.isArray(v)) { v.forEach(function (x) { naevnteStoffer(NK, x, ud); }); return ud; }
        ["alle", "nogen"].forEach(function (n) { if (v[n]) naevnteStoffer(NK, v[n], ud); });
        if (v.ikke) naevnteStoffer(NK, v.ikke, ud);
        if (v.stof) ud.push(v.stof);
        return ud;
    }

    /* Replikkens linjer som én liste */
    function linjer(sig) {
        return liste(sig).filter(function (x) { return typeof x === "string"; });
    }

    /* Konsekvenserne i et saa: de objekter, der er data, og om der er kode */
    function konsekvenser(saa) {
        var ud = { data: [], kode: false };
        if (!saa) return ud;
        if (typeof saa === "function") { ud.kode = true; return ud; }
        liste(saa).forEach(function (s) {
            if (typeof s === "function") { ud.kode = true; return; }
            if (s && typeof s === "object") {
                ud.data.push(s);
                if (s.kald) ud.kode = true;
            }
        });
        return ud;
    }

    /* ================================================================
       Kan et vilkaar naas? Paa papiret: listen af grunde til, at det
       ALDRIG kan blive sandt, eller tom, naar det kan (eller ikke kan
       afgoeres). ctx: { NK, f, navne, lukning, flag, kode, fraKode }.
       ================================================================ */
    function hvorfor(v, ctx) {
        if (v === undefined || v === null || v === true) return [];
        if (v === false) return ["vilkåret er false"];
        if (typeof v === "function") { ctx.uafgjort++; return []; }
        if (Array.isArray(v)) return v.reduce(function (a, x) { return a.concat(hvorfor(x, ctx)); }, []);
        if (typeof v !== "object") return [];
        var ud = [];
        if (v.alle) ud = ud.concat(hvorfor(v.alle, ctx));
        if (v.nogen) {
            var grene = liste(v.nogen).map(function (x) { return hvorfor(x, ctx); });
            if (grene.length && grene.every(function (g) { return g.length; })) {
                ud.push("ingen af mulighederne i nogen kan nås (" + grene.map(function (g) { return g[0]; }).join(" / ") + ")");
            }
        }
        /* ikke: at noget IKKE er sandt kan altid naas, saa laenge man kan
           lade vaere - det afgoeres ikke paa papiret */
        if (v.flag !== undefined && !ctx.flag[v.flag] && !ctx.fraKode[v.flag]) {
            var tekst = "flaget »" + v.flag + "« sættes aldrig";
            if (ctx.kode) ctx.maaske.push(tekst + " i data (måske af kode)"); else ud.push(tekst);
        }
        if (v.proev !== undefined) ctx.uafgjort++;
        if (v.journal !== undefined && ctx.f.journaler) {
            var j = ctx.f.journaler[v.journal];
            if (!j) ud.push("journalen »" + v.journal + "« findes ikke");
            else if (v.post !== undefined && j.kraevede && j.kraevede.length && j.kraevede.indexOf(v.post) < 0) {
                ud.push("journalen »" + v.journal + "« har ingen post »" + v.post + "«");
            }
        }
        var navne = [];
        if (v.beholder !== undefined) navne = [v.beholder];
        else if (v.alleAf !== undefined) navne = liste(v.alleAf);
        else if (v.nogenAf !== undefined) navne = liste(v.nogenAf);
        if (navne.length) {
            var pr = navne.map(function (n) { return beholderHvorfor(v, n, ctx); });
            if (v.nogenAf !== undefined) {
                if (pr.every(function (g) { return g.length; })) ud.push("intet af " + navne.join(", ") + " kan: " + pr[0][0]);
            } else pr.forEach(function (g) { ud = ud.concat(g); });
        }
        return ud;
    }

    function beholderHvorfor(v, navn, ctx) {
        var NK = ctx.NK, St = NK.Stof, ud = [];
        var fund = ctx.navne[navn];
        if (!fund) return [navn + " står ikke på bordet"];
        var spec = fund[0].spec, b = fund[0].bord;
        if (spec.motor) return [];
        var t = brugtType(NK, spec, b);
        if (!t) return [navn + " er af en type, der ikke findes"];
        var holder = kan(NK, spec, "holder");
        var proeverIndhold = ["stof", "V", "T", "pH", "tom", "koger", "lysere", "moerkere"].some(function (n) { return v[n] !== undefined; });
        if (proeverIndhold && !holder) return [navn + " kan ikke rumme noget"];

        if (v.V !== undefined) {
            var over = typeof v.V === "number" ? v.V : (v.V.over !== undefined ? v.V.over : v.V.mindst);
            if (over !== undefined && t.maks && over >= t.maks) ud.push(navn + " rummer kun " + tal(t.maks, 1) + " mL, men skal have over " + tal(over, 1) + " mL");
        }
        if (v.stof !== undefined) {
            var kraev = v.over !== undefined || v.mindst !== undefined || (v.under === undefined && v.hoejst === undefined);
            if (!har(St.STOFFER, v.stof)) ud.push(v.stof + " findes ikke i stoftabellen");
            else if (kraev && !ctx.lukning[v.stof]) ud.push(v.stof + " kan ikke dannes af det, der står på bordet");
        }
        if (v.T !== undefined) {
            var tt = temperaturer(NK, ctx.f);
            var o2 = typeof v.T === "number" ? v.T : v.T.over, u2 = typeof v.T === "number" ? undefined : v.T.under;
            if (o2 !== undefined && o2 >= tt.hoej + T_LUFT) ud.push(navn + " kan ikke blive over " + tal(o2) + " °C (intet på bordet varmer så meget)");
            if (u2 !== undefined && u2 <= tt.lav - T_LUFT) ud.push(navn + " kan ikke blive under " + tal(u2) + " °C (intet på bordet køler så meget)");
        }
        if (v.koger && temperaturer(NK, ctx.f).hoej < KOG) ud.push(navn + " kan ikke koge (intet på bordet varmer)");
        var fast = kan(NK, spec, "fast");
        if (v.tom === true && !erTom(spec) && (fast || !kan(NK, spec, "haelder"))) ud.push(navn + " kan ikke tømmes");
        if (v.staarI !== undefined) {
            var m = ctx.navne[v.staarI];
            if (!m) ud.push(v.staarI + " står ikke på bordet");
            else if (!m[0].spec.motor) {
                var ms = m[0].spec, mt = typeAf(NK, ms);
                if (!(kan(NK, ms, "stoette") || (mt && mt.plade) || kan(NK, ms, "holder") || kan(NK, ms, "bad"))) {
                    ud.push("intet kan stå i eller på " + v.staarI);
                }
                if (fast && spec.stativ !== v.staarI && spec.paa !== v.staarI) ud.push(navn + " står fast og kan ikke flyttes hen i " + v.staarI);
            }
        }
        if (v.iStativ === true) {
            var stativ = ctx.f.borde.some(function (b2) { return b2.opstilling.some(function (s) { return kan(NK, s, "stoette"); }); });
            if (!stativ) ud.push("der er intet stativ på bordet");
            else if (fast && !spec.stativ) ud.push(navn + " står fast og kan ikke sættes i stativet");
        }
        ["lysere", "moerkere"].forEach(function (n) {
            if (v[n] === undefined) return;
            var a = ctx.navne[v[n]];
            if (!a) ud.push(v[n] + " står ikke på bordet");
            else if (!a[0].spec.motor && !kan(NK, a[0].spec, "holder")) ud.push(v[n] + " kan ikke rumme noget");
        });
        return ud;
    }

    /* ================================================================
       Afsnittene
       ================================================================ */

    function afsnitSiden(R, f) {
        R.overskrift("1. Forsøget");
        R.tjek("siden har motoren (NK)", f.NK ? [] : ["NK findes ikke på siden"]);
        if (!f.NK) return false;
        R.tjek("siden er startet", f.startet ? [] : ["hverken NK.Side.nu, NK.bord eller NK.rum findes - se de andre afsnit for grunden"]);
        /* Undtagelser under indlaesningen, hvis den, der aabnede siden,
           fangede dem (_oevelsestjek.html goer) */
        if (f.undtagelser) R.tjek("siden startede uden undtagelser", f.undtagelser);
        R.tjek("forsøget har en opstilling", f.borde.length ? [] : ["hverken NK.OPSTILLING eller NK.RUM_PLAN findes"]);
        var antal = f.borde.reduce(function (a, b) { return a + b.opstilling.length; }, 0);
        var F = f.forloeb;
        R.info("forsøget", f.navn + ": " + (f.borde.length > 1 ? f.borde.length + " rum, " : "") + antal + " genstande" +
            (F ? ", " + liste(F.trin).length + " trin og " + liste(F.udloesere).length + " udløsere" : ", intet forløb"));
        return f.borde.length > 0;
    }

    function afsnitStoftabellen(R, f) {
        var St = f.NK.Stof;
        R.overskrift("2. Stoftabellen");
        var ukendte = [], uafstemte = [], antal = 0;
        St.REAKTIONER.forEach(function (rx) {
            var alle = rx.venstre.concat(rx.hoejre), mangler = false;
            alle.forEach(function (l) { if (!har(St.STOFFER, l[1])) { ukendte.push(rx.id + ": " + l[1]); mangler = true; } });
            if (mangler) return;
            /* Kun det, der har atomer paa begge sider, kan regnes efter */
            if (alle.every(function (l) { return !!St.STOFFER[l[1]].atomer; })) {
                antal++;
                if (!St.afstemt(rx)) uafstemte.push(rx.id);
            }
        });
        R.tjek("alle reaktioner nævner stoffer, der findes", ukendte, St.REAKTIONER.length + " reaktioner");
        R.tjek("alle reaktioner er afstemte i atomer og ladning", uafstemte, antal + " regnet efter");
        var parFejl = [];
        St.PAR.forEach(function (p) {
            [p.ox, p.red].forEach(function (n) { if (!har(St.STOFFER, n)) parFejl.push(p.ox + "/" + p.red + ": " + n); });
        });
        R.tjek("alle redoxpar nævner stoffer, der findes", parFejl, St.PAR.length + " par");
    }

    function afsnitStofferne(R, f) {
        var NK = f.NK, St = NK.Stof;
        R.overskrift("3. Stofferne på bordet");
        var ukendte = [], noegler = [], udenHolder = [], overKant = [], ikkeFast = [], antal = 0;
        f.borde.forEach(function (b) {
            var fra = b.rum ? b.rum + ": " : "";
            b.opstilling.forEach(function (s) {
                if (!s.indhold) return;
                stofferI(s).forEach(function (n) {
                    antal++;
                    if (!har(St.STOFFER, n)) ukendte.push(fra + s.navn + ": " + n);
                });
                Object.keys(s.indhold).forEach(function (n) {
                    if (["V", "T", "mM", "umol"].indexOf(n) < 0) noegler.push(fra + s.navn + ": " + n);
                });
                var t = brugtType(NK, s, b);
                if (!t) return;
                if (!kan(NK, s, "holder")) udenHolder.push(fra + s.navn);
                if (t.maks && s.indhold.V > t.maks + 1e-9) overKant.push(fra + s.navn + ": " + tal(s.indhold.V, 1) + " mL i " + tal(t.maks, 1) + " mL");
                if (kan(NK, s, "pulver")) {
                    stofferI(s).forEach(function (n) {
                        if (har(St.STOFFER, n) && St.STOFFER[n].fase !== "s") ikkeFast.push(fra + s.navn + ": " + n);
                    });
                }
            });
        });
        R.tjek("alle stoffer på bordet findes i stoftabellen", ukendte, antal + " stoffer i flasker og glas");
        R.tjek("indholdet er skrevet med V, T, mM og umol (alt andet ignoreres)", noegler);
        R.tjek("kun det, der kan rumme noget, har indhold", udenHolder);
        R.tjek("intet er fyldt over kanten fra start", overKant);
        R.tjek("pulverglassene har fast stof i sig", ikkeFast);

        var tilsk = [];
        f.borde.forEach(function (b) {
            var v = b.valg && b.valg.tilskuere;
            if (!v || v === true) return;
            var navne = Array.isArray(v) ? v : [].concat(v.centrale || [], v.ogsaa || []);
            navne.forEach(function (n) { if (!har(St.STOFFER, n)) tilsk.push(n); });
        });
        R.tjek("tilskuerionerne i bordets valg findes i stoftabellen", tilsk);
    }

    function afsnitUdstyret(R, f) {
        var NK = f.NK, U = NK.Udstyr;
        R.overskrift("4. Udstyret");
        var ukendte = [], dobbelt = [], raekke = [], stativFejl = [], hulDobbelt = [], pladeFejl = [], luger = [];
        var rum = {};
        f.borde.forEach(function (b) { if (b.rum) rum[b.rum] = true; });
        f.borde.forEach(function (b) {
            var fra = b.rum ? b.rum + ": " : "", set = {}, huller = {};
            b.opstilling.forEach(function (s) {
                if (typeof s.type === "string" && !har(U.TYPER, s.type)) ukendte.push(fra + s.navn + ": " + s.type);
                if (set[s.navn]) dobbelt.push(fra + s.navn);
                if (s.stativ !== undefined) {
                    var st = set[s.stativ];
                    if (!st) raekke.push(fra + s.navn + " står i " + s.stativ + (b.opstilling.some(function (x) { return x.navn === s.stativ; }) ? ", som stilles op senere" : ", som ikke findes"));
                    else {
                        var tt = brugtType(NK, st, b);
                        if (!kan(NK, st, "stoette") || !tt || !tt.huller) stativFejl.push(fra + s.navn + ": " + s.stativ + " er ikke et stativ");
                        else if (s.hul !== undefined && (s.hul < 0 || s.hul >= tt.huller.length || s.hul !== Math.floor(s.hul))) {
                            stativFejl.push(fra + s.navn + ": hul " + s.hul + " findes ikke (" + s.stativ + " har " + tt.huller.length + ")");
                        } else if (s.hul !== undefined) {
                            var k = s.stativ + "#" + s.hul;
                            if (huller[k]) hulDobbelt.push(fra + s.navn + " og " + huller[k] + " i hul " + s.hul);
                            else huller[k] = s.navn;
                        }
                    }
                }
                if (s.paa !== undefined) {
                    var p = set[s.paa];
                    if (!p) raekke.push(fra + s.navn + " står på " + s.paa + (b.opstilling.some(function (x) { return x.navn === s.paa; }) ? ", som stilles op senere" : ", som ikke findes"));
                    else {
                        var pt = typeAf(NK, p);
                        if (!pt || !pt.plade) pladeFejl.push(fra + s.navn + ": " + s.paa + " har ingen plade at stå på");
                    }
                }
                if (s.type === "luge" && s.til !== undefined && !rum[s.til]) luger.push(fra + s.navn + " fører til »" + s.til + "«");
                set[s.navn] = s;
            });
        });
        R.tjek("alt udstyr i opstillingen findes i kataloget", ukendte);
        R.tjek("ingen to genstande på samme bord hedder det samme", dobbelt);
        R.tjek("stativer og plader stilles op før det, der skal stå i eller på dem", raekke);
        R.tjek("det, et glas står i, er et stativ, og hullet findes", stativFejl);
        R.tjek("to glas står ikke i samme hul", hulDobbelt);
        R.tjek("det, noget står på, har en plade", pladeFejl);
        if (f.borde.length > 1 || f.borde.some(function (b) { return b.opstilling.some(function (s) { return s.type === "luge"; }); })) {
            R.tjek("lugerne fører til rum, der findes", luger);
        }
    }

    function afsnitSprites(R, f) {
        var NK = f.NK, S = NK.Sprites;
        R.overskrift("5. Sprites");
        var uregistreret = [], brugt = {};
        f.borde.forEach(function (b) {
            b.opstilling.forEach(function (s) {
                var t = typeAf(NK, s);
                if (!t || !t.sprite) return;
                brugt[t.sprite] = true;
                if (!har(S.FILER, t.sprite)) uregistreret.push(s.navn + ": " + t.sprite);
            });
        });
        R.tjek("udstyret på bordet har sine sprites registreret", uregistreret, Object.keys(brugt).length + " slags");
        var alle = Object.keys(S.FILER), mangler = [];
        alle.forEach(function (n) {
            if (!S.klar(n)) {
                var F2 = S.FILER[n];
                mangler.push(n + " (" + (F2.mappe || "") + F2.fil + ")");
            }
        });
        R.tjek("alle sprites kunne indlæses", mangler, alle.length + " filer");
    }

    function afsnitForloebet(R, f, dyn) {
        var NK = f.NK, St = NK.Stof, V = NK.Vilkaar, doc = f.vin.document;
        R.overskrift("6. Forløbet");
        var F = f.forloeb;
        if (!F) { R.info("forsøget har intet forløb", "intet at tjekke"); return; }
        var trin = liste(F.trin), udl = liste(F.udloesere), alle = trin.concat(udl);
        var navne = genstande(f);

        /* id'er */
        var ids = {}, dobbelt = [];
        alle.forEach(function (x) { if (ids[x.id]) dobbelt.push(x.id); ids[x.id] = true; });
        R.tjek("trinnene og udløserne har hver sit id", dobbelt, trin.length + " trin, " + udl.length + " udløsere");
        var udenTekst = [];
        trin.forEach(function (x) {
            ["tekst", "kort", "hint"].forEach(function (n) {
                if (typeof x[n] !== "string" || !x[n].trim()) udenTekst.push(x.id + " mangler " + n);
            });
        });
        R.tjek("hvert trin har tekst, kort og hint", udenTekst);

        /* Det, vilkaarene naevner */
        var mangler = [], manglerStof = [];
        alle.forEach(function (x) {
            naevnte(NK, x.naar).forEach(function (n) { if (!navne[n]) mangler.push(x.id + ": " + n); });
            naevnteStoffer(NK, x.naar).forEach(function (n) { if (!har(St.STOFFER, n)) manglerStof.push(x.id + ": " + n); });
        });
        R.tjek("alle trin og udløsere nævner genstande, der står på bordet", mangler);
        R.tjek("alle trin og udløsere nævner stoffer, der findes", manglerStof);

        /* Peg, konsekvenser og replikker */
        function pegFindes(p) { return !!navne[p] || !!doc.getElementById(p); }
        var peg = [], trinRef = [], tomReplik = [], tal2 = [], flag = {}, kode = false;
        function replik(sig, hvor) {
            var l = linjer(sig);
            if (!l.length || l.some(function (x) { return !x.trim(); })) tomReplik.push(hvor);
            l.forEach(function (x) {
                pladsholdere(x).forEach(function (p) {
                    if (!navne[p.navn]) tal2.push(hvor + ": " + p.hele + " (" + p.navn + " står ikke på bordet)");
                    else if (["T", "V", "pH"].indexOf(p.hvad) < 0 && !har(St.STOFFER, p.hvad)) tal2.push(hvor + ": " + p.hele + " (" + p.hvad + " er hverken T, V, pH eller et stof)");
                });
            });
        }
        alle.forEach(function (x) {
            if (x.peg !== undefined && x.peg !== null && !pegFindes(x.peg)) peg.push(x.id + " peger på " + x.peg);
            if (x.sig !== undefined) replik(x.sig, x.id);
            var k = konsekvenser(x.saa);
            if (k.kode) kode = true;
            k.data.forEach(function (s) {
                if (s.flag !== undefined && (s.vaerdi === undefined || s.vaerdi)) flag[s.flag] = true;
                if (s.trin !== undefined && !trin.some(function (t) { return t.id === s.trin; })) trinRef.push(x.id + " gør trinnet »" + s.trin + "«, som ikke findes");
                if (s.peg !== undefined && !pegFindes(s.peg)) peg.push(x.id + " peger på " + s.peg);
                if (s.sig !== undefined) replik(s.sig, x.id);
            });
        });
        R.tjek("hvert peg er en genstand på bordet eller et element på siden", peg);
        R.tjek("konsekvenserne gør trin, der findes", trinRef);
        R.tjek("hver replik har tekst", tomReplik);
        R.tjek("tallene i replikkerne peger på noget, der findes ({{navn.T}})", tal2);

        /* Kan trinnene naas? */
        var ctx = { NK: NK, f: f, navne: navne, lukning: lukning(NK, f), flag: flag, kode: kode,
                    fraKode: {}, uafgjort: 0, maaske: [] };
        liste(F.flagFraKode).forEach(function (n) { ctx.fraKode[n] = true; });
        var umulige = [], doede = [];
        trin.forEach(function (x) { hvorfor(x.naar, ctx).forEach(function (g) { umulige.push(x.id + ": " + g); }); });
        var maaskeTrin = ctx.maaske.slice(), uafgjort = ctx.uafgjort;
        ctx.maaske = [];
        udl.forEach(function (x) { hvorfor(x.naar, ctx).forEach(function (g) { doede.push(x.id + ": " + g); }); });
        R.tjek("alle trin kan nås", umulige, trin.length + " trin" + (uafgjort ? ", heraf " + uafgjort + " vilkår som funktion, der ikke kan afgøres på papiret" : ""));
        R.tjek("alle udløsere kan nås", doede, udl.length + " udløsere", "advarsel");
        R.tjek("flagene sættes af forløbets data", maaskeTrin.concat(ctx.maaske), undefined, "advarsel");

        /* Et forsoeg i dele (del paa trin og genstande): et trin peger kun
           paa det, der staar fremme i dets egen del */
        var dele = [];
        trin.forEach(function (x) {
            if (x.del === undefined) return;
            var n = naevnte(NK, x.naar).concat(x.peg && navne[x.peg] ? [x.peg] : []);
            n.forEach(function (m) {
                var s = navne[m] && navne[m][0].spec;
                if (s && s.del !== undefined && s.del !== x.del) dele.push(x.id + " (del " + x.del + ") bruger " + m + ", der kun står fremme i del " + s.del);
            });
        });
        R.tjek("et trin i en del bruger kun det, der står fremme i den del", dele);

        /* Quizzen og tegneserien aabnes af et vilkaar */
        var sv = f.sideValg;
        if (sv && (sv.quiz || sv.serie)) {
            ctx.maaske = [];
            var laase = [];
            [["quiz", sv.quiz], ["tegneserien", sv.serie]].forEach(function (q) {
                if (q[1] && q[1].krav !== undefined) hvorfor(q[1].krav, ctx).forEach(function (g) { laase.push(q[0] + ": " + g); });
            });
            R.tjek("quizzen og tegneserien kan låses op", laase);
        }

        /* Levende: kan hvert vilkaar proeves paa bordet, som det staar, og
           er intet trin gjort, foer eleven har gjort noget? */
        if (!dyn || !f.F || !V) return;
        var levF = f.F, bord = levF.bord ? levF.bord() : null;
        if (!bord) return;
        var kaster = [], gjort = [], fyret = [];
        levF.trin.concat(levF.udloesere).forEach(function (x) {
            var sand;
            try { sand = V.opfyldt(x.naar, bord, levF); } catch (e) { kaster.push(x.id + ": " + e.message); return; }
            if (sand && levF.trin.indexOf(x) >= 0) gjort.push(x.id);
            if (sand && levF.udloesere.indexOf(x) >= 0) fyret.push(x.id);
        });
        R.tjek("hvert vilkår kan prøves på bordet uden en undtagelse", kaster);
        R.tjek("intet trin er gjort, før eleven har gjort noget", gjort);
        R.tjek("ingen udløser fyrer, før eleven har gjort noget", fyret, undefined, "advarsel");
    }

    /* Rektanglet, en genstand har paa tegnebordet, naar bordet er bygget
       (bord.tilfoej og bord.rekt, regnet paa papiret). null for det, der
       staar i eller paa noget andet: dét stiller motoren selv. */
    function rekt(NK, spec, b, doc) {
        if (spec.stativ !== undefined || spec.paa !== undefined) return null;
        var t = brugtType(NK, spec, b);
        if (!t) return null;
        var bordY = b.valg.bord || 500, p;
        if (spec.p) p = { x: spec.p.x, y: spec.p.y, v: spec.p.v || 0 };
        else if (t.sprite) {
            var y = spec.y === undefined ? bordY : spec.y;
            p = { x: spec.x - t.b / 2 + t.anker.x, y: y - t.h + t.anker.y, v: 0 };
        } else p = { x: spec.x, y: (spec.y === undefined ? bordY : spec.y) - 3, v: -Math.PI / 2 };
        var hj;
        if (t.sprite) hj = [[0, 0], [t.b, 0], [t.b, t.h], [0, t.h]];
        else {
            var L = t.laengde || 100, w = 7 * (t.skala || 1);
            hj = [[-w, 0], [w, 0], [w, L], [-w, L]];
        }
        var anker = t.anker || { x: 0, y: 0 };
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        hj.forEach(function (h) {
            var w2 = NK.tilVerden(p, anker, h[0], h[1]);
            x0 = Math.min(x0, w2.x); y0 = Math.min(y0, w2.y);
            x1 = Math.max(x1, w2.x); y1 = Math.max(y1, w2.y);
        });
        var ud = { x: x0, y: y0, b: x1 - x0, h: y1 - y0, sprite: !!t.sprite, fod: t.sprite ? y1 : (spec.y === undefined ? bordY : spec.y) };
        if (t.sprite && !p.v) {
            var fs = fodspor(NK, doc, t.sprite);
            ud.fx0 = x0 + fs.a * (x1 - x0);
            ud.fx1 = x0 + fs.b * (x1 - x0);
        } else { ud.fx0 = x0; ud.fx1 = x1; }
        return ud;
    }

    /* Fodsporet: den del af spritet, der roerer bordet - de uigennemsigtige
       pixels i de nederste FOD_H enheder, som broekdele af bredden. Et
       glas' bund er smallere end dets kasse, og to ting paa samme linje
       stoeder foerst sammen, naar fodsporene gaar ind over hinanden.
       Regnes af det indlaeste sprite (NK.Sprites.tegn); er det ikke klar,
       er fodsporet hele kassen. */
    var FOD_H = 4;
    var fodCache = {};
    function fodspor(NK, doc, navn) {
        var S = NK.Sprites, F = S.FILER[navn];
        if (!F || !S.klar(navn)) return { a: 0, b: 1 };
        if (fodCache[navn] && fodCache[navn].doc === doc) return fodCache[navn];
        var k = 2, c = doc.createElement("canvas");
        c.width = Math.ceil(F.b * k);
        c.height = Math.ceil(F.h * k);
        var ctx = c.getContext("2d");
        ctx.scale(k, k);
        S.tegn(ctx, navn, 0, 0, F.b, F.h);
        var d, a = Infinity, b = -1, bund = -1;
        try { d = ctx.getImageData(0, 0, c.width, c.height).data; } catch (e) { return { a: 0, b: 1 }; }
        for (var y = c.height - 1; y >= 0 && bund < 0; y--) {
            for (var x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40) { bund = y; break; }
        }
        for (y = Math.max(0, bund - FOD_H * k); y <= bund; y++) {
            for (x = 0; x < c.width; x++) {
                if (d[(y * c.width + x) * 4 + 3] > 40) { a = Math.min(a, x); b = Math.max(b, x + 1); }
            }
        }
        var ud = b > a ? { a: a / c.width, b: b / c.width, doc: doc } : { a: 0, b: 1, doc: doc };
        fodCache[navn] = ud;
        return ud;
    }

    function overlap(a, b, luft) {
        luft = luft || 0;
        return a.x < b.x + b.b - luft && a.x + a.b > b.x + luft && a.y < b.y + b.h - luft && a.y + a.h > b.y + luft;
    }

    function sammeDel(a, b) { return a.del === undefined || b.del === undefined || a.del === b.del; }

    function afsnitPladsen(R, f) {
        var NK = f.NK;
        R.overskrift("7. Pladsen på bordet");
        var udenfor = [], svaever = [], udOver = [], oveni = [], boble = [], vaeg = [], antal = 0;
        f.borde.forEach(function (b) {
            var fra = b.rum ? b.rum + ": " : "", va = b.valg || {};
            var B = va.bredde || 1120, H = va.hoejde || 600, bordY = va.bord || 500, forkant = bordY + (va.bordDybde || 0);
            var hylder = (va.hylder || (va.hylde === undefined ? [{ x0: 16, x1: 116, y: 268 }] : (va.hylde ? [va.hylde] : []))).slice();
            var r = [];
            b.opstilling.forEach(function (s) {
                var q = rekt(NK, s, b, f.vin.document);
                if (!q) return;
                antal++;
                r.push({ s: s, r: q });
                if (q.x < -1 || q.y < -1 || q.x + q.b > B + 1 || q.y + q.h > H + 1) udenfor.push(fra + s.navn);
                var luft = q.sprite ? FOD_LUFT : 12;
                var paaBord = q.fod >= bordY - luft && q.fod <= forkant + luft;
                var hylde = hylder.filter(function (h) { return Math.abs(q.fod - h.y) <= luft; })[0];
                if (!paaBord && !hylde && !kan(NK, s, "fast")) svaever.push(fra + s.navn + " (foden i " + tal(q.fod) + ")");
                if (hylde && !paaBord && (q.x + q.b / 2 < hylde.x0 || q.x + q.b / 2 > hylde.x1)) udOver.push(fra + s.navn);
            });
            for (var i = 0; i < r.length; i++) {
                for (var j = i + 1; j < r.length; j++) {
                    var a = r[i], c = r[j];
                    if (!sammeDel(a.s, c.s) || !a.r.sprite || !c.r.sprite) continue;
                    if (Math.abs(a.r.fod - c.r.fod) > SAMME_FOD) continue;
                    var ind = Math.min(a.r.fx1, c.r.fx1) - Math.max(a.r.fx0, c.r.fx0);
                    if (ind > OVERLAP) oveni.push(fra + a.s.navn + " og " + c.s.navn + " (" + tal(ind) + " enheder)");
                }
            }
            /* Zoomboblens hjoerne (valg.boble) og vaeggen: plakaten og pilen */
            if (va.boble) {
                var R2 = va.bobleR || 120, br = { x: va.boble.x - R2, y: va.boble.y - R2, b: 2 * R2, h: 2 * R2 + BOBLE_NAVN };
                r.forEach(function (x) { if (overlap(x.r, br)) boble.push(fra + x.s.navn); });
                hylder.forEach(function (h, k) { if (overlap({ x: h.x0, y: h.y, b: h.x1 - h.x0, h: HYLDE_H }, br)) boble.push(fra + "hylde " + k); });
                if (va.plakat && NK.Tegning.plakatMaal) {
                    var pm = NK.Tegning.plakatMaal();
                    if (overlap({ x: va.plakat.x, y: va.plakat.y, b: pm.b, h: pm.h }, br)) boble.push(fra + "plakaten");
                }
            }
            if (va.plakat && NK.Tegning.plakatMaal) {
                var m = NK.Tegning.plakatMaal(), pr = { x: va.plakat.x, y: va.plakat.y, b: m.b, h: m.h };
                r.forEach(function (x) { if (overlap(x.r, pr, OVERLAP)) vaeg.push(fra + x.s.navn + " dækker plakaten"); });
            }
            if (va.pil) {
                r.forEach(function (x) { if (overlap(x.r, va.pil, OVERLAP)) vaeg.push(fra + x.s.navn + " dækker pilen"); });
            }
        });
        R.tjek("alt står inden for laboratoriet", udenfor, antal + " genstande");
        R.tjek("alt står på bordpladen, på en hylde eller i noget andet", svaever);
        R.tjek("intet hænger ud over kanten af sin hylde", udOver);
        R.tjek("intet står oven i noget andet", oveni);
        if (f.borde.some(function (b) { return b.valg && b.valg.boble; })) R.tjek("zoomboblens hjørne er frit", boble);
        if (f.borde.some(function (b) { return b.valg && (b.valg.plakat || b.valg.pil); })) R.tjek("plakaten og pilen på væggen er fri", vaeg);
    }

    function afsnitTeksterne(R, f, dyn) {
        var NK = f.NK, St = NK.Stof, doc = f.vin.document;
        R.overskrift("8. Teksterne");
        var s = f.tekster ? strenge(f.tekster, "TEKST") : [];
        if (f.forloeb) {
            liste(f.forloeb.trin).forEach(function (x) {
                ["tekst", "kort", "hint"].forEach(function (n) { if (typeof x[n] === "string") s.push({ sti: "trin " + x.id + "." + n, tekst: x[n] }); });
            });
        }
        var cion = [], ord = [], tal2 = [];
        var navne = genstande(f);
        s.forEach(function (x) {
            cIoner(x.tekst).forEach(function (c) { cion.push(x.sti + ": " + c); });
            if (/\bundefined\b|\bNaN\b|\[object Object\]/.test(x.tekst)) ord.push(x.sti);
            pladsholdere(x.tekst).forEach(function (p) {
                if (!navne[p.navn]) tal2.push(x.sti + ": " + p.hele);
                else if (["T", "V", "pH"].indexOf(p.hvad) < 0 && !har(St.STOFFER, p.hvad)) tal2.push(x.sti + ": " + p.hele);
            });
        });
        /* Siden selv: det, der staar i panelet, introen og teorien */
        var side = [];
        if (dyn && doc.body) {
            var gaa = doc.createTreeWalker(doc.body, 4, null), n;
            while ((n = gaa.nextNode())) {
                var mor = n.parentNode && n.parentNode.nodeName;
                if (mor === "SCRIPT" || mor === "STYLE") continue;
                side.push(n.nodeValue);
            }
            var al = side.join(" ");
            cIoner(al).forEach(function (c) { cion.push("siden: " + c); });
            var m = al.match(/\bundefined\b|\bNaN\b|\[object Object\]/);
            if (m) ord.push("siden: »" + m[0] + "«");
        }
        R.tjek("en aktuel koncentration skrives [Fe³⁺] og ikke c(Fe³⁺) (F65)", cion, s.length + " tekster" + (side.length ? " og siden" : ""));
        R.tjek("ingen tekst siger undefined, NaN eller [object Object]", ord);
        R.tjek("tallene i teksterne peger på noget, der findes ({{navn.T}})", tal2);

        /* Rundvisningen: hvert stop skal findes paa siden */
        if (dyn && NK.Rundvisning && NK.Rundvisning.stop) {
            var stop = NK.Rundvisning.stop() || [], tomme = [];
            stop.forEach(function (x, i) {
                var fundet = 0;
                try { fundet = doc.querySelectorAll(x.sel).length; } catch (e) { fundet = 0; }
                if (!fundet) tomme.push((i + 1) + ": " + x.sel);
                if (!x.titel || !x.tekst) tomme.push((i + 1) + ": mangler titel eller tekst");
            });
            R.tjek("rundvisningens stop findes på siden", tomme, stop.length + " stop");
        }

        /* Quizzen: svar, et rigtigt svar og en begrundelse */
        var q = f.tekster && f.tekster.quiz;
        if (q && q.spoergsmaal) {
            var qFejl = [];
            q.spoergsmaal.forEach(function (sp, i) {
                var nr = "spørgsmål " + (i + 1);
                if (typeof sp.sp !== "string" || !sp.sp.trim()) qFejl.push(nr + " har ingen tekst");
                if (!Array.isArray(sp.valg) || sp.valg.length < 2) qFejl.push(nr + " har under to svar");
                else if (!(sp.rigtig >= 0 && sp.rigtig < sp.valg.length && sp.rigtig === Math.floor(sp.rigtig))) qFejl.push(nr + ": rigtig er " + sp.rigtig);
                if (typeof sp.forklaring !== "string" || !sp.forklaring.trim()) qFejl.push(nr + " har ingen begrundelse");
            });
            R.tjek("hvert quizspørgsmål har svar, ét rigtigt svar og en begrundelse", qFejl, q.spoergsmaal.length + " spørgsmål");
        }
    }

    /* ================================================================
       Koersel
       ================================================================ */
    function koer(vin, valg) {
        valg = valg || {};
        var f = beskriv(vin);
        var dyn = valg.levende !== false;
        if (valg.rediger) { f = kopi(f); valg.rediger(f); }
        f.undtagelser = valg.undtagelser || null;
        var R = new Resultat(f.navn);
        if (!afsnitSiden(R, f)) return R;
        var NK = f.NK;
        var trin = [
            ["2. Stoftabellen", function () { afsnitStoftabellen(R, f); }],
            ["3. Stofferne på bordet", function () { afsnitStofferne(R, f); }],
            ["4. Udstyret", function () { afsnitUdstyret(R, f); }],
            ["5. Sprites", function () { afsnitSprites(R, f); }],
            ["6. Forløbet", function () { afsnitForloebet(R, f, dyn); }],
            ["7. Pladsen på bordet", function () { afsnitPladsen(R, f); }],
            ["8. Teksterne", function () { afsnitTeksterne(R, f, dyn); }]
        ];
        trin.forEach(function (t) {
            /* Et afsnit, der kaster, er selv en fejl - og de andre koeres */
            try { t[1](); } catch (e) {
                if (!R.nu || R.nu.titel !== t[0]) R.overskrift(t[0]);
                R.tjek("afsnittet kunne køres", [e.message + (e.stack ? " @ " + String(e.stack).split("\n")[1] : "")]);
            }
        });
        return R;
    }

    /* ================================================================
       Selvproeven: tjekket skal fange en fejl, der er sat ind med vilje.
       Hver fejl saettes ind i en kopi af forsoegets data, og proeven
       bestaar, naar der kommer en fejl (ikke kun en advarsel), der naevner
       maerket - og maerket ikke staar i en fejl i forvejen.
       ================================================================ */
    function foersteHolder(NK, f) {
        for (var i = 0; i < f.borde.length; i++) {
            for (var j = 0; j < f.borde[i].opstilling.length; j++) {
                var s = f.borde[i].opstilling[j];
                if (typeAf(NK, s) && kan(NK, s, "holder") && !kan(NK, s, "fast")) return { spec: s, bord: f.borde[i], i: j };
            }
        }
        return null;
    }

    function nytTrin(f, t) {
        if (!f.forloeb) f.forloeb = { trin: [], udloesere: [] };
        t.tekst = t.tekst || "Tjek.";
        t.kort = t.kort || "Tjek";
        t.hint = t.hint || "Tjek.";
        f.forloeb.trin.push(t);
    }

    function selvproeve(vin) {
        var f0 = beskriv(vin), NK = f0.NK;
        if (!NK || !f0.borde.length) return [{ navn: "forsøget kunne læses", fanget: false, note: "ingen opstilling" }];
        var luk = lukning(NK, f0);
        var umuligtStof = Object.keys(NK.Stof.STOFFER).filter(function (n) { return !luk[n] && NK.Stof.STOFFER[n].fase !== "l"; })[0];
        var PROEVER = [
            { navn: "et stof, der ikke findes", maerke: "Xx9+", rediger: function (f) {
                var h = foersteHolder(NK, f);
                var s = h.bord.opstilling[h.i] = Object.assign({}, h.spec);
                s.indhold = { V: (s.indhold && s.indhold.V) || 1, T: 20, mM: { "Xx9+": 1 } };
            } },
            { navn: "et trin, der peger på et glas, der ikke er på bordet", maerke: "glas99", rediger: function (f) {
                nytTrin(f, { id: "tjek_glas", naar: { beholder: "glas99", V: { over: 1 } } });
            } },
            { navn: "udstyr, der ikke findes i kataloget", maerke: "tryllestav", rediger: function (f) {
                f.borde[0].opstilling.push({ navn: "tjek_ukendt", type: "tryllestav", x: 500 });
            } },
            { navn: "et trin, der aldrig kan nås (mere, end glasset rummer)", maerke: "tjek_umulig", rediger: function (f) {
                var h = foersteHolder(NK, f);
                nytTrin(f, { id: "tjek_umulig", naar: { beholder: h.spec.navn, V: { over: 1e6 } } });
            } },
            { navn: "et trin, der venter på et flag, ingen sætter", maerke: "tjek_aldrig", rediger: function (f) {
                nytTrin(f, { id: "tjek_flag", naar: { flag: "tjek_aldrig" } });
            } },
            /* Et stof, der findes i stoftabellen, men ikke kan dannes af det,
               der staar paa bordene (i sb2.4 fx PbI2(s)) */
            { navn: "et trin, der venter på et stof, der ikke kan dannes", maerke: umuligtStof, rediger: function (f) {
                var h = foersteHolder(NK, f);
                nytTrin(f, { id: "tjek_stof", naar: { beholder: h.spec.navn, stof: umuligtStof, over: 0.1 } });
            } },
            { navn: "et peg på noget, der ikke findes", maerke: "tjek_intet", rediger: function (f) {
                nytTrin(f, { id: "tjek_peg", peg: "tjek_intet", naar: { flag: "tjek_peg" }, saa: [{ flag: "tjek_peg" }] });
            } },
            { navn: "et tal i en replik fra et glas, der ikke findes", maerke: "glas77", rediger: function (f) {
                if (!f.forloeb) f.forloeb = { trin: [], udloesere: [] };
                f.forloeb.udloesere.push({ id: "tjek_replik", naar: { flag: "x" }, saa: [{ sig: "Det er {{glas77.T}}.", flag: "x" }] });
            } },
            { navn: "to ting, der står oven i hinanden", maerke: "tjek_tvilling", rediger: function (f) {
                var b = f.borde[0], s = null;
                b.opstilling.forEach(function (x) { if (!s && x.x !== undefined && !x.stativ && !x.paa && typeAf(NK, x) && typeAf(NK, x).sprite) s = x; });
                var ny = Object.assign({}, s);
                ny.navn = "tjek_tvilling";
                ny.x = s.x + 3;
                b.opstilling.push(ny);
            } },
            { navn: "c(Fe³⁺) om en aktuel koncentration", maerke: "tjek-tekst", rediger: function (f) {
                f.tekster = f.tekster ? f.tekster : {};
                f.tekster["tjek-tekst"] = "Så falder c(Fe³⁺), og farven bliver lysere.";
            } }
        ];
        var grund = koer(vin, { levende: false }).fund().join("\n");
        return PROEVER.filter(function (p) { return !!p.maerke; }).map(function (p) {
            var r;
            try { r = koer(vin, { rediger: p.rediger, levende: false }); } finally { if (p.efter) p.efter(); }
            var fund = r.fund().filter(function (x) { return x.indexOf(p.maerke) >= 0; });
            var fanget = fund.length > 0 && grund.indexOf(p.maerke) < 0;
            return { navn: p.navn, fanget: fanget, note: fund.length ? fund[0] : "ikke fanget" };
        });
    }

    rod.NKTjek = {
        beskriv: beskriv,
        koer: koer,
        selvproeve: selvproeve,
        /* Til afsnittene i en selvtest */
        cIoner: cIoner,
        pladsholdere: pladsholdere,
        lukning: function (vin) { return lukning(vin.NK, beskriv(vin)); }
    };
}(window));
