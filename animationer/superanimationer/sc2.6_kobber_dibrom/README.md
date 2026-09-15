# sc2.6 Kobber og dibrom

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset fra
læreren Kemichael i `../kemichael/`. Den skal derfor ligge ved siden af den mappe.

Den afløser `animationer/kemi-c-filer/c2.6_eksperiment_kobber_dibrom.html`,
som nu ligger i
`animationer/kemi-c-filer/arkiv/c2.6_eksperiment_kobber_dibrom_oldversion.html`.
Knappen i `samling_c2.html` peger direkte på denne `index.html`. Delte links går
via `samling_alt.html?emne=c2.6` og er derfor ikke berørt af flytningen.

## Hvad viser den

Eleven udfører hele forsøget i et stinkskab: kobber og bromvand i en konisk
kolbe, prop i, ryst, hæld over i to reagensglas, påvis Cu²⁺ med NH₃ og Br⁻ med
AgNO₃, og aflever resterne. Kemien og testene er de samme som i den gamle
animation. Det nye er:

* **En rigtig opstilling i stinkskab** med kontrolpanel, urglas med
  kobberspåner, brun flaske med bromvand og faresymboler, prop,
  reagensglasstativ, dråbeflasker, vask og affaldsdunk. Genstandene bruges ved
  at klikke på dem, og de flyver selv hen og hælder, drypper eller sætter
  proppen i.
* **Sikkerhed som en del af forsøget.** Fra en åben kolbe stiger rødbrune
  dampe, som udsugningen suger op. Forkerte handlinger afvises ikke, men giver
  et uheld, som læreren Kemichael rydder op efter (se Uheld nedenfor).
* **Intro.** Første gang siden åbnes, siger en pop-up kort, hvad forsøget
  undersøger, og hvad eleven skal gøre. Knappen Om forsøget åbner den igen.
* **Rystning med musen.** Eleven tager fat i kolben og bevæger den frem og
  tilbage. En handske holder om halsen, og væsken skvulper. Det er musens
  fart, der tæller, så små, hurtige bevægelser virker også. Knappen
  **Ryst kolben** (eller tasten R) gør det samme, så længe den holdes nede.
  Uden rystning går reaktionen meget langsomt. Proppen tages af ved at klikke
  på selve proppen. Et tryk længere nede tager fat i kolben.
* **Zoombobler med partikelniveauet.** Over kolben ses Br₂ ramme
  kobberoverfladen, to elektroner springe over, og Cu²⁺ og 2 Br⁻ blive dannet.
  Over reagensglassene ses NH₃ sætte sig på Cu²⁺ og Ag⁺ danne AgBr med Br⁻,
  mens NO₃⁻ er tilskuerion. Modellen er ikke pynt: kolbens farve styres af,
  hvor meget Br₂ der er tilbage i boblen, og en test er færdig, når alle Cu²⁺
  har fire NH₃, eller når alt Br⁻ er fældet.
* **Dråbe for dråbe.** Hvert klik på en dråbeflaske er én dråbe. Der skal tre
  til hver test, og farven og bundfaldet bygges gradvist op. Dråberne tegnes
  som klare perler, så man kan se, at begge opløsninger er farveløse, også
  AgNO₃ i den brune flaske. Det noteres også i iagttagelserne.
* **Forløb, hint og iagttagelser i panelet.** Trinene får flueben efter
  tilstanden, ikke efter knaptryk. Hint giver en kort tekst til det aktuelle
  trin og markerer den genstand, det handler om. Knappen banker, når eleven
  har stået på samme trin i 25 sekunder. Det, eleven ser, skrives som
  iagttagelser med en farveprøve. Der er ingen teori foran forsøget; den
  ligger bag knappen Teori.
* **Quiz** med ti spørgsmål, låst op når begge tests er lavet. Flere handler
  om farverne: hvilken ion der giver den blågrønne farve, hvilken farve
  AgNO₃-opløsningen og bundfaldet har, og hvilket stof der er mørkeblåt. I
  farvespørgsmålene har svarene en farveprøve, og farveløs vises ternet.

