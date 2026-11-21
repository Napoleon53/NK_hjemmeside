# sc6.2 Formel og aktuel koncentration

Superanimation om ionerne i en saltopløsning: et salt giver sine ioner i
det forhold, formlen angiver, så [ion] = tallet foran ionen ·
c(salt). Kommer en ion fra to salte, lægges bidragene sammen, og blander
man to opløsninger, lægges stofmængderne sammen. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv.
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** den formelle koncentration c(salt) er saltets stofmængde
   pr. liter. Ionernes aktuelle koncentration er tallet foran ionen i
   opløsningsskemaet gange c(salt), og tallet kommer fra formlen.
2. **Afløser** `kemi-c-filer/c6.3_animationer_aktuelkonc_master2.html` og
   `kemi-c-filer/c6.4_opgaver_aktuelkonc.html` (brugerens valg 25. sept.
   2026: emne 6 bliver to superanimationer, sc6.1 og sc6.2). Med fra c6.3:
   træk salt ned i vandet og ram en ions koncentration, saltene NaCl,
   Na₂SO₄, FeCl₃, K₃PO₄ og Al₂(SO₄)₃, to salte med en fælles ion og
   søjlerne med ionernes koncentration (fane 2 i den gamle; her står de
   ved siden af glasset). Med fra c6.4: opgaverne fra formel til aktuel
   koncentration (KI, CaCl₂, BaCl₂, Al₂(SO₄)₃), afstemningen af
   opløsningsskemaet, fra masse til ioner (Pb(NO₃)₂ 4,14 g i 250 mL),
   baglæns (Na₃PO₄ med [PO₄³⁻] = 0,15 M) og blandingerne (CaCl₂ og AlCl₃;
   100 mL CaCl₂ og 200 mL NaCl). Ud: bonus-quizzerne med svarmuligheder
   (de er blevet til gæt på fane 1 og forklaringer ved fejl) og
   fortyndingen med ioner (c6.4 opgave 7; fortynding ejes af sc6.1).
   **Rettet:** i den gamle c6.4 opgave 5 blev to opløsninger "blandet", og
   bidragene blev lagt sammen, som om rumfanget ikke ændrede sig. Her er
   den opgave formuleret som to salte i det samme glas, og blandinger af
   to glas regnes med stofmængder og det samlede rumfang.
3. **Naboerne:** `sc6.1_koncentration` ejer c = n / V, opløsningens
   fremstilling og fortynding. `sc2.2` og `sc2.3` ejer, hvordan saltets
   formel bygges af ionerne. `sc2.4` ejer fældning. Her bruges formlen,
   ikke hvordan den dannes.
4. **Loftet:** 3 faner og 15 salte. Fane 1: 6 opgaver, højst 2 krukker og
   5 søjler. Fane 2: 3 niveauer med nye opgaver hver gang. Fane 3: 4
   opgaver med 4 sæt tal hver, højst 3 glas.
5. **Layoutet:** scene plus panel som `sc6.1`.

9. okt. 2026 (brugerens valg): Kemichael ved katederet er taget helt ud
(han hører til i laboratoriet). Scenen har fået hans bånd, og hintknappen
er gul, så eleven altid kan finde hjælpen selv.

**Hint og svar.** Den gule knap i opgavekortet er hjælpen: Giv hint skriver
hintet i linjen lige over knappen, og knappen bliver til Vis svaret (kun et
omrids, så den ikke frister), der skriver svaret og næste skridt i samme
linje. Efter et forkert svar lyser den gule knap stille op, til linjen
skifter igen. Der er ingen Kemichael og ingen knapper til præsentationen.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Opløsningen | trækker portioner salt ned i et literglas og ser luppen og søjlerne | et salt giver ionerne i formlens forhold |
| 2 | Ionerne | skriver tallene foran ionerne i skemaet og så ionernes koncentrationer, i tre niveauer | [ion] = tallet foran ionen · c(salt), også baglæns og fra massen |
| 3 | Blandinger | regner en ion, der kommer fra to salte | bidrag i samme glas lægges sammen; ved blanding lægges stofmængderne sammen |

