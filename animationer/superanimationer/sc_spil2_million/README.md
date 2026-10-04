# sc_spil2_million: Kemi-Millionær

En quiz i tv-studie: 15 spørgsmål om fagord fra Kemi C, en stige med beløb, to
sikre trin og tre livliner. Hører til kategorien Spil
(`kemi-c-filer/samling_c_spil.html`, plads nr. 2).

## Bestillingen

Brugeren 3. oktober 2026: "Lav en udgave som superanimation. Gør det lidt
lækkere", og et spørgsmål om musikken fra tv-programmet.

1. **Pointen i én sætning.** Eleven finder fagordet til en beskrivelse, 15 gange
   i træk, og hvert rigtigt svar er et trin op ad stigen.
2. **Hvad den afløser.** `kemi-c-filer/c_spil2_million.html` (nu i `arkiv/`). Alt derfra er med:
   de 70 spørgsmål fra Fagordsquiz for Kemi C, de 15 beløb, de sikre beløb ved
   spørgsmål 5 og 10, sværhedsgraden efter kapitel, de tre livliner, Lås svaret,
   Stop med et ekstra spørgsmål, sejrsskærmen med titlen Superkemiker og den
   skæve ros, og dansk og engelsk.
3. **Naboerne.** Jeopardy og Lykkehjulet er holdspil til tavlen, Pacman har
   quizzen på tid. Her spiller eleven alene og i sit eget tempo.
4. **Loftet.** Én skærm uden faner: titel, bræt og slutkort. 15 spørgsmål pr.
   spil, 3 livliner, 11 lyde.
5. **Layoutet.** Toplinje, scenen som tv-studie med spørgsmålet og de fire svar
   nederst, og stigen som panel til højre.

## Det nye

* **Studiet.** Lyskegler, der svajer, et gulv og ruder med spidse ender. Lyset
  går ned, når svaret er låst, og bliver grønt eller rødt ved udfaldet.
* **Forløbet.** Beskrivelsen står alene et øjeblik, svarene kommer frem ét ad
  gangen (et klik viser dem alle), det låste svar pulserer orange, og ventetiden
  bliver længere for hvert trin (1,5, 2,3 og 3,2 sekunder).
* **Forklaring til et forkert svar.** Er det forkerte svar selv et fagord i
  spillet, står der i statuslinjen, hvad det passer til: "Ædelmetal passer til:
  Metaller yderst til højre i spændingsrækken …". Det koster ingen ekstra data;
  spillet slår ordet op blandt de andre spørgsmål.
* **Stigen** viser, hvad der spilles om, hvad der er vundet, og hvad eleven går
  hjem med. Feltet Sikret er beløbet ved et forkert svar.
* **Nye spørgsmål hver gang.** Spillet husker i browseren, hvilke spørgsmål
  eleven har set, og tager dem, eleven ikke har set, først.
* **Rekorden** (den største gevinst) huskes i browseren.
* **Lyd** og musik, se nedenfor.
* **Uden Kemichael.** Hjælpen står i statuslinjen under scenen, og den ene store
  knap skifter fra Lås svaret til Næste spørgsmål.

## Livlinerne (4. okt. 2026)

Brugeren bad om Spørg publikum i stedet for Én væk. Livlinerne er nu To væk
(50:50), Spørg publikum og Nyt spørgsmål. Publikums stemmer står som en lille
søjle med procent i hvert svar. Hvor godt publikum rammer, står i `D.PUBLIKUM` i
`js/data.js` (brugerens tal): i 60 % af tilfældene får det rigtige svar 50 til
90 %, i 10 % får det 40 til 50 %, i 25 % får det 20 til 40 %, og i 5 % får det
under 20 %. Resten deles tilfældigt mellem de forkerte svar, der står tilbage.
Brugerens fire tal gav 95 %; de sidste 5 % er lagt til den øverste linje. Hvor
der længere nede står Én væk, gælder Spørg publikum.

## Spørgsmålene

De står i `js/data.js`, ét pr. linje:

