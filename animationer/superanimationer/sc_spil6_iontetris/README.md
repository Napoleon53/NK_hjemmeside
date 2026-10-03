# Ion-Tetris (sc_spil6_iontetris)

Tetris, hvor de farvede brikker er ioner og de grå er sten. En positiv og en negativ
ion, der rører hinanden, får en gul ramme om sig, til ladningerne går lige op; så bliver
de til salt, som smuldrer til pulver og sprænger de grå felter, det ligger op ad.
Fulde rækker forsvinder som i tetris. Man vinder ved at lave alle saltene i panelet.
Kategorien Spil (`kemi-c-filer/samling_c_spil.html`). Afløser den gamle
`c_spil_iontetris.html`, der ligger i `kemi-c-filer/arkiv/`.

## Bestillingen

1. **Pointen:** en ionforbindelse er neutral, så ionerne samles i det forhold, der
   får ladningerne til at gå lige op (Al³⁺ og tre Cl⁻ bliver til AlCl₃).
2. **Afløser og hvad der er med:** den gamle ion-tetris. Med er ionerne (Na⁺, Mg²⁺,
   Al³⁺, Cl⁻, O²⁻, N³⁻), at et neutralt salt forsvinder, de grå sten, tallet over
   ioner, der venter på en partner, reaktionen skrevet som ionligning (Al³⁺ + 3 Cl⁻ →
   AlCl₃), næste brik og stigende fart. Ude er de lodrette pinde uden drejning og
   de store eksplosioner, der gjorde store forbindelser alt for fordelagtige. Fra 3.
   okt. 2026 sprænger saltet igen sten, men kun de felter, det ligger op ad.
3. **Naboerne:** `sc2.2_saltbygger` ejer opbygningen af salte og formler i ro og mag,
   `sc2.3_kemikalielageret` navnene, `sc2.4_faeldningsreaktioner` opløseligheden.
   Her er der kun formler, ingen navne og ingen opløselighed.
4. **Loftet:** tre faner (Let, Middel, Svær) med samme spil, ét bræt på 10 × 20, de
   syv tetrisbrikker til ioner og de 18 pentominoer til sten, højst ni ioner, et
   panel med tre kort.
5. **Layoutet:** scene plus panel. Brættet står i midten med Gem til venstre og
   Næste til højre, som i almindelig tetris.

## Brugerens ønsker

* 24. sept. 2026: mindre underlig, flere ligheder med almindelig tetris,
  sværhedsgrader, store ionforbindelser skal nerfes.
* 25. sept. 2026: rækker, der forsvinder, og salt, der bliver liggende som sten, er
  for kompliceret. Et neutralt salt skal blive til pulver og gå ud af spillet.
  Positive ioner i blå nuancer, negative i røde.
* 26. sept. 2026: for nemt. Designet beholdes, men: grå, inaktive sten med fem felter
  i alle de mulige former, der kun forsvinder ved klassisk tetris (fulde rækker); man
  vinder ved at lave alle saltene i panelet; Let får flere simple ioner (K⁺ og Br⁻).
  Brugeren foreslog "måske" 3 af 4 brikker som sten (se Balancen).
* 3. okt. 2026: godt, men måske lidt for svært. Saltet skal fjerne nogle af de grå
  blokke. Reglerne er uklare, når flere slags ioner rører hinanden: Mg²⁺ op ad Cl⁻
  skal have en ramme, saltet dannes først, når endnu en Cl⁻ rører rammen, og andre
  ioner, der rører rammen, påvirkes ikke. Musik til spillet (Suno, i løkke). Nummer i
  spilmappernes navne efter rækkefølgen i menuen.

## Reglerne

* **Rammen:** en fri positiv og en fri negativ ion, der rører hinanden, får en gul
  ramme. Rammen hører til ét salt (Mg²⁺ og Cl⁻: MgCl₂) og venter på resten af én
  formelenhed. Går de to straks lige op (Na⁺ og Cl⁻), bliver de til salt uden ramme.
* **Rammen vokser:** en fri ion af en slags, rammen mangler, kommer med, når den rører
  en af rammens ioner. Ikke alle behøver at røre den positive ion. Når ladningerne går
  lige op, bliver rammens ioner til salt.
* **Andre ioner påvirkes ikke:** ioner i en ramme er optaget. Na⁺ op ad Cl⁻ i rammen
  med Mg²⁺ bliver liggende som fri ion. På Let og Middel siger linjen under brættet,
  hvad rammen mangler.
