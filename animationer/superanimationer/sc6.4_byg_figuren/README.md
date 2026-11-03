# sc6.4 Byg figuren: fagord til kapitel 6

Ny 1. nov. 2026 (brugeren: "Du må også gerne lave kapitel 5 og kapitel 6 nu"),
bygget efter opskriften i `../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren
til et nyt kapitel"), som også forklarer, hvordan animationen virker. I menuen Byg
figuren (`kemi-c-filer/samling_c_bygfiguren.html`, knappen "byg" i animationspanelet)
som nr. 6 (`?emne=c6.byg`) og som flise på Kemibogens fagordliste til kapitel 6.
Overskriften Mohrtitrering står midt på rammen over trinet Under; rammen er symmetrisk
om de tre trin. Flyttet mellem Før og Under stod den lige under pladsen afvigelse.

## Bestillingen

1. **Pointen i én sætning.** Kapitel 6's fagord sat på figurer i bogens stil, så
   eleven ser, hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens maalekolbe, fortynding,
   formel-aktuel, titrering-opstilling og mohr-trin og bogens eksempler (0,90 %
   saltvand, 0,20 mol CaCl₂ i 1,0 L, 1,40 % salt i chips og afvigelsen på 8 %).
3. **Naboerne.** `sc6.1_koncentration`, `sc6.2_formel_og_aktuel` og
   `sc6.3_mohrtitrering` ejer at regne og titrere. Her sættes kun ord på.
4. **Loftet.** Tre faner, én pr. afsnit, og alle 19 fagord. 6.2 har kun to fagord i
   bogen, så eleven sætter også stofmængde (kapitel 5), formelenhed (kapitel 2) og
   molær (6.1) på igen.
   - 6.1 Koncentration: 8 fagord i tre lag.
   - 6.2 Formel og aktuel: 2 fagord og 3 gentagne i to lag.
   - 6.3 Titrering: 9 fagord i tre lag.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| 6.1 | 9,0 g salt + 991 g vand → 1000 g saltvand med en lup over ionerne; saltvandets etiket med tre linjer; en målekolbe på 500 mL; fortyndingen fra 100 mL (0,30 M) til 300 mL (0,10 M) | opløst stof, opløsningsmiddel, opløsning (skilte under kortene), masseprocent (m%-linjen), stofmængdekoncentration (c i mol/L), molær (kun bogstavet M), målekolbe (skilt), fortynde (pilen med + 200 mL vand) |
| 6.2 | "0,20 mol calciumchlorid opløses …" og reaktionsskemaet; før: lup med to formelenheder CaCl₂ og søjlerne c(CaCl₂), c(Ca²⁺), c(Cl⁻); efter: lup med ionerne og søjlerne [CaCl₂], [Ca²⁺], [Cl⁻] | stofmængde (0,20 mol), formelenhed (den øverste CaCl₂ i luppen), formel koncentration og aktuel koncentration (skilte under søjlerne), molær (M ved aksen) |
| 6.3 | tre kort om saltet i chips; opstillingen med stativ, burette, kolbe på magnetomrører og en dråbeflaske; Mohrtitreringen i tre trin med kolbe og lup | kvalitativ analyse, kvantitativ analyse, afvigelse (skilte under kortene; afvigelsen står som superberegning, og ordet til venstre for lighedstegnet er en streg, til pladsen er løst), titrering (skilt under opstillingen), burette, indikator (dråbeflasken), Mohrtitrering (overskrift på rammen), omslag (den lyserøde kolbe), ækvivalenspunkt (luppen ved den sidste kolbe) |

## Valg og forenklinger

- Gentagelse (brugeren 1. nov. 2026: "der må gerne være lidt repeterende øvelser"):
  formelenhed og stofmængde står i `NK.TIDLIGERE` i `data.js` med forklaringerne fra
  kapitel 2's og kapitel 5's fagordlister, og molær står i `NK.GENTAGET`, fordi
  ordet også sidder på etiketten i 6.1.
- Molær og stofmængdekoncentration sidder på to linjer på etiketten: c(NaCl) = 0,15
  mol/L og c(NaCl) = 0,15 M. Pladsen til molær har kun bogstavet M i sit gule felt,
  så eleven kan se, at den ikke spørger om hele koncentrationen.
- Opløst stof peger på saltet, før det røres ud, som i bogens "Saltet er det opløste
  stof". Kortene står som et skema: salt + vand → saltvand.
- Omslag og ækvivalenspunkt sidder på samme trin: omslaget er farven, man ser i
  kolben, og ækvivalenspunktet er luppen, hvor alt chlorid netop har reageret (bogen:
  "Ækvivalenspunktet er ikke altid synligt for det blotte øje"). Trinnene hedder Før,
  Under og Til sidst, så titlen ikke afslører omslag.
- Titrering og Mohrtitrering: opstillingen er almindelig (lys væske i kolben), og
  rammen nederst med sølv(I)ioner og chloridioner er den bestemte titrering med
  sølv(I)nitrat. Fejlteksten forklarer forskellen, hvis de byttes om.
- Indikatoren er en brun dråbeflaske ved kolben. Pillerne i lupperne har ingen
  tekst, så de ikke afslører ordet indikator i den svære udgave.
- Lupperne i 6.3 er lidt større end i bogen (r 57), så ionerne kan ses.
- Ingen ord i overskud. Lagenes rækkefølge og figurernes indhold er Claudes valg;
  brugeren har ikke set figurerne endnu.

- Rettet 1. nov. 2026 efter brugerens første gennemsyn: afvigelsen i 6.3 står som en
  superberegning (formlen i ord, tallene og resultatet med brøkstreger og
  lighedstegnene under hinanden). Bogen skriver "afvigelse =", men ordet ville afsløre
  pladsen, så den grå udgave har en streg til venstre, og ordet kommer, når pladsen er
  løst (`fuld()` ser, om den tegner den grå udgave). Kortet er højere, og
  Mohrtitreringen er rykket ned. Rosen i 6.1 siger nu, at saltet kaldes det opløste
  stof, også før det er rørt ud (brugeren: "det virker lidt off ... Jeg har ikke
  umiddelbart løsninger der er bedre end din").

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de samme som i sc1.5, sc2.7, sc3.6 og
sc4.9 og skal holdes ens. Kapitlets egne filer er `js/data.js` (forklaringerne fra
`Kemibogen/fagord/kapitel-6.qmd`, lavet med et lille script, kursiv taget af),
`js/lab.js` (kapitlets egen tegnehjælp: bægerglas, målekolbe, erlenmeyerkolbe, lup,
ioner, sølv(I)chlorid og indikatorpiller) og `js/fig_konc.js`, `fig_aktuel.js` og
`fig_titrering.js`. `_selvtest.html` åbnes direkte fra disken; ALT OK (613) 1. nov.
2026. Kortet med ordene dækker ingen plads eller gult felt i den svære udgave ved
1920 × 1080, 1500 × 950, 1366 × 768 og 1280 × 720.

## Papirkortet (3. nov. 2026)

Kortet er det lyse papirkort (se Fælles krav i `../README.md`): `../faelles/papirkort.css`
er indlæst i `index.html` og selvtesten, og `<body class="papirkort">`. Kun
udseendet er ændret; motoren er den samme som i `sc1.5_byg_figuren`, som var prøven.
