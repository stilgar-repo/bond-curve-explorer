import {
  Accordion,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconAdjustments, IconChartLine } from "@tabler/icons-react";
import { useAppStore } from "@/store/useAppStore";
import { LOCAL_CURRENCIES } from "@/types/bond";
import type { CurveConfig, LocalCurrency } from "@/types/bond";

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
    <Stack gap="xs">
      <Text size="sm" fw={600}>
        {label}
      </Text>
      <TextInput
        label="Tickers (comma-separated)"
        value={value.tickers}
        onChange={(e) => onChange({ ...value, tickers: e.currentTarget.value })}
        placeholder="IBRD,WORLD"
      />
      <Select
        label="Currency"
        data={LOCAL_CURRENCIES}
        value={value.currency}
        onChange={(v) => onChange({ ...value, currency: v ?? "USD" })}
      />
    </Stack>
  );
}

export function SettingsPanel() {
  const { settings, setSettings } = useAppStore();

  return (
    <Accordion defaultValue={["universe", "spreads"]} multiple variant="separated">
      <Accordion.Item value="universe">
        <Accordion.Control icon={<IconAdjustments size={18} />}>
          Bond Universe
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="md">
            <TextInput
              label="Field List"
              value={settings.fieldList}
              onChange={(e) => setSettings({ fieldList: e.currentTarget.value })}
            />
            <NumberInput
              label="Max Bonds"
              value={settings.maxBonds}
              onChange={(v) => setSettings({ maxBonds: Number(v) || 10 })}
              min={1}
              max={500}
            />
            <TextInput
              label="Min Amount Issued"
              value={settings.minAmount}
              onChange={(e) => setSettings({ minAmount: e.currentTarget.value })}
            />
            <TextInput
              label="Max Issue Date"
              value={settings.maxIssueDt}
              onChange={(e) => setSettings({ maxIssueDt: e.currentTarget.value })}
            />
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
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="spreads">
        <Accordion.Control icon={<IconChartLine size={18} />}>
          Historical Spreads
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="md">
            <TextInput
              label="Lookback Window"
              value={settings.lookbackWindow}
              onChange={(e) => setSettings({ lookbackWindow: e.currentTarget.value })}
              placeholder="1M"
            />
            <TextInput
              label="Spread Type"
              value={settings.spreadType}
              onChange={(e) => setSettings({ spreadType: e.currentTarget.value })}
              placeholder="ASW"
            />
            <Select
              label="Local Currency"
              data={LOCAL_CURRENCIES}
              value={settings.localCurrency}
              onChange={(v) =>
                setSettings({ localCurrency: (v as LocalCurrency) ?? "USD" })
              }
            />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
