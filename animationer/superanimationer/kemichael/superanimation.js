/* =====================================================================
   superanimation.js - Kemichael i superanimationerne

   Figuren staar i ../../v2/kemichael/kemichael.js, som er frosset og
   ikke rettes. Denne fil laegger sig oven paa den i alle superanimationer
   og indlaeses lige efter den:

     <script src="../../v2/kemichael/kemichael.js"></script>
     <script src="../kemichael/superanimation.js"></script>

   Her er han en, man helst undgaar: han siger ikke noget uopfordret og
   kommer kun, naar noget kalder paa ham (praesentationen, et maal, der
   er naaet, et paaskeaeg, et prik eller hans kaffe). Derfor:

     * Intet baggrundsliv. Han kommer ikke forbi med en kasse eller
       kigger ind, fordi eleven ikke har roert noget i et stykke tid.
     * Kaffen (KAFFE) er skiftet ud: de forloeb, der var soegte, er
       vaek, og der er kommet nye til. Han passer paa sin kop.
     * Svarene paa et prik og replikken, naar han gaar, er kortere.
     * Han taler altid formelt, i hele saetninger som i Kemibogen
       (brugerens oenske 4. nov. 2026): kaffen, prik, farvel, glimtene
       og dagsformen er skrevet om her, og den frosne fil roeres ikke.

   Brugerens oenske 25. sept. 2026. Nye kaffeforloeb skrives her, ikke
   i den frosne fil. Formatet for en post (h.sig, h.drik, h.vip ...)
   staar over KAFFE i kemichael.js.
   ===================================================================== */
