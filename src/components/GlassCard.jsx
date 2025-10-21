import styles from "./GlassCard.module.css";

export default function GlassCard({ as, className = "", children, ...rest }) {
  const Tag = as || "div";
  return (
    <Tag className={`${styles.card} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
