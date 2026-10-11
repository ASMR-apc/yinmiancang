"use client";

import { X, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useMixStore } from "@/store/mix";
import { FormulaSave } from "./FormulaSave";

/**
 * 混音面板：展示当前背景图层，每条可独立调节音量或移除
 */
export function MixPanel() {
  const layers = useMixStore((s) => s.layers);
  const removeLayer = useMixStore((s) => s.removeLayer);
  const setLayerVolume = useMixStore((s) => s.setLayerVolume);
  const clear = useMixStore((s) => s.clear);

  const layerList = Object.values(layers);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display font-semibold text-text-primary">
          背景混音
          <span className="ml-2 text-xs font-normal text-text-muted">
            {layerList.length} 轨
          </span>
        </h3>
        {layerList.length > 0 && (
          <button
            onClick={clear}
            className="text-xs text-text-muted hover:text-clay"
          >
            清空
          </button>
        )}
      </div>

      {layerList.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          去声音库点击「混音」，把环境音叠加进来吧。
        </p>
      ) : (
        <div className="space-y-3">
          {layerList.map((layer) => (
            <div key={layer.track.id} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm text-text-primary">
                {layer.track.title}
              </span>
              <Volume2 className="h-4 w-4 shrink-0 text-text-muted" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={layer.volume}
                onChange={(e) =>
                  setLayerVolume(layer.track.id, Number(e.target.value))
                }
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-bg-soft accent-sage"
                aria-label={`${layer.track.title} 音量`}
              />
              <span className="w-9 text-right text-xs tabular-nums text-text-muted">
                {Math.round(layer.volume * 100)}
              </span>
              <button
                onClick={() => removeLayer(layer.track.id)}
                className="text-text-muted hover:text-clay"
                aria-label={`移除 ${layer.track.title}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {layerList.length > 0 && <FormulaSave />}
    </Card>
  );
}
