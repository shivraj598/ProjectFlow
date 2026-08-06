import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sprintApi } from "@/lib/api";

interface CreateSprintDialogProps {
  projectId: string;
  onCreated: () => void;
  trigger: React.ReactNode;
}

export function CreateSprintDialog({ projectId, onCreated, trigger }: CreateSprintDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"PLANNED" | "ACTIVE">("PLANNED");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await sprintApi.create(projectId, {
        name: name.trim(),
        goal: goal.trim() || null,
        startDate: startDate ? `${startDate}T00:00:00.000Z` : null,
        endDate: endDate ? `${endDate}T00:00:00.000Z` : null,
        status,
      });
      setOpen(false);
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      setStatus("PLANNED");
      onCreated();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create sprint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create sprint</DialogTitle>
            <DialogDescription>
              Plan a new development cycle for your project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sprint 1, Q1 Launch"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal">Goal (optional)</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What should be achieved in this sprint?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Start immediately</Label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={status === "ACTIVE"}
                  onChange={(e) => setStatus(e.target.checked ? "ACTIVE" : "PLANNED")}
                  className="size-4 accent-primary"
                />
                Activate this sprint right away
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? "Creating..." : "Create sprint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}