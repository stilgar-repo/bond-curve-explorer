import { Settings, TrendingUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { LOCAL_CURRENCIES } from "@/types/bond";
import type { CurveConfig, LocalCurrency } from "@/types/bond";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function CurveInputs({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CurveConfig;
  onChange: (c: CurveConfig) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="space-y-1">
        <Label className="text-xs">Tickers (comma-separated)</Label>
        <Input
          value={value.tickers}
          onChange={(e) => onChange({ ...value, tickers: e.target.value })}
          placeholder="IBRD,WORLD"
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Currency</Label>
        <Select value={value.currency} onValueChange={(v) => onChange({ ...value, currency: v })}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCAL_CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const { settings, setSettings } = useAppStore();

  return (
    <Accordion type="multiple" defaultValue={["universe", "spreads"]} className="space-y-2">
      <AccordionItem value="universe" className="border rounded-md px-3">
        <AccordionTrigger className="text-sm font-medium">
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Bond Universe
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-3">
          <div className="space-y-1">
            <Label className="text-xs">Field List</Label>
            <Input
              value={settings.fieldList}
              onChange={(e) => setSettings({ fieldList: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Bonds</Label>
            <Input
              type="number"
              value={settings.maxBonds}
              onChange={(e) => setSettings({ maxBonds: Number(e.target.value) || 10 })}
              min={1}
              max={500}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Min Amount Issued</Label>
            <Input
              value={settings.minAmount}
              onChange={(e) => setSettings({ minAmount: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Issue Date</Label>
            <Input
              value={settings.maxIssueDt}
              onChange={(e) => setSettings({ maxIssueDt: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <CurveInputs
            label="Base Curve"
            value={settings.baseCurve}
            onChange={(baseCurve) => setSettings({ baseCurve })}
          />
          <CurveInputs
            label="Curve 1"
            value={settings.curve1}
            onChange={(curve1) => setSettings({ curve1 })}
          />
          <CurveInputs
            label="Curve 2"
            value={settings.curve2}
            onChange={(curve2) => setSettings({ curve2 })}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="spreads" className="border rounded-md px-3">
        <AccordionTrigger className="text-sm font-medium">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Historical Spreads
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-3">
          <div className="space-y-1">
            <Label className="text-xs">Lookback Window</Label>
            <Input
              value={settings.lookbackWindow}
              onChange={(e) => setSettings({ lookbackWindow: e.target.value })}
              placeholder="1M"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Spread Type</Label>
            <Input
              value={settings.spreadType}
              onChange={(e) => setSettings({ spreadType: e.target.value })}
              placeholder="ASW"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Local Currency</Label>
            <Select
              value={settings.localCurrency}
              onValueChange={(v) => setSettings({ localCurrency: v as LocalCurrency })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCAL_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
