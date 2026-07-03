const TEST_SUFFIX = "_test";

function withDatabaseName(url: string, transform: (name: string) => string): string {
  const parsed = new URL(url);
  const currentName = parsed.pathname.replace(/^\//, "");
  parsed.pathname = `/${transform(currentName)}`;
  return parsed.toString();
}

// Returns a connection URL pointing at the disposable integration-test database.
// Idempotent: passing an already-test URL returns it unchanged.
export function deriveTestDatabaseUrl(url: string): string {
  return withDatabaseName(url, (name) =>
    name.endsWith(TEST_SUFFIX) ? name : `${name}${TEST_SUFFIX}`,
  );
}

// Returns a connection URL pointing at the real (admin) database, used to
// CREATE/DROP the disposable test database. Idempotent.
export function deriveAdminDatabaseUrl(url: string): string {
  return withDatabaseName(url, (name) =>
    name.endsWith(TEST_SUFFIX) ? name.slice(0, -TEST_SUFFIX.length) : name,
  );
}

export function databaseNameFromUrl(url: string): string {
  return new URL(url).pathname.replace(/^\//, "");
}
