# sb2.4 Indgreb i en kemisk ligevægt

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS, JavaScript og sprites.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset fra
læreren Kemichael i `../kemichael/` og den fælles laboratoriekode i
`../laboratoriet/`. Den skal derfor ligge ved siden af de to mapper.

Knappen i `samling_b2.html` (emne b2.4) peger direkte på denne `index.html`.
Den tidligere b2.4, simulationen med partikler og graf, hedder nu
`kemi-b-filer/b2.5_ligevægt_simulation.html`, og volumenændringen er b2.6.

## Hvad viser den

Forsøget følger vejledningen "Indgreb i en kemisk ligevægt" med ligevægten
Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺. Knapperne øverst på scenen skifter mellem to dele.

**Del 1: De syv glas.**

* **Stamopløsningen står færdig** i en kolbe (20 mL 0,10 M Fe(NO₃)₃ og 20 mL
  0,10 M KSCN i 800 mL vand). Kolben hælder 30 mL i bægerglasset, og eleven
  hælder selv 3 mL i hvert af glas 1 til 7, ét glas ad gangen. Trinnet er
  gjort, når der står stamopløsning i alle syv, uanset om den kom fra
  bægerglasset eller direkte fra kolben (`alleFyldte` og `tjekFordelt` i
  `js/forsoeg.js`).
* **Glas 1 til 3** får Fe(NO₃)₃ (s), ascorbinsyre (s) og KSCN (s). Spatlen tager
  en spatelspids fra pulverglasset. Det faste stof ligger som korn i bunden og
  opløses langsomt; det opløste lægger sig som et lag i bunden, til der røres
  med glasstaven eller rystes. Ascorbinsyre reducerer Fe³⁺ til Fe²⁺.
* **Glas 8** er forundersøgelsen: KSCN 0,1 M og et par dråber AgNO₃ giver et
  hvidt bundfald. **Glas 4** får et par dråber AgNO₃.
* **Glas 5 og 6** står i vandbadet (80 °C) og isbadet (0 °C). **Glas 7** står
  ved stuetemperatur som reference. Termometeret måler temperaturen, og
  aflæsningen gemmes til resultatskemaet.
* **Billedet.** Et klik på det hvide kort eller på **Tag billede** viser glas 1
  til 7 i række. Eleven klikker under hvert glas: mørkere, lysere eller som
  glas 7. Når billedet lukkes, og glas 1 til 6 er noteret, er trinnet gjort.
  Svaret gemmes sammen med glassets udseende i det øjeblik.
* **Resterne** hældes i dunken med surt uorganisk affald, ét glas ad gangen.
  Trinnet er gjort, når glassene og bægerglasset er tomme (`tjekAffald`), og
  hvert glas huskes, som det så ud lige før det blev tømt (`slutBillede`).

**Del 2: Fortynding.** To bægerglas på hvidt papir fyldes næsten halvt op med
frugtfarve. Sprøjteflasken giver 10 mL ad gangen, til det ene glas har dobbelt
volumen, og glassene ses ovenfra. Frugtfarven ser ens ud, fordi antallet af
farvestofmolekyler er det samme. Derefter tømmes glassene, og det samme gøres
med ligevægtsblanding fra kolben, som bliver lysere ovenfra.

**Klik viser, træk gør.** Et klik vælger en genstand og gør ellers ingenting:
alt kan vælges, og det valgte får en rolig blå ramme. Handlingerne sker ved at
tage fat i udstyret og slippe det over en beholder; en grøn ramme viser, hvad
det bliver sluppet over. Kolberne, bægerglassene, reagensglassene, flaskerne,
pulverglassene, spatlen, glasstaven, termometeret og badene kan alle tages med
musen. Rystes et glas voldsomt, skvulper det ud. Knappen **Ryst glasset**
(tasten R) ryster det valgte reagensglas og spilder aldrig.

* **Det, der lige er brugt, bliver hængende** over glasset (`svaev` i
  `js/forsoeg.js`, listen `SVAEVER`): kolben og bægerglasset i hældepositur,
  dråbeflasken, sprøjteflasken, KSCN-flasken og spatlen i luften over det, de
  blev brugt på. En gul ring med en pil ved siden af gentager handlingen ved et
  klik. Tages der fat i noget andet, går det hjem. Spatlen bliver også hængende
  over pulverglasset, når den har taget en spatelspids; der gentager ringen
  spatelspidsen.
* **Pulverglassene viser det faste stof** i boblen: Fe(NO₃)₃ og KSCN som
  iongitter med deres eget formelforhold (tre NO₃⁻ pr. Fe³⁺), ascorbinsyre som
  molekyler, der ligger tæt. Gitrene står som data i `FAST_MIKRO` i
  `js/model.js`.