## Påskeægget

Kolben glider kun ud af hånden, hvis eleven ryster **meget voldsomt** med musen
i lidt tid. Lige før grænsen begynder kolben at vakle i hånden. Anden gang skal
der rystes endnu voldsommere, og efter to uheld kan kolben ikke gå i stykker.
Knappen Ryst kolben taber aldrig kolben. Grænserne står i `RYST` i
`js/model.js`: musens fart i tegneenheder pr. sekund (`KNUS_FART`), hvor længe
den skal holdes (`KNUS_TID`) og det største antal uheld (`MAKS_UHELD`). Farten
er udjævnet og ligger på ca. 85 % af musens gennemsnitsfart.

Kolben falder, knuses på bordet, proppen springer af, og indholdet løber ud.
Er der stadig brom i pytten, stiger der dampe op fra den.

Panelet skifter til **Oprydning**, og redskaberne kommer ind ét ad gangen:

1. **Uskadeliggør bromvandet** med sprayflasken med natriumthiosulfat. Pytten
   mister sin orange farve. Trinnet er der kun, hvis der var Br₂ tilbage.
2. **Tør pytten op** med køkkenrulle. Træk den hen over pytten eller klik.
   Trinnet er der kun, hvis der var væske i kolben.
3. **Fej skårene op** med kost og fejeblad. Træk kosten eller klik.
4. **Tøm fejebladet i affaldsdunken.**

Derefter kommer en ny kolbe og nye kobberspåner, og eleven starter igen fra
kobber og bromvand. Udsugningen kører stadig. Uheldet noteres i iagttagelserne.

## Uheld, som læreren rydder op efter

Læreren Kemichael kommer ind på scenen fra venstre. Figuren, kaffen og klik på
ham er fælles for superanimationerne og står i `../kemichael/kemichael.js`.
Scenerne her står i `js/laerer.js`.

* **Bromvand uden udsugning.** Bromvandet kan åbnes, og udsugningen kan
  slukkes, selv om der er brom fremme. Dampene kommer så ud i lokalet, og
  scenen får et rødbrunt slør. Efter 1,6 sekunder løber læreren ind og tænder
  udsugningen. Replikken skifter, hvis det sker igen.
* **Rystning uden prop.** Kolben kan rystes uden prop, med musen eller tasten
  R. Så skvulper bromvandet ud på bordet, mens kobberet bliver i kolben.
  Læreren sprøjter natriumthiosulfat på pytten, tørrer op og beder om nyt
  bromvand. Grænsen står i `RYST.SPILD_FART` og `RYST.SPILD_TID` i
  `js/model.js`.
* **Rester i vasken.** Klikkes der på vasken, når væsken er hældt over i
  reagensglassene, begynder glas 1 at hælde. Læreren løber ind og stopper det,
  og glasset kommer tilbage i stativet.
* **Kolben knuses.** Når kolben er tabt (se Påskeægget), kigger læreren ind fra
  kanten, mens eleven rydder op.
* **Lærerens kaffe.** Koppen på hylden. Læreren henter den og drikker.
* **Læreren klikkes på.** Stadig kortere svar, rødere i hovedet og til sidst
  damp af ørerne.

Uheldene noteres i iagttagelserne og tæller i regnskabet over uheld, der følger
browseren (se `../kemichael/README.md`).

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Hver genstand har et
ankerpunkt (i `S.ANKER` i `js/scene.js`), som den drejes om.

