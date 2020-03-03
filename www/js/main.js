// sakai.y

// ウィンドウオブジェクト
window.fn = {};
// メニューのオープン関数
window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};
// ページのロード関数
window.fn.load = function (page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content
        .load(page)
        .then(menu.close.bind(menu));
};
// IOS対応
if (ons.platform.isIPhoneX()) {
    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
    document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
}

// 表示カレンダー日付 初期値は今日
let dispCalDate = new Date();
// 選択中日付 初期値は今日
let selectDate = new Date();
// 選択中日付の収支オブジェクト配列
let selectDateObjectList = [];

// アプリケーションオブジェクト
let app = {};
// アプリケーション：カレンダー
app.calendar = new Calendar(dispCalDate);
// アプリケーション：ストレージ
app.storage = window.localStorage;
// アプリケーション：ローカルストレージへ選択日付をキーに選択データを格納する
app.setStorageSelectDate = function () {
    console.log("app.setStorageSelectDate");

    // リストが空ではない
    if (selectDateObjectList != null) {
        // 選択日付の文字列(yyyy/mm/dd)
        let selectDateStr = app.calendar.getDateWithString(selectDate).substr(0, 10);

        // ストレージへ丸ごと保存 key:日付文字列 valuie:収支オブジェクト配列
        app.storage.setItem(selectDateStr, JSON.stringify(selectDateObjectList));
    }
};
// アプリケーション：選択日付のデータを設定する
app.setSelectDateObj = function () {
    console.log("app.setSelectDateObj");
    // 選択日付の文字列(yyyy/mm/dd)
    let selectDateStr = app.calendar.getDateWithString(selectDate).substr(0, 10);
    // ストレージからデータ取得
    selectDateObjectList = JSON.parse(app.storage.getItem(selectDateStr));
    if (selectDateObjectList == null) {
        // 空なら初期化
        selectDateObjectList = [];
    }
};
// アプリケーション：選択日付のデータ一覧
app.setSelectDateList = function () {
    console.log("app.setSelectDateList");

    // 選択日付の文字列(yyyy/mm/dd)
    let selectDateStr = app.calendar.getDateWithString(selectDate).substr(0, 10);
    // リストコンポーネント取得
    let list = document.getElementById("balance_list");
    // いったん削除
    list.textContent = null;
    // リストヘッダー生成
    let header = document.createElement("ons-list-header");
    header.textContent = selectDateStr;
    // リストヘッダー追加
    list.appendChild(header);
    // 選択日付リストを一覧表示
    if (selectDateObjectList != null) {
        for (let idx in selectDateObjectList) {
            // リストアイテム生成
            let item = document.createElement("ons-list-item");
            // データ表示
            item.textContent = "投資:" + selectDateObjectList[idx].inv + " " + "リターン:" + selectDateObjectList[idx].ret;
            // クリックイベント
            item.setAttribute("onclick", "app.showActionSheetData( '" + item.textContent + "'," + idx + ")");
            // リストアイテム追加
            list.appendChild(item);
        }
    }

    // 最後に追加用のリストアイテム生成
    let item = document.createElement("ons-list-item");
    // 文字のDIVタグ
    let newStringDiv = document.createElement("div");
    // 文字は左へ
    newStringDiv.classList.add("left");
    // 文字
    newStringDiv.textContent = "New...";
    item.appendChild(newStringDiv);

    // クリック属性追加、関数登録
    item.setAttribute("onclick", "newData()");
    // tappable属性追加、なんか押した感じになる
    item.setAttribute("tappable");

    // リストアイテム追加
    list.appendChild(item);

};
// アプリケーション：データタッチ時アクションシート
app.showActionSheetData = function (_dateStr, _idx) {
    ons.openActionSheet({
        // タイトル
        title: _dateStr,
        // キャンセルなんとか
        cancelable: true,
        // ボタンたち
        buttons: [
            {
                label: "更新",
                modifier: "destructive",
            },
            {
                label: "削除",
                modifier: "destructive",
            },
            {
                label: "Cancel",
                icon: "md-close"
            }
        ]
    }).then(
        // 押されたときのコールバック
        // indexはボタンの位置っぽい
        function (index) {
            switch (index) {
                // 更新ボタン
                case 0:
                    updateData(_idx);
                    break;
                // 削除ボタン
                case 1:
                    deleteData(_idx);
                    break;
            }
        });
};

