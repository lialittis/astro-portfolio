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

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const [allColumns, setColDefs] = useState<ColDef<Conference>[]>([
    { field: "title", headerName: "Title", maxWidth: 150},
    { field: "sub", headerName: "Domain", maxWidth: 150},
    { field: "rank.ccf", headerName: "CCF Rank", maxWidth: 120},
    { field: "rank.core", headerName: "CORE Rank", maxWidth: 120},
    { field: "rank.thcpl", headerName: "THCPL Rank", maxWidth: 120},
    { field: "deadline", headerName: "Deadline"},
    {
      field: "remainingTime",
      headerName: "Clock",
      cellRenderer: CountdownCellRenderer,
      cellStyle: params => {
            if (params.value < '30d') {
                //mark police cells as red
                return {color: 'white', backgroundColor: 'red'};
            } else if (params.value < '60d') {
              return {color: 'white', backgroundColor: 'orange'};
            } else {
              return {color: 'white', backgroundColor: 'green'};
            }
            return null;
        }
    },
    { field: "latestconf.date", headerName: "Date"},
    { field: "latestconf.place", headerName: "Place"},
    { field: "latestconf.link", headerName: "Link"},
    ]);

  // Adjust columns based on screen size
  const colDefs = isMobile
    ? allColumns.filter(col => ["title", "deadline", "remainingTime"].includes(col.field as string))
    : allColumns;

  const defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
  };

  return (
    <div className="overflow-x-auto w-screen flex flex-col">
      <div className="flex-grow mt-5">
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          // className="ag-theme-alpine w-full h-full"
        />
      </div>
    </div>
  );
};


export default ConfTable;