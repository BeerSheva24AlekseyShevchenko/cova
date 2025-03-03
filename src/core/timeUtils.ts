const time_units = {
  h: 3600 * 1000,
  d: 3600 * 1000 * 24,
  m: 60 * 1000,
  s: 1000,
  ms: 1,
};

export const getExpiration = (value: string) => {
  const amount = value.split(/\D/)[0];
  const parseArray = value.split(/\d/);
  const index = parseArray.findIndex((e) => !!e.trim());
  const unit = parseArray[index] as keyof typeof time_units ;
  const unitValue = time_units[unit];
  if (!unitValue) {
      throw new Error(`Wrong configuration: unit ${unit} doesn't exist`);
  }
  return +amount * unitValue ;
};