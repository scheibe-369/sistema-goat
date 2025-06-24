
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tag {
  id: number;
  name: string;
  color: string;
}

export default function Settings() {
  const [tags, setTags] = useState<Tag[]>([
    { id: 1, name: "Lead", color: "bg-blue-500" },
    { id: 2, name: "Cliente", color: "bg-green-500" },
    { id: 3, name: "Prospect", color: "bg-yellow-500" }
  ]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("bg-blue-500");
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");
  const { toast } = useToast();

  const colorOptions = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500"
  ];

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da tag é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const newTag: Tag = {
      id: tags.length + 1,
      name: newTagName.trim(),
      color: newTagColor
    };

    setTags([...tags, newTag]);
    setNewTagName("");
    setNewTagColor("bg-blue-500");
    
    toast({
      title: "Tag criada",
      description: `A tag "${newTag.name}" foi criada com sucesso`
    });
  };

  const handleDeleteTag = (tagId: number) => {
    const tagToDelete = tags.find(tag => tag.id === tagId);
    setTags(tags.filter(tag => tag.id !== tagId));
    
    toast({
      title: "Tag removida",
      description: `A tag "${tagToDelete?.name}" foi removida`
    });
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };

  const handleSaveEdit = () => {
    if (!editTagName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da tag é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setTags(tags.map(tag => 
      tag.id === editingTag 
        ? { ...tag, name: editTagName.trim(), color: editTagColor }
        : tag
    ));

    setEditingTag(null);
    setEditTagName("");
    setEditTagColor("");
    
    toast({
      title: "Tag atualizada",
      description: "A tag foi atualizada com sucesso"
    });
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditTagName("");
    setEditTagColor("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-goat-gray-400">Gerencie as configurações do sistema</p>
        </div>
      </div>

      {/* Tags Management */}
      <Card className="bg-goat-gray-800 border-goat-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-goat-purple" />
          <h2 className="text-xl font-semibold text-white">Gerenciar Tags</h2>
        </div>

        {/* Add New Tag */}
        <div className="mb-6 p-4 bg-goat-gray-900/50 rounded-lg border border-goat-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Adicionar Nova Tag</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Nome da tag..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="bg-goat-gray-700 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="px-3 py-2 bg-goat-gray-700 border border-goat-gray-600 rounded-md text-white"
              >
                {colorOptions.map((color) => (
                  <option key={color} value={color}>
                    {color.replace('bg-', '').replace('-500', '')}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAddTag}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        {/* Tags List */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white">Tags Existentes</h3>
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-3 bg-goat-gray-900/30 rounded-lg border border-goat-gray-700">
              {editingTag === tag.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <Input
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    className="bg-goat-gray-700 border-goat-gray-600 text-white max-w-xs"
                  />
                  <select
                    value={editTagColor}
                    onChange={(e) => setEditTagColor(e.target.value)}
                    className="px-3 py-2 bg-goat-gray-700 border border-goat-gray-600 rounded-md text-white"
                  >
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color.replace('bg-', '').replace('-500', '')}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEdit}
                      size="sm"
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="outline"
                      className="btn-outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Badge className={`${tag.color} text-white`}>
                      {tag.name}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditTag(tag)}
                      size="sm"
                      variant="outline"
                      className="btn-outline"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteTag(tag.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
