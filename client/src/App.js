import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, notification } from 'antd';
import { useSelector } from 'react-redux';

import TaskBoard from './components/TaskBoard';
import CalendarView from './components/CalendarView';
import NotesEditor from './components/NotesEditor';
import ExamMode from './components/ExamMode';
import WordCards from './components/WordCards';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

const { Header, Content, Footer } = Layout;

function App() {
  const { isAuthenticated, error } = useSelector(state => state.auth);

  React.useEffect(() => {
    if (error) {
      notification.error({
        message: '错误',
        description: error
      });
    }
  }, [error]);

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {isAuthenticated && (
          <Header>
            <Navbar />
          </Header>
        )}
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 128px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {isAuthenticated && (
                <>
                  <Route path="/" element={<TaskBoard />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/notes" element={<NotesEditor />} />
                  <Route path="/exam" element={<ExamMode />} />
                  <Route path="/words" element={<WordCards />} />
                </>
              )}
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          个人综合管理助手系统 ©2025
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
    