* **Boblen fyldes på plads**, når man ser ned i et glas: partiklerne ligger
  fordelt i den. Der falder kun noget ned oppefra, når der bliver tilsat noget.
* **Zoomboblen følger det valgte.** Fe³⁺ og SCN⁻ danner FeSCN²⁺ og går i
  stykker igen, Ag⁺ finder SCN⁻ og danner AgSCN, og ascorbinsyre gør to Fe³⁺ til
  Fe²⁺. K er forstærket i boblen, så der er komplekser at se. Vælges en flaske
  eller kolben i stedet for et glas, viser boblen, hvad der står i den
  (`bobleMaal`). Hver partikel er én kugle med formlen på, også de sammensatte
  ioner SCN⁻ og FeSCN²⁺. Det er boblen, der er stor (`S.BOBLE`), ikke kuglerne,
  så der er plads til mange. Lange navne står forkortet på kuglen (Asc, F) og
  forklares i legenden nederst i boblen.
* **Intro.** Første gang siden åbnes, siger en pop-up kort, hvad forsøget
  undersøger, og hvad eleven skal gøre. Knappen Om forsøget åbner den igen.
  Den huskes i `localStorage` under `nk-sb24-intro`.
* **Hint** giver en kort tekst til det aktuelle trin og markerer genstanden.
  Teorien ligger bag knappen Teori.
* **Tegneserie.** Låses op, når begge dele er gjort. Ruderne bygges af elevens
  egne resultater: hvad hvert glas fik, temperaturerne, billedet og
  fortyndingen. Uheld får egne ruder, og sidste rude er resultatskemaet for
  del 1 og del 2.
* **Quiz** med ti spørgsmål, låst op når billedet af glas 1 til 7 er taget.

## Kemichael

Figuren, kaffen og klik på ham er fælles og står i `../kemichael/kemichael.js`.
Scenerne her står i `js/laerer.js`. Forkerte handlinger afvises ikke.

* **Spild.** Rystes et reagensglas, et bægerglas, kolben eller et bad voldsomt
  med musen (`RYST` i `js/model.js`), skvulper det ud, og læreren tørrer op.
  Replikken skifter for hvert uheld.
* **Overløb.** Et reagensglas rummer 17 mL og et bægerglas 100 mL.
* **Stamopløsningen i affaldet.** Slippes kolben over dunken, hælder den alt ud.
  Læreren løber ind og fylder kolben igen.
* **Glas 7 får et indgreb.** Læreren siger, at der ikke er nogen urørt
  reference, med glimtet `afslag` første gang.
* **To slags indgreb i samme glas** og **frugtfarve i ligevægtsblandingen**
  giver hver en tør bemærkning.
* **Ros**, når billedet er taget. Er et glas noteret forkert, beder han eleven
  kigge på det igen.

## Sprites

Alle ligger i `sprites/` som SVG og tegnes med `drawImage`. Ankrene står i
`S.ANKER` i `js/scene.js`.

| Fil | Indhold | Anker og mål, som koden bruger |
|-----|---------|-------------------------------|
| `kolbe.svg` | konisk kolbe, som i sc8.6, tegnet 96 x 128 | åbningen (48, 2,5); inderside i `S.KOLBE_INDRE` |
| `baegerglas_100.svg` | bægerglas, 100 mL | åbningens midte (36, 4), tuden (1, 3,5); inderside i `S.BAEGER_INDRE` |
| `pulverglas_fe.svg`, `pulverglas_vitc.svg`, `pulverglas_kscn.svg` | åbne pulverglas med fast stof | åbningen (19, 4) |
| `spatel.svg` | skespatel, som i sc2.7 | skeens midte (12, 6) |
| `flaske_kscn.svg`, `flaske_farve.svg` | glasflasker med KSCN 0,1 M og frugtfarve | åbningen (21, 3) |
| `draabeflaske_agno3.svg` | dråbeflaske med AgNO₃ 0,1 M | spidsen (23, 0) |
| `sproejteflaske.svg` | sprøjteflaske med vand, som i sc6.9 | tudens spids (44, 9) |
| `reagensglas.svg` | reagensglas, som i sc6.8 | åbningen (15, 2); inderside i `S.GLAS_INDRE` |
| `stativ8.svg` | træstativ til otte glas | huller ved x 34, 76, 118, 160, 202, 244, 286 og 328 |
| `baegerglas.svg` | 250 mL, bruges til vandbad og isbad i skala 0,8 | inderside i `S.BAD_INDRE` |
| `varmeplade.svg` | varmeplade, som i sc2.7, i skala 0,6 | knap (52, 46), lampe (82, 38) |
| `affaldsdunk_surt.svg` | surt uorganisk affald | åbningen (45, 12) |
| `koekkenrulle.svg`, `haand.svg`, `lup.svg` | som i sc6.8 | |

