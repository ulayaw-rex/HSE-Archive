import "./App.css";
import Header from "./components/shared/Navbar/Header";
import Navbar from "./components/shared/Navbar/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import Footer from "./components/shared/Footer/Footer";

function App() {
  return (
    <>
      <Header />
      <Navbar />
      <HomePage />
      <Footer />
    </>
  );
}

export default App;