// セッティングオブジェクト
let setting = {};
// セッティング:開始日
setting.startDate = 5;
setting.startDateKey = "startDate";
// セッティング:テーマ
setting.Thema = "lib/onsenui/css/onsen-css-components.min.css";
setting.ThemaKey = "Thema";
// セッティング:初期化
// ストレージからセッティングデータを取得して設定する
setting.initSetting = function () {
    // 開始日取得
    setting.startDate = parseInt(app.storage.getItem(setting.startDateKey), 10);
    if (!setting.startDate) {
        // 空なら初期値
        setting.startDate = 5;
    }
    // テーマ
    setting.Thema = app.storage.getItem(setting.ThemaKey);
    if (!setting.Thema) {
        // 空なら初期値
        setting.Thema = "lib/onsenui/css/onsen-css-components.min.css";
    }
}
// セッティング:設定
// ストレージへ設定を保存する
setting.setStorage = function () {
    // ストレージへ保存 key:設定文字列 valuie:設定文字列
    // 開始日
    app.storage.setItem(setting.startDateKey, setting.startDate);
    // テーマ
    app.storage.setItem(setting.ThemaKey, setting.Thema);
}

// New...クリック
let newData = function () {
    console.log("newData");

    // ダイアログ表示
    let dialog = document.getElementById("regist_dialog");
    if (dialog) {
        dialog.show();
    } else {
        ons.createElement('regist_dialog.html', { append: true })
            .then(function (dialog) {
                dialog.show();
            });
    }
}
// new登録クリック
let registNewData = function () {
    console.log("registNewData");

    // 選択日付の文字列(yyyy/mm/dd)
    let selectDateStr = app.calendar.getDateWithString(selectDate).substr(0, 10);
    // 投資
    let invInput = document.getElementById("invInput").value;
    // リターン
    let retInput = document.getElementById("retInput").value;
    // 中身ある
    if (invInput && retInput) {
        // 収支データ作成
        let obj = {};
        obj.inv = invInput;
        obj.ret = retInput;
        // リストのチェック
        if (selectDateObjectList == null) {
            // 空なら初期化
            selectDateObjectList = [];
        }
        // データを配列に追加
        selectDateObjectList.push(obj);
        // データを保存
        app.setStorageSelectDate();


        // フォーム初期化
        document.getElementById("invInput").value = null;
        document.getElementById("retInput").value = null;

        // ダイアログ非表示
        let dialog = document.getElementById("regist_dialog");
        dialog.hide();

        // 再描画
        // カレンダーページの読み込み
        fn.load('calendar.html');

        // 選択日付の一覧表示
        app.setSelectDateList();
    }
    else {
        alert("入力が正しくありません。");
        // フォーム初期化
        document.getElementById("invInput").value = null;
        document.getElementById("retInput").value = null;
    }
}
// newキャンセルクリック
let cancelNewData = function () {
    console.log("cancelNewData");

    // ダイアログ非表示
    let dialog = document.getElementById("regist_dialog");
    dialog.hide();
}
// 更新ダイアログ表示クリック
let updateData = function (_idx) {
    console.log("updateData");

    // ダイアログ表示
    let dialog = document.getElementById("update_dialog");
    if (dialog) {
        dialog.show();
        // フォーム初期化
        let inv = 0;
        let ret = 0;
        if (selectDateObjectList[_idx].inv != null) {
            inv = selectDateObjectList[_idx].inv;
        }
        if (selectDateObjectList[_idx].ret != null) {
            ret = selectDateObjectList[_idx].ret;
        }
        document.getElementById("invUpdateInput").value = inv;
        document.getElementById("retUpdateInput").value = ret;

        // ボタンの作成
        let parent = document.getElementById("updateButtons");
        parent.textContent = null;
        let ok = document.createElement("ons-button");
        ok.textContent = "更新";
        ok.setAttribute("modifier", "material--flat");
        ok.setAttribute("onclick", "exeUpdateData(" + _idx + ")");
        let ng = document.createElement("ons-button");
        ng.textContent = "キャンセル";
        ng.setAttribute("modifier", "material--flat");
        ng.setAttribute("onclick", "cancelUpdateData(" + _idx + ")");
        parent.appendChild(ok);
        parent.appendChild(ng);
    } else {
        ons.createElement('update_dialog.html', { append: true })
            .then(function (dialog) {

                dialog.show();
                // フォーム初期化
                let inv = 0;
                let ret = 0;
                if (selectDateObjectList[_idx].inv != null) {
                    inv = selectDateObjectList[_idx].inv;
                }
                if (selectDateObjectList[_idx].ret != null) {
                    ret = selectDateObjectList[_idx].ret;
                }
                document.getElementById("invUpdateInput").value = inv;
                document.getElementById("retUpdateInput").value = ret;

                // ボタンの作成
                let parent = document.getElementById("updateButtons");
                parent.textContent = null;
                let ok = document.createElement("ons-button");
                ok.textContent = "更新";
                ok.setAttribute("modifier", "material--flat");
                ok.setAttribute("onclick", "exeUpdateData(" + _idx + ")");
                let ng = document.createElement("ons-button");
                ng.textContent = "キャンセル";
                ng.setAttribute("modifier", "material--flat");
                ng.setAttribute("onclick", "cancelUpdateData(" + _idx + ")");
                parent.appendChild(ok);
                parent.appendChild(ng);
            });
    }
}
// 更新実行クリック
let exeUpdateData = function (_idx) {
    console.log("exeUpdateData");

    // 更新の実行
    // 投資
    let invInput = document.getElementById("invUpdateInput").value;
    // リターン
    let retInput = document.getElementById("retUpdateInput").value;
    // 中身ある
    if (invInput && retInput) {
        // リストのチェック
        if (selectDateObjectList == null) {
            // 空なら初期化
            selectDateObjectList = [];
        }
        selectDateObjectList[_idx].inv = invInput;
        selectDateObjectList[_idx].ret = retInput;
    }

    // データを保存
    app.setStorageSelectDate();

    // ダイアログ非表示
    let dialog = document.getElementById("update_dialog");
    dialog.hide();

    // 再描画
    // カレンダーページの読み込み
    fn.load('calendar.html');

    // 選択日付の一覧表示
    app.setSelectDateList();
}
// 更新キャンセルクリック
let cancelUpdateData = function (_idx) {
    console.log("cancelUpdateData");

    // ダイアログ非表示
    let dialog = document.getElementById("update_dialog");
    dialog.hide();
}
// 削除確認ダイアログ表示クリック
let deleteData = function (_idx) {
    console.log("deleteData");

    // ダイアログ表示
    let dialog = document.getElementById("delete_dialog");
    if (dialog) {
        dialog.show();

        // ボタンの作成
        let parent = document.getElementById("deleteButtons");
        parent.textContent = null;
        let ok = document.createElement("ons-button");
        ok.textContent = "削除";
        ok.setAttribute("modifier", "material--flat");
        ok.setAttribute("onclick", "exeDeleteData(" + _idx + ")");
        let ng = document.createElement("ons-button");
        ng.textContent = "キャンセル";
        ng.setAttribute("modifier", "material--flat");
        ng.setAttribute("onclick", "cancelDeleteData(" + _idx + ")");
        parent.appendChild(ok);
        parent.appendChild(ng);

    } else {
        ons.createElement('delete_dialog.html', { append: true })
            .then(function (dialog) {
                dialog.show();

                // ボタンの作成
                let parent = document.getElementById("deleteButtons");
                parent.textContent = null;
                let ok = document.createElement("ons-button");
                ok.textContent = "削除";
                ok.setAttribute("modifier", "material--flat");
                ok.setAttribute("onclick", "exeDeleteData(" + _idx + ")");
                let ng = document.createElement("ons-button");
                ng.textContent = "キャンセル";
                ng.setAttribute("modifier", "material--flat");
                ng.setAttribute("onclick", "cancelDeleteData(" + _idx + ")");
                parent.appendChild(ok);
                parent.appendChild(ng);
            });
    }
}
// 削除実行クリック
let exeDeleteData = function (_idx) {
    console.log("exeDeleteData");

    // 削除の実行
    selectDateObjectList.splice(_idx, 1);

    // データを保存
    app.setStorageSelectDate();

    // ダイアログ非表示
    let dialog = document.getElementById("delete_dialog");
    dialog.hide();

    // 再描画
    // カレンダーページの読み込み
    fn.load('calendar.html');

    // 選択日付の一覧表示
    app.setSelectDateList();
}
// 削除キャンセルクリック
let cancelDeleteData = function (_idx) {
    console.log("cancelDeleteData");

    // ダイアログ非表示
    let dialog = document.getElementById("delete_dialog");
    dialog.hide();
}
// 開始日変更
let startDayRadioChange = function () {
    console.log("startDayRadioChange");

    // Nameからタグを全取得
    let startDayRadios = document.getElementsByName("start-day");
    // どのラジオボタンにチェックがついているか調べる
    for (let radio of startDayRadios) {
        // 見つけたら
        if (radio.checked) {
            // 設定オブジェクトに代入
            setting.startDate = radio.value;
            // ストレージへ保存
            setting.setStorage();
            break
        }
    }
}
// スタイルCSS変更
let styleCssRadioChange = function () {
    console.log("styleCssRadioChange");

    // Nameからタグを全取得
    let styleCss = document.getElementsByName("styleCss");
    // どのラジオボタンにチェックがついているか調べる
    for (let radio of styleCss) {
        // 見つけたら
        if (radio.checked) {
            // 設定オブジェクトに代入
            setting.Thema = radio.value;
            // ストレージへ保存
            setting.setStorage();
            // スタイル変更
            document.getElementById("costum_style").href = radio.value;
            break
        }
    }
}
// 当月移動
let setCurrentMonth = function () {
    // 当月にする
    dispCalDate = new Date();
    // カレンダーの日付を更新する
    app.calendar.setNowDispDate(dispCalDate);
    // 選択日付も当日にする
    selectDate = new Date();
    // 選択日付のデータを設定する
    app.setSelectDateObj();
    // 選択日付の一覧表示
    app.setSelectDateList();
    // 再描画
    // カレンダーページの読み込み
    fn.load('calendar.html');
}
// 翌月移動
let setNextMonth = function () {
    // 表示日付の月を加算する
    dispCalDate.setMonth(dispCalDate.getMonth() + 1);
    // カレンダーの日付を更新する
    app.calendar.setNowDispDate(dispCalDate);
    // 選択日付をその月の開始日にする
    selectDate = new Date(dispCalDate.getFullYear(), dispCalDate.getMonth(), 1);
    // 選択日付のデータを設定する
    app.setSelectDateObj();
    // 選択日付の一覧表示
    app.setSelectDateList();
    // 再描画
    // カレンダーページの読み込み
    fn.load('calendar.html');
}
// 前月移動
let setBeforeMonth = function () {
    // 表示日付の月を加算する
    dispCalDate.setMonth(dispCalDate.getMonth() - 1);
    // カレンダーの日付を更新する
    app.calendar.setNowDispDate(dispCalDate);
    // 選択日付をその月の開始日にする
    selectDate = new Date(dispCalDate.getFullYear(), dispCalDate.getMonth(), 1);
    // 選択日付のデータを設定する
    app.setSelectDateObj();
    // 選択日付の一覧表示
    app.setSelectDateList();
    // 再描画
    // カレンダーページの読み込み
    fn.load('calendar.html');
}

