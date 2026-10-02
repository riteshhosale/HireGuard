import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Protected from "./Protected";

const Home = lazy(() => import("../pages/Home"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const Scan = lazy(() => import("../pages/Scan"));
const Report = lazy(() => import("../pages/Report"));
const History = lazy(() => import("../pages/History"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Terms = lazy(() => import("../pages/Terms"));
const Community = lazy(() => import("../pages/community/Community"));
const CreatePost = lazy(() => import("../pages/community/CreatePost"));
const PostDetails = lazy(() => import("../pages/community/PostDetails"));

function RouteFallback() {
  return <div className="grid min-h-[60vh] place-items-center text-sm font-bold text-slate-400">Loading JobGuard AI…</div>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/scan" element={<Protected><Scan /></Protected>} />
        <Route path="/report/:scanId" element={<Protected><Report /></Protected>} />
        <Route path="/history" element={<Protected><History /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/community" element={<Protected><Community /></Protected>} />
        <Route path="/community/create" element={<Protected><CreatePost /></Protected>} />
        <Route path="/community/post/:postId" element={<Protected><PostDetails /></Protected>} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
