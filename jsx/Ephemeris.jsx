/**
 * Created by Vinay on 02-Jul-14.
 */
/*global $, alert, Itara, app, Utils, Globals*/

//noinspection JSHint
Ephemeris = {
    prepare: function (data) {
        'use strict';
        const fileName = 'Ephemeris 2016 2025.indd';
        var doc = Utils.openDoc(fileName);
        //noinspection JSHint
        if (doc == null) {
            return JSON.stringify(Utils.Status.error("File '" + fileName + "' not found"));
        }
        Globals.WorkDoc = doc;
        //noinspection JSHint
        var status = Ephemeris.FillData(data);
        doc.save();
        return JSON.stringify(status);
    },
    FillData: function (data) {
        'use strict';
        for (var avadhiCnt = 0; avadhiCnt < data.Avadhis.length; avadhiCnt++) {
            var avadhi = data.Avadhis[avadhiCnt];
            var spread = Utils.GetPage(Globals.WorkDoc, avadhi.PageLocator, true, false, 'A-Master');
            var left = spread.pages[0];
            var right = spread.pages[1];
            var tf = Utils.OverrideFrame(left, 'Tithyaadi');
            var table = tf.tables[0];
            var res = Ephemeris.Tithyaadi(table, avadhi);
            if (res.Error()) {
                return res;
            }
            tf = Utils.OverrideFrame(right, 'UjavePaan');
            table = tf.tables[0];
            res = Ephemeris.ItaraGraha(table, avadhi, data.Titles.SpashtaGraha, data.Titles.Grahas);
            if (res.Error()) {
                return res;
            }
            table = tf.tables[1];
            res = Ephemeris.GrahaYoga(table, avadhi, data.Titles.GrahaYoga);
            if (res.Error()) {
                return res;
            }
            res = Ephemeris.Kundali(right, avadhi);
            if (res.Error()) {
                return res;
            }
            tf = Utils.OverrideFrame(right, 'RaashiPravesha');
            table = tf.tables[0];
            res = Ephemeris.RashiPravesha(table, avadhi, data.Titles.RashiPravesha);
            if (res.Error()) {
                return res;
            }
        }
        return Utils.Status.success();
    },
    LeftTitle: function (table, avadhi) {
        'use strict';

        table.rows[0].cells[0].Fill([
            new Utils.Majakoora(avadhi.Shirshakas[0].Text + ' ', "Tithyaadi", "PakshhaTitle", "Tithyaadi", "MaasaNaama"),
            new Utils.Majakoora(avadhi.Shirshakas[1].Text + ' ', "Tithyaadi", "PakshhaTitle", "Tithyaadi", "TithiEngDate"),
            new Utils.Majakoora(avadhi.Shirshakas[2].Text, "Tithyaadi", "PakshhaTitle", "Tithyaadi", "MaasaNaama")
        ]);

        table.rows[0].cells[1].Fill(new Utils.Majakoora(avadhi.Shirshakas[3].Text + ' ', "Tithyaadi", "PakshhaTitle", "Tithyaadi", "MaasaNaama"));

        return Utils.Status.success();
    },

    Tithyaadi: function (table, avadhi) {
        var res = Ephemeris.LeftTitle(table, avadhi);
        if (res.Error()) {
            return res;
        }
        Utils.FitRows(table, avadhi.Dinas.length);

        for (var dinaCnt = 0; dinaCnt < avadhi.Dinas.length; dinaCnt++) {
            var dina = avadhi.Dinas[dinaCnt];
            var tithiKshhaya = dina.Tithi2 != null;
            var nakKshhaya = dina.Nakshatra2 != null;
            var tithi = dina.Tithi1;
            var tithyanta = dina.Tithi1End;
            if (tithiKshhaya) {
                tithi += '\r' + dina.Tithi2;
                tithyanta += '\r' + dina.Tithi2End;
            }

            var nak = dina.Nakshatra1;
            var nakAnta = dina.Nakshatra1End;
            if (nakKshhaya) {
                nak += '\r' + dina.Nakshatra2;
                nakAnta += '\r' + dina.Nakshatra2End;
            }

            table.rows[2 + dinaCnt].cells[0].Fill(new Utils.Majakoora(tithi, "Basic", "Left", "Tithyaadi", (tithiKshhaya ? "AngaKshhaya" : "Anga")));
            table.rows[2 + dinaCnt].cells[1].Fill(new Utils.Majakoora(dina.Vaara, "Basic", "Right", "Tithyaadi", "Anga"));
            table.rows[2 + dinaCnt].cells[2].Fill(new Utils.Majakoora(tithyanta, "Basic", "Center", "Tithyaadi", (tithiKshhaya ? "SamayaKshhaya" : "Samaya")));
            table.rows[2 + dinaCnt].cells[3].Fill(new Utils.Majakoora(nak, "Basic", "Left", "Tithyaadi", (nakKshhaya ? "AngaKshhaya" : "Anga")));
            table.rows[2 + dinaCnt].cells[4].Fill(new Utils.Majakoora(nakAnta, "Basic", "Center", "Tithyaadi", (nakKshhaya ? "SamayaKshhaya" : "Samaya")));
            table.rows[2 + dinaCnt].cells[5].Fill(new Utils.Majakoora(dina.Date, "Basic", "Right", "Tithyaadi", "TithiEngDate"));
            table.rows[2 + dinaCnt].cells[6].Fill(new Utils.Majakoora(avadhi.Grahas[dinaCnt].Grahas[0], "Basic", "Right", "Tithyaadi", "Samaya"));
            table.rows[2 + dinaCnt].cells[7].Fill(new Utils.Majakoora(avadhi.Grahas[dinaCnt].Grahas[1], "Basic", "Right", "Tithyaadi", "Samaya"));
            table.rows[2 + dinaCnt].cells[8].Fill(new Utils.Majakoora(avadhi.Grahas[dinaCnt].SampatikaSamaya, "Basic", "Right", "Tithyaadi", "Samaya"));
        }
        return Utils.Status.success();
    },

    ItaraGraha: function (table, avadhi, title, titles) {
        table.rows[0].cells[0].Fill([
            new Utils.Majakoora(avadhi.Shirshakas[1].Text + ' ', "Itara", "LeftColumnHead", "Tithyaadi", "TithiEngDate"),
            new Utils.Majakoora(avadhi.Shirshakas[2].Text, "Itara", "LeftColumnHead", "Tithyaadi", "MaasaNaama"),
            new Utils.Majakoora('\t' + title, "Itara", "LeftColumnHead", null, "Bold95")
        ]);

        for (var grahaCnt = 2; grahaCnt < titles.length; grahaCnt++) {
            table.rows[1].cells[grahaCnt - 1].Fill(new Utils.Majakoora(titles[grahaCnt], "Itara", "ColumnHead"));
        }

        var totalRows = Math.floor((avadhi.Grahas.length - 1) / 4) + 1;
        Utils.FitRows(table, totalRows);

        for (dinaCnt = 0; dinaCnt < avadhi.Grahas.length; dinaCnt += 4) {
            var dinaGraha = avadhi.Grahas[dinaCnt];
            var rowIndex = dinaCnt / 4 + table.headerRowCount;
            table.rows[rowIndex].cells[0].Fill(new Utils.Majakoora(dinaGraha.Date, "Basic", "Right", null, "EngDate"));
            for (grahaCnt = 2; grahaCnt < dinaGraha.Grahas.length; grahaCnt++) {
                table.rows[rowIndex].cells[1 + grahaCnt - 2].Fill(new Utils.Majakoora(dinaGraha.Grahas[grahaCnt], "Basic", "Right12", null, "Normal85"));
            }
        }

        for (grahaCnt = 2; grahaCnt < titles.length; grahaCnt++) {
            var vms = [];
            for (var vmCnt = 0; vmCnt < avadhi.VakriMargi[grahaCnt - 2].length; vmCnt++) {
                var vm = avadhi.VakriMargi[grahaCnt - 2][vmCnt];
                if (vmCnt > 0) {
                    vms.push(new Utils.Majakoora(" ", "GrahaPage", "VakreeMaargee"));
                }
                if (vm.Date != null) {
                    vms.push(new Utils.Majakoora(vm.Date + " ", "GrahaPage", "VakreeMaargee", "GrahaPage", "GrahaEngDateWithMonth"));
                }
                vms.push(new Utils.Majakoora(vm.Sthiti, "GrahaPage", "VakreeMaargee"));
            }
            table.rows[totalRows + 2].cells[grahaCnt - 1].Fill(vms);
        }
        return Utils.Status.success();
    },

    GrahaYoga: function (table, avadhi, title) {
        var rowCnt = 1;
        var totRowCnt = Math.floor((avadhi.GrahaYogas.reduce(function (accum, item) {
            return accum + item.Yogas.length;
        }, 0) - 1) / 6) + 1;

        Utils.FitRows(table, totRowCnt);

        table.rows[0].cells[0].Fill([
            new Utils.Majakoora(avadhi.Shirshakas[1].Text + ' ', "Itara", "LeftColumnHead", "Tithyaadi", "TithiEngDate"),
            new Utils.Majakoora(avadhi.Shirshakas[2].Text, "Itara", "LeftColumnHead", "Tithyaadi", "MaasaNaama")
        ]);

        table.rows[0].cells[1].Fill(new Utils.Majakoora(title, "Itara", "LeftColumnHead"));

        var prevYogaDate = null;
        var colCnt = 0;
        for (var dinaYogaCnt = 0; dinaYogaCnt < avadhi.GrahaYogas.length; dinaYogaCnt++) {
            var dinaYoga = avadhi.GrahaYogas[dinaYogaCnt];
            for (var yogaCnt = 0; yogaCnt < dinaYoga.Yogas.length; yogaCnt++) {
                var gy = dinaYoga.Yogas[yogaCnt];
                if (rowCnt > totRowCnt) {
                    rowCnt = 1;
                    colCnt++;
                }

                if (yogaCnt === 0 || rowCnt === 1) {
                    table.rows[rowCnt].cells[colCnt * 2].Fill(new Utils.Majakoora(dinaYoga.Date, "Basic", "Right", "GrahaPage", "GrahaEngDate"));
                }
                else table.rows[rowCnt].cells[colCnt * 2].Fill(new Utils.Majakoora("", "Basic", "Right", "GrahaPage", "GrahaEngDate"));
                table.rows[rowCnt].cells[colCnt * 2 + 1].Fill(new Utils.Majakoora(gy, "Basic", "Right12"));
                rowCnt++;
            }
            prevYogaDate = dinaYoga.Date;
        }
        return Utils.Status.success();
    },

    Kundali: function(page, avadhi){
        for (var cnt = 1; cnt <= 12; cnt++) {
            var grahaFrameName = "Graha" + Utils.pad(cnt,2);
            var sthaanaFrameName = "Sthaana" + Utils.pad(cnt,2);
            var grahaFrame = Utils.OverrideFrame(page, grahaFrameName, page.name);

            if (grahaFrame == null)
                return Utils.Status.error("Frame " + grahaFrameName + " not found on Page: " + page.name);

            var sthaanaFrame = Utils.OverrideFrame(page, sthaanaFrameName, page.name);
            if (sthaanaFrame == null)
                return Utils.Status.error("Frame " + sthaanaFrameName + " not found on Page: " + page.name);

            textInSthaana = avadhi.Kundali.Grahas[cnt -1];
            grahaFrame.Fill(new Utils.Majakoora(textInSthaana, "Basic", "Center", (textInSthaana === "" ? null :  "Tithyaadi"), (textInSthaana === "" ? "[None]" : "Kundalee")));
            sthaanaFrame.Fill(new Utils.Majakoora(avadhi.Kundali.Places[cnt - 1].toString(), "Basic", "Center", "Tithyaadi", "Kundalee"));
        }
        return Utils.Status.success();
    },

    RashiPravesha: function(table, avadhi, title){
        table.rows[0].cells[0].Fill(new Utils.Majakoora(title, "Itara", "ColumnHead"));
        for(var rCnt = 0; rCnt < avadhi.RashiPraveshas.length; rCnt++){
            var rp = avadhi.RashiPraveshas[rCnt];
            table.rows[1 + rCnt].cells[0].Fill(new Utils.Majakoora(rp.Month, "Basic", "Right"));
            table.rows[1 + rCnt].cells[1].Fill(new Utils.Majakoora(rp.Date, "Basic", "Right", null, "EngDate"));
            table.rows[1 + rCnt].cells[2].Fill(new Utils.Majakoora(rp.Pravesha, "Basic", "Left"));
            table.rows[1 + rCnt].cells[3].Fill(new Utils.Majakoora(rp.Samaya, "Basic", "Left"));
        }
        return Utils.Status.success();
    }
};

