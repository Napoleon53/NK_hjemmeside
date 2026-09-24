# sc3.1 — Elektron-prikformler

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS og JavaScript.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset fra
Kemichael, som hentes fra `../../v2/kemichael/`.

Den afløser `animationer/kemi-c-filer/c3.1_elektronprikformel.html`, som nu
ligger i `animationer/kemi-c-filer/arkiv/c3.1_elektronprikformel_oldversion.html`.

Knapperne i `samling_c3.html` og `samling_NV.html` peger direkte på denne
mappes `index.html`.

**Pointen i én sætning:** Et atom i en prikformel har 8 elektroner omkring
sig (hydrogen 2), og man ser det ved selv at tælle de frie elektroner og begge
elektroner i hver binding.

## To faner

**1 Byg** (`#byg`). Spillet fra den gamle animation: vælg valenselektroner i
det periodiske system, træk atomer sammen, byg bindinger, tjek mod
oktetreglen.

**2 Find fejlen** (`#fejl`). Kemichael har tegnet tolv prikformler. Ni har én
fejl, som elever faktisk laver; tre er rigtige. Eleven klikker på det atom,
der er tegnet forkert (eller på Ingen fejl), tæller elektronerne omkring det
og ser tegningen rettet ved siden af.

## Hvad er ændret, september 2026

Eleverne kunne klikke sig igennem Byg uden at tænke: hvert atom viste sit
elektrontal (fx 6/8) og blev grønt, når tallet passede, så man kunne klikke på
bindingerne, til alt var grønt. Derfor:

* **Eleven tæller selv.** Der står intet tal ved atomerne, og symbolerne
  skifter ikke farve undervejs. Først **Tjek svar** viser, hvilke atomer der
  ikke passer: en rød ring og "for få" eller "for mange". Ændres en binding,
  forsvinder markeringen igen.
* **Hjælpen på én knap i trin:** Giv hint → Tæl for mig (nu står elektrontallet
  ved hvert atom, som før) → Vis svaret (facit i hintboksen; eleven bygger det
  selv). Efter tre forkerte tjek i træk blinker knappen.
* **Forkert antal valenselektroner** giver et hint, der passer til fejlen
  (`NK.valensHint`): atomnummeret (alle elektronerne), det antal atomet
  mangler for at få 8, eller periodens nummer i stedet for gruppens. Før
  blinkede knappen bare, så man kunne klikke 1, 2, 3 … til det passede.
* **Ny fane: Find fejlen.** Man kan ikke finde fejlen uden at tælle. Klikker
  eleven på et atom, der passer, tæller animationen højt: prikkerne om atomet
  lyser op én ad gangen, og tallet står ved siden af. Et forkert elektrontal
  giver et hint efter den måde, der er talt forkert på (`NK.taelleHint`):
  bindingens elektroner talt én gang, bindingerne glemt, de frie elektroner
  glemt, eller målet (8) i stedet for det, der står.
* **Kemichael præsenterer begge faner** første gang (`NK.INTRO`). På Byg står
  han til venstre, og vinduet med det periodiske system bliver smallere og
  rykker til højre, mens han taler, så hans taleboble ikke dækker det.
* **Toplinjen:** faneknapper og opgavemenu (molekylformler på Byg, tegning
  1-12 på Find fejlen). Tekst under 12 px er hævet.

Uændret: prikformlerne som i lærebogen, bindinger ved træk, stregformel-panelet,
sejrsboksen med facit.

## Filer

```
index.html            markup: faner, opgavemenuer, laerred, Kemichaels lag,
                      opsaetnings- og sejrsboks, bundlinje for hver fane
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, haevet skrift, DPR-skarpt canvas,
                      hjaelpere til Kemichael, localStorage
js/data.js            grundstoffer, de ni opgaver (med hint), bindingsgeometri,
                      valenshint, Kemichaels tegninger (NK.FEJL), taellehint,
                      Kemichaels replikker (NK.INTRO)
js/tegning.js         elektronernes placering og alt der tegnes, ogsaa
                      ringe, etiketter og optaellingen
js/sprites.js         lageret til Kemichaels sprites
js/sim_byg.js         fanen Byg: opsaetning, traek/bind, tjek, hjaelp i trin
js/sim_fejl.js        fanen Find fejlen
js/laerer.js          Kemichael praesenterer fanerne
js/rundvisning.js     spotlight-rundvisningen bag "?"-knappen
js/app.js             faneskift, hintboks, tastatur, tegneloekken
sprites/molekyle_*.svg  facit til sejrsboksen og Vis svaret, lavet af _lav_sprites.js
_lav_sprites.js       udviklerværktøj, indgår ikke i animationen (se nedenfor)
_selvtest.html        udviklerværktøj, se nedenfor
```

