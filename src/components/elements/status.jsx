import {
  batchStatus,
  harvestStatus,
  proposalStatus,
  transactionStatus,
  treatmentRecordStatus,
} from "@/constant/constant";

export const convertStatusForTransaction = (status) => {
  switch (status) {
    case transactionStatus.pending:
      return "warning";
    case transactionStatus.accepted:
      return "success";
    default:
      return "error";
  }
};

export const convertStatusForProposal = (status) => {
  switch (status) {
    case proposalStatus.pending:
      return "warning";
    case proposalStatus.approved:
      return "success";
    case proposalStatus.rejected:
      return "error";
    default:
      return "";
  }
};

export const convertStatusForBatch = (status) => {
  switch (status) {
    case batchStatus.cancel:
      return "error";
    case batchStatus.harvest:
      return "success";
    case batchStatus.planting:
      return "warning";
    default:
      return "";
  }
};

export const convertStatusForHarvest = (status) => {
  switch (status) {
    case harvestStatus.pending:
      return "warning";
    case harvestStatus.approved:
      return "success";
    case harvestStatus.revision:
      return "error";
    default:
      return "";
  }
};

export const convertStatusForTreatmentRecord = (status) => {
  switch (status) {
    case treatmentRecordStatus.pending:
      return "warning";
    case treatmentRecordStatus.approved:
      return "success";
    case treatmentRecordStatus.revision:
      return "error";
    case treatmentRecordStatus.waitingResponse:
      return "warning";
    default:
      return "";
  }
};

export default (props) => {
  const { type, status } = props;

  let classColor;

  switch (type) {
    case "success":
      classColor = "bg-[#D6FFDE] text-[#03AC0E]";
      break;
    case "error":
      classColor = "bg-[#FFEAEF] text-[#EF144A]";
      break;
    case "warning":
      classColor = "bg-[#FFF0B3] text-[#FA591D]";
      break;
    default:
      classColor = "bg-gray-200 text-gray-500";
      break;
  }

  return (
    <div className={`text-sm h-min ${classColor} px-2 py-1 rounded-md`}>
      {status}
    </div>
  );
};
