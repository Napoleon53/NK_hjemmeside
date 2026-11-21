# Til næste chat: gennemgangen af superanimationerne fortsætter

Niels 21. nov. 2026: "Når du færdig med disse rettelser, kunne jeg godt tænke mig at starte i en ny chat ... samler alt feedbacken til animationerne i et nyt genopfrisket regelsæt, og så kan vi prøve det af ved gennemgang af de øvrige animationer, som du havde udpeget til at skulle have en gennemgang."

**Start med at læse** `~/NK_hjemmeside/animationer/superanimationer/REGELSAET.md` (regelsættet) og `~/NK_hjemmeside/CLAUDE.md`.

## Det, der er gjort 21. nov. 2026

- **241 sprogforslag** (spørgsmål, der kan stå alene) sat ind i 72 animationer. Liste med numre: `ret/*.json` her i mappen. `python3 ret.py tilbage <nr>` sætter et nummer tilbage. Numrene er de samme som i oversigten i Dropbox/2026.2027, "Animationer - spørgsmål og trinvis start - 21. nov. 2026.html".
- **Spørgsmålet på egen linje** i alle animationer (`faelles/papirkort.js` og `.css`, klassen `sk-linje`).
- **Låste opgavetitler** i alle aktive animationer (regel i CLAUDE.md).
- **T1 `sc5.7_idealgasligningen`** (4 runder): trinvis start på Stemplet, rolige molekyler, intet panel (opgaverække øverst i scenen), betjening på apparaterne, klik-opfordringer kun når eleven skal klikke, formel med knapper og tal i kortet på Beregningen, zoomfejlen ved gas rettet. Opgaverne: `opgave_t1_runde2.md` til `runde4.md`.
- **T2 `sc6.2_formel_og_aktuel`** (5 runder): Blandinger begynder med "Klik på glas A ...", luppen med ioner med formlen inde, glas med etiketter, tavlen til højre uden indforståede overskrifter, svar i kortet på alle faner, panelet 300 px, krukken ved glasset, stiplet linje ved det gamle niveau, rumfanget aflæses uden sum. Opgaverne: `opgave_t2_runde2.md` til `runde5.md`.
- Intet er synkroniseret til kemiformler.dk. Selvtestenes stand før i dag: `basis.txt`.

## 21. nov. 2026, aften (ny chat)

- Niels sagde ja til forslagene til T3 (sb2.4) og T4 (sb5.2) og bad om, at fanernes øvrige fejl kom med.
- Nye regler i REGELSAET: Rækken øverst i scenen ved højst 10 opgaver og ellers et panel på 300 px (regel 3). Ingen voldsom, fed skrift (regel 30). Teorien er kort og rolig med en henvisning til Kemibogen (regel 31, `faelles/teori.css`). Niels: "de fleste animationer skal have en tur" (teorien findes i 75 animationer).

## Det, der venter: trinfanerne T3-T43

Forslagene står i `g01.json` til `g10.json` (feltet `start`) og i oversigten i Dropbox. De blev skrevet før regelsættet, så de skal læses med regelsættets øjne (fx er svar i panelet og "Klik"-bobler under et spørgsmål nu fejl i sig selv).

