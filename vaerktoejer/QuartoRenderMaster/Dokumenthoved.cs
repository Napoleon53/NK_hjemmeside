using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace QuartoRenderMaster
{
    // Alt om YAML-hovedet i en .qmd-fil: om der er et, hvad filen hedder,
    // og hvordan der laves et hoved til en fil der ingen har.
    internal static class Dokumenthoved
    {
        public static string LaesTekst(string sti)
        {
            try
            {
                return File.ReadAllText(sti, Encoding.UTF8);
            }
            catch (Exception)
            {
                return "";
            }
        }

        public static bool HarHoved(string sti)
        {
            try
            {
                using (StreamReader l = new StreamReader(sti, Encoding.UTF8, true))
                {
                    string linje;
                    while ((linje = l.ReadLine()) != null)
                    {
                        if (linje.Trim().Length == 0) continue;
                        return linje.TrimEnd() == "---";
                    }
                }
            }
            catch (Exception)
            {
            }
            return false;
        }

        // Titlen som brugeren skal se: fra hovedet, ellers foerste overskrift,
        // ellers filnavnet.
        public static string HentTitel(string sti)
        {
            string fraHoved = TitelIHoved(sti);
            if (!string.IsNullOrEmpty(fraHoved)) return fraHoved;
            string overskrift = FoersteOverskrift(sti);
            if (!string.IsNullOrEmpty(overskrift)) return overskrift;
            try
            {
                return Path.GetFileNameWithoutExtension(sti);
            }
            catch (Exception)
            {
                return sti;
            }
        }

        public static string TitelIHoved(string sti)
        {
            if (!HarHoved(sti)) return null;
            try
            {
                List<string> hoved = new List<string>();
                using (StreamReader l = new StreamReader(sti, Encoding.UTF8, true))
                {
                    string linje;
                    bool startet = false;
                    while ((linje = l.ReadLine()) != null)
                    {
                        if (!startet)
                        {
                            if (linje.Trim().Length == 0) continue;
                            startet = true;
                            continue;
                        }
                        if (linje.TrimEnd() == "---" || linje.TrimEnd() == "...") break;
                        hoved.Add(linje);
                    }
                }
                Ynode node = Yamllaeser.Laes(hoved.ToArray());
                if (node == null) return null;
                string titel = node.Tekst("title");
                return string.IsNullOrEmpty(titel) ? null : titel;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static string FoersteOverskrift(string sti)
        {
            try
            {
                using (StreamReader l = new StreamReader(sti, Encoding.UTF8, true))
                {
                    string linje;
                    bool iHoved = false;
                    bool foersteLinje = true;
                    bool iKodeblok = false;
                    while ((linje = l.ReadLine()) != null)
                    {
                        string t = linje.Trim();
                        if (foersteLinje && t == "---") { iHoved = true; foersteLinje = false; continue; }
                        if (t.Length > 0) foersteLinje = false;
                        if (iHoved)
                        {
                            if (t == "---" || t == "...") iHoved = false;
                            continue;
                        }
                        if (t.StartsWith("```")) { iKodeblok = !iKodeblok; continue; }
                        if (iKodeblok) continue;
                        if (t.StartsWith("# ")) return RensOverskrift(t.Substring(2));
                    }
                }
            }
            catch (Exception)
            {
            }
            return null;
        }

        private static string RensOverskrift(string tekst)
        {
            string t = tekst.Trim();
            // Fjern et eventuelt {#id .klasse}-vedhaeng bagerst i overskriften.
            int krolle = t.LastIndexOf('{');
            if (krolle > 0 && t.EndsWith("}")) t = t.Substring(0, krolle).Trim();
            t = t.Replace("**", "").Replace("*", "").Replace("`", "");
            return t.Trim();
        }

        // Filens tekst uden YAML-hoved.
        public static string Krop(string sti)
        {
            string tekst = LaesTekst(sti);
            if (!HarHoved(sti)) return tekst;
            string[] linjer = tekst.Replace("\r\n", "\n").Split('\n');
            int i = 0;
            while (i < linjer.Length && linjer[i].Trim().Length == 0) i++;
            if (i < linjer.Length && linjer[i].TrimEnd() == "---") i++;
            while (i < linjer.Length && linjer[i].TrimEnd() != "---" && linjer[i].TrimEnd() != "...") i++;
            if (i < linjer.Length) i++;
            StringBuilder sb = new StringBuilder();
            for (; i < linjer.Length; i++) sb.AppendLine(linjer[i]);
            return sb.ToString();
        }

        public static bool HarTopoverskrift(string krop)
        {
            foreach (string linje in krop.Replace("\r\n", "\n").Split('\n'))
                if (linje.TrimStart().StartsWith("# ")) return true;
            return false;
        }

        // Et midlertidigt hoved til en fil der ikke selv har et.
        public static string ByggHoved(string titel)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("---");
            sb.AppendLine("title: \"" + (titel == null ? "" : titel.Replace("\"", "'")) + "\"");
            sb.AppendLine("lang: da");
            sb.AppendLine("---");
            sb.AppendLine();
            return sb.ToString();
        }

        // Naar flere filer samles i en ny fil et andet sted, skal deres
        // henvisninger til billeder og delfiler pege samme sted hen som foer.
        public static string OmskrivStier(string tekst, string fraMappe, string tilMappe)
        {
            if (string.Equals(Path.GetFullPath(fraMappe).TrimEnd('\\'),
                              Path.GetFullPath(tilMappe).TrimEnd('\\'),
                              StringComparison.OrdinalIgnoreCase))
                return tekst;

            MatchEvaluator markdown = delegate(Match m)
            {
                return m.Groups[1].Value + Flyt(m.Groups[2].Value, fraMappe, tilMappe) + m.Groups[3].Value;
            };
            string ud = Regex.Replace(tekst, @"(\]\()([^)\s]+)(\))", markdown);
            ud = Regex.Replace(ud, @"(src\s*=\s*"")([^""]+)("")", markdown);
            ud = Regex.Replace(ud, @"(\{\{<\s*include\s+)([^\s>}]+)(\s*>\}\})", markdown);
            return ud;
        }

        private static string Flyt(string sti, string fraMappe, string tilMappe)
        {
            if (string.IsNullOrEmpty(sti)) return sti;
            if (sti.StartsWith("#") || sti.StartsWith("/") || sti.StartsWith("\\")) return sti;
            if (sti.IndexOf("://", StringComparison.Ordinal) >= 0) return sti;
            if (sti.StartsWith("data:") || sti.StartsWith("mailto:")) return sti;
            try
            {
                if (Path.IsPathRooted(sti)) return sti;
                string raa = sti;
                string anker = "";
                int hegn = raa.IndexOf('#');
                if (hegn > 0) { anker = raa.Substring(hegn); raa = raa.Substring(0, hegn); }
                string afkodet = raa.IndexOf('%') >= 0 ? Uri.UnescapeDataString(raa) : raa;
                string fuld = Path.GetFullPath(Path.Combine(fraMappe, afkodet.Replace('/', '\\')));
                if (!File.Exists(fuld) && !Directory.Exists(fuld)) return sti;
                return Filhjaelp.RelativSti(tilMappe, fuld) + anker;
            }
            catch (Exception)
            {
                return sti;
            }
        }
    }
}
