import { useState, useMemo } from "react";
import { Hotel } from "./types";
import { HotelCard } from "./HotelCard";
import { HotelTable } from "./HotelTable";
import { HotelFilters } from "./HotelFilters";
import { HotelListingHeader } from "./HotelListingHeader";
import { CategoryTabs } from "./CategoryTabs";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus } from "lucide-react";

interface HotelListingPageProps {
  hotels: Hotel[];
  onViewHotel: (hotel: Hotel) => void;
  onAddNew: () => void;
}

interface FiltersState {
  priceRange: [number, number];
  placeTypes: string[];
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  propertyTypes: string[];
}

const ITEMS_PER_PAGE_OPTIONS = [6, 9, 12, 24];

export const HotelListingPage = ({
  hotels,
  onViewHotel,
  onAddNew,
}: HotelListingPageProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [filters, setFilters] = useState<FiltersState>({
    priceRange: [0, 50000],
    placeTypes: [],
    bedrooms: null,
    beds: null,
    bathrooms: null,
    propertyTypes: [],
  });

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
    if (filters.placeTypes.length > 0) count++;
    if (filters.bedrooms !== null) count++;
    if (filters.beds !== null) count++;
    if (filters.bathrooms !== null) count++;
    if (filters.propertyTypes.length > 0) count++;
    return count;
  }, [filters]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    hotels.forEach((hotel) => {
      const category = hotel.category.toLowerCase().replace(/\s+/g, "-");
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [hotels]);

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // Filter by category
    if (selectedCategory) {
      result = result.filter(
        (hotel) =>
          hotel.category.toLowerCase().replace(/\s+/g, "-") === selectedCategory
      );
    }

    // Filter by price range
    result = result.filter((hotel) => {
      const minPrice = hotel.roomTypes.reduce((min, room) => {
        const roomMin = room.plans.reduce(
          (pMin, plan) => Math.min(pMin, plan.discountedPrice),
          Infinity
        );
        return Math.min(min, roomMin);
      }, Infinity);
      return (
        minPrice >= filters.priceRange[0] && minPrice <= filters.priceRange[1]
      );
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => {
          const aMin = a.roomTypes.reduce(
            (min, r) =>
              Math.min(
                min,
                r.plans.reduce((m, p) => Math.min(m, p.discountedPrice), Infinity)
              ),
            Infinity
          );
          const bMin = b.roomTypes.reduce(
            (min, r) =>
              Math.min(
                min,
                r.plans.reduce((m, p) => Math.min(m, p.discountedPrice), Infinity)
              ),
            Infinity
          );
          return aMin - bMin;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const aMin = a.roomTypes.reduce(
            (min, r) =>
              Math.min(
                min,
                r.plans.reduce((m, p) => Math.min(m, p.discountedPrice), Infinity)
              ),
            Infinity
          );
          const bMin = b.roomTypes.reduce(
            (min, r) =>
              Math.min(
                min,
                r.plans.reduce((m, p) => Math.min(m, p.discountedPrice), Infinity)
              ),
            Infinity
          );
          return bMin - aMin;
        });
        break;
      default:
        // Latest - keep original order
        break;
    }

    return result;
  }, [hotels, selectedCategory, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const paginatedHotels = filteredHotels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 50000],
      placeTypes: [],
      bedrooms: null,
      beds: null,
      bathrooms: null,
      propertyTypes: [],
    });
    setSelectedCategory(null);
  };

  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Hotels Yet</h2>
        <p className="text-muted-foreground mb-6">Start by adding your first hotel</p>
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Hotel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <HotelListingHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onAddNew={onAddNew}
        totalResults={filteredHotels.length}
        location="India"
      />

      {/* Category Tabs */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage(1);
        }}
        categoryCounts={categoryCounts}
      />

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Hotel Grid/Table */}
        <div className="flex-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onView={onViewHotel} />
              ))}
            </div>
          ) : (
            <HotelTable hotels={paginatedHotels} onView={onViewHotel} />
          )}

          {paginatedHotels.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <p className="text-muted-foreground">
                No hotels match your current filters
              </p>
              <Button variant="link" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(v) => {
                    setItemsPerPage(Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Filters Sidebar */}
        <div className="hidden lg:block w-[300px] shrink-0">
          <HotelFilters
            filters={filters}
            onFiltersChange={(f) => {
              setFilters(f);
              setCurrentPage(1);
            }}
            onClearAll={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>
    </div>
  );
};
