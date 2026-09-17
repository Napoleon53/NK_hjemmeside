using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Threading;
using System.Windows.Forms;

namespace QuartoRenderMaster
{
    internal class Hovedvindue : Form
    {
        private readonly Indstillinger _indst = new Indstillinger();
        private string _quarto;
        private Kvartoprojekt _projekt;
        private List<Fundetfil> _filer = new List<Fundetfil>();
        private bool _opdaterer;
        private Thread _traad;
        private Koerer _koerer;
        private string _sidsteUdmappe;

        private TextBox _txtMappe, _txtLog, _txtOutput, _txtWord, _txtSamletnavn;
        private Button _btnVaelg, _btnRender, _btnAfbryd, _btnAabn, _btnAlle, _btnIngen, _btnOutput, _btnWord;
        private ComboBox _cmbProfil;
        private Label _lblProjekt, _lblAntal, _lblProfil, _lblQuarto, _lblVink;
        private LinkLabel _lnkQuarto;
        private Panel _pnlDropbox;
        private CheckBox _chkKopi, _chkHtml, _chkWord, _chkPdf, _chkSamlet, _chkIndlejr;
        private RadioButton _rdoBog, _rdoFiler;
        private TreeView _trae;
        private ProgressBar _bjaelke;
        private TableLayoutPanel _rod;

        private static readonly Color Daempet = Color.FromArgb(95, 95, 95);
        private static readonly Color Advarsel = Color.FromArgb(176, 0, 0);

        public Hovedvindue()
        {
            OpretUI();
            HentIndstillinger();
            FindQuarto();
            string sidste = _indst.Hent(Indstillinger.SidsteMappe, "");
            if (sidste.Length > 0 && Directory.Exists(sidste)) IndlaesMappe(sidste, false);
            else OpdaterProjektinfo();
        }

        // ---------------------------------------------------------------- UI

        private void OpretUI()
        {
            Text = "Quarto Render Master";
            Font = new Font("Segoe UI", 9.75f);
            AutoScaleMode = AutoScaleMode.Font;
            AutoScaleDimensions = new SizeF(7F, 15F);
            ClientSize = new Size(1020, 620);
            StartPosition = FormStartPosition.CenterScreen;

            _rod = new TableLayoutPanel();
            _rod.Dock = DockStyle.Fill;
            _rod.ColumnCount = 1;
            _rod.RowCount = 4;
            _rod.Padding = new Padding(10, 8, 10, 8);
            _rod.RowStyles.Add(new RowStyle(SizeType.Absolute, 88));
            _rod.RowStyles.Add(new RowStyle(SizeType.Absolute, 0));
            _rod.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            _rod.RowStyles.Add(new RowStyle(SizeType.Absolute, 46));
            Controls.Add(_rod);

            _rod.Controls.Add(OpretTop(), 0, 0);
            _rod.Controls.Add(OpretDropbox(), 0, 1);
            _rod.Controls.Add(OpretMidte(), 0, 2);
            _rod.Controls.Add(OpretKnapper(), 0, 3);
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            // Vinduet er bygget til en almindelig skaerm. Paa en lille eller
            // kraftigt forstoerret skaerm klippes det til, hvad der er plads til.
            Rectangle arbejde = Screen.FromControl(this).WorkingArea;
            int bredde = Math.Min(Width, arbejde.Width - 40);
            int hoejde = Math.Min(Height, arbejde.Height - 40);
            Size = new Size(bredde, hoejde);
            MinimumSize = new Size(Math.Min(860, bredde), Math.Min(560, hoejde));
            CenterToScreen();
        }

        private static Label Etikette(string tekst)
        {
            Label l = new Label();
            l.Text = tekst;
            l.AutoSize = true;
            l.Anchor = AnchorStyles.Left;
            l.Margin = new Padding(0, 3, 8, 3);
            return l;
        }

        private static Button Knap(string tekst)
        {
            Button b = new Button();
            b.Text = tekst;
            b.AutoSize = true;
            b.AutoSizeMode = AutoSizeMode.GrowAndShrink;
            b.Padding = new Padding(12, 2, 12, 2);
            b.Margin = new Padding(6, 2, 0, 2);
            return b;
        }

        private static CheckBox Kryds(string tekst)
        {
            CheckBox c = new CheckBox();
            c.Text = tekst;
            c.AutoSize = true;
            c.Margin = new Padding(4, 3, 14, 3);
            return c;
        }

        private static TableLayoutPanel Gitter(int kolonner, int raekker)
        {
            TableLayoutPanel t = new TableLayoutPanel();
            t.Dock = DockStyle.Fill;
            t.ColumnCount = kolonner;
            t.RowCount = raekker;
            t.Margin = new Padding(0);
            return t;
        }

