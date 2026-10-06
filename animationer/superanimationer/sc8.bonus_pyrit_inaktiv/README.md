# sc8.bonus Pyrit og oxidationstal (inaktiv)

**Ikke i menuen.** Mappen hed `sc8.7_pyrit` og var c8.7 i menuen nogle timer
den 5. oktober 2026. Samme dag tog brugeren den ud: "Animationen virkede
fint, men den er stadig lidt for indforstået til at den skal være på
hjemmesiden." Den forudsætter besøget på museet og arbejdsarket. Mappen er
omdøbt, så nummeret 8.7 er ledigt, og den virker stadig, når `index.html`
åbnes direkte.

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.
Der er ingen lærer og intet lærred: alt på skærmen er almindelige elementer.

Den afløser intet. Den er bygget fra bunden ud fra arbejdsarket til Museo
Geominero (2z's studietur til Madrid, 2026).

## Bestillingen (5. oktober 2026)

Brugeren: "Vi var på besøg i geominero, og jeg kunne godt tænke mig at lave en
superanimation hertil. Det må gerne opsummere pointerne der vedrører
oxidationstal, og skal altså ikke inkludere hele arbejdsarket. [...] Opgave
3.2 er faktisk lidt forvirrende skrevet op, fordi det nok i virkeligheden er
2 reaktionsskemaer som er blandet sammen til et. [...] I forhold til
afstemningen af redoxreaktionen, må du gerne lægge op til samme
stilladserende opskrivning som er anvendt i sc8.4. Husk at du gerne må
stilladsere opgaverne og nok egentlig mest skal fokusere på FeS₂, men du kan
også inddrage en montre, hvori der indgår andre salte, der er velegnet til
oxidationstrin."

To sætninger i bestillingen var ikke skrevet færdige ("Du skal hellere
udvælge" og "Måske kan en del af opgaverne handle om"). De er læst som: vælg
det væsentlige ud, og lad nogle af opgaverne handle om at skille de to
skemaer ad. "sc8.4" er læst som menuens c8.4, Kaliumpermanganat (mappen
`sc8.5_kaliumpermanganat`), hvor opskrivningen er hæftet med klammer.

1. **Pointen:** Når pyrit møder luft og vand, oxideres først svovlet og så
   jernet, mens oxygen reduceres. Det er to redoxreaktioner efter hinanden,
   og tilsammen giver de syre og rødt jern(III).
2. **Fra arbejdsarket:** kun det, der handler om oxidationstal. Opgave 3.2
   (forvitringen af pyrit: hvad oxideres og reduceres, pH og den røde farve),
   3.3 (ristning af zinkblende, og SO₂ i vand), 4.2 (er skemaet for cinnober
   afstemt?) og 4.3 (hematit og magnetit). Museets orden efter den negative
   ion (del 1) er brugt som stillads på fane 1. Udeladt: krystalform,
   molarmasser og masseprocenter, farver og d-elektroner, krystalvand,
   hårdhed, carbonater og syre, hårdt vand.
3. **Naboerne:** `sc8.2` ejer reglerne for oxidationstal, `sc8.4` og `sc8.5`
   afstemningen som øvelse (37 og 17 reaktioner), `sc8.6` rust på jern. Her
   er reglerne kun det, hintet siger, og afstemningen gælder de fire skemaer
   fra arket.
4. **Loftet:** tre faner. Udstillingen har otte sten, Pyrit fire opgaver
   (to skemaer, summen og fire spørgsmål) og Ristning tre opgaver.
5. **Layoutet:** scene plus panel. Scenen er en kolonne: hylderne eller
   tegningen øverst, skiltet eller papiret i midten og statuslinjen nederst.

## Fane 1: Udstillingen

Otte sten på to hylder, ordnet efter den negative ion som på museet:
grundstoffer (svovl), sulfider (zinkblende, cinnober, pyrit), oxider
(hematit, magnetit), sulfater (gips) og carbonater (malakit). Hyldekanten har
et messingskilt med klassen og ionen.

Et klik på en sten lægger den på skiltet under hylderne: stenens navn,
stoffets danske navn (zinkblende er zinksulfid), klassen og formlen med et
felt over de atomer, eleven skal finde. Et tal med blyant er givet. Tasterne
under formlen (−II til +VI) skriver i det valgte felt, og når alle felter er
fyldt, tjekkes svaret af sig selv. Tastaturet virker også (+2, +II, 2 og
Enter).

Har stoffets navn et oxidationstal i sig, står navnet uden tal, til eleven
har fundet det: jernoxid bliver til jern(III)oxid, kviksølvsulfid til
kviksølv(II)sulfid. Ellers ville navnet være facit.

| Sten | Felter | Givet | Pointen |
|------|--------|-------|---------|
| Svovl, S | S | | et grundstof er 0 |
| Zinkblende, ZnS | Zn, S | | sulfidionen er S²⁻ |
| Cinnober, HgS | Hg, S | | det samme en gang til |
| Hematit, Fe₂O₃ | Fe | O | summen er 0, og den deles mellem to Fe |
| Magnetit, FeO·Fe₂O₃ | Fe, Fe | O | to slags jern, +II og +III |
| Gips, CaSO₄·2H₂O | S | Ca, O | svovl helt oppe på +VI |
| Malakit, Cu₂(OH)₂CO₃ | Cu | O, H, C | C er +IV, og summen er 0 |
| Pyrit, FeS₂ | S | Fe | reglen for sulfid giver Fe +IV, så S er −I |

En løst sten får sine tal på hylden og en sætning om stenen på skiltet.

### Rettet efter brugerens første kig (5. oktober 2026)

* "Du må gerne fjerne boksen med oxidationstal i udstillingen." Trappen i
  panelet, hvor svovl og jern havde hver sin række fra −II til +VI, er væk.
* "Du må også gerne fjerne de spanske navne, så animationen er mindre
  indforstået. Skriv til gengæld gerne de danske navne." De spanske navne fra
  museets skilte er væk. I stedet står stoffets danske navn. Det er læst som
  det kemiske navn; stenenes navne var danske i forvejen.

Samme dag, senere: "I animationen sc8.7 med malakit, må du gerne skrive at
oxidationtallet for C er +4, fordi ellers er den lidt svær at løse." C står
nu med blyant som +IV, og O og H står der også (som i gips og hematit), så
alle de tal, eleven skal bruge, er på skiltet. Hintene regner de to grupper
ud hver for sig: (OH)₂ giver −2, og CO₃ giver −2.

## Fane 2: Pyrit

Arbejdsarkets skema, 4 FeS₂ + 15 O₂ + 14 H₂O ⟶ 4 Fe(OH)₃ + 8 H₂SO₄, er to
redoxreaktioner i ét: svovlet oxideres, og jernet oxideres. Her afstemmes de
hver for sig. Opgaverne åbner én ad gangen.

1. **Svovlet oxideres.** FeS₂ + O₂ ⟶ Fe²⁺ + SO₄²⁻. Fe er givet som +II i
   pyrit og er +II bagefter, så jernet skifter ikke. Afstemt:
   2 FeS₂ + 7 O₂ + 2 H₂O ⟶ 2 Fe²⁺ + 4 SO₄²⁻ + 4 H⁺.
2. **Jernet oxideres.** Fe²⁺ + O₂ ⟶ Fe(OH)₃. Afstemt:
   4 Fe²⁺ + O₂ + 10 H₂O ⟶ 4 Fe(OH)₃ + 8 H⁺.
3. **Læg de to sammen.** Eleven finder, hvor mange gange hvert skema skal
   bruges, så Fe²⁺ går ud (2 og 1), lægger O₂, H₂O og H⁺ sammen og skriver
   8 SO₄²⁻ + 16 H⁺ som 8 H₂SO₄. Resultatet er arbejdsarkets skema.
4. **Río Tinto.** Fire spørgsmål til det samlede skema med oxidationstallene
   over atomerne: hvilke atomer oxideres, hvilket reduceres, hvad sker der
   med pH, og hvad giver den røde farve. De forkerte svar er de fejl, elever
   laver, og hvert har sin forklaring. Efter et rigtigt svar står
   forklaringen alene, til eleven trykker Næste spørgsmål.

Tegningen over papiret er en klippe med pyrit ved en bæk. Vandet er klart,
bliver svagt grønt og surt, når svovlet er oxideret (Fe²⁺, SO₄²⁻ og H⁺ i
vandet), og rustrødt, når jernet er oxideret (Fe(OH)₃ på bunden).

## Fane 3: Ristning

Samme hæfte, men uden ioner: ladningen er 0 hele vejen, så bidderne med
ladning, H⁺ og vand er væk, og O-rækken er kontrollen til sidst.

1. **Zinkblende ristes.** ZnS + O₂ ⟶ ZnO + SO₂. Zn er givet. Afstemt:
   2 ZnS + 3 O₂ ⟶ 2 ZnO + 2 SO₂.
2. **Cinnober ristes.** HgS + O₂ ⟶ Hg + SO₂ med tre klammer: S stiger 6,
   Hg falder 2, og O falder 4. S og Hg sidder i samme HgS og skal have samme
   gangetal. Alle gangetal er 1, så skemaet var afstemt, som det stod.
3. **Sur regn.** SO₂ + H₂O ⟶ H₂SO₃. S er +IV før og efter, så det er ikke
   en redoxreaktion. Eleven vælger mellem to svar under skemaet.

Tegningen er en risteovn med stenen på risten før og produktet efter
(zinkoxid, eller kviksølv i en skål), og i den sidste opgave regn over en
buste af marmor.

## Hæftet

Opskrivningen er den fra `sc8.5_kaliumpermanganat` (brugerens tegning):
skemaet på ternet papir, oxidationstallet over de atomer, der skifter, en
klamme under skemaet fra atomet før pilen til det samme grundstof efter, og
midt på klammen, under reaktionspilen, stigningen eller faldet for ét atom
med gangetallet og antallet af atomer foran: "2 · 2 S ↑7 = 28" og
"7 · 2 O ↓2 = 28" (2 FeS₂ med 2 S, der hver stiger 7). Klammen har kun en
pilespids ved atomet efter reaktionspilen; før pilen går stregen op til
atomet uden spids. Under hver side står rækkerne Ladning,
H-atomer og til sidst O-atomer som kontrol. Vandet afstemmer H, og O er
kontrollen. Det, eleven skriver, står med blåt blæk, det givne med blyant og
et svar fra Vis svaret med brunt blæk.

Bidderne (linjen øverst på papiret siger det næste skridt helt kort,
statuslinjen i hele sætninger):

1. **Oxidationstal** i felterne over atomerne.
2. **Stigning og fald for ét atom.** Pilen ved hver klamme vendes med et
   klik, med ↑ og ↓ eller med + og − i feltet. Tallet er ændringen for ét
   atom: S ↑7 og O ↓2.
3. **Lige mange atomer** (kun svovlet: 2 foran SO₄²⁻, med blyant). Tallet
   foran kommer først nu, når ændringen pr. atom er fundet. Det lille 2-tal
   efter S i FeS₂ lyser gult imens.
4. **Tæl atomerne.** Har formlen før pilen flere af atomet (FeS₂ og O₂),
   skriver eleven antallet i et felt foran pilen ved klammen, og det lille
   tal i formlen lyser gult. Når tallet står der, læses etiketten
   "2 S ↑7 = 14": det, én FeS₂ stiger i alt.
5. **Gangetal.** Foran antallet: "2 · 2 S ↑7 = 28". Før der er skrevet
   noget, står "= 14" og "= 4" ved de to klammer, så opgaven er at gøre de
   to tal lige store. "= 28" følger med, mens der skrives, og bliver grønt,
   når stigning i alt er lig fald i alt. Tallene flyver op foran formlerne.
6. **Resten af atomerne.** Et stof, der følger med uden at skifte (Fe²⁺ fra
   pyrit, ZnO), får sit tal ved at tælle.
7. **Ladning** under hver side.
8. **H⁺** på den side, hvor ladningen er lavest. Rækken viser det nye tal
   efter en pil (−4 → 0), mens der skrives.
9. **H-atomer** under hver side.
10. **Vand** på den side, der har færrest H. Til sidst kommer O-rækken af
    sig selv, og papiret får en grøn ramme.

Brugeren 5. oktober 2026, senere: "I fane 2, så er det jo lidt forvirrende
den måde at svovl fra pyrit altid kommer i stks af 2. Måske kan du lave lidt
ekstra hjælp indbygget." Før stod antallet som et bart "· 2" mellem
gangetallet og pilen. Nu er det bid 4: eleven tæller selv, atomets symbol
står på en lille brik ("2 S"), så "2 O" ikke læses som 20, og mellemtallet
for én formel (14 og 4) står på papiret, før gangetallene skal findes. Er
etiketterne bredere end reaktionspilen, får de samme venstre kant lige efter
den sidste lodrette streg før pilen, så felterne står under hinanden.

Brugeren 5. oktober 2026: "jeg plejer at lære eleverne at man viser stigningen
pr atom. Dvs der bør stå 7 og 2 under skemaet (jeg ved at den nuværende metode
også er rigtig, men det er bare ikke den traditionelle måde at gøre det på,
på dansk). Dvs vi indsætter også først koefficienter foran S efter at vi har
bestemt hvor meget hvert svovl falder med." Første udgave skrev 2 foran
SO₄²⁻ først og det samlede tal (↑14 og ↓4) ved klammen. Samme dag: pilespids
kun på produktsiden, her og i `sc8.5_kaliumpermanganat`.

Nyt i forhold til sc8.5, fordi skemaerne her er anderledes bygget:

* En formel kan have flere mærkede atomer (FeS₂ har Fe med blyant og S som
  felt; SO₄²⁻ har felter over både S og O). Det første tal stikker ud til
  venstre og det sidste til højre, så de ikke dækker hinanden.
* En klamme kan ende i et stof, der også får atomer andre steder fra: O fra
  O₂ ender i sulfat, hvor resten af O kommer fra vand. Sådan en klamme (`fri`
  i `js/data.js`) giver intet tal foran produktet.
* Der kan være flere end to klammer, og klammer fra samme stof får samme
  gangetal (cinnober).
* Ved klammen står ændringen for ét atom, ikke den samlede (sc8.5 skriver den
  samlede i de fire reaktioner med indekstal).
* Tomme felter tæller aldrig som et svar, og der står ingen tal foran
  formlerne, før stigning og fald er fundet.

## Hjælpen

Statuslinjen nederst i scenen, som i `sc1.4_afstemning` og `sc8.6_korrosion`:
det næste skridt i hele sætninger, en rød linje med forklaringen ved en fejl
(linjen ryster, og den gule knap lyser stille), en grøn ved et rigtigt svar.
Knappen Tjek prøver svaret (Enter gør det samme). Den gule knap er Giv et
hint → Næste hint → Vis svaret → Næste opgave. Et svar fra Vis svaret koster
stjernen.

| Hvor | Fejlen | Beskeden |
|------|--------|----------|
| pyrit | S som −II | Med S som −II skulle Fe være +IV. Jern er +II i pyrit |
| sulfat | ionens ladning glemt (+VIII) | Summen skal være −2, ikke 0 |
| hematit | summen ikke delt (+VI) | +6 er for de to Fe tilsammen |
| gips | S som −II | S er kun −II i et sulfid |
| klammer | pilen den forkerte vej | Tallet bliver større, så pilen skal pege op |
| klammer | alle atomer i stedet for ét (↑14) | Det er for 2 S tilsammen. Ved klammen står kun, hvor meget ét S stiger |
| tæl atomerne | 1 S (talt i sulfat) | Tæl S i FeS₂ før pilen, ikke i SO₄²⁻ |
| tæl atomerne | 7 S (stigningen) | 7 er, hvor meget ét S stiger. Her skal du tælle S i FeS₂ |
| gangetal | ikke lige store | Stigning: 2 · 2 · 7 = 28. Fald: 3 · 2 · 2 = 12 |
| gangetal | cinnober med forskellige tal ved S og Hg | S og Hg sidder i samme HgS |
| følger med | 1 foran Fe²⁺ | der er 1 Fe efter pilen, men 2 Fe før pilen |
| ladning | tallene foran glemt, fortegnet | hver sin |
| H⁺ | forkert side, for få eller mange | med ladningen, som den er nu |
| H-atomer | H i H⁺ glemt | husk H i 4 H⁺ |
| vand | forkert side, dobbelt så mange | Hvert H₂O har 2 H |
| summen | 1 og 1 | Dannet: 1 · 2 = 2 Fe²⁺. Brugt: 1 · 4 = 4 Fe²⁺ |
| svovlsyre | 16 H₂SO₄ | Hvert H₂SO₄ har 2 H |

## Modellen

Alt regnes af `js/redox.js` ud fra stofferne før og efter pilen i
`js/data.js`. Intet svar er skrevet i hånden.

* Oxidationstallene: O er −II, H er +I, et grundstof er 0, en ion af ét atom
  har sin ladning, og resten følger af summen. Kun det, reglerne ikke kan
  afgøre, står i `D.OX`: Fe +II i pyrit (så S bliver −I), Zn og Hg +II i
  sulfiderne, Ca +II i gips, C +IV i malakit og de to slags jern i magnetit.
* Klammerne, gangetallene (stigning i alt = fald i alt, mindste tal),
  tallene foran, ladningen, H⁺, vandet og optællingen.
* Summen af de to skemaer og hvad der går ud (`X.sum`).

## Forenklinger

* Jern(III) skrives Fe(OH)₃, som i arbejdsarket. I floden findes også
  opløst Fe³⁺ og andre jern(III)forbindelser.
* Svovlets vej fra −I til +VI går i virkeligheden over flere mellemtrin og
  hjælpes af bakterier. Her er det ét skema.
* Tallene på pH-måleren (ca. 7, ca. 3 og ca. 2) er valgt, så retningen kan
  ses. Kun slutværdien, omkring 2, er Río Tintos. Farven i trin 1 er Fe²⁺'s
  svagt grønne, gjort tydelig.
* Magnetit skrives FeO·Fe₂O₃, så de to slags jern kan få hvert sit tal.
* Krystalvandet i gips står efter formlen og regnes ikke med.
* Pyrit står hos sulfiderne, som på museet, selv om ionen er S₂²⁻.
* Oxygens klamme tegnes til ét af de stoffer, O ender i (sulfat, Fe(OH)₃,
  ZnO eller SO₂). Resten af O kommer med, når der afstemmes.
* SO₂ i vand skrives som H₂SO₃. Den videre oxidation til svovlsyre i luften
  er ikke med.
* Stenene og tegningerne er tegnet i koden (SVG), ikke fotograferet.

## Filer

```
index.html            toplinje, de tre faner, teori og rundvisning
css/stil.css          alt udseende: rammen fra sc8.6, hæftet fra sc8.5 og
                      afsnittene SC8.7 nederst. NB: decimaltal med PUNKTUM
js/kerne.js           NK-navnerum, hævet og sænket skrift (som sc8.6)
js/data.js            mineralerne, opgaverne, spørgsmålene og teksterne
js/redox.js           modellen: stoffer, oxidationstal, klammer, afstemning,
                      summen og beskederne til de typiske fejl
js/formel.js          en formel med plads til tal over atomerne
js/mineraler.js       de otte sten som SVG
js/scener.js          tegningerne over hæftet: bækken, risteovnen og regnen
js/haefte.js          hæftet: skemaet, felterne, klammerne og rækkerne
js/fane.js            det fælles: listen, knappen og statuslinjen
js/sim_udstilling.js  fane 1: hylderne, skiltet og tasterne
js/sim_haefte.js      fane 2 og 3: bidderne, tjekkene, summen og spørgsmålene
js/rundvisning.js     rundvisningen bag ?
js/app.js             faneskift og tastatur
_selvtest.html        udviklerværktøj, se nedenfor
```

En ny sten er én linje i `D.MINERALER` (og en tegning i `js/mineraler.js`).
En ny reaktion er én opgave i `D.OPGAVER`; selvtesten tjekker, at den er
afstemt.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane (når intet felt venter på et tal)
· <kbd>Enter</kbd> tjek og videre · <kbd>↑</kbd> <kbd>↓</kbd> vend pilen ved
en klamme · <kbd>R</kbd> start opgaven forfra · <kbd>H</kbd> rundvisning ·
<kbd>T</kbd> teori · <kbd>Esc</kbd> luk. Direkte links: `#udstilling`,
`#pyrit` og `#ristning`.

Påskeæg: tre klik på pyrit, når den ligger på skiltet.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server (iframen kan ikke læses
fra `file://`). Den tjekker oxidationstallene mod de kendte, at de fem
skemaer er afstemt i atomer og ladning med de mindste tal, at de to skemaer
for pyrit lagt sammen giver arbejdsarkets skema, at alle sten og opgaver kan
løses ved at skrive og med Vis svaret, at klammerne viser ændringen for ét
atom og kun har pilespids efter reaktionspilen, at atomerne tælles før
gangetallene (og at det lille tal i formlen lyser imens), at C er givet i
malakit, at de typiske fejl får den
rigtige besked, at der ikke står et facit før tid (heller ikke i stoffets
navn), at opgaverne på fane 2 åbner én ad gangen, at tegningen følger
skemaerne, rundvisningen, sproget og pladsen fra 1100 × 650 til 1600 × 950
(intet går ud over papiret, og intet tal dækker et andet).
Sidst kørt: ALT OK (215 påstande), 5. oktober 2026.

## Ikke i menuen

Var i menuen 5. oktober 2026 som c8.7 i `kemi-c-filer/samling_c8.html`
(knap 7, `data-emne="c8.7"`) og i `FEEDBACK_EMNER` i `samling_alt.html`.
Begge dele er fjernet samme dag, og mappen er omdøbt fra `sc8.7_pyrit`.
Skal den tilbage, skal den først gøres mindre indforstået (brugerens
begrundelse), og så sættes knappen og linjen i `FEEDBACK_EMNER` ind igen.
Elevens fremskridt huskes under `nk-sc8.bonus-u`, `-p` og `-r`. Afsnittene
nederst i `css/stil.css` hedder stadig SC8.7.
