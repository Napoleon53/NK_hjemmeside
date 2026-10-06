# sc4.8 Afbrænding af ståluld

Superanimation om, hvorfor ståluld bliver tungere, når den brænder: jernet
binder ilt fra luften, og beregningen viser, hvad den højst kan komme til at
veje. Åbn `index.html`. Mappen henter kun filer inde fra sig selv. Ingen
`fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** når ståluld brænder, binder jernet ilt fra luften, så vægten
   stiger; m(oxid) = n(oxid) · M(oxid) er det, den højst kan veje, og vægten
   viser mindre, fordi ikke alt jernet når at reagere.
2. **Afløser** `kemi-c-filer/c4.8_eksperiment_ståluld.html` ("Afbrænding
   ståluld" i `samling_c4.html`). Med fra den gamle: hypotesen med de tre
   svar, vægten med stålulden og displayet, Antænd, ekstra ilt fra en
   flaske, partikelbilledet med Fe, O og O₂, klumper af forskellig masse,
   udbyttet på 75-88 %, der varierer fra klump til klump, beregningen i tre
   trin (n(Fe), n(FeO), m(FeO)), sammenligningen med vejningen, spørgsmålet
   om, hvorfor vægten viser mindre, med de samme tre svar, og fejlkilderne.
   Bygget om: hypotesen er et gratis gæt på tre kort med billeder (brugerens
   ønske 27. sept. 2026: den gamle hypoteseskærm var invasiv og en kedelig
   start); eleven aflæser og skriver selv m(før) og m(efter); stålulden
   tændes med en bunsenbrænder og går ud, før alt jernet har reageret,
   medmindre eleven giver ilt fra flasken (brugerens ønsker 28. sept. 2026);
   beregningen har formlen, mellemregningen i brøkfelter og resultatet med
   enhed som sc4.3. Ud: skyderen med massen (klumperne har forskellig masse
   i stedet) og præcisions-badget (stjernerne i opgavelisten gør det samme,
   og gættet tæller ikke med, fordi det er gratis).
3. **Naboerne:** `sc4.3` ejer n = m / M, `sc4.5` ejer mængdeberegning med
   skemaet og begrænsende mængde, `sc4.7` og `sc4.9` er de andre vejeforsøg,
   og `sc8.*` ejer redox. Her bruges kun forholdet i reaktionsskemaet og de
   to molarmasser, der står i skemaet på tavlen.
4. **Loftet:** 2 faner. Forsøget: 2 målinger, 1 vægt, 1 klump, 1 bunsenbrænder, 1
   iltflaske, 1 lup med 45 jernatomer. Beregningen: 2 opgaver med 3 trin og
   ét spørgsmål, 2 reaktionsskemaer (Let og Svær), 1 skema på tavlen og 3
   søjler.
5. **Layoutet:** scene plus panel. Der er ingen lærer. På fane 1 står en
   statuslinje nederst i scenen med næste skridt, feltet til det tal, der
   skal aflæses, og hint-knappen. På fane 2 står linjen og hint-knappen i
   panelet lige under det trin, eleven er ved.

Det er en superanimation, ikke en superlab-animation: klumpen ligger klar på
vægten, der er ingen flasker at hælde fra, ingen uheld og ingen oprydning.

### Rettet 5. oktober 2026 efter brugerens test

Brugerens fem ønsker og det, der blev gjort:

* **Startskærmen var forvirrende.** Den lå halvt gennemsigtig over scenen,
  hvor flammen og luppen bevægede sig, og både Kemichael, opgavekortet og
  kortene stillede spørgsmålet. Nu dækker startskærmen hele scenen og er
  ikke gennemsigtig, intet bevæger sig bag den, panelet er dæmpet, og der
  står to sætninger før spørgsmålet: hvad ståluld er, og at eleven om lidt
  sætter ild til en klump på en vægt.
* **Stjernekasteren er fjernet** (påskeægget med sprite, tegning og replik).
* **Brænderen skal være oplagt at trykke på.** Når stålulden skal tændes,
  har brænderen en gul ring, der pulserer, et skilt over flammen med
  "Klik for at tænde", og statuslinjen siger "Klik på bunsenbrænderen".
  Iltflasken får på samme måde skiltet "Klik for mere ilt", mens stålulden
  gløder.
* **Beregningen var forvirrende, med en hel linje af oplysninger på tavlen.**
  Tavlen viser nu et mængdeberegningsskema som i `sc4.5`: reaktionsskemaet
  med m, M og n under hvert stof, de kendte tal på plads, tre
  spørgsmålstegn og pile for vejen. Regnestykket står kun ét sted, i
  panelet. Omskifteren Let / Svær vælger reaktionsskemaet: Svær regner med
  3 Fe + 2 O₂ → Fe₃O₄.
* **Kemichael er helt ude**, med kateder, taleboble, knappen Send Kemichael
  ud og de to filer uden for mappen. Hintene er de samme, og knappen er
  blevet gul og står ved siden af teksten.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Forsøget | gætter gratis, aflæser m(før), tænder stålulden med bunsenbrænderen, giver evt. ilt og aflæser m(efter) | stålulden bliver tungere, fordi ilt fra luften binder sig til jernet |
| 2 | Beregningen | skriver formlen, mellemregningen og resultatet i tre trin og svarer på, hvorfor vægten viste mindre | alt jernet kunne give m(oxid), men ilten når ikke ind til det hele |

**Startskærmen med det gratis gæt.** Måling 1 begynder med en skærm, der
dækker hele scenen: etiketten "Gæt først", indledningen ("Ståluld er tynde
tråde af jern, og de kan brænde. Om lidt sætter du ild til en klump, der
ligger på en vægt."), spørgsmålet "Hvad viser vægten, når stålulden har
brændt?" og tre kort: Lettere (brænde på et bål bliver til aske og røg), Det
samme (en skålvægt i balance med grå og sort ståluld) og Tungere (et søm,
der ruster). Under kortene står, at gættet koster ingenting. Scenen bag
skærmen står stille og tegnes ikke om, og kortene i panelet er dæmpet. Når
et kort er valgt, står det et øjeblik, skærmen glider væk, og gættet står
under skemaet med billedet. Når målingen er færdig, forklarer statuslinjen
gættet ud fra det, eleven gættede.

**Forsøget.** Vægten er nulstillet med den varmefaste plade, så den viser
stålulden (2,50-5,00 g). Statuslinjen nederst i scenen siger ét skridt ad
gangen: aflæs vægten (feltet m(før) står i linjen), klik på bunsenbrænderen,
klik på iltflasken, mens stålulden gløder, og aflæs vægten igen (feltet
m(efter)). Det, der skal bruges, har en gul pil over sig; ved brænderen og
iltflasken står der på et skilt, hvad et klik gør. Et klik på brænderen
sender den selv hen til stålulden; den kan også trækkes derhen, så vendes
den vandret, og når flammespidsen rører stålulden, går den i brand. En
gasslange går fra brænderen ud ad bordets venstre kant. Stålulden gløder
fra der, hvor flammen rørte, fronten breder sig, trådene bliver mørke, og
der kommer gnister. I luft falmer gløden, og efter ca. 33 s er stålulden
gået ud, før alt jernet har reageret: en del af trådene er stadig grå. Et
klik på iltflasken, mens den gløder, giver ren ilt i 2 s: gløden blusser
op, den brænder hvidere og hurtigere, og med ilt nok når den helt til ende.
Er den gået ud, kan den ikke tændes igen, og linjen siger bagefter, at den
gik ud uden iltflasken. Feltet til m(efter) kommer først, når vægten står
stille. Tændes stålulden, før m(før) er skrevet, siger linjen det; m(før)
kan stadig skrives, hvis man så tallet. Luppen viser overfladen af en
ståltråd: O₂ og N₂ flyver rundt, et O₂ flyver ned, deles, og de to O sætter
sig på hver sit Fe. Overfladen reagerer først, og den inderste del når
aldrig at reagere. Med flasken kommer der flere O₂ og færre N₂. Skemaet i
panelet viser de tal, eleven har aflæst. Målingerne huskes i browseren og
bruges på fane 2.

**Beregningen.** Over tavlen står spørgsmålet: "Hvad vejer stålulden, hvis
alt jernet bliver til FeO?" Tavlen er et mængdeberegningsskema: øverst
reaktionsskemaet med tallene foran stofferne i orange, og under hvert stof
rækkerne m (masse), M (molarmasse) og n (stofmængde). Massen af jernet fra
forsøget står i en grøn stiplet boks, de to molarmasser står under hvert sit
stof, og de tre celler, eleven regner, står med et spørgsmålstegn. Den
celle, man er ved, har en gul ramme. Når et trin er løst, står resultatet i
cellen, og en pil viser vejen: ned i kolonnen med jern (÷ M), på tværs
under n-rækken (2 : 2 eller ÷ 3) og op i kolonnen med oxidet (· M). Et
klik på en celle siger, hvad tallet er.

Regnestykket står i panelet og kun der. Hvert trin skrives som i sc4.3:
formlen, mellemregningen i to felter over og under en brøkstreg (eller med
et gangetegn, hvor tallene må byttes om) og resultatet med enhed. Linjen
med næste skridt, fejl og hint og den gule knap står lige under det trin,
eleven er ved, og flytter med ned. Et løst trin er grønt. I måling 2 står
formlerne der allerede. Måling 1 slutter med den gamles spørgsmål, "Hvorfor
viser vægten mindre, end du har regnet ud?", med svarene fordampet jern,
ikke alt jernet reagerede og vægten kan ikke veje ilt. Et forkert svar
forklares og låses, og det rigtige giver, hvor stor en del af jernet der
reagerede. Søjlerne på bordet er stålulden før, vægten efter og det, der er
regnet ud; den grå del er jernet, den røde ilten, og den sidste søjle står
stiplet med "?", til massen af oxidet er regnet. Efter spørgsmålet viser en
stiplet rød kasse den ilt, der ikke kom på. Har eleven ikke målt selv,
bruges et eksempel (4,00 → 4,94 g med ilt og 3,00 → 3,41 g uden), og kortet
siger det.

**Let og Svær.** Omskifteren over tavlen vælger reaktionsskemaet:

| | Reaktionsskema | Trin 2 | M(oxid) |
|--|----------------|--------|---------|
| Let | 2 Fe + O₂ → 2 FeO | n(FeO) = n(Fe) | 71,85 g/mol |
| Svær | 3 Fe + 2 O₂ → Fe₃O₄ | n(Fe₃O₄) = n(Fe) / 3 | 231,55 g/mol |

I Svær er trin 2 en brøk, hvor tallet under stregen (3) ikke har nogen
enhed. Skriver eleven FeO i Svær eller Fe₃O₄ i Let, siger linjen, hvilket
oxid skemaet regner med. Hvert skema har sit eget sæt af løste opgaver, og
valget huskes. Den samme måling giver et større regnet tal i Svær, så en
mindre del af jernet har reageret (fx 62 % mod 82 %).

**Hjælpen.** Der er én knap ad gangen: Giv hint, så Vis svaret, og når
opgaven er løst, Næste måling eller Næste opgave. Linjen har et mærke
forrest (Hint, Svaret, Løst ✓) og farve efter, hvad der skete. Et forkert
svar gør linjen rød og ryster den, og knappen lyser stille, til hintet er
givet.

Direkte links: `index.html#beregning` og `index.html#svaer` (Svær på fanen
Beregningen; `#let` vælger Let igen).

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>R</kbd> start forfra · <kbd>Enter</kbd> tjek
feltet eller næste opgave · <kbd>Esc</kbd> luk. Genvejene med bogstaver
virker, når der ikke skrives i et felt.

