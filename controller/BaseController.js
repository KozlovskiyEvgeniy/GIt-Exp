sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("yauheni.kazlouski.app.controller.BaseController", {
        navigateTo: function(sName, oParameters){
            this.getOwnerComponent().getRouter().navTo(sName, oParameters);
        },

        toggleEditMode: function (oEditModel) {
            var bEditIndicator = oEditModel.getProperty("/EditIndicator");

            return oEditModel.setProperty("/EditIndicator", !bEditIndicator)
        },

        createDeferredGroup: function (sGroupName) {
            var oODataModel = this.getView().getModel("odata");
            var aDeferredGroups = oODataModel.getDeferredGroups();

            if (!aDeferredGroups.includes(sGroupName)) {
                oODataModel.setDeferredGroups(aDeferredGroups.concat([sGroupName]))
            }
        },

        getNewID: function () {
            var oSuppliersObjects = this.getView().getModel("odata").getObject("/");
            var nMaxSuppliersID = Math.max(...Object.values(oSuppliersObjects).map( oSupplier => oSupplier.ID));

            return nMaxSuppliersID + 1
        },

        validateInput: function(oInput) {
            var sInputState = "None";
            var bValidationError = false;

            try {
                var oBinding = oInput.getBinding("value");
                oBinding.getType().validateValue(oInput.getValue());
            } catch (oError) {
                sInputState = "Error";
                bValidationError = true;
            };

            oInput.setValueState(sInputState);
            return bValidationError;
        }
    });
});