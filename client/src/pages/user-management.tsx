import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";

export default function UserManagementPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", fullName: "", email: "", role: "teacher", password: "" });

  const { data: users = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/users"] });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/users", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/users"] }); setOpen(false); toast({ title: "User created" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/users"] }); toast({ title: "User deleted" }); },
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">User Management</h1><p className="text-sm text-muted-foreground">{users.length} users</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="button-add-user"><Plus className="w-4 h-4 mr-2" />Add User</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                <Input placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                <Input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <Input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="school_admin">School Admin</SelectItem><SelectItem value="teacher">Teacher</SelectItem><SelectItem value="parent">Parent</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={() => addMutation.mutate(form)} disabled={addMutation.isPending} className="w-full mt-2">Create User</Button>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell className="font-mono text-xs">{u.username}</TableCell>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell><Badge variant="secondary">{u.role?.replace("_", " ")}</Badge></TableCell>
                    <TableCell><Badge variant={u.isActive ? "default" : "destructive"}>{u.isActive ? "Active" : "Disabled"}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(u.id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
