import { DataEntry } from "@/types";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateDataEntry = (entry: Omit<DataEntry, 'id' | 'createdAt'>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required field validation
  if (!entry.plateNumber?.trim()) {
    errors.push({ field: 'plateNumber', message: 'Plate number is required' });
  }

  if (!entry.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  // Format validation (only if fields have values)
  if (entry.plateNumber?.trim() && !isValidPlateNumber(entry.plateNumber)) {
    errors.push({ field: 'plateNumber', message: 'Invalid plate number format' });
  }

  if (entry.ic?.trim() && !isValidICNumber(entry.ic)) {
    errors.push({ field: 'ic', message: 'Invalid IC number format (should be XXXXXX-XX-XXXX)' });
  }

  if (entry.phoneNumber?.trim() && !isValidPhoneNumber(entry.phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Invalid phone number format' });
  }

  // Business logic validation
  if (entry.numberOfQuotations < 0) {
    errors.push({ field: 'numberOfQuotations', message: 'Number of quotations cannot be negative' });
  }

  if (entry.expiryDate && new Date(entry.expiryDate) <= new Date()) {
    errors.push({ field: 'expiryDate', message: 'Expiry date must be in the future' });
  }

  return errors;
};

export const checkForDuplicateEntry = (
  newEntry: Omit<DataEntry, 'id' | 'createdAt'>,
  existingEntries: DataEntry[],
  targetDate: string,
  excludeId?: string
): boolean => {
  return existingEntries.some(entry => 
    entry.id !== excludeId &&
    entry.plateNumber.toLowerCase() === newEntry.plateNumber.toLowerCase() &&
    entry.createdAt.startsWith(targetDate) // Only check for duplicates on the same date
  );
};

const isValidPlateNumber = (plateNumber: string): boolean => {
  // Malaysian plate number patterns
  const patterns = [
    /^[A-Z]{1,3}\s?\d{1,4}[A-Z]?$/i, // ABC123, ABC1234A
    /^\d{1,4}\s?[A-Z]{1,3}$/i,       // 123ABC
    /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]$/i, // A123B, AB123C
  ];
  
  return patterns.some(pattern => pattern.test(plateNumber.trim()));
};

const isValidICNumber = (ic: string): boolean => {
  // Malaysian IC format: XXXXXX-XX-XXXX
  const icPattern = /^\d{6}-\d{2}-\d{4}$/;
  return icPattern.test(ic.trim());
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Malaysian phone number patterns
  const patterns = [
    /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/,  // Mobile numbers
    /^(\+?603)[0-9]{8}$/,                // Landline KL/Selangor
    /^(\+?60[4-9])[0-9]{7}$/,           // Other state landlines
  ];
  
  const cleaned = phoneNumber.replace(/[\s-]/g, '');
  return patterns.some(pattern => pattern.test(cleaned));
};