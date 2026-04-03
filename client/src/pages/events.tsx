import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, CalendarDays, MapPin, Clock } from "lucide-react";

export default function EventsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", eventTime: "", location: "" });

  const { data: events = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/events"] });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/events", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); setOpen(false); toast({ title: "Event created" }); },
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Events</h1><p className="text-sm text-muted-foreground">{events.length} events</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Event</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} />
                  <Input type="time" value={form.eventTime} onChange={e => setForm({...form, eventTime: e.target.value})} />
                </div>
                <Input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <Button onClick={() => addMutation.mutate(form)} disabled={addMutation.isPending} className="w-full mt-2">Create</Button>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((e: any) => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary flex-shrink-0">
                    <span className="text-xs font-bold">{e.eventDate ? new Date(e.eventDate + "T00:00").toLocaleDateString("en", { month: "short" }) : ""}</span>
                    <span className="text-lg font-bold leading-none">{e.eventDate ? new Date(e.eventDate + "T00:00").getDate() : ""}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{e.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{e.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {e.eventTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.eventTime}</span>}
                      {e.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>
    </AppLayout>
  );
}
