import React from 'react';

// AgGridTable.ts
import { AgGridReact } from 'ag-grid-react';
// 使用类型导入语法
import type { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { useState, useEffect } from 'react';

// 导入ag-grid样式
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface AgGridTableProps {
  rowData?: any[];
  columnDefs?: ColDef[];
  height?: string;
  width?: string;
}

const AgGridTable = (props: AgGridTableProps) => {

  // 简单的静态数据
  const rowData = [
    { name: "测试1", age: 25, city: "上海" },
    { name: "测试2", age: 30, city: "北京" }
  ];
  
  const columnDefs = [
    { field: 'name', headerName: '姓名' },
    { field: 'age', headerName: '年龄' },
    { field: 'city', headerName: '城市' }
  ];
  
  // 添加加载状态检查
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    console.log("DebugAgGrid组件已挂载");
    setIsLoaded(true);
  }, []);


  const {
    // rowData = [],
    // columnDefs = [],
    height = '500px',
    width = '100%'
  } = props;

  // 只保留gridApi，不再使用columnApi
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  // 简化的GridReadyEvent处理方法，只使用api
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    // 在最新版本中，列相关功能已完全集成到主API中
    // 不再需要单独的columnApi
  };

  return (
    <div>
        <div style={{padding: "10px", backgroundColor: "#f0f0f0", marginBottom: "10px"}}>
            {/* 这个文本应该显示，即使表格没有渲染 */}
            <p>AG Grid 应该在下方渲染 - 如果你能看到这句话，说明React组件已加载</p>
        </div>
        <div className="ag-theme-alpine" style={{ height, width }}>

            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                onGridReady={onGridReady}
                animateRows={true}
                defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true
                }}
            />
        </div>
        <p>表格下方内容</p>
    </div>
  );
};

export default AgGridTable;