import Navbar from "./components/Navbar";
import ChartPage from "./pages/Chart";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import LiveData from "./pages/LiveData";
function App() {
return(
  <>
  <Router>
  <Navbar/>
<div className="pt-16 z-0">
   <Routes>
      <Route element={ <LiveData/> } path="/" />
      <Route element={ <ChartPage/> } path="/chart" />
    </Routes>
</div>
   
  </Router>
   
  </> 
)
}

export default App;