import { useState } from "react";
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

const CARDS_PER_PAGE = 5;

export function Column({ column, onAddCard, onDeleteCard, onEditCard }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [showAll, setShowAll] = useState(false);
  const visibleCards = showAll ? column.cards : column.cards.slice(0, CARDS_PER_PAGE);
  const hiddenCount = column.cards.length - CARDS_PER_PAGE;

  return (
    <div className="bg-gray-200 rounded-xl p-4 min-w-[300px] w-[300px] flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">{column.cards.length}</span>
      </div>
      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-3 min-h-[100px]">
          {visibleCards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} onEdit={onEditCard} />
          ))}
        </div>
      </SortableContext>
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-2 py-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition"
        >
          + Show {hiddenCount} more
        </button>
      )}
      {showAll && column.cards.length > CARDS_PER_PAGE && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-lg transition"
        >
          Show less
        </button>
      )}
      <button
        onClick={onAddCard}
        className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-lg transition"
      >
        + Add Card
      </button>
    </div>
  );
}
