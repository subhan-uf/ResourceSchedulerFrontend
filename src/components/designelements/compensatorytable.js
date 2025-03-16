import React, { useState, useEffect } from "react";

const CompensatoryTimetable = ({
  timetable: initialTimetable = [],
  onSlotSelect,
  sectionAndBatch,
  selectedCourse,
  initialSelectedSlots = []
}) => {
  // State to track the timetable
  const [timetable, setTimetable] = useState(initialTimetable);
  
  // State to track selected slots for compensatory classes
  const [selectedSlots, setSelectedSlots] = useState([]);
  useEffect(() => {
    setSelectedSlots(initialSelectedSlots);
  }, [initialSelectedSlots]);

  useEffect(() => {
    setTimetable(initialTimetable);
  }, [initialTimetable]);

  // Handle slot click
  const handleSlotClick = (dayIndex, timeIndex) => {
    const slotKey = `${dayIndex}-${timeIndex}`;
    const isSlotSelected = selectedSlots.includes(slotKey);

    const updatedTimetable = [...timetable];
    let updatedSlots = [...selectedSlots];

    if (isSlotSelected) {
        // Remove the slot from selection
        updatedSlots = updatedSlots.filter(key => key !== slotKey);
        updatedTimetable[timeIndex].days[dayIndex] = ""; // Clear COMP marker
    } else {
        // Add the slot to selection
        updatedSlots = [...updatedSlots, slotKey];
        updatedTimetable[timeIndex].days[dayIndex] = `${selectedCourse} (COMP)`;
    }

    setSelectedSlots(updatedSlots);
    setTimetable(updatedTimetable);
    
    // Notify parent of ALL selected slots
    if (onSlotSelect) {
        onSlotSelect(updatedSlots); // Pass complete list of selected slots
    }
};
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-fit">
      <h1 className="text-2xl font-bold mb-3">Select Compensatory Slots</h1>
      
      <h5 style={{color:'#006A67'}}>Click on a slot to select it</h5>
      <br/>
      <table className="w-full table-fixed border-collapse border border-gray-300"
      >
        {/* Table Head */}
        <thead>
          <tr>
            <th
              colSpan={7} // Spanning across all columns (Time + Days)
              className="border border-gray-400 px-4 py-2 text-center font-bold bg-gray-200"
            >
              {sectionAndBatch}
            </th>
          </tr>
          <tr>
            <th className="border border-gray-400 px-4 py-2">Time</th>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
              (day, index) => (
                <th
                  key={index}
                  className="border border-gray-400 px-4 py-2 text-center"
                >
                  {day}
                </th>
              )
            )}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {timetable.map((row, timeIndex) => (
            <>
              {/* Add Break Row */}
              {timeIndex === 3 && (
                <tr key="break-row">
                  <td className="border border-gray-400 px-4 py-2 font-bold text-center text-xs">
                    11:00 - 11:30
                  </td>
                  <td
                    colSpan={6} // Adjust for six days
                    className="border border-gray-400 px-4 py-2 text-center font-bold bg-gray-100"
                  >
                    Break
                  </td>
                </tr>
              )}
              {/* Add Salah Break Row */}
              {timeIndex === 5 && (
                <tr key="salah-break-row">
                  <td className="border border-gray-400 px-4 py-2 font-bold text-center text-xs">
                    01:10 - 02:00
                  </td>
                  <td
                    colSpan={6} // Adjust for six days
                    className="border border-gray-400 px-4 py-2 text-center font-bold bg-gray-100"
                  >
                    Salah Break
                  </td>
                </tr>
              )}
              <tr key={timeIndex}>
              <td className="border border-gray-400 px-4 py-2 font-bold text-center text-xs">

                  {row.time}
                </td>
                {row.days.map((slot, dayIndex) => {
                  const slotKey = `${dayIndex}-${timeIndex}`;
                  const isSelected = selectedSlots.includes(slotKey);

                  return (
                    <td
                      key={dayIndex}
                      role="button"
                      className={`border px-4 py-2 text-center cursor-pointer ${
                        isSelected
                          ? "bg-green-200 border-green-600"
                          : "bg-white border-gray-400"
                      }`}
                      onClick={() => handleSlotClick(dayIndex, timeIndex)}
                    >
                      {slot || (isSelected ? `${selectedCourse} (COMP)` : "")}
                    </td>
                  );
                })}
              </tr>
            </>
          ))}
        </tbody>
      </table>
      
     
    </div>
  );
};

export default CompensatoryTimetable;
