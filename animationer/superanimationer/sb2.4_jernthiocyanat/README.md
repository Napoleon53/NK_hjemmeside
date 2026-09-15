# sb2.4 Jernthiocyanat-ligevægten

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset fra
læreren Kemichael i `../kemichael/`. Den skal derfor ligge ved siden af den mappe.

Knappen i `samling_b2.html` (emne b2.4) peger direkte på denne `index.html`.
Den tidligere b2.4, simulationen med partikler og graf, hedder nu
`kemi-b-filer/b2.5_ligevægt_simulation.html`, og volumenændringen er b2.6.

## Hvad viser den

Eleven udfører forsøget med ligevægten Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ på et
laboratoriebord: laver en stamopløsning, fordeler den i fem reagensglas, laver
ét indgreb i hvert glas og sammenligner med et urørt glas.

* **Stamopløsningen.** Sprøjteflasken giver 30 mL vand i bægerglasset. Hvert
  klik på en dråbeflaske er én dråbe (0,05 mL af 0,1 M). Fire dråber af hver
  giver en orange opløsning. Dråberne lander i et ublandet lag i toppen, som
  blandes ind med glasstaven, ved rystning eller langsomt ved diffusion.
* **Fordelingen.** Et klik på bægerglasset hælder 5 mL i hvert glas, der ikke
  har fået noget. Hældes der uden omrøring, får det første glas det ublandede
  lag, og glassene får forskellig farve. Der bliver 5 mL tilbage.
* **Indgrebene.** Fe(NO₃)₃ og KSCN gør et glas mørkere. AgNO₃ giver et hvidt
  bundfald af AgSCN, der synker til bunds, og et lysere glas. Vandbadet (80 °C)
  gør glasset lysere, isbadet (0 °C) mørkere, og vand fortynder. Et glas, der
  kommer op af vandbadet, bliver mørkere igen, når det køler af.
* **Glassene flyttes med musen.** Et glas kan trækkes til vandbadet, isbadet,
  stativet eller affaldsdunken. Rystes det, blandes dråberne ind. Knappen
  **Ryst glasset** (tasten R) ryster det valgte glas.
* **Referencen** er det første glas, der har fået stamopløsning og ellers er
  urørt. Er intet glas urørt, bruges resten i bægerglasset, og er det også
  ændret, sammenlignes der med stamopløsningen, som den var.
* **Sammenligningen.** Et klik på det hvide kort eller på **Sammenlign**
  (tasten S) viser glassene ovenfra på hvidt papir, hvor lysvejen er hele
  væskesøjlen. Eleven klikker under hvert glas og vælger mørkere, lysere eller
  som referencen. Når visningen lukkes, og alle glas med et indgreb er
  vurderet, er trinnet gjort. Svaret gemmes sammen med glassets farve i det
  øjeblik, så glasset fra vandbadet skal vurderes, mens det er varmt.
* **Zoomboblen følger den valgte beholder.** Fe³⁺ og SCN⁻ danner FeSCN²⁺ og
  går i stykker igen, Ag⁺ finder SCN⁻ og danner AgSCN, og tilsatte ioner falder
  ned oppefra. K er forstærket i boblen, så der er komplekser at se.
* **Intro.** Første gang siden åbnes, siger en pop-up kort, hvad forsøget
  undersøger, og hvad eleven skal gøre. Knappen Om forsøget åbner den igen.
  Den huskes i `localStorage` under `nk-sb24-intro`.
* **Hint** giver en kort tekst til det aktuelle trin og markerer genstanden.
  Teorien ligger bag knappen Teori.
* **Tegneserie.** Når resterne er afleveret, låses knappen op. Ruderne bygges
  af elevens egne tal: dråberne, hvilket glas der fik hvilket indgreb, og
  glassene, som de så ud ved vurderingen. Uheld får egne ruder, og sidste rude
  er resultatskemaet med elevens iagttagelser og forskydningen.
* **Quiz** med ti spørgsmål, låst op når glassene er sammenlignet.

## Kemichael

Figuren, kaffen og klik på ham er fælles og står i `../kemichael/kemichael.js`.
Scenerne her står i `js/laerer.js`. Forkerte handlinger afvises ikke.

* **Spild.** Rystes et glas meget voldsomt med musen (`RYST` i `js/model.js`),
  sprøjter indholdet ud. Læreren tørrer op, og replikken skifter for hvert
  uheld. Knappen Ryst glasset spilder aldrig.
* **Overløb.** Et reagensglas rummer 17 mL og bægerglasset 100 mL. Kommer der
  mere vand i, løber det over, og læreren tørrer op.
* **Stamopløsningen**, når den fordeles: mangler Fe(NO₃)₃ eller KSCN, er der
  AgNO₃ i, er den for mørk eller for lys, eller blev der ikke rørt om, siger
  læreren det. Forsøget kan fortsætte.
