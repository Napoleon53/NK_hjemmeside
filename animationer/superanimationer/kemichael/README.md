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
