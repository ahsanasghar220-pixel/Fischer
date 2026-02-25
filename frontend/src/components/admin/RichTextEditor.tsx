import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-500 text-white'
          : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-600'
      }`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Enter product specifications…',
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none min-h-[180px] px-4 py-3 text-dark-900 dark:text-dark-100 focus:outline-none',
      },
    },
  })

  // Sync external value changes (e.g. when product loads)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const incoming = value || ''
    if (current !== incoming && incoming !== '<p></p>') {
      editor.commands.setContent(incoming)
    }
  }, [value, editor])

  if (!editor) return null

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()
  }

  return (
    <div className="border border-dark-200 dark:border-dark-600 rounded-lg overflow-hidden bg-white dark:bg-dark-700">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-dark-200 dark:border-dark-600 bg-dark-50 dark:bg-dark-800">
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <em>I</em>
        </ToolbarButton>

        <div className="w-px h-5 bg-dark-200 dark:bg-dark-600 mx-0.5" />

        <ToolbarButton
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </ToolbarButton>

        <div className="w-px h-5 bg-dark-200 dark:bg-dark-600 mx-0.5" />

        <ToolbarButton
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          ≡
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          1.
        </ToolbarButton>

        <div className="w-px h-5 bg-dark-200 dark:bg-dark-600 mx-0.5" />

        <ToolbarButton title="Insert Table" onClick={addTable} active={false}>
          ⊞
        </ToolbarButton>

        {editor.isActive('table') && (
          <>
            <ToolbarButton
              title="Add Row"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              active={false}
            >
              +row
            </ToolbarButton>
            <ToolbarButton
              title="Add Column"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              active={false}
            >
              +col
            </ToolbarButton>
            <ToolbarButton
              title="Delete Row"
              onClick={() => editor.chain().focus().deleteRow().run()}
              active={false}
            >
              -row
            </ToolbarButton>
            <ToolbarButton
              title="Delete Column"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              active={false}
            >
              -col
            </ToolbarButton>
          </>
        )}

        <div className="w-px h-5 bg-dark-200 dark:bg-dark-600 mx-0.5" />

        <ToolbarButton
          title="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          active={false}
        >
          ✕
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Table styles */}
      <style>{`
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 0.75rem 0;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #d1d5db;
          padding: 6px 10px;
          text-align: left;
          vertical-align: top;
        }
        .ProseMirror th {
          background: #f3f4f6;
          font-weight: 600;
        }
        .dark .ProseMirror th {
          background: #374151;
          border-color: #4b5563;
        }
        .dark .ProseMirror td {
          border-color: #4b5563;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  )
}
