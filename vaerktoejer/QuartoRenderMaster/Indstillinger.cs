using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace QuartoRenderMaster
{
    // Husker brugerens valg mellem programkoersler.
    // Filen ligger i %APPDATA%\QuartoRenderMaster\indstillinger.ini.
    internal class Indstillinger
    {
        public const string SidsteMappe = "sidste-mappe";
        public const string SidsteProfil = "sidste-profil";
        public const string Outputmappe = "output-mappe";
        public const string Wordskabelon = "word-skabelon";
        public const string FormatHtml = "format-html";
        public const string FormatWord = "format-word";
        public const string FormatPdf = "format-pdf";
        public const string SamletFil = "samlet-fil";
        public const string SamletNavn = "samlet-navn";
        public const string IndlejrHtml = "indlejr-html";
        public const string ByggIKopi = "byg-i-kopi";

        private readonly Dictionary<string, string> _vaerdier =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private readonly string _filsti;

        public Indstillinger()
        {
            string mappe = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "QuartoRenderMaster");
            _filsti = Path.Combine(mappe, "indstillinger.ini");
            Laes();
        }

        private void Laes()
        {
            try
            {
                if (!File.Exists(_filsti)) return;
                foreach (string linje in File.ReadAllLines(_filsti, Encoding.UTF8))
                {
                    string t = linje.Trim();
                    if (t.Length == 0 || t[0] == '#') continue;
                    int lig = t.IndexOf('=');
                    if (lig <= 0) continue;
                    _vaerdier[t.Substring(0, lig).Trim()] = t.Substring(lig + 1).Trim();
                }
            }
            catch (Exception)
            {
                // En ulaeselig indstillingsfil maa ikke stoppe programmet.
            }
        }

        public string Hent(string noegle, string standard)
        {
            string v;
            if (_vaerdier.TryGetValue(noegle, out v) && v != null) return v;
            return standard;
        }

        public bool HentTilvalg(string noegle, bool standard)
        {
            string v = Hent(noegle, null);
            if (v == null) return standard;
            return v == "1" || string.Equals(v, "ja", StringComparison.OrdinalIgnoreCase);
        }

        public void Saet(string noegle, string vaerdi)
        {
            _vaerdier[noegle] = vaerdi == null ? "" : vaerdi;
        }

        public void SaetTilvalg(string noegle, bool vaerdi)
        {
            _vaerdier[noegle] = vaerdi ? "1" : "0";
        }

        public void Gem()
        {
            try
            {
                string mappe = Path.GetDirectoryName(_filsti);
                if (!Directory.Exists(mappe)) Directory.CreateDirectory(mappe);
                StringBuilder sb = new StringBuilder();
                sb.AppendLine("# Quarto Render Master husker dine valg her.");
                foreach (KeyValuePair<string, string> p in _vaerdier)
                    sb.AppendLine(p.Key + "=" + p.Value);
                File.WriteAllText(_filsti, sb.ToString(), new UTF8Encoding(false));
            }
            catch (Exception)
            {
                // Kan ikke gemmes (fx laast fil). Programmet koerer videre.
            }
        }
    }
}
