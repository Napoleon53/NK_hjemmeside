# sc2.3 Kemikalielageret

Superanimation om at skrive ionforbindelser: fra navn til formel og fra formel
til navn. Åbn `index.html`. Mappen henter kun filer inde fra sig selv, bortset
fra Kemichael (`../../v2/kemichael/kemichael.js`). Ingen `fetch` og ingen
moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** navnet fortæller, hvilke ioner stoffet er bygget af, og
   ladningerne afgør, hvor mange der er af hver.
2. **Afløser** `kemi-c-filer/c2.3_Ionforbindelser_navngivning.html`. Med fra den
   gamle: 30 opgaver i tre slags, trinene (ionerne først, så formel eller navn),
   at eleven selv skriver svaret, hjælp i grader, det periodiske system, frit
   valg af opgave og facit på løste opgaver.
3. **Naboerne:** `sc2.2_saltbygger` ejer lynlåsen og at bygge et salt med musen,
   `c2.1` ejer opløsningen, `c2.4` fældningen og `sc1.1` elektronoverførslen, der
   giver ionerne deres ladning. Intet af det kopieres herind.
4. **Loftet:** 2 faner. 30 stoffer ad gangen (36 i alt med de 6 sværere), de
   samme på begge faner. På scenen højst 30 glas, 2 plakater, etiketmaskinen og
   Kemichael.
5. **Layoutet:** scene plus panel. Fane 1: scenen er lageret (reol, arbejdsbord,
   etiketmaskine), panelet er opgavekortet. Fane 2: scenen er samlebåndet med
   etiketmaskinen som tastatur, panelet er point og start.

## Hvad den viser

Lagerets 30 glas har mistet halvdelen af etiketten. De er de samme serieopgaver
som før, men hver opgave er nu et glas med et rigtigt stof i.

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Lageret | tager et glas ned, finder ionerne og skriver formlen eller navnet | ionerne lægges i det antal, der får plus og minus til at gå op |
| 2 | Samlebåndet | skriver den manglende halvdel, før glasset når kassen | det samme på tid, i begge retninger |

**Lageret.** Tre hylder à ti glas: *Skriv formlen* (hovedgrupperne, navn til
formel), *Skriv navnet* (metaller, hvis ladning skal regnes ud af formlen) og
*Sammensatte ioner* (begge veje). Et klik på et glas tager det ned på bordet.
Panelet har én række pr. ion og én til sidst. Hver ion, eleven finder, lægger
sig som en kugle ved glasset. Er formlen eller navnet rigtigt, kommer der
kugler til, så der står 2 Al³⁺ og 3 O²⁻ med +6 og −6, i alt 0. Kuglerne ryger
ned i glasset, etiketmaskinen printer en ny etiket, og under scenen står, hvor
man møder stoffet. Et glas løst uden at se svaret får en stjerne.

**Samlebåndet.** Glassene kører mod kassen med halvdelen af etiketten. Svaret
skrives på etiketmaskinen og gælder altid det forreste glas (pilen). Rigtigt:
etiketten printes, og glasset ryger op på hylden, hvor navn og formel kan læses
(glassene er større der, og etiketten går lidt om på siderne). Hylden viser de
sidste glas, der er plads til. Forkert: samme forklaring som
på lageret, og stimen er væk. Et glas i kassen koster et liv, og efter tre er
spillet slut. Kassen viser bagefter facit på de glas, der røg i den. Hvert
femte rigtige svar giver et nyt niveau: formler, navne, sammensatte ioner og
til sidst det hele blandet i begge retninger og hurtigere.

**Sværere ioner.** Kontakten i toplinjen er slået fra som udgangspunkt. Så
holder glassene sig til det, kompendiet til kapitel 2 bruger: hovedgrupperne
blandt de første 20 grundstoffer plus Br, I og Ba, metalionerne Fe, Cu, Ag og Zn
og de seks vigtige sammensatte ioner (OH⁻, NO₃⁻, SO₄²⁻, CO₃²⁻, PO₄³⁻, NH₄⁺).
Slås den til, bytter seks glas plads med sværere stoffer: SrCl₂ for CaCl₂, PbO₂
for CuO, SnF₂ for Ag₂S, HgO for FeCl₂, NaHCO₃ for KNO₃ og Pb(NO₃)₂ for CuSO₄.
HCO₃⁻ kommer på plakaten, og samlebåndet trækker fra det samme sæt. Kontakten og
fremskridtet huskes for alle 36 stoffer, så intet går tabt ved at slå den til
og fra.