Glasstaven, termometeret, det hvide kort og papiret, væsker, korn af fast
stof, bundfald, vandet og isen i badene, damp, pytten, billedet, glassene set
ovenfra og zoomboblen tegnes i koden. Navnene på bordets forkant står i
`S.ETIKETTER`.

## Filer

```
index.html          markup: scene, delene, panel, intro, teori, tegneserie, rundvisning
../laboratoriet/    fælles for laboratorieforsøgene: kerne.js, rundvisning.js og grund.css
css/stil.css        kun det særlige for forsøget: resultatskemaet og delknapperne. NB: decimaltal med PUNKTUM i CSS
js/model.js         kemien og tallene: ligevægt, fast stof, reduktion, farver, fortynding
js/lyd.js           lydene med Web Audio, ingen lydfiler
js/sprites.js       indlæser SVG'erne og tegner dem drejet om et anker
js/scene.js         tegnebordet (1120 x 600): mål, lokalet, udstyr, billedet, ovenfra
js/mikro.js         partikelmodellen i zoomboblen: én kugle med formlen pr. partikel
js/forsoeg.js       trinene, tilstanden og handlingerne for begge dele
js/bord.js          tegning af bordet og styring med musen
js/laerer.js        Kemichaels scener i dette forsøg
js/tegneserie.js    forsøget som tegneserie med resultatskemaet til sidst
js/quiz.js          quizkortet og de ti spørgsmål
js/tur.js           rundvisningens stop; selve rundvisningen ligger i ../laboratoriet/
js/app.js           panel, knapper, tastatur, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Kemien og tallene** står i `js/model.js`: stamopløsningen (`STAM`), K ved
20 °C og reaktionsentalpien (`LIGEVAEGT`), dråber (`DRAABE`), mængderne ved
hver hældning (`MAENGDE`), spatelspidser og opløsning af fast stof (`FAST`),
ascorbinsyrens fart (`REDUKTION`), frugtfarven (`FARVESTOF`), blanding
(`BLAND`), temperaturerne (`TEMP`), lysvejen og farverne (`LYSVEJ`, `ABS`),
grænserne for mørkere og lysere (`VURDER`), hvad der tæller som fordoblet
(`FORDOBLING`), rystningen (`RYST`) og partikelmodellen (`MIKRO`). Alle formler
med ladning bygges med `NK.ladningHaevet`, så ±1 skrives som + og −.

**Trinene** står i `NK.TRIN` øverst i `js/forsoeg.js`, ét sæt for hver del, med
tekst, hint og hvilken genstand hintet markerer. Hvornår et trin er gjort,
afgøres i `trinGjort`. Hvad udstyret gør, når det slippes, står i `brug` og
`slip`, og `klik` vælger kun. Et trin skal kunne afgøres af bordets tilstand
(`alleFyldte`, `tjekAffald`), ikke af den vej, eleven kom ad.

**Koreografierne** (`koer` i `forsoeg.js`) er lister af trin: `flyt` en genstand
til en positur, vent med `hver` og gør noget undervejs, eller `kald` en
funktion. En genstand på vej hjem blokerer ikke; den næste koreografi kører
efter den. Lærerens scener virker på samme måde; formatet står øverst i
`../kemichael/kemichael.js`.

**`_selvtest.html`** åbner `index.html` i en iframe og kører forsøget igennem:
sprites, afstemte skemaer, at hvert indgreb giver den rigtige farveændring, at
fast stof kræver omrøring, at et klik kun vælger, at det brugte bliver
hængende med sin ring, hele del 1 med træk, billedet, del 2 med
fortyndingen, zoomboblen, tegneserien og resultatskemaerne, uheld og
bemærkninger, kaffen, quizzen, og at der ikke er tankestreger eller 1+/1− i
teksterne. Chrome skal have lov at åbne iframen: brug en lokal server eller
`--allow-file-access-from-files`.

Genveje: hold <kbd>R</kbd> ryst · <kbd>S</kbd> billede eller ovenfra ·
<kbd>1</kbd> og <kbd>2</kbd> skift del · <kbd>I</kbd> hint · <kbd>T</kbd> teori ·
<kbd>M</kbd> lyd · <kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk.
