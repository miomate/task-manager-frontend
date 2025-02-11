import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

const API_URL = "http://localhost:5005/api/categories";

function App() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [taskInputs, setTaskInputs] = useState({});

  // Fetch categories and tasks
  useEffect(() => {
    axios.get(API_URL).then((response) => setCategories(response.data));
  }, []);

  // Add a new category
  const addCategory = () => {
    if (!newCategory) return;
    axios.post(API_URL, { name: newCategory }).then(({ data }) => {
      setCategories([...categories, { ...data, tasks: [] }]);
      setNewCategory("");
    });
  };

  // Delete a category
  const deleteCategory = (id) => {
    axios.delete(`${API_URL}/${id}`).then(() => {
      setCategories(categories.filter((c) => c.id !== id));
    });
  };

  // Add a task
  const addTask = (categoryId) => {
    if (!taskInputs[categoryId]) return;
    axios.post(`${API_URL}/${categoryId}/tasks`, { description: taskInputs[categoryId] }).then(({ data }) => {
      setCategories(
        categories.map((c) => (c.id === categoryId ? { ...c, tasks: [...c.tasks, data] } : c))
      );
      setTaskInputs({ ...taskInputs, [categoryId]: "" });
    });
  };

  // Edit a task
  const editTask = (taskId, newDescription, categoryId) => {
    axios.put(`${API_URL}/tasks/${taskId}`, { description: newDescription }).then(({ data }) => {
      setCategories(
        categories.map((c) =>
          c.id === categoryId
            ? { ...c, tasks: c.tasks.map((t) => (t.id === taskId ? data : t)) }
            : c
        )
      );
    });
  };

  // Delete a task
  const deleteTask = (taskId, categoryId) => {
    axios.delete(`${API_URL}/tasks/${taskId}`).then(() => {
      setCategories(
        categories.map((c) =>
          c.id === categoryId ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c
        )
      );
    });
  };

  return (
    <div className="container">
      <h1>Task Manager</h1>
      <p>Add a category for tasks and then add a task.</p>
      <input
        type="text"
        placeholder="Add name of your category"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      />
      <button onClick={addCategory}>Add Category</button>
      {categories.map((category) => (
        <div key={category.id} className="category-box">
          <h2>{category.name}</h2>
          <button onClick={() => deleteCategory(category.id)}>Delete this category</button>
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
                      onChange={(e) => editTask(task.id, e.target.value, category.id)}
                    />
                  </td>
                  <td>
                    <button onClick={() => editTask(task.id, task.description, category.id)}>Edit</button>
                  </td>
                  <td>
                    <button onClick={() => deleteTask(task.id, category.id)}>Done</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <input
            type="text"
            placeholder="Add task"
            value={taskInputs[category.id] || ""}
            onChange={(e) => setTaskInputs({ ...taskInputs, [category.id]: e.target.value })}
          />
          <button onClick={() => addTask(category.id)}>Add Task</button>
        </div>
      ))}
    </div>
  );

}

export default App;
