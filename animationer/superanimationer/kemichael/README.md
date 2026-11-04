# Kemichael i superanimationerne

Figuren, bevægelserne og replik-puljerne står i `../../v2/kemichael/kemichael.js`.
Den fil er frosset og rettes ikke. `superanimation.js` her lægger sig oven på den
i alle superanimationer og indlæses lige efter den:

```html
<script src="../../v2/kemichael/kemichael.js"></script>
<script src="../kemichael/superanimation.js"></script>
```

## Brugerens regler fra 4. november 2026

Niels: "I de animationer, hvor han præsenterer noget, bruger han et
forfærdeligt talesprog, som fordummer det lidt. Han må meget gerne snakke
helt formelt (altid), og det ville være bedre, hvis han sagde lidt mere ad
gangen under introduktion, men at man så havde 2 knapper. En til næste og
en til skip præsentationen. Når han kommer ind og forstyrrer
opgaveregningen, skal det ske ret sjældent. Det skal være fordi man har
gennemført animationen eller gør noget vildt ... eller fordi han faktisk
har noget sjovt at sige." Sproget blev valgt samme dag: som Kemibogen,
også i kaffen og påskeæggene.

### Sproget: altid formelt

Alt, hvad han siger, er letforståeligt og skarpt skriftsprog i du-form,
målt mod Kemibogens kapitel 1 (se "Sprog" i `NK_Undervisning/Kemibogen/CLAUDE.md`).
Det gælder præsentationen, rosen, påskeæggene, kaffen og prik.

* Hele sætninger. Ingen stumper som "Lageret.", "Kold. Som altid.",
  "Ja." eller "Ti i træk.". Skriv "Kaffen er kold. Det er den altid."
* Intet talesprog: ikke "går plus og minus op", "Opgaverne starter du
  her", "så kan vi regne ...". Præcise udsagnsord (består af, viser,
  dannes, reagerer med).
* Nævn selv tingen, i stedet for at pege med "her", "den" eller "det
  her" ("Luppen viser metalstangen ...", ikke "Her ser du ..."). Ingen
  linje begynder med "Her".
