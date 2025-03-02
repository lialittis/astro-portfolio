// 'use client';
import React, {useEffect, useState } from "react";
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
  deadline: string;
  remainingTime: string;
}

interface ConfProps {
  conferences: Conference [];
}

// Helper function to compute remaining time
const computeRemainingTime = (deadline: string): string => {
  if (!deadline) return "N/A";

  const ddl = new Date(deadline.replace(" ", "T") + "Z"); // Convert to UTC
  const now = new Date();
  const gap = Math.max(0, ddl.getTime() - now.getTime()); // Ensure non-negative

  const seconds = Math.floor((gap / 1000) % 60);
  const minutes = Math.floor((gap / (1000 * 60)) % 60);
  const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
  const days = Math.floor(gap / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// Custom cell renderer for countdown
const CountdownCellRenderer = (props: { value: string; data: Conference }) => {
  const [timeLeft, setTimeLeft] = useState(computeRemainingTime(props.data.deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(computeRemainingTime(props.data.deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [props.data.deadline]);

  return <span>{timeLeft}</span>;
};



const ConfTable = (props: ConfProps) => {

  const [rowData, setRowData] = useState<Conference[]>(() => 
    props.conferences.map(conf => ({
      ...conf,
      remainingTime: computeRemainingTime(conf.deadline),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRowData(prevData =>
        prevData.map(conf => ({
          ...conf,
          remainingTime: computeRemainingTime(conf.deadline),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const [colDefs, setColDefs] = useState<ColDef<Conference>[]>([
    { field: "title", headerName: "Title" },
    { field: "sub", headerName: "Domain"},
    { field: "rank.ccf", headerName: "CCF Rank"},
    { field: "rank.core", headerName: "CORE Rank"},
    { field: "rank.thcpl", headerName: "THCPL Rank"},
    { field: "latestconf.date", headerName: "Date"},
    { field: "deadline", headerName: "Deadline"},
    {
      field: "remainingTime",
      headerName: "Clock",
      cellRenderer: CountdownCellRenderer,
    },
    { field: "latestconf.place", headerName: "Place"},
    { field: "latestconf.link", headerName: "Link"},
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