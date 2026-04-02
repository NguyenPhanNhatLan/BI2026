import { getOTIFandRevenueSummary } from "../services/dashboardServices.js";
import { asyncHandler } from "../utils/errorHandler.js";

export const getDashboardData = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await getOTIFandRevenueSummary(startDate, endDate);
  
  res.status(200).json({ success: true, data });
});

