/* =====================================================================
   data.js - de fire situationer, de tre maalere og modellen

   Historien (situationerne, regeringens valg og dens begrundelser) er
   taget fra kapitel 8-alternativ, del 1, som er skrevet efter Peter
   Schroeder: Det 20. aarhundredes Danmarkshistorie (2007), s. 109-120.

   Uddybningerne bag Laes mere (mere og gik paa hvert valg, baggrund paa
   hver situation) har flere detaljer, end bogen har: hvad arbejderne
   kraevede i 1956, hvad maeglingsforslaget indeholdt, og hvad
   Helhedsloesningen bestod af. De er taget fra Gyldendal og Politikens
   Danmarkshistorie (lex.dk: Benzinstrejke og avisstrejke, Helhedsloesning)
   og danmarkshistorien.dk (Aksel Larsens tale 13. april 1956).

   MODELLEN er en forenkling. Hver maaler har seks trin, 0 til 5, hvor 0
   er bedst. Et valg flytter maalerne et eller to trin (virkning). Bogen
   har ingen tal for, hvad de valg, regeringen ikke traf, ville have
   foert til. Deres virkning foelger de sammenhaenge, kapitlet beskriver:
   hoejere loen giver hoejere priser og mere import, offentligt byggeri
   giver arbejde, og en stram finanspolitik daemper priser og import.

   Mellem to situationer flytter maalerne sig af sig selv (DRIFT):
   opsvinget i 1958 og loenstigningerne i 1960'erne. Situationens start
   er derfor regnet: forrige start + regeringens valg + drift.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var MAALERE = [
        {
            id: "a",
            navn: "Arbejdsløshed",
            god: "lav",
            skidt: "høj",
            op: "stiger",
            ned: "falder",
            niveau: ["meget lav", "lav", "ret lav", "middel", "høj", "meget høj"],
            forklar: "Arbejdsløshed: hvor mange der står uden arbejde."
        },
        {
            id: "p",
            navn: "Priser",
            god: "rolige",
            skidt: "stiger hurtigt",
            op: "stiger hurtigere",
            ned: "falder til ro",
            niveau: ["meget rolige", "rolige", "stiger lidt", "stiger", "stiger hurtigt", "stiger meget hurtigt"],
            forklar: "Priser: hvor hurtigt varerne bliver dyrere. Når priserne stiger hurtigt, bliver pengene mindre værd."
        },
        {
            id: "b",
            navn: "Betalingsbalance",
            god: "overskud",
            skidt: "underskud",
            op: "forværres",
            ned: "forbedres",
            niveau: ["stort overskud", "overskud", "i balance", "underskud", "stort underskud", "meget stort underskud"],
            forklar: "Betalingsbalance: landets indtægter fra og udgifter til udlandet. Underskud betyder, at landet bruger flere penge i udlandet, end det tjener."
        }
    ];

    /* Stillingen i foraaret 1956: hoej arbejdsloeshed, rolige priser og
       en betalingsbalance, der lige holder (landet mangler valuta). */
    var START = { a: 4, p: 1, b: 2 };

    /* Farven paa kortets kant og maerke foelger slagsen af indgreb */
    var SLAGS = {
        ingen: "#9aa3ad",
        giv: "#c9a227",
        lov: "#9b6bd6",
        gas: "#e8963a",
        brems: "#3d9ee0",
        eksperter: "#3fb8a8",
        stat: "#e07a6e"
    };

    var SITUATIONER = [
        {
            aar: 1956,
            titel: "Storkonflikten",
            avis: {
                dato: "April 1956",
                rubrik: "100.000 arbejdere i konflikt",
                tekst: "Arbejderne kræver højere løn og en arbejdsuge på 44 timer i stedet for 48. Arbejdsgiverne siger nej og kræver lønnedgang. Nu truer en benzinstrejke med at lamme landet.",
                stilling: "Arbejdsløsheden er høj, og valutakassen er næsten tom."
            },
            spm: "Hvad gør du ved konflikten?",
            baggrund: "Når arbejdere og arbejdsgivere ikke kan blive enige om en ny overenskomst, mægler statens forligsmand. Hans forslag til en aftale hedder et mæglingsforslag. Begge sider stemmer om det.",
            valg: [
                {
                    slags: "giv",
                    maerke: "Giv efter",
                    titel: "Giv arbejderne medhold",
                    linje: "Folketinget vedtager højere løn og 44 timer.",
                    virkning: { p: 1, b: 1 },
                    mere: {
                        hvad: "Arbejderne kræver lønforhøjelser, der kan mærkes, en arbejdsuge på 44 timer i stedet for 48, betaling for helligdage og en sygelønsordning. Med dette valg gennemfører Folketinget kravene ved lov.",
                        for: "Produktiviteten er steget, og arbejderne er regeringens egne vælgere.",
                        imod: "Højere løn giver mere import, og Danmark mangler valuta."
                    },
                    foelge: "Med højere løn køber danskerne flere udenlandske varer. Priserne stiger, og valutakassen tømmes.",
                    pris: "Krag og Kampmann frygter, at det ødelægger det opsving, der er på vej."
                },
                {
                    slags: "ingen",
                    maerke: "Ingen indgreb",
                    titel: "Bland dig udenom",
                    linje: "Lad arbejdere og arbejdsgivere kæmpe det ud.",
                    virkning: { a: 1, b: 1 },
                    mere: {
                        hvad: "Normalt aftaler arbejdsmarkedets parter selv løn og arbejdstid. Godt 50.000 arbejdere strejker, og med arbejdsgivernes lockout er over 100.000 ude. Også tankbilernes chauffører strejker.",
                        for: "Staten blander sig ikke i de frie forhandlinger.",
                        imod: "Uden benzin må skoler og hospitaler lukke, og landbruget mangler brændstof til traktorerne."
                    },
                    foelge: "Benzinstrejken lammer landet. Fabrikkerne står stille, og eksporten går i stå.",
                    pris: "Ingen ved, hvor længe konflikten varer."
                },
                {
                    slags: "lov",
                    maerke: "Indgreb ved lov",
                    titel: "Gør mæglingsforslaget til lov",
                    linje: "Folketinget vedtager mæglerens forlig.",
                    virkning: {},
                    mere: {
                        hvad: "Forligsmandens forslag giver generelle lønforhøjelser, et særligt tillæg til de lavtlønnede og en sygelønsordning. Arbejdstiden bliver ikke sat ned. Arbejdsgiverne har stemt ja, arbejderne nej.",
                        for: "Konflikten stopper med det samme, og lønnen stiger kun lidt.",
                        imod: "Arbejderne har lige stemt nej til netop dette forslag."
                    },
                    gik: "Folketinget vedtog loven natten til den 13. april 1956. Samme dag demonstrerede over 100.000 arbejdere foran Christiansborg. Det var første gang, en socialdemokratisk regering gjorde et forslag til lov, som arbejderne havde stemt nej til.",
                    foelge: "Konflikten stopper, og arbejderne får langt mindre, end de krævede. Målerne bliver, hvor de er.",
                    pris: "Mange arbejdere bliver utilfredse med deres eget parti.",
                    regering: true
                }
            ],
            afsloer: "Regeringen gjorde mæglingsforslaget til lov, da benzinstrejken truede. Socialdemokratiet sagde ikke længere automatisk ja til fagbevægelsens krav."
        },
        {
            aar: 1958,
            titel: "Opsvinget",
            avis: {
                dato: "1958",
                rubrik: "Opsvinget er kommet",
                tekst: "Industrien eksporterer mere og mere, især til Vesttyskland. Arbejdsløsheden falder, og skattekronerne strømmer ind i statskassen.",
                stilling: "De gode tider kommer udefra. Nu skal de bruges."
            },
            spm: "Hvad gør du med de gode tider?",
            baggrund: "Finanspolitik er statens styring af økonomien gennem skatter og offentlige udgifter. Økonomen John M. Keynes mente, at staten skal udjævne op- og nedture: gas i dårlige tider og brems i gode.",
            valg: [
                {
                    slags: "gas",
                    maerke: "Finanspolitik · gas",
                    titel: "Sænk skatterne",
                    linje: "Borgerne skal selv bruge pengene.",
                    virkning: { a: -1, p: 1, b: 1 },
                    mere: {
                        hvad: "Når flere er i arbejde og tjener mere, får staten flere penge ind i skat. Med dette valg sættes skatten ned, så pengene bliver hos borgerne.",
                        for: "De borgerlige partier mener, at staten ikke skal opkræve flere penge end højst nødvendigt.",
                        imod: "Borgerne køber mere, også fra udlandet, og priserne kan stige."
                    },
                    foelge: "Folk køber mere, også udenlandske varer som biler. Det giver flere i arbejde, men priserne stiger.",
                    pris: "Betalingsbalancen bliver dårligere."
                },
                {
                    slags: "gas",
                    maerke: "Finanspolitik · gas",
                    titel: "Byg velfærd",
                    linje: "Staten bygger skoler, sygehuse og veje.",
                    virkning: { a: -2, p: 1 },
                    mere: {
                        hvad: "Socialdemokratiet har haft velfærdsstaten på tegnebrættet siden 1945, og folkepensionen trådte i kraft i 1957. Med dette valg bruger staten de nye skattekroner på skoler, sygehuse, institutioner og veje.",
                        for: "Byggeriet giver arbejde, og velfærden kommer hele befolkningen til gode.",
                        imod: "Når staten bruger flere penge i gode tider, kan økonomien blive overophedet."
                    },
                    gik: "Det offentlige byggede skoler, sygehuse, institutioner og veje, og antallet af offentligt ansatte steg markant. Arbejdsløsheden faldt. I 1960'erne blev stigende lønninger og priser det største økonomiske problem.",
                    foelge: "Byggeriet giver arbejde til mange, og arbejdsløsheden falder hurtigt.",
                    pris: "Der bliver mangel på arbejdskraft, og lønnen begynder at stige.",
                    regering: true
                },
                {
                    slags: "brems",
                    maerke: "Finanspolitik · brems",
                    titel: "Brems",
                    linje: "Staten holder igen med udgifterne.",
                    virkning: { b: -1 },
                    mere: {
                        hvad: "Efter Keynes' regel skal staten bremse, når det går godt. Med dette valg holder staten igen med udgifterne og lader de ekstra skattekroner blive i statskassen.",
                        for: "Priserne holdes i ro, og økonomien bliver ikke overophedet.",
                        imod: "Vælgerne har ventet på velfærden siden krigen."
                    },
                    foelge: "Det er økonomernes regel: brems i gode tider. Priserne holder sig i ro, og betalingsbalancen bliver bedre.",
                    pris: "Velfærden må vente, og arbejdsløsheden falder langsommere."
                }
            ],
            afsloer: "Regeringen brugte de voksende skatteindtægter på velfærd. Det offentlige byggede skoler, sygehuse, institutioner og veje."
        },
        {
            aar: 1961,
            titel: "Lønstigningerne",
            avis: {
                dato: "1961",
                rubrik: "Store lønstigninger",
                tekst: "Der er arbejde til næsten alle, og den nye overenskomst giver store lønstigninger. Priserne følger med, og danskerne køber flere udenlandske varer.",
                stilling: "Hvem skal sige, hvad økonomien kan bære?"
            },
            spm: "Hvem skal bestemme over lønnen?",
            baggrund: "En overenskomst er en aftale mellem fagforeninger og arbejdsgivere om løn og arbejdsvilkår. De to sider kaldes arbejdsmarkedets parter. Når der mangler arbejdskraft, står fagforeningerne stærkt.",
            valg: [
                {
                    slags: "eksperter",
                    maerke: "Eksperter",
                    titel: "Opret et råd af økonomer",
                    linje: "Uafhængige eksperter giver råd om lønnen.",
                    virkning: {},
                    mere: {
                        hvad: "Rådet skal være uafhængigt af regeringen og ledes af tre økonomer. I rådet sidder også arbejdsmarkedets parter, erhvervslivet og Nationalbanken. Det skal følge økonomien og vise, hvad lønkravene koster samfundet.",
                        for: "Alle parter får de samme tal at forhandle ud fra.",
                        imod: "Rådet kan kun give råd. Ingen har pligt til at følge dem."
                    },
                    gik: "Det økonomiske Råd blev oprettet ved lov i 1962. De tre økonomer blev kaldt vismænd. Allerede i december 1962 advarede de om, at lønstigninger og skattelettelser tilsammen ville sætte fart i priserne og skade eksporten.",
                    foelge: "Rådet viser parterne, hvad lønkravene koster samfundet. Det kan kun give råd, så målerne flytter sig ikke endnu.",
                    pris: "Eksperterne får magt. De færreste tør sige dem imod.",
                    regering: true
                },
                {
                    slags: "ingen",
                    maerke: "Ingen indgreb",
                    titel: "Lad parterne forhandle frit",
                    linje: "Parterne er fagforeninger og arbejdsgivere.",
                    virkning: { p: 1, b: 1 },
                    mere: {
                        hvad: "I Danmark aftaler parterne selv løn og arbejdstid, og staten blander sig normalt ikke. Med dette valg fortsætter det som hidtil.",
                        for: "De, der kender arbejdspladserne, bestemmer selv.",
                        imod: "Lønnen kan blive ved med at stige hurtigere, end økonomien kan bære."
                    },
                    foelge: "Lønnen stiger videre, og priserne følger med. Importen vokser.",
                    pris: "Betalingsbalancen bliver dårligere."
                },
                {
                    slags: "stat",
                    maerke: "Staten styrer",
                    titel: "Lad staten bestemme lønnen",
                    linje: "Folketinget fastsætter løn og priser.",
                    virkning: { p: -1, b: -1 },
                    mere: {
                        hvad: "Folketinget bestemmer ved lov, hvor meget løn og priser må stige. Parterne forhandler ikke længere selv. Det hedder indkomstpolitik.",
                        for: "Lønstigningerne kan standses med det samme.",
                        imod: "Det bryder med de frie forhandlinger og ligner planøkonomi."
                    },
                    foelge: "Løn og priser falder til ro, og importen bremses.",
                    pris: "Fagforeninger og arbejdsgivere mister retten til selv at forhandle. Det ligner planøkonomi."
                }
            ],
            afsloer: "Det økonomiske Råd blev oprettet i 1962. Det blev ledet af tre „økonomiske vismænd“ og skulle give videnskabeligt begrundede råd."
        },
        {
            aar: 1963,
            titel: "Underskuddet",
            avis: {
                dato: "1963",
                rubrik: "Danmark har underskud",
                tekst: "For første gang er der underskud på betalingsbalancen: Danmark bruger flere penge i udlandet, end landet tjener. Løn og priser stiger stadig.",
                stilling: "Det økonomiske Råd anbefaler et loft over lønstigningerne."
            },
            spm: "Følger du rådet?",
            baggrund: "Betalingsbalancen er landets indtægter fra og udgifter til udlandet. I december 1962 advarede vismændene i Det økonomiske Råd om, at nye lønstigninger ville sætte fart i priserne og skade eksporten.",
            valg: [
                {
                    slags: "ingen",
                    maerke: "Ingen indgreb",
                    titel: "Lad parterne forhandle frit",
                    linje: "Lønnen er parternes sag, ikke statens.",
                    virkning: { p: 1, b: 1 },
                    mere: {
                        hvad: "Overenskomsterne skal fornyes i 1963. Med dette valg forhandler parterne selv, som de plejer, og staten ser bort fra vismændenes advarsel.",
                        for: "De frie forhandlinger bliver bevaret.",
                        imod: "Nye lønstigninger giver højere priser og et større underskud."
                    },
                    foelge: "Løn og priser stiger videre, og importen vokser.",
                    pris: "Underskuddet over for udlandet bliver større."
                },
                {
                    slags: "brems",
                    maerke: "Finanspolitik · brems",
                    titel: "Skær i de offentlige udgifter",
                    linje: "Staten bygger mindre og bruger færre penge.",
                    virkning: { a: 1, p: -1, b: -1 },
                    mere: {
                        hvad: "Staten bruger færre penge og bygger færre skoler, sygehuse og veje. Det er finanspolitik. Staten rører ikke ved lønnen.",
                        for: "Parterne beholder retten til selv at forhandle.",
                        imod: "Velfærdsbyggeriet standser, og nogle mister deres arbejde."
                    },
                    foelge: "Der kommer færre penge i omløb. Priserne falder til ro, og importen falder.",
                    pris: "Byggeriet af skoler og sygehuse går i stå, og arbejdsløsheden stiger."
                },
                {
                    slags: "lov",
                    maerke: "Indkomstpolitik",
                    titel: "Indfør løn- og prisstop",
                    linje: "Staten sætter loft over løn og priser.",
                    virkning: { p: -2, b: -2 },
                    mere: {
                        hvad: "Folketinget forlænger overenskomsterne i to år ved lov. De lavtlønnede får et tillæg med det samme, og alle får et tillæg året efter. Samtidig bliver der stop for stigninger i priserne.",
                        for: "Løn og priser holdes i ro på samme tid.",
                        imod: "Staten tager magten over lønnen fra parterne."
                    },
                    gik: "Helhedsløsningen blev vedtaget i 1963 med regeringens spinkle flertal. Den indførte også en ny tillægspension, ATP. Fagbevægelsen var stort set tilfreds, og i 1963 fik Danmark igen overskud på betalingsbalancen.",
                    foelge: "Løn og priser bliver holdt i ro, og importen bremses.",
                    pris: "Staten bestemmer nu over løn og priser i stedet for parterne.",
                    regering: true
                }
            ],
            afsloer: "Regeringen fulgte rådet. Helhedsløsningen i 1963 dikterede et løn- og prisstop. Det var Danmarks første indkomstpolitik."
        }
    ];

    /* Det, der sker af sig selv fra en situation til den naeste */
    var DRIFT = [
        { a: -1, b: -1 },    /* 1956 til 1958: opsvinget, eksporten stiger */
        { p: 1, b: 1 },      /* 1958 til 1961: loen og priser stiger, importen vokser */
        { p: 1, b: 1 }       /* 1961 til 1963: det fortsaetter, foerste underskud */
    ];

    var REGNSKAB = {
        dato: "1956-1963",
        rubrik: "Regnskabet",
        tekst: "Fire gange skulle regeringen vælge. Tre gange greb staten ind mellem arbejdere og arbejdsgivere: med lov i 1956, med eksperter i 1962 og med løn- og prisstop i 1963.",
        stilling: "Målerne viser 1963 sammenlignet med 1956. Hvert valg havde en pris.",
        eftertanke: "Hvilket af regeringens valg havde den højeste pris, og hvem betalte den?"
    };

    var TEKST = {
        note: "En prik mod højre er dårligere. Klik på en måler for forklaring.",
        noteFoer: "Den stiplede ring viser, hvor måleren stod før.",
        tom: "Følgen af dit valg står her, når du har valgt."
    };

    /* ----- Modellen --------------------------------------------------- */
    var IDER = ["a", "p", "b"];

    function plus(stilling, aendring) {
        var ud = {};
        IDER.forEach(function (id) {
            ud[id] = NK.klamp(stilling[id] + (aendring[id] || 0), 0, 5);
        });
        return ud;
    }

    function regering(i) {
        var v = SITUATIONER[i].valg;
        for (var k = 0; k < v.length; k++) if (v[k].regering) return k;
        return -1;
    }

    /* Stillingen, naar situation i begynder */
    function start(i) {
        var s = { a: START.a, p: START.p, b: START.b };
        for (var j = 0; j < i; j++) {
            s = plus(s, SITUATIONER[j].valg[regering(j)].virkning);
            s = plus(s, DRIFT[j]);
        }
        return s;
    }

    /* Stillingen efter valg k i situation i */
    function efter(i, k) {
        return plus(start(i), SITUATIONER[i].valg[k].virkning);
    }

    function slut() {
        var sidste = SITUATIONER.length - 1;
        return efter(sidste, regering(sidste));
    }

    NK.Data = {
        MAALERE: MAALERE,
        START: START,
        SLAGS: SLAGS,
        SITUATIONER: SITUATIONER,
        DRIFT: DRIFT,
        REGNSKAB: REGNSKAB,
        TEKST: TEKST,
        IDER: IDER
    };

    NK.Model = {
        plus: plus,
        regering: regering,
        start: start,
        efter: efter,
        slut: slut
    };
}());
