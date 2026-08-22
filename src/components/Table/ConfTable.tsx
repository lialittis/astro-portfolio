// 'use client';
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { TitleCellRender } from "./TitleCellRender";
import { formatRemainingTime } from "../../lib/conferenceTime";

// Register ag-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface TimelineEntry {
  deadline: string;
  abstract_deadline?: string;
  comment?: string;
}

interface SubmissionWindow {
  id: string;
  label: string;
  deadline: string;
  deadlineDisplay: string;
  deadlineUtc: string;
  abstractDeadline?: string;
  abstractDeadlineDisplay?: string;
  abstractDeadlineUtc?: string;
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
  deadlineLabel: string;
  deadlineDisplay: string;
  deadlineSummary: string;
  deadlineUtc: string;
  submissionWindows: SubmissionWindow[];
  remainingTime: string;
}

interface ConfProps {
  conferences: Conference [];
}

// Helper function to compute remaining time
const computeRemainingTime = (deadlineUtc: string): string =>
  formatRemainingTime(deadlineUtc, true);

// Custom cell renderer for countdown
const CountdownCellRenderer = (props: { value: string; data: Conference }) => {
  const [timeLeft, setTimeLeft] = useState(computeRemainingTime(props.data.deadlineUtc));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(computeRemainingTime(props.data.deadlineUtc));
    }, 1000);

    return () => clearInterval(interval);
  }, [props.data.deadlineUtc]);

  return <span>{timeLeft}</span>;
};

const DeadlineSummaryCellRenderer = (props: { data: Conference }) => (
  <span
    title={props.data.deadlineSummary}
    style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}
  >
    <strong style={{ fontSize: "0.78rem" }}>{props.data.deadlineLabel}</strong>
    <small style={{ fontSize: "0.64rem", opacity: 0.72 }}>
      {props.data.deadlineDisplay}
    </small>
  </span>
);

const ConfTable = (props: ConfProps) => {

  const [rowData, setRowData] = useState<Conference[]>(() => 
    props.conferences.map(conf => ({
      ...conf,
      remainingTime: computeRemainingTime(conf.deadlineUtc),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRowData(prevData =>
        prevData.map(conf => ({
          ...conf,
          remainingTime: computeRemainingTime(conf.deadlineUtc),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [isMobile, setIsMobile] = useState<boolean | null>(null); // Start as null to avoid SSR issues

  useEffect(() => {
    // Run only on the client
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    
    checkScreenSize(); // Set initial state
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const allColumns: ColDef<Conference>[] = [
    { field: "title", headerName: "Title", maxWidth: 150,
      cellRenderer: TitleCellRender,
    },
    { field: "sub", headerName: "Domain", maxWidth: 150},
    { field: "rank.core", headerName: "CORE Rank", maxWidth: 100},
    { field: "rank.ccf", headerName: "CCF Rank", maxWidth: 100},
    // { field: "rank.thcpl", headerName: "THCPL Rank", maxWidth: 120},
    { field: "deadlineLabel", headerName: "Next Window", minWidth: 130},
    { field: "deadlineDisplay", headerName: "Paper Deadline", minWidth: 190},
    {
      field: "remainingTime",
      headerName: "Clock",
      cellRenderer: CountdownCellRenderer,
      cellStyle: params => {
            // Parse the remaining time to get days
            const timeStr = params.value || '0d';
            const daysMatch = timeStr.match(/(\d+)d/);
            const days = daysMatch ? parseInt(daysMatch[1]) : 0;
            
            if (timeStr === "EXPIRED" || timeStr === "TBD") {
                // Deadline has passed - gray background
                return {color: 'white', backgroundColor: 'gray'};
            } else if (days < 30) {
                // Less than 30 days - red background
                return {color: 'white', backgroundColor: 'red'};
            } else if (days < 60) {
                // 30-60 days - orange background
                return {color: 'white', backgroundColor: 'orange'};
            } else {
                // More than 60 days - green background
                return {color: 'white', backgroundColor: 'green'};
            }
        }
    },
    { field: "latestconf.date", headerName: "Date"},
    { field: "latestconf.place", headerName: "Place"},
    // { field: "latestconf.link", headerName: "Link"},
    ];

  // Adjust columns based on screen size
  const colDefs = isMobile
    ? [
        { field: "title", headerName: "Title", maxWidth: 105, cellRenderer: TitleCellRender },
        {
          field: "deadlineSummary",
          headerName: "Next Deadline",
          minWidth: 155,
          cellRenderer: DeadlineSummaryCellRenderer,
        },
        allColumns.find((column) => column.field === "remainingTime")!,
      ]
    : allColumns;

  const defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
  };

  return (
    <div className="overflow-x-auto w-full flex flex-col">
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
