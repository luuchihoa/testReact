import { useState } from "react";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  function addTodo() {
    if (!text.trim()) return;

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          ✅ Todo App
        </h1>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập công việc..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={addTodo}
            className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600"
          >
            Thêm
          </button>
        </div>

        {/* List */}
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
            >
              <span
                onClick={() =>
                  setTodos(
                    todos.map((t) =>
                      t.id === todo.id
                        ? { ...t, completed: !t.completed }
                        : t
                    )
                  )
                }
                className={`cursor-pointer ${
                  todo.completed
                    ? "line-through text-gray-400"
                    : ""
                }`}
              >
                {todo.title}
              </span>

              <button
                onClick={() =>
                  setTodos(todos.filter((t) => t.id !== todo.id))
                }
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TodoApp;
