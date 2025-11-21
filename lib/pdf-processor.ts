// PDF Processing and AI Extraction Library
// This simulates the PDF reading and comparison functionality

export interface ExtractedContractData {
  contractId: string
  vendorName: string
  effectiveDate: string
  expirationDate: string
  pricingTerms: PricingTerm[]
  paymentTerms: string
  penaltyClauses: string[]
  complianceRequirements: string[]
  confidence: number
  pageReferences: { [key: string]: number }
}

export interface PricingTerm {
  itemDescription: string
  unitPrice: number
  unit: string
  quantity?: number
  conditions?: string
  pageNumber: number
  confidence: number
}

export interface ExtractedInvoiceData {
  invoiceId: string
  invoiceNumber: string
  vendorName: string
  invoiceDate: string
  dueDate: string
  lineItems: InvoiceLineItem[]
  totalAmount: number
  confidence: number
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  pageNumber: number
}

export interface ComparisonResult {
  invoiceId: string
  contractId: string
  overallMatch: boolean
  confidence: number
  exceptions: ValidationException[]
  totalVariance: number
  potentialSavings: number
}

export interface ValidationException {
  type: "price_mismatch" | "quantity_exceeded" | "unauthorized_item" | "expired_contract"
  severity: "critical" | "warning" | "info"
  lineItem: InvoiceLineItem
  contractTerm?: PricingTerm
  variance: number
  description: string
  proofData: ProofData
}

export interface ProofData {
  contractPageNumber: number
  contractText: string
  contractHighlight: { x: number; y: number; width: number; height: number }
  invoicePageNumber: number
  invoiceText: string
  invoiceHighlight: { x: number; y: number; width: number; height: number }
  varianceCalculation: {
    contractPrice: number
    invoicePrice: number
    difference: number
    quantity: number
    totalOvercharge: number
  }
}

/**
 * Simulates PDF text extraction using OCR + LLM
 * In production, this would use AWS Textract + Claude/GPT-4
 */
