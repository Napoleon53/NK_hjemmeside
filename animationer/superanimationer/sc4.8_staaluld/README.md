# sc4.8 Afbrænding af ståluld

Superanimation om, hvorfor ståluld bliver tungere, når den brænder: jernet
binder ilt fra luften, og beregningen viser, hvad den højst kan komme til at
veje. Åbn `index.html`. Mappen henter kun filer inde fra sig selv, bortset
fra Kemichael (`../../v2/kemichael/kemichael.js` og
`../kemichael/superanimation.js`). Ingen `fetch` og ingen moduler, så den
virker fra harddisken.

## Bestillingen

1. **Pointen:** når ståluld brænder, binder jernet ilt fra luften, så vægten
   stiger; m(FeO) = n(Fe) · M(FeO) er det, den højst kan veje, og vægten
   viser mindre, fordi ikke alt jernet når at reagere.
2. **Afløser** `kemi-c-filer/c4.8_eksperiment_ståluld.html` ("Afbrænding
   ståluld" i `samling_c4.html`). Med fra den gamle: hypotesen med de tre
   svar, vægten med stålulden og displayet, Antænd, ekstra ilt fra en
   flaske, partikelbilledet med Fe, O og O₂, klumper af forskellig masse,
   udbyttet på 75-88 %, der varierer fra klump til klump, beregningen i tre
   trin (n(Fe), n(FeO), m(FeO)), sammenligningen med vejningen, spørgsmålet
   om, hvorfor vægten viser mindre, med de samme tre svar, og fejlkilderne.
   Bygget om: hypotesen er et gratis gæt på tre kort med billeder, der kun
   dækker scenen, og Kemichael introducerer den fra sit hjørne (brugerens
   ønske 27. sept. 2026: den gamle hypoteseskærm var invasiv og en kedelig
   start); eleven aflæser og skriver selv m(før) og m(efter); stålulden
   tændes med et 9 V-batteri; beregningen har formlen, mellemregningen i
   brøkfelter og resultatet med enhed som sc4.3. Ud: skyderen med massen
   (klumperne har forskellig masse i stedet) og præcisions-badget (stjernerne
   i opgavelisten gør det samme, og gættet tæller ikke med, fordi det er
   gratis).
3. **Naboerne:** `sc4.3` ejer n = m / M, `sc4.5` ejer mængdeberegning med
   skemaet og begrænsende mængde, `sc4.7` og `sc4.9` er de andre vejeforsøg,
   og `sc8.*` ejer redox. Her bruges kun forholdet 2 : 2 og de to
   molarmasser, der står på tavlen.
4. **Loftet:** 2 faner. Forsøget: 2 målinger, 1 vægt, 1 klump, 1 batteri, 1
   iltflaske, 1 lup med 45 jernatomer. Beregningen: 2 opgaver med 3 trin og
   ét spørgsmål, 3 søjler.
5. **Layoutet:** scene plus panel som `sc4.11`, med den rolige Kemichael ved
   katederet i et bånd nederst i scenen.

Det er en superanimation, ikke en superlab-animation: klumpen ligger klar på
vægten, der er ingen flasker at hælde fra, ingen uheld og ingen oprydning.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Forsøget | gætter gratis, aflæser m(før), tænder stålulden med batteriet, giver evt. ilt og aflæser m(efter) | stålulden bliver tungere, fordi ilt fra luften binder sig til jernet |
| 2 | Beregningen | skriver formlen, mellemregningen og resultatet i tre trin og svarer på, hvorfor vægten viste mindre | alt jernet kunne give m(FeO), men ilten når ikke ind til det hele |

**Det gratis gæt.** Måling 1 begynder med tre kort oven på scenen: Lettere
(brænde på et bål bliver til aske og røg), Det samme (en skålvægt i balance
med grå og sort ståluld) og Tungere (et søm, der ruster). Over kortene står
"Gratis gæt" og spørgsmålet, under dem, at et gæt koster ingenting.
Kortene dækker kun scenen, ikke panelet og ikke Kemichaels bånd. Kemichael
siger én linje fra katederet: "Først en hypotese. Bliver stålulden lettere
eller tungere af at brænde? Et gæt er gratis." Hint-knappen er skjult, så
længe der gættes. Når et kort er valgt, tier han, kortene glider væk, og
gættet står under skemaet med billedet. Når målingen er færdig, siger
linjen, om gættet holdt, og forklarer det ellers ud fra det, eleven gættede.

**Forsøget.** Vægten er nulstillet med den varmefaste plade, så den viser
stålulden (2,50-5,00 g). Eleven skriver m(før) i skemaet og trækker
9 V-batteriet hen til stålulden (et klik på batteriet virker også: det
flyver selv derhen). Stålulden gløder fra der, hvor batteriet rørte, fronten
breder sig, trådene bliver mørke, og der kommer gnister. Vægten stiger
hurtigt i starten og langsomt til sidst (ca. 20 s). Et klik på iltflasken
giver ren ilt i 2 s, og så brænder den seks gange hurtigere og hvidere.
m(efter) godkendes først, når vægten står stille. Tændes stålulden, før
m(før) er skrevet, siger linjen det; m(før) kan stadig skrives, hvis man så
tallet. Luppen viser overfladen af en ståltråd: O₂ og N₂ flyver rundt, et
O₂ flyver ned, deles, og de to O sætter sig på hver sit Fe. Overfladen
reagerer først, og den inderste del når aldrig at reagere. Med flasken
kommer der flere O₂ og færre N₂. Målingerne huskes i browseren og bruges på
fane 2.

**Beregningen.** Over tavlen står spørgsmålet: "Hvad vejer stålulden, hvis
alt jernet bliver til FeO?" Tavlen viser reaktionen, opgavens tal og
regnestykket, efterhånden som det skrives. Hvert trin skrives som i sc4.3:
formlen, mellemregningen i to felter over og under en brøkstreg (eller med
et gangetegn, hvor tallene må byttes om) og resultatet med enhed. Trinnet
n(FeO) = n(Fe) har ingen mellemregning. I måling 2 står formlerne der
allerede. Måling 1 slutter med den gamles spørgsmål, "Hvorfor viser vægten
mindre, end du har regnet ud?", med svarene fordampet jern, ikke alt jernet
reagerede og vægten kan ikke veje ilt. Et forkert svar forklares og låses,
og det rigtige giver, hvor stor en del af jernet der reagerede. Søjlerne på
bordet er stålulden før, vægten efter og det, der er regnet ud; den grå del
er jernet, den røde ilten, og den sidste søjle står stiplet med "?", til
massen af FeO er regnet. Efter spørgsmålet viser en stiplet rød kasse den
ilt, der ikke kom på. Har eleven ikke målt selv, bruges et eksempel
(4,00 → 4,94 g og 3,00 → 3,68 g), og kortet siger det.

**Kemichael ved katederet.** Som i sc4.5: han sidder stille nederst til
venstre, introducerer gættet og siger ellers kun noget ved Giv hint og Vis
svaret. Knappen Send Kemichael ud sender ham på lærerværelset; så står
hintene i opgavekortet. <kbd>K</kbd> får ham til at sige, hvor man er.

**Påskeæg:** stjernekasteren i glasset på bordet. Et klik tænder den, og
Kemichael siger noget tørt om den.

Direkte link: `index.html#beregning`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichael siger, hvor man er ·
<kbd>R</kbd> start forfra · <kbd>Enter</kbd> tjek feltet eller næste opgave ·
<kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for de to faner, gættet, teorien og rundvisningen
css/stil.css        alt udseende (kopi af sc4.11; nyt nederst: gættets kort og brøkfelterne fra sc4.3).
                    NB: decimaltal med PUNKTUM i CSS
sprites/            batteriet, iltflasken, stjernekasteren og de tre billeder til gættet (nye);
                    vægten, luppen og katederet (som sc4.11)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.11)
