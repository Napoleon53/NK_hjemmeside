# sc7.3 pH-beregninger

Superanimation, hvor eleven selv regner mellem pH, [H₃O⁺] og [OH⁻] og fra en
stærk syre eller base til pH. Den har en indbygget lommeregner, der viser,
hvordan den har læst det tastede, og som kan vise det samme som Maple-kode.
Åbn `index.html`. Mappen henter kun filer inde fra sig selv, bortset fra
Kemichael (`../../v2/kemichael/kemichael.js`). Ingen `fetch` og ingen moduler,
så den virker fra harddisken.

Ny 25. sept. 2026. I menuen fra 26. sept. 2026.

## Bestillingen

1. **Pointen:** pH og [H₃O⁺] er det samme tal skrevet på to måder,
   pH = −log[H₃O⁺] og [H₃O⁺] = 10⁻ᵖᴴ. Til [OH⁻] kommer man via vands
   ionprodukt, og ved en stærk syre eller base står koncentrationen på flasken.
2. **Afløser** `kemi-c-filer/c7.3_pH_beregninger.html`. Med fra den gamle: de
   fem niveauer (find pH, find [H₃O⁺], find [OH⁻], stærke syrer, stærke
   baser, nu fordelt på tre faner), hverdagsstofferne, trinene for stærke
   baser (afstem, [OH⁻], [H₃O⁺], pH), felterne med "· 10" og eksponenten for
   sig, og lommeregner-tippet, der nu er en rigtig lommeregner. Ud: point og
   streak, historikken og de lange indledninger om hvert stof.
3. **Naboerne:** `sc7.2` ejer skalaen og "ét trin er en faktor ti" (uden
   log). `c7.1` ejer syre-base-reaktionerne. Svage syrer, pOH og puffere er
   ikke med.
4. **Loftet:** 3 faner. De 12 hverdagsstoffer fra sc7.2 med samme pH. 2
   stærke syrer og 4 stærke baser. På scenen: ét glas eller én flaske, én
   etiket, ét pH-meter og regnevejen med 3 stationer (5 på fane 3). Højst 4
   trin i en opgave.
5. **Layoutet:** scene plus panel som sc7.2. Lommeregneren står i panelet
   under opgavekortet på alle tre faner.

Brugerens valg (25. sept. 2026): faner efter retning, lommeregneren med én
linje som på en TI og linjen "læst som" under, Maple i lommeregneren og i
svarene, og hjælpen i tre trin (hint, tasterne, svaret). Samme dag gav
brugeren en tilbagemelding på sc7.4 om, at eleven selv skal skrive formlerne
og kun få dem som hint.

Brugerens tilbagemelding efter første udgave (25. sept. 2026): for mange pile
fra starten, Kemichael og teksterne var for indforståede for en svag elev
(fx "Cola. Tallene står på etiketten."), og opgaverne skulle hakkes op i små
bider med et tydeligt næste skridt. Derfor: regnevejen vokser med opgaven,
hvert trin er delt i tre bider (vælg formlen, tast, skriv), lommeregneren
siger til, når tallet er rigtigt, og alle tekster siger næste skridt ligeud.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Find pH | etiketten giver [H₃O⁺], eleven regner pH, og pH-metret måler bagefter | pH = −log[H₃O⁺] |
| 2 | Find koncentrationen | pH-metret har målt, eleven regner [H₃O⁺] og så [OH⁻] og skriver dem på etiketten | [H₃O⁺] = 10⁻ᵖᴴ, og K<sub>w</sub> giver [OH⁻] |
| 3 | Stærke syrer og baser | flasken siger fx 0,050 M HCl eller 0,015 M Ca(OH)₂, eleven regner trin for trin frem til pH, og pH-metret måler | en stærk syre giver [H₃O⁺] = c; en stærk base giver [OH⁻] = n · c |

**Regnevejen** står øverst og vokser med opgaven. Fra start står kun det, man
kender (fyldt ud), og det, man skal finde (gult ?), med en svag stiplet linje
og et ? imellem. Pilen kommer først, når eleven har valgt den rigtige formel:
den vokser frem med formlen på. Den næste station kommer, når opgaven når den
(på fane 2 kommer [OH⁻] i trin 2; på fane 3 kommer [H₃O⁺] og pH, efterhånden
som basen regnes igennem). Det regnede får et grønt flueben. Stationerne står
fast: [OH⁻] til venstre, [H₃O⁺] i midten, pH til højre og c over dem på fane
3. Et klik på en station eller pil forklarer den under scenen.