export async function extractContractData(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ExtractedContractData> {
  // Simulate processing time
  await simulateProcessing(onProgress)

  const isMedical = file.name.toLowerCase().includes("med") || file.name.toLowerCase().includes("health")
  const isIT = file.name.toLowerCase().includes("tech") || file.name.toLowerCase().includes("soft")

  const vendorName = file.name.split("-")[0] || "Detected Vendor"

  // Mock extracted data based on file context
  const mockData: ExtractedContractData = {
    contractId: `CONTRACT-${Date.now()}`,
    vendorName: vendorName.replace(/_/g, " "),
    effectiveDate: new Date().toISOString().split("T")[0],
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pricingTerms: isIT
      ? [
          {
            itemDescription: "Software License - Enterprise",
            unitPrice: 150.0,
            unit: "user/month",
            quantity: 500,
            pageNumber: 3,
            confidence: 0.98,
          },
          {
            itemDescription: "Cloud Storage (TB)",
            unitPrice: 25.0,
            unit: "TB",
            pageNumber: 4,
            confidence: 0.96,
          },
        ]
      : [
          {
            itemDescription: "Surgical Gloves, Size L",
            unitPrice: 4.75,
            unit: "box",
            quantity: 1000,
            pageNumber: 7,
            confidence: 0.98,
          },
          {
            itemDescription: "N95 Respirator Masks",
            unitPrice: 1.25,
            unit: "each",
            pageNumber: 7,
            confidence: 0.96,
          },
          {
            itemDescription: "Syringes, 10ml",
            unitPrice: 0.45,
            unit: "each",
            pageNumber: 8,
            confidence: 0.97,
          },
        ],
    paymentTerms: "Net 30 days from invoice date",
    penaltyClauses: ["Late payment: 1.5% per month", "Early termination fee: $5,000"],
    complianceRequirements: ["HIPAA compliant", "ISO 13485 certified"],
    confidence: 0.97,
    pageReferences: {
      pricing: 7,
      payment: 12,
      penalties: 15,
      compliance: 3,
    },
  }

  console.log("[v0] Contract extraction complete:", mockData)
  return mockData
}

/**
 * Extracts line items from invoice PDF
 */
export async function extractInvoiceData(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ExtractedInvoiceData> {
  await simulateProcessing(onProgress)

  const isIT = file.name.toLowerCase().includes("tech") || file.name.toLowerCase().includes("soft")

  const mockData: ExtractedInvoiceData = {
    invoiceId: `INV-${Date.now()}`,
    invoiceNumber: `INV-${Math.floor(Math.random() * 100000)}`,
    vendorName: file.name.split("-")[0]?.replace(/_/g, " ") || "Detected Vendor",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    lineItems: isIT
      ? [
          {
            description: "Software License - Enterprise",
            quantity: 500,
            unitPrice: 165.0, // Overcharge
            totalPrice: 82500,
            pageNumber: 1,
          },
          {
            description: "Cloud Storage (TB)",
            quantity: 10,
            unitPrice: 25.0,
            totalPrice: 250,
            pageNumber: 1,
          },
        ]
      : [
          {
            description: "Surgical Gloves, Size L",
            quantity: 1000,
            unitPrice: 5.2, // Overcharge!
            totalPrice: 5200,
            pageNumber: 2,
          },
          {
            description: "N95 Respirator Masks",
            quantity: 500,
            unitPrice: 1.25, // Correct price
            totalPrice: 625,
            pageNumber: 2,
          },
        ],
    totalAmount: isIT ? 82750 : 5825,
    confidence: 0.96,
  }

  console.log("[v0] Invoice extraction complete:", mockData)
  return mockData
}

/**
 * Compares invoice against contract and generates exceptions
 */
export async function compareInvoiceToContract(
  invoiceData: ExtractedInvoiceData,
  contractData: ExtractedContractData,
): Promise<ComparisonResult> {
  console.log("[v0] Starting comparison...")

  const exceptions: ValidationException[] = []
  let totalVariance = 0

  // Compare each invoice line item to contract terms
  for (const lineItem of invoiceData.lineItems) {
    const matchingTerm = contractData.pricingTerms.find(
      (term) =>
        term.itemDescription.toLowerCase().includes(lineItem.description.toLowerCase()) ||
        lineItem.description.toLowerCase().includes(term.itemDescription.toLowerCase()),
    )

    if (!matchingTerm) {
      // Unauthorized item
      exceptions.push({
        type: "unauthorized_item",
        severity: "warning",
        lineItem,
        variance: lineItem.totalPrice,
        description: `Item "${lineItem.description}" not found in contract`,
        proofData: generateMockProofData(lineItem, null),
      })
      continue
    }

    // Check price variance
    const priceDifference = lineItem.unitPrice - matchingTerm.unitPrice
    const variancePercent = (priceDifference / matchingTerm.unitPrice) * 100

    if (variancePercent > 5) {
      // More than 5% over contract price
      const overcharge = priceDifference * lineItem.quantity
      totalVariance += overcharge

      exceptions.push({
        type: "price_mismatch",
        severity: overcharge > 500 ? "critical" : "warning",
        lineItem,
        contractTerm: matchingTerm,
        variance: overcharge,
        description: `Price exceeds contract by ${variancePercent.toFixed(1)}% ($${priceDifference.toFixed(2)}/unit)`,
        proofData: generateMockProofData(lineItem, matchingTerm),
      })
    }
  }

  const result: ComparisonResult = {
    invoiceId: invoiceData.invoiceId,
    contractId: contractData.contractId,
    overallMatch: exceptions.length === 0,
    confidence: Math.min(invoiceData.confidence, contractData.confidence),
    exceptions,
    totalVariance,
    potentialSavings: totalVariance,
  }

  console.log("[v0] Comparison complete:", result)
  return result
}

/**
 * Generates mock proof data for the side-by-side comparison modal
 */
function generateMockProofData(lineItem: InvoiceLineItem, contractTerm: PricingTerm | null): ProofData {
  if (!contractTerm) {
    return {
      contractPageNumber: 0,
      contractText: "No matching term found in contract",
      contractHighlight: { x: 0, y: 0, width: 0, height: 0 },
      invoicePageNumber: lineItem.pageNumber,
      invoiceText: `${lineItem.description}\nQuantity: ${lineItem.quantity}\nUnit Price: $${lineItem.unitPrice}`,
      invoiceHighlight: { x: 50, y: 200, width: 400, height: 60 },
      varianceCalculation: {
        contractPrice: 0,
        invoicePrice: lineItem.unitPrice,
        difference: lineItem.unitPrice,
        quantity: lineItem.quantity,
        totalOvercharge: lineItem.totalPrice,
      },
    }
  }

  return {
    contractPageNumber: contractTerm.pageNumber,
    contractText: `${contractTerm.itemDescription}\nUnit Price: $${contractTerm.unitPrice} per ${contractTerm.unit}\n${contractTerm.conditions || ""}`,
    contractHighlight: { x: 50, y: 150, width: 400, height: 80 },
    invoicePageNumber: lineItem.pageNumber,
    invoiceText: `${lineItem.description}\nQuantity: ${lineItem.quantity}\nUnit Price: $${lineItem.unitPrice}\nTotal: $${lineItem.totalPrice}`,
    invoiceHighlight: { x: 50, y: 200, width: 400, height: 80 },
    varianceCalculation: {
      contractPrice: contractTerm.unitPrice,
      invoicePrice: lineItem.unitPrice,
      difference: lineItem.unitPrice - contractTerm.unitPrice,
      quantity: lineItem.quantity,
      totalOvercharge: (lineItem.unitPrice - contractTerm.unitPrice) * lineItem.quantity,
    },
  }
}

/**
 * Simulates processing time with progress updates
 */
async function simulateProcessing(onProgress?: (progress: number) => void): Promise<void> {
  const steps = 10
  for (let i = 0; i <= steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (onProgress) {
      onProgress((i / steps) * 100)
    }
  }
}

/**
 * Generate analysis report
 */
export interface AnalysisReport {
  summary: {
    totalInvoicesProcessed: number
    totalExceptions: number
    totalSavings: number
    averageConfidence: number
  }
  topVendorIssues: {
    vendorName: string
    exceptionCount: number
    totalVariance: number
  }[]
  categoryBreakdown: {
    category: string
    savings: number
  }[]
  recommendations: string[]
}

export async function generateAnalysisReport(comparisons: ComparisonResult[]): Promise<AnalysisReport> {
  console.log("[v0] Generating analysis report...")

  const totalSavings = comparisons.reduce((sum, c) => sum + c.potentialSavings, 0)
  const totalExceptions = comparisons.reduce((sum, c) => sum + c.exceptions.length, 0)
  const avgConfidence = comparisons.reduce((sum, c) => sum + c.confidence, 0) / comparisons.length

  return {
    summary: {
      totalInvoicesProcessed: comparisons.length,
      totalExceptions,
      totalSavings,
      averageConfidence: avgConfidence,
    },
    topVendorIssues: [
      { vendorName: "Cardinal Health", exceptionCount: 12, totalVariance: 15420 },
      { vendorName: "McKesson", exceptionCount: 8, totalVariance: 9230 },
    ],
    categoryBreakdown: [
      { category: "Medical Supplies", savings: 18450 },
      { category: "Equipment Maintenance", savings: 6200 },
    ],
    recommendations: [
      "Renegotiate pricing with Cardinal Health - 12 overcharge instances found",
      "Review all equipment maintenance contracts - significant variance detected",
      "Implement automated validation for high-volume vendors",
    ],
  }
}
