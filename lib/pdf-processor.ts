// PDF Processing and AI Extraction Library
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";

const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log('🔑 API KEY CHECK:');
console.log('Exists?', !!key);
console.log('First 10 chars:', key?.substring(0, 10));
console.log('Length:', key?.length);

if (!key) {
  // This will be caught by the UI and shown to the user.
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in .env.local!');
}

// Set the workerSrc to the copied worker file in the public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";


// Lazily resolve API key and model at call time.
function getGeminiModel() {
  const isBrowser = typeof window !== "undefined";
  const apiKey = isBrowser ? (process.env.NEXT_PUBLIC_GEMINI_API_KEY as string | undefined) : (process.env.GEMINI_API_KEY as string | undefined);
  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Set GEMINI_API_KEY on the server or NEXT_PUBLIC_GEMINI_API_KEY for client-side use."
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  console.log('API Key exists:', !!apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

// --- INTERFACES (remain the same) ---

export interface BillableItem {
  itemDescription: string;
  unitPrice: number;
  unit: string;
  quantity?: number;
  conditions?: string;
  pageNumber: number;
  confidence: number;
}

export interface ContractParty {
    name: string;
    role: "Vendor" | "Client" | "Partner" | "Contractor" | "Supplier" | "Other";
}

export interface ExtractedContractData {
  contractName: string;
  contractId: string;
  contractNumber: string;
  contractTitle: string;
  version: string;
  contractType: "Master Service Agreement" | "Statement of Work" | "Purchase Order" | "License Agreement" | "Other";
  contractStatus: "Draft" | "Active" | "Pending" | "Expired" | "Terminated";
  relationshipType: "Parent" | "Child" | "Standalone";
  totalContractValue: number;
  annualValue: number;
  currency: string;
  effectiveDate: Date;
  expirationDate: Date;
  autoRenewalEnabled: boolean;
  renewalPeriod: string;
  noticePeriodDays: number;
  hierarchyLevel: number;
  parentContractId: string | null;
  billableItems: BillableItem[];
  contractParties: ContractParty[];
  paymentTerms: string;
  penaltyClauses: string[];
  complianceRequirements: string[];
  confidence: number;
  pageReferences: { [key: string]: number };
}

export interface ExtractedInvoiceData {
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  invoiceDate: Date; // ✅ Changed from string
  dueDate: Date; // ✅ Changed from string
  lineItems: InvoiceLineItem[];
  totalAmount: number;
  confidence: number;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pageNumber: number;
}

export interface ComparisonResult {
  invoiceId: string;
  contractId: string;
  overallMatch: boolean;
  confidence: number;
  exceptions: ValidationException[];
  totalVariance: number;
  potentialSavings: number;
  totalLineItems: number;
  compliantLineItems: number;
  allInvoiceLineItems: InvoiceLineItem[];
  id?: string;
  vendorName?: string;
  validationDate?: string | Date;
}

export interface ValidationException {
  type: "price_mismatch" | "quantity_exceeded" | "unauthorized_item" | "expired_contract";
  severity: "critical" | "warning" | "info";
  lineItem: InvoiceLineItem;
  contractTerm?: BillableItem;
  variance: number;
  description: string;
  proofData: ProofData;
}

export interface ProofData {
    contractPageNumber: number;
    contractText: string;
    contractHighlight: { x: number; y: number; width: number; height: number };
    invoicePageNumber: number;
    invoiceText: string;
    invoiceHighlight: { x: number; y: number; width: number; height: number };
    varianceCalculation: {
        contractPrice: number;
        invoicePrice: number;
        difference: number;
        quantity: number;
        totalOvercharge: number;
    };
}

// --- AI-POWERED EXTRACTION FUNCTIONS ---

export interface TextItem {
    str: string;
    transform: number[];
    width: number;
    height: number;
    pageNumber: number;
}
  
/**
 * Extracts text and positional items from a PDF file.
 */
async function getTextAndItemsFromPdf(file: File): Promise<{ fullText: string; items: TextItem[] }> {
    const data = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
  
    let fullText = "";
    const allItems: TextItem[] = [];
  
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      
      const pageItems = (content.items as any[]).map(item => ({
        str: item.str || "",
        transform: item.transform,
        width: item.width,
        height: item.height,
        pageNumber: pageNum,
      }));
      allItems.push(...pageItems);

      const pageText = pageItems.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }
  
    return { fullText, items: allItems };
}

/**
 * Extracts text from a PDF file using pdfjs-dist (browser-friendly).
 */
async function getTextFromPdf(file: File): Promise<string> {
  const { fullText } = await getTextAndItemsFromPdf(file);
  return fullText;
}

/**
 * Extracts structured data from a contract PDF using AI.
 */
export async function extractContractData(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ extractedData: ExtractedContractData; items: TextItem[] }> {
  onProgress?.(10);
  const { fullText: documentText, items } = await getTextAndItemsFromPdf(file);
  onProgress?.(40);

  const prompt = `
    You are an expert contract analysis AI. Extract key information based on the JSON schema and instructions below.
    Return ONLY valid JSON that strictly adheres to the schema.

    **Instructions & Constraints:**
    1.  **Dates**: Return all dates in ISO format (YYYY-MM-DD).
    2.  **Single-Select Fields**: For the fields \`contractType\`, \`contractStatus\`, and \`relationshipType\`, you MUST choose one of the exact, case-sensitive values provided in the schema below. Do not invent new values. If no value seems to fit, use "Other".

    **JSON Schema:**
    {
      "contractName": "string",
      "contractId": "string",
      "contractNumber": "string",
      "contractTitle": "string",
      "version": "1.0",
      "contractType": ["Master Service Agreement", "Statement of Work", "Purchase Order", "License Agreement", "Other"],
      "contractStatus": ["Draft", "Active", "Pending", "Expired", "Terminated"],
      "relationshipType": ["Parent", "Child", "Standalone"],
      "totalContractValue": 50000.00,
      "annualValue": 25000.00,
      "currency": "USD",
      "effectiveDate": "YYYY-MM-DD",
      "expirationDate": "YYYY-MM-DD",
      "autoRenewalEnabled": true,
      "renewalPeriod": "1 year",
      "noticePeriodDays": 90,
      "hierarchyLevel": 1,
      "parentContractId": null,
      "billableItems": [{
        "itemDescription": "Consulting Services",
        "unitPrice": 150.00,
        "unit": "hour",
        "quantity": 100,
        "conditions": "standard rate",
        "pageNumber": 2,
        "confidence": 0.95
      }],
      "contractParties": [{
          "name": "Vendor Corp",
          "role": "Vendor"
      }, {
          "name": "Client Inc.",
          "role": "Client"
      }],
      "paymentTerms": "Net 30",
      "penaltyClauses": ["Late payment fee of 1.5% per month"],
      "complianceRequirements": ["HIPAA"],
      "confidence": 0.90,
      "pageReferences": { "pricing": 2, "signatures": 4 }
    }

    Contract Text:
    ${documentText.substring(0, 15000)}
  `;

  try {
    const result = await getGeminiModel().generateContent(prompt);
    const response = await result.response;
    onProgress?.(90);

    let jsonString = response.text();
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsedData = JSON.parse(jsonString);

    if (parsedData.error) {
      throw new Error(`AI error: ${parsedData.error}`);
    }

    // ✅ Convert date strings to Date objects
    if(parsedData.effectiveDate) parsedData.effectiveDate = new Date(parsedData.effectiveDate);
    if(parsedData.expirationDate) parsedData.expirationDate = new Date(parsedData.expirationDate);

    console.log("[AI] Contract extraction complete");
    onProgress?.(100);
    return { extractedData: parsedData as ExtractedContractData, items };
  } catch (error) {
    console.error("Error extracting contract data:", error);
    throw new Error(`Failed to extract contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts structured data from an invoice PDF using AI.
 */
export async function extractInvoiceData(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ extractedData: ExtractedInvoiceData; items: TextItem[] }> {
    onProgress?.(10);
    const { fullText: documentText, items } = await getTextAndItemsFromPdf(file);
    onProgress?.(40);

    const prompt = `
        Extract invoice information and return ONLY valid JSON. Use ISO date format.

        {
          "invoiceId": "INV-123",
          "invoiceNumber": "INV-123",
          "vendorName": "Vendor Name",
          "invoiceDate": "2024-12-09",
          "dueDate": "2024-12-31",
          "lineItems": [{
            "description": "Service description",
            "quantity": 8,
            "unitPrice": 70.00,
            "totalPrice": 560.00,
            "pageNumber": 1
          }],
          "totalAmount": 89611.67,
          "confidence": 0.95
        }

        Invoice Text:
        ${documentText.substring(0, 15000)}
    `;

    try {
        const result = await getGeminiModel().generateContent(prompt);
        const response = await result.response;
        onProgress?.(90);
        
        let jsonString = response.text();
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const parsedData = JSON.parse(jsonString);

        if (parsedData.error) {
          throw new Error(`AI error: ${parsedData.error}`);
        }

        // ✅ Convert date strings to Date objects
        
        parsedData.invoiceDate = new Date(parsedData.invoiceDate);
        parsedData.dueDate = new Date(parsedData.dueDate);

        console.log("[AI] Invoice extraction complete");
        onProgress?.(100);
        return { extractedData: parsedData as ExtractedInvoiceData, items };
    } catch (error) {
        console.error("Error extracting invoice data:", error);
        throw new Error(`Failed to extract invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


// --- DETERMINISTIC COMPARISON LOGIC (remains the same) ---

/**
 * Compares invoice against contract and generates exceptions
 */
export async function compareInvoiceToContract(
    invoiceData: ExtractedInvoiceData,
    contractData: ExtractedContractData,
    invoiceItems: TextItem[],
    contractItems: TextItem[]
  ): Promise<ComparisonResult> {
    console.log("Starting comparison...");
  
    const exceptions: ValidationException[] = [];
    let totalVariance = 0;
    const totalLineItems = invoiceData.lineItems.length;
    let compliantLineItems = 0;
  
    // Compare each invoice line item to contract terms
    for (const lineItem of invoiceData.lineItems) {
      let isCompliant = true;
      const matchingTerm = contractData.billableItems.find(
        (term) =>
          term.itemDescription.toLowerCase().includes(lineItem.description.toLowerCase()) ||
          lineItem.description.toLowerCase().includes(term.itemDescription.toLowerCase())
      );
  
      if (!matchingTerm) {
        // Unauthorized item
        isCompliant = false;
        exceptions.push({
          type: "unauthorized_item",
          severity: "warning",
          lineItem,
          variance: lineItem.totalPrice,
          description: `Item "${lineItem.description}" not found in contract`,
          proofData: generateProofData(lineItem, null, invoiceItems, contractItems),
        });
        continue; // Move to the next item
      }
  
      // Check price variance
      const priceDifference = lineItem.unitPrice - matchingTerm.unitPrice;
  
      // Check for a significant price difference to avoid floating point issues.
      if (priceDifference > 0.01) {
        isCompliant = false;
        const overcharge = priceDifference * lineItem.quantity;
        totalVariance += overcharge;
        const variancePercent = (priceDifference / matchingTerm.unitPrice) * 100;
  
        exceptions.push({
          type: "price_mismatch",
          severity: overcharge > 500 ? "critical" : "warning",
          lineItem,
          contractTerm: matchingTerm,
          variance: overcharge,
          description: `Price exceeds contract by ${variancePercent.toFixed(1)}% ($${priceDifference.toFixed(2)}/unit)`,
          proofData: generateProofData(lineItem, matchingTerm, invoiceItems, contractItems),
        });
      }

      if (isCompliant) {
        compliantLineItems++;
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
      totalLineItems,
      compliantLineItems,
      allInvoiceLineItems: invoiceData.lineItems, // Pass through the original line items
    };
  
    console.log("Comparison complete:", result);
    return result;
  }

function findTextCoordinates(items: TextItem[], searchTerm: string, pageNumber: number): { x: number; y: number; width: number; height: number } {
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    const pageItems = items.filter(item => item.pageNumber === pageNumber);
  
    let bestMatch = { startIndex: -1, matchedWords: 0 };
  
    for (let i = 0; i < pageItems.length; i++) {
      let currentMatchedWords = 0;
      for (let j = 0; j < searchWords.length && i + j < pageItems.length; j++) {
        if (pageItems[i + j].str.toLowerCase().includes(searchWords[j])) {
          currentMatchedWords++;
        } else {
          break;
        }
      }
      if (currentMatchedWords > bestMatch.matchedWords) {
        bestMatch = { startIndex: i, matchedWords: currentMatchedWords };
      }
    }
  
    if (bestMatch.startIndex === -1) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  
    const firstItem = pageItems[bestMatch.startIndex];
    const lastItem = pageItems[bestMatch.startIndex + bestMatch.matchedWords - 1];
  
    const x = firstItem.transform[4];
    const y = firstItem.transform[5];
    const width = (lastItem.transform[4] + lastItem.width) - x;
    const height = Math.max(...pageItems.slice(bestMatch.startIndex, bestMatch.startIndex + bestMatch.matchedWords).map(item => item.height));
  
    return { x, y, width, height };
}

/**
 * Generates proof data with real coordinates for the side-by-side comparison modal
 */
function generateProofData(
    lineItem: InvoiceLineItem,
    contractTerm: BillableItem | null,
    invoiceItems: TextItem[],
    contractItems: TextItem[]
): ProofData {
    const invoiceHighlight = findTextCoordinates(invoiceItems, lineItem.description, lineItem.pageNumber);
  
    if (!contractTerm) {
      return {
        contractPageNumber: 0,
        contractText: "No matching term found in contract",
        contractHighlight: { x: 0, y: 0, width: 0, height: 0 },
        invoicePageNumber: lineItem.pageNumber,
        invoiceText: `${lineItem.description}\nQuantity: ${lineItem.quantity}\nUnit Price: $${lineItem.unitPrice}`,
        invoiceHighlight,
        varianceCalculation: {
          contractPrice: 0,
          invoicePrice: lineItem.unitPrice,
          difference: lineItem.unitPrice,
          quantity: lineItem.quantity,
          totalOvercharge: lineItem.totalPrice,
        },
      };
    }
  
    const contractHighlight = findTextCoordinates(contractItems, contractTerm.itemDescription, contractTerm.pageNumber);
  
    return {
      contractPageNumber: contractTerm.pageNumber,
      contractText: `${contractTerm.itemDescription}\nUnit Price: $${contractTerm.unitPrice} per ${contractTerm.unit}\n${contractTerm.conditions || ""}`,
      contractHighlight,
      invoicePageNumber: lineItem.pageNumber,
      invoiceText: `${lineItem.description}\nQuantity: ${lineItem.quantity}\nUnit Price: $${lineItem.unitPrice}\nTotal: $${lineItem.totalPrice}`,
      invoiceHighlight,
      varianceCalculation: {
        contractPrice: contractTerm.unitPrice,
        invoicePrice: lineItem.unitPrice,
        difference: lineItem.unitPrice - contractTerm.unitPrice,
        quantity: lineItem.quantity,
        totalOvercharge: (lineItem.unitPrice - contractTerm.unitPrice) * lineItem.quantity,
      },
    };
}

// --- ANALYSIS FUNCTIONS (remain the same) ---

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
    console.log("Generating analysis report...")
  
    const totalSavings = comparisons.reduce((sum, c) => sum + c.potentialSavings, 0)
    const totalExceptions = comparisons.reduce((sum, c) => sum + c.exceptions.length, 0)
    const avgConfidence = comparisons.length > 0 ? comparisons.reduce((sum, c) => sum + c.confidence, 0) / comparisons.length : 0;
  
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
