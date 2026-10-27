# sb8.6 TLC

Superanimation om tyndtlagschromatografi til afsnit B8.6 i Kemibogen B (kapitel B8
Medicin). Bygget fra bunden 27. okt. 2026. I menuen som B8 Medicin nr. 1.

## Bestillingen

Brugeren 27. okt. 2026: "Vi har lavet en animation til en medicinforsøg om salenvir
hvor der indgår TLC. Men jeg kunne godt tænke mig en mere generel lærerig
superanimation, som fokuserer på teorien og anvendelsen af TLC, som kan bruges til
animationspanelet."

1. **Pointen i én sætning.** Hvor langt et stof løber på en TLC-plade, afgøres af
   tovtrækningen mellem den polære plade og løbevæsken, og Rf-værdien gør det til et
   tal, man kan bruge til at genkende stoffer og se, om en prøve er ren, eller en
   reaktion er færdig.
2. **Hvad den afløser.** Intet. Bygget fra bunden. Ordene, tallene og eksemplerne er
   bogens (B8.6 og opgaverne B8.6.1 til B8.6.mad.3).
3. **Naboerne.** `sb4.9_salenvir` ejer TLC som ét trin i én syntese (P og R under
   UV-lampen) og røres ikke. `sb4.4` ejer hydrogenbindinger og kogepunkter; her er
   hydrogenbindingen kun det, der holder stoffet på pladen. Spektrofotometri og
   mængden (B8.7, `sb9.x`) er ikke med: TLC er kvalitativ, og det er det eneste, der
   siges om mængden. Fremstillingen af acetylsalicylsyre (B8.5) er kun brugt som
   reaktionen, der følges.
4. **Loftet.** Tre faner. Fane 1: fire farvestoffer, fire løbevæsker, to baner, seks
   opgaver. Fane 2: højst tre pletter på en plade, fem opgaver. Fane 3: højst fem
   baner, seks sager, tretten stoffer. På skærmen: kar, plade, lup og fire flasker
   (fane 1); plade, lineal, lup over linealen og notesblok (fane 2); kar, plade og
   UV-kasse (fane 3).
5. **Layoutet.** Scene plus et smalt panel (320 px) med opgavelisten. Al tekst står på
   kortet øverst i midten (`sb4.4`'s ramme: Indsend svar, vælg alle, der passer,
   stjerne kun uden fejl og uden Vis svaret, låsen).

Stop-listen blev gennemgået: der er et kar og flasker, men ingen hældning med musen,
intet stativ, intet affaldsglas, ingen uheld og intet forløb trin for trin. En flaske
er en knap, der fylder karret (som heptanhanen i `sc3.2`).

## Fanerne

* **Tovtrækningen** (`#tovtraekning`). Et kar med en plade med gulerod og spinat, fire
  flasker fra upolær til polær (heptan, 9 : 1, 7 : 3, propanon) og en lup over banen
  med spinat. Luppen er skjult, til en del spørger til den (Hvem holder fast? og sidste
  spørgsmål i Ren propanon), og bliver så opgaven ud; knappen Vis luppen (og krydset)
  viser og skjuler den når som helst. Nøglen i panelet står under opgaverne og vises kun
  sammen med luppen, så intet andet flytter sig. Opgaverne: gæt og kør spinat (den grønne plet deles i fire), find
  caroten ud fra gulerod, klik på den stationære og den mobile fase i karret, hvorfor
  lutein løber kortere end caroten (luppen), gæt og kør ren heptan og ren propanon,
  og find selv den løbevæske, der skiller bedst ad.
* **Rf-værdien** (`#rf`). En tør plade på bordet med en lineal. En gul streg følger
  musen, og en lup ved linealen viser millimeterne; et klik låser stregen. Felterne
  står på kortet: aflæs fronten og pletten, vælg formlen (tre brøker), sæt tallene ind
  i brøken og regn ud. Så tre pletter, en lineal med 0 ved pladens kant, den lange
  plade (træk pletten derhen, hvor stof X med Rf 0,40 ender) og hvilke tal der kan
  være en Rf-værdi. Notesblokken samler tallene som pæne beregninger.
* **Læs pladen** (`#laes`). Seks sager: chokoladelinser (dagslys), hovedpinetabletten
  (UV-lampen indføres), er reaktionen færdig (salicylsyre til acetylsalicylsyre), er
  produktet rent (paracetamol med rester af 4-aminofenol, så omkrystalliseret), pillen
  fra nettet (løber som ibuprofen i ethylethanoat, men ikke i 1 : 1: det er naproxen)
  og koffein i drikke (TLC er kvalitativ). Pladen flytter fra karret over i en UV-kasse
  tegnet som bogens figur.

## Modellen (`js/model.js`)

Et molekyle springer mellem at sidde fast på pladen og at være opløst i løbevæsken og
flytter sig kun i væsken. Er k forholdet mellem tiden på pladen og tiden i væsken, er
Rf = 1 / (1 + k): Rf er andelen af tiden i væsken. Snyders model: log k = A · (s − ε),
hvor ε er løbevæskens eluentstyrke på kiselgel (heptan 0,00, ethylethanoat 0,48,
propanon 0,53; blandingerne regnet med Snyders formel for to væsker). A og s regnes for
hvert stof ud fra to Rf-værdier i `js/data.js`.

Luppen (`js/lup.js`) bruger den samme model: hvert farvestofmolekyle hopper på og af
pladens OH-grupper med rater, så andelen af tiden fast er 1 − Rf. Raterne er ganget med
`ROLIG` (0,4), så bindingerne ikke blinker; forholdet og andelen er de samme. Propanon sætter sig
selv på OH-grupperne og skubbes kun væk af et farvestof. Selvtesten måler andelen i
luppen og sammenligner med modellen.

