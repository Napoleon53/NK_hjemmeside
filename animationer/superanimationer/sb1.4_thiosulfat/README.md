# sb1.4 Thiosulfat og syre

Superanimation om forsøget med thiosulfat og syre, hvor man tager tid på, hvornår
et kryds under glasset forsvinder. Åbn `index.html`. Mappen henter kun filer inde
fra sig selv og fra Kemichael, og den virker også, når den åbnes direkte fra
harddisken.

Den er ny (24. sept. 2026) og i menuen fra 26. sept. 2026.

## Bestillingen

1. **Pointen:** krydset forsvinder, når der er dannet den samme mængde svovl.
   Derfor er 1/Δt et mål for hastigheden, og med det kan man måle, hvad
   hastigheden afhænger af.
2. **Bygget fra bunden** med forsøgsvejledningen "Reaktionen mellem thiosulfat og
   syre" (Basiskemi B, Xperimentér 1) som udgangspunkt. Med derfra: idéen (Δt,
   til krydset er væk, og 1/Δt som mål for hastigheden), en serie med thiosulfat,
   en med syren og en med temperaturen, og spørgsmålene om sammenhængene og
   tommelfingerreglen. Vejledningen er ikke kopieret: her er det 0,30 M Na₂S₂O₃
   og 1,0 M HCl, et bægerglas på 100 mL med 50 mL i alt, et kryds i stedet for en
   plet, syren hældes i til sidst, begge opløsninger står i vandbad i
   temperaturforsøget, og opgaverne er skrevet på ny.
3. **Naboerne:** b1.1 ejer definitionen af hastighed, tangenten, sammenstødene og
   hastighedsudtryk i almindelighed. b1.2 ejer energidiagrammet og forklaringen
   på, hvorfor temperaturen virker. b1.3 ejer katalyse. Temperaturen er med her
   som en måling (tommelfingerreglen), og teorien henviser til 1.2 for hvorfor.
4. **Loftet:** 3 faner og én reaktion. Fane 1 har 3 blandinger og højst 5
   målinger. Fane 2 og 3 har højst 8 forsøg i tabellen.
5. **Layoutet:** scene plus panel på alle tre faner. På fane 2 og 3 står tabellen
   under grafen, som på sb1.1 fane 3.

## De tre faner

| Fane | Eleven | Pointen |
|------|--------|---------|
| 1 Krydset | hælder syren i, kigger ned på krydset og stopper selv uret | alle gode målinger ender ved den samme mængde svovl, så 1/Δt er et mål for hastigheden |
| 2 Koncentration | vælger rumfang af Na₂S₂O₃, HCl og vand, måler og regner koncentrationerne i glasset ud | 1/Δt er proportional med [S₂O₃²⁻]; [H₃O⁺] betyder kun lidt |
| 3 Temperatur | vælger temperaturen og måler | hastigheden bliver omtrent dobbelt så stor pr. 10 °C |

Direkte links: `#krydset`, `#koncentration`, `#temperatur`.

### Fane 1: Krydset

Bægerglasset med Na₂S₂O₃ og vand (45 mL) står på et papir med et kryds. Eleven
trækker måleglasset med 5 mL HCl hen over glasset (eller klikker på det eller
trykker Tilsæt syren). Uret starter, idet syren rammer. Til højre ses krydset
oppefra, og væsken bliver mere og mere uklar. Eleven stopper selv uret: klik på
stopuret, knappen Stop uret eller mellemrum.

Bagefter tegnes kurven for det dannede svovl med en stiplet streg, hvor krydset
er væk. En god måling ender på stregen, et tryk for tidligt under den, et for
sent over den, og linjen under scenen siger hvilket. Glemmer eleven uret, stopper
det selv efter 2,5 gange den rigtige tid. Uret står stille efter stop, men
reaktionen fortsætter, så glasset bliver ved med at blive uklart.

