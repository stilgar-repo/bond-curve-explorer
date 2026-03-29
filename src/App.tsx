import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  defaultRadius: "md",
});

const App = () => (
  <MantineProvider theme={theme} defaultColorScheme="light">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </MantineProvider>
);

export default App;
