// lib/server/document-processor.ts

/**
 * IMPORTANT: THIS FILE IS SERVER-SIDE ONLY.
 * It contains logic that uses Node.js APIs and should not be imported into client components.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import { TextItem, ExtractedInvoiceData, ExtractedContractData } from "@/lib/pdf-processor";

// This is a server-side only import
const pdfOcr = require('pdf-ocr');

// Set the workerSrc for pdfjs-dist on the server
pdfjsLib.GlobalWorkerOptions.workerSrc = `../../node_modules/.pnpm/pdfjs-dist@${pdfjsLib.version}/node_modules/pdfjs-dist/build/pdf.worker.mjs`;

function getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured for server-side use.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

async function getTextAndItemsFromPdf(fileBuffer: ArrayBuffer): Promise<{ fullText: string; items: TextItem[] }> {
    const data = new Uint8Array(fileBuffer);
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

    // Fallback to OCR if text is sparse
    if (fullText.trim().length < 100) {
        console.log("Sparse text found, attempting OCR fallback...");
        return new Promise((resolve, reject) => {
            pdfOcr.extractText(Buffer.from(fileBuffer), (err: Error | null, text: string) => {
                if (err) {
                    console.error("OCR failed:", err);
                    // Resolve with the sparse text instead of rejecting
                    resolve({ fullText, items: allItems });
                } else {
                    console.log("OCR successful.");
                    // Note: OCR does not provide positional items.
                    resolve({ fullText: text, items: [] });
                }
            });
        });
    }

    return { fullText, items: allItems };
}

export async function extractInvoiceDataServer(fileBuffer: ArrayBuffer): Promise<{ extractedData: ExtractedInvoiceData; items: TextItem[] }> {
    const { fullText: documentText, items } = await getTextAndItemsFromPdf(fileBuffer);

    const prompt = `
        You are an expert invoice extraction AI...
        ...
        Invoice Text:
        ${documentText.substring(0, 15000)}
    `;

    try {
        const result = await getGeminiModel().generateContent(prompt);
        const response = await result.response;
        let jsonString = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedData = JSON.parse(jsonString);
        
        if (parsedData.error) throw new Error(`AI error: ${parsedData.error}`);
        
        parsedData.invoiceDate = new Date(parsedData.invoiceDate);
        parsedData.dueDate = new Date(parsedData.dueDate);

        return { extractedData: parsedData as ExtractedInvoiceData, items };
    } catch (error) {
        console.error("Error extracting invoice data on server:", error);
        throw new Error(`Failed to extract invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function extractContractDataServer(fileBuffer: ArrayBuffer): Promise<{ extractedData: ExtractedContractData; items: TextItem[] }> {
    const { fullText: documentText, items } = await getTextAndItemsFromPdf(fileBuffer);
    
    // Using a simplified prompt for brevity
    const prompt = `
        You are an expert contract analysis AI...
        ...
        Contract Text:
        ${documentText.substring(0, 15000)}
    `;

    try {
        const result = await getGeminiModel().generateContent(prompt);
        const response = await result.response;
        let jsonString = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedData = JSON.parse(jsonString);

        if (parsedData.error) throw new Error(`AI error: ${parsedData.error}`);

        if(parsedData.effectiveDate) parsedData.effectiveDate = new Date(parsedData.effectiveDate);
        if(parsedData.expirationDate) parsedData.expirationDate = new Date(parsedData.expirationDate);

        return { extractedData: parsedData as ExtractedContractData, items };
    } catch (error) {
        console.error("Error extracting contract data on server:", error);
        throw new Error(`Failed to extract contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

