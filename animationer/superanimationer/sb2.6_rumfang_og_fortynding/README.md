# sb2.6 Rumfang og fortynding

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og fra `../faelles/` (papirkortet) og virker også, når
den åbnes direkte fra harddisken. Der er ingen Kemichael og ingen statuslinje
nederst: al tekst står på ét kort øverst midt i scenen, også hint og den gule
hintknap (rammen fra `sb2.2_ikke_ligevaegt_og_indgreb`).

Den står i menuen som nr. 7 i B2 Ligevægt (koden `b2.6`) og afløser den gamle
`b2.6_volumenændring.html`, der nu ligger i `../../kemi-c-filer/arkiv/` som
`b2.6_volumenændring_oldversion.html`.

## Bestillingen (20. november 2026)

Brugeren om figur B2.10 i Kemibogen B: stempelfiguren med ammoniak ændrede
sig for lidt til at se på, "gaskemien kommer jo også først for alvor i kemi a",
og et eksempel, hvor man fortynder med vand, "passer også godt til teorien i
ligevægtsøvelsen". Afsnit B2.4 viser derfor fra samme dag rumfang med en
fortynding af Co²⁺(aq) + 4 Cl⁻(aq) ⇌ CoCl₄²⁻(aq) (figur B2.10) og en regnefigur
med ½ på hver koncentration (B2.11). Brugeren: "udvide animationen hertil med en
ny fane (det er vist ikke en superanimation endnu, men det kunne måske også
fixes)", og at det ikke gør noget, at animationen bruger bogens eksempel.
Brugeren godkendte bestillingen: "Det ser solidt ud."

1. **Pointen:** Når rumfanget ændres, bliver alle koncentrationer ganget med
   samme tal, og potenserne i reaktionsbrøken afgør, hvilken vej ligevægten
   forskydes.
2. **Afløser** b2.6 Volumenændring. Med fra den gamle: cylinderen med stempel
   og N₂O₄ ⇌ 2 NO₂, den brune farve, antallet af molekyler, *Y* regnet løbende
   ved siden af *K* og danserne som en anden visning. Forklaringen bag "Hvorfor
   ændres Y?" er blevet til spørgsmål på kortet.
3. **Naboerne:** `sb2.2` ejer at tilsætte eller fjerne et stof, `b2.2` gættene
   om temperatur og tryk, `sb2.4` beregningerne med *x*, og forsøget med
   jernthiocyanat ejer Fe³⁺ + SCN⁻, som er brugerens egen øvelse og ikke er
   med her (heller ikke som opgave med samme form).
4. **Loftet:** tre faner og to ligevægte i scenen: højst 18 molekyler i
   cylinderen og højst 21 ioner i måleglasset. Fane 3 har seks reaktioner.
5. **Layoutet:** scene plus panel. Kortet øverst, beholderen til venstre med
   knappen ved siden af og reaktionsskemaet, brøken og tallinjen til højre.

Stop-listen er overholdt: ingen flasker, man hælder med musen, intet stativ,
intet affald og ingen uheld. Vandet hældes i med en knap.

## Stilladset og spørgsmålene (20. november 2026, anden runde)

Brugeren efter første udgave: "Kan du ikke sikre en bedre linjedeling i
spørgsmålet. Og måske samle spørgsmålet, så det sorte ikke bliver indforstået.
Måske endda dele spørgsmålet lidt op.. en svag elev vil blive forvirret over alle
de dele der kommer med det samme og et meget ukonkret spørgsmål. Det er lige før
jeg vil foretrække at du tænker lidt byg figuren ind over.. ikke helt
bogstaveligt.. men at der første spørges ind til ligevægtsloven.. og så dukker
den op... og så fortsætter man stilladseret indtil man kommer til farveskiftet..
Jeg savner måske også at danserne snakker."

* **Trin:** et mål kan have en liste af trin (`trin` i `js/data.js`), og
  `js/fane.js` kalder dem `spm_0`, `forsoeg_4` osv. Kortet viser "Trin 3 af 6".
  Hvert løst trin kan få noget frem i scenen (`vis`): broek, faktor (faktoren på
  hver koncentration, lilla), taelling (½ én gang og fem gange), tallinje og
  retning. Indtil da står der en stiplet plads med navnet. `synlig(navn)` i
  `fane.js` afgør det. Mål uden trin har brøken og tallinjen fremme fra start,
  men ikke faktoren, tællingen og retningen.
