
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/types/kanban";

interface FiltersBarProps {
  tags: Tag[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FiltersBar({ tags, selectedFilter, onFilterChange }: FiltersBarProps) {
  return (
    <Card className="p-4 border-0" style={{ backgroundColor: '#080808' }}>
      <div className="flex items-center gap-4">
        <span className="text-white font-medium">Filtros:</span>
        <Button 
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          size="sm" 
          className={`${
            selectedFilter === 'all' 
              ? 'bg-goat-purple text-white hover:bg-goat-purple/80' 
              : 'text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white'
          } focus:text-white`}
          onClick={() => onFilterChange('all')}
        >
          Todos os grupos
        </Button>
        {tags.map((tag) => (
          <Button
            key={tag.id}
            variant={selectedFilter === tag.name ? 'default' : 'outline'}
            size="sm"
            className={`${
              selectedFilter === tag.name
                ? `${tag.color} text-white hover:${tag.color}/80`
                : 'text-white border-goat-gray-600 hover:bg-goat-gray-700 hover:text-white'
            } focus:text-white`}
            onClick={() => onFilterChange(tag.name)}
          >
            <div className={`w-2 h-2 rounded-full ${tag.color} mr-2`}></div>
            {tag.name}
          </Button>
        ))}
      </div>
    </Card>
  );
}
