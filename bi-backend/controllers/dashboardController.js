import { getOTIFSummary } from "../services/dashboardServices.js";

export const getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const data = await getOTIFSummary(startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
