import { useState, useEffect, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import api from "../api/client";
import { Card as CardType, Board as BoardType } from "../types";
import { Column } from "./Column";
import { Card } from "./Card";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { SkeletonCard, SkeletonList } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export function Board() {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: "card" | "board" | "rename-board" | "edit-card"; columnId?: string; card?: CardType } | null>(null);
  const [modalInput, setModalInput] = useState("");
  const { logout } = useAuth();

  const fetchBoards = useCallback(async () => {
    try {
      const { data } = await api.get("/boards");
      setBoards(data);
      if (data.length > 0) {
        setBoard((prev) => data.find((b: BoardType) => b.id === prev?.id) || data[0]);
      } else {
        setBoard(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || !board) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    let targetColumn = board.columns.find((c) => c.id === overId);
    let targetPosition = 0;

    if (!targetColumn) {
      targetColumn = board.columns.find((c) => c.cards.some((card) => card.id === overId));
      if (!targetColumn) return;
      const overIndex = targetColumn.cards.findIndex((c) => c.id === overId);
      targetPosition = overIndex >= 0 ? overIndex : targetColumn.cards.length;
    } else {
      targetPosition = targetColumn.cards.length;
    }

    try {
      await api.patch(`/cards/${cardId}/move`, {
        columnId: targetColumn.id,
        position: targetPosition,
      });
      setBoard((prev) => {
        if (!prev) return prev;
        const updated = structuredClone(prev);
        let moved: CardType | undefined;
        for (const col of updated.columns) {
          const idx = col.cards.findIndex((c) => c.id === cardId);
          if (idx >= 0) {
            moved = col.cards.splice(idx, 1)[0];
            break;
          }
        }
        if (moved) {
          const dest = updated.columns.find((c) => c.id === targetColumn!.id);
          if (dest) dest.cards.splice(targetPosition, 0, { ...moved, columnId: targetColumn!.id });
        }
        return updated;
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to move card");
    }
  }

  function openCardModal(columnId: string, card?: CardType) {
    setModalInput(card ? card.title : "");
    setModal({ type: "card", columnId, card });
  }

  function openBoardModal() {
    setModalInput("");
    setModal({ type: "board" });
  }

  async function handleModalSubmit() {
    if (!modal || !modalInput.trim()) return;
    try {
      if (modal.type === "board") {
        const { data } = await api.post("/boards", { title: modalInput.trim() });
        setBoards([...boards, data]);
        setBoard(data);
      } else if (modal.type === "card" && modal.columnId) {
        await api.post("/cards", { title: modalInput.trim(), columnId: modal.columnId });
        await fetchBoards();
      } else if (modal.type === "rename-board" && board) {
        await api.put(`/boards/${board.id}`, { title: modalInput.trim() });
        await fetchBoards();
      } else if (modal.type === "edit-card" && modal.card) {
        await api.put(`/cards/${modal.card.id}`, { title: modalInput.trim() });
        await fetchBoards();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Operation failed");
    }
    setModal(null);
  }

  async function deleteBoard(id: string) {
    if (!confirm("Delete this board and all its cards?")) return;
    try {
      await api.delete(`/boards/${id}`);
      await fetchBoards();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete board");
    }
  }

  async function deleteCard(id: string) {
    if (!confirm("Delete this card?")) return;
    try {
      await api.delete(`/cards/${id}`);
      await fetchBoards();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete card");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl p-4 min-w-[300px] w-[300px] flex-shrink-0">
              <div className="skeleton skeleton-text" style={{ width: '40%', height: 20, marginBottom: 16 }} />
              <div className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div aria-live="polite" className="sr-only">{activeCard ? `Dragging ${activeCard.title}` : ""}</div>
      <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">Kanban</h1>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={board?.id || ""}
            onChange={(e) => {
              const b = boards.find((b) => b.id === e.target.value);
              if (b) setBoard(b);
            }}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
          {board && (
            <>
              <button onClick={() => { setModalInput(board.title); setModal({ type: "rename-board" }); }} className="text-sm text-gray-500 hover:text-indigo-600" title="Rename board"><i className="fas fa-pencil-alt"></i></button>
              <button onClick={() => deleteBoard(board.id)} className="text-sm text-gray-500 hover:text-red-600" title="Delete board"><i className="fas fa-trash"></i></button>
            </>
          )}
          <button onClick={openBoardModal} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            + New Board
          </button>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600">Logout</button>
      </header>

      <div className="p-6">
        {board ? (
          <DndContext
            collisionDetection={closestCorners}
            onDragStart={(event: DragStartEvent) => {
              for (const col of board.columns) {
                const card = col.cards.find((c) => c.id === event.active.id);
                if (card) { setActiveCard(card); break; }
              }
            }}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-4">
              {board.columns.map((col) => (
                <Column
                  key={col.id}
                  column={col}
                  onAddCard={() => openCardModal(col.id)}
                  onDeleteCard={deleteCard}
                  onEditCard={(card) => openCardModal(col.id, card)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeCard && <Card card={activeCard} isOverlay />}
            </DragOverlay>
          </DndContext>
        ) : (
          <EmptyState icon="📋" title="No boards yet" message="Create your first board to get started" action={{ label: "New Board", onClick: openBoardModal }} />
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">
              {modal.type === "board" ? "New Board" : modal.type === "rename-board" ? "Rename Board" : modal.type === "edit-card" ? "Edit Card" : "New Card"}
            </h3>
            <input
              autoFocus
              className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder={modal.type === "board" || modal.type === "rename-board" ? "Board name" : "Card title"}
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleModalSubmit(); }}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleModalSubmit} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {modal.type === "board" ? "Create" : modal.type === "rename-board" || modal.type === "edit-card" ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