Grænserne: for tidligt, når der er mere end 12 % kontrast tilbage (krydset ses
svagt); for sent efter 1,3 gange den rigtige tid.

Opgaverne: hvorfor krydset forsvinder, hvad der er det samme hver gang, hvor
mange gange hurtigere (1/Δt), hvor meget thiosulfat der er brugt, og enheden på
1/Δt.

### Fane 2: Koncentration

Eleven vælger rumfangene i trin på 5 mL og trykker Bland og mål. Uret stopper
selv og går op til flere gange hurtigere, så et forsøg varer højst 4,5 s på
skærmen. Hvert forsøg bliver en række i tabellen. Eleven skriver selv [S₂O₃²⁻] og
[H₃O⁺] i glasset, og først når et tal er rigtigt, kommer punktet på grafen for
1/Δt. Efter to rigtige i en kolonne regnes resten af den for eleven.

Et forkert tal får et svar på den typiske fejl: koncentrationen i flasken, delt
med et forkert rumfang, vendt brøk eller den anden koncentration. Anden gang står
hele beregningen, fx `[S₂O₃²⁻] = 0,30 M · 20 mL / 50 mL = 0,12 M`, og tallet
udfyldes. Et tal, der er rigtigt afrundet til to betydende cifre, godkendes altid.

Grafen viser 1/Δt mod [S₂O₃²⁻] eller [H₃O⁺] (knappen over grafen). Forsøg, hvor
den anden koncentration og rumfanget er ens, forbindes med en svag stiplet linje,
så serien ses.

Fejl blokeres ikke. Uden syre eller thiosulfat forsvinder krydset ikke (1/Δt = 0).
Er der ikke 50 mL i glasset, siger panelet det, og modellen giver en anden tid,
fordi lyset går gennem mere eller mindre væske.

### Fane 3: Temperatur

Samme blanding hver gang (20 mL Na₂S₂O₃, 5 mL HCl, 25 mL vand), fra 5 °C til
60 °C i trin på 5 °C. Termometeret står ved glasset. Grafen viser 1/Δt mod
temperaturen, og punkterne forbindes, så kurven ses blive stejlere.

## Modellen og forenklingerne

Reaktionen: S₂O₃²⁻(aq) + 2 H₃O⁺(aq) → S(s) + SO₂(aq) + 3 H₂O(l). Tallene står
øverst i `js/model.js`.

* **Hastigheden:** v = k · [S₂O₃²⁻] · [H₃O⁺] / ([H₃O⁺] + 0,02 M). Tanken er, at
  thiosulfat først bliver til HS₂O₃⁻ (pKs ≈ 1,7), som så falder fra hinanden. Det
  giver første orden i thiosulfat og en lille, ikke simpel afhængighed af syren,
  som skoleforsøg viser. Den rigtige mekanisme er mere indviklet.
* **k ved 20 °C** er 7,5·10⁻⁴ s⁻¹, valgt så [S₂O₃²⁻] = 0,12 M og [H₃O⁺] = 0,10 M
  tager ca. 20 s, som i skoleforsøg.
* **Flasken** er 0,30 M Na₂S₂O₃ (`C_THIO`). Den var 0,15 M, men så tog fane 1 op
  til 40 s; brugeren bad 24. sept. 2026 om lidt hurtigere forsøg. Nu tager de tre
  blandinger på fane 1 ca. 10, 13 og 20 s. Alle tekster henter tallet fra modellen
  (`M.THIO_TEKST`).
* **Temperaturen:** Arrhenius med Eₐ = 50 kJ/mol. Det giver × 1,97 fra 20 til
  30 °C; tommelfingerreglen svarer til ca. 50 kJ/mol ved stuetemperatur. Tallet er
  valgt, ikke målt for netop denne reaktion.
* **Krydset:** kontrasten er exp(−3,0 · [S] / 1,5 mM · V / 50 mL). Med 50 mL i
  glasset er krydset væk ved 1,5 mM svovl (5 % kontrast tilbage). Så er ca. 1 %
  af thiosulfatet brugt, hvilket passer med vejledningens "der dannes kun en lille
  mængde svovl". Lysvejen er væskens højde, så et andet rumfang kræver en anden
  mængde svovl.
