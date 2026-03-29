import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const theme = createTheme({
  primaryColor: "brand",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  defaultRadius: "md",
  colors: {
    brand: [
      "#e6f1f3",  // 0 - light blue
      "#b5d1d4",  // 1 - stormy blue
      "#61e3e8",  // 2 - turquoise
      "#61e3e8",  // 3
      "#001f87",  // 4 - vibrant blue
      "#002140",  // 5 - dark blue
      "#002140",  // 6
      "#001a33",  // 7
      "#001226",  // 8
      "#000d1a",  // 9
    ],
    highlight: [
      "#fdffd9", "#f9ff99", "#f2ff4d", "#e6ff00", "#cce600", "#b3cc00",
      "#99b300", "#809900", "#668000", "#4d6600",
    ],
    dashboard: [
      "#fce8e9", "#f5bfc2", "#ee969b", "#e76d74", "#d82c38", "#c02731",
      "#a8222b", "#901c24", "#78171e", "#601217",
    ],
    natural: [
      "#f0f7ec", "#d4eac7", "#b8dda2", "#9cd07d", "#7fba50", "#6fa646",
      "#5f923c", "#4f7e32", "#497840", "#396428",
    ],
  },
  other: {
    cream: "#fcf7f0",
    sand: "#f4e8d6",
    grey: "#d9d9d9",
    orange: "#e86b00",
    dashboardGreen: "#7fba50",
    dashboardOrange: "#e86b00",
    dashboardRed: "#d82c38",
  },
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
