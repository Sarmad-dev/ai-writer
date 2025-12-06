import { useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartRenderer, ChartType, ChartDataPoint, ChartConfig } from '@/components/graphs';
import { GraphEditor } from '@/components/graphs/GraphEditor';
import { Trash2, Edit } from 'lucide-react';

export function GraphNodeView({ node, selected, deleteNode, updateAttributes }: NodeViewProps) {
  const { id, type, data, config } = node.attrs as {
    id: string;
    type: ChartType;
    data: ChartDataPoint[];
    config: ChartConfig;
  };

  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    if (deleteNode) {
      deleteNode();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (newType: ChartType, newData: ChartDataPoint[], newConfig: ChartConfig) => {
    if (updateAttributes) {
      updateAttributes({
        type: newType,
        data: newData,
        config: newConfig,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <NodeViewWrapper>
        <Card
          className={`p-4 my-4 ${selected ? 'ring-2 ring-primary' : ''}`}
          contentEditable={false}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Graph {id ? `(${id})` : ''}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ChartRenderer type={type} data={data} config={config} />
        </Card>
      </NodeViewWrapper>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-[80vw]! w-[80vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Graph {id ? `(${id})` : ''}</DialogTitle>
          </DialogHeader>
          <GraphEditor
            graphId={id}
            initialType={type}
            initialData={data}
            initialConfig={config}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
