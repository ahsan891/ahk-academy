import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ChapterPage from './pages/ChapterPage';
import TopicPage from './pages/TopicPage';
import ExamListPage from './pages/ExamListPage';
import ExamTakePage from './pages/ExamTakePage';
import ExamReviewPage from './pages/ExamReviewPage';
import { useStore } from './store/useStore';

function App() {
  const { progress, completeLesson, completeExercise, masterTopic } = useStore();

  return (
    <BrowserRouter>
      <Layout progress={progress}>
        <Routes>
          <Route path="/" element={<Dashboard progress={progress} />} />
          <Route path="/chapter/:chapterId" element={<ChapterPage progress={progress} />} />
          <Route
            path="/topic/:topicId"
            element={
              <TopicPage
                progress={progress}
                completeLesson={completeLesson}
                completeExercise={completeExercise}
                masterTopic={masterTopic}
              />
            }
          />
          <Route path="/exams" element={<ExamListPage />} />
          <Route path="/exam/:paperId" element={<ExamTakePage />} />
          <Route path="/exam/:paperId/review" element={<ExamReviewPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
