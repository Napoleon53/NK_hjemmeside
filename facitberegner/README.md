# Facitberegner

HTML-udgave af Niels' "superskabeloner" (Excel-arket `files/Kildefiler/Superskabeloner til Kemi A 2025 u låste celler.xlsx`),
lavet 9. nov. 2026. Eleven skriver opgavens tal ind og får facit med hele beregningen, som kan kopieres til Word.
Siden ligger på kemiformler.dk/facitberegner/ uden links dertil, indtil Niels beder om det.

Tre beregnere, valgt med fliser øverst (intet valgt fra start; `#termodynamik`, `#empirisk` og `#syrebase` i
adressen åbner en direkte):

| Beregner | Svarer til arket | Fil |
|:--|:--|:--|
| Termodynamik | Termodynamik | `js/termodynamik.js` |
| Empirisk formel | Elementaranalyse | `js/empirisk.js` |
| Syre og base: én syre eller base, puffer | SyreBase | `js/syrebase.js` |
| Syre og base: syrebrøk og fordeling, polyhydron syre | (nyt) | `js/fordeling.js` |
| Syre og base: titrering | (nyt) | `js/titrering.js` |
| Kinetik: reaktionens orden og Arrhenius | Reaktionsordener, Aktiveringsenergi (Arrhenius) | `js/kinetik.js` |

## Filer

- `js/faelles.js`: læsning af tal (komma eller punktum, `1,8·10^-5`), betydende cifre som i Excel-arket
  (potens under 0,001 og over 10^n, dog højst 10 000), formler med sænket og hævet skrift, brøker og knappen
  Kopiér til Word (brøker bliver til (a)/(b), hævet og sænket skrift bliver stående).
- `js/termodata.js`: databogen fra arket Termodynamik (1245 stoffer med tilstandsform). Tilstande som `I`, `ap` og
  `s2` er rettet til `l`, `aq` og `s`; flere stoffer med samme formel og tilstand (grafit og diamant) vælges i en liste.
- `js/grundstoffer.js`: atommasserne fra Kemibogens bilag `bilag/grundstoffer.qmd` (C 12,01, H 1,008, O 16,00).
- `js/side.js`: fliserne. `css/facit.css`: udseendet oven på `../assets/style.css`.

## Valg

- Besvarelserne følger Kemibogen A: ⊖ for standardtilstand, *R* = 8,314 J/(mol · K), *T* = (273 + *t*) K (Excel-arket
  brugte 273,15), Δ*S*⊖ regnes om til kJ/(mol · K), tabel med tabelværdier og koefficienter, en kommentar til
  fortegnet, *K* med enhed fra ligevægtsloven og empirisk formel skrevet som eksemplerne i A3.1.
- Egne værdier i H⊖-, S⊖- og G⊖-felterne går forud for databogen (databogens værdi står gråt i feltet).
- Formlen skrives kompakt (Niels 9. nov. 2026: for mange parenteser): Δ*H*⊖ = 2 · *H*⊖(H₂O, l) − 2 · *H*⊖(H₂, g) −
  *H*⊖(O₂, g), altså tilstandsformen efter et komma og hver reaktant trukket fra for sig. Kemibogen A2 skriver også
  *H*⊖(H₂O, l) fra 9. nov. 2026, men beholder parentesen om produkterne og reaktanterne.
- Rækkefølgen for Δ*H*⊖ og Δ*S*⊖ er som i arket: oplyst i opgaven, så graf over Δ*G*⊖, så van 't Hoff, så databogen.
- Fejl rettet i forhold til arket: [H₃O⁺] ud fra pOH (arket regnede 10^(14 − pOH)).
- Nyt i forhold til arket: reaktionsskemaet kan skrives eller indsættes som tekst, stoffer kan findes ved navn
  ("ethanol"), "stærk syre/base", omdannelsesgrad, én tom masseprocent regnes som resten, kolonnen "Beregnet med"
  i syre og base, og hele besvarelsen til termodynamik og empirisk formel.
- pH, pOH og p*K* vises med én decimal færre end antallet af betydende cifre (3 giver 2 decimaler).
- Felterne huskes i browseren (`localStorage`, nøgler `facit-...`). Ryd alle felter står nederst.

## Syre og base (udvidet 9. nov. 2026)

Niels valgte punkt 1 af forslagene: mellemregninger, syrebrøk og polyhydrone syrer, og bagefter titrering og punkt 2
(termodynamik), og til sidst punkt 3 (empirisk formel), 4 (reaktionsordener og Arrhenius) og trin for trin fra punkt
5. Tilbage af punkt 5: tjek mit svar, link med udfyldte felter, betydende cifre ud fra opgaven og Word-ligninger.

- Hele besvarelsen følger B6.5, B6.6, B6.7, A1.6, A1.7 og A1.8: reaktionsskema, "*x* angiver her ...", SÆL-skema,
  ligningen, begge løsninger fra CAS-værktøjet (den negative forkastes), "Løsning i hånden" som klap-ud-boks (kommer kun
  med i kopien til Word, når den er åben), pH, omdannelsesgrad og genvejen med grænsen 5 %. Desuden stærk syre og
  base, fra pH til *K*s, puffer (pufferligningen, den manglende mængde og p*K*s) og omregninger.