* **Det første mål på fane 1 og 2** er stilladset: reaktionsbrøken (vælg blandt
  tre brøker), hvad der sker med koncentrationerne, (på fane 2) hvor mange gange
  der ganges med ½ under brøkstregen, hvor mange gange så stor Y bliver,
  retningen, så forsøget og til sidst farveskiftet. Før forsøget viser
  tallinjen det forudsagte "Y lige efter = 16 · K", så kortet og tallinjen siger
  det samme. Fane 3 viser brøken, når faktoren er valgt, optællingen, når
  faktorerne er sat på, og tallinjen, når Y er fundet.
* **Spørgsmålet:** en del kan have en indledning (`intro`) i almindelig skrift,
  og spørgsmålet står halvfedt på sin egen linje (`tekstHTML` i `fane.js`,
  `.sk-spm-linje` med `text-wrap: balance` nederst i `css/stil.css`).
  Spørgsmålet kan læses alene: "Hvilken vej forskydes ligevægten, når rumfanget
  halveres?" i stedet for "Hvilken vej forskydes ligevægten?". Selvtesten
  kontrollerer, at hvert spørgsmål ender med ?, og at indledningen ikke har et.
* **Danserne taler** med replikkerne fra den gamle b2.6 ("Hov, her blev trangt!",
  "Skal vi danse sammen?", "Ja, så fylder vi mindre!", "Os to også!", "Nu er der
  lidt bedre plads." og ved Træk op "Dejligt med mere plads!" ... "Wuhu, fri
  bane!"). De kommer kun i dansevisningen, hvor "lige efter" varer 3,3 s, så
  replikkerne når at blive sagt, og de to, der taler, er dem, der reagerer.
  Målet Træk stemplet op begynder i dansevisningen.

## Fane 1: Stemplet (`#stempel`)

En cylinder med stempel med N₂O₄(g) ⇌ 2 NO₂(g), *K* = 0,25 M. Gassen er brun
med en styrke, der følger [NO₂], på en lys baggrund, så mere NO₂ giver mørkere
gas. Knapperne Pres ned (halvt rumfang) og Træk op (dobbelt) står ved siden af
cylinderen, men kun den, opgaven beder om, kan ses. Stemplet flytter sig, og
"lige efter" står blandingen stille lidt over et sekund, så eleven ser *Y*
springe på tallinjen; så forløber reaktionen, og to NO₂ bliver til én N₂O₄ (eller
omvendt). Visningen Dansere viser et par for hver N₂O₄ og en single for hver NO₂.
Panelet viser rumfang, antal, koncentrationer og *Y* før, lige efter og nu.

1. **Pres stemplet ned** (seks trin): reaktionsbrøken, koncentrationerne bliver
   dobbelt så store, Y bliver 2 gange så stor, mod venstre, pres ned, hvorfor
   gassen blev lidt lysere igen.
2. **Træk stemplet op** (dansere): gæt, træk op; fra 14 til 15 molekyler. Hvorfor?
3. **Modvirket, ikke ophævet:** [NO₂] 0,10 › 0,20 › 0,16 M.

## Fane 2: Fortynding (`#fortynding`)

Et måleglas med bogens ioner: 2 CoCl₄²⁻ (blå), 1 Co²⁺ (lyserød) og 10 Cl⁻
(grå, fordi chloridionen er farveløs) i 25 mL. Knappen Hæld vand i fordobler
rumfanget (50 og 100 mL). Ionerne bliver i glasset og fordeles i det større
rumfang; lige efter er opløsningen lysere blå, og når ligevægten forskydes mod
venstre, bliver én CoCl₄²⁻ til én Co²⁺ og fire Cl⁻ (med grøn ring som i bogen),
og farven skifter mod violet og ved 100 mL mod lyserød.

1. **Hæld vand i** (syv trin): reaktionsbrøken, koncentrationerne bliver halvt
   så store, ½ fem gange under brøkstregen, Y bliver 16 gange så stor, mod
   venstre, hæld vand i, hvorfor opløsningen blev violet. Det forkerte svar
   "Vandet reagerer med CoCl₄²⁻" er netop den misforståelse, brugeren ville
   undgå i bogen.
2. **Mere vand:** fra 50 til 100 mL; *Y* = 16 · *K* igen.
3. **Lige efter og bagefter:** hvorfor var den ikke violet med det samme?

## Fane 3: Regn på Y (`#regn`)

En tavle med reaktionsskemaet, indgrebet og reaktionsbrøken. Trinene er som
regnefiguren i bogen: vælg det tal, hver koncentration ganges med; klik på
hver koncentration, så faktoren kommer på (lilla, også inde i en potens);
find *Y* lige efter; find retningen. Når *Y* er fundet, står det på tallinjen,
og når retningen er fundet, går det hen til *K*. De forkerte svar på *Y* er den
glemte potens og den vendte brøk.

1. Cobalt fortyndes til dobbelt rumfang: 16 · *K*, mod venstre.
2. N₂O₄ ⇌ 2 NO₂, rumfanget halveres: 2 · *K*, mod venstre.
3. N₂ + 3 H₂ ⇌ 2 NH₃, rumfanget halveres: ¼ · *K*, mod højre.
4. PCl₅ ⇌ PCl₃ + Cl₂, dobbelt rumfang: ½ · *K*, mod højre.
5. CO + H₂O ⇌ CO₂ + H₂, rumfanget halveres: *K*, ingen forskydning.
6. Cu²⁺ + 4 Cl⁻ ⇌ CuCl₄²⁻ fortyndes til 4 gange rumfanget: 256 · *K*, mod venstre.

## Modellen og forenklingerne

* `js/model.js` regner ligevægten ud med halvering på ln *Y* − ln *K* for en
  liste af stoffer og koefficienter. Partiklerne følger: for hvert helt omfang
  bliver én reaktionsenhed lavet om.
* Fane 1: et molekyle står for 0,020 mol. 4 N₂O₄ og 10 NO₂ i 2,0 L giver
  *K* = 0,25 M (samme størrelse som kapitlets tal). Ved 1,0 L er ligevægten 5,03
  og 7,93 (tegningen 5 og 8), ved 4,0 L 2,94 og 12,12 (3 og 12); tegningens tal
  passer med *K* inden for 5 %. Temperaturen er fast.
* Fane 2: tallene er bogens figur B2.10, og *K* er givet i partikler pr. 25 mL,
  fordi kun forholdet *Y* / *K* bruges. Ved 50 mL er ligevægten 0,98 CoCl₄²⁻, 2,02
  Co²⁺ og 14,06 Cl⁻ (tegningen 1, 2 og 14), ved 100 mL 0,19, 2,81 og 17,2 (0, 3
  og 18). I virkeligheden er der langt flere chloridioner end cobaltioner.
* Farven i fane 2 er en blanding af blå og lyserød efter andelen af cobalt i
  CoCl₄²⁻, hvor den blå ion vejer 2,5 gange så meget, blandet med hvidt efter
  koncentrationen. I virkeligheden farver CoCl₄²⁻ omkring 100 gange kraftigere
  pr. ion end Co²⁺(aq), så en opløsning er blåviolet, længe efter at de fleste
  blå ioner er omdannet. Vægten 2,5 er valgt, så 25 mL er blå, 50 mL violet og
  100 mL lyserød, som i et rigtigt forsøg, hvor man fortynder fra koncentreret
  saltsyre.
* Skemaet med cobalt skrives uden vand, som Kemibogen og brugerens øvelse
  skriver Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq). Eleverne har ikke haft komplekskemi.
