using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace QuartoRenderMaster
{
    // Smaa filhjaelpere: relative stier, mappekopiering og Dropbox-genkendelse.
    internal static class Filhjaelp
    {
        // Mapper der aldrig vises og aldrig kopieres med.
        public static readonly string[] SkjulteMapper =
        {
            "_bog", ".quarto", "arkiv", "_ud", "_book", "_site", "_freeze",
            ".git", "node_modules", ".Rproj.user"
        };

        public static bool ErSkjultMappe(string navn)
        {
            if (string.IsNullOrEmpty(navn)) return true;
            if (navn[0] == '.') return true;
            foreach (string s in SkjulteMapper)
                if (string.Equals(navn, s, StringComparison.OrdinalIgnoreCase)) return true;
            return false;
        }

        // Sti fra en mappe til en fil, med skraastreger som markdown bruger.
        public static string RelativSti(string fraMappe, string maal)
        {
            try
            {
                string mappe = fraMappe;
                if (!mappe.EndsWith("\\") && !mappe.EndsWith("/")) mappe += "\\";
                Uri fra = new Uri(mappe);
                Uri til = new Uri(maal);
                string rel = Uri.UnescapeDataString(fra.MakeRelativeUri(til).ToString());
                return rel.Replace('\\', '/');
            }
            catch (Exception)
            {
                return maal.Replace('\\', '/');
            }
        }

        // Den mappe som alle stierne har til faelles.
        public static string FaellesMappe(List<string> filer, string standard)
        {
            if (filer == null || filer.Count == 0) return standard;
            string faelles = Path.GetDirectoryName(Path.GetFullPath(filer[0]));
            foreach (string f in filer)
            {
                string mappe = Path.GetDirectoryName(Path.GetFullPath(f));
                while (faelles.Length > 0 && !ErUnder(faelles, mappe))
                {
                    string op = Path.GetDirectoryName(faelles);
                    if (string.IsNullOrEmpty(op) || op == faelles) break;
                    faelles = op;
                }
            }
            return string.IsNullOrEmpty(faelles) ? standard : faelles;
        }

        public static bool ErUnder(string mappe, string sti)
        {
            string m = Path.GetFullPath(mappe).TrimEnd('\\', '/');
            string s = Path.GetFullPath(sti).TrimEnd('\\', '/');
            if (string.Equals(m, s, StringComparison.OrdinalIgnoreCase)) return true;
            return s.StartsWith(m + "\\", StringComparison.OrdinalIgnoreCase);
        }

        public static void KopierMappe(string fra, string til, bool springSkjulteOver)
        {
            Directory.CreateDirectory(til);
            foreach (string fil in Directory.GetFiles(fra))
            {
                string navn = Path.GetFileName(fil);
                if (springSkjulteOver && navn.StartsWith(".")) continue;
                File.Copy(fil, Path.Combine(til, navn), true);
            }
            foreach (string mappe in Directory.GetDirectories(fra))
            {
                string navn = Path.GetFileName(mappe);
                if (springSkjulteOver && ErSkjultMappe(navn)) continue;
                KopierMappe(mappe, Path.Combine(til, navn), springSkjulteOver);
            }
        }

        public static void RydMappe(string mappe)
        {
            try
            {
                if (Directory.Exists(mappe)) Directory.Delete(mappe, true);
            }
            catch (Exception)
            {
                // En laast fil i den midlertidige mappe maa ikke stoppe renderingen.
            }
        }

        public static void SletStille(string sti)
        {
            try
            {
                if (sti != null && File.Exists(sti)) File.Delete(sti);
            }
            catch (Exception)
            {
            }
        }

        // Dropbox-mapperne paa maskinen, laest af Dropbox' egen info.json.
        public static List<string> Dropboxmapper()
        {
            List<string> mapper = new List<string>();
            string[] steder =
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Dropbox\info.json"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), @"Dropbox\info.json")
            };
            foreach (string sted in steder)
            {
                try
                {
                    if (!File.Exists(sted)) continue;
                    string tekst = File.ReadAllText(sted, Encoding.UTF8);
                    int i = 0;
                    while (true)
                    {
                        int start = tekst.IndexOf("\"path\"", i, StringComparison.OrdinalIgnoreCase);
                        if (start < 0) break;
                        int koln = tekst.IndexOf(':', start);
                        int a = tekst.IndexOf('"', koln + 1);
                        int b = a < 0 ? -1 : tekst.IndexOf('"', a + 1);
                        if (a < 0 || b < 0) break;
                        string sti = tekst.Substring(a + 1, b - a - 1).Replace("\\\\", "\\");
                        if (sti.Length > 0) mapper.Add(sti);
                        i = b + 1;
                    }
                }
                catch (Exception)
                {
                }
            }
            return mapper;
        }

        public static bool LiggerIDropbox(string mappe)
        {
            if (string.IsNullOrEmpty(mappe)) return false;
            foreach (string rod in Dropboxmapper())
            {
                try
                {
                    if (ErUnder(rod, mappe)) return true;
                }
                catch (Exception)
                {
                }
            }
            string fuld = mappe.Replace('/', '\\');
            return fuld.IndexOf("\\Dropbox\\", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        public static string SikkertFilnavn(string navn)
        {
            if (string.IsNullOrEmpty(navn)) return "dokument";
            StringBuilder sb = new StringBuilder();
            char[] ulovlige = Path.GetInvalidFileNameChars();
            foreach (char c in navn)
            {
                bool ok = true;
                foreach (char u in ulovlige)
                    if (c == u) { ok = false; break; }
                sb.Append(ok ? c : '-');
            }
            string rent = sb.ToString().Trim();
            return rent.Length == 0 ? "dokument" : rent;
        }
    }
}
