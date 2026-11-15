import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { DataProvider } from './state/data'
import Layout from './components/Layout'
import Home from './pages/Home'
import Planner from './pages/Planner'
import Majors from './pages/Majors'
import Chances from './pages/Chances'
import Progress from './pages/Progress'
import Search from './pages/Search'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="planner" element={<Planner />} />
            <Route path="majors" element={<Majors />} />
            <Route path="chances" element={<Chances />} />
            <Route path="progress" element={<Progress />} />
            <Route path="search" element={<Search />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  </StrictMode>,
)
