# sc4.2 Stofmængde

Superanimation om stofmængde: mol er et antal, og massen af n mol er n · M.
Åbn `index.html`. Mappen henter kun filer inde fra sig selv, bortset fra
Kemichael (`../../v2/kemichael/kemichael.js`). Ingen `fetch` og ingen moduler,
så den virker fra harddisken.

## Bestillingen

1. **Pointen:** stofmængden tæller atomer. Samme antal mol betyder lige mange
   atomer, men massen er n · M, så den afhænger af stoffet.
2. **Afløser** `kemi-c-filer/c4.2_stofmængde_molarmasse_atomer.html`. Med fra
   den gamle: de fem faste stoffer (carbon, jern, kobber, sølv, guld), at skrue
   på stofmængden og se massen, antallet af atomer og rumfanget, zoomboblen med
   atomerne, der sidder tæt, og regneøvelserne med massen fra stofmængden og
   mellemregningen som hjælp. Aluminium er ny.
3. **Naboerne:** `sc4.1_molarmasse` ejer molarmassen (summen af atommasserne),
   så molarmassen står på krukkens etiket her. `c4.3` ejer regningen fra masse
   til stofmængde (n = m / M), så den trænes ikke her; den står kun i
   forklaringen på fane 2. `c4.10` ejer betydende cifre og potensform. Brugerens
   valg.
4. **Loftet:** 3 faner og 6 grundstoffer. Fane 1: seks krukker, én vægt, højst
   10 klumper, zoomboblen og plakaten. Fane 2: to vægte, 13 par (9 pr. runde).
   Fane 3: én krukke, én vægt, 12 ordrer.
5. **Layoutet:** scene plus panel. Plakaten "1 mol = 6,02 · 10²³ atomer"
   hænger på alle tre faner. Fane 1: hylden med krukkerne foroven, vægten og
   zoomboblen nedenunder, panelet er målene og beregningen. Fane 2: to vægte og
   et skilt på bordet, panelet er de tre svar. Fane 3: krukken og vægten,
   panelet er ordren.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Vægten | trækker klumper på 1 mol op på vægten og skifter stof | samme antal mol er lige mange atomer; massen er n · M |
| 2 | Flest atomer | gætter, hvor der er flest atomer: venstre, lige mange eller højre | den tungeste prøve har ikke altid flest atomer |
| 3 | Afvejning | regner massen og antallet af atomer for en ordre | m = n · M og N = n · N<sub>A</sub> |

**Vægten.** Seks krukker står på en hylde, én pr. grundstof, med symbolet,
navnet og molarmassen på etiketten. Hver klump i en krukke er 1 mol. En klump
trækkes op på vægten; et klik på krukken eller på vægten virker også, og en
stiplet pil viser vejen, så længe vægten er tom. Et klik på en anden krukke
skifter stof: klumperne flyver hjem, og lige så mange kommer fra den nye krukke.
Et klik på en klump tager den af. Vægten viser massen, og panelet viser
beregningerne, `n = 3 mol`, `m = 3 mol · 63,55 g/mol = 190,65 g` og
`N = 3 mol · 6,02 · 10²³ mol⁻¹ = 1,81 · 10²⁴`, og hvad klumperne fylder.
Zoomboblen viser atomerne: tætpakkede kugler for metallerne og sekskanter for
grafit. Klumperne er terninger med det rumfang, 1 mol har, i vægtens
målestok (vægten er 24 cm bred), så 1 mol guld er en terning på 2,2 cm og 1 mol
carbon en på 1,7 cm. Fire mål fører eleven igennem pointen: 1 mol kobber, 3 mol
kobber, skift til guld uden at røre klumperne, og find det stof, hvor 3 mol
vejer mindst. Knappen giver et hint og derefter svaret. Bagefter er der frit
valg. Højst 10 klumper.