// 設定の全データ確認ダイアログ表示クリック
let settingDeleteAllData = function () {
    console.log("settingDeleteAllData");

    // ダイアログ表示
    let dialog = document.getElementById("delete_deta_dialog");
    if (dialog) {
        dialog.show();

        // ボタンの作成
        let parent = document.getElementById("deleteButtons");
        parent.textContent = null;
        let ok = document.createElement("ons-button");
        ok.textContent = "クリア";
        ok.setAttribute("modifier", "material--flat");
        ok.setAttribute("onclick", "exeSettingDeleteAllData()");
        let ng = document.createElement("ons-button");
        ng.textContent = "キャンセル";
        ng.setAttribute("modifier", "material--flat");
        ng.setAttribute("onclick", "cancelSettingDeleteAllData()");
        parent.appendChild(ok);
        parent.appendChild(ng);

    } else {
        ons.createElement('delete_deta_dialog.html', { append: true })
            .then(function (dialog) {
                dialog.show();

                // ボタンの作成
                let parent = document.getElementById("deleteButtons");
                parent.textContent = null;
                let ok = document.createElement("ons-button");
                ok.textContent = "クリア";
                ok.setAttribute("modifier", "material--flat");
                ok.setAttribute("onclick", "exeSettingDeleteAllData()");
                let ng = document.createElement("ons-button");
                ng.textContent = "キャンセル";
                ng.setAttribute("modifier", "material--flat");
                ng.setAttribute("onclick", "cancelSettingDeleteAllData()");
                parent.appendChild(ok);
                parent.appendChild(ng);
            });
    }
}
// 全データクリア実行
let exeSettingDeleteAllData = function () {
    console.log("exeSettingDeleteAllData");

    // 全データクリア
    app.storage.clear();
    // ダイアログ非表示
    let dialog = document.getElementById("delete_deta_dialog");
    dialog.hide();
}
// 全データクリアキャンセル
let cancelSettingDeleteAllData = function () {
    console.log("cancelSettingDeleteAllData");

    // ダイアログ非表示
    let dialog = document.getElementById("delete_deta_dialog");
    dialog.hide();
}

