import React, { useState } from 'react';
import { Grid, Layout, Eye, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { useLanguage } from '../../language/LanguageContext';
import { Column, ColumnLayout } from './types';
import { renderBasicMarkdown } from './helpers';

interface ColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnLayouts: ColumnLayout[];
  onInsert: (columns: Column[], template: string) => void;
}

export default function ColumnDialog({ 
  open, 
  onOpenChange, 
  columnLayouts, 
  onInsert 
}: ColumnDialogProps) {
  const { isZh } = useLanguage();
  const [selectedLayout, setSelectedLayout] = useState<string>('2-column');
  const [customColumns, setCustomColumns] = useState<Column[]>([
    { id: '1', content: '', width: 6 },
    { id: '2', content: '', width: 6 }
  ]);

  const updateColumnContent = (columnId: string, content: string) => {
    setCustomColumns(prev => 
      prev.map(col => col.id === columnId ? { ...col, content } : col)
    );
  };

  const handleLayoutChange = (layoutId: string) => {
    setSelectedLayout(layoutId);
    const layout = columnLayouts.find(l => l.id === layoutId);
    if (layout) {
      setCustomColumns(layout.columns.map(col => ({ ...col, content: '' })));
    }
  };

  const handleInsert = () => {
    const layout = columnLayouts.find(l => l.id === selectedLayout);
    if (layout) {
      onInsert(customColumns, layout.template);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        style={{ zIndex: 50001 }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layout className="w-5 h-5" />
            <span>{isZh ? '插入分栏布局' : 'Insert Column Layout'}</span>
          </DialogTitle>
          <DialogDescription>
            {isZh ? '选择一个分栏布局并配置内容' : 'Select a column layout and configure content'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={selectedLayout} onValueChange={handleLayoutChange} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            {columnLayouts.map(layout => (
              <TabsTrigger key={layout.id} value={layout.id} className="text-sm">
                {layout.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {columnLayouts.map(layout => (
            <TabsContent key={layout.id} value={layout.id} className="space-y-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${layout.columns.length}, 1fr)` }}>
                {customColumns.map((column, index) => (
                  <Card key={column.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Grid className="w-4 h-4" />
                        <span>{isZh ? `第 ${index + 1} 栏` : `Column ${index + 1}`}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm text-gray-600">
                          {isZh ? '栏宽度 (1-12)' : 'Column Width (1-12)'}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          value={column.width}
                          onChange={(e) => {
                            const width = parseInt(e.target.value) || 1;
                            setCustomColumns(prev => 
                              prev.map(col => col.id === column.id ? { ...col, width } : col)
                            );
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">
                          {isZh ? '内容' : 'Content'}
                        </Label>
                        <Textarea
                          value={column.content}
                          onChange={(e) => updateColumnContent(column.id, e.target.value)}
                          placeholder={isZh ? '输入此栏的内容...' : 'Enter content for this column...'}
                          rows={6}
                          className="mt-1 text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 预览 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{isZh ? '布局预览' : 'Layout Preview'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`grid gap-4 ${layout.template} border border-gray-200 rounded-lg p-4`}
                  >
                    {customColumns.map(column => (
                      <div key={column.id} className="border border-gray-300 rounded p-3 min-h-[100px] bg-gray-50">
                        <div className="text-xs text-gray-500 mb-2">
                          {isZh ? `宽度: ${column.width}` : `Width: ${column.width}`}
                        </div>
                        <div 
                          className="text-sm prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: renderBasicMarkdown(column.content || (isZh ? '此栏内容...' : 'Column content...'))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {isZh ? '取消' : 'Cancel'}
                </Button>
                <Button onClick={handleInsert}>
                  {isZh ? '插入分栏' : 'Insert Columns'}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}