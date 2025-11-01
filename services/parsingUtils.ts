import { CategoryMonthRow } from "../types";

export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

export function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

export function extractWaitingInt(s?: string): number {
  if (!s) return 0;
  const match = s.match(/(\d[\d,]*)/);
  return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
}

export function monthsFromString(s?: string): number {
  const str = String(s ?? "").toLowerCase();
  if (!str || str === "n/a") return 0;

  const moreThanYearMatch = str.match(/more than\s+(\d+)\s*year/);
  if (moreThanYearMatch) return parseInt(moreThanYearMatch[1], 10) * 12;

  const moreThanMonthMatch = str.match(/more than\s+(\d+)\s*month/);
  if (moreThanMonthMatch) return parseInt(moreThanMonthMatch[1], 10);
  
  const yearMatch = str.match(/(\d+)\s*year/);
  if (yearMatch) return parseInt(yearMatch[1], 10) * 12;

  const monthMatch = str.match(/(\d+)\s*month/);
  if (monthMatch) return parseInt(monthMatch[1], 10);
  
  return 0;
}

export function formatInt(n: number): string {
  return n.toLocaleString("en-CA");
}

export function formatMonthsYears(months?: number): string {
  if (months === undefined || months === null || months <= 0) return 'N/A';

  const years = Math.floor(months / 12);
  
  if (years >= 10) {
    return "More than 10 years";
  }
  
  const remMonths = months % 12;

  if (years > 0) {
    if (remMonths === 0) {
      return `About ${years} year${years > 1 ? 's' : ''}`;
    }
    return `About ${years} year${years > 1 ? 's' : ''} and ${remMonths} month${remMonths > 1 ? 's' : ''}`;
  } else {
    return `About ${remMonths} month${remMonths > 1 ? 's' : ''}`;
  }
}

export function parseCategoryMonthKey(key: string): { program: string; ym: string } | null {
  const match = key.match(/^([a-z0-9-]+)-(\d{4})\/(\d{2})$/i);
  if (!match) return null;
  const [, program, yyyy, mm] = match;
  return { program, ym: `${yyyy}/${mm}` };
}

export function parsePeopleAhead(s: string): { value?: number; bound: CategoryMonthRow['bound'] } {
  const str = s.toLowerCase();
  
  let match = str.match(/^less\s+than\s+([\d,]+)/);
  if (match) return { value: parseInt(match[1].replace(/,/g, ''), 10) - 1, bound: "lt" };
  
  match = str.match(/^about\s+([\d,]+)/);
  if (match) return { value: parseInt(match[1].replace(/,/g, ''), 10), bound: "approx" };
  
  match = str.match(/^([\d,]+)\+?/);
  if (match) return { value: parseInt(match[1].replace(/,/g, ''), 10), bound: "exact" };

  return { value: undefined, bound: "unknown" };
}

export function parseWaitTimeStatus(s: string): "not_enough_data" | "need_more_time" | "unknown" {
    const lowerS = s.toLowerCase();
    if (lowerS.includes("not enough data")) return "not_enough_data";
    if (lowerS.includes("need more time")) return "need_more_time";
    return "unknown";
}


export function ymToDate(ym: string): Date {
  const [year, month] = ym.split('/');
  return new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1));
}

export function sortYmAsc(a: string, b: string): number {
  return ymToDate(a).getTime() - ymToDate(b).getTime();
}


export function simpleLinearRegression(x: number[], y: number[]): { slope: number; r2: number } {
  const n = x.length;
  if (n < 2) return { slope: 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
  }

  const denominator = (n * sumX2 - sumX * sumX);
  if (denominator === 0) return { slope: 0, r2: 0 };
  
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  let ssTotal = 0;
  let ssResidual = 0;
  for (let i = 0; i < n; i++) {
    const predictedY = slope * x[i] + intercept;
    ssTotal += Math.pow(y[i] - yMean, 2);
    ssResidual += Math.pow(y[i] - predictedY, 2);
  }
  
  const r2 = ssTotal === 0 ? 1 : 1 - (ssResidual / ssTotal);

  return { slope, r2 };
}