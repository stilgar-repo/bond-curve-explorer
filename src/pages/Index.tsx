import {
  ActionIcon,
  Alert,
  AppShell,
  Box,
  Button,
  Grid,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconCode,
  IconDownload,
  IconMoonStars,
  IconSun,
} from "@tabler/icons-react";
import { useCallback, useEffect } from "react";

import { checkHealth, loadBondUniverse, loadHistoricalSpreads } from "@/api/bloomberg";
import { BondTable } from "@/components/BondTable";
import { BqlModal } from "@/components/BqlModal";
import { CrossSectionPlot } from "@/components/CrossSectionPlot";
import { HistoricalChart1 } from "@/components/HistoricalChart1";
import { HistoricalChart2 } from "@/components/HistoricalChart2";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useAppStore } from "@/store/useAppStore";

export default function Index() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [bqlOpened, { open: openBql, close: closeBql }] = useDisclosure(false);

  const {
    settings,
    loading,
    error,
    bloombergConnected,
    setLoading,
    setError,
    setBonds,
    setSpreads,
    setBloombergConnected,
  } = useAppStore();

  useEffect(() => {
    checkHealth()
      .then((res) => setBloombergConnected(res.bloomberg_connected))
      .catch(() => setBloombergConnected(false));
  }, [setBloombergConnected]);

  const handleLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [univRes, spreadRes] = await Promise.all([
        loadBondUniverse(settings),
        loadHistoricalSpreads(settings),
      ]);
      setBonds(univRes.bonds);
      setSpreads(spreadRes.spreads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [settings, setLoading, setError, setBonds, setSpreads]);

  const isDark = colorScheme === "dark";

  return (
    <>
      <BqlModal opened={bqlOpened} onClose={closeBql} />

      <AppShell
        navbar={{ width: 320, breakpoint: "sm" }}
        padding="md"
        header={{ height: 56 }}
        styles={{
          main: {
            backgroundColor: isDark ? "#002140" : "#fcf7f0",
          },
          header: {
            backgroundColor: isDark ? "#001a33" : "#e6f1f3",
            borderBottom: `1px solid ${isDark ? "#001f87" : "#b5d1d4"}`,
          },
          navbar: {
            backgroundColor: isDark ? "#001a33" : "#ffffff",
            borderRight: `1px solid ${isDark ? "#001f87" : "#b5d1d4"}`,
          },
        }}
      >
        {/* Header */}
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group gap="sm">
              <Title order={4} fw={700} c={isDark ? "#e6f1f3" : "#002140"}>
                Bond Spread Analyzer
              </Title>
              {bloombergConnected === false && (
                <Alert
                  color="red"
                  variant="light"
                  icon={<IconAlertTriangle size={16} />}
                  py={4}
                  px="sm"
                  style={{ display: "inline-flex" }}
                >
                  <Text size="xs">Bloomberg not connected</Text>
                </Alert>
              )}
            </Group>

            <Group gap="xs">
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={handleLoad}
                loading={loading}
                size="sm"
                color="brand.5"
              >
                Load
              </Button>
              <Button
                variant="light"
                leftSection={<IconCode size={16} />}
                onClick={openBql}
                size="sm"
                color="brand.4"
              >
                BQL
              </Button>
              <ActionIcon
                variant="default"
                size="lg"
                onClick={() => toggleColorScheme()}
                aria-label="Toggle color scheme"
                style={{
                  backgroundColor: isDark ? "#002140" : "#e6f1f3",
                  borderColor: isDark ? "#001f87" : "#b5d1d4",
                }}
              >
                {isDark ? (
                  <IconSun size={18} color="#e6ff00" />
                ) : (
                  <IconMoonStars size={18} color="#002140" />
                )}
              </ActionIcon>
            </Group>
          </Group>
        </AppShell.Header>

        {/* Sidebar */}
        <AppShell.Navbar>
          <ScrollArea p="md" type="auto">
            <SettingsPanel />
          </ScrollArea>
        </AppShell.Navbar>

        {/* Main Content */}
        <AppShell.Main>
          {error && (
            <Alert color="dashboard" mb="md" icon={<IconAlertTriangle size={18} />}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
              }}
            >
              <Loader size="lg" color="brand.2" />
            </Box>
          )}

          <Grid gutter="md">
            <Grid.Col span={12}>
              <Paper
                shadow="xs"
                p="md"
                radius="md"
                withBorder
                style={{
                  borderColor: isDark ? "#001f87" : "#b5d1d4",
                  backgroundColor: isDark ? "#001a33" : "#ffffff",
                }}
              >
                <CrossSectionPlot />
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                shadow="xs"
                p="md"
                radius="md"
                withBorder
                style={{
                  borderColor: isDark ? "#001f87" : "#b5d1d4",
                  backgroundColor: isDark ? "#001a33" : "#ffffff",
                }}
              >
                <HistoricalChart1 />
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                shadow="xs"
                p="md"
                radius="md"
                withBorder
                style={{
                  borderColor: isDark ? "#001f87" : "#b5d1d4",
                  backgroundColor: isDark ? "#001a33" : "#ffffff",
                }}
              >
                <HistoricalChart2 />
              </Paper>
            </Grid.Col>

            <Grid.Col span={12}>
              <Paper
                shadow="xs"
                p="md"
                radius="md"
                withBorder
                style={{
                  borderColor: isDark ? "#001f87" : "#b5d1d4",
                  backgroundColor: isDark ? "#001a33" : "#ffffff",
                }}
              >
                <Text fw={600} mb="xs" c={isDark ? "#e6f1f3" : "#002140"}>
                  Bond Universe
                </Text>
                <BondTable />
              </Paper>
            </Grid.Col>
          </Grid>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
