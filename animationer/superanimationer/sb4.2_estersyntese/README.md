# sb4.2 Estersyntese

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter
molekylemotoren fra `../../molekylemotor/` (molekylet, navngivningen,
navnelæseren, tegningen, tavlen og tegnebrættet) og virker også, når den
åbnes direkte fra harddisken. Der er ingen Kemichael: al tekst står på det
lyse papirkort øverst i scenen, hjælpen er den gule knap på kortet, og intet
løses uden **Indsend svar**.

Den afløser `animationer/kemi-b-filer/b5.2_eksperiment_estersyntese.html`
(B4 knap 2, koden `b5ester`), når brugeren siger til. Nummeret 4.2 er
knappens plads i B4-panelet (reglen fra 11. nov. 2026). Afsnittet i
Kemibogen B er B4.5 Estere.

**Pointen i én sætning:** En ester er syredelen med C=O og alkoholdelen
bundet sammen over et oxygenatom, fordi syrens OH-gruppe og alkoholens H går
af som vand, og derfor hedder den alkoholdelen med -yl og syredelen med -oat
og har intet H på oxygen.

## Bestillingen (12. november 2026)

Brugeren: "Kan du lave B4, knap 2: Estersyntese til en superanimation. Der
må gerne indgå navngivning.. og især forudsige hvordan esteren ser ud. Det
kan være at du skal trække på tegnebrættet hertil." Brugeren valgte tre
faner (forslaget med anbefalingen) frem for to faner eller en baglæns fane
3: Kondensationen, Forudsig esteren (med navnet, de svære baglæns) og Rens
esteren (den gamles indhold).

1. **Pointen:** som ovenfor.
2. **Afløser b5.2.** Med fra den gamle: butansyre og propan-1-ol i overskud,
   propylbutanoat, kondensationen, hvor OH og H går af som vand, og at
   esteren er "låst" uden OH-grupper; vandfasen og den organiske fase, vasken
   med vand, der tager alkoholen, og basen, der gør syren til en ion, så
   esteren bliver ren tilbage i det øverste lag. Taget ud: statuslinjen og
   den ene knap, der kørte det hele som en film. Nyt: eleven klikker selv på
   de atomer, der bliver til vand, giver esteren navn, tegner esteren ud fra
   syren og alkoholen, finder syren og alkoholen ud fra esteren, og
   forudsiger, hvor stofferne ender i skilletragten. Basen er
   natriumcarbonat som i bogen (den gamle sagde bare "basen").
3. **Naboerne:** `sb4.1_organiske_navne` ejer navnene på alle stofklasser
   og at tegne et stof ud fra navnet; her tegner eleven esteren ud fra syren
   og alkoholen og bygger navnet af de to dele. `sb4.5_organisk_syntese` ejer
   spillet med at lave estere til kunderne. `sb3.2` ejer de
   intermolekylære bindinger; fane 3 bruger dem kun som grund. Ligevægten og
   udbytteprocenten (bogens B4.5) er ikke med: ligevægten hører til B2, og
   udbyttet er en mængdeberegning.
4. **Loftet:** tre faner. Fane 1: tre reaktioner med tre trin hver. Fane 2:
   ni opgaver (tre Let, tre Middel, tre Svær baglæns). Fane 3: én blanding
   med fire spørgsmål og tre korte animationer, syv molekyler i luppen.
5. **Layoutet:** scene plus panel som sb4.11. Scenen er papirkortet øverst og
   et whiteboard under det.

Stop-listen er overholdt: ingen flasker, man hælder med musen, intet stativ,
intet affaldsglas, ingen uheld og ingen oprydning. Skilletragten er en model:
eleven forudsiger, og kortets knap sætter det næste skridt i gang.

## Fanerne

**1 Kondensationen** (`js/sim_kond.js`, `#kondensation`). Syren står til
venstre i bogens grønne farve og alkoholen til højre i orange, begge med H på
OH-gruppen tegnet, som i bogens figur b4-esterdannelse. Tre trin:

* *vand:* eleven klikker på de tre atomer, der bliver til vand (syrens
  OH-gruppe og alkoholens H), og trykker Indsend svar. Den typiske fejl, at
  alkoholen afgiver OH og syren H, får sin egen forklaring.
* *reaktion:* kortets knap sætter reaktionen i gang: alkoholens H hopper over
  til syrens OH-gruppe, det færdige vandmolekyle glider i en bue væk under
  molekylerne, og alkoholens oxygenatom binder sig til syrens carbonatom.
  Esteren og vandet beholder farverne, så man kan se, hvor atomerne kom fra.
* *navn:* hvad hedder esteren? Tre svar: det rigtige, syredelen og
  alkoholdelen byttet om (eller syredelen først, når de to er lige lange) og
  syrens navn uændret (ethylethansyre). Navnet kommer på tavlen med
  alkoholdelen i orange og syredelen i grønt.

