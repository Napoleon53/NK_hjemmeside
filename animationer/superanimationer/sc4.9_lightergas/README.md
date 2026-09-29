# sc4.9 Lightergas

Superanimation om at bestemme en gas' molarmasse: gassen fra en lighter
samles over vand, lighteren vejes før og efter, og massen og rumfanget
giver molarmassen, der afslører, at lightergas er butan. Åbn
`index.html`. Mappen henter kun filer inde fra sig selv, bortset fra
Kemichael (`../../v2/kemichael/kemichael.js` og
`../kemichael/superanimation.js`). Ingen `fetch` og ingen moduler, så den
virker fra harddisken.

## Bestillingen

1. **Pointen:** den masse, lighteren taber, og det rumfang, gassen fylder,
   giver molarmassen: M = m / n med n = V / Vₘ, og molarmassen afslører,
   hvilken alkan der er i lighteren.
2. **Afløser** `kemi-c-filer/c4.9_eksperiment_lightergas.html`. Med fra
   den gamle: vægten, lighteren, der trækkes op på vægten og ned i vandet
   under måleglasset, gassen, der bobler op, aflæsningen af rumfanget,
   de tre tal i et skema, beregningen af m(gas), n (V / 24 L/mol eller
   idealgasligningen) og M, og søjlerne med methan til pentan, hvor
   elevens egen molarmasse står som en stiplet linje. Nyt: tørring på
   papir før anden vejning, en lup, der viser vandoverfladen i
   måleglasset, formlen først i hvert regnetrin, en ukendt gas og fanen
   Fejlkilder. Den store knap "HOLD NEDE" er blevet til et tryk på selve
   lighteren.
3. **Naboerne:** `sc4.6` ejer idealgasligningen (her kun som en anden vej
   til n), `sc4.2` og `sc4.3` ejer m = n · M, og `sc6.1` og `sc6.2` ejer
   alkanerne. Her bruges kun formlen CₙH₂ₙ₊₂ og molarmasserne.
4. **Loftet:** 3 faner. Fane 1: 1 lighter, 1 vægt, 1 kar med måleglas,
   1 lup, 2 målinger. Fane 2: 3 opgaver med 3 regnetrin og et valg
   blandt 5 alkaner. Fane 3: 6 fejlkilder, 2 grupper.
5. **Layoutet:** scene plus panel som `sc4.11`. Scenen er en fast scene
   på 900 × 650 enheder, der skaleres ind i lærredet.

Brugerens ønsker (27. sept. 2026): Kemichael præsenterer ikke. Der skal
være et par påskeæg, hvor forsøget går helt galt, og så kommer han med en
påtale. Lighteren kan tunes på den klassiske måde, men det står ingen
steder, og det skal være lidt svært at finde ud af. En tunet lighter har
20 % sandsynlighed for at tage vand ind.

Det er et forsøg bygget som superanimation (som `sc7.4` og `sc4.11`):
opstillingen står klar, der er ingen flasker, affaldsglas eller oprydning,
og Kemichael rydder ikke op. Uheldene er påskeæg, ikke en del af forløbet.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Forsøget | vejer lighteren, samler gassen i måleglasset, aflæser rumfanget, gætter, hvor meget lettere lighteren er blevet, tørrer den og vejer igen | lighteren bliver lettere med præcis den gas, der er i måleglasset |
| 2 | Beregningen | skriver formlen og tallet for m(gas), n(gas) og M(gas) og vælger alkanen | molarmassen afslører gassen |
| 3 | Fejlkilder | gætter, om gruppe B's molarmasse bliver højere, lavere eller den samme, og ser begge forsøg | vægten og måleglasset skal se den samme gas |

**Forsøget.** Lighteren står på bordet ved siden af vægten. Eleven trækker
den op på vægten og trykker på Aflæs vægten under skemaet (eller klikker
på vægten eller skriver tallet selv), så m(før) står i skemaet. Knappen
kom til 28. sept. 2026 efter brugerens første test: det var besværligt at
taste vægten. Den skriver det, vægten viser, og tjekker det som et tal,
eleven selv har skrevet, så en våd vejning stadig afvises. Målingens tre
felter er åbne hele tiden; et tal i den forkerte rækkefølge får en
forklaring i stedet for et låst felt, og m(efter) og V kan skrives i begge
rækkefølger (gættet kommer kun, når V står der først). Eleven trækker
lighteren ned i karret,
hvor den lander under det omvendte måleglas, og holder musen nede på den
(eller mellemrumstasten). Gassen bobler op og skubber vandet ned; luppen
viser vandoverfladen med en streg for hver 2 mL. V godkendes inden for én
streg, og kun når gassen står stille. Måling 1 har så et gæt: hvor meget
lettere er lighteren blevet (ca. 0,04 g, 0,4 g eller 4 g)? Op af vandet
er lighteren våd, og en våd vejning afvises med en forklaring. Papiret
tørrer den. m(efter) aflæses på vægten med samme knap. Målingerne huskes i browseren og
bruges på fane 2. Et klik på vægten, papiret, karret, måleglasset eller
luppen giver en kort forklaring.

