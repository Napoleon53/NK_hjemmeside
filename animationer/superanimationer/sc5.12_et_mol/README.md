# sc5.12 Hvor meget er et mol?

Ny superanimation, 23. okt. 2026, bygget fra bunden til afsnit 5.3 Stofmængde i
Kemibogen C (underafsnittene "Et mol" og "Hvor mange er det?"). Brugerens
bestilling: en fjollet superanimation, der viser, at et mol er "en ordentlig
røvfuld", og at mol kan bruges som et antal; eleven gætter fx, hvor høj en stak
af 1 mol papir bliver, og får fire svarmuligheder, hvor det rigtige svar ikke
nødvendigvis er det største tal.

I menuen fra 23. okt. 2026 som nr. 3 i C5 (`samling_c5.html`, koden `c5.mol`), lige efter
Stofmængde; knapperne efter den rykkede et nummer, men beholdt deres koder. Mappen hedder
stadig 5.12 (det næste ledige nummer). Kemibogen 5.3 linker til den i en "Prøv selv"-linje.

## Bestillingen, før der blev skrevet kode

1. **Pointen:** et mol er et antal ligesom et dusin, bare 6,02 · 10²³ stk.: af
   ting fra hverdagen er det ufatteligt meget, men af atomer og molekyler kan
   det ligge i en hånd.
2. **Afløser:** intet. Bygget fra bunden.
3. **Naboerne:** `sc5.1` ejer molarmassen, `sc5.2` masse og stofmængde med
   klumper på 1 mol, `sc5.3` formlen n = m / M. Her er ingen masseberegninger;
   massen nævnes kun i to forklaringer og hint (12 g carbon, 18 g vand).
4. **Loftet:** to faner. Otte gæt på fane 1 og seks opgaver på fane 2. Tre
   stiger (længde, rumfang, tid) med 10 til 21 kendte ting hver.
5. **Layoutet:** scene plus smalt panel som `sc7.5` og `sb2.4`. Al tekst står
   på kortet øverst i scenen; panelet har kun "Et antal", formlen (fane 2) og
   listen.

## Fanerne

**1 Gæt et mol.** En kort introduktion (en bakke med et dusin æg mod en sæk med
1 mol) og otte gæt med fire svar hver: papirstakken, vingummibamserne, tæl til
1 mol, sandet, vanddråberne, atomer på række, fodboldene og muldvarpene. Kun
ting, man kan forholde sig til: brugeren syntes 23. okt. 2026, at diamanten,
vandmolekylerne og luften var kedelige og umulige at gætte på, så de blev
skiftet ud med vingummibamserne og sandet. Efter gættet vokser en søjle op ad en tierpotens-stige fra ét
stk. til 1 mol, og de kendte ting lyser op, når søjlen kommer forbi. Turen er
altid 23,8 tierpotenser lang. Bagefter zoomer stigen ud, så alle fire svar og
1 mol ses på én gang; et klik på stigen zoomer ind og ud, og stigen kan
trækkes. Kortet bliver grønt ved et rigtigt gæt og blåt ved et forkert, og det
forkerte gæt får at vide, hvor mange gange for stort eller lille det var (i
tierpotenser). Til sidst antal rigtige og en fjollet titel (Mol-lærling til
Avogadros arving). Svarene står fra mindst til størst; det rigtige svar står
på plads B, C og D, og kun to af otte er det største. Gættet er gratis; den
gule knap giver ét hint med tal, man kan lave et overslag med.

**2 Tæl i mol.** Seks opgaver: 3 dusin æg, 3 mol æg, fra antal til mol (2,00 og
0,500 mol), H-atomer i 1 mol H₂O og mol mennesker. Lærredet viser bakker og
sække med plads til 1 mol, der fyldes, når svaret er rigtigt. De forkerte svar
er typiske fejl (divideret i stedet for ganget, potensen ganget, kun tallet
foran potensen). Hint i et eller to trin, så Vis svaret.