**Flest atomer.** To vægte med hver sin prøve i en vejebåd, givet i mol eller
i gram. Vægtene viser massen. Eleven svarer venstre, lige mange eller højre
(også med piletasterne). Så tæller vægtene: displayet skifter fra gram til
antallet af atomer, to søjler vokser op i samme målestok, der kommer et <, = eller
> mellem vægtene, og skiltet på bordet viser beregningen, for en prøve i gram
først `n = 10,00 g / 12,01 g/mol = 0,833 mol`. Parrene er valgt efter fejlen
"tungest har flest atomer": 2 mol aluminium mod 1 mol guld, 10 g guld mod 10 g
carbon, 1 mol aluminium mod 100 g guld og tre par, der står lige (fx 63,55 g
kobber mod 1 mol kobber). Tre niveauer: *Mol mod mol*, *Samme masse* og *Gram
mod mol*. En runde er ni par, tre fra hvert niveau, på tilfældig side. Hintet
passer til niveauet og sætter molarmasserne på skiltet. Et klik på en vægt får
svarknapperne til at blinke; det er ikke et svar, for så kunne man ikke svare
lige mange. Rekorden huskes.

**Afvejning.** Ordren står i panelet, fx `0,250 mol sølv`. Eleven skriver
massen og finder molarmassen på krukkens etiket. Er massen rigtig, løfter
krukken sig, låget bliver på bordet, stoffet hældes i vejebåden, og vægten
tæller op. Så skriver eleven antallet af atomer som et tal gange en potens af
10 (to felter), og displayet skifter til antallet. Svarene står bagefter som
pæne beregninger, `m = 0,250 mol · 107,87 g/mol = 27,0 g`. Tolv ordrer i tre
niveauer: *Hele mol*, *Under 1 mol* og *Skæve tal*. En ordre, der er løst uden
at se svaret, får en stjerne.

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation
(reglen i `../README.md`): vægten tre replikker (han peger på hylden),
flest atomer to (han peger på svarene), afvejning tre (han peger på panelet og
på krukken). Han går kun ved den store knap, to klik på ham eller Esc.
<kbd>K</kbd> viser præsentationen igen. Ellers roser han tørt, når de fire mål
er nået, når et niveau er afvejet, og når runden på fane 2 er slut. Replikkerne
står nederst i `js/data.js`. Kaffekoppen på bordet (fane 1 og 3) er det fælles
påskeæg.

Direkte links: `index.html#atomer` og `index.html#afvej`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>R</kbd> tøm vægten, ny runde eller ordren forfra · <kbd>Enter</kbd> næste ·
<kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> svar på fane 2 · <kbd>Esc</kbd> luk
eller send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Faktafejlen er rettet.** Den gamle sagde, at guld fylder mindre end
  kulstof ved samme stofmængde. Det er omvendt: 1 mol guld er 10,2 cm³ og
  1 mol grafit 5,3 cm³. Sølv- og guldatomer er lige store; guld er tungt,
  fordi hvert atom vejer mere. Zoomboblen og klumperne viser det.
* **Skyderen er blevet til klumper på 1 mol**, som eleven selv lægger på. Så
  bliver mol et antal, man kan tælle, og et skift af stof viser, at antallet
  bliver, mens massen ændrer sig.
* **Fane 2 er ny** og går efter misforståelsen, at den tungeste prøve har
  flest atomer.
* **Regneøvelserne er blevet til ordrer**, hvor vægten afvejer, når svaret er
  rigtigt, og antallet af atomer er kommet med. Regningen fra masse til
  stofmængde er taget ud (c4.3 ejer den).
* **Fejlbeskederne kender fejlene:** divideret i stedet for ganget, massen af
  1 mol, stofmængden skrevet som svar, atomnummeret, et andet grundstofs
  molarmasse, kommaet, potensen, antallet i 1 mol, molarmassen brugt i N og
  15,1 · 10²² i stedet for 1,51 · 10²³ (rigtigt, med en bemærkning).