* Tallinjen er logaritmisk med 1,2 tierpotenser til hver side af *K*, og *Y*
  står som et tal gange *K* (2 · *K*, 16 · *K*). 256 · *K* står ved enden.

## Filer

| Fil | Indhold |
|:--|:--|
| `index.html` | toplinjen, de tre faner, teorien og rundvisningen |
| `css/stil.css` | stilarket fra `sb2.2` (uændret) |
| `js/kerne.js` | fælles hjælpere (fra `sb2.2`) |
| `js/model.js` | kemien: de to ligevægte og reaktionsbrøken |
| `js/data.js` | alle mål og tekster; kan rettes uden at røre koden |
| `js/tegning.js` | molekylerne, ionerne, tallinjen, brøken, knapperne, cylinderen, måleglasset og danserne |
| `js/fane.js` | det, fanerne har til fælles (fra `sb2.2`, nøglen i browserens lager er `nk-sb2.6-`) |
| `js/sim_stempel.js` | fane 1 |
| `js/sim_fortynd.js` | fane 2 |
| `js/sim_regn.js` | fane 3 |
| `js/rundvisning.js` | rundvisningen bag `?` |
| `js/app.js` | faneskift, teorien, genveje og tegneløkken |
| `_selvtest.html` | selvtesten (udviklerværktøj) |
| `_skaerm.html` | skærmbilleder af et bestemt trin (udviklerværktøj, se kommentaren øverst) |

