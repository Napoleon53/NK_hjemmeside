# sb9.3 Lambert-Beers lov

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-b-filer/b9.3_lambert_beer_simulation.html`
(knap 3 i Spektroskopi, `samling_b9.html`), men er **ikke i menuen** endnu.
Den gamle står urørt i menuen, til brugeren siger til.

## Bestillingen (2. oktober 2026)

Brugeren: "Kan du lave b.9.3 om til en superanimation?" Bestillingen er
skrevet af Claude uden at spørge, som ved sb2.1.

1. **Pointen:** Hvert lag af opløsningen tager den samme brøkdel af lyset,
   så absorbansen er ligefrem proportional med koncentrationen og
   kuvettebredden, A = ε · l · c, og en standardkurve er en ret linje gennem
   (0, 0) med hældningen a = ε · l.
2. **Afløser b9.3.** Med fra den gamle: lampen, kuvetten og detektoren med
   fotoner, der bliver absorberet i kuvetten, strålen, der er svagere efter
   kuvetten, I₀ og I, T og A på detektoren, skyderne for c og l og knappen
   til langsomt lys, formlen med tallene sat ind og ε i lilla som stoffets
   konstant, at kuvetten bliver mørkere med c, enhederne (A har ingen),
   standardkurven med lidt støj og en linje gennem (0, 0), de tre opgaver
   (ε af hældningen, c af en ukendt prøve og massen i et rumfang) og teorien
   (A = ε · l · c, T = I / I₀, A = −log(T), standardkurven). Taget ud: point,
   boksen "Hvorfor skifter farven?" (b9.1 ejer farverne), knappen Generer ny
   opgave (afløst af Forfra og listen) og den opdigtede ε = 0,80 for
   kobber(II)sulfat i mg/L. Nyt: dybden, hvor fotonerne bliver absorberet,
   følger I(x), så de fleste absorberes tidligt; kurven "Lys tilbage" over
   strålen; molekylerne i kuvetten; de seks forudsigelser; kuvetten kan
   trækkes bredere; tre rigtige stoffer med tabelværdier for ε i mM; fane 2,
   hvor eleven selv måler standarderne, lægger linjen og aflæser prøven;
   fane 3 med formlen først og otte regnestykker; statuslinjen med
   hinttrappen.
3. **Naboerne:** b9.1 ejer spektre, bølgelængder og farver. b9.2 (Breezer)
   og b9.4 (nitrit) ejer forsøgene, og en anden session samler dem i
   `sb9.4_spektrofotometri` (µM, a = ε · l som her). b9.5 ejer
   eksamensopgaverne med Excel, enheden på ε i M⁻¹·cm⁻¹, det lineære område
   og fortynding. Her bruges kun mM, og intet fortyndes.
4. **Loftet:** tre faner. Fane 1 har 6 forudsigelser og 3 stoffer, én
   kuvette og 1 lampe og detektor. Fane 2 har 4 opgaver med 7 kuvetter
   (vand, 5 standarder og prøven) og ét papir. Fane 3 har 8 regnestykker
   med højst 3 trin.
5. **Layoutet:** scene plus panel. På fane 1 og 2 står spørgsmålet over
   scenen, og scenen er et lærred. På fane 3 står regnestykket med felterne
   på tavlen i scenen og formens form, bogstaverne og tallene i en bakke
   under den. Statuslinjen er nederst i scenen; panelet har opgavekortet,
   skyderne eller målingerne og listen.

Kemichael er ikke med. Hjælpen står i statuslinjen som i `sc1.4_afstemning`
og `sb2.1_ligevaegtsloven`: Giv et hint › Næste hint › Vis svaret, og
knappen lyser stille op efter en fejl.

## Fane 1: Lyset

Lampen sender lys med én bølgelængde gennem kuvetten til detektoren.
Fotonerne er prikker. En foton, der når væsken, bliver absorberet med
sandsynligheden 1 − T, og dybden trækkes efter I(x) = I₀ · 10^(−ε·c·x), så
der er flest små ringe forrest i kuvetten. Kurven "Lys tilbage" over
strålen viser lyset gennem kuvetten med en prik for hver hele centimeter
(100 % › 51 % › 26 %). Displayet under detektoren viser T og A, og tavlen
under scenen viser A = ε · l · c med tallene sat ind.

Seks forudsigelser. Eleven gætter først ved at klikke på et af tre svar over
scenen; så stilles kuvetten tilbage til start, og eleven prøver det selv med
skyderne eller ved at trække i grebet på kuvettens højre side. Svaret
kommer, når skyderen slippes på målet (ikke mens den passerer det). Et
forkert gæt bliver gult ("Prøvet") med det, detektoren viste, og
forklaringen; et rigtigt gæt bliver grønt.

| Forudsigelse | Spørgsmålet | Svaret |
|--------------|-------------|--------|
| Vand i kuvetten | hvor meget lys med rent vand? | 100 %, blindprøven |
| Dobbelt koncentration: A | A = 0,490, c fordobles | 0,980 |
| Dobbelt koncentration: lyset | 32 %, c fordobles | 10 % (32 % af 32 %), ikke 16 % |
| Én centimeter mere | ca. 51 % gennem 1 cm, hvad gennem 2 cm? | 26 %, ikke 0 % |
| Halv koncentration, dobbelt vej | A = 0,980 | det samme |
| Absorbansen 1 | hvor meget lys ved A = 1? | 10 % |

Stofferne i panelet (permanganat, FeSCN²⁺ og [Fe(phen)₃]²⁺) er til frit spil;
forudsigelserne bruger permanganat.

**Påskeægget:** når en forudsigelse er slut, giver et klik på detektoren den
solbriller på. Alle målinger bliver 0,30 for høje, også for vand, og linjen
siger, at det er derfor, man nulstiller med en blindprøve.

## Fane 2: Standardkurven

Til venstre et spektrofotometer og en bakke med vand, fem standarder og
prøven. Et klik på en kuvette sætter den i spektrofotometret, og målingen
bliver et punkt på grafen til højre (med ca. 0,6 % støj). Eleven

1. måler vandet og standarderne,
2. trækker i den gule prik, så linjen gennem (0, 0) passer med punkterne
   (godtages inden for 3 % af den bedste linje gennem (0, 0)),
3. måler prøven, og en stiplet linje viser dens absorbans,
4. trækker den lodrette linje med trekanten hen, hvor prøvens absorbans
   rammer linjen (inden for 2 % af aksen).

Rækkefølgen er ikke låst, men linjen godtages først, når alle standarderne
er målt. Prøvens koncentration er ny, hver gang opgaven begynder forfra.
Tabellen i panelet fyldes undervejs.

| Opgave | Stof | Standarder |
|--------|------|------------|
| Permanganat i en prøve | MnO₄⁻, 525 nm | 0,10 til 0,50 mM |
| Jern(III) farvet rødt | FeSCN²⁺, 447 nm | 0,040 til 0,200 mM |
| Jern i en tablet | [Fe(phen)₃]²⁺, 510 nm | 0,010 til 0,050 mM |
| Et punkt, der ikke passer | MnO₄⁻, 525 nm | som opgave 1, men 0,30 mM har et fingeraftryk |

I opgave 4 giver fingeraftrykket 0,12 for meget, og punktet ligger over
linjen. Linjen godtages ikke, før kuvetten er tørret af med papiret (klik på
papiret og så på kuvetten, eller træk papiret derhen) og målt igen. Den
gamle måling står som et blegt kryds.

## Fane 3: Beregningen

Hvert trin regnes i tre skridt på tavlen (mønstret fra sc5.1 og sc4.3):
formlen (vælg formens form, □ · □, □ · □ · □, □ / □ eller □ / (□ · □), og skriv
eller klik et bogstav i hvert felt), tallene ind (klik på tallene under
tavlen eller skriv dem) og resultatet med enhed. ε kan skrives som e, eps
eller ε. Et trin, der er løst, klappes sammen til én linje med ✓.

| Opgave | Gruppe | Trin | Facit |
|--------|--------|------|-------|
| Find absorbansen | Let | A = ε · l · c | 0,735 |
| Find koncentrationen | Let | c = A / (ε · l) | 0,130 mM |
| Find ε af en standard | Let | ε = A / (l · c) | 11,1 mM⁻¹·cm⁻¹ |
| En kort kuvette | Middel | c, l = 0,500 cm | 0,120 mM |
| Find ε af hældningen | Middel | ε = a / l, l = 2,00 cm | 2,45 mM⁻¹·cm⁻¹ |
| En lang kuvette | Middel | c, l = 2,00 cm | 0,0450 mM |
| Fra hældning til prøve | Svær | ε = a / l, så c | 4,70 mM⁻¹·cm⁻¹ og 0,0800 mM |
| Massen af permanganat | Svær | c, n = c · V, m = n · M | 0,220 mM, 0,0550 mmol, 6,54 mg |

Beskederne til de typiske fejl (`js/regning.js`): gangestykke i stedet for
brøk, brøken vendt, det, der skal findes, i formlen, et tal på et andet
bogstavs plads, V i mL, l i mm, ganget i stedet for divideret, kun divideret
med ε, A / ε · l uden parentes, c uden enhed eller i M uden omregning, A med
enhed, m = n / M og afrunding undervejs. c i M med omregning (1,30·10⁻⁴ M)
godtages.

Hint til formlen: hvad man kender › formlens begyndelse (c = A / …) › hele
formlen og formen. Hint til tallene: hvor tallene står › det første tal ›
hele mellemregningen. Hint til resultatet: tasterne (med parentesen) ›
enheden › resultatets første cifre.

## Tallene og forenklingerne

* ε er tabelværdier: permanganat ca. 2,4·10³ M⁻¹·cm⁻¹ ved 525 nm (her 2,45,
  som i b9.5), FeSCN²⁺ 4,70·10³ M⁻¹·cm⁻¹ ved 447 nm og [Fe(phen)₃]²⁺
  1,11·10⁴ M⁻¹·cm⁻¹ ved 510 nm. Animationen regner i mM og mM⁻¹·cm⁻¹, så
  tallene er pæne uden potens. 1 mM⁻¹·cm⁻¹ = 1000 M⁻¹·cm⁻¹ står i teorien.
* Lyset har én bølgelængde, og opløsningen følger Lambert-Beers lov ved
  alle koncentrationer. Afvigelser ved høj absorbans (det lineære område)
  ejer b9.5. Over A = 3 viser displayet "> 3".
* Kuvettens farve er kun pynt: hver farvekanal svækkes efter stoffets tal og
  koncentrationen set gennem 1 cm (`Tg.vaeskeFarve`).
* Fotonerne er en model: hver prik er mange fotoner, og andelen, der slipper
  igennem, er T.
* Hvert molekyle tegnes ikke for sig; prikkerne i kuvetten følger c og l.
* Massen regnes med mM · L = mmol og mmol · g/mol = mg.

## Filer

```
index.html         toplinje, de tre faner, teori og rundvisning
css/stil.css       udseende (grundlaget er sb2.1; nederst valgkortene,
                   skyderne, måletabellen og regnestykket på tavlen). NB:
                   decimaltal med PUNKTUM i CSS
