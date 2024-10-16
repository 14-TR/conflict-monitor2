import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { BrushingExtension } from '@deck.gl/extensions';
import { BATTLES_COLOR_RANGE, EXPLOSIONS_COLOR_RANGE } from '../config/colors';

export function createLayers({
  battlesData,
  explosionsData,
  radius,
  upperPercentile,
  coverage,
  brushingEnabled,
  brushingRadius,
  showBattlesLayer,
  showExplosionsLayer,
  handleInteraction,
  setTooltip,
}) {
  const layers = [];

  if (showBattlesLayer) {
    layers.push(
      new HexagonLayer({
        id: 'battles',
        data: battlesData,
        getPosition: (d) => [d.longitude, d.latitude],
        radius,
        colorRange: BATTLES_COLOR_RANGE,
        elevationScale: battlesData.length ? 50 : 0,
        coverage,
        upperPercentile: upperPercentile[1],
        extruded: true,
        brushingEnabled,
        brushingRadius,
        pickable: true,
        extensions: [new BrushingExtension()],
        onHover: (info) => setTooltip(info),
        onClick: (info) => handleInteraction(info.x, info.y),
      })
    );
  }

  if (showExplosionsLayer) {
    layers.push(
      new HexagonLayer({
        id: 'explosions',
        data: explosionsData,
        getPosition: (d) => [d.longitude, d.latitude],
        radius,
        colorRange: EXPLOSIONS_COLOR_RANGE,
        elevationScale: explosionsData.length ? 50 : 0,
        coverage,
        upperPercentile: upperPercentile[1],
        extruded: true,
        brushingEnabled,
        brushingRadius,
        pickable: true,
        extensions: [new BrushingExtension()],
        onHover: (info) => setTooltip(info),
        onClick: (info) => handleInteraction(info.x, info.y),
      })
    );
  }

  return layers;
}