**Kemichael** præsenterer fanen første gang, den åbnes i en browser: på lageret
tre korte replikker (han peger over på panelet, mens han siger, at svarene
skrives dér, og feltet lyser op), ved samlebåndet to. Scenen låser ikke: man kan
klikke og skrive, mens han taler. Han går kun ved den store knap "Spring
præsentationen over", to klik direkte på ham (det første får knappen til at
blinke) eller Esc, og på samlebåndet også ved Start. <kbd>K</kbd> viser
præsentationen igen. Det er reglen for alle superanimationer (se
`../README.md`, "Kemichael præsenterer hvert rum"). Replikkerne står i `D.INTRO` og
`D.INTRO_BAAND` i `js/data.js`. Ellers kommer han på besøg, når en hylde er
færdig, og når spillet er slut. Kaffekoppen på arbejdsbordet er det fælles
påskeæg.

**Plakaterne** med det periodiske system og de sammensatte ioner hænger på
væggen i begge faner og åbnes i stort format med et klik (eller <kbd>P</kbd> og
<kbd>I</kbd>). Panelerne har ingen knapper til opslag. På samlebåndet kører
båndet videre, mens man slår op.

**Etiketmaskinen** viser det, der skrives, som det kommer til at se ud. Står
markøren ikke i et felt, siger displayet "Skriv i feltet til højre →"; står den
i et felt, siger det, hvad der skal skrives ("Skriv ionen for natrium"). Et klik
på maskinen sætter markøren i feltet.

Direkte link: `index.html#baand` giver samlebåndet.

Genveje: <kbd>1</kbd> <kbd>2</kbd> faner · <kbd>P</kbd> periodisk system ·
<kbd>I</kbd> sammensatte ioner · <kbd>R</kbd> start glasset eller spillet forfra ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation · <kbd>Enter</kbd> næste glas ·
<kbd>Esc</kbd> luk eller send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Opgaverne er glas med rigtige stoffer.** Glasset viser stoffets farve
  (rust, kobber(I)oxid, zinkoxid), og efter løsningen står én linje om, hvor man
  møder det: salmiak i lakrids, potaske i brunkager, bly(IV)oxid i bilbatteriet.
* **Formlen bliver vist, ikke kun tjekket.** Kuglerne med ladningstallene gør
  det synligt, hvorfor der skal to Al³⁺ og tre O²⁻ til.
* **Et forkert svar får en besked, der passer til fejlen**, i stedet for "Ikke
  helt rigtigt". Tjekket kender over 40 typiske fejl: ladningen glemt, fortegnet
  vendt, O⁶⁻ i stedet for O²⁻, tallene byttet om, parentesen glemt, ettal, -ion
  i stoffets navn, romertal glemt eller forkert, di- og tri-, sulfid for sulfat,
  nitrit for nitrat, ammoniak for ammonium og hverdagsnavne som rust og natron.
* **Hjælpen hentes med én knap**: Giv hint, så Vis svaret. Hintet hører til det
  felt, man står i, og kan få en plakat til at lyse op. Før stod hjælpeteksten
  fast under hvert felt.
* **Etiketmaskinen viser, hvad man skriver**, med sænkede og hævede tal. Man
  skriver `Al2(SO4)3` og ser Al₂(SO₄)₃, eller `Al2SO43` og ser, at det er forkert.
* **Store og små bogstaver tæller nu i formler** (CL er ikke Cl), med en besked
  om det. I navne er de ligegyldige.
* **Fejlen om Sn og Pb er rettet.** Den gamle kaldte dem undergruppemetaller. De
  står i hovedgruppe 4, men har flere mulige ladninger. Det periodiske system er
  nu det fulde (periode 1-6) med hovedgruppenumre og en markering af de metaller,
  der har flere ladninger.
* **Nogle stoffer er skiftet ud** med nogle, der findes i hverdagen, og nye
  mønstre er kommet til: KI (1:1), FeCl₃ (3:1), Ag₂S, AgBr, CuSO₄ og
  (NH₄)₂SO₄, hvor den positive ion står i parentes. Cs₃P, SrI₂, CaBr₂, NiBr₂,
  SnO, AgCl, Mg(NO₃)₂ og Li₃PO₄ er ude. De sværste er flyttet bag kontakten
  Sværere ioner.
