import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import our new styles

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then(({ data }) => setCategories(data))
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again.");
      });
  }, []);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/categories`, { name: newCategory })
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
      .delete(`${import.meta.env.VITE_API_URL}/api/categories/${id}`)
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
      .post(`${import.meta.env.VITE_API_URL}/api/categories/${categoryId}/tasks`, {
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

  const editTask = (taskId: number, newDescription: string, categoryId: number) => {
    axios
      .put(`${import.meta.env.VITE_API_URL}/api/categories/tasks/${taskId}`, {
        description: newDescription,
      })
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
      .delete(`${import.meta.env.VITE_API_URL}/api/categories/tasks/${taskId}`)
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
    <div className="container">
      <h1>Task Manager</h1>
      {error && <p className="error">{error}</p>}
      <div className="input-group">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Add name of your category"
        />
        <button onClick={addCategory}>Add Category</button>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="category-box">
          <div className="category-header">
            <h2>{category.name}</h2>
            <button onClick={() => deleteCategory(category.id)}>Delete this category</button>
          </div>

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
                    <button onClick={() => editTask(task.id, task.description, category.id)}>
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

          <div className="input-group">
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
        </div>
      ))}
    </div>
  );
}

export default App;