* **Valg:** rører en ion både en ramme, der mangler den, og en fri ion, går den i
  rammen (helst den ramme, der bliver færdig, så den ældste). Ellers får den en ramme
  med en fri ion (helst den, der straks giver salt, så den ældste). To rammer af samme
  salt, der rører hinanden og tilsammen højst er én formelenhed, smelter sammen.
  Sten stopper alt.
* **Pulver, sprængning og tyngdekraft:** saltet forsvinder efter `D.PULVER_TID` og
  sprænger de stenfelter, der ligger side mod side med det (`D.SPRAENG`). En sten, der
  bliver slået i stykker, bliver til flere sten. Brikker, der ikke længere hviler på
  noget, falder ned hele, én række pr. `D.FALD_TID`; ionerne i en ramme falder samlet.
  Rører ioner så nye partnere, er det en kædereaktion.
* **Fulde rækker:** forsvinder som i almindelig tetris (alt ovenover rykker én ned) og
  tager både sten og ioner med; en ion, der forsvinder helt, kommer igen som den næste
  ion i køen. Mister en ramme en ion på den måde, eller rører dens ioner ikke længere
  hinanden, opløses rammen, og ionerne er frie igen.
* **Rækkefølgen efter hver brik:** rammer og salt, pulver og fald, så fulde rækker, og
  forfra, til der ikke sker mere. Imens venter den næste brik.
* **Målet:** alle saltene i panelet (Let 9, Middel 9, Svær 18). Rekorden er den
  hurtigste tid (`nk-iontetris-tid` i browseren). Et salt giver ingen point; der er
  ingen point i spillet.
* **Slut:** når den næste brik ikke kan komme ind på brættet.
* **Niveauer:** for hver 30 brikker stiger niveauet, og brikkerne falder hurtigere.
* **Køen:** sten og ioner blandes i poser på tolv, hvor andelen `sten` er sten. Stenene
  kommer i poser med alle 18 former, ionerne i poser med alle syv. Ionerne kommer i
  hele formelenheder, så ladningerne altid går op. Et salt, der ikke er lavet endnu,
  vælges `D.MANGLER` (10) gange så tit; store salte lidt sjældnere (`D.VAEGT`).

| | Let | Middel | Svær |
|--|-----|--------|------|
| Ioner | Na⁺, K⁺, Mg²⁺, Cl⁻, Br⁻, O²⁻ | Na⁺, Mg²⁺, Al³⁺, Cl⁻, O²⁻, N³⁻ | Na⁺, Mg²⁺, Al³⁺, Cl⁻, O²⁻, OH⁻, NO₃⁻, SO₄²⁻, PO₄³⁻ |
| Salte at lave | 9 | 9 | 18 |
| Sten | hver anden brik | hver fjerde | hver sjette |
| Fald på niveau 1 | 1,1 s pr. række | 0,9 s | 0,75 s |
| Køen | ét salt ad gangen | ét salt ad gangen | to salte blandet |
| Gul ramme om ioner, der venter | ja | ja | ja |
| Tal over rammen (ladningen, den har tilbage) | ja | ja | nej |
| Grøn skygge, hvor brikken bliver til salt | ja | nej | nej |
| Hint i linjen under brættet | ja | ja | nej (den sidste reaktion) |

**Farverne:** plus er blå, minus er rød, og jo større ladning, jo mørkere: Na⁺
lyseblå, K⁺ turkis, Mg²⁺ blå, Al³⁺ mørkeblå, Cl⁻ lyserød, Br⁻ orangerød, O²⁻ rød,
N³⁻ mørkerød. Sammensatte ioner skilles af tonen (OH⁻ lyserød, NO₃⁻ koral, SO₄²⁻
hindbær, PO₄³⁻ mørk vinrød). Stenene er grå med prikker og har intet symbol.

## Balancen

En robotspiller (`_robot.js`, køres med `node _robot.js 40 200`) kører spillets egen
kode uden browser og lægger hver brik det bedste sted uden tidspres. Kør den, før der
skrues på `sten` eller `D.SPRAENG`. Tallene svinger et par spil fra kørsel til kørsel.

