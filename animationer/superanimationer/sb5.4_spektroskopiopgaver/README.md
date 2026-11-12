# sb5.4 Spektroskopiopgaver

Superanimation til afsnit B5.3 Standardkurven i Kemibogen B. Bygget 12. nov.
2026 efter brugerens ønske om B5 knap 4: "figurene i animationen er under
niveau fra andre. Kan du ikke bruge tid på at lave et bedre finish, så figurene
generelt er mere behagelige at kigge på, og har et mere professionelt look. Du
må også gerne shine resten af animationen op, så den følger standarden."
Bestillingen nedenfor er skrevet uden at spørge (som sb2.1 og sb5.2).

**Ikke i menuen endnu.** Den afløser `kemi-b-filer/b9_5.spektroskopi_opgaver.html`
(B5 knap 4, koden `b9.5`), når brugeren siger til. Se "Til menuen" nederst.

## Bestillingen

1. **Pointen:** Standardkurven fra regnearket giver hældningen a = ε · l, og
   med kurvens ligning finder du prøvens koncentration og regner videre til
   det, opgaven spørger om.
2. **Afløser** den gamle b9.5 (seks eksamensagtige opgaver, en side med
   tabeller og felter uden figurer). Med fra den gamle: de seks opgaver og
   deres tabeller, Kopiér tabel til regnearket, punktum eller komma som
   decimaltegn, ε med en enhed, der skal vælges (fælden uden cm⁻¹),
   delopgaverne i rækkefølge, prilocains lineære område, fortyndingen
   (bouillon), massen pr. liter (paracetamol) og massen af kobber (messing).
   Nyt: figurer i bogens stil (standardkurven, prøven fra genstand til kuvette,
   spektrofotometeret), papirkortet, hint i to trin, regnestykkerne som
   superberegninger på tavlen, de typiske fejl med hver sin forklaring og et
   trin om en prøve med for høj absorbans.
3. **Naboerne:** `sb5.1_absorptionsspektre` ejer farve og spektre.
   `sb5.2_lambert_beer` ejer lyset i kuvetten, at lægge linjen selv og
   regnestykkerne med formlens form. `sb5.3_spektrofotometri` ejer målingen
   (blindprøve, standarder, mål prøven) og reagenserne. Her er målingerne
   givet som i en eksamensopgave, og eleven arbejder i regnearket.
4. **Loftet:** tre faner og seks opgaver (som den gamle). Fane 1: to opgaver
   med to trin. Fane 2: tre opgaver med tre trin. Fane 3: én opgave med fire
   trin. På tavlen: én genstand, én målekolbe, spektrofotometeret, kurven
   og én ramme pr. trin.
5. **Layoutet:** scene plus panel som sb6.1 fane 3: papirkortet øverst over
   en tavle med prøven til venstre, standardkurven til højre og rammerne
   under kurven. Panelet har standardrækken med Kopiér og opgaverne.

## Fanerne

* **1 Standardkurven:** permanganat (528 nm, mM) og jern i en tablet som
  [Fe(phen)₃]²⁺ (510 nm, µM). Trin: ε og c.
* **2 Indholdet:** paracetamol i en pille (243 nm, UV; ε, c og massen i
  1,00 L), glutamat i bouillon (340 nm, UV, målt som NADH; ε, c og c_før
  efter fortyndingen 2,00 mL til 200,0 mL) og kobber i en messingskrue
  (600 nm som [Cu(NH₃)₄]²⁺; ε, c og massen i 250,0 mL).
* **3 Det lineære område:** prilocain i en blodprøve (235 nm, UV, otte
  punkter). Trin: området (svar på kortet; det valgte område bliver blåt på
  kurven), ε af de fem punkter i området, c og en ny prøve med A = 1,520
  (fortynd og mål igen).

Tavlen viser kun det, der er fundet (svar først, når de er aktuelle):
punkterne fra start, regnearkets linje og ligning efter ε, prøvens stiplede
linje, når c skal findes, og pilen ned til c, når c er fundet. Kuvetten glider
ned i spektrofotometeret, når kortet spørger om koncentrationen, og
displayet tæller op til absorbansen; lyset efter kuvetten er svagere efter
T = 10^(−A). Et forkert ε tegnes som en rød, stiplet linje gennem (0, 0), og
et forkert c som en rød ring på prøvens linje. Det, kortet spørger om, har en
gul, stiplet ring (displayet, fortyndingen, målekolben eller kurven).

Papirkortet fra start, ingen Kemichael, hintknappen på kortet (to hint og så
svaret), Begynd forfra i panelet. Et rigtigt tal bliver stående grønt på
kortet med forklaringen og knappen Næste. ★ ved en opgave løst uden fejl og
uden at se svaret. Efter den sidste opgave i fane 1 og 2 fører knappen til
næste fane.

