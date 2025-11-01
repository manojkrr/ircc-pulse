import {processData} from "./dataProcessor.ts";

export const QUERY_KEY_PROCESSING_TIMES = [`processingTimesIRCC`];

export const IRCC_API_URL = 'https://www.canada.ca/content/dam/ircc/documents/json/flpt-en.json';

const getProcessingTimesDataFromIRCC = async () => {
    const response = await fetch(IRCC_API_URL)
    if (response.ok) {
        const rawData = await response.json()
        return await processData(rawData)
    }
    return await fetchLocalProcessingTimesData();
}

const fetchLocalProcessingTimesData = async () => {
    const response = await fetch('./october2025.json')
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    const rawData = await response.json()
    return await processData(rawData)
}

export default getProcessingTimesDataFromIRCC;