(function () {
    "use strict";

    var K = window.NK && window.NK.Kemichael;
    if (!K) return;

    /* Ingen besoeg, fordi eleven har ventet */
    K.baggrundsliv(false);

    /* ----- Kaffen --------------------------------------------------------
       Klik paa koppen. En post vises ad gangen og gentages foerst, naar
       de alle er set (huskes i browseren). */
    var KAFFE = [
        {
            id: "kold",
            sig: "Det er min kaffe.",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.2, humoer: -0.3, roed: 0 }), h.vent(0.4), h.suk(1.1),
                    h.sig(h.glimt("kaffeKold") || "Kaffen er kold. Det er den altid.")
                );
            }
        },
        {
            id: "varm",
            sig: "Det er min kaffe.",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.9, humoer: -0.7, roed: 1 }), h.damp(1.6), h.vent(0.9),
                    h.sig("Kaffen var varm. Det sker én gang om året."),
                    h.udtryk({ roed: 0.2 })
                );
            }
        },
        {
            id: "tom",
            midte: function (h) {
                return h.vip(-2.4, 0.7).concat(
                    h.vent(1.1), h.udtryk({ humoer: -0.8, skeptisk: 0.8, briller: 1 }), h.vip(0, 0.4),
                    h.sig("Koppen er tom, og jeg har ikke selv drukket kaffen."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "ud",
            sig: "Der drikkes ikke i laboratoriet.",
            midte: function (h) {
                return h.gaa(-40).concat(
                    h.drik(true), h.udtryk({ vrede: 0.1, humoer: 0.6, roed: 0 }),
                    h.sig(h.glimt("kaffePause") || "Uden for døren er det en pause. Dér må man gerne drikke kaffe.")
                );
            }
        },
        {
            id: "stirrer",
            griber: false,
            beholder: true,
            midte: function (h) {
                return h.udtryk({ vrede: 0.6, humoer: -0.5, briller: 1, laen: 0.7 }).concat(
                    h.vent(2.4), h.sig("Ja, det er min kaffe."), h.vent(0.3),
                    h.udtryk({ briller: 0, laen: 0 })
                );
            }
        },
        {
            id: "glasstav",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.7, humoer: -0.6, skeptisk: 1, briller: 1 }), h.vent(0.5),
                    h.sig("Nogen har rørt i min kaffe med en glasstav."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "ligevaegt",
            midte: function (h) {
                return h.drik().concat(
                    h.vent(0.4), h.sig("Kaffen har nået rumtemperatur. Det er også en ligevægt.")
                );
            }
        },
        {
            id: "regnskab",
            krav: function (tal) { return tal >= 3; },
            sig: "Du har fat i min kaffe igen.",
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
                    h.sig("Kaffen har stået her siden i morges."), h.udtryk({ roed: 0.2 })
                );
            }
        },
        {
            id: "kaktus",
            sig: "Resten af kaffen får Bunsen.",
            midte: function (h) {
                return h.vip(-1.9, 0.6).concat(
                    h.sprut(10, true), h.vent(0.7), h.vip(0, 0.4),
                    h.sig(h.glimt("kaktus") || "Bunsen er en kaktus, så han kan tåle det.")
                );
            }
        },
        {
            id: "kittel",
            midte: function (h) {
                return h.drik().concat(
                    h.sprut(8, true), h.udtryk({ vrede: 0.8, humoer: -0.9, roed: 0.4 }), h.suk(1.2),
                    h.sig(h.glimt("kittel") || "Nu er der kaffe på kitlen igen.")
                );
            }
        },
        {
            id: "gave",
            midte: function (h) {
                return h.vent(0.6).concat(
                    h.udtryk({ vrede: 0.2, humoer: 0.3 }),
                    h.sig(h.glimt("gave") || "Koppen var en gave fra en klasse, og den er blevet her siden."),
                    h.drik()
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
            sig: "Nej, det er min kaffe.",
            midte: function (h) {
                return h.vent(0.3);
            }
        },
        {
            id: "tilbud",
            sig: "Vil du smage?",
            midte: function (h) {
                return h.vent(0.7).concat(
                    h.udtryk({ vrede: 0.7, humoer: -0.6 }), h.sig("Nej, det vil du ikke."), h.drik()
                );
            }
        },
        {
            id: "maalt",
            midte: function (h) {
                return [{ arm: -0.75, tid: 0.6 }].concat(
                    h.udtryk({ briller: 1, skeptisk: 0.6 }), h.vent(0.8),
                    h.sig("Der mangler 20 mL. Jeg målte den i morges."),
                    h.udtryk({ briller: 0, skeptisk: 0 })
                );
            }
        },
        /* Nye 25. sept. 2026 */
        {
            id: "fortyndet",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.6, humoer: -0.5, skeptisk: 1, briller: 1 }), h.vent(0.6),
                    h.sig("Nogen har fortyndet min kaffe."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "fingeraftryk",
            midte: function (h) {
                return [{ arm: -0.75, tid: 0.6 }].concat(
                    h.udtryk({ vrede: 0.5, skeptisk: 0.8, briller: 1 }), h.vent(1),
                    h.sig("Der er fingeraftryk på koppen. Den skal til analyse."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "bundfald",
            midte: function (h) {
                return h.vip(-0.7, 0.5).concat(
                    h.udtryk({ briller: 1 }), h.vent(0.9), h.vip(0, 0.3), h.drik(),
                    h.sig("Der er bundfald i kaffen. Det er der altid."),
                    h.udtryk({ briller: 0 })
                );
            }
        },
        {
            id: "stinkskab",
            midte: function (h) {
                return h.udtryk({ vrede: 0.5, skeptisk: 0.6 }).concat(
                    h.vent(0.3), h.sig("Koppen står i stinkskabet fra nu af."),
                    h.udtryk({ skeptisk: 0 })
                );
            }
        },
        {
            id: "faremaerke",
            griber: false,
            beholder: true,
            midte: function (h) {
                return h.udtryk({ vrede: 0.5, humoer: -0.4, briller: 1 }).concat(
                    h.vent(0.8), h.sig("Den kop skal have et faremærke."),
                    h.udtryk({ briller: 0 })
                );
            }
        },
        {
            id: "navn",
            midte: function (h) {
                return [{ arm: -0.75, tid: 0.6 }].concat(
                    h.udtryk({ vrede: 0.2, humoer: 0.3, briller: 1 }), h.vent(0.4),
                    h.sig("Koppen har mit navn på. Der står BEDSTE LÆRER."),
                    h.udtryk({ briller: 0 })
                );
            }
        },
        {
            /* Han tager den og gaar. Ingen ord. */
            id: "tager",
            midte: function (h) {
                return h.udtryk({ vrede: 0.6, humoer: -0.5, skeptisk: 0.7, briller: 1 }).concat(
                    h.vent(1.2), h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        }
    ];
    K.KAFFE.length = 0;
    Array.prototype.push.apply(K.KAFFE, KAFFE);

    /* ----- Prik og farvel -----------------------------------------------
       Brugerens regel 4. nov. 2026: Kemichael taler altid formelt, i hele
       saetninger som i Kemibogen. Toerheden maa gerne blive. */
    var R = K.REPLIKKER;
    R.prik1 = [
        "Ja, hvad kan jeg hjælpe med?",
        "Hvad drejer det sig om?",
        "Jeg er midt i noget andet lige nu.",
        "Jeg er ikke en knap.",
        "Har du et fagligt spørgsmål?",
        "Spørg gerne din sidemand først."
    ];
    R.prik2 = [
        "Jeg har travlt lige nu.",
        "Ja, det er stadig mig.",
        "Opgaven står på kortet.",
        "Prøv at klikke på opgaven i stedet.",
        "Jeg har 28 elever, og lige nu er du alle 28.",
        "Det er anden gang. Det er én gang mere, end der var brug for.",
        "Jeg er ikke en dørklokke."
    ];
    R.prik3 = [
        "Vær venlig at lade være med det.",
        "Nu må du stoppe.",
        "Jeg tæller også det her.",
        "Tre gange er en tendens.",
        "Der er en grænse, og den er tæt på.",
        "Jeg skriver det ikke ned, men jeg husker det."
    ];
    R.prik4 = [
        "Nej, nu er det nok.",
        "Det her kommer i regnskabet.",
        "Det er fjerde gang, så jeg går om lidt.",
        "Jeg har set det før, og det blev ikke sjovere."
    ];
    R.gaaUd = [
        "Nu går jeg.",
        "Jeg er i forberedelseslokalet, hvis der er noget fagligt.",
        "Jeg går nu. Rør ikke min kaffe.",
        "Jeg er på lærerværelset. Der er ingen, der prikker til mig."
    ];

    /* Faelles puljer, som nogle animationer bruger med K.replik */
    R.ros = [
        "Det var fint arbejde.",
        "Svaret er rigtigt. Skriv det ned, før du glemmer det.",
        "Sådan står det også i bogen.",
        "Det er præcist, og du gjorde det selv.",
        "Ja, det er sådan, det skal se ud."
    ];
    R.uheld = [
        "Det var ikke meningen, men det er de færreste uheld.",
        "Jeg henter køkkenrullen igen.",
        "Sådan lærer man det også, bare langsommere.",
        "Det kommer i regnskabet.",
        "Vi kalder det en observation.",
        "Det er derfor, der er bordplade og ikke gulvtæppe.",
        "Vi har alle hældt ved siden af. Nogle af os gjorde det i 1994."
    ];

    /* ----- Glimtene af hans baggrund ------------------------------------ */
    var G = K.GLIMT;
    G.navn = "Jeg hedder Michael, ikke Kemichael.";
    G.kaffeKold = "Kaffen er kold. Det er den altid.";
    G.kaffePause = "Uden for døren er det en pause. Dér må man gerne drikke kaffe.";
    G.oejenbryn = "Jeg prøvede selv noget lignende i 1994. Spørg mine øjenbryn.";
    G.dab = "Det lærte jeg af en elev i 1.g i 2016.";
    G.stroem = "Strømmen bliver betalt af kaffebudgettet.";
    G.titrering = "Min første titrering gav et udbytte på 140 %. Det blev en lang nat.";
    G.afslag = "Mit afslag fra et tidsskrift hænger indrammet på kontoret. Det blev afvist af samme grund.";
    G.kaktus = "Bunsen er min kaktus, så han kan tåle det.";
    G.kunst = "Skårene gemmer jeg. De skal bruges til en kunstinstallation.";
    G.rene3 = "Det er tre forsøg uden uheld. Det står også i regnskabet.";
    G.rene6 = "Det er seks forsøg i træk uden uheld. Nu leder jeg efter fejlen.";
    G.rene10 = "Det er ti forsøg i træk uden uheld. Jeg har ikke en mappe til den slags.";
    G.regnskab3 = "Det er det tredje uheld på denne computer. Det står i regnskabet.";
    G.regnskab6 = "Det er seks uheld på denne computer, så regnskabet har fået sin egen mappe.";
    G.regnskab10 = "Det er ti uheld, så regnskabet har fået sit eget ringbind.";

    /* ----- Dagsformen: de samme vendinger i hele saetninger --------------- */
    var DAG = {
        fredag: function (t) {
            var foerKage = t.klokken < 14;
            return {
                prik: ["Det er fredag, og det redder dig.",
                    foerKage ? "Der er kage klokken to, og det redder dig også."
                             : "Kagen er spist, så nu er der kun forsøget tilbage."],
                ros: [foerKage ? "Det er godt, for så kan jeg nå kagen." : "Det er godt, og jeg nåede også kagen."],
                uheld: ["Det skulle selvfølgelig ske på en fredag."],
                stilstand: ["Det er fredag, men forsøget bliver ikke kortere af at vente."]
            };
        },
        weekend: function (t) {
            return {
                prik: ["Det er " + t.navn + ". Jeg er kun her, fordi du er her.", "Skolen er lukket, men jeg har en nøgle."],
                ros: ["Det er godt, og det er ikke engang en skoledag."],
                uheld: ["Der er ingen pedel i weekenden, så vi to rydder op."],
                stilstand: ["Vi kunne begge to lave noget andet i dag."]
            };
        },
        morgen: {
            prik: ["Klokken er ikke otte endnu. Det er kaffen, der taler.",
                "Før klokken otte svarer jeg kun på brandalarmen."],
            ros: ["Det er godt, og dagen er knap nok begyndt."],
            uheld: ["Allerede nu? Vi er ikke engang kommet i gang."],
            stilstand: ["Jeg er heller ikke helt vågen endnu, men jeg står op."]
        },
        soevn: {
            prik: ["Jeg har sovet fire timer, så vælg dine ord med omhu.", "Ikke i dag, tak."],
            ros: ["Det er godt, så nu kan jeg sætte mig ned."],
            uheld: ["Ikke i dag. Bare ikke i dag."],
            stilstand: ["Vi står begge to stille, men jeg har en undskyldning."]
        },
        maskine: {
            prik: ["Der er kommet en ny kaffemaskine, så jeg er et bedre menneske i dag.",
                "Spørg gerne om noget fagligt, mens jeg er i godt humør."],
            ros: ["Det er flot, og kaffen er varm. Det er en god dag."],
            uheld: ["Det skete altså også i dag."],
            stilstand: ["Jeg har god tid, for jeg har lige hentet kaffe."]
        },
        rettebunke: {
            prik: ["Jeg har 62 rapporter, der skal rettes, og du er nummer 63.", "Den korte version er nej."],
            ros: ["Skriv det i rapporten, så bliver den nem at rette."],
            uheld: ["Det bliver en fodnote i din rapport."],
            stilstand: ["Jeg retter rapporter, mens du tænker. Sig til, når du er klar."]
        },
        vikar: {
            prik: ["Jeg har haft tre vikartimer i fysik i dag.", "Jeg har forklaret Newtons love tre gange i dag. Nu er det kemi."],
            ros: ["Det er godt. Det er dagens første rigtige kemi."],
            uheld: ["Det her skete ikke engang i fysiktimen."],
            stilstand: ["Jeg har ventet på et rigtigt kemiforsøg hele dagen."]
        },
        moede: {
            prik: ["Jeg har siddet i møde i fire timer.", "Jeg har brugt hele dagen på et skema, og det her er nemmere."],
            ros: ["Det var dagens første ting, der gik som planlagt."],
            uheld: ["Det skal jeg også skrive ind i et skema."],
            stilstand: ["Jeg har siddet stille hele dagen. Nu er det din tur til at lade være."]
        },
        aften: {
            prik: ["Klokken er over fem, så jeg burde være gået hjem.", "Ifølge skemaet har jeg fri, men jeg står her stadig."],
            ros: ["Det er godt, så nu kan jeg låse."],
            uheld: ["Skulle det ske nu, på dette tidspunkt?"],
            stilstand: ["Jeg venter gerne, bare ikke hele aftenen."]
        },
        nat: function (t) {
            return {
                prik: ["Klokken er " + t.ur + ", og det står ikke i noget skema.", "Vi to burde sove, og den ene af os ved det."],
                ros: ["Det er rigtigt, selv på dette tidspunkt."],
                uheld: ["Klokken er " + t.ur + ". Det er en ny rekord."],
                stilstand: ["Det bliver ikke bedre af, at det er nat."]
            };
        }
    };
    K.DAGSFORM.forEach(function (d) {
        if (DAG[d.id]) d.ekstra = DAG[d.id];
    });
}());
