import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";

const statusColors: Record<string, string> = { new: "default", reviewing: "secondary", resolved: "outline", dismissed: "destructive" };
const priorityColors: Record<string, string> = { low: "secondary", medium: "default", high: "destructive" };

export default function FeedbacksPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [response, setResponse] = useState("");

  const { data: feedbacks = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/feedbacks"] });
  const { data: categories = [] } = useQuery<any[]>({ queryKey: ["/api/feedback-categories"] });

  const respondMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/feedbacks/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/feedbacks"] }); setSelected(null); toast({ title: "Response saved" }); },
  });

  const catMap = new Map(categories.map((c: any) => [c.id, c.name]));
  const filtered = filter === "all" ? feedbacks : feedbacks.filter((f: any) => f.status === filter);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Feedback</h1><p className="text-sm text-muted-foreground">{feedbacks.length} total submissions</p></div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="reviewing">Reviewing</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent>
          </Select>
        </div>
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
        <div className="space-y-3">
          {filtered.map((f: any) => (
            <Card key={f.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => { setSelected(f); setResponse(f.adminResponse || ""); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusColors[f.status] as any}>{f.status}</Badge>
                      <Badge variant={priorityColors[f.priority] as any}>{f.priority}</Badge>
                      {f.categoryId && <span className="text-xs text-muted-foreground">{catMap.get(f.categoryId)}</span>}
                    </div>
                    <p className="text-sm">{f.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">Code: {f.trackingCode} &middot; {new Date(f.createdAt).toLocaleDateString()}</p>
                  </div>
                  <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No feedback found</p>}
        </div>
        )}

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Respond to Feedback</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-3">
                <div className="p-3 rounded-md bg-muted text-sm">{selected.message}</div>
                <div className="flex gap-2">
                  <Select value={selected.status} onValueChange={v => { respondMutation.mutate({ id: selected.id, data: { status: v } }); }}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="reviewing">Reviewing</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="dismissed">Dismissed</SelectItem></SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Write your response..." value={response} onChange={e => setResponse(e.target.value)} rows={3} />
                <Button onClick={() => respondMutation.mutate({ id: selected.id, data: { adminResponse: response, status: "resolved" } })} disabled={respondMutation.isPending} className="w-full">
                  {respondMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Send Response
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
