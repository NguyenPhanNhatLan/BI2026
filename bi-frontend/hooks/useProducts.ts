import { clear } from "console";
import { useEffect, useState } from "react";

export function useProducts(
  page: number,
  limit: number = 10,
  search: string = "",
) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState<any>(null);
  const [error, setError] = useState<null | string>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const reloadData = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) params.append("search", search);

        const res = await fetch(
          `http://localhost:5001/products?${params.toString()}`,
        );

        if (!res.ok) throw new Error("Error Server Connection");

        const json = await res.json();

        if (json.success) {
          setProducts(json.data);
          setMeta(json.meta);
        } else throw new Error(json.message);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, limit, search, refreshTrigger]);
  
  return { products, meta, isLoading, error, reloadData };
}
