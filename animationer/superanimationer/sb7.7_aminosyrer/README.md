# sb7.7 Aminosyrer

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter kun
filer fra sin egen mappe og `../faelles/` og virker også, når den åbnes
direkte fra harddisken. Der er ingen Kemichael: al tekst står på det lyse
papirkort øverst i scenen, hjælpen er den gule knap på kortet, og intet
løses uden **Indsend svar**.

Den er bygget fra bunden; der var ingen animation om aminosyrerne i
B7-menuen før. Afsnittet i Kemibogen B er B7.7 Aminosyrer, derfor nummer 7.7.

**Pointen i én sætning:** En aminosyre har en sur og en basisk gruppe i samme
molekyle, så dens form og ladning afhænger af pH: i sur opløsning er den
syreform (+1), omkring neutral pH amfoion (0) og i basisk opløsning baseform
(−1), og ved det isoelektriske punkt midt mellem de to pKₛ-værdier er den
samlede ladning 0, så den ikke vandrer i et elektrisk felt.

## Bestillingen (10. november 2026)

I brainstormen til B7 den 9. november foreslog Claude "Aminosyren og pH": en
skyder flytter pH, og valin skifter mellem syreform, amfoion og baseform,
fordelingsdiagrammet tegnes samtidig, eleven gætter formen og trykker Indsend
svar, og glycin bruges ikke, fordi eleverne selv regner på den i forsøget.
Brugeren bad 10. november: "Du har tidligere haft en forslag om en animation
til aminosyrer, som passer til kemibogen. Den må du gerne begynde på nu."
Planen og valgene er Claudes, og brugeren har ikke set animationen endnu.

1. **Pointen:** som ovenfor.
2. **Afløser intet.** Bygget fra bunden. Formlerne er tegnet som bogens
   figurer `b7-amfoion` og `b7-aminosyrer-syv` (gruppen med hydronen rød,
   gruppen uden blå, sidekæden mørk), og diagrammet som
   `b7-aminosyre-fordeling` (syreform rød, amfoion grøn, baseform blå, pH 0
   til 14). Hydronen, der flytter, er orange som i bogens figurer af
   hydronoverførsler.
3. **Naboerne:** B7.7 ejer også sidekædernes fire grupper og L-formen; de er
   ikke med, ud over at asparaginsyre og lysin har en sur og en basisk
   sidekæde i fane 3. B7.8 ejer peptidbindingen og proteinerne. B6 ejer
   fordelingsdiagrammet for en syre og dens base. Glycin er ikke med: hans
   isoelektriske punkt er elevernes eget forsøg (holdt ude af bogen).
   Valins tal (p*K*ₛ 2,32 og 9,62, pH_iso 5,97) er bogens regneeksempel.
4. **Loftet:** tre faner, alle med valin. Fane 1: tre trin og ét molekyle.
   Fane 2: tre trin, 20 molekyler i et vindue og ét diagram. Fane 3: seks
   trin (fra 12. nov. 2026 med formerne først i stedet for et gæt og to
   trin med to ukendte), tre aminosyrer (asparaginsyre, valin, lysin) og
   derefter to ukendte (X og Y) på ét stykke papir
   mellem to poler.
5. **Layoutet:** scene plus panel som sb7.3. Scenen er papirkortet øverst og
   et whiteboard under det med en pH-skyder nederst.

Stop-listen er overholdt: ingen flasker, man hælder med, intet stativ, ingen
uheld og ingen oprydning. Saltsyren og natriumhydroxiden i fane 1 kommer som
en oxoniumion og en hydroxidion på tavlen.

## Fanerne

**1 Tre former** (`js/sim_former.js`). Valin står som den uladede formel
H₂N−CH−COOH med hydronen i −COOH i orange. (1) Eleven trækker hydronen over
til −NH₂ (slippes den et andet sted, glider den tilbage), og amfoionen
⁺H₃N−CH−COO⁻ dannes; spørgsmålet er den samlede ladning (0), og først nu
står formen og ladningen under formlen. (2) Saltsyre, pH falder til 1: eleven
klikker på den gruppe, der optager en hydron (−COO⁻), og trykker Indsend svar;
en oxoniumion kommer ind og afleverer hydronen, og den bliver til vand. (3)
Natriumhydroxid: først tager en hydroxidion hydronen fra −COOH (pH 1 til 7),
så klikker eleven på den gruppe, der afgiver en hydron, når pH stiger til 13
(−NH₃⁺). Skyderen er låst, til de tre trin er løst; bagefter skifter valin
form efter skyderen, og en hydron kommer eller går.

