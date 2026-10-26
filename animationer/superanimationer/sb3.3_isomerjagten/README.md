# sb3.3 Isomerjagten

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter
molekylemotoren fra `../../molekylemotor/` og virker også, når den åbnes direkte
fra harddisken. Der er ingen Kemichael: al tekst står på ét kort øverst i
scenen, og hjælpen er den gule knap på kortet.

Den er ny og afløser ingen gammel animation. Den hører til afsnit B3.3
Strukturisomeri i Kemibogen B, som indtil nu kun linkede til tegnebrættet.
Nummeret er afsnittets, som `sb3.1` (B3.1).

**Pointen i én sætning:** Én molekylformel kan give flere stoffer, fordi
atomerne kan sættes sammen på flere måder, men to tegninger med samme navn er
det samme stof.

## Bestillingen (26. oktober 2026)

Brugeren bad om tre forslag til en animation til kapitel B3 "med udgangspunkt i
kemibogens tekster" og valgte forslag 1: "Ja isomerijagten lyder fint. Lav den".
Forslaget var: eleven får en molekylformel og tegner alle isomererne; en hylde
med en tom plads for hver isomer, der mangler; det samme stof tegnet igen bliver
genkendt; niveauer fra C₄H₁₀ til C₄H₁₀O (opgave B3.3.8); til sidst sættes
isomererne i rækkefølge efter kogepunkt, så B3.2 og B3.3 hænger sammen.

1. **Pointen:** som ovenfor.
2. **Afløser intet.** Scenekortet, tavlen og musen er fra `sb3.1_navngivning`,
   knappen Indsend svar, konfettien og medaljen fra `sb4.4_intermolekylaere_bindinger`.
3. **Naboerne:** `sc4.2_zigzagformler` fane 3 ejer kædeisomerer af alkaner
   (C₄H₁₀ til C₇H₁₆); her er kun C₅H₁₂ med som første jagt, resten har oxygen.
   `sb4.4` ejer kogepunkterne (Rangér); her er de kun afslutningen på hver jagt.
   `sb4.6` og `sb4.7` ejer stereoisomeri; her er der ingen dobbeltbindinger og
   ingen ringe. `sb3.1` og `sb4.8` ejer navngivningen; her giver tavlen navnet.
4. **Loftet:** én fane, otte jagter, 47 isomerer, højst seks atomer ud over H.
5. **Layoutet:** scene plus panel. Scenen er scenekortet øverst og et whiteboard
   under det. Panelet har jagterne og hylden.

## Det, der var mine valg (ikke brugerens)

* Én fane. Spillet "Samme stof eller isomerer?" (forslag 3) kunne blive en
  fane 2; brugerens svar gjaldt forslag 1, så det er ikke lavet.
* De første fem jagter og rækkefølgen: C₅H₁₂ (kædeisomeri), C₂H₆O (bogens
  indledning til B3.3), C₃H₈O, C₄H₁₀O (opgave B3.3.8) og alkoholerne med C₅H₁₂O
  (opgave B3.3.7 a og mere). C₄H₁₀ blev C₅H₁₂, fordi sc4.2 har C₄H₁₀, og fordi
  bogens figur over londonbindinger i B3.2 bruger de tre pentaner.
* De tre sværere jagter (brugeren samme dag: "Du må også gerne lave endnu
  sværere levels"): C₆H₁₄ (opgave B3.3.6; mange af de fem kan tegnes, så de
  ligner et andet stof), C₅H₁₀ med én dobbeltbinding og ingen ring (fem alkener;
  dobbeltbindingen flytter sig som i bogens figur over stillingsisomeri) og
  Mesterjagten med alle fjorten stoffer med C₅H₁₂O. Hver jagt har en
  sværhedsgrad (Let, Middel, Svær, Mester), som står på flisen og på kortet.
* Alkenerne: cis og trans tæller som ét stof (de er stereoisomerer, B3.4).
  Tegner eleven den anden form af en alken på hylden, siger kortet det. Ringe
  er ikke med (der er intet ringværktøj), og jagten har ingen kogepunkter,
  fordi de fem alkeners kogepunkter (20 til 39 °C) ikke kan forklares med
  bogens regler. Den slutter med et grønt kort, når alle er fundet.
