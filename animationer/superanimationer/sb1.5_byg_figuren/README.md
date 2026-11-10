# sb1.5 Byg figuren: fagord til kapitel B1

Ny 1. nov. 2026 (brugeren: "Du må gerne lave en ny fane i kemi-b-animationspanel til
'byg figuren' til B-niveau. Start med at bygge animationen til b1 om
reaktionshastigheder"). Bygget efter opskriften i `../sc1.5_byg_figuren/README.md`
("Opskrift: Byg figuren til et nyt kapitel"), som også forklarer, hvordan animationen
virker. Den første Byg figuren til B-bogen.

**I menuen:** B-panelets nye fane "byg" (`samling_alt_b.html`) åbner sit eget panel,
`kemi-b-filer/samling_b_bygfiguren.html`, som indtil videre kun har B1 (`?emne=b1.byg`).
`findSideFraEmne` i `samling_alt_b.html` sender alle koder, der ender på `.byg`, dertil,
og `FEEDBACK_EMNER` har linjen "Byg figuren / B1. Kinetik". På B-bogens fagordliste til
B1 kommer flisen Byg figuren, når bogen bygges næste gang (`BYG_FIGUREN` i
`NK_Undervisning/Kemibogen/stil/fagord.html` kender nu også `b/fagord/kapitel-b1.html`).
Brugeren har ikke set figurerne endnu.

## Bestillingen

1. **Pointen i én sætning.** Kapitel B1's fagord sat på figurer i B-bogens stil, så
   eleven ser, hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens hastighed-tangent,
   hastighed-sekant, sammenstoed-koncentration, energiprofil, energiprofil-exo-endo,
   energifordeling, tommelfinger, energiprofil-katalysator, enzym og enzym-temperatur.
3. **Naboerne.** `sb1.1_reaktionshastighed` (kurver, tangent, sammenstød),
   `b1.2_energidiagram`, `b1.3_katalyse_h2o2` og `sb1.4_thiosulfat` ejer at måle og regne.
   Her sættes kun ord på.
4. **Loftet.** Fem faner, én pr. afsnit, og 19 af de 21 fagord.
   - B1.1 Reaktionshastighed: 4 fagord i to lag.
   - B1.2 Koncentration og sammenstød: 3 fagord i ét lag (sammenstødsmodel er taget ud).
   - B1.3 Aktiveringsenergi: 5 fagord i to lag.
   - B1.4 Temperatur: 1 fagord (temperatur) og reaktionshastighed og aktiveringsenergi
     igen, i ét lag.
   - B1.5 Katalysatorer og enzymer: 6 fagord i to lag (katalysator er taget ud).

   **Brugerens rettelser 1. nov. 2026**, da figurerne var lavet: "Fjern hele delen med
   sammenstødsmodel", "fjern energidiagrammet fra 1.5" og "fjern ordet
   tommelfingerregel". Sammenstødsmodel og katalysator står i `NK.UDELADT`. Brugeren vil
   senere se på afsnittene B1.2 og B1.4: "der skal nok slåes nogle afsnit sammen så
   kapitel 1 kun indeholder 3 måske 4 afsnit". Så skal fanerne følge med.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| B1.1 | to grafer over [BrO₃⁻] med bogens kurve (k = 0,0116 s⁻¹): til venstre tangenten i t = 0 s med "v₀ = 1,2 · 10⁻⁵ M/s" og i lag 2 tangenten i t = 120 s med "v = 2,9 · 10⁻⁶ M/s"; til højre linjen gennem punkterne ved 0 s og 60 s med hældningstrekanten | tangent (linjen i t = 0 s, gult felt langs linjen), starthastighed (tallet v₀), reaktionshastighed (tallet ved 120 s), gennemsnitshastighed (linjen og trekanten) |
| B1.2 | et kort med v = k · [A]ˣ · [B]ʸ (fanen hedder Koncentration) | hastighedsudtryk (titel på kortet), hastighedskonstant (k), eksponent (x og y) |
| B1.3 | energiprofilen med A₂ og B₂, det aktiverede kompleks i et glimt og to AB, dobbeltpilen Eₐ og den røde pil for energien, der afgives; to små profiler med termometer | energiprofil (titel), det aktiverede kompleks (molekylerne på toppen), aktiveringsenergi (dobbeltpilen), exoterm og endoterm (titler på de små kort) |
| B1.4 | energifordelingen ved 20 °C og 30 °C med Eₐ og de farvede haler; søjlerne 1, 2, 4 og 8 gange ved 20, 30, 40 og 50 °C | temperatur (20 °C og 30 °C ved kurverne), aktiveringsenergi (stregen ved Eₐ), reaktionshastighed (titel over søjlerne) |
| B1.5 | et enzym med substratet på vej ned i lommen og et enzym, hvor en inhibitor sidder i lommen; enzymets aktivitet med optimum og et lille enzym, der foldes ud (fanen hedder Enzymer) | enzym, substrat, aktivt center, inhibitor, optimum (toppen), denaturere (enzymet, der foldes ud) |

## Valg og forenklinger

- Ord, der ville afsløre en plads, står ikke i figuren: bogens "tangent i t = 0 s" er
  blevet til "hældningen ved t = 0 s", "få sammenstød" og "mange sammenstød" er taget
  af, "aktiveringsenergi, Eₐ" og "aktiveret kompleks" er blevet til Eₐ, "lav temperatur"
  og "høj temperatur" er blevet til 20 °C og 30 °C, enzymerne har ingen tekst, og grafens akse hedder
  "aktivitet" i stedet for "enzymets aktivitet".
- Nogle ord passer også et andet sted, og fejlteksten siger det: reaktionshastighed på
  v₀ eller på linjen gennem to punkter (begge er hastigheder, men pladsen spørger om
  navnet til netop det tidspunkt eller tidsrum).
- B1.4 har kun ét fagord. reaktionshastighed og aktiveringsenergi står der igen og i
  `NK.GENTAGET`. Tommelfingerregel var med som ord, der er værd at træne, til brugeren
  bad om at få det fjernet.
- Kurverne i B1.4 er regnet med bogens formel, men med Eₐ = 3,5 og 1,0 mod 1,3, så
  halen ved 30 °C er dobbelt så stor som ved 20 °C (tommelfingerreglen). Bogen bruger
  1,0 mod 1,7 og skriver "lav" og "høj temperatur".
- Det lille enzym, der foldes ud (B1.5), og enzymet med inhibitoren er Claudes
  tilføjelser; bogen har dem ikke. Inhibitoren er et gråt molekyle med samme form som
  substratet og en knop, så den passer i lommen.
- k, x og y står lysegrå i formlen, til deres pladser er løst.
- Lagenes rækkefølge og figurernes indhold er Claudes valg.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de samme som i sc1.5 til sc7.6 (kopieret
1. nov. 2026) og skal holdes ens. Rettes de i C-mapperne, kopieres de også hertil.
Kapitlets egne filer er `js/data.js` (forklaringerne fra
`Kemibogen/b/fagord/kapitel-b1.qmd`, lavet med et lille script, kursiv taget af),
`js/kurver.js` (tegnehjælpen: grafer, energiprofiler, partiklerne A og B, kuglemodeller,
termometer, enzym, substrat og inhibitor i bogens stil fra `vaerktoej/lav_figurer.py`) og
`js/fig_hastighed.js`, `fig_sammenstoed.js`, `fig_aktivering.js`, `fig_temperatur.js` og
`fig_katalyse.js`.

**Gule felter langs en linje.** Motoren kender kun cirkler og rektangler som gule
felter. En skrå tangent eller en kurve kan ikke få et rektangel, uden at det også dækker
kurven og de andre linjer. Nederst i `js/kurver.js` er motorens `lavPlads` derfor
udvidet, så et felt også kan være `{ linje: [[x, y], ...], b: 15 }`: en bred, gul streg
langs punkterne (tangenten i B1.1). Udvidelsen ligger kun
her, fordi en anden session rettede i C-mapperne samtidig. Skal flere kapitler bruge
den, kan den flyttes ind i den fælles `motor.js` (og selvtesten, som allerede kan læse
feltets ydre kasse `r`).

`_selvtest.html` åbnes direkte fra disken; ALT OK (660) 1. nov. 2026 efter rettelserne. Skærmbilleder af
hvert lag og den svære udgave ved 1500 × 950 og 1280 × 720 er set igennem; kortet med
ordene dækker ingen plads.

## Ikke lavet

- Kapitel B5 til B8 (B2, B3 og B4 er lavet 2. nov. 2026 som `sb2.9_byg_figuren`, `sb3.6_byg_figuren` og `sb4.10_byg_figuren`). Panelet `samling_b_bygfiguren.html` er klar til flere knapper
  (`data-emne="b2.byg"` osv.), og `FEEDBACK_EMNER` i `samling_alt_b.html` skal have en
  linje mere pr. kapitel.

## Papirkortet (3. nov. 2026)

Kortet er det lyse papirkort (se Fælles krav i `../README.md`): `../faelles/papirkort.css`
er indlæst i `index.html` og selvtesten, og `<body class="papirkort">`. Kun
udseendet er ændret; motoren er den samme som i `sc1.5_byg_figuren`, som var prøven.