**Opløsningen.** Et literglas med vand (0,50 eller 1,00 L) og én eller to
krukker. En portion er 0,10 mol; den kan trækkes ned i glasset, eller man
kan klikke på krukken. Luppen viser altid lige meget væske: én kugle er
0,05 M af en ion (se "Scenen" nedenfor). Søjlerne viser saltets koncentration (grå) og hver ions,
og en stiplet linje viser målet. Panelet har kun opgavekortet og
opgavelisten. De seks opgaver: NaCl (én til én), Na₂SO₄ (tre
spørgsmål i små trin), FeCl₃ (tre Cl⁻), K₃PO₄ (tre K⁺ i 0,50 L),
Al₂(SO₄)₃ (gæt, hvilken ion der er flest af) og to salte med Na⁺ til
[Na⁺] = 0,50 M. Opgaveteksten er "Lav en opløsning, hvor [Cl⁻] = 0,30 M."
Er der kommet for meget i, siger linjen hvorfor og Start forfra.

**Beregningen i kortet** (brugerens ønske 4. okt. 2026: der foregik for
meget i panelet, og beregningerne stod akavet i linjen). Kortet Glasset
med skemaet og de løbende tal er taget ud. Når glasset viser målet, står
beregningen under opgaveteksten, skrevet som skolens superberegning
(`beregningHTML` i `js/sim_opl.js`): formlen først (c = n / V med
brøkstreg), så tallene med enheder, det beregnede på venstre side,
lighedstegnene under hinanden, opløsningsskemaet, [ion] = tallet foran ·
c(salt) og til sidst en konklusion i ord (`konklusion` i `D.OPL`). Med to
salte står c = n / V én gang, og skemaerne er udeladt. Linjen under
beregningen roser kort og siger, hvordan et gæt gik; svarknapperne fra
gættet er væk, når opgaven er løst.

**Na₂SO₄ i små trin** (brugerens ønske 29. sept. 2026: "Der indgår 3
forskellige størrelser og et antalsforhold"). Først kommer saltet i
glasset (0,10 mol i 0,50 L), så tre spørgsmål med svarmuligheder, ét ad
gangen (`spm` i `D.OPL`): c(Na₂SO₄) = n / V, hvor mange Na⁺ én Na₂SO₄
giver, og [Na⁺]. Glasset viser kun det, der er svaret på: den grå søjle
efter c, ionerne i luppen efter antallet og ionernes søjler efter [Na⁺].
Beregningen i kortet vokser på samme måde: c(Na₂SO₄), så skemaet, så
[Na⁺]. Linjen roser og siger det næste. Et forkert svar bliver slået fra
og forklaret (0,10 M: det er stofmængden n). Mens spørgsmålene står, kan
der ikke komme mere salt i, og Start forfra er væk.

**Ionerne.** Let: salte med 1 : 1, 1 : 2 og 2 : 1 (NaCl, KI, CaCl₂, MgCl₂,
BaCl₂, Na₂SO₄, K₂SO₄, Na₂CO₃). Middel: 1 : 3, 3 : 1 og 2 : 3 (FeCl₃, AlCl₃,
K₃PO₄, Na₃PO₄, Al₂(SO₄)₃), og hver anden opgave er baglæns: en ions
koncentration er målt, og saltets og den anden ions skal findes. Svær:
fra massen (molarmassen, n = m / M og c = n / V med formlen først) til
ionerne. Første opgave på hvert niveau er den fra den gamle c6.4; Ny
opgave giver et nyt salt og nye tal. Tallene foran ionerne skrives i to
felter i skemaet; beskeden ved en fejl kender fejlene (ladningen i stedet
for antallet, O inde i sulfat-ionen, parentesen). Tavlen viser skemaet og
de pæne beregninger, søjlerne kommer, når tallene er fundet, og luppen
fyldes til sidst. Opgaveteksten giver først tallene og siger så vejen:
"Før ionernes aktuelle koncentrationer kan findes, skal
opløsningsskemaet afstemmes." (brugerens ønske 4. okt. 2026: før stod
"Find ionernes koncentrationer" først, selv om første trin er skemaet).
På Svær skal c(salt) beregnes først, og baglæns nævner linjen c(salt) og
den anden ion.