| Fil | Indhold | Anker og mål, som koden bruger |
|-----|---------|-------------------------------|
| `kolbe.svg` | konisk kolbe 250 mL | åbning (75, 4); inderside i `S.KOLBE_INDRE` |
| `prop.svg` | gummiprop | bund (22, 36) |
| `flaske_bromvand.svg` | brun flaske, GHS05, GHS06, GHS09 | åbning (40, 4) |
| `skruelaag.svg` | låg til flasken | bund (17, 22) |
| `urglas.svg`, `kobberspaaner.svg` | urglas og bunke kobberspåner | kant (60, 7); bunkens bund (45, 33) |
| `reagensglas.svg` | reagensglas | åbning (15, 2); inderside i `S.GLAS_INDRE` |
| `stativ.svg` | træstativ til to glas | tegnes efter glassene, huller ved x 45 og 105 |
| `draabeflaske_nh3.svg`, `draabeflaske_agno3.svg` | dråbeflasker | spids (23, 0) |
| `kontrolpanel.svg` | stinkskabets panel | vinger, lampe, display og kontakt tegnes i `scene.js` |
| `haand.svg` | nitrilhandske | greb (40, 46) |
| `sprayflaske.svg` | natriumthiosulfat | dyse (3, 18) |
| `kost.svg`, `fejeblad.svg` | kost og fejeblad | børster (43, 54); forkant (4, 52) |
| `koekkenrulle.svg` | køkkenrulle | midte (36, 22) |
| `affaldsdunk.svg` | tungmetalaffald, GHS09 | åbning (45, 12) |
| `vask.svg` | koppevask med svanehals | vaskens midte (55, 150) |
| `lup.svg` | lup ved zoomboblens glas | linsens midte (15, 15) |

Væsker, strålen, dråber, dampe, skår, pyt og zoomboblerne tegnes i koden.
Væskens overflade er altid vandret, uanset hvordan glasset hælder:
`NK.vaeskeNiveau` i `kerne.js` finder den højde, hvor netop væskens areal ligger
under overfladen. Ændres en sprite, skal tallene i `scene.js` passe.

## Filer

```
index.html          markup: scene, panel, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, ion-notation, positurer, vaeskeniveau
js/model.js         kemien: stoffer, afstemning, maengder, farver, 3 %
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlaeser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1000 x 600): maal, stinkskab, vaesker
js/mikro.js         partikelmodellen i zoomboblerne
js/forsoeg.js       trinene, klik, rystning, haeldning, draaber, affald
js/uheld.js         paaskeaegget: kolben tabes, og der ryddes op
js/quiz.js          quizkortet og de ti spoergsmaal
js/rundvisning.js   spotlight-rundvisningen bag ?-knappen
js/app.js           panel, knapper, tastatur, tegneloekke
_selvtest.html      udviklervaerktoej, indgaar ikke i animationen
```

## At rette i den

**Kemien** står i `js/model.js`: stofferne, reaktionsskemaerne (som
selvtesten tjekker for afstemning), mængderne i partikelmodellen og farverne.
Alle formler med ladning bygges med `NK.ladningHaevet`, så ±1 skrives som + og −.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` og oprydningens trin i
`UHELD_TRIN` i `js/uheld.js`, hver med tekst, hint og hvilken genstand hintet
markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Mens en koreografi kører, ignoreres nye klik på scenen.

**`_selvtest.html`** åbner `index.html` i en iframe og kører hele forsøget
igennem: at alle sprites indlæses, at skemaerne er afstemt, at ion-notationen er
rigtig, at bromvandet kræver udsugning, at der skal prop i før rystning, at
reaktionen bevarer atomer og ladning og bliver færdig inden 20 sekunders
rystning, at et tryk på proppen tager proppen og ikke kolben, at glassene får
3 Cu²⁺ og 6 Br⁻ hver, at begge tests bliver færdige, at quizzen låses op, at
almindelig rystning med musen ikke taber kolben, at meget voldsom rystning gør,
at anden gang kræver mere, at kolben ikke kan gå i stykker efter to uheld, at
hele oprydningen kan gennemføres, og at der ikke er tankestreger eller 1+/1− i
teksterne. Kør den efter ændringer.

Genveje: hold <kbd>R</kbd> ryst · <kbd>U</kbd> udsugning · <kbd>I</kbd> hint ·
<kbd>T</kbd> teori · <kbd>M</kbd> lyd · <kbd>H</kbd> rundvisning ·
<kbd>Esc</kbd> luk.
