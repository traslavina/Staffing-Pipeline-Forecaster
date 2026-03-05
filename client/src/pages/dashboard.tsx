import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store, Users, UserPlus, TrendingDown, Target, BarChart3, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import type { Store as StoreType, HiringPipelineEntry, AttritionRecord } from "@shared/schema";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalStores: number;
    plannedStores: number;
    openStores: number;
    totalEmployees: number;
    openPositions: number;
    benchReady: number;
    pipelineCandidates: number;
    attritionRate: number;
  }>({ queryKey: ["/api/dashboard"] });

  const { data: stores } = useQuery<StoreType[]>({ queryKey: ["/api/stores"] });
  const { data: pipeline } = useQuery<HiringPipelineEntry[]>({ queryKey: ["/api/pipeline"] });
  const { data: attrition } = useQuery<AttritionRecord[]>({ queryKey: ["/api/attrition"] });

  const storeStatusData = stores ? [
    { name: "Open", value: stores.filter(s => s.status === "open").length, color: "hsl(var(--chart-2))" },
    { name: "Under Construction", value: stores.filter(s => s.status === "under_construction").length, color: "hsl(var(--chart-4))" },
    { name: "Planned", value: stores.filter(s => s.status === "planned").length, color: "hsl(var(--chart-1))" },
  ] : [];

  const pipelineStages = pipeline ? [
    { stage: "Applied", count: pipeline.filter(p => p.stage === "applied").length },
    { stage: "Screening", count: pipeline.filter(p => p.stage === "screening").length },
    { stage: "Interview", count: pipeline.filter(p => p.stage === "interview").length },
    { stage: "Offer", count: pipeline.filter(p => p.stage === "offer").length },
    { stage: "Accepted", count: pipeline.filter(p => p.stage === "accepted").length },
  ] : [];

  const attritionReasons = attrition ? (() => {
    const reasons: Record<string, number> = {};
    attrition.forEach(a => {
      const label = a.reason.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      reasons[label] = (reasons[label] || 0) + 1;
    });
    return Object.entries(reasons).map(([name, value]) => ({ name, value }));
  })() : [];

  const statCards = [
    { title: "Total Stores", value: stats?.totalStores, icon: Store, subtitle: `${stats?.openStores} open, ${stats?.plannedStores} planned`, trend: "up" },
    { title: "Active Employees", value: stats?.totalEmployees, icon: Users, subtitle: `${stats?.openPositions} open positions`, trend: "up" },
    { title: "Pipeline Candidates", value: stats?.pipelineCandidates, icon: UserPlus, subtitle: "In hiring process", trend: "up" },
    { title: "Bench Ready", value: stats?.benchReady, icon: Target, subtitle: "Ready for promotion", trend: "up" },
    { title: "Attrition Rate", value: stats?.attritionRate ? `${stats.attritionRate}%` : "0%", icon: TrendingDown, subtitle: "Annual turnover", trend: "down" },
    { title: "Open Positions", value: stats?.openPositions, icon: BarChart3, subtitle: "Across all stores", trend: "neutral" },
  ];

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">Workforce Dashboard</h1>
        <p className="text-muted-foreground mt-1" data-testid="text-dashboard-subtitle">
          Overview of your 35-store expansion staffing plan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid={`text-stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {card.value}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {card.trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                    {card.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Store Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {storeStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={storeStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {storeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[280px]" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiring Pipeline Stages</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineStages.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pipelineStages}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[280px]" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attrition Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            {attritionReasons.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attritionReasons} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[280px]" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Pipeline Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {pipeline ? (
              <div className="space-y-3">
                {pipeline.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-2" data-testid={`pipeline-entry-${entry.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.candidateName}</p>
                      <p className="text-xs text-muted-foreground">Applied {entry.applicationDate}</p>
                    </div>
                    <Badge variant={
                      entry.stage === "accepted" ? "default" :
                      entry.stage === "offer" ? "secondary" : "outline"
                    }>
                      {entry.stage.charAt(0).toUpperCase() + entry.stage.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10" />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