```
sp("c1_1", 1, "Kernepartikel med positiv ladning", "Nuclear particle with positive charge",
    ["Proton", "Neutron", "Elektron", "Isotop"], ["Proton", "Neutron", "Electron", "Isotope"]),
```

Id, kapitel, beskrivelsen på dansk og engelsk og de fire svar på hvert sprog.
**Det første svar er det rigtige**, og svarene blandes, når spørgsmålet stilles.
Skærmen viser selv "Hvilket fagord passer?" over beskrivelsen.

Sværhedsgraden følger kapitlerne (`D.TRIN`): spørgsmål 1 til 5 kommer fra
kapitel 1 til 3, spørgsmål 6 til 10 fra kapitel 4, 5 og 7 og spørgsmål 11 til 15
fra kapitel 5, 7 og 8. Der er ingen spørgsmål fra kapitel 6; fagordsquizzen
havde ingen.

Rettet i forhold til den gamle:

* Tungtopløselig er under 1 g i 100 mL vand, som i `sc2.1` og `sc2.4`. Den gamle
  sagde 2 g.
* "Idealgasloven" hedder Idealgasligningen som i `sc4.6`, "Prikformel" hedder
  Elektronprikformel som i `sc3.1`, og H₂ hedder hydrogen (før brint).
* Forkerte svar: Formel koncentration i stedet for Stofmængdekoncentration ved
  Aktuel koncentration (den fejl, elever laver), Svovl, Kobber(II)sulfat,
  Carbondioxid og Hydronolyse i stedet for Sulfur, Kobbersulfat, Kuldioxid og
  Protolyse.
* "Hvad betyder tilstandsformen (l)?" er skrevet om til en beskrivelse som de
  andre. Tankestreger i beskrivelserne er blevet til kommaer.

Ikke rettet, men bør ses af læreren: tungmetal er "over 7 g/mL" (mange bøger
siger 5), og forholdet mellem to koefficienter hedder "Antalsforhold".

## Lyd og musik

Musikken fra tv-programmet er beskyttet af ophavsret og er ikke med. Alle lyde
er lavet i koden (`js/lyd.js`, `SYNTESE`): et svar kommer frem, et svar vælges,
starten, låsen, ventetiden med hjerteslag, rigtigt, forkert, livline, sikkert
beløb, stop og fanfaren ved millionen.

Under et spørgsmål spiller en baggrund:

* **Uden filer:** spillets egen baggrund, en dyb tone og et hjerteslag. Tonen
  stiger en halv tone for hvert spørgsmål, og hjerteslaget bliver hurtigere for
  hvert trin.
* **Med filer:** ligger `musik1.mp3`, `musik2.mp3` eller `musik3.mp3` i denne
  mappe, spilles filen i stedet: `musik1` til spørgsmål 1 til 5, `musik2` til 6
  til 10 og `musik3` til 11 til 15. Mangler en fil, bruges den nærmeste med
  lavere nummer.

