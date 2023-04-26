/*
Developed by Congruent Info-Tech
Class to utilize CRUD Functions
*/
public with sharing class CRUDUtility {
  /*
  Context: inserting records for mentioned sObject 
  @param sObjectToInsert-> sobjectName as String
  */
  public static SObject insertRecords(SObject sObjectToInsert) {
    if (sObjectToInsert == null) {
      return sObjectToInsert;
    }

    return insertRecords(new List<SObject>{ sObjectToInsert })[0];
  }
  /*
  Context: deleting records for mentioned sObject 
  @param sObjectToDelete-> sobjectName as String
  */
  public static SObject deleteRecords(SObject sObjectToDelete) {
    if (sObjectToDelete == null) {
      return sObjectToDelete;
    }
    return deleteRecords(new List<SObject>{ sObjectToDelete })[0];
  }
  /*
  Context: updating records for mentioned sObject
  @param sObjectToUpdate-> sobjectName as String
  */
  public static SObject updateRecords(SObject sObjectToUpdate) {
    if (sObjectToUpdate == null) {
      return sObjectToUpdate;
    }

    return updateRecords(new List<SObject>{ sObjectToUpdate })[0];
  }
  /*
  Context: inserting records for mentioned sObject
  @param sObjectsToInsert-> sObjects Name as List of String
  */
  public static List<SObject> insertRecords(List<SObject> sObjectsToInsert) {
    if (SystemUtility.nullOrEmpty(sObjectsToInsert)) {
      return sObjectsToInsert;
    }

    SObjectAccessDecision securityDecision = Security.stripInaccessible(
      AccessType.CREATABLE,
      sObjectsToInsert,
      true
    );
    insert securityDecision.getRecords();
    return sObjectsToInsert;
  }
  /*
  Context: updating records for mentioned sObject
  @param sObjectsToUpdate-> sObjects Name as List of String
  */
  public static List<SObject> updateRecords(List<SObject> sObjectsToUpdate) {
    if (SystemUtility.nullOrEmpty(sObjectsToUpdate)) {
      return sObjectsToUpdate;
    }

    SObjectAccessDecision securityDecision = Security.stripInaccessible(
      AccessType.UPDATABLE,
      sObjectsToUpdate,
      true
    );

    update securityDecision.getRecords();
    return sObjectsToUpdate;
  }
  /*
  Context: deleting records for mentioned sObject
  @param sObjectsToDelete-> sObjects Name as List of String
  */
  public static List<SObject> deleteRecords(List<SObject> sObjectsToDelete) {
    if (SystemUtility.nullOrEmpty(sObjectsToDelete)) {
      return sObjectsToDelete;
    }

    Set<Schema.SObjectType> deletableTypes = new Set<Schema.SObjectType>();
    Set<Schema.SObjectType> notDeletableTypes = new Set<Schema.SObjectType>();
    List<SObject> sanitizedList = new List<SObject>();
    for (SObject sObjectToDelete : sObjectsToDelete) {
      Schema.SObjectType ctxType = sObjectToDelete.getSObjectType();

      if (deletableTypes.contains(ctxType)) {
        sanitizedList.add(sObjectToDelete);
      } else if (
        !notDeletableTypes.contains(ctxType) &&
        ctxType.getDescribe().isDeletable()
      ) {
        deletableTypes.add(ctxType);
        sanitizedList.add(sObjectToDelete);
      } else if (!notDeletableTypes.contains(ctxType)) {
        notDeletableTypes.add(ctxType);
      }
    }
    delete sanitizedList;
    return sObjectsToDelete;
  }
}
