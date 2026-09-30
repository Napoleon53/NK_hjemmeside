# sc1.4 Afstem reaktioner

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv, også Kemichael, som ikke er med her. Den virker
også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-c-filer/c1.4_opgaver_afstemning.html` og er i
menuen som c1.4 fra 30. sept. 2026; den gamle ligger i
`kemi-c-filer/arkiv/c1.4_opgaver_afstemning_oldversion.html`.

## Bestillingen (30. september 2026)

Brugeren: "Lav en superanimationer-udgave af c1.4".

Efter første test samme dag: "Michaels hint er det svageste led. Måske skal
vi bare fjerne ham helt. Men bevar hintsene, men byg dem op på en logisk
måde. Lad hint-knappen være mere synlig ... Det må gerne være lidt mere
tydeligt, når man svarer forkert (i fane 1), og når man svarer rigtigt. Det
hænger nok igen sammen med, at øjnene ikke naturligt rammer højre hjørne,
hvor der står lidt tekst."

Kemichael er derfor helt ude af denne animation, og alt, der før stod hos ham
eller i panelet, står nu i **statuslinjen** nederst i scenen. Se afsnittet
Hjælpen nedenfor.

1. **Pointen:** I en reaktion bytter atomerne partnere, men de bliver de
   samme. Man afstemmer med tallet foran stoffet, aldrig med det lille tal i
   formlen.
2. **Afløser c1.4.** Med fra den gamle: de syv reaktioner i samme rækkefølge
   (magnesium, vand, peroxid, ammoniak, methan, jern og damp, propan) og en
   kort tekst om hver, tallene foran med + og −, molekylerne som kugler i
   samme farver, regnskabet med før og efter i grønt og rødt, at musen over
   en række i regnskabet får de atomer til at lyse, stjernerne som
   sværhedsgrad (nu grupperne Let, Middel og Svær) og beskeden om de mindste
   hele tal. Taget ud: vinderskærmen med smileys og rundturen med
   Opgave-introduktion (afløst af `?`). Nyt: reaktionen, hvor atomerne
   flyver hen på deres pladser, det lille tal, der kan ændres (fejlen, elever
   laver), tre nye reaktioner (køkkensalt, kulilte, aluminium) og fane 2.
3. **Naboerne:** sc1.3 ejer knaldgasforsøget, sc4.4 og sc4.5 ejer mol og
   masse (også deres afstemning), sc8.4 og sc8.5 ejer redoxafstemningen med
   elektroner og ladning. Her er der ingen mol, ingen masse og ingen ioner.
4. **Loftet:** to faner. Fane 1 har 10 reaktioner med højst to stoffer på
   hver side og højst 10 molekyler af hvert stof. Fane 2 har 24 reaktioner
   med op til fem stoffer.
5. **Layoutet:** scene plus panel. Skemaet står på en tavle øverst i scenen,
   og panelet har opgavekortet med den ene knap, regnskabet og listen.

## Fane 1: Kuglerne

Tavlen øverst har reaktionsskemaet. Over og under tallet foran hvert stof er
+ og −; tallet 1 står svagt, som i bogen, hvor det ikke skrives. Under tavlen
står to bakker: Før pilen med molekylerne som kugler og Efter pilen med de
pladser, produkterne skal bruge, som stiplede ringe i atomets farve. Under
hver blok står tallet og formlen.

**Lad dem reagere** (eller Enter): molekylerne ryster, og hvert atom flyver
hen på en ledig plads af sin slags. Et atom uden plads lander i strimlen
Tilovers med en rød ring, og en plads uden atom bliver rød. Linjen siger,
hvor mange der er tilovers og tomme, og hvad der ikke passer. Så snart et tal
ændres, står molekylerne klar igen.

**Det lille tal:** et klik på et atom i formlen gør dets lille tal én større
(to gange, så er det tilbage). Kuglemodellen får de ekstra atomer, og linjen
siger, hvilket stof det nu er (H₂O₂ er hydrogenperoxid). Atomerne kan godt
komme til at passe, fx H₂ + O₂ → H₂O₂, men det godtages aldrig: "Det er ikke
det stof, der skal laves."

Et klik på en kugle siger, hvad molekylet har ("Ét H₂O har 2 H og 1 O"), og
et klik på en plads eller et atom tilovers siger, hvad den betyder.

## Fane 2: Skemaet

Kun formlerne. Tavlen har et felt foran hvert stof, og et tomt felt tæller
som 1. Enter tjekker. 24 reaktioner: Let (tre stoffer), Middel
(forbrændinger, syre og metal, kalk og saltsyre) og Svær (parenteser som
Al₂(SO₄)₃ og Ca₃(PO₄)₂, butan og octan med et halvt O₂ undervejs og kobber
i salpetersyre).

**Optællingen er slået fra** (brugerens valg 30. sept. 2026). Her tæller
eleven selv. Den store knap under tavlen, Vis optællingen, viser regnskabet
med elevens egne tal, og så tæller det med, mens der skrives, som før. Knappen
er slået fra igen ved hver ny reaktion, også når man vender tilbage til en,
man har set før, så hjælpen skal hentes hver gang. Intet andet er ændret:
regnskabet regnes hele tiden, og Vis svaret tænder det ikke af sig selv.
Fane 1 har stadig sit regnskab fremme i panelet, for dér er kuglerne selve
pointen.

## Beskederne og hintet

Alt er regnet af formlerne og elevens tal (`js/afst.js`):

| Situationen | Beskeden |
|-------------|----------|
| Det går op, men tallene kan forkortes | Atomerne passer, men alle tallene kan deles med 2 |
| Kun O passer ikke, og O₂ giver dem to ad gangen | Der skal 7 O før pilen … Gang alle de andre tal med 2 først |
| Ellers | Hvor mange af hvilke atomer før og efter (højst to) |
| Fane 1: det lille tal er ændret | Det er ikke det stof, der skal laves |
| Fane 2: 0, et kommatal eller tekst | Hver sin |

## Hjælpen: statuslinjen og hinttrappen

Der er ingen lærer. Hele hjælpen ligger i **statuslinjen** nederst i scenen,
lige under bakkerne og skemaet, hvor eleven i forvejen kigger. Linjen har
teksten til venstre og den ene knap til højre, så knappen findes uden at der
skal ledes efter den i et hjørne. Linjens farve og mærke siger, hvad der
skete:

| Mærke | Farve | Hvornår |
|-------|-------|---------|
| (intet) | grå | næste skridt |
| Ikke endnu | rød, og linjen ryster | svaret gik ikke op |
| Hint 2 af 3 | gul | eleven har bedt om hjælp |
| Afstemt ✓ | grøn | reaktionen går op |
| Svaret | gul | eleven bad om at få det vist |

**Hintet er en trappe på tre trin** (`A.hintTrin` i `js/afst.js`), og knappen
giver ét trin ad gangen: Giv et hint › Næste hint (2 af 3) › Næste hint (3 af
3) › Vis svaret. Trinnene følger den måde, man afstemmer på:

1. **Hvilket atom.** "Tæl C. C står kun i ét stof på hver side, så det er
   nemmest at begynde der." Ingen tal.
2. **Tæl det.** "Der er 3 C før pilen og 1 efter. Der mangler 2 C efter pilen."
3. **Hvad man gør.** "Sæt 3 foran CO₂, så der bliver 3 C efter pilen. Tæl så
   det næste atom."

Atomet, trinnene handler om, lyser gult i scenen og i regnskabet, mens hintet
står. Retter eleven et tal, begynder trappen forfra, for så er næste skridt et
andet. To situationer har deres egen trappe: tallene kan forkortes, og der
mangler et halvt O₂ (trin 2 forklarer, at O₂ giver dem to ad gangen, trin 3
giver de dobbelte tal). Vis svaret viser skemaet og regnskabet ("… Så er der
3 C, 8 H og 10 O på hver side.").

**Tydeligt rigtigt og forkert.** Går det ikke op på fane 1, bliver pilen og
bakken efter pilen røde, atomerne tilovers får røde ringe, de tomme pladser
bliver røde, og linjen ryster. Går det op, popper et grønt **AFSTEMT ✓** frem
over pilen, scenen glimter kort grønt, og tavlen og bakken bliver grønne. På
fane 2 får tavlen et grønt stempel i hjørnet, og felterne bliver grønne.

Påskeægget er tilbage i linjen: laves O₂ om til O₃, står der, at ozon lugter
af kopimaskine og ikke er det, der reagerer her.

## Forenklinger

* Salte og oxider (NaCl, MgO, Al₂O₃, Fe₃O₄) tegnes som én formelenhed, som i
  den gamle c1.4, ikke som et gitter.
* Kuglerne er tegnet fladt, med overlap som en kalotmodel, men uden rigtige
  vinkler og bindingslængder. Formen hører til sc3.2.
* Et ændret lille tal giver ekstra kugler rundt om grundformen. Kun stoffer,
  der findes, får et navn (`D.ANDRE_STOFFER`).
* Atomerne flyver til pladser af samme slags fra venstre mod højre. Hvilket
  atom der ender hvor, er ikke kemi.

## Filer

```
index.html         toplinje, de to faner, teori og rundvisning
css/stil.css       udseende (grundlaget er sc8.2; nederst statuslinjen,
                   skemaet, knappen Lad dem reagere, regnskabet, felterne
                   og stemplet). NB: decimaltal med PUNKTUM i CSS
