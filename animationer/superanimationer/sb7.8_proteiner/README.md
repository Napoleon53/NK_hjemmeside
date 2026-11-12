# sb7.8 Proteiner

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter kun
filer fra sin egen mappe og `../faelles/` og virker også, når den åbnes
direkte fra harddisken. Der er ingen Kemichael: al tekst står på det lyse
papirkort øverst i scenen, hjælpen er den gule knap på kortet, og intet
løses uden **Indsend svar**.

Den er bygget fra bunden; der var ingen animation om proteinerne i
B7-menuen før. Afsnittet i Kemibogen B er B7.8 Proteiner, derfor nummer 7.8.

**Pointen i én sætning:** Et protein er en kæde af aminosyrer bundet med
stærke peptidbindinger, og kæden holdes foldet af svage bindinger; ved
denaturering brydes de svage bindinger, og formen går tabt, mens kæden er
hel, og ved hydrolyse spalter vand peptidbindingerne.

## Bestillingen (12. november 2026)

Brugeren: "Lav følgende superanimation. 2. Afsnit B6.7 Puffersystemer.
Strukturens fire niveauer, bindingerne, denaturering og hydrolyse er svære at
forstå ud fra stillbilleder. Kapitel B7 har animationer til 7.2, 7.3 og 7.7,
men ikke til proteinerne. Idé: Eleven sætter aminosyrer sammen med
peptidbindinger, så der spaltes vand fra. Kæden foldes til helix og
foldeblad og derefter til den tertiære struktur med de bindinger, der holder
den sammen. Når eleven skruer på temperaturen eller pH, bliver proteinet
denatureret." Overskriften nævner B6.7 Puffersystemer, men beskrivelsen
handler om proteiner, så animationen hører til B7.8. Planen og valgene er
Claudes, og brugeren har ikke set animationen endnu.

1. **Pointen:** som ovenfor.
2. **Afløser intet.** Bygget fra bunden. Formlerne er tegnet som bogens
   figurer `b7-peptidbinding`, `b7-peptidkaede` og `b7-hbinding-kaeder`
   (peptidbindingen i en grøn kasse, N-enden med blå og C-enden med rød glød,
   H blå, O rød og R orange). Proteinet er tegnet som `b7-proteinstruktur` og
   `b7-denaturering` (grønt rør, spiral og brede pile, røde prikker for
   hydrogenbindinger), og sidekæderne som kuglemodellerne i
   `b7-sidekaede-bindinger` (rød glød for +, blå for −, lilla-grå sky om
   upolære grupper, gule svovlatomer).
3. **Naboerne:** `sb7.7_aminosyrer` ejer aminosyrens former, pH og det
   isoelektriske punkt; her bruges kun, at −COO⁻ optager og −NH₃⁺ afgiver en
   hydron (samme pKₛ-værdier som dér). `sb3.2` ejer de intermolekylære
   bindinger i almindelighed. B1.5 ejer enzymer og det aktive center, og
   `sb7.3` ejer polysacchariderne. `sb7.4_byg_figuren` har fagordene på bogens
   figurer.
4. **Loftet:** tre faner med fire trin hver. Fane 1: tre aminosyrer som
   formler (alanin, glycin, serin) og en kæde af 8 perler. Fane 2: to stykker
   kæde, én spiral, ét protein med fire bindinger og fire kæder i
   hæmoglobin. Fane 3: ét glas, ét protein, to skydere, ét stykke kæde og fem
   eksempler.
5. **Layoutet:** scene plus panel som sb7.7. Scenen er papirkortet øverst og
   et whiteboard under det. I fane 3 står glasset til venstre og proteinet i
   en lup til højre (makro og mikro side om side) med skyderen nederst.

Stop-listen er overholdt: ingen flasker, man hælder med, intet stativ, ingen
uheld og ingen oprydning. Glasset med æggehvide er en model, der viser det,
man ser.

## Fanerne