Væskefronten stiger efter Washburn (højden over væsken vokser med kvadratroden af
tiden). Pletterne bliver bredere, jo længere de løber.

## Tallene og forenklingerne

* Rf-værdierne er aflæst i bogens figurer (SVG-filerne i `Kemibogen/b/figurer`):
  acetylsalicylsyre 0,60, paracetamol 0,38, koffein 0,15, ibuprofen 0,75 (i
  ethylethanoat; bogen nævner ikke løbevæsken), caroten 0,92, klorofyl a 0,55,
  klorofyl b 0,45, lutein 0,25 (heptan og propanon 7 : 3), de tre farvestoffer i
  chokoladelinser 0,30, 0,55 og 0,75 og koffein 0,45 (ethylethanoat og ethanol 9 : 1,
  som i opgave B8.6.mad.3).
* Den anden Rf-værdi for hvert stof er valgt, så stoffet opfører sig som i et
  skoleforsøg: caroten løber også i ren heptan, lutein og klorofyl bliver ved
  startlinjen, og alt løber næsten op i ren propanon. Naproxen er valgt, så det løber
  præcis som ibuprofen i ethylethanoat og kortere i 1 : 1. Salicylsyre løber over
  acetylsalicylsyre (den indre hydrogenbinding i salicylsyre).
* Løbevæsken til chokoladelinserne er kaldt ethanol og vand (1 : 1); farvestofferne har
  kun én Rf-værdi og bruges kun dér.
* Luppen viser kun caroten og lutein (samme skelet, lutein har en OH-gruppe i hver
  ende). Klorofyl er udeladt for overskuelighedens skyld. Molekylerne er kugle-og-pind
  af de tunge atomer og H på O.
* Pladerne på fane 2 har farvede pletter, så der ikke skal bruges UV-lampe dér.
* Løbetiden er 6,5 s i stedet for 10 til 20 minutter. Der er intet ur.

## Påskeæg

Tre klik på startlinjen på fane 1: startlinjen bliver tegnet med kuglepen, og på den
næste plade løber blækket op som et blåt og et violet bånd (Maltes fejl i opgave
B8.6.5).

## Filerne

| Fil | Indhold |
|:--|:--|
| `index.html` | toplinjen, de tre faner, teorien og rundvisningen |
| `css/stil.css` | fra `sb4.4`; nyt nederst under SB8.6 |
| `js/kerne.js` | fælles hjælpere (som `sb4.4`) |
| `js/data.js` | løbevæskerne, stofferne, opgaverne og alle tekster |
| `js/model.js` | Rf-modellen og pladen |
| `js/sprites.js`, `sprites/` | karret (bag- og forside), låget og flasken (fra `sb4.9`) |
| `js/tegning.js` | pladen, karret, flaskerne, UV-kassen, linealen, ringe og skilte |
| `js/lup.js` | luppen på fane 1 |
| `js/fane.js` | kortet, delene (gæt, forsøg, opgave, felt, spørgsmål), hint, Indsend og låsen |
| `js/sim_pladen.js`, `js/sim_rf.js`, `js/sim_laes.js` | de tre faner |
| `js/rundvisning.js`, `js/app.js` | rundvisningen bag ? og faneskift, taster og tegneløkken |
| `_selvtest.html` | selvtesten (kræver en lokal server) |
| `_sprites.html` | tegningerne alene |

Teksterne rettes i `js/data.js`. Rf-værdierne rettes i `STOF`; selvtesten tjekker, at
bogens tal stadig rammes, og at 7 : 3 skiller spinat ad, mens de andre ikke gør.

## Selvtest

`_selvtest.html` gennem en lokal server med `animationer/` som rod: ALT OK (196
påstande) 27. okt. 2026. Den tjekker bogens Rf-værdier, løbevæskernes opførsel,
luppen mod modellen, at alle 17 opgaver kan løses selv (med stjerne) og med Vis
svaret, de typiske fejl i felterne (toppen eller bunden af pletten, målt fra kanten,
brøken byttet om, afrundet for meget), låsen, sproget, kortets højde på 1100 × 700,
1366 × 768 og 1600 × 950, og at det er roligt: luppen kun der, hvor den spørges om, og
to billeder af hver opgave med 1,3 s imellem er ens, før eleven gør noget.

## Roligt

Brugeren 27. okt. 2026: "Der sker for meget i animationen på en gang... meget flimmer,
så det er lidt svært at se hvad det er man skal kunne, når der sker alt mulig i
baggrunden." Derfor: luppen er skjult uden for de dele, der spørger til den; i luppen
står de faste molekyler stille, væsken løber langsommere, og pilene står stille; de
gule ringe pulserer ikke, og de gule skilte vipper ikke. Det eneste, der bevæger sig af
sig selv, er luppen, når den vises, og pladen, mens den løber.

## I menuen

27. okt. 2026 (brugerens ønske: "lav en ny kategori til medicin som er nummer 8. Der
kommer flere til medicin senere"): ny `kemi-b-filer/samling_b8.html` (kopi af
`samling_b7.html`) med denne som nr. 1 "TLC" og koden `b8.6`; B8 Medicin står i
`samling_alt_b.html` (knap, `findSideFraEmne` med `^b8`, `FEEDBACK_EMNER`) og i listen på
`animationer.html`. Kemibogen B8.6 kan linke til
`animationer/samling_alt_b.html?emne=b8.6` i "Prøv selv" ved siden af Salenvir.
