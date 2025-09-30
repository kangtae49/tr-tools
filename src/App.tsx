import "./App.css";
import {MosaicView} from "./components/mosaic/MosaicView.tsx";
import {Toaster} from "react-hot-toast";
import {DndContext} from "@dnd-kit/core";

function App() {

  return (
    <DndContext>
      <main className="container">
        <MosaicView />
        <Toaster position="top-center" reverseOrder={false} />
      </main>
    </DndContext>
  );
}

export default App;
