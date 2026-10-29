"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type CourseStatus = "ACTIVE" | "INACTIVE";

type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: CourseStatus;
};

type Pagination = {
  currentPage: number;
  pageSize: number;
  totalCourses: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 6;

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState<CourseStatus>("ACTIVE");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalCourses: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json",
  });

  const loadCourses = useCallback(async (pageToLoad = currentPage) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/courses?page=${pageToLoad}&limit=${PAGE_SIZE}`,
        {
          headers: authHeaders(),
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not fetch courses");
      }

      const result: Course[] = data.courses ?? [];
      const pageInfo: Pagination = data.pagination ?? {
        currentPage: pageToLoad,
        pageSize: PAGE_SIZE,
        totalCourses: result.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      // If the last course on this page was deleted, go back a page.
      if (pageToLoad > Math.max(1, pageInfo.totalPages)) {
        setCurrentPage(Math.max(1, pageInfo.totalPages));
        return;
      }

      setCourses(result);
      setPagination(pageInfo);
      setCurrentPage(pageToLoad);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!localStorage.getItem("token") || !user) {
      window.location.replace("/");
      return;
    }

    try {
      if (JSON.parse(user).role !== "ADMIN") {
        window.location.replace("/student");
        return;
      }
    } catch {
      window.location.replace("/");
      return;
    }

    void loadCourses();
  }, [loadCourses]);

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/courses`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title, description, duration, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Course creation failed");
      }

      setTitle("");
      setDescription("");
      setDuration("");
      setStatus("ACTIVE");
      setMessage(data.message || "Course created successfully");

      setCurrentPage(1);
      await loadCourses(1);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateCourseStatus(id: string, newStatus: CourseStatus) {
    const previousCourses = courses;
    setMessage("");
    setUpdatingId(id);

    setCourses((current) =>
      current.map((course) =>
        course.id === id ? { ...course, status: newStatus } : course,
      ),
    );

    try {
      const response = await fetch(`${API}/courses/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      setMessage(data.message || "Course status updated successfully");
      await loadCourses(currentPage);
    } catch (error) {
      setCourses(previousCourses);
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteCourse(id: string) {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API}/courses/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Course deletion failed");
      }

      setMessage(data.message || "Course deleted successfully");
      await loadCourses(currentPage);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/");
  }

  return (
    <main className="min-h-screen bg-[#dfe6e9] px-4 py-6 text-[#2d3436] sm:px-8">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-[#636e72]">Manage your courses</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="rounded-[14px] px-5 py-3 font-semibold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff]"
        >
          Logout
        </button>
      </header>

      <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="h-fit rounded-[20px] p-6 shadow-[8px_8px_16px_#b8c1c5,-8px_-8px_16px_#ffffff] sm:p-8">
          <h2 className="mb-6 text-xl font-bold">Add New Course</h2>

          <form onSubmit={createCourse} className="space-y-5">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-semibold">
                Course Title
              </label>
              <input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React Fundamentals"
                className="w-full rounded-[14px] bg-[#dfe6e9] px-4 py-3 text-[#2d3436] placeholder:text-[#636e72] shadow-[inset_4px_4px_8px_#b8c1c5,inset_-4px_-4px_8px_#ffffff] outline-none focus:ring-2 focus:ring-[#0984e3]"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-semibold">
                Description
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this course"
                className="w-full resize-y rounded-[14px] bg-[#dfe6e9] px-4 py-3 text-[#2d3436] placeholder:text-[#636e72] shadow-[inset_4px_4px_8px_#b8c1c5,inset_-4px_-4px_8px_#ffffff] outline-none focus:ring-2 focus:ring-[#0984e3]"
              />
            </div>

            <div>
              <label htmlFor="duration" className="mb-2 block text-sm font-semibold">
                Duration
              </label>
              <input
                id="duration"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 weeks"
                className="w-full rounded-[14px] bg-[#dfe6e9] px-4 py-3 text-[#2d3436] placeholder:text-[#636e72] shadow-[inset_4px_4px_8px_#b8c1c5,inset_-4px_-4px_8px_#ffffff] outline-none focus:ring-2 focus:ring-[#0984e3]"
              />
            </div>

            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-semibold">
                Course Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                className="w-full rounded-[14px] bg-[#dfe6e9] px-4 py-3 text-[#2d3436] shadow-[inset_4px_4px_8px_#b8c1c5,inset_-4px_-4px_8px_#ffffff] outline-none focus:ring-2 focus:ring-[#0984e3]"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-[14px] px-5 py-3 font-bold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff] disabled:opacity-60"
            >
              {saving ? "Creating..." : "Add Course"}
            </button>
          </form>

          {message && (
            <p role="status" className="mt-5 break-words text-sm font-semibold text-[#2d3436]">
              {message}
            </p>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">All Courses</h2>
            <span className="rounded-xl px-3 py-2 text-sm font-semibold shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff]">
              {pagination.totalCourses} courses
            </span>
          </div>

          {loading ? (
            <p className="p-6 text-[#636e72]">Loading courses...</p>
          ) : courses.length === 0 ? (
            <div className="rounded-[20px] p-8 text-center text-[#636e72] shadow-[8px_8px_16px_#b8c1c5,-8px_-8px_16px_#ffffff]">
              No courses yet. Add your first course.
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {courses.map((course) => (
                  <article
                    key={course.id}
                    className="rounded-[20px] p-5 shadow-[8px_8px_16px_#b8c1c5,-8px_-8px_16px_#ffffff]"
                  >
                    <label
                      htmlFor={`status-${course.id}`}
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#0984e3]"
                    >
                      Course Status
                    </label>

                    <select
                      id={`status-${course.id}`}
                      aria-label={`Status for ${course.title}`}
                      value={course.status}
                      disabled={updatingId === course.id}
                      onChange={(e) =>
                        void updateCourseStatus(
                          course.id,
                          e.target.value as CourseStatus,
                        )
                      }
                      className="w-full rounded-[14px] bg-[#dfe6e9] px-3 py-2 text-sm text-[#2d3436] shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff] outline-none focus:ring-2 focus:ring-[#0984e3] disabled:opacity-60"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>

                    {updatingId === course.id && (
                      <p className="mt-2 text-xs text-[#636e72]">Updating status...</p>
                    )}

                    <h3 className="mt-3 text-lg font-bold">{course.title}</h3>
                    <p className="mt-2 break-words text-sm text-[#636e72]">
                      {course.description}
                    </p>
                    <p className="mt-3 text-sm font-semibold">
                      Duration: {course.duration}
                    </p>

                    <button
                      type="button"
                      onClick={() => void deleteCourse(course.id)}
                      className="mt-5 w-full rounded-[14px] px-4 py-3 text-sm font-bold text-[#c0392b] shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff]"
                    >
                      Delete Course
                    </button>
                  </article>
                ))}
              </div>

              {pagination.totalCourses > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    disabled={!pagination.hasPreviousPage || loading}
                    onClick={() => void loadCourses(currentPage - 1)}
                    className="rounded-[14px] px-5 py-3 font-semibold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-semibold">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => void loadCourses(currentPage + 1)}
                    className="rounded-[14px] px-5 py-3 font-semibold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}