import React from "react";

function ProgressBar({ current, target }) {
  const percentage = (current / target) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
}

export default ProgressBar;