| T | Prio | Animation | Fane |
|---|---|---|---|
| T3 | 1 | sb2.4_ligevaegtsberegninger | 1 Beholderen |
| T4 | 1 | sb5.2_lambert_beer | 1 Lyset |
| T5 | 2 | sc1.4_afstemning | 1 Kuglerne |
| T6 | 2 | sc2.1_salt_i_vand | 2 Hvor meget kan der være? |
| T7 | 2 | sc2.3_kemikalielageret | 1 Lageret |
| T8 | 2 | sc3.3_polaere_molekyler | 1 Elektronegativitet |
| T9 | 2 | sc4.1_kogepunkt | 1 Varm op |
| T10 | 2 | sc4.5_fedtstoffer | 2 Køleskabet |
| T11 | 2 | sc4.7_alkoholer_og_syrer | 3 I vand (for meget) |
| T12 | 2 | sc5.6_maengdeberegning | 1 Vejen |
| T13 | 2 | sc5.8_natron | 1 Forsøget |
| T14 | 2 | sc6.1_koncentration | 1 Karret |
| T15 | 2 | sc6.1_koncentration | 2 c eller n? |
| T16 | 2 | sc6.1_koncentration | 4 Fortynding |
| T17 | 2 | sc6.2_formel_og_aktuel | 1 Opløsningen (delvist gjort i T2: krukken, svar i kortet) |
| T18 | 2 | sc6.3_mohrtitrering | 1 Titreringen |
| T19 | 2 | sc7.2_ph_skalaen | 3 Fortyndingen |
| T20 | 2 | sc8.7_korrosion | 1 Rørene |
| T21 | 2 | sc8.7_korrosion | 2 Skibet |
| T22 | 2 | sb1.1_reaktionshastighed | 2 Sammenstød |
| T23 | 2 | sb1.1_reaktionshastighed | 3 Hastighedsudtryk |
| T24 | 2 | sb1.4_thiosulfat | 1 Krydset |
| T25 | 2 | sb1.4_thiosulfat | 2 Koncentration |
| T26 | 2 | sb2.2_ikke_ligevaegt_og_indgreb | 1 Indgreb |
| T27 | 2 | sb4.4_oxidation_af_alkoholer | 1 Oxidationstallet |
| T28 | 2 | sb5.1_absorptionsspektre | 1 Farven |
| T29 | 2 | sb5.3_spektrofotometri | 3 To farvestoffer |
| T30 | 2 | sb6.2_titreringssimulator | 4 Ukendt prøve |
| T31 | 2 | sb8.4_log_p_og_log_d | 1 Log P |
| T32 | 3 | sc2.1_salt_i_vand | 1 Opløsningen |
| T33 | 3 | sc4.7_alkoholer_og_syrer | 2 Kogepunktet |
| T34 | 3 | sc5.10_lightergas | 2 Beregningen |
| T35 | 3 | sc6.2_formel_og_aktuel | 2 Ionerne (delvist gjort i T2: svar i kortet, tavlen) |
| T36 | 3 | sc7.1_syrebasereaktioner | 2 Produkterne |
| T37 | 3 | sc7.2_ph_skalaen | 2 Luppen |
| T38 | 3 | sc8.2_spaendingsraekken | 1 Forsøget |
| T39 | 3 | sc8.7_korrosion | 3 Rusten |
| T40 | 3 | sb3.1_navngivning | 1 Tegn molekylet |
| T41 | 3 | sb4.5_organisk_syntese | Fabrikken |
| T42 | 3 | sb7.7_aminosyrer | 3 Det elektriske felt |
| T43 | 3 | sb8.4_log_p_og_log_d | 2 Log D og pH |

## Andet, gennemgangen fandt, som ikke er rettet

- Opgaver, der kan løses ved at klikke, til tallet passer: sc6.1 Karret, sb5.1 Byg farven, skaltallet i sc1.1's spil, sc4.5 Køleskabet; sb8.6 har Rf-formlen i panelet, mens kortet spørger om den; sc4.6 har Indsend klar fra start med "ingen".
- Kemichaels boble "Start præsentation / Nej tak" midt i scenen og hen over etiketter: sb1.1, sb1.4, sc1.2, sc2.4, sc4.5, sc5.1 (også sc3.4 og sc6.3).
- sb2.4 fane 1 sætter spørgsmålet uden om `NK.Papir.tekst` (tages med T3). sc5.3's gæt lægger indledningen for sig i `kort.js`.
- I sc6.2 går keglen fra glasset til luppen hen over hjørnet af søjlediagrammet på Opløsningen.
- Stiplede pladser med navn (regel 13) og låste titler (regel 17) kan stride mod hinanden: I sb6.5 viser tavlens stiplede pladser navnene på de kommende trin ("Ligningen", "Løsningen", "pH"). Spørg Niels, om pladserne skal være uden navn.
- Spørgsmålet om skalaen i luppen og om panelet skal væk i alle animationer (som i sc5.7) er ikke afgjort for andre end sc5.7.

## Hvordan Niels vil arbejde

Han vil prøve regelsættet af på de øvrige animationer. Foreslå en rækkefølge (prioritet 1 først: T3 sb2.4 og T4 sb5.2), vis forslaget kort, byg efter hans ja, og vis animationen gennem en lokal server på en ny port. Han giver feedback runde for runde, og det, han siger "husk det" om, skrives i CLAUDE.md og i regelsættet.
