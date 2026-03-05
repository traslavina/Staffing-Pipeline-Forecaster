import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Search, Star } from "lucide-react";
import type { Employee, Store, Position } from "@shared/schema";

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [filterStore, setFilterStore] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });
  const { data: stores } = useQuery<Store[]>({ queryKey: ["/api/stores"] });
  const { data: positions } = useQuery<Position[]>({ queryKey: ["/api/positions"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/employees", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDialogOpen(false);
      toast({ title: "Employee added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add employee", description: error.message, variant: "destructive" });
    },
  });

  const storeName = (id: number | null) => stores?.find(s => s.id === id)?.name || "Unassigned";
  const positionTitle = (id: number | null) => positions?.find(p => p.id === id)?.title || "Unknown";

  const filtered = employees?.filter(e => {
    const matchSearch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchStore = filterStore === "all" || e.storeId === Number(filterStore);
    return matchSearch && matchStore;
  }) || [];

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      storeId: Number(formData.get("storeId")),
      positionId: Number(formData.get("positionId")),
      hireDate: formData.get("hireDate"),
      status: "active",
      readyForPromotion: false,
      benchStatus: "not_ready",
      performanceRating: 3,
    });
  };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-employees-title">Employees</h1>
          <p className="text-muted-foreground mt-1">{employees?.length || 0} total employees across all stores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-employee"><Plus className="w-4 h-4 mr-2" /> Add Employee</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input name="firstName" required data-testid="input-emp-first-name" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input name="lastName" required data-testid="input-emp-last-name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" required data-testid="input-emp-email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store</Label>
                  <select name="storeId" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-emp-store">
                    {stores?.filter(s => s.status === "open").map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <select name="positionId" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-emp-position">
                    {positions?.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hire Date</Label>
                <Input name="hireDate" type="date" required data-testid="input-emp-hire-date" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-employee">
                {createMutation.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-employees"
          />
        </div>
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="w-[200px]" data-testid="select-filter-store">
            <SelectValue placeholder="Filter by store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores?.filter(s => s.status === "open").map(s => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
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
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Bench Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map(emp => (
                  <TableRow key={emp.id} data-testid={`row-employee-${emp.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{positionTitle(emp.positionId)}</TableCell>
                    <TableCell className="text-sm">{storeName(emp.storeId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{emp.hireDate}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground" data-testid="text-no-employees">
          No employees match your search criteria
        </div>
      )}
    </div>
  );
}
