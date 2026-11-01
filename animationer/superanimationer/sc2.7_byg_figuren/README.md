# sc2.7 Byg figuren: fagord til kapitel 2

Ny 1. nov. 2026 (brugeren: "Jatak. Lav kapitel 2."), bygget efter opskriften i
`../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren til et nyt kapitel"), som
også forklarer, hvordan animationen virker. I menuen Byg figuren (`kemi-c-filer/samling_c_bygfiguren.html`, knappen "byg" i
animationspanelet) som nr. 2 fra 2. nov. 2026 (`?emne=c2.byg`).

## Bestillingen

1. **Pointen i én sætning.** Kapitel 2's fagord sat på figurer i bogens stil, så
   eleven ser, hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens natriumion,
   chloridion, id-endelser, sammensatte-ioner, iongitter, elektronoverfoersel og
   faeldning-blyiodid.
3. **Naboerne.** `sc2.2_saltbygger` ejer at bygge formler, `sc2.4_faeldningsreaktioner`
   at forudsige fældninger. Her sættes kun ord på.
4. **Loftet.** Fire faner, én pr. afsnit. Alle 32 fagord er med.
   - 2.1 Ioner: 4 fagord i ét lag.
   - 2.2 Ioners navne: 16 fagord i fire lag (positive, negative, to gange
     sammensatte).
   - 2.3 Ionforbindelser: 5 fagord i to lag.
   - 2.4 Fældningsreaktioner: 7 fagord i to lag.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| 2.1 | natriumatomet afgiver en elektron, chloratomet optager en (skalmodel), Mg²⁺ til højre | ion (titel på kortet med begge ioner), positiv ion og negativ ion (skilte under ionerne), ladning (2+ i Mg²⁺) |
| 2.2 | et kort pr. ion med kuglemodel og formel; kortet "brom → bromid" | navneskilte under kortene, -id på bogstaverne id, sammensat ion som titel på rammen |
| 2.3 | en skål køkkensalt, et lag af iongitteret med én formelenhed i en stiplet ramme, Na⁺ og Cl⁻ med pile, der tiltrækker | salt og ionforbindelse (et par over skålen: "[ ] eller [ ]" med én fælles streg), iongitter, formelenhed, ionbinding (pilene) |
| 2.4 | bly(II)nitrat og kaliumiodid hældes sammen og giver gult PbI₂, luppen med Pb²⁺, I⁻, K⁺ og NO₃⁻; et udsnit af fældningstabellen og ionskemaet | fældningsreaktion (titel på rammen), bundfald, tilskuerion (en K⁺), fældningstabel (titel), letopløselig (et L), tungtopløselig (T), ionskema (titel) |

Ord i overskud er typiske elevfejl, der ikke kan forsvares som rigtige: ammonium
ved de positive ioner af ét atom, sulfat ved de negative (sulfid og sulfat) og
sammensat ion ved formelenheden.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de samme som i sc1.5 og skal holdes
ens. Rettes noget i motoren, rettes det i begge mapper. Kapitlets egne filer er
`js/data.js` (forklaringerne fra `Kemibogen/fagord/kapitel-2.qmd` med hævede og
sænkede tal skrevet som tegn), `js/fig_ioner.js`, `fig_navne.js`, `fig_forb.js` og
`fig_faeld.js`. `_selvtest.html` åbnes direkte fra disken; ALT OK (798) 1. nov. 2026.

## Valg og forenklinger

- Positive ioner er røde og negative blå som i bogen. I fældningen er K⁺ orange og
  I⁻ lilla som i bogens figur. NO₃⁻ er én kugle med formlen i luppen. Luppen ser ind i
  opløsningen lige over bundfaldet og ikke i bundfaldet (brugeren 1. nov. 2026); toppen
  af gitteret står nederst i luppen.
- Iongitteret er ét lag på 5 × 5 ioner, ikke den rumlige model.
- Kun bogens hovedeksempel i 2.4 (bly(II)iodid); afstemningen i fire trin med MgCl₂
  og NaOH er ikke med.
- Lagenes rækkefølge og ordene i overskud er Claudes valg; brugeren har ikke set
  figurerne endnu.
