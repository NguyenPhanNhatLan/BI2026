import { useEffect, useState } from "react";

interface FilterParams {
  city?: string;
}
export default function useCustomers(
  filter: FilterParams,
  page: number,
  limit: number,
  refreshTrigger: number = 0,
) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (filter.city) params.append("city", filter.city);

        const res = await fetch(
          `http://localhost:5001/customers?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error("Error Server Connection");

        const json = await res.json();

        if (json.success) {
          setCustomers(json.data);
          setMeta(json.meta);
        } else {
          throw new Error(json.message);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();

    return () => controller.abort(); 
  }, [JSON.stringify(filter), page, limit, refreshTrigger]);

  return { customers, meta, isLoading, error };
}
