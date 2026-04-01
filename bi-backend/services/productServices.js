import supabase from "../config/supabase.js";

const handleSingleError = (error, context) => {
  if (error.code === "PGRST116") return null;
  throw new Error(`[${context}] ${error.message}`);
};

export async function getProducts(
  page = 1,
  limit = 10,
  search = "",
  category = "",
) {
  try {
    let query = supabase.from("products").select("*", { count: "exact" });
    if (search) query = query.ilike("product_name", `%${search}%`);
    if (category) query = query.eq("category", category);

    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    query = query
      .range(fromIndex, toIndex)
      .order("product_name", { ascending: true });

    const { data, count, error } = await query;
    if (error) throw error;
    return {
      data: data || [],
      totalRecords: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    };
  } catch (error) {
    throw new Error(`[getProducts] ${err.message}`);
  }
}

export async function getProductById(productId) {
  try {
    if (!productId) throw Error(`[Empty Product Id Service] ${err.message}`);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("product_id", productId)
      .single();

    if (error) return handleSingleError(error, "getProductById");
    return data;
  } catch (error) {
    throw error
  }
}

export async function createProduct(productData) {
    try {
        const product_id = Math.floor(10000000 + Math.random() * 90000000).toString();
        
        const { data, error } = await supabase
            .from('products')
            .insert([{...productData, product_id}])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        throw new Error(`[createProduct] ${err.message}`);
    }
}

export async function updateProduct(productId, productData) {
    try {
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('product_id', productId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        throw new Error(`[updateProduct] ${err.message}`);
    }
}

export async function deleteProduct(productId) {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('product_id', productId);

        if (error) throw error;
        return true;
    } catch (err) {
        throw new Error(`[deleteProduct] ${err.message}`);
    }
}
