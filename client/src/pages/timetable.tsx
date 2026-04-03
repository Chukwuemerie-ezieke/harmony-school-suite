import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablePage() {
  const [classId, setClassId] = useState<string>("");
  const { data: classes = [] } = useQuery<any[]>({ queryKey: ["/api/classes"] });
  const { data: subjects = [] } = useQuery<any[]>({ queryKey: ["/api/subjects"] });
  const { data: slots = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/timetable", classId],
    queryFn: async () => { const r = await apiRequest("GET", classId ? `/api/timetable?classId=${classId}` : "/api/timetable"); return r.json(); },
    enabled: true,
  });

  const subjectMap = new Map(subjects.map((s: any) => [s.id, s]));
  const getSlot = (day: number, period: number) => slots.find((s: any) => s.dayOfWeek === day && s.period === period);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Timetable</h1><p className="text-sm text-muted-foreground">Weekly class schedule</p></div>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium text-muted-foreground w-20">Period</th>
                  {DAYS.map(d => <th key={d} className="p-3 text-center font-medium text-muted-foreground">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(p => (
                  <tr key={p} className="border-b last:border-0">
                    <td className="p-3 font-medium">{p}</td>
                    {DAYS.map((_, di) => {
                      const slot = getSlot(di + 1, p);
                      const subject = slot ? subjectMap.get(slot.subjectId) : null;
                      return (
                        <td key={di} className="p-2 text-center">
                          {slot ? (
                            <div className="rounded-md p-2 text-xs" style={{ backgroundColor: subject?.colorCode ? `${subject.colorCode}20` : undefined, borderLeft: `3px solid ${subject?.colorCode || "#ccc"}` }}>
                              <p className="font-medium">{subject?.name || "—"}</p>
                              {slot.startTime && <p className="text-muted-foreground mt-0.5">{slot.startTime}-{slot.endTime}</p>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
