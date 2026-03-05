import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Users, Target, Clock, TrendingUp, Building2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line
} from "recharts";

interface ForecastData {
  summary: {
    totalNewStores: number;
    totalNewHiresNeeded: number;
    benchAvailable: number;
    annualAttritionRate: number;
    averageTrainingWeeks: number;
  };
  timeline: Array<{
    month: string;
    newStores: string[];
    newStoreCount: number;
    hiresNeeded: number;
    fromBench: number;
    externalHires: number;
    trainingWeeksNeeded: number;
    projectedAttritionBackfills: number;
    totalHiresIncludingBackfills: number;
    cumulativeStores: number;
    cumulativeNewHires: number;
  }>;
}

export default function ForecastPage() {
  const { data: forecast, isLoading } = useQuery<ForecastData>({ queryKey: ["/api/forecast"] });

  const summaryCards = forecast ? [
    { title: "New Stores Planned", value: forecast.summary.totalNewStores, icon: Building2, color: "text-blue-500" },
    { title: "Total Hires Needed", value: forecast.summary.totalNewHiresNeeded, icon: Users, color: "text-emerald-500" },
    { title: "Bench Available", value: forecast.summary.benchAvailable, icon: Target, color: "text-amber-500" },
    { title: "Avg Training Weeks", value: forecast.summary.averageTrainingWeeks, icon: Clock, color: "text-purple-500" },
    { title: "Attrition Rate", value: `${forecast.summary.annualAttritionRate}%`, icon: TrendingUp, color: "text-red-500" },
    { title: "External Gap", value: forecast.summary.totalNewHiresNeeded - forecast.summary.benchAvailable, icon: BarChart3, color: "text-orange-500" },
  ] : [];

  const cumulativeData = forecast?.timeline.map(t => ({
    month: t.month,
    stores: t.cumulativeStores,
    hires: t.cumulativeNewHires,
  })) || [];

  const hiringBreakdown = forecast?.timeline.map(t => ({
    month: t.month,
    bench: t.fromBench,
    external: t.externalHires,
    backfills: t.projectedAttritionBackfills,
  })) || [];

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-forecast-title">Staffing Forecast</h1>
        <p className="text-muted-foreground mt-1">
          Projected headcount needs for the 35-store expansion plan
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-16" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {summaryCards.map((card, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                  <span className="text-xs text-muted-foreground">{card.title}</span>
                </div>
                <div className="text-xl font-bold" data-testid={`text-forecast-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cumulative Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {cumulativeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="stores" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Total Stores" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[300px]" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiring Breakdown by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {hiringBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={hiringBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bench" stackId="a" fill="hsl(var(--chart-2))" name="From Bench" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="external" stackId="a" fill="hsl(var(--chart-1))" name="External Hires" radius={[0, 0, 0, 0]} />
                  <Line type="monotone" dataKey="backfills" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Attrition Backfills" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[300px]" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Staffing Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Month</TableHead>
                    <TableHead>New Stores</TableHead>
                    <TableHead className="text-right">Hires Needed</TableHead>
                    <TableHead className="text-right">From Bench</TableHead>
                    <TableHead className="text-right">External</TableHead>
                    <TableHead className="text-right">Training Weeks</TableHead>
                    <TableHead className="text-right">Attrition Backfills</TableHead>
                    <TableHead className="text-right">Total w/ Backfills</TableHead>
                    <TableHead className="text-right">Cumulative Stores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast?.timeline.map((row, idx) => (
                    <TableRow key={idx} data-testid={`row-forecast-${idx}`}>
                      <TableCell className="font-medium text-sm">{row.month}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.newStores.map((name, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{row.hiresNeeded}</TableCell>
                      <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{row.fromBench}</TableCell>
                      <TableCell className="text-right">{row.externalHires}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{row.trainingWeeksNeeded}</TableCell>
                      <TableCell className="text-right text-amber-600 dark:text-amber-400">{row.projectedAttritionBackfills}</TableCell>
                      <TableCell className="text-right font-semibold">{row.totalHiresIncludingBackfills}</TableCell>
                      <TableCell className="text-right">{row.cumulativeStores}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
