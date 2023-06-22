import {
  setNumberFormat,
  setPriceFormat,
  setWeightFormat,
} from "@/utils/utilities";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

export default (props) => {
  const { data } = props;

  return (
    <div className="w-full flex flex-col content-between gap-4 bg-white p-6 shadow-md rounded-lg">
      <div className="flex flex-row justify-between">
        <div>
          <span className="text-lg md:text-xl font-bold">{data.total}</span>
          <h3 className="text-md sm:text-lg">{data.content}</h3>
        </div>
        <div
          className={`flex justify-center items-center p-2 ${data.bgColor} rounded-md h-12 w-12`}
        >
          {data.icon}
        </div>
      </div>
      <div className="flex flex-row items-center w-full gap-2 p-3 rounded-md bg-gray-200">
        {data.differences >= 1 ? (
          <FiTrendingUp className="text-green-500" size={20} />
        ) : (
          <FiTrendingDown className="text-red-500" size={20} />
        )}
        <span>
          <span
            className={
              data.differences >= 1 ? "text-green-500" : "text-red-500"
            }
          >
            {Math.floor(Math.abs(data.differences) * 100)}%{" "}
          </span>
          dari {data.timeBased} lalu
        </span>
      </div>
    </div>
  );
};
