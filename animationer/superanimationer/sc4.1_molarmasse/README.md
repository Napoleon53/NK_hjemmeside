# sc4.1 Molarmasse

Superanimation om molarmasse: atommasserne fra det periodiske system lagt
sammen for alle atomerne i formlen. Åbn `index.html`. Mappen henter kun filer
inde fra sig selv, bortset fra Kemichael (`../../v2/kemichael/kemichael.js`).
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** molarmassen er summen af atommasserne: hvert grundstofs
   atommasse ganges med antallet af atomer i formlen, og det er massen af
   1 mol. Det er atommasserne, der vejer, ikke antallet af atomer.
2. **Afløser** `kemi-c-filer/c4.1_opgave_molarmasse.html`. Med fra den gamle:
   at bygge molekylet af klik på grundstofferne, atomerne der samler sig til
   molekylet med bindinger, regnestykket linje for linje, fejldiagnosen
   (komma, decimaler, et grundstof glemt, antallet glemt), de seks gamle
   molekyler (H₂O, CO₂, SO₂, CH₄, C₆H₁₄, ethanol), gættekonkurrencens anden
   del (fra molarmasse til molekyle), stimen og rekorden, og teorien med CO₂
   som eksempel.
3. **Naboerne:** `c4.2` ejer sammenhængen mellem masse, stofmængde og
   molarmasse (m = n · M) og antallet af atomer i et mol. `c4.3` ejer
   regningen fra masse til stofmængde. `sc1.2_grundstofmontren` ejer
   atomtællingen i formler (fane 2). `c4.10` ejer betydende cifre. Derfor er
   gættekonkurrencens første del (M = m/n) ikke med. Brugerens valg.
4. **Loftet:** 3 faner. 29 grundstoffer på plakaten, 12 stoffer på vægten,
   14 par på skålvægten (9 pr. runde), 12 flasker med 4 etiketter hver. På
   scenen højst plakaten, vægten eller skålvægten, ét molekyle pr. skål,
   flasken med mærket, tavlen med fire etiketter, Kemichael og koppen.
5. **Layoutet:** scene plus panel. Plakaten med det periodiske system hænger
   øverst på alle tre faner. Fane 1: vægten på bordet, panelet er
   regnestykket. Fane 2: skålvægten og kortene, panelet er de tre svar.
   Fane 3: den brune flaske med mærket og korktavlen, panelet er opgavekortet.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Vægten | bygger ét molekyle på vægten, skriver atommassen for hvert grundstof og til sidst M | M er summen af atommasserne, og det er, hvad 1 mol vejer i gram |
| 2 | Skålvægten | gætter, hvilken side der synker med 1 mol på hver side | det er atommasserne, der vejer, ikke antallet af atomer |
| 3 | Ukendt stof | finder den etiket, hvis molarmasse passer med mærket | molarmassen kan kende stoffer fra hinanden, når man regner med to decimaler |

**Vægten.** Et klik på et grundstof i det periodiske system lægger et atom på
vægten, og et klik på en kugle tager den af igen. Et forkert grundstof
blokeres ikke; beskeden siger "Vand har ingen N". Når atomerne passer med
formlen, samler de sig til molekylet med bindinger. Så kommer én række pr.
grundstof med antallet foran (2 · ___), og eleven slår atommassen op og
skriver den. Rækken regner bidraget ud, og kuglerne for grundstoffet lyser.
Til sidst skriver eleven M. Vægten viser 0,00 g, så længe der ligger ét
molekyle på den. Er M rigtig, forsvinder molekylet, og 1 mol af stoffet
kommer på: vand, ethanol og hexan i et bægerglas (rumfanget følger
massefylden: 18, 58 og 132 mL), pulver i en vejebåd og gas i en ballon på
24 L. Displayet tæller op til M gram. Tolv stoffer i tre niveauer: *Tal efter
symbolet*, *Mange atomer* og *Salte og parenteser*.

