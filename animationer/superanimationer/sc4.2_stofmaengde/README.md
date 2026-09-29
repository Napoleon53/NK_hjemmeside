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
   hænger på fane 1 og 2; på fane 3 hænger formlen "m = n · M" med enhederne.
   Fane 1: hylden med krukkerne foroven, vægten og zoomboblen nedenunder,
   panelet er opgaven og beregningen. Fane 2: to vægte og et skilt på bordet,
   panelet er de tre svar. Fane 3: krukken og vægten, panelet er ordren.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Vægten | trækker klumper på 1 mol op på vægten, gerne af flere stoffer, og løser opgaver med vægten | massen er n · M, og den afhænger af stoffet |
| 2 | Flest atomer | gætter, hvor der er flest atomer: venstre, lige mange eller højre | den tungeste prøve har ikke altid flest atomer |
| 3 | Afvejning | regner massen for en ordre | m = n · M |

**Vægten.** Seks krukker står på en hylde, én pr. grundstof, med symbolet,
navnet og molarmassen på etiketten. Hver klump i en krukke er 1 mol. En klump
trækkes op på vægten; et klik på krukken eller på vægten virker også, og en
stiplet pil viser vejen, så længe vægten er tom. Klumper fra forskellige
krukker kan ligge sammen. Et klik på en klump tager den af. Vægten viser
massen, og panelet viser beregningerne, `n = 3 mol`,
`m = 3 mol · 63,55 g/mol = 190,65 g` og `N = 3 mol · 6,02 · 10²³ mol⁻¹ = 1,81 · 10²⁴`,
og hvad klumperne fylder. Ligger der flere stoffer, regnes massen for hvert
stof, `m(Cu) = 3 mol · 63,55 g/mol = 190,65 g`, og til sidst i alt,
`m = 190,65 g + 590,91 g = 781,56 g`.
Zoomboblen viser atomerne: tætpakkede kugler for metallerne og sekskanter for
grafit. Klumperne er terninger med det rumfang, 1 mol har, i vægtens
målestok (vægten er 24 cm bred), så 1 mol guld er en terning på 2,2 cm og 1 mol
carbon en på 1,7 cm. Højst 10 klumper.

Tre mål er opvarmning: 3 mol kobber, 3 mol guld ved siden af kobberet (lige
mange mol, forskellig masse) og 3 mol, der vejer så lidt som muligt. Så kommer
fire slags opgaver på skift, med nye tal hver gang:

* **To klumper:** find de to klumper, der tilsammen vejer fx 163,72 g
  (jern og sølv). Hintet siger den ene.
* **To stoffer:** "Bland kobber og guld: 4 mol i alt, og vægten skal vise
  521,04 g." Hintet: start med 4 mol kobber; hver klump, der byttes til guld,
  lægger 133,42 g til.
* **Over grænsen:** få vægten over fx 500 g med så få mol som muligt (3 mol;
  2 guld og 1 sølv er også rigtigt). Hintet: brug det stof, hvor 1 mol vejer
  mest.
* **Tre stoffer:** find tre klumper af hvert sit stof, der tilsammen vejer
  fx 368,39 g.

Alle summer af to og af tre klumper er forskellige, så hver opgave har ét svar.
Knappen giver et hint og derefter svaret, og så Næste opgave. Et forkert bud
får en kort besked, når klumperne er landet, fx "3 mol guld vejer 590,91 g.
Det kan gøres lettere." eller "Kobber og sølv vejer 171,42 g. Det er for meget."

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
tæller op. Svaret står bagefter som en pæn beregning,
`m = 0,250 mol · 107,87 g/mol = 27,0 g`. Plakaten på væggen er formlen,
`m = n · M`, med enhederne under, `g = mol · g/mol`. Antallet af atomer er
ikke med på denne fane (brugerens valg 29. sept. 2026: fanen bliver i mol). Tolv ordrer i tre
niveauer: *Hele mol*, *Under 1 mol* og *Skæve tal*. En ordre, der er løst uden
at se svaret, får en stjerne.

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation
(reglen i `../README.md`): vægten tre replikker (han peger på hylden),
flest atomer to (han peger på svarene), afvejning tre (han peger på panelet og
på krukken). Han går kun ved den store knap, to klik på ham eller Esc.
<kbd>K</kbd> viser præsentationen igen. Ellers roser han tørt, når de tre mål
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
  rigtigt. Regningen fra masse til stofmængde er taget ud (c4.3 ejer den).
