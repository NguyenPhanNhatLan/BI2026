import clickhouse from "../config/clickhouse.js";

export const getOTIFandRevenueSummary = async (startDate, endDate) => {
  try {
    const query = `
      SELECT 
        -- Doanh thu
        SUM(actual_revenue) AS total_revenue,
        SUM(expected_revenue) - SUM(actual_revenue) AS lost_revenue,
        
        -- OTIF Metrics (Tính theo dòng sản phẩm - order lines)
        COUNT(*) AS total_lines,
        SUM(is_infull) AS infull_lines,
        SUM(is_ontime) AS ontime_lines,
        SUM(is_otif) AS otif_lines
      FROM default.order_lines_fact
      WHERE order_placement_date >= parseDateTimeBestEffort('${startDate || "2020-01-01"}')
        AND order_placement_date <= parseDateTimeBestEffort('${endDate || "2099-01-01"}')
    `;

    const resultSet = await clickhouse.query({ query, format: 'JSONEachRow' });
    const data = await resultSet.json();
    
    if (!data || data.length === 0) return null;
    
    const stats = data[0];
    const totalLines = Number(stats.total_lines) || 1;

    return {
      revenue: {
        total: Number(stats.total_revenue),
        lost: Number(stats.lost_revenue)
      },
      kpi: {
        infull_rate: ((Number(stats.infull_lines) / totalLines) * 100).toFixed(2),
        ontime_rate: ((Number(stats.ontime_lines) / totalLines) * 100).toFixed(2),
        otif_rate: ((Number(stats.otif_lines) / totalLines) * 100).toFixed(2)
      }
    };
  } catch (error) {
    throw new Error(`[ClickHouse Query Lỗi] ${error.message}`);
  }
};