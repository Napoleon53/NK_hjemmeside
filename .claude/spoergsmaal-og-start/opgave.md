# Gennemgang af superanimationerne: indforståede spørgsmål og for meget på én gang

Du er én af ti hjælpere. Du gennemgår nogle få superanimationer (listen står i din besked) og skriver forslag. **Du retter ingen filer i `~/NK_hjemmeside`.** Du skriver kun din resultatfil (se nederst).

## Baggrund

Niels er kemilærer i gymnasiet og har bygget ca. 75 interaktive animationer (HTML/JS) til Kemi C og Kemi B. De ligger i `~/NK_hjemmeside/animationer/superanimationer/<mappe>/`. Mapper der starter med `sc` er C-niveau, `sb` er B-niveau. Eleverne er 16-18 år, og de svage elever klikker, før de læser.

Hver animation har faner. Øverst midt i scenen står et lyst **papirkort** med opgaven. Kortets tekst laves med `NK.Papir.tekst()` i `faelles/papirkort.js`: den sætning, der ender med `?`, bliver **halvfed**, og resten står i almindelig skrift i samme afsnit. Svarene er knapper under teksten, og eleven trykker Indsend svar.

Niels bad i dag om en gennemgang af alle animationer for to ting (hans ord):

> 1) Indforstået sprog. Opgavetekst som er skrevet på en måde, så man er nødt til at læse det med en ufed skrifttype inden man svarer på spørgsmålet. Er der steder hvor spørgsmålet kunne stilles mere direkte.
>
> 2) Er der elementer, hvor der sker for meget på en gang, når man træder ind i animationen, og kan det med fordel løses med stilladserende spørgsmål ala byg figuren, så brugeren får en mere glidende introduktion ind i animationen? (lidt ala vi gjorde i går med tryk/volumenændring-animationen)

### Forbilledet fra i går: sb2.6 Rumfang og fortynding

Læs `~/NK_hjemmeside/animationer/superanimationer/sb2.6_rumfang_og_fortynding/js/data.js` linje 80-190 (målet "pres" med `trin`). Se skærmbilledet `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/prove/sb2.6_rumfang_og_fortynding__0.png`.

Det Niels sagde i går, og som blev løsningen:
- Det halvfede spørgsmål må ikke være indforstået. "Hvilken vej forskydes ligevægten?" blev til "Hvilken vej forskydes ligevægten, når rumfanget i cylinderen halveres?". Spørgsmålet står på sin egen linje, og den korte indledning står i almindelig skrift over.
- En svag elev bliver forvirret, hvis alle dele (brøk, tallinje, panel med tal) er fremme med det samme. Første mål er nu stilladset i trin: Spørg først til reaktionsbrøken, så dukker brøken op i scenen. Spørg så til faktoren på koncentrationerne, så dukker faktoren op. Så tallinjen, så retningen, så forsøget, så forklaringen på farveskiftet. Det, der kommer senere, har sin plads sat af som en stiplet ramme med navnet ("reaktionsbrøken", "tallinjen med Y og K"), så intet hopper. Tallene i panelet blev foldet ind bag "Vis tallene".
- Inspirationen er "Byg figuren": figuren afsløres lag for lag, og hver del kommer frem, når eleven har svaret på den.

Et roligt eksempel, der er fint som det er: `.../scratchpad/prove/sc7.5_staerke_og_svage_syrer__0.png` (ét gæt, to glas, intet andet).

## Ting 1: Indforståede spørgsmål

Gå alle opgavekortets spørgsmål igennem i dine animationer (alle mål på alle faner, ikke kun det første). Teksterne ligger mest i `js/data.js`, men også i `fane.js`, `opgave.js`, `opgaver.js`, `kort.js`, `skort.js`, `scenekort.js`, `tekster.js`, `quiz.js` og lignende. Nogle tekster bygges af kode med tal sat ind; så skriv teksten, som eleven ser den.

Testen: **Dæk den almindelige skrift til. Kan eleven forstå og besvare det halvfede spørgsmål alene?**
- Står betingelsen kun i indledningen? (fx "når rumfanget halveres", hvilket glas, hvilket stof, før/efter, hvilken størrelse). Så skal den ind i spørgsmålet.
- Peger spørgsmålet tilbage med "det", "den", "dem", "her", "nu", "også", "stoffet", "glasset", "reaktionen", "ligevægten", "koncentrationen" uden at sige hvilken?
- Kan spørgsmålet stilles mere direkte? (omsvøb, "Hvad gælder for ...", "Hvad kan du sige om ...", hypotetisk form, dobbelt nægtelse, to spørgsmål i ét, spørgsmålet gemt midt i en lang sætning)
- Er svarknapperne samme slags ting som det, der spørges om? (spørges om en koncentration, skal svarene være koncentrationer, ikke stikord som "Syre, der har afgivet en hydron")
- Står der flere sætninger med `?` i samme tekst, eller kommer der en instruktion efter spørgsmålet? Notér det.

Indledningen må gerne blive stående i almindelig skrift. Det er fint, at den giver baggrund, når spørgsmålet også kan stå alene. Et spørgsmål, der allerede kan stå alene og er direkte, skal ikke med. Medtag kun steder, hvor du kan pege på det konkrete problem. Hellere 5 skarpe fund end 30 svage.

