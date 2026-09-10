# Kemiformler.dk — ny statisk hjemmeside

Afløser for WordPress-siden på kemiformler.dk. Samme indhold, ny struktur og nyt
design. **Siden er ikke live endnu** — den gamle WordPress kører uændret, indtil
du selv vælger at skifte.

Ren HTML og CSS. Ingen database, ingen plugins, intet byggetrin. Du kan
dobbeltklikke `index.html` og se hele siden med det samme, også uden internet.

---

## Sådan ser du siden

Åbn `C:\NK_hjemmeside\index.html` i en browser. Alt virker herfra — også
animationer og downloads.

## Sider

| Fil | Side | Afløser på WordPress |
|---|---|---|
| `index.html` | Forside | `/` |
| `animationer.html` | Animationer og spil | `/index.php/animationer/` |
| `materialer.html` | Overblik over materiale | `/index.php/download/` |
| `autocorrect.html` | Autocorrect til kemi | `/index.php/autocorrect/` |
| `manuel-installation.html` | Manuel installation | `/index.php/manuel-installation/` |
| `tastatur.html` | Udvid dit tastaturlayout | `/index.php/tastaturlayout/` |
| `opgaver.html` | Selvrettende Excel-opgaver | `/index.php/selvrettendeopgaver/` |
| `formelsamling.html` | Formelsamling til kemi | `/index.php/digital-formelsamling/` |
| `404.html` | Siden findes ikke | — |

Menuen er samlet i tre indgange: **Forside · Animationer · Materialer**.
Det gamle menupunkt "Download" var et udsagnsord brugt som kategori; det hedder nu
"Materialer", og selve download-knapperne ligger på emnesiderne.

## Mapper

```
C:\NK_hjemmeside\            <- selve git-repoet (github.com/Napoleon53/NK_hjemmeside)
├── *.html                   De ni sider
├── assets\
│   ├── style.css            ALT styling
│   ├── site.js              Kun mobilmenuen (siden virker uden JS)
│   └── img\                 Logo og skærmbilleder
├── animationer\             De rigtige animationsfiler
├── superanimationer\        Udkast til superanimationer
├── downloads\               genvej (junction) til "files\downloads\"
└── files\
    ├── downloads\           de rigtige downloadfiler
    └── Billeder\            billedfiler
```

### Om `downloads\`

Det er ikke en rigtig mappe, men en **Windows-genvej (junction)**. Den peger på
`files\downloads\`, hvor filerne ligger, så der kun findes én udgave af hver fil,
mens HTML-siderne kan henvise til den korte sti `downloads/`.

Skal den laves igen (fx efter en flytning), køres i en almindelig kommandoprompt:

```
mklink /J "C:\NK_hjemmeside\downloads" "C:\NK_hjemmeside\files\downloads"
```

`animationer\` var tidligere også en junction til `HTML animationer\`, som havde
sit eget git-repo. Nu er hele `C:\NK_hjemmeside\` ét repo, og `animationer\` er
en helt almindelig mappe i det.

## Sådan retter du noget

- **Farver, skrift, afstande** → `assets\style.css`, variablerne øverst i `:root`.
  Én rettelse dér slår igennem på alle sider.
- **Tekst** → direkte i den enkelte `.html`-fil.
- **Menu og footer** → står i alle ni HTML-filer. Rettes ét sted, skal det rettes
  alle ni steder. Bed Claude Code om at gøre det, så bliver de ens.
- **Nyt download** → læg filen i `files\downloads\` og henvis til
  den som `downloads/filnavn.ext`.

## Når siden skal live

1. Læg en kopi af den gamle WordPress-side til side først.
2. Upload til webhotellets webrod:
   - alle `.html`-filer
   - mappen `assets\`
   - indholdet af `animationer\` → som mappen **`animationer`**
   - indholdet af `files\downloads\` → som mappen **`downloads`**

   Junctionen `downloads\` skal altså *ikke* uploades — mappen skal hedde
   `downloads` på serveren, ligesom i dag.
3. Send de gamle adresser videre, så eksisterende links og Googles resultater
   ikke ender i en fejlside. På Apache-hosting lægges dette i `.htaccess`:

```apache
ErrorDocument 404 /404.html

Redirect 301 /index.php/download/             /materialer.html
Redirect 301 /index.php/autocorrect/          /autocorrect.html
Redirect 301 /index.php/tastaturlayout/       /tastatur.html
Redirect 301 /index.php/selvrettendeopgaver/  /opgaver.html
Redirect 301 /index.php/digital-formelsamling/ /formelsamling.html
Redirect 301 /index.php/links-til-kemia/      /materialer.html
Redirect 301 /index.php/animationer/          /animationer.html
Redirect 301 /index.php/manuel-installation/  /manuel-installation.html
```

   `/animationer/...` og `/downloads/...` er uændrede og skal ikke viderestilles.

## Kontrolleret ved opbygningen

- Alle lokale links og billedstier er kontrolleret — ingen manglende filer.
- Ingen vandret scroll ved 390 px, 768 px og 1440 px på nogen af de ni sider.
- Ingen eksterne kald: ingen Google Fonts, ingen CDN, intet sporing. Siden loader
  med det samme og virker offline.
- Siden fungerer uden JavaScript; kun hamburgermenuen bruger JS.

## Ændringer i forhold til den gamle side

Indholdet er ordret det samme, bortset fra:

- **Linksiden er fjernet.** Tiden var løbet fra samlingen af eksterne kemilinks,
  og siden findes ikke længere. Den gamle adresse sendes videre til
  /materialer.html.
- **Forsiden er en ren landingsside** med overskrift, kort introduktion, to
  knapper og en demo af, hvad autocorrect gør. Kategorierne nås via menuen.
- **Autocorrect-siden er skrevet om** til to valgkort side om side — Word
  (anbefalet start) og AutoHotKey (supplement) — hver med styresystem, hvor det
  virker, hvad det indeholder, og sine egne downloads. Sammenligningstabellen er
  overflødig og fjernet. Alle oplysninger fra den gamle side er bevaret.
- Slåfejl rettet: "animationre" → "animationer", "HMTL" → "HTML", og et
  efterladt `&#8221;` midt i AutoHotKey-afsnittet.
- WordPress' kodede anførselstegn ryddet op.
