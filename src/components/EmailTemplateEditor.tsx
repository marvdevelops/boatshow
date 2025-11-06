import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import {
  Mail,
  Save,
  Eye,
  Code,
  Palette,
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Link as LinkIcon,
  Layout,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileCode,
  Columns,
  RotateCcw,
  Settings,
} from 'lucide-react';

interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'button' | 'image' | 'divider' | 'spacer' | 'columns' | 'footer';
  content: {
    text?: string;
    htmlContent?: string;
    useHtml?: boolean;
    heading?: string;
    subheading?: string;
    buttonText?: string;
    buttonUrl?: string;
    imageUrl?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
    headerWidth?: number;
    headerHeight?: number;
    height?: number;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: number;
    padding?: number;
    columns?: EmailBlock[][];
  };
}

interface EmailTemplate {
  name: string;
  subject: string;
  blocks: EmailBlock[];
  settings: {
    backgroundColor: string;
    contentWidth: number;
    fontFamily: string;
  };
}

interface EmailTemplateEditorProps {
  category: 'media' | 'trade' | 'captain' | 'vip';
  type: 'approved' | 'rejected';
  onSave: (template: any) => void;
  initialTemplate?: any;
}

export function EmailTemplateEditor({ category, type, onSave, initialTemplate }: EmailTemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate>({
    name: `${category} - ${type}`,
    subject: '',
    blocks: [],
    settings: {
      backgroundColor: '#f4f4f4',
      contentWidth: 600,
      fontFamily: 'Arial, sans-serif',
    },
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'design' | 'code' | 'preview'>('design');
  const [htmlCode, setHtmlCode] = useState('');

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  useEffect(() => {
    setHtmlCode(generateHTML());
  }, [template]);

  const blockTemplates = [
    {
      type: 'header' as const,
      name: 'Header',
      icon: Layout,
      description: 'Hero section with heading',
      defaultContent: {
        heading: 'Welcome to Qatar Boat Show 2025',
        subheading: 'The Premier Marine Event',
        backgroundColor: '#0A2647',
        textColor: '#ffffff',
        alignment: 'center' as const,
        padding: 40,
        headerWidth: 600,
        headerHeight: 200,
      },
    },
    {
      type: 'text' as const,
      name: 'Text Block',
      icon: Type,
      description: 'Paragraph text',
      defaultContent: {
        text: 'Add your message here...',
        htmlContent: '',
        useHtml: false,
        textColor: '#333333',
        alignment: 'left' as const,
        fontSize: 16,
        padding: 20,
      },
    },
    {
      type: 'button' as const,
      name: 'Button',
      icon: Square,
      description: 'Call-to-action button',
      defaultContent: {
        buttonText: 'Click Here',
        buttonUrl: 'https://example.com',
        buttonColor: '#D4AF37',
        buttonTextColor: '#0A2647',
        alignment: 'center' as const,
        padding: 20,
      },
    },
    {
      type: 'image' as const,
      name: 'Image',
      icon: ImageIcon,
      description: 'Image block',
      defaultContent: {
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
        imageAlt: 'Image',
        imageWidth: 600,
        imageHeight: 400,
        alignment: 'center' as const,
        padding: 20,
      },
    },
    {
      type: 'divider' as const,
      name: 'Divider',
      icon: Minus,
      description: 'Horizontal line',
      defaultContent: {
        backgroundColor: '#D4AF37',
        height: 2,
        padding: 20,
      },
    },
    {
      type: 'spacer' as const,
      name: 'Spacer',
      icon: Columns,
      description: 'Empty space',
      defaultContent: {
        height: 40,
      },
    },
    {
      type: 'footer' as const,
      name: 'Footer',
      icon: AlignCenter,
      description: 'Email footer',
      defaultContent: {
        text: '© 2025 Qatar Boat Show. All rights reserved.',
        textColor: '#666666',
        backgroundColor: '#f9f9f9',
        alignment: 'center' as const,
        fontSize: 12,
        padding: 30,
      },
    },
  ];

  const addBlock = (type: EmailBlock['type']) => {
    const blockTemplate = blockTemplates.find((b) => b.type === type);
    if (!blockTemplate) return;

    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type,
      content: { ...blockTemplate.defaultContent },
    };

    setTemplate((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));

    setSelectedBlockId(newBlock.id);
    toast.success('Block added');
  };

  const updateBlock = (id: string, content: Partial<EmailBlock['content']>) => {
    setTemplate((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === id ? { ...block, content: { ...block.content, ...content } } : block
      ),
    }));
  };

  const deleteBlock = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((block) => block.id !== id),
    }));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    toast.success('Block deleted');
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setTemplate((prev) => {
      const blocks = [...prev.blocks];
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return prev;

      if (direction === 'up' && index > 0) {
        [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
      } else if (direction === 'down' && index < blocks.length - 1) {
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      }

      return { ...prev, blocks };
    });
  };

  const duplicateBlock = (id: string) => {
    const block = template.blocks.find((b) => b.id === id);
    if (!block) return;

    const newBlock: EmailBlock = {
      ...block,
      id: `block-${Date.now()}`,
    };

    setTemplate((prev) => {
      const index = prev.blocks.findIndex((b) => b.id === id);
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return { ...prev, blocks: newBlocks };
    });

    toast.success('Block duplicated');
  };

  const generateHTML = () => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.subject || 'Email Template'}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: ${template.settings.fontFamily};
            background-color: ${template.settings.backgroundColor};
        }
        .email-container {
            max-width: ${template.settings.contentWidth}px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
        }
        a {
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
`;

    template.blocks.forEach((block) => {
      html += generateBlockHTML(block);
    });

    html += `    </div>
</body>
</html>`;

    return html;
  };

  const generateBlockHTML = (block: EmailBlock): string => {
    const { content } = block;

    switch (block.type) {
      case 'header':
        const headerStyle = content.headerWidth && content.headerHeight 
          ? `background-color: ${content.backgroundColor}; color: ${content.textColor}; padding: ${content.padding}px; text-align: ${content.alignment}; width: ${content.headerWidth}px; min-height: ${content.headerHeight}px;`
          : `background-color: ${content.backgroundColor}; color: ${content.textColor}; padding: ${content.padding}px; text-align: ${content.alignment};`;
        return `        <div style="${headerStyle}">
            <h1 style="margin: 0 0 10px 0; font-size: 32px;">${content.heading || ''}</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">${content.subheading || ''}</p>
        </div>
`;

      case 'text':
        const textContent = content.useHtml && content.htmlContent 
          ? content.htmlContent 
          : `<p style="margin: 0; color: ${content.textColor}; font-size: ${content.fontSize}px; line-height: 1.6;">${content.text || ''}</p>`;
        return `        <div style="padding: ${content.padding}px; text-align: ${content.alignment};">
            ${textContent}
        </div>
`;

      case 'button':
        return `        <div style="padding: ${content.padding}px; text-align: ${content.alignment};">
            <a href="${content.buttonUrl || '#'}" style="display: inline-block; padding: 15px 40px; background-color: ${content.buttonColor}; color: ${content.buttonTextColor}; border-radius: 5px; font-size: 16px; font-weight: bold;">${content.buttonText || 'Button'}</a>
        </div>
`;

      case 'image':
        const imgStyle = content.imageWidth && content.imageHeight
          ? `margin: 0 auto; width: ${content.imageWidth}px; height: ${content.imageHeight}px;`
          : `margin: 0 auto; max-width: 100%;`;
        return `        <div style="padding: ${content.padding}px; text-align: ${content.alignment};">
            <img src="${content.imageUrl || ''}" alt="${content.imageAlt || ''}" style="${imgStyle}">
        </div>
`;

      case 'divider':
        return `        <div style="padding: ${content.padding}px 0;">
            <hr style="border: none; border-top: ${content.height}px solid ${content.backgroundColor}; margin: 0;">
        </div>
`;

      case 'spacer':
        return `        <div style="height: ${content.height}px;"></div>
`;

      case 'footer':
        return `        <div style="background-color: ${content.backgroundColor}; color: ${content.textColor}; padding: ${content.padding}px; text-align: ${content.alignment};">
            <p style="margin: 0; font-size: ${content.fontSize}px;">${content.text || ''}</p>
        </div>
`;

      default:
        return '';
    }
  };

  const handleSave = () => {
    const templateData = {
      name: template.name,
      subject: template.subject,
      html: generateHTML(),
      blocks: template.blocks,
      settings: template.settings,
    };

    onSave(templateData);
    toast.success('✅ Template saved successfully!');
  };

  const selectedBlock = template.blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Mail className="w-5 h-5 text-[#0A2647]" />
          <div>
            <h2 className="text-[#0A2647] text-lg">Email Template Editor</h2>
            <p className="text-sm text-gray-600">
              {category} - {type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="design" className="gap-2">
                <Palette className="w-4 h-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <FileCode className="w-4 h-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="h-8" />

          <Button onClick={handleSave} className="bg-[#D4AF37] hover:bg-[#C9A54A] text-[#0A2647]">
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Design View */}
        {viewMode === 'design' && (
          <>
            {/* Left Sidebar - Blocks */}
            <div className="w-64 bg-white border-r flex flex-col">
              <div className="p-4 border-b">
                <h3 className="text-sm text-[#0A2647] flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Content Blocks
                </h3>
                <p className="text-xs text-gray-500 mt-1">Drag or click to add</p>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {blockTemplates.map((blockTemplate) => {
                    const Icon = blockTemplate.icon;
                    return (
                      <button
                        key={blockTemplate.type}
                        onClick={() => addBlock(blockTemplate.type)}
                        className="w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-white group-hover:bg-blue-100 border border-gray-200 group-hover:border-blue-300 rounded flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{blockTemplate.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{blockTemplate.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTemplate({ ...template, blocks: [] })}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Clear All Blocks
                </Button>
              </div>
            </div>

            {/* Center Canvas */}
            <div className="flex-1 overflow-auto" style={{ backgroundColor: template.settings.backgroundColor }}>
              <div className="p-8">
                <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
                  <Label htmlFor="subject" className="text-sm text-gray-700 mb-2 block">
                    Email Subject Line
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject..."
                    value={template.subject}
                    onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                    className="text-lg"
                  />
                </div>

                <div
                  className="mx-auto bg-white shadow-lg"
                  style={{ maxWidth: template.settings.contentWidth }}
                >
                  {template.blocks.length === 0 ? (
                    <div className="p-16 text-center border-2 border-dashed border-gray-300 rounded-lg">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Your email is empty</p>
                      <p className="text-sm text-gray-500">Add blocks from the left sidebar to start designing</p>
                    </div>
                  ) : (
                    template.blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className={`relative group ${
                          selectedBlockId === block.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedBlockId(block.id)}
                      >
                        {/* Block Content */}
                        <div dangerouslySetInnerHTML={{ __html: generateBlockHTML(block) }} />

                        {/* Block Controls Overlay */}
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1 bg-white rounded shadow-lg border">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(block.id, 'up');
                              }}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(block.id, 'down');
                              }}
                              disabled={index === template.blocks.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateBlock(block.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBlock(block.id);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-80 bg-white border-l flex flex-col">
              <div className="p-4 border-b">
                <h3 className="text-sm text-[#0A2647] flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {selectedBlock ? 'Block Settings' : 'Email Settings'}
                </h3>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {selectedBlock ? (
                    <BlockEditor block={selectedBlock} onUpdate={(content) => updateBlock(selectedBlock.id, content)} />
                  ) : (
                    <EmailSettings
                      settings={template.settings}
                      onUpdate={(settings) => setTemplate({ ...template, settings: { ...template.settings, ...settings } })}
                    />
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Code View */}
        {viewMode === 'code' && (
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-[#0A2647] flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  HTML Source Code
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <Textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="font-mono text-sm h-full resize-none"
                  placeholder="HTML code will appear here..."
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview View */}
        {viewMode === 'preview' && (
          <div className="flex-1 p-6 bg-gray-100">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Subject:</p>
                      <p className="text-[#0A2647]">{template.subject || 'No subject'}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Preview Mode</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <iframe
                  srcDoc={htmlCode}
                  className="w-full h-[calc(100vh-200px)] border-0"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Block Editor Component
function BlockEditor({ block, onUpdate }: { block: EmailBlock; onUpdate: (content: any) => void }) {
  const { content, type } = block;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-xs text-blue-800 uppercase tracking-wide">
          {type} Block
        </p>
      </div>

      {(type === 'header' || type === 'footer' || type === 'text') && (
        <>
          {type === 'header' && (
            <>
              <div>
                <Label className="text-xs text-gray-700">Heading</Label>
                <Input
                  value={content.heading || ''}
                  onChange={(e) => onUpdate({ heading: e.target.value })}
                  placeholder="Enter heading..."
                />
              </div>
              <div>
                <Label className="text-xs text-gray-700">Subheading</Label>
                <Input
                  value={content.subheading || ''}
                  onChange={(e) => onUpdate({ subheading: e.target.value })}
                  placeholder="Enter subheading..."
                />
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-gray-700 mb-2 block flex items-center gap-2">
                  <Layout className="w-3 h-3" />
                  Header Dimensions
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">Width (px)</Label>
                    <Input
                      type="number"
                      value={content.headerWidth || 600}
                      onChange={(e) => onUpdate({ headerWidth: parseInt(e.target.value) || 600 })}
                      placeholder="600"
                      min="200"
                      max="800"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Height (px)</Label>
                    <Input
                      type="number"
                      value={content.headerHeight || 200}
                      onChange={(e) => onUpdate({ headerHeight: parseInt(e.target.value) || 200 })}
                      placeholder="200"
                      min="100"
                      max="500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Recommended: 600 × 200px</p>
              </div>
            </>
          )}

          {type === 'text' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-gray-700">Content Mode</Label>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={!content.useHtml ? 'default' : 'outline'}
                    onClick={() => onUpdate({ useHtml: false })}
                    className="h-7 text-xs"
                  >
                    <Type className="w-3 h-3 mr-1" />
                    Text
                  </Button>
                  <Button
                    size="sm"
                    variant={content.useHtml ? 'default' : 'outline'}
                    onClick={() => onUpdate({ useHtml: true })}
                    className="h-7 text-xs"
                  >
                    <Code className="w-3 h-3 mr-1" />
                    HTML
                  </Button>
                </div>
              </div>

              {!content.useHtml ? (
                <div>
                  <Label className="text-xs text-gray-700">Text Content</Label>
                  <Textarea
                    value={content.text || ''}
                    onChange={(e) => onUpdate({ text: e.target.value })}
                    placeholder="Enter text..."
                    rows={4}
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-xs text-gray-700 mb-1 block flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    HTML Code
                  </Label>
                  <Textarea
                    value={content.htmlContent || ''}
                    onChange={(e) => onUpdate({ htmlContent: e.target.value })}
                    placeholder="Enter HTML code... e.g., <p>Hello <strong>world</strong></p>"
                    rows={6}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                    <span>⚠️</span>
                    <span>Use inline styles for email compatibility</span>
                  </p>
                </div>
              )}
            </>
          )}

          {type === 'footer' && (
            <div>
              <Label className="text-xs text-gray-700">Text Content</Label>
              <Textarea
                value={content.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Enter text..."
                rows={4}
              />
            </div>
          )}

          <div>
            <Label className="text-xs text-gray-700">Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={content.textColor || '#333333'}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={content.textColor || '#333333'}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                placeholder="#333333"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-700">Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={content.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={content.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          {type === 'text' && (
            <div>
              <Label className="text-xs text-gray-700">Font Size: {content.fontSize}px</Label>
              <Input
                type="range"
                min="12"
                max="32"
                value={content.fontSize || 16}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              />
            </div>
          )}

          {type === 'footer' && (
            <div>
              <Label className="text-xs text-gray-700">Font Size: {content.fontSize}px</Label>
              <Input
                type="range"
                min="10"
                max="16"
                value={content.fontSize || 12}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div>
            <Label className="text-xs text-gray-700 mb-2 block">Text Alignment</Label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <Button
                  key={align}
                  size="sm"
                  variant={content.alignment === align ? 'default' : 'outline'}
                  onClick={() => onUpdate({ alignment: align })}
                  className="flex-1"
                >
                  {align === 'left' && <AlignLeft className="w-4 h-4" />}
                  {align === 'center' && <AlignCenter className="w-4 h-4" />}
                  {align === 'right' && <AlignRight className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-700">Padding: {content.padding}px</Label>
            <Input
              type="range"
              min="0"
              max="80"
              value={content.padding || 20}
              onChange={(e) => onUpdate({ padding: parseInt(e.target.value) })}
            />
          </div>
        </>
      )}

      {type === 'button' && (
        <>
          <div>
            <Label className="text-xs text-gray-700">Button Text</Label>
            <Input
              value={content.buttonText || ''}
              onChange={(e) => onUpdate({ buttonText: e.target.value })}
              placeholder="Button text..."
            />
          </div>
          <div>
            <Label className="text-xs text-gray-700">Button URL</Label>
            <Input
              value={content.buttonUrl || ''}
              onChange={(e) => onUpdate({ buttonUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label className="text-xs text-gray-700">Button Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={content.buttonColor || '#D4AF37'}
                onChange={(e) => onUpdate({ buttonColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={content.buttonColor || '#D4AF37'}
                onChange={(e) => onUpdate({ buttonColor: e.target.value })}
                placeholder="#D4AF37"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-700">Button Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={content.buttonTextColor || '#0A2647'}
                onChange={(e) => onUpdate({ buttonTextColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={content.buttonTextColor || '#0A2647'}
                onChange={(e) => onUpdate({ buttonTextColor: e.target.value })}
                placeholder="#0A2647"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-700 mb-2 block">Button Alignment</Label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <Button
                  key={align}
                  size="sm"
                  variant={content.alignment === align ? 'default' : 'outline'}
                  onClick={() => onUpdate({ alignment: align })}
                  className="flex-1"
                >
                  {align === 'left' && <AlignLeft className="w-4 h-4" />}
                  {align === 'center' && <AlignCenter className="w-4 h-4" />}
                  {align === 'right' && <AlignRight className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-700">Padding: {content.padding}px</Label>
            <Input
              type="range"
              min="0"
              max="60"
              value={content.padding || 20}
              onChange={(e) => onUpdate({ padding: parseInt(e.target.value) })}
            />
          </div>
        </>
      )}

      {type === 'image' && (
        <>
          <div>
            <Label className="text-xs text-gray-700">Image URL</Label>
            <Input
              value={content.imageUrl || ''}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label className="text-xs text-gray-700">Alt Text</Label>
            <Input
              value={content.imageAlt || ''}
              onChange={(e) => onUpdate({ imageAlt: e.target.value })}
              placeholder="Image description..."
            />
          </div>

          <Separator />

          <div>
            <Label className="text-xs text-gray-700 mb-2 block flex items-center gap-2">
              <ImageIcon className="w-3 h-3" />
              Image Dimensions
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Width (px)</Label>
                <Input
                  type="number"
                  value={content.imageWidth || 600}
                  onChange={(e) => onUpdate({ imageWidth: parseInt(e.target.value) || 600 })}
                  placeholder="600"
                  min="100"
                  max="800"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Height (px)</Label>
                <Input
                  type="number"
                  value={content.imageHeight || 400}
                  onChange={(e) => onUpdate({ imageHeight: parseInt(e.target.value) || 400 })}
                  placeholder="400"
                  min="100"
                  max="800"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommended: 600 × 400px</p>
          </div>

          <Separator />

          <div>
            <Label className="text-xs text-gray-700 mb-2 block">Image Alignment</Label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <Button
                  key={align}
                  size="sm"
                  variant={content.alignment === align ? 'default' : 'outline'}
                  onClick={() => onUpdate({ alignment: align })}
                  className="flex-1"
                >
                  {align === 'left' && <AlignLeft className="w-4 h-4" />}
                  {align === 'center' && <AlignCenter className="w-4 h-4" />}
                  {align === 'right' && <AlignRight className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-700">Padding: {content.padding}px</Label>
            <Input
              type="range"
              min="0"
              max="60"
              value={content.padding || 20}
              onChange={(e) => onUpdate({ padding: parseInt(e.target.value) })}
            />
          </div>
        </>
      )}

      {type === 'divider' && (
        <>
          <div>
            <Label className="text-xs text-gray-700">Line Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={content.backgroundColor || '#D4AF37'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={content.backgroundColor || '#D4AF37'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                placeholder="#D4AF37"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-700">Line Height: {content.height}px</Label>
            <Input
              type="range"
              min="1"
              max="10"
              value={content.height || 2}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-700">Spacing: {content.padding}px</Label>
            <Input
              type="range"
              min="0"
              max="60"
              value={content.padding || 20}
              onChange={(e) => onUpdate({ padding: parseInt(e.target.value) })}
            />
          </div>
        </>
      )}

      {type === 'spacer' && (
        <div>
          <Label className="text-xs text-gray-700">Height: {content.height}px</Label>
          <Input
            type="range"
            min="10"
            max="100"
            value={content.height || 40}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
          />
        </div>
      )}
    </div>
  );
}

// Email Settings Component
function EmailSettings({ settings, onUpdate }: { settings: any; onUpdate: (settings: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <p className="text-xs text-green-800 uppercase tracking-wide">
          Global Settings
        </p>
      </div>

      <div>
        <Label className="text-xs text-gray-700">Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            value={settings.backgroundColor}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            placeholder="#f4f4f4"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-700">Content Width: {settings.contentWidth}px</Label>
        <Input
          type="range"
          min="500"
          max="800"
          step="50"
          value={settings.contentWidth}
          onChange={(e) => onUpdate({ contentWidth: parseInt(e.target.value) })}
        />
        <p className="text-xs text-gray-500 mt-1">Recommended: 600px</p>
      </div>

      <div>
        <Label className="text-xs text-gray-700">Font Family</Label>
        <Select
          value={settings.fontFamily}
          onValueChange={(value) => onUpdate({ fontFamily: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial, sans-serif">Arial</SelectItem>
            <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
            <SelectItem value="Georgia, serif">Georgia</SelectItem>
            <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
            <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <p className="text-xs text-yellow-800">
          💡 <strong>Tip:</strong> Email clients have limited CSS support. Keep designs simple for best compatibility.
        </p>
      </div>
    </div>
  );
}
