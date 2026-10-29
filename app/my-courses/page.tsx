"use client";

import { useCallback, useEffect, useState } from "react";

type Enrollment = {
  id: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    description: string;
    duration: string;
    status: string;
  };
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadMyCourses = useCallback(async () => {
    try {
      const response = await fetch(`${API}/enrollments/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not fetch your courses");
      }

      setCourses(data.courses ?? []);
      setMessage(data.message || "My courses fetched successfully");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!localStorage.getItem("token") || !user) {
      window.location.replace("/");
      return;
    }

    try {
      if (JSON.parse(user).role !== "STUDENT") {
        window.location.replace("/admin");
        return;
      }
    } catch {
      window.location.replace("/");
      return;
    }

    void loadMyCourses();
  }, [loadMyCourses]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/");
  }

  return (
    <main className="min-h-screen bg-[#dfe6e9] px-4 py-6 text-[#2d3436] sm:px-8">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My Courses</h1>
          <p className="mt-1 text-sm text-[#636e72]">Your enrolled learning programs</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.location.href = "/student"} className="rounded-[14px] px-4 py-3 font-semibold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff]">
            Browse Courses
          </button>
          <button onClick={logout} className="rounded-[14px] px-4 py-3 font-semibold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff]">
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto mt-8 max-w-6xl">
        <p role="status" className="mb-6 break-words text-sm text-[#636e72]">{message}</p>

        {loading ? (
          <p className="text-[#636e72]">Loading your courses...</p>
        ) : courses.length === 0 ? (
          <div className="rounded-[20px] p-10 text-center shadow-[8px_8px_16px_#b8c1c5,-8px_-8px_16px_#ffffff]">
            <h2 className="text-xl font-bold">No enrolled courses yet</h2>
            <p className="mt-2 text-sm text-[#636e72]">Browse available courses and enroll to start learning.</p>
            <button onClick={() => window.location.href = "/student"} className="mt-6 rounded-[14px] px-5 py-3 font-bold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff]">
              Explore Courses
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((item) => (
              <article key={item.id} className="rounded-[20px] p-6 shadow-[8px_8px_16px_#b8c1c5,-8px_-8px_16px_#ffffff]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0984e3]">Enrolled</span>
                <h2 className="mt-3 text-xl font-bold">{item.course.title}</h2>
                <p className="mt-3 break-words text-sm leading-6 text-[#636e72]">{item.course.description}</p>
                <p className="mt-4 text-sm font-semibold">Duration: {item.course.duration}</p>
                <p className="mt-3 text-xs text-[#636e72]">
                  Enrolled on: {new Date(item.enrolledAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