Påskeæg: tre klik på linjen "1 mol" i panelet fortæller om moldagen (23/10 kl.
6.02 til 18.02). Den 23. oktober står den der af sig selv.

## Filerne

| Fil | Indhold |
|-----|---------|
| `index.html` | toplinje, de to faner, teorien og rundvisningen |
| `css/stil.css` | grundlaget fra `sb2.4` (som tog det fra `sc7.5`), scenekortet og panelet |
| `js/kerne.js` | fælles hjælpere (kopi fra `sb2.4`) |
| `js/data.js` | alle tal og tekster: stigerne, gættene, opgaverne |
| `js/ikoner.js` | de små tegninger på stigen og i fane 2 (canvas, lys og skygge), også æggebakken |
| `js/stige.js` | tierpotens-stigen: baggrund, trin, kendte ting, søjlen, flagene |
| `js/kort.js` | scenekortet (spørgsmål, svar, hint, forklaring, knap videre) |
| `js/sim_gaet.js` | fane 1 |
| `js/sim_tael.js` | fane 2 |
| `js/rundvisning.js` | rundvisningen bag ? (koden fra `sb2.4`, nye tekster) |
| `js/app.js` | faner, tastatur, teori, påskeægget |
| `_selvtest.html` | selvtesten (161 påstande, ALT OK 23. okt. 2026) |
| `_skaerm.html` | hjælpeside til skærmbilleder |

Ret tal og tekster i `js/data.js`, og kør `_selvtest.html` bagefter (gennem en
lokal server med roden i `animationer/`). Den tjekker blandt andet, at det
rigtige svar ligger nærmest 1 mol på stigen, og at de forkerte svar ligger
mindst en tierpotens væk.

## Tallene og forenklingerne

Overslag, valgt med vilje og afrundet:

* 1 mol = 6,02 · 10²³ (som i bogen).
* Papir 0,1 mm pr. ark (80 g-papir); 1 lysår = 9,46 · 10¹⁵ m.
* Carbonatom 0,154 nm (bindingslængden mellem to C) på række.
* Vingummibamse 2 cm³ og 2,3 g; alle verdenshave 1,335 mia. km³.
* Sandkorn 0,1 mm³ (en kugle på 0,6 mm), uden luft mellem kornene; Danmark
  4,3 · 10¹⁰ m², Møllehøj 171 m.
* Et år = 3,156 · 10⁷ s; universet 13,8 mia. år.
* Dråbe 0,05 mL (20 dråber pr. mL). Middelhavet 3,75 mio. km³, Østersøen
  21 700 km³, verdenshavene 1,335 mia. km³, Esrum Sø ca. 0,23 km³.
* Fodbold med radius 11 cm (5,6 L), uden luft mellem boldene. Jorden 1,08 · 10²¹ m³,
  Månen 2,19 · 10¹⁹ m³.
* Klasselokale 200 m³, badebold 36 cm (24 L), zeppeliner 200 000 m³.
* Muldvarp 0,1 L (ca. 100 g), idéen fra Randall Munroes "A Mole of Moles".
* Afstande på længdestigen er målt fra Jorden (Pluto ca. 5,9 · 10¹² m).
* Tidsstigen viser varigheder; "Vikingetiden" og "Pyramiderne" står ved, hvor
  længe siden de var.
* Jordens befolkning 8,0 · 10⁹.

## Menuen

Lagt ind 23. okt. 2026 (brugerens ja):

* `animationer/kemi-c-filer/samling_c5.html`: knap nr. 3 med `data-emne="c5.mol"`.
* `FEEDBACK_EMNER` i `animationer/samling_alt.html`: nr. 3 "Hvor meget er et mol?", de andre et nummer op.
* Kemibogen: `kapitler/5-3-stofmaengde.qmd` har en "Prøv selv"-linje (kommer på kemibogen.dk, når bogen
  bygges og lægges ind næste gang).
