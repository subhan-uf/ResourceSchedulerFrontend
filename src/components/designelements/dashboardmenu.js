import React from "react";
import { Link as RouterLink } from "react-router-dom";

export default function Cards({ heading, subtext, imageSrc, linkTo }) {
  return (
    <RouterLink
      to={linkTo}
      className="block w-80 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300"
      style={{ textDecoration: "none" }}
    >
      <div className="flex items-center space-x-4">
        {/* Image Section */}
        <div className="flex-shrink-0 w-20 h-20">
          <img
            src={imageSrc}
            alt={heading}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800">{heading}</h3>
          <p className="text-sm text-gray-600 mt-1">{subtext}</p>
        </div>
      </div>
    </RouterLink>
  );
}
