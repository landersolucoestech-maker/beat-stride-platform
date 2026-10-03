export interface OrganizationUnitOfWork {
  transaction<T>(work: () => Promise<T>): Promise<T>;
}
