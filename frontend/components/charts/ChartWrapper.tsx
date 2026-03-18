"use client";

import React from "react";

export default function ChartWrapper({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title}
      </h3>

      {children}

      {description && (
        <p className="text-sm text-gray-600 mt-3">
          {description}
        </p>
      )}
    </div>
  );
}
