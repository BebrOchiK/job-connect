import { useEffect, useState } from "react";

interface Job {
  id: number;
  title: string;
  company: string;
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("Завантаження...");

  async function loadJobs() {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
      setStatus("Підключено до backend через DNS");
    } catch {
      setStatus("Помилка з'єднання з backend");
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, company }),
    });

    setTitle("");
    setCompany("");
    await loadJobs();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJobs();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>JOB CONNECT</h1>
      <p>Статус: {status}</p>

      <form onSubmit={handleAddJob} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          placeholder="Назва вакансії"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Компанія"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <button type="submit">Додати</button>
      </form>

      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <strong>{job.title}</strong> — {job.company}
          </li>
        ))}
      </ul>
    </div>
  );
}