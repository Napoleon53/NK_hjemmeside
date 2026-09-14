# sc3.1 — Elektron-prikformler

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS og JavaScript.

Åbn **`index.html`**. Mappen er selvstændig — den henter kun filer inde fra sig
selv, så den kan flyttes hvorhen som helst uden at der knækker noget.

Den afløser `animationer/kemi-c-filer/c3.1_elektronprikformel.html`. Spillet
er det samme (vælg valenselektroner i det periodiske system, træk atomer
sammen, byg bindinger, tjek mod oktetreglen), men koden er delt op efter
sitets vante mønster, og der er kommet nye ting til — se nedenfor.

**Dette er første udkast.** Den gamle fil `c3.1_elektronprikformel.html` er
endnu ikke lavet om til en genvej hertil, og `samling_c3.html` peger stadig
på den gamle sti. Det er et bevidst næste skridt, ikke glemt.

## Hvad er nyt i forhold til den gamle animation

* **Ikoner i stedet for tal i opgavemenuen.** Hvert af de ni molekyler har nu
  sit eget lille ikon (`sprites/molekyle_*.svg`) — en færdig, korrekt
  elektronprikformel i miniature. Ikonerne er tegnet ud fra den samme
  bindingsvinkel- og valensgeometri, som `js/tegning.js` bruger til
  stregformel-panelet, så de altid stemmer overens med spillets egen tegning.
* **Hint.** Når eleven sidder fast i selve byggefasen, kan en hint-knap åbne
  en kort, opgavespecifik tekst (`NK.OPGAVER[].hint` i `js/data.js`). Den er
  skjult som standard — ingen teori foran opgaven, kun en drejning i den
  retning eleven allerede er i gang med at tænke.
* Faneskift-egen kode er væk; her er kun én "fane", men objektet følger
  stadig `tilpas()/opdater()/tegn()/nulstil()`-mønsteret, så det ligner
  resten af superanimationerne.

## Filer

```
index.html          markup: opgavemenu, laerred, opsaetnings- og sejrsoverlay
css/stil.css         alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js          NK-navnerum, haevet skrift, DPR-skarpt canvas
js/data.js            grundstoffer, de ni opgaver (med hint), bindingsgeometri
js/tegning.js         alt der tegnes: atomer, bindinger, frie elektronpar,
                      stregformel-panelet, konfetti
js/sim_byg.js         spillet: opsaetningsfase, traek/bind, tjek af svar,
                      opgavemenu, hint, fremskridt i localStorage
js/rundvisning.js     spotlight-rundvisningen bag "?"-knappen
js/app.js             opstart, tastaturgenveje, tegneloekken
sprites/molekyle_*.svg   ét ikon pr. opgave — se ovenfor
```

## At rette i den

**Opgaverne** står i `NK.OPGAVER` i `js/data.js`: formel, navn, hvilke
atomer (som atomnumre, i byggerækkefølge) og hint-teksten. Bindingsvinklerne
for stregformel-panelet står separat i `NK.OPGAVE_GEOMETRI`, indekseret til
samme array — type `"kaede"` for lineære molekyler, `"stjerne"` med `hub` og
`vinkler` for resten. Tilføjer man en opgave her, skal man også lægge et
sprite i `sprites/` og pege på det i `sprite`-feltet.

**Sprites** er ikke tegnet i hånden. De er genereret ud fra præcis samme
bindings- og valensregning som `js/tegning.js` bruger i selve spillet (single/
dobbelt/tripelbinding trukket til atomkanten, frie elektronpar spredt modsat
bindingsretningerne) — se generator-scriptet, som ikke er en del af
animationen og derfor ikke ligger i mappen. Skal et sprite laves om, er det
hurtigere at rette generatoren og køre den igen end at redigere SVG'en i
hånden.

**Tjek af svar** rører ikke ved, *hvilken* bindingsstruktur eleven har
bygget — kun om hvert atom har det rigtige elektrontal (oktet, eller duet for
hydrogen) og at atomerne hænger sammen. Det betyder, at en kemisk gyldig,
men anderledes struktur end den "officielle" (fx en anden men lige så
korrekt resonansform) også godkendes. Det er med vilje: det er
elektronregnskabet, opgaven træner, ikke udenadslære af facit-tegningen.

## Mangler / naturlige næste skridt

* `_selvtest.html` er ikke lavet endnu.
* Den gamle sti `c3.1_elektronprikformel.html` peger endnu ikke herhen, og
  `samling_c3.html` er ikke rettet til.
