/*
Developed by Congruent Info-Tech
*/
@isTest
public class TestDataFactory {
  public static final String SOBJECT_APINAME = 'QuoteLineItem';
  public static final String SUCCESS = 'Success';
  public static final String FAILURE = 'Failure';
  public static final String QLI_SAMPLE_FIELDS = 'Product,Quantity,Subtotal ,Discount,Total Price';
  public static final List<String> RANDOM_STRINGS = new List<String>{
    'Test View 1',
    'Test View 2',
    'Test View 3',
    'Test View 4',
    'Test View 5'
  };
  public static final String RANDOM_STRING = 'SLA ';
  public static final String PRODUCT_LABEL = 'Product';
  public static final List<String> QUOTE_FIELD_LISTS = new List<String>{
    'Product',
    'Quantity'
  };
  /*
  Context: To return a Account Record
  @param doInsert-> boolean value to confirm the insertion of Account Record
  */
  public static Account createAccount(Boolean doInsert) {
    return createAccount('testAccount', doInsert);
  }

  /*
  Context: To Create a account Record
  @param name-> passing Account's name as a String
  @param doInsert-> boolean value to confirm the insertion of Account Record
  */
  public static Account createAccount(String name, Boolean doInsert) {
    Account accountCreation = new Account(name = name);
    if (doInsert) {
      insert accountCreation;
    }
    return accountCreation;
  }

  /*
  Context: To return a Contact Record
  @param doInsert-> boolean value to confirm the insertion of Contact Record
  */
  public static Contact createContact(Boolean doInsert) {
    Account accountCreation = createAccount(true);
    return createContact(accountCreation.id, true);
  }

  /*
  Context: To create a Contact Record
  @param accountId-> passing accountID to link with a contact record which is to be inserted
  */
  public static Contact createContact(Id accountId, Boolean doInsert) {
    Contact contactRecord = new Contact(
      firstName = 'Apex',
      lastName = 'Hours',
      accountId = accountId
    );
    if (doInsert) {
      insert contactRecord;
    }
    return contactRecord;
  }

  /*
  Context: To create Opportunity Record
  @param accountId-> passing accountId to link with a Opportunity Record which is to be inserted
  @param numOpps-> passing number of records to be inserted as a number
  */
  public static List<Opportunity> createOpportunity(
    Id accountId,
    Integer numOpps
  ) {
    List<Opportunity> opportunityList = new List<Opportunity>();
    for (Integer iteration = 1; iteration <= numOpps; iteration++) {
      Opportunity opportunityCreation = new Opportunity();
      opportunityCreation.name = 'Account ' + iteration;
      opportunityCreation.accountId = accountid;
      opportunityCreation.amount = 1000;
      opportunityCreation.closeDate = Date.today().addDays(5);
      opportunityCreation.stageName = 'Prospecting';
      opportunityList.add(opportunityCreation);
    }
    return opportunityList;
  }

  /*
  Context: to create list of products
  @param numProds-> passing number of records to be inserted as a number
  */
  public static void createProducts(Integer numProds) {
    List<Product2> productsList = new List<Product2>();
    for (Integer iteration = 1; iteration <= numProds; iteration++) {
      Product2 productRecord = new Product2();
      productRecord.name = 'Product ' + iteration;
      productRecord.ProductCode = 'Test: ' + iteration;
      productRecord.Family = 'Hardware';
      productRecord.isActive = true;
      productsList.add(productRecord);
    }
    insert productsList;

    Pricebook2 standardPricebook = new Pricebook2(
      Id = Test.getStandardPricebookId(),
      IsActive = true
    );

    update standardPricebook;

    List<PricebookEntry> pbEntry = new List<PricebookEntry>();
    for (
      Integer createdProducts = 0;
      createdProducts < productsList.size();
      createdProducts++
    ) {
      PricebookEntry newPricebookEntry = new PricebookEntry(
        IsActive = true,
        UnitPrice = 1000,
        Pricebook2Id = standardPricebook.Id,
        Product2Id = productsList[createdProducts].Id
      );
      pbEntry.add(newPricebookEntry);
    }

    insert pbEntry;
  }

  /*
  Context: to create list of recenthistories records
  @param count-> passing number of records to be inserted as a number
  */
  public static List<Recent_History__c> createRecentHistories(Integer count) {
    List<Recent_History__c> recentHistoriesList = new List<Recent_History__c>();
    for (Integer iteration = 1; iteration <= count; iteration++) {
      Recent_History__c recentHistoryRecord = new Recent_History__c();
      recentHistoryRecord.name =
        TestDataFactory.RANDOM_STRING +
        ' ' +
        iteration;
      recentHistoriesList.add(recentHistoryRecord);
    }
    return recentHistoriesList;
  }

  /*
  Context: to create a Quote related with Opportunity
  */
  public static ID createOpportunityAndQuote() {
    TestDataFactory.createProducts(10);

    Opportunity opportunityRecord = new Opportunity();
    opportunityRecord.Name = 'TestData Opportunity';
    opportunityRecord.StageName = 'Closed Lost';
    opportunityRecord.CloseDate = System.today();
    insert opportunityRecord;

    Quote quoteRecord = new Quote();
    quoteRecord.name = 'TestData quote';
    quoteRecord.OpportunityId = opportunityRecord.ID;
    quoteRecord.Pricebook2Id = Test.getStandardPricebookId();
    insert quoteRecord;

    List<QuoteLineItem> insertLineItems = new List<QuoteLineItem>();

    for (Pricebookentry pbEntry : [
      SELECT Id, Name, Product2.Id, Product2.Name, UnitPrice
      FROM Pricebookentry
      WHERE pricebook2.IsStandard = TRUE
    ]) {
      QuoteLineItem createLineItem = new QuoteLineItem();
      createLineItem.QuoteId = quoteRecord.Id;
      createLineItem.Quantity = 100;
      createLineItem.UnitPrice = 2000;
      createLineItem.Product2Id = pbEntry.Product2.Id;
      createLineItem.PricebookEntryId = pbEntry.Id;
      insertLineItems.add(createLineItem);
    }
    insert insertLineItems;
    return quoteRecord.ID;
  }

  /*
  Context: to insert CPQ LineItem Custom Views 
  */
  public static void insertQLICustomSetting() {
    CPQ_LineItem_Custom_Views__c lineItemCustomSetting = new CPQ_LineItem_Custom_Views__c();
    lineItemCustomSetting.Name = 'Test Setup';
    lineItemCustomSetting.Is_Default__c = true;
    lineItemCustomSetting.View_Fields__c = 'Product,Subtotal ,Total Price';
    insert lineItemCustomSetting;
  }

  public static CPQ_LineItem_Custom_Views__c viewCreation(
    String viewName,
    List<String> selectedFields,
    Boolean isDefault
  ) {
    CPQ_LineItem_Custom_Views__c createView = new CPQ_LineItem_Custom_Views__c();
    String fieldsSelected = String.join(selectedFields, ',');
    createView.Name = viewName;
    createView.View_Fields__c = fieldsSelected;
    createView.Is_Default__c = isDefault;
    return createView;
  }

  public static void necessaryFields() {
    List<String> quoteFieldsList = new List<String>{ 'Product', 'Quantity','Industry' };
    CPQ_Necessary_Fields__c necessaryFields = new CPQ_Necessary_Fields__c();
    String fieldsSelected = String.join(quoteFieldsList, ',');
    necessaryFields.Name = 'Line Item Fields';
    necessaryFields.Product_Fields__c = fieldsSelected;
    insert necessaryFields;
  }
}
