import supabase from "../config/supabase.js";

export const getOTIFSummary = async (startDate, endDate) => {
  const rpcParams = {};
  if (startDate) rpcParams.p_start_date = startDate;
  if (endDate) rpcParams.p_end_date = endDate;

  const { data, error } = await supabase.rpc('get_otif_summary', rpcParams);

  if (error) throw error;

  return {
    heroKPIs: data,
    topMissingProducts: [] 
};
}


(async () => {
  try {
    console.log("Đang gọi RPC get_otif_summary từ Supabase...");
    
    const result = await getOTIFSummary();
    
    console.log("Kết quả thành công:");
    console.dir(result, { depth: null, colors: true }); 
    
  } catch (err) {
    console.error("Lỗi khi chạy hàm:", err.message || err);
  }
});