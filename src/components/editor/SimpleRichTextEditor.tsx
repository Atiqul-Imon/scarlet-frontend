'use client';

import React, { useCallback, useState, useEffect } from 'react';
import './editor-styles.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon,
  StrikethroughIcon,
  CodeBracketIcon,
  LinkIcon,
  PhotoIcon,
  ListBulletIcon,
  ListBulletIcon as ListNumberedIcon,
  ChatBubbleLeftRightIcon as QuoteIcon,
  Bars3Icon as AlignLeftIcon,
  Bars3Icon as AlignCenterIcon,
  Bars3Icon as AlignRightIcon,
  Bars3Icon as AlignJustifyIcon,
  PaintBrushIcon,
  SwatchIcon as HighlighterIcon,
  ArrowUturnLeftIcon as UndoIcon,
  ArrowUturnRightIcon as RedoIcon
} from '@heroicons/react/24/outline';

interface SimpleRichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  showWordCount?: boolean;
  showToolbar?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

const COLORS = [
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981',
  '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#D946EF', '#EC4899', '#F43F5E'
];

const HIGHLIGHT_COLORS = [
  '#FEF3C7', '#FDE68A', '#FCD34D', '#F59E0B', '#D97706',
  '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626',
  '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB',
  '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5',
  '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED'
];

export default function SimpleRichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
  minHeight = 200,
  maxHeight = 600,
  showWordCount = true,
  showToolbar = true,
  onImageUpload
}: SimpleRichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Typography,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 text-gray-800 ${className}`,
        style: `min-height: ${minHeight}px; max-height: ${maxHeight}px; overflow-y: auto; background: white;`,
      },
    },
    immediatelyRender: false,
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!onImageUpload) return;
    
    setIsUploading(true);
    try {
      const url = await onImageUpload(file);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [editor, onImageUpload]);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  }, [handleImageUpload]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading rich text editor...</p>
        </div>
      </div>
    );
  }

  const wordCount = editor.storage.characterCount.words();
  const characterCount = editor.storage.characterCount.characters();

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {showToolbar && (
        <div className="border-b border-gray-200 bg-gray-100 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {/* Text Formatting */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Bold"
              >
                <BoldIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Italic"
              >
                <ItalicIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('underline') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('strike') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Strikethrough"
              >
                <StrikethroughIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('code') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Code"
              >
                <CodeBracketIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <select
                onChange={(e) => {
                  const level = parseInt(e.target.value);
                  if (level === 0) {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                  }
                }}
                value={editor.isActive('heading') ? editor.getAttributes('heading')['level'] : 0}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value={0}>Normal</option>
                <option value={1}>Heading 1</option>
                <option value={2}>Heading 2</option>
                <option value={3}>Heading 3</option>
                <option value={4}>Heading 4</option>
                <option value={5}>Heading 5</option>
                <option value={6}>Heading 6</option>
              </select>
            </div>

            {/* Lists */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Bullet List"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Numbered List"
              >
                <ListNumberedIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Align Left"
              >
                <AlignLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Align Center"
              >
                <AlignCenterIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Align Right"
              >
                <AlignRightIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Justify"
              >
                <AlignJustifyIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                  className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('textStyle') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                  title="Text Color"
                >
                  <PaintBrushIcon className="h-4 w-4" />
                </button>
                {showColorPicker === 'text' && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div className="grid grid-cols-7 gap-1">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            editor.chain().focus().setColor(color).run();
                            setShowColorPicker(null);
                          }}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === 'highlight' ? null : 'highlight')}
                  className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('highlight') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                  title="Highlight"
                >
                  <HighlighterIcon className="h-4 w-4" />
                </button>
                {showColorPicker === 'highlight' && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div className="grid grid-cols-5 gap-1">
                      {HIGHLIGHT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            editor.chain().focus().setHighlight({ color }).run();
                            setShowColorPicker(null);
                          }}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media & Links */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <button
                onClick={addImage}
                disabled={isUploading}
                className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors text-gray-700"
                title="Add Image"
              >
                <PhotoIcon className="h-4 w-4" />
              </button>
              <button
                onClick={addLink}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('link') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Blocks */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('blockquote') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Quote"
              >
                <QuoteIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${editor.isActive('codeBlock') ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                title="Code Block"
              >
                <CodeBracketIcon className="h-4 w-4" />
              </button>
            </div>

            {/* History */}
            <div className="flex items-center">
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors text-gray-700"
                title="Undo"
              >
                <UndoIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors text-gray-700"
                title="Redo"
              >
                <RedoIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <EditorContent editor={editor} />
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-sm text-gray-600">Uploading image...</div>
          </div>
        )}
      </div>

      {showWordCount && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="font-medium">{wordCount} words</span>
            <span className="text-gray-400">•</span>
            <span>{characterCount} characters</span>
          </div>
          <div className="text-xs text-gray-500">
            Reading time: ~{Math.ceil(wordCount / 200)} min
          </div>
        </div>
      )}
    </div>
  );
}