## Filer

```
index.html          markup for de to faner, statuslinjen, startskærmen, teorien og rundvisningen
css/stil.css        alt udseende (kopi af sc4.11; nyt nederst: gættets kort, brøkfelterne fra sc4.3,
                    statuslinjen som sc1.4 og omskifteren som sc4.11).
                    NB: decimaltal med PUNKTUM i CSS
sprites/            iltflasken og de tre billeder til gættet (nye);
                    bunsenbrænderen (som sc4.7), vægten og luppen (som sc4.11)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.11)
js/data.js          atommasserne, de to reaktionsskemaer, klumperne, udbyttet, branden, gættet,
                    regnetrinene, spørgsmålet og linjerne
js/kemi.js          klumpen (branden, ilten, hvad vægten viser), reaktionsskemaerne og facit
js/tjek.js          formlen, mellemregningens felter og resultatet med enhed, de typiske fejl og de pæne beregninger
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, vægten, pladen, stålulden, der gløder, gnisterne, bunsenbrænderen
                    med flammen og gasslangen, iltflasken og slangen, luppen med atomerne, pilen med
                    skiltet, søjlerne og pilene i skemaet
js/skema.js         mængdeberegningsskemaet på tavlen på fane 2
js/fane.js          det, fanerne deler: opgavelisten, linjen med hint-knappen og musen
js/regning.js       regnestykket i kortet (formel, mellemregning i brøkfelter, resultat)
js/sim_forsoeg.js   fane 1, startskærmen med gættet og målingerne, som fane 2 bruger
js/sim_beregning.js fane 2 og omskifteren Let / Svær
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, links, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Reaktionsskemaerne** står i `D.SKEMA` i `js/data.js`: knappens navn,
oxidets formel, tallene foran Fe, O₂ og oxidet og antallet af Fe og O i
oxidet. Molarmassen, forholdet og teksterne regnes af det. Skal Svær i
stedet regne med Fe₂O₃, rettes linjen til
`{ id: "svaer", knap: "Svær", oxid: "Fe₂O₃", koef: [4, 3, 2], fe: 2, o: 3 }`;
så bliver trin 2 n(Fe₂O₃) = n(Fe) / 2. Forholdet mellem Fe og oxidet skal
kunne forkortes til n : 1. Rækkefølgen i `D.SKEMAER` er rækkefølgen i
omskifteren, og det første er det, animationen starter med.

**Klumperne** (`D.KLUMPER`), **udbyttet** (`D.UDBYTTE`) og **branden**
(`D.BRAND`: hastigheden, hvor hurtigt gløden dør i luft, og hvor meget ilten
fra flasken hjælper) står samme sted. **Startskærmen** står i `D.GAET`
(etiketten, indledningen, spørgsmålet, noten og for hvert kort titlen,
billedet, teksten og forklaringen, hvis gættet ikke holdt).
**Statuslinjens skridt** står i `D.LINJE`, hintene i `D.HINT`, svarene i
`D.SVAR` og **skiltene** over brænderen og iltflasken i `D.SKILT`.
**Regnetrinene** står i `D.TRIN` (navn, venstreside, enhed, formlens led og
regnetegn og de tre slags hint; `{ox}` er oxidet i det valgte skema),
**spørgsmålet** i `D.HVORFOR`, **teksten over tavlen** i `D.OVER_TAVLE` og
det, et klik på en celle i skemaet siger, i `D.CELLE`.

**Formlernes regler** (hvad trinnet finder, hvad man kender, de typiske
fejl) står i `regler` i `js/tjek.js`, **talfejlene** i `kandidater`.
Etiketten afgør stoffet: m(Fe), m(før), m(jern) og m(stålulden) er det
samme, og m, n og M uden etiket får trinnets betydning, hvor det er
entydigt.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at mappen kun
henter filer inde fra sig selv, og at der ikke er nogen lærer eller
stjernekaster, molarmasserne og de to reaktionsskemaer, at alle klumper med
ilt hele vejen ender på den rigtige visning, at de uden ilt går ud efter
25-45 s med 45-70 % af det jern, ilten kan nå, at en udgået klump ikke kan
tændes igen, eksemplerne, over 50 formler og fejl i Let og Svær, facit og
mellemregningens tal for alle klumper i begge skemaer, de pæne beregninger,
sproget, startskærmen (dækker scenen, er ikke gennemsigtig, intet bevæger
sig bag den, panelet dæmpet, ingen hint-knap, brænderen låst), fane 1 med
musen (feltet i statuslinjen, skiltene Klik for at tænde og Klik for mere
ilt, brænderen vendes vandret, sluppet langt væk og med flammen på ulden,
iltflasken, hint og svar hele vejen, tændt før m(før), gået ud), fane 2 med
skemaets celler og pile, linjen under det aktive trin, hint, brøkfelter,
spørgsmålet og måling 2, omskifteren Svær med sit eget sæt af opgaver og
layoutet fra 520 × 380 til 1500 × 900. Den kræver en lokal server eller
Chrome med `--allow-file-access-from-files` og lægger elevens gemte
fremskridt tilbage bagefter. Sidst kørt 5. oktober 2026: ALT OK (178
påstande).

## Forenklinger

* Stålulden regnes som rent jern.
* Produktet regnes i Let som FeO (2 Fe + O₂ → 2 FeO), som i den gamle c4.8,
  så forholdet bliver 1 : 1. I virkeligheden dannes en blanding af
  jernoxider, mest Fe₃O₄ og noget Fe₂O₃. Svær regner med Fe₃O₄ alene.
  Teorien siger det.
* Forsøget på fane 1 er det samme, uanset hvilket skema der er valgt på
  fane 2: vægten stiger med 75-88 % af det, FeO ville give (21-25 % af
  jernets masse). Regnet som Fe₃O₄ svarer det til, at 56-66 % af jernet
  har reageret. I begge skemaer viser vægten altid mindre, end der regnes
  ud. Luppen sætter ét O på hvert Fe.
* Gnister og stumper, der falder af, tager ingen masse med i modellen.
* Branden: p er den del af det jern, ilten kan nå, der har reageret, og G er
  gløden (1 ved tænding). I luft er dp/dt = 0,12 / 0,7 · G · (0,7 − p), og G
  falder med 8,5 % pr. sekund; under 0,06 er stålulden gået ud (efter ca.
  33 s, med p ≈ 0,6). Med ilt fra flasken stiger G mod 1, og dp/dt =
  3 · (0,12 · G · (1 − p) + 0,02 · G), så p når 1. Tiden er trykket sammen.
  At en udgået klump ikke kan tændes igen, er valgt, så forsøget kun når til
  ende med iltflasken.
* Luppen er et billede, ikke et antal: 45 jernatomer, hvor antallet med O
  følger modellen, og O sætter sig oven på Fe i stedet for et rigtigt
  oxidgitter. Luften har 7 N₂ og 3 O₂ (med flasken 3 og 8).
* Atommasserne har to decimaler (som sc4.1): M(Fe) = 55,85 g/mol,
  M(FeO) = 71,85 g/mol og M(Fe₃O₄) = 231,55 g/mol. Stofmængderne vises med
  tre betydende cifre, og der regnes videre med det tal, eleven ser
  (0,0716 mol · 71,85 g/mol = 5,14 g; 0,0716 mol / 3 = 0,0239 mol); et tal
  er rigtigt, når det højst er 1 % fra facit, så 5,15 g godkendes også.

## I menuen

`animationer/kemi-c-filer/samling_c4.html`: knappen med `data-emne="c4.8"`
peger på `../superanimationer/sc4.8_staaluld/index.html` (27. sept. 2026).
Navnet i `FEEDBACK_EMNER` i `animationer/samling_alt.html` er uændret
("Afbrænding ståluld"). Den gamle ligger i
`kemi-c-filer/arkiv/c4.8_eksperiment_ståluld_oldversion.html`.
