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
  onArchive = () => {},
  hideActionsForAdvisor = false,
}) {
   const storedUser = localStorage.getItem('user');
 const user       = storedUser ? JSON.parse(storedUser) : null;
 const role       = user?.role;
 const isAdvisor  = role === 'Advisor';
 const shouldHide = isAdvisor && hideActionsForAdvisor;
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
     ${!shouldHide ? `,
     radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,0.12), rgba(0,0,0,0)) 0 100%` : ''}
   `,
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
            "& tr > *:nth-last-child(2)": {
  position: shouldHide ? "static" : "sticky",
  right:    shouldHide ? "auto"   : "var(--Table-lastColumnWidth)",
  boxShadow: "-1px 0 var(--TableCell-borderColor)",
  bgcolor: "background.surface",
},

            "& tr > *:last-child": {
                position: shouldHide ? "static" : "sticky",
                right:    shouldHide ? "auto"   : 0,
              bgcolor: "var(--TableCell-headBackground)",
            },
          }}
        >
         <thead>
  <tr>
    {tableHeadings.map((h, i) => (
      <th key={i} style={{ width: i === 0 ? "var(--Table-firstColumnWidth)" : 200 }}>
        {h}
      </th>
    ))}
    {!tableHeadings.includes("Actions") && (
      <th style={{ width: "var(--Table-lastColumnWidth)" }}>Actions</th>
    )}
  </tr>
</thead>
<tbody>
  {tableRows.map((row, rowIndex) => {
    // find where “Archived” lives
    const archivedIdx = tableHeadings.findIndex(h => h === "Archived");
    const isArchived   = archivedIdx >= 0 && row[archivedIdx];
    const assignIdx     = tableHeadings.findIndex(h => h === "Assignments");
    const noAssigns     = assignIdx >= 0 && row[assignIdx] === 0;

    return (
      <tr
        key={rowIndex}

       style={
         noAssigns
           ? { backgroundColor: "rgba(255,255,0,0.3)" }
           : isArchived
             ? { backgroundColor: "rgba(255,0,0,0.4)" }
             : {}
       }
      >
        {tableHeadings.map((heading, cellIndex) => {
          // Actions cell
          if (heading === "Actions") {
            return (
              <td key={cellIndex}>
                {!shouldHide && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button size="sm" variant="plain" onClick={() => onEdit(row)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="soft" color="danger" onClick={() => onDelete(row)}>
                      Delete
                    </Button>
                  </Box>
                )}
              </td>
            );
          }

          // Archived cell
          if (heading === "Archived") {
            return (
              <td key={cellIndex}>
                {!shouldHide && (
                  <Button
                    size="sm"
                    variant="plain"
                    color={isArchived ? "success" : "neutral"}
                    onClick={() => onArchive(row)}
                  >
                    {isArchived ? "Unarchive" : "Archive"}
                  </Button>
                )}
              </td>
            );
          }

          // any other column
          return <td key={cellIndex}>{row[cellIndex]}</td>;
        })}
      </tr>
    );
  })}
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
  onArchive:    PropTypes.func,
};

Tables.defaultProps = {
  tableHeadings: [],
  tableRows: [],
  onEdit: () => {},
  onDelete: () => {},
};