**Kortet** (etiketten) hænger på glasset eller flasken. Det givne står på
tryk, og elevens svar skrives med blå skrift, når de er rigtige (gul, hvis
svaret blev vist). **pH-metret** måler til sidst på fane 1 og 3 og viser det
samme tal som facit; på fane 2 måler det først.

**Opgavekortet** deler hvert trin i små bider, én ad gangen:

1. **Vælg formlen**: tre knapper (fire ved pH af en base), hvor de forkerte er
   de typiske fejl (uden minus, den modsatte vej, gange i stedet for dele,
   −log[OH⁻]). En forkert formel streges ud og forklares.
2. **Tast udregningen**: "Skriv 5,0 · 10⁻³ i stedet for [H₃O⁺] i formlen …".
   Når lommeregneren giver det rigtige tal, siger panelet det ("Rigtigt regnet.
   Lommeregneren viser 2,301029996"), og bidden får et flueben. Giver den en
   typisk fejl (fx −2,30), siger panelet, hvad der er galt.
3. **Skriv svaret**: rund af, og skriv det. pH i ét felt; en koncentration i
   to: tallet foran "· 10" i det store felt og eksponenten i det lille. Det
   store felt tager også hele tallet (0,00038, 3,8e-4, 3,8·10^-4, 3,8 · 10⁻⁴).

Feltet kan bruges, så snart formlen er valgt, så en elev med sin egen
lommeregner kan springe bid 2 over, og regner eleven rigtigt uden at vælge
formlen, er formlen klaret. Trin uden formel (afstemningen) har kun bid 3, og
trin uden regning ([H₃O⁺] = c) har ikke bid 2. Et rigtigt trin bliver til den
pæne beregning på én linje, fx `pH = −log(5,0 · 10⁻³) = 2,30` og
`[OH⁻] = 1,0 · 10⁻¹⁴ M² / 3,8 · 10⁻⁴ M = 2,6 · 10⁻¹¹ M` (med brøkstreg), og
det næste trin kommer. Linjen under scenen siger altid næste skridt ("Trin 2
af 4: tast udregningen på lommeregneren, og tryk =.").

**Knappen** hjælper med den bid, man er ved: **Giv hint** (i almindelige ord),
og så **Vis formlen**, **Vis tasterne** (lommeregneren taster selv, én tast
pr. 0,4 s, og tasterne lyser op) eller **Vis svaret**. Til sidst **Ny
opgave**, altid en anden end den forrige. "Løst" tæller opgaver, hvor Vis
svaret ikke er brugt.

**Et forkert svar** får en forklaring, der passer til fejlen: minusset foran
log mangler, ln i stedet for log, log kun af mantissen, positiv eksponent,
kun tierpotensen, 14 − pH, 10^(+pH), e^(−pH), kun heltallet af pH, cifrene
rigtige men tierpotensen forkert, ganget med K<sub>w</sub> i stedet for delt,
brøken vendt om, manglende parentes om nævneren (1,0 · 10⁻¹⁴/4,0 · 10⁻¹² =
2,5 · 10⁻²⁷), K<sub>w</sub> uden minus, [H₃O⁺] i stedet for [OH⁻], glemt at
gange med 2 ved Ca(OH)₂ og −log[OH⁻] som pH. Ellers: "Se i lommeregneren,
hvordan den har læst det, du tastede." Rigtigt med én decimal eller et andet
antal betydende cifre giver en note om to decimaler eller to betydende cifre.

## Lommeregneren

Én lommeregner, som `app.js` flytter ind i den aktive fanes panel, så Ans og
det tastede følger med fra fane til fane.

* **Linje 1** er det tastede på én linje som på en TI: `−log(5,0·10^(−3))`.
  Markøren blinker, og ◀ ▶ og ⌫ retter midt i. En ) for meget står rød.
* **Linje 2, "læst som"**, er det samme, som lommeregneren har læst det:
  eksponenter hævet, division som brøk, og en parentes, den selv lukker, er
  bleg. Uden parentes om nævneren ses det straks, at 10⁻¹² står uden for
  brøken. Et manglende tal vises som □. Efter = står resultatet med 10 cifre.
* **Taster:** log, 10ˣ (skriver `10^(`), ( ), cifre, komma, / · − +, Ans, ⌫,
  AC, ◀ ▶ og =. Efter = regner et regnetegn videre med Ans; − starter forfra,
  fordi mange udtryk her begynder med −log.
* **Fejl** står under linje 2: log af et negativt tal ("Skal minusset stå
  foran log?"), log(0), dele med 0, to kommaer, tom parentes, manglende tal.
* **Tastaturet** går til lommeregneren, når man ikke står i et svarfelt: cifre,
  komma og punktum, + - * / ^ ( ), L er log, A er Ans, Enter er =, Backspace,
  Delete er AC, pilene flytter markøren. Tasterne på skærmen tager ikke fokus
  fra et svarfelt.

**Maple** (knappen på lommeregneren eller M) viser det tastede som Maple-kode
med rødt input og blåt resultat, som i Maple: `-log10(5.0*10^(-3));` giver
2.301029996. Koden skrives ud fra det, lommeregneren har læst, med de
parenteser, Maple skal have, så den regner det samme: `1.0*10^(-14)/4.0*10^(-12)`
uden parentes, `1.0*10^(-14)/(4.0*10^(-12))` med. Ans bliver til `%`.
Er der intet komma i udtrykket, regner Maple eksakt; feltet viser så en brøk
(`10^(-3)` giver 1/1000) eller "et eksakt udtryk med ln" og en note om at
skrive 5.0 eller bruge evalf( ). Når Maple er slået til, har hint og svar
også Maple-linjen. Valget huskes i browseren.

## Kemichael

Han præsenterer hver fane, når eleven trykker Start præsentation (reglen i
`../README.md`). Replikkerne siger ligeud, hvad fanen går ud på, fordi den
første udgave var for indforstået: "Her finder du pH, når du kender [H₃O⁺]."
(han peger på kortet), "Følg trinene i opgaven, og brug lommeregneren." (den
lyser), "Til sidst tjekker pH-metret dit svar. Det snyder ikke." Fane 2:
pH-metret og opgaven. Fane 3: flasken og regnevejen. Han går kun ved den store knap,
to klik på ham eller Esc; K viser præsentationen igen. Efter fem opgaver, som
eleven selv har regnet på en fane, roser han tørt (én gang pr. browser).
Kaffekoppen er det fælles påskeæg. **Påskeæg:** giver lommeregneren 42, siger
han "42. Det er svaret, bare ikke på den her opgave."

Direkte links: `index.html#konc` og `index.html#staerk`.

Genveje: <kbd>T</kbd> teori · <kbd>H</kbd> rundvisning · <kbd>K</kbd>
Kemichaels præsentation · <kbd>M</kbd> Maple · <kbd>Esc</kbd> luk eller send
Kemichael ud. Resten af tastaturet går til lommeregneren (derfor skifter
1, 2 og 3 ikke fane her).

### Det nye i forhold til den gamle animation

* **Lommeregneren** med linjen "læst som" og Maple-koden. Den gamle skrev kun
  et tip som tekst.
* **Regnevejen**, der viser, at alle opgaver er den samme vej mellem de samme
  størrelser, og hvor langt man er.
* **pH-metret** måler og giver samme tal som elevens svar.
* **Forklaringer på de typiske fejl** i stedet for "Forkert [OH⁻]".
* **Hjælpen er én knap** i tre trin, og Vis tasterne viser, hvordan det tastes.
* **Opgaverne varierer** (pH ± 0,25 omkring stoffets typiske værdi), så
  der ikke er fem faste opgaver pr. niveau.

## Filer

```
index.html          markup for de tre faner, lommeregneren, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc7.2's). NB: decimaltal med PUNKTUM i CSS
sprites/            de tolv hverdagsstoffer, pH-metret og reagensflasken (fra sc7.2)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc7.2)
js/regner.js        lommeregneren: tokens, parser, regning, linje 2, Maple-koden og Vis tasterne
js/kemi.js          modellen: pH og koncentrationerne, trinene, tjekket og de typiske fejl
js/data.js          stofferne, flaskerne, teksterne under scenen og replikkerne
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, regnevejen (stationer og pile), etiketten, stofferne, pH-metret, flasken
js/sim_regn.js      de tre faner (én klasse, tre underklasser): opgaverne, scenen og opgavekortet
js/praesentation.js tilbuddet om Kemichaels præsentation (samme fil som i sc1.2)
js/laerer.js        Kemichael på alle tre faner og påskeægget
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, lommeregneren flyttes, teorien, tastaturet, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Stofferne** står i `D.STOFFER` i `js/data.js` (samme som sc7.2) og
**flaskerne** i `D.SYRER` og `D.BASER` med deres koncentrationer. De første
opgaver på hver fane står i `D.START_PH`, `D.START_KONC` og `D.START_STAERK`.
**Trinene** bygges i `js/kemi.js` (`K.trinPhAfH`, `K.trinHAfPh`,
`K.trinOhAfH`, `K.trinHAfOh`, `K.trinHAfSyre`, `K.trinNOh`, `K.trinOhAfBase`).
Hvert trin har sit hint, sin pæne beregning, Maple-koden, tasterne og listen
over typiske fejl (`fejl`: tal og besked). **Pilene** og deres formler står i
`PILE` øverst i `js/sim_regn.js`. **Replikkerne** står i `D.INTRO` og `D.ROS`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker tallene (pH, K<sub>w</sub>,
to betydende cifre), at lommeregneren læser udtrykkene rigtigt (brøk uden
parentes, manglende parentes, gange uden tegn, hul, fejlbeskeder, Ans), at
Maple-koden er rigtig (også eksakt uden komma), at svarene kan skrives på
mange måder, at 28 typiske fejl giver den rigtige forklaring, at tasterne i Vis
tasterne og Maple-koden giver facit i alle trin i 180 opgaver, at alle tre
faner kan gennemføres i små bider (formelvalg, lommeregnerens besked, hjælpen til hver bid, og regnevejen, der vokser), at
tastaturet går til lommeregneren og ikke til svarfeltet, at sproget holder
reglerne, at Kemichael kan vises og sendes ud, og at layoutet holder fra
520 × 380 til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files`. Den lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 25. september 2026: ALT OK (166 påstande).

## Forenklinger

* Alt er ved 25 °C, hvor K<sub>w</sub> = 1,0 · 10⁻¹⁴ M².
* Hverdagsstoffernes pH er typiske værdier (som i sc7.2); opgaven lægger op til
  0,25 til eller fra, så tallene varierer.
* Saltsyre og salpetersyre regnes som helt protolyserede, og baserne som helt
  opløste og dissocierede. Vandets egne ioner er ikke med; det ejer sc7.2
  (fortyndingen). Koncentrationerne er så store, at det ikke betyder noget.
* Calciumhydroxid kan kun opløses til ca. 0,02 M, derfor højst 0,020 M.
* Et trin regner videre med det afrundede tal fra trinet før (sådan som
  eleven skriver det). Tjekket godkender også tallet regnet uden afrunding
  (3 % for koncentrationer, 0,02 for pH).
* Maple-feltet efterligner Maples resultat med 10 cifre. Maple viser nogle
  gange flere nuller (0.040 i stedet for 0.04), og et eksakt udtryk med ln
  skrives ikke ud.
* K<sub>w</sub> skrives med w som i Basiskemi; den gamle animation skrev K<sub>v</sub>.

## Tilbuddet om præsentationen

Kemichael kommer ikke af sig selv. Første gang en fane åbnes, står der Start
præsentation og Nej tak midt foroven i scenen. Tilbuddet forsvinder også, når
eleven har regnet det første trin. Koden er `js/praesentation.js` (samme fil
som i sc1.2), koblet med `NK.Praesentation.kobl` på hver fanes underklasse
nederst i `js/sim_regn.js`.

## I menuen

I menuen fra 26. sept. 2026 som c7.3 i `kemi-c-filer/samling_c7.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c7.3_pH_beregninger_oldversion.html`.
