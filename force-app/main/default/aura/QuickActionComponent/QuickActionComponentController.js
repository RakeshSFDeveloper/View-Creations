({
  navigateToLC: function (component) {
    var evt = $A.get("e.force:navigateToComponent");
    evt.setParams({
      componentDef: "c:showAllProducts",
      componentAttributes: {
        refRecordId: component.get("v.recordId")
      }
    });
    evt.fire();
  }
});
