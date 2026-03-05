import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import type { AttritionRecord, Store, Position } from "@shared/schema";

export default function AttritionPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: attrition, isLoading } = useQuery<AttritionRecord[]>({ queryKey: ["/api/attrition"] });
  const { data: stores } = useQuery<Store[]>({ queryKey: ["/api/stores"] });
  const { data: positions } = useQuery<Position[]>({ queryKey: ["/api/positions"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/attrition", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attrition"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDialogOpen(false);
      toast({ title: "Attrition record added" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to record departure", description: error.message, variant: "destructive" });
    },
  });

  const storeName = (id: number) => stores?.find(s => s.id === id)?.name || "Unknown";
  const posTitle = (id: number) => positions?.find(p => p.id === id)?.title || "Unknown";

  const reasonData = attrition ? (() => {
    const reasons: Record<string, number> = {};
    attrition.forEach(a => {
      const label = a.reason.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      reasons[label] = (reasons[label] || 0) + 1;
    });
    return Object.entries(reasons).map(([name, count]) => ({ name, count }));
  })() : [];

  const monthlyTrend = attrition ? (() => {
    const months: Record<string, number> = {};
    attrition.forEach(a => {
      const month = a.departureDate.substring(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).sort().map(([month, count]) => ({ month, count }));
  })() : [];

  const openBackfills = attrition?.filter(a => a.backfillStatus === "open").length || 0;
  const filledBackfills = attrition?.filter(a => a.backfillStatus === "filled").length || 0;

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      storeId: Number(formData.get("storeId")),
      positionId: Number(formData.get("positionId")),
      employeeName: formData.get("employeeName"),
      departureDate: formData.get("departureDate"),
      reason: formData.get("reason"),
      backfillStatus: "open",
    });
  };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-attrition-title">Attrition Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor turnover and manage backfills</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-attrition"><Plus className="w-4 h-4 mr-2" /> Record Departure</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Employee Departure</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Employee Name</Label>
                <Input name="employeeName" required data-testid="input-attrition-name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store</Label>
                  <select name="storeId" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-attrition-store">
                    {stores?.filter(s => s.status === "open").map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <select name="positionId" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-attrition-position">
                    {positions?.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Input name="departureDate" type="date" required data-testid="input-attrition-date" />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <select name="reason" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-attrition-reason">
                    <option value="voluntary_resignation">Voluntary Resignation</option>
                    <option value="relocation">Relocation</option>
                    <option value="career_change">Career Change</option>
                    <option value="retirement">Retirement</option>
                    <option value="termination">Termination</option>
                    <option value="better_opportunity">Better Opportunity</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-attrition">
                {createMutation.isPending ? "Recording..." : "Record Departure"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Departures</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-departures">{attrition?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Backfills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-open-backfills">{openBackfills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filled Backfills</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-filled-backfills">{filledBackfills}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Departure Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            {reasonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={reasonData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[250px]" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[250px]" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Departure Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Departure Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Backfill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attrition?.map(record => (
                  <TableRow key={record.id} data-testid={`row-attrition-${record.id}`}>
                    <TableCell className="font-medium text-sm">{record.employeeName}</TableCell>
                    <TableCell className="text-sm">{storeName(record.storeId)}</TableCell>
                    <TableCell className="text-sm">{posTitle(record.positionId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{record.departureDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.reason.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.backfillStatus === "filled" ? "default" : "secondary"}>
                        {record.backfillStatus === "filled" ? "Filled" : "Open"}
                      </Badge>
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