Reaktionerne: ethansyre og ethanol, butansyre og ethanol (ananas), butansyre
og propan-1-ol (den gamles ester, der renses på fane 3). Kortet Farverne i
panelet kommer frem, når eleven har set den første ester.

**2 Forudsig esteren** (`js/sim_tegn.js`, `#forudsig` eller `#tegn`). Ni
opgaver i tre niveauer:

* *Let:* syren og alkoholen står som zigzagformler øverst på tavlen. Eleven
  tegner esteren og trykker Indsend svar (knappen viser tegningens
  molekylformel). Motoren navngiver tegningen, og modellen siger, hvad der er
  galt: syredelen og alkoholdelen byttet om, forkert antal carbonatomer i
  syredelen, en carboxylsyre eller en alkohol i stedet for en ester, C=O og
  oxygenatomet på hvert sit carbonatom, et oxygenatom for meget eller for
  lidt, vandet tegnet med. En forkert tegning koster ikke stjernen (det er at
  prøve sig frem, som i sb3.3). Den rigtige tegning får bogens farver, og så
  spørges der om navnet.
* *Middel:* kun navnene står øverst på tavlen. Med methansyre (H tegnet på
  carbonatomet, som i bogen) og pentan-1-ol (pære).
* *Svær, baglæns* (bogens opgave B4.5.1): esteren står på tavlen. Hvilken
  carboxylsyre, hvilken alkohol, og hvad hedder esteren? Syredelen bliver
  grøn, når syren er fundet, og alkoholdelen har gul baggrund, mens kortet
  spørger om den. Den sidste er 3-methylbutylethanoat (banan) med en
  forgrenet alkohol.

Værktøjerne på tavlen (som tegnebrættet og sb3.3): **C** (træk fra et atom
tegner en kæde; et klik på et C eller på et O med én binding sætter et
carbonatom på), **O** (træk fra et carbonatom sætter et oxygenatom på; et klik
gør et C til O og et O til C) og **=O** (et klik sætter et dobbeltbundet O på
et carbonatom, og værktøjet går tilbage til C). To oxygenatomer må ikke sidde
sammen. Zigzag eller Alle atomer, Slet, Fortryd (Ctrl+Z) og Ryd (R). Tasterne
C og O vælger grundstoffet. Panelet har opgaverne og stammerne (meth til oct).

**3 Rens esteren** (`js/sim_rens.js`, `#rens`). Blandingen fra kolben
(propylbutanoat, propan-1-ol i overskud, rester af butansyre og lidt
svovlsyre) står i en skilletragt til venstre, og luppen til højre viser
molekylerne i hvert lag i bogens farver. Fire spørgsmål:

1. Der tilsættes vand. Hvilke stoffer går over i vandfasen? (vælg alle, der
   passer: propan-1-ol og svovlsyre). Knappen Ryst skilletragten: vandet
   kommer i, tragten rystes, lagene skilles, svovlsyren (som ioner) og
   alkoholen går ned i vandfasen, og vandfasen tappes af i kolben under.
2. Butansyre er stadig i det øverste lag. Hvad sker der med den i
   natriumcarbonatopløsning? (baseformen går i vandfasen). Knappen Tilsæt
   natriumcarbonat: det bruser, og butansyre bliver til butanoat med en
   natriumion i vandfasen.
3. Hvilken gas dannes? (carbondioxid; dihydrogen og dioxygen er de
   forkerte). Knappen Tap vandfasen af.
4. Hvorfor ligger propylbutanoat øverst? (vælg alle, der passer: intet H på
   oxygen og lavere densitet end vand).

Det, kortet spørger om, har en gul ring i luppen, og de stoffer, eleven har
valgt i spørgsmål 1, får også en ring. Til sidst er esteren ren, og panelet
tæller de rensede estere. En ny blanding kommer med Begynd forfra i panelet
(eller R); kortets knap går altid fremad.

## Filerne

```
index.html          siden, teorien og rundvisningen
css/stil.css        kopieret fra sb4.11; det nye står nederst under SB4.2
js/kerne.js         fælles hjælpere (som sb4.11)
js/data.js          reaktionerne, opgaverne, værktøjerne, stofferne i
                    skilletragten og spørgsmålene på fane 3 med svar,
                    forklaringer og hint
js/kemi.js          modellen: esteren af syren og alkoholen, estergruppen og
                    de to dele, navnene og svarene, scenen til
                    kondensationen og forklaringerne til forkerte svar
js/fane.js          scenekortet, hjælpeknappen, Indsend svar og konfetti
                    (som sb4.11)
js/sim_kond.js      fane 1
js/sim_tegn.js      fane 2
js/sim_rens.js      fane 3 (skilletragten tegnes af en profil, så glasset og
                    lagene passer sammen, og lagenes højde regnes af
                    rumfanget)
js/rundvisning.js   rundvisningen bag ?
js/app.js           fanerne, teorien, tastaturet og tegneløkken
sprites/            bogens figurer b4-esterdannelse, b4-esternavn og
                    b4-estersyntese (til teorien)
_selvtest.html      selvtesten
```

