import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Campaigns } from './pages/Campaigns'
import { CampaignDetail } from './pages/CampaignDetail'
import { StatusLookup } from './pages/StatusLookup'
import { Admin } from './pages/Admin'
import { Story } from './pages/Story'
import { Playground } from './pages/Playground'

export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="campaigns" element={<Campaigns />} />
    <Route path="campaigns/:slug" element={<CampaignDetail />} />
    <Route path="status" element={<StatusLookup />} />
    <Route path="story" element={<Story />} />
    <Route path="play/gm-radio" element={<Playground slug="gm-radio" />} />
    <Route path="play/gas-cloud" element={<Playground slug="gas-cloud" />} />
    <Route path="play/hodl-potato" element={<Playground slug="hodl-potato" />} />
    <Route path="admin/*" element={<Admin />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes>
}
