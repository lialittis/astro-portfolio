import type { ICellRendererParams } from "ag-grid-community";
import React from "react";

export function TitleCellRender(params: ICellRendererParams) {
    const link = params.data?.latestconf?.link;
    return link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
            {params.value}
          </a>
        ) : (
          params.value
        );
}