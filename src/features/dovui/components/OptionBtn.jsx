export default function OptionBtn({ letter, text, state = "idle", onClick, onHover, disabled }) {
  return (
    <button type="button" className={`dovui-option dovui-option--${state}`}
      onClick={(event) => onClick(event.currentTarget.getBoundingClientRect())}
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) onHover?.();
      }}
      disabled={disabled}>
      <span className="dovui-option-letter" aria-hidden="true">{state === "correct" ? "✓" : state === "wrong" ? "✕" : letter}</span>
      <span><span className="sr-only">{letter}. </span>{text}
        {state === "correct" && <span className="dovui-option-state">Đáp án đúng</span>}
        {state === "wrong" && <span className="dovui-option-state">Em đã chọn</span>}
        {state === "dim" && <span className="sr-only"> — Không thể chọn</span>}
      </span>
    </button>
  );
}
