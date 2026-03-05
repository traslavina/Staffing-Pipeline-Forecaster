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
import { Plus, Search, ArrowRight, User } from "lucide-react";
import type { HiringPipelineEntry, Store, Position } from "@shared/schema";

const stageOrder = ["applied", "screening", "interview", "offer", "accepted"];
const stageColors: Record<string, string> = {
  applied: "bg-muted text-muted-foreground",
  screening: "bg-chart-4/15 text-foreground",
  interview: "bg-chart-1/15 text-foreground",
  offer: "bg-chart-2/15 text-foreground",
  accepted: "bg-chart-2/20 text-foreground",
};

export default function PipelinePage() {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: pipeline, isLoading } = useQuery<HiringPipelineEntry[]>({ queryKey: ["/api/pipeline"] });
  const { data: stores } = useQuery<Store[]>({ queryKey: ["/api/stores"] });
  const { data: positions } = useQuery<Position[]>({ queryKey: ["/api/positions"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pipeline", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDialogOpen(false);
      toast({ title: "Candidate added to pipeline" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add candidate", description: error.message, variant: "destructive" });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      const res = await apiRequest("PATCH", `/api/pipeline/${id}`, { stage });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline"] });
      toast({ title: "Stage updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update stage", description: error.message, variant: "destructive" });
    },
  });

  const storeName = (id: number) => stores?.find(s => s.id === id)?.name || "Unknown";
  const posTitle = (id: number) => positions?.find(p => p.id === id)?.title || "Unknown";

  const filtered = pipeline?.filter(p => {
    const matchSearch = p.candidateName.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === "all" || p.stage === filterStage;
    return matchSearch && matchStage;
  }) || [];

  const groupedByStage = stageOrder.map(stage => ({
    stage,
    label: stage.charAt(0).toUpperCase() + stage.slice(1),
    entries: filtered.filter(p => p.stage === stage),
  }));

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      candidateName: formData.get("candidateName"),
      candidateEmail: formData.get("candidateEmail"),
      positionId: Number(formData.get("positionId")),
      targetStoreId: Number(formData.get("targetStoreId")),
      stage: "applied",
      source: formData.get("source"),
      applicationDate: new Date().toISOString().split("T")[0],
      expectedStartDate: formData.get("expectedStartDate"),
    });
  };

  const advanceStage = (entry: HiringPipelineEntry) => {
    const currentIdx = stageOrder.indexOf(entry.stage);
    if (currentIdx < stageOrder.length - 1) {
      updateStageMutation.mutate({ id: entry.id, stage: stageOrder[currentIdx + 1] });
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-pipeline-title">Hiring Pipeline</h1>
          <p className="text-muted-foreground mt-1">{pipeline?.length || 0} candidates in the pipeline</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-candidate"><Plus className="w-4 h-4 mr-2" /> Add Candidate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Candidate Name</Label>
                  <Input name="candidateName" required data-testid="input-candidate-name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="candidateEmail" type="email" data-testid="input-candidate-email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <select name="positionId" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-candidate-position">
                    {positions?.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Target Store</Label>
                  <select name="targetStoreId" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-candidate-store">
                    {stores?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <select name="source" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" data-testid="select-candidate-source">
                    <option value="external">External</option>
                    <option value="internal_referral">Internal Referral</option>
                    <option value="job_board">Job Board</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Expected Start Date</Label>
                  <Input name="expectedStartDate" type="date" data-testid="input-candidate-start-date" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-candidate">
                {createMutation.isPending ? "Adding..." : "Add to Pipeline"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-pipeline"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-stage">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stageOrder.map(s => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-40" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {groupedByStage.map(group => (
            <div key={group.stage} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{group.label}</h3>
                <Badge variant="outline" className="text-xs">{group.entries.length}</Badge>
              </div>
              <div className="space-y-2">
                {group.entries.map(entry => (
                  <Card key={entry.id} className="hover-elevate" data-testid={`card-pipeline-${entry.id}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium truncate">{entry.candidateName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{posTitle(entry.positionId)}</p>
                      <p className="text-xs text-muted-foreground mb-2">{storeName(entry.targetStoreId)}</p>
                      <div className="flex items-center justify-between gap-1">
                        <Badge variant="outline" className="text-xs">{entry.source.replace("_", " ")}</Badge>
                        {group.stage !== "accepted" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => advanceStage(entry)}
                            disabled={updateStageMutation.isPending}
                            data-testid={`button-advance-${entry.id}`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {group.entries.length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-md">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