js/kerne.js        NK-navnerum, hævet og sænket skrift, lærred (som sc8.2)
js/data.js         atomernes farver, kuglemodellerne og de 10 og de 24
                   reaktioner med facit
js/afst.js         modellen: formler med parenteser, regnskabet, dommen,
                   fejlbeskederne og hinttrappen
js/tegning.js      væggen, bakkerne, pilen, kuglerne, de tomme pladser og
                   stemplet AFSTEMT
js/fane.js         det fælles: listen, statuslinjen, knappen og musen
js/sim_kugler.js   fane 1
js/sim_skema.js    fane 2
js/rundvisning.js  rundvisningen bag ?
js/app.js          faneskift, tastatur og tegneløkken
_selvtest.html     udviklerværktøj, se nedenfor
```

En ny reaktion på fane 2 er én linje i `D.SKEMA`. På fane 1 skal hvert stof
også have en kuglemodel i `D.GEO`.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> fane · <kbd>R</kbd> start forfra · <kbd>H</kbd>
rundvisning · <kbd>T</kbd> teori · <kbd>Enter</kbd> reager eller tjek ·
<kbd>Esc</kbd> luk. Direkte links: `#kugler` og `#skema`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server (iframen afvises på
file://; animationen selv virker fra harddisken). Den tjekker formellæseren,
at alle 34 reaktioner går op med facit, at facit er de mindste hele tal og den
eneste løsning, at ingen går op med lutter 1-taller, kuglemodellerne,
beskederne til de typiske fejl, at alle opgaver kan løses (med + og −, ved at
skrive og med Vis svaret), at et ændret lille tal aldrig godtages, at hintet
er tre trin i alle 34 reaktioner og først til sidst siger tallet, at
statuslinjen bliver rød og ryster ved en fejl og grøn med stempel ved et
rigtigt svar, at knappen lyser efter en fejl og holder op igen, at
optællingen på fane 2 er slået fra ved hver ny reaktion, sproget og layoutet
fra 1100 × 700 til 1600 × 950.
Sidst kørt: ALT OK (88 påstande), 30. september 2026.

## I menuen

I menuen fra 30. sept. 2026 (brugerens ja):

* `kemi-c-filer/samling_c1.html`, knap 4 `data-emne="c1.4"`, peger på
  `../superanimationer/sc1.4_afstemning/index.html`.
* `samling_NV.html`, knap 3 med samme `data-emne`, peger på
  `superanimationer/sc1.4_afstemning/index.html`.
* Den gamle er flyttet med `git mv` til
  `kemi-c-filer/arkiv/c1.4_opgaver_afstemning_oldversion.html`.
* `FEEDBACK_EMNER` i `samling_alt.html` er urørt: knappen hedder stadig
  "Afstem reaktioner" og har stadig nummer 4 i C1. Beskrivelsen på knappen
  (`data-beskrivelse`) er skrevet om, så den siger, hvad eleven gør.
