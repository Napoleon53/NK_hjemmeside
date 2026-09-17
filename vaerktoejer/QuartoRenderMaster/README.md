# Quarto Render Master

Windows-program til at rendere Quarto-bøger og enkelte .qmd-filer uden
kommandolinje. Programmet er skrevet i C# med WinForms og har ingen
afhængigheder ud over Quarto selv.

Programmet er ikke en del af hjemmesiden og er ikke lagt i `downloads/`.

## Byg programmet

Kør `byg.cmd`. Den færdige `QuartoRenderMaster.exe` lægges i `byg\`.

Scriptet vælger selv, hvordan der bygges:

- Er .NET SDK installeret, bruges
  `dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true`.
  Resultatet er én selvstændig .exe, der kører uden installeret .NET.
- Er der ingen SDK, bygges der mod .NET Framework 4.8 med den C#-compiler,
  der følger med Windows. Resultatet er også én .exe på ca. 50 kB, der kører
  på enhver Windows 10/11-maskine.

Kildefilerne er skrevet, så de kan oversættes begge veje.

## Quarto

Quarto skal være installeret. Programmet leder efter `quarto.exe` i denne
rækkefølge:

1. `PATH`
2. `%LOCALAPPDATA%\Programs\Quarto\bin\quarto.exe`
3. `%ProgramFiles%\Quarto\bin\quarto.exe`

Findes den ikke, siger programmet det og viser et link til quarto.org.

## Sådan bruges det

Vælg en projektmappe øverst. Programmet finder selv ud af, hvad mappen er.

**Bog.** Indeholder mappen en `_quarto.yml` med et `book:`-felt, vises bogens
dele og kapitler som et træ med afkrydsningsfelter. Titlerne læses fra
kapitlernes egne filer. Er alle kapitler valgt, bygges hele bogen samlet. Er
kun nogle valgt, renderes de enkeltvis ind i bogens egen outputmappe, som
læses af `output-dir` i `_quarto.yml`.

**Udgaver.** Ligger der `_quarto-<navn>.yml`-filer ved siden af, kan de vælges
i feltet Udgave øverst til højre. Programmet lægger profilens indstillinger
oven i projektets, præcis som `quarto render --profile <navn>` gør, og bruger
profilens egen outputmappe.

**Enkelte filer.** Er der ingen bog, eller vælges Enkelte filer i mappetræet,
vises alle .qmd- og .md-filer i mappetræet, grupperet efter undermappe.
Mapperne `_bog`, `.quarto`, `arkiv`, `_ud`, `_book`, `_site`, `_freeze` og
`.git` springes over, og det samme gør filer, der starter med punktum.

Resultatet lægges i den outputmappe, der er valgt i højre side. Filerne
lægges i outputmappen under den sti, de har i projektet, altså
`kilder\opgave.pdf` for en fil i undermappen `kilder`. Det er Quartos egen
opførsel, og den gør, at to filer med samme navn i hver sin undermappe ikke
overskriver hinanden.

## Formater

- **HTML.** Med HTML som én selvstændig fil indlejres billeder og stilark i
  selve .html-filen, så den kan sendes videre alene.
- **Word.** Er der sat en skabelon i Word-skabelon (reference-doc), bruges den
  til alle Word-renderinger.
- **PDF.** Renderes med `--to typst`, altså Quartos indbyggede Typst-motor.
  Der er hverken LaTeX eller TinyTeX inde over. `--pdf-engine typst` er ikke
  brugt, fordi det kræver en separat typst-installation ved siden af Quarto.

## Kombinér til én fil

Vælges flere enkeltfiler med Kombinér til én fil med sideskift, samles de i
én midlertidig .qmd-fil med `{{< pagebreak >}}` mellem hver. Filer, der ikke
selv har en overskrift i teksten, får deres titel sat ind som overskrift, og
henvisninger til billeder og delfiler skrives om, så de stadig peger rigtigt.
Den samlede fil får det navn, der står i feltet Filnavn.

## Filer uden YAML-hoved

En fil uden `---` i toppen kan renderes alligevel. Programmet laver en
midlertidig kopi med et hoved, hvor titlen er filens første overskrift
(`# ...`) og sproget er `lang: da`. Kopien hedder `~qrm-<navn>.qmd` og
slettes igen, når renderingen er slut. Originalen røres ikke.

Er mappen ikke et Quarto-projekt, lægges der desuden en midlertidig
`_quarto.yml` i projektmappen under renderingen. Uden den sætter Typst sin
rod til filens egen mappe og nægter at hente billeder fra en søskendemappe.
Også den slettes bagefter.

## Dropbox

Ligger den valgte mappe under en Dropbox-mappe, advarer programmet om, at
Dropbox kan låse filer midt i en rendering, og tilbyder at bygge i en
midlertidig kopi under `%TEMP%\QuartoRenderMaster\` og kopiere resultatet
tilbage bagefter.

## Indstillinger

Valgene huskes i `%APPDATA%\QuartoRenderMaster\indstillinger.ini`: sidste
mappe, udgave, outputmappe, Word-skabelon, formater og de øvrige afkrydsninger.

## Filerne i projektet

| Fil | Indhold |
| --- | --- |
| `Program.cs` | Start |
| `Hovedvindue.cs` | Hele brugerfladen |
| `Quartolokator.cs` | Finder quarto.exe |
| `Yamllaeser.cs` | Læser den del af YAML, som `_quarto.yml` bruger |
| `Kvartoprojekt.cs` | Bogens dele og kapitler, udgaver, outputmappe |
| `Filfinder.cs` | Finder dokumenter i mappetræet |
| `Dokumenthoved.cs` | YAML-hoved, titler, sammenkædning, stiomskrivning |
| `Renderplan.cs` | Laver listen af quarto-kald ud fra brugerens valg |
| `Koerer.cs` | Kører quarto og skriver til loggen |
| `Filhjaelp.cs` | Stier, mappekopiering, Dropbox |
| `Indstillinger.cs` | Gemmer valgene mellem programkørsler |