* Svovlet ses fra starten; den korte ventetid, før de første korn bliver synlige,
  er ikke med.
* **SO₂(aq):** bogen skriver SO₂(g). Ved disse koncentrationer bliver det meste
  opløst, men det kan lugtes.
* **Målingerne** på fane 2 og 3 har ± 3 % spredning, som når man selv trykker.
* **Temperaturen** er præcis den valgte og holder sig under hele forsøget.
* Fra siden ser glasset mælket ud lidt før krydset forsvinder oppefra (lyset går
  længere gennem væsken). Det er kun tegningen.

## Filer

```
index.html            toplinje, tre faner, teori og rundvisning
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, tal med komma, NK.bet og NK.laesTal, canvas
js/model.js           kemien: blandinger, hastigheden, forløbet og krydset
js/data.js            Kemichaels replikker, blandingerne og opgaverne
js/sprites.js         lageret til udstyret og Kemichaels sprites
js/praesentation.js   tilbuddet Start præsentation / Nej tak (samme fil som sc1.2)
js/opgave.js          opgavekortet med den ene knap (samme som sb1.1)
js/glas.js            tegningen: bord, papir, glas, måleglas, termometer, krydset oppefra, stopur, akser
js/raekke.js          det, fane 2 og 3 deler: forsøg med ur, der stopper selv, og grafens punkter
js/sim_kryds.js       fane 1
js/sim_konc.js        fane 2
js/sim_temp.js        fane 3
js/laerer.js          Kemichaels præsentation af hver fane
js/rundvisning.js     rundvisningen bag ?
js/app.js             faneskift, tastatur, tegneløkke
sprites/              bægerglas (100 mL), måleglas (10 mL) og termometer
_selvtest.html        udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Opgaverne** står i `D.KRYDS_OPGAVER`, `D.KONC_OPGAVER` og `D.TEMP_OPGAVER` i
`js/data.js`, i samme form som i sb1.1. Tallene i dem regnes af modellen.
**Blandingerne** på fane 1 og 3 og grænserne for rumfang og temperatur står
også i `js/data.js`. **Modellens tal** står øverst i `js/model.js`. Grænserne for
for tidligt og for sent står øverst i `js/sim_kryds.js`.

## Selvtesten

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker modellen (10 til 20 s på
fane 1, 1/Δt proportional med [S₂O₃²⁻], lille virkning af syren, × 2 pr. 10 °C,
krydset væk ved den samme mængde svovl, stofbalancen), tallene, at alle opgaver
har præcis ét rigtigt svar, forløbet på fane 1 med knap, klik og træk, tidlige og
sene tryk, tabellens svar på de typiske fejl på fane 2, fane 3, Kemichaels tilbud
og præsentation og sproget. 24. sept. 2026: ALT OK.

## Kemichael

Kemichael præsenterer hver fane med tre replikker (`D.INTRO` i `js/data.js`) og
peger under anden replik på kortet i panelet, som lyser op. Han kommer ikke af sig
selv: første gang en fane åbnes, står der Start præsentation og Nej tak. Valget
huskes under `nk-sb1.4-intro-kryds`, `-konc` og `-temp`. Tilbuddet forsvinder
også, når eleven er gået i gang (syren er hældt i, et tal er rigtigt, eller en
opgave er løst). K viser præsentationen igen. Mønsteret er det samme som i sc1.2
(`NK.Praesentation.kobl`), og figuren kommer fra `../../v2/kemichael/kemichael.js`.

## I menuen

I menuen fra 26. sept. 2026 som b1.4 (nr. 4) i
`animationer/kemi-b-filer/samling_b1.html`
og i `FEEDBACK_EMNER` i `animationer/samling_alt_b.html` ("Thiosulfat og syre").