js/data.js          atommasserne, klumperne, udbyttet, branden, gættet, regnetrinene, spørgsmålet og replikkerne
js/kemi.js          klumpen (branden, ilten, hvad vægten viser) og facit
js/tjek.js          formlen, mellemregningens felter og resultatet med enhed, de typiske fejl og de pæne beregninger
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, vægten, pladen, stålulden, der gløder, gnisterne, batteriet,
                    iltflasken og slangen, stjernekasteren, luppen med atomerne, søjlerne og regnestykket
js/laerer.js        Kemichael ved katederet (som sc4.5 og sc4.11)
js/fane.js          det, fanerne deler: opgavelisten, knappen, linjen i kortet, Kemichael og musen
js/regning.js       regnestykket i kortet (formel, mellemregning i brøkfelter, resultat) og tavlen
js/sim_forsoeg.js   fane 1, gættet og målingerne, som fane 2 bruger
js/sim_beregning.js fane 2
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Klumperne** (`D.KLUMPER`), **udbyttet** (`D.UDBYTTE`) og **branden**
(`D.BRAND`: hastigheden, og hvor meget ilten fra flasken hjælper) står i
`js/data.js`. **Gættet** står i `D.GAET` (spørgsmålet, noten, Kemichaels
linje og for hvert kort titlen, billedet, teksten og forklaringen, hvis
gættet ikke holdt). **Regnetrinene** står i `D.TRIN` (navn, venstreside,
enhed, formlens led og regnetegn og de tre slags hint), **spørgsmålet** i
`D.HVORFOR` og **teksten over tavlen** i `D.OVER_TAVLE`. **Replikkerne**
står i `D.INTRO`, `D.FAERDIG`, `D.ROS`, `D.KAFFE` og `D.STJERNE`.