**4. okt. 2026:** brugeren har lavet to numre i Suno. `musik1.mp3` dækker
spørgsmål 1 til 10 (der er ingen `musik2.mp3`), og `musik3.mp3` tager over ved
spørgsmål 11. Begge er klippet til løkker: `musik1` er 40 takter (96,0 s, 100,0
slag i minuttet, uden nummerets første 8 takter og afslutningen), `musik3` er 56
takter (134,8 s, 99,7 slag i minuttet, uden afslutningen). Den sidste takt i hver
fil er en overgang, hvor den følgende takt toner ud og filens første toner ind,
så filen kan gentages uden klik. Begge er sat til samme styrke (−18 dB).
Originalerne og scriptet `lav_loekke.py` ligger i
`C:\NK_Undervisning\Million-musik\`. Et nyt nummer skal klippes på samme måde,
ellers høres afslutningen, hver gang filen gentages.

Fra en server hentes filen som en lydbuffer og gentages uden pause. Åbnes spillet
fra harddisken, bruges `<audio loop>`, som laver et lille hak ved gentagelsen.
Musikken dæmpes, mens svaret er låst, holder pause, når svaret vises, og
fortsætter, hvor den slap, ved næste spørgsmål. Styrken er `D.MUSIK.styrke`
(0,4, sat efter tal, ikke efter øret). Knappen med højttaleren og `M` slår al
lyd til og fra, og valget huskes.

## Filer

| Fil | Indhold |
|-----|---------|
| `index.html` | toplinje, scenen (titel, bræt, slutkort), stigen, reglerne og rundvisningen |
| `css/stil.css` | alt udseende |
| `js/kerne.js` | fælles hjælpere og `NK.Tempo` |
| `js/data.js` | **spørgsmålene**, beløbene, trinene, ventetiderne, musikken og alle tekster på dansk og engelsk |
| `js/spil.js` | reglerne uden tegning: beløb, sikre trin, livliner, stop |
| `js/lyd.js` | lydene, spillets egen baggrund og musik fra filer |
| `js/visning.js` | stigen, ruderne, livlinerne, slutkortet, lyset og konfettien |
| `js/rundvisning.js` | rundvisningen bag ? |
| `js/app.js` | forløbet, knapperne og tastaturet |
| `sprites/emblem.svg` | spillets eget emblem: en kolbe med guld i en benzenring |
| `_selvtest.html` | udviklerværktøj, se nedenfor |

Mappen henter ingen filer uden for sig selv og bruger hverken `fetch` eller
moduler, så den virker, når `index.html` åbnes direkte fra harddisken.

## Rettelser

* Nye spørgsmål skrives i `js/data.js` med det rigtige svar først. Et svar må
  højst være 28 tegn og en beskrivelse 135. Kør `_selvtest.html` bagefter.
* Beløb og sikre trin: `D.BELOEB` og `D.SIKRE`. Ventetider: `D.TEMPO`.
* Titlen på sejrsskærmen er `D.TITEL` ("Superkemiker"). Escaperoommets segl 1
  (`kemi-c-filer/c_spil8_escaperoom.html`) spørger efter den, så den må ikke
  ændres. Selvtesten kontrollerer den på begge sprog.
* Alle tekster står i `D.TEKST` på dansk og engelsk med de samme nøgler.

## Forenklinger, valgt med vilje

* Alle spørgsmål har samme form: en beskrivelse og fire fagord. Der er ingen
  regneopgaver; dem har escaperoommet.
* Livlinerne er den gamles tre og ikke tv-programmets (ingen ven og intet
  publikum). To væk og Én væk spærres, når der kun er ét forkert svar tilbage;
  ellers ville de afsløre svaret.
* Pengene er kun point. Der er ingen tid på spørgsmålene.
* Den engelske udgave bruger også kr.

## Genveje og link

`A` `B` `C` `D` eller `1` til `4` vælger, `Enter` låser og går videre, `5` `6`
`7` er livlinerne, `S` stopper, `M` lyd, `H` rundvisning, `Esc` lukker.
`index.html#en` åbner spillet på engelsk; ellers huskes det sidst valgte sprog.

## Selvtest

`_selvtest.html` åbner `index.html` i en iframe og kontrollerer de 70
spørgsmål, reglerne (beløb, sikre trin, livliner, stop), et helt spil med musen
og et med tastaturet, sejrsskærmens titel, sprogskiftet, at alle lyde kan
regnes ud uden at klippe, og sprog og skriftstørrelser. Den sætter `NK.Tempo`
til 0, så ventetiderne forsvinder, og lægger elevens rekord tilbage bagefter.
Slutlinjen er "ALT OK" eller "N FEJL". Den skal køres over en lille server med
`animationer/` som rod.

## Menuen

I menuen fra 4. oktober 2026: knap nr. 2 i `kemi-c-filer/samling_c_spil.html`
(`data-emne="spil.million"`, uændret, så gamle links til menuen holder). Den gamle
ligger i `kemi-c-filer/arkiv/c_spil_million_oldversion.html`. `FEEDBACK_EMNER` i
`samling_alt.html` havde allerede Kemi-Millionær som nr. 2.
