import "./App.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer"
import Signup from "./components/Signup";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateComponent from "./components/PrivateComponent";
import Login from "./components/Login";
import Addproduct from "./components/Addproduct";
import ProductList from "./components/ProductList";
import UpdateProduct from "./components/UpdateProduct";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Nav />
        <Routes>

          <Route element={<PrivateComponent/>}>

          <Route path="/" element={<ProductList/>}></Route>
          <Route path="/add" element={<h1><Addproduct/></h1>}></Route>
          <Route path="/update/:id" element={<h1><UpdateProduct/></h1>}></Route>
          <Route path="/profile" element={<h1>Profile Components</h1>}></Route>
          <Route path="/logout" element={<h1>log out Components</h1>}></Route>
          </Route>

          <Route path="/signup" element={<Signup/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
        </Routes>
      </BrowserRouter>
      <Footer/>
  
    </div>
  );
}

export default App;
