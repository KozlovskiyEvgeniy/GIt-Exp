sap.ui.define([
    "yauheni/kazlouski/app/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
], function (BaseController, Filter, FilterOperator, MessageToast, JSONModel, formatter) {
    "use strict";

    return BaseController.extend("yauheni.kazlouski.app.controller.SuppliersOverview", {
        formatter: formatter,
        onInit: function() {
            var oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();
            var oAppView = new JSONModel({
                suppliersFilters: [
                    new Filter("Name", FilterOperator.Contains, ""), 
                    new Filter("Name", FilterOperator.Contains, "")
                ]
            });
    
            this.oAppView = oAppView;
            this.getView().setModel(oAppView, "appView");
        },

        onSelectDataRecieved: function() {
            var oSuppliersFilter = this.byId("supplersNameFilter");
            var oShowAllItem = new sap.ui.core.Item({key: "all", text: "Show all"});

            oSuppliersFilter.insertItem(oShowAllItem, 0);
            oSuppliersFilter.setSelectedKey("all");
        },

        onSuppliersTableListItemPress: function (oEvent) {
            var oSource = oEvent.getSource();
            var sSupplierID = oSource.getBindingContext("odata").getObject("ID");

            this.navigateTo("SupplierDetails", {SupplierID: sSupplierID});
        },

        onSupplierSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var aSuppliersFilters = this.oAppView.getProperty("/suppliersFilters");
            var oSuppliersFilter = new Filter({
                filters:[
                    new Filter("Name", FilterOperator.Contains, sQuery),
                    new Filter("Address/Country", FilterOperator.Contains, sQuery),
                    new Filter("Address/State", FilterOperator.Contains, sQuery),
                    new Filter("Address/City", FilterOperator.Contains, sQuery),
                    new Filter("Address/Street", FilterOperator.Contains, sQuery),
            ], or: true});

            aSuppliersFilters[0] = oSuppliersFilter;
            this._onSuppliersFiltersConnect(aSuppliersFilters);
        },

        onFilterBarSearchPress: function () {
            var sSelectedItemKey = this.byId("supplersNameFilter").getSelectedKey();
            var aSuppliersFilters = this.oAppView.getProperty("/suppliersFilters");
            var oSuppliersFilter;

            if (sSelectedItemKey === "all"){
                oSuppliersFilter = new Filter("Name", FilterOperator.Contains, "");
                aSuppliersFilters[1] = oSuppliersFilter;
                this._onSuppliersFiltersConnect(aSuppliersFilters);
            } else {
                oSuppliersFilter = new Filter("Name", FilterOperator.Contains, sSelectedItemKey);
                aSuppliersFilters[1] = oSuppliersFilter;
                this._onSuppliersFiltersConnect(aSuppliersFilters);
            };
        },

        _onSuppliersFiltersConnect: function (aFilters) {
            var oItemsBinding = this.byId("suppliersTable").getBinding("items");
            var oSuppliersTableFilter = new Filter({filters : aFilters, and:true});

            oItemsBinding.filter(oSuppliersTableFilter);
        },

        onCreateSupplierDialog: function (oEvent) {
            var oView = this.getView();
            var oODataModel = oView.getModel("odata");

            this.createDeferredGroup("NewSupplier");
            var oEntryContext = oODataModel.createEntry("/Suppliers", {
                groupId: "NewSupplier",
                properties: {
                    ID: this.getNewID()
                }
            });

            if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "yauheni.kazlouski.app.view.fragments.CreateSupplierDialog",
                    this
				);
				oView.addDependent(this.oDialog);
			};

            sap.ui.getCore().getMessageManager().registerObject(this.oDialog, true);
            this.oDialog.setBindingContext(oEntryContext);
			this.oDialog.setModel(oODataModel);
			this.oDialog.open();
        },

        onCreateSupplier: function (oEvent, sSupplierID) {
            var oView = this.getView();
            var oODataModel = oView.getModel("odata");

            oODataModel.submitChanges({groupId: "NewSupplier"}); 
            this.oDialog.close();
            this.navigateTo("SupplierDetails", {SupplierID: sSupplierID});
        },

        onCancelCreateSupplier: function () {
            var oODataModel = this.getView().getModel("odata");
			var oEntryContext = this.oDialog.getBindingContext();
            var aInputsArray = this.getView().getControlsByFieldGroupId("createNewSupplierInputs")
                .filter(control => control.isA("sap.m.Input") || control.isA("sap.m.DatePicker"));

            aInputsArray.forEach(function (oInput) {
                oInput.setValue("");
                oInput.setValueState("None")
            });
			
			oODataModel.resetChanges([oEntryContext.getPath()], undefined, true)
            this.oDialog.close();
        },

        onInputChange: function(oEvent) {
			var oSource = oEvent.getSource();

			this.validateInput(oSource);
		},

        onVerifyInputs: function(oEvent) {
			var oResourceBundle = this.getView().getModel("i18n");
            var aInputs = this.getView().getControlsByFieldGroupId("createNewSupplierInputs")
                .filter(control => control.isA("sap.m.Input"));
      		var bValidationError = false;
            var sSupplierID = oEvent.getSource().getBindingContext().getObject("ID");

      		aInputs.forEach(function (oInput) {
      		  bValidationError = this.validateInput(oInput) || bValidationError;
      		}, this);
		  
      		if (!bValidationError) {
                this.onCreateSupplier(oEvent, sSupplierID);
      		} else {
      		    MessageToast.show(oResourceBundle.getProperty("SupplierValidationErrorMessage"));
      		};
		}
    });
});