**Blandinger.** Samme rumfang, forskelligt rumfang, en ion, der kun er i
det ene glas, og til sidst to salte i ét glas (bidragene lægges sammen).
Rækkefølgen er byttet 21. nov. 2026, så fanen ikke begynder med en
beregning i mange trin med to salte. Første opgave er trinvis (se "Svarene
i kortet" nedenfor).

**To salte i ét glas** (brugerens ønske 29. sept. 2026: eleverne blander c
og n sammen) starter fra saltene: fx 5,55 g CaCl₂ og 4,00 g AlCl₃ ligger
på to vægte ved siden af et bægerglas med 200 mL vand. Syv trin: n af hvert
salt (m / M, molarmassen står på tavlen), c af hvert salt (n / V), bidraget
til [Cl⁻] fra hvert salt og summen. Når n er fundet, står stofmængden over
bunken; når c er fundet, bærer spatlen saltet over i vandet. Masserne er
valgt, så n og c bliver pæne tal (selvtesten tjekker det). Fejlene, der
blander c og n, har egne beskeder: c = stofmængden, c = m / V og et bidrag
regnet med n i stedet for c. I
stofmængden skal tallet foran ionen med: n(Cl⁻) = 2 · c · V for CaCl₂.
Når stofmængderne er fundet, hældes A og B i blandingsglasset, og det
samlede rumfang aflæses på glasset (runde 5); når
koncentrationen er fundet, viser luppen ionerne. De typiske fejl har egne
beskeder: koncentrationerne lagt sammen, kun det ene rumfang, rumfanget i
mL, tallet foran ionen glemt og ionen fra det ene glas, der ikke er
fordelt i det hele.

**Formlen** tjekkes som i sc6.1 ved at regne den ud med faste prøvetal.
[Cl⁻] i firkantet parentes læses som en koncentration, og (A), (B),
V(samlet) og (NaCl) er etiketter. **Tallet** er rigtigt, når det højst er
1 % fra facit (molarmassen 0,06 g/mol).

Direkte links: `index.html#ioner` og `index.html#bland`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning ·
<kbd>R</kbd> start forfra eller nye tal · <kbd>Enter</kbd> tjek feltet eller
næste opgave · <kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (som sc6.1 plus skemaet med felter). NB: decimaltal med PUNKTUM i CSS
sprites/            literglasset (nyt); bægerglasset, vægten og vejebåden (som sc6.1), flasken
                    (som sc7.2), krukken (som sc5.5), spatlen og luppen (som sc2.1)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc5.5)
