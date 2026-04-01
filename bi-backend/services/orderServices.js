import { Pool } from "pg";
import supabase from "../config/supabase.js";

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
});

const handleSingleError = (error, context) => {
  if (error.code === "PGRST116") return null; // Trả về null nếu không có dòng nào
  throw new Error(`[${context}] ${error.message}`);
};

export async function getOrderById(orderId) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        order_id,
        order_placement_date,
        status,
        customer_id,
        customer (customer_name, city) 
      `)
      .eq("order_id", orderId)
      .single();

    if (error) return handleSingleError(error, "getOrderById");
    return data;
  } catch (err) {
    throw err;
  }
}

export async function getRawOrders(page = 1, limit = 10, status, from, to, city) {
  try {
    const customerJoin = (city && city.trim() !== "") 
        ? "customer!inner (customer_name, city)" 
        : "customer (customer_name, city)";

    let query = supabase.from("orders").select(`
        order_id,
        order_placement_date,
        status,
        customer_id,
        ${customerJoin},
        order_lines (actual_delivery_date)
      `,
      { count: "estimated" }
    );


    if (status) query = query.eq("status", status);
    if (from) query = query.gte("order_placement_date", from);
    if (to) query = query.lte("order_placement_date", to);

    if (city && city.trim() !== "") {
      query = query.ilike("customer.city", `%${city.trim()}%`);
    }

    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;
    query = query.range(fromIndex, toIndex).order("order_placement_date", { ascending: false });

    const { data, count, error } = await query;
    if (error) throw new Error(`[getRawOrders] ${error.message}`);

    const mappedData = (data || []).map((order) => {
      let processing_time = null;
      const deliveryDates = order.order_lines
          ?.map((line) => line.actual_delivery_date)
          .filter((date) => date !== null) || [];

      if (deliveryDates.length > 0) {
        const maxDeliveryDate = new Date(Math.max(...deliveryDates.map((d) => new Date(d))));
        const placementDate = new Date(order.order_placement_date);
        processing_time = ((maxDeliveryDate - placementDate) / (1000 * 60 * 60)).toFixed(1);
      }

      delete order.order_lines;
      return { ...order, processing_time };
    });

    return {
      data: mappedData,
      totalRecords: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    };
  } catch (err) {
    throw err;
  }
}

export async function getOrderStats(status, from, to, city) {
  try {
    const { data, error } = await supabase.rpc("get_order_dashboard_stats", {
      p_status: status || null,
      p_from: from || null,
      p_to: to || null,
      p_city: city || null, 
    });

    if (error) throw new Error(`[getOrderStats] ${error.message}`);
    return data;
  } catch (err) {
    throw err;
  }
}

export async function getOrderDetails(orderId) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                customer (*),
                order_lines (
                    *,
                    products (*)
                )
            `)
            .eq('order_id', orderId)
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        throw new Error(`[getOrderDetails] ${err.message}`);
    }
}

export async function createOrder(customerId, status, items) {
  const client = await pool.connect();
  try {
    const prefixes = ["FAP", "FMR", "FJU", "FAU", "FMY"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const newOrderId = `${randomPrefix}-${Date.now()}`;
    const placementDate = new Date().toISOString();
    const initialStatus = status || "pending";

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO orders (order_id, customer_id, status, order_placement_date) 
       VALUES ($1, $2, $3, $4)`,
      [newOrderId, customerId, initialStatus, placementDate]
    );

    const orderLinesPayload = [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const orderLineId = `OL${Math.floor(10000 + Math.random() * 90000)}${index}`;
      
      await client.query(
        `INSERT INTO order_lines (order_line_id, order_id, product_id, order_qty) 
         VALUES ($1, $2, $3, $4)`,
        [orderLineId, newOrderId, item.product_id, item.order_qty]
      );
      
      orderLinesPayload.push({
        product_id: item.product_id,
        order_qty: item.order_qty
      });
    }
    const eventPayload = {
      order_id: newOrderId,
      customer_id: customerId,
      status: initialStatus,
      placement_date: placementDate,
      items: orderLinesPayload 
    };


    await client.query(
      `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
       VALUES ($1, $2, $3, $4)`,
      ["order", newOrderId, "ORDER_CREATED", JSON.stringify(eventPayload)]
    );

    await client.query("COMMIT");

    return { order_id: newOrderId, message: "Tạo đơn hàng thành công" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`[createOrder] ${err.message}`);
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(orderId, status) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    );

    if (rows.length === 0) throw new Error("Order not found");

    const eventPayload = {
      order_id: orderId,
      new_status: status,
      updated_at: new Date().toISOString()
    };

    await client.query(
      `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
       VALUES ($1, $2, $3, $4)`,
      ["order", orderId, "ORDER_STATUS_UPDATED", JSON.stringify(eventPayload)]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`[updateOrderStatus] ${err.message}`);
  } finally {
    client.release();
  }
}

export async function deleteOrder(orderId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM order_lines WHERE order_id = $1`, [orderId]);
    await client.query(`DELETE FROM orders WHERE order_id = $1`, [orderId]);

    const eventPayload = {
      order_id: orderId,
      deleted_at: new Date().toISOString()
    };

    await client.query(
      `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
       VALUES ($1, $2, $3, $4)`,
      ["order", orderId, "ORDER_DELETED", JSON.stringify(eventPayload)]
    );

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`[deleteOrder] ${err.message}`);
  } finally {
    client.release();
  }
}