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
// カレンダー
app.calendar = new Calendar(dispCalDate);
// ストレージ
app.storage = window.localStorage;
// 選択日付のデータを設定する
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
// 選択日付のデータ一覧
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

// データタッチ時アクションシート
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
setting.startDate = 5;

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
        console.log("registNewData:invInput && retInput");

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

        // ストレージへ丸ごと保存 key:日付文字列 valuie:収支オブジェクト配列
        app.storage.setItem(selectDateStr, JSON.stringify(selectDateObjectList));

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
        ok.setAttribute("onclick", "exeUpdateData(" + _idx + ")");
        let ng = document.createElement("ons-button");
        ng.textContent = "キャンセル";
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
                ok.setAttribute("onclick", "exeUpdateData(" + _idx + ")");
                let ng = document.createElement("ons-button");
                ng.textContent = "キャンセル";
                ng.setAttribute("onclick", "cancelUpdateData(" + _idx + ")");
                parent.appendChild(ok);
                parent.appendChild(ng);
            });
    }
}
// 更新実行クリック
let exeUpdateData = function (_idx) {
    console.log("exeUpdateData");

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
    } else {
        ons.createElement('delete_dialog.html', { append: true })
            .then(function (dialog) {
                dialog.show();
            });
    }
}

// Onsen準備OK
ons.ready(function () {
    console.log("Onsen UI is ready");

    // カレンダーページの読み込み
    fn.load('calendar.html');

    // onsenUIのページが読み込まれたとき
    document.addEventListener("init", function (event) {
        // カレンダーページ
        if (event.target.matches("#calendar_page")) {
            console.log("calendar_page init");

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
                            let total = 0;
                            for (let obj of array) {
                                total += (parseInt(obj.ret, 10) - parseInt(obj.inv, 10));
                            }
                            // 合計金額を表示
                            node.innerHTML = total;
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

            // 選択日付の一覧表示
            app.setSelectDateList();
        }
        // セッティングページ
        if (event.target.matches("#settings_page")) {
        }
    }, false);
    // onsenUIのページが破棄されるとき
    document.addEventListener("destroy", function (event) {
        // カレンダーページ
        if (event.target.matches("#calendar_page")) {
            console.log("calendar_page destroy");
        }
        // セッティングページ
        if (event.target.matches("#settings_page")) {
        }
    }, false);
    // onsenUIのページが画面に現れるたび
    document.addEventListener("show", function (event) {
        // カレンダーページ
        if (event.target.matches("#calendar_page")) {
            console.log("calendar_page show");
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
        // セッティングページ
        if (event.target.matches("#settings_page")) {
        }
    }, false);

});