js/data.js          atommasserne, ionerne, saltene, opgaverne og niveauerne, regnetrinene og replikkerne
js/kemi.js          glasset på fane 1, opløsningsskemaet og facit på fane 2 og 3
js/tjek.js          skemaet, formlen og tallet i hvert trin, de typiske fejl og de pæne beregninger
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, krukken, spatlen, vægten, glassene, flasken, søjlerne og luppen
js/fane.js          det, fanerne deler (som sc6.1, plus niveauerne på fane 2)
js/regning.js       regnetrinene i kortet (skemaet, formlen og tallet) og tavlen
js/sim_opl.js       fane 1
js/sim_ioner.js     fane 2
js/sim_bland.js     fane 3
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Atommasserne** står i `D.ATOMMASSE` i `js/data.js`. **Ionerne** står i
`D.IONER` med navn, ladning og farve i luppen. **Saltene** står i
`D.SALTE`: kationen og anionen og tallet foran hver i skemaet (`kk`, `ka`);
formlen skal have parenteser om sammensatte ioner med et tal efter, fx
`Al2(SO4)3`. **Opgaverne** står i `D.OPL` (fane 1; `spm` er spørgsmålene
efter opløsningen, `regn` de ioner, beregningen viser, og `konklusion`
dens sidste linje), `D.NIV` (fane 2: saltene og tallene, der trækkes
blandt, og den første opgave `std`) og `D.BLAND` (fane 3: sæt af tal; V i
mL, masserne i g). **Beskederne ved fejl** står i `js/tjek.js`
(`T.afstem`, `regler` og `kandidater`).

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at 11
molarmasser passer med tabellen, at ladningerne går lige op i alle 15
salte, og at tallet foran kationen er tallet i formlen, at glasset regner
[ion] rigtigt med to salte, at svaret i fane 1's opgaver rammer målet, at
60 tilfældige opgaver på fane 2 og alle tal på fane 3 kan skrives som
svar, at masserne i fane 3's første opgave giver pæne tal, at 21 fejl i
skemaet, formlerne og tallene giver den rigtige besked, at sproget holder
reglerne, at alle tre faner kan gennemføres med musen og ved at skrive
(også med gæt, spørgsmålene i små trin, for meget salt, hint og svar), at
glasset på fane 1 først viser det, der er svaret på, at beregningen i
kortet har formlen, tallene med enheder og konklusionen (og først kommer,
når opgaven er løst), at opgaveteksten på fane 2 nævner skemaet først, at
saltene først kommer i vandet og glassene først hældes sammen, når det er
regnet, at hint og svar kun kommer fra den gule knap og står i
opgavekortet, at knappen lyser op efter en fejl, og at
layoutet holder fra 520 × 380 til 1500 × 900. Afsnit 8b tjekker papirkortet.
Afsnit 7b tjekker den trinvise første opgave på fane 3: at glassene kun
hældes ved elevens klik eller træk, at luppen og linjerne på tavlen kommer
efter det rigtige trin, at trinene kan klares med forkerte svar,
hinttrappen og Vis svaret, at scenen er låst under et spørgsmål, at kortets
plads er den samme i hele opgaven, og at alt er fremme, når opgaven er
løst. Afsnit 7, 8 og 8b tjekker felterne og svarknapperne på kortet på
fane 2 og 3, og afsnit 9, at panelet er smalt, at intet overlapper fra
1100 × 620 til 1600 × 950, at hele beregningen kan stå på tavlen på fane 1,
og at der intet svarfelt er i panelet. Afsnit 4 holder teksterne i den
trinvise opgave og formlerne på kortet på sc7.5's tegngrænser.
Afsnit 10 tjekker scenen fra runde 3: at hver ion i luppen er en kugle med
formlen inde i (mindst 13,5 px), at ingen formel står uden for luppen (ingen
legende), at luppen er stor og står over blandingsglasset, at glassene har
etiketterne A, B og Blandingen og ingen tekst under sig, at tavlen står i
højre side uden "OPGAVENS TAL", overskrift og "trin mere", og at hver linje
har et navn i ord.
Afsnit 7b dækker også starten fra runde 4 (trin 1 og 2 kan kun klares ved
klik på det rigtige glas, kun det glas har rammen, og spørgsmålet om
ionerne), og afsnit 11 opgavelisten (kommende opgaver uden titel kan ikke
klikkes, titlen kommer, når opgaven nås) og krukken (lige ved glasset, med
rammen og boblen).
Sidst kørt 21. november 2026: ALT OK (201 påstande).

## Papirkortet (6. nov. 2026)

Brugerens beslutning 4. nov. 2026: alle aktive animationer har papirkortet
(`../faelles/papirkort.css` og `papirkort.js`, `<body class="papirkort">`).
`js/fane.js` er hentet fra sc6.1 og har fået niveauerne fra fane 2 med.
Afsnittene ovenfor om opgavekortet, linjen over knappen og "Beregningen i
kortet" beskriver den gamle udgave; nu gælder dette:

