import "@/styles/globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { propsTheme } from "@/lib/mui";
import { ProfileUserProvider } from "@/context/profileUserContext";

export default ({ Component, pageProps }) => {
  return (
    <ProfileUserProvider>
      <ThemeProvider theme={propsTheme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </ProfileUserProvider>
  );
};
