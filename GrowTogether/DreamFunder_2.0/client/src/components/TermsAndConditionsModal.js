import React from "react";
import termsAndConditions from "./termsAndConditions";

function TermsAndConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-800">
        <div className="mt-3 text-center">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Terms and Conditions
          </h3>
          <div className="mt-2 px-7 py-3">
            <div className="text-left text-gray-300 h-96 overflow-y-auto whitespace-pre-wrap">
              {termsAndConditions}
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditionsModal;
