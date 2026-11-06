# sc8.7 Byg figuren: fagord til kapitel 8

Ny 1. nov. 2026 (brugeren: "Når du er færdig med denne session, må du også gerne lave
byg figuren til kapitel 8 i Cniveaubogen"), bygget efter opskriften i
`../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren til et nyt kapitel"), som også
forklarer, hvordan animationen virker. I menuen Byg figuren
(`kemi-c-filer/samling_c_bygfiguren.html`) som nr. 8 "Redox" (`?emne=c8.byg`), i
`FEEDBACK_EMNER` i `samling_alt.html` og i `BYG_FIGUREN` i
`NK_Undervisning/Kemibogen/stil/fagord.html` (flisen på fagordlisten til kapitel 8 kommer,
når bogen bygges næste gang). Brugeren har ikke set figurerne endnu.

## Bestillingen

1. **Pointen i én sætning.** Kapitel 8's fagord sat på figurer i bogens stil, så eleven
   ser, hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens delreaktioner, mg-trin-2
   (luppen), spaendingsraekken, oxidationstal-eksempler, ot-skala og mangan-farver.
3. **Naboerne.** `sc8.1_spaendingsraekken`, `sc8.2_oxidationstal`,
   `sc8.4_redoxafstemning`, `sc8.5_kaliumpermanganat` og `sc8.6_korrosion` ejer at regne,
   afstemme og lave forsøg. Her sættes kun ord på.
4. **Loftet.** Fire faner, én pr. afsnit, og alle 11 fagord.
   - 8.1 Redoxreaktioner: 6 fagord i to lag.
   - 8.2 Spændingsrækken: 3 fagord i ét lag.
   - 8.3 Oxidationstal: 1 fagord og oxidation og reduktion igen fra 8.1, i ét lag.
   - 8.4 Afstemning (fanen hedder Mangans farver): 1 fagord (permanganat) og
     oxidationstal og reduktion igen, i ét lag.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| 8.1 | 2 Mg + O₂ → 2 Mg²⁺ + 2 O²⁻ med den orange klamme "magnesium afgiver 4 elektroner" og den blå "dioxygen optager 4 elektroner"; de to delreaktioner; luppen "Mens magnesium brænder" med to magnesiumatomer, der hver afgiver 2 e⁻ til et oxygenatom | redoxreaktion (titel på kortet), oxidation og reduktion (klammerne), delreaktion (de to skemaer), reduktionsmiddel (magnesiumatomerne), oxidationsmiddel (oxygenatomerne) |
| 8.2 | spændingsrækken K til Au med H₂ i midten og pilene "afgiver let elektroner" og "afgiver nødigt elektroner" over rækken | spændingsrækken (titel), uædelt (metallerne til venstre for H₂), ædelt (metallerne til højre) |
| 8.3 | H₂O, CO₂ og SO₄²⁻ med oxidationstallene over atomerne; skalaen fra −IV til +VII med Fe, Fe²⁺ og Fe³⁺, den orange pil "tallet stiger" og den blå "tallet falder" | oxidationstal (tallene over atomerne), oxidation og reduktion (foran teksterne ved pilene, som "oxidation:" i bogen) |
| 8.4 | fire bægerglas med MnO₄⁻, MnO₄²⁻, MnO₂ og Mn²⁺ med oxidationstallene over og en lang blå pil under | permanganat (navneskilt under det violette glas), oxidationstal (titel over tallene), reduktion (navneskilt under pilen) |

## Valg og forenklinger

- Ord, der ville afsløre en plads, står ikke i figuren: bogens "oxidation:" og
  "reduktion:" foran teksterne ved klammerne og foran delreaktionerne er taget af,
  "uædle metaller" og "ædle metaller" ved pilene i spændingsrækken er taget af,
  "oxidationstallet stiger" er blevet til "tallet stiger", og navnet permanganat under
  det første glas er pladsen.
- 8.3 og 8.4 har kun ét fagord hver. Ord uden for fagordlisten er ikke brugt (brugeren
  tog samme dag tommelfingerregel ud af B1), i stedet står oxidation, reduktion og
  oxidationstal igen (`NK.GENTAGET`).
- I 8.2 står pilene over rækken (i bogen under), så pladserne under rækken kan pege op
  uden at krydse dem. H₂ hører hverken til de uædle eller de ædle metaller.
- I 8.4 er bogens tre små pile mellem glassene blevet til én lang pil under dem, og
  farveordene under glassene er taget ud, fordi glassene viser farven.
- Oxygenatomerne i luppen er røde som i C-bogens kuglemodeller (bogens mg-trin-2 har
  dem grå).
- Molekylenavne (6. nov. 2026, "O₂ er altid dioxygen overalt"): den blå klamme siger
  "dioxygen optager 4 elektroner", og rosen og forklaringerne i 8.1 siger dioxygen om
  stoffet O₂. Bogens figur delreaktioner siger stadig "oxygen optager 4 elektroner".
  Oxygenatomerne i luppen hedder stadig oxygenatomer.
- Lagenes rækkefølge og figurernes indhold er Claudes valg.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de samme som i sc1.5 til sc7.6 og skal
holdes ens. `js/lab.js` er en kopi af sc7.6's tegnehjælp (kort, pile, bægerglas, lup).
Kapitlets egne filer er `js/data.js` (forklaringerne fra `Kemibogen/fagord/kapitel-8.qmd`,
lavet med et lille script) og `js/fig_redox.js`, `fig_spaending.js`, `fig_ot.js` og
`fig_mangan.js`. `_selvtest.html` åbnes direkte fra disken; ALT OK (453) 1. nov. 2026.
Skærmbilleder af hvert lag, den svære udgave og de færdige figurer ved 1500 × 950 er set
igennem.

## Papirkortet (3. nov. 2026)

Kortet er det lyse papirkort (se Fælles krav i `../README.md`): `../faelles/papirkort.css`
er indlæst i `index.html` og selvtesten, og `<body class="papirkort">`. Kun
udseendet er ændret; motoren er den samme som i `sc1.5_byg_figuren`, som var prøven.
