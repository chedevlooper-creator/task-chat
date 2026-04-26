import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useStore } from "./store/useStore";
import { mockUser, mockCourses } from "./mock/data";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CourseHub from "./pages/CourseHub";
import LearningModule from "./pages/LearningModule";
import Community from "./pages/Community";

export default function App() {
  const { setUser, setCourses } = useStore();

  useEffect(() => {
    // Initialize mock data
    setUser(mockUser);
    setCourses(mockCourses);
  }, [setUser, setCourses]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<CourseHub />} />
          <Route path="learn/:courseId" element={<LearningModule />} />
          <Route path="community" element={<Community />} />
        </Route>
      </Routes>
    </Router>
  );
}
