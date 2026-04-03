import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, Mail, MailOpen } from "lucide-react";

export default function MessagesPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ receiverId: "", subject: "", content: "" });

  const { data: inbox = [], isLoading: inboxLoading } = useQuery<any[]>({ queryKey: ["/api/messages/inbox"] });
  const { data: sent = [] } = useQuery<any[]>({ queryKey: ["/api/messages/sent"] });
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/users"] });

  const sendMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/messages", { ...data, receiverId: Number(data.receiverId) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/messages/inbox"] }); queryClient.invalidateQueries({ queryKey: ["/api/messages/sent"] }); setOpen(false); toast({ title: "Message sent" }); },
  });

  const MessageList = ({ messages, showFrom }: { messages: any[]; showFrom: boolean }) => (
    <div className="space-y-2">
      {messages.map((m: any) => (
        <Card key={m.id}>
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              {!m.isRead && showFrom ? <Mail className="w-4 h-4 text-primary mt-0.5" /> : <MailOpen className="w-4 h-4 text-muted-foreground mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{m.subject}</p>
                  {!m.isRead && showFrom && <Badge variant="default" className="text-xs">New</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{m.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {messages.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No messages</p>}
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Messages</h1></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Compose</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={form.receiverId} onValueChange={v => setForm({...form, receiverId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                  <SelectContent>{users.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.fullName} ({u.role})</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                <Textarea placeholder="Message" value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={4} />
              </div>
              <Button onClick={() => sendMutation.mutate(form)} disabled={sendMutation.isPending} className="w-full mt-2">Send</Button>
            </DialogContent>
          </Dialog>
        </div>
        <Tabs defaultValue="inbox">
          <TabsList><TabsTrigger value="inbox">Inbox ({inbox.length})</TabsTrigger><TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger></TabsList>
          <TabsContent value="inbox" className="mt-4">{inboxLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <MessageList messages={inbox} showFrom={true} />}</TabsContent>
          <TabsContent value="sent" className="mt-4"><MessageList messages={sent} showFrom={false} /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
