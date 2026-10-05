# sc8.4 Afstem redoxreaktioner

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-c-filer/c8.4_opgaver_redoxafstemning.html` og er i
menuen fra 26. sept. 2026 som c8.3; den gamle ligger i `kemi-c-filer/arkiv/`.

## Bestillingen (september 2026)

1. **Pointen:** I en redoxreaktion afgives lige så mange elektroner, som der
   optages. Derefter afstemmes ladningen med H⁺ eller OH⁻ og til sidst O med
   vand.
2. **Afløser c8.4.** Brugeren: "ikke sikkert at der skal foretages mange
   ændringer, men gerne endnu flere opgaver og en bedre løbende hjælp". Med
   fra den gamle: metoden trin for trin, felterne over atomerne og foran
   formlerne, romertal (+7 og −2 godtages også), de syv reaktioner (fem plus
   de to bonusopgaver med Pb/PbO₂ og Fe/Fe³⁺), hjælpen om indekstal og samme
   grundstof, produkterne, der står to gange og slås sammen til sidst, og
   partikler, der flyver ved et rigtigt svar (nu elektronerne på vægten).
   Nyt: 37 reaktioner i tre sværhedsgrader, en besked til hver typisk fejl,
   Giv hint og Vis svaret på hvert trin, kontrollen under skemaet og
   elektronvægten. Scoren (+100/−10) og enhjørningen er taget ud; tælleren
   over løste reaktioner afløser dem.
3. **Naboerne:** c8.2 ejer reglerne for oxidationstal, c8.3
   elektronegativiteten, c8.5 permanganatens farver og c8.1 spændingsrækken.
   Her er oxidationstallet ét trin, og hintet nævner kun, at O er −II, H er +I,
   og at summen er ladningen.
4. **Loftet:** én opgave ad gangen med to reaktanter og to produkter, syv
   trin, tre sværhedsgrader (9 + 14 + 14 reaktioner) og én vægt, som eleven
   selv slår til.
5. **Layoutet:** scene plus panel. Scenen er tavlen: opgaven øverst, så
   trinnets spørgsmål og skemaet så stort, som bredden tillader. Panelet har
   kun trinene og listen over reaktionerne.

## Ombygningen 3. oktober 2026

Brugeren efter at have brugt den: "Jeg synes vægten godt kan være forvirrende.
Den fylder ret meget og er en smule svær at afkode for elever, som primært
gerne bare vil forstå den trinvise metode. Lav det til en mulighed som man selv
kan toggle på. Udgangspunktet skal være at reaktionsskemaet skal være meget
større, og tilsvarende skal opgaveteksten og inputfelterne være mere synlig.
Lav en god input-mulighed tæt på alle inputfelter. Fjern Michael helt fra denne
animation, men behold ? oppe i hjørnet."

* **Vægten er et tilvalg.** Knappen Elektronvægt i toplinjen (eller V) viser
  den over tavlen. Den er slået fra, hver gang siden åbnes.
* **Tavlen fylder scenen.** Skemaet begynder ved 5,2 rem og bliver kun mindre,
  hvis det ikke kan stå på én linje. Felterne følger skemaets størrelse.
* **Opgaven står over tavlen**, ikke i panelet, og trinnets spørgsmål står med
  stor skrift og en gul streg foran.
* **Tasterne.** Under felterne står en række taster, der skriver i det valgte
  felt: oxidationstallene fra −IV til +VII, tal til koefficienter og
  elektroner, og tal med fortegn til ladningen. Se afsnittet Tasterne.
* **Tjek, hintknappen og beskeden** står på tavlen lige under tasterne. Den
  ene knap fra panelet (Giv hint → Vis svaret → Ny opgave) er flyttet derned
  som en gul knap ved siden af Tjek. Det bad brugeren ikke om her, men om
  nabofilerne c8.2 og c8.4 samme dag ("hint-knappen skal være meget synlig
  lige ved siden af inputfeltet"), så de tre opfører sig ens.
* **Kemichael er taget helt ud:** ingen præsentation, ingen ros fra ham, intet
  påskeæg med 20 på en vægtskål og ingen kaffekop. Første gang alle reaktioner
  på en sværhedsgrad er løst, står det i beskeden. Rundvisningen bag ? er
  bevaret.

## Det rolige ark, 4. oktober 2026

Brugeren dagen efter: "Jeg synes måske animationen er lidt for aggressiv med at
ændre på tekst og opsætning, hver gang man svarer. Det bliver mere elegant i
sc8.4 [Kaliumpermanganat, mappen sc8.5], som er mindre forvirrende for øjnene.
[...] Man skal fx vælge hvad der er reduktion og oxidation, men man når kun at
trykke reduktion før hele skærmen skifter, og nu skal en ny slags logik
afkodes. Kan du ikke gøre det til en mere behagelig og sammenhængende
oplevelse?" Stilladseringen skulle blive, men med mindre tekst.

Tavlen er derfor ét ark, der står stille, og hvert trin lægger kun sit eget
til (`js/opgave.js`, afsnittet Arket):

* **Faste pladser.** Foran hvert stof er der fra trin 1 en tom plads til
  koefficienten. Over og under skemaet er der sat plads af til en klamme, og
  under den til to rækker tal. Tasterne, knapperne og beskeden har også fast
  plads. Fra trin 1 til trin 5 flytter intet sig en pixel (selvtesten måler
  det).
* **Klammerne** bærer trin 2, 3 og 4. Hvert par (atomet før pilen og det samme
  atom efter) har en klamme: den første reaktants over skemaet, den andens
  under. I trin 2 står to knapper på hver klamme, og begge par skal have et
  navn; det første valg farver kun sin egen klamme. I trin 3 står feltet på
  klammen ("Reduktion falder med [ ] pr. atom"). Fra trin 4 tæller klammen
  elektronerne med elevens egne tal ("Oxidation afgiver 5 · 1 e⁻ = 5 e⁻").
  Rollen ses på oxidationstallets og klammens farve; de farvede kasser om
  stofferne er væk.
* **Rækkerne under skemaet.** Ladningen skrives i trin 5 i et felt under hver
  side af pilen. I trin 6 er det den samme række, der følger med, mens H⁺
  skrives, med = eller ≠ under pilen. I trin 7 kommer rækken med O.
* **Skriften skifter én gang.** Skemaet har én størrelse i trin 1 til 5 og en
  mindre fra trin 6, hvor H⁺ og vand skal have plads. Begge findes, når
  reaktionen åbnes, og den store er højst halvanden gang den lille
  (`STOERST_SPRING`), så skiftet ikke bliver et hop. På Let, uden trin 6 og
  7, skifter den aldrig.
* **Pladserne til H⁺ og vand** er lige brede og sat af fra trin 6: to på den
  side, hvor H⁺ ender, og én på den anden. En plads, der ikke bruges, er
  usynlig; før pilen bliver den til en længere pil. Derfor står stofferne
  stille fra trin 6 til det færdige skema.
* **Det færdige skema** er arket selv: 1-tallerne forsvinder fra deres plads,
  tallene bliver grønne, og rækkerne viser ladning, O og H ens på begge sider.
  Står et stof to gange, står det sammenskrevne skema på en linje under arket.
* **Mindre tekst.** Et rigtigt svar får kun "Rigtigt." Forklaringen kommer ved
  en fejl, ved Giv hint og ved Vis svaret. Spørgsmålene til trin 4, 6 og 7 er
  kortere, og kontrolchips og elektronchips er væk (klammerne og rækkerne
  viser det samme).

## De syv trin

Samme trin på alle sværhedsgrader. Linjen over tavlen siger, hvad trinnet
spørger om, og Tjek (eller Enter) tjekker det.

1. **Oxidationstal.** Felter over de atomer, der skifter. O og H står med
   gråt. Rigtige felter låses grønne med det samme.
2. **Hvad oxideres?** En klamme pr. par med knapperne oxidation og reduktion.
   Begge par skal vælges. Derefter er parrene blå (oxidation) og orange
   (reduktion) på arket og vægten.
3. **Elektroner pr. atom.** Stigning og fald pr. atom, i et felt på hver
   klamme.
4. **Koefficienter.** Felter i pladserne foran formlerne; eleven skriver også
   1. Klammerne tæller elektronerne med elevens egne tal. Et tomt felt tæller
   ikke som 1: så står der kun, hvad én enhed afgiver eller optager ("afgiver
   1 e⁻ pr. Fe²⁺"), og der står intet = eller ≠ mellem de to (brugerens første
   test, 25. sept. 2026: Zn/Cu²⁺ var afstemt og grøn, før der var trykket).
   Den første reaktion på Let har derfor tal forskellige fra 1.
5. **Ladningen.** Et felt under hver side af pilen.
6. **H⁺ eller OH⁻.** Et felt på hver side af pilen; eleven vælger siden.
7. **H₂O.** Et felt på hver side af pilen.

På Let er trin 6 og 7 markeret "ikke nødvendig" fra start (ingen O og H). Er
der i andre reaktioner intet at gøre i trin 6 eller 7 (S9 og S14), springes
trinnet over med en besked.

## Tasterne

`js/taster.js`. Rækken står under arket, flytter sig hen under det valgte
felt, og en lille hale peger op mod det. Tastaturet virker som før. I et trin
uden felter (trin 2 og det færdige skema) er rækken usynlig, men beholder sin
plads.

* Det valgte felt har gul ramme. Det er det felt, der sidst blev klikket i, og
  det huskes, selv om markøren forlader feltet.
* I trin 1, 3, 4 og 5 er det første tomme felt valgt fra start. I trin 6 og 7
  er intet valgt, for siden af pilen er en del af svaret. Trykkes der på en
  tast uden et valgt felt, blinker felterne, og beskeden siger, at man skal
  klikke på et felt først.
* Et oxidationstal skrives med ét tryk, og det næste tomme felt bliver valgt.
* Tal: det første ciffer efter et klik i feltet eller et Tjek afløser det, der
  stod der; det næste sættes bagefter (højst to cifre). ⌫ sletter det sidste.
  Plus og minus skifter fortegnet uden at røre tallet.
* På en skærm uden mus (`pointer: coarse`) har felterne `inputmode="none"`, så
  skærmtastaturet ikke dækker tavlen.

## Hjælpen

Den gule knap ved siden af Tjek er Giv hint → Vis svaret → (næste trin) → Ny
opgave (grøn, når skemaet er afstemt). Efter et forkert svar lyser den stille
op, til hintet er givet. Hintet hører til trinnet og reaktionen, fx "I MnO₄⁻ er O −II. Summen af
oxidationstallene skal være ionens ladning, −1." Vis svaret giver svaret med
beregningen, fx "Mn + 4 · (−II) = −1, så Mn = +VII." En reaktion, hvor et svar
er vist, står gul i listen og tæller ikke som løst.

Et forkert svar får en besked, der passer til fejlen (`NK.Redox.oxFejl`,
`eFejl` og `tjek*` i `js/opgave.js`). Beskeden står i en boks under knapperne:
rød ved en fejl, grøn ved et rigtigt svar og gul ved et hint.

| Trin | Fejlen | Beskeden |
|------|--------|----------|
| 1 | ionens ladning glemt (Mn +VIII) | Summen skal være −1, ikke 0 |
| 1 | summen ikke delt (Cr +XII) | Der er 2 Cr. Del summen mellem dem |
| 1 | fortegnet, ladningen på ét atom, O −II i H₂O₂ | hver sin |
| 2 | oxidation og reduktion byttet | tallet stiger eller falder, så det er en … |
| 3 | oxidationstallet i stedet for forskellen, hele enheden i stedet for ét atom, byttet om | hver sin |
| 4 | elektronerne går ikke op | Afgivet: 1 · 1 e⁻ = 1 e⁻. Optaget: 1 · 5 e⁻ = 5 e⁻ |
| 4 | indekstallet glemt | Cr₂O₇²⁻ ⟶ Cr³⁺: 2 Cr før pilen og 1 efter |
| 4 | ikke de mindste tal | alle tallene kan deles med 2 |
| 5 | koefficienterne glemt | 5 Fe²⁺ har ladningen 5 · (+2) = +10 |
| 6 | forkert side, begge sider, for få eller mange | med ladningen, som den er nu |
| 7 | forkert side, for lidt eller meget | med antallet af O på hver side |

Det, der følger med, mens eleven skriver, er kun tal, eleven selv har skrevet:
elektronerne på klammerne i trin 4, ladningen i rækken i trin 6 og O i trin 7.
Rækkerne bliver grønne, når tallene er ens.

## Elektronvægten

Slået fra fra start. Knappen Elektronvægt i toplinjen eller V viser den over
tavlen, og tavlen bliver lavere, så begge kan ses.

Venstre skål er det, der oxideres, højre skål det, der reduceres. Hver brik
er én enhed af stoffet. Over brikkerne til venstre sidder de elektroner, den
afgiver (gule prikker), og over brikkerne til højre de pladser, de skal hen
(ringe). Vægten tipper mod den side med flest og står lige, når der er lige
mange. Under skålene står regnestykket, fx 5 · 1 e⁻ = 5 e⁻. Plus og minus på
bordkanten under vægten ændrer tallet foran reaktanten i trin 4. Når
koefficienterne er rigtige, flyver elektronerne fra venstre til højre én
gang. Et klik på vægten, der ikke kan bruges endnu, siger hvorfor.

## Reaktionerne

Alle står i `D.REAKTIONER` i `js/data.js` som reaktanter og produkter før
afstemningen. `js/redox.js` regner resten ud: oxidationstallene (O er −II, H
er +I, H₂O₂ er undtagelsen i `D.UKENDT`), de mindste koefficienter, ladningen,
H⁺ eller OH⁻ og vandet.

| Niveau | Reaktionerne |
|--------|--------------|
| Let (9) | metaller og ioner uden O og H: Zn/Cu²⁺, Cu/Ag⁺, Cl₂/Br⁻, Al/Cu²⁺, Fe³⁺/I⁻, Sn²⁺/Fe³⁺, Ag⁺/Al, Br₂/Fe²⁺, Mg/Fe³⁺ |
| Middel (14) | surt miljø, H⁺ før pilen: permanganat, dichromat, salpetersyre (NO₂ og NO), svovlsyre, MnO₂ (Scheele), nitrit, oxalat, sulfit |
| Svær (14) | basisk miljø (OH⁻ på begge sider af pilen), H⁺ efter pilen (SO₂, Br₂/SO₂, MnO₄⁻/Mn²⁺, H₂S), samme grundstof begge veje (NO₂, Pb/PbO₂, Fe/Fe³⁺, MnO₄⁻/Mn²⁺, MnO₄²⁻), NH₄⁺ og H₂O₂ |

En ny reaktion er én linje i `D.REAKTIONER`. Selvtesten tjekker, at den kan
afstemmes med hele oxidationstal og de mindste tal.

## Forenklinger

* Kun reaktioner med to reaktanter og to produkter før afstemningen, og kun
  hele oxidationstal (ingen S₄O₆²⁻ eller organiske stoffer).
* Samme grundstof begge veje bruges kun, hvor stoffet har ét atom af
  grundstoffet (Pb²⁺, Fe²⁺, NO₂, MnO₂, MnO₄²⁻), så der ikke opstår halve
  koefficienter, når de to led slås sammen.
* Blyakkumulatoren skrives uden sulfat (som i den gamle); det står i
  opgaveteksten.
* Elektronerne tegnes som gule prikker på brikkerne. Vægten er en model af
  regnskabet, ikke af massen.
* Skemaet står altid på én linje. Fra trin 6 er skriften derfor mindre (ca.
  25 til 28 px ved 1400 px i bredden, ned til 18 px ved 1100 px for de
  længste).
* Den side, hvor H⁺ ender, har to pladser fra trin 6, den anden én. Ender H⁺
  før pilen, er pilen derfor lang i trin 6; ender den efter, er pilen kort. Det
  kan i princippet aflæses, men det er valgt, for fire pladser gav en mindre
  skrift.

## Layoutet

* Feltet over et atom er bredere end et smalt atom (N, S, I). Står der flere
  atomer i formlen, slutter feltet derfor ved atomets kant og stikker kun ud
  til den frie side (`.oxrk.tv` og `.oxrk.th`), så det ikke dækker tallet over
  naboatomet. Et felt, der ville stikke ud over tavlens kant, gør skriften
  mindre (`ombrudt` i `js/opgave.js`).
* Lave skærme (en bærbar, rammen i menuen) får mindre luft i to trin:
  `max-height: 780px` og `700px` i `css/stil.css`. Under 700 px står knapperne
  til højre for beskeden i stedet for over den.
* Med vægten slået til har `body` klassen `med-vaegt`, og arket bruger de
  små mål. Her fylder tasterne kun, når de bruges, for pladsen er trang.
* Klasserne på klammerne hedder `oppe` og `nede`, fordi `.top` er toplinjens
  klasse.

## Filer

```
index.html          toplinje, scene, panel, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet og sænket skrift, lærred (som sc7.1)
js/data.js          reaktionerne og sværhedsgraderne
js/redox.js         modellen: oxidationstal, elektroner, afstemning og
                    beskederne til de typiske fejl
