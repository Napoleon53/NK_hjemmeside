# Superanimationer

Denne mappe indeholder superanimationer og kun dem, bortset fra `tegnebraet/`, et værktøj
til rapporter, der deler motor med `sc6.2`. En superanimation handler om
**ét begreb**. De virtuelle laboratorieforsøg, superlab-animationerne, handler om
**ét forsøg** og ligger ikke her. De gamle udgaver står i `../v2/superlab/` og
`../v2/superlab_ny/`, og nye bygges i `C:\NK_Undervisning\virtuelt_laboratorium\`.

Kravene til begge slags står i `../v2/README.md`. Den mappe er frosset, så denne
fil er superanimationernes egen udgave: alt, der gælder her, står her.

## De to slags

|  | Superanimation (her) | Superlab-animation (ikke her) |
|--|----------------------|-------------------------------|
| Handler om | ét begreb | ét forsøg |
| Eleven | bygger, skruer, forudsiger og spiller | udfører forsøget selv, trin for trin |
| Form | op til fire faner med hver sin vinkel på samme idé | én scene med en rigtig opstilling, normalt uden faner |
| Kode | selvstændig mappe med egen kerne | står på den fælles motor i `../v2/laboratoriet/` |
| Kemichael | er ikke med; højst et kort cameo. Hjælpen er en gul hintknap | fast bestanddel |

Begge er selvbærende: eleven kan bruge dem alene, uden at emnet er gennemgået på
tavlen først. Det er det, der gør dem super, ikke at de er store eller ligger i
deres egen mappe.

## Grænsen til laboratoriet

En superanimation **må gerne** perspektivere til noget eksperimentelt. Det sker
flere steder og er helt i orden:

* `sc3.3_polaere_molekyler` fane 3 er forsøget med vandstrålen, én fane ud af tre.
* `sc3.4_blandbarhed_inaktiv` hælder væsker i reagensglas og varmer en kolbe.
* `sc2.1_salt_i_vand` sætter bægerglasset på en varmeplade med termometer.
* `sb3.2_titreringssimulator` har en hel titreropstilling, man selv betjener.

Det afgørende er ikke, om der er glasudstyr på skærmen. Det afgørende er, hvad
animationen er bygget op om:

* **Superanimation:** begrebet styrer. Opstillingen er en model, eleven skruer på,
  og faner, opgaver og spil belyser den samme idé. Egen mappe, egen kerne.
* **Superlab-animation:** forsøget styrer. Eleven følger et forløb trin for trin,
  kan lave de fejl man kan lave i et rigtigt laboratorium, får uheld, oprydning og
  et resultat, der afhænger af udførelsen. Den bygges på den fælles motor.

Så `sb3.2` hører hjemme her, selv om fane 1 hedder Laboratoriet. Eleven arbejder
med titrerkurven som model gennem fire faner, ikke med ét forsøg fra ende til
anden. En animation, der derimod fører eleven gennem én laboratorieøvelse med
forløb, uheld og oprydning, hører ikke til i denne mappe.

## Udgangspunktet

En superanimation bliver til på en af to måder.

**1. Den forbedrer en eksisterende animation.** Så rummer den som udgangspunkt de
samme elementer som den gamle. Det, der er værd at tage med, tages med, og resten
bygges om. Den må gerne udvide, men udvidelsen skal være logisk sat op og tjene
det samme spørgsmål. Der er plads til at freestyle en smule, ikke til at skifte
emne. Hvad der er taget med, og hvad der er nyt, skrives i mappens egen README.

**2. Den bygges fra bunden**, fordi begrebet ikke havde en animation før. Det
gælder `sb2.0_ligevaegt_intro` og `sb3.2_titreringssimulator`.

Afløser den en gammel enkeltfil, flyttes den gamle til `arkiv/` med `_oldversion`
i navnet. Det sker først, når den nye kommer i menuen.

## Bestillingen, før der skrives kode

Erfaringen fra `sc3.4_blandbarhed_inaktiv`: en løs bestilling bliver til en for
stor animation. Den kom til at dække nabofilens forsøg, lånte superlabbens
flasker og uheld, og fik en fane om destillation, som er et andet emne. Skriv
derfor fem ting ned, før arbejdet går i gang.

1. **Pointen i én sætning.** For 3.4: "polariteten afgør, om der bliver ét lag
   eller to, og tætheden afgør kun rækkefølgen." Det, der ikke tjener sætningen,
   kommer ikke med.
2. **Hvad den afløser, og hvad der skal med.** Nævn de elementer fra den gamle,
   der virker, og det, den gamle gjorde godt rent visuelt.
3. **Naboerne, der ejer resten.** Fx: `sc3.3` ejer elektronegativitet og
   polaritet, og `c3.5` ejer forsøget med reagensglas. De røres ikke, og deres indhold kopieres ikke
   herind.
4. **Loftet, skrevet som tal.** Antal stoffer, antal faner og antal objekter på
   skærmen. En fane er en ny vinkel på den samme sætning, aldrig et nyt emne.
   Fire faner er et loft, ikke et mål: har begrebet to vinkler, er der to faner.
5. **Layoutet.** Er scenen stjernen i næsten hele billedet, som i den gamle 3.4,
   eller er det scene plus panel? Det afgøres før, ikke undervejs.

### Stop-listen

Er et af disse træk på vej ind, er det ved at blive en superlab-animation:
flasker man hælder med musen, et stativ med reagensglas, et affaldsglas, uheld
og oprydning, eller et forløb trin for trin. Stop, og spørg brugeren.

### Ved uklarhed

Er svaret på et spørgsmål uklart, så spørg igen med to konkrete muligheder, og
vælg den mindste af dem. Et uklart svar må aldrig blive til den store løsning.

### Udstyr tegnes som sprites først

Glasudstyr og flasker lægges som SVG i `sprites/` og vises for brugeren alene,
før de sættes i bevægelse. Mønster: `sc2.1_salt_i_vand`. Tegnes de i kode midt
inde i en simulation, opdages det sjuskede først til sidst.

## Oversigt

"I menuen" betyder, at en samlingsfil (`samling_*.html`) linker til mappen. En ny
animation kommer først i menuen, når brugeren siger til.

Spillene hedder `sc_spil<nr>_<navn>`, hvor nummeret er pladsen i
`kemi-c-filer/samling_c_spil.html` (brugerens ønske 3. okt. 2026). Den sidste gamle
enkeltfil i `kemi-c-filer/` følger med: `c_spil8_escaperoom.html`. Et spil uden nummer (`sc_spil_raindrops`) er ikke i menuen
endnu og får sit nummer, når det kommer det. Flyttes et spil i menuen, omdøbes mappen
med `git mv`, og navnet rettes i samlingsfilerne og i de README-filer, der nævner det.
`data-emne` (fx `spil.iontetris`) ændres ikke, så delte links til menuen holder.

**Kemi B-menuen blev omnummereret 9. okt. 2026** (brugerens valg, samme numre som kapitlerne
i Kemibogen B): B1 Kinetik, B2 Ligevægt, B3 Bindinger og isomeri, B4 Funktionelle grupper,
B5 Spektroskopi, B6 Syre/Base, B7 Fødevarer (før Kulhydrater) og senere B8 Medicin. Den
gamle samling "Organisk B" blev delt i to: den nye fil
`kemi-b-filer/samling_b_bindinger_isomeri.html` (B3: Intermolekylært, Geometrisk isomeri,
Spejlbilledeisomeri) og `kemi-b-filer/samling_b4,5,6.html` (B4: Estersyntese, DNPH/Tollens,
Oxidation af alkohol, Organisk syntese, Tegnebræt, Organiske grupper). Ingen filer eller
mapper er omdøbt, og ingen `data-emne` er ændret. Filnavne og koder følger derfor ikke
længere numrene:

| Menuen viser | Samlingsfil | Link-koder (`data-emne`) | Mapper |
|:--|:--|:--|:--|
| B3 Bindinger og isomeri | `samling_b_bindinger_isomeri.html` | `b4`, `b6geo`, `b6spejl` | `sb4.4`, `sb4.6`, `sb4.7` (ikke i menuen endnu) |
| B4 Funktionelle grupper | `samling_b4,5,6.html` | `b5ester`, `b5dnph`, `b5oxid`, `eb5`, `tegnebraet`, `b.spil.organiske` | `sb4.5` (nu nr. 4) |
| B5 Spektroskopi | `samling_b9.html` | `b9.1` til `b9.5` | `sb9.1`, `sb9.3`, `sb9.4` |
| B6 Syre/Base | `samling_b3.html` | `b3.1`, `b3.2` | `sb3.2` |
| B7 Fødevarer | `samling_b7.html` | `b7.10` | |

`findSideFraEmne` i `samling_alt_b.html` sender koderne til den rigtige samling, og
`FEEDBACK_EMNER` samme sted og listen på `animationer.html` følger de nye numre. En ny
superanimation til kemi B får nummer efter den nye menu (fx `sb5.x` til spektroskopi).
`sc_spil_lykkehjul/` og `sc_spil_kemikort/` har kun en `index.html`, der sender gamle
links til delte quizzer og kortsæt videre til de nye mapper.

| Mappe | I menuen | Note |
|-------|----------|------|
| `s_flowchart_opgaven` | ja | `samling_NV.html` øverst uden nummer (badge ?) som "Hjælp til selvhjælp" (28. sept. 2026, `?emne=hjaelp`); ny, 26. sept. 2026; ikke en superanimation om et begreb, men brugerens Word-flowchart "Kan du løse opgaven?" som studieværktøj med samme ramme: brikken går rundt på flowchartet, hvert Ja og Nej bliver tjekket med en sarkastisk udfordring, og et svar, eleven ikke kan stå inde for, sender brikken tilbage ad pilen; generel udgave uden fagligt indhold og uden Kemichael (brugerens ønske) |
| `sb1.1_reaktionshastighed` | ja | `samling_b1.html`; den gamle b1.1 ligger i `kemi-c-filer/arkiv/` |
| `sb1.4_thiosulfat` | ja | `samling_b1.html` som b1.4 (26. sept. 2026); ny, sept. 2026, bygget fra bunden ud fra forsøget med thiosulfat og syre (krydset, koncentration, temperatur); eleven stopper selv uret og regner koncentrationerne ud |
| `sb2.0_ligevaegt_intro` | nej | den første superanimation, bygget fra bunden; var i `samling_b2.html` som b2.0 fra 26. sept. 2026 og blev taget ud igen 2. okt. 2026, fordi den stadig er i beta (brugerens valg) |
| `sb2.1_ligevaegtsloven` | nej | ny, 2. okt. 2026, afløser b2.1 "Ligevægtsloven" i to faner: Brøken (de ti gamle reaktioner og jernthiocyanat og blyiodid; skemaet på en tavle, eleven trækker stoffer, tegn og eksponenter fra en bakke op i tælleren og ned i nævneren, en besked til hver typisk fejl, og når brøken er rigtig, bliver skemaet farvet som brøken, og det, der ikke er med, streges ud) og Find fejlen (tolv tavler, hvor en elev har skrevet brøken med én typisk fejl eller ingen; hver del kan klikkes); quizzen med de fem spørgsmål og teorien fra den gamle bag knapper i toplinjen; uden Kemichael, hjælpen i statuslinjen med hint i tre trin som `sc1.4_afstemning`; et klik på ⇌ er et påskeæg; den gamle står stadig i menuen |
| `sb2.3_ligevaegtsberegninger` | nej | ny, 2. okt. 2026, afløser `kemi-b-filer/b2.3_ligevaegtsberegninger.html` (B2 knap 3) i tre faner: Beholderen (ny, den pædagogiske fane brugeren bad om: molekyler i en lukket beholder og en skyder for x, skemaet med tal, der følger skyderen, og Y som funktion af x mod K; otte mål på tre reaktioner: find ligevægten, skriv rækkerne med x, koefficienten 2, hvor langt x kan komme, og når CAS løser Y = K, zoomer grafen ud, så begge løsninger ses, og det grå område, hvor en koncentration er negativ; eleven klikker på den, der ikke kan bruges), Uden x (den gamles niveau 1: Kc ud fra stofmængder og en ukendt koncentration med CAS) og Med x (niveau 2 og 3 i Let, Middel og Svær: ligevægtsloven i felter, x defineres i en sætning med fire bokse, skemaet række for række og ligningen med elevens egne udtryk i stedet for multiple choice, CAS i stedet for løsningsformlen, og hver løsning prøves i skemaet; et Forkast kræver et klik på den koncentration, der bliver negativ); de 13 opgaver med den gamles tal og facit; hele besvarelsen og kurven fra start til ligevægt i panelet; uden Kemichael og uden statuslinje nederst (brugerens ønske 9. okt. 2026: "byg hellere tekstboksen ind, så den er naturligt mere synlig"): tekstboksen med næste skridt, fejl, hint, ros og den gule hintknap står på fane 1 i en kasse øverst sammen med målet og på fane 2 og 3 øverst i den del af tavlen, eleven er ved, og svaret med knappen Næste opgave står i en grøn boks nederst på tavlen; opgavens tal (rækken Oplyst) kommer først frem, når ligevægtsloven er skrevet rigtigt, og beregningerne af koncentrationerne står på hver sin linje med lighedstegnene under hinanden og etiketten Koncentrationerne ved ligevægt (samme dag); hinttrappen er som i `sc1.4_afstemning`; låget på beholderen er et påskeæg; menulinjen står i mappens README |
| `sb3.2_titreringssimulator` | ja | `samling_b3.html` |
| `sb4.4_intermolekylaere_bindinger` | nej | ny, 2. okt. 2026, afløser `kemi-b-filer/b4.1_intermolekylaert_ethanol.html` (fra 9. okt. 2026 B3 knap 1, før B4 knap 4; af brugeren kaldt sb4.1) i tre faner: Ethanol (den gamle lup med røde hydrogenbindinger og grå London-kræfter, nu med temperaturkammer, glas med ballon og termometer; fire mål: kog ethanol, hvad brydes, find det H, der kan danne hydrogenbindinger, og et gæt før kontakten slår hydrogenbindingerne fra, så ethanol koger ved −42 °C som propan), Sammenlign (brugerens opgave med tabellerne: fem par i hver sin lup, gæt, varm op og svar på hvorfor; kogepunkterne på en graf mod molarmassen) og Rangér (12 opgaver med kort, der trækkes i rækkefølge efter kogepunkt; forklaring af det første forkerte par ud fra OH, kæde og form); tilstanden følger tabellen som i `sc6.1`, bindingerne dannes af en lille fysik; uden Kemichael, hjælpen i statuslinjen som `sc1.4_afstemning`; termometerets kugle er et påskeæg; menulinjen står i mappens README |
| `sb4.5_organisk_syntese` | ja | `kemi-b-filer/samling_b4,5,6.html` som nr. 4 "Organisk syntese" i B4 Funktionelle grupper (nr. 5 indtil omnummereringen 9. okt. 2026; i menuen fra 2. okt. 2026, brugerens ønske: direkte på hjemmesiden); ny, 2. okt. 2026, afløser `Eb5_breakingbad.html` ("Sælg kemikalier"); bygget om 9. okt. 2026 til ét spil på én fane (brugerens ønske efter første test: mere spændende design, en butik, der ligner en butik, mindre tavle og plads til flere spil-elementer): eleven starter med 300 kr., køber stofferne i butikken (reoler, kurv, dagens tilbud, butansyre udsolgt), lægger to flasker fra lageret i kolben, tænder for svovlsyre og varme, og tavlen viser med strukturformler, at syrens OH og alkoholens H bliver til vand, med navnet i alkoholens og syrens farve; ordren giver kun stoffets navn, de ti første kommer i fast rækkefølge fra let til svær, og syren, butikken ikke har, laves ved oxidation af en primær alkohol via aldehydet (propan-2-ol giver propanon); serien giver 10 % oveni pr. levering i træk, børsen skifter hvert 30. sekund, esterkortet (7 alkoholer × 7 syrer og tre særlige stoffer) giver 50 kr. for hvert nyt stof og viser kun det, eleven har lavet, titlerne følger det tjente (lærling til fabrikschef ved 5000 kr.) og giver adgang til udstyr (kundekort, reklameskilt, vandudskiller); kemien er regler, ikke opskrifter, og molekylemotoren i `../molekylemotor/` navngiver produkterne; uden Kemichael, hjælpen i statuslinjen med hint i tre trin som `sc1.4_afstemning`; diethylether af ethanol og CO₂ af methansyre er påskeæg; den gamle ligger i `kemi-c-filer/arkiv/Eb5_breakingbad_oldversion.html` |
| `sb4.6_geometrisk_isomeri` | nej | ny, 2. okt. 2026, afløser `kemi-b-filer/b6.1_geometrisk_isomeri.html` (fra 9. okt. 2026 B3 knap 2, før B4 knap 6) i tre faner: Dobbeltbindingen (kuglemodel: butan drejer frit, but-2-en fjedrer tilbage, cis- og trans-1,2-dichlorethen med kogepunkter, og byt og vend med et omrids for propen, but-2-en og 2-methylbut-2-en), Prioriteten (strukturformlen som i bogen; otte molekyler, hvor eleven finder vinderen på hvert C-atom og vælger E, Z eller Ingen, og fire byg selv) og E eller Z? (den gamles spil med de samme point, bonusser og rang, nu med forklaring efter hvert svar og fælder); næste atom regnes rigtigt (CH₂CH₃ slår CH₃, fordi C slår H) i stedet for den gamles atomnummer 7; uden Kemichael, hjælpen i statuslinjen som `sc1.4_afstemning`; ethen af fire H er et påskeæg; ikke i menuen |
| `sb4.7_spejlbilledeisomeri` | nej | ny, 2. okt. 2026, afløser `kemi-b-filer/b6.2_spejlbilledeisomeri.html` (fra 9. okt. 2026 B3 knap 3, før B4 knap 7) i tre faner: Spejlbilledet (molekylet drejes med musen mod sit spejlbillede og klikker på plads; grønne og røde ringe; fire forskellige grupper giver højst 2 af 4, og et bytte af to grupper giver spejlbilledet), Find C-atomet (13 molekyler tegnet af `../molekylemotor/`, eleven sætter stjerner på de asymmetriske C-atomer, Vis alle H) og R eller S (den gamles kuglemodel, hvor eleven selv nummererer, drejer gruppe 4 væk og vælger R eller S; buen 1 → 2 → 3 til sidst); uden Kemichael, hjælpen i statuslinjen som `sc1.4_afstemning`; carvon (mynte og kommen) bag spejlet er et påskeæg; ikke i menuen |
| `sb9.1_absorptionsspektre` | nej | ny, 2. okt. 2026, afløser `kemi-b-filer/b9_1.Absorbtionsspektrum.html` (B9 knap 1) i tre faner: Farven (lampen sender hvidt lys gennem en kuvette til et øje, farvecirklen og spektret, hvor arealet under kurven har lysets farver; eleven trækker selv en top til gul, blå, lilla og rød, og for de fem stoffer fra den gamle findes toppen og farven, mens kuvetten er dækket), Konjugeringen (polyenet H(CH=CH)ₙH bliver længere, til det er farvet ved 8, orange ved 11 og rødt ved 13; lycopens 11 konjugerede blandt 13 dobbeltbindinger, brom, der bryder chromoforen, og tomatregnbuen) og Chromoforen (otte molekyler fra hexatrien til indigo og Allura rød; eleven markerer det største konjugerede system med C=O og N=N og vælger farven); alle farver regnes af spektret med CIE-farvefunktionerne, og navnet af farvetonen i CIELAB; Lambert-Beer er udeladt (sb9.3 ejer den); uden Kemichael, hjælpen i statuslinjen som `sc1.4_afstemning`; øjet blinker som påskeæg; ikke i menuen |
| `sb9.3_lambert_beer` | nej | ny, 2. okt. 2026, afløser `kemi-b-filer/b9.3_lambert_beer_simulation.html` (B9 knap 3) i tre faner: Lyset (den gamles lampe, kuvette og detektor med fotoner, der nu absorberes efter I(x), en kurve "Lys tilbage" over strålen og seks forudsigelser, hvor eleven gætter først og prøver med skyderne eller ved at trække kuvetten bredere; 32 % bliver til 10 % og ikke 16 %, når c fordobles), Standardkurven (eleven måler vand, fem standarder og prøven i et spektrofotometer, lægger linjen gennem (0, 0) og aflæser prøven; fire opgaver, den sidste med et fingeraftryk, der skal tørres af) og Beregningen (otte regnestykker i Let, Middel og Svær med formlen først som sc5.1, tallene ind og resultatet med enhed på tavlen); tre rigtige stoffer (permanganat, FeSCN²⁺ og [Fe(phen)₃]²⁺) med ε fra tabellerne i mM⁻¹·cm⁻¹ i stedet for den gamles opdigtede ε i mg/L; uden Kemichael, hjælpen i statuslinjen som `sc1.4_afstemning`; solbriller på detektoren er et påskeæg; ikke i menuen |
| `sb9.4_spektrofotometri` | nej | ny, 2. okt. 2026, samler `kemi-b-filer/b9.2_forsøg_breezer.html` (B9 knap 2) og `b9.4_nitritforsøg.html` (B9 knap 4) i tre faner med stilladset efter sværhedsgrad: Sodavand (let: rød sodavand med E129, blindprøve, fem standarder, eleven regner hældningen, aflæser på grafen, regner c og fortyndingen), Nitrit (middel: sulfanilamid og koblingsreagens med ventetid og mikroniveauet fra den gamle, eleven regner standardernes c med fortyndingsformlen, bruger standardkurvens ligning, grænseværdien for drikkevand) og To farvestoffer (svær: grøn sodavand med E102 og E133 målt ved 427 og 630 nm, absorbanserne lægges sammen, kun resultatfelter); spektrofotometer med zoomboble og fotoner, træk kuvetter op i holderen, regnestykket som sc5.1 (skabelon, bogstaver, tal, resultat), Ny prøve; uden Kemichael, hjælpen i statuslinjen som `sc1.4_afstemning`; ufortyndet sodavand er et påskeæg; ikke i menuen |
| `sc1.1_atombygger` | ja | `samling_c1.html` og `samling_NV.html` direkte (26. sept. 2026); genvejen `kemi-c-filer/c1.1_atommodel_ioner.html` er tilbage for gamle links |
| `sc1.2_grundstofudstilling` | ja | `samling_c1.html` og `samling_NV.html`; den gamle c1.2 ligger i `arkiv/`; den første med tilbuddet om præsentationen |
| `sc1.4_afstemning` | ja | ny, 30. sept. 2026, afløser c1.4 "Afstem reaktioner" i to faner: Kuglerne (de syv reaktioner fra den gamle og tre nye; tallet foran med + og −, molekylerne som kugler i bakken før pilen og tomme pladser efter; Lad dem reagere sender hvert atom hen på en plads af sin slags, og det, der er tilovers eller mangler, bliver rødt; et klik på et atom i formlen ændrer det lille tal, så det bliver et andet stof, som aldrig godtages) og Skemaet (24 reaktioner i Let, Middel og Svær, eleven skriver tallene og tæller selv; optællingen er slået fra og hentes med en stor knap under tavlen, som er slået fra igen ved hver ny reaktion); **den første uden Kemichael** (brugerens valg 30. sept. 2026: hans hint var det svageste led). Al hjælp står i en statuslinje nederst i scenen med den ene store knap, og hintet er en trappe på tre trin (hvilket atom › tæl det › hvilket tal der skal rettes), hvor atomet lyser i scenen og i regnskabet; et forkert svar gør pilen rød og ryster linjen, et rigtigt giver stemplet AFSTEMT og et grønt glimt; O₃ er et påskeæg; `samling_c1.html` som c1.4 og `samling_NV.html` som nr. 3 (30. sept. 2026); den gamle ligger i `kemi-c-filer/arkiv/c1.4_opgaver_afstemning_oldversion.html` |
| `sc2.1_salt_i_vand` | ja | `samling_c2.html` (26. sept. 2026); den gamle c2.1 ligger i `arkiv/` |
| `sc2.2_saltbygger` | ja | `samling_c2.html` (26. sept. 2026); bygget om sept. 2026 (mindre tekst, nyt krystalgitter, fane 3 med den ukendte ion og plakaterne fra sc2.3, Kemichael præsenterer hver fane); den gamle c2.2 ligger i `arkiv/` |
| `sc2.3_kemikalielageret` | ja | `samling_c2.html`; den gamle c2.3 ligger i `arkiv/` |
| `sc2.4_faeldningsreaktioner` | ja | `samling_c2.html`; den gamle c2.4 ligger i `arkiv/` |
| `sc3.1_elektronprikformler` | ja | `samling_c3.html` og `samling_NV.html`; sept. 2026: eleven tæller selv, fane 2 Find fejlen, Kemichael præsenterer |
| `sc3.2_rumlig_opbygning` | ja | `samling_c3.html` og `samling_NV.html` (26. sept. 2026); den gamle ligger i `arkiv/` som `c3.2_rumlig_opbygning_oldversion2.html`; var sat på pause med for mange bugs; 24. sept. 2026 delt i to: sc3.2 har kun formen (byg molekylet, molekylerne), polaritet og vandstrålen er flyttet til sc3.3 |
| `sc3.3_polaere_molekyler` | ja | `samling_c3.html` og `samling_NV.html` (26. sept. 2026); ny, sept. 2026, afløser c3.3: elektronegativitet som tovtrækning om elektronparret (lille periodisk system, upolær/polær/ion), polær eller upolær og vandstrålen, flyttet fra sc3.2; Kemichael præsenterer; den gamle c3.3 ligger i `arkiv/` |
| `sc3.4_blandbarhed` | ja | `samling_c3.html` og `samling_NV.html` (26. sept. 2026); ny, sept. 2026, afløser c3.4 efter bestillingen; den gamle c3.4 ligger i `arkiv/` |
| `sc3.4_blandbarhed_inaktiv` | nej | kasseret sept. 2026, reservedele; afløst af `sc3.4_blandbarhed` |
| `sc3.5_vand_eller_heptan` | ja | `samling_c3.html` og `samling_NV.html` (26. sept. 2026); ny, sept. 2026, afløser c3.5 "Gæt polaritet": forsøget med et glas vand og et glas heptan i et stativ (pipette eller spatel, ryst, ét lag eller to, skema med otte stoffer) og den gamle gættelege, hvor eleven markerer de polære grupper og forsøget er facit; kun små stoffer med et entydigt svar (reglen og "begge" ejer `sc6.2` fane 5); Kemichael præsenterer; den gamle c3.5 ligger i `arkiv/` |
| `sc4.1_molarmasse` | ja | `samling_c4.html` (26. sept. 2026); ny, sept. 2026, afløser c4.1 (vægten, skålvægten, ukendt stof); den gamle c4.1 ligger i `arkiv/` |
| `sc4.2_stofmaengde` | ja | `samling_c4.html` (26. sept. 2026); ny, sept. 2026, afløser c4.2 (vægten med klumper på 1 mol, flest atomer, afvejning); den gamle c4.2 ligger i `arkiv/` |
| `sc4.3_stofmaengdeberegning` | ja | `samling_c4.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c4.3 "Stofmængdeberegning" med n = m / M: Formlen (seks runder, hvor eleven trækker n, m, M, navne, enheder og regnetegn op på en tavle, stilladset forsvinder runde for runde, gram streges ud i g / (g/mol) = mol, formlen vendes til m = n · M og M = m / n, og til sidst skrives formlen og enhederne uden brikker), Vægten (de seks gamle opgaver med formlen først og tallet med enhed; bunken på vægten deles i poser med 1 mol) og Hurtigrunden (12 spørgsmål på tid, fejl kommer igen, rekorden huskes); formeltrekanten kun som andet hint, når formlen vendes; uden Kemichael fra 9. okt. 2026 (gul hintknap); en muldvarp er et påskeæg; den gamle c4.3 ligger i `arkiv/` |
| `sc4.4_aekvivalente_maengder` | ja | `samling_c4.html` (26. sept. 2026); ny, sept. 2026, afløser c4.4 (pølsevognen med hotdogs og dobbeltburgere, begrænsende ingrediens og overskud, molekyler i et kammer, hvor hver figur til sidst er 1 mol, og tavlen med søjler, hvor et rigtigt svar fylder netop sine blokke; afstemning kun på Svær); lutter agurker er et påskeæg; den gamle c4.4 ligger i `arkiv/` |
| `sc4.5_maengdeberegning` | ja | `samling_c4.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c4.5 (Vejen: pulver på en vægt bliver til poser med 1 mol, poserne går gennem reaktionspilen og vejes; Skemaet: de gamle opgaver med afstemning, trinvis eller frit, og en skålvægt, der står lige, når alle masser er fundet; Begrænsende mængde: poserne reagerer i hele sæt, og resten ligger tilbage). Uden Kemichael fra 9. okt. 2026 (gul hintknap, hint og svar i opgavekortet), og der er ingen knapper til præsentationen (brugerens valg); den gamle c4.5 ligger i `arkiv/` |
| `sc4.6_idealgasligningen` | ja | `samling_c4.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c4.6 i to faner (brugerens valg): Stemplet (cylinderen med stempel, lodder, varmeplade, gasflaske og lås fra den gamle; quizzen er blevet til syv forudsigelser, hvor eleven gætter først og prøver selv, og modellen er facit; pV-grafen står i scenen; et stop ved 60 L) og Beregningen (tolv opgaver i Let, Middel og Svær med formlen først, instrumenter, der er dækket, til tallet er regnet, en tavle med de pæne beregninger og en besked til °C, R = 8,314, mL og 24 L pr. mol); bar og R = 0,0831 L·bar/(mol·K) som i kompendiet i stedet for den gamles opfundne konstant; uden Kemichael fra 9. okt. 2026 (gul hintknap); 22,4 L ved 0 °C er et påskeæg; den gamle c4.6 ligger i `arkiv/` |
| `sc4.7_natron` | ja | `samling_c4.html` som c4.7 (27. sept. 2026); ny, 27. sept. 2026, afløser c4.7 "Forsøg: Natron", der var tør (brugerens ønske: mere spændende): Forsøget (gæt først mellem A Na₂O, B Na₂CO₃ og C NaOH; diglen på vægten, trefoden og brænderen med Sluk, Lav og Høj; høj flamme fra start får pulveret til at sprøjte; en varm digel vejer for lidt; vej, til to vejninger giver det samme; luppen med Na⁺ og HCO₃⁻, hvor det, der bliver tilbage, står som ?, til dommen er faldet), Hypoteserne (n(NaHCO₃) og for hver hypotese afstemning, n og m med formlen først og brøkfelter som sc4.3; hver hypotese bliver en streg på grafen ved siden af vejningerne; dommen med reaktionen som kugler) og Fejlkilder (seks, gruppe 1 og 2, gæt først); journalen til udskrift og Snyd-knappen med snydebeviset fra den gamle; uden Kemichael fra 9. okt. 2026 (gul hintknap); kagen på katederet forsvandt med ham; den gamle c4.7 ligger i `arkiv/` |
| `sc4.8_staaluld` | ja | `samling_c4.html` som c4.8 (27. sept. 2026); ny, 27. sept. 2026, afløser c4.8 "Afbrænding ståluld" med de samme elementer: Forsøget (et gratis gæt først på tre kort med billeder, Lettere, Det samme og Tungere (brugerens ønske: den gamle hypoteseskærm var invasiv og kedelig); så en klump ståluld på en nulstillet vægt, m(før), en bunsenbrænder tænder ulden (28. sept. 2026: i stedet for et batteri), den gløder og bliver sort, i luft går den ud, før alt jernet har reageret, og kun ilt fra flasken bringer den helt til ende (brugerens ønske 28. sept. 2026), og m(efter) aflæses, når vægten står stille; luppen med jernatomer, O₂ og N₂, hvor den inderste del af jernet ikke når at reagere; to målinger) og Beregningen (n(Fe), n(oxid) og m(oxid) med formlen, mellemregningen i brøkfelter og resultatet som sc4.3, og søjler med jern og ilt; til sidst den gamles spørgsmål om, hvorfor vægten viste mindre). Rettet 5. okt. 2026 efter brugerens test: startskærmen med gættet dækker hele scenen, er ikke gennemsigtig og har en kort indledning, og intet bevæger sig bag den; brænderen har en gul ring og skiltet "Klik for at tænde" (iltflasken "Klik for mere ilt"); tavlen på fane 2 er et mængdeberegningsskema som sc4.5 (m, M og n under hvert stof, pile for vejen) i stedet for en linje med oplysninger, og regnestykket står kun i panelet; omskifteren Let / Svær vælger reaktionsskemaet (Svær: 3 Fe + 2 O₂ → Fe₃O₄, n(Fe₃O₄) = n(Fe) / 3, også via `#svaer`); stjernekasteren er fjernet; uden Kemichael (brugerens valg 5. okt. 2026), hjælpen i en statuslinje i scenen på fane 1 med feltet til det tal, der aflæses, og på fane 2 lige under det trin, eleven er ved; mappen henter ikke længere filer uden for sig selv; den gamle c4.8 ligger i `arkiv/` |
| `sc4.9_lightergas` | ja | `samling_c4.html` som c4.9 (27. sept. 2026); ny, 27. sept. 2026, afløser c4.9 "Forsøg: Lightergas": Forsøget (lighteren vejes, gassen samles i et omvendt måleglas i et kar med vand, rumfanget aflæses i en lup, et gæt på massen, lighteren tørres på papir og vejes igen; to målinger), Beregningen (m(gas), n = V / Vₘ og M = m / n med formlen først, tavlen og søjlerne med methan til pentan, hvor elevens molarmasse er en stiplet linje; en ukendt gas med nye tal) og Fejlkilder (seks, to grupper, gæt først). Kemichael præsenterer ikke; han kommer kun ind ved påskeæggene, hvor forsøget går helt galt (brugerens valg): en tunet lighter giver en stikflamme eller suger vand ind (20 %), og gas på bordet antændes af en gnist. Tuningen (hætten af, pinden frem, løftet tilbage og frem igen) står bevidst ingen steder i animationen; se mappens README; den gamle c4.9 ligger i `arkiv/` |
| `sc4.10_betydende_cifre` | ja | `samling_c4.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c4.10 "Afrunding/opskrivning" med de samme fem opgavetyper og runder på ti: Tæl cifrene (eleven klikker på de betydende cifre), Flyt kommaet (videnskabelig notation begge veje eller enheder med g, L og mol i fire niveauer, hvor Meget svær er låst, til de tre andre er klaret, fra 27. sept. 2026; kommaet hopper plads for plads, og eksponenten tæller med), Afrund (måletal eller regnestykker, nu også division) og Blandet (rekorden huskes); cifrene står som brikker på en tavle, og hver typisk fejl får sin besked; den uskrevne regel (tal mellem 0,01 og 100 skrives som almindelige tal) står i teorien, og ingen opgave bryder den; uden Kemichael fra 9. okt. 2026 (gul hintknap); et klik på kommaet er et påskeæg; den gamle c4.10 ligger i `arkiv/` |
| `sc4.11_kalk_i_muslingeskaller` | nej | ikke i menuen med vilje (brugeren 9. okt. 2026: hører ikke til i animationspanelet); linkes fra Kemibogens temaside om klima, så mappen hedder ikke længere `_inaktiv`; ny, 25. sept. 2026, bygget fra bunden ud fra NF-øvelsen med muslingeskaller (Havhaven), og gjort lettere 9. okt. 2026 (brugeren: for svær til HF, "meget brugervenlig"): Forsøget (gættet på et gult kort midt i scenen, så fire skridt på samme kort: m(før) aflæses med et klik på vægten eller det gule skilt, pulveret klikkes over i kolben en spatelfuld ad gangen, eleven venter, til vægten står stille, og aflæser m(efter) med et klik; et klik i den forkerte rækkefølge får én linje med forklaringen; luppen med H₃O⁺, CO₃²⁻ og CO₂ kommer frem med det første pulver; alt på én gang sprøjter), Beregningen (Uden mol er standard: formlen vælges blandt tre, tallene sættes ind, og der regnes med 2,27; Med mol via omskifteren eller `#mol`: formlen skrives, n = m / M, 1 : 1, m = n · M, og en opgave baglæns) og Fejlkilder (gruppe A og B side om side, seks fejl fra den letteste til den sværeste, gæt først på kortet i scenen, kalkindholdet under hver kolbe); uden Kemichael (gul hintknap på kortet); hjertemuslingen er et påskeæg |
| `sc5.1_koncentration` | ja | `samling_c5.html` som c5.1 (26. sept. 2026); ny, 25. sept. 2026, afløser c5.1 og c5.2 (emne 5 bliver to superanimationer, sc5.1 og sc5.2): Karret (skefulde kobber(II)sulfat, en vandhane og en tappehane, luppen med altid lige meget væske, c = n / V i panelet; fem opgaver, to med et gæt først), Målekolben (seks regneopgaver fra c5.2, formlen først, vægten og kolben gør det, der er regnet, og en forkert masse vejes af) og Fortynding (pipette, målekolbe og sprøjteflaske til ti gange tyndere, så fire fortyndinger med formlen først). Uden Kemichael fra 9. okt. 2026 (gul hintknap); de gamle c5.1 og c5.2 ligger i `arkiv/` |
| `sc5.2_formel_og_aktuel` | ja | `samling_c5.html` som c5.2 (26. sept. 2026); Mohrtitreringen er rykket op som c5.3; ny, 25. sept. 2026, afløser c5.3 og c5.4: Opløsningen (portioner salt i et literglas, luppen og søjler med saltets og ionernes koncentration; seks opgaver, to med et gæt og én med to salte), Ionerne (tallene foran ionerne i skemaet og så ionernes koncentrationer i Let, Middel med baglæns og Svær fra massen; nye salte hver gang) og Blandinger (to salte i ét glas og to glas, der hældes sammen, når det samlede rumfang er fundet). Den gamle c5.4 opgave 5 regnede en blanding forkert; her er den to salte i samme glas. Den rolige Kemichael som sc5.1; de gamle c5.3 og c5.4 ligger i `arkiv/` |
| `sc5.3_mohrtitrering` | ja | `samling_c5.html` som c5.3 (28. sept. 2026, gamle `c5.5_eksperiment_mohrtitrering.html` i `arkiv/`); ny, 26. sept. 2026, afløser Mohrtitreringen, bygget som `sc7.4` (brugerens ønske: den må gerne minde om de andre titreringer): Titreringen (1,00 g havvand fra et af seks steder med kaliumchromat, 0,050 M sølvnitrat i buretten, skyderen ved hanen og 1 dråbe; kolben bliver uklar af AgCl, og rødbrune skyer forsvinder, så længe der er Cl⁻; farven regnes af opløselighedsprodukterne; luppen med 8 Cl⁻, der synker til bunds som AgCl, og kurven over Cl⁻, AgCl og Ag₂CrO₄), Beregningen (fire trin med formlen først og tavlen) og Fejlkilder (hed To kolber til 28. sept. 2026; seks situationer, heriblandt postevand og spildt havvand); Kemichael præsenterer som i sc7.4 |
| `sc6.1_kogepunkt` | ja | `samling_c6.html` (26. sept. 2026); ny, sept. 2026, afløser c6.1, brugerens første animation (varm op med glas og ballon og kurven, formen med tre isomerer af C₅H₁₂, hvem koger først i blandinger; tændstikken er et påskeæg); den gamle c6.1 ligger i `arkiv/` |
| `sc6.2_zigzagformler` | ja | `samling_c6.html` som c6.2; de gamle c6.2, c6.3 og c6.4 ligger i `arkiv/`, og knap 4 og 5 er fjernet (C6 er omnummereret uden huller 26. sept. 2026); sept. 2026: quizzerne zigzag, navne og isomerer og fane 4 Opløselighed (`#oploeselighed`, den gamle c6.5 som spil med et bægerglas med heptan og vand); Kemichaels skuffe med klistermærker fra quizzerne til tegnebrættet; tegnebrættet var fane 1 og har fra 25. sept. 2026 sin egen side (`tegnebraet/`); motoren til at tegne og navngive molekyler ligger i `../molekylemotor/` og deles med tegnebrættet; den gamle c6.5 ligger i `arkiv/`, fanen har ingen egen knap |
| `sc6.4_addition_og_plastik` | ja | `samling_c6.html` som nr. 4 efter Tegnebræt (9. okt. 2026, brugerens valg: som i Kemibogen; link-koden er `c6.addition`); ny, 9. okt. 2026, bygget fra bunden til Kemibogens afsnit 6.4 (Alkener og addition) i tre faner: Addition (ethen som strukturformel med bogstaver som i bogen; eleven trækker brom, hydrogen eller vand fra en hylde hen til dobbeltbindingen, den åbner sig, to stiplede cirkler viser de ledige pladser, og molekylets to dele sætter sig på; navn og reaktionsskema kommer under produktet; ethan afviser brom med "ingen ledig plads", og propen træner at lægge atomerne sammen; hydrogen og vand kommer først på hylden med deres opgave), Bromvand (fem reagensglas A til E med et farveløst carbonhydrid over orange bromvand: hex-1-en, hexan, cyclohexen, cyclohexan og benzen; et klik eller musen ryster glasset, farven forsvinder eller flytter op i det øverste lag, eleven afgør mættet eller umættet, og glasset får sit navn; luppen viser det øverste lag med zigzagformler og ringe, hvor brom sætter sig på dobbeltbindingerne eller driver rundt; cyclohexan og benzen begynder med et gæt og en tegning af ringen på kortet) og Plastik (seks løse ethenmolekyler; et trækkes hen oven på et andet, dobbeltbindingerne åbner sig, og kæden vokser i begge ender med ét farvet felt pr. ethenmolekyle som i bogens figur; Zoom ud viser en hel kæde som en snoet streg med elevens stykke som en lille gul del og en frysepose; brom kan ikke sætte sig på kæden; til sidst udsnittet −CH₂−CH₂−); 16 opgaver; mønsteret er `sc7.5_staerke_og_svage_syrer` (al tekst på kortet øverst i scenen, ingen statuslinje, intet indforstået med en rolig gul ring om det, teksten handler om), og `js/fane.js` er taget derfra; uden Kemichael; holdt fri af `sc6.6_fedtstoffer` (ingen fedtstoffer eller hærdning), c6.7 Umættet fedt? og `v2/superlab/sc6.8_substitution` (ingen lampe, folie eller HBr); mappen har bogens afsnitsnummer, som nu også er pladsen i menuen; forsøget er låst uden for opgaven, og kun det glas eller molekyle, opgaven beder om, kan bruges (9. okt. 2026, som sc7.5); et tredje forsøg med ethan og fjerde klik på et glas uden for opgaven er påskeæg |
| `sc6.6_fedtstoffer` | ja | `samling_c6.html` som nr. 5 fra 9. okt. 2026 (nr. 4 fra 26. sept. 2026, da C6 blev omnummereret; link-koden er stadig `c6.4`); den gamle c6.6 ligger i `arkiv/`; sept. 2026: to faner (fabrikken, hvor eleven bygger fedtstoffer til fem kunder, og køkkenet, hvor fedtstofferne står i fryser, køleskab, på bordet og i solen, med molekylerne i et zoomvindue); det harske smør er et påskeæg |
| `sc7.1_syrebasereaktioner` | ja | `samling_c7.html` (26. sept. 2026); ny, sept. 2026, afløser c7.1: Hydronen (eleven trækker et H fra syren over på basens frie elektronpar i strukturformler; parret bliver hjemme, ladningerne følger med), Produkterne og Parrene på en tavle med tre sværhedsgrader og nye reaktioner hele tiden; forkerte svar og mærkater forklares ud fra fejlen; en hydron i kaffen er et påskeæg; den gamle c7.1 ligger i `arkiv/` |
| `sc7.2_ph_skalaen` | ja | `samling_c7.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c7.2, der kun dækkede pH 4 til 10: Skalaen (tolv hverdagsstoffer, som eleven placerer på skalaen fra 0 til 14, før pH-metret måler dem), Luppen (1 prik = 1 ion, zoom i trin af ti, så hele skalaen kan tælles; fra pH 1 til 13 er 12 klik) og Fortyndingen (saltsyre og natronlud fortyndes 10 gange ad gangen, ét trin pr. glas, og syren bliver aldrig basisk); et præcist gæt er et påskeæg; den gamle c7.2 ligger i `arkiv/` |
| `sc7.3_ph_beregninger` | ja | `samling_c7.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c7.3: eleven regner selv på en indbygget lommeregner, der skriver det tastede på én linje som en TI og under det, hvordan den har læst det (eksponent hævet, brøkstreg, egne parenteser blege), og som kan vise det samme som Maple-kode (rødt input, blåt resultat, eksakt uden komma); tre faner efter retning: Find pH (pH-metret måler bagefter), Find koncentrationen ([H₃O⁺] og [OH⁻] på etiketten) og Stærke syrer og baser (fra flasken til pH i op til fire trin); regnevejen med stationerne [OH⁻], [H₃O⁺], pH og c vokser med opgaven, og en pil kommer først, når eleven har valgt dens formel; hvert trin er delt i små bider (vælg formlen, tast på lommeregneren, der siger til, når tallet er rigtigt, og skriv svaret), og knappen hjælper med den bid, man er ved (Giv hint, så Vis formlen, Vis tasterne eller Vis svaret); teksterne og Kemichael er skrevet til en svag elev efter brugerens første test; forklaring på de typiske fejl; 42 på lommeregneren er et påskeæg; den gamle c7.3 ligger i `arkiv/` |
| `sc7.4_titrering_eddike` | ja | `samling_c7.html` som c7.4; den gamle c7.4 ligger i `arkiv/`; ny, 25. sept. 2026, afløser c7.4 som superanimation, ikke som superlab-animation (brugerens ønske): Titreringen (kolben står klar, eleven åbner hanen med en skyder, drypper til sidst og aflæser selv buretten; luppen viser syren som 8 figurer, og den sidste forsvinder, når kolben bliver lyserød; kurven og datatabellen til Excel fra den gamle), Beregningen (fire trin fra forbrug til masseprocent; eleven skriver selv formlen og så tallet, og de pæne beregninger kommer på en tavle) og To kolber (én ting ændret: vand, prøvens masse, koncentrationen af NaOH, vand i buretten, spildt eddike); NaOH kaldes natriumhydroxid, aldrig natronlud; et resultat på hundrededelen er et påskeæg |
| `sc7.5_staerke_og_svage_syrer` | nej | ny, 9. okt. 2026, bygget fra bunden til Kemibogens afsnit 7.2 (det eneste afsnit i kapitel 7 uden egen animation) i tre faner: To glas (saltsyre og eddikesyre på 0,10 M; et gæt, så trækker eleven et stykke kalk fra en skål ned i hvert glas, og det bruser kraftigt i saltsyren og næsten ikke i eddikesyren; et klik på et glas åbner luppen med de 100 molekyler, der er hældt i: i saltsyren 100 blå chloridioner og 100 røde oxoniumioner, i eddikesyren 99 grå hele molekyler og 1 af hver; så bytter eddikesyren hydroner frem og tilbage med små skilte, og ordene stærk og svag kommer til sidst), Stærk eller svag? (fem glas A til E uden navne; eleven afgør styrken ud fra luppen, glasset får sit navn, og pilen i reaktionsskemaet vælges; citronsyre med 8 ud af 100 og fælden Midt imellem; saltsyre og myresyre har fået etiket, og her gætter eleven først på luppen) og Fortyndet? (0,10 M eddikesyre mod saltsyre, der fortyndes 10 gange ad gangen med én knap, til der er 1 oxoniumion i hver lup; saltsyren er fortyndet, ikke svag, og eddikesyren er mest koncentreret; til sidst en tavle med fire flasker og to ord til hver); andelen regnes af Databogens pKs, antallet i luppen er gennemsnittet, og brusen følger [H₃O⁺]; pH-metret er et tilvalg i toplinjen, fordi bogen først indfører pH i 7.3; uden Kemichael og uden statuslinje nederst: al tekst står på ét kort øverst midt i scenen (også hint, forklaringen til et forkert svar og den gule hintknap) og ikke i panelet: de fire gæt som et stort gult kort, der blinker, hvis eleven klikker på forsøget først, derefter det, eleven skal gøre, og spørgsmålene med svarknapper samme sted, og når målet er løst, det grønne kort med svaret, forklaringen og knappen Næste opgave (brugerens ønsker efter første kig 9. okt. 2026: eleverne klikker, før de læser; mønsteret for reglen under Fælles krav); forsøget er låst, til kortet viser et forsøg, og teksterne er korte (brugeren samme dag: for meget tekst, og forsøget kunne startes før spørgsmålet); i luppen har partiklerne stoffets form (HCl og Cl⁻ kugler, eddikesyre aflang, salpetersyre en trekant), et helt molekyle er gråt med hydronen på som en lille orange kugle, ionen blå med minus og H₃O⁺ rød med plus, og signaturen er store mærker, man kan klikke på (brugerens ønske samme dag); tre klik på eddikesyrens ene oxoniumion er et påskeæg; kalk i stedet for forslagets magnesium (afsnit 7.2 slutter med syre og kalk); ikke i menuen |
| `sc8.1_spaendingsraekken` | ja | `samling_c8.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c8.1: Forsøget (fem stænger og seks glas med Mg²⁺, Zn²⁺, Fe²⁺, Cu²⁺, Ag⁺ og saltsyre; eleven trækker stængerne ned, luppen viser den afstemte reaktion med elektronerne, og skemaet med 25 forsøg fyldes ud; fem mål med spørgsmål, hvor de forkerte svar er rust, farvet zink og kogende syre), Rækken (eleven stiller selv de fem metaller og hydrogen i rækkefølge ud fra skemaet, og den lange række kommer frem) og Forudsig (ja eller nej, før stangen kommer ned, så produkterne og afstemningen ud fra elektronerne; 12 opgaver fra 1 : 1 til 3 : 2 og derefter tilfældige par af 8 metaller); en stang i Kemichaels kaffe er et påskeæg; rettet 3. okt. 2026 efter brugerens test: stangen bliver tyndere i syren, Kemichaels præsentation går ét trin ad gangen med Næste i taleboblen og en blinkende ramme om det, han peger på (mønsteret for reglen under "Kemichael"), fane 3 har et bredere panel med skemaet på én linje, og nikkel og tin er taget ud; den gamle c8.1 ligger i `arkiv/` |
| `sc8.2_oxidationstal` | ja | `samling_c8.html` som c8.2, én knap for de gamle c8.2 og c8.3 (26. sept. 2026); ny, 25. sept. 2026, afløser c8.2 og c8.3 i to faner (brugerens ønske): Reglerne (formlen på en tavle med et felt over atomerne, regnestykket og atomerne som brikker; de seks stoffer trin for trin fra c8.2 og de 25 øvestoffer i fire familier, en besked til hver typisk fejl) og Elektronerne (de tolv molekyler og ioner fra c8.3 som elektronprikformler; eleven gætter først, trækker så hvert elektronpar hen til det mest elektronegative atom, og regnskabet viser valenselektronerne minus dem, atomet har; reglerne svigter kun for H₂O₂ og OF₂); uden Kemichael fra 9. okt. 2026 (gul hintknap i arbejdsfeltet); de gamle c8.2 og c8.3 ligger i `arkiv/` |
| `sc8.4_redoxafstemning` | ja | `samling_c8.html` som c8.3 (26. sept. 2026, C8 omnummereret); ny, 25. sept. 2026, afløser c8.4 med de samme trin (oxidationstal, hvad oxideres, elektroner pr. atom, koefficienter, ladning, H⁺ eller OH⁻, vand) og 37 reaktioner i stedet for 7 (Let uden ilt, Middel i surt miljø, Svær med basisk miljø, H⁺ efter pilen og samme grundstof begge veje); en besked til hver typisk fejl, Giv hint og Vis svaret på hvert trin og en kontrol under skemaet. Bygget om 3. okt. 2026 (brugerens ønske efter brug: vægten var svær at afkode og fyldte for meget): tavlen fylder scenen med et stort skema, opgaven og trinnets spørgsmål står over den, alle felter kan udfyldes med en række taster lige under dem, Tjek og den gule hintknap står på tavlen under tasterne (ikke i panelet), og elektronvægten er et tilvalg bag knappen Elektronvægt i toplinjen (slået fra fra start); uden Kemichael, rundvisningen bag ? er bevaret. Gjort roligere 4. okt. 2026 (brugeren: "lidt for aggressiv med at ændre på tekst og opsætning, hver gang man svarer"; c8.4 var forbilledet): tavlen er ét ark, der står stille, med faste pladser til tallene foran stofferne, en klamme pr. par over og under skemaet (knapperne i trin 2, feltet i trin 3, elektronerne fra trin 4) og en række under hver side af pilen til ladning og O; skriften skifter kun én gang, når H⁺ og vand får plads, og et rigtigt svar får kun "Rigtigt."; den gamle c8.4 ligger i `arkiv/` |
| `sc8.5_kaliumpermanganat` | ja | `samling_c8.html` som c8.4 (26. sept. 2026, C8 omnummereret); ny, 26. sept. 2026, afløser c8.5 (brugerens ønske: "ekstraopgaver til redox-afstemning, shinet lidt op", opskrivningen stilladseret som brugerens tegning): Urglassene (ét glas med basisk permanganat som i den gamle: lidt sulfit giver grønt, mere sulfit brunt, svovlsyre næsten farveløst; den næste reaktion åbner først, når skemaet er afstemt, og eleven vælger manganstoffet ud fra farvekortet) og Flere reaktioner (14 med permanganat i surt, neutralt og basisk miljø og med indekstal, den første er Fe²⁺ fra tegningen). Afstemningen skrives i et hæfte på ternet papir: oxidationstal over atomerne, klammer under skemaet med gangetal og ↑ eller ↓ under den lange reaktionspil ("5 ↑1", "1 ↓5"), og rækkerne Ladning, H-atomer og O-atomer under siderne (vandet afstemmer H, O er kontrollen); ti små bidder med trinliste, en besked til hver typisk fejl og en lup, der viser elektronerne med elevens egne gangetal; uden Kemichael fra 9. okt. 2026; hint og svar er én kort sætning i opgavekortet, og knappen Læs mere åbner forklaringen i fuld skærm (brugerens ønske efter første test); den gamle c8.5 ligger i `arkiv/` |
| `sc8.6_korrosion` | ja | `samling_c8.html` som c8.6 (3. okt. 2026, brugerens bestilling: direkte i menuen); ny, 3. okt. 2026, bygget fra bunden om korrosion i tre faner: Rørene (to vandrør af kobber, jern eller zink skruet sammen; 20 år går, det mindst ædle rør tæres ved samlingen og får hul; luppen viser elektronerne gå fra det mindst ædle til det mest ædle; to ens rør eller en plastmuffe standser det; fra 5. okt. 2026 løber vandet fra venstre mod højre, og rækkefølgen betyder noget: kobberrøret først giver hul efter 10 år, jernrøret først efter 20, fordi vandet har kobberioner med, som luppen viser i målet Vandets retning), Skibet (skrog af jern og propel af bronze i havvand; eleven trækker klodser af zink, magnesium og kobber ned på skroget og sejler et år ad gangen; offeranoden svinder, kobber gør det værre, magnesium er væk efter halvandet år; ti år uden rust med færrest klodser) og Rusten (en jernplade med en dråbe helt tæt på og kontakterne Vand, Ilt og Salt; eleven afstemmer oxidationen, reduktionen, det samlede skema og vejen til rust, FeO(OH), på en tavle; partiklerne følger skemaerne, og salt giver tre gange så mange jernatomer pr. minut); farten er valgt, retningen kommer af E°; uden Kemichael, hjælpen i statuslinjen som `sc1.4_afstemning`; vandpytten og fisken er påskeæg; ikke at forveksle med forsøget `v2/superlab/sc8.6_jern_i_staaluld`, der er c8.5 |
| `sc8.bonus_pyrit_inaktiv` | nej | hed `sc8.7_pyrit` og var c8.7 i `samling_c8.html` nogle timer 5. okt. 2026; taget ud af menuen og `FEEDBACK_EMNER` og omdøbt samme dag (brugeren: virker fint, men er for indforstået til hjemmesiden, fordi den forudsætter museumsbesøget); senest tilføjet: C er givet i malakit, og eleven tæller atomerne i FeS₂ og O₂, før gangetallene findes; ny, 5. okt. 2026, bygget fra bunden ud fra arbejdsarket til Museo Geominero (studieturen til Madrid), men kun det, der handler om oxidationstal (opgave 3.2, 3.3, 4.2 og 4.3), i tre faner: Udstillingen (otte sten på hylder ordnet efter den negative ion som på museet: svovl, zinkblende, cinnober, pyrit, hematit, magnetit, gips og malakit; eleven skriver oxidationstallet over atomerne på stenens skilt med taster eller tastatur, magnetit er skrevet FeO·Fe₂O₃ med Fe +II og +III, og pyrit er til sidst: reglen for sulfid giver Fe +IV, men jern er +II, så S er −I; skiltet har stoffets danske navn, og et oxidationstal i navnet kommer først, når eleven har fundet det; de spanske navne og trappen i panelet blev taget ud samme dag efter brugerens første kig), Pyrit (arbejdsarkets skema for forvitringen er to redoxreaktioner i ét, så de afstemmes hver for sig i hæftet fra `sc8.5_kaliumpermanganat` med klammer under skemaet og ↑ og ↓ under pilen; ved klammen står ændringen for ét atom, tallet foran sulfat kommer først bagefter, og klammen har kun pilespids på produktsiden (brugerens ønsker 5. okt. 2026): først svovlet, FeS₂ + O₂ ⟶ Fe²⁺ + SO₄²⁻, så jernet, Fe²⁺ + O₂ ⟶ Fe(OH)₃; derefter ganges og lægges de sammen til 4 FeS₂ + 15 O₂ + 14 H₂O ⟶ 4 Fe(OH)₃ + 8 H₂SO₄, og fire spørgsmål om, hvad der oxideres og reduceres, pH og den røde farve i Río Tinto; tegningen af en klippe ved en bæk følger med: klart vand, surt og grønligt, rustrødt) og Ristning (zinkblende afstemmes, cinnober tjekkes med tre klammer og er afstemt, som det står, og SO₂ + H₂O er ikke en redoxreaktion); modellen kan have flere mærkede atomer i en formel, flere end to klammer, en klamme, der ender i et stof med atomer flere steder fra, og stoffer, der følger med uden at skifte; ingen lærred, alt er almindelige elementer; uden Kemichael, hjælpen i statuslinjen som `sc1.4_afstemning`; tre klik på pyrit er et påskeæg |
| `sc_spil2_million` | ja | `samling_c_spil.html` som nr. 2 (4. okt. 2026); ny, 3. okt. 2026, kategorien Spil; Kemi-Millionær, afløser `c_spil2_million.html` med de samme 70 fagord, 15 beløb, sikre trin ved 5 og 10, tre livliner (To væk, Spørg publikum, Nyt spørgsmål), Lås svaret, Stop og dansk og engelsk (`#en`); nyt: scenen er et tv-studie med lyskegler og ruder med spidse ender, svarene kommer frem ét ad gangen, lyset går ned, mens det låste svar venter, et forkert svar får at vide, hvad det valgte fagord passer til, stigen viser det sikrede beløb, spørgsmål, eleven ikke har set, kommer først, og rekorden huskes; alle lyde er lavet i koden (ingen musik fra tv-programmet), og brugerens to Suno-numre (`musik1.mp3` til spørgsmål 1 til 10, `musik3.mp3` til 11 til 15) spiller uafbrudt som baggrund, mens lydene træder tilbage; uden Kemichael, hjælpen i statuslinjen; sejrsskærmens titel Superkemiker er bevaret til escaperoommets segl 1; den gamle ligger i `kemi-c-filer/arkiv/c_spil_million_oldversion.html` |
| `sc_spil6_iontetris` | ja | `samling_c_spil.html` som nr. 6 (26. sept. 2026); ny, sept. 2026, kategorien Spil; Ion-Tetris, afløser `c_spil_iontetris.html` efter brugerens ønsker: ionerne er de syv tetrisbrikker, et neutralt salt smuldrer til pulver og forsvinder, og brikkerne ovenover falder (kædereaktioner); grå sten med fem felter (alle 18 pentominoer) forsvinder i fulde rækker; man vinder ved at lave alle saltene i panelet, og rekorden er tiden; plus blå og minus rød; tre sværhedsgrader (Let med K⁺ og Br⁻, Middel, Svær med sammensatte ioner); 3. okt. 2026 (brugerens ønske: lidt for svært, og uklart når flere slags ioner rører hinanden): plus og minus, der rører hinanden, får en gul ramme, der venter på resten af saltet, og andre ioner, der rører rammen, påvirkes ikke; saltet sprænger de stenfelter, det ligger op ad (`D.SPRAENG`, sat efter robottest); `musik.mp3` i mappen er baggrundsmusikken (brugerens nummer fra Suno, klippet til en løkke på 80 takter, originalen i `C:\NK_Undervisning\Iontetris-musik\`); den gamle ligger i `arkiv/` |
| `sc_spil3_jeopardy` | ja | `samling_c_spil.html` (nr. 3, i stedet for den gamle Ion-Tetris, 25. sept. 2026); ny, sept. 2026; Kemi-Jeopardy til tavlen, afløser PowerPoint-skabelonen; C (1.g) som standard, B med `#b`; egne spørgsmål som tekst; de originale lyde ligger kun i NK_Undervisning |
| `sc_spil9_kemikort` | ja | `samling_c_spil.html` som nr. 9 (30. sept. 2026); ny, 30. sept. 2026, kategorien Spil; flashcards til Kemi C i tre faner: Træn (ét kort ad gangen, eleven gætter selv, vender kortet og svarer, om han kunne det; et misset kort kommer igen i den samme runde, og de kort, der driller, står i panelet; retningen kan vendes), Vendespil (hvert kort bliver til to brikker med bagsiden op, 6, 8 eller 10 par, tid og fejl) og Parring (svarene trækkes over på forsiderne, sættet delt i runder på 4, 6 eller 8 par, uret løber gennem dem alle). Seks indbyggede sæt, ét pr. emneområde (`#grundstoffer`, `#ioner`, `#molekyler`, `#beregninger`, `#organisk`, `#syrebase-redox`, 168 kort i alt), og fanen kan komme med i linket (`#ioner&parring`). Knappen Mine sæt åbner sættet som tekst (én linje pr. kort, delt af lodret streg, tabulator eller semikolon, så et Quizlet-sæt kan sættes direkte ind) med fejl pr. linje, hent og gem fil, link med sættet i (`#kort=`) og en vejledning til AI; egne sæt og rekorder ligger i browseren. Uden Kemichael: hjælpen står i statuslinjen som i `sc1.4_afstemning`; syv vendinger af det samme kort er et påskeæg |
| `sc_spil7_lykkehjul` | ja | `samling_c_spil.html` som nr. 7 (26. sept. 2026); EscapeRoom er rykket til nr. 8; ny, sept. 2026, kategorien Spil; Kemi-Lykkehjulet til tavlen eller alene (`#alene`: 3 liv pr. runde, eleven skriver løsningen, rekord), afløser PowerPoint-skabelonen; Kemi B som standard, A og NF med `#a` og `#nf`, emnequizzer med fem runder (`#atom`, `#molekyler`, `#beregning`); quizzer som tekst med tavlerne vist undervejs, upload, eksport og link; de originale lyde ligger kun i NK_Undervisning |
| `sc_spil4_organiske_grupper` | ja | `samling_c_spil.html` som nr. 4 og `kemi-b-filer/samling_b4,5,6.html` som nr. 6 med `#b` (nr. 9 indtil 9. okt. 2026; i menuen fra 26. sept. 2026); ny, 25. sept. 2026, kategorien Spil; afløser `c_spil_organiske_grupper.html` (Kemi C, `index.html`) og `b_spil_organiske_grupper.html` (Kemi B, `index.html#b`) med de gamle spils balance tal for tal; molekylerne tegnes af `../molekylemotor/`, og gruppen, der afgør stofklassen, vises i spandens farve; forklaring til hver fejl; Stofgruppemester ved 14.000 point til escaperoommet; B har stadig den fælles top 10; de gamle ligger i `arkiv/` |
| `sc_spil1_pacman` | ja | `samling_c_spil.html` som nr. 1 (26. sept. 2026); ny, sept. 2026, kategorien Spil; Pacman Quiz, afløser `c_spil_pacman_emner.html` med samme labyrint, emner og sværhedsgrader (brugerens balance er bevaret tal for tal); hint til hvert forkert svar; Svær + Mix giver stadig Labyrintmester til escaperoommet; den gamle ligger i `arkiv/` |
| `sc_spil_raindrops` | nej | ny, 2. okt. 2026, kategorien Spil; Ionregn, rytmespil i Matrix-stil: ioner falder i fire baner og lander på slaget, eleven fanger dem i takt (D F J K eller tryk) og samler dem til neutrale ionforbindelser; niveau 1 viser målet som formel, niveau 2 som navn, niveau 3 er frit med bonus for 4 eller 5 ioner; al timing fra AudioContext, metronom uden lydfil, kalibrering, tempomåler til egne lydfiler; `Fast_music.mp3` går i 144 BPM og spilles i 140; alt, der kan skrues på, står i `js/config.js` |
| `sc_spil5_syregalgen` | ja | `samling_c_spil.html` som nr. 5 og `Historie/samling_2.3_ideologier.html` som 2.3.6 med `#historie` (26. sept. 2026); ny, sept. 2026, kategorien Spil; afløser `c_spil_hangman.html` og historiens `2.3.6_syregalgen_ideologier.html` med ét spil og to ordlister (`#historie`); træningsområder efter kapitel (C1 til C8, fx `#c3`), 196 kemiord, ledetråd ved det sidste skridt, klassekammerat på en planke over et kar med pH-meter og en tønde med 1 M HCl, der løber i karret (3. okt. 2026); Kemichael kommer kun efter et plask (brugerens valg, ingen præsentation); Syreimmun til escaperoommet er bevaret; de gamle ligger i `arkiv/` |
| `tegnebraet` | ja | `samling_c6.html` som c6.3 (den ledige plads); et værktøj til rapporter, ikke en superanimation om ét begreb; var fane 1 i sc6.2 og fik sin egen side 25. sept. 2026 (brugerens ønske); tegner molekyler som i bogen og giver navn, stofklasse, formel og molarmasse, også for alkoholer, aldehyder, ketoner, carboxylsyrer, estre, amider, aminer og ethere; de mest almindelige trivialnavne i parentes (ethansyre (eddikesyre)), de fleste kan skrives i feltet; kopiér eller gem billedet til rapporten; fra 25. sept. også grupper med ét klik, ladninger og carboxylat-ioner (ethanoat, CH₃COO⁻), Pæn tegning, Spejlvend, Kopiér/Indsæt og Åbn tegning (en gemt SVG); også i `kemi-b-filer/samling_b4,5,6.html` som knap 8; motoren ligger i `../molekylemotor/` |

## Fælles krav

**1. Selvbærende.** Eleven lærer ved at gøre, ikke ved at læse.

* Rundvisningen bag `?` peger på ét element ad gangen på den fane, man står på.
* Hints hører til den konkrete opgave og vises, når eleven sidder fast. Teorien
  ligger bag en knap og åbner aldrig af sig selv.
* Eleven gør selv det, der skal læres: vælger, forudsiger, noterer og regner.
  Valget kommer gerne før forklaringen, så fejlen bliver det, der lærer noget.
* I opgaver og quiz er de forkerte svarmuligheder de fejl, elever faktisk laver.
  Forklaringen kommer også ved et rigtigt svar, og et forkert svar giver et hint,
  der passer til fejlen.

**2. Brugervenlig.** Den skal kunne bruges, uden at man har læst noget.

* Det, der kan bruges, reagerer på musen, og målet lyser op, mens noget holdes.
* Eleverne klikker, før de læser (brugeren 9. oktober 2026). Skal eleven gætte
  eller stille en hypotese, før forsøget begynder, står gættet stort midt i
  scenen over forsøget, ikke kun i panelet: en kort indledning, selve
  spørgsmålet med stor skrift og svarene som tre store knapper. Kortet er det
  eneste fyldte gule på skærmen (hintknappen er væk imens), det,
  der først skal bruges bagefter, er skjult, og et klik på forsøget før gættet
  får kortet til at blinke. Det, eleven skal gøre bagefter, og spørgsmålene
  med deres svar står samme sted (brugeren samme dag: "her ser jeg gerne samme
  placering igen"); pladsen til kortet er sat af over lupperne, så intet
  flytter sig, og panelet har intet opgavekort. Når svaret er rigtigt, bliver
  kortet grønt og viser svaret, forklaringen og knappen Næste opgave (brugeren
  samme dag: forklaringen blev overset nede i statuslinjen). Al tekst er samlet
  over animationen (brugeren samme dag: "der sidder stadig noget tekst fast
  nede i bunden"): hint, forklaringen til et forkert svar og hintknappen sidder
  i kortets nederste række, og der er ingen statuslinje nederst i scenen.
  Mønster: `sc7.5_staerke_og_svage_syrer` (`kortHTML`,
  `slutNu`, `kortZone` og `gaetBlink` i `js/fane.js`, afsnittet om
  scenekortet i `css/stil.css`). `sc5.1_koncentration` fane 1 og 2 har
  samme kort (brugeren 9. oktober 2026: spørgsmålet stod ude i siden, og
  eleverne kigger ikke af sig selv derud): også en opgave uden gæt og et
  spørgsmål med svar står på kortet i scenen, og panelet har kun tal og
  opgaveliste. Dér bygger fanen kortet af `kortData()`, og svarene har ingen
  bogstaver foran, fordi glassene hedder A, B og C.
* Forsøget er låst, til opgaven står der (brugeren 9. oktober 2026: "nogle
  gange er det muligt at starte animationen inden man har fået spørgsmålet").
  Eleven kan kun sætte noget i gang i scenen, mens kortet viser et forsøg, og
  kun det, opgaven beder om. Under et gæt, et spørgsmål og en forklaring med
  knappen Næste sker der intet ved et klik på forsøget: kortet (eller dets
  grønne knap) blinker, og knapper, der ikke hører til opgaven, er skjult.
  At se nærmere på det, der allerede er fremme, er altid i orden. Mønster:
  `iForsoeg`, `spaer` og `kortBlink` i `sc7.5_staerke_og_svage_syrer/js/fane.js`
  og afsnit 9 i dens selvtest, der prøver låsen i alle dele af alle mål.
* Skal eleven klikke på en ting i scenen, hjælper et gult skilt ved tingen
  med, hvad et klik gør ("Hold nede: vand"), mere end en lille pil eller en
  linje i panelet (en elevs ønske 6. oktober 2026). I `sc5.1_koncentration`
  fane 1 følger skiltene det, der mangler, bliver stående, til trinnet er
  gjort, og kan selv klikkes (`mangler` og `skilteNu` i `js/sim_kar.js`,
  `T.skilt` i `js/tegning.js`); `sc4.8_staaluld` har samme slags skilt. Det
  er et mønster, ikke en regel for alle: spørg brugeren, før det rulles ud.
* Partikler på mikroniveau har stoffets form (brugeren 9. oktober 2026: Cl⁻ er
  ikke aflang, det er CH₃COOH): en ion af ét atom er en kugle, et aflangt
  molekyle er aflangt, og det, der flytter (her hydronen), kan ses på
  molekylet. Signaturen er store mærker med tegnet og formlen, ikke en lille
  linje. Mønster: `FORM` i `sc7.5_staerke_og_svage_syrer/js/lup.js` og
  `T.signatur` i dens `js/tegning.js`.
* Fejl blokeres ikke, når det kan undgås. De får en konsekvens eller en forklaring.
* Tastaturgenveje og direkte links til faner (`index.html#salt`). Den virker, når
  den åbnes direkte fra harddisken.

**3. Overskuelig.** Én idé pr. mappe.

* Samme ramme hver gang: en toplinje med titel og knapper, en scene og et panel.
* Hver fane og hvert trin har én pointe, og det hele handler om det samme spørgsmål.

**4. Skarp.** Pointen kan siges i én sætning.

* Det, der ikke lærer noget, skæres væk, også når det er rigtigt.
* Korte sætninger. Ingen tankestreger og intet talesprog. Ladning ±1 skrives som
  + og −, aldrig 1+ og 1−.
* Lidt tekst på kortet (brugeren 9. oktober 2026: "stadig en smule for meget
  tekst"). Sig det ene, eleven skal gøre eller forstå, og gentag ikke kortet i
  en linje under det. Grænserne i `sc7.5_staerke_og_svage_syrer`, som dens
  selvtest tæller: et spørgsmål højst 105 tegn, et svar 34, et forsøg 95, et
  hint 100, forklaringen til et forkert svar 110 og til det rigtige 160. Kort
  må ikke blive indforstået: navnet på tingen bliver i teksten.
* Intet er indforstået (brugeren 9. oktober 2026: "Hvad er også her? Vær mere
  skarp i sproget, så eleverne ikke skal gætte hvad du mener"). Hver tekst
  nævner selv det glas, det stof og den lup, den handler om, og bruger ikke
  "her", "den" eller "nu" om noget, der stod i en tidligere tekst. Det, teksten
  henviser til, får en gul ring i scenen. Mønster: `om` i
  `sc7.5_staerke_og_svage_syrer/js/data.js`, `omNu` i dens `js/fane.js` og
  påstanden "intet er indforstået" i dens selvtest.

**5. Teoretisk velfunderet.** Modellen er ikke pynt.

* Det, eleven ser, er regnet af modellen. pH følger af ladningsbalancen i `sb3.2`.
  Det makroskopiske, partikelniveauet og symbolerne hænger sammen.
* Tallene har en kilde: Databogen, tabelværdier, rigtige kernemasser.
* Forenklinger er valgt med vilje, passer til niveauet og står i animationens README.

**6. Gerne lidt humoristisk.** Humoren gør det sjovt at blive og prøve igen, men
den må aldrig stå i vejen for pointen.

* Påskeæg belønner nysgerrighed.
* Kemichael er venlig i det, han gør, og sarkastisk i det, han siger. Sarkasmen
  rammer handlingen, aldrig eleven, og han forklarer ikke teori. Se
  `../v2/kemichael/README.md`.

## Sådan er en superanimation skruet sammen

* Op til fire faner om det samme spørgsmål, hver med sin pointe. Fanerne kan gå
  fra hverdag til kemi (`sb2.0`: trafikken over Lillebælt, rensdyr, torvet, N₂O₄)
  eller fra at bygge til at spille (`sc1.1`).
* Det, eleven har valgt, følger med fra fane til fane: saltet i `sc2.1`,
  opstillingen i `sb3.2`.
* Opgaver, et spil eller en ukendt prøve tjekker forståelsen, gerne i sidste fane.
* Hver fane er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og `nulstil()`, og
  kun den aktive fane kører. Kemien og tallene ligger for sig selv, adskilt fra
  tegningen.
* Mønster at læse først: `sc1.1_atombygger` og `sb3.2_titreringssimulator`.

## Kemichael

Kemichael præsenterer ikke fanerne. Brugeren fjernede reglen om, at han
præsenterer hvert rum, den 27. september 2026, fordi præsentationerne ofte blev
indforståede. De ældre superanimationer har stadig deres præsentation bag
knapperne Start præsentation og Nej tak; de beholder den, til brugeren siger
andet.

* **Ingen Kemichael ved katederet** (brugerens valg 9. oktober 2026: Kemichael
  hører primært til i laboratoriet, måske med et lille cameo hist og pist, og
  den siddende Kemichael bidrog ikke med nok). Den rolige Kemichael, der sad ved et kateder nederst i
  scenen (`NK.RoligLaerer`), er taget ud af de ti animationer, der havde ham:
  `sc4.3`, `sc4.5`, `sc4.6`, `sc4.7`, `sc4.10`, `sc4.11`, `sc5.1`, `sc5.2`,
  `sc8.2` og `sc8.5`. Nye superanimationer får ham ikke. Et cameo (et
  påskeæg som i `sc4.9_lightergas`) er i orden, når brugeren beder om det.
* **Hjælpen er en gul hintknap**, så eleven altid kan hjælpe sig selv
  (samme dag). Giv hint er fyldt gul (`.knap.hjaelp`), Vis svaret kun et gult
  omrids (`.svar`), og efter et forkert svar lyser knappen stille op
  (`.peg`), til den er brugt. Hintet og svaret står i linjen i opgavekortet
  lige over knappen, eller i arbejdsfeltet i scenen, hvor animationen har
  sådan et (`sc8.2`). Næste skridt, fejl og ros står samme sted. Mønster:
  `visKnap`, `besked` og `hjaelpVis` i `sc4.5_maengdeberegning/js/fane.js` og
  afsnittet HJAELPEKNAPPEN i dens `css/stil.css`.
* I `sc4.9_lightergas` og `sc_spil5_syregalgen` er han der ikke; han kommer kun
  ind, når forsøget går helt galt i et påskeæg.
* I `sc1.4_afstemning` er han slet ikke med (brugerens valg 30. september
  2026: "Michaels hint er det svageste led. Måske skal vi bare fjerne ham
  helt"). Hjælpen ligger i stedet i en **statuslinje** nederst i scenen med
  den ene knap i samme linje, og hintet er en trappe på tre trin, der hver
  giver ét skridt mere. Det er ikke en ny regel for de andre animationer, men
  mønsteret at læse, hvis en superanimation skal klare sig uden lærer.
* I `sc8.4_redoxafstemning` er han også taget helt ud (brugerens valg 3.
  oktober 2026). Hjælpen var i forvejen en knap og en besked på tavlen, så
  kun præsentationen, rosen og påskeægget forsvandt.
* I `sc4.8_staaluld` er han taget helt ud 5. oktober 2026 (brugerens ønske:
  "få michael helt ud af animationen, men behold en mulighed for at få
  hints"). Hintene er de samme; de står i en statuslinje nederst i scenen
  på fane 1 og lige under det felt, eleven skriver i, på fane 2.

### Når han præsenterer eller introducerer

Brugeren 3. oktober 2026, efter `sc8.1_spaendingsraekken`: det er fint, at han
introducerer, men introduktionen skal lære eleven at bruge animationen. Det
gælder de ældre præsentationer, når de bliver rettet, og enhver kort
introduktion fra hans hjørne. Reglerne står udførligt i `kemichael/README.md`:

* Hver linje siger, hvad fanen træner, eller hvordan en bestemt ting bruges.
  Hele, skarpe sætninger i almindeligt dansk. Ingen vittigheder, ingen gåder
  og intet om ham selv.
* Han peger på det, han taler om, og det får en gul ramme, der blinker: knappen,
  feltet eller tingen i scenen.
* Han går først videre, når eleven trykker Næste. Aldrig på tid.
* Taleboblen ligger øverst, så intet i scenen dækker den, og den dækker ikke
  det, han peger på.

Mønster: `sc8.1_spaendingsraekken` (`js/praesentation.js`, `js/laerer.js` og
`D.INTRO_*` i `js/data.js`). De andre ældre præsentationer kører stadig på tid;
de rettes, når brugeren beder om det.

## Fælles opbygning

* **Mappe:** en ny superanimation lægges her i `superanimationer/`. Stier ud af
  mappen har to niveauer: Kemichael hentes fra `../../v2/kemichael/`.
* **Navn:** `s`, niveau, kapitel og nummer og et kort navn uden æ, ø og å, fx
  `sc2.2_saltbygger`. Nummeret er emnet i samlingen (`samling_c2.html`).
  Efter omnummereringen 26. sept. 2026 passer det ikke for tre mapper, som ikke
  er omdøbt: `sc6.6_fedtstoffer` er nr. 5 i C6 (nr. 4 indtil 9. okt. 2026),
  `sc8.4_redoxafstemning` er c8.3 og `sc8.5_kaliumpermanganat` er c8.4.
* **Link-koderne i C6** (`data-emne`) følger ikke længere numrene: da
  `sc6.4_addition_og_plastik` kom ind som nr. 4 den 9. okt. 2026, rykkede de
  fire knapper efter den et nummer, men beholdt koderne c6.4 til c6.7, og den
  nye fik koden `c6.addition`. Så åbner delte links stadig det samme.
* **Indgang:** `index.html`. Ingen `fetch` og ingen moduler, så den virker fra
  harddisken. Mappen henter kun filer inde fra sig selv, bortset fra Kemichael og, for
  `sc6.2`, `tegnebraet`, `sc_spil4_organiske_grupper`, `sb4.5_organisk_syntese` og `sb4.7_spejlbilledeisomeri`, motoren i `../../molekylemotor/`.
* **Filer:** `css/stil.css`, `js/` delt efter ansvar og `sprites/` med SVG.
* **README.md** i hver mappe: hvad den viser, filerne, hvad man kan rette i,
  forenklingerne og linjen til menuen.
* **`_selvtest.html`** tjekker det, man ikke kan se på et skærmbillede: at modellen
  rammer tabelværdierne, at forløbet kan gennemføres, og at sproget overholder
  reglerne. Filer, der begynder med `_`, er udviklerværktøj og indgår ikke i
  animationen.
* **Menuen:** en ny animation ligger kun i sin mappe, til brugeren siger til. Først
  da kommer den i samlingsfilerne og `FEEDBACK_EMNER`, og kolonnen "I menuen" i
  oversigten rettes.

## Tjekliste før menuen

- [ ] Det er en superanimation, ikke et forsøg forklædt som en.
- [ ] Pointen kan siges i én sætning.
- [ ] Er den en afløser: de elementer, der var værd at beholde, er med.
- [ ] Udvidelserne tjener det samme spørgsmål.
- [ ] En elev, der ikke har fået emnet gennemgået, kommer i gang uden hjælp.
- [ ] Eleven gør selv det, der skal læres.
- [ ] Fejl giver en konsekvens eller en forklaring, ikke en blokering.
- [ ] Det, eleven ser, er regnet af modellen, og tallene har en kilde.
- [ ] Forenklingerne er valgt med vilje og står i mappens README.
- [ ] Quizzens forkerte svar er de fejl, elever faktisk laver.
- [ ] Sproget er kort og uden tankestreger, talesprog og 1+/1−.
- [ ] Humoren rammer handlingen, aldrig eleven.
- [ ] Kemichael blander sig ikke: han taler kun ved hint og svar og højst med én kort introduktion fra sit hjørne.
- [ ] Præsenterer eller introducerer han: skarpe linjer om brugen uden vittigheder, det, han peger på, blinker, og eleven trykker Næste.
- [ ] `_selvtest.html` er grøn, og siden virker fra harddisken.
- [ ] Brugeren har sagt, at den skal i menuen.

## Til den, der koder

Afgør først, om opgaven er en superanimation eller en superlab-animation. Er det
en superlab-animation, hører den ikke til i denne mappe. Læs README i mønsteret,
før du begynder. Reglerne i `CLAUDE.md` i roden af repoet gælder også her.
