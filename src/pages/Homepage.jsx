import PageNav from '../components/PageNav';
import { Link } from 'react-router-dom';
import AppNav from '../components/AppNav';
function Homepage() {
  return (
    <div>
     <PageNav />
     <AppNav/>
      <h1>World Wise</h1>
      <p>Welcome to WorldWise</p>

      <Link to="/app">Go to The App</Link>
     </div>
  )
}
export default Homepage;