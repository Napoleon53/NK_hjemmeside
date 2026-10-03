# sb2.1 Ligevægtsloven

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-b-filer/b2.1_ligevaegtsloven.html`, men er
**ikke i menuen** endnu. Den gamle står urørt i menuen, til brugeren siger til.

## Bestillingen (2. oktober 2026)

Brugeren: "Lav b.2.1 om til en super-animation". Bestillingen er skrevet af
Claude uden at spørge, som ved sc1.4.

1. **Pointen:** Reaktionsbrøken læses af reaktionsskemaet: produkterne over
   brøkstregen, reaktanterne under, koefficienterne som eksponenter, og faste
   stoffer og opløsningsmidlet er ikke med.
2. **Afløser b2.1.** Med fra den gamle: de ti reaktioner i samme rækkefølge
   med de samme stoffer i bakken (de rigtige og nogle, der ligner), brikkerne
   · + − 1 og eksponenterne 2, 3 og 4, træk og slip med en grøn streg, der
   viser, hvor brikken lander, klik som genvej (bakken › den blå zone, brøken
   › væk), beskederne til de typiske fejl, facit som en rigtig brøk med
   forklaringen, K<sub>s</sub>, K<sub>b</sub> og K<sub>v</sub>, at arbejdet i
   hver opgave huskes, når man springer rundt, at en påbegyndt opgave er gul
   i listen, quizzen med de fem spørgsmål og teorien. Taget ud: point,
   partikelbaggrunden og fyrværkeriet, sejrsskærmen og boksen Hjælp (afløst
   af `?`). Nyt: skemaet på en tavle, hvor stofferne kan klikkes, statuslinjen
   med hinttrappen, at skemaet bliver farvet, når brøken er rigtig, to nye
   reaktioner (jernthiocyanat og blyiodid) og fane 2.
3. **Naboerne:** sb2.0 ejer dynamisk ligevægt (ikke i menuen), b2.2 ejer
   indgreb og Le Chatelier, b2.3 ejer beregninger med K, b2.5 ejer Y mod K
   og b2.6 rumfanget. Her regnes ingen tal, og K's værdi bruges kun i
   quizzens to spørgsmål fra den gamle (temperaturen og enheden).
4. **Loftet:** to faner. Fane 1 har 12 reaktioner med 6 stoffer i bakken,
   4 tegn og 3 eksponenter. Fane 2 har 12 tavler, hver med én typisk fejl
   eller ingen (to af dem). Quizzen har 5 spørgsmål.
5. **Layoutet:** scene plus panel. Opgaven står på én linje over tavlen,
   tavlen har skemaet og brøken, bakken står under tavlen og statuslinjen
   nederst. Panelet har opgavekortet (forklaringen kommer, når opgaven er
   løst) og listen.

Kemichael er ikke med. Hjælpen står i statuslinjen som i `sc1.4_afstemning`
(brugerens valg dér 30. sept. 2026: hans hint var det svageste led).

## Fane 1: Brøken

Tavlen har skemaet og under det K = en tom brøk. Eleven trækker brikker fra
bakken op i tælleren og ned i nævneren. Den zone, der er blå, får brikken
ved et klik. Tjek brøken (eller Enter) dømmer brøken med `js/broek.js`.

Når brøken er rigtig, kommer stemplet **Rigtigt ✓**, tavlen bliver grøn, og
skemaet bliver farvet: produkterne grønne som tælleren, reaktanterne blå som
nævneren, koefficienterne gule som eksponenterne, og det, der ikke er med,
er streget ud. Er nævneren tom, står der 1. Forklaringen fra den gamle står
i kortet i panelet.

Et klik på et stof i skemaet siger, hvilken side af pilen det står på, og hvad
tilstandsformen betyder, men ikke, om det skal med.

## Fane 2: Find fejlen

En elev har skrevet reaktionsbrøken på tavlen. Hver del kan klikkes. En rigtig
del får et grønt flueben, og linjen siger hvorfor ("[H₂] er rigtig. H₂ står
før pilen, så det står i nævneren."). Fejlen får en rød ring, og den rettede
brøk kommer frem under den. To tavler har ingen fejl; dér er svaret knappen
Ingen fejl, og den godtages ikke, når der er en fejl.

| Tavle | Fejlen |
|-------|--------|
| PCl₅ | + mellem leddene |
| HBr | 2·[HBr] i stedet for [HBr]² |
| 2NO + O₂ | [NO] mangler eksponenten 2 |
| Kontaktprocessen | ingen fejl |
| N₂ + O₂ | tæller og nævner byttet om |
| Ammoniaksyntesen | [3H₂] i stedet for [H₂]³ |
| Flussyre | [H₂O] i nævneren |
| Sølvchromat | det faste stof i nævneren |
| Methanolsyntesen | [H₂]³ i stedet for [H₂]² |
| Vandgasskiftreaktionen | ingen fejl (H₂O(g) skal med) |
| Kul og CO₂ | [C] i nævneren |
| Vands autoprotolyse | [H₂O]² i nævneren |

## Beskederne og hintet

Alt er regnet af skemaet og elevens brikker (`B.dom` i `js/broek.js`). Tælleren
tjekkes før nævneren, og den første fejl får beskeden:

| Fejlen | Beskeden |
|--------|----------|
| + eller − | Der står + i nævneren. Det hører ikke hjemme i en reaktionsbrøk. |
| to stoffer uden tegn | Der mangler et tegn mellem [N₂] og [H₂]. |
| · forrest, bagerst eller to i træk | En gangeprik i tælleren har ikke et stof på begge sider. |
| 1 sammen med andet | 1 står sammen med andre brikker i nævneren. |
| eksponent forrest, to eksponenter | Eksponenten ² står ikke lige efter et stof. |
| hele brøken vendt | Tæller og nævner er byttet om. Den brøk hører til den omvendte reaktion. |
| stof uden for skemaet | [H] står ikke i skemaet. ([CH₃COO]: hintet peger på ladningen) |
| fast stof eller vand (l) | [CaCO₃] skal ikke stå i brøken. |
| forkert side | [N₂] står i tælleren, men N₂ står før pilen. |
| samme stof flere gange | [H₂] står flere gange i nævneren. |
| et stof mangler | Der mangler et stof i nævneren. |
| forkert eksponent | Eksponenten på [H₂] passer ikke med skemaet. |

Brikken med fejlen bliver rød, tavlen ryster, og linjen bliver rød.

**Hintet er en trappe på tre trin** (`B.hintTrin`): hvad man skal se på › hvad
der står i skemaet › hvad man gør. Det stof, trinnet handler om, lyser gult i
skemaet. På en tom brøk er trinnene: "Begynd med tælleren. I tælleren står
stofferne efter pilen." › "Efter pilen står 2NH₃(g)." › "Tælleren skal være
[NH₃]²." Retter eleven noget, begynder trappen forfra. Fane 2 har tre trin
skrevet til hver tavle i `D.FEJL`.

Påskeægget: et klik på ⇌ får de to halve pile til at løbe hver sin vej, og
linjen siger, at reaktionen løber begge veje på én gang.

## Forenklinger

* Faste stoffer og opløsningsmidlet er ikke med, fordi deres koncentration
  ikke ændrer sig. Aktiviteter nævnes ikke.
* Den eneste væske (l) i opgaverne er vand som opløsningsmiddel. Reglen i
  modellen er derfor "(s) og (l) er ikke med". En reaktion med en ren væske,
  der ikke er opløsningsmiddel (fx esterdannelse), skal ikke tilføjes uden
  at reglen gøres finere.
* [H₂]·[H₂]·[H₂] er matematisk [H₂]³, men godtages ikke: et stof skrives én
  gang med en eksponent.
* En tom nævner og nævneren 1 er lige gode, når intet skal med.

## Filer

```
index.html         toplinje, de to faner, teori, quiz og rundvisning
css/stil.css       udseende (grundlaget er sc1.4; nederst tavlen, skemaet,
                   brøken, brikkerne, bakken, fane 2 og quizzen). NB:
                   decimaltal med PUNKTUM i CSS
