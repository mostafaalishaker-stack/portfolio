import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "../types";

interface Props {
  card: CardType;
  isOverlay?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (card: CardType) => void;
}

export function Card({ card, isOverlay, onDelete, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing ${isOverlay ? "rotate-3 shadow-xl" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-800">{card.title}</p>
        {!isOverlay && onEdit && onDelete && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={(e) => { e.stopPropagation(); onEdit(card); }} className="text-xs text-gray-400 hover:text-indigo-600 p-1" title="Edit card"><i className="fas fa-pencil-alt"></i></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} className="text-xs text-gray-400 hover:text-red-600 p-1" title="Delete card"><i className="fas fa-times"></i></button>
          </div>
        )}
      </div>
      {card.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
      )}
      {card.labels.length > 0 && (
        <div className="flex gap-1 mt-2">
          {card.labels.map((label, i) => (
            <span key={i} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{label}</span>
          ))}
        </div>
      )}
      {card.dueDate && (
        <p className="text-xs text-gray-400 mt-2">Due: {new Date(card.dueDate).toLocaleDateString()}</p>
      )}
    </div>
  );
}
