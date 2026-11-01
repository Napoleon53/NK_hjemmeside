# sc4.9 Byg figuren: fagord til kapitel 4

Ny 1. nov. 2026 (brugeren: "du må også gerne lave kapitel 4"), bygget efter
opskriften i `../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren til et nyt
kapitel"), som også forklarer, hvordan animationen virker. I menuen Byg figuren (`kemi-c-filer/samling_c_bygfiguren.html`, knappen "byg" i
animationspanelet) som nr. 4 fra 2. nov. 2026 (`?emne=c4.byg`).
Mappen må ikke forveksles med forsøget `v2/superlab/sc4.9_fedt_i_chips`, som er nr. 8
i C4-menuen.

## Bestillingen

1. **Pointen i én sætning.** Kapitel 4's fagord sat på figurer i bogens stil, så
   eleven ser, hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens alkaner-fire,
   isomerer-c4, navngivning-regler, forbraending-flammer, propan-afstem,
   substitution-glas, ethan-ethen-ethyn, addition, bromvand-test, polyethen, ringe,
   funktionelle-grupper, fedtsyrer, triglycerid og haerdning.
3. **Naboerne.** `sc4.1_kogepunkt`, `sc4.2_zigzagformler`, `sc4.4_addition_og_plastik`
   og `sc4.6_fedtstoffer` ejer at bygge og regne. Her sættes kun ord på.
4. **Loftet.** Seks faner, én pr. afsnit, og alle 43 fagord. Hver figur har 6 til
   10 fagord.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| 4.1 | tre rammer inden i hinanden: glucose, ethen, methan og butan; uorganiske stoffer; benzin, der fordamper | organisk kemi, carbonhydrid, alkan (rammerne), uorganisk, molekylformel (C₄H₁₀), flygtig |
| 4.2 | butan og 2-methylpropan som zigzagformler med en prik ved hvert C; 3-methylhexan med grøn hovedkæde og blå sidegruppe | zigzagformel (foran rækken), uforgrenet, forgrenet, isomerer (rammen), hovedkæde, sidegruppe |
| 4.3 | blå og gul flamme med lup; skemaet for methan og en optælling af atomerne; substitution af hexan med dibrom i lys | forbrænding (rammen), fuldstændig, ufuldstændig, carbonmonoxid (CO i luppen), afstemt (optællingen), substitution |
| 4.4 | ethan, ethen og ethyn; bromvand før og efter; addition af dibrom; polyethen; cyclohexan og benzen | mættet, umættet (rammerne), alken, alkyn, addition, bromvand, polymerisation, polymer (kæden), cycloalkan, aromatisk |
| 4.5 | ethan, ethanol og ethansyre med grupperne i teal kasser og to rækker under | funktionel gruppe og stofklasse (foran rækkerne), hydroxygruppe, carboxylgruppe, alkohol, carboxylsyre |
| 4.6 | stearinsyre, oliesyre og linolsyre; glycerol og tre fedtsyrer giver fedtstof og vand; planteolie bliver til margarine | fedtsyre (rammen), mættet (igen, se nedenfor), monoumættet, polyumættet, glycerol, fedtstof eller triglycerid (et par), hydrolyse (pilen tilbage), olie, hærdning |

## Valg og forenklinger

- Ord, der kan forsvares to steder, er skilt ad med et eksempel, der kun passer på
  det ene: ethen ligger i rammen med carbonhydrider, men uden for rammen med
  alkaner (4.1), og glucose med O ligger kun i den store ramme.
- Ord fra tidligere afsnit står som grå skilte, så eleven kan se, hvad pladsen ved
  siden af spørger om: molekylformel (4.2), alkan (4.4 og 4.5), ingen (4.5) og fast
  fedt (4.6).
- Mættet står på to figurer: i 4.4 ved ethan og igen i 4.6 ved stearinsyre, hvor det
  før var et gråt skilt (brugeren 1. nov. 2026: "lad bare eleven sætte det på igen").
  Det står i `NK.GENTAGET` i `data.js`, så selvtesten tillader det.
- Carboxylgruppe, ikke syregruppe: brugeren spurgte 1. nov. 2026, om pladsen skulle
  hedde syregruppe, som man siger i praksis, men besluttede at beholde bogens ord
  ("Det er jo nok også teknisk mest korrekt").
- 4.2 har ingen række med stregformler: 2-methylpropan bliver for tæt som
  stregformel. Molekylformlerne står under zigzagformlerne.
- Fedtstof og triglycerid er et par ("[ ] eller [ ]") som salt og ionforbindelse i 2.3.
- `js/org.js` er kapitlets egen tegnehjælp (stregformler, zigzagkæder, grå skilte)
  og ikke en del af den fælles motor.
- Ingen ord i overskud. Lagenes rækkefølge og figurernes indhold er Claudes valg;
  brugeren har ikke set figurerne endnu.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de samme som i sc1.5, sc2.7 og sc3.6
og skal holdes ens. Kapitlets egne filer er `js/data.js` (forklaringerne fra
`Kemibogen/fagord/kapitel-4.qmd`, lavet med et lille script, kursiv taget af),
`js/org.js` og `js/fig_alkan.js`, `fig_zigzag.js`, `fig_reak.js`, `fig_alken.js`,
`fig_alkohol.js` og `fig_fedt.js`. `_selvtest.html` åbnes direkte fra disken; ALT OK
(1224) 1. nov. 2026.
