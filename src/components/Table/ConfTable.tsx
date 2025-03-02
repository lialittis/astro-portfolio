// 'use client';
import React, {useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Register ag-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface TimelineEntry {
  deadline: string;
  comment: string;
}

interface ConferenceYear {
  year: number;
  id: string;
  link: string;
  timeline: TimelineEntry[];
  timezone: string;
  date: string;
  place: string;
}

interface Conference {
  title: string;
  description: string;
  sub: string;
  rank: { ccf: string; core: string; thcpl: string };
  dblp: string;
  confs: ConferenceYear[];
  latestconf: ConferenceYear;
}

interface ConfProps {
  conferences: Conference [];
}

const ConfTable = (props: ConfProps) => {

  const [rowData, setRowData] = useState<Conference[]>(props.conferences);

  const [colDefs, setColDefs] = useState<ColDef<Conference>[]>([
    { field: "title" },
    { field: "sub"},
    { field: "rank.ccf" },
    { field: "latestconf.date" },
    { field: "latestconf.place" },
    { field: "latestconf.link"}
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
  };

  return (
    <div className="overflow-x-auto">
      <div className="w-screen h-screen">
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
        />
      </div>
    </div>
  );
};


export default ConfTable;