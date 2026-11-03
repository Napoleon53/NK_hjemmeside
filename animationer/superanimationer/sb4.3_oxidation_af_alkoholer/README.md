# sb4.3 Oxidation af alkoholer

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter
molekylemotoren fra `../../molekylemotor/` (molekylet, navngivningen,
navnelæseren, tegningen og tavlen) og virker også, når den åbnes direkte fra
harddisken. Der er ingen Kemichael: al tekst står på ét kort øverst i scenen,
hjælpen er den gule knap på kortet, og intet løses uden **Indsend svar**.

Den afløser `animationer/kemi-b-filer/b5.3_oxidation_alkohol_til_syre.html`
(B4 knap 4, koden `b5oxid`). Nummeret er afsnittets i Kemibogen B: B4.3
Aldehyder og ketoner, hvor oxidationen af alkoholer står.

**Pointen i én sætning:** Ved en oxidation mister carbonatomet med OH-gruppen
et hydrogenatom, så dets oxidationstal stiger med 2, og antallet af
hydrogenatomer på det carbonatom afgør, hvor mange gange alkoholen kan
oxideres.

## Bestillingen (3. november 2026)

Brugeren spurgte, om B4-animationerne var de nyeste, fordi de så slidte ud.
Tre af dem var gamle enkeltfiler. På spørgsmålet, om de skulle laves om til
superanimationer, svarede brugeren: "Ja. Lav gerne oxidation af alkoholer."

1. **Pointen:** som ovenfor.
2. **Afløser b5.3.** Med fra den gamle: ethanol → ethanal → ethansyre med
   samme carbonskelet hele vejen, oxidationstallet som romertal udledt af
   elektronegativiteten i hver binding (ikke skrevet ind), elektronparrene i
   bindingerne, der rykker over til det mest elektronegative atom, prikkerne
   i farven fra det atom, elektronen kom fra, og elektronegativiteten ved
   atomerne. To af den gamles fire kontakter er slået sammen: prikkerne har
   altid ophavets farve. Nyt: eleven finder selv oxidationstallet og klikker
   på det hydrogenatom, oxidationsmidlet tager; propan-2-ol og
   2-methylpropan-2-ol viser de to andre typer; fane 2 med ti alkoholer.
3. **Naboerne:** `sc8.2_oxidationstal` ejer oxidationstal i almindelighed
   (reglerne og elektronparrene i uorganiske stoffer); her er det kun
   carbonatomet med OH-gruppen. `sc8.4` og `sc8.5` ejer afstemningen og
   permanganatens farver; dichromatets farveskift er her kun et tegn på, at
   der skete noget. `b5.1` (DNPH/Tollens) ejer påvisningen af aldehyder og
   ketoner. `sb4.5_organisk_syntese` ejer syntesen, hvor oxidationen er et
   redskab. `sb4.8_organiske_navne` ejer navnene; her giver motoren navnet.
4. **Loftet:** to faner. Fane 1: tre alkoholer og seks stoffer i alt, ét
   molekyle ad gangen. Fane 2: ti alkoholer med fire svar hver.
5. **Layoutet:** scene plus panel. Scenen er scenekortet øverst og et
   whiteboard under det.

## Fanerne

