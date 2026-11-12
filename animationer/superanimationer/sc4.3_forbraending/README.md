# sc4.3 Forbrænding

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv (og papirkortet i `../faelles/`) og virker også, når
den åbnes direkte fra harddisken. Der er ingen Kemichael. Al tekst står på
papirkortet øverst midt i scenen, og den gule hintknap sidder på kortet.

Den hører til Kemibogens afsnit 4.3 (Alkaners reaktioner) og er bygget fra
bunden: afsnittet linkede kun til den almindelige afstemning (`sc1.4`), og
intet viste forskellen på fuldstændig og ufuldstændig forbrænding. Mappen
hedder 4.3 efter afsnittet. Den er ikke i menuen.

## Bestillingen (12. november 2026)

Brugeren: "Lav følgende nye superanimation: Afsnit 4.3 Alkaners reaktioner
... Idé: En brænder med luftregulering, som giver en gul, sodende flamme eller
en blå flamme. Luppen viser carbonmonoxid og sod, når der er for lidt
dioxygen. Bagefter afstemmer eleven forbrændingen i rækkefølgen C, H, O."

1. **Pointen:** Er der dioxygen nok, bliver alt carbon i et carbonhydrid til
   carbondioxid og alt hydrogen til vand (blå flamme); er der for lidt,
   bliver noget af carbonet til carbonmonoxid og sod (gul, sodende flamme).
   Forbrændingen afstemmes i rækkefølgen C, H og O.
2. **Hvad den afløser:** intet. Bygget fra bunden. Tegnestilen er bogens:
   figuren `forbraending-flammer` (to flammer og en lup med kuglemodeller) og
   `propan-afstem-trin-1` til `4` (skemaet, kuglerne under og regnskabet med
   før og efter).
3. **Naboerne:** `sc1.4_afstemning` ejer afstemning i det hele taget (alle
   slags reaktioner, kugler der reagerer, fri rækkefølge); her er der kun
   forbrændinger, og rækkefølgen C, H, O er låst. `v2/superlab/sc4.8_substitution`
   (Substitution i benzin, C4 knap 7) ejer substitutionen, så den er ikke med.
   `sc5.10_lightergas` ejer butan som mængde, og `sc5.9_staaluld` forbrænding
   af jern.
4. **Loftet:** to faner, ti opgaver (5 + 5). Fane 1: én brænder med methan,
   én luftregulering med fem trin, én ske på et stativ og én lup. Fane 2: ét
   reaktionsskema med fire led, kuglemodeller (højst 8 af hvert stof) og ét
   regnskab.
5. **Layoutet:** scene plus panel. Øverst i scenen et lavt kort som i sc4.6.
   Fane 1: brænderen, skeen og luftreguleringen til venstre, luppen til
   højre. Fane 2: en lys tavle med skemaet og regnskabet til højre.

Stop-listen er overholdt: der hældes ikke, og der er intet affaldsglas, intet
uheld og intet forløb trin for trin. Trinnene på fane 2 er afstemningens
fremgangsmåde, ikke et forsøg.

## Fanerne

**1 Brænderen** (`#braender`). En bunsenbrænder med methan, CH₄. Et klik
tænder den. Knappen på luftreguleringen trækkes mellem lukket og åben (fem
trin, også med piletasterne); hullet i luftkraven bliver større, og to blå
pile viser luften, der suges ind. En kold ske sidder på en arm på et stativ;
et klik skubber den ind i flammen et øjeblik (tørret af først), og den
kommer selv tilbage, sort, hvis flammen soder. Luppen over flammens spids
viser, hvad der kommer op. Fem opgaver:

1. Den gule flamme: tænd, hold skeen ind i flammen; hvad er det sorte lag? (sod, rent carbon)
2. Den blå flamme: stil luftreguleringen, så flammen ikke soder, og indsend;
   hvorfor soder den blå flamme ikke? (dioxygen nok til alt carbon)
3. Luppen over den blå flamme: vælg alle stoffer, der passer (CO₂ og H₂O)
4. Luppen over den gule flamme: stil luften, så flammen soder mest, og
   indsend; hvilke stoffer var der ikke over den blå flamme? (CO og C)
5. Carbonmonoxid er giftig: hvorfor er en gul flamme farlig i et lukket rum?

Luppen er skjult i opgave 1 og 2 (som sb8.6: ingen levende model, før den
spørges om); knappen Vis luppen viser den alligevel. Panelet samler, hvad
eleven har fundet ud af om de to flammer, som bogens figur med to flammer.

**2 Afstem forbrændingen** (`#afstem`). Fem forbrændinger: methan (brænderen
på fane 1), propan (bogens eksempel), pentan, ethan (3½ O₂, som i bogen) og
methan med for lidt dioxygen (CH₄ + 1½ O₂ → CO + 2 H₂O, ganget med 2). Hvert
skema afstemmes i tre trin, carbon, hydrogen og oxygen, og et fjerde, når O₂
får et halvt tal (spørgsmålet "Hvad gør du, så alle tal bliver hele tal?").
Kun feltet foran det stof, trinnet handler om, er gult og kan stilles (pilene
over og under feltet, piletasterne og på oxygentrinnet knappen ½). Indsend
svar sender tallet. Et klik på et andet led siger rækkefølgen.

Kuglemodellerne under formlerne følger tallet med det samme (et halvt O₂ er
ét O-atom med en stiplet ring, hvor det andet skulle sidde). Regnskabet til
højre følger de indsendte tal, og ved det tal, trinnet spørger om, står der
et spørgsmålstegn, til tallet er sendt. Så løser regnskabet ikke opgaven af
sig selv, men et forkert tal står bagefter med rødt og ✗, og forklaringen
siger, hvad der ikke passer. De typiske fejl har deres egen forklaring: 8
H₂O til 8 hydrogenatomer (hvert H₂O har 2), 10 O₂ til 10 oxygenatomer, og O₂
afstemt uden oxygenatomerne i H₂O.