js/kerne.js        NK-navnerum, hævet og sænket skrift (som sc1.4)
js/data.js         de 12 reaktioner, de 12 tavler med en fejl og quizzen
js/broek.js        modellen: facit af skemaet, elevens brikker, dommen,
                   beskederne og hinttrappen
js/fane.js         det fælles: listen, statuslinjen, knappen og skemaet
js/sim_broek.js    fane 1 med træk og slip
js/sim_fejl.js     fane 2
js/quiz.js         quizzen
js/rundvisning.js  rundvisningen bag ?
js/app.js          faneskift, tastatur og løkken
_selvtest.html     udviklerværktøj, se nedenfor
```

En ny reaktion på fane 1 er ét objekt i `D.BROEK` (skemaet og de 6 stoffer i
bakken); facit regnes af skemaet. En ny tavle på fane 2 er ét objekt i
`D.FEJL` med den viste brøk, de dele, der er fejlen, tre hint og en
forklaring.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> fane · <kbd>Enter</kbd> tjek · <kbd>R</kbd> forfra ·
<kbd>H</kbd> rundvisning · <kbd>T</kbd> teori · <kbd>Q</kbd> quiz ·
<kbd>Esc</kbd> luk eller slip en brik. Direkte links: `#broek`, `#fejl` og
`#quiz`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server (iframen afvises på
file://). Den tjekker skrivemåden af ioner, at facit regnet af skemaet er det
samme som i den gamle b2.1, at hver typisk fejl får sin besked, at hintet er
tre trin og først i sidste trin siger svaret, at alle 12 reaktioner kan
skrives, træk og slip med rigtige pointer-hændelser (også en brik, der lander
mellem to andre), at hver tavle på fane 2 har netop sin fejl, og at alle
andre dele er rigtige, quizzen, sproget og layoutet fra 1100 × 700 til
1600 × 950.
Sidst kørt: ALT OK (80 påstande), 2. oktober 2026.

## Til menuen

Når brugeren siger til:

* `kemi-b-filer/samling_b2.html`, knap 1 `data-emne="b2.1"`, skal pege på
  `../superanimationer/sb2.1_ligevaegtsloven/index.html`.
* Den gamle flyttes med `git mv` til
  `kemi-c-filer/arkiv/b2.1_ligevaegtsloven_oldversion.html` (der ligger
  også den gamle b1.1).
* `FEEDBACK_EMNER` i `samling_alt_b.html` er uændret: knappen hedder stadig
  "Ligevægtsloven" og har nummer 1.
* Kolonnen "I menuen" i superanimationernes README rettes.
