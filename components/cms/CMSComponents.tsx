import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { Save, Send, Upload, Copy, Image, Video, Music, File } from 'lucide-react';

interface ActionButtonsProps {
  section: string;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function ActionButtons({ section, onSaveDraft, onPublish }: ActionButtonsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button onClick={onSaveDraft} variant="outline" size="sm">
        <Save className="w-4 h-4 mr-2" />
        保存草稿
      </Button>
      <Button onClick={onPublish} size="sm">
        <Send className="w-4 h-4 mr-2" />
        发布
      </Button>
    </div>
  );
}

interface MediaUploadZoneProps {
  onFileSelect?: (files: FileList) => void;
  accept?: string;
}

export function MediaUploadZone({ 
  onFileSelect, 
  accept = "image/*,video/*,audio/*,.pdf,.doc,.docx" 
}: MediaUploadZoneProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <Input
        type="file"
        multiple
        accept={accept}
        onChange={(e) => onFileSelect?.(e.target.files!)}
        className="hidden"
        id="media-upload"
      />
      <Label htmlFor="media-upload" className="cursor-pointer">
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900">点击上传文件</p>
        <p className="text-sm text-gray-500">支持图片、音频、视频、PDF和Word文档</p>
      </Label>
    </div>
  );
}

export function getFileIcon(type: string) {
  if (type?.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type?.startsWith('video/')) return <Video className="w-4 h-4" />;
  if (type?.startsWith('audio/')) return <Music className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

interface MediaFileCardProps {
  file: {
    name: string;
    url: string;
    type?: string;
    size?: number;
  };
  onDelete: (filename: string) => void;
}

export function MediaFileCard({ file, onDelete }: MediaFileCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      {file.type?.startsWith('image/') && (
        <img 
          src={file.url} 
          alt={file.name} 
          className="w-full h-32 object-cover rounded"
        />
      )}
      {file.type?.startsWith('video/') && (
        <video 
          src={file.url} 
          className="w-full h-32 object-cover rounded"
          controls
        />
      )}
      {file.type?.startsWith('audio/') && (
        <div className="w-full h-32 bg-gray-100 rounded flex flex-col items-center justify-center">
          <Music className="w-12 h-12 text-gray-400 mb-2" />
          <audio controls className="w-full">
            <source src={file.url} />
          </audio>
        </div>
      )}
      {!file.type?.startsWith('image/') && !file.type?.startsWith('video/') && !file.type?.startsWith('audio/') && (
        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
          {getFileIcon(file.type)}
        </div>
      )}
      
      <div className="space-y-1">
        <p className="text-sm font-medium truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          {getFileIcon(file.type)}
          <span>{file.size ? `${Math.round(file.size / 1024)}KB` : ''}</span>
        </p>
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={() => {
            navigator.clipboard.writeText(file.url);
            toast.success('链接已复制');
          }}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Copy className="w-4 h-4 mr-1" />
          复制
        </Button>
        <Button
          onClick={() => onDelete(file.name)}
          variant="destructive"
          size="sm"
        >
          删除
        </Button>
      </div>
    </div>
  );
}

interface ContentStatusIndicatorProps {
  status?: {
    hasDraft: boolean;
    hasPublished: boolean;
  };
}

export function ContentStatusIndicator({ status }: ContentStatusIndicatorProps) {
  if (!status) return null;

  return (
    <div className="flex items-center space-x-2">
      {status.hasDraft && !status.hasPublished && (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
          草稿
        </span>
      )}
      {status.hasPublished && (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          已发布
        </span>
      )}
      {status.hasDraft && status.hasPublished && (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          有更新
        </span>
      )}
    </div>
  );
}