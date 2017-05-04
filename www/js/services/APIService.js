angular.module('starter.services.APIService', [])
  .factory('APIService', function($http, UserService) {
    function updateSession(newsession) {
      var user = UserService.getUser();
      user.sessionkey = newsession;
      UserService.setUser(user);
    }
    var proxyURL = 'http://mycafe.co:3011'
    var api_get_authkey = function(apiData) {
      return $http.post(proxyURL + '/getauthkey', apiData);
    };
    var api_login = function(apiData) {
      return $http.post(proxyURL + '/login', apiData);
    };
    var api_logout = function(apiData) {
      return $http.post(proxyURL + '/logout', apiData);
    };
    var api_changepassword = function(apiData) {
      return $http.post(proxyURL + '/changepassword', apiData);
    };
    var api_get_category = function(apiData) {
      return $http.post(proxyURL + '/getcategory', apiData);
    };
    var api_get_product = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      console.log(JSON.stringify(apiData));
      return $http.post(proxyURL + '/getproduct', apiData).success(function(result) {
        updateSession(result.session);
      });
    };
    var api_get_table_chair = function(apiData) {
      return $http.post(proxyURL + '/getshoptable', apiData);
    };
    var api_prod_option = function(apiData) {
      return $http.post(proxyURL + '/getProdOption', apiData);
    };
    var api_addpurchased = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/addpurchased', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_addpurchased_new = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/addpurchasedNew', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_get_history_order = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.shopid = UserService.getUser().shopid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/getlistpurchasedcart', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_get_detail_order = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/getdetailorder', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_edit_order = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/editorder', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_get_barorder = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/getListWaittingProduct', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    }
    var api_get_barorder_test = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/getListWaittingProducttest', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_cancel_order = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/cancelorder', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_update_product = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/updateproduct', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_update_cart = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/updatecart', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };

    //Duong
     var api_get_barhistory = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/getListHistoryProduct', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_get_barhistory_new = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/getListHistoryProductNew', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_refund_product = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/refundProduct', apiData).success(function(result) {
        if (result.session != null) {
          updateSession(result.session);
        }
      });
    };
    var api_get_shopdetail = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/getListShop', apiData).success(function(result) {
        if(result.session != null){
          updateSession(result.session);
        }
      });
    };
    var api_writeLogFile = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/writeLog', apiData).success(function(result) {
        if(result.session != null){
          updateSession(result.session);
        }
      });
    };
    var api_set_autoPrint = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/autoprint', apiData).success(function(result) {
        if(result.session != null){
          updateSession(result.session);
        }
      });
    };
    var api_set_AddPurchasedProductNewFunc = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/AddPurchasedProductNewFunc', apiData).success(function(result) {
        if(result.session != null){
          updateSession(result.session);
        }
      });
    };
    var api_update_PrintStatus = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/UpdatePrintStatus', apiData).success(function(result) {
        if(result.session != null){
          updateSession(result.session);
        }
      });
    };
    var api_update_updatecachebill = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/updatecachebill', apiData).success(function(result) {
        if(result.session != null){
          updateSession(result.session);
        }
      });
    };
    var api_getcachebill = function(apiData) {
      apiData.userid = UserService.getUser().userid;
      apiData.session = UserService.getUser().sessionkey;
      return $http.post(proxyURL + '/getcachebill', apiData).success(function(result) {
        if(result.session != null){
          updateSession(result.session);
        }
      });
    };


    return {
      api_get_authkey: api_get_authkey,
      api_login: api_login,
      api_get_category: api_get_category,
      api_get_product: api_get_product,
      api_logout: api_logout,
      api_changepassword: api_changepassword,
      api_get_table_chair: api_get_table_chair,
      api_prod_option: api_prod_option,
      api_addpurchased: api_addpurchased,
      api_get_history_order: api_get_history_order,
      api_edit_order: api_edit_order,
      api_get_barorder: api_get_barorder,
      api_get_detail_order: api_get_detail_order,
      api_cancel_order: api_cancel_order,
      api_update_product: api_update_product,
      api_update_cart:api_update_cart,
      //Duong
      api_get_barhistory:api_get_barhistory,
      api_get_shopdetail:api_get_shopdetail,
      api_get_barorder_test:api_get_barorder_test,
      api_addpurchased_new:api_addpurchased_new,
      api_get_barhistory_new:api_get_barhistory_new,
      api_refund_product:api_refund_product,
      api_writeLogFile:api_writeLogFile,
      api_set_autoPrint:api_set_autoPrint,
      api_set_AddPurchasedProductNewFunc:api_set_AddPurchasedProductNewFunc,
      api_update_PrintStatus:api_update_PrintStatus,
      api_update_updatecachebill:api_update_updatecachebill,
      api_getcachebill:api_getcachebill
    };
  });
