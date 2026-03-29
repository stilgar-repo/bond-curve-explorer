import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { buildSpreadsBql, buildUniverseBql } from "@/api/bloomberg";

interface BqlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BqlModal({ open, onOpenChange }: BqlModalProps) {
  const settings = useAppStore((s) => s.settings);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>BQL Queries</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <p className="font-semibold mb-2 text-sm text-foreground">Bond Universe Query</p>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto text-foreground">
              {buildUniverseBql(settings)}
            </pre>
          </div>
          <div>
            <p className="font-semibold mb-2 text-sm text-foreground">Historical Spreads Query</p>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto text-foreground">
              {buildSpreadsBql(settings)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