// Onsen準備OK
ons.ready(function () {
    console.log("Onsen UI is ready");

    // 設定の初期化
    setting.initSetting();
    // 設定からスタイル変更
    document.getElementById("costum_style").href = setting.Thema;

    // カレンダーページの読み込み
    fn.load('calendar.html');

    // onsenUIのページが読み込まれたとき
    document.addEventListener("init", function (event) {

        // カレンダーページ
        if (event.target.matches("#calendar_page")) {
            console.log("calendar_page init");
            // 月の合計金額
            let monthAll = 0;
            // カレンダー本体の表示
            document.getElementById("calendar").innerHTML = app.calendar.createCalendar(setting.startDate);
            // 日にちセルの取得 *ターゲットセルのみ
            let tds = document.getElementsByClassName(CLASS_CALENDAR_TABLE_TARGET_TD);
            for (let td of tds) {
                for (let node of td.childNodes) {
                    if (node.className == CLASS_CALENDAR_TABLE_SUM_STR_DIV) {
                        // 日にち文字列()
                        let dateStr = node.id.substr(0, 10);

                        // ローカルストレージからデータ取得
                        if (app.storage.getItem(dateStr) != null) {
                            let array = JSON.parse(app.storage.getItem(dateStr));
                            if (array.length != 0) {
                                let total = 0;
                                for (let obj of array) {
                                    total += (parseInt(obj.ret, 10) - parseInt(obj.inv, 10));
                                }
                                // 合計金額を表示
                                node.innerHTML = total;
                                // 月の合計金額に合算
                                monthAll += total;
                            }
                        }

                        // 日にちをクリックしたときの動作登録
                        td.addEventListener("click", function () {
                            // それを日付型として選択日付に再格納
                            selectDate = new Date(dateStr);
                            // 選択日付のデータを設定する
                            app.setSelectDateObj();
                            // 選択日付の一覧表示
                            app.setSelectDateList();

                        }, false);
                    }
                }
            }
            // 月合計を入力
            let balance_all = document.getElementById("balance_all");
            balance_all.setAttribute("style", "color:blue");
            balance_all.textContent = "合計　" + monthAll;

            // 選択日付の一覧表示
            app.setSelectDateList();
        }
        // チャートページ
        if (event.target.matches("#chart_page")) {
            console.log("chart_page init");

            // 年チャート
            var yearChartCtx = document.getElementById("yearChart");
            var yearChart = new Chart(yearChartCtx, {
                type: "line",
                data: {
                    labels: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                    datasets: [
                        {
                            label: "年",
                            data: [-10000, 50000, -200000, 500000, 100000, 30000, -50000, 150000, 200000, -15000, -80000, 150000],
                            borderColor: "rgba(255,0,0,1)",
                            backgroundColor: "rgba(0,0,0,0)"
                        },
                    ],
                    options: {

                    }
                },
            });
            var janChartCtx = document.getElementById("janChart");
            var janChart = new Chart(janChartCtx, {
                type: "line",
                data: {
                    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                    datasets: [
                        {
                            label: "１月",
                            data: [1000, 50000, -10000, -20000, 7000, 8000, -80000, 5000],
                            borderColor: "rgba(125,125,0,1)",
                            backgroundColor: "rgba(0,0,0,0)"
                        },
                    ],
                    options: {

                    }
                },
            });
        }
        // セッティングページ
        if (event.target.matches("#settings_page")) {
            console.log("settings_page init");

            // ラジオボタンの初期値補正
            // 開始日
            // Nameからタグを全取得
            let startDayRadios = document.getElementsByName("start-day");
            // どのラジオボタンにチェックをつけるか設定から調べる
            for (let radio of startDayRadios) {
                // 見つけたら
                if (setting.startDate == radio.value) {
                    // チェックON
                    radio.checked = true;
                    break
                }
            }
            // テーマ
            // Nameからタグを全取得
            let styleCss = document.getElementsByName("styleCss");
            // どのラジオボタンにをつけるか設定から調べる
            for (let radio of styleCss) {
                // 見つけたら
                if (radio.value == setting.Thema) {
                    // チェックON
                    radio.checked = true;
                    break
                }
            }
        }
    }, false);
    // onsenUIのページが破棄されるとき
    document.addEventListener("destroy", function (event) {
        // カレンダーページ
        if (event.target.matches("#calendar_page")) {
            console.log("calendar_page destroy");
        }
        // チャートページ
        if (event.target.matches("#chart_page")) {
            console.log("chart_page destroy");
        }
        // セッティングページ
        if (event.target.matches("#settings_page")) {
            // 設定の保存
            setting.setStorage();
        }
    }, false);
    // onsenUIのページが画面に現れるたび
    document.addEventListener("show", function (event) {
        // カレンダーページ
        if (event.target.matches("#calendar_page")) {
            console.log("calendar_page show");
        }
        // チャートページ
        if (event.target.matches("#chart_page")) {
            console.log("chart_page show");
        }
        // セッティングページ
        if (event.target.matches("#settings_page")) {
        }
    }, false);
    // onsenUIのページが画面から隠れたとき
    document.addEventListener("hide", function (event) {
        // カレンダーページ
        if (event.target.matches("#calendar_page")) {
            console.log("calendar_page hide");
        }
        // チャートページ
        if (event.target.matches("#chart_page")) {
            console.log("chart_page hide");
        }
        // セッティングページ
        if (event.target.matches("#settings_page")) {
        }
    }, false);

});
