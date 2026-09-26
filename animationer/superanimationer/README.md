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
| Kemichael | præsenterer hver fane og kan komme på besøg | fast bestanddel |

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

| Mappe | I menuen | Note |
|-------|----------|------|
| `s_flowchart_opgaven` | nej, og skal ikke | ny, 26. sept. 2026; ikke en superanimation om et begreb, men brugerens Word-flowchart "Kan du løse opgaven?" som studieværktøj med samme ramme: brikken går rundt på flowchartet, hvert Ja og Nej bliver tjekket med en sarkastisk udfordring, og et svar, eleven ikke kan stå inde for, sender brikken tilbage ad pilen; generel udgave uden fagligt indhold og uden Kemichael (brugerens ønske); skal ikke linkes i samlingerne |
| `sb1.1_reaktionshastighed` | ja | `samling_b1.html`; den gamle b1.1 ligger i `kemi-c-filer/arkiv/` |
| `sb1.4_thiosulfat` | ja | `samling_b1.html` som b1.4 (26. sept. 2026); ny, sept. 2026, bygget fra bunden ud fra forsøget med thiosulfat og syre (krydset, koncentration, temperatur); eleven stopper selv uret og regner koncentrationerne ud |
| `sb2.0_ligevaegt_intro` | ja | `samling_b2.html` som b2.0, nr. 0 før Ligevægtsloven (26. sept. 2026); den første superanimation, bygget fra bunden |
| `sb3.2_titreringssimulator` | ja | `samling_b3.html` |
| `sc1.1_atombygger` | ja | `samling_c1.html` og `samling_NV.html` direkte (26. sept. 2026); genvejen `kemi-c-filer/c1.1_atommodel_ioner.html` er tilbage for gamle links |
| `sc1.2_grundstofudstilling` | ja | `samling_c1.html` og `samling_NV.html`; den gamle c1.2 ligger i `arkiv/`; den første med tilbuddet om præsentationen |
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
| `sc4.3_stofmaengdeberegning` | ja | `samling_c4.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c4.3 "Stofmængdeberegning" med n = m / M: Formlen (seks runder, hvor eleven trækker n, m, M, navne, enheder og regnetegn op på en tavle, stilladset forsvinder runde for runde, gram streges ud i g / (g/mol) = mol, formlen vendes til m = n · M og M = m / n, og til sidst skrives formlen og enhederne uden brikker), Vægten (de seks gamle opgaver med formlen først og tallet med enhed; bunken på vægten deles i poser med 1 mol) og Hurtigrunden (12 spørgsmål på tid, fejl kommer igen, rekorden huskes); formeltrekanten kun som andet hint, når formlen vendes; den rolige Kemichael ved katederet som sc4.5; en muldvarp er et påskeæg; den gamle c4.3 ligger i `arkiv/` |
| `sc4.4_aekvivalente_maengder` | ja | `samling_c4.html` (26. sept. 2026); ny, sept. 2026, afløser c4.4 (pølsevognen med hotdogs og dobbeltburgere, begrænsende ingrediens og overskud, molekyler i et kammer, hvor hver figur til sidst er 1 mol, og tavlen med søjler, hvor et rigtigt svar fylder netop sine blokke; afstemning kun på Svær); lutter agurker er et påskeæg; den gamle c4.4 ligger i `arkiv/` |
| `sc4.5_maengdeberegning` | ja | `samling_c4.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c4.5 (Vejen: pulver på en vægt bliver til poser med 1 mol, poserne går gennem reaktionspilen og vejes; Skemaet: de gamle opgaver med afstemning, trinvis eller frit, og en skålvægt, der står lige, når alle masser er fundet; Begrænsende mængde: poserne reagerer i hele sæt, og resten ligger tilbage). Kemichael sidder stille ved et kateder med en fast boble, der siger næste skridt, og der er ingen knapper til præsentationen (brugerens valg); den gamle c4.5 ligger i `arkiv/` |
| `sc4.6_idealgasligningen` | ja | `samling_c4.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c4.6 i to faner (brugerens valg): Stemplet (cylinderen med stempel, lodder, varmeplade, gasflaske og lås fra den gamle; quizzen er blevet til syv forudsigelser, hvor eleven gætter først og prøver selv, og modellen er facit; pV-grafen står i scenen; et stop ved 60 L) og Beregningen (tolv opgaver i Let, Middel og Svær med formlen først, instrumenter, der er dækket, til tallet er regnet, en tavle med de pæne beregninger og en besked til °C, R = 8,314, mL og 24 L pr. mol); bar og R = 0,0831 L·bar/(mol·K) som i kompendiet i stedet for den gamles opfundne konstant; den rolige Kemichael ved katederet som sc4.5; 22,4 L ved 0 °C er et påskeæg; den gamle c4.6 ligger i `arkiv/` |
| `sc4.10_betydende_cifre` | ja | `samling_c4.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c4.10 "Afrunding/opskrivning" med de samme fem opgavetyper og runder på ti: Tæl cifrene (eleven klikker på de betydende cifre), Flyt kommaet (videnskabelig notation begge veje eller enheder for volumen, masse, stofmængde, koncentration og tryk; kommaet hopper plads for plads, og eksponenten tæller med), Afrund (måletal eller regnestykker, nu også division) og Blandet (rekorden huskes); cifrene står som brikker på en tavle, og hver typisk fejl får sin besked; den uskrevne regel (tal mellem 0,01 og 100 skrives som almindelige tal) står i teorien, og ingen opgave bryder den; den rolige Kemichael ved katederet som sc4.5 (brugerens valg); et klik på kommaet er et påskeæg; den gamle c4.10 ligger i `arkiv/` |
| `sc4.11_kalk_i_muslingeskaller_inaktiv` | nej | mappen har fået `_inaktiv` i navnet og er ikke sat i menuen; ny, 25. sept. 2026, bygget fra bunden ud fra NF-øvelsen med muslingeskaller (Havhaven), placeret i emne 4 som vejeanalyse: Forsøget (vejebåd og kolben med saltsyre på hver sin vægt, eleven aflæser m(før), trækker pulveret over med spatlen, venter, til vægten står stille, og aflæser m(efter); luppen viser H₃O⁺, der tager CO₃²⁻ fra kalken, og CO₂, der stiger op; alt på én gang sprøjter), Beregningen (de to målinger og én baglæns, formlen først, med omskifteren Uden mol (2,27) / Med mol (n = m / M, 1 : 1, m = n · M), også via `#nf` og `#mol`) og Fejlkilder (gruppe A og B side om side, seks fejl, gæt først); den rolige Kemichael ved katederet som sc4.5; hjertemuslingen er et påskeæg; ikke i menuen |
| `sc5.1_koncentration` | ja | `samling_c5.html` som c5.1 (26. sept. 2026); ny, 25. sept. 2026, afløser c5.1 og c5.2 (emne 5 bliver to superanimationer, sc5.1 og sc5.2): Karret (skefulde kobber(II)sulfat, en vandhane og en tappehane, luppen med altid lige meget væske, c = n / V i panelet; fem opgaver, to med et gæt først), Målekolben (seks regneopgaver fra c5.2, formlen først, vægten og kolben gør det, der er regnet, og en forkert masse vejes af) og Fortynding (pipette, målekolbe og sprøjteflaske til ti gange tyndere, så fire fortyndinger med formlen først). Den rolige Kemichael ved katederet som sc4.5 (brugerens valg); de gamle c5.1 og c5.2 ligger i `arkiv/` |
| `sc5.2_formel_og_aktuel` | ja | `samling_c5.html` som c5.2 (26. sept. 2026); Mohrtitreringen er rykket op som c5.3; ny, 25. sept. 2026, afløser c5.3 og c5.4: Opløsningen (portioner salt i et literglas, luppen og søjler med saltets og ionernes koncentration; seks opgaver, to med et gæt og én med to salte), Ionerne (tallene foran ionerne i skemaet og så ionernes koncentrationer i Let, Middel med baglæns og Svær fra massen; nye salte hver gang) og Blandinger (to salte i ét glas og to glas, der hældes sammen, når det samlede rumfang er fundet). Den gamle c5.4 opgave 5 regnede en blanding forkert; her er den to salte i samme glas. Den rolige Kemichael som sc5.1; de gamle c5.3 og c5.4 ligger i `arkiv/` |
| `sc6.1_kogepunkt` | ja | `samling_c6.html` (26. sept. 2026); ny, sept. 2026, afløser c6.1, brugerens første animation (varm op med glas og ballon og kurven, formen med tre isomerer af C₅H₁₂, hvem koger først i blandinger; tændstikken er et påskeæg); den gamle c6.1 ligger i `arkiv/` |
| `sc6.2_zigzagformler` | ja | `samling_c6.html` som c6.2; de gamle c6.2, c6.3 og c6.4 ligger i `arkiv/`, og knap 4 og 5 er fjernet (C6 er omnummereret uden huller 26. sept. 2026); sept. 2026: quizzerne zigzag, navne og isomerer og fane 4 Opløselighed (`#oploeselighed`, den gamle c6.5 som spil med et bægerglas med heptan og vand); Kemichaels skuffe med klistermærker fra quizzerne til tegnebrættet; tegnebrættet var fane 1 og har fra 25. sept. 2026 sin egen side (`tegnebraet/`); motoren til at tegne og navngive molekyler ligger i `../molekylemotor/` og deles med tegnebrættet; den gamle c6.5 ligger i `arkiv/`, fanen har ingen egen knap |
| `sc6.6_fedtstoffer` | ja | `samling_c6.html` som c6.4 fra 26. sept. 2026 (C6 omnummereret); den gamle c6.6 ligger i `arkiv/`; sept. 2026: to faner (fabrikken, hvor eleven bygger fedtstoffer til fem kunder, og køkkenet, hvor fedtstofferne står i fryser, køleskab, på bordet og i solen, med molekylerne i et zoomvindue); det harske smør er et påskeæg |
| `sc7.1_syrebasereaktioner` | ja | `samling_c7.html` (26. sept. 2026); ny, sept. 2026, afløser c7.1: Hydronen (eleven trækker et H fra syren over på basens frie elektronpar i strukturformler; parret bliver hjemme, ladningerne følger med), Produkterne og Parrene på en tavle med tre sværhedsgrader og nye reaktioner hele tiden; forkerte svar og mærkater forklares ud fra fejlen; en hydron i kaffen er et påskeæg; den gamle c7.1 ligger i `arkiv/` |
| `sc7.2_ph_skalaen` | ja | `samling_c7.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c7.2, der kun dækkede pH 4 til 10: Skalaen (tolv hverdagsstoffer, som eleven placerer på skalaen fra 0 til 14, før pH-metret måler dem), Luppen (1 prik = 1 ion, zoom i trin af ti, så hele skalaen kan tælles; fra pH 1 til 13 er 12 klik) og Fortyndingen (saltsyre og natronlud fortyndes 10 gange ad gangen, ét trin pr. glas, og syren bliver aldrig basisk); et præcist gæt er et påskeæg; den gamle c7.2 ligger i `arkiv/` |
| `sc7.3_ph_beregninger` | ja | `samling_c7.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c7.3: eleven regner selv på en indbygget lommeregner, der skriver det tastede på én linje som en TI og under det, hvordan den har læst det (eksponent hævet, brøkstreg, egne parenteser blege), og som kan vise det samme som Maple-kode (rødt input, blåt resultat, eksakt uden komma); tre faner efter retning: Find pH (pH-metret måler bagefter), Find koncentrationen ([H₃O⁺] og [OH⁻] på etiketten) og Stærke syrer og baser (fra flasken til pH i op til fire trin); regnevejen med stationerne [OH⁻], [H₃O⁺], pH og c vokser med opgaven, og en pil kommer først, når eleven har valgt dens formel; hvert trin er delt i små bider (vælg formlen, tast på lommeregneren, der siger til, når tallet er rigtigt, og skriv svaret), og knappen hjælper med den bid, man er ved (Giv hint, så Vis formlen, Vis tasterne eller Vis svaret); teksterne og Kemichael er skrevet til en svag elev efter brugerens første test; forklaring på de typiske fejl; 42 på lommeregneren er et påskeæg; den gamle c7.3 ligger i `arkiv/` |
| `sc7.4_titrering_eddike` | ja | `samling_c7.html` som c7.4; den gamle c7.4 ligger i `arkiv/`; ny, 25. sept. 2026, afløser c7.4 som superanimation, ikke som superlab-animation (brugerens ønske): Titreringen (kolben står klar, eleven åbner hanen med en skyder, drypper til sidst og aflæser selv buretten; luppen viser syren som 8 figurer, og den sidste forsvinder, når kolben bliver lyserød; kurven og datatabellen til Excel fra den gamle), Beregningen (fire trin fra forbrug til masseprocent; eleven skriver selv formlen og så tallet, og de pæne beregninger kommer på en tavle) og To kolber (én ting ændret: vand, prøvens masse, koncentrationen af NaOH, vand i buretten, spildt eddike); NaOH kaldes natriumhydroxid, aldrig natronlud; et resultat på hundrededelen er et påskeæg |
| `sc8.1_spaendingsraekken` | ja | `samling_c8.html` (26. sept. 2026); ny, 25. sept. 2026, afløser c8.1: Forsøget (fem stænger og seks glas med Mg²⁺, Zn²⁺, Fe²⁺, Cu²⁺, Ag⁺ og saltsyre; eleven trækker stængerne ned, luppen viser den afstemte reaktion med elektronerne, og skemaet med 25 forsøg fyldes ud; fem mål med spørgsmål, hvor de forkerte svar er rust, farvet zink og kogende syre), Rækken (eleven stiller selv de fem metaller og hydrogen i rækkefølge ud fra skemaet, og bogens række kommer frem) og Forudsig (ja eller nej, før stangen kommer ned, så produkterne og afstemningen ud fra elektronerne; 12 opgaver fra 1 : 1 til 3 : 2 og derefter tilfældige par af 10 metaller); en stang i Kemichaels kaffe er et påskeæg; den gamle c8.1 ligger i `arkiv/` |
| `sc8.2_oxidationstal` | ja | `samling_c8.html` som c8.2, én knap for de gamle c8.2 og c8.3 (26. sept. 2026); ny, 25. sept. 2026, afløser c8.2 og c8.3 i to faner (brugerens ønske): Reglerne (formlen på en tavle med et felt over atomerne, regnestykket og atomerne som brikker; de seks stoffer trin for trin fra c8.2 og de 25 øvestoffer i fire familier, en besked til hver typisk fejl) og Elektronerne (de tolv molekyler og ioner fra c8.3 som elektronprikformler; eleven gætter først, trækker så hvert elektronpar hen til det mest elektronegative atom, og regnskabet viser valenselektronerne minus dem, atomet har; reglerne svigter kun for H₂O₂ og OF₂); den rolige Kemichael ved katederet (brugerens valg); et elektronpar i kaffen er et påskeæg; de gamle c8.2 og c8.3 ligger i `arkiv/` |
| `sc8.4_redoxafstemning` | ja | `samling_c8.html` som c8.3 (26. sept. 2026, C8 omnummereret); ny, 25. sept. 2026, afløser c8.4 med de samme trin (oxidationstal, hvad oxideres, elektroner pr. atom, koefficienter, ladning, H⁺ eller OH⁻, vand) og 37 reaktioner i stedet for 7 (Let uden ilt, Middel i surt miljø, Svær med basisk miljø, H⁺ efter pilen og samme grundstof begge veje); en besked til hver typisk fejl, Giv hint og Vis svaret på hvert trin, en kontrol under skemaet og en elektronvægt, der tipper, indtil der afgives lige så mange elektroner, som der optages; 20 på en vægtskål er et påskeæg; den gamle c8.4 ligger i `arkiv/` |
| `sc8.5_kaliumpermanganat` | ja | `samling_c8.html` som c8.4 (26. sept. 2026, C8 omnummereret); ny, 26. sept. 2026, afløser c8.5 (brugerens ønske: "ekstraopgaver til redox-afstemning, shinet lidt op", opskrivningen stilladseret som brugerens tegning): Urglassene (ét glas med basisk permanganat som i den gamle: lidt sulfit giver grønt, mere sulfit brunt, svovlsyre næsten farveløst; den næste reaktion åbner først, når skemaet er afstemt, og eleven vælger manganstoffet ud fra farvekortet) og Flere reaktioner (14 med permanganat i surt, neutralt og basisk miljø og med indekstal, den første er Fe²⁺ fra tegningen). Afstemningen skrives i et hæfte på ternet papir: oxidationstal over atomerne, klammer under skemaet med gangetal og ↑ eller ↓ under den lange reaktionspil ("5 ↑1", "1 ↓5"), og rækkerne Ladning, H-atomer og O-atomer under siderne (vandet afstemmer H, O er kontrollen); ti små bidder med trinliste, en besked til hver typisk fejl og en lup, der viser elektronerne med elevens egne gangetal; den rolige Kemichael som sc8.2, men han siger kun én kort sætning, og knappen Læs mere åbner hans forklaring i fuld skærm (brugerens ønske efter første test); flasken over kaffen er et påskeæg; den gamle c8.5 ligger i `arkiv/` |
| `sc_spil_iontetris` | ja | `samling_c_spil.html` som nr. 6 (26. sept. 2026); ny, sept. 2026, kategorien Spil; Ion-Tetris, afløser `c_spil_iontetris.html` efter brugerens ønsker: ionerne er de syv tetrisbrikker, et neutralt salt smuldrer til pulver og forsvinder, og brikkerne ovenover falder (kædereaktioner); grå sten med fem felter (alle 18 pentominoer) forsvinder kun i fulde rækker; man vinder ved at lave alle saltene i panelet, og rekorden er tiden; plus blå og minus rød; tre sværhedsgrader (Let med K⁺ og Br⁻, Middel, Svær med sammensatte ioner); den gamle ligger i `arkiv/` |
| `sc_spil_jeopardy` | ja | `samling_c_spil.html` (nr. 3, i stedet for den gamle Ion-Tetris, 25. sept. 2026); ny, sept. 2026; Kemi-Jeopardy til tavlen, afløser PowerPoint-skabelonen; C (1.g) som standard, B med `#b`; egne spørgsmål som tekst; de originale lyde ligger kun i NK_Undervisning |
| `sc_spil_lykkehjul` | ja | `samling_c_spil.html` som nr. 7 (26. sept. 2026); EscapeRoom er rykket til nr. 8; ny, sept. 2026, kategorien Spil; Kemi-Lykkehjulet til tavlen eller alene (`#alene`: 3 liv pr. runde, eleven skriver løsningen, rekord), afløser PowerPoint-skabelonen; Kemi B som standard, A og NF med `#a` og `#nf`, emnequizzer med fem runder (`#atom`, `#molekyler`, `#beregning`); quizzer som tekst med tavlerne vist undervejs, upload, eksport og link; de originale lyde ligger kun i NK_Undervisning |
| `sc_spil_organiske_grupper` | ja | `samling_c_spil.html` som nr. 4 og `kemi-b-filer/samling_b4,5,6.html` som nr. 9 med `#b` (26. sept. 2026); ny, 25. sept. 2026, kategorien Spil; afløser `c_spil_organiske_grupper.html` (Kemi C, `index.html`) og `b_spil_organiske_grupper.html` (Kemi B, `index.html#b`) med de gamle spils balance tal for tal; molekylerne tegnes af `../molekylemotor/`, og gruppen, der afgør stofklassen, vises i spandens farve; forklaring til hver fejl; Stofgruppemester ved 14.000 point til escaperoommet; B har stadig den fælles top 10; de gamle ligger i `arkiv/` |
| `sc_spil_pacman` | ja | `samling_c_spil.html` som nr. 1 (26. sept. 2026); ny, sept. 2026, kategorien Spil; Pacman Quiz, afløser `c_spil_pacman_emner.html` med samme labyrint, emner og sværhedsgrader (brugerens balance er bevaret tal for tal); hint til hvert forkert svar; Svær + Mix giver stadig Labyrintmester til escaperoommet; den gamle ligger i `arkiv/` |
| `sc_spil_syregalgen` | ja | `samling_c_spil.html` som nr. 5 og `Historie/samling_2.3_ideologier.html` som 2.3.6 med `#historie` (26. sept. 2026); ny, sept. 2026, kategorien Spil; afløser `c_spil_hangman.html` og historiens `2.3.6_syregalgen_ideologier.html` med ét spil og to ordlister (`#historie`); træningsområder efter kapitel (C1 til C8, fx `#c3`), 196 kemiord, ledetråd for et skridt, klassekammerat på en planke over et kar med pH-meter; Kemichael kommer kun efter et plask (brugerens valg, ingen præsentation); Syreimmun til escaperoommet er bevaret; de gamle ligger i `arkiv/` |
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

