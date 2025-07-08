
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTags, type Tag } from "@/hooks/useTags";

interface TagsManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultColors = [
  "bg-purple-600",
  "bg-blue-600", 
  "bg-green-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-orange-600"
];

export function TagsManagementModal({ open, onOpenChange }: TagsManagementModalProps) {
  const { tags, isLoading, createTag, updateTag, deleteTag } = useTags();
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(defaultColors[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      await createTag({
        name: newTagName.trim(),
        color: newTagColor
      });
      setNewTagName("");
      setNewTagColor(defaultColors[0]);
      setIsCreating(false);
    } catch (error) {
      console.error('Erro ao criar tag:', error);
    }
  };

  const handleEditTag = (tag: Tag) => setEditingTag({ ...tag });

  const handleSaveEdit = async () => {
    if (!editingTag || !editingTag.name.trim()) return;
    
    try {
      await updateTag(editingTag.id, {
        name: editingTag.name.trim(),
        color: editingTag.color
      });
      setEditingTag(null);
    } catch (error) {
      console.error('Erro ao editar tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId);
    } catch (error) {
      console.error('Erro ao deletar tag:', error);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-white">Carregando tags...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-goat-gray-800 border-goat-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Tags</DialogTitle>
          <DialogDescription className="text-goat-gray-400">
            Crie, edite ou remova tags para categorizar seus leads
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Create New Tag */}
          <Card className="bg-goat-gray-700 border-goat-gray-600 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">Nova Tag</h4>
              {!isCreating && (
                <Button 
                  size="sm"
                  onClick={() => setIsCreating(true)}
                  className="btn-primary h-8 px-4 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              )}
            </div>
            {isCreating && (
              <div className="space-y-3">
                <div>
                  <Label className="text-white">Nome da Tag</Label>
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Ex: Cliente VIP"
                    className="bg-goat-gray-600 border-goat-gray-500 text-white placeholder:text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Cor</Label>
                  <div className="flex gap-2 mt-2">
                    {defaultColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-8 h-8 rounded-full ${color} ${
                          newTagColor === color ? 'ring-2 ring-white' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTag} size="sm" className="btn-primary h-8 px-4 font-semibold">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsCreating(false);
                      setNewTagName("");
                      setNewTagColor(defaultColors[0]);
                    }} 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 text-white h-8 px-4 font-semibold"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Existing Tags */}
          <Card className="bg-goat-gray-700 border-goat-gray-600 p-4">
            <h4 className="font-medium text-white mb-3">Tags Existentes</h4>
            {tags.length === 0 ? (
              <p className="text-goat-gray-400 text-sm">Nenhuma tag criada ainda</p>
            ) : (
              <div className="space-y-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-3 bg-goat-gray-600 rounded-lg">
                    {editingTag?.id === tag.id ? (
                      <div className="flex items-center gap-3 flex-1">
                        <Input
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          className="bg-goat-gray-500 border-goat-gray-400 text-white placeholder:text-white"
                          placeholder="Editar nome da Tag"
                        />
                        <div className="flex gap-1">
                          {defaultColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setEditingTag({ ...editingTag, color })}
                              className={`w-6 h-6 rounded-full ${color} ${editingTag.color === color ? 'ring-2 ring-white' : ''}`}
                            />
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Button onClick={handleSaveEdit} size="sm" className="btn-primary h-8 px-4 font-semibold">
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={() => setEditingTag(null)} 
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white h-8 px-4 font-semibold"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Badge className={`${tag.color} text-white hover:${tag.color}`}>{tag.name}</Badge>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditTag(tag)}
                            size="sm"
                            className="btn-primary h-8 px-4 font-semibold"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteTag(tag.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white h-8 px-4 font-semibold"
                          >
                            Excluir
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
