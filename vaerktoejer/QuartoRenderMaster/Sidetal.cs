using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text;

namespace QuartoRenderMaster
{
    // Saetter sidetal i sidefoden paa en faerdig Word-fil.
    // Pandoc laver ingen sidefod af sig selv, saa den skal skrives ind
    // bagefter. En skabelon, der selv har sidetal, roeres ikke.
    internal static class Sidetal
    {
        private const string Footernavn = "word/footer-sidetal.xml";
        private const string Footertype =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml";
        private const string Relationstype =
            "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer";
        private const string Rnavnerum =
            "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

        public static void TilfoejIMappe(string mappe, DateTime efter, Action<string> log)
        {
            if (string.IsNullOrEmpty(mappe) || !Directory.Exists(mappe)) return;
            string[] filer;
            try
            {
                filer = Directory.GetFiles(mappe, "*.docx");
            }
            catch (Exception)
            {
                return;
            }
            foreach (string fil in filer)
            {
                try
                {
                    if (File.GetLastWriteTime(fil) < efter) continue;
                    if (Path.GetFileName(fil).StartsWith("~")) continue;
                }
                catch (Exception)
                {
                    continue;
                }
                Tilfoej(fil, log);
            }
        }

        public static void Tilfoej(string docx, Action<string> log)
        {
            try
            {
                using (ZipArchive zip = ZipFile.Open(docx, ZipArchiveMode.Update))
                {
                    if (HarSidetal(zip)) return;

                    string dokument = Laes(zip, "word/document.xml");
                    string relationer = Laes(zip, "word/_rels/document.xml.rels");
                    if (dokument == null || relationer == null) return;

                    string standard = StandardFooter(zip, dokument, relationer);
                    if (standard != null)
                    {
                        // Skabelonen har en sidefod uden sidetal. Der saettes et i.
                        string footer = Laes(zip, standard);
                        int slut = footer == null ? -1 : footer.LastIndexOf("</w:ftr>", StringComparison.Ordinal);
                        if (slut < 0) return;
                        Skriv(zip, standard, footer.Substring(0, slut) + Afsnit() + footer.Substring(slut));
                        log("    Sidetal sat i sidefoden i " + Path.GetFileName(docx));
                        return;
                    }

                    // Ingen sidefod overhovedet. Der laves en.
                    string id = NytId(relationer);
                    Skriv(zip, Footernavn, NyFooter());
                    Skriv(zip, "word/_rels/document.xml.rels", MedRelation(relationer, id));
                    string typer = Laes(zip, "[Content_Types].xml");
                    if (typer != null) Skriv(zip, "[Content_Types].xml", MedFootertype(typer));
                    Skriv(zip, "word/document.xml", MedFooterhenvisning(dokument, id));
                    log("    Sidetal sat i sidefoden i " + Path.GetFileName(docx));
                }
            }
            catch (Exception f)
            {
                log("    Kunne ikke saette sidetal i " + Path.GetFileName(docx) + ": " + f.Message);
            }
        }

        private static bool HarSidetal(ZipArchive zip)
        {
            foreach (ZipArchiveEntry e in zip.Entries)
            {
                if (!e.FullName.StartsWith("word/footer", StringComparison.OrdinalIgnoreCase)) continue;
                string tekst = Laes(zip, e.FullName);
                if (tekst != null && tekst.IndexOf("PAGE", StringComparison.Ordinal) >= 0) return true;
            }
            return false;
        }

        // Stien til den sidefod, der bruges paa de almindelige sider.
        private static string StandardFooter(ZipArchive zip, string dokument, string relationer)
        {
            int i = dokument.IndexOf("<w:footerReference", StringComparison.Ordinal);
            while (i >= 0)
            {
                int slut = dokument.IndexOf('>', i);
                if (slut < 0) break;
                string tag = dokument.Substring(i, slut - i);
                if (tag.IndexOf("w:type=\"default\"", StringComparison.Ordinal) >= 0)
                {
                    string id = Attribut(tag, "r:id");
                    string maal = Relationsmaal(relationer, id);
                    if (maal != null)
                    {
                        string sti = "word/" + maal.Replace("\\", "/").TrimStart('/');
                        if (zip.GetEntry(sti) != null) return sti;
                    }
                }
                i = dokument.IndexOf("<w:footerReference", slut, StringComparison.Ordinal);
            }
            return null;
        }

        private static string Attribut(string tag, string navn)
        {
            int i = tag.IndexOf(navn + "=\"", StringComparison.Ordinal);
            if (i < 0) return null;
            int start = i + navn.Length + 2;
            int slut = tag.IndexOf('"', start);
            return slut < 0 ? null : tag.Substring(start, slut - start);
        }

        private static string Relationsmaal(string relationer, string id)
        {
            if (id == null) return null;
            int i = relationer.IndexOf("Id=\"" + id + "\"", StringComparison.Ordinal);
            if (i < 0) return null;
            int start = relationer.LastIndexOf('<', i);
            int slut = relationer.IndexOf('>', i);
            if (start < 0 || slut < 0) return null;
            return Attribut(relationer.Substring(start, slut - start), "Target");
        }

