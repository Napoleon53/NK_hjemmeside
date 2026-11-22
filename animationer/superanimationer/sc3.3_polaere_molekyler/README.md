# sc3.3: Polære molekyler

**Status: i menuen** fra 26. sept. 2026 som c3.3 ("Polære molekyler") i
`samling_c3.html` og `samling_NV.html`. Den gamle ligger i
`kemi-c-filer/arkiv/c3.3_elektronegativitet_oldversion.html`.

Åbn **`index.html`**. Mappen er selvstændig. Den bruger hverken `fetch` eller
moduler og virker derfor også, når den åbnes direkte fra harddisken.

## Bestillingen

1. **Pointen:** et molekyle er polært, når det mest elektronegative atom trækker
   elektronparrene skævt, og trækkene ikke ophæver hinanden.
2. **Hvad den afløser:** den gamle c3.3 (vælg to atomer, aflæs ΔEN, placér
   bindingen i én af tre kasser, test med 10 spørgsmål). Taget med: de samme
   elektronegativiteter, grænserne 0,5 og 2,0 og de tre slags bindinger. Nyt:
   tovtrækningen om elektronparret. Fane 2 og 3 er flyttet hertil fra sc3.2
   (brugerens ønske 24. sept. 2026), så sc3.2 kun handler om formen.
3. **Naboerne:** sc3.2 ejer formen og vinklerne, sc3.4 ejer blandbarheden (ét
   lag eller to), og c3.5 (gæt polaritet) skal senere blive et sorteringsspil med
   større molekyler. Heptan oven på vand står derfor ikke her.
4. **Loftet:** tre faner, 9 atomer på fane 1, de samme 11 molekyler som sc3.2 og
   tre væsker i forsøget.
5. **Layoutet:** scene plus panel, som sc3.2.

## Hvad viser den

| # | Fane | Hvad eleven gør | Pointe |
|---|------|-----------------|--------|
| 1 | Elektronegativitet | vælger to atomer i et lille periodisk system og ser dem trække i det fælles elektronpar | jo større forskel i elektronegativitet, jo skævere ligger parret: upolær, polær eller ionbinding |
| 2 | Polær eller upolær? | ser trækket i hver polær binding og det samlede træk i 11 molekyler | et molekyle med polære bindinger kan være upolært, hvis det er symmetrisk |
| 3 | Forsøg: vandstrålen | lader en stav og holder den ved en stråle af vand, ethanol og heptan | polære væsker bøjer mod staven, uanset om den er positiv eller negativ |

Alle faner har opgaverne på papirkortet øverst i scenen (se "Papirkortet" nedenfor).
Fane 1 har intet panel fra runde T8 (22. nov. 2026, se nederst).
På fane 3 er opgaverne låst, til skemaet er udfyldt. Teorien ligger bag
knappen **Teori**, og **?** starter en rundvisning for den aktive fane.

Der er ingen præsentation og ingen Kemichael (brugerens ønske 27. sept. 2026).

### Fane 1: elektronegativitet

* Scenen viser to atomer med deres elektronegativitet og det fælles elektronpar
  (to gule prikker). Parret glider mod det atom, der trækker hårdest, og
  elektronskyen bliver tykkest der. En polær binding får δ+ og δ−.
* Ved ΔEN på 2,0 eller mere tager det ene atom parret helt. Atomerne skilles,
  den positive ion bliver mindre og den negative større, og de får + og −.
* Nederst står en skala for ΔEN med de tre slags bindinger, og en pil viser
  bindingens plads. Over skalaen står én linje om, hvad scenen viser.
* Panelet har et lille periodisk system: hovedgruppe 1, 2 og 13-17 i fire
  perioder. De 9 atomer, der er med (H, Li, C, N, O, F, Na, Cl, K), er farvet
  efter elektronegativiteten, fra blå til rød. De andre står som tomme felter og
  svarer også på klik.
* Et klik i tabellen sætter atomet ind i stedet for det med den gule ring, og
  ringen hopper til det andet atom. Et klik på et atom i scenen flytter ringen.
* Panelet regner ΔEN ud som største minus mindste: `3,0 − 2,1 = 0,9`.

**Metallerne.** Li, Na og K kan kun sættes sammen med N, O, F og Cl. Ellers
dæmpes felterne, og et klik giver en besked om hvorfor. Så giver grænsen på 2,0
altid ioner, når et metal er med, og aldrig ellers. Uden den regel ville fx
NaBr og MgCl₂ blive "polære" efter ΔEN-reglen, selvom de er salte. Derfor er
Br, Mg og S heller ikke med.