## Filerne

| Fil | Indhold |
|:--|:--|
| `index.html` | siden, de tre faner, teorien og rundvisningen |
| `css/stil.css` | kopieret fra sb6.1; nyt nederst under SB5.4 (vælgeren på kortet, tabellen, kontakten) |
| `js/kerne.js`, `js/formel.js`, `js/fane.js` | som sb6.1 (hjælpere, regnestykker med brøkstreg, scenekortet) |
| `js/data.js` | opgaverne, trinnene, teksterne, de typiske fejl, regressionen og tallene |
| `js/tegning.js` | tavlen, glasset med væske, spektrofotometeret og standardkurven i bogens stil |
| `js/sim.js` | én motor for alle tre faner (en klasse pr. fane, så fane.js kender forstavelsen) |
| `js/rundvisning.js`, `js/app.js` | rundvisningen og fanerne |
| `sprites/` | målekolben, kuvetten, prøveglasset, tabletten, pillen, bouillonterningen, skruen og blodprøven som SVG; `_sprites.html` viser dem alene og med væske |
| `_selvtest.html` | selvtesten (kræver en server med `animationer/` som rod) |

## Tallene og forenklingerne

* Tabellerne er den gamle b9.5's med to undtagelser. Kobberkomplekset havde
  ε ≈ 1,24 · 10³ M⁻¹ · cm⁻¹, men [Cu(NH₃)₄]²⁺ har ca. 50 M⁻¹ · cm⁻¹; den nye
  tabel (3,0 til 15,0 mM) giver 50,9, og skruen indeholder 186 mg kobber.
  Bouillonen er lavet om til bogens "Stoffer uden farve": et enzym danner ét
  NADH pr. glutamat, og NADH har ε = 6,22 · 10³ M⁻¹ · cm⁻¹ ved 340 nm (den
  gamle gav 5,79 · 10³ for "glutaminsyre-forbindelsen").
* Hældning og skæring regnes med mindste kvadraters metode som regnearkets
  lineære tendenslinje (ikke tvunget gennem 0). Permanganat giver bogens
  2,45 · 10³ M⁻¹ · cm⁻¹ og jern sb5.2's 1,11 · 10⁴.
* Bogens formel c = (A − b) / a står på tavlen; c = A / a godtages også, fordi
  b er lille (forskellen er under 0,7 %). ε godtages inden for 3 %, de andre
  tal inden for 2,5 %, og enhver enhed i vælgeren, der giver det rigtige tal.
* Lysvejen er 1,00 cm i alle opgaver, så ε og a har samme tal i tabellens
  enhed (bogens tabel i B5.3).
* Prøven med A = 1,520 i fane 3 er ny (bogen: "Er prøvens absorbans for høj,
  fortyndes prøven").
* Farverne i glassene er tegnede bud (lilla permanganat, orangerødt
  jernkompleks, blåt kobberkompleks), ikke regnet af spektre som i sb5.1.

## Selvtesten

`_selvtest.html` (ALT OK, 75 påstande): at regnearkets linje giver opgavernes
tal og bogens ε, at tabellerne er lineære og prøven ligger mellem standarderne,
at prilocains A / c falder fra 325 µM, at elevens tal tolkes (også 11100 og
potenser), at startbilledet står stille, at kopien har tabulator og det valgte
decimaltegn, at intet løses uden Indsend svar, alle tre faner med de typiske
fejl (enheden, cm⁻¹, c / A, ganget, fortyndet den forkerte vej, mM ikke regnet
om, massen i 1 L), stjernen, hjælpen, sproget og at kortet, kurven og
rammerne kan være der fra 1100 × 620 til 1600 × 950.

## Til menuen

Når brugeren siger til:

1. I `kemi-b-filer/samling_b9.html` skiftes knap 4's `onclick` til
   `visAnimation(this, '../superanimationer/sb5.4_spektroskopiopgaver/index.html')`.
   `data-emne="b9.5"` bliver, så gamle links virker. Beskrivelsen kan blive:
   "Løs seks eksamensagtige opgaver: find ε fra standardkurvens hældning i et
   regneark, og regn videre til koncentration, fortynding og indhold."
2. `index.html` får linjen øverst i `<head>`:
   `<script src="../../til_panelet.js" data-panel="samling_alt_b.html" data-emne="b9.5"></script>`
3. Den gamle `kemi-b-filer/b9_5.spektroskopi_opgaver.html` flyttes med `git mv`
   til `kemi-c-filer/arkiv/b9_5.spektroskopi_opgaver_oldversion.html`, når intet
   andet linker til den.
4. Kolonnen "I menuen" i superanimationernes README rettes.
