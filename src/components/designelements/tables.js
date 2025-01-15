import * as React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import PropTypes from "prop-types";

export default function Tables({
  tableHeadings = [],
  tableRows = [],
  onEdit = () => {},
  onDelete = () => {},
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <Sheet
        variant="outlined"
        sx={(theme) => ({
          "--TableCell-height": "40px",
          "--TableHeader-height": "calc(1 * var(--TableCell-height))",
          "--Table-firstColumnWidth": "80px",
          "--Table-lastColumnWidth": "144px",
          "--TableRow-stripeBackground": "rgba(0 0 0 / 0.04)",
          "--TableRow-hoverBackground": "rgba(0 0 0 / 0.08)",
          overflow: "auto",
          background: `linear-gradient(to right, ${theme.vars.palette.background.surface} 30%, rgba(255, 255, 255, 0)),
            linear-gradient(to right, rgba(255, 255, 255, 0), ${theme.vars.palette.background.surface} 70%) 0 100%,
            radial-gradient(farthest-side at 0 50%, rgba(0,0,0,0.12), rgba(0,0,0,0)),
            radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,0.12), rgba(0,0,0,0)) 0 100%`,
          backgroundSize:
            "40px calc(100% - var(--TableCell-height)), 40px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height)), 14px calc(100% - var(--TableCell-height))",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "local, local, scroll, scroll",
          backgroundPosition:
            "var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height), var(--Table-firstColumnWidth) var(--TableCell-height), calc(100% - var(--Table-lastColumnWidth)) var(--TableCell-height)",
          backgroundColor: "background.surface",
        })}
      >
        <Table
          borderAxis="bothBetween"
          stripe="odd"
          hoverRow
          sx={{
            "& tr > *:first-child": {
              position: "sticky",
              left: 0,
              boxShadow: "1px 0 var(--TableCell-borderColor)",
              bgcolor: "background.surface",
            },
            "& tr > *:last-child": {
              position: "sticky",
              right: 0,
              bgcolor: "var(--TableCell-headBackground)",
            },
          }}
        >
          <thead>
            <tr>
              {tableHeadings.map((heading, index) => (
                <th
                  key={index}
                  style={{
                    width: index === 0 ? "var(--Table-firstColumnWidth)" : 200,
                  }}
                >
                  {heading}
                </th>
              ))}
              <th aria-label="last" style={{ width: "var(--Table-lastColumnWidth)" }} />
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* row except last element (the last is ID) */}
                {row.slice(0, -1).map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
                <td>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="sm"
                      variant="plain"
                      color="neutral"
                      onClick={() => onEdit(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="soft"
                      color="danger"
                      onClick={() => onDelete(row)}
                    >
                      Delete
                    </Button>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );
}

Tables.propTypes = {
  tableHeadings: PropTypes.arrayOf(PropTypes.string),
  tableRows: PropTypes.arrayOf(PropTypes.array),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

Tables.defaultProps = {
  tableHeadings: [],
  tableRows: [],
  onEdit: () => {},
  onDelete: () => {},
};
