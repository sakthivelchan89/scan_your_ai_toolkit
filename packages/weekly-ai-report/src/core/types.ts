export interface WeeklyReport {
  period: string;
  startDate: string;
  endDate: string;
  totalInteractions: number;
  totalMinutes: number;
  toolBreakdown: { tool: string; count: number; minutes: number; percentage: number }[];
  taskBreakdown: { task: string; count: number; minutes: number; percentage: number }[];
  mostProductiveDay: { day: string; count: number } | null;
  previousWeekDelta: number | null;
  tip: string;
}
