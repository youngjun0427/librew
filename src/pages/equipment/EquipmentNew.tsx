import { useNavigate } from "react-router-dom";
import {
  buildEquipmentSpecs,
  EquipmentForm,
  type EquipmentFormValues,
} from "../../components/EquipmentForm";
import { useEquipment } from "../../hooks/useEquipment";

export default function EquipmentNewPage() {
  const navigate = useNavigate();
  const { addEquipment } = useEquipment();

  const handleSubmit = async (data: EquipmentFormValues) => {
    await addEquipment({
      name: [data.brand, data.model].filter(Boolean).join(" ") || "장비",
      brand: data.brand,
      model: data.model,
      type: data.type,
      specs: buildEquipmentSpecs(data),
      notes: data.notes || null,
    });
    navigate(-1);
  };

  return (
    <EquipmentForm
      title="장비 추가"
      onBack={() => navigate(-1)}
      onSubmit={handleSubmit}
      showBrandPicker
    />
  );
}
