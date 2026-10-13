import {lazy} from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Campaigns } from './pages/Campaigns'
import { CampaignDetail } from './pages/CampaignDetail'
import { StatusLookup } from './pages/StatusLookup'
import { Admin } from './pages/Admin'
import { Story } from './pages/Story'
const ZombieGame = lazy(() => import('./pages/ZombieGame').then(module => ({default:module.ZombieGame})))
const CryptoHub = lazy(() => import('./pages/CryptoHub').then(module => ({default:module.CryptoHub})))
const Chill = lazy(() => import('./pages/Chill').then(module => ({default:module.Chill})))

export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="campaigns" element={<Campaigns />} />
    <Route path="campaigns/:slug" element={<CampaignDetail />} />
    <Route path="status" element={<StatusLookup />} />
    <Route path="story" element={<Story />} />
    <Route path="game" element={<ZombieGame />} />
    <Route path="crypto" element={<CryptoHub />} />
    <Route path="chill" element={<Chill />} />
    <Route path="admin/*" element={<Admin />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes>
}