**1 Peptidbindingen** (`js/sim_peptid.js`). (1) Alanin og glycin med alle H
i aminogrupperne og OH-grupperne. Carboxylgruppen i alanin og aminogruppen i
glycin har en gul ramme. Eleven klikker på de tre atomer, der bliver til vand,
og trykker Indsend svar ("Indsend svar: O og 2 H"). Det dobbeltbundne O,
grupperne den anden vej og et forkert antal har hver sin forklaring. Begge H
i glycins aminogruppe kan gå af. Så samles vandet under molekylerne, glycin
glider ind, og peptidbindingen kommer i en grøn kasse. (2) Ala-Gly med N-enden
og C-enden: eleven trækker serin hen til en af enderne og trykker Indsend
svar; ved N-enden ville tripeptidet hedde Ser-Ala-Gly. (3) Hvor mange
vandmolekyler fraspaltes ved en kæde af 8 aminosyrer? (7; 8 og 9 har hver sin
forklaring.) (4) Formlen bliver til perler (den primære struktur), og eleven
trækker aminosyrerne fra bakken hen til C-enden i den rækkefølge, opskriften
viser (Ala-Gly-Ser-Cys-Lys-Val-Asp-Cys). En forkert aminosyre eller den
forkerte ende giver en forklaring. Vandet samles i rækken nederst (til sidst
7).

**2 Foldningen** (`js/sim_fold.js`). (1) To stykker kæde som i bogens
`b7-hbinding-kaeder`. Eleven trækker fra et H til et O (eller klikker på dem
efter hinanden) og tegner hydrogenbindingerne; et klik på en streg fjerner
den. Indsend svar: skrå streger fjernes med en forklaring, og manglende
tælles. Når alle seks er der, bliver kæderne til pilene i et β-foldeblad. (2)
Eleven skubber enden af en lige kæde mod venstre til den stiplede streg, og
kæden snor sig sammen; slippes den før, retter den sig ud igen. Når den er
snoet helt, kommer hydrogenbindingerne mellem vindingerne, og kortet spørger,
hvad der holder α-helixen sammen. (3) Spiralen og foldebladet er dele af
samme kæde. Eleven trækker spiralen ned over foldebladet (slippes den for
højt, glider den tilbage), sidekæderne mødes, og de fire bindinger dannes:
disulfidbro (Cys og Cys, to H går af), ionbinding (Lys og Asp),
londonbindinger (Val og Ala) og hydrogenbinding (Ser og Ser). Eleven klikker
på en binding (den har en gul ramme og et nummer), vælger navnet på kortet og
trykker Indsend svar, når alle fire har et navn. (4) Hæmoglobin: hvilket
niveau beskriver, hvordan fire kæder sidder sammen? Bagefter glider fire
kæder (to grønne og to orange som i bogen) sammen.

**3 Denaturering og hydrolyse** (`js/sim_denat.js`). (1) Et glas æggehvide og
proteinet i luppen. Eleven skruer temperaturen op; kæden ryster mere, jo
varmere det er, og over 60 °C brydes de svage bindinger, proteinet folder sig
ud, og æggehviden bliver hvid. Disulfidbroen og peptidbindingerne holder.
Spørgsmålet: hvilke bindinger er brudt? (vælg alle, der passer:
hydrogenbindingerne og ionbindingen). Æggehviden bliver ikke klar igen, når
den køler af. (2) Et nyt glas med pH 8. Under pH 3,65 optager −COO⁻ i
asparaginsyre en hydron, og over pH 10,53 afgiver −NH₃⁺ i lysin en; den orange
hydron kommer eller går, ionbindingen forsvinder, og proteinet folder sig ud.
Spørgsmålet følger den vej, eleven valgte (lav eller høj pH). (3) Et stykke
kæde: eleven klikker på den binding, vand spalter (C−N i peptidbindingen);
C=O, N−H, N−C, C−C og sidekæden har hver sin forklaring. Vandet kommer ind, OH
går på carbonatomet og H på nitrogenatomet, og bagefter spaltes hele kæden
af perler til aminosyrer. (4) Fem eksempler trækkes i kasserne Denaturering og
Hydrolyse (et æg koges, mælk bliver sur, håndsprit, pepsin, kogning i stærk
syre i timevis). Kortets knap fører derefter til Prøv selv, hvor begge skydere
er fri, og panelet har knappen Nyt glas æggehvide.

## Filerne

