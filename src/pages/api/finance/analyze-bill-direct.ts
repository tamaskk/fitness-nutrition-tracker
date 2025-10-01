// Hybrid analysis function: Tesseract.js OCR + GPT parsing
import Tesseract from 'tesseract.js';

// Initialize OpenAI only if API key is available
let openai: any = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function analyzeBillImage(imageUrl: string) {
  try {
    console.log('Starting OCR analysis with Tesseract.js...');
    
    // Step 1: Perform OCR on the image
    const { data: { text, confidence } } = await Tesseract.recognize(
      imageUrl,
      'hun+eng', // Hungarian and English
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    console.log('OCR completed. Confidence:', confidence);
    console.log('Extracted text:', text);

    // Step 2: Use GPT to parse the OCR text
    if (openai && text.trim().length > 0) {
      console.log('Parsing OCR text with GPT...');
      const gptAnalysis = await parseReceiptWithGPT(text);
      if (gptAnalysis.success) {
        return {
          success: true,
          analysis: gptAnalysis.analysis
        };
      }
    }

    // Fallback: Parse with our custom logic if GPT fails or is not available
    console.log('Falling back to custom parsing...');
    const analysis = parseBillText(text, confidence);

    return {
      success: true,
      analysis
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    return {
      success: false,
      message: 'Failed to analyze image'
    };
  }
}

async function parseReceiptWithGPT(ocrText: string) {
  try {
    if (!openai) {
      return { success: false, message: 'OpenAI not configured' };
    }

    const prompt = `
You are a receipt parser. Convert the following receipt text into JSON with the structure:
{
  "totalAmount": number,
  "merchant": string,
  "date": string (YYYY-MM-DD format),
  "items": [
    { "name": string, "price": number, "quantity": number }
  ],
  "currency": string,
  "confidence": number (0-1)
}

Important rules:
- Extract the total amount from lines containing "ÖSSZESEN", "TOTAL", "ÖSSZEG", or "FIZETENDŐ"
- Extract merchant name from the top of the receipt (LIDL, TESCO, SPAR, etc.)
- Extract date in YYYY-MM-DD format
- For items, extract name and price from each line
- Set quantity to 1 if not specified
- Currency should be "HUF" for Hungarian receipts
- Confidence should be 0.8-0.95 for good OCR text

Receipt text:
"""${ocrText}"""
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the latest mini model
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Validate and clean the result
    const cleanedResult = {
      totalAmount: result.totalAmount || 0,
      merchant: result.merchant || 'Ismeretlen',
      date: result.date || new Date().toISOString().split('T')[0],
      items: Array.isArray(result.items) ? result.items.map((item: any) => ({
        name: item.name || 'Ismeretlen tétel',
        price: item.price || 0,
        quantity: item.quantity || 1
      })) : [],
      currency: result.currency || 'HUF',
      confidence: Math.min(Math.max(result.confidence || 0.8, 0), 1),
      note: 'Tesseract.js OCR + GPT elemzés'
    };

    return {
      success: true,
      analysis: cleanedResult
    };

  } catch (error) {
    console.error('GPT parsing error:', error);
    return {
      success: false,
      message: 'GPT parsing failed'
    };
  }
}

function parseBillText(text: string, confidence: number) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let totalAmount = 0;
  let merchant = 'Ismeretlen';
  let date = new Date().toISOString().split('T')[0];
  let items: Array<{name: string, price: number, quantity: number}> = [];
  let currency = 'HUF';

  // Extract merchant name (usually at the top)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toUpperCase();
    if (line.includes('LIDL') || line.includes('TESCO') || line.includes('SPAR') || 
        line.includes('ALDI') || line.includes('PENNY') || line.includes('CBA')) {
      merchant = lines[i];
      break;
    }
  }

  // Extract total amount (look for patterns like "ÖSSZESEN", "TOTAL", "ÖSSZEG")
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    
    // Look for total amount patterns
    if (upperLine.includes('ÖSSZESEN') || upperLine.includes('TOTAL') || 
        upperLine.includes('ÖSSZEG') || upperLine.includes('FIZETENDŐ')) {
      
      // Extract number from the line
      const numbers = line.match(/\d{1,3}(?:\s?\d{3})*(?:\s?[.,]\d{2})?/g);
      if (numbers && numbers.length > 0) {
        // Take the largest number as total
        const amounts = numbers.map(num => 
          parseFloat(num.replace(/\s/g, '').replace(',', '.'))
        );
        totalAmount = Math.max(...amounts);
      }
    }
    
    // Look for date patterns (YYYY.MM.DD or DD.MM.YYYY)
    const dateMatch = line.match(/(\d{4}[.,]\s?\d{1,2}[.,]\s?\d{1,2})|(\d{1,2}[.,]\s?\d{1,2}[.,]\s?\d{4})/);
    if (dateMatch) {
      const dateStr = dateMatch[0].replace(/[.,\s]/g, '.');
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY.MM.DD format
          date = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          // DD.MM.YYYY format
          date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }
  }

  // Extract items (lines with prices)
  for (const line of lines) {
    // Skip header lines and total lines
    if (line.toUpperCase().includes('ÖSSZESEN') || 
        line.toUpperCase().includes('TOTAL') ||
        line.toUpperCase().includes('NYUGTA') ||
        line.toUpperCase().includes('LIDL') ||
        line.toUpperCase().includes('TESCO') ||
        line.length < 5) {
      continue;
    }

    // Look for lines with prices (numbers at the end)
    const priceMatch = line.match(/(.+?)\s+(\d{1,3}(?:\s?\d{3})*(?:\s?[.,]\d{2})?)\s*$/);
    if (priceMatch) {
      const itemName = priceMatch[1].trim();
      const priceStr = priceMatch[2].replace(/\s/g, '').replace(',', '.');
      const price = parseFloat(priceStr);
      
      // Skip if price is too high (likely total) or too low
      if (price > 0 && price < 50000 && itemName.length > 2) {
        items.push({
          name: itemName,
          price: price,
          quantity: 1
        });
      }
    }
  }

  // If no total found, sum up items
  if (totalAmount === 0 && items.length > 0) {
    totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  }

  // Calculate confidence based on OCR confidence and data quality
  let finalConfidence = confidence / 100; // Convert to 0-1 scale
  
  // Adjust confidence based on data quality
  if (totalAmount === 0) finalConfidence *= 0.5;
  if (items.length === 0) finalConfidence *= 0.7;
  if (merchant === 'Ismeretlen') finalConfidence *= 0.8;

  return {
    totalAmount,
    merchant,
    date,
    items: items.slice(0, 20), // Limit to 20 items
    currency,
    confidence: Math.min(Math.max(finalConfidence, 0), 1),
    note: 'Tesseract.js OCR elemzés (fallback)'
  };
}
