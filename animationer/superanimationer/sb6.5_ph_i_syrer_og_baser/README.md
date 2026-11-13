# sb6.5 pH i syrer og baser

Superanimation til afsnit B6.5 pH i opløsninger af syrer og B6.6 pH i
opløsninger af baser i Kemibogen B. Bygget 12. nov. 2026 efter brugerens
ønske:

> Afsnit B6.5 pH i syrer (og B6.6 pH i baser). Hele B6.4 til B6.6 står uden
> animation. I beskrivelsen af animationen Kₛ og pKₛ står der udtrykkeligt, at
> pH i svage syrer og basestyrke ikke er med. Det er de beregninger, der
> fylder mest i kapitlet. Idé: Et skema med start, ændring og ligevægt, som
> fyldes ud trin for trin, mens luppen viser syren. Eleven vælger selv
> fremgangsmåde ud fra pKₛ (stærk, svag eller middelstærk). En ekstra fane har
> baser og salte med pOH.

**I menuen fra 13. nov. 2026 som B6 knap 2 (koden `b3.5`); mappen er ikke omdøbt.** Før det: Den ligger kun i sin egen mappe, til brugeren siger til.
Linjen til menuen: B6 i `kemi-b-filer/samling_b3.html`, mellem Kₛ og pKₛ og
Titreringssimulatoren (bogens rækkefølge), fx

```html
<button class="tab-btn" data-emne="b3.5" data-beskrivelse="Udfyld skemaet med start, ændring og ligevægt, mens luppen viser syren, vælg fremgangsmåden ud fra pKₛ, og regn pH i baser og salte over pOH." onclick="visAnimation(this, '../superanimationer/sb6.5_ph_i_syrer_og_baser/index.html')" title="pH i syrer og baser"><span class="btn-num">2</span><span class="btn-text">pH i syrer og baser</span></button>
```

Kommer den i menuen, skal `index.html` have linjen til `til_panelet.js`
(med samme `data-emne`), navnet i `FEEDBACK_EMNER`, og mappen kan omdøbes
efter sin plads i panelet (sb6.2, så titreringssimulatoren bliver sb6.3).

## Bestillingen

1. **Pointen:** pH følger af, hvor stor en del af syren der har afgivet sin
   hydron: al syren i en stærk syre, x fra skemaet og Kₛ i de andre (og for
   en svag syre er x så lille, at genvejen gælder), og for en base går vejen
   over [OH⁻] og pOH.
2. **Afløser** ingen: B6.4 til B6.6 havde ingen animation. Med fra
   naboerne: sb6.1's papirkort, tavle, lup, kolbe, farver (syre og base blå,
   vand og oxonium lilla) og rammer, der bygges op; sb2.4's måde at læse
   elevens udtryk med x på.
3. **Naboerne:** `sb6.1_syrestyrke` ejer Kₛ og pKₛ, regningen mellem dem og
   den ukendte syre ud fra en målt pH (den modsatte vej). `sb6.2_titreringssimulator`
   ejer titrerkurven og ækvivalenspunktet (B6.8). `sb2.4_ligevaegtsberegninger`
   ejer skemaet og CAS for ligevægte generelt. `sc7.3_ph_beregninger` ejer
   pH = −log [H₃O⁺] i kemi C. Basestyrken (B6.4) er her kun med som
   pK_b = 14,00 − pKₛ for natriumethanoat.
4. **Loftet:** tre faner. Fane 1: tre syrer, seks trin (syv for den første),
   100 molekyler i luppen. Fane 2: seks syrer, to eller tre trin. Fane 3: fire
   baser, tre eller fire trin.
5. **Layoutet:** scene plus panel som sb6.1, papirkortet øverst over en tavle.

## Fanerne

* **1 Skemaet** (`js/sim_skema.js`). Tre middelstærke syrer: methansyre
  0,0100 M (bogens eksempel, pH 2,90), phosphorsyre 0,100 M (1,63) og
  mælkesyre 0,0500 M (2,59). Under reaktionsskemaet (med H⁺-buen fra sb6.1)
  står rækkerne Start, Ændring og Ligevægt. Eleven skriver én række ad
  gangen i tre felter på kortet (et for hvert stof), og det skrevne står med
  det samme på en lys blå seddel i rækken; det, der mangler, har den gule
  ring. Første syre har spørgsmålet "Hvad angiver x?" før rækken Ændring
  (x defineres, før det bruges). Så Kₛ-brøken (tæller og nævner i felter med
  rigtig brøkstreg), CAS (knappen Løs ligningen med CAS, så de to løsninger på
  kortet), den negative løsning forkastes, og pH. Luppen viser 100 af syrens
  molekyler: ved Start er alle hele, og når rækken Ændring er rigtig, hopper
  hydronerne én ad gangen over på vand. Under luppen står tællingen med
  luppens tegn (fx 88 HCOOH, 12 HCOO⁻, 12 H₃O⁺), som svarer til rækken
  Ligevægt.
