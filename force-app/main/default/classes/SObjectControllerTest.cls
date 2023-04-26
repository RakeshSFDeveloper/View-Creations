/*
Developed by Congruent Info-Tech
Main Test class to test logical coverage of SObjectController Class 
*/
@isTest
public class SObjectControllerTest {
  @testSetup
  static void makeData() {
    TestDataFactory.necessaryFields();
    TestDataFactory.createProducts(10);

    List<Recent_History__c> recentHistoriesList = TestDataFactory.createRecentHistories(
      4
    );
    insert recentHistoriesList;

    TestDataFactory.insertQLICustomSetting();

    CPQ_LineItem_Custom_Views__c createLineItemView = new CPQ_LineItem_Custom_Views__c(
      Name = TestDataFactory.RANDOM_STRINGS[0],
      View_Fields__c = TestDataFactory.QLI_SAMPLE_FIELDS
    );
    insert createLineItemView;

    List<String> customViewName = new List<String>{ 'View 1', 'Default View' };
    List<Boolean> isDefault = new List<Boolean>{ false, true };
    List<CPQ_LineItem_Custom_Views__c> customViews = new List<CPQ_LineItem_Custom_Views__c>();
    for (Integer viewDatas = 0; viewDatas <= 1; viewDatas++) {
      CPQ_LineItem_Custom_Views__c customView = TestDataFactory.viewCreation(
        customViewName[viewDatas],
        TestDataFactory.RANDOM_STRINGS,
        isDefault[viewDatas]
      );
      customViews.add(customView);
    }
    insert customViews;
  }

  @isTest
  static void addDuplicateRecentSearchTest() {
    SObjectController.addRecentSearch(TestDataFactory.RANDOM_STRING + ' 4');
    List<Recent_History__c> recentHistoriesList = [
      SELECT Id
      FROM Recent_History__c
    ];
    System.assertEquals(
      true,
      recentHistoriesList.size() == 4,
      'Duplicate record not found'
    );
  }

  @isTest
  static void insertRecentSearchTest() {
    SObjectController.addRecentSearch(TestDataFactory.RANDOM_STRING + ' 5');
    List<Recent_History__c> recentHistoriesList = [
      SELECT Id
      FROM Recent_History__c
    ];
    System.assertEquals(
      true,
      recentHistoriesList.size() == 5,
      'Record was not inserted successfully'
    );
  }

  @isTest
  static void updateRecentSearchTest() {
    List<Recent_History__c> recentHistoryRecordsList = TestDataFactory.createRecentHistories(
      1
    );
    insert recentHistoryRecordsList;

    SObjectController.addRecentSearch(TestDataFactory.RANDOM_STRING + ' 7');
    List<Recent_History__c> recentHistoriesList = [
      SELECT NAME
      FROM Recent_History__c
      WHERE NAME = :(TestDataFactory.RANDOM_STRING + ' 7')
    ];
    System.assertEquals(
      true,
      recentHistoriesList.size() == 1,
      'Record was not updated successfully'
    );
  }

  @isTest
  static void getRecentSearchesTest() {
    List<Recent_History__c> recentHistoryRecordsList = SObjectController.getRecentSearches();
    System.assertEquals(
      true,
      recentHistoryRecordsList.size() >= 1,
      'Failed to fetch recent searches'
    );
  }

  @isTest
  static void getLineItemsTest() {
    Id quoteId = TestDataFactory.createOpportunityAndQuote();
    List<QuoteLineItem> quoteLineItemList = SObjectController.getLineItems(
      quoteId
    );
    System.assertEquals(
      true,
      quoteLineItemList.size() > 1,
      'No Line Items Found'
    );
  }
  @isTest
  static void toCreateLineItemViewTest() {
    String[] viewNameAndStatus = new List<String>{ 'Test', 'true' };
    String processStatus = SObjectController.toCreateLineItemView(
      viewNameAndStatus,
      TestDataFactory.QUOTE_FIELD_LISTS
    );
    System.assertEquals(
      true,
      processStatus == TestDataFactory.SUCCESS,
      'Failed to create new view in custom settings'
    );
  }

  @isTest
  static void createLineItemViewTest() {
    String[] viewNameAndStatus = new List<String>{ 'View 1', 'true' };
    String newStatus = SObjectController.toCreateLineItemView(
      viewNameAndStatus,
      TestDataFactory.QUOTE_FIELD_LISTS
    );
    System.assertEquals(
      true,
      newStatus == null,
      'Failed to handle duplicate values'
    );
  }

