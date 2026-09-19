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
       glasset, eller det, glasset selv siger (modtager i opstillingen).
       En fuld spatel over pulverglasset har ingen pil (den kan
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
     underlag               [{ x0, x1, y0, y1, tekst, vis }]: hvidt papir
                            paa bordpladen med en paaskrift forrest, fx
                            under et par baegerglas (F32). Tegnes foer alt
                            paa bordet og kan hverken rammes eller flyttes.
                            vis() afgoer, om det ses (fx kun i del 2).
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
                            visTilskuere saettes (fluebenet i panelet). Et
                            klik paa en af dem i panelet loefter den op for
                            hele forsoeget (loeft, loeftede)
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
    var SPATELSPIDS = 1500;   /* µmol fast stof paa en spatelspids, naar pulverglasset ikke siger andet */
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
        /* F43: en stor pil paa vaeggen til naeste del eller rum. Den staar
           der, naar forsoeget beder om det (visPil), blinker og foerer
           videre med et klik (vedPil). valg.pil: { x, y, b, h, tekst } */
        this.pil = valg.pil || null;
        this.pilAktiv = false;
        this.vedPil = null;
        this.underlag = valg.underlag || [];
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
        this.centrale = null;
        this.visTilskuere = !!valg.visTilskuere;
        this.loeftede = [];
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
        this.spatelNr = 1;
        this.holdt = null;
        this.baerer = null;
        this.storBoble = false;
        this.storAlfa = 0;
        this.hover = null;
        this.slipMaal = null;
        this.klar = null;         /* det, et klik har gjort klar til genvejen (M16) */
        this.genvejMaal = null;   /* det maal, musen er over, mens noget er klar */
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
        this.rystes = null;       /* glasset, knappen eller tasten R ryster (rystValgt) */
        this.rystUr = 0;
        this.rystSlut = null;
        this.ryk = 0;
        this.haandAlfa = 0;
        this.bobleAlfa = 0;
        this.bobleBeholder = null;
        this.antalUheld = 0;
        this.haendt = {};
        /* F41: hvem der ryddede op efter hvert uheld (samme noegle som
           haendt): "laerer", naar laereren greb ind, "elev", naar eleven
           selv toerrede op med koekkenrullen */
        this.opryddet = {};
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
              stativ: navn, hul: i, paa: navn (varmeplade), p, taendt, kan, pulverMaks,
              spatelspids: µmol pr. spatelspids fra dette pulverglas (ellers SPATELSPIDS) } */
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
        /* rumfangFoelger: en rigtig mindre udgave, hvor rumfang og lysvej
           foelger tegningen (NK.Udstyr.mindre); ellers er skala et rent
           tegnemaal */
        if (k !== 1) t = spec.rumfangFoelger ? U.mindre(t, k) : U.skaleret(t, k);
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

    /* Tilskuerionerne i forsoeget: se valg.tilskuere i hovedkommentaren.
       Tre former:
         true              motoren finder dem selv (Stof.tilskuerioner)
         [ "K+", "NO3-" ]  forsoeget siger dem
         { centrale: [] }  forsoeget siger, hvad der er HOVEDPERSONER, og
                           alt andet ionisk er tilskuer
         { ogsaa: [] }     som true, plus disse

       Den tredje er den, der holder i laengden. Motoren kan regne ud,
       hvilke ioner der ikke tager del i nogen reaktion, men ikke hvilke
       der ikke betyder noget I DETTE FORSOEG: H+ er tilskuer i en
       ligevaegt mellem to ioner og hovedperson i en titrering, hvor den
       er i stort overskud og alligevel er det hele. Det ved forsoeget,
       og motoren kan ikke gaette det. */
    P.findTilskuere = function () {
        var v = this.valg.tilskuere;
        this.centrale = null;
        if (!v) { this.tilskuere = []; return; }
        if (Array.isArray(v)) { this.tilskuere = v.slice(); return; }
        var arter = {};
        this.liste.forEach(function (gg) {
            if (!B.er(gg)) return;
            var o = B.samlet(gg);
            Object.keys(o.n).forEach(function (n) { if (o.n[n] > 0) arter[n] = true; });
        });
        var navne = Object.keys(arter);
        if (v.centrale) {
            /* centrale gaelder ogsaa det, der endnu ikke findes: H+ kommer
               foerst, naar redoxen loeber, og skal vaere tilskuer med det
               samme. Derfor spoerges der levende i tilskuereI, og listen
               her er kun dem, der staar paa bordet fra start. */
            this.centrale = v.centrale.slice();
            var c = this.centrale;
            this.tilskuere = navne.filter(function (n) {
                var s = Stof.STOFFER[n];
                return s && s.q && s.fase === "aq" && c.indexOf(n) < 0;
            });
            return;
        }
        this.tilskuere = Stof.tilskuerioner(navne);
        if (v.ogsaa) {
            var t = this.tilskuere;
            v.ogsaa.forEach(function (n) { if (t.indexOf(n) < 0) t.push(n); });
        }
    };

    /* Tilskuerionerne i oploesningen o, der staar for sig: kun naar der er
       mere end tre slags ioner i den. Med én til tre ioner hoerer de med
       (en flaske AgNO3 har baade Ag+ og NO3-). En ion, eleven har loeftet
       op (loeft), er ikke tilskuer i hele forsoeget, foer den saettes ned
       igen; med `ogsaaLoeftede` kommer den med alligevel, saa panelet kan
       vise den i tilskuerlinjen, hvor den saettes ned (F27). */
    P.tilskuereI = function (o, ogsaaLoeftede) {
        var alle = this.tilskuereUden(o), l = this.loeftede;
        return ogsaaLoeftede ? alle : alle.filter(function (n) { return l.indexOf(n) < 0; });
    };

    /* Loeft en tilskuerion op i tabellen og boblen, eller saet den ned
       igen. Gaelder hele forsoeget; Start forfra saetter alle ned. */
    P.loeft = function (navn) {
        var i = this.loeftede.indexOf(navn);
        if (i < 0) this.loeftede.push(navn); else this.loeftede.splice(i, 1);
        this.aendret("tilskuere");
        return i < 0;
    };

    P.tilskuereUden = function (o) {
        if (!o || (!this.tilskuere.length && !this.centrale)) return [];
        var ioner = Object.keys(o.n).filter(function (n) {
            var s = Stof.STOFFER[n];
            return s && s.q && s.fase !== "s" && Stof.synlig(o, n);
        });
        if (ioner.length <= 3) return [];
        var c = this.centrale, t = this.tilskuere;
        return ioner.filter(function (n) { return c ? c.indexOf(n) < 0 : t.indexOf(n) >= 0; });
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
        this.loeftede = [];
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
        var pl = this.pilAktiv && this.pil;
        if (pl && pt.x >= pl.x && pt.x <= pl.x + pl.b && pt.y >= pl.y && pt.y <= pl.y + pl.h) return "naestepil";
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
        /* S14: taleboblen er oeverste lag. Et klik paa den springer videre;
           men et traek, der begynder paa den, tager det, der staar under
           den, saa en boble aldrig spaerrer for et glas. */
        var paaTaleboble = !!(this.overLaererBoble && this.overLaererBoble(pt));
        if (!navn && paaTaleboble) { this.klik("taleboble"); return false; }
        if (!navn) { if (this.klar) { this.klar = null; this.genvejMaal = null; } return false; }
        if (navn === "boble" || navn === "svaevring" || navn === "naestepil") { this.klik(paaTaleboble ? "taleboble" : navn); return false; }
        var laererOpt = this.laererOptaget && this.laererOptaget();
        /* F44: i boetten tages en ny, ren spatel. Traekkes der, er den i
           haanden; et klik laegger den frem og goer den klar (op) */
        var bo = this.g[navn];
        if (bo && bo.kan.spatler && !paaTaleboble && !laererOpt && !this.koer.optaget() && !this.baerer) {
            var ny = this.nySpatel(bo);
            if (ny) {
                this.holdt = { navn: ny.navn, start: pt, dx: pt.x - ny.p.x, dy: pt.y - ny.p.y, flyttet: false, sidst: pt, t: Date.now(), fraBoette: true };
                return true;
            }
        }
        if (!laererOpt && !this.koer.optaget() && !this.baerer && this.grebbar(navn)) {
            var gg = this.g[navn];
            this.koer.slipFri(gg);
            this.holdt = { navn: navn, start: pt, dx: pt.x - gg.p.x, dy: pt.y - gg.p.y, flyttet: false, sidst: pt, t: Date.now(), taleboble: paaTaleboble };
            return true;
        }
        this.klik(paaTaleboble ? "taleboble" : navn);
        return false;
    };

    P.flyt = function (pt, nu) {
        var h = this.holdt;
        if (!h) {
            this.hover = this.hvad(pt);
            this.genvejMaal = this.klar && this.hover && this.genvejTil(this.g[this.klar], this.g[this.hover]) ? this.hover : null;
            return;
        }
        var gg = this.g[h.navn];
        if (nu === undefined) nu = Date.now();
        if (!h.flyttet) {
            if (Math.abs(pt.x - h.start.x) + Math.abs(pt.y - h.start.y) < 8) return;
            h.flyttet = true;
            h.sidst = pt;
            h.t = nu;
            this.rystes = null;
            this.klar = null;
            this.genvejMaal = null;
            /* F35: tager man fat i noget andet, stilles det, der svaever,
               ned paa det naermeste ledige sted paa bordet - det maa aldrig
               spaerre for det naeste */
            var sv0 = this.svaevende();
            if (sv0 && sv0 !== gg) this.stilSvaevendeNed();
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
    /* medHaanden: F36 slog haeldning med haanden fra. At bære en flaske
       langsomt hen over et glas talte som at holde den stille, og saa
       haeldte den - ogsaa i det forkerte glas. Nu haeldes der kun, naar
       eleven beder om det: et slip over glasset giver én portion, og pilen
       giver mere. Resten af maskineriet herunder staar, som det stod, og
       kan slaas til igen med medHaanden: true. */
    var HAELD = { medHaanden: false, dvael: 0.3, vipTid: 0.5, vipDryp: 0.3, drypVip: 0.85, fart: { reagensglas: 12, baegerLille: 25, baegerStor: 35, kolbe: 30, maaleglas: 15, flaske: 15, vejebaad: 900, sproejteflaske: 8 }, dryp: 0.45 };

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
        var maalVip = HAELD.medHaanden && h.dvael > HAELD.dvael && !h.stoppet ? 1 : 0;
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
        if (!h.flyttet && h.fraBoette) {
            /* Et klik paa boetten: den nye spatel laegges frem og er klar */
            var ns = this.g[h.navn];
            if (ns) {
                var sted = this.ledigtSted(ns, ns.p.x) || ns.p;
                ns.p = kopi(sted); ns.hjem = kopi(sted);
                this.ordnDybde();
                this.goerKlar(ns);
                this.besked("En ren spatel. Klik på et pulverglas, eller træk den derhen.");
                this.aendret("spatel");
            }
            return;
        }
        if (!h.flyttet) { this.klik(h.taleboble ? "taleboble" : h.navn); return; }
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
            var tb = !greb && !mig.holdt && mig.overLaererBoble && mig.overLaererBoble(mig.tilBord(ev));
            c.style.cursor = mig.holdt ? "grabbing" : (greb ? "grab" : (hv || tb ? "pointer" : "default"));
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
            gg.spildtFarer = Stof.farer(B.samlet(gg));
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
        if (m.hane && k.holder && !k.pulver && !k.flaske && !k.drypper && !k.sproejter && B.volumen(gg) < gg.type.maks - 0.5) return true;
        if (m.kurv && !k.fast && !k.pulver && !k.flaske && !k.drypper && !k.sproejter && (k.holder || k.spatel || k.roerer || k.maaler)) return true;
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
    P.sigteScore = function (gg, c, pt, fod, tud, stiller) {
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
        /* F53: hanen - glassets aabning lige under tuden; kummen - musen i
           soejlen over kummen. Staar glasset under tuden, vinder hanen. */
        if (m.hane) {
            var ht = B.tudVerden(c), ga = B.aabning(gg);
            if (Math.abs(ga.x - ht.x) < 26 && ga.y > ht.y - 16 && ga.y < ht.y + 110) return Math.abs(ga.x - ht.x);
            return null;
        }
        if (m.vask && c.type.kumme) {
            if (pt.x > rk.x - 6 && pt.x < rk.x + rk.b + 6 && pt.y > rk.y - 190 && pt.y < rk.y + rk.h + 12) return Math.abs(pt.x - midt.x) + 30;
            return null;
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
           det, der stilles paa bordet foran et glas, ikke haelder i det -
           og slet ikke, naar det baarne har foden paa bordpladen (stiller) */
        if (m.holder && stiller) return null;
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
        /* Staar foden paa bordpladen (et bord med dybde), er det den, man
           stiller det baarne paa: saa haelder musen alene ikke i et glas,
           den er ud for. Tuden sigter stadig, saa en flaske kan haelde i et
           glas, der er kortere end den selv (S31: reagensglassene i sb2.4
           er lavere end flaskerne, saa musen, der holder en flaske i
           toppen, er ved glassets aabning, naar flasken staar foran det). */
        var S = NK.Scene, fo = this.fodOprejst(gg);
        var stiller = !!tud && !!S.DYBDE && fo.y >= S.BORD && fo.y <= S.FORKANT + 4;
        for (var i = 0; i < this.liste.length; i++) {
            var c = this.liste[i];
            if (c === gg || !this.synlig(c) || !this.kanModtage(gg, c)) continue;
            if (hylde && c.kan.holder && this.rekt(c, 0).y > hylde.y - 1) continue;
            var s = this.sigteScore(gg, c, pt, fod, tud, stiller);
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
        if (m.kurv) return this.iKurv(gg, c);
        if (m.hane && k.holder) return this.fyldFraHane(gg, c);
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
            gg.spildtFarer = Stof.farer(B.samlet(gg));
            B.toem(gg);
            this.uheld("vaeltet", gg, gg.titel + " væltede, og indholdet løb ud.");
            return;
        }
        this.besked(gg.titel + " væltede. Sæt det i stativet.", "advarsel");
        this.haendelse("vaeltet", gg);
    };

    /* ----- Pladser: stativ og varmeplade ------------------------------------- */

    /* Et glas, der er for kort til at naa bunden af det, det staar i
       (stativets eller badets bundY), synker ned, til indersidens bund
       staar dér. y er ankerets hoejde, som stedet ellers ville give; et
       glas i fuld stoerrelse naar bunden og beholder det. */
    function synkTil(gg, sted, y) {
        var t = gg.type;
        if (typeof sted.type.bundY !== "number" || !t.indre) return y;
        var ib = -Infinity;
        t.indre.forEach(function (q) { ib = Math.max(ib, q.y); });
        return Math.max(y, sted.p.y - sted.anker.y + sted.type.bundY - (ib - gg.anker.y));
    }
    P.iStativ = function (gg, st, hul, stille) {
        if (!st || hul < 0 || hul === undefined || st.glas[hul]) return false;
        this.frigoer(gg);
        st.glas[hul] = gg;
        gg.sted = { stativ: st, hul: hul };
        var til = { x: this.hulX(st, hul), y: st.p.y - st.anker.y + st.type.hulY, v: 0 };
        /* Et glas, der er for kort til at naa stativets bund fra hullet,
           synker ned, til indersidens bund staar paa bunden (bundY). Et
           glas i fuld stoerrelse naar bunden og staar, som det altid har. */
        til.y = synkTil(gg, st, til.y);
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
        /* Glasset staar nede i vaesken: aabningen bliver over badets kant.
           Et kortere glas synker ned, til bunden staar, hvor et fuldt glas'
           bund staar (bundY), ellers kommer indholdet ikke ned i vandet */
        var til = { x: cx, y: bad.p.y - bad.anker.y + bad.type.plade.y - 62 * (gg.skala || 1), v: 0 };
        til.y = synkTil(gg, bad, til.y);
        gg.hjem = kopi(til);
        if (stille) gg.p = kopi(til);
        else this.koer.start([{ flyt: gg, til: til, tid: 0.35, loeft: 14 }], "hjem");
        this.tilFront(gg);
        this.haendelse("bad", gg);
        this.aendret("bad");
        return true;
    };

    /* En portion: flaskens standardportion, dog hoejst en femtedel af det
       glas, der haeldes i. 0 = alt (fx fra et reagensglas i et baegerglas).
       Et glas kan selv sige, hvor meget det tager i én haeldning:
       modtager paa dets post i opstillingen (mL). Det bruges, naar
       femtedelen ikke passer til forsoeget - i sb2.4 er reagensglassene
       tegnet mindre, men rummer stadig 30 mL (skala er et rent tegnemaal),
       og der skal 4 mL i pr. tryk, ikke 6. */
    P.portion = function (gg, c) {
        var p = gg.type.haeldMl || 0;
        var m = c && c.spec && c.spec.modtager;
        var kap = m > 0 ? m : (c && c.type.maks ? c.type.maks / 5 : 0);
        if (!kap) return p;
        return p ? Math.min(p, kap) : kap;
    };

    /* F29: fyld glasset c op til maalMl med sproejteflasken gg i én
       sproejtning - aldrig over glassets rumfang og aldrig mere, end
       flasken har. Returnerer de mL, der gives (0, hvis glasset allerede
       staar der). */
    /* F42: kan gg fylde c op til et rumfang? Kilden haelder vaeske
       (sproejteflasken, en flaske, kolben, et glas), og maalet er
       glasudstyr, man maaler rumfang i (fyldOp paa typen) */
    P.kanFyldeOp = function (gg, c) {
        /* Et glas under hanen fyldes af hanen (F53) */
        if (gg && c && c.kan.hane) return !!(gg.kan.holder && gg.type.fyldOp);
        if (!gg || !c || gg === c || !c.kan.holder || !c.type.fyldOp) return false;
        if (B.volumen(gg) < 0.05) return false;
        return !!(gg.kan.sproejter || (gg.kan.haelder && gg.type.navn !== "vejebaad"));
    };

    P.fyldOpTil = function (gg, c, maalMl) {
        if (!this.kanFyldeOp(gg, c) || this.koer.optaget()) return 0;
        if (c.kan.hane) {
            var mangl = Math.min(maalMl, gg.type.maks - 0.1) - B.volumen(gg);
            if (!(mangl > 0.05)) { this.besked(stor(gg.titel) + " har allerede " + Math.round(B.volumen(gg)) + " mL."); return 0; }
            return this.fyldFraHane(gg, c, mangl) ? mangl : 0;
        }
        /* Lige under kanten: fylder man til randen, loeber det over */
        var mangler = Math.min(maalMl, c.type.maks - 0.1) - B.volumen(c);
        if (!(mangler > 0.05)) {
            this.besked(c.titel + " har allerede " + Math.round(B.volumen(c)) + " mL.");
            return 0;
        }
        var mL = Math.min(mangler, B.volumen(gg));
        if (gg.kan.sproejter) return this.sproejt(gg, c, mL) ? mL : 0;
        return this.haeld(gg, c, mL) ? mL : 0;
    };

    /* Det, der svaever over noget lige nu (noget skjult svaever ikke) */
    P.svaevende = function () {
        for (var i = 0; i < this.liste.length; i++) if (this.liste[i].svaev && this.synlig(this.liste[i])) return this.liste[i];
        return null;
    };

    /* F35: det, der svaever over noget, stilles ned paa det naermeste
       ledige sted paa bordpladen: naar man tager fat i noget andet, og naar
       bordet skifter del. straks: uden en bue (bordet skifter). Er der
       ikke plads nogen steder, gaar det hjem. */
    var LUFT = 12;                         /* afstand til andet udstyr */
    P.stilSvaevendeNed = function (straks) {
        var sv = null;
        for (var i = 0; i < this.liste.length; i++) if (this.liste[i].svaev) sv = this.liste[i];
        if (!sv) return null;
        sv.svaev = null;
        this.koer.slipFri(sv);
        /* Et reagensglas (fx under hanen, F53) kan ikke staa paa bordet:
           det gaar tilbage i stativet, helst i sit eget hul */
        if (sv.type.navn === "reagensglas") {
            var st = sv.spec && sv.spec.stativ ? this.g[sv.spec.stativ] : this.foersteMed("stoette");
            if (st) {
                var hul = sv.spec && sv.spec.hul !== undefined && !st.glas[sv.spec.hul] ? sv.spec.hul : this.ledigtHul(st, sv.p.x);
                if (hul >= 0 && this.iStativ(sv, st, hul, !!straks)) { this.aendret("svaev"); return sv; }
            }
        }
        var til = this.ledigtSted(sv, sv.p.x) || sv.hjem;
        sv.hjem = kopi(til);
        if (straks) sv.p = kopi(til);
        else this.koer.start([{ flyt: sv, til: til, tid: 0.4, loeft: 8 }], "hjem");
        this.tilFront(sv);
        this.ordnDybde();
        this.haendelse("satNed", sv);
        this.aendret("svaev");
        return sv;
    };

    /* Det naermeste sted paa bordpladen, set fra x, hvor gg kan staa uden
       at dens omrids kommer inden for LUFT af andet synligt udstyr. Paa et
       bord med dybde stilles den et stykke fremme paa pladen. null, hvis
       der ikke er plads. */
    P.ledigtSted = function (gg, x0) {
        var S = NK.Scene, t = gg.type, mig = this;
        var linje = S.DYBDE ? S.BORD + Math.round(S.DYBDE * 0.6) : S.BORD;
        var gammel = gg.p, fundet = null;
        for (var k = 0; k <= 400 && !fundet; k++) {
            var x = x0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 4;
            if (x < 40 || x > S.BREDDE - 40) continue;
            gg.p = t.sprite ? staar(t, x, linje) : { x: x, y: linje - 3, v: -Math.PI / 2 };
            var r = this.rekt(gg, LUFT);
            if (r.x < 4 || r.x + r.b > S.BREDDE - 4) continue;
            var fri = this.liste.every(function (o) {
                if (o === gg || !mig.synlig(o)) return true;
                var q = mig.rekt(o, 0);
                return r.x + r.b <= q.x || q.x + q.b <= r.x || r.y + r.h <= q.y || q.y + q.h <= r.y;
            });
            if (fri) fundet = kopi(gg.p);
        }
        gg.p = gammel;
        return fundet;
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
        if (gg.svaev && gg.svaev.maal && gg.svaev.maal.kan.hane) return { navn: "Mere vand", besked: "for mere vand" };
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

    /* Ryst glasset (knappen og tasten R, S16): det valgte glas rystes,
       hvor det staar, saa det, der ligger i bunden, blandes op. Det
       spilder aldrig - det goer kun musen, naar den ryster voldsomt.
       Flasker paa hylden, bade og fast udstyr rystes ikke. sek: hvor
       laenge (ellers til rystValgt(false)). */
    /* F43: vis eller skjul pilen til naeste del (tekst kan skiftes) */
    P.visPil = function (til, tekst) {
        if (!this.pil) return false;
        if (tekst) this.pil.tekst = tekst;
        if (this.pilAktiv !== !!til) { this.pilAktiv = !!til; this.aendret("pil"); }
        return true;
    };

    P.kanRystes = function (c) {
        return !!(c && c.kan.holder && !c.kan.bad && !c.kan.flaske && !c.kan.fast && this.synlig(c) && c !== this.baerer);
    };

    P.rystValgt = function (til, sek) {
        if (!til) { this.rystes = null; return false; }
        var c = this.valgtBeholder();
        if (this.rystes && this.rystes === c) { if (sek) this.rystSlut = this.rystUr + sek; return true; }
        if (!c) { this.besked("Klik på et glas for at vælge det."); return false; }
        if (!this.kanRystes(c)) { this.besked(stor(c.titel) + " skal ikke rystes."); return false; }
        if (this.holdt || this.koer.optaget()) return false;
        this.rystes = c;
        this.rystUr = 0;
        this.rystSlut = sek ? sek : null;
        this.aendret("ryst");
        return true;
    };

    P.opdaterRystKnap = function (dt) {
        var c = this.rystes;
        if (!c) return;
        this.rystUr += dt;
        if ((this.rystSlut !== null && this.rystUr >= this.rystSlut) || !this.kanRystes(c) || this.holdt) { this.rystes = null; return; }
        this.skvulpUr -= dt;
        if (B.volumen(c) > 0.1 && this.skvulpUr <= 0 && NK.Lyd && NK.Lyd.skvulp) {
            NK.Lyd.skvulp(0.5);
            this.skvulpUr = 0.4;
        }
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
        if (navn === "taleboble") return this.springReplik ? this.springReplik() : false;
        if (navn === "naestepil") { if (this.pilAktiv && this.vedPil) { this.vedPil(); return true; } return false; }
        if (navn === "boble") return this.storBoble ? this.lukStorBoble() : this.aabnStorBoble();
        if (navn === "laerer") return this.klikLaerer ? this.klikLaerer() : false;
        if (navn === "kaffekop") return this.klikKop ? this.klikKop() : false;
        if (this.laererOptaget && this.laererOptaget()) return false;
        if (this.baerer) return false;
        if (navn === "svaevring") {
            this.klar = null;
            var sv = this.svaevende();
            if (!sv || this.koer.optaget() || !this.kanGentage(sv)) return false;
            if (sv.kan.spatel) return this.hentOgGiv(sv, sv.svaev.maal);
            return this.moede(sv, sv.svaev.maal) || false;
        }
        var gg = this.g[navn];
        if (!gg || !this.synlig(gg)) return false;
        var k = gg.kan;
        /* M16: det, der er gjort klar, bruges paa det, der klikkes paa */
        if (this.klar) {
            var kl = this.g[this.klar];
            this.klar = null;
            this.genvejMaal = null;
            if (kl === gg) { this.besked("Fortrudt."); return false; }
            if (kl && !this.koer.optaget() && this.genvejTil(kl, gg)) return this.genvej(kl, gg);
        }
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
        var pron = gg.type.intetkoen ? "det" : "den";
        if (gg.svaev) {
            var klarSv = this.goerKlar(gg);
            if (!this.kanGentage(gg)) this.besked(k.spatel && gg.last ? "Spatlen er fuld. Klik på et glas, eller træk den derhen." : "Træk " + gg.titel + " væk" + (klarSv ? ", eller klik der, hvor " + pron + " skal hen." : "."));
            else this.besked("Klik på pilen " + pilenGiver(gg).besked + (klarSv ? ", på et andet glas" : "") + ", eller træk " + gg.titel + " væk.");
            return false;
        }
        if (k.holder) {
            this.vaelg(navn);
            var klarH = !k.pulver && this.goerKlar(gg);
            this.besked(stor(gg.titel) + " er valgt. " + (klarH ? "Klik der, hvor " + pron + " skal hen, eller træk " + pron + "." : "Tag fat i udstyret for at bruge det."));
            return true;
        }
        var klarV = this.goerKlar(gg);
        if (k.spatel) this.besked(gg.last ? "Klik på det glas, spatelspidsen skal i, eller træk spatlen derhen." : "Klik på et pulverglas for at tage en spatelspids, eller træk spatlen derhen.");
        else if ((k.roerer || k.maaler) && klarV) this.besked("Klik på det glas, " + gg.titel + " skal i, eller træk " + pron + " derhen.");
        else if (k.roerer || k.maaler) this.besked("Slip " + gg.titel + " over et glas.");
        else if (k.papir) this.besked("Slip køkkenrullen over en pyt.");
        else if (k.stoette) this.besked("Slip et reagensglas over stativet.");
        else if (k.luge) this.besked("Stil noget i lugen, og klik på knappen for at sende det.");
        else if (k.affald || k.vask) this.besked("Slip et glas over " + gg.titel + " for at tømme det.");
        else if (k.hane) this.besked("Hold et glas under hanen, og slip det, så fyldes det med demineraliseret vand.");
        return false;
    };

    /* ----- Klik som genvej (M16) -------------------------------------------
       Klik viser, traek goer - og et klik paa det, der skal bruges, og saa
       paa maalet goer det samme som et traek og slip over maalet (M11).
       Foerste klik vaelger som foer og goer genstanden klar (this.klar);
       andet klik paa et maal, der kan tage imod, udfoerer handlingen
       gennem moede, og et klik paa noget, der ikke kan, vaelger bare det i
       stedet. Et klik paa det klare igen, et traek, et klik ved siden af
       eller Esc fortryder. Mens noget er klar, faar det maal, musen er
       over, den groenne ramme (genvejMaal).
       Et glas, man kigger i, haeldes ikke i et andet glas med klik - det
       goer kun en kilde (flasker, kolben, maaleglasset, vejebaaden,
       udstyrets `kilde`) og vaerktoej. Et glas kan flyttes med klik: i
       stativet, i et bad og i affaldet. Varmepladen, vaegten og lugen er
       ikke maal: et klik paa dem goer det, det altid har gjort. */
    function kilde(gg) {
        var k = gg.kan;
        return !k.holder || !!k.flaske || !!k.drypper || !!k.sproejter || !!gg.type.kilde || !!(gg.spec && gg.spec.kilde);
    }

    function stor(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

    P.genvejTil = function (kl, c) {
        if (!kl || !c || kl === c || !this.synlig(kl) || !this.synlig(c)) return false;
        var m = c.kan;
        if (m.varmer || m.vaegt || m.luge || m.flamme && !kl.kan.dypper) return false;
        if (kl.sted && kl.sted.stativ === c) return false;
        if (kl.paa === c) return false;
        if (!this.kanModtage(kl, c)) return false;
        if (m.holder && !m.pulver && !kilde(kl) && !(m.bad && kl.type.navn === "reagensglas")) return false;
        return true;
    };

    /* Goer gg klar, hvis der er noget, den kan bruges paa med et klik */
    P.goerKlar = function (gg) {
        var mig = this;
        this.klar = null;
        if (!this.grebbar(gg.navn) || (this.laererOptaget && this.laererOptaget())) return false;
        var noget = this.liste.some(function (c) { return mig.genvejTil(gg, c); });
        if (noget) this.klar = gg.navn;
        return noget;
    };

    /* Udfoer genvejen: kl bruges paa c, som om den var trukket derhen og
       sluppet. Til stativet og et bad flyver den foerst derop, saa den ikke
       glider gennem det, der staar imellem; alt andet flyver moede selv. */
    P.genvej = function (kl, c) {
        var mig = this, m = c.kan;
        var sv = this.svaevende();
        if (sv && sv !== kl) this.stilSvaevendeNed();
        this.genvejMaal = null;
        if (!(m.stoette || m.bad)) return this.genvejSlip(kl, c, null);
        var r = this.rekt(c, 0), t = kl.type, x;
        if (m.stoette) { var hul = this.ledigtHul(c); x = hul >= 0 ? this.hulX(c, hul) : r.x + r.b / 2; }
        else { var px = this.ledigPlads(c); x = px === null ? r.x + r.b / 2 : px; }
        var til = { x: x - t.b / 2 + kl.anker.x, y: r.y - 16 - (t.h - kl.anker.y), v: 0 };
        this.koer.start([
            { flyt: kl, til: til, tid: 0.6, loeft: 30 },
            { kald: function () { mig.genvejSlip(kl, c, { x: x, y: r.y }); } }
        ], "genvej");
        return true;
    };

    P.genvejSlip = function (kl, c, pt) {
        this.startBaer(kl);
        this.baerer = null;
        this.baerAnker = null;
        var ok = this.synlig(c) && this.kanModtage(kl, c) && this.moede(kl, c, pt);
        if (!ok) this.koer.start([NK.Koer.hjemTil(kl, 0.6, 30)], "hjem");
        this.aendret("genvej");
        return !!ok;
    };

    /* ----- Haandvasken (F53) ---------------------------------------------
       Et glas, der slippes under hanen, stilles med bunden i kummen og
       aabningen under tuden og faar demineraliseret vand: én portion
       (hanens haeldMl, hoejst en femtedel af glasset), eller op til et
       rumfang fra »Fyld op til« (mL). Glasset bliver staaende under hanen,
       saa pilen giver mere, og feltet kan fylde op. */
    P.fyldFraHane = function (gg, hane, mL) {
        var mig = this;
        var plads = gg.type.maks - 0.1 - B.volumen(gg);
        if (mL === undefined) mL = this.portion(hane, gg);
        mL = Math.min(mL, plads);
        if (!(mL > 0.05)) { this.besked(stor(gg.titel) + " er fuldt."); return false; }
        var tud = B.tudVerden(hane);
        var kumme = null;
        this.liste.forEach(function (x) { if (x.kan.vask && x.type.kumme && Math.abs(x.p.x - tud.x) < 80) kumme = x; });
        var bundY = kumme ? kumme.p.y + 2 : NK.Scene.BORD + 20;
        var til = { x: tud.x, y: Math.max(tud.y + 10, bundY - (gg.type.h - gg.anker.y)), v: 0 };
        var tid = NK.klamp(mL / 20, 0.6, 2.5), givet = 0;
        if (this.aaben(gg)) this.vaelg(gg.navn);
        this.koer.start([
            { flyt: gg, til: til, tid: 0.6, loeft: 30 },
            { kald: function () { if (NK.Lyd && NK.Lyd.haeld) NK.Lyd.haeld(tid); } },
            { tid: tid, hver: function (t) {
                var nu = mL * t;
                if (nu > givet) {
                    B.haeldI(gg, Stof.lav({ V: nu - givet, T: 20, mM: {} }), true);
                    givet = nu;
                }
                mig.straale = { fra: B.tudVerden(hane), til: { x: tud.x, y: gg.niveau === null || gg.niveau === undefined ? til.y + 40 : gg.niveau }, farve: Stof.VAND, bredde: 2.2 };
            } },
            { kald: function () {
                mig.straale = null;
                gg.svaev = { maal: hane, ur: Infinity };
                mig.tilFront(gg);
                mig.haendelse("hane", { til: gg, mL: givet });
                mig.aendret("hane");
            } }
        ], "hane");
        return true;
    };

    /* ----- Kurven og boetten (F44) --------------------------------------
       Kurven til snavset udstyr: et tomt glas, en spatel, en glasstav eller
       et termometer, der laegges i den, forsvinder, og et nyt, rent
       eksemplar staar paa dets plads - bygget af opstillingens post, men
       uden indhold. Et glas med noget i skal i affaldet foerst. En spatel
       fra boetten har ingen plads i opstillingen og forsvinder bare. */
    P.iKurv = function (gg, kurv) {
        var mig = this;
        if (B.er(gg) && (B.volumen(gg) > 0.05 || B.fastIalt(gg) > 0.5)) {
            this.besked("Hæld " + gg.titel + " i affaldet først. Kurven er til tomt, snavset udstyr.", "advarsel");
            return false;
        }
        var o = { x: kurv.p.x - kurv.anker.x + kurv.type.b / 2, y: kurv.p.y - kurv.anker.y + 4 };
        var ned = gg.type.sprite ? gg.type.h - gg.anker.y : 0;
        this.koer.start([
            { flyt: gg, til: { x: o.x, y: o.y - 20 - ned, v: gg.type.sprite ? 0.25 : -1.3 }, tid: 0.45, loeft: 30 },
            { flyt: gg, til: { x: o.x, y: o.y + 8 - ned, v: gg.type.sprite ? 0.25 : -1.3 }, tid: 0.2, loeft: 0 },
            { kald: function () { mig.nytRent(gg); } }
        ], "kurv");
        return true;
    };

    P.nytRent = function (gg) {
        var spec = gg.spec;
        this.tagUd(gg);
        if (NK.Lyd && NK.Lyd.klik) NK.Lyd.klik();
        this.haendelse("kurv", gg);
        if (!spec || spec.ekstra) { this.aendret("kurv"); return null; }
        var ny = {}, n;
        for (n in spec) if (Object.prototype.hasOwnProperty.call(spec, n) && n !== "indhold") ny[n] = spec[n];
        var rent = this.tilfoej(ny);
        this.ordnDybde();
        this.besked(stor(rent.titel) + " er skiftet ud med et rent.");
        this.aendret("kurv");
        return rent;
    };

    /* Boetten med spatler: en ny, ren spatel staar op af boetten */
    P.nySpatel = function (bo) {
        this.spatelNr = (this.spatelNr || 1) + 1;
        var top = { x: bo.p.x - bo.anker.x + bo.type.b / 2, y: bo.p.y - bo.anker.y };
        var sp = this.tilfoej({ navn: "spatel_" + this.spatelNr, type: "spatel", titel: "spatlen", ekstra: true,
                                 del: bo.spec && bo.spec.del, p: { x: top.x - 2, y: top.y + 24, v: -Math.PI / 2 + 0.12 } });
        sp.hjem = kopi(sp.p);
        this.tilFront(sp);
        this.aendret("spatel");
        return sp;
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
        c.spildtMaerker = Stof.faremaerker(ud);
        c.spildtFarer = Stof.farer(ud);
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
        gg.spildtFarer = Stof.farer(tabt);
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
    /* maengde: mL i én sproejtning (standard SPROEJT); en stor maengde
       tager lidt laengere tid (F29, »fyld op til«) */
    P.sproejt = function (gg, c, maengde) {
        var mig = this;
        if (B.volumen(gg) < 0.05) { this.besked(gg.titel + " er tom."); return false; }
        var mL = Math.min(maengde > 0 ? maengde : SPROEJT, B.volumen(gg)), givet = 0, loebOver = false;
        var tid = NK.klamp(mL / 12, 0.8, 3);
        if (this.aaben(c)) this.vaelg(c.navn);
        this.koer.start([
            { flyt: gg, til: function () { return B.overAabning(gg, c, -12, -34, 0.55); }, tid: 0.6, loeft: 30 },
            { kald: function () { if (NK.Lyd && NK.Lyd.haeld) NK.Lyd.haeld(tid); } },
            { tid: tid, hver: function (t) {
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
                var umol = Math.min(jar.spec.spatelspids || SPATELSPIDS, f.umol);
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
        /* Staven gaar ned til lige over bunden (F46) */
        var dyb = Math.min(gg.type.laengde - 30, c.type.h - 12);
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
                /* F41: det, ingen andre har ryddet op, har eleven */
                Object.keys(mig.haendt).forEach(function (n) {
                    if (n.indexOf("_") > 0 && !mig.opryddet[n]) mig.opryddet[n] = "elev";
                });
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
        if (this.rystes === gg) s.ryst = Math.max(s.ryst, 0.8);
        if (this.roerer === gg) { s.roer = true; s.ryst = Math.max(s.ryst, 0.6); }
        return s;
    };

    P.opdater = function (dt) {
        var mig = this, i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;

        this.koer.opdater(dt);
        this.opdaterRyst(dt);
        this.opdaterRystKnap(dt);
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
                }
                mig.opdaterMaaler(gg, dt);
            }
            if (gg.svaev) {
                gg.svaev.ur -= dt;
                var m = gg.svaev.maal;
                if (mig.baerer === m || mig.baerer === gg || !mig.synlig(m) || !mig.synlig(gg) || mig.liste.indexOf(m) < 0) gg.svaev.ur = 0;
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

    /* Et termometer (eller pH-meter) i et glas. F45: det glider roligt mod
       glassets temperatur (tau ca. 1,4 s), og det tal, der vises (visT),
       skifter hoejst fire gange i sekundet og kun, naar det har flyttet
       sig en halv grad. Foer rykkede tallet ti gange i sekundet, og
       skiltet skiftede bredde med det. Baares det, staar det stille. */
    P.opdaterMaaler = function (gg, dt) {
        var c = gg.i;
        if (c) gg.T = NK.mod(gg.T, B.volumen(c) > 0.1 ? c.indhold.T : this.stue, 0.7, dt);
        else if (this.baerer !== gg) gg.T = NK.mod(gg.T, this.stue, 0.25, dt);
        if (gg.kan.ph) gg.pH = c && B.volumen(c) > 0.1 ? Stof.pH(B.samlet(c)) : null;
        gg.visUr = (gg.visUr || 0) - dt;
        if (gg.visT === undefined) gg.visT = Math.round(gg.T * 2) / 2;
        if (gg.visUr <= 0 && Math.abs(gg.T - gg.visT) >= 0.5) { gg.visT = Math.round(gg.T * 2) / 2; gg.visUr = 0.25; }
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
            if (gg.kan.maaler) mig.opdaterMaaler(gg, dt);
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

    /* Et glas, der rystes med knappen, loeftes lidt og vugger om sit anker */
    P.tegnGenstand = function (ctx, gg, tid) {
        if (this.rystes !== gg) { this.tegnGenstandHer(ctx, gg, tid); return; }
        var w = this.rystUr * 17;
        ctx.save();
        ctx.translate(gg.p.x + Math.sin(w) * 4, gg.p.y - 10 + Math.abs(Math.cos(w)) * 3);
        ctx.rotate(Math.cos(w) * 0.12);
        ctx.translate(-gg.p.x, -gg.p.y);
        this.tegnGenstandHer(ctx, gg, tid);
        ctx.restore();
    };

    P.tegnGenstandHer = function (ctx, gg, tid) {
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
            gg.niveau = T.tegnBeholder(ctx, gg, tid, { boelge: this.baerer === gg ? this.ryst * 1.5 : (this.roerer === gg ? 0.8 : (this.rystes === gg ? 1.2 : 0)) });
            /* Et isbad har is i vandet (is: true paa posten, F40) */
            if (gg.spec && gg.spec.is && T.tegnIs) T.tegnIs(ctx, gg, gg.niveau);
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
        if (this.pil && this.pilAktiv && T.tegnPil) T.tegnPil(ctx, this.pil, tid, this.hover === "naestepil");
        if (this.stinkskab) T.tegnStinkskabBag(ctx, this.stinkskab, tid);

        /* Staar laereren bag bordet, tegnes han her: efter vaeggen og
           hylderne, foer alt paa bordet, og klippet ved bordets bagkant */
        if (this.tegnLaererBag) this.tegnLaererBag(ctx, tid);

        this.underlag.forEach(function (u) { if (!u.vis || u.vis()) T.tegnUnderlag(ctx, u); });
        this.pytter.forEach(function (py) { T.tegnPyt(ctx, py); });
        T.tegnSkaar(ctx, this.skaar);

        var sidst = [];
        this.liste.forEach(function (gg) {
            if (!mig.synlig(gg)) return;
            if (gg === mig.baerer || (gg.i && gg.i === mig.baerer)) { sidst.push(gg); return; }
            mig.tegnGenstand(ctx, gg, tid);
        });

        /* M16: det, der er klar, pulserer (et glas har allerede sin gule
           ramme), og maalet under musen faar den groenne */
        var kl = this.klar ? this.g[this.klar] : null;
        if (kl && this.synlig(kl) && !kl.kan.holder && !this.markeret(kl.navn)) T.tegnMarkering(ctx, this.rekt(kl, 0), tid, undefined, kl);
        if (kl && this.genvejMaal && this.g[this.genvejMaal]) T.tegnSlipMaal(ctx, this.rekt(this.g[this.genvejMaal], 0), tid, this.g[this.genvejMaal]);

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
