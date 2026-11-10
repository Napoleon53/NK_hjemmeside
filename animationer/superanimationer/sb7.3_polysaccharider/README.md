# sb7.3 Polysaccharider

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter kun
filer fra sin egen mappe og `../faelles/` og virker også, når den åbnes
direkte fra harddisken. Der er ingen Kemichael: al tekst står på det lyse
papirkort øverst i scenen, hjælpen er den gule knap på kortet, og intet
løses uden **Indsend svar**.

Den er bygget fra bunden; der var ingen animation om polysacchariderne i
B7-menuen før. Afsnittet i Kemibogen B er B7.3 Disaccharider og
polysaccharider, derfor nummer 7.3.

**Pointen i én sætning:** Stivelse, glykogen og cellulose er alle kæder af
glucose, og det er bindingerne, der gør forskellen: α-1,4-bindinger giver en
spiral, α-1,6-bindinger giver forgreninger, og β-1,4-bindinger giver lige
kæder, der binder sig til fibre og ikke kan spaltes af kroppens enzymer.

## Bestillingen (9. november 2026)

I brainstormen til B7 samme aften foreslog Claude "Kartoffel eller træ":
glucoseringe sættes sammen med α- eller β-bindinger, α giver en spiral og β
lige fibre, kroppens enzym kan kun klippe α-bindingerne, og iodprøven kan
være med. Brugeren valgte først en afløser til b7.10 (sb7.2) og bad senere
samme aften: "du må gerne forsøge at lave en animation til b7 med dette
udgangspunkt". Planen og valgene er Claudes, og brugeren har ikke set
animationen endnu.

1. **Pointen:** som ovenfor.
2. **Afløser intet.** Bygget fra bunden. Haworthformlerne er tegnet som
   bogens figurer `b7-amylose` og `b7-cellulose`, sekskanterne og spiralen
   som `b7-polysaccharider` og lupperne med I₃⁻ som `b7-iodtest`.
3. **Naboerne:** sb7.2 ejer ringslutningen og α og β i glucose. Maltose,
   lactose og saccharose og hydrolysen af dem (også i B7.3) er ikke med;
   maltose nævnes kun som det, amylase klipper stivelse til. B7.4 ejer
   Fehlings test.
4. **Loftet:** tre faner. Fane 1: to opgaver med tre trin. Fane 2: ét forløb
   med fire trin og tre molekyler med 30 enheder. Fane 3: ét forløb med seks
   trin, to prøver og to lupper.
5. **Layoutet:** scene plus panel som sb7.2. Scenen er papirkortet øverst og
   et whiteboard under det.

Stop-listen er overholdt: ingen flasker, man hælder med, intet stativ, ingen
uheld og ingen oprydning. Prøverne i fane 3 er tegninger, der ikke kan
gribes.

## Fanerne

**1 Byg kæden** (`js/sim_kaede.js`). Kæden begynder med tre glucoseenheder.
Amylose: (1) klik på α-glucose eller β-glucose nederst på tavlen, og tryk
Indsend svar (den valgte glucose flyver op ved siden af kæden); (2) klik på
de to OH-grupper, der reagerer, når α-1,4-bindingen dannes (et forkert par
får en forklaring efter fejlen: samme ring, carbonatom 6, carbonatom 2 eller
3, eller den forkerte vej); ringen glider ind, og der fraspaltes et
vandmolekyle; (3) Byg videre: kæden vokser til 18 enheder, ses på afstand,
bliver til sekskanter og snor sig som en spiral, og så spørgsmålet om
formlen (C₆H₁₀O₅)ₙ. Cellulose: (1) vælg β-glucose; (2) den nye ring kan ikke
bindes, som den ligger, så eleven trækker op eller ned i den og vender den
om (slippes den før halvvejen, drejer den tilbage); OH-grupperne reagerer, og
spørgsmålet er, hvorfor ringen skulle vendes; (3) Byg videre: 12 enheder, to
kæder mere glider ind, og de røde prikkede hydrogenbindinger kommer, og
spørgsmålet er, hvad der holder kæderne sammen. Tælleren øverst viser
glucoseenheder og fraspaltet vand.

**2 Forgreninger** (`js/sim_gren.js`). (1) Et stykke amylopectin som
haworthformler med numre: hvad hedder bindingen i forgreningen (α-1,6)?
(2) Gæt: amylose, amylopectin og glykogen med 30 enheder hver; hvilket giver
hurtigst glucose? (3) Start enzymerne: et enzym sætter sig på hver ende (1, 3
og 9) og klipper én enhed af ad gangen; de klippede enheder flyver hen til
tællerne, og der står, hvilket molekyle blev færdigt først. (4) Hvorfor er
glykogen hurtigst (mange ender)?

**3 Spyt og iod** (`js/sim_iod.js`). To rækker med prøven til venstre og en
lup til højre (mikro og makro hver for sig, bogens regel). (1) Gæt: en dråbe
iodopløsning på kartoffel og vat; hvilken bliver blåsort? (2) Tilsæt
iodopløsning: kartoflen bliver blåsort, vattet gulbrunt, og tre
triiodidioner lægger sig inde i spiralen af amylose. (3) Hvorfor? (4) Gæt:
spyt på kogt stivelse og vat i 10 minutter ved 37 °C. (5) Tilsæt spyt: to
enzymer klipper spiralen fire steder til fem stykker maltose (et
vandmolekyle pr. klip), og to enzymer preller af på cellulosen; 10 minutter
senere kommer iodopløsning på, og begge prøver bliver gulbrune. (6) Hvorfor
kunne amylase ikke klippe cellulose?

## Filerne

