import React, { useEffect, useState } from "react";

const Datepicker = ({ onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    import("flowbite-datepicker");
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    if (onDateChange) {
      onDateChange(e.target.value);
    }
  };

  return (
    <div className="relative max-w-sm">
      <div
        className="absolute inset-y-0 start-0 flex items-center ps-3.5 cursor-pointer"
        onClick={() => document.getElementById("default-datepicker").focus()}
      >
        <svg
          className="w-4 h-4 text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
        </svg>
      </div>
      <input
        id="default-datepicker"
        type="text"
        className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 :text-white focus:ring-blue-500 focus:border-blue-500"
        placeholder="Select date"
        value={selectedDate}
        onChange={handleDateChange}
      />
    </div>
  );
};

export default Datepicker;