js/kerne.js        NK-navnerum, tal med dansk komma (som sb2.1)
js/lb.js           modellen: A, T, I(x), dybden for en absorberet foton,
                   den bedste linje gennem (0, 0), støjen og det, eleven
                   skriver (tal, potens og enhed)
js/data.js         stofferne, forudsigelserne, standardkurverne og
                   regnestykkerne
js/tegning.js      lampen, strålen, kuvetten, detektoren, displayet og tavlen
js/fane.js         det fælles: listen, statuslinjen og den ene knap
js/regning.js      fane 3: facit, tjek af formel, tal og resultat, beskeder
                   og hint
js/sim_lys.js      fane 1
js/sim_kurve.js    fane 2
js/sim_regn.js     fane 3: felterne på tavlen og bakken
js/rundvisning.js  rundvisningen bag ?
js/app.js          faneskift, tastatur og løkken
_selvtest.html     udviklerværktøj, se nedenfor
```

En ny forudsigelse er ét objekt i `D.FORUD` (start, tre svar, mål, tre hint
og forklaringen). En ny standardkurve er ét objekt i `D.KURVE`. Et nyt
regnestykke er ét objekt i `D.REGN` med tallene som tekst og trinene fra
`D.TRIN`; facit regnes af tallene.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>Enter</kbd> tjek ·
<kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning · <kbd>T</kbd> teori ·
<kbd>Esc</kbd> luk. Direkte links: `#lys`, `#kurve`, `#regn` og `#teori`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server (iframen afvises på
file://). Den tjekker modellen (også at fotonerne absorberes efter I(x)),
at hver forudsigelse har ét rigtigt svar, som modellen giver, at alle seks
forudsigelser kan prøves med skyderne og ved at trække kuvetten, alle fire
standardkurver med klik og træk (også fingeraftrykket og papiret) og alle
otte regnestykker på tavlen, at Vis svaret fører gennem det hele, de
typiske fejl, hinttrappen, sproget og layoutet fra 1100 × 700 til
1600 × 950.
Sidst kørt: ALT OK, 2. oktober 2026.

## Til menuen

Når brugeren siger til:

* `kemi-b-filer/samling_b9.html`, knap 3 `data-emne="b9.3"`, skal pege på
  `../superanimationer/sb9.3_lambert_beer/index.html`.
* Den gamle flyttes med `git mv` til
  `kemi-c-filer/arkiv/b9.3_lambert_beer_simulation_oldversion.html`.
* `FEEDBACK_EMNER` i `samling_alt_b.html` tjekkes; knappen hedder stadig
  "Lambert-Beers Lov" og har nummer 3.
* Kolonnen "I menuen" i superanimationernes README rettes.