Kortets grænser: Hver animation har tegngrænser (står ofte i toppen af `js/data.js` og tælles i `_selvtest.html`), typisk spørgsmål højst 105 tegn og svar højst 34. Dit forslag skal overholde animationens grænser. Bliver det for langt, så flyt noget fra spørgsmålet til indledningen, eller skriv i "problem", at grænsen skal løftes.

Sproglige regler (Kemibogens):
- Kort, skarpt, letforståeligt. Ingen tankestreger, ingen indskudte sætninger, ingen påhængt ", og ...".
- Stort bogstav efter kolon, og undgå hellere kolon.
- C-animationer (sc): let, konkret sprog. B-animationer (sb): mere fagligt præcist.
- Molekylnavne: dioxygen, dihydrogen, dinitrogen, dichlor, dibrom, diiod. Ladning ±1 skrives + og −, aldrig 1+.
- Bogens ord: fordelingsdiagram (ikke bjerrumdiagram), selvionisering, omdannelsesgrad, hydronoverførsel, "har afgivet elektroner" (ikke "afgivne elektroner"). "fx", "ca." og "bl.a." må blive.
- Overskrifter og spørgsmål siger selv, hvad de handler om.

## Ting 2: For meget på én gang ved starten

Skærmbillederne (1400 x 860) af startskærmen på hver fane ligger i `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/skud/a/` og `.../skud/b/` som `<mappe>__<fanenr>.png` (0 er første fane). `_faner.tsv` i samme mappe giver fanernes navne. Se dem med Read-værktøjet. Hvis et billede mangler, er tomt eller viser en fejl, så vurdér ud fra koden og skriv det.

For hver fane med opgaver:
- Hvad er fremme fra start? Tæl slags ting (kort, figurer, grafer, tabeller, skydere, knapper i scenen, tal i panelet, formler). Toplinjen, Teori, ?, fanerne og opgavelisten i panelet tæller ikke; de er fast ramme.
- Hvad af det bruges i første opgave? Det, der ikke bruges, er støj for den svage elev.
- Er der for meget, så foreslå en konkret stilladsering af **første mål** som i sb2.6: en række trin. Hvert trin har en kort indledning (almindelig skrift), et halvfedt spørgsmål, der kan stå alene, 2-3 svar, hvor de forkerte er fejl, elever faktisk laver, og hvad der dukker op i scenen, når trinnet er løst. Brug de dele, animationen allerede har. Opfind ikke ny tung grafik. Det, der kommer senere, kan have sin plads sat af (stiplet ramme med navn) eller være skjult. Tal i panelet kan foldes ind.
- Vær ærlig: mange faner er fine. Et gæt med to glas og intet andet er fint. Et værktøj eller en fri udforskning uden opgaver er noget andet. Foreslå kun stilladsering, hvor gevinsten er tydelig, og sig "fint", hvor det er fint.

Prioritet: 1 = tydeligt for meget, stor gevinst for den svage elev. 2 = god idé. 3 = kan overvejes.

## Resultatfil

Skriv én JSON-fil: `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/fund/<gruppe>.json` (gruppenavnet står i din besked). Skriv den med Write-værktøjet. Den skal være gyldig JSON (tjek med `python3 -m json.tool`). Formen:

```json
[
  {
    "mappe": "sc7.5_staerke_og_svage_syrer",
    "titel": "Stærke og svage syrer",
    "sprog": [
      {
        "fane": "1 To glas",
        "opgave": "Kalk i syre (eller målets navn/nummer)",
        "fil": "js/data.js",
        "linje": 123,
        "nu_alm": "den almindelige skrift, præcis som nu",
        "nu_fed": "det halvfede spørgsmål, præcis som nu",
        "nu_svar": ["svar A", "svar B"],
        "problem": "én kort sætning om, hvad eleven ikke kan vide ud fra det halvfede alene, eller hvad der er indirekte",
        "nyt_alm": "foreslået indledning (må være tom streng)",
        "nyt_fed": "foreslået halvfedt spørgsmål",
        "nyt_svar": ["kun hvis svarene skal ændres, ellers udelad feltet"],
        "styrke": "tydelig eller lille"
      }
    ],
    "start": [
      {
        "fane": "1 To glas",
        "billede": "skud/a/sc7.5_staerke_og_svage_syrer__0.png",
        "dom": "fint eller lidt meget eller for meget",
        "fremme": "kort liste over det, der er fremme fra start",
        "bruges": "hvad af det første opgave bruger",
        "forslag": [
          { "alm": "indledning", "fed": "spørgsmål?", "svar": ["rigtigt", "forkert 1", "forkert 2"], "derefter": "hvad der dukker op i scenen" }
        ],
        "andet": "andre greb end trin, fx 'fold tallene i panelet ind', 'skjul grafen til mål 2'",
        "gevinst": "én sætning om, hvad det giver den svage elev",
        "prioritet": 1
      }
    ],
    "bemaerk": "valgfrit: kort om andet, du så (fx tekst i højre hjørne, opgave der løser sig selv ved klik)"
  }
]
```

Ved "dom": "fint" kan `forslag` være en tom liste. Det rigtige svar står først i `svar` i dine trinforslag (blandingen klarer koden).

Når filen er skrevet og tjekket, så svar med en kort opsummering (højst 120 ord): antal sprogfund (tydelige/små) og hvilke faner du vurderer "for meget" eller "lidt meget".
