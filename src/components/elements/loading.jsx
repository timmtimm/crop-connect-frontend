import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default () => (
  <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 z-50 bg-slate-800/50">
    <Box className="flex flex-col contents-center items-center justify-center bg-white p-10 rounded-xl">
      <CircularProgress className="mb-6" />
      <span className="text-xl font-bold">Loading</span>
    </Box>
  </div>
);
