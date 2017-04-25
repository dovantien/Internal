angular.module('starter.services.UtilsService', [])
    .factory('UtilsService', function() {
        return {
            formatMoney: function(money) {
                return accounting.formatMoney(money, moneyFormatOption);
            },
            formatDateAPI: function(date) {
                return moment(date).format(dateTimeAPIFormatOption);
            },
            formatDateView: function(date) {
                return moment(date).format(dateTimeViewFormatOption);
            },
            formatUnikey: function(alias) {
                var str = alias;
                // str= str.toLowerCase(); 
                str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
                str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
                str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
                str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
                str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
                str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
                str = str.replace(/đ|Đ/g, "d");
                // str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "-");
                /* tìm và thay thế các kí tự đặc biệt trong chuỗi sang kí tự - */
                str = str.replace(/-+-/g, "-"); //thay thế 2- thành 1-
                // str = str.replace(/^\-+|\-+$/g, "");
                //cắt bỏ ký tự - ở đầu và cuối chuỗi 
                return str;
            },

            dynamicSort: function dynamicSort(property) {
                var sortOrder = 1;
                if (property[0] === "-") {
                    sortOrder = -1;
                    property = property.substr(1);
                }
                return function(a, b) {
                    var result = (a[property] < b[property]) ? -1 : (a[property] >
                        b[property]) ? 1 : 0;
                    return result * sortOrder;
                }
            },
            dynamicSortMultiple: function dynamicSortMultiple() {
                /*
                 * save the arguments object as it will be overwritten
                 * note that arguments object is an array-like object
                 * consisting of the names of the properties to sort by
                 */
                var props = arguments;
                return function(obj1, obj2) {
                    var i = 0,
                        result = 0,
                        numberOfProperties = props.length;
                    /* try getting a different result from 0 (equal)
                     * as long as we have extra properties to compare
                     */
                    while (result === 0 && i < numberOfProperties) {
                        result = dynamicSort(props[i])(obj1, obj2);
                        i++;
                    }
                    return result;
                }
            },
            activeFunFromUser: function activeFunFromUser(usergroupid, funid) {
                var result = false;
                if (listActiveFunc[funid]) {
                    for (var i = 0; i < listActiveFunc[funid].length; i++) {
                        if (listActiveFunc[funid][i] == usergroupid) {
                            result = true;
                        }
                    }
                }
                return result;
            }

        }
    });
