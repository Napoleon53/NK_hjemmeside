using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace QuartoRenderMaster
{
    // Et opslag i en YAML-fil: enten en enkelt vaerdi, en liste eller et kort.
    internal class Ynode
    {
        public string Vaerdi;
        public List<Ynode> Liste;
        public List<KeyValuePair<string, Ynode>> Kort;

        public static Ynode NySkalar(string v)
        {
            Ynode n = new Ynode();
            n.Vaerdi = v;
            return n;
        }

        public static Ynode NyListe()
        {
            Ynode n = new Ynode();
            n.Liste = new List<Ynode>();
            return n;
        }

        public static Ynode NytKort()
        {
            Ynode n = new Ynode();
            n.Kort = new List<KeyValuePair<string, Ynode>>();
            return n;
        }

        public bool ErListe { get { return Liste != null; } }
        public bool ErKort { get { return Kort != null; } }

        public Ynode Hent(string noegle)
        {
            if (Kort == null) return null;
            foreach (KeyValuePair<string, Ynode> p in Kort)
                if (string.Equals(p.Key, noegle, StringComparison.OrdinalIgnoreCase)) return p.Value;
            return null;
        }

        // Gaar ned gennem flere niveauer paa en gang, fx Sti("project", "output-dir").
        public Ynode Sti(params string[] noegler)
        {
            Ynode n = this;
            foreach (string noegle in noegler)
            {
                if (n == null) return null;
                n = n.Hent(noegle);
            }
            return n;
        }

        public string Tekst(params string[] noegler)
        {
            Ynode n = Sti(noegler);
            return n == null ? null : n.Vaerdi;
        }
    }

    // Laeser den del af YAML, som _quarto.yml bruger: kort, lister, enkle vaerdier
    // og listepunkter der selv er kort (fx "- part: Emner" med egne underkapitler).
    internal static class Yamllaeser
    {
        private class Linje
        {
            public int Ind;
            public string Tekst;
        }

        public static Ynode LaesFil(string sti)
        {
            try
            {
                return Laes(File.ReadAllLines(sti, Encoding.UTF8));
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static Ynode Laes(string[] raa)
        {
            List<Linje> linjer = new List<Linje>();
            foreach (string r in raa)
            {
                string t = r.Replace("\t", "  ");
                string trimmet = t.TrimStart(' ');
                if (trimmet.Length == 0) continue;
                if (trimmet[0] == '#') continue;
                if (trimmet == "---" || trimmet == "...") continue;
                Linje l = new Linje();
                l.Ind = t.Length - trimmet.Length;
                l.Tekst = FjernKommentar(trimmet).TrimEnd();
                if (l.Tekst.Length == 0) continue;
                linjer.Add(l);
            }
            if (linjer.Count == 0) return Ynode.NytKort();
            int i = 0;
            return ParseBlok(linjer, ref i, linjer[0].Ind);
        }

        private static Ynode ParseBlok(List<Linje> l, ref int i, int ind)
        {
            if (i >= l.Count) return Ynode.NytKort();
            if (ErListepunkt(l[i].Tekst)) return ParseListe(l, ref i, ind);
            return ParseKort(l, ref i, ind);
        }

        private static bool ErListepunkt(string t)
        {
            return t == "-" || t.StartsWith("- ");
        }

        private static Ynode ParseListe(List<Linje> l, ref int i, int ind)
        {
            Ynode node = Ynode.NyListe();
            while (i < l.Count && l[i].Ind == ind && ErListepunkt(l[i].Tekst))
            {
                string tekst = l[i].Tekst;
                string rest = tekst.Substring(1).TrimStart(' ');
                if (rest.Length == 0)
                {
                    i++;
                    if (i < l.Count && l[i].Ind > ind) node.Liste.Add(ParseBlok(l, ref i, l[i].Ind));
                    else node.Liste.Add(Ynode.NySkalar(""));
                    continue;
                }
                int restInd = ind + (tekst.Length - rest.Length);
                if (NoegleSlut(rest) >= 0)
                {
                    // Punktet er selv et kort: "- part: Emner" med egne linjer under.
                    l[i].Ind = restInd;
                    l[i].Tekst = rest;
                    node.Liste.Add(ParseKort(l, ref i, restInd));
                }
                else
                {
                    node.Liste.Add(Ynode.NySkalar(Afkod(rest)));
                    i++;
                }
            }
            return node;
        }

        private static Ynode ParseKort(List<Linje> l, ref int i, int ind)
        {
            Ynode node = Ynode.NytKort();
            while (i < l.Count && l[i].Ind == ind && !ErListepunkt(l[i].Tekst))
            {
                string tekst = l[i].Tekst;
                int k = NoegleSlut(tekst);
                if (k < 0) { i++; continue; }
                string noegle = Afkod(tekst.Substring(0, k).Trim());
                string vaerdi = tekst.Substring(k + 1).Trim();
                i++;
                Ynode vaerdinode;
                if (vaerdi.Length > 0)
                {
                    if (vaerdi[0] == '|' || vaerdi[0] == '>')
                    {
                        StringBuilder sb = new StringBuilder();
                        while (i < l.Count && l[i].Ind > ind)
                        {
                            if (sb.Length > 0) sb.Append(' ');
                            sb.Append(l[i].Tekst);
                            i++;
                        }
                        vaerdinode = Ynode.NySkalar(sb.ToString());
                    }
                    else if (vaerdi[0] == '[') vaerdinode = FlowListe(vaerdi);
                    else vaerdinode = Ynode.NySkalar(Afkod(vaerdi));
                }
                else if (i < l.Count && l[i].Ind > ind) vaerdinode = ParseBlok(l, ref i, l[i].Ind);
                else if (i < l.Count && l[i].Ind == ind && ErListepunkt(l[i].Tekst))
                    vaerdinode = ParseListe(l, ref i, ind);
                else vaerdinode = Ynode.NytKort();
                node.Kort.Add(new KeyValuePair<string, Ynode>(noegle, vaerdinode));
            }
            return node;
        }

        private static Ynode FlowListe(string tekst)
        {
            Ynode node = Ynode.NyListe();
            string indhold = tekst.Trim();
            if (indhold.StartsWith("[")) indhold = indhold.Substring(1);
            if (indhold.EndsWith("]")) indhold = indhold.Substring(0, indhold.Length - 1);
            bool iEnkelt = false, iDobbelt = false;
            StringBuilder sb = new StringBuilder();
            foreach (char c in indhold)
            {
                if (c == '"' && !iEnkelt) iDobbelt = !iDobbelt;
                else if (c == '\'' && !iDobbelt) iEnkelt = !iEnkelt;
                if (c == ',' && !iEnkelt && !iDobbelt)
                {
                    if (sb.ToString().Trim().Length > 0) node.Liste.Add(Ynode.NySkalar(Afkod(sb.ToString())));
                    sb.Length = 0;
                    continue;
                }
                sb.Append(c);
            }
            if (sb.ToString().Trim().Length > 0) node.Liste.Add(Ynode.NySkalar(Afkod(sb.ToString())));
            return node;
        }

        // Finder det kolon der adskiller noegle og vaerdi. Kolon inde i
        // anfoerselstegn eller midt i fx http:// taeller ikke.
        private static int NoegleSlut(string tekst)
        {
            bool iEnkelt = false, iDobbelt = false;
            for (int i = 0; i < tekst.Length; i++)
            {
                char c = tekst[i];
                if (c == '"' && !iEnkelt) { iDobbelt = !iDobbelt; continue; }
                if (c == '\'' && !iDobbelt) { iEnkelt = !iEnkelt; continue; }
                if (c == ':' && !iEnkelt && !iDobbelt)
                {
                    if (i == tekst.Length - 1 || tekst[i + 1] == ' ') return i;
                }
            }
            return -1;
        }

        private static string FjernKommentar(string tekst)
        {
            bool iEnkelt = false, iDobbelt = false;
            for (int i = 0; i < tekst.Length; i++)
            {
                char c = tekst[i];
                if (c == '"' && !iEnkelt) { iDobbelt = !iDobbelt; continue; }
                if (c == '\'' && !iDobbelt) { iEnkelt = !iEnkelt; continue; }
                if (c == '#' && !iEnkelt && !iDobbelt && (i == 0 || tekst[i - 1] == ' '))
                    return tekst.Substring(0, i);
            }
            return tekst;
        }

        private static string Afkod(string vaerdi)
        {
            string v = vaerdi.Trim();
            if (v.Length >= 2 && v[0] == '"' && v[v.Length - 1] == '"')
                return v.Substring(1, v.Length - 2).Replace("\\\"", "\"");
            if (v.Length >= 2 && v[0] == '\'' && v[v.Length - 1] == '\'')
                return v.Substring(1, v.Length - 2).Replace("''", "'");
            return v;
        }
    }
}
