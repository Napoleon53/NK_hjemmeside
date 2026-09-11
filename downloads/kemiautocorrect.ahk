#Requires AutoHotkey v2.0
#SingleInstance Force
; 2026 Niels Kræmmer
; ==============================================================================
; INDSTILLINGER
; ==============================================================================
; Som standard er autocorrect slået FRA i Word og PowerPoint, så det ikke
; konflikter med kemi-autocorrect i Word. I OneNote er det som standard slået TIL.
; Det ændres ikke her i filen, men via ikonet ved uret: højreklik på det grønne
; H og vælg "Indstillinger...". Valgene huskes i en ini-fil under %AppData%.

IndstillingsMappe := A_AppData "\KemiAutocorrect"
IndstillingsFil := IndstillingsMappe "\indstillinger.ini"
AktivIWord := IniRead(IndstillingsFil, "Indstillinger", "AktivIWord", "0") = "1"
AktivIOneNote := IniRead(IndstillingsFil, "Indstillinger", "AktivIOneNote", "1") = "1"

IndstillingsVindue := Gui("+AlwaysOnTop -MinimizeBox", "Kemi-autocorrect – indstillinger")
IndstillingsVindue.SetFont("s10", "Segoe UI")
IndstillingsVindue.AddText("w380", "Autocorrect virker i alle programmer. Her kan du vælge, om det også skal virke i Word, PowerPoint og OneNote. I Word og PowerPoint er det som standard slået fra, så det ikke konflikter med kemi-autocorrect i Word.")
WordValg := IndstillingsVindue.AddCheckbox("y+14", "Brug også autocorrect i Word og PowerPoint")
OneNoteValg := IndstillingsVindue.AddCheckbox("y+8", "Brug også autocorrect i OneNote")
IndstillingsVindue.AddButton("y+18 w90 Default", "Gem").OnEvent("Click", GemIndstillinger)
IndstillingsVindue.AddButton("x+8 w90", "Annuller").OnEvent("Click", (*) => IndstillingsVindue.Hide())
IndstillingsVindue.OnEvent("Escape", (*) => IndstillingsVindue.Hide())

A_TrayMenu.Insert("1&", "Indstillinger...", VisIndstillinger)
A_TrayMenu.Insert("2&")
A_TrayMenu.Default := "Indstillinger..."
OpdaterIkonTekst()

; Bruges af #HotIf længere nede: afgør om hotstrings må bruges i det aktive vindue
HotstringsTilladt() {
    if WinActive("ahk_class OpusApp") || WinActive("ahk_class PPTFrameClass")
        return AktivIWord
    if WinActive("ahk_exe ONENOTE.EXE")
        return AktivIOneNote
    return true
}

VisIndstillinger(*) {
    WordValg.Value := AktivIWord
    OneNoteValg.Value := AktivIOneNote
    IndstillingsVindue.Show()
}

GemIndstillinger(*) {
    global AktivIWord := WordValg.Value = 1
    global AktivIOneNote := OneNoteValg.Value = 1
    DirCreate IndstillingsMappe
    IniWrite AktivIWord ? 1 : 0, IndstillingsFil, "Indstillinger", "AktivIWord"
    IniWrite AktivIOneNote ? 1 : 0, IndstillingsFil, "Indstillinger", "AktivIOneNote"
    IndstillingsVindue.Hide()
    OpdaterIkonTekst()
    TrayTip "Word og PowerPoint: " TilFra(AktivIWord) "`nOneNote: " TilFra(AktivIOneNote), "Kemi-autocorrect – indstillinger gemt"
}

OpdaterIkonTekst() {
    A_IconTip := "Kemi-autocorrect`nWord og PowerPoint: " TilFra(AktivIWord) "`nOneNote: " TilFra(AktivIOneNote)
}

TilFra(Aktiv) => Aktiv ? "slået til" : "slået fra"

; ==============================================================================
; SCANNER HOTKEY: Win+Shift+Q
; ==============================================================================
#+q::
{
    ; 1. Save and clear clipboard
    SavedClip := ClipboardAll()
    A_Clipboard := ""

    Send "^c"
    if !ClipWait(0.5) {
        A_Clipboard := SavedClip
        return
    }

    CurrentText := A_Clipboard
    ScriptContent := FileRead(A_ScriptFullPath, "UTF-8")
    ReplacedLog := [] ; Array to store changed words

    ; 2. Parse this script to find hotstring definitions
    Loop Parse, ScriptContent, "`n", "`r"
    {
        ; Regex looks for lines starting with :options:trigger::replacement
        if RegExMatch(A_LoopField, "^:(.*?):(.*?)::(.*)", &Match)
        {
            Trigger := Trim(Match[2])
            Replacement := Match[3]

            ; Replace and count occurrences
            ; CaseSense is false (insensitive search), but output is exact replacement
            CurrentText := StrReplace(CurrentText, Trigger, Replacement, false, &Count)

            if (Count > 0)
                ReplacedLog.Push(Trigger . " (" . Count . ")")
        }
    }

    ; 3. Paste new text
    A_Clipboard := CurrentText
    Send "^v"

    Sleep 200

    ; 4. Restore original clipboard
    A_Clipboard := SavedClip

    ; 5. Show notification if changes were made
    if (ReplacedLog.Length > 0)
    {
        InfoMsg := "Replaced:`n"
        for Item in ReplacedLog
            InfoMsg .= " - " . Item . "`n"

        ToolTip InfoMsg
        SetTimer () => ToolTip(), -3000 ; Remove tooltip after 3 seconds
    }
}

; ==============================================================================
; HOTSTRING DEFINITIONS
; ==============================================================================

; Global Hotstring Settings
; C1: Do not conform to input case (output is always as defined below)
#Hotstring C1 EndChars "/\ `n`t

; Hotstrings herfra og ned til "#HotIf" længere nede følger indstillingerne for
; Word, PowerPoint og OneNote (se INDSTILLINGER øverst)
#HotIf HotstringsTilladt()
::aluminium#::Al
::aluminiumion#::Al³⁺
::aluminiumbromid#::AlBr₃
::aluminiumcarbid#::Al₄C₃
::aluminiumchlorid#::AlCl₃
::aluminiumfluorid#::AlF₃
::aluminiumoxid#::Al₂O₃
::aluminiumsulfat#::Al₂(SO₄)₃
::antimon#::Sb
::antimon(iii)oxid#::Sb₂O₃
::antimon(v)oxid#::Sb₂O₅
::antimon(v)sulfid#::Sb₂S₅
::antimonsyre#::H₃SbO₄
::argon#::Ar
::arsen#::As
::tetraarsen#::As₄
::arsen(iii)hydrid#::AsH₃
::arsen(iii)oxid#::As₂O₃
::arsen(v)oxid#::As₂O₅
::arsen(iii)sulfid#::As₂S₃
::arsensyre#::H₃AsO₄
::barium#::Ba
::bariumion#::Ba²⁺
::bariumbromid#::BaBr₂
::bariumcarbonat#::BaCO₃
::bariumchlorid#::BaCl₂
::bariumchromat#::BaCrO₄
::bariumhydrid#::BaH₂
::bariumhydroxid#::Ba(OH)₂
::bariumnitrat#::Ba(NO₃)₂
::bariumoxid#::BaO
::bariumperoxid#::BaO₂
::bariumsulfat#::BaSO₄
::beryllium#::Be
::beryllium(ii)ion#::Be²⁺
::berylliumchlorid#::BeCl₂
::berylliumoxid#::BeO
::bismuth#::Bi
::bly#::Pb
::bly(ii)ion#::Pb²⁺
::bly(ii)azid#::Pb(N₃)₂
::bly(ii)bromid#::PbBr₂
::bly(ii)chlorid#::PbCl₂
::bly(iv)chlorid#::PbCl₄
::bly(ii)chromat#::PbCrO₄
::bly(ii)hydroxid#::Pb(OH)₂
::bly(ii)iodid#::PbI₂
::bly(ii)nitrat#::Pb(NO₃)₂
::bly(ii)oxid#::PbO
::bly(iv)oxid#::PbO₂
::bly(ii,iv)oxid#::Pb₃O₄
::bly(ii)sulfid#::PbS
::bly(ii)sulfat#::PbSO₄
::bor#::B
::bornitrid#::BN
::dibortrioxid#::B₂O₃
::borsyre#::H₃BO₃
::abortrifluorid#::BF₃
::diboran#::B₂H₆
::pentaboran#::B₅H₉
::brom#::Br
::dibrom#::Br₂
::hydrogenbromid#::HBr
::cadmium#::Cd
::cadmiumbromid#::CdBr₂
::cadmiumchlorid#::CdCl₂
::cadmiumhydroxid#::Cd(OH)₂
::cadmiumiodid#::CdI₂
::cadmiumoxid#::CdO
::cadmiumsulfat#::CdSO₄
::cadmiumsulfid#::CdS
::calcium#::Ca
::calciumion#::Ca²⁺
::calciumbromid#::CaBr₂
::calciumdicarbid#::CaC₂
::calcit#::CaCO₃ (calcit)
::kalk#::CaCO₃
::calciumchlorid#::CaCl₂
::calciumfluorid#::CaF₂
::calciumhydrid#::CaH₂
::calciumhydroxid#::Ca(OH)₂
::calciumiodid#::CaI₂
::calciumnitrat#::Ca(NO₃)₂
::calciumnitrid#::Ca₃N₂
::calciumoxalat#::C₂O₄Ca
::calciumoxid#::CaO
::calciumperoxid#::CaO₂
::calciumphosphat#::Ca₃(PO₄)₂
::calciumstearat#::(C₁₇H₃₅COO)₂Ca
::calciumsulfat#::CaSO₄
::calciumsulfid#::CaS
::carbon#::C
::dicarbon#::C₂
::grafit#::C
::carbondioxid#::CO₂
::kulsyre#::H₂CO₃
::carbondisulfid#::CS₂
::carbonmonoxid#::CO
::carbonylsulfid#::COS
::hydrogencyanid#::HCN
::dicyan#::(CN)₂
::cerium#::Ce
::cerium(iii)oxid#::Ce₂O₃
::cerium(iv)sulfat#::Ce(SO₄)₂
::chlor#::Cl
::dichlor#::Cl₂
::chlordioxid#::ClO₂
::dichloroxid#::Cl₂O
::hydrogenchlorid#::HCl
::dichlorheptoxid#::Cl₂O₇
::chlorsyre#::HClO₃
::chlorsyrling#::HClO₂
::hypochlorsyrling#::HClO
::perchlorsyre#::HClO₄
::chrom#::Cr
::chrom(ii)ion#::Cr²⁺
::chrom(iii)ion#::Cr³⁺
::chromsyre#::H₂CrO₄
::chrom(ii)chlorid#::CrCl₂
::chrom(ii)oxid#::CrO
::chrom(iii)oxid#::Cr₂O₃
::chrom(iv)oxid#::CrO₂
::chrom(vi)oxid#::CrO₃
::chrom(iii)sulfat#::Cr₂(SO₄)₃
::cobalt#::Co
::cobalt(ii)ion#::Co²⁺
::cobalt(ii)oxid#::CoO
::cobalt(iii)oxid#::Co₂O₃
::cobalt(ii)sulfat#::CoSO₄
::cæsium#::Cs
::cæsiumbromid#::CsBr
::cæsiumchlorid#::CsCl
::cæsiumfluorid#::CsF
::cæsiumhydrid#::CsH
::cæsiumhydroxid#::CsOH
::cæsiumiodid#::CsI
::cæsiumoxid#::Cs₂O
::fluor#::F
::difluor#::F₂
::difluoroxid#::F₂O
::hydrogenfluorid#::HF
::germanium#::Ge
::germaniumhydrid#::GeH₄
::digerman#::Ge₂H₆
::germaniumoxid#::GeO₂
::guld#::Au
::guld(i)chlorid#::AuCl
::guld(iii)chlorid#::AuCl₃
::helium#::He
::hydrogen#::H
::dihydrogen#::H₂
::hydron#::H⁺
::deuterium#::D₂O
::oxonium#::H₃O⁺
::iod#::I
::diiod#::I₂
::hydrogeniodid#::HI
::iodsyre#::HIO₃
::iodazid#::IN₃
::iodbromid#::IBr
::iodchlorid#::ICl
::iodtrichlorid#::ICl₃
::diiodpentoxid#::I₂O₅
::jern#::Fe
::jern(ii)ion#::Fe²⁺
::jern(iii)ion#::Fe³⁺
::jerncarbid#::Fe₃C
::jern(ii)carbonat#::FeCO₃
::jern(ii)chlorid#::FeCl₂
::jern(iii)chlorid#::FeCl₃
::jern(ii)disulfid#::FeS₂
::jern(ii)oxid#::FeO
::wustit#::Fe₀.₉₄₇O
::jern(iii)oxid#::Fe₂O₃
::jern(ii,iii)oxid#::Fe₃O₄
::jern(ii)sulfid#::FeS
::jern(iii)sulfid#::Fe₂S₃
::jern(iii)sulfat#::Fe₂(SO₄)₃
::ferrocen#::Fe(C₅H₅)₂
::kalium#::K
::kaliumion#::K⁺
::kaliumbromat#::KBrO₃
::kaliumbromid#::KBr
::kaliumcarbonat#::K₂CO₃
::kaliumchlorat#::KClO₃
::kaliumchlorid#::KCl
::kaliumchromat#::K₂CrO₄
::kaliumcyanid#::KCN
::kaliumcyanat#::KOCN
::kaliumdichromat#::K₂Cr₂O₇
::kaliumfluorid#::KF
::kaliumhydrid#::KH
::kaliumhydroxid#::KOH
::kaliumiodat#::KIO₃
::kaliumiodid#::KI
::kaliummanganat#::K₂MnO₄
::kaliumnitrat#::KNO₃
::kaliumnitrit#::KNO₂
::kaliumoxid#::K₂O
::kaliumperchlorat#::KClO₄
::kaliumperiodat#::KIO₄
::kaliumperoxid#::K₂O₂
::kaliumdisulfat#::K₂S₂O₇
::kaliumdioxid#::KO₂
::kaliumsulfat#::K₂SO₄
::kaliumsulfid#::K₂S
::kaliumthiocyanat#::KSCN
::kobber#::Cu
::kobber(i)ion#::Cu⁺
::kobber(ii)ion#::Cu²⁺
::kobber(i)chlorid#::CuCl
::kobber(i)iodid#::CuI
::kobber(i)oxid#::Cu₂O
::kobber(ii)oxid#::CuO
::kobber(i)sulfat#::Cu₂SO₄
::kobber(ii)sulfat#::CuSO₄
::kobber(i)sulfid#::Cu₂S
::kobber(ii)sulfid#::CuS
::krypton#::Kr
::kryptondifluorid#::KrF₂
::kviksølv#::Hg
::dikviksølv#::Hg₂²⁺
::kviksølv(ii)ion#::Hg²⁺
::dikviksølvbromid#::Hg₂Br₂
::dikviksølviodid#::Hg₂I₂
::dikviksølvoxid#::Hg₂O
::kviksølv(ii)oxid#::HgO
::dikviksølvsulfat#::Hg₂SO₄
::lithium#::Li
::lithiumion#::Li⁺
::lithiumborhydrid#::LiBH₄
::lithiumbromid#::LiBr
::lithiumcarbonat#::Li₂CO₃
::lithiumchlorid#::LiCl
::lithiumfluorid#::LiF
::lithiumhydrid#::LiH
::lithiumhydroxid#::LiOH
::lithiumiodid#::LiI
::lithiumoxid#::Li₂O
::magnesium#::Mg
::magnesiumion#::Mg²⁺
::magnesiumbromid#::MgBr₂
::magnesiumchlorid#::MgCl₂
::magnesiumiodid#::MgI₂
::magnesiumnitrat#::Mg(NO₃)₂
::magnesiumnitrid#::Mg₃N₂
::magnesiumoxid#::MgO
::magnesiumsulfat#::MgSO₄
::magnesiumsulfid#::MgS
::mangan#::Mn
::mangan(ii)ion#::Mn²⁺
::mangan(iii)ion#::Mn³⁺
::mangan(ii)oxid#::MnO
::mangan(iii)oxid#::Mn₂O₃
::mangan(iv)oxid#::MnO₂
::mangan(ii)sulfat#::MnSO₄
::mangan(ii)sulfid#::MnS
::molybdæn#::Mo
::molybdæn(iv)oxid#::MoO₂
::molybdæn(vi)oxid#::MoO₃
::natrium#::Na
::natriumion#::Na⁺
::natriumamin#::NaNH₂
::natriumarsenit#::NaAsO₂
::natriumazid#::NaN₃
::natriumbenzoat#::C₆H₅-COONa
::natriumborhydrid#::NaBH₄
::natriumbromid#::NaBr
::natriumbromat#::NaBrO₃
::natriumcarbonat#::Na₂CO₃
::natriumchlorat#::NaClO₃
::natriumchlorid#::NaCl
::natriumchlorit#::NaClO₂
::natriumethanolat#::CH₃CH₂ONa
::natriumfluorid#::NaF
::natriumformiat#::HCOONa
::natriumhydrid#::NaH
::natriumhydroxid#::NaOH
::natriumiodat#::NaIO₃
::natriumiodid#::NaI
::natriumnitrat#::NaNO₃
::natriumnitrid#::Na₃N
::natriumnitrit#::NaNO₂
::natriumoleat#::C₁₇H₃₃COONa
::natriumoxalat#::Na₂C₂O₄
::natriumoxid#::Na₂O
::natriumperoxid#::Na₂O₂
::natriumdisulfit#::Na₂S₂O₅
::natriumsilikat#::Na₂SiO₃
::natriumstearat#::C₁₇H₃₅COONa
::natriumsulfat#::Na₂SO₄
::natriumsulfid#::Na₂S
::natriumsulfit#::Na₂SO₃
::natriumedta#::Na₂H₂C₁₀H₁₂O₈N₂∙2H₂O
::neon#::Ne
::nikkel#::Ni
::nikkel(ii)ionion#::Ni²⁺
::nikkelbromid#::NiBr₂
::nikkel(ii)oxid#::NiO
::nikkel(ii)sulfat#::NiSO4
::nikkelsulfid#::NiS
::nitrogen#::N
::dinitrogen#::N₂
::nitrogendioxid#::NO₂
::nitrogenoxid#::NO
::dinitrogenoxid#::N₂O
::ammoniak#::NH₃
::ammonium#::NH₄⁺
::ammoniumchlorid#::NH₄Cl
::ammoniumchromat#::(NH₄)₂CrO₄
::ammoniummolybdat#::(NH₄)₂MoO₄
::ammoniumnitrat#::NH₄NO₃
::ammoniumnitrit#::NH₄NO₂
::ammoniumsulfat#::(NH₄)₂SO₄
::ammoniumvanadat#::NH₄VO₃
::hydrazin#::NH₂NH₂
::hydrazinchlorid#::NH₂-NH₃Cl
::hydrogenazid#::HN₃
::hydroxylamin#::NH₂OH
::salpetersyre#::HNO₃
::salpetersyrling#::HNO₂
::oxygen#::O
::dioxygen#::O₂
::trioxygen#::O₃
::vand#::H₂O
::tungtvand#::D₂O
::hydrogenperoxid#::H₂O₂
::phosphor#::P₄
::phosphor#::P
::tetraphosphor#::P₄
::phosphorsyre#::H₃PO₄
::phosphorsyrling#::H₃PO₃
::metaphosphorsyre#::(HPO₃)n
::platin#::Pt
::rubidium#::Rb
::rubiddiumchlorid#::RbCl
::selen#::Se
::selenhydrid#::H₂Se
::selendioxid#::SeO₂
::selensyre#::H₂SeO₄
::silicium#::Si
::siliciumcarbid#::SiC
::siliciumdioxid#::SiO₂
::siliciumhydrid#::SiH₄
::strontium#::Sr
::strontium(ii)ion#::Sr²⁺
::strontiumchlorid#::SrCl₂
::strontiumchromat#::SrCrO₄
::strontiumnitrat#::Sr(NO₃)₂
::strontiumoxid#::SrO
::strontiumsulfat#::SrSO₄
::svovl#::S
::svovlrhombisk#::S₈
::svovlmonoklin#::S
::disvovl#::S₂
::octasvovl#::S₈
::svovldioxid#::SO₂
::svovlsyrling#::H₂SO₃
::dihydrogensulfid#::H₂S
::svovlsyre#::H₂SO₄
::sulfurylchlorid#::SO₂Cl₂
::svovltrioxid#::SO₃
::thionylchlorid#::SOCl₂
::sulfamidsyre#::H₂NSO₃H
::chlorsulfonsyre#::ClSO₃H
::svovlhexafluorid#::SF₆
::sølv#::Ag
::sølvion#::Ag⁺
::sølvbromat#::AgBrO₃
::sølvbromid#::AgBr
::sølvcarbonat#::Ag₂CO₃
::sølvchlorid#::AgCl
::sølvchromat#::Ag₂CrO₄
::sølvcyanid#::AgCN
::sølvfluorid#::AgF
::sølviodat#::AgIO₃
::sølviodid#::AgI
::sølvnitrat#::AgNO₃
::sølvphosphat#::Ag₃PO₄
::sølv(i)oxid#::Ag₂O
::sølv(ii)oxid#::AgO
::sølvsulfat#::Ag₂SO₄
::sølvsulfid#::Ag₂S
::thorium#::Th
::thor(iv)nitrat#::Th(NO₃)₄
::thor(iv)oxid#::ThO₂
::tin#::Sn
::tin(ii)ion#::Sn²⁺
::tin(iv)ion#::Sn⁴⁺
::tin(iv)chlorid#::SnCl₄
::tin(iv)hydrid#::SnH₄
::tin(ii)hydroxid#::Sn(OH)₂
::tin(ii)oxid#::SnO
::tin(iv)oxid#::SnO₂
::tin(ii)sulfat#::SnSO₄
::tin(ii)sulfid#::SnS
::tin(iv)sulfid#::SnS₂
::titan#::Ti
::titancarbid#::TiC
::titan(ii)chlorid#::TiCl₂
::titan(iv)chlorid#::TiCl₄
::titan(iv)oxid#::TiO₂
::uran#::U
::uranhexafluorid#::UF₆
::uran(iv)oxid#::UO₂
::uran(vi)oxid#::UO₃
::vanadium#::V
::vanadium(v)oxid#::V₂O₅
::wolfram#::W
::wolframcarbid#::WC
::wolfram(vi)oxid#::WO₃
::xenon#::Xe
::xenontrioxid#::XeO₃
::xenontetraoxid#::XeO₄
::xenondifluorid#::XeF₂
::xenonhexafluorid#::XeF₆
::zink#::Zn
::zinkion#::Zn²⁺
::zinkbromid#::ZnBr₂
::zinkcarbonat#::ZnCO₃
::zinkchlorid#::ZnCl₂
::zinkhydroxid#::Zn(OH)₂
::zinkiodid#::ZnI₂
::zinkoxid#::ZnO
::zinksulfat#::ZnSO₄
::zinksulfid#::ZnS
::zirkonium#::Zr
::methan#::CH₄
::ethan#::C₂H₆
::propan#::C₃H₈
::butan#::C₄H₁₀
::pentan#::C₅H₁₂
::hexan#::C₆H₁₄
::hexan#::CH₃(CH₂)₄CH₃
::heptan#::C₇H₁₆
::heptan#::CH₃(CH₂)₅CH₃
::octan#::C₈H₁₈
::octan#::CH₃(CH₂)₆CH₃
::nonan#::C₉H₂₀
::decan#::C₁₀H₂₂
::undecan#::CH₃(CH₂)₉CH₃
::dodecan#::CH₃(CH₂)₁₀CH₃
::tridecan#::CH₃(CH₂)₁₁CH₃
::tetradecan#::CH₃(CH₂)₁₂CH₃
::pentadecan#::CH₃(CH₂)₁₃CH₃
::hexadecan#::CH₃(CH₂)₁₄CH₃
::heptadecan#::CH₃(CH₂)₁₅CH₃
::octadecan#::CH₃(CH₂)₁₆CH₃
::nonadecan#::CH₃(CH₂)₁₇CH₃
::icosan#::CH₃(CH₂)₁₈CH₃
::2-methylpropan#::(CH₃)₃CH
::2-methylbutan#::(CH₃)₂CHCH₂CH₃
::2-methylpentan#::(CH₃)₂CH(CH₂)₂CH₃
::3-methylpentan#::CH₃CH(CH₂CH₃)₂
::2-methylhexan#::(CH₃)₂CH(CH₂)₃CH₃
::3-ethylpentan#::CH₃CH₂CH(C₂H₅)CH₂CH₃
::cyclopropan#::C₃H₆
::cyclobutan#::C₄H₈
::cyclopentan#::C₅H₁₀
::cyclohexan#::C₆H₁₂
::methylcyclohexan#::C₆H₁₁CH₃
::ethen#::CH₂=CH₂
::propen#::CH₂=CHCH₃
::propadien#::CH₂=C=CH₂
::cyclopropen#::C₃H₄
::cyclobuten#::C₄H₆
::buta-1,2-dien#::CH₂=C=CHCH₃
::buta-1,3-dien#::CH₂=CHCH=CH₂
::but-1-en#::CH₂=CHCH₂CH₃
::(z)-but-2-en#::CH₃CH=CHCH₃
::pent-1-en#::CH₂=CH(CH₂)₂CH₃
::cyclohexen#::C₆H₁₀
::α-pinen#::C₁₀H₁₆
::caroten#::C₄₀H₅₆
::ethyn#::C₂H₂
::ethyn#::HC≡CH
::propyn#::HC≡CCH₃
::but-1-yn#::HC≡CCH₂CH₃
::but-2-yn#::CH₃C≡CCH₃
::buta-1,3-diyn#::HC≡C-C≡CH
::pent-1-yn#::HC≡C(CH₂)₂CH₃
::benzen#::C₆H₆
::naphthalen#::C₁₀H₈
::anthracen#::C₁₄H₁₀
::benzopyren#::C₂₀H₁₂
::methylbenzen#::C₆H₅CH₃
::ethenylbenzen#::C₆H₅CH=CH₂
::ethylbenzen#::C₆H₅CH₂CH₃
::biphenyl#::C₆H₅-C₆H₅
::chlormethan#::CH₃Cl
::chlorethen#::CHCl=CH₂
::chlorethan#::CH₃CH₂Cl
::1-chlorpropan#::CH₃CH₂CH₂Cl
::2-chlorpropan#::CH₃CHClCH₃
::dichlormethan#::CH₂Cl₂
::1-chlorbutan#::CH₃(CH₂)₂CH₂Cl
::2-chlorbutan#::CH₃CH₂CHClCH₃
::1,1-dichlorethen#::CH₂=CCl₂
::1,1-dichlorethan#::CH₃CHCl₂
::1,2-dichlorethan#::CH₂ClCH₂Cl
::chlorbenzen#::C₆H₅Cl
::trichlormethan#::CHCl₃
::tetrachlormethan#::CCl₄
::hexachlorethan#::CCl₃CCl₃
::hexachlorbenzen#::C₆Cl₆
::tetrafluormethan#::CF₄
::tetrafluorethen#::CF₂=CF₂
::brommethan#::CH₃Br
::bromethan#::CH₃CH₂Br
::1-brompropan#::CH₃CH₂CH₂Br
::2-brompropan#::CH₃CHBrCH₃
::1-brombutan#::CH₃(CH₂)₂CH₂Br
::2-brombutan#::CH₃CH₂CHBrCH₃
::brombenzen#::C₆H₅Br
::dibrommethan#::CH₂Br₂
::1,1-dibromethan#::CH₃CHBr₂
::1,2-dibromethan#::CH₂BrCH₂Br
::1,2-dibrombenzen#::C₆H₄Br₂
::tribrommethan#::CHBr₃
::tetrabrommethan#::CBr₄
::iodmethan#::CH₃I
::iodethan#::CH₃CH₂I
::1-iodpropan#::CH₃CH₂CHI
::2-iodpropan#::CH₃CHICH₃
::1-iodbutan#::CH₃(CH₂)₂CH₂I
::2-iodbutan#::CH₃CH₂CHICH₃
::iodbenzen#::C₆H₅I
::diiodmethan#::CH₂I₂
::1,1-diiodethan#::CHI₂CH₃
::1,2-diiodethan#::CH₂ICH₂I
::triiodmethan#::CHI₃
::tetraiodmethan#::CI₄
::methanamin#::CH₃NH₂
::dimethylamin#::(CH₃)₂NH
::ethanamin#::CH₃CH₂NH₂
::dimethylammonium#::(CH₃)₂NH₂⁺
::trimethylamin#::(CH₃)₃N
::propan-1-amin#::CH₃CH₂CH₂NH₂
::propan-2-amin#::CH₃CH(NH₂)CH₃
::ethan-1,2-diamin#::H₂N(CH₂)₂NH₂
::diethylamin#::(CH₃CH₂)₂NH
::pyridin#::C₅H₅N
::butan-1,4-diamin#::H₂N(CH₂)₄NH₂
::benzenamin#::C₆H₅NH₂
::triethylamin#::(CH₃CH₂)₃N
::phenylhydrazin#::C₆H₅NHNH₂
::dabco#::N(CH₂CH₂)₃N
::hexan-1,6-diamin#::H₂N(CH₂)₆NH₂
::aniliniumchlorid#::C₆H₅NH₃Cl
::amphetamin#::C₆H₅CH₂CH(NH₂)CH₃
::methamphetamin#::C₁₀H₁₅N
::nicotin#::C₁₀H₁₄N₂
::urinsyre#::C₅H₄N₄O₃
::diphenylamin#::(C₆H₅)₂NH
::triphenylamin#::(C₆H₅)₃N
::adrenalin#::CH₃NHCH₂CHOHC₆H₃(OH)₂
::benzidin#::H₂N-C₆H₅-C₆H₅-NH₂
::coffein#::C₈H₁₀O₂N₄
::edta#::(HOOC)₂NCH₂CH₂N(CH₂COOH)₂
::cocain#::C₁₇H₂₁NO₄
::quinin#::C₂₀H₂₄O₂N₂
::creatinin#::C₄H₇N₃O
::creatin#::H₂NC(NH)N(CH₃)CH₂COOH
::cytosin#::C₄H₅N₃O
::uracil#::C₄H₄N₂O₂
::thymin#::C₅H₆N₂O₂
::adenin#::C₅H₅N₅
::adeninium#::C₅H₆N₅⁺
::guanin#::C₅H₅N₅O
::adenosin#::C₁₀H₁₃O₄N₅
::amp#::C₁₀H₁₄O₇N₅P
::adp#::C₁₀H₁₅O₁₀N₅P₂
::atp#::C₁₀H₁₆O₁₃N₅P₃
::guanosin#::C₁₀H₁₃N₅O₅
::cytidin#::C₉H₁₃N₃O₅
::uridin#::C₉H₁₂N₂O₆
::coenzyma#::C₃₆N₇O₁₆P₃S
::nadp#::C₂₁H₂₈N₇O₁₇P₃
::methanol#::CH₃OH
::ethanol#::CH₃CH₂OH
::prop-2-en-1-ol#::CH₂=CHCH₂OH
::propan-1-ol#::CH₃CH₂CH₂OH
::propan-2-ol#::CH₃CHOHCH₃
::2-aminoethanol#::NH₂CH₂CH₂OH
::ethan-1,2-diol#::CH₂OHCH₂OH
::butan-1-ol#::CH₃(CH₂)₂CH₂OH
::butan-2-ol#::CH₃CH₂CHOHCH₃
::propan-1,2-diol#::CH₃CHOHCH₂OH
::propan-1,3-diol#::CH₂OHCH₂CH₂OH
::pentan-1-ol#::CH₃(CH₂)₃CH₂OH
::pentan-2-ol#::CH₃(CH₂)₂CHOHCH₃
::pentan-3-ol#::(CH₃CH₂)₂CHOH
::cyclohexanol#::C₆H₁₁OH
::hexan-1-ol#::CH₃(CH₂)₄CH₂OH
::benzylalkohol#::C₆H₅-CH₂OH
::phenol#::C₆H₅OH
::2-methylphenol#::CH₃C₆H₄OH
::2-chlorphenol#::ClC₆H₄OH
::2-nitrophenol#::HOC₆H₄NO₂
::1-naphthol#::C₁₀H₇OH
::quinhydron#::C₁₂H₁₀O₄
::ethylenoxid#::C₂H₄O
::dimethylether#::(CH₃)₂O
::furan#::C₄H₄O
::tetrahydrofuran#::(CH₂)₄O
::diethylether#::(CH₃CH₂)₂O
::methoxypropan#::CH₃(CH₂)₂OCH₃
::propoxypropan#::(CH₃CH₂CH₂)₂O
::methoxybenzen#::CH₃OC₆H₅
::ethoxybenzen#::CH₃CH₂OC₆H₅
::cumarin#::C₉H₆O₂
::diphenylether#::(C₆H₅)₂O
::myristicin#::C₁₁H₁₂O₃
::dibenzylether#::(C₆H₅CH₂)₂O
::kroneether#::C₁₂H₂₄O₆
::methanal#::HCHO
::1,3,5-trioxan#::-(CH₂-O)₃
::ethanal#::CH₃CHO
::ethandial#::H-CO-CO-H
::propanal#::CH₃CH₂CHO
::propenal#::CH₂=CHCHO
::butanal#::CH₃(CH₂)₂CHO
::2-methylpropanal#::(CH₃)₂CHCHO
::pentanal#::CH₃(CH₂)₃CHO
::2-methylbutanal#::CH₃CH₂CH(CH₃)CHO
::3-methylbutanal#::(CH₃)₂CHCH₂CHO
::benzaldehyd#::C₇H₆O
::benzaldehyd#::C₆H₅CHO
::kanelaldehyd#::C₆H₅CH=CHCHO
::anisaldehyd#::CH₃OC₆H₄CHO
::vanillin#::CH₃OC₆H₃(OH)CHO
::citral#::(CH₃)₂C=CH(CH₂)₂C(CH₃)=CHCHO
::retinal#::C₂₀H₂₈O
::ethenon#::CH₂=C=O
::propanon#::(CH₃)₂CO
::butanon#::CH₃CH₂COCH₃
::butan-2,3-dion#::CH3COCOCH3
::pentan-2-on#::CH₃(CH₂)₂COCH₃
::pentan-3-on#::(CH₃CH₂)₂CO
::cyclohexanon#::C₆H₁₀O
::pentan-2,3-dion#::CH₃COCOCH₂CH₃
::pentan-2,4-dion#::CH₃COCH₂COCH₃
::heptan-2-on#::CH₃(CH₂)₄COCH₃
::carvon#::C₁₀H₁₄O
::d-campher#::C₁₀H₁₆O
::ascorbinsyre#::C₆H₈O₆
::ninhydrin#::C₉H₆O₄
::benzophenon#::C₆H₅COC₆H₅
::β-iononen#::C₁₃H₂₀O
::piperin#::C₁₇H₁₉O₃N
::testosteron#::C₁₉H₂₈O₂
::capsaicin#::C₁₈H₂₇O₃N
::α-d-arabinose#::C₅H₁₀O₅
::d-2-deoxyribose#::C₅H₁₀O₄
::α-l-glucose#::C₆H₁₂O₆
::β-d-glucose#::C₆H₁₂O₆
::α-lactose#::C₁₂H₂₂O₁₁
::α-maltose#::C₁₂H₂₂O₁₁
::saccharose#::C₁₂H₂₂O₁₁
::stivelse#::(C₆H₁₀O₅)ₙ
::methansyre#::HCOOH
::ethansyre#::CH₃COOH
::propensyre#::CH₂=CHCOOH
::propansyre#::CH₃CH₂COOH
::peroxyethansyre#::CH₃C(O)OOH
::fluorethansyre#::CH₂FCOOH
::2-oxopropansyre#::CH₃COCOOH
::butansyre#::CH₃(CH₂)₂COOH
::ethandisyre#::(COOH)₂
::chlorethansyre#::CH₂ClCOOH
::pentansyre#::CH₃(CH₂)₃COOH
::propandisyre#::CH₂(COOH)₂
::hexansyre#::CH₃(CH₂)₄COOH
::butandisyre#::(CH₂COOH)₂
::benzoesyre#::C₇H₆O₂
::dichlorethansyre#::CHCl₂COOH
::2-oxobutandisyre#::HOOCCH₂COCOOH
::bromethansyre#::CH₂BrCOOH
::octansyre#::CH₃(CH₂)₆COOH
::hexandisyre#::HOOC(CH₂)₄COOH
::decansyre#::CH₃(CH₂)₈COOH
::iodethansyre#::CH₂ICOOH
::citronsyre#::C₆H₈O₇
::d-isocitronsyre#::C₆H₈O₇
::dodecansyre#::CH₃(CH₂)₁₀COOH
::decandisyre#::HOOC(CH₂)₈COOH
::tetradecansyre#::CH₃(CH₂)₁₂COOH
::hexadecansyre#::CH₃(CH₂)₁₄COOH
::octadecansyre#::CH₃(CH₂)₁₆COOH
::ethanoylchlorid#::CH₃C(=O)Cl
::propanoylchlorid#::CH₃CH₂C(=O)Cl
::carbonylchlorid#::C(=O)Cl₂
::ethanoylbromid#::CH₃C(=O)Br
::benzoylchlorid#::C₆H₅C(=O)Cl
::methanamid#::HC(=O)NH₂
::ethanamid#::CH₃C(=O)NH₂
::carbamid#::C(=O)(NH₂)₂
::ethandiamid#::H₂NC(=O)-C(=O)NH₂
::benzamid#::C₆H₅C(=O)NH₂
::butandiamid#::H₂NC(=O)CH₂CH₂C(=O)NH₂
::methannitril#::HCN
::ethannitril#::CH₃-CN
::propennitril#::CH₂=CH-CN
::propannitril#::CH₃CH₂CN
::benzonitril#::C₆H₅CN
::hexandinitril#::NC-(CH₂)₄-CN
::methylisocyanid#::C₂H₃N
::phenylisocyanid#::C₇H₅N
::methylmethanoat#::HCOOCH₃
::ethylmethanoat#::HCOOCH₂CH₃
::methylethanoat#::CH₃COOCH₃
::methylnitrat#::CH₃ONO₂
::ethylethanoat#::CH₃COOCH₂CH₃
::propylmethanoat#::HCOO(CH₂)₂CH₃
::ethylnitrat#::CH₃CH₂ONO₂
::propylethanoat#::CH₃COO(CH₂)₂CH₃
::methylpropanoat#::CH₃CH₂COOCH₃
::ethylpropanoat#::CH₃CH₂COOCH₂CH₃
::methylbutanoat#::CH₃(CH₂)₂COOCH₃
::ethylbutanoat#::CH₃(CH₂)₂COOCH₂CH₃
::butylethanoat#::CH₃COO(CH₂)₃CH₃
::methylbenzoat#::C₆H₅COOCH₃
::ethylbenzoat#::C₆H₅COOCH₂CH₃
::phenylbenzoat#::C₆H₅COOC₆H₅
::glyceryltrioleat#::C₅₇H₁₀₄O₆
::l-alanin#::NH₂CH(CH₃)COOH
::l-alaninium#::⁺NH₃CH(CH₃)COOH
::d,l-alanin#::NH₂CH(CH₃)COOH
::l-arginin#::NH₂CHCOOH(CH₂)₃-NH-C(NH₂)=NH
::l-asparagin#::NH₂CH(CH₂-CO-NH₂)COOH
::l-asparaginsyre#::NH₂CHCOOH(CH₂-COOH)
::l-cystein#::NH₂CH(CH₂-SH)COOH
::l-glutamin#::NH₂CHCOOH((CH₂)₂-CO-NH₂)
::l-glutaminsyre#::NH₂CHCOOH((CH₂)₂-COOH)
::d-glutaminsyre#::NH₂CHCOOH(CH₂)₂-COOH
::glycin#::NH₂CH₂COOH
::glycinium#::⁺NH₃CH₂COOH
::l-histidin#::C₆H₉N₃O₂
::l-isoleucin#::NH₂CHCOOH(CH(CH₃)-CH₂-CH₃)
::l-leucin#::Leu-CH₂-CH(CH₃)₂
::d-leucin#::C₆H₁₃NO₂
::d,l-lysin#::C₆H₁₄N₂O₂
::l-methionin#::Met-(CH₂)₂-S-CH₃
::l-phenylalanin#::Phe-CH₂-C₆H₅
::l-prolin#::C₅H₉NO₂
::4-hydroxyprolin#::C₅H₉NO₃
::l-serin#::-CH₂-OH
::l-threonint#::NH₂CHCOOH(CHOH-CH₃)
::l-tryptophanw#::C₁₁H₁₂N₂O₂
::l-tyrosiny#::NH₂CHCOOH(CH₂-C₆H₄-OH)
::l-valinv#::NH₂CHCOOH(CH(CH₃)₂)
::l-valinium#::⁺NH₃CH(R)COOH
::d,l-valin#::(CH₃)₂CHCH(NH₂)COOH
::n-glycylglycin#::H₂NCH₂-CONH-CH₂COOH
::l-alanylglycin#::H₂NCH(CH₃)-CONH-CH₂COOH
::hippursyre#::C₆H₅-CONH-CH₂COOH
::glycylvalin#::H₂NCH₂-CONH-CH(C₃H₇)COOH
::leucylglycin#::H₂NCH(C₄H₉)-CONH-CH₂COOH
::sarcosin#::CH₃-NH-CH₂COOH
::4-aminobutansyre#::NH₂(CH₂)₃COOH
::nitromethan#::CH₃NO₂
::nitroethan#::CH₃CH₂NO₂
::1-nitropropan#::CH₃CH₂CH₂NO₂
::2-nitropropan#::(CH₃)₂CHNO₂
::nitrobenzen#::C₆H₅NO₂
::2-nitrotoluen#::CH₃C₆H₄NO₂
::malathion#::(CH₃O)₂P(S)SCH((COOC₂H₅)CH₂COOC₂H₅
::ethanthiol#::CH₃CH₂SH
::ethanthioamid#::CH₃CSNH₂
::ethanthiosyre#::CH₃COSH
::propan-1-thiol#::CH₃CH₂CH₂SH
::propan-2-thiol#::(CH₃)₂CHSH
::dimethylsulfoxid#::(CH₃)₂SO
::thiophen#::C₄H₄S
::diethylsulfid#::(CH₃CH₂)₂S
::benzenthiol#::C₆H₅SH
::benzensulfonsyre#::C₆H₅SO₃H
::diphenylsulfid#::(C₆H₅)₂S
::diphenylsulfoxid#::(C₆H₅)₂SO
::diphenylsulfon#::(C₆H₅)₂SO₂
::ammoniumcarbonat#::(NH₄)₂CO₃
::aluminiumnitrat#::Al(NO₃)₃
::aluminiumiodid#::AlI₃
::bariumiodid#::BaI₂
::ethyndiol#::C₂H₂O₂
::ethanol2#::C₂H₅OH
::natriumethanoat2#::C₂H₅ONa
::calciumsulfit#::CaSO₃
::methandiol#::CH₂(OH)₂
::ethenol#::CH₂CHOH
::keten#::CH₂CO
::methanal2#::CH₂O
::natriumethanoat#::CH₃COONa
::dimethylether2#::CH₃OCH₃
::chrom(ii)nitrat#::Cr(NO₃)₃
::kobber(ii)nitrat#::Cu(NO₃)₂
::jern(ii)hydroxid#::Fe(OH)₂
::kaliumphosphat#::K₃PO₄
::lithiumnitrat#::LiNO₃
::mangan(ii)nitrat#::Mn(NO₃)₂
::ammoniumhydroxid#::NH₄OH
::nitrogentriiodid#::NI₃
::nitronium#::NO₂⁺
::chrom(ii)nitrat#::Cr(NO₃)₂
::jern(iii)nitrit#::Fe(NO₃)₂
::jern(ii)sulfit#::FeSO₃
::jern(ii)sulfat#::FeSO₄
::jern(iii)nitrat#::Fe(NO₃)₃
::nikkel(ii)nitrat#::Ni(NO₃)₂
::kobber(ii)nitrat#::CuNO₃
::kobber(ii)iodid#::CuI₂
::ammoniumsulfid#::(NH₄)₂S
::ammoniumfluorid#::NH₄F
::ammoniumiodid#::NH₄I
::sølvazid#::AgN₃
::bariumnitrid#::Ba₃N₂
::bariumsulfit#::BaSO₃
::acetonitril#::CH₃CN
::kobber(ii)bromid#::CuBr₂
::jern(ii)iodid#::FeI₂
::jern(iii)iodid#::FeI₃
::hydrogenbromat#::HBrO₃
::kaliumsulfit#::K₂SO₃
::kaliumphophit#::K₃PO₃
::kaliumchlorit#::KClO₂
::lithiumsulfid#::Li₂S
::magnesiumsulfit#::MgSO₃
::natriumphophit#::Na₃PO₃
::natriumphosphat#::Na₃PO₄
::carbaminsyre#::NH₂COOH
::ammoniumbromid#::NH₄Br
::zinknitrid#::Zn₃N₂
::zinkphosphid#::Zn₃P₂
::natriumphosphid#::Na₃P
::kaliumnitrid#::K₃N
::kaliumphosphid#::K₃P
::bariumphosphid#::Ba₃P₂
::bariumflourid#::BaF₂
::jern(ii)nitrid#::Fe₃N₂
::jern(ii)phosphid#::Fe₃P₂
::jern(iii)flourid#::FeF₃
::kobber(ii)sulfit#::CuSO₃
::kobber(ii)nitrid#::Cu₃N₂
::bly(iv)sulfid#::PbS₂
::bly(iv)iodid#::PbI₄
::1-bromhexan#::C₆H₁₃Br
::1-bromheptan#::C₇H₁₅Br
::calciummethanoat#::Cl₂H₂CaO₄
::natriumamid#::NaNH₂
::al#::aluminium
::al3+#::aluminiumion
::albr3#::aluminiumbromid
::al4c3#::aluminiumcarbid
::alcl3#::aluminiumchlorid
::alcl36h2o#::aluminiumchlorid-vand(1/6)
::alf3#::aluminiumfluorid
::aloh3#::aluminiumhydroxid
::alno339h2o#::aluminiumnitrat-vand(1/9)
::al2o3#::aluminiumoxid
::alpo4#::aluminiumphosphat
::al2so43#::aluminiumsulfat
::sb#::antimon
::sbcl3#::antimon(III)chlorid
::sbcl5#::antimon(V)chlorid
::sbh3#::antimon(III)hydrid
::sb2o3#::antimon(III)oxid
::sb2o5#::antimon(V)oxid
::sbocl#::antimon(III)chloridoxid
::sb2s3#::antimon(III)sulfid
::sb2s5#::antimon(V)sulfid
::h3sbo4#::antimonsyre
::ar#::argon
::as#::arsen
::as4#::tetraarsen
::ascl3#::arsen(III)chlorid
::ash3#::arsen(III)hydrid
::as2o3#::arsen(III)oxid
::as2o5#::arsen(V)oxid
::as2s3#::arsen(III)sulfid
::h3aso4#::arsensyre
::aso43-#::arsenat
::ba#::barium
::ba2+#::bariumion
::babr2#::bariumbromid
::baco3#::bariumcarbonat
::bacl2#::bariumchlorid
::bacl22h2o#::bariumchlorid-vand(1/2)
::bacro4#::bariumchromat
::bah2#::bariumhydrid
::baoh2#::bariumhydroxid
::baoh28h2o#::bariumhydroxid-vand(1/8)
::bano32#::bariumnitrat
::bao#::bariumoxid
::bao2#::bariumperoxid
::baso4#::bariumsulfat
::be#::beryllium
::be2+#::beryllium(II)ion
::becl2#::berylliumchlorid
::beno323h2o#::berylliumnitrat-vand(1/3)
::beo#::berylliumoxid
::beso44h2o#::berylliumsulfat-vand(1/4)
::bi#::bismuth
::bicl3#::bismuth(III)chlorid
::bicl4#::bismuth(IV)chlorid
::bino335h2o#::bismuth(III)nitrat-vand(1/5)
::biocl#::bismuth(III)oxidchlorid
::pb#::bly
::pb2+#::bly(II)ion
::pbn32#::bly(II)azid
::pbbr2#::bly(II)bromid
::pbcl2#::bly(II)chlorid
::pbcl4#::bly(IV)chlorid
::pbcro4#::bly(II)chromat
::pboh2#::bly(II)hydroxid
::pbi2#::bly(II)iodid
::pbno32#::bly(II)nitrat
::pbo#::bly(II)oxid
::pbo2#::bly(IV)oxid
::pb3o4#::bly(II,IV)oxid
::pbs#::bly(II)sulfid
::pbso4#::bly(II)sulfat
::pbc2h54#::tetraethylplumban
::pbch34#::tetramethylplumban
::b#::bor
::bn#::bornitrid
::b2o3#::dibortrioxid
::h3bo3#::borsyre
::h2bo3-#::dihydrogenborat
::bf3#::abortrifluorid
::b2h6#::diboran
::b5h9#::pentaboran
::br#::brom
::br2#::dibrom
::bro3-#::bromat
::br-#::bromid
::hbr#::hydrogenbromid
::cd#::cadmium
::cdbr2#::cadmiumbromid
::cdbr24h2o#::cadmiumbromid-vand(1/4)
::cdcl2#::cadmiumchlorid
::cdoh2#::cadmiumhydroxid
::cdi2#::cadmiumiodid
::cdo#::cadmiumoxid
::cdso4#::cadmiumsulfat
::cds#::cadmiumsulfid
::ca#::calcium
::ca2+#::calciumion
::caal2si2o8#::calciumaluminiumsilikat
::cabr2#::calciumbromid
::cac2#::calciumdicarbid
::caco3#::kalk
::cacl2#::calciumchlorid
::cacl26h2o#::calciumchlorid-vand(1/6)
::caf2#::calciumfluorid
::cah2#::calciumhydrid
::cahpo42h2o#::calciumhydrogenphosphat-vand(1/2)
::caoh2#::calciumhydroxid
::ca5po43oh#::calciumhydroxidphosphat
::cai2#::calciumiodid
::cano32#::calciumnitrat
::ca3n2#::calciumnitrid
::c2o4ca#::calciumoxalat
::c2o4cah2o#::calciumoxalat-vand(1/1)
::cao#::calciumoxid
::cao2#::calciumperoxid
::ca3po42#::calciumphosphat
::caso4#::calciumsulfat
::caso4½h2o#::calciumsulfat-vand(2/1)
::caso42h2o#::calciumsulfat-vand(1/2)
::cas#::calciumsulfid
::c#::carbon
::c2#::dicarbon
::c#::grafit
::c60#::buckminsterfulleren
::co2#::carbondioxid
::h2co3#::kulsyre
::hco3-#::hydrogencarbonat
::co32-#::carbonat
::cs2#::carbondisulfid
::co#::carbonmonoxid
::cocl2#::carbonyldichlorid
::cos#::carbonylsulfid
::hcn#::hydrogencyanid
::cn-#::cyanid
::ocn-#::cyanat
::cn2#::dicyan
::scn-#::thiocyanat
::ce#::cerium
::cecl3#::cerium(III)chlorid
::ceno336h2o#::cerium(III)nitrat-vand(1/6)
::ce2o3#::cerium(III)oxid
::ce2so43#::cerium(III)sulfat
::ceso42#::cerium(IV)sulfat
::cl#::chlor
::cl2#::dichlor
::cl-#::chlorid
::clo2#::chlordioxid
::cl2o#::dichloroxid
::hcl#::hydrogenchlorid
::cl2o7#::dichlorheptoxid
::hclo3#::chlorsyre
::clo3-#::chlorat
::hclo2#::chlorsyrling
::clo2-#::chlorit
::hclo#::hypochlorsyrling
::clo-#::hypochlorit
::hclo4#::perchlorsyre
::clo4-#::perchlorat
::cr#::chrom
::cr2+#::chrom(II)ion
::cr3+#::chrom(III)ion
::cro42-#::chromat
::h2cro4#::chromsyre
::crcl2#::chrom(II)chlorid
::crcl3#::chrom(III)chlorid
::crcl36h2o#::chrom(III)chlorid-vand(1/6)
::cro#::chrom(II)oxid
::cr2o3#::chrom(III)oxid
::cro2#::chrom(IV)oxid
::cro3#::chrom(VI)oxid
::cro2cl2#::chrom(VI)dichloriddioxid
::cr2so43#::chrom(III)sulfat
::crco6#::hexacarbonylchrom
::co#::cobalt
::co2+#::cobalt(II)ion
::coco3#::cobalt(II)carbonat
::cocl2#::cobalt(II)chlorid
::cocl22h2o#::cobalt(II)chlorid-vand(1/2)
::cocl26h2o#::cobalt(II)chlorid-vand(1/6)
::cocl3#::cobalt(III)chlorid
::cooh2#::cobalt(II)hydroxid
::cono326h2o#::cobalt(II)nitrat-vand(1/6)
::coo#::cobalt(II)oxid
::co2o3#::cobalt(III)oxid
::co3o4#::cobalt(II,III)oxid
::coso4#::cobalt(II)sulfat
::coso47h2o#::cobalt(II)sulfat-vand(1/7)
::cs#::cæsium
::csbr#::cæsiumbromid
::cscl#::cæsiumchlorid
::csf#::cæsiumfluorid
::csh#::cæsiumhydrid
::csoh#::cæsiumhydroxid
::csi#::cæsiumiodid
::cs2o#::cæsiumoxid
::f#::fluor
::f2#::difluor
::f-#::fluorid
::f2o#::difluoroxid
::hf#::hydrogenfluorid
::ge#::germanium
::geh4#::germaniumhydrid
::ge2h6#::digerman
::geo2#::germaniumoxid
::au#::guld
::aucl#::guld(I)chlorid
::aucl3#::guld(III)chlorid
::he#::helium
::h#::hydrogen
::h2#::dihydrogen
::h+#::hydron
::h-#::hydrid
::d2o#::deuterium
::h3o+#::oxonium
::i#::iod
::i2#::diiod
::i-#::iodid
::hi#::hydrogeniodid
::hio3#::iodsyre
::io3-#::iodat
::in3#::iodazid
::ibr#::iodbromid
::icl#::iodchlorid
::icl3#::iodtrichlorid
::i2o5#::diiodpentoxid
::fe#::jern
::fe2+#::jern(II)ion
::fe3+#::jern(III)ion
::fe3c#::jerncarbid
::feco3#::jern(II)carbonat
::fecl2#::jern(II)chlorid
::fecl22h2o#::jern(II)chlorid-vand(1/2)
::fecl24h2o#::jern(II)chlorid-vand(1/4)
::fecl3#::jern(III)chlorid
::fecl36h2o#::jern(III)chlorid-vand(1/6)
::fes2#::jern(II)disulfid
::feno339h2o#::jern(III)nitrat-vand(1/9)
::feo#::jern(II)oxid
::fe0.947o#::wustit
::fe2o3#::jern(III)oxid
::fe3o4#::jern(II,III)oxid
::fepo42h2o#::jern(III)phosphat-vand(1/2)
::fes#::jern(II)sulfid
::fe2s3#::jern(III)sulfid
::feso47h2o#::jern(II)sulfat-vand(1/7)
::fe2so43#::jern(III)sulfat
::feco5#::pentacarbonyljern
::fec5h52#::ferrocen
::k#::kalium
::k+#::kaliumion
::kbro3#::kaliumbromat
::kbr#::kaliumbromid
::k2co3#::kaliumcarbonat
::kclo3#::kaliumchlorat
::kcl#::kaliumchlorid
::k2cro4#::kaliumchromat
::kcn#::kaliumcyanid
::kocn#::kaliumcyanat
::k2cr2o7#::kaliumdichromat
::kh2po4#::kaliumdihydrogenphosphat
::kf#::kaliumfluorid
::k3fecn6#::kaliumhexacyanoferrat(III)
::kh#::kaliumhydrid
::khco3#::kaliumhydrogencarbonat
::khf2#::kaliumhydrogendifluorid
::koh#::kaliumhydroxid
::kio3#::kaliumiodat
::ki#::kaliumiodid
::k2mno4#::kaliummanganat
::kno3#::kaliumnitrat
::kno2#::kaliumnitrit
::k2o#::kaliumoxid
::kclo4#::kaliumperchlorat
::kio4#::kaliumperiodat
::kmno4#::kaliumpermanganat
::k2o2#::kaliumperoxid
::k2o3sooso3#::kaliumperoxodisulfat
::k2s2o7#::kaliumdisulfat
::ko2#::kaliumdioxid
::k2so4#::kaliumsulfat
::k2s#::kaliumsulfid
::kscn#::kaliumthiocyanat
::cu#::kobber
::cu+#::kobber(I)ion
::cu2+#::kobber(II)ion
::cu2oh2co3#::kobber(II)dihydroxidcarbonat
::cu3oh2co32#::kobber(II)dihydroxiddicarbonat
::cucl#::kobber(I)chlorid
::cucl2#::kobber(II)chlorid
::cucl22h2o#::kobber(II)chlorid-vand(1/2)
::cuoh2#::kobber(II)hydroxid
::cui#::kobber(I)iodid
::cuno323h2o#::kobber(II)nitrat-vand(1/3)
::cu2o#::kobber(I)oxid
::cuo#::kobber(II)oxid
::cu2so4#::kobber(I)sulfat
::cuso4#::kobber(II)sulfat
::cuso45h2o#::kobber(II)sulfat-vand(1/5)
::cu2s#::kobber(I)sulfid
::cus#::kobber(II)sulfid
::kr#::krypton
::krf2#::kryptondifluorid
::hg#::kviksølv
::hg22+#::dikviksølv
::hg2+#::kviksølv(II)ion
::hg2br2#::dikviksølvbromid
::hgbr2#::kviksølv(II)bromid
::hg2cl2#::dikviksølvchlorid
::hgcl2#::kviksølv(II)chlorid
::hg2i2#::dikviksølviodid
::hgi2#::kviksølv(II)iodid
::hgno32½h2o#::kviksølv(II)nitrat-vand(2/1)
::hg2o#::dikviksølvoxid
::hgo#::kviksølv(II)oxid
::hgs#::kviksølv(II)sulfid
::hg2so4#::dikviksølvsulfat
::li#::lithium
::li+#::lithiumion
::lialh4#::lithiumaluminiumhydrid
::libh4#::lithiumborhydrid
::libr#::lithiumbromid
::li2co3#::lithiumcarbonat
::licl#::lithiumchlorid
::lif#::lithiumfluorid
::lih#::lithiumhydrid
::lioh#::lithiumhydroxid
::lii#::lithiumiodid
::li2o#::lithiumoxid
::li2so4h2o#::lithiumsulfat-vand(1/1)
::mg#::magnesium
::mg2+#::magnesiumion
::mgbr2#::magnesiumbromid
::mgco3#::magnesiumcarbonat
::mgcl2#::magnesiumchlorid
::mgcl26h2o#::magnesiumchlorid-vand(1/6)
::mgoh2#::magnesiumhydroxid
::mgi2#::magnesiumiodid
::mgno32#::magnesiumnitrat
::mgno326h2o#::magnesiumnitrat-vand(1/6)
::mg3n2#::magnesiumnitrid
::mgo#::magnesiumoxid
::mgclo42#::magnesiumperchlorat
::mgso4#::magnesiumsulfat
::mgso47h2o#::magnesiumsulfat-vand(1/7)
::mgs#::magnesiumsulfid
::mn#::mangan
::mn2+#::mangan(II)ion
::mn3+#::mangan(III)ion
::mno4-#::permanganat
::mnco3#::mangan(II)carbonat
::mncl24h2o#::mangan(II)chlorid-vand(1/4)
::mnooh#::mangan(III)oxidhydroxid
::mnoh2#::mangan(II)hydroxid
::mn3o4#::mangan(II)dimangan(III)oxid
::mno#::mangan(II)oxid
::mn2o3#::mangan(III)oxid
::mno2#::mangan(IV)oxid
::mnso4#::mangan(II)sulfat
::mns#::mangan(II)sulfid
::mn2co10#::pentacarbonylmangan(dimer)
::mo#::molybdæn
::moo2#::molybdæn(IV)oxid
::moo3#::molybdæn(VI)oxid
::h2moo4h2o#::molybdænsyre-vand(1/1)
::moco6#::hexacarbonylmolybdæn
::na#::natrium
::na+#::natriumion
::nanh2#::natriumamin
::naaso2#::natriumarsenit
::nan3#::natriumazid
::c6h5-coona#::natriumbenzoat
::na2b4o7#::natriumtetraborat
::nabh4#::natriumborhydrid
::nabr#::natriumbromid
::nabr2h2o#::natriumbromid-vand(1/2)
::nabro3#::natriumbromat
::na2co3#::natriumcarbonat
::naclo3#::natriumchlorat
::nacl#::natriumchlorid
::naclo2#::natriumchlorit
::nah2po4h2o#::natriumdihydrogenphosphat-vand(1/1)
::ch3ch2ona#::natriumethanolat
::naf#::natriumfluorid
::hcoona#::natriumformiat
::na3cono26#::natriumhexanitrocobaltat
::na3alf6#::natriumhexafluoroaluminat
::napo36#::natriumhexametaphosphat
::nah#::natriumhydrid
::nahco3#::natriumhydrogencarbonat
::nahso4#::natriumhydrogensulfat
::nahs#::natriumhydrogensulfid
::nahso3#::natriumhydrogensulfit
::naoh#::natriumhydroxid
::naio3#::natriumiodat
::nai#::natriumiodid
::nai2h2o#::natriumiodid-vand(1/2)
::ch3ona#::natriummethanolat
::nano3#::natriumnitrat
::na3n#::natriumnitrid
::nano2#::natriumnitrit
::na2c2o4#::natriumoxalat
::na2o#::natriumoxid
::naclo4#::natriumperchlorat
::na2o2#::natriumperoxid
::na2s2o8#::natriumperoxodisulfat
::na2s2o5#::natriumdisulfit
::na2sio3#::natriumsilikat
::na2so4#::natriumsulfat
::na2s#::natriumsulfid
::na2so3#::natriumsulfit
::na2s2o3#::natriumthiosulfat
::na5p3o10#::natriumtriphosphat
::w2o42h2o#::natriumwolframat-vand(1/2)
::ne#::neon
::ni#::nikkel
::ni2+#::nikkel(II)ionion
::nibr2#::nikkelbromid
::nicl2#::nikkel(II)chlorid
::nicl26h2o#::nikkel(II)chlorid-vand/1/6)
::nioh2#::nikkel(II)hydroxid
::nino326h2o#::nikkel(II)nitrat-vand(1/6)
::nio#::nikkel(II)oxid
::niso4#::nikkel(II)sulfat
::niso46h2o#::nikkel(II)sulfat-vand(1/6)
::nis#::nikkelsulfid
::nico4#::tetracarbonylnikkel
::n#::nitrogen
::n2#::dinitrogen
::no2#::nitrogendioxid
::no#::nitrogenoxid
::n2o#::dinitrogenoxid
::n2o4#::dinitrogentetraoxid
::n2o3#::dinitrogentrioxid
::n2o5#::dinitrogenpentaoxid
::nh3#::ammoniak
::nh4+#::ammonium
::nh4cl#::ammoniumchlorid
::nh42cro4#::ammoniumchromat
::nh42cr2o7#::ammoniumdichromat
::nh4hco3#::ammoniumhydrogencarbonat
::nh4hs#::ammoniumhydrogensulfid
::nh4hso4#::ammoniumhydrogensulfat
::nh42moo4#::ammoniummolybdat
::nh4no3#::ammoniumnitrat
::nh4no2#::ammoniumnitrit
::nh42s2o8#::ammoniumperoxodisulfat
::nh42so4#::ammoniumsulfat
::nh4scn#::ammoniumthiocyanat
::nh4vo3#::ammoniumvanadat
::nh2nh2#::hydrazin
::nh2-nh3cl#::hydrazinchlorid
::hn3#::hydrogenazid
::nh2oh#::hydroxylamin
::nh3ohcl#::hydroxylammoniumchlorid
::nh3oh2so4#::hydroxylammoniumsulfat
::no3-#::nitrat
::no2-#::nitrit
::oncl#::chloridooxidonitrogen
::hno3#::salpetersyre
::hno2#::salpetersyrling
::o#::oxygen
::o2#::dioxygen
::o3#::trioxygen
::o2-#::oxid
::h2o#::vand
::d2o#::tungtvand
::o22-#::peroxid
::h2o2#::hydrogenperoxid
::oh-#::hydroxid
::p4#::phosphor
::p#::phosphor
::p4#::tetraphosphor
::ph3#::phosphortrihydrid
::p4o10#::phosphorpentahydrid(dimer)
::pcl5#::phosphorpentachlorid
::h3po4#::phosphorsyre
::h2po4-#::dihydrogenphosphat
::hpo42-#::hydrogenphosphat
::po43-#::phosphat
::h3po3#::phosphorsyrling
::hpo3n#::metaphosphorsyre
::pbr3#::phosphortribromid
::pcl3#::phosphortrichlorid
::pt#::platin
::ptcl2#::platin(II)chlorid
::rb#::rubidium
::rbcl#::rubiddiumchlorid
::se#::selen
::h2se#::selenhydrid
::seo2#::selendioxid
::h2seo4#::selensyre
::si#::silicium
::sic#::siliciumcarbid
::sio2#::siliciumdioxid
::sih4#::siliciumhydrid
::sicl4#::siliciumtetrachlorid
::sif4#::siliciumtetrafluorid
::sr#::strontium
::sr2+#::strontium(II)ion
::srco3#::strontiumcarbonat
::srcl2#::strontiumchlorid
::srcro4#::strontiumchromat
::sroh2#::strontiumhydroxid
::sroh28h2o#::strontiumhydroxid-vand(1/8)
::srno32#::strontiumnitrat
::sro#::strontiumoxid
::srso4#::strontiumsulfat
::s#::svovl
::s8#::svovlrhombisk
::s#::svovlmonoklin
::s2#::disvovl
::s8#::octasvovl
::so2#::svovldioxid
::h2so3#::svovlsyrling
::hso3-#::hydrogensulfit
::so32-#::sulfit
::h2s#::dihydrogensulfid
::hs-#::hydrogensulfid
::s2-#::sulfid
::h2s2o8#::peroxodisvovlsyre
::h2so4#::svovlsyre
::hso4-#::hydrogensulfat
::so42-#::sulfat
::so2cl2#::sulfurylchlorid
::so3#::svovltrioxid
::socl2#::thionylchlorid
::h2nso3h#::sulfamidsyre
::s2o32-#::thiosulfat
::clso3h#::chlorsulfonsyre
::sf6#::svovlhexafluorid
::ag#::sølv
::ag+#::sølvion
::agbro3#::sølvbromat
::agbr#::sølvbromid
::ag2co3#::sølvcarbonat
::agcl#::sølvchlorid
::ag2cro4#::sølvchromat
::agcn#::sølvcyanid
::agf#::sølvfluorid
::agio3#::sølviodat
::agi#::sølviodid
::agno3#::sølvnitrat
::ag3po4#::sølvphosphat
::ag2o#::sølv(I)oxid
::ago#::sølv(II)oxid
::ag2so4#::sølvsulfat
::ag2s#::sølvsulfid
::th#::thorium
::thno34#::thor(IV)nitrat
::tho2#::thor(IV)oxid
::sn#::tin
::sn2+#::tin(II)ion
::sn4+#::tin(IV)ion
::sncl22h2o#::tin(II)chlorid-vand(1/2)
::sncl4#::tin(IV)chlorid
::snh4#::tin(IV)hydrid
::snoh2#::tin(II)hydroxid
::sno#::tin(II)oxid
::sno2#::tin(IV)oxid
::snso4#::tin(II)sulfat
::sns#::tin(II)sulfid
::sns2#::tin(IV)sulfid
::ti#::titan
::tic#::titancarbid
::ticl2#::titan(II)chlorid
::ticl3#::titan(III)chlorid
::ticl4#::titan(IV)chlorid
::tio2#::titan(IV)oxid
::u#::uran
::u3o8#::uran(IV)diuran(VI)oxid
::uf6#::uranhexafluorid
::uo2#::uran(IV)oxid
::uo3#::uran(VI)oxid
::uo2so43h2o#::uranylsulfat-vand(1/3)
::v#::vanadium
::v2o3#::vanadium(III)oxid
::v2o5#::vanadium(V)oxid
::v2so43#::vanadium(III)sulfat
::voso4#::vanadium(IV)oxysulfat
::vco6#::hexacarbonylvanadium
::w#::wolfram
::wc#::wolframcarbid
::wo3#::wolfram(VI)oxid
::wf6#::wolframhexafluorid
::xe#::xenon
::xeo3#::xenontrioxid
::xeo4#::xenontetraoxid
::xef2#::xenondifluorid
::xef4#::xenontetrafluorid
::xef6#::xenonhexafluorid
::zn#::zink
::zn2+#::zinkion
::znbr2#::zinkbromid
::znco3#::zinkcarbonat
::zncl2#::zinkchlorid
::znoh2#::zinkhydroxid
::zni2#::zinkiodid
::znno326h2o#::zinknitrat-vand(1/6)
::zno#::zinkoxid
::znso4#::zinksulfat
::znso47h2o#::zinksulfat-vand(1/7)
::zns#::zinksulfid
::zr#::zirkonium
::zrcl4#::zirkonium(IV)chlorid
::zro2#::zirkonium(IV)oxid
::zrocl28h2o#::zirkonylchlorid-vand(1/8)
::ch4#::methan
::c2h6#::ethan
::c3h8#::propan
::c4h10#::butan
::c5h12#::pentan
::c6h14#::hexan
::ch3ch24ch3#::hexan
::c7h16#::heptan
::ch3ch25ch3#::heptan
::c8h18#::octan
::ch3ch26ch3#::octan
::c9h20#::nonan
::c10h22#::decan
::ch3ch29ch3#::undecan
::ch33ch#::2-methylpropan
::cch34#::2,2-dimethylpropan
::ch2chch322#::2,4-dimethylpentan
::c3h6#::cyclopropan
::c4h8#::cyclobutan
::c5h10#::cyclopentan
::c6h12#::cyclohexan
::c6h11ch3#::methylcyclohexan
::ch32c6h10#::1,1-dimethylcyclohexan
::ch2=ch2#::ethen
::ch2=chch3#::propen
::ch2=c=ch2#::propadien
::c3h4#::cyclopropen
::c4h6#::cyclobuten
::c6h8#::cyclohexa-1,3-dien
::c6h10#::cyclohexen
::c10h16#::α-pinen
::c40h56#::caroten
::c2h2#::ethyn
::hc≡ch#::ethyn
::hc≡cch3#::propyn
::hc≡cch2ch3#::but-1-yn
::ch3c≡cch3#::but-2-yn
::hc≡c-c≡ch#::buta-1,3-diyn
::c6h6#::benzen
::c10h8#::naphthalen
::c14h10#::anthracen
::c18h12#::1,2-benzoanthracen
::c20h12#::benzopyren
::c6h5ch3#::methylbenzen
::c6h5ch=ch2#::ethenylbenzen
::c6h4ch32#::1,2-dimethylbenzen
::c6h5ch2ch3#::ethylbenzen
::c6h5chch32#::(1-methylethyl)benzen
::c6h5-c6h5#::biphenyl
::ch3cl#::chlormethan
::chcl=ch2#::chlorethen
::ch3ch2cl#::chlorethan
::ch3chclch3#::2-chlorpropan
::ch2cl2#::dichlormethan
::ch33ccl#::2-chlor-2-methylpropan
::ch2=ccl2#::1,1-dichlorethen
::chcl=chcl#::(Z)-1,2-dichlorethen
::ch3chcl2#::1,1-dichlorethan
::ch2clch2cl#::1,2-dichlorethan
::c6h5cl#::chlorbenzen
::chcl3#::trichlormethan
::ccl2=chcl#::1,1,2-trichlorethen
::ch3ccl3#::1,1,1-trichlorethan
::ch2clchcl2#::1,1,2-trichlorethan
::c6h4cl2#::1,2-dichlorbenzen
::ccl4#::tetrachlormethan
::ccl3ccl3#::hexachlorethan
::c6cl6#::hexachlorbenzen
::c6h6cl6#::1,2,3,4,5,6-hexachlorcyclohexan
::c14h9cl5#::1,1,1-trichlor-2,2-bis(4-chlorphenyl)ethan
::chclf2#::chlordifluormethan
::cf4#::tetrafluormethan
::cf2=cf2#::tetrafluorethen
::chcl2f#::dichlorfluormethan
::cclf3#::chlortrifluormethan
::ccl2f2#::dichlordifluormethan
::cf3chcl2#::2,2-dichlor-1,1,1-trifluorethan
::cfcl2cfcl2#::1,1,2,2-tetrachlor-1,2-difluorethan
::ch3br#::brommethan
::ch3ch2br#::bromethan
::ch3chbrch3#::2-brompropan
::ch33cbr#::2-brom-2-methylpropan
::c6h5br#::brombenzen
::ch2br2#::dibrommethan
::chbr=chbr#::(Z)-1,2-dibromethen
::ch3chbr2#::1,1-dibromethan
::ch2brch2br#::1,2-dibromethan
::c6h4br2#::1,2-dibrombenzen
::chbr3#::tribrommethan
::cbr4#::tetrabrommethan
::chbr2chbr2#::1,1,2,2-tetrabromethan
::ch3i#::iodmethan
::ch3ch2i#::iodethan
::ch3ch2chi#::1-iodpropan
::ch3chich3#::2-iodpropan
::ch33ci#::2-iod-2-methylpropan
::c6h5i#::iodbenzen
::ch2i2#::diiodmethan
::chi2ch3#::1,1-diiodethan
::ch2ich2i#::1,2-diiodethan
::chi3#::triiodmethan
::ci4#::tetraiodmethan
::ch3nh2#::methanamin
::ch32nh#::dimethylamin
::ch3ch2nh2#::ethanamin
::ch32nh2+#::dimethylammonium
::ch33n#::trimethylamin
::h2nch22nh2#::ethan-1,2-diamin
::ch3ch22nh#::diethylamin
::h2nch23nh2#::propan-1,3-diamin
::c5h5n#::pyridin
::h2nch24nh2#::butan-1,4-diamin
::c6h5nh2#::benzenamin
::ch3ch23n#::triethylamin
::ch3c6h4nh2#::2-methylbenzenamin
::c6h5nhch3#::n-methyl-benzenamin
::c6h5nhnh2#::phenylhydrazin
::ch34ncl#::tetramethylammoniumchlorid
::nch2ch23n#::DABCO
::h2nch26nh2#::hexan-1,6-diamin
::c6h5nch32#::n,n-dimethylbenzenamin
::c6h5nh3cl#::aniliniumchlorid
::c10h15n#::methamphetamin
::c10h14n2#::nicotin
::c5h4n4o3#::urinsyre
::c6h52nh#::diphenylamin
::c6h53n#::triphenylamin
::c8h10o2n4#::coffein
::c17h21no4#::cocain
::c20h24o2n2#::quinin
::c4h7n3o#::creatinin
::c4h5n3o#::cytosin
::c4h4n2o2#::uracil
::c5h6n2o2#::thymin
::c5h5n5#::adenin
::c5h6n5+#::adeninium
::c5h4n5-#::adeninion
::c5h5n5o#::guanin
::c10h13o4n5#::adenosin
::c10h13n5o5#::guanosin
::c9h13n3o5#::cytidin
::c9h12n2o6#::uridin
::ch3oh#::methanol
::ch3ch2oh#::ethanol
::ch3chohch3#::propan-2-ol
::ch2ohch2oh#::ethan-1,2-diol
::ch33coh#::2-methylpropan-2-ol
::c6h11oh#::cyclohexanol
::c6h5-ch2oh#::benzylalkohol
::c6h5oh#::phenol
::o=c6h4=o#::benzen-1,4-quinon
::ch3c6h4oh#::2-methylphenol
::c6h4oh2#::1,2-dihydroxybenzen
::c6h3oh3#::1,3,5-trihydroxybenzen
::clc6h4oh#::2-chlorphenol
::hoc6h4no2#::2-nitrophenol
::c10h7oh#::1-naphthol
::c12h10o4#::quinhydron
::hoc6h2no23#::2,4,6-trinitrophenol
::c2h4o#::ethylenoxid
::ch32o#::dimethylether
::ch3och2ch3#::ethyl(methyl)ether
::c4h4o#::furan
::ch24o#::tetrahydrofuran
::ch3ch22o#::diethylether
::ch33coch3#::2-methoxy-2-methylpropan
::-ch2och22-#::1,4-dioxan
::hoch2ch22o#::bis(2-hydroxyethyl)ether
::ch3oc6h5#::methoxybenzen
::c9h6o2#::cumarin
::c6h52o#::diphenylether
::c11h12o3#::myristicin
::c6h5ch22o#::dibenzylether
::c12h24o6#::kroneether
::hcho#::methanal
::-ch2-o3#::1,3,5-trioxan
::ch3cho#::ethanal
::-chch3-o3-#::paraldehyd
::h-co-co-h#::ethandial
::ch3ch2cho#::propanal
::ch2=chcho#::propenal
::ch3ch22cho#::butanal
::ch32chcho#::2-methylpropanal
::ch3ch23cho#::pentanal
::ch33ccho#::2,2-dimethylpropanal
::c7h6o#::benzaldehyd
::c6h5cho#::benzaldehyd
::c20h28o#::retinal
::ch2=c=o#::ethenon
::ch32co#::propanon
::ch3cococh3#::butan-2,3-dion
::ch3ch22co#::pentan-3-on
::c6h10o#::cyclohexanon
::c6h5coch3#::1-phenylethan-1-on
::c5h4ncoch3#::1-(3-pyridyl)ethanon
::c10h14o#::carvon
::c10h16o#::d-campher
::c6h8o6#::ascorbinsyre
::c9h6o4#::ninhydrin
::c6h5coc6h5#::benzophenon
::c13h20o#::β-iononen
::c17h19o3n#::piperin
::c19h28o2#::testosteron
::c18h27o3n#::capsaicin
::c5h10o5#::α-d-arabinose
::c5h10o4#::d-2-deoxyribose
::c6h12o6#::α-l-glucose
::c6h12o6h2o#::α-d-glucose,monohydrat
::c6h12o6#::β-d-glucose
::c12h22o11#::α-lactose
::c12h22o11#::α-maltose
::c12h22o11#::saccharose
::c6h10o5n#::stivelse
::hcooh#::methansyre
::hcoo-#::methanoat
::ch3cooh#::ethansyre
::ch3coo-#::ethanoat
::ch2=chcooh#::propensyre
::ch3ch2cooh#::propansyre
::ch3coooh#::peroxyethansyre
::ch2ohcooh#::2-hydroxyethansyre
::ch2ohcoo-#::2-hydroxyethanoat
::ch2fcooh#::fluorethansyre
::ch3cocooh#::2-oxopropansyre
::ch3cocoo-#::2-oxopropanoat
::ch32chcooh#::2-methylpropansyre
::cooh2#::ethandisyre
::ch2clcooh#::chlorethansyre
::cch33cooh#::2,2-dimethylpropansyre
::ch2cooh2#::propandisyre
::ch2cooh2#::butandisyre
::chohcooh2#::2-hydroxypropandisyre
::c7h6o2#::benzoesyre
::chcl2cooh#::dichlorethansyre
::ch2brcooh#::bromethansyre
::ccl3cooh#::trichlorethansyre
::ch2icooh#::iodethansyre
::c6h8o7#::citronsyre
::c6h8o7h2o#::citronsyremonohydrat
::c6h7o7-#::dihydrogencitrat
::c6h6o72-#::hydrogencitrat
::c6h5o73-#::citrat
::c6h8o7#::d-isocitronsyre
::c6h7o7-#::d-dihydrogenisocitrat
::c6h6o72-#::d-hydrogenisocitrat
::c6h5o73-#::d-isocitrat
::c18h30o2#::(9Z,12Z,15Z)-octadeca-9,12,15-triensyre
::c18h32o2#::(9Z,12Z)-octadeca-9,12-diensyre
::ch3c=o2o#::ethansyreanhydrid
::c6h4c=o2o#::phthalsyreanhydrid
::c6h5c=o2o#::benzoesyreanhydrid
::ch3c=ocl#::ethanoylchlorid
::c=ocl2#::carbonylchlorid
::ch3c=obr#::ethanoylbromid
::c6h5c=ocl#::benzoylchlorid
::hc=onh2#::methanamid
::ch3c=onh2#::ethanamid
::c=onh22#::carbamid
::c6h5c=onh2#::benzamid
::hcn#::methannitril
::ch3-cn#::ethannitril
::ch2=ch-cn#::propennitril
::ch3ch2cn#::propannitril
::c6h5cn#::benzonitril
::nc-ch24-cn#::hexandinitril
::c2h3n#::methylisocyanid
::c7h5n#::phenylisocyanid
::hcooch3#::methylmethanoat
::hcooch2ch3#::ethylmethanoat
::ch3cooch3#::methylethanoat
::ch3ono2#::methylnitrat
::ch3ch2ono2#::ethylnitrat
::c6h5cooch3#::methylbenzoat
::c3h5n3o9#::glyceryltrinitrat
::c39h74o6#::glyceryltrilaurat
::c45h86o6#::glyceryltrimyristinat
::c51h98o6#::glyceryltripalmitat
::c57h110o6#::glyceryltristearat
::c57h104o6#::glyceryltrioleat
::c3h9o6p#::glyceryl-1-phosphorsyre
::c3h8o6p-#::glyceryl-1-hydrogenphosphat
::c3h7o6p2-#::glyceryl-1-phosphat
::c6h13o9p#::glucose-1-phosphorsyre
::c6h12o9p-#::glucose-1-hydrogenphosphat
::c6h11o9p2-#::glucose-1-phosphat
::c6h13o9p#::glucose-6-phosphorsyre
::c6h12o9p-#::glucose-6-hydrogenphosphat
::c6h11o9p2-#::glucose-6-phosphat
::nh2ch2cooh#::glycin
::nh2ch2coo-#::glycination
::c6h9n3o2#::l-histidin
::c6h13no2#::d-leucin
::c6h14n2o2#::d,l-lysin
::c5h9no2#::l-prolin
::c5h9no3#::4-hydroxyprolin
::-ch2-oh#::l-serin
::c11h12n2o2#::l-tryptophanw
::nh2chrcoo-#::l-valinat
::ch3no2#::nitromethan
::ch3ch2no2#::nitroethan
::ch32chno2#::2-nitropropan
::c6h5no2#::nitrobenzen
::ch3c6h4no2#::2-nitrotoluen
::c6h4no22#::1,2-dinitrobenzen
::ch3ch2sh#::ethanthiol
::ch3csnh2#::ethanthioamid
::ch3cosh#::ethanthiosyre
::ch32chsh#::propan-2-thiol
::ch32so#::dimethylsulfoxid
::c4h4s#::thiophen
::ch3ch22s#::diethylsulfid
::c6h5sh#::benzenthiol
::cich2ch22s#::bis-(1-chlorethyl)sulfid
::c6h5so3h#::benzensulfonsyre
::c6h52s#::diphenylsulfid
::c6h52so#::diphenylsulfoxid
::c6h52so2#::diphenylsulfon
::nh42co3#::ammoniumcarbonat
::alno33#::aluminiumnitrat
::ali3#::aluminiumiodid
::bai2#::bariumiodid
::c2h2o2#::ethyndiol
::c2h5oh#::ethanol2
::c2h5ona#::natriumethanoat2
::caso3#::calciumsulfit
::ch2oh2#::methandiol
::ch2choh#::ethenol
::ch2co#::keten
::ch2o#::methanal2
::ch3coona#::natriumethanoat
::ch3och3#::dimethylether2
::crno33#::chrom(II)nitrat
::cuno32#::kobber(II)nitrat
::feoh2#::jern(II)hydroxid
::k3po4#::kaliumphosphat
::lino3#::lithiumnitrat
::mnno32#::mangan(II)nitrat
::na2hpo3#::natriumhydrogenphosphit
::na2hpo4#::dinatriumhydrogenphosphat
::nah2po4#::natriumdihydrogenphosphat
::nh4oh#::ammoniumhydroxid
::ni3#::nitrogentriiodid
::no2+#::nitronium
::n3-#::nitrid
::crno32#::chrom(II)nitrat
::feno32#::jern(III)nitrit
::feso3#::jern(II)sulfit
::feso4#::jern(II)sulfat
::feno33#::jern(III)nitrat
::cono23#::cobalt(III)nitrit)
::nino32#::nikkel(II)nitrat
::cuno3#::kobber(II)nitrat
::cu3po4#::kobber(I)phosphat
::cui2#::kobber(II)iodid
::hgno32#::kviksølv(II)nitrat
::nh42s#::ammoniumsulfid
::nh4f#::ammoniumfluorid
::nh4i#::ammoniumiodid
::fescn2+#::thiocyanatojern(III)ion
::agn3#::sølvazid
::ba3n2#::bariumnitrid
::baso3#::bariumsulfit
::ch3cn#::acetonitril
::cubr2#::kobber(II)bromid
::cuf2#::kobber(II)flourid
::fei2#::jern(II)iodid
::fei3#::jern(III)iodid
::hbro3#::hydrogenbromat
::k2so3#::kaliumsulfit
::k3po3#::kaliumphophit
::kclo2#::kaliumchlorit
::li2s#::lithiumsulfid
::mgso3#::magnesiumsulfit
::na3po3#::natriumphophit
::na3po4#::natriumphosphat
::nh2cooh#::carbaminsyre
::nh4br#::ammoniumbromid
::zn3n2#::zinknitrid
::zn3p2#::zinkphosphid
::hbo32-#::hydrogenborat
::na3p#::natriumphosphid
::k3n#::kaliumnitrid
::k3p#::kaliumphosphid
::ba3p2#::bariumphosphid
::baf2#::bariumflourid
::fe3n2#::jern(II)nitrid
::fe3p2#::jern(II)phosphid
::fef3#::jern(III)flourid
::cuco3#::kobber(II)carbonat
::cuso3#::kobber(II)sulfit
::cu3n2#::kobber(II)nitrid
::cu3p2#::kobber(II)phosphid
::pbs2#::bly(IV)sulfid
::pbi4#::bly(IV)iodid
::c6h13br#::1-bromhexan
::c7h15br#::1-bromheptan
::cl2h2cao4#::calciummethanoat
::c4h8s#::3-methylthioprop-1-en
::feoh3#::jern(III)hydroxid
::nanh2#::natriumamid
::al(oh)3m#::M(Al(OH)₃) = 78,00 g/mol
::al2(so4)3m#::M(Al₂(SO₄)₃) = 342,15 g/mol
::ba(oh)2m#::M(Ba(OH)₂) = 171,34 g/mol
::ba(no3)2m#::M(Ba(NO₃)₂) = 261,34 g/mol
::bi(oh)3m#::M(Bi(OH)₃) = 260,00 g/mol
::pb(n3)2m#::M(Pb(N₃)₂) = 291,20 g/mol
::pb(oh)2m#::M(Pb(OH)₂) = 241,20 g/mol
::pb(no3)2m#::M(Pb(NO₃)₂) = 331,20 g/mol
::pb(c2h5)4m#::M(Pb(C₂H₅)₄) = 323,44 g/mol
::pb(ch3)4m#::M(Pb(CH₃)₄) = 267,33 g/mol
::cd(oh)2m#::M(Cd(OH)₂) = 146,41 g/mol
::cd(no3)2m#::M(Cd(NO₃)₂) = 236,41 g/mol
::ca(oh)2m#::M(Ca(OH)₂) = 74,09 g/mol
::ca(clo)2m#::M(Ca(ClO)₂) = 142,98 g/mol
::ca(no3)2m#::M(Ca(NO₃)₂) = 164,09 g/mol
::ca3(po4)2m#::M(Ca₃(PO₄)₂) = 310,18 g/mol
::(cn)2m#::M((CN)₂) = 52,04 g/mol
::ce2(so4)3m#::M(Ce₂(SO₄)₃) = 568,42 g/mol
::ce(so4)2m#::M(Ce(SO₄)₂) = 332,24 g/mol
::cr(oh)2m#::M(Cr(OH)₂) = 86,01 g/mol
::cr2(so4)3m#::M(Cr₂(SO₄)₃) = 392,18 g/mol
::cr(co)6m#::M(Cr(CO)₆) = 220,07 g/mol
::co(oh)2m#::M(Co(OH)₂) = 92,95 g/mol
::fe2(so4)3m#::M(Fe₂(SO₄)₃) = 399,88 g/mol
::fe(co)5m#::M(Fe(CO)₅) = 195,90 g/mol
::fe(c5h5)2m#::M(Fe(C₅H₅)₂) = 186,03 g/mol
::k3fe(cn)6m#::M(K₃Fe(CN)₆) = 329,24 g/mol
::cu(oh)2m#::M(Cu(OH)₂) = 97,56 g/mol
::mg(oh)2m#::M(Mg(OH)₂) = 58,32 g/mol
::mg(no3)2m#::M(Mg(NO₃)₂) = 148,31 g/mol
::mg(clo4)2m#::M(Mg(ClO₄)₂) = 223,21 g/mol
::mno(oh)m#::M(MnO(OH)) = 87,94 g/mol
::mn(oh)2m#::M(Mn(OH)₂) = 88,95 g/mol
::mn2(co)10m#::M(Mn₂(CO)₁₀) = 389,99 g/mol
::mo(oh)3m#::M(Mo(OH)₃) = 146,94 g/mol
::mo(co)6m#::M(Mo(CO)₆) = 264,00 g/mol
::nabr*2h2om#::M(NaBr∙2H₂O) = 138,93 g/mol
::(napo3)6m#::M((NaPO₃)₆) = 611,77 g/mol
::nai*2h2om#::M(NaI∙2H₂O) = 185,92 g/mol
::w2o4*2h2om#::M(W₂O₄∙2H₂O) = 329,85 g/mol
::ni(oh)2m#::M(Ni(OH)₂) = 92,71 g/mol
::ni(co)4m#::M(Ni(CO)₄) = 170,73 g/mol
::(nh4)2so4m#::M((NH₄)₂SO₄) = 132,14 g/mol
::(nh3oh)clm#::M((NH₃OH)Cl) = 69,49 g/mol
::(hpo3)nm#::M((HPO₃)n) = 79,98 g/mol
::sr(oh)2m#::M(Sr(OH)₂) = 121,64 g/mol
::sr(no3)2m#::M(Sr(NO₃)₂) = 211,63 g/mol
::th(no3)4m#::M(Th(NO₃)₄) = 480,06 g/mol
::sn(oh)2m#::M(Sn(OH)₂) = 152,73 g/mol
::v2(so4)3m#::M(V₂(SO₄)₃) = 390,07 g/mol
::v(co)6m#::M(V(CO)₆) = 219,00 g/mol
::zn(oh)2m#::M(Zn(OH)₂) = 99,41 g/mol
::(ch3)3chm#::M((CH₃)₃CH) = 58,12 g/mol
::c(ch3)4m#::M(C(CH₃)₄) = 72,15 g/mol
::(ch3)3cclm#::M((CH₃)₃CCl) = 92,57 g/mol
::(ch3)3cbrm#::M((CH₃)₃CBr) = 137,02 g/mol
::(ch3)3cim#::M((CH₃)₃CI) = 184,02 g/mol
::(ch3)2nhm#::M((CH₃)₂NH) = 45,09 g/mol
::(ch3)3nm#::M((CH₃)₃N) = 59,11 g/mol
::(ch3)4nclm#::M((CH₃)₄NCl) = 109,60 g/mol
::(c6h5)2nhm#::M((C₆H₅)₂NH) = 169,23 g/mol
::(c6h5)3nm#::M((C₆H₅)₃N) = 245,33 g/mol
::(ch3)3cohm#::M((CH₃)₃COH) = 74,12 g/mol
::c6h4(oh)2m#::M(C₆H₄(OH)₂) = 110,11 g/mol
::c6h3(oh)3m#::M(C₆H₃(OH)₃) = 126,11 g/mol
::(ch3)2om#::M((CH₃)₂O) = 46,07 g/mol
::(ch2)4om#::M((CH₂)₄O) = 72,11 g/mol
::(c6h5)2om#::M((C₆H₅)₂O) = 170,21 g/mol
::-(ch2-o)3m#::M(-(CH₂-O)₃) = 90,08 g/mol
::(ch3)2com#::M((CH₃)₂CO) = 58,08 g/mol
::(cooh)2m#::M((COOH)₂) = 90,04 g/mol
::c(=o)cl2m#::M(C(=O)Cl₂) = 98,92 g/mol
::hc(=o)nh2m#::M(HC(=O)NH₂) = 45,04 g/mol
::(ch3)2som#::M((CH₃)₂SO) = 78,13 g/mol
::(c6h5)2sm#::M((C₆H₅)₂S) = 186,28 g/mol
::(c6h5)2som#::M((C₆H₅)₂SO) = 202,28 g/mol
::(nh4)2co3m#::M((NH₄)₂CO₃) = 96,09 g/mol
::al(no3)3m#::M(Al(NO₃)₃) = 213,00 g/mol
::ch2(oh)2m#::M(CH₂(OH)₂) = 32,04 g/mol
::cr(no3)3m#::M(Cr(NO₃)₃) = 238,01 g/mol
::cu(no3)2m#::M(Cu(NO₃)₂) = 187,56 g/mol
::fe(oh)2m#::M(Fe(OH)₂) = 73,86 g/mol
::mn(no3)2m#::M(Mn(NO₃)₂) = 178,95 g/mol
::cr(no3)2m#::M(Cr(NO₃)₂) = 176,01 g/mol
::fe(no2)2m#::M(Fe(NO₂)₂) = 421,84 g/mol
::fe(no3)2m#::M(Fe(NO₃)₂) = 179,86 g/mol
::fe(no2)3m#::M(Fe(NO₂)₃) = 437,84 g/mol
::fe(no3)3m#::M(Fe(NO₃)₃) = 241,86 g/mol
::co(no2)3m#::M(Co(NO₂)₃) = 440,93 g/mol
::ni(no3)2m#::M(Ni(NO₃)₂) = 182,70 g/mol
::au(no3)3m#::M(Au(NO₃)₃) = 320,98 g/mol
::hg(no3)2m#::M(Hg(NO₃)₂) = 324,60 g/mol
::pb(no3)4m#::M(Pb(NO₃)₄) = 455,22 g/mol
::(nh4)2om#::M((NH₄)₂O) = 52,08 g/mol
::(nh4)2sm#::M((NH₄)₂S) = 68,14 g/mol
::(nh4)3nm#::M((NH₄)₃N) = 68,12 g/mol
::(nh4)3po4m#::M((NH₄)₃PO₄) = 149,09 g/mol
::mg(no2)2m#::M(Mg(NO₂)₂) = 116,32 g/mol
::pb(co3)2m#::M(Pb(CO₃)₂) = 327,22 g/mol
::ag(nh3)2+m#::M(Ag(NH₃)₂⁺) = 141,93 g/mol
::fe(oh)3m#::M(Fe(OH)₃) = 106,87 g/mol
::alm#::M(Al) = 26,98 g/mol
::al3+m#::M(Al³⁺) = 26,98 g/mol
::albr3m#::M(AlBr₃) = 266,69 g/mol
::al4c3m#::M(Al₄C₃) = 143,96 g/mol
::alcl3m#::M(AlCl₃) = 133,34 g/mol
::alcl36h2om#::M(AlCl₃∙6H₂O) = 241,43 g/mol
::alf3m#::M(AlF₃) = 83,98 g/mol
::aloh3m#::M(Al(OH)₃) = 78,00 g/mol
::alno339h2om#::M(Al(NO₃)₃∙9H₂O) = 375,13 g/mol
::al2o3m#::M(Al₂O₃) = 101,96 g/mol
::alpo4m#::M(AlPO₄) = 121,95 g/mol
::al2so43m#::M(Al₂(SO₄)₃) = 342,15 g/mol
::sbm#::M(Sb) = 121,76 g/mol
::sbcl3m#::M(SbCl₃) = 228,12 g/mol
::sbcl5m#::M(SbCl₅) = 299,02 g/mol
::sbh3m#::M(SbH₃) = 124,78 g/mol
::sb2o3m#::M(Sb₂O₃) = 291,52 g/mol
::sb2o5m#::M(Sb₂O₅) = 323,52 g/mol
::sboclm#::M(SbOCl) = 173,21 g/mol
::sb2s3m#::M(Sb₂S₃) = 339,72 g/mol
::sb2s5m#::M(Sb₂S₅) = 403,85 g/mol
::h3sbo4m#::M(H₃SbO₄) = 188,78 g/mol
::arm#::M(Ar) = 39,95 g/mol
::asm#::M(As) = 74,92 g/mol
::as4m#::M(As₄) = 299,69 g/mol
::ascl3m#::M(AsCl₃) = 181,28 g/mol
::ash3m#::M(AsH₃) = 77,95 g/mol
::as2o3m#::M(As₂O₃) = 197,84 g/mol
::as2o5m#::M(As₂O₅) = 229,84 g/mol
::as2s3m#::M(As₂S₃) = 246,04 g/mol
::h3aso4m#::M(H₃AsO₄) = 141,94 g/mol
::aso43-m#::M(AsO₄³⁻) = 138,92 g/mol
::bam#::M(Ba) = 137,33 g/mol
::ba2+m#::M(Ba²⁺) = 137,33 g/mol
::babr2m#::M(BaBr₂) = 297,14 g/mol
::baco3m#::M(BaCO₃) = 197,34 g/mol
::bacl2m#::M(BaCl₂) = 208,25 g/mol
::bacl22h2om#::M(BaCl₂∙2H₂O) = 244,23 g/mol
::bacro4m#::M(BaCrO₄) = 253,32 g/mol
::bah2m#::M(BaH₂) = 139,34 g/mol
::baoh2m#::M(Ba(OH)₂) = 171,34 g/mol
::baoh28h2om#::M(Ba(OH)₂∙8H₂O) = 315,46 g/mol
::bano32m#::M(Ba(NO₃)₂) = 261,34 g/mol
::baom#::M(BaO) = 153,33 g/mol
::bao2m#::M(BaO₂) = 169,33 g/mol
::baso4m#::M(BaSO₄) = 233,39 g/mol
::bem#::M(Be) = 9,01 g/mol
::be2+m#::M(Be²⁺) = 9,01 g/mol
::becl2m#::M(BeCl₂) = 79,92 g/mol
::beno323h2om#::M(Be(NO₃)₂∙3H₂O) = 187,07 g/mol
::beom#::M(BeO) = 25,01 g/mol
::beso44h2om#::M(BeSO₄∙4H₂O) = 177,14 g/mol
::bim#::M(Bi) = 208,98 g/mol
::bicl3m#::M(BiCl₃) = 315,34 g/mol
::bicl4m#::M(BiCl₄) = 350,79 g/mol
::bino335h2om#::M(Bi(NO₃)₃∙5H₂O) = 485,07 g/mol
::bioclm#::M(BiOCl) = 260,43 g/mol
::pbm#::M(Pb) = 207,2 g/mol
::pb2+m#::M(Pb²⁺) = 207,2 g/mol
::pbn32m#::M(Pb(N₃)₂) = 291,2 g/mol
::pbbr2m#::M(PbBr₂) = 367,00 g/mol
::pbcl2m#::M(PbCl₂) = 278,1 g/mol
::pbcl4m#::M(PbCl₄) = 349,00 g/mol
::pbcro4m#::M(PbCrO₄) = 323,2 g/mol
::pboh2m#::M(Pb(OH)₂) = 241,2 g/mol
::pbi2m#::M(PbI₂) = 461,00 gg/mol
::pbno32m#::M(Pb(NO₃)₂) = 331,2 g/mol
::pbom#::M(PbO) = 223,2 g/mol
::pbo2m#::M(PbO₂) = 239,2 g/mol
::pb3o4m#::M(Pb₃O₄) = 685,6 g/mol
::pbsm#::M(PbS) = 239,25 g/mol
::pbso4m#::M(PbSO₄) = 303,25 g/mol
::pbc2h54m#::M(Pb(C₂H₅)₄) = 323,44 g/mol
::pbch34m#::M(Pb(CH₃)₄) = 267,33 g/mol
::bm#::M(B) = 10,81 g/mol
::bnm#::M(BN) = 24,82 g/mol
::b2o3m#::M(B₂O₃) = 69,62 g/mol
::h3bo3m#::M(H₃BO₃) = 61,83 g/mol
::h2bo3-m#::M(H₂BO₃⁻) = 60,82 g/mol
::bf3m#::M(BF₃) = 67,81 g/mol
::b2h6m#::M(B₂H₆) = 27,67 g/mol
::b5h9m#::M(B₅H₉) = 63,12 g/mol
::brm#::M(Br) = 79,9 g/mol
::br2m#::M(Br₂) = 159,81 g/mol
::bro3-m#::M(BrO₃⁻) = 127,91 g/mol
::br-m#::M(Br⁻) = 79,9 g/mol
::hbrm#::M(HBr) = 80,91 g/mol
::cdm#::M(Cd) = 112,4 g/mol
::cdbr2m#::M(CdBr₂) = 272,22 g/mol
::cdbr24h2om#::M(CdBr₂∙4H₂O) = 344,28 g/mol
::cdcl2m#::M(CdCl₂) = 183,32 g/mol
::cdoh2m#::M(Cd(OH)₂) = 146,41 g/mol
::cdi2m#::M(CdI₂) = 366,21 g/mol
::cdom#::M(CdO) = 128,4 g/mol
::cdso4m#::M(CdSO₄) = 208,46 g/mol
::cdsm#::M(CdS) = 144,46 g/mol
::cam#::M(Ca) = 40,08 g/mol
::ca2+m#::M(Ca²⁺) = 40,08 g/mol
::caal2si2o8m#::M(CaAl₂Si₂O₈) = 278,21 g/mol
::cabr2m#::M(CaBr₂) = 199,89 g/mol
::cac2m#::M(CaC₂) = 64,1 g/mol
::caco3m#::M(CaCO₃) = 100,09 g/mol
::cacl2m#::M(CaCl₂) = 110,99 g/mol
::cacl26h2om#::M(CaCl₂∙6H₂O) = 219,08 g/mol
::caf2m#::M(CaF₂) = 78,08 g/mol
::cah2m#::M(CaH₂) = 42,09 g/mol
::cahpo42h2om#::M(CaHPO₄∙2H₂O) = 172,09 g/mol
::caoh2m#::M(Ca(OH)₂) = 74,09 g/mol
::ca5po43ohm#::M(Ca₅(PO₄)₃(OH)) = 502,32 g/mol
::cai2m#::M(CaI₂) = 293,89 g/mol
::cano32m#::M(Ca(NO₃)₂) = 164,09 g/mol
::ca3n2m#::M(Ca₃N₂) = 148,25 g/mol
::c2o4cam#::M(C₂O₄Ca) = 128,1 g/mol
::c2o4cah2om#::M(C₂O₄Ca∙H₂O) = 146,11 g/mol
::caom#::M(CaO) = 56,08 g/mol
::cao2m#::M(CaO₂) = 72,08 g/mol
::ca3po42m#::M(Ca₃(PO₄)₂) = 310,18 g/mol
::caso4m#::M(CaSO₄) = 136,14 g/mol
::caso4½h2om#::M(CaSO₄∙½H₂O) = 145,15 g/mol
::caso42h2om#::M(CaSO₄∙2H₂O) = 172,17 g/mol
::casm#::M(CaS) = 72,14 g/mol
::cm#::M(C) = 12,01 g/mol
::c2m#::M(C₂) = 24,02 g/mol
::c60m#::M(C₆₀) = 720,64 g/mol
::co2m#::M(CO₂) = 44,01 g/mol
::h2co3m#::M(H₂CO₃) = 62,02 g/mol
::hco3-m#::M(HCO₃⁻) = 61,02 g/mol
::co32-m#::M(CO₃²⁻) = 60,01 g/mol
::cs2m#::M(CS₂) = 76,14 g/mol
::com#::M(CO) = 28,01 g/mol
::cocl2m#::M(COCl₂) = 98,92 g/mol
::cosm#::M(COS) = 60,08 g/mol
::hcnm#::M(HCN) = 27,03 g/mol
::cn-m#::M(CN⁻) = 26,02 g/mol
::ocn-m#::M(OCN⁻) = 42,02 g/mol
::cn2m#::M((CN)₂) = 52,04 g/mol
::scn-m#::M(SCN⁻) = 58,08 g/mol
::cem#::M(Ce) = 140,12 g/mol
::cecl3m#::M(CeCl₃) = 246,48 g/mol
::ceno336h2om#::M(Ce(NO₃)₃∙6H₂O) = 434,23 g/mol
::ce2o3m#::M(Ce₂O₃) = 328,24 g/mol
::ce2so43m#::M(Ce₂(SO₄)₃) = 568,42 g/mol
::ceso42m#::M(Ce(SO₄)₂) = 332,24 g/mol
::clm#::M(Cl) = 35,45 g/mol
::cl2m#::M(Cl₂) = 70,91 g/mol
::cl-m#::M(Cl⁻) = 35,45 g/mol
::clo2m#::M(ClO₂) = 67,45 g/mol
::cl2om#::M(Cl₂O) = 86,91 g/mol
::hclm#::M(HCl) = 36,46 g/mol
::cl2o7m#::M(Cl₂O₇) = 182,9 g/mol
::hclo3m#::M(HClO₃) = 84,46 g/mol
::clo3-m#::M(ClO₃⁻) = 83,45 g/mol
::hclo2m#::M(HClO₂) = 68,46 g/mol
::clo2-m#::M(ClO₂⁻) = 67,45 g/mol
::hclom#::M(HClO) = 52,46 g/mol
::clo-m#::M(ClO⁻) = 51,45 g/mol
::hclo4m#::M(HClO₄) = 100,46 g/mol
::clo4-m#::M(ClO₄⁻) = 99,45 g/mol
::crm#::M(Cr) = 52,00 g/mol
::cr2+m#::M(Cr²⁺) = 52,00 g/mol
::cr3+m#::M(Cr³⁺) = 52,00 g/mol
::cro42-m#::M(CrO₄²⁻) = 115,99 g/mol
::h2cro4m#::M(H₂CrO₄) = 118,01 g/mol
::crcl2m#::M(CrCl₂) = 122,9 g/mol
::crcl3m#::M(CrCl₃) = 158,35 g/mol
::crcl36h2om#::M(CrCl₃∙6H₂O) = 266,45 g/mol
::crom#::M(CrO) = 68,00 g/mol
::cr2o3m#::M(Cr₂O₃) = 151,99 g/mol
::cro2m#::M(CrO₂) = 84,00 g/mol
::cro3m#::M(CrO₃) = 99,99 g/mol
::cro2cl2m#::M(CrO₂Cl₂) = 154,9 g/mol
::cr2so43m#::M(Cr₂(SO₄)₃) = 392,18 g/mol
::crco6m#::M(Cr(CO)₆) = 220,07 g/mol
::com#::M(Co) = 58,93 g/mol
::co2+m#::M(Co²⁺) = 58,93 g/mol
::coco3m#::M(CoCO₃) = 118,94 g/mol
::cocl2m#::M(CoCl₂) = 129,84 g/mol
::cocl22h2om#::M(CoCl₂∙2H₂O) = 165,87 g/mol
::cocl26h2om#::M(CoCl₂∙6H₂O) = 237,93 g/mol
::cocl3m#::M(CoCl₃) = 165,29 g/mol
::cooh2m#::M(Co(OH)₂) = 92,95 g/mol
::cono326h2om#::M(Co(NO₃)₂∙6H₂O) = 291,04 g/mol
::coom#::M(CoO) = 74,93 g/mol
::co2o3m#::M(Co₂O₃) = 165,86 g/mol
::co3o4m#::M(Co₃O₄) = 240,8 g/mol
::coso4m#::M(CoSO₄) = 155,00 g/mol
::coso47h2om#::M(CoSO₄∙7H₂O) = 281,1 g/mol
::csm#::M(Cs) = 132,91 g/mol
::csbrm#::M(CsBr) = 212,81 g/mol
::csclm#::M(CsCl) = 168,36 g/mol
::csfm#::M(CsF) = 151,9 g/mol
::cshm#::M(CsH) = 133,91 g/mol
::csohm#::M(CsOH) = 149,91 g/mol
::csim#::M(CsI) = 259,81 g/mol
::cs2om#::M(Cs₂O) = 281,81 g/mol
::fm#::M(F) = 19,00 g/mol
::f2m#::M(F₂) = 38,00 g/mol
::f-m#::M(F⁻) = 19,00 g/mol
::f2om#::M(F₂O) = 54,00 g/mol
::hfm#::M(HF) = 20,01 g/mol
::gem#::M(Ge) = 72,59 g/mol
::geh4m#::M(GeH₄) = 76,62 g/mol
::ge2h6m#::M(Ge₂H₆) = 151,23 g/mol
::geo2m#::M(GeO₂) = 104,59 g/mol
::aum#::M(Au) = 196,97 g/mol
::auclm#::M(AuCl) = 232,42 g/mol
::aucl3m#::M(AuCl₃) = 303,33 g/mol
::hem#::M(He) = 4,00 g/mol
::hm#::M(H) = 1,01 g/mol
::h2m#::M(H₂) = 2,02 g/mol
::h+m#::M(H⁺) = 1,01 g/mol
::h-m#::M(H⁻) = 1,01 g/mol
::d2om#::M(D₂O) = 4,03 g/mol
::h3o+m#::M(H₃O⁺) = 19,02 g/mol
::im#::M(I) = 126,9 g/mol
::i2m#::M(I₂) = 253,81 g/mol
::i-m#::M(I⁻) = 126,9 g/mol
::him#::M(HI) = 127,91 g/mol
::hio3m#::M(HIO₃) = 175,91 g/mol
::io3-m#::M(IO₃⁻) = 174,9 g/mol
::in3m#::M(IN₃) = 168,92 g/mol
::ibrm#::M(IBr) = 206,81 g/mol
::iclm#::M(ICl) = 162,36 g/mol
::icl3m#::M(ICl₃) = 233,26 g/mol
::i2o5m#::M(I₂O₅) = 333,81 g/mol
::fem#::M(Fe) = 55,85 g/mol
::fe2+m#::M(Fe²⁺) = 55,85 g/mol
::fe3+m#::M(Fe³⁺) = 55,85 g/mol
::fe3cm#::M(Fe₃C) = 179,55 g/mol
::feco3m#::M(FeCO₃) = 115,85 g/mol
::fecl2m#::M(FeCl₂) = 126,75 g/mol
::fecl22h2om#::M(FeCl₂∙2H₂O) = 162,78 g/mol
::fecl24h2om#::M(FeCl₂∙4H₂O) = 198,81 g/mol
::fecl3m#::M(FeCl₃) = 162,2 g/mol
::fecl36h2om#::M(FeCl₃∙6H₂O) = 270,29 g/mol
::fes2m#::M(FeS₂) = 119,98 g/mol
::feno339h2om#::M(Fe(NO₃)₃∙9H₂O) = 404,00 g/mol
::feom#::M(FeO) = 71,84 g/mol
::fe0.947om#::M(Fe₀.₉₄₇O) = 68,69 g/mol
::fe2o3m#::M(Fe₂O₃) = 159,69 g/mol
::fe3o4m#::M(Fe₃O₄) = 231,53 g/mol
::fepo42h2om#::M(FePO₄∙2H₂O) = 186,85 g/mol
::fesm#::M(FeS) = 87,91 g/mol
::fe2s3m#::M(Fe₂S₃) = 207,86 g/mol
::feso47h2om#::M(FeSO₄∙7H₂O) = 278,02 g/mol
::fe2so43m#::M(Fe₂(SO₄)₃) = 399,88 g/mol
::feco5m#::M(Fe(CO)₅) = 195,9 g/mol
::fec5h52m#::M(Fe(C₅H₅)₂) = 186,03 g/mol
::km#::M(K) = 39,1 g/mol
::k+m#::M(K⁺) = 39,1 g/mol
::kbro3m#::M(KBrO₃) = 167,00 g/mol
::kbrm#::M(KBr) = 119,00 g/mol
::k2co3m#::M(K₂CO₃) = 138,21 g/mol
::kclo3m#::M(KClO₃) = 122,55 g/mol
::kclm#::M(KCl) = 74,55 g/mol
::k2cro4m#::M(K₂CrO₄) = 194,19 g/mol
::kcnm#::M(KCN) = 65,12 g/mol
::kocnm#::M(KOCN) = 81,11 g/mol
::k2cr2o7m#::M(K₂Cr₂O₇) = 294,19 g/mol
::kh2po4m#::M(KH₂PO₄) = 136,09 g/mol
::kfm#::M(KF) = 58,1 g/mol
::k3fecn6m#::M(K₃Fe(CN)₆) = 329,24 g/mol
::khm#::M(KH) = 40,11 g/mol
::khco3m#::M(KHCO₃) = 100,16 g/mol
::khf2m#::M(KHF₂) = 78,1 g/mol
::kohm#::M(KOH) = 56,11 g/mol
::kio3m#::M(KIO₃) = 214,00 g/mol
::kim#::M(KI) = 166,00 g/mol
::k2mno4m#::M(K₂MnO₄) = 197,13 g/mol
::kno3m#::M(KNO₃) = 101,1 g/mol
::kno2m#::M(KNO₂) = 85,1 g/mol
::k2om#::M(K₂O) = 94,2 g/mol
::kclo4m#::M(KClO₄) = 138,55 g/mol
::kio4m#::M(KIO₄) = 230,00 g/mol
::kmno4m#::M(KMnO₄) = 158,03 g/mol
::k2o2m#::M(K₂O₂) = 110,2 g/mol
::k2o3sooso3m#::M(K₂O₃SOOSO₃) = 270,33 g/mol
::k2s2o7m#::M(K₂S₂O₇) = 254,32 g/mol
::ko2m#::M(KO₂) = 71,1 g/mol
::k2so4m#::M(K₂SO₄) = 174,26 g/mol
::k2sm#::M(K₂S) = 110,26 g/mol
::kscnm#::M(KSCN) = 97,18 g/mol
::cum#::M(Cu) = 63,55 g/mol
::cu+m#::M(Cu⁺) = 63,55 g/mol
::cu2+m#::M(Cu²⁺) = 63,55 g/mol
::cu2oh2co3m#::M(Cu₂(OH)₂CO₃) = 221,12 g/mol
::cu3oh2co32m#::M(Cu₃(OH)₂(CO₃)₂) = 344,65 g/mol
::cuclm#::M(CuCl) = 99,00 g/mol
::cucl2m#::M(CuCl₂) = 134,45 g/mol
::cucl22h2om#::M(CuCl₂∙2H₂O) = 170,48 g/mol
::cuoh2m#::M(Cu(OH)₂) = 97,56 g/mol
::cuim#::M(CuI) = 190,45 g/mol
::cuno323h2om#::M(Cu(NO₃)₂∙3H₂O) = 241,6 g/mol
::cu2om#::M(Cu₂O) = 143,09 g/mol
::cuom#::M(CuO) = 79,55 g/mol
::cu2so4m#::M(Cu₂SO₄) = 223,15 g/mol
::cuso4m#::M(CuSO₄) = 159,61 g/mol
::cuso45h2om#::M(CuSO₄∙5H₂O) = 249,69 g/mol
::cu2sm#::M(Cu₂S) = 159,16 g/mol
::cusm#::M(CuS) = 95,61 g/mol
::krm#::M(Kr) = 83,8 g/mol
::krf2m#::M(KrF₂) = 121,8 g/mol
::hgm#::M(Hg) = 200,59 g/mol
::hg22+m#::M(Hg₂²⁺) = 401,18 g/mol
::hg2+m#::M(Hg²⁺) = 200,59 g/mol
::hg2br2m#::M(Hg₂Br₂) = 560,99 g/mol
::hgbr2m#::M(HgBr₂) = 360,4 g/mol
::hg2cl2m#::M(Hg₂Cl₂) = 472,09 g/mol
::hgcl2m#::M(HgCl₂) = 271,5 g/mol
::hg2i2m#::M(Hg₂I₂) = 654,99 g/mol
::hgi2m#::M(HgI₂) = 454,4 g/mol
::hgno32½h2om#::M(Hg(NO₃)₂∙½H₂O) = 333,61 g/mol
::hg2om#::M(Hg₂O) = 417,18 g/mol
::hgom#::M(HgO) = 216,59 g/mol
::hgsm#::M(HgS) = 232,66 g/mol
::hg2so4m#::M(Hg₂SO₄) = 497,24 g/mol
::lim#::M(Li) = 6,94 g/mol
::li+m#::M(Li⁺) = 6,94 g/mol
::lialh4m#::M(LiAlH₄) = 37,95 g/mol
::libh4m#::M(LiBH₄) = 21,78 g/mol
::librm#::M(LiBr) = 86,85 g/mol
::li2co3m#::M(Li₂CO₃) = 73,89 g/mol
::liclm#::M(LiCl) = 42,39 g/mol
::lifm#::M(LiF) = 25,94 g/mol
::lihm#::M(LiH) = 7,95 g/mol
::liohm#::M(LiOH) = 23,95 g/mol
::liim#::M(LiI) = 133,85 g/mol
::li2om#::M(Li₂O) = 29,88 g/mol
::li2so4h2om#::M(Li₂SO₄∙H₂O) = 127,95 g/mol
::mgm#::M(Mg) = 24,31 g/mol
::mg2+m#::M(Mg²⁺) = 24,31 g/mol
::mgbr2m#::M(MgBr₂) = 184,11 g/mol
::mgco3m#::M(MgCO₃) = 84,32 g/mol
::mgcl2m#::M(MgCl₂) = 95,21 g/mol
::mgcl26h2om#::M(MgCl₂∙6H₂O) = 203,3 g/mol
::mgoh2m#::M(Mg(OH)₂) = 58,32 g/mol
::mgi2m#::M(MgI₂) = 278,12 g/mol
::mgno32m#::M(Mg(NO₃)₂) = 148,31 g/mol
::mgno326h2om#::M(Mg(NO₃)₂∙6H₂O) = 256,41 g/mol
::mg3n2m#::M(Mg₃N₂) = 100,93 g/mol
::mgom#::M(MgO) = 40,3 g/mol
::mgclo42m#::M(Mg(ClO₄)₂) = 223,21 g/mol
::mgso4m#::M(MgSO₄) = 120,37 g/mol
::mgso47h2om#::M(MgSO₄∙7H₂O) = 246,48 g/mol
::mgsm#::M(MgS) = 56,37 g/mol
::mnm#::M(Mn) = 54,94 g/mol
::mn2+m#::M(Mn²⁺) = 54,94 g/mol
::mn3+m#::M(Mn³⁺) = 54,94 g/mol
::mno4-m#::M(MnO₄⁻) = 118,94 g/mol
::mnco3m#::M(MnCO₃) = 114,95 g/mol
::mncl24h2om#::M(MnCl₂∙4H₂O) = 197,91 g/mol
::mnoohm#::M(MnO(OH)) = 87,94 g/mol
::mnoh2m#::M(Mn(OH)₂) = 88,95 g/mol
::mn3o4m#::M(Mn₃O₄) = 228,81 g/mol
::mnom#::M(MnO) = 70,94 g/mol
::mn2o3m#::M(Mn₂O₃) = 157,87 g/mol
::mno2m#::M(MnO₂) = 86,94 g/mol
::mnso4m#::M(MnSO₄) = 151,00 g/mol
::mnsm#::M(MnS) = 87,00 g/mol
::mn2co10m#::M(Mn₂(CO)₁₀) = 389,99 g/mol
::mom#::M(Mo) = 95,94 g/mol
::moo2m#::M(MoO₂) = 127,94 g/mol
::moo3m#::M(MoO₃) = 143,94 g/mol
::h2moo4h2om#::M(H₂MoO₄∙H₂O) = 179,97 g/mol
::moco6m#::M(Mo(CO)₆) = 264,00 g/mol
::nam#::M(Na) = 22,99 g/mol
::na+m#::M(Na⁺) = 22,99 g/mol
::nanh2m#::M(NaNH₂) = 39,01 g/mol
::naaso2m#::M(NaAsO₂) = 129,91 g/mol
::nan3m#::M(NaN₃) = 65,01 g/mol
::c6h5-coonam#::M(C₆H₅-COONa) = 144,11 g/mol
::na2b4o7m#::M(Na₂B₄O₇) = 201,22 g/mol
::nabh4m#::M(NaBH₄) = 37,83 g/mol
::nabrm#::M(NaBr) = 102,89 g/mol
::nabr2h2om#::M(NaBr∙2H₂O) = 138,93 g/mol
::nabro3m#::M(NaBrO₃) = 150,89 g/mol
::na2co3m#::M(Na₂CO₃) = 105,99 g/mol
::naclo3m#::M(NaClO₃) = 106,44 g/mol
::naclm#::M(NaCl) = 58,44 g/mol
::naclo2m#::M(NaClO₂) = 90,44 g/mol
::nah2po4h2om#::M(NaH₂PO₄∙H₂O) = 137,99 g/mol
::ch3ch2onam#::M(CH₃CH₂ONa) = 68,05 g/mol
::nafm#::M(NaF) = 41,99 g/mol
::hcoonam#::M(HCOONa) = 68,01 g/mol
::na3cono26m#::M(Na₃Co(NO₂)₆) = 403,98 g/mol
::na3alf6m#::M(Na₃AlF₆) = 209,94 g/mol
::napo36m#::M((NaPO₃)₆) = 611,77 g/mol
::nahm#::M(NaH) = 24,00 g/mol
::nahco3m#::M(NaHCO₃) = 84,01 g/mol
::nahso4m#::M(NaHSO₄) = 120,06 g/mol
::nahsm#::M(NaHS) = 56,06 g/mol
::nahso3m#::M(NaHSO₃) = 104,06 g/mol
::naohm#::M(NaOH) = 40,00 g/mol
::naio3m#::M(NaIO₃) = 197,89 g/mol
::naim#::M(NaI) = 149,89 g/mol
::nai2h2om#::M(NaI∙2H₂O) = 185,92 g/mol
::ch3onam#::M(CH₃ONa) = 54,03 g/mol
::nano3m#::M(NaNO₃) = 85,00 g/mol
::na3nm#::M(Na₃N) = 82,98 g/mol
::nano2m#::M(NaNO₂) = 69,00 g/mol
::na2c2o4m#::M(Na₂C₂O₄) = 134,00 g/mol
::na2om#::M(Na₂O) = 61,98 g/mol
::naclo4m#::M(NaClO₄) = 122,44 g/mol
::na2o2m#::M(Na₂O₂) = 77,98 g/mol
::na2s2o8m#::M(Na₂S₂O₈) = 238,11 g/mol
::na2s2o5m#::M(Na₂S₂O₅) = 190,1 g/mol
::na2sio3m#::M(Na₂SiO₃) = 122,06 g/mol
::na2so4m#::M(Na₂SO₄) = 142,04 g/mol
::na2sm#::M(Na₂S) = 78,05 g/mol
::na2so3m#::M(Na₂SO₃) = 126,04 g/mol
::na2s2o3m#::M(Na₂S₂O₃) = 158,11 g/mol
::na5p3o10m#::M(Na₅P₃O₁₀) = 367,86 g/mol
::w2o42h2om#::M(W₂O₄∙2H₂O) = 329,85 g/mol
::nem#::M(Ne) = 20,18 g/mol
::nim#::M(Ni) = 58,69 g/mol
::ni2+m#::M(Ni²⁺) = 58,69 g/mol
::nibr2m#::M(NiBr₂) = 218,5 g/mol
::nicl2m#::M(NiCl₂) = 129,6 g/mol
::nicl26h2om#::M(NiCl₂∙6H₂O) = 237,69 g/mol
::nioh2m#::M(Ni(OH)₂) = 92,71 g/mol
::nino326h2om#::M(Ni(NO₃)₂∙6H₂O) = 290,79 g/mol
::niom#::M(NiO) = 74,69 g/mol
::niso4m#::M(NiSO4) = 154,76 g/mol
::niso46h2om#::M(NiSO4∙6H₂O) = 262,85 g/mol
::nism#::M(NiS) = 90,76 g/mol
::nico4m#::M(Ni(CO)₄) = 170,73 g/mol
::nm#::M(N) = 14,01 g/mol
::n2m#::M(N₂) = 28,01 g/mol
::no2m#::M(NO₂) = 46,01 g/mol
::nom#::M(NO) = 30,01 g/mol
::n2om#::M(N₂O) = 44,01 g/mol
::n2o4m#::M(N₂O₄) = 92,01 g/mol
::n2o3m#::M(N₂O₃) = 76,01 g/mol
::n2o5m#::M(N₂O₅) = 108,01 g/mol
::nh3m#::M(NH₃) = 17,03 g/mol
::nh4+m#::M(NH₄⁺) = 18,04 g/mol
::nh4clm#::M(NH₄Cl) = 53,49 g/mol
::nh42cro4m#::M((NH₄)₂CrO₄) = 152,08 g/mol
::nh42cr2o7m#::M((NH₄)₂Cr₂O₇) = 252,08 g/mol
::nh4hco3m#::M(NH₄HCO₃) = 79,06 g/mol
::nh4hsm#::M(NH₄HS) = 51,11 g/mol
::nh4hso4m#::M(NH₄HSO₄) = 115,11 g/mol
::nh42moo4m#::M((NH₄)₂MoO₄) = 196,01 g/mol
::nh4no3m#::M(NH₄NO₃) = 80,04 g/mol
::nh4no2m#::M(NH₄NO₂) = 64,04 g/mol
::nh42s2o8m#::M((NH₄)₂S₂O8) = 228,2 g/mol
::nh42so4m#::M((NH₄)₂SO₄) = 132,14 g/mol
::nh4scnm#::M(NH₄SCN) = 76,12 g/mol
::nh4vo3m#::M(NH₄VO₃) = 116,98 g/mol
::nh2nh2m#::M(NH₂NH₂) = 32,05 g/mol
::nh2-nh3clm#::M(NH₂-NH₃Cl) = 68,51 g/mol
::hn3m#::M(HN₃) = 43,03 g/mol
::nh2ohm#::M(NH₂OH) = 33,03 g/mol
::nh3ohclm#::M((NH₃OH)Cl) = 69,49 g/mol
::nh3oh2so4m#::M((NH₃OH)₂SO₄) = 164,14 g/mol
::no3-m#::M(NO₃⁻) = 62,00 g/mol
::no2-m#::M(NO₂⁻) = 46,00 g/mol
::onclm#::M(ONCl) = 65,46 g/mol
::hno3m#::M(HNO₃) = 63,01 g/mol
::hno2m#::M(HNO₂) = 47,01 g/mol
::om#::M(O) = 16,00 g/mol
::o2m#::M(O₂) = 32,00 g/mol
::o3m#::M(O₃) = 48,00 g/mol
::o2-m#::M(O²⁻) = 16,00 g/mol
::h2om#::M(H₂O) = 18,02 g/mol
::d2om#::M(D₂O) = 20,03 g/mol
::o22-m#::M(O₂²⁻) = 32,00 g/mol
::h2o2m#::M(H₂O₂) = 34,02 g/mol
::oh-m#::M(OH⁻) = 17,01 g/mol
::p4m#::M(P₄) = 30,97 g/mol
::pm#::M(P) = 30,97 g/mol
::p4m#::M(P₄) = 123,9 g/mol
::ph3m#::M(PH₃) = 34,00 g/mol
::p4o10m#::M(P₄O₁₀) = 283,89 g/mol
::pcl5m#::M(PCl₅) = 208,24 g/mol
::h3po4m#::M(H₃PO₄) = 98,00 g/mol
::h2po4-m#::M(H₂PO₄⁻) = 96,99 g/mol
::hpo42-m#::M(HPO₄²⁻) = 95,98 g/mol
::po43-m#::M(PO₄³⁻) = 94,97 g/mol
::h3po3m#::M(H₃PO₃) = 82,00 g/mol
::hpo3nm#::M((HPO₃)n) = 79,98 g/mol
::pbr3m#::M(PBr₃) = 270,69 g/mol
::pcl3m#::M(PCl₃) = 137,33 g/mol
::ptm#::M(Pt) = 195,08 g/mol
::ptcl2m#::M(PtCl₂) = 265,98 g/mol
::rbm#::M(Rb) = 85,47 g/mol
::rbclm#::M(RbCl) = 120,92 g/mol
::sem#::M(Se) = 78,96 g/mol
::h2sem#::M(H₂Se) = 80,98 g/mol
::seo2m#::M(SeO₂) = 110,96 g/mol
::h2seo4m#::M(H₂SeO₄) = 144,97 g/mol
::sim#::M(Si) = 28,09 g/mol
::sicm#::M(SiC) = 40,1 g/mol
::sio2m#::M(SiO₂) = 60,09 g/mol
::sih4m#::M(SiH₄) = 32,12 g/mol
::sicl4m#::M(SiCl₄) = 169,9 g/mol
::sif4m#::M(SiF₄) = 104,08 g/mol
::srm#::M(Sr) = 87,62 g/mol
::sr2+m#::M(Sr²⁺) = 87,62 g/mol
::srco3m#::M(SrCO₃) = 147,63 g/mol
::srcl2m#::M(SrCl₂) = 158,53 g/mol
::srcro4m#::M(SrCrO₄) = 203,61 g/mol
::sroh2m#::M(Sr(OH)₂) = 121,64 g/mol
::sroh28h2om#::M(Sr(OH)₂∙8H₂O) = 265,76 g/mol
::srno32m#::M(Sr(NO₃)₂) = 211,63 g/mol
::srom#::M(SrO) = 103,62 g/mol
::srso4m#::M(SrSO₄) = 183,68 g/mol
::sm#::M(S) = 32,07 g/mol
::s8m#::M(S₈) = 32,07 g/mol
::s2m#::M(S₂) = 64,13 g/mol
::s8m#::M(S₈) = 256,53 g/mol
::so2m#::M(SO₂) = 64,07 g/mol
::h2so3m#::M(H₂SO₃) = 82,08 g/mol
::hso3-m#::M(HSO₃⁻) = 81,07 g/mol
::so32-m#::M(SO₃²⁻) = 80,06 g/mol
::h2sm#::M(H₂S) = 34,08 g/mol
::hs-m#::M(HS⁻) = 33,07 g/mol
::s2-m#::M(S²⁻) = 32,06 g/mol
::h2s2o8m#::M(H₂S₂O₈) = 194,15 g/mol
::h2so4m#::M(H₂SO₄) = 98,08 g/mol
::hso4-m#::M(HSO₄⁻) = 97,08 g/mol
::so42-m#::M(SO₄²⁻) = 96,07 g/mol
::so2cl2m#::M(SO₂Cl₂) = 134,98 g/mol
::so3m#::M(SO₃) = 80,06 g/mol
::socl2m#::M(SOCl₂) = 118,97 g/mol
::h2nso3hm#::M(H₂NSO₃H) = 97,09 g/mol
::s2o32-m#::M(S₂O₃²⁻) = 112,13 g/mol
::clso3hm#::M(ClSO₃H) = 116,53 g/mol
::sf6m#::M(SF₆) = 146,06 g/mol
::agm#::M(Ag) = 107,87 g/mol
::ag+m#::M(Ag⁺) = 107,87 g/mol
::agbro3m#::M(AgBrO₃) = 235,77 g/mol
::agbrm#::M(AgBr) = 187,77 g/mol
::ag2co3m#::M(Ag₂CO₃) = 275,75 g/mol
::agclm#::M(AgCl) = 143,32 g/mol
::ag2cro4m#::M(Ag₂CrO₄) = 331,73 g/mol
::agcnm#::M(AgCN) = 133,89 g/mol
::agfm#::M(AgF) = 126,87 g/mol
::agio3m#::M(AgIO₃) = 282,77 g/mol
::agim#::M(AgI) = 234,77 g/mol
::agno3m#::M(AgNO₃) = 169,87 g/mol
::ag3po4m#::M(Ag₃PO₄) = 418,58 g/mol
::ag2om#::M(Ag₂O) = 231,74 g/mol
::agom#::M(AgO) = 123,87 g/mol
::ag2so4m#::M(Ag₂SO₄) = 311,8 g/mol
::ag2sm#::M(Ag₂S) = 247,8 g/mol
::thm#::M(Th) = 232,04 g/mol
::thno34m#::M(Th(NO₃)₄) = 480,06 g/mol
::tho2m#::M(ThO₂) = 264,04 g/mol
::snm#::M(Sn) = 118,71 g/mol
::sn2+m#::M(Sn²⁺) = 118,71 g/mol
::sn4+m#::M(Sn⁴⁺) = 118,71 g/mol
::sncl22h2om#::M(SnCl₂∙2H₂O) = 225,65 g/mol
::sncl4m#::M(SnCl₄) = 260,52 g/mol
::snh4m#::M(SnH₄) = 122,74 g/mol
::snoh2m#::M(Sn(OH)₂) = 152,73 g/mol
::snom#::M(SnO) = 134,71 g/mol
::sno2m#::M(SnO₂) = 150,71 g/mol
::snso4m#::M(SnSO₄) = 214,77 g/mol
::snsm#::M(SnS) = 150,75 g/mol
::sns2m#::M(SnS₂) = 182,81 g/mol
::tim#::M(Ti) = 47,87 g/mol
::ticm#::M(TiC) = 59,88 g/mol
::ticl2m#::M(TiCl₂) = 118,77 g/mol
::ticl3m#::M(TiCl₃) = 154,23 g/mol
::ticl4m#::M(TiCl₄) = 189,68 g/mol
::tio2m#::M(TiO₂) = 79,87 g/mol
::um#::M(U) = 238,03 g/mol
::u3o8m#::M(U₃O₈) = 842,08 g/mol
::uf6m#::M(UF₆) = 352,02 g/mol
::uo2m#::M(UO₂) = 270,03 g/mol
::uo3m#::M(UO₃) = 286,03 g/mol
::uo2so43h2om#::M(UO₂(SO₄)∙3H₂O) = 420,14 g/mol
::vm#::M(V) = 50,94 g/mol
::v2o3m#::M(V₂O₃) = 149,88 g/mol
::v2o5m#::M(V₂O₅) = 181,88 g/mol
::v2so43m#::M(V₂(SO₄)₃) = 390,07 g/mol
::voso4m#::M(VOSO₄) = 163,00 g/mol
::vco6m#::M(V(CO)₆) = 219,00 g/mol
::wm#::M(W) = 183,84 g/mol
::wcm#::M(WC) = 195,85 g/mol
::wo3m#::M(WO₃) = 231,84 g/mol
::wf6m#::M(WF₆) = 297,84 g/mol
::xem#::M(Xe) = 131,29 g/mol
::xeo3m#::M(XeO₃) = 179,29 g/mol
::xeo4m#::M(XeO₄) = 195,29 g/mol
::xef2m#::M(XeF₂) = 169,29 g/mol
::xef4m#::M(XeF₄) = 207,28 g/mol
::xef6m#::M(XeF₆) = 245,28 g/mol
::znm#::M(Zn) = 65,39 g/mol
::zn2+m#::M(Zn²⁺) = 65,39 g/mol
::znbr2m#::M(ZnBr₂) = 225,2 g/mol
::znco3m#::M(ZnCO₃) = 125,4 g/mol
::zncl2m#::M(ZnCl₂) = 136,29 g/mol
::znoh2m#::M(Zn(OH)₂) = 99,41 g/mol
::zni2m#::M(ZnI₂) = 319,2 g/mol
::znno326h2om#::M(Zn(NO₃)₂∙6H₂O) = 297,49 g/mol
::znom#::M(ZnO) = 81,39 g/mol
::znso4m#::M(ZnSO₄) = 161,45 g/mol
::znso47h2om#::M(ZnSO₄∙7H₂O) = 287,56 g/mol
::znsm#::M(ZnS) = 97,46 g/mol
::zrm#::M(Zr) = 91,22 g/mol
::zrcl4m#::M(ZrCl₄) = 233,04 g/mol
::zro2m#::M(ZrO₂) = 123,22 g/mol
::zrocl28h2om#::M(ZrOCl₂∙8H₂O) = 322,25 g/mol
::ch4m#::M(CH₄) = 16,04 g/mol
::c2h6m#::M(C₂H₆) = 30,07 g/mol
::c3h8m#::M(C₃H₈) = 44,11 g/mol
::c4h10m#::M(C₄H₁₀) = 58,12 g/mol
::c5h12m#::M(C₅H₁₂) = 72,15 g/mol
::c6h14m#::M(C₆H₁₄) = 86,18 g/mol
::ch3ch24ch3m#::M(CH₃(CH₂)₄CH₃) = 86,18 g/mol
::c7h16m#::M(C₇H₁₆) = 100,21 g/mol
::ch3ch25ch3m#::M(CH₃(CH₂)₅CH₃) = 100,21 g/mol
::c8h18m#::M(C₈H₁₈) = 114,23 g/mol
::ch3ch26ch3m#::M(CH₃(CH₂)₆CH₃) = 114,23 g/mol
::c9h20m#::M(C₉H₂₀) = 128,26 g/mol
::c10h22m#::M(C₁₀H₂₂) = 142,29 g/mol
::ch3ch29ch3m#::M(CH₃(CH₂)₉CH₃) = 156,32 g/mol
::ch33chm#::M((CH₃)₃CH) = 58,12 g/mol
::cch34m#::M(C(CH₃)₄) = 72,15 g/mol
::ch2chch322m#::M(CH₂(CH(CH₃)₂)₂) = 100,2 g/mol
::c3h6m#::M(C₃H₆) = 42,08 g/mol
::c4h8m#::M(C₄H₈) = 56,12 g/mol
::c5h10m#::M(C₅H₁₀) = 70,14 g/mol
::c6h12m#::M(C₆H₁₂) = 84,16 g/mol
::c6h11ch3m#::M(C₆H₁₁CH₃) = 98,19 g/mol
::ch32c6h10m#::M((CH₃)₂C₆H₁₀) = 112,22 g/mol
::ch2=ch2m#::M(CH₂=CH₂) = 28,05 g/mol
::ch2=chch3m#::M(CH₂=CHCH₃) = 42,08 g/mol
::ch2=c=ch2m#::M(CH₂=C=CH₂) = 40,07 g/mol
::c3h4m#::M(C₃H₄) = 40,07 g/mol
::c4h6m#::M(C₄H₆) = 54,09 g/mol
::c6h8m#::M(C₆H₈) = 80,14 g/mol
::c6h10m#::M(C₆H₁₀) = 82,15 g/mol
::c10h16m#::M(C₁₀H₁₆) = 136,24 g/mol
::c40h56m#::M(C₄₀H₅₆) = 536,85 g/mol
::c2h2m#::M(C₂H₂) = 26,04 g/mol
::hc≡chm#::M(HC≡CH) = 26,04 g/mol
::hc≡cch3m#::M(HC≡CCH₃) = 40,07 g/mol
::hc≡cch2ch3m#::M(HC≡CCH₂CH₃) = 54,09 g/mol
::ch3c≡cch3m#::M(CH₃C≡CCH₃) = 54,09 g/mol
::hc≡c-c≡chm#::M(HC≡C-C≡CH) = 50,06 g/mol
::c6h6m#::M(C₆H₆) = 78,12 g/mol
::c10h8m#::M(C₁₀H₈) = 128,19 g/mol
::c14h10m#::M(C₁₄H₁₀) = 178,23 g/mol
::c18h12m#::M(C₁₈H₁₂) = 228,29 g/mol
::c20h12m#::M(C₂₀H₁₂) = 252,32 g/mol
::c6h5ch3m#::M(C₆H₅CH₃) = 92,15 g/mol
::c6h5ch=ch2m#::M(C₆H₅CH=CH₂) = 104,16 g/mol
::c6h4ch32m#::M(C₆H₄(CH₃)₂) = 106,17 g/mol
::c6h5ch2ch3m#::M(C₆H₅CH₂CH₃) = 106,17 g/mol
::c6h5chch32m#::M(C₆H₅CH(CH₃)₂) = 120,2 g/mol
::c6h5-c6h5m#::M(C₆H₅-C₆H₅) = 154,2 g/mol
::ch3clm#::M(CH₃Cl) = 50,49 g/mol
::chcl=ch2m#::M(CHCl=CH₂) = 62,5 g/mol
::ch3ch2clm#::M(CH₃CH₂Cl) = 64,51 g/mol
::ch3chclch3m#::M(CH₃CHClCH₃) = 78,54 g/mol
::ch2cl2m#::M(CH₂Cl₂) = 84,93 g/mol
::ch33cclm#::M((CH₃)₃CCl) = 92,57 g/mol
::ch2=ccl2m#::M(CH₂=CCl₂) = 96,94 g/mol
::chcl=chclm#::M(CHCl=CHCl) = 96,94 g/mol
::ch3chcl2m#::M(CH₃CHCl₂) = 98,96 g/mol
::ch2clch2clm#::M(CH₂ClCH₂Cl) = 98,96 g/mol
::c6h5clm#::M(C₆H₅Cl) = 112,56 g/mol
::chcl3m#::M(CHCl₃) = 119,38 g/mol
::ccl2=chclm#::M(CCl₂=CHCl) = 119,38 g/mol
::ch3ccl3m#::M(CH₃CCl₃) = 133,4 g/mol
::ch2clchcl2m#::M(CH₂ClCHCl₂) = 133,4 g/mol
::c6h4cl2m#::M(C₆H₄Cl₂) = 147,00 g/mol
::ccl4m#::M(CCl₄) = 153,82 g/mol
::ccl3ccl3m#::M(CCl₃CCl₃) = 236,74 g/mol
::c6cl6m#::M(C₆Cl₆) = 284,78 g/mol
::c6h6cl6m#::M(C₆H₆Cl₆) = 290,83 g/mol
::c14h9cl5m#::M(C₁₄H₉Cl₅) = 354,51 g/mol
::chclf2m#::M(CHClF₂) = 86,47 g/mol
::cf4m#::M(CF₄) = 88,00 g/mol
::cf2=cf2m#::M(CF₂=CF₂) = 100,02 g/mol
::chcl2fm#::M(CHCl₂F) = 102,92 g/mol
::cclf3m#::M(CClF₃) = 104,46 g/mol
::ccl2f2m#::M(CCl₂F₂) = 120,92 g/mol
::cf3chcl2m#::M(CF₃CHCl₂) = 152,93 g/mol
::cfcl2cfcl2m#::M(CFCl₂CFCl₂) = 203,83 g/mol
::ch3brm#::M(CH₃Br) = 94,94 g/mol
::ch3ch2brm#::M(CH₃CH₂Br) = 108,97 g/mol
::ch3chbrch3m#::M(CH₃CHBrCH₃) = 122,99 g/mol
::ch33cbrm#::M((CH₃)₃CBr) = 137,02 g/mol
::c6h5brm#::M(C₆H₅Br) = 157,01 g/mol
::ch2br2m#::M(CH₂Br₂) = 173,83 g/mol
::chbr=chbrm#::M(CHBr=CHBr) = 185,85 g/mol
::ch3chbr2m#::M(CH₃CHBr₂) = 187,86 g/mol
::ch2brch2brm#::M(CH₂BrCH₂Br) = 187,86 g/mol
::c6h4br2m#::M(C₆H₄Br₂) = 235,91 g/mol
::chbr3m#::M(CHBr₃) = 252,73 g/mol
::cbr4m#::M(CBr₄) = 331,65 g/mol
::chbr2chbr2m#::M(CHBr₂CHBr₂) = 345,65 g/mol
::ch3im#::M(CH₃I) = 141,94 g/mol
::ch3ch2im#::M(CH₃CH₂I) = 155,97 g/mol
::ch3ch2chim#::M(CH₃CH₂CHI) = 169,99 g/mol
::ch3chich3m#::M(CH₃CHICH₃) = 169,99 g/mol
::ch33cim#::M((CH₃)₃CI) = 184,02 g/mol
::c6h5im#::M(C₆H₅I) = 204,01 g/mol
::ch2i2m#::M(CH₂I₂) = 267,84 g/mol
::chi2ch3m#::M(CHI₂CH₃) = 281,86 g/mol
::ch2ich2im#::M(CH₂ICH₂I) = 281,86 g/mol
::chi3m#::M(CHI₃) = 393,73 g/mol
::ci4m#::M(CI₄) = 519,63 g/mol
::ch3nh2m#::M(CH₃NH₂) = 31,06 g/mol
::ch32nhm#::M((CH₃)₂NH) = 45,09 g/mol
::ch3ch2nh2m#::M(CH₃CH₂NH₂) = 45,09 g/mol
::ch32nh2+m#::M((CH₃)₂NH₂⁺) = 46,1 g/mol
::ch33nm#::M((CH₃)₃N) = 59,11 g/mol
::h2nch22nh2m#::M(H₂N(CH₂)₂NH₂) = 60,1 g/mol
::ch3ch22nhm#::M((CH₃CH₂)₂NH) = 73,14 g/mol
::h2nch23nh2m#::M(H₂N(CH₂)₃NH₂) = 74,13 g/mol
::c5h5nm#::M(C₅H₅N) = 79,1 g/mol
::h2nch24nh2m#::M(H₂N(CH₂)₄NH₂) = 88,15 g/mol
::c6h5nh2m#::M(C₆H₅NH₂) = 93,13 g/mol
::ch3ch23nm#::M((CH₃CH₂)₃N) = 101,19 g/mol
::ch3c6h4nh2m#::M(CH₃C₆H₄NH₂) = 107,16 g/mol
::c6h5nhch3m#::M(C₆H₅NHCH₃) = 107,16 g/mol
::c6h5nhnh2m#::M(C₆H₅NHNH₂) = 108,14 g/mol
::ch34nclm#::M((CH₃)₄NCl) = 109,6 g/mol
::nch2ch23nm#::M(N(CH₂CH₂)₃N) = 112,18 g/mol
::h2nch26nh2m#::M(H₂N(CH₂)₆NH₂) = 116,21 g/mol
::c6h5nch32m#::M(C₆H₅N(CH₃)₂) = 121,18 g/mol
::c6h5nh3clm#::M(C₆H₅NH₃Cl) = 129,59 g/mol
::c10h15nm#::M(C₁₀H₁₅N) = 149,24 g/mol
::c10h14n2m#::M(C₁₀H₁₄N₂) = 162,23 g/mol
::c5h4n4o3m#::M(C₅H₄N₄O₃) = 168,11 g/mol
::c6h52nhm#::M((C₆H₅)₂NH) = 169,23 g/mol
::c6h53nm#::M((C₆H₅)₃N) = 245,33 g/mol
::c8h10o2n4m#::M(C₈H₁₀O₂N₄) = 194,19 g/mol
::c17h21no4m#::M(C₁₇H₂₁NO₄) = 303,35 g/mol
::c20h24o2n2m#::M(C₂₀H₂₄O₂N₂) = 324,44 g/mol
::c4h7n3om#::M(C₄H₇N₃O) = 113,12 g/mol
::c4h5n3om#::M(C₄H₅N₃O) = 111,1 g/mol
::c4h4n2o2m#::M(C₄H₄N₂O₂) = 112,09 g/mol
::c5h6n2o2m#::M(C₅H₆N₂O₂) = 126,12 g/mol
::c5h5n5m#::M(C₅H₅N₅) = 135,13 g/mol
::c5h6n5+m#::M(C₅H₆N₅⁺) = 136,14 g/mol
::c5h4n5-m#::M(C₅H₄N₅⁻) = 134,12 g/mol
::c5h5n5om#::M(C₅H₅N₅O) = 151,13 g/mol
::c10h13o4n5m#::M(C₁₀H₁₃O₄N₅) = 267,25 g/mol
::c10h13n5o5m#::M(C₁₀H₁₃N₅O₅) = 283,25 g/mol
::c9h13n3o5m#::M(C₉H₁₃N₃O₅) = 243,22 g/mol
::c9h12n2o6m#::M(C₉H₁₂N₂O₆) = 244,2 g/mol
::ch3ohm#::M(CH₃OH) = 32,04 g/mol
::ch3ch2ohm#::M(CH₃CH₂OH) = 46,07 g/mol
::ch3chohch3m#::M(CH₃CHOHCH₃) = 60,1 g/mol
::ch2ohch2ohm#::M(CH₂OHCH₂OH) = 62,07 g/mol
::ch33cohm#::M((CH₃)₃COH) = 74,12 g/mol
::c6h11ohm#::M(C₆H₁₁OH) = 100,16 g/mol
::c6h5-ch2ohm#::M(C₆H₅-CH₂OH) = 108,13 g/mol
::c6h5ohm#::M(C₆H₅OH) = 94,11 g/mol
::o=c6h4=om#::M(O=C₆H₄=O) = 108,09 g/mol
::ch3c6h4ohm#::M(CH₃C₆H₄OH) = 108,14 g/mol
::c6h4oh2m#::M(C₆H₄(OH)₂) = 110,11 g/mol
::c6h3oh3m#::M(C₆H₃(OH)₃) = 126,11 g/mol
::clc6h4ohm#::M(ClC₆H₄OH) = 128,56 g/mol
::hoc6h4no2m#::M(HOC₆H₄NO₂) = 139,11 g/mol
::c10h7ohm#::M(C₁₀H₇OH) = 144,17 g/mol
::c12h10o4m#::M(C₁₂H₁₀O₄) = 218,2 g/mol
::hoc6h2no23m#::M(HOC₆H₂(NO₂)₃) = 229,1 g/mol
::c2h4om#::M(C₂H₄O) = 44,05 g/mol
::ch32om#::M((CH₃)₂O) = 46,07 g/mol
::ch3och2ch3m#::M(CH₃OCH₂CH₃) = 60,09 g/mol
::c4h4om#::M(C₄H₄O) = 68,07 g/mol
::ch24om#::M((CH₂)₄O) = 72,11 g/mol
::ch3ch22om#::M((CH₃CH₂)₂O) = 74,12 g/mol
::ch33coch3m#::M((CH₃)₃COCH₃) = 88,15 g/mol
::-ch2och22-m#::M(-(CH₂OCH₂)₂-) = 88,1 g/mol
::hoch2ch22om#::M((HOCH₂CH₂)₂O) = 106,12 g/mol
::ch3oc6h5m#::M(CH₃OC₆H₅) = 108,14 g/mol
::c9h6o2m#::M(C₉H₆O₂) = 146,15 g/mol
::c6h52om#::M((C₆H₅)₂O) = 170,21 g/mol
::c11h12o3m#::M(C₁₁H₁₂O₃) = 192,22 g/mol
::c6h5ch22om#::M((C₆H₅CH₂)₂O) = 198,27 g/mol
::c12h24o6m#::M(C₁₂H₂₄O₆) = 264,32 g/mol
::hchom#::M(HCHO) = 30,03 g/mol
::-ch2-o3m#::M(-(CH₂-O)₃) = 90,08 g/mol
::ch3chom#::M(CH₃CHO) = 44,05 g/mol
::-chch3-o3-m#::M(-(CH(CH₃)-O)₃-) = 344,05 g/mol
::h-co-co-hm#::M(H-CO-CO-H) = 58,04 g/mol
::ch3ch2chom#::M(CH₃CH₂CHO) = 58,08 g/mol
::ch2=chchom#::M(CH₂=CHCHO) = 56,07 g/mol
::ch3ch22chom#::M(CH₃(CH₂)₂CHO) = 72,11 g/mol
::ch32chchom#::M((CH₃)₂CHCHO) = 72,11 g/mol
::ch3ch23chom#::M(CH₃(CH₂)₃CHO) = 86,13 g/mol
::ch33cchom#::M((CH₃)₃CCHO) = 86,13 g/mol
::c7h6om#::M(C₇H₆O) = 106,12 g/mol
::c6h5chom#::M(C₆H₅CHO) = 106,12 g/mol
::c20h28om#::M(C₂₀H₂₈O) = 284,44 g/mol
::ch2=c=om#::M(CH₂=C=O) = 42,04 g/mol
::ch32com#::M((CH₃)₂CO) = 58,08 g/mol
::ch3cococh3m#::M(CH3COCOCH3) = 86,09 g/mol
::ch3ch22com#::M((CH₃CH₂)₂CO) = 86,13 g/mol
::c6h10om#::M(C₆H₁₀O) = 98,15 g/mol
::c6h5coch3m#::M(C₆H₅COCH₃) = 120,15 g/mol
::c5h4ncoch3m#::M(C₅H₄NCOCH₃) = 121,13 g/mol
::c10h14om#::M(C₁₀H₁₄O) = 150,22 g/mol
::c10h16om#::M(C₁₀H₁₆O) = 152,24 g/mol
::c6h8o6m#::M(C₆H₈O₆) = 176,12 g/mol
::c9h6o4m#::M(C₉H₆O₄) = 178,14 g/mol
::c6h5coc6h5m#::M(C₆H₅COC₆H₅) = 182,22 g/mol
::c13h20om#::M(C₁₃H₂₀O) = 192,3 g/mol
::c17h19o3nm#::M(C₁₇H₁₉O₃N) = 285,34 g/mol
::c19h28o2m#::M(C₁₉H₂₈O₂) = 288,42 g/mol
::c18h27o3nm#::M(C₁₈H₂₇O₃N) = 305,41 g/mol
::c5h10o5m#::M(C₅H₁₀O₅) = 150,13 g/mol
::c5h10o4m#::M(C₅H₁₀O₄) = 134,13 g/mol
::c6h12o6m#::M(C₆H₁₂O₆) = 180,16 g/mol
::c6h12o6h2om#::M(C₆H₁₂O₆∙H₂O) = 198,18 g/mol
::c12h22o11m#::M(C₁₂H₂₂O₁₁) = 342,3 g/mol
::c6h10o5nm#::M((C₆H₁₀O₅)ₙ) = ,00 g/mol
::hcoohm#::M(HCOOH) = 46,03 g/mol
::hcoo-m#::M(HCOO⁻) = 45,02 g/mol
::ch3coohm#::M(CH₃COOH) = 60,05 g/mol
::ch3coo-m#::M(CH₃COO⁻) = 59,05 g/mol
::ch2=chcoohm#::M(CH₂=CHCOOH) = 72,06 g/mol
::ch3ch2coohm#::M(CH₃CH₂COOH) = 74,09 g/mol
::ch3cooohm#::M(CH₃C(O)OOH) = 76,05 g/mol
::ch2ohcoohm#::M(CH₂OHCOOH) = 76,05 g/mol
::ch2ohcoo-m#::M(CH₂OHCOO⁻) = 75,04 g/mol
::ch2fcoohm#::M(CH₂FCOOH) = 78,04 g/mol
::ch3cocoohm#::M(CH₃COCOOH) = 88,06 g/mol
::ch3cocoo-m#::M(CH₃COCOO⁻) = 87,06 g/mol
::ch32chcoohm#::M((CH₃)₂CHCOOH) = 88,12 g/mol
::cooh2m#::M((COOH)₂) = 90,04 g/mol
::ch2clcoohm#::M(CH₂ClCOOH) = 94,5 g/mol
::cch33coohm#::M(C(CH₃)₃COOH) = 102,13 g/mol
::ch2cooh2m#::M(CH₂(COOH)₂) = 104,6 g/mol
::ch2cooh2m#::M((CH₂COOH)₂) = 118,09 g/mol
::chohcooh2m#::M(CHOH(COOH)₂) = 120,6 g/mol
::c7h6o2m#::M(C₇H₆O₂) = 122,13 g/mol
::chcl2coohm#::M(CHCl₂COOH) = 128,94 g/mol
::ch2brcoohm#::M(CH₂BrCOOH) = 138,95 g/mol
::ccl3coohm#::M(CCl₃COOH) = 163,39 g/mol
::ch2icoohm#::M(CH₂ICOOH) = 185,95 g/mol
::c6h8o7m#::M(C₆H₈O₇) = 192,12 g/mol
::c6h8o7h2om#::M(C₆H₈O₇∙H₂O) = 210,14 g/mol
::c6h7o7-m#::M(C₆H₇O₇⁻) = 191,12 g/mol
::c6h6o72-m#::M(C₆H₆O₇²⁻) = 190,11 g/mol
::c6h5o73-m#::M(C₆H₅O₇³⁻) = 189,1 g/mol
::c6h7o7-m#::M(C₆H₇O₇⁻) = ,00 g/mol
::c6h6o72-m#::M(C₆H₆O₇²⁻) = ,00 g/mol
::c6h5o73-m#::M(C₆H₅O₇³⁻) = ,00 g/mol
::c18h30o2m#::M(C₁₈H₃₀O₂) = 278,43 g/mol
::c18h32o2m#::M(C₁₈H₃₂O₂) = 280,43 g/mol
::ch3c=o2om#::M((CH₃C=O)₂O) = 102,09 g/mol
::c6h4c=o2om#::M(C₆H₄(C=O)₂O) = 148,12 g/mol
::c6h5c=o2om#::M((C₆H₅C=O)₂O) = 226,23 g/mol
::ch3c=oclm#::M(CH₃C(=O)Cl) = 78,5 g/mol
::c=ocl2m#::M(C(=O)Cl₂) = 98,92 g/mol
::ch3c=obrm#::M(CH₃C(=O)Br) = 122,95 g/mol
::c6h5c=oclm#::M(C₆H₅C(=O)Cl) = 140,57 g/mol
::hc=onh2m#::M(HC(=O)NH₂) = 45,04 g/mol
::ch3c=onh2m#::M(CH₃C(=O)NH₂) = 59,07 g/mol
::c=onh22m#::M(C(=O)(NH₂)₂) = 60,06 g/mol
::c6h5c=onh2m#::M(C₆H₅C(=O)NH₂) = 121,14 g/mol
::ch3-cnm#::M(CH₃-CN) = 41,05 g/mol
::ch2=ch-cnm#::M(CH₂=CH-CN) = 53,06 g/mol
::ch3ch2cnm#::M(CH₃CH₂CN) = 55,08 g/mol
::c6h5cnm#::M(C₆H₅CN) = 103,12 g/mol
::nc-ch24-cnm#::M(NC-(CH₂)₄-CN) = 108,14 g/mol
::c2h3nm#::M(C₂H₃N) = 41,05 g/mol
::c7h5nm#::M(C₇H₅N) = 103,12 g/mol
::hcooch3m#::M(HCOOCH₃) = 60,05 g/mol
::hcooch2ch3m#::M(HCOOCH₂CH₃) = 74,08 g/mol
::ch3cooch3m#::M(CH₃COOCH₃) = 74,08 g/mol
::ch3ono2m#::M(CH₃ONO₂) = 77,04 g/mol
::ch3ch2ono2m#::M(CH₃CH₂ONO₂) = 91,07 g/mol
::c6h5cooch3m#::M(C₆H₅COOCH₃) = 136,15 g/mol
::c3h5n3o9m#::M(C₃H₅N₃O₉) = 227,09 g/mol
::c39h74o6m#::M(C₃₉H₇₄O₆) = 639,00 g/mol
::c45h86o6m#::M(C₄₅H₈₆O₆) = 723,16 g/mol
::c51h98o6m#::M(C₅₁H₉₈O₆) = 807,32 g/mol
::c57h110o6m#::M(C₅₇H₁₁₀O₆) = 891,48 g/mol
::c57h104o6m#::M(C₅₇H₁₀₄O₆) = 885,43 g/mol
::c3h9o6pm#::M(C₃H₉O₆P) = 172,07 g/mol
::c3h8o6p-m#::M(C₃H₈O₆P⁻) = ,00 g/mol
::c3h7o6p2-m#::M(C₃H₇O₆P²⁻) = ,00 g/mol
::c6h13o9pm#::M(C₆H₁₃O₉P) = 260,14 g/mol
::c6h12o9p-m#::M(C₆H₁₂O₉P⁻) = ,00 g/mol
::c6h11o9p2-m#::M(C₆H₁₁O₉P²⁻) = ,00 g/mol
::nh2ch2coohm#::M(NH₂CH₂COOH) = 75,07 g/mol
::nh2ch2coo-m#::M(NH₂CH₂COO⁻) = ,00 g/mol
::c6h9n3o2m#::M(C₆H₉N₃O₂) = 155,16 g/mol
::c6h13no2m#::M(C₆H₁₃NO₂) = 131,18 g/mol
::c6h14n2o2m#::M(C₆H₁₄N₂O₂) = 146,19 g/mol
::c5h9no2m#::M(C₅H₉NO₂) = 115,13 g/mol
::c5h9no3m#::M(C₅H₉NO₃) = 131,13 g/mol
::-ch2-ohm#::M(-CH₂-OH) = 105,09 g/mol
::ch3ch2shm#::M(CH₃CH₂SH) = 62,13 g/mol
::ch3csnh2m#::M(CH₃CSNH₂) = 75,13 g/mol
::ch3coshm#::M(CH₃COSH) = 76,12 g/mol
::ch32chshm#::M((CH₃)₂CHSH) = 76,16 g/mol
::ch32som#::M((CH₃)₂SO) = 78,13 g/mol
::c4h4sm#::M(C₄H₄S) = 84,14 g/mol
::ch3ch22sm#::M((CH₃CH₂)₂S) = 90,19 g/mol
::c6h5shm#::M(C₆H₅SH) = 110,18 g/mol
::cich2ch22sm#::M((CICH₂CH₂)₂S) = 159,08 g/mol
::c6h5so3hm#::M(C₆H₅SO₃H) = 158,18 g/mol
::c6h52sm#::M((C₆H₅)₂S) = 186,28 g/mol
::c6h52som#::M((C₆H₅)₂SO) = 202,28 g/mol
::c6h52so2m#::M((C₆H₅)₂SO₂) = 218,27 g/mol
::nh42co3m#::M((NH₄)₂CO₃) = 96,09 g/mol
::alno33m#::M(Al(NO₃)₃) = 213,00 g/mol
::ali3m#::M(AlI₃) = 407,7 g/mol
::bai2m#::M(BaI₂) = 391,14 g/mol
::c2h2o2m#::M(C₂H₂O₂) = 58,04 g/mol
::c2h5ohm#::M(C₂H₅OH) = 46,07 g/mol
::c2h5onam#::M(C₂H₅ONa) = 68,05 g/mol
::caso3m#::M(CaSO₃) = 120,14 g/mol
::ch2oh2m#::M(CH₂(OH)₂) = 32,04 g/mol
::ch2chohm#::M(CH₂CHOH) = 44,05 g/mol
::ch2com#::M(CH₂CO) = 42,04 g/mol
::ch2om#::M(CH₂O) = 30,03 g/mol
::ch3coonam#::M(CH₃COONa) = 82,03 g/mol
::ch3och3m#::M(CH₃OCH₃) = 46,07 g/mol
::crno33m#::M(Cr(NO₃)₃) = 238,01 g/mol
::cuno32m#::M(Cu(NO₃)₂) = 187,56 g/mol
::feoh2m#::M(Fe(OH)₂) = 73,86 g/mol
::k3po4m#::M(K₃PO₄) = 212,27 g/mol
::lino3m#::M(LiNO₃) = 68,95 g/mol
::mnno32m#::M(Mn(NO₃)₂) = 178,95 g/mol
::na2hpo3m#::M(Na₂HPO₃) = 125,96 g/mol
::na2hpo4m#::M(Na₂HPO₄) = 141,96 g/mol
::nah2po4m#::M(NaH₂PO₄) = 119,98 g/mol
::nh4ohm#::M(NH₄OH) = 35,05 g/mol
::ni3m#::M(NI₃) = 394,72 g/mol
::no2+m#::M(NO₂⁺) = 46,01 g/mol
::n3-m#::M(N³⁻) = 14,01 g/mol
::crno32m#::M(Cr(NO₃)₂) = 176,01 g/mol
::feno32m#::M(Fe(NO₃)₂) = 179,86 g/mol
::feso3m#::M(FeSO₃) = 135,91 g/mol
::feso4m#::M(FeSO₄) = 151,91 g/mol
::feno33m#::M(Fe(NO₃)₃) = 241,86 g/mol
::cono23m#::M(Co(NO₂)₃) = 440,93 g/mol
::nino32m#::M(Ni(NO₃)₂) = 182,7 g/mol
::cuno3m#::M(CuNO₃) = 125,55 g/mol
::cu3po4m#::M(Cu₃PO₄) = 285,61 g/mol
::cui2m#::M(CuI₂) = 317,36 g/mol
::hgno32m#::M(Hg(NO₃)₂) = 324,6 g/mol
::nh42sm#::M((NH₄)₂S) = 68,14 g/mol
::nh4fm#::M(NH₄F) = 37,04 g/mol
::nh4im#::M(NH₄I) = 144,94 g/mol
::fescn2+m#::M(FeSCN²⁺) = 113,93 g/mol
::agn3m#::M(AgN₃) = 149,89 g/mol
::ba3n2m#::M(Ba₃N₂) = 439,99 g/mol
::baso3m#::M(BaSO₃) = 217,39 g/mol
::ch3cnm#::M(CH₃CN) = 41,05 g/mol
::cubr2m#::M(CuBr₂) = 223,35 g/mol
::cuf2m#::M(CuF₂) = 101,54 g/mol
::fei2m#::M(FeI₂) = 309,66 g/mol
::fei3m#::M(FeI₃) = 436,56 g/mol
::hbro3m#::M(HBrO₃) = 128,91 g/mol
::k2so3m#::M(K₂SO₃) = 158,26 g/mol
::k3po3m#::M(K₃PO₃) = 196,27 g/mol
::kclo2m#::M(KClO₂) = 106,55 g/mol
::li2sm#::M(Li₂S) = 45,95 g/mol
::mgso3m#::M(MgSO₃) = 104,37 g/mol
::na3po3m#::M(Na₃PO₃) = 147,94 g/mol
::na3po4m#::M(Na₃PO₄) = 163,94 g/mol
::nh2coohm#::M(NH₂COOH) = 61,04 g/mol
::nh4brm#::M(NH₄Br) = 97,94 g/mol
::zn3n2m#::M(Zn₃N₂) = 224,18 g/mol
::zn3p2m#::M(Zn₃P₂) = 258,12 g/mol
::hbo32-m#::M(HBO₃²⁻) = 59,82 g/mol
::na3pm#::M(Na₃P) = 99,94 g/mol
::k3nm#::M(K₃N) = 131,3 g/mol
::k3pm#::M(K₃P) = 148,27 g/mol
::ba3p2m#::M(Ba₃P₂) = 473,93 g/mol
::baf2m#::M(BaF₂) = 175,32 g/mol
::fe3n2m#::M(Fe₃N₂) = 195,55 g/mol
::fe3p2m#::M(Fe₃P₂) = 229,49 g/mol
::fef3m#::M(FeF₃) = 112,84 g/mol
::cuco3m#::M(CuCO₃) = 123,56 g/mol
::cuso3m#::M(CuSO₃) = 143,61 g/mol
::cu3n2m#::M(Cu₃N₂) = 218,65 g/mol
::cu3p2m#::M(Cu₃P₂) = 252,59 g/mol
::pbs2m#::M(PbS₂) = 271,33 g/mol
::pbi4m#::M(PbI₄) = 714,82 g/mol
::c6h13brm#::M(C₆H₁₃Br) = 165,07 g/mol
::c7h15brm#::M(C₇H₁₅Br) = 179,1 g/mol
::c4h8sm#::M(C₄H₈S) = 88,17 g/mol
::feoh3m#::M(Fe(OH)₃) = 106,87 g/mol
::alx#::aluminum
::al3+x#::aluminum(III) ion
::albr3x#::aluminum tribromide
::al4c3x#::aluminum carbide
::alcl3x#::aluminum chloride
::alcl36h2ox#::aluminum chloride hexahydrate
::alf3x#::aluminum fluoride
::aloh3x#::aluminum hydroxide
::alno339h2ox#::aluminum nitrate nonahydrate
::al2o3x#::aluminum oxide
::alpo4x#::aluminum phosphate
::al2so43x#::aluminum sulfate
::al2so4318h2ox#::aluminum sulfate hydrate
::sbx#::gray antimony
::sbcl3x#::antimony(III) chloride
::sbcl5x#::antimony pentachloride
::sbh3x#::stibine
::sb2o3x#::antimony trioxide
::sb2o5x#::antimony pentoxide
::sboclx#::antimony(III) oxychloride
::sb2s3x#::antimony(III) sulfide
::sb2s5x#::antimony(V) sulfide
::h3sbo4x#::arsenic acid, solid
::arx#::argon
::asx#::gray arsenic
::as4x#::yellow arsenic
::ascl3x#::arsenic trichloride
::ash3x#::arsine
::as2o3x#::arsenic trioxide
::as2o5x#::arsenic pentoxide
::as2s3x#::arsenic trisulfide
::h3aso4x#::arsenic acid, solid
::aso43-x#::arsenate
::bax#::barium
::ba2+x#::barium(II) ion
::babr2x#::barium bromide
::baco3x#::barium carbonate
::bacl2x#::barium chloride
::bacl22h2ox#::barium chloride dihydrate
::bacro4x#::barium chromate
::bah2x#::barium hydride
::baoh2x#::barium hydroxide
::baoh28h2ox#::barium hydroxide octahydrate
::bano32x#::barium nitrate
::baox#::barium oxide
::bao2x#::barium peroxide
::baso4x#::barium sulfate
::bex#::beryllium
::be2+x#::berylium(II) ion
::becl2x#::beryllium chloride
::beno323h2ox#::nitric acid, beryllium salt, trihydrate
::beox#::beryllium oxide
::beso44h2ox#::beryllium sulfate tetrahydrate
::bix#::bismuth
::bicl3x#::bismuth chloride
::bicl4x#::bismuth chloride
::bino335h2ox#::bismuth(III) nitrate pentahydrate
::bioclx#::bismuth(III) oxychloride
::pbx#::lead
::pb2+x#::lead(II) ion
::pbn32x#::lead(II) azide
::pbbr2x#::lead(II) bromide
::pbcl2x#::lead(II) chloride
::pbcl4x#::lead tetrachloride
::pbcro4x#::lead(II) chromate
::pboh2x#::lead(II) hydroxide
::pbi2x#::lead iodide
::pbno32x#::lead(II) nitrate
::pbox#::lead monoxide
::pbo2x#::lead dioxide
::pb3o4x#::lead(II,IV) oxide
::pbsx#::lead sulfide
::pbso4x#::lead(II) sulfate
::pbc2h54x#::lead tetraethyl
::pbch34x#::tetramethyllead
::bx#::boron
::bnx#::boron nitride
::b2o3x#::boron oxide
::h3bo3x#::boric acid
::h2bo3-x#::dihydrogen borate
::bf3x#::boron trifluoride
::b2h6x#::diborane
::b5h9x#::pentaborane(9)
::brx#::bromine
::br2x#::bromine
::bro3-x#::bromate
::br-x#::bromide
::hbrx#::hydrogen bromide
::cdx#::cadmium
::cdbr2x#::cadmium bromide
::cdbr24h2ox#::cadmium bromide tetrahydrate
::cdcl2x#::cadmium chloride
::cdoh2x#::cadmium hydroxide
::cdi2x#::cadmium iodide
::cdox#::chlordiazepoxide
::cdso4x#::cadmium sulfate
::cdso43/8h2ox#::cadmium sulfate monohydrate
::cdsx#::cadmium sulfide
::cax#::calcium
::ca2+x#::calcium(II) ion
::ch3coo2cah2ox#::calcium acetate
::caal2si2o8x#::anorthite
::cabr2x#::calcium bromide
::cac2x#::calcium carbide
::caco3 calcitx#::calcium carbonate
::caco3x#::calcium carbonate
::cacl2x#::calcium chloride
::cacl26h2ox#::calcium chloride hexahydrate
::caf2x#::calcium fluoride
::cah2x#::calcium hydride
::cahpo42h2ox#::brushite
::caoh2x#::calcium hydroxide
::ca5po43ohx#::hydroxyapatite
::cai2x#::calcium iodide
::cano32x#::calcium nitrate
::ca3n2x#::calcium nitride
::c2o4cax#::calcium oxalate
::c2o4cah2ox#::calcium oxalate hydrate
::caox#::calcium oxide
::cao2x#::calcium peroxide
::ca3po42x#::tricalcium diphosphate
::c17h35coo2cax#::calcium stearate
::caso4x#::calcium sulfate
::caso4½h2ox#::plaster of paris
::caso42h2ox#::calcium sulfate dihydrate
::casx#::calcium sulfide
::cx#::activated charcoal
::c2x#::carbon dimer
::cx#::carbon
::c60x#::buckminsterfullerene
::co2x#::carbon dioxide
::h2co3x#::carbonic acid
::hco3-x#::hydrogen carbonate
::co32-x#::carbonate
::cs2x#::carbon disulfide
::cox#::carbon monoxide
::cocl2x#::phosgene
::cosx#::carbonyl sulfide
::hcnx#::hydrogen cyanide
::cn-x#::cyanide
::ocn-x#::cyanate
::cn2x#::cyanogen
::scn-x#::thiocyanate
::cex#::cerium
::cecl3x#::cerous chloride
::ceno336h2ox#::cerium(III) nitrate hexahydrate
::ce2o3x#::cerium(III) oxide
::ce2so43x#::cerium(III) sulfate
::ceso42x#::ceric sulfate
::clx#::chlorine
::cl2x#::chlorine
::cl-x#::chloride
::clo2x#::chlorine dioxide
::cl2ox#::chlorine monoxide
::hclx#::hydrogen chloride
::cl2o7x#::dichlorine heptoxide
::hclo3x#::chloric acid
::clo3-x#::chlorate
::hclo2x#::chlorous acid
::clo2-x#::chlorite
::hclox#::hypochlorous acid
::clo-x#::hypochlorite
::hclo4x#::perchloric acid
::clo4-x#::perchlorate
::crx#::chromium
::cr2+x#::chromium(II) ion
::cr3+x#::chromium(III) ion
::cro42-x#::chromate
::h2cro4x#::chromic acid
::crcl2x#::chromous chloride
::crcl3x#::chromic chloride
::crcl36h2ox#::chromium(III) chloride hexahydrate
::crox#::chromium monoxide
::cr2o3x#::chromium(III) oxide
::cro2x#::magtrieve™
::cro3x#::chromium trioxide
::cro2cl2x#::chromyl chloride
::cr2so43x#::chromium sulfate
::crco6x#::chromium(0) carbonyl
::cox#::cobalt
::co2+x#::cobalt(II) ion
::coco3x#::cobaltous carbonate
::cocl2x#::cobalt dichloride
::cocl22h2ox#::cobalt(II) chloride dihydrate
::cocl26h2ox#::cobalt(II) chloride hexahydrate
::cocl3x#::cobalt trichloride
::cooh2x#::cobalt(II) hydroxide
::cono326h2ox#::cobaltous nitrate hexahydrate
::coox#::cobalt monoxide
::co2o3x#::cobalt(III) oxide
::co3o4x#::cobalt(II,III) oxide
::coso4x#::cobalt(II) sulfate
::coso47h2ox#::cobalt sulfate heptahydrate
::csx#::cesium
::csbrx#::cesium bromide
::csclx#::cesium chloride
::csfx#::sargramostim
::cshx#::caesium hydride
::csohx#::cesium hydroxide
::csix#::cesium iodide
::cs2ox#::cesium oxide
::fx#::fluorine
::f2x#::fluorine
::f-x#::fluoride
::f2ox#::oxygen difluoride
::hfx#::hydrogen fluoride
::gex#::germanium
::geh4x#::germane
::ge2h6x#::digermane
::geo2x#::germanium dioxide
::aux#::gold
::auclx#::gold(I) chloride
::aucl3x#::gold(III) chloride
::hex#::helium
::hx#::hydrogen
::h2x#::hydrogen
::h+x#::hydrogen(I) ion
::h-x#::hydride
::d2ox#::heavy water
::h3o+x#::hydronium ion
::ix#::iodine
::i2x#::iodine
::i-x#::iodide
::hix#::hydrogen iodide
::hio3x#::iodic acid
::io3-x#::iodate
::in3x#::iodine azide
::ibrx#::iodine bromide
::iclx#::iodine monochloride
::icl3x#::iodine trichloride
::i2o5x#::iodopentoxide
::fex#::iron
::fe2+x#::iron(II) ion
::fe3+x#::iron(III) ion
::fe3cx#::iron carbide
::feco3x#::iron(II) carbonate
::fecl2x#::iron(II) chloride
::fecl22h2ox#::iron(II) chloride dihydrate
::fecl24h2ox#::iron(II) chloride tetrahydrate
::fecl3x#::iron(III) chloride
::fecl36h2ox#::iron(III) chloride hexahydrate
::fes2x#::pyrite
::feno339h2ox#::iron(III) nitrate nonahydrate
::feox#::iron(II) oxide
::fe0.947ox#::wüstite
::fe2o3x#::iron(III) oxide
::fe3o4x#::iron(II,III) oxide
::fepo42h2ox#::iron(III) phosphate dihydrate
::fesx#::ferrous sulfide
::fe2s3x#::iron sulfide
::feso47h2ox#::ironate
::fe2so43x#::ferric sulfate
::feco5x#::iron(0) pentacarbonyl
::fec5h52x#::ferrocene
::kx#::potassium
::k+x#::potassium(I) ion
::kalso4212h2ox#::potassium aluminum sulfate dodecahydrate
::kbro3x#::potassium bromate
::kbrx#::potassium bromide
::k2co3x#::pearl ash
::kclo3x#::potassium chlorate
::kclx#::potassium chloride
::k2cro4x#::potassium chromate
::kcnx#::potassium cyanide
::kocnx#::potassium cyanate
::k2cr2o7x#::potassium dichromate
::kh2po4x#::potassium dihydrogen phosphate
::kfx#::potassium fluoride
::k4fecn63h2ox#::potassium ferrocyanide trihydrate
::k3fecn6x#::potassium hexacyanoferrate(III)
::khx#::potassium hydride
::khco3x#::potassium bicarbonate
::khf2x#::potassium bifluoride
::kohx#::potassium hydroxide
::kio3x#::potassium iodate
::kix#::potassium iodide
::k2mno4x#::potassium manganate
::kno3x#::potassium nitrate
::kno2x#::potassium nitrite
::k2ox#::potassium oxide
::kclo4x#::potassium perchlorate
::kio4x#::potassium periodate
::kmno4x#::potassium permanganate
::k2o2x#::potassium peroxide
::k2o3sooso3x#::potassium persulfate
::k2s2o7x#::potassium pyrosulfate
::ko2x#::potassium superoxide
::k2so4x#::potassium sulfate
::k2sx#::potassium polysulfide
::kscnx#::potassium thiocyanate
::cux#::copper
::cu+x#::copper(I) ion
::cu2+x#::copper(II) ion
::ch3coo2cuh2ox#::copper(II) acetate monohydrate
::cu2oh2co3x#::malachite
::cu3oh2co32x#::azurite
::cuclx#::cuprous chloride
::cucl2x#::copper(II) chloride
::cucl22h2ox#::copper(II)chloride dihydrate
::cuoh2x#::copper hydroxide
::cuix#::cuprous iodide
::cuno323h2ox#::copper(II) nitrate trihydrate
::cu2ox#::copper(I) oxide
::cuox#::cupric oxide
::cu2so4x#::cuprous sulfate
::cuso4x#::copper(II) sulfate
::cuso45h2ox#::copper(II) sulfate pentahydrate
::cu2sx#::copper(I) sulfide
::cusx#::cupric sulfide
::krx#::krypton
::krf2x#::krypton difluoride
::hgx#::mercury
::hg22+x#::mercury(+1) ion
::hg2+x#::mercury(II) ion
::hg2br2x#::mercury(I) bromide
::hgbr2x#::mercuric bromide
::hg2cl2x#::mercury(I) chloride
::hgcl2x#::mercuric chloride
::hg2i2x#::mercury(I) iodide
::hgi2x#::mercury(II) iodide
::hg2no322h2ox#::mercury(I) nitrate dihydrate
::hgno32½h2ox#::mercury(II) nitrate monohydrate
::hg2ox#::mercury(I) oxide
::hgox#::mercuric oxide
::hgsx#::mercury(II) sulfide
::hg2so4x#::mercury(I) sulfate
::lix#::lithium
::li+x#::lithium(I) ion
::lialh4x#::lithium aluminum hydride
::libh4x#::lithium borohydride
::librx#::lithium bromide
::li2co3x#::lithium carbonate
::liclx#::lithium chloride
::lifx#::lithium fluoride
::lihx#::lithium hydride
::liohx#::lithium hydroxide
::liix#::lithium iodide
::li2ox#::lithium oxide
::li2so4h2ox#::lithium sulfate monohydrate
::mgx#::magnesium
::mg2+x#::magnesium(II) ion
::mgbr2x#::magnesium bromide
::mgco3x#::magnesium carbonate
::mgcl2x#::magnesium chloride
::mgcl26h2ox#::magnesium chloride hexahydrate
::mgoh2x#::magnesium hydroxide
::mgi2x#::magnesium iodide
::mgno32x#::magnesium nitrate
::mgno326h2ox#::magnesium nitrate hexahydrate
::mg3n2x#::magnesium nitride
::mgox#::magnesium oxide
::mgclo42x#::magnesium perchlorate
::mgclo426h2ox#::magnesium perchlorate hexahydrate
::mgso4x#::magnesium sulfate
::mgso47h2ox#::magnesium sulfate heptahydrate
::mgsx#::magnesium sulfide
::mnx#::manganese
::mn2+x#::manganese(II) ion
::mn3+x#::manganese(III) ion
::mno4-x#::permanganate
::mnco3x#::manganese carbonate
::mncl24h2ox#::manganese(II) chloride tetrahydrate
::mnoohx#::manganite
::mnoh2x#::manganese hydroxide
::mn3o4x#::manganese(II,III) oxide
::mnox#::manganese monoxide
::mn2o3x#::manganese(III) oxide
::mno2x#::manganese dioxide
::mnso4x#::manganese(II) sulfate
::mnsx#::manganese sulfide
::mn2co10x#::manganese(0) carbonyl
::mox#::molybdenum
::moo2x#::molybdenum dioxide
::moo3x#::molybdenum trioxide
::h2moo4h2ox#::molybdic acid
::moco6x#::molybdenum(0) hexacarbonyl
::nax#::sodium
::na+x#::sodium(I) ion
::ch3coona3h2ox#::sodium acetate trihydrate
::nanh2x#::sodium amide
::naaso2x#::sodium arsenite
::nan3x#::sodium azide
::c6h5-coonax#::sodium benzoate
::na2b4o7x#::sodium tetraborate
::na2b4o710h2ox#::sodium borate decahydrate
::nabh4x#::sodium borohydride
::nabrx#::sodium bromide
::nabr2h2ox#::sodium bromide dihydrate
::nabro3x#::sodium bromate
::na2co3x#::soda ash
::na2co310h2ox#::sodium carbonate decahydrate
::naclo3x#::sodium chlorate
::naclx#::sodium chloride
::naclo2x#::sodium chlorite
::na2cr2o72h2ox#::sodium dichromate dihydrate
::nah2po4h2ox#::sodium dihydrogen phosphate monohydrate
::na2s2o62h2ox#::sodium dithionate dihydrate
::ch3ch2onax#::sodium ethylate
::nafx#::sodium fluoride
::hcoonax#::sodium formate
::na3cono26x#::sodium hexanitrocobaltate
::na3alf6x#::sodium hexafluoroaluminate
::napo36x#::sodium hexametaphosphate
::nahx#::sodium hydride
::na2haso47h2ox#::disodium hydrogen arsenate heptahydrate
::nahco3x#::sodium bicarbonate
::nahso4x#::sodium bisulfate
::nahsx#::sodium bisulfide
::nahso3x#::sodium bisulfite
::naohx#::sodium hydroxide
::naio3x#::sodium iodate
::naix#::sodium iodide
::nai2h2ox#::sodium iodide dihydrate
::ch3onax#::sodium methoxide
::nano3x#::sodium nitrate
::na3nx#::sodium nitride
::nano2x#::sodium nitrite
::c17h33coonax#::sodium oleate
::na2c2o4x#::sodium oxalate
::na2ox#::sodium oxide
::naclo4x#::sodium perchlorate
::na2o2x#::sodium peroxide
::na2s2o8x#::sodium persulfate
::na2s2o5x#::sodium metabisulfite
::na2sio3x#::sodium metasilicate
::c17h35coonax#::sodium stearate
::na2so4x#::sodium sulfate
::na2so410h2ox#::sodium sulfate decahydrate
::na2sx#::sodium sulfide
::na2so3x#::sodium sulfite
::na3sbs49h2ox#::sodium thioantimonate nonahydrate
::na2s2o3x#::sodium hyposulfite
::na2s2o35h2ox#::sodium thiosulfate
::na5p3o10x#::polygon
::w2o42h2ox#::sodium tungstate dihydrate
::nex#::neon
::nix#::nickel
::ni2+x#::nickel(II) ion
::nibr2x#::nickel bromide
::nicl2x#::nickel(II) chloride
::nicl26h2ox#::nickel(II) chloride hexahydrate
::nioh2x#::nickel(II) hydroxide
::nino326h2ox#::nickel(II) nitrate hexahydrate
::niox#::nickel monoxide
::niso4x#::nickel(II) sulfate
::niso46h2ox#::nickel(II) sulfate hexahydrate
::nisx#::nickel(II) sulfide
::nico4x#::nickel carbonyl
::nx#::nitrogen
::n2x#::nitrogen
::no2x#::nitrogen dioxide
::nox#::nitric oxide
::n2ox#::nitrous oxide
::n2o4x#::dinitrogen tetroxide
::n2o3x#::nitrogen trioxide
::n2o5x#::dinitrogen pentoxide
::nh3x#::ammonia
::nh4+x#::ammonium ion
::nh4clx#::ammonium chloride
::nh42cro4x#::ammonium chromate
::nh42cr2o7x#::ammonium bichromate
::nh4hco3x#::ammonium bicarbonate
::nh4hsx#::ammonium bisulfide
::nh4hso4x#::ammonium bisulfate
::nh42moo4x#::ammonium molybdate
::nh4no3x#::ammonium nitrate
::nh4no2x#::ammonium nitrite
::nh42s2o8x#::ammonium persulfate
::nh42so4x#::ammonium sulfate
::nh4scnx#::ammonium thiocyanate
::nh4vo3x#::ammonium metavanadate
::nh2nh2x#::diazane
::nh2-nh3clx#::hydrazine monohydrochloride
::hn3x#::hydrazoic acid
::nh2ohx#::hydroxylamine
::nh3ohclx#::hydroxylamine hydrochloride
::nh3oh2so4x#::hydroxylamine sulfate
::no3-x#::nitrate
::no2-x#::nitrite
::onclx#::nitrosyl chloride
::hno3x#::nitric acid
::hno2x#::nitrous acid
::ox#::oxygen
::o2x#::oxygen
::o3x#::ozone
::o2-x#::oxide
::h2ox#::water
::o22-x#::peroxide
::h2o2x#::hydrogen peroxide
::oh-x#::hydroxide
::p4x#::white phosphorus
::px#::red phosphorus
::ph3x#::phosphine
::p4o10x#::phosphorus pentoxide
::pcl5x#::phosphorus pentachloride
::h3po4x#::phosphoric acid
::h2po4-x#::dihydrogen phosphate
::hpo42-x#::hydrogen phosphate
::po43-x#::phosphate
::h3po3x#::phosphorous acid
::hpo3nx#::metaphosphoric acid
::pbr3x#::phosphorus tribromide
::pcl3x#::phosphorus trichloride
::ptx#::platinum
::ptcl2x#::platinum(II) chloride
::rbx#::rubidium
::rbclx#::rubidium chloride
::sex#::gray selenium
::h2sex#::hydrogen selenide
::seo2x#::selenium dioxide
::h2seo4x#::selenic acid
::six#::silicon
::sicx#::silicon carbide
::sio2x#::silicon dioxide
::sih4x#::silane
::sicl4x#::silicon tetrachloride
::sif4x#::silicon tetrafluoride
::srx#::strontium
::sr2+x#::strontium(II) ion
::srco3x#::strontium carbonate
::srcl2x#::strontium chloride
::srcro4x#::strontium chromate
::sroh2x#::strontium hydroxide
::sroh28h2ox#::strontium hydroxide octahydrate
::srno32x#::strontium nitrate
::srox#::strontium oxide
::srso4x#::strontium sulfate
::sx#::mixed sulfur
::s8x#::rhombic sulfur
::s2x#::disulfur
::so2x#::sulfur dioxide
::h2so3x#::sulfurous acid
::hso3-x#::hydrogensulfite
::so32-x#::sulfite
::h2sx#::hydrogen sulfide
::hs-x#::hydrogen sulfite
::s2-x#::sulfide
::h2s2o8x#::peroxysulfuric acid
::h2so4x#::sulfuric acid
::hso4-x#::hydrogen sulfate
::so42-x#::sulfate
::so2cl2x#::sulfuryl chloride
::so3x#::sulfur trioxide
::socl2x#::thionyl chloride
::h2nso3hx#::sulfamic acid
::s2o32-x#::thiosulfate
::clso3hx#::chlorosulfonic acid
::sf6x#::sulfur hexafluoride
::agx#::silver
::ag+x#::silver(I) ion
::agbro3x#::silver bromate
::agbrx#::silver bromide
::ag2co3x#::silver(I) carbonate
::agclx#::silver chloride
::ag2cro4x#::silver(I) chromate
::agcnx#::silver cyanide
::agfx#::silver fluoride
::agio3x#::silver iodate
::agix#::silver(I) iodide
::agno3x#::silver nitrate
::ag3po4x#::silver phosphate
::ag2ox#::silver(I) oxide
::agox#::silver(II) oxide
::ag2so4x#::silver sulfate
::ag2sx#::silver(I) sulfide
::thx#::thorium
::thno34x#::thorium nitrate
::tho2x#::thorium(IV) oxide
::snx#::white tin
::sn2+x#::tin(II) ion
::sn4+x#::tin(IV) ion
::sncl22h2ox#::stannous chloride dihydrate
::sncl4x#::stannic chloride
::snh4x#::stannane
::snoh2x#::tin(II) hydroxide
::snox#::(s)-4-nitrostyrene oxide
::sno2x#::stannic oxide
::snso4x#::stannous sulfate
::snsx#::tin(II) sulfide
::sns2x#::tin(IV) sulfide
::tix#::titanium
::ticx#::titanium(IV) carbide
::ticl2x#::titanium(II) chloride
::ticl3x#::titanium trichloride
::ticl4x#::titanium tetrachloride
::tio2x#::titanium dioxide
::ux#::uranium
::u3o8x#::uranium(V,VI) oxide
::uf6x#::uranium hexafluoride
::uo2x#::uranium dioxide
::uo3x#::uranium(VI) oxide
::uo2no326h2ox#::uranyl nitrate hexahydrate
::uo2so43h2ox#::uranyl sulfate trihydrate
::vx#::vanadium
::v2o3x#::vanadium(III) oxide
::v2o5x#::vanadium pentoxide
::v2so43x#::vanadium(III) sulfate
::voso4x#::vanadyl sulfate
::vco6x#::vanadium carbonyl
::wx#::tungsten
::wcx#::tungsten carbide
::wo3x#::tungsten trioxide
::wf6x#::tungsten(VI) fluoride
::xex#::xenon
::xeo3x#::xenon trioxide
::xeo4x#::xenon tetroxide
::xef2x#::xenon difluoride
::xef4x#::xenon tetrafluoride
::xef6x#::xenon hexafluoride
::znx#::zinc
::zn2+x#::zinc(II) ion
::znbr2x#::zinc bromide
::znco3x#::zinc carbonate
::zncl2x#::zinc chloride
::znoh2x#::zinc hydroxide
::zni2x#::zinc iodide
::znno326h2ox#::zinc nitrate hexahydrate
::znox#::zinc oxide
::znso4x#::zinc sulfate
::znso47h2ox#::zinc sulfate heptahydrate
::znsx#::zinc sulfide
::zrx#::zirconium
::zrcl4x#::zirconium tetrachloride
::zro2x#::zirconium(IV) oxide
::zrocl28h2ox#::zirconyl chloride octahydrate
::ch4x#::methane
::c2h6x#::ethane
::c3h8x#::propane
::c4h10x#::butane
::c5h12x#::N-pentane
::c6h14x#::N-hexane
::ch3ch24ch3x#::N-hexane
::c7h16x#::N-heptane
::ch3ch25ch3x#::N-heptane
::c8h18x#::octane
::ch3ch26ch3x#::octane
::c9h20x#::nonane
::c10h22x#::decane
::ch3ch29ch3x#::undecane
::ch3ch210ch3x#::dodecane
::ch3ch211ch3x#::tridecane
::ch3ch212ch3x#::N-tetradecane
::ch3ch213ch3x#::pentadecane
::ch3ch214ch3x#::N-hexadecane
::ch3ch215ch3x#::heptadecane
::ch3ch216ch3x#::N-octadecane
::ch3ch217ch3x#::N-nonadecane
::ch3ch218ch3x#::N-eicosane
::ch33chx#::isobutane
::ch32chch2ch3x#::isopentane
::cch34x#::2,2-dimethylpropane
::ch3chch2ch32x#::3-methylpentane
::ch3ch2cch33x#::2,2-dimethylbutane
::ch32chchch32x#::2,3-dimethylbutane
::ch33cch22ch3x#::2,2-dimethylpentane
::ch32cch2ch32x#::3,3-dimethylpentane
::ch2chch322x#::2,4-dimethylpentane
::c3h6x#::cyclopropane
::c4h8x#::cyclobutane
::c5h10x#::cyclopentane
::c6h12x#::cyclohexane
::c6h11ch3x#::methylcyclohexane
::ch32c6h10x#::1,1-dimethylcyclohexane
::ch2=ch2x#::ethylene
::ch2=chch3x#::propylene
::ch2=c=ch2x#::propadiene
::c3h4x#::cyclopropene
::c4h6x#::cyclobutene
::ch2=c=chch3x#::1,2-butadiene
::ch2=chch=ch2x#::1,3-butadiene
::ch2=chch2ch3x#::1-butene
::ch3ch=chch3x#::cis-2-butene
::ch2=c=cch32x#::3-methyl-1,2-butadiene
::c6h8x#::1,3-cyclohexadiene
::c6h10x#::cyclohexene
::c10h16x#::alpha-pinene
::c40h56x#::beta-carotene
::c2h2x#::acetylene
::hc≡chx#::acetylene
::hc≡cch3x#::methylacetylene
::hc≡cch2ch3x#::1-butyne
::ch3c≡cch3x#::2-butyne
::hc≡c-c≡chx#::1,3-butadiyne
::hc≡cch22ch3x#::1-pentyne
::c6h6x#::benzene
::c10h8x#::naphthalene
::c14h10x#::anthracene
::c18h12x#::benzo(a)anthracene
::c20h12x#::benzo[e]pyrene
::c6h5ch3x#::toluene
::c6h5ch=ch2x#::styrene
::c6h4ch32x#::1,2-dimethylbenzene
::c6h5ch2ch3x#::ethylbenzene
::c6h5chch32x#::cumene
::c6h5-c6h5x#::diphenyl
::ch3clx#::methyl chloride
::chcl=ch2x#::vinyl chloride
::ch3ch2clx#::chloroethane
::ch3ch2ch2clx#::1-chloropropane
::ch3chclch3x#::isopropyl chloride
::ch2cl2x#::methylene chloride
::ch3ch22ch2clx#::butyl chloride
::ch32chch2clx#::isobutyl chloride
::ch33cclx#::2-chloro-2-methylpropane
::ch2=ccl2x#::1,1-dichloroethylene
::chcl=chclx#::cis-1,2-dichloroethylene
::ch3chcl2x#::1,1-dichloroethane
::ch2clch2clx#::ethylene dichloride
::c6h5clx#::chlorobenzene
::chcl3x#::chloroform
::ccl2=chclx#::1,1,2-trichloroethane
::ch3ccl3x#::1,1,1-trichloroethane
::ch2clchcl2x#::1,1,2-trichloroethane
::c6h4cl2x#::dichlorobenzene
::ccl4x#::carbon tetrachloride
::ccl3ccl3x#::hexachloroethane
::c6cl6x#::hexachlorobenzene
::c6h6cl6x#::lindane
::c14h9cl5x#::4,4'-DDT
::chclf2x#::chlorodifluoromethane
::cf4x#::tetrafluoromethane
::cf2=cf2x#::tetrafluoroethylene
::chcl2fx#::dichlorofluoromethane
::cclf3x#::chlorotrifluoromethane
::ccl2f2x#::dichlorodifluoromethane
::cf3chcl2x#::2,2-dichloro-1,1,1-trifluoroethane
::cfcl2cfcl2x#::1,1,2,2-tetrachloro-1,2-difluoroethane
::ch3brx#::bromoform
::ch3ch2brx#::bromoethane
::ch3ch2ch2brx#::1-bromopropane
::ch3chbrch3x#::2-bromopropane
::ch33cbrx#::2-bromo-2-methylpropane
::ch32chch2brx#::isobutyl bromide
::ch3ch22ch2brx#::butyl bromide
::c6h5brx#::bromobenzene
::ch2br2x#::methylene bromide
::chbr=chbrx#::(Z)-1,2-dibromoethene
::ch3chbr2x#::1,1-dibromoethane
::ch2brch2brx#::ethylene dibromide
::c6h4br2x#::1,2-dibromobenzene
::chbr3x#::bromoform
::cbr4x#::carbon tetrabromide
::chbr2chbr2x#::1,1,2,2-tetrabromoethane
::ch3ix#::methyl iodide
::ch3ch2ix#::iodoethane
::ch3ch2chix#::propyl iodide
::ch3chich3x#::isopropyl iodide
::ch3ch22ch2ix#::1-iodobutane
::ch3ch2chich3x#::2-iodobutane
::ch33cix#::2-iodo-2-methylpropane
::c6h5ix#::iodobenzene
::ch2i2x#::methylene iodide
::chi2ch3x#::1,1-dioiodoethane
::ch2ich2ix#::1,2-diiodoethane
::chi3x#::iodoform
::ci4x#::carbon tetraiodide
::ch3nh2x#::methylamine
::ch32nhx#::dimethylamine
::ch3ch2nh2x#::ethylamine
::ch32nh2+x#::dimethylammonium
::ch33nx#::trimethylamine
::ch3ch2ch2nh2x#::N-propylamine
::ch3chnh2ch3x#::2-aminopropane
::h2nch22nh2x#::ethylenediamine
::ch3ch22nhx#::diethylamine
::h2nch23nh2x#::1,3-diaminopropane
::c5h5nx#::pyridine
::h2nch24nh2x#::putrescine
::c6h5nh2x#::aniline
::ch3ch23nx#::triethylamine
::ch3c6h4nh2x#::o-toluidine
::c6h5nhch3x#::N-methylaniline
::c6h5nhnh2x#::phenylhydrazine
::ch34nclx#::tetramethylammonium chloride
::nch2ch23nx#::triethylenediamine
::h2nch26nh2x#::1,6-diaminohexane
::c6h5nch32x#::benzyldimethylamine
::c6h5nh3clx#::aniline hydrochloride
::c10h15nx#::D-methamphetamine
::c10h14n2x#::3-(1-methyl-2-pyrrolidinyl)pyridine
::c5h4n4o3x#::uric acid
::c6h52nhx#::diphenylamine
::c6h53nx#::triphenylamine
::c6h5n=nc6h5x#::azobenzene
::c8h10o2n4x#::caffeine
::c17h21no4x#::cocaine
::c20h24o2n2x#::quinine
::c4h7n3ox#::creatinine
::c4h5n3ox#::cytosine
::c4h4n2o2x#::uracil
::c5h6n2o2x#::thymine
::c5h5n5x#::adenine
::c5h6n5+x#::adenineium
::c5h4n5-x#::adenineione
::c5h5n5ox#::guanine
::c10h13o4n5x#::adenosine
::c10h14o7n5px#::alpha-adenosine monophosphate
::c10h13n5o5x#::guanosine
::c9h13n3o5x#::cytidine
::c9h12n2o6x#::uridine
::c36n7o16p3sx#::coenzyme A
::ch3ohx#::methanol
::ch3ch2ohx#::ethanol
::ch2=chch2ohx#::allyl alcohol
::ch3ch2ch2ohx#::N-propanol
::ch3chohch3x#::isopropanol
::nh2ch2ch2ohx#::2-aminoethanol
::ch2ohch2ohx#::ethylene glycol
::ch32chch2ohx#::isobutyl alcohol
::ch33cohx#::t-butanol
::ch3ch22ch2ohx#::1-butanol
::ch3chohch2ohx#::propylene glycol
::ch3ch23ch2ohx#::amyl alcohol
::ch3ch22chohx#::diethyl carbinol
::c6h11ohx#::cyclohexanol
::ch3ch24ch2ohx#::1-hexanol
::c6h5-ch2ohx#::benzyl alcohol
::c6h5ohx#::phenol
::o=c6h4=ox#::benzoquinone
::ch3c6h4ohx#::o-cresol
::c6h4oh2x#::catechol
::c6h3oh3x#::1,3,5-THB
::clc6h4ohx#::2-chlorophenol
::hoc6h4no2x#::o-nitrophenol
::c10h7ohx#::1-naphthol
::c12h10o4x#::quinhydrone
::hoc6h2no23x#::picric acid
::c2h4ox#::ethylene oxide
::ch32ox#::dimethyl ether
::ch3och2ch3x#::ethyl methyl ether
::c4h4ox#::furfuran
::ch24ox#::tetrahydrofuran
::ch3ch22ox#::ethyl ether
::ch3ch22och3x#::methyl propyl ether
::ch33coch3x#::methyl tert-butyl ether
::-ch2och22-x#::1,4-dioxane
::ch3ch2ch22ox#::di-n-propyl ether
::hoch2ch22ox#::diethylene glycol
::ch3oc6h5x#::anisole
::ch3ch2oc6h5x#::phenetole
::c9h6o2x#::coumarin
::c6h52ox#::diphenyl ether
::c11h12o3x#::myristicin
::c6h5ch22ox#::benzyl ether
::c12h24o6x#::18-crown-6
::hchox#::formaldehyde
::-ch2-o3x#::S-trioxane
::ch3chox#::acetaldehyde
::-chch3-o3-x#::paraldehyde
::h-co-co-hx#::glyoxal
::ch3ch2chox#::propionaldehyde
::ch2=chchox#::acrolein
::ch3ch22chox#::butyraldehyde
::ch32chchox#::isobutyraldehyde
::ch3ch23chox#::valeraldehyde
::ch32chch2chox#::isovaleraldehyde
::ch33cchox#::pivaldehyde
::c7h6ox#::benzaldehyde
::c6h5chox#::benzaldehyde
::c6h5ch=chchox#::cinnamic aldehyde
::ch3oc6h4chox#::4-methoxybenzaldehyde
::c20h28ox#::13-cis-retinal
::ch2=c=ox#::ketene
::ch32cox#::acetone
::ch3ch2coch3x#::methyl ethyl ketone
::ch3cococh3x#::diacetyl
::ch3ch22coch3x#::methyl propyl ketone
::ch3ch22cox#::diethyl ketone
::ch32chcoch3x#::3-methyl-2-butanone
::c6h10ox#::cyclohexanone
::ch3ch24coch3x#::n-amyl methyl ketone
::c6h5coch3x#::acetophenone
::c5h4ncoch3x#::3-acetylpyridine
::c10h14ox#::D-carvone
::c10h16ox#::D-camphor
::c6h8o6x#::ascorbic acid
::c9h6o4x#::ninhydrin
::c6h5coc6h5x#::benzophenone
::c13h20ox#::β-ionone
::c17h19o3nx#::piperine
::c19h28o2x#::testosterone
::c18h27o3nx#::capsaicin
::c5h10o5x#::D-arabinose
::c5h10o4x#::thyminose
::c6h12o6x#::α-l-glucose
::c6h12o6h2ox#::α-d-glucose,monohydrate
::c6h12o6x#::D-(+)-glucose
::c12h22o11x#::α-lactose
::c12h22o11h2ox#::lactose,monohydrate
::c12h22o11x#::alpha-maltose
::c12h22o11h2ox#::β-maltosemonohydrate
::c12h22o11x#::sucrose
::c6h10o5nx#::stivelse
::hcoohx#::formic acid
::hcoo-x#::methanoate
::ch3coohx#::acetic acid
::ch3coo-x#::ethanoate
::ch2=chcoohx#::acrylic acid
::ch3ch2coohx#::propionic acid
::ch3cooohx#::peroxyacetic acid
::ch2ohcoohx#::glycolic acid
::ch2ohcoo-x#::2-hydroxyethanoate
::ch2fcoohx#::fluoroacetic acid
::ch3cocoohx#::pyruvic acid
::ch3cocoo-x#::pyruvic acid
::ch3ch22coohx#::butyric acid
::ch3ch22coo-x#::butanoate
::ch32chcoohx#::isobutyric acid
::cooh2x#::oxalic acid
::ch3chohcoohx#::milk acid
::ch3chohcoo-x#::l-2-hydroxypropanoate
::ch2clcoohx#::chloroacetic acid
::ch3ch23coohx#::valeric acid
::cch33coohx#::pivalic acid
::ch2cooh2x#::malonic acid
::ch3chclcoohx#::(S)-2-chloropropionic acid
::ch2clch2coohx#::3-chloropropionic acid
::ch3ch24coohx#::hexanoic acid
::ch2cooh2x#::succinic acid
::hoocch22coo-x#::hydrogenbutanedioate
::-oohch22coo-x#::butanedioate
::chohcooh2x#::tartronic acid
::c7h6o2x#::benzoic acid
::chcl2coohx#::dichloroethanoic acid
::ho-c6h4-coohx#::salicylic acid
::ch2brcoohx#::bromoacetic acid
::ch3ch26coohx#::caprylic acid
::hoocch24coohx#::adipic acid
::ccl3coohx#::2,2,2-trichloroacetic acid
::ch3ch28coohx#::decanoic acid
::ch2icoohx#::iodoacetic acid
::c6h8o7x#::citric acid
::c6h8o7h2ox#::citric acid monohydrate
::c6h7o7-x#::dihydrogencitrate
::c6h6o72-x#::hydrogencitrate
::c6h5o73-x#::citrate
::c6h8o7x#::isocitric acid
::c6h7o7-x#::d-dihydrogenisocitrate
::c6h6o72-x#::d-hydrogenisocitrate
::c6h5o73-x#::d-isocitrate
::ch3ch210coohx#::lauric acid
::hoocch28coohx#::sebacic acid
::ch3ch212coohx#::myristic acid
::ch3ch214coohx#::palmitic acid
::ch3ch214coo-x#::palmitic acid
::c18h30o2x#::(9Z,12Z,15Z)-octadeca-9,12,15-trienoic acid
::c18h32o2x#::linoleic acid
::ch3ch216coohx#::stearic acid
::ch3c=o2ox#::acetic anhydride
::ch3ch2c=o2ox#::propionic anhydride
::c6h4c=o2ox#::phthalic anhydride
::c6h5c=o2ox#::benzoic anhydride
::ch3c=oclx#::acetyl chloride
::ch3ch2c=oclx#::propargyl chloride
::c=ocl2x#::phosgene
::ch3c=obrx#::acetyl bromide
::c6h5c=oclx#::benzoyl chloride
::hc=onh2x#::formamide
::ch3c=onh2x#::acetamide
::c=onh22x#::urea
::c6h5c=onh2x#::benzamide
::ch3-cnx#::acetonitrile
::ch2=ch-cnx#::acrylonitrile
::ch3ch2cnx#::propionitrile
::c6h5cnx#::benzonitrile
::nc-ch24-cnx#::adiponitrile
::c2h3nx#::methyl isocyanide
::c7h5nx#::phenylisocyanid
::hcooch3x#::methyl formate
::hcooch2ch3x#::ethyl formate
::ch3cooch3x#::methyl acetate
::ch3ono2x#::methyl nitrate
::ch3cooch2ch3x#::ethyl acetate
::hcooch22ch3x#::propyl formate
::ch3ch2ono2x#::ethyl nitrate
::ch3coochch32x#::isopropyl acetate
::ch3ch2cooch3x#::methyl propionate
::ch3coocch33x#::tert-butyl acetate
::c6h5cooch3x#::methyl benzoate
::c6h5cooc6h5x#::phenyl benzoate
::c3h5n3o9x#::nitroglycerin
::c39h74o6x#::glycerol trilaurate
::c45h86o6x#::glyceryltrimyristinat
::c51h98o6x#::tripalmitin
::c57h110o6x#::glycerol tristearate
::c57h104o6x#::triolein
::c3h9o6px#::sn-glycerol-3-phosphate
::c3h8o6p-x#::glyceryl-1-hydrogenphosphate
::c3h7o6p2-x#::glyceryl-1-phosphate
::c6h13o9px#::glucose-1-phosphate
::c6h12o9p-x#::glucose-1-hydrogenphosphate
::c6h11o9p2-x#::glucose-1-phosphate
::c6h13o9px#::glucose-6-phosphate
::c6h12o9p-x#::glucose-6-hydrogenphosphate
::c6h11o9p2-x#::glucose-6-phosphate
::nh2chch3coohx#::L-alanine
::nh2chch3coo-x#::l-alaninate
::nh2chch3coohx#::DL-alanine
::+nh3chrcoo-x#::l-arginine
::+nh3chrcoo-x#::l-glutamine
::nh2ch2coohx#::glycine
::+nh3ch2coo-x#::glycine
::nh2ch2coo-x#::glycinateione
::+nh3ch2coohx#::glycineium
::c6h9n3o2x#::L-histidine
::c6h13no2x#::D-leucine
::c6h14n2o2x#::DL-leucine
::phe-ch2-c6h5x#::L-phenylalanine
::c5h9no2x#::L-proline
::c5h9no3x#::hydroxyproline
::-ch2-ohx#::L-serine
::c11h12n2o2x#::L-tryptophan
::+nh3chrcoo-x#::l-valin
::+nh3chrcoohx#::l-valinium
::nh2chrcoo-x#::l-valinat
::nh2ch23coohx#::gamma(amino)-butyric acid
::nh2ch22so3hx#::taurine
::nh2ch22so3-x#::2-aminoethanesulfonateione
::nh2c6h4coohx#::anthranilic acid
::ch3no2x#::nitromethane
::ch3ch2no2x#::nitroethane
::ch3ch2ch2no2x#::1-nitropropane
::ch32chno2x#::2-nitropropane
::c6h5no2x#::nitrobenzene
::ch3c6h4no2x#::o-nitrotoluene
::c6h4no22x#::1,2-dinitrobenzene
::ch3c6h3no22x#::2,4-dinitrotoluene
::ch3c6h2no23x#::trinitrotoluene
::ch3ch2shx#::ethanethiol
::ch3csnh2x#::thioacetamide
::ch3coshx#::thioacetic acid
::ch3ch2ch2shx#::1-propanethiol
::ch32chshx#::2-propanethiol
::ch32sox#::dimethyl sulfoxide
::c4h4sx#::thiophene
::ch3ch22sx#::diethyl sulfide
::c6h5shx#::phenyl mercaptan
::nh2ch22so3-x#::2-aminoethanesulfonate
::cich2ch22sx#::mustard gas
::c6h5so3hx#::benzenesulfonic acid
::ch3c6h4so3hx#::tosic acid
::nh3c6h4so3hx#::sulfanilic acid
::c6h52sx#::diphenyl sulfide
::c6h52sox#::diphenyl sulfoxide
::c6h52so2x#::diphenyl sulfone
::nh42co3x#::ammonium carbonate
::alno33x#::aluminum nitrate
::ali3x#::aluminum iodide
::bai2x#::barium iodide
::c2h2o2x#::glyoxal
::c2h5ohx#::ethanol
::c2h5onax#::sodium ethylate
::caso3x#::calcium bisulfite
::ch2oh2x#::methyl hydroperoxide
::ch2chohx#::hydroxyethylene
::ch2cox#::ketene
::ch2ox#::formaldehyde
::ch3coonax#::sodium acetate
::ch3och3x#::dimethyl ether
::crno33x#::chromium nitrate
::cuno32x#::copper(II) nitrate
::feoh2x#::iron(II) hydroxide
::k3po4x#::tripotassium phosphate
::lino3x#::lithium nitrate
::mnno32x#::manganese(II) nitrate
::na2hpo3x#::disodium phosphite
::na2hpo4x#::disodium hydrogen phosphate
::nah2po4x#::sodium dihydrogen phosphate
::nh4ohx#::ammonium hydroxide
::ni3x#::nitrogen triiodide
::no2+x#::nitronium(II) ion
::n3-x#::nitride
::crno32x#::chromium nitrate
::feno32x#::iron(II) nitrate
::feso3x#::iron(2+) sulfite
::feso4x#::duretter
::feno33x#::ferric nitrate
::cono23x#::cobalt(II) nitrite
::nino32x#::nickel(II) nitrate
::cuno3x#::copper(II) nitrate
::cu3po4x#::copper(1+) phosphate
::cui2x#::cuprous iodide
::hgno32x#::mercury(II) nitrate
::nh42sx#::diammonium sulfide
::nh4fx#::ammonium fluoride
::nh4ix#::ammonium iodide
::fescn2+x#::iron(III) thiocyanate
::agn3x#::silver azide
::ba3n2x#::barium nitride
::baso3x#::barium sulfite
::ch3cnx#::acetonitrile
::cubr2x#::cupric bromide
::cuf2x#::cupric fluoride
::fei2x#::ferrous iodide
::fei3x#::iron(III) iodide
::hbro3x#::bromic acid
::k2so3x#::potassium sulfite
::k3po3x#::tripotassium phosphite
::kclo2x#::potassium chlorite
::li2sx#::lithium sulfide
::mgso3x#::magnesium sulfite
::na3po3x#::trisodium phosphite
::na3po4x#::trisodium phosphate
::nh2coohx#::carbamic acid
::nh4brx#::ammonium bromide
::zn3n2x#::zinc nitride
::zn3p2x#::zinc phosphide
::hbo32-x#::hydrogen borate
::na3px#::sodium phosphide
::k3nx#::potassium nitride
::k3px#::potassium phosphide
::ba3p2x#::barium phosphide
::baf2x#::barium fluoride
::fe3n2x#::iron(2+) nitride
::fe3p2x#::iron(2+) phosphide
::fef3x#::ferric fluoride
::cuco3x#::copper(II) carbonate
::cuso3x#::copper(2+) sulfite
::cu3n2x#::copper(2+) nitride
::cu3p2x#::copper(2+) phosphide
::pbs2x#::lead(4+) sulfide
::pbi4x#::lead tetraiodide
::c6h13brx#::1-bromohexane
::c7h15brx#::1-bromoheptane
::cl2h2cao4x#::calcium formate
::c4h8sx#::allyl methyl sulfide
::feoh3x#::iron(3+) hydroxide
::al3+::Al³⁺
::albr3::AlBr₃
::al4c3::Al₄C₃
::alcl3::AlCl₃
::alcl36h2o::AlCl₃∙6H₂O
::alf3::AlF₃
::aloh3::Al(OH)₃
::alno339h2o::Al(NO₃)₃∙9H₂O
::al2o3::Al₂O₃
::alpo4::AlPO₄
::al2so43::Al₂(SO₄)₃
::al2so4318h2o::Al₂(SO₄)₃∙18H₂O
::alo2-::AlO₂⁻
::alf63-::AlF₆³⁻
::sbcl3::SbCl₃
::sbcl5::SbCl₅
::sbh3::SbH₃
::sb2o3::Sb₂O₃
::sb2o5::Sb₂O₅
::sb2s3::Sb₂S₃
::sb2s5::Sb₂S₅
::h3sbo4::H₃SbO₄
::as4::As₄
::ascl3::AsCl₃
::ash3::AsH₃
::as2o3::As₂O₃
::as2o5::As₂O₅
::as2s3::As₂S₃
::h3aso4::H₃AsO₄
::aso43-::AsO₄³⁻
::aso2-::AsO₂⁻
::ba2+::Ba²⁺
::babr2::BaBr₂
::baco3::BaCO₃
::bacl2::BaCl₂
::bacl22h2o::BaCl₂∙2H₂O
::bacro4::BaCrO₄
::bah2::BaH₂
::baoh2::Ba(OH)₂
::baoh28h2o::Ba(OH)₂∙8H₂O
::bano32::Ba(NO₃)₂
::bao2::BaO₂
::baso4::BaSO₄
::be2+::Be²⁺
::becl2::BeCl₂
::beno323h2o::Be(NO₃)₂∙3H₂O
::beso44h2o::BeSO₄∙4H₂O
::bi3+::Bi³⁺
::bicl3::BiCl₃
::bicl4::BiCl₄
::bioh3::Bi(OH)₃
::bino335h2o::Bi(NO₃)₃∙5H₂O
::hbio3::HBiO₃
::pb2+::Pb²⁺
::pbn32::Pb(N₃)₂
::pbbr2::PbBr₂
::pbcl2::PbCl₂
::pbcl4::PbCl₄
::pbcro4::PbCrO₄
::pboh2::Pb(OH)₂
::pbi2::PbI₂
::pbno32::Pb(NO₃)₂
::pbo2::PbO₂
::pb3o4::Pb₃O₄
::pbso4::PbSO₄
::pbc2h54::Pb(C₂H₅)₄
::pbch34::Pb(CH₃)₄
::b2o3::B₂O₃
::h3bo3::H₃BO₃
::h2bo3-::H₂BO₃⁻
::b2o22oh42-::B₂(O₂)₂(OH)₄²⁻
::h2b4o7::H₂B₄O₇
::hb4o7-::HB₄O₇⁻
::bf3::BF₃
::b2h6::B₂H₆
::b5h9::B₅H₉
::br2::Br₂
::bro3-::BrO₃⁻
::br-::Br⁻
::bro-::BrO⁻
::br3-::Br₃⁻
::cd2+::Cd²⁺
::cdbr2::CdBr₂
::cdbr24h2o::CdBr₂∙4H₂O
::cdcl2::CdCl₂
::cdcl22h2o::CdCl₂∙2H₂O
::cdoh2::Cd(OH)₂
::cdi2::CdI₂
::cdno32::Cd(NO₃)₂
::cdno322h2o::Cd(NO₃)₂∙2H₂O
::cdso4::CdSO₄
::cdso43/8h2o::CdSO₄∙3/8H₂O
::ca2+::Ca²⁺
::ch3coo2cah2o::(CH₃COO)₂Ca∙H₂O
::caal2si2o8::CaAl₂Si₂O₈
::cabr2::CaBr₂
::cac2::CaC₂
::caco3 calcit::CaCO₃ (calcit)
::caco3::CaCO₃
::cacl2::CaCl₂
::cacl26h2o::CaCl₂∙6H₂O
::cah2po42h2o::Ca(H₂PO₄)₂∙H₂O
::caf2::CaF₂
::cah2::CaH₂
::cahpo42h2o::CaHPO₄∙2H₂O
::caoh2::Ca(OH)₂
::ca5po43oh::Ca₅(PO₄)₃(OH)
::caclo2::Ca(ClO)₂
::cai2::CaI₂
::cano32::Ca(NO₃)₂
::ca3n2::Ca₃N₂
::c2o4ca::C₂O₄Ca
::c2o4cah2o::C₂O₄Ca∙H₂O
::c15h31coo2ca::(C₁₅H₃₁COO)₂Ca
::cao2::CaO₂
::ca3po42::Ca₃(PO₄)₂
::c17h35coo2ca::(C₁₇H₃₅COO)₂Ca
::caso4::CaSO₄
::caso4½h2o::CaSO₄∙½H₂O
::caso42h2o::CaSO₄∙2H₂O
::c2!::C₂
::c60::C₆₀
::co2::CO₂
::h2co3::H₂CO₃
::hco3-::HCO₃⁻
::co32-::CO₃²⁻
::cs2::CS₂
::cocl2::COCl₂
::cn-::CN⁻
::ocn-::OCN⁻
::cn2::(CN)₂
::scn-::SCN⁻
::ce3+::Ce³⁺
::ce4+::Ce⁴⁺
::cecl3::CeCl₃
::ceno336h2o::Ce(NO₃)₃∙6H₂O
::ceohno333h2o::Ce(OH)(NO₃)₃∙3H₂O
::ce2o3::Ce₂O₃
::ce2so43::Ce₂(SO₄)₃
::ceso42::Ce(SO₄)₂
::cl2::Cl₂
::cl-::Cl⁻
::clo2::ClO₂
::cl2o::Cl₂O
::cl2o7::Cl₂O₇
::hclo3::HClO₃
::clo3-::ClO₃⁻
::hclo2::HClO₂
::clo2-::ClO₂⁻
::clo-::ClO⁻
::hclo4::HClO₄
::clo4-::ClO₄⁻
::cr2+::Cr²⁺
::cr3+::Cr³⁺
::cro42-::CrO₄²⁻
::hcro4-::HCrO₄⁻
::h2cro4::H₂CrO₄
::cr2o72-::Cr₂O₇²⁻
::crcl2::CrCl₂
::crcl3::CrCl₃
::crcl36h2o::CrCl₃∙6H₂O
::croh2::Cr(OH)₂
::cr2o3::Cr₂O₃
::cro2::CrO₂
::cro3::CrO₃
::cro2cl2::CrO₂Cl₂
::crso47h2o::CrSO₄∙7H₂O
::cr2so43::Cr₂(SO₄)₃
::cr2so4318h2o::Cr₂(SO₄)₃∙18H₂O
::crco6::Cr(CO)₆
::co2+::Co²⁺
::co3+::Co³⁺
::coco3::CoCO₃
::cocl22h2o::CoCl₂∙2H₂O
::cocl26h2o::CoCl₂∙6H₂O
::cocl3::CoCl₃
::cooh2::Co(OH)₂
::cono326h2o::Co(NO₃)₂∙6H₂O
::co2o3::Co₂O₃
::co3o4::Co₃O₄
::coso4::CoSO₄
::coso47h2o::CoSO₄∙7H₂O
::cs+::Cs⁺
::cs2o::Cs₂O
::f2!::F₂
::f-!::F⁻
::f2o::F₂O
::hf2-::HF₂⁻
::geh4::GeH₄
::ge2h6::Ge₂H₆
::geo2::GeO₂
::aucl3::AuCl₃
::aucl4-::AuCl₄⁻
::h2!::H₂
::h+!::H⁺
::h-!::H⁻
::d2o::D₂O
::h3o+::H₃O⁺
::i2!::I₂
::i-!::I⁻
::i3-::I₃⁻
::hio3::HIO₃
::io3-::IO₃⁻
::in3::IN₃
::icl3::ICl₃
::i2o5::I₂O₅
::fe2+::Fe²⁺
::fe3+::Fe³⁺
::fe3c::Fe₃C
::feco3::FeCO₃
::fecl2::FeCl₂
::fecl22h2o::FeCl₂∙2H₂O
::fecl24h2o::FeCl₂∙4H₂O
::fecl3::FeCl₃
::fecl36h2o::FeCl₃∙6H₂O
::fes2::FeS₂
::feno339h2o::Fe(NO₃)₃∙9H₂O
::fe0.947o::Fe₀.₉₄₇O
::fe2o3::Fe₂O₃
::fe3o4::Fe₃O₄
::fepo42h2o::FePO₄∙2H₂O
::fe2s3::Fe₂S₃
::feso47h2o::FeSO₄∙7H₂O
::fe2so43::Fe₂(SO₄)₃
::feco5::Fe(CO)₅
::fec5h52::Fe(C₅H₅)₂
::k+!::K⁺
::kalso4212h2o::KAl(SO₄)₂∙12H₂O
::ksboh6½h2o::KSb(OH)₆∙½H₂O
::kbro3::KBrO₃
::k2co3::K₂CO₃
::k2co32h2o::K₂CO₃∙2H₂O
::kclo3::KClO₃
::k2cro4::K₂CrO₄
::kcrso4212h2o::KCr(SO₄)₂∙12H₂O
::k2cr2o7::K₂Cr₂O₇
::kh2po4::KH₂PO₄
::k4fecn63h2o::K₄Fe(CN)₆∙3H₂O
::k3fecn6::K₃Fe(CN)₆
::khco3::KHCO₃
::khf2::KHF₂
::kio3::KIO₃
::k2mno4::K₂MnO₄
::kno3::KNO₃
::kno2::KNO₂
::k2o::K₂O
::kclo4::KClO₄
::kio4::KIO₄
::kmno4::KMnO₄
::k2o2::K₂O₂
::k2o3sooso3::K₂O₃SOOSO₃
::k2s2o7::K₂S₂O₇
::ko2::KO₂
::k2so4::K₂SO₄
::k2s::K₂S
::cu+::Cu⁺
::cu2+::Cu²⁺
::ch3coo2cuh2o::(CH₃COO)₂Cu∙H₂O
::cu2oh2co3::Cu₂(OH)₂CO₃
::cu3oh2co32::Cu₃(OH)₂(CO₃)₂
::cucl2::CuCl₂
::cucl22h2o::CuCl₂∙2H₂O
::cuoh2::Cu(OH)₂
::cuno323h2o::Cu(NO₃)₂∙3H₂O
::cu2o::Cu₂O
::cu2so4::Cu₂SO₄
::cuso4::CuSO₄
::cuso45h2o::CuSO₄∙5H₂O
::cu2s::Cu₂S
::krf2::KrF₂
::hg22+::Hg₂²⁺
::hg2+::Hg²⁺
::hg2br2::Hg₂Br₂
::hgbr2::HgBr₂
::hg2cl2::Hg₂Cl₂
::hgcl2::HgCl₂
::hg2i2::Hg₂I₂
::hgi2::HgI₂
::hg2no322h2o::Hg₂(NO₃)₂∙2H₂O
::hgno32½h2o::Hg(NO₃)₂∙½H₂O
::hg2o::Hg₂O
::hg2so4::Hg₂SO₄
::li+::Li⁺
::lialh4::LiAlH₄
::libh4::LiBH₄
::li2co3::Li₂CO₃
::li2o::Li₂O
::li2so4h2o::Li₂SO₄∙H₂O
::mg2+::Mg²⁺
::mgbr2::MgBr₂
::mgco3::MgCO₃
::mgcl2::MgCl₂
::mgcl26h2o::MgCl₂∙6H₂O
::mgoh2::Mg(OH)₂
::mgi2::MgI₂
::mgno32::Mg(NO₃)₂
::mgno326h2o::Mg(NO₃)₂∙6H₂O
::mg3n2::Mg₃N₂
::mgclo42::Mg(ClO₄)₂
::mgclo426h2o::Mg(ClO₄)₂∙6H₂O
::mgso4::MgSO₄
::mgso47h2o::MgSO₄∙7H₂O
::mn2+::Mn²⁺
::mn3+::Mn³⁺
::mno4-::MnO₄⁻
::mno42-::MnO₄²⁻
::mnco3::MnCO₃
::mncl24h2o::MnCl₂∙4H₂O
::mnoh2::Mn(OH)₂
::mn3o4::Mn₃O₄
::mn2o3::Mn₂O₃
::mno2::MnO₂
::mnso4::MnSO₄
::mnso47h2o::MnSO₄∙7H₂O
::mn2co10::Mn₂(CO)₁₀
::mooh3::Mo(OH)₃
::moo2::MoO₂
::moo3::MoO₃
::h2moo4h2o::H₂MoO₄∙H₂O
::moo42-::MoO₄²⁻
::moco6::Mo(CO)₆
::na+::Na⁺
::ch3coona3h2o::CH₃COONa∙3H₂O
::nahg2::NaHg₂
::nanh2::NaNH₂
::na3aso412h2o::Na₃AsO₄∙12H₂O
::naaso2::NaAsO₂
::nan3::NaN₃
::c6h5-coona::C₆H₅-COONa
::na2b4o7::Na₂B₄O₇
::na2b4o710h2o::Na₂B₄O₇∙10H₂O
::nabh4::NaBH₄
::nabr2h2o::NaBr∙2H₂O
::nabro3::NaBrO₃
::na2co3::Na₂CO₃
::na2co310h2o::Na₂CO₃∙10H₂O
::naclo3::NaClO₃
::naclo2::NaClO₂
::na2cr2o72h2o::Na₂Cr₂O₇∙2H₂O
::nah2aso4h2o::NaH₂AsO₄∙H₂O
::nah2po4h2o::NaH₂PO₄∙H₂O
::na2s2o62h2o::Na₂S₂O₆∙2H₂O
::na2s2o42h2o::Na₂S₂O₄∙2H₂O
::ch3ch2ona::CH₃CH₂ONa
::na3cono26::Na₃Co(NO₂)₆
::na3alf6::Na₃AlF₆
::napo36::(NaPO₃)₆
::na2haso47h2o::Na₂HAsO₄∙7H₂O
::nahco3::NaHCO₃
::na2hpo42h2o::Na₂HPO₄∙2H₂O
::nahso4::NaHSO₄
::nahso3::NaHSO₃
::naclo2½h2o::NaClO∙2½H₂O
::naio3::NaIO₃
::nai2h2o::NaI∙2H₂O
::ch3ona::CH₃ONa
::nano3::NaNO₃
::na3n::Na₃N
::nano2::NaNO₂
::c17h33coona::C₁₇H₃₃COONa
::na2c2o4::Na₂C₂O₄
::na2o::Na₂O
::naclo4::NaClO₄
::na2o2::Na₂O₂
::na2s2o8::Na₂S₂O₈
::na3po412h2o::Na₃PO₄∙12H₂O
::na2s2o5::Na₂S₂O₅
::na2sio3::Na₂SiO₃
::c17h35coona::C₁₇H₃₅COONa
::na2so4::Na₂SO₄
::na2so410h2o::Na₂SO₄∙10H₂O
::na2s::Na₂S
::na2so3::Na₂SO₃
::na2so37h2o::Na₂SO₃∙7H₂O
::na3sbs49h2o::Na₃SbS₄∙9H₂O
::na2s2o3::Na₂S₂O₃
::na2s2o35h2o::Na₂S₂O₃∙5H₂O
::na3po336h2o::Na₃(PO₃)₃∙6H₂O
::na5p3o10::Na₅P₃O₁₀
::w2o42h2o::W₂O₄∙2H₂O
::ni2+::Ni²⁺
::nibr2::NiBr₂
::nicl2::NiCl₂
::nicl26h2o::NiCl₂∙6H₂O
::nioh2::Ni(OH)₂
::nino326h2o::Ni(NO₃)₂∙6H₂O
::niso4::NiSO4
::niso46h2o::NiSO4∙6H₂O
::nic4h7n2o22::Ni(C4H₇N₂O₂)₂
::nico4::Ni(CO)₄
::n2!::N₂
::no2::NO₂
::n2o::N₂O
::n2o4::N₂O₄
::n2o3::N₂O₃
::n2o5::N₂O₅
::nh3::NH₃
::nh4+::NH₄⁺
::nh42co3h2o::(NH₄)₂CO₃∙H₂O
::nh4cl::NH₄Cl
::nh42cro4::(NH₄)₂CrO₄
::nh42cr2o7::(NH₄)₂Cr₂O₇
::nh4hco3::NH₄HCO₃
::nh4hs::NH₄HS
::nh4hso4::NH₄HSO₄
::nh42moo4::(NH₄)₂MoO₄
::nh4no3::NH₄NO₃
::nh4no2::NH₄NO₂
::nh42s2o8::(NH₄)₂S₂O8
::nh42so4::(NH₄)₂SO₄
::nh4scn::NH₄SCN
::nh4vo3::NH₄VO₃
::nh2nh2::NH₂NH₂
::nh2nh3+::NH₂NH₃⁺
::nh2-nh3cl::NH₂-NH₃Cl
::clnh3-nh3cl::ClNH₃-NH₃Cl
::nh3nh3so4::(NH₃NH₃)SO₄
::hn3::HN₃
::nh2oh::NH₂OH
::nh2oh+::NH₂OH⁺
::nh3oh::NH₃OH
::nh3ohcl::(NH₃OH)Cl
::nh3oh2so4::(NH₃OH)₂SO₄
::no3-::NO₃⁻
::no2-::NO₂⁻
::hno3::HNO₃
::hno2::HNO₂
::o2!::O₂
::o3!::O₃
::o2-::O²⁻
::h2o::H₂O
::o22-::O₂²⁻
::h2o2::H₂O₂
::oh-::OH⁻
::o2•-::O₂•⁻
::p4!::P₄
::ph3::PH₃
::p4o10::P₄O₁₀
::pcl5::PCl₅
::h3po4::H₃PO₄
::h2po4-::H₂PO₄⁻
::hpo42-::HPO₄²⁻
::po43-::PO₄³⁻
::h3po3::H₃PO₃
::hpo3n::(HPO₃)n
::p2o74-::P₂O₇⁴⁻
::pbr3::PBr₃
::pcl3::PCl₃
::pt22+::Pt₂²⁺
::ptcl2::PtCl₂
::ptcl62-::PtCl₆²⁻
::rb+::Rb⁺
::h2se::H₂Se
::seo2::SeO₂
::h2seo4::H₂SeO₄
::sio2::SiO₂
::sih4::SiH₄
::sicl4::SiCl₄
::sif4::SiF₄
::sr2+::Sr²⁺
::srco3::SrCO₃
::srcl2::SrCl₂
::srcl22h2o::SrCl₂∙2H₂O
::srcro4::SrCrO₄
::sroh2::Sr(OH)₂
::sroh28h2o::Sr(OH)₂∙8H₂O
::srno32::Sr(NO₃)₂
::srno324h2o::Sr(NO₃)₂∙4H₂O
::srso4::SrSO₄
::s8!::S₈
::s2!::S₂
::so2::SO₂
::h2so3::H₂SO₃
::hso3-::HSO₃⁻
::so32-::SO₃²⁻
::h2s::H₂S
::hs-::HS⁻
::s2-::S²⁻
::s22-::S₂²⁻
::s32-::S₃²⁻
::h2s2o8::H₂S₂O₈
::h2so4::H₂SO₄
::hso4-::HSO₄⁻
::so42-::SO₄²⁻
::so2cl2::SO₂Cl₂
::so3::SO₃
::socl2::SOCl₂
::h2nso3h::H₂NSO₃H
::s2o32-::S₂O₃²⁻
::clso3h::ClSO₃H
::sf6::SF₆
::ag+::Ag⁺
::agbro3::AgBrO₃
::ag2co3::Ag₂CO₃
::ag2cro4::Ag₂CrO₄
::agio3::AgIO₃
::agno3::AgNO₃
::ag3po4::Ag₃PO₄
::ag2o::Ag₂O
::ag2so4::Ag₂SO₄
::ag2s::Ag₂S
::th4+::Th⁴⁺
::thno34::Th(NO₃)₄
::thno355h2o::Th(NO₃)₅∙5H₂O
::thno3412h2o::Th(NO₃)₄∙12H₂O
::tho2::ThO₂
::sn2+::Sn²⁺
::sn4+::Sn⁴⁺
::sncl22h2o::SnCl₂∙2H₂O
::sncl4::SnCl₄
::snh4::SnH₄
::snoh2::Sn(OH)₂
::snno3220h2o::Sn(NO₃)₂∙20H₂O
::sno2::SnO₂
::snso4::SnSO₄
::sns2::SnS₂
::ticl2::TiCl₂
::ticl3::TiCl₃
::ticl4::TiCl₄
::tio2::TiO₂
::u3+::U³⁺
::u4+::U⁴⁺
::uo22+::UO₂²⁺
::u3o8::U₃O₈
::uf6::UF₆
::uo2::UO₂
::uo3::UO₃
::uo2no326h2o::UO₂(NO₃)₂∙6H₂O
::uo2so43h2o::UO₂(SO₄)∙3H₂O
::v2o3::V₂O₃
::v2o5::V₂O₅
::v2so43::V₂(SO₄)₃
::voso4::VOSO₄
::vco6::V(CO)₆
::wo3::WO₃
::wf6::WF₆
::xeo3::XeO₃
::xeo4::XeO₄
::xef2::XeF₂
::xef4::XeF₄
::xef6::XeF₆
::zn2+::Zn²⁺
::znbr2::ZnBr₂
::znco3::ZnCO₃
::zncl2::ZnCl₂
::znoh2::Zn(OH)₂
::zni2::ZnI₂
::znno326h2o::Zn(NO₃)₂∙6H₂O
::znso4::ZnSO₄
::znso47h2o::ZnSO₄∙7H₂O
::zrcl4::ZrCl₄
::zrno345h2o::Zr(NO₃)₄∙5H₂O
::zro2::ZrO₂
::zrocl28h2o::ZrOCl₂∙8H₂O
::ch4::CH₄
::c2h6::C₂H₆
::c3h8::C₃H₈
::c4h10::C₄H₁₀
::c5h12::C₅H₁₂
::c6h14::C₆H₁₄
::ch3ch24ch3::CH₃(CH₂)₄CH₃
::c7h16::C₇H₁₆
::ch3ch25ch3::CH₃(CH₂)₅CH₃
::c8h18::C₈H₁₈
::ch3ch26ch3::CH₃(CH₂)₆CH₃
::c9h20::C₉H₂₀
::c10h22::C₁₀H₂₂
::ch3ch29ch3::CH₃(CH₂)₉CH₃
::ch3ch210ch3::CH₃(CH₂)₁₀CH₃
::ch3ch211ch3::CH₃(CH₂)₁₁CH₃
::ch3ch212ch3::CH₃(CH₂)₁₂CH₃
::ch3ch213ch3::CH₃(CH₂)₁₃CH₃
::ch3ch214ch3::CH₃(CH₂)₁₄CH₃
::ch3ch215ch3::CH₃(CH₂)₁₅CH₃
::ch3ch216ch3::CH₃(CH₂)₁₆CH₃
::ch3ch217ch3::CH₃(CH₂)₁₇CH₃
::ch3ch218ch3::CH₃(CH₂)₁₈CH₃
::ch33ch::(CH₃)₃CH
::ch32chch2ch3::(CH₃)₂CHCH₂CH₃
::cch34::C(CH₃)₄
::ch3chch2ch32::CH₃CH(CH₂CH₃)₂
::ch3ch2cch33::CH₃CH₂C(CH₃)₃
::ch32chchch32::(CH₃)₂CHCH(CH₃)₂
::ch33cch22ch3::(CH₃)₃C(CH₂)₂CH₃
::ch32cch2ch32::(CH₃)₂C(CH₂CH₃)₂
::ch2chch322::CH₂(CH(CH₃)₂)₂
::c3h6::C₃H₆
::c4h8::C₄H₈
::c5h10::C₅H₁₀
::c6h12::C₆H₁₂
::c6h11ch3::C₆H₁₁CH₃
::ch32c6h10::(CH₃)₂C₆H₁₀
::ch2=ch2::CH₂=CH₂
::ch2=chch3::CH₂=CHCH₃
::ch2=c=ch2::CH₂=C=CH₂
::c3h4::C₃H₄
::c4h6::C₄H₆
::ch2=c=chch3::CH₂=C=CHCH₃
::ch2=chch=ch2::CH₂=CHCH=CH₂
::ch2=chch2ch3::CH₂=CHCH₂CH₃
::ch3ch=chch3::CH₃CH=CHCH₃
::ch2=c=cch32::CH₂=C=C(CH₃)₂
::c6h8::C₆H₈
::c6h10::C₆H₁₀
::c10h16::C₁₀H₁₆
::c40h56::C₄₀H₅₆
::c2h2::C₂H₂
::hc≡cch3::HC≡CCH₃
::hc≡cch2ch3::HC≡CCH₂CH₃
::ch3c≡cch3::CH₃C≡CCH₃
::hc≡c-c≡ch::HC≡C-C≡CH
::hc≡cch22ch3::HC≡C(CH₂)₂CH₃
::c6h6::C₆H₆
::c10h8::C₁₀H₈
::c14h10::C₁₄H₁₀
::c18h12::C₁₈H₁₂
::c20h12::C₂₀H₁₂
::c6h5ch3::C₆H₅CH₃
::c6h5ch=ch2::C₆H₅CH=CH₂
::c6h4ch32::C₆H₄(CH₃)₂
::c6h5ch2ch3::C₆H₅CH₂CH₃
::c6h5chch32::C₆H₅CH(CH₃)₂
::c6h5-c6h5::C₆H₅-C₆H₅
::ch3cl::CH₃Cl
::chcl=ch2::CHCl=CH₂
::ch3ch2cl::CH₃CH₂Cl
::ch3ch2ch2cl::CH₃CH₂CH₂Cl
::ch3chclch3::CH₃CHClCH₃
::ch2cl2::CH₂Cl₂
::ch3ch22ch2cl::CH₃(CH₂)₂CH₂Cl
::ch32chch2cl::(CH₃)₂CHCH₂Cl
::ch33ccl::(CH₃)₃CCl
::ch2=ccl2::CH₂=CCl₂
::ch3chcl2::CH₃CHCl₂
::ch2clch2cl::CH₂ClCH₂Cl
::c6h5cl::C₆H₅Cl
::chcl3::CHCl₃
::ccl2=chcl::CCl₂=CHCl
::ch3ccl3::CH₃CCl₃
::ch2clchcl2::CH₂ClCHCl₂
::c6h4cl2::C₆H₄Cl₂
::ccl4::CCl₄
::ccl3ccl3::CCl₃CCl₃
::c6cl6::C₆Cl₆
::c6h6cl6::C₆H₆Cl₆
::c14h9cl5::C₁₄H₉Cl₅
::chclf2::CHClF₂
::cf4::CF₄
::cf2=cf2::CF₂=CF₂
::chcl2f::CHCl₂F
::cclf3::CClF₃
::ccl2f2::CCl₂F₂
::cf3chcl2::CF₃CHCl₂
::cfcl2cfcl2::CFCl₂CFCl₂
::ch3br::CH₃Br
::ch3ch2br::CH₃CH₂Br
::ch3ch2ch2br::CH₃CH₂CH₂Br
::ch3chbrch3::CH₃CHBrCH₃
::ch33cbr::(CH₃)₃CBr
::ch32chch2br::(CH₃)₂CHCH₂Br
::ch3ch22ch2br::CH₃(CH₂)₂CH₂Br
::c6h5br::C₆H₅Br
::ch2br2::CH₂Br₂
::ch3chbr2::CH₃CHBr₂
::ch2brch2br::CH₂BrCH₂Br
::c6h4br2::C₆H₄Br₂
::chbr3::CHBr₃
::cbr4::CBr₄
::chbr2chbr2::CHBr₂CHBr₂
::ch3i::CH₃I
::ch3ch2i::CH₃CH₂I
::ch3ch2chi::CH₃CH₂CHI
::ch3chich3::CH₃CHICH₃
::ch3ch22ch2i::CH₃(CH₂)₂CH₂I
::ch3ch2chich3::CH₃CH₂CHICH₃
::ch33ci::(CH₃)₃CI
::c6h5i::C₆H₅I
::ch2i2::CH₂I₂
::chi2ch3::CHI₂CH₃
::ch2ich2i::CH₂ICH₂I
::chi3::CHI₃
::ci4::CI₄
::ch3nh2::CH₃NH₂
::ch32nh::(CH₃)₂NH
::ch3ch2nh2::CH₃CH₂NH₂
::ch32nh2+::(CH₃)₂NH₂⁺
::ch33n::(CH₃)₃N
::ch3ch2ch2nh2::CH₃CH₂CH₂NH₂
::ch3chnh2ch3::CH₃CH(NH₂)CH₃
::h2nch22nh2::H₂N(CH₂)₂NH₂
::ch3ch22nh::(CH₃CH₂)₂NH
::h2nch23nh2::H₂N(CH₂)₃NH₂
::c5h5n::C₅H₅N
::h2nch24nh2::H₂N(CH₂)₄NH₂
::c6h5nh2::C₆H₅NH₂
::ch3ch23n::(CH₃CH₂)₃N
::ch3c6h4nh2::CH₃C₆H₄NH₂
::c6h5nhch3::C₆H₅NHCH₃
::c6h5nhnh2::C₆H₅NHNH₂
::ch34ncl::(CH₃)₄NCl
::nch2ch23n::N(CH₂CH₂)₃N
::h2nch26nh2::H₂N(CH₂)₆NH₂
::c6h5nch32::C₆H₅N(CH₃)₂
::c6h5nh3cl::C₆H₅NH₃Cl
::c10h15n::C₁₀H₁₅N
::c10h14n2::C₁₀H₁₄N₂
::c5h4n4o3::C₅H₄N₄O₃
::c6h52nh::(C₆H₅)₂NH
::c6h53n::(C₆H₅)₃N
::c6h5n=nc6h5::C₆H₅N=NC₆H₅
::c8h10o2n4::C₈H₁₀O₂N₄
::c17h21no4::C₁₇H₂₁NO₄
::c20h24o2n2::C₂₀H₂₄O₂N₂
::c4h7n3o::C₄H₇N₃O
::c4h5n3o::C₄H₅N₃O
::c4h4n2o2::C₄H₄N₂O₂
::c5h6n2o2::C₅H₆N₂O₂
::c5h5n5::C₅H₅N₅
::c5h6n5+::C₅H₆N₅⁺
::c5h4n5-::C₅H₄N₅⁻
::c5h5n5o::C₅H₅N₅O
::c10h13o4n5::C₁₀H₁₃O₄N₅
::c10h14o7n5p::C₁₀H₁₄O₇N₅P
::c10h13n5o5::C₁₀H₁₃N₅O₅
::c9h13n3o5::C₉H₁₃N₃O₅
::c9h12n2o6::C₉H₁₂N₂O₆
::c36n7o16p3s::C₃₆N₇O₁₆P₃S
::ch3oh::CH₃OH
::ch3ch2oh::CH₃CH₂OH
::ch2=chch2oh::CH₂=CHCH₂OH
::ch3ch2ch2oh::CH₃CH₂CH₂OH
::ch3chohch3::CH₃CHOHCH₃
::nh2ch2ch2oh::NH₂CH₂CH₂OH
::ch2ohch2oh::CH₂OHCH₂OH
::ch32chch2oh::(CH₃)₂CHCH₂OH
::ch33coh::(CH₃)₃COH
::ch3ch22ch2oh::CH₃(CH₂)₂CH₂OH
::ch3chohch2oh::CH₃CHOHCH₂OH
::ch3ch23ch2oh::CH₃(CH₂)₃CH₂OH
::ch3ch22choh::(CH₃CH₂)₂CHOH
::c6h11oh::C₆H₁₁OH
::ch3ch24ch2oh::CH₃(CH₂)₄CH₂OH
::c6h5-ch2oh::C₆H₅-CH₂OH
::c6h5oh::C₆H₅OH
::o=c6h4=o::O=C₆H₄=O
::ch3c6h4oh::CH₃C₆H₄OH
::c6h4oh2::C₆H₄(OH)₂
::c6h3oh3::C₆H₃(OH)₃
::clc6h4oh::ClC₆H₄OH
::hoc6h4no2::HOC₆H₄NO₂
::c10h7oh::C₁₀H₇OH
::c12h10o4::C₁₂H₁₀O₄
::hoc6h2no23::HOC₆H₂(NO₂)₃
::c2h4o::C₂H₄O
::ch32o::(CH₃)₂O
::ch3och2ch3::CH₃OCH₂CH₃
::c4h4o::C₄H₄O
::ch24o::(CH₂)₄O
::ch3ch22o::(CH₃CH₂)₂O
::ch3ch22och3::CH₃(CH₂)₂OCH₃
::ch33coch3::(CH₃)₃COCH₃
::-ch2och22-::-(CH₂OCH₂)₂-
::ch3ch2ch22o::(CH₃CH₂CH₂)₂O
::hoch2ch22o::(HOCH₂CH₂)₂O
::ch3oc6h5::CH₃OC₆H₅
::ch3ch2oc6h5::CH₃CH₂OC₆H₅
::c9h6o2::C₉H₆O₂
::c6h52o::(C₆H₅)₂O
::c11h12o3::C₁₁H₁₂O₃
::c6h5ch22o::(C₆H₅CH₂)₂O
::c12h24o6::C₁₂H₂₄O₆
::-ch2-o3::-(CH₂-O)₃
::ch3cho::CH₃CHO
::-chch3-o3-::-(CH(CH₃)-O)₃-
::h-co-co-h::H-CO-CO-H
::ch3ch2cho::CH₃CH₂CHO
::ch2=chcho::CH₂=CHCHO
::ch3ch22cho::CH₃(CH₂)₂CHO
::ch32chcho::(CH₃)₂CHCHO
::ch3ch23cho::CH₃(CH₂)₃CHO
::ch32chch2cho::(CH₃)₂CHCH₂CHO
::ch33ccho::(CH₃)₃CCHO
::c7h6o::C₇H₆O
::c6h5cho::C₆H₅CHO
::c6h5ch=chcho::C₆H₅CH=CHCHO
::ch3oc6h4cho::CH₃OC₆H₄CHO
::c20h28o::C₂₀H₂₈O
::ch2=c=o::CH₂=C=O
::ch32co::(CH₃)₂CO
::ch3ch2coch3::CH₃CH₂COCH₃
::ch3cococh3::CH3COCOCH3
::ch3ch22coch3::CH₃(CH₂)₂COCH₃
::ch3ch22co::(CH₃CH₂)₂CO
::ch32chcoch3::(CH₃)₂CHCOCH₃
::c6h10o::C₆H₁₀O
::ch3ch24coch3::CH₃(CH₂)₄COCH₃
::c6h5coch3::C₆H₅COCH₃
::c5h4ncoch3::C₅H₄NCOCH₃
::c10h14o::C₁₀H₁₄O
::c10h16o::C₁₀H₁₆O
::c6h8o6::C₆H₈O₆
::c9h6o4::C₉H₆O₄
::c6h5coc6h5::C₆H₅COC₆H₅
::c13h20o::C₁₃H₂₀O
::c17h19o3n::C₁₇H₁₉O₃N
::c19h28o2::C₁₉H₂₈O₂
::c18h27o3n::C₁₈H₂₇O₃N
::c5h10o5::C₅H₁₀O₅
::c5h10o4::C₅H₁₀O₄
::c6h12o6::C₆H₁₂O₆
::c6h12o6h2o::C₆H₁₂O₆∙H₂O
::c12h22o11::C₁₂H₂₂O₁₁
::c12h22o11h2o::C₁₂H₂₂O₁₁∙H₂O
::c6h10o5n::(C₆H₁₀O₅)ₙ
::hcoo-::HCOO⁻
::ch3cooh::CH₃COOH
::ch3coo-::CH₃COO⁻
::ch2=chcooh::CH₂=CHCOOH
::ch3ch2cooh::CH₃CH₂COOH
::ch3coooh::CH₃C(O)OOH
::ch2ohcooh::CH₂OHCOOH
::ch2ohcoo-::CH₂OHCOO⁻
::ch2fcooh::CH₂FCOOH
::ch3cocooh::CH₃COCOOH
::ch3cocoo-::CH₃COCOO⁻
::ch3ch22cooh::CH₃(CH₂)₂COOH
::ch3ch22coo-::CH₃(CH₂)₂COO⁻
::ch32chcooh::(CH₃)₂CHCOOH
::cooh2::(COOH)₂
::ch3chohcooh::CH₃CHOHCOOH
::ch3chohcoo-::CH₃CHOHCOO-
::ch2clcooh::CH₂ClCOOH
::ch3ch23cooh::CH₃(CH₂)₃COOH
::cch33cooh::C(CH₃)₃COOH
::ch2cooh2::CH₂(COOH)₂
::ch3chclcooh::CH₃CHClCOOH
::ch2clch2cooh::CH₂ClCH₂COOH
::ch3ch24cooh::CH₃(CH₂)₄COOH
::ch2cooh2::(CH₂COOH)₂
::hoocch22coo-::HOOC(CH₂)₂COO⁻
::-oohch22coo-::⁻OOH(CH₂)₂COO⁻
::chohcooh2::CHOH(COOH)₂
::c7h6o2::C₇H₆O₂
::chcl2cooh::CHCl₂COOH
::ho-c6h4-cooh::HO-C₆H₄-COOH
::ch2brcooh::CH₂BrCOOH
::ch3ch26cooh::CH₃(CH₂)₆COOH
::hoocch24cooh::HOOC(CH₂)₄COOH
::ccl3cooh::CCl₃COOH
::ch3ch28cooh::CH₃(CH₂)₈COOH
::ch2icooh::CH₂ICOOH
::c6h8o7::C₆H₈O₇
::c6h8o7h2o::C₆H₈O₇∙H₂O
::c6h7o7-::C₆H₇O₇⁻
::c6h6o72-::C₆H₆O₇²⁻
::c6h5o73-::C₆H₅O₇³⁻
::ch3ch210cooh::CH₃(CH₂)₁₀COOH
::hoocch28cooh::HOOC(CH₂)₈COOH
::ch3ch212cooh::CH₃(CH₂)₁₂COOH
::ch3ch214cooh::CH₃(CH₂)₁₄COOH
::ch3ch214coo-::CH₃(CH₂)₁₄COO⁻
::c18h30o2::C₁₈H₃₀O₂
::c18h32o2::C₁₈H₃₂O₂
::ch3ch216cooh::CH₃(CH₂)₁₆COOH
::ch3c=o2o::(CH₃C=O)₂O
::ch3ch2c=o2o::(CH₃CH₂C=O)₂O
::c6h4c=o2o::C₆H₄(C=O)₂O
::c6h5c=o2o::(C₆H₅C=O)₂O
::ch3c=ocl::CH₃C(=O)Cl
::ch3ch2c=ocl::CH₃CH₂C(=O)Cl
::c=ocl2::C(=O)Cl₂
::ch3c=obr::CH₃C(=O)Br
::c6h5c=ocl::C₆H₅C(=O)Cl
::hc=onh2::HC(=O)NH₂
::ch3c=onh2::CH₃C(=O)NH₂
::c=onh22::C(=O)(NH₂)₂
::c6h5c=onh2::C₆H₅C(=O)NH₂
::ch3-cn::CH₃-CN
::ch2=ch-cn::CH₂=CH-CN
::ch3ch2cn::CH₃CH₂CN
::c6h5cn::C₆H₅CN
::nc-ch24-cn::NC-(CH₂)₄-CN
::c2h3n::C₂H₃N
::c7h5n::C₇H₅N
::hcooch3::HCOOCH₃
::hcooch2ch3::HCOOCH₂CH₃
::ch3cooch3::CH₃COOCH₃
::ch3ono2::CH₃ONO₂
::ch3cooch2ch3::CH₃COOCH₂CH₃
::hcooch22ch3::HCOO(CH₂)₂CH₃
::ch3ch2ono2::CH₃CH₂ONO₂
::ch3coochch32::CH₃COOCH(CH₃)₂
::ch3ch2cooch3::CH₃CH₂COOCH₃
::ch3coocch33::CH₃COOC(CH₃)₃
::c6h5cooch3::C₆H₅COOCH₃
::c6h5cooc6h5::C₆H₅COOC₆H₅
::c3h5n3o9::C₃H₅N₃O₉
::c39h74o6::C₃₉H₇₄O₆
::c45h86o6::C₄₅H₈₆O₆
::c51h98o6::C₅₁H₉₈O₆
::c57h110o6::C₅₇H₁₁₀O₆
::c57h104o6::C₅₇H₁₀₄O₆
::c3h9o6p::C₃H₉O₆P
::c3h8o6p-::C₃H₈O₆P⁻
::c3h7o6p2-::C₃H₇O₆P²⁻
::c6h13o9p::C₆H₁₃O₉P
::c6h12o9p-::C₆H₁₂O₉P⁻
::c6h11o9p2-::C₆H₁₁O₉P²⁻
::nh2chch3cooh::NH₂CH(CH₃)COOH
::nh2chch3coo-::NH₂CH(CH₃)COO⁻
::+nh3chrcoo-::⁺NH₃CH(R)COO⁻
::nh2ch2cooh::NH₂CH₂COOH
::+nh3ch2coo-::⁺NH₃CH₂COO⁻
::nh2ch2coo-::NH₂CH₂COO⁻
::+nh3ch2cooh::⁺NH₃CH₂COOH
::c6h9n3o2::C₆H₉N₃O₂
::c6h13no2::C₆H₁₃NO₂
::c6h14n2o2::C₆H₁₄N₂O₂
::phe-ch2-c6h5::Phe-CH₂-C₆H₅
::c5h9no2::C₅H₉NO₂
::c5h9no3::C₅H₉NO₃
::-ch2-oh::-CH₂-OH
::c11h12n2o2::C₁₁H₁₂N₂O₂
::+nh3chrcooh::⁺NH₃CH(R)COOH
::nh2chrcoo-::NH₂CH(R)COO⁻
::nh2ch23cooh::NH₂(CH₂)₃COOH
::nh2ch22so3h::NH₂(CH₂)₂SO₃H
::nh2ch22so3-::NH₂(CH₂)₂SO₃⁻
::nh2c6h4cooh::NH₂C₆H₄COOH
::ch3no2::CH₃NO₂
::ch3ch2no2::CH₃CH₂NO₂
::ch3ch2ch2no2::CH₃CH₂CH₂NO₂
::ch32chno2::(CH₃)₂CHNO₂
::c6h5no2::C₆H₅NO₂
::ch3c6h4no2::CH₃C₆H₄NO₂
::c6h4no22::C₆H₄(NO₂)₂
::ch3c6h3no22::CH₃C₆H₃(NO₂)₂
::ch3c6h2no23::CH₃C₆H₂(NO₂)₃
::ch3ch2sh::CH₃CH₂SH
::ch3csnh2::CH₃CSNH₂
::ch3cosh::CH₃COSH
::ch3ch2ch2sh::CH₃CH₂CH₂SH
::ch32chsh::(CH₃)₂CHSH
::ch32so::(CH₃)₂SO
::c4h4s::C₄H₄S
::ch3ch22s::(CH₃CH₂)₂S
::c6h5sh::C₆H₅SH
::cich2ch22s::(CICH₂CH₂)₂S
::c6h5so3h::C₆H₅SO₃H
::ch3c6h4so3h::CH₃C₆H₄SO₃H
::nh3c6h4so3h::NH₃C₆H₄SO₃H
::c6h52s::(C₆H₅)₂S
::c6h52so::(C₆H₅)₂SO
::c6h52so2::(C₆H₅)₂SO₂
::nh42co3::(NH₄)₂CO₃
::alno33::Al(NO₃)₃
::ali3::AlI₃
::bai2::BaI₂
::c2h2o2::C₂H₂O₂
::c2h5oh::C₂H₅OH
::c2h5ona::C₂H₅ONa
::caso3::CaSO₃
::ch2oh2::CH₂(OH)₂
::ch2choh::CH₂CHOH
::ch2co::CH₂CO
::ch2o::CH₂O
::ch3coona::CH₃COONa
::ch3och3::CH₃OCH₃
::crno33::Cr(NO₃)₃
::cuno32::Cu(NO₃)₂
::cuno326h2o::Cu(NO₃)₂∙6H₂O
::feoh2::Fe(OH)₂
::k3po4::K₃PO₄
::lino3::LiNO₃
::mnno32::Mn(NO₃)₂
::na2hpo3::Na₂HPO₃
::na2hpo4::Na₂HPO₄
::nah2po4::NaH₂PO₄
::nh4oh::NH₄OH
::ni3::NI₃
::no2+::NO₂⁺
::n3-::N³⁻
::crno32::Cr(NO₃)₂
::feno22::Fe(NO₂)₂
::feno32::Fe(NO₃)₂
::feso3::FeSO₃
::feso4::FeSO₄
::feno23::Fe(NO₂)₃
::feno33::Fe(NO₃)₃
::cono23::Co(NO₂)₃
::nino32::Ni(NO₃)₂
::cuno3::CuNO₃
::cu3po4::Cu₃PO₄
::cui2::CuI₂
::auno33::Au(NO₃)₃
::hgno32::Hg(NO₃)₂
::pbno34::Pb(NO₃)₄
::nh42o::(NH₄)₂O
::nh42s::(NH₄)₂S
::nh4f::NH₄F
::nh4i::NH₄I
::fescn2+::FeSCN²⁺
::nh43n::(NH₄)₃N
::nh43po4::(NH₄)₃PO₄
::agn3::AgN₃
::ba3n2::Ba₃N₂
::baso3::BaSO₃
::ch3cn::CH₃CN
::cubr2::CuBr₂
::cuf2::CuF₂
::fei2::FeI₂
::fei3::FeI₃
::hbro3::HBrO₃
::k2so3::K₂SO₃
::k3po3::K₃PO₃
::kclo2::KClO₂
::li2s::Li₂S
::mgno22::Mg(NO₂)₂
::mgso3::MgSO₃
::na3po3::Na₃PO₃
::na3po4::Na₃PO₄
::nh2cooh::NH₂COOH
::nh4br::NH₄Br
::zn3n2::Zn₃N₂
::zn3p2::Zn₃P₂
::hbo32-::HBO₃²⁻
::na3p::Na₃P
::k3n::K₃N
::k3p::K₃P
::ba3p2::Ba₃P₂
::baf2::BaF₂
::fe3n2::Fe₃N₂
::fe3p2::Fe₃P₂
::fef3::FeF₃
::cuco3::CuCO₃
::cuso3::CuSO₃
::cu3n2::Cu₃N₂
::cu3p2::Cu₃P₂
::pbco32::Pb(CO₃)₂
::pbs2::PbS₂
::pbi4::PbI₄
::c6h13br::C₆H₁₃Br
::c7h15br::C₇H₁₅Br
::cunh342+::Cu(NH₃)₄²⁺
::agnh32+::Ag(NH₃)₂⁺
::feh2o63+::Fe(H₂O)₆³⁺
::cucl42-::CuCl₄²⁻
::cl2h2cao4::Cl₂H₂CaO₄
::c4h8s::C₄H₈S
::feoh3::Fe(OH)₃
::alcl3*6h2o::AlCl₃∙6H₂O
::al(oh)3::Al(OH)₃
::al(no3)3*9h2o::Al(NO₃)₃∙9H₂O
::al2(so4)3::Al₂(SO₄)₃
::bacl2*2h2o::BaCl₂∙2H₂O
::ba(oh)2::Ba(OH)₂
::ba(oh)2*8h2o::Ba(OH)₂∙8H₂O
::ba(no3)2::Ba(NO₃)₂
::be(no3)2*3h2o::Be(NO₃)₂∙3H₂O
::beso4*4h2o::BeSO₄∙4H₂O
::bi(oh)3::Bi(OH)₃
::bi(no3)3*5h2o::Bi(NO₃)₃∙5H₂O
::pb(n3)2::Pb(N₃)₂
::pb(oh)2::Pb(OH)₂
::pb(no3)2::Pb(NO₃)₂
::pb(c2h5)4::Pb(C₂H₅)₄
::pb(ch3)4::Pb(CH₃)₄
::b2(o2)2(oh)42-::B₂(O₂)₂(OH)₄²⁻
::cdbr2*4h2o::CdBr₂∙4H₂O
::cdcl2*2h2o::CdCl₂∙2H₂O
::cd(oh)2::Cd(OH)₂
::cd(no3)2::Cd(NO₃)₂
::cd(no3)2*2h2o::Cd(NO₃)₂∙2H₂O
::cacl2*6h2o::CaCl₂∙6H₂O
::cahpo4*2h2o::CaHPO₄∙2H₂O
::ca(oh)2::Ca(OH)₂
::ca5(po4)3(oh)::Ca₅(PO₄)₃(OH)
::ca(clo)2::Ca(ClO)₂
::ca(no3)2::Ca(NO₃)₂
::c2o4ca*h2o::C₂O₄Ca∙H₂O
::ca3(po4)2::Ca₃(PO₄)₂
::caso4*½h2o::CaSO₄∙½H₂O
::caso4*2h2o::CaSO₄∙2H₂O
::(cn)2::(CN)₂
::ce(no3)3*6h2o::Ce(NO₃)₃∙6H₂O
::ce2(so4)3::Ce₂(SO₄)₃
::ce(so4)2::Ce(SO₄)₂
::crcl3*6h2o::CrCl₃∙6H₂O
::cr(oh)2::Cr(OH)₂
::crso4*7h2o::CrSO₄∙7H₂O
::cr2(so4)3::Cr₂(SO₄)₃
::cr(co)6::Cr(CO)₆
::cocl2*2h2o::CoCl₂∙2H₂O
::cocl2*6h2o::CoCl₂∙6H₂O
::co(oh)2::Co(OH)₂
::co(no3)2*6h2o::Co(NO₃)₂∙6H₂O
::coso4*7h2o::CoSO₄∙7H₂O
::fecl2*2h2o::FeCl₂∙2H₂O
::fecl2*4h2o::FeCl₂∙4H₂O
::fecl3*6h2o::FeCl₃∙6H₂O
::fe(no3)3*9h2o::Fe(NO₃)₃∙9H₂O
::fepo4*2h2o::FePO₄∙2H₂O
::feso4*7h2o::FeSO₄∙7H₂O
::fe2(so4)3::Fe₂(SO₄)₃
::fe(co)5::Fe(CO)₅
::fe(c5h5)2::Fe(C₅H₅)₂
::ksb(oh)6*½h2o::KSb(OH)₆∙½H₂O
::k2co3*2h2o::K₂CO₃∙2H₂O
::k3fe(cn)6::K₃Fe(CN)₆
::cu2(oh)2co3::Cu₂(OH)₂CO₃
::cu3(oh)2(co3)2::Cu₃(OH)₂(CO₃)₂
::cucl2*2h2o::CuCl₂∙2H₂O
::cu(oh)2::Cu(OH)₂
::cu(no3)2*3h2o::Cu(NO₃)₂∙3H₂O
::cuso4*5h2o::CuSO₄∙5H₂O
::hg(no3)2*½h2o::Hg(NO₃)₂∙½H₂O
::li2so4*h2o::Li₂SO₄∙H₂O
::mgcl2*6h2o::MgCl₂∙6H₂O
::mg(oh)2::Mg(OH)₂
::mg(no3)2::Mg(NO₃)₂
::mg(no3)2*6h2o::Mg(NO₃)₂∙6H₂O
::mg(clo4)2::Mg(ClO₄)₂
::mgso4*7h2o::MgSO₄∙7H₂O
::mncl2*4h2o::MnCl₂∙4H₂O
::mn(oh)2::Mn(OH)₂
::mnso4*7h2o::MnSO₄∙7H₂O
::mn2(co)10::Mn₂(CO)₁₀
::mo(oh)3::Mo(OH)₃
::h2moo4*h2o::H₂MoO₄∙H₂O
::mo(co)6::Mo(CO)₆
::nabr*2h2o::NaBr∙2H₂O
::nah2po4*h2o::NaH₂PO₄∙H₂O
::na3co(no2)6::Na₃Co(NO₂)₆
::(napo3)6::(NaPO₃)₆
::naclo*2½h2o::NaClO∙2½H₂O
::nai*2h2o::NaI∙2H₂O
::na2so3*7h2o::Na₂SO₃∙7H₂O
::w2o4*2h2o::W₂O₄∙2H₂O
::nicl2*6h2o::NiCl₂∙6H₂O
::ni(oh)2::Ni(OH)₂
::ni(no3)2*6h2o::Ni(NO₃)₂∙6H₂O
::niso4*6h2o::NiSO4∙6H₂O
::ni(co)4::Ni(CO)₄
::(nh4)2co3*h2o::(NH₄)₂CO₃∙H₂O
::(nh4)2cro4::(NH₄)₂CrO₄
::(nh4)2cr2o7::(NH₄)₂Cr₂O₇
::(nh4)2moo4::(NH₄)₂MoO₄
::(nh4)2s2o8::(NH₄)₂S₂O8
::(nh4)2so4::(NH₄)₂SO₄
::(nh3nh3)so4::(NH₃NH₃)SO₄
::(nh3oh)cl::(NH₃OH)Cl
::(nh3oh)2so4::(NH₃OH)₂SO₄
::(hpo3)n::(HPO₃)n
::srcl2*2h2o::SrCl₂∙2H₂O
::sr(oh)2::Sr(OH)₂
::sr(oh)2*8h2o::Sr(OH)₂∙8H₂O
::sr(no3)2::Sr(NO₃)₂
::sr(no3)2*4h2o::Sr(NO₃)₂∙4H₂O
::th(no3)4::Th(NO₃)₄
::th(no3)5*5h2o::Th(NO₃)₅∙5H₂O
::sncl2*2h2o::SnCl₂∙2H₂O
::sn(oh)2::Sn(OH)₂
::uo2(so4)*3h2o::UO₂(SO₄)∙3H₂O
::v2(so4)3::V₂(SO₄)₃
::v(co)6::V(CO)₆
::zn(oh)2::Zn(OH)₂
::zn(no3)2*6h2o::Zn(NO₃)₂∙6H₂O
::znso4*7h2o::ZnSO₄∙7H₂O
::zr(no3)4*5h2o::Zr(NO₃)₄∙5H₂O
::zrocl2*8h2o::ZrOCl₂∙8H₂O
::ch3(ch2)4ch3::CH₃(CH₂)₄CH₃
::ch3(ch2)5ch3::CH₃(CH₂)₅CH₃
::ch3(ch2)6ch3::CH₃(CH₂)₆CH₃
::ch3(ch2)9ch3::CH₃(CH₂)₉CH₃
::(ch3)3ch::(CH₃)₃CH
::c(ch3)4::C(CH₃)₄
::ch2(ch(ch3)2)2::CH₂(CH(CH₃)₂)₂
::(ch3)2c6h10::(CH₃)₂C₆H₁₀
::c6h4(ch3)2::C₆H₄(CH₃)₂
::c6h5ch(ch3)2::C₆H₅CH(CH₃)₂
::(ch3)3ccl::(CH₃)₃CCl
::(ch3)3cbr::(CH₃)₃CBr
::(ch3)3ci::(CH₃)₃CI
::(ch3)2nh::(CH₃)₂NH
::(ch3)2nh2+::(CH₃)₂NH₂⁺
::(ch3)3n::(CH₃)₃N
::h2n(ch2)2nh2::H₂N(CH₂)₂NH₂
::(ch3ch2)2nh::(CH₃CH₂)₂NH
::h2n(ch2)3nh2::H₂N(CH₂)₃NH₂
::h2n(ch2)4nh2::H₂N(CH₂)₄NH₂
::(ch3ch2)3n::(CH₃CH₂)₃N
::(ch3)4ncl::(CH₃)₄NCl
::n(ch2ch2)3n::N(CH₂CH₂)₃N
::h2n(ch2)6nh2::H₂N(CH₂)₆NH₂
::c6h5n(ch3)2::C₆H₅N(CH₃)₂
::(c6h5)2nh::(C₆H₅)₂NH
::(c6h5)3n::(C₆H₅)₃N
::(ch3)3coh::(CH₃)₃COH
::c6h4(oh)2::C₆H₄(OH)₂
::c6h3(oh)3::C₆H₃(OH)₃
::hoc6h2(no2)3::HOC₆H₂(NO₂)₃
::(ch3)2o::(CH₃)₂O
::(ch2)4o::(CH₂)₄O
::(ch3ch2)2o::(CH₃CH₂)₂O
::(ch3)3coch3::(CH₃)₃COCH₃
::-(ch2och2)2-::-(CH₂OCH₂)₂-
::(hoch2ch2)2o::(HOCH₂CH₂)₂O
::(c6h5)2o::(C₆H₅)₂O
::(c6h5ch2)2o::(C₆H₅CH₂)₂O
::-(ch2-o)3::-(CH₂-O)₃
::-(ch(ch3)-o)3-::-(CH(CH₃)-O)₃-
::ch3(ch2)2cho::CH₃(CH₂)₂CHO
::(ch3)2chcho::(CH₃)₂CHCHO
::ch3(ch2)3cho::CH₃(CH₂)₃CHO
::(ch3)3ccho::(CH₃)₃CCHO
::(ch3)2co::(CH₃)₂CO
::(ch3ch2)2co::(CH₃CH₂)₂CO
::c6h12o6*h2o::C₆H₁₂O₆∙H₂O
::(c6h10o5)n::(C₆H₁₀O₅)ₙ
::ch3c(o)ooh::CH₃C(O)OOH
::(ch3)2chcooh::(CH₃)₂CHCOOH
::(cooh)2::(COOH)₂
::c(ch3)3cooh::C(CH₃)₃COOH
::ch2(cooh)2::CH₂(COOH)₂
::(ch2cooh)2::(CH₂COOH)₂
::choh(cooh)2::CHOH(COOH)₂
::c6h8o7*h2o::C₆H₈O₇∙H₂O
::(ch3c=o)2o::(CH₃C=O)₂O
::c6h4(c=o)2o::C₆H₄(C=O)₂O
::(c6h5c=o)2o::(C₆H₅C=O)₂O
::ch3c(=o)cl::CH₃C(=O)Cl
::c(=o)cl2::C(=O)Cl₂
::ch3c(=o)br::CH₃C(=O)Br
::c6h5c(=o)cl::C₆H₅C(=O)Cl
::hc(=o)nh2::HC(=O)NH₂
::ch3c(=o)nh2::CH₃C(=O)NH₂
::c(=o)(nh2)2::C(=O)(NH₂)₂
::c6h5c(=o)nh2::C₆H₅C(=O)NH₂
::nc-(ch2)4-cn::NC-(CH₂)₄-CN
::nh2ch(r)coo-::NH₂CH(R)COO⁻
::(ch3)2chno2::(CH₃)₂CHNO₂
::c6h4(no2)2::C₆H₄(NO₂)₂
::(ch3)2chsh::(CH₃)₂CHSH
::(ch3)2so::(CH₃)₂SO
::(ch3ch2)2s::(CH₃CH₂)₂S
::(cich2ch2)2s::(CICH₂CH₂)₂S
::(c6h5)2s::(C₆H₅)₂S
::(c6h5)2so::(C₆H₅)₂SO
::(c6h5)2so2::(C₆H₅)₂SO₂
::(nh4)2co3::(NH₄)₂CO₃
::al(no3)3::Al(NO₃)₃
::ch2(oh)2::CH₂(OH)₂
::cr(no3)3::Cr(NO₃)₃
::cu(no3)2::Cu(NO₃)₂
::cu(no3)2*6h2o::Cu(NO₃)₂∙6H₂O
::fe(oh)2::Fe(OH)₂
::mn(no3)2::Mn(NO₃)₂
::cr(no3)2::Cr(NO₃)₂
::fe(no2)2::Fe(NO₂)₂
::fe(no3)2::Fe(NO₃)₂
::fe(no2)3::Fe(NO₂)₃
::fe(no3)3::Fe(NO₃)₃
::co(no2)3::Co(NO₂)₃
::ni(no3)2::Ni(NO₃)₂
::au(no3)3::Au(NO₃)₃
::hg(no3)2::Hg(NO₃)₂
::pb(no3)4::Pb(NO₃)₄
::(nh4)2o::(NH₄)₂O
::(nh4)2s::(NH₄)₂S
::(nh4)3n::(NH₄)₃N
::(nh4)3po4::(NH₄)₃PO₄
::mg(no2)2::Mg(NO₂)₂
::pb(co3)2::Pb(CO₃)₂
::cu(nh3)42+::Cu(NH₃)₄²⁺
::ag(nh3)2+::Ag(NH₃)₂⁺
::fe(h2o)63+::Fe(H₂O)₆³⁺
::fe(oh)3::Fe(OH)₃
::agbro4::AgBrO₄
::agclo3::AgClO₃
::agclo4::AgClO₄
::albo3::AlBO₃
::alcl2f::AlCl₂F
::alcl2h::AlCl₂H
::asbr3::AsBr₃
::asf3::AsF₃
::asi3::AsI₃
::au(oh)3::Au(OH)₃
::au2o3::Au₂O₃
::au2s3::Au₂S₃
::au2se3::Au₂Se₃
::aubr3::AuBr₃
::auf3::AuF₃
::aui3::AuI₃
::b(no3)3::B(NO₃)₃
::b(oh)3::B(OH)₃
::ba(bro)2::Ba(BrO)₂
::ba(bro2)2::Ba(BrO₂)₂
::ba(bro3)2::Ba(BrO₃)₂
::ba(bro4)2::Ba(BrO₄)₂
::ba(cn)2::Ba(CN)₂
::ba(io)2::Ba(IO)₂
::ba(io2)2::Ba(IO₂)₂
::ba(io3)2::Ba(IO₃)₂
::ba(io4)2::Ba(IO₄)₂
::ba(mno4)2::Ba(MnO₄)₂
::ba(nbo3)2::Ba(NbO₃)₂
::ba(no2)2::Ba(NO₂)₂
::ba(po3)2::Ba(PO₃)₂
::ba(scn)2::Ba(SCN)₂
::bbr3::BBr₃
::bcl3::BCl₃
::be3n2::Be₃N₂
::beb2::BeB₂
::bebr2::BeBr₂
::beco3::BeCO₃
::bef2::BeF₂
::bei2::BeI₂
::beso3::BeSO₃
::beso4::BeSO₄
::c2h3cl::C₂H₃Cl
::c2h3no::C₂H₃NO
::c2h4cl2::C₂H₄Cl₂
::c2h4n4::C₂H₄N₄
::c2h4o2::C₂H₄O₂
::c2h5br::C₂H₅Br
::c2h5nh2::C₂H₅NH₂
::c2h5no2::C₂H₅NO₂
::c2h5ocs::C₂H₅OCs
::ca(bro)2::Ca(BrO)₂
::ca(bro2)2::Ca(BrO₂)₂
::ca(bro3)2::Ca(BrO₃)₂
::ca(bro4)2::Ca(BrO₄)₂
::ca(clo2)2::Ca(ClO₂)₂
::ca(clo3)2::Ca(ClO₃)₂
::ca(clo4)2::Ca(ClO₄)₂
::ca(cn)2::Ca(CN)₂
::ca(hs)2::Ca(HS)₂
::ca(io)2::Ca(IO)₂
::ca(io2)2::Ca(IO₂)₂
::ca(io3)2::Ca(IO₃)₂
::ca(io4)2::Ca(IO₄)₂
::ca(no2)2::Ca(NO₂)₂
::ca3(aso4)2::Ca₃(AsO₄)₂
::ca3p2::Ca₃P₂
::cawo4::CaWO₄
::cd3p2::Cd₃P₂
::cdco3::CdCO₃
::cdso3::CdSO₃
::cf3cl::CF₃Cl
::cfcl3::CFCl₃
::ch3cch::CH₃CCH
::ch3ch2ch2ch2oh::CH₃CH₂CH₂CH₂OH
::ch3ch2conh2::CH₃CH₂CONH₂
::ch3ch2och2ch3::CH₃CH₂OCH₂CH₃
::ch3chchch3::CH₃CHCHCH₃
::ch3cocl::CH₃COCl
::ch3conh2::CH₃CONH₂
::ch3coo::CH₃COO
::ch3ok::CH₃OK
::co(cn)2::Co(CN)₂
::co(io3)2::Co(IO₃)₂
::co(no3)2::Co(NO₃)₂
::co(no3)3::Co(NO₃)₃
::co(oh)3::Co(OH)₃
::co2s3::Co₂S₃
::cobr2::CoBr₂
::cof2::CoF₂
::cof3::CoF₃
::coi2::CoI₂
::cos2::CoS₂
::cr(no2)3::Cr(NO₂)₃
::cr(oh)3::Cr(OH)₃
::cr2s3::Cr₂S₃
::cr2se3::Cr₂Se₃
::cr3as2::Cr₃As₂
::cr3c2::Cr₃C₂
::cr3sb2::Cr₃Sb₂
::crbr2::CrBr₂
::cri2::CrI₂
::cri3::CrI₃
::crpo4::CrPO₄
::crsi2::CrSi₂
::csbr3::CsBr₃
::csbro2::CsBrO₂
::csbro3::CsBrO₃
::csbro4::CsBrO₄
::csclo2::CsClO₂
::csclo3::CsClO₃
::csclo4::CsClO₄
::csi3::CsI₃
::cu(bro3)26h2o::Cu(BrO₃)₂∙6H₂O
::cu(ch3coo)::Cu(CH₃COO)
::cu(ch3coo)2::Cu(CH₃COO)₂
::cu(clo3)26h2o::Cu(ClO₃)₂∙6H₂O
::cu(io3)2::Cu(IO₃)₂
::cu3(po4)2::Cu₃(PO₄)₂
::cu3p::Cu₃P
::cuio3::CuIO₃
::cumoo4::CuMoO₄
::cusio3::CuSiO₃
::cuwo4::CuWO₄
::fe(scn)3::Fe(SCN)₃
::fe2p::Fe₂P
::fe3p::Fe₃P
::fef2::FeF₂
::fef24h2o::FeF₂∙4H₂O
::fei24h2o::FeI₂∙4H₂O
::femoo4::FeMoO₄
::feo2::FeO₂
::feo2h::FeO₂H
::fepo4::FePO₄
::fevo4::FeVO₄
::fewo4::FeWO₄
::h2co::H₂CO
::h2n2o2::H₂N₂O₂
::h2nch2cooh::H₂NCH₂COOH
::h2nnh2::H₂NNH₂
::hbro2::HBrO₂
::hbro4::HBrO₄
::hco2h::HCO₂H
::hconh2::HCONH₂
::hcoonh4::HCOONH₄
::hg(no3)2h2o::Hg(NO₃)₂∙H₂O
::hg(oh)2::Hg(OH)₂
::hg(scn)2::Hg(SCN)₂
::hgclo44h2o::HgClO₄∙4H₂O
::ibr3::IBr₃
::k2hpo3::K₂HPO₃
::k2hpo4::K₂HPO₄
::k2s2o3::K₂S₂O₃
::k3c6h5o7::K₃C₆H₅O₇
::kbro2::KBrO₂
::kbro4::KBrO₄
::kh2po3::KH₂PO₃
::khso3::KHSO₃
::khso4::KHSO₄
::kio2::KIO₂
::li2cro4::Li₂CrO₄
::li2cro42h2o::Li₂CrO₄∙2H₂O
::li2haso4::Li₂HAsO₄
::li2hpo3::Li₂HPO₃
::li2hpo4::Li₂HPO₄
::li2moo4::Li₂MoO₄
::li2n2o2::Li₂N₂O₂
::li2nbo3::Li₂NbO₃
::li2sio3::Li₂SiO₃
::li2so3::Li₂SO₃
::li2so4::Li₂SO₄
::li2wo4::Li₂WO₄
::libr2h2o::LiBr∙2H₂O
::libro2::LiBrO₂
::libro3::LiBrO₃
::libro4::LiBrO₄
::liclo2::LiClO₂
::liclo3::LiClO₃
::liclo4::LiClO₄
::lihco3::LiHCO₃
::lihso3::LiHSO₃
::lihso4::LiHSO₄
::lino2::LiNO₂
::lino3h2o::LiNO₃∙H₂O
::mg(bro)2::Mg(BrO)₂
::mg(bro2)2::Mg(BrO₂)₂
::mg(bro3)2::Mg(BrO₃)₂
::mg(bro4)2::Mg(BrO₄)₂
::mg(clo)2::Mg(ClO)₂
::mg(clo2)2::Mg(ClO₂)₂
::mg(clo3)2::Mg(ClO₃)₂
::mg(clo3)2xh2o::Mg(ClO₃)₂∙xH₂O
::mg(io)2::Mg(IO)₂
::mg(io2)2::Mg(IO₂)₂
::mg(io3)2::Mg(IO₃)₂
::mg(io4)2::Mg(IO₄)₂
::mg3p2::Mg₃P₂
::mgcro4::MgCrO₄
::mgcro45h2o::MgCrO₄∙5H₂O
::mgf2::MgF₂
::mghpo4::MgHPO₄
::mgmoo4::MgMoO₄
::mn(no3)24h2o::Mn(NO₃)₂∙4H₂O
::mn3p2::Mn₃P₂
::mnbr2::MnBr₂
::mnbr24h2o::MnBr₂∙4H₂O
::mncl2::MnCl₂
::mnf2::MnF₂
::mni2::MnI₂
::mobr2::MoBr₂
::mobr3::MoBr₃
::n2h2::N₂H₂
::n2h4::N₂H₄
::n4h4::N₄H₄
::na2mos4::Na₂MoS₄
::na2n2o2::Na₂N₂O₂
::na2seo3::Na₂SeO₃
::na2zno2::Na₂ZnO₂
::na2zro3::Na₂ZrO₃
::na3aso4::Na₃AsO₄
::na3vo4::Na₃VO₄
::na4v2o7::Na₄V₂O₇
::nabro2::NaBrO₂
::nabro4::NaBrO₄
::nac6f5coo::NaC₆F₅COO
::nac6h5coo::NaC₆H₅COO
::nac6h7o7::NaC₆H₇O₇
::nah2aso4::NaH₂AsO₄
::nah2po3::NaH₂PO₃
::naio2::NaIO₂
::naio4::NaIO₄
::nanbo3::NaNbO₃
::nh2ch2cn::NH₂CH₂CN
::nh2cl::NH₂Cl
::nh2conh2::NH₂CONH₂
::nh4clo4::NH₄ClO₄
::nh4co2nh2::NH₄CO₂NH₂
::nh4oconh2::NH₄OCONH₂
::nhcl2::NHCl₂
::ni(co)3::Ni(CO)₃
::ni3(po4)2::Ni₃(PO₄)₂
::nibr23h2o::NiBr₂∙3H₂O
::nii2::NiI₂
::nimoo4::NiMoO₄
::nis2::NiS₂
::p2i4::P₂I₄
::p2o5::P₂O₅
::p2s3::P₂S₃
::p2se3::P₂Se₃
::p3n5::P₃N₅
::pb(io3)2::Pb(IO₃)₂
::pbco3::PbCO₃
::pbf2::PbF₂
::pobr2::PoBr₂
::pocl2::PoCl₂
::pocl3::POCl₃
::pocl4::PoCl₄
::pof6::PoF₆
::sbbr3::SbBr₃
::sbi3::SbI₃
::sebr4::SeBr₄
::secl4::SeCl₄
::sn(oh)4::Sn(OH)₄
::snbr2::SnBr₂
::ubr2::UBr₂
::ubr3::UBr₃
::ubr5::UBr₅
::ucl3::UCl₃
::ucl4::UCl₄
::zn(clo3)2::Zn(ClO₃)₂
::zn(cn)2::Zn(CN)₂
::zn(io3)2::Zn(IO₃)₂
::zn(no2)2::Zn(NO₂)₂
::zn(scn)2::Zn(SCN)₂
::znf2::ZnF₂
::znso3::ZnSO₃
::zr(oh)4::Zr(OH)₄
::zr(so4)2::Zr(SO₄)₂
::aso33-::AsO₃³⁻
::ocl-::OCl⁻
::obr-::OBr⁻
::nh2-::NH₂⁻
::c2o42-::C₂O₄²⁻
::ho2c2o2-::HO₂C₂O₂⁻
::hco2-::HCO₂⁻
::c6h5coo-::C₆H₅COO⁻
::o2c2o22-::O₂C₂O₂²⁻
::bo33-::BO₃³⁻
::limno4::LiMnO₄
::li3n::Li₃N
::li3p::Li₃P
::mg(hso4)2::Mg(HSO₄)₂
::mg(cn)2::Mg(CN)₂
::mg(hco3)2::Mg(HCO₃)₂
::mg(h2po4)2::Mg(H₂PO₄)₂
::ca(mno4)2::Ca(MnO₄)₂
::ca(hco3)2::Ca(HCO₃)₂
::cacro4::CaCrO₄
::sr3n2::Sr₃N₂
::ti(no2)2::Ti(NO₂)₂
::ti(no3)2::Ti(NO₃)₂
::ti(oh)2::Ti(OH)₂
::ti(cn)2::Ti(CN)₂
::ti(mno4)2::Ti(MnO₄)₂
::cr(no2)2::Cr(NO₂)₂
::cr3n2::Cr₃N₂
::cr3p2::Cr₃P₂
::mn(no2)2::Mn(NO₂)₂
::mn(clo)2::Mn(ClO)₂
::mn(clo2)2::Mn(ClO₂)₂
::mn(io3)2::Mn(IO₃)₂
::mnso3::MnSO₃
::mncro4::MnCrO₄
::mn3n2::Mn₃N₂
::fe(hso4)2::Fe(HSO₄)₂
::fe(cn)2::Fe(CN)₂
::fe(mno4)2::Fe(MnO₄)₂
::fe(hco3)2::Fe(HCO₃)₂
::fe(clo)2::Fe(ClO)₂
::fe(clo2)2::Fe(ClO₂)₂
::fe(clo3)2::Fe(ClO₃)₂
::fe(clo4)2::Fe(ClO₄)₂
::fe(bro3)2::Fe(BrO₃)₂
::fe(io3)2::Fe(IO₃)₂
::fe(io4)2::Fe(IO₄)₂
::fes2o3::FeS₂O₃
::fecro4::FeCrO₄
::fecr2o7::FeCr₂O₇
::fehpo4::FeHPO₄
::fe3(po4)2::Fe₃(PO₄)₂
::fe3(aso4)2::Fe₃(AsO₄)₂
::fe3as2::Fe₃As₂
::fe(hso4)3::Fe(HSO₄)₃
::fe(cn)3::Fe(CN)₃
::fe(mno4)3::Fe(MnO₄)₃
::fe(hco3)3::Fe(HCO₃)₃
::fe(clo)3::Fe(ClO)₃
::fe(clo2)3::Fe(ClO₂)₃
::fe(clo3)3::Fe(ClO₃)₃
::fe(clo4)3::Fe(ClO₄)₃
::fe(bro3)3::Fe(BrO₃)₃
::fe(io3)3::Fe(IO₃)₃
::fe(io4)3::Fe(IO₄)₃
::fe(h2po4)3::Fe(H₂PO₄)₃
::fe2(co3)3::Fe₂(CO₃)₃
::fe2(so3)3::Fe₂(SO₃)₃
::fe2(s2o3)3::Fe₂(S₂O₃)₃
::fe2(o2)3::Fe₂(O₂)₃
::fe2(cro4)3::Fe₂(CrO₄)₃
::fe2(cr2o7)3::Fe₂(Cr₂O₇)₃
::fe2(hpo4)3::Fe₂(HPO₄)₃
::feaso4::FeAsO₄
::fe2se3::Fe₂Se₃
::fe2te3::Fe₂Te₃
::co(no2)2::Co(NO₂)₂
::ni(no2)2::Ni(NO₂)₂
::ni(io3)2::Ni(IO₃)₂
::nico3::NiCO₃
::niso3::NiSO₃
::ni3n2::Ni₃N₂
::ni3p2::Ni₃P₂
::nif2::NiF₂
::pd(no3)2::Pd(NO₃)₂
::pt(no3)2::Pt(NO₃)₂
::pt(oh)2::Pt(OH)₂
::cuno2::CuNO₂
::cuhso4::CuHSO₄
::cumno4::CuMnO₄
::cuhco3::CuHCO₃
::cuclo2::CuClO₂
::cuclo3::CuClO₃
::cuclo4::CuClO₄
::cubro3::CuBrO₃
::cuio4::CuIO₄
::cuc2h3o2::CuC₂H₃O₂
::cuh2po4::CuH₂PO₄
::cu2co3::Cu₂CO₃
::cu2so3::Cu₂SO₃
::cu2s2o3::Cu₂S₂O₃
::cu2o2::Cu₂O₂
::cu2cro4::Cu₂CrO₄
::cu2cr2o7::Cu₂Cr₂O₇
::cu2hpo4::Cu₂HPO₄
::cu3aso4::Cu₃AsO₄
::cu3n::Cu₃N
::cu(no2)2::Cu(NO₂)₂
::cu(hso4)2::Cu(HSO₄)₂
::cu(cn)2::Cu(CN)₂
::cu(mno4)2::Cu(MnO₄)₂
::cu(hco3)2::Cu(HCO₃)₂
::cu(clo)2::Cu(ClO)₂
::cu(clo2)2::Cu(ClO₂)₂
::cu(clo3)2::Cu(ClO₃)₂
::cu(clo4)2::Cu(ClO₄)₂
::cu(bro3)2::Cu(BrO₃)₂
::cu(io4)2::Cu(IO₄)₂
::cu(c2h3o2)2::Cu(C₂H₃O₂)₂
::cu(h2po4)2::Cu(H₂PO₄)₂
::cus2o3::CuS₂O₃
::cuo2::CuO₂
::cucro4::CuCrO₄
::cucr2o7::CuCr₂O₇
::cuhpo4::CuHPO₄
::cu3(aso4)2::Cu₃(AsO₄)₂
::cu3as2::Cu₃As₂
::agno2::AgNO₂
::aghso4::AgHSO₄
::aghco3::AgHCO₃
::agclo2::AgClO₂
::agc2h3o2::AgC₂H₃O₂
::agh2po4::AgH₂PO₄
::ag2so3::Ag₂SO₃
::ag2s2o3::Ag₂S₂O₃
::ag2o2::Ag₂O₂
::ag2hpo4::Ag₂HPO₄
::ag3aso4::Ag₃AsO₄
::ag3n::Ag₃N
::ag3p::Ag₃P
::ag3as::Ag₃As
::auno2::AuNO₂
::auno3::AuNO₃
::auhso4::AuHSO₄
::aumno4::AuMnO₄
::auhco3::AuHCO₃
::auclo2::AuClO₂
::auclo3::AuClO₃
::auclo4::AuClO₄
::aubro3::AuBrO₃
::auio3::AuIO₃
::auio4::AuIO₄
::auc2h3o2::AuC₂H₃O₂
::au2co3::Au₂CO₃
::au2so3::Au₂SO₃
::au2so4::Au₂SO₄
::au2s2o3::Au₂S₂O₃
::au2o2::Au₂O₂
::au3n::Au₃N
::au3p::Au₃P
::au3as::Au₃As
::au2o::Au₂O
::au2se::Au₂Se
::au2te::Au₂Te
::au(no2)3::Au(NO₂)₃
::au(hso4)3::Au(HSO₄)₃
::au(cn)3::Au(CN)₃
::aupo4::AuPO₄
::auaso4::AuAsO₄
::au2te3::Au₂Te₃
::zncro4::ZnCrO₄
::zncr2o7::ZnCr₂O₇
::znhpo4::ZnHPO₄
::cd(no2)2::Cd(NO₂)₂
::cd3n2::Cd₃N₂
::hg2co3::Hg₂CO₃
::hg2so3::Hg₂SO₃
::hg2cro4::Hg₂CrO₄
::hg2s::Hg₂S
::hg2se::Hg₂Se
::hg2te::Hg₂Te
::hg2f2::Hg₂F₂
::hg(no2)2::Hg(NO₂)₂
::hg(hso4)2::Hg(HSO₄)₂
::hg(cn)2::Hg(CN)₂
::hg(io4)2::Hg(IO₄)₂
::hg(h2po4)2::Hg(H₂PO₄)₂
::hgco3::HgCO₃
::hgso3::HgSO₃
::hgso4::HgSO₄
::hgs2o3::HgS₂O₃
::al(hso4)3::Al(HSO₄)₃
::al(cn)3::Al(CN)₃
::al(mno4)3::Al(MnO₄)₃
::al(hco3)3::Al(HCO₃)₃
::al(clo)3::Al(ClO)₃
::ga(no3)3::Ga(NO₃)₃
::in(no3)3::In(NO₃)₃
::tl(no3)3::Tl(NO₃)₃
::sn(no3)2::Sn(NO₃)₂
::sn(no3)4::Sn(NO₃)₄
::pb(no2)2::Pb(NO₂)₂
::pb(hso4)2::Pb(HSO₄)₂
::pb(cn)2::Pb(CN)₂
::pb(io4)2::Pb(IO₄)₂
::pbso3::PbSO₃
::pbs2o3::PbS₂O₃
::pbcr2o7::PbCr₂O₇
::pbhpo4::PbHPO₄
::pb3(po4)2::Pb₃(PO₄)₂
::pb3(aso4)2::Pb₃(AsO₄)₂
::pb3n2::Pb₃N₂
::pb3p2::Pb₃P₂
::pb3as2::Pb₃As₂
::pb(no2)4::Pb(NO₂)₄
::pb(hso4)4::Pb(HSO₄)₄
::pb(cn)4::Pb(CN)₄
::pb(mno4)4::Pb(MnO₄)₄
::pb(hco3)4::Pb(HCO₃)₄
::pb(clo)4::Pb(ClO)₄
::pb(clo2)4::Pb(ClO₂)₄
::pb(clo3)4::Pb(ClO₃)₄
::pb(clo4)4::Pb(ClO₄)₄
::pb(bro3)4::Pb(BrO₃)₄
::pb(io3)4::Pb(IO₃)₄
::pb(io4)4::Pb(IO₄)₄
::pb(c2h3o2)4::Pb(C₂H₃O₂)₄
::pb(h2po4)4::Pb(H₂PO₄)₄
::pb(so3)2::Pb(SO₃)₂
::pb(so4)2::Pb(SO₄)₂
::pb(s2o3)2::Pb(S₂O₃)₂
::pb(o2)2::Pb(O₂)₂
::pb3n4::Pb₃N₄
::pb3p4::Pb₃P₄
::pb3as4::Pb₃As₄
::pbse2::PbSe₂
::pbte2::PbTe₂
::pbf4::PbF₄
::pbbr4::PbBr₄
::nh4cn::NH₄CN
::nh4mno4::NH₄MnO₄
::nh4clo::NH₄ClO
::nh4clo2::NH₄ClO₂
::nh4clo3::NH₄ClO₃
::nh4bro3::NH₄BrO₃
::nh4io3::NH₄IO₃
::nh4io4::NH₄IO₄
::nh4c2h3o2::NH₄C₂H₃O₂
::nh4h2po4::NH₄H₂PO₄
::(nh4)2so3::(NH₄)₂SO₃
::(nh4)2s2o3::(NH₄)₂S₂O₃
::(nh4)2o2::(NH₄)₂O₂
::(nh4)2hpo4::(NH₄)₂HPO₄
::(nh4)3aso4::(NH₄)₃AsO₄
::(nh4)3p::(NH₄)₃P
::(nh4)3as::(NH₄)₃As
::(nh4)2se::(NH₄)₂Se
::(nh4)2te::(NH₄)₂Te
::^+!::⁺
::^2+!::²⁺
::^3+!::³⁺
::^4+!::⁴⁺
::^-!::⁻
::^-1!::⁻¹
::^-2!::⁻²
::^-3!::⁻³
::^-4!::⁻⁴
::^-5!::⁻⁵
::^-6!::⁻⁶
::^-7!::⁻⁷
::^-8!::⁻⁸
::^-9!::⁻⁹
::^-10!::⁻¹⁰
::^-11!::⁻¹¹
::^-12!::⁻¹²
::^-13!::⁻¹³
::^-14!::⁻¹⁴
::^-15!::⁻¹⁵
::^-16!::⁻¹⁶
::^-17!::⁻¹⁷
::^-18!::⁻¹⁸
::^-19!::⁻¹⁹
::^-20!::⁻²⁰
::^-21!::⁻²¹
::^-22!::⁻²²
::^-23!::⁻²³
::^-24!::⁻²⁴
::^-25!::⁻²⁵
::^-26!::⁻²⁶
::^-27!::⁻²⁷
::^-28!::⁻²⁸
::^-29!::⁻²⁹
::^-30!::⁻³⁰
::^2-!::²⁻
::^3-!::³⁻
::^0!::⁰
::^1!::¹
::^2!::²
::^3!::³
::^4!::⁴
::^5!::⁵
::^6!::⁶
::^7!::⁷
::^8!::⁸
::^9!::⁹
::^10!::¹⁰
::^11!::¹¹
::^12!::¹²
::^13!::¹³
::^14!::¹⁴
::^15!::¹⁵
::^16!::¹⁶
::^17!::¹⁷
::^18!::¹⁸
::^19!::¹⁹
::^20!::²⁰
::^21!::²¹
::^22!::²²
::^23!::²³
::^24!::²⁴
::^25!::²⁵
::^26!::²⁶
::^27!::²⁷
::^28!::²⁸
::^29!::²⁹
::^30!::³⁰
::^w!::ʷ
::^e!::ᵉ
::^r!::ʳ
::^t!::ᵗ
::^y!::ʸ
::^u!::ᵘ
::^i!::ⁱ
::^o!::ᵒ
::^p!::ᵖ
::^=!::⁼
::^Δ!::ᐞ
::^a!::ᵃ
::^s!::ˢ
::^d!::ᵈ
::^f!::ᶠ
::^g!::ᵍ
::^h!::ʰ
::^j!::ʲ
::^k!::ᵏ
::^l!::ˡ
::^(!::⁽
::^)!::⁾
::^⋅!::ᣟ
::^z!::ᶻ
::^x!::ˣ
::^c!::ᶜ
::^v!::ᵛ
::^b!::ᵇ
::^n!::ⁿ
::^m!::ᵐ
::_0!::₀
::_1!::₁
::_2!::₂
::_3!::₃
::_4!::₄
::_5!::₅
::_6!::₆
::_7!::₇
::_8!::₈
::_9!::₉
::_10!::₁₀
::_11!::₁₁
::_12!::₁₂
::_13!::₁₃
::_14!::₁₄
::_15!::₁₅
::_16!::₁₆
::_17!::₁₇
::_18!::₁₈
::_19!::₁₉
::_20!::₂₀
::_21!::₂₁
::_22!::₂₂
::_23!::₂₃
::_24!::₂₄
::_25!::₂₅
::_26!::₂₆
::_27!::₂₇
::_28!::₂₈
::_29!::₂₉
::_30!::₃₀
::_e!::ₑ
::_r!::ᵣ
::_t!::ₜ
::_y!::ᵧ
::_u!::ᵤ
::_i!::ᵢ
::_o!::ₒ
::_p!::ₚ
::_=!::₌
::_a!::ₐ
::_s!::ₛ
::_h!::ₕ
::_j!::ⱼ
::_k!::ₖ
::_l!::ₗ
::_(!::₍
::_)!::₎
::_x!::ₓ
::_v!::ᵥ
::_n!::ₙ
::_m!::ₘ
::_+!::₊
::_-!::₋
::~=!::≅
::+-!::±
::<=!::≤
::>=!::≥
::-->::⟶
::<--::⟵
::=>!::⇒
::<=>::⇔
::<->::⇌
::=/=::≠
::tripel#::≡
::c11h24::C₁₁H₂₄
::c12h26::C₁₂H₂₆
::c13h28::C₁₃H₂₈
::c14h30::C₁₄H₃₀
::c15h32::C₁₅H₃₂
::c16h34::C₁₆H₃₄
::c17h36::C₁₇H₃₆
::c18h38::C₁₈H₃₈
::c19h40::C₁₉H₄₀
::c20h42::C₂₀H₄₂
::c21h44::C₂₁H₄₄
::c22h46::C₂₂H₄₆
::c23h48::C₂₃H₄₈
::c24h50::C₂₄H₅₀
::c25h52::C₂₅H₅₂
::c26h54::C₂₆H₅₄
::c27h56::C₂₇H₅₆
::c28h58::C₂₈H₅₈
::c29h60::C₂₉H₆₀
::c30h62::C₃₀H₆₂
::c2h4::C₂H₄
::c7h14::C₇H₁₄
::c8h16::C₈H₁₆
::c9h18::C₉H₁₈
::c10h20::C₁₀H₂₀
::c11h22::C₁₁H₂₂
::c12h24::C₁₂H₂₄
::c13h26::C₁₃H₂₆
::c14h28::C₁₄H₂₈
::c15h30::C₁₅H₃₀
::c16h32::C₁₆H₃₂
::c17h34::C₁₇H₃₄
::c18h36::C₁₈H₃₆
::c19h38::C₁₉H₃₈
::c20h40::C₂₀H₄₀
::c21h42::C₂₁H₄₂
::c22h44::C₂₂H₄₄
::c23h46::C₂₃H₄₆
::c24h48::C₂₄H₄₈
::c25h50::C₂₅H₅₀
::c26h52::C₂₆H₅₂
::pi#::π
::omega#::ω
::ohm#::Ω
::rho#::ρ
::lambda#::λ
::delta#::Δ
::lilledelta#::δ
::epsilon#::ε
::storsigma#::Σ
::sigma#::σ
::alfa#::α
::beta#::β
::xi#::Ξ
::celsius#::C°
::alpha#::α
::eta#::η
::gamma#::γ
::trippel#::≡
::dh!::ΔH°
::ds!::ΔS°
::dg!::ΔG°
::co2e::CO₂e
::ch2::CH₂
::ch3::CH₃
::c!!::c = 299792458 m⋅s⁻¹
::ev!!::qₑ = 1,6021765 ∙ 10⁻¹⁹ C
::na!!::Nₐ = 6,02214076 ∙ 10²³ mol⁻¹
::u!!::u = 1,66053906660 ∙ 10⁻²⁷ kg
::r!!::R = 8,31446261815324 J⋅K⁻¹⋅mol⁻¹
::r2!!::R = 0,0831446261815324 L⋅bar⋅K⁻¹⋅mol⁻¹
::g!!::g = 9,0665 m∙s⁻²
::atm!!::1 atm = 1,01325 bar
::pascal!!::1 Pa = 10⁻⁵ bar
::m3!!::1 m³ = 1000 L
::qe!!::qₑ = 1,6021765 ∙ 10⁻¹⁹ C
::e0!!::ε₀ = 8,85418782 ∙ 10⁻¹² F∙m⁻¹
::vp!!::µ₀ = 4π ∙ 10⁻⁷ N∙A⁻²
::boltz!!::k = 1,380649 ∙ 10⁻²³ J∙K⁻¹
::sbk!!::σ = 5.6704 ∙ 10⁻⁸ W∙m⁻²∙K⁻⁴
::me!!::mₑ = 5,48579909065 ∙ 10⁻⁴ u
::mp!!::mₚ = 1,007276466621 u
::mn!!::mₑ = 1,00866491595 u
::ke!!::kₑ = 8,987742 ∙ 10⁹ N∙m²∙C⁻²
::hr!!::ℏ = 1,054571817 ∙ 10⁻³⁴ J⋅s
::h!!::h = 6,62607 ∙ 10⁻³⁴ J⋅s
::ug!!::G = 6,6743 ∙ 10⁻¹¹ m³⋅kg⁻¹⋅s⁻²
::pi!!::π = 3,141592653
::cm^-1::cm⁻¹
::cm^2::cm²
::cm^3::cm³
::s^-1::s⁻¹
::mol^-1::mol⁻¹
::km^2::km²
::celcius#::°C
::g/cm3::g/cm³
::kg/m3::kg/m³
::min^-1::min⁻¹
::sp2::sp²
::sp3::sp³
::uendelig#::∞
::hnmr::¹H-NMR
::aluminiumchloridvand#::AlCl₃∙6H₂O
::aluminiumnitratvand#::Al(NO₃)₃∙9H₂O
::aluminiumsulfatvand#::Al₂(SO₄)₃∙18H₂O
::antimoniiichlorid#::SbCl₃
::antimonvchlorid#::SbCl₅
::antimoniiihydrid#::SbH₃
::antimoniiioxid#::Sb₂O₃
::antimonvoxid#::Sb₂O₅
::antimoniiichloridoxid#::SbOCl
::antimoniiisulfid#::Sb₂S₃
::antimonvsulfid#::Sb₂S₅
::arseniiichlorid#::AsCl₃
::arseniiihydrid#::AsH₃
::arseniiioxid#::As₂O₃
::arsenvoxid#::As₂O₅
::arseniiisulfid#::As₂S₃
::bariumchloridvand#::BaCl₂∙2H₂O
::bariumhydroxidvand#::Ba(OH)₂∙8H₂O
::berylliumiiion#::Be²⁺
::berylliumnitratvand#::Be(NO₃)₂∙3H₂O
::berylliumsulfatvand#::BeSO₄∙4H₂O
::bismuthiiiion#::Bi³⁺
::bismuthiiichlorid#::BiCl₃
::bismuthivchlorid#::BiCl₄
::bismuthiiihydroxid#::Bi(OH)₃
::bismuthiiinitratvand#::Bi(NO₃)₃∙5H₂O
::bismuthiiioxidchlorid#::BiOCl
::blyiiion#::Pb²⁺
::blyiiethanoatvand#::Pb(CH₃COO)₂∙3H₂O
::blyiiazid#::Pb(N₃)₂
::blyiibromid#::PbBr₂
::blyiichlorid#::PbCl₂
::blyivchlorid#::PbCl₄
::blyiichromat#::PbCrO₄
::blyiihydroxid#::Pb(OH)₂
::blyiiiodid#::PbI₂
::blyiinitrat#::Pb(NO₃)₂
::blyiioxid#::PbO
::blyivoxid#::PbO₂
::blyii,ivoxid#::Pb₃O₄
::blyiisulfid#::PbS
::blyiisulfat#::PbSO₄
::cadmiumiiion#::Cd²⁺
::cadmiumbromidvand#::CdBr₂∙4H₂O
::cadmiumchloridvand#::CdCl₂∙2H₂O
::cadmiumnitratvand#::Cd(NO₃)₂∙2H₂O
::cadmiumsulfatvand#::CdSO₄∙3/8H₂O
::calciumethanoatvand#::(CH₃COO)₂Ca∙H₂O
::calciumchloridvand#::CaCl₂∙6H₂O
::calciumoxalatvand#::C₂O₄Ca∙H₂O
::calciumsulfatvand#::CaSO₄∙½H₂O
::calciumsulfatvand#::CaSO₄∙2H₂O
::ceriumiiiion#::Ce³⁺
::ceriumivion#::Ce⁴⁺
::ceriumiiichlorid#::CeCl₃
::ceriumiiinitratvand#::Ce(NO₃)₃∙6H₂O
::ceriumiiioxid#::Ce₂O₃
::ceriumiiisulfat#::Ce₂(SO₄)₃
::ceriumivsulfat#::Ce(SO₄)₂
::chromiiion#::Cr²⁺
::chromiiiion#::Cr³⁺
::chromiichlorid#::CrCl₂
::chromiiichlorid#::CrCl₃
::chromiiichloridvand#::CrCl₃∙6H₂O
::chromiihydroxid#::Cr(OH)₂
::chromiioxid#::CrO
::chromiiioxid#::Cr₂O₃
::chromivoxid#::CrO₂
::chromvioxid#::CrO₃
::chromvidichloriddioxid#::CrO₂Cl₂
::chromiisulfatvand#::CrSO₄∙7H₂O
::chromiiisulfat#::Cr₂(SO₄)₃
::chromiiisulfatvand#::Cr₂(SO₄)₃∙18H₂O
::cobaltiiion#::Co²⁺
::cobaltiiiion#::Co³⁺
::cobaltiicarbonat#::CoCO₃
::cobaltiichlorid#::CoCl₂
::cobaltiichloridvand#::CoCl₂∙2H₂O
::cobaltiichloridvand#::CoCl₂∙6H₂O
::cobaltiiichlorid#::CoCl₃
::cobaltiihydroxid#::Co(OH)₂
::cobaltiinitratvand#::Co(NO₃)₂∙6H₂O
::cobaltiioxid#::CoO
::cobaltiiioxid#::Co₂O₃
::cobaltii,iiioxid#::Co₃O₄
::cobaltiisulfat#::CoSO₄
::cobaltiisulfatvand#::CoSO₄∙7H₂O
::guldichlorid#::AuCl
::guldiiichlorid#::AuCl₃
::jerniiion#::Fe²⁺
::jerniiiion#::Fe³⁺
::jerniicarbonat#::FeCO₃
::jerniichlorid#::FeCl₂
::jerniichloridvand#::FeCl₂∙2H₂O
::jerniichloridvand#::FeCl₂∙4H₂O
::jerniiichlorid#::FeCl₃
::jerniiichloridvand#::FeCl₃∙6H₂O
::jerniidisulfid#::FeS₂
::jerniiinitratvand#::Fe(NO₃)₃∙9H₂O
::jerniioxid#::FeO
::jerniiioxid#::Fe₂O₃
::jernii,iiioxid#::Fe₃O₄
::jerniiiphosphatvand#::FePO₄∙2H₂O
::jerniisulfid#::FeS
::jerniiisulfid#::Fe₂S₃
::jerniisulfatvand#::FeSO₄∙7H₂O
::jerniiisulfat#::Fe₂(SO₄)₃
::kaliumaluminiumsulfatvand#::KAl(SO₄)₂∙12H₂O
::kaliumantimonatvand#::KSb(OH)₆∙½H₂O
::kaliumcarbonatvand#::K₂CO₃∙2H₂O
::kaliumchromiiisulfatvand#::KCr(SO₄)₂∙12H₂O
::kaliumhexacyanoferratiii#::K₃Fe(CN)₆
::kaliumnatriumtartratvand#::KNaC₄H₄O₆∙4H₂O
::kobberiion#::Cu⁺
::kobberiiion#::Cu²⁺
::kobberiiethanoatvand#::(CH₃COO)₂Cu∙H₂O
::kobberichlorid#::CuCl
::kobberiichlorid#::CuCl₂
::kobberiichloridvand#::CuCl₂∙2H₂O
::kobberiihydroxid#::Cu(OH)₂
::kobberiiodid#::CuI
::kobberiinitratvand#::Cu(NO₃)₂∙3H₂O
::kobberioxid#::Cu₂O
::kobberiioxid#::CuO
::kobberisulfat#::Cu₂SO₄
::kobberiisulfat#::CuSO₄
::kobberiisulfatvand#::CuSO₄∙5H₂O
::kobberisulfid#::Cu₂S
::kobberiisulfid#::CuS
::kviksølviiion#::Hg²⁺
::kviksølviibromid#::HgBr₂
::kviksølviichlorid#::HgCl₂
::kviksølviiiodid#::HgI₂
::dikviksølvnitratvand#::Hg₂(NO₃)₂∙2H₂O
::kviksølviinitratvand#::Hg(NO₃)₂∙½H₂O
::kviksølviioxid#::HgO
::kviksølviisulfid#::HgS
::lithiumsulfatvand#::Li₂SO₄∙H₂O
::dihydroxocarbonatvand#::Mg₂(OH)₂CO₃∙3H₂O
::magnesiumchloridvand#::MgCl₂∙6H₂O
::magnesiumnitratvand#::Mg(NO₃)₂∙6H₂O
::magnesiumperchloratvand#::Mg(ClO₄)₂∙6H₂O
::magnesiumsulfatvand#::MgSO₄∙7H₂O
::manganiiion#::Mn²⁺
::manganiiiion#::Mn³⁺
::manganiicarbonat#::MnCO₃
::manganiichloridvand#::MnCl₂∙4H₂O
::manganiiioxidhydroxid#::MnO(OH)
::manganiihydroxid#::Mn(OH)₂
::manganiidimanganiiioxid#::Mn₃O₄
::manganiioxid#::MnO
::manganiiioxid#::Mn₂O₃
::manganivoxid#::MnO₂
::manganiisulfat#::MnSO₄
::manganiisulfatvand#::MnSO₄∙7H₂O
::manganiisulfid#::MnS
::pentacarbonylmangandimer#::Mn₂(CO)₁₀
::molybdæniiihydroxid#::Mo(OH)₃
::molybdænivoxid#::MoO₂
::molybdænvioxid#::MoO₃
::molybdænsyrevand#::H₂MoO₄∙H₂O
::natriumethanoatvand#::CH₃COONa∙3H₂O
::natriumarsenatvand#::Na₃AsO₄∙12H₂O
::natriumtetraboratvand#::Na₂B₄O₇∙10H₂O
::natriumbromidvand#::NaBr∙2H₂O
::natriumcarbonatvand#::Na₂CO₃∙10H₂O
::natriumdichromatvand#::Na₂Cr₂O₇∙2H₂O
::natriumdithionatvand#::Na₂S₂O₆∙2H₂O
::natriumdithionitvand#::Na₂S₂O₄∙2H₂O
::natriumhydrogenoxalatvand#::HOOC-COONa∙H₂O
::natriumhypochloritvand#::NaClO∙2½H₂O
::natriumiodidvand#::NaI∙2H₂O
::natriumparamolybdatvand#::Na₆Mo₇O₂₄∙22H₂O
::natriumperboratvand#::NaBO₂∙H₂O₂∙3H₂O
::natriumphosphatvand#::Na₃PO₄∙12H₂O
::natriumsulfatvand#::Na₂SO₄∙10H₂O
::natriumsulfitvand#::Na₂SO₃∙7H₂O
::natriumthiosulfatvand#::Na₂S₂O₃∙5H₂O
::natriumtrioxophosphatvand#::Na₃(PO₃)₃∙6H₂O
::natriumwolframatvand#::W₂O₄∙2H₂O
::nikkeliiionion#::Ni²⁺
::nikkeliichlorid#::NiCl₂
::nikkeliichloridvand#::NiCl₂∙6H₂O
::nikkeliihydroxid#::Ni(OH)₂
::nikkeliinitratvand#::Ni(NO₃)₂∙6H₂O
::nikkeliioxid#::NiO
::nikkeliisulfat#::NiSO4
::nikkeliisulfatvand#::NiSO4∙6H₂O
::nikkeliidimethylglyoxim#::Ni(C4H₇N₂O₂)₂
::ammoniumcarbonatvand#::(NH₄)₂CO₃∙H₂O
::ammoniumjerniisulfatvand#::(NH₄)₂Fe(SO₄)₂∙6H₂O
::ammoniumjerniiisulfatvand#::NH₄Fe(SO₄)₂∙12H₂O
::phosphorpentahydriddimer#::P₄O₁₀
::platiniiion#::Pt₂²⁺
::platiniichlorid#::PtCl₂
::rubidiumiion#::Rb⁺
::strontiumiiion#::Sr²⁺
::strontiumchloridvand#::SrCl₂∙2H₂O
::strontiumhydroxidvand#::Sr(OH)₂∙8H₂O
::strontiumnitratvand#::Sr(NO₃)₂∙4H₂O
::sølvioxid#::Ag₂O
::sølviioxid#::AgO
::thoriumivion#::Th⁴⁺
::thorivnitrat#::Th(NO₃)₄
::thorivnitratvand#::Th(NO₃)₅∙5H₂O
::thorivnitratvand#::Th(NO₃)₄∙12H₂O
::thorivoxid#::ThO₂
::tiniiion#::Sn²⁺
::tinivion#::Sn⁴⁺
::tiniichloridvand#::SnCl₂∙2H₂O
::tinivchlorid#::SnCl₄
::tinivhydrid#::SnH₄
::tiniihydroxid#::Sn(OH)₂
::tiniinitratvand#::Sn(NO₃)₂∙20H₂O
::tiniioxid#::SnO
::tinivoxid#::SnO₂
::tiniisulfat#::SnSO₄
::tiniisulfid#::SnS
::tinivsulfid#::SnS₂
::titaniichlorid#::TiCl₂
::titaniiichlorid#::TiCl₃
::titanivchlorid#::TiCl₄
::titanivoxid#::TiO₂
::uraniiiion#::U³⁺
::uranivion#::U⁴⁺
::uranyliiion#::UO₂²⁺
::uranivdiuranvioxid#::U₃O₈
::uranivoxid#::UO₂
::uranvioxid#::UO₃
::uranylnitratvand#::UO₂(NO₃)₂∙6H₂O
::uranylsulfatvand#::UO₂(SO₄)∙3H₂O
::vanadiumiiioxid#::V₂O₃
::vanadiumvoxid#::V₂O₅
::vanadiumiiisulfat#::V₂(SO₄)₃
::vanadiumivoxysulfat#::VOSO₄
::wolframvioxid#::WO₃
::zinknitratvand#::Zn(NO₃)₂∙6H₂O
::zinksulfatvand#::ZnSO₄∙7H₂O
::zirkoniumivchlorid#::ZrCl₄
::zirkoniumivnitratvand#::Zr(NO₃)₄∙5H₂O
::zirkoniumivoxid#::ZrO₂
::zirkonylchloridvand#::ZrOCl₂∙8H₂O
::r,smethylhexan#::CH₃CH₂CH(CH₃)(CH₂)₂CH₃
::zbuten#::CH₃CH=CHCH₃
::ebuten#::CH₃CH=CHCH₃
::methylethylbenzen#::C₆H₅CH(CH₃)₂
::z,dichlorethen#::CHCl=CHCl
::e,dichlorethen#::CHCl=CHCl
::z,dibromethen#::CHBr=CHBr
::e,dibromethen#::CHBr=CHBr
::ethylmethylether#::CH₃OCH₂CH₃
::bishydroxyethylether#::(HOCH₂CH₂)₂O
::pyridylethanon#::C₅H₄NCOCH₃
::ebutendisyre#::HOOCCH=CHCOOH
::hydrogenebutendioat#::HOOCCH=CHCOO⁻
::ebutendioat#::⁻OOCCH=CHCOO⁻
::zbutendisyre#::HOOCCH=CHCOOH
::r,r,dihydroxybutandisyre#::HOOCCH₂COCOOH
::s,s,dihydroxybutandisyre#::HOOCCH₂COCOOH
::r,s,dihydroxybutandisyre#::HOOCCH₂COCOOH
::z,z,zoctadeca,,triensyre#::C₁₈H₃₀O₂
::z,zoctadeca,diensyre#::C₁₈H₃₂O₂
::zoctadecensyre#::CH₃(CH₂)₇CH=CH(CH₂)₇COOH
::eoctadecensyre#::CH₃(CH₂)₇CH=CH(CH₂)₇COOH
::zdocosensyre#::CH₃(CH₂)₇CH=CH(CH₂)₁₁COOH
::methylethylethanoat#::CH₃COOCH(CH₃)₂
::methylpropylethanoat#::CH₃COOCH(CH₃)CH₂CH₃
::bischlorethylsulfid#::(CICH₂CH₂)₂S
::chromiinitrat#::Cr(NO₃)₃
::kobberiinitrat#::Cu(NO₃)₂
::kobberiiinitratvand#::Cu(NO₃)₂∙6H₂O
::jerniihydroxid#::Fe(OH)₂
::manganiinitrat#::Mn(NO₃)₂
::chromiinitrat#::Cr(NO₃)₂
::jerniinitrit#::Fe(NO₂)₂
::jerniiinitrit#::Fe(NO₃)₂
::jerniisulfit#::FeSO₃
::jerniisulfat#::FeSO₄
::jerniiinitrit#::Fe(NO₂)₃
::jerniiinitrat#::Fe(NO₃)₃
::cobaltiiinitrit#::Co(NO₂)₃
::nikkeliinitrat#::Ni(NO₃)₂
::kobberiinitrat#::CuNO₃
::kobberiphosphat#::Cu₃PO₄
::kobberiiiodid#::CuI₂
::guldiiinitrat#::Au(NO₃)₃
::kviksølviinitrat#::Hg(NO₃)₂
::blyivnitrat#::Pb(NO₃)₄
::thiocyanatojerniiiion#::FeSCN²⁺
::kobberiibromid#::CuBr₂
::kobberiiflourid#::CuF₂
::jerniiiodid#::FeI₂
::jerniiiiodid#::FeI₃
::jerniinitrid#::Fe₃N₂
::jerniiphosphid#::Fe₃P₂
::jerniiiflourid#::FeF₃
::kobberiicarbonat#::CuCO₃
::kobberiisulfit#::CuSO₃
::kobberiinitrid#::Cu₃N₂
::kobberiiphosphid#::Cu₃P₂
::blyivcarbonat#::Pb(CO₃)₂
::blyivsulfid#::PbS₂
::blyiviodid#::PbI₄
::tetraaminkobberiiion#::Cu(NH₃)₄²⁺
::diamminsølviion#::Ag(NH₃)₂⁺
::hexahydratjerniiiion#::Fe(H₂O)₆³⁺
::tetrachloridkobberiiion#::CuCl₄²⁻
::jerniiihydroxid#::Fe(OH)₃
::aluminiumx#::aluminum
::aluminiumionx#::aluminum(III) ion
::aluminiumbromidx#::aluminum tribromide
::aluminiumcarbidx#::aluminum carbide
::aluminiumchloridx#::aluminum chloride
::aluminiumfluoridx#::aluminum fluoride
::aluminiumhydroxidx#::aluminum hydroxide
::aluminiumoxidx#::aluminum oxide
::aluminiumphosphatx#::aluminum phosphate
::aluminiumsulfatx#::aluminum sulfate
::antimonx#::gray antimony
::antimon(iii)chloridx#::antimony(III) chloride
::antimon(v)chloridx#::antimony pentachloride
::antimon(iii)hydridx#::stibine
::antimon(iii)oxidx#::antimony trioxide
::antimon(v)oxidx#::antimony pentoxide
::antimon(iii)sulfidx#::antimony(III) sulfide
::antimon(v)sulfidx#::antimony(V) sulfide
::antimonsyrex#::arsenic acid, solid
::argonx#::argon
::arsenx#::gray arsenic
::tetraarsenx#::yellow arsenic
::arsen(iii)chloridx#::arsenic trichloride
::arsen(iii)hydridx#::arsine
::arsen(iii)oxidx#::arsenic trioxide
::arsen(v)oxidx#::arsenic pentoxide
::arsen(iii)sulfidx#::arsenic trisulfide
::arsensyrex#::arsenic acid, solid
::arsenatx#::arsenate
::bariumx#::barium
::bariumionx#::barium(II) ion
::bariumbromidx#::barium bromide
::bariumcarbonatx#::barium carbonate
::bariumchloridx#::barium chloride
::bariumchromatx#::barium chromate
::bariumhydridx#::barium hydride
::bariumhydroxidx#::barium hydroxide
::bariumnitratx#::barium nitrate
::bariumoxidx#::barium oxide
::bariumperoxidx#::barium peroxide
::bariumsulfatx#::barium sulfate
::berylliumx#::beryllium
::beryllium(ii)ionx#::berylium(II) ion
::berylliumchloridx#::beryllium chloride
::berylliumoxidx#::beryllium oxide
::bismuthx#::bismuth
::bismuth(iii)chloridx#::bismuth chloride
::bismuth(iv)chloridx#::bismuth chloride
::blyx#::lead
::bly(ii)ionx#::lead(II) ion
::bly(ii)azidx#::lead(II) azide
::bly(ii)bromidx#::lead(II) bromide
::bly(ii)chloridx#::lead(II) chloride
::bly(iv)chloridx#::lead tetrachloride
::bly(ii)chromatx#::lead(II) chromate
::bly(ii)hydroxidx#::lead(II) hydroxide
::bly(ii)iodidx#::lead iodide
::bly(ii)nitratx#::lead(II) nitrate
::bly(ii)oxidx#::lead monoxide
::bly(iv)oxidx#::lead dioxide
::bly(ii,iv)oxidx#::lead(II,IV) oxide
::bly(ii)sulfidx#::lead sulfide
::bly(ii)sulfatx#::lead(II) sulfate
::tetraethylplumbanx#::lead tetraethyl
::tetramethylplumbanx#::tetramethyllead
::borx#::boron
::bornitridx#::boron nitride
::dibortrioxidx#::boron oxide
::borsyrex#::boric acid
::dihydrogenboratx#::dihydrogen borate
::abortrifluoridx#::boron trifluoride
::diboranx#::diborane
::pentaboranx#::pentaborane(9)
::bromx#::bromine
::dibromx#::bromine
::bromatx#::bromate
::bromidx#::bromide
::hydrogenbromidx#::hydrogen bromide
::cadmiumx#::cadmium
::cadmiumbromidx#::cadmium bromide
::cadmiumchloridx#::cadmium chloride
::cadmiumhydroxidx#::cadmium hydroxide
::cadmiumiodidx#::cadmium iodide
::cadmiumoxidx#::chlordiazepoxide
::cadmiumsulfatx#::cadmium sulfate
::cadmiumsulfidx#::cadmium sulfide
::calciumx#::calcium
::calciumionx#::calcium(II) ion
::calciumbromidx#::calcium bromide
::calciumdicarbidx#::calcium carbide
::calcitx#::calcium carbonate
::kalkx#::calcium carbonate
::calciumchloridx#::calcium chloride
::calciumfluoridx#::calcium fluoride
::calciumhydridx#::calcium hydride
::calciumhydroxidx#::calcium hydroxide
::calciumiodidx#::calcium iodide
::calciumnitratx#::calcium nitrate
::calciumnitridx#::calcium nitride
::calciumoxalatx#::calcium oxalate
::calciumoxidx#::calcium oxide
::calciumperoxidx#::calcium peroxide
::calciumphosphatx#::tricalcium diphosphate
::calciumstearatx#::calcium stearate
::calciumsulfatx#::calcium sulfate
::calciumsulfidx#::calcium sulfide
::carbonx#::activated charcoal
::dicarbonx#::carbon dimer
::grafitx#::carbon
::buckminsterfullerenx#::buckminsterfullerene
::carbondioxidx#::carbon dioxide
::kulsyrex#::carbonic acid
::hydrogencarbonatx#::hydrogen carbonate
::carbonatx#::carbonate
::carbondisulfidx#::carbon disulfide
::carbonmonoxidx#::carbon monoxide
::carbonyldichloridx#::phosgene
::carbonylsulfidx#::carbonyl sulfide
::hydrogencyanidx#::hydrogen cyanide
::cyanidx#::cyanide
::cyanatx#::cyanate
::dicyanx#::cyanogen
::thiocyanatx#::thiocyanate
::ceriumx#::cerium
::cerium(iii)chloridx#::cerous chloride
::cerium(iii)oxidx#::cerium(III) oxide
::cerium(iii)sulfatx#::cerium(III) sulfate
::cerium(iv)sulfatx#::ceric sulfate
::chlorx#::chlorine
::dichlorx#::chlorine
::chloridx#::chloride
::chlordioxidx#::chlorine dioxide
::dichloroxidx#::chlorine monoxide
::hydrogenchloridx#::hydrogen chloride
::dichlorheptoxidx#::dichlorine heptoxide
::chlorsyrex#::chloric acid
::chloratx#::chlorate
::chlorsyrlingx#::chlorous acid
::chloritx#::chlorite
::hypochlorsyrlingx#::hypochlorous acid
::hypochloritx#::hypochlorite
::perchlorsyrex#::perchloric acid
::perchloratx#::perchlorate
::chromx#::chromium
::chrom(ii)ionx#::chromium(II) ion
::chrom(iii)ionx#::chromium(III) ion
::chromatx#::chromate
::chromsyrex#::chromic acid
::chrom(ii)chloridx#::chromous chloride
::chrom(iii)chloridx#::chromic chloride
::chrom(ii)oxidx#::chromium monoxide
::chrom(iii)oxidx#::chromium(III) oxide
::chrom(iv)oxidx#::magtrieve™
::chrom(vi)oxidx#::chromium trioxide
::chrom(iii)sulfatx#::chromium sulfate
::hexacarbonylchromx#::chromium(0) carbonyl
::cobaltx#::cobalt
::cobalt(ii)ionx#::cobalt(II) ion
::cobalt(ii)carbonatx#::cobaltous carbonate
::cobalt(ii)chloridx#::cobalt dichloride
::cobalt(iii)chloridx#::cobalt trichloride
::cobalt(ii)hydroxidx#::cobalt(II) hydroxide
::cobalt(ii)oxidx#::cobalt monoxide
::cobalt(iii)oxidx#::cobalt(III) oxide
::cobalt(ii,iii)oxidx#::cobalt(II,III) oxide
::cobalt(ii)sulfatx#::cobalt(II) sulfate
::cæsiumx#::cesium
::cæsiumbromidx#::cesium bromide
::cæsiumchloridx#::cesium chloride
::cæsiumfluoridx#::sargramostim
::cæsiumhydridx#::caesium hydride
::cæsiumhydroxidx#::cesium hydroxide
::cæsiumiodidx#::cesium iodide
::cæsiumoxidx#::cesium oxide
::fluorx#::fluorine
::difluorx#::fluorine
::fluoridx#::fluoride
::difluoroxidx#::oxygen difluoride
::hydrogenfluoridx#::hydrogen fluoride
::germaniumx#::germanium
::germaniumhydridx#::germane
::digermanx#::digermane
::germaniumoxidx#::germanium dioxide
::guldx#::gold
::guld(i)chloridx#::gold(I) chloride
::guld(iii)chloridx#::gold(III) chloride
::heliumx#::helium
::hydrogenx#::hydrogen
::dihydrogenx#::hydrogen
::hydronx#::hydrogen(I) ion
::hydridx#::hydride
::deuteriumx#::heavy water
::oxoniumx#::hydronium ion
::iodx#::iodine
::diiodx#::iodine
::iodidx#::iodide
::hydrogeniodidx#::hydrogen iodide
::iodsyrex#::iodic acid
::iodatx#::iodate
::iodazidx#::iodine azide
::iodbromidx#::iodine bromide
::iodchloridx#::iodine monochloride
::iodtrichloridx#::iodine trichloride
::diiodpentoxidx#::iodopentoxide
::jernx#::iron
::jern(ii)ionx#::iron(II) ion
::jern(iii)ionx#::iron(III) ion
::jerncarbidx#::iron carbide
::jern(ii)carbonatx#::iron(II) carbonate
::jern(ii)chloridx#::iron(II) chloride
::jern(iii)chloridx#::iron(III) chloride
::jern(ii)disulfidx#::pyrite
::jern(ii)oxidx#::iron(II) oxide
::wustitx#::wüstite
::jern(iii)oxidx#::iron(III) oxide
::jern(ii,iii)oxidx#::iron(II,III) oxide
::jern(ii)sulfidx#::ferrous sulfide
::jern(iii)sulfidx#::iron sulfide
::jern(iii)sulfatx#::ferric sulfate
::pentacarbonyljernx#::iron(0) pentacarbonyl
::ferrocenx#::ferrocene
::kaliumx#::potassium
::kaliumionx#::potassium(I) ion
::kaliumbromatx#::potassium bromate
::kaliumbromidx#::potassium bromide
::kaliumcarbonatx#::pearl ash
::kaliumchloratx#::potassium chlorate
::kaliumchloridx#::potassium chloride
::kaliumchromatx#::potassium chromate
::kaliumcyanidx#::potassium cyanide
::kaliumcyanatx#::potassium cyanate
::kaliumdichromatx#::potassium dichromate
::kaliumfluoridx#::potassium fluoride
::kaliumhydridx#::potassium hydride
::kaliumhydroxidx#::potassium hydroxide
::kaliumiodatx#::potassium iodate
::kaliumiodidx#::potassium iodide
::kaliummanganatx#::potassium manganate
::kaliumnitratx#::potassium nitrate
::kaliumnitritx#::potassium nitrite
::kaliumoxidx#::potassium oxide
::kaliumperchloratx#::potassium perchlorate
::kaliumperiodatx#::potassium periodate
::kaliumpermanganatx#::potassium permanganate
::kaliumperoxidx#::potassium peroxide
::kaliumperoxodisulfatx#::potassium persulfate
::kaliumdisulfatx#::potassium pyrosulfate
::kaliumdioxidx#::potassium superoxide
::kaliumsulfatx#::potassium sulfate
::kaliumsulfidx#::potassium polysulfide
::kaliumthiocyanatx#::potassium thiocyanate
::kobberx#::copper
::kobber(i)ionx#::copper(I) ion
::kobber(ii)ionx#::copper(II) ion
::kobber(i)chloridx#::cuprous chloride
::kobber(ii)chloridx#::copper(II) chloride
::kobber(ii)hydroxidx#::copper hydroxide
::kobber(i)iodidx#::cuprous iodide
::kobber(i)oxidx#::copper(I) oxide
::kobber(ii)oxidx#::cupric oxide
::kobber(i)sulfatx#::cuprous sulfate
::kobber(ii)sulfatx#::copper(II) sulfate
::kobber(i)sulfidx#::copper(I) sulfide
::kobber(ii)sulfidx#::cupric sulfide
::kryptonx#::krypton
::kryptondifluoridx#::krypton difluoride
::kviksølvx#::mercury
::dikviksølvx#::mercury(+1) ion
::kviksølv(ii)ionx#::mercury(II) ion
::dikviksølvbromidx#::mercury(I) bromide
::kviksølv(ii)bromidx#::mercuric bromide
::dikviksølvchloridx#::mercury(I) chloride
::kviksølv(ii)chloridx#::mercuric chloride
::dikviksølviodidx#::mercury(I) iodide
::kviksølv(ii)iodidx#::mercury(II) iodide
::dikviksølvoxidx#::mercury(I) oxide
::kviksølv(ii)oxidx#::mercuric oxide
::kviksølv(ii)sulfidx#::mercury(II) sulfide
::dikviksølvsulfatx#::mercury(I) sulfate
::lithiumx#::lithium
::lithiumionx#::lithium(I) ion
::lithiumborhydridx#::lithium borohydride
::lithiumbromidx#::lithium bromide
::lithiumcarbonatx#::lithium carbonate
::lithiumchloridx#::lithium chloride
::lithiumfluoridx#::lithium fluoride
::lithiumhydridx#::lithium hydride
::lithiumhydroxidx#::lithium hydroxide
::lithiumiodidx#::lithium iodide
::lithiumoxidx#::lithium oxide
::magnesiumx#::magnesium
::magnesiumionx#::magnesium(II) ion
::magnesiumbromidx#::magnesium bromide
::magnesiumcarbonatx#::magnesium carbonate
::magnesiumchloridx#::magnesium chloride
::magnesiumhydroxidx#::magnesium hydroxide
::magnesiumiodidx#::magnesium iodide
::magnesiumnitratx#::magnesium nitrate
::magnesiumnitridx#::magnesium nitride
::magnesiumoxidx#::magnesium oxide
::magnesiumperchloratx#::magnesium perchlorate
::magnesiumsulfatx#::magnesium sulfate
::magnesiumsulfidx#::magnesium sulfide
::manganx#::manganese
::mangan(ii)ionx#::manganese(II) ion
::mangan(iii)ionx#::manganese(III) ion
::permanganatx#::permanganate
::mangan(ii)carbonatx#::manganese carbonate
::mangan(ii)hydroxidx#::manganese hydroxide
::mangan(ii)oxidx#::manganese monoxide
::mangan(iii)oxidx#::manganese(III) oxide
::mangan(iv)oxidx#::manganese dioxide
::mangan(ii)sulfatx#::manganese(II) sulfate
::mangan(ii)sulfidx#::manganese sulfide
::molybdænx#::molybdenum
::molybdæn(iv)oxidx#::molybdenum dioxide
::molybdæn(vi)oxidx#::molybdenum trioxide
::hexacarbonylmolybdænx#::molybdenum(0) hexacarbonyl
::natriumx#::sodium
::natriumionx#::sodium(I) ion
::natriumaminx#::sodium amide
::natriumarsenitx#::sodium arsenite
::natriumazidx#::sodium azide
::natriumbenzoatx#::sodium benzoate
::natriumtetraboratx#::sodium tetraborate
::natriumborhydridx#::sodium borohydride
::natriumbromidx#::sodium bromide
::natriumbromatx#::sodium bromate
::natriumcarbonatx#::soda ash
::natriumchloratx#::sodium chlorate
::natriumchloridx#::sodium chloride
::natriumchloritx#::sodium chlorite
::natriumethanolatx#::sodium ethylate
::natriumfluoridx#::sodium fluoride
::natriumformiatx#::sodium formate
::natriumhydridx#::sodium hydride
::natriumhydroxidx#::sodium hydroxide
::natriumiodatx#::sodium iodate
::natriumiodidx#::sodium iodide
::natriummethanolatx#::sodium methoxide
::natriumnitratx#::sodium nitrate
::natriumnitridx#::sodium nitride
::natriumnitritx#::sodium nitrite
::natriumoleatx#::sodium oleate
::natriumoxalatx#::sodium oxalate
::natriumoxidx#::sodium oxide
::natriumperchloratx#::sodium perchlorate
::natriumperoxidx#::sodium peroxide
::natriumdisulfitx#::sodium metabisulfite
::natriumsilikatx#::sodium metasilicate
::natriumstearatx#::sodium stearate
::natriumsulfatx#::sodium sulfate
::natriumsulfidx#::sodium sulfide
::natriumsulfitx#::sodium sulfite
::natriumthiosulfatx#::sodium hyposulfite
::natriumtriphosphatx#::polygon
::natriumedtax#::(ethylenedinitrilo)tetraacetic acid disodium salt
::neonx#::neon
::nikkelx#::nickel
::nikkel(ii)ionionx#::nickel(II) ion
::nikkelbromidx#::nickel bromide
::nikkel(ii)chloridx#::nickel(II) chloride
::nikkel(ii)hydroxidx#::nickel(II) hydroxide
::nikkel(ii)oxidx#::nickel monoxide
::nikkel(ii)sulfatx#::nickel(II) sulfate
::nikkelsulfidx#::nickel(II) sulfide
::tetracarbonylnikkelx#::nickel carbonyl
::nitrogenx#::nitrogen
::dinitrogenx#::nitrogen
::nitrogendioxidx#::nitrogen dioxide
::nitrogenoxidx#::nitric oxide
::dinitrogenoxidx#::nitrous oxide
::dinitrogentetraoxidx#::dinitrogen tetroxide
::dinitrogentrioxidx#::nitrogen trioxide
::dinitrogenpentaoxidx#::dinitrogen pentoxide
::ammoniakx#::ammonia
::ammoniumx#::ammonium ion
::ammoniumchloridx#::ammonium chloride
::ammoniumchromatx#::ammonium chromate
::ammoniumdichromatx#::ammonium bichromate
::ammoniummolybdatx#::ammonium molybdate
::ammoniumnitratx#::ammonium nitrate
::ammoniumnitritx#::ammonium nitrite
::ammoniumsulfatx#::ammonium sulfate
::ammoniumthiocyanatx#::ammonium thiocyanate
::ammoniumvanadatx#::ammonium metavanadate
::hydrazinx#::diazane
::hydrazinchloridx#::hydrazine monohydrochloride
::hydrogenazidx#::hydrazoic acid
::hydroxylaminx#::hydroxylamine
::nitratx#::nitrate
::nitritx#::nitrite
::salpetersyrex#::nitric acid
::salpetersyrlingx#::nitrous acid
::oxygenx#::oxygen
::dioxygenx#::oxygen
::trioxygenx#::ozone
::oxidx#::oxide
::vandx#::water
::tungtvandx#::heavy water
::peroxidx#::peroxide
::hydrogenperoxidx#::hydrogen peroxide
::hydroxidx#::hydroxide
::phosphorx#::white phosphorus
::phosphorx#::red phosphorus
::tetraphosphorx#::white phosphorus
::phosphortrihydridx#::phosphine
::phosphorpentachloridx#::phosphorus pentachloride
::phosphorsyrex#::phosphoric acid
::dihydrogenphosphatx#::dihydrogen phosphate
::hydrogenphosphatx#::hydrogen phosphate
::phosphatx#::phosphate
::phosphorsyrlingx#::phosphorous acid
::metaphosphorsyrex#::metaphosphoric acid
::phosphortribromidx#::phosphorus tribromide
::phosphortrichloridx#::phosphorus trichloride
::platinx#::platinum
::platin(ii)chloridx#::platinum(II) chloride
::rubidiumx#::rubidium
::rubiddiumchloridx#::rubidium chloride
::selenx#::gray selenium
::selenhydridx#::hydrogen selenide
::selendioxidx#::selenium dioxide
::selensyrex#::selenic acid
::siliciumx#::silicon
::siliciumcarbidx#::silicon carbide
::siliciumdioxidx#::silicon dioxide
::siliciumhydridx#::silane
::siliciumtetrachloridx#::silicon tetrachloride
::siliciumtetrafluoridx#::silicon tetrafluoride
::strontiumx#::strontium
::strontium(ii)ionx#::strontium(II) ion
::strontiumcarbonatx#::strontium carbonate
::strontiumchloridx#::strontium chloride
::strontiumchromatx#::strontium chromate
::strontiumhydroxidx#::strontium hydroxide
::strontiumnitratx#::strontium nitrate
::strontiumoxidx#::strontium oxide
::strontiumsulfatx#::strontium sulfate
::svovlx#::mixed sulfur
::svovlrhombiskx#::rhombic sulfur
::svovlmonoklinx#::mixed sulfur
::disvovlx#::disulfur
::octasvovlx#::rhombic sulfur
::svovldioxidx#::sulfur dioxide
::svovlsyrlingx#::sulfurous acid
::hydrogensulfitx#::hydrogensulfite
::sulfitx#::sulfite
::dihydrogensulfidx#::hydrogen sulfide
::hydrogensulfidx#::hydrogen sulfite
::sulfidx#::sulfide
::peroxodisvovlsyrex#::peroxysulfuric acid
::svovlsyrex#::sulfuric acid
::hydrogensulfatx#::hydrogen sulfate
::sulfatx#::sulfate
::sulfurylchloridx#::sulfuryl chloride
::svovltrioxidx#::sulfur trioxide
::thionylchloridx#::thionyl chloride
::sulfamidsyrex#::sulfamic acid
::thiosulfatx#::thiosulfate
::chlorsulfonsyrex#::chlorosulfonic acid
::svovlhexafluoridx#::sulfur hexafluoride
::sølvx#::silver
::sølvionx#::silver(I) ion
::sølvbromatx#::silver bromate
::sølvbromidx#::silver bromide
::sølvcarbonatx#::silver(I) carbonate
::sølvchloridx#::silver chloride
::sølvchromatx#::silver(I) chromate
::sølvcyanidx#::silver cyanide
::sølvfluoridx#::silver fluoride
::sølviodatx#::silver iodate
::sølviodidx#::silver(I) iodide
::sølvnitratx#::silver nitrate
::sølvphosphatx#::silver phosphate
::sølv(i)oxidx#::silver(I) oxide
::sølv(ii)oxidx#::silver(II) oxide
::sølvsulfatx#::silver sulfate
::sølvsulfidx#::silver(I) sulfide
::thoriumx#::thorium
::thor(iv)nitratx#::thorium nitrate
::thor(iv)oxidx#::thorium(IV) oxide
::tinx#::white tin
::tin(ii)ionx#::tin(II) ion
::tin(iv)ionx#::tin(IV) ion
::tin(iv)chloridx#::stannic chloride
::tin(iv)hydridx#::stannane
::tin(ii)hydroxidx#::tin(II) hydroxide
::tin(ii)oxidx#::(s)-4-nitrostyrene oxide
::tin(iv)oxidx#::stannic oxide
::tin(ii)sulfatx#::stannous sulfate
::tin(ii)sulfidx#::tin(II) sulfide
::tin(iv)sulfidx#::tin(IV) sulfide
::titanx#::titanium
::titancarbidx#::titanium(IV) carbide
::titan(ii)chloridx#::titanium(II) chloride
::titan(iii)chloridx#::titanium trichloride
::titan(iv)chloridx#::titanium tetrachloride
::titan(iv)oxidx#::titanium dioxide
::uranx#::uranium
::uranhexafluoridx#::uranium hexafluoride
::uran(iv)oxidx#::uranium dioxide
::uran(vi)oxidx#::uranium(VI) oxide
::vanadiumx#::vanadium
::vanadium(iii)oxidx#::vanadium(III) oxide
::vanadium(v)oxidx#::vanadium pentoxide
::vanadium(iii)sulfatx#::vanadium(III) sulfate
::hexacarbonylvanadiumx#::vanadium carbonyl
::wolframx#::tungsten
::wolframcarbidx#::tungsten carbide
::wolfram(vi)oxidx#::tungsten trioxide
::wolframhexafluoridx#::tungsten(VI) fluoride
::xenonx#::xenon
::xenontrioxidx#::xenon trioxide
::xenontetraoxidx#::xenon tetroxide
::xenondifluoridx#::xenon difluoride
::xenontetrafluoridx#::xenon tetrafluoride
::xenonhexafluoridx#::xenon hexafluoride
::zinkx#::zinc
::zinkionx#::zinc(II) ion
::zinkbromidx#::zinc bromide
::zinkcarbonatx#::zinc carbonate
::zinkchloridx#::zinc chloride
::zinkhydroxidx#::zinc hydroxide
::zinkiodidx#::zinc iodide
::zinknitrat-vand(1/6)x#::zinc nitrate hexahydrate
::zinkoxidx#::zinc oxide
::zinksulfatx#::zinc sulfate
::zinksulfat-vand(1/7)x#::zinc sulfate heptahydrate
::zinksulfidx#::zinc sulfide
::zirkoniumx#::zirconium
::zirkonium(iv)chloridx#::zirconium tetrachloride
::zirkonium(iv)oxidx#::zirconium(IV) oxide
::methanx#::methane
::ethanx#::ethane
::propanx#::propane
::butanx#::butane
::pentanx#::N-pentane
::hexanx#::N-hexane
::heptanx#::N-heptane
::octanx#::octane
::nonanx#::nonane
::decanx#::decane
::undecanx#::undecane
::dodecanx#::dodecane
::tridecanx#::tridecane
::tetradecanx#::N-tetradecane
::pentadecanx#::pentadecane
::hexadecanx#::N-hexadecane
::heptadecanx#::heptadecane
::octadecanx#::N-octadecane
::nonadecanx#::N-nonadecane
::icosanx#::N-eicosane
::2-methylpropanx#::isobutane
::2-methylbutanx#::isopentane
::2,2-dimethylpropanx#::2,2-dimethylpropane
::2-methylpentanx#::2-methylpentane
::3-methylpentanx#::3-methylpentane
::2,2-dimethylbutanx#::2,2-dimethylbutane
::2,3-dimethylbutanx#::2,3-dimethylbutane
::2-methylhexanx#::2-methylhexane
::(r,s)-3-methylhexanx#::3-methylhexane
::2,2-dimethylpentanx#::2,2-dimethylpentane
::2,3-dimethylpentanx#::2,3-dimethylpentane
::3,3-dimethylpentanx#::3,3-dimethylpentane
::2,4-dimethylpentanx#::2,4-dimethylpentane
::2,2,3-trimethylbutanx#::2,2,3-trimethylbutane
::3-ethylpentanx#::3-ethylpentane
::cyclopropanx#::cyclopropane
::cyclobutanx#::cyclobutane
::cyclopentanx#::cyclopentane
::cyclohexanx#::cyclohexane
::methylcyclohexanx#::methylcyclohexane
::ethenx#::ethylene
::propenx#::propylene
::propadienx#::propadiene
::cyclopropenx#::cyclopropene
::cyclobutenx#::cyclobutene
::buta-1,2-dienx#::1,2-butadiene
::buta-1,3-dienx#::1,3-butadiene
::but-1-enx#::1-butene
::(z)-but-2-enx#::cis-2-butene
::pent-1-enx#::1-pentene
::cyclohexa-1,3-dienx#::1,3-cyclohexadiene
::cyclohexenx#::cyclohexene
::α-pinenx#::alpha-pinene
::carotenx#::beta-carotene
::ethynx#::acetylene
::propynx#::methylacetylene
::but-1-ynx#::1-butyne
::but-2-ynx#::2-butyne
::buta-1,3-diynx#::1,3-butadiyne
::pent-1-ynx#::1-pentyne
::benzenx#::benzene
::naphthalenx#::naphthalene
::anthracenx#::anthracene
::1,2-benzoanthracenx#::benzo(a)anthracene
::benzopyrenx#::benzo[e]pyrene
::methylbenzenx#::toluene
::ethenylbenzenx#::styrene
::1,2-dimethylbenzenx#::1,2-dimethylbenzene
::ethylbenzenx#::ethylbenzene
::biphenylx#::diphenyl
::chlormethanx#::methyl chloride
::chlorethenx#::vinyl chloride
::chlorethanx#::chloroethane
::1-chlorpropanx#::1-chloropropane
::2-chlorpropanx#::isopropyl chloride
::dichlormethanx#::methylene chloride
::1-chlorbutanx#::butyl chloride
::2-chlorbutanx#::sec-butyl chloride
::1,1-dichlorethenx#::1,1-dichloroethylene
::(z)-1,2-dichlorethenx#::cis-1,2-dichloroethylene
::1,1-dichlorethanx#::1,1-dichloroethane
::1,2-dichlorethanx#::ethylene dichloride
::chlorbenzenx#::chlorobenzene
::trichlormethanx#::chloroform
::1,1,2-trichlorethenx#::1,1,2-trichloroethane
::1,1,1-trichlorethanx#::1,1,1-trichloroethane
::1,1,2-trichlorethanx#::1,1,2-trichloroethane
::1,2-dichlorbenzenx#::dichlorobenzene
::tetrachlormethanx#::carbon tetrachloride
::hexachlorethanx#::hexachloroethane
::hexachlorbenzenx#::hexachlorobenzene
::chlordifluormethanx#::chlorodifluoromethane
::tetrafluormethanx#::tetrafluoromethane
::tetrafluorethenx#::tetrafluoroethylene
::dichlorfluormethanx#::dichlorofluoromethane
::chlortrifluormethanx#::chlorotrifluoromethane
::dichlordifluormethanx#::dichlorodifluoromethane
::brommethanx#::bromoform
::bromethanx#::bromoethane
::1-brompropanx#::1-bromopropane
::2-brompropanx#::2-bromopropane
::1-brombutanx#::butyl bromide
::2-brombutanx#::2-bromobutane
::brombenzenx#::bromobenzene
::dibrommethanx#::methylene bromide
::(z)-1,2-dibromethenx#::(Z)-1,2-dibromoethene
::1,1-dibromethanx#::1,1-dibromoethane
::1,2-dibromethanx#::ethylene dibromide
::1,2-dibrombenzenx#::1,2-dibromobenzene
::tribrommethanx#::bromoform
::tetrabrommethanx#::carbon tetrabromide
::iodmethanx#::methyl iodide
::iodethanx#::iodoethane
::1-iodpropanx#::propyl iodide
::2-iodpropanx#::isopropyl iodide
::1-iodbutanx#::1-iodobutane
::2-iodbutanx#::2-iodobutane
::2-iod-2-methylpropanx#::2-iodo-2-methylpropane
::iodbenzenx#::iodobenzene
::diiodmethanx#::methylene iodide
::1,1-diiodethanx#::1,1-dioiodoethane
::1,2-diiodethanx#::1,2-diiodoethane
::triiodmethanx#::iodoform
::tetraiodmethanx#::carbon tetraiodide
::methanaminx#::methylamine
::dimethylaminx#::dimethylamine
::ethanaminx#::ethylamine
::dimethylammoniumx#::dimethylammonium
::trimethylaminx#::trimethylamine
::propan-1-aminx#::N-propylamine
::propan-2-aminx#::2-aminopropane
::ethan-1,2-diaminx#::ethylenediamine
::diethylaminx#::diethylamine
::propan-1,3-diaminx#::1,3-diaminopropane
::pyridinx#::pyridine
::butan-1,4-diaminx#::putrescine
::benzenaminx#::aniline
::triethylaminx#::triethylamine
::2-methylbenzenaminx#::o-toluidine
::n-methyl-benzenaminx#::N-methylaniline
::phenylhydrazinx#::phenylhydrazine
::dabcox#::triethylenediamine
::hexan-1,6-diaminx#::1,6-diaminohexane
::aniliniumchloridx#::aniline hydrochloride
::amphetaminx#::amphetamine
::methamphetaminx#::D-methamphetamine
::nicotinx#::3-(1-methyl-2-pyrrolidinyl)pyridine
::urinsyrex#::uric acid
::diphenylaminx#::diphenylamine
::triphenylaminx#::triphenylamine
::adrenalinx#::L-adrenaline
::benzidinx#::benzidine
::coffeinx#::caffeine
::edtax#::edetic acid
::cocainx#::cocaine
::quininx#::quinine
::creatininx#::creatinine
::creatinx#::creatine
::cytosinx#::cytosine
::uracilx#::uracil
::thyminx#::thymine
::adeninx#::adenine
::adeniniumx#::adenineium
::adeninionx#::adenineione
::guaninx#::guanine
::adenosinx#::adenosine
::ampx#::alpha-adenosine monophosphate
::adpx#::adenosine-5'-diphosphate
::atpx#::adenosine triphosphate
::guanosinx#::guanosine
::cytidinx#::cytidine
::uridinx#::uridine
::coenzymax#::coenzyme A
::nadpx#::NADP+
::methanolx#::methanol
::ethanolx#::ethanol
::prop-2-en-1-olx#::allyl alcohol
::propan-1-olx#::N-propanol
::propan-2-olx#::isopropanol
::2-aminoethanolx#::2-aminoethanol
::ethan-1,2-diolx#::ethylene glycol
::2-methylpropan-1-olx#::isobutyl alcohol
::2-methylpropan-2-olx#::t-butanol
::butan-1-olx#::1-butanol
::butan-2-olx#::sec-butanol
::propan-1,2-diolx#::propylene glycol
::propan-1,3-diolx#::1,3-propylene glycol
::pentan-1-olx#::amyl alcohol
::pentan-2-olx#::2-pentanol
::pentan-3-olx#::diethyl carbinol
::2-methylbutan-1-olx#::2-methyl-1-butanol
::3-methylbutan-1-olx#::isoamyl alcohol
::3-methylbutan-2-olx#::3-methyl-2-butanol
::2-methylbutan-2-olx#::tert-amyl alcohol
::propan-1,2,3-triolx#::glycerol
::cyclohexanolx#::cyclohexanol
::hexan-1-olx#::1-hexanol
::benzylalkoholx#::benzyl alcohol
::phenolx#::phenol
::benzen-1,4-quinonx#::benzoquinone
::2-methylphenolx#::o-cresol
::1,2-dihydroxybenzenx#::catechol
::2-chlorphenolx#::2-chlorophenol
::2-nitrophenolx#::o-nitrophenol
::1-naphtholx#::1-naphthol
::quinhydronx#::quinhydrone
::2,4,6-trinitrophenolx#::picric acid
::ethylenoxidx#::ethylene oxide
::dimethyletherx#::dimethyl ether
::ethyl(methyl)etherx#::ethyl methyl ether
::furanx#::furfuran
::tetrahydrofuranx#::tetrahydrofuran
::diethyletherx#::ethyl ether
::methoxypropanx#::methyl propyl ether
::1,4-dioxanx#::1,4-dioxane
::1,2-dimethoxyethanx#::1,2-dimethoxyethane
::propoxypropanx#::di-n-propyl ether
::methoxybenzenx#::anisole
::ethoxybenzenx#::phenetole
::cumarinx#::coumarin
::diphenyletherx#::diphenyl ether
::myristicinx#::myristicin
::dibenzyletherx#::benzyl ether
::kroneetherx#::18-crown-6
::methanalx#::formaldehyde
::1,3,5-trioxanx#::S-trioxane
::ethanalx#::acetaldehyde
::paraldehydx#::paraldehyde
::ethandialx#::glyoxal
::propanalx#::propionaldehyde
::propenalx#::acrolein
::butanalx#::butyraldehyde
::2-methylpropanalx#::isobutyraldehyde
::pentanalx#::valeraldehyde
::2-methylbutanalx#::2-methylbutyraldehyde
::3-methylbutanalx#::isovaleraldehyde
::2,2-dimethylpropanalx#::pivaldehyde
::benzaldehydx#::benzaldehyde
::kanelaldehydx#::cinnamic aldehyde
::anisaldehydx#::4-methoxybenzaldehyde
::vanillinx#::vanillin
::citralx#::citral
::retinalx#::13-cis-retinal
::ethenonx#::ketene
::propanonx#::acetone
::butanonx#::methyl ethyl ketone
::butan-2,3-dionx#::diacetyl
::pentan-2-onx#::methyl propyl ketone
::pentan-3-onx#::diethyl ketone
::3-methylbutan-2-onx#::3-methyl-2-butanone
::cyclohexanonx#::cyclohexanone
::pentan-2,3-dionx#::2,3-pentanedione
::pentan-2,4-dionx#::acetyl acetone
::heptan-2-onx#::n-amyl methyl ketone
::1-phenylethan-1-onx#::acetophenone
::1-(3-pyridyl)ethanonx#::3-acetylpyridine
::carvonx#::D-carvone
::d-campherx#::D-camphor
::ascorbinsyrex#::ascorbic acid
::ninhydrinx#::ninhydrin
::benzophenonx#::benzophenone
::β-iononenx#::β-ionone
::piperinx#::piperine
::testosteronx#::testosterone
::capsaicinx#::capsaicin
::α-d-arabinosex#::D-arabinose
::d-2-deoxyribosex#::thyminose
::α-l-glucosex#::α-l-glucose
::β-d-glucosex#::D-(+)-glucose
::α-lactosex#::α-lactose
::lactose,monohydratx#::lactose,monohydrate
::α-maltosex#::alpha-maltose
::β-maltosemonohydratx#::β-maltosemonohydrate
::saccharosex#::sucrose
::stivelsex#::stivelse
::methansyrex#::formic acid
::methanoatx#::methanoate
::ethansyrex#::acetic acid
::ethanoatx#::ethanoate
::propensyrex#::acrylic acid
::propansyrex#::propionic acid
::peroxyethansyrex#::peroxyacetic acid
::2-hydroxyethansyrex#::glycolic acid
::2-hydroxyethanoatx#::2-hydroxyethanoate
::fluorethansyrex#::fluoroacetic acid
::2-oxopropansyrex#::pyruvic acid
::2-oxopropanoatx#::pyruvic acid
::butansyrex#::butyric acid
::butanoatx#::butanoate
::2-methylpropansyrex#::isobutyric acid
::ethandisyrex#::oxalic acid
::2-hydroxypropansyrex#::milk acid
::l-2-hydroxypropanoatx#::l-2-hydroxypropanoate
::chlorethansyrex#::chloroacetic acid
::pentansyrex#::valeric acid
::2-methylbutansyrex#::2-methylbutyrate
::3-methylbutansyrex#::isopentanoic acid
::propandisyrex#::malonic acid
::2-chlorpropansyrex#::(S)-2-chloropropionic acid
::3-chlorpropansyrex#::3-chloropropionic acid
::(e)-but-2-endisyrex#::fumaric acid
::(e)-but-2-endioatx#::(E)-but-2-enedioate
::(z)-but-2-endisyrex#::maleic acid
::hexansyrex#::hexanoic acid
::butandisyrex#::succinic acid
::hydrogenbutandioatx#::hydrogenbutanedioate
::butandioatx#::butanedioate
::benzoesyrex#::benzoic acid
::dichlorethansyrex#::dichloroethanoic acid
::2-oxobutandisyrex#::oxalacetic acid
::2-oxobutandioatx#::2-oxobutanedioate
::2-hydroxybutandisyrex#::apple acid
::2-hydroxybutandioatx#::2-hydroxybutanedioate
::2-hydroxybenzoesyrex#::salicylic acid
::bromethansyrex#::bromoacetic acid
::octansyrex#::caprylic acid
::2-oxopentandisyrex#::2-oxoglutaric acid
::hexandisyrex#::adipic acid
::trichlorethansyrex#::2,2,2-trichloroacetic acid
::decansyrex#::decanoic acid
::acetylsalicylsyrex#::aspirin
::iodethansyrex#::iodoacetic acid
::citronsyrex#::citric acid
::citronsyremonohydratx#::citric acid monohydrate
::dihydrogencitratx#::dihydrogencitrate
::hydrogencitratx#::hydrogencitrate
::citratx#::citrate
::d-isocitronsyrex#::isocitric acid
::d-hydrogenisocitratx#::d-hydrogenisocitrate
::d-isocitratx#::d-isocitrate
::dodecansyrex#::lauric acid
::decandisyrex#::sebacic acid
::tetradecansyrex#::myristic acid
::hexadecansyrex#::palmitic acid
::hexadecanoatx#::palmitic acid
::(z)-octadec-9-ensyrex#::oleic acid
::octadecansyrex#::stearic acid
::(z)-docos-13-ensyrex#::erucic acid
::ethansyreanhydridx#::acetic anhydride
::propansyreanhydridx#::propionic anhydride
::phthalsyreanhydridx#::phthalic anhydride
::benzoesyreanhydridx#::benzoic anhydride
::ethanoylchloridx#::acetyl chloride
::propanoylchloridx#::propargyl chloride
::carbonylchloridx#::phosgene
::ethanoylbromidx#::acetyl bromide
::benzoylchloridx#::benzoyl chloride
::methanamidx#::formamide
::ethanamidx#::acetamide
::carbamidx#::urea
::ethandiamidx#::oxamide
::benzamidx#::benzamide
::butandiamidx#::succinamide
::methannitrilx#::hydrogen cyanide
::ethannitrilx#::acetonitrile
::propennitrilx#::acrylonitrile
::propannitrilx#::propionitrile
::benzonitrilx#::benzonitrile
::hexandinitrilx#::adiponitrile
::methylisocyanidx#::methyl isocyanide
::phenylisocyanidx#::phenylisocyanid
::methylmethanoatx#::methyl formate
::ethylmethanoatx#::ethyl formate
::methylethanoatx#::methyl acetate
::methylnitratx#::methyl nitrate
::ethylethanoatx#::ethyl acetate
::propylmethanoatx#::propyl formate
::ethylnitratx#::ethyl nitrate
::propylethanoatx#::propyl acetate
::methylpropanoatx#::methyl propionate
::ethylpropanoatx#::ethyl propionate
::methylbutanoatx#::methyl butyrate
::ethylbutanoatx#::ethyl butyrate
::butylethanoatx#::butyl acetate
::methylbenzoatx#::methyl benzoate
::ethylbenzoatx#::ethyl benzoate
::phenylbenzoatx#::phenyl benzoate
::glyceryltrinitratx#::nitroglycerin
::glyceryltriethanoatx#::triacetin
::glyceryltrilauratx#::glycerol trilaurate
::glyceryltripalmitatx#::tripalmitin
::glyceryltristearatx#::glycerol tristearate
::glyceryltrioleatx#::triolein
::glyceryl-1-phosphatx#::glyceryl-1-phosphate
::glucose-1-phosphatx#::glucose-1-phosphate
::glucose-6-phosphatx#::glucose-6-phosphate
::l-alaninx#::L-alanine
::l-alaniniumx#::l-alanineium
::l-alaninatx#::l-alaninate
::d,l-alaninx#::DL-alanine
::l-argininx#::L-arginine
::l-asparaginx#::L-asparagine
::l-asparaginsyrex#::L-aspartic acid
::l-asparaginsyrex#::l-asparaginoic acid
::l-cysteinx#::L-cysteine
::l-glutaminx#::L-glutamine
::l-glutaminsyrex#::L-glutamic acid
::l-glutaminsyrex#::l-glutaminoic acid
::d-glutaminsyrex#::D-glutamine
::glycinx#::glycine
::glycinationx#::glycinateione
::glyciniumx#::glycineium
::l-histidinx#::L-histidine
::l-isoleucinx#::L-isoleucine
::l-leucinx#::L-leucine
::d-leucinx#::D-leucine
::d,l-lysinx#::DL-leucine
::l-methioninx#::L-methionine
::l-phenylalaninx#::L-phenylalanine
::l-prolinx#::L-proline
::4-hydroxyprolinx#::hydroxyproline
::l-serinx#::L-serine
::l-threonintx#::L-threonine
::l-tryptophanwx#::L-tryptophan
::l-tyrosinyx#::L-tyrosine
::l-valinvx#::L-valine
::l-valinx#::l-valin
::l-valiniumx#::l-valinium
::l-valinatx#::l-valinat
::d,l-valinx#::DL-valine
::n-glycylglycinx#::N-glycylglycine
::l-alanylglycinx#::ala-gly
::hippursyrex#::hippuric acid
::glycylvalinx#::glycylvaline
::leucylglycinx#::leucylglycine
::glycylphenylalaninx#::glycylphenylalanine
::sarcosinx#::sarcosine
::3-aminopropansyrex#::beta-alanine
::4-aminobutansyrex#::gamma(amino)-butyric acid
::2-aminobenzoesyrex#::anthranilic acid
::nitromethanx#::nitromethane
::nitroethanx#::nitroethane
::1-nitropropanx#::1-nitropropane
::2-nitropropanx#::2-nitropropane
::nitrobenzenx#::nitrobenzene
::2-nitrotoluenx#::o-nitrotoluene
::1,2-dinitrobenzenx#::1,2-dinitrobenzene
::2,4-dinitrotoluenx#::2,4-dinitrotoluene
::2,4,6-trinitrotoluenx#::trinitrotoluene
::malathionx#::malathion
::ethanthiolx#::ethanethiol
::ethanthioamidx#::thioacetamide
::ethanthiosyrex#::thioacetic acid
::propan-1-thiolx#::1-propanethiol
::propan-2-thiolx#::2-propanethiol
::dimethylsulfoxidx#::dimethyl sulfoxide
::thiophenx#::thiophene
::diethylsulfidx#::diethyl sulfide
::benzenthiolx#::phenyl mercaptan
::2-aminoethansulfonatx#::2-aminoethanesulfonate
::benzensulfonsyrex#::benzenesulfonic acid
::diphenylsulfidx#::diphenyl sulfide
::diphenylsulfoxidx#::diphenyl sulfoxide
::diphenylsulfonx#::diphenyl sulfone
::ammoniumcarbonatx#::ammonium carbonate
::aluminiumnitratx#::aluminum nitrate
::aluminiumiodidx#::aluminum iodide
::bariumiodidx#::barium iodide
::ethyndiolx#::glyoxal
::ethanol2x#::ethanol
::natriumethanoat2x#::sodium ethylate
::calciumsulfitx#::calcium bisulfite
::methandiolx#::methyl hydroperoxide
::ethenolx#::hydroxyethylene
::ketenx#::ketene
::methanal2x#::formaldehyde
::natriumethanoatx#::sodium acetate
::dimethylether2x#::dimethyl ether
::chrom(ii)nitratx#::chromium nitrate
::kobber(ii)nitratx#::copper(II) nitrate
::jern(ii)hydroxidx#::iron(II) hydroxide
::kaliumphosphatx#::tripotassium phosphate
::lithiumnitratx#::lithium nitrate
::mangan(ii)nitratx#::manganese(II) nitrate
::ammoniumhydroxidx#::ammonium hydroxide
::nitrogentriiodidx#::nitrogen triiodide
::nitroniumx#::nitronium(II) ion
::nitridx#::nitride
::jern(iii)nitritx#::iron(II) nitrate
::jern(ii)sulfitx#::iron(2+) sulfite
::jern(ii)sulfatx#::duretter
::jern(iii)nitratx#::ferric nitrate
::cobalt(iii)nitrit)x#::cobalt(II) nitrite
::nikkel(ii)nitratx#::nickel(II) nitrate
::kobber(i)phosphatx#::copper(1+) phosphate
::kobber(ii)iodidx#::cuprous iodide
::kviksølv(ii)nitratx#::mercury(II) nitrate
::ammoniumsulfidx#::diammonium sulfide
::ammoniumfluoridx#::ammonium fluoride
::ammoniumiodidx#::ammonium iodide
::sølvazidx#::silver azide
::bariumnitridx#::barium nitride
::bariumsulfitx#::barium sulfite
::acetonitrilx#::acetonitrile
::kobber(ii)bromidx#::cupric bromide
::kobber(ii)flouridx#::cupric fluoride
::jern(ii)iodidx#::ferrous iodide
::jern(iii)iodidx#::iron(III) iodide
::hydrogenbromatx#::bromic acid
::kaliumsulfitx#::potassium sulfite
::kaliumphophitx#::tripotassium phosphite
::kaliumchloritx#::potassium chlorite
::lithiumsulfidx#::lithium sulfide
::magnesiumsulfitx#::magnesium sulfite
::natriumphophitx#::trisodium phosphite
::natriumphosphatx#::trisodium phosphate
::carbaminsyrex#::carbamic acid
::ammoniumbromidx#::ammonium bromide
::zinknitridx#::zinc nitride
::zinkphosphidx#::zinc phosphide
::hydrogenboratx#::hydrogen borate
::natriumphosphidx#::sodium phosphide
::kaliumnitridx#::potassium nitride
::kaliumphosphidx#::potassium phosphide
::bariumphosphidx#::barium phosphide
::bariumflouridx#::barium fluoride
::jern(ii)nitridx#::iron(2+) nitride
::jern(ii)phosphidx#::iron(2+) phosphide
::jern(iii)flouridx#::ferric fluoride
::kobber(ii)carbonatx#::copper(II) carbonate
::kobber(ii)sulfitx#::copper(2+) sulfite
::kobber(ii)nitridx#::copper(2+) nitride
::kobber(ii)phosphidx#::copper(2+) phosphide
::bly(iv)sulfidx#::lead(4+) sulfide
::bly(iv)iodidx#::lead tetraiodide
::1-bromhexanx#::1-bromohexane
::1-bromheptanx#::1-bromoheptane
::calciummethanoatx#::calcium formate
::jern(iii)hydroxidx#::iron(3+) hydroxide
::natriumamidx#::sodium amide
::aluminium(III)ion#::aluminiumion
::aluminiumtrichlorid#::aluminiumchlorid
::aluminiumtrifluorid#::aluminiumfluorid
::antimontrichlorid#::antimon(III)chlorid
::valentinit#::antimon(III)oxid
::arsan#::arsen(III)hydrid
::arsenik#::arsen(III)oxid
::barium(II)ion#::bariumion
::tungspat#::bariumsulfat
::berylliumion#::beryllium(II)ion
::plumbum#::bly
::blyion#::bly(II)ion
::blysukker#::bly(II)ethanoat-vand(1/3)
::mønje#::bly(II,IV)oxid
::blyglans#::bly(II)sulfid
::bromgas#::dibrom
::bromvand#::dibrom
::calcium(II)ion#::calciumion
::anortit#::calciumaluminiumsilikat
::calciumcarbid#::calciumdicarbid
::calciumcarbonat#::kalk
::calciumdifluorid#::calciumfluorid
::læsket kalk#::calciumhydroxid
::kalksalpeter#::calciumnitrat
::brændt kalk#::calciumoxid
::anhydrit#::calciumsulfat
::gibs#::calciumsulfat-vand(1/2)
::kulstof#::carbon
::kuldioxid#::carbondioxid
::tøris#::carbondioxid
::carbonsyre#::kulsyre
::kulilte#::carbonmonoxid
::phosgen#::carbonyldichlorid
::blåsyre#::hydrogencyanid
::klor#::chlor
::klorgas#::dichlor
::saltsyre#::hydrogenchlorid
::cæsium(I)ion#::cæsiumion
::flussyre#::hydrogenfluorid
::guldchlorid#::guld(I)chlorid
::guldtrichlorid#::guld(III)chlorid
::brint#::dihydrogen
::tungt vand#::deuterium
::hydrogeniodat#::iodsyre
::siderit#::jern(II)carbonat
::jerndichlorid#::jern(II)chlorid
::jerntrichlorid#::jern(III)chlorid
::ferrioxid#::jern(III)oxid
::jernvitriol#::jern(II)sulfat-vand(1/7)
::kalium(I)ion#::kaliumion
::alum#::kaliumaluminiumsulfat-vand(1/12)
::potaske#::kaliumcarbonat
::gul blodludsalt#::kaliumhexacyanoferrat(II)-vand(1/3)
::rød blodludsalt#::kaliumhexacyanoferrat(III)
::salpeter#::kaliumnitrat
::malakit#::kobber(II)dihydroxidcarbonat
::azurit#::kobber(II)dihydroxiddicarbonat
::kobberdichlorid#::kobber(II)chlorid
::blåsten#::kobber(II)sulfat-vand(1/5)
::dikobbersulfid#::kobber(I)sulfid
::kviksølv(I)ion#::dikviksølv
::kviksølv(I)bromid#::dikviksølvbromid
::kviksølv(I)chlorid#::dikviksølvchlorid
::kviksølv(I)oxid#::dikviksølvoxid
::lithium(I)ion#::lithiumion
::magnesium(II)ion#::magnesiumion
::sort manganit#::mangan(III)oxidhydroxid
::brunsten#::mangan(IV)oxid
::natrium(I)ion#::natriumion
::natriumacetat#::natriumethanoat-vand(1/3)
::soda#::natriumcarbonat
::krystalsoda#::natriumcarbonat-vand(1/10)
::køkkensalt#::natriumchlorid
::kryolit#::natriumhexafluoroaluminat
::grahams salt#::natriumhexametaphosphat
::natron#::natriumhydrogencarbonat
::kaustisk soda#::natriumhydroxid
::nitritsalt#::natriumnitrit
::natriummetabisulfit#::natriumdisulfit
::vandglas#::natriumsilikat
::glaubersalt#::natriumsulfat-vand(1/10)
::schlippes salt#::natriumtetrathioantimonat-vand(1/9)
::fixersalt#::natriumthiosulfat-vand(1/5)
::knorres salt#::natriumtrioxophosphat-vand(1/6)
::nikkel(II)sulfid#::nikkelsulfid
::dimethylglyoximnikkel(II)#::nikkel(II)dimethylglyoxim
::kvælstof#::dinitrogen
::lattergas#::dinitrogenoxid
::salmiak#::ammoniumchlorid
::hjortetakssalt#::ammoniumhydrogencarbonat
::ammonsalpeter#::ammoniumnitrat
::phosphatreagens#::ammoniumheptamolybdat
::nitrosylchlorid#::chloridooxidonitrogen
::ilt#::dioxygen
::ozon#::trioxygen
::dihydrogenoxid#::vand
::deuterium#::tungtvand
::dioxid(1-)#::superoxid
::phosphan#::phosphortrihydrid
::kvarts#::siliciumdioxid
::silan#::siliciumhydrid
::amidosvovlsyre#::sulfamidsyre
::sølv(I)ion#::sølvion
::sølv(I)bromat#::sølvbromat
::sølv(I)bromid#::sølvbromid
::sølv(I)carbonat#::sølvcarbonat
::sølv(I)chlorid#::sølvchlorid
::sølv(I)chromat#::sølvchromat
::sølv(I)cyanid#::sølvcyanid
::sølv(I)fluorid#::sølvfluorid
::sølv(I)iodat#::sølviodat
::sølv(I)iodid#::sølviodid
::sølv(I)nitrat#::sølvnitrat
::sølv(I)phosphat#::sølvphosphat
::sølvoxid#::sølv(I)oxid
::sølv(I)sulfat#::sølvsulfat
::sølv(I)sulfid#::sølvsulfid
::zink(II)ion#::zinkion
::zink(II)bromid#::zinkbromid
::zink(II)carbonat#::zinkcarbonat
::zink(II)chlorid#::zinkchlorid
::zink(II)hydroxid#::zinkhydroxid
::zink(II)iodid#::zinkiodid
::zink(II)nitrat-vand(1/6)#::zinknitrat-vand(1/6)
::zink(II)oxid#::zinkoxid
::zink(II)sulfat#::zinksulfat
::zink(II)sulfat-vand(1/7)#::zinksulfat-vand(1/7)
::zink(II)sulfid#::zinksulfid
::isobutan#::2-methylpropan
::isopentan#::2-methylbutan
::neopentan#::2,2-dimethylpropan
::isooctan#::2,2,4-trimethylpentan
::ethylen#::ethen
::propylen#::propen
::allen#::propadien
::isopren#::2-methylbuta-1,3-dien
::acetylen#::ethyn
::toluen#::methylbenzen
::styren#::ethenylbenzen
::o-xylen#::1,2-dimethylbenzen
::m-xylen#::1,3-dimethylbenzen
::p-xylen#::1,4-dimethylbenzen
::vinylchlorid#::chlorethen
::chloroform#::trichlormethan
::lindan#::1,2,3,4,5,6-hexachlorcyclohexan
::DDT#::1,1,1-trichlor-2,2-bis(4-chlorphenyl)ethan
::cfc22#::chlordifluormethan
::cfc14#::tetrafluormethan
::cfc21#::dichlorfluormethan
::cfc13#::chlortrifluormethan
::cfc12#::dichlordifluormethan
::cfc123#::2,2-dichlor-1,1,1-trifluorethan
::cfc122#::1,1,2,2-tetrachlor-1,2-difluorethan
::bromoform#::tribrommethan
::iodoform#::triiodmethan
::methylamin#::methanamin
::anilin#::benzenamin
::1-phenylpropan-2-amin#::amphetamin
::ephinephrin#::adrenalin
::biphenyl-4-4'-diamin#::benzidin
::vitaminb4#::adenin
::træsprit#::methanol
::sprit#::ethanol
::isopropanol#::propan-2-ol
::isopropylalkohol#::propan-2-ol
::etylenglykol#::ethan-1,2-diol
::isobutanol#::2-methylpropan-1-ol
::tert-butanol#::2-methylpropan-2-ol
::glycerol#::propan-1,2,3-triol
::p-benzoquinon#::benzen-1,4-quinon
::k-cresol#::2-methylphenol
::m-cresol#::3-methylphenol
::p-cresol#::4-methylphenol
::pyrokatekin#::1,2-dihydroxybenzen
::resorcinol#::1,3-dihydroxybenzen
::hydroquinon#::1,4-dihydroxybenzen
::pyrogallol#::1,2,3-trihydroxybenzen
::pikrinsyre#::2,4,6-trinitrophenol
::methoxymethan#::dimethylether
::ethoxymethan#::ethyl(methyl)ether
::æter#::diethylether
::glykoldimethylether#::1,2-dimethoxyethan
::diethylenglycol#::bis(2-hydroxyethyl)ether
::anisole#::methoxybenzen
::formaldehyd#::methanal
::acetaldehyd#::ethanal
::valeraldehyd#::pentanal
::glycerolaldehyd#::2,3-dihydroxypropanal
::diacetyl#::butan-2,3-dion
::acetophenon#::1-phenylethan-1-on
::druesukker#::glucose
::myresyre#::methansyre
::eddikesyre#::ethansyre
::acetat#::ethanoat
::acrylsyre#::propensyre
::propionsyre#::propansyre
::pyrodruesyre#::2-oxopropansyre
::smørsyre#::butansyre
::butyrat#::butanoat
::isosmørsyre#::2-methylpropansyre
::oxalsyre#::ethandisyre
::mælkesyre#::2-hydroxypropansyre
::valerianesyre#::pentansyre
::pivalinsyre#::2,2-dimethylpropansyre
::fumarsyre#::(E)-but-2-endisyre
::fumarat#::(E)-but-2-endioat
::maleinsyre#::(Z)-but-2-endisyre
::capronsyre#::hexansyre
::ravsyre#::butandisyre
::succinat#::butandioat
::tartonsyre#::2-hydroxypropandisyre
::oxaleddikesyre#::2-oxobutandisyre
::æblesyre#::2-hydroxybutandisyre
::malat#::hydrogen-2-hydroxybutandioat
::salicylsyre#::2-hydroxybenzoesyre
::caprilsyre#::octansyre
::ketoglutaminsyre#::2-oxopentandisyre
::adipinsyre#::hexandisyre
::vinsyre#::(2R,3R)-2,3-dihydroxybutandisyre
::D-vinsyre#::(2S,3S)-2,3-dihydroxybutandisyre
::mesovinsyre#::(2R,3S)-2,3-dihydroxybutandisyre
::phthalsyre#::1,2-benzendicarboxylsyre
::isophthalsyre#::1,3-benzendicarboxylsyre
::terephthalsyre#::1,4-benzendicarboxylsyre
::caprinsyre#::decansyre
::laurinsyre#::dodecansyre
::sebacinsyre#::decandisyre
::myristinsyre#::tetradecansyre
::palmitinsyre#::hexadecansyre
::linolensyre#::(9Z,12Z,15Z)-octadeca-9,12,15-triensyre
::linolsyre#::(9Z,12Z)-octadeca-9,12-diensyre
::oliesyre#::(Z)-octadec-9-ensyre
::elaidinsyre#::(E)-octadec-9-ensyre
::stearinsyre#::octadecansyre
::erycasyre#::(Z)-docos-13-ensyre
::acetylchlorid#::ethanoylchlorid
::formamid#::methanamid
::acetamid#::ethanamid
::urinstof#::carbamid
::acrylonitril#::propennitril
::adipinsyredinitril#::hexandinitril
::isopropylethanoat#::(1-methylethyl)ethanoat
::antranilsyre#::2-aminobenzoesyre
::DNPH#::2,4-dinitrophenylhydrazin
::tnt#::2,4,6-trinitrotoluen
::thiophenol#::benzenthiol
::taurin#::2-aminoethansulfonsyre
::sennepsgas#::bis-(1-chlorethyl)sulfid
::para-toluen-sulfonsyre#::4-methylbenzensulfonsyre
::sulfanilsyre#::4-aminobenzensulfonsyre
::antabus#::tetraethylthiuramdisulfid
::nitroniumion#::nitronium
::teaterblod#::thiocyanatojern(III)ion
::sølv(I)azid#::sølvazid
::ethannitril#::acetonitril
::aminomyresyre#::carbaminsyre
::bromhexan#::1-bromhexan
::bromheptan#::1-bromheptan
::kobber(II)tetraamin#::tetraaminkobber(II)ion
::sølvdiammin#::diamminsølv(I)ion
::jern(III)hexahydrat#::hexahydratjern(III)ion
::kobber(II)tetrachlorid#::tetrachloridkobber(II)ion
::allylmethylsulfid#::3-methylthioprop-1-en
::aluminum#::Al
::aluminum(iii) ion#::Al³⁺
::aluminum tribromide#::AlBr₃
::aluminum carbide#::Al₄C₃
::aluminum chloride#::AlCl₃
::aluminum fluoride#::AlF₃
::aluminum hydroxide#::Al(OH)₃
::aluminum oxide#::Al₂O₃
::aluminum phosphate#::AlPO₄
::aluminum sulfate#::Al₂(SO₄)₃
::gray antimony#::Sb
::stibine#::SbH₃
::antimony trioxide#::Sb₂O₃
::antimony pentoxide#::Sb₂O₅
::antimony(v) sulfide#::Sb₂S₅
::arsenic acid, solid#::H₃SbO₄
::gray arsenic#::As
::yellow arsenic#::As₄
::arsenic trichloride#::AsCl₃
::arsine#::AsH₃
::arsenic trioxide#::As₂O₃
::arsenic pentoxide#::As₂O₅
::arsenic trisulfide#::As₂S₃
::arsenic acid, solid#::H₃AsO₄
::barium(ii) ion#::Ba²⁺
::barium bromide#::BaBr₂
::barium carbonate#::BaCO₃
::barium chloride#::BaCl₂
::barium chromate#::BaCrO₄
::barium hydride#::BaH₂
::barium hydroxide#::Ba(OH)₂
::barium nitrate#::Ba(NO₃)₂
::barium oxide#::BaO
::barium peroxide#::BaO₂
::barium sulfate#::BaSO₄
::berylium(ii) ion#::Be²⁺
::beryllium chloride#::BeCl₂
::beryllium oxide#::BeO
::bismuth chloride#::BiCl₃
::bismuth chloride#::BiCl₄
::lead#::Pb
::lead(ii) ion#::Pb²⁺
::lead(ii) acetate#::Pb(CH₃COO)₂∙3H₂O
::lead(ii) azide#::Pb(N₃)₂
::lead(ii) bromide#::PbBr₂
::lead(ii) chloride#::PbCl₂
::lead tetrachloride#::PbCl₄
::lead(ii) chromate#::PbCrO₄
::lead(ii) hydroxide#::Pb(OH)₂
::lead iodide#::PbI₂
::lead(ii) nitrate#::Pb(NO₃)₂
::lead monoxide#::PbO
::lead dioxide#::PbO₂
::lead(ii,iv) oxide#::Pb₃O₄
::lead sulfide#::PbS
::lead(ii) sulfate#::PbSO₄
::lead tetraethyl#::Pb(C₂H₅)₄
::tetramethyllead#::Pb(CH₃)₄
::boron#::B
::boron nitride#::BN
::boron oxide#::B₂O₃
::boric acid#::H₃BO₃
::boron trifluoride#::BF₃
::diborane#::B₂H₆
::pentaborane(9)#::B₅H₉
::bromine#::Br
::bromine#::Br₂
::hydrogen bromide#::HBr
::cadmium bromide#::CdBr₂
::cadmium chloride#::CdCl₂
::cadmium hydroxide#::Cd(OH)₂
::cadmium iodide#::CdI₂
::chlordiazepoxide#::CdO
::cadmium sulfate#::CdSO₄
::cadmium sulfide#::CdS
::calcium(ii) ion#::Ca²⁺
::calcium acetate#::(CH₃COO)₂Ca∙H₂O
::anorthite#::CaAl₂Si₂O₈
::calcium bromide#::CaBr₂
::calcium carbide#::CaC₂
::calcium carbonate#::CaCO₃ (calcit)
::calcium carbonate#::CaCO₃
::calcium chloride#::CaCl₂
::calcium fluoride#::CaF₂
::calcium hydride#::CaH₂
::brushite#::CaHPO₄∙2H₂O
::calcium hydroxide#::Ca(OH)₂
::hydroxyapatite#::Ca₅(PO₄)₃(OH)
::calcium iodide#::CaI₂
::calcium nitrate#::Ca(NO₃)₂
::calcium nitride#::Ca₃N₂
::calcium oxalate#::C₂O₄Ca
::calcium oxide#::CaO
::calcium peroxide#::CaO₂
::calcium stearate#::(C₁₇H₃₅COO)₂Ca
::calcium sulfate#::CaSO₄
::plaster of paris#::CaSO₄∙½H₂O
::calcium sulfide#::CaS
::activated charcoal#::C
::carbon dimer#::C₂
::buckminsterfullerene#::C₆₀
::carbon dioxide#::CO₂
::carbonic acid#::H₂CO₃
::carbon disulfide#::CS₂
::carbon monoxide#::CO
::phosgene#::COCl₂
::carbonyl sulfide#::COS
::hydrogen cyanide#::HCN
::cyanogen#::(CN)₂
::cerous chloride#::CeCl₃
::cerium(iii) oxide#::Ce₂O₃
::cerium(iii) sulfate#::Ce₂(SO₄)₃
::ceric sulfate#::Ce(SO₄)₂
::chlorine#::Cl
::chlorine#::Cl₂
::chlorine dioxide#::ClO₂
::chlorine monoxide#::Cl₂O
::hydrogen chloride#::HCl
::dichlorine heptoxide#::Cl₂O₇
::chloric acid#::HClO₃
::chlorous acid#::HClO₂
::hypochlorous acid#::HClO
::perchloric acid#::HClO₄
::chromium#::Cr
::chromium(ii) ion#::Cr²⁺
::chromium(iii) ion#::Cr³⁺
::chromic acid#::H₂CrO₄
::chromous chloride#::CrCl₂
::chromic chloride#::CrCl₃
::chromium monoxide#::CrO
::chromium(iii) oxide#::Cr₂O₃
::magtrieve™#::CrO₂
::chromium trioxide#::CrO₃
::chromyl chloride#::CrO₂Cl₂
::chromium sulfate#::Cr₂(SO₄)₃
::chromium(0) carbonyl#::Cr(CO)₆
::cobalt(ii) ion#::Co²⁺
::cobaltous carbonate#::CoCO₃
::cobalt dichloride#::CoCl₂
::cobalt trichloride#::CoCl₃
::cobalt(ii) hydroxide#::Co(OH)₂
::cobalt monoxide#::CoO
::cobalt(iii) oxide#::Co₂O₃
::cobalt(ii,iii) oxide#::Co₃O₄
::cobalt(ii) sulfate#::CoSO₄
::cesium#::Cs
::cesium bromide#::CsBr
::cesium chloride#::CsCl
::sargramostim#::CsF
::caesium hydride#::CsH
::cesium hydroxide#::CsOH
::cesium iodide#::CsI
::cesium oxide#::Cs₂O
::fluorine#::F
::fluorine#::F₂
::oxygen difluoride#::F₂O
::hydrogen fluoride#::HF
::germane#::GeH₄
::digermane#::Ge₂H₆
::germanium dioxide#::GeO₂
::gold#::Au
::gold(i) chloride#::AuCl
::gold(iii) chloride#::AuCl₃
::hydrogen#::H₂
::hydrogen(i) ion#::H⁺
::heavy water#::D₂O
::hydronium ion#::H₃O⁺
::iodine#::I
::iodine#::I₂
::hydrogen iodide#::HI
::iodic acid#::HIO₃
::iodine azide#::IN₃
::iodine bromide#::IBr
::iodine monochloride#::ICl
::iodine trichloride#::ICl₃
::iodopentoxide#::I₂O₅
::iron#::Fe
::iron(ii) ion#::Fe²⁺
::iron(iii) ion#::Fe³⁺
::iron carbide#::Fe₃C
::iron(ii) carbonate#::FeCO₃
::iron(ii) chloride#::FeCl₂
::iron(iii) chloride#::FeCl₃
::pyrite#::FeS₂
::iron(ii) oxide#::FeO
::wüstite#::Fe₀.₉₄₇O
::iron(iii) oxide#::Fe₂O₃
::iron(ii,iii) oxide#::Fe₃O₄
::ferrous sulfide#::FeS
::iron sulfide#::Fe₂S₃
::ironate#::FeSO₄∙7H₂O
::ferric sulfate#::Fe₂(SO₄)₃
::ferrocene#::Fe(C₅H₅)₂
::potassium#::K
::potassium(i) ion#::K⁺
::potassium bromate#::KBrO₃
::potassium bromide#::KBr
::pearl ash#::K₂CO₃
::potassium chlorate#::KClO₃
::potassium chloride#::KCl
::potassium chromate#::K₂CrO₄
::potassium cyanide#::KCN
::potassium cyanate#::KOCN
::potassium dichromate#::K₂Cr₂O₇
::potassium fluoride#::KF
::potassium hydride#::KH
::potassium bifluoride#::KHF₂
::potassium hydroxide#::KOH
::potassium iodate#::KIO₃
::potassium iodide#::KI
::potassium manganate#::K₂MnO₄
::rochelle salt#::KNaC₄H₄O₆∙4H₂O
::potassium nitrate#::KNO₃
::potassium nitrite#::KNO₂
::potassium oxide#::K₂O
::potassium periodate#::KIO₄
::potassium peroxide#::K₂O₂
::potassium persulfate#::K₂O₃SOOSO₃
::potassium superoxide#::KO₂
::potassium sulfate#::K₂SO₄
::copper#::Cu
::copper(i) ion#::Cu⁺
::copper(ii) ion#::Cu²⁺
::malachite#::Cu₂(OH)₂CO₃
::azurite#::Cu₃(OH)₂(CO₃)₂
::cuprous chloride#::CuCl
::copper(ii) chloride#::CuCl₂
::copper hydroxide#::Cu(OH)₂
::cuprous iodide#::CuI
::copper(i) oxide#::Cu₂O
::cupric oxide#::CuO
::cuprous sulfate#::Cu₂SO₄
::copper(ii) sulfate#::CuSO₄
::copper(i) sulfide#::Cu₂S
::cupric sulfide#::CuS
::krypton difluoride#::KrF₂
::mercury#::Hg
::mercury(+1) ion#::Hg₂²⁺
::mercury(ii) ion#::Hg²⁺
::mercury(i) bromide#::Hg₂Br₂
::mercuric bromide#::HgBr₂
::mercury(i) chloride#::Hg₂Cl₂
::mercuric chloride#::HgCl₂
::mercury(i) iodide#::Hg₂I₂
::mercury(ii) iodide#::HgI₂
::mercury(i) oxide#::Hg₂O
::mercuric oxide#::HgO
::mercury(ii) sulfide#::HgS
::mercury(i) sulfate#::Hg₂SO₄
::lithium(i) ion#::Li⁺
::lithium borohydride#::LiBH₄
::lithium bromide#::LiBr
::lithium carbonate#::Li₂CO₃
::lithium chloride#::LiCl
::lithium fluoride#::LiF
::lithium hydride#::LiH
::lithium hydroxide#::LiOH
::lithium iodide#::LiI
::lithium oxide#::Li₂O
::magnesium(ii) ion#::Mg²⁺
::magnesium bromide#::MgBr₂
::magnesium carbonate#::MgCO₃
::artinite#::Mg₂(OH)₂CO₃∙3H₂O
::magnesium chloride#::MgCl₂
::magnesium hydroxide#::Mg(OH)₂
::magnesium iodide#::MgI₂
::magnesium nitrate#::Mg(NO₃)₂
::magnesium nitride#::Mg₃N₂
::magnesium oxide#::MgO
::magnesium sulfate#::MgSO₄
::magnesium sulfide#::MgS
::manganese#::Mn
::manganese(ii) ion#::Mn²⁺
::manganese(iii) ion#::Mn³⁺
::manganese carbonate#::MnCO₃
::manganite#::MnO(OH)
::manganese hydroxide#::Mn(OH)₂
::manganese monoxide#::MnO
::manganese(iii) oxide#::Mn₂O₃
::manganese dioxide#::MnO₂
::manganese sulfide#::MnS
::molybdenum#::Mo
::molybdenum dioxide#::MoO₂
::molybdenum trioxide#::MoO₃
::molybdic acid#::H₂MoO₄∙H₂O
::sodium#::Na
::sodium(i) ion#::Na⁺
::sodium amide#::NaNH₂
::sodium arsenite#::NaAsO₂
::sodium azide#::NaN₃
::sodium benzoate#::C₆H₅-COONa
::sodium tetraborate#::Na₂B₄O₇
::sodium borohydride#::NaBH₄
::sodium bromide#::NaBr
::sodium bromate#::NaBrO₃
::soda ash#::Na₂CO₃
::sodium chlorate#::NaClO₃
::sodium chloride#::NaCl
::sodium chlorite#::NaClO₂
::sodium ethylate#::CH₃CH₂ONa
::sodium fluoride#::NaF
::sodium formate#::HCOONa
::sodium hydride#::NaH
::sodium bicarbonate#::NaHCO₃
::sodium bisulfate#::NaHSO₄
::sodium bisulfide#::NaHS
::sodium bisulfite#::NaHSO₃
::sodium hydroxide#::NaOH
::sodium iodate#::NaIO₃
::sodium iodide#::NaI
::sodium methoxide#::CH₃ONa
::sodium nitrate#::NaNO₃
::sodium nitride#::Na₃N
::sodium nitrite#::NaNO₂
::sodium oleate#::C₁₇H₃₃COONa
::sodium oxalate#::Na₂C₂O₄
::sodium oxide#::Na₂O
::sodium perchlorate#::NaClO₄
::sodium peroxide#::Na₂O₂
::sodium persulfate#::Na₂S₂O₈
::sodium metabisulfite#::Na₂S₂O₅
::sodium metasilicate#::Na₂SiO₃
::sodium stearate#::C₁₇H₃₅COONa
::sodium sulfate#::Na₂SO₄
::sodium sulfide#::Na₂S
::sodium sulfite#::Na₂SO₃
::sodium hyposulfite#::Na₂S₂O₃
::sodium thiosulfate#::Na₂S₂O₃∙5H₂O
::polygon#::Na₅P₃O₁₀
::nickel#::Ni
::nickel(ii) ion#::Ni²⁺
::nickel bromide#::NiBr₂
::nickel(ii) chloride#::NiCl₂
::nickel(ii) hydroxide#::Ni(OH)₂
::nickel monoxide#::NiO
::nickel(ii) sulfate#::NiSO4
::nickel(ii) sulfide#::NiS
::nickel carbonyl#::Ni(CO)₄
::nitrogen#::N₂
::nitrogen dioxide#::NO₂
::nitric oxide#::NO
::nitrous oxide#::N₂O
::dinitrogen tetroxide#::N₂O₄
::nitrogen trioxide#::N₂O₃
::dinitrogen pentoxide#::N₂O₅
::ammonia#::NH₃
::ammonium ion#::NH₄⁺
::ammonium chloride#::NH₄Cl
::ammonium chromate#::(NH₄)₂CrO₄
::ammonium bichromate#::(NH₄)₂Cr₂O₇
::ammonium bicarbonate#::NH₄HCO₃
::ammonium bisulfide#::NH₄HS
::ammonium bisulfate#::NH₄HSO₄
::ammonium molybdate#::(NH₄)₂MoO₄
::ammonium nitrate#::NH₄NO₃
::ammonium nitrite#::NH₄NO₂
::ammonium persulfate#::(NH₄)₂S₂O8
::ammonium sulfate#::(NH₄)₂SO₄
::ammonium thiocyanate#::NH₄SCN
::diazane#::NH₂NH₂
::hydrazoic acid#::HN₃
::hydroxylamine#::NH₂OH
::nitrosyl chloride#::ONCl
::nitric acid#::HNO₃
::nitrous acid#::HNO₂
::oxygen#::O₂
::ozone#::O₃
::water#::H₂O
::hydrogen peroxide#::H₂O₂
::white phosphorus#::P₄
::red phosphorus#::P
::phosphine#::PH₃
::phosphorus pentoxide#::P₄O₁₀
::phosphoric acid#::H₃PO₄
::phosphorous acid#::H₃PO₃
::metaphosphoric acid#::(HPO₃)n
::platinum#::Pt
::rubidium chloride#::RbCl
::gray selenium#::Se
::hydrogen selenide#::H₂Se
::selenium dioxide#::SeO₂
::selenic acid#::H₂SeO₄
::silicon#::Si
::silicon carbide#::SiC
::silicon dioxide#::SiO₂
::silane#::SiH₄
::strontium(ii) ion#::Sr²⁺
::strontium carbonate#::SrCO₃
::strontium chloride#::SrCl₂
::strontium chromate#::SrCrO₄
::strontium hydroxide#::Sr(OH)₂
::strontium nitrate#::Sr(NO₃)₂
::strontium oxide#::SrO
::strontium sulfate#::SrSO₄
::mixed sulfur#::S
::rhombic sulfur#::S₈
::disulfur#::S₂
::sulfur dioxide#::SO₂
::sulfurous acid#::H₂SO₃
::hydrogen sulfide#::H₂S
::peroxysulfuric acid#::H₂S₂O₈
::sulfuric acid#::H₂SO₄
::sulfuryl chloride#::SO₂Cl₂
::sulfur trioxide#::SO₃
::thionyl chloride#::SOCl₂
::sulfamic acid#::H₂NSO₃H
::chlorosulfonic acid#::ClSO₃H
::sulfur hexafluoride#::SF₆
::silver#::Ag
::silver(i) ion#::Ag⁺
::silver bromate#::AgBrO₃
::silver bromide#::AgBr
::silver(i) carbonate#::Ag₂CO₃
::silver chloride#::AgCl
::silver(i) chromate#::Ag₂CrO₄
::silver cyanide#::AgCN
::silver fluoride#::AgF
::silver iodate#::AgIO₃
::silver(i) iodide#::AgI
::silver nitrate#::AgNO₃
::silver phosphate#::Ag₃PO₄
::silver(i) oxide#::Ag₂O
::silver(ii) oxide#::AgO
::silver sulfate#::Ag₂SO₄
::silver(i) sulfide#::Ag₂S
::thorium nitrate#::Th(NO₃)₄
::thorium(iv) oxide#::ThO₂
::white tin#::Sn
::tin(ii) ion#::Sn²⁺
::tin(iv) ion#::Sn⁴⁺
::stannic chloride#::SnCl₄
::stannane#::SnH₄
::tin(ii) hydroxide#::Sn(OH)₂
::stannic oxide#::SnO₂
::stannous sulfate#::SnSO₄
::tin(ii) sulfide#::SnS
::tin(iv) sulfide#::SnS₂
::titanium#::Ti
::titanium(iv) carbide#::TiC
::titanium trichloride#::TiCl₃
::titanium dioxide#::TiO₂
::uranium#::U
::uranium(v,vi) oxide#::U₃O₈
::uranium hexafluoride#::UF₆
::uranium dioxide#::UO₂
::uranium(vi) oxide#::UO₃
::vanadium(iii) oxide#::V₂O₃
::vanadium pentoxide#::V₂O₅
::vanadyl sulfate#::VOSO₄
::vanadium carbonyl#::V(CO)₆
::tungsten#::W
::tungsten carbide#::WC
::tungsten trioxide#::WO₃
::xenon trioxide#::XeO₃
::xenon tetroxide#::XeO₄
::xenon difluoride#::XeF₂
::xenon tetrafluoride#::XeF₄
::xenon hexafluoride#::XeF₆
::zinc#::Zn
::zinc(ii) ion#::Zn²⁺
::zinc bromide#::ZnBr₂
::zinc carbonate#::ZnCO₃
::zinc chloride#::ZnCl₂
::zinc hydroxide#::Zn(OH)₂
::zinc iodide#::ZnI₂
::zinc oxide#::ZnO
::zinc sulfate#::ZnSO₄
::zinc sulfide#::ZnS
::zirconium#::Zr
::zirconium(iv) oxide#::ZrO₂
::methane#::CH₄
::ethane#::C₂H₆
::propane#::C₃H₈
::butane#::C₄H₁₀
::n-pentane#::C₅H₁₂
::n-hexane#::C₆H₁₄
::n-hexane#::CH₃(CH₂)₄CH₃
::n-heptane#::C₇H₁₆
::n-heptane#::CH₃(CH₂)₅CH₃
::octane#::C₈H₁₈
::octane#::CH₃(CH₂)₆CH₃
::nonane#::C₉H₂₀
::decane#::C₁₀H₂₂
::undecane#::CH₃(CH₂)₉CH₃
::dodecane#::CH₃(CH₂)₁₀CH₃
::tridecane#::CH₃(CH₂)₁₁CH₃
::n-tetradecane#::CH₃(CH₂)₁₂CH₃
::pentadecane#::CH₃(CH₂)₁₃CH₃
::n-hexadecane#::CH₃(CH₂)₁₄CH₃
::heptadecane#::CH₃(CH₂)₁₅CH₃
::n-octadecane#::CH₃(CH₂)₁₆CH₃
::n-nonadecane#::CH₃(CH₂)₁₇CH₃
::n-eicosane#::CH₃(CH₂)₁₈CH₃
::isobutane#::(CH₃)₃CH
::isopentane#::(CH₃)₂CHCH₂CH₃
::2,2-dimethylpropane#::C(CH₃)₄
::2-methylpentane#::(CH₃)₂CH(CH₂)₂CH₃
::3-methylpentane#::CH₃CH(CH₂CH₃)₂
::2,2-dimethylbutane#::CH₃CH₂C(CH₃)₃
::2,3-dimethylbutane#::(CH₃)₂CHCH(CH₃)₂
::2-methylhexane#::(CH₃)₂CH(CH₂)₃CH₃
::3-methylhexane#::CH₃CH₂CH(CH₃)(CH₂)₂CH₃
::2,2-dimethylpentane#::(CH₃)₃C(CH₂)₂CH₃
::2,3-dimethylpentane#::(CH₃)₂CHCH(CH₃)CH₂CH₃
::3,3-dimethylpentane#::(CH₃)₂C(CH₂CH₃)₂
::2,4-dimethylpentane#::CH₂(CH(CH₃)₂)₂
::3-ethylpentane#::CH₃CH₂CH(C₂H₅)CH₂CH₃
::cyclopropane#::C₃H₆
::cyclobutane#::C₄H₈
::cyclopentane#::C₅H₁₀
::cyclohexane#::C₆H₁₂
::methylcyclohexane#::C₆H₁₁CH₃
::ethylene#::CH₂=CH₂
::propylene#::CH₂=CHCH₃
::propadiene#::CH₂=C=CH₂
::cyclopropene#::C₃H₄
::cyclobutene#::C₄H₆
::1,2-butadiene#::CH₂=C=CHCH₃
::1,3-butadiene#::CH₂=CHCH=CH₂
::1-butene#::CH₂=CHCH₂CH₃
::cis-2-butene#::CH₃CH=CHCH₃
::isoprene#::CH₂=C(CH₃)CH=CH₂
::1-pentene#::CH₂=CH(CH₂)₂CH₃
::1,3-cyclohexadiene#::C₆H₈
::cyclohexene#::C₆H₁₀
::alpha-pinene#::C₁₀H₁₆
::beta-carotene#::C₄₀H₅₆
::acetylene#::C₂H₂
::acetylene#::HC≡CH
::methylacetylene#::HC≡CCH₃
::1-butyne#::HC≡CCH₂CH₃
::2-butyne#::CH₃C≡CCH₃
::1,3-butadiyne#::HC≡C-C≡CH
::1-pentyne#::HC≡C(CH₂)₂CH₃
::benzene#::C₆H₆
::naphthalene#::C₁₀H₈
::anthracene#::C₁₄H₁₀
::benzo(a)anthracene#::C₁₈H₁₂
::benzo[e]pyrene#::C₂₀H₁₂
::toluene#::C₆H₅CH₃
::styrene#::C₆H₅CH=CH₂
::1,2-dimethylbenzene#::C₆H₄(CH₃)₂
::ethylbenzene#::C₆H₅CH₂CH₃
::cumene#::C₆H₅CH(CH₃)₂
::diphenyl#::C₆H₅-C₆H₅
::methyl chloride#::CH₃Cl
::vinyl chloride#::CHCl=CH₂
::chloroethane#::CH₃CH₂Cl
::1-chloropropane#::CH₃CH₂CH₂Cl
::isopropyl chloride#::CH₃CHClCH₃
::methylene chloride#::CH₂Cl₂
::butyl chloride#::CH₃(CH₂)₂CH₂Cl
::sec-butyl chloride#::CH₃CH₂CHClCH₃
::isobutyl chloride#::(CH₃)₂CHCH₂Cl
::1,1-dichloroethylene#::CH₂=CCl₂
::1,1-dichloroethane#::CH₃CHCl₂
::ethylene dichloride#::CH₂ClCH₂Cl
::chlorobenzene#::C₆H₅Cl
::chloroform#::CHCl₃
::dichlorobenzene#::C₆H₄Cl₂
::carbon tetrachloride#::CCl₄
::hexachloroethane#::CCl₃CCl₃
::hexachlorobenzene#::C₆Cl₆
::lindane#::C₆H₆Cl₆
::4,4'-ddt#::C₁₄H₉Cl₅
::tetrafluoromethane#::CF₄
::tetrafluoroethylene#::CF₂=CF₂
::bromoform#::CH₃Br
::bromoethane#::CH₃CH₂Br
::1-bromopropane#::CH₃CH₂CH₂Br
::2-bromopropane#::CH₃CHBrCH₃
::isobutyl bromide#::(CH₃)₂CHCH₂Br
::butyl bromide#::CH₃(CH₂)₂CH₂Br
::2-bromobutane#::CH₃CH₂CHBrCH₃
::bromobenzene#::C₆H₅Br
::methylene bromide#::CH₂Br₂
::1,1-dibromoethane#::CH₃CHBr₂
::ethylene dibromide#::CH₂BrCH₂Br
::1,2-dibromobenzene#::C₆H₄Br₂
::bromoform#::CHBr₃
::carbon tetrabromide#::CBr₄
::methyl iodide#::CH₃I
::iodoethane#::CH₃CH₂I
::propyl iodide#::CH₃CH₂CHI
::isopropyl iodide#::CH₃CHICH₃
::1-iodobutane#::CH₃(CH₂)₂CH₂I
::2-iodobutane#::CH₃CH₂CHICH₃
::iodobenzene#::C₆H₅I
::methylene iodide#::CH₂I₂
::1,1-dioiodoethane#::CHI₂CH₃
::1,2-diiodoethane#::CH₂ICH₂I
::iodoform#::CHI₃
::carbon tetraiodide#::CI₄
::methylamine#::CH₃NH₂
::dimethylamine#::(CH₃)₂NH
::ethylamine#::CH₃CH₂NH₂
::trimethylamine#::(CH₃)₃N
::n-propylamine#::CH₃CH₂CH₂NH₂
::2-aminopropane#::CH₃CH(NH₂)CH₃
::ethylenediamine#::H₂N(CH₂)₂NH₂
::diethylamine#::(CH₃CH₂)₂NH
::1,3-diaminopropane#::H₂N(CH₂)₃NH₂
::pyridine#::C₅H₅N
::putrescine#::H₂N(CH₂)₄NH₂
::aniline#::C₆H₅NH₂
::triethylamine#::(CH₃CH₂)₃N
::o-toluidine#::CH₃C₆H₄NH₂
::n-methylaniline#::C₆H₅NHCH₃
::phenylhydrazine#::C₆H₅NHNH₂
::triethylenediamine#::N(CH₂CH₂)₃N
::1,6-diaminohexane#::H₂N(CH₂)₆NH₂
::benzyldimethylamine#::C₆H₅N(CH₃)₂
::amphetamine#::C₆H₅CH₂CH(NH₂)CH₃
::d-methamphetamine#::C₁₀H₁₅N
::uric acid#::C₅H₄N₄O₃
::diphenylamine#::(C₆H₅)₂NH
::triphenylamine#::(C₆H₅)₃N
::azobenzene#::C₆H₅N=NC₆H₅
::l-adrenaline#::CH₃NHCH₂CHOHC₆H₃(OH)₂
::benzidine#::H₂N-C₆H₅-C₆H₅-NH₂
::caffeine#::C₈H₁₀O₂N₄
::edetic acid#::(HOOC)₂NCH₂CH₂N(CH₂COOH)₂
::cocaine#::C₁₇H₂₁NO₄
::quinine#::C₂₀H₂₄O₂N₂
::creatinine#::C₄H₇N₃O
::creatine#::H₂NC(NH)N(CH₃)CH₂COOH
::cytosine#::C₄H₅N₃O
::thymine#::C₅H₆N₂O₂
::adenine#::C₅H₅N₅
::adenineium#::C₅H₆N₅⁺
::guanine#::C₅H₅N₅O
::adenosine#::C₁₀H₁₃O₄N₅
::guanosine#::C₁₀H₁₃N₅O₅
::cytidine#::C₉H₁₃N₃O₅
::uridine#::C₉H₁₂N₂O₆
::coenzyme a#::C₃₆N₇O₁₆P₃S
::nadp+#::C₂₁H₂₈N₇O₁₇P₃
::allyl alcohol#::CH₂=CHCH₂OH
::n-propanol#::CH₃CH₂CH₂OH
::isopropanol#::CH₃CHOHCH₃
::ethylene glycol#::CH₂OHCH₂OH
::isobutyl alcohol#::(CH₃)₂CHCH₂OH
::t-butanol#::(CH₃)₃COH
::1-butanol#::CH₃(CH₂)₂CH₂OH
::sec-butanol#::CH₃CH₂CHOHCH₃
::propylene glycol#::CH₃CHOHCH₂OH
::1,3-propylene glycol#::CH₂OHCH₂CH₂OH
::amyl alcohol#::CH₃(CH₂)₃CH₂OH
::2-pentanol#::CH₃(CH₂)₂CHOHCH₃
::diethyl carbinol#::(CH₃CH₂)₂CHOH
::2-methyl-1-butanol#::CH₃CH₂CH(CH₃)CH₂OH
::isoamyl alcohol#::CH₃CH(CH₃)CH₂CH₂OH
::3-methyl-2-butanol#::CH₃CH(CH₃)CHOHCH₃
::tert-amyl alcohol#::CH₃CH₂COH(CH₃)₂
::glycerol#::CH₂OHCHOHCH₂OH
::1-hexanol#::CH₃(CH₂)₄CH₂OH
::benzyl alcohol#::C₆H₅-CH₂OH
::benzoquinone#::O=C₆H₄=O
::o-cresol#::CH₃C₆H₄OH
::catechol#::C₆H₄(OH)₂
::1,3,5-thb#::C₆H₃(OH)₃
::2-chlorophenol#::ClC₆H₄OH
::o-nitrophenol#::HOC₆H₄NO₂
::quinhydrone#::C₁₂H₁₀O₄
::picric acid#::HOC₆H₂(NO₂)₃
::ethylene oxide#::C₂H₄O
::dimethyl ether#::(CH₃)₂O
::ethyl methyl ether#::CH₃OCH₂CH₃
::furfuran#::C₄H₄O
::ethyl ether#::(CH₃CH₂)₂O
::methyl propyl ether#::CH₃(CH₂)₂OCH₃
::1,2-dimethoxyethane#::CH₃OCH₂CH₂OCH₃
::di-n-propyl ether#::(CH₃CH₂CH₂)₂O
::diethylene glycol#::(HOCH₂CH₂)₂O
::anisole#::CH₃OC₆H₅
::phenetole#::CH₃CH₂OC₆H₅
::coumarin#::C₉H₆O₂
::diphenyl ether#::(C₆H₅)₂O
::benzyl ether#::(C₆H₅CH₂)₂O
::18-crown-6#::C₁₂H₂₄O₆
::formaldehyde#::HCHO
::s-trioxane#::-(CH₂-O)₃
::acetaldehyde#::CH₃CHO
::glyoxal#::H-CO-CO-H
::propionaldehyde#::CH₃CH₂CHO
::acrolein#::CH₂=CHCHO
::butyraldehyde#::CH₃(CH₂)₂CHO
::isobutyraldehyde#::(CH₃)₂CHCHO
::valeraldehyde#::CH₃(CH₂)₃CHO
::isovaleraldehyde#::(CH₃)₂CHCH₂CHO
::pivaldehyde#::(CH₃)₃CCHO
::dl-glyceraldehyde#::CH₂OH-CHOH-CHO
::benzaldehyde#::C₇H₆O
::benzaldehyde#::C₆H₅CHO
::cinnamic aldehyde#::C₆H₅CH=CHCHO
::13-cis-retinal#::C₂₀H₂₈O
::ketene#::CH₂=C=O
::acetone#::(CH₃)₂CO
::methyl ethyl ketone#::CH₃CH₂COCH₃
::diacetyl#::CH3COCOCH3
::methyl propyl ketone#::CH₃(CH₂)₂COCH₃
::diethyl ketone#::(CH₃CH₂)₂CO
::3-methyl-2-butanone#::(CH₃)₂CHCOCH₃
::cyclohexanone#::C₆H₁₀O
::2,3-pentanedione#::CH₃COCOCH₂CH₃
::acetyl acetone#::CH₃COCH₂COCH₃
::n-amyl methyl ketone#::CH₃(CH₂)₄COCH₃
::acetophenone#::C₆H₅COCH₃
::3-acetylpyridine#::C₅H₄NCOCH₃
::d-carvone#::C₁₀H₁₄O
::d-camphor#::C₁₀H₁₆O
::ascorbic acid#::C₆H₈O₆
::benzophenone#::C₆H₅COC₆H₅
::β-ionone#::C₁₃H₂₀O
::piperine#::C₁₇H₁₉O₃N
::testosterone#::C₁₉H₂₈O₂
::d-arabinose#::C₅H₁₀O₅
::thyminose#::C₅H₁₀O₄
::d-(+)-glucose#::C₆H₁₂O₆
::lactose,monohydrate#::C₁₂H₂₂O₁₁∙H₂O
::alpha-maltose#::C₁₂H₂₂O₁₁
::β-maltosemonohydrate#::C₁₂H₂₂O₁₁∙H₂O
::sucrose#::C₁₂H₂₂O₁₁
::formic acid#::HCOOH
::acetic acid#::CH₃COOH
::acrylic acid#::CH₂=CHCOOH
::propionic acid#::CH₃CH₂COOH
::peroxyacetic acid#::CH₃C(O)OOH
::glycolic acid#::CH₂OHCOOH
::fluoroacetic acid#::CH₂FCOOH
::pyruvic acid#::CH₃COCOOH
::butyric acid#::CH₃(CH₂)₂COOH
::isobutyric acid#::(CH₃)₂CHCOOH
::oxalic acid#::(COOH)₂
::milk acid#::CH₃CHOHCOOH
::chloroacetic acid#::CH₂ClCOOH
::valeric acid#::CH₃(CH₂)₃COOH
::2-methylbutyrate#::CH₃CH₂CH(CH₃)COOH
::isopentanoic acid#::(CH₃)₂CHCH₂COOH
::pivalic acid#::C(CH₃)₃COOH
::malonic acid#::CH₂(COOH)₂
::fumaric acid#::HOOCCH=CHCOOH
::maleic acid#::HOOCCH=CHCOOH
::hexanoic acid#::CH₃(CH₂)₄COOH
::succinic acid#::(CH₂COOH)₂
::tartronic acid#::CHOH(COOH)₂
::benzoic acid#::C₇H₆O₂
::oxalacetic acid#::HOOCCH₂COCOOH
::apple acid#::HOOCCH₂CHOHCOOH
::salicylic acid#::HO-C₆H₄-COOH
::bromoacetic acid#::CH₂BrCOOH
::caprylic acid#::CH₃(CH₂)₆COOH
::2-oxoglutaric acid#::HOOCCO(CH₂)₂COOH
::adipic acid#::HOOC(CH₂)₄COOH
::l-tartaric acid#::HOOCCH₂COCOOH
::phthalic acid#::HOOC-C₆H₄-COOH
::decanoic acid#::CH₃(CH₂)₈COOH
::aspirin#::CH₃COOC₆H₄COOH
::iodoacetic acid#::CH₂ICOOH
::citric acid#::C₆H₈O₇
::isocitric acid#::C₆H₈O₇
::lauric acid#::CH₃(CH₂)₁₀COOH
::sebacic acid#::HOOC(CH₂)₈COOH
::myristic acid#::CH₃(CH₂)₁₂COOH
::palmitic acid#::CH₃(CH₂)₁₄COOH
::linoleic acid#::C₁₈H₃₂O₂
::oleic acid#::CH₃(CH₂)₇CH=CH(CH₂)₇COOH
::stearic acid#::CH₃(CH₂)₁₆COOH
::erucic acid#::CH₃(CH₂)₇CH=CH(CH₂)₁₁COOH
::acetic anhydride#::(CH₃C=O)₂O
::propionic anhydride#::(CH₃CH₂C=O)₂O
::phthalic anhydride#::C₆H₄(C=O)₂O
::benzoic anhydride#::(C₆H₅C=O)₂O
::acetyl chloride#::CH₃C(=O)Cl
::propargyl chloride#::CH₃CH₂C(=O)Cl
::phosgene#::C(=O)Cl₂
::acetyl bromide#::CH₃C(=O)Br
::benzoyl chloride#::C₆H₅C(=O)Cl
::formamide#::HC(=O)NH₂
::acetamide#::CH₃C(=O)NH₂
::urea#::C(=O)(NH₂)₂
::oxamide#::H₂NC(=O)-C(=O)NH₂
::benzamide#::C₆H₅C(=O)NH₂
::succinamide#::H₂NC(=O)CH₂CH₂C(=O)NH₂
::acetonitrile#::CH₃-CN
::acrylonitrile#::CH₂=CH-CN
::propionitrile#::CH₃CH₂CN
::benzonitrile#::C₆H₅CN
::adiponitrile#::NC-(CH₂)₄-CN
::methyl isocyanide#::C₂H₃N
::methyl formate#::HCOOCH₃
::ethyl formate#::HCOOCH₂CH₃
::methyl acetate#::CH₃COOCH₃
::methyl nitrate#::CH₃ONO₂
::ethyl acetate#::CH₃COOCH₂CH₃
::propyl formate#::HCOO(CH₂)₂CH₃
::ethyl nitrate#::CH₃CH₂ONO₂
::propyl acetate#::CH₃COO(CH₂)₂CH₃
::isopropyl acetate#::CH₃COOCH(CH₃)₂
::methyl propionate#::CH₃CH₂COOCH₃
::ethyl propionate#::CH₃CH₂COOCH₂CH₃
::methyl butyrate#::CH₃(CH₂)₂COOCH₃
::ethyl butyrate#::CH₃(CH₂)₂COOCH₂CH₃
::butyl acetate#::CH₃COO(CH₂)₃CH₃
::sec-butyl acetate#::CH₃COOCH(CH₃)CH₂CH₃
::tert-butyl acetate#::CH₃COOC(CH₃)₃
::methyl benzoate#::C₆H₅COOCH₃
::ethyl benzoate#::C₆H₅COOCH₂CH₃
::phenyl benzoate#::C₆H₅COOC₆H₅
::nitroglycerin#::C₃H₅N₃O₉
::triacetin#::(CH₃COOCH₂)₂CHOCOCH₃
::glycerol trilaurate#::C₃₉H₇₄O₆
::tripalmitin#::C₅₁H₉₈O₆
::glycerol tristearate#::C₅₇H₁₁₀O₆
::triolein#::C₅₇H₁₀₄O₆
::glucose-1-phosphate#::C₆H₁₃O₉P
::glucose-6-phosphate#::C₆H₁₃O₉P
::l-alanine#::NH₂CH(CH₃)COOH
::l-alanineium#::⁺NH₃CH(CH₃)COOH
::dl-alanine#::NH₂CH(CH₃)COOH
::l-arginine#::NH₂CHCOOH(CH₂)₃-NH-C(NH₂)=NH
::l-asparagine#::NH₂CH(CH₂-CO-NH₂)COOH
::l-aspartic acid#::NH₂CHCOOH(CH₂-COOH)
::l-cysteine#::NH₂CH(CH₂-SH)COOH
::l-glutamine#::NH₂CHCOOH((CH₂)₂-CO-NH₂)
::l-glutamic acid#::NH₂CHCOOH((CH₂)₂-COOH)
::d-glutamine#::NH₂CHCOOH(CH₂)₂-COOH
::glycine#::NH₂CH₂COOH
::glycineium#::⁺NH₃CH₂COOH
::l-histidine#::C₆H₉N₃O₂
::l-isoleucine#::NH₂CHCOOH(CH(CH₃)-CH₂-CH₃)
::l-leucine#::Leu-CH₂-CH(CH₃)₂
::d-leucine#::C₆H₁₃NO₂
::dl-leucine#::C₆H₁₄N₂O₂
::l-methionine#::Met-(CH₂)₂-S-CH₃
::l-phenylalanine#::Phe-CH₂-C₆H₅
::l-proline#::C₅H₉NO₂
::hydroxyproline#::C₅H₉NO₃
::l-serine#::-CH₂-OH
::l-threonine#::NH₂CHCOOH(CHOH-CH₃)
::l-tryptophan#::C₁₁H₁₂N₂O₂
::l-tyrosine#::NH₂CHCOOH(CH₂-C₆H₄-OH)
::l-valine#::NH₂CHCOOH(CH(CH₃)₂)
::dl-valine#::(CH₃)₂CHCH(NH₂)COOH
::n-glycylglycine#::H₂NCH₂-CONH-CH₂COOH
::ala-gly#::H₂NCH(CH₃)-CONH-CH₂COOH
::hippuric acid#::C₆H₅-CONH-CH₂COOH
::glycylvaline#::H₂NCH₂-CONH-CH(C₃H₇)COOH
::leucylglycine#::H₂NCH(C₄H₉)-CONH-CH₂COOH
::glycylphenylalanine#::H₂NCH₂-CONH-CH(C₇H₇)COOH
::sarcosine#::CH₃-NH-CH₂COOH
::beta-alanine#::H₂NCH₂CH₂COOH
::taurine#::NH₂(CH₂)₂SO₃H
::anthranilic acid#::NH₂C₆H₄COOH
::nitromethane#::CH₃NO₂
::nitroethane#::CH₃CH₂NO₂
::1-nitropropane#::CH₃CH₂CH₂NO₂
::2-nitropropane#::(CH₃)₂CHNO₂
::nitrobenzene#::C₆H₅NO₂
::o-nitrotoluene#::CH₃C₆H₄NO₂
::1,2-dinitrobenzene#::C₆H₄(NO₂)₂
::2,4-dinitrotoluene#::CH₃C₆H₃(NO₂)₂
::trinitrotoluene#::CH₃C₆H₂(NO₂)₃
::ethanethiol#::CH₃CH₂SH
::thioacetamide#::CH₃CSNH₂
::thioacetic acid#::CH₃COSH
::1-propanethiol#::CH₃CH₂CH₂SH
::2-propanethiol#::(CH₃)₂CHSH
::dimethyl sulfoxide#::(CH₃)₂SO
::thiophene#::C₄H₄S
::diethyl sulfide#::(CH₃CH₂)₂S
::phenyl mercaptan#::C₆H₅SH
::mustard gas#::(CICH₂CH₂)₂S
::benzenesulfonic acid#::C₆H₅SO₃H
::tosic acid#::CH₃C₆H₄SO₃H
::sulfanilic acid#::NH₃C₆H₄SO₃H
::diphenyl sulfide#::(C₆H₅)₂S
::diphenyl sulfoxide#::(C₆H₅)₂SO
::diphenyl sulfone#::(C₆H₅)₂SO₂
::disulfiram#::(C₂H₅)₂NCS-SS-CSN(C₂H₅)₂
::ammonium carbonate#::(NH₄)₂CO₃
::aluminum nitrate#::Al(NO₃)₃
::aluminum iodide#::AlI₃
::barium iodide#::BaI₂
::glyoxal#::C₂H₂O₂
::ethanol#::C₂H₅OH
::sodium ethylate#::C₂H₅ONa
::calcium bisulfite#::CaSO₃
::methyl hydroperoxide#::CH₂(OH)₂
::hydroxyethylene#::CH₂CHOH
::ketene#::CH₂CO
::formaldehyde#::CH₂O
::sodium acetate#::CH₃COONa
::dimethyl ether#::CH₃OCH₃
::chromium nitrate#::Cr(NO₃)₃
::copper(ii) nitrate#::Cu(NO₃)₂
::iron(ii) hydroxide#::Fe(OH)₂
::lithium nitrate#::LiNO₃
::disodium phosphite#::Na₂HPO₃
::ammonium hydroxide#::NH₄OH
::nitrogen triiodide#::NI₃
::nitronium(ii) ion#::NO₂⁺
::chromium nitrate#::Cr(NO₃)₂
::iron(ii) nitrate#::Fe(NO₃)₂
::iron(2+) sulfite#::FeSO₃
::duretter#::FeSO₄
::ferric nitrate#::Fe(NO₃)₃
::cobalt(ii) nitrite#::Co(NO₂)₃
::nickel(ii) nitrate#::Ni(NO₃)₂
::copper(ii) nitrate#::CuNO₃
::copper(1+) phosphate#::Cu₃PO₄
::cuprous iodide#::CuI₂
::mercury(ii) nitrate#::Hg(NO₃)₂
::diammonium sulfide#::(NH₄)₂S
::ammonium fluoride#::NH₄F
::ammonium iodide#::NH₄I
::silver azide#::AgN₃
::barium nitride#::Ba₃N₂
::barium sulfite#::BaSO₃
::acetonitrile#::CH₃CN
::cupric bromide#::CuBr₂
::cupric fluoride#::CuF₂
::ferrous iodide#::FeI₂
::iron(iii) iodide#::FeI₃
::bromic acid#::HBrO₃
::potassium sulfite#::K₂SO₃
::potassium chlorite#::KClO₂
::lithium sulfide#::Li₂S
::magnesium sulfite#::MgSO₃
::trisodium phosphite#::Na₃PO₃
::trisodium phosphate#::Na₃PO₄
::carbamic acid#::NH₂COOH
::ammonium bromide#::NH₄Br
::zinc nitride#::Zn₃N₂
::zinc phosphide#::Zn₃P₂
::sodium phosphide#::Na₃P
::potassium nitride#::K₃N
::potassium phosphide#::K₃P
::barium phosphide#::Ba₃P₂
::barium fluoride#::BaF₂
::iron(2+) nitride#::Fe₃N₂
::iron(2+) phosphide#::Fe₃P₂
::ferric fluoride#::FeF₃
::copper(ii) carbonate#::CuCO₃
::copper(2+) sulfite#::CuSO₃
::copper(2+) nitride#::Cu₃N₂
::copper(2+) phosphide#::Cu₃P₂
::lead(4+) sulfide#::PbS₂
::lead tetraiodide#::PbI₄
::1-bromohexane#::C₆H₁₃Br
::1-bromoheptane#::C₇H₁₅Br
::calcium formate#::Cl₂H₂CaO₄
::allyl methyl sulfide#::C₄H₈S
::iron(3+) hydroxide#::Fe(OH)₃
::arsenat#::AsO₄³⁻
::dihydrogenborat#::H₂BO₃⁻
::bromat#::BrO₃⁻
::bromid#::Br⁻
::hydrogencarbonat#::HCO₃⁻
::carbonat#::CO₃²⁻
::cyanid#::CN⁻
::cyanat#::OCN⁻
::thiocyanat#::SCN⁻
::chlorid#::Cl⁻
::chlorat#::ClO₃⁻
::chlorit#::ClO₂⁻
::hypochlorit#::ClO⁻
::perchlorat#::ClO₄⁻
::chromat#::CrO₄²⁻
::fluorid#::F⁻
::hydrid#::H⁻
::iodid#::I⁻
::iodat#::IO₃⁻
::permanganat#::MnO₄⁻
::nitrat#::NO₃⁻
::nitrit#::NO₂⁻
::oxid#::O²⁻
::peroxid#::O₂²⁻
::hydroxid#::OH⁻
::dihydrogenphosphat#::H₂PO₄⁻
::hydrogenphosphat#::HPO₄²⁻
::phosphat#::PO₄³⁻
::hydrogensulfit#::HSO₃⁻
::sulfit#::SO₃²⁻
::hydrogensulfid#::HS⁻
::sulfid#::S²⁻
::hydrogensulfat#::HSO₄⁻
::sulfat#::SO₄²⁻
::thiosulfat#::S₂O₃²⁻
::adeninion#::C₅H₄N₅⁻
::1,4-dioxan#::-(CH₂OCH₂)₂-
::paraldehyd#::-(CH(CH₃)-O)₃-
::methanoat#::HCOO⁻
::ethanoat#::CH₃COO⁻
::2-hydroxyethanoat#::CH₂OHCOO⁻
::2-oxopropanoat#::CH₃COCOO⁻
::butanoat#::CH₃(CH₂)₂COO⁻
::l-2-hydroxypropanoat#::CH₃CHOHCOO-
::(e)-but-2-endioat#::⁻OOCCH=CHCOO⁻
::hydrogenbutandioat#::HOOC(CH₂)₂COO⁻
::butandioat#::⁻OOH(CH₂)₂COO⁻
::hydrogen-2-oxobutandioat#::HOOCCH₂COCOO⁻
::2-oxobutandioat#::⁻OOCCH₂COCOO⁻
::2-hydroxybutandioat#::⁻OOCCH₂CHOHCOO⁻
::dihydrogencitrat#::C₆H₇O₇⁻
::hydrogencitrat#::C₆H₆O₇²⁻
::citrat#::C₆H₅O₇³⁻
::d-dihydrogenisocitrat#::C₆H₇O₇⁻
::d-hydrogenisocitrat#::C₆H₆O₇²⁻
::d-isocitrat#::C₆H₅O₇³⁻
::hexadecanoat#::CH₃(CH₂)₁₄COO⁻
::glyceryl-1-phosphat#::C₃H₇O₆P²⁻
::glucose-1-phosphat#::C₆H₁₁O₉P²⁻
::glucose-6-phosphat#::C₆H₁₁O₉P²⁻
::l-alanin#::⁺NH₃CH(CH₃)COO⁻
::l-alaninat#::NH₂CH(CH₃)COO⁻
::l-arginin#::⁺NH₃CH(R)COO⁻
::l-asparagin#::⁺NH₃CH(CH₂-CO-NH₂)COO⁻
::l-asparaginsyre#::⁺NH₃CH(CH₂-COOH)COO⁻
::l-cystein#::⁺NH₃CH(CH₂-SH)COO⁻
::l-glutamin#::⁺NH₃CH(R)COO⁻
::l-glutaminsyre#::⁺NH₃CH((CH₂)₂-COOH)COO-
::glycin#::⁺NH₃CH₂COO⁻
::glycination#::NH₂CH₂COO⁻
::l-leucin#::⁺NH₃CH(CH₂-CH(CH₃)₂)COO⁻
::l-methionin#::⁺NH₃CH((CH₂)₂-S-CH₃)COO⁻
::l-valin#::⁺NH₃CH(R)COO⁻
::l-valinat#::NH₂CH(R)COO⁻
::2-aminoethansulfonation#::NH₂(CH₂)₂SO₃⁻
::2-aminoethansulfonat#::NH₂(CH₂)₂SO₃⁻
::nitrid#::N³⁻
::hydrogenborat#::HBO₃²⁻
::arsenate#::AsO₄³⁻
::dihydrogen borate#::H₂BO₃⁻
::bromate#::BrO₃⁻
::bromide#::Br⁻
::hydrogen carbonate#::HCO₃⁻
::carbonate#::CO₃²⁻
::cyanide#::CN⁻
::cyanate#::OCN⁻
::thiocyanate#::SCN⁻
::chloride#::Cl⁻
::chlorate#::ClO₃⁻
::chlorite#::ClO₂⁻
::hypochlorite#::ClO⁻
::perchlorate#::ClO₄⁻
::chromate#::CrO₄²⁻
::fluoride#::F⁻
::hydride#::H⁻
::iodide#::I⁻
::iodate#::IO₃⁻
::permanganate#::MnO₄⁻
::nitrate#::NO₃⁻
::nitrite#::NO₂⁻
::oxide#::O²⁻
::peroxide#::O₂²⁻
::hydroxide#::OH⁻
::dihydrogen phosphate#::H₂PO₄⁻
::hydrogen phosphate#::HPO₄²⁻
::phosphate#::PO₄³⁻
::hydrogensulfite#::HSO₃⁻
::sulfite#::SO₃²⁻
::hydrogen sulfite#::HS⁻
::sulfide#::S²⁻
::hydrogen sulfate#::HSO₄⁻
::sulfate#::SO₄²⁻
::thiosulfate#::S₂O₃²⁻
::adenineione#::C₅H₄N₅⁻
::1,4-dioxane#::-(CH₂OCH₂)₂-
::paraldehyde#::-(CH(CH₃)-O)₃-
::methanoate#::HCOO⁻
::ethanoate#::CH₃COO⁻
::2-hydroxyethanoate#::CH₂OHCOO⁻
::pyruvic acid#::CH₃COCOO⁻
::butanoate#::CH₃(CH₂)₂COO⁻
::l-2-hydroxypropanoate#::CH₃CHOHCOO-
::(e)-but-2-enedioate#::⁻OOCCH=CHCOO⁻
::hydrogenbutanedioate#::HOOC(CH₂)₂COO⁻
::butanedioate#::⁻OOH(CH₂)₂COO⁻
::2-oxobutanedioate#::⁻OOCCH₂COCOO⁻
::2-hydroxybutanedioate#::⁻OOCCH₂CHOHCOO⁻
::dihydrogencitrate#::C₆H₇O₇⁻
::hydrogencitrate#::C₆H₆O₇²⁻
::citrate#::C₆H₅O₇³⁻
::d-dihydrogenisocitrate#::C₆H₇O₇⁻
::d-hydrogenisocitrate#::C₆H₆O₇²⁻
::d-isocitrate#::C₆H₅O₇³⁻
::palmitic acid#::CH₃(CH₂)₁₄COO⁻
::glyceryl-1-phosphate#::C₃H₇O₆P²⁻
::glucose-1-phosphate#::C₆H₁₁O₉P²⁻
::glucose-6-phosphate#::C₆H₁₁O₉P²⁻
::l-alanine#::⁺NH₃CH(CH₃)COO⁻
::l-alaninate#::NH₂CH(CH₃)COO⁻
::l-arginine#::⁺NH₃CH(R)COO⁻
::l-asparagine#::⁺NH₃CH(CH₂-CO-NH₂)COO⁻
::l-asparaginoic acid#::⁺NH₃CH(CH₂-COOH)COO⁻
::l-cysteine#::⁺NH₃CH(CH₂-SH)COO⁻
::l-glutamine#::⁺NH₃CH(R)COO⁻
::l-glutaminoic acid#::⁺NH₃CH((CH₂)₂-COOH)COO-
::glycine#::⁺NH₃CH₂COO⁻
::glycinateione#::NH₂CH₂COO⁻
::l-leucine#::⁺NH₃CH(CH₂-CH(CH₃)₂)COO⁻
::l-methionine#::⁺NH₃CH((CH₂)₂-S-CH₃)COO⁻
::2-aminoethanesulfonate#::NH₂(CH₂)₂SO₃⁻
::nitride#::N³⁻
::hydrogen borate#::HBO₃²⁻

#HotIf

; Enhederne herunder virker i alle programmer – også i Word, PowerPoint og OneNote
:c0:m^2::m²
:c0:m^-1::m⁻¹
:c0:m^-2::m⁻²
:c0:m^-3::m⁻³
:c0:m^-4::m⁻⁴
:c0:m^3::m³
:c0:m^4::m⁴
