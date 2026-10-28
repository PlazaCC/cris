import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ProjectBlock, ResponsiveImage } from '@/interfaces'

import { move } from '@/lib/array'
import { Field } from './field'
import { ResponsiveImageField } from './image-field'

import { ListControls } from './list-controls'
import { StringListField } from './string-list-field'

type BlockType = ProjectBlock['type']
type ResultItem = Extract<ProjectBlock, { type: 'results' }>['results'][number]

const BLOCK_LABELS: Record<BlockType, string> = {
  scope: 'Escopo',
  'quote-title': 'Citação',
  paragraph: 'Parágrafos',
  images: 'Imagens',
  results: 'Resultados',
}

const HTML_HINT = 'HTML simples: <p>, <strong>, <em>, <a>, listas.'

function emptyBlock(type: BlockType): ProjectBlock {
  switch (type) {
    case 'scope':
      return { type, title: 'Scope', paragraphs: [''] }
    case 'quote-title':
      return { type, text: '' }
    case 'paragraph':
      return { type, items: [''] }
    case 'images':
      return { type, images: [{ desktop: '', mobile: '' }] }
    case 'results':
      return { type, results: [{ value: '', positive: true, label: '' }] }
  }
}

type BlockEditorProps = {
  value: ProjectBlock[]
  onChange: (value: ProjectBlock[]) => void
}

/*
 * Lista de blocos do projeto, na ordem em que aparecem na página. Cada
 * editor espelha o componente público em components/blocks/*.
 */
export function BlockEditor({ value, onChange }: BlockEditorProps) {
  const update = (index: number, block: ProjectBlock) =>
    onChange(value.map((item, i) => (i === index ? block : item)))

  return (
    <div className="flex flex-col gap-4">
      {value.length === 0 && (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          Nenhum bloco. Adicione o primeiro abaixo.
        </p>
      )}

      {value.map((block, index) => (
        <article
          className="flex flex-col gap-4 rounded-lg border p-4"
          key={index}
        >
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {index + 1}. {BLOCK_LABELS[block.type]}
            </h3>
            <ListControls
              index={index}
              length={value.length}
              label={`bloco ${index + 1}`}
              onMove={(to) => onChange(move(value, index, to))}
              onRemove={() => onChange(value.filter((_, i) => i !== index))}
            />
          </header>
          <BlockFields block={block} onChange={(next) => update(index, next)} />
        </article>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Adicionar bloco:</span>
        {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...value, emptyBlock(type)])}
          >
            <Plus />
            {BLOCK_LABELS[type]}
          </Button>
        ))}
      </div>
    </div>
  )
}

function BlockFields({
  block,
  onChange,
}: {
  block: ProjectBlock
  onChange: (block: ProjectBlock) => void
}) {
  switch (block.type) {
    case 'scope':
      return (
        <>
          <Field label="Título">
            <Input
              value={block.title}
              onChange={(event) =>
                onChange({ ...block, title: event.target.value })
              }
            />
          </Field>
          <Field label="Parágrafos" hint={HTML_HINT}>
            <StringListField
              multiline
              itemLabel="Parágrafo"
              addLabel="Parágrafo"
              value={block.paragraphs}
              onChange={(paragraphs) => onChange({ ...block, paragraphs })}
            />
          </Field>
        </>
      )
    case 'quote-title':
      return (
        <Field label="Texto">
          <Textarea
            value={block.text}
            onChange={(event) =>
              onChange({ ...block, text: event.target.value })
            }
          />
        </Field>
      )
    case 'paragraph':
      return (
        <Field
          label="Colunas"
          hint={`Até 3 por linha no desktop. ${HTML_HINT}`}
        >
          <StringListField
            multiline
            itemLabel="Coluna"
            addLabel="Coluna"
            value={block.items}
            onChange={(items) => onChange({ ...block, items })}
          />
        </Field>
      )
    case 'images':
      return (
        <ImagesFields
          images={block.images}
          onChange={(images) => onChange({ ...block, images })}
        />
      )
    case 'results':
      return (
        <ResultsFields
          results={block.results}
          onChange={(results) => onChange({ ...block, results })}
        />
      )
  }
}

function ImagesFields({
  images,
  onChange,
}: {
  images: ResponsiveImage[]
  onChange: (images: ResponsiveImage[]) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs">
        As imagens entram em pares lado a lado; se sobrar uma no fim, ela ocupa
        a largura toda.
      </p>
      {images.map((image, index) => (
        <div className="flex flex-col gap-3 rounded-md border p-3" key={index}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Imagem {index + 1}</span>
            <ListControls
              index={index}
              length={images.length}
              label={`imagem ${index + 1}`}
              onMove={(to) => onChange(move(images, index, to))}
              onRemove={() => onChange(images.filter((_, i) => i !== index))}
            />
          </div>
          <ResponsiveImageField
            label={`Imagem ${index + 1}`}
            value={image}
            onChange={(next) =>
              onChange(images.map((item, i) => (i === index ? next : item)))
            }
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...images, { desktop: '', mobile: '' }])}
      >
        <Plus />
        Imagem
      </Button>
    </div>
  )
}

function ResultsFields({
  results,
  onChange,
}: {
  results: ResultItem[]
  onChange: (results: ResultItem[]) => void
}) {
  const update = (index: number, patch: Partial<ResultItem>) =>
    onChange(
      results.map((item, i) => (i === index ? { ...item, ...patch } : item))
    )

  return (
    <div className="flex flex-col gap-3">
      {results.map((result, index) => (
        <div
          className="grid items-end gap-3 rounded-md border p-3 sm:grid-cols-[120px_auto_1fr_auto]"
          key={index}
        >
          <Field label="Valor">
            <Input
              placeholder="40%"
              value={result.value}
              onChange={(event) => update(index, { value: event.target.value })}
            />
          </Field>
          <label className="flex h-9 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary size-4"
              checked={result.positive}
              onChange={(event) =>
                update(index, { positive: event.target.checked })
              }
            />
            Positivo (+)
          </label>
          <Field label="Descrição">
            <Input
              value={result.label}
              onChange={(event) => update(index, { label: event.target.value })}
            />
          </Field>
          <ListControls
            index={index}
            length={results.length}
            label={`resultado ${index + 1}`}
            onMove={(to) => onChange(move(results, index, to))}
            onRemove={() => onChange(results.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          onChange([...results, { value: '', positive: true, label: '' }])
        }
      >
        <Plus />
        Resultado
      </Button>
    </div>
  )
}
