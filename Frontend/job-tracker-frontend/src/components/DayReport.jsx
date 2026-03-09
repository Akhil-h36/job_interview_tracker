import { useState } from "react";
import { getDayData } from "../services/JobServices";

function DayReport() {

  const [date, setDate] = useState("");
  const [data, setData] = useState(null);

  const fetchDayData = async () => {
    if (!date) return;

    const result = await getDayData(date);
    setData(result);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">

      <h2 className="text-xl font-semibold">
        Daywise Report
      </h2>

      <div className="flex gap-3">

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={fetchDayData}
          className="bg-black text-white px-4 rounded"
        >
          Get Report
        </button>

      </div>

      {data && (
        <div className="space-y-2">

          <p>LinkedIn: {data.linkedin_count}</p>
          <p>Indeed: {data.indeed_count}</p>
          <p>Naukri: {data.naukri_count}</p>

        </div>
      )}

    </div>
  );
}

export default DayReport;