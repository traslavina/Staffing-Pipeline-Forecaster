import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Circle, Clock, Users, GraduationCap, Building2, AlertTriangle,
  CalendarDays, ClipboardList, UserPlus, Target, ChevronRight, Briefcase, Download,
} from "lucide-react";
import type { Store, Position, Employee, HiringPipelineEntry } from "@shared/schema";

interface PlaybookPhase {
  id: string;
  name: string;
  description: string;
  weeksBeforeOpen: number;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  status: "completed" | "in_progress" | "upcoming" | "overdue";
  tasks: PlaybookTask[];
}

interface PlaybookTask {
  id: string;
  label: string;
  category: "hiring" | "training" | "operations" | "staffing";
  status: "done" | "in_progress" | "pending" | "at_risk";
  detail: string;
}

interface StorePlaybook {
  store: Store;
  daysUntilOpen: number;
  weeksUntilOpen: number;
  overallProgress: number;
  staffingProgress: number;
  hiringProgress: number;
  trainingReadiness: number;
  leadershipFilled: number;
  leadershipNeeded: number;
  totalPositionsNeeded: number;
  totalPositionsFilled: number;
  pipelineCount: number;
  benchCandidates: number;
  phases: PlaybookPhase[];
  positionBreakdown: Array<{
    title: string;
    needed: number;
    filled: number;
    inPipeline: number;
    gap: number;
    trainingWeeks: number;
    isLeadership: boolean;
  }>;
}