**Formlernes regler** (hvad trinnet finder, hvad man kender, de typiske
fejl) står i `F` i `js/tjek.js`, **talfejlene** i `kandidater`. Etiketten
afgør stoffet: m(Fe), m(før), m(jern) og m(stålulden) er det samme, og m, n
og M uden etiket får trinnets betydning, hvor det er entydigt.

**`_selvtest.html`** åbner index.html i en iframe og tjekker molarmasserne,
at alle klumper ender på den rigtige visning og bliver tungere, at ilten gør
det mindst tre gange hurtigere, over 30 formler og fejl, facit og
mellemregningens tal for alle klumper, de pæne beregninger, sproget, det
gratis gæt (kortene, Kemichaels linje, ingen hint-knap, batteriet låst),
fane 1 med musen (batteriet ved siden af og på ulden, iltflasken, m(efter)
for tidligt, hint og svar hele vejen, tændt før m(før), stjernekasteren),
fane 2 med hint, brøkfelter, spørgsmålet og måling 2, Kemichael og layoutet
fra 520 × 380 til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files` og lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 27. september 2026: ALT OK (119 påstande).

## Forenklinger

* Stålulden regnes som rent jern.
* Produktet regnes som FeO (2 Fe + O₂ → 2 FeO), som i den gamle c4.8, så
  forholdet bliver 1 : 1. I virkeligheden dannes en blanding af jernoxider,
  bl.a. Fe₃O₄ og Fe₂O₃. Teorien siger det.
* Kun en del af jernet reagerer (75-88 %, ny for hver klump): ilten når ikke
  ind til det inderste. Gnister og stumper, der falder af, tager ingen masse
  med i modellen.
* Branden: dp/dt = 0,10 · (1 − p) + 0,015 pr. sekund, hvor p er den del af
  det jern, ilten kan nå, der har reageret; seks gange hurtigere med ilt fra
  flasken. Tiden er trykket sammen: en klump brænder på ca. 20 s.
* Luppen er et billede, ikke et antal: 45 jernatomer, hvor antallet med O
  følger modellen, og O sætter sig oven på Fe i stedet for et rigtigt
  oxidgitter. Luften har 7 N₂ og 3 O₂ (med flasken 3 og 8).
* Atommasserne har to decimaler (som sc4.1): M(Fe) = 55,85 g/mol og
  M(FeO) = 71,85 g/mol. Stofmængden vises med tre betydende cifre, og
  massen af FeO regnes med det tal, eleven ser (0,0716 mol · 71,85 g/mol =
  5,14 g); et tal er rigtigt, når det højst er 1 % fra facit, så 5,15 g
  godkendes også.

## I menuen

`animationer/kemi-c-filer/samling_c4.html`: knappen med `data-emne="c4.8"`
peger på `../superanimationer/sc4.8_staaluld/index.html` (27. sept. 2026).
Navnet i `FEEDBACK_EMNER` i `animationer/samling_alt.html` er uændret
("Afbrænding ståluld"). Den gamle ligger i
`kemi-c-filer/arkiv/c4.8_eksperiment_ståluld_oldversion.html`.
