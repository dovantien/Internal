angular.module('starter.services.UserService', [])
  .factory('UserService', function() {
    var setUser = function(user_data) {
      Locstor.set("userData", user_data);
    };

    var getUser = function() {
      return Locstor.get("userData", null);
    };

    var getEditingOrder = function() {
      return Locstor.get("editingOrder", null);
    }
    var setEditingOrder = function(editing_order) {
      Locstor.set("editingOrder", editing_order);
    }
    var getListProductCache = function() {
      return Locstor.get("listProductCache", null);
    }
    var setListProductCache = function(list_product) {
      Locstor.set("listProductCache", list_product);
    }
    var getCacheImage = function() {
      return Locstor.get('image', null);
    }
    var setCacheImage = function(image) {
      Locstor.set("image", image);
    }
    var getHistoryOrder = function() {
      return Locstor.get('historyorder', null);
    }
    var setHistoryOrder = function(history_order) {
      Locstor.set("historyorder", history_order);
    }
    var setCurrentTable = function(currenttable) {
      Locstor.set("currenttable", currenttable);
    }
    var getCurrentTable = function() {
      return Locstor.get('currenttable', null);
    }
    return {
      getUser: getUser,
      setUser: setUser,
      setEditingOrder: setEditingOrder,
      getEditingOrder: getEditingOrder,
      getListProductCache: getListProductCache,
      setListProductCache: setListProductCache,
      getCacheImage: getCacheImage,
      setCacheImage: setCacheImage,
      getHistoryOrder: getHistoryOrder,
      setHistoryOrder: setHistoryOrder,
      setCurrentTable: setCurrentTable,
      getCurrentTable: getCurrentTable
    };
  });
