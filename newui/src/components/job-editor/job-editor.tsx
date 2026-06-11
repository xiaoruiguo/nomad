import { useEffect, useRef } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { cn } from '@/lib/utils'

interface JobEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'hcl' | 'json'
  readOnly?: boolean
  className?: string
}

const languageCompartment = new Compartment()
const editableCompartment = new Compartment()

function getLanguageExtension(lang: 'hcl' | 'json') {
  switch (lang) {
    case 'json':
      return json()
    case 'hcl':
      return javascript()
    default:
      return json()
  }
}

export function JobEditor({ value, onChange, language, readOnly = false, className }: JobEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString())
      }
    })

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        bracketMatching(),
        closeBrackets(),
        syntaxHighlighting(defaultHighlightStyle),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        languageCompartment.of(getLanguageExtension(language)),
        oneDark,
        updateListener,
        editableCompartment.of(EditorView.editable.of(!readOnly)),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!viewRef.current) return
    const current = viewRef.current.state.doc.toString()
    if (current !== value) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  useEffect(() => {
    if (!viewRef.current) return
    viewRef.current.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(language)),
    })
  }, [language])

  useEffect(() => {
    if (!viewRef.current) return
    viewRef.current.dispatch({
      effects: editableCompartment.reconfigure(EditorView.editable.of(!readOnly)),
    })
  }, [readOnly])

  return (
    <div
      ref={containerRef}
      className={cn('h-full w-full overflow-hidden rounded-md border border-gray-300', className)}
    />
  )
}
