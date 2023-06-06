import { Box } from "@mui/material";

export default (props) => {
  const { children } = props;

  return (
    <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 z-50 bg-slate-800/50">
      <Box className="flex flex-col contents-center items-center justify-center bg-white p-10 rounded-xl mx-2">
        {children}
      </Box>
    </div>
  );
};
