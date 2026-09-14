# sc3.1 — Elektron-prikformler

En superanimation: i modsætning til de øvrige animationer, som er én enkelt
HTML-fil, ligger denne i sin egen mappe med adskilt CSS og JavaScript.

Åbn **`index.html`**. Mappen er selvstændig — den henter kun filer inde fra sig
selv, så den kan flyttes hvorhen som helst uden at der knækker noget.

Den afløser `animationer/kemi-c-filer/c3.1_elektronprikformel.html`, som nu
ligger i `animationer/kemi-c-filer/arkiv/c3.1_elektronprikformel_oldversion.html`.
Spillet er det samme (vælg valenselektroner i det periodiske system, træk
atomer sammen, byg bindinger, tjek mod oktetreglen), men koden er delt op
efter sitets vante mønster, og tegningen er lavet om.

Knapperne i `samling_c3.html` og `samling_NV.html` peger direkte på denne
mappes `index.html`.

## Hvad er nyt i forhold til den gamle animation

* **Prikformlerne ligner lærebogens.** Et atom er grundstofsymbolet med
  valenselektronerne på fire sider, højst to på hver. Et frit atom har én
  elektron på hver side, før de parres, så de uparrede elektroner kan ses:
  O har to, N tre, C fire. Bindingens elektronpar sidder mellem symbolerne,
  uden streg. Et bundet atom drejer sine fire sider, så hver binding har sin
  side, og de frie elektroner fylder resten så symmetrisk som muligt.
* **Opgaverne vælges ved molekylformlen** i toppen. Blå er den aktive opgave,
  grøn skrift en løst opgave.
* **Hint.** En hint-knap i byggefasen åbner en kort, opgavespecifik tekst
  (`NK.OPGAVER[].hint` i `js/data.js`). Den er skjult, til eleven beder om den.
* **Sejrsboksen** ligger nederst, så elevens egen prikformel stadig kan ses,
  og viser lærebogsudgaven af molekylet (`sprites/molekyle_*.svg`).

## Filer

```
index.html            markup: opgavemenu, laerred, opsaetnings- og sejrsboks
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, haevet skrift, DPR-skarpt canvas
js/data.js            grundstoffer, de ni opgaver (med hint), bindingsgeometri
js/tegning.js         elektronernes placering og alt der tegnes
js/sim_byg.js         spillet: opsaetningsfase, traek/bind, tjek af svar,
                      opgavemenu, hint, fremskridt i localStorage
js/rundvisning.js     spotlight-rundvisningen bag "?"-knappen
js/app.js             opstart, tastaturgenveje, tegneloekken
sprites/molekyle_*.svg  facit til sejrsboksen, lavet af _lav_sprites.js
_lav_sprites.js       udviklerværktøj, indgår ikke i animationen (se nedenfor)
```

## At rette i den

**Elektronernes placering** står i `js/tegning.js`: `NK.frieElektroner`,
`NK.elektronDomaener` og `NK.prikkerOmAtom`. Antallet af uparrede elektroner
er min(v, 8 − v) minus atomets samlede bindingsorden; resten parres. De fire
sider drejes, så bindingerne rammer hver sin side med mindst mulig skævhed
(højst 40°). Ligger bindingerne for tæt til det, eller er der flere
elektrongrupper end frie sider, lægges elektronerne i stedet jævnt i hullerne
mellem bindingerne. Funktionerne bruger ikke canvas.

**Sprites** laves med `node _lav_sprites.js` fra mappen. Scriptet indlæser
`kerne.js`, `data.js` og `tegning.js` og tegner facitstrukturen (`FACIT` i
scriptet) med præcis de samme regler som spillet. Ret reglerne i
`tegning.js`, og kør scriptet igen; ret ikke SVG'erne i hånden.

**Opgaverne** står i `NK.OPGAVER` i `js/data.js`: formel, navn, atomer (som
atomnumre), sprite og hint. Bindingsvinklerne til stregformel-panelet og
sprites står i `NK.OPGAVE_GEOMETRI`, indekseret til samme array — `"kaede"`
for lineære molekyler, `"stjerne"` med `hub` og `vinkler` for resten. En ny
opgave kræver også en linje i `FACIT` i `_lav_sprites.js`.

**Bindinger.** Slippes et atom tæt på et andet, bindes de med en
enkeltbinding i afstanden `NK.BINDINGSLAENGDE`. Et endeatom med én binding
falder tilbage i bindingslængde, når det slippes; trækkes det mere end 200 px
væk, brydes bindingen. Er atomer med flere bindinger trukket langt fra
hinanden, viser en svag stiplet streg, at bindingen stadig findes.

**Tjek af svar** rører ikke ved, *hvilken* struktur eleven har bygget — kun om
hvert atom har det rigtige elektrontal (oktet, eller duet for hydrogen), og
at atomerne hænger sammen. For de ni molekyler giver det samme struktur som
facit.

## Mangler

* `_selvtest.html` er ikke lavet endnu.
