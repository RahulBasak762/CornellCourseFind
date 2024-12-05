import api from "../api"
import { useNavigate } from "react-router-dom"
import "../styles/TaskBar.css"

function TaskBar(){
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
          const accessToken = localStorage.getItem('ACCESS_TOKEN');
          const refreshToken = localStorage.getItem('REFRESH_TOKEN');
          await api.post('/api/logout/', { access_token: accessToken, refresh_token: refreshToken });
          localStorage.removeItem('ACCESS_TOKEN');
          localStorage.removeItem('REFRESH_TOKEN');
          navigate("/login")
        } catch (error) {
          console.error('Error logging out:', error);
        }
      };

      const handleHomePage = async() => {
        navigate("/")
      }

      return <div className="Task-Bar">

      <li>&nbsp;&nbsp;&nbsp;<button className="Logo-Button" onClick={handleHomePage}>
        <img 
            className="home-button-image" 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Cornell_University_seal.svg/1200px-Cornell_University_seal.svg.png" 
            alt="buttonpng" 
            border="0" 
        />  
        
        </button></li>

      <li className="title" onClick={handleHomePage}><h2>CourseFind</h2></li>

      <li><button className="Logout-Button" onClick={handleLogout} >Logout</button>&nbsp;&nbsp;&nbsp;</li>
      
    </div>
}

export default TaskBar