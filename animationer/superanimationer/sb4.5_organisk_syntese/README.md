# sb4.5 Organisk syntese

Superanimation til Organisk B (`kemi-b-filer/samling_b4,5,6.html`, knap 5). Den afløser
`kemi-b-filer/Eb5_breakingbad.html` ("Sælg kemikalier", Syntese-Tycoon 2.1), som nu ligger
i `kemi-c-filer/arkiv/Eb5_breakingbad_oldversion.html`. Bygget 2. oktober 2026 på
brugerens bestilling: "lav sb4.5 om til en superanimation (og put den direkte på
hjemmesiden)".

## Bestillingen

1. **Pointen i én sætning.** En ester laves af en carboxylsyre og en alkohol, hvor syrens
   OH og alkoholens H bliver til vand, og mangler man syren, laver man den ved at oxidere
   en primær alkohol; esterens navn siger, hvilke to stoffer den er lavet af.
2. **Hvad den afløser, og hvad der er med.** Fra den gamle: hylden (lageret), indkøb med
   penge, reaktoren med to pladser, svovlsyre (H⁺) som katalysator, varme, kaliumpermanganat
   til oxidation, missionerne (de fem første ordrer i Fabrikken er de gamle i samme
   rækkefølge og med de samme priser), børsen med høj efterspørgsel hvert 30. sekund,
   duftene (pære, banan, ananas), aspirin og titlen ved målet. Nyt: tavlen med
   strukturformler, ordrer, der kun giver navnet, og en Reaktoren-fane uden penge.
3. **Naboerne.** b5.2 (Estersyntese) ejer forsøget i laboratoriet, b5.3 (Oxidation af
   alkohol) ejer oxidationstallene, b5.1 ejer påvisningen af aldehyder, tegnebrættet ejer
   navngivningen af alt andet, og Organiske grupper ejer stofklasserne. Her er der ingen
   oxidationstal og ingen opstilling trin for trin.
4. **Loftet.** To faner. Hylden har 7 alkoholer, 3 syrer og kaliumpermanganat; fire syrer
   og propanon kan kun laves. Ti ordrer i Reaktoren. Tre åbne ordrer i Fabrikken.
5. **Layoutet.** Scene og panel som de andre superanimationer: hylden øverst, ordren på én
   linje over arbejdsfladen, kolben til venstre og tavlen til højre, statuslinjen nederst.

## Fanerne

**1 Reaktoren** (`#reaktoren`). Ti ordrer i tre grupper. Ordren siger kun stoffets navn,
hvad kunden skal bruge det til, og duften. Eleven lægger to stoffer i kolben (klik eller
træk), tænder for svovlsyre og varme og trykker Start. Tavlen viser reaktionen med
strukturformler: syrens atomer er orange, alkoholens blå og ilten fra permanganaten lilla.
Ved esterdannelsen lyser syrens OH og alkoholens H, de går sammen til vand, og resten
glider sammen til esteren; navnet står i de samme to farver (pentyl | ethanoat). Ved
oxidationen bliver alkoholen først til aldehydet og så til syren, med et O fra
permanganaten. Det, eleven laver, kommer på hylden under Lavet og kan bruges igen.

- Let: ethylethanoat (neglelakfjerner), propylethanoat (pære), pentylethanoat (banan),
  ethylmethanoat (rom). Alt står på hylden.
- Middel: ethylbutanoat (ananas), propanon (acetone), pentylbutanoat (abrikos). Syren
  eller ketonen skal laves ved oxidation først.
- Svær: pentylpentanoat (grønt æble: pentan-1-ol bruges to gange), methyl-2-hydroxybenzoat
  (vintergrøn: salicylsyrens COOH reagerer), acetylsalicylsyre (aspirin: ringens OH reagerer).

**2 Fabrikken** (`#fabrikken`). Den gamle "Sælg kemikalier": 300 kr. i kassen, + på kortet
køber én portion, tre ordrer fra kunder (Neglesalonen, Slikfabrikken, Bageriet, Juicebaren,
Parfumeriet, Fysioterapeuten, Apoteket, Limfabrikken), som bliver leveret, så snart stoffet
er lavet. Grossisten fører ikke butansyre ("den lugter af opkast"), så ananas og abrikos
kræver oxidation. Titlerne Lærling, Laborant (1000 kr.), Kemiker (2000 kr.) og
Fabrikschef (3000 kr.). Er kassen og lageret tomme, låner banken 200 kr. Fabrikken huskes
i browseren; Forfra kræver to tryk.

## Reglerne (`js/kemi.js`)

Kemien er regler, ikke en opskriftsliste. Molekylerne kommer fra molekylemotoren
(`../../molekylemotor/`), og produkterne bygges som grafer og navngives af den:

