import styles from "./GlassCard.module.css";

export default function GlassCard({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag className={`${styles.card} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
