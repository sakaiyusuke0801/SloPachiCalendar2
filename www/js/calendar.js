// カレンダー関連
// 200128 sakai.y

// 曜日
const WEEKS = ['日', '月', '火', '水', '木', '金', '土']
// カレンダーの縦数
const TATE_NUM = 5;

/* ID、CLASS関連 */
const ID_CALENDAR_TABLE = "calendar_parent";
const ID_CALENDAR_TABLE_CAPTION = "calendar_caption";
const ID_CALENDAR_TABLE_HEADER = "calendar_head";
const ID_CALENDAR_TABLE_TH = "calendar_th";
const ID_CALENDAR_TABLE_BODY = "calendar_body";
const CLASS_CALENDAR_TABLE_TARGET_TD = "calendar_target_td";
const CLASS_CALENDAR_TABLE_NON_TARGET_TD = "calendar_non_target_td";
const CLASS_CALENDAR_TABLE_DATE_STR_DIV = "calendar_date_str_div";
const CLASS_CALENDAR_TABLE_SUM_STR_DIV = "calendar_sum_str_div";

class Calendar {
    // コンストラクタ
    constructor(_date) {
        // 現在表示しているDate型
        this.nowDispDate = _date;
        // 時刻はすべて0にする
        this.nowDispDate.setHours(0);
        this.nowDispDate.setMinutes(0);
        this.nowDispDate.setSeconds(0);
        this.nowDispDate.setMilliseconds(0);
    }
    // 年の取得
    getYear() {
        return this.nowDispDate.getFullYear();
    }
    // 月の取得
    getMonth() {
        return this.nowDispDate.getMonth() + 1;
    }

    // 日付をYYYY/MM/DD hh:mm:ss形式で返却
    getDateWithString(_date) {
        let year_str = _date.getFullYear();
        //月だけ+1すること
        let month_str = 1 + _date.getMonth();
        let day_str = _date.getDate();
        let hour_str = _date.getHours();
        let minute_str = _date.getMinutes();
        let second_str = _date.getSeconds();

        // いったん先頭に’0’をつけて、後ろから2文字をとる
        month_str = ('0' + month_str).slice(-2);
        day_str = ('0' + day_str).slice(-2);
        hour_str = ('0' + hour_str).slice(-2);
        minute_str = ('0' + minute_str).slice(-2);
        second_str = ('0' + second_str).slice(-2);

        let format_str = 'YYYY/MM/DD hh:mm:ss';
        format_str = format_str.replace(/YYYY/g, year_str);
        format_str = format_str.replace(/MM/g, month_str);
        format_str = format_str.replace(/DD/g, day_str);
        format_str = format_str.replace(/hh/g, hour_str);
        format_str = format_str.replace(/mm/g, minute_str);
        format_str = format_str.replace(/ss/g, second_str);
        return format_str;
    }
    // カレンダーHTML生成
    createCalendar(startDay) {
        // 出力html
        let outHtml = "";
        // 年の取得
        let year = this.nowDispDate.getFullYear();
        // 月の取得
        let month = this.nowDispDate.getMonth() + 1;
        // 範囲ターゲット開始Dateオブジェクト
        let startDate = new Date(year, month - 1, startDay);
        // 範囲ターゲットの終端
        let endDate;
        // 翌月以降になっていたらオーバーしているので、月末にする
        if ((startDate.getMonth() + 1) > month) {
            startDate.setDate(0);
            // 範囲ターゲットの終端も翌月の末日になる
            endDate = new Date(year, month + 1, 0);
        }
        else {
            // 上記以外の範囲ターゲットの終端翌月の同日
            endDate = new Date(year, month, startDay);
        }
        // 範囲ターゲット開始する日の曜日
        let startWeek = startDate.getDay();
        // 範囲ターゲット開始から前の日曜のDateオブジェクト
        let dispDate = new Date();
        // 時刻はすべて0にする
        dispDate.setHours(0);
        dispDate.setMinutes(0);
        dispDate.setSeconds(0);
        dispDate.setMilliseconds(0);
        //（範囲ターゲットの曜日分引く）
        dispDate.setDate(startDate.getDate() - startWeek);

        // 出力HTML初期化
        outHtml = "";

        // テーブルタグ
        outHtml += "<table id='" + ID_CALENDAR_TABLE + "'>";
        // 説明 ここでは年月
        outHtml += "<caption id='" + ID_CALENDAR_TABLE_CAPTION + "'>";
        // 前月移動マーク
        outHtml += "<a hlef='' onclick='setBeforeMonth()'><<</a>";
        // 年月
        outHtml += year + "/" + month;
        // 翌月移動マーク
        outHtml += "<a hlef='' onclick='setNextMonth()'>>></a>";
        // 閉じタグ
        outHtml += "</caption>";

        // 曜日ヘッダー
        outHtml += "<thead id='" + ID_CALENDAR_TABLE_HEADER + "'><tr>";
        for (let i = 0; i < WEEKS.length; i++) {
            // 曜日
            outHtml += "<th class='" + ID_CALENDAR_TABLE_TH + "'>" + WEEKS[i] + "</th>";
        }
        outHtml += "</tr></thead>";
        // 本体
        outHtml += "<tbody id='" + ID_CALENDAR_TABLE_BODY + "'>";
        // 縦列
        for (let i = 0; i < TATE_NUM; i++) {
            outHtml += "<tr>";
            // 横列
            for (let j = 0; j < WEEKS.length; j++) {
                // 日付文字列（YYYY/MM/DD部分のみ）
                let dateStr = this.getDateWithString(dispDate).substr(0, 10);
                // 一番上の行
                if (i == 0) {
                    // 表示を開始する曜日以降とそれより前でタグクラスを分ける
                    if (j >= startWeek) {
                        outHtml += "<td class='" + CLASS_CALENDAR_TABLE_TARGET_TD + "' >";
                    }
                    // ターゲットではない日
                    else {
                        outHtml += "<td class='" + CLASS_CALENDAR_TABLE_NON_TARGET_TD + "' >";
                    }
                }
                // 一番上の行ではない
                else {
                    // 翌月の開始日以降とそれより前でタグクラスを分ける
                    if (dispDate < endDate) {
                        outHtml += "<td class='" + CLASS_CALENDAR_TABLE_TARGET_TD + "' >";
                    }
                    // ターゲットではない日
                    else {
                        outHtml += "<td class='" + CLASS_CALENDAR_TABLE_NON_TARGET_TD + "' >";
                    }
                }
                // 日付の出力
                outHtml += "<div class='" + CLASS_CALENDAR_TABLE_DATE_STR_DIV + "' >" + dispDate.getDate().toString() + "</div>";

                // 日付をIDとした金額を記載する要素を出力
                outHtml += "<div id='" + dateStr + "' class='" + CLASS_CALENDAR_TABLE_SUM_STR_DIV + "' >" + "</div>";

                // 表示dateオブジェクトを翌日に更新
                dispDate.setDate(dispDate.getDate() + 1);
                // 閉じタグ
                outHtml += "</td>";
            }
            // 改行
            outHtml += "</tr>";
        }
        // 締めタグ
        outHtml += "</tbody></table>";

        // 返却
        return outHtml;
    }
}
