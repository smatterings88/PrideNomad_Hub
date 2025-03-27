import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Papa from 'papaparse';
import Breadcrumb from '../ui/Breadcrumb';

interface CSVRow {
  businessName: string;
  categories: string[];
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const REQUIRED_FIELDS = [
  'businessName',
  'categories',
  'description',
  'website',
  'phone',
  'address',
  'city',
  'state',
  'zipCode'
];

const COLUMN_MAPPING = {
  'Business Name': 'businessName',
  'Categories': 'categories',
  'Description': 'description',
  'Website': 'website',
  'Phone': 'phone',
  'Email': 'email',
  'Address': 'address',
  'City': 'city',
  'State': 'state',
  'Zip Code': 'zipCode'
} as const;

// Helper function to validate a field value
function isValidField(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export default function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listingSource, setListingSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error(results.errors[0].message);
          }

          const headers = Object.keys(results.data[0] || {});

          // Check for required columns
          const missingColumns = REQUIRED_FIELDS.filter(field => {
            if (field === 'email') return false; // Skip email validation since it's optional
            const columnName = Object.entries(COLUMN_MAPPING).find(([_, value]) => value === field)?.[0];
            return !headers.includes(columnName || '');
          });

          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }

          const rows = results.data.map((row: any, index: number) => {
            try {
              const mappedRow: Partial<CSVRow> = {};

              Object.entries(COLUMN_MAPPING).forEach(([header, field]) => {
                const value = row[header];
                if (field === 'categories') {
                  // Handle categories as an array
                  mappedRow[field] = value ? value.split(';').map((cat: string) => cat.trim()).filter(Boolean) : [];
                } else {
                  mappedRow[field as keyof CSVRow] = value?.trim() || '';
                }
              });

              // Validate required fields (excluding email)
              const missingFields = REQUIRED_FIELDS.filter(field => {
                if (field === 'email') return false; // Skip email validation
                const value = mappedRow[field as keyof CSVRow];
                return !isValidField(value);
              });
              
              if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
              }

              return mappedRow as CSVRow;
            } catch (err) {
              throw new Error(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Invalid format'}`);
            }
          });

          setPreview(rows);
          setError(null);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to parse CSV file';
          console.error('CSV Parse Error:', { error: err, file });
          setError(errorMessage);
          setPreview([]);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        setError('Failed to parse the CSV file');
        setPreview([]);
      }
    });
  };

  const handleImport = async () => {
    if (!preview.length) return;

    setImporting(true);
    setProgress({ current: 0, total: preview.length });
    setError(null);
    setSuccess(null);

    try {
      // Track duplicates and new entries
      let duplicatesSkipped = 0;
      let newEntriesAdded = 0;

      for (let i = 0; i < preview.length; i++) {
        const row = preview[i];
        
        // Check if business with same name already exists
        const existingQuery = query(
          collection(db, 'businesses'),
          where('businessName', '==', row.businessName)
        );
        
        const existingDocs = await getDocs(existingQuery);
        
        if (!existingDocs.empty) {
          // Skip this business as it's a duplicate
          duplicatesSkipped++;
        } else {
          // Add new business
          const businessData = {
            ...row,
            country: 'US', // Default country to US
            createdAt: serverTimestamp(),
            status: 'pending',
            verified: false,
            tier: 'essentials',
            listingSource: listingSource.trim() || null,
            sourceUrl: sourceUrl.trim() || null
          };

          await addDoc(collection(db, 'businesses'), businessData);
          newEntriesAdded++;
        }
        
        setProgress({ current: i + 1, total: preview.length });
      }

      setSuccess(`Import complete: ${newEntriesAdded} businesses added, ${duplicatesSkipped} duplicates skipped`);
      setFile(null);
      setPreview([]);
      setListingSource('');
      setSourceUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to import businesses. Please try again.');
      console.error('Import Error:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      parseCSV(droppedFile);
    } else {
      setError('Please drop a CSV file');
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'CSV Import' }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-surface-900 mb-6">Import Businesses from CSV</h1>

          <div className="space-y-6">
            {/* File Upload Section */}
            <div 
              className="border-2 border-dashed border-surface-300 rounded-lg p-8 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <div className="space-y-4">
                <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-surface-600" />
                </div>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Select CSV file
                  </button>
                  <p className="text-sm text-surface-600 mt-1">
                    or drag and drop your file here
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                <Check className="h-5 w-5 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            {/* Preview Section */}
            {preview.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="listingSource" className="block text-sm font-medium text-surface-700 mb-1">
                      Listing Source
                    </label>
                    <input
                      type="text"
                      id="listingSource"
                      value={listingSource}
                      onChange={(e) => setListingSource(e.target.value)}
                      className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="sourceUrl" className="block text-sm font-medium text-surface-700 mb-1">
                      Source URL
                    </label>
                    <input
                      type="url"
                      id="sourceUrl"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-surface-900">
                  Preview ({preview.length} businesses)
                </h2>
                <div className="border border-surface-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-200">
                      <thead className="bg-surface-50">
                        <tr>
                          {Object.keys(preview[0]).map((header) => (
                            <th
                              key={header}
                              className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-surface-200">
                        {preview.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            {Object.entries(row).map(([key, value], i) => (
                              <td
                                key={i}
                                className="px-6 py-4 whitespace-nowrap text-sm text-surface-900"
                              >
                                {Array.isArray(value) ? value.join('; ') : value || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {preview.length > 5 && (
                    <div className="px-6 py-3 bg-surface-50 text-sm text-surface-600">
                      Showing 5 of {preview.length} rows
                    </div>
                  )}
                </div>

                {/* Import Button */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview([]);
                      setListingSource('');
                      setSourceUrl('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-4 py-2 text-surface-600 hover:text-surface-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Importing... ({progress.current}/{progress.total})
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Import {preview.length} Businesses
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* CSV Format Guide */}
            <div className="mt-8 border-t border-surface-200 pt-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">CSV Format Guide</h2>
              <p className="text-surface-600 mb-4">
                Your CSV file must include the following columns:
              </p>
              <div className="bg-surface-50 p-4 rounded-lg">
                <code className="text-sm">
                  Business Name,Categories,Description,Website,Phone,Email,Address,City,State,Zip Code
                </code>
              </div>
              <div className="mt-4 text-sm text-surface-600">
                <p className="font-medium mb-2">Column Details:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><span className="font-semibold">All columns are required except Email</span></li>
                  <li><span className="font-semibold">Categories:</span> Separate multiple categories with semicolons (;)</li>
                  <li><span className="font-semibold">Example:</span> "Restaurant;Bar;Entertainment"</li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-lg">
                <p className="font-medium">Important Notes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The first row MUST contain the exact column headers as shown above</li>
                  <li>All fields are required except Email</li>
                  <li>Use quotes around fields that contain commas</li>
                  <li>For categories, use semicolons to separate multiple values</li>
                  <li>All imported businesses will start with 'essentials' tier and 'pending' status</li>
                  <li>Duplicate business names will be skipped during import</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}