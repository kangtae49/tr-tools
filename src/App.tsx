import "./App.css";
import {MosaicView} from "./components/mosaic/MosaicView.tsx";
import {Toaster} from "react-hot-toast";

function App() {

  return (
    <main className="container">
      <MosaicView />
      <Toaster position="top-center" reverseOrder={false} />
    </main>
  );
}

export default App;
