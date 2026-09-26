# sc5.1 Koncentration

Superanimation om stofmængdekoncentration: c = n / V. Mere stof giver en
højere koncentration, mere vand en lavere, og ved fortynding er
stofmængden den samme; kun rumfanget skifter. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js` og `../kemichael/superanimation.js`).
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** koncentrationen er stofmængde pr. liter, c = n / V. Mere
   stof giver højere c, mere vand lavere, og tapper man ud, er c den samme.
   Ved fortynding er n den samme før og efter.
2. **Afløser** `kemi-c-filer/c5.1_animation_stofmængdekoncentration.html` og
   `kemi-c-filer/c5.2_opgaver_stofmængdekoncentration1.html` (brugerens valg
   25. sept. 2026: emne 5 bliver to superanimationer, sc5.1 og sc5.2). Med
   fra c5.1: karret med kobber(II)sulfat, knapperne til stof og vand, tallene
   n, V og c og brøken c = n / V med tallene, der følger karret. Med fra
   c5.2: opgavetyperne (find c, n, V, fra masse til koncentration, hvor
   meget der skal afvejes, fortynding), stofferne (NaCl, KCl, CuSO₄, KMnO₄,
   Na₂CO₃), molarmassen, omregningen fra mL til L, mikroskopet med ionerne
   (nu luppen) og nye tal. Ud: mættet opløsning som pointe (ejes af
   `sc2.1_salt_i_vand`; her ligger det overskydende stof bare på bunden),
   inddampningen (i stedet kan man tappe ud) og quizzen med svarmuligheder.
3. **Naboerne:** `sc4.1` ejer molarmassen, `sc4.2` m = n · M, `sc2.1`
   opløselighed og mættet opløsning. `sc5.2_formel_og_aktuel` (afløser
   c5.3 og c5.4) ejer ionerne i et salt og blandinger; her bruges kun
   CuSO₄ med forholdet 1 : 1 i lupperne.
   `c5.5` (Mohrtitreringen) røres ikke.
4. **Loftet:** 3 faner og 5 stoffer. Fane 1: 5 opgaver, ét kar, én krukke,
   to haner, højst 24 Cu²⁺ i luppen. Fane 2: 6 opgaver med 3 eller 4 sæt tal
   hver. Fane 3: 5 opgaver, 3 pipetter og 3 målekolber.
5. **Layoutet:** scene plus panel som `sc4.5`, med den rolige Kemichael ved
   katederet i et bånd nederst i scenen.

Brugerens valg (25. sept. 2026): den rolige Kemichael som i sc4.5. Han
blander sig ikke: han siger kun noget ved Giv hint og Vis svaret, tier, når
trinnet er løst, og kan sendes ud. Ingen knapper til præsentationen.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Karret | trækker skefulde kobber(II)sulfat ned i karret, hælder vand i og tapper ud | c = n / V; mere vand giver det halve, udtapning ændrer intet |
| 2 | Målekolben | skriver formlen og tallet i hvert trin; vægten og kolben gør det, der er regnet | sådan laves en opløsning med en bestemt koncentration |
| 3 | Fortynding | gør en opløsning ti gange tyndere med pipette og målekolbe; regner fire fortyndinger | n er den samme, kun V skifter: c₁ · V₁ = c₂ · V₂ |

**Karret.** Et glaskar på 1 L med en tappehane forneden over en vask og en
vandhane over. En skefuld er 0,10 mol; den kan trækkes fra krukken ned i
karret, eller man kan klikke på krukken. Hanerne giver eller tapper 0,05 L
pr. tryk, og holder man musen nede, bliver de ved. Luppen viser altid lige
meget væske: én prik er 0,05 mol/L af hver ion, så antallet af Cu²⁺ i
luppen følger c. Panelet viser n, V og c = n / V med tallene. De fem
opgaver: gør den 0,40 M (mere stof), dobbelt så meget vand (gæt først),
tap halvdelen ud (gæt først), mere af den samme opløsning (både stof og
vand) og lav 0,60 L 0,50 M fra et tomt kar. I opgaverne med et gæt kan
hanerne først bruges, når eleven har gættet; forklaringen kommer, når karret
viser målet, og siger noget om netop det gæt. Hanen stopper selv, når karret
viser det rumfang, opgaven beder om. Er der kommet for meget i, siger linjen
Start forfra.

**Målekolben.** Seks opgaver: find c (n og V kendt), find n, find V (hvor
stor skal kolben være), fra masse til koncentration (molarmassen, n og c),
hvor meget der skal afvejes (KMnO₄) og fra koncentration til masse
(Na₂CO₃). I hvert trin skriver eleven formlen og så tallet (formlen først,
som i sc7.4). Molarmassen har kun tallet. Tavlen viser opgavens tal, og
hvert trin står som "n = ?", så med formlen og til sidst som den pæne
beregning. Scenen gør det, der er regnet: molarmassen kommer på krukken,
vægten vejer stoffet af, pulveret hældes i kolben, der fyldes op til
mærket, og kolben får en etiket. Skriver eleven en forkert masse, vejes den
af, og linjen siger, hvilken koncentration den ville give.

**Fortynding.** Flasken har 1,00 M kobber(II)sulfat. Første opgave gør
eleven selv: klik på en pipette (10, 25 eller 50 mL; den fyldes i flasken
og bliver stående), klik på en målekolbe (100, 250 eller 500 mL; pipetten
tømmes i den) og klik på sprøjteflasken (kolben fyldes op til mærket). Er
opløsningen ikke ti gange tyndere, siger linjen, hvor mange gange tyndere
den blev, og næste pipette tømmer kolberne. Flere portioner i samme kolbe
er tilladt. Resten regnes: koncentrationen efter (n = c₁ · V₁, c₂ = n / V₂),
hvor meget der skal pipetteres (n = c₂ · V₂, V₁ = n / c₁), hvor meget vand
der skal i et bægerglas (n, V₂ og V(vand) = V₂ − V₁; den typiske fejl er at
svare V₂) og fortyndingsformlen i ét trin (c₂ = c₁ · V₁ / V₂). To lupper
viser flasken (eller glasset før) og kolben (eller glasset nu).

**Formlen.** Formlen tjekkes ved at regne den ud med faste prøvetal, hvor
alle sammenhængene passer. Så er c · V, V · c, cV og n = c*V det samme, og
en omskrevet formel (n = c · V i trinnet for c) godkendes med den isolerede
vist. (NaCl), (før) og (efter) må stå i formlen. De typiske fejl (brøken
vendt om, ganget i stedet for divideret, V₁ i stedet for V₂, massen i stedet
for stofmængden) har deres egen besked.

**Tallet.** Et tal er rigtigt, når det højst er 1 % fra facit (molarmassen
0,06 g/mol). Beskeden kender fejlene: mL i stedet for L, brøken vendt om,
ganget i stedet for divideret, et glemt tal i formlen (Na₂CO₃), V₂ i stedet
for vandet, kommaet flyttet og "tæt på".

**Kemichael ved katederet.** Som i sc4.5: han sidder stille nederst til
venstre og siger kun noget ved Giv hint (til trinnet er løst) og Vis svaret
(til eleven skriver igen). Knappen Send Kemichael ud sender ham på
lærerværelset; så står hintene i opgavekortet. <kbd>K</kbd> får ham til at
sige, hvor man er.

Direkte links: `index.html#kolbe` og `index.html#fortynd`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichael siger, hvor man er ·
<kbd>R</kbd> start forfra eller nye tal · <kbd>Enter</kbd> tjek feltet eller
næste opgave · <kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.5's, felterne sc7.4's). NB: decimaltal med PUNKTUM i CSS
sprites/            karret, vandhanen, målekolben, pipetten og bægerglasset (nye); flasken (som sc7.2),
                    sprøjteflasken (som sc7.4), krukken, vægten, vejebåden og katederet (som sc4.5),
                    spatlen og luppen (som sc2.1)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.5)
