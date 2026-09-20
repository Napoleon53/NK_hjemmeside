/* =====================================================================
   kemichael.js - Kemichael, laereren der gaar igen i superanimationerne

   Faelles for alle superanimationer med laereren. Personen, tonen og
   glimtene af hans baggrund er beskrevet i README.md i denne mappe.

   Filen indlaeses efter sprites.js og foer scene.js:

     <script src="js/sprites.js"></script>
     <script src="../kemichael/kemichael.js"></script>
     <script src="js/scene.js"></script>

   Ved indlaesning kommer Kemichaels sprites (krop, hoved, arm og
   kaffekoppen) i NK.Sprites.FILER med mappen kemichael/sprites/, og
   scene.js kopierer NK.Kemichael.ANKER ind i S.ANKER.

   Animationens egen js/laerer.js kobler figuren paa forsoeget og
   tilfoejer de scener, der hoerer til netop det forsoeg:

     NK.Kemichael.paa(NK.Forsoeg.prototype, { kaffeX: 170, fredet: ["brand"] });

   Valg:
     kaffeX   hvor laereren stiller sig, naar kaffen hentes (tal eller
              funktion)
     kaffeArm armens vinkel, naar han tager koppen og stiller den
              tilbage (funktion; ellers -0.5: op mod venstre)
     fredet   scener, som et klik paa laereren ikke afbryder

   Figuren kommer ind fra venstre, foran bordet. Hovedet er et sprite
   uden ansigt; oejne, bryn, briller, mund og roedme tegnes her, saa
   udtrykket kan skifte. Armen er et eget sprite, der drejer om skulderen.

   To planer (S8). Har scenen et NK.Scene.BAGBORD ({ x, y, skala }, sat af
   bordets valg bagBord), staar han BAG bordet paa en fast plads i stedet
   for at komme og gaa foran det:
     * L.plan er 1 bag bordet og 0 foran det. Bag bordet tegnes han med
       planets skala og klippes ved bordets bagkant (NK.Scene.BORD), saa
       bordpladen daekker hans underkrop. Han er da ikke laengere hoejere
       end bordet er dybt, og han kan ikke stille sig foran glassene.
     * Han bliver staaende og PEGER paa det, en replik handler om, i
       stedet for at gaa hen til det (trinnets mod).
     * Kun det, der kraever hans haender - oprydning efter et uheld -
       henter ham om for enden af bordet (trinnets foran). Vejen gaar uden
       for scenen, saa skiftet mellem planerne ikke ses.
     * K.UDE betyder da "hjem til pladsen" i stedet for "ud af scenen".
   Uden BAGBORD er alt som foer. Forneden slutter figuren ved gulvet
   (NK.Scene.GULV, bordets valg gulv, standard scenens bund) i stedet for
   at fortsaette ned under laerredet (F3); har scenen intet gulv - de
   gamle animationer - fortsaetter kitlen som foer.

   Laereren optraeder i smaa scener (laererKoer): en liste af trin, der
   koeres efter hinanden.
     { gaa: x, loeb }       gaa (eller loeb) hen til x; x kan vaere en funktion.
                            K.UDE er uden for scenen, K.KANT lige inde ved kanten
     { gaa: x, mod: m }     som gaa, men bag bordet bliver han staaende og
                            peger paa m (et sted paa bordet) i stedet
     { gaa: x, foran: 1 }   han skal staa FORAN bordet ved x (oprydning);
                            bag bordet gaar han foerst om for enden
     { sig: tekst, vis }    taleboble i vis sekunder
     { arm: vinkel, tid }   drej armen om skulderen; vinkel kan vaere en
                            funktion, fx this.pegVinkel(x)
     { udtryk: { ... } }    ansigtet glider derhen:
                              vrede, humoer, roed
                              skeptisk  hoejre bryn op og skaev mund
                              briller   brillerne glider ned, han kigger over dem
                              laen      han laener sig ind, fx fra kanten
     { tid, hver(t) }       vent; hver kaldes undervejs med t fra 0 til 1
     { kald() }             kald en funktion
     { taleFaerdig: true }  vent, til taleboblen er ude
     K.suk(tid)             et suk: oejnene lukkes, og hovedet synker
   En scene laaser forsoeget, mens den koerer, medmindre blokerer er false.

   Han bliver ikke afbrudt, mens han taler: et klik paa ham preller af,
   og en ny scene begynder med at vente, til boblen er faerdig. Boblen
   staar 10 % laengere end den tid, scenen beder om, og aldrig kortere
   end det tager at laese linjen (K.taleTid).

   Taleboblen tegnes af laboratoriet/js/taleboble.js (NK.Taleboble), naar den er
   indlaest: den faar munden (laererMund) og hovedets hoejde og finder
   selv sin plads inden for scenen, uden om det, replikken handler om
   (L.undgaa er navnet paa en genstand paa bordet) OG uden om zoomboblen
   paa scenen (bord.bobleRekt, F5). Er taleboble.js ikke indlaest - de
   aeldre animationer - tegnes boblen som foer, her i filen.
   Boblen er sit eget lag og tegnes til sidst: bordet kalder tegnLaerer
   med { udenBoble: true } og derefter tegnLaererBoble efter zoomboblen,
   saa replikken aldrig kan havne under noget. Kalder en aeldre animation
   bare tegnLaerer(ctx, tid), tegnes boblen med det samme som foer.

   Replikker:
     K.katalog(puljer)         forsoegets eget katalog af replikker (M18):
                               de samme kategorier som REPLIKKER, lagt oven
                               i puljerne. Saettes af side.js fra forsoegets
                               tekst.js ("kemichael")
     K.katalogReplik(kategori) en vending fra forsoegets eget katalog, ellers ""
     K.replik(kategori)        en vending fra puljen REPLIKKER, som ikke er
                               brugt for nylig (ros, uheld, advarsel, prik1-4)
     K.replik(navn, liste)     det samme med forsoegets egen liste
     K.dagsform()              dagens tilstand (DAGSFORM); den laegger egne
                               vendinger i puljerne, flytter ansigtet lidt og
                               afgoer, hvor mange prik han finder sig i.
                               Kun tilstande, der passer til ugedagen og
                               klokken, kan komme. K.dagsform(id) vaelger
                               en bestemt
     K.tid()                   ugedag og klokkeslaet, som han regner med.
                               K.tidTvang(dato) laaser tiden fast

   Baggrundsliv (laererBaggrundsliv, kaldes fra opdaterLaerer):
     Har eleven ikke roert noget i 95 rigtige sekunder, gaar han forbi med en
     kasse eller kigger ind fra kanten. Indslagene laaser ikke forsoeget og
     viger, saa snart eleven roerer noget. K.baggrundsliv(false) slaar dem fra.

   Tegneserien:
     K.uheldIForsoeget()       oprydninger i det forsoeg, der koerer nu
     K.oprydningsTekst()       teksten til ruden om oprydningen
     K.tegneserieFigur(ctx, valg)  tegner ham i en rude

   Glimt af baggrunden:
     K.glimtTrin(id)   en liste med eet sig-trin, hvis glimtet ikke er vist
                       foer i denne browser, og der ikke er vist et andet
                       glimt paa siden; ellers en tom liste. Bruges med concat.
     K.uheld()         skriver et uheld i regnskabet (foelger browseren paa
                       tvaers af animationerne) og giver et glimt, naar
                       regnskabet naar 3, 6 eller 10
     K.glimtNulstil()  glemmer viste glimt og regnskabet

   Kroge, som animationen kan definere paa prototypen (alle frivillige):
     laererStartEkstra()            mere tilstand ved start
     laererNytEkstra()              mere at nulstille ved nyt forsoeg
     laererVentende()               efter scenen: start en scene, der ventede
     opdaterLaererEkstra(dt)        mere at opdatere i hvert billede
     tegnLaererFoer(ctx, tid, L)    tegnes foer laereren, ogsaa naar han er ude
     tegnBaaretEkstra(ctx, L, hd)   andet i haanden end kaffekoppen

   Faelles paaskeaeg:
     kaffe    klik paa koppen paa hylden: laereren henter sin kaffe. Hvad
              der sker, staar i KAFFE og er ikke det samme to gange. Ved
              nogle poster bliver koppen staaende, saa aegget kan komme
              igen uden et nyt forsoeg
     laerer   klik paa laereren: fire svar fra puljerne prik1-4, stadig
              kortere, og femte klik sender ham ud, roed i hovedet og med
              damp af oererne

   Lydene (NK.Lyd.mumle, brum og slurk) staar i animationens lyd.js,
   fordi de foelger animationens egen lydknap.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var UDE = -300;
    var KANT = 10;
    var HAENGER = 2.9;
    var Y_FORAN = 392;        /* halsens y, naar han staar foran bordet */
    var SCENE_MAKS = 45;      /* sekunder, foer en scene afbrydes som haengt */

    /* Sprites hentes fra sprites/ ved siden af denne fil */
    var script = document.currentScript;
    var MAPPE = script && script.src ? script.src.replace(/[^\/]*$/, "") + "sprites/" : "../kemichael/sprites/";

    /* Navn: fil og stoerrelse i tegneenheder (viewBox). */
    var SPRITES = {
        kaffekop:    { fil: "kaffekop.svg", b: 42, h: 40 },
        laererKrop:  { fil: "laerer_krop.svg", b: 220, h: 250 },
        laererHoved: { fil: "laerer_hoved.svg", b: 110, h: 130 },
        laererArm:   { fil: "laerer_arm.svg", b: 56, h: 150 }
    };
    Object.keys(SPRITES).forEach(function (navn) {
        SPRITES[navn].mappe = MAPPE;
        NK.Sprites.FILER[navn] = SPRITES[navn];
    });

    /* Ankerpunkter: koppens bund, halsen paa kroppen og hovedet, skulderen */
    var ANKER = {
        kaffekop:    { x: 18, y: 40 },
        laererKrop:  { x: 110, y: 18 },
        laererHoved: { x: 55, y: 126 },
        laererArm:   { x: 28, y: 142 }
    };

    /* ----- Replikker ------------------------------------------------------
       Listerne er puljer, ikke raekkefoelger. K.replik(kategori, liste)
       vaelger en, der ikke er brugt for nylig i denne sidevisning, saa den
       samme vending ikke kommer to gange lige efter hinanden. Et forsoeg
       kan give sin egen liste med: K.replik("ryst", RYST_SVAR). */
    var REPLIKKER = {
        /* Klik paa ham. Et trin for hvert klik; han bliver kortere for
           hvert. Femte klik sender ham ud (gaaUd). */
        prik1: [
            "Ja?",
            "Hvad er der?",
            "Jeg står lige midt i noget.",
            "Det er ikke en knap.",
            "Jeg er her. Det kan du godt se.",
            "Var der noget fagligt?",
            "Jeg hører dig. Jeg reagerer bare langsomt.",
            "Ja. Stadig lærer."
        ],
        prik2: [
            "Jeg har travlt.",
            "Det bliver ikke rigtigere af at gentage det.",
            "Forsøget står stadig derovre.",
            "Ja. Stadig mig.",
            "Prøv at prikke til opgaven i stedet.",
            "Jeg har 28 elever. Du er lige nu alle 28.",
            "To gange. Det er én mere, end der skulle til.",
            "Jeg er ikke en dørklokke."
        ],
        prik3: [
            "Lad være med det.",
            "Nu stopper du.",
            "Det her fører ingen steder hen.",
            "Jeg tæller også det her.",
            "Der er en grænse. Den er tæt på.",
            "Hænderne til dig selv. Også i et forsøg.",
            "Tre gange er en tendens.",
            "Jeg skriver det ikke ned. Jeg husker det."
        ],
        prik4: [
            "Nej.",
            "Så er det nok.",
            "Færdig.",
            "Jeg har set det før. Det blev ikke sjovere.",
            "Godt. Så gør vi det på den anden måde.",
            "Det står i regnskabet.",
            "Fjerde gang. Jeg går om lidt.",
            "Det her er ikke et forsøg. Det er en udholdenhedsprøve."
        ],
        gaaUd: [
            "Nu går jeg.",
            "Så går jeg. Det er også en reaktion.",
            "Jeg er i forberedelsen.",
            "Farvel. Forsøget står der stadig.",
            "Jeg går ud. Kemien bliver.",
            "Jeg er ved kaffen. Den svarer heller ikke."
        ],
        /* Faelles puljer, som forsoegene kan bruge med K.replik(kategori),
           og som forsoegets eget katalog laegger sig oven i (M18) */
        ros: [
            "Fint arbejde.",
            "Det var rigtigt. Det sker.",
            "Godt. Skriv det ned, før du glemmer det.",
            "Sådan. Næsten som i bogen.",
            "Det holder. Også i morgen.",
            "Præcis. Og du gjorde det selv.",
            "Ja. Det er sådan, det skal se ud."
        ],
        uheld: [
            "Det var ikke meningen. Det er de færreste uheld.",
            "Jeg henter køkkenrullen. Igen.",
            "Sådan lærer man det også. Bare langsommere.",
            "Det står i regnskabet.",
            "Vi kalder det en observation.",
            "Det er derfor, der er bordplade og ikke gulvtæppe.",
            "Vi har alle hældt ved siden af. Nogle af os i 1994."
        ],
        advarsel: [
            "Læs etiketten, før du hælder.",
            "Lidt ad gangen. Altid lidt ad gangen.",
            "Det står på plakaten. Den hænger der stadig.",
            "Briller på. De er ikke pynt.",
            "Langsomt. Kemi er ikke en konkurrence.",
            "Er du i tvivl, så spørg. Jeg står lige her."
        ],
        /* Han kommer forbi uden aerinde */
        forbi: [
            "Jeg skal bare forbi.",
            "Der er kemi i kassen. Bliv siddende.",
            "Jeg går bare igennem.",
            "Jeg er her ikke. Jeg bærer bare noget.",
            "Kig ikke på kassen."
        ],
        /* Der er ikke sket noget i forsoeget i lang tid */
        stilstand: [
            "Står det stille?",
            "Forsøget gør det ikke selv.",
            "Det bider ikke.",
            "Er du gået i stå, eller tænker du?",
            "Der er ikke sket noget herovre i et stykke tid.",
            "Jeg venter. Det gør kemien også.",
            "Skal jeg hente en stol?"
        ]
    };

    /* ----- Hvad klokken er -------------------------------------------------
       Dagsformen og en raekke replikker retter sig efter den rigtige
       ugedag og tid paa maskinen, saa han ikke taler om fredag om
       tirsdagen eller om kagen klokken to om natten.
       K.tid() siger, hvad han regner med. K.tidTvang(dato) laaser tiden
       fast (selvtesten), K.tidTvang(null) slipper den igen. */
    var UGEDAGE = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

    var tidTvunget = null;

    function tid() {
        var d = tidTvunget || new Date();
        var ugedag = d.getDay();                              /* 0 soendag ... 6 loerdag */
        var klokken = d.getHours() + d.getMinutes() / 60;     /* timer med decimaler */
        return {
            ugedag: ugedag,
            navn: UGEDAGE[ugedag],
            klokken: klokken,
            ur: ("0" + Math.floor(klokken)).slice(-2) + "." + ("0" + Math.floor((klokken % 1) * 60)).slice(-2),
            hverdag: ugedag >= 1 && ugedag <= 5,
            skoletid: ugedag >= 1 && ugedag <= 5 && klokken >= 8 && klokken < 16
        };
    }

    function tidTvang(dato) {
        tidTvunget = dato || null;
        dagen = vaelgDagsform();
        brugte = {};
    }

    /* ----- Dagsform ---------------------------------------------------------
       Han har en tilstand for hver sidevisning. Den laegger et par
       vendinger til puljerne, flytter ansigtet en smule og afgoer, hvor
       mange prik han finder sig i. naar(t) siger, hvornaar tilstanden
       overhovedet kan komme, og vaegt, hvor tung den er blandt dem, der
       passer paa tidspunktet. ekstra maa vaere en funktion af t, naar
       vendingerne selv afhaenger af klokken. K.dagsform() siger, hvilken
       det er, og K.dagsform(id) vaelger en bestemt (selvtesten). */
    var DAGSFORM = [
        {
            id: "fredag", taalmod: 5, humoer: 0.25, vaegt: 3,
            naar: function (t) { return t.ugedag === 5 && t.klokken >= 6 && t.klokken < 16; },
            ekstra: function (t) {
                var foerKage = t.klokken < 14;
                return {
                    prik: ["Det er fredag. Det redder dig.",
                        foerKage ? "Der er kage klokken to. Det redder dig også."
                                 : "Kagen er spist. Nu er der kun forsøget."],
                    ros: [foerKage ? "Godt. Så kan jeg nå kagen." : "Godt. Og jeg nåede kagen."],
                    uheld: ["På en fredag. Selvfølgelig."],
                    stilstand: ["Det er fredag. Forsøget bliver ikke kortere af at vente."]
                };
            }
        },
        {
            id: "weekend", taalmod: 5, humoer: 0.1, vaegt: 3,
            naar: function (t) { return !t.hverdag && t.klokken >= 5 && t.klokken < 22; },
            ekstra: function (t) {
                return {
                    prik: ["Det er " + t.navn + ". Jeg er her, fordi du er her.",
                        "Skolen er lukket. Jeg har en nøgle."],
                    ros: ["Godt. Og det er ikke engang en skoledag."],
                    uheld: ["Der er ingen pedel i weekenden. Vi to rydder op."],
                    stilstand: ["Vi kunne begge to lave noget andet i dag."]
                };
            }
        },
        {
            id: "morgen", taalmod: 4, vrede: 0.1, humoer: -0.05, vaegt: 2,
            naar: function (t) { return t.hverdag && t.klokken >= 5 && t.klokken < 8; },
            ekstra: {
                prik: ["Klokken er ikke otte. Det er kaffen, der taler.",
                    "Første time er ikke begyndt. Det er du til gengæld."],
                ros: ["Godt. Og dagen er knap nok begyndt."],
                uheld: ["Allerede? Vi er ikke engang kommet i gang."],
                stilstand: ["Jeg er heller ikke vågen endnu. Men jeg står op."]
            }
        },
        {
            id: "soevn", taalmod: 3, vrede: 0.2, humoer: -0.15,
            naar: function (t) { return t.hverdag && t.klokken >= 5 && t.klokken < 11; },
            ekstra: {
                prik: ["Jeg har sovet fire timer. Vælg dine ord.", "Ikke i dag."],
                ros: ["Godt. Så kan jeg sætte mig ned."],
                uheld: ["Ikke i dag. Bare ikke i dag."],
                stilstand: ["Vi står begge to stille. Jeg har en undskyldning."]
            }
        },
        {
            id: "maskine", taalmod: 5, humoer: 0.3,
            naar: function (t) { return t.hverdag && t.klokken >= 6 && t.klokken < 13; },
            ekstra: {
                prik: ["Der er ny kaffemaskine. Jeg er et bedre menneske i dag.", "Spørg om noget fagligt, mens jeg er sådan her."],
                ros: ["Flot. Og kaffen er varm. En god dag."],
                uheld: ["Selv i dag."],
                stilstand: ["Jeg har tid. Jeg har lige hentet kaffe."]
            }
        },
        {
            id: "rettebunke", taalmod: 4, vrede: 0.1,
            naar: function (t) { return t.hverdag && t.klokken >= 8 && t.klokken < 17; },
            ekstra: {
                prik: ["Jeg har 62 rapporter at rette. Du er nummer 63.", "Kort version: nej."],
                ros: ["Skriv det i rapporten. Så bliver den nem at rette."],
                uheld: ["Det bliver en fodnote i din rapport."],
                stilstand: ["Jeg retter rapporter, mens du tænker. Sig til."]
            }
        },
        {
            id: "vikar", taalmod: 4, vrede: 0.05,
            naar: function (t) { return t.hverdag && t.klokken >= 11 && t.klokken < 17; },
            ekstra: {
                prik: ["Jeg har haft tre vikartimer i fysik i dag.", "Jeg har forklaret Newton tre gange. Nu er det kemi."],
                ros: ["Godt. Dagens første rigtige kemi."],
                uheld: ["Det her var ikke i fysiktimen."],
                stilstand: ["Jeg har ventet på et rigtigt kemiforsøg hele dagen."]
            }
        },
        {
            id: "moede", taalmod: 3, vrede: 0.15, humoer: -0.1,
            naar: function (t) { return t.hverdag && t.klokken >= 13 && t.klokken < 17; },
            ekstra: {
                prik: ["Jeg har siddet i møde i fire timer.", "Jeg har brugt dagen på et skema. Det her er nemmere."],
                ros: ["Det var dagens første, der gik som planlagt."],
                uheld: ["Det skal jeg også skrive i et skema."],
                stilstand: ["Jeg har siddet stille hele dagen. Nu er det din tur til at lade være."]
            }
        },
        {
            id: "aften", taalmod: 3, vrede: 0.1, humoer: -0.05, vaegt: 2,
            naar: function (t) { return t.klokken >= 17 && t.klokken < 22; },
            ekstra: {
                prik: ["Klokken er over fem. Jeg burde være gået hjem.", "Skemaet siger fri. Jeg står her."],
                ros: ["Godt. Så kan jeg låse."],
                uheld: ["Nu? På det her tidspunkt?"],
                stilstand: ["Jeg venter gerne. Bare ikke hele aftenen."]
            }
        },
        {
            id: "nat", taalmod: 3, vrede: 0.15, humoer: -0.1, vaegt: 2,
            naar: function (t) { return t.klokken >= 22 || t.klokken < 5; },
            ekstra: function (t) {
                return {
                    prik: ["Klokken er " + t.ur + ". Det står ikke i noget skema.",
                        "Vi to burde sove. Én af os ved det."],
                    ros: ["Rigtigt. Selv nu."],
                    uheld: ["Klokken " + t.ur + ". Det er en ny rekord."],
                    stilstand: ["Det bliver ikke bedre af at være nat."]
                };
            }
        }
    ];

    /* Tilstandene, der passer paa tidspunktet. Vaegten afgoer, hvor tit
       hver af dem kommer; passer ingen, staar hele listen aaben. */
    function vaelgDagsform() {
        var t = tid();
        var kan = DAGSFORM.filter(function (d) { return !d.naar || d.naar(t); });
        if (!kan.length) kan = DAGSFORM;
        var sum = kan.reduce(function (s, d) { return s + (d.vaegt || 1); }, 0);
        var trukket = Math.random() * sum;
        for (var i = 0; i < kan.length; i++) {
            trukket -= kan[i].vaegt || 1;
            if (trukket <= 0) return kan[i];
        }
        return kan[kan.length - 1];
    }

    var dagen = vaelgDagsform();

    function dagsform(id) {
        if (id) {
            var valgt = DAGSFORM.filter(function (d) { return d.id === id; })[0];
            if (valgt) { dagen = valgt; brugte = {}; }
        }
        return dagen.id;
    }

    /* Dagsformens egne vendinger til en pulje. prik1 til prik4 deler pulje. */
    function dagensLinjer(kategori) {
        var e = dagen.ekstra || {};
        if (typeof e === "function") e = e(tid()) || {};
        return (kategori.indexOf("prik") === 0 ? e.prik : e[kategori]) || [];
    }

    /* Replikker, der er brugt i denne sidevisning, pr. kategori */
    var brugte = {};

    /* ----- Forsoegets eget katalog (M18) ----------------------------------
       Han skal lyde som sig selv - men som sig selv I DET HER forsoeg.
       Hver animation kan derfor lægge sine egne vendinger oven i puljerne:
       de staar i forsoegets js/tekst.js under noeglen "kemichael" med de
       samme kategorier som REPLIKKER (og uheldenes: spild, rystet,
       vaeltet, overloeb, knust), og side.js giver dem videre hertil.
       Ingen ny kode i forsoeget - kun tekst. */
    var katalog = {};

    function saetKatalog(puljer) {
        katalog = puljer || {};
        brugte = {};
    }

    /* En vending fra forsoegets eget katalog, eller "", hvis det ikke har
       nogen i kategorien */
    function katalogReplik(kategori) {
        var liste = katalog[kategori];
        return liste && liste.length ? replik(kategori + ":egen", liste) : "";
    }

    function replik(kategori, liste) {
        var noegle = kategori;
        if (!liste) {
            liste = REPLIKKER[kategori];
            /* Forsoegets egne vendinger fylder knap halvdelen, naar det har
               nogen i kategorien (M18). Dagsformen fylder cirka hver tredje
               af resten. De fire prik-trin deler dagsformens pulje, saa den
               samme vending ikke kommer to klik i traek. */
            var egen = katalog[kategori] || [];
            var dag = dagensLinjer(kategori);
            if (egen.length && Math.random() < 0.45) {
                liste = egen;
                noegle = kategori + ":egen";
            } else if (dag.length && Math.random() < 0.35) {
                liste = dag;
                noegle = (kategori.indexOf("prik") === 0 ? "prik" : kategori) + ":dagen";
            }
        }
        if (!liste || !liste.length) return "";
        var set = brugte[noegle] || (brugte[noegle] = []);
        if (set.length >= liste.length) set.length = 0;
        var rest = liste.filter(function (t) { return set.indexOf(t) < 0; });
        var tekst = rest[Math.floor(Math.random() * rest.length)];
        set.push(tekst);
        return tekst;
    }

    /* Hvor laenge en replik staar. Taleboblen faar 10 % oveni, saa der er
       tid til at laese den faerdig. */
    var TALE_EKSTRA = 1.1;

    function taleTid(tekst) {
        return 1.3 + (tekst ? tekst.length : 0) * 0.055;
    }

    /* ----- Glimt af baggrunden ------------------------------------------- */
    /* Hvert glimt hoerer til en bestemt haendelse; se tabellen i README.md. */
    var GLIMT = {
        navn:       "Michael. Ikke Kemichael.",
        kaffeKold:  "Kold. Som altid.",
        kaffePause: "Uden for døren er det en pause.",
        oejenbryn:  "Jeg prøvede det i 1994. Spørg mine øjenbryn.",
        frokost:    "Tak for frokosten.",
        phd:        "Sådan så min ph.d. også ud. Den blev aldrig færdig.",
        vejleder:   "Det sagde min vejleder også. Jeg lyttede heller ikke.",
        laege:      "Sådan en kurve lavede en elev i 2003. Hun er læge nu.",
        dab:        "Det lærte jeg af en 1.g i 2016.",
        stroem:     "Strømmen går fra kaffebudgettet.",
        bartender:  "Jeg rystede cocktails under studiet. Det her er ikke det.",
        jura:       "Aubergine så jeg sidst i 2011. Han læser jura nu.",
        titrering:  "Min første titrering gav 140 %. Det var en lang nat.",
        afslag:     "Mit afslag fra et tidsskrift hænger indrammet. Samme grund.",
        kaktus:     "Bunsen er min kaktus. Han kan tåle det.",
        kittel:     "Kitlen er fra min første lærerdag. Skiltet er nyere.",
        fredag:     "Jeg går aldrig glip af et fredagsmøde. Der er kage.",
        gave:       "Koppen var en gave fra en klasse, der ryddede op. Én gang.",
        kunst:      "Skårene gemmer jeg. Det bliver en kunstinstallation.",
        rene3:      "Tre forsøg uden uheld. Det står også i regnskabet.",
        rene6:      "Seks i træk uden uheld. Nu leder jeg efter fejlen.",
        rene10:     "Ti i træk. Jeg har ikke en mappe til den slags.",
        regnskab3:  "Tredje uheld på den her computer. Det står i regnskabet.",
        regnskab6:  "Seks uheld på den her computer. Regnskabet har fået en mappe.",
        regnskab10: "Ti uheld. Regnskabet har fået sit eget ringbind."
    };
    var REGNSKAB = [
        { antal: 10, id: "regnskab10" },
        { antal: 6, id: "regnskab6" },
        { antal: 3, id: "regnskab3" }
    ];

    /* Modstykket: forsoeg i traek uden uheld */
    var RENE = [
        { antal: 10, id: "rene10" },
        { antal: 6, id: "rene6" },
        { antal: 3, id: "rene3" }
    ];

    var LAGER = "nk-kemichael";
    var hukommelse = { sete: [], uheld: 0, rene: 0, kaffe: [], kaffeTal: 0 };
    var glimtVist = false;

    function hent() {
        try {
            var v = JSON.parse(window.localStorage.getItem(LAGER));
            if (v && v.sete) return v;
        } catch (fejl) { /* file:// eller privat browsing */ }
        return hukommelse;
    }

    function gem(v) {
        hukommelse = v;
        try { window.localStorage.setItem(LAGER, JSON.stringify(v)); } catch (fejl) { /* som ovenfor */ }
    }

    /* Teksten, hvis glimtet maa vises nu; det regnes saa som vist */
    function glimt(id) {
        var tekst = GLIMT[id];
        if (!tekst || glimtVist) return null;
        var v = hent();
        if (v.sete.indexOf(id) >= 0) return null;
        v.sete.push(id);
        gem(v);
        glimtVist = true;
        return tekst;
    }

    function glimtTrin(id) {
        var tekst = glimt(id);
        return tekst ? [{ sig: tekst, vis: 1.4 + tekst.length * 0.045, tid: 1.6 + tekst.length * 0.045 }] : [];
    }

    /* Uheld i det forsoeg, der koerer nu. Nulstilles ved nyt forsoeg og
       bruges af tegneserien, naar den skal fortaelle, at han ryddede op. */
    var uheldNu = 0;

    function uheld() {
        var v = hent();
        v.uheld = (v.uheld || 0) + 1;
        v.rene = 0;
        gem(v);
        uheldNu++;
        for (var i = 0; i < REGNSKAB.length; i++) {
            if (v.uheld >= REGNSKAB[i].antal) return v.sete.indexOf(REGNSKAB[i].id) >= 0 ? [] : glimtTrin(REGNSKAB[i].id);
        }
        return [];
    }

    function uheldIForsoeget() {
        return uheldNu;
    }

    /* Teksten til tegneseriens rude om oprydningen */
    function oprydningsTekst() {
        if (uheldNu === 1) return "Kemichael kom og ryddede op efter uheldet. Det står i hans regnskab.";
        return "Kemichael kom og ryddede op " + uheldNu + " gange. Det står i hans regnskab.";
    }

    /* Modstykket til uheld(): et forsoeg, der gik godt. Kaldes fra
       forsoegets ros-scene og giver et glimt ved 3, 6 og 10 i traek. */
    function ros() {
        var v = hent();
        v.rene = (v.rene || 0) + 1;
        gem(v);
        for (var i = 0; i < RENE.length; i++) {
            if (v.rene >= RENE[i].antal) return v.sete.indexOf(RENE[i].id) >= 0 ? [] : glimtTrin(RENE[i].id);
        }
        return [];
    }

    function glimtNulstil() {
        gem({ sete: [], uheld: 0, rene: 0, kaffe: [], kaffeTal: 0 });
        glimtVist = false;
        brugte = {};
        uheldNu = 0;
    }

    /* ----- Hvor laenge der er gaaet, siden eleven roerte noget -------------
       Maales i rigtige sekunder, ikke i forsoegets tid. Baggrundslivet
       haenger paa den, saa det aldrig sker midt i noget, eleven laver, og
       aldrig i selvtesten, der koerer timer igennem paa faa sekunder. */
    var STILLE_FOERSTE = 150;  /* sekunder uden at eleven roerer noget */
    var STILLE_IGEN = 420;     /* sekunder mellem to indslag */

    var roert = Date.now();
    var roertTal = 0;          /* taeller, saa et indslag kan se, om eleven har roert noget */
    var sidsteBaggrund = 0;
    var baggrundsliv = true;

    function naa() {
        return Date.now();
    }

    function stille() {
        return (naa() - roert) / 1000;
    }

    function sidenBaggrund() {
        return (naa() - sidsteBaggrund) / 1000;
    }

    function baggrundNu() {
        sidsteBaggrund = naa();
    }

    function roerteSidst() {
        return roertTal;
    }

    /* Selvtesten slaar baggrundslivet fra, saa scenerne er forudsigelige */
    function slaaBaggrundsliv(til) {
        baggrundsliv = til !== false;
    }

    function roerte() {
        roert = naa();
        roertTal++;
    }

    if (window.document && document.addEventListener) {
        ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (navn) {
            document.addEventListener(navn, roerte, true);
        });
    }

    /* Papkassen, han baerer forbi. Tegnes i koden, saa den ikke kraever
       en sprite: (x, y) er midt paa kassens overkant. */
    function tegnKasse(ctx, x, y, k) {
        var b = 66, h = 46;
        k = k || 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(k, k);
        ctx.translate(-b / 2, 0);
        var g = ctx.createLinearGradient(0, 0, b, 0);
        g.addColorStop(0, "#a9773f");
        g.addColorStop(0.5, "#c89355");
        g.addColorStop(1, "#9c6c39");
        ctx.fillStyle = g;
        ctx.strokeStyle = "#6f4a24";
        ctx.lineWidth = 1.6;
        ctx.fillRect(0, 0, b, h);
        ctx.strokeRect(0, 0, b, h);
        /* Laagets to flapper og tapen ned ad midten */
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(0, 0, b, 9);
        ctx.strokeStyle = "rgba(90, 60, 30, 0.8)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 9); ctx.lineTo(b, 9);
        ctx.moveTo(b / 2, 0); ctx.lineTo(b / 2, 9);
        ctx.stroke();
        NK.tekst(ctx, "KEMI", b / 2, h / 2 + 6, { font: "700 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "rgba(80, 52, 26, 0.85)" });
        ctx.restore();
    }

    /* Et suk: oejnene lukkes, og hovedet synker og kommer op igen */
    function suk(tid) {
        return { tid: tid || 1.2, hver: function (t) {
            var s = Math.sin(Math.PI * t);
            this.laerer.lukket = s;
            this.laerer.nik = 6 * s;
        } };
    }

    /* ----- Kaffen ---------------------------------------------------------
       Koppen er hans, og det bliver aldrig det samme to gange. Hver post er
       midterstykket mellem "han kommer hen til hylden" og "han gaar igen".
       Trinene bygges med h, som kobler dem til netop dette forsoeg:

         h.sig(tekst)      en replik, der faar tid til at blive laest
         h.grib()          han tager koppen
         h.drik(dybt)      koppen op til munden og en slurk
         h.vip(v, tid)     koppen vippes (v = -2.4 er paa hovedet)
         h.udtryk(o)       ansigtet glider derhen
         h.vent(tid)       en pause
         h.suk(tid)        et suk
         h.damp(tid)       damp af oererne
         h.sprut(antal)    han spytter kaffen ud
         h.gaa(x, loeb)    han gaar (eller loeber) hen til x
         h.glimt(id)       teksten til et glimt, hvis det maa vises nu
         h.tal             hvilken kop i raekken det er

       griber: false   han roerer ikke koppen
       beholder: true  koppen bliver staaende, saa paaskeaegget kan komme igen
       krav(tal)       posten kan kun vaelges, naar den passer */
    var KAFFE = [
        {
            id: "kold",
            sig: "Det er min kaffe.",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.2, humoer: -0.3, roed: 0 }), h.vent(0.4), h.suk(1.1),
                    h.sig(h.glimt("kaffeKold") || "Kold. Som altid.")
                );
            }
        },
        {
            id: "varm",
            sig: "Det er min kaffe.",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.9, humoer: -0.7, roed: 1 }), h.damp(1.6), h.vent(0.9),
                    h.sig("Den var varm. Det sker en gang om året."),
                    h.udtryk({ roed: 0.2 })
                );
            }
        },
        {
            id: "tom",
            sig: "Så tager vi den.",
            midte: function (h) {
                return h.vip(-2.4, 0.7).concat(
                    h.vent(1.1), h.udtryk({ humoer: -0.8, skeptisk: 0.5 }), h.vip(0, 0.4),
                    h.sig("Tom. Så var det den time.")
                );
            }
        },
        {
            id: "ud",
            sig: "Der drikkes ikke i laboratoriet.",
            midte: function (h) {
                return h.gaa(-40).concat(
                    h.drik(true), h.udtryk({ vrede: 0.1, humoer: 0.6, roed: 0 }),
                    h.sig(h.glimt("kaffePause") || "Uden for døren er det en pause.")
                );
            }
        },
        {
            id: "hoejt",
            sig: "Den står for lavt.",
            midte: function (h) {
                return [{ arm: -0.1, tid: 0.6 }].concat(
                    h.vent(0.5), h.sig("Den står højere fra i dag.")
                );
            }
        },
        {
            id: "stirrer",
            griber: false,
            beholder: true,
            midte: function (h) {
                return h.udtryk({ vrede: 0.6, humoer: -0.5, briller: 1, laen: 0.7 }).concat(
                    h.vent(2.4), h.sig("Ja."), h.vent(0.3),
                    h.udtryk({ briller: 0, laen: 0 })
                );
            }
        },
        {
            id: "glasstav",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.7, humoer: -0.6, skeptisk: 1, briller: 1 }), h.vent(0.5),
                    h.sig("Nogen har rørt i den med en glasstav."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "ligevaegt",
            midte: function (h) {
                return h.drik().concat(
                    h.vent(0.4), h.sig("Rumtemperatur. Det er også en ligevægt.")
                );
            }
        },
        {
            id: "oploesning",
            sig: "Det er en opløsning.",
            midte: function (h) {
                return h.drik().concat(h.sig("Koncentrationen er min."));
            }
        },
        {
            id: "regnskab",
            krav: function (tal) { return tal >= 3; },
            sig: "Igen.",
            midte: function (h) {
                return h.vent(0.4).concat(
                    h.sig("Det er kop nummer " + h.tal + " i regnskabet."), h.drik()
                );
            }
        },
        {
            id: "sprut",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 1, humoer: -0.9, roed: 0.8 }), h.sprut(14), h.vent(0.6),
                    h.sig("Den har stået siden i morges."), h.udtryk({ roed: 0.2 })
                );
            }
        },
        {
            id: "kaktus",
            sig: "Resten får Bunsen.",
            midte: function (h) {
                return h.vip(-1.9, 0.6).concat(
                    h.sprut(10, true), h.vent(0.7), h.vip(0, 0.4),
                    h.sig(h.glimt("kaktus") || "Han er en kaktus. Han kan tåle det.")
                );
            }
        },
        {
            id: "kittel",
            midte: function (h) {
                return h.drik().concat(
                    h.sprut(8, true), h.udtryk({ vrede: 0.8, humoer: -0.9, roed: 0.4 }), h.suk(1.2),
                    h.sig(h.glimt("kittel") || "Der er kaffe på kitlen. Igen.")
                );
            }
        },
        {
            id: "fredag",
            griber: false,
            beholder: true,
            midte: function (h) {
                var t = tid();
                var linje = t.ugedag !== 5 ? "Ikke nu. På fredag er der kage."
                    : t.klokken < 14 ? "Ikke nu. Der er kage klokken to."
                    : "For sent. Kagen var klokken to.";
                return h.udtryk({ vrede: 0.2, humoer: 0.5 }).concat(
                    h.vent(0.5), h.sig(linje),
                    h.sig(h.glimt("fredag") || "")
                );
            }
        },
        {
            id: "gave",
            midte: function (h) {
                return h.vent(0.6).concat(
                    h.udtryk({ vrede: 0.2, humoer: 0.3 }),
                    h.sig(h.glimt("gave") || "Koppen var en gave. Den blev her."),
                    h.drik()
                );
            }
        },
        {
            id: "navneskilt",
            griber: false,
            beholder: true,
            midte: function (h) {
                return h.udtryk({ vrede: 0.3, humoer: 0.2, briller: 1 }).concat(
                    h.vent(0.4), h.sig("Der står BEDSTE LÆRER på koppen."),
                    h.sig("Der står ikke noget på skiltet."), h.udtryk({ briller: 0 })
                );
            }
        },
        {
            id: "stroem",
            griber: false,
            beholder: true,
            midte: function (h) {
                return h.udtryk({ vrede: 0.6, humoer: -0.4, skeptisk: 0.8 }).concat(
                    h.sig("Kaffemaskinen og udsugningen deler stikkontakt."),
                    h.sig("Vælg."), h.udtryk({ skeptisk: 0 })
                );
            }
        },
        {
            id: "tavs",
            midte: function (h) {
                return h.udtryk({ vrede: 0.8, humoer: -0.7, skeptisk: 1 }).concat(
                    h.vent(1.4), h.udtryk({ skeptisk: 0 })
                );
            }
        },
        {
            id: "loeber",
            loeb: true,
            sig: "Nej.",
            midte: function (h) {
                return h.vent(0.3);
            }
        },
        {
            id: "tilbud",
            sig: "Vil du smage?",
            midte: function (h) {
                return h.vent(0.7).concat(
                    h.udtryk({ vrede: 0.7, humoer: -0.6 }), h.sig("Nej. Det vil du ikke."), h.drik()
                );
            }
        },
        {
            id: "maalt",
            midte: function (h) {
                return [{ arm: -0.75, tid: 0.6 }].concat(
                    h.udtryk({ briller: 1, skeptisk: 0.6 }), h.vent(0.8),
                    h.sig("Der manglede 20 mL. Jeg har målt op."),
                    h.udtryk({ briller: 0, skeptisk: 0 })
                );
            }
        }
    ];

    /* Selvtesten skal kunne regne med et bestemt forloeb: K.kaffeTvang(id)
       vaelger den naeste post, K.kaffeTvang(null) slaar det fra igen. */
    var kaffeTvunget = null;

    function kaffeTvang(id) {
        kaffeTvunget = id || null;
    }

    /* Naeste kaffepost: en, der ikke er set foer i denne browser. Er de set
       alle sammen, begynder raekken forfra. */
    function kaffeVariant() {
        var v = hent();
        v.kaffeTal = (v.kaffeTal || 0) + 1;
        if (kaffeTvunget) {
            var tvunget = KAFFE.filter(function (k) { return k.id === kaffeTvunget; })[0];
            if (tvunget) { gem(v); return { post: tvunget, tal: v.kaffeTal }; }
        }
        var sete = v.kaffe || [];
        function kan(k) { return !k.krav || k.krav(v.kaffeTal); }
        var rest = KAFFE.filter(function (k) { return kan(k) && sete.indexOf(k.id) < 0; });
        if (!rest.length) {
            sete = [];
            rest = KAFFE.filter(kan);
        }
        var valgt = rest[Math.floor(Math.random() * rest.length)];
        sete.push(valgt.id);
        v.kaffe = sete;
        gem(v);
        return { post: valgt, tal: v.kaffeTal };
    }

    /* Linjer, der hver er hoejst maks bred. Lange replikker brydes, saa
       boblen ikke loeber ud over scenen. */
    var BOBLE_FONT = "700 17px 'Segoe UI', sans-serif";
    var BOBLE_MAKS = 360;
    var BOBLE_LINJE = 21;

    function bobleLinjer(ctx, tekst) {
        ctx.font = BOBLE_FONT;
        if (ctx.measureText(tekst).width <= BOBLE_MAKS) return [tekst];
        var ord = tekst.split(" "), linjer = [], nu = "";
        for (var i = 0; i < ord.length; i++) {
            var proev = nu ? nu + " " + ord[i] : ord[i];
            if (nu && ctx.measureText(proev).width > BOBLE_MAKS) { linjer.push(nu); nu = ord[i]; }
            else nu = proev;
        }
        if (nu) linjer.push(nu);
        return linjer;
    }

    /* Boblens hoejde, saa den kan tegnes opad fra halen */
    function bobleHoejde(ctx, tekst) {
        ctx.save();
        var n = bobleLinjer(ctx, tekst || "").length;
        ctx.restore();
        return 17 + n * BOBLE_LINJE;
    }

    /* Taleboble med hale ned mod (hx, hy). y er boblens overkant. */
    function tegnTaleboble(ctx, x, y, tekst, alfa, hx, hy) {
        if (alfa < 0.01 || !tekst) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(alfa, 0, 1);
        ctx.font = BOBLE_FONT;
        var linjer = bobleLinjer(ctx, tekst);
        var bred = 0;
        linjer.forEach(function (l) { bred = Math.max(bred, ctx.measureText(l).width); });
        var b = bred + 28, h = 17 + linjer.length * BOBLE_LINJE;
        var bx = NK.klamp(x - b / 2, 8, Math.max(8, NK.Scene.BREDDE - b - 8));
        ctx.fillStyle = "#fffdf6";
        ctx.strokeStyle = "#2a2f36";
        ctx.lineWidth = 2;
        NK.rundtRekt(ctx, bx, y, b, h, 12);
        ctx.fill();
        ctx.stroke();
        var hale = NK.klamp(hx, bx + 16, bx + b - 16);
        ctx.beginPath();
        ctx.moveTo(hale - 8, y + h - 1);
        ctx.lineTo(hx, hy);
        ctx.lineTo(hale + 8, y + h - 1);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(hale - 8, y + h);
        ctx.lineTo(hx, hy);
        ctx.lineTo(hale + 8, y + h);
        ctx.stroke();
        linjer.forEach(function (l, i) {
            NK.tekst(ctx, l, bx + b / 2, y + 9 + BOBLE_LINJE * (i + 0.5) + 1, { font: BOBLE_FONT, justering: "center", linje: "middle", farve: "#1f2328" });
        });
        ctx.restore();
    }

    /* Ansigtet: oejne, bryn, briller, mund og roedme tegnes i koden,
       saa udtrykket kan skifte. Tegnes i hovedets eget system. */
    function tegnAnsigt(ctx, L) {
        var i;
        var b = L.briller || 0, gy = b * 13;
        /* Roedme */
        if (L.roed > 0.02) {
            var g = ctx.createRadialGradient(55, 70, 10, 55, 66, 48);
            g.addColorStop(0, "rgba(225, 50, 40, " + (0.5 * L.roed).toFixed(3) + ")");
            g.addColorStop(1, "rgba(225, 50, 40, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(55, 66, 40, 50, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        /* Oejne: lukkede ved blink og suk; over brillerne kigger de op */
        var lukket = L.blink > 0 || (L.lukket || 0) > 0.4;
        for (i = 0; i < 2; i++) {
            var ox = i === 0 ? 37 : 73;
            if (lukket) {
                ctx.strokeStyle = "#2a2f36";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(ox - 4, 61);
                ctx.lineTo(ox + 4, 61);
                ctx.stroke();
            } else {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(ox, 61, 5.2, 4.2 - L.vrede * 1.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#2a2f36";
                ctx.beginPath();
                ctx.arc(ox + 1.5, 61.5 - b * 2.2, 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        /* Briller: glider ned ad naesen med b */
        ctx.strokeStyle = "#23272e";
        ctx.lineWidth = 2.4;
        ctx.fillStyle = "rgba(200, 230, 255, 0.12)";
        [37, 73].forEach(function (bx) {
            ctx.beginPath();
            ctx.arc(bx, 60 + gy, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(49, 59 + gy); ctx.quadraticCurveTo(55, 55 + gy, 61, 59 + gy);
        ctx.moveTo(25, 58 + gy); ctx.lineTo(15, 55 + gy * 0.4);
        ctx.moveTo(85, 58 + gy); ctx.lineTo(95, 55 + gy * 0.4);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(34, 56 + gy, 6, Math.PI * 1.1, Math.PI * 1.45);
        ctx.arc(70, 56 + gy, 6, Math.PI * 1.1, Math.PI * 1.45);
        ctx.stroke();
        /* Bryn: vrede saenker de inderste ender. Skeptisk: det hoejre bryn
           loeftes, og munden bliver skaev. Over brillerne loeftes begge */
        var v = L.vrede, hm = Math.max(0, L.humoer), sk = L.skeptisk || 0;
        ctx.strokeStyle = "#6d737a";
        ctx.lineWidth = 4.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(24, 42 + v * 1 - hm * 2 + sk * 2 - b * 3);
        ctx.lineTo(47, 42 + v * 8 - hm * 3 + sk * 2 - b * 3);
        ctx.moveTo(86, 42 + v * 1 - hm * 2 - sk * 11 - b * 3);
        ctx.lineTo(63, 42 + v * 8 - hm * 3 - sk * 7 - b * 3);
        ctx.stroke();
        /* Mund under overskaegget */
        var h = L.humoer;
        ctx.strokeStyle = "#7a3b2e";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(45, 98 - h * 2 + sk * 1.5);
        ctx.quadraticCurveTo(55, 98 + h * 7, 65, 98 - h * 2 - sk * 5);
        ctx.stroke();
        if (L.aaben > 0.05) {
            ctx.fillStyle = "#4a1f18";
            ctx.beginPath();
            ctx.ellipse(55, 99 + h * 2, 5.5, 1 + 4.5 * L.aaben, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ----- Kemichael i en tegneserierude ----------------------------------
       Tegneserien i hvert forsoeg kan sætte ham ind i en rude med
       K.tegneserieFigur(ctx, valg):

         x        hvor han staar i ruden
         gulv     gulvlinjen i ruden; han staar paa den
         skala    0,46 fylder han en rude paa 214 px i hoejden
         arm      armens vinkel, fx K.HAENGER eller 1,8 (toerrer op)
         udtryk   vrede, humoer, roed, skeptisk, briller, lukket
         haand(ctx, hd)  tegner det, han holder, fx koekkenrullen

       Han skal vaere hentet som sprite i forvejen, og det er han i alle
       forsoeg, hvor han er med. */
    function tegneserieFigur(ctx, valg) {
        valg = valg || {};
        var u = valg.udtryk || {};
        var L = {
            vrede: u.vrede === undefined ? 0.7 : u.vrede,
            humoer: u.humoer === undefined ? -0.4 : u.humoer,
            roed: u.roed || 0,
            skeptisk: u.skeptisk || 0,
            briller: u.briller || 0,
            lukket: u.lukket || 0,
            blink: 0, aaben: 0
        };
        var arm = valg.arm === undefined ? HAENGER : valg.arm;
        var skala = valg.skala === undefined ? 0.46 : valg.skala;
        ctx.save();
        ctx.translate(valg.x === undefined ? 150 : valg.x, valg.gulv === undefined ? 184 : valg.gulv);
        ctx.scale(skala, skala);
        /* Halsen ligger 232 enheder over gulvet: kroppens hoejde minus ankeret */
        var krop = { x: 0, y: -232, v: 0 };
        var sk = NK.tilVerden(krop, ANKER.laererKrop, 176, 58);
        var armPositur = { x: sk.x, y: sk.y, v: arm };
        var bag = Math.abs(arm) > 2;
        if (bag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, ANKER.laererArm);
        NK.Sprites.tegnPositur(ctx, "laererKrop", krop, ANKER.laererKrop);
        var hoved = { x: krop.x, y: krop.y + 14, v: 0 };
        NK.Sprites.tegnPositur(ctx, "laererHoved", hoved, ANKER.laererHoved);
        ctx.save();
        ctx.translate(hoved.x - ANKER.laererHoved.x, hoved.y - ANKER.laererHoved.y);
        tegnAnsigt(ctx, L);
        ctx.restore();
        if (!bag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, ANKER.laererArm);
        if (valg.haand) valg.haand(ctx, NK.tilVerden(armPositur, ANKER.laererArm, 28, 36));
        ctx.restore();
    }

    /* Kobler Kemichael paa forsoegets prototype */
    function paa(P, valg) {
        valg = valg || {};
        var S = NK.Scene;
        var r = NK.r;
        var kaffeX = valg.kaffeX === undefined ? 170 : valg.kaffeX;
        /* F58: koppen kan staa til hoejre for ham (ved plakaten), saa
           armen, der tager den, kan komme fra forsoeget */
        var kaffeArm = valg.kaffeArm || function () { return -0.5; };
        var fredet = (valg.fredet || []).concat("gaaUd");

        /* ----- De to planer: foran og bag bordet (S8) ---------------------
           Scenen siger med NK.Scene.BAGBORD ({ y, skala }), at laereren skal
           tale BAG bordet. Han bor der ikke: han er ude det meste af tiden
           og kommer kun ind, naar han har noget at sige. Saa gaar han ind
           bag bordet, standser dér, hvor der er plads i netop dette rum
           (laererPlads), peger og gaar ud igen. Kun oprydningen efter et
           uheld foregaar foran bordet (foran: true); kaffen, flasken i
           affaldet, kigget ind fra kanten og baggrundslivet sker bag
           bordet (F30).
           Uden BAGBORD er L.plan altid 0, og alt er som foer. */
        function bagValg() { return NK.Scene && NK.Scene.BAGBORD; }
        function bagSkala(bv) { return bv && bv.skala ? bv.skala : 0.82; }
        function kald(x, mig) { return typeof x === "function" ? x.call(mig) : x; }

        /* Ankeret maalt i figurens egen skala (som i en skaleret udstyrstype) */
        function ank(navn, k) {
            var a = S.ANKER[navn];
            return k === 1 ? a : { x: a.x * k, y: a.y * k };
        }

        /* Sandt, mens han staar bag bordet */
        P.laererBagBord = function () {
            var L = this.laerer;
            return !!(bagValg() && L && L.plan >= 0.5);
        };

        P.laererSkala = function () {
            var L = this.laerer;
            return L && L.skala ? L.skala : 1;
        };

        /* Enden af bordet, uden for scenen: vejen mellem de to planer gaar
           der, saa skiftet ikke ses. Der vaelges den ende, der giver den
           korteste vej hele vejen frem til maalet - ikke bare den
           naermeste - saa han ikke gaar hele bordet igennem to gange. */
        function endeMod(L, maal) {
            var v = -140, h = S.BREDDE + 140;
            var dv = Math.abs(L.x - v) + Math.abs(v - maal);
            var dh = Math.abs(L.x - h) + Math.abs(h - maal);
            return dv <= dh ? v : h;
        }

        function skiftPlan(p) {
            return { kald: function () { this.laerer.plan = p; } };
        }

        /* Ud af scenen: armen ned, hovedet lige og ud ad den kant, han er
           naermest. Naar han er ude, staar planet paa "bag bordet" igen, saa
           naeste replik kommer ind den rigtige vej (se opdaterLaerer). */
        function udTrin() {
            return [
                { arm: HAENGER, tid: 0.3 },
                { kald: function () { this.laerer.hovedMaal = 0; } },
                { gaa: UDE }
            ];
        }

        /* Om for enden og hen foran bordet (oprydning) */
        function foranTrin(tr) {
            return [
                { gaa: function () { var L = this.laerer; return L.plan > 0.5 ? endeMod(L, kald(tr.gaa, this)) : L.x; }, fart: 560 },
                skiftPlan(0),
                tr
            ];
        }

        /* mod er enten et x eller et punkt { x, y } paa bordet */
        function modPunkt(m, mig) {
            m = kald(m, mig);
            return (m && typeof m === "object") ? m : { x: m };
        }

        /* Gaa ind bag bordet, stands hvor der er plads, og peg derhen */
        function pegTrin(tr) {
            return [
                { gaa: function () { return this.laererPlads(modPunkt(tr.mod, this)); } },
                { kald: function () { this.laerer.hovedMaal = this.kigVinkel(modPunkt(tr.mod, this).x); } },
                { arm: function () { var m = modPunkt(tr.mod, this); return this.pegVinkel(m.x, m.y); }, tid: 0.45 }
            ];
        }

        /* En scene, der er skrevet til en mand foran bordet, laest om til
           en mand bag det. Alt uden gaa gaar igennem uroert, og et gaa
           uden mod og foran er stadig en almindelig gang bag bordet. */
        function omskrivBag(trin, bv) {
            var ud = [];
            trin.forEach(function (tr) {
                if (!tr || tr.gaa === undefined) { ud.push(tr); return; }
                if (tr.gaa === UDE) { ud.push.apply(ud, udTrin()); return; }
                if (tr.foran) { ud.push.apply(ud, foranTrin(tr)); return; }
                if (tr.mod !== undefined) { ud.push.apply(ud, pegTrin(tr)); return; }
                ud.push(tr);
            });
            return ud;
        }

        /* ----- Hvor der er plads --------------------------------------------
           Han standser ikke samme sted hver gang. Han gaar ind bag bordet og
           stopper dér, hvor der er plads i netop dette rum - saa taet paa
           det, han taler om, som han kan uden at stille sig bag noget, der
           skal kunne ses. Prisen er af samme slags som taleboblens: den
           haarde afgoer, den bloede skiller lige gode ad.

           Haard pris (han maa ikke staa der):
             * zoomboblen paa scenen - dér ville han vaere usynlig
             * plakaten og hylderne, som han tegnes hen over
             * det, der staar paa en hylde, som tegnes hen over ham
             * det, han lige nu peger paa (maal.rekt)
           Blod pris: hvor langt der er fra ham til det, han taler om.
           Gennemsigtigt glas paa bordpladen er ikke et problem (din
           beslutning 18/9 kl. 22.30), saa bade og bagerglas taeller ikke med.

           Er der ingen plads, der er helt fri, vaelges den, der gaar mindst
           paa kompromis - han skal et sted hen. */
        function raek(a, b) {
            return a && b && a.x < b.x + b.b && a.x + a.b > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        }

        function snitAreal(a, b) {
            if (!raek(a, b)) return 0;
            return (Math.min(a.x + a.b, b.x + b.b) - Math.max(a.x, b.x)) *
                   (Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        }

        /* Det, han ikke maa staa bag. Samles én gang pr. valg, for bordet
           kan have flyttet sig siden sidst. */
        P.laererOptagetAf = function () {
            var mig = this, ud = [];
            if (this.bobleRekt) {
                var br = this.bobleRekt();
                if (br) ud.push(br);
            }
            /* Plakaten (F59: maalene fra bord.plakatRekt) og uret (F57) */
            var pr = this.plakatRekt ? this.plakatRekt() : (this.plakat ? { x: this.plakat.x, y: this.plakat.y, b: 132, h: 128 } : null);
            if (pr) ud.push(pr);
            if (this.ur) ud.push({ x: this.ur.x - this.ur.r, y: this.ur.y - this.ur.r, b: 2 * this.ur.r, h: 2 * this.ur.r });
            var hylder = S.HYLDER || (S.HYLDE ? [S.HYLDE] : []);
            hylder.forEach(function (H) { ud.push({ x: H.x0, y: H.y, b: H.x1 - H.x0, h: 21 }); });
            /* Alt, der staar paa en hylde: det tegnes hen over ham */
            (this.liste || []).forEach(function (gg) {
                if (!mig.synlig(gg) || !gg.type) return;
                var r = mig.rekt(gg, 0);
                var paaHylde = hylder.some(function (H) {
                    return Math.abs(r.y + r.h - H.y) < 6 && r.x + r.b > H.x0 - 4 && r.x < H.x1 + 4;
                });
                if (paaHylde) ud.push(r);
            });
            return ud;
        };

        /* maal: { x, y } - det, han taler om. Giver et x bag bordet. */
        P.laererPlads = function (maal) {
            var bv = bagValg();
            if (!bv) return maal && maal.x !== undefined ? maal.x : this.laerer.x;
            var k = bagSkala(bv);
            var top = bv.y - 116 * k, h = Math.max(1, S.BORD - top);
            var undgaa = this.laererOptagetAf();
            /* Og ikke bag det, han lige nu peger paa (maal.rekt) */
            if (maal && maal.rekt) undgaa = undgaa.concat([maal.rekt]);
            var maalX = maal && maal.x !== undefined ? maal.x : S.BREDDE / 2;
            var x0 = 105 * k, x1 = S.BREDDE - 112 * k;
            var bedst = null;
            for (var x = x0; x <= x1 + 0.01; x += 10) {
                var r = { x: x - 105 * k, y: top, b: 217 * k, h: h };
                var haard = 0;
                for (var i = 0; i < undgaa.length; i++) haard += snitAreal(r, undgaa[i]);
                var bloed = Math.abs(x - maalX);
                if (!bedst || haard < bedst.haard - 1 || (haard <= bedst.haard + 1 && bloed < bedst.bloed)) {
                    bedst = { x: x, haard: haard, bloed: bloed };
                }
            }
            return bedst ? bedst.x : NK.klamp(maalX, x0, x1);
        };

        /* Vinklen, armen skal have for at pege paa et sted paa bordet.
           Armen drejer om skulderen, og dens retning ved vinklen v er
           (sin v, -cos v); derfor atan2(dx, -dy). */
        P.pegVinkel = function (x, y) {
            var sk = this.laererSkulder();
            /* Uden en hoejde sigtes der lidt over bordpladen, saa armen
               bliver naesten vandret og ikke forsvinder ned bag et glas */
            var dy = (y === undefined ? S.BORD - 120 : y) - sk.y;
            return Math.atan2(x - sk.x, -dy);
        };

        /* Hovedet drejer en smule den vej, han ser */
        P.kigVinkel = function (x) {
            return NK.klamp((x - this.laerer.x) / 900, -0.26, 0.26);
        };

        P.laererStart = function () {
            var bv = bagValg();
            this.laerer = {
                x: UDE, maalX: UDE,
                y: bv ? bv.y : Y_FORAN, plan: bv ? 1 : 0, skala: bv ? bagSkala(bv) : 1,
                loeb: false, fart: 0, gang: 0,
                scene: null,
                tale: "", taleUr: 0, taleAlfa: 0, taleLaengde: 0,
                vrede: 0.5, humoer: -0.5, roed: 0, skeptisk: 0, briller: 0, laen: 0,
                vredeMaal: 0.5, humoerMaal: -0.5, roedMaal: 0, skeptiskMaal: 0, brillerMaal: 0, laenMaal: 0,
                aaben: 0, blinkUr: 2, blink: 0, lukket: 0, nik: 0, damp: 0,
                arm: HAENGER, armFra: HAENGER, armTil: HAENGER,
                hovedV: 0, hovedMaal: 0, hovedDx: 0, hovedDy: 0,
                baerer: null, kopV: 0, kopFra: 0, klik: 0, plakatRegel: 0, rost: false,
                undgaa: null,
                dampe: []
            };
            if (this.laererStartEkstra) this.laererStartEkstra();
        };

        /* Kaldes fra nulstil(): en igangvaerende scene afbrydes. */
        P.laererNyt = function () {
            var L = this.laerer;
            if (!L) return;
            L.sceneUr = 0;
            if (L.scene) {
                L.scene = null;
                L.maalX = UDE;
                L.arm = HAENGER;
                L.plakatRegel = 0;
                L.skeptiskMaal = 0;
                L.brillerMaal = 0;
                L.laenMaal = 0;
            }
            /* Et nyt forsoeg tier han stille om, ogsaa selv om boblen stod
               uden en scene. Ellers kan den naeste replik ikke komme */
            L.tale = "";
            L.taleUr = 0;
            L.undgaa = null;
            L.hovedV = 0; L.hovedMaal = 0; L.hovedDx = 0; L.hovedDy = 0;
            L.lukket = 0;
            L.kopV = 0;
            /* Naeste replik kommer ind bag bordet */
            if (bagValg()) L.plan = 1;
            /* Nyt forsoeg: koppen staar paa hylden igen, saa paaskeaegget
               kan komme en gang til, og uheldene taelles forfra */
            uheldNu = 0;
            this.koppenVaek = false;
            if (this.g && this.g.kaffekop) {
                this.g.kaffekop.skjult = false;
                this.g.kaffekop.iHaand = false;
            }
            if (this.laererNytEkstra) this.laererNytEkstra();
        };

        /* Kan han ikke tegnes, saettes han tilbage til udgangspunktet og
           slipper bordet fri. Bedre en laerer, der lige var ude, end et
           forsoeg, der ikke kan bruges. */
        P.laererRed = function () {
            var L = this.laerer, bv = bagValg();
            if (!L) return;
            L.scene = null;
            L.sceneUr = 0;
            L.x = UDE; L.maalX = UDE;
            L.plan = bv ? 1 : 0;
            L.y = bv ? bv.y : Y_FORAN;
            L.skala = bv ? bagSkala(bv) : 1;
            L.arm = HAENGER; L.armFra = HAENGER; L.armTil = HAENGER;
            L.hovedV = 0; L.hovedMaal = 0; L.hovedDx = 0; L.hovedDy = 0;
            L.tale = ""; L.taleUr = 0; L.undgaa = null;
            L.dampe = [];
            if (window.console) window.console.warn("kemichael: figuren kunne ikke tegnes og er stillet tilbage");
            this.aendret("laerer");
        };

        P.laererOptaget = function () {
            var L = this.laerer;
            return !!(L && L.scene && L.scene.blokerer);
        };

        P.laererVisning = function () {
            return { plakatRegel: this.laerer ? this.laerer.plakatRegel : 0 };
        };

        /* En ny scene afbryder ikke en replik, der er i gang. Staar boblen
           endnu, begynder scenen med at vente, til han er talt faerdig. */
        P.laererKoer = function (navn, trin, blokerer) {
            var L = this.laerer;
            var bv = bagValg();
            if (bv) trin = omskrivBag(trin, bv);
            var rest = L && L.taleUr > 0 ? Math.min(L.taleUr, 3) : 0;
            L.scene = {
                navn: navn,
                trin: rest > 0 ? [{ tid: rest }].concat(trin) : trin,
                i: 0, t: 0,
                blokerer: blokerer !== false
            };
            L.sceneUr = 0;
            this.aendret("laerer");
        };

        /* Sandt, mens taleboblen staar */
        P.laererTaler = function () {
            return !!(this.laerer && this.laerer.taleUr > 0);
        };

        /* ----- Skulder og haand -------------------------------------------- */
        P.laererKrop = function () {
            var L = this.laerer;
            var k = L.skala || 1;
            var gaar = L.x !== L.maalX;
            var bob = gaar ? Math.abs(Math.sin(L.gang)) * -5 * k : 0;
            return { x: L.x, y: L.y + bob, v: (gaar ? Math.sin(L.gang) * 0.03 : 0) + L.laen * 0.04, k: k };
        };

        P.laererSkulder = function () {
            var krop = this.laererKrop(), k = krop.k;
            return NK.tilVerden(krop, ank("laererKrop", k), 176 * k, 58 * k);
        };

        P.laererHaand = function () {
            var sk = this.laererSkulder(), k = this.laererSkala();
            return NK.tilVerden({ x: sk.x, y: sk.y, v: this.laerer.arm }, ank("laererArm", k), 28 * k, 36 * k);
        };

        /* Hovedet og munden, saa fx kaffe kan sprutte det rigtige sted fra */
        P.laererHovedPositur = function () {
            var L = this.laerer, krop = this.laererKrop(), k = krop.k;
            return {
                x: krop.x + (L.hovedDx + L.laen * 10) * k,
                y: krop.y + (14 + L.nik + L.hovedDy) * k,
                v: krop.v + L.hovedV + L.laen * 0.18,
                k: k
            };
        };

        P.laererMund = function () {
            var hd = this.laererHovedPositur(), k = hd.k;
            return NK.tilVerden(hd, ank("laererHoved", k), 55 * k, 97 * k);
        };

        /* ----- Kaffen ------------------------------------------------------
           Koppen er hans. Hvad der sker, staar i KAFFE; her bygges scenen
           omkring posten: han kommer, tager (eller lader vaere), goer sit,
           og gaar med koppen eller stiller den tilbage. */
        function kaffeHjaelp(kop, tal) {
            return {
                tal: tal,
                glimt: glimt,
                sig: function (tekst, vis) {
                    if (!tekst) return [];
                    var t = vis || taleTid(tekst);
                    return [{ sig: tekst, vis: t, tid: t * 0.8 }];
                },
                udtryk: function (o) { return [{ udtryk: o }]; },
                vent: function (tid) { return [{ tid: tid }]; },
                suk: function (tid) { return [suk(tid)]; },
                /* Kaffen hentes bag bordet (F30): han kommer kun om foran
                   for at rydde op efter et uheld */
                gaa: function (x, loeb) { return [{ gaa: x, loeb: !!loeb }]; },
                grib: function () {
                    return [
                        { arm: kaffeArm, tid: 0.55 },
                        { kald: function () { kop.iHaand = true; this.laerer.baerer = "kaffekop"; } }
                    ];
                },
                drik: function (dybt) {
                    return [
                        { arm: -0.98, tid: 0.6 },
                        { kald: function () { if (NK.Lyd) NK.Lyd.slurk(); } },
                        { tid: dybt ? 1.5 : 0.9 },
                        { arm: -0.5, tid: 0.4 }
                    ];
                },
                vip: function (v, tid) {
                    return [
                        { kald: function () { this.laerer.kopFra = this.laerer.kopV || 0; } },
                        { tid: tid || 0.6, hver: function (t) {
                            this.laerer.kopV = NK.lerp(this.laerer.kopFra, v, NK.blod(t));
                        } }
                    ];
                },
                damp: function (tid) {
                    return [{ kald: function () { this.laerer.damp = tid || 1.5; if (NK.Lyd) NK.Lyd.brum(); } }];
                },
                sprut: function (antal, ned) {
                    return [{ kald: function () { this.laererSprut(antal, ned); } }];
                }
            };
        }

        P.klikKop = function () {
            var L = this.laerer, kop = this.g.kaffekop;
            if (L.scene || kop.skjult || L.taleUr > 0) return false;
            var valg = kaffeVariant();
            var post = valg.post;
            var h = kaffeHjaelp(kop, valg.tal);
            var griber = post.griber !== false;

            var trin = [{ udtryk: { vrede: 0.8, humoer: -0.6, roed: 0.1, skeptisk: 0, briller: 0, laen: 0 } }];
            trin = trin.concat(h.gaa(kaffeX, post.loeb), h.sig(post.sig));
            if (griber) trin = trin.concat(h.grib());
            trin = trin.concat(post.midte(h));

            if (griber && !post.beholder) {
                trin = trin.concat([
                    { kald: function () { kop.skjult = true; kop.iHaand = false; this.koppenVaek = true; } },
                    { arm: -0.3, tid: 0.4 }
                ]);
            } else if (griber) {
                trin = trin.concat([
                    { arm: kaffeArm, tid: 0.35 },
                    { kald: function () {
                        kop.iHaand = false;
                        this.laerer.baerer = null;
                        this.laerer.kopV = 0;
                        if (NK.Lyd && NK.Lyd.dunk) NK.Lyd.dunk();
                    } },
                    { arm: HAENGER, tid: 0.4 }
                ]);
            }
            trin = trin.concat([
                { udtryk: { skeptisk: 0, briller: 0, laen: 0 } },
                { taleFaerdig: true },
                { gaa: UDE, loeb: !!post.loeb },
                { kald: function () { this.laerer.baerer = null; this.laerer.kopV = 0; } }
            ]);
            this.laererKoer("kaffe", trin);
            return true;
        };

        /* Kaffe, der ryger ud af munden (eller ned ad kitlen) */
        P.laererSprut = function (antal, ned) {
            var L = this.laerer;
            var m = this.laererMund();
            for (var i = 0; i < (antal || 10); i++) {
                L.dampe.push({
                    x: m.x + r(-5, 5), y: m.y + r(-3, 3),
                    vx: ned ? r(-30, 30) : r(70, 230), vy: ned ? r(10, 60) : -r(20, 90),
                    r: r(2.6, 5.4), vokser: -1.4, tyngde: 620, liv: 1.3,
                    farve: "rgba(166, 118, 70, 0.92)"
                });
            }
            if (NK.Lyd) NK.Lyd.brum();
        };

        /* ----- Klik paa laereren ------------------------------------------ */
        /* Den plads, figuren fylder paa tegnebordet: { x, y, b, h }.
           Forneden slutter den ved gulvet - bag bordet ved bordets
           bagkant, fordi pladen daekker resten. */
        P.laererRekt = function () {
            var L = this.laerer;
            if (!L) return null;
            var k = L.skala || 1;
            var top = L.y - 116 * k;
            var bund = this.laererBagBord() ? S.BORD
                : (S.GULV === undefined ? S.HOEJDE + 40 : S.GULV);
            return { x: L.x - 105 * k, y: top, b: 217 * k, h: Math.max(0, bund - top) };
        };

        P.overLaerer = function (pt) {
            var L = this.laerer;
            if (!L || L.x < -100) return null;
            var r = this.laererRekt();
            if (pt.x > r.x && pt.x < r.x + r.b && pt.y > r.y && pt.y < r.y + r.h) return "laerer";
            return null;
        };

        /* S14: et klik paa taleboblen (ikke paa ham) springer videre. Linjen
           er sagt faerdig, det sig-trin, scenen staar i, afsluttes, og en
           kort pause mellem to linjer springes over, saa naeste linje kommer
           straks. Boblen er oeverste lag, saa bordets hvad spoerger den
           foer alt andet. Uden taleboble.js (de gamle animationer) er der
           ingen boble at ramme. */
        P.overLaererBoble = function (pt) {
            var L = this.laerer;
            if (!L || !L.tale || !(L.taleUr > 0) || !(L.taleAlfa > 0.3) || !NK.Taleboble || !NK.Taleboble.rammer) return false;
            return NK.Taleboble.rammer(pt);
        };

        P.springReplik = function () {
            var L = this.laerer;
            if (!L || !(L.taleUr > 0)) return false;
            L.taleUr = 0;
            var sc = L.scene;
            if (sc) {
                var tr = sc.trin[sc.i];
                if (tr && tr.sig && tr.startet) { sc.i++; sc.t = 0; }
                var nx = sc.trin[sc.i];
                if (nx && !nx.startet && Object.keys(nx).every(function (n) { return n === "tid"; })) { sc.i++; sc.t = 0; }
            }
            this.aendret("laerer");
            return true;
        };

        /* Fire prikker giver fire svar, det femte sender ham ud. Prikker
           midt i en replik gaar han ikke op i: han taler faerdig. */
        P.klikLaerer = function () {
            var L = this.laerer;
            if (!L || L.x < -100 || (L.scene && fredet.indexOf(L.scene.navn) >= 0)) return false;
            if (L.taleUr > 0) return false;
            L.klik++;
            L.vredeMaal = 1;
            L.humoerMaal = -1;
            /* Hvor meget han finder sig i, afhaenger af dagsformen */
            if (L.klik <= (dagen.taalmod || 4)) {
                var navn = L.klik === 1 ? glimt("navn") : null;
                var svar = navn || replik("prik" + Math.min(L.klik, 4));
                this.laererSig(svar, taleTid(svar), true);
                L.roedMaal = Math.min(1, 0.22 * L.klik);
                return true;
            }
            L.roedMaal = 1;
            L.damp = 3;
            if (NK.Lyd) NK.Lyd.brum();
            var farvel = replik("gaaUd");
            var blokerede = L.scene && L.scene.blokerer;
            this.laererKoer("gaaUd", [
                { sig: farvel, vis: taleTid(farvel), tid: 0.3 },
                { arm: HAENGER, tid: 0.3 },
                { tid: 0.8 },
                { taleFaerdig: true },
                { gaa: UDE }
            ], !!blokerede);
            return true;
        };

        /* Taleboblen staar 10 % laengere end den tid, scenen beder om, og
           aldrig kortere end det tager at laese linjen. */
        P.laererSig = function (tekst, vis, udenHistorik) {
            var L = this.laerer;
            /* S3: tallene i en replik laeses, naar den siges */
            if (NK.Vilkaar && NK.Vilkaar.udfyld) tekst = NK.Vilkaar.udfyld(tekst, this);
            /* S13: det, han siger, kan ogsaa lande et varigt sted. Siden
               bestemmer selv, hvilke scener der kommer med (side.js).
               Svarene paa en prik er aldrig med. */
            if (NK.vedReplik && !udenHistorik) NK.vedReplik(tekst, { hvem: "Kemichael", scene: L.scene ? L.scene.navn : "" });
            L.tale = tekst;
            L.taleUr = Math.max((vis || 2), taleTid(tekst)) * TALE_EKSTRA;
            L.taleLaengde = Math.min(2.2, 0.12 + tekst.length * 0.045);
            L.taleStart = this.tid;
            if (NK.Lyd) NK.Lyd.mumle(Math.max(1, Math.min(8, Math.round(tekst.length / 5))));
        };

        /* ----- Baggrundsliv -------------------------------------------------
           Har forsoeget staaet uroert laenge, sker der noget af sig selv:
           han gaar forbi med en kasse, eller han kigger ind og spoerger,
           om det staar stille. Begge dele viger, saa snart eleven roerer
           noget, og ingen af dem laaser forsoeget. */
        P.laererRolig = function () {
            if (this.travl && this.travl()) return false;
            if (this.handling || this.baerer) return false;
            if (this.laererOptaget && this.laererOptaget()) return false;
            return true;
        };

        P.laererBaggrundsliv = function () {
            var L = this.laerer;
            if (!L || !baggrundsliv) return;
            /* En scene, der er i gang, viger, saa snart eleven roerer noget */
            if (L.scene && L.scene.baggrund) {
                if (roerteSidst() > L.scene.startet) {
                    var bvV = bagValg();
                    L.scene = null;
                    L.maalX = bvV ? bvV.x : UDE;
                    L.baerer = null;
                    L.armTil = HAENGER;
                    L.arm = HAENGER;
                }
                return;
            }
            if (L.scene || L.x > UDE + 1) return;
            /* Ikke, mens fanen er skjult, eller en popup daekker scenen */
            if (window.document && document.visibilityState === "hidden") return;
            if (window.document && document.querySelector(".overlay.vis")) return;
            if (stille() < STILLE_FOERSTE || sidenBaggrund() < STILLE_IGEN) return;
            if (!this.laererRolig()) return;
            /* Turen med kassen er den mest paafaldende af de to, saa den
               kommer sjaeldnest */
            if (Math.random() < 0.25) this.laererForbi();
            else this.laererStilstand();
        };

        /* Markerer scenen som baggrundsliv, saa den viger for eleven */
        function baggrund(L) {
            L.scene.baggrund = true;
            L.scene.startet = roerteSidst();
            baggrundNu();
        }

        /* Han gaar tvaers over med en kasse og siger som regel ingenting.
           BAG bordet, hvor der er gulv nok - foran ville kassen og armen
           komme hen over glassene, og det er elevens plads. */
        P.laererForbi = function () {
            var sig = Math.random() < 0.4 ? [{ sig: replik("forbi"), vis: 2.4, tid: 0.3 }] : [];
            this.laererKoer("forbi", [
                { udtryk: { vrede: 0.3, humoer: -0.1, roed: 0, skeptisk: 0, briller: 0, laen: 0 } },
                { arm: 1.95, tid: 0.01 },
                { kald: function () { this.laerer.baerer = "kasse"; } },
                { gaa: 210, fart: 250 }
            ].concat(sig, [
                { gaa: function () { return S.BREDDE + 220; }, fart: 250 },
                { kald: function () { this.laerer.baerer = null; this.laerer.x = UDE; this.laerer.maalX = UDE; this.laerer.arm = HAENGER; } }
            ]), false);
            baggrund(this.laerer);
        };

        /* Han kigger ind fra kanten og spoerger, om det staar stille */
        P.laererStilstand = function () {
            this.laererKoer("stilstand", [
                { udtryk: { vrede: 0.3, humoer: -0.1, roed: 0, briller: 1, laen: 1 } },
                { gaa: KANT },
                { tid: 0.4 },
                { sig: replik("stilstand"), vis: 3.0, tid: 2.2 },
                { udtryk: { briller: 0, laen: 0 } },
                { taleFaerdig: true },
                { gaa: UDE }
            ], false);
            baggrund(this.laerer);
        };

        /* ----- Tidens gang ------------------------------------------------- */
        P.opdaterLaerer = function (dt) {
            var L = this.laerer;
            if (!L) return;
            var i;

            /* Scenen. En scene, der spaerrer bordet, faar en klokke paa:
               gaar noget i staa - et gaa-trin, der aldrig naar sit maal,
               fordi det, han skulle hen til, er vaek - slipper han bordet
               fri og gaar ud af sig selv. Eleven maa aldrig kunne sidde
               fast bag en laerer, der ikke kan tale faerdig. */
            if (L.scene) {
                L.sceneUr = (L.sceneUr || 0) + dt;
                if (L.sceneUr > SCENE_MAKS) {
                    L.scene = null;
                    L.sceneUr = 0;
                    L.maalX = UDE;
                    L.arm = HAENGER;
                    L.tale = "";
                    L.taleUr = 0;
                    if (bagValg()) L.plan = 1;
                    if (window.console) window.console.warn("kemichael: en scene blev haengende og er afbrudt");
                    this.aendret("laerer");
                }
            } else {
                L.sceneUr = 0;
            }
            var sc = L.scene, vagt = 0, rest = dt;
            while (sc && L.scene === sc && vagt++ < 30) {
                var tr = sc.trin[sc.i];
                if (!tr) { L.scene = null; this.aendret("laerer"); break; }
                if (tr.kald) { tr.kald.call(this); sc.i++; sc.t = 0; continue; }
                /* Vent, til taleboblen er faerdig, saa han ikke gaar fra
                   sin egen replik */
                if (tr.taleFaerdig) {
                    if (L.taleUr > 0) break;
                    sc.i++; sc.t = 0;
                    continue;
                }
                if (tr.udtryk) {
                    /* Dagsformen flytter ansigtet en smule i alle scener */
                    var u = tr.udtryk;
                    if (u.vrede !== undefined) L.vredeMaal = NK.klamp(u.vrede + (dagen.vrede || 0), 0, 1);
                    if (u.humoer !== undefined) L.humoerMaal = NK.klamp(u.humoer + (dagen.humoer || 0), -1, 1);
                    if (u.roed !== undefined) L.roedMaal = u.roed;
                    if (u.skeptisk !== undefined) L.skeptiskMaal = u.skeptisk;
                    if (u.briller !== undefined) L.brillerMaal = u.briller;
                    if (u.laen !== undefined) L.laenMaal = u.laen;
                    sc.i++; sc.t = 0;
                    continue;
                }
                if (!tr.startet) {
                    tr.startet = true;
                    if (tr.gaa !== undefined) { L.maalX = typeof tr.gaa === "function" ? tr.gaa.call(this) : tr.gaa; L.loeb = !!tr.loeb; L.fart = tr.fart || 0; }
                    if (tr.sig) this.laererSig(tr.sig, tr.vis);
                    if (tr.arm !== undefined) { L.armFra = L.arm; L.armTil = kald(tr.arm, this); }
                }
                sc.t += rest;
                rest = 0;
                var t = tr.tid ? Math.min(1, sc.t / tr.tid) : 1;
                if (tr.arm !== undefined) L.arm = NK.lerp(L.armFra, L.armTil, NK.blod(t));
                if (tr.hver) tr.hver.call(this, t);
                var klar = t >= 1;
                if (tr.gaa !== undefined) klar = Math.abs(L.x - L.maalX) < 1;
                if (!klar) break;
                sc.i++;
                sc.t = 0;
            }

            if (this.laererVentende) this.laererVentende();
            this.laererBaggrundsliv();

            /* Gang */
            var fart = L.loeb ? 820 : (L.fart || 430);
            if (L.x !== L.maalX) {
                var d = L.maalX - L.x;
                L.x += Math.sign(d) * Math.min(Math.abs(d), fart * dt);
                L.gang += dt * (L.loeb ? 16 : 10);
            }
            /* Planet afgoer, hvor hoejt han staar, og hvor stor han tegnes */
            var bvOp = bagValg();
            if (bvOp) {
                L.y = NK.lerp(Y_FORAN, bvOp.y, L.plan);
                L.skala = NK.lerp(1, bagSkala(bvOp), L.plan);
            }
            /* Ude af billedet falder han til ro - og naeste gang kommer han
               ind bag bordet igen, uanset hvor han gik ud */
            if (L.x <= UDE + 1 && !L.scene) {
                L.klik = 0; L.roedMaal = 0; L.damp = 0; L.brillerMaal = 0; L.laenMaal = 0;
                L.hovedMaal = 0;
                if (bvOp) L.plan = 1;
            }

            /* Udtryk, tale og blink */
            L.vrede = NK.mod(L.vrede, L.vredeMaal, 5, dt);
            L.humoer = NK.mod(L.humoer, L.humoerMaal, 5, dt);
            L.roed = NK.mod(L.roed, L.roedMaal, 3, dt);
            L.skeptisk = NK.mod(L.skeptisk, L.skeptiskMaal, 5, dt);
            L.briller = NK.mod(L.briller, L.brillerMaal, 6, dt);
            L.laen = NK.mod(L.laen, L.laenMaal, 6, dt);
            L.hovedV = NK.mod(L.hovedV, L.hovedMaal || 0, 5, dt);
            L.taleUr -= dt;
            L.taleAlfa = NK.mod(L.taleAlfa, L.taleUr > 0 ? 1 : 0, 12, dt);
            var taler = L.taleUr > 0 && this.tid - (L.taleStart || 0) < L.taleLaengde;
            L.aaben = NK.mod(L.aaben, taler ? 0.5 + 0.5 * Math.sin(this.tid * 22) : 0, 20, dt);
            L.blinkUr -= dt;
            if (L.blinkUr <= 0) { L.blink = 0.14; L.blinkUr = r(2, 5); }
            L.blink = Math.max(0, L.blink - dt);

            /* Damp af oererne */
            if (L.damp > 0) {
                L.damp -= dt;
                if (Math.random() < dt * 12) {
                    var hk = this.laererKrop();
                    var side = Math.random() < 0.5 ? -1 : 1;
                    L.dampe.push({ x: hk.x + side * 44 * hk.k, y: hk.y - 56 * hk.k, vx: side * r(20, 50), vy: -r(40, 80), r: r(4, 7) * hk.k, liv: 1 });
                }
            }
            /* Damp stiger og vokser; draaber (tyngde) falder og skrumper */
            for (i = L.dampe.length - 1; i >= 0; i--) {
                var dp = L.dampe[i];
                if (dp.tyngde) dp.vy += dp.tyngde * dt;
                dp.x += dp.vx * dt;
                dp.y += dp.vy * dt;
                dp.r = Math.max(0.4, dp.r + dt * (dp.vokser === undefined ? 10 : dp.vokser));
                dp.liv -= dt * (dp.tyngde ? 1.1 : 1.4);
                if (dp.liv <= 0) L.dampe.splice(i, 1);
            }

            if (this.opdaterLaererEkstra) this.opdaterLaererEkstra(dt);
        };

        /* ----- Tegning ----------------------------------------------------- */
        P.tegnAnsigt = function (ctx, L) { tegnAnsigt(ctx, L); };
        P.tegnBaaret = function (ctx, L) {
            if (!L.baerer) return;
            var hd = this.laererHaand(), k = L.skala || 1;
            if (L.baerer === "kaffekop") {
                NK.Sprites.tegnPositur(ctx, "kaffekop", { x: hd.x + 8 * k, y: hd.y + 26 * k, v: L.kopV || 0 }, ank("kaffekop", k), undefined, k);
            } else if (L.baerer === "kasse") {
                tegnKasse(ctx, hd.x + 2 * k, hd.y + 14 * k, k);
            } else if (this.tegnBaaretEkstra) {
                this.tegnBaaretEkstra(ctx, L, hd);
            }
        };

        /* Kroppen. Forneden slutter han ved gulvet: bag bordet er det
           bordets bagkant (pladen daekker underkroppen), ellers scenens
           gulv (S.GULV). Har scenen intet gulv - de gamle animationer -
           fortsaetter kitlen ned som foer. */
        P.tegnLaererKrop = function (ctx, tid, bag) {
            var L = this.laerer, i;
            if (L.x < UDE + 40 && !L.scene) return;
            /* Et tal, der ikke er et tal, skal ikke naa laerredet: en
               gradient eller en bue med NaN i kaster, og en ramme, der
               kaster, koster resten af tegningen. Sker det, stilles han
               tilbage til udgangspunktet i stedet. */
            if (!isFinite(L.x) || !isFinite(L.y) || !isFinite(L.arm) || !(L.skala > 0)) {
                this.laererRed();
                return;
            }
            var k = L.skala || 1;
            var aKrop = ank("laererKrop", k), aArm = ank("laererArm", k), aHoved = ank("laererHoved", k);
            var krop = this.laererKrop();
            var sk = this.laererSkulder();
            var armBag = Math.abs(L.arm) > 2;
            var armPositur = { x: sk.x, y: sk.y, v: L.arm };
            var gulv = bag ? S.BORD : S.GULV;

            ctx.save();
            if (gulv !== undefined) {
                ctx.beginPath();
                ctx.rect(-4000, -4000, 12000, gulv + 4000);
                ctx.clip();
            }

            if (armBag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, aArm, undefined, k);

            /* Kitlen fortsaetter ned under spritet, til gulvet */
            var kv = NK.tilVerden(krop, aKrop, 15 * k, 246 * k);
            var kh = NK.tilVerden(krop, aKrop, 205 * k, 246 * k);
            var ned = gulv === undefined ? 1500 : Math.max(0, gulv + 2 - kv.y);
            if (ned > 0) {
                var kg = ctx.createLinearGradient(kv.x, 0, kh.x, 0);
                kg.addColorStop(0, "#c9d2da");
                kg.addColorStop(0.3, "#f7f9fb");
                kg.addColorStop(0.7, "#eef2f5");
                kg.addColorStop(1, "#bcc6cf");
                ctx.fillStyle = kg;
                ctx.fillRect(kv.x, kv.y, kh.x - kv.x, ned);
                ctx.fillStyle = "#9aa6b1";
                ctx.fillRect(krop.x - 1 * k, kv.y, 2 * k, ned);
            }
            NK.Sprites.tegnPositur(ctx, "laererKrop", krop, aKrop, undefined, k);

            var ryst = L.taleUr > 0 ? Math.sin(tid * 9) * 0.05 * L.vrede * (L.humoer < 0 ? 1 : 0) : 0;
            var hoved = this.laererHovedPositur();
            hoved.v += ryst;
            NK.Sprites.tegnPositur(ctx, "laererHoved", hoved, aHoved, undefined, k);
            ctx.save();
            ctx.translate(hoved.x, hoved.y);
            ctx.rotate(hoved.v);
            if (k !== 1) ctx.scale(k, k);
            ctx.translate(-S.ANKER.laererHoved.x, -S.ANKER.laererHoved.y);
            this.tegnAnsigt(ctx, L);
            ctx.restore();

            if (!armBag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, aArm, undefined, k);
            this.tegnBaaret(ctx, L);

            for (i = 0; i < L.dampe.length; i++) {
                var d = L.dampe[i];
                ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * (d.farve ? 1 : 0.7);
                ctx.fillStyle = d.farve || "#f4f6f8";
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        /* Taleboblen som eget lag. Den holder sig fri af det, replikken
           handler om (L.undgaa), af zoomboblen paa scenen (F5) og af
           hylderne med det, der staar paa dem (F78). */
        P.tegnLaererBoble = function (ctx, tid) {
            var L = this.laerer;
            if (!L || !L.tale || !(L.taleAlfa > 0.01)) return;
            if (L.x < UDE + 40 && !L.scene) return;
            var k = L.skala || 1;
            if (NK.Taleboble) {
                var hoved = this.laererHovedPositur();
                var mund = this.laererMund();
                var isse = NK.tilVerden(hoved, ank("laererHoved", k), 55 * k, 0);
                var undgaa = [];
                if (L.undgaa && this.g && this.g[L.undgaa] && this.rekt) undgaa.push(this.rekt(this.g[L.undgaa], 8));
                /* F78: boblen daekker heller ikke hylderne og det, der staar
                   paa dem - saa laenge den stod hen over et pulverglas,
                   kunne kemikaliet hverken ses eller klikkes. Det er den
                   samme liste, han selv holder sig fri af. */
                if (this.laererOptagetAf) undgaa = undgaa.concat(this.laererOptagetAf());
                else if (this.bobleRekt) {
                    var br = this.bobleRekt();
                    if (br) undgaa.push(br);
                }
                /* Hovedspritet er 110 x 130 med munden 97 nede fra issen */
                NK.Taleboble.tegn(ctx, L.tale, L.taleAlfa, mund, {
                    hoved: { op: Math.max(20, mund.y - isse.y), side: 58 * k, ned: 36 * k },
                    undgaa: undgaa.length ? undgaa : null
                });
            } else {
                var krop = this.laererKrop();
                var top = krop.y - 118 * k;
                var bh = bobleHoejde(ctx, L.tale);
                tegnTaleboble(ctx, krop.x + 150 * k, top - 6 - bh, L.tale, L.taleAlfa, krop.x + 52 * k, top + 50 * k);
            }
        };

        /* Laget bag alt paa bordet: kun naar han staar der */
        P.tegnLaererBag = function (ctx, tid) {
            if (!this.laererBagBord()) return;
            this.tegnLaererKrop(ctx, tid, true);
        };

        /* Laget foran bordet. Bordet kalder med { udenBoble: true } og
           tegner selv boblen til sidst; en aeldre animation kalder uden
           valg og faar boblen med som foer. */
        P.tegnLaerer = function (ctx, tid, valg) {
            var L = this.laerer;
            if (!L) return;
            if (this.tegnLaererFoer) this.tegnLaererFoer(ctx, tid, L);
            if (!this.laererBagBord()) this.tegnLaererKrop(ctx, tid, false);
            if (!valg || !valg.udenBoble) this.tegnLaererBoble(ctx, tid);
        };
    }

    NK.Kemichael = {
        UDE: UDE,
        KANT: KANT,
        HAENGER: HAENGER,
        MAPPE: MAPPE,
        SPRITES: SPRITES,
        ANKER: ANKER,
        GLIMT: GLIMT,
        REPLIKKER: REPLIKKER,
        KAFFE: KAFFE,
        DAGSFORM: DAGSFORM,
        tegnTaleboble: tegnTaleboble,
        tegneserieFigur: tegneserieFigur,
        taleTid: taleTid,
        replik: replik,
        katalog: saetKatalog,
        katalogReplik: katalogReplik,
        katalogNu: function () { return katalog; },
        dagsform: dagsform,
        tid: tid,
        tidTvang: tidTvang,
        kaffeTvang: kaffeTvang,
        baggrundsliv: slaaBaggrundsliv,
        paa: paa,
        glimt: glimt,
        glimtTrin: glimtTrin,
        uheld: uheld,
        uheldIForsoeget: uheldIForsoeget,
        oprydningsTekst: oprydningsTekst,
        ros: ros,
        glimtNulstil: glimtNulstil,
        suk: suk
    };
}());
