# sc8.4 Afstem redoxreaktioner

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv, bortset fra Kemichael, som hentes fra
`../../v2/kemichael/`. Den virker også, når den åbnes direkte fra harddisken.

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
   over løste reaktioner og Kemichaels ros afløser dem.
3. **Naboerne:** c8.2 ejer reglerne for oxidationstal, c8.3
   elektronegativiteten, c8.5 permanganatens farver og c8.1 spændingsrækken.
   Her er oxidationstallet ét trin, og hintet nævner kun, at O er −II, H er +I,
   og at summen er ladningen.
4. **Loftet:** én opgave ad gangen med to reaktanter og to produkter, syv
   trin, tre sværhedsgrader (9 + 14 + 14 reaktioner) og én vægt på scenen.
5. **Layoutet:** scene plus panel, som sc2.4. Vægten og Kemichael foroven,
   arbejdsbordet med tavlen forneden. Panelet har trinene, den ene
   hjælpeknap og listen over reaktionerne.

## De syv trin

Samme trin på alle sværhedsgrader. Linjen over tavlen siger, hvad trinnet
spørger om, og Tjek (eller Enter) tjekker det.

1. **Oxidationstal.** Felter over de atomer, der skifter. O og H står med
   gråt. Rigtige felter låses grønne med det samme.
2. **Hvad oxideres?** To par, fx Fe²⁺ ⟶ Fe³⁺ og MnO₄⁻ ⟶ Mn²⁺, med knapperne
   oxideres og reduceres. Derefter er parrene blå (oxidation) og orange
   (reduktion) på tavlen og vægten.
3. **Elektroner pr. atom.** Stigning og fald pr. atom, som i den gamle.
   Vægten viser derefter elektronerne pr. enhed: én Cr₂O₇²⁻ optager 2 · 3 e⁻.
4. **Koefficienter.** Tomme felter foran formlerne; eleven skriver også 1.
   Plus og minus på bordkanten under vægten ændrer tallet foran reaktanten.
   Skålene er tomme, indtil der står et tal, og vægten viser først = eller ≠,
   når der ligger noget på begge skåle. Et tomt felt tæller altså ikke som 1,
   så facit ikke står der, før eleven har gjort noget (brugerens første test,
   25. sept. 2026: Zn/Cu²⁺ var afstemt og grøn, før der var trykket). Den
   første reaktion på Let har derfor tal forskellige fra 1.
5. **Ladningen.** Summen før og efter pilen.
6. **H⁺ eller OH⁻.** Et felt på hver side af pilen; eleven vælger siden.
7. **H₂O.** Et felt på hver side af pilen.

På Let er trin 6 og 7 markeret "ikke nødvendig" fra start (ingen O og H). Er
der i andre reaktioner intet at gøre i trin 6 eller 7 (S9 og S14), springes
trinnet over med en besked. Til sidst står det færdige skema uden 1-taller og
med ens led slået sammen.

## Hjælpen

Den ene knap i panelet er Giv hint → Vis svaret → (næste trin) → Ny opgave.
Hintet hører til trinnet og reaktionen, fx "I MnO₄⁻ er O −II. Summen af
oxidationstallene skal være ionens ladning, −1." Vis svaret giver svaret med
beregningen, fx "Mn + 4 · (−II) = −1, så Mn = +VII." En reaktion, hvor et svar
er vist, står gul i listen og tæller ikke som løst.

Et forkert svar får en besked, der passer til fejlen (`NK.Redox.oxFejl`,
`eFejl` og `tjek*` i `js/opgave.js`):

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

Kontrollen under skemaet ("Før = efter") viser kun det, trinnet handler om,
og kun tal, eleven selv har regnet ud: ladningen i trin 6, O og H i trin 7 og
det hele, når skemaet er færdigt. Tallene er grønne, når de er ens, og følger
med, mens der skrives. I trin 4 og 5 står der intet; elektronerne vises af
vægten, og ladningen er det, trin 5 spørger om.

## Elektronvægten

Venstre skål er det, der oxideres, højre skål det, der reduceres. Hver brik
er én enhed af stoffet. Over brikkerne til venstre sidder de elektroner, den
afgiver (gule prikker), og over brikkerne til højre de pladser, de skal hen
(ringe). Vægten tipper mod den side med flest og står lige, når der er lige
mange. Under skålene står regnestykket, fx 5 · 1 e⁻ = 5 e⁻. Når
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

## Kemichael

Han tilbyder at præsentere hver sværhedsgrad første gang (Start præsentation /
Nej tak), og under anden replik peger han på det, den handler om:
opgavekortet (Let), trinlisten (Middel) og arbejdsbordet (Svær). Han roser
første gang alle reaktioner på en sværhedsgrad er løst uden Vis svaret.
Påskeæg: 20 eller flere på en vægtskål, og han kommer og peger på den
(`D.OVERVAEGT`, tre varianter). Kaffekoppen på bordet er det fælles påskeæg.

## Filer

```
index.html          toplinje, scene, panel, teori og rundvisning
css/stil.css        alt udseende (grundreglerne som sc2.4). NB: decimaltal
                    med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet og sænket skrift, lærred (som sc7.1)
js/data.js          reaktionerne, sværhedsgraderne og Kemichaels replikker
js/redox.js         modellen: oxidationstal, elektroner, afstemning og
                    beskederne til de typiske fejl
js/sprites.js       lageret til Kemichaels sprites (ingen egne sprites)
js/vaegt.js         elektronvægten på lærredet
js/opgave.js        motoren: de syv trin, tavlen, kontrollen og hjælpen
js/laerer.js        Kemichael: præsentationen, rosen og påskeægget
js/rundvisning.js   rundvisningen bag ?
js/praesentation.js tilbuddet om præsentationen (ens i alle mapper)
js/app.js           faneskift, tastatur, musen på vægten og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> sværhedsgrad · <kbd>R</kbd> start forfra ·
<kbd>H</kbd> rundvisning · <kbd>T</kbd> teori · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>Enter</kbd> tjek · <kbd>Esc</kbd> luk. Direkte links: `#let`, `#middel`, `#svaer`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med `animationer/` som rod
(Kemichael hentes derfra). Den tjekker, at alle 37 reaktioner er afstemt i
atomer og ladning med de mindste tal, oxidationstal mod tabelværdier, at
felterne læser romertal og tal, at de typiske fejl får den rigtige besked, at
alle reaktioner kan gennemføres med rigtige svar og med Vis svaret, vægten og
plus og minus, Kemichaels tilbud og præsentation, sproget og at skemaet står
på én linje fra 1100 til 1500 px i bredden.
Sidst kørt: ALT OK, 25. september 2026.

## I menuen

I menuen fra 26. sept. 2026 som c8.3 i `kemi-c-filer/samling_c8.html` (nr. 3,
fordi c8.2 og c8.3 blev til én knap; mappen hedder stadig sc8.4). Den gamle
ligger i `kemi-c-filer/arkiv/c8.4_opgaver_redoxafstemning_oldversion.html`.
