import "@astrouxds/ag-grid-theme/dist/main.css";
import type { ColDef, GridOptions } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const getRandomNum = (min: number, max: number, roundTo: number = 0): string => {
  const num = Math.random() * (max - min) + min;
  return num.toFixed(roundTo);
};

// Define column data with proper types
const columnData: ColDef[] = [
  { headerName: "", field: "control" },
  { headerName: "Current tag", field: "currentTag", checkboxSelection: true },
  { headerName: "Original tag", field: "originalTag" },
  { headerName: "Sensor", field: "sensor" },
  { headerName: "ASTAT", field: "astat" },
  { headerName: "Obs time", field: "obsTime" },
  { headerName: "Ob type", field: "obType" },
  { headerName: "Az/Rt asc", field: "azRtAsc" },
  { headerName: "El/Dec", field: "elDec" },
  { headerName: "Range", field: "range" },
  { headerName: "Range rate", field: "rangeRate" },
];

const agColumnData: ColDef[] = [...columnData];
agColumnData.shift(); // Remove the first column

// Define the type for row data
type RowDataType = {
  selected: boolean;
  currentTag: string;
  originalTag: string;
  sensor: string;
  astat: string;
  obsTime: string;
  obType: string;
  azRtAsc: string;
  elDec: string;
  range: string;
  rangeRate: string;
};

// Generate 24 rows of random data
const agRowData: RowDataType[] = Array.from({ length: 24 }, () => ({
  selected: false,
  currentTag: getRandomNum(19999999, 9999999),
  originalTag: "0000" + getRandomNum(11111, 99999),
  sensor: getRandomNum(250, 450),
  astat: getRandomNum(-1, 3) > "0" ? "FULL" : "SP_FULL",
  obsTime: "2020 158 01:23:45:678",
  obType: "OBTYPE_" + getRandomNum(1, 9),
  azRtAsc: getRandomNum(120, 150, 4),
  elDec: getRandomNum(1000, 3500, 3),
  range: getRandomNum(1500, 7500, 3),   
  rangeRate: getRandomNum(-10, 10, 5),
}));

// Define grid options
const gridOptions: GridOptions = {
  columnDefs: agColumnData,
  rowData: agRowData,
};

// Initialize AG Grid
function startAGGrid() {
  const eGridDiv = document.querySelector<HTMLElement>("#myGrid");
  if (eGridDiv) {
    new GridApi().setGridOptions(gridOptions);
  }
}

// Run on load
startAGGrid();
