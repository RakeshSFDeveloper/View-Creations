/*
Developed By Congruent Info-Tech
Class for handle Product and Custom settings Operations
*/
global with sharing class SObjectController {
  public static Set<String> customViewNamesSet = new Set<String>();

  /*
  Context: To retrieve essential schema based on sObjectName
  @param sObjectName -> passing sObjectName as String
  */
  @RemoteAction
  global static List<Schema.DescribeFieldResult> retrievingSchema(
    String sObjectName
  ) {
    Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe()
      .get(sObjectName)
      .getDescribe()
      .fields.getMap();
    List<Schema.DescribeFieldResult> results = new List<Schema.DescribeFieldResult>();
    for (String fieldName : fieldMap.keySet()) {
      results.add(fieldMap.get(fieldName).getDescribe());
    }
    return results;
  }

  /*
  Context: To get All values of Line Items 
  @param quoteRecordId-> passing quoteID from button in Quote(record page)
  */
  @RemoteAction
  global static List<QuoteLineItem> getLineItems(Id quoteRecordId) {
    List<String> necessaryFields = getLineItemFields();
    List<String> fieldApiNamesList = new List<String>();
    for (
      Schema.DescribeFieldResult schemaDescribe : retrievingSchema(
        constants.SOBJECT_APINAME
      )
    ) {
      String fieldLabel = schemaDescribe.getLabel();
      if (necessaryFields.contains(fieldLabel)) {
        fieldApiNamesList.add(schemaDescribe.getName());
      }
    }
    String query =
      ' SELECT Product2.Name, TotalPrice, ' +
      String.join(fieldApiNamesList, ',') +
      ' FROM ' +
      Constants.SOBJECT_APINAME +
      ' WHERE QuoteId =:quoteRecordId';

    return Database.query(String.escapeSingleQuotes(query));
  }

  /*
  Context: To get Field labels, Api's, Datatypes for Line Items in a 
  JSON Structure.
  */
  @RemoteAction
  global static String getQLILabelAndApi() {
    List<String> necessaryFields = getLineItemFields();

    JSONGenerator fieldObjectArray = JSON.createGenerator(true);
    fieldObjectArray.writeStartObject();
    fieldObjectArray.writeFieldName('FieldData');
    fieldObjectArray.writeStartArray();

    String fieldLabel;
    String fieldApi;
    String dataTypeOfField;

    for (
      Schema.DescribeFieldResult schemaDescribe : retrievingSchema(
        constants.SOBJECT_APINAME
      )
    ) {
      fieldLabel = schemaDescribe.getLabel();
      fieldApi = schemaDescribe.getName();
      dataTypeOfField = String.valueOf(schemaDescribe.getType());
      if (
        (fieldLabel == 'Product ID') ||
        (fieldLabel == 'Total Price') ||
        (dataTypeOfField != 'ID' && necessaryFields.contains(fieldLabel))
      ) {
        if (fieldLabel == 'Product ID') {
          fieldLabel = 'Product';
          fieldApi = 'Product';
          dataTypeOfField = 'STRING';
        }
        fieldObjectArray.writeStartObject();
        fieldObjectArray.writeStringField('FieldApi', fieldApi);
        fieldObjectArray.writeStringField('FieldLabel', fieldLabel);
        fieldObjectArray.writeStringField('FieldDataType', dataTypeOfField);
        fieldObjectArray.writeEndObject();
      }
    }
    fieldObjectArray.writeEndArray();
    fieldObjectArray.writeEndObject();
    return fieldObjectArray.getAsString();
  }

  /*
  Context: Create search value input as a new Record in Recent History
  @param searchInput-> passing user input from UI as String
  */
  @RemoteAction
  global static void addRecentSearch(String searchInput) {
    Boolean isDuplicate = false;
    List<Recent_History__c> recentHistoriesList = [
      SELECT Name
      FROM Recent_History__c
      WITH SECURITY_ENFORCED
      ORDER BY LastModifiedDate ASC
    ];
    for (Recent_History__c recentHistory : recentHistoriesList) {
      if (recentHistory?.Name == searchInput) {
        isDuplicate = true;
        break;
      }
    }
    if (isDuplicate) {
      return;
    }
    if (recentHistoriesList.size() < Constants.MAX_RECENTHISTORIES_LIMIT) {
      Recent_History__c recentHistory = new Recent_History__c();
      recentHistory.Name = searchInput;
      CRUDUtility.insertRecords(recentHistory);
    } else if (
      recentHistoriesList.size() >= Constants.MAX_RECENTHISTORIES_LIMIT
    ) {
      recentHistoriesList[0].Name = searchInput;
      CRUDUtility.updateRecords(recentHistoriesList[0]);
    }
  }

  /*
  Context: Get the values for Recent Searches History
  */
  @RemoteAction
  global static List<Recent_History__c> getRecentSearches() {
    List<Recent_History__c> recentHistoriesList = [
      SELECT Name
      FROM Recent_History__c
      WITH SECURITY_ENFORCED
      ORDER BY LastModifiedDate DESC
    ];
    return recentHistoriesList;
  }

  /*
  Context: Create new records in Custom settings for Line Item Table views
  @param viewName and status-> passing viewName to created in custom Setting as String
  @param selectedFieldsList -> passing line item fields as List from UI
  */
  @RemoteAction
  global static String toCreateLineItemView(
    String[] viewNameAndStatus,
    List<String> selectedFieldsList
  ) {
    String fieldsSelected = '';
    String customViewStatus;
    SObjectController.getLineItemViews();
    if (!customViewNamesSet.contains(viewNameAndStatus[0])) {
      if (boolean.valueOf(viewNameAndStatus[1]) == true) {
        SObjectController.removeExistingDefaultView();
      }
      fieldsSelected = String.join(selectedFieldsList, ',');
      fieldsSelected += ',';
      CPQ_LineItem_Custom_Views__c createLineItemView = new CPQ_LineItem_Custom_Views__c(
        Name = viewNameAndStatus[0],
        View_Fields__c = fieldsSelected,
        Is_Default__c = boolean.valueOf(viewNameAndStatus[1])
      );
      CRUDUtility.insertRecords(createLineItemView);
      customViewStatus = Constants.SUCCESS;
    }
    return customViewStatus;
  }

  /*
  Context: Edit existing Views in Custom settings for Line Item Table views
  @param viewDetails-> passing viewnames and status as list to check edit
  @param selectedFieldsList -> passing line item fields selected from UI as List
  */
  @RemoteAction
  global static String editLineItemView(
    String[] viewDetails,
    List<String> selectedFieldsList
  ) {
    String fieldsSelected = '';
    String customViewStatus;
    List<CPQ_LineItem_Custom_Views__c> lineItemViews = CPQ_LineItem_Custom_Views__c.getall()
      .values();
    if (boolean.valueOf(viewDetails[2]) == true) {
      SObjectController.removeExistingDefaultView();
    }
    SObjectController.getLineItemViews();
    if (
      !customViewNamesSet.contains(viewDetails[1]) ||
      viewDetails[0] == viewDetails[1]
    ) {
      fieldsSelected = String.join(selectedFieldsList, ',');
      fieldsSelected += ',';
      CPQ_LineItem_Custom_Views__c lineItemView = CPQ_LineItem_Custom_Views__c.getValues(
        viewDetails[0]
      );
      if (lineItemView.Is_Default__c == true) {
        SObjectController.setDefaultView();
      }
      lineItemView.Name = viewDetails[1];
      lineItemView.View_Fields__c = fieldsSelected;
      lineItemView.Is_Default__c = boolean.valueOf(viewDetails[2]);
      CRUDUtility.updateRecords(lineItemView);
      customViewStatus = Constants.SUCCESS;
    }
    return customViewStatus;
  }

  /*
  Context: Unchecked Default view of all existing Views in Custom settings for Line Item Table views
  */
  @RemoteAction
  global static String removeExistingDefaultView() {
    List<CPQ_LineItem_Custom_Views__c> lineItemViews = CPQ_LineItem_Custom_Views__c.getall()
      .values();
    List<CPQ_LineItem_Custom_Views__c> setLineItemView = new List<CPQ_LineItem_Custom_Views__c>();
    for (CPQ_LineItem_Custom_Views__c lineItemView : lineItemViews) {
      if (lineItemView.Is_Default__c == true) {
        lineItemView.Is_Default__c = false;
      }
      setLineItemView.add(lineItemView);
    }
    CRUDUtility.updateRecords(setLineItemView);
    return constants.SUCCESS;
  }

  /*
  Context: Set a Default view if no values assigned as default from existing Views in Custom settings for Line Item Table views
  */
  @RemoteAction
  global static string setDefaultView() {
    CPQ_LineItem_Custom_Views__c defaultLineItemView = CPQ_LineItem_Custom_Views__c.getValues(
      constants.DEFAULT_VIEW
    );
    defaultLineItemView.Is_Default__c = true;
    CRUDUtility.updateRecords(defaultLineItemView);
    return constants.SUCCESS;
  }

  /*
  Context: To  Get Quote Line Item Picklist fields
  */
  @RemoteAction
  global static Map<String, List<String>> getPicklists(string objectApiName) {
    Map<String, List<String>> labelAndPicklistMap = new Map<String, List<String>>();
    List<String> necessaryFields = getLineItemFields();
    List<String> picklistValuesList;
    for (
      Schema.DescribeFieldResult schemaDescribe : retrievingSchema(
        objectApiName
      )
    ) {
      String fieldLabel = schemaDescribe.getLabel();
      String fieldDatatype = String.valueOf(schemaDescribe.getType());

      if (
        fieldDatatype == Constants.PICKLIST &&
        necessaryFields.contains(fieldLabel)
      ) {
        picklistValuesList = new List<String>();
        for (
          Schema.PicklistEntry picklistValue : schemaDescribe.getPicklistValues()
        ) {
          if (picklistValue.isActive()) {
            picklistValuesList.add(picklistValue.getValue());
          }
        }
        labelAndPicklistMap.put(fieldLabel, picklistValuesList);
      }
    }
    return labelAndPicklistMap;
  }

  /*
  Context: Delete existing records in Custom settings for Table views
  @param viewName -> passing viewName of a custom setting which is to be deleted 
  */
  @RemoteAction
  global static String deleteLineItemView(String viewName) {
    CPQ_LineItem_Custom_Views__c lineItemView = CPQ_LineItem_Custom_Views__c.getValues(
      viewName
    );
    if (lineItemView.Is_Default__c == true) {
      SObjectController.setDefaultView();
    }
    CRUDUtility.deleteRecords(lineItemView);
    return Constants.SUCCESS;
  }

  /*
  Context: Get all Custom Settings of created custom views for Line Item
  */
  @RemoteAction
  global static Map<String, Map<Boolean, List<String>>> getLineItemViews() {
    Map<String, Map<Boolean, List<String>>> viewPropertiesMap = new Map<String, Map<Boolean, List<String>>>();
    Map<String, CPQ_LineItem_Custom_Views__c> lineItemViewsMap = CPQ_LineItem_Custom_Views__c.getall();
    customViewNamesSet = lineItemViewsMap.keySet();
    for (String viewName : lineItemViewsMap.keySet()) {
      if (!viewPropertiesMap.containskey(viewName)) {
        viewPropertiesMap.put(viewName, new Map<Boolean, List<String>>());
      }
      Map<Boolean, List<String>> viewStatusAndFieldsMap = viewPropertiesMap.get(
        viewName
      );
      List<String> viewFieldsList = new List<String>();
      viewFieldsList.addAll(
        lineItemViewsMap.get(viewName).View_Fields__c.split(',')
      );
      viewStatusAndFieldsMap.put(
        (lineItemViewsMap.get(viewName).Is_Default__c),
        viewFieldsList
      );
      viewPropertiesMap.put(viewName, viewStatusAndFieldsMap);
    }
    return viewPropertiesMap;
  }

  /*
  Context: To get the Necessary fields of Line Items from Custom Settings
  */
  @RemoteAction
  global static List<String> getLineItemFields() {
    return CPQ_Necessary_Fields__c.getall()
      .values()
      ?.Product_Fields__c
      ?.split(',');
  }

  /*
  Context: To Get active Products which belongs to Standard Price book
  */
  @RemoteAction
  global static List<PricebookEntry> getActiveProducts() {
    List<PricebookEntry> activeProductsList = [
      SELECT Product2.Name, Product2.Description, Product2.Image__c, UnitPrice
      FROM PricebookEntry
      WHERE
        Pricebook2.Name = :Constants.PRICE_BOOK_NAME
        AND Pricebook2.isActive = :Constants.VALIDATE_TRUE
        AND Product2.IsActive = :Constants.VALIDATE_TRUE
      WITH SECURITY_ENFORCED
    ];
    return activeProductsList;
  }

  /*
  Context: To get the Grand Total value for the given Quote ID
  */
  @RemoteAction
  global static Decimal getGrandTotal(Id quoteRecordId) {
    Decimal grandTotal = [
      SELECT GrandTotal
      FROM Quote
      WHERE Id = :quoteRecordId
    ]
    .GrandTotal;
    return grandTotal;
  }

  /*
  Context: To get the QLI records as JSON String and Deserialize those list of objects for Insertion
  */
  @RemoteAction
  global static void retrieveSObjects(String jsonData) {
    List<QuoteLineItem> quoteLineItemRecords = (List<QuoteLineItem>) JSON.deserialize(
      jsonData,
      List<QuoteLineItem>.class
    );
    CRUDUtility.insertRecords(quoteLineItemRecords);
  }

  /*
  Context: To get the QLI records as JSON String and Deserialize those list of objects for Update
  */
  @RemoteAction
  global static void updateLineItem(String lineItemAsString) {
    List<QuoteLineItem> quoteLineItemRecords = (List<QuoteLineItem>) JSON.deserialize(
      lineItemAsString,
      List<QuoteLineItem>.class
    );
    CRUDUtility.updateRecords(quoteLineItemRecords);
  }
}