* På alle tre faner står opgaven, spørgsmålet, svarene, hintet, beskeden ved en
  fejl, forklaringen og knapperne på ét lyst kort øverst i midten af scenen
  (`#opl-skort`, `#ioner-skort`, `#bland-skort`). Der er ingen linje nederst og
  intet opgavekort i panelet. Giv hint er en stille knap med gul kant.
* Fane 1: gættet står stort på kortet og virker med det samme (et gæt er
  gratis); et klik i scenen før gættet får kortet til at blinke. En opgave med
  et mål for en ion ("Lav en opløsning, hvor [Cl⁻] = 0,30 M") løses ikke længere
  af sig selv: eleven fylder glasset og trykker Indsend svar. Opgaverne med
  portioner går videre af sig selv, for de er en handling, ikke et svar.
  Spørgsmålene efter opløsningen vælges på kortet og sendes med Indsend svar.
  Efter et rigtigt svar bliver kortet på spørgsmålet med svaret grønt,
  forklaringen under og Næste spørgsmål, hvor Indsend svar stod. Et forkert svar
  koster stjernen (CLAUDE.md: stjerne kun for første forsøg). Beregningen står
  på en lille tavle i scenen (se "Svarene i kortet" nedenfor).
* Fane 2 og 3: se "Svarene i kortet" nedenfor (21. nov. 2026). Panelet har
  kun opgavelisten.
* Lærredet sætter pladsen øverst af til kortet (`kortZone`, ZONE i
  `js/sim_*.js`), og kortet får mere plads, hvis teksten kræver det.
* Ingen molekylenavne at rette (stoffer som O₂ og Cl₂ nævnes ikke).

## Svarene i kortet (21. nov. 2026, runde 2)

Brugeren 21. nov. 2026, efter at have prøvet den første trinvise udgave af
Blandinger: "man bliver stadig forvirret, når der efterfølgende bliver
spurgt ind til formler og så sker der noget 5-6 steder.. hvor skal man
egentlig kigge hen. Måske skal sidefanen være mindre? og måske skal svarene
aldrig angives heroppe i panelet?" Han valgte: svarene på kortet på alle tre
faner, først valg og så skrive på Blandinger, og et smallere panel.

Eleven kigger nu to steder: **kortet** (spørgsmålet og svarene) og **tavlen**
(regnestykket vokser linje for linje, og den linje, kortet spørger om, har
den gule ramme). Panelet har kun opgavelisten, Nye tal og Start forfra og er
300 px bredt (`--panel-bredde` i `css/stil.css`; 290 px er det mindste, hvor
linjerne står på én linje i Chrome på Linux, og 300 px giver luft til
andre systemers skrift).

* **Fane 2 og 3** (`js/regning.js`): En formel vælges blandt tre svar på
  kortet (den rigtige og to typiske fejl, `D.FORMELVALG` i `js/data.js` og
  `T.formelValg` i `js/tjek.js`). Et tal skrives i et felt på kortet under
  spørgsmålet, fx "n(Cl⁻) fra A = [ tallet ] mol", og skemaet har to små
  felter ("CaCl₂(s) ⟶ [ ] Ca²⁺(aq) + [ ] Cl⁻(aq)"). Beskederne ved fejl er
  de samme som før (`T.trin` og `T.afstem`). Efter et rigtigt svar bliver
  kortet på spørgsmålet med svaret grønt, forklaringen under og Næste.
  Etiketten tæller formlen og tallet som to trin, fx "Trin 3 af 7". Kortets
  plads bliver i hele opgaven så stor, som kortet har været (`kortZone` i
  `js/fane.js`), så scenen ikke hopper.
* **Fane 3, tavlen**: Kun de løste linjer og den, kortet spørger om, står på
  tavlen (se "Scenen" nedenfor om runde 3).
