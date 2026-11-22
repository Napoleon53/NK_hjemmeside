# sc4.5 Byg et fedtstof

Superanimation om fedtstoffer: dobbeltbindinger giver knæk i fedtsyrerne, så
molekylerne ikke kan pakke tæt, og derfor er umættet fedt flydende og mættet
fedt fast. Åbn `index.html`. Mappen henter kun filer inde fra sig selv,
bortset fra Kemichael (`../../v2/kemichael/kemichael.js`). Ingen `fetch` og
ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** dobbeltbindinger giver knæk i fedtsyrerne. Så kan
   fedtmolekylerne ikke pakke tæt, og derfor er umættet fedt flydende og
   mættet fedt fast.
2. **Afløser** `kemi-c-filer/c4.6_typer_fedtstof.html` (Fedt-Fabrikken). Med
   fra den gamle: at man trækker fedtsyrer hen på glycerols OH-grupper, at
   der dannes vand ved hver binding, de fire fedtsyrer (stearin-, olie-,
   linol- og linolensyre) med hver sin farve og sine knæk, kunderne med
   ordrer og fri leg bagefter, esterbindingen med eksemplet ethansyre +
   methanol (nu i teorien).
3. **Naboerne:** `c4.7` ejer bromvand og additionsreaktioner (også
   hærdning), `c4.9` fedt i chips, `sc4.1` kogepunkt og berøring for
   alkaner, `sc4.2` zigzagformler og `c4.5` polaritet. Her bruges
   zigzagformlen kun til at vise fedtsyrerne.
4. **Loftet:** 2 faner, 4 fedtsyrer, 20 mulige fedtstoffer, 5 fedtstoffer fra
   køkkenet plus det, eleven har bygget, 4 steder i køkkenet og 10 molekyler
   i zoomvinduet.
5. **Layoutet:** scene plus panel, som i de andre superanimationer.

Brugeren valgte to faner (Fabrikken og Køleskabet, ikke en tredje med
varedeklarationer) og det harske smør som påskeæg (24. sept. 2026).

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Fabrikken | trækker tre fedtsyrer hen på glycerol og leverer fem ordrer (fast i solen, flydende i køleskabet osv.) | rette kæder giver et højt smeltepunkt, knæk et lavt |
| 2 | Fast eller flydende? (før Køleskabet) | gætter, om et fedtstof er fast, delvist fast eller flydende et sted i køkkenet, og trækker selv glasset derhen | lige kæder ligger stille i rækker, kæder med knæk kan ikke |

**Fabrikken.** Glycerol står på arbejdsbordet med tre OH-grupper (CH₂, CH,
CH₂ skrevet ud, fedtsyrerne som zigzagformler med 18 C-atomer). Nederst
ligger fire fliser med fedtsyrerne. En flise trækkes hen på en OH-gruppe (et
klik sætter den på den første ledige), og fedtsyrens OH og glycerolens H
bliver til et vandmolekyle, der svæver væk. Et klik på en kæde tager den af
igen (vand spalter bindingen), og en fedtsyre, der slippes på en optaget
plads, bytter den ud. Papirkortet øverst i scenen viser kunden, og panelet kortet "Dit fedtstof":
smeltepunktet og om fedtet er fast, delvist fast eller flydende i fryseren
(−18 °C), køleskabet (5 °C), på køkkenbordet (20 °C) og i solen (35 °C).
Rækkerne, kunden stiller krav til, bliver grønne eller røde. Ordren bedømmes,
når eleven trykker Indsend svar; et forkert fedt giver et råd, der passer
til fejlen ("Brug flere rette kæder"). Giv hint, Vis svaret (bygger
løsningen), og efter et rigtigt svar Næste ordre. Under kortene står knappen Start forfra (samme som
<kbd>R</kbd>): ordre 1 igen og en tom glycerol. De fem kunder: Fuglehuset (fast i solen),
Salatbaren (flydende i køleskabet), Restauranten (flydende på bordet, stivner
i køleskabet), Chokoladefabrikken (fast på bordet, smelter i solen) og
Apoteket (omega-3, flydende i fryseren). Derefter fri leg, og knappen går
videre til køkkenet. Det byggede fedt
står i glasset til højre og følger med til fane 2.