## Kemichael præsenterer hvert rum

Hver fane (hvert rum) har en kort præsentation ved Kemichael. Han kommer ikke af
sig selv: første gang fanen åbnes i en browser, står der to knapper midt foroven
i scenen, **Start præsentation** og **Nej tak**. Så kan eleven kigge sig omkring
først og selv vælge, hvornår han skal tale, eller sige nej. Trykker eleven Start,
går han ind, siger, hvor man er, og hvad man skal, og går igen. Mønster:
`sc1.2_grundstofudstilling` (`js/praesentation.js` med tilbuddet,
`laererIntro` og `introVaek` i `js/laerer.js`).

* To eller tre replikker på højst ca. 60 tegn: hvor man er, hvad man gør, og
  gerne en tør bemærkning til sidst. Han forklarer ikke teori.
* Han peger på det, han taler om, og det lyser op, fx feltet, man skriver i.
* Præsentationen låser ikke fanen. Man kan klikke og skrive, mens han taler,
  uden at han forsvinder.
* Han går kun, når eleven vil det: den store knap "Spring præsentationen over"
  midt foroven i scenen, to klik direkte på ham eller Esc. Det første klik på ham
  får knappen til at blinke. Et klik andre steder og tastetryk sender ham ikke ud.
* Tilbuddet kommer én gang pr. fane pr. browser. Valget huskes i `localStorage`.
  Starter eleven et spil, er det det samme som Nej tak, og tilbuddet må gerne
  også forsvinde, når den første opgave er løst (det gør det i sc1.2). <kbd>Esc</kbd> er det samme som Nej tak. <kbd>K</kbd> viser
  præsentationen igen uden at spørge, fx når læreren vil vise den for klassen.
