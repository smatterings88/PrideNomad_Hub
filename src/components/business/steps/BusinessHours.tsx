import React from 'react';

interface BusinessHoursProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function BusinessHours({ formData, handleChange }: BusinessHoursProps) {
  // Safety check to prevent errors when formData is undefined
  if (!formData || !formData.hours) {
    return (
      <div className="p-6 bg-amber-50 rounded-lg">
        <p className="text-amber-800">Loading business hours...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {formData.hours.map((hour: any, index: number) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-24">
              <span className="text-sm font-medium text-surface-700">{hour.day}</span>
            </div>
            <div className="flex items-center gap-4 flex-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name={`hours.${index}.closed`}
                  checked={hour.closed}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-surface-600">Closed</span>
              </label>
              {!hour.closed && (
                <>
                  <input
                    type="time"
                    name={`hours.${index}.open`}
                    value={hour.open}
                    onChange={handleChange}
                    className="p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <span className="text-surface-600">to</span>
                  <input
                    type="time"
                    name={`hours.${index}.close`}
                    value={hour.close}
                    onChange={handleChange}
                    className="p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}