26. sept. 2026 blev andelen af sten sat: 3 af 4 (brugerens forslag) kunne ikke vindes
(0 af 11 på Let), så den blev Let 1/2, Middel 1/4 og Svær 1/6 (`sten` i `D.NIVEAUER`).

3. okt. 2026, vundne spil ud af 40 for en robot, der sjusker (dens vurdering af hvert
træk får tilfældig støj på 200, så den ligner en elev mere end en perfekt spiller):

| | Let | Middel | Svær |
|--|-----|--------|------|
| Før: gamle regler, ingen sprængning | 2 | 20 | 3 |
| Rammer, ingen sprængning (16 spil) | 1 | 4 | 0 |
| Rammer, `D.SPRAENG = 1` (valgt) | 20 | 34 | 26 |
| Rammer, `D.SPRAENG = 1.5` | 34 | 37 | 23 |
| Rammer, `D.SPRAENG = 2` | 33 | 40 | 33 |

Rammerne alene gør spillet lidt sværere, fordi en ion i en ramme ikke kan bruges til
andet. Sprængningen gør det lettere. Brugeren skrev "lidt for svært", så det mindste
trin er valgt: saltet tager kun de felter, det ligger side mod side med. Er det stadig
for svært, er næste trin 1.5 (også felterne på skrå). Den perfekte robot vinder 11 til
12 af 12 både før og efter. En elev med tidspres vinder sjældnere end robotten.

## Kemichael

Præsenterer hver sværhedsgrad med tilbuddet Start præsentation / Nej tak
(`js/praesentation.js`, ens i alle superanimationer). Tre replikker i `D.INTRO`; på
anden replik peger han på saltene i panelet. Når spillet er slut, går han ind og
siger én replik (`D.SLUT`: rekord, vundet, mindst halvdelen af saltene eller færre).
Baggrundslivet er slået fra, så han aldrig går hen over brættet under spillet.

## Filer

| Fil | Indhold |
|-----|---------|
| `index.html` | toplinje, scene, panel, reglerne og rundvisningen |
| `css/stil.css` | grundreglerne fra sc2.4 plus brættet, kortet midt på og panelet |
| `js/kerne.js` | fælles hjælpefunktioner (kopi fra sc2.4) |
| `js/data.js` | ioner og farver, sværhedsgrader, sten, fart og alle tekster |
| `js/kemi.js` | formler, ionligninger og reglen for rammer og salt (tegner ikke) |
| `js/braet.js` | ioner og sten, drejningen, rammerne, saltet, sprængningen, tyngdekraften og fulde rækker (tegner ikke) |
| `js/spil.js` | ét spil: posen, tasterne, tiden, kæden, sejr og hint |
| `js/tegning.js` | tegner brættet, rammerne, stenene, pulveret, gem og køen |
| `js/lyd.js` | små lyde lavet i koden og baggrundsmusikken (`NK.Spillyd`; `NK.Lyd` er Kemichaels) |
| `_robot.js` | robotspilleren til balancen (udviklerværktøj, køres med node) |
| `musik.mp3` | baggrundsmusikken, klippet til en løkke på 80 takter (se Musik) |
| `js/laerer.js`, `js/praesentation.js`, `js/sprites.js` | Kemichael |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/app.js` | faner, taster, knapper, panel og tegneløkken |
| `_selvtest.html` | selvtesten |

## Det kan rettes uden at røre koden

Alt i `js/data.js`: hvilke ioner der falder og deres farver (`D.NIVEAUER`,
`D.IONER`), andelen af sten (`sten`), farten (`start`, `faktor`,
`D.BRIKKER_PR_NIVEAU`), hvor meget sten saltet sprænger (`D.SPRAENG`: 0 ingen, 1 side
mod side, 1.5 også på skrå, 2 to felter ud), musikken (`D.MUSIK`, `D.MUSIK_STYRKE`),
hjælpen (`maerker`, `glimt`, `hint`), hvor tit de manglende
salte kommer (`D.MANGLER`), og hvad Kemichael og linjen under brættet siger
(`D.INTRO`, `D.SLUT`, `D.BESKED`). Alle par af positive og negative ioner på en
sværhedsgrad skal være rigtige salte, for alle skal laves for at vinde (derfor er NH₄⁺
ikke med sammen med OH⁻ og O²⁻).

## Musik

`musik.mp3` i mappen spilles i løkke, mens der spilles, holder pause sammen med spillet
(Fortsæt tager tråden op, hvor den slap) og følger lydknappen (M). Den hentes først,
når et spil starter med lyden slået til. Findes filen ikke, er der ingen musik, og
intet andet ændrer sig. Styrken er `D.MUSIK_STYRKE` (0 til 1), sat til 0.2, så spillets
egne lyde kan høres over musikken.

Nummeret er lavet af brugeren i Suno 3. okt. 2026 ("A Minor Arpeggio", 118 slag i
minuttet). Originalen (2 min 54 s med en afslutning og stilhed til sidst) ligger i
`C:\NK_Undervisning\Iontetris-musik\` sammen med scriptet, der klippede den. Filen her
er 80 takter (2 min 43 s): takt 2 til 80, og til sidst en takt, hvor takt 81 toner ud,
mens takt 1 toner ind. Slutningen går derfor takt i takt over i starten.

Afspilningen sker fra en buffer i Web Audio, som gentager uden pause. Et
`<audio>`-element med `loop` laver et lille hak ved overgangen; det bruges kun, når
filen ikke kan hentes med `fetch`, altså når spillet åbnes fra harddisken. Skal der ny
musik på, skal den nye fil klippes på samme måde; ellers høres afslutningen og en
pause, hver gang den starter forfra.

## Forenklinger

* Ionernes ladning bestemmer ikke brikkens form; alle ioner har fire felter.
* En formelenhed skal hænge sammen, men ikke alle ioner behøver at røre hinanden.
* En ramme hører til det salt, de to første ioner giver, og kan ikke skifte. To slags
  positive ioner kommer aldrig i samme ramme.
* Sprængningen tager kun stenfelter, aldrig ioner.
* N³⁻ (nitrid) er med fra den gamle udgave, selv om nitrider sjældent nævnes på C.
* Efter en fuld række rykker alt ned som i tetris, men når salt forsvinder, falder
  brikkerne hele. Det er to forskellige regler for tyngden, valgt fordi de hver især
  er det, man forventer.

## Tastatur

← → flyt, ↑ eller X drej, Z drej modsat, ↓ ned, mellemrum slip, C eller Shift gem,
P, Enter eller Esc pause, 1 2 3 sværhedsgrad, H rundvisning, K Kemichael, M lyd.
Direkte link: `index.html#let`, `#middel`, `#svaer`. På touchskærme vises knapper
under brættet. Spillet holder pause, når vinduet mister fokus.

