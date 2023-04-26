public with sharing class SystemUtility {
  public static Boolean nullOrEmpty(List<Object> objList) {
    return objList == null || objList.isEmpty();
  }

  public static Boolean nullOrEmpty(Map<Id, SObject> objects) {
    return objects == null || objects.isEmpty();
  }
}
