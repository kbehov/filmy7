import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

type SmartPaginationProps = {
  meta: {
    currentPage: number
    totalPages: number
  }
  baseUrl?: string
  searchUrl?: string
  /**
   * When true, page is encoded as a search param on `baseUrl`, e.g. `/catalog?page=2&sort=-views`.
   * `extraQuery` is merged in (no leading `?`). Page 1 omits the `page` param.
   */
  pageInSearchParams?: boolean
  /** Appended to each pagination href (no leading `?`). Example: `sort=-views&year=2020`. */
  extraQuery?: string
  className?: string
  maxPages?: number
}

function appendQuery(path: string, extraQuery?: string) {
  if (!extraQuery) return path
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}${extraQuery}`
}
// Smart Pagination Component that uses metadata
function SmartPagination({
  meta,
  baseUrl = '/page',
  searchUrl,
  pageInSearchParams,
  extraQuery,
  className,
  maxPages = 7,
}: SmartPaginationProps) {
  const { currentPage = 1, totalPages = 1 } = meta

  if (totalPages <= 1) return null

  const generatePageNumbers = () => {
    const pages = []
    const half = Math.floor(maxPages / 2)

    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxPages - 1)

    // Adjust start if we're near the end
    if (end === totalPages) {
      start = Math.max(1, end - maxPages + 1)
    }

    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('ellipsis-start')
      }
    }

    // Add visible page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis-end')
      }
      pages.push(totalPages)
    }

    return pages
  }

  const buildUrl = (pageNum: number) => {
    if (pageInSearchParams) {
      const params = new URLSearchParams()
      if (pageNum > 1) params.set('page', String(pageNum))
      if (extraQuery) {
        const more = new URLSearchParams(extraQuery)
        more.forEach((v, k) => params.set(k, v))
      }
      const qs = params.toString()
      return qs ? `${baseUrl}?${qs}` : baseUrl
    }

    if (searchUrl) {
      const raw = pageNum === 1 ? searchUrl.replace(/[?&]page=\d+/, '') : `${searchUrl}=${pageNum}`
      return appendQuery(raw, extraQuery)
    }

    // For page 1, determine the correct base URL
    if (pageNum === 1) {
      // If baseUrl ends with '/page', remove it to get the base path
      if (baseUrl.endsWith('/page')) {
        const basePath = baseUrl.replace('/page', '')
        // If basePath is empty, return '/' for home page
        return appendQuery(basePath || '/', extraQuery)
      }
      // Otherwise use the baseUrl as is
      return appendQuery(baseUrl, extraQuery)
    }

    return appendQuery(`${baseUrl}/${pageNum}`, extraQuery)
  }

  const pages = generatePageNumbers()

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Previous Button */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildUrl(currentPage - 1)} />
          </PaginationItem>
        )}

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          const isActive = page === currentPage
          const href = buildUrl(page as number)

          return (
            <PaginationItem key={page}>
              <PaginationLink href={href} isActive={isActive}>
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        {/* Next Button */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={buildUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}

export default SmartPagination