* Replikkerne står som data (`D.INTRO` i `js/data.js`), ikke inde i scenen.
* Stilarket skal have `[hidden] { display: none !important; }` eller
  `.tilbud[hidden] { display: none; }`. Ellers bliver knapperne stående efter
  Nej tak, fordi `.tilbud` giver `display: flex` (rettet i sb1.1, sc2.4 og sc3.4
  den 24. sept. 2026).

Reglen kom til med `sc2.3` i september 2026. Tilbuddet med de to knapper kom til
med `sc1.2` den 24. september 2026 efter brugerens ønske: det var svært at følge
med i præsentationen, når den startede, mens man selv kiggede sig omkring. Samme dag fik
alle superanimationer med en præsentation tilbuddet. De ældre beholder deres
egen `startIntro`, og `NK.Praesentation.pakInd` i `js/app.js` pakker den ind;
nye bruger `NK.Praesentation.kobl` som sc1.2.

**Undtagelse: den rolige Kemichael.** I `sc4.5_maengdeberegning` sidder han stille
ved et kateder nederst til venstre, og hans boble står fast til højre for ham
som linjen med næste skridt. Den skifter kun, når der er noget nyt, og
forsvinder ikke af sig selv. Hans første linje på en fane er præsentationen,
så der er ingen knapper. Brugerens valg 25. september 2026: talebobler, der
kører ind over scenen og forsvinder igen, kan være forstyrrende. Koden er
`js/laerer.js` (`NK.RoligLaerer`) med figuren fra `K.tegneserieFigur`.
`sc4.6_idealgasligningen` bruger samme udgave (brugerens valg 25. september 2026).

