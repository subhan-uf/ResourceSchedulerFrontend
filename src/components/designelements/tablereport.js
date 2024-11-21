import * as React from 'react';
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';

export default function Tablereport({ columns, rows, caption, onView }) {
  return (
    <Table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} style={{ width: column.width || 'auto' }}>{column.label}</th>
          ))}
          <th style={{ width: 'auto' }}>Actions</th> {/* Extra column for actions */}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td key={colIndex}>{row[column.field]}</td>
            ))}
            <td>
              <Button 
                variant="solid" 
                size="sm" 
                onClick={() => onView(row)} // Calls onView with current row data
              >
                View
              </Button>
            </td> {/* 'View' button cell */}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
