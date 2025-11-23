// lib/teable-fields.ts
import type { ValidationException, ComparisonResult } from "./pdf-processor";

/**
 * Maps a ValidationException object from the application's internal data structure
 * to the specific field names required by the 'validation_exceptions' Teable table.
 * 
 * @param exception - The validation exception object from the comparison logic.
 * @returns An object with keys matching the Teable table's column names.
 */
export function mapExceptionToTeableFields(exception: ValidationException): Record<string, unknown> {
  return {
    // 'Validation Exception' is likely the primary display field in Teable, 
    // combining type and description for a clear summary.
    'Validation Exception': `${exception.type}: ${exception.description}`,
    'exception_id': `ex_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID
    'exception_type': convertExceptionTypeToTeableChoice(exception.type),
    'exception_category': getCategoryFromType(exception.type), // Helper to categorize exceptions
    'severity': exception.severity,
    'message': exception.description,
    'line_number': exception.lineItem.pageNumber, // Assuming page number can stand in for line number
    'field_name': exception.lineItem.description, // The item description that caused the exception
    'expected_value': exception.contractTerm ? exception.contractTerm.unitPrice.toString() : "N/A",
    'actual_value': exception.lineItem.unitPrice.toString(),
    'variance_amount': exception.variance,
    'root_cause': 'Data mismatch between invoice and contract.', // Generic root cause
    'recommendation': getRecommendationFromType(exception.type), // Helper for actionable advice
    'resolved': false, // Default to unresolved
  };
}

/**
 * Converts the internal exception type string to the user-friendly format
 * expected by the Teable 'Single Select' field.
 * @param type The internal exception type.
 * @returns A string formatted for Teable.
 */
function convertExceptionTypeToTeableChoice(type: ValidationException['type']): string {
  switch (type) {
    case 'price_mismatch':
      return 'Price Mismatch';
    case 'quantity_exceeded':
      return 'Quantity Exceeded';
    case 'unauthorized_item':
      return 'Business Rule';
    case 'expired_contract':
      return 'Expired Contract';
    default:
      // Fallback for any unhandled types
      return 'General Exception';
  }
}


/**
 * Maps the high-level ComparisonResult object to the fields of the 'invoice_validations' table.
 * @param summary - The top-level result object from the comparison logic.
 * @returns An object with keys matching the Teable table's column names.
 */
export function mapSummaryToTeableFields(summary: ComparisonResult, vendorName: string): Record<string, unknown> {
  const validationDate = new Date().toISOString();
  return {
    'validation_id': `val_${new Date(validationDate).getTime()}`,
    'overall_status': summary.overallMatch ? 'Approved' : 'Under Review',
    'confidence_score': summary.confidence,
    'variance_amount': summary.totalVariance,
    'potential_savings': summary.potentialSavings,
    'rules_applied_count': summary.exceptions.length,
    'validation_date': validationDate,
    'contract_matched': true,
    'vendor_name': vendorName,
    // Add these once the user confirms the columns have been added to Teable
    // 'total_line_items': summary.totalLineItems,
    // 'compliant_line_items': summary.compliantLineItems,
  };
}


/**
 * A helper function to assign a broader category based on the exception type.
 * @param type - The specific type of the validation exception.
 * @returns A string representing the general category.
 */
function getCategoryFromType(type: ValidationException['type']): string {
  switch (type) {
    case 'price_mismatch':
      return 'Out of Range';
    case 'quantity_exceeded':
      return 'Out of Range';
    case 'unauthorized_item':
      return 'Permission Denied'; // Mapping to closest available option
    case 'expired_contract':
      return 'Missing Data'; // Mapping to closest available option
    default:
      return 'General';
  }
}

/**
 * A helper function to provide a suggested next step based on the exception type.
 * @param type - The specific type of the validation exception.
 * @returns A string with a recommended action.
 */
function getRecommendationFromType(type: ValidationException['type']): string {
  switch (type) {
    case 'price_mismatch':
      return 'Review contract pricing terms and invoice unit price. Contact vendor if overcharge is confirmed.';
    case 'quantity_exceeded':
      return 'Verify purchase order against invoice quantity. Check for partial shipments or billing errors.';
    case 'unauthorized_item':
      return 'Confirm if item should be added to the contract or if it was billed in error.';
    case 'expired_contract':
      return 'Invoice is for a contract that has expired. Check for a contract renewal or extension.';
    default:
      return 'Manual review required.';
  }
}