**Skålvægten.** Vægten er låst med to stolper under skålene. Et skilt på
bordets forside har én linje pr. skål (pilen peger mod skålen) med stoffet og
beregningen af massen af 1 mol, skrevet som en pæn beregning (brugerens
ønske): først `m = 1 mol · M(H₂O)`, med hintet
`m = 1 mol · (2 · 1,01 + 16,00) g/mol` og efter svaret `... = 18,02 g`.
Beregningerne står under hinanden, så de kan sammenlignes. Skiltet afløste
et kort under hver skål, fordi de lange beregninger (H₂SO₄, ethanol) ikke kunne
være på et kort på små skærme. Eleven svarer venstre, lige eller højre (også
med piletasterne). Så falder stolperne, armen svinger
og falder til ro, og en linje forklarer parret. Parrene er valgt efter fejlen "flest atomer vejer mest":
CH₄ mod O₂, H₂ mod He, Fe mod butan og K mod Ar (K har størst atomnummer, Ar
størst atommasse). I de svære par er forskellen 0,07-0,51 g, og CO mod N₂ står
lige. En runde er ni par, tre fra hvert niveau, i tilfældig rækkefølge og på
tilfældig side. Hintet sætter atommasserne ind i beregningen. Rekorden huskes.

**Ukendt stof.** Etiketten er faldet af en brun flaske, så man ikke kan se
stoffet. Mærket om halsen siger kun molarmassen. Fire etiketter hænger på en
korktavle. En forkert etiket flyver hen til flasken, falder af igen og hænger
bagefter streget ud med sin molarmasse, og beskeden siger, hvor langt den er
fra ("Det er 0,04 g/mol for lidt"). Tolv flasker i tre niveauer: *Tydelig
forskel* (mindst 5 g/mol), *Tæt på* (0,3-3 g/mol) og *To decimaler* (højst
0,1 g/mol: C₂H₄, N₂, CO og Si ligger alle omkring 28). En flaske, der er
løst i første forsøg uden at se svaret, får en stjerne.

**Plakaten** er et periodisk system med hovedgrupperne i periode 1-4 og tre
overgangsmetaller (Fe, Cu, Zn). Hvert felt har atomnummeret foroven og
atommassen forneden. Hullet i periode 1 forklarer, hvilket tal der er hvad,
fordi atomnummeret i stedet for atommassen er den hyppigste fejl. Musen over
et felt viser navnet.

**Kemichael** præsenterer hver fane første gang, den åbnes i en browser, efter
reglen i `../README.md`: vægten tre replikker (han peger på panelet og på
forklaringen på plakaten), skålvægten to (han peger på svarene), ukendt stof
tre (han peger på mærket). Han går kun ved den store knap, to klik på ham
eller Esc. <kbd>K</kbd> viser præsentationen igen. Ellers roser han tørt, når
et niveau er løst, og kommenterer runden på skålvægten. Replikkerne står
nederst i `js/data.js`. Kaffekoppen på bordet (fane 1 og 3) er det fælles
påskeæg.

Direkte links: `index.html#skaal` og `index.html#ukendt`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>R</kbd> start stoffet eller runden forfra · <kbd>Enter</kbd> næste ·
<kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> svar på skålvægten · <kbd>Esc</kbd>
luk eller send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Eleven slår selv atommasserne op.** Før skrev regnestykket sig selv, og
  eleven skrev kun summen. Nu står antallet foran, og eleven skriver
  atommassen. Brugerens valg.
* **Fejlbeskederne kender flere fejl:** atomnummeret i stedet for atommassen
  (8 for O), alle atomerne i én række (32 for 2 O), et andet grundstofs masse,
  decimaler der mangler (12 for C, 35,5 for Cl), kommaet flyttet, antallet
  ikke ganget med, et grundstof glemt, hvert grundstof talt én gang og
  atomnumrene lagt sammen. Beskeden kommer ved første fejl, ikke først ved
  anden.
* **Vægten og 1 mol er nye.** Det viser, hvad molarmassen betyder: ét
  molekyle kan vægten ikke mærke, 1 mol vejer M gram.
* **Skålvægten er ny** og går efter misforståelsen, at flest atomer vejer
  mest.
* **Gættekonkurrencen er blevet til Ukendt stof** uden M = m/n. Etiketterne
  er valgt, så de tætte kræver to decimaler.
* **Seks nye stoffer på vægten** (O₂, glucose, NaCl, CaCO₃, Ca(OH)₂, Al₂(SO₄)₃),
  så parenteser og salte er med.