## Det, man kan rette i

* Reaktionerne på fane 1, opgaverne på fane 2 og spørgsmålene på fane 3
  står i `js/data.js`. En ny opgave på fane 2 er én linje med syren,
  alkoholen, esterens navn (facit, som selvtesten sammenligner med motoren)
  og niveauet; `baglaens: true` gør den baglæns. Navnet og de forkerte svar
  laves af modellen.
* Forklaringerne til en forkert tegning står i `K.tegneFejl` i `js/kemi.js`.
* Bogens farver står i `D.FARVE`.

## Forenklinger

* Kondensationen vises som et bytte af atomer, ikke som en mekanisme. At
  vandets oxygenatom kommer fra syren, er bogens model (og det, isotopforsøg
  viser).
* Ligevægten er nævnt i teorien og i bogens skema, men ikke regnet:
  reaktionen på fane 1 løber helt til esteren.
* Fane 3 følger bogens tabel: vand tager svovlsyren og alkoholen, og
  natriumcarbonat tager syren. I virkeligheden fordeler både propan-1-ol og
  butansyre sig mellem lagene, så vand tager kun en del af alkoholen, og lidt
  af syren går også med. I modellen går al alkoholen med vandet, og al syren
  bliver i det øverste lag til natriumcarbonaten kommer.
* Svovlsyren vises som H₂SO₄ i blandingen og som H₃O⁺ og HSO₄⁻ i vandet.
  Natriumcarbonatopløsningen og carbonationerne vises ikke som molekyler;
  boblerne af carbondioxid og natriumionen ved butanoat gør.
* Molekylerne i luppen er et billede af forholdet, ikke stofmængder.
* Rumfanget af det øverste lag falder lidt ved hver vask; tallene er valgt,
  så det kan ses, ikke regnet.

## Det, der var mine valg (ikke brugerens)

Fanernes indhold i detaljer: de tre reaktioner, de ni opgaver og
niveauerne, at Let viser formlerne og Middel kun navnene, de tre svar til
navnet, værktøjerne C, O og =O, at en forkert tegning ikke koster stjernen,
at fane 3 har fire spørgsmål med luppen ved siden af skilletragten, og
duftene (fra bogens tabel: ananas, pære og banan).

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med mappen `animationer/`
som rod (motoren hentes fra `../../molekylemotor/`). Den tjekker, at motoren
giver alle tolv estere bogens navn, at syredelen og alkoholdelen passer, at
esterne er tegnet som i bogen (også methanoat med =O lodret op), at hvert
spørgsmål har tre forskellige svar med ét rigtigt, at kondensationen giver
esteren og vand uden atomer oven i hinanden, at forklaringerne til forkerte
atomer og forkerte tegninger passer til fejlen, at værktøjerne kan tegne
methylethanoat, at alle tre faner kan gennemføres, at forkerte svar får den
rigtige forklaring og koster stjernen, at Vis svaret virker, at intet løses
uden Indsend svar, at stofferne ender i det rigtige lag, at teksterne er
korte og uden tankestreger og ASCII-dansk, og at kortet aldrig dækker
whiteboardet fra 1100 × 620 til 1600 × 950.
12. nov. 2026: ALT OK (176). Også prøvet med rigtig mus (træk en kæde, O, =O
og Indsend svar).

## I menuen

I menuen fra 13. nov. 2026 som B4 knap 2 (koden `b5ester`). Den gamle fil bliver liggende, fordi Kemibogen B4.5 og slidesene linker til den. Det, der står herunder, var planen.

Ikke i menuen endnu. Når brugeren siger til: knap nr. 2 "Estersyntese" i
`kemi-b-filer/samling_b4,5,6.html` (koden `b5ester`) skal pege på
`../superanimationer/sb4.2_estersyntese/index.html` med en ny
`data-beskrivelse`, `FEEDBACK_EMNER` i `samling_alt_b.html` rettes, og
`index.html` får linjen
`<script src="../../til_panelet.js" data-panel="samling_alt_b.html" data-emne="b5ester"></script>`
øverst i `<head>`. Kemibogen B4.5 (Prøv selv) linker til den gamle
`kemi-b-filer/b5.2_eksperiment_estersyntese.html`, så den gamle bliver
liggende, til bogen er bygget med det nye link. Ret kolonnen "I menuen" i
`../README.md`.

## Papirkortet

Kortet er det lyse papirkort fra start (se Fælles krav i `../README.md`):
`../faelles/papirkort.css` og `../faelles/papirkort.js` er indlæst, og
`<body class="papirkort">`. Efter et rigtigt svar bliver kortet på
spørgsmålet: svaret er grønt (alle rigtige svar, når flere passer),
forklaringen står under svarene, og knappen, der fører videre, står, hvor
Indsend svar stod. Mens reaktionen eller skilletragten kører, har kortet kun
en kort tekst og ingen knapper (`skjulIndsend` og `skjulHint`).
