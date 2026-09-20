# sc2.7 Opløselighed af blyiodid

Forsøget lagt over på genstandsmodellen i `../../laboratoriet/` (K3). Den
gamle udgave ligger urørt i `../sc2.7_blyiodid/` og kører videre med sin
egen `forsoeg.js`, `scene.js`, `bord.js` og `model.js`. Denne bruger den
fælles motor og består af seks små filer.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset
fra `../../laboratoriet/`, `../../kemichael/` og prøvebordets
`laerer.js`, og skal derfor ligge i `superlab/`.

## Hvad der er lavet indtil videre

Kernen (din beslutning: »kernen først«). Bordet står, kemien opfører sig
som i den gamle, afvejningen er som den gamle, varmepladen har
magnetomrører, og forløbets syv trin kører fra vandet til affaldet med
tre målinger, der bedømmes af verden. Kemichael siger det, når det koger
med bundfald, og når de tre målinger ligger på kurven.
`_selvtest.html` kører det hele igennem i otte afsnit; afsnit 7 er
øvelsestjekket (M2), og afsnit 8 gør det med musen.

Det mangler: grafen over opløseligheden (M9), quizzen og tegneserien,
PbI₂-krystallerne i zoomboblen og »den gyldne regn«, Kemichaels egne
scener (det varme glas) og den gamle udgaves knap. Se `claude/TODO.md`,
K3.

## Filer

```
index.html          stilladset: scene, panel (glasset, forløbet, målingerne,
                    uheld), intro, teoriboks, rundvisning. Ingen prosa.
css/stil.css        ligningen, forløbslisten og målingernes tabel
js/tekst.js         AL prosa: titel, intro, teorien, trinnenes tekster og
                    hints, beskederne om afvejning og måling, replikkerne,
                    rundvisningens stop
js/opstilling.js    bordet: hvad der står på det, spatlen og bordets mål
js/maaling.js       målingerne (journalen »maaling«) og afvejningens regel
js/forloeb.js       trinnenes betingelser og de tre udløsere
js/app.js           siden: reglen, knappen Notér temperatur, tasten K
js/tur.js           rundvisningen
_selvtest.html      udviklerværktøj (gennem en lokal server)
```

## Kemien

Alt står i den fælles stoftabel (`laboratoriet/js/stoftabel.js`):

    Pb²⁺(aq) + 2 I⁻(aq) ⇌ PbI₂(s)

K er opløselighedsproduktet ved 20 °C (13,26 mM³), og temperaturen går
ind med van 't Hoff med både ΔH (47,6 kJ/mol) og ΔCp (356 J/(mol·K)),
fordi ét ΔH ikke kan ramme både 0 og 100 °C. Det giver 0,044 / 0,069 /
0,41 g PbI₂ pr. 100 mL ved 0 / 20 / 100 °C, som i den gamle. De første
krystaller kommer ved 51,5 / 69,7 / 82,6 °C for 0,100 / 0,150 / 0,200 g
af hvert salt (den gamle: ca. 52 / 70 / 83).

Bundfaldet opløses igen med farten 2,4/s under omrøring og 0,5/s uden
(`fartOploes`, som den gamles). PbI₂ farver væsken tydeligt gul, når det
hvirvler rundt (`daekke: 6` i stoftabellen).

## Afvejningen

Som den gamle (din beslutning). En spatelspids er 0,038–0,062 g,
forskellig hver gang (`spatelGram` på pulverglassene), og en tom spatel
tager 0,004–0,016 g af igen fra vejebåden (`spatelGram` på den). Vægten
viser tre decimaler og er tareret med vejebåden fra start.

Et pulverglas, der holdes over vejebåden, giver en spatelspids (motorens
F54). For meget tages af ved at trække en tom spatel hen over vejebåden;
spatlen lægges så i kurven, og en ren kommer frem.

Hvad der må hældes i bægerglasset, er forsøgets regel (`bord.regel`,
`NK.MAALING.regel`): første gang 0,090–0,110 g Pb(NO₃)₂, derefter
0,040–0,060 g, og KI samme masse som den Pb(NO₃)₂, der lige kom i, højst
0,010 g fra. Først Pb(NO₃)₂, så KI. To stoffer på vejebåden afvises. Siger
reglen nej, går vejebåden hjem til vægten, og grunden står på scenen.

## Varmepladen

1100 W (`effekt`): 100 mL stiger 2,6 °C i sekundet, som i den gamle, og
afgiver imens varme til luften (40 s). Pladen er træg (`traeghed` 2,2 s).
Venstre knap er varmen, højre omrøringen (`kan.omroerer`): klikket afgøres
af, hvilken halvdel af pladen der klikkes på. Magneten ses i bunden af
glasset og snurrer, når der røres.

## Målingerne

En måling er et tidspunkt: eleven køler en klar opløsning af og trykker
**Notér temperatur** (eller K), så snart de første krystaller kommer. Det,
der noteres, er det, termometeret i glasset viser. Facit regnes af verden
i det øjeblik: den temperatur, hvor alt Pb og I i glasset netop kan være
opløst (`NK.Stof.maetningsT`). Målingen er rigtig inden for 6 °C.

Protokollen er den gamles: der kan kun noteres, når termometeret sidder i
glasset, når glasset har været klart siden sidste tilsætning (udløseren
`husk_klar` husker det), og når der er krystaller nu. Klart betyder intet
fast stof og ikke overmættet ved den temperatur, glasset har. Målingerne
står i kortet **Målinger** med masserne, den masse PbI₂, der kan dannes,
og temperaturen, grøn når den er rigtig.

## Forløbet

    vand     100 mL vand i bægerglasset
    pb       ca. 0,100 g Pb(NO₃)₂           (vilkåret tilsat)
    ki       samme masse KI                  (vilkåret tilsat)
    klar     varm op, til bundfaldet er væk  (NK.MAALING.klar)
    maal1    første måling                   (journalen)
    maal3    tre målinger                    (journalen)
    affald   aflever resterne                (efter de tre målinger)

Udløserne er `husk_klar` (kode, ingen flag: `flagFraKode: []`),
`for_meget` (det koger med bundfald) og `tre_rigtige`.