* Den gule ramme på kortet (brugeren samme dag: "gøre det tydeligere hvilken
  isomer man jagter. Det er lidt svært at se de små sænkede tal, og det bliver
  ikke fremhævet helt tydeligt"): "Find isomerer af" med formlen stort og
  antallet af atomer med almindelige tal (4 C, 10 H, 1 O). Rammen står kun,
  mens eleven tegner. Alle sænkede tal på kortet, på knappen og i panelet er
  `<sub>` i stedet for tegnene ₀ til ₉, som er for små (`D.sub` i `js/data.js`).
* Jagterne i panelet er fliser i to kolonner med formlen og sværhedsgraden.
* Spørgsmålet efter hver ny isomer: hvilken slags isomerer er den nye og en fra
  hylden? Forslaget sagde, at isomeren "lander på hylden med sin slags isomeri".
  Slags isomeri er et forhold mellem to stoffer, så eleven bestemmer det selv
  ud fra et par, og begge står på whiteboardet imens.
* Kortet spørger kun om par, der er forskellige på én måde: to ethere
  sammenlignes ikke (bogen navngiver dem ikke), kædeisomere alkoholer har
  OH-gruppen på samme nummer (butan-1-ol og 2-methylpropan-1-ol, som bogens
  facit til B3.3.3 D), og stillingsisomere har samme navn på nær OH-gruppens tal.
  Højst to spørgsmål om hver slags i en jagt.
* Kogepunkterne: i de tre små jagter sættes alle i rækkefølge; i de store
  (fem til fjorten isomerer) findes den med det højeste kogepunkt, fordi
  rækkefølgen mellem fx butan-2-ol og 2-methylpropan-1-ol ikke kan afgøres ud fra
  bogen.
* Værktøjet C → O: et klik gør et carbonatom til et oxygenatom (og tilbage). Det
  er den enkleste måde at tegne en ether på ("et oxygenatom midt i
  carbonkæden", bogens ord). En ether kan også tegnes ved at bygge videre fra
  OH-gruppens oxygenatom med Kæde.
* Knappen Indsend svar viser tegningens molekylformel, mens eleven tegner
  (Indsend svar: C₄H₁₀O), men ikke navnet: navnet ville afsløre, om stoffet
  allerede er på hylden.
* Tegningen bliver stående efter en ny isomer, så eleven kan flytte OH-gruppen
  eller kæden og prøve igen (bogens fremgangsmåde).
* Stjernen: en jagt uden Vis svaret og uden et forkert svar på et spørgsmål
  eller et kogepunkt. En forkert tegning og det samme stof tegnet igen koster
  intet, det er at prøve sig frem. Medaljen til sidst er guld med otte stjerner,
  sølv med seks eller syv, ellers bronze.
* Hylden er delt efter stofklasse (alkaner, alkener, alkoholer, ethere). Det
  afslører, hvor mange alkoholer og ethere der er, som bogens opgave B3.3.8 også
  gør. I Mesterjagten står hylden med tre kort i hver række.

## Sådan virker en jagt

1. **Tegn.** Den gule ramme på kortet viser formlen, og teksten siger, hvor
   mange stoffer den passer til. Eleven tegner
   én isomer og trykker Indsend svar (eller Enter). Tegningen bedømmes først nu:
   * en anden molekylformel: "Tegningen har fem carbonatomer, men C₄H₁₀O har fire."
   * det samme stof igen: "Det er butan-1-ol igen ...", og kortet på hylden ryster
   * en ether i jagten med kun alkoholer: den afvises med en forklaring
   * en ny isomer: den kommer på hylden
2. **Hvilken slags?** Har den nye en partner på hylden (se ovenfor), står de to
   på whiteboardet, og kortet spørger: kædeisomerer, stillingsisomerer eller
   funktionsisomerer? Svaret vælges og sendes ind. Et forkert svar giver en
   forklaring og kan ikke vælges igen. Det rigtige giver et grønt kort.
3. **Kogepunkterne.** Når alle er fundet, står de på whiteboardet i en blandet
   rækkefølge, der aldrig er facit. Eleven klikker dem i rækkefølge (1, 2, 3)
   eller vælger den, der koger højest, og trykker Indsend svar. Bagefter står de
   fra højeste til laveste kogepunkt med tallene, også på hylden.

Hjælpen (den gule knap): i tegnefasen bogens fremgangsmåde og så en beskrivelse
af den første isomer, der mangler; Vis svaret tegner den. Ved spørgsmålet bogens
hjælp til opgave B3.3.3 og et hint, der passer til parret. Ved kogepunkterne to
hint fra B3.2.

## Slags isomeri

Som bogens hjælp til opgave B3.3.3: er grupperne forskellige, er stofferne
funktionsisomerer. Er gruppen den samme, men carbonkæden forskellig, er de
kædeisomerer. Er både gruppen og kæden den samme, er de stillingsisomerer.
Carbonkæden er hele skelettet af carbonatomer, sammenlignet som træer
(`skelet` i `js/kemi.js`). Derfor er 2-methylbutan-1-ol og 3-methylbutan-1-ol
stillingsisomerer; kortet spørger ikke om det par.

## Kogepunkterne

Tabelværdier ved 1 atm, afrundet til hele grader. Dem, der også står i
`sb4.4`, er de samme (CRC Handbook og NIST): pentan 36, 2-methylbutan 28,
2,2-dimethylpropan 10, ethanol 78, dimethylether −25, propan-1-ol 97,
propan-2-ol 82, butan-1-ol 118, butan-2-ol 100, 2-methylpropan-2-ol 82,
pentan-1-ol 138, pentan-2-ol 119, 2-methylbutan-2-ol 102, diethylether 35 °C.
Resten er slået op 26. okt. 2026 (CRC-værdier citeret i PubChem og Wikidata,
NIST WebBook og Čenský m.fl., Fluid Phase Equilibria 2010):

| Stof | °C | Note |
|:--|--:|:--|
| ethylmethylether | 7 | CRC 7,4 |
| 2-methylpropan-1-ol | 108 | CRC 107,9 |
| methylpropylether | 39 | CRC 39,1 |
| 2-methoxypropan | 31 | CRC 30,8 |
| pentan-3-ol | 116 | CRC 116,2 (nyere målinger 115,5) |
| 2-methylbutan-1-ol | 128 | CRC 128 (nyere målinger 128,7 til 129) |
| 3-methylbutan-1-ol | 131 | CRC 131,1 |
| 3-methylbutan-2-ol | 112 | nyere målinger 111,9 (en CRC-udgave 113,5) |
| 2,2-dimethylpropan-1-ol | 113 | CRC 113,5 (nyere målinger 112,3) |
| hexan | 69 | CRC 68,7 |
| 2-methylpentan | 60 | CRC 60,3 |
| 3-methylpentan | 63 | CRC 63,3 |
| 2,2-dimethylbutan | 50 | CRC 49,7 |
| 2,3-dimethylbutan | 58 | CRC 57,9 |
| butylmethylether | 70 | CRC 70,2 |
| ethylpropylether | 63 | CRC 63,2 |
| 1-methoxy-2-methylpropan | 59 | CRC 58,6 |
| 2-methoxybutan | 59 | CRC 59,1 (andre kilder fra 57 til 75; CRC og Majer og Svoboda er enige) |
| 2-methoxy-2-methylpropan | 55 | CRC 55,1 |
| 2-ethoxypropan | 54 | CRC 54,1 |

Hexanerne og etherne er slået op samme dag i CRC-udgaver på Internet Archive,
PubChem og NIST. Alkenerne har ingen kogepunkter i animationen.

Kun rækkefølgen i de tre små jagter og den højeste i de store bedømmes, og de
afhænger ikke af usikkerheden. To ethere i Mesterjagten har begge 59 °C; det
gør intet, fordi kun den højeste bedømmes.

## Forenklinger

* Kun strukturisomeri: ingen ringe og ingen stereoisomeri. Butan-2-ol er ét
  stof her, selv om den findes i to spejlbilledformer, og cis- og
  trans-pent-2-en er ét stof (B3.4). Kun alkenjagten har en dobbeltbinding.
* Ethere navngives af motoren (dimethylether, ethylmethylether,
  methylpropylether, 2-methoxypropan). Bogen siger, at eleven ikke skal kunne
  navngive dem; navnene står kun på hylden og på whiteboardet.
* "Kugleformet" bruges om propan-2-ol og om alkoholer med OH-gruppen inde på
  kæden, som en kort forklaring på det lavere kogepunkt.

## Hvad man kan rette i

Alt indhold står i `js/data.js`: jagterne (`JAGTER`) med molekylformel, tekst,
strategi, hint, kogepunkter og en beskrivelse af hver isomer, og værktøjerne
(`VAERKTOEJ`). Selvtesten siger til, hvis en isomer mangler, er for meget, eller
får et andet navn af motoren. Teksterne til spørgsmålene og kogepunkterne laves i
`js/kemi.js`.

## Filer

```
index.html           siden, teorien og rundvisningen
css/stil.css         stilarket (fra sb3.1; det nye står nederst under SB3.3)
js/kerne.js          fælles hjælpefunktioner (som sb3.1)
js/data.js           jagterne, isomererne, værktøjerne og medaljen
js/kemi.js           molekylformlen, slags isomeri og teksterne til kortet
js/fane.js           scenekortet, hjælpeknappen, Indsend svar, musen og konfetti
js/sim_jagt.js       jagten: tavlen, spørgsmålet, kogepunkterne, hylden og listen
js/rundvisning.js    rundvisningen (som sb3.1, kun teksterne er nye)
js/app.js            opstart, teorien, tastatur og tegneløkken
_selvtest.html       udviklerværktøj
```

Fra `../../molekylemotor/js/` hentes molekyle, navngivning, smiles,
trivialnavne, layout, struktur, navnlaeser, tavle og tegnebraet. Motoren er
ikke ændret.

## Genveje og links

`Enter` indsend svar (eller kortets grønne knap), `R` ryd tavlen, `Ctrl+Z` og
`Ctrl+Y` fortryd og gentag, `H` eller `?` rundvisning, `T` teori, `Esc` luk.
En jagt vælges med `#`: `index.html#4`, `index.html#c4h10o` eller
`index.html#c5h12o-alle` (Mesterjagten). Uden `#`
begynder siden ved den første jagt, der ikke er klaret. Det fundne huskes i
browseren (`nk-sb3.3-jagter`), og "Begynd jagten forfra" under hylden tømmer
hylden.

## Selvtest

`_selvtest.html` åbnes gennem en lokal server med `animationer/` som rod. 127
påstande: hver jagt har præcis de isomerer, der findes (alle træer med jagtens
atomer bygges og navngives af motoren); motoren giver hver isomer navnet fra
data; slags isomeri passer med bogens facit til B3.3.3; kortet spørger kun om
par, der er forskellige på én måde; 1276 tekster er korte og uden tankestreger;
alle otte jagter kan løses med vendte og drejede tegninger; den gule ramme viser
formlen og atomerne, og de sænkede tal er `<sub>`; alkenjagten genkender cis og
trans og tæller dobbeltbindinger; det samme stof bliver
genkendt; forkerte tegninger, svar og rækkefølger får den rigtige forklaring;
Vis svaret virker og giver ingen stjerne; låsen virker; kortet dækker aldrig
whiteboardet fra 1100 × 620 til 1600 × 950; værktøjerne gør det, de skal.

## I menuen

Ikke endnu. Når brugeren siger til: en ny knap i
`kemi-b-filer/samling_b_bindinger_isomeri.html` (B3 Bindinger og isomeri) med
`../superanimationer/sb3.3_isomerjagten/index.html`, en ny `data-emne` (fx
`b3.isomerjagt`), navnet i `FEEDBACK_EMNER` i `samling_alt_b.html` og kolonnen
"I menuen" i `../README.md`. Kemibogen B kan linke til den fra boksen Prøv selv
i afsnit B3.3 (i stedet for eller ud over tegnebrættet).