* Ingen indskudte sætninger og ingen tankestreger.
* Tørheden må gerne blive i påskeæg, kaffe og prik, men som hele
  sætninger ("Metalstangen skal ikke ned i min kaffe. Kaffen er sur nok
  i forvejen."). I præsentationen er han ikke vittig.

### Præsentationen: mere ad gangen, to knapper

Koden er fælles: `praesentation.js` og `praesentation.css` i denne mappe.

* **To til fire trin pr. fane**, typisk tre. Hvert trin er **to til fire
  hele sætninger** (ca. 120-320 tegn). Første trin siger, hvad fanen
  træner, og hvad eleven gør. De næste samler det, der hører sammen
  (fx "tingene i scenen", "kortet og hjælpen"). Sidste trin nævner
  opgavekortet og hintknappen, hvis fanen har opgaver.
* **Taleboblen har to knapper:** "Næste" (på sidste trin "Afslut") og
  "Spring præsentationen over". Han går aldrig videre på tid. Enter og
  pil til højre er Næste, Esc springer over.
* **Han peger, og det, han peger på, blinker** med en gul ramme. Et trin
  må pege på flere ting (`sel` og `felt` kan være lister).
* Tilbuddet "Start præsentation" / "Nej tak" første gang en fane åbnes,
  og tasten K, er som før.
* Boblen er et lyst papirkort med Lexend som scenekortet og står ved hans
  hoved, dér hvor den dækker mindst af det, han peger på.

Trinnene står i animationens `js/data.js`:

```js
D.INTRO_FORSOEG = [
    { tekst: "I denne fane undersøger du ... To til fire hele sætninger.",
      sel: ["#fs-anker-holder", "#fs-anker-glas"] },     // CSS-selectorer
    { tekst: "...", felt: "lup" },                        // tegnet på lærredet
    ...
];
```

`felt` er noget, der er tegnet på lærredet: fanen svarer på
`introFelt(navn)` med `{ x, y, b, h }` i lærredets pixels. `sel` er noget
på siden (panelet, kortet, en knap) eller et usynligt `.anker` over
lærredet.

Sådan kobles en fane på (mønster: `sc8.1_spaendingsraekken`):

1. `index.html`: `<link rel="stylesheet" href="../kemichael/praesentation.css">`
   efter stil.css og `<script src="../kemichael/praesentation.js"></script>`
   i stedet for `js/praesentation.js` (som slettes). Den gamle knap
   "Spring præsentationen over" og gamle bobler i HTML'en fjernes;
   boblen bygger sig selv.
2. `js/laerer.js`: efter `K.paa(P, ...)` og fanens egne metoder kaldes
   `NK.Praesentation.trin(P)`. Den gamle præsentation på tid
   (`introTrin`, `laererIntro`, `laererIntroVaek`, `laererIIntro`,
   `laererIntroKlik`) slettes. Fanen skal have `introLinjer()`,
   `laererLaerredSkala()`, `laererPlads()` og evt. `introFelt(navn)`.
3. Fanen kalder `this.opdaterIntro(dt)` hvert billede (via
   `NK.Praesentation.kobl`) eller, i de ældre med `pakInd`, intet: boblen
   opdaterer sig selv, så længe præsentationen står.
4. `_selvtest.html`: `NK.Praesentation.selvtest(sim, koer, start)` giver en
   liste af [påstand, ok, note] for hver fane. `start` er valgfri (de
   ældre med `pakInd` og `medId` giver fx `function () { sim.startIntro(id, true); }`).

Andet, den fælles kode gør: en replik, der kommer under præsentationen
(ros, påskeæg), venter og bliver sagt, når eleven trykker Afslut eller
springer over. `NK.Praesentation.trin(P, { plads: function () { ... } })`
giver ham en egen plads under præsentationen, når han ellers ville stå
foran det, han taler om. `P.introArm = function (punkt, linje) { ... }`
lader fanen selv vælge armens vinkel (han peger kun med højre arm, så et
mål til venstre for ham eller over ham kan kræve, at armen hænger, mens
han kigger derhen). Står en præsentation på en fane, eleven har
forladt, fortsætter den, når eleven kommer tilbage, og tasterne går til
den præsentation, der kan ses.

### Hvornår han kommer ind af sig selv

Han kommer kun ind uopfordret, når

1. **eleven har gennemført noget helt**: en hel fane eller hele
   animationen (alle niveauer, alle opgaver). Én replik, én gang.
2. **eleven gør noget vildt**: et påskeæg, fx en stang over kaffen, et
   glas, der koger over, en tom burette, noget i brand.
3. **han har noget sjovt at sige**: højst én sådan replik pr. fane pr.
   besøg, knyttet til noget sjældent, eleven gør. Er den ikke sjov, så
   slet den.

Han kommer **ikke** ind for at rose et enkelt svar, et niveau undervejs,
en delopgave eller en stribe rigtige svar, for at kommentere et forkert
svar, for at give næste skridt eller fordi tiden går. Rosen til et svar
står i scenekortet. Under præsentationen venter alle andre replikker.
Kaffen og prik (klik på ham) er elevens eget valg og bliver.

## Hvordan han er her (25. sept. 2026)

Kemichael er en, man helst undgår. Han siger ikke noget uopfordret og kommer kun,
når noget kalder på ham: præsentationen, et mål, der er nået, et påskeæg, et prik
eller hans kaffe. Brugerens ønske 25. september 2026.

* **Intet baggrundsliv.** Han kommer ikke forbi med en kasse og kigger ikke ind,
  fordi eleven ikke har rørt noget i et stykke tid.
* **Kaffen.** Klik på koppen giver et af 23 forløb (`KAFFE`). Han passer på sin
  kop: han mistænker eleven, tager den med eller stirrer bare. Forløb, der var
  søgte, er taget ud (koppen, der skulle stå højere, "Koncentrationen er min",
  kagen om fredagen, navneskiltet og stikkontakten).
* **Prik og farvel.** Svarene er korte. Replikker, der lød konstruerede, er taget
  ud af `prik1` til `prik4` og `gaaUd`.

Nye kaffeforløb og replikker skrives i `superanimation.js`, ikke i den frosne fil
og ikke som særtilfælde i en animation. Formatet for et kaffeforløb (`h.sig`,
`h.drik`, `h.vip` osv.) står over `KAFFE` i `kemichael.js`.

## Når han præsenterer eller introducerer (3. okt. 2026, afløst)

Reglerne fra 3. okt. 2026 (kun brugen, han peger, og det blinker, eleven
trykker Næste, intet dækker boblen) gælder stadig, men "korte linjer" og
"ét trin pr. ting" er afløst af reglerne fra 4. nov. 2026 ovenfor: færre
og fyldigere trin i formelt sprog og den fælles boble med to knapper.

## Kaffeforløbene

| Id | Hvad der sker |
|----|---------------|
| `kold` | drikker, sukker: "Kaffen er kold. Det er den altid." |
| `varm` | drikker, damp af ørerne: "Kaffen var varm. Det sker én gang om året." |
| `tom` | vender koppen: "Koppen er tom, og jeg har ikke selv drukket kaffen." |
| `ud` | "Der drikkes ikke i laboratoriet." Drikker uden for døren |
| `stirrer` | kigger over brillerne længe: "Ja, det er min kaffe." |
| `glasstav` | "Nogen har rørt i min kaffe med en glasstav." |
| `ligevaegt` | "Kaffen har nået rumtemperatur. Det er også en ligevægt." |
| `regnskab` | fra tredje kop: "Det er kop nummer 3 i regnskabet." |
| `sprut` | spytter ud: "Kaffen har stået her siden i morges." |
| `kaktus` | hælder resten til Bunsen |
| `kittel` | kaffe på kitlen |
| `gave` | koppen var en gave fra en klasse |
| `tavs` | ser på eleven og siger ingenting |
| `loeber` | løber ind: "Nej, det er min kaffe." og tager koppen |
| `tilbud` | "Vil du smage?" "Nej, det vil du ikke." |
| `maalt` | "Der mangler 20 mL. Jeg målte den i morges." |
| `fortyndet` | "Nogen har fortyndet min kaffe." |
| `fingeraftryk` | "Der er fingeraftryk på koppen. Den skal til analyse." |
| `bundfald` | kigger ned i den: "Der er bundfald i kaffen. Det er der altid." |
| `stinkskab` | "Koppen står i stinkskabet fra nu af." |
| `faremaerke` | rører den ikke: "Den kop skal have et faremærke." |
| `navn` | holder koppen op: "Koppen har mit navn på. Der står BEDSTE LÆRER." |
| `tager` | tager koppen og går uden et ord |

`sc7.1` (hydronen i kaffen) har sine egne kaffe-replikker i `js/data.js`.
Den rolige Kemichael ved katederet (`sc5.5` og ni andre) er taget ud 9. okt.
2026; se "Kemichael" i `../README.md`.
