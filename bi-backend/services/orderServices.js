import { Pool } from "pg";
import supabase from "../config/supabase.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const generateOrderId = () => {
  const prefixes = ["FAP", "FMR", "FJU", "FAU", "FMY"];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${randomPrefix}${Date.now().toString().slice(-6)}`;
};

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `order_id, order_placement_date, status, customer_id, customer (customer_name, city)`,
    )
    .eq("order_id", orderId)
    .single();

  if (error) return handleSupabaseSingleError(error, "getOrderById");
  return data;
}

export async function getRawOrders(
  page = 1,
  limit = 10,
  status,
  from,
  to,
  city,
) {
  try {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = supabase
      .from("orders")
      .select(
        `
        order_id,
        order_placement_date,
        status,
        customer_id,
        customers (
          customer_name,
          city
        )
      `,
        { count: "estimated" },
      );


    if (status) query = query.eq("status", status);
    if (from) query = query.gte("order_placement_date", from);
    if (to) query = query.lte("order_placement_date", to);

    if (city && city.trim() !== "") {
      query = query.ilike("customers.city", `%${city.trim()}%`);
    }

    query = query
      .order("order_placement_date", { ascending: false })
      .range(fromIndex, toIndex);

    const { data: orders, count, error } = await query;

    if (error) throw new Error(`[getRawOrders] ${error.message}`);

    if (!orders || orders.length === 0) {
      return {
        data: [],
        totalRecords: 0,
        totalPages: 0,
      };
    }

  

    const orderIds = orders.map((o) => o.order_id);

    const { data: processingData, error: processingError } =
      await supabase
        .from("order_lines")
        .select("order_id, actual_delivery_date")
        .in("order_id", orderIds);

    if (processingError) {
      throw new Error(
        `[getRawOrders-processing] ${processingError.message}`,
      );
    }

    const maxDeliveryMap = {};

    for (const row of processingData || []) {
      if (!row.actual_delivery_date) continue;

      const current = new Date(row.actual_delivery_date).getTime();

      if (
        !maxDeliveryMap[row.order_id] ||
        current > maxDeliveryMap[row.order_id]
      ) {
        maxDeliveryMap[row.order_id] = current;
      }
    }

    const mappedData = orders.map((order) => {
      let processing_time = null;

      const maxDelivery = maxDeliveryMap[order.order_id];

      if (maxDelivery) {
        const placement = new Date(
          order.order_placement_date,
        ).getTime();

        processing_time = (
          (maxDelivery - placement) /
          (1000 * 60 * 60)
        ).toFixed(1);
      }

      return {
        ...order,
        processing_time,
      };
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
  const { data, error } = await supabase.rpc("get_order_dashboard_stats", {
    p_status: status || null,
    p_from: from || null,
    p_to: to || null,
    p_city: city || null,
  });
  if (error) throw new Error(`[getOrderStats] ${error.message}`);
  return data;
}

export async function getOrderDetails(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`*, customer (*), order_lines (*, products (*))`)
    .eq("order_id", orderId)
    .single();
  if (error) throw error;
  return data;
}

export async function createOrder(orderData, items) {
  const client = await pool.connect();
  let newOrderId = null;
  try {
    newOrderId = generateOrderId();
    const { customer_id, status } = orderData;

    const placementDate = new Date().toISOString();
    const initialStatus = status || "pending";

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO orders (order_id, customer_id, status, order_placement_date) 
       VALUES ($1, $2, $3, $4)`,
      [newOrderId, customer_id, initialStatus, placementDate],
    );

    for (let index = 0; index < items.length; index++) {
      const {
        product_id,
        order_qty,
        actual_delivery_date,
        agreed_delivery_date,
      } = items[index];
      const orderLineId = `OL${Math.floor(10000 + Math.random() * 90000)}${index}`;

      await client.query(
        `INSERT INTO order_lines (order_line_id, order_id, product_id, order_qty, actual_delivery_date, agreed_delivery_date) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderLineId,
          newOrderId,
          product_id,
          order_qty,
          actual_delivery_date || null,
          agreed_delivery_date || null,
        ],
      );
    }

    await client.query("COMMIT");

    return { order_id: newOrderId, message: "Tạo đơn hàng thành công" };
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(
      `[Transaction Error - createOrder] Failed at Order ID ${newOrderId}:`,
      err,
    );

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
      [status, orderId],
    );

    if (rows.length === 0) throw new Error("Order not found");

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
    
    await client.query(`DELETE FROM order_lines WHERE order_id = $1`, [
      orderId,
    ]);
    await client.query(`DELETE FROM orders WHERE order_id = $1`, [orderId]);

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`[deleteOrder] ${err.message}`);
  } finally {
    client.release();
  }
}

export async function updateOrderFull(orderId, orderData, items) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (orderData && Object.keys(orderData).length > 0) {
      await client.query(
        `UPDATE orders SET 
         customer_id = COALESCE($1, customer_id),
         status = COALESCE($2, status),
         order_placement_date = COALESCE($3, order_placement_date)
         WHERE order_id = $4`,
        [
          orderData.customer_id,
          orderData.status,
          orderData.order_placement_date,
          orderId,
        ],
      );
    }

    if (items && Array.isArray(items)) {
      await client.query(`DELETE FROM order_lines WHERE order_id = $1`, [
        orderId,
      ]);

      for (let index = 0; index < items.length; index++) {
        const {
          product_id,
          order_qty,
          delivered_qty,
          actual_delivery_date,
          agreed_delivery_date,
        } = items[index];

        const orderLineId = `OL${Math.floor(10000 + Math.random() * 90000)}${index}`;

        // FIX CÚ PHÁP: Thêm $7 vào VALUES do có 7 cột được định nghĩa
        await client.query(
          `INSERT INTO order_lines (order_line_id, order_id, product_id, order_qty, delivered_qty, actual_delivery_date, agreed_delivery_date) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            orderLineId,
            orderId,
            product_id,
            order_qty,
            delivered_qty || 0,
            actual_delivery_date || null,
            agreed_delivery_date || null,
          ],
        );
      }
    }

    await client.query("COMMIT");
    return { order_id: orderId, message: "Cập nhật đơn hàng thành công" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`[updateOrderFull] ${err.message}`);
  } finally {
    client.release();
  }
}