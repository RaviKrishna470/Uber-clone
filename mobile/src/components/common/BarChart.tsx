import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { colors, spacing, typography } from '@/theme';

export interface ChartDatum {
  label: string;
  value: number;
}

interface Props {
  data: ChartDatum[];
  height?: number;
  color?: string;
  title?: string;
  formatValue?: (v: number) => string;
}

/** Lightweight SVG bar chart (no extra native deps) — e.g. trips per day, weekly earnings. */
export function BarChart({ data, height = 180, color = colors.chart[0], title, formatValue = String }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const labelH = 20;
  const valueH = 16;
  const plotH = height - labelH - valueH;
  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = data.length ? width / data.length : 0;
  const barW = Math.min(32, slot * 0.6);

  return (
    <View style={styles.wrapper}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Line x1={0} x2={width} y1={valueH + plotH} y2={valueH + plotH} stroke={colors.border} strokeWidth={1} />
            {data.map((d, i) => {
              const h = (d.value / max) * plotH;
              const x = i * slot + (slot - barW) / 2;
              const y = valueH + plotH - h;
              return (
                <Rect key={`${d.label}-${i}`} x={x} y={y} width={barW} height={Math.max(h, 1)} rx={4} fill={color} />
              );
            })}
            {data.map((d, i) => (
              <SvgText
                key={`v-${i}`}
                x={i * slot + slot / 2}
                y={valueH + plotH - (d.value / max) * plotH - 4}
                fontSize={11}
                fill={colors.textMuted}
                textAnchor="middle"
              >
                {d.value ? formatValue(d.value) : ''}
              </SvgText>
            ))}
            {data.map((d, i) => (
              <SvgText key={`l-${i}`} x={i * slot + slot / 2} y={height - 4} fontSize={11} fill={colors.textMuted} textAnchor="middle">
                {d.label}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  title: { ...typography.bodyStrong, color: colors.text },
});
