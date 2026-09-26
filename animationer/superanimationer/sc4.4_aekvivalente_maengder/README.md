# sc4.4 Ækvivalente mængder

Superanimation om ækvivalente mængder: koefficienterne i et afstemt
reaktionsskema er forholdet mellem stofmængderne. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js` og `../kemichael/superanimation.js`). Ingen `fetch` og ingen moduler, så den
virker fra harddisken.

## Bestillingen

1. **Pointen:** koefficienterne i et afstemt reaktionsskema er forholdet
   mellem stofmængderne, der reagerer og dannes. Kender man én stofmængde,
   kender man dem alle.
2. **Afløser** `kemi-c-filer/c4.4_opgaver_ækvivalente_mængder.html`. Med fra
   den gamle: hotdogopskriften (1 pølse + 1 brød + 2 agurker ⟶ 1 hotdog) og
   dens fire spørgsmål, de fire reaktioner (vand, ammoniak, methan og
   propan) med skiftende kendt stof, felterne under formlerne, det grønne
   felt for den kendte stofmængde og afstemningen først (nu kun på Svær).
   Ud: pointtavlen, velkomst- og overgangskortene, de tilfældige prikker i
   baggrunden og hjælpepanelet i siden (afløst af hint på knappen og teorien).
3. **Naboerne:** `c1.4` ejer afstemning, `c4.3` regningen mellem masse og
   stofmængde og `c4.5` skemaet med masser og den begrænsende mængde i kemi.
   Her regnes kun i mol. `sc4.2` ejer, at 1 mol er et antal. Brugerens valg
   (24. sept. 2026): tre faner, afstemning kun på Svær, eleven skriver kun
   tallet, og beregningen står bagefter. 25. sept. 2026 bad brugeren om
   den begrænsende ingrediens og overskud i hotdogdelen og om et eksempel
   med skævere tal (dobbeltburgeren); i kemi ejer c4.5 stadig begreberne.
4. **Loftet:** 3 faner, 4 reaktioner og 8 stoffer. Fane 1: 2 opskrifter med
   3 beholdere hver, højst 12 af hver ting på brættet (også i opgaverne, så
   alt kan ses), 10 ordrer. Fane 2: 2 kasser, højst 16
   figurer i kammeret, 5 mål. Fane 3: 12 opgaver i 3 niveauer.
5. **Layoutet:** scene plus panel, som `sc4.1` og `sc4.2`.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Pølsevognen | lægger ingredienserne på brættet og ringer med klokken; regner, hvor meget der skal bruges; finder det begrænsende, antallet og overskuddet | en opskrift har et fast forhold, og det, der slipper op først, bestemmer, hvor mange man kan lave |
| 2 | Molekylerne | fylder et reaktionskammer med molekyler og trykker Start; fra mål 4 er hver figur 1 mol | koefficienterne tæller molekyler, og derfor også mol |
| 3 | Tavlen | skriver stofmængderne under formlerne; på Svær først koefficienterne | n(X) = k<sub>X</sub>/k<sub>K</sub> · n(K) |

**Pølsevognen.** Opskriften hænger på væggen med tegninger af tingene:
først 1 pølse + 1 brød + 2 agurkeskiver ⟶ 1 hotdog, senere 1 bolle + 2
bøffer + 3 skiver ost ⟶ 1 dobbeltburger. Eleven trækker fra beholderne hen på
skærebrættet (et klik virker også; et klik på en ting på brættet lægger den
tilbage) og ringer med klokken. Så samles retterne på bakken efter
opskriften. Det, der ikke passer, bliver liggende med en orange ramme og
mærkaten "overskud". Passer det ikke med ordren, sender kunden dem tilbage.
Brættet har plads til 12 af hver ting, og tingene pakkes i 1-3 rækker, så de
aldrig ligger oven i hinanden; alle ordrer holder sig under 12.

Ti ordrer i tre slags. *På brættet*: 2 hotdogs, så mange som 6 agurkeskiver
rækker til (glasset er tomt) og 2 dobbeltburgere. *Hvor meget*: 6 hotdogs og 4
dobbeltburgere; eleven skriver antallet af hver ting, og brættet fyldes og
serverer. *Begrænsende*: 10/10/10 (den gamles spørgsmål; her kommer
begreberne), 8 pølser/10 brød/12 skiver (færrest pølser, men agurkerne
slipper op), 12/5/12, 5 boller/8 bøffer/9 skiver ost og 6/7/12, hvor også den
begrænsende har rest (1 bøf er ikke nok til en burger mere). I de
begrænsende vælger eleven først ingrediensen (knapperne i panelet eller et
klik på rækken på brættet), og rækken markeres "begrænsende". Så skriver
eleven antallet og overskuddet, og brættet serverer. Et forkert valg får at
vide, hvor langt ingrediensen rækker ("Der er færrest pølser, men de rækker
til 8 hotdogs"). Kortet Ordrerne springer til hotdogs, burgere eller frit
valg med begge opskrifter. En pil viser vejen, så længe brættet er tomt.

**Molekylerne.** Skiltet viser reaktionsskemaet med lige så mange figurer
under hver formel, som koefficienten siger. Eleven trækker figurer fra
kasserne ind i kammeret og trykker Start. Så reagerer de i hele sæt: i hvert
sæt samles molekylerne, atomerne flytter hen til produkterne, og produkterne
flyver videre. Det, der ikke passer ind i et helt sæt, får en orange ring.
Er der ikke nok til ét sæt, sker der intet, og beskeden siger, hvad skemaet
kræver. Tabellen i panelet viser før og efter. Fra mål 4 er hver figur en
pose med 1 mol, og plakaten skifter fra "1 figur = 1 molekyle" til "1 figur =
1 mol = 6,02 · 10²³ molekyler". Mål: 2 H₂O, 6 H₂O, 4 NH₃ ud fra 2 N₂, 4 mol
H₂O og 2 mol methan brændt uden rester. Bagefter er der frit valg af
reaktion og enhed.

**Tavlen.** Reaktionsskemaet står på en tavle. Under hver formel er en søjle:
koefficienten er en stiplet stabel af blokke, og stofmængden er fyldet i
samme målestok. Den kendte stofmængde (den grønne boks) fylder netop sine
blokke. Et rigtigt svar fylder også netop sine blokke og bliver blåt; et
forkert svar står rødt og er for højt eller for lavt, så den omvendte brøk
ses som en søjle, der er fire gange for høj. Hintet giver brøken og hvad én
blok er ("1 blok = 1,5 mol"). Svarene står bagefter som pæne beregninger i
panelet: n(O₂) = ½ · n(H₂) = ½ · 3,0 mol = 1,5 mol. Tre niveauer: *Let* (hele
tal), *Middel* (decimaltal og kendte produkter) og *Svær* (skemaet står uden
koefficienter, og eleven afstemmer det først). En opgave, der er løst uden
at se svaret, får en stjerne.

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation
(reglen i `../README.md`): pølsevognen tre replikker (han peger på opskriften,
brættet og klokken), molekylerne tre (skiltet og kammeret, og kasserne lyser),
tavlen tre (han peger på den grønne boks, felterne og søjlerne). Han går kun
ved den store knap, to klik på ham eller Esc. <kbd>K</kbd> viser
præsentationen igen. Ellers roser han tørt efter den sidste ordre, det sidste
mål og hvert niveau på tavlen. Kaffekoppen på disken og bordet er det fælles
påskeæg. **Påskeæg:** ringer eleven med lutter agurker på brættet, kommer
Kemichael: "Kun agurker. Det er en salat, ikke en hotdog."

Direkte links: `index.html#molekyler` og `index.html#regn`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>R</kbd> tøm brættet, kammeret eller opgaven · <kbd>Enter</kbd> ring med
klokken, Start eller næste · <kbd>Esc</kbd> luk eller send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Pølsevognen er en scene**, ikke et flervalg. Eleven bygger retterne og
  ser overskuddet, før der skal regnes. Den begrænsende ingrediens og
  overskuddet er kommet til, og dobbeltburgeren har skævere tal (1 : 2 : 3).
  Festivalen med 40 hotdogs er taget ud, fordi den ikke kunne ses.