```
index.html          siden, teorien og rundvisningen
css/stil.css        kopieret fra sb7.2; det nye står nederst under SB7.3
js/kerne.js         fælles hjælpere (som sb7.2)
js/data.js          opgaverne, trinnene, teksterne, molekylerne i kapløbet og spiralens form
js/enhed.js         en glucoseenhed som haworthformel og som sekskant, glykosidbindingen,
                    og røret, der binder spiralen sammen
js/tegning.js       tavlen, rammerne, skiltet, enzymer, triiodidioner, vand, lupper og prøver
js/fane.js          scenekortet, hjælpeknappen, Indsend svar, musen og konfettien (som sb7.2)
js/sim_kaede.js     fane 1
js/sim_gren.js      fane 2
js/sim_iod.js       fane 3
js/rundvisning.js   rundvisningen (kun TURE er ny)
js/app.js           faneskift, teorien med et stykke amylose og cellulose, tastatur og tegneløkken
_selvtest.html      selvtesten (kræver en lokal server)
_skud.html          skærmbilleder af bestemte trin (udviklerværktøj, kræver en lokal server)
```

## Det, man kan rette i

* **Opgaverne og teksterne:** `D.KAEDE`, `D.GREN` og `D.IOD` i `js/data.js`.
  `start` og `voks` er antallet af enheder i kæden før og efter Byg videre.
* **Molekylerne i kapløbet:** `D.MOLEKYLER` i `js/data.js`. Hver kæde er en
  vej i et sekskantnet (E, UR og DR) fra den enhed, den sidder på.
* **Spiralen:** `D.SPIRAL` og `D.PR_OMGANG` i `js/data.js` (alle tre faner).
* **Tiderne:** `FLYV`, `KOND`, `VOKS_DT`, `SKEMA_D` og `FORM_D` øverst i
  `js/sim_kaede.js`, `KLIP` i `js/sim_gren.js`, `KLIP` (tiderne for
  amylasens klip) og `SPYT_IOD` i `js/sim_iod.js`.

## Forenklinger

* Kæden vokser ved, at en hel glucose bindes på enden. I planterne bygges
  kæden af enzymer, og glucosen kommer fra et aktiveret molekyle, ikke fra
  fri glucose. Det er ikke nævnt.
* Haworthformlerne har ingen hydrogenatomer på ringen, som i bogen. Den
  første enhed i kæden har en fri OH-gruppe på carbonatom 4, den sidste på
  carbonatom 1. Tælleren viser derfor n − 1 vandmolekyler for n enheder; bogen
  siger selv, at den manglende binding ikke betyder noget, når n er stor.
* Cellulose vendes ved at dreje ringen en halv omgang om den vandrette akse.
  Vendingen er en handling og bedømmes ikke.
* Spiralen har seks enheder pr. omgang og ses lidt skråt, så hver omgang er en
  løkke. Hydrogenbindingerne mellem cellulosekæderne er prikker ved hver anden
  enhed; de rigtige bindinger er ikke tegnet atom for atom.
* Kapløbet: 30 enheder pr. molekyle (rigtige molekyler har tusinder), og
  forgreningerne i amylopectin og glykogen sidder tættere end i virkeligheden.
  Enzymerne klipper én enhed pr. 0,2 sekund fra enderne, og når alle grene på
  en enhed er klippet af, rykker et af enzymerne videre til den. I kroppen
  frigives glucosen som glucose-1-phosphat, og et andet enzym klipper
  forgreningerne; det er ikke nævnt. Enzymerne kaldes bare enzymer.
* Amylase klipper spiralen i stykker med præcis to enheder (maltose). I
  virkeligheden dannes også lidt glucose og længere stykker.
* Prøverne i trin 4 til 6 er kogt stivelse, fordi amylase klipper kogt
  stivelse let. Iodopløsningen kommer først på, når spyttet har virket.
* Farverne: gulbrun og blåsort som i bogens figur `b7-iodtest`.

## Tal skrevet efter hukommelsen

Seks glucoseenheder pr. omgang i amylosespiralen og 10 minutter ved 37 °C
for spyt på stivelse er skrevet efter hukommelsen. Resten er bogens.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med mappen `animationer/`
som rod. Den tjekker modellen mod bogen (α og β, at bindingerne i amylose
sidder under ringene og i cellulose skiftevis over og under, formlen
C₆H₁₀O₅, seks enheder pr. omgang, 30 enheder og 1, 3 og 9 ender i kapløbet,
ingen enheder oven i hinanden), at alle tre faner kan gennemføres (også
trækket i cellulose), at forkerte svar får den rigtige forklaring og koster
stjernen, at glykogen bliver færdig først og amylose sidst, at kun kartoflen
bliver blåsort, og at amylase klipper stivelsen til fem stykker maltose, at
teksterne er korte og uden tankestreger og ASCII-dansk, og at kortet aldrig
dækker tavlen fra 1100 × 620 til 1600 × 950. 9. nov. 2026: ALT OK (70).

## I menuen

I menuen fra 10. nov. 2026 (brugeren: "Den skal bare ind i menuen og på
kemibogen"): knap nr. 2 i `kemi-b-filer/samling_b7.html` med koden `b7.3`
(afsnittets nummer, som `b8.6` for TLC), også i `FEEDBACK_EMNER`. Kemibogen B
har en Prøv selv-linje til den i B7.3.

## Papirkortet

Kortet er det lyse papirkort fra start (se Fælles krav i `../README.md`):
`../faelles/papirkort.css` og `../faelles/papirkort.js` er indlæst, og
`<body class="papirkort">`. Efter et rigtigt svar bliver kortet på
spørgsmålet med forklaringen under svarene, og Næste står, hvor Indsend svar
stod. Kortets grønne knap går altid fremad; Begynd forfra står i panelet.
