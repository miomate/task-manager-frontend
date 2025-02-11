import { useState, useEffect } from "react";
import axios from "axios";

const API_URL =
  "https://task-manager-backend-eta-two.vercel.app/api/categories";

interface Task {
  id: number;
  description: string;
}

interface Category {
  id: number;
  name: string;
  tasks: Task[];
}

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [taskInputs, setTaskInputs] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null); // New: Handle errors

  useEffect(() => {
    axios
      .get(API_URL)
      .then(({ data }) => setCategories(data))
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again.");
      });
  }, []);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    axios
      .post(API_URL, { name: newCategory })
      .then(({ data }) => {
        setCategories((prev) => [...prev, { ...data, tasks: [] }]);
        setNewCategory("");
      })
      .catch((err) => {
        console.error("Error adding category:", err);
        setError("Failed to add category.");
      });
  };

  const deleteCategory = (id: number) => {
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      })
      .catch((err) => {
        console.error("Error deleting category:", err);
        setError("Failed to delete category.");
      });
  };

  const addTask = (categoryId: number) => {
    if (!taskInputs[categoryId]?.trim()) return;
    axios
      .post(`${API_URL}/${categoryId}/tasks`, {
        description: taskInputs[categoryId],
      })
      .then(({ data }) => {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId ? { ...c, tasks: [...c.tasks, data] } : c
          )
        );
        setTaskInputs((prev) => ({ ...prev, [categoryId]: "" }));
      })
      .catch((err) => {
        console.error("Error adding task:", err);
        setError("Failed to add task.");
      });
  };

  const editTask = (
    taskId: number,
    newDescription: string,
    categoryId: number
  ) => {
    axios
      .put(`${API_URL}/tasks/${taskId}`, { description: newDescription })
      .then(({ data }) => {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  tasks: c.tasks.map((t) => (t.id === taskId ? data : t)),
                }
              : c
          )
        );
      })
      .catch((err) => {
        console.error("Error updating task:", err);
        setError("Failed to update task.");
      });
  };

  const deleteTask = (taskId: number, categoryId: number) => {
    axios
      .delete(`${API_URL}/tasks/${taskId}`)
      .then(() => {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId
              ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
              : c
          )
        );
      })
      .catch((err) => {
        console.error("Error deleting task:", err);
        setError("Failed to delete task.");
      });
  };

  return (
    <div>
      <h1>Task Manager</h1>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Show errors */}
      <input
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="Add name of your category"
      />
      <button onClick={addCategory}>Add Category</button>
      {categories.map((category) => (
        <div key={category.id} className="category-box">
          <h2>{category.name}</h2>
          <button onClick={() => deleteCategory(category.id)}>
            Delete this category
          </button>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Edit</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody>
              {category.tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) =>
                        editTask(task.id, e.target.value, category.id)
                      }
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        editTask(task.id, task.description, category.id)
                      }
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button onClick={() => deleteTask(task.id, category.id)}>
                      Done
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <input
            type="text"
            value={taskInputs[category.id] || ""}
            onChange={(e) =>
              setTaskInputs((prev) => ({
                ...prev,
                [category.id]: e.target.value,
              }))
            }
            placeholder="Add new task"
          />
          <button onClick={() => addTask(category.id)}>Add Task</button>
        </div>
      ))}
    </div>
  );
}

export default App;
