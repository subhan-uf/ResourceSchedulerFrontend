// ViewCompensatoryTimetable.js
import React from 'react';

// Helper: convert HH:MM string to minutes.
const timeToMinutes = timeStr => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const ViewCompensatoryTimetable = ({
  compRecords,
  courses,
  rooms,
  timetableDetails,
  selectedSessionType,
  selectedWeek
}) => {
  // Build a course lookup for course names.
  const courseLookup = courses.reduce((acc, course) => {
    acc[course.Course_ID] = course;
    return acc;
  }, {});

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Base time slots (no break rows included here).
  const baseTimeSlots = [
    { start: "08:30", end: "09:20", label: "08:30 - 09:20" },
    { start: "09:20", end: "10:10", label: "09:20 - 10:10" },
    { start: "10:10", end: "11:00", label: "10:10 - 11:00" },
    { start: "11:30", end: "12:20", label: "11:30 - 12:20" },
    { start: "12:20", end: "01:10", label: "12:20 - 01:10" },
    { start: "02:00", end: "02:50", label: "02:00 - 02:50" },
    { start: "02:50", end: "03:40", label: "02:50 - 03:40" },
    { start: "03:40", end: "04:30", label: "03:40 - 04:30" },
  ];

  // We create a "grid row" for each time slot, plus two special rows:
  //   1) A break row for 11:00 - 11:30
  //   2) A salah break row for 01:10 - 02:00
  //
  // We'll store an array of objects that describe each row. 
  // For the break rows, we set `type: 'break'` or `type: 'salah'`.
  const gridRows = [
    { type: "slot", slotIndex: 0 }, // 08:30 - 09:20
    { type: "slot", slotIndex: 1 }, // 09:20 - 10:10
    { type: "slot", slotIndex: 2 }, // 10:10 - 11:00

    { type: "break", label: "11:00 - 11:30 (Break)" }, // entire row says Break

    { type: "slot", slotIndex: 3 }, // 11:30 - 12:20
    { type: "slot", slotIndex: 4 }, // 12:20 - 01:10

    { type: "salah", label: "01:10 - 02:00 (Salah Break)" }, // entire row says Salah Break

    { type: "slot", slotIndex: 5 }, // 02:00 - 02:50
    { type: "slot", slotIndex: 6 }, // 02:50 - 03:40
    { type: "slot", slotIndex: 7 }, // 03:40 - 04:30
  ];

  // A helper to get all base slot indices that fall within [startTime, endTime].
  const getSlotIndices = (startTime, endTime) => {
    const s = timeToMinutes(startTime.slice(0, 5));
    let e = timeToMinutes(endTime.slice(0, 5));
    if (e <= s) e += 24 * 60; // handle crossing midnight
    const indices = [];
    baseTimeSlots.forEach((slot, idx) => {
      let slotStart = timeToMinutes(slot.start);
      let slotEnd = timeToMinutes(slot.end);
      if (slotEnd <= slotStart) slotEnd += 24 * 60; // crossing midnight
      if (slotStart >= s && slotEnd <= e) {
        indices.push(idx);
      }
    });
    return indices;
  };

  // Filter comp records to the chosen week, status, and session type.
  const filteredRecords = compRecords.filter(record =>
    record.Status === "Pending" &&
    Number(record.Week_number) === Number(selectedWeek) &&
    record.Lab_or_Theory.toLowerCase() === selectedSessionType
  );

  // For each room, we build a "grid" that has one row for each entry in `gridRows`.
  const renderTimetableForRoom = (roomId, roomNo) => {
    // Each row has an array of 6 day cells, unless it's a break/salah row.
    const rowData = gridRows.map((rowSpec) => {
      if (rowSpec.type === "slot") {
        // This is a normal timeslot row
        const slot = baseTimeSlots[rowSpec.slotIndex];
        return {
          label: slot.label,
          days: Array(days.length).fill("")
        };
      } else if (rowSpec.type === "break") {
        // Entire row is "Break"
        return { label: rowSpec.label, breakRow: true };
      } else if (rowSpec.type === "salah") {
        // Entire row is "Salah Break"
        return { label: rowSpec.label, salahRow: true };
      }
      return null;
    });

    // 1. Fill in timetable details
    timetableDetails
      .filter(detail => Number(detail.Room_ID) === Number(roomId))
      .forEach(detail => {
        const dayIdx = days.indexOf(detail.Day.trim());
        if (dayIdx === -1) return; // invalid day

        // find all the base slot indices that detail covers
        const indices = getSlotIndices(detail.Start_time, detail.End_time);
        indices.forEach(i => {
          // find the row in rowData that corresponds to slot i
          // we can search for the row with rowSpec.type === 'slot' and slotIndex === i
          const rowIndex = gridRows.findIndex(
            r => r.type === "slot" && r.slotIndex === i
          );
          if (rowIndex !== -1 && !rowData[rowIndex].breakRow && !rowData[rowIndex].salahRow) {
            // fill in the course name
            rowData[rowIndex].days[dayIdx] = courseLookup[detail.Course_ID]?.Course_name || "";
          }
        });
      });

    // 2. Overlay COMP classes
    filteredRecords
      .filter(record => Number(record.Room_ID) === Number(roomId))
      .forEach(record => {
        const dayIdx = days.indexOf(record.day.trim());
        if (dayIdx === -1) return;

        const indices = getSlotIndices(record.Start_time, record.End_time);
        indices.forEach(i => {
          const rowIndex = gridRows.findIndex(
            r => r.type === "slot" && r.slotIndex === i
          );
          if (rowIndex !== -1 && !rowData[rowIndex].breakRow && !rowData[rowIndex].salahRow) {
            rowData[rowIndex].days[dayIdx] =
              `${courseLookup[record.Course_ID]?.Course_name || ""} (COMP)`;
          }
        });
      });

    // Now render a table
    return (
      <div key={roomId} style={{ marginBottom: '2rem' }}>
        <h3>{selectedSessionType.charAt(0).toUpperCase() + selectedSessionType.slice(1)} Room {roomNo}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Time</th>
              {days.map(day => (
                <th key={day} style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowData.map((row, idx) => {
              // If it's a break row or salah row, span the entire table width.
              if (row.breakRow) {
                return (
                  <tr key={idx} style={{ backgroundColor: '#f0f0f0' }}>
                    <td
                      colSpan={days.length + 1}
                      style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}
                    >
                      Break
                    </td>
                  </tr>
                );
              }
              if (row.salahRow) {
                return (
                  <tr key={idx} style={{ backgroundColor: '#f0f0f0' }}>
                    <td
                      colSpan={days.length + 1}
                      style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}
                    >
                      Salah Break
                    </td>
                  </tr>
                );
              }
              // Normal timeslot row
              return (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.label}</td>
                  {row.days.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={{
                        border: '1px solid #ccc',
                        padding: '8px',
                        backgroundColor: cell.includes('(COMP)') ? '#99BC85' : 'white',
                        color: cell.includes('(COMP)') ? 'white' : 'black',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h2>Viewing Compensatory Timetables for Week {selectedWeek} ({selectedSessionType.toUpperCase()})</h2>
      {rooms.length === 0 ? (
        <p>No rooms available.</p>
      ) : (
        rooms.map(room => renderTimetableForRoom(room.Room_ID, room.Room_no))
      )}
    </div>
  );
};

export default ViewCompensatoryTimetable;