- `SB.svag(...)` i `syrebase.js` skriver beregningen for en svag syre eller base og bruges også til første trin af en
  polyhydron syre.
- Fanen Syrebrøk og fordeling: 1 til 3 p*K*s, syrebrøk og basebrøk ved en pH (A1.7), andel på syreform til pH (kun
  monohydron) og fordelingsdiagram. For flere trin forklares det ene par som i A1.8, og tabellen regnes med alle trin.
- Fanen Polyhydron syre: pH ud fra første trin som i A1.8, kontrol med alle trin (ladningsbalancen), formerne ved den
  pH og fordelingsdiagram. pH i amfolytter regnes ikke (A1.6: ikke pensum).
- Et beregnet p*K* vises med én decimal mere i mellemregningerne, så regnestykket på skærmen giver facit.
- pH = 14,00 − pOH regnes med den afrundede pOH, der står i besvarelsen (ammoniak i B6.8 giver 11,12 som i bogen).
- Fanen Titrering (`js/titrering.js`): svag eller stærk monohydron syre eller base i kolben, stærk titrant. Besvarelsen
  følger B6.8: stofmængden fra start, ækvivalensvolumen (eller koncentrationen i kolben ud fra et ækvivalensvolumen),
  og for hvert tilsat volumen det rigtige område: genvejen (eller SÆL ved over 5 %), skema med Før, Ændring og Efter i
  mmol og pufferligningen, ækvivalenspunktet med samlet volumen og overskud. Indikator ud fra B6.8's tabel. Kurven
  regnes med ladningsbalancen. Uden volumener vises start, halvækvivalens, ækvivalens og 1,2 gange ækvivalens.
  Titrering af polyhydrone syrer er ikke med.

## Termodynamik (udvidet 9. nov. 2026)

- Tabelværdier fra databogen eller Kemibogen A's bilag (`js/termodata-kemibogen.js`, 60 stoffer). Står et stof ikke
  i Kemibogens tabel, bruges databogen, og det står ved stoffet og i besvarelsen.
- Ligevægt med SÆL-skema som i A1.3 og A1.5, når *K* kendes, og alle gasser eller opløste stoffer har en startværdi
  (0 er tilladt). *x* regnes i den retning, reaktionen forløber, så *x* er positiv. Alle reelle løsninger findes
  (som CAS), og de umulige forkastes med en sætning. Blandes bar og M, regnes ligevægten ikke.
- Opløsning af et salt (ét fast stof bliver til ioner): *K*~o~, opløselighed i M og masse pr. liter, også med en fælles
  ion fra start, og en graf over opløseligheden i rent vand fra 0 til 100 °C.
- Målinger af *K* ved flere temperaturer (indsat fra Excel): 1/*T*, ln *K*, regression uden at tvinge gennem (0,0),
  *r*², Δ*H*⊖ og Δ*S*⊖, og punkterne i van 't Hoff-grafen.

## Empirisk formel (udvidet 9. nov. 2026)

- Opgaven kan give masseprocenter eller masser i gram (med prøvens masse kan ét grundstof stå som resten).
- Dobbeltbindingsækvivalenter med formlen fra A3.1, DBE = (2 · C + 2 + N − H) / 2, hvor halogener tæller som H.
  Regnes for molekylformlen, eller for den empiriske formel, hvis molarmassen mangler.
- Fanen Fra formel til masseprocent: molarmassen og masseprocenten af hvert grundstof (også krystalvand som
  CuSO4·5H2O) og DBE.

## Kinetik (9. nov. 2026)

- Reaktionens orden: tid og koncentration sættes ind som to kolonner. "Bestem ordenen" undersøger alle tre, "Vis, at
  ..." kun den ene (A5.3 og Lærerens hæfte). Regression uden at tvinge gennem (0,0), modellen med symboler og enheder,
  graf og residualplot for hver orden, *k*, halveringstid ud fra modellens [A]~0~, hastighedsudtryk og "brug modellen"
  (koncentration ved en tid eller tid ved en koncentration). Enheden bar giver *p*(A).
- Vurderingen er en regel, Claude har valgt: en model passer, når *r*² ≥ 0,99, hældningen har det rigtige fortegn, og
  residualerne ikke ligger i en bue (højst tre fortegnsskift og samme fortegn i begge ender ved mindst fem punkter).
- Arrhenius: temperatur (°C eller K) og *k*, ln *k* mod 1/*T*, *E*~a~ = −*a* · *R*, *A* = e^*b*^, residualplot og *k* ved
  en ny temperatur. Med to målinger bruges formlen med *k*~2~/*k*~1~ fra A5.4.
- Bogens eksempler giver bogens tal (NO2 i A5.3, ibuprofen i A5.2, saccharose i A5.4).

## Trin for trin

Afkrydsningen "Trin for trin" ved hver besvarelse (`F.trin` i `faelles.js`) deler besvarelsen ved hver h4-overskrift
og viser ét trin ad gangen med "Vis næste trin" og "Vis alle trin". Valget gælder alle beregnere og huskes i browseren.
Kopiér til Word tager altid hele besvarelsen. Nye besvarelser skal kalde `F.trin(boks)`, når de er sat ind.

## Afprøvning

Siden virker åbnet direkte fra disken. Ændres en JS- eller CSS-fil, så sæt `?v=` op i `index.html`.
