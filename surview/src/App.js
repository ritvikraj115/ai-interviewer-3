import React from 'react';
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateInterview from './pages/CreateInterview';
import InterviewLinkPage from './pages/InterviewLinkPage.js';
import YourProjects from './pages/YourProjects.js';
import EditQuestions from './pages/EditQuestions.js';
import ShowLink from './pages/ShowLink.js';
import CallHistory from './pages/CallHistory';
import CallDetails from './pages/CallDetails.js';
import GetInsights from './pages/CallInsights.js';
// import GiveInterview from './pages/GiveInterview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/create-interview" element={<CreateInterview />}></Route>
        <Route path="/interview-link" element={<InterviewLinkPage />}></Route>
        <Route path="/your-projects" element={<YourProjects />}></Route>
        <Route path="/edit-questions/:projectId" element={<EditQuestions />}></Route>
        <Route path="/call-history" element={<CallHistory />}></Route>
        <Route path="/call-details/:callId" element={<CallDetails />}></Route>
        <Route path="/call-insights" element={<GetInsights />}></Route>

        <Route path="/show-link" element={<ShowLink />}></Route>
        {/* <Route path="/give-interview" element={GiveInterview} /> */}
      </Routes>
    </Router>
  );
}

export default App;

