// getFiltersMapped.ts
export const getFiltersMapped = (filter: any) => {
  const filterMapped = {
    ...filter,
    page: Number(filter.page) || 0,
    limit: Number(filter.limit) || 10,
    sortBy: filter.sortBy || 'createdAt',
    order: filter.order || 'asc',
  }

  return filterMapped
}
