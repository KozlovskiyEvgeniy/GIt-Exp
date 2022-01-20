sap.ui.define([
    "yauheni/kazlouski/app/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",

], function (BaseController, Filter, FilterOperator, MessageToast, formatter, JSONModel) {
    "use strict";

    return BaseController.extend("yauheni.kazlouski.app.controller.SupplierDetails", {
        formatter: formatter,
        onInit: function() {
            var oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();

            oRouter.getRoute("SupplierDetails").attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched: function(oEvent){
            var that = this;
            var sSupplierID = Number(oEvent.getParameter("arguments").SupplierID);
            var oODataModel = this.getView().getModel("odata");

            oODataModel.metadataLoaded().then(function () {
                var sPath = oODataModel.createKey("/Suppliers", {ID: sSupplierID});

                that.getView().bindObject({
                    path: sPath,
                    model: "odata"
                })
            });
        },

        onNavToSupplierListPress: function () {
            this.navigateTo("SuppliersOverview");
        },
        
        onProductsTableListItemPress: function (oEvent) {
            var oSource = oEvent.getSource();
            var oCtx = oSource.getBindingContext("odata");
            var sSupplierID = this.getView().getBindingContext("odata").getObject("ID");

            this.navigateTo("ProductDetails", {SupplierID: sSupplierID,ProductID: oCtx.getObject("ID")});
        },

        onProductsSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query").toString()
            var oProductsTable = this.byId("productsTable");
            var oItemsBinding = oProductsTable.getBinding("items");
            var oProductsFilter;

            if (sQuery === '') {

            } else if (!isNaN(sQuery)) {
                oProductsFilter = new Filter({
                    filters:[
                        new Filter("Price", FilterOperator.EQ, Number(sQuery)),
                        new Filter("Rating", FilterOperator.EQ, Number(sQuery)),
                        new Filter("Name", FilterOperator.Contains, sQuery),
                        new Filter("Description", FilterOperator.Contains, sQuery),
                ], or: true});
            } else if (Date.parse(sQuery)) {
                oProductsFilter = new Filter({
                    filters:[
                        new Filter("Name", FilterOperator.Contains, sQuery),
                        new Filter("Description", FilterOperator.Contains, sQuery),
                        new Filter("ReleaseDate", FilterOperator.EQ, Date.parse(sQuery)),
                        new Filter("DiscontinuedDate", FilterOperator.EQ, Date.parse(sQuery)),
                ], or: true});
            } else {
                oProductsFilter = new Filter({
                    filters:[
                        new Filter("Name", FilterOperator.Contains, sQuery),
                        new Filter("Description", FilterOperator.Contains, sQuery)
                ], or: true});
            }

            oItemsBinding.filter(oProductsFilter);
        },

        onEditButtonPress: function () {
            var oEditModel = this.getView().getModel("editModel");
             
            this.toggleEditMode(oEditModel);
        },

        onSaveProductChangesPress: function () {
            var oEditModel = this.getView().getModel("editModel");
            var oODataModel = this.getView().getModel("odata");

            oODataModel.submitChanges();
            this.toggleEditMode(oEditModel);
        },

        onCancelProductChangesPress: function () {
            var oODataModel = this.getView().getModel("odata");
            var oEditModel = this.getView().getModel("editModel");
			
            oODataModel.resetChanges();
            this.toggleEditMode(oEditModel);
        },

        onCreateNewProductPress: function () {
            var oView = this.getView();
            var oODataModel = oView.getModel("odata");
            var nSupplierID = this.getView().getBindingContext("odata").getObject("ID");

            this.createDeferredGroup("NewProduct");
            var oEntryContext = oODataModel.createEntry(`Suppliers(${nSupplierID})/Products`, {
                groupId: "NewProduct",
                properties: {
                    ID: this.getNewID()
                }
            });
            
            if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "yauheni.kazlouski.app.view.fragments.CreateProductDialog",
                    this
				);
				oView.addDependent(this.oDialog);
			};


            sap.ui.getCore().getMessageManager().registerObject(this.oDialog, true);
            this.oDialog.setBindingContext(oEntryContext);
			this.oDialog.setModel(oODataModel);
			this.oDialog.open();
        },

        onCreateProduct: function (oEvent) {
            var oODataModel = this.getView().getModel("odata");
            
            oODataModel.submitChanges({groupId: "NewProduct"});
            this.oDialog.close();
        },

        onCancelCreateProduct: function (oEvent) {
            var oODataModel = this.getView().getModel("odata");
			var oEntryContext = this.oDialog.getBindingContext();
            var aInputsArray = this.getView().getControlsByFieldGroupId("newProductInputs")
                .filter(control => control.isA("sap.m.Input") || control.isA("sap.m.DatePicker"));

            aInputsArray.forEach(function (oInput) {
                oInput.setValue("");
                oInput.setValueState("None")
            });

            oODataModel.resetChanges([oEntryContext.getPath()], undefined, true);
            oODataModel.refresh();
            this.oDialog.close();
        },

        onInputChange: function(oEvent) {
			var oSource = oEvent.getSource();

			this.validateInput(oSource);
		},

        onVerifyInputs: function(oEvent) {
			var oResourceBundle = this.getView().getModel("i18n");
      		var bValidationError = false;
            var oReleaseDate = this.byId("newProductReleaseDate");
            var oDiscontinuedDate = this.byId("newProductDiscountDate");
            var aInputs = this.getView().getControlsByFieldGroupId("newProductInputs")
                .filter(control => control.isA("sap.m.Input"));
            
            if (oReleaseDate.getValue() === "") {
				oReleaseDate.setValueState("Error");
				bValidationError = true;
			} else {
				oReleaseDate.setValueState("None");
			};

            if (oDiscontinuedDate.getValue() === "") {
				oDiscontinuedDate.setValueState("Error");
				bValidationError = true;
			} else {
				oDiscontinuedDate.setValueState("None");
			};

      		aInputs.forEach(function (oInput) {
      		  bValidationError = this.validateInput(oInput) || bValidationError;
      		}, this);

      		if (!bValidationError) {
                this.onCreateProduct(oEvent);
      		} else {
      		    MessageToast.show(oResourceBundle.getProperty("ProductValidationErrorMessage"));
      		};
		},

        onDeleteSuppliersButtonPress: function (oEvent) {
            var oResourceBundle = this.getView().getModel("i18n");
            var sPath = oEvent.getSource().getBindingContext("odata").getPath();
            var oODataModel=this.getView().getModel("odata");

            oODataModel.remove(sPath);
            this.navigateTo("SuppliersOverview");
            MessageToast.show(oResourceBundle.getProperty("DeleteSupplierMessage"));
        }
    }); 
});