## Modellen

* **Luftreguleringen** (`D.LUFT` i `js/data.js`): fem trin. `gul` er, hvor
  meget af flammen der er gul (1, 0,78, 0,4, 0, 0), `sod` hvor hurtigt skeen
  bliver sort. Den blå flamme soder ikke fra trin 3 (næsten åben).
* **Luppen** (`js/lup.js`): 13 faste pladser, otte med vand og fem til det,
  carbonatomerne bliver til (`kul`): lukket CO₂, CO, sod, CO, sod; lidt åben
  CO₂, CO, sod, CO₂, sod; halvt åben CO₂, CO, sod, CO₂, CO₂; næsten og helt
  åben fire CO₂. Pladserne skifter så lidt som muligt, og et skift toner over
  på 0,6 s. Molekylerne stiger langsomt op (ca. 20 s gennem luppen). Intet er
  tilfældigt, så luppen altid passer med luftreguleringen.
* **Skemaerne** regnes af formlen (`D.facit`): tallet foran CO₂ (eller CO) er
  antallet af C, foran H₂O antallet af H divideret med 2, og foran O₂
  oxygenatomerne efter pilen divideret med 2. Teksterne, hintene og
  forklaringerne bygges af de samme tal (`lavMaal`, `D.aFejl`).
* **Kuglerne** er bogens: C mørkegrå, O rød, H hvid og 0,62 gange så stor,
  med bogstavet på (`T.atom` og `T.FORM` i `js/tegning.js`). Sod er en klump
  af syv C-kugler som i bogens figur.

## Forenklingerne

* Luppen viser kun det, der kommer op fra flammen (ikke dinitrogen og
  overskud af dioxygen fra luften), som bogens figur.
* Antallet af molekyler i luppen er ikke støkiometrisk: en klump sod tæller
  som én af de fem pladser til carbon, og vandet er altid otte. Det, der
  passer, er hvilke stoffer der er, og at der er mere CO og sod, jo mindre
  luft der kommer ind.
* Gassen er methan (naturgas). Mange skoler har propan eller butan på flaske;
  flammen opfører sig ens.
* Skeen bliver sort i den gule flamme og ren i den blå. Dug fra vandet på en
  kold ske er ikke tegnet.

## Filerne

* `index.html`, `css/stil.css` (fra sc4.6; nyt nederst: fire svar på en
  række, panelet med de to flammer og rækkefølgen).
* `js/data.js`: luftreguleringen, de ti opgaver og alle tekster.
* `js/braender.js`: brænderen, flammen, luftkraven, luftreguleringens knap og
  skeen med stativet. `js/lup.js`: luppen over flammen.
* `js/tegning.js`: kuglemodellerne (også et halvt O₂) og det fælles fra sc4.6
  (bordet, luppens ramme, tavlen, ringe, skilte og knapper på lærredet).
* `js/sim_braender.js`: fane 1. `js/sim_afstem.js`: fane 2.
* `js/fane.js`: kortet, låsen og hintene fra sc4.6, rettet til delene i en
  liste (`o.dele`), "vælg alle, der passer" (`flere: true`), Indsend svar i et
  forsøg pr. del (`indsend: true`), kortet bliver på opgaven også efter et
  forsøg, og stjerne kun uden fejl.
* `js/kerne.js`, `js/sprites.js`, `js/rundvisning.js`, `js/app.js` fra sc4.6
  (app.js giver fanen piletasterne og Enter via `tast`).
* `sprites/`: `braender.svg` (efter sc5.9's `bunsen.svg`, uden luftkrave,
  fordi hullet åbner og lukker) og `ske.svg`. `_sprites.html` viser dem alene.
* `_selvtest.html`: kemien (alle skemaer afstemt, også efter hele tal),
  luppen ved hvert trin af luftreguleringen, teksterne (længder, æ, ø og å,
  dioxygen, ingen tankestreger), begge faner med musen (forkerte svar, vælg
  alle, låsen, stjernen, Vis svaret, piletaster og Enter) og fire
  skærmstørrelser (kortets højde i alle dele med hvert hint og hvert forkert
  svar; brænderen, luppen, skemaet og regnskabet). ALT OK (171) 12. nov. 2026.

## Papirkortet

Kortet er det lyse papirkort fra start og lavt som i sc4.6: opgaveteksten med
Giv et hint og Indsend svar ved siden af, svarene på samme række, og et hint
eller en forklaring på en række for sig. Efter et rigtigt svar eller et
klaret forsøg bliver kortet på opgaven: forklaringen står under, og Næste
står, hvor Indsend svar stod. Luftreguleringen, skeen og pilene løser aldrig
en opgave af sig selv; Indsend svar viser, hvad der sendes ("luften helt
åben", "3½ O₂"). Start forfra står i panelet, aldrig på kortet.

## I menuen

Ikke i menuen. Når brugeren siger til: C4 i `kemi-c-filer/samling_c4.html`
(pladsen som knap 3 svarer til afsnit 4.3, hvor Tegnebræt står nu; det afgør
brugeren), `FEEDBACK_EMNER`, linjen til `til_panelet.js` øverst i `<head>` i
`index.html` og kolonnen "I menuen" i superanimationernes README. Kemibogens
afsnit 4.3 kan få en Prøv selv-linje hertil, men kun hvis brugeren beder om
det.