**Køleskabet** (beskrivelsen før runde T10; se "Runde T10" nedenfor for det, der gælder nu). Et køkken med køleskab og fryser til venstre, køkkenbordet
og et vindue med sol og vindueskarm. På bordet står glas med smør,
kakaosmør, olivenolie, solsikkeolie, hørfrøolie og elevens eget fedt.
Et glas trækkes hen et andet sted (to pladser i fryseren, køleskabet og
vindueskarmen; er der fuldt, bytter glassene). Fedtet stivner eller smelter
i løbet af et sekund: flydende fedt holder overfladen vandret, når glasset
vippes, fast fedt følger glasset, og delvist fast fedt er uklart med
krystaller i bunden. Zoomvinduet viser molekylerne i det valgte glas: hver
kæde i fedtsyrens farve, de faste i rækker nedefra (glycerol udad, kæderne
ind mod midten), de flydende i bevægelse over dem. Panelet har opgaven og
varedeklarationen (mættede, mono- og polyumættede fedtsyrer i procent).
Seks opgaver: gæt fast, delvist fast eller flydende, så flytter glasset
derhen, og svaret forklares. Sætter eleven selv glasset det rigtige sted,
tæller det også. Til sidst: hvorfor er smør fast i køleskabet, når
solsikkeolie er flydende? De forkerte svar er de typiske fejl (smør kommer
fra dyr, smørrets molekyler er tungere, bindingerne inde i olien er
svagere). Bagefter går knappen videre til fabrikken ("Byg dit eget fedt"),
så den samme runde ikke starter igen; <kbd>R</kbd> starter forfra.

**Det harske smør** (påskeæg, fane 2). Står smørret 12 sekunder i solen, går
der tre uger: vand spalter noget af fedtet, der dannes smørsyre (grønne
stanklinjer, frie fedtsyrer og smørsyre i zoomvinduet), og Kemichael kommer:
"Smørret er blevet harskt, og der er dannet smørsyre. Nu lugter køkkenet af
surströmming." Han sætter nyt smør på bordet ("Det nye smør hører til i
køleskabet.") og går. De næste gange siger han en af `D.HARSK_IGEN`. Det tæller
i hans regnskab over uheld. Præsentationen nævner ikke påskeægget.

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation.
Præsentationen er den fælles fra 4. nov. 2026 (`../kemichael/praesentation.js`,
reglerne i `../kemichael/README.md`): tre trin pr. fane med to til fire hele
sætninger, en taleboble med Næste og Spring præsentationen over, og en gul
ramme om det, han peger på. Han går aldrig videre af sig selv. <kbd>K</kbd>
viser præsentationen igen. Under præsentationen står han mellem
fedtsyrernes ender og glasset på fane 1 og foran køleskabet på fane 2, og han
går lidt raskere ind. På fane 1 står han altid bag bordet: bordkanten og
fliserne tegnes oven på ham, så fedtsyrerne ikke er skjult bag hans ben.

Ellers kommer han kun ind af sig selv, når en hel fane er klaret (begge kun
første gang i browseren), og ved det harske smør:

* fane 1, alle fem ordrer er leveret: "Du har leveret alle fem ordrer, og
  fabrikken kører som smurt."
* fane 2, hvorfor er besvaret: "Du har bedre styr på køkkenet, end jeg har."

Under præsentationen venter rosen, til han er færdig, og det harske smør
bliver skiftet uden ham. Kaffekoppen på fane 1 er det fælles påskeæg.

### Papirkortet (6. nov. 2026)

