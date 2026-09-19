/* =====================================================================
   bord.js - laboratoriebordet: genstandene, musen og moederne

   Bordet er et fast tegnebord (NK.Scene.BREDDE x HOEJDE), der skaleres
   ind i laerredet. Alt udstyr er genstande af en type fra udstyr.js:

     { navn, type, anker, p: { x, y, v }, hjem, kan, titel, etiket,
       indhold (NK.Stof), lag, bund, niveau, T, taendt, last, sted, paa, i }

   Reglerne for frihed:
     * Alt, der ikke staar fast, kan tages op med musen og saettes ned,
       hvor man vil. Det bliver staaende der.
     * Slippes en genstand over en anden, afgoer deres egenskaber (kan),
       hvad der sker: det, der kan haelde, haelder i det, der kan rumme;
       draabeflasken drypper; spatlen tager fra pulverglasset og giver
       til glasset; glasstaven roerer; termometeret maaler; stativet og
       varmepladen tager imod glas; affald og vask tager imod alt.
     * Ingen handling afvises, naar den kan lade sig goere. Rystes et
       aabent glas voldsomt, skvulper det ud. Loeber et glas over,
       bliver der en pyt. Saettes et reagensglas paa bordet, vaelter det.
     * Det, der lige er brugt (flaske, draabeflaske, sproejteflaske,
       spatel), bliver haengende over det, det blev brugt paa. Et klik
       paa pilen ved siden af gentager handlingen; resten af bordet
       venter, til det traekkes vaek. En portion er hoejst en femtedel af
       glasset. En fuld spatel over pulverglasset har ingen pil (den kan
       ikke tage mere); en tom spatel over et glas henter selv en
       spatelspids mere i pulverglasset og kommer tilbage med den.

   Bordets maal og udseende i valg (NK.BORD_VALG):
     bredde, hoejde, bord   tegnebordet og bordpladens bagkant (y)
     bordDybde              bordpladens dybde nedad paa tegningen. Med
                            dybde kan noget stilles foran det, der staar
                            ved bagkanten; det forreste tegnes forrest.
                            0 (standard) er en smal kant som foer.
     lodret                 "midt" (standard) eller "bund": hvor
                            tegnebordet staar i et hoejere laerred. Med
                            "bund" bliver den tomme plads over bordet, og
                            laereren slutter ved laerredets kant.
     gulv                   y'et, hvor en person slutter forneden
                            (standard: scenens bund). Kitlen fortsaetter
                            ikke laengere ned end dertil, saa han slutter
                            ved gulvet og ikke ved laerredets kant.
     bagBord                { x, y, skala }: laererens faste plads BAG
                            bordet. Med den staar han der i hvile, tegnes
                            i sit eget plan (skala) og klippes ved bordets
                            bagkant, saa pladen daekker hans underkrop. Han
                            kommer kun om for enden af bordet, naar en
                            scene beder om det (foran: true - oprydning).
                            Uden bagBord staar han foran bordet som foer.
     boble                  zoomboblen paa scenen: { x, y } er dens
                            centrum paa tegnebordet. Den skalerer med
                            resten af laboratoriet, viser glassets navn
                            under sig og en stiplet streg ned til glasset.
                            Uden boble tegner siden den selv, fx i panelet.
     bobleR                 zoomboblens radius paa tegnebordet
     bobleIndhold           stoerrelsen af det, der er inde i boblen
                            (kugler og skrift), 1 er standard; se mikro.js
                            Et klik paa boblen paa scenen viser den stor
                            midt paa scenen (aabnStorBoble); et klik hvor
                            som helst eller Esc lukker den (lukStorBoble)
     tilskuere              true: find tilskuerionerne ud fra opstillingen
                            (Stof.tilskuerioner), eller en liste. Er der
                            mere end tre slags ioner i et glas, skjules de
                            i boblen og staar for sig i panelets tabel, til
                            visTilskuere saettes (fluebenet i panelet)
     partikler, partikelRef boblens skala: et stof med koncentrationen
                            partikelRef (mM, standard 100) faar partikler
                            kugler (standard 6); se Stof.partikelTal.
                            Hoejst Stof.PARTIKEL_LOFT (20) kugler i alt

   Hooks, som siden saetter:
     vedBesked(tekst, slags)   korte beskeder til scenen
     vedAendring(grund)        noget i tilstanden aendrede sig
     vedHaendelse(type, data)  haeldt, dryppet, spild, overloeb, vaeltet,
                               affald, roert, maalt, taendt, stativ, plade
   Hooks fra laereren (../kemichael/kemichael.js og forsoegets laerer.js)
   er frivillige: laererStart, laererNyt, opdaterLaerer, tegnLaerer,
   overLaerer, klikLaerer, klikKop, laererOptaget, laererUheld(slags, gg).
   Med bagBord bruges tre lag i stedet for ét: tegnLaererBag (bag alt paa
   bordet), tegnLaerer (foran bordet) og tegnLaererBoble (taleboblen, der
   altid er oeverste lag, ogsaa over zoomboblen). laererBagBord() siger,
   om han staar bag bordet lige nu, saa et klik paa ham foerst gaelder,
   naar intet paa bordet ligger under musen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Stof = NK.Stof;
    var B = NK.Beholder;
    var T = NK.Tegning;
    var U = NK.Udstyr;
    var r = NK.r;

    /* Tegnebordets maal findes allerede ved indlaesning, fordi
       ../kemichael/kemichael.js laeser NK.Scene, naar laereren kobles paa */
    NK.Scene = NK.Scene || { BREDDE: 1120, HOEJDE: 600, BORD: 500, ANKER: {} };

    /* Rystning: ved SPILD_FART i SPILD_TID sekunder skvulper det ud; ved
       KNUS_FART i KNUS_TID sekunder knuses et glas i haanden */
    var RYST = { FULD: 900, SPILD_FART: 650, SPILD_TID: 0.35, KNUS_FART: 1300, KNUS_TID: 0.4 };
    var SPATELSPIDS = 1500;   /* µmol fast stof paa en spatelspids */
    var DRAABE = 0.05;        /* mL */
    var SPROEJT = 10;         /* mL fra sproejteflasken */

    function kopi(p) { return { x: p.x, y: p.y, v: p.v }; }

    function udvid(a, b) {
        var ud = {};
        [a, b].forEach(function (o) { if (o) Object.keys(o).forEach(function (k) { ud[k] = o[k]; }); });
        return ud;
    }

    NK.Bord = function (canvas, valg) {
        valg = valg || {};
        this.valg = valg;
        this.saetScene();

        this.canvas = canvas;
        this.laerred = canvas.nkLaerred || (canvas.nkLaerred = new NK.Laerred(canvas));
        /* Forskydning paa tegnebordet, naar et rum glider ind eller ud (NK.Rum) */
        this.forskyd = 0;
        this.stinkskab = valg.stinkskab || null;
        this.plakat = valg.plakat || null;
        this.reaktioner = valg.reaktioner || null;
        this.stue = valg.stue || B.TEMP.stue;
        this.specs = [];
        this.g = {};
        this.liste = [];
        this.koer = new NK.Koer(this);
        this.koer.vedAendring = function (grund) { this.aendret(grund); };
        /* Hver beholder faar sin egen zoombobbel, naar den vaelges foerste
           gang; this.mikro er den valgte beholders */
        this.bobleR = valg.bobleR || 120;
        this.bobleIndhold = valg.bobleIndhold || 1;
        this.tilskuere = [];
        this.visTilskuere = !!valg.visTilskuere;
        this.mikro = new NK.Mikro(this.bobleR, this.bobleIndhold);
        this.boble = valg.boble || null;
        this.vedBesked = null;
        this.vedAendring = null;
        this.vedHaendelse = null;
        this.nulstilTilstand();
        if (this.laererStart) this.laererStart();
        if (NK.Scene.HYLDE && NK.Sprites.FILER.kaffekop) this.lavKaffekop();
    };

    var P = NK.Bord.prototype;

    /* NK.Scene er faelles for alle borde. Et rum kalder saetScene(), naar det
       bliver det aktive, saa tegning og traefning bruger dets maal. */
    P.saetScene = function () {
        var valg = this.valg;
        var S = NK.Scene = NK.Scene || {};
        S.BREDDE = valg.bredde || 1120;
        S.HOEJDE = valg.hoejde || 600;
        S.BORD = valg.bord || 500;
        S.DYBDE = valg.bordDybde || 0;
        S.FORKANT = S.BORD + S.DYBDE;
        S.LODRET = valg.lodret || "midt";
        /* Gulvet, en person slutter ved, og hans plads bag bordet (S8) */
        S.GULV = valg.gulv === undefined ? S.HOEJDE : valg.gulv;
        S.BAGBORD = valg.bagBord || null;
        S.HYLDER = valg.hylder || (valg.hylde === undefined ? [{ x0: 16, x1: 116, y: 268 }] : (valg.hylde ? [valg.hylde] : []));
        S.HYLDE = S.HYLDER[0] || null;
        S.ANKER = S.ANKER || {};
        if (NK.Kemichael) Object.keys(NK.Kemichael.ANKER).forEach(function (n) { S.ANKER[n] = NK.Kemichael.ANKER[n]; });
        S.skala = function (b, h) {
            var s = Math.min(b / S.BREDDE, h / S.HOEJDE);
            var dy = S.LODRET === "bund" ? h - S.HOEJDE * s : (h - S.HOEJDE * s) / 2;
            return { s: s, dx: (b - S.BREDDE * s) / 2, dy: dy };
        };
    };

    P.nulstilTilstand = function () {
        this.tid = 0;
        this.holdt = null;
        this.baerer = null;
        this.storBoble = false;
        this.storAlfa = 0;
        this.hover = null;
        this.slipMaal = null;
        this.haeldning = null;
        this.valgt = null;
        this.mark = null;
        this.straale = null;
        this.draaber = [];
        this.dampe = [];
        this.pytter = [];
        this.skaar = [];
        this.knusTid = 0;
        this.musFart = 0;
        this.baerAnker = null;   /* ankeret paa det baarne, som det staar oprejst */
        this.tudHjaelp = { x: 0, y: 0 };   /* se foerTud */
        this.musVx = 0;
        this.vold = 0;
        this.uro = 0;
        this.spildTid = 0;
        this.ryst = 0;
        this.skvulpUr = 0;
        this.ryk = 0;
        this.haandAlfa = 0;
        this.bobleAlfa = 0;
        this.bobleBeholder = null;
        this.antalUheld = 0;
        this.haendt = {};
        this.roerer = null;
    };

    /* ----- Genstande ------------------------------------------------------ */
    function staar(t, x, y) {
        return { x: x - t.b / 2 + t.anker.x, y: y - t.h + t.anker.y, v: 0 };
    }

    P.lavKaffekop = function () {
        var S = NK.Scene, F = NK.Sprites.FILER.kaffekop;
        var t = { navn: "kaffekop", sprite: "kaffekop", b: F.b, h: F.h, anker: S.ANKER.kaffekop, kan: { fast: true }, titel: "kaffekoppen" };
        var kop = { navn: "kaffekop", type: t, anker: t.anker, kan: t.kan, titel: t.titel, skjult: false, iHaand: false };
        kop.p = staar(t, S.HYLDE.x0 + 44, S.HYLDE.y);
        kop.hjem = kopi(kop.p);
        this.g.kaffekop = kop;
        this.liste.push(kop);
    };

    /* spec: { navn, type, x, y, etiket, titel, nr, indhold: { V, T, mM, umol },
              stativ: navn, hul: i, paa: navn (varmeplade), p, taendt, kan, pulverMaks } */
    P.tilfoej = function (spec) {
        var S = NK.Scene;
        var t = typeof spec.type === "string" ? U.type(spec.type) : spec.type;
        /* Genstanden kan staa i mindre maalestok. Det, der staar i eller paa
           noget andet, arver dets skala, saa glas passer i stativets huller
           og bægerglasset staar rigtigt paa pladen. */
        var k = spec.skala;
        if (k === undefined && spec.stativ && this.g[spec.stativ]) k = this.g[spec.stativ].skala;
        if (k === undefined && spec.paa && this.g[spec.paa]) k = this.g[spec.paa].skala;
        k = NK.klamp(k === undefined ? 1 : k, 0.25, 1);
        if (k !== 1) t = U.skaleret(t, k);
        var gg = {
            navn: spec.navn, type: t, anker: t.anker, skala: k, kan: udvid(t.kan, spec.kan),
            titel: spec.titel || t.titel || spec.navn, etiket: spec.etiket || null, nr: spec.nr || 0,
            skjult: false, p: null, hjem: null, sted: null, paa: null, i: null, rel: null,
            T: this.stue, taendt: !!spec.taendt, last: null, indhold: null, lag: null, lagBund: false,
            bund: 0, korn: [], niveau: null, pulverMaks: spec.pulverMaks || 0, valgt: false, svaev: null, spec: spec
        };
        if (gg.kan.holder) gg.indhold = spec.indhold ? Stof.lav(spec.indhold) : Stof.ny(this.stue);
        if (gg.kan.stoette) gg.glas = t.huller.map(function () { return null; });
        if (spec.p) gg.p = kopi(spec.p);
        else if (spec.stativ) gg.p = { x: 0, y: 0, v: 0 };
        else if (spec.paa) gg.p = { x: 0, y: 0, v: 0 };
        else if (t.sprite) gg.p = staar(t, spec.x, spec.y === undefined ? S.BORD : spec.y);
        else gg.p = { x: spec.x, y: (spec.y === undefined ? S.BORD : spec.y) - 3, v: -Math.PI / 2 };
        gg.hjem = kopi(gg.p);
        this.g[spec.navn] = gg;
        this.liste.push(gg);
        if (spec.stativ) {
            var st = this.g[spec.stativ];
            if (!this.iStativ(gg, st, spec.hul, true)) {
                var h = st ? this.ledigtHul(st) : -1;
                if (h < 0 || !this.iStativ(gg, st, h, true)) this.vaelt(gg, spec.x || NK.Scene.BREDDE / 2);
            }
        }
        if (spec.paa) this.paaPlade(gg, this.g[spec.paa], spec.x, true);
        return gg;
    };

    /* Genstanden fjernes fra bordet (den tages med til et andet rum).
       Det, der sidder i den, foelger med. Returnerer listen af det fjernede. */
    P.tagUd = function (gg) {
        var mig = this, ud = [gg];
        this.liste.forEach(function (x) { if (x.i === gg) ud.push(x); });
        this.frigoer(gg);
        if (this.baerer === gg) { this.baerer = null; this.holdt = null; this.haeldning = null; this.straale = null; }
        if (this.valgt === gg.navn) this.valgt = null;
        if (this.bobleBeholder === gg) this.bobleBeholder = null;
        if (this.roerer === gg) this.roerer = null;
        this.koer.slipFri(gg);
        ud.forEach(function (x) {
            var i = mig.liste.indexOf(x);
            if (i >= 0) mig.liste.splice(i, 1);
            if (mig.g[x.navn] === x) delete mig.g[x.navn];
            x.svaev = null;
        });
        this.aendret("tagUd");
        return ud;
    };

    /* En genstand fra et andet bord kommer ind. Hedder noget andet det
       samme her, faar den nyt navn. */
    P.tagImod = function (gg) {
        var navn = gg.navn, k = 2;
        while (this.g[navn]) navn = gg.navn + "#" + (k++);
        gg.navn = navn;
        this.g[navn] = gg;
        this.liste.push(gg);
        this.aendret("tagImod");
        return gg;
    };

    /* Et knust glas erstattes af et nyt paa dets oprindelige plads */
    P.genopstil = function (gg) {
        var i = this.liste.indexOf(gg);
        if (i >= 0) this.liste.splice(i, 1);
        delete this.g[gg.navn];
        var ny = this.tilfoej(gg.spec);
        var j = this.liste.indexOf(ny);
        if (i >= 0 && j >= 0 && j !== i) { this.liste.splice(j, 1); this.liste.splice(Math.min(i, this.liste.length), 0, ny); }
        this.haendelse("nyt", ny);
        this.aendret("genopstil");
        return ny;
    };

    P.byg = function (specs) {
        var mig = this;
        this.specs = specs.slice();
        specs.forEach(function (s) { mig.tilfoej(s); });
        this.ordnDybde();
        this.findTilskuere();
    };

    /* Tilskuerionerne i forsoeget: se valg.tilskuere i hovedkommentaren */
    P.findTilskuere = function () {
        var v = this.valg.tilskuere;
        if (!v) { this.tilskuere = []; return; }
        if (Array.isArray(v)) { this.tilskuere = v.slice(); return; }
        var arter = {};
        this.liste.forEach(function (gg) {
            if (!B.er(gg)) return;
            var o = B.samlet(gg);
            Object.keys(o.n).forEach(function (n) { if (o.n[n] > 0) arter[n] = true; });
        });
        this.tilskuere = Stof.tilskuerioner(Object.keys(arter));
    };

    /* Tilskuerionerne i oploesningen o, der staar for sig: kun naar der er
       mere end tre slags ioner i den. Med én til tre ioner hoerer de med
       (en flaske AgNO3 har baade Ag+ og NO3-). */
    P.tilskuereI = function (o) {
        if (!o || !this.tilskuere.length) return [];
        var ioner = Object.keys(o.n).filter(function (n) {
            var s = Stof.STOFFER[n];
            return s && s.q && s.fase !== "s" && Stof.synlig(o, n);
        });
        if (ioner.length <= 3) return [];
        var t = this.tilskuere;
        return ioner.filter(function (n) { return t.indexOf(n) >= 0; });
    };

    /* Det, der ikke vises i boblen og tabellen lige nu */
    P.skjulteI = function (o) {
        return this.visTilskuere ? [] : this.tilskuereI(o);
    };

    /* Start forfra: alt staar, som da bordet blev bygget */
    P.nulstil = function () {
        var mig = this;
        this.koer.afbryd();
        this.nulstilTilstand();
        this.mikro = new NK.Mikro(this.bobleR, this.bobleIndhold);
        this.g = {};
        this.liste = [];
        if (NK.Sprites.FILER.kaffekop && NK.Scene.HYLDE) this.lavKaffekop();
        this.specs.forEach(function (s) { mig.tilfoej(s); });
        this.ordnDybde();
        if (this.laererNyt) this.laererNyt();
        this.koppenVaek = false;
        this.aendret("nulstil");
    };

    P.beholdere = function () {
        return this.liste.filter(function (gg) { return B.er(gg) && !gg.skjult; });
    };

    P.synlig = function (gg) {
        return !!(gg && !gg.skjult && !(gg.navn === "kaffekop" && gg.iHaand));
    };

    /* ----- Positioner og traefning ------------------------------------- */

    /* Genstandens rektangel paa tegnebordet */
    P.rekt = function (gg, pad) {
        pad = pad || 0;
        var t = gg.type, hj;
        if (t.sprite) {
            hj = [[-pad, -pad], [t.b + pad, -pad], [t.b + pad, t.h + pad], [-pad, t.h + pad]];
        } else {
            var L = t.laengde || 100;
            hj = [[-7 * (t.skala || 1) - pad, -pad], [7 * (t.skala || 1) + pad, -pad], [7 * (t.skala || 1) + pad, L + pad], [-7 * (t.skala || 1) - pad, L + pad]];
        }
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        hj.forEach(function (h) {
            var w = NK.tilVerden(gg.p, gg.anker, h[0], h[1]);
            x0 = Math.min(x0, w.x); y0 = Math.min(y0, w.y);
            x1 = Math.max(x1, w.x); y1 = Math.max(y1, w.y);
        });
        return { x: x0, y: y0, b: x1 - x0, h: y1 - y0 };
    };

    /* Ligger punktet paa genstanden? */
    /* Glassets vaeg i tegneenheder: saa meget ligger ydersiden uden for
       den tegnede inderside */
    var VAEG = 4;

    P.inden = function (gg, pt, pad) {
        pad = pad || 0;
        var t = gg.type;
        var l = NK.tilLokal(gg.p, gg.anker, pt.x, pt.y);
        /* Et omdrejningslegeme uden etiket over sig rammes dér, hvor der
           ER glas: indersiden er tegningens egen silhuet, og ydersiden er
           den plus vaeggen. For et reagensglas og et baegerglas er det
           naesten den samme kasse som foer, men kolben er en kolbe - og
           saa snyder hjoernerne ikke laengere den, der sigter paa den.
           En flaske eller et pulverglas har etiket over det meste af sig,
           saa deres inderside er kun et kig ind i beholderen; de rammes
           som foer. */
        if (t.indre && !t.vindue && t.rund !== false) {
            if (t.traefBund && l.y > t.h - t.traefBund) return false;
            return NK.iNaerPoly(t.indre, l.x, l.y, VAEG * (t.skala || 1) + pad);
        }
        if (t.sprite) return l.x > -pad && l.x < t.b + pad && l.y > -pad && l.y < (t.traefBund ? t.h - t.traefBund : t.h + pad);
        var L = t.laengde || 100;
        var halv = 7 * (t.skala || 1);
        return l.x > -halv - pad && l.x < halv + pad && l.y > -pad && l.y < L + pad;
    };

    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = NK.Scene.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    /* Hvad ligger under punktet? Det oeverste foerst. */
    P.hvad = function (pt) {
        /* Zoomboblen ligger over alt; er den stor, er den alt */
        if (this.overBoble(pt)) return "boble";
        /* Staar laereren bag bordet, ligger han bag alt paa det, og et klik
           paa ham gaelder foerst, naar intet andet er under musen */
        var bagBordet = !!(this.laererBagBord && this.laererBagBord());
        if (this.overLaerer && !bagBordet) {
            var l = this.overLaerer(pt);
            if (l) return l;
        }
        var ring = this.svaevRing();
        if (ring && Math.hypot(pt.x - ring.x, pt.y - ring.y) < ring.r + 6) return "svaevring";
        /* Det, der svaever (flasken, man er i gang med), har foerste prioritet */
        var sv = this.svaevende();
        if (sv && this.synlig(sv) && this.inden(sv, pt, 8)) return sv.navn;
        for (var i = this.liste.length - 1; i >= 0; i--) {
            var gg = this.liste[i];
            if (!this.synlig(gg)) continue;
            if (this.inden(gg, pt, gg.kan.fast ? 2 : 5)) return gg.navn;
        }
        if (this.overLaerer && bagBordet) {
            var lb = this.overLaerer(pt);
            if (lb) return lb;
        }
        return null;
    };

    P.grebbar = function (navn) {
        var gg = this.g[navn];
        if (!gg || gg.kan.fast || !this.synlig(gg)) return false;
        if (this.koer.optaget() && this.koer.flytter(gg)) return false;
        return true;
    };

    /* ----- Mus og beroering ------------------------------------------------ */
    P.ned = function (pt) {
        if (NK.Lyd) NK.Lyd.laasOp();
        var navn = this.hvad(pt);
        if (!navn) return false;
        if (navn === "boble" || navn === "svaevring") { this.klik(navn); return false; }
        var sv = this.svaevende();
        if (sv && sv.navn !== navn && navn !== "laerer" && navn !== "kaffekop") {
            this.besked("Træk først " + sv.titel + " væk.");
            return false;
        }
        var laererOpt = this.laererOptaget && this.laererOptaget();
        if (!laererOpt && !this.koer.optaget() && !this.baerer && this.grebbar(navn)) {
            var gg = this.g[navn];
            this.koer.slipFri(gg);
            this.holdt = { navn: navn, start: pt, dx: pt.x - gg.p.x, dy: pt.y - gg.p.y, flyttet: false, sidst: pt, t: Date.now() };
            return true;
        }
        this.klik(navn);
        return false;
    };

    P.flyt = function (pt, nu) {
        var h = this.holdt;
        if (!h) { this.hover = this.hvad(pt); return; }
        var gg = this.g[h.navn];
        if (nu === undefined) nu = Date.now();
        if (!h.flyttet) {
            if (Math.abs(pt.x - h.start.x) + Math.abs(pt.y - h.start.y) < 8) return;
            h.flyttet = true;
            h.sidst = pt;
            h.t = nu;
            this.startBaer(gg, h.start);
            /* Blev den rettet op, sidder den nu anderledes i haanden */
            h.dx = h.start.x - gg.p.x;
            h.dy = h.start.y - gg.p.y;
        }
        var dts = Math.max(4, nu - h.t) / 1000;
        var dx = pt.x - h.sidst.x, dy = pt.y - h.sidst.y;
        this.musVx = NK.lerp(this.musVx, dx / dts, 0.5);
        this.musFart = NK.lerp(this.musFart, Math.sqrt(dx * dx + dy * dy) / dts, 0.35);
        h.sidst = pt;
        h.t = nu;
        var S = NK.Scene;
        this.baerAnker = { x: NK.klamp(pt.x - h.dx, 20, S.BREDDE - 20), y: NK.klamp(pt.y - h.dy, 40, S.FORKANT + 90) };
        gg.p.x = this.baerAnker.x;
        gg.p.y = this.baerAnker.y;
        this.slipMaal = this.maalVed(gg, pt);
        this.folgHaeldning(gg);
        if (gg.kan.drypper) this.vendDrypper(gg);
        else this.foerTud(gg);
    };

    /* ----- Haeldning med haanden -------------------------------------------
       Holdes en beholder stille over et glas, vipper den efter et oejeblik og
       haelder, saa laenge den holdes der. Straalen lander, hvor tuden er:
       ved siden af glasset haeldes der paa bordet. Draabeflasken drypper og
       sproejteflasken sproejter paa samme maade. Et hurtigt slip giver
       stadig én standardportion (moede).

       Draabeflasken er lille og vender hurtigere (vipDryp), og den drypper
       foerst, naar den staar paa hovedet (drypVip). Den vender om sin midte
       og ikke om spidsen: se vendDrypper.

       Den groenne ramme holder, hvad den lover: mens flasken vipper, foeres
       tuden ind over glassets aabning (foerTud), og der haeldes kun, naar
       straalen rammer. Man kan altsaa ikke komme til at haelde ved siden af
       et glas, der har den groenne ramme. */
    var HAELD = { dvael: 0.3, vipTid: 0.5, vipDryp: 0.3, drypVip: 0.85, fart: { reagensglas: 12, baegerLille: 25, baegerStor: 35, kolbe: 30, maaleglas: 15, flaske: 15, vejebaad: 900, sproejteflaske: 8 }, dryp: 0.45 };

    P.kanHaelde = function (gg) {
        var k = gg.kan;
        return !!(k.haelder || k.drypper || k.sproejter) && (B.volumen(gg) > 0.05 || (gg.type.navn === "vejebaad" && B.fastIalt(gg) > 0.5));
    };

    P.folgHaeldning = function (gg) {
        var maal = this.slipMaal && this.slipMaal.indexOf("pyt:") < 0 ? this.g[this.slipMaal] : null;
        if (!maal || !maal.kan.holder || !this.kanHaelde(gg)) {
            if (this.haeldning) this.haeldning.maal = null;
            return;
        }
        if (!this.haeldning || this.haeldning.maal !== maal) {
            this.haeldning = { maal: maal, dvael: 0, vip: this.haeldning ? this.haeldning.vip : 0, harHaeldt: this.haeldning ? this.haeldning.harHaeldt : false, spildt: 0, drypUr: 0, lydUr: 0, stoppet: false };
        }
    };

    /* Der haeldes nu med haanden i c: glasset vaelges, saa panelet og
       zoomboblen viser det, der sker i det (som ved et slip) */
    P.haeldBegyndt = function (h, c) {
        h.harHaeldt = true;
        if (h.valgt === c) return;
        h.valgt = c;
        if (this.aaben(c)) this.vaelg(c.navn);
    };

    P.opdaterHaeldning = function (dt) {
        var h = this.haeldning, gg = this.baerer;
        if (!h) return;
        if (!gg || !h.maal || !this.kanHaelde(gg)) {
            h.vip = NK.mod(h.vip, 0, 8, dt);
            if (h.vip < 0.02) { this.haeldning = null; if (this.straale && this.straale.haand) this.straale = null; }
            return;
        }
        var stille = this.musFart < 160;
        h.dvael = stille ? h.dvael + dt : Math.max(0, h.dvael - dt * 2);
        /* Loeb glasset over, stopper man med at haelde, til flasken flyttes */
        var maalVip = h.dvael > HAELD.dvael && !h.stoppet ? 1 : 0;
        var vipTid = gg.kan.drypper ? HAELD.vipDryp : HAELD.vipTid;
        h.vip = NK.mod(h.vip, maalVip, maalVip ? 1 / vipTid * 1.6 : 8, dt);
        var c = h.maal, k = gg.kan, t = gg.type;
        /* Aabningen i glasset: det indre mellem x0 og x1 */
        var v = c.type.indre ? T.indreVerden(c) : null;
        var x0 = Infinity, x1 = -Infinity;
        if (v) v.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); });
        var o = B.aabning(c);
        /* Hvor tuden skal foeres hen: ind over aabningen, lidt inden for
           kanten; en flaskehals rammes i midten */
        if (!k.drypper) {
            var ax0 = v && !c.kan.flaske ? x0 + 5 : o.x, ax1 = v && !c.kan.flaske ? x1 - 5 : o.x;
            if (ax0 > ax1) ax0 = ax1 = (ax0 + ax1) / 2;
            h.aabning = { x0: ax0, x1: ax1, y: o.y };
        }
        /* Draabeflasken glider ind over aabningen, mens den vender */
        if (k.drypper) {
            var sigte = this.draabeSigte(gg);
            h.draabeMaal = {
                x: v ? NK.klamp(sigte.x, Math.min(o.x, x0 + 6), Math.max(o.x, x1 - 6)) : o.x,
                y: Math.min(sigte.y, o.y - 14)
            };
        }
        if (h.vip < 0.5) { if (this.straale && this.straale.haand) this.straale = null; return; }
        var tud = B.tudVerden(gg);
        /* Rammer straalen glasset? */
        var rammer = v ? tud.x > x0 - 4 && tud.x < x1 + 4 && tud.y < o.y + 6 : Math.abs(tud.x - o.x) < 20;
        var flade = rammer ? (c.niveau === null || c.niveau === undefined ? o.y + 40 : c.niveau) : NK.Scene.BORD;
        if (k.drypper) {
            /* Foerst naar spidsen peger lige ned (under 10 grader skaevt) */
            if (h.vip < HAELD.drypVip || Math.cos(gg.p.v) > -0.985) return;
            this.haeldBegyndt(h, c);
            h.drypUr -= dt;
            if (h.drypUr <= 0) {
                h.drypUr = HAELD.dryp;
                var d = Stof.del(gg.indhold, DRAABE);
                var fo = Stof.farve(d, 3) || Stof.VAND;
                this.draaber.push({ x: tud.x, y: tud.y + 2, vx: 0, vy: 30, rad: 3.2, liv: 1, farve: { r: fo.r, g: fo.g, b: fo.b, a: fo.a }, c: rammer ? c : null, opl: rammer ? d : null, fysik: !rammer });
                if (NK.Lyd && NK.Lyd.plip) NK.Lyd.plip();
                if (!rammer) this.smaaSpild(h, tud.x, DRAABE, fo);
            }
            return;
        }
        /* Der haeldes foerst, naar tuden er foert ind over aabningen */
        if (!rammer) { if (this.straale && this.straale.haand) this.straale = null; return; }
        this.haeldBegyndt(h, c);
        var fart = (HAELD.fart[t.navn] || 15) * (h.vip - 0.5) * 2;
        if (t.navn === "vejebaad") {
            var liste = Stof.faste(gg.indhold);
            if (!liste.length) return;
            var mig = this;
            liste.forEach(function (f) {
                var umol = Math.min(f.umol, fart * dt);
                Stof.tilsaet(gg.indhold, f.navn, -umol);
                if (rammer) B.tilsaetFast(c, f.navn, umol);
                if (Math.random() < 0.5) mig.draaber.push({ x: tud.x + r(-3, 3), y: tud.y, vx: r(-8, 8), vy: r(20, 60), rad: 1.5, liv: 1, farve: f.stof.farve || { r: 230, g: 230, b: 230 }, korn: true, c: rammer ? c : null, fysik: !rammer });
            });
            return;
        }
        var dV = Math.min(B.volumen(gg), fart * dt);
        if (dV <= 0) return;
        var ud = k.sproejter ? Stof.del(gg.indhold, dV) : B.udtag(gg, dV);
        var farve = Stof.farve(ud, gg.type.vejlaengde) || Stof.VAND;
        if (rammer) {
            B.haeldI(c, ud, true);
            if (this.tjekOverloeb(c)) h.stoppet = true;
        } else this.smaaSpild(h, tud.x, ud.V, farve);
        this.straale = { fra: tud, til: { x: tud.x + (rammer ? 0 : 0), y: flade }, farve: farve, bredde: k.sproejter ? 2 : (t.maks > 100 ? 3 : 2), haand: true };
        h.lydUr -= dt;
        if (h.lydUr <= 0 && NK.Lyd && NK.Lyd.haeld) { NK.Lyd.haeld(0.5); h.lydUr = 0.45; }
        this.aendret("haeldning");
    };

    /* Det, der haeldes ved siden af, samler sig til en pyt paa bordet */
    P.smaaSpild = function (h, x, mL, farve) {
        h.spildt += mL;
        if (h.spildt > 0.8 && !h.pyt) {
            h.pyt = true;
            this.nyPyt(x, 40, { r: farve.r, g: farve.g, b: farve.b, a: 0.8 });
            this.uheld("spild", this.baerer, "Det løber ved siden af.");
        }
    };

    P.op = function () {
        var h = this.holdt;
        if (!h) return;
        this.holdt = null;
        if (!h.flyttet) { this.klik(h.navn); return; }
        this.stopBaer(h.sidst);
    };

    P.bindMus = function () {
        var mig = this, c = this.canvas;
        c.addEventListener("pointerdown", function (ev) {
            if (ev.button !== undefined && ev.button !== 0) return;
            if (mig.ned(mig.tilBord(ev))) {
                try { c.setPointerCapture(ev.pointerId); } catch (fejl) {}
                ev.preventDefault();
            }
        });
        c.addEventListener("pointermove", function (ev) {
            mig.flyt(mig.tilBord(ev), ev.timeStamp || Date.now());
            var hv = mig.hover;
            var greb = hv && mig.grebbar(hv);
            c.style.cursor = mig.holdt ? "grabbing" : (greb ? "grab" : (hv ? "pointer" : "default"));
        });
        c.addEventListener("pointerup", function () { mig.op(); });
        c.addEventListener("pointercancel", function () { mig.op(); });
        c.addEventListener("pointerleave", function () { if (!mig.holdt) mig.hover = null; });
        c.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    };

    /* ----- At baere ------------------------------------------------------------ */
    P.startBaer = function (gg, greb) {
        var mig = this;
        this.baerer = gg;
        this.baerAnker = null;
        this.tudHjaelp = { x: 0, y: 0 };
        this.spildTid = 0;
        gg.svaev = null;
        this.frigoer(gg);
        /* Et vaeltet glas eller en vendt draabeflaske rettes op, naar man
           tager det: om punktet, der blev grebet i (ellers om midten), saa
           det bliver under haanden og ikke springer */
        if (gg.type.sprite && gg.p.v) {
            var l = greb ? NK.tilLokal(gg.p, gg.anker, greb.x, greb.y) : { x: gg.type.b / 2, y: gg.type.h / 2 };
            var w = NK.tilVerden(gg.p, gg.anker, l.x, l.y);
            gg.p.v = 0;
            gg.p.x = w.x - (l.x - gg.anker.x);
            gg.p.y = w.y - (l.y - gg.anker.y);
        }
        /* Et termometer, der sidder i glasset, tages med op; en anden
           genstand, der sidder i det, falder hjem */
        this.liste.forEach(function (x) {
            if (x.i === gg) { x.i = null; x.rel = null; mig.koer.start([NK.Koer.hjemTil(x, 0.5, 20)], "hjem"); }
        });
        if (gg.kan.holder) this.vaelg(gg.navn);
        if (this.laererBaer) this.laererBaer(gg);
        this.aendret("baer");
    };

    /* Loesner genstanden fra stativ, plade eller det glas, den sad i */
    P.frigoer = function (gg) {
        if (gg.sted) {
            var st = gg.sted.stativ;
            if (st && st.glas[gg.sted.hul] === gg) st.glas[gg.sted.hul] = null;
            gg.sted = null;
        }
        if (gg.paa) gg.paa = null;
        if (gg.i) { gg.i = null; gg.rel = null; }
    };

    P.stopBaer = function (pt) {
        var gg = this.baerer;
        this.baerer = null;
        this.musFart = 0;
        this.vold = 0;
        this.uro = 0;
        this.spildTid = 0;
        this.knusTid = 0;
        if (gg) this.slip(gg, pt);
        this.baerAnker = null;
        this.aendret("baer");
    };

    P.aaben = function (gg) {
        return !!(gg.kan.holder && !gg.kan.flaske && !gg.kan.sproejter && !gg.kan.pulver && !gg.kan.drypper);
    };

    /* Draabeflasken holdes i haanden og vender om sin midte, ikke om
       spidsen (ankeret): holdes den med bunden over et glas, ender spidsen
       dér, hvor bunden var. Mens den vender, glider den ind over aabningen
       (haeldning.draabeMaal), saa draaberne rammer. baerAnker er ankerets
       plads, som flasken ville staa oprejst i haanden; flyt saetter den. */
    function midtAf(gg) {
        return { x: gg.type.b / 2 - gg.anker.x, y: gg.type.h / 2 - gg.anker.y };
    }

    P.vendDrypper = function (gg) {
        var P0 = this.baerAnker;
        if (!P0 || !gg.type.sprite) return;
        var d = midtAf(gg), h = this.haeldning;
        var C = { x: P0.x + d.x, y: P0.y + d.y };
        var T = h && h.draabeMaal;
        if (T) {
            var w = NK.blod(h.vip);
            C.x += (T.x - d.x - C.x) * w;
            C.y += (T.y - d.y - C.y) * w;
        }
        var co = Math.cos(gg.p.v), si = Math.sin(gg.p.v);
        gg.p.x = C.x - (d.x * co - d.y * si);
        gg.p.y = C.y - (d.x * si + d.y * co);
    };

    /* Der, hvor spidsen kommer til at vaere, naar flasken er vendt: det er
       dér, der sigtes fra (bunden af den oprejste flaske) */
    P.draabeSigte = function (gg) {
        var d = midtAf(gg), P0 = this.baerAnker || gg.p;
        return { x: P0.x + 2 * d.x, y: P0.y + 2 * d.y };
    };

    /* En hjaelpende haand: mens en flaske (et glas, sproejteflasken,
       vejebaaden) vipper over et maal, foeres tuden ind over aabningen
       (haeldning.aabning) og op over kanten. Den fulde hjaelp er naaet,
       naar der begynder at blive haeldt (vip 0,5). Forskydningen
       (tudHjaelp) glider, saa flasken ikke springer, naar maalet skifter
       eller haeldningen holder op. Uden dt (fra flyt) bruges den, som den
       er. */
    P.foerTud = function (gg, dt) {
        var P0 = this.baerAnker;
        if (!P0) return;
        var h = this.haeldning, hj = this.tudHjaelp, mx = 0, my = 0;
        if (h && h.maal && h.aabning && this.kanHaelde(gg)) {
            var t = gg.type.tud || gg.anker, a = gg.anker;
            var co = Math.cos(gg.p.v), si = Math.sin(gg.p.v), dx = t.x - a.x, dy = t.y - a.y;
            var nx = P0.x + dx * co - dy * si, ny = P0.y + dx * si + dy * co;
            var A = h.aabning, w = NK.blod(NK.klamp(h.vip * 2, 0, 1));
            mx = (NK.klamp(nx, A.x0, A.x1) - nx) * w;
            my = (Math.min(ny, A.y - 8) - ny) * w;
        }
        if (dt) {
            hj.x = NK.mod(hj.x, mx, 14, dt);
            hj.y = NK.mod(hj.y, my, 14, dt);
        }
        gg.p.x = P0.x + hj.x;
        gg.p.y = P0.y + hj.y;
    };

    /* Staar haanden stille, vaelges det naermeste maal uden hysterese.
       Hysteresen er der kun, for at rammen ikke skal flimre, mens man
       bevaeger sig; naar man er standset, er det glasset, man er naermest,
       man mener. Foer det vipper. */
    P.faldTilRo = function (gg) {
        if (!this.holdt || this.musFart > 100) return;
        if (this.haeldning && this.haeldning.vip > 0.05) return;
        var foer = this.slipMaal;
        this.slipMaal = null;
        this.slipMaal = this.maalVed(gg, this.holdt.sidst);
        if (this.slipMaal !== foer) this.folgHaeldning(gg);
    };

    /* Rystning og spild, mens noget baeres */
    P.opdaterRyst = function (dt) {
        var bb = this.baerer;
        var maal = 0;
        this.uro = 0;
        if (bb) {
            this.musFart *= Math.exp(-4 * dt);
            this.musVx *= Math.exp(-5 * dt);
            this.vold = NK.mod(this.vold, this.musFart, 4, dt);
            maal = NK.klamp(this.musFart / RYST.FULD, 0, 1);
            var harVaeske = this.aaben(bb) && B.volumen(bb) > 0.1;
            if (harVaeske) {
                if (this.vold > RYST.SPILD_FART) this.spildTid += dt;
                else this.spildTid = Math.max(0, this.spildTid - dt);
                this.uro = NK.klamp(this.spildTid / RYST.SPILD_TID, 0, 1);
            }
            var hv = bb.type.sprite ? 0 : -Math.PI / 2;
            /* Vippet, naar der haeldes med haanden */
            var vip = this.haeldning && this.haeldning.maal ? this.haeldning.vip : 0;
            if (vip > 0.01) {
                var tv = bb.kan.drypper ? Math.PI : (bb.type.tud ? bb.type.tud.v : -1.4);
                hv = hv + (tv - hv) * NK.blod(vip);
            }
            bb.p.v = NK.mod(bb.p.v, hv + NK.klamp(-this.musVx * 0.0004, -0.4, 0.4) * (1 - vip), 12, dt) + (Math.random() - 0.5) * 0.14 * this.uro;
            if (bb.kan.drypper) this.vendDrypper(bb);
            else this.foerTud(bb, dt);
            this.faldTilRo(bb);
            if (harVaeske && this.spildTid > 0.08 && Math.random() < dt * 14) {
                var fo = B.farve(bb) || Stof.VAND;
                var a = B.aabning(bb);
                this.draaber.push({ x: a.x + r(-3, 3), y: a.y, vx: r(-90, 90), vy: -r(60, 160), rad: r(1.4, 2.4), liv: 1, farve: { r: fo.r, g: fo.g, b: fo.b, a: 0.8 }, fysik: true });
            }
            if (harVaeske && this.spildTid >= RYST.SPILD_TID) {
                this.spild(bb, "rystet");
                return;
            }
            /* Glas taaler ikke alt */
            if (bb.type.glas) {
                if (this.vold > RYST.KNUS_FART) this.knusTid += dt;
                else this.knusTid = Math.max(0, this.knusTid - dt);
                if (this.knusTid >= RYST.KNUS_TID) {
                    this.knus(bb, "haand");
                    return;
                }
            }
        }
        this.ryst = NK.mod(this.ryst, maal, maal > this.ryst ? 6 : 3, dt);
        this.skvulpUr -= dt;
        var harIndhold = bb && this.aaben(bb) && B.volumen(bb) > 0.1;
        if (harIndhold && this.ryst > 0.3 && this.skvulpUr <= 0 && NK.Lyd && NK.Lyd.skvulp) {
            NK.Lyd.skvulp(this.ryst);
            this.skvulpUr = 0.55 - 0.2 * this.ryst;
        }
    };

    /* ----- Glas, der falder og knuses ------------------------------------------ */
    function skaarForm(rad) {
        var n = Math.random() < 0.5 ? 3 : 4, pts = [];
        for (var j = 0; j < n; j++) {
            var vv = j / n * Math.PI * 2 + r(-0.4, 0.4), rr = rad * r(0.5, 1);
            pts.push({ x: Math.cos(vv) * rr, y: Math.sin(vv) * rr });
        }
        return pts;
    }

    /* Genstanden blev sluppet foran bordkanten: den falder paa gulvet.
       Glas knuses; andet bliver liggende og kan tages op igen. */
    P.tab = function (gg) {
        var mig = this, S = NK.Scene, t = gg.type;
        var gulv = S.HOEJDE - 6;
        var til = t.sprite
            ? { x: gg.p.x, y: gulv - (t.h - gg.anker.y), v: gg.p.v + (Math.random() < 0.5 ? -0.5 : 0.5) }
            : { x: gg.p.x, y: gulv - 3, v: -Math.PI / 2 };
        this.frigoer(gg);
        this.koer.start([
            { flyt: gg, til: til, tid: 0.32, loeft: -8 },
            { kald: function () {
                if (t.glas) { mig.knus(gg, "gulv"); return; }
                gg.hjem = kopi(gg.p);
                mig.tilFront(gg);
                if (NK.Lyd && NK.Lyd.dunk) NK.Lyd.dunk();
                mig.besked(gg.titel.charAt(0).toUpperCase() + gg.titel.slice(1) + " faldt på gulvet.");
                mig.haendelse("tabt", gg);
            } }
        ], "tab");
        return true;
    };

    /* Glasset knuses: indholdet loeber ud, skaarene ligger tilbage, og
       glasset er vaek, til laereren har fejet og stillet et nyt frem */
    P.knus = function (gg, slags) {
        var S = NK.Scene, t = gg.type, i;
        this.holdt = null;
        this.baerer = null;
        this.slipMaal = null;
        this.knusTid = 0;
        this.spildTid = 0;
        this.musFart = 0;
        this.vold = 0;
        this.uro = 0;
        var paaGulv = slags === "gulv";
        var fod = this.fod(gg);
        var gulv = paaGulv ? S.HOEJDE - 6 : this.bordLinje(fod.y);
        var x = NK.klamp(fod.x, 60, S.BREDDE - 60);
        if (gg.kan.holder && !B.tom(gg)) {
            var fo = B.farve(gg) || Stof.VAND;
            var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.85 };
            sproejt(this, x, gulv - 10, farve, 20, gulv);
            this.nyPyt(x, (t.maks || 0) > 100 ? 70 : 50, farve, gulv);
            B.toem(gg);
        }
        var n = t.sprite ? Math.round(6 + (t.b * t.h) / 900) : 6;
        for (i = 0; i < Math.min(n, 18); i++) {
            this.skaar.push({ x: x + r(-14, 14), y: gulv - 6 - r(0, 24), vx: r(-220, 220), vy: -r(60, 260), a: r(0, 6.28), va: r(-9, 9), pts: skaarForm(r(3, 8)), alfa: 1, hvile: false, gulv: gulv + r(-2, 2) });
        }
        this.frigoer(gg);
        gg.skjult = true;
        gg.knust = true;
        if (this.valgt === gg.navn) this.vaelg(null);
        if (NK.Lyd && NK.Lyd.knus) NK.Lyd.knus();
        var titel = gg.titel.charAt(0).toUpperCase() + gg.titel.slice(1);
        this.uheld("knust", gg, paaGulv ? titel + " faldt på gulvet og knustes." : titel + " knustes i hånden.");
        return true;
    };

    /* En voldsom reaktion: det koger over og sproejter */
    P.voldsom = function (c) {
        var fo = B.farve(c) || Stof.VAND;
        var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.8 };
        var o = B.aabning(c);
        sproejt(this, o.x, o.y, farve, 16);
        for (var i = 0; i < 8; i++) this.dampe.push({ x: o.x + r(-10, 10), y: o.y - 4, vx: r(-14, 14), vy: r(-40, -20), rad: r(7, 12), liv: 1 });
        this.ryk = 3;
        if (NK.Lyd && NK.Lyd.plask) NK.Lyd.plask();
        this.besked("Det bliver kogende varmt og sprøjter!", "advarsel");
        this.haendt_voldsom = true;
        this.haendelse("voldsom", c);
        this.aendret("voldsom");
    };

    P.opdaterSkaar = function (dt) {
        var S = NK.Scene;
        for (var i = 0; i < this.skaar.length; i++) {
            var s = this.skaar[i];
            if (s.hvile) continue;
            s.vy += 1300 * dt;
            s.x = NK.klamp(s.x + s.vx * dt, 20, S.BREDDE - 20);
            s.y += s.vy * dt;
            s.a += s.va * dt;
            if (s.y > s.gulv) {
                s.y = s.gulv;
                if (Math.abs(s.vy) > 90) { s.vy = -s.vy * 0.3; s.vx *= 0.6; s.va *= 0.5; }
                else {
                    s.vy = 0;
                    s.vx *= Math.max(0, 1 - 8 * dt);
                    s.va *= Math.max(0, 1 - 10 * dt);
                    if (Math.abs(s.vx) < 5 && Math.abs(s.va) < 0.4) s.hvile = true;
                }
            }
        }
    };

    /* ----- Slip: moede eller saet ned ------------------------------------- */

    /* Kan maal tage imod gg, naar gg slippes over det? */
    P.kanModtage = function (gg, maal) {
        if (!gg || !maal || gg === maal || !this.synlig(maal)) return false;
        var k = gg.kan, m = maal.kan;
        if (m.holder && !m.pulver) {
            if (k.haelder && (B.volumen(gg) > 0.05 || (gg.type.navn === "vejebaad" && B.fastIalt(gg) > 0.5))) return true;
            if (k.drypper && B.volumen(gg) > 0.05) return true;
            if (k.sproejter && B.volumen(gg) > 0.05) return true;
            if (k.spatel && gg.last) return true;
            if (k.roerer || k.maaler) return B.volumen(maal) > 0.1 || k.maaler;
        }
        if (m.pulver && k.spatel && !gg.last) return true;
        if ((m.affald || m.vask) && k.holder && !B.tom(gg)) return true;
        if (m.stoette && gg.type.navn === "reagensglas") return this.ledigtHul(maal) >= 0;
        if (m.bad && gg.type.navn === "reagensglas") return this.ledigPlads(maal) !== null;
        if (m.varmer && k.holder && !k.flaske && !k.drypper && !k.sproejter && !k.pulver && gg.type.navn !== "reagensglas") return true;
        if (m.vaegt && k.holder && gg.type.navn !== "reagensglas") return true;
        if (m.luge && !k.fast && gg.type.navn !== "reagensglas" && gg.type.sprite) return true;
        if (m.holder && k.dypper && B.volumen(maal) > 0.05) return true;
        if (m.flamme && k.dypper && gg.last) return true;
        return false;
    };

    P.ledigtHul = function (st, naerX) {
        var bedst = -1, afst = Infinity;
        for (var i = 0; i < st.glas.length; i++) {
            if (st.glas[i]) continue;
            var d = naerX === undefined ? i : Math.abs(this.hulX(st, i) - naerX);
            if (d < afst) { afst = d; bedst = i; }
        }
        return bedst;
    };

    P.hulX = function (st, i) { return st.p.x - st.anker.x + st.type.huller[i]; };

    /* Genstandens fod: midten af dens underkant paa tegnebordet */
    P.fod = function (gg) {
        var t = gg.type;
        if (t.sprite) return NK.tilVerden(gg.p, gg.anker, t.b / 2, t.h);
        return NK.tilVerden(gg.p, gg.anker, 0, t.laengde || 100);
    };

    /* ----- Slipmaalet ---------------------------------------------------------
       Hvad under det baarne vil tage imod det? Alle, der bestaar kanModtage,
       er kandidater, og de scores efter, hvor taet det, man sigter med, staar
       paa det, man sigter efter: tuden mod aabningen, naar der haeldes; foden
       mod hullet eller pladen, naar noget stilles; ellers musen mod
       genstanden. Den naermeste vinder. Foer var det den oeverst tegnede af
       dem, der overhovedet blev ramt - i praksis den, man sidst havde roert.

       Traefzonerne er som foer (SIGTE), paa nær flaskehalsen: en flaske
       rammes nu inden for SIGTE.hals enheder af halsen i stedet for 6, som
       var et par skaermpixels. Er man tydeligt ved siden af, saettes det
       baarne stadig ned mellem flaskerne.

       Hysterese: det maal, der allerede er valgt (slipMaal), beholdes,
       medmindre et andet er tydeligt bedre, saa den groenne ramme ikke
       flimrer mellem to glas, mens musen bevaeger sig lidt. */
    var SIGTE = {
        hals: 16, halsOp: 40, halsNed: 10,     /* tuden over en flaskehals */
        glasSide: 14, glasOp: 90,              /* tuden over et glas */
        tudNed: 6,                             /* tuden hoejst saa langt under aabningen */
        musNed: 50,                            /* musen paa et glas: kun ved aabningen */
        stativ: 12, plade: 30,                 /* foden i stativet, paa pladen */
        holder: 10, andet: 6,                  /* musen paa genstanden */
        hysterese: 10
    };

    /* Afstanden fra det, man sigter med, til det, man sigter efter paa c -
       eller null, hvis c slet ikke er inden for raekkevidde */
    P.sigteScore = function (gg, c, pt, fod, tud) {
        var m = c.kan;
        var plads = m.stoette || m.varmer || m.vaegt || m.luge;
        var rk = this.rekt(c, 0);
        var midt = { x: rk.x + rk.b / 2, y: rk.y + rk.h / 2 };
        /* Det, noget stilles i eller paa, afgoeres af foden */
        if (plads) {
            if (!this.inden(c, fod, m.stoette ? SIGTE.stativ : SIGTE.plade)) return null;
            if (m.stoette) {
                var hul = this.ledigtHul(c, fod.x);
                return hul < 0 ? null : Math.abs(this.hulX(c, hul) - fod.x);
            }
            return Math.abs(fod.x - midt.x) + Math.abs(fod.y - rk.y) * 0.5;
        }
        /* Braenderen: foden paa trefodens plade, som ligger over spriten */
        if (m.flamme && c.type.plade) {
            var px = c.p.x - c.anker.x, py = c.p.y - c.anker.y + c.type.plade.y;
            if (fod.x > px + c.type.plade.x0 - 24 && fod.x < px + c.type.plade.x1 + 24 && fod.y > py - 60 && fod.y < py + 70) {
                return Math.abs(fod.x - (px + (c.type.plade.x0 + c.type.plade.x1) / 2));
            }
        }
        /* Haeldning: tuden mod aabningen. Der haeldes ovenfra: en tud under
           glassets kant ville haelde ved siden af, saa det sigter ikke.
           Draabeflasken sigter med bunden, som bliver spidsen, naar den
           vender (draabeSigte); den maa gerne gaa lidt ned i glasset, for
           den loeftes op over aabningen, mens den vender. */
        var ob = B.aabning(c);
        if (tud && m.holder) {
            var dx = Math.abs(tud.x - ob.x);
            var bund = gg.kan.drypper ? rk.y + rk.h * 0.6 : ob.y + SIGTE.tudNed;
            if (m.flaske || m.sproejter || m.pulver) {
                if (dx < SIGTE.hals && tud.y > ob.y - SIGTE.halsOp && tud.y < ob.y + SIGTE.halsNed) return dx;
            } else if (tud.x > rk.x - SIGTE.glasSide && tud.x < rk.x + rk.b + SIGTE.glasSide &&
                       tud.y > rk.y - SIGTE.glasOp && tud.y < bund) {
                return dx;
            }
        }
        /* Ellers musen mod genstanden; paa et glas kun ved aabningen, saa
           det, der stilles paa bordet foran et glas, ikke haelder i det */
        if (!this.inden(c, pt, m.holder ? SIGTE.holder : SIGTE.andet)) return null;
        if (m.holder && pt.y > ob.y + SIGTE.musNed) return null;
        var maal = m.holder ? ob : midt;
        return Math.abs(pt.x - maal.x) + Math.abs(pt.y - maal.y) * 0.7;
    };

    /* Alle, der vil tage imod gg, med deres score, naermeste foerst */
    P.sigteKandidater = function (gg, pt) {
        var ud = [];
        var fod = this.fod(gg);
        /* Staar foden lige paa en hylde, er det den, man stiller noget
           paa: saa haeldes der ikke i glassene under hylden */
        var hylde = this.hyldeVed(this.fodOprejst(gg));
        var tud = gg.kan.drypper && gg.type.sprite ? this.draabeSigte(gg)
            : (gg.kan.haelder || gg.kan.drypper || gg.kan.sproejter) ? B.tudVerden(gg) : null;
        for (var i = 0; i < this.liste.length; i++) {
            var c = this.liste[i];
            if (c === gg || !this.synlig(c) || !this.kanModtage(gg, c)) continue;
            if (hylde && c.kan.holder && this.rekt(c, 0).y > hylde.y - 1) continue;
            var s = this.sigteScore(gg, c, pt, fod, tud);
            if (s !== null) ud.push({ navn: c.navn, score: s });
        }
        ud.sort(function (a, b) { return a.score - b.score; });
        return ud;
    };

    /* Foden paa det baarne, som det ville staa oprejst i haanden */
    P.fodOprejst = function (gg) {
        var t = gg.type, P0 = this.baerAnker;
        if (!P0 || !t.sprite) return this.fod(gg);
        return { x: P0.x + t.b / 2 - gg.anker.x, y: P0.y + t.h - gg.anker.y };
    };

    /* Hylden, foden er ved at blive stillet paa: lige over hyldens
       overflade (hoejst 20 enheder) og inden for dens bredde */
    P.hyldeVed = function (fod) {
        var ud = null;
        (NK.Scene.HYLDER || []).forEach(function (H) {
            if (fod.x > H.x0 - 10 && fod.x < H.x1 + 10 && fod.y > H.y - 20 && fod.y < H.y + 4) ud = H;
        });
        return ud;
    };

    P.maalVed = function (gg, pt) {
        if (!pt || !gg) return null;
        if (gg.kan.papir) {
            for (var k = 0; k < this.pytter.length; k++) {
                var py = this.pytter[k];
                if (py.vaad > 0.05 && Math.abs(pt.x - py.x) < py.rx + 30 && pt.y > (py.y || NK.Scene.BORD) - 60) return "pyt:" + k;
            }
            return null;
        }
        var kand = this.sigteKandidater(gg, pt);
        if (!kand.length) return null;
        var bedst = kand[0];
        var forrige = this.slipMaal;
        if (forrige && forrige !== bedst.navn) {
            for (var i = 1; i < kand.length; i++) {
                if (kand[i].navn === forrige && kand[i].score <= bedst.score + SIGTE.hysterese) return forrige;
            }
        }
        return bedst.navn;
    };

    P.slip = function (gg, pt) {
        var maal = this.slipMaal || this.maalVed(gg, pt);
        this.slipMaal = null;
        var h = this.haeldning;
        this.haeldning = null;
        if (this.straale && this.straale.haand) this.straale = null;
        if (maal && maal.indexOf("pyt:") === 0) { this.toerOp(gg, +maal.slice(4)); return; }
        var c = maal ? this.g[maal] : null;
        /* Er der allerede haeldt med haanden, gives ingen portion oveni */
        if (c && h && h.harHaeldt && c.kan.holder && (gg.kan.haelder || gg.kan.drypper || gg.kan.sproejter)) {
            gg.svaev = null;
            this.koer.start(this.svaevVed(gg, c, gg.kan.drypper ? { dx: 0, dy: -26, v: Math.PI } : null), "svaev");
            if (gg.kan.drypper) this.besked(flereDraaber(gg));
            this.aendret("haeldt");
            return;
        }
        if (c && this.moede(gg, c, pt)) return;
        this.saetNed(gg, pt);
    };

    /* Genstanden gg bruges paa c. Returnerer true, hvis der skete noget. */
    P.moede = function (gg, c, pt) {
        var k = gg.kan, m = c.kan;
        if (m.affald || m.vask) return this.toemI(gg, c);
        if (m.stoette && gg.type.navn === "reagensglas") return this.iStativ(gg, c, this.ledigtHul(c, pt ? pt.x : undefined));
        /* Et reagensglas, der slippes over et bad, stilles ned i det. Det
           skal staa foer m.holder, ellers ville glasset haelde sit indhold
           i badet i stedet. */
        if (m.bad && gg.type.navn === "reagensglas") return this.iBad(gg, c, pt ? pt.x : undefined);
        if (m.flamme && k.dypper) return this.flammeproeve(gg, c);
        if ((m.varmer || m.vaegt) && k.holder) return this.paaPlade(gg, c, pt ? pt.x : undefined);
        if (m.luge && !k.fast && gg.type.sprite) return this.paaPlade(gg, c, pt ? pt.x : undefined);
        if (m.pulver && k.spatel) return this.fyldSpatel(gg, c);
        if (m.holder) {
            if (k.dypper) return this.dyp(gg, c);
            if (k.spatel && gg.last) return this.toemSpatel(gg, c);
            if (k.drypper) return this.draabe(gg, c);
            if (k.sproejter) return this.sproejt(gg, c);
            if (k.haelder) return this.haeld(gg, c, this.portion(gg, c));
            if (k.roerer) return this.roer(gg, c);
            if (k.maaler) return this.maal(gg, c);
        }
        return false;
    };

    P.brug = P.moede;

    /* Genstanden saettes ned der, hvor den blev sluppet. Slippes den
       foran bordkanten, falder den paa gulvet. */
    P.saetNed = function (gg, pt) {
        var S = NK.Scene, t = gg.type;
        /* Genstanden lander der, hvor den er, ikke der, hvor musen er: den
           kan vaere grebet i kanten */
        var fod = this.fod(gg);
        if (pt && pt.y > S.FORKANT + 30) return this.tab(gg);
        var x = NK.klamp(t.sprite ? fod.x : gg.p.x, 40, S.BREDDE - 40);
        var linje = this.bordLinje(fod.y);
        /* Paa en hylde, hvis foden er lige over den */
        var hylde = null;
        (S.HYLDER || []).forEach(function (H) {
            if (fod.x > H.x0 - 10 && fod.x < H.x1 + 10 && fod.y > H.y - 60 && fod.y < H.y + 40) hylde = H;
        });
        if (hylde && t.sprite && t.navn !== "reagensglas") {
            gg.p = staar(t, NK.klamp(x, hylde.x0 + t.b / 2, hylde.x1 - t.b / 2), hylde.y);
            gg.hjem = kopi(gg.p);
            this.tilFront(gg);
            this.haendelse("satNed", gg);
            return true;
        }
        if (t.navn === "reagensglas") {
            var fod = this.fod(gg);
            for (var i = 0; i < this.liste.length; i++) {
                var st = this.liste[i];
                if (!st.kan.stoette || !this.synlig(st)) continue;
                var hul = this.ledigtHul(st, fod.x);
                var hulFod = st.p.y - st.anker.y + st.type.hulY + t.h - t.anker.y;
                if (hul >= 0 && Math.abs(this.hulX(st, hul) - fod.x) < 26 && Math.abs(fod.y - hulFod) < 70) return this.iStativ(gg, st, hul);
            }
            this.vaelt(gg, x, linje);
            return true;
        }
        if (t.sprite) gg.p = staar(t, x, linje);
        else gg.p = { x: x, y: linje - 3, v: -Math.PI / 2 };
        gg.hjem = kopi(gg.p);
        this.tilFront(gg);
        this.ordnDybde();
        this.haendelse("satNed", gg);
        return true;
    };

    /* Den linje paa bordpladen, noget stilles paa, naar foden er i y:
       bagkanten, forkanten eller et sted imellem */
    P.bordLinje = function (y) {
        var S = NK.Scene;
        return NK.klamp(y, S.BORD, S.FORKANT);
    };

    /* Hvor noget roerer bordet: underkanten af det, der staar frit */
    P.dybdeAf = function (gg) {
        var S = NK.Scene;
        if (!S.DYBDE || gg.sted || gg.paa || gg.i || gg.skjult) return S.BORD;
        var bund = gg.type.sprite ? gg.p.y - gg.anker.y + gg.type.h : gg.p.y + 3;
        return bund > S.BORD + 1 && bund <= S.FORKANT + 1 ? bund : S.BORD;
    };

    /* Tegne- og traefraekkefoelgen i dybden: alt ved bagkanten beholder sin
       indbyrdes orden (det sidst roerte oeverst), og det, der staar
       laengere fremme, kommer efter, det forreste sidst. Uden dybde goer
       den ingenting. */
    P.ordnDybde = function () {
        if (!NK.Scene.DYBDE) return;
        var mig = this;
        var noegle = this.liste.map(function (gg, i) { return { gg: gg, i: i, d: mig.dybdeAf(gg) }; });
        noegle.sort(function (a, b) { return a.d - b.d || a.i - b.i; });
        this.liste = noegle.map(function (n) { return n.gg; });
    };

    P.tilFront = function (gg) {
        var i = this.liste.indexOf(gg);
        if (i >= 0) { this.liste.splice(i, 1); this.liste.push(gg); }
    };

    /* Et reagensglas, der saettes paa bordet, vaelter */
    P.vaelt = function (gg, x, linje) {
        var S = NK.Scene;
        if (linje === undefined) linje = S.BORD;
        var mod = x > S.BREDDE / 2 ? -1 : 1;
        gg.p = { x: x, y: linje - 9, v: mod * Math.PI / 2 };
        gg.hjem = kopi(gg.p);
        this.tilFront(gg);
        this.ordnDybde();
        if (!B.tom(gg)) {
            var fo = B.farve(gg) || Stof.VAND;
            var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.85 };
            var a = B.aabning(gg);
            sproejt(this, a.x, a.y, farve, 14, linje);
            this.nyPyt(a.x, 40, farve, linje);
            gg.spildtMaerker = Stof.faremaerker(B.samlet(gg));
            B.toem(gg);
            this.uheld("vaeltet", gg, gg.titel + " væltede, og indholdet løb ud.");
            return;
        }
        this.besked(gg.titel + " væltede. Sæt det i stativet.", "advarsel");
        this.haendelse("vaeltet", gg);
    };

    /* ----- Pladser: stativ og varmeplade ------------------------------------- */
    P.iStativ = function (gg, st, hul, stille) {
        if (!st || hul < 0 || hul === undefined || st.glas[hul]) return false;
        this.frigoer(gg);
        st.glas[hul] = gg;
        gg.sted = { stativ: st, hul: hul };
        var til = { x: this.hulX(st, hul), y: st.p.y - st.anker.y + st.type.hulY, v: 0 };
        gg.hjem = kopi(til);
        if (stille) gg.p = kopi(til);
        else this.koer.start([{ flyt: gg, til: til, tid: 0.35, loeft: 0 }], "hjem");
        /* Glasset tegnes lige efter stativet */
        var i = this.liste.indexOf(gg), j = this.liste.indexOf(st);
        if (i >= 0 && j >= 0 && i < j) { this.liste.splice(i, 1); this.liste.splice(this.liste.indexOf(st) + 1, 0, gg); }
        this.haendelse("stativ", gg);
        return true;
    };

    P.paaPlade = function (gg, plade, x, stille) {
        if (!plade) return false;
        var t = plade.type, p0 = plade.p.x - plade.anker.x, top = plade.p.y - plade.anker.y + t.plade.y;
        var cx = NK.klamp(x === undefined ? p0 + t.b / 2 : x, p0 + t.plade.x0 + gg.type.b / 2, p0 + t.plade.x1 - gg.type.b / 2);
        this.frigoer(gg);
        gg.paa = plade;
        var til = staar(gg.type, cx, top);
        gg.hjem = kopi(til);
        if (stille) gg.p = kopi(til);
        else this.koer.start([{ flyt: gg, til: til, tid: 0.35, loeft: 10 }], "hjem");
        this.tilFront(gg);
        this.haendelse("plade", gg);
        return true;
    };

    /* ----- Badet -------------------------------------------------------------
       Et bad (udstyr "bad") er et stort baegerglas, der staar fast, og som
       man saetter reagensglas ned i. Glasset i badet tager badets
       temperatur, saa et bad paa en taendt varmeplade er et vandbad, og et
       bad med holdT i opstillingen er et isbad. Der er plads til de glas,
       der kan staa ved siden af hinanden paa badets plade.

       Badet er det samme moenster som stativet og varmepladen: pladsen
       afgoeres af geometrien, ikke af en liste over, hvad der maa staa i
       hvad. Derfor kan ethvert forsoeg stille et bad op uden ny kode. */
    P.badPladser = function (bad) {
        var t = bad.type, b = 34 * (bad.skala || 1);
        var n = Math.max(1, Math.floor((t.plade.x1 - t.plade.x0) / b));
        var p0 = bad.p.x - bad.anker.x, ud = [];
        for (var i = 0; i < n; i++) ud.push(p0 + t.plade.x0 + b * (i + 0.5));
        return ud;
    };

    P.iBadet = function (bad) {
        return this.liste.filter(function (x) { return x.paa === bad; });
    };

    /* Den ledige plads naermest x, eller null hvis badet er fuldt */
    P.ledigPlads = function (bad, naerX) {
        var pladser = this.badPladser(bad);
        var optaget = this.iBadet(bad).map(function (x) { return x.p.x; });
        var bedst = null, afst = Infinity;
        pladser.forEach(function (x, i) {
            if (optaget.some(function (o) { return Math.abs(o - x) < 8; })) return;
            var d = naerX === undefined ? i : Math.abs(x - naerX);
            if (d < afst) { afst = d; bedst = x; }
        });
        return bedst;
    };

    P.iBad = function (gg, bad, x, stille) {
        if (!bad) return false;
        var cx = this.ledigPlads(bad, x);
        if (cx === null) { this.besked("Der er ikke plads til flere glas i " + bad.titel + "."); return false; }
        this.frigoer(gg);
        gg.paa = bad;
        /* Glasset staar nede i vaesken: aabningen bliver over badets kant */
        var til = { x: cx, y: bad.p.y - bad.anker.y + bad.type.plade.y - 62 * (gg.skala || 1), v: 0 };
        gg.hjem = kopi(til);
        if (stille) gg.p = kopi(til);
        else this.koer.start([{ flyt: gg, til: til, tid: 0.35, loeft: 14 }], "hjem");
        this.tilFront(gg);
        this.haendelse("bad", gg);
        this.aendret("bad");
        return true;
    };

    /* En portion: flaskens standardportion, dog hoejst en femtedel af det
       glas, der haeldes i. 0 = alt (fx fra et reagensglas i et baegerglas). */
    P.portion = function (gg, c) {
        var p = gg.type.haeldMl || 0;
        var kap = c && c.type.maks ? c.type.maks / 5 : 0;
        if (!kap) return p;
        return p ? Math.min(p, kap) : kap;
    };

    /* Det, der svaever over noget lige nu */
    P.svaevende = function () {
        for (var i = 0; i < this.liste.length; i++) if (this.liste[i].svaev) return this.liste[i];
        return null;
    };

    /* Den gule ring med pilen ved siden af det, der svaever: et klik paa
       den gentager handlingen, og den siger hvilken, naar musen er over
       den. Et klik paa selve flasken goer det ikke (klik). hvad giver
       navnet "svaevring". */
    P.svaevRing = function () {
        var sv = this.svaevende();
        if (!sv || this.koer.flytter(sv) || !this.kanGentage(sv)) return null;
        var r = this.rekt(sv, 0);
        return { x: r.x + r.b + 22, y: r.y + r.h * 0.5, r: 15, navn: sv.navn, tekst: pilenGiver(sv).navn };
    };

    /* Kan det, der svaever, gentage? En fuld spatel over pulverglasset kan
       ikke tage mere, og en tom spatel over et glas kan kun, hvis den har
       et pulverglas at hente i. */
    P.kanGentage = function (sv) {
        if (!sv.kan.spatel) return true;
        if (sv.svaev && sv.svaev.maal && sv.svaev.maal.kan.pulver) return false;
        return !sv.last && !!this.pulverAtHente(sv);
    };

    /* Hvad pilen giver: navn ved pilen og »for ...« i beskeden */
    function pilenGiver(gg) {
        var k = gg.kan;
        if (k.drypper) return { navn: "En dråbe mere", besked: "for en dråbe mere" };
        if (k.sproejter) return { navn: "En sjat mere", besked: "for en sjat mere" };
        if (k.spatel) return { navn: "En spatelspids mere", besked: "for en spatelspids mere" };
        if (k.roerer) return { navn: "Rør igen", besked: "for at røre igen" };
        if (k.dypper) return { navn: "Dyp igen", besked: "for at dyppe igen" };
        return { navn: "Hæld mere", besked: "for at hælde mere" };
    }

    /* Koreografitrin: gg lander svaevende over c og bliver der, til det
       traekkes vaek. pose: { dx, dy, v } i forhold til aabningen; uden pose
       bliver gg i haeldepositur med tuden over aabningen, saa det er
       tydeligt, at der haeldes. */
    P.svaevVed = function (gg, c, pose) {
        var mig = this;
        function positur() {
            if (pose) return B.overAabning(gg, c, pose.dx, pose.dy, pose.v);
            return B.haeldPositur(gg, c);
        }
        return [
            { flyt: gg, til: positur, tid: 0.45, loeft: 12 },
            { kald: function () { gg.svaev = { maal: c, ur: Infinity }; mig.tilFront(gg); mig.aendret("svaev"); } }
        ];
    };

    /* ----- Beskeder, valg, markering ------------------------------------------ */
    P.besked = function (tekst, slags) {
        if (this.vedBesked) this.vedBesked(tekst, slags || "info");
    };

    P.aendret = function (grund) {
        if (this.vedAendring) this.vedAendring(grund);
    };

    P.haendelse = function (type, data) {
        if (this.vedHaendelse) this.vedHaendelse(type, data);
        if (this.laererHaendelse) this.laererHaendelse(type, data);
    };

    P.uheld = function (slags, gg, tekst) {
        this.antalUheld++;
        this.haendt[slags + "_" + gg.navn] = true;
        this.ryk = 4;
        if (NK.Lyd && NK.Lyd.plask) NK.Lyd.plask();
        if (tekst) this.besked(tekst, "advarsel");
        this.haendelse(slags, gg);
        if (this.laererUheld) this.laererUheld(slags, gg);
        this.aendret("uheld");
    };

    P.vaelg = function (navn) {
        if (this.valgt === navn) return;
        var mig = this;
        this.valgt = navn;
        this.liste.forEach(function (gg) { gg.valgt = gg.navn === navn; });
        this.aendret("valg");
    };

    P.valgtBeholder = function () {
        var c = this.valgt ? this.g[this.valgt] : null;
        return c && this.synlig(c) && B.er(c) ? c : null;
    };

    P.markér = function (navn, sek) {
        this.mark = { navn: navn, ur: sek || 3 };
    };

    P.markeret = function (navn) {
        return !!(this.mark && this.mark.navn === navn && this.mark.ur > 0);
    };

    P.optaget = function () {
        return this.koer.optaget();
    };

    /* ----- Klik --------------------------------------------------------------
       Klik viser, traek goer. Et klik vaelger det, der rummer noget, til
       aflaesning og zoom; handlinger sker kun ved at traekke. Undtagelser:
       kontakten paa varmepladen, og en draabeflaske, der allerede haenger
       over et glas (klik igen giver en draabe mere). */
    P.klik = function (navn) {
        if (NK.Lyd) NK.Lyd.laasOp();
        if (navn === "boble") return this.storBoble ? this.lukStorBoble() : this.aabnStorBoble();
        if (navn === "laerer") return this.klikLaerer ? this.klikLaerer() : false;
        if (navn === "kaffekop") return this.klikKop ? this.klikKop() : false;
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (this.baerer) return false;
        if (navn === "svaevring") {
            var sv = this.svaevende();
            if (!sv || this.koer.optaget() || !this.kanGentage(sv)) return false;
            if (sv.kan.spatel) return this.hentOgGiv(sv, sv.svaev.maal);
            return this.moede(sv, sv.svaev.maal) || false;
        }
        var gg = this.g[navn];
        if (!gg || !this.synlig(gg)) return false;
        var k = gg.kan;
        if (k.varmer) {
            if (this.koer.optaget()) return false;
            gg.taendt = !gg.taendt;
            if (NK.Lyd && NK.Lyd.kontakt) NK.Lyd.kontakt();
            var T = gg.titel.charAt(0).toUpperCase() + gg.titel.slice(1);
            this.besked(gg.taendt ? T + " er tændt." : T + " er slukket.");
            this.haendelse("taendt", gg);
            this.aendret("plade");
            return true;
        }
        if (k.luge) {
            if (this.koer.optaget()) return false;
            if (this.vedLuge) return this.vedLuge(gg);
            this.besked("Lugen fører ingen steder hen.");
            return false;
        }
        if (k.vaegt) {
            gg.tara = this.masseePaa(gg);
            if (NK.Lyd && NK.Lyd.klik) NK.Lyd.klik();
            this.besked("Vægten er tareret.");
            this.aendret("tara");
            return true;
        }
        /* Det, der svaever, gentager kun med pilen; et klik paa selve
           flasken siger, hvordan man faar mere, eller at den skal traekkes
           vaek */
        if (gg.svaev) {
            if (!this.kanGentage(gg)) this.besked(k.spatel && gg.last ? "Spatlen er fuld. Træk den hen over et glas." : "Træk " + gg.titel + " væk.");
            else this.besked("Klik på pilen " + pilenGiver(gg).besked + ", eller træk " + gg.titel + " væk.");
            return false;
        }
        if (k.holder) {
            this.vaelg(navn);
            this.besked(gg.titel.charAt(0).toUpperCase() + gg.titel.slice(1) + " er valgt. Tag fat i udstyret for at bruge det.");
            return true;
        }
        if (k.spatel) this.besked(gg.last ? "Slip spatlen over et glas." : "Slip spatlen over et pulverglas for at tage en spatelspids.");
        else if (k.roerer || k.maaler) this.besked("Slip " + gg.titel + " over et glas.");
        else if (k.papir) this.besked("Slip køkkenrullen over en pyt.");
        else if (k.stoette) this.besked("Slip et reagensglas over stativet.");
        else if (k.luge) this.besked("Stil noget i lugen, og klik på knappen for at sende det.");
        else if (k.affald || k.vask) this.besked("Slip et glas over " + gg.titel + " for at tømme det.");
        return false;
    };

    P.foersteMed = function (egenskab) {
        for (var i = 0; i < this.liste.length; i++) if (this.liste[i].kan[egenskab] && this.synlig(this.liste[i])) return this.liste[i];
        return null;
    };

    /* ----- Handlingerne ------------------------------------------------------- */

    /* Beholderen loeber over: det overskydende sproejter ud og bliver en pyt */
    P.tjekOverloeb = function (c) {
        var ud = B.overloeb(c);
        if (!ud) return false;
        var o = B.aabning(c);
        var fo = Stof.farve(ud, c.type.vejlaengde) || Stof.VAND;
        var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.8 };
        for (var i = 0; i < 18; i++) {
            this.draaber.push({ x: o.x + r(-8, 8), y: o.y + 2, vx: r(-120, 120), vy: -r(40, 160), rad: r(1.4, 2.6), liv: 1, farve: farve, fysik: true });
        }
        this.nyPyt(o.x, c.type.maks < 30 ? 44 : 70, farve);
        this.uheld("overloeb", c, c.titel + " løber over.");
        return true;
    };

    /* y: underlaget (bordet, hvis det udelades) */
    P.nyPyt = function (x, rx, farve, y) {
        var S = NK.Scene;
        var py = { x: NK.klamp(x, 120, S.BREDDE - 120), rx: 8, rxMaal: rx, farve: farve, vaad: 1 };
        if (y !== undefined) py.y = y;
        this.pytter.push(py);
        if (this.pytter.length > 6) this.pytter.shift();
    };

    function sproejt(f, x, y, farve, n, gulv) {
        for (var i = 0; i < n; i++) {
            f.draaber.push({ x: x + r(-4, 4), y: y, vx: r(-240, 240), vy: -r(120, 360), rad: r(1.6, 3), liv: 1, farve: farve, fysik: true, gulv: gulv });
        }
    }

    /* Hvor meget der skvulper ud af et aabent glas, der rystes for
       voldsomt. En tiendedel: nok til et uheld og en pyt paa bordet, men
       ikke nok til at forsoeget er tabt. Rystes der videre, sker det
       igen. */
    var SKVULP = 0.1;

    /* Et aabent glas blev rystet saa voldsomt, at indholdet sproejtede ud */
    P.spild = function (gg, slags) {
        this.holdt = null;
        this.baerer = null;
        this.slipMaal = null;
        this.spildTid = 0;
        this.uro = 0;
        this.musFart = 0;
        this.vold = 0;
        var fo = B.farve(gg) || Stof.VAND;
        var farve = { r: fo.r, g: fo.g, b: fo.b, a: 0.85 };
        var a = B.aabning(gg);
        var V = B.volumen(gg);
        var tabt = B.udtag(gg, V * SKVULP);
        var del = V > 0 ? tabt.V / V : 0;
        sproejt(this, a.x, a.y, farve, Math.max(8, Math.round(26 * (0.4 + del * 6))));
        this.nyPyt(gg.p.x, (gg.type.maks < 30 ? 56 : 66) * NK.klamp(0.5 + del * 5, 0.5, 1), farve);
        gg.spildtMaerker = Stof.faremaerker(tabt);
        this.koer.start([NK.Koer.hjemTil(gg, 0.6, 20)], "hjem");
        this.uheld(slags || "spild", gg, "Det skvulpede ud. En tiendedel røg på bordet.");
    };

    /* Massen af det, der staar paa vaegten (glas og indhold) */
    P.masseePaa = function (vaegt) {
        var m = 0;
        this.liste.forEach(function (gg) { if (gg.paa === vaegt && !gg.skjult) m += B.masse(gg); });
        return m;
    };

    P.vaegtTekst = function (vaegt) {
        var m = this.masseePaa(vaegt) - (vaegt.tara || 0);
        return (m < 0 ? "−" : "") + Math.abs(m).toFixed(2).replace(".", ",") + " g";
    };

    /* Fast stof haeldes fra en toer beholder (vejebaaden) i c */
    P.haeldFast = function (gg, c) {
        var mig = this;
        var liste = Stof.faste(gg.indhold);
        if (!liste.length) return false;
        if (this.aaben(c)) this.vaelg(c.navn);
        this.koer.start([
            { flyt: gg, til: function () { return B.haeldPositur(gg, c, 10); }, tid: 0.6, loeft: 30 },
            { tid: 0.6, hver: function () {
                if (Math.random() < 0.7) {
                    var tud = B.tudVerden(gg), f = liste[Math.floor(Math.random() * liste.length)];
                    mig.draaber.push({ x: tud.x + r(-3, 3), y: tud.y, vx: r(-8, 8), vy: r(20, 60), rad: 1.5, liv: 1, farve: f.stof.farve || { r: 230, g: 230, b: 230 }, korn: true, c: c });
                }
            } },
            { kald: function () {
                liste.forEach(function (f) { B.tilsaetFast(c, f.navn, f.umol); Stof.tilsaet(gg.indhold, f.navn, -f.umol); });
                mig.haendelse("fast", { til: c, fra: gg });
                mig.aendret("fast");
            } },
            NK.Koer.hjemTil(gg, 0.6, 30)
        ], "haeld");
        return true;
    };

    /* Podetraaden dyppes i c og tager en draabe med */
    P.dyp = function (gg, c) {
        var mig = this;
        if (B.volumen(c) < 0.05) return false;
        if (this.aaben(c)) this.vaelg(c.navn);
        var o = B.aabning(c);
        var dyb = Math.min(gg.type.laengde - 20, c.type.h * 0.5);
        this.koer.start([
            { flyt: gg, til: function () { return { x: o.x, y: o.y - (gg.type.laengde - dyb), v: 0.1 }; }, tid: 0.5, loeft: 30 },
            { tid: 0.3 },
            { kald: function () {
                gg.last = B.udtag(c, 0.02);
                gg.lastFarve = Stof.farve(gg.last, 3) || Stof.VAND;
                mig.haendelse("dyppet", { fra: c });
            } },
            NK.Koer.hjemTil(gg, 0.6, 30)
        ], "dyp");
        return true;
    };

    /* Flammeproeve: draaben i podetraadens oeje holdes ind i flammen. Farven
       er stoffernes egen (flamme i stoftabellen), vejet efter maengde. */
    P.flammeproeve = function (gg, br) {
        var mig = this;
        if (!gg.last) return false;
        if (!br.taendt) { this.besked("Brænderen er ikke tændt."); return false; }
        var t = br.type, fx = br.p.x - br.anker.x + t.flammePunkt.x, fy = br.p.y - br.anker.y + t.flammePunkt.y;
        var o = gg.last, sum = 0, fr = 0, fg = 0, fb = 0, navne = [];
        for (var s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s)) continue;
            var st = Stof.STOFFER[s];
            if (!st || !st.flamme || o.n[s] <= 0) continue;
            sum += o.n[s]; fr += st.flamme.r * o.n[s]; fg += st.flamme.g * o.n[s]; fb += st.flamme.b * o.n[s];
            navne.push(s);
        }
        var farve = sum > 0 ? { r: fr / sum, g: fg / sum, b: fb / sum } : null;
        this.koer.start([
            { flyt: gg, til: { x: fx + 2, y: fy - 22 - gg.type.laengde + 14, v: 0.35 }, tid: 0.5, loeft: 20 },
            { kald: function () {
                br.flammeFarve = farve;
                br.flammeStyrke = farve ? 1 : 0;
                br.flammeUr = 3;
                mig.besked(farve ? "Flammen skifter farve." : "Flammen skifter ikke farve.");
                mig.haendelse("flammeproeve", { stoffer: navne, farve: farve });
            } },
            { tid: 2.0 },
            { kald: function () { gg.last = null; gg.lastFarve = null; mig.aendret("flamme"); } },
            NK.Koer.hjemTil(gg, 0.6, 30)
        ], "flamme");
        return true;
    };

    /* Haeldning fra gg til c. mL = 0: alt */
    P.haeld = function (gg, c, mL) {
        var mig = this;
        var V = B.volumen(gg);
        if (V < 0.05 && B.fastIalt(gg) > 0.5) return this.haeldFast(gg, c);
        if (V < 0.05) { this.besked(gg.titel + " er tom."); return false; }
        mL = Math.min(V, mL || V);
        var tid = Math.min(1.6, 0.5 + mL * 0.03);
        var givet = 0, loebOver = false;
        var farve = B.farve(gg) || Stof.VAND;
        if (this.aaben(c)) this.vaelg(c.navn);
        this.koer.start([
            { flyt: gg, til: function () { return B.haeldPositur(gg, c); }, tid: 0.75, loeft: 40 },
            { kald: function () { if (NK.Lyd && NK.Lyd.haeld) NK.Lyd.haeld(tid); } },
            { tid: tid, hver: function (t) {
                var nu = mL * t;
                if (!loebOver && nu > givet) {
                    B.haeldI(c, B.udtag(gg, nu - givet), true);
                    if (mig.tjekOverloeb(c)) loebOver = true;
                }
                givet = nu;
                var tud = B.tudVerden(gg), o = B.aabning(c);
                mig.straale = { fra: tud, til: { x: o.x, y: c.niveau === null || c.niveau === undefined ? o.y + 60 : c.niveau }, farve: farve, bredde: gg.type.maks > 100 ? 3 : 2 };
            } },
            { kald: function () {
                mig.straale = null;
                mig.haendelse("haeldt", { fra: gg, til: c, mL: givet, loebOver: loebOver });
                mig.aendret("haeldt");
            } }
        ].concat(this.svaevVed(gg, c)), "haeld");
        return true;
    };

    /* Alt haeldes i affaldsdunken eller vasken */
    P.toemI = function (gg, c) {
        var mig = this;
        if (B.tom(gg)) return false;
        var farve = B.farve(gg) || Stof.VAND;
        var tid = Math.min(1.5, 0.4 + B.volumen(gg) * 0.02);
        var o = B.aabning(c);
        var over = c.kan.vask ? 40 : 24;
        var vaek = null;
        this.koer.start([
            { flyt: gg, til: function () { return B.haeldPositur(gg, c, over); }, tid: 0.75, loeft: 40 },
            { kald: function () { if (NK.Lyd && NK.Lyd.haeld) NK.Lyd.haeld(tid); vaek = B.udtagAlt(gg); } },
            { tid: tid, hver: function () {
                var tud = B.tudVerden(gg);
                mig.straale = { fra: tud, til: { x: o.x, y: o.y + 30 }, farve: farve, bredde: 2.5 };
            } },
            { kald: function () {
                mig.straale = null;
                mig.haendelse(c.kan.vask ? "vask" : "affald", { fra: gg, til: c, indhold: vaek });
                mig.aendret("affald");
            } },
            NK.Koer.hjemTil(gg, 0.8, 40)
        ], "affald");
        return true;
    };

    function flereDraaber(gg) {
        return "Klik på pilen ved " + gg.titel + " for en dråbe mere, eller træk den væk.";
    }

    /* Én draabe fra draabeflasken. Flasken bliver haengende, saa der kan
       dryppes igen med et klik; det siger beskeden efter den foerste. */
    P.draabe = function (gg, c) {
        var mig = this;
        if (B.volumen(gg) < 0.05) { this.besked(gg.titel + " er tom."); return false; }
        if (this.aaben(c)) this.vaelg(c.navn);
        function dryp() {
            var tip = NK.tilVerden(gg.p, gg.anker, gg.anker.x, gg.anker.y);
            var d = Stof.del(gg.indhold, DRAABE);
            var fo = Stof.farve(d, 3) || Stof.VAND;
            mig.draaber.push({ x: tip.x, y: tip.y + 2, vx: 0, vy: 30, rad: 3.2, liv: 1, farve: { r: fo.r, g: fo.g, b: fo.b, a: fo.a }, c: c, opl: d });
            if (NK.Lyd && NK.Lyd.plip) NK.Lyd.plip();
            gg.svaev = { maal: c, ur: Infinity };
        }
        if (gg.svaev && gg.svaev.maal === c && !this.koer.optaget()) { dryp(); return true; }
        this.koer.start([
            { flyt: gg, til: function () { return B.overAabning(gg, c, 0, -26, Math.PI); }, tid: 0.6, loeft: 30 },
            { tid: 0.15 },
            { kald: function () { dryp(); mig.besked(flereDraaber(gg)); } }
        ], "dryp");
        return true;
    };

    P.draabeLander = function (dr) {
        var c = dr.c;
        B.haeldI(c, dr.opl);
        this.tjekOverloeb(c);
        this.haendelse("dryppet", { til: c });
        this.aendret("dryp");
    };

    /* En sjat vand fra sproejteflasken */
    P.sproejt = function (gg, c) {
        var mig = this;
        if (B.volumen(gg) < 0.05) { this.besked(gg.titel + " er tom."); return false; }
        var mL = Math.min(SPROEJT, B.volumen(gg)), givet = 0, loebOver = false;
        if (this.aaben(c)) this.vaelg(c.navn);
        this.koer.start([
            { flyt: gg, til: function () { return B.overAabning(gg, c, -12, -34, 0.55); }, tid: 0.6, loeft: 30 },
            { kald: function () { if (NK.Lyd && NK.Lyd.haeld) NK.Lyd.haeld(0.8); } },
            { tid: 0.8, hver: function (t) {
                var nu = mL * t;
                if (!loebOver && nu > givet) {
                    B.haeldI(c, Stof.del(gg.indhold, nu - givet), true);
                    if (mig.tjekOverloeb(c)) loebOver = true;
                }
                givet = nu;
                var tud = B.tudVerden(gg), o = B.aabning(c);
                mig.straale = { fra: tud, til: { x: o.x, y: c.niveau === null || c.niveau === undefined ? o.y + 60 : c.niveau }, farve: { r: 200, g: 228, b: 245, a: 0.6 }, bredde: 2 };
            } },
            { kald: function () { mig.straale = null; mig.haendelse("haeldt", { fra: gg, til: c, mL: givet, loebOver: loebOver }); mig.aendret("sproejt"); } }
        ].concat(this.svaevVed(gg, c, { dx: -12, dy: -44, v: 0.55 })), "sproejt");
        return true;
    };

    /* Spatlen tager en spatelspids fra pulverglasset. En fuld spatel kan
       ikke tage mere: den skal gives til et glas foerst. */
    P.fyldSpatel = function (sp, jar) {
        if (sp.last) { this.besked("Spatlen er fuld. Træk den hen over et glas."); return false; }
        if (!Stof.faste(jar.indhold).length) { this.besked(jar.titel + " er tomt."); return false; }
        this.koer.start(this.fyldTrin(sp, jar).concat(this.svaevVed(sp, jar, { dx: 10, dy: -18, v: 0.35 })), "spatel");
        return true;
    };

    /* Trinene i at fylde spatlen: hen over pulverglasset, ned og op med en
       spatelspids. Spatlen husker glasset (sp.fraPulver), saa pilen kan
       hente mere derfra. */
    P.fyldTrin = function (sp, jar) {
        var mig = this;
        return [
            { flyt: sp, til: function () { return B.overAabning(sp, jar, 6, 6, 0.55); }, tid: 0.55, loeft: 30 },
            { tid: 0.25 },
            { kald: function () {
                var f = Stof.faste(jar.indhold)[0];
                if (!f) return;
                var umol = Math.min(SPATELSPIDS, f.umol);
                Stof.tilsaet(jar.indhold, f.navn, -umol);
                sp.last = { navn: f.navn, umol: umol, farve: f.stof.farve || { r: 230, g: 230, b: 230 } };
                sp.fraPulver = jar;
                mig.haendelse("spatel", { fra: jar, stof: f.navn });
                mig.aendret("spatel");
            } }
        ];
    };

    /* Spatelspidsen haeldes i glasset */
    P.toemSpatel = function (sp, c) {
        if (!sp.last) return false;
        if (this.aaben(c)) this.vaelg(c.navn);
        this.koer.start(this.toemTrin(sp, c).concat(this.svaevVed(sp, c, { dx: 0, dy: -24, v: -0.5 })), "spatel");
        return true;
    };

    /* Trinene i at give spatelspidsen: hen over glasset og drys den ned.
       Lasten laeses, naar trinene koeres, saa de kan komme lige efter
       fyldTrin. */
    P.toemTrin = function (sp, c) {
        var mig = this, last = null;
        return [
            { flyt: sp, til: function () { return B.overAabning(sp, c, 0, -12, -0.5); }, tid: 0.55, loeft: 30 },
            { tid: 0.5, hver: function (t) {
                last = last || sp.last;
                if (!last) return;
                if (Math.random() < 0.6) {
                    var m = NK.tilVerden(sp.p, sp.anker, sp.type.ske.x, sp.type.ske.y);
                    mig.draaber.push({ x: m.x + r(-3, 3), y: m.y, vx: r(-8, 8), vy: r(20, 60), rad: 1.5, liv: 1, farve: last.farve, korn: true, c: c });
                }
                if (t > 0.9) sp.last = null;
            } },
            { kald: function () {
                if (!last) return;
                B.tilsaetFast(c, last.navn, last.umol);
                sp.last = null;
                mig.haendelse("fast", { til: c, stof: last.navn, umol: last.umol });
                mig.aendret("fast");
            } }
        ];
    };

    /* Pilen ved en tom spatel over et glas: spatlen henter selv en
       spatelspids i det pulverglas, den sidst tog fra, og kommer tilbage
       og giver den til glasset. */
    P.pulverAtHente = function (sp) {
        var jar = sp.fraPulver;
        if (!jar || this.liste.indexOf(jar) < 0 || !this.synlig(jar) || this.baerer === jar) return null;
        return Stof.faste(jar.indhold).length ? jar : null;
    };

    P.hentOgGiv = function (sp, c) {
        var jar = this.pulverAtHente(sp);
        if (!jar || sp.last) return false;
        if (!Stof.faste(jar.indhold).length) { this.besked(jar.titel.charAt(0).toUpperCase() + jar.titel.slice(1) + " er tomt."); return false; }
        if (this.aaben(c)) this.vaelg(c.navn);
        this.koer.start(this.fyldTrin(sp, jar).concat(this.toemTrin(sp, c), this.svaevVed(sp, c, { dx: 0, dy: -24, v: -0.5 })), "spatel");
        return true;
    };

    /* Glasstaven roerer rundt */
    P.roer = function (gg, c) {
        var mig = this;
        if (B.volumen(c) < 0.1) { this.besked(c.titel + " er tomt."); return false; }
        if (this.aaben(c)) this.vaelg(c.navn);
        var o = B.aabning(c);
        var dyb = Math.min(gg.type.laengde - 30, c.type.h * 0.7);
        this.koer.start([
            { flyt: gg, til: function () { return { x: o.x, y: o.y - (gg.type.laengde - dyb), v: 0.12 }; }, tid: 0.5, loeft: 30 },
            { kald: function () { mig.roerer = c; } },
            { tid: 1.4, hver: function (t) {
                var oo = B.aabning(c);
                gg.p.x = oo.x + Math.sin(t * 22) * 5;
                gg.p.v = 0.12 + Math.cos(t * 22) * 0.1;
            } },
            { kald: function () { mig.roerer = null; mig.haendelse("roert", { til: c }); mig.aendret("roert"); } },
            NK.Koer.hjemTil(gg, 0.6, 30)
        ], "roer");
        return true;
    };

    /* Termometeret saettes i glasset og bliver der */
    P.maal = function (gg, c) {
        var mig = this;
        if (this.aaben(c)) this.vaelg(c.navn);
        var o = B.aabning(c);
        var dyb = Math.min(gg.type.laengde - 40, c.type.h * 0.6);
        var til = { x: o.x + 5, y: o.y - (gg.type.laengde - dyb), v: 0.1 };
        this.koer.start([
            { flyt: gg, til: til, tid: 0.5, loeft: 30 },
            { kald: function () {
                mig.frigoer(gg);
                gg.i = c;
                gg.rel = { dx: gg.p.x - c.p.x, dy: gg.p.y - c.p.y, v: gg.p.v };
                gg.hjem = kopi(gg.p);
                mig.tilFront(gg);
                mig.haendelse("maalt", { til: c });
                mig.aendret("maalt");
            } }
        ], "maal");
        return true;
    };

    /* Koekkenrullen toerrer en pyt op */
    P.toerOp = function (gg, k) {
        var mig = this, py = this.pytter[k];
        if (!py) { this.saetNed(gg, gg.p); return false; }
        var S = NK.Scene;
        this.koer.start([
            { flyt: gg, til: { x: py.x, y: (py.y || S.BORD) - 12, v: 0 }, tid: 0.4, loeft: 10 },
            { tid: 1.0, hver: function (t) {
                gg.p.x = py.x + Math.sin(t * 18) * py.rx * 0.5;
                py.vaad = Math.max(0, 1 - t * 1.1);
            } },
            { kald: function () {
                if (NK.Lyd && NK.Lyd.papir) NK.Lyd.papir();
                mig.pytter.splice(mig.pytter.indexOf(py), 1);
                mig.haendelse("toerret", gg);
            } },
            NK.Koer.hjemTil(gg, 0.6, 20)
        ], "toer");
        return true;
    };

    /* Laereren eller siden toerrer alle pytter op */
    P.toerAlt = function () {
        this.pytter = [];
    };

    /* ----- Tidens gang -------------------------------------------------------- */
    /* Staar genstanden inde i stinkskabet? */
    P.iStinkskab = function (gg) {
        var sk = this.stinkskab;
        if (!sk || !gg) return false;
        var x = gg.p.x - gg.anker.x + (gg.type.sprite ? gg.type.b / 2 : 0);
        return x > sk.x0 && x < sk.x1;
    };

    /* Badets maaltemperatur, hvis det er termostateret (holdT i
       opstillingen). Staar badet paa en varmeplade, gaelder termostaten
       kun, mens pladen er taendt; ellers koeler badet af til stuetemperatur.
       Uden holdT foelger badet den almindelige fysik. */
    P.badT = function (bad) {
        if (!bad.kan.bad || !bad.spec || bad.spec.holdT === undefined) return null;
        if (bad.paa && bad.paa.kan.varmer && !bad.paa.taendt) return this.stue;
        return bad.spec.holdT;
    };

    P.omgivelser = function (gg) {
        var s = { T: this.stue, tau: B.TEMP.tauLuft, ryst: 0, roer: false };
        /* Badet selv: termostaten bestemmer, ikke pladens 250 grader */
        var bt = gg.kan.bad ? this.badT(gg) : null;
        if (bt !== null) { s.T = bt; s.tau = 12; return s; }
        if (gg.paa && gg.paa.kan.varmer && gg.paa.taendt) { s.T = gg.paa.T; s.tau = gg.paa.kan.flamme ? 6 : B.TEMP.tauVarme; }
        else if (gg.paa && gg.paa.kan.varmer) { s.T = Math.max(this.stue, gg.paa.T); s.tau = B.TEMP.tauVarme; }
        /* Et glas nede i et bad tager badets temperatur. Vand mod glas
           leder meget bedre end luft, saa tau er kort. */
        else if (gg.paa && gg.paa.kan.bad && gg.paa.indhold && B.volumen(gg.paa) > 1) { s.T = B.samlet(gg.paa).T; s.tau = 8; }
        if (this.baerer === gg) s.ryst = this.ryst;
        if (this.roerer === gg) { s.roer = true; s.ryst = Math.max(s.ryst, 0.6); }
        return s;
    };

    P.opdater = function (dt) {
        var mig = this, i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;

        this.koer.opdater(dt);
        this.opdaterRyst(dt);
        this.opdaterHaeldning(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);

        if (this.mark) { this.mark.ur -= dt; if (this.mark.ur <= 0) this.mark = null; }
        this.ryk = this.ryk > 0.2 ? this.ryk * (1 - dt * 7) : 0;

        this.liste.forEach(function (gg) {
            if (gg.kan.varmer) {
                var maalT = gg.taendt ? gg.type.temperatur : mig.stue;
                gg.T = NK.mod(gg.T, maalT, gg.taendt ? 0.12 : 0.06, dt);
            }
            if (gg.kan.flamme && gg.flammeUr > 0) {
                gg.flammeUr -= dt;
                if (gg.flammeUr <= 0) gg.flammeStyrke = 0;
                else if (gg.flammeUr < 0.8) gg.flammeStyrke = gg.flammeUr / 0.8;
            }
        });

        this.beholdere().forEach(function (c) {
            var s = mig.omgivelser(c);
            /* Varmen fra haeldning og reaktioner er lagt til siden sidste billede */
            var Tsidst = c.Tsidst === undefined ? c.indhold.T : c.Tsidst;
            B.skridt(c, dt, s, mig.reaktioner);
            var o = B.aabning(c);
            var flade = c.niveau === null || c.niveau === undefined ? o.y + 20 : c.niveau;
            /* Bliver det pludselig meget varmt, koger og sproejter det */
            c.varmeFart = NK.mod(c.varmeFart || 0, (c.indhold.T - Tsidst) / Math.max(dt, 1e-3), 3, dt);
            if (c.indhold.T > B.TEMP.kog) c.indhold.T = B.TEMP.kog;
            c.Tsidst = c.indhold.T;
            if (c.varmeFart > 8 && c.indhold.T > 70 && mig.tid - (c.voldsomTid || -99) > 6 && B.volumen(c) > 0.1) {
                c.voldsomTid = mig.tid;
                mig.voldsom(c);
            }
            if (c.koger) {
                if (Math.random() < dt * 6) mig.dampe.push({ x: o.x + r(-8, 8), y: flade - 2, vx: r(-6, 6), vy: r(-26, -14), rad: r(5, 9), liv: 0.9 });
            }
            /* Gas bobler op gennem vaesken; farvet gas bliver til dampe */
            var gas = Stof.tapGas(c.indhold);
            c.bobler = c.bobler || [];
            for (var navn in gas) {
                if (!Object.prototype.hasOwnProperty.call(gas, navn) || gas[navn] < 0.01) continue;
                var st = Stof.stof(navn);
                var antal = Math.min(10, Math.ceil(gas[navn] / 15));
                if (st.farve) {
                    for (var k = 0; k < antal; k++) mig.dampe.push({ x: o.x + r(-10, 10), y: o.y - 2, vx: r(-10, 10), vy: r(-30, -16), rad: r(6, 11), liv: 1.1, farve: st.farve });
                } else {
                    var v = B.er(c) && c.type.indre ? T.indreVerden(c) : null;
                    if (!v) continue;
                    var x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
                    v.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
                    for (var m = 0; m < antal; m++) c.bobler.push({ x: NK.lerp(x0 + 4, x1 - 4, Math.random()), y: y1 - 4 - r(0, 10), r: r(1.4, 3), vy: -r(40, 80) });
                }
                mig.gasIalt = (mig.gasIalt || 0) + gas[navn];
                c.sidsteGas = navn;
                mig.haendelse("gas", { fra: c, stof: navn, umol: gas[navn], iStinkskab: mig.iStinkskab(c) });
            }
            for (var i = c.bobler.length - 1; i >= 0; i--) {
                var b = c.bobler[i];
                b.y += b.vy * dt;
                b.x += Math.sin(mig.tid * 9 + i) * 8 * dt;
                if (b.y < flade + 1) c.bobler.splice(i, 1);
            }
            if (c.bobler.length > 40) c.bobler.splice(0, c.bobler.length - 40);
        });

        /* Termometre foelger det glas, de sidder i */
        this.liste.forEach(function (gg) {
            if (gg.kan.maaler) {
                var c = gg.i;
                if (c) {
                    gg.p.x = c.p.x + gg.rel.dx; gg.p.y = c.p.y + gg.rel.dy; gg.p.v = gg.rel.v + c.p.v;
                    gg.hjem = kopi(gg.p);
                    gg.T = NK.mod(gg.T, B.volumen(c) > 0.1 ? c.indhold.T : mig.stue, 1.6, dt);
                    if (gg.kan.ph) gg.pH = B.volumen(c) > 0.1 ? Stof.pH(B.samlet(c)) : null;
                } else if (mig.baerer !== gg) {
                    gg.T = NK.mod(gg.T, mig.stue, 0.25, dt);
                    if (gg.kan.ph) gg.pH = null;
                }
            }
            if (gg.svaev) {
                gg.svaev.ur -= dt;
                var m = gg.svaev.maal;
                if (mig.baerer === m || mig.baerer === gg || !mig.synlig(m) || mig.liste.indexOf(m) < 0) gg.svaev.ur = 0;
                if (gg.svaev.ur <= 0 && !mig.koer.igang()) {
                    gg.svaev = null;
                    mig.koer.start([NK.Koer.hjemTil(gg, 0.6, 40)], "hjem");
                }
            }
        });

        this.opdaterEffekter(dt);

        /* Zoomboblen viser den valgte beholder */
        var v = this.valgtBeholder();
        if (v) {
            if (!v.mikro) v.mikro = new NK.Mikro(this.bobleR, this.bobleIndhold);
            this.mikro = v.mikro;
        }
        this.opdaterBoble(dt, v);
        this.haandAlfa = 0;
    };

    /* Det faste stof, boblen skal vise gitteret for: kun naar der ikke er
       vaeske i beholderen, saa et pulverglas viser saltets gitter, mens et
       glas med vand i viser ionerne i oploesning */
    P.fastGitter = function (v) {
        if (!v || B.volumen(v) > 0.05 || B.fastIalt(v) < 0.01) return null;
        var o = B.samlet(v), bedst = null, mest = 0;
        for (var n in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, n)) continue;
            var s = Stof.STOFFER[n];
            if (!s || s.fase !== "s" || o.n[n] <= mest) continue;
            mest = o.n[n];
            bedst = n;
        }
        return bedst ? Stof.gitter(bedst) : null;
    };

    P.opdaterBoble = function (dt, v) {
        /* Er der kun fast stof i beholderen, viser boblen stoffets gitter */
        var gitter = this.fastGitter(v);
        if ((gitter && gitter.titel) !== (this.mikro.fast && this.mikro.fast.titel)) this.mikro.visFast(gitter);
        var vis = !!v && (B.volumen(v) > 0.05 || B.fastIalt(v) > 0.5 || this.mikro.partikler.length > 0) && this.koer.navn() !== "affald";
        if (vis) {
            this.bobleBeholder = v;
            var ov = B.samlet(v);
            this.mikro.opdater(dt, Stof.partikelTal(ov, this.valg.partikler || 6, this.skjulteI(ov), this.valg.partikelRef || 100), { ryst: this.omgivelser(v).ryst });
        } else this.mikro.opdater(dt, {}, { ryst: 0 });
        this.bobleAlfa = NK.mod(this.bobleAlfa, vis ? 1 : 0, 5, dt);
        /* Forsvinder boblen, lukker den store visning med den */
        if (!vis && this.storBoble) this.lukStorBoble();
        this.storAlfa = NK.mod(this.storAlfa, this.storBoble ? 1 : 0, 7, dt);
        if (!this.storBoble && this.storAlfa < 0.003) this.storAlfa = 0;
    };

    /* Bordet, mens man er i et andet rum: pladerne, kemien og termometrene
       gaar videre, men uden dampe, bobler, uheld og laerer. */
    P.opdaterStille = function (dt) {
        var mig = this;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;
        this.liste.forEach(function (gg) {
            if (gg.kan.varmer) gg.T = NK.mod(gg.T, gg.taendt ? gg.type.temperatur : mig.stue, gg.taendt ? 0.12 : 0.06, dt);
            if (gg.kan.flamme && gg.flammeUr > 0) { gg.flammeUr -= dt; if (gg.flammeUr <= 0) gg.flammeStyrke = 0; }
        });
        this.beholdere().forEach(function (c) {
            B.skridt(c, dt, mig.omgivelser(c), mig.reaktioner);
            if (c.indhold.T > B.TEMP.kog) c.indhold.T = B.TEMP.kog;
            c.Tsidst = c.indhold.T;
            var gas = Stof.tapGas(c.indhold);
            for (var navn in gas) if (Object.prototype.hasOwnProperty.call(gas, navn)) mig.gasIalt = (mig.gasIalt || 0) + gas[navn];
            c.bobler = [];
        });
        this.liste.forEach(function (gg) {
            if (!gg.kan.maaler) return;
            var c = gg.i;
            gg.T = NK.mod(gg.T, c && B.volumen(c) > 0.1 ? c.indhold.T : mig.stue, c ? 1.6 : 0.25, dt);
            if (gg.kan.ph) gg.pH = c && B.volumen(c) > 0.1 ? Stof.pH(B.samlet(c)) : null;
        });
        this.dampe = [];
        this.pytter.forEach(function (py) { py.rx = NK.mod(py.rx, py.rxMaal, 3, dt); });
    };

    P.opdaterEffekter = function (dt) {
        var S = NK.Scene, i;
        for (i = this.draaber.length - 1; i >= 0; i--) {
            var dr = this.draaber[i];
            dr.vy += 900 * dt;
            dr.y += dr.vy * dt;
            dr.x += (dr.vx || 0) * dt;
            if (dr.fysik) {
                if (dr.y > (dr.gulv || S.BORD) - 1) this.draaber.splice(i, 1);
                continue;
            }
            var c = dr.c;
            if (!c) { if (dr.y > S.BORD - 1) this.draaber.splice(i, 1); continue; }
            var flade = c.niveau !== null && c.niveau !== undefined ? c.niveau : B.aabning(c).y + Math.min(60, c.type.h * 0.5);
            if (dr.y >= flade) {
                this.draaber.splice(i, 1);
                if (dr.opl) this.draabeLander(dr);
            }
        }
        this.pytter.forEach(function (py) { py.rx = NK.mod(py.rx, py.rxMaal, 3, dt); });
        this.opdaterSkaar(dt);
        var sk = this.stinkskab;
        for (i = this.dampe.length - 1; i >= 0; i--) {
            var p = this.dampe[i];
            if (sk && sk.taendt !== false && p.x > sk.x0 && p.x < sk.x1) {
                /* Udsugningen trækker dampene op og ind mod midten */
                p.vy -= 160 * dt;
                p.vx += ((sk.x0 + sk.x1) / 2 - p.x) * 0.8 * dt;
                p.liv -= dt * 0.9;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rad += 6 * dt;
            p.liv -= dt * 0.5;
            if (p.liv <= 0) this.dampe.splice(i, 1);
        }
        if (this.dampe.length > 60) this.dampe.splice(0, this.dampe.length - 60);
    };

    /* ----- Tegning ------------------------------------------------------------ */
    P.tilpas = function () {
        return this.laerred.tilpas();
    };

    P.staarPaaBord = function (gg) {
        var S = NK.Scene;
        if (!gg.type.sprite || gg.sted || gg.i) return false;
        var bund = gg.p.y - gg.anker.y + gg.type.h;
        if (Math.abs(gg.p.v) >= 0.05) return false;
        if (bund > S.BORD - 3 && bund < S.FORKANT + 3 && !gg.paa) return true;
        var underlag = [S.BORD];
        if (gg.paa) underlag.push(gg.paa.p.y - gg.paa.anker.y + gg.paa.type.plade.y);
        (S.HYLDER || []).forEach(function (H) { underlag.push(H.y); });
        return underlag.some(function (u) { return Math.abs(bund - u) < 3; });
    };

    P.paaLuge = function (luge) {
        return this.liste.filter(function (x) { return x.paa === luge; });
    };

    P.tegnGenstand = function (ctx, gg, tid) {
        var t = gg.type, k = gg.kan;
        if (gg.navn === "kaffekop") {
            if (!gg.skjult && !gg.iHaand) NK.Sprites.tegnPositur(ctx, "kaffekop", gg.p, gg.anker);
            return;
        }
        if (this.staarPaaBord(gg) && !k.fast) T.skygge(ctx, gg.p.x - gg.anker.x + t.b / 2, t.b * 0.45, 0.3, gg.p.y - gg.anker.y + t.h - 3);
        if (k.flamme) T.tegnBraender(ctx, gg, tid);
        else if (k.varmer) T.tegnVarmeplade(ctx, gg, tid);
        else if (k.vaegt) T.tegnVaegt(ctx, gg, this.vaegtTekst(gg), !this.baerer || this.baerer.paa !== gg);
        else if (k.luge) T.tegnLuge(ctx, gg, gg.skilt || (gg.spec && gg.spec.skilt) || "", gg.lys || 0, tid);
        else if (k.dypper) T.tegnPodetraad(ctx, gg);
        else if (k.ph) T.tegnPHmeter(ctx, gg, !!gg.i || this.baerer === gg);
        else if (k.holder) {
            gg.niveau = T.tegnBeholder(ctx, gg, tid, { boelge: this.baerer === gg ? this.ryst * 1.5 : (this.roerer === gg ? 0.8 : 0) });
            if (gg.bobler && gg.bobler.length && !t.skjulIndhold) T.tegnBobler(ctx, gg, gg.bobler);
        }
        else if (k.spatel) T.tegnSpatel(ctx, gg);
        else if (k.roerer) T.tegnStav(ctx, gg);
        else if (k.maaler) T.tegnTermometer(ctx, gg, !!gg.i || this.baerer === gg);
        else if (t.sprite) {
            if (k.fast) T.skygge(ctx, gg.p.x - gg.anker.x + t.b / 2, t.b * 0.45, 0.3, gg.p.y - gg.anker.y + t.h - 3);
            NK.Sprites.tegnPositur(ctx, t.sprite, gg.p, gg.anker, undefined, gg.skala);
            T.tegnEtiket(ctx, gg);
        }
        if (this.markeret(gg.navn)) T.tegnMarkering(ctx, this.rekt(gg, 0), tid, undefined, gg);
    };

    P.tegn = function (udenRyd) {
        var L = this.laerred, ctx = L.ctx, S = NK.Scene, mig = this;
        var tid = this.tid;
        L.friskTransform();
        if (!udenRyd) ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);
        if (this.forskyd) {
            /* Rummet glider: kun dets egen bredde tegnes */
            ctx.beginPath();
            ctx.rect(0, -2000, S.BREDDE, S.HOEJDE + 4000);
            ctx.clip();
            ctx.translate(this.forskyd, 0);
        }
        if (this.ryk > 0) ctx.translate((Math.random() - 0.5) * this.ryk, (Math.random() - 0.5) * this.ryk);

        var lv = this.laererVisning ? this.laererVisning() : {};
        T.tegnBaggrund(ctx, { plakat: this.plakat ? { x: this.plakat.x, y: this.plakat.y, regel: lv.plakatRegel || 0 } : null });
        if (this.stinkskab) T.tegnStinkskabBag(ctx, this.stinkskab, tid);

        /* Staar laereren bag bordet, tegnes han her: efter vaeggen og
           hylderne, foer alt paa bordet, og klippet ved bordets bagkant */
        if (this.tegnLaererBag) this.tegnLaererBag(ctx, tid);

        this.pytter.forEach(function (py) { T.tegnPyt(ctx, py); });
        T.tegnSkaar(ctx, this.skaar);

        var sidst = [];
        this.liste.forEach(function (gg) {
            if (!mig.synlig(gg)) return;
            if (gg === mig.baerer || (gg.i && gg.i === mig.baerer)) { sidst.push(gg); return; }
            mig.tegnGenstand(ctx, gg, tid);
        });

        if (this.slipMaal) {
            if (this.slipMaal.indexOf("pyt:") === 0) {
                var py = this.pytter[+this.slipMaal.slice(4)];
                if (py) T.tegnSlipMaal(ctx, { x: py.x - py.rx, y: (py.y || S.BORD) - 8, b: py.rx * 2, h: 14 }, tid);
            } else {
                var m = this.g[this.slipMaal];
                if (m) T.tegnSlipMaal(ctx, this.rekt(m, 0), tid, m);
            }
        }

        if (this.straale) T.tegnStraale(ctx, this.straale.fra, this.straale.til, this.straale.farve, this.straale.bredde, tid);
        sidst.forEach(function (gg) { mig.tegnGenstand(ctx, gg, tid); });
        T.tegnDraaber(ctx, this.draaber);
        T.tegnDampe(ctx, this.dampe);
        if (this.stinkskab) T.tegnStinkskabFor(ctx, this.stinkskab);
        var ring = this.svaevRing();
        if (ring) T.tegnSvaevRing(ctx, ring, tid, this.hover === "svaevring");

        if (this.tegnLaerer) this.tegnLaerer(ctx, tid, { udenBoble: true });

        /* Zoomboblen paa scenen, hvis bordet er sat op med boble: { x, y };
           ellers tegner siden den selv med tegnBoble, fx i panelet */
        var vb = this.bobleBeholder;
        if (this.boble && vb && this.bobleAlfa > 0.01) this.tegnBobleIScenen(ctx, tid);
        /* Taleboblen er oeverste lag: den skal kunne laeses, ogsaa naar
           den ellers ville havne under zoomboblen (F5) */
        if (this.tegnLaererBoble) this.tegnLaererBoble(ctx, tid);
        ctx.restore();
    };

    /* Zoomboblen paa scenen: en del af laboratoriet, der skalerer med det.
       En stiplet streg viser, hvilket glas den kigger ind i, og glassets
       navn staar under den. En lille lup paa kanten viser, at den kan
       klikkes stor. Den store visning vokser ud af hjoernet (storAlfa) og
       tegnes over alt andet paa en moerk flade; indholdet skaleres, saa
       kugler og skrift bliver lige saa skarpe, bare stoerre. */
    P.tegnBobleIScenen = function (ctx, tid) {
        var vb = this.bobleBeholder, bo = this.boble, R = this.bobleR;
        var fo = B.farve(vb) || Stof.VAND;
        var mik = vb.mikro || this.mikro;
        var farve = { r: fo.r * 0.35, g: fo.g * 0.35, b: fo.b * 0.35 };
        var titel = vb.titel.charAt(0).toUpperCase() + vb.titel.slice(1);
        var e = NK.blod(this.storAlfa);
        if (e < 0.005) {
            mik.tegn(ctx, bo.x, bo.y, this.bobleAlfa, tid, this.synlig(vb) ? B.aabning(vb) : null, farve);
            ctx.save();
            ctx.globalAlpha = this.bobleAlfa;
            NK.tekst(ctx, titel, bo.x, bo.y + R + 14,
                { font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2c53d", kant: true, kantBredde: 3, kantFarve: "rgba(0,0,0,0.6)" });
            tegnLup(ctx, bo.x + R * 0.66, bo.y + R * 0.66, this.hover === "boble");
            ctx.restore();
            return;
        }
        var st = this.storBobleMaal();
        var x = bo.x + (st.x - bo.x) * e, y = bo.y + (st.y - bo.y) * e, r = R + (st.r - R) * e;
        ctx.save();
        ctx.globalAlpha = 0.62 * e;
        ctx.fillStyle = "#07090d";
        ctx.fillRect(-5000, -5000, 10000, 10000);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = this.bobleAlfa * e;
        ctx.fillStyle = "#101318";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(r / R, r / R);
        mik.tegn(ctx, 0, 0, this.bobleAlfa, tid, null, farve);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = this.bobleAlfa * e;
        NK.tekst(ctx, titel, x, y + r + 22,
            { font: "700 18px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2c53d", kant: true, kantBredde: 3, kantFarve: "rgba(0,0,0,0.6)" });
        tegnLuk(ctx, x + r * 0.74, y - r * 0.74);
        ctx.restore();
    };

    /* Luppen paa den lille boble og krydset paa den store */
    function tegnLup(ctx, x, y, hover) {
        ctx.fillStyle = hover ? "rgba(242, 197, 61, 0.95)" : "rgba(20, 24, 31, 0.85)";
        ctx.strokeStyle = hover ? "#14181e" : "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x - 1.5, y - 1.5, 5, 0, Math.PI * 2);
        ctx.moveTo(x + 2, y + 2);
        ctx.lineTo(x + 6.5, y + 6.5);
        ctx.stroke();
    }

    function tegnLuk(ctx, x, y) {
        ctx.fillStyle = "rgba(20, 24, 31, 0.9)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);
        ctx.stroke();
    }

    /* ----- Den store zoomboble ---------------------------------------------
       Som luppen i den gamle sc6.8: et klik paa boblen i hjoernet viser den
       stor midt paa scenen, over alt andet, og imens kan intet andet
       roeres. Et klik hvor som helst lukker den, og siden lukker den med
       Esc. Den viser stadig det valgte glas og lever videre. */
    /* Midt i den synlige del af laerredet (i scenens koordinater), med
       plads under sig til navnet og beskeden */
    P.storBobleMaal = function () {
        var S = NK.Scene, x0 = 0, y0 = 0, b = S.BREDDE, h = S.HOEJDE;
        if (this.laerred && this.laerred.b) {
            var sk = S.skala(this.laerred.b, this.laerred.h);
            x0 = -sk.dx / sk.s; y0 = -sk.dy / sk.s;
            b = this.laerred.b / sk.s; h = this.laerred.h / sk.s;
        }
        return { x: x0 + b / 2, y: y0 + h * 0.45, r: Math.max(this.bobleR, Math.min(b * 0.36, h * 0.38)) };
    };

    P.bobleVises = function () {
        return !!(this.boble && this.bobleBeholder && this.bobleAlfa > 0.5);
    };

    P.overBoble = function (pt) {
        if (this.storBoble) return true;
        if (!this.bobleVises() || !pt) return false;
        return Math.hypot(pt.x - this.boble.x, pt.y - this.boble.y) < this.bobleR + 4;
    };

    P.aabnStorBoble = function () {
        if (this.storBoble || !this.bobleVises() || this.baerer) return false;
        this.storBoble = true;
        this.besked("Klik hvor som helst, eller tryk Esc, for at lukke den store visning.");
        this.aendret("boble");
        return true;
    };

    P.lukStorBoble = function () {
        if (!this.storBoble) return false;
        this.storBoble = false;
        this.aendret("boble");
        return true;
    };

    /* Den plads, zoomboblen og dens navn optager paa tegnebordet:
       { x, y, b, h }, eller null uden boble paa scenen. Opstillingen skal
       holde den fri. */
    P.bobleRekt = function () {
        if (!this.boble) return null;
        var R = this.bobleR;
        return { x: this.boble.x - R, y: this.boble.y - R, b: 2 * R, h: 2 * R + 26 };
    };

    /* Zoomboblen tegnet paa et andet laerred med centrum i (cx, cy) */
    P.tegnBoble = function (ctx, cx, cy) {
        var vb = this.bobleBeholder;
        if (!vb || this.bobleAlfa < 0.01) return false;
        var fo = B.farve(vb) || Stof.VAND;
        (vb.mikro || this.mikro).tegn(ctx, cx, cy, this.bobleAlfa, this.tid, null, { r: fo.r * 0.35, g: fo.g * 0.35, b: fo.b * 0.35 });
        return true;
    };
}());