**1 Oxidationstallet** (`js/sim_oxtal.js`). Strukturformlen med alle H som i
bogens figur b4-oxidationstal. Hvert trin har to spørgsmål: oxidationstallet
for det markerede carbonatom (syv romertal på kortet) og det hydrogenatom,
oxidationsmidlet tager (klik i formlen, eller "Carbonatomet har intet
hydrogenatom"). Så oxideres molekylet: ved en OH-gruppe forsvinder også
OH-gruppens H, og C−O bliver til C=O; ved C=O kommer et O ind mellem C og H.
Serien slutter, når carbonatomet ikke har flere H. Panelet har de tre
alkoholer, trappen fra +III til −III, hvor hvert stof kommer op ud for sit
oxidationstal, og kontakterne Elektronparrene og Elektronegativitet. Det
første hint slår elektronparrene til.

**2 Hvad dannes?** (`js/sim_produkt.js`). Ti alkoholer som zigzagformler.
Først typen (primær, sekundær, tertiær), så produktet: fire formler nederst
på tavlen i fast rækkefølge (aldehyd, keton, carboxylsyre, Ingen reaktion),
alle med alkoholens carbonskelet. Primære alkoholer oxideres mildt eller
kraftigt (står på kortet og under pilen). Glasset med dichromat skifter fra
orange til grønt, når der sker en oxidation. Tabellen Det har du fundet i
panelet fyldes ud, når eleven har løst en opgave af hver slags.

## Filerne

```
index.html          siden, teorien og rundvisningen
css/stil.css        kopieret fra sb3.3; det nye står nederst under SB4.3
js/kerne.js         fælles hjælpere (som sb3.3)
js/data.js          elektronegativiteten, alkoholerne på fane 1 (atomerne
                    og deres placering), opgaverne på fane 2 og teksterne
js/kemi.js          modellen: oxidationstallet, oxidationen, typen og
                    produktet, og forklaringerne til forkerte svar
js/fane.js          scenekortet, hjælpeknappen, Indsend svar, musen og
                    konfettien (fra sb3.3, med to faner)
js/sim_oxtal.js     fane 1
js/sim_produkt.js   fane 2
js/rundvisning.js   rundvisningen (kun TURE er ny)
js/app.js           faneskift, tastatur og tegneløkken
sprites/            reagensglasset med orange og grønt dichromat
_selvtest.html      selvtesten (kræver en lokal server, se nedenfor)
```

## Det, man kan rette i

* **En ny alkohol på fane 2:** en linje i `D.OPGAVER` i `js/data.js` med
  alkoholens navn, mild eller kraftig (kun primære), niveauet og de fire svar
  i rækkefølgen aldehyd, keton, carboxylsyre, null. Selvtesten tjekker, at
  modellen giver svaret, og at motoren navngiver alle fire.
* **En ny serie på fane 1:** atomerne med placering og bindingerne i
  `D.SERIER`. Bindinger til H er 0,62 lange som i motorens strukturformel.
* **Elektronegativiteten:** `D.EN` (H 2,1, C 2,5, O 3,5 som i sc8.2).

## Forenklinger

* Oxidationen af aldehydet tegnes, som om et O sættes ind mellem C og H.
  Det er bogens billede ("mister et hydrogenatom og får en binding mere til
  oxygen"), ikke mekanismen.
* Oxidationsmidlet tegnes ikke som molekyler. Dichromatet er kun et glas,
  der skifter farve, og det sker kun på fane 2.
* Methanol er ikke med. Methansyre har stadig et H på carbonatomet og kan
  oxideres videre til carbondioxid, og det ligger uden for bogen.
* Ingen ringe og ingen phenoler.
* Mild oxidation betyder, at aldehydet destilleres fra (bogens tekst). Ved en
  sekundær alkohol gør det ingen forskel, så der står intet om måden.

## Det, der var mine valg (ikke brugerens)

* To faner, og at fane 1 har tre alkoholer (én af hver type), så bogens to
  dele af afsnittet (oxidationstal og typer) hænger sammen.
* At eleven klikker på hydrogenatomet, frem for at trykke på en knap
  "Oxidér": det er det, bogen siger sker.
* De ti alkoholer på fane 2, deres niveauer og de forkerte svar.
* Reagensglasset med dichromat på fane 2 (ét glas uden flasker og uden
  hældning, så det ikke er et forsøg).

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med mappen `animationer/`
som rod (motoren hentes fra `../../molekylemotor/`). Den tjekker modellen mod
bogens tal, at motoren navngiver alle svar, at begge faner kan gennemføres,
at forkerte svar får den rigtige forklaring og koster stjernen, at intet
løses uden Indsend svar, at teksterne er uden tankestreger og ASCII-dansk, og
at kortet aldrig dækker whiteboardet fra 1100 × 620 til 1600 × 950.
3. nov. 2026: ALT OK (72).

## I menuen

Ikke endnu. Når brugeren siger til: knappen "Oxidation af alkohol" (nr. 4,
koden `b5oxid`) i `kemi-b-filer/samling_b4,5,6.html` skal pege på
`../superanimationer/sb4.3_oxidation_af_alkoholer/index.html`, beskrivelsen
rettes, den gamle `b5.3_oxidation_alkohol_til_syre.html` flyttes til
`kemi-c-filer/arkiv/` med `_oldversion`, og kolonnen "I menuen" i
`../README.md` rettes. Koden og navnet i `FEEDBACK_EMNER` kan blive.
