import { Code, Modal, Stack, Text } from "@mantine/core";
import { useAppStore } from "@/store/useAppStore";
import { buildSpreadsBql, buildUniverseBql } from "@/api/bloomberg";

interface BqlModalProps {
  opened: boolean;
  onClose: () => void;
}

export function BqlModal({ opened, onClose }: BqlModalProps) {
  const settings = useAppStore((s) => s.settings);

  return (
    <Modal opened={opened} onClose={onClose} title="BQL Queries" size="lg">
      <Stack gap="lg">
        <div>
          <Text fw={600} mb="xs">
            Bond Universe Query
          </Text>
          <Code block>{buildUniverseBql(settings)}</Code>
        </div>
        <div>
          <Text fw={600} mb="xs">
            Historical Spreads Query
          </Text>
          <Code block>{buildSpreadsBql(settings)}</Code>
        </div>
      </Stack>
    </Modal>
  );
}