**Opgaverne** (fire slags, aldrig samme slags to gange i træk):

1. Klik på det atom, der bliver δ−. Parret står i midten, til opgaven er løst.
2. Upolær, polær eller ionbinding? ΔEN står som `= ?` i panelet og på skalaen.
3. Byg selv: en binding, hvor carbon bliver δ+; en upolær binding mellem to
   forskellige atomer; den mest polære binding med hydrogen; en ionbinding; en
   binding, hvor oxygen bliver δ+ (O-F). Hvert klik, der ikke passer, får et svar.
4. Hvilken af fire bindinger er mest polær?

### Fane 2: polær eller upolær?

Uændret fra sc3.2's fane 3. En binding er polær fra en forskel i
elektronegativitet på 0,5. Pilen går fra δ+ mod δ− og er længere, jo større
forskellen er. Om molekylet er polært, regnes ud af de samme pile i `klargoer()`
i `js/data.js`, så tegningen og facit ikke kan være uenige.

### Fane 3: forsøg med vandstrålen

Uændret fra sc3.2's fane 4: tre haner over en vask (vand, ethanol og heptan med
mærkatet "Kun i animationer"), plastikstav, glasstav og uldklud, en lup med
molekylerne og et resultatskema på 3 x 2 felter. Forsøget er slut, når alle seks
felter er udfyldt; så låses tegneserien og opgaverne op. Polariteten står i
`D.VAESKER`: vand 1, ethanol 0,55, heptan 0,02 (rækkefølgen passer, tallene er
ikke målte).

Direkte link til en fane: `index.html#en`, `#polaritet` eller `#vand`.

Genveje: <kbd>1</kbd>-<kbd>3</kbd> faner · <kbd>S</kbd> tegneserie (fane 3) ·
<kbd>T</kbd> teori · <kbd>R</kbd> start fanen forfra · <kbd>H</kbd> rundvisning ·
<kbd>Esc</kbd> luk.

## Forenklinger

* Elektronegativiteterne er Paulings værdier med én decimal, de samme som den
  gamle c3.3 (H 2,1, C 2,5, N 3,0, O 3,5, F 4,0, Cl 3,0, Li 1,0, Na 0,9, K 0,8).
* Hvor langt parret glider, er ΔEN / 2 (højst 0,92 for en polær binding). Det
  er en tegning af tovtrækningen, ikke en beregning af elektrontætheden.
* En ionbinding vises som ét par, der flytter. Ionernes rigtige ladning (fx O²⁻)
  vises ikke; de får bare + og −.

## Filer

