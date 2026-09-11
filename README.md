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
| `downloads.html` | Overblik over downloads | `/index.php/download/` |
| `autocorrect.html` | Autocorrect til kemi | `/index.php/autocorrect/` |
| `manuel-installation.html` | Manuel installation | `/index.php/manuel-installation/` |
| `tastatur.html` | Udvid dit tastaturlayout | `/index.php/tastaturlayout/` |
| `opgaver.html` | Selvrettende Excel-opgaver | `/index.php/selvrettendeopgaver/` |
| `formelsamling.html` | Formelsamling til kemi | `/index.php/digital-formelsamling/` |
| `404.html` | Siden findes ikke | — |

Menuen er samlet i tre indgange: **Forside · Animationer · Downloads**.

Link altid til `downloads.html` *med* `.html`. Adressen `/downloads` uden
endelse er mappen med downloadfilerne, ikke oversigtssiden.

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
├── downloads\               De filer besøgende kan downloade
└── files\
    ├── Billeder\            Billedfiler til siderne
    └── Kildefiler\          Redigerbare kilder og materiale, der ikke er offentliggjort
```

### Om `downloads\`

En almindelig mappe med de filer, som siderne linker til under `downloads/…`.
Nyt download: læg filen her, og henvis til den som `downloads/filnavn.ext` i den
relevante `.html`-fil.

## Sådan retter du noget

- **Farver, skrift, afstande** → `assets\style.css`, variablerne øverst i `:root`.
  Én rettelse dér slår igennem på alle sider.
- **Tekst** → direkte i den enkelte `.html`-fil.
- **Menu og footer** → står i alle ni HTML-filer. Rettes ét sted, skal det rettes
  alle ni steder. Bed Claude Code om at gøre det, så bliver de ens.
- **Nyt download** → læg filen i `downloads\` og henvis til
  den som `downloads/filnavn.ext`.

## Når siden skal live

1. Læg en kopi af den gamle WordPress-side til side først.
2. Upload til webhotellets webrod: alle `.html`-filer, mappen `assets\`,
   indholdet af `animationer\` (som mappen `animationer`) og indholdet af
   `downloads\` (som mappen `downloads`).
3. Send de gamle adresser videre, så eksisterende links og Googles resultater
   ikke ender i en fejlside. På Apache-hosting lægges dette i `.htaccess`:

```apache
ErrorDocument 404 /404.html

Redirect 301 /index.php/download/             /downloads.html
Redirect 301 /index.php/autocorrect/          /autocorrect.html
Redirect 301 /index.php/tastaturlayout/       /tastatur.html
Redirect 301 /index.php/selvrettendeopgaver/  /opgaver.html
Redirect 301 /index.php/digital-formelsamling/ /formelsamling.html
Redirect 301 /index.php/links-til-kemia/      /downloads.html
Redirect 301 /index.php/animationer/          /animationer.html
Redirect 301 /index.php/manuel-installation/  /manuel-installation.html
```

   `/animationer/...` og `/downloads/...` er uændrede og skal ikke viderestilles.

## Om siden

- Ingen eksterne kald: ingen Google Fonts, ingen CDN, intet sporing. Siden loader
  med det samme og virker offline.
- Fungerer uden JavaScript; kun hamburgermenuen bruger JS.
- Responsiv ned til mobil (390 px) og op til store skærme (1440 px+).

## Forskelle fra den gamle WordPress-side

Indholdet er stort set det samme, bortset fra:

- **Linksiden er fjernet.** Den samlede eksterne kemilink-liste findes ikke
  længere; den gamle adresse sender videre til `/downloads.html`.
- **Forsiden er en ren landingsside** med kort introduktion og en demo af,
  hvad autocorrect gør. Kategorierne nås via menuen.
- **Autocorrect-siden** viser Word og AutoHotKey som to sideordnede
  valgmuligheder i stedet for en sammenligningstabel.