* **Fane 3, første opgave (Samme rumfang)** er trinvis i seks trin, når den
  ikke er løst før (`start` i `D.BLAND`, koden i `js/sim_bland.js`):
  1. Eleven hælder glas A og glas B over i det tomme glas (klik eller træk;
     "Klik: hæld" står over glassene). Blandingsglasset viser 200 mL, og
     luppen Blandingen kommer frem med Na⁺, K⁺ og Cl⁻ (før har den en stiplet
     plads).
  2. "Hvor stort er det samlede rumfang i blandingsglasset?" (200 mL, 100 mL,
     400 mL; fra runde 5 aflæses det, se nedenfor).
     Tavlen får V = 200 mL = 0,200 L.
  3. "Hvilken formel giver stofmængden af Cl⁻ fra glas A?" (n = c · V,
     n = c / V, n = V / c).
  4. "Hvor mange mol Cl⁻ kommer der fra glas A?" (0,0200 mol, 20,0 mol med
     rumfanget i mL, 0,200 mol, som er koncentrationen).
  5. Det samme for glas B.
  6. "Hvad er [Cl⁻] i blandingen?" (0,200 M, 0,400 M med koncentrationerne
     lagt sammen, 0,100 M med Cl⁻ fra kun det ene glas). Rosen siger, at der
     er dobbelt så mange Cl⁻ i dobbelt så stort rumfang.

  Tavlen læses oppefra i den rækkefølge, eleven svarer (V, n fra A, n fra B,
  [Cl⁻]). Hvert trin har tre hint (Giv hint, Næste hint, Næste hint, Vis
  svaret), og hvert forkert svar har sin egen forklaring. De forkerte tal
  regnes af opgavens tal (`talValg`), så Nye tal også virker. Et klik i
  scenen under et spørgsmål får kortet til at blinke. Er opgaven løst før,
  eller er eleven på en senere opgave, regnes den som de andre. Nye tal på
  den uløste første opgave giver trinene igen. Runde 2 afløser de to
  spørgsmål fra runde 1 (hvilke salte giver Cl⁻, og hvordan lægges de
  sammen).
* **Fane 1**: Beregningen står på en lille tavle øverst til venstre i
  scenen, over glasset og krukken (`lay.tavle` og `tilpasTavle` i
  `js/sim_opl.js`, `.scenetavle` i `css/stil.css`). Pladsen er altid sat af,
  så intet flytter sig, når den dukker op, og skriften skrumper, til det hele
  kan være der. Konklusionen i ord står kun i kortets grønne forklaring.
  Kortet selv ville blive for højt med beregningen, og så ville scenen hoppe.
  Start forfra står i panelet under opgavelisten.
* Indledningen på kortet på fane 2 og 3 går gennem `NK.Papir.tekst` sammen med
  spørgsmålet (`kortHTML` i `js/fane.js`), så spørgsmålet står halvfedt på sin
  egen linje. Trinnavnet står ikke længere som løs sætning foran spørgsmålet
  ("Stofmængden af CaCl₂. Hvilken formel ..."). Ved første trin siger kortet
  "Første trin er stofmængden af CaCl₂."

## Scenen (21. nov. 2026, runde 3)

Brugeren efter runde 2: "Jeg synes at den hvide tavle er forvirrende og
indforstået. Jeg kunne godt tænke mig at glassene og bogstaverne er mere
tydelige. Jeg synes mikrofiguren er et skridt tilbage i forhold til
tidligere animationer. [...] Tavlen gerne rykkes lidt over i højre side.
Mikrofiguren skal ikke indeholde legender, men være så stor at legenderne
ligger inde i ionerne." Det gælder alle tre faner:

* **Luppen** (`T.zoom`, `T.kugle` og `Partikler` i `js/tegning.js`) er som i
  sc2.1 og sc6.3: hver ion er en blank kugle med formlen inde i (14 til 17 px),
  en sammensat ion er én kugle, og Cl⁻ er større end Na⁺. Der er ingen legende.
  Kuglerne skubber til hinanden, så formlerne kan læses. Luppen er større, og
  en gul kegle går fra et felt i glasset, flasken eller blandingsglasset op
  til luppen (`T.zoomKegle`, som sc6.3), så man ser, hvor luppen kigger.