## Test

`_selvtest.html` gennem en lokal server med `animationer/` som rod (Kemichael
hentes fra `../../v2/kemichael/`). Den tjekker formlerne (også KBr, K₂O og MgBr₂),
reglen for rammer og salt (rammen venter, en fremmed ion påvirkes ikke, rammen går
forud for en fri ion, to rammer smelter sammen, en række opløser en ramme, `proev`
ændrer intet), pulveret, sprængningen (felterne side mod side, stenen i stykker,
`D.SPRAENG` 0, 1 og 1.5), tyngdekraften (en ramme falder samlet), stenene (18
forskellige, drejning, stopper reaktioner, fjernes af fulde rækker), at en ion, der
forsvinder med en række, kommer igen, posen (neutral, andelen af sten, manglende salte
oftere), kædereaktionen i et helt forløb, sejren og tiden som rekord, ni hele spil med
ladningsregnskabet og rammerne efter hver brik, hintene, knapperne og tilbuddet,
musikken uden fil, Kemichaels præsentation og sproget. Sidst: ALT OK, 95 påstande
(3. okt. 2026). Musikken er prøvet for sig med testsider uden for mappen: den spiller
fra bufferen, går fremad i rigtig tid, holder pause og fortsætter samme sted, følger
lydknappen og stopper, når vinduet mister fokus; det samme med `<audio>`-elementet og
med en fil, der ikke findes. Sømmen er målt i den afkodede fil: præcis 80 takter, ingen
stilhed i enderne, intet klik, og stortrommen ligger samme sted før og efter.

## I menuen

I menuen fra 26. sept. 2026 som spil.iontetris (nr. 6) i
`kemi-c-filer/samling_c_spil.html` og i `FEEDBACK_EMNER`. Mappen hedder
`sc_spil6_iontetris` fra 3. okt. 2026 (nummeret er pladsen i menuen). Den gamle ligger i
`kemi-c-filer/arkiv/c_spil_iontetris_oldversion.html`.
