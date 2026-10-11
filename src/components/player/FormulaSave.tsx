"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMixStore } from "@/store/mix";
import { useFormulaStore } from "@/store/formulas";

/**
 * 保存入睡配方：把当前混音图层+音量保存为命名配方
 */
export function FormulaSave() {
  const layers = useMixStore((s) => s.layers);
  const saveFormula = useFormulaStore((s) => s.saveFormula);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const layerData = Object.values(layers).map((l) => ({
      trackId: l.track.id,
      volume: l.volume,
    }));
    if (layerData.length === 0) return;
    saveFormula(trimmed, layerData);
    setName("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder="配方名，如「雨夜暖炉」"
        className="flex-1 rounded-lg border border-border bg-bg-soft px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-clay/50"
        aria-label="配方名称"
      />
      <Button size="sm" variant="sage" onClick={handleSave} className="gap-1.5">
        <Bookmark className="h-4 w-4" />
        {saved ? "已保存" : "保存配方"}
      </Button>
    </div>
  );
}
