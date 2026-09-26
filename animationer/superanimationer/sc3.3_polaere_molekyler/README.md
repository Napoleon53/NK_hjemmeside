# sc3.3: Polære molekyler

**Status: i menuen** fra 26. sept. 2026 som c3.3 ("Polære molekyler") i
`samling_c3.html` og `samling_NV.html`. Den gamle ligger i
`kemi-c-filer/arkiv/c3.3_elektronegativitet_oldversion.html`.

Åbn **`index.html`**. Mappen er selvstændig bortset fra Kemichael, der hentes
fra `../../v2/kemichael/`. Den bruger hverken `fetch` eller moduler og virker
derfor også, når den åbnes direkte fra harddisken.

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

Alle faner har et opgavekort med én knap: Start opgave → Giv hint → Vis svaret →
Ny opgave. På fane 3 er opgaverne låst, til skemaet er udfyldt. Teorien ligger bag
knappen **Teori**, og **?** starter en rundvisning for den aktive fane.

Kemichael præsenterer hver fane, når eleven siger ja til tilbuddet (Start
præsentation / Nej tak). Replikkerne står i `D.INTRO` i `js/data.js`. Mens han
præsenterer fane 1, rykker atomerne til højre, så taleboblen ikke dækker dem.

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
<kbd>T</kbd> teori · <kbd>K</kbd> Kemichaels præsentation · <kbd>R</kbd> start
fanen forfra · <kbd>H</kbd> rundvisning · <kbd>Esc</kbd> luk eller Nej tak.

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
                      DPR-skarpt canvas, hukommelse og hjælpere til Kemichael
js/data.js            grundstoffer og grænser, molekyler, væsker, teori, INTRO
js/sprites.js         indlæser sprites/*.svg og Kemichaels sprites
js/frastoedning.js    placerer de frie elektronpar (samme som sc3.2)
js/model3d.js         kameraet og tegningen af molekylerne; pilene
js/prikformel.js      prikformlen i hjørnet på fane 2
js/opgave.js          opgavekortet med én knap
js/valg.js            det valgte molekyle på fane 2
js/sim_en.js          fane 1: tovtrækningen, tabellen og opgaverne
js/molsim.js          NK.MolSim: et molekyle i 3D (fra sc3.2 uden vinkelmåler)
js/sim_polaritet.js   fane 2
js/vand_tegning.js    fane 3: alt, der tegnes, og scenens mål
js/sim_vandstraale.js fane 3: haner, stråle, stave, skema og opgaver
js/tegneserie.js      fane 3: forsøget som tegneserie
js/laerer.js          Kemichael på de tre faner
js/praesentation.js   tilbuddet om præsentationen (ens i alle superanimationer)
js/rundvisning.js     spotlight-rundvisningen
js/app.js             faneskift, overlays, Kemichaels lag, tastatur, tegneløkke
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
hele forløbet til tegneserien); at alle opgaver kan løses; tilbuddet om
Kemichaels præsentation; og at ingen tekst bruger tankestreger, skriver ladning
som 1+ eller er under 12 px. Den kræver en lokal server, fordi Kemichael hentes
uden for mappen.

## Linjen til menuen

Når brugeren siger til, skiftes linjen for c3.3 i `kemi-c-filer/samling_c3.html`
(og `samling_NV.html`, hvis den har den) til
`../superanimationer/sc3.3_polaere_molekyler/index.html` med titlen
"Polære molekyler".