        private static string NytId(string relationer)
        {
            int hoejeste = 0;
            int i = relationer.IndexOf("Id=\"rId", StringComparison.Ordinal);
            while (i >= 0)
            {
                int start = i + 7;
                int slut = relationer.IndexOf('"', start);
                int tal;
                if (slut > start && int.TryParse(relationer.Substring(start, slut - start), out tal)
                    && tal > hoejeste) hoejeste = tal;
                i = relationer.IndexOf("Id=\"rId", slut < 0 ? start : slut, StringComparison.Ordinal);
            }
            return "rId" + (hoejeste + 1);
        }

        private static string MedRelation(string relationer, string id)
        {
            string ny = "<Relationship Id=\"" + id + "\" Type=\"" + Relationstype
                        + "\" Target=\"" + Footernavn.Substring("word/".Length) + "\"/>";
            int slut = relationer.LastIndexOf("</Relationships>", StringComparison.Ordinal);
            if (slut < 0) return relationer;
            return relationer.Substring(0, slut) + ny + relationer.Substring(slut);
        }

        private static string MedFootertype(string typer)
        {
            if (typer.IndexOf(Footernavn, StringComparison.Ordinal) >= 0) return typer;
            string ny = "<Override PartName=\"/" + Footernavn + "\" ContentType=\"" + Footertype + "\"/>";
            int slut = typer.LastIndexOf("</Types>", StringComparison.Ordinal);
            if (slut < 0) return typer;
            return typer.Substring(0, slut) + ny + typer.Substring(slut);
        }

        // Sidefoden skal nævnes i hvert afsnits sectPr, ellers bruger Word den ikke.
        private static string MedFooterhenvisning(string dokument, string id)
        {
            string ud = MedRnavnerum(dokument);
            string henvisning = "<w:footerReference w:type=\"default\" r:id=\"" + id + "\"/>";
            StringBuilder sb = new StringBuilder();
            int i = 0;
            while (true)
            {
                int start = ud.IndexOf("<w:sectPr", i, StringComparison.Ordinal);
                if (start < 0) break;
                int efterNavn = start + "<w:sectPr".Length;
                char naeste = efterNavn < ud.Length ? ud[efterNavn] : ' ';
                if (naeste != '>' && naeste != ' ' && naeste != '/')
                {
                    // Fx <w:sectPrChange>, som ikke er et afsnit.
                    sb.Append(ud, i, efterNavn - i);
                    i = efterNavn;
                    continue;
                }
                int slut = ud.IndexOf('>', start);
                if (slut < 0) break;

                sb.Append(ud, i, start - i);
                string tag = ud.Substring(start, slut - start + 1);
                if (tag.EndsWith("/>"))
                {
                    sb.Append(tag.Substring(0, tag.Length - 2));
                    sb.Append('>');
                    sb.Append(henvisning);
                    sb.Append("</w:sectPr>");
                }
                else
                {
                    sb.Append(tag);
                    sb.Append(henvisning);
                }
                i = slut + 1;
            }
            sb.Append(ud, i, ud.Length - i);
            return sb.ToString();
        }

        private static string MedRnavnerum(string dokument)
        {
            int start = dokument.IndexOf("<w:document", StringComparison.Ordinal);
            if (start < 0) return dokument;
            int slut = dokument.IndexOf('>', start);
            if (slut < 0) return dokument;
            string tag = dokument.Substring(start, slut - start);
            if (tag.IndexOf("xmlns:r=", StringComparison.Ordinal) >= 0) return dokument;
            return dokument.Substring(0, slut) + " xmlns:r=\"" + Rnavnerum + "\"" + dokument.Substring(slut);
        }

        private static string Afsnit()
        {
            return "<w:p><w:pPr><w:jc w:val=\"center\"/></w:pPr>"
                 + "<w:r><w:fldChar w:fldCharType=\"begin\"/></w:r>"
                 + "<w:r><w:instrText xml:space=\"preserve\"> PAGE </w:instrText></w:r>"
                 + "<w:r><w:fldChar w:fldCharType=\"separate\"/></w:r>"
                 + "<w:r><w:t>1</w:t></w:r>"
                 + "<w:r><w:fldChar w:fldCharType=\"end\"/></w:r></w:p>";
        }

        private static string NyFooter()
        {
            return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n"
                 + "<w:ftr xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">"
                 + Afsnit() + "</w:ftr>";
        }

        private static string Laes(ZipArchive zip, string navn)
        {
            ZipArchiveEntry e = zip.GetEntry(navn);
            if (e == null) return null;
            using (StreamReader r = new StreamReader(e.Open(), Encoding.UTF8))
                return r.ReadToEnd();
        }

        private static void Skriv(ZipArchive zip, string navn, string indhold)
        {
            ZipArchiveEntry gammel = zip.GetEntry(navn);
            if (gammel != null) gammel.Delete();
            ZipArchiveEntry ny = zip.CreateEntry(navn);
            using (StreamWriter w = new StreamWriter(ny.Open(), new UTF8Encoding(false)))
                w.Write(indhold);
        }
    }
}