js/data.js          atommasserne, stofferne, de tre fanes opgaver og tal, regnetrinene og replikkerne
js/kemi.js          karret (c = n / V, udtapning, det, der ligger på bunden), facit og tal som tekst
js/tjek.js          formlen og tallet i hvert regnetrin, de typiske fejl og de pæne beregninger
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, karret, hanerne, vasken, krukken, vægten, kolben,
                    pipetten, glasset, flasken, spatlen og luppen med ionerne
js/laerer.js        Kemichael ved katederet (som sc4.5)
js/fane.js          det, fanerne deler: opgavelisten, knappen, linjen i kortet, Kemichael og musen
js/regning.js       regnetrinene i kortet (formlen og tallet) og tavlen på fane 2 og 3
js/sim_kar.js       fane 1
js/sim_kolbe.js     fane 2
js/sim_fortynd.js   fane 3
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Atommasserne** står i `D.ATOMMASSE` i `js/data.js` i hundrededele; alle
molarmasser regnes af dem og formlen. **Stofferne** står i `D.STOFFER` med
navn, pulverets farve, opløsningens farve (null er farveløs) og ionerne i
luppen. **Opgaverne** står i `D.KAR`, `D.KOLBE` og `D.FORTYND`. På fane 1 er
`start` n i mol og V i mL, `maal` det, karret skal vise, og `goer` det,
karret gør ved Vis svaret. På fane 2 og 3 er `tal` de sæt tal, opgaven kan
have (det første bruges først; Nye tal trækker et andet), og V står altid i
mL. **Regnetrinene** (navn, venstreside, enhed, formel og hintet til
formlen) står i `D.TRIN`. **Replikkerne** står i `D.INTRO`, `D.FAERDIG`,
`D.ROS`, `D.ROS_OPGAVE` og `D.KAFFE`.