        private Control OpretTop()
        {
            TableLayoutPanel t = Gitter(3, 3);
            t.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            t.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            t.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            t.RowStyles.Add(new RowStyle(SizeType.Absolute, 34));
            t.RowStyles.Add(new RowStyle(SizeType.Absolute, 30));
            t.RowStyles.Add(new RowStyle(SizeType.Absolute, 24));

            t.Controls.Add(Etikette("Projektmappe"), 0, 0);

            _txtMappe = new TextBox();
            _txtMappe.ReadOnly = true;
            _txtMappe.TabStop = false;
            _txtMappe.BackColor = SystemColors.Window;
            _txtMappe.Anchor = AnchorStyles.Left | AnchorStyles.Right;
            _txtMappe.Margin = new Padding(0, 3, 6, 3);
            t.Controls.Add(_txtMappe, 1, 0);

            _btnVaelg = Knap("Vælg mappe ...");
            _btnVaelg.Anchor = AnchorStyles.Right;
            _btnVaelg.Click += VaelgMappe;
            t.Controls.Add(_btnVaelg, 2, 0);

            _lblProjekt = new Label();
            _lblProjekt.Dock = DockStyle.Fill;
            _lblProjekt.TextAlign = ContentAlignment.MiddleLeft;
            _lblProjekt.AutoEllipsis = true;
            _lblProjekt.Margin = new Padding(0);
            t.Controls.Add(_lblProjekt, 0, 1);
            t.SetColumnSpan(_lblProjekt, 2);

            FlowLayoutPanel profil = new FlowLayoutPanel();
            profil.AutoSize = true;
            profil.AutoSizeMode = AutoSizeMode.GrowAndShrink;
            profil.Anchor = AnchorStyles.Right;
            profil.Margin = new Padding(0);
            _lblProfil = Etikette("Udgave");
            _lblProfil.Visible = false;
            profil.Controls.Add(_lblProfil);
            _cmbProfil = new ComboBox();
            _cmbProfil.DropDownStyle = ComboBoxStyle.DropDownList;
            _cmbProfil.Width = 190;
            _cmbProfil.Margin = new Padding(0, 1, 0, 1);
            _cmbProfil.Visible = false;
            _cmbProfil.SelectedIndexChanged += SkiftProfil;
            profil.Controls.Add(_cmbProfil);
            t.Controls.Add(profil, 2, 1);

            _lblQuarto = new Label();
            _lblQuarto.Dock = DockStyle.Fill;
            _lblQuarto.TextAlign = ContentAlignment.MiddleLeft;
            _lblQuarto.ForeColor = Daempet;
            _lblQuarto.AutoEllipsis = true;
            _lblQuarto.Margin = new Padding(0);
            t.Controls.Add(_lblQuarto, 0, 2);
            t.SetColumnSpan(_lblQuarto, 2);

            _lnkQuarto = new LinkLabel();
            _lnkQuarto.Text = "Hent Quarto";
            _lnkQuarto.AutoSize = true;
            _lnkQuarto.Anchor = AnchorStyles.Right;
            _lnkQuarto.Visible = false;
            _lnkQuarto.LinkClicked += delegate { Aabn(Quartolokator.Hjemmeside); };
            t.Controls.Add(_lnkQuarto, 2, 2);

            return t;
        }

        private Control OpretDropbox()
        {
            _pnlDropbox = new Panel();
            _pnlDropbox.Dock = DockStyle.Fill;
            _pnlDropbox.BackColor = Color.FromArgb(255, 247, 214);
            _pnlDropbox.BorderStyle = BorderStyle.FixedSingle;
            _pnlDropbox.Visible = false;
            _pnlDropbox.Margin = new Padding(0, 2, 0, 4);

            TableLayoutPanel t = Gitter(1, 2);
            t.Padding = new Padding(8, 2, 8, 2);
            t.RowStyles.Add(new RowStyle(SizeType.Percent, 50));
            t.RowStyles.Add(new RowStyle(SizeType.Percent, 50));

            Label l = new Label();
            l.Text = "Mappen ligger i Dropbox. Rendering kan fejle, fordi Dropbox låser filer, mens den synkroniserer.";
            l.Dock = DockStyle.Fill;
            l.TextAlign = ContentAlignment.MiddleLeft;
            l.Margin = new Padding(0);
            t.Controls.Add(l, 0, 0);

            _chkKopi = Kryds("Byg i en midlertidig kopi og kopiér resultatet tilbage bagefter");
            _chkKopi.Anchor = AnchorStyles.Left;
            t.Controls.Add(_chkKopi, 0, 1);

            _pnlDropbox.Controls.Add(t);
            return _pnlDropbox;
        }

