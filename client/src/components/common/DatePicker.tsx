import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, getYear, getMonth, setMonth, setYear } from "date-fns";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className = "",
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? parse(value, "yyyy-MM-dd", new Date()) : undefined,
  );
  const [displayMonth, setDisplayMonth] = useState<Date>(
    selectedDate || new Date(),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setSelectedDate(date);
      onChange(formattedDate);
      setDisplayMonth(date);
      setIsOpen(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setDisplayMonth(setMonth(displayMonth, newMonth));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setDisplayMonth(setYear(displayMonth, newYear));
  };

  const displayDate = selectedDate ? format(selectedDate, "MMM dd, yyyy") : "";
  const currentYear = getYear(displayMonth);
  const currentMonth = getMonth(displayMonth);

  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayDate}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 cursor-pointer
            ${
              error
                ? "border-red-300 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            }
            focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none
            disabled:opacity-60 disabled:cursor-not-allowed
            placeholder-gray-400 dark:placeholder-gray-500`}
        />
        <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-slate-800 border-2 border-blue-200/80 dark:border-blue-500/60 rounded-2xl shadow-2xl shadow-blue-300/30 dark:shadow-blue-600/40 backdrop-blur-xl overflow-hidden">
          <style>{`
            .rdp {
              --rdp-cell-size: 40px;
              --rdp-accent-color: #3b82f6;
              --rdp-background-color: #dbeafe;
            }

            .rdp-months {
              padding: 20px;
            }

            .rdp-month {
              width: 100%;
            }

            .rdp-caption {
              display: none !important;
            }

            .rdp-caption_label {
              font-weight: 600;
              font-size: 16px;
              color: #1f2937;
              margin: 0;
            }

            .dark .rdp-caption_label {
              color: #f3f4f6;
            }

            .rdp-button {
              border: 2px solid transparent;
            }

            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
              background-color: #f0f9ff;
            }

            .dark .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
              background-color: #1e3a8a;
            }

            .rdp-button_reset {
              padding: 4px;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              color: #1f2937;
              cursor: pointer;
              transition: all 200ms;
            }

            .dark .rdp-button_reset {
              color: #e5e7eb;
            }

            .rdp-head_cell {
              color: #4b5563;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              padding: 8px;
            }

            .dark .rdp-head_cell {
              color: #9ca3af;
            }

            .rdp-cell {
              padding: 4px;
            }

            .rdp-day {
              border: none;
              border-radius: 8px;
              font-weight: 500;
              color: #374151;
              transition: all 200ms;
              position: relative;
            }

            .dark .rdp-day {
              color: #d1d5db;
            }

            .rdp-day:hover:not(.rdp-day_disabled) {
              background: linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%);
              color: #1f2937;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }

            .dark .rdp-day:hover:not(.rdp-day_disabled) {
              background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
              color: #e5e7eb;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            .rdp-day_selected {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }

            .rdp-day_today {
              border: 2px solid #3b82f6;
              color: #1f2937;
              font-weight: 600;
            }

            .dark .rdp-day_today {
              color: #e5e7eb;
              border-color: #60a5fa;
            }

            .rdp-day_outside {
              color: #d1d5db;
              opacity: 0.5;
            }

            .dark .rdp-day_outside {
              color: #6b7280;
            }

            .rdp-day_disabled {
              color: #d1d5db;
              opacity: 0.4;
              cursor: not-allowed;
            }

            .rdp-nav {
              display: none !important;
            }

            .rdp-nav_button {
              width: 32px;
              height: 32px;
              padding: 4px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              background: #f9fafb;
              color: #1f2937;
              cursor: pointer;
              transition: all 200ms;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .dark .rdp-nav_button {
              border-color: #374151;
              background: #1f2937;
              color: #e5e7eb;
            }

            .rdp-nav_button:hover {
              border-color: #3b82f6;
              background: #dbeafe;
              color: #1f2937;
            }

            .dark .rdp-nav_button:hover {
              border-color: #60a5fa;
              background: #1e40af;
              color: #e5e7eb;
            }
          `}</style>

          {/* Custom Month/Year Header */}
          <div className="px-5 pt-4 pb-4 border-b border-blue-100 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
            <div className="flex gap-3 items-center justify-center">
              <select
                value={currentMonth}
                onChange={handleMonthChange}
                className="px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700/60 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all"
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={handleYearChange}
                className="px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700/60 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DayPicker
            mode="single"
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date > new Date()}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