Begge faner har ét lyst papirkort øverst i midten af scenen (`js/kort.js`,
kopi af sc5.6's med en notelinje, og `../faelles/papirkort.css/js`).
Opgavekortene i panelet og statuslinjen nederst er fjernet. Kortet har
etiketten ("Ordre 2 af 5", "Opgave 3 af 7"), ordren eller spørgsmålet,
svarene, en kort linje med næste skridt eller en besked fra scenen, hint
(gul kant: Giv hint, Vis svaret), beskeden ved et forkert svar og Indsend svar
(grå, til der er noget at sende).

* Fabrikken: tre fedtsyrer på glycerol bedømmes ikke længere af sig selv.
  Indsend svar sender fedtet; et forkert fedt får "Ikke endnu" og rådet.
  Vis svaret bygger løsningen og leverer den (gul). Efter et rigtigt svar
  bliver kortet på ordren med rosen, og Næste ordre står, hvor Indsend svar
  stod. Panelet har Ordrer (fremskridtet), Dit fedtstof og Start forfra.
* Køleskabet: svarene (fast, delvist fast, flydende og de fire på hvorfor)
  vælger kun; Indsend svar sender. Glasset kan stadig sættes det rigtige
  sted, og det tæller som svar. Et forkert gæt giver forklaringen i en rød
  boks, et rigtigt i en grøn, og Næste opgave står samme sted. Panelet har
  varedeklarationen og en ny knap Start forfra (samme som R).
* Tegningen begynder under kortets plads (`D.ZONE` i `js/data.js`):
  molekylet på fane 1, køleskabet, vinduet og zoomvinduet på fane 2. Tilbuddet
  om præsentationen står nederst i scenen. På en smal skærm er scenen højere.
* Præsentationen og rundvisningen peger på `#fabrik-skort`, `#koele-skort`,
  `#fabrik-ordrer` og `#koele-forfra`.

Molekylenavnene: animationen nævner ingen stoffer som O₂, H₂ eller N₂, så der
var intet at rette (6. nov. 2026).

Direkte link: `index.html#koele`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>T</kbd> teori · <kbd>H</kbd>
rundvisning · <kbd>K</kbd> Kemichaels præsentation · <kbd>P</kbd> pause i
zoomvinduet · <kbd>R</kbd> forfra · <kbd>Enter</kbd> næste · <kbd>Esc</kbd>
luk eller send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Rigtig kemi i smeltepunkterne.** Den gamle lod antallet af
  dobbeltbindinger (0-9) vælge et produkt og kaldte fx 4-5 dobbeltbindinger
  for olivenolie; olivenolie har ca. 3 pr. molekyle. Nu har hvert fedtstof et
  smeltepunkt (målt eller regnet, se forenklingerne), og det afgør, hvor det
  er fast.
* **Kunderne stiller krav om steder**, ikke om antal dobbeltbindinger:
  fast i solen, flydende i køleskabet. Så hænger fane 1 sammen med fane 2.
* **Rigtige zigzagformler.** Den gamle tegnede 12 led med knæk, der skiftede
  retning. Nu har kæderne 18 C-atomer, 120° mellem bindingerne og en cis-
  dobbeltbinding med begge naboer på samme side, så kæden bøjer 30° pr.
  dobbeltbinding.
* **Vandet kommer fra de rigtige atomer**: syrens OH og alkoholens H. Og
  bindingen kan spaltes igen.
* **Fane 2 er ny**: molekylerne i fast og flydende fedt, rigtige fedtstoffer
  fra køkkenet, varedeklarationen og gættene.
* Den gamle modal med lange forklaringer er væk; beskeden står i panelet.

## Runde T10: fane 2 efter regelsættet (22. nov. 2026)

Niels sagde ja til forslaget ("Det lyder godt. Du cooker bare :)"). Reglerne
står i `../REGELSAET.md`; numrene nedenfor henviser dertil.

* **Fanen hedder "Fast eller flydende?"** som overskriften i Kemibogen C 4.6
  (regel 46). `#koele` virker stadig.
* **Intet panel** (regel 2-3). Syv opgaver står i en række øverst med
  "↺ Start forfra" og "Fri leg" yderst til højre (regel 57). Titlerne låses op
  i takt (regel 17). Er der ikke plads til alle syv titler, står kun den åbne
  opgave med titel, og de andre har nummeret (titlen står ved musen).
  Kortet står under rækken med en fast plads (regel 4): `D.ZONE.koele` er
  198 px (168 px på en lav skærm), målt som det højeste kort i alle trin.
* **Opgaverne** står i `D.OPG_KOELE` i `js/data.js`, motoren i
  `js/koele_opgaver.js` (kopi af sc4.1's `varm_opgaver.js` fra T9) med
  trintyperne valg og handling (går selv videre ca. 1 s efter, at glasset
  står på stedet, regel 33). Rækkefølgen:
  1. Smør i køleskabet: gæt, træk smørret ind i køleskabet, hvordan ligger
     molekylerne nederst i vinduet, og hvilken form har kæderne i rækkerne.
     Først nu kommer varedeklarationen frem.
  2. Smør på bordet: gæt, og træk smørret ud på bordet.
  3. Olivenolie: hvor mange dobbeltbindinger har en monoumættet fedtsyre,
     gæt i køleskabet, og træk olien derind.
  4. Solsikkeolie: hvilken slags fedtsyrer er der flest af (varedeklarationen),
     gæt i køleskabet, og træk olien derind.
  5. Hørfrøolie i fryseren: hvor mange knæk har linolensyre, gæt, og træk.
  6. Kakaosmør i solen: hvilken slags fedtsyrer er der flest af, gæt, og træk.
  7. Smør mod olie: hvorfor er smør fast i køleskabet, når solsikkeolie er
     flydende? Tre svar, der kan tjekkes i scenen (regel 54): "Smørrets kæder
     er lige og kan pakke tæt", "Smør har flere dobbeltbindinger"
     (varedeklarationen viser det modsatte) og "Smør kommer fra dyr"
     (kakaosmør kommer fra en plante og er også fast). Det gamle forkerte svar
     "Bindingerne i oliens molekyler er svagere" er væk, fordi det er den
     svage elevs måde at sige det rigtige på.
  Bagefter fri leg med alle glas og Dit fedtstof, og knappen går til fabrikken.
* **Glassene kommer på bordet ét ad gangen** (regel 13): smør i opgave 1,
  olivenolie i 3, solsikkeolie i 4, hørfrøolie i 5 og kakaosmør i 6. Hvert glas
  har en fast plads på bordet (`D.BORD_ORDEN`).
* **Svaret står ikke fremme, før eleven har svaret** (regel 38): Vinduet med
  molekylerne og varedeklarationen er stiplede pladser under det første gæt.
  Linjen "Gæt på kortet, eller sæt smør i køleskabet og se selv" er væk, og
  glassene kan ikke trækkes under et spørgsmål (et greb får kortet til at
  blinke, regel 15, 19a).
* **Handlingen** (regel 19-21): Glasset har gul ramme og en boble ("Træk: til
  køleskabet"), og stedet lyser gult. Glasset kan kun sættes på opgavens sted;
  ellers glider det tilbage, og boblen kommer igen.
* **Varedeklarationen** står på et lyst ark ved siden af vinduet (regel 29, 55)
  med en lille kæde i fedtsyrens farve foran hver slags: lilla og lige for
  mættede, grøn med ét knæk for monoumættede, blå og orange med knæk for
  polyumættede. Den er dermed også forklaringen af farverne, og linjen med
  stearinsyre, oliesyre osv. under vinduet er væk (regel 24, 45).
* **Roligere vindue** (regel 26, 56): 8 molekyler i stedet for 10, halv fart,
  og de flydende skubber mere til hinanden, så de ikke ligger oven i
  hinanden (`skub`, `skubX`, `skubY` på `NK.Proeve`; fane 1 er uændret ud
  over farten).
* **Samlet scene** (regel 32): På en skærm bredere end 1560 px står køleskab,
  vindue og bord samlet i midten.
* **Lige kæder** som i Kemibogen C 4.6 i stedet for "rette kæder", også på
  fane 1 (regel 10). Rettelserne står i
  `../../../.claude/spoergsmaal-og-start/ret/t10.json`.
* **Teorien** er et kort, lyst ark (`../faelles/teori.css`, regel 31) med
  esterbindingen, en tabel over de fire fedtsyrer og en henvisning til C 4.6.
* Tilbuddet om Kemichaels præsentation er væk på fane 2 (K viser den
  stadig). Han roser første gang alle syv opgaver er løst. Det harske smør
  kan kun ske i den fri leg.
* **Selvtesten** går de syv opgaver igennem med musen (greb under et
  spørgsmål, forkert sted, rigtigt sted), forkerte svar, hinttrappen, Vis
  svaret på et spørgsmål og en handling, fri leg og tilbage, og at glassene
  kommer frem ét ad gangen. Layoutet af fane 2 testes fra 860 px (smallere er
  der ikke plads til vinduet ved siden af køleskabet uden panel). Sidst kørt
  22. nov. 2026: ALT OK.

Fane 1 (Fabrikken) er ikke bygget om; den har stadig panel og tilbuddet om
præsentationen.

## Runde T10b: færre spørgsmål og en tydeligere figur (22. nov. 2026)

Niels: "nu er der pludselig mange spørgsmål.. og måske er 3 fedstoffer nok.
Måske skip hørfrø?" og om vinduet: "maks der skal være 3 farver, og måske
skal de tegnes på en anden måde... lige nu er det en lidt uoverskuelig suppe.
Måske skal feltet med mikrotegningen også være større ... og det må måske
gerne være lidt mere fortegnet, så det er tydeligt."

* **Fire opgaver med tre fedtstoffer** i stedet for syv med fem: smør,
  olivenolie og solsikkeolie, én for hver slags fedtsyre og farve, og alle
  tre i køleskabet, så de kan sammenlignes ved samme temperatur: smør er
  fast, olivenolie delvist fast og solsikkeolie flydende. 1. Smør i
  køleskabet (gæt, træk, hvordan ligger molekylerne nederst), 2. Olivenolie
  (gæt, træk), 3. Solsikkeolie (gæt, træk), 4. Smør mod olie (hvorfor). Før
  var der 19 trin, nu otte. Smør på bordet, hørfrøolie og kakaosmør er ude af
  opgaverne; kakaosmør og hørfrøolie står kun i den fri leg. Køleskabet har
  plads til tre glas.
* **Hvorfor-svarene** er korte og kan tjekkes i scenen (regel 54):
  "Smørrets kæder er lige", "Smørret har flere knæk" og "Smørret er
  koldere" (begge glas står i køleskabet ved 5 °C).
* **Den fortegnede figur** (`F.stilForm` i `js/fedt.js`, `tegnStil` i
  `js/tegning.js`): glycerol er et lille lyst hoved, og hver fedtsyre er en
  tyk, glat hale uden zigzag. Hver dobbeltbinding giver et overdrevet knæk på
  40°. Halerne har en mørk kant, så molekyler, der krydser hinanden, kan
  skelnes. Højst tre farver: lilla for mættede, grøn for monoumættede og blå
  for polyumættede (linolensyre er også blå), som på varedeklarationen
  (`Tegn.haleFarve`). De røde O-prikker er væk.
* **Større vindue med færre molekyler**: vinduet er 26 × 21 enheder (før
  36 × 34) og bredere end højt, halerne er 10 enheder (de rigtige kæder ca.
  15), og der er 5 molekyler (før 10). Molekylerne er derfor ca. dobbelt så
  store på skærmen. De bevæger sig med en tredjedel af den gamle fart.
* Kortets faste plads er nu 180 px (150 px på en lav skærm), fordi det højeste
  kort er lavere. Det giver vinduet mere plads.

Selvtest ALT OK (22. nov. 2026).

## Runde T10c: strukturformler igen, og smør er helt fast (22. nov. 2026)

Niels om den fortegnede figur: "Jeg synes ikke det blev bedre.. Det er jo
kemi, så jeg foretrækker nok alligevel strukturformler.. Måske er det
farverne som skal smutte.. Lav i stedet strukturformler med zigzag,, og lav
det på en måde, så man ikke kan undgå at bemærke dobbeltbindingerne i
kæden." og "smør er helt fast i et køleskab.. måske med lidt vibration.. men
ikke med noget smør der er flydende i toppen".

* **Zigzag-strukturformler igen** (`F.form`), men i én lys farve
  (`Tegn.KAEDE_FARVE`). Hver dobbeltbinding er en tyk, turkis dobbeltstreg
  (`Tegn.DB_FARVE`, Kemibogens farve for dobbeltbindinger) med en svag turkis
  glorie under (`Tegn.zoomKaede`). Fedtsyrernes fire farver er væk i vinduet;
  glycerol og de røde O-prikker er som før. Den fortegnede figur fra T10b
  (`F.stilForm`, `tegnStil`) er slettet. Fane 1 er uændret.
* **Vinduet** er 36 × 26 enheder med 5 molekyler (T10: 36 × 34 med 8), så
  formlerne står stort. Stregerne er lidt tykkere.
* **Vinduet viser tilstanden entydigt** (`Proeve.antalFaste`, REGELSAET 62):
  fast er alle molekyler i rækker (de vibrerer lidt), flydende ingen, og
  delvist fast mindst én og højst fire efter den faste andel. Smør i
  køleskabet er derfor helt fast, og kakaosmør på bordet også.
* **Varedeklarationen** har små zigzag-kæder med 0, 1 og 2 turkise
  dobbeltbindinger i stedet for farvede haler. Arket er lidt bredere.
* **Teksterne nævner ikke farver**: opgave 1 spørger "Hvordan ligger
  molekylerne i smørret ved 5 °C?" (før "nederst i vinduet"), og
  olivenolie og solsikkeolie får indledningen "De fleste kæder i ... har én
  (to) dobbeltbinding(er) og dermed ét (to) knæk."
* REGELSAET 60 er skrevet om (strukturformel, det vigtige kan ikke overses),
  og 62 er ny (mikrofiguren viser tilstanden entydigt).

Selvtest ALT OK (22. nov. 2026).

## Runde T10d: bogens kuglemodeller på faste pladser (22. nov. 2026)

Niels om zigzag-formlerne fra T10c: "det er sq stadig lidt handicappet.. det
ligner et stankelben, der bliver udsat for dyreplageri". Han overvejede at
skrotte fane 2. Sidste forsøg: et stillbillede i bogens stil
(`../../../.claude/spoergsmaal-og-start/stillbillede_t10_fedt.html`), og
Niels: "Jotak Prøv at bygge dette".

* **Kuglemodeller som figuren i C 4.6** (`F.kalotte` i `js/fedt.js`): samme
  geometri og farver som `fk_zigzag`, `fk_h`, `fk_h_retning` og
  `fk_fedtstof` i `Kemibogen/vaerktoej/lav_figurer.py` (12 carbonatomer i hver
  kæde, `FK_S` 0,64). C er grå, H hvid, O rød, og dobbeltbindingens to
  carbonatomer er turkise (bogens Cdb). De mest bøjede kæder sidder øverst i
  molekylet, og dobbeltbindingerne er forskudt én binding pr. kæde som i
  bogen, så alle tre kæder bøjer samme vej. En kæde med to dobbeltbindinger
  har den anden tre bindinger længere ude og krummer mere. Kuglerne tegnes
  med bogens lys oppe fra venstre (`kugleBillede` i `js/tegning.js`).
* **Vinduet er et lyst kort** som bogens figurer (500 × 350 enheder, 6
  molekyler). Kæderne i hvert molekyle er fordelt efter varedeklarationen og
  samlet, så molekylerne er så ens som muligt (`F.molekylerSorteret`).
* **Ingen fri bevægelse** (REGELSAET 63, `NK.Proeve`): hvert molekyle har en
  plads (`P.plan`). De faste ligger tæt i et dobbeltlag i bunden med glycerol
  udad og kæderne mod midten, de mest lige nederst, og bøjede molekyler
  vender knækkene opad. De vibrerer lidt. De flydende ligger løst med
  mellemrum og lidt på skrå (højst 16°) på den plads, der rører de andre
  mindst, og vugger roligt på stedet. Skifter tilstanden, glider molekylerne
  til deres nye plads på ca. 2 s, og et molekyle, der skal vende, drejer om
  sig selv. Pladserne regnes én gang pr. fedtstof og antal faste og gemmes.
* Fast er alle seks i krystallen, flydende ingen og delvist fast 1-5
  (REGELSAET 62). Et helt fast fedt med mange bøjede kæder (olivenolie i
  fryseren, kakaosmør) er højere end vinduet; vinduet er et udsnit, så
  krystallen fortsætter op over kanten. Smørkrystallen i køleskabet kan ses
  helt.
* Det harske smør får to smørsyremolekyler mellem de andre.
* Zigzag-tegningen i vinduet (`tegnMolekyle`, `zoomKaede`) og den gamle
  model med fri bevægelse er slettet. Fane 1 bruger stadig zigzag på fliserne.
* REGELSAET 60 er skrevet om igen (bogens figurer), og 63 er ny.

Selvtest ALT OK (22. nov. 2026).

## Runde T10e: gør først, forklar bagefter (22. nov. 2026)

Niels: "Der er nogle bugs.. solsikken vil gerne stå oven i olivenolien.. Og så
synes jeg måske gættekonkurrencen er lidt underlig.. om oliven olie er fast
eller delvis fast på køl.. lidt svært.. og måske også forvirrende fordi man
ser den på stuebordet og kigger på mikrotegningen.. og så er det ikke sikkert
at man skal gætte på noget som til gengæld ikke er sket endnu... den er
helt sikkert bedre.. men den er endnu ikke inutiv og rar."

* **Fejlen**: Køleskabet fik plads til tre glas i T10b, men pladserne blev
  stadig regnet ud til to, så det tredje glas landede oven i det andet. Nu
  kommer antallet fra `D.STEDER`.
* **Intet gæt** (REGELSAET 64). Tre opgaver med to trin: træk glasset ind i
  køleskabet (vinduet viser glasset hele tiden, så eleven ser molekylerne
  skifte, når glasset kommer ind), og forklar så det, eleven har set:
  1. Smør i køleskabet: "Hvordan ligger molekylerne i smørret ved 5 °C?"
  2. Solsikkeolie: "Hvorfor ligger molekylerne i solsikkeolie ikke i rækker
     som i smørret?" (Kæderne har knæk / Det er for varmt / Molekylerne er
     større)
  3. Olivenolie: "Hvorfor bliver olivenolie delvist fast i køleskabet, når
     solsikkeolie er flydende?" (Den har færre knæk / flere knæk / står
     koldere)
  Hvorfor-opgaven "Smør mod olie" er væk; opgave 2 spørger om det samme.
  Kortet går videre 1,2 s efter, at glasset står i køleskabet (før 0,9 s),
  så eleven ser molekylerne skifte.
* **Delvist fast** har mindst to molekyler i krystallen, så de ligger som en
  række (før kunne det være ét).
* Kortets faste plads er 156 px (130 px på en lav skærm).

Selvtest ALT OK (22. nov. 2026).

## Runde T10f: tættere krystal, mere luft i det flydende (22. nov. 2026)

Niels: "Fint nok.. Jeg synes det er okay nu.. men jeg kunne måske alligevel
godt tænke mig at tætheden blev større, når det var fast.. kan man lade
molekylerne komme tættere på hinanden... lige nu er der ikke meget forskel på
fast og flydende.. (og det er der nok heller ikke i virkeligheden.. men for
pædagogikkens skyld)".

* **Krystallen er pakket ekstra tæt** (`TAET` = −2,5 i `js/fedt.js`): kuglerne
  i to nabomolekyler må gå lidt ind i hinanden, den højre søjle skubbes ind
  mod den venstre, til halerne rører, og krystallen står midt i vinduet på
  bunden.
* **Vinduet har mere plads i forhold til molekylerne** (600 × 420 enheder,
  før 500 × 350), så det faste er en kompakt blok med plads omkring, og det
  flydende spredes ud over hele vinduet. Molekylerne er ca. 17 % mindre på
  skærmen.
* **De løse har mere luft** (`LUFT` = 2 H-radier + 14, før + 6) og ligger op
  til 22° på skrå (før 16°).
* REGELSAET 62 har fået Niels' ord om at overdrive forskellen.

Selvtest ALT OK (22. nov. 2026).

## Slutkortet og godkendelsen (22. nov. 2026)

Niels: "super.. vi stopper her ... Måske skal du fjerne den grønne boks når man
er færdig, og der må gerne lægges op til fri leg. Men derudover så er
animationen færdig." Efter sidste opgave hedder knappen "Videre til fri leg",
og slutkortet har ingen grøn knap (før "Byg dit eget fedt i Fabrikken"), men
siger "Du har løst alle opgaverne. Nu står kakaosmør og hørfrøolie også på
bordet." og halvfedt "Sæt glassene i fryseren, i køleskabet eller i solen, og
se, hvad der sker med molekylerne." Kortet kan lukkes med det røde kryds, og
Enter skifter ikke fane. **T10 er godkendt.** Selvtest ALT OK.

## Filer

```
index.html          markup for de to faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.1's). NB: decimaltal med PUNKTUM i CSS
sprites/            køleskabet med fryseren, vinduet med solen og glasset
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred (som sc4.1)
js/data.js          fedtsyrerne, fedtstofferne, stederne, ordrerne, opgaverne og replikkerne
js/fedt.js          smeltepunkterne, kæderne og NK.Proeve (molekylerne i zoomvinduet)
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, formlerne, fliserne, glasset, køleskabet, vinduet,
                    skiltene og zoomvinduet
js/sim_fabrik.js    fane 1
js/sim_koele.js     fane 2 (scenen, glassene og varedeklarationen)
js/koele_opgaver.js fane 2: opgaverne i rækken og kortet (runde T10)
js/laerer.js        Kemichael på begge faner og det harske smør (præsentationen
                    er fælles: ../kemichael/praesentation.js og praesentation.css)
js/kort.js          papirkortet øverst i scenen (NK.SceneKort)
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Fedtsyrerne** står i `D.SYRER` øverst i `js/data.js`: navn, antal
dobbeltbindinger, hvor cis-dobbeltbindingerne sidder, smeltepunktet for det
rene fedtstof og farven. **Stederne** i `D.STEDER` (temperatur og antal
pladser). **Fedtstofferne fra køkkenet** i `D.FEDT`: fedtsyrerne i procent og
den faste andel ved forskellige temperaturer (punkter, der regnes lineært
imellem). **Ordrerne** i `D.ORDRER` (krav pr. sted: `fast`, `flydende`,
`ikkeFast`, `ikkeFlydende`), **opgaverne** i `D.KOELE_OPGAVER` og
`D.KOELE_HVORFOR`, **replikkerne** nederst. Grænserne mellem fast, delvist
fast og flydende er `D.FAST_GRAENSE` (35 %) og `D.DELVIST_GRAENSE` (5 %).
Tiden i solen før smørret bliver harskt er `D.HARSK_TID`.

**Modellen** står i `js/fedt.js`: `F.smp` (smeltepunktet), `F.kaede`
(zigzagformlen) og `NK.Proeve` (zoomvinduet, 36 × 34 enheder, én enhed er
en C-C-binding).

**`_selvtest.html`** åbner index.html i en iframe og tjekker de målte
smeltepunkter, at et knæk mere aldrig giver et højere smeltepunkt, kædernes
længder, vinkler og bøjning, at alle fem ordrer kan løses, at køkkenets
fedtstoffer er faste og flydende de rigtige steder og passer med opgavernes
svar, at zoomvinduet har det rigtige antal faste molekyler (dem med det
højeste smeltepunkt) og holder de flydende inde, at begge faner kan
gennemføres (med musen: klik og træk på fliser, byt, tag af, træk et glas i
køleskabet), at det harske smør og Kemichael virker, at Kemichaels
præsentation virker på begge faner (den fælles test i
`../kemichael/praesentation.js`), at sproget holder reglerne, og at layoutet
holder fra 520 × 380 til 1500 × 900. Den kræver en lokal server eller Chrome
med `--allow-file-access-from-files` og lægger elevens gemte fremskridt
tilbage bagefter. Den tjekker også papirkortet (kortet i scenen, ingen
statuslinje, Indsend svar grå uden valg, et valg bedømmer ikke af sig selv,
kortet bliver på spørgsmålet med Næste, Start forfra i panelet, kortets plads
i alle størrelser). Sidst kørt 6. november 2026: ALT OK.

## Forenklinger

* **Alle fedtsyrer har 18 C-atomer.** Stearinsyre står for alle de mættede
  (i smør og kakaosmør også palmitinsyre og kortere kæder), oliesyre for de
  monoumættede. Kædelængden er holdt ude, så det kun er knækkene, der
  varierer. Kokosfedt er udeladt af samme grund: det er mættet, men smelter
  ved ca. 24 °C, fordi kæderne er korte.
* **Smeltepunkterne.** Fem er målte (den mest stabile krystalform):
  tristearin 73 °C, triolein 5 °C, trilinolein −13 °C, trilinolenin −24 °C
  (oversigten "Triglycerides as Novel Phase-Change Materials", PMC7730147) og
  SOS 43 °C (PMC7698300). De 15 andre er regnet med en lille model og står
  med "ca.": de umættede kæder giver gennemsnittet af deres rene
  smeltepunkter (mU), og de rette kæder løfter mod 73 °C:
  smp = mU + (73 − mU) · (antal rette / 3)^p, hvor p = 1,44 er valgt, så SOS
  giver 43 °C. Én kæde med knæk sænker altså smeltepunktet meget, som
  målingerne viser. Rækkefølgen af fedtsyrerne på glycerol tæller ikke med.
* **Et rent fedtstof** er fast under smeltepunktet og flydende over; ved
  præcis smeltepunktet er det delvist fast (triolein i køleskabet ved 5 °C).
* **Køkkenets fedtstoffer** er blandinger. Fedtsyrerne i procent er typiske
  værdier som på en varedeklaration. Den faste andel ved en temperatur er
  typiske, afrundede værdier (smør ca. 55 % fast ved 5 °C og 18 % ved 20 °C,
  kakaosmør smelter ved ca. 35 °C, olivenolie bliver uklar i køleskabet,
  solsikkeolie i fryseren, hørfrøolie er flydende ved −18 °C). Over 35 % fast
  kaldes det fast, over 5 % delvist fast.
* **Zoomvinduet** er fladt (2D) med 10 molekyler. I en blanding er det de
  molekyler med det højeste smeltepunkt i modellen, der er faste. De faste
  ligger i to søjler som et lag i en krystal; kæderne bøjer alle samme vej,
  og de mest knækkede ligger nederst. Er der ikke plads, trykkes rækkerne lidt
  sammen. De flydende holdes nogenlunde vandrette, så de kan være der.
* **Knækket** er tegnet som 30° pr. cis-dobbeltbinding (135° ved de to
  C-atomer i dobbeltbindingen, ellers 120°), så kæder med flere
  dobbeltbindinger krummer. I lærebøger tegnes knækket ofte som 60°.
* **Glycerol** er skrevet ud (CH₂, CH, CH₂), fedtsyrerne som zigzagformler.
* **Det harske smør** er hydrolyse sat tre uger frem. Smørsyren kommer fra
  de korte kæder i rigtigt smør, som ellers ikke er med i modellen.

## I menuen

Ja, siden 24. september 2026. Fra 26. sept. 2026 er den c4.4 (knappen
`data-emne="c4.4"`, nr. 4 i `animationer/kemi-c-filer/samling_c4.html` og i
`FEEDBACK_EMNER`), fordi C4 (dengang C6) blev omnummereret uden huller; mappen hedder stadig
sc4.5. Et gammelt link med `?emne=c4.6` åbner nu Substitution i benzin. Den
gamle ligger i `kemi-c-filer/arkiv/c4.6_typer_fedtstof_oldversion.html`.
