var moneyFormatOption = {
    symbol: "đ",
    format: "%v %s",
    decimal: ".", // decimal point separator
    thousand: ",",
    precision: 0
};
var FuncProc = {
    NewGetListOrderComplete: {
        cartStatus: 8,
        prodStatus: 11
    },
    NeworderCompleteDetail: {
        funid: 12
    },
    NewfunctionR: {
        funid: 9
    },
    NewcompleteProduce: {
        funid: 13
    },
    NewgetListHistory: {
        funidMore: 11,
        funidToday: 10
    },

    OldGetListOrderComplete: {
        cartStatus: 3,
        prodStatus: 5
    },
    OldorderCompleteDetail: {
        funid: 4
    },
    OldfunctionR: {
        funid: 5
    },
    OldcompleteProduce: {
        funid: 3
    },
    OldgetListHistory: {
        funidMore: 1,
        funidToday: 0
    }

};
var proxyURL = 'http://localhost:1337/';
var dateTimeAPIFormatOption = 'YYYY-MM-DD HH:mm:ss';
var dateTimeViewFormatOption = 'YYYY-MM-DD HH:mm';
var MSG_CAN_ADD_MORE =
    'Sửa đơn hàng có lỗi. Số lượng của một sản phẩm không được lớn hơn so với đơn hàng cũ';
var MSG_CONFIRM_CANCEL_ORDER = 'Bạn có chắc chắn muốn huỷ đơn hàng không?';
var MSG_RE_LOGIN = 'Phiên giao dịch của bạn đã kết thúc. Để nghị đăng nhập lại đế tiếp tục.';
var NUMBER_VERSION = 12;
var CLIENT_IOS_VERSION = 'Ios_2.0.1';
var CLIENT_ANDROID_VERSION = 'Android_2.0.1';
var CHANNEL = 'production';
var DEPLOY_VERSION = 12;
// var CHANNEL = 'dev';
// var DEPLOY_VERSION = 12;

//Phân quyền
//trong mảng là danh sách các usergroupid có quyền
// [12/12/16, 10:13:29 AM] hohaitac: 1 -Phục vụ
// [12/12/16, 10:13:34 AM] hohaitac: 2 - Bếp
// [12/12/16, 10:13:34 AM] hohaitac: 3 - Bar
// [12/12/16, 10:13:46 AM] hohaitac: 4 - Thu ngân
// [12/12/16, 10:13:55 AM] hohaitac: 5 - Trưởng quầy
var listActiveFunc = {
    1: [0, 1, 5], //xem trang order
    2: [0, 1, 5], //xem trang orderhistory
    3: [0, 1, 5], //sửa , xóa đơn hàng chưa sx
    4: [0, 2, 3, 5], //xem trang bar + bếp
    5: [0, 4, 5], //xem trang cashier
    6: [0, 5], //Hủy Đơn, trả lại đơn mọi trường hợp
};
//Defautl trang
var listDefautlPage = {
    0: 'app.order',
    1: 'app.order',
    2: 'app.barorder',
    3: 'app.barorder',
    4: 'app.cashier',
    5: 'app.order'
}