function buildPlaybook(
  store: Store,
  positions: Position[],
  employees: Employee[],
  pipeline: HiringPipelineEntry[],
  allEmployees: Employee[],
): StorePlaybook {
  const today = new Date();
  const openDate = store.openDate ? new Date(store.openDate) : new Date(today.getTime() + 365 * 86400000);
  const daysUntilOpen = Math.ceil((openDate.getTime() - today.getTime()) / 86400000);
  const weeksUntilOpen = Math.ceil(daysUntilOpen / 7);

  const storeEmployees = employees.filter(e => e.storeId === store.id && e.status === "active");
  const storePipeline = pipeline.filter(p => p.targetStoreId === store.id);
  const benchCandidates = allEmployees.filter(e => e.benchStatus === "ready" && e.status === "active");

  const positionBreakdown = positions.map(pos => {
    const filled = storeEmployees.filter(e => e.positionId === pos.id).length;
    const inPipeline = storePipeline.filter(p => p.positionId === pos.id && p.stage !== "rejected").length;
    const needed = pos.headcountPerStore;
    return {
      title: pos.title,
      needed,
      filled,
      inPipeline,
      gap: Math.max(0, needed - filled - inPipeline),
      trainingWeeks: pos.trainingWeeks,
      isLeadership: pos.isLeadership,
    };
  });

  const totalNeeded = positionBreakdown.reduce((s, p) => s + p.needed, 0);
  const totalFilled = positionBreakdown.reduce((s, p) => s + p.filled, 0);
  const leadershipNeeded = positionBreakdown.filter(p => p.isLeadership).reduce((s, p) => s + p.needed, 0);
  const leadershipFilled = positionBreakdown.filter(p => p.isLeadership).reduce((s, p) => s + p.filled, 0);
  const activePipeline = storePipeline.filter(p => p.stage !== "rejected");
  const pipelineCount = activePipeline.length;

  const staffingProgress = totalNeeded > 0 ? Math.round((totalFilled / totalNeeded) * 100) : 0;
  const hiringProgress = totalNeeded > 0 ? Math.round(((totalFilled + pipelineCount) / totalNeeded) * 100) : 0;

  const maxTraining = positions.reduce((max, p) => Math.max(max, p.trainingWeeks), 0);
  const trainingReadiness = weeksUntilOpen > 0
    ? Math.min(100, Math.round(((weeksUntilOpen) / (maxTraining + 4)) * 100))
    : 0;

  function fmt(d: Date) {
    return d.toISOString().split("T")[0];
  }

  function getPhaseStatus(startDate: Date, endDate: Date): "completed" | "in_progress" | "upcoming" | "overdue" {
    if (today > endDate) return "completed";
    if (today >= startDate && today <= endDate) return "in_progress";
    if (today < startDate) return "upcoming";
    return "overdue";
  }

  const phases: PlaybookPhase[] = [];

  const phase1Start = new Date(openDate.getTime() - 24 * 7 * 86400000);
  const phase1End = new Date(openDate.getTime() - 16 * 7 * 86400000);
  phases.push({
    id: "site-planning",
    name: "Site Planning & Leadership Hiring",
    description: "Secure the location, finalize layout, and hire the store manager and assistant managers.",
    weeksBeforeOpen: 24,
    durationWeeks: 8,
    startDate: fmt(phase1Start),
    endDate: fmt(phase1End),
    status: getPhaseStatus(phase1Start, phase1End),
    tasks: [
      {
        id: "t1",
        label: "Hire Store Manager",
        category: "hiring",
        status: (positionBreakdown.find(p => p.title === "Store Manager")?.filled ?? 0) >= 1 ? "done" : (weeksUntilOpen < 16 ? "at_risk" : "pending"),
        detail: (positionBreakdown.find(p => p.title === "Store Manager")?.filled ?? 0) >= 1 ? "Store Manager in place" : "Store Manager position open",
      },
      {
        id: "t2",
        label: "Hire Assistant Managers",
        category: "hiring",
        status: positionBreakdown.find(p => p.title === "Assistant Store Manager")?.filled === (positionBreakdown.find(p => p.title === "Assistant Store Manager")?.needed ?? 0)
          ? "done" : (weeksUntilOpen < 14 ? "at_risk" : "pending"),
        detail: `${positionBreakdown.find(p => p.title === "Assistant Store Manager")?.filled ?? 0}/${positionBreakdown.find(p => p.title === "Assistant Store Manager")?.needed ?? 2} filled`,
      },
      {
        id: "t3",
        label: "Finalize store layout & permits",
        category: "operations",
        status: store.status === "under_construction" || store.status === "open" ? "done" : (weeksUntilOpen < 20 ? "at_risk" : "pending"),
        detail: store.status === "planned" ? "Awaiting permits" : "Layout approved",
      },
    ],
  });

  const phase2Start = new Date(openDate.getTime() - 16 * 7 * 86400000);
  const phase2End = new Date(openDate.getTime() - 10 * 7 * 86400000);
  const deptLeads = positionBreakdown.find(p => p.title === "Department Lead");
  phases.push({
    id: "leadership-training",
    name: "Leadership Onboarding & Department Lead Hiring",
    description: "Train leadership team and recruit department leads to build the management structure.",
    weeksBeforeOpen: 16,
    durationWeeks: 6,
    startDate: fmt(phase2Start),
    endDate: fmt(phase2End),
    status: getPhaseStatus(phase2Start, phase2End),
    tasks: [
      {
        id: "t4",
        label: "Leadership training program",
        category: "training",
        status: leadershipFilled >= 1 && weeksUntilOpen <= 16 ? (weeksUntilOpen <= 10 ? "done" : "in_progress") : "pending",
        detail: `${Math.max(0, 8 - Math.max(0, weeksUntilOpen - 10))}/8 weeks completed`,
      },
      {
        id: "t5",
        label: "Hire Department Leads",
        category: "hiring",
        status: (deptLeads?.filled ?? 0) >= (deptLeads?.needed ?? 4) ? "done" : (weeksUntilOpen < 10 ? "at_risk" : "pending"),
        detail: `${deptLeads?.filled ?? 0}/${deptLeads?.needed ?? 4} filled`,
      },
      {
        id: "t6",
        label: "Identify bench transfers",
        category: "staffing",
        status: benchCandidates.length > 0 ? "in_progress" : "pending",
        detail: `${benchCandidates.length} bench-ready employees available across company`,
      },
    ],
  });

  const phase3Start = new Date(openDate.getTime() - 10 * 7 * 86400000);
  const phase3End = new Date(openDate.getTime() - 4 * 7 * 86400000);
  const entryPositions = positionBreakdown.filter(p => !p.isLeadership);
  const entryFilled = entryPositions.reduce((s, p) => s + p.filled, 0);
  const entryNeeded = entryPositions.reduce((s, p) => s + p.needed, 0);
  phases.push({
    id: "mass-hiring",
    name: "Mass Hiring & Pipeline Activation",
    description: "Ramp up hiring for all frontline positions. Activate job postings and process candidates.",
    weeksBeforeOpen: 10,
    durationWeeks: 6,
    startDate: fmt(phase3Start),
    endDate: fmt(phase3End),
    status: getPhaseStatus(phase3Start, phase3End),
    tasks: [
      {
        id: "t7",
        label: "Post all open positions",
        category: "hiring",
        status: pipelineCount > 0 || totalFilled >= totalNeeded ? "done" : "pending",
        detail: `${pipelineCount} candidates in pipeline`,
      },
      {
        id: "t8",
        label: "Fill frontline roles",
        category: "hiring",
        status: entryFilled >= entryNeeded ? "done" : (entryFilled > 0 ? "in_progress" : (weeksUntilOpen < 4 ? "at_risk" : "pending")),
        detail: `${entryFilled}/${entryNeeded} entry-level positions filled`,
      },
      {
        id: "t9",
        label: "Schedule interview days",
        category: "operations",
        status: storePipeline.filter(p => p.stage === "interview").length > 0 ? "in_progress" : (pipelineCount > 0 ? "done" : "pending"),
        detail: `${storePipeline.filter(p => p.stage === "interview").length} interviews scheduled`,
      },
    ],
  });

  const phase4Start = new Date(openDate.getTime() - 4 * 7 * 86400000);
  const phase4End = new Date(openDate.getTime() - 1 * 7 * 86400000);
  phases.push({
    id: "training-prep",
    name: "Team Training & Store Setup",
    description: "Train all new hires, stock inventory, and set up systems for opening day.",
    weeksBeforeOpen: 4,
    durationWeeks: 3,
    startDate: fmt(phase4Start),
    endDate: fmt(phase4End),
    status: getPhaseStatus(phase4Start, phase4End),
    tasks: [
      {
        id: "t10",
        label: "Run frontline training",
        category: "training",
        status: weeksUntilOpen <= 1 && totalFilled > 0 ? "done" : (weeksUntilOpen <= 4 && totalFilled > 0 ? "in_progress" : "pending"),
        detail: `${totalFilled} employees to train (avg 2 weeks)`,
      },
      {
        id: "t11",
        label: "POS & systems setup",
        category: "operations",
        status: store.status === "open" ? "done" : (weeksUntilOpen <= 2 ? "in_progress" : "pending"),
        detail: "Register terminals, inventory system, scheduling software",
      },
      {
        id: "t12",
        label: "Inventory stocking",
        category: "operations",
        status: store.status === "open" ? "done" : (weeksUntilOpen <= 1 ? "in_progress" : "pending"),
        detail: "Initial product shipment and merchandising",
      },
    ],
  });

  const phase5Start = new Date(openDate.getTime() - 1 * 7 * 86400000);
  const phase5End = new Date(openDate.getTime() + 2 * 7 * 86400000);
  phases.push({
    id: "launch",
    name: "Soft Launch & Grand Opening",
    description: "Final readiness check, soft launch period, and grand opening event.",
    weeksBeforeOpen: 1,
    durationWeeks: 3,
    startDate: fmt(phase5Start),
    endDate: fmt(phase5End),
    status: store.status === "open" ? "completed" : getPhaseStatus(phase5Start, phase5End),
    tasks: [
      {
        id: "t13",
        label: "Staffing readiness check",
        category: "staffing",
        status: staffingProgress >= 90 ? "done" : (staffingProgress >= 70 ? "in_progress" : "at_risk"),
        detail: `${staffingProgress}% staffed (${totalFilled}/${totalNeeded})`,
      },
      {
        id: "t14",
        label: "Soft opening (3 days)",
        category: "operations",
        status: store.status === "open" ? "done" : "pending",
        detail: "Limited hours to test operations",
      },
      {
        id: "t15",
        label: "Grand opening event",
        category: "operations",
        status: store.status === "open" ? "done" : "pending",
        detail: "Full launch with marketing & community outreach",
      },
    ],
  });

  const completedTasks = phases.flatMap(p => p.tasks).filter(t => t.status === "done").length;
  const totalTasks = phases.flatMap(p => p.tasks).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    store,
    daysUntilOpen,
    weeksUntilOpen,
    overallProgress,
    staffingProgress,
    hiringProgress: Math.min(100, hiringProgress),
    trainingReadiness: Math.min(100, trainingReadiness),
    leadershipFilled,
    leadershipNeeded,
    totalPositionsNeeded: totalNeeded,
    totalPositionsFilled: totalFilled,
    pipelineCount,
    benchCandidates: benchCandidates.length,
    phases,
    positionBreakdown,
  };
}

