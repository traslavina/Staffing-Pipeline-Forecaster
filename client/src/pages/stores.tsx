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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Search, MapPin, Users, Calendar } from "lucide-react";
import type { Store } from "@shared/schema";

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  planned: "outline",
  under_construction: "secondary",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  planned: "Planned",
  under_construction: "Under Construction",
};

export default function StoresPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: stores, isLoading } = useQuery<Store[]>({ queryKey: ["/api/stores"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/stores", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDialogOpen(false);
      toast({ title: "Store created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create store", description: error.message, variant: "destructive" });
    },
  });

  const filtered = stores?.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  }) || [];

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get("name"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      region: formData.get("region"),
      status: formData.get("status"),
      openDate: formData.get("openDate"),
      storeType: formData.get("storeType"),
      targetHeadcount: Number(formData.get("targetHeadcount")),
      currentHeadcount: 0,
    });
  };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-stores-title">Stores</h1>
          <p className="text-muted-foreground mt-1">Manage existing and planned store locations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-store"><Plus className="w-4 h-4 mr-2" /> Add Store</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input name="name" required data-testid="input-store-name" />
                </div>
                <div className="space-y-2">
                  <Label>Store Type</Label>
                  <select name="storeType" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-store-type">
                    <option value="standard">Standard</option>
                    <option value="flagship">Flagship</option>
                    <option value="outlet">Outlet</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input name="address" required data-testid="input-store-address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input name="city" required data-testid="input-store-city" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input name="state" required data-testid="input-store-state" />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input name="region" required data-testid="input-store-region" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select name="status" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-store-status">
                    <option value="planned">Planned</option>
                    <option value="under_construction">Under Construction</option>
                    <option value="open">Open</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Open Date</Label>
                  <Input name="openDate" type="date" data-testid="input-store-open-date" />
                </div>
                <div className="space-y-2">
                  <Label>Target Headcount</Label>
                  <Input name="targetHeadcount" type="number" defaultValue="25" data-testid="input-store-headcount" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-store">
                {createMutation.isPending ? "Creating..." : "Create Store"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-stores"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="under_construction">Under Construction</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(store => (
            <Card key={store.id} className="hover-elevate" data-testid={`card-store-${store.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm" data-testid={`text-store-name-${store.id}`}>{store.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {store.city}, {store.state}
                    </div>
                  </div>
                  <Badge variant={statusColors[store.status] || "outline"}>
                    {statusLabels[store.status] || store.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{store.currentHeadcount}</span>
                      <span className="text-muted-foreground">/{store.targetHeadcount}</span>
                    </span>
                  </div>
                  {store.openDate && (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{store.openDate}</span>
                    </div>
                  )}
                </div>
                {store.status !== "open" && store.targetHeadcount > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Staffing Progress</span>
                      <span className="font-medium">{Math.round((store.currentHeadcount / store.targetHeadcount) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(store.currentHeadcount / store.targetHeadcount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{store.storeType}</Badge>
                  <Badge variant="outline" className="text-xs">{store.region}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground" data-testid="text-no-stores">
          No stores match your search criteria
        </div>
      )}
    </div>
  );
}