```
index.html          siden, teorien og rundvisningen
css/stil.css        kopieret fra sb7.7; det nye står nederst under SB7.8
js/kerne.js         fælles hjælpere (som sb7.7)
js/data.js          opgaverne, teksterne, aminosyrerne, opskriften, bindingerne
                    mellem sidekæderne og tallene (60 °C, pKₛ, pH-skalaen)
js/formel.js        strukturformler i bogens stil: zigzag, H₂N og OH, to stykker
                    kæde side om side, og hvad musen peger på
js/tegning.js       tavlen, rammerne, skiltet, skyderne, kuglerne, røret, pilene,
                    hydrogenbindingerne, vandet, perlerne, brikkerne og glasset
js/protein.js       proteinet: kæden som punkter (foldet og udfoldet),
                    sidekæderne som kugler og den store spiral i fane 2
js/fane.js          scenekortet, hjælpeknappen, Indsend svar, musen og konfettien (som sb7.7)
js/sim_peptid.js    fane 1
js/sim_fold.js      fane 2
js/sim_denat.js     fane 3
js/rundvisning.js   rundvisningen (kun TURE er ny)
js/app.js           faneskift, teorien, tastatur og tegneløkken
_selvtest.html      selvtesten (kræver en lokal server)
```

## Det, man kan rette i

* **Opgaverne og teksterne:** `D.PEPTID`, `D.FOLD` og `D.DENAT` i `js/data.js`.
* **Opskriften og bakken:** `D.OPSKRIFT` og `D.BAKKE`.
* **Bindingerne mellem sidekæderne:** `D.KONTAKTER` (rækkefølgen fra venstre).
* **Tallene:** `D.T_DENAT`, `D.PH_START`, `D.FOLD_UD` og `D.BRYD`; pKₛ i
  `D.AMINOSYRER`.
* **Proteinets form:** `G` øverst i `js/protein.js`, og den udfoldede kæde i
  `DEL1`, `DEL2` og `DEL3` samme sted.

## Forenklinger

* Formlerne er skeletformler som i bogen; i trin 1 i fane 1 står H-atomerne i
  aminogrupperne og OH-grupperne hver for sig, så de kan klikkes på.
* Proteinet er tegnet fladt: én spiral over et foldeblad med to strenge og kun
  fire sidekæder. Et rigtigt protein har 100 til 1000 aminosyrer.
* I spiralen i fane 2 er hydrogenbindingerne tegnet som vandrette prikker
  mellem vindingerne, ikke mellem bestemte C=O og N−H.
* Æggehvidens proteiner denatureres her alle ved 60 °C (i virkeligheden fra ca.
  60 °C og op over 80 °C). Varmen bryder alle de svage bindinger på én gang.
* pH virker kun gennem ionbindingen: under pKₛ for asparaginsyres sidekæde
  (3,65) eller over pKₛ for lysins (10,53) forsvinder den, og proteinet folder
  sig ud. Bogen nævner også, at proteinets samlede ladning ændres; den er ikke
  vist. Ved høj pH bliver æggehviden kun lidt uklar.
* Denatureringen kan ikke gå tilbage (et kogt æg bliver ikke råt).
* Disulfidbroen holder, når proteinet denatureres (den er en
  elektronparbinding), så de to cystein sidder sammen i den udfoldede kæde.
* Hydrolysen vises på ét stykke kæde; at hele kæden spaltes, er en kort film
  med perlerne. Enzymerne er ikke tegnet.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med mappen `animationer/`
som rod. Den tjekker modellen (én binding og ét vandmolekyle pr.
kondensation, de seks par i foldebladet, ionbindingen mellem pH 3,65 og 10,53,
at disulfidbroen holder i den udfoldede kæde), at alle tre faner kan
gennemføres, at forkerte svar får den rigtige forklaring og koster stjernen,
at intet løses uden Indsend svar, at varmen og pH kun bryder de svage
bindinger, at teksterne er korte og uden tankestreger og ASCII-dansk, og at
kortet aldrig dækker tavlen fra 1100 × 620 til 1600 × 950. 12. nov. 2026: ALT
OK (81). Alle træk og klik er også prøvet med rigtige musehændelser i headless
Chrome (alle tre faner gennemført med stjerne).

## I menuen

Ikke i menuen. Kommer den det, bliver den knap nr. 4 i
`kemi-b-filer/samling_b7.html` med koden `b7.8`, og `index.html` får linjen
`<script src="../../til_panelet.js" data-panel="samling_alt_b.html" data-emne="b7.8"></script>`
øverst i `<head>`. Kemibogen B7.8 har ingen Prøv selv-linje endnu.

## Papirkortet

Kortet er det lyse papirkort fra start (se Fælles krav i `../README.md`):
`../faelles/papirkort.css` og `../faelles/papirkort.js` er indlæst, og
`<body class="papirkort">`. Efter et rigtigt svar bliver kortet på
spørgsmålet med forklaringen under svarene, og Næste står, hvor Indsend svar
stod. Kortets grønne knap går altid fremad; Begynd forfra står i panelet.
