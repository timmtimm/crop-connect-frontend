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
      classColor = "bg-gray-500";
      break;
  }

  return (
    <div className={`text-sm h-min ${classColor} px-2 py-1 rounded-md`}>
      {status}
    </div>
  );
};