* **Partikelniveauet er nyt og regnet af modellen.** Den gamle havde prikker,
  der flød rundt i baggrunden uden at vise noget. Nu reagerer molekylerne i
  hele sæt, atomerne bevares, og resterne ses.
* **Springet til mol vises**: samme opskrift, men hver figur er 1 mol.
* **Søjlerne på tavlen** viser forholdet, så et forkert svar har en synlig
  konsekvens.
* **Afstemningen er kun på Svær** (c1.4 ejer den). Beskeden tæller atomerne:
  "Der er 8 H til venstre og 6 H til højre."
* **Fejlbeskederne kender fejlene:** brøken vendt om, den kendte stofmængde
  skrevet af, kun ganget eller kun divideret, koefficienten i stedet for
  stofmængden, et andet stofs svar og kommaet.
* **Ti ordrer ved pølsevognen og tolv opgaver på tavlen** i stedet for fire og otte, heraf tre, hvor et produkt er kendt.
* **Hjælpen er én knap:** Giv hint, så Vis svaret. Pointtavlen er væk.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.2's). NB: decimaltal med PUNKTUM i CSS
sprites/            pølsen, brødet, agurkeskiven, bollen, bøffen og osten set oppefra,
                    gryden, kurven, glasset, stegepladen, osten på bræt, klokken og
                    reaktionskammeret (egne tegninger)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.2)
