export default async (req) => {
  const data = await req.json();

  await fetch("http://kafka-rest-proxy/topics/order_lines", {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.kafka.json.v2+json",
    },
    body: JSON.stringify({
      records: [{ value: data }],
    }),
  });

  return new Response("OK");
};