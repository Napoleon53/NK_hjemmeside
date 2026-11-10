# sb6.3 Byg figuren: fagord til kapitel B6

Ny 10. nov. 2026 (brugeren: "Kan du lave 'byg figuren' til de resterende kapitler i kemibogen B?").
Bygget efter opskriften i `../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren til et nyt
kapitel") som kopi af `../sb5.6_byg_figuren` (B5). Nummeret 3 kommer efter de to animationer i
B6-menuen (`b3.1_pKs_Ks_miniopgaver.html` og `sb6.2_titreringssimulator`).

**I menuen:** B-panelets fane "byg" som B6 "Syrer og baser" (`?emne=b6.byg`, 10. nov. 2026), linjen
under 'Byg figuren' i `FEEDBACK_EMNER` i `samling_alt_b.html` og `"b6"` i `BYG_FIGUREN` i
`NK_Undervisning/Kemibogen/stil/fagord.html` (flisen vises efter næste bygning af bogen). Brugeren
har ikke set den endnu.

## Bestillingen

1. **Pointen i én sætning.** Kapitel B6's fagord sat på figurer i B-bogens stil, så eleven ser,
   hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens b6-hydronoverfoersel, b6-amfolyt,
   b6-selvionisering, b6-regnefirkant, b6-ph-poh-skala, b6-pks-skala, b6-omdannelsesgrad,
   b6-par-styrke, b6-puffer-sammenlign, b6-titrerkurve og b6-indikatorer (`vaerktoej/lav_figurer.py`,
   `sf_b6_...`) og C-bogens titrering-opstilling.
3. **Naboerne.** `b3.1_pKs_Ks_miniopgaver.html` og `sb6.2_titreringssimulator` ejer at regne og
   titrere. Her sættes kun ord på.
4. **Loftet.** Seks faner, én pr. afsnit med fagord (B6.5 og B6.6 har ingen, så numrene står i
   `NK.AFSNIT`), og alle 31 fagord. Korresponderende syre-basepar og syrestyrkeeksponent står to
   steder (`NK.GENTAGET`).
   - B6.1 Syre-basereaktioner: 8 fagord i tre lag.
   - B6.2 Vands selvionisering og pH: 4 fagord i to lag.
   - B6.3 Syrestyrke: 8 fagord i tre lag.
   - B6.4 Basestyrke: 4 pladser (3 fagord og korresponderende syre-basepar igen) i to lag.
   - B6.7 Puffersystemer: 3 pladser (2 fagord og syrestyrkeeksponent igen) i ét lag.
   - B6.8 Titrering af en svag syre: 6 fagord i tre lag.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre. Fanernes
   navne er korte (Syre-base, pH, Syrestyrke, Basestyrke, Puffere, Titrering), så alle seks kan
   ses ved 1280 × 720.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| B6.1 | ethansyre og vand som kuglemodeller, den orange hydron, der flytter med den vinklede pil, og produkterne H₃O⁺ og CH₃COO⁻ med to grønne klammer inden i hinanden; hydrogencarbonat på sit eget kort med carbonat og kulsyre; HCl med én pil og H₃PO₄ med tre | syre (ethansyre), base (vand), hydron (den orange kugle i oxoniumionen); syre-basereaktion (titel på kortet), korresponderende syre-basepar (klammerne); amfolyt (HCO₃⁻), monohydron (titel på kortet med HCl), polyhydron (titel på kortet med H₃PO₄) |
| B6.2 | to vandmolekyler, der danner oxonium og hydroxid; et kort med K_v = [H₃O⁺] · [OH⁻] = 1,0 · 10⁻¹⁴ M²; pH-skalaen fra −1 til 15 med koncentrationerne og pOH | vands selvionisering (titel på kortet), vands ionprodukt (formlen); pH (den farvede række), pOH (den grå række) |
| B6.3 | ethansyres reaktion med vand, K_s og pK_s; pK_s-skalaen fra −8 til 10 med syv syrer på stifter; tre koncentrationer af ethansyre med c_s, [CH₃COOH], søjler og α | syrestyrkekonstant (K_s), syrestyrkeeksponent (pK_s); stærk syre, middelstærk syre og svag syre (de tre felter); formel koncentration (kolonnen c_s), aktuel koncentration (kolonnen [CH₃COOH]), omdannelsesgrad (procenterne) |
| B6.4 | ammoniaks reaktion med vand, K_b og pK_b; NaOH, der opløses i Na⁺ og OH⁻; NH₄⁺ (pK_s = 9,25) og NH₃ (pK_b = 4,75) i en klamme med 9,25 + 4,75 = 14,00 | basestyrkekonstant (K_b), basestyrkeeksponent (pK_b); stærk base (OH⁻), korresponderende syre-basepar (klammen) |
| B6.7 | 2,0 mmol HCl i 100 mL rent vand og i puffersystemet fra bogens eksempel (40 mmol CH₃COOH og 30 mmol CH₃COO⁻), pH før og efter; pufferligningen og eksemplet 4,76 + log(30/40) = 4,64 | puffersystem (titel på kortet med ethansyre og ethanoat), pufferligningen (titel på kortet med formlen), syrestyrkeeksponent (pK_s i formlen) |
| B6.8 | opstillingen med stativ, burette, konisk kolbe og magnetomrører; titrerkurven for 25,0 mL 0,100 M ethansyre med 0,100 M NaOH; phenolphthaleins bånd og en dråbeflaske | titrering (titel på opstillingen), titrerkurve (titel på grafen); ækvivalenspunkt (punktet ved 25,0 mL), halvækvivalenspunkt (punktet ved 12,5 mL); indikator (dråbeflasken), omslagsområde (båndet fra 8,2 til 10,0) |

## Valg og forenklinger

- Ord, der ville afsløre en plads, står ikke i figuren: "syre", "base" og "hydronen flytter" i
  B6.1 (B6.2 beholder "syre", "base" og "hydronen flytter", fordi de ikke er pladser dér),
  "korresponderende syre-basepar" ved klammerne, "amfolyt" under HCO₃⁻, "pH" og "pOH" ved
  rækkerne, "stærke syrer", "middelstærke" og "svage" i felterne, "omdannelsesgrad" over
  procenterne, "100 mL puffer", "puffer: halvækvivalens" og "ækvivalenspunkt: kun svag base".
- **B6.1:** produkterne står som H₃O⁺ + CH₃COO⁻ (bogen: CH₃COO⁻ + H₃O⁺). Så kan de to klammer
  ligge inden i hinanden under formlerne, og der er frit over modellerne til stregerne fra syre,
  base og hydron. Med bogens rækkefølge ville vand være spærret af en klamme både over og under.
  Hydron peger på den orange kugle i oxoniumionen, altså hydronen, efter at den er flyttet.
  Korresponderende syre-basepar har ét gult felt om begge klammer og prikken på den yderste.
  I amfolyttens kort står "afgiver H⁺" og "optager H⁺" i stedet for bogens "afgiver en hydron",
  så ordet hydron ikke står i figuren.
- **B6.2:** teksterne "sur", "neutral" og "basisk" under skalaen er taget ud for at give plads til
  pladsen ved pOH. Den lyse søjle ved pH 7 er blevet.
- **B6.3:** feltet "meget svage" (over 10) og hydrogencarbonat er taget ud, så skalaen går fra −8
  til 10. Pladserne står under aksen, og stregerne går op mellem tallene. Formel og aktuel
  koncentration skelnes ved symbolerne over kolonnerne (c_s og [CH₃COOH]), som i bogen og i
  fagordenes forklaringer. Kolonnen [CH₃COOH] er ny (regnet med K_s = 1,74 · 10⁻⁵ M; 0,0987 M er
  bogens eksempel).
- **B6.4** og **B6.7** har kun tre og to fagord. Korresponderende syre-basepar (B6.4) og
  syrestyrkeeksponent (B6.7) er gentaget fra B6.1 og B6.3, så lagene ikke bliver for små
  (brugeren 1. nov. 2026: "der må gerne være lidt repeterende øvelser").
- **B6.7:** kortet med rent vand har et gråt skilt i pladsernes størrelse ("rent vand"), så man kan
  se, hvad pladsen ved siden af spørger om.
- **B6.8:** kun den lodrette, stiplede linje ved 25,0 mL er blevet, så halvækvivalenspunktets
  plads kan stå under kurven; ved 12,5 mL står "12,5 mL" og "pH = pK_s = 4,76" ved punktet, og
  den vandrette, stiplede linje går til pH-aksen. Ækvivalenspunktet ligger i phenolphthaleins
  bånd, som i bogen; de to pladser har hver sin prik. Methylorange og bromthymolblåt er taget ud.
- Symbolerne med et sænket bogstav står uden sænkning i forklaringerne fra bogen (Ks, pKs, Kb,
  pKb, Kv, cs), fordi der ikke findes et sænket b som tegn. I fejlteksterne er de sænket, og i
  rosen er K_b undgået.
- Lagenes rækkefølge og figurernes indhold er Claudes valg.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de fælles filer (fra sb5.6, uændrede) og skal
holdes ens i alle Byg figuren-mapperne. `kurver.js` er sb1.5's tegnehjælp, kopieret uændret
(graferne, kortene og pilene). Kapitlets egne filer er `js/data.js` (forklaringerne fra
`Kemibogen/b/fagord/kapitel-b6.qmd`, lavet med et lille script), `js/b6.js` og
`js/fig_reaktion.js`, `fig_ph.js`, `fig_syre.js`, `fig_base.js`, `fig_puffer.js` og
`fig_titrering.js`.

`js/b6.js` er kapitlets egen tegnehjælp i bogens stil: kuglemodellerne med den orange hydron
(`beregn` giver atomernes pladser, så pladserne kan pege på ét atom, og `model` tegner),
ligevægtspilen, den vinklede hydronpil og de grønne klammer, felterne på pH-skalaen, en formel
med brøk (`formel`; et stykke `{ tom: "..." }` holder plads til noget, der tegnes i en anden
del), bægerglas, flaske, burette på stativ, konisk kolbe, magnetomrører, dråbeflaske og
titrerkurven regnet som bogens `b6_ph`.

`_selvtest.html`: ALT OK (994) 10. nov. 2026. Skærmbilleder af hver fane i første lag, færdig og
i den svære udgave ved 1400 × 860 og 1280 × 720 er set igennem, og træk og klik er prøvet med
musehændelser (B6.1 og B6.8).

## Ikke lavet

- I menuen, i `FEEDBACK_EMNER` og i `BYG_FIGUREN` på fagordlisten.
- Prøvet med en rigtig mus af en person.

## Papirkortet

Kortet er det lyse papirkort (se Fælles krav i `../README.md`): `../faelles/papirkort.css` er
indlæst i `index.html` og selvtesten, og `<body class="papirkort">`.
