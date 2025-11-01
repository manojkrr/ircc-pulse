import {z} from 'zod';
import {ProgramRow, CategoryMonthRow, WaitTimeStatusRow, PeopleAheadTrend} from '../types';
import {NAME_MAPPING, TREND_THRESHOLDS} from '../constants';
import * as p from './parsingUtils';

// Explicit z.record ensures values are strings, not unknown
const rawDataSchema = z.object({
    'default-update': z.object({
        flpt_lastupdated: z.string().optional(),
        flpt_interval: z.string().optional(),
    }).optional(),
    'total-people': z.record(z.string(), z.string()),
    'current-flpt': z.record(z.string(), z.string()),
    'people-ahead': z.record(z.string(), z.string()).optional(),
    'wait-times': z.record(z.string(), z.string()).optional(),
});

type RawData = z.infer<typeof rawDataSchema>;

export interface ProcessedData {
    updated: RawData['default-update'];
    summary: ProgramRow[];
    totals: ProgramRow[];
    categoryMonth: {
        rows: CategoryMonthRow[];
        series: Record<string, { ym: string; value?: number; bound: CategoryMonthRow['bound'] }[]>;
        months: string[];
    };
    waitTimeStatuses: WaitTimeStatusRow[];
    peopleAheadTrends: PeopleAheadTrend[];
}

function getCategoryMonthBreakdown(rawData: RawData): ProcessedData['categoryMonth'] {
    const peopleAhead = rawData['people-ahead'];
    if (!peopleAhead) return {rows: [], series: {}, months: []};

    const rows: CategoryMonthRow[] = Object.entries(peopleAhead)
        .map(([key, rawValue]) => {
            const parsedKey = p.parseCategoryMonthKey(key);
            if (!parsedKey) return null;

            const rawValueString = String(rawValue);
            const {value, bound} = p.parsePeopleAhead(rawValueString);

            return {...parsedKey, value, bound, raw: rawValueString};
        })
        // @ts-ignore
        .filter((r): r is CategoryMonthRow => r !== null);

    const series: ProcessedData['categoryMonth']['series'] = {};
    const monthSet = new Set<string>();

    rows.forEach((row) => {
        series[row.program] = series[row.program] || [];
        series[row.program].push({ym: row.ym, value: row.value, bound: row.bound});
        monthSet.add(row.ym);
    });

    Object.values(series).forEach((s) => s.sort((a, b) => p.sortYmAsc(a.ym, b.ym)));
    const months = Array.from(monthSet).sort(p.sortYmAsc);

    return {rows, series, months};
}

function getPeopleAheadTrends(
    categoryMonthData: ProcessedData['categoryMonth'],
    window: number = 6
): PeopleAheadTrend[] {
    const trends: PeopleAheadTrend[] = [];

    for (const program in categoryMonthData.series) {
        const validPoints = categoryMonthData.series[program].filter(
            (d): d is { ym: string; value: number; bound: CategoryMonthRow['bound'] } => typeof d.value === 'number'
        );

        if (validPoints.length < 2) continue;

        const recentPoints = validPoints.slice(-window);
        if (recentPoints.length < 2) continue;

        const latest = recentPoints.at(-1)!;
        const prev = recentPoints.at(-2)!;
        const first = recentPoints[0];

        const momPct = prev.value > 0 ? ((latest.value - prev.value) / prev.value) * 100 : undefined;
        const months = recentPoints.length - 1;
        const cmgrPct = first.value > 0 && months > 0
            ? (Math.pow(latest.value / first.value, 1 / months) - 1) * 100
            : undefined;

        const x = recentPoints.map((_, i) => i);
        const y = recentPoints.map((p) => p.value);
        const {slope, r2} = p.simpleLinearRegression(x, y);

        let direction: PeopleAheadTrend['direction'] = 'flat';
        if ((momPct ?? 0) >= TREND_THRESHOLDS.MOM_UP || (cmgrPct ?? 0) >= TREND_THRESHOLDS.CMGR_UP) direction = 'up';
        else if ((momPct ?? 0) <= TREND_THRESHOLDS.MOM_DOWN || (cmgrPct ?? 0) <= TREND_THRESHOLDS.CMGR_DOWN) direction = 'down';

        trends.push({
            program,
            programFull: NAME_MAPPING[program] || program,
            window,
            latestYm: latest.ym,
            latestValue: latest.value,
            prevYm: prev.ym,
            prevValue: prev.value,
            momPct,
            cmgrPct,
            slopePerMonth: slope,
            r2,
            direction,
        });
    }

    return trends;
}

export async function processData(rawData: unknown): Promise<ProcessedData> {
    const validatedData = rawDataSchema.parse(rawData);

    const programCodes = Array.from(
        new Set([...Object.keys(validatedData['total-people']), ...Object.keys(validatedData['current-flpt'])])
    );

    const totals: ProgramRow[] = programCodes
        .map((code) => {
            const totalPeopleText = validatedData['total-people'][code];
            const currentFlpt = validatedData['current-flpt'][code];
            const waiting = p.extractWaitingInt(totalPeopleText);

            let incompleteReason: ProgramRow['incompleteReason'];
            if (!totalPeopleText && !currentFlpt) incompleteReason = 'both';
            else if (!totalPeopleText) incompleteReason = 'missing-total-people';
            else if (!currentFlpt) incompleteReason = 'missing-current-flpt';

            return {
                program: code,
                programFull: NAME_MAPPING[code] || code,
                totalPeopleText,
                currentFlpt,
                waiting,
                waitingFormatted: waiting ? p.formatInt(waiting) : undefined,
                flptMonths: p.monthsFromString(currentFlpt),
                incompleteReason,
            };
        })
        .sort((a, b) => (b.waiting ?? 0) - (a.waiting ?? 0));

    const summary = totals.filter((row) => !row.incompleteReason);
    const categoryMonth = getCategoryMonthBreakdown(validatedData);

    const waitTimeStatuses: WaitTimeStatusRow[] = Object.entries(validatedData['wait-times'] ?? {})
        .map(([key, raw]) => {
            const parsedKey = p.parseCategoryMonthKey(key);
            if (!parsedKey) return null;
            const rawString = String(raw);
            return {...parsedKey, raw: rawString, status: p.parseWaitTimeStatus(rawString)};
        })
        .filter((r): r is WaitTimeStatusRow => r !== null);

    const peopleAheadTrends = getPeopleAheadTrends(categoryMonth);

    return {
        updated: validatedData['default-update'],
        summary,
        totals,
        categoryMonth,
        waitTimeStatuses,
        peopleAheadTrends,
    };
}