```
index.html            markup for de tre faner, teori, tegneserie og rundvisning
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, dansk talformat, vektorer og drejninger,
                      DPR-skarpt canvas og hukommelse
js/data.js            grundstoffer og grænser, molekyler, væsker, teori
js/sprites.js         indlæser sprites/*.svg
js/frastoedning.js    placerer de frie elektronpar (samme som sc3.2)
js/model3d.js         kameraet og tegningen af molekylerne; pilene
js/prikformel.js      prikformlen i hjørnet på fane 2
js/opgave.js          papirkortet med opgaverne (samme som sc3.2)
js/valg.js            det valgte molekyle på fane 2
js/sim_en.js          fane 1: tovtrækningen, tabellen og opgaverne
js/molsim.js          NK.MolSim: et molekyle i 3D (fra sc3.2 uden vinkelmåler)
js/sim_polaritet.js   fane 2
js/vand_tegning.js    fane 3: alt, der tegnes, og scenens mål
js/sim_vandstraale.js fane 3: haner, stråle, stave, skema og opgaver
js/tegneserie.js      fane 3: forsøget som tegneserie
js/rundvisning.js     spotlight-rundvisningen
js/app.js             faneskift, overlays, tastatur, tegneløkke
sprites/              atomkugler (H, Li, C, N, O, F, Na, Cl, K), elektronpar,
                      rør med tre haner, vask, plastikstav, glasstav og uldklud
_selvtest.html        udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Et nyt atom på fane 1** er én linje i `D.GRUNDSTOFFER` og i `D.EN_ORDEN` i
`js/data.js` (med periode og gruppe) plus en kugle i `sprites/`. Et metal skal
have `metal: true`. Står der et tomt felt på pladsen, fjernes det fra `TOMME` i
`js/sim_en.js`. Kør selvtesten bagefter: den tjekker, at et metal altid giver
en ionbinding og et ikke-metal aldrig gør.

**Et nyt molekyle på fane 2** er ét objekt i `D.MOLEKYLER` (samme format som
sc3.2) med to tekster, `hintPol` og `svarPol`.

**Opgaverne** står øverst i hver `sim_*.js` som funktioner, der returnerer et
opgaveobjekt (formatet står i `js/opgave.js`). Byg-opgaverne på fane 1 står i
`BYG` i `js/sim_en.js`.

**`_selvtest.html`** åbner `index.html` i en iframe og kontrollerer: grænserne og
metalreglen for alle 27 par; at parret glider mod det rigtige atom og længere,
jo større ΔEN er; tabellen og beskederne; molekylernes polaritet og oktet;
vandstrålen (vand bøjer mest, ethanol mindre, heptan ikke; våd stav; gnidning;
hele forløbet til tegneserien); at alle opgaver kan løses; at der ingen
præsentation er; og at ingen tekst bruger tankestreger, skriver ladning som 1+
eller er under 12 px.

## Linjen til menuen

Når brugeren siger til, skiftes linjen for c3.3 i `kemi-c-filer/samling_c3.html`
(og `samling_NV.html`, hvis den har den) til
`../superanimationer/sc3.3_polaere_molekyler/index.html` med titlen
"Polære molekyler".

## Papirkortet (6. nov. 2026)

Opgaverne står på ét lyst papirkort øverst i midten af scenen
(`../faelles/papirkort.css` og `papirkort.js`, `js/opgave.js`, samme kode som
sc3.2), ikke i panelet. Et svar, et atom eller et atompar vælges kun; **Indsend
svar** sender ind og er grå, til der er noget at sende. Det valgte atom får en gul
ring. **Giv et hint** er en stille knap med gul kant (Giv et hint, Vis svaret). Efter
et rigtigt svar bliver kortet på opgaven med det grønne svar, forklaringen og
**Næste opgave**; efter fanens sidste opgave fører knappen videre til næste fane.
Fane 1 og 2 har seks opgaver, fane 3 fire. Under et spørgsmål er tabellen, menuen
og forsøget låst, og et klik får kortet til at blinke. På fane 3 står forsøgets
næste skridt på kortet (linjen over skemaet er væk), og Start opgave 1 kommer
frem, når skemaet er udfyldt. Statuslinjen nederst i scenen er væk; korte
beskeder står i kortets nederste række. Svarmulighederne er kortet ned til højst
ca. 34 tegn. Selvtesten (afsnit 7) måler kortet i 1400x860 og 1100x700.

Molekylenavnene (6. nov. 2026): ingen ændringer; oxygen, hydrogen, chlor osv.
står kun om atomer og elektronegativitet.

## Runde T8: fane 1 efter regelsættet (22. nov. 2026)

Niels sagde ja til forslaget ("Tror du rammer ret godt essensen. Begynd gerne").
Reglerne står i `../REGELSAET.md`; numrene nedenfor henviser dertil.

* **Intet panel** (regel 2-3). Opgaverne står i en række øverst med "↺ Start
  forfra" yderst til højre. Det periodiske system står i scenen til venstre,
  tavlen med regnestykket på et lyst papir til højre (regel 27-29), og
  ΔEN-skalaen står centreret lige under kortet (regel 37). Afkrydsningsfelterne
  Elektronsky og δ+ og δ− er væk (begge er altid slået til), og det samme er
  teksten nederst i scenen og knappen Start opgave 1.
* **Seks opgaver i fast rækkefølge** som Kemibogens eksempler i C 3.3 (regel
  11-18), i `OPGAVER` i `js/sim_en.js`. Motoren er `js/en_opgaver.js` (mønster:
  `sc2.1_salt_i_vand/js/maet_opgaver.js`) med fire slags trin: valg, felt
  (eleven skriver ΔEN), handling ("Klik på C ...", går selv videre efter 0,9 s,
  regel 33) og byg (Indsend svar). Titlerne låses op i takt (regel 17).
  1. Hydrogenchlorid H−Cl: hvem trækker hårdest, hvad betyder δ−, ΔEN (0,9;
     5,1; −0,9) og bindingstypen. Tabel, skala og tavle er stiplede pladser,
     til de bruges (regel 13).
  2. Carbon og hydrogen: klik på C, skriv ΔEN = 0,4, upolær.
  3. Køkkensalt: klik på Cl og Na, skriv ΔEN = 2,1, Cl tager parret helt.
  4. Byg: carbon bliver δ+ (fra C−H, ringen på H).
  5. Byg: den mest polære binding med hydrogen (H−F).
  6. Den mest polære af C−H, N−H, O−H og H−Cl.
  Bagefter fri leg med hele tabellen og "Videre til Polær eller upolær?".
* **Det, et trin spørger om, er skjult** (regel 38): parret står i midten, til
  eleven har svaret, hvem der trækker hårdest; tavlen viser "ΔEN = ?" med gul
  ramme; bindingstypen og den farvede zone på skalaen kommer først efter svaret.
  Efter et rigtigt svar er det skjult, som det næste trin spørger om.
* **Klik kun, når kortet beder om det** (regel 19a-20): under et spørgsmål er
  tabellen en låst figur. I et handlings-trin kan kun det felt, der skal bruges,
  klikkes, og det har gul ramme og boblen "Klik: C". I byg-opgaverne har hele
  tabellen rammen, til eleven har klikket, og ringen bliver på det atom, kortet
  nævner.
* Bindinger skrives som i Kemibogen med en lang streg (H−Cl). Etiketter og skala
  i Lexend (regel 30).
* **Teorien** er et kort, lyst ark (`../faelles/teori.css`, regel 31) med
  bogens tabel over de tre slags bindinger og henvisning til C 3.3 og 3.4.
  `D.TEORI` er væk.
* Selvtesten (`_selvtest.html`) går alle seks opgaver igennem trin for trin med
  forkerte svar, tjekker det skjulte og måler kortet i hvert trin.

Fane 2 og 3 er ikke ændret og har stadig panel.

### Runde T8b: fane 2 og 3 (22. nov. 2026)

Niels om fane 1: "Første fane er den bedste. Den er helt fejlfri. Godt arbejde."
Rettet efter hans kommentarer til de andre faner (REGELSAET 53-56):

* Fane 2: "Drej langsomt" er slået fra fra start ("svært at koncentrere sig").
  Panelet har et lille periodisk system med elektronegativiteterne som figur
  (samme tabel som fane 1, `NK.SimEN.bygTabel`, uden knapper), og atomerne i
  molekylet har gul ring. Beregningerne står bag "Vis beregningerne" og skrives
  "ΔEN(Cl−C) = 3,0 − 2,5 = 0,5".
* Fane 2, opgave 3 (CO₂ og CCl₄): "Atomerne trækker lige hårdt" er skiftet ud
  med "C og O har samme elektronegativitet" (og Cl), som tabellen viser er
  forkert. Niels: "det er jo nok det som en svag elev ville prøve at formidle".
* Fane 3: mærkatet "Kun i animationer" ved heptan er væk. Luppen er større og
  har færre, større molekyler med symbolerne i kuglerne og δ+ og δ− ved
  enderne. Ethanol er CH₃, CH₂, O og H med OH-enden mod staven; heptan er
  CH₃−(CH₂)₅−CH₃ som syv kugler. Molekylerne står roligere.

### Mission og fri leg (22. nov. 2026, REGELSAET 57)

Niels: "Hvis man skal afskaffe freeroame, så skal man også fjerne illusionen af
vælg selv ... som udgangspunkt skal starte i mission-mode.. men nede under
start-forfra kan man også have et fri-leg-felt".

* Fane 2 begynder direkte i opgave 1 (`mission: true` i `NK.Opgaver`,
  `js/opgave.js`). Menuen og visningen (klassen `kun-fri`) er skjult under
  opgaverne. Knappen **Fri leg** under Start forfra viser dem, og "Tilbage til
  opgaverne" giver den opgave, der var i gang, med samme molekyle. Efter
  sjette opgave: "Du har klaret alle 6 opgaver", fri leg og "Videre til
  Vandstrålen".
* Fane 1 har samme knap, **Fri leg**, i rækken ved Start forfra
  (`friLeg` og `tilbage` i `js/en_opgaver.js`). Tilbage til opgaverne begynder
  opgaven forfra fra trin 1.
* Fane 3 er uændret: forsøget er frit, og opgaverne kommer, når skemaet er udfyldt.
* Kortet i fri leg (og efter sidste opgave) har et rødt kryds, der lukker det
  (Niels: "det er bare rart at kunne lukke en besked når man leger"). En kort
  besked, fx om metallerne på fane 1, åbner det igen. Niels: "great succes".