  @isTest
  static void editLineItemViewTest() {
    List<String> viewNamesList = new List<String>{
      'View 1',
      TestDataFactory.RANDOM_STRINGS[1],
      'true'
    };

    String processStatus = SObjectController.editLineItemView(
      viewNamesList,
      TestDataFactory.QUOTE_FIELD_LISTS
    );
    System.assertEquals(
      true,
      processStatus == TestDataFactory.SUCCESS,
      'Failed to edit lineItem view'
    );
  }

  @isTest
  static void editLineItemViewNameTest() {
    List<String> viewNamesList = new List<String>{ 'View 1', 'View 1', 'true' };

    List<String> getLineItemFields = new List<String>();
    getLineItemFields = TestDataFactory.QUOTE_FIELD_LISTS;
    getLineItemFields.add('Discount');
    String processStatus = SObjectController.editLineItemView(
      viewNamesList,
      getLineItemFields
    );
    System.assertEquals(
      true,
      processStatus == TestDataFactory.SUCCESS,
      'Failed to edit lineItem view'
    );
  }

  @isTest
  static void editCustomLineItemTest() {
    List<CPQ_LineItem_Custom_Views__c> customViews = new List<CPQ_LineItem_Custom_Views__c>();
    for (CPQ_LineItem_Custom_Views__c getCustomView : [
      SELECT Id, Name, Is_Default__c
      FROM CPQ_LineItem_Custom_Views__c
    ]) {
      if (getCustomView.Name == 'Default View') {
        getCustomView.Is_Default__c = false;
      } else if (getCustomView.Name == 'View 1') {
        getCustomView.Is_Default__c = true;
      }
      customViews.add(getCustomView);
    }
    update customViews;

    Test.startTest();
    List<String> viewNamesList = new List<String>{
      'View 1',
      TestDataFactory.RANDOM_STRINGS[1],
      'false'
    };
    String processStatus = SObjectController.editLineItemView(
      viewNamesList,
      TestDataFactory.QUOTE_FIELD_LISTS
    );
    System.assertEquals(
      true,
      processStatus == TestDataFactory.SUCCESS,
      'Failed to edit lineItem view'
    );
    Test.stopTest();
  }

  @isTest
  static void deleteLineItemViewTest() {
    CPQ_LineItem_Custom_Views__c getName = [
      SELECT Id, Name, Is_Default__c
      FROM CPQ_LineItem_Custom_Views__c
      WHERE Name = 'View 1'
    ];
    getName.Is_Default__c = true;
    update getName;

    Test.startTest();
    String processStatus = SObjectController.deleteLineItemView('View 1');
    System.assertEquals(
      true,
      processStatus == TestDataFactory.SUCCESS,
      'Failed to delete lineItem view'
    );
    Test.stopTest();
  }

  @isTest
  static void getLineItemViewsTest() {
    Map<String, Map<Boolean, List<String>>> lineItemViewsMap = SObjectController.getLineItemViews();
    System.assertEquals(
      true,
      lineItemViewsMap.size() > 0,
      'There may not be any custom views related to your sObject'
    );
  }
  @isTest
  static void getLineItemFieldsTest() {
    List<String> lineItemFieldsList = SObjectController.getLineItemFields();
    System.assertEquals(
      true,
      lineItemFieldsList.size() > 0,
      'There may not be any custom views related to your sObject'
    );
  }
  @isTest
  static void getActiveProductsTest() {
    List<PricebookEntry> activeProductsList = SObjectController.getActiveProducts();
    System.assertEquals(
      true,
      activeProductsList.size() > 0,
      'There may not be any products for your mentioned condition'
    );
  }

  @isTest
  static void getPicklistsTest() {
    Map<String, List<String>> labelAndPicklistMap = SObjectController.getPicklists(
      'Account'
    );
    System.assertEquals(
      true,
      labelAndPicklistMap.size() != 0,
      'failed to Fetch the picklist and its labels'
    );
  }

  @isTest
  static void getGrandTotalTest() {
    Id quoteId = TestDataFactory.createOpportunityAndQuote();
    System.assertEquals(
      true,
      SObjectController.getGrandTotal(quoteId) > 0,
      'failed to Fetch the Grand total for the given Quote ID'
    );
  }

  @isTest
  static void getQLILabelAndApiTest() {
    System.assertEquals(
      true,
      SObjectController.getQLILabelAndApi() != '',
      'failed to form JSON structure'
    );
  }
}