* **Hjælpen er én knap:** Giv hint, så Vis svaret.
* **Konfettien er væk**, og aluminium er kommet til.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.1's). NB: decimaltal med PUNKTUM i CSS
sprites/            vægten og vejebåden (fra sc4.1; vægten siger Max 2200 g, så 10 mol
                    guld kan vejes) og pulverglasset (fra sc2.3), som er krukken
js/kerne.js         NK-navnerum, hævet skrift, hukommelse, lærred, komma, potensform,
                    betydende cifre
js/data.js          grundstofferne, målene, parrene, ordrerne og replikkerne
js/tjek.js          tjek af massen og antallet; beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, plakaten, hylden, krukken, klumperne, vægten, prøven i
                    vejebåden og zoomboblen
js/praesentation.js tilbuddet om Kemichaels præsentation (samme fil som i sc1.2)
js/sim_vaegt.js     fane 1
js/sim_atomer.js    fane 2
js/sim_afvej.js     fane 3
js/laerer.js        Kemichael på alle tre faner
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Grundstofferne** står i `G` øverst i `js/data.js`: symbol, navn, atomnummer,
molarmasse i hundrededele (63,55 er 6355), massefylde, atomradius og farve.
Rumfanget af 1 mol og klumpens kant regnes ud af dem.

**Målene** på fane 1 står i `D.MAAL` (stoffet, antallet, hintet og beskeden
bagefter), **parrene** i `D.PAR` (hver prøve som `[symbol, mængde, "mol" eller
"g"]` og forklaringen) og **ordrerne** i `D.ORDRER` (niveau, symbol og
stofmængden, som den skal stå). Massen og antallet regnes ud.

**Fejlbeskederne** står i `js/tjek.js`. Et svar godkendes, når det højst er
1 % fra facit.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at
molarmasserne, massefylderne og rumfangene passer med tabellen, at tallene
skrives rigtigt (1,505 bliver 1,51), at målene, parrene og ordrerne regner
rigtigt, at 12 typiske fejl i massen og 11 i antallet giver den rigtige
besked, at antallet kan skrives på ti måder, at sproget holder reglerne, at
alle tre faner kan gennemføres (fane 1 også ved at trække med musen), at
Kemichael kan vises og sendes ud på alle faner, og at layoutet holder fra
520 × 380 til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files`. Den lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 24. september 2026: ALT OK (86 påstande).

## Forenklinger

* Molarmasserne har to decimaler (IUPAC 2021, rundet), og N<sub>A</sub> er
  6,02 · 10²³ mol⁻¹, som i bogen. Svarene på fane 3 har tre betydende cifre,
  som stofmængden.
* Massefylderne er ved stuetemperatur (CRC Handbook). Grafit er regnet som en
  ren krystal, 2,26 g/cm³; en blyant eller en elektrode er lidt lettere.
* Kun grundstoffer, så stofmængden tæller atomer. Molekyler og formelenheder
  er ikke med (brugerens valg).
* Zoomboblen viser ét lag. Metallerne er tegnet som tætpakkede kugler med den
  metalliske radius, grafit som sekskanter med C-C-afstanden. Jern er i
  virkeligheden ikke tætpakket.
* Vægtene på fane 2 "tæller" atomer ved at dele massen med ét atoms masse.
  Det kan en rigtig vægt ikke, men en tællevægt gør det samme med skruer.

## Tilbuddet om præsentationen

Kemichael kommer ikke af sig selv. Første gang en fane åbnes, står der Start
præsentation og Nej tak midt foroven i scenen. Start sender ham ind, Nej tak og
Esc husker valget, og K viser præsentationen uden at spørge. Tilbuddet
forsvinder også, når eleven har løst noget på fanen. Koden er
`js/praesentation.js` (samme fil som i sc1.2), koblet med
`NK.Praesentation.kobl` i hver `sim_*.js`. Krukkerne på fane 1 står under
tilbuddet, så det ikke dækker dem.

## I menuen

I menuen fra 26. sept. 2026 som c4.2 i `kemi-c-filer/samling_c4.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c4.2_stofmængde_molarmasse_atomer_oldversion.html`.
