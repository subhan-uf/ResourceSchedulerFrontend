import React, { useState, useEffect } from "react";
import { AiFillLock, AiOutlineLock } from "react-icons/ai";

const Timetable = ({
  timetable: initialTimetable = [],
  slotColors = {},
  sectionAndBatch,
  lockedSlots: initialLockedSlots = [],
  onLockedSlotsChange,
}) => {
  // Initial State
  const [timetable, setTimetable] = useState(initialTimetable);
  const [lockedSlots, setLockedSlots] = useState(initialLockedSlots);
  const [enabledDays, setEnabledDays] = useState([true, true, true, true, true]); // [Monday, ..., Friday]

  useEffect(() => {
    setTimetable(initialTimetable);
  }, [initialTimetable]);

  useEffect(() => {
    setLockedSlots(initialLockedSlots);
  }, [initialLockedSlots]);

  // Handle Slot Click
  const handleSlotClick = (dayIndex, timeIndex) => {
    const slotKey = `${dayIndex}-${timeIndex}`;
    const updatedLockedSlots = lockedSlots.includes(slotKey)
      ? lockedSlots.filter((key) => key !== slotKey) // Unlock if locked
      : [...lockedSlots, slotKey]; // Lock if unlocked

    setLockedSlots(updatedLockedSlots);
    onLockedSlotsChange && onLockedSlotsChange(updatedLockedSlots); // Notify parent about the change
  };

  // Handle Day Enable/Disable
  const toggleDay = (dayIndex) => {
    const updatedDays = [...enabledDays];
    updatedDays[dayIndex] = !updatedDays[dayIndex];
    setEnabledDays(updatedDays);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-fit">
      <h1 className="text-2xl font-bold mb-6">Generated Timetable</h1>
      <table className="w-full table-fixed border-collapse border border-gray-300">
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
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"].map(
              (day, index) => (
                <th
                key={index}
                role="button"
                className={`border border-gray-400 px-4 py-2 cursor-pointer ${
                  enabledDays[index] ? "" : "bg-gray-300"
                }`}
                onClick={() => toggleDay(index)}
              >
                {day}
                {!enabledDays[index] && (
                  <span className="text-xs text-gray-500"> (Disabled)</span>
                )}
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
                    colSpan={5}
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
                    colSpan={5}
                    className="border border-gray-400 px-4 py-2 text-center font-bold bg-gray-100"
                  >
                    Salah Break
                  </td>
                </tr>
              )}
              <tr key={timeIndex}>
                <td className="border border-gray-400 px-4 py-2 font-bold text-xs">
                  {row.time}
                </td>
                {row.days.map((course, dayIndex) => {
                  const slotKey = `${dayIndex}-${timeIndex}`;
                  const isLocked = lockedSlots.includes(slotKey);
                  const isDayEnabled = enabledDays[dayIndex];

                  // Get slot color from props
                  const bgColor =
                    !isDayEnabled
                      ? "bg-gray-300" // Turn the column grey if the day is disabled
                      : slotColors[slotKey] || "bg-white"; // Use slotColors or default color

                  return (
                    <td
                      key={dayIndex}
                      role="button"
                      className={`border border-gray-400 px-4 py-2 text-center cursor-pointer ${bgColor}`}
                      onClick={() =>
                        isDayEnabled && handleSlotClick(dayIndex, timeIndex)
                      }
                    >
                      {course}
                      {isLocked && (
                        <span className="ml-2 text-gray-600">
                          <AiFillLock />
                        </span>
                      )}
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

export default Timetable;