**Formlernes regler** (hvad trinnet finder, hvad man kender, de typiske
fejl) står i `F` i `js/tjek.js`, **talfejlene** i `kandidater`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at de fem
molarmasser passer med tabellen, at karret regner c = n / V rigtigt (også
ved udtapning og med stof på bunden), at facit i alle opgaver og alle tal
godkendes, når det skrives som i feltet, at beregningerne er pæne, at
pipetten og glasset passer til tallene, at 19 formler og fejl giver den
rigtige besked, at sproget holder reglerne, at alle tre faner kan
gennemføres med musen på lærredet og ved at skrive (også med hint, svar,
et forkert gæt, en forkert masse og en forkert fortynding), at Kemichael
kun taler ved hint og svar og kan sendes ud og hentes, og at layoutet holder
fra 520 × 380 til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files` og lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 25. september 2026: ALT OK (90 påstande).

## Forenklinger

* Kobber(II)sulfat regnes som CuSO₄ (159,61 g/mol), og pulveret tegnes
  blåt. Vandfrit CuSO₄ er hvidt; det blå er pentahydratet.
* Opløseligheden af CuSO₄ er sat til 1,2 M (ca. 20 g pr. 100 g vand ved
  20 °C, regnet pr. liter opløsning). Over den ligger resten på bunden.
* Rumfanget af opløsningen er rumfanget af vandet. Stoffet fylder ikke.
* Luppen viser én prik for hver 0,05 mol/L af hver ion (højst 30), og
  mindst én, når der er noget. Den er et billede af tætheden, ikke et antal.
* Atommasserne har to decimaler (som sc4.1), så M(KMnO₄) er 158,04 g/mol.
* Koncentrationer og stofmængder skrives med tre betydende cifre, masser
  og molarmasser med to decimaler. Et svar med flere cifre godkendes.
* Pipetten og målekolben er præcise. Der er ingen aflæsningsfejl.

## I menuen

I menuen fra 26. sept. 2026 som c5.1 i `kemi-c-filer/samling_c5.html`. De gamle
ligger i
`kemi-c-filer/arkiv/c5.1_animation_stofmængdekoncentration_oldversion.html` og
`kemi-c-filer/arkiv/c5.2_opgaver_stofmængdekoncentration1_oldversion.html`.
