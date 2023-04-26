({
  doInit: function (component) {
    /*-----For removing double scrollbar----*/
    document.body.setAttribute("style", "overflow: hidden;");
    window.setTimeout(
      $A.getCallback(function () {
        component.find("ReactApp").message(component.get("v.refRecordId"));
      }),
      5000
    );
  },

  handleError: function (component, error) {
    var description = error.getParams().description;
    component.set("v.error", description);
  },
    openQuote: function(component, event, helper) {
        var navEvt = $A.get("e.force:navigateToSObject");
    navEvt.setParams({
      "recordId": component.get("v.refRecordId"),
      "slideDevName": "Detail"
    });
    navEvt.fire();
        
         }
});