import { useState } from "react";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  function addTodo() {
    if (text.trim() === "") return;

    setTodos([
      ...todos,
      {
        id: Date.now(),
        title: text,
        completed: false,
      },
    ]);

    setText("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Todo App</h1>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập công việc..."
      />
      
      <button onClick={addTodo}>Thêm</button>

      <ul>
        {todos.map((todo) => (
          <li>
            <span onClick={() =>
                setTodos(
                todos.map((t) =>
                    t.id === todo.id
                    ? { ...t, completed: !t.completed }
                    : t
                )
                )
            }
            style={{
                cursor: "pointer",
                textDecoration: todo.completed ? "line-through" : "none",
            }}
            >
                {todo.title}
            </span>
            <button onClick={() =>
                setTodos(todos.filter((t) => t.id !== todo.id))
            }>
                Xoá
            </button>
        </li>

        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
