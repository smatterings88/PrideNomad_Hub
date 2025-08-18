// Input validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Phone validation
export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Please enter a valid phone number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// URL validation
export function validateUrl(url: string, required: boolean = false): ValidationResult {
  const errors: string[] = [];
  
  if (!url && required) {
    errors.push('URL is required');
  } else if (url) {
    try {
      new URL(url);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Business name validation
export function validateBusinessName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Business name is required');
  } else if (name.length < 2) {
    errors.push('Business name must be at least 2 characters');
  } else if (name.length > 100) {
    errors.push('Business name must be less than 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Description validation
export function validateDescription(description: string, tier: string): ValidationResult {
  const errors: string[] = [];
  
  if (!description) {
    errors.push('Description is required');
  } else {
    const limits = {
      essentials: 100,
      enhanced: 500,
      premium: -1,
      elite: -1
    };
    
    const limit = limits[tier as keyof typeof limits] || 100;
    
    if (limit !== -1 && description.length > limit) {
      errors.push(`Description must be less than ${limit} characters for ${tier} tier`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Comprehensive form validation
export function validateBusinessForm(formData: any): ValidationResult {
  const errors: string[] = [];

  // Validate required fields
  const businessNameResult = validateBusinessName(formData.businessName);
  if (!businessNameResult.isValid) {
    errors.push(...businessNameResult.errors);
  }

  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.push(...emailResult.errors);
  }

  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.isValid) {
    errors.push(...phoneResult.errors);
  }

  const descriptionResult = validateDescription(formData.description, formData.tier);
  if (!descriptionResult.isValid) {
    errors.push(...descriptionResult.errors);
  }

  if (formData.website) {
    const websiteResult = validateUrl(formData.website);
    if (!websiteResult.isValid) {
      errors.push(...websiteResult.errors);
    }
  }

  // Validate categories
  if (!formData.categories || formData.categories.length === 0) {
    errors.push('At least one category is required');
  }

  // Validate address fields
  if (!formData.address) errors.push('Address is required');
  if (!formData.city) errors.push('City is required');
  if (!formData.state) errors.push('State is required');
  if (!formData.zipCode) errors.push('ZIP code is required');

  return {
    isValid: errors.length === 0,
    errors
  };
}