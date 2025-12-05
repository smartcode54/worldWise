import AppNav from '../components/AppNav';
import { Outlet } from 'react-router-dom';
import PageNav from '../components/PageNav';
function AppLayout() {
  return (
    <div>
      <AppNav />
      <p>App</p>
    </div>
  )
}
export default AppLayout;