**Lighteren kan mere, end der står.** Ingen tekst og ingen rundvisning
nævner det:

* Hætten kan trækkes af opad. De første 16 enheder sidder den fast og
  giver kun lidt efter. Den ligger så på bordet og kan sættes på igen.
  Den vejer 0,62 g, så en hætte, der ligger på bordet ved anden vejning,
  giver en for høj molarmasse.
* Uden hætte kan pinden på justeringsringen trækkes frem (+) og tilbage
  (−). Fabrikken har sat den på midten (24 mL/s). Trækkes den opad, løftes
  den af tænderne, og så kan den køres tilbage uden at lukke ventilen.
  Sænkes den og køres frem igen, er ventilen åbnet mere, end fabrikken
  tillader: den klassiske tuning. Åbningen er pindens plads plus det, der
  er vundet ved at løfte den, højst 4 (175 mL/s).
* Hjulet giver en gnist og en flamme (den brænder gas af, der aldrig kommer
  i måleglasset). Gasknappen under hjulet lukker gas ud i luften.

**Påskeæggene, hvor forsøget går helt galt.** Kemichael kommer ind forfra,
siger én tør replik (og, hvis målingen er i gang, at man bør starte
forfra) og går igen. Uheldet skrives i hans uheldsregnskab. Replikkerne
står i `D.PAATALE`.

* **Stikflammen:** hjulet på en tunet lighter. Første gang i en browser
  kommer glimtet om øjenbrynene fra 1994.
* **Vand i lighteren:** en tunet lighter under vand. Når knappen slippes,
  er der 20 % sandsynlighed for, at ventilen suger 0,38-0,62 g vand ind.
  Der rulles én gang pr. tur i vandet. Vandet ses i tanken, og vægten
  viser for meget bagefter.
* **Brandkuglen:** gas lukket ud på bordet med gasknappen (butan er tungere
  end luft og ligger og venter) og så en gnist. Over 30 mL gas i luften
  antændes det hele. Gassen blandes ud med en halveringstid på 7 s.

En tunet lighter under vand giver også store, hurtige bobler, hvor en del
stiger op ved siden af måleglasset, så molarmassen bliver for høj.
Forklaringen efter m(efter) siger, hvad der har ødelagt målingen: vand i
lighteren, hætten og gas, der brændte, slap ud i luften eller boblede
forbi.

**Beregningen.** Tre opgaver: måling 1 (formlen og tallet i hvert trin),
måling 2 (formlerne står der; kun tallene) og en ukendt alkan fra en
gasdåse (Nye tal skifter mellem methan, ethan, propan og butan). Har
eleven ikke målt selv, bruges et eksempel, og kortet siger det. Formlen
for n godkendes både som V / Vₘ og som p · V / (R · T); V / (1000 · Vₘ)
godkendes med en note om liter. Typiske fejl får hver sin besked: V i mL,
22,4 L/mol, omvendt brøk, ganget, M(gas), der ikke kendes endnu, og hele
lighterens masse. Tavlen viser Vₘ, opgavens tal og de pæne beregninger.
Når M er fundet, vælger eleven alkanen med en søjle eller en knap; et
forkert valg forklares ud fra molarmassen.

**Fejlkilder.** Gruppe A gør det rigtigt. Gruppe B vejer lighteren våd
(lavere), tænder den først (højere), lader hver sjette boble slippe forbi
(højere), har 12 mL luft i måleglasset (lavere), slipper 300 mL ud i et
måleglas på 500 mL (det samme) eller arbejder ved 30 °C og regner med
24,0 L/mol (lidt lavere). Eleven gætter først. Så kører begge forsøg, og
tabellen viser m(før), V, m(efter), m(gas) og M(gas). Forskelle på under
2 % tæller som det samme. Et forkert gæt løser opgaven uden stjerne.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori
· <kbd>H</kbd> rundvisning · <kbd>K</kbd> linjen siger, hvor man er ·
<kbd>R</kbd> start forfra, nye tal eller kør igen · <kbd>Mellemrum</kbd>
hold gassen åben · <kbd>Enter</kbd> tjek feltet eller næste opgave ·
<kbd>Esc</kbd> luk. Links: `index.html#beregning`, `index.html#fejl`.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (kopi af sc4.11 uden Kemichaels bånd; nyt nederst). NB: decimaltal med PUNKTUM i CSS
sprites/            lighteren og hætten, det omvendte måleglas, karret og stativet (nye), vægten og luppen (som sc4.11)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.11)
js/data.js          atommasserne og alkanerne, Vₘ, lighteren og ventilen, opgaverne, fejlkilderne og Kemichaels påtaler
js/kemi.js          lighteren (gas, ventil, pind, vand, hætte), facit på fane 2 og de to gruppers forløb på fane 3
js/tjek.js          formlen og tallet i hvert regnetrin, de typiske fejl og de pæne beregninger
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, vægten, lighteren, flammen, brandkuglen, papiret, karret med måleglas og
                    stativ, boblerne, luppen og søjlerne med alkanerne
