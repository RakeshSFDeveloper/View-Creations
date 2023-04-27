import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import { decode } from "html-entities";
import { MultiSelect } from "primereact/multiselect";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import React, { Component } from "react";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { Checkbox } from "primereact/checkbox";
import { Panel } from "primereact/panel";
import LCC from "lightning-container";
import { ListBox } from "primereact/listbox";
import "./QuoteLineItemtable.css";
import ProductCatalogue from "./ProductCatalogue";

class QuoteLineItemsDatatable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /*---------Variables used in Data View Component---*/
      necessaryLineItemFields: [],
      selectedLineItemFields: [],
      selectedFields: [],
      showViewDialog: false,
      isNewViewCreated: false,
      selectedLineItems: null,
      customViewValues: [],
      highlightError: null,
      scrollValue: "460px",
      inputViewName: null,
      duplicateViewNameErrMsg: null,
      viewHeader: "",
      currentViewName: null,
      lineItems: [],
      quoteId: null,
      apiNameWithLabels: null,
      isDefault: false,
      grandTotal: null,
      fieldProperties: [],
      objectAPI: "QuoteLineItem",
      viewProperties: null,

      /*---------Variables used in Filter Component---*/
      filterRows: [{ filterField: "", filterOperator: "", filterInput: "" }],
      showFilterResults: "allLineItems",
      filteredLineItems: [],
      showFilterDialog: false,
      hideFilterInputPicklist: true,
      showPickList: false,
      showInputNumber: false,
      showFieldMsg: null,
      filterInputType: "{/^[ A-Za-z0-9_@./#&+-]*$/} ",
      suggestionDialog: "-91px",

      /*---------Variables used in Search Component---*/
      suggestionsHeader: "Suggestions For You",
      searchHistory: [],
      searchedResults: [],
      suggestionsList: [],
      recentHistories: [],
      hideDialog: true,
      displayDialog: false,
      isHideListBox: true,
      inputValue: null,
      lineItemsWithLabels: null,

      /*---------Variables used to navigate Product catalogue Component---*/
      showProductCatalogue: false
    };

    /*---------Binding Data view functions---------*/
    this.newViewDialog = this.newViewDialog.bind(this);
    this.hoverIn = this.hoverIn.bind(this);
    this.hoverOut = this.hoverOut.bind(this);
    this.handleViewDropdown = this.handleViewDropdown.bind(this);
    this.handleCreatedCustomViews = this.handleCreatedCustomViews.bind(this);
    this.handleAllowedLineItemLabels =
      this.handleAllowedLineItemLabels.bind(this);
    this.multiSelectHeader = this.multiSelectHeader.bind(this);
    this.handleChoosingFields = this.handleChoosingFields.bind(this);
    this.handleViewName = this.handleViewName.bind(this);
    this.toEditCustomViews = this.toEditCustomViews.bind(this);
    this.todeleteView = this.todeleteView.bind(this);
    this.saveView = this.saveView.bind(this);
    this.handleDeletedView = this.handleDeletedView.bind(this);
    this.handleAllCustomViews = this.handleAllCustomViews.bind(this);
    this.handleLineItems = this.handleLineItems.bind(this);
    this.listViewOption = [];
    this.handleGrandTotal = this.handleGrandTotal.bind(this);
    this.handleLabelsAndApi = this.handleLabelsAndApi.bind(this);
    this.openQuoteRecord = this.openQuoteRecord.bind(this);

    /*---------Binding Filter functions---------*/
    this.handleFilterOperatorChange =
      this.handleFilterOperatorChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.openFilterDialog = this.openFilterDialog.bind(this);
    this.handleLineItemTable = this.handleLineItemTable.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.handleRemoveFilterRow = this.handleRemoveFilterRow.bind(this);
    this.handleAddFilterRow = this.handleAddFilterRow.bind(this);
    this.handleRemoveAllFilters = this.handleRemoveAllFilters.bind(this);
    this.displayFilterDialog = this.displayFilterDialog.bind(this);
    this.handleLineItemPicklists = this.handleLineItemPicklists.bind(this);

    /*---------Binding Search functions---------*/
    this.handleSearchResponse = this.handleSearchResponse.bind(this);
    this.handleInputTextClick = this.handleInputTextClick.bind(this);
    this.handleInputTextChange = this.handleInputTextChange.bind(this);
    this.handleListBoxValue = this.handleListBoxValue.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleConsole = this.handleConsole.bind(this);

    /*---------Functions to be discussed---------*/

    this.hideDialog = this.hideDialog.bind(this);
    this.quoteIdMessageHandler = this.quoteIdMessageHandler.bind(this);

    /*----------------------- LCC Calls---------------------------- */

    LCC.addMessageHandler(this.quoteIdMessageHandler);

    LCC.callApex(
      "SObjectController.getRecentSearches",
      this.handleSearchResponse,
      { escape: true }
    );

    LCC.callApex(
      "SObjectController.getLineItemFields",
      this.handleAllowedLineItemLabels,
      { escape: true }
    );

    LCC.callApex(
      "SObjectController.getPicklists",
      this.state.objectAPI,
      this.handleLineItemPicklists,
      { escape: true }
    );

    LCC.callApex(
      "SObjectController.getQLILabelAndApi",
      this.handleLabelsAndApi,
      { escape: true }
    );

    if (this.props.referenceQuoteId) {
      this.quoteIdMessageHandler(this.props.referenceQuoteId);
    }
  }

  /*----------------------- Functions used in Data View Component(start) ---------------------------- */
  quoteIdMessageHandler(quoteId) {
    this.state.quoteId = quoteId;
    LCC.callApex(
      "SObjectController.getLineItems",
      this.state.quoteId,
      this.handleLineItems,

      { escape: true }
    );
    this.getCustomSettings();
  }

  handleLabelsAndApi(result) {
    let parsedResult = JSON.parse(decode(result));
    let properParsedResult = Object.values(parsedResult)[0];
    this.state.apiNameWithLabels = properParsedResult;
  }

  addProductAndTotalPrice() {
    this.state.selectedLineItemFields.unshift("Product");
    this.state.selectedLineItemFields.push("Total Price");
  }

  handleLineItems(result) {
    const lineItemLists = result.map((lineItemData) => {
      return { ...lineItemData, Product: decode(lineItemData.Product2.Name) };
    });
    this.state.filteredLineItems = lineItemLists;
    this.state.lineItems = lineItemLists;
    LCC.callApex(
      "SObjectController.getGrandTotal",
      this.state.quoteId,
      this.handleGrandTotal,
      {
        escape: true
      }
    );
  }

  handleGrandTotal(result) {
    let GrandTotalString = result.toString();
    let GrandTotalInteger = parseFloat(GrandTotalString);
    let GrandTotalIntegerWithDecimal = GrandTotalInteger.toFixed(2);
    this.setState({ grandTotal: GrandTotalIntegerWithDecimal });
  }

  get enableSaveButton() {
    var inputname =
      this.state.inputViewName === null ? "" : this.state.inputViewName;
    return !(
      this.state.selectedLineItemFields.length > 0 &&
      inputname.trim().length > 0 &&
      this.state.duplicateViewNameErrMsg != "This View Name is already in Use"
    );
  }

  get hideViewFunctions() {
    return this.state.customViewValues == "Default View";
  }

  get handleViewFunctions() {
    return (this.viewFunctions = [
      {
        label: "Create View",
        icon: "pi pi-plus",
        command: () => this.newViewDialog()
      },
      {
        label: "Edit View",
        icon: "pi pi-file-edit",
        disabled: this.hideViewFunctions,
        command: () => this.toEditCustomViews()
      },
      {
        label: "Delete View",
        icon: "pi pi-trash",
        disabled: this.hideViewFunctions,
        command: () => this.todeleteView()
      }
    ]);
  }

  getCustomSettings() {
    LCC.callApex(
      "SObjectController.getLineItemViews",
      this.handleAllCustomViews,
      { escape: true }
    );
  }

  handleAllCustomViews(result) {
    this.state.viewProperties = result;
    for (let viewNames in result) {
      if (!this.listViewOption.includes(viewNames)) {
        this.listViewOption.push(viewNames);
      }

      for (let viewStatus in result[viewNames]) {
        if (viewStatus == "true") {
          if (!this.state.isNewViewCreated) {
            this.setState({ customViewValues: viewNames });
            this.state.customViewValues = viewNames;
          }
        }
      }
    }
    let viewStatus = [
      Object.keys(this.state.viewProperties[this.state.customViewValues])
    ];
    this.setState({
      selectedFields:
        this.state.viewProperties[this.state.customViewValues][viewStatus]
    });
    this.state.selectedFields =
      this.state.viewProperties[this.state.customViewValues][viewStatus];

    this.fieldConfiguration();
  }

  fieldConfiguration() {
    this.state.fieldProperties = [];
    this.state.selectedFields.forEach((lineItemField) => {
      this.state.apiNameWithLabels.forEach((lineItemProperty) => {
        if (lineItemProperty.FieldLabel == lineItemField) {
          this.state.fieldProperties.push(lineItemProperty);
        }
      });
    });

    this.state.lineItems.forEach((lineItemRecord) => {
      for (const key in lineItemRecord) {
        if (typeof lineItemRecord[key] == "number") {
          lineItemRecord[key] = lineItemRecord[key].toFixed(2);
        }
      }
    });
  }

  saveView() {
    if (this.state.viewHeader == "New View") {
      this.savingCreatedViews();
    } else {
      this.savingEditedViews();
    }
  }

  savingCreatedViews() {
    this.state.isNewViewCreated = true;
    if (
      this.state.inputViewName !== "" &&
      this.state.selectedLineItemFields.length > 0
    ) {
      this.addProductAndTotalPrice();
      var viewNameAndStatus = [];
      viewNameAndStatus.push(this.state.inputViewName);
      viewNameAndStatus.push(this.state.isDefault);
      LCC.callApex(
        "SObjectController.toCreateLineItemView",
        viewNameAndStatus,
        this.state.selectedLineItemFields,
        this.handleCreatedCustomViews,
        { escape: true }
      );
    }
  }

  handleCreatedCustomViews(result) {
    if (result == "Success") {
      this.getCustomSettings();
      this.setState({
        customViewValues: this.state.inputViewName,
        showViewDialog: false,
        inputViewName: null,
        selectedLineItemFields: [],
        highlightError: null,
        duplicateViewNameErrMsg: null
      });
      this.listViewOption.splice(
        this.listViewOption.indexOf(this.state.currentViewName),
        1
      );
    } else {
      this.state.selectedLineItemFields.shift();
      this.state.selectedLineItemFields.pop("Total Price");
      this.setState({
        highlightError: "p-invalid block",
        duplicateViewNameErrMsg: "This View Name is already in Use"
      });
    }
  }

  toEditCustomViews() {
    this.state.currentViewName = this.state.customViewValues;
    this.state.selectedFields.pop("Total Price");
    this.state.selectedFields.shift();
    this.setState({
      viewHeader: "Edit View",
      showViewDialog: true,
      inputViewName: this.state.customViewValues,
      selectedLineItemFields: this.state.selectedFields,
      isDefault:
        [Object.keys(this.state.viewProperties[this.state.customViewValues])] ==
        "true"
          ? true
          : false
    });
  }

  savingEditedViews() {
    this.state.isNewViewCreated = true;

    if (
      this.state.inputViewName !== "" &&
      this.state.selectedLineItemFields.length > 0
    ) {
      this.addProductAndTotalPrice();
      var viewDetails = [];
      viewDetails.push(this.state.currentViewName);
      viewDetails.push(this.state.inputViewName);
      viewDetails.push(this.state.isDefault);
      LCC.callApex(
        "SObjectController.editLineItemView",
        viewDetails,
        this.state.selectedLineItemFields,
        this.handleCreatedCustomViews,
        { escape: true }
      );

      this.getCustomSettings();
    }
  }

  todeleteView() {
    this.state.currentViewName = this.state.customViewValues;
    const accept = () => {
      LCC.callApex(
        "SObjectController.deleteLineItemView",
        this.state.currentViewName,
        this.handleDeletedView,
        { escape: true }
      );
    };
    confirmDialog({
      message: "Are you sure you want to Delete this View ?",
      header: "Delete View",
      headerClassName: "deleteHeader",
      icon: "pi pi-trash",
      acceptClassName: "moveConfirmButton",
      rejectClassName: "moveConfirmButton",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      style: { width: "350px", height: "145px" },
      position: "top",
      contentStyle: { marginTop: "2px" },
      className: "confirmPopup",
      draggable: false,
      accept
    });
  }

  handleDeletedView(result) {
    if (result == "Success") {
      this.state.isNewViewCreated = false;
      this.getCustomSettings();
      this.listViewOption.splice(
        this.listViewOption.indexOf(this.state.currentViewName),
        1
      );
    }
  }

  handleAllowedLineItemLabels(result) {
    result.forEach((iterateAllowedFields) => {
      this.state.necessaryLineItemFields.push(iterateAllowedFields);
    });
  }

  newViewDialog() {
    this.state.viewHeader = "New View";
    this.setState({
      showViewDialog: true,
      showFieldMsg: "Choose atleast one field",
      isDefault: false
    });
  }

  handleChoosingFields(event) {
    if (!this.state.selectedLineItemFields.includes(event.value)) {
      this.setState({ selectedLineItemFields: event.value });
      this.state.selectedLineItemFields = event.value;
    }
    this.state.selectedLineItemFields.length < 1
      ? this.setState({ showFieldMsg: "Choose atleast one field" })
      : this.setState({ showFieldMsg: null });
  }

  handleViewName(event) {
    this.setState({
      inputViewName: event.target.value.replace(/[^a-zA-Z0-9 ]/gi, ""),
      duplicateViewNameErrMsg: null
    });
  }

  hoverIn(event) {
    event.target.style.background = "rgb(253, 254, 255)";
    event.target.style.color = "rgb(1, 118, 211)";
  }

  hoverOut(event) {
    event.target.style.background = "rgb(1, 118, 211)";
    event.target.style.color = "rgb(253, 254, 255)";
  }

  async handleViewDropdown(event) {
    await this.setState({ customViewValues: event.target.value });
    if (
      this.state.customViewValues != null ||
      this.state.customViewValues != ""
    ) {
      this.setState({
        selectedFields:
          this.state.viewProperties[this.state.customViewValues][
            Object.keys(this.state.viewProperties[this.state.customViewValues])
          ]
      });
      this.state.selectedFields =
        this.state.viewProperties[this.state.customViewValues][
          Object.keys(this.state.viewProperties[this.state.customViewValues])
        ];
    }
    this.fieldConfiguration();
    this.handleRemoveAllFilters();
  }

  multiSelectHeader(event) {
    var selectAllEvent = event.checkboxElement;
    return (
      <div className="multiSelectHeader">
        {selectAllEvent} &nbsp;
        <b>Select All</b>
      </div>
    );
  }

  openQuoteRecord() {
    LCC.sendMessage({ name: "redirectToQuote", value: "Open Quote Record" });
  }

  /*-----------------------  Functions used in Filter Component(Start) ---------------------------- */
  handleLineItemPicklists(result, event) {
    if (event.status) {
      this.setState({ lineItemPicklists: result });
    }
  }

  openFilterDialog() {
    if (this.state.showFilterDialog == false) {
      this.setState({
        showFilterDialog: true,
        displayDialog: false
      });
      this.displayFilterDialog("displayPosition", "top-right");
    } else {
      this.hideDialog("showFilterDialog");
    }
  }

  displayFilterDialog(name, position) {
    let state = { [`${name}`]: true };
    if (position) {
      state = {
        ...state,
        position
      };
    }
    this.setState(state);
  }

  handleAddFilterRow = () => {
    this.state.showPickList = false;
    const emptyRow = {
      filterField: "",
      filterOperator: "",
      filterInput: ""
    };
    let filterRows = this.state.filterRows;
    filterRows.push(emptyRow);
    this.setState({ filterRows: filterRows });
  };

  get disableAddFilterRowButton() {
    return this.state.filterRows.length >= 10;
  }

  get hideApplyFilterButton() {
    let hideApplyFilterButton = true;
    let allFilterRows = this.state.filterRows;
    for (
      let iteratingRow = allFilterRows.length - 1;
      iteratingRow >= 0;
      iteratingRow--
    ) {
      let filterField = allFilterRows[iteratingRow].filterField;
      let filteroption = allFilterRows[iteratingRow].filterOperator;
      if (filterField === "" || filteroption === "") {
        hideApplyFilterButton = true;
        break;
      } else if (filterField !== null && filteroption !== null) {
        hideApplyFilterButton = false;
      }
    }
    return hideApplyFilterButton;
  }

  get hideRemoveFilterRowButton() {
    return this.state.filterRows.length <= 1;
  }

  handleFilterChange = (idx) => (e) => {
    const { name, value } = e.target;
    if (name === "filterField") {
      this.state.filterRows[idx].filterField = value;
      this.handleFilterOperatorChange(idx);
    } else if (name === "filterOperator") {
      this.state.filterRows[idx].filterOperator = value;
    } else if (name === "filterInput") {
      this.state.filterRows[idx].filterInput = value.toString();
    } else if (name === "filterPicklistInput") {
      this.state.filterRows[idx].filterInput = value;
    }
    this.forceUpdate();
  };

  handleFilterOperatorChange(idx) {
    let filteredFieldLabel = this.state.filterRows[idx].filterField;
    let filterFieldDatatype = null;
    this.state.fieldProperties.forEach((iteration) => {
      if (iteration.FieldLabel == filteredFieldLabel) {
        filterFieldDatatype = iteration.FieldDataType;
      }
    });

    let filterOperatorMap = new Map();
    let filterOperator = null;
    filterOperatorMap.set("OPERATOR1", [
      "Contains",
      "Starts With",
      "Ends With",
      "Equals",
      "Not Equals"
    ]);
    filterOperatorMap.set("OPERATOR2", [
      "Equal to",
      "Not Equal to",
      "Less than",
      "Greater than",
      "Less than or Equal to",
      "Greater than or Equal to"
    ]);
    filterOperatorMap.set("OPERATOR3", ["Equals", "Not Equals"]);
    if (
      filterFieldDatatype == "STRING" ||
      filterFieldDatatype == "ID" ||
      filterFieldDatatype == "TEXTAREA" ||
      filterFieldDatatype == "URL"
    ) {
      this.state.showPickList = false;
      this.state.filterInputType = "{/^[ A-Za-z0-9_@./#&+-]*$/} ";

      filterOperator = "OPERATOR1";
    } else if (
      filterFieldDatatype == "CURRENCY" ||
      filterFieldDatatype == "NUMBER" ||
      filterFieldDatatype == "INTEGER" ||
      filterFieldDatatype == "PERCENT" ||
      filterFieldDatatype == "DATETIME" ||
      filterFieldDatatype == "DOUBLE"
    ) {
      this.state.showPickList = false;
      this.state.filterInputType = "num";

      filterOperator = "OPERATOR2";
    } else if (filterFieldDatatype == "BOOLEAN") {
      this.state.showPickList = true;
      this.state.filterFieldType = "BOOLEAN";
      this.filterInputPicklistOrBooleanValues(idx);
      filterOperator = "OPERATOR3";
    } else if (filterFieldDatatype == "PICKLIST") {
      this.state.showPickList = true;
      this.state.filterFieldType = "PICKLIST";
      this.filterInputPicklistOrBooleanValues(idx);
      filterOperator = "OPERATOR3";
    }
    return filterOperatorMap.get(filterOperator);
  }

  filterInputPicklistOrBooleanValues(idx) {
    let picklistValues = null;
    if (this.state.filterFieldType == "PICKLIST") {
      var filteredFieldLabel = this.state.filterRows[idx].filterField;
      picklistValues = this.state.lineItemPicklists[filteredFieldLabel];
    } else if (this.state.filterFieldType == "BOOLEAN") {
      picklistValues = ["true", "false"];
    }
    return picklistValues;
  }

  handleRemoveFilterRow = (idx) => () => {
    let filterRows = [...this.state.filterRows];
    filterRows.splice(idx, 1);
    this.setState({ filterRows: filterRows });
  };

  handleRemoveAllFilters() {
    this.state.filterRows = [
      { filterField: "", filterOperator: "", filterInput: "" }
    ];
    this.setState({ showFilterResults: "allLineItems" });
    let allLineItems = this.state.lineItems;
    this.setState({ filteredLineItems: allLineItems });
    this.handleLineItemTable();
  }

  applyFilter() {
    if (this.state.filterRows.length > 0) {
      for (
        let iteratingRow = 0;
        iteratingRow < this.state.filterRows.length;
        iteratingRow++
      ) {
        if (iteratingRow === 0) {
          const allLineItems = this.state.lineItems;
          this.filterFunction(allLineItems, iteratingRow);
        } else {
          const allLineItems = this.state.filteredLineItems;
          this.filterFunction(allLineItems, iteratingRow);
        }
      }
    } else {
      this.setState({ showFilterResults: "all" });
    }
    this.hideDialog("showFilterDialog");
    this.removeEmptyRows();
  }
  filterFunction(allLineItems, iteratingRow) {
    let { filterField, filterOperator, filterInput } =
      this.state.filterRows[iteratingRow];
    let filterFieldAPI = null;
    this.state.fieldProperties.forEach((iteration) => {
      if (iteration.FieldLabel == filterField) {
        filterFieldAPI = iteration.FieldApi;
      }
    });
    let filtervalue = filterInput ? filterInput.toLowerCase() : null;
    let filterFieldDatatype = null;
    this.state.fieldProperties.forEach((iteration) => {
      if (iteration.FieldApi == filterFieldAPI) {
        filterFieldDatatype = iteration.FieldDataType;
      }
    });
    if (
      filterFieldDatatype == "CURRENCY" ||
      filterFieldDatatype == "NUMBER" ||
      filterFieldDatatype == "INTEGER" ||
      filterFieldDatatype == "PERCENT" ||
      filterFieldDatatype == "DATETIME" ||
      filterFieldDatatype == "DOUBLE"
    ) {
      let filtervalueInteger = parseFloat(filtervalue).toFixed(2);
      filtervalue = filtervalueInteger;
    }

    let filteredLineItemList = [];
    let filteredRecord;
    allLineItems.forEach((iteratingRecord) => {
      if (filterOperator === "Equals" || filterOperator === "Equal to") {
        filteredRecord = this.equalsFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      } else if (
        filterOperator === "Not Equals" ||
        filterOperator === "Not Equal to"
      ) {
        filteredRecord = this.notEqualsFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      } else if (filterOperator === "Starts With") {
        filteredRecord = this.startsWithFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      } else if (filterOperator === "Ends With") {
        filteredRecord = this.endsWithFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      } else if (filterOperator === "Contains") {
        filteredRecord = this.containsFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      } else if (filterOperator === "Less than") {
        filteredRecord = this.lessThanFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      } else if (filterOperator === "Greater than") {
        filteredRecord = this.greaterThanFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      } else if (filterOperator === "Less than or Equal to") {
        filteredRecord = this.lessThanOrEqualFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      } else if (filterOperator === "Greater than or Equal to") {
        filteredRecord = this.greaterThanOrEqualFilterOption(
          filtervalue,
          filterFieldAPI,
          iteratingRecord
        );
      }
      if (filteredRecord) {
        filteredLineItemList.push(filteredRecord);
      }
      this.state.filteredLineItems = filteredLineItemList;
      this.setState({ showFilterResults: "advancedFiltered" });
    });
  }
  equalsFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];

    if (
      filtervalue === null ||
      (filtervalue === "NaN" && typeof comparisionString == "undefined")
    ) {
      return iteratingRecord;
    } else if (
      comparisionString !== null &&
      typeof comparisionString == "boolean" &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      filtervalue !== null &&
      comparisionString.toString().toLowerCase() == filtervalue.toLowerCase()
    ) {
      return iteratingRecord;
    } else if (
      comparisionString !== null &&
      typeof comparisionString !== "undefined" &&
      typeof comparisionString !== "number" &&
      typeof comparisionString !== "boolean" &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      filtervalue !== null &&
      comparisionString.toLowerCase() == filtervalue.toLowerCase()
    ) {
      return iteratingRecord;
    } else if (
      comparisionString !== null &&
      typeof comparisionString == "number" &&
      typeof comparisionString !== "boolean" &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      comparisionString == filtervalue &&
      filtervalue !== null
    ) {
      return iteratingRecord;
    }
  }
  notEqualsFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];
    if (
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      (filtervalue === null || filtervalue === "NaN") &&
      (typeof comparisionString !== undefined || comparisionString !== null)
    ) {
      return iteratingRecord;
    } else if (
      comparisionString !== null &&
      typeof comparisionString == "boolean" &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      filtervalue !== null &&
      comparisionString.toString().toLowerCase() != filtervalue.toLowerCase()
    ) {
      return iteratingRecord;
    } else if (
      comparisionString !== null &&
      typeof comparisionString !== "undefined" &&
      typeof comparisionString !== "number" &&
      typeof comparisionString !== "boolean" &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      filtervalue !== null &&
      comparisionString.toLowerCase() != filtervalue.toLowerCase()
    ) {
      return iteratingRecord;
    } else if (
      comparisionString !== null &&
      typeof comparisionString == "number" &&
      typeof comparisionString !== "boolean" &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      comparisionString != filtervalue &&
      filtervalue !== null
    ) {
      return iteratingRecord;
    }
  }
  startsWithFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];
    if (
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      comparisionString.toLowerCase().startsWith(filtervalue) == true
    ) {
      return iteratingRecord;
    }
  }
  endsWithFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];
    if (
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      comparisionString.toLowerCase().endsWith(filtervalue) == true
    ) {
      return iteratingRecord;
    }
  }
  containsFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];
    if (
      comparisionString !== null &&
      typeof comparisionString !== "undefined" &&
      typeof comparisionString !== "number" &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      filtervalue !== null &&
      comparisionString.toLowerCase().includes(filtervalue) == true
    ) {
      return iteratingRecord;
    } else if (
      comparisionString !== null &&
      typeof comparisionString == "number" &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      comparisionString.toString().includes(filtervalue) == true
    ) {
      return iteratingRecord;
    }
  }
  lessThanFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];
    if (
      comparisionString !== null &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      Number(comparisionString) < Number(filtervalue) == true
    ) {
      return iteratingRecord;
    }
  }
  greaterThanFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];
    if (
      comparisionString !== null &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      Number(comparisionString) > Number(filtervalue) == true
    ) {
      return iteratingRecord;
    }
  }
  lessThanOrEqualFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];
    if (
      comparisionString !== null &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      Number(comparisionString) <= Number(filtervalue) == true
    ) {
      return iteratingRecord;
    }
  }
  greaterThanOrEqualFilterOption(filtervalue, filterFieldAPI, iteratingRecord) {
    const comparisionString = iteratingRecord[filterFieldAPI];
    if (
      comparisionString !== null &&
      Object.hasOwn(iteratingRecord, filterFieldAPI) &&
      Number(comparisionString) >= Number(filtervalue) == true
    ) {
      return iteratingRecord;
    }
  }

  handleLineItemTable() {
    let lineItems;
    if (this.state.showFilterResults == "allLineItems") {
      lineItems = this.state.lineItems;
    } else if (this.state.showFilterResults == "advancedFiltered") {
      lineItems = this.state.filteredLineItems;
    } else if (this.state.showFilterResults == "searchResults") {
      lineItems = this.state.searchedResults;
    }
    return lineItems;
  }

  removeEmptyRows() {
    let filterRows = this.state.filterRows;
    if (filterRows == 0) {
      this.setState({
        filterRows: [{ filterField: "", filterOperator: "", filterInput: "" }]
      });
    } else {
      for (
        let iterateCount = filterRows.length - 1;
        iterateCount > 0;
        iterateCount--
      ) {
        let { filterField, filterOperator } =
          this.state.filterRows[iterateCount];
        if (filterField == "" || filterOperator == "") {
          filterRows.splice(iterateCount, 1);
        }
      }
    }
    this.state.filterRows = filterRows;
  }
  /*-----------------------Functions used in Search Component(Start) ---------------------------- */

  //callback method to get recent history values from Salesforce
  handleSearchResponse(result, event) {
    if (event.status) {
      this.setState({ recentHistories: result });
      this.state.suggestionsList.splice(0, this.state.suggestionsList.length);
      for (let searchHistory of this.state.recentHistories) {
        this.state.suggestionsList.push(decode(searchHistory.Name));
      }
    }
  }

  // method to handle click of input text field to show recent suggestions
  handleInputTextClick() {
    this.setState({
      isHideListBox: false,
      displayDialog: true,
      hideDialog: false,
      showFilterDialog: false,
      suggestionDialog: "-91px"
    });

    LCC.callApex(
      "SObjectController.getRecentSearches",
      this.handleSearchResponse,
      { escape: true }
    );
  }

  //method to handle onChange event of inputtext
  handleInputTextChange(event) {
    this.state.suggestionDialog = "-61px";
    //method to handle click of enter key
    let searchInputText = document.getElementById("searchInputText");
    searchInputText.addEventListener("keyup", (e) => {
      e.preventDefault();
      if (e.key == "Enter") {
        this.handleSearch();
      }
    });

    this.state.suggestionsList.splice(0, this.state.suggestionsList.length);
    this.state.inputValue = event.target.value;
    this.setState({ inputValue: event.target.value });
    if (event.target.value == "" || event.target.value == null) {
      this.state.searchedResults = this.state.filteredLineItems;
      this.setState({
        displayDialog: false,
        isHideListBox: true,
        hideDialog: true
      });
    } else if (event.target.value != "" || event.target.value != null) {
      this.state.searchedResults = this.state.filteredLineItems;
      this.state.lineItems
        .filter((product) =>
          String(product["Product"])
            .toLowerCase()
            .includes(event.target.value.toLowerCase())
        )
        .forEach((val) => {
          this.state.suggestionsList.push(val["Product"]);
        });

      this.setState({
        displayDialog: true,
        isHideListBox: false,
        hideDialog: false
      });
    }
  }

  //method to handle click of search button
  handleSearch() {
    this.setState({
      isHideListBox: true,
      displayDialog: false,
      hideDialog: true
    });
    if (this.state.inputValue != "") {
      this.state.searchHistory.push(this.state.inputValue);
    }
    let filteredLineItems = this.state.filteredLineItems;
    if (this.state.inputValue != "" && this.state.inputValue != null) {
      this.setState({
        searchedResults: filteredLineItems.filter((product) =>
          String(product["Product"])
            .toLowerCase()
            .includes(this.state.inputValue.toLowerCase())
        )
      });
      LCC.callApex(
        "SObjectController.addRecentSearch",
        this.state.inputValue,
        this.handleConsole,
        { escape: true }
      );
      this.setState({ showFilterResults: "searchResults" });
      this.handleLineItemTable();
    } else {
      this.setState({ searchedResults: this.state.filteredLineItems });
    }
  }

  hideDialog(name) {
    this.setState({
      [`${name}`]: false,
      showViewDialog: false,
      displayDialog: false,
      hideDialog: true,
      showErrorForColumn: null,
      showerror: null,
      errorMsg: null,
      errorMsgForColumn: null,
      errorMsgForDuplicate: null,
      showerrorForDuplicate: null,
      inputViewName: null,
      selectedLineItemFields: [],
      duplicateViewNameErrMsg: null,
      highlightError: null
    });
    this.removeEmptyRows();
    if (this.state.viewHeader == "Edit View") {
      this.state.selectedFields.unshift("Product");
      this.state.selectedFields.push("Total Price");
    }
  }

  //method for callback of getting recent searches(dummy one)
  handleConsole() {}

  //method to handle click of list box values
  handleListBoxValue(event) {
    this.setState({ inputValue: event.target.value });
    this.state.inputValue = event.target.value;
    this.handleSearch();
    this.state.searchedResults = this.state.filteredLineItems;
    this.setState({
      displayDialog: false,
      hideDialog: true
    });
  }

  /*-----------------------Functions used to navigate to next Component(Start) ---------------------------- */
  openProductCatalogue = () => {
    this.setState({ showProductCatalogue: true });
  };

  render() {
    if (this.state.showProductCatalogue) {
      return <ProductCatalogue referenceQuoteId={this.state.quoteId} />;
    } else {
      const listBoxHeader = <p>Your Recent Searches: </p>;
      const cellEditor = (options) => {
        if (options.field == "Discount") {
          return (
            <div>
              <InputNumber
                value={options.value}
                minFractionDigits={2}
                maxFractionDigits={2}
                onValueChange={(event) =>
                  event.target.value >= 0 && event.target.value <= 100
                    ? (options.editorCallback(event.target.value),
                      this.setState({ selectedLineItems: "" }))
                    : event.preventDefault()
                }
                style={{ marginLeft: "16px", width: "8px", height: "31.5px" }}
              />
            </div>
          );
        } else {
          return (
            <div>
              <InputNumber
                value={options.value}
                minFractionDigits={2}
                maxFractionDigits={2}
                onValueChange={(event) =>
                  event.target.value > 0
                    ? (options.editorCallback(event.target.value),
                      this.setState({ selectedLineItems: "" }))
                    : event.preventDefault()
                }
                style={{ marginLeft: "16px", width: "8px", height: "31.5px" }}
              />
            </div>
          );
        }
      };
      const onCellEditComplete = (event) => {
        let { rowData, newValue, field } = event;
        rowData[field] = newValue;
        if (
          rowData.Quantity != null &&
          rowData.UnitPrice != null &&
          rowData.Quantity > 0 &&
          rowData.UnitPrice > 0
        ) {
          rowData["Subtotal"] =
            Number(rowData.Quantity) * Number(rowData.UnitPrice);
          rowData["TotalPrice"] =
            Number(rowData.Quantity) * Number(rowData.UnitPrice) -
            (rowData.Discount == null || rowData.Discount == undefined
              ? 0
              : Number(rowData.Discount) / 100) *
              Number(rowData.Quantity) *
              Number(rowData.UnitPrice);
          let separetedLineItem = [];
          let updateLineitem = {};

          if (field == "Discount") {
            updateLineitem[field] =
              newValue != null ? newValue.toFixed(2) : null;
          } else {
            updateLineitem[field] =
              newValue > 0 ? newValue.toFixed(2) : newValue;
          }
          updateLineitem.Id = rowData.Id;
          separetedLineItem.push(updateLineitem);
          LCC.callApex(
            "SObjectController.updateLineItem",
            JSON.stringify(separetedLineItem),
            this.handleConsole,
            { escape: true }
          );
        }
      };

      const decimalValuesForQuantity = (rowData) => {
        return parseFloat(rowData.Quantity).toFixed(2);
      };
      const decimalValuesForSalesPrice = (rowData) => {
        return parseFloat(rowData.UnitPrice).toFixed(2);
      };
      const decimalValuesForTotalPrice = (rowData) => {
        return parseFloat(rowData.TotalPrice).toFixed(2);
      };
      const decimalValuesForDiscount = (rowData) => {
        if (rowData.Discount != null) {
          return parseFloat(rowData.Discount).toFixed(2);
        }
        if (rowData.Discount == null) {
          return null;
        }
      };
      const dynamicColumns = this.state.fieldProperties.map(
        (iteratingColumn, i) => {
          return (
            <Column
              headerClassName="stickyToTopTableHeaders"
              key={iteratingColumn["FieldApi"]}
              field={iteratingColumn["FieldApi"]}
              header={iteratingColumn["FieldLabel"]}
              body={
                (iteratingColumn["FieldLabel"] == "Quantity" &&
                  decimalValuesForQuantity) ||
                (iteratingColumn["FieldLabel"] == "Discount" &&
                  decimalValuesForDiscount) ||
                (iteratingColumn["FieldLabel"] == "Sales Price" &&
                  decimalValuesForSalesPrice) ||
                (iteratingColumn["FieldLabel"] == "Total Price" &&
                  decimalValuesForTotalPrice)
              }
              style={{ minWidth: "213px", fontSize: "14px", maxHeight: "40px" }}
              reorderable={
                !(
                  iteratingColumn["FieldLabel"] == "Product" ||
                  iteratingColumn["FieldLabel"] == "Total Price"
                )
              }
              frozen={
                iteratingColumn["FieldLabel"] == "Product" ||
                iteratingColumn["FieldLabel"] == "Total Price"
              }
              alignFrozen={
                iteratingColumn["FieldLabel"] == "Product" ? "left" : "right"
              }
              sortable
              editor={
                iteratingColumn["FieldLabel"] == "Quantity" ||
                iteratingColumn["FieldLabel"] == "Discount" ||
                iteratingColumn["FieldLabel"] == "Sales Price"
                  ? (options) => cellEditor(options)
                  : null
              }
              onCellEditComplete={onCellEditComplete}
            />
          );
        }
      );

      return (
        <div>
          <div className="grandTotal-header" style={{ width: "10rem" }}>
            <span>
              <b>Grand Total</b>
              <br></br>
              USD {this.state.grandTotal}
            </span>
            <div className="finalizeButtonDiv">
              <Button
                className="finalizeButton"
                onClick={this.openQuoteRecord}
                label="Finalize"
                style={{
                  backgroundColor: "rgb(1, 118, 211)",
                  paddingBottom: "7px"
                }}
              />
            </div>
          </div>
          <div>
            <Panel>
              <div
                className="main-header"
                style={{ height: "2vw", padding: "-100px" }}
              >
                <div className="search-header">
                  <span className="p-input-icon-left ">
                    <i className="pi pi-search " />
                    <InputText
                      type="search"
                      id="searchInputText"
                      onChange={this.handleInputTextChange}
                      placeholder="Search..."
                      value={this.state.inputValue}
                      onClick={this.handleInputTextClick}
                      maxLength={30}
                    />
                  </span>
                  <Dialog
                    style={{
                      width: "230px",
                      top: "84px",
                      left: "564.88px",
                      position: "fixed"
                    }}
                    hidden={this.state.hideDialog}
                    header={this.state.suggestionsHeader}
                    visible={this.state.displayDialog}
                    onHide={this.hideDialog}
                    modal={false}
                    id="searchDialog"
                  >
                    <ListBox
                      className=".p-listbox "
                      header={listBoxHeader}
                      hidden={this.state.isHideListBox}
                      id="slideContainer"
                      value={this.state.inputValue}
                      options={this.state.suggestionsList}
                      onChange={this.handleListBoxValue}
                    />
                  </Dialog>
                </div>
                <div className="createView">
                  <div>
                    <Button
                      icon="pi pi-filter-fill"
                      className="p-button-outlined p-button-sm p-button-info mr0 filtercss"
                      style={{
                        backgroundColor: "rgb(1, 118, 211)",
                        color: "white",
                        height: "3rem"
                      }}
                      onClick={this.openFilterDialog}
                    />
                  </div>
                  <Tooltip
                    target=".speeddial-bottom-left .p-speeddial-action"
                    position="bottom"
                  />
                  <SpeedDial
                    rotateAnimation={false}
                    model={this.handleViewFunctions}
                    direction="right"
                    showIcon="pi pi-cog"
                    className="speeddial-bottom-left "
                    style={{
                      marginLeft: "850px",
                      marginTop: "-105px",
                      paddingTop: "7px"
                    }}
                    buttonStyle={{ height: "35px", width: "35px" }}
                  />
                  <div>
                    <Dropdown
                      value={this.state.customViewValues}
                      style={{ width: "150px" }}
                      options={this.listViewOption}
                      onChange={this.handleViewDropdown}
                      className="dataViewdropdown"
                      placeholder="Choose View"
                      panelClassName="viewDropPanel"
                    />
                  </div>

                  <div>
                    <Button
                      id="addMoreProducts"
                      icon="pi pi-plus"
                      label="Add More Products"
                      className="p-button-outlined p-button-sm p-button-info mr0 addmoreprodcss"
                      onClick={this.openProductCatalogue}
                    />
                  </div>
                </div>
              </div>
            </Panel>
          </div>
          <div className="datatable-crud-demo ">
            <Dialog
              className="advancedFilterDialog"
              header="Advanced Filter"
              visible={this.state.showFilterDialog}
              position="top-right"
              modal={false}
              onHide={() => this.hideDialog("showFilterDialog")}
              draggable={false}
            >
              <table class="filter-table ">
                <thead class="thead-light">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col" class="filter-cell">
                      Field
                    </th>
                    <th scope="col" class="filter-cell">
                      Operator
                    </th>
                    <th scope="col" class="filter-cell">
                      Input value
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.state.filterRows.map((item, idx) => (
                    <tr id="addr0" key={idx}>
                      <th scope="row">{idx + 1}</th>
                      <td>
                        <div>
                          <Dropdown
                            name="filterField"
                            className="filterInputElements"
                            value={this.state.filterRows[idx].filterField}
                            options={this.state.selectedFields}
                            onChange={this.handleFilterChange(idx)}
                            placeholder="Select Field to filter"
                            panelClassName="filterDropPanel"
                            filter
                          />
                        </div>
                      </td>
                      <td>
                        <div>
                          <Dropdown
                            name="filterOperator"
                            className="filterInputElements"
                            value={this.state.filterRows[idx].filterOperator}
                            options={this.handleFilterOperatorChange(idx)}
                            onChange={this.handleFilterChange(idx)}
                            placeholder="Select Operator"
                            panelClassName="filterDropPanel"
                            filter
                            itemTemplate={(option) => {
                              return <div title={option}>{option}</div>;
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        {" "}
                        {this.state.showPickList === true ? (
                          <Dropdown
                            name="filterPicklistInput"
                            className="filterInputElements"
                            value={this.state.filterRows[idx].filterInput}
                            options={this.filterInputPicklistOrBooleanValues(
                              idx
                            )}
                            onChange={this.handleFilterChange(idx)}
                            placeholder="Select Value"
                            filter
                            style={{
                              width: "153px"
                            }}
                            panelClassName="filterDropPanel"
                          />
                        ) : (
                          <InputText
                            name="filterInput"
                            className="filterInputElements"
                            id="AdvFilterInput"
                            placeholder="Input value"
                            onChange={this.handleFilterChange(idx)}
                            value={this.state.filterRows[idx].filterInput}
                            maxLength={25}
                            keyfilter={this.state.filterInputType}
                          />
                        )}
                      </td>
                      <td>
                        <Button
                          onClick={this.handleRemoveFilterRow(idx)}
                          icon="pi pi-trash"
                          className="p-button-link"
                          disabled={this.hideRemoveFilterRowButton}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <br></br>
              <div>
                <Button
                  onClick={this.handleAddFilterRow}
                  label="Add Row"
                  icon="pi pi-plus"
                  className="p-button-link"
                  style={{
                    color: "rgb(1, 118, 211)"
                  }}
                  disabled={this.disableAddFilterRowButton}
                />
                <br></br>
                <br></br>
                <Button
                  onClick={this.handleRemoveAllFilters}
                  icon="pi pi-filter-slash"
                  label="Remove all filters"
                  className="md:left-0 p-button-secondary p-button-link"
                  style={{
                    color: "rgb(1, 118, 211)"
                  }}
                />
                <Button
                  label="Apply"
                  disabled={this.hideApplyFilterButton}
                  onClick={this.applyFilter}
                  className=" mr-2"
                />
              </div>
            </Dialog>
            <ConfirmDialog />
            <Dialog
              visible={this.state.showViewDialog}
              style={{ width: "500px", height: "375px" }}
              header={this.state.viewHeader}
              headerClassName="listCreation"
              onHide={this.hideDialog}
              position="top"
            >
              <div className="field p-fluid">
                <div>
                  <h5 id="myID">
                    View Name <span style={{ color: "red" }}> * </span>
                  </h5>
                </div>
                <InputText
                  id="listName"
                  value={this.state.inputViewName}
                  onChange={this.handleViewName}
                  aria-describedby="username2-help"
                  className={this.state.highlightError}
                  maxLength={25}
                  required={true}
                />
                <small id="listName-helpForDuplicate" className="p-error block">
                  {this.state.duplicateViewNameErrMsg}
                </small>
              </div>
              <div className="multiselect-demo p-fluid multiSelectOverflow">
                <div className="card ">
                  <h5 id="myID">
                    Choose Fields <span style={{ color: "red" }}> * </span>
                  </h5>
                  <MultiSelect
                    panelHeaderTemplate={this.multiSelectHeader}
                    value={this.state.selectedLineItemFields}
                    virtualScrollerOptions={false}
                    options={this.state.necessaryLineItemFields}
                    onChange={this.handleChoosingFields}
                    optionDisabled={(options) => options.disabled}
                    placeholder="Select a Fields"
                    display="chip"
                  />
                  <small>{this.state.showFieldMsg}</small>
                </div>
              </div>
              <div className="card ">
                <h5
                  style={{
                    marginTop: "32px",
                    marginLeft: "27px",
                    marginBottom: "-17px"
                  }}
                >
                  Set as Default
                </h5>
                <Checkbox
                  className="alignDefaultBox"
                  onChange={(event) =>
                    this.setState({ isDefault: event.checked })
                  }
                  checked={this.state.isDefault}
                />
              </div>
              <br />
              <br />
              <div className="cancelAndSave">
                <Button
                  label="Cancel"
                  className="p-button-outlined p-button-sm p-button-info mr0"
                  onClick={this.hideDialog}
                  onMouseEnter={this.hoverIn}
                  onMouseLeave={this.hoverOut}
                  style={{
                    backgroundColor: "rgb(1, 118, 211)",
                    color: "white"
                  }}
                />
                <Button
                  label="Save"
                  onMouseEnter={this.hoverIn}
                  onMouseLeave={this.hoverOut}
                  disabled={this.enableSaveButton}
                  className="p-button-outlined p-button-sm p-button-info mr0 moveSaveButton"
                  onClick={this.saveView}
                  style={{
                    backgroundColor: "rgb(1, 118, 211)",
                    color: "white"
                  }}
                />
              </div>
            </Dialog>
          </div>

          <div className="card">
            <DataTable
              editMode="cell"
              dataKey="Id"
              name="tableName"
              Id="test"
              headerClassName="tableHeader"
              value={this.handleLineItemTable()}
              resizableColumns
              globalFilterFields={["name"]}
              stripedRows
              sortField="Product"
              sortOrder={1}
              removableSort
              scrollHeight={this.state.scrollValue}
              emptyMessage="No Results Found"
              size="small"
              selection={this.state.selectedLineItems}
              onContextMenu={this.handleContext}
              reorderableColumns
              responsiveLayout="scroll"
              scrollable={true}
              onSelectionChange={(e) =>
                this.setState({ selectedLineItems: e.value })
              }
              showGridlines={true}
            >
              <Column
                headerClassName="stickyToTopTableHeaders"
                selectionMode="multiple"
                style={{ maxWidth: "70px", maxHeight: "40px" }}
                headerStyle={{ width: "5rem" }}
                exportable={false}
                reorderable={false}
                frozen={true}
              ></Column>
              {dynamicColumns}
            </DataTable>
          </div>
        </div>
      );
    }
  }
}
export default QuoteLineItemsDatatable;
