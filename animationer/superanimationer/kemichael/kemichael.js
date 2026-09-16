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
     kaffeX   hvor laereren stiller sig, naar kaffen hentes
     fredet   scener, som et klik paa laereren ikke afbryder

   Figuren kommer ind fra venstre, foran bordet. Hovedet er et sprite
   uden ansigt; oejne, bryn, briller, mund og roedme tegnes her, saa
   udtrykket kan skifte. Armen er et eget sprite, der drejer om skulderen.

   Laereren optraeder i smaa scener (laererKoer): en liste af trin, der
   koeres efter hinanden.
     { gaa: x, loeb }       gaa (eller loeb) hen til x; x kan vaere en funktion.
                            K.UDE er uden for scenen, K.KANT lige inde ved kanten
     { sig: tekst, vis }    taleboble i vis sekunder
     { arm: vinkel, tid }   drej armen om skulderen
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

   Replikker:
     K.replik(kategori)        en vending fra puljen REPLIKKER, som ikke er
                               brugt for nylig (ros, uheld, advarsel, prik1-4)
     K.replik(navn, liste)     det samme med forsoegets egen liste

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
            "Var der noget fagligt?"
        ],
        prik2: [
            "Jeg har travlt.",
            "Det bliver ikke rigtigere af at gentage det.",
            "Forsøget står stadig derovre.",
            "Ja. Stadig mig.",
            "Prøv at prikke til opgaven i stedet.",
            "Jeg har 28 elever. Du er lige nu alle 28."
        ],
        prik3: [
            "Lad være med det.",
            "Nu stopper du.",
            "Det her fører ingen steder hen.",
            "Jeg tæller også det her.",
            "Der er en grænse. Den er tæt på.",
            "Hænderne til dig selv. Også i et forsøg."
        ],
        prik4: [
            "Nej.",
            "Så er det nok.",
            "Færdig.",
            "Jeg har set det før. Det blev ikke sjovere.",
            "Godt. Så gør vi det på den anden måde.",
            "Det står i regnskabet."
        ],
        gaaUd: [
            "Nu går jeg.",
            "Så går jeg. Det er også en reaktion.",
            "Jeg er i forberedelsen.",
            "Farvel. Forsøget står der stadig."
        ],
        /* Faelles puljer, som forsoegene kan bruge med K.replik(kategori) */
        ros: [
            "Fint arbejde.",
            "Det var rigtigt. Det sker.",
            "Godt. Skriv det ned, før du glemmer det.",
            "Sådan. Næsten som i bogen.",
            "Det holder. Også i morgen."
        ],
        uheld: [
            "Det var ikke meningen. Det er de færreste uheld.",
            "Jeg henter køkkenrullen. Igen.",
            "Sådan lærer man det også. Bare langsommere.",
            "Det står i regnskabet.",
            "Vi kalder det en observation."
        ],
        advarsel: [
            "Læs etiketten, før du hælder.",
            "Lidt ad gangen. Altid lidt ad gangen.",
            "Det står på plakaten. Den hænger der stadig.",
            "Briller på. De er ikke pynt."
        ]
    };

    /* Replikker, der er brugt i denne sidevisning, pr. kategori */
    var brugte = {};

    function replik(kategori, liste) {
        liste = liste || REPLIKKER[kategori];
        if (!liste || !liste.length) return "";
        var set = brugte[kategori] || (brugte[kategori] = []);
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
        regnskab3:  "Tredje uheld på den her computer. Det står i regnskabet.",
        regnskab6:  "Seks uheld på den her computer. Regnskabet har fået en mappe.",
        regnskab10: "Ti uheld. Regnskabet har fået sit eget ringbind."
    };
    var REGNSKAB = [
        { antal: 10, id: "regnskab10" },
        { antal: 6, id: "regnskab6" },
        { antal: 3, id: "regnskab3" }
    ];

    var LAGER = "nk-kemichael";
    var hukommelse = { sete: [], uheld: 0, kaffe: [], kaffeTal: 0 };
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

    function uheld() {
        var v = hent();
        v.uheld = (v.uheld || 0) + 1;
        gem(v);
        for (var i = 0; i < REGNSKAB.length; i++) {
            if (v.uheld >= REGNSKAB[i].antal) return v.sete.indexOf(REGNSKAB[i].id) >= 0 ? [] : glimtTrin(REGNSKAB[i].id);
        }
        return [];
    }

    function glimtNulstil() {
        gem({ sete: [], uheld: 0, kaffe: [], kaffeTal: 0 });
        glimtVist = false;
        brugte = {};
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
                return h.udtryk({ vrede: 0.2, humoer: 0.5 }).concat(
                    h.vent(0.5), h.sig("Ikke nu. På fredag er der kage."),
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

    /* Kobler Kemichael paa forsoegets prototype */
    function paa(P, valg) {
        valg = valg || {};
        var S = NK.Scene;
        var r = NK.r;
        var kaffeX = valg.kaffeX === undefined ? 170 : valg.kaffeX;
        var fredet = (valg.fredet || []).concat("gaaUd");

        P.laererStart = function () {
            this.laerer = {
                x: UDE, maalX: UDE, y: 392, loeb: false, gang: 0,
                scene: null,
                tale: "", taleUr: 0, taleAlfa: 0, taleLaengde: 0,
                vrede: 0.5, humoer: -0.5, roed: 0, skeptisk: 0, briller: 0, laen: 0,
                vredeMaal: 0.5, humoerMaal: -0.5, roedMaal: 0, skeptiskMaal: 0, brillerMaal: 0, laenMaal: 0,
                aaben: 0, blinkUr: 2, blink: 0, lukket: 0, nik: 0, damp: 0,
                arm: HAENGER, armFra: HAENGER, armTil: HAENGER,
                hovedV: 0, hovedDx: 0, hovedDy: 0,
                baerer: null, kopV: 0, kopFra: 0, klik: 0, plakatRegel: 0, rost: false,
                dampe: []
            };
            if (this.laererStartEkstra) this.laererStartEkstra();
        };

        /* Kaldes fra nulstil(): en igangvaerende scene afbrydes. */
        P.laererNyt = function () {
            var L = this.laerer;
            if (!L) return;
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
            L.hovedV = 0; L.hovedDx = 0; L.hovedDy = 0;
            L.lukket = 0;
            L.kopV = 0;
            /* Nyt forsoeg: koppen staar paa hylden igen, saa paaskeaegget
               kan komme en gang til */
            this.koppenVaek = false;
            if (this.g && this.g.kaffekop) {
                this.g.kaffekop.skjult = false;
                this.g.kaffekop.iHaand = false;
            }
            if (this.laererNytEkstra) this.laererNytEkstra();
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
            var rest = L && L.taleUr > 0 ? Math.min(L.taleUr, 3) : 0;
            L.scene = {
                navn: navn,
                trin: rest > 0 ? [{ tid: rest }].concat(trin) : trin,
                i: 0, t: 0,
                blokerer: blokerer !== false
            };
            this.aendret("laerer");
        };

        /* Sandt, mens taleboblen staar */
        P.laererTaler = function () {
            return !!(this.laerer && this.laerer.taleUr > 0);
        };

        /* ----- Skulder og haand -------------------------------------------- */
        P.laererKrop = function () {
            var L = this.laerer;
            var gaar = L.x !== L.maalX;
            var bob = gaar ? Math.abs(Math.sin(L.gang)) * -5 : 0;
            return { x: L.x, y: L.y + bob, v: (gaar ? Math.sin(L.gang) * 0.03 : 0) + L.laen * 0.04 };
        };

        P.laererSkulder = function () {
            return NK.tilVerden(this.laererKrop(), S.ANKER.laererKrop, 176, 58);
        };

        P.laererHaand = function () {
            var sk = this.laererSkulder();
            return NK.tilVerden({ x: sk.x, y: sk.y, v: this.laerer.arm }, S.ANKER.laererArm, 28, 36);
        };

        /* Hovedet og munden, saa fx kaffe kan sprutte det rigtige sted fra */
        P.laererHovedPositur = function () {
            var L = this.laerer, krop = this.laererKrop();
            return {
                x: krop.x + L.hovedDx + L.laen * 10,
                y: krop.y + 14 + L.nik + L.hovedDy,
                v: krop.v + L.hovedV + L.laen * 0.18
            };
        };

        P.laererMund = function () {
            return NK.tilVerden(this.laererHovedPositur(), S.ANKER.laererHoved, 55, 97);
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
                gaa: function (x, loeb) { return [{ gaa: x, loeb: !!loeb }]; },
                grib: function () {
                    return [
                        { arm: -0.5, tid: 0.55 },
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
                    { arm: -0.5, tid: 0.35 },
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
        P.overLaerer = function (pt) {
            var L = this.laerer;
            if (!L || L.x < -100) return null;
            if (pt.x > L.x - 105 && pt.x < L.x + 112 && pt.y > L.y - 116 && pt.y < S.HOEJDE + 40) return "laerer";
            return null;
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
            if (L.klik <= 4) {
                var navn = L.klik === 1 ? glimt("navn") : null;
                var svar = navn || replik("prik" + L.klik);
                this.laererSig(svar, taleTid(svar));
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
        P.laererSig = function (tekst, vis) {
            var L = this.laerer;
            L.tale = tekst;
            L.taleUr = Math.max((vis || 2), taleTid(tekst)) * TALE_EKSTRA;
            L.taleLaengde = Math.min(2.2, 0.12 + tekst.length * 0.045);
            L.taleStart = this.tid;
            if (NK.Lyd) NK.Lyd.mumle(Math.max(1, Math.min(8, Math.round(tekst.length / 5))));
        };

        /* ----- Tidens gang ------------------------------------------------- */
        P.opdaterLaerer = function (dt) {
            var L = this.laerer;
            if (!L) return;
            var i;

            /* Scenen */
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
                    var u = tr.udtryk;
                    if (u.vrede !== undefined) L.vredeMaal = u.vrede;
                    if (u.humoer !== undefined) L.humoerMaal = u.humoer;
                    if (u.roed !== undefined) L.roedMaal = u.roed;
                    if (u.skeptisk !== undefined) L.skeptiskMaal = u.skeptisk;
                    if (u.briller !== undefined) L.brillerMaal = u.briller;
                    if (u.laen !== undefined) L.laenMaal = u.laen;
                    sc.i++; sc.t = 0;
                    continue;
                }
                if (!tr.startet) {
                    tr.startet = true;
                    if (tr.gaa !== undefined) { L.maalX = typeof tr.gaa === "function" ? tr.gaa.call(this) : tr.gaa; L.loeb = !!tr.loeb; }
                    if (tr.sig) this.laererSig(tr.sig, tr.vis);
                    if (tr.arm !== undefined) { L.armFra = L.arm; L.armTil = tr.arm; }
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

            /* Gang */
            var fart = L.loeb ? 820 : 430;
            if (L.x !== L.maalX) {
                var d = L.maalX - L.x;
                L.x += Math.sign(d) * Math.min(Math.abs(d), fart * dt);
                L.gang += dt * (L.loeb ? 16 : 10);
            }
            if (L.x <= UDE + 1 && !L.scene) { L.klik = 0; L.roedMaal = 0; L.damp = 0; L.brillerMaal = 0; L.laenMaal = 0; }

            /* Udtryk, tale og blink */
            L.vrede = NK.mod(L.vrede, L.vredeMaal, 5, dt);
            L.humoer = NK.mod(L.humoer, L.humoerMaal, 5, dt);
            L.roed = NK.mod(L.roed, L.roedMaal, 3, dt);
            L.skeptisk = NK.mod(L.skeptisk, L.skeptiskMaal, 5, dt);
            L.briller = NK.mod(L.briller, L.brillerMaal, 6, dt);
            L.laen = NK.mod(L.laen, L.laenMaal, 6, dt);
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
                    L.dampe.push({ x: hk.x + side * 44, y: hk.y - 56, vx: side * r(20, 50), vy: -r(40, 80), r: r(4, 7), liv: 1 });
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
        P.tegnAnsigt = function (ctx, L) {
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
        };

        P.tegnBaaret = function (ctx, L) {
            if (!L.baerer) return;
            var hd = this.laererHaand();
            if (L.baerer === "kaffekop") {
                NK.Sprites.tegnPositur(ctx, "kaffekop", { x: hd.x + 8, y: hd.y + 26, v: L.kopV || 0 }, S.ANKER.kaffekop);
            } else if (this.tegnBaaretEkstra) {
                this.tegnBaaretEkstra(ctx, L, hd);
            }
        };

        P.tegnLaerer = function (ctx, tid) {
            var L = this.laerer;
            if (!L) return;
            var i;
            if (this.tegnLaererFoer) this.tegnLaererFoer(ctx, tid, L);
            if (L.x < UDE + 40 && !L.scene) return;
            var krop = this.laererKrop();
            var sk = this.laererSkulder();
            var armBag = Math.abs(L.arm) > 2;
            var armPositur = { x: sk.x, y: sk.y, v: L.arm };

            if (armBag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, S.ANKER.laererArm);

            /* Kitlen fortsaetter ned under spritet, saa den ikke slutter
               midt paa en bred skaerm */
            var kv = NK.tilVerden(krop, S.ANKER.laererKrop, 15, 246);
            var kh = NK.tilVerden(krop, S.ANKER.laererKrop, 205, 246);
            var kg = ctx.createLinearGradient(kv.x, 0, kh.x, 0);
            kg.addColorStop(0, "#c9d2da");
            kg.addColorStop(0.3, "#f7f9fb");
            kg.addColorStop(0.7, "#eef2f5");
            kg.addColorStop(1, "#bcc6cf");
            ctx.fillStyle = kg;
            ctx.fillRect(kv.x, kv.y, kh.x - kv.x, 1500);
            ctx.fillStyle = "#9aa6b1";
            ctx.fillRect(krop.x - 1, kv.y, 2, 1500);
            NK.Sprites.tegnPositur(ctx, "laererKrop", krop, S.ANKER.laererKrop);

            var ryst = L.taleUr > 0 ? Math.sin(tid * 9) * 0.05 * L.vrede * (L.humoer < 0 ? 1 : 0) : 0;
            var hoved = this.laererHovedPositur();
            hoved.v += ryst;
            NK.Sprites.tegnPositur(ctx, "laererHoved", hoved, S.ANKER.laererHoved);
            ctx.save();
            ctx.translate(hoved.x, hoved.y);
            ctx.rotate(hoved.v);
            ctx.translate(-S.ANKER.laererHoved.x, -S.ANKER.laererHoved.y);
            this.tegnAnsigt(ctx, L);
            ctx.restore();

            if (!armBag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, S.ANKER.laererArm);
            this.tegnBaaret(ctx, L);

            ctx.save();
            for (i = 0; i < L.dampe.length; i++) {
                var d = L.dampe[i];
                ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * (d.farve ? 1 : 0.7);
                ctx.fillStyle = d.farve || "#f4f6f8";
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            var top = krop.y - 118;
            var bh = bobleHoejde(ctx, L.tale);
            tegnTaleboble(ctx, krop.x + 150, top - 6 - bh, L.tale, L.taleAlfa, krop.x + 52, top + 50);
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
        tegnTaleboble: tegnTaleboble,
        taleTid: taleTid,
        replik: replik,
        kaffeTvang: kaffeTvang,
        paa: paa,
        glimt: glimt,
        glimtTrin: glimtTrin,
        uheld: uheld,
        glimtNulstil: glimtNulstil,
        suk: suk
    };
}());
