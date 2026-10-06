# Fra land til by 1940-1989

Historie, forløbet om velfærdsstaten. Hører til kapitel 8-alternativ, del 1
(Vækst og politik), afsnittet Fra land til by og figur 8.1, som er skrevet efter
Peter Schroeder: Det 20. århundredes Danmarkshistorie (2007), s. 109-111.
Animationen dækker fokusspørgsmål 1.

Adresse: `kemiformler.dk/animationer/Historie/velfaerd_fra_land_til_by/`.
`index.html#opgaver` springer starten og sorteringen over. `index.html#fri` er
uden opgaver og er til at vise på tavlen.

**I menuen:** nr. 1 i undersamlingen 2.3b Velfærdsstaten (`data-emne` 2.3b.1,
`samling_2.3b_velfaerdsstaten.html`). Samlingen er lavet 6. okt. 2026 af sessionen
bag Finansministeren efter brugerens besked dér. Den linker til `index.html` uden anker.

## Bestillingen

1. **Pointen i én sætning.** Fra 1940 til 1989 flytter befolkningen fra den
   primære sektor til den sekundære og derefter til den tertiære: landbruget
   skrumper hele vejen, og servicefagene ender med to tredjedele.
2. **Hvad den afløser.** Ingenting. Den er bygget fra bunden.
3. **Naboerne.** `velfaerd_finansminister/` ejer den økonomiske politik 1956-1963.
   De to andre forslag til kapitlet er ikke bygget: Hverdagen 1958-1982
   (tabel 8.2 og 8.3) og Kommunekassen (Tølløse-budgettet).
4. **Loftet.** 8 erhverv, 100 personer, 6 år med tal, 5 opgaver. Ingen faner.
5. **Layoutet.** Scenen fylder hele bredden og er én figur: en række pr. erhverv
   med personerne stående i rækken, samlet i tre sektorbånd. Under figuren står
   årsskyderen og statuslinjen. Der er intet fast panel.

Brugerens krav var, at animationen ikke kun må vise det, eleven i forvejen kan
læse af figuren. Det nye er derfor: erhvervene er lagt sammen til sektorer
(summen i hvert bånd står ikke i bogen), rækkerne kan sammenlignes direkte, og
opgaverne spørger efter år, der ligger mellem figurens tal.

## Roen (rettet 5. okt. 2026)

Første udgave viste alt på én gang: syv rækker, tre sektorer, en låst
årsskyder, en akse med gitter, en opgaveliste og en kurve. Brugeren: "lidt for
overvældende", en svag elev skal nemmere kunne overskue den. Derfor:

* **Ét trin ad gangen.** Starten viser kun rækkerne, to korte linjer og knappen
  Videre. Sektorerne kommer frem med opgave 1 og årsskyderen med opgave 2.
* **Pladsen er sat af.** Det, der kommer frem senere, har sin plads fra start,
  så figuren ikke flytter sig, når det toner frem. Den flytter sig kun én gang:
  når det sidste erhverv er sorteret.
* **Intet fast panel.** Opgavelisten er blevet til fem prikker i opgavelinjen.
  Kurven over sektorerne er et tilvalg bag knappen Kurve i toplinjen, og
  knappen kommer først frem, når erhvervene er sorteret.
* **Mindre på figuren.** Aksen, gitteret og noten under årstallet er væk.
  Uoplyst står gråt nederst uden egen overskrift.
* **En pil viser, hvor man kan begynde.** Rækkefølgen er stadig fri.
* **Færre og kortere tekster**, og én opgave mindre: "Find et år, hvor den
  sekundære sektor er størst" er taget ud, fordi svaret hang på én person
  (34 mod 33). Modellen kan stadig bedømme den (`bedoem("top", år)`).

Det skal ikke rulles tilbage uden brugerens ord.

## Forløbet

0. **Start.** Rækkerne med de 100 personer i 1940 og knappen Videre.
1. **Sortér erhvervene.** De syv erhverv trækkes ned i den primære, sekundære
   eller tertiære sektor. Et klik på erhvervet og derefter på sektoren virker
   også, og det gør tasterne 1, 2 og 3. Uoplyst kan ikke sorteres. Et forkert
   svar får en forklaring, der passer til erhvervet og sektoren.
2. **Gæt: landbruget i 1989.** Eleven gætter først (25, 15 eller 5) og trækker så
   skyderen til 1989. Skyderen er låst, til der er gættet.
3. **Industrien overhaler landbruget.** Find det første år (modellen siger 1955).
4. **Halvdelen i den tertiære sektor.** Find det første år (1969).
5. **Forklar faldet i landbruget.** Tre svar: det rigtige og to fejl, elever laver
   (mindre produktion, EF).

Knappen i statuslinjen er en trappe: Giv hint, Vis svaret og, når opgaven er
løst, Næste opgave. Forklaringen står alene, til eleven selv trykker videre.
Der er ingen lærer i scenen.