* **2 Vælg vejen** (`js/sim_vej.js`). Seks syrer: salpetersyre 0,025 M og
  saltsyre 0,0050 M (stærke), ethansyre 0,100 M og ammonium 0,100 M fra
  ammoniumchlorid (svage, genvejen) og hydrogenfluorid 0,0100 M og methansyre
  0,00100 M (middelstærke, valgt så genvejen giver et mærkbart forkert tal:
  2,59 mod 2,64 og 3,38 mod 3,47). Syren står på bogens pKₛ-skala øverst på
  tavlen. Eleven vælger fremgangsmåden (bogens figur b6-hvilken-formel) og
  regner pH. Luppen åbner først, når vejen er valgt, og viser, hvorfor vejen
  er den rigtige. Trinnet med CAS kommer kun ind for de middelstærke og først,
  når vejen er valgt, så panelet ikke røber svaret.
* **3 Baser og salte** (`js/sim_base.js`). Bogens fire eksempler i B6.6:
  natriumhydroxid 0,020 M (12,30), calciumhydroxid 0,0050 M (tæl
  hydroxidionerne, 12,00), ammoniak 0,0500 M (vælg genvejen, 10,97) og
  natriumethanoat 0,0500 M (hvilken ion er basen, pK_b = 14,00 − pKₛ,
  genvejen, 8,73). Reaktionsskemaet står øverst (natriumethanoat får
  ethanoats reaktion med vand, når ionen er fundet), rammerne følger bogens
  regnevej (figuren b6-base-vej), og nederst står pH-skalaen fra −1 til 15
  med udtonede ender. Skriver eleven pOH som pH, står det forkerte svar med
  rødt i den sure ende, og kortet siger "Husk det sidste trin".

Papirkortet fra start, ingen Kemichael, hintknappen på kortet, Begynd forfra
i panelet. Syrerne og baserne i panelet kan klikkes. Teorien bag knappen
Teori har bogens skala med fremgangsmåden under hver gruppe.

## Filerne

| Fil | Indhold |
|:--|:--|
| `index.html` | siden, de tre faner, teorien og rundvisningen |
| `css/stil.css` | kopieret fra sb6.1; nyt nederst under SB6.5 (tre felter på række, brøkfeltet) |
| `js/kerne.js`, `js/formel.js` | som sb6.1 |
| `js/data.js` | syrerne og baserne, modellen, tallene og læsningen af elevens tal og udtryk med x |
| `js/tegning.js` | som sb6.1; nyt nederst: rammerne, etiketten, luppens kegle og pH-skalaen |
| `js/lup.js` | som sb6.1, men koncentrationen er flaskens, og hydronerne hopper én ad gangen |
| `js/fane.js` | som sb6.1, plus `efterKort` (felterne får elevens tekst tilbage uden om HTML) |
| `js/trin.js` | den fælles trinmotor: kortet, felterne, Indsend svar, hint, Vis svaret, CAS og panelet |
| `js/sim_skema.js`, `js/sim_vej.js`, `js/sim_base.js` | de tre faner med hver sin tabel over trinnene (tekster, fejl og hint) |
| `js/rundvisning.js`, `js/app.js` | rundvisningen og fanerne |
| `sprites/` | flasken, kolben og pH-metret fra sb6.1; `_sprites.html` viser dem alene |
| `_selvtest.html` | selvtesten (kræver en server med `animationer/` som rod) |

## Tallene og forenklingerne

* Kₛ regnes af tabellens pKₛ og afrundes til tre betydende cifre som i
  bogens eksempel (1,78 · 10⁻⁴ M for methansyre). x afrundes til tre
  betydende cifre, og pH regnes af det afrundede x (bogen: −log(1,25 · 10⁻³)
  = 2,90). Svar godtages inden for 0,01.
* Luppen regner omdannelsesgraden med den uafrundede Kₛ og viser det
  afrundede antal af 100. Ammonium viser 0 af 100 (modellen siger 0,0075).
* Fremgangsmåden følger bogens figur: stærk under pKₛ 0, ligningen fra 0 til
  4, genvejen over 4 (også for de meget svage). At vælge ligningen for en
  svag syre er ikke forkert kemi, men kortet siger, at genvejen er nok, og
  det koster stjernen. Claudes valg.
* Phosphorsyre regnes som en monohydron syre (kun første trin), som i bogens
  tabel.
* Fane 3 har ingen lup: bogen viser baserne med regnevejen, og en lup med
  calciumhydroxid ville have to hydroxidioner pr. formelenhed. Claudes valg.
* Ved start skal [H₃O⁺] være 0 M; 10⁻⁷ M får bogens sætning om vands
  selvionisering.
* Elevens tal læses med komma eller punktum, med M, og i potensform kun med
  et gangetegn foran 10 (ellers blev 0,0100 læst som 0,0 · 10⁰; sb6.1 har
  samme læsning uden gangetegnet, men dens tal rammer det ikke).

## Selvtesten

`_selvtest.html` (ALT OK, 39 påstande): bogens tal i B6.5 og B6.6 (eksemplerne,
tabellen over genvejen og tabellen over baserne), at fane 2 har to af hver
slags syre, og at genvejen er mærkbart forkert for de middelstærke, at
elevens tal og udtryk læses, alle tre faner gennemført med de typiske fejl
(hver med sin forklaring), at intet løses uden Indsend svar, at luppen først
reagerer ved rækken Ændring (fane 1) og først åbner med den rigtige vej (fane
2), stjernerne, sproget (loftet over tekstlængder, ingen tankestreger,
ASCII-dansk eller 1+/1−), at startbilledet står stille, og at kortet og
tavlens indhold kan være der i alle trin fra 1100 × 620 til 1600 × 950.
