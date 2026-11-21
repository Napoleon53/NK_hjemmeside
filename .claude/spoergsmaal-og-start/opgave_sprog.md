# Sprogforslagene sættes ind i superanimationerne

Du er én af seks hjælpere. Du sætter de godkendte sprogforslag ind i nogle få superanimationer (listen står i din besked). Svar og skriv på dansk.

## Baggrund

Niels er kemilærer i gymnasiet og har bygget ca. 75 interaktive animationer (HTML/JS) til Kemi C og Kemi B i `~/NK_hjemmeside/animationer/superanimationer/<mappe>/` (`sc` = C-niveau, `sb` = B-niveau). Eleverne er 16-18 år, og de svage elever klikker, før de læser. Læs `~/NK_hjemmeside/CLAUDE.md` (afsnittet om opgaver og hints) og i `animationer/superanimationer/README.md` afsnittet "Fælles krav".

Øverst midt i scenen står et lyst **papirkort** med opgaven. Kortets tekst laves med `NK.Papir.tekst()` i `faelles/papirkort.js`: Den sætning, der ender med `?`, bliver halvfed. Fra i dag står spørgsmålet desuden **på sin egen linje**, når der står en indledning før det (det er lavet i den fælles fil, du skal ikke røre den). Så indledningen i almindelig skrift står øverst, og det halvfede spørgsmål står alene under den.

I dag blev alle animationer gennemgået med testen: **Dæk den almindelige skrift til. Kan eleven forstå og besvare det halvfede spørgsmål alene?** Det gav 241 forslag med numre. Niels har læst dem og svaret: "Jeg er faktisk enig i alle dine forslag." Din opgave er at sætte dem ind, så de virker.

## Dine forslag

Alle forslag står i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/sprogforslag_nr.json`. Tag dem, hvis `mappe` er en af dine. Felterne:
- `nr`: nummeret i Niels' oversigt. Det skal følge med hver rettelse.
- `fane`, `opgave`, `fil`, `linje`: hvor teksten står (linjen er omtrentlig, og teksten kan være bygget af kode med tal eller navne sat ind).
- `nu_alm`, `nu_fed`, `nu_svar`: kortet, som det står nu (almindelig skrift, halvfed, svarknapper).
- `problem`: hvad der er galt.
- `nyt_alm`, `nyt_fed` og evt. `nyt_svar`: det, kortet skal vise. `nyt_alm` kan være tom. Står der "(efter spørgsmålet:)" i `nyt_alm`, så hører teksten efter det til efter spørgsmålet.

Sæt forslaget ind, som det står. Er det umuligt (teksten findes ikke, eller koden bygger kortet på en anden måde, end hjælperen troede), så lav den mindste rettelse, der løser det `problem`, forslaget beskriver, og skriv det i din rapport. Ret ikke andet end forslagene og det, de trækker med sig (se nedenfor).

## Sådan gør du

1. Find kildeteksten for hvert forslag. Teksterne ligger mest i `js/data.js`, men også i `fane.js`, `opgave.js`, `kort.js`, `tekster.js` osv. Bygges teksten af kode (fx `"Hvad bliver " + navn + " til?"`), så ret skabelonen, så alle varianter bliver rigtige.
2. Skriv rettelserne som en liste i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/ret/<dit navn>.json` (navnet står i din besked), med Write-værktøjet:
   ```json
   [{"nr": 57, "fil": "sc3.4_blandbarhed/js/data.js", "gammel": "præcis den gamle kildetekst", "ny": "den nye kildetekst", "hvor": "fane 1, mål 2, spørgsmålet"}]
   ```
   `fil` er relativ til `animationer/superanimationer`. `gammel` skal stå **præcis én gang** i filen, så tag lidt mere med, hvis den står flere steder. Et nummer må gerne have flere poster (spørgsmål, svarknap, hint, forklaring, selvtest). Brug altid forslagets `nr`, også for følgeposter.
3. Sæt dem ind: `python3 ~/NK_hjemmeside/.claude/spoergsmaal-og-start/ret.py anvend ~/NK_hjemmeside/.claude/spoergsmaal-og-start/ret/<dit navn>.json`. Scriptet siger til, hvis en `gammel` ikke står præcis én gang. Ret aldrig filerne direkte med Edit uden om listen, for så kan Niels ikke sætte et nummer tilbage. Skal en post laves om, efter den er sat ind: `ret.py tilbage <nr>`, ret posten i listen, og kør `anvend` igen.
4. Kør selvtesten for hver animation, du har rettet: `node ~/NK_hjemmeside/.claude/spoergsmaal-og-start/selvtest.mjs <mappe1> <mappe2> ...` (tager 10-60 sekunder pr. animation). Fejl, der stod der før i dag, står i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/basis.txt`. Dem skal du ikke rette, men sig til, hvis de ændrer sig.

## Det, en rettelse trækker med sig

- **Svarknapper**: Ændres svarene (`nyt_svar`), så ret også det, der hænger på dem: forklaringen til hvert forkert svar, rosen, hints, der nævner et svar, og selvtestens forventning. Rækkefølgen og hvilket svar der er rigtigt skal være som før.
- **Hints og forklaringer**: Siger et hint nu det samme som spørgsmålet, eller passer det ikke længere til spørgsmålet, så ret hintet med samme `nr`. Ellers lad dem stå.
- **Selvtesten** (`_selvtest.html`): Leder den efter den gamle tekst, så ret forventningen med samme `nr`. Lemp aldrig en grænse i selvtesten (tegn, kortets højde, at kortet ikke dækker noget). Bliver en tekst for lang, eller bliver kortet for højt, så flyt noget fra spørgsmålet til indledningen, eller forkort indledningen. Spørgsmålet skal stadig kunne stå alene.
- **To spørgsmål eller instruktion efter spørgsmålet**: Kortet bør have ét spørgsmål. En instruktion ("Tryk Indsend svar") må stå efter spørgsmålet, hvis forslaget har den der.

## Sproglige regler (Kemibogens)

- Kort, skarpt, letforståeligt. Ingen tankestreger, ingen indskudte sætninger, ingen påhængt ", og ...".
- Stort bogstav efter kolon, og undgå hellere kolon.
- C-animationer (sc): let, konkret sprog. B-animationer (sb): mere fagligt præcist.
- Molekylnavne: dioxygen, dihydrogen, dinitrogen, dichlor, dibrom, diiod. Ladning ±1 skrives + og −, aldrig 1+.
- Bogens ord: fordelingsdiagram, selvionisering, omdannelsesgrad, hydronoverførsel, "har afgivet elektroner". "fx", "ca." og "bl.a." må blive.
- Selvtestene tjekker ofte, at der ikke står ASCII-stavemåder som "paa", "naar", "foer" i elevtekst. Skriv æ, ø, å i teksterne.

## Det må du ikke

- Rette i `faelles/`, `kemichael/`, `animationer/v2/` eller i andre animationer end dine. Andre hjælpere arbejder samtidig i de andre mapper.
- Committe i git.
- Ændre layout, tegning eller opgavernes rækkefølge. Det her er kun tekst.

## Rapport

Svar til sidst kort (højst 150 ord): hvor mange numre du har sat ind, hvilke numre du ikke kunne sætte ind som foreslået og hvorfor (én linje hver), og selvtestens resultat for hver animation (ALT OK, eller hvilke fejl der står, og om de stod der før).