**2 Fordelingsdiagrammet** (`js/sim_fordeling.js`). Et vindue med 20
valinmolekyler (pille med + for −NH₃⁺ og − for −COO⁻, kanten i formens farve)
og bogens fordelingsdiagram, der kun tegnes, hvor skyderen har været. (1) Træk
skyderen fra pH 0 til 14 (95 % af skalaen). Skyderen begynder ved pH 0, og
knappen glider højst 4 pH pr. sekund hen mod musen, så diagrammet tegnes
roligt; når det er tegnet, bliver kortet stående med Næste trin (brugeren
12. nov. 2026: "Når man laver diagrammet går det for hurtigt... og den starter
ikke ved 0, men ved 7"). I trin 2 og 3 følger skyderen musen direkte. (2) Stil skyderen, hvor der er
lige meget syreform og amfoion (2,32 ± 0,25), og tryk Indsend svar; et
forkert sted får andelene i procent. Krydspunkterne med pKₛ 2,32 og 9,62
kommer på diagrammet. (3) Skriv pHᵢₛₒ i feltet på kortet (5,97); summen
11,94, forskellen 7,30 og et for groft tal har hver sin forklaring. Bagefter
glider skyderen til 5,97, og linjen ved det isoelektriske punkt kommer.

**3 Det elektriske felt** (`js/sim_felt.js`). Tre kort med asparaginsyre,
valin og lysin øverst og et fugtet papir mellem minuspol og pluspol. Eleven
finder formerne, før der skal forudsiges noget (brugeren 12. nov. 2026: "Fane 3
er for svær. Det ville være bedre, hvis man først blev stilladseret om hvilke
former de er på inden man skal forudsige hvilken der ryger til minuspolen";
før var trin 1 et gæt). (1) Formerne ved pH 6: formlerne står uladede som i
bogen, kortet giver reglen (carboxylgrupper har afgivet deres hydron,
aminogrupper har optaget en), og eleven klikker på grupperne, så formlerne
passer; et klik giver eller tager en hydron, og den første gruppe, der ikke
passer, får sin egen forklaring. Bagefter står ladningerne −1, 0 og +1. (2)
Hvilken vandrer mod minuspolen? (3) Slut strømmen og se, om det passer; kortet
bliver stående. (4) Ved hvilken pH vandrer alle tre mod minuspolen? Efter
pH 1 kører forsøget igen, og lysin (+2) vandrer længst.
(5) To ukendte aminosyrer, X og Y, med ? for enden af sidekæden vandrer ved
pH 6: X mod pluspolen og Y mod minuspolen; kortet bliver stående. (6) Eleven
klikker på ?, som skifter mellem −CH₃, −OH, −COOH og −NH₂, til grupperne passer
med forsøget, og bruger dermed metoden fra trin 1 baglæns (brugeren 12. nov.
2026: "måske med en ukendt opgave.. hvor man skal bruge metoden til at løse en
struktur. Det skal gerne være lidt forsimplet"). Et forkert valg får at vide,
hvad gruppen ville give (ladning 0 og blive liggende, eller den modsatte pol).
Rigtigt er −COOH i X (glutaminsyre) og −NH₂ i Y (lysin), og navnene og
ladningerne kommer frem. Bagefter er skyderen fri, og X og Y vandrer igen, når
eleven slipper den.

## Filerne

```
index.html          siden, teorien og rundvisningen
css/stil.css        kopieret fra sb7.3; det nye står nederst under SB7.7
js/kerne.js         fælles hjælpere (som sb7.3)
js/data.js          opgaverne, teksterne, aminosyrernes pKₛ-værdier og modellen
                    (andele, ladning, formen ved en pH)
js/molekyle.js      en aminosyre som formel i bogens stil med gløden om de ladede grupper
js/tegning.js       tavlen, rammerne, skiltet, pH-skyderen, hydronen, H₃O⁺, OH⁻ og H₂O,
                    pillerne og vinduet
js/fane.js          scenekortet, hjælpeknappen, Indsend svar, musen og konfettien (som sb7.3)
js/sim_former.js    fane 1
js/sim_fordeling.js fane 2
js/sim_felt.js      fane 3
js/rundvisning.js   rundvisningen (kun TURE er ny)
js/app.js           faneskift, teorien med valins tre former, tastatur og tegneløkken
_selvtest.html      selvtesten (kræver en lokal server)
_skud.html          skærmbilleder af bestemte trin (udviklerværktøj, kræver en lokal server)
```

## Det, man kan rette i

* **Opgaverne og teksterne:** `D.FORMER`, `D.FORDELING` og `D.FELT` i
  `js/data.js`.
* **Tallene:** `D.AMINOSYRER` (pKₛ for hver gruppe), `D.ANTAL_MOL`,
  `D.DAEKNING` og `D.VANDRING` i `js/data.js`.
* **Tiderne:** `IND`, `FLYT` og `UD` øverst i `js/sim_former.js` (reaktionen
  med oxoniumionen og hydroxidionen) og `KOER` i `js/sim_felt.js`.

## Forenklinger

* Den uladede formel H₂N−CH−COOH i fane 1 findes næsten ikke i vand; den er
  med, fordi bogen viser, at aminosyren reagerer med sig selv. Hydronen
  flytter direkte i samme molekyle.
* Formen i fane 1 og på kortene i fane 3 er den, der er mest af ved pH
  (hver gruppe har sin hydron, når pH er under gruppens pKₛ). Vinduet i fane
  2 viser fordelingen, så længe den kan ses med 20 molekyler.
* Fane 3: en plet flytter sig lige langt for hver ladning (gennemsnittet ved
  pH), og molekylets størrelse er ikke med. Ordet elektroforese bruges ikke;
  papiret er "fugtet med en opløsning med pH 6". I et rigtigt forsøg skal
  pletterne farves for at kunne ses.
* pH-skyderen går fra 0 til 14 som bogens fordelingsdiagram.
* De ukendte i fane 3: gruppen for enden af sidekæden vælges blandt fire
  (−CH₃, −OH, −COOH og −NH₂), og antallet af CH₂-grupper er givet. −CH₃ og −OH
  giver begge ladningen 0, så forsøget ved pH 6 kan kun skelne de ladede
  grupper fra hinanden; derfor vandrer begge ukendte.

## Tal skrevet efter hukommelsen

Valins pKₛ-værdier (2,32 og 9,62) og pHᵢₛₒ = 5,97 er bogens. Asparaginsyres
(1,88, 9,60 og 3,65 for sidekæden) og lysins (2,18, 8,95 og 10,53 for
sidekæden) og glutaminsyres (2,19, 9,67 og 4,25 for sidekæden) pKₛ-værdier er
skrevet efter hukommelsen fra en almindelig tabel (Lehninger). Kun deres
fortegn og hele ladninger ved pH 1, 6 og 13 bruges i opgaverne.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med mappen `animationer/`
som rod. Den tjekker modellen mod bogen (valins pKₛ og pHᵢₛₒ, lige meget af to
former ved pH = pKₛ, 10 og 10 af 20 molekyler ved pKₛ, ladningerne af de tre
aminosyrer ved pH 1, 6 og 13), at alle tre faner kan gennemføres (også trækket
med hydronen og den frie skyder), at forkerte svar får den rigtige forklaring
og koster stjernen, at intet løses uden Indsend svar, at skyderen er låst, til
fanen er løst, at en positiv aminosyre vandrer mod minuspolen, at teksterne er
korte og uden tankestreger og ASCII-dansk, at glycin ikke er med, og at kortet
aldrig dækker tavlen fra 1100 × 620 til 1600 × 950. 12. nov. 2026: ALT OK (100).
Trækket, svarene og skyderen er også prøvet med rigtige musehændelser i
headless Chrome.

## I menuen

I menuen fra 12. nov. 2026 (brugeren: "Når du er færdig med dette, må du gerne
lægge den på animationspanelet"): knap nr. 3 i `kemi-b-filer/samling_b7.html`
med koden `b7.7`, også i `FEEDBACK_EMNER`, og B7-beskrivelsen i
`samling_alt_b.html` og `animationer.html` nævner aminosyrerne. `index.html`
har linjen til `../../til_panelet.js` med `data-emne="b7.7"`. Kemibogen B
(B7.7) har endnu ingen Prøv selv-linje.

## Papirkortet

Kortet er det lyse papirkort fra start (se Fælles krav i `../README.md`):
`../faelles/papirkort.css` og `../faelles/papirkort.js` er indlæst, og
`<body class="papirkort">`. Efter et rigtigt svar bliver kortet på
spørgsmålet med forklaringen under svarene, og Næste står, hvor Indsend svar
stod. Kortets grønne knap går altid fremad; Begynd forfra står i panelet.
