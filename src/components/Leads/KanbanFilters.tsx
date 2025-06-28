
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface KanbanFiltersProps {
  tags: Tag[];
}

export function KanbanFilters({ tags }: KanbanFiltersProps) {
  return (
    <Card className="bg-goat-gray-800 border-goat-gray-700 p-3 lg:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
        <span className="text-white font-medium text-sm lg:text-base">Filtros:</span>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white focus:text-white text-xs lg:text-sm"
          >
            Todos os grupos
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant="outline"
              size="sm"
              className="text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white focus:text-white text-xs lg:text-sm"
            >
              <div className={`w-2 h-2 rounded-full ${tag.color} mr-1 lg:mr-2`}></div>
              {tag.name}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
