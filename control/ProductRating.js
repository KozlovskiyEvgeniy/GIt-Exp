sap.ui.define([
	"sap/ui/core/Control",
    "sap/m/MultiInput",
	"sap/m/Label",
	"sap/m/Button"
], function(
	Control, MultiInput, Label, Button
) {
	"use strict";

	return Control.extend("yauheni.kazlouski.app.control.ProductRating", {
        metadata: {
            properties: {
                value: {type: "string", defaultValue: ""}
            },
            aggregations: {
                _multiInput: {type: "sap.m.MultiInput", multiple: false},
				_label : {type : "sap.m.Label", multiple: false, visibility : "hidden"},
				_button : {type : "sap.m.Button", multiple: false, visibility : "hidden"}
            },
            events: {
                tokenUpdate :{
                    parameters: {
                        addedTokens: {type: "sap.m.Token[]"},
                        removedTokens: {type: "sap.m.Token[]"}
                    }
                }
            }
        },
        init: function (){
            this.setAggregation("_multiInput", new MultiInput({
				value: this.getValue(),
				visualMode: "Half"
			}));
			this.setAggregation("_label", new Label({
				text: "Selected Items"
			}));
			this.setAggregation("_button", new Button({
				icon: "sap-icon://sys-cancell"
			}));
        },
        rerender: function(oRM, oControl) {
            oRM.write("<div");
			oRM.writeControlData(oControl);

			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_multiInput"));
			oRM.renderControl(oControl.getAggregation("_label"));
			oRM.renderControl(oControl.getAggregation("_button"));
			oRM.write("</div>");
            
        
        }
	});
});