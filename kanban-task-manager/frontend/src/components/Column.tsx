import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Column as ColumnType, Card as CardType } from "../types";
import { Card } from "./Card";

interface Props {
  column: ColumnType;
  onAddCard: () => void;
  onDeleteCard: (id: string) => void;
  onEditCard: (card: CardType) => void;
}

export function Column({ column, onAddCard, onDeleteCard, onEditCard }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="bg-gray-200 rounded-xl p-4 min-w-[300px] w-[300px] flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">{column.cards.length}</span>
      </div>
      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-3 min-h-[100px]">
          {column.cards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} onEdit={onEditCard} />
          ))}
        </div>
      </SortableContext>
      <button
        onClick={onAddCard}
        className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-lg transition"
      >
        + Add Card
      </button>
    </div>
  );
}