js/data.js          stofferne og deres atomer, reaktionerne, ordrerne, målene, opgaverne,
                    hints til afstemningen og replikkerne
js/tjek.js          tjek af antal, koefficienter og stofmængder; beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, opskriften, bonen, disken, tingene og hotdoggen, molekylerne,
                    poserne med 1 mol, kasserne, kammeret, skiltet, plakaten, tavlen og søjlerne
js/praesentation.js tilbuddet om Kemichaels præsentation (samme fil som i sc1.2)
js/sim_hotdog.js    fane 1 (pølsevognen)
js/sim_molekyler.js fane 2
js/sim_regn.js      fane 3
js/laerer.js        Kemichael på alle tre faner og påskeægget
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Reaktionerne** står i `R` i `js/data.js` som venstre og højre side med
koefficienter. **Stofferne** står i `D.STOFFER` med atomerne som
`[grundstof, x, y]`; antallet af atomer regnes ud derfra, og selvtesten
tjekker, at det passer med formlen. **Opskrifterne** står i `D.OPSKRIFTER`
og **ordrerne** i `D.ORDRER` (slags "disk", "tal" eller "begr"; det
begrænsende, antallet og overskuddet regnes ud; højst 12 af hver ting),
**målene** på fane 2 i `D.MAAL` (`krav` er det, der skal dannes) og
**opgaverne** i `D.OPGAVER` som `[niveau, reaktion, kendt stof, stofmængde]`.
Svarene regnes ud og får lige så mange betydende cifre som den kendte
stofmængde. **Hintet til afstemningen** står i `D.AFSTEM_HINT`.

**Fejlbeskederne** står i `js/tjek.js`. En stofmængde godkendes, når den
højst er 1 % fra facit.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at skemaerne er
afstemt med de mindste hele tal, at molekylerne har de atomer, formlen siger,
at de 12 opgaver og de fem med den begrænsende har de svar, der står i facit,
at ingen ordre bruger over 12 af en ting, at 11 typiske fejl i stofmængden og
28 ved pølsevognen giver den rigtige besked, at sproget holder reglerne, at
alle tre faner kan gennemføres (fane 1 og 2 også med musen), at 12 af hver
ting ligger på brættet uden at røre hinanden, at atomerne i kammeret er de
samme før og efter reaktionen, at
Kemichael kan vises og sendes ud på alle faner, og at layoutet holder fra
520 × 380 til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files`. Den lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 25. september 2026: ALT OK (136 påstande).

## Forenklinger

* Molekylerne er kuglemodeller i 2D med de sædvanlige farver (H hvid, C sort,
  N blå, O rød). Størrelser og vinkler er skematiske.
* I kammeret reagerer alle hele sæt fuldstændigt og på én gang. Der er ingen
  hastighed, ligevægt eller aktiveringsenergi; det hører til andre emner.
* Posen med 1 mol viser fem molekyler, men står for 6,02 · 10²³.
* Den begrænsende og overskuddet kommer kun ved pølsevognen, i hverdagsform.
  I kemi ejer c4.5 begreberne, så kammeret kalder resten overskud uden at
  regne på den begrænsende reaktant.
* Afstemning godkendes kun med de mindste hele tal.
* Svarene har samme antal betydende cifre som den kendte stofmængde, men
  c4.10 ejer betydende cifre, så et svar med færre cifre godkendes også.

## Tilbuddet om præsentationen

Kemichael kommer ikke af sig selv. Første gang en fane åbnes, står der Start
præsentation og Nej tak midt foroven i scenen. Start sender ham ind, Nej tak og
Esc husker valget, og K viser præsentationen uden at spørge. Tilbuddet
forsvinder også, når eleven har løst noget på fanen. Koden er
`js/praesentation.js` (samme fil som i sc1.2), koblet med
`NK.Praesentation.kobl` i hver `sim_*.js`. Skiltene står under tilbuddet, så
det ikke dækker dem.

## I menuen

I menuen fra 26. sept. 2026 som c4.4 i `kemi-c-filer/samling_c4.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c4.4_opgaver_ækvivalente_mængder_oldversion.html`.
