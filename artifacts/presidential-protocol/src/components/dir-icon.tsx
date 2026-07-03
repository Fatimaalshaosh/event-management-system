import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  type LucideProps,
} from "lucide-react";
import { useLanguage } from "@/i18n/language-context";

/**
 * Direction-aware icons. Names refer to the inline axis, not a physical side,
 * so they render correctly in both RTL (Arabic) and LTR (English).
 *
 * - *End   → points toward the end of the reading direction
 *            (RTL: left, LTR: right)
 * - *Start → points toward the start of the reading direction
 *            (RTL: right, LTR: left)
 */

export function ChevronEnd(props: LucideProps) {
  const { dir } = useLanguage();
  const Icon = dir === "rtl" ? ChevronLeft : ChevronRight;
  return <Icon {...props} />;
}

export function ChevronStart(props: LucideProps) {
  const { dir } = useLanguage();
  const Icon = dir === "rtl" ? ChevronRight : ChevronLeft;
  return <Icon {...props} />;
}

export function ArrowEnd(props: LucideProps) {
  const { dir } = useLanguage();
  const Icon = dir === "rtl" ? ArrowLeft : ArrowRight;
  return <Icon {...props} />;
}

export function ArrowStart(props: LucideProps) {
  const { dir } = useLanguage();
  const Icon = dir === "rtl" ? ArrowRight : ArrowLeft;
  return <Icon {...props} />;
}

export function ArrowUpEnd(props: LucideProps) {
  const { dir } = useLanguage();
  const Icon = dir === "rtl" ? ArrowUpLeft : ArrowUpRight;
  return <Icon {...props} />;
}
