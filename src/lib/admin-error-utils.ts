/**
 * Admin Error Handling Utilities
 * Provides user-friendly error messages for non-technical admins
 */

import { ApiError } from './api';

export interface FieldError {
  field: string;
  message: string;
}

export interface ParsedError {
  generalMessage: string;
  fieldErrors: FieldError[];
  technicalDetails?: string;
}

/**
 * Converts field names to user-friendly labels
 */
const FIELD_LABELS: Record<string, string> = {
  // Blog post fields
  title: 'Blog Post Title',
  slug: 'URL Slug',
  content: 'Blog Content',
  excerpt: 'Excerpt',
  featuredImage: 'Featured Image',
  author: 'Author',
  'author.name': 'Author Name',
  'author.email': 'Author Email',
  categories: 'Categories',
  tags: 'Tags',
  status: 'Publication Status',
  seoTitle: 'SEO Title',
  seoDescription: 'SEO Description',
  seoKeywords: 'SEO Keywords',
  
  // Product fields
  name: 'Product Name',
  price: 'Price',
  stock: 'Stock Quantity',
  description: 'Description',
  images: 'Product Images',
  category: 'Category',
  
  // Common fields
  email: 'Email Address',
  phone: 'Phone Number',
  firstName: 'First Name',
  lastName: 'Last Name',
  address: 'Address',
  city: 'City',
  password: 'Password',
};

/**
 * Converts error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Blog errors
  'BLOG_TITLE_REQUIRED': 'Please enter a title for your blog post',
  'BLOG_CONTENT_REQUIRED': 'Please add content to your blog post',
  'BLOG_SLUG_REQUIRED': 'A URL slug is required for your blog post',
  'BLOG_AUTHOR_REQUIRED': 'Please provide author information',
  'BLOG_POST_CREATE_ERROR': 'Unable to save your blog post. Please check all required fields and try again',
  
  // Validation errors
  'VALIDATION_ERROR': 'Please check the form and fix any errors',
  'REQUIRED_FIELD': 'This field is required',
  'INVALID_FORMAT': 'Please enter a valid value',
  'INVALID_EMAIL': 'Please enter a valid email address',
  'INVALID_PHONE': 'Please enter a valid phone number',
  
  // Server errors
  'INTERNAL_SERVER_ERROR': 'Something went wrong on our end. Please try again in a few moments',
  'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection',
  'SESSION_EXPIRED': 'Your session has expired. Please refresh the page and log in again',
  
  // Permission errors
  'UNAUTHORIZED': 'You do not have permission to perform this action',
  'FORBIDDEN': 'Access denied. Please contact an administrator',
};

/**
 * Get user-friendly label for a field
 */
function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field.split('.').map(part => {
    // Convert camelCase to Title Case
    return part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1');
  }).join(' > ');
}

/**
 * Get user-friendly error message for a code
 */
function getErrorMessage(code?: string, defaultMessage?: string): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  return defaultMessage || 'An error occurred. Please try again';
}

/**
 * Parse API error into user-friendly format
 */
export function parseApiError(error: unknown): ParsedError {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    const fieldErrors: FieldError[] = [];
    
    // If there's a field-specific error
    if (error.field) {
      fieldErrors.push({
        field: error.field,
        message: getErrorMessage(error.code, error.message)
      });
    }
    
    // General message
    let generalMessage = getErrorMessage(error.code, error.message);
    
    // If we have validation errors in details, parse them
    if (error.details && typeof error.details === 'string') {
      try {
        // Check if details contains multiple errors separated by semicolons
        if (error.details.includes(';')) {
          // Split by semicolon for multiple errors (e.g., "field1: error1; field2: error2")
          const errorParts = error.details.split(';');
          errorParts.forEach(part => {
            const trimmed = part.trim();
            if (trimmed) {
              // Try to parse as "field: message" format
              const colonIndex = trimmed.indexOf(':');
              if (colonIndex > 0) {
                const field = trimmed.substring(0, colonIndex).trim();
                const message = trimmed.substring(colonIndex + 1).trim();
                if (field && message) {
                  fieldErrors.push({
                    field,
                    message: getErrorMessage(undefined, message)
                  });
                }
              } else {
                // No colon found, treat as general message part
                if (generalMessage === getErrorMessage(error.code, error.message)) {
                  generalMessage = trimmed;
                }
              }
            }
          });
          
          // If we parsed field errors, update general message
          if (fieldErrors.length > 0) {
            generalMessage = 'Please fix the errors below to continue';
          }
        } else if (error.details.includes(':')) {
          // Single field error in format "field: message"
          const colonIndex = error.details.indexOf(':');
          const field = error.details.substring(0, colonIndex).trim();
          const message = error.details.substring(colonIndex + 1).trim();
          if (field && message) {
            fieldErrors.push({
              field,
              message: getErrorMessage(undefined, message)
            });
            generalMessage = 'Please fix the error below to continue';
          }
        } else {
          // Details is just a message, use it as general message
          generalMessage = error.details;
        }
      } catch {
        // If parsing fails, use details as general message
        generalMessage = error.details;
      }
    }
    
    return {
      generalMessage: fieldErrors.length === 0 ? generalMessage : 'Please fix the errors below',
      fieldErrors,
      technicalDetails: process.env.NODE_ENV === 'development' 
        ? `${error.message} (${error.status} - ${error.code || 'NO_CODE'})`
        : undefined
    };
  }
  
  // Handle Error instances
  if (error instanceof Error) {
    return {
      generalMessage: getErrorMessage(undefined, error.message),
      fieldErrors: [],
      technicalDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      generalMessage: getErrorMessage(undefined, error),
      fieldErrors: []
    };
  }
  
  // Handle unknown errors
  return {
    generalMessage: 'An unexpected error occurred. Please try again',
    fieldErrors: [],
    technicalDetails: process.env.NODE_ENV === 'development' ? String(error) : undefined
  };
}

/**
 * Get user-friendly field name for display
 */
export function getFieldDisplayName(field: string): string {
  return getFieldLabel(field);
}

