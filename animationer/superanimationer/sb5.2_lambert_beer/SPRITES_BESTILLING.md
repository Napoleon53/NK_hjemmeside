# Bestilling: billeder af apparaterne til Lambert-Beers lov

Til den, der laver billederne (et billedværktøj eller en tegner). Animationen
viser en lampe, en kuvette og en detektor på en optikbænk. Lyset, fotonerne,
væsken i kuvetten, tallene og al tekst tegnes af koden. Billederne skal kun
vise selve apparaterne.

## Fælles for alle billeder

* **Set lige fra siden**, uden perspektiv. Lyset går vandret fra venstre mod
  højre.
* **Stil:** fotorealistisk, men roligt: lys og neutral belysning, ingen
  genskin eller glimt, ingen skarpe skygger. Neutrale farver (grå metal, hvidt
  eller lysegråt kabinet). Animationens baggrund er mørk (#1d1f27), så
  apparaterne skal kunne ses på mørk baggrund.
* **Ingen tekst, tal, logoer eller mærker** på apparaterne.
* **Gennemsigtig baggrund**, PNG med alfakanal. Ingen skygge under
  apparatet (koden tegner en blød skygge).
* **Mål:** 2x opløsning af det, animationen viser på en stor skærm (se
  tabellen). Billedet må gerne være større, bare forholdet mellem bredde og
  højde holdes.
* Filnavnene står i tabellen. Læg filerne i mappen
  `sb5.2_lambert_beer/billeder/`.

## Billederne

| Fil | Hvad | Mål (px, b × h) | Strålen |
|-----|------|-----------------|---------|
| `lampe.png` | Et lampehus til et spektrofotometer med en linse eller en åbning, der vender mod højre. Linsen er neutral (koden giver den lysets farve). | 240 × 330 | går ud af højre kant i 50 % af billedets højde |
| `detektor.png` | En detektor med en smal indgangsspalte, der vender mod venstre. | 270 × 340 | går ind i venstre kant i 50 % af billedets højde |
| `display_ramme.png` | En ramme til et lille LCD-display under detektoren. Selve displayfeltet er gennemsigtigt eller sort, så koden kan skrive tallene. | 270 × 130 | |
| `kuvette_venstre.png`, `kuvette_midte.png`, `kuvette_hoejre.png` | En tom glaskuvette i tre dele, så koden kan gøre den 0,5 til 3 cm bred: venstre glasvæg med kant, et smalt stykke af midten (forside, bund og kant foroven), som koden gentager, og højre glasvæg. Glasset er klart på forsiden (lyset går igennem), med matte sider og en tyk bund. **Det indre skal være gennemsigtigt**, så koden kan tegne væsken med menisk bag glasset. | 20 × 520, 16 × 520, 20 × 520 | går igennem i 58 % af højden; væskens overflade ligger i ca. 12 % af højden, bunden i ca. 96 % |
| `spektrofotometer.png` | Et bordspektrofotometer (Standardkurven) set fra siden, med en åben brønd til en kuvette i midten og et tomt displayfelt forneden. Brønden og displayfeltet skal være gennemsigtige. | 900 × 760 | vandret i 42 % af højden; kuvetten står i midten |

Har du kun tid til nogle af dem, så begynd med `lampe.png`, `detektor.png` og
de tre kuvettedele.