* **Opgaveteksten er kortere.** "Denne forbindelse hedder natriumoxid. Bestem
  ionerne, og opskriv til sidst den samlede formel" er blevet til glassets
  etiket plus "Find ionerne, og skriv formlen". Rækkerne i panelet siger resten.
* **Fremskridtet huskes** i browseren, og samlebåndet er nyt.

## Filer

```
index.html          markup for begge faner, plakaterne i stort format og rundvisningen
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
sprites/            pulverglas, etiketmaskine og kasse (SVG)
js/kerne.js         NK-navnerum, hævet og sænket skrift, formler, hukommelse, lærred
js/data.js          grundstofferne, ionerne, de 36 stoffer, trinene og hjælpen
js/tjek.js          tjek af ion, ionnavn, formel og navn; beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       glas, etiketter, ionkugler, etiketmaskine, reol, plakater, bånd, kasse
js/opslag.js        det periodiske system og de sammensatte ioner i stort format
js/sim_lager.js     fane 1
js/sim_baand.js     fane 2
js/laerer.js        Kemichael på begge faner
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Stofferne** står i `S` i `js/data.js`: positiv ion, negativ ion, retning,
hylde, farve, form og fakta-linjen. Formlen, navnet, trinene og hjælpen regnes
ud af ionerne. En ny ion skrives i listen over ioner lige over. Hver hylde skal
have ti glas. De sværere står i `SVAER` med pladsen på hylden som sidste tal;
de tager den plads, når kontakten er slået til. Skal der flere sværere stoffer
til, tilføjes de dér, og `D.SVAER_IONER` rettes, så kontaktens forklaring passer.

**Hjælpen** står i `D.hjaelp` i `js/data.js`, én gren pr. slags felt.

**Fejlbeskederne** står i `js/tjek.js`. Forvekslinger (sulfid for sulfat osv.)
står i `FORVEKSLING`, hverdagsnavne i `HVERDAG`, stavemåder, der godkendes med en
bemærkning, i `STAVNING`.

**Niveauerne på samlebåndet** står i `NIVEAUER` i `js/sim_baand.js`: tiden er den
tid, et glas er om at køre hele båndet, og `max` er antal glas på båndet ad
gangen.

**Kemichaels replikker** står nederst i `js/data.js`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at alle 30 formler
går op med de mindste tal og har parentes de rigtige steder, at alle rigtige svar
godkendes (også med hævet skrift og mellemrum), at grundsættet kun bruger
kompendiets ioner, at kontakten Sværere ioner bytter de seks glas og kan slås
fra igen uden tab, at over 40 typiske fejl giver den
rigtige besked, at der er hint og svar til alle 120 felter, at sproget holder
reglerne, at begge faner kan gennemføres, og at layoutet holder fra 520 × 380
til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files`. Den lægger elevens gemte fremskridt tilbage
bagefter.

## Forenklinger

* Farverne er de vandfri stoffers (CuCl₂ er gulbrunt, ikke blågrønt som
  dihydratet).
* Fe(OH)₃ er skrevet som i bogen, selv om okker mest er FeO(OH).
* Kviksølv har kun Hg²⁺ med. Hg⁺ er i virkeligheden Hg₂²⁺ og hører ikke til
  C-niveau.
* Kalium, natrium og de andre metaller i hovedgrupperne har kun den ladning,
  hovedgruppen giver. Sn og Pb er markeret som metaller med flere ladninger.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven i scenen. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er `js/praesentation.js` (samme fil som i sc1.2), som i
`js/app.js` pakker den gamle `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".

## I menuen

Siden 23. september 2026 er den c2.3 i `animationer/kemi-c-filer/samling_c2.html`
(knappen med `data-emne="c2.3"`, der peger på
`../superanimationer/sc2.3_kemikalielageret/index.html`). Delte links via
`samling_alt.html?emne=c2.3` går hertil. Den gamle ligger i
`kemi-c-filer/arkiv/c2.3_Ionforbindelser_navngivning_oldversion.html`, og i
`FEEDBACK_EMNER` i `animationer/samling_alt.html` hedder den `'Kemikalielageret'`.
