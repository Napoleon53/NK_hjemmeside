# sb6.1 Kₛ og pKₛ

Superanimation til afsnit B6.3 Syrestyrke i Kemibogen B. Bygget 12. nov. 2026
efter brugerens ønske: "Kan du ikke lave pKs og Ks til en superanimation, som er
mere spændende at tilgå?" Brugeren valgte de tre faner (anbefalingen).

**I menuen** fra 12. nov. 2026 (brugeren: "Den må gerne komme i menuen.. den
er bedre!"): B6 knap 1 i `kemi-b-filer/samling_b3.html` med koden `b3.1`, så
gamle links virker, og `index.html` har linjen til `til_panelet.js`. Den afløser
`kemi-b-filer/b3.1_pKs_Ks_miniopgaver.html`, som bliver liggende, til den
byggede bog linker hertil. Kilden til Prøv selv i B6.3 og A1.6 linker hertil.

## Bestillingen

1. **Pointen:** Jo længere en syres reaktion med vand er forskudt mod højre, jo
   større er Kₛ og jo lavere er pKₛ, og pKₛ = −log Kₛ lægger alle syrer på én
   skala.
2. **Afløser** den gamle b3.1 "Fra Ks til pKs". Med fra den gamle: de fire trin
   (basen med de typiske fejl som forkerte svar, Kₛ-udtrykket ved at trække
   stofferne op i brøken med vand som fælde, pKₛ med fejlene fortegn, ln, kun
   eksponenten og afrunding, og styrken på skalaen), farverne for de to
   syre-basepar (blå og lilla) og H⁺-buen. Nyt: Syreskalaen med luppen og Den
   ukendte syre.
3. **Naboerne:** `sb6.2_titreringssimulator` ejer titrerkurven og pH under en
   titrering. `sc7.5_staerke_og_svage_syrer` (C, ikke i menuen) ejer kalken og
   fortyndingen. pH i en svag syre (B6.5) og basestyrke (B6.4) er ikke med.
4. **Loftet:** tre faner. Fane 1: fem flasker og ét spørgsmål, 100 partikler i
   luppen. Fane 2: bogens elleve syrer, fire trin hver. Fane 3: tre ukendte
   flasker, seks syrer på hylden.
5. **Layoutet:** scene plus panel som sb7.7, papirkortet øverst over en tavle.

## Fanerne

* **1 Syreskalaen** (`js/sim_skala.js`). Bogens figur b6-pks-skala med
  Kₛ-skalaen lige over pKₛ-skalaen, så eleven ser, at den ene vender omvendt af
  den anden. Fem flasker (ethansyre, saltsyre, methansyre, ammonium,
  hydrogencarbonat) kommer én ad gangen på hylden med Kₛ på skiltet. Eleven
  trækker flasken op på skalaen eller klikker på skalaen (piletasterne flytter
  0,1); markøren viser Kₛ og pKₛ. Luppen viser 100 af syrens partikler i
  0,10 M ved markørens Kₛ og følger med, mens flasken flyttes. Indsend svar
  bedømmer (±0,3); fortegnsfejlen og en flaske for langt til hver side får hver
  sin forklaring. Til sidst: hvor mange gange større er Kₛ for methansyre end
  for ethansyre (én enhed i pKₛ er en faktor 10)?
* **2 Regn på syren** (`js/sim_regn.js`). Den gamle træner på tavlen: reaktionen
  (svarene på kortet), Kₛ-udtrykket (træk fra bakken op i brøken), beregningen
  og styrken. Retningen skifter fra syre til syre: fra Kₛ til pKₛ eller fra pKₛ
  til Kₛ (tallet foran tierpotensen og eksponenten i hvert sit felt). Første gang
  hver vej vælger eleven formlen. Den første syre er ethansyre (bogens
  eksempel); syrerne i panelet kan klikkes. Skalaen kommer med første hint i
  trin 4.
* **3 Den ukendte syre** (`js/sim_ukendt.js`). Tre flasker med en kendt
  koncentration: A methansyre 0,100 M (pH 2,38), B ascorbinsyre 0,0500 M
  (pH 2,74), C ammonium fra ammoniumchlorid 0,100 M (pH 5,13). Eleven måler pH
  (knappen eller et klik på pH-metret), regner i bogens fire trin (figuren
  b6-ks-vej: oxonium, basen, syren, konstanten) og pKₛ og finder syren på
  hylden. Øverst på tavlen står reaktionsskemaet S + H₂O ⇌ B + H₃O⁺ med
  H⁺-buen (brugerens ønske 12. nov. 2026: "et billede af en generel syre/base
  reaktion, hvor der under skemaet dukker nogle udtryk op i takt med at man
  svarer"). [H₃O⁺], [B] og [S] kommer frem under deres stof, når de er regnet,
  og det, kortet spørger om, har den gule ring. Under skemaet har Kₛ, pKₛ og α
  hver sin ramme, og tallene i Kₛ-brøken har samme farve som stofferne i
  skemaet (S og B blå, H₃O⁺ lilla). A har [B] som eget trin og til sidst
  omdannelsesgraden; i B og C udfyldes [B] af sig selv. I C er [S] lig med cₛ
  med tre betydende cifre, og kortet siger det. På små skærme springer
  udtrykkene i skemaet mellemregningen over.

Papirkortet fra start, ingen Kemichael, hintknappen på kortet, Begynd forfra i
panelet. Teorien bag knappen Teori har bogens skala med otte syrer.

## Filerne

| Fil | Indhold |
|:--|:--|
| `index.html` | siden, de tre faner, teorien og rundvisningen |
| `css/stil.css` | kopieret fra sb7.7; nyt nederst under SB6.1 (felterne til en potens, syrelisten) |
| `js/kerne.js` | fælles hjælpere (som sb7.7) |
| `js/data.js` | syrerne (bogens tabel), alle tekster, modellen og tallene |
| `js/formel.js` | formler og regnestykker med rigtig brøkstreg på lærredet; stykker med hver sin farve |
| `js/tegning.js` | tavlen, skilte, sprites, flasken og bogens skala |
| `js/lup.js` | luppen med 100 partikler |
| `js/fane.js` | scenekortet, hintknappen, Indsend svar (som sb7.7; kortet kan slutte uden knap) |
| `js/sim_skala.js`, `js/sim_regn.js`, `js/sim_ukendt.js` | de tre faner |
| `js/rundvisning.js`, `js/app.js` | rundvisningen og fanerne |
| `sprites/` | flasken, kolben og pH-metret som SVG; `_sprites.html` viser dem alene |
| `_selvtest.html` | selvtesten (kræver en server med `animationer/` som rod) |

## Tallene og forenklingerne

* Kₛ og pKₛ er bogens tabel i B6.3 (fane 1 viser tabellens Kₛ med to
  betydende cifre; fane 2 regner med tre, så −log giver tabellens pKₛ).
* Inddelingen er bogens: stærk under 0, middelstærk 0 til 4, svag 4 til 10,
  meget svag over 10. Den gamle b3.1 havde grænsen ved 12.
* Luppen regner andelen med Kₛ = x² / (c − x) ved 0,10 M og viser det afrundede
  antal; de 100 partikler står stille i et gitter, så de kan tælles. Vand tegnes
  ikke. Ammonium og hydrogencarbonat viser 0 af 100, fordi modellen siger
  0,0075 og 0,0022.
* De ukendte flaskers pH er regnet af tabellens Kₛ og afrundet til to
  decimaler; kæden regnes med tre betydende cifre i hvert trin som i bogens
  eksempel, og svarene godtages inden for afrundingen.
* Formlen vælges i fane 2 (ikke skrevet), første gang hver vej. I fane 3 står
  formlen i hintet og på tavlen, når trinnet er løst.

## Selvtesten

`_selvtest.html` (ALT OK, 49 påstande): bogens tal og regneeksemplet, luppens
antal, at de ukendte peger på den rigtige flaske, alle tre faner med de typiske
fejl, at intet løses uden Indsend svar, at reaktionsskemaet kun viser det
regnede, sproget, at startbilledet står stille, at kortet kan være over tavlen
fra 1100 × 620 til 1600 × 950, og at skemaet og rammerne kan være der.
