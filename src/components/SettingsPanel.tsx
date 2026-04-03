import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { LOCAL_CURRENCIES, type LocalCurrency } from "@/types/bond";

function Field({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Label className="text-caption cursor-help">{label}</Label>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-caption">
          {tooltip}
        </TooltipContent>
      </Tooltip>
      {children}
    </div>
  );
}

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { settings, setSettings } = useAppStore();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-md border border-border bg-card">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary transition-colors"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <h3 className="text-h3 text-card-foreground">Configuration</h3>
        </button>

        {open && (
          <div className="px-4 pb-4 border-t border-border pt-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <Field label="Field List" tooltip="BQL fields to retrieve for each bond">
                <Input
                  value={settings.fieldList}
                  onChange={(e) => setSettings({ fieldList: e.target.value })}
                  className="h-[36px] bg-card text-body"
                />
              </Field>
              <Field label="Max Bonds" tooltip="Maximum number of bonds per curve">
                <Input
                  type="number"
                  value={settings.maxBonds}
                  onChange={(e) => setSettings({ maxBonds: Number(e.target.value) })}
                  className="h-[36px] bg-card text-body"
                />
              </Field>
              <Field label="Min Amount" tooltip="Minimum amount issued filter">
                <Input
                  value={settings.minAmount}
                  onChange={(e) => setSettings({ minAmount: e.target.value })}
                  className="h-[36px] bg-card text-body"
                />
              </Field>
              <Field label="Max Issue Date" tooltip="Maximum issue date offset (e.g., -1Y)">
                <Input
                  value={settings.maxIssueDt}
                  onChange={(e) => setSettings({ maxIssueDt: e.target.value })}
                  className="h-[36px] bg-card text-body"
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {(["baseCurve", "curve1", "curve2"] as const).map((curveKey, i) => (
                <div key={curveKey} className="space-y-2 rounded-md border border-border p-3">
                  <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">
                    {curveKey === "baseCurve" ? "Base Curve" : `Curve ${i}`}
                  </p>
                  <Field label="Tickers" tooltip={`Comma-separated tickers for ${curveKey}`}>
                    <Input
                      value={settings[curveKey].tickers}
                      onChange={(e) =>
                        setSettings({ [curveKey]: { ...settings[curveKey], tickers: e.target.value } })
                      }
                      className="h-[36px] bg-card text-body"
                    />
                  </Field>
                  <Field label="Currency" tooltip={`Currency filter for ${curveKey}`}>
                    <Input
                      value={settings[curveKey].currency}
                      onChange={(e) =>
                        setSettings({ [curveKey]: { ...settings[curveKey], currency: e.target.value } })
                      }
                      className="h-[36px] bg-card text-body"
                    />
                  </Field>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Lookback" tooltip="Historical lookback window (e.g., 1M, 3M, 1Y)">
                <Input
                  value={settings.lookbackWindow}
                  onChange={(e) => setSettings({ lookbackWindow: e.target.value })}
                  className="h-[36px] bg-card text-body"
                />
              </Field>
              <Field label="Spread Type" tooltip="ASW, Z-Spread, OAS, etc.">
                <Input
                  value={settings.spreadType}
                  onChange={(e) => setSettings({ spreadType: e.target.value })}
                  className="h-[36px] bg-card text-body"
                />
              </Field>
              <Field label="Local Currency" tooltip="Currency for cross-currency spread conversion">
                <Select
                  value={settings.localCurrency}
                  onValueChange={(v) => setSettings({ localCurrency: v as LocalCurrency })}
                >
                  <SelectTrigger className="h-[36px] bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCAL_CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
