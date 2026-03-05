import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Building2, Target, AlertTriangle } from "lucide-react";
import type { Store, Competitor } from "@shared/schema";

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LocationsPage() {
  const [filterRegion, setFilterRegion] = useState("all");
  const [selectedStore, setSelectedStore] = useState<number | null>(null);

  const { data: stores, isLoading: storesLoading } = useQuery<Store[]>({ queryKey: ["/api/stores"] });
  const { data: competitors, isLoading: compLoading } = useQuery<Competitor[]>({ queryKey: ["/api/competitors"] });

  const regions = stores ? Array.from(new Set(stores.map(s => s.region))) : [];
  const filteredStores = stores?.filter(s => filterRegion === "all" || s.region === filterRegion) || [];

  const storeCompetitorAnalysis = filteredStores.map(store => {
    if (!store.lat || !store.lng || !competitors) {
      return { store, nearbyCompetitors: [], competitorDensity: 0, risk: "low" as const };
    }
    const nearby = competitors
      .map(c => ({ ...c, distance: getDistance(store.lat!, store.lng!, c.lat, c.lng) }))
      .filter(c => c.distance <= 15)
      .sort((a, b) => a.distance - b.distance);

    const density = nearby.length;
    const risk = density >= 4 ? "high" as const : density >= 2 ? "medium" as const : "low" as const;
    return { store, nearbyCompetitors: nearby, competitorDensity: density, risk };
  });

  const selected = selectedStore
    ? storeCompetitorAnalysis.find(s => s.store.id === selectedStore)
    : null;

  const riskCounts = {
    high: storeCompetitorAnalysis.filter(s => s.risk === "high").length,
    medium: storeCompetitorAnalysis.filter(s => s.risk === "medium").length,
    low: storeCompetitorAnalysis.filter(s => s.risk === "low").length,
  };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-locations-title">Location Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Competitive landscape analysis and bench-building opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Locations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-locations">{stores?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Competitors Tracked</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-competitors-tracked">{competitors?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Areas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-high-risk">{riskCounts.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-regions">{regions.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-region">
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Locations & Competitive Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {storesLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Nearby Competitors</TableHead>
                      <TableHead className="text-center">Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeCompetitorAnalysis.map(({ store, competitorDensity, risk }) => (
                      <TableRow
                        key={store.id}
                        className={`cursor-pointer ${selectedStore === store.id ? "bg-muted/50" : ""}`}
                        onClick={() => setSelectedStore(store.id === selectedStore ? null : store.id)}
                        data-testid={`row-location-${store.id}`}
                      >
                        <TableCell className="font-medium text-sm">{store.name}</TableCell>
                        <TableCell className="text-sm">{store.city}, {store.state}</TableCell>
                        <TableCell>
                          <Badge variant={
                            store.status === "open" ? "default" :
                            store.status === "under_construction" ? "secondary" : "outline"
                          }>
                            {store.status === "open" ? "Open" :
                             store.status === "under_construction" ? "Building" : "Planned"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">{competitorDensity}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={
                            risk === "high" ? "destructive" :
                            risk === "medium" ? "secondary" : "outline"
                          }>
                            {risk.charAt(0).toUpperCase() + risk.slice(1)}
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selected ? `${selected.store.name} - Competitors` : "Select a Store"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selected.store.address}, {selected.store.city}, {selected.store.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        selected.risk === "high" ? "destructive" :
                        selected.risk === "medium" ? "secondary" : "outline"
                      }>
                        {selected.risk} risk
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selected.nearbyCompetitors.length} competitors within 15 mi
                      </span>
                    </div>
                  </div>
                  {selected.nearbyCompetitors.length > 0 ? (
                    <div className="space-y-2">
                      {selected.nearbyCompetitors.map((comp, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                          <div>
                            <p className="text-sm font-medium">{comp.name}</p>
                            <p className="text-xs text-muted-foreground">{comp.city}, {comp.state}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{comp.distance.toFixed(1)} mi</p>
                            <Badge variant="outline" className="text-xs">{comp.category}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No competitors nearby - good opportunity for bench building
                    </p>
                  )}
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Bench Building Recommendation</h4>
                    <p className="text-xs text-muted-foreground">
                      {selected.risk === "high"
                        ? "High competitor density area. Consider aggressive hiring and competitive compensation. Start building pipeline 6+ months before opening."
                        : selected.risk === "medium"
                        ? "Moderate competition. Standard hiring timeline recommended. Begin pipeline 4 months before opening."
                        : "Low competition area. Focus on internal bench transfers. Standard 3-month pipeline recommended."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click on a store to view its competitive landscape and bench-building recommendations
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Risk Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">High Risk</span>
                  </div>
                  <span className="text-sm font-medium">{riskCounts.high} stores</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm">Medium Risk</span>
                  </div>
                  <span className="text-sm font-medium">{riskCounts.medium} stores</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm">Low Risk</span>
                  </div>
                  <span className="text-sm font-medium">{riskCounts.low} stores</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
