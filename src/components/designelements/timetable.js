import React, { useState } from "react";
import { AiFillLock } from "react-icons/ai";
import Tooltip from '@mui/material/Tooltip';

const Timetable = ({
  timetable,
  sectionAndBatch,
  lockedSlots,
  disabledDays,
  onLockSlot,
  onToggleDay,
  timetableId  // NEW: timetableId prop
}) => {
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Build the key including the timetableId
  const getSlotKey = (dayIndex, timeIndex) => `${timetableId}-${dayIndex}-${timeIndex}`;

  const handleSlotClick = (dayIndex, timeIndex) => {
    onLockSlot(dayIndex, timeIndex);
  };

  const handleDayToggle = (dayIndex) => {
    onToggleDay(dayIndex);
  };

  const getColorClass = (colorCode) => {
    switch (colorCode) {
      case 'r': return 'bg-red-200';
      case 'g': return 'bg-green-200';
      case 'y': return 'bg-yellow-200';
      case 'h': return 'bg-blue-200';
      default: return 'bg-white';
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-fit mb-8">
      <h1 className="text-2xl font-bold mb-3">{sectionAndBatch}</h1>
      <h5 style={{ color: '#006A67' }}>
        Click on a slot to lock it or click on a day to disable that day
      </h5>
      <br />
      <table className="w-full table-fixed border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2">Time</th>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, index) => (
              <th
                key={index}
                onClick={() => handleDayToggle(index)}
                className={`border border-gray-400 px-4 py-2 cursor-pointer ${disabledDays.includes(index) ? 'bg-gray-300' : ''}`}
              >
                {day}
                {disabledDays.includes(index) && (
                  <span className="text-xs text-gray-500"> (Disabled)</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timetable.map((row, timeIndex) => (
            <React.Fragment key={timeIndex}>
              {/* Insert Break Row at index 3 */}
              {timeIndex === 3 && <BreakRow />}
              {/* Insert Salah Break Row at index 5 */}
              {timeIndex === 5 && <SalahBreakRow />}
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-bold text-xs">{row.time}</td>
                {row.days.map((day, dayIndex) => {
                  const slotKey = getSlotKey(dayIndex, timeIndex);
                  const isLocked = lockedSlots.includes(slotKey);
                  const isDisabled = disabledDays.includes(dayIndex);
                  return (
                    <Tooltip key={dayIndex} title={day.teacher || ''} placement="top" arrow>
                      <td
                        className={`border border-gray-400 px-4 py-2 text-center cursor-pointer ${
                          isDisabled ? 'bg-gray-300' : getColorClass(day.color)
                        } ${isLocked ? 'opacity-75' : ''}`}
                        onClick={() => !isDisabled && handleSlotClick(dayIndex, timeIndex)}
                        onMouseEnter={() => setHoveredSlot(slotKey)}
                        onMouseLeave={() => setHoveredSlot(null)}
                      >
                        {day.text}
                        {isLocked && <AiFillLock className="ml-1 inline-block" />}
                      </td>
                    </Tooltip>
                  );
                })}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BreakRow = () => (
  <tr key="break-row">
    <td className="border border-gray-400 px-4 py-2 font-bold text-xs">11:00 - 11:30</td>
    <td colSpan={5} className="border border-gray-400 px-4 py-2 text-center bg-gray-100">
      Break
    </td>
  </tr>
);

const SalahBreakRow = () => (
  <tr key="salah-break-row">
    <td className="border border-gray-400 px-4 py-2 font-bold text-xs">01:10 - 02:00</td>
    <td colSpan={5} className="border border-gray-400 px-4 py-2 text-center bg-gray-100">
      Salah Break
    </td>
  </tr>
);

export default Timetable;