* **Glassene på Blandinger** er tegnet tydeligere (`T.glasTydelig`): tykt glas,
  svagt blå væske og store skalastreger. Hvert glas har en etiket af lyst papir
  med store, sorte bogstaver (`T.etiket`): "A", saltet og koncentrationen, og
  "Blandingen" på det tomme glas. De små grå tekster under glassene er væk; i
  To salte i ét glas står saltets navn på en seddel foran vægten. På Ionerne
  står massen og rumfanget på flaskens etiket på Svær.
* **Tavlen** (`tegnTavle` i `js/regning.js`, `T.papir` i `js/tegning.js`) er et
  roligt stykke lyst papir i højre side af scenen på Ionerne og Blandinger,
  uden genskin, uden "OPGAVENS TAL" (tallene står på glassene og flasken), uden
  overskrift og uden "trin mere". Den tegnes først, når kortet spørger om den
  første linje, og vokser linje for linje. Hver linje har et navn i ord over
  regnestykket (`T.tavleNavn` i `js/tjek.js`), fx "Cl⁻ fra glas A" og
  "n = c · V = 0,200 M · 0,100 L = 0,0200 mol". Linjen, kortet spørger om, har
  "?" og den gule ramme. Skriften og papirets højde måles med alle linjer
  løst, så intet skifter, når en linje dukker op.
* **Fane 1** beholder tavlen med beregningen øverst til venstre, fordi luppen
  og søjlerne står i højre side. Den er nu lyst papir uden overskrift, og hver
  del har et navn i ord ("Koncentrationen af NaCl", "Opløsningsskemaet",
  "Cl⁻ i glasset").
* **Layoutet på Blandinger**: kortet øverst, glassene langs bordet til venstre
  og i midten (Blandingen forrest, så A og B), luppen over blandingsglasset og
  tavlen til højre. Selvtesten tjekker, at intet overlapper fra 1100 × 620 til
  1600 × 950.

## En let start, krukken og opgavelisten (21. nov. 2026, runde 4)

Brugeren efter runde 3: Starten på Blandinger "lyder ikke særlig nemt at
tilgå", krukken på fane 1 var "gemt komisk langt væk" med en svag pil, og
opgavenavnene skal være mere sigende og låses op i takt med, at eleven kommer
videre ("husk dette", nu i CLAUDE.md).

* **Blandinger, første opgave** har otte trin og begynder med det konkrete,
  én handling ad gangen (`start.haeld` og `start.ioner` i `D.BLAND`):
  1. "Glas A og glas B har to forskellige saltopløsninger." **Klik på glas A
     for at hælde det over i det tomme glas.** Kun glas A har den gule ramme
     og boblen "Klik: hæld" (`T.ramme` og `T.boble` i `js/tegning.js`, som
     krukken i sc6.1). Et klik på glas B hælder intet.
  2. **Klik på glas B for at hælde det over i det samme glas.** Nu har glas B
     rammen. Kortet går selv videre, når et glas er hældt over (det er en
     handling, ikke et svar).
  3. Luppen kommer frem. "Luppen viser blandingen." **Hvilke ioner er der i
     blandingen?** (Na⁺, K⁺ og Cl⁻; NaCl og KCl; Kun Cl⁻.)
  4. Først her kommer målet: "Nu skal du finde koncentrationen af Cl⁻ i
     blandingen, [Cl⁻]." **Hvor stort er det samlede rumfang i blandingsglasset?**
  5. til 8. Formlen, Cl⁻ fra glas A og B og [Cl⁻] som i runde 2 og 3.

  Kortet til trin 1 og 2 er kort: Giv hint står ved teksten (`kompakt` i
  `js/fane.js` og `css/stil.css`), og opfordringen står halvfedt (`fed`).
* **Krukken på fane 1** står lige ved siden af glasset og er større
  (`layout` i `js/sim_opl.js`). Så længe opgaven venter på salt
  (`venterPaaSalt`), har krukken en gul ramme og boblen "Klik: en portion";
  med to krukker har begge rammen. Den svage pil er væk.