## Genveje

1, 2 og 3 skifter fane, R stiller beholderen op igen, H viser rundt, T åbner
teorien, Esc lukker. Enter presser stemplet eller hælder vandet i, når opgaven
beder om det. Direkte links: `index.html#stempel`, `#fortynding`, `#regn`.

## Selvtest

`_selvtest.html` gennem en lokal server med `animationer/` som rod. 20. november
2026: ALT OK (82 påstande) på Linux. Den kontrollerer modellens tal mod
teksterne og figur B2.10 (5 og 8, 3 og 12, 0,16 M, 1, 2 og 14, 16 · *K*), at
faktorerne, *Y* og retningen passer i alle seks regneopgaver, at alle 14 mål kan
løses selv, med forkerte svar først og med Vis svaret, tallene i panelet,
låsen, tekstlængderne og sproget (også at jernthiocyanat ikke er med, og at
vand ikke står i skemaet for cobalt), og at kortet holder sig i sin zone fra
1100 × 620 til 1600 × 950. Anden runde samme dag: ALT OK (85 påstande), også at
stilladset får delene frem ét trin ad gangen, og at danserne taler.

## Panelet og store skærme (20. november 2026, tredje runde)

Brugeren: "beregningsdelen i højre side bør være foldet ind som default", på
store skærme fyldte mikrofiguren for lidt og aksen med Y for meget, og
knapperne Dansere og Molekyler skulle stå over figuren.

* Tallene i panelet er foldet ind fra start bag knappen Vis tallene
  (`NK.fold` i `js/app.js`). En opgave, der handler om panelet (`om: ["panel"]`),
  folder dem selv ud.
* Cylinderen og måleglasset er 40 % af scenens bredde (200 til 520 billedpunkter),
  og molekylerne, danserne og ionerne vokser med (`lay.k`, op til 1,45). Tallinjen
  er højst 560 bred og står midt i højre side.
* Knapperne Molekyler og Dansere står over cylinderen. Rammer de håndtaget, når
  stemplet er trukket helt op, rykker cylinderen 30 ned. "Lige efter indgrebet"
  står ved siden af cylinderen.

## Menuen

I menuen fra 20. november 2026 (brugeren: "du må gerne sætte den i menuen"):

* `kemi-b-filer/samling_b2.html`: knap 7 "Rumfang og fortynding" med koden `b2.6`
  og en ny beskrivelse.
* Den gamle `b2.6_volumenændring.html` er flyttet med `git mv` til
  `kemi-c-filer/arkiv/b2.6_volumenændring_oldversion.html`.
* `FEEDBACK_EMNER` i `samling_alt_b.html` under B2 hedder nu Rumfang og fortynding,
  og `index.html` har linjen til `til_panelet.js` med `data-emne="b2.6"`.
* Kemibogen: Prøv selv-linjerne i B2.4 og A1.4 (A1.4 med `#stempel`) og i slidesene
  til B2 peger hertil. Den byggede bog på kemibogen.dk peger på den gamle adresse,
  til bøgerne lægges ud igen.
