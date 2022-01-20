sap.ui.define([
    "yauheni/kazlouski/app/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("yauheni.kazlouski.app.controller.ProductDetails", {
        onInit: function() {
            var oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();
            
            oRouter.getRoute("ProductDetails").attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched: function(oEvent) {
            var that = this;
            var oODataModel = this.getView().getModel("odata");
            var sProductID = oEvent.getParameter("arguments").ProductID;

            oODataModel.metadataLoaded().then(function () {
                var sPath = oODataModel.createKey("/Products", {ID: sProductID});
                
                that.getView().bindObject({
                    path: sPath,
                    model: "odata",
                    parameters: {
                        expand: "Supplier"
                    }
                });
            });
        },
        
        onNavToSupplierListPress: function () {
            this.navigateTo("SuppliersOverview");
        },
        
        onNavToSupplierDetailsPress: function (oEvent) {
            var sSupplierID = oEvent.getSource().getBindingContext("odata").getObject("Supplier").ID;

            this.navigateTo("SupplierDetails", {SupplierID: sSupplierID});
        },

        onEditButtonPress: function() {
            var oEditModel = this.getView().getModel("editModel");
           
            this.toggleEditMode(oEditModel);
        },

        onSaveProductChangesPress: function() {
            var oODataModel = this.getView().getModel("odata");
            var oEditModel = this.getView().getModel("editModel");

            oODataModel.submitChanges();
            this.toggleEditMode(oEditModel)
        },

        onCancelProductChangesPress: function () {
            var oODataModel = this.getView().getModel("odata");
            var oEditModel = this.getView().getModel("editModel");

            oODataModel.resetChanges();
            this.toggleEditMode(oEditModel);
        }
    });
});
