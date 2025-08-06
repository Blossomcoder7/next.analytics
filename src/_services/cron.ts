export default async function cron() {
  console.log(`running proxy service to check idle connections`);
  try {
    const [a, b] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/check-idle`, {
        method: "get",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/update-ga`, {
        method: "get",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      }),
    ]);
    console.log({ a, b });
  } catch (error) {
    console.log(`Error while running proxy cron service :`, error);
  }
}
