# sb1.2 Energiprofilen

Superanimation til Kemibogen B1.3 Aktiveringsenergi og temperatur. Åbn `index.html`
(virker også direkte fra harddisken). Direkte links: `index.html#profil` og
`index.html#temperatur`.

Ny 24. nov. 2026. Afløser den gamle `kemi-b-filer/b1.2_energidiagram.html` (B1 knap 2).
Ikke i menuen endnu, og brugeren har ikke set den.

## Bestillingen (brugerens ja 24. nov. 2026)

1. **Pointen:** Bakkens højde (aktiveringsenergien) afgør, hvor mange sammenstød der
   har energi nok. Forskellen mellem reaktanter og produkter afgør kun, om reaktionen er
   exoterm eller endoterm. Højere temperatur giver flere molekyler energi nok.
2. **Afløser:** den gamle b1.2. Med fra den: energiprofilen med det aktiverede kompleks,
   Eₐ og ΔH, exoterm og endoterm, temperaturen og skyderne (de er blevet til håndtag i
   Fri leg). Taget ud: katalysatoren (hører til b1.3 Katalyse) og A₂ + B₂ (nu rigtige
   reaktioner). Rettet: den gamle sagde, at reaktionen først går, når "molekylernes
   energi" når over toppen. Bogen siger, at nogle få molekyler altid har energi nok.
3. **Naboerne:** sb1.1 ejer sammenstødene og hastigheden, sb1.4 ejer målingen af
   tommelfingerreglen, b1.3 ejer katalyse.
4. **Loftet:** 2 faner, 2 og 3 opgaver, højst 6 trin pr. opgave, 2 reaktioner.
5. **Layoutet:** papirkortet øverst i midten, reaktionsskemaet stort under det, figuren
   på et lyst ark som bogens figurer. Intet panel (regel 3).

## Fanerne

| Fane | Eleven | Pointen |
|------|--------|---------|
| 1 Læs energiprofilen | finder reaktanter, produkter, det aktiverede kompleks, pilen for Eₐ, Eₐ i kJ/mol og exo/endo for NO₂ + CO → NO + CO₂; så spejles profilen, og den modsatte vej aflæses | Eₐ måles fra reaktanterne; samme bakke er 134 kJ/mol høj fra den ene side og 360 kJ/mol fra den anden |
| 2 Temperaturen | ser kurven over molekylernes energi, Eₐ-stregen og luppen; skruer vandbadet til 30 °C og 10 °C | kurven flytter sig næsten ikke, men andelen over Eₐ fordobles pr. 10 °C |

Hvert løst trin får noget frem i scenen (regel 13): navnene og molekylerne, tallene på
aksen, Eₐ-pilen, ΔH og termometeret i omgivelserne. Det, kortet spørger om, har en gul
ring. Efter sidste opgave er Fri leg slået til: på fane 1 trækkes i toppen og
produkterne, på fane 2 skrues der på vandbadet.

## Tallene og forenklingerne

* NO₂ + CO → NO + CO₂: ΔH = −226 kJ/mol fra dannelsesentalpierne (NO₂ 33,2; CO −110,5;
  NO 90,3; CO₂ −393,5 kJ/mol). Eₐ = 134 kJ/mol er lærebogsværdien (nogle bøger har 132).
  Den modsatte vej: Eₐ = 360 kJ/mol, ΔH = +226 kJ/mol.
* Thiosulfat og syre: Eₐ = 50 kJ/mol, samme værdi som i sb1.4, så 10 °C giver omtrent
  dobbelt hastighed.
* Kurven er Maxwell-Boltzmann-fordelingen af bevægelsesenergien (tre dimensioner),
  regnet af `D.f` i `js/data.js`. Andelen over Eₐ (`D.andel`) er 1 ud af 155 millioner
  ved 20 °C, 80 millioner ved 30 °C og 315 millioner ved 10 °C.
* **Forenklingen:** Arealet over Eₐ er så lille, at det ikke kan ses. Bogens figur
  overdriver det. Her er kurven tegnet rigtigt, aksen springer fra 20 til 45 kJ/mol, og en
  lup forstørrer højden omkring Eₐ ca. 10 millioner gange.
* Kurven gælder molekylernes energi, mens bogen taler om sammenstød med energi nok.
  Andelen bruges som mål for begge.

## Figurerne (24. nov. 2026, anden runde)

Brugeren: figurerne var for simple, "især kolben med thiosulfat og syre .. det ligner noget fra gemini 3.0".
Vandbadet, bægerglasset og termometeret er nu SVG-figurer i `sprites/` med glas, lys og skygge
(`_sprites.html` viser dem alene og samlet): et glaskar med vand og et varmelegeme af stål på en
sokkel med et betjeningspanel, hvor − og + sidder i knapbrøndene, displayet viser temperaturen
med grønne cifre, og en lampe lyser orange, mens badet varmer, og blå, mens det køler.
Bægerglasset på 100 mL har skala, tykt glas og 50 mL mælket, svagt gul blanding (svovlet), og
etiketten står over vandet. Glastermometeret står i vandet, og den røde søjle følger
temperaturen. Samme termometer står i omgivelserne på fane 1. Luppens kant er blankt metal med
lys i glasset. Vandets farve skifter ikke længere med temperaturen (det gør vand ikke).

## Filerne

* `js/data.js`: kemien, tallene og alle tekster (opgaver, svar, hints, forklaringer).
* `js/motor.js`: kortet, hinttrappen, Indsend svar, opgaverækken med låste titler, Start
  forfra, Fri leg og det, der huskes i browseren. Fælles for begge faner.
* `js/sim_profil.js` og `js/sim_temp.js`: de to faner.
* `js/tegning.js`: papiret, pilene, atomerne i bogens farver, molekylerne og termometeret.
* `js/sprites.js` og `sprites/`: vandbadet (to lag), bægerglasset og termometeret.
* `js/kerne.js`, `js/kort.js`, `js/rundvisning.js`, `js/app.js`: kopier fra sc5.7
  (kort.js har klassen `lange` til svar i hele sætninger).
* `_selvtest.html`: 209 påstande om modellen, teksterne, forløbet, låsen, knapperne på
  vandbadet og kortets plads i tre størrelser.

## Til menuen

Når brugeren siger til: knap 2 i `kemi-b-filer/samling_b1.html` peger på
`../superanimationer/sb1.2_energiprofilen/index.html` (behold `data-emne="b1.2"`),
linjen til `til_panelet.js` sættes øverst i `<head>`, og den gamle flyttes til
`kemi-c-filer/arkiv/b1.2_energidiagram_oldversion.html`. Kemibogen A2.1 linker til den
gamle fil og skal så pege på den nye.