* **Ingen reference.** Får alle fem glas et indgreb, kommer læreren, med
  glimtet `afslag` første gang.
* **To slags indgreb i samme glas.** Læreren siger det én gang.
* **Ros**, når glassene er sammenlignet. Er et glas vurderet forkert, beder han
  eleven kigge på det igen.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Ankrene står i
`S.ANKER` i `js/scene.js`.

| Fil | Indhold | Anker og mål, som koden bruger |
|-----|---------|-------------------------------|
| `sproejteflaske.svg` | sprøjteflaske med vand, som i sc6.9 | tudens spids (44, 9) |
| `baegerglas_100.svg` | bægerglas, 100 mL | åbningens midte (36, 4), tuden (1, 3,5); inderside i `S.BAEGER_INDRE` |
| `draabeflaske_fe.svg`, `draabeflaske_kscn.svg`, `draabeflaske_agno3.svg` | 0,1 M Fe(NO₃)₃, KSCN og AgNO₃ | spidsen (23, 0) |
| `reagensglas.svg` | reagensglas, som i sc6.8 | åbningen (15, 2); inderside i `S.GLAS_INDRE` |
| `stativ5.svg` | træstativ til fem glas | huller ved x 45, 95, 145, 195 og 245 |
| `baegerglas.svg` | 250 mL, bruges til vandbad og isbad i skala 0,8 | inderside i `S.BAD_INDRE` |
| `varmeplade.svg` | varmeplade, som i sc2.7, i skala 0,6 | knap (52, 46), lampe (82, 38) |
| `affaldsdunk.svg` | tungmetalaffald, som i sc2.7 | åbningen (45, 12) |
| `koekkenrulle.svg`, `haand.svg`, `lup.svg` | som i sc6.8 | |

Glasstaven, det hvide kort, væsker, bundfald, vandet og isen i badene, damp,
pytten, glassene set ovenfra og zoomboblen tegnes i koden.

## Filer

```
index.html          markup: scene, panel, intro, teori, tegneserie, rundvisning
../laboratoriet/    fælles for laboratorieforsøgene: kerne.js, rundvisning.js og grund.css
css/stil.css        kun det særlige for forsøget: resultatskemaet. NB: decimaltal med PUNKTUM i CSS
js/model.js         kemien og tallene: ligevægt, blanding, farver, sammenligning
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlæser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1000 x 600): mål, lokalet, bade, glas, visningen ovenfra
js/mikro.js         partikelmodellen i zoomboblen
js/forsoeg.js       trinene, tilstanden og handlingerne
js/bord.js          tegning af bordet og styring med musen
js/laerer.js        Kemichaels scener i dette forsøg
js/tegneserie.js    forsøget som tegneserie med resultatskemaet til sidst
js/quiz.js          quizkortet og de ti spørgsmål
js/tur.js           rundvisningens stop; selve rundvisningen ligger i ../laboratoriet/
js/app.js           panel, knapper, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: K ved 20 °C (140 M⁻¹) og
reaktionsentalpien (`LIGEVAEGT`), dråbernes størrelse (`DRAABE`), mængderne
(`MAENGDE`), blandingens fart (`BLAND`), temperaturerne (`TEMP`), lysvejen og
farverne (`LYSVEJ`, `ABS`), grænserne for mørkere og lysere (`VURDER`), hvornår
stamopløsningen er for mørk, for lys eller ujævn (`STAM`), rystningen (`RYST`)
og partikelmodellen (`MIKRO`). Alle formler med ladning bygges med
`NK.ladningHaevet`, så ±1 skrives som + og −.

**Trinene** står i `TRIN` øverst i `js/forsoeg.js` med tekst, hint og hvilken
genstand hintet markerer. Hvornår et trin er gjort, afgøres i `trinGjort`.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. Lærerens scener virker på samme måde; formatet står øverst i
`../kemichael/kemichael.js`.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
sprites, afstemte skemaer, at hvert indgreb giver den rigtige farveændring, at
dråber blandes ved rystning, hele forløbet fra vand til affald, zoomboblen,
sammenligningen og quizzen, tegneserien og resultatskemaet, uheld og
bemærkninger, at glassene kan flyttes med musen, og at der ikke er
tankestreger eller 1+/1− i teksterne. Chrome skal have lov at åbne iframen: brug
en lokal server eller `--allow-file-access-from-files`.

Genveje: hold <kbd>R</kbd> ryst · <kbd>S</kbd> sammenlign · <kbd>I</kbd> hint ·
<kbd>T</kbd> teori · <kbd>M</kbd> lyd · <kbd>H</kbd> rundvisning ·
<kbd>Esc</kbd> luk.