Sektorernes sum er skjult, til erhvervene er sorteret, og kurven tegnes kun for
de år, skyderen har været forbi. Så røber de ikke svarene.

## Filerne

| Fil | Indhold |
|-----|---------|
| `index.html` | Siden, fagordene og rundvisningens ramme |
| `css/stil.css` | Udseendet, og hvad der er fremme i hvert trin (`body[data-fase]`) |
| `js/data.js` | Figurens tal, erhvervene, opgaverne og alle tekster |
| `js/model.js` | De 100 personer år for år og svarene på opgaverne |
| `js/figur.js` | Rækkerne, båndene, personerne og træk med musen |
| `js/kurve.js` | Sektorkurven (tilvalget) |
| `js/forloeb.js` | Trinene, statuslinjen og den ene knap |
| `js/rundvisning.js` | Rundvisningen bag `?`. Viser kun det, der er fremme |
| `js/app.js` | Klik, taster og opstart |
| `js/kerne.js` | Små hjælpefunktioner |
| `_selvtest.html` | Udviklerværktøj, kræver en lokal server |

## Det, man kan rette

Alt, eleven læser, står i `js/data.js`: erhvervenes navne, hvad de dækker,
teksten ved rigtigt og forkert svar, de to hint, opgavernes tekster og
forklaringer og de to linjer i starten (`TEKST.intro`). En opgavetekst må højst
være 80 tegn, en starttekst 90 og et svar på en knap 26 (selvtesten tjekker det).

Tallene står som `tal: [...]` på hvert erhverv, i samme rækkefølge som `AAR`.
Rettes de, regner modellen selv personerne, flytningerne og svarene på
opgaverne om. Hintene nævner årstal (fx "mellem 1950 og 1960"), så de skal
læses igennem, hvis tallene ændres. Selvtesten siger til, hvis svarene ryger
uden for de intervaller, hintene nævner.

## Forenklingerne

* **Tallene er aflæst af figuren.** De er taget fra den genskabte figur i
  elevteksten (`billeder/schroeder/s110-figur-8-1.svg`), så animationen og
  teksten viser det samme. Bogens figur har ingen tal på linjerne, og dens akse
  passer ikke helt nederst (afstanden fra 0 til 5 er kortere end de andre trin).
  Tallene er derfor usikre med ca. 1 procentpoint.
* **Skaleret til 100.** De aflæste tal giver 97-98 i alt. De er skaleret op til
  100 og afrundet til hele personer, så summen altid er 100. Et erhverv afviger
  højst 1 person fra figuren.
* **Mellem to år med tal flytter personerne jævnt.** Figuren har kun tal for
  1940, 1950, 1960, 1970, 1981 og 1989 og tegner rette linjer imellem. Modellen
  flytter én person ad gangen, jævnt fordelt over årene, så hvert erhverv og
  hver sektor kun går én vej mellem to år med tal. Årstallene i opgave 3 og 4 er
  altså modellens. De seks år står under årsskyderen, og Fagord forklarer det.
* **Personerne er ikke de samme mennesker.** Figuren viser befolkningens
  fordeling, ikke hvem der skiftede erhverv. Når en person går fra Landbrug til
  Administration, er det forskydningen i fordelingen, man ser. Det står under
  Fagord.
* **Flytninger inden for samme sektor parres først.** Når fx industrien afgiver
  en person, og byggeriet modtager en i samme tiår, går personen direkte. Det
  holder sektorernes sum i ro.
* **Uoplyst hører ikke til nogen sektor** og skal ikke sorteres.
* **Hvad erhvervene dækker**, er skrevet med "fx" og holder sig til eksempler,
  der er sikre: de gamle folketællingers grupper er ikke slået op.

## Selvtest

`_selvtest.html` siger ALT OK med godt 31.000 påstande: modellen (100 personer
i alle 50 år, højst 1 fra figurens tal, jævne flytninger, faste pladser,
svarene inden for de år, hintene nævner), teksterne (alle erhverv har
forklaring, to hint og fejltekster, ingen tankestreger, hintene røber ikke
sektoren), hele forløbet med mus, klik og tastatur, og roen: i starten er kun
rækkerne og knappen fremme, intet flytter sig, når sektorerne og årsskyderen
kommer frem, figuren står stille fra sorteringen er færdig til sidste opgave,
intet skal rulles ved 1366 x 768, 1280 x 620 og 1069 x 620 (heller ikke med
kurven slået til), ingen personer overlapper eller står uden for deres bane, og
ingen læsbar tekst er under 12,4 px.

## Linjen til menuen

Fra land til by 1940-1989: 100 personer viser, hvad befolkningen levede af.
Sortér erhvervene i sektorer, træk i årsskyderen, og find året, hvor industrien
overhaler landbruget.