const taskStatusIcons: Record<string, typeof CheckCircle2> = {
  done: CheckCircle2,
  in_progress: Clock,
  pending: Circle,
  at_risk: AlertTriangle,
};

const taskStatusColors: Record<string, string> = {
  done: "text-emerald-500",
  in_progress: "text-blue-500",
  pending: "text-muted-foreground",
  at_risk: "text-amber-500",
};

const phaseStatusBadge: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  upcoming: "outline",
  overdue: "destructive",
};

const phaseStatusLabels: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  upcoming: "Upcoming",
  overdue: "Overdue",
};

const categoryIcons: Record<string, typeof Users> = {
  hiring: UserPlus,
  training: GraduationCap,
  operations: ClipboardList,
  staffing: Briefcase,
};

export default function PlaybookPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  const { data: stores, isLoading: storesLoading } = useQuery<Store[]>({ queryKey: ["/api/stores"] });
  const { data: positions } = useQuery<Position[]>({ queryKey: ["/api/positions"] });
  const { data: employees } = useQuery<Employee[]>({ queryKey: ["/api/employees"] });
  const { data: pipeline } = useQuery<HiringPipelineEntry[]>({ queryKey: ["/api/pipeline"] });

  const nonOpenStores = stores?.filter(s => s.status !== "open").sort((a, b) => {
    if (!a.openDate) return 1;
    if (!b.openDate) return -1;
    return a.openDate.localeCompare(b.openDate);
  }) || [];

  const allStores = stores || [];

  const selectedStore = allStores.find(s => s.id === Number(selectedStoreId));

  const playbook = selectedStore && positions && employees && pipeline
    ? buildPlaybook(selectedStore, positions, employees, pipeline, employees)
    : null;

  if (storesLoading) {
    return (
      <div className="p-6 space-y-6 overflow-auto h-full">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-playbook-title">Store Opening Playbook</h1>
          <p className="text-muted-foreground mt-1">
            Step-by-step preparation guide for each new store opening
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="w-72">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId} data-testid="select-playbook-store">
              <SelectTrigger data-testid="select-playbook-store-trigger">
                <SelectValue placeholder="Select a store..." />
              </SelectTrigger>
              <SelectContent>
                {nonOpenStores.length > 0 && nonOpenStores.map(store => (
                  <SelectItem key={store.id} value={String(store.id)} data-testid={`option-store-${store.id}`}>
                    {store.name} — {store.city} ({store.openDate || "TBD"})
                  </SelectItem>
                ))}
                {allStores.filter(s => s.status === "open").map(store => (
                  <SelectItem key={store.id} value={String(store.id)} data-testid={`option-store-${store.id}`}>
                    {store.name} — {store.city} (Open)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const link = document.createElement("a");
              link.href = "/api/download/playbooks";
              link.download = "StaffCast_Playbooks.zip";
              link.click();
            }}
            data-testid="button-download-playbooks"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All Playbooks
          </Button>
        </div>
      </div>

      {!playbook && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Select a Store</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Choose a store from the dropdown above to view its opening preparation playbook with timelines, hiring milestones, and training checklists.
            </p>
          </CardContent>
        </Card>
      )}

      {playbook && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Days Until Open</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-days-until-open">
                  {playbook.daysUntilOpen <= 0 ? (playbook.store.status === "open" ? "Open" : "Overdue") : playbook.daysUntilOpen}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{playbook.store.openDate || "No date set"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Overall Progress</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-overall-progress">{playbook.overallProgress}%</div>
                <Progress value={playbook.overallProgress} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Staffing</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-staffing-progress">{playbook.totalPositionsFilled}/{playbook.totalPositionsNeeded}</div>
                <Progress value={playbook.staffingProgress} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Pipeline + Filled</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-hiring-progress">{playbook.hiringProgress}%</div>
                <p className="text-xs text-muted-foreground mt-1">{playbook.pipelineCount} in pipeline, {playbook.benchCandidates} bench ready</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Preparation Phases
            </h2>
            {playbook.phases.map((phase) => (
              <Card key={phase.id} data-testid={`card-phase-${phase.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{phase.name}</CardTitle>
                        <Badge variant={phaseStatusBadge[phase.status]}>
                          {phaseStatusLabels[phase.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      <div>{phase.startDate}</div>
                      <div className="flex items-center gap-1 justify-end">
                        <ChevronRight className="h-3 w-3" />
                        {phase.endDate}
                      </div>
                      <div className="mt-1 font-medium">{phase.durationWeeks} weeks</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {phase.tasks.map((task) => {
                      const StatusIcon = taskStatusIcons[task.status];
                      const CategoryIcon = categoryIcons[task.category];
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                          data-testid={`task-${task.id}`}
                        >
                          <StatusIcon className={`h-4 w-4 shrink-0 ${taskStatusColors[task.status]}`} />
                          <CategoryIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-sm font-medium flex-1">{task.label}</span>
                          <span className="text-xs text-muted-foreground">{task.detail}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Position Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-center">Needed</TableHead>
                      <TableHead className="text-center">Filled</TableHead>
                      <TableHead className="text-center">In Pipeline</TableHead>
                      <TableHead className="text-center">Gap</TableHead>
                      <TableHead className="text-center">Training (wks)</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playbook.positionBreakdown.map((pos, idx) => (
                      <TableRow key={idx} data-testid={`row-position-${idx}`}>
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            {pos.title}
                            {pos.isLeadership && <Badge variant="outline" className="text-xs">Leadership</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{pos.needed}</TableCell>
                        <TableCell className="text-center text-emerald-600 dark:text-emerald-400 font-medium">{pos.filled}</TableCell>
                        <TableCell className="text-center text-blue-600 dark:text-blue-400">{pos.inPipeline}</TableCell>
                        <TableCell className="text-center">
                          {pos.gap > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">{pos.gap}</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{pos.trainingWeeks}</TableCell>
                        <TableCell className="text-center">
                          {pos.filled >= pos.needed ? (
                            <Badge variant="default" className="text-xs">Full</Badge>
                          ) : pos.filled + pos.inPipeline >= pos.needed ? (
                            <Badge variant="secondary" className="text-xs">Covered</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Hiring</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Training Timeline Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playbook.positionBreakdown.filter(p => p.isLeadership).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Leadership Training (start first)</h4>
                    <div className="space-y-2">
                      {playbook.positionBreakdown.filter(p => p.isLeadership).map((pos, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-40 text-sm">{pos.title}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-medium"
                                style={{ width: `${Math.max(20, (pos.trainingWeeks / 8) * 100)}%` }}
                              >
                                {pos.trainingWeeks} weeks
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground w-24 text-right">
                            Start {pos.trainingWeeks + 2}w before open
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Frontline Training</h4>
                  <div className="space-y-2">
                    {playbook.positionBreakdown.filter(p => !p.isLeadership).map((pos, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-40 text-sm">{pos.title}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 rounded bg-chart-2/30 flex items-center justify-center text-xs font-medium"
                              style={{ width: `${Math.max(15, (pos.trainingWeeks / 8) * 100)}%` }}
                            >
                              {pos.trainingWeeks} weeks
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground w-24 text-right">
                          Start {pos.trainingWeeks + 1}w before open
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