## At rette i den

**Elektronernes placering** står i `js/tegning.js`: `NK.frieElektroner`,
`NK.elektronDomaener` og `NK.prikkerOmAtom`. Antallet af uparrede elektroner
er min(v, 8 − v) minus atomets samlede bindingsorden; resten parres. De fire
sider drejes, så bindingerne rammer hver sin side med mindst mulig skævhed
(højst 40°). Ligger bindingerne for tæt til det, eller er der flere
elektrongrupper end frie sider, lægges elektronerne i stedet jævnt i hullerne
mellem bindingerne. Funktionerne bruger ikke canvas.

Et atom kan have `frie` sat: så tegnes det med netop så mange frie elektroner.
Det bruges kun til Kemichaels forkerte tegninger. `NK.prikLayout` giver hver
priks plads, og `NK.atometsPrikker` de prikker, der tæller med hos ét atom;
optællingen og tegningen bruger de samme tal.

**Sprites** laves med `node _lav_sprites.js` fra mappen. Scriptet indlæser
`kerne.js`, `data.js` og `tegning.js` og tegner facitstrukturen (`FACIT` i
scriptet) med præcis de samme regler som spillet. Ret reglerne i
`tegning.js`, og kør scriptet igen; ret ikke SVG'erne i hånden.

**Opgaverne på Byg** står i `NK.OPGAVER` i `js/data.js`: formel, navn, atomer
(som atomnumre), sprite og hint. Bindingsvinklerne til stregformel-panelet og
sprites står i `NK.OPGAVE_GEOMETRI`, indekseret til samme array: `"kaede"`
for lineære molekyler, `"stjerne"` med `hub` og `vinkler` for resten. En ny
opgave kræver også en linje i `FACIT` i `_lav_sprites.js` og i `_selvtest.html`.

**Kemichaels tegninger** står i `NK.FEJL`: atomer, geometri, bindinger og
`frie` (det, han har tegnet forkert). Hvilket atom der er forkert, og hvor
mange elektroner det har, regnes ud af tegningen, ikke skrevet i data. `ret`
er den rettede tegning; uden `ret` er det de samme atomer og bindinger uden
`frie`. Selvtesten kræver højst én fejl pr. tegning, og at den rettede tegning
passer og bruger præcis valenselektronerne.

**Bindinger.** Slippes et atom tæt på et andet, bindes de med en
enkeltbinding i afstanden `NK.BINDINGSLAENGDE`. Et endeatom med én binding
falder tilbage i bindingslængde, når det slippes; trækkes det mere end 200 px
væk, brydes bindingen. Er atomer med flere bindinger trukket langt fra
hinanden, viser en svag stiplet streg, at bindingen stadig findes.

**Tjek af svar** rører ikke ved, *hvilken* struktur eleven har bygget, kun om
atomerne hænger sammen, og om hvert atom har det rigtige elektrontal (oktet,
eller duet for hydrogen). For de ni molekyler giver det samme struktur som
facit.

## Forenklinger

* Kun oktet- og duetreglen. Ingen udvidet oktet, ingen ioner, ingen
  formelle ladninger.
* Find fejlen tjekker ikke elektronregnskabet for hele molekylet. En tegning,
  hvor alle atomer har 8, men molekylet har for mange elektroner (fx N₂ med
  enkeltbinding og tre frie par på hvert N), er derfor ikke med.
* Hver tegning har højst én fejl, så der kun er ét atom at klikke på.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> fane · <kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning ·
<kbd>K</kbd> Kemichaels præsentation · <kbd>Esc</kbd> send Kemichael ud

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med `animationer/` som rod
(Kemichael hentes derfra). Den tjekker facit mod oktetreglen og
valenselektronerne, at optællingen giver modellens tal, Kemichaels tegninger,
begge fanernes forløb, hjælpens trin, Kemichaels præsentationer og sproget.
Sidst kørt: ALT OK, september 2026.

## Menuen

Animationen er i menuen (`samling_c3.html` og `samling_NV.html`). Fanen Find
fejlen kræver ingen ændring der; den åbnes direkte med `index.html#fejl`.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven i scenen. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er `js/praesentation.js` (samme fil som i sc1.2), som i
`js/app.js` pakker den gamle `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".
