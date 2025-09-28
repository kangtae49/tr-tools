
import "./App.css";

function App() {

  return (
    <main className="container">
      <iframe src={`http://local.localhost/file/${encodeURIComponent("C:/Users/kkt/Downloads/mp3/playlist.json")}`}>

      </iframe>

      <audio controls>
        <source src={`http://local.localhost/file/${encodeURIComponent("C:/Users/kkt/Downloads/mp3/그댄 행복에 살텐데_리즈.mp3")}`} />
      </audio>
      <div>
        <a href="https://google.com" >google</a>
      </div>
    </main>
  );
}

export default App;
