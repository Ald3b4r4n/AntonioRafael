import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./GlassCard.module.css";

/**
 * Props for the GlassCard component.
 *
 * Uses a polymorphic `as` prop so callers can render the card as any HTML
 * element (e.g. `<section>`, `<article>`, `<li>`) while keeping the glass
 * styling. The generic `T` flows through to `ComponentPropsWithoutRef<T>`
 * so element-specific attributes (like `href` on an `<a>`) are type-safe.
 */
type GlassCardProps<T extends ElementType = "div"> = {
  /** HTML element or React component to render as. Defaults to `"div"`. */
  as?: T;
  /** Additional CSS class names appended after the base card class. */
  className?: string;
  /** Card content. */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export default function GlassCard<T extends ElementType = "div">({
  as,
  className = "",
  children,
  ...rest
}: GlassCardProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag className={`${styles.card} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
