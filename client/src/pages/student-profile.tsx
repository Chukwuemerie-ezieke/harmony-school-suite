import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Loader2, Plus, Trash2, User, Phone, Mail, MapPin, Calendar, Droplet } from "lucide-react";

export default function StudentProfilePage() {
  const [, params] = useRoute("/students/:id");
  const id = Number(params?.id);
  const [guardianOpen, setGuardianOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: profile, isLoading } = useQuery<any>({ queryKey: [`/api/students/${id}`], enabled: !!id });

  const addGuardian = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/students/${id}/guardians`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/students/${id}`] }); setGuardianOpen(false); }
  });
  const delGuardian = useMutation({
    mutationFn: (gid: number) => apiRequest("DELETE", `/api/guardians/${gid}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/students/${id}`] })
  });
  const addHistory = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/students/${id}/history`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/students/${id}`] }); setHistoryOpen(false); }
  });
  const delHistory = useMutation({
    mutationFn: (hid: number) => apiRequest("DELETE", `/api/history/${hid}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/students/${id}`] })
  });

  if (isLoading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div></AppLayout>;
  if (!profile) return <AppLayout><p className="text-muted-foreground">Student not found.</p></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/students"><Button variant="ghost" size="sm" data-testid="back-students"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-profile-title">{profile.firstName} {profile.middleName} {profile.lastName}</h1>
            <p className="text-xs text-muted-foreground">Admission No. <span className="font-mono">{profile.admissionNumber}</span> · {profile.classLevel}{profile.section}</p>
          </div>
          <Badge variant={profile.isActive ? "default" : "secondary"} className="ml-auto">{profile.isActive ? "Active" : "Inactive"}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />Biodata</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row icon={Calendar} label="Date of Birth" value={profile.dateOfBirth || "—"} />
              <Row icon={User} label="Gender" value={profile.gender} />
              <Row icon={Droplet} label="Blood / Genotype" value={`${profile.bloodGroup || "—"} / ${profile.genotype || "—"}`} />
              <Row icon={Phone} label="Parent Phone" value={profile.parentPhone || "—"} />
              <Row icon={Mail} label="Parent Email" value={profile.parentEmail || "—"} />
              <Row icon={MapPin} label="Address" value={profile.address || "—"} />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <Tabs defaultValue="guardians">
                <TabsList>
                  <TabsTrigger value="guardians" data-testid="tab-guardians">Guardians ({profile.guardians?.length || 0})</TabsTrigger>
                  <TabsTrigger value="history" data-testid="tab-history">Class History ({profile.classHistory?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="guardians" className="mt-4">
                  <div className="flex justify-end mb-3">
                    <Dialog open={guardianOpen} onOpenChange={setGuardianOpen}>
                      <DialogTrigger asChild><Button size="sm" data-testid="button-add-guardian"><Plus className="w-4 h-4 mr-1" />Add Guardian</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Guardian</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.target as HTMLFormElement);
                          addGuardian.mutate({
                            name: f.get("name"), phone: f.get("phone"), email: f.get("email") || null,
                            relationship: f.get("relationship"), occupation: f.get("occupation") || null,
                            address: f.get("address") || null, isPrimary: f.get("isPrimary") === "on",
                          });
                        }} className="space-y-3">
                          <div><Label>Name *</Label><Input name="name" required data-testid="input-guardian-name" /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><Label>Phone *</Label><Input name="phone" required data-testid="input-guardian-phone" /></div>
                            <div><Label>Relationship *</Label>
                              <Select name="relationship" required>
                                <SelectTrigger data-testid="select-relationship"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Father">Father</SelectItem>
                                  <SelectItem value="Mother">Mother</SelectItem>
                                  <SelectItem value="Guardian">Guardian</SelectItem>
                                  <SelectItem value="Uncle">Uncle</SelectItem>
                                  <SelectItem value="Aunt">Aunt</SelectItem>
                                  <SelectItem value="Sibling">Sibling</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div><Label>Email</Label><Input name="email" type="email" data-testid="input-guardian-email" /></div>
                          <div><Label>Occupation</Label><Input name="occupation" data-testid="input-guardian-occupation" /></div>
                          <div><Label>Address</Label><Input name="address" data-testid="input-guardian-address" /></div>
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPrimary" data-testid="check-primary" />Primary contact</label>
                          <DialogFooter><Button type="submit" disabled={addGuardian.isPending} data-testid="button-save-guardian">{addGuardian.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button></DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Relationship</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                      {profile.guardians?.map((g: any) => (
                        <TableRow key={g.id} data-testid={`row-guardian-${g.id}`}>
                          <TableCell className="font-medium">{g.name} {g.isPrimary && <Badge variant="outline" className="ml-1 text-[10px]">Primary</Badge>}</TableCell>
                          <TableCell>{g.relationship}</TableCell>
                          <TableCell className="font-mono text-xs">{g.phone}</TableCell>
                          <TableCell className="text-xs">{g.email || "—"}</TableCell>
                          <TableCell><Button size="icon" variant="ghost" onClick={() => delGuardian.mutate(g.id)} data-testid={`button-del-guardian-${g.id}`}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                      {(!profile.guardians || profile.guardians.length === 0) && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">No guardians yet.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <div className="flex justify-end mb-3">
                    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                      <DialogTrigger asChild><Button size="sm" data-testid="button-add-history"><Plus className="w-4 h-4 mr-1" />Add Record</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Class History</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.target as HTMLFormElement);
                          addHistory.mutate({
                            className: f.get("className"), session: f.get("session"),
                            result: f.get("result"), position: f.get("position") || null,
                            remarks: f.get("remarks") || null,
                          });
                        }} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div><Label>Class *</Label><Input name="className" placeholder="JSS1A" required data-testid="input-history-class" /></div>
                            <div><Label>Session *</Label><Input name="session" placeholder="2024/2025" required data-testid="input-history-session" /></div>
                          </div>
                          <div><Label>Result *</Label>
                            <Select name="result" required>
                              <SelectTrigger data-testid="select-result"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Promoted">Promoted</SelectItem>
                                <SelectItem value="Repeated">Repeated</SelectItem>
                                <SelectItem value="Graduated">Graduated</SelectItem>
                                <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><Label>Position</Label><Input name="position" placeholder="1st of 32" data-testid="input-position" /></div>
                            <div><Label>Remarks</Label><Input name="remarks" data-testid="input-remarks" /></div>
                          </div>
                          <DialogFooter><Button type="submit" disabled={addHistory.isPending} data-testid="button-save-history">{addHistory.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button></DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Session</TableHead><TableHead>Class</TableHead><TableHead>Result</TableHead><TableHead>Position</TableHead><TableHead>Remarks</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                      {profile.classHistory?.map((h: any) => (
                        <TableRow key={h.id} data-testid={`row-history-${h.id}`}>
                          <TableCell className="font-mono text-xs">{h.session}</TableCell>
                          <TableCell>{h.className}</TableCell>
                          <TableCell><Badge variant={h.result === "Promoted" || h.result === "Graduated" ? "default" : "secondary"}>{h.result}</Badge></TableCell>
                          <TableCell className="text-xs">{h.position || "—"}</TableCell>
                          <TableCell className="text-xs">{h.remarks || "—"}</TableCell>
                          <TableCell><Button size="icon" variant="ghost" onClick={() => delHistory.mutate(h.id)} data-testid={`button-del-history-${h.id}`}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                      {(!profile.classHistory || profile.classHistory.length === 0) && <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">No records yet.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground text-xs w-28">{label}</span>
      <span className="flex-1 truncate">{value}</span>
    </div>
  );
}
