const cache = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: null as null | any,
  lastUpdated: 0,
  ttl: 20_000,
};

export default cache;