* **Opgavelisten** (`bygListe` og `visListe` i `js/fane.js`) har sigende
  titler med en kort undertekst (`under` i `D.OPL`, `D.NIV` og `D.BLAND`), fx
  "Natriumchlorid" / "Lav [Cl⁻] = 0,30 M". De kommende opgaver står som et
  nummer med en grå streg, uden titel, og kan ikke klikkes, før eleven er nået
  dertil (en løst opgave, også gemt i browseren, eller én, eleven har været
  ved; Vis svaret tæller som løst). Niveauerne på Ionerne vælges frit og er
  altid synlige.

## Det gamle niveau og rumfanget (21. nov. 2026, runde 5)

Brugeren: "det er ikke så tydeligt længere hvor meget man tilsatte, fordi man
ikke kan se det på figuren.. måske bør der være en lille stiplet linje ved
100 mL", og om rumfanget: "man kan jo normalvis ikke bare lægge 2 voluminer
sammen.. [...] Måske skal der bare stå noget ala. Hvad er totalvoluminet? og
så skal man svare 200 mL .. men der skal ikke komme en beregning, der viser
det."

* Når glas A og glas B er hældt over, har hvert glas en stiplet gul linje ved
  det gamle niveau med rumfanget skrevet ved ("100 mL"); etiketten bliver
  (`gammelV` i `T.glasTydelig`). Det gælder alle opgaver på Blandinger.
* Kortet spørger "Hvor stort er det samlede rumfang i blandingsglasset?", og
  eleven aflæser det: i første opgave med tre svar, i de andre i et felt i mL.
  Tavlen viser kun "V = 200 mL = 0,200 L". "V = V(A) + V(B)" og
  "100 mL + 100 mL" er væk overalt (tavle, hint, forklaringer, ros, Teori).
  Hints peger på skalaen på blandingsglasset, og de forkerte svar forklares
  med det, man ser (rumfanget i glas A før hældningen, den øverste streg).
* I opgave 2-4 hældes glassene over, når begge stofmængder er fundet, så
  rumfanget kan aflæses, før kortet spørger om det.
* Selvtesten (afsnit 12) tjekker linjerne ved det gamle niveau og, at ingen
  tekst lægger rumfang sammen på nogen opgave.

## Forenklinger

* Alle salte regnes som helt opløst og helt delt i ioner. Der er ingen
  hydrolyse (FeCl₃, AlCl₃, Na₂CO₃, Na₃PO₄) og ingen ionpar.
* I modellen er rumfanget af en blanding summen af de to rumfang, og rumfanget
  af en opløsning er rumfanget af vandet. Det passer kun godt, fordi
  opløsningerne er fortyndede. Animationen viser det ikke som en regel: eleven
  aflæser det samlede rumfang på blandingsglasset, og ingen tekst lægger
  rumfang sammen (runde 5).
* Jern(III)chlorid farver opløsningen gul; de andre salte er farveløse.
* Luppen viser én kugle for hver 0,05 M af en ion (mindst én, højst 14 af hver).
  Bliver der mere end ca. 20 kugler i opgaven, eller er luppen lille, er én
  kugle 0,10 eller 0,20 M (`T.skala` i `js/tegning.js`).
* Atommasserne har to decimaler (som sc5.1). Koncentrationer skrives med
  tre betydende cifre, masser og molarmasser med to decimaler.

## I menuen

I menuen fra 26. sept. 2026 som c6.2 i `kemi-c-filer/samling_c6.html`. De gamle
ligger i
`kemi-c-filer/arkiv/c6.3_animationer_aktuelkonc_master2_oldversion.html` og
`kemi-c-filer/arkiv/c6.4_opgaver_aktuelkonc_oldversion.html`. Mohrtitreringen er
rykket op som c6.3 og er fra 28. sept. 2026 superanimationen `sc6.3_mohrtitrering`
(gamle links med c6.5 finder den).