- **Ester:** et stof med COOH og et stof med OH (alkohol eller ringens OH på salicylsyre).
  Kræver svovlsyre og varme. Mangler en af dem, sker der intet, og blandingen bliver i
  kolben, til eleven har rettet det.
- **Oxidation:** alkohol + kaliumpermanganat med varme. Primær: aldehyd og så carboxylsyre.
  Sekundær: keton. Syrer, ketoner og estere oxideres ikke.
- **Ingen reaktion** (to syrer, to alkoholer, syre + permanganat): blandingen hældes ud.
- **Påskeæg:** ethanol + ethanol med svovlsyre og varme giver diethylether ("en ether, ikke
  en ester"). Methansyre + permanganat bliver til CO₂ og vand ("en dyr måde at lave
  sodavand på").

## Hjælpen

Ingen Kemichael (som `sc1.4_afstemning` og `sc_spil9_kemikort`). Statuslinjen nederst siger
næste skridt, hvad der gik galt, og har den ene knap: tre hint og så svaret. Hintene
bygges af den vej, reglerne finder (`NK.Kemi.rute`): navnets to dele, hvilke stoffer de
kommer fra, og om syren skal laves først. Vis svaret lægger stofferne i kolben og tænder
for det, der skal til; eleven trykker selv Start. En ordre leveret uden svaret får en
stjerne. Et klik på tavlen springer animationen over.

## Filerne

```
index.html          siden: to faner, teorien og rundvisningen
css/stil.css        grundlaget fra sc1.4 plus hylden, kolben, tavlen og Fabrikkens panel
sprites/reaktor.svg kuglekøler, rundkolbe, vandbad og varmeplade (væsken tegnes i koden)
js/kerne.js         fælles hjælpere (som sc1.4)
js/data.js          stofferne, priserne, duftene, kunderne og ordrerne
js/kemi.js          reglerne, ruterne og navnets to dele
js/morf.js          tavlen: billederne af atomerne og bevægelsen mellem dem
js/reaktor.js       hylden, pladserne, kontakterne, kolben og Start (begge faner)
js/fane.js          statuslinjen og hinttrappen (begge faner)
js/sim_reaktor.js   fane 1
js/sim_fabrik.js    fane 2
js/rundvisning.js   rundvisningen på ? (som sc1.4)
js/app.js           faner, taster og tegneløkken (som sc1.4)
_selvtest.html      udviklerværktøj
```

Ret i `js/data.js` for stoffer, priser, dufte og ordrer. Et nyt stof på hylden skal have en
SMILES-streng, motoren kan navngive; selvtesten tjekker navnet.

## Forenklinger

- Esterdannelsen er en ligevægt (K ≈ 4), men i spillet bliver én portion syre og én portion
  alkohol til én portion ester. Ligevægten står i teorien og hører til B2.
- Temperaturen er varme til eller fra. Den gamle havde temperaturvinduer pr. reaktion
  (fx 55 til 95 °C), som var opfundne.
- Aspirin laves her af salicylsyre og ethansyre. I fabrikken bruger man ethansyreanhydrid,
  fordi ringens OH reagerer langsomt med en syre; det står i teorien.
- Oxidationen af en primær alkohol går altid helt til syren (tilbagesvaling). Methanol
  bliver til methansyre; at methansyre kan oxideres videre til CO₂, er påskeægget.
- Kun ethanol + ethanol giver en ether. Andre par af alkoholer giver ingen reaktion.
- Salicylsyre reagerer ikke med sig selv i spillet.
- Duftene er lærebøgernes: methylethanoat lim, ethylethanoat neglelakfjerner, propylethanoat
  pære, pentylethanoat banan, octylethanoat appelsin, ethylmethanoat rom, methylbutanoat
  æble, ethylbutanoat ananas, pentylbutanoat abrikos, pentylpentanoat grønt æble,
  methylsalicylat vintergrøn. Den gamle kaldte ethylethanoat for pære.

## Selvtesten

`_selvtest.html` gennem en lokal server med rod i `animationer/` (molekylemotoren ligger
uden for mappen). 55 påstande: navnene fra motoren, alle 49 par af syre og alkohol (esteren
er syre + alkohol − H₂O atom for atom), oxidationen, de forkerte par, påskeæggene, alle ti
ordrer med hinttrappen, første ordre som en elev med klik og træk, Fabrikkens penge gennem
de fem første ordrer, tavlen og layoutet fra 1100 × 700 til 1600 × 950, sproget og
skriftstørrelsen.

## Menulinjen

```html
<button class="tab-btn" data-emne="eb5" data-beskrivelse="…" onclick="visAnimation(this, '../superanimationer/sb4.5_organisk_syntese/index.html')" title="Organisk syntese"><span class="btn-num">5</span><span class="btn-text">Organisk syntese</span></button>
```