js/laerer.js        Kemichael, der kun kommer ved påskeæggene (som sc_spil_syregalgen)
js/fane.js          det, fanerne deler: opgavelisten, knappen, linjen i kortet og musen
js/regning.js       regnetrinene i kortet (formlen og tallet) og tavlen på fane 2
js/sim_forsoeg.js   fane 1, målingerne, som fane 2 bruger, tuningen og påskeæggene
js/sim_beregning.js fane 2
js/sim_fejl.js      fane 3
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, mellemrumstasten, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Alkanerne** (`D.ALKANER`), **Vₘ** (`D.VM`), **lighterne** (`D.LIGHTERE`,
`D.GAS_I`, `D.HAETTE`), **ventilen** (`D.flow`, `D.PIND_START`,
`D.AABEN_MAKS`, `D.TUNET`), **boblerne, der slipper forbi** (`D.FANG`),
**vandet** (`D.VAND_SANDS`, `D.VAND_IND`, `D.FILM`, `D.TOER_TID`),
**gassen på bordet** (`D.SKY`), **måleglasset** (`D.MAALEGLAS`, `D.V_MIN`)
og **opgaverne og fejlkilderne** (`D.FORSOEG`, `D.GAET`, `D.BEREGNING`,
`D.TRIN`, `D.FEJL`) står i `js/data.js`, ligesom **Kemichaels påtaler**
(`D.PAATALE`). **Formlernes regler** står i `F` i `js/tjek.js`, **talfejlene**
i `kandidater`. Terningen til vandet er `NK.terning` (selvtesten sætter
sin egen).

**`_selvtest.html`** åbner index.html i en iframe og tjekker
molarmasserne og Vₘ, eksemplerne og den ukendte gas, lighteren og
tuningen, over 35 formler og tal med de typiske fejl, de pæne
beregninger, fane 1 med musen (vægt, vand, gas, forkert aflæsning, gæt,
våd vejning, papir), påskeæggene (hætten, tuningen med musen, stikflamme,
vand med terningen, én gang pr. tur, brandkugle, almindelig flamme uden
Kemichael), fane 2 og 3 hele vejen, sproget (og at tuningen ikke står
nogen steder) og layoutet fra 520 × 380 til 1500 × 900. Den kræver en
lokal server eller Chrome med `--allow-file-access-from-files` og lægger
elevens gemte fremskridt tilbage bagefter. Sidst kørt 27. september 2026:
ALT OK (86 påstande).

## Forenklinger

* Lightergas er butan, M = 58,14 g/mol (i virkeligheden butan og isobutan,
  der har samme molarmasse, og ofte lidt propan). Atommasserne har to
  decimaler som i `sc4.1`.
* 1 mol gas fylder 24,0 L ved 20 °C og 1,013 bar (som `sc4.6`). Vanddamp i
  gassen, forskellen mellem vandstanden i måleglasset og i karret og den
  smule butan, der opløses i vandet, er udeladt.
* Tallene på måleglasset står rigtigt vendt, selv om glasset står på
  hovedet. Tallet ud for vandet er gassens rumfang.
* Tiden er trykket sammen: 150 mL gas tager 6 s med fabrikkens
  indstilling. Gassen i luften blandes ud på ca. et halvt minut.
* Ventilen åbner lineært med pinden, og en tunet ventil giver bobler, der
  er for store og hurtige til, at glasset kan fange dem alle (over
  45 mL/s slipper op til 45 % forbi).
* Vandet på ydersiden (0,09-0,15 g) tørres af på knap et sekund.
* På fane 3 er alt regnet ud fra 150 mL butan ved 20 °C og en lighter på
  17,84 g.

## I menuen

`animationer/kemi-c-filer/samling_c4.html` som c4.9 (27. sept. 2026),
navnet "Forsøg: Lightergas" i `FEEDBACK_EMNER` i `samling_alt.html`. Den
gamle c4.9 ligger i `kemi-c-filer/arkiv/c4.9_eksperiment_lightergas_oldversion.html`.
