# Kemichael i superanimationerne

Figuren, bevægelserne og replik-puljerne står i `../../v2/kemichael/kemichael.js`.
Den fil er frosset og rettes ikke. `superanimation.js` her lægger sig oven på den
i alle superanimationer og indlæses lige efter den:

```html
<script src="../../v2/kemichael/kemichael.js"></script>
<script src="../kemichael/superanimation.js"></script>
```

## Hvordan han er her

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

## Når han præsenterer eller introducerer

Brugerens ønske 3. oktober 2026, efter `sc8.1_spaendingsraekken`: "Det er fint
at Michael introducerer, men det skal være direkte rettet imod at give
forståelse for hvordan man bruger animationen (og måske hvad der trænes)."
Hans kommentarer var ofte uklare, vrøvlede og svære at følge med i, og en af
dem lå gemt bag noget i animationen. Det gælder hver gang, han præsenterer en
fane eller introducerer noget, også kort fra sit hjørne:

* **Kun brugen.** Hver linje siger én ting: hvad fanen træner, eller hvordan en
  bestemt ting bruges ("Her står fem metalstænger. Træk en stang ned i et
  glas."). Første linje er, hvad fanen træner. Intet, eleven selv kan se, og
  intet om ham selv.
* **Skarpt, ikke vittigt.** Hele, korte sætninger i almindeligt dansk, som kan
  forstås uden at kende scenen. Ingen vittigheder, ordspil, gåder eller halve
  sætninger i en præsentation. Tørheden hører til kaffen, prikkene og
  påskeæggene. Den gamle tredje linje med en tør bemærkning ("Stængerne er
  pudset. Det tog hele frikvarteret.") er afskaffet.
* **Han peger, og det, han peger på, blinker.** Hver linje om en ting har et
  mål: knappen, feltet eller tingen i scenen. Armen går mod målet, og målet får
  en gul ramme, der blinker, så der ikke er tvivl om, hvad han mener. Det
  gælder også knapper og kort i panelet og i toplinjen.
* **Eleven trykker Næste.** Linjen bliver stående, til eleven trykker Næste.
  Han går aldrig videre på tid. Knappen står i taleboblen sammen med trinnets
  nummer (2/6) og Spring over; den sidste hedder Afslut. Enter og pil til højre
  er Næste, Esc springer over.
* **Intet dækker boblen, og boblen dækker ikke målet.** Taleboblen ligger
  øverst, over alt i scenen, og står det sted ved hans hoved, der dækker mindst
  af det, han peger på. Han står ikke selv foran det.
* **Ros og replikker uden for præsentationen** skrives også som hele sætninger,
  der kan forstås alene ("Rækkefølgen er rigtig. Du har selv fundet
  spændingsrækken."), ikke som hentydninger til en vittighed.

Mønsteret er `sc8.1_spaendingsraekken`: trinnene står som data
(`D.INTRO_*` i `js/data.js`: en tekst og en CSS-selector for det, der skal
blinke), `js/praesentation.js` har taleboblen som HTML oven på scenen, Næste og
rammen (`NK.Fremhaev`), og `js/laerer.js` har figuren (`laererIntro`,
`introNaeste`, `introStatus`, `introHoved`). Selvtesten tjekker, at han ikke
går videre af sig selv, at rammen står om målet, og at boblen ikke dækker det.
De andre ældre præsentationer (tre linjer på tid) er ikke rettet endnu; de
rettes efter samme mønster, når brugeren beder om det. Nye superanimationer
får stadig ingen præsentation (se `../README.md` under "Kemichael").

## Kaffeforløbene

| Id | Hvad der sker |
|----|---------------|
| `kold` | drikker, sukker: "Kold. Som altid." |
| `varm` | drikker, damp af ørerne: "Den var varm. Det sker én gang om året." |
| `tom` | vender koppen: "Tom. Og jeg har ikke drukket den." |
| `ud` | "Der drikkes ikke i laboratoriet." Drikker uden for døren |
| `stirrer` | kigger over brillerne længe: "Ja." |
| `glasstav` | "Nogen har rørt i den med en glasstav." |
| `ligevaegt` | "Rumtemperatur. Det er også en ligevægt." |
| `regnskab` | fra tredje kop: "Det er kop nummer 3 i regnskabet." |
| `sprut` | spytter ud: "Den har stået siden i morges." |
| `kaktus` | hælder resten til Bunsen |
| `kittel` | kaffe på kitlen |
| `gave` | koppen var en gave fra en klasse |
| `tavs` | ser på eleven og siger ingenting |
| `loeber` | løber ind: "Nej." og tager koppen |
| `tilbud` | "Vil du smage?" "Nej. Det vil du ikke." |
| `maalt` | "Der mangler 20 mL. Jeg målte den i morges." |
| `fortyndet` | "Nogen har fortyndet den." |
| `fingeraftryk` | "Fingeraftryk. Den skal til analyse." |
| `bundfald` | kigger ned i den: "Der er bundfald i. Det er der altid." |
| `stinkskab` | "Den står i stinkskabet fra nu af." |
| `faremaerke` | rører den ikke: "Den skal have et faremærke." |
| `navn` | holder koppen op: "Der står mit navn på. BEDSTE LÆRER." |
| `tager` | tager koppen og går uden et ord |

`sc4.5_maengdeberegning` (den rolige Kemichael) og `sc7.1` (hydronen i kaffen)
har deres egne kaffe-replikker i `js/data.js`.
