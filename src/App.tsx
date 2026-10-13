import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Campaigns } from './pages/Campaigns'
import { CampaignDetail } from './pages/CampaignDetail'
import { StatusLookup } from './pages/StatusLookup'
import { Admin } from './pages/Admin'
import { Story } from './pages/Story'

export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="campaigns" element={<Campaigns />} />
    <Route path="campaigns/:slug" element={<CampaignDetail />} />
    <Route path="status" element={<StatusLookup />} />
    <Route path="story" element={<Story />} />
    <Route path="admin/*" element={<Admin />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes>
}
