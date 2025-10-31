export function parseArray(thing: unknown): unknown[] {
  if (!Array.isArray(thing)) {
    throw new Error(`Expected value to be an array: ${JSON.stringify(thing)}`);
  }
  return thing;
}

export function parseObject(thing: unknown) {
  if (!thing || typeof thing !== "object" || Array.isArray(thing)) {
    throw new Error(`expected value to be an object: ${JSON.stringify(thing)}`);
  }

  const obj = thing as Record<string, unknown>;

  return {
    prop<T>(key: string, parser: (value: unknown) => T) {
      return parser(obj[key]);
    },
    optionalProp<T>(key: string, parser: (value: unknown) => T): T | undefined {
      try {
        return parser(obj[key]);
      } catch {}
    },
  };
}

export function parseString(thing: unknown): string {
  if (thing && typeof thing === "string") {
    return thing;
  }
  throw new Error(
    `Expect value to be of type "string", got ${typeof thing}: ${JSON.stringify(thing)}`,
  );
}

export function parseNumber(thing: unknown): number {
  if (thing && typeof thing === "number") {
    return thing;
  }
  throw new Error(
    `Expect value to be of type "number", got ${typeof thing}: ${JSON.stringify(thing)}`,
  );
}

export function parseDate(thing: unknown): Date {
  const stringValue = parseString(thing);
  const date = new Date(stringValue);
  if (date.toString() === "Invalid Date") {
    throw new Error(
      `Failed to parse "${thing}" as Date: ${JSON.stringify(thing)}`,
    );
  }
  return date;
}
