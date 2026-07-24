export interface Column {
  id: string;
  content: string;
  width?: number; // 1-12 for CSS grid columns
}

export interface ColumnLayout {
  id: string;
  name: string;
  template: string; // CSS grid template
  columns: Column[];
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  height?: string;
}