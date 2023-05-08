import "@/styles/globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { propsTheme } from "@/lib/mui";

export default ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={propsTheme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};
