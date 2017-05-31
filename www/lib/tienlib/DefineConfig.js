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
//định nghĩa của DOCK SERVICE
var C2S = 0;
var S2C = 5000;


//c2s
var MSG_C2S_PING                     = C2S + 1;
var MSG_C2S_GET_DEVICES              = C2S + 2;
var MSG_C2S_CTL_DEVICE               = C2S + 3;
var MSG_C2S_CTL_DEVICE_BY_VID        = C2S + 4;
var MSG_C2S_PRINT_TEMPLATE           = C2S + 6;
var MSG_C2S_PRINT_TEMPLATE_BY_VID    = C2S + 7;
var MSG_C2S_CHANGE_WIRELESS          = C2S + 11;

//s2c
var MSG_S2C_PONG                     = S2C + 1;
var MSG_S2C_RESP_GET_DEVICES         = S2C + 2;
var MSG_S2C_RESP_CTL_DEVICE          = S2C + 3;
var MSG_S2C_RESP_PRINT_TEMPLATE      = S2C + 5;
var MSG_S2C_RESP_CHANGE_WIRELESS     = S2C + 8;
var MSG_S2C_DEVICE_STATUS            = S2C + 9;
//Error code define
var Success_Not_error = 0;
var Unknown_error = 1;
var Unknown_message_type =2;
var Device_not_found =3;
var Already_started =4;
var Cannot_start =5;
var Already_stopped =6;
var Cannot_stop =7;
    
var initizalize =15;
var Service_failed=16;
var Invalid_data=17;
var Print_device_error=18;


var proxyURL = 'http://localhost:1337/';
var dateTimeAPIFormatOption = 'YYYY-MM-DD HH:mm:ss';
var dateTimeViewFormatOption = 'YYYY-MM-DD HH:mm';
var MSG_CAN_ADD_MORE =
    'Sửa đơn hàng có lỗi. Số lượng của một sản phẩm không được lớn hơn so với đơn hàng cũ';
var MSG_CONFIRM_CANCEL_ORDER = 'Bạn có chắc chắn muốn huỷ đơn hàng không?';
var MSG_RE_LOGIN = 'Phiên giao dịch của bạn đã kết thúc. Để nghị đăng nhập lại đế tiếp tục.';
var NUMBER_VERSION = 17;
var CLIENT_IOS_VERSION = 'Ios_2.0.1';
var CLIENT_ANDROID_VERSION = 'Android_2.0.1';
var CHANNEL = 'production';
var DEPLOY_VERSION = 19;
// var CHANNEL = 'dev';
//ban cũ 'production' = 18;
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
