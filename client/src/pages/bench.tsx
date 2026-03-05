import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Star, Target, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Employee, Store, Position } from "@shared/schema";

export default function BenchPage() {
  const [search, setSearch] = useState("");
  const [filterBench, setFilterBench] = useState("all");
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });
  const { data: stores } = useQuery<Store[]>({ queryKey: ["/api/stores"] });
  const { data: positions } = useQuery<Position[]>({ queryKey: ["/api/positions"] });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/employees/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Bench status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update bench status", description: error.message, variant: "destructive" });
    },
  });

  const storeName = (id: number | null) => stores?.find(s => s.id === id)?.name || "Unassigned";
  const posTitle = (id: number | null) => positions?.find(p => p.id === id)?.title || "Unknown";

  const activeEmployees = employees?.filter(e => e.status === "active") || [];
  const filtered = activeEmployees.filter(e => {
    const matchSearch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchBench = filterBench === "all" || e.benchStatus === filterBench;
    return matchSearch && matchBench;
  });

  const benchStats = {
    ready: activeEmployees.filter(e => e.benchStatus === "ready").length,
    developing: activeEmployees.filter(e => e.benchStatus === "developing").length,
    notReady: activeEmployees.filter(e => e.benchStatus === "not_ready").length,
  };

  const benchPieData = [
    { name: "Ready", value: benchStats.ready, color: "hsl(var(--chart-2))" },
    { name: "Developing", value: benchStats.developing, color: "hsl(var(--chart-4))" },
    { name: "Not Ready", value: benchStats.notReady, color: "hsl(var(--chart-1))" },
  ];

  const highPerformers = activeEmployees
    .filter(e => (e.performanceRating || 0) >= 4 && e.benchStatus !== "ready")
    .sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0));

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-bench-title">Internal Bench</h1>
        <p className="text-muted-foreground mt-1">
          Track internal talent readiness for new store leadership roles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-bench-total">{activeEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bench Ready</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-bench-ready">{benchStats.ready}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Developing</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-bench-developing">{benchStats.developing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bench Coverage</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-bench-coverage">
              {activeEmployees.length > 0 ? Math.round((benchStats.ready / activeEmployees.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bench Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {activeEmployees.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={benchPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {benchPieData.map((entry, index) => (
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
            <CardTitle className="text-base">High Potential - Not Yet Bench Ready</CardTitle>
          </CardHeader>
          <CardContent>
            {highPerformers.length > 0 ? (
              <div className="space-y-3">
                {highPerformers.slice(0, 8).map(emp => (
                  <div key={emp.id} className="flex items-center justify-between gap-2" data-testid={`high-potential-${emp.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-muted-foreground">{posTitle(emp.positionId)} - {storeName(emp.storeId)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`h-3 w-3 ${i <= (emp.performanceRating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMutation.mutate({ id: emp.id, data: { benchStatus: "ready", readyForPromotion: true } })}
                        data-testid={`button-promote-${emp.id}`}
                      >
                        Promote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">All high performers are already bench-ready</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-bench"
          />
        </div>
        <Select value={filterBench} onValueChange={setFilterBench}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-bench">
            <SelectValue placeholder="Bench Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="developing">Developing</SelectItem>
            <SelectItem value="not_ready">Not Ready</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Bench Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map(emp => (
                  <TableRow key={emp.id} data-testid={`row-bench-${emp.id}`}>
                    <TableCell>
                      <p className="font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                    </TableCell>
                    <TableCell className="text-sm">{posTitle(emp.positionId)}</TableCell>
                    <TableCell className="text-sm">{storeName(emp.storeId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`h-3 w-3 ${i <= (emp.performanceRating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        emp.benchStatus === "ready" ? "default" :
                        emp.benchStatus === "developing" ? "secondary" : "outline"
                      }>
                        {emp.benchStatus === "ready" ? "Ready" :
                         emp.benchStatus === "developing" ? "Developing" : "Not Ready"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={emp.benchStatus || "not_ready"}
                        onValueChange={(val) => updateMutation.mutate({
                          id: emp.id,
                          data: { benchStatus: val, readyForPromotion: val === "ready" }
                        })}
                      >
                        <SelectTrigger className="w-[130px]" data-testid={`select-bench-status-${emp.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_ready">Not Ready</SelectItem>
                          <SelectItem value="developing">Developing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
