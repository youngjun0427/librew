import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  buildEquipmentSpecs,
  EquipmentForm,
  type EquipmentFormValues,
} from "../../components/EquipmentForm";
import { useEquipment } from "../../hooks/useEquipment";

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { equipment, updateEquipment, deleteEquipment } = useEquipment();
  const item = equipment.find((e) => e.id === id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900">
        <p className="text-zinc-400">장비를 찾을 수 없어요</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-amber-400">← 돌아가기</button>
      </div>
    );
  }

  const defaultValues: Partial<EquipmentFormValues> = {
    brand: item.brand, model: item.model, type: item.type,
    notes: item.notes ?? "",
    capacity: item.specs.capacity ? String(item.specs.capacity) : "",
    temperature: item.specs.temperature ? String(item.specs.temperature) : "",
    filterType: item.specs.filterType ?? "", servings: item.specs.servings ?? "",
    precision: item.specs.precision ?? "", hasTimer: item.specs.hasTimer ?? false,
    hasValve: item.specs.hasValve ?? false,
  };

  const handleSubmit = async (data: EquipmentFormValues) => {
    await updateEquipment(id!, {
      name: [data.brand, data.model].filter(Boolean).join(" ") || "장비",
      brand: data.brand, model: data.model, type: item.type, // Force original type
      specs: { ...item.specs, ...buildEquipmentSpecs(data) }, // preserve currentGrindSetting
      notes: data.notes || null,
    });
    navigate(-1);
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    await deleteEquipment(id!);
    navigate(-1);
  };

  return (
    <div className="relative min-h-screen bg-zinc-900">
      <EquipmentForm
        title="장비 수정" 
        defaultValues={defaultValues}
        lockedType={item.type} // Prevents changing type
        onBack={() => navigate(-1)} 
        onSubmit={handleSubmit} 
        actions={(isSubmitting, submitFn) => (
          <div className="flex gap-3">
            <button
              className={`flex-1 rounded-2xl py-4 font-bold text-zinc-900 ${isSubmitting ? "bg-amber-300" : "bg-amber-400"}`}
              onClick={submitFn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "수정 완료"}
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-2xl bg-red-400/10 px-6 font-bold text-red-400 active:bg-red-400/20 transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="장비를 삭제할까요?"
        description="삭제하면 복구할 수 없어요"
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
