import CircularProgress from "@mui/material/CircularProgress";
import Modal from "../elements/modal";

export default () => (
  <Modal>
    <CircularProgress className="mb-6" />
    <span className="text-xl font-bold">Loading</span>
  </Modal>
);