        private Control OpretMidte()
        {
            TableLayoutPanel t = Gitter(2, 1);
            t.Margin = new Padding(0, 4, 0, 4);
            t.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            t.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 360));
            t.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            t.Controls.Add(OpretVenstre(), 0, 0);
            t.Controls.Add(OpretHoejre(), 1, 0);
            return t;
        }

        private Control OpretVenstre()
        {
            TableLayoutPanel t = Gitter(1, 2);
            t.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            t.RowStyles.Add(new RowStyle(SizeType.Absolute, 152));
            t.Controls.Add(OpretIndhold(), 0, 0);
            t.Controls.Add(OpretLog(), 0, 1);
            return t;
        }

        private Control OpretIndhold()
        {
            GroupBox g = new GroupBox();
            g.Text = "Hvad skal renderes";
            g.Dock = DockStyle.Fill;
            g.Margin = new Padding(0, 0, 0, 6);

            TableLayoutPanel t = Gitter(1, 4);
            t.Padding = new Padding(8, 4, 8, 6);
            t.RowStyles.Add(new RowStyle(SizeType.AutoSize));
            t.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            t.RowStyles.Add(new RowStyle(SizeType.AutoSize));
            t.RowStyles.Add(new RowStyle(SizeType.AutoSize));
            g.Controls.Add(t);

            FlowLayoutPanel tilstand = new FlowLayoutPanel();
            tilstand.AutoSize = true;
            tilstand.AutoSizeMode = AutoSizeMode.GrowAndShrink;
            tilstand.Dock = DockStyle.Fill;
            tilstand.Margin = new Padding(0, 0, 0, 2);
            _rdoBog = new RadioButton();
            _rdoBog.Text = "Bogens kapitler";
            _rdoBog.AutoSize = true;
            _rdoBog.Margin = new Padding(4, 3, 20, 3);
            _rdoBog.CheckedChanged += SkiftTilstand;
            tilstand.Controls.Add(_rdoBog);
            _rdoFiler = new RadioButton();
            _rdoFiler.Text = "Enkelte filer i mappetræet";
            _rdoFiler.AutoSize = true;
            _rdoFiler.Margin = new Padding(4, 3, 4, 3);
            tilstand.Controls.Add(_rdoFiler);
            t.Controls.Add(tilstand, 0, 0);

            _trae = new TreeView();
            _trae.Dock = DockStyle.Fill;
            _trae.CheckBoxes = true;
            _trae.HideSelection = false;
            _trae.ItemHeight = 22;
            _trae.Margin = new Padding(0, 2, 0, 4);
            _trae.AfterCheck += TraeKryds;
            t.Controls.Add(_trae, 0, 1);

            FlowLayoutPanel knapper = new FlowLayoutPanel();
            knapper.AutoSize = true;
            knapper.AutoSizeMode = AutoSizeMode.GrowAndShrink;
            knapper.Dock = DockStyle.Fill;
            knapper.Margin = new Padding(0);
            _btnAlle = Knap("Vælg alle");
            _btnAlle.Margin = new Padding(0, 2, 6, 2);
            _btnAlle.Click += delegate { SaetAlle(true); };
            knapper.Controls.Add(_btnAlle);
            _btnIngen = Knap("Fravælg alle");
            _btnIngen.Margin = new Padding(0, 2, 12, 2);
            _btnIngen.Click += delegate { SaetAlle(false); };
            knapper.Controls.Add(_btnIngen);
            _lblAntal = Etikette("");
            _lblAntal.ForeColor = Daempet;
            _lblAntal.Margin = new Padding(0, 8, 0, 3);
            knapper.Controls.Add(_lblAntal);
            t.Controls.Add(knapper, 0, 2);

            _lblVink = new Label();
            _lblVink.Dock = DockStyle.Fill;
            _lblVink.AutoSize = true;
            _lblVink.ForeColor = Daempet;
            _lblVink.Margin = new Padding(2, 2, 2, 0);
            t.Controls.Add(_lblVink, 0, 3);

            return g;
        }

        private Control OpretLog()
        {
            GroupBox g = new GroupBox();
            g.Text = "Log";
            g.Dock = DockStyle.Fill;
            g.Margin = new Padding(0);

            _txtLog = new TextBox();
            _txtLog.Multiline = true;
            _txtLog.ReadOnly = true;
            _txtLog.WordWrap = false;
            _txtLog.ScrollBars = ScrollBars.Both;
            _txtLog.BackColor = Color.FromArgb(252, 252, 252);
            _txtLog.Font = new Font("Consolas", 9f);
            _txtLog.Dock = DockStyle.Fill;

            Panel indre = new Panel();
            indre.Dock = DockStyle.Fill;
            indre.Padding = new Padding(8, 4, 8, 8);
            indre.Controls.Add(_txtLog);
            g.Controls.Add(indre);
            return g;
        }

        private Control OpretHoejre()
        {
            TableLayoutPanel t = Gitter(1, 5);
            t.Margin = new Padding(10, 0, 0, 0);
            t.AutoScroll = true;
            t.RowStyles.Add(new RowStyle(SizeType.Absolute, 94));
            t.RowStyles.Add(new RowStyle(SizeType.Absolute, 70));
            t.RowStyles.Add(new RowStyle(SizeType.Absolute, 70));
            t.RowStyles.Add(new RowStyle(SizeType.Absolute, 136));
            t.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

            // Format
            GroupBox gf = new GroupBox();
            gf.Text = "Format";
            gf.Dock = DockStyle.Fill;
            gf.Margin = new Padding(0, 0, 0, 6);
            FlowLayoutPanel ff = new FlowLayoutPanel();
            ff.Dock = DockStyle.Fill;
            ff.Padding = new Padding(6, 2, 4, 2);
            ff.WrapContents = true;
            _chkHtml = Kryds("HTML (.html)");
            _chkWord = Kryds("Word (.docx)");
            _chkPdf = Kryds("PDF (Typst)");
            ff.Controls.Add(_chkHtml);
            ff.Controls.Add(_chkWord);
            ff.Controls.Add(_chkPdf);
            gf.Controls.Add(ff);
            t.Controls.Add(gf, 0, 0);

            // Word-skabelon
            GroupBox gw = new GroupBox();
            gw.Text = "Word-skabelon (reference-doc)";
            gw.Dock = DockStyle.Fill;
            gw.Margin = new Padding(0, 0, 0, 6);
            TableLayoutPanel tw = Gitter(2, 1);
            tw.Padding = new Padding(8, 6, 8, 4);
            tw.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            tw.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            _txtWord = new TextBox();
            _txtWord.Anchor = AnchorStyles.Left | AnchorStyles.Right;
            _txtWord.Margin = new Padding(0, 4, 4, 3);
            tw.Controls.Add(_txtWord, 0, 0);
            _btnWord = Knap("Vælg ...");
            _btnWord.Margin = new Padding(0, 2, 0, 2);
            _btnWord.Click += VaelgWordskabelon;
            tw.Controls.Add(_btnWord, 1, 0);
            gw.Controls.Add(tw);
            t.Controls.Add(gw, 0, 1);

            // Outputmappe
            GroupBox go = new GroupBox();
            go.Text = "Outputmappe for enkelte filer";
            go.Dock = DockStyle.Fill;
            go.Margin = new Padding(0, 0, 0, 6);
            TableLayoutPanel to = Gitter(2, 1);
            to.Padding = new Padding(8, 6, 8, 4);
            to.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            to.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            _txtOutput = new TextBox();
            _txtOutput.Anchor = AnchorStyles.Left | AnchorStyles.Right;
            _txtOutput.Margin = new Padding(0, 4, 4, 3);
            to.Controls.Add(_txtOutput, 0, 0);
            _btnOutput = Knap("Vælg ...");
            _btnOutput.Margin = new Padding(0, 2, 0, 2);
            _btnOutput.Click += VaelgOutputmappe;
            to.Controls.Add(_btnOutput, 1, 0);
            go.Controls.Add(to);
            t.Controls.Add(go, 0, 2);

            // Enkelte filer
            GroupBox ge = new GroupBox();
            ge.Text = "Enkelte filer";
            ge.Dock = DockStyle.Fill;
            ge.Margin = new Padding(0, 0, 0, 6);
            TableLayoutPanel te = Gitter(1, 3);
            te.Padding = new Padding(8, 4, 8, 4);
            te.RowStyles.Add(new RowStyle(SizeType.AutoSize));
            te.RowStyles.Add(new RowStyle(SizeType.AutoSize));
            te.RowStyles.Add(new RowStyle(SizeType.AutoSize));
            _chkSamlet = Kryds("Kombinér til én fil med sideskift");
            _chkSamlet.CheckedChanged += delegate { OpdaterTilstand(); };
            te.Controls.Add(_chkSamlet, 0, 0);
            FlowLayoutPanel fn = new FlowLayoutPanel();
            fn.AutoSize = true;
            fn.AutoSizeMode = AutoSizeMode.GrowAndShrink;
            fn.Margin = new Padding(22, 0, 0, 0);
            Label ln = Etikette("Filnavn");
            ln.Margin = new Padding(0, 7, 8, 3);
            fn.Controls.Add(ln);
            _txtSamletnavn = new TextBox();
            _txtSamletnavn.Width = 170;
            _txtSamletnavn.Margin = new Padding(0, 4, 0, 3);
            fn.Controls.Add(_txtSamletnavn);
            te.Controls.Add(fn, 0, 1);
            _chkIndlejr = Kryds("HTML som én selvstændig fil");
            te.Controls.Add(_chkIndlejr, 0, 2);
            ge.Controls.Add(te);
            t.Controls.Add(ge, 0, 3);

            return t;
        }

        private Control OpretKnapper()
        {
            TableLayoutPanel t = Gitter(4, 1);
            t.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            t.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            t.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            t.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));

            _btnRender = Knap("Render");
            _btnRender.Font = new Font(Font, FontStyle.Bold);
            _btnRender.Padding = new Padding(28, 6, 28, 6);
            _btnRender.Margin = new Padding(0, 2, 8, 2);
            _btnRender.Click += Render;
            t.Controls.Add(_btnRender, 0, 0);

            _btnAfbryd = Knap("Afbryd");
            _btnAfbryd.Padding = new Padding(14, 6, 14, 6);
            _btnAfbryd.Enabled = false;
            _btnAfbryd.Margin = new Padding(0, 2, 12, 2);
            _btnAfbryd.Click += delegate { if (_koerer != null) _koerer.Afbryd(); };
            t.Controls.Add(_btnAfbryd, 1, 0);

            _bjaelke = new ProgressBar();
            _bjaelke.Style = ProgressBarStyle.Continuous;
            _bjaelke.Anchor = AnchorStyles.Left | AnchorStyles.Right;
            _bjaelke.Height = 20;
            _bjaelke.Margin = new Padding(0, 11, 12, 11);
            t.Controls.Add(_bjaelke, 2, 0);

            _btnAabn = Knap("Åbn outputmappen");
            _btnAabn.Padding = new Padding(14, 6, 14, 6);
            _btnAabn.Anchor = AnchorStyles.Right;
            _btnAabn.Margin = new Padding(0, 2, 0, 2);
            _btnAabn.Click += delegate { AabnOutput(); };
            t.Controls.Add(_btnAabn, 3, 0);

            return t;
        }

        // ------------------------------------------------------- indstillinger

        private void HentIndstillinger()
        {
            _chkHtml.Checked = _indst.HentTilvalg(Indstillinger.FormatHtml, true);
            _chkWord.Checked = _indst.HentTilvalg(Indstillinger.FormatWord, false);
            _chkPdf.Checked = _indst.HentTilvalg(Indstillinger.FormatPdf, false);
            _chkSamlet.Checked = _indst.HentTilvalg(Indstillinger.SamletFil, false);
            _chkIndlejr.Checked = _indst.HentTilvalg(Indstillinger.IndlejrHtml, true);
            _chkKopi.Checked = _indst.HentTilvalg(Indstillinger.ByggIKopi, true);
            _txtOutput.Text = _indst.Hent(Indstillinger.Outputmappe, "");
            _txtWord.Text = _indst.Hent(Indstillinger.Wordskabelon, "");
            _txtSamletnavn.Text = _indst.Hent(Indstillinger.SamletNavn, "samlet");
        }

        private void GemIndstillinger()
        {
            _indst.Saet(Indstillinger.SidsteMappe, _txtMappe.Text);
            _indst.Saet(Indstillinger.SidsteProfil, ValgtProfil());
            _indst.Saet(Indstillinger.Outputmappe, _txtOutput.Text);
            _indst.Saet(Indstillinger.Wordskabelon, _txtWord.Text);
            _indst.Saet(Indstillinger.SamletNavn, _txtSamletnavn.Text);
            _indst.SaetTilvalg(Indstillinger.FormatHtml, _chkHtml.Checked);
            _indst.SaetTilvalg(Indstillinger.FormatWord, _chkWord.Checked);
            _indst.SaetTilvalg(Indstillinger.FormatPdf, _chkPdf.Checked);
            _indst.SaetTilvalg(Indstillinger.SamletFil, _chkSamlet.Checked);
            _indst.SaetTilvalg(Indstillinger.IndlejrHtml, _chkIndlejr.Checked);
            _indst.SaetTilvalg(Indstillinger.ByggIKopi, _chkKopi.Checked);
            _indst.Gem();
        }

        private void FindQuarto()
        {
            _quarto = Quartolokator.Find();
            if (_quarto != null)
            {
                _lblQuarto.Text = "Quarto: " + _quarto;
                _lblQuarto.ForeColor = Daempet;
                _lnkQuarto.Visible = false;
                return;
            }
            _lblQuarto.Text = "Quarto blev ikke fundet. Der er ledt i PATH, i Programs\\Quarto og i Program Files.";
            _lblQuarto.ForeColor = Advarsel;
            _lnkQuarto.Visible = true;
            _btnRender.Enabled = false;
        }

        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            if (_trae.CanFocus) _trae.Focus();
            if (_quarto == null)
                MessageBox.Show(this,
                    "Quarto blev ikke fundet på computeren.\r\n\r\n" +
                    "Der er ledt i PATH, i\r\n%LOCALAPPDATA%\\Programs\\Quarto\\bin\\quarto.exe\r\n" +
                    "og i %ProgramFiles%\\Quarto\\bin\\quarto.exe.\r\n\r\n" +
                    "Hent Quarto på " + Quartolokator.Hjemmeside + " og start programmet igen.",
                    "Quarto mangler", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }

        // ------------------------------------------------------------- mappen

        private void VaelgMappe(object afsender, EventArgs e)
        {
            using (FolderBrowserDialog d = new FolderBrowserDialog())
            {
                d.Description = "Vælg mappen med Quarto-projektet eller filerne";
                d.ShowNewFolderButton = false;
                if (_txtMappe.Text.Length > 0 && Directory.Exists(_txtMappe.Text))
                    d.SelectedPath = _txtMappe.Text;
                if (d.ShowDialog(this) != DialogResult.OK) return;
                IndlaesMappe(d.SelectedPath, true);
            }
        }

        private void IndlaesMappe(string mappe, bool spoerg)
        {
            Cursor = Cursors.WaitCursor;
            try
            {
                _txtMappe.Text = mappe;
                _opdaterer = true;
                _projekt = Kvartoprojekt.Laes(mappe, "");
                OpdaterProfilliste();
                _opdaterer = false;

                string profil = ValgtProfil();
                if (profil.Length > 0) _projekt = Kvartoprojekt.Laes(mappe, profil);

                _filer = Filfinder.Find(mappe);

                bool bogfundet = _projekt != null && _projekt.ErBog && _projekt.Poster.Count > 0;
                _opdaterer = true;
                _rdoBog.Enabled = bogfundet;
                if (bogfundet) _rdoBog.Checked = true;
                else _rdoFiler.Checked = true;
                _opdaterer = false;

                if (_txtOutput.Text.Trim().Length == 0)
                    _txtOutput.Text = Path.Combine(mappe, "_ud");

                OpdaterProjektinfo();
                OpdaterTrae();
                VisDropbox(Filhjaelp.LiggerIDropbox(mappe), spoerg);
            }
            finally
            {
                Cursor = Cursors.Default;
            }
        }

        private void OpdaterProfilliste()
        {
            List<string> profiler = _projekt == null ? new List<string>() : _projekt.Profiler;
            _cmbProfil.Items.Clear();
            _cmbProfil.Items.Add("Standard");
            foreach (string p in profiler) _cmbProfil.Items.Add(p);
            bool vis = profiler.Count > 0;
            _cmbProfil.Visible = vis;
            _lblProfil.Visible = vis;

            string husket = _indst.Hent(Indstillinger.SidsteProfil, "");
            int valg = 0;
            for (int i = 1; i < _cmbProfil.Items.Count; i++)
                if (string.Equals(Convert.ToString(_cmbProfil.Items[i]), husket, StringComparison.OrdinalIgnoreCase))
                    valg = i;
            _cmbProfil.SelectedIndex = valg;
        }

        private string ValgtProfil()
        {
            if (_cmbProfil == null || _cmbProfil.SelectedIndex <= 0) return "";
            return Convert.ToString(_cmbProfil.SelectedItem);
        }

        private void SkiftProfil(object afsender, EventArgs e)
        {
            if (_opdaterer) return;
            if (_txtMappe.Text.Length == 0 || !Directory.Exists(_txtMappe.Text)) return;
            _projekt = Kvartoprojekt.Laes(_txtMappe.Text, ValgtProfil());
            OpdaterProjektinfo();
            OpdaterTrae();
        }

        private void SkiftTilstand(object afsender, EventArgs e)
        {
            if (_opdaterer) return;
            OpdaterTrae();
        }

        private void VisDropbox(bool vis, bool spoerg)
        {
            _pnlDropbox.Visible = vis;
            _rod.RowStyles[1].Height = vis ? 56 : 0;
            if (!vis || !spoerg) return;
            DialogResult svar = MessageBox.Show(this,
                "Mappen ligger i Dropbox.\r\n\r\n" +
                "Rendering kan fejle, fordi Dropbox låser filer, mens den synkroniserer.\r\n\r\n" +
                "Skal programmet bygge i en midlertidig kopi og kopiere resultatet tilbage bagefter?",
                "Mappen synkroniseres", MessageBoxButtons.YesNo, MessageBoxIcon.Warning);
            _chkKopi.Checked = svar == DialogResult.Yes;
        }

        private void OpdaterProjektinfo()
        {
            if (_txtMappe.Text.Length == 0)
            {
                _lblProjekt.Text = "Vælg en mappe med en Quarto-bog eller med .qmd-filer.";
                return;
            }
            if (_projekt != null && _projekt.ErBog && _projekt.Poster.Count > 0)
            {
                List<Bogpost> filer = new List<Bogpost>();
                Kvartoprojekt.SamlFiler(_projekt.Poster, filer);
                _lblProjekt.Text = "Bog: " + _projekt.Titel + "   ·   " + filer.Count
                                   + " kapitler   ·   output i " + _projekt.Outputmappe;
                return;
            }
            if (_projekt != null && _projekt.HarProjektfil)
            {
                _lblProjekt.Text = "Quarto-projekt uden bogstruktur   ·   " + _filer.Count + " filer i mappetræet";
                return;
            }
            _lblProjekt.Text = "Ingen _quarto.yml i mappen   ·   " + _filer.Count + " filer i mappetræet";
        }

        // -------------------------------------------------------------- træet

        private void OpdaterTrae()
        {
            _opdaterer = true;
            _trae.BeginUpdate();
            _trae.Nodes.Clear();

            bool bog = _rdoBog.Checked && _projekt != null && _projekt.ErBog;
            if (bog)
            {
                foreach (Bogpost post in _projekt.Poster) _trae.Nodes.Add(BogNode(post));
                _lblVink.Text = "Alle kapitler valgt: hele bogen bygges samlet. Færre valgt: kun de valgte kapitler.";
            }
            else
            {
                Dictionary<string, TreeNode> mapper =
                    new Dictionary<string, TreeNode>(StringComparer.OrdinalIgnoreCase);
                foreach (Fundetfil f in _filer)
                {
                    TreeNode node = new TreeNode(f.Titel + "   ·   " + Path.GetFileName(f.Relativsti));
                    node.Tag = f;
                    if (f.Mappe.Length == 0)
                    {
                        _trae.Nodes.Add(node);
                        continue;
                    }
                    TreeNode forael;
                    if (!mapper.TryGetValue(f.Mappe, out forael))
                    {
                        forael = new TreeNode(f.Mappe);
                        forael.NodeFont = new Font(Font, FontStyle.Bold);
                        mapper[f.Mappe] = forael;
                        _trae.Nodes.Add(forael);
                    }
                    forael.Nodes.Add(node);
                }
                _lblVink.Text = "Filer uden YAML-hoved får en titel fra deres første overskrift.";
            }

            _trae.ExpandAll();
            if (_trae.Nodes.Count > 0) _trae.Nodes[0].EnsureVisible();
            _trae.EndUpdate();
            _opdaterer = false;

            SaetAlle(bog);
        }

        private TreeNode BogNode(Bogpost post)
        {
            string tekst;
            if (post.ErDel && post.Sti == null) tekst = post.Titel;
            else if (!post.Findes) tekst = post.Titel + "   ·   " + post.Relativ + "   (filen mangler)";
            else tekst = post.Titel + "   ·   " + post.Relativ;

            TreeNode node = new TreeNode(tekst);
            node.Tag = post;
            if (post.ErDel && post.Sti == null)
            {
                node.NodeFont = new Font(Font, FontStyle.Bold);
                node.Tag = null;
            }
            if (post.Sti != null && !post.Findes) node.ForeColor = Advarsel;
            foreach (Bogpost barn in post.Boern) node.Nodes.Add(BogNode(barn));
            return node;
        }

        private void TraeKryds(object afsender, TreeViewEventArgs e)
        {
            if (_opdaterer) return;
            _opdaterer = true;
            SaetBoern(e.Node, e.Node.Checked);
            TreeNode forael = e.Node.Parent;
            while (forael != null)
            {
                bool alle = forael.Nodes.Count > 0;
                foreach (TreeNode barn in forael.Nodes)
                    if (!barn.Checked) { alle = false; break; }
                forael.Checked = alle;
                forael = forael.Parent;
            }
            _opdaterer = false;
            OpdaterTilstand();
        }

        private void SaetBoern(TreeNode node, bool vaerdi)
        {
            foreach (TreeNode barn in node.Nodes)
            {
                barn.Checked = vaerdi;
                SaetBoern(barn, vaerdi);
            }
        }

        private void SaetAlle(bool vaerdi)
        {
            _opdaterer = true;
            foreach (TreeNode node in _trae.Nodes) SaetGren(node, vaerdi);
            _opdaterer = false;
            OpdaterTilstand();
        }

        private void SaetGren(TreeNode node, bool vaerdi)
        {
            node.Checked = vaerdi;
            foreach (TreeNode barn in node.Nodes) SaetGren(barn, vaerdi);
        }

        private List<string> ValgteFiler()
        {
            List<string> valgte = new List<string>();
            SamlFiler(_trae.Nodes, valgte, true);
            return valgte;
        }

        private int AntalMulige()
        {
            List<string> alle = new List<string>();
            SamlFiler(_trae.Nodes, alle, false);
            return alle.Count;
        }

        private void SamlFiler(TreeNodeCollection noder, List<string> maal, bool kunValgte)
        {
            foreach (TreeNode node in noder)
            {
                if (node.Tag != null && (node.Checked || !kunValgte))
                {
                    Bogpost post = node.Tag as Bogpost;
                    if (post != null && post.Sti != null && post.Findes && !maal.Contains(post.Sti))
                        maal.Add(post.Sti);
                    Fundetfil fil = node.Tag as Fundetfil;
                    if (fil != null && !maal.Contains(fil.Fuldsti)) maal.Add(fil.Fuldsti);
                }
                SamlFiler(node.Nodes, maal, kunValgte);
            }
        }

        private void OpdaterTilstand()
        {
            int valgt = ValgteFiler().Count;
            int muligt = AntalMulige();
            _lblAntal.Text = valgt + " af " + muligt + " filer valgt";

            bool bog = _rdoBog.Checked && _projekt != null && _projekt.ErBog;
            _chkSamlet.Enabled = !bog;
            _txtSamletnavn.Enabled = !bog && _chkSamlet.Checked;
            _txtOutput.Enabled = !bog;
            _btnOutput.Enabled = !bog;
            _chkIndlejr.Enabled = !bog;
        }

        // ------------------------------------------------------------- render

        private void VaelgOutputmappe(object afsender, EventArgs e)
        {
            using (FolderBrowserDialog d = new FolderBrowserDialog())
            {
                d.Description = "Vælg mappen hvor de færdige filer skal lægges";
                if (_txtOutput.Text.Length > 0 && Directory.Exists(_txtOutput.Text))
                    d.SelectedPath = _txtOutput.Text;
                if (d.ShowDialog(this) == DialogResult.OK) _txtOutput.Text = d.SelectedPath;
            }
        }

        private void VaelgWordskabelon(object afsender, EventArgs e)
        {
            using (OpenFileDialog d = new OpenFileDialog())
            {
                d.Title = "Vælg Word-skabelon";
                d.Filter = "Word-dokument (*.docx)|*.docx|Alle filer (*.*)|*.*";
                if (_txtWord.Text.Length > 0 && File.Exists(_txtWord.Text)) d.FileName = _txtWord.Text;
                if (d.ShowDialog(this) == DialogResult.OK) _txtWord.Text = d.FileName;
            }
        }

        private void Render(object afsender, EventArgs e)
        {
            if (_quarto == null) return;
            string mappe = _txtMappe.Text;
            if (mappe.Length == 0 || !Directory.Exists(mappe))
            {
                Sig("Vælg først en projektmappe.", "Ingen mappe");
                return;
            }
            if (!_chkHtml.Checked && !_chkWord.Checked && !_chkPdf.Checked)
            {
                Sig("Vælg mindst ét format.", "Intet format");
                return;
            }

            Renderoensker oe = new Renderoensker();
            oe.Projektmappe = mappe;
            oe.Profil = ValgtProfil();
            oe.Bogtilstand = _rdoBog.Checked && _projekt != null && _projekt.ErBog;
            oe.Bogudmappe = _projekt == null ? "" : _projekt.Outputmappe;
            oe.Filer = ValgteFiler();
            oe.HeleBogen = oe.Bogtilstand && oe.Filer.Count > 0 && oe.Filer.Count == AntalMulige();
            oe.Html = _chkHtml.Checked;
            oe.Word = _chkWord.Checked;
            oe.Pdf = _chkPdf.Checked;
            oe.IndlejrHtml = _chkIndlejr.Checked;
            oe.Samlet = _chkSamlet.Checked;
            oe.Samletnavn = _txtSamletnavn.Text.Trim();
            oe.Outputmappe = _txtOutput.Text.Trim();
            oe.Wordskabelon = _txtWord.Text.Trim();
            oe.Kopi = _pnlDropbox.Visible && _chkKopi.Checked;

            if (oe.Filer.Count == 0)
            {
                Sig("Sæt kryds ved mindst én fil.", "Ingen filer valgt");
                return;
            }
            if (!oe.Bogtilstand && oe.Outputmappe.Length == 0)
            {
                Sig("Vælg en outputmappe til de enkelte filer.", "Ingen outputmappe");
                return;
            }

            GemIndstillinger();
            Start(oe);
        }

        private void Sig(string tekst, string titel)
        {
            MessageBox.Show(this, tekst, titel, MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void Start(Renderoensker oe)
        {
            _txtLog.Clear();
            Log("Quarto: " + _quarto);
            Log("Mappe:  " + oe.Projektmappe);
            if (oe.Profil.Length > 0) Log("Udgave: " + oe.Profil);
            _btnRender.Enabled = false;
            _btnAfbryd.Enabled = true;
            _btnVaelg.Enabled = false;
            _bjaelke.Style = ProgressBarStyle.Marquee;

            _traad = new Thread(delegate()
            {
                bool ok = false;
                string aabn = null;
                try
                {
                    Renderplan plan = Renderplan.Byg(oe, Log);
                    aabn = plan.Aabnmappe;
                    if (plan.Fejl.Count > 0)
                    {
                        foreach (string fejl in plan.Fejl) Log("FEJL: " + fejl);
                    }
                    else
                    {
                        _koerer = new Koerer(_quarto, Log);
                        ok = _koerer.Koer(plan);
                    }
                }
                catch (Exception f)
                {
                    Log("FEJL: " + f.Message);
                }
                bool svar = ok;
                string mappe = aabn;
                Kald(delegate { Faerdig(svar, mappe); });
            });
            _traad.IsBackground = true;
            _traad.Start();
        }

        private void Faerdig(bool ok, string aabn)
        {
            _btnRender.Enabled = _quarto != null;
            _btnAfbryd.Enabled = false;
            _btnVaelg.Enabled = true;
            _bjaelke.Style = ProgressBarStyle.Continuous;
            _bjaelke.Value = 0;
            Log("");
            if (_koerer != null && _koerer.Afbrudt) Log("Afbrudt.");
            else if (ok) Log("Færdig.");
            else Log("Færdig med fejl. Læs loggen ovenfor.");
            _koerer = null;
            if (!string.IsNullOrEmpty(aabn)) _sidsteUdmappe = aabn;
            if (ok && !string.IsNullOrEmpty(aabn) && Directory.Exists(aabn)) Aabn(aabn);
        }

        private void AabnOutput()
        {
            string mappe = _sidsteUdmappe;
            if (string.IsNullOrEmpty(mappe))
            {
                bool bog = _rdoBog.Checked && _projekt != null && _projekt.ErBog;
                mappe = bog && _txtMappe.Text.Length > 0
                    ? Path.Combine(_txtMappe.Text, _projekt.Outputmappe.Replace('/', '\\'))
                    : _txtOutput.Text;
            }
            if (string.IsNullOrEmpty(mappe) || !Directory.Exists(mappe))
            {
                Sig("Outputmappen findes ikke endnu. Kør en render først.", "Ingen mappe");
                return;
            }
            Aabn(mappe);
        }

        private void Aabn(string sti)
        {
            try
            {
                ProcessStartInfo start = new ProcessStartInfo(sti);
                start.UseShellExecute = true;
                Process.Start(start);
            }
            catch (Exception f)
            {
                MessageBox.Show(this, "Kunne ikke åbne " + sti + "\r\n" + f.Message, "Fejl",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void Log(string linje)
        {
            if (IsDisposed || !IsHandleCreated) return;
            if (InvokeRequired)
            {
                Kald(delegate { Log(linje); });
                return;
            }
            _txtLog.AppendText(linje + Environment.NewLine);
        }

        private void Kald(MethodInvoker handling)
        {
            try
            {
                if (IsDisposed || !IsHandleCreated) return;
                BeginInvoke(handling);
            }
            catch (Exception)
            {
                // Vinduet blev lukket, mens der blev renderet.
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (_koerer != null)
            {
                DialogResult svar = MessageBox.Show(this,
                    "Der køres stadig en render. Skal den afbrydes?", "Luk programmet",
                    MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                if (svar != DialogResult.Yes)
                {
                    e.Cancel = true;
                    return;
                }
                _koerer.Afbryd();
            }
            GemIndstillinger();
            base.OnFormClosing(e);
        }
    }
}
