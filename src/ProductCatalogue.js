import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { AutoComplete } from "primereact/autocomplete";
import { Badge } from "primereact/badge";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import { Dialog } from "primereact/dialog";
import { Panel } from "primereact/panel";
import React, { Component, useState } from "react";
import { decode } from "html-entities";
import LCC from "lightning-container";
import "./productCatalogue.css";
import QuoteLineItemsDatatable from "./QuoteLineItemtable";

class ProductCatalogue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //FOR CART RELATED PROCESS
      totalCartDetails: [], //FOR TOTAL CART DETAILS
      totalCartPrice: 0, //FOR CALCULATING TOTAL CART PRICE

      //FOR MINI CART RELATED PROCESS
      CartDialogVisibility: false, //FOR MINI CART VISIBILITY

      //FOR OPENING QUOTE LINE ITEM COMPONENT
      showQuoteLineItemTable: false, //FOR DECIDING VISIBILITY OF QLI TABLE

      //FOR TABLE DATA PROCESS
      columns: [
        { field: "Product2.Name", header: "Product Name" },
        { field: "Product2.Description", header: "Description" },
        { field: "Product2.Image__c", header: "Product Image" },
        { field: "UnitPrice", header: "Unit Price" },
        { field: "Quantity", header: "Quantity" },
        { field: "AddToCart", header: "AddToCart" }
      ], //FOR PROVIDING COLUMNS FOR DATATABLE

      productCatalogueData: [], //FOR PROVIDING DATA FOR TABLE
      rowSelectedProducts: [], //QLI PRODUCTS FROM ROW/S SELECTION
      selectedLineItems: [], //SELECTED PRODUCTS WHILE ROW SELECTION EVENT

      //FOR AUTOCOMPLETE
      searchedValue: "", //AUTOCOMPLETE VALUE
      autoCompleteSuggestions: [], //SUGGESTIONS FOR AUTOCOMPLETE
      searchedProducts: [], //PRODUCTS BASED ON SEARCHED QUERY

      //FOR GENERIC PURPOSE
      addCartButtonVisibility: false, //VISIBILTY OF ADDTOCART(ROW) BUTTON
      disableFinaliseButton: true, //DISABLE STATUS OF FINALISE BUTTON

      //variables for lazy loading(KINDLY NEGLECT THIS FOR FUTURE PURPOSE)
      rowsPerPage: 5,
      first: 0
    };
    /* FOR TABLE RELATED PROCESS*/
    this.handleActiveProducts = this.handleActiveProducts.bind(this); //CALLBACK METHOD FOR APEX FETCHING PRODUCTS
    this.handleTableData = this.handleTableData.bind(this); //FOR RETURNING DATA TO DATATABLE
    this.handleRowButtons = this.handleRowButtons.bind(this); //FOR APPENDING BUTTONS IN COLUMNS
    this.emptyMessage = this.emptyMessage.bind(this); //FOR RETURNING EMPTY MESSAGE FOR DATATABLE

    /* FOR AUTO_COMPLETE RELATED PROCESS*/
    this.handleAutoCompleteChange = this.handleAutoCompleteChange.bind(this); //FOR HANDLING CHANGE IN AUTOCOMPLETE VALUE
    this.handleSelect = this.handleSelect.bind(this); //FOR HANDLING CLICK EVENT OF SUGGESTIONS
    this.handleSearchClearance = this.handleSearchClearance.bind(this); //FOR CLEARING SEARCH INPUT AND TABLE RESULT
    this.handleAutoComplete = this.handleAutoComplete.bind(this); //MANDATORY CALLBACK METHOD FOR SHOWING SUGGESTIONS BOX

    this.handleAddToCart = this.handleAddToCart.bind(this); //FOR HANDLING ADDTOCART BUTTON CLICK INSIDE ROW

    this.handleRowSelection = this.handleRowSelection.bind(this); //FOR HANDLING SELECTION OF ROW(CHECKBOX)
    this.handleCartAddition = this.handleCartAddition.bind(this); //FOR HANDLING ROW CLICKED PRODUCTS AND ITS ADDITION
    this.handleRemoveSelection = this.handleRemoveSelection.bind(this); //FOR HANDLING CANCEL BUTTON CLICK WHILE SELECTION OF ROW/S

    this.handleFinalise = this.handleFinalise.bind(this); //FOR HANDLING CLICK OF FINALISE BUTTON
    this.handleRetrieveSObjects = this.handleRetrieveSObjects.bind(this); //FOR DUMMY CALLBACK

    this.hideMiniCartDialog = this.hideMiniCartDialog.bind(this); //TO HANDLE CLOSURE OF MINICART DIALOG
    this.openMiniCart = this.openMiniCart.bind(this); //TO HANDLE OPENING OF MINICART DIALOG
    this.innerDialogFooter = this.innerDialogFooter.bind(this); //FOR BINDING FOOTER TO MINICART DIALOG
    this.handleDeletion = this.handleDeletion.bind(this); //FOR HANDLING DELETION IN INNER CART

    this.onPageChange = this.onPageChange.bind(this); //FOR HANDLING CHANGE IN PAGINATOR(KINDLY NEGLECT THIS FOR FUTURE PURPOSE)
    this.handleImageColumns = this.handleImageColumns.bind(this);
    LCC.callApex(
      "SObjectController.getActiveProducts",
      this.handleActiveProducts,
      { escape: true }
    );
  }
  componentDidMount() {
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue = "";
    });
  }
  //FOR HANDLING CHANGE IN PAGINATOR(KINDLY NEGLECT THIS FOR FUTURE PURPOSE)
  onPageChange(event) {
    this.setState({
      first: event.first
    });
  }
  //CALLBACK METHOD FOR APEX FETCHING PRODUCTS
  handleActiveProducts(result) {
    var lineItemLists = result.map((lineItemData) => {
      return {
        ...decode(lineItemData),
        Quantity: 1,
        IntimationVisibility: "hidden"
      };
    });
    lineItemLists.forEach((element) => {
      element.Product2.Name = decode(element.Product2.Name);
      element.Product2.Description = decode(element.Product2.Description);
      element.Product2.Image__c = decode(element.Product2.Image__c).slice(
        3,
        decode(element.Product2.Image__c).length - 4
      );
    });
    this.setState({
      productCatalogueData: lineItemLists
    });
    this.state.productCatalogueData = lineItemLists;
  }

  //FOR RETURNING DATA TO DATATABLE
  handleTableData() {
    if (this.state.searchedProducts.length > 0) {
      return this.state.productCatalogueData.filter((element) =>
        this.state.searchedProducts.includes(element)
      );
    }
    return this.state.productCatalogueData;
  }

  //FOR HANDLING ADDTOCART BUTTON CLICK
  handleAddToCart(event, props) {
    event.IntimationVisibility = "visible";

    let productDetail = {};
    productDetail.QuoteID = this.props.referenceQuoteId;
    productDetail.Product2Id = event.Product2Id;
    productDetail.priceBook2ID = event.Pricebook2Id;
    productDetail.PriceBookentryId = event.Id;
    productDetail.Name = decode(event.Product2.Name);
    productDetail.Quantity = event.Quantity;
    productDetail.UnitPrice = Number(event.Quantity) * Number(event.UnitPrice);

    this.state.totalCartDetails.push(productDetail);

    this.state.totalCartDetails
      .map((item) => Number(item["UnitPrice"]))
      .forEach((unitPrice) => {
        this.setState({
          totalCartPrice: this.state.totalCartPrice + unitPrice
        });
      });
  }

  //EMPTY MESSAGE FOR USER(SPINNER)
  emptyMessage() {
    return (
      <div
        class="dot-spin"
        id="emptyMessageSpinner"
        style={{
          position: "relative",
          bottom: "-8rem",
          right: "-50rem",
          zIndex: "2100"
        }}
      ></div>
    );
  }

  //FOR HANDLING CHANGE IN AUTOCOMPLETE VALUE
  handleAutoCompleteChange(event) {
    if (event.target.value != null && event.target.value != "") {
      let suggestionsArray = [];
      this.setState({
        autoCompleteSuggestions: [],
        searchedValue: event.target.value
      });

      this.state.productCatalogueData
        .filter((product) =>
          String(product["Product2"]["Name"])
            .toLowerCase()
            .includes(event.target.value.toLowerCase())
        )
        .forEach((val) => {
          suggestionsArray.push(val["Product2"]["Name"]);
        });
      this.setState({
        autoCompleteSuggestions: suggestionsArray
      });

      let autoComplete = document.getElementById("autoComplete");
      autoComplete.addEventListener("keyup", (e) => {
        e.preventDefault();
        if (e.key == "Enter") {
          this.setState({
            searchedProducts: this.state.productCatalogueData.filter(
              (product) =>
                String(product["Product2"]["Name"])
                  .split(" ")
                  .join("")
                  .toLowerCase()
                  .includes(
                    event.target.value.split(" ").join("").toLowerCase()
                  )
            )
          });
        }
      });
    }

    if (event.target.value == "" || event.target.value == null) {
      this.setState({
        searchedProducts: [],
        searchedValue: ""
      });
    }
  }

  //FOR HANDLING CLICK EVENT OF SUGGESTIONS
  handleSelect(event) {
    let searchedValues = this.state.productCatalogueData.filter((product) =>
      String(product["Product2"]["Name"])
        .toLowerCase()
        .includes(event.value.toLowerCase())
    );
    this.setState({
      searchedProducts: searchedValues
    });
  }

  //MANDATORY CALLBACK METHOD FOR SHOWING SUGGESTIONS BOX
  handleAutoComplete() {}

  //FOR CLEARING SEARCH INPUT AND TABLE RESULT
  handleSearchClearance() {
    this.setState({
      searchedProducts: [],
      searchedValue: ""
    });
  }
  //FOR HANDLING SELECTION OF ROW(CHECKBOX)
  handleRowSelection(e) {
    this.state.selectedLineItems = e.value;

    let rowSelectionIntimation = document.getElementById(
      "RowSelectionIntimation"
    );

    this.state.rowSelectedProducts = [];

    let arrayLength = e.value.length;
    for (let index = 0; index < arrayLength; index++) {
      let productDetail = {};
      productDetail.QuoteID = this.props.referenceQuoteId;
      productDetail.Product2Id = e.value[index].Product2Id;
      productDetail.priceBook2ID = e.value[index].Pricebook2Id;
      productDetail.PriceBookentryId = e.value[index].Id;
      productDetail.Name = decode(e.value[index].Product2.Name);
      productDetail.Quantity = e.value[index].Quantity;
      productDetail.UnitPrice =
        Number(e.value[index].Quantity) * Number(e.value[index].UnitPrice);

      this.state.rowSelectedProducts.push(productDetail);
    }

    if (this.state.selectedLineItems.length > 0) {
      this.setState({
        addCartButtonVisibility: true
      });
      rowSelectionIntimation.innerHTML = arrayLength + " Selected";
    } else {
      this.setState({
        addCartButtonVisibility: false
      });
      rowSelectionIntimation.innerHTML = "";
    }
  }

  //FOR HANDLING ROW CLICKED PRODUCTS AND ITS ADDITION
  handleCartAddition() {
    for (
      let index = 0;
      index < this.state.rowSelectedProducts.length;
      index++
    ) {
      this.state.productCatalogueData
        .filter((product) =>
          String(product["Product2"]["Name"])
            .toLowerCase()
            .includes(this.state.rowSelectedProducts[index].Name.toLowerCase())
        )
        .forEach((value) => {
          value.IntimationVisibility = "visible";
        });
      this.state.totalCartDetails.push(this.state.rowSelectedProducts[index]);
    }

    this.state.totalCartPrice = 0;
    this.state.totalCartDetails
      .map((item) => Number(item["UnitPrice"]))
      .forEach((unitPrice) => {
        this.state.totalCartPrice += unitPrice;
      });

    this.handleRemoveSelection();
  }

  //FOR HANDLING CANCEL BUTTON CLICK WHILE SELECTION OF ROW/S
  handleRemoveSelection() {
    this.setState({
      selectedLineItems: [],
      rowSelectedProducts: [],
      addCartButtonVisibility: false
    });

    let rowSelectionIntimation = document.getElementById(
      "RowSelectionIntimation"
    );
    rowSelectionIntimation.innerHTML = "";
  }

  //TO HANDLE OPENING OF MINICART DIALOG
  openMiniCart() {
    this.setState({
      CartDialogVisibility: true
    });

    if (this.state.totalCartDetails.length > 0) {
      this.setState({
        disableFinaliseButton: false
      });
    } else {
      this.setState({
        disableFinaliseButton: true
      });
    }
  }

  //FOR HANDLING CLICK OF FINALISE BUTTON
  handleFinalise() {
    this.setState({
      CartDialogVisibility: false
    });
    LCC.callApex(
      "SObjectController.retrieveSObjects",
      JSON.stringify(this.state.totalCartDetails),
      this.handleRetrieveSObjects,
      { escape: true }
    );

    this.setState({
      totalCartDetails: []
    });
    this.state.productCatalogueData.forEach(decodeFunction);
    function decodeFunction(record, index, key) {
      record["IntimationVisibility"] = "hidden";
      record["Quantity"] = 1;
    }
    this.openQuoteLineItemTable();
  }

  //FOR DUMMY CALLBACK
  handleRetrieveSObjects() {}

  //FOR BINDING FOOTER TO MINICART DIALOG
  innerDialogFooter() {
    return (
      <div>
        <div>
          <Button
            label="Finalise"
            style={{ height: "2.2rem", background: "#3B82F6" }}
            onClick={this.handleFinalise}
            disabled={this.state.disableFinaliseButton}
          />
        </div>

        <div className="innerDialogFooter">
          <p id="grandTotalText">Grand Total</p>
          <p id="grandTotalvalue">
            USD&nbsp;
            {new Intl.NumberFormat("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(this.state.totalCartPrice.toFixed(2))}
          </p>
        </div>
      </div>
    );
  }

  //HANDLE DELETION OF PRODUCT INSIDE MINICART
  handleDeletion = (i, data) => (e) => {
    let neededIndex = this.state.totalCartDetails.indexOf(data[i]);
    let neededProductName = data[i].Name;

    let cartArrayDeletion = this.state.totalCartDetails;
    cartArrayDeletion.splice(neededIndex, 1);
    this.setState({
      totalCartDetails: cartArrayDeletion
    });

    let duplicateFound = false;
    for (let cartDetail of this.state.totalCartDetails) {
      if (neededProductName == cartDetail.Name) {
        duplicateFound = true;
      }
    }

    if (duplicateFound == false) {
      for (let singleData of this.state.productCatalogueData) {
        if (singleData["Product2"]["Name"] == neededProductName) {
          singleData.IntimationVisibility = "hidden";
        }
      }
    }

    this.state.totalCartPrice = 0;
    for (const [key, value] of Object.entries(this.state.totalCartDetails)) {
      this.state.totalCartPrice =
        this.state.totalCartPrice + Number(value["UnitPrice"]);
    }

    if (this.state.totalCartDetails.length < 1) {
      this.setState({
        disableFinaliseButton: true
      });
    }
  };

  //TO HANDLE CLOSURE OF MINICART DIALOG
  hideMiniCartDialog() {
    this.setState({
      CartDialogVisibility: false
    });
  }

  //FOR REDIRECTING TO QUOTE LINE ITEM COMPONENT
  openQuoteLineItemTable = () => {
    this.setState({ showQuoteLineItemTable: true });
  };

  handleImageColumns = (rowData, data, props) => {
    let myImage = data.Product2.Image__c;
    if (myImage != null && myImage != "") {
      let parser = new DOMParser();
      var productImageDocument = parser.parseFromString(myImage, "text/html");
      if (
        productImageDocument != null &&
        productImageDocument != "" &&
        typeof productImageDocument != undefined
      ) {
        let neededImgTag = productImageDocument.getElementsByTagName("img")[0];
        if (neededImgTag) {
          let neededSource = neededImgTag.src;
          return <img src={neededSource} alt="No image found"></img>;
        }
      }
    }
  };
  //FOR APPENDING BUTTONS IN COLUMNS
  handleRowButtons = (rowData, data, props) => {
    if (rowData.header == "AddToCart") {
      return (
        <div>
          <Tooltip
            style={{ fontSize: "0.7rem", color: "white" }}
            target=".cartButton"
          />
          <Button
            id="CartButton"
            icon="pi pi-cart-plus"
            className="p-button-link cartButton"
            data-pr-tooltip="Add to Cart"
            data-pr-position="top"
            onClick={(e) => {
              this.handleAddToCart(data, props);
            }}
          />
          <Tooltip
            style={{ fontSize: "0.7rem", color: "white" }}
            target=".ConfigureButton"
          />
          <Button
            id="ConfigureButton"
            icon="pi pi-wrench"
            className="p-button-link ConfigureButton"
            data-pr-tooltip="Configure"
            data-pr-position="top"
          />
          <div Id="AddedIntimation" className="AddedIntimation">
            <i
              className="pi pi-shopping-bag"
              id="intimationIcon"
              style={{
                color: "darkgreen",
                visibility: data["IntimationVisibility"]
              }}
            ></i>
          </div>
        </div>
      );
    }
  };

  render() {
    if (this.state.showQuoteLineItemTable) {
      return (
        <QuoteLineItemsDatatable
          referenceQuoteId={this.props.referenceQuoteId}
        />
      );
    } else {
      //APPENDING COLUMNS FOR INNER DIALOG(MINICART)
      const miniCartColumns = this.state.totalCartDetails.map(
        (columnName, i, data) => {
          return (
            <tbody>
              <tr key={i}>
                <td>
                  <p className="productNameInner">{columnName["Name"]}</p>
                </td>
                <td>
                  <p className="productQuantityInner">
                    {columnName["Quantity"]}
                  </p>
                </td>
                <td>
                  <p className="productPriceInner">
                    {new Intl.NumberFormat("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(columnName["UnitPrice"])}
                  </p>
                </td>
                <td>
                  <i
                    id="trashIcon"
                    class="pi pi-trash"
                    onClick={this.handleDeletion(i, data)}
                  ></i>
                </td>
              </tr>
            </tbody>
          );
        }
      );

      //MAIN RETURN METHOD
      return (
        <body style={{ backgroundColor: "white" }}>
          <Panel id="productCataloguePanel">
            {/* FOR ICONS ON TOP OF THE PAGE */}
            <div className="card" style={{ height: "3rem" }}>
              {/* TAB ICON */}
              <i id="tabIcon" className="pi pi-tablet"></i>
              <b id="sampleText">Quote Name</b>

              {/* CART ICON */}
              <i
                id="cartIcon"
                className="pi pi-shopping-cart p-overlay-badge changesInStyle"
                style={{ fontSize: "1.5rem" }}
                onClick={this.openMiniCart}
              >
                <Badge
                  id="cartBadge"
                  value={this.state.totalCartDetails.length}
                  severity="danger"
                ></Badge>
              </i>

              {/* SIGN IN ICON */}
              <i
                id="deleteAndExitCartIcon"
                className="pi pi-sign-in changesInStyle"
                title="Delete & Exit the Cart"
                style={{ fontSize: "1.5rem" }}
                onClick={this.openQuoteLineItemTable}
              ></i>
            </div>

            {/* DUMMY TAGS FOR VIEWING PURPOSE */}
            <span
              className="p-input-icon-right "
              style={{
                position: "relative",
                display: "inline-block",
                top: "-8px"
              }}
            >
              <i
                id="searchClearanceIcon"
                className="pi pi-times"
                onClick={this.handleSearchClearance}
              />
            </span>

            {/* For AutoComplete */}
            <AutoComplete
              id="autoComplete"
              placeholder="Find Products"
              value={this.state.searchedValue}
              suggestions={this.state.autoCompleteSuggestions}
              completeMethod={this.handleAutoComplete}
              onChange={this.handleAutoCompleteChange}
              onSelect={this.handleSelect}
            />

            {/* For Row Selection Purpose */}
            <div style={{ height: "3rem" }}>
              <p id="searchResults">Search Results</p>
              <p id="RowSelectionIntimation"></p>
              <Button
                id="cartButtonForRowSelection"
                label="Add To Cart"
                onClick={this.handleCartAddition}
                visible={this.state.addCartButtonVisibility}
              />
              <Button
                id="cancelButtonForRowSelection"
                label="Cancel"
                onClick={this.handleRemoveSelection}
                visible={this.state.addCartButtonVisibility}
              />
            </div>
          </Panel>

          <DataTable
            dataKey="Id"
            editMode="cell"
            value={this.handleTableData()}
            tableStyle={{ minWidth: "50rem" }}
            onSelectionChange={(e) => this.handleRowSelection(e)}
            selection={this.state.selectedLineItems}
            paginator={true}
            first={this.state.first}
            rows={this.state.rowsPerPage}
            totalRecords={this.state.productCatalogueData.length}
            onPage={this.onPageChange}
            paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            paginatorPosition={"top"}
            paginatorLeft={true}
          >
            <Column
              id="checkbox"
              headerClassName="stickyToTopTableHeaders"
              selectionMode="multiple"
              style={{ maxWidth: "70px" }}
              headerStyle={{ width: "5rem" }}
              scrollHeight="360px"
            ></Column>
            {this.state.columns.map((col, i) => {
              const cellEditor = (options) => {
                return textEditor(options);
              };

              const textEditor = (options) => {
                return (
                  <InputText
                    type="text"
                    value={options.value}
                    onChange={(e) => options.editorCallback(e.target.value)}
                  />
                );
              };
              const onCellEditComplete = (e) => {
                let { rowData, newValue, field, originalEvent: event } = e;
                if (newValue.trim().length > 0) rowData[field] = newValue;
              };

              if (col.header == "Quantity") {
                return (
                  <Column
                    className={col.header}
                    field={col.field}
                    header={col.header}
                    style={{ width: "20rem" }}
                    body={this.handleRowButtons(col)}
                    editor={(options) => cellEditor(options)}
                    onCellEditComplete={onCellEditComplete}
                    sortable
                  />
                );
              } else if (col.header == "Product Image") {
                return (
                  <Column
                    className={col.header}
                    field={col.field}
                    header={col.header}
                    style={{ width: "20rem" }}
                    body={(data, props) =>
                      this.handleImageColumns(col, data, props)
                    }
                  />
                );
              }
              return (
                <Column
                  className={col.header}
                  field={col.field}
                  header={col.header}
                  style={{ width: "20rem" }}
                  body={
                    col.header == "AddToCart" &&
                    ((data, props) => this.handleRowButtons(col, data, props))
                  }
                  sortable
                />
              );
            })}
          </DataTable>

          {/* DIALOG FOR SHOWING MINI CART  */}
          <Dialog
            id="tableDialog"
            header={false}
            visible={this.state.CartDialogVisibility}
            style={{
              width: "32rem",
              height: "27rem",
              top: "-6rem",
              right: "-31rem"
            }}
            onHide={this.hideMiniCartDialog}
            footer={this.innerDialogFooter}
            showHeader={false}
          >
            <div>
              <i
                className="pi pi-times-circle"
                id="closeDialog"
                style={{ color: "black" }}
                onClick={this.hideMiniCartDialog}
              ></i>
            </div>
            <table id="innerTable">
              <thead class="thead-light">
                <tr>
                  <th scope="columnName" className="productNameHeaderInner">
                    Product{" "}
                  </th>
                  <th scope="columnName" className="productQuantityHeaderInner">
                    Quantity{" "}
                  </th>
                  <th scope="columnName" className="productPriceHeaderInner">
                    Net Price{" "}
                  </th>
                  <th> </th>
                </tr>
              </thead>
              {miniCartColumns}
            </table>
          </Dialog>
        </body>
      );
    }
  }
}
export default ProductCatalogue;
