# sc3.6 Byg figuren: fagord til kapitel 3

Ny 1. nov. 2026 (brugeren: "Lav Byg figuren til kapitel 3"), bygget efter
opskriften i `../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren til et nyt
kapitel"), som også forklarer, hvordan animationen virker. I menuen Byg figuren (`kemi-c-filer/samling_c_bygfiguren.html`, knappen "byg" i
animationspanelet) som nr. 3 fra 2. nov. 2026 (`?emne=c3.byg`).

## Bestillingen

1. **Pointen i én sætning.** Kapitel 3's fagord sat på figurer i bogens stil, så
   eleven ser, hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens bindingstyper,
   prik-streg-vand, dobbelt-tripel, former, elektronegativitet, polaere-molekyler,
   tommelfinger-trin og blandbarhed-glas.
3. **Naboerne.** `sc3.1_elektronprikformler` ejer at tegne prikformler,
   `sc3.2_rumlig_opbygning` formen, `sc3.3_polaere_molekyler` tovtrækningen og
   `sc3.5_vand_eller_heptan` forsøget med lagene. Her sættes kun ord på.
4. **Loftet.** Fire faner, én pr. afsnit. Alle 21 fagord er med, og ionbinding fra
   kapitel 2 sættes på igen i 3.1 og 3.3.
   - 3.1 Elektronparbindinger: 9 fagord og ionbinding i tre lag.
   - 3.2 Navngivning og form: 4 fagord i ét lag.
   - 3.3 Elektronegativitet: 3 fagord og ionbinding fra kapitel 2 i ét lag.
   - 3.4 Polære molekyler: 5 fagord i to lag.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| 3.1 | natriumchlorid og dichlor side om side; vand, carbondioxid og dinitrogen som elektronprikformel og stregformel i to rækker | molekyle (skilt øverst på Cl₂-kortet, hvor NaCl-kortet har ionforbindelse), ionbinding (pilene mellem Na⁺ og Cl⁻), elektronparbinding eller fælles elektronpar (et par under kortet, der peger på parret mellem de to Cl), elektronprikformel og stregformel (foran rækkerne), frit elektronpar (parret over O), enkeltbinding, dobbeltbinding og tripelbinding (stregerne) |
| 3.2 | methan, ammoniak, vand og carbondioxid som kuglemodeller med frie elektronpar som blå skyer, tetraederet og pyramidens bund stiplet | tetraeder, trekantet pyramide, vinklet molekyle (skilte under kortene; lineært molekyle står der i forvejen), talforstavelse (di i carbondioxid) |
| 3.3 | udsnit af tabellen med elektronegativitet; Cl−Cl, H−Cl og Na⁺ og Cl⁻ som i bogens figur bindingstyper | elektronegativitet (overskrift på tabellen), upolær binding, polær binding, ionbinding (skilte under kortene) |
| 3.4 | vand med δ+, δ− og pile; propan-1-ol med −OH i en teal kasse; to reagensglas: vand og ethanol (ét lag), vand og heptan (to lag) | polært molekyle, polær gruppe, blandbarhed (overskrift på rammen, midt mellem glassene), upolært stof (heptanlaget), polært stof (vandlaget) |

## Valg og forenklinger

- Rettet 1. nov. 2026 efter brugerens kommentarer: "en elektronparbinding = fælles
  elektronpar. Og det ville være forvirrende at sætte elektronparbinding øverst."
  Derfor er de to ord nu et par ("[ ] eller [ ]") under Cl₂-kortet, der peger på de
  to elektroner mellem atomerne, og ikke længere en overskrift for slags binding.
  Ionbinding peger tilsvarende på pilene mellem Na⁺ og Cl⁻. Øverst på kortene står,
  hvad stoffet er: ionforbindelse (gråt skilt) og molekyle (plads).
- Ionbinding er fra kapitel 2, men er en plads igen i 3.1 og 3.3 (brugeren: "der må
  gerne være lidt repeterende øvelser"). Forklaringen er fra kapitel 2's fagordliste
  og står i `NK.TIDLIGERE` i `data.js`, og `NK.GENTAGET` lader selvtesten acceptere,
  at ordet står på to figurer.
- Kortene i 3.1 står 26 enheder nede: i den svære udgave fylder de ti lange ord tre
  rækker i bakken, og kortet øverst dækkede ellers skiltene på skærme fra ca. 1400 px.
- Blandbarhed beholdes som fagord, fordi bogen har det (fagordlisten og overskriften
  "Reglen om blandbarhed"); blandbarhedsregler findes ikke i bogen. Overskriften står
  midt mellem de to glas og ikke over glasset med to lag (brugeren 1. nov. 2026).
- Enkeltbinding, dobbeltbinding og tripelbinding sidder ved siden af hinanden, hvor
  man tæller stregerne. Enkeltbinding kunne også forsvares på parret mellem de to Cl;
  fejlteksten siger derfor, at ordet passer, men hører til nederst.
- Ionforbindelse og lineært molekyle er grå skilte, der står der i forvejen.
- Elektronerne fra hydrogen er grønne som i bogen (`gron` i `svg.js`, kopieret til
  sc1.5 og sc2.7). I CO₂ er carbons elektroner blå og oxygens grønne, i N₂ det
  venstre atoms blå og det højres grønne, som i bogens figur dobbelt-tripel.
- Polært stof peger på vandlaget og upolært stof på heptanlaget i samme glas, så
  forskellen på et polært molekyle (én partikel) og et polært stof (væsken) ses.
- Ingen ord i overskud: de oplagte forvekslinger (polær binding ved −OH,
  polært molekyle ved H−Cl) kan forsvares som rigtige.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de samme som i sc1.5 og sc2.7 og
skal holdes ens. Kapitlets egne filer er `js/data.js` (forklaringerne fra
`Kemibogen/fagord/kapitel-3.qmd`, lavet med et lille script), `js/fig_binding.js`,
`fig_form.js`, `fig_en.js` og `fig_polaer.js`. `_selvtest.html` åbnes direkte fra
disken; ALT OK (682) 1. nov. 2026.
