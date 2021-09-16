import "./style.css";


export default function App() {
    return (
        <div className="App">
        <div className="name">
          <h1>Felix Holm</h1>
        </div>
        <img src={require("/src/profile.jpg")} alt="photograph"></img>
        <div className="description">
          <h2>
            Hello and welcome to my website checkout the links down below for more
            information.
          </h2>
        </div>
        <div className="button">LinkedIn</div>
        <div className="button">Facebook</div>
        <div className="button">Resume</div>
        <div className="button">Portfolio</div>
        </div>
    );
}