js/vaegt.js         elektronvægten på lærredet
js/taster.js        tasterne under felterne
js/opgave.js        motoren: de syv trin, arket (skema, klammer, rækker)
                    og hjælpen
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur, knappen til vægten, musen på
                    vægten og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> sværhedsgrad · <kbd>R</kbd> start forfra ·
<kbd>V</kbd> elektronvægt · <kbd>H</kbd> rundvisning · <kbd>T</kbd> teori ·
<kbd>Enter</kbd> tjek · <kbd>Esc</kbd> luk. Direkte links: `#let`, `#middel`, `#svaer`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server (iframen kan ikke læses fra
`file://`). Den tjekker, at alle 37 reaktioner er afstemt i atomer og ladning
med de mindste tal, oxidationstal mod tabelværdier, at felterne læser romertal
og tal, at de typiske fejl får den rigtige besked, at alle reaktioner kan
gennemføres med rigtige svar og med Vis svaret, at vægten er slået fra fra
start og følger med, når den slås til, at en hel reaktion kan afstemmes med
tasterne alene, at arket står stille (stofferne, skriften, tasterne, knapperne
og beskeden står samme sted fra trin 1 til 5 og igen fra trin 6 til det
færdige skema), at Kemichael er væk, og at ? stadig viser rundt, sproget, og
at skemaet står på én linje, tasterne på én række, intet felt dækker et tal,
og intet skal rulles fra 1100 × 650 til 1500 × 900 (med vægten: 1280 × 720 og
1400 × 860).
Sidst kørt: ALT OK (124 påstande), 4. oktober 2026.

## I menuen

I menuen fra 26. sept. 2026 som c8.3 i `kemi-c-filer/samling_c8.html` (nr. 3,
fordi c8.2 og c8.3 blev til én knap; mappen hedder stadig sc8.4). Den gamle
ligger i `kemi-c-filer/arkiv/c8.4_opgaver_redoxafstemning_oldversion.html`.
