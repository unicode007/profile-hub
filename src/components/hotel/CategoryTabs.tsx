import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Home,
  TreePine,
  Tent,
  Building2,
  Mountain,
  Waves,
  Castle,
  Warehouse,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRef } from "react";

interface CategoryTabsProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES = [
  { id: "cabin", label: "Cabin", icon: Home },
  { id: "country-side", label: "Country Side", icon: TreePine },
  { id: "tiny-homes", label: "Tiny Homes", icon: Warehouse },
  { id: "farm-houses", label: "Farm Houses", icon: Home },
  { id: "camping", label: "Camping", icon: Tent },
  { id: "iconic-cities", label: "Iconic Cities", icon: Building2 },
  { id: "lake-front", label: "Lake Front", icon: Waves },
  { id: "mountain", label: "Mountain", icon: Mountain },
  { id: "heritage", label: "Heritage", icon: Castle },
];

export const CategoryTabs = ({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="shrink-0 rounded-full"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const count = categoryCounts[category.id] || 0;
          const isSelected = selectedCategory === category.id;

          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className={`shrink-0 gap-2 rounded-full ${
                isSelected ? "" : "bg-card hover:bg-muted"
              }`}
              onClick={() =>
                onCategoryChange(isSelected ? null : category.id)
              }
            >
              <Icon className="h-4 w-4" />
              {category.label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="shrink-0 rounded-full"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