* **XP-bjælken og titlerne (Lærling, Professor) er erstattet** af stjerner pr.
  stof og flaske, og fremskridtet huskes i browseren.
* **Hjælpen er én knap:** Giv hint, så Vis svaret.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc1.2's). NB: decimaltal med PUNKTUM i CSS
sprites/            vægten, skålvægtens fod, arm og skål, vejebåden,
                    bægerglasset (fra sc2.4) og reagensflasken (fra sc1.2)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal med komma
js/data.js          grundstofferne, stofferne med strukturer, parrene, gåderne, replikkerne
js/tjek.js          tjek af atommasse og molarmasse; beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       plakaten, kuglerne og molekylerne, vægten, 1 mol, skålvægten,
                    flasken, etiketterne, mærket og korktavlen
js/sim_vaegt.js     fane 1
js/sim_skaal.js     fane 2
js/sim_ukendt.js    fane 3
js/laerer.js        Kemichael på alle tre faner
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Atommasserne** står i `G` øverst i `js/data.js` i hundrededele (1,01 er 101)
sammen med den præcise værdi, som også godkendes, hvis eleven skriver den.
Molarmasserne regnes ud af formlen, så de følger med.

**Stofferne** står i `S` i `js/data.js`: formlen med almindelige tal, navnet
og for stofferne på vægten formen (`vaeske`, `pulver`, `gas`), farven,
massefylden og en linje om stoffet. Strukturerne (atomernes plads i
bindingslængder og bindingerne) står i `STRUKTUR`; alkaner laves af
`alkan(n)`.

**Stofferne på vægten** står i `D.NIVEAUER`, **parrene** i `D.PAR` (med
forklaringen) og **gåderne** i `D.GAADER` (det rigtige stof først).
Skålvægtens følsomhed er `D.FOELSOMHED` (5 hundrededele = 0,05 g).

**Fejlbeskederne** står i `js/tjek.js`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at de 29
atommasser passer med IUPAC's tabel rundet til to decimaler, at de 48
molarmasser passer med en håndregning, at formlerne tælles rigtigt (også
parenteser og samme symbol flere steder), at strukturerne har formlens atomer
uden at kuglerne falder oven i hinanden, at 12 typiske fejl i atommassen og 14
i molarmassen giver den rigtige besked, at parrene synker til den rigtige side,
og at mindst fire af dem har flest atomer på den lette side, at gåderne har den
afstand, niveauet siger, at sproget holder reglerne, at alle tre faner kan
gennemføres, og at layoutet holder fra 520 × 380 til 1500 × 900. Den kræver en
lokal server eller Chrome med `--allow-file-access-from-files`. Den lægger
elevens gemte fremskridt tilbage bagefter.

## Forenklinger

* Atommasserne har to decimaler (IUPAC 2021, rundet), og molarmasserne er
  regnet med dem. Det giver fx 16,05 g/mol for CH₄, hvor den præcise værdi er
  16,04. Afvigelsen er under 0,05 g/mol for alle stofferne (størst for
  saccharose, 0,04).
* Plakaten har kun hovedgrupperne og Fe, Cu og Zn af overgangsmetallerne.
* Et salt vises som én formelenhed med ionerne ved siden af hinanden, og
  molekylerne er tegnet fladt.
* 1 mol gas fylder ca. 24 L ved stuetemperatur. Ballonen vejes, som om luften
  ikke løftede den (ingen opdrift).
* Skålvægten kan mærke 0,05 g. Mindre forskelle står lige, og hældningen
  vokser med forskellen, men højst til ca. 14 grader.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven i scenen. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er `js/praesentation.js` (samme fil som i sc1.2), som i
`js/app.js` pakker den gamle `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".

## I menuen

Ikke endnu. Menuen viser stadig den gamle c4.1. Når den skal i menuen: knappen
med `data-emne="c4.1"` i `animationer/kemi-c-filer/samling_c4.html` skal pege
på `../superanimationer/sc4.1_molarmasse/index.html`, den gamle flyttes til
`kemi-c-filer/arkiv/c4.1_opgave_molarmasse_oldversion.html`, og navnet
`'Opg: Molarmasse'` i `FEEDBACK_EMNER` i `animationer/samling_alt.html` rettes
til `'Molarmasse'`.