## Fælles opbygning

* **Mappe:** en ny superanimation lægges her i `superanimationer/`. Stier ud af
  mappen har to niveauer: Kemichael hentes fra `../../v2/kemichael/`.
* **Navn:** `s`, niveau, kapitel og nummer og et kort navn uden æ, ø og å, fx
  `sc2.2_saltbygger`. Nummeret er emnet i samlingen (`samling_c2.html`).
  Efter omnummereringen 26. sept. 2026 passer det ikke for tre mapper, som ikke
  er omdøbt: `sc6.6_fedtstoffer` er c6.4, `sc8.4_redoxafstemning` er c8.3 og
  `sc8.5_kaliumpermanganat` er c8.4.
* **Indgang:** `index.html`. Ingen `fetch` og ingen moduler, så den virker fra
  harddisken. Mappen henter kun filer inde fra sig selv, bortset fra Kemichael og, for
  `sc6.2`, `tegnebraet` og `sc_spil_organiske_grupper`, motoren i `../../molekylemotor/`.
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
- [ ] Kemichael tilbyder at præsentere hver fane (Start præsentation / Nej tak) og går kun, når eleven vil det.
- [ ] `_selvtest.html` er grøn, og siden virker fra harddisken.
- [ ] Brugeren har sagt, at den skal i menuen.

## Til den, der koder

Afgør først, om opgaven er en superanimation eller en superlab-animation. Er det
en superlab-animation, hører den ikke til i denne mappe. Læs README i mønsteret,
før du begynder. Reglerne i `CLAUDE.md` i roden af repoet gælder også her.
