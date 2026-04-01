import supabase from "../config/supabase.js";

export async function getCustomers(page = 1, limit = 10, city = "") {
  try {
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 10;

    let query = supabase
      .from("customer")
      .select("*, target_orders(ontime_target, infull_target, otif_target)", {
        count: "estimated",
      });

    if (city && city.trim() !== "") {
      query = query.ilike("city", `%${city.trim()}%`);
    }

    const fromIndex = (parsedPage - 1) * parsedLimit;
    const toIndex = fromIndex + parsedLimit - 1;

    query = query
      .range(fromIndex, toIndex)
      .order("customer_name", { ascending: true });

    const { data, count, error } = await query;
    if (error) throw error;

    const formattedData = (data || []).map((item) => {
      const rawTarget = item.target_orders;

      const targetData = {
        infull: rawTarget ? rawTarget.infull_target : 0,
        ontime: rawTarget ? rawTarget.ontime_target : 0,
        otif: rawTarget ? rawTarget.otif_target : 0,
      };
      const { target_orders, ...basicInfo } = item;

      return {
        ...basicInfo,
        target: targetData, 
      };
    });

    return {
      data: formattedData,
      totalRecords: count || 0,
      totalPages: count ? Math.ceil(count / parsedLimit) : 0,
    };
  } catch (err) {
    throw new Error(`[getCustomers] Lỗi: ${err.message}`);
  }
}
export async function getCustomersPaginated(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("customer")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      data: data || [],
      page,
      total: count || 0,
      totalPages: Math.ceil(count / limit),
    };
  } catch (err) {
    throw new Error(`[getCustomersPaginated] ${err.message}`);
  }
}
export async function createCustomer(payload) {
  const { customer_name, city, target } = payload;

  const customer_id = Math.floor(100000 + Math.random() * 900000).toString();

  const { data: customerData, error: customerError } = await supabase
    .from("customer")
    .insert([
      {
        customer_id,
        customer_name,
        city,
      },
    ])
    .select()
    .single();

  if (customerError) throw customerError;

  const { error: targetError } = await supabase.from("target_orders").insert([
    {
      customer_id: customer_id,
      infull_target: target.infull,
      ontime_target: target.ontime,
      otif_target: target.otif,
    },
  ]);

  if (targetError) {
    await supabase.from("customer").delete().eq("customer_id", customer_id);

    throw new Error(
      `Lỗi khi lưu chỉ số target, đã rollback. Chi tiết: ${targetError.message}`,
    );
  }

  return {
    ...customerData,
    target: target,
  };
}
export async function updateCustomer(id, customer) {
  const { data, error } = await supabase
    .from("customer")
    .update(customer)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}
export async function deleteCustomer(id) {
  const { error } = await supabase
    .from("customer")
    .delete()
    .eq("customer_id", id);

  if (error) throw error;

  return true;
}
