"use client";

import { useCallback, useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: string;
};

type Enrollment = {
  courseId?: string;
  course?: {
    id: string;
  };
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

export default function StudentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalCourses: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const loadCourses = useCallback(async (pageToLoad = currentPage) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token") || "";

      const [coursesResponse, enrolledResponse] = await Promise.all([
        fetch(`${API}/courses?page=${pageToLoad}&limit=${PAGE_SIZE}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
        fetch(`${API}/enrollments/my`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ]);

      const coursesData = await coursesResponse.json();
      const enrolledData = await enrolledResponse.json();

      if (!coursesResponse.ok) {
        throw new Error(coursesData.message || "Could not load courses");
      }

      if (!enrolledResponse.ok) {
        throw new Error(
          enrolledData.message || "Could not load your enrollments",
        );
      }

      const enrollmentRecords: Enrollment[] = enrolledData.courses ?? [];
      const pageInfo: Pagination = coursesData.pagination ?? {
        currentPage: pageToLoad,
        pageSize: PAGE_SIZE,
        totalCourses: coursesData.courses?.length ?? 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      if (pageToLoad > Math.max(1, pageInfo.totalPages)) {
        setCurrentPage(Math.max(1, pageInfo.totalPages));
        return;
      }

      setCourses(coursesData.courses ?? []);
      setPagination(pageInfo);
      setCurrentPage(pageToLoad);

      setEnrolledCourseIds(
        enrollmentRecords
          .map((enrollment) => enrollment.courseId ?? enrollment.course?.id)
          .filter((id): id is string => Boolean(id)),
      );

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
      if (JSON.parse(user).role !== "STUDENT") {
        window.location.replace("/admin");
        return;
      }
    } catch {
      window.location.replace("/");
      return;
    }

    void loadCourses();
  }, [loadCourses]);

  async function enroll(courseId: string) {
    if (enrolledCourseIds.includes(courseId) || enrollingId !== "") {
      return;
    }

    setEnrollingId(courseId);
    setMessage("");

    try {
      const response = await fetch(`${API}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Enrollment failed",
        );
      }

      setEnrolledCourseIds((previous) =>
        previous.includes(courseId) ? previous : [...previous, courseId],
      );

      setMessage(data.message || "Course enrolled successfully");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setEnrollingId("");
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
          <h1 className="text-2xl font-bold sm:text-3xl">
            Student Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#636e72]">
            Explore and enroll in courses
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => (window.location.href = "/my-courses")}
            className="rounded-[14px] px-5 py-3 font-semibold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0984e3]"
          >
            My Courses
          </button>

          <button
            type="button"
            onClick={logout}
            className="rounded-[14px] px-5 py-3 font-semibold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0984e3]"
          >
            Logout
          </button>
        </div>
      </header>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="mx-auto mt-6 max-w-6xl break-words rounded-[14px] p-4 text-sm font-semibold shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff]"
        >
          {message}
        </p>
      )}

      <section className="mx-auto mt-8 max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Available Courses</h2>
          {!loading && (
            <span className="rounded-xl px-3 py-2 text-sm font-semibold shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff]">
              {pagination.totalCourses} courses
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-[#636e72]" role="status">
            Loading courses and enrollment status...
          </p>
        ) : courses.length === 0 ? (
          <div className="rounded-[20px] p-8 text-center text-[#636e72] shadow-[8px_8px_16px_#b8c1c5,-8px_-8px_16px_#ffffff]">
            No active courses available right now.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id);

                return (
                  <article
                    key={course.id}
                    className="flex flex-col rounded-[20px] p-6 shadow-[8px_8px_16px_#b8c1c5,-8px_-8px_16px_#ffffff]"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0984e3]">
                      {isEnrolled ? "Your Course" : "Available Course"}
                    </span>

                    <h3 className="mt-3 text-xl font-bold">{course.title}</h3>

                    <p className="mt-3 flex-1 break-words text-sm leading-6 text-[#636e72]">
                      {course.description}
                    </p>

                    <p className="mt-4 text-sm font-semibold">
                      Duration: {course.duration}
                    </p>

                    <button
                      type="button"
                      onClick={() => void enroll(course.id)}
                      disabled={isEnrolled || enrollingId !== ""}
                      className="mt-6 w-full rounded-[14px] px-5 py-3 font-bold shadow-[5px_5px_10px_#b8c1c5,-5px_-5px_10px_#ffffff] transition hover:shadow-[inset_3px_3px_6px_#b8c1c5,inset_-3px_-3px_6px_#ffffff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0984e3] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {enrollingId === course.id
                        ? "Enrolling..."
                        : isEnrolled
                          ? "Already Enrolled"
                          : enrollingId !== ""
                            ? "Please wait..."
                            : "Enroll Now"}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
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
          </>
        )}
      </section>
    </main>
  );
}