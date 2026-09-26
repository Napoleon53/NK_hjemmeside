# Ion-Tetris (sc_spil_iontetris)

Tetris, hvor de farvede brikker er ioner og de grå er sten. Ioner, der rører hinanden,
bliver til salt, når ladningerne går lige op; saltet smuldrer til pulver og forsvinder.
Stenene forsvinder kun i fulde rækker. Man vinder ved at lave alle saltene i panelet.
Kategorien Spil (`kemi-c-filer/samling_c_spil.html`). Afløser den gamle
`c_spil_iontetris.html`, der ligger i `kemi-c-filer/arkiv/`.

## Bestillingen

1. **Pointen:** en ionforbindelse er neutral, så ionerne samles i det forhold, der
   får ladningerne til at gå lige op (Al³⁺ og tre Cl⁻ bliver til AlCl₃).
2. **Afløser og hvad der er med:** den gamle ion-tetris. Med er ionerne (Na⁺, Mg²⁺,
   Al³⁺, Cl⁻, O²⁻, N³⁻), at et neutralt salt forsvinder, de grå sten, tallet over
   ioner, der venter på en partner, reaktionen skrevet som ionligning (Al³⁺ + 3 Cl⁻ →
   AlCl₃), næste brik og stigende fart. Ude er de lodrette pinde uden drejning og
   eksplosionerne, der gjorde store forbindelser alt for fordelagtige.
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

## Reglerne

* **Salt:** ioner, der hænger sammen, bliver til salt, når de er præcis én
  formelenhed: én slags positiv og én slags negativ ion i det rigtige forhold. Ikke
  alle behøver at røre den positive ion. Kan flere grupper reagere, vælges den, der
  har den nye brik med, så den mindste, så den ældste. Sten stopper reaktionen.
* **Pulver og tyngdekraft:** saltet forsvinder efter `D.PULVER_TID`. Brikker (også
  sten), der ikke længere hviler på noget, falder ned hele, én række pr. `D.FALD_TID`.
  Rører ioner så nye partnere, er det en kædereaktion.
* **Fulde rækker:** forsvinder som i almindelig tetris (alt ovenover rykker én ned).
  Det er den eneste måde at fjerne sten på. En fuld række tager også ioner med; en
  ion, der forsvinder helt, kommer igen som den næste ion i køen.
* **Rækkefølgen efter hver brik:** salt, pulver og fald, så fulde rækker, og forfra,
  til der ikke sker mere. Imens venter den næste brik.
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
| Tal over ioner, der venter | ja | ja | nej |
| Grøn skygge, hvor brikken bliver til salt | ja | nej | nej |
| Hint i linjen under brættet | ja | ja | nej (den sidste reaktion) |

**Farverne:** plus er blå, minus er rød, og jo større ladning, jo mørkere: Na⁺
lyseblå, K⁺ turkis, Mg²⁺ blå, Al³⁺ mørkeblå, Cl⁻ lyserød, Br⁻ orangerød, O²⁻ rød,
N³⁻ mørkerød. Sammensatte ioner skilles af tonen (OH⁻ lyserød, NO₃⁻ koral, SO₄²⁻
hindbær, PO₄³⁻ mørk vinrød). Stenene er grå med prikker og har intet symbol.

## Balancen

En robotspiller (i Claudes scratchpad, ikke i mappen) lægger hver brik det bedste sted
uden tidspres. Resultater 26. sept. 2026 (vundne spil ud af 5 eller 6):

| Sten | Let | Middel | Svær |
|------|-----|--------|------|
| 3 af 4 | 0 af 11 (2-4 af 9 salte) | 0 af 8 | 0 af 8 |
| 1 af 2 | 4 af 6 (ca. 90 brikker) | 0 af 6 | |
| 1 af 3 | 5 af 6 | 3 af 6 | 1 af 6 |
| 1 af 4 | | 5 af 6 (ca. 100 brikker) | 0 af 6 |
| 1 af 6 | | | 6 af 6 (ca. 240 brikker) |

Kun sten (femfeltsbrikker) holdt robotten i ca. 47 brikker. 3 af 4 kan derfor ikke
vindes, og andelen er sat pr. sværhedsgrad til Let 1/2, Middel 1/4 og Svær 1/6. Tallet
står som `sten` i `D.NIVEAUER`. En elev med tidspres vinder sjældnere end robotten.

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
| `js/kemi.js` | formler, ionligninger og reaktionssøgningen (tegner ikke) |
| `js/braet.js` | ioner og sten, drejningen, saltet, tyngdekraften og fulde rækker (tegner ikke) |
| `js/spil.js` | ét spil: posen, tasterne, tiden, kæden, sejr og hint |
| `js/tegning.js` | tegner brættet, stenene, pulveret, gem og køen |
| `js/lyd.js` | små lyde lavet i koden (`NK.Spillyd`; `NK.Lyd` er Kemichaels) |
| `js/laerer.js`, `js/praesentation.js`, `js/sprites.js` | Kemichael |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/app.js` | faner, taster, knapper, panel og tegneløkken |
| `_selvtest.html` | selvtesten |

## Det kan rettes uden at røre koden

Alt i `js/data.js`: hvilke ioner der falder og deres farver (`D.NIVEAUER`,
`D.IONER`), andelen af sten (`sten`), farten (`start`, `faktor`,
`D.BRIKKER_PR_NIVEAU`), hjælpen (`maerker`, `glimt`, `hint`), hvor tit de manglende
salte kommer (`D.MANGLER`), og hvad Kemichael og linjen under brættet siger
(`D.INTRO`, `D.SLUT`, `D.BESKED`). Alle par af positive og negative ioner på en
sværhedsgrad skal være rigtige salte, for alle skal laves for at vinde (derfor er NH₄⁺
ikke med sammen med OH⁻ og O²⁻).

## Forenklinger

* Ionernes ladning bestemmer ikke brikkens form; alle ioner har fire felter.
* En formelenhed skal hænge sammen, men ikke alle ioner behøver at røre hinanden.
* Et salt af to slags positive ioner (fx Na⁺, Mg²⁺ og N³⁻) dannes ikke, selv om
  ladningerne går lige op. Linjen under brættet siger det på Let og Middel.
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
reglen for salt, pulveret og tyngdekraften, stenene (18 forskellige, drejning, stopper
reaktioner, fjernes af fulde rækker), at en ion, der forsvinder med en række, kommer
igen, posen (neutral, andelen af sten, manglende salte oftere), kædereaktionen i et
helt forløb, sejren og tiden som rekord, ni hele spil med ladningsregnskabet efter
hver brik, knapperne og tilbuddet, Kemichaels præsentation og sproget. Sidst: ALT OK
(26. sept. 2026).

## I menuen

I menuen fra 26. sept. 2026 som spil.iontetris (nr. 6) i
`kemi-c-filer/samling_c_spil.html` og i `FEEDBACK_EMNER`. Den gamle ligger i
`kemi-c-filer/arkiv/c_spil_iontetris_oldversion.html`.