* **Fejlbeskederne kender fejlene:** divideret i stedet for ganget, massen af
  1 mol, stofmængden skrevet som svar, atomnummeret, et andet grundstofs
  molarmasse og kommaet.
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
js/data.js          grundstofferne, parrene, ordrerne og replikkerne
js/opgaver.js       målene og de fire slags opgaver på fane 1, med tjek og beskeder
js/tjek.js          tjek af massen på fane 3; beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, plakaterne, hylden, krukken, klumperne, vægten, prøven i
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

**Målene og opgaverne** på fane 1 står i `js/opgaver.js`: de tre mål i
`O.MAAL` og de fire slags opgaver i `O.TYPER` (tekst, hint, svar, tjek og
beskeden bagefter). Grænserne for Over grænsen står i `O.GRAENSER`.
**Parrene** i `D.PAR` (hver prøve som `[symbol, mængde, "mol" eller
"g"]` og forklaringen) og **ordrerne** i `D.ORDRER` (niveau, symbol og
stofmængden, som den skal stå). Massen og antallet regnes ud.

**Fejlbeskederne** på fane 3 står i `js/tjek.js`. Et svar godkendes, når det
højst er 1 % fra facit.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at
molarmasserne, massefylderne og rumfangene passer med tabellen, at tallene
skrives rigtigt (1,505 bliver 1,51), at målene, parrene og ordrerne regner
rigtigt, at alle 252 opgaver på fane 1 har ét svar inden for 10 mol og
2200 g, at de forkerte bud får de rigtige beskeder, at 12 typiske fejl i
massen giver den rigtige besked, at sproget holder reglerne, at alle tre
faner kan gennemføres (fane 1 også ved at trække med musen og med blandede
klumper, der ligger på hinanden), at Kemichael kan vises og sendes ud på alle
faner, og at layoutet holder fra 520 × 380 til 1500 × 900. Den kræver en lokal
server eller Chrome med `--allow-file-access-from-files`. Den lægger elevens
gemte fremskridt tilbage bagefter. Sidst kørt 29. september 2026: ALT OK
(111 påstande).

## Forenklinger

* Molarmasserne har to decimaler (IUPAC 2021, rundet), og N<sub>A</sub> er
  6,02 · 10²³ mol⁻¹, som i bogen. Svarene på fane 3 har tre betydende cifre,
  som stofmængden.
* Blandede klumper ligger bare ved siden af og oven på hinanden på vægten.
  De er ikke en legering.
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

## Rettet 29. sept. 2026

Brugerens tilbagemelding: fane 1 var god, men opgaverne for nemme, og det ville
være hyggeligt at kunne blande klumperne. Svaret "Find det stof, hvor 3 mol
vejer mindst. 3 mol guld vejer 590,91 g. Der er et stof, der vejer mindre." var
krøllet. På fane 3 var antallet af atomer irrelevant; fanen skulle blive i mol.

* Fane 1: klumperne kan blandes (et klik på en anden krukke bytter ikke
  længere stoffet). Fire mål er blevet til tre som opvarmning, og derefter fire
  slags opgaver på skift med nye tal. Frit valg og Start målene forfra er væk:
  der kommer altid en ny opgave.
* Svaret ved mål 3 er nu "3 mol guld vejer 590,91 g. Det kan gøres lettere."
* Fane 3: kun massen. Feltet til antallet og vægtens optælling af atomer er
  væk, og plakaten med Avogadros konstant er skiftet ud med formlen.

## I menuen

I menuen fra 26. sept. 2026 som c4.2 i `kemi-c-filer/samling_c4.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c4.2_stofmængde_molarmasse_atomer_oldversion.html